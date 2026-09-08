/** Actual-GLB and actual-simulator ram regression, no browser/GPU.
 * node tools/checkpilemotion.mjs
 * Synthetic NOT SOURCED controls/depths/tolerances are test inputs only.
 * No machine dimensions measured; tools/glbinfo.mjs remains that authority.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { createBus, createGameState, EVENTS } from '../src/core/contract.js';
import { RIGS, METHODS } from '../src/game/data.js';
import { ease } from '../src/core/motion.js';

const root = new URL('..', import.meta.url);
const paths = ['src/core/gltfRig.js', 'src/rig/rigFactory.js', 'src/sim/drilling.js',
  'src/core/motion.js', 'blender/piling_leader.py', 'blender/lib/rig.py',
  'public/models/piling-leader.glb', 'tools/checkpilemotion.mjs'];
const hash = p => createHash('sha256').update(readFileSync(new URL(p, root))).digest('hex');
const fingerprints = Object.fromEntries(paths.map(p => [p, hash(p)]));
const old = { document: globalThis.document, fetch: globalThis.fetch, info: console.info };
const materials = new Map(), systems = [], sims = [];
const assets = { material(kind) {
  if (!materials.has(kind)) { const m = new THREE.MeshStandardMaterial(); m.name = kind; materials.set(kind, m); }
  return materials.get(kind);
} };
let loader, checks = 0;
const ok = (v, label) => { assert.ok(v, label); checks++; };
const near = (a, b, label) => ok(Number.isFinite(a) && Math.abs(a - b) < 1e-9, `${label}: ${a} vs ${b}`);
const local = node => [...node.position.toArray(), ...node.quaternion.toArray(), ...node.scale.toArray()];
function meshIds(root) { const a = []; root.traverse(n => { if (n.isMesh) a.push([n.uuid, n.geometry.uuid, n.parent.uuid]); }); return a; }
let snapshots;
try {
  const bytes = readFileSync(new URL('public/models/piling-leader.glb', root));
  const raw = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  const ramRaw = raw.nodes.find(n => n.name === 'slide:hammer-ram');
  const carriageRaw = raw.nodes.find(n => n.name === 'slide:carriage');
  const python = readFileSync(new URL('blender/piling_leader.py', root), 'utf8');
  const stroke = Number(/^RAM_STROKE\s*=\s*([\d.]+)/m.exec(python)?.[1]);
  ok(Number.isFinite(stroke) && ramRaw.extras.stroke_m === stroke, 'actual GLB stroke equals existing Python authority');
  ok(carriageRaw.children.includes(raw.nodes.indexOf(ramRaw)), 'actual ram remains carriage child');
  ok(!ramRaw.rotation && !ramRaw.matrix && ramRaw.translation[0] === 0 && ramRaw.translation[2] === 0,
    'review mapped lift frame if actual export frame changes');
  assert.match(python, /ramn = empty\(NODE_SLIDE, 'hammer-ram', ham, \(0, 0, 1\.10\)\)/);
  assert.match(readFileSync(new URL('blender/lib/rig.py', root), 'utf8'), /export_yup=True/);
  globalThis.document = { baseURI: 'https://pile-motion.invalid/' };
  globalThis.fetch = async value => {
    const url = new URL(value);
    assert.equal(url.origin, 'https://pile-motion.invalid');
    assert.equal(url.pathname, '/models/piling-leader.glb');
    return new Response(bytes);
  };
  console.info = () => {};
  loader = createGltfRigs({ THREE, assets, data: { RIGS }, bus: createBus(), qs: new URLSearchParams('glb=strict') });
  await loader.load('piling-leader');
  const state = createGameState(); state.garage.rigId = 'piling-leader';
  state.garage.loadout.hammer = 'impact-hammer-9t';
  const scene = new THREE.Scene(), sectionScene = new THREE.Scene(), tip = new THREE.Object3D(); sectionScene.add(tip);
  const bus = createBus(); let built;
  const context = { THREE, assets, data: { RIGS }, state, scene, sectionScene, bus, EVENTS,
    quality: { id: 'low' }, qs: new URLSearchParams('glb=strict'),
    geology: { boreholeTip: tip, worldYForDepth: d => -d, holeRadiusAt: () => 0.15 },
    gltfRigs: { ...loader, builder(id) { const fn = loader.builder(id); return (...p) => { built = fn(...p); return built; }; } },
  };
  const sim = createDrillSim(context); sims.push(sim); context.sim = sim;
  const system = createRigSystem(context); systems.push(system); system.setMethod('driven-pile'); await system.init();
  ok(system.getSpec().source === 'glb', 'strict actual GLB builder');
  const H = built.dyn.impactRam, ram = built.root.getObjectByName('slide:hammer-ram');
  ok(H?.node === ram && H.axis === 'y' && H.strokeM === stroke, 'actual visible ram has mapped stroke contract');
  const rest = H.rest.clone(), rotation = ram.quaternion.toArray(), scale = ram.scale.toArray(), parent = ram.parent;
  snapshots = meshIds(built.root);
  const update = (d = state.drill, dt = 1 / 60) => {
    system.update(dt, { drill: d }); scene.updateMatrixWorld(true);
    ok(ram.matrixWorld.elements.every(Number.isFinite), 'finite ram world matrix');
    near(ram.position.x, rest.x, 'off-axis X preserved'); near(ram.position.z, rest.z, 'off-axis Z preserved');
    assert.deepEqual(ram.quaternion.toArray(), rotation); assert.deepEqual(ram.scale.toArray(), scale);
    assert.equal(ram.parent, parent);
  };
  const drive = { active: true, programme: 'driven-pile', phase: 'drilling', depth: 0,
    rpm: 0, wob: 0, torque: 0, hammerDropM: stroke / 2, hammerPhase01: 0 };
  for (const phase of [0, 0.125, 0.25, 0.499, 0.5, 0.75, 0.999]) {
    drive.hammerPhase01 = phase; update(drive);
    const lift = phase < 0.5 ? ease('reveal', phase * 2) : 1 - ease('dismiss', (phase - 0.5) * 2);
    near(ram.position.y, rest.y + lift * drive.hammerDropM, 'authoritative phase and drop');
  }
  drive.hammerPhase01 = 0.5; drive.hammerDropM = stroke * 10; update(drive);
  near(ram.position.y - rest.y, stroke, 'authored stroke bounds oversized telemetry');
  drive.hammerDropM = stroke / 2; update(drive); const frozen = local(ram);
  for (let i = 0; i < 90; i++) update(drive, 0.25);
  assert.deepEqual(local(ram), frozen, 'frozen sim phase holds despite nonzero renderer dt');
  for (const phase of ['pitch', 'dolly-change', 're-drive', 'dissipation', 'complete', 'rod-add']) {
    update({ ...drive, phase }); near(ram.position.y, rest.y, `no impact in ${phase}`);
  }
  for (const patch of [{ active: false }, { programme: 'cpt' }, { hammerPhase01: null },
    { hammerPhase01: NaN }, { hammerPhase01: 1 }, { hammerDropM: Infinity }, { hammerDropM: -1 }]) {
    update({ ...drive, ...patch }); near(ram.position.y, rest.y, 'invalid/inactive input rests');
  }
  sim.startHole({ methodId: 'driven-pile', method: METHODS.find(m => m.id === 'driven-pile'),
    targetDepth: 30, ground: ['clay'], seed: 4262 });
  ok(!Object.hasOwn(sim, 'state'), 'fixture uses actual simulator API, not a fake sim.state');
  let max = -Infinity, min = Infinity, drivenFrames = 0;
  for (let i = 0; i < 600; i++) {
    sim.update(1 / 60); update();
    if (state.drill.phase === 'drilling') {
      drivenFrames++; max = Math.max(max, ram.position.y); min = Math.min(min, ram.position.y);
      near(state.drill.hammerPhase01, sim.debug.state.blowPhase, 'published phase equals real pulse producer');
    }
  }
  ok(drivenFrames > 60 && max - min > stroke / 10, 'actual simulator drives substantial independent ram movement');
  const held = local(ram); for (let i = 0; i < 30; i++) update(state.drill, 0.5);
  assert.deepEqual(local(ram), held, 'actual frozen sim clock holds without a renderer accumulator');
  const taken = sim.pulse('takeSet'); ok(taken?.ok, 'actual take-set action accepted');
  sim.update(1 / 60); update(); // pulse changes sim state; the next tick publishes its mirror.
  let setFrames = 0, setMoved = false;
  for (let i = 0; i < 900 && state.drill.phase === 'take-set'; i++) {
    sim.update(1 / 60); update();
    if (state.drill.phase === 'take-set') {
      setFrames++;
      const s = sim.debug.state;
      near(state.drill.hammerPhase01, ((s.phaseT / s.phaseDur) * s.m.pile.setBlows) % 1,
        'take-set pose is the actual counted set cycle');
      setMoved ||= ram.position.y - rest.y > 0.05;
    }
  }
  ok(setFrames > 60 && setMoved, 'actual counted take-set moves the ram');
  sim.startHole({ methodId: 'driven-pile', method: METHODS.find(m => m.id === 'driven-pile'),
    targetDepth: 30, ground: ['clay'], seed: 523 }); update();
  near(ram.position.y, rest.y, 'new job first publication clears previous ram pose');
  sim.update(1 / 60); update();
  ok(state.drill.phase === 'pitch' && state.drill.hammerPhase01 === null, 'new job clears previous pulse through actual pitch phase');
  near(ram.position.y, rest.y, 'new job rests the ram');
  sim.abortHole('test-complete'); update(); near(ram.position.y, rest.y, 'completion/abort rests the ram');
  sim.startHole({ methodId: 'auger', method: METHODS.find(m => m.id === 'auger'),
    targetDepth: 5, ground: ['clay'], seed: 981 }); update();
  ok(!Object.hasOwn(state.drill, 'hammerPhase01'), 'programme transition retires impact phase instead of leaking it');
  near(ram.position.y, rest.y, 'unrelated actual programme cannot drive the old pile ram');
  assert.deepEqual(meshIds(built.root), snapshots, 'no new geometry, draw meshes or reparenting');
  console.log(JSON.stringify({ pass: true, checks, drivenFrames, setFrames,
    scope: 'Actual GLB local motion and actual simulator publication; no GPU/collision/whole pile assembly approval', fingerprints }));
} finally {
  for (const sim of sims) sim.dispose?.(); for (const system of systems) system.dispose(); loader?.dispose();
  for (const m of materials.values()) m.dispose();
  globalThis.document = old.document; globalThis.fetch = old.fetch; console.info = old.info;
}
for (const p of paths) assert.equal(hash(p), fingerprints[p], `source changed during gate: ${p}`);
