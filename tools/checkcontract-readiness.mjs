#!/usr/bin/env node
/**
 * Adversarial readiness checks against the actual progression/data/economy/bus.
 * Run: node tools/checkcontract-readiness.mjs
 * Only localStorage is replaced. Generated real contracts provide content;
 * depth and cash boundary values below are adversarial inputs, not rig ratings.
 * No browser, renderer, saved user state, or production data is modified.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { METHODS, REGIONS, CERTS, MAX_LEVEL, RIGS, DEPTH_IS_VERTICAL,
  makeContract, rigDepthCapacity } from '../src/game/data.js';
import { travelCost } from '../src/game/economy.js';

const cases = [], measurements = { previews: 0, purityChecks: 0, ratedPairs: 0, observerSnapshots: 0 };
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const fixtures = new Map();
for (const region of REGIONS) {
  const rand = makeRandom(20260906);
  for (let i = 0; i < 2000 && fixtures.size < METHODS.length; i++) {
    const c = makeContract(region.id, MAX_LEVEL, rand);
    if (c && !fixtures.has(c.methodId)) fixtures.set(c.methodId, c);
  }
}
assert.equal(fixtures.size, METHODS.length, 'fixture generation covers every real method');
function contract(methodId = 'auger', fields = {}) {
  assert.ok(fixtures.has(methodId), `generated ${methodId} contract exists`);
  return { ...structuredClone(fixtures.get(methodId)), ...fields };
}
function test(name, fn) { cases.push({ name, fn }); }
function memoryStorage() {
  return {
    values: new Map(), reads: 0, writes: 0, removes: 0,
    getItem(k) { this.reads++; return this.values.get(k) ?? null; },
    setItem(k, v) { this.writes++; this.values.set(k, String(v)); },
    removeItem(k) { this.removes++; this.values.delete(k); },
  };
}
async function fresh(owned = ['crawler-lite'], selected = owned[0], init = true) {
  const store = memoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus(), events = [], random = { calls: 0 };
  const seeded = makeRandom(9917);
  const progression = createProgression({ state, bus, rand: () => { random.calls++; return seeded(); } });
  if (init) await progression.init();
  state.player.level = MAX_LEVEL;
  state.player.money = 1e8;
  state.player.certs = CERTS.map(c => c.id);
  state.unlocked.methods = METHODS.map(m => m.id);
  state.unlocked.regions = REGIONS.map(r => r.id);
  state.unlocked.rigs = [...owned];
  state.garage.rigId = selected;
  if (init) assert.equal(progression.save(), true, 'flush fixture setup before purity probes');
  for (const event of new Set(Object.values(EVENTS))) {
    bus.on(event, payload => events.push({ event, payload: structuredClone(payload) }));
  }
  return { state, bus, progression, store, events, random };
}
function snapshot(f, includeSave = true) {
  return JSON.stringify({
    state: f.state, save: includeSave ? f.progression.serialise() : undefined,
    run: f.progression.run, lastContract: f.progression.lastContract,
    site: f.progression.site, storage: [...f.store.values],
    reads: f.store.reads, writes: f.store.writes, removes: f.store.removes,
    randomCalls: f.random.calls, events: f.events,
  });
}
function purePreview(f, c, repeat = 1, includeSave = true) {
  const before = snapshot(f, includeSave), contractBefore = JSON.stringify(c);
  const refs = { run: f.progression.run, contract: f.state.contract, site: f.progression.site,
    lastContract: f.progression.lastContract, loadout: f.state.garage.loadout,
    career: f.state.player.career, certs: f.state.player.certs };
  const originalRandom = Math.random;
  let mathRandomCalls = 0, result;
  Math.random = () => { mathRandomCalls++; return originalRandom(); };
  try {
    for (let i = 0; i < repeat; i++) {
      result = f.progression.previewContract(c); measurements.previews++;
      assert.equal(typeof result?.ok, 'boolean', 'preview has explicit readiness');
      assert.equal(typeof result.reason, 'string', 'preview has displayable reason');
      if (!result.ok) assert.ok(result.reason.length, 'refusal explains the blocker');
    }
  } finally { Math.random = originalRandom; }
  assert.equal(mathRandomCalls, 0, 'preview never consumes global randomness');
  assert.equal(snapshot(f, includeSave), before, 'preview leaves full live/serialized state, funds, ledger, saves, events, and seeded randomness unchanged');
  assert.equal(JSON.stringify(c), contractBefore, 'preview does not modify the input contract');
  assert.equal(f.progression.run, refs.run, 'preview retains live run identity');
  assert.equal(f.state.contract, refs.contract, 'preview retains active contract identity');
  assert.equal(f.progression.site, refs.site, 'preview retains site identity');
  assert.equal(f.progression.lastContract, refs.lastContract, 'preview retains last-contract identity');
  assert.equal(f.state.garage.loadout, refs.loadout, 'preview retains loadout object');
  assert.equal(f.state.player.career, refs.career, 'preview retains career object');
  assert.equal(f.state.player.certs, refs.certs, 'preview never replaces/cleans expired certs');
  // update() detects deferred dirty-save effects; an idle/freshly saved fixture
  // must remain unchanged even after the full autosave debounce expires.
  f.progression.update(2);
  assert.equal(snapshot(f, includeSave), before, 'preview schedules no later autosave or state mutation');
  measurements.purityChecks++;
  return result;
}
function refusal(f, c, pattern) {
  const preview = purePreview(f, c, 3);
  assert.equal(preview.ok, false);
  assert.match(preview.reason, pattern);
  const before = snapshot(f);
  const result = f.progression.acceptContract(c);
  assert.deepEqual(result, preview, 'actual acceptance refuses with the same authoritative facts');
  assert.equal(snapshot(f), before, 'actual refusal leaves full state unchanged');
  f.progression.update(2);
  assert.equal(snapshot(f), before, 'actual refusal schedules no save');
  return preview;
}
function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

test('1,000 ready previews preserve serialized state, cash, ledger, event count, storage, randomness and all live identities', async () => {
  const f = await fresh(['crawler-lite', 'hdd-rig']);
  const c = contract('hdd', { regionId: 'german-site' });
  const expected = travelCost('nordic', c.regionId, { rigId: 'hdd-rig', skills: f.state.player.skills });
  assert.ok(expected > 0, 'foreign job exercises real mobilisation cost');
  const result = purePreview(f, deepFreeze(c), 1000);
  assert.equal(result.ok, true); assert.equal(result.rigId, 'hdd-rig');
  assert.equal(result.mobilisation, expected);
  assert.equal(f.state.garage.rigId, 'crawler-lite', 'even a ready alternate rig is not selected by preview');
});

test('preview does not lazily create absent career state before init', async () => {
  const f = await fresh(['crawler-lite'], 'crawler-lite', false);
  delete f.state.player.career;
  // serialise itself creates career(), so this special probe reads raw state.
  assert.equal(purePreview(f, contract('auger', { targetDepth: 1, regionId: 'nordic' }), 100, false).ok, true);
  assert.equal('career' in f.state.player, false);
});

test('deep-frozen game state and input can be previewed successfully', async () => {
  const f = await fresh(['cfa-rig', 'foundation-bg'], 'cfa-rig');
  const c = deepFreeze(contract('cfa', { targetDepth: rigDepthCapacity('foundation-bg', 'cfa') }));
  deepFreeze(f.state);
  assert.equal(purePreview(f, c, 30).ok, true);
});

for (const [name, make, reason] of [
  ['null', () => null, /No contract/],
  ['array', () => [], /No contract/],
  ['primitive', () => 'contract', /No contract/],
  ['unknown method', () => contract('auger', { methodId: 'unregistered-method' }), /Unknown contract method/],
  ['unknown region', () => contract('auger', { regionId: 'unregistered-region' }), /Unknown contract region/],
  ['blank identity', () => contract('auger', { id: '  ' }), /Invalid contract/],
  ['nonfinite depth', () => contract('auger', { targetDepth: NaN }), /Invalid contract/],
  ['zero depth', () => contract('auger', { targetDepth: 0 }), /Invalid contract/],
  ['fractional hole count', () => contract('auger', { holes: 1.5 }), /Invalid contract/],
  ['negative payout', () => contract('auger', { payout: -1 }), /Invalid contract/],
  ['nonarray cert requirement', () => contract('auger', { requiredCerts: 'invented-shape' }), /Invalid contract/],
]) test(`${name} refusal is read-only and shared by preview/accept`, async () => {
  refusal(await fresh(), make(), reason);
});

test('level and method unlock refusals are live and mutation-free', async () => {
  const f = await fresh(['crawler-th']);
  const c = contract('top-hammer', { targetDepth: 1 });
  f.state.player.level = 1; refusal(f, c, /Requires.*level/);
  f.state.player.level = MAX_LEVEL; f.state.unlocked.methods = [];
  refusal(f, c, /Requires.*level/);
});

test('missing and expired certifications refuse without dropping the held cert or mutating expiry records', async () => {
  const f = await fresh(['hdd-rig']);
  const c = contract('hdd');
  assert.ok(c.requiredCerts.length > 0);
  const id = c.requiredCerts[0];
  f.state.player.certs = f.state.player.certs.filter(cert => cert !== id);
  refusal(f, c, /Needs/);
  f.state.player.certs.push(id);
  f.state.player.career.daysElapsed = 4;
  f.state.player.career.certExpiry[id] = 4;
  refusal(f, c, /Needs/);
  assert.ok(f.state.player.certs.includes(id), 'preview must not silently expire/remove certificates');
  assert.equal(f.state.player.career.certExpiry[id], 4);
});

test('selected but unowned compatible rig never grants readiness', async () => {
  refusal(await fresh(['crawler-lite'], 'foundation-bg'), contract('rotary-kelly', { targetDepth: 1 }), /No owned rig/);
});

for (const methodId of ['rotary-kelly', 'cased-cfa', 'auger']) {
  test(`unknown CFA carrier ${methodId} conversion cannot inherit another method rating`, async () => {
    assert.equal(rigDepthCapacity('cfa-rig', methodId), null);
    refusal(await fresh(['cfa-rig']), contract(methodId, { targetDepth: 1 }), /verified.*depth rating/);
  });
}

test('all known vertical owned rig/method limits are ready at the limit and refused above it', async () => {
  for (const rig of RIGS) for (const methodId of rig.methods) {
    if (!DEPTH_IS_VERTICAL.includes(methodId)) continue;
    const depth = rigDepthCapacity(rig, methodId);
    if (depth === null) continue;
    const f = await fresh([rig.id]);
    const exact = contract(methodId, { targetDepth: depth });
    assert.equal(purePreview(f, exact, 2).ok, true, `${rig.id}/${methodId} exact sourced limit`);
    refusal(f, contract(methodId, { targetDepth: depth + 0.01 }), /needs.*owned rigs are rated/);
    assert.equal(f.progression.acceptContract(exact).ok, true);
    assert.equal(f.state.garage.rigId, rig.id);
    measurements.ratedPairs++;
  }
  assert.ok(measurements.ratedPairs >= 20, 'nonempty broad vertical fleet coverage');
});

for (const [methodId, rigId] of [['hdd', 'hdd-rig'], ['tunnel-jumbo', 'tunnel-jumbo'], ['rockbolt', 'bolter'], ['longhole', 'longhole-rig']]) {
  test(`${methodId} work length is not tested against a vertical rig depth rating`, async () => {
    assert.equal(DEPTH_IS_VERTICAL.includes(methodId), false);
    const f = await fresh([rigId]);
    const c = contract(methodId, { targetDepth: rigDepthCapacity(rigId, methodId) + 1 });
    const preview = purePreview(f, c, 20);
    assert.equal(preview.ok, true); assert.equal(preview.rigId, rigId);
    assert.equal(f.progression.acceptContract(c).ok, true);
  });
}

test('selected capable rig is preferred even when a capable alternative is earlier in fleet order', async () => {
  const f = await fresh(['cfa-rig', 'foundation-bg'], 'foundation-bg');
  const c = contract('cfa', { targetDepth: rigDepthCapacity('cfa-rig', 'cfa'), regionId: 'german-site' });
  const preview = purePreview(f, c, 10);
  assert.equal(preview.ok, true); assert.equal(preview.rigId, 'foundation-bg');
  assert.equal(preview.mobilisation, travelCost('nordic', c.regionId, { rigId: 'foundation-bg', skills: f.state.player.skills }));
  assert.equal(f.progression.acceptContract(c).ok, true);
  assert.equal(f.state.garage.rigId, 'foundation-bg');
  assert.equal(f.events.filter(e => e.event === EVENTS.RIG_CHANGE).length, 0);
});

test('under-rated or unknown selected configuration previews a capable owned alternative without selecting it', async () => {
  for (const methodId of ['cfa', 'rotary-kelly']) {
    const f = await fresh(['cfa-rig', 'foundation-bg'], 'cfa-rig');
    const c = contract(methodId, { targetDepth: rigDepthCapacity('foundation-bg', methodId) });
    const preview = purePreview(f, c, 10);
    assert.equal(preview.ok, true); assert.equal(preview.rigId, 'foundation-bg');
    assert.equal(f.state.garage.rigId, 'cfa-rig');
    assert.equal(f.progression.acceptContract(c).ok, true);
    assert.equal(f.state.garage.rigId, 'foundation-bg');
    assert.equal(f.events.filter(e => e.event === EVENTS.RIG_CHANGE).length, 1);
  }
});

test('mobilisation shortfall is exact; result tampering never changes state or authorizes acceptance', async () => {
  const f = await fresh(['hdd-rig']);
  const c = contract('hdd', { regionId: 'german-site' });
  const cost = travelCost('nordic', c.regionId, { rigId: 'hdd-rig', skills: f.state.player.skills });
  assert.ok(cost > 0); f.state.player.money = cost - 1;
  const result = refusal(f, c, /Mobilisation costs.*need €1 more/);
  assert.equal(result.mobilisation, cost); assert.equal(result.rigId, 'hdd-rig');
  const before = snapshot(f);
  result.ok = true; result.reason = ''; result.mobilisation = 0; result.rigId = 'foundation-bg';
  result.contract = c; result.runId = 123456;
  assert.equal(snapshot(f), before, 'result contains no mutable authority');
  assert.equal(f.progression.acceptContract(c).ok, false, 'mutated readiness object cannot reserve/authorize funds');
  assert.equal(snapshot(f), before);
  f.state.player.money = cost;
  assert.equal(purePreview(f, c).ok, true);
  assert.equal(f.progression.acceptContract(c).ok, true);
  assert.equal(f.state.player.money, 0, 'exact quoted funds pay once');
  assert.equal(f.progression.run.mobilisation, cost);
});

test('a ready quote does not reserve funds; live shortage refuses without any state change', async () => {
  const f = await fresh(['hdd-rig']);
  const c = contract('hdd', { regionId: 'german-site' });
  const quoted = purePreview(f, c);
  assert.equal(quoted.ok, true); assert.ok(quoted.mobilisation > 0);
  f.state.player.money = quoted.mobilisation - 1;
  refusal(f, c, /Mobilisation costs/);
});

test('cert removal or expiry after a ready preview is rejected using live validity', async () => {
  for (const change of ['remove', 'expire']) {
    const f = await fresh(['hdd-rig']); const c = contract('hdd');
    const id = c.requiredCerts[0]; assert.ok(id);
    assert.equal(purePreview(f, c).ok, true);
    if (change === 'remove') f.state.player.certs = f.state.player.certs.filter(x => x !== id);
    else { f.state.player.career.certExpiry[id] = 10; f.state.player.career.daysElapsed = 10; }
    refusal(f, c, /Needs/);
  }
});

test('losing the capable owned rig after preview cannot borrow its earlier rating', async () => {
  const f = await fresh(['cfa-rig', 'foundation-bg'], 'cfa-rig');
  const c = contract('cfa', { targetDepth: rigDepthCapacity('foundation-bg', 'cfa') });
  assert.equal(purePreview(f, c).rigId, 'foundation-bg');
  f.state.unlocked.rigs = ['cfa-rig'];
  refusal(f, c, /owned rigs are rated/);
});

test('changing target depth after preview is rechecked against current rig capacity', async () => {
  const f = await fresh(['cfa-rig']);
  const c = contract('cfa', { targetDepth: rigDepthCapacity('cfa-rig', 'cfa') });
  assert.equal(purePreview(f, c).ok, true);
  c.targetDepth += 0.01;
  refusal(f, c, /owned rigs are rated/);
});

test('live selection determines accepted rig and cost, not the old preview', async () => {
  const f = await fresh(['crawler-lite', 'core-rig'], 'crawler-lite');
  const c = contract('auger', { targetDepth: rigDepthCapacity('crawler-lite', 'auger'), regionId: 'german-site' });
  const old = purePreview(f, c); assert.equal(old.rigId, 'crawler-lite');
  f.state.garage.rigId = 'core-rig';
  const next = purePreview(f, c); assert.equal(next.rigId, 'core-rig');
  assert.notEqual(next.mobilisation, old.mobilisation, 'actual different rig freight cost is observable');
  const money = f.state.player.money;
  assert.equal(f.progression.acceptContract(c).mobilisation, next.mobilisation);
  assert.equal(f.state.player.money, money - next.mobilisation);
  assert.equal(f.state.garage.rigId, 'core-rig');
});

test('live travel origin determines accepted cost, not the old preview', async () => {
  const f = await fresh(['hdd-rig']);
  const c = contract('hdd', { regionId: 'german-site' });
  assert.ok(purePreview(f, c).mobilisation > 0);
  f.state.player.career.lastRegionId = c.regionId;
  const money = f.state.player.money;
  assert.equal(f.progression.acceptContract(c).mobilisation, 0, 'live origin removes travel charge');
  assert.equal(f.state.player.money, money);
});

test('another accepted run after preview blocks acceptance and repeated active-run previews preserve identities', async () => {
  const f = await fresh();
  const c = contract('auger', { targetDepth: 1, regionId: 'nordic' });
  assert.equal(purePreview(f, c).ok, true);
  assert.equal(f.progression.acceptContract({ ...c, id: `${c.id}-other` }).ok, true);
  const activeToken = f.progression.beginHole(f.state.contract);
  assert.ok(activeToken?.runId && activeToken?.attemptId);
  assert.equal(f.progression.save(), true);
  refusal(f, c, /Finish or abandon/);
  purePreview(f, c, 1000);
  assert.equal(f.progression.run.runId, activeToken.runId);
  assert.equal(f.progression.run.attemptId, activeToken.attemptId);
});

test('preview never adds an unlocked-region rule absent from actual acceptance', async () => {
  const f = await fresh(['hdd-rig']);
  const c = contract('hdd', { regionId: 'german-site' });
  f.state.unlocked.regions = ['nordic'];
  assert.equal(purePreview(f, c).ok, true);
  assert.equal(f.progression.acceptContract(c).ok, true);
});

test('every acceptance observer sees the full paid run; preview/reentrant accept preserve its identity', async () => {
  const f = await fresh(['crawler-lite', 'hdd-rig']);
  const c = contract('hdd', { regionId: 'german-site' });
  const quote = purePreview(f, c), money = f.state.player.money;
  const observations = [];
  for (const event of [EVENTS.RIG_CHANGE, EVENTS.MONEY_CHANGE, EVENTS.CONTRACT_ACCEPT, EVENTS.REGION_CHANGE]) {
    f.bus.on(event, () => {
      const before = snapshot(f);
      const preview = f.progression.previewContract(c); measurements.previews++;
      const refused = f.progression.acceptContract(c);
      observations.push({ event, preview, refused, before, after: snapshot(f),
        money: f.state.player.money, selected: f.state.garage.rigId,
        active: f.state.contract, run: f.progression.run, runId: f.progression.run?.runId,
        site: f.state.world.site?.contractId, world: f.state.world.contractId,
        target: f.state.drill.target, mobilisation: f.progression.run?.mobilisation });
      assert.equal(f.progression.save(), true, 'observer save sees whole committed transaction');
      const saved = JSON.parse(f.store.values.get(SAVE_KEY));
      assert.equal(saved.run.runId, f.progression.run.runId);
      assert.equal(saved.player.money, money - quote.mobilisation);
    });
  }
  assert.equal(f.progression.acceptContract(c).ok, true);
  assert.equal(observations.length, 4, 'each real acceptance observer path was exercised');
  for (const obs of observations) {
    assert.equal(obs.preview.ok, false); assert.match(obs.preview.reason, /Finish or abandon/);
    assert.equal(obs.refused.ok, false); assert.equal(obs.before, obs.after);
    assert.equal(obs.money, money - quote.mobilisation); assert.equal(obs.selected, 'hdd-rig');
    assert.equal(obs.active, c); assert.equal(obs.run.contract, c);
    assert.equal(obs.runId, f.progression.run.runId); assert.equal(obs.mobilisation, quote.mobilisation);
    assert.equal(obs.site, c.id); assert.equal(obs.world, c.id); assert.equal(obs.target, c.targetDepth);
    measurements.observerSnapshots++;
  }
  assert.equal(f.events.filter(e => e.event === EVENTS.CONTRACT_ACCEPT).length, 1);
  assert.equal(f.events.filter(e => e.event === EVENTS.MONEY_CHANGE && e.payload.delta < 0).length, 1);
});

let passed = 0;
const failures = [];
try {
  for (const { name, fn } of cases) {
    const errors = [], originalError = console.error;
    // createBus catches observer exceptions; a swallowed assertion must fail
    // this gate rather than accidentally becoming an apparently green test.
    console.error = (...args) => errors.push(args.map(String).join(' '));
    try {
      await fn(); assert.deepEqual(errors, [], 'real event bus did not swallow any assertion/error');
      passed++; console.log(`PASS ${name}`);
    } catch (e) { failures.push({ name, message: e.message }); originalError(`FAIL ${name}: ${e.stack}`); }
    finally { console.error = originalError; }
  }
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
const hashes = Object.fromEntries(['src/game/progression.js', 'src/ui/screens/contracts.js', 'src/ui/screens/contracts.css', 'tools/checkcontract-readiness.mjs']
  .map(path => [path, createHash('sha256').update(readFileSync(new URL(`../${path}`, import.meta.url))).digest('hex')]));
console.log(JSON.stringify({ cases: cases.length, passed, failed: failures.length, measurements, hashes, failures }, null, 2));
if (failures.length) process.exitCode = 1;
