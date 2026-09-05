#!/usr/bin/env node
/** Owned-rig eligibility against the real progression/data/economy modules. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import {
  METHODS, REGIONS, CERTS, MAX_LEVEL, RIGS, DEPTH_IS_VERTICAL,
  makeContract, rigDepthCapacity,
} from '../src/game/data.js';

const originals = new Map();
// Generate real cards first; boundary tests change only targetDepth. These
// numerical boundary probes are test inputs, not new machine ratings.
for (const region of REGIONS) {
  const rand = makeRandom(20260906);
  for (let i = 0; i < 2000 && originals.size < METHODS.length; i++) {
    const c = makeContract(region.id, MAX_LEVEL, rand);
    if (c && !originals.has(c.methodId)) originals.set(c.methodId, c);
  }
}
function contract(methodId, targetDepth) {
  assert.ok(originals.has(methodId), `real generated fixture: ${methodId}`);
  return { ...structuredClone(originals.get(methodId)), targetDepth };
}

async function fixture(owned, selected = owned[0]) {
  const store = {
    values: new Map(), writes: 0,
    getItem(k) { return this.values.get(k) ?? null; },
    setItem(k, v) { this.writes++; this.values.set(k, String(v)); },
    removeItem(k) { this.values.delete(k); },
  };
  globalThis.localStorage = store;
  const state = createGameState();
  const bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(5197) });
  await progression.init();
  state.player.level = MAX_LEVEL;
  state.player.money = 1e8; // Test funds isolate capacity from affordability.
  state.player.certs = CERTS.map(c => c.id);
  state.unlocked.methods = METHODS.map(m => m.id);
  state.unlocked.regions = REGIONS.map(r => r.id);
  state.unlocked.rigs = [...owned];
  state.garage.rigId = selected;
  progression.save();
  const events = [];
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  return { state, progression, store, events };
}
function snapshot(f) {
  return structuredClone({ state: f.state, save: f.progression.serialise(), storage: [...f.store.values] });
}
function refusesUnchanged(f, c, reason) {
  const before = snapshot(f);
  const writes = f.store.writes;
  const result = f.progression.acceptContract(c);
  assert.equal(result.ok, false);
  assert.match(result.reason, reason);
  assert.deepEqual(snapshot(f), before, 'refusal preserves all state and persisted contents');
  assert.equal(f.events.length, 0, 'refusal emits no events');
  f.progression.update(2);
  assert.equal(f.store.writes, writes, 'refusal does not schedule a save');
}

test('insufficient owned CFA capacity refuses before selection, money, events or save', async () => {
  const f = await fixture(['cfa-rig']);
  const depth = rigDepthCapacity('foundation-bg', 'cfa');
  assert.ok(depth > rigDepthCapacity('cfa-rig', 'cfa'));
  refusesUnchanged(f, contract('cfa', depth), /15.*m|depth/i);
});

for (const methodId of ['rotary-kelly', 'cased-cfa', 'auger']) {
  test(`unknown ${methodId} conversion cannot borrow the CFA base rating`, async () => {
    assert.equal(rigDepthCapacity('cfa-rig', methodId), null);
    const f = await fixture(['cfa-rig']);
    refusesUnchanged(f, contract(methodId, 1), /rated|verified|known/i);
  });
}

test('exact method-specific capacity is eligible and current capable rig is preferred', async () => {
  const f = await fixture(['foundation-bg', 'cfa-rig'], 'cfa-rig');
  const c = contract('cfa', rigDepthCapacity('cfa-rig', 'cfa'));
  assert.equal(f.progression.acceptContract(c).ok, true);
  assert.equal(f.state.garage.rigId, 'cfa-rig');
  assert.equal(f.events.filter(e => e.event === EVENTS.RIG_CHANGE).length, 0);
});

test('a capable owned alternative replaces the insufficient selected rig', async () => {
  const f = await fixture(['cfa-rig', 'foundation-bg'], 'cfa-rig');
  assert.equal(f.progression.acceptContract(contract('cfa', rigDepthCapacity('foundation-bg', 'cfa'))).ok, true);
  assert.equal(f.state.garage.rigId, 'foundation-bg');
  assert.equal(f.events.filter(e => e.event === EVENTS.RIG_CHANGE).length, 1);
});

test('a rated owned alternative replaces an unknown selected conversion', async () => {
  const f = await fixture(['cfa-rig', 'foundation-bg'], 'cfa-rig');
  assert.equal(f.progression.acceptContract(contract('rotary-kelly', rigDepthCapacity('foundation-bg', 'rotary-kelly'))).ok, true);
  assert.equal(f.state.garage.rigId, 'foundation-bg');
});

test('selected but unowned capable rig cannot authorize a deeper contract', async () => {
  const f = await fixture(['cfa-rig'], 'foundation-bg');
  refusesUnchanged(f, contract('cfa', rigDepthCapacity('foundation-bg', 'cfa')), /15.*m|depth/i);
});

test('capable fleet rigs that are not owned cannot authorize a method', async () => {
  const f = await fixture(['crawler-lite'], 'foundation-bg');
  refusesUnchanged(f, contract('rotary-kelly', 1), /No owned rig/);
});

test('having both unknown and insufficient owned conversions still refuses unchanged', async () => {
  const f = await fixture(['cfa-rig', 'foundation-bg'], 'cfa-rig');
  refusesUnchanged(f, contract('cased-cfa', rigDepthCapacity('foundation-bg', 'cased-cfa') + 0.01), /17.*m|depth/i);
});

for (const [methodId, rigId] of [['hdd', 'hdd-rig'], ['tunnel-jumbo', 'tunnel-jumbo'], ['rockbolt', 'bolter'], ['longhole', 'longhole-rig']]) {
  test(`${methodId} length/chainage is not compared to vertical rig capacity`, async () => {
    assert.equal(DEPTH_IS_VERTICAL.includes(methodId), false);
    const f = await fixture([rigId]);
    // Deliberately exceed the unrelated rating to catch a universal depth
    // comparison. This asserts units semantics, not physical bore feasibility.
    const c = contract(methodId, rigDepthCapacity(rigId, methodId) + 1);
    assert.equal(f.progression.acceptContract(c).ok, true);
    assert.equal(f.state.garage.rigId, rigId);
  });
}

test('every advertised vertical rig/method accepts its exact known limit and rejects above it', async () => {
  let checked = 0;
  for (const rig of RIGS) for (const methodId of rig.methods) {
    if (!DEPTH_IS_VERTICAL.includes(methodId)) continue;
    const depth = rigDepthCapacity(rig, methodId);
    if (depth === null) continue;
    const above = await fixture([rig.id]);
    refusesUnchanged(above, contract(methodId, depth + 0.01), /depth|m/i);
    const exact = await fixture([rig.id]);
    assert.equal(exact.progression.acceptContract(contract(methodId, depth)).ok, true, `${rig.id}/${methodId} exact limit`);
    checked++;
  }
  assert.ok(checked >= 20, `meaningful fleet coverage (${checked})`);
  console.log(`Checked ${checked} rated vertical rig/method pairs at and above their capacity.`);
});
