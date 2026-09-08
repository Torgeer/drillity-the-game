/** CPU audit of actual GLB action consumers, not a visual-quality gate.
 * node tools/auditmechanismactions.mjs [--rig id]
 * Synthetic NOT SOURCED control inputs exercise the public renderer interface;
 * no geometry dimensions are measured. tools/glbinfo.mjs remains that authority.
 * Local joint motion is separated from world motion inherited from a parent.
 * JSON goes to stdout; this tool never writes an evidence file or uses a GPU.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createBus, EVENTS } from '../src/core/contract.js';
import { RIGS } from '../src/game/data.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2), at = args.indexOf('--rig');
const rows = at < 0 ? RIGS : RIGS.filter(r => r.id === args[at + 1]);
assert.ok(rows.length, 'empty fleet must not pass');
const hash = data => createHash('sha256').update(data).digest('hex');
const paths = ['src/core/gltfRig.js', 'src/core/gltfAnim.js', 'src/rig/rigFactory.js',
  'src/rig/tools.js', 'src/core/contract.js', 'src/game/data.js', 'src/sim/drilling.js', 'src/main.js',
  'tools/auditmechanismactions.mjs', 'blender/lib/rig.py', 'blender/piling_leader.py',
  'blender/cpt_unit.py', 'blender/sonic_truck.py', 'blender/cable_percussion.py',
  ...rows.map(r => `public/models/${r.id}.glb`)];
const fingerprints = Object.fromEntries(paths.map(p => [p, hash(readFileSync(resolve(ROOT, p)))]));
const saved = { document: globalThis.document, fetch: globalThis.fetch,
  info: console.info, warn: console.warn, error: console.error };
const materials = new Map(), bytes = new Map(), diagnostics = [], builds = [], results = [];
const assets = { material(kind) {
  if (!materials.has(kind)) { const m = new THREE.MeshStandardMaterial(); m.name = kind; materials.set(kind, m); }
  return materials.get(kind);
} };
const specializedFields = ['body', 'percussion', 'oscillator', 'carousel', 'loader',
  'kelly', 'augerDriven', 'pileDriven', 'pileHammer', 'impactRam', 'pileNode', 'leaderTele',
  'spudder', 'bailer', 'sptHammer', 'cptPush', 'pushBreak', 'connection',
  'jumbo', 'ringFan', 'boltCycle', 'rcSample'];
const phaseSets = {
  'driven-pile': ['take-set', 'dolly-change', 'pitch', 're-drive'],
  'cable-tool': ['bailing-run'], rc: ['blow-down'],
  rockbolt: ['bolt-install', 'bolt-plate', 'bolt-torque', 'bolt-ream', 'bolt-inspect'],
  longhole: ['ring-index'], 'tunnel-jumbo': ['charging', 'firing', 'mucking'],
  'site-investigation': ['spt-drive', 'clean-out'],
};
function sceneVisibleMeshes(root) {
  let count = 0;
  root.traverse(n => {
    if (!n.isMesh || !n.geometry) return;
    for (let p = n; p; p = p.parent) if (!p.visible) return;
    const ms = Array.isArray(n.material) ? n.material : [n.material];
    if (ms.some(m => m?.visible && m.opacity > 0)
      && (n.geometry.index?.count || n.geometry.attributes.position?.count || 0) > 0) count++;
  });
  return count;
}
const pose = n => [...n.position.toArray(), ...n.quaternion.toArray(), ...n.scale.toArray()];
const changed = (a, b) => a.some((v, i) => Math.abs(v - b[i]) > 1e-8);
let loader;
try {
  globalThis.document = { baseURI: 'https://mechanism-audit.invalid/' };
  globalThis.fetch = async value => {
    const url = new URL(value), match = /^\/models\/([^/]+)\.glb$/.exec(url.pathname);
    assert.equal(url.origin, 'https://mechanism-audit.invalid');
    assert.ok(match && bytes.has(match[1]), 'external or unowned asset fetch forbidden');
    return new Response(bytes.get(match[1]));
  };
  for (const name of ['info', 'warn', 'error']) console[name] = (...v) => diagnostics.push(v.map(String).join(' '));
  loader = createGltfRigs({ THREE, assets, data: { RIGS }, bus: createBus(), qs: new URLSearchParams('glb=strict') });
  for (const row of rows) {
    bytes.set(row.id, readFileSync(resolve(ROOT, `public/models/${row.id}.glb`)));
    await loader.load(row.id);
  }
  for (const row of rows) for (const method of row.methods) {
    let built, nodes, authored;
    const scene = new THREE.Scene(), sectionScene = new THREE.Scene(), tip = new THREE.Object3D();
    sectionScene.add(tip);
    const bus = createBus();
    const system = createRigSystem({ THREE, assets, scene, sectionScene, bus, EVENTS,
      data: { RIGS }, state: { garage: { rigId: row.id }, settings: {} },
      quality: { id: 'low' }, qs: new URLSearchParams('glb=strict'),
      geology: { boreholeTip: tip, worldYForDepth: d => -d, holeRadiusAt: () => 0.15 },
      gltfRigs: { ...loader, builder(id) {
        const fn = loader.builder(id);
        return (...params) => {
          built = fn(...params); nodes = [];
          built.root.traverse(n => { if (/^(pivot|slide):/.test(n.name)) nodes.push(n); });
          authored = nodes.map(n => ({ name: n.name, parent: n.parent?.name,
            extras: { ...n.userData }, authoredVisibleMeshes: sceneVisibleMeshes(n) }));
          return built;
        };
      } },
    });
    builds.push(system); system.setMethod(method); await system.init();
    assert.equal(system.getSpec().source, 'glb', 'procedural fallback invalidates evidence');
    assert.equal(system.getRigId(), row.id);
    const buf = bytes.get(row.id), glb = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString());
    const drill = { active: true, methodId: method, programme: row.id === 'cpt-unit' ? 'cpt' : method,
      depth: 0.2, actionDepth: 0.2, target: 6, phase: 'drilling', rpm: 0.6,
      wob: 0.5, torque: 0.3, wear: 0, hammerBpm: 60, hammerDropM: 0.6, hammerPhase01: 0,
      progress01: 0.1, sptRelease: 1, sptBpm: 30 };
    const update = () => { system.update(1 / 60, { drill }); scene.updateMatrixWorld(true); sectionScene.updateMatrixWorld(true); };
    for (let i = 0; i < 30; i++) update();
    const record = { rig: row.id, method, clips: glb.animations?.length || 0,
      authoredHooks: authored, presentSpecializedFields: specializedFields.filter(k => !!built.dyn[k]),
      basicMappings: Object.fromEntries(['mastPivot', 'mastUpper', 'carriage', 'spindle']
        .map(k => [k, built.dyn[k]?.name || null])), segments: [] };
    function segment(label, count, trigger = () => {}, tick = () => {}) {
      const before = new Map(nodes.map(n => [n, { local: pose(n), world: n.matrixWorld.elements.slice() }]));
      const local = new Set(), world = new Set(), visible = new Set();
      trigger();
      for (let frame = 0; frame < count; frame++) {
        tick(frame); update();
        for (const n of nodes) {
          assert.ok(n.matrixWorld.elements.every(Number.isFinite), `${row.id}/${n.name}: finite matrix`);
          if (changed(before.get(n).local, pose(n))) local.add(n.name);
          if (changed(before.get(n).world, n.matrixWorld.elements)) {
            world.add(n.name); if (sceneVisibleMeshes(n) > 0) visible.add(n.name);
          }
        }
      }
      record.segments.push({ label, sampledFrames: count, localMotion: [...local],
        worldMotion: [...world], sceneVisibleWorldMotion: [...visible] });
    }
    segment('drilling-input', 120, () => {}, frame => {
      drill.depth = drill.actionDepth = 0.2 + frame / 120;
      drill.hammerPhase01 = frame / 120;
    });
    segment('ROD_ADDED event', 240, () => bus.emit(EVENTS.ROD_ADDED, { count: 2, depth: drill.depth, kind: 'add' }));
    system.skipAnimation();
    segment('playTripOut public API', 240, () => { void system.playTripOut(3); });
    system.skipAnimation();
    const phases = row.id === 'cpt-unit' ? ['dissipation'] : phaseSets[method] || [];
    for (const phase of phases) {
      drill.phase = 'drilling'; update();
      segment(`phase:${phase}`, 480, () => { drill.phase = phase; }, frame => {
        drill.hammerPhase01 = (frame % 120) / 120;
      });
      system.skipAnimation();
    }
    results.push(record); system.dispose(); builds.pop();
  }
} finally {
  for (const system of builds) system.dispose(); loader?.dispose();
  for (const material of materials.values()) material.dispose();
  Object.assign(globalThis, { document: saved.document, fetch: saved.fetch });
  console.info = saved.info; console.warn = saved.warn; console.error = saved.error;
}
for (const path of paths) assert.equal(hash(readFileSync(resolve(ROOT, path))), fingerprints[path],
  `source or asset changed during audit: ${path}; rerun after integration settles`);
assert.equal(new Set(results.map(r => r.rig)).size, rows.length);
console.log(JSON.stringify({ generatedAt: new Date().toISOString(), fingerprints,
  scope: 'Actual strict GLB loader and public rig event/API/phase consumers; synthetic inputs; CPU local/world transforms and scene-visible geometry, no rendered pixel, dimension, physics or completion claims.',
  rigs: rows.length, methodPairs: results.length, results, diagnostics }, null, 2));
