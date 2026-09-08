#!/usr/bin/env node
/** Actual career purchases/actions, save migrations and sim-start regression.
 * CPU only; worn condition and senior career resources are test setup, never
 * a claim of a naturally completed career or a physical grinding model.
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY, SAVE_VERSION } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { METHODS, RIGS, CERTS, REGIONS, MAX_LEVEL, makeContract } from '../src/game/data.js';

const BIT = 'bit-th-r32-45-std';
const GRINDER = 'ws-grinding-kit';
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const contexts = [];
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const near = (actual, expected, why = '') => assert.ok(Math.abs(actual - expected) < 1e-10, `${why}: ${actual} != ${expected}`);
const memoryStorage = () => {
  const values = new Map();
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) };
};
async function fresh(store = memoryStorage(), setup = true) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(77) });
  await progression.init();
  const f = { state, bus, progression, store }; contexts.push(f);
  if (setup) {
    state.player.level = MAX_LEVEL; state.player.money = 1e7; state.player.skillPoints = 100;
    state.player.certs = CERTS.map(c => c.id);
    state.unlocked.methods = METHODS.map(m => m.id);
    state.unlocked.rigs = RIGS.map(r => r.id);
    state.unlocked.regions = REGIONS.map(r => r.id);
    assert.equal(progression.selectRig('crawler-th').ok, true);
    for (const id of [BIT, GRINDER]) assert.equal(progression.purchase(id).ok, true, id + ' purchase');
    assert.equal(progression.equip('bit', BIT).ok, true);
    assert.equal(progression.equip('workshop', GRINDER).ok, true);
    for (const id of ['ts.carbide-care', 'ts.thread-doctor']) assert.equal(progression.spendSkillPoint(id).ok, true);
    state.garage.condition[BIT] = 0.55;
  }
  return f;
}
function rank(f, n = 1) {
  for (let i = 0; i < n; i++) assert.equal(f.progression.spendSkillPoint('ts.field-regrind').ok, true);
}
function unchangedRejection(f, id = BIT) {
  const before = structuredClone(f.progression.serialise());
  const result = f.progression.fieldRegrind(id);
  assert.equal(result.ok, false); assert.ok(result.reason.length);
  assert.deepEqual(f.progression.serialise(), before, 'rejection leaves the full persisted career unchanged');
  return result;
}
function contract() {
  const rand = makeRandom(77);
  for (let i = 0; i < 2000; i++) {
    const c = makeContract('nordic', MAX_LEVEL, rand);
    if (c.methodId === 'top-hammer' && c.targetDepth > 20) return c;
  }
  throw new Error('No generated top-hammer contract');
}
function settle(f, c = f.state.contract) {
  f.bus.emit(EVENTS.DRILL_START, { contract: c });
  f.bus.emit(EVENTS.HOLE_COMPLETE, { contract: c, methodId: c.methodId,
    depth: c.targetDepth, grade: 'B', timeSec: 60,
    breakdown: { time: { parSec: 60, actualSec: 60 } }, wob: 0.55, rpm: 0.55, flush: 0.6 });
}

test('each bought rank restores its authored recovery once and advances twenty in-game minutes', async () => {
  for (let n = 1; n <= 3; n++) {
    const f = await fresh(); rank(f, n);
    const before = f.progression.serialise();
    const q = f.progression.fieldRegrindQuote(); assert.equal(q.ok, true);
    near(q.restored, f.progression.getEffects().a('regrind.recovery'));
    const r = f.progression.fieldRegrind(); assert.equal(r.ok, true);
    near(f.state.garage.condition[BIT], 0.55 + 0.12 * n);
    near(f.state.player.career.hoursWorked - before.player.career.hoursWorked, 20 / 60);
    near(f.state.player.career.daysElapsed - before.player.career.daysElapsed, (20 / 60) / 11);
    assert.equal(f.state.player.money, before.player.money);
    assert.equal(f.state.player.xp, before.player.xp);
    assert.equal(f.progression.fieldRegrindQuote().used, true);
    unchangedRejection(f);
  }
});
test('unbought skill, unowned/fitted tools, wrong grinder, and unsupported tool families reject without mutation', async () => {
  const cases = [
    f => {},
    f => { rank(f); f.state.garage.owned = f.state.garage.owned.filter(id => id !== BIT); },
    f => { rank(f); f.progression.equip('bit', null); },
    f => { rank(f); f.progression.equip('workshop', null); },
    f => { rank(f); f.state.garage.owned = f.state.garage.owned.filter(id => id !== GRINDER); },
    f => { rank(f); f.state.garage.loadout.workshop = 'ws-torque-wrench-hd'; },
  ];
  for (const configure of cases) { const f = await fresh(); configure(f); unchangedRejection(f); }
  for (const id of ['auger-flight-std', 'rc-bit-std', 'not-an-item']) {
    const f = await fresh(); rank(f); unchangedRejection(f, id);
  }
});
test('fully worn, nonfinite and full-condition tools reject; small wear caps at full condition', async () => {
  for (const condition of [0, -1, NaN, Infinity, 1, 1.1]) {
    const f = await fresh(); rank(f); f.state.garage.condition[BIT] = condition; unchangedRejection(f);
  }
  const f = await fresh(); rank(f, 3); f.state.garage.condition[BIT] = 0.95;
  const r = f.progression.fieldRegrind(); assert.equal(r.ok, true); near(r.restored, 0.05);
  assert.equal(f.state.garage.condition[BIT], 1); unchangedRejection(f);
});
test('DTH button bits and both existing grinder models have the same authored recovery', async () => {
  for (const grinderId of [GRINDER, 'ws-bit-grinder-hd']) {
    const f = await fresh(); rank(f, 2);
    assert.equal(f.progression.selectRig('dth-crawler').ok, true);
    const bitId = 'bit-dth-4-std'; assert.equal(f.progression.purchase(bitId).ok, true);
    assert.equal(f.progression.equip('bit', bitId).ok, true);
    if (grinderId !== GRINDER) assert.equal(f.progression.purchase(grinderId).ok, true);
    assert.equal(f.progression.equip('workshop', grinderId).ok, true);
    f.state.garage.condition[bitId] = 0.6;
    const result = f.progression.fieldRegrind(); assert.equal(result.ok, true);
    near(result.after, 0.84); unchangedRejection(f, bitId);
  }
});
test('accepted contract and active simulation both reject maintenance', async () => {
  const f = await fresh(); rank(f);
  assert.equal(f.progression.acceptContract(contract()).ok, true); unchangedRejection(f);
  f.progression.abandonContract(); f.state.drill.active = true; unchangedRejection(f);
});
test('save, autosave and reload preserve the allowance and recovered condition', async () => {
  const f = await fresh(); rank(f); assert.equal(f.progression.fieldRegrind().ok, true);
  f.progression.update(2);
  assert.ok(f.store.getItem(SAVE_KEY), 'the action itself requests autosave');
  const g = await fresh(f.store, false);
  near(g.state.garage.condition[BIT], 0.67); unchangedRejection(g);
  assert.equal(g.state.player.career.fieldRegrinds[BIT], true);
});
test('synchronous action listeners cannot grant repeated recovery or extra time', async () => {
  const f = await fresh(); rank(f); const nested = [];
  const hours = f.state.player.career.hoursWorked;
  f.bus.on(EVENTS.HAPTIC, () => nested.push(f.progression.fieldRegrind()));
  assert.equal(f.progression.fieldRegrind().ok, true);
  assert.equal(nested.length, 1); assert.equal(nested[0].ok, false);
  near(f.state.garage.condition[BIT], 0.67);
  near(f.state.player.career.hoursWorked - hours, 20 / 60);
});
test('maintenance crosses the real career day and certificate-expiry boundary safely', async () => {
  const f = await fresh(); rank(f);
  const cert = f.state.player.certs[0];
  f.state.player.career.daysElapsed = 0.99; f.state.player.career.certExpiry[cert] = 1;
  const nested = [];
  f.bus.on(EVENTS.UNLOCK, p => { if (p.kind === 'cert-expired') nested.push(f.progression.fieldRegrind()); });
  assert.equal(f.progression.fieldRegrind().ok, true);
  assert.equal(f.state.player.certs.includes(cert), false);
  assert.equal(nested.length, 1); assert.equal(nested[0].ok, false);
  near(f.state.garage.condition[BIT], 0.67);
});
test('paid replacement restores the allowance but full condition is still ineligible', async () => {
  const f = await fresh(); rank(f); assert.equal(f.progression.fieldRegrind().ok, true);
  const money = f.state.player.money; const bought = f.progression.purchase(BIT);
  assert.equal(bought.ok, true); assert.ok(bought.price > 0);
  assert.equal(f.state.player.money, money - bought.price);
  assert.equal(f.progression.fieldRegrindQuote().used, false); unchangedRejection(f);
  f.state.garage.condition[BIT] = 0.8;
  assert.equal(f.progression.fieldRegrind().ok, true);
});
test('new drilling wear preserves the allowance until the settlement actually replaces the bit', async () => {
  const f = await fresh(); rank(f); assert.equal(f.progression.fieldRegrind().ok, true);
  const c = contract(); assert.equal(f.progression.acceptContract(c).ok, true);
  let sawWear = false, sawReplacement = false;
  for (let i = 0; i < c.holes; i++) {
    settle(f, c);
    const worn = f.state.player.career.ledger[0].worn.find(line => line.itemId === BIT);
    assert.ok(worn, 'actual settlement records fitted bit wear');
    if (worn.wear < worn.from && !sawReplacement) {
      sawWear = true; assert.equal(f.state.player.career.fieldRegrinds[BIT], true);
    }
    if (worn.wear >= worn.from) { sawReplacement = true; assert.equal(f.state.player.career.fieldRegrinds[BIT], undefined); }
  }
  assert.ok(sawWear, 'fixture must include normal wear without replacement');
  assert.ok(sawReplacement, 'real wear loop must replace the worn bit');
  assert.equal(f.state.contract, null);
  assert.equal(f.progression.fieldRegrind().ok, true);
});
test('real simulation starts at the recovered tool condition', async () => {
  const starts = [];
  for (const trained of [false, true]) {
    const f = await fresh(); if (trained) { rank(f); assert.equal(f.progression.fieldRegrind().ok, true); }
    assert.equal(f.progression.acceptContract(contract()).ok, true);
    const sim = createDrillSim({ state: f.state, bus: f.bus, progression: f.progression });
    sim.startHole(f.state.contract); assert.equal(sim.active, true);
    starts.push(sim.getTelemetry().wear); sim.dispose();
  }
  near(starts[0], 0.45); near(starts[1], 0.33);
});
test('v6 migration preserves the entire existing career and adds only unused treatment history', async () => {
  const f = await fresh(); rank(f, 2);
  assert.equal(f.progression.acceptContract(contract()).ok, true); settle(f);
  const old = f.progression.serialise(); old.version = 6; delete old.player.career.fieldRegrinds;
  f.store.setItem(SAVE_KEY, JSON.stringify(old)); f.store.removeItem(SAVE_BACKUP_KEY);
  const g = await fresh(f.store, false);
  const after = g.progression.serialise();
  assert.equal(after.version, SAVE_VERSION); assert.deepEqual(after.player.career.fieldRegrinds, {});
  after.version = 6; delete after.player.career.fieldRegrinds;
  assert.deepEqual(after, old, 'old money, skills, inventory, completed holes and accepted job remain exact');
});
test('missing or corrupt v7 history and future save versions cannot silently reset treatment history', async () => {
  for (const mutate of [
    p => { delete p.player.career.fieldRegrinds; },
    p => { p.player.career.fieldRegrinds = null; },
    p => { p.player.career.fieldRegrinds = []; },
    p => { p.player.career.fieldRegrinds = { [BIT]: false }; },
    p => { p.version = SAVE_VERSION + 1; },
    p => { p.version = 6.5; },
    p => { p.version = '7'; },
  ]) {
    const f = await fresh(); rank(f); assert.equal(f.progression.fieldRegrind().ok, true);
    const valid = f.progression.serialise(), bad = structuredClone(valid); mutate(bad);
    bad.player.money += 999; // proves the backup was used, not just a truthy load.
    f.store.setItem(SAVE_KEY, JSON.stringify(bad)); f.store.setItem(SAVE_BACKUP_KEY, JSON.stringify(valid));
    assert.equal(f.progression.load(), true, 'valid backup restores the existing career');
    assert.equal(f.state.player.money, valid.player.money);
    unchangedRejection(f); near(f.state.garage.condition[BIT], 0.67);
  }
});
test('blocked-save status distinguishes a preserved newer career from a readable backup', async () => {
  for (const withBackup of [false, true]) {
    const f = await fresh(); const valid = f.progression.serialise();
    const future = structuredClone(valid); future.version = SAVE_VERSION + 1;
    const raw = JSON.stringify(future); f.store.setItem(SAVE_KEY, raw);
    if (withBackup) f.store.setItem(SAVE_BACKUP_KEY, JSON.stringify(valid));
    else f.store.removeItem(SAVE_BACKUP_KEY);
    assert.equal(f.progression.load(), withBackup);
    const blocked = f.progression.getSaveBlockStatus();
    assert.equal(blocked.reason, 'newer-save-version');
    assert.deepEqual(blocked.keys, [SAVE_KEY]);
    assert.deepEqual(blocked.versions, [SAVE_VERSION + 1]);
    assert.equal(blocked.loadedFrom, withBackup ? SAVE_BACKUP_KEY : null);
    assert.equal(f.progression.save(), false); assert.equal(f.store.getItem(SAVE_KEY), raw);
  }
});
test('a newer external save arriving after load is preserved before the next write', async () => {
  const f = await fresh(); assert.equal(f.progression.save(), true);
  const future = f.progression.serialise(); future.version = SAVE_VERSION + 1;
  const raw = JSON.stringify(future); f.store.setItem(SAVE_BACKUP_KEY, raw);
  f.progression.addMoney(1); assert.equal(f.progression.save(), false);
  assert.equal(f.progression.getSaveBlockStatus().reason, 'newer-save-version');
  assert.equal(f.store.getItem(SAVE_BACKUP_KEY), raw);
});
test('explicit reset can intentionally replace a protected career, while failed deletion keeps it protected', async () => {
  for (const failRemoval of [false, true]) {
    const f = await fresh(); const future = f.progression.serialise(); future.version = SAVE_VERSION + 1;
    const raw = JSON.stringify(future); f.store.setItem(SAVE_KEY, raw); f.store.removeItem(SAVE_BACKUP_KEY);
    assert.equal(f.progression.load(), false);
    if (failRemoval) f.store.removeItem = () => { throw new Error('Read-only storage'); };
    f.progression.reset();
    if (failRemoval) {
      assert.equal(f.progression.save(), false);
      assert.equal(f.progression.getSaveBlockStatus().reason, 'newer-save-version');
      assert.equal(f.store.getItem(SAVE_KEY), raw);
    } else {
      assert.equal(f.progression.getSaveBlockStatus(), null);
      assert.equal(f.progression.save(), true);
      assert.equal(JSON.parse(f.store.getItem(SAVE_KEY)).version, SAVE_VERSION);
    }
  }
});
let failed = 0;
try {
  for (const { name, fn } of tests) {
    try { await fn(); console.log(`PASS ${name}`); }
    catch (e) { failed++; console.error(`FAIL ${name}: ${e.stack}`); }
  }
} finally {
  for (const f of contexts) f.progression.dispose();
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
console.log(`Field Regrind: ${tests.length - failed}/${tests.length} groups passed`);
if (failed) process.exitCode = 1;
