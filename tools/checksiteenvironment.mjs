/**
 * CPU integration gate for the urban Blender site and terrain's real loader.
 * Run: node tools/checksiteenvironment.mjs
 *
 * Imports src/world/terrain.js unchanged and uses the real three GLTFLoader
 * with the exact exported GLB bytes. Only browser IO is replaced: PNG imports,
 * Canvas2D painting (no pixel claims), Image and fetch. No GPU/browser/server,
 * packages, synthetic model or copied terrain implementation is involved.
 * This checks scene/resource lifecycle, NOT visual quality, fps or draw calls
 * after renderer culling. Use glbinfo.mjs for dimensions (ASTRA §5).
 *
 * A missing export fails the real-load tests; fallback tests still run. Every
 * failure produces exit code 1, including exceptions and an empty test set.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const SITE = 'urban-plot';
const assetPath = fileURLToPath(new URL(`../public/models/sites/${SITE}.glb`, import.meta.url));
let assetBytes;
let assetProblem;
try { assetBytes = readFileSync(assetPath); } catch (error) { assetProblem = error; }

// The only source transform is Vite's image import, which Node cannot read.
const hooks = registerHooks({
  load(url, context, next) {
    if (url.endsWith('/src/ui/assets/logo-full.png')) {
      return { format: 'module', source: `export default ${JSON.stringify(url)}`, shortCircuit: true };
    }
    return next(url, context);
  },
});

function imageData(width, height) {
  // Opaque neutral pixels keep the procedural mip code real and deterministic.
  // Painting is deliberately untested; this gate never captures an image.
  return { width, height, data: new Uint8ClampedArray(width * height * 4).fill(255) };
}
function canvas() {
  const c = { width: 1, height: 1 };
  const noop = () => {};
  const gradient = () => ({ addColorStop: noop });
  const g = { canvas: c, createImageData: imageData,
    getImageData: (_x, _y, w, h) => imageData(w, h),
    createLinearGradient: gradient, createRadialGradient: gradient,
    measureText: (text) => ({ width: String(text).length * 10 }),
  };
  for (const method of ['arc', 'beginPath', 'bezierCurveTo', 'clearRect', 'clip',
    'closePath', 'drawImage', 'ellipse', 'fill', 'fillRect', 'fillText', 'lineTo',
    'moveTo', 'putImageData', 'quadraticCurveTo', 'rect', 'restore', 'rotate',
    'roundRect', 'save', 'scale', 'setLineDash', 'setTransform', 'stroke',
    'strokeRect', 'strokeText', 'transform', 'translate']) g[method] = noop;
  c.getContext = (kind) => { assert.equal(kind, '2d'); return g; };
  return c;
}

const globals = { document: globalThis.document, Image: globalThis.Image, fetch: globalThis.fetch };
globalThis.document = {
  baseURI: 'https://site-environment.invalid/',
  createElement(tag) { assert.equal(tag, 'canvas'); return canvas(); },
};
globalThis.Image = class {
  width = 512; height = 128;
  set src(_value) { queueMicrotask(() => this.onload?.()); }
};

const { createTerrain } = await import('../src/world/terrain.js');
const disposed = new WeakMap();
const originals = new Map();
for (const proto of [THREE.BufferGeometry.prototype, THREE.Material.prototype, THREE.Texture.prototype, THREE.InstancedMesh.prototype]) {
  const original = proto.dispose;
  originals.set(proto, original);
  proto.dispose = function () {
    disposed.set(this, (disposed.get(this) || 0) + 1);
    return original.call(this);
  };
}
const disposeCount = (object) => disposed.get(object) || 0;

function resources(node) {
  const geometries = new Set(), materials = new Set();
  node.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material) materials.add(material);
    }
  });
  return { geometries: [...geometries], materials: [...materials] };
}
function assertDisposed(objects, label) {
  assert.ok(objects.length, `${label}: measured no resources`);
  for (const object of objects) assert.ok(disposeCount(object) > 0, `${label}: ${object.uuid} was not disposed`);
}
function assertLive(objects, label) {
  assert.ok(objects.length, `${label}: measured no resources`);
  for (const object of objects) assert.equal(disposeCount(object), 0, `${label}: ${object.uuid} is already disposed`);
}
function deferred() {
  let resolve;
  const promise = new Promise((yes) => { resolve = yes; });
  return { promise, resolve };
}
async function until(predicate, label) {
  const deadline = performance.now() + 10_000;
  while (!predicate()) {
    assert.ok(performance.now() < deadline, `Timed out: ${label}`);
    await delay(5);
  }
}
async function drain() { await delay(0); await delay(0); }

let active;
const originalParse = GLTFLoader.prototype.parseAsync;
GLTFLoader.prototype.parseAsync = async function (...args) {
  // Observation around the real parser also permits a deterministic late-parse
  // completion. The parsed scenes, buffers and materials are never substituted.
  const scenario = active;
  const gltf = await originalParse.apply(this, args);
  const parsed = { gltf, ...resources(gltf.scene) };
  scenario.parses.push(parsed);
  if (scenario.parseGate) await scenario.parseGate.promise;
  return gltf;
};

const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args.map(String).join(' ');
  if (message.startsWith('[terrain]') && active) active.warnings.push(message);
  else originalWarn(...args);
};

function requireExport() {
  assert.ok(assetBytes, `Real export is required: ${assetPath}. Build blender/sites/urban_plot.py first. ${assetProblem?.message || ''}`);
}
function response(scenario) {
  if (scenario.mode === 'missing') return new Response('missing', { status: 404 });
  if (scenario.mode === 'html') return new Response('<!doctype html><html>SPA fallback</html>', { status: 200 });
  requireExport();
  const bytes = scenario.siteId && scenario.siteId !== SITE
    ? readFileSync(new URL(`../public/models/sites/${scenario.siteId}.glb`, import.meta.url)) : assetBytes;
  const res = new Response(bytes, { status: 200, headers: { 'Content-Type': 'model/gltf-binary' } });
  if (scenario.bufferGate) {
    const read = res.arrayBuffer.bind(res);
    res.arrayBuffer = async () => {
      scenario.bufferReads++;
      await scenario.bufferGate.promise;
      return read();
    };
  }
  return res;
}
globalThis.fetch = async (input, options = {}) => {
  const scenario = active;
  const url = typeof input === 'string' ? input : input.url;
  assert.equal(url, `https://site-environment.invalid/models/sites/${scenario.siteId || SITE}.glb`, 'Only the tested registered asset may be requested');
  scenario.requests.push({ url, signal: options.signal });
  if (scenario.fetchGate) {
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise((resolve, reject) => {
      const abort = () => reject(new DOMException('Aborted', 'AbortError'));
      options.signal?.addEventListener('abort', abort, { once: true });
      scenario.fetchGate.promise.then(() => {
        options.signal?.removeEventListener('abort', abort);
        resolve();
      });
    });
  }
  return response(scenario);
};

async function setup(options = {}) {
  const scenario = { mode: 'real', requests: [], parses: [], warnings: [], bufferReads: 0, ...options };
  active = scenario;
  const scene = new THREE.Scene();
  const terrain = createTerrain({ THREE, scene, quality: { id: 'low', particles: 0.3, anisotropy: 1 },
    assets: options.assets,
    state: { world: { regionId: 'german-site', weather: 'clear' } } });
  scenario.terrain = terrain;
  scenario.scene = scene;
  await terrain.init();
  const wanted = options.siteId || SITE;
  terrain.setArchetype(wanted);
  assert.equal(terrain.archetype, wanted);
  assert.equal(terrain.siteModel.wanted, wanted, 'Archetype must register its own model');
  assert.equal(terrain.siteModel.model, null, 'A pending model must not be reported as live');
  assert.ok(terrain.siteModel.procedural, 'A pending model must leave the procedural fallback');
  assert.ok(terrain.ground && terrain.drawCalls > 0, 'Fallback must contain real scene geometry');
  return scenario;
}
async function load(options = {}) {
  requireExport();
  const scenario = await setup(options);
  await until(() => scenario.terrain.siteModel.model || scenario.terrain.siteModel.problem, 'real asset load');
  assert.equal(scenario.terrain.siteModel.problem, null);
  assert.equal(scenario.terrain.siteModel.model, options.siteId || SITE);
  assert.equal(scenario.terrain.siteModel.procedural, false);
  return scenario;
}
function liveNode(terrain, id = SITE) {
  const nodes = terrain.root.children.filter((child) => child.name === `site:${id}`);
  assert.equal(nodes.length, 1, 'Exactly one actual urban GLB scene must be attached');
  return nodes[0];
}
function assertGone(terrain) {
  assert.ok(!terrain.root.children.some((child) => child.name === `site:${SITE}`), 'Urban GLB must be removed');
  assert.equal(terrain.siteModel.model, null, 'Diagnostic must describe the attached scene, not a cached master');
  assert.equal(terrain.siteModel.drawCalls, 0);
}

const results = [];
async function test(name, body) {
  active = null;
  try {
    await body();
    results.push({ name, ok: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, ok: false });
    console.error(`FAIL ${name}: ${error.stack || error}`);
  } finally {
    if (active) {
      active.terrain?.dispose();
      active.fetchGate?.resolve();
      active.bufferGate?.resolve();
      active.parseGate?.resolve();
      await drain();
    }
  }
}

try {
  await test('real GLB source, restored anchors and live resources', async () => {
    const s = await load();
    const t = s.terrain, node = liveNode(t), parsed = s.parses[0];
    assert.equal(s.requests.length, 1);
    assert.equal(s.parses.length, 1, 'Must actually parse the export');
    assert.notEqual(node, parsed.gltf.scene, 'Live instance must be cloned from the master');
    const actual = resources(node);
    assertLive(actual.geometries, 'attached geometry');
    assertLive(actual.materials, 'attached materials');
    assertDisposed(parsed.materials, 'imported material stubs');
    for (const geometry of actual.geometries) assert.ok(!parsed.geometries.includes(geometry), 'Instance must own its geometry');
    const anchors = parsed.gltf.parser.json.nodes.filter((n) => /^(mount:|aim:)/.test(n.name || ''));
    assert.ok(anchors.length > 0, 'Export must contain named anchors');
    for (const anchor of anchors) assert.ok(node.getObjectByName(anchor.name), `Anchor name was not restored: ${anchor.name}`);
    const collar = node.getObjectByName('mount:site-collar');
    assert.ok(collar, 'Site collar anchor is required');
    const position = collar.getWorldPosition(new THREE.Vector3());
    assert.ok(position.length() < 1e-5, `Collar anchor is displaced from origin: ${position.toArray()}`);
    let primitives = 0;
    let groundedVertices = 0;
    const colours = new Set();
    const positionAt = new THREE.Vector3();
    node.updateMatrixWorld(true);
    node.traverse((o) => {
      if (!o.isMesh) return;
      primitives += Array.isArray(o.material) ? o.material.length : 1;
      const colour = o.geometry.getAttribute('color');
      assert.ok(colour?.count > 0, `${o.name}: actual GLB lost COLOR_0`);
      for (const material of Array.isArray(o.material) ? o.material : [o.material]) {
        assert.equal(material.vertexColors, true, `${o.name}: authored colour has no runtime consumer`);
        assert.equal(material.color.getHex(), 0xffffff, 'Vertex colours must not multiply by an unrelated kind tint');
      }
      for (let i = 0; i < colour.count; i++) {
        colours.add([colour.getX(i), colour.getY(i), colour.getZ(i)].map((v) => v.toFixed(4)).join(','));
      }
      // Check contact with terrain at actual exported grade vertices. This is
      // a ground-intersection assertion, not a second asset dimension ruler.
      const positions = o.geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        positionAt.fromBufferAttribute(positions, i).applyMatrix4(o.matrixWorld);
        if (positionAt.y < -.04 || positionAt.y > .025) continue;
        groundedVertices++;
        assert.ok(Math.abs(t.heightAt(positionAt.x, positionAt.z)) < 1e-5,
          `${o.name}: flat authored furniture meets uneven terrain at ${positionAt.toArray()}`);
      }
    });
    assert.ok(colours.size > 8, `Authored palette collapsed to ${colours.size} colours`);
    assert.ok(groundedVertices > 10, 'Measured no useful exported contact vertices');
    assert.ok(primitives > 0 && primitives <= 6, `Real GLB submits ${primitives} primitives; allowed 1..6`);
    assert.equal(t.siteModel.drawCalls, primitives);
    for (const material of actual.materials) assert.ok(!(material.transmission > 0), 'Transmission must be zero');
    assert.deepEqual(s.warnings, [], 'Successful load must not hide material or model warnings');
    console.log(`MEASURE source=${assetPath} bytes=${assetBytes.length} primitives=${primitives} anchors=${anchors.length} colours=${colours.size} groundContacts=${groundedVertices}`);
  });

  await test('shared assets materials and textures remain owned by assets', async () => {
    const shared = new Map(), texture = new THREE.Texture();
    const api = { material(kind, params) {
      const key = `${kind}:${JSON.stringify(params)}`;
      if (!shared.has(key)) {
        const m = new THREE.MeshStandardMaterial({ color: 0x517293, map: texture });
        m.name = `assets:${key}`;
        m.userData = { textureOwner: texture };
        shared.set(key, m);
      }
      return shared.get(key);
    } };
    try {
      const s = await load({ assets: api }), t = s.terrain;
      const borrowed = [...shared.values()];
      assertLive(borrowed, 'borrowed asset materials');
      const live = resources(liveNode(t));
      for (const material of live.materials) {
        assert.ok(!borrowed.includes(material), 'Terrain must clone asset material before changing flags');
        assert.equal(material.map, texture, 'Material clone should reuse asset-owned texture');
        assert.equal(material.vertexColors, true);
      }
      for (const original of borrowed) {
        assert.equal(original.vertexColors, false, 'Binding mutated the shared asset material');
        assert.equal(original.userData.textureOwner, texture, 'Cloning lost original asset metadata');
      }
      t.setRegion('nordic');
      assertLive([...shared.values(), texture], 'asset resources after rebuild');
      t.dispose();
      assertLive([...shared.values(), texture], 'asset resources after terrain disposal');
      assertDisposed(live.materials, 'terrain-owned material clones');
    } finally {
      // The fixture is the owner, and only the owner releases these resources.
      for (const material of shared.values()) material.dispose();
      texture.dispose();
    }
  });

  await test('existing uncoloured quarry keeps its material tint path', async () => {
    const s = await load({ siteId: 'quarry-bench' }), node = liveNode(s.terrain, 'quarry-bench');
    let uncoloured = 0;
    node.traverse((o) => {
      if (!o.isMesh || o.geometry.getAttribute('color')) return;
      uncoloured++;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        assert.equal(m.vertexColors, false, 'Uncoloured quarry must retain its existing material path');
        assert.ok(!(m.transmission > 0));
      }
    });
    assert.equal(uncoloured, 6, 'Expected all six real existing quarry material meshes');
  });

  await test('replacing procedural scatter releases its geometry and instance buffers', async () => {
    requireExport();
    const gate = deferred(), s = await setup({ fetchGate: gate }), t = s.terrain;
    t.setRegion('nordic'); // this regional fallback actually has scattered vegetation
    const scatter = [];
    t.root.traverse((o) => { if (o.isInstancedMesh) scatter.push(o); });
    assert.ok(scatter.length > 0, 'Expected actual fallback scatter before load');
    gate.resolve();
    await until(() => t.siteModel.model === SITE, 'replace fallback scatter');
    assertDisposed(scatter.map((o) => o.geometry), 'replaced scatter geometry');
    assertDisposed(scatter, 'replaced instance buffers');
  });

  for (const [mode, problem] of [['missing', /HTTP 404/], ['html', /not a GLB/]]) {
    await test(`${mode} asset remains a visible procedural fallback`, async () => {
      const s = await setup({ mode }), t = s.terrain;
      await until(() => t.siteModel.problem, `${mode} failure diagnostic`);
      assertGone(t);
      assert.ok(t.siteModel.procedural);
      assert.match(t.siteModel.problem, problem);
      assert.ok(t.ground && t.drawCalls > 0);
      // A ground plane alone is a silent-empty fallback. The existing urban
      // kit's merged concrete carries its surrounding buildings and platform.
      const concrete = t.root.getObjectByName('props-slab');
      assert.ok(concrete?.isMesh && concrete.geometry.attributes.position.count > 0,
        'Absent GLB must retain actual urban concrete furniture, not just ground');
      assert.equal(s.parses.length, 0, 'Rejected responses must never reach the parser');
      assert.equal(s.warnings.filter((w) => w.includes('did not load')).length, 1);
      t.setRegion('nordic');
      await drain();
      assert.equal(s.requests.length, 1, 'A rebuild must not hammer a known absent asset');
    });
  }

  await test('rebuilds preserve the master and replace disposed instance resources', async () => {
    const s = await load(), t = s.terrain, parsed = s.parses[0];
    for (const region of ['nordic', 'german-site', 'nordic']) {
      const previous = liveNode(t), before = resources(previous);
      t.setRegion(region);
      const next = liveNode(t), after = resources(next);
      assert.notEqual(next, previous);
      assertDisposed(before.geometries, 'replaced geometry');
      assertDisposed(before.materials, 'replaced materials');
      assertLive(after.geometries, 'rebuilt geometry');
      assertLive(after.materials, 'rebuilt materials');
      assertLive(parsed.geometries, 'cached master geometry');
    }
    assert.equal(s.requests.length, 1, 'Rebuilds must reuse the parsed master');
    assert.equal(s.parses.length, 1);
  });

  await test('surface to underground to surface reports the attached model', async () => {
    const s = await load(), t = s.terrain, before = resources(liveNode(t));
    t.setMethod('rockbolt');
    assert.ok(t.drive, 'Underground drive must be built');
    assertGone(t);
    assertDisposed(before.geometries, 'surface geometry entering underground');
    t.setArchetype('underground-drive');
    assertGone(t);
    t.setMethod('cfa');
    t.setArchetype(SITE);
    assert.ok(!t.drive);
    assertLive(resources(liveNode(t)).geometries, 'surface geometry after underground');
    assert.equal(t.siteModel.model, SITE);
    assert.equal(s.requests.length, 1);
  });

  await test('archetype change during fetch cannot attach the old site', async () => {
    requireExport();
    const gate = deferred(), s = await setup({ fetchGate: gate }), t = s.terrain;
    await until(() => s.requests.length === 1, 'urban request');
    t.setArchetype('exploration-pad');
    gate.resolve();
    await until(() => s.parses.length === 1, 'real late parse');
    await drain();
    assert.equal(t.archetype, 'exploration-pad');
    assertGone(t);
    t.setArchetype(SITE);
    await until(() => t.siteModel.model === SITE, 'reuse after archetype change');
    liveNode(t);
    assert.equal(s.requests.length, 1);
  });

  await test('dispose frees the attached instance and cached GLB geometry', async () => {
    const s = await load(), t = s.terrain;
    const before = resources(liveNode(t)), master = s.parses[0];
    t.dispose();
    assert.equal(t.root.parent, null);
    assert.equal(t.root.children.length, 0);
    assertGone(t);
    assertDisposed(before.geometries, 'disposed instance geometry');
    assertDisposed(before.materials, 'disposed instance materials');
    assertDisposed(master.geometries, 'disposed master geometry');
    const counts = [...before.geometries, ...master.geometries].map(disposeCount);
    t.dispose();
    assert.deepEqual([...before.geometries, ...master.geometries].map(disposeCount), counts, 'Second disposal must be harmless');
  });

  await test('dispose aborts an inflight fetch and cannot rebuild the root', async () => {
    requireExport();
    const gate = deferred(), s = await setup({ fetchGate: gate }), t = s.terrain;
    await until(() => s.requests.length === 1, 'inflight request');
    t.dispose();
    gate.resolve();
    await drain();
    assert.equal(s.requests[0].signal?.aborted, true, 'Terrain disposal must abort the fetch');
    assert.equal(s.parses.length, 0, 'Disposed fetch must not reach GLTFLoader');
    assert.equal(t.root.children.length, 0, 'A late response rebuilt the disposed root');
    assertGone(t);
  });

  await test('dispose during real GLB parse frees the late result', async () => {
    requireExport();
    const gate = deferred(), s = await setup({ parseGate: gate }), t = s.terrain;
    await until(() => s.parses.length === 1, 'real parse result held before resolution');
    const parsed = s.parses[0];
    t.dispose();
    gate.resolve();
    await drain();
    assert.equal(t.root.children.length, 0, 'A late parse rebuilt the disposed root');
    assertGone(t);
    assertDisposed(parsed.geometries, 'late parsed geometry');
    assertDisposed(parsed.materials, 'late imported materials');
  });

  await test('dispose during response-body read cannot start a parse', async () => {
    requireExport();
    const gate = deferred(), s = await setup({ bufferGate: gate }), t = s.terrain;
    await until(() => s.bufferReads === 1, 'response body read');
    t.dispose();
    gate.resolve();
    await drain();
    assert.equal(s.parses.length, 0, 'Disposed response-body read must not start GLTFLoader');
    assert.equal(t.root.children.length, 0);
    assertGone(t);
  });
} finally {
  console.warn = originalWarn;
  GLTFLoader.prototype.parseAsync = originalParse;
  for (const [proto, original] of originals) proto.dispose = original;
  for (const [key, value] of Object.entries(globals)) {
    if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
  }
  hooks.deregister();
}

const failed = results.filter((result) => !result.ok).length;
console.log(`SITE_ENVIRONMENT ${failed || !results.length ? 'FAIL' : 'PASS'} tests=${results.length} failed=${failed} mode=cpu-real-loader`);
if (failed || !results.length) process.exitCode = 1;
