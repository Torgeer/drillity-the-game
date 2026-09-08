#!/usr/bin/env node
/** Independent sampling consumer acceptance. Real sim/progression/public inputs;
 * synthetic short contracts are explicitly boundary fixtures, not market prices.
 * No teleport, god mode, tuning edit, forged successful completion, browser or GPU.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseAst } from 'vite';
import { createGameState, createBus, makeRandom, EVENTS, SCENES, clamp } from '../src/core/contract.js';
import { getMethod, getItem, RIGS, CERTS, defaultLoadoutFor, makeContract } from '../src/game/data.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { restoreSampleLedger, summariseSampleLedger } from '../src/sim/sample-ledger.js';
import { readSampleProduct } from '../src/sim/sample-product.js';
import { GRADES } from '../src/ui/screens/catalog.js';
import { sampleUnitCard } from '../src/ui/screens/site.js';

const sourcePaths = ['src/core/contract.js', 'src/game/data.js', 'src/game/equipment-support.js', 'src/game/progression.js',
  'src/sim/drilling.js', 'src/sim/sample-ledger.js', 'src/sim/sample-product.js', 'src/ui/screens/site.js', 'src/ui/screens/results.js'];
const sha = value => createHash('sha256').update(value).digest('hex');
const hashes = () => Object.fromEntries(sourcePaths.map(path => [path, sha(readFileSync(new URL('../' + path, import.meta.url)))]));
const initialHashes = hashes();
const siteSource = readFileSync(new URL('../src/ui/screens/site.js', import.meta.url), 'utf8');
const siteNodes = [];
function walk(node) {
  if (!node || typeof node !== 'object') return;
  siteNodes.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') walk(value);
  }
}
walk(parseAst(siteSource));
function definition(kind, name) {
  const matches = siteNodes.filter(n => kind === 'fn' ? n.type === 'FunctionDeclaration' && n.id?.name === name
    : kind === 'var' ? n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === name)
      : n.type === 'Property' && n.method && n.key?.name === name);
  assert.equal(matches.length, 1, `one actual Site ${kind} definition: ${name}`);
  return siteSource.slice(matches[0].start, matches[0].end);
}
function siteCallbacks(ctx) {
  return new Function('ctx', 'SCENES', `
    const state=ctx.state, notes=[], journal=[];
    const say=(...v)=>notes.push(v), log=(...v)=>journal.push(v);
    const clearAlert=()=>{}, resetWell=()=>{}, resetProgramme=()=>{};
    ${['sampleLogAttempt', 'actionEpoch', 'PULSE_SUB', 'PULSE_REFUSAL', 'num', 'leavePending'].map(n => definition('var', n)).join('\n')}
    ${['observeSampleProduct', 'actionContext', 'actionContextIsCurrent', 'actionRefused', 'firePulse', 'invalidateActionOutcomes'].map(n => definition('fn', n)).join('\n')}
    return { notes, journal, pulse:firePulse, invalidate:invalidateActionOutcomes,
      observe(p=ctx.sim.getTelemetry().programme){observeSampleProduct(p);},
      unmount:({${definition('method', 'unmount')}}).unmount };
  `)(ctx, SCENES);
}
const resultSource = readFileSync(new URL('../src/ui/screens/results.js', import.meta.url), 'utf8');
const resultNodes = [];
function resultWalk(node) {
  if (!node || typeof node !== 'object') return;
  resultNodes.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(resultWalk);
    else if (value && typeof value === 'object') resultWalk(value);
  }
}
resultWalk(parseAst(resultSource));
function resultsCallback(ctx) {
  const take = (kind, name) => {
    const found = resultNodes.filter(n => kind === 'fn' ? n.type === 'FunctionDeclaration' && n.id?.name === name
      : n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === name));
    assert.equal(found.length, 1, `one actual Results definition: ${name}`);
    return resultSource.slice(found[0].start, found[0].end);
  };
  const app = { ctx, normalizeContract: c => c, itemById: getItem };
  return new Function('app', 'GRADES', 'clamp', 'readSampleProduct', `
    const state=app.ctx.state;
    ${['GRADE_BANDS', 'COST_LINES', 'pct', 'obj', 'plural', 'warnedUnscored'].map(n => take('var', n)).join('\n')}
    ${['fmtSpan', 'lastSettlement', 'buildSummary'].map(n => take('fn', n)).join('\n')}
    return buildSummary;
  `)(app, GRADES, clamp, readSampleProduct);
}
const clone = value => JSON.parse(JSON.stringify(value));
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWarn = console.warn;
const warnings = [], cases = [], fixtures = [], observations = [];
console.warn = (...args) => warnings.push(args.map(String).join(' '));
const test = (name, run) => cases.push({ name, run });
let fixtureCounter = 0;
async function fixture(methodId = 'core', targetDepth = 3.25, options = {}) {
  const storage = new Map();
  const store = { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k) };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus(), ctx = { state, bus, rand: makeRandom(713), SCENES };
  if (options.beforeCompletion) bus.on(EVENTS.HOLE_COMPLETE, options.beforeCompletion);
  const progression = ctx.progression = createProgression(ctx);
  await progression.init();
  const method = getMethod(methodId);
  state.player.level = 60; state.player.money = 1e8; state.player.certs = CERTS.map(c => c.id);
  state.unlocked.methods = [methodId]; state.unlocked.rigs = RIGS.map(r => r.id);
  state.garage.rigId = method.rigIds[0]; state.garage.loadout = defaultLoadoutFor(methodId, 60);
  if (options.loadout) Object.assign(state.garage.loadout, options.loadout);
  state.garage.owned = Object.values(state.garage.loadout).filter(Boolean);
  const contract = options.contract || { id: `sampling-critic-${methodId}-${++fixtureCounter}`, title: 'Sampling boundary fixture',
    methodId, regionId: 'nordic', applicationId: 'mineral-exploration', archetype: 'exploration-pad',
    targetDepth, holes: 1, metres: targetDepth, holeDia: method.nominalDia,
    payout: 10000, bonus: { time: 1000, quality: 1000 }, deadlineHours: 24,
    reputationReward: 10, requiredCerts: [], difficulty: 1, hardness: .2, abrasivity: .2, seed: 194,
    ground: [{ id: methodId === 'core' ? 'limestone' : 'clay', top: 0, bottom: 1000 }], flushMedium: method.flushMedium };
  assert.equal(progression.previewContract(contract).ok, true, `${methodId} readiness: ${JSON.stringify(progression.previewContract(contract))}`);
  assert.equal(progression.acceptContract(contract).ok, true, `${methodId} actual acceptance`);
  let paused = false;
  ctx.ui = { get gameplayPaused() { return paused; } };
  state.scene = SCENES.SITE;
  const completions = [], rods = [], allEvents = [];
  bus.on(EVENTS.HOLE_COMPLETE, event => completions.push(event));
  bus.on(EVENTS.ROD_ADDED, event => rods.push(event));
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => allEvents.push({ event, payload }));
  const sim = ctx.sim = createDrillSim(ctx); sim.init();
  const started = sim.startHole(contract);
  assert.ok(started, `${methodId} actual start`);
  assert.equal(started.programme?.kind, methodId === 'core' ? 'coreSample' : 'sonicSample');
  const f = { ctx, state, bus, sim, progression, contract, completions, rods, allEvents, storage,
    get paused() { return paused; }, set paused(value) { paused = value; },
    selectStore() { Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store }); },
    close() { sim.dispose(); progression.dispose(); } };
  fixtures.push(f); return f;
}
function control(f) {
  const t = f.sim.getTelemetry();
  f.sim.setInput('feed', t.optimal.wob); f.sim.setInput('rpm', t.optimal.rpm); f.sim.setInput('flush', t.optimal.flush);
  if (t.rodAdd && !t.rodAdd.hit && t.rodAdd.t >= t.rodAdd.windowStart && t.rodAdd.t <= t.rodAdd.windowEnd) f.sim.pulse('rodStab');
  if (t.jam?.state === 'stuck' && t.jam.rescue?.goodNow) f.sim.pulse('jamRescue');
}
function tick(f, dt = 1 / 120) { control(f); f.sim.update(dt, f.state); }
function until(f, predicate, limit = 250000) {
  for (let step = 0; step < limit; step++) {
    const t = f.sim.getTelemetry(); if (predicate(t)) return t;
    assert.ok(f.sim.active, `run stopped before predicate: ${t.phase}`); tick(f);
  }
  throw Error(`Simulation did not reach expected stage: ${JSON.stringify(f.sim.getTelemetry().programme)}`);
}
function ledger(f) { return f.state.drill.sampleProduct; }
function assertConservation(f) {
  const product = ledger(f); assert.ok(product, 'real live product exists');
  const restored = restoreSampleLedger(clone(product), { runId: f.sim.getTelemetry().runId, attemptId: f.sim.getTelemetry().attemptId });
  const s = summariseSampleLedger(restored);
  assert.ok(s.drilledIntervalM <= f.contract.targetDepth);
  assert.equal(product.drilledDepthM, f.sim.debug.state.depth);
  assert.equal(product.drilledDepthM, f.sim.debug.state.holeDepth);
  let end = 0; for (const row of product.intervals) { assert.equal(row.fromM, end); assert.ok(row.toM > row.fromM); end = row.toM; }
  assert.equal(end, product.drilledDepthM);
  return s;
}
function boundary(f) { return until(f, t => t.phase === 'sample-wait'); }
function operation(f, name) {
  const before = clone(ledger(f)), oldCompletions = f.completions.length, oldRods = f.rods.length;
  const result = f.sim.pulse(name); assert.equal(result?.ok, true, `${name}: ${JSON.stringify(result)}`);
  assert.deepEqual(ledger(f), before, 'starting a timed operation cannot already publish its result');
  assert.equal(f.completions.length, oldCompletions);
  const phase = f.sim.getTelemetry().phase;
  assert.equal(phase, { sampleCase: 'sample-case', sampleRetrieve: 'sample-retrieve', sampleHandle: 'sample-handle' }[name]);
  const busy = f.sim.pulse(name); assert.equal(busy?.ok, false, 'duplicate start is refused while busy');
  until(f, t => t.phase !== phase);
  assert.equal(f.rods.length, oldRods, `${name} must not impersonate rod extension`);
  assertConservation(f);
}
function handleCurrent(f) {
  if (f.contract.methodId === 'sonic') operation(f, 'sampleCase');
  operation(f, 'sampleRetrieve'); operation(f, 'sampleHandle');
}
function finish(f) {
  let intervals = 0;
  while (f.sim.active) { assert.ok(++intervals < 1000); boundary(f); handleCurrent(f); }
  assert.equal(f.completions.length, 1);
  const payload = f.completions[0], receipt = f.progression.settlementForCompletion(payload);
  assert.ok(receipt, 'authoritative receipt exists');
  assert.deepEqual(receipt.sampleProduct, payload.sampleProduct);
  assert.equal(summariseSampleLedger(restoreSampleLedger(clone(payload.sampleProduct), {
    runId: payload.runId, attemptId: payload.attemptId })).handlingComplete, true);
  return { payload, receipt };
}

test('core and sonic finish only after real final retrieval and handling; exact intervals reach settlement', async () => {
  for (const method of ['core', 'sonic']) for (const target of [.5, 3, 3.25, 6.5]) {
    const f = await fixture(method, target); const { payload, receipt } = finish(f);
    assert.equal(payload.sampleProduct.drilledDepthM, target);
    assert.equal(payload.sampleProduct.intervals.at(-1).toM, target);
    assert.equal(receipt.sampleProduct.methodId, method);
    assert.ok(Object.isFrozen(payload.sampleProduct)); assert.ok(Object.isFrozen(receipt.sampleProduct));
    assert.equal(f.rods.every(row => row.kind !== 'core-run'), true, 'a rod extension must not claim retrieval');
    observations.push({ method, target, intervals: payload.sampleProduct.intervals.length, rods: f.rods.length,
      timeSec: payload.timeSec, product: receipt.sampleProduct });
  }
});
test('waiting at the actual barrel boundary cannot drill, wear, extend rods or pay', async () => {
  for (const method of ['core', 'sonic']) {
    const f = await fixture(method, 6.5); boundary(f);
    const before = { ledger: clone(ledger(f)), depth: f.sim.debug.state.depth, hole: f.sim.debug.state.holeDepth,
      wear: f.sim.debug.state.wear, rods: f.rods.length, player: clone(f.state.player), hazards: f.sim.debug.state.hazards.length };
    for (let i = 0; i < 600; i++) tick(f, 1 / 30);
    assert.deepEqual(ledger(f), before.ledger); assert.equal(f.sim.debug.state.depth, before.depth);
    assert.equal(f.sim.debug.state.holeDepth, before.hole); assert.equal(f.sim.debug.state.wear, before.wear);
    assert.equal(f.rods.length, before.rods); assert.deepEqual(f.state.player, before.player);
    assert.equal(f.sim.debug.state.hazards.length, before.hazards); assert.equal(f.completions.length, 0);
  }
});
test('first-step tiny final slice charges wear for accepted drilling without overshooting bore coordinates', async () => {
  for (const method of ['core', 'sonic']) {
    const readings = [];
    for (const target of [.000001, .000002]) {
      const f = await fixture(method, target), initialWear = f.sim.debug.state.wear;
      boundary(f); assert.equal(f.sim.debug.state.depth, target); assert.equal(f.sim.debug.state.holeDepth, target);
      const consumedWear = f.sim.debug.state.wear - initialWear;
      assert.ok(consumedWear > 0, 'final boundary phase change must not skip wear for the slice just drilled');
      readings.push(consumedWear); assertConservation(f);
    }
    assert.ok(Math.abs(readings[1] / readings[0] - 2) < .000001, 'tiny-slice wear follows accepted drilled length, not unclamped ROP');
  }
});
test('sonic retrieval refuses uncased interval and a sample start never yields an immediate product', async () => {
  const f = await fixture('sonic', .5); boundary(f); const before = clone(ledger(f));
  const rejected = f.sim.pulse('sampleRetrieve'); assert.equal(rejected?.ok, false);
  assert.deepEqual(ledger(f), before); assert.equal(f.completions.length, 0);
  operation(f, 'sampleCase'); operation(f, 'sampleRetrieve');
  assert.equal(f.completions.length, 0); assert.equal(ledger(f).intervals[0].handling, null);
  operation(f, 'sampleHandle'); assert.equal(f.completions.length, 1);
});
test('pause freezes each real sampling operation and refuses actions without accumulating catch-up', async () => {
  for (const method of ['core', 'sonic']) {
    const f = await fixture(method, .5); boundary(f);
    for (const action of [...(method === 'sonic' ? ['sampleCase'] : []), 'sampleRetrieve', 'sampleHandle']) {
      assert.equal(f.sim.pulse(action).ok, true);
      tick(f); f.paused = true;
      const frozen = JSON.stringify(f.sim.debug.state);
      for (let i = 0; i < 80; i++) f.sim.update(.25, f.state);
      assert.equal(JSON.stringify(f.sim.debug.state), frozen);
      assert.equal(f.sim.pulse(action).ok, false); assert.equal(f.completions.length, 0);
      f.paused = false; const oldTime = f.sim.debug.state.timeSec;
      f.sim.update(1 / 120, f.state);
      assert.ok(f.sim.debug.state.timeSec - oldTime < .009);
      until(f, t => !['sample-case', 'sample-retrieve', 'sample-handle'].includes(t.phase));
    }
    assert.equal(f.completions.length, 1);
  }
});
test('abort and same-contract replacement attempt cannot finish old timed sampling work', async () => {
  for (const action of ['sampleRetrieve', 'sampleHandle']) {
    const f = await fixture('core', .5); boundary(f);
    if (action === 'sampleHandle') operation(f, 'sampleRetrieve');
    assert.equal(f.sim.pulse(action).ok, true); tick(f);
    const oldAttempt = f.sim.getTelemetry().attemptId;
    f.sim.abortHole('sampling-critic-abort');
    for (let i = 0; i < 400; i++) f.sim.update(1 / 30, f.state);
    assert.equal(f.completions.length, 0);
    assert.ok(f.sim.startHole(f.contract)); assert.notEqual(f.sim.getTelemetry().attemptId, oldAttempt);
    assert.equal(ledger(f).drilledDepthM, 0); assert.deepEqual(ledger(f).intervals, []);
    assert.equal(f.sim.getTelemetry().phase, 'drilling');
    finish(f); assert.equal(f.completions.length, 1);
    assert.notEqual(f.completions[0].attemptId, oldAttempt);
  }
});
test('duplicate actual completion preserves every player total and the saved sample product', async () => {
  for (const method of ['core', 'sonic']) {
    const f = await fixture(method, .5), { payload, receipt } = finish(f);
    const player = clone(f.state.player), persisted = clone(f.progression.serialise());
    for (let i = 0; i < 5; i++) { f.bus.emit(EVENTS.HOLE_COMPLETE, payload); f.progression.completeHole(clone(payload)); }
    assert.deepEqual(f.state.player, player); assert.deepEqual(f.progression.serialise(), persisted);
    assert.deepEqual(f.progression.settlementForCompletion(payload).sampleProduct, receipt.sampleProduct);
  }
});
test('missing, pending, wrong-identity and malformed product completions cannot consume a real attempt', async () => {
  for (const method of ['core', 'sonic']) {
    const f = await fixture(method, .5); boundary(f);
    const t = f.sim.getTelemetry();
    const base = { contract: f.contract, methodId: method, runId: t.runId, attemptId: t.attemptId,
      depth: f.contract.targetDepth, timeSec: t.timeSec, grade: 'B', sampleCapacityBasis: t.programme.capacityBasis };
    const pending = clone(ledger(f));
    const products = [undefined, null, {}, pending,
      { ...pending, attemptId: pending.attemptId + 1 },
      { ...pending, methodId: method === 'core' ? 'sonic' : 'core' },
      { ...pending, drilledDepthM: String(pending.drilledDepthM) },
      { ...pending, recoveredM: f.contract.targetDepth, recovery: 1 },
    ];
    const before = clone(f.progression.serialise());
    for (const sampleProduct of products) {
      const payload = { ...base, ...(sampleProduct === undefined ? {} : { sampleProduct }) };
      assert.equal(f.progression.completeHole(payload), null, 'invalid product must not settle');
      assert.deepEqual(f.progression.serialise(), before, 'invalid product cannot consume the pending attempt or alter career');
    }
    handleCurrent(f); assert.equal(f.completions.length, 1); assert.ok(f.progression.settlementForCompletion(f.completions[0]));
  }
});
test('a completed sample product survives actual progression JSON save and reload', async () => {
  for (const method of ['core', 'sonic']) {
    const f = await fixture(method, 3.25), { receipt } = finish(f);
    f.selectStore(); assert.equal(f.progression.save(), true);
    const saved = [...f.storage.values()].map(text => JSON.parse(text));
    assert.ok(saved.some(s => s.player?.career?.ledger?.some(entry => entry.sampleProduct)), 'actual storage contains settled sample evidence');
    const state = createGameState(), bus = createBus(), progression = createProgression({ state, bus, rand: makeRandom(39), SCENES });
    try {
      await progression.init();
      const restored = state.player.career.ledger.find(entry => entry.runId === receipt.runId && entry.attemptId === receipt.attemptId);
      assert.ok(restored, 'same settled hole restored'); assert.deepEqual(restored.sampleProduct, receipt.sampleProduct);
      const product = restoreSampleLedger(clone(restored.sampleProduct), { runId: receipt.runId, attemptId: receipt.attemptId });
      assert.equal(summariseSampleLedger(product).handlingComplete, true);
    } finally { progression.dispose(); }
  }
});
test('actual mid-hole save reload restarts a fresh physical attempt without inherited sample intervals', async () => {
  const f = await fixture('core', 6.5); boundary(f); handleCurrent(f); boundary(f);
  const oldAttempt = f.sim.getTelemetry().attemptId;
  assert.equal(ledger(f).intervals[0].handling.container, 'box');
  f.selectStore(); assert.equal(f.progression.save(), true);
  const state = createGameState(), bus = createBus(), ctx = { state, bus, rand: makeRandom(44), SCENES };
  const progression = ctx.progression = createProgression(ctx); let sim;
  try {
    await progression.init(); state.scene = SCENES.SITE;
    sim = ctx.sim = createDrillSim(ctx); sim.init(); assert.ok(sim.startHole(state.contract));
    assert.notEqual(sim.getTelemetry().attemptId, oldAttempt);
    assert.equal(state.drill.sampleProduct.drilledDepthM, 0); assert.deepEqual(state.drill.sampleProduct.intervals, []);
    assert.equal(progression.run.holesDone, 0);
  } finally { sim?.dispose(); progression.dispose(); }
});
test('actual Site callbacks distinguish started retrieval from completed custody and do not lose a handled row between polls', async () => {
  const f = await fixture('core', 6.5), ui = siteCallbacks(f.ctx); boundary(f);
  ui.pulse('sampleRetrieve');
  assert.equal(f.sim.getTelemetry().phase, 'sample-retrieve');
  assert.doesNotMatch(JSON.stringify(ui.journal), /Inner tube retrieved|Box 1 logged/);
  until(f, t => t.phase !== 'sample-retrieve'); ui.observe();
  assert.equal(ui.journal.filter(row => /Inner tube retrieved/.test(row[1])).length, 1);
  ui.observe(); assert.equal(ui.journal.filter(row => /Inner tube retrieved/.test(row[1])).length, 1);
  ui.pulse('sampleHandle'); until(f, t => t.phase !== 'sample-handle');
  // A 120Hz physical step can open the next barrel before the 8Hz UI reads it.
  until(f, t => t.programme.intervals.length > 1);
  ui.observe(); ui.observe();
  assert.equal(ui.journal.filter(row => /Box 1 logged/.test(row[1])).length, 1,
    'handling evidence from the previous row must survive a new current interval');
});
test('actual Site sampling observer rejects stale prior-attempt or unmounted-screen snapshots', async () => {
  const f = await fixture('core', 6.5), ui = siteCallbacks(f.ctx); boundary(f);
  operation(f, 'sampleRetrieve'); const stale = f.sim.getTelemetry().programme;
  f.sim.abortHole('critic-restart'); f.sim.startHole(f.contract);
  ui.observe(stale); assert.equal(ui.journal.length, 0, 'old attempt cannot add entries to the new attempt log');
  boundary(f); operation(f, 'sampleRetrieve');
  const afterLeave = f.sim.getTelemetry().programme;
  ui.unmount(); f.state.scene = SCENES.RESULTS;
  ui.observe(afterLeave); assert.equal(ui.journal.length, 0, 'unmounted screen cannot publish late custody notices');
});
test('actual Results summary uses only its authenticated product receipt; preview and stale payload stay unmeasured', async () => {
  for (const method of ['core', 'sonic']) {
    const f = await fixture(method, 3.25), { payload, receipt } = finish(f), summary = resultsCallback(f.ctx);
    assert.deepEqual(summary({ result: payload }).sampleProduct, receipt.sampleProduct);
    assert.equal(summary({ result: payload, preview: true }).sampleProduct, null);
    assert.equal(summary({ result: clone(payload) }).sampleProduct, null, 'a detached payload cannot borrow the live product');
    const getReceipt = f.progression.settlementForCompletion;
    try {
      const malformed = clone(receipt); malformed.sampleProduct.intervals[0].handling = null;
      f.progression.settlementForCompletion = () => malformed;
      assert.equal(summary({ result: payload }).sampleProduct, null, 'fault-injected malformed receipt is not a product claim');
    } finally { f.progression.settlementForCompletion = getReceipt; }
  }
});
test('malformed saved sample geometry is rejected while a real compatible backup still restores the settled record', async () => {
  const f = await fixture('sonic', 3.25), { receipt } = finish(f);
  f.selectStore(); assert.equal(f.progression.save(), true); assert.equal(f.progression.save(), true);
  const primary = JSON.parse(f.storage.get(SAVE_KEY));
  primary.player.career.ledger[0].sampleProduct.intervals[0].toM = -1;
  f.storage.set(SAVE_KEY, JSON.stringify(primary));
  assert.ok(f.storage.has(SAVE_BACKUP_KEY));
  const state = createGameState(), bus = createBus(), progression = createProgression({ state, bus, rand: makeRandom(40), SCENES });
  try {
    await progression.init();
    assert.deepEqual(state.player.career.ledger[0].sampleProduct, receipt.sampleProduct);
  } finally { progression.dispose(); }
});
test('core barrel handling does not add a rod; the separate coincident rod boundary still needs a connection', async () => {
  const f = await fixture('core', 6.5), start = f.sim.getTelemetry();
  const capacity = start.programme.barrelCapacityM, rodLength = start.rodLength;
  assert.ok(capacity < rodLength, 'current supported core train has a shorter barrel than its rod');
  boundary(f); assert.equal(ledger(f).drilledDepthM, capacity); assert.equal(f.rods.length, 0);
  handleCurrent(f); assert.equal(f.rods.length, 0); assert.equal(f.sim.getTelemetry().phase, 'drilling');
  boundary(f); assert.equal(ledger(f).drilledDepthM, rodLength); assert.equal(f.rods.length, 0);
  handleCurrent(f); assert.equal(f.sim.getTelemetry().phase, 'rod-add'); assert.equal(f.rods.length, 0);
  until(f, t => t.phase !== 'rod-add'); assert.equal(f.rods.length, 1); assert.equal(f.rods[0].kind, 'rod');
});
test('incompatible mid-hole bit changes reject before trip, while compatible and default trips preserve current sample evidence', async () => {
  const f = await fixture('core', 6.5);
  until(f, t => t.programme.summary.drilledIntervalM > t.programme.barrelCapacityM / 3);
  const before = clone(ledger(f)), phase = f.sim.getTelemetry().phase;
  for (const id of ['bit-core-bq-surf', 'bit-core-hq-imp', 'sonic-core-barrel-100']) {
    const pending = f.sim.changeBit(id);
    assert.equal(f.sim.getTelemetry().phase, phase, 'incompatible bit must refuse before entering trip');
    assert.equal((await pending).ok, false); assert.deepEqual(ledger(f), before);
  }
  for (const id of [f.state.garage.loadout.bit, undefined]) {
    const pending = f.sim.changeBit(id); assert.equal(f.sim.getTelemetry().phase, 'tripping-out');
    until(f, t => t.phase === 'drilling'); assert.equal((await pending).ok, true);
    assert.deepEqual(ledger(f), before, 'bit trip cannot retrieve, handle or reset the open interval');
    assert.equal(getItem(f.sim.debug.state.bit.id)?.sampling?.family, 'NQ');
  }
  finish(f);
});
test('unmodified generated core and sonic contract holes produce authenticated handled interval receipts', async () => {
  const random = makeRandom(20260919), chosen = new Map();
  for (let i = 0; i < 1200; i++) {
    const contract = makeContract('nordic', 60, random);
    if (['core', 'sonic'].includes(contract.methodId) && (!chosen.has(contract.methodId)
      || contract.targetDepth < chosen.get(contract.methodId).targetDepth)) chosen.set(contract.methodId, contract);
  }
  assert.equal(chosen.size, 2);
  for (const [method, contract] of chosen) {
    const original = clone(contract), f = await fixture(method, contract.targetDepth, { contract });
    const { receipt } = finish(f); assert.deepEqual(contract, original, 'generated tender was not modified');
    observations.push({ generated: true, method, target: contract.targetDepth, contractId: contract.id,
      holesInContract: contract.holes, testedHole: receipt.hole, intervals: receipt.sampleProduct.intervals.length });
  }
});
test('capacity provenance survives live telemetry, completion, settlement, Results and JSON reload without promoting sonic to measured capacity', async () => {
  for (const method of ['core', 'sonic']) {
    const basis = method === 'core' ? 'inner-tube-length' : 'gameplay-run-limit';
    const f = await fixture(method, .5);
    const initial = f.sim.getTelemetry().programme;
    assert.equal(initial.capacityBasis, basis); assert.equal(initial.summary.capacityBasis, basis);
    assert.equal(f.state.drill.sampleCapacityBasis, basis);
    boundary(f); operation(f, method === 'core' ? 'sampleRetrieve' : 'sampleCase');
    if (method === 'sonic') operation(f, 'sampleRetrieve');
    const live = f.sim.getTelemetry().programme, card = sampleUnitCard(live);
    assert.equal(live.summary.capacityBasis, basis);
    assert.ok(card.rows.some(row => row[0] === (method === 'core' ? 'Inner tube capacity' : 'Sampling run limit')));
    if (method === 'sonic') assert.match(JSON.stringify(card), /game setting/);
    operation(f, 'sampleHandle');
    const payload = f.completions[0], receipt = f.progression.settlementForCompletion(payload);
    assert.equal(payload.sampleCapacityBasis, basis); assert.equal(receipt.sampleCapacityBasis, basis);
    assert.equal(resultsCallback(f.ctx)({ result: payload }).sampleCapacityBasis, basis);
    f.selectStore(); assert.equal(f.progression.save(), true);
    const state = createGameState(), bus = createBus(), progression = createProgression({ state, bus, rand: makeRandom(71), SCENES });
    try {
      await progression.init();
      const saved = state.player.career.ledger[0];
      assert.equal(saved.sampleCapacityBasis, basis); assert.deepEqual(saved.sampleProduct, receipt.sampleProduct);
    } finally { progression.dispose(); }
  }
});
test('wrong or missing capacity provenance rejects a genuinely completed new sampling receipt before payment', async () => {
  for (const method of ['core', 'sonic']) for (const wrong of [undefined, null,
    method === 'core' ? 'gameplay-run-limit' : 'inner-tube-length', 'measured-recovery', {}]) {
    const f = await fixture(method, .5, { beforeCompletion: payload => {
      if (wrong === undefined) delete payload.sampleCapacityBasis; else payload.sampleCapacityBasis = wrong;
    } });
    const before = clone(f.state.player);
    boundary(f); handleCurrent(f);
    assert.equal(f.completions.length, 1, 'genuine simulation completion occurred');
    assert.equal(f.progression.settlementForCompletion(f.completions[0]), null);
    assert.deepEqual(f.state.player, before, 'corrupt envelope must not earn money, XP or career progress');
    assert.equal(f.progression.run.holesDone, 0);
  }
});
test('older settled product without capacity basis remains unrecorded on load while a wrong recorded basis is rejected', async () => {
  const f = await fixture('sonic', .5), { payload, receipt } = finish(f);
  const expected = { methodId: 'sonic', runId: receipt.runId, attemptId: receipt.attemptId, depth: receipt.depth };
  assert.ok(readSampleProduct(clone(receipt.sampleProduct), expected), 'older valid record without basis stays readable');
  assert.equal(readSampleProduct(clone(receipt.sampleProduct), { ...expected, capacityBasis: 'inner-tube-length' }), null);
  const previous = f.progression.settlementForCompletion;
  try {
    const older = clone(receipt); delete older.sampleCapacityBasis;
    f.progression.settlementForCompletion = () => older;
    const summary = resultsCallback(f.ctx)({ result: payload });
    assert.ok(summary.sampleProduct); assert.equal(summary.sampleCapacityBasis, null);
  } finally { f.progression.settlementForCompletion = previous; }
  f.selectStore(); assert.equal(f.progression.save(), true);
  const oldSave = JSON.parse(f.storage.get(SAVE_KEY)); delete oldSave.player.career.ledger[0].sampleCapacityBasis;
  f.storage.set(SAVE_KEY, JSON.stringify(oldSave)); f.storage.delete(SAVE_BACKUP_KEY);
  const state = createGameState(), bus = createBus(), progression = createProgression({ state, bus, rand: makeRandom(73), SCENES });
  try {
    await progression.init();
    const restored = state.player.career.ledger[0];
    assert.deepEqual(restored.sampleProduct, receipt.sampleProduct);
    assert.equal(restored.sampleCapacityBasis, undefined, 'missing provenance is not promoted to a measured or gameplay basis');
  } finally { progression.dispose(); }
});

const results = [];
try {
  for (const { name, run } of cases) {
    try { await run(); results.push({ name, ok: true }); console.log('PASS ' + name); }
    catch (error) { results.push({ name, ok: false, error: error.stack }); console.error('FAIL ' + name + '\n' + error.stack); }
    finally { while (fixtures.length) fixtures.pop().close(); }
  }
} finally {
  console.warn = originalWarn;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete globalThis.localStorage;
}
const finalHashes = hashes(), sourceStable = JSON.stringify(initialHashes) === JSON.stringify(finalHashes);
const report = { scope: 'Real CPU simulation/progression. Short synthetic contracts are boundary fixtures; no rendered UI or phone proof.',
  initialHashes, finalHashes, sourceStable, passed: results.filter(x => x.ok).length, total: results.length,
  results, observations, warnings };
const out = process.argv.indexOf('--out');
if (out !== -1) writeFileSync(process.argv[out + 1], JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: report.passed, total: report.total, sourceStable }));
if (report.passed !== report.total || !sourceStable) process.exitCode = 1;
