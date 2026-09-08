#!/usr/bin/env node
/** Independent condition-provenance audit. Public simulation controls and a
 * pre/post-state oracle; no telemetry condition counter is used as its oracle.
 * Small contracts are boundary fixtures, not physical/tender acceptance. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, basename, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseAst } from 'vite';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { getMethod, getItem, getRegion, RIGS, CERTS, defaultLoadoutFor } from '../src/game/data.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { createSampleLedger, applySampleEvent, restoreSampleLedger, readSampleOperatingConditions } from '../src/sim/sample-ledger.js';
import { readSampleProduct, sampleOperatingRecord } from '../src/sim/sample-product.js';
import { sampleUnitCard } from '../src/ui/screens/site.js';

const paths = ['src/core/contract.js', 'src/game/data.js', 'src/game/equipment-support.js', 'src/game/economy.js',
  'src/game/progression.js', 'src/sim/drilling.js', 'src/sim/sample-ledger.js',
  'src/sim/sample-product.js', 'src/ui/screens/site.js', 'src/ui/screens/results.js', 'src/world/geology.js'];
const hash = x => createHash('sha256').update(x).digest('hex');
const hashes = () => Object.fromEntries(paths.map(p => [p, hash(readFileSync(new URL('../' + p, import.meta.url)))]));
const beforeHashes = hashes(), clone = x => JSON.parse(JSON.stringify(x));
// This committed dependency closure is LF-equivalent to the original local
// snapshot. Read exact git blobs, never current source, for the negative and
// economic oracle. A complete clone needs no sibling worktree or local artifact.
const BASELINE_REVISION = '859fde2023e531d44e5ff334355e4d24e4c4d92c';
const BASELINE_BLOBS = {
  'src/sim/drilling.js': '53d520fd1775402c5bead9871677612e5c7eeeb35d1857d840b03c4811840d9c',
  'src/core/contract.js': 'a374211146b86c5dbc5ea88eb28a49e0505805fa486d585a1531e810414549b5',
  'src/game/data.js': '899f9d285c4d157df7876916a84f7b640116c14092bdf7dff79ac5cea7d8be7c',
  'src/game/economy.js': '4673e38601f65284e693ba8531c5e563aa4659606ddf1eb61a266a9fa11e3026',
  'src/game/equipment-support.js': 'a1b908fbaf6ee8b1ea2b00014c65fe3f4de3d2efc882581acb2d83bec6d3aee9',
  'src/sim/sample-ledger.js': '6d17b4da3b4906f12c1d1fc7c0f272a83ab701b1ebd5392bc1194ff8dd73f45e',
  'src/sim/sample-product.js': '29992d3fd17348722a8b4c583da59bc82b757a6078406903a4a6450c131d0f0d',
};
let baselineDirectory = null, baselineEvidence = null;
async function historicalSimulator() {
  const repo = fileURLToPath(new URL('../', import.meta.url));
  const sources = Object.fromEntries(Object.entries(BASELINE_BLOBS).map(([path, expected]) => {
    const source = execFileSync('git', ['show', `${BASELINE_REVISION}:${path}`], { cwd: repo, maxBuffer: 4 * 1024 * 1024 });
    assert.equal(hash(source), expected, `pinned historical blob ${path}`); return [path, source];
  }));
  baselineDirectory = mkdtempSync(join(tmpdir(), 'drillity-sample-conditions-'));
  writeFileSync(join(baselineDirectory, 'package.json'), '{"type":"module"}\n');
  for (const [path, source] of Object.entries(sources)) {
    const target = resolve(baselineDirectory, path);
    assert.ok(!relative(baselineDirectory, target).startsWith('..'), 'temporary output stays in its assigned directory');
    mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, source);
  }
  baselineEvidence = { revision: BASELINE_REVISION, blobs: { ...BASELINE_BLOBS },
    source: 'exact git blobs; seven-module simulation dependency closure', negativeControl: 'historical simulator produces no operatingConditions' };
  return (await import(pathToFileURL(join(baselineDirectory, 'src/sim/drilling.js')).href)).createDrillSim;
}
function cleanHistoricalSimulator() {
  if (!baselineDirectory) return;
  const target = resolve(baselineDirectory);
  assert.equal(dirname(target), resolve(tmpdir()), 'cleanup only targets the freshly allocated temporary directory');
  assert.ok(basename(target).startsWith('drillity-sample-conditions-'));
  rmSync(target, { recursive: true, force: true }); baselineDirectory = null;
}
const tests = [], evidence = [], fixtures = [], H = 1 / 120;
const test = (name, run) => tests.push({ name, run });
const eqTime = (a, b, label) => assert.ok(Math.abs(a - b) < 1e-8, `${label}: ${a} versus ${b}`);
const limits = method => ({ effectiveFlushMin: method === 'core' ? .45 : null, heatMax: .85, torqueMax: 1 });
const obs = (method = 'core', extra = {}) => ({ elapsedSec: 1, effectiveFlush01: .1, heat01: .9, torque01: 1.2, limits: limits(method), ...extra });
const fresh = (methodId = 'core') => createSampleLedger({ methodId, runId: 4, attemptId: 7, targetDepthM: 2.25, barrelCapacityM: 1.5 });
const event = (l, type, fields = {}) => ({ type, runId: l.runId, attemptId: l.attemptId, sequence: (l.lastEvent?.sequence ?? 0) + 1, ...fields });
function apply(l, type, fields) { const r = applySampleEvent(l, event(l, type, fields)); assert.equal(r.ok, true, r.reason); return r.ledger; }
const restore = x => restoreSampleLedger(x, { runId: x.runId, attemptId: x.attemptId });
function unchanged(l, fields) { const r = applySampleEvent(l, event(l, 'advance', fields)); assert.equal(r.ok, false); assert.equal(r.ledger, l); }

test('observed intervals record independent overlapping exposure; legacy remains absent; sonic flush remains null', () => {
  for (const method of ['core', 'sonic']) {
    const old = apply(fresh(method), 'advance', { toDepthM: .5 });
    assert.equal(Object.hasOwn(restore(clone(old)).intervals[0], 'operatingConditions'), false);
    assert.equal(sampleOperatingRecord(old.intervals[0], method), null);
    const l = apply(fresh(method), 'advance', { toDepthM: .5, observation: obs(method) });
    const c = l.intervals[0].operatingConditions;
    assert.equal(c.version, 1); assert.equal(c.basis, 'authored-simulation-thresholds');
    assert.equal(c.clock, 'player-simulation-seconds'); assert.equal(c.cuttingSec, 1);
    assert.equal(c.lowFlushSec, method === 'core' ? 1 : null);
    assert.equal(c.overheatSec, 1); assert.equal(c.overtorqueSec, 1);
    assert.ok(c.overheatSec + c.overtorqueSec > c.cuttingSec);
    assert.deepEqual(restore(clone(l)), l);
  }
});

test('same-interval recording mode and thresholds cannot change; invalid contributions reject atomically', () => {
  const plain = apply(fresh(), 'advance', { toDepthM: .1 });
  const recorded = apply(fresh(), 'advance', { toDepthM: .1, observation: obs() });
  unchanged(plain, { toDepthM: .2, observation: obs() });
  unchanged(recorded, { toDepthM: .2 });
  unchanged(recorded, { toDepthM: .2, observation: obs('core', { limits: { ...limits('core'), heatMax: .8 } }) });
  for (const bad of [0, -1, NaN, Infinity, '1', null]) unchanged(recorded, { toDepthM: .2, observation: obs('core', { elapsedSec: bad }) });
  for (const field of ['effectiveFlush01', 'heat01', 'torque01']) for (const bad of [-1, NaN, Infinity, '1', null])
    unchanged(recorded, { toDepthM: .2, observation: obs('core', { [field]: bad }) });
  unchanged(recorded, { toDepthM: .2, observation: obs('core', { inventedQuality: 1 }) });
  unchanged(recorded, { toDepthM: .2, observation: obs('core', { limits: limits('sonic') }) });
  unchanged(recorded, { toDepthM: 1.50001, observation: obs() });
  const huge = apply(fresh(), 'advance', { toDepthM: .1, observation: obs('core', { elapsedSec: Number.MAX_VALUE }) });
  unchanged(huge, { toDepthM: .2, observation: obs('core', { elapsedSec: Number.MAX_VALUE }) });
});

test('nested JSON key order preserves latest-event replay, while changed observations conflict', () => {
  const l = apply(fresh(), 'advance', { toDepthM: .5, observation: obs() });
  const saved = clone(l), o = saved.lastEvent.observation;
  saved.lastEvent.observation = { limits: { torqueMax: o.limits.torqueMax, heatMax: o.limits.heatMax, effectiveFlushMin: o.limits.effectiveFlushMin },
    torque01: o.torque01, heat01: o.heat01, effectiveFlush01: o.effectiveFlush01, elapsedSec: o.elapsedSec };
  const r = restore(saved), replay = applySampleEvent(r, l.lastEvent);
  assert.equal(replay.ok, true); assert.equal(replay.changed, false); assert.equal(replay.ledger, r);
  for (const field of ['elapsedSec', 'effectiveFlush01', 'heat01', 'torque01']) {
    const changed = clone(l.lastEvent); changed.observation[field] += .01;
    assert.equal(applySampleEvent(r, changed).reason, 'sequence-conflict');
  }
});

test('restore rejects impossible latest-observation residuals and phantom first-event history', () => {
  const l = apply(fresh(), 'advance', { toDepthM: .5, observation: obs('core', { effectiveFlush01: 1, heat01: 0, torque01: 0 }) });
  for (const field of ['lowFlushSec', 'overheatSec', 'overtorqueSec']) {
    const bad = clone(l); bad.lastEvent.sequence = 2;
    bad.intervals[0].operatingConditions.steps = 2;
    bad.intervals[0].operatingConditions.cuttingSec = 2; bad.intervals[0].operatingConditions[field] = 2;
    assert.throws(() => restore(bad), `residual ${field} cannot exceed one prior second`);
  }
  const phantom = clone(l); phantom.intervals[0].operatingConditions.cuttingSec = 2;
  assert.throws(() => restore(phantom), 'sequence-one advance has no prior cutting contribution');
});

test('malformed detached condition records and restored receipts cannot masquerade as observations', () => {
  const l = apply(fresh(), 'advance', { toDepthM: .5, observation: obs() });
  for (const mutate of [c => c.version = 2, c => c.basis = 'measured-recovery', c => c.clock = 'field-seconds',
    c => c.cuttingSec = 0, c => c.lowFlushSec = null, c => c.overheatSec = 1.01,
    c => c.overtorqueSec = -1, c => c.cuttingSec = '1', c => c.limits.heatMax = Infinity,
    c => c.limits.extra = 1, c => c.quality = 100, c => c.steps = 0, c => c.steps = 1.5]) {
    const bad = clone(l); mutate(bad.intervals[0].operatingConditions);
    assert.equal(readSampleOperatingConditions(bad.intervals[0].operatingConditions, 'core'), null);
    assert.throws(() => restore(bad));
  }
  const sonic = apply(fresh('sonic'), 'advance', { toDepthM: .5, observation: obs('sonic') });
  const bad = clone(sonic); bad.intervals[0].operatingConditions.lowFlushSec = 0;
  assert.throws(() => restore(bad));
  const detached = readSampleOperatingConditions(l.intervals[0].operatingConditions, 'core');
  assert.ok(Object.isFrozen(detached) && Object.isFrozen(detached.limits));
});

test('a closed interval cannot borrow later event sequences to invent earlier observed steps', () => {
  for (const method of ['core', 'sonic']) {
    let l = apply(fresh(method), 'advance', { toDepthM: .5, observation: obs(method) });
    if (method === 'sonic') l = apply(l, 'case', { toDepthM: .5 });
    l = apply(l, 'retrieve', { toDepthM: .5, provenance: method === 'core' ? 'wireline-inner-tube' : 'sonic-barrel-extraction' });
    l = apply(l, 'handle', { intervalIndex: 1, container: method === 'core' ? 'box' : 'sleeve' });
    const later = applySampleEvent(l, { ...event(l, 'advance', { toDepthM: .75, observation: obs(method) }), sequence: 20 });
    assert.equal(later.ok, true); const bad = clone(later.ledger);
    bad.intervals[0].operatingConditions.steps = 2;
    assert.throws(() => restore(bad), 'only one advance occurred before this interval was retrieved');
  }
});

test('valid published open records survive JSON restore at floating-point exposure boundaries', () => {
  for (const method of ['core', 'sonic']) {
    let l = fresh(method);
    // All conditions were active before a single calm cutting step. There is
    // no invented tolerance or expected aggregate in this oracle: every tested
    // snapshot was just issued successfully by the production reducer itself.
    for (let i = 1; i <= 1000; i++) {
      l = apply(l, 'advance', { toDepthM: i / 2001, observation: obs(method, { elapsedSec: H }) });
      const calm = apply(l, 'advance', { toDepthM: (i + .5) / 2001,
        observation: obs(method, { elapsedSec: H, effectiveFlush01: 1, heat01: 0, torque01: 0 }) });
      assert.deepEqual(restore(clone(calm)), calm, `accepted ${method} snapshot after ${i + 1} steps must restore`);
    }
    for (const durations of [[.01, 1e30], [1e30, .01], [1e-20, 1], [1, 1e-20], [Number.MIN_VALUE, 1]]) {
      let wide = fresh(method);
      for (let i = 0; i < durations.length; i++) {
        const result = applySampleEvent(wide, event(wide, 'advance', { toDepthM: (i + 1) / 2,
          observation: obs(method, { elapsedSec: durations[i], effectiveFlush01: i ? 1 : .1, heat01: i ? 0 : .9, torque01: i ? 0 : 1.1 }) }));
        if (!result.ok) { assert.equal(result.ledger, wide); break; }
        wide = result.ledger;
        assert.deepEqual(restore(clone(wide)), wide, 'every accepted finite duration pair must produce a restorable record');
      }
    }
  }
});

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWarn = console.warn, warnings = [];
console.warn = (...xs) => warnings.push(xs.map(String).join(' '));
async function fixture(methodId = 'core', targetDepth = 1.75, factory = createDrillSim, beforeCompletion, options = {}) {
  const storage = new Map(), store = { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k) };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus(), ctx = { state, bus, rand: makeRandom(713), SCENES };
  if (beforeCompletion) bus.on(EVENTS.HOLE_COMPLETE, beforeCompletion);
  const progression = ctx.progression = createProgression(ctx); await progression.init();
  const method = getMethod(methodId);
  state.player.level = 60; state.player.money = 1e8; state.player.certs = CERTS.map(c => c.id);
  state.unlocked.methods = [methodId]; state.unlocked.rigs = RIGS.map(r => r.id);
  state.garage.rigId = method.rigIds[0]; state.garage.loadout = defaultLoadoutFor(methodId, 60);
  state.garage.owned = Object.values(state.garage.loadout).filter(Boolean);
  // Catalogue-sourced nominal NWL bore; no crown OD or manufacturing clearance
  // is inferred. The former 96 mm generic method fixture must now be refused.
  if (methodId === 'core') assert.equal(getItem(state.garage.loadout.bit).sampling.holeDiameterMm, 75.7);
  const contract = { id: `condition-critic-${methodId}`, title: 'Condition boundary fixture', methodId,
    regionId: 'nordic', applicationId: 'mineral-exploration', archetype: 'exploration-pad', targetDepth,
    holes: 1, metres: targetDepth, holeDia: methodId === 'core' ? 75.7 : method.nominalDia, payout: 10000,
    bonus: { time: 1000, quality: 1000 }, deadlineHours: 24, reputationReward: 10, requiredCerts: [],
    difficulty: 1, hardness: .2, abrasivity: .2, seed: 194,
    ground: [{ id: methodId === 'core' ? 'limestone' : 'marl', top: 0, bottom: 1000 }], flushMedium: method.flushMedium };
  options.beforeAcceptance?.({ contract, state, progression, ctx });
  const accepted = progression.acceptContract(contract); assert.equal(accepted.ok, true, JSON.stringify(accepted));
  const canonical = clone(state.contract);
  options.beforeStart?.({ contract, state, progression, ctx });
  let paused = false; ctx.ui = { get gameplayPaused() { return paused; } }; state.scene = SCENES.SITE;
  const completions = []; bus.on(EVENTS.HOLE_COMPLETE, x => completions.push(x));
  const sim = ctx.sim = factory(ctx); sim.init(); assert.ok(sim.startHole(contract));
  const f = { ctx, state, bus, progression, sim, contract: canonical, offered: contract, completions, storage, oracle: [], steps: 0,
    excluded: {}, get paused() { return paused; }, set paused(v) { paused = v; },
    selectStore() { Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store }); } };
  fixtures.push(f); return f;
}
function tick(f, policy = 'optimal') {
  const t = f.sim.getTelemetry(), s = f.sim.debug.state;
  const adverse = policy === 'adverse' && t.timeSec < 20;
  f.sim.setInput('feed', adverse || policy === 'torque' ? 1 : t.optimal.wob);
  f.sim.setInput('rpm', adverse ? 1 : policy === 'torque' ? 0 : t.optimal.rpm);
  f.sim.setInput('flush', adverse || policy === 'low' ? .05 : t.optimal.flush);
  if (t.rodAdd && !t.rodAdd.hit && t.rodAdd.t >= t.rodAdd.windowStart && t.rodAdd.t <= t.rodAdd.windowEnd) f.sim.pulse('rodStab');
  if (t.jam?.state === 'stuck' && t.jam.rescue?.goodNow) f.sim.pulse('jamRescue');
  const before = { heat: s.heat, depth: s.holeDepth, phase: s.phase, drillSec: s.drillSec };
  f.sim.update(H, f.state); f.steps++;
  const after = f.sim.debug.state;
  if (after.holeDepth > before.depth) {
    const capacity = f.sim.getTelemetry().programme.barrelCapacityM;
    const index = Math.floor(before.depth / capacity + 1e-12);
    const c = f.oracle[index] ||= { steps: 0, cuttingSec: 0, lowFlushSec: f.contract.methodId === 'core' ? 0 : null, overheatSec: 0, overtorqueSec: 0 };
    c.steps++; c.cuttingSec += H;
    if (c.lowFlushSec !== null && after.act.flush * after.returns < after.m.flushCritical) c.lowFlushSec += H;
    if (before.heat > f.sim.debug.tuning.heat.overheatAt) c.overheatSec += H;
    if (after.torque > f.sim.debug.tuning.torque.overLimit) c.overtorqueSec += H;
    eqTime(after.drillSec - before.drillSec, H, 'independent drill-time predicate');
  } else {
    f.excluded[before.phase] = (f.excluded[before.phase] ?? 0) + 1;
    eqTime(after.drillSec, before.drillSec, 'noncutting drill clock');
  }
}
function until(f, predicate, policy = 'optimal', limit = 120000) {
  for (let i = 0; i < limit; i++) {
    const t = f.sim.getTelemetry(); if (predicate(t)) return t;
    assert.ok(f.sim.active, `stopped early at ${t.phase}`); tick(f, policy);
  }
  throw Error(`condition fixture timed out: ${f.sim.getTelemetry().phase}`);
}
const boundary = (f, policy) => until(f, t => t.phase === 'sample-wait', policy);
function operation(f, name, policy = 'optimal') {
  const old = clone(f.state.drill.sampleProduct.intervals.map(x => x.operatingConditions));
  const start = f.sim.pulse(name); assert.equal(start.ok, true, `${name}: ${JSON.stringify(start)}`); const phase = f.sim.getTelemetry().phase;
  assert.equal(f.sim.pulse(name).ok, false, 'replayed start stays busy');
  until(f, t => t.phase !== phase, policy);
  assert.deepEqual(clone(f.state.drill.sampleProduct.intervals.map(x => x.operatingConditions)), old, 'handling cannot manufacture cutting evidence');
}
function handle(f, policy) {
  if (f.contract.methodId === 'sonic') operation(f, 'sampleCase', policy);
  operation(f, 'sampleRetrieve', policy); operation(f, 'sampleHandle', policy);
}
function finish(f, policy = 'optimal') {
  while (f.sim.active) { boundary(f, policy); handle(f, policy); }
  assert.equal(f.completions.length, 1);
  const payload = f.completions[0], receipt = f.progression.settlementForCompletion(payload);
  assert.ok(receipt); return { payload, receipt };
}
function assertOracle(f, product = f.state.drill.sampleProduct) {
  assert.equal(product.intervals.length, f.oracle.length);
  product.intervals.forEach((row, i) => {
    const c = row.operatingConditions; assert.ok(c, `recorded interval ${i + 1}`);
    for (const [field, value] of Object.entries(f.oracle[i])) value === null
      ? assert.equal(c[field], null) : eqTime(c[field], value, `interval ${i + 1} ${field}`);
    assert.deepEqual(c.limits, limits(f.contract.methodId));
    assert.ok(Object.isFrozen(c) && Object.isFrozen(c.limits));
  });
  eqTime(f.oracle.reduce((n, c) => n + c.cuttingSec, 0), f.sim.debug.state.drillSec, 'all accepted cutting steps conserved');
}

test('composed core sizing refuses the old 96 mm fixture before acceptance or attempt creation', async () => {
  const f = await fixture('core', .25, createDrillSim, undefined, {
    beforeAcceptance({ contract, state, progression, ctx }) {
      const wrong = { ...contract, holeDia: 96 }, snapshot = () => JSON.stringify({ state, run: progression.run });
      const before = snapshot();
      assert.equal(progression.previewContract(wrong).code, 'sample-tender-diameter-mismatch');
      assert.equal(progression.acceptContract(wrong).code, 'sample-tender-diameter-mismatch');
      assert.equal(snapshot(), before, 'rejected tender cannot alter game state');
      const preview = createDrillSim(ctx); preview.init();
      try {
        const beforeStart = snapshot();
        assert.throws(() => preview.startHole(wrong), error => error.code === 'sample-tender-diameter-mismatch');
        assert.equal(snapshot(), beforeStart, 'direct start refuses before issuing an attempt');
      } finally { preview.dispose(); }
    },
  });
  finish(f); assertOracle(f);
});

test('accepted core terms isolate sampling depth, ground, exposure and payment from a mutated caller copy', async () => {
  const outcomes = [];
  for (const mutate of [false, true]) {
    const f = await fixture('core', .25, createDrillSim, undefined, {
      beforeStart({ contract }) {
        if (!mutate) return;
        contract.targetDepth = 10; contract.holeDia = 96; contract.payout = 1e9;
        contract.seed = 9999; contract.methodId = 'sonic'; contract.ground[0].id = 'granite';
      },
    });
    assert.equal(f.sim.debug.state.contract, f.state.contract);
    assert.equal(f.sim.getTelemetry().target, .25); assert.equal(f.sim.getTelemetry().programme.kind, 'coreSample');
    assert.equal(f.state.contract.ground[0].id, 'limestone'); assert.ok(Object.isFrozen(f.state.contract.ground[0]));
    // The other composed geology patch applies only to accepted auger soil
    // columns. Execute its actual capture function to check this method boundary
    // without initializing any rendering or claiming section-layout coverage.
    const source = readFileSync(new URL('../src/world/geology.js', import.meta.url), 'utf8'), nodes = [];
    const visit = n => { if (!n || typeof n !== 'object') return; nodes.push(n); for (const v of Object.values(n)) Array.isArray(v) ? v.forEach(visit) : visit(v); };
    visit(parseAst(source));
    const captures = nodes.filter(n => n.type === 'FunctionDeclaration' && n.id?.name === 'captureSoilWorkOrder');
    assert.equal(captures.length, 1);
    const capture = new Function('ctx', 'getMethod', 'getRegion', `let soilWorkOrder = null; return (${source.slice(captures[0].start, captures[0].end)});`)(f.ctx, getMethod, getRegion);
    assert.equal(capture(f.state.contract), null, 'accepted auger soil changes cannot reinterpret a core sample column');
    const { payload, receipt } = finish(f, 'low'); assertOracle(f);
    outcomes.push({ conditions: payload.sampleProduct.intervals.map(x => x.operatingConditions),
      depth: receipt.depth, grade: payload.grade, costs: receipt.costs, revenue: receipt.revenue, net: receipt.net });
  }
  assert.deepEqual(outcomes[1], outcomes[0]);
});

test('real public optimal and adverse controls causally differ and match the independent pre/post-step oracle', async () => {
  for (const method of ['core', 'sonic']) {
    const outcomes = [];
    for (const policy of ['optimal', method === 'core' ? 'low' : 'adverse']) {
      const f = await fixture(method, method === 'core' ? 1.75 : 6.25), { receipt } = finish(f, policy);
      assertOracle(f, receipt.sampleProduct);
      assert.equal(f.completions[0].breakdown.quality, null);
      assert.equal(f.completions[0].breakdown.weights.quality, 0);
      outcomes.push(f.oracle.reduce((n, c) => n + (method === 'core' ? c.lowFlushSec : c.overheatSec), 0));
      evidence.push({ method, policy, target: f.contract.targetDepth, oracle: f.oracle,
        excludedSteps: f.excluded, steps: f.steps, quality: f.completions[0].breakdown.quality,
        qualityWeight: f.completions[0].breakdown.weights.quality });
    }
    assert.ok(outcomes[1] > outcomes[0] + 1, `${method}: real adverse controls must change the recorded exposure`);
  }
});

test('waiting, paused operations, compatible trip and separate rod connection add no condition time', async () => {
  const f = await fixture('core', 3.25);
  until(f, t => t.depth > .25);
  const beforeTrip = clone(f.state.drill.sampleProduct);
  const pending = f.sim.changeBit(f.state.garage.loadout.bit);
  until(f, t => t.phase === 'drilling'); assert.equal((await pending).ok, true);
  assert.deepEqual(f.state.drill.sampleProduct, beforeTrip);
  boundary(f); const first = f.state.drill.sampleProduct.intervals[0];
  for (let i = 0; i < 100; i++) tick(f, 'low');
  assert.equal(f.state.drill.sampleProduct.intervals[0], first);
  assert.equal(f.sim.pulse('sampleRetrieve').ok, true); tick(f);
  f.paused = true; const paused = clone(f.state.drill.sampleProduct);
  for (let i = 0; i < 100; i++) tick(f, 'low');
  assert.deepEqual(f.state.drill.sampleProduct, paused); f.paused = false;
  until(f, t => t.phase !== 'sample-retrieve'); operation(f, 'sampleHandle');
  const frozenFirst = f.state.drill.sampleProduct.intervals[0], serialized = JSON.stringify(frozenFirst);
  finish(f, 'low'); assertOracle(f);
  assert.equal(JSON.stringify(frozenFirst), serialized);
  assert.ok(f.excluded['rod-add'] > 0 && f.excluded['tripping-out'] > 0);
  assert.ok(f.excluded['sample-retrieve'] > 100 && f.excluded['sample-handle'] > 0);
});

test('one tiny positive final slice records exactly one player-time step, independent of its physical length', async () => {
  for (const method of ['core', 'sonic']) for (const target of [.000001, .000002]) {
    const f = await fixture(method, target); finish(f); assertOracle(f);
    assert.equal(f.oracle[0].cuttingSec, H); assert.equal(f.state.drill.sampleProduct.drilledDepthM, target);
  }
});

test('abort and restart discard old attempt observations; interrupted handling never leaks an old receipt', async () => {
  const f = await fixture('core', .25); boundary(f, 'low');
  const old = f.state.drill.sampleProduct, oldJSON = JSON.stringify(old);
  assert.equal(f.sim.pulse('sampleRetrieve').ok, true); tick(f);
  f.sim.abortHole(); assert.equal(f.completions.length, 0);
  assert.ok(f.sim.startHole(f.contract)); assert.notEqual(f.state.drill.sampleProduct.attemptId, old.attemptId);
  assert.equal(f.state.drill.sampleProduct.intervals.length, 0); f.oracle = [];
  finish(f); assertOracle(f); assert.equal(JSON.stringify(old), oldJSON);
  assert.notEqual(f.completions[0].sampleProduct.attemptId, old.attemptId);
});

test('real settlement and JSON save/reload preserve immutable condition evidence; replay pays only once', async () => {
  for (const method of ['core', 'sonic']) {
    const f = await fixture(method, .25), { payload, receipt } = finish(f, 'low');
    assertOracle(f, receipt.sampleProduct); assert.deepEqual(receipt.sampleProduct, payload.sampleProduct);
    const player = clone(f.state.player); f.bus.emit(EVENTS.HOLE_COMPLETE, payload); assert.deepEqual(f.state.player, player);
    f.selectStore(); assert.equal(f.progression.save(), true); assert.equal(f.progression.save(), true);
    const state = createGameState(), bus = createBus(), progression = createProgression({ state, bus, rand: makeRandom(50), SCENES });
    try { await progression.init(); assert.deepEqual(state.player.career.ledger[0].sampleProduct, receipt.sampleProduct); }
    finally { progression.dispose(); }
    const primary = JSON.parse(f.storage.get(SAVE_KEY));
    primary.player.career.ledger[0].sampleProduct.intervals[0].operatingConditions.overheatSec = -1;
    f.storage.set(SAVE_KEY, JSON.stringify(primary)); assert.ok(f.storage.has(SAVE_BACKUP_KEY));
    const restored = createGameState(), backup = createProgression({ state: restored, bus: createBus(), rand: makeRandom(60), SCENES });
    try { await backup.init(); assert.deepEqual(restored.player.career.ledger[0].sampleProduct, receipt.sampleProduct); }
    finally { backup.dispose(); }
    const legacy = clone(receipt.sampleProduct); legacy.intervals.forEach(x => delete x.operatingConditions);
    assert.ok(readSampleProduct(legacy, { methodId: method, depth: payload.depth, runId: payload.runId, attemptId: payload.attemptId }));
    assert.equal(sampleOperatingRecord(legacy.intervals[0], method), null);
  }
});

test('corrupt new observation evidence is refused before money, experience or career progress', async () => {
  const f = await fixture('core', .25, createDrillSim, payload => {
    const forged = clone(payload.sampleProduct); forged.intervals[0].operatingConditions.overheatSec = -1;
    payload.sampleProduct = forged;
  });
  const player = clone(f.state.player); boundary(f); handle(f);
  assert.equal(f.completions.length, 1); assert.equal(f.progression.settlementForCompletion(f.completions[0]), null);
  assert.deepEqual(f.state.player, player);
});

// Execute the actual Results sample block with small DOM-shaped collectors.
// This tests real presentation source without claiming browser layout coverage.
function resultsRows(product, basis) {
  const source = readFileSync(new URL('../src/ui/screens/results.js', import.meta.url), 'utf8'), nodes = [];
  const visit = x => { if (!x || typeof x !== 'object') return; nodes.push(x); for (const y of Object.values(x)) Array.isArray(y) ? y.forEach(visit) : visit(y); };
  visit(parseAst(source));
  const matches = nodes.filter(n => n.type === 'IfStatement' && n.test?.type === 'MemberExpression'
    && n.test.object?.name === 'sm' && n.test.property?.name === 'sampleProduct');
  assert.equal(matches.length, 1);
  const rows = [], node = () => ({ appendChild() {} });
  const C = { h: node, SpecRow: (label, value) => { rows.push([label, value]); return node(); } };
  new Function('sm', 'C', 'scoreList', 'sampleOperatingRecord', source.slice(matches[0].start, matches[0].end))(
    { sampleProduct: product, sampleCapacityBasis: basis }, C, node(), sampleOperatingRecord);
  return rows;
}
test('actual Site and Results distinguish unrecorded material from game conditions and player time', async () => {
  for (const method of ['core', 'sonic']) {
    const f = await fixture(method, .25); boundary(f, 'low');
    if (method === 'sonic') operation(f, 'sampleCase'); operation(f, 'sampleRetrieve');
    const card = sampleUnitCard(f.sim.getTelemetry().programme);
    assert.match(card.note, /play time/); assert.match(card.note, /unmeasured/i); assert.equal(card.rows.length, 4);
    operation(f, 'sampleHandle'); const product = f.completions[0].sampleProduct;
    const rows = resultsRows(product, f.completions[0].sampleCapacityBasis), text = JSON.stringify(rows);
    assert.match(text, /drilling play time/); assert.match(text, /Game thresholds/); assert.match(text, /Material recovery","Unmeasured/);
    assert.doesNotMatch(text, /\d(?:\.\d+)?%|TCR|RQD|intactness/);
    const legacy = clone(product); legacy.intervals.forEach(x => delete x.operatingConditions);
    assert.ok(resultsRows(legacy, f.completions[0].sampleCapacityBasis).some(row => row[0] === 'Operating record' && row[1] === 'Unrecorded'));
  }
});

test('identical public controls retain baseline grade and settlement amounts without a new quality policy', async () => {
  const baseline = await historicalSimulator();
  for (const method of ['core', 'sonic']) {
    const results = [];
    for (const factory of [baseline, createDrillSim]) {
      const f = await fixture(method, .25, factory), { payload, receipt } = finish(f, 'low');
      if (factory === baseline) assert.ok(receipt.sampleProduct.intervals.every(row => !Object.hasOwn(row, 'operatingConditions')),
        'negative historical control must genuinely lack the new observation producer');
      const clean = clone(receipt); delete clean.sampleProduct; delete clean.runId; delete clean.attemptId;
      const player = clone(f.state.player); player.career.ledger.forEach(row => { delete row.sampleProduct; delete row.runId; delete row.attemptId; });
      results.push({ clean, player, grade: payload.grade, quality: payload.breakdown.quality,
        qualityWeight: payload.breakdown.weights.quality,
        accuracy: payload.accuracy, timeSec: payload.timeSec, costs: payload.costs });
    }
    assert.deepEqual(results[1], results[0], `${method}: passive provenance cannot alter economics or grading`);
  }
});

const outcomes = [];
try {
  for (const t of tests) {
    const start = performance.now();
    try { await t.run(); outcomes.push({ name: t.name, pass: true, ms: performance.now() - start }); console.log(`PASS ${t.name}`); }
    catch (error) { outcomes.push({ name: t.name, pass: false, error: error.stack }); console.error(`FAIL ${t.name}\n${error.stack}`); }
  }
} finally {
  fixtures.forEach(f => { f.sim.dispose(); f.progression.dispose(); }); console.warn = originalWarn;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete globalThis.localStorage;
  cleanHistoricalSimulator();
}
const afterHashes = hashes(), sourceStable = JSON.stringify(beforeHashes) === JSON.stringify(afterHashes);
const report = { createdAt: new Date().toISOString(), command: 'node tools/checksampleconditions-adversarial.mjs',
  toolHash: hash(readFileSync(new URL(import.meta.url))), sourceStable, beforeHashes, afterHashes,
  economicBaseline: baselineEvidence, historicalTemporaryDirectoryCleaned: baselineDirectory === null,
  passed: outcomes.filter(x => x.pass).length, total: outcomes.length, outcomes, evidence, warnings,
  scope: 'CPU provenance oracle only; no physical sample quality, tender compatibility, browser or device acceptance' };
writeFileSync(new URL('../research/sample-conditions-composed-adversarial-2026-09-08.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(`${report.passed}/${report.total} condition groups; sourceStable=${sourceStable}`);
if (report.passed !== report.total || !sourceStable) process.exitCode = 1;
