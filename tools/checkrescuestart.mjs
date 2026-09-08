#!/usr/bin/env node
/** Real progression + sim start and settlement recovery. CPU only.
 * The slow-job fixture replays supported completion records; the recovery
 * fixture uses the sim's depth-skip QA API, not a timed performance run.
 * Run: node tools/checkrescuestart.mjs
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { makeContract } from '../src/game/data.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
async function fixture(money) {
  const entries = new Map();
  globalThis.localStorage = {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: key => entries.delete(key),
  };
  const state = createGameState(), bus = createBus(), events = [];
  const progression = createProgression({ state, bus, rand: makeRandom(10) });
  await progression.init();
  state.player.money = money;
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  const sim = createDrillSim({ state, bus, progression });
  return { state, bus, progression, sim, events,
    dispose() { sim.dispose(); progression.dispose(); } };
}
function book(f) { return structuredClone({ state: f.state, save: f.progression.serialise() }); }
function start(f) {
  const result = f.sim.startHole(f.state.contract);
  assert.equal(result.active, true, 'actual simulation starts');
  assert.ok(f.progression.run.attemptId, 'actual start allocates payment identity');
  return { runId: f.progression.run.runId, attemptId: f.progression.run.attemptId };
}
function refuse(f, contract) {
  const before = book(f), eventCount = f.events.length;
  assert.equal(f.progression.previewContract(contract).ok, false);
  assert.equal(f.progression.acceptContract(contract).ok, false);
  assert.deepEqual(book(f), before, 'refusal has no state or save mutations');
  assert.equal(f.events.length, eventCount, 'refusal publishes no events');
}
let passes = 0;
try {
  const f = await fixture(-1);
  try {
    const contract = structuredClone(f.progression.rescueContract());
    assert.equal(f.progression.isBroke(), true);
    assert.equal(f.progression.canAfford(0), false, 'general affordability remains unchanged');
    const before = book(f), eventCount = f.events.length;
    for (let i = 0; i < 25; i++) {
      assert.equal(f.progression.previewContract(contract).ok, true, 'debt must not prevent the zero-cost rescue');
    }
    assert.deepEqual(book(f), before, 'preview stays read-only');
    assert.equal(f.events.length, eventCount);
    const accept = f.progression.acceptContract(contract);
    assert.equal(accept.ok, true);
    assert.equal(accept.mobilisation, 0);
    assert.equal(f.state.player.money, -1, 'acceptance does not forgive debt');
    start(f);
    passes++;
  } finally { f.dispose(); }

  const f2 = await fixture(0);
  try {
    const contract = f2.progression.rescueContract();
    assert.equal(f2.progression.acceptContract(contract).ok, true);
    // QA completion records use a real sim-issued attempt, grade D and the
    // production upper performance ratio. No invented hazard penalties.
    for (let hole = 0; hole < contract.holes; hole++) {
      const identity = start(f2);
      const settled = f2.progression.completeHole({ contract, ...identity,
        depth: contract.targetDepth, methodId: contract.methodId, grade: 'D',
        breakdown: { time: { parSec: 60, actualSec: 180 } } });
      assert.ok(settled);
    }
    assert.equal(f2.state.contract, null);
    const debt = f2.state.player.money;
    assert.ok(debt < 0, 'a supported slow rescue settlement really creates debt');
    const recovery = f2.progression.rescueContract();
    assert.equal(f2.progression.previewContract(recovery).ok, true);
    assert.equal(f2.progression.acceptContract(recovery).ok, true);
    for (let hole = 0; hole < recovery.holes; hole++) {
      start(f2);
      const count = f2.events.filter(e => e.event === EVENTS.HOLE_COMPLETE).length;
      f2.sim.debug.stepFixed(60);
      f2.sim.debug.setDepth(recovery.targetDepth);
      f2.sim.debug.stepFixed(10);
      assert.equal(f2.events.filter(e => e.event === EVENTS.HOLE_COMPLETE).length, count + 1,
        'actual sim completion reaches progression settlement');
    }
    assert.equal(f2.state.contract, null);
    assert.ok(f2.state.player.money > 0, 'earned settlement recovers this debt without a balance grant');
    console.log(`Recovery fixture: slow-job balance ${debt}, after completed QA recovery ${f2.state.player.money}.`);
    passes++;
  } finally { f2.dispose(); }

  const f3 = await fixture(-1);
  try {
    const rescue = f3.progression.rescueContract();
    const ordinary = makeContract('nordic', 1, makeRandom(91));
    refuse(f3, ordinary);
    refuse(f3, { ...ordinary, emergency: true });
    for (const [key, value] of [ ['id', 'ordinary-job'], ['methodId', 'top-hammer'],
      ['regionId', 'german-site'], ['targetDepth', rescue.targetDepth + 1],
      ['holes', rescue.holes + 1], ['payout', rescue.payout + 1], ['emergency', false] ]) {
      refuse(f3, { ...rescue, [key]: value });
    }
    // The paid job's normal guard holds both below zero and just short of its
    // actual transport quote, even when it is marked as an emergency.
    const away = { ...ordinary, id: 'qa-paid-local-authority', regionId: 'german-site' };
    const quote = f3.progression.previewContract(away).mobilisation;
    assert.ok(quote > 0);
    for (const amount of [-1, quote - 1]) {
      f3.state.player.money = amount;
      refuse(f3, away);
      refuse(f3, { ...away, emergency: true });
    }
    f3.state.player.money = quote;
    assert.equal(f3.progression.acceptContract(away).ok, true);
    assert.equal(f3.state.player.money, 0, 'paid job charges its full transport cost');
    passes++;
  } finally { f3.dispose(); }
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
console.log(`Rescue start: PASS ${passes} groups (debt start, actual completion recovery, normal/paid negative controls).`);
