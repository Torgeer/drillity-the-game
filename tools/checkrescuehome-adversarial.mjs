#!/usr/bin/env node
/** Independent order-invariant Nordic-home rescue review. Uses actual saved
 * payload reloads, public provider/preview/acceptance and unchanged travel.
 * --baseline may name a frozen progression module for exact before/after checks.
 * No migration is asserted to produce the reordered fixture arrays.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { REGIONS } from '../src/game/data.js';
import { ECON, emergencyContract, travelCost } from '../src/game/economy.js';

const baselinePath = process.argv.find(a => a.startsWith('--baseline='))?.slice(11);
const baseline = baselinePath ? (await import(pathToFileURL(resolve(baselinePath)).href)).createProgression : null;
const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage'), oldWarn = console.warn;
const warnings = [], tests = [], results = [], measurements = [];
console.warn = (...args) => warnings.push(args.map(String).join(' '));
const ids = REGIONS.map(r => r.id), clone = v => structuredClone(v);
const test = (name, fn) => tests.push({ name, fn });
let owned = [];
async function fresh({ money = -2000, from = 'nordic', unlocked = ids,
  values = new Map(), restore = false, factory = createProgression } = {}) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  } });
  const state = createGameState(), bus = createBus(), events = [];
  const progression = factory({ state, bus, rand: makeRandom(2801), SCENES }); await progression.init();
  if (!restore) {
    state.player.level = 60; state.player.money = money;
    state.unlocked.regions = [...unlocked]; state.world.regionId = from;
    state.player.career.lastRegionId = from;
  }
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  const ctx = { state, bus, progression, events, values }; owned.push(ctx); return ctx;
}
const snapshot = ctx => JSON.stringify({ state: ctx.state, save: ctx.progression.serialise(), events: ctx.events, values: [...ctx.values] });
function inspect(ctx) {
  const before = snapshot(ctx), c = ctx.progression.rescueContract(), quote = ctx.progression.previewContract(c);
  assert.equal(snapshot(ctx), before, 'provider and preview preserve cash, location, saves, events and all career fields');
  return { c, quote };
}
function refuse(ctx, c) {
  const before = snapshot(ctx), quote = ctx.progression.previewContract(c);
  assert.equal(quote.ok, false); assert.equal(ctx.progression.acceptContract(c).ok, false);
  assert.equal(snapshot(ctx), before); return quote;
}
function complete(ctx) {
  const c = ctx.state.contract, identity = ctx.progression.beginHole(c); assert.ok(identity);
  const payload = { contract: c, ...identity, depth: c.targetDepth, grade: 'D', timeSec: 180,
    breakdown: { time: { parSec: 60, actualSec: 180 } } };
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  assert.ok(ctx.progression.settlementForCompletion(payload)); return payload;
}

for (const from of ids) for (const money of [-2000, 0, 399]) {
  test(`normal Nordic-first ${from} cash ${money} retains exact canonical card and zero quote`, async () => {
    const ctx = await fresh({ from, money }), actual = inspect(ctx);
    assert.deepEqual(actual.c, emergencyContract(60, 'nordic'));
    assert.equal(actual.quote.ok, true); assert.equal(actual.quote.mobilisation, 0);
    assert.equal(travelCost(from, 'nordic', { rigId: ctx.state.garage.rigId }), 0,
      'destination Nordic already costs zero; this change introduces no fee waiver');
    if (baseline) {
      const old = await fresh({ from, money, factory: baseline });
      assert.deepEqual(actual, inspect(old), 'normal before/after provider and entire readiness response are identical');
    }
    assert.equal(ctx.progression.acceptContract(actual.c).ok, true);
    assert.equal(ctx.state.player.money, money); assert.equal(ctx.state.world.regionId, 'nordic');
    assert.equal(ctx.state.player.career.lastRegionId, 'nordic');
    measurements.push({ kind: 'normal', from, money, chosen: actual.c.regionId,
      mobilisation: actual.quote.mobilisation, baselineCompared: !!baseline });
  });
}

for (const first of ids.filter(id => id !== 'nordic')) {
  test(`real loaded ${first}-first valid region array finds unlocked Nordic without paying away debt`, async () => {
    const unlocked = [first, ...ids.filter(id => id !== first)];
    const seed = await fresh({ unlocked }); assert.equal(seed.progression.save(), true);
    const values = new Map(seed.values);
    const current = await fresh({ values: new Map(values), restore: true });
    assert.deepEqual(current.state.unlocked.regions, unlocked, 'real load preserves this valid reordered array');
    const actual = inspect(current); assert.equal(actual.c.regionId, 'nordic');
    assert.equal(actual.quote.ok, true); assert.equal(actual.quote.mobilisation, 0);
    let prior = null;
    if (baseline) {
      const old = await fresh({ values: new Map(values), restore: true, factory: baseline });
      prior = inspect(old); assert.equal(prior.c.regionId, first);
      assert.equal(prior.quote.ok, false); assert.ok(prior.quote.mobilisation > 0);
    }
    assert.equal(current.progression.acceptContract(actual.c).ok, true);
    assert.equal(current.state.player.money, -2000, 'acceptance charges/grants nothing and preserves debt');
    assert.deepEqual(current.state.unlocked.regions, unlocked, 'selection does not reorder stored user progress');
    measurements.push({ kind: 'loaded reordered', first, chosen: actual.c.regionId,
      oldMobilisation: prior?.quote.mobilisation ?? null, newMobilisation: actual.quote.mobilisation });
  });
}

test('all seven ordinary foreign travel fees remain strict and charged exactly when affordable', async () => {
  for (const destination of ids.filter(id => id !== 'nordic')) {
    const ctx = await fresh(), c = { ...emergencyContract(60, destination), emergency: false,
      id: `ordinary-paid-${destination}` };
    const rejected = refuse(ctx, c); assert.ok(rejected.mobilisation > 0);
    ctx.state.player.money = rejected.mobilisation - 1; refuse(ctx, c);
    ctx.state.player.money = rejected.mobilisation;
    assert.equal(ctx.progression.acceptContract(c).ok, true); assert.equal(ctx.state.player.money, 0);
    assert.equal(ctx.progression.run.mobilisation, rejected.mobilisation);
  }
});

test('defensive live state without unlocked Nordic retains first-valid fallback and ordinary positive travel fee', async () => {
  for (const first of ids.filter(id => id !== 'nordic')) {
    const unlocked = [first, ...ids.filter(id => id !== first && id !== 'nordic')];
    // This is a defensive live-state fixture, not a normal restored career:
    // init() already reconciles a missing Nordic unlock back into loaded saves.
    const ctx = await fresh({ unlocked });
    assert.ok(!ctx.state.unlocked.regions.includes('nordic'));
    const { c } = inspect(ctx); assert.equal(c.regionId, first);
    assert.ok(refuse(ctx, c).mobilisation > 0, 'new selector neither unlocks Nordic nor waives genuine travel');
  }
});

test('altered Nordic canonical identity and workload remain refused even when travel is free', async () => {
  for (const mutate of [c => c.id += '-forged', c => c.payout++, c => c.bonus.time++,
    c => c.holes++, c => c.targetDepth++, c => c.emergency = 'true', c => c.regionId = 'german-site']) {
    const ctx = await fresh(), c = clone(ctx.progression.rescueContract()); mutate(c); refuse(ctx, c);
  }
});

test('an already accepted non-Nordic canonical rescue retains its contract and support after selector changes on reload', async () => {
  const first = await fresh({ from: 'german-site', money: 0 });
  const legacyCard = emergencyContract(first.state.player.level, 'german-site');
  assert.equal(first.progression.acceptContract(legacyCard).ok, true);
  complete(first); complete(first); assert.equal(first.progression.save(), true);
  const before = first.state.player.money - first.state.player.career.ledger.slice(0, 2).reduce((sum, e) => sum + e.net, 0);
  const restored = await fresh({ values: new Map(first.values), restore: true });
  assert.equal(restored.state.contract.regionId, 'german-site');
  assert.equal(restored.progression.rescueContract().regionId, 'nordic', 'prospective posting changes, active work does not');
  assert.equal(restored.progression.run.holesDone, 2); complete(restored);
  const summary = restored.events.find(e => e.event === EVENTS.SCENE_CHANGE && e.payload.summary)?.payload.summary;
  assert.ok(summary); assert.equal(summary.net, restored.state.player.money - before);
  assert.ok(summary.net >= ECON.brokeBelow, 'recognized accepted canonical work keeps its conditional floor');
});

test('existing load filters invalid region entries and reconciles a missing Nordic unlock before selection', async () => {
  const seed = await fresh({ unlocked: ['critic-invalid-region', 'german-site', 'alpine'] });
  assert.equal(seed.progression.save(), true);
  const ctx = await fresh({ values: new Map(seed.values), restore: true });
  assert.deepEqual(ctx.state.unlocked.regions, ['german-site', 'alpine', 'nordic']);
  assert.equal(inspect(ctx).c.regionId, 'nordic');
});

try {
  for (const { name, fn } of tests) {
    owned = [];
    try { await fn(); results.push({ name, pass: true }); }
    catch (error) { results.push({ name, pass: false, error: error.stack }); }
    finally { for (const ctx of owned) ctx.progression.dispose(); }
  }
} finally {
  console.warn = oldWarn;
  if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage); else delete globalThis.localStorage;
}
const paths = ['src/game/progression.js', 'src/game/economy.js', 'src/game/data.js', 'tools/checkrescuehome-adversarial.mjs'];
const report = { passed: results.filter(r => r.pass).length, total: results.length, baselinePath: baselinePath || null,
  results, measurements, sourceHashes: Object.fromEntries(paths.map(path => [path,
    createHash('sha256').update(readFileSync(new URL(`../${path}`, import.meta.url))).digest('hex')])),
  baselineProgressionHash: baselinePath ? createHash('sha256').update(readFileSync(resolve(baselinePath))).digest('hex') : null,
  warningKinds: [...new Set(warnings)] };
const reportArg = process.argv.find(a => a.startsWith('--report='));
if (reportArg) { const out = resolve(reportArg.slice(9)); mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2) + '\n'); }
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.name}${r.pass ? '' : '\n' + r.error}`);
console.log(`Rescue Nordic-home critic: ${report.passed}/${report.total}; exact frozen baseline: ${!!baseline}`);
if (report.passed !== report.total) process.exitCode = 1;
