/** Actual-module CPU CFA feed regression. No GPU or alternative dimension ruler.
 * All depths, target and tolerances below are synthetic NOT SOURCED test inputs.
 * node tools/checkcfafeed.mjs [--json path]
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createBus, createGameState } from '../src/core/contract.js';
import { createDrillSim, TUNING } from '../src/sim/drilling.js';
import { RIGS, METHODS } from '../src/game/data.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const files = ['src/core/gltfRig.js', 'src/rig/rigFactory.js', 'src/sim/drilling.js',
  'public/models/cfa-rig.glb', 'public/models/rc-rig.glb'];
const hash = path => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
const fingerprints = Object.fromEntries(files.map(p => [p, hash(p)]));
const report = { passed: false, fingerprints, cases: [], limitations: [
  'CFA and cased-CFA currently have no simulated withdrawal or concrete pumping stage.',
  'Injected decreasing actionDepth checks the runtime return adapter, not a shipping CFA return programme.',
  'Authored stroke saturation does not establish capacity or above-grade auger clearance.',
] };
let checks = 0;
function ok(condition, message) { assert.ok(condition, message); checks++; }
function near(a, b, message) { ok(Number.isFinite(a) && Math.abs(a - b) < 1e-8, `${message}: ${a} vs ${b}`); }
const old = { fetch: globalThis.fetch, document: globalThis.document, info: console.info };
const mats = new Map(), systems = [];
const assets = { material(kind) {
  if (!mats.has(kind)) { const m = new THREE.MeshStandardMaterial(); m.name = kind; mats.set(kind, m); }
  return mats.get(kind);
} };
let loader;
try {
  globalThis.document = { baseURI: 'https://cfa-feed.invalid/' };
  globalThis.fetch = async value => {
    const url = new URL(value);
    assert.equal(url.origin, 'https://cfa-feed.invalid');
    assert.ok(/^\/models\/(cfa-rig|rc-rig)\.glb$/.test(url.pathname));
    return new Response(readFileSync(resolve(root, 'public' + url.pathname)));
  };
  console.info = () => {};
  loader = createGltfRigs({ THREE, assets, data: { RIGS }, bus: createBus(), qs: new URLSearchParams('glb=strict') });
  await loader.load('cfa-rig'); await loader.load('rc-rig');
  for (const [rigId, method] of [['cfa-rig', 'cfa'], ['cfa-rig', 'cased-cfa'],
    ['cfa-rig', 'rotary-kelly'], ['cfa-rig', 'auger'], ['rc-rig', 'rc']]) {
    let built;
    const scene = new THREE.Scene(), sectionScene = new THREE.Scene();
    const tip = new THREE.Object3D(); sectionScene.add(tip);
    const bus = createBus(), state = createGameState(); state.garage.rigId = rigId;
    const ctx = { THREE, assets, data: { RIGS }, bus, state, scene, sectionScene,
      quality: { id: 'low' }, qs: new URLSearchParams('glb=strict'),
      geology: { boreholeTip: tip, worldYForDepth: n => -n, holeRadiusAt: () => 0.15 },
      gltfRigs: { ...loader, builder(id) { const fn = loader.builder(id);
        return (...args) => { built = fn(...args); return built; }; } } };
    const rig = createRigSystem(ctx); systems.push(rig); rig.setMethod(method); await rig.init();
    ok(rig.getSpec().source === 'glb', 'actual GLB required');
    const dyn = built.dyn, axis = dyn.carriageAxis, r = dyn.carriageRange;
    const rest = dyn.carriageRest.clone(), rake = dyn.workTilt;
    const framing = JSON.stringify(rig.getSpec().glb.feedFraming);
    const coordinate = () => dyn.carriage.position[axis];
    const pose = drill => {
      for (let i = 0; i < 3; i++) { rig.update(1 / 60, { drill }); scene.updateMatrixWorld(true); }
      ok(dyn.carriage.matrixWorld.elements.every(Number.isFinite), 'finite carriage transform');
      for (const other of ['x', 'y', 'z'].filter(a => a !== axis)) near(dyn.carriage.position[other], rest[other], 'off-axis rest');
      near(dyn.mastPivot.rotation.x, rake, 'authored work rake retained');
      ok(JSON.stringify(rig.getSpec().glb.feedFraming) === framing, 'feedFraming immutable');
      return coordinate();
    };
    const result = { rigId, method, axis, range: r, rest: rest.toArray(), samples: [] };
    report.cases.push(result);
    if (rigId === 'cfa-rig' && ['cfa', 'cased-cfa'].includes(method)) {
      ok(dyn.continuousAugerFeed === true, 'authored continuous auger mapping');
      const sim = createDrillSim({ state, bus: createBus() });
      try {
        sim.startHole({ methodId: method, method: METHODS.find(m => m.id === method),
          targetDepth: 18, seed: 4242, ground: ['clay'] });
        ok(TUNING.methods[method].rodLength === 0, 'sim declares continuous feed');
        const direction = Math.sign(r[1] - r[0]);
        let previous = null;
        for (const depth of [0, 1.5, 2.999, 3.001, 8.5, 15, 17, 18]) {
          sim.debug.setDepth(depth);
          const d = state.drill;
          near(d.actionDepth, depth, 'actual sim actionDepth');
          const at = pose(d);
          const expected = Math.max(Math.min(...r), Math.min(Math.max(...r), rest[axis] + direction * depth));
          near(at, expected, 'physical feed displacement from rest');
          if (previous != null) ok((at - previous) * direction >= -1e-8, 'monotonic continuous feed');
          result.samples.push({ depth, actionDepth: d.actionDepth, coordinate: at }); previous = at;
        }
        near(Math.abs(result.samples[3].coordinate - result.samples[2].coordinate), 0.002, 'no 3 m rod-cycle jump');
        near(result.samples[0].coordinate, rest[axis], 'depth zero preserves authored rest');
        // The REAL CFA mirror currently never enters a reverse or pump stage.
        ok(state.drill.stageCount === 1 && !state.drill.stageReverse, 'actual single-pass CFA state');
        result.actualStage = { stageCount: state.drill.stageCount, stageId: state.drill.stageId, stageReverse: state.drill.stageReverse };
        const injectedReturn = [15, 8.5, 3.001, 2.999, 0].map(actionDepth => ({ actionDepth,
          coordinate: pose({ ...state.drill, active: true, depth: 18, actionDepth, stageReverse: true }) }));
        for (let i = 1; i < injectedReturn.length; i++) ok((injectedReturn[i].coordinate - injectedReturn[i - 1].coordinate) * direction <= 1e-8, 'injected return reverses feed');
        near(injectedReturn.at(-1).coordinate, rest[axis], 'injected return ends at authored rest');
        result.injectedReturn = injectedReturn;
        near(pose({ ...state.drill, active: false, actionDepth: 0 }), rest[axis], 'inactive zero-depth pose preserves rest');
        ok(Number.isFinite(pose({ ...state.drill, actionDepth: NaN })), 'nonfinite action state cannot corrupt transform');
      } finally { sim.dispose(); }
    } else {
      for (const depth of [0, 1.5, 2.999, 3.001]) {
        const at = pose({ active: true, depth, actionDepth: depth, rpm: 0, wob: 0, torque: 0, wear: 0, phase: 'drilling' });
        const f = (depth % (dyn.rodLen || 3)) / (dyn.rodLen || 3);
        near(at, r[0] + (r[1] - r[0]) * f, 'non-CFA feed unchanged');
        result.samples.push({ depth, coordinate: at });
      }
    }
  }
  // The fallback has its own authored carriage range. Exercise its real build
  // as well: a generic fixed depth/14 normalizer must not survive in CFA mode.
  for (const method of ['cfa', 'cased-cfa']) {
    const state = createGameState(); state.garage.rigId = 'cfa-rig';
    const scene = new THREE.Scene(), sectionScene = new THREE.Scene(), tip = new THREE.Object3D();
    sectionScene.add(tip);
    const rig = createRigSystem({ THREE, assets, data: { RIGS }, bus: createBus(), state,
      scene, sectionScene, quality: { id: 'low' }, qs: new URLSearchParams('glb=off'),
      geology: { boreholeTip: tip, worldYForDepth: n => -n, holeRadiusAt: () => 0.15 } });
    systems.push(rig); rig.setMethod(method); await rig.init();
    ok(rig.getSpec().source === 'procedural', 'real procedural fallback required');
    const carriage = rig.group.getObjectByName('carriage');
    ok(!!carriage, 'actual CFA builder carriage is observable');
    const sample = actionDepth => {
      rig.update(1 / 60, { drill: { active: true, depth: 18, actionDepth,
        rpm: 0, wob: 0, torque: 0, phase: 'drilling' } });
      ok(Number.isFinite(carriage.position.y), 'finite fallback feed'); return carriage.position.y;
    };
    const samples = [0, 1, 2.999, 3.001, 8.5, 14, 14.5, 15].map(actionDepth => ({ actionDepth, coordinate: sample(actionDepth) }));
    near(samples[0].coordinate - samples[1].coordinate, 1, 'fallback one metre advances one metre');
    near(samples[2].coordinate - samples[3].coordinate, 0.002, 'fallback rod-cycle continuity');
    near(samples[5].coordinate - samples[6].coordinate, 0.5, 'fallback does not saturate at invented 14 m');
    near(sample(0), samples[0].coordinate, 'fallback actionDepth return');
    report.cases.push({ rigId: 'cfa-rig', method, source: 'procedural', samples });
  }
  for (const p of files) ok(hash(p) === fingerprints[p], `source remained stable: ${p}`);
  report.checks = checks; report.passed = true;
} finally {
  for (const system of systems) system.dispose();
  loader?.dispose?.(); for (const material of mats.values()) material.dispose();
  globalThis.fetch = old.fetch; globalThis.document = old.document; console.info = old.info;
}
const args = process.argv.slice(2), i = args.indexOf('--json');
if (i >= 0) { assert.ok(args[i + 1], '--json requires a path'); const path = resolve(root, args[i + 1]);
  mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(report, null, 2) + '\n'); }
console.log(`CFA feed: ${checks} checks passed across ${report.cases.length} actual builds (5 GLB, 2 procedural). No simulated CFA return/pumping stage exists.`);
