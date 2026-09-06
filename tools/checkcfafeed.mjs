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
/* THESE THREE LINES USED TO SAY THE OPPOSITE, AND THEY WERE TRUE WHEN WRITTEN.
   The first two are retired by the commit that adds the concrete lift: this
   gate no longer injects a decreasing `actionDepth` at all — it drives the
   ACTUAL two-stage programme to depth, turns it round, and follows the real
   carriage back up. A hardcoded claim inside a gate outlives the defect it
   describes (ASTRA §10), so they are replaced rather than left standing.
   The third is untouched: nothing here establishes stroke capacity. */
const report = { passed: false, fingerprints, cases: [], limitations: [
  'Authored stroke saturation does not establish capacity or above-grade auger clearance.',
  'The withdrawal rate driving this return is a machine cap, not a sourced figure — '
    + 'src/sim/drilling.js stages[1].liftRateSourced is false.',
  'Depths, target 18 m and tolerances below are synthetic NOT SOURCED test inputs.',
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
        /* ── THE ACTUAL RETURN, DRIVEN BY THE ACTUAL PROGRAMME ────────────
           This block used to inject a decreasing `actionDepth` into `pose()`
           and check that the carriage followed it. That proved the runtime
           ADAPTER reverses; it could not prove a return exists, and the sim
           it was standing in for published `stageCount: 1`. It now runs the
           real thing: the two-stage CFA programme is driven to depth at its
           own published optimum, turns round on its own, and the carriage is
           posed from `state.drill` exactly as the game poses it. */
        ok(state.drill.stageCount === 2, 'actual two-pass CFA programme');
        ok(state.drill.stageId === 'bore' && !state.drill.stageReverse, 'the bore is not a reverse pass');
        const drive = () => {
          const t = sim.getTelemetry();
          sim.setInput('feed', t.optimal.wob);
          sim.setInput('rotation', t.optimal.rpm);
          sim.setInput('flush', t.optimal.flush);
          sim.debug.stepFixed(10); sim.update(0);
        };
        let guard = 0;
        while (state.drill.stage === 0 && guard++ < 40000) drive();
        ok(guard < 40000, 'the programme actually turned round');
        ok(state.drill.stage === 1 && state.drill.stageId === 'concrete-lift'
           && state.drill.stageReverse === true, 'actual CFA concrete lift reached');
        // The pump is armed BEFORE the auger moves — the shipped fact in
        // FACTS_VERIFIED.md, and stages[1].armOnEnter is what makes it true.
        ok(Number.isFinite(state.drill.concreteBar) && state.drill.concreteBar > 0,
          'concrete is pumping at the moment the lift begins');
        const realReturn = [{ actionDepth: state.drill.actionDepth, coordinate: pose(state.drill) }];
        let pileLog = null;
        guard = 0;
        while (sim.active && guard++ < 60000) {
          drive();
          // Read the log while the pour is LIVE. `state.drill` retires these
          // fields when the pass ends, which is correct and is why a gate that
          // read them afterwards would be measuring an absence.
          if (state.drill.concreteRatio != null) {
            pileLog = { ratio: state.drill.concreteRatio, worst: state.drill.concreteWorstRatio,
              neckAt: state.drill.concreteNeckAt, bar: state.drill.concreteBar,
              head01: state.drill.concreteHead01, diaM: state.drill.pileDiaM,
              tipPressureKnown: state.drill.tipPressureKnown };
          }
          if (guard % 20 === 0) realReturn.push({ actionDepth: state.drill.actionDepth, coordinate: pose(state.drill) });
        }
        ok(guard < 60000, 'the lift finished rather than running out of budget');
        realReturn.push({ actionDepth: state.drill.actionDepth, coordinate: pose(state.drill) });
        // A gate over an empty set passes forever: measuring nothing is a failure.
        ok(realReturn.length >= 5, `the return was sampled ${realReturn.length} times, not asserted`);
        ok(realReturn.at(-1).actionDepth < realReturn[0].actionDepth - 1, 'actionDepth actually counted back down the hole');
        for (let i = 1; i < realReturn.length; i++) {
          ok((realReturn[i].coordinate - realReturn[i - 1].coordinate) * direction <= 1e-8, 'real return reverses feed');
        }
        // Tolerance, not identity: the last frame of a real run lands wherever
        // the fixed step left it, and demanding 1e-8 there would be asserting
        // the step size rather than the motion.
        ok(Math.abs(realReturn.at(-1).coordinate - rest[axis]) < 0.02,
          `real return ends at authored rest: ${realReturn.at(-1).coordinate} vs ${rest[axis]}`);
        result.actualStage = { stageCount: state.drill.stageCount, stageId: state.drill.stageId,
          stageReverse: state.drill.stageReverse, passM: state.drill.passM };
        result.realReturn = realReturn;
        /* The pile log, measured off the actual run. The ratio band is the one
           sourced number on this pass and a clean pour has to land inside it,
           or the model's own optimum is telling the player to neck the pile. */
        ok(pileLog && Number.isFinite(pileLog.ratio), 'the pile log was measured during the pour');
        ok(pileLog.tipPressureKnown === false, 'the tip pressure is published as NOT known');
        // A clean pour at the model's own optimum has to land inside the one
        // sourced band on this pass, or the green band is telling the player to
        // neck the pile. 1.15-1.20, [BUNGENSTAB] via research/CFA_CONCRETING_PROGRAMME.md.
        ok(pileLog.ratio >= 1.13 && pileLog.ratio <= 1.22,
          `optimum pour lands in the sourced volume-ratio band: ${pileLog.ratio}`);
        ok(pileLog.ratio > pileLog.neckAt, 'the optimum pour is above the theoretical bore volume');
        result.pileLog = pileLog;
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
console.log(`CFA feed: ${checks} checks passed across ${report.cases.length} actual builds (5 GLB, 2 procedural), 
driving the real two-stage CFA programme through its bore and its concrete lift.`);
