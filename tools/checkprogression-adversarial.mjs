/**
 * Adversarial regression tests against the actual progression/economy modules.
 * Node-only event/storage doubles exercise browser boundaries without a GPU.
 * Fixtures use shipped contract generation and economic calculations unchanged.
 * Run: node tools/checkprogression-adversarial.mjs
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBus, createGameState, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY } from '../src/game/progression.js';
import { emergencyContract, travelCost } from '../src/game/economy.js';
import { CERTS, MAX_LEVEL, REGIONS } from '../src/game/data.js';

function memoryStorage() {
  const values = new Map();
  return {
    values,
    writes: [],
    failWrite: null,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      this.writes.push(key);
      if (this.failWrite?.(key)) throw new Error(`Injected write failure: ${key}`);
      values.set(key, String(value));
    },
    removeItem(key) { values.delete(key); },
  };
}

async function session(store = memoryStorage()) {
  globalThis.localStorage = store;
  const state = createGameState();
  const bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(5197), SCENES });
  await progression.init();
  return { store, state, bus, progression };
}

function completion(contract) {
  return {
    contract,
    depth: contract.targetDepth,
    methodId: contract.methodId,
    grade: 'C',
    breakdown: { time: { parSec: 60, actualSec: 60 } },
  };
}

function accounting(progression) {
  const saved = progression.serialise();
  return { player: saved.player, garage: saved.garage, contract: saved.contract, run: saved.run };
}

test('CONTRACT_ACCEPT notifications cannot open, replace or dirty a run', async () => {
  const { progression, bus, state, store } = await session();
  const contract = emergencyContract();
  const other = emergencyContract(2);
  for (const active of [false, true]) {
    if (active) assert.equal(progression.acceptContract(contract).ok, true);
    assert.equal(progression.save(), true);
    const before = structuredClone({ state, save: progression.serialise() });
    const run = progression.run;
    const saved = store.getItem(SAVE_KEY);
    const writes = store.writes.length;
    bus.emit(EVENTS.CONTRACT_ACCEPT, { contract: other });
    assert.deepEqual({ state, save: progression.serialise() }, before);
    assert.equal(progression.run, run, 'notification must not replace the accumulator');
    progression.update(2);
    assert.equal(store.getItem(SAVE_KEY), saved, 'notification must not dirty the save');
    assert.equal(store.writes.length, writes, 'notification must not schedule a redundant storage write');
  }
});

test('a payout observer cannot reenter settlement and pay the same hole twice', async () => {
  const { progression, bus, state } = await session();
  const contract = emergencyContract();
  assert.equal(progression.acceptContract(contract).ok, true);
  const payload = completion(contract);
  let attempted = false;
  let nestedResult;
  bus.on(EVENTS.MONEY_CHANGE, () => {
    if (attempted) return;
    attempted = true;
    nestedResult = progression.completeHole(payload);
  });
  const result = progression.completeHole(payload);
  assert.equal(attempted, true, 'the real payout event exercised the listener');
  assert.equal(nestedResult, null, 'in-flight settlement must reject reentry');
  assert.ok(result, 'the original completed hole settles');
  assert.equal(state.player.stats.holesDone, 1);
  assert.equal(state.player.career.ledger.length, 1);
  assert.equal(progression.run.holesDone, 1);
});

test('saving from payout notifications cannot persist a half-booked hole', async () => {
  const { progression, bus, store } = await session();
  const contract = emergencyContract();
  assert.equal(progression.acceptContract(contract).ok, true);
  progression.save();
  let attempted = false;
  let saveResult;
  bus.on(EVENTS.MONEY_CHANGE, () => {
    if (attempted) return;
    attempted = true;
    saveResult = progression.save();
  });
  progression.completeHole(completion(contract));
  assert.equal(attempted, true);
  const expected = accounting(progression);
  // A transaction may defer writes until it is complete, but must flush the
  // pending write through the real autosave path before claiming durability.
  if (!saveResult) progression.update(2);
  const restored = await session(store);
  assert.deepEqual(accounting(restored.progression), expected,
    'successful observer save must include costs, XP, wear, ledger and run progress together');
});

test('mobilisation observers cannot accept the same job twice in one dispatch', async () => {
  const { progression, bus, state } = await session();
  state.player.level = MAX_LEVEL;
  state.player.certs = CERTS.map(cert => cert.id);
  state.unlocked.regions = REGIONS.map(region => region.id);
  const destination = REGIONS.find((region) => region.id !== state.world.regionId
    && travelCost(state.world.regionId, region.id, { rigId: state.garage.rigId }) > 0);
  assert.ok(destination, 'fixture requires a real destination with mobilisation');
  const contract = emergencyContract(1, destination.id);
  const mobilisation = travelCost(state.world.regionId, destination.id, { rigId: state.garage.rigId });
  state.player.money = mobilisation * 3;
  const before = state.player.money;
  let attempted = false;
  let nestedResult;
  let acceptedEvents = 0;
  bus.on(EVENTS.CONTRACT_ACCEPT, () => { acceptedEvents += 1; });
  bus.on(EVENTS.MONEY_CHANGE, () => {
    if (attempted) return;
    attempted = true;
    nestedResult = progression.acceptContract(contract);
  });
  const result = progression.acceptContract(contract);
  assert.equal(result.ok, true);
  assert.equal(attempted, true);
  assert.equal(nestedResult.ok, false, 'nested acceptance must reject while the first is committing');
  assert.equal(state.player.money, before - mobilisation);
  assert.equal(acceptedEvents, 1);
  assert.equal(progression.run.mobilisation, mobilisation);
});

test('a structurally invalid primary falls back to a valid backup without partial mutation', async () => {
  const { progression, store } = await session();
  progression.addMoney(123, 'fixture progression');
  assert.equal(progression.save(), true);
  const good = store.getItem(SAVE_KEY);
  const malformed = JSON.parse(good);
  malformed.player.name = 'Partial primary must not leak';
  malformed.player.money = 7;
  malformed.unlocked.rigs = {};
  store.setItem(SAVE_BACKUP_KEY, good);
  store.setItem(SAVE_KEY, JSON.stringify(malformed));
  const expected = accounting(progression);
  const restored = await session(store);
  assert.deepEqual(accounting(restored.progression), expected);
});

test('a null consumed career collection cannot bypass structural backup validation', async () => {
  for (const key of ['ledger', 'reputation', 'certExpiry', 'firstTimes']) {
    const { progression, store } = await session();
    progression.addMoney(123, 'fixture progression');
    assert.equal(progression.save(), true);
    const good = store.getItem(SAVE_KEY);
    const malformed = JSON.parse(good);
    malformed.player.money = 7;
    malformed.player.career[key] = null;
    store.setItem(SAVE_BACKUP_KEY, good);
    store.setItem(SAVE_KEY, JSON.stringify(malformed));
    const expected = accounting(progression);
    const restored = await session(store);
    assert.deepEqual(accounting(restored.progression), expected, `null career.${key}`);
  }
});

test('recovery followed by failed primary write preserves the last good backup', async () => {
  const { progression, store } = await session();
  progression.addMoney(123, 'fixture progression');
  assert.equal(progression.save(), true);
  const good = store.getItem(SAVE_KEY);
  store.setItem(SAVE_BACKUP_KEY, good);
  store.setItem(SAVE_KEY, '{ corrupt primary');
  const recovered = await session(store);
  recovered.progression.addMoney(10, 'new unsaved progress');
  store.failWrite = (key) => key === SAVE_KEY;
  assert.equal(recovered.progression.save(), false);
  assert.equal(store.getItem(SAVE_BACKUP_KEY), good,
    'a corrupt primary must never overwrite a valid recovery backup');
  store.failWrite = null;
  const restored = await session(store);
  assert.equal(restored.state.player.money, JSON.parse(good).player.money);
});

test('readable saved progress loads even when all storage writes are denied', async () => {
  const { progression, store } = await session();
  progression.addMoney(123, 'fixture progression');
  assert.equal(progression.save(), true);
  const expected = accounting(progression);
  store.failWrite = () => true;
  const restored = await session(store);
  assert.deepEqual(accounting(restored.progression), expected,
    'a write probe must not prevent reading an existing career');
});

test('a transient failed autosave retries after storage recovers', async () => {
  const { progression, store } = await session();
  assert.equal(progression.save(), true);
  progression.addMoney(123, 'fixture progression');
  const expected = accounting(progression);
  store.failWrite = (key) => key === SAVE_KEY;
  progression.update(2);
  store.failWrite = null;
  progression.update(2);
  const restored = await session(store);
  assert.deepEqual(accounting(restored.progression), expected,
    'failed autosave must retain pending progress for a later update');
});

test('a failed save requested by a restore observer remains pending after load returns', async () => {
  const { progression, store } = await session();
  assert.equal(progression.acceptContract(emergencyContract()).ok, true);
  assert.equal(progression.save(), true);
  const state = createGameState();
  const bus = createBus();
  const restored = createProgression({ state, bus, rand: makeRandom(5197), SCENES });
  let observed = false;
  let saveResult;
  store.failWrite = (key) => key === SAVE_KEY;
  bus.on(EVENTS.CONTRACT_ACCEPT, (payload) => {
    if (!payload.restored) return;
    observed = true;
    saveResult = restored.save();
  });
  await restored.init();
  assert.equal(observed, true, 'the restored job must notify the real event consumer');
  assert.equal(saveResult, false, 'the restore observer exercises a real primary-write failure');
  const writes = store.writes.length;
  store.failWrite = null;
  restored.update(2);
  assert.ok(store.writes.length > writes, 'load must not erase a failed observer save request');
});
