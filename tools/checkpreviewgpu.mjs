/** Headed preview-only GPU evidence. Own server/cache; no game loop or audio.
 * node tools/checkpreviewgpu.mjs [--port 5195] [--out shots/tool-preview]
 * Requires an externally granted tool-preview lease; never self-assigns it.
 * Pixel occupancy is a GPU-rendered white silhouette, not a shading/FPS grade.
 */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (key, fallback) => {
  const i = process.argv.indexOf('--' + key);
  return i < 0 ? fallback : process.argv[i + 1];
};
const port = Number(arg('port', 5195));
const out = resolve(root, arg('out', 'shots/tool-preview'));
const lease = resolve(root, '../drillity-coordination/gpu-owner.txt');
assert.equal(readFileSync(lease, 'utf8').trim(), 'tool-preview', 'Wait for external GPU lease');
mkdirSync(out, { recursive: true });
const server = await createServer({root, configFile:false, cacheDir:resolve(root, '.preview-vite-cache'),
  optimizeDeps:{noDiscovery:true, include:[]},
  server:{host:'127.0.0.1', port, strictPort:true, preTransformRequests:false}});
let browser;
const sourcePaths = ['src/core/preview.js', 'src/core/assets.js', 'src/core/contract.js',
  'src/core/gltfRig.js', 'src/rig/rigFactory.js', 'src/rig/tools.js', 'src/game/data.js',
  'tools/checkpreviewgpu.mjs'];
const modelPaths = readdirSync(resolve(root, 'public/models')).filter(name => name.endsWith('.glb') && name !== 'teststub.glb')
  .sort().map(name => 'public/models/' + name);
const hashes = paths => Object.fromEntries(paths.map(path => {
  const data = readFileSync(resolve(root, path));
  return [path, {bytes:data.length, sha256:createHash('sha256').update(data).digest('hex')}];
}));
const report = {startedAt:new Date().toISOString(), status:'incomplete',
  provenance:{root, scope:'Private synchronized snapshot only; newer parent runtime and models are not validated by this capture.',
    sources:hashes(sourcePaths), models:hashes(modelPaths), baseline:'Previous sphere ×1.9 framing at the same pose, applied to these same private models/materials.'},
  methodology:'Headed Chrome, real preview/material/GLB pipeline. Opaque double-sided GPU silhouette occupancy at 256x256; same pose old sphere baseline. PNGs show shading. No FPS or performance grade.', errors:[], warnings:[], rows:[]};
try {
  await server.listen();
  assert.equal(readFileSync(lease, 'utf8').trim(), 'tool-preview', 'Lease changed before browser launch');
  browser = await chromium.launch({channel:'chrome', headless:false,
    args:['--mute-audio', '--enable-gpu-rasterization', '--ignore-gpu-blocklist']});
  const page = await browser.newPage({viewport:{width:1200,height:900}, deviceScaleFactor:1});
  page.on('pageerror', e => report.errors.push(e.message));
  page.on('console', m => {if (m.type() === 'error') report.errors.push(m.text()); if (m.type() === 'warning') report.warnings.push(m.text());});
  await page.route('**/preview-evidence', route => route.fulfill({contentType:'text/html; charset=utf-8', body:'<!doctype html><html><head><meta charset="utf-8"><title>Tool preview evidence</title><link rel="icon" href="data:,"></head><body></body></html>'}));
  await page.goto(`http://127.0.0.1:${port}/preview-evidence`);
  const transformedPreview = await server.transformRequest('/src/core/preview.js');
  const threeUrl = /import \* as THREE from ["']([^"']+)["']/.exec(transformedPreview.code)?.[1];
  assert(threeUrl, 'Use the same Vite-resolved Three module as the real preview');
  await page.evaluate(async threeUrl => {
    const THREE = await import(threeUrl);
    const {createPreview} = await import('/src/core/preview.js');
    const {createAssets} = await import('/src/core/assets.js');
    const {createGltfRigs} = await import('/src/core/gltfRig.js');
    const {createRigSystem} = await import('/src/rig/rigFactory.js');
    const data = await import('/src/game/data.js');
    const records = [];
    const maskMaterial = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.DoubleSide});
    class EvidenceRenderer extends THREE.WebGLRenderer {
      constructor(...args) {
        super(...args);
        // Three r169 installs render on the instance, shadowing prototype
        // overrides. Wrap that real renderer after construction.
        const nativeRender = this.render.bind(this);
        this.render = (scene, camera) => this.captureRender(scene, camera, nativeRender);
      }
      captureRender(scene, camera, nativeRender) {
        if (!window.__capturePreview) return nativeRender(scene, camera);
        const subjects = scene.children.filter(o => o.isGroup && o.visible && o.children.length);
        if (subjects.length !== 1) throw new Error('Expected one visible preview subject');
        const group = subjects[0].children[0];
        const backdrop = scene.children.find(o => o.isMesh);
        const capture = cam => {
          nativeRender(scene, cam);
          const image = this.domElement.toDataURL('image/png');
          const background = scene.background, override = scene.overrideMaterial, visible = backdrop.visible;
          try {
          backdrop.visible = false; scene.background = new THREE.Color(0); scene.overrideMaterial = maskMaterial;
          nativeRender(scene, cam);
          const gl = this.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
          const pixels = new Uint8Array(w * h * 4);
          gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          let filled = 0, edge = 0;
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            if (pixels[4 * (y * w + x)] <= 127) continue;
            filled++;
            if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge++;
          }
          return {image, occupancy:filled / (w * h), edgePixels:edge, contextLost:gl.isContextLost()};
          } finally {
            scene.background = background; scene.overrideMaterial = override; backdrop.visible = visible;
          }
        };
        const candidate = capture(camera);
        const position = group.position.clone(), scale = backdrop.scale.clone();
        let baseline;
        try {
        group.position.set(0, 0, 0); group.updateWorldMatrix(true, true);
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3()); group.parent.worldToLocal(center);
        group.position.copy(center).negate(); group.updateWorldMatrix(true, true);
        const radius = box.getSize(new THREE.Vector3()).length() * .5 || 1;
        const dist = radius / Math.tan(camera.fov * Math.PI / 360) * 1.9;
        const old = camera.clone(); old.position.normalize().multiplyScalar(dist); old.lookAt(0, 0, 0);
        old.near = Math.max(.01, dist * .05); old.far = Math.max(dist * 6, 40); old.updateProjectionMatrix();
        backdrop.scale.setScalar(Math.max(1, dist / 6));
        baseline = capture(old);
        } finally {
          group.position.copy(position); backdrop.scale.copy(scale); group.updateWorldMatrix(true, true);
        }
        nativeRender(scene, camera);
        records.push({id:window.__capturePreview, source:group.userData.spec?.source || 'tool', candidate, baseline});
      }
    }
    const ctx = {THREE:{...THREE, WebGLRenderer:EvidenceRenderer}, data, quality:{id:'medium'},
      qs:new URLSearchParams('glb=strict'), state:{garage:{rigId:'crawler-lite'},settings:{}}, scene:new THREE.Scene()};
    ctx.assets = createAssets(ctx); await ctx.assets.init();
    ctx.gltfRigs = createGltfRigs(ctx);
    ctx.rig = createRigSystem(ctx);
    ctx.shopPreview = createPreview(ctx); await ctx.shopPreview.init();
    if (!ctx.shopPreview.ready) throw new Error('Preview failed initialization');
    window.__previewEvidence = {ctx, records, maskMaterial};
  }, threeUrl);
  const rigIds = await page.evaluate(() => window.__previewEvidence.ctx.data.RIGS.map(r => r.id));
  const ids = ['button-bit', 'dth-bit', 'core-bit', 'tricone-bit', 'drill-rod', 'core-barrel',
    'tube-pile', 'cfa-flight', 'bop-stack', 'compressor-skid', ...rigIds];
  for (const id of ids) {
    assert.equal(readFileSync(lease, 'utf8').trim(), 'tool-preview', 'Lease revoked during capture');
    const row = await page.evaluate(async ({id, rig}) => {
      const {ctx, records} = window.__previewEvidence;
      if (rig) await ctx.gltfRigs.load(id);
      window.__capturePreview = id;
      await ctx.shopPreview.thumbnail(id);
      window.__capturePreview = null;
      const row = records.at(-1);
      if (row?.id !== id) throw new Error('Missing fresh capture for ' + id);
      return {...row, frame:ctx.shopPreview.lastFrame};
    }, {id, rig:rigIds.includes(id)});
    assert(row.frame?.ok, id + ': framing telemetry failed');
    assert(row.candidate.occupancy > 0 && row.candidate.edgePixels === 0 && !row.candidate.contextLost, id + ': empty/cropped/lost GPU capture');
    assert(Number.isFinite(row.baseline.occupancy) && row.baseline.occupancy > 0 && !row.baseline.contextLost, id + ': empty/lost baseline GPU capture');
    if (rigIds.includes(id)) assert.equal(row.source, 'glb', id + ': actual GLB required');
    for (const view of ['candidate', 'baseline']) {
      writeFileSync(resolve(out, id + '-' + view + '.png'), Buffer.from(row[view].image.split(',')[1], 'base64'));
      delete row[view].image;
    }
    report.rows.push(row);
    console.log(`${id}: ${(row.baseline.occupancy * 100).toFixed(2)} -> ${(row.candidate.occupancy * 100).toFixed(2)}% GPU silhouette; edge=${row.candidate.edgePixels}`);
  }
  assert.equal(report.rows.length, ids.length);
  assert.deepEqual(report.errors, []);
  for (const family of ['tools', 'rigs']) {
    await page.evaluate(({family, rigIds}) => {
      document.body.style.cssText = 'margin:24px;background:#10151d;color:#e5ebf3;font:14px system-ui';
      document.body.replaceChildren();
      const title = document.createElement('h1');
      title.textContent = `Preview ${family}: previous / current`;
      document.body.append(title);
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,256px);gap:12px';
      for (const row of window.__previewEvidence.records) {
        if (rigIds.includes(row.id) !== (family === 'rigs')) continue;
        for (const view of ['baseline', 'candidate']) {
          const cell = document.createElement('div');
          const label = document.createElement('div');
          label.textContent = `${row.id} | ${view} | ${(row[view].occupancy * 100).toFixed(2)}%`;
          const img = document.createElement('img');
          img.src = row[view].image; img.width = img.height = 256;
          cell.append(label, img); grid.append(cell);
        }
      }
      document.body.append(grid);
    }, {family, rigIds});
    await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    await page.screenshot({path:resolve(out, family + '-comparison.png'), fullPage:true});
  }
  await page.evaluate(() => {
    const {ctx, maskMaterial} = window.__previewEvidence;
    ctx.shopPreview.dispose(); ctx.rig.dispose(); ctx.gltfRigs.dispose(); ctx.assets.dispose(); maskMaterial.dispose();
  });
  assert.deepEqual(hashes(sourcePaths), report.provenance.sources, 'Source changed during capture');
  assert.deepEqual(hashes(modelPaths), report.provenance.models, 'Models changed during capture');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = error.stack || error.message;
  throw error;
} finally {
  try { await browser?.close(); report.browserClosed = !browser?.isConnected(); }
  finally {
    try { await server.close(); report.serverClosed = true; }
    finally { report.finishedAt = new Date().toISOString(); writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2) + '\n'); }
  }
}
