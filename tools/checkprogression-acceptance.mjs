#!/usr/bin/env node
/**
 * Public contract acceptance and persistence regressions.
 * Run: node tools/checkprogression-acceptance.mjs
 *
 * Every game operation executes the real progression, data, economy and event
 * modules. Only localStorage is replaced, to model reloads and write failures
 * without touching the user's browser save. Generated contracts and the real
 * travelCost function supply the fixture's economic values; no rates are copied.
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { makeContract, METHODS, REGIONS, CERTS, MAX_LEVEL } from '../src/game/data.js';
import { travelCost } from '../src/game/economy.js';

class MemoryStorage {
  values = new Map();
  primaryFailures = 0;
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) {
    if (key === SAVE_KEY && this.primaryFailures > 0) {
      this.primaryFailures--;
      throw new Error('Injected primary-write failure');
    }
    this.values.set(key, String(value));
  }
  removeItem(key) { this.values.delete(key); }
}

function generated(regionId, level, predicate = () => true, seed = 20260906) {
  const rand = makeRandom(seed);
  for (let i = 0; i < 4000; i++) {
    const contract = makeContract(regionId, level, rand);
    if (contract && predicate(contract)) return contract;
  }
  throw new Error(`No generated fixture in ${regionId} at level ${level}`);
}

const local = generated('nordic', 1);
const foreign = generated('german-site', MAX_LEVEL, c => c.methodId === 'hdd');
const locked = generated('nordic', 6, c => c.methodId === 'top-hammer');
assert.equal(local.methodId, 'auger', 'starter fixture uses the actual starter method');
assert.ok(foreign.requiredCerts.length > 0, 'foreign fixture exercises certification');
assert.ok(local.id && foreign.id && locked.id, 'generated fixtures have persistent identities');

let passes = 0;
const failures = [];

async function fixture(configure = () => {}, store = new MemoryStorage()) {
  globalThis.localStorage = store;
  const state = createGameState();
  configure(state);
  const bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(20260906) });
  await progression.init();
  const events = [];
  for (const event of new Set(Object.values(EVENTS))) {
    bus.on(event, payload => events.push({ event, payload }));
  }
  return { state, bus, progression, store, events };
}

function senior(state) {
  state.player.level = MAX_LEVEL;
  state.player.certs = CERTS.map(c => c.id);
  state.unlocked.methods = METHODS.map(m => m.id);
  state.unlocked.regions = REGIONS.map(r => r.id);
  state.unlocked.rigs = ['crawler-lite', 'hdd-rig'];
}

function quote(contract = foreign, rigId = 'hdd-rig') {
  return travelCost('nordic', contract.regionId, { rigId, skills: {} });
}

function snapshot(f) {
  return structuredClone({ state: f.state, save: f.progression.serialise() });
}

function rejectWithoutChange(f, contract) {
  const before = snapshot(f);
  const count = f.events.length;
  const result = f.progression.acceptContract(contract);
  assert.equal(result.ok, false, 'acceptance must reject');
  assert.equal(typeof result.reason, 'string');
  assert.ok(result.reason.length, 'rejection has a displayable reason');
  assert.deepEqual(snapshot(f), before, 'rejection must leave all live and persisted state unchanged');
  assert.equal(f.events.length, count, 'rejection must not publish state-change events');
  return result;
}

function assertReloadMatches(before, f) {
  assert.deepEqual(f.state.contract, before.contract, 'active contract survives reload');
  assert.deepEqual(f.progression.serialise().run, before.run, 'the accepted run survives reload');
  assert.deepEqual(f.state.world.site, before.world.site, 'site identity survives reload');
  assert.equal(f.state.world.regionId, before.world.regionId);
  assert.equal(f.state.world.contractId, before.contract.id, 'restored world identifies the accepted job');
  assert.equal(f.state.drill.target, before.contract.targetDepth, 'restored drilling uses the accepted target');
  assert.equal(f.state.drill.depth, 0, 'reload starts the unfinished hole at its collar');
  assert.equal(f.state.drill.stratumIndex, 0);
  assert.equal(f.state.garage.rigId, before.garage.rigId);
  assert.equal(f.state.player.money, before.player.money, 'reload never charges mobilisation again');
  assert.equal(f.state.player.career.lifetimeSpent, before.player.career.lifetimeSpent);
  assert.equal(f.state.player.career.daysElapsed, before.player.career.daysElapsed);
  assert.equal(f.progression.run.contract, f.state.contract, 'run and active job share one restored identity');
}

async function check(name, action) {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    await action();
    passes++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(name);
    console.error(`FAIL ${name}: ${error.message}`);
  } finally {
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else delete globalThis.localStorage;
  }
}

await check('starter acceptance marks dirty and survives an autosave/reload', async () => {
  const f = await fixture();
  const money = f.state.player.money;
  const result = f.progression.acceptContract(structuredClone(local));
  assert.equal(result.ok, true);
  assert.equal(result.mobilisation, 0);
  assert.equal(f.state.player.money, money);
  assert.equal(f.progression.run.contract, f.state.contract);
  assert.equal(f.events.filter(e => e.event === EVENTS.CONTRACT_ACCEPT).length, 1);
  f.progression.update(2);
  assert.ok(f.store.getItem(SAVE_KEY), 'acceptance alone must request persistence');
  const saved = JSON.parse(f.store.getItem(SAVE_KEY));
  const reloaded = await fixture(() => {}, f.store);
  assertReloadMatches(saved, reloaded);
});

await check('acceptance initializes drilling and world identity before CONTRACT_ACCEPT observers run', async () => {
  const f = await fixture(state => {
    // Stale telemetry is deliberately nonzero; these are test markers, not
    // simulation or economic values.
    state.drill.target = 123.5;
    state.drill.depth = 7;
    state.drill.stratumIndex = 2;
    state.world.contractId = 'previous-job';
  });
  const observations = [];
  f.bus.on(EVENTS.CONTRACT_ACCEPT, ({ contract }) => observations.push({
    contractId: contract.id,
    activeId: f.state.contract?.id,
    worldContractId: f.state.world.contractId,
    target: f.state.drill.target,
    depth: f.state.drill.depth,
    stratumIndex: f.state.drill.stratumIndex,
    runMatches: f.progression.run?.contract === f.state.contract,
  }));
  assert.equal(f.progression.acceptContract(structuredClone(local)).ok, true);
  assert.deepEqual(observations, [{
    contractId: local.id,
    activeId: local.id,
    worldContractId: local.id,
    target: local.targetDepth,
    depth: 0,
    stratumIndex: 0,
    runMatches: true,
  }]);
});

await check('foreign acceptance chooses an owned rig and charges its exact quoted mobilisation once', async () => {
  const cost = quote();
  assert.ok(cost > 0, 'fixture must require mobilisation');
  const f = await fixture(state => { senior(state); state.player.money = cost; });
  const result = f.progression.acceptContract(structuredClone(foreign));
  assert.equal(result.ok, true);
  assert.equal(result.mobilisation, cost);
  assert.equal(f.state.garage.rigId, 'hdd-rig');
  assert.equal(f.state.player.money, 0, 'exact funds are sufficient');
  assert.equal(f.progression.run.mobilisation, cost);
  assert.equal(f.state.player.career.lifetimeSpent, cost);
  assert.ok(f.state.player.career.daysElapsed > 0, 'mobilisation advances the real career clock');
  assert.equal(f.events.filter(e => e.event === EVENTS.MONEY_CHANGE && e.payload.delta !== 0).length, 1);
  f.progression.update(2);
  const saved = JSON.parse(f.store.getItem(SAVE_KEY));
  const reloaded = await fixture(() => {}, f.store);
  assertReloadMatches(saved, reloaded);
  rejectWithoutChange(reloaded, structuredClone(foreign));
});

await check('reload notifies world observers of the restored job once without recharging mobilisation', async () => {
  const f = await fixture(state => { senior(state); state.player.money = quote(); });
  assert.equal(f.progression.acceptContract(structuredClone(foreign)).ok, true);
  assert.equal(f.progression.save(), true);
  const saved = JSON.parse(f.store.getItem(SAVE_KEY));
  const state = createGameState();
  const bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(20260906) });
  const observations = [];
  const charges = [];
  // Geology is initialized before progression in main.js. This actual bus
  // observer exercises its notification boundary without fabricating terrain.
  bus.on(EVENTS.CONTRACT_ACCEPT, payload => observations.push({
    contract: structuredClone(payload.contract),
    restored: payload.restored,
    target: state.drill.target,
    depth: state.drill.depth,
    stratumIndex: state.drill.stratumIndex,
    worldContractId: state.world.contractId,
    runMatches: progression.run?.contract === state.contract,
    mobilisation: progression.run?.mobilisation,
    money: state.player.money,
  }));
  bus.on(EVENTS.MONEY_CHANGE, payload => { if (payload.delta !== 0) charges.push(payload); });
  await progression.init();
  assert.deepEqual(observations, [{
    contract: saved.contract,
    restored: true,
    target: saved.contract.targetDepth,
    depth: 0,
    stratumIndex: 0,
    worldContractId: saved.contract.id,
    runMatches: true,
    mobilisation: saved.run.mobilisation,
    money: saved.player.money,
  }]);
  assert.deepEqual(charges, [], 'restored-job notification must never charge the job again');
  assertReloadMatches(saved, { state, progression });
});

await check('unaffordable mobilisation cannot switch rig, emit events, or dirty the save', async () => {
  const f = await fixture(state => {
    senior(state);
    state.player.money = quote() - 1;
    state.drill.target = 123.5;
    state.drill.depth = 7;
    state.drill.stratumIndex = 2;
    state.world.contractId = 'previous-job';
  });
  assert.equal(f.progression.save(), true);
  const saved = f.store.getItem(SAVE_KEY);
  rejectWithoutChange(f, structuredClone(foreign));
  f.progression.update(2);
  assert.equal(f.store.getItem(SAVE_KEY), saved);
});

await check('an unowned compatible selected rig cannot bypass ownership', async () => {
  const f = await fixture(state => {
    senior(state);
    state.unlocked.rigs = ['crawler-lite'];
    state.garage.rigId = 'hdd-rig';
    state.player.money = quote();
  });
  rejectWithoutChange(f, structuredClone(foreign));
});

await check('no compatible owned rig rejects without changing state', async () => {
  const f = await fixture(state => {
    senior(state);
    state.unlocked.rigs = ['crawler-lite'];
    state.player.money = quote();
  });
  rejectWithoutChange(f, structuredClone(foreign));
});

await check('owned multi-method rig cannot bypass a locked method level', async () => {
  const f = await fixture();
  rejectWithoutChange(f, structuredClone(locked));
});

await check('a forged unlocked-method entry cannot bypass its level requirement', async () => {
  const f = await fixture(state => { state.unlocked.methods.push(locked.methodId); });
  rejectWithoutChange(f, structuredClone(locked));
});

await check('missing contract certificates reject without changing state', async () => {
  const f = await fixture(state => { senior(state); state.player.certs = []; state.player.money = quote(); });
  rejectWithoutChange(f, structuredClone(foreign));
});

await check('an expired certificate still present in state cannot authorize acceptance', async () => {
  const f = await fixture(state => { senior(state); state.player.money = quote(); });
  f.state.player.career.daysElapsed = 1;
  f.state.player.career.certExpiry[foreign.requiredCerts[0]] = 1;
  rejectWithoutChange(f, structuredClone(foreign));
});

await check('repeat click on the same object leaves the active run unchanged', async () => {
  const f = await fixture();
  const contract = structuredClone(local);
  assert.equal(f.progression.acceptContract(contract).ok, true);
  const run = f.progression.run;
  rejectWithoutChange(f, contract);
  assert.equal(f.progression.run, run, 'the existing accumulator must not be replaced');
});

await check('repeat click on a cloned card cannot start a second run', async () => {
  const f = await fixture();
  assert.equal(f.progression.acceptContract(structuredClone(local)).ok, true);
  const run = f.progression.run;
  rejectWithoutChange(f, structuredClone(local));
  assert.equal(f.progression.run, run);
});

await check('another card cannot silently replace an active job', async () => {
  const f = await fixture();
  assert.equal(f.progression.acceptContract(structuredClone(local)).ok, true);
  const other = generated('nordic', 1, c => c.id !== local.id, 412);
  rejectWithoutChange(f, other);
});

await check('no contract rejects without side effects', async () => {
  const f = await fixture();
  rejectWithoutChange(f, null);
});

await check('unknown destination cannot become free mobilisation', async () => {
  const f = await fixture();
  rejectWithoutChange(f, { ...structuredClone(local), regionId: 'not-a-region' });
});

const malformedCases = [
  ['unknown method', { methodId: 'not-a-method' }],
  ['missing identity', { id: undefined }],
  ['blank identity', { id: '   ' }],
  ['object identity', { id: { id: local.id } }],
  ['numeric identity', { id: 1 }],
  ['non-finite depth', { targetDepth: Infinity }],
  ['NaN depth', { targetDepth: NaN }],
  ['zero depth', { targetDepth: 0 }],
  ['string depth', { targetDepth: String(local.targetDepth) }],
  ['zero holes', { holes: 0 }],
  ['fractional holes', { holes: 1.5 }],
  ['non-finite payout', { payout: Infinity }],
  ['negative payout', { payout: -1 }],
  ['non-array certificates', { requiredCerts: 'first-aid' }],
];
for (const [name, overrides] of malformedCases) {
  await check(`malformed contract rejects unchanged: ${name}`, async () => {
    const f = await fixture();
    rejectWithoutChange(f, { ...structuredClone(local), ...overrides });
  });
}

await check('an array with contract properties cannot become an unsaveable accepted job', async () => {
  const f = await fixture();
  rejectWithoutChange(f, Object.assign([], structuredClone(local)));
});

await check('acceptance flushes on dispose before the first autosave tick', async () => {
  const f = await fixture();
  assert.equal(f.progression.acceptContract(structuredClone(local)).ok, true);
  const before = f.progression.serialise();
  f.progression.dispose();
  assert.ok(f.store.getItem(SAVE_KEY));
  const reloaded = await fixture(() => {}, f.store);
  assertReloadMatches(before, reloaded);
});

await check('failed autosave retries the accepted job on a later update', async () => {
  const f = await fixture();
  assert.equal(f.progression.acceptContract(structuredClone(local)).ok, true);
  f.store.primaryFailures = 1;
  f.progression.update(2);
  assert.equal(f.store.getItem(SAVE_KEY), null, 'first primary write fails');
  f.progression.update(2);
  assert.ok(f.store.getItem(SAVE_KEY), 'dirty state must remain pending until persistence succeeds');
  const before = f.progression.serialise();
  const reloaded = await fixture(() => {}, f.store);
  assertReloadMatches(before, reloaded);
});

console.log(`\nProgression acceptance: ${passes} passed, ${failures.length} failed.`);
if (failures.length) process.exitCode = 1;
