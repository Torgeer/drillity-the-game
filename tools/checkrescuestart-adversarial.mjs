#!/usr/bin/env node
/** Independent rescue acceptance critic. CPU only; in-memory saves.
 * Fixture debts, contract mutations and stepping are test inputs, not tuning.
 * Run: node tools/checkrescuestart-adversarial.mjs
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { emergencyContract } from '../src/game/economy.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const cases = [];
const test = (name, fn) => cases.push({ name, fn });

async function fixture({ money = -2000, values = new Map(), restore = false } = {}) {
  const storage = { getItem: k => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  const state = createGameState(), bus = createBus(), events = [];
  const progression = createProgression({ state, bus, rand: makeRandom(456) });
  await progression.init();
  if (!restore) state.player.money = money;
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  const sim = createDrillSim({ state, bus, progression });
  return { state, progression, sim, events, values,
    close() { sim.dispose(); progression.dispose(); } };
}

function snapshot(f) {
  return JSON.stringify({ state: f.state, run: f.progression.run, save: f.progression.serialise(),
    events: f.events, storage: [...f.values], telemetry: f.sim.getTelemetry() });
}

function assertRefusedWithoutMutation(f, contract, reason) {
  const before = snapshot(f);
  const quote = f.progression.previewContract(contract);
  assert.equal(quote.ok, false, 'the negative control must be refused');
  if (reason) assert.match(quote.reason, reason);
  assert.deepEqual(f.progression.acceptContract(contract), quote);
  assert.equal(snapshot(f), before, 'refusal preserves accounting, contract, save and events');
  return quote;
}

for (const debt of [-1, -2000, -1e6]) {
  test(`canonical local rescue starts with debt ${debt} without forgiving it`, async () => {
    const f = await fixture({ money: debt });
    try {
      assert.equal(f.progression.canAfford(0), false, 'general affordability remains strict');
      assert.equal(f.progression.isBroke(), true);
      const contract = f.progression.getContracts().find(c => c.emergency === true);
      assert.ok(contract, 'use the actual contract-board rescue');
      const before = snapshot(f);
      const quote = f.progression.previewContract(contract);
      assert.equal(quote.ok, true, quote.reason);
      assert.equal(quote.mobilisation, 0);
      assert.equal(snapshot(f), before, 'successful preview is still read-only');
      const moneyEvents = f.events.filter(event => event.event === EVENTS.MONEY_CHANGE).length;
      assert.equal(f.progression.acceptContract(structuredClone(contract)).ok, true);
      assert.equal(f.state.player.money, debt);
      assert.equal(f.events.filter(event => event.event === EVENTS.MONEY_CHANGE).length, moneyEvents);
      const start = f.sim.startHole(f.state.contract);
      assert.equal(start.methodId, 'auger');
      assert.ok(f.progression.run.attemptId);
      assert.equal(f.progression.run.mobilisation, 0);
      assert.equal(f.state.player.money, debt);
    } finally { f.close(); }
  });
}

test('ordinary local contracts remain blocked in debt despite zero travel cost', async () => {
  const f = await fixture();
  try {
    const c = { ...f.progression.rescueContract(), id: 'ordinary-local', emergency: false };
    assert.equal(assertRefusedWithoutMutation(f, c, /Mobilisation/).mobilisation, 0);
  } finally { f.close(); }
});

for (const [name, edit] of [
  ['emergency flag removed', c => { delete c.emergency; }],
  ['truthy non-boolean emergency flag', c => { c.emergency = 'true'; }],
  ['ordinary card tagged emergency', c => { c.id = 'ordinary-tagged'; }],
  ['stale level identity', c => { c.id = c.id.replace(/-1$/, '-2'); }],
  ['inflated payout', c => { c.payout += 1; }],
  ['different target depth', c => { c.targetDepth += 1; }],
  ['different hole count', c => { c.holes += 1; }],
]) {
  test(`rescue exemption rejects ${name}`, async () => {
    const f = await fixture();
    try {
      const c = structuredClone(f.progression.rescueContract());
      edit(c);
      assertRefusedWithoutMutation(f, c);
    } finally { f.close(); }
  });
}

test('a borrowed rescue identity in another zero-fee region is refused', async () => {
  const f = await fixture();
  try {
    const c = { ...f.progression.rescueContract(), regionId: 'german-site' };
    f.state.player.career.lastRegionId = c.regionId;
    f.state.world.regionId = c.regionId;
    assert.equal(assertRefusedWithoutMutation(f, c).mobilisation, 0);
  } finally { f.close(); }
});

test('rescue with positive mobilisation remains unaffordable in debt', async () => {
  const f = await fixture();
  try {
    // Use an explicit foreign posting: the normal rescue provider deliberately
    // keeps Nordic home even if the saved unlocked list has another order.
    f.state.unlocked.regions = ['german-site', 'nordic'];
    const quote = assertRefusedWithoutMutation(f, emergencyContract(f.state.player.level, 'german-site'), /Mobilisation/);
    assert.ok(quote.mobilisation > 0, 'a real cross-region fee was measured');
  } finally { f.close(); }
});

test('paid normal work still requires the complete fee and charges it once', async () => {
  const f = await fixture({ money: 1e6 });
  try {
    const c = { ...f.progression.rescueContract(), id: 'ordinary-foreign', emergency: false, regionId: 'german-site' };
    const ready = f.progression.previewContract(c);
    assert.equal(ready.ok, true, ready.reason);
    assert.ok(ready.mobilisation > 0);
    f.state.player.money = ready.mobilisation - 1;
    assertRefusedWithoutMutation(f, c, /Mobilisation/);
    f.state.player.money = ready.mobilisation;
    assert.equal(f.progression.acceptContract(c).ok, true);
    assert.equal(f.state.player.money, 0);
    assert.equal(f.progression.run.mobilisation, ready.mobilisation);
    assertRefusedWithoutMutation(f, c, /active contract/);
    assert.equal(f.state.player.money, 0);
  } finally { f.close(); }
});

for (const [name, alter, expected] of [
  ['missing owned rig', f => { f.state.unlocked.rigs = []; }, /No owned rig/],
  ['locked method', f => { f.state.unlocked.methods = []; }, /Requires/],
  ['missing required certificate', (_f, c) => { c.requiredCerts = ['critic-missing-certificate']; }, /Needs/],
  ['excessive depth', (_f, c) => { c.targetDepth = 1000000; }, /rated/],
]) {
  test(`free rescue still respects ${name}`, async () => {
    const f = await fixture();
    try {
      const c = structuredClone(f.progression.rescueContract());
      alter(f, c);
      assertRefusedWithoutMutation(f, c, expected);
    } finally { f.close(); }
  });
}

test('a pending accepted run blocks rescue even if the public contract field is cleared', async () => {
  const f = await fixture({ money: 0 });
  try {
    assert.equal(f.progression.acceptContract(f.progression.rescueContract()).ok, true);
    f.state.player.money = -2000;
    f.state.contract = null;
    assert.ok(f.progression.run);
    assertRefusedWithoutMutation(f, f.progression.rescueContract(), /active contract/);
  } finally { f.close(); }
});

test('an existing public contract blocks rescue without an accepted progression run', async () => {
  const f = await fixture();
  try {
    f.state.contract = { ...f.progression.rescueContract(), id: 'retained-site-contract' };
    assert.equal(f.progression.run, null);
    assertRefusedWithoutMutation(f, f.progression.rescueContract(), /active contract/);
  } finally { f.close(); }
});

test('a restored accepted rescue resumes its own attempt and cannot be replaced', async () => {
  const first = await fixture();
  let saved;
  try {
    assert.equal(first.progression.acceptContract(first.progression.rescueContract()).ok, true);
    assert.equal(first.progression.save(), true);
    saved = new Map(first.values);
  } finally { first.close(); }
  const f = await fixture({ values: saved, restore: true });
  try {
    assert.equal(f.state.player.money, -2000);
    assert.ok(f.progression.run);
    assertRefusedWithoutMutation(f, f.progression.rescueContract(), /active contract/);
    const runId = f.progression.run.runId;
    assert.equal(f.sim.startHole(f.state.contract).methodId, 'auger');
    assert.equal(f.progression.run.runId, runId);
    assert.ok(f.progression.run.attemptId);
    assert.equal(f.state.player.money, -2000);
  } finally { f.close(); }
});

let passed = 0;
try {
  for (const { name, fn } of cases) {
    await fn();
    passed++;
    console.log('PASS ' + name);
  }
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
assert.equal(passed, cases.length);
console.log(`Rescue start adversarial: PASS ${passed} cases; actual debt starts, paid boundary, forged-card controls and saved-run protection.`);
