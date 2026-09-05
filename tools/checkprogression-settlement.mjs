#!/usr/bin/env node
/**
 * Settlement/reload regressions against the actual progression, data and bus.
 * Run: node tools/checkprogression-settlement.mjs
 * --probe-delayed-completion remains an alias for the full regression gate.
 * The storage adapter is the browser boundary; no bookkeeping is reimplemented.
 * Contract fixtures come from the production deterministic board generator.
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { makeContract } from '../src/game/data.js';
import { createProgression, SAVE_KEY, SAVE_VERSION, _resetWarnings } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';

const clone = (value) => structuredClone(value);
const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const testCases = [];
const measurements = [];
const diagnostics = [];
assert.ok(process.argv.slice(2).every((arg) => arg === '--probe-delayed-completion'), 'Unknown settlement gate argument');

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: (key) => { data.delete(key); },
  };
}

async function fresh(store = memoryStorage()) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState();
  const bus = createBus();
  const events = [];
  for (const event of Object.values(EVENTS)) bus.on(event, (payload) => events.push({ event, payload }));
  const progression = createProgression({ state, bus, rand: makeRandom(20260906), SCENES });
  await progression.init();
  return { state, bus, events, progression, store };
}

function fixture(holes, ordinal = 0) {
  const rand = makeRandom(20260906);
  for (let i = 0, matched = 0; i < 1000; i++) {
    const contract = makeContract('nordic', 1, rand);
    if (contract.holes === holes && matched++ === ordinal) return contract;
  }
  throw new Error(`Production board supplied no ${holes}-hole fixture ${ordinal}`);
}

function accept(ctx, contract) {
  assert.equal(ctx.progression.acceptContract(contract).ok, true, 'Fixture contract must be accepted');
  assert.equal(ctx.progression.run.contract.id, contract.id);
}

function start(ctx, contract = ctx.state.contract) {
  ctx.bus.emit(EVENTS.DRILL_START, { methodId: contract.methodId, contract });
}

function completion(contract, index = 1) {
  return {
    contract,
    methodId: contract.methodId,
    depth: contract.targetDepth,
    timeSec: 60 + index,
    grade: 'B',
    breakdown: { time: { parSec: 60, actualSec: 60 + index } },
  };
}

function book(ctx) {
  const { player, garage } = ctx.state;
  return clone({ player, garage, contract: ctx.state.contract, site: ctx.state.world.site,
    run: ctx.progression.serialise().run });
}

function results(ctx) {
  return ctx.events.filter(({ event, payload }) => event === EVENTS.SCENE_CHANGE && payload.scene === SCENES.RESULTS);
}

function report(label, before, after) {
  measurements.push({ label, before: { money: before.player.money, holes: before.player.stats.holesDone,
    contracts: before.player.career.contractsDone, ledger: before.player.career.ledger.length },
  after: { money: after.player.money, holes: after.player.stats.holesDone,
    contracts: after.player.career.contractsDone, ledger: after.player.career.ledger.length } });
}

function test(name, fn) { testCases.push({ name, fn }); }

function writeV4(ctx) {
  const oldPayload = clone(ctx.progression.serialise());
  oldPayload.version = 4;
  delete oldPayload.settledContracts;
  if (oldPayload.run) delete oldPayload.run.holePending;
  ctx.store.setItem(SAVE_KEY, JSON.stringify(oldPayload));
}

test('a completed single-hole job cannot settle twice in the same session', async () => {
  const ctx = await fresh(), contract = fixture(1), payload = completion(contract);
  accept(ctx, contract); start(ctx);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  assert.equal(ctx.state.contract, null);
  assert.equal(ctx.progression.run, null);
  assert.equal(ctx.state.player.career.contractsDone, 1);
  assert.equal(results(ctx).length, 1);
  assert.equal(ctx.state.world.site.contractId, contract.id);
  assert.equal(ctx.state.world.site.live, false);
  const before = book(ctx);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, clone(payload));
  assert.deepEqual(book(ctx), before);
  assert.equal(results(ctx).length, 1);
});

test('one multi-hole completion delivered twice pays once', async () => {
  const ctx = await fresh(), contract = fixture(3), payload = completion(contract);
  accept(ctx, contract); start(ctx);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  assert.equal(ctx.progression.run.holesDone, 1);
  const before = book(ctx);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, clone(payload));
  const after = book(ctx);
  report('repeated multi-hole event', before, after);
  assert.deepEqual(after, before);
});

test('an active multi-hole save resumes its accumulator and rejects replay', async () => {
  const ctx = await fresh(), contract = fixture(3), first = completion(contract);
  accept(ctx, contract); start(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, first);
  assert.equal(ctx.progression.save(), true);
  const savedRun = clone(ctx.progression.serialise().run);
  const reloaded = await fresh(ctx.store);
  assert.deepEqual(reloaded.progression.serialise().run, savedRun);
  assert.equal(reloaded.progression.run.contract, reloaded.state.contract, 'Restored run uses restored active contract');
  assert.equal(reloaded.state.world.site.live, true);
  const before = book(reloaded);
  reloaded.bus.emit(EVENTS.HOLE_COMPLETE, clone(first));
  const after = book(reloaded);
  report('active reload replay', before, after);
  assert.deepEqual(after, before);
});

test('a fresh-hole start survives save/reload and allows exactly one completion', async () => {
  const ctx = await fresh(), contract = fixture(3);
  accept(ctx, contract); start(ctx);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, completion(contract));
  start(ctx);
  assert.equal(ctx.progression.save(), true);
  const reloaded = await fresh(ctx.store);
  const second = completion(reloaded.state.contract, 2);
  assert.ok(reloaded.progression.completeHole(second), 'Started second hole remains eligible after reload');
  assert.equal(reloaded.progression.run.holesDone, 2);
  const before = book(reloaded);
  reloaded.bus.emit(EVENTS.HOLE_COMPLETE, clone(second));
  assert.deepEqual(book(reloaded), before);
});

test('legitimate multi-hole work across reload pays each hole and finishes exactly once', async () => {
  let ctx = await fresh();
  const contract = fixture(3);
  accept(ctx, contract);
  const settlements = [];
  for (let index = 1; index <= contract.holes; index++) {
    start(ctx);
    const settlement = ctx.progression.completeHole(completion(ctx.state.contract, index));
    assert.ok(settlement, `Hole ${index} must settle`);
    assert.equal(settlement.hole, index);
    settlements.push(clone(settlement));
    assert.equal(ctx.progression.save(), true);
    if (index < contract.holes) ctx = await fresh(ctx.store);
  }
  assert.equal(ctx.state.player.stats.holesDone, contract.holes);
  assert.equal(ctx.state.player.career.contractsDone, 1);
  assert.equal(ctx.state.player.career.ledger.length, contract.holes);
  assert.equal(ctx.progression.run, null);
  const summary = results(ctx).at(-1)?.payload.summary;
  assert.ok(summary, 'Final hole emits result summary');
  assert.equal(summary.holes, contract.holes);
  assert.equal(summary.revenue, settlements.reduce((sum, item) => sum + item.revenue, 0));
  assert.equal(summary.xp, settlements.reduce((sum, item) => sum + item.xp, 0));
  assert.equal(summary.costs, settlements.reduce((sum, item) => sum + item.costs.total, 0));
  assert.equal(summary.net, summary.revenue - summary.costs - summary.mobilisation);
});

test('identical legitimate holes remain payable when each has its own start', async () => {
  const ctx = await fresh(), contract = fixture(3), payload = completion(contract);
  accept(ctx, contract);
  for (let index = 1; index <= contract.holes; index++) {
    start(ctx);
    const settlement = ctx.progression.completeHole(clone(payload));
    assert.ok(settlement, `Identical-content hole ${index} has a fresh start`);
    assert.equal(settlement.hole, index);
  }
  assert.equal(ctx.state.player.stats.holesDone, contract.holes);
  assert.equal(ctx.state.player.career.contractsDone, 1);
});

test('the real simulation starts and completes every hole of a multi-hole job', async () => {
  const ctx = await fresh(), contract = fixture(3);
  accept(ctx, contract);
  const sim = createDrillSim({ state: ctx.state, bus: ctx.bus, progression: ctx.progression });
  for (let index = 1; index <= contract.holes; index++) {
    sim.startHole(ctx.state.contract);
    sim.debug.stepFixed(60);
    // Skip drilling time through the sim's published QA seam. Completion,
    // scoring, contract payload and event dispatch still execute real code.
    sim.debug.setDepth(contract.targetDepth);
    sim.debug.stepFixed(10);
    assert.equal(sim.active, false, `Simulation must complete hole ${index}`);
    assert.equal(ctx.state.player.stats.holesDone, index);
  }
  assert.equal(ctx.events.filter(({ event }) => event === EVENTS.DRILL_START).length, contract.holes);
  assert.equal(ctx.events.filter(({ event }) => event === EVENTS.HOLE_COMPLETE).length, contract.holes);
  assert.equal(ctx.state.player.career.contractsDone, 1);
  assert.equal(results(ctx).length, 1);
  sim.dispose();
});

test('a settled save cannot reward a replay after reload', async () => {
  const ctx = await fresh(), contract = fixture(1), payload = completion(contract);
  accept(ctx, contract); start(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  assert.equal(ctx.progression.save(), true);
  const saved = JSON.parse(ctx.store.getItem(SAVE_KEY));
  assert.equal(saved.contract, null);
  assert.equal(saved.run, null);
  const reloaded = await fresh(ctx.store), before = book(reloaded);
  reloaded.bus.emit(EVENTS.HOLE_COMPLETE, clone(payload));
  const after = book(reloaded);
  report('settled reload replay', before, after);
  assert.deepEqual(after, before);
  assert.equal(results(reloaded).length, 0);
});

test('an abandoned save cannot reward a late completion after reload', async () => {
  const ctx = await fresh(), contract = fixture(3), payload = completion(contract);
  accept(ctx, contract); start(ctx);
  assert.equal(ctx.progression.abandonContract().ok, true);
  assert.equal(ctx.progression.save(), true);
  const reloaded = await fresh(ctx.store), before = book(reloaded);
  reloaded.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  const after = book(reloaded);
  report('abandoned reload replay', before, after);
  assert.deepEqual(after, before);
});

test('a stale completion from a different contract cannot pay the active job', async () => {
  const ctx = await fresh(), abandoned = fixture(3), active = fixture(3, 1);
  accept(ctx, abandoned); start(ctx);
  const stale = completion(abandoned);
  assert.equal(ctx.progression.abandonContract().ok, true);
  accept(ctx, active); start(ctx);
  const before = book(ctx);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, stale);
  const after = book(ctx);
  report('stale other-contract event', before, after);
  assert.deepEqual(after, before);
});

test('an unrelated drill-start cannot make a paid hole payable again', async () => {
  const ctx = await fresh(), active = fixture(3), unrelated = fixture(3, 1);
  accept(ctx, active); start(ctx);
  const payload = completion(active);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  const before = book(ctx);
  start(ctx, unrelated);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, clone(payload));
  assert.deepEqual(book(ctx), before);
});

test('reentrant result listeners cannot settle the just-finished job twice', async () => {
  const ctx = await fresh(), contract = fixture(1), payload = completion(contract);
  accept(ctx, contract); start(ctx);
  let reentered = false;
  ctx.bus.on(EVENTS.SCENE_CHANGE, ({ scene }) => {
    if (scene === SCENES.RESULTS && !reentered) {
      reentered = true;
      ctx.progression.completeHole(clone(payload));
    }
  });
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  assert.equal(reentered, true, 'Reentrant listener must actually run');
  assert.equal(ctx.state.player.stats.holesDone, 1);
  assert.equal(ctx.state.player.career.contractsDone, 1);
  assert.equal(ctx.state.player.career.ledger.length, 1);
  assert.equal(results(ctx).length, 1);
});

test('a save triggered by a money event contains the entire settlement', async () => {
  const ctx = await fresh(), contract = fixture(3);
  accept(ctx, contract); start(ctx);
  let writes = 0;
  ctx.bus.on(EVENTS.MONEY_CHANGE, () => {
    writes++;
    assert.equal(ctx.progression.save(), true);
  });
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, completion(contract));
  assert.ok(writes > 0, 'Money observer must actually write a save');
  const finalState = book(ctx);
  const reloaded = await fresh(ctx.store);
  assert.deepEqual(book(reloaded), finalState, 'No save may contain money without its matching costs, XP, wear and ledger');
});

test('result notification cannot erase a successfully accepted next job', async () => {
  const ctx = await fresh(), finished = fixture(1), next = fixture(3);
  accept(ctx, finished); start(ctx);
  let nextAcceptance = null;
  ctx.bus.on(EVENTS.SCENE_CHANGE, ({ scene }) => {
    if (scene === SCENES.RESULTS) nextAcceptance = ctx.progression.acceptContract(next);
  });
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, completion(finished));
  assert.ok(nextAcceptance, 'Result listener must actually request the next job');
  // Rejecting a reentrant request explicitly is safe; reporting success then
  // dropping that new run is not. A normal subsequent request must still work.
  if (!nextAcceptance.ok) {
    assert.ok(nextAcceptance.reason);
    assert.equal(ctx.state.contract, null);
    assert.equal(ctx.progression.run, null);
    assert.equal(ctx.progression.acceptContract(next).ok, true);
  }
  assert.equal(ctx.state.contract?.id, next.id);
  assert.equal(ctx.progression.run?.contract.id, next.id);
  assert.equal(ctx.state.world.site.live, true);
  assert.equal(ctx.state.player.career.contractsDone, 1);
  assert.equal(ctx.progression.run.holesDone, 0);
});

test('v4 accepted job migrates and its first legitimate completion remains payable', async () => {
  const ctx = await fresh(), contract = fixture(3);
  accept(ctx, contract);
  writeV4(ctx);
  const reloaded = await fresh(ctx.store);
  assert.equal(reloaded.progression.serialise().version, SAVE_VERSION);
  assert.equal(reloaded.progression.run.holesDone, 0);
  const settlement = reloaded.progression.completeHole(completion(reloaded.state.contract));
  assert.ok(settlement);
  assert.equal(settlement.hole, 1);
  assert.equal(reloaded.progression.save(), true);
  assert.equal(JSON.parse(ctx.store.getItem(SAVE_KEY)).version, SAVE_VERSION);
});

test('v4 partially paid job migrates safely and resumes on its next drill-start', async () => {
  const ctx = await fresh(), contract = fixture(3), first = completion(contract);
  accept(ctx, contract); start(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, first);
  writeV4(ctx);
  const reloaded = await fresh(ctx.store);
  assert.equal(reloaded.progression.run.holesDone, 1);
  const before = book(reloaded);
  reloaded.bus.emit(EVENTS.HOLE_COMPLETE, clone(first));
  assert.deepEqual(book(reloaded), before, 'Legacy payload cannot prove an unfinished next hole');
  start(reloaded);
  assert.equal(reloaded.progression.completeHole(completion(reloaded.state.contract, 2))?.hole, 2);
});

test('v4 settled job migrates without reopening or replaying its reward', async () => {
  const ctx = await fresh(), contract = fixture(1), payload = completion(contract);
  accept(ctx, contract); start(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  writeV4(ctx);
  const reloaded = await fresh(ctx.store), before = book(reloaded);
  assert.equal(reloaded.state.contract, null);
  assert.equal(reloaded.state.world.site.live, false);
  reloaded.bus.emit(EVENTS.HOLE_COMPLETE, clone(payload));
  assert.deepEqual(book(reloaded), before);
});

test('explicit repeat of the same rescue contract opens a new payable run after reload', async () => {
  let ctx = await fresh();
  const contract = ctx.progression.rescueContract();
  assert.ok(contract.id);
  assert.ok(contract.holes > 0);
  for (let cycle = 1; cycle <= 2; cycle++) {
    accept(ctx, contract);
    assert.equal(ctx.progression.run.holesDone, 0);
    for (let index = 1; index <= contract.holes; index++) {
      start(ctx);
      const settlement = ctx.progression.completeHole(completion(ctx.state.contract, index));
      assert.equal(settlement?.hole, index);
    }
    assert.equal(ctx.state.player.career.contractsDone, cycle);
    assert.equal(ctx.state.player.stats.holesDone, contract.holes * cycle);
    assert.equal(ctx.progression.save(), true);
    if (cycle === 1) ctx = await fresh(ctx.store);
  }
});

test('reset clears settlement state, restores the actual starter loadout and permits new work', async () => {
  const ctx = await fresh(), oldContract = fixture(1), oldPayload = completion(oldContract);
  accept(ctx, oldContract); start(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, oldPayload);
  ctx.progression.reset();
  assert.equal(ctx.state.contract, null);
  assert.equal(ctx.state.world.site, null);
  assert.equal(ctx.progression.run, null);
  assert.equal(ctx.state.player.stats.holesDone, 0);
  assert.equal(ctx.state.player.career.contractsDone, 0);
  assert.equal(ctx.state.player.career.ledger.length, 0);
  const seed = createGameState();
  assert.equal(ctx.state.garage.rigId, seed.garage.rigId);
  assert.deepEqual(ctx.state.garage.owned, seed.garage.owned);
  assert.deepEqual(ctx.state.garage.loadout, seed.garage.loadout);
  const before = book(ctx);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, oldPayload);
  assert.deepEqual(book(ctx), before);
  accept(ctx, oldContract); start(ctx);
  assert.equal(ctx.progression.completeHole(completion(ctx.state.contract))?.complete, true);
  assert.equal(ctx.state.player.career.contractsDone, 1);
});

{
  test('a delayed real-sim completion cannot settle a newly started hole', async () => {
    const ctx = await fresh(), contract = fixture(3);
    accept(ctx, contract);
    const sim = createDrillSim({ state: ctx.state, bus: ctx.bus, progression: ctx.progression });
    sim.startHole(ctx.state.contract);
    sim.debug.stepFixed(60);
    sim.debug.setDepth(contract.targetDepth);
    sim.debug.stepFixed(10);
    const oldPayload = clone(ctx.events.find(({ event }) => event === EVENTS.HOLE_COMPLETE)?.payload);
    assert.ok(oldPayload, 'Capture an actual simulation completion');
    assert.equal(ctx.progression.run.holesDone, 1);
    sim.startHole(ctx.state.contract);
    const before = book(ctx);
    ctx.bus.emit(EVENTS.HOLE_COMPLETE, oldPayload);
    const after = book(ctx);
    report('delayed real-sim completion after a new start', before, after);
    sim.dispose();
    assert.deepEqual(after, before, 'Previously completed hole must not be mistaken for newly started hole');
  });
}

// The queue is an event-delivery boundary, not a substitute simulation or
// settlement implementation. Payloads and all their economic values come from
// complete() in the actual drilling module. Delivery is explicitly controlled
// so a completion can arrive after a later lifecycle transition.
function realSim(ctx, { delayed = false } = {}) {
  const pending = [];
  const emitted = [];
  const bus = {
    ...ctx.bus,
    emit(event, payload) {
      if (event === EVENTS.HOLE_COMPLETE) {
        emitted.push(payload);
        if (delayed) { pending.push(payload); return; }
      }
      ctx.bus.emit(event, payload);
    },
  };
  const sim = createDrillSim({ state: ctx.state, bus, progression: ctx.progression });
  return {
    sim, pending, emitted,
    finish() {
      assert.equal(sim.active, true, 'A real active simulation must exist');
      sim.debug.stepFixed(60);
      sim.debug.setDepth(sim.debug.state.target);
      sim.debug.stepFixed(10);
      assert.equal(sim.active, false, 'Real fixed steps must finish the attempt');
      assert.ok(emitted.length, 'The simulation must actually emit its completion');
      return emitted.at(-1);
    },
    deliver(payload = pending.shift()) {
      assert.ok(payload, 'A real queued completion must exist');
      ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
    },
  };
}

function ids(payload) {
  assert.ok(payload?.runId != null && payload?.attemptId != null,
    'Actual simulation events must identify the accepted run and attempt');
  return { runId: payload.runId, attemptId: payload.attemptId };
}

function unchangedAfter(ctx, payload, label) {
  const before = book(ctx);
  const beforeState = clone(ctx.state);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  const after = book(ctx);
  report(label, before, after);
  assert.deepEqual(after, before, label);
  assert.deepEqual(ctx.state, beforeState, `${label}: all shared game state stays unchanged`);
}

function settleFresh(ctx, rig) {
  const beforeHoles = ctx.state.player.stats.holesDone;
  rig.sim.startHole(ctx.state.contract);
  const payload = rig.finish();
  rig.deliver(payload);
  assert.equal(ctx.state.player.stats.holesDone, beforeHoles + 1,
    'The replacement simulation result must settle exactly once');
  unchangedAfter(ctx, clone(payload), 'Replacement result duplicate');
  return payload;
}

test('real delayed completion remains stale after an active abort and restart', async () => {
  const ctx = await fresh(); accept(ctx, fixture(3));
  const rig = realSim(ctx, { delayed: true });
  try {
    rig.sim.startHole(ctx.state.contract);
    const stale = rig.finish();
    const oldIds = ids(stale);
    rig.sim.startHole(ctx.state.contract);
    assert.ok(rig.sim.abortHole('regression-retry'), 'An actual active attempt must abort');
    rig.sim.startHole(ctx.state.contract);
    unchangedAfter(ctx, stale, 'Delayed completion after active abort/restart');
    assert.deepEqual(ids(stale), oldIds, 'Old event identity cannot be rewritten by later starts');
    const current = rig.finish(); rig.deliver(current);
    assert.equal(ctx.state.player.stats.holesDone, 1);
    assert.notDeepEqual(ids(current), oldIds);
    unchangedAfter(ctx, clone(current), 'Current result after abort/restart pays once');
  } finally { rig.sim.dispose(); }
});

test('queued real completion cannot settle an abandoned and reaccepted same contract ID', async () => {
  const ctx = await fresh(), contract = fixture(3); accept(ctx, contract);
  const rig = realSim(ctx, { delayed: true });
  try {
    rig.sim.startHole(ctx.state.contract); const stale = rig.finish();
    assert.equal(ctx.progression.abandonContract().ok, true);
    accept(ctx, contract); rig.sim.startHole(ctx.state.contract);
    unchangedAfter(ctx, stale, 'Old accepted run after same-ID abandon/reaccept');
    const current = rig.finish(); rig.deliver(current);
    assert.notEqual(ids(current).runId, ids(stale).runId);
    assert.equal(ctx.state.player.stats.holesDone, 1);
    unchangedAfter(ctx, clone(current), 'Reaccepted same-ID result pays once');
  } finally { rig.sim.dispose(); }
});

test('same rescue posting reaccept after reload rejects the previous real run result', async () => {
  let ctx = await fresh(); const contract = ctx.progression.rescueContract(); accept(ctx, contract);
  const original = realSim(ctx); let stale;
  try {
    for (let hole = 0; hole < contract.holes; hole++) {
      original.sim.startHole(ctx.state.contract); stale = original.finish();
    }
  } finally { original.sim.dispose(); }
  assert.equal(ctx.state.player.career.contractsDone, 1);
  assert.equal(ctx.progression.save(), true);
  ctx = await fresh(ctx.store); accept(ctx, contract);
  const replacement = realSim(ctx, { delayed: true });
  try {
    replacement.sim.startHole(ctx.state.contract);
    unchangedAfter(ctx, stale, 'Old rescue result after reload and explicit same-ID reaccept');
    const current = replacement.finish(); replacement.deliver(current);
    assert.notEqual(ids(current).runId, ids(stale).runId);
    assert.equal(ctx.state.player.stats.holesDone, contract.holes + 1);
    unchangedAfter(ctx, clone(current), 'New rescue result pays once');
  } finally { replacement.sim.dispose(); }
});

test('reload invalidates the saved physical attempt and a real restart settles exactly once', async () => {
  const ctx = await fresh(); accept(ctx, fixture(3));
  const rig = realSim(ctx, { delayed: true }); let stale;
  try {
    rig.sim.startHole(ctx.state.contract); stale = rig.finish();
    assert.equal(ctx.progression.save(), true);
  } finally { rig.sim.dispose(); }
  // Reload restores the career accumulator, but not an in-flight physical
  // simulation: the old attempt is stale even before starting at the collar.
  const resumed = await fresh(ctx.store);
  unchangedAfter(resumed, clone(stale), 'Saved physical result rejected immediately after reload');
  assert.equal(resumed.state.player.stats.holesDone, 0);
  // Reload the same saved bytes: restarting physics supersedes the old attempt.
  const restarted = await fresh(ctx.store), replacement = realSim(restarted, { delayed: true });
  try {
    replacement.sim.startHole(restarted.state.contract);
    unchangedAfter(restarted, stale, 'Saved old attempt after actual simulation restart');
    const current = replacement.finish(); replacement.deliver(current);
    assert.equal(ids(current).runId, ids(stale).runId);
    assert.notEqual(ids(current).attemptId, ids(stale).attemptId);
    assert.equal(restarted.state.player.stats.holesDone, 1);
    unchangedAfter(restarted, clone(current), 'Reload replacement result pays once');
  } finally { replacement.sim.dispose(); }
});

test('real unpaid preview completion cannot settle itself or a later same-ID accepted job', async () => {
  const ctx = await fresh(), contract = fixture(3);
  ctx.state.contract = contract; // The application's no-run QA preview bridge.
  const rig = realSim(ctx, { delayed: true });
  try {
    rig.sim.startHole(contract); const preview = rig.finish();
    assert.equal(preview.runId, null);
    assert.equal(preview.attemptId, null);
    assert.equal(ctx.progression.run, null);
    unchangedAfter(ctx, preview, 'Unaccepted real preview result cannot create accounting');
    ctx.state.contract = null;
    accept(ctx, contract);
    unchangedAfter(ctx, preview, 'Unpaid preview cannot claim accepted run before first physical start');
    rig.sim.startHole(ctx.state.contract);
    unchangedAfter(ctx, preview, 'Unpaid preview result cannot claim newly accepted same-ID run');
    const current = rig.finish(); rig.deliver(current);
    ids(current);
    assert.equal(ctx.state.player.stats.holesDone, 1);
    unchangedAfter(ctx, clone(current), 'Real work after unpaid preview pays once');
  } finally { rig.sim.dispose(); }
});

test('reset and same-ID reaccept cannot collide with the old real simulation identity', async () => {
  const ctx = await fresh(), contract = fixture(3); accept(ctx, contract);
  const rig = realSim(ctx, { delayed: true });
  try {
    rig.sim.startHole(ctx.state.contract); const stale = rig.finish();
    ctx.progression.reset(); accept(ctx, contract);
    rig.sim.startHole(ctx.state.contract);
    unchangedAfter(ctx, stale, 'Pre-reset real result after same-ID reaccept');
    const current = rig.finish(); rig.deliver(current);
    assert.notEqual(ids(current).runId, ids(stale).runId);
    assert.equal(ctx.state.player.stats.holesDone, 1);
    unchangedAfter(ctx, clone(current), 'Post-reset result pays once');
  } finally { rig.sim.dispose(); }
});

test('simulation completion carries its start identity even when progression allocates another attempt', async () => {
  const ctx = await fresh(); accept(ctx, fixture(3));
  const rig = realSim(ctx, { delayed: true });
  try {
    rig.sim.startHole(ctx.state.contract);
    const original = ids(ctx.events.find(({ event }) => event === EVENTS.DRILL_START)?.payload);
    const newer = ctx.progression.beginHole(ctx.state.contract);
    assert.ok(Object.isFrozen(newer), 'Public beginHole identity must be immutable');
    assert.notDeepEqual(ids(newer), original);
    const stale = rig.finish();
    assert.deepEqual(ids(stale), original, 'Completion must publish captured start identity');
    unchangedAfter(ctx, stale, 'In-flight simulation cannot claim subsequently allocated identity');
    const current = settleFresh(ctx, rig);
    assert.notDeepEqual(ids(current), original);
  } finally { rig.sim.dispose(); }
});

test('synchronous next-hole listener and delayed real event replay preserve exactly-once settlement', async () => {
  const ctx = await fresh(); accept(ctx, fixture(3));
  const rig = realSim(ctx); let startedNext = false, delayedReplay;
  ctx.bus.on(EVENTS.HOLE_COMPLETE, (payload) => {
    if (startedNext) return;
    startedNext = true;
    rig.sim.startHole(ctx.state.contract);
    delayedReplay = Promise.resolve().then(() => unchangedAfter(ctx, payload,
      'Microtask replay after synchronous next-hole listener'));
  });
  try {
    rig.sim.startHole(ctx.state.contract);
    // A listener restarts the sim during completion dispatch, so this test
    // intentionally does not assert inactive after the final fixed step.
    rig.sim.debug.stepFixed(60);
    rig.sim.debug.setDepth(rig.sim.debug.state.target);
    rig.sim.debug.stepFixed(1);
    assert.equal(startedNext, true, 'Synchronous listener must actually start the next hole');
    assert.equal(rig.sim.active, true);
    assert.equal(ctx.state.player.stats.holesDone, 1);
    const firstResult = rig.emitted[0];
    const firstStop = ctx.events.find(({ event, payload }) => event === EVENTS.DRILL_STOP && payload.reason === 'complete');
    assert.deepEqual(ids(firstStop?.payload), ids(firstResult),
      'Trailing stop must retain completed attempt identity after listener starts next hole');
    await delayedReplay;
    const second = rig.finish();
    assert.equal(ctx.state.player.stats.holesDone, 2);
    unchangedAfter(ctx, clone(second), 'Synchronous-listener replacement result pays once');
  } finally { rig.sim.dispose(); }
});

let passed = 0;
const failures = [];
try {
  for (const { name, fn } of testCases) {
    _resetWarnings();
    try {
      const originalError = console.error, originalWarn = console.warn, busErrors = [];
      console.error = (...args) => { busErrors.push(args.map(String).join(' ')); };
      console.warn = (...args) => { diagnostics.push({ case: name, message: String(args[0]) }); };
      try {
        await fn();
        assert.deepEqual(busErrors, [], 'Production bus must not swallow a listener or accounting error');
      } finally { console.error = originalError; console.warn = originalWarn; }
      passed++; console.log(`PASS ${name}`);
    }
    catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message.slice(0, 350)}`); }
  }
  console.log(JSON.stringify({ cases: testCases.length, passed, failed: failures.length, measurements, diagnostics }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
  else delete globalThis.localStorage;
}
