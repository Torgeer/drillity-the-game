#!/usr/bin/env node
// Adversarial protocol tests execute the real progression, simulation and bus.
// Only browser storage is replaced; depth/time skipping uses the sim QA API.
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { makeContract } from '../src/game/data.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';

const clone = structuredClone;
const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const cases = [], measurements = [], diagnostics = [];
function test(name, fn) { cases.push({ name, fn }); }
function storage() {
  const entries = new Map();
  return { fail: false, getItem: (key) => entries.get(key) ?? null,
    setItem(key, value) { if (this.fail) throw new Error('test write denial'); entries.set(key, String(value)); },
    removeItem: (key) => entries.delete(key) };
}
function fixture() {
  const rand = makeRandom(20260906);
  for (let i = 0; i < 1000; i++) {
    const c = makeContract('nordic', 1, rand);
    if (c.holes === 3) return c;
  }
  throw new Error('No production three-hole contract');
}
async function fresh(store = storage()) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus(), events = [];
  const progression = createProgression({ state, bus, rand: makeRandom(11), SCENES });
  await progression.init();
  for (const event of [EVENTS.DRILL_START, EVENTS.DRILL_STOP, EVENTS.HOLE_COMPLETE]) {
    bus.on(event, (payload) => events.push({ event, payload: clone(payload) }));
  }
  const sim = createDrillSim({ state, bus, progression });
  return { state, bus, progression, sim, events, store };
}
function accept(ctx, c = fixture()) {
  assert.equal(ctx.progression.acceptContract(c).ok, true);
  return c;
}
function start(ctx) {
  assert.ok(ctx.sim.startHole(ctx.state.contract), 'Actual sim starts accepted work');
  const payload = ctx.events.filter((e) => e.event === EVENTS.DRILL_START).at(-1)?.payload;
  assert.ok(payload?.runId != null && payload?.attemptId != null, 'Real start carries explicit identity');
  return clone(payload);
}
function finish(ctx) {
  const count = ctx.events.filter((e) => e.event === EVENTS.HOLE_COMPLETE).length;
  ctx.sim.debug.stepFixed(60);
  ctx.sim.debug.setDepth(ctx.state.contract.targetDepth);
  ctx.sim.debug.stepFixed(10);
  const found = ctx.events.filter((e) => e.event === EVENTS.HOLE_COMPLETE);
  assert.equal(found.length, count + 1, 'Actual simulation emitted one completion');
  return clone(found.at(-1).payload);
}
function book(ctx) { return clone(ctx.progression.serialise()); }
function sameIdentity(a, b) { return a.runId === b.runId && a.attemptId === b.attemptId; }

// These are old *actual* completion payloads, never constructed accounting records.
test('reset then reaccept same card never reuses a live process completion identity', async () => {
  const ctx = await fresh(), c = accept(ctx); start(ctx); const old = finish(ctx);
  ctx.progression.reset(); accept(ctx, c); const next = start(ctx);
  assert.equal(sameIdentity(old, next), false, 'Reset must not recycle IDs still held by delayed handlers');
  const before = book(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, old);
  assert.deepEqual(book(ctx), before); ctx.sim.dispose();
});

test('tokenless and partial-identity completions cannot downgrade an identified attempt', async () => {
  const ctx = await fresh(); accept(ctx); start(ctx); const old = finish(ctx); start(ctx);
  const before = book(ctx);
  for (const remove of [['runId', 'attemptId'], ['runId'], ['attemptId']]) {
    const stale = clone(old); for (const key of remove) delete stale[key];
    ctx.bus.emit(EVENTS.HOLE_COMPLETE, stale);
    assert.deepEqual(book(ctx), before, `Missing ${remove.join('/')} must reject without mutation`);
  }
  ctx.sim.dispose();
});

test('forged, tokenless and replayed DRILL_START cannot rearm a paid attempt', async () => {
  const ctx = await fresh(), c = accept(ctx), first = start(ctx); const paid = finish(ctx);
  const before = book(ctx);
  for (const payload of [first, { contract: c, methodId: c.methodId },
    { ...first, attemptId: 'invented-attempt' }, { ...first, runId: 'invented-run' }]) {
    ctx.bus.emit(EVENTS.DRILL_START, clone(payload));
    ctx.bus.emit(EVENTS.HOLE_COMPLETE, clone(paid));
    assert.deepEqual(book(ctx), before, 'A start notification is not authority to allocate a new hole');
  }
  ctx.sim.dispose();
});

test('loading an older same-process save preserves identity highwater', async () => {
  const ctx = await fresh(); accept(ctx); start(ctx); assert.equal(ctx.progression.save(), true);
  const oldSave = ctx.store.getItem(SAVE_KEY); finish(ctx); start(ctx); const later = finish(ctx);
  ctx.store.setItem(SAVE_KEY, oldSave); assert.equal(ctx.progression.load(), true);
  const next = start(ctx); assert.equal(sameIdentity(later, next), false);
  const before = book(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, later);
  assert.deepEqual(book(ctx), before);
  measurements.push({ case: 'older-save highwater', later: [later.runId, later.attemptId], next: [next.runId, next.attemptId] });
  ctx.sim.dispose();
});

test('an abandoned same-card run cannot settle after reload and fresh acceptance', async () => {
  const ctx = await fresh(), c = accept(ctx); start(ctx); const stale = finish(ctx);
  assert.equal(ctx.progression.abandonContract().ok, true); assert.equal(ctx.progression.save(), true); ctx.sim.dispose();
  const loaded = await fresh(ctx.store); accept(loaded, c); const next = start(loaded);
  assert.equal(sameIdentity(stale, next), false);
  const before = book(loaded); loaded.bus.emit(EVENTS.HOLE_COMPLETE, stale);
  assert.deepEqual(book(loaded), before); loaded.sim.dispose();
});

test('held completion cannot settle after a newer attempt is aborted', async () => {
  const ctx = await fresh(); accept(ctx);
  const originalEmit = ctx.bus.emit.bind(ctx.bus); let held;
  ctx.bus.emit = (event, payload) => {
    if (event === EVENTS.HOLE_COMPLETE) { held = clone(payload); return; }
    return originalEmit(event, payload);
  };
  start(ctx); ctx.sim.debug.stepFixed(60); ctx.sim.debug.setDepth(ctx.state.contract.targetDepth); ctx.sim.debug.stepFixed(10);
  assert.ok(held, 'Actual completion was held before progression');
  // Completion has already stopped the simulation. A new attempt is then
  // aborted; the held previous result must not become the aborted hole.
  start(ctx); ctx.sim.abortHole('adversarial-abort');
  const before = book(ctx); originalEmit(EVENTS.HOLE_COMPLETE, held);
  assert.deepEqual(book(ctx), before); ctx.sim.dispose();
});

test('reentrant next-hole start cannot rewrite prior completion and stop identity', async () => {
  const ctx = await fresh(); accept(ctx); const first = start(ctx); let restarted = false;
  ctx.bus.on(EVENTS.HOLE_COMPLETE, () => {
    if (!restarted) { restarted = true; start(ctx); }
  });
  const completed = finish(ctx);
  assert.equal(restarted, true); assert.ok(sameIdentity(first, completed));
  const stops = ctx.events.filter((e) => e.event === EVENTS.DRILL_STOP);
  const stop = stops.at(-1)?.payload;
  assert.ok(stop && sameIdentity(stop, first), 'Post-completion stop must carry old identity after reentrant next start');
  const next = ctx.events.filter((e) => e.event === EVENTS.DRILL_START).at(-1).payload;
  assert.equal(sameIdentity(next, completed), false);
  const before = book(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, completed);
  assert.deepEqual(book(ctx), before); assert.equal(ctx.sim.active, true); ctx.sim.dispose();
});

test('failed save then older reload does not recycle a completed attempt', async () => {
  const ctx = await fresh(); accept(ctx); start(ctx); assert.equal(ctx.progression.save(), true);
  finish(ctx); start(ctx); const later = finish(ctx);
  ctx.store.fail = true; assert.equal(ctx.progression.save(), false); ctx.store.fail = false;
  assert.equal(ctx.progression.load(), true); const next = start(ctx);
  assert.equal(sameIdentity(next, later), false);
  const before = book(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, later);
  assert.deepEqual(book(ctx), before); ctx.sim.dispose();
});

test('unpaid real-sim preview cannot become payable after later matching acceptance', async () => {
  const ctx = await fresh(), c = fixture();
  ctx.state.contract = c;
  assert.ok(ctx.sim.startHole(c), 'Existing no-run QA preview remains usable');
  const preview = finish(ctx);
  assert.equal(ctx.state.player.stats.holesDone, 0, 'Unaccepted preview pays no reward');
  ctx.state.contract = null; accept(ctx, c); start(ctx);
  const before = book(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, preview);
  assert.deepEqual(book(ctx), before); ctx.sim.dispose();
});
test('an aborted current token cannot authorize settlement even without a new start', async () => {
  const ctx = await fresh(); accept(ctx); start(ctx); const prior = finish(ctx);
  const current = start(ctx); ctx.sim.abortHole('adversarial-abort');
  // Intentional adversarial request: retain real generated result fields and
  // supply the actual just-aborted start token. This checks token revocation,
  // not the economy calculation or simulation of an impossible drill result.
  const attempted = { ...prior, runId: current.runId, attemptId: current.attemptId };
  const before = book(ctx); ctx.bus.emit(EVENTS.HOLE_COMPLETE, attempted);
  assert.deepEqual(book(ctx), before); ctx.sim.dispose();
});
test('a rejected allocation leaves the accepted run and identity sequence unchanged', async () => {
  const ctx = await fresh(); accept(ctx); start(ctx); const before = book(ctx);
  for (const contract of [null, {}, { ...ctx.state.contract, id: 'different-contract' }]) {
    assert.equal(ctx.progression.beginHole(contract), null);
    assert.deepEqual(book(ctx), before);
  }
  ctx.sim.dispose();
});

test('stale and tokenless abort notifications cannot cancel a newer real attempt', async () => {
  const ctx = await fresh(); accept(ctx); const old = start(ctx);
  ctx.sim.abortHole('first-abort'); start(ctx); const before = book(ctx);
  for (const payload of [
    { reason: 'aborted', runId: old.runId, attemptId: old.attemptId },
    { reason: 'aborted' },
    { reason: 'aborted', runId: old.runId, attemptId: 'invented-attempt' },
  ]) {
    ctx.bus.emit(EVENTS.DRILL_STOP, payload); assert.deepEqual(book(ctx), before);
  }
  finish(ctx); assert.equal(ctx.state.player.stats.holesDone, 1); ctx.sim.dispose();
});
let passed = 0;
const errors = [];
try {
  for (const { name, fn } of cases) {
    const originalError = console.error, originalWarn = console.warn, busErrors = [];
    console.error = (...args) => busErrors.push(args.map(String).join(' '));
    console.warn = (...args) => diagnostics.push({ case: name, message: String(args[0]) });
    try {
      await fn(); assert.deepEqual(busErrors, [], 'Real bus must not swallow handler exceptions');
      passed++; console.log(`PASS ${name}`);
    } catch (error) { errors.push({ name, message: error.message }); originalError(`FAIL ${name}: ${error.message.slice(0, 550)}`); }
    finally { console.error = originalError; console.warn = originalWarn; }
  }
  console.log(JSON.stringify({ cases: cases.length, passed, failed: errors.length, measurements, diagnostics }, null, 2));
  if (errors.length) process.exitCode = 1;
} finally {
  if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
  else delete globalThis.localStorage;
}
