/** Actual GLB piling feed contract, CPU only. Synthetic test depths are NOT
 * SOURCED operator inputs; no geometry dimensions are measured here. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createBus, createGameState, EVENTS } from '../src/core/contract.js';
import { RIGS } from '../src/game/data.js';

const paths = ['src/core/gltfRig.js', 'src/rig/rigFactory.js', 'src/sim/drilling.js',
  'public/models/piling-leader.glb', 'blender/piling_leader.py', 'tools/checkpileplacement.mjs'];
const hash = p => createHash('sha256').update(readFileSync(new URL('../' + p, import.meta.url))).digest('hex');
const hashes = Object.fromEntries(paths.map(p => [p, hash(p)]));
const bytes = readFileSync(new URL('../public/models/piling-leader.glb', import.meta.url));
const jsonLength = bytes.readUInt32LE(12);
const json = JSON.parse(bytes.subarray(20, 20 + jsonLength));
const raw = json.nodes.find(n => n.name === 'slide:carriage');
const restY = raw.translation[1], lo = raw.extras.travel_lo_m, hi = raw.extras.travel_hi_m;
const python = readFileSync(new URL('../blender/piling_leader.py', import.meta.url), 'utf8');
assert.match(python, /ham\['travel_lo_m'\] = 1\.40 - HAMMER_BOT/);
assert.match(python, /ham\['travel_hi_m'\] = \(LEADER_TOP - 2\.60\) - HAMMER_L - HAMMER_BOT/);
assert.equal(raw.extras.axis, 'z');
let served = bytes, loader, system, checks = 0;
const saved = { document: globalThis.document, fetch: globalThis.fetch, info: console.info, error: console.error };
const materials = new Map(), assets = { material(name) {
  if (!materials.has(name)) materials.set(name, new THREE.MeshStandardMaterial());
  return materials.get(name);
} };
const near = (a, b, label) => { checks++; assert(Number.isFinite(a) && Math.abs(a - b) < 1e-9, `${label}: ${a} != ${b}`); };
const local = n => [...n.position.toArray(), ...n.quaternion.toArray(), ...n.scale.toArray()];
const makeLoader = () => createGltfRigs({ THREE, assets, data: { RIGS }, bus: createBus(), qs: new URLSearchParams('glb=strict') });
try {
  globalThis.document = { baseURI: 'https://pile-placement.invalid/' };
  globalThis.fetch = async url => { assert.equal(new URL(url).pathname, '/models/piling-leader.glb'); return new Response(served); };
  console.info = () => {}; console.error = () => {};
  loader = makeLoader(); await loader.load('piling-leader');
  const state = createGameState(); state.garage.rigId = 'piling-leader';
  const scene = new THREE.Scene(), sectionScene = new THREE.Scene(), tip = new THREE.Object3D(); sectionScene.add(tip);
  let built;
  system = createRigSystem({ THREE, assets, scene, sectionScene, state, bus: createBus(), EVENTS,
    data: { RIGS }, quality: { id: 'low' }, qs: new URLSearchParams('glb=strict'),
    geology: { boreholeTip: tip, worldYForDepth: d => -d, holeRadiusAt: () => 0.15 },
    gltfRigs: { ...loader, builder(id) { const fn = loader.builder(id); return (...args) => (built = fn(...args)); } },
  });
  system.setMethod('driven-pile'); await system.init();
  const d = built.dyn, carriage = d.carriage, ram = d.impactRam.node;
  const children = [...carriage.children], childLocal = children.map(local);
  const fixed = [...carriage.quaternion.toArray(), ...carriage.scale.toArray()];
  assert.equal(d.continuousPileFeed, true);
  near(d.carriageRange[0], restY + hi, 'upper authored offset endpoint');
  near(d.carriageRange[1], restY + lo, 'lower authored offset endpoint');
  const rows = [];
  for (const phase of ['drilling', 'pitch', 'take-set', 'dolly-change', 're-drive']) {
    for (const depth of [0, 2.999999, 3, 3.000001, -lo, hi - lo, 100]) {
      // Beat phases do not accept new penetration. Enter each sampled depth
      // through drilling before checking the same depth in a stationary beat.
      system.update(1 / 60, { drill: { active: true, phase: 'drilling', programme: 'driven-pile', depth,
        hammerPhase01: 0, hammerDropM: d.impactRam.strokeM, rpm: 0, wob: 0, torque: 0 } });
      system.update(1 / 60, { drill: { active: true, phase, programme: 'driven-pile', depth,
        hammerPhase01: 0, hammerDropM: d.impactRam.strokeM, rpm: 0, wob: 0, torque: 0 } });
      scene.updateMatrixWorld(true);
      const expected = Math.max(restY + lo, restY - depth);
      near(carriage.position.y, expected, `${phase}/${depth} follows penetration from rest`);
      near(carriage.position.x, d.carriageRest.x, 'carriage off-axis X');
      near(carriage.position.z, d.carriageRest.z, 'carriage off-axis Z');
      assert.deepEqual([...carriage.quaternion.toArray(), ...carriage.scale.toArray()], fixed);
      for (let i = 0; i < children.length; i++) {
        assert.equal(children[i].parent, carriage); assert.deepEqual(local(children[i]), childLocal[i]);
        const expectedWorld = carriage.localToWorld(children[i].position.clone());
        const world = children[i].getWorldPosition(new THREE.Vector3());
        near(world.x, expectedWorld.x, 'child world X'); near(world.y, expectedWorld.y, 'child world Y'); near(world.z, expectedWorld.z, 'child world Z');
      }
      rows.push({ phase, depth, carriageY: carriage.position.y, ramLocalY: ram.position.y });
    }
  }
  const failures = [];
  const mutations = [
    ['missing low', x => { delete x.travel_lo_m; }], ['missing high', x => { delete x.travel_hi_m; }],
    ['missing span', x => { delete x.travel_m; }], ['string low', x => { x.travel_lo_m = '-13.2'; }],
    ['null high', x => { x.travel_hi_m = null; }], ['reversed', x => { x.travel_lo_m = x.travel_hi_m + 1; }],
    ['rest below span', x => { x.travel_lo_m = 1; }], ['rest above span', x => { x.travel_hi_m = -1; }],
    ['wrong span', x => { x.travel_m += 1; }], ['negative span', x => { x.travel_m *= -1; }],
    ['wrong legacy axis', x => { x.axis = 'x'; }], ['ambiguous explicit', x => { x.travel_axis = 'y'; }],
  ];
  for (const [name, change] of mutations) {
    const modified = structuredClone(json); change(modified.nodes.find(n => n.name === 'slide:carriage').extras);
    const rawJSON = Buffer.from(JSON.stringify(modified)), padded = Buffer.alloc(Math.ceil(rawJSON.length / 4) * 4, 0x20); rawJSON.copy(padded);
    const header = Buffer.from(bytes.subarray(0, 20)), tail = bytes.subarray(20 + jsonLength);
    header.writeUInt32LE(20 + padded.length + tail.length, 8); header.writeUInt32LE(padded.length, 12);
    served = Buffer.concat([header, padded, tail]); const bad = makeLoader();
    try { await assert.rejects(() => bad.load('piling-leader'), /travel|offset|endpoint/); failures.push(name); }
    finally { bad.dispose(); }
  }
  console.log(JSON.stringify({ pass: true, checks, cases: rows, metadataRejections: failures, hashes,
    limits: 'CPU authored endpoint and parent/child placement only. Static pile/rope and visual cap/casing clearance remain unresolved.' }));
} finally {
  system?.dispose(); loader?.dispose(); for (const m of materials.values()) m.dispose();
  globalThis.document = saved.document; globalThis.fetch = saved.fetch; console.info = saved.info; console.error = saved.error;
}
for (const p of paths) assert.equal(hash(p), hashes[p], `source changed during gate: ${p}`);
