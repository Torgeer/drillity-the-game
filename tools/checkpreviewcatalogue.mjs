/** CPU-only preview framing regression, using the public preview API.
 *
 * node tools/checkpreviewcatalogue.mjs [--write research/tool-preview-catalogue.json]
 * node tools/checkpreviewcatalogue.mjs --quick   (representatives + all GLB rigs)
 *
 * The renderer/2D canvas are recording doubles: no browser, GPU or pixel claims.
 * Every submitted POSITION vertex is projected through the actual camera, then
 * through the actual drawImage rectangle. Geometric silhouette coverage is a
 * 128-square triangle mask, not shaded/antialiased visible-pixel coverage.
 * GLBs go through glbinfo's authoritative parser/ruler and the real runtime
 * loader/factory; this does not introduce a second machine dimension decoder.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createPreview } from '../src/core/preview.js';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { listTools, disposeToolLibrary } from '../src/rig/tools.js';
import { ITEMS, RIGS, getItem } from '../src/game/data.js';
import { parseGLB, measure } from './glbinfo.mjs';
import { blenderRigIds } from './checkrigloader.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const EPS = 1e-6;
// Authored QA viewports/poses, never claims about physical machine dimensions.
const VIEWPORTS = [[256, 256], [320, 180], [180, 320]];
const REPRESENTATIVES = [
  'button-bit', 'dth-bit', 'rc-bit', 'core-bit', 'pdc-bit', 'tricone-bit',
  'drill-rod', 'drill-collar', 'drill-pipe', 'push-rod', 'sda-bar',
  'cfa-flight', 'core-barrel', 'rc-dual-wall-pipe', 'jumbo-feed',
  'tube-pile', 'precast-pile', 'sheet-pile-pair', 'cable-bolt',
  'bop-stack', 'rotary-drive-head', 'compressor-skid', 'rc-cyclone', 'mesh-sheet',
  'bolt-nut', 'detonator-reel',
];

function rasterTriangle(mask, p, ia, ib, ic, resolution) {
  const ax = (p[ia] + 1) * resolution / 2, ay = (1 - p[ia + 1]) * resolution / 2;
  const bx = (p[ib] + 1) * resolution / 2, by = (1 - p[ib + 1]) * resolution / 2;
  const cx = (p[ic] + 1) * resolution / 2, cy = (1 - p[ic + 1]) * resolution / 2;
  const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (!Number.isFinite(area) || Math.abs(area) < 1e-10) return;
  const x0 = Math.max(0, Math.ceil(Math.min(ax, bx, cx) - .5));
  const x1 = Math.min(resolution - 1, Math.floor(Math.max(ax, bx, cx) - .5));
  const y0 = Math.max(0, Math.ceil(Math.min(ay, by, cy) - .5));
  const y1 = Math.min(resolution - 1, Math.floor(Math.max(ay, by, cy) - .5));
  const sign = Math.sign(area);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (mask[y * resolution + x]) continue;
    const px = x + .5, py = y + .5;
    if (sign * ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) >= -1e-8
      && sign * ((cx - bx) * (py - by) - (cy - by) * (px - bx)) >= -1e-8
      && sign * ((ax - cx) * (py - cy) - (ay - cy) * (px - cx)) >= -1e-8) mask[y * resolution + x] = 1;
  }
}

function project(group, camera, silhouette = false) {
  group.updateWorldMatrix(true, true);
  camera.updateMatrixWorld(true);
  const vp = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const out = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity], vertices: 0 };
  const mask = silhouette ? new Uint8Array(128 * 128) : null;
  const point = new THREE.Vector3(), matrix = new THREE.Matrix4(), instance = new THREE.Matrix4();
  group.traverseVisible(mesh => {
    if (!mesh.isMesh || !mesh.geometry) return;
    const geometry = mesh.geometry, position = geometry.getAttribute('position');
    assert.ok(position?.count > 0, 'Rendered mesh must have actual POSITION geometry');
    assert.ok(!mesh.isSkinnedMesh, 'Add a measured skinning path before accepting skinned previews');
    assert.ok(!mesh.morphTargetInfluences?.some(Boolean), 'Add a measured morph path before accepting active morphs');
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const groups = Array.isArray(mesh.material) ? geometry.groups : [{start: 0, count: Infinity, materialIndex: 0}];
    const index = geometry.index;
    const drawStart = geometry.drawRange.start, drawEnd = Math.min(index?.count ?? position.count, drawStart + geometry.drawRange.count);
    for (let n = 0; n < (mesh.isInstancedMesh ? mesh.count : 1); n++) {
      if (mesh.isInstancedMesh) { mesh.getMatrixAt(n, instance); matrix.multiplyMatrices(mesh.matrixWorld, instance); }
      else matrix.copy(mesh.matrixWorld);
      matrix.premultiply(vp);
      const projected = new Float64Array(position.count * 3);
      const used = new Uint8Array(position.count);
      for (const part of groups) {
        const material = materials[part.materialIndex];
        if (!material || material.visible === false || (material.transparent && material.opacity === 0)) continue;
        const start = Math.max(drawStart, part.start), end = Math.min(drawEnd, part.start + part.count);
        for (let k = start; k < end; k++) {
          const i = index ? index.getX(k) : k;
          if (used[i]) continue;
          used[i] = 1;
          point.fromBufferAttribute(position, i).applyMatrix4(matrix);
          assert.ok(Number.isFinite(point.x + point.y + point.z), 'Projected vertices must be finite');
          projected[i * 3] = point.x; projected[i * 3 + 1] = point.y; projected[i * 3 + 2] = point.z;
          for (let d = 0; d < 3; d++) {
            const value = projected[i * 3 + d];
            out.min[d] = Math.min(out.min[d], value); out.max[d] = Math.max(out.max[d], value);
          }
          out.vertices++;
        }
        if (mask) for (let k = start; k + 2 < end; k += 3) {
          const a = (index ? index.getX(k) : k) * 3;
          const b = (index ? index.getX(k + 1) : k + 1) * 3;
          const c = (index ? index.getX(k + 2) : k + 2) * 3;
          // All triangles contribute to a geometric silhouette; hidden interior
          // triangles cannot enlarge the union outside the visible outer shell.
          rasterTriangle(mask, projected, a, b, c, 128);
        }
      }
    }
  });
  assert.ok(out.vertices > 0, 'An empty rendered preview must fail');
  out.width = (out.max[0] - out.min[0]) / 2;
  out.height = (out.max[1] - out.min[1]) / 2;
  out.area = out.width * out.height;
  out.cropped = out.min.some(v => v < -1 - EPS) || out.max.some(v => v > 1 + EPS);
  if (mask) out.silhouette = mask.reduce((sum, x) => sum + x, 0) / mask.length;
  return out;
}

/** Frozen prior algorithm for before/after measurements, not a production fit. */
function priorFrame(group, camera, silhouette) {
  const saved = group.position.clone();
  group.position.set(0, 0, 0); group.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  if (group.parent) group.parent.worldToLocal(center);
  group.position.copy(center).negate();
  const old = new THREE.PerspectiveCamera(30, 1, .05, 60);
  const radius = size.length() * .5 || 1, dist = radius / Math.tan(Math.PI / 12) * 1.9;
  const aim = group.userData.preview?.aim || [.42, .34, .86];
  old.position.fromArray(aim).normalize().multiplyScalar(dist); old.lookAt(0, 0, 0);
  old.near = Math.max(.01, dist * .05); old.far = Math.max(dist * 6, 40); old.updateProjectionMatrix();
  const result = project(group, old, silhouette);
  group.position.copy(saved); group.updateWorldMatrix(true, true);
  return result;
}

function blitBounds(bounds, width, height, dx, dy, dw, dh) {
  const out = { ...bounds, min: bounds.min.slice(), max: bounds.max.slice() };
  const cx = (2 * dx + dw) / width - 1, cy = 1 - (2 * dy + dh) / height;
  for (const key of ['min', 'max']) {
    out[key][0] = bounds[key][0] * dw / width + cx;
    out[key][1] = bounds[key][1] * dh / height + cy;
  }
  out.width *= dw / width; out.height *= dh / height; out.area = out.width * out.height;
  out.cropped = out.min.some(v => v < -1 - EPS) || out.max.some(v => v > 1 + EPS);
  return out;
}

export async function checkPreviewCatalogue({quick = false, liveSteps = 24} = {}) {
  const started = performance.now();
  assert.ok(Number.isInteger(liveSteps) && liveSteps >= 4, 'At least four live yaw samples per revolution are required');
  const globalKeys = ['window', 'document', 'createImageBitmap', 'fetch'];
  const savedGlobals = new Map(globalKeys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const savedConsole = {warn: console.warn, error: console.error, info: console.info};
  const diagnostics = [], materials = new Map(), rows = [], failures = [];
  let captureSilhouette = false, renderCount = 0, projectedVertices = 0, activeLabel = '';
  let preview, rig, gltf;
  function makeCanvas(width = 256, height = 256) {
    const canvas = {width, height, clientWidth: width, clientHeight: height, isConnected: true, last: null};
    const context = new Proxy({
      canvas, clearRect() {},
      drawImage(image, ...args) {
        if (!image?.snapshot) return;
        let dx = 0, dy = 0, dw = image.width, dh = image.height;
        if (args.length >= 4) [dx, dy, dw, dh] = args.slice(-4);
        else if (args.length >= 2) [dx, dy] = args;
        canvas.last = { ...image.snapshot,
          candidate: blitBounds(image.snapshot.candidate, canvas.width, canvas.height, dx, dy, dw, dh),
        };
      },
      measureText: text => ({width: String(text).length * 8}),
      createLinearGradient: () => ({addColorStop() {}}),
      createRadialGradient: () => ({addColorStop() {}}),
      getImageData: (_x, _y, w, h) => ({data: new Uint8ClampedArray(w * h * 4)}),
      createImageData: (w, h) => ({data: new Uint8ClampedArray(w * h * 4)}),
    }, {get: (target, key) => key in target ? target[key] : () => {}});
    canvas.getContext = () => context;
    return canvas;
  }
  class RecordingRenderer {
    constructor({canvas}) { this.domElement = canvas; }
    setPixelRatio() {}
    setSize(w, h) { this.domElement.width = w; this.domElement.height = h; }
    render(scene, camera) {
      const visiblePivots = scene.children.filter(o => o.isGroup && o.visible && o.children.length);
      assert.equal(visiblePivots.length, 1, activeLabel + ': only one preview pivot may render');
      const pivot = visiblePivots[0];
      assert.equal(pivot.children.length, 1, activeLabel + ': only one preview subject may render');
      const subject = pivot?.children[0];
      assert.ok(subject, activeLabel + ': renderer must contain a preview subject');
      const candidate = project(subject, camera, captureSilhouette);
      const baseline = captureSilhouette ? priorFrame(subject, camera, true) : null;
      const aim = subject.userData.preview?.aim;
      if (aim) {
        const declared = new THREE.Vector3().fromArray(aim).normalize();
        assert.ok(camera.position.clone().normalize().dot(declared) > 1 - EPS, activeLabel + ': preview.aim must be honored');
      }
      this.domElement.snapshot = {candidate, baseline, source: subject.userData.spec?.source,
        vertices: candidate.vertices, pivot: pivot.rotation.toArray().slice(0, 3)};
      renderCount++; projectedVertices += candidate.vertices;
    }
    dispose() {}
  }
  class NoGpuPMREM { fromScene() { return {texture: new THREE.Texture(), dispose() {}}; } dispose() {} }
  try {
    for (const key of ['warn', 'error', 'info']) console[key] = (...args) => diagnostics.push({level:key, text:args.map(String).join(' ')});
    globalThis.window = {devicePixelRatio: 1};
    globalThis.document = {baseURI:'http://preview-cpu.invalid/', createElement: () => makeCanvas()};
    globalThis.createImageBitmap = async source => ({width:source.width, height:source.height, snapshot:source.snapshot, close() {}});
    globalThis.fetch = async input => {
      const url = new URL(input), match = /^\/models\/([a-z0-9-]+)\.glb$/.exec(url.pathname);
      assert.equal(url.origin, 'http://preview-cpu.invalid', 'CPU harness must never fetch the network');
      assert.ok(match, 'CPU harness reads only registered model files');
      const data = readFileSync(resolve(ROOT, 'public/models', match[1] + '.glb'));
      return {ok:true, arrayBuffer:async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)};
    };
    const T = {...THREE, WebGLRenderer:RecordingRenderer, PMREMGenerator:NoGpuPMREM};
    const ctx = {THREE:T, quality:{id:'low'}, qs:new URLSearchParams('glb=strict'),
      data:{ITEMS,RIGS,getItem}, state:{garage:{rigId:'crawler-lite'},settings:{}}, scene:new THREE.Scene(),
      assets:{material(kind, params = {}) {
        const key = kind + JSON.stringify(params);
        if (!materials.has(key)) { const m = new THREE.MeshStandardMaterial(params); m.name = kind; materials.set(key, m); }
        return materials.get(key);
      }},
    };
    gltf = ctx.gltfRigs = createGltfRigs(ctx);
    const rigIds = blenderRigIds();
    assert.deepEqual(rigIds.slice().sort(), RIGS.map(r => r.id).sort(), 'Every catalogue rig must have an actual registered GLB');
    for (const id of rigIds) {
      const {json, bin} = parseGLB(readFileSync(resolve(ROOT, 'public/models', id + '.glb')));
      const measured = measure(json, bin);
      assert.ok(!measured.empty && measured.unreadable.length === 0, id + ': glbinfo must measure all actual geometry');
      await gltf.load(id);
    }
    rig = ctx.rig = createRigSystem(ctx);
    preview = createPreview(ctx); await preview.init(); assert.ok(preview.ready, 'Preview must initialize');
    const toolIds = listTools();
    for (const id of REPRESENTATIVES) assert.ok(toolIds.includes(id), 'Representative must be a real tool id: ' + id);
    const refs = quick ? REPRESENTATIVES.slice() : toolIds.filter(id => !getItem(id)).concat(ITEMS);
    refs.push(...rigIds, {id:'preview-qa-supplies', name:'Unmodeled consumable', slot:'consumable'});
    const representatives = new Set(REPRESENTATIVES.concat(rigIds, 'preview-qa-supplies'));
    for (const ref of refs) {
      const id = typeof ref === 'string' ? ref : ref.id;
      activeLabel = id;
      const family = rigIds.includes(id) ? 'rig' : id === 'preview-qa-supplies' ? 'supply' : 'tool';
      const wearLevels = family === 'tool' ? [0, .5, 1] : [0];
      for (const wear of wearLevels) {
        captureSilhouette = wear === 0;
        const square = makeCanvas();
        assert.ok(await preview.render(ref, square, {wear}), id + ': thumbnail must render');
        assert.ok(square.last, id + ': thumbnail must actually blit');
        const row = {id, family, wear, candidate:square.last.candidate, baseline:square.last.baseline, liveWorst:0, liveCrops:0};
        if (family === 'rig') assert.equal(square.last.source, 'glb', id + ': must render its actual GLB');
        if (row.candidate.cropped) failures.push(id + '@' + wear + ': square thumbnail cropped');
        // Authored QA acceptance floor, deliberately looser than the studio's
        // current 0.88 target: shrinking everything must not pass a coverage gate.
        const fill = Math.max(...row.candidate.min.slice(0, 2).map(Math.abs), ...row.candidate.max.slice(0, 2).map(Math.abs));
        if (fill < .80) failures.push(id + '@' + wear + ': thumbnail does not reach the minimum 0.80 NDC fill');
        // Independent before/after evidence: all measured representatives clear
        // this substantial gain, without requiring the exact current fit result.
        if (representatives.has(id) && row.baseline && row.candidate.area <= row.baseline.area * 1.5) {
          failures.push(id + '@' + wear + ': representative projected area gains less than 1.5x');
        }
        captureSilhouette = false;
        for (const [w, h] of VIEWPORTS.slice(1)) {
          const rectangle = makeCanvas(w, h);
          await preview.render(ref, rectangle, {wear});
          assert.ok(rectangle.last, id + ': rectangular thumbnail must actually blit');
          if (rectangle.last.candidate.cropped) failures.push(`${id}@${wear}: ${w}x${h} thumbnail cropped`);
        }
        // All catalogue items complete one revolution; representatives and all
        // rigs cover five revolutions, the full sin(spin * .4) tilt period.
        const revolutions = representatives.has(id) ? 5 : 1;
        for (const [w, h] of VIEWPORTS) {
          const canvas = makeCanvas(w, h);
          preview.setLive(ref, canvas, {wear});
          for (let step = 0; step < liveSteps * revolutions; step++) {
            const before = renderCount;
            canvas.last = null;
            preview.update(2 * Math.PI / liveSteps / .55);
            assert.equal(renderCount, before + 1, id + ': every sampled live pose must render a fresh frame');
            assert.ok(canvas.last, id + ': live update must actually blit');
            const b = canvas.last.candidate;
            row.liveWorst = Math.max(row.liveWorst, ...b.min.slice(0, 2).map(Math.abs), ...b.max.slice(0, 2).map(Math.abs));
            if (b.cropped) { row.liveCrops++; if (row.liveCrops === 1) failures.push(`${id}@${wear}: ${w}x${h} live cropped`); }
          }
          preview.clearLive();
        }
        rows.push(row);
      }
      if (rows.length % 50 === 0) savedConsole.info(`Preview catalogue measured ${rows.length} rows / ${renderCount} frames.`);
    }
    assert.ok(rows.length && renderCount && projectedVertices, 'Empty evidence must fail');
    const unexpected = diagnostics.filter(d => d.level === 'error' || /failed to build|\[preview\].*(failed|unavailable)/.test(d.text));
    assert.deepEqual(unexpected, [], 'Preview must not substitute a failed tool or rig build');
    return {
      schema:1, measuredAt:new Date().toISOString(), mode:quick ? 'representatives' : 'catalogue',
      toolIds:toolIds.length, dataItems:ITEMS.length, rigIds, viewports:VIEWPORTS, liveSteps,
      counts:{rows:rows.length, renderCount, projectedVertices, failures:failures.length, elapsedMs:performance.now() - started},
      methodology:'Actual public preview API, runtime GLB loader/factory, glbinfo validation, every drawn POSITION vertex projected then actual 2D blit applied. 128x128 geometric triangle-union silhouette; no GPU/shading/pixel/performance claim. Baseline is frozen sphere *1.9 at the same thumbnail pose; live is candidate only.',
      failures, diagnostics, rows,
    };
  } finally {
    preview?.dispose(); rig?.dispose(); gltf?.dispose(); disposeToolLibrary();
    for (const material of materials.values()) material.dispose();
    for (const key of Object.keys(savedConsole)) console[key] = savedConsole[key];
    for (const key of globalKeys) {
      const descriptor = savedGlobals.get(key);
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const result = await checkPreviewCatalogue({quick:argv.includes('--quick')});
  const writeAt = argv.indexOf('--write');
  if (writeAt >= 0) { assert.ok(argv[writeAt + 1], '--write needs a report path'); writeFileSync(resolve(argv[writeAt + 1]), JSON.stringify(result, null, 2) + '\n'); }
  console.log(`${result.counts.failures ? 'FAIL' : 'OK'} preview catalogue: ${result.counts.rows} rows, ${result.rigIds.length} actual GLBs, ${result.counts.renderCount} projected frames, ${result.counts.projectedVertices} vertex checks, ${result.counts.failures} crop failures.`);
  if (result.failures.length) { console.error(result.failures.slice(0, 30).join('\n')); process.exitCode = 1; }
}
