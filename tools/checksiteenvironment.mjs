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

/* ══ THE ARCHETYPE TABLE, PARSED OUT OF terrain.js RATHER THAN COPIED ═══════
   `blender/lib/site.py:kinds()` parses `assets.js` for exactly this reason and
   says why: "two tables describing one thing will drift, and the one that is
   wrong will be believed" (ASTRA §5). A second list of archetypes here would
   go stale the first time one is added, and the gate would then pass because
   it was measuring a shorter list — ASTRA §10's "gate over an empty set".
   Parsing is bounded to the `const ARCHETYPES = {` literal and asserts it
   found a plausible number of rows before anything trusts it. */
const terrainSrc = readFileSync(fileURLToPath(new URL('../src/world/terrain.js', import.meta.url)), 'utf8');
function parseArchetypes() {
  const start = terrainSrc.indexOf('const ARCHETYPES = {');
  assert.ok(start > 0, 'checksiteenvironment: could not find `const ARCHETYPES = {` in terrain.js. '
    + 'Fix this parser — do NOT fall back to a hardcoded list.');
  let i = terrainSrc.indexOf('{', start), depth = 0, end = -1;
  for (; i < terrainSrc.length; i++) {
    if (terrainSrc[i] === '{') depth++;
    else if (terrainSrc[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  assert.ok(end > 0, 'checksiteenvironment: unbalanced braces in the ARCHETYPES literal');
  const body = terrainSrc.slice(start, end);
  const rows = [];
  const heads = [...body.matchAll(/^ {2}'([a-z-]+)': \{/gm)];
  for (let k = 0; k < heads.length; k++) {
    const from = heads[k].index;
    const to = k + 1 < heads.length ? heads[k + 1].index : body.length;
    const chunk = body.slice(from, to);
    // comments carry prose full of the same words; strip them before matching
    const code = chunk.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    const list = (key) => {
      const m = code.match(new RegExp(`\\b${key}:\\s*\\[([^\\]]*)\\]`));
      return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : null;
    };
    const word = (key) => (code.match(new RegExp(`\\b${key}:\\s*'([^']+)'`)) || [])[1] || null;
    const bool = (key) => {
      const m = code.match(new RegExp(`\\b${key}:\\s*(true|false)\\b`));
      return m ? m[1] === 'true' : null;
    };
    rows.push({ id: heads[k][1], plane: word('plane'), kit: word('kit'),
      model: word('model'), replaces: list('replaces'), replacesKit: bool('replacesKit') });
  }
  assert.ok(rows.length >= 10, `checksiteenvironment: parsed only ${rows.length} archetypes, `
    + 'which cannot be right. A check that measures nothing must fail, not pass.');
  return rows;
}
const ARCHETYPES = parseArchetypes();
const sitePath = (id) => fileURLToPath(new URL(`../public/models/sites/${id}.glb`, import.meta.url));
function siteBytes(id) { try { return readFileSync(sitePath(id)); } catch { return null; } }

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
  const prefix = 'https://site-environment.invalid/models/sites/';
  if (scenario.anySite) {
    /* The archetype-coverage cases walk every archetype in the table, so they
       cannot name one asset in advance. Still no synthetic model: the bytes
       are whatever is actually on disk under public/models/sites, and an
       archetype with no export gets a real 404, which is the same thing a
       fresh clone gets. */
    assert.ok(url.startsWith(prefix), `Unexpected request: ${url}`);
    scenario.requests.push({ url, signal: options.signal });
    if (scenario.mode === 'missing') return new Response('missing', { status: 404 });
    if (scenario.mode === 'html') return new Response('<!doctype html><html>SPA fallback</html>', { status: 200 });
    const id = url.slice(prefix.length).replace(/\.glb$/, '');
    const bytes = siteBytes(id);
    return bytes
      ? new Response(bytes, { status: 200, headers: { 'Content-Type': 'model/gltf-binary' } })
      : new Response('missing', { status: 404 });
  }
  assert.equal(url, `${prefix}${scenario.siteId || SITE}.glb`, 'Only the tested registered asset may be requested');
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
  /* ══════════════════════════════════════════════════════════════════════
     ARCHETYPE COVERAGE, PLANES, SUPPRESSION AND THE REBUILD FAN-OUT
     ══════════════════════════════════════════════════════════════════════ */

  /** A terrain with no model expectations — for archetypes that declare none. */
  async function plain(options = {}) {
    const scenario = { mode: 'real', anySite: true, requests: [], parses: [], warnings: [],
      bufferReads: 0, ...options };
    active = scenario;
    const scene = new THREE.Scene();
    /* `low` by default and `high` only where scatter DENSITY is the subject.
       `density` is clamped from `quality.particles` (terrain.js:1697) and the
       stones/scree/ice scatters are skipped outright on LOW, so a replaces- or
       net-cost measurement taken at low would report names as dead that are
       simply switched off — a false finding from an approximation in the
       instrument (ASTRA §5). Everything else runs low: six 900 m sea planes and
       six far fields at high exhausted the array-buffer allocator. */
    const terrain = createTerrain({ THREE, scene, data: options.data,
      quality: options.quality || { id: 'low', particles: 0.3, anisotropy: 1 },
      state: { world: { regionId: options.region || 'nordic', weather: 'clear' } } });
    scenario.terrain = terrain;
    await terrain.init();
    if (options.method !== undefined) terrain.setMethod(options.method);
    if (options.archetype) terrain.setArchetype(options.archetype);
    if (options.settle) {
      await until(() => terrain.siteModel.model || terrain.siteModel.problem, 'model settle');
      await drain();
    }
    return scenario;
  }
  const meshCount = (terrain) => {
    let n = 0;
    terrain.root.traverse((o) => {
      if (o.isMesh && o.visible) n += Array.isArray(o.material) ? o.material.length : 1;
    });
    return n;
  };

  await test('every modelled archetype declares BOTH suppression knobs', async () => {
    const modelled = ARCHETYPES.filter((a) => a.model);
    assert.ok(modelled.length > 0, 'Measured no modelled archetypes at all');
    for (const a of modelled) {
      assert.equal(a.model, a.id,
        `${a.id}: model "${a.model}" must be the archetype id verbatim (ASTRA §4.4)`);
      assert.ok(Array.isArray(a.replaces),
        `${a.id} declares a model but no \`replaces\`. A site .glb costs one draw call per `
        + 'material and addInstances() is the ONLY place that cost can be paid back; '
        + 'omitting the list is an undeclared decision, not a safe default.');
      assert.equal(typeof a.replacesKit, 'boolean',
        `${a.id} declares a model but no \`replacesKit\`. Leaving the procedural kit on `
        + 'double-dresses the plot; turning it off can empty it. Both are wrong by '
        + 'accident and only one is right on purpose — state which.');
    }
    const unmodelled = ARCHETYPES.filter((a) => !a.model).map((a) => a.id);
    console.log(`MEASURE archetypes=${ARCHETYPES.length} modelled=${modelled.length} `
      + `(${modelled.map((a) => a.id).join(' ')}) unmodelled=${unmodelled.length} `
      + `(${unmodelled.join(' ') || '-'})`);
  });

  await test('every declared model has a real export on disk', async () => {
    const missing = ARCHETYPES.filter((a) => a.model && !siteBytes(a.model)).map((a) => a.id);
    assert.deepEqual(missing, [],
      `Archetypes declare a model with no .glb in public/models/sites: ${missing.join(', ')}. `
      + 'Run `npm run blender:sites`. Declaring a model the loader can never find turns '
      + 'the fallback into the permanent site while every log line still reads OK.');
  });

  await test('every `replaces` name is a scatter that is really offered', async () => {
    /* A name nothing offers suppresses nothing and looks exactly like one that
       works. Walk each modelled archetype through several regions so a name
       that only exists in one biome still counts as real somewhere. */
    const regions = ['nordic', 'german-site', 'iberian-quarry', 'alpine', 'andes', 'arctic', 'sahara'];
    for (const a of ARCHETYPES.filter((x) => x.model && x.replaces?.length)) {
      const everOffered = new Set();
      let dropped = new Set();
      for (const region of regions) {
        const s = await plain({ region, archetype: a.id, settle: true, quality: { id: 'high', particles: 1.2, anisotropy: 4 }, });
        const sup = s.terrain.siteSuppression;
        for (const n of sup.offered) everOffered.add(n);
        if (sup.dropped.length > dropped.size) dropped = new Set(sup.dropped);
        assert.equal(sup.kitDeclared, a.replacesKit);
        s.terrain.dispose();
        active = null;
      }
      const dead = a.replaces.filter((n) => !everOffered.has(n));
      assert.deepEqual(dead, [],
        `${a.id}: \`replaces\` names no scatter ever builds: ${dead.join(', ')}. `
        + 'addInstances() offers ' + [...everOffered].sort().join(', '));
      console.log(`MEASURE ${a.id} replaces=[${a.replaces.join(' ')}] `
        + `bestCaseDropped=${dropped.size} of ${a.replaces.length}`);
    }
  });

  await test('a site model is measured against what it actually gives back', async () => {
    /* THE NUMBER blender/lib/site.py's BUDGET RULE IS WRITTEN AGAINST:
       "the archetype's terrain.js branch must give back at least as many calls
       as the .glb takes". Measured as mesh submissions under `terrain-root`
       with the model live minus the same build with the model 404'd. This is
       NOT a GPU draw-call count after culling — tools/shoot.mjs --headed is
       the only thing that measures that, and it needs the GPU.

       The ceilings below are the numbers measured on 2026-09-06 at baseline
       673f888. They are recorded so the overspend cannot grow unnoticed; they
       are NOT an endorsement that +2 is free. */
    /* THE WORST MEASURED VALUE FOR EACH, NOT A ROUND NUMBER ABOVE IT. A ceiling
       with slack in it is a gate that passes over the space it was meant to
       watch. Measured 2026-09-06 across nordic / german-site / iberian-quarry,
       27 cases; every one of the nine is NET ADDITIVE, which is the open budget
       problem recorded in blender/lib/site.py. Raise a number here only with a
       new measurement beside it.

         urban-plot              +1 +1 +0        marine-spread    +6 +6 +6
         infrastructure-corridor +3 +3 +3        well-pad         +5 +5 +5
         quarry-bench            +3 +3 +2        exploration-pad  +5 +5 +5
         open-pit-bench          +2 +2 +1        platform-deck    +4 +4 +4
         tunnel-portal           +4 +4 +3
    */
    const CEILING = {
      'urban-plot': 1, 'infrastructure-corridor': 3, 'quarry-bench': 3,
      'open-pit-bench': 2, 'tunnel-portal': 4, 'exploration-pad': 5,
      'well-pad': 5, 'platform-deck': 4, 'marine-spread': 6,
      // underground-drive is measured by the drive test, not here: its plane
      // has no procedural kit and no scatter, so a surface A/B is meaningless.
    };
    const measured = [];
    /* Surface planes only. An underground archetype never fetches its model on
       a surface build — `sitePlaneMatches()` refuses it, deliberately, so the
       game does not pull a drive model it cannot draw — so an A/B here would
       wait forever for a load that must never happen. The drive model is
       covered by its own test below. */
    for (const a of ARCHETYPES.filter((x) => x.model && x.plane !== 'underground')) {
      for (const region of ['nordic', 'german-site', 'iberian-quarry']) {
        const off = await plain({ region, archetype: a.id, mode: 'missing', settle: true, quality: { id: 'high', particles: 1.2, anisotropy: 4 }, });
        assert.ok(off.terrain.siteModel.problem, 'the 404 arm must actually fail');
        const without = meshCount(off.terrain);
        off.terrain.dispose(); active = null;

        const on = await plain({ region, archetype: a.id, settle: true, quality: { id: 'high', particles: 1.2, anisotropy: 4 }, });
        assert.equal(on.terrain.siteModel.model, a.model, `${a.id} did not load in ${region}`);
        const withModel = meshCount(on.terrain);
        const prims = on.terrain.siteModel.drawCalls;
        on.terrain.dispose(); active = null;

        const net = withModel - without;
        console.log(`MEASURE net ${a.id}@${region} without=${without} with=${withModel} `
          + `modelPrims=${prims} net=${net >= 0 ? '+' : ''}${net}`);
        measured.push({ id: a.id, region, net });
      }
    }
    /* Every archetype is MEASURED before any is judged, so one missing ceiling
       cannot hide the other nine numbers. */
    assert.ok(measured.length, 'measured no net costs at all');
    const problems = [];
    for (const m of measured) {
      const cap = CEILING[m.id];
      if (cap === undefined) { problems.push(`${m.id}: no recorded net-cost ceiling`); continue; }
      if (m.net > cap) problems.push(`${m.id}@${m.region}: net +${m.net} against a recorded ceiling of ${cap}`);
    }
    const worst = measured.reduce((x, y) => (y.net > x.net ? y : x));
    console.log(`MEASURE netWorst ${worst.id}@${worst.region} +${worst.net} `
      + `totalCases=${measured.length}`);
    assert.deepEqual(problems, [],
      `Site models cost more than recorded: ${problems.join(' | ')}. `
      + 'blender/lib/site.py THE BUDGET says the archetype\'s terrain.js branch must '
      + 'give back at least as many calls as the .glb takes. Every one of these is net '
      + 'ADDITIVE today; the ceilings only stop it getting worse.');
  });

  await test('rebuilds during one in-flight fetch arm exactly one rebuild', async () => {
    /* THE `mountPreview()` SHAPE, IN A PROMISE. `attachSiteModel()` runs at the
       tail of every rebuild, and it used to register a fresh `.then(rebuild)`
       on the same shared load promise each time — so N rebuilds while one fetch
       was open fired N full site rebuilds when it resolved. Measured before the
       fix at 12 churns: 12 extra rebuilds. The fetch itself was always
       de-duplicated; the continuation was not. */
    requireExport();
    const gate = deferred(), s = await setup({ fetchGate: gate }), t = s.terrain;
    await until(() => s.requests.length === 1, 'first request');
    let rebuilds = 0;
    const origAdd = t.root.add.bind(t.root);
    t.root.add = (...objs) => { for (const o of objs) if (o?.name === 'ground') rebuilds++; return origAdd(...objs); };
    const CHURN = 12;
    for (let i = 0; i < CHURN; i++) t.setRegion(i % 2 ? 'nordic' : 'german-site');
    /* 11, not 12: the first call names the region already standing and
       `setRegion()` returns early. Asserted exactly so the churn cannot quietly
       become a no-op and make the real assertion below meaningless. */
    assert.equal(rebuilds, CHURN - 1, 'the churn itself must really rebuild');
    rebuilds = 0;
    gate.resolve();
    await until(() => t.siteModel.model === SITE, 'model arrival');
    await drain();
    assert.equal(s.requests.length, 1, 'one fetch for one model');
    assert.equal(rebuilds, 1,
      `The single load fired ${rebuilds} rebuilds; exactly 1 is correct. `
      + 'attachSiteModel() is re-arming its continuation once per rebuild.');
  });

  await test('nothing self-seeds on an offshore deck', async () => {
    /* MEASURED before the fix, `.probe-sites.mjs` at region `nordic`:
       `platform-deck` and `marine-spread` each built eight InstancedMeshes —
       46 spruce trunks, 46 crowns, 14 birch, 22 outcrops, 40 stones, 260 grass
       tufts — at y = 0, which terrainHeight() pins to the deck plate. Invisible
       in `north-sea` only because every count in that region's `dress` is 0. */
    for (const a of ARCHETYPES.filter((x) => x.plane === 'offshore')) {
      for (const region of ['nordic', 'north-sea', 'iberian-quarry']) {
        const s = await plain({ region, archetype: a.id });
        const t = s.terrain;
        const scatter = [];
        t.root.traverse((o) => { if (o.isInstancedMesh && o.visible) scatter.push(`${o.name}x${o.count}`); });
        assert.deepEqual(scatter, [],
          `${a.id}@${region} scattered ${scatter.join(' ')} onto a steel deck.`);
        assert.ok(t.root.getObjectByName('deck'), `${a.id}@${region} built no deck`);
        assert.equal(t.heightAt(0, 0), 0, 'the deck plane is y = 0');
        /* MEASURED, `.probe-offshore.mjs`: the ground MESH still exists on an
           offshore plane — `buildGround()` builds it and sets
           `ground.visible = !onDeck()`. Assert the property that is actually
           true. (Never `assert.equal(someThreeObject, null)` here: node's
           assert then tries to inspect the whole scene graph to build a diff
           and dies with `RangeError: Array buffer allocation failed`, which
           reads exactly like an out-of-memory bug in the code under test. It
           cost a round trip.) */
        assert.equal(t.ground?.visible, false,
          `${a.id}@${region} left a visible ground plane over water`);
        t.dispose(); active = null;
      }
    }
  });

  await test('an archetype whose plane cannot be built is substituted, not faked', async () => {
    /* MEASURED, `.probe-arch-mix.mjs` over 19,200 real makeContract() results:
       527 pair the SURFACE method `core` with archetype `underground-drive`
       (327 iberian-quarry, 122 andes, 78 alpine). `underground-drive` carries
       nothing but `plane`, so all 527 rendered the region's UNTOUCHED biome —
       46 spruce and 260 grass tufts with a core rig parked in them. */
    const data = await import('../src/game/data.js');
    for (const region of ['iberian-quarry', 'andes', 'alpine']) {
      const s = await plain({ region, data });
      const t = s.terrain;
      t.update(0.016, { contract: { methodId: 'core', archetype: 'underground-drive',
        applicationId: 'mineral-exploration' } });
      const sub = t.archetypeSubstitution;
      assert.ok(sub, `${region}: an unbuildable archetype was accepted silently`);
      assert.equal(sub.wanted, 'underground-drive');
      assert.notEqual(t.archetype, 'underground-drive',
        `${region}: built a drive archetype with no drive`);
      assert.equal(t.drive, null);
      const built = ARCHETYPES.find((a) => a.id === t.archetype);
      assert.ok(built?.kit, `${region}: substituted to "${t.archetype}", which has no kit — `
        + 'that is the untouched region again, wearing a different name');
      console.log(`MEASURE substitution ${region} core/underground-drive -> ${t.archetype}`);
      t.dispose(); active = null;
    }
    // …and a method that DOES have a drive spec is untouched.
    const ok = await plain({ region: 'iberian-quarry', data });
    ok.terrain.update(0.016, { contract: { methodId: 'tunnel-jumbo',
      archetype: 'underground-drive', applicationId: 'tunnelling' } });
    assert.equal(ok.terrain.archetype, 'underground-drive');
    assert.equal(ok.terrain.archetypeSubstitution, null);
    assert.ok(ok.terrain.drive, 'a real drive method must still build its drive');
    ok.terrain.dispose(); active = null;
  });

  await test('an underground site model hangs in the drive, or nowhere', async () => {
    const ug = ARCHETYPES.find((a) => a.plane === 'underground');
    assert.ok(ug, 'no underground archetype in the table');
    const data = await import('../src/game/data.js');
    const s = await plain({ region: 'iberian-quarry', data, method: 'rockbolt', archetype: ug.id });
    const t = s.terrain;
    assert.ok(t.drive, 'rockbolt must build a drive');
    const drive = t.root.children.find((c) => c.name === 'drive');
    assert.ok(drive, 'driveGroup must be in the scene');
    if (!ug.model) {
      /* NOT a pass by omission. There is no underground-drive.glb yet, so the
         attach path cannot be exercised; say so in the output rather than
         letting an empty case read as a green one. */
      console.log(`MEASURE UNCOVERED "${ug.id}" declares no model, so the underground `
        + 'attach path is NOT exercised by this gate. It becomes covered the moment '
        + 'the archetype gains a `model` field.');
      assert.equal(t.siteModel.wanted, null);
      t.dispose(); active = null;
      return;
    }
    await until(() => t.siteModel.model || t.siteModel.problem, 'underground model settle');
    assert.equal(t.siteModel.problem, null, `underground model failed: ${t.siteModel.problem}`);
    /* RE-FIND the group. The model's arrival triggers a rebuild, and rebuild()
       calls disposeDrive() then buildDrive() — so the driveGroup captured
       before the load is a detached, disposed object and looking for the site
       in it reports "not attached" against a model that is correctly attached
       to the NEW one. That is a false finding from the instrument, not a bug in
       the code under test (ASTRA §5); it was one here for one run. */
    const liveDrive = t.root.children.find((c) => c.name === 'drive');
    assert.ok(liveDrive, 'the drive must still be in the scene after the model lands');
    const node = liveDrive.children.find((c) => c.name === `site:${ug.model}`);
    assert.ok(node, `${ug.model} must hang off driveGroup, not root — driveGroup carries the `
      + 'DRIVE_YAW 0.73787 rad that puts the tube on the camera bearing (core/env.js:306). '
      + 'Parented to root it renders 42.28 degrees across its own chamber.');
    assert.ok(!t.root.children.some((c) => c.name === `site:${ug.model}`),
      'the drive model must not also be parented to root');
    // leaving the drive must take the model with it
    t.setMethod('cfa');
    assert.ok(!t.root.getObjectByName(`site:${ug.model}`), 'the drive model outlived its drive');
    t.dispose(); active = null;
  });

  await test('no site model stands in the hole', async () => {
    /* THE COLLAR AND THE SEAM ARE LIVE GEOMETRY AND THE MODEL MUST NOT COVER
       THEM. `buildCollar()` (terrain.js) opens the hole as a cylinder of
       radius 0.36 m at grade, hangs the spoil ring at y 0.12 and the casing
       stub at y 0.34; `renderer.js:registerBands()` projects world (0,0,0)
       onto the seam row so the borehole in the section lines up with the mast
       above it. Anything a .glb puts inside that radius ABOVE grade is
       standing in the hole the player is drilling.

       THROAT_R is read from the code, not invented: CylinderGeometry(0.36,
       0.30, 2.2, ...) in buildCollar(). GRADE is the 2 cm band terrain.js
       already calls "at grade" where other agents place hardware.

       MEASURED with `.probe-collar2.mjs` at baseline 673f888:

         urban-plot     nearest vertex 14.091 m from the collar — clear
         quarry-bench   rawSteel      r 0.012 m, y 0.000 -> 0.620
                        safetyStripe  r 0.061 m, y 0.515 -> 0.645
                        blastedRock   r 0.234 m, y 0.355
                        gravel        r 0.320 m, y 0.005  (at grade, a marking)

       `quarry-bench` therefore breaches this today, in three materials, and it
       is recorded as a NAMED EXCEPTION rather than dissolved into a looser
       threshold. It is a REFERENCE archetype and its geometry must not
       regress here, so this gate does not fail it; it fails any archetype that
       is not on this list, and it fails quarry-bench if it gets WORSE. Whether
       0.012 m of steel over the collar is visible is a question for the GPU
       critic — this gate measures the geometry, not the frame. */
    const THROAT_R = 0.36;
    const GRADE = 0.02;
    const KNOWN = { 'quarry-bench': 0.012 };
    /* The suite's parseAsync wrapper records into the live scenario; this test
       drives the loader directly, so give it one to record into. */
    active = { mode: 'real', requests: [], parses: [], warnings: [], bufferReads: 0 };
    for (const a of ARCHETYPES.filter((x) => x.model)) {
      const bytes = siteBytes(a.model);
      assert.ok(bytes, `${a.model}: no export to measure`);
      const gltf = await new GLTFLoader().parseAsync(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
      gltf.scene.updateMatrixWorld(true);
      /* The anchor the runtime now actually consumes (terrain.js checks it on
         every load and warns if it is off the origin). Asserted here per
         MODELLED ARCHETYPE, not just for the one site the suite opens by name,
         so a new export cannot arrive without it. */
      /* NOT `getObjectByName('mount:site-collar')` on a raw parse. three.js's
         PropertyBinding.sanitizeNodeName DELETES `[ ] . : /`, so the node
         arrives called `mountsite-collar` and a prefix or exact-name lookup
         finds nothing — with no error, because nothing failed. terrain.js
         documents this at length and `restoreSiteNames()` un-sanitises it on
         the real load path; this test parses directly, so it must ask the
         glTF JSON, which still carries the authored name. Asserting the
         un-restored name here reported "no anchor" against a file that has
         one, which is a false finding from the instrument (ASTRA §5). */
      const declared = (gltf.parser.json.nodes || []).map((n) => n.name || '');
      assert.ok(declared.includes('mount:site-collar'),
        `${a.model}: no mount:site-collar anchor. blender/lib/site.py declares the `
        + 'origin to BE the collar; without the anchor the loader places the model at '
        + `(0,0,0) on trust and a mis-authored origin is silent. Declares: ${declared.filter(Boolean).join(', ')}`);
      const anchorNode = gltf.scene.getObjectByName('mountsite-collar')
        || gltf.scene.getObjectByName('mount:site-collar');
      assert.ok(anchorNode, `${a.model}: the collar anchor is declared but did not reach `
        + 'the scene graph');
      const anchorAt = anchorNode.getWorldPosition(new THREE.Vector3());
      const anchorOff = Math.hypot(anchorAt.x, anchorAt.y, anchorAt.z);
      assert.ok(anchorOff <= 0.01,
        `${a.model}: mount:site-collar is ${anchorOff.toFixed(4)} m from the origin`);
      const p = new THREE.Vector3();
      let minR = Infinity;
      const offenders = new Map();
      gltf.scene.traverse((o) => {
        if (!o.isMesh) return;
        const pos = o.geometry.getAttribute('position');
        assert.ok(pos?.count > 0, `${a.model}/${o.name}: no POSITION to measure`);
        for (let i = 0; i < pos.count; i++) {
          p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
          if (p.y <= GRADE) continue;          // ground marking, not an obstruction
          const r = Math.hypot(p.x, p.z);
          if (r < minR) minR = r;
          if (r < THROAT_R) {
            const cur = offenders.get(o.name);
            if (cur === undefined || r < cur) offenders.set(o.name, r);
          }
        }
      });
      console.log(`MEASURE collar ${a.model} nearestVertexAboveGrade=${minR.toFixed(3)}m `
        + `throatR=${THROAT_R} breaches=${offenders.size ? [...offenders].map(([n, r]) => `${n}@${r.toFixed(3)}`).join(' ') : 'none'}`);
      const allowed = KNOWN[a.model];
      if (allowed === undefined) {
        assert.equal(offenders.size, 0,
          `${a.model} puts geometry inside the ${THROAT_R} m collar throat above grade: `
          + `${[...offenders].map(([n, r]) => `${n} at r=${r.toFixed(3)}`).join(', ')}. `
          + 'The collar, the spoil ring, the casing stub and the section seam all live '
          + 'there and the model must leave them alone.');
      } else {
        assert.ok(minR >= allowed,
          `${a.model} now reaches r=${minR.toFixed(4)} m into the collar against a recorded `
          + `${allowed} m at baseline 673f888. This is a known, named exception and it must `
          + 'not get worse.');
      }
    }
  });

  await test('a surface model never attaches inside a drive', async () => {
    const s = await load(), t = s.terrain;
    liveNode(t);
    t.setMethod('rockbolt');
    assert.ok(t.drive);
    const drive = t.root.children.find((c) => c.name === 'drive');
    assert.ok(drive);
    let strays = 0;
    t.root.traverse((o) => { if (o.name === `site:${SITE}`) strays++; });
    assert.equal(strays, 0, 'the surface plot re-attached inside the drive');
    assert.equal(t.siteModel.model, null);
    assert.equal(t.siteModel.procedural, true);
    t.setMethod('cfa');
    liveNode(t);
    assert.equal(s.requests.length, 1, 'the round trip must reuse the parsed master');
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
