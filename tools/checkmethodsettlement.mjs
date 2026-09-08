#!/usr/bin/env node
/** Actual simulation-to-progression settlement regressions.
 * Run: node tools/checkmethodsettlement.mjs
 * The separate auditmethodsettlement.mjs and its dated JSON preserve the red
 * evidence. This gate never overwrites that evidence.
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { getMethod, RIGS, CERTS, defaultLoadoutFor } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { xpForContract } from '../src/game/economy.js';

const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWarn = console.warn;
const warnings = [], results = [], measurements = [];
console.warn = (...args) => warnings.push(args.map(String).join(' '));
let ordinal = 0;
async function fixture(methodId = 'site-investigation', groundId = 'clay') {
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)),
    removeItem: k => values.delete(k),
  } });
  const state = createGameState(), bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(20260908), SCENES });
  await progression.init();
  state.player.level = 60; state.player.money = 1e8;
  state.player.certs = CERTS.map(c => c.id);
  state.unlocked.methods = [methodId]; state.unlocked.rigs = RIGS.map(r => r.id);
  state.garage.rigId = methodId === 'site-investigation' ? 'cpt-unit' : 'piling-leader';
  state.garage.loadout = methodId === 'site-investigation'
    ? { ...defaultLoadoutFor(methodId, 60), probe: 'cpt-cone-piezo', rod: 'push-rod-1m' }
    : { hammer: 'impact-hammer-9t', dolly: 'dolly-plastic', install: 'precast-pile-350' };
  state.garage.owned = Object.values(state.garage.loadout).filter(Boolean);
  const m = getMethod(methodId), targetDepth = methodId === 'site-investigation' ? 10 : 8;
  const contract = { id: `check-method-settlement-${++ordinal}`, title: 'Settlement regression fixture',
    methodId, regionId: 'nordic', applicationId: methodId === 'site-investigation' ? 'site-investigation' : 'foundation-piling',
    archetype: 'urban-plot', targetDepth, holes: 1, metres: targetDepth,
    holeDia: m.nominalDia, payout: 10000, bonus: { time: 1000, quality: 1000 },
    deadlineHours: 24, reputationReward: 10, requiredCerts: [], difficulty: 1,
    hardness: 0.2, abrasivity: 0.2, seed: 194, ground: [{ id: groundId, top: 0, bottom: 100 }],
    flushMedium: m.flushMedium,
  };
  assert.equal(progression.previewContract(contract).ok, true, 'Real readiness passes');
  assert.equal(progression.acceptContract(contract).ok, true, 'Real acceptance passes');
  const events = [];
  bus.on(EVENTS.HOLE_COMPLETE, p => events.push(p));
  const sim = createDrillSim({ state, bus, progression });
  sim.init(); assert.ok(sim.startHole(contract));
  assert.ok(sim.getTelemetry().attemptId != null, 'Real attempt identity');
  return { state, bus, progression, sim, contract, events,
    dispose() { sim.dispose(); progression.dispose(); } };
}
function until(ctx, condition, limit = 36000) {
  for (let i = 0; i < limit; i++) {
    if (condition()) return;
    ctx.sim.debug.stepFixed(1);
  }
  throw new Error(`Bounded simulation did not reach condition (${ctx.sim.getTelemetry().phase})`);
}
function outcome(ctx) {
  assert.equal(ctx.events.length, 1, 'Exactly one physical completion');
  const payload = ctx.events[0], settlement = ctx.progression.settlementForCompletion(payload);
  assert.ok(settlement, 'Authoritative receipt for actual event');
  return { payload, settlement };
}
function replayIsInert(ctx) {
  const before = structuredClone(ctx.progression.serialise());
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, ctx.events[0]);
  assert.deepEqual(ctx.progression.serialise(), before, 'Genuine duplicate event cannot repay');
}
async function test(name, fn) {
  const owned = [];
  try {
    await fn(async (...args) => { const ctx = await fixture(...args); owned.push(ctx); return ctx; });
    results.push({ name, pass: true });
  } catch (error) { results.push({ name, pass: false, error: error.stack }); }
  finally { for (const ctx of owned) ctx.dispose(); }
}

try {
  await test('CPT zero-distance voluntary stop grants no unearned product or rewards', async fresh => {
    const ctx = await fresh();
    assert.equal(ctx.sim.pulse('terminate').ok, true);
    const { payload, settlement } = outcome(ctx);
    assert.equal(payload.depth, 0); assert.equal(settlement.depth, 0);
    assert.equal(settlement.revenue, 0); assert.equal(settlement.xp, 0);
    assert.equal(settlement.reputation, 0); assert.equal(ctx.state.player.stats.metresDrilled, 0);
    assert.equal(!!ctx.state.player.career.firstTimes['site-investigation'], false);
    replayIsInert(ctx);
    measurements.push({ name: 'CPT zero', settlement });
  });
  await test('CPT partial stop retains actual depth and scales XP once', async fresh => {
    const ctx = await fresh(); ctx.sim.setInput('feed', 20 / 34);
    until(ctx, () => ctx.sim.getTelemetry().depth >= 2);
    const actual = ctx.sim.getTelemetry().depth;
    assert.equal(ctx.sim.pulse('terminate').ok, true);
    const { payload, settlement } = outcome(ctx);
    assert.equal(payload.depth, +actual.toFixed(2)); assert.equal(settlement.depth, payload.depth);
    assert.equal(ctx.state.player.stats.metresDrilled, +payload.depth.toFixed(1));
    assert.ok(settlement.revenue > 0 && settlement.revenue < ctx.contract.payout / 2);
    const fullXP = xpForContract(ctx.contract, { grade: payload.grade, holesCompleted: 1, skills: {}, firstTime: true });
    assert.equal(settlement.xp, Math.round(fullXP * payload.depth / ctx.contract.targetDepth));
    replayIsInert(ctx);
    measurements.push({ name: 'CPT partial', actual, settlement, fullXP });
  });
  await test('CPT automatic thrust-limit stop never invents achieved metres', async fresh => {
    const ctx = await fresh('site-investigation', 'sandstone');
    until(ctx, () => !ctx.sim.active);
    const { payload, settlement } = outcome(ctx);
    assert.equal(payload.breakdown.quality.terminated, true);
    assert.equal(payload.depth, 0); assert.equal(settlement.depth, 0);
    assert.equal(settlement.revenue, 0); assert.equal(settlement.xp, 0);
    assert.equal(ctx.state.player.stats.metresDrilled, 0);
    replayIsInert(ctx);
  });
  await test('CPT genuine target completion still delivers and pays full work', async fresh => {
    const ctx = await fresh(); ctx.sim.setInput('feed', 20 / 34);
    until(ctx, () => !ctx.sim.active);
    const { payload, settlement } = outcome(ctx);
    assert.equal(payload.depth, ctx.contract.targetDepth);
    assert.equal(settlement.depth, ctx.contract.targetDepth);
    assert.ok(payload.breakdown.quality.readings > 150);
    assert.ok(settlement.revenue > 0 && settlement.xp > 0);
    assert.equal(ctx.state.player.stats.metresDrilled, ctx.contract.targetDepth);
    replayIsInert(ctx);
    measurements.push({ name: 'CPT target', settlement });
  });
  await test('CPT dissipation holds for authored four seconds before restoring the channel', async fresh => {
    const ctx = await fresh(); ctx.sim.setInput('feed', 1);
    assert.ok(ctx.sim.debug.triggerHazard('cone-desaturation'), 'QA injects only the external hazard');
    until(ctx, () => !ctx.sim.getTelemetry().programme.saturated, 2000);
    const before = ctx.sim.getTelemetry();
    assert.equal(ctx.sim.pulse('dissipation').ok, true);
    const duration = ctx.sim.debug.tuning.hazard.coneDesat.dissipationSec;
    assert.equal(ctx.sim.debug.state.phaseDur, duration);
    assert.equal(ctx.sim.pulse('dissipation').ok, false, 'Busy action cannot restart the clock');
    ctx.sim.debug.stepFixed(Math.floor(duration * 120) - 1);
    const waiting = ctx.sim.getTelemetry();
    assert.equal(waiting.phase, 'dissipation'); assert.equal(waiting.programme.saturated, false);
    assert.equal(waiting.depth, before.depth); assert.equal(waiting.programme.dissipations, before.programme.dissipations);
    until(ctx, () => ctx.sim.getTelemetry().phase !== 'dissipation', 3);
    const after = ctx.sim.getTelemetry();
    assert.equal(after.programme.saturated, true);
    assert.equal(after.programme.dissipations, before.programme.dissipations + 1);
    const elapsed = after.timeSec - before.timeSec;
    assert.ok(elapsed >= duration - 1e-9 && elapsed <= duration + 2 / 120);
    measurements.push({ name: 'CPT dissipation', duration, elapsed });
  });
  await test('Real unfounded pile completion pays zero delivered pile units', async fresh => {
    const ctx = await fresh('driven-pile');
    until(ctx, () => ctx.sim.debug.state.prog.pitched && ctx.sim.getTelemetry().phase === 'drilling');
    assert.equal(ctx.sim.pulse('takeSet').ok, true);
    until(ctx, () => ctx.sim.debug.state.prog.reDrives === 1 && ctx.sim.getTelemetry().phase === 'drilling');
    assert.equal(ctx.sim.pulse('takeSet').ok, true);
    until(ctx, () => !ctx.sim.active);
    const { payload, settlement } = outcome(ctx);
    assert.equal(payload.breakdown.quality.founded, false);
    assert.equal(payload.breakdown.quality.hardRefused, false);
    assert.equal(settlement.revenue, 0);
    replayIsInert(ctx);
    measurements.push({ name: 'Pile unfounded', settlement });
  });
  await test('Real founded pile completion retains its legitimate payment', async fresh => {
    const ctx = await fresh('driven-pile', 'sandstone');
    until(ctx, () => !ctx.sim.active);
    const { payload, settlement } = outcome(ctx);
    assert.equal(payload.breakdown.quality.founded, true);
    assert.ok(settlement.revenue > 0);
    replayIsInert(ctx);
    measurements.push({ name: 'Pile founded', settlement });
  });
} finally {
  console.warn = originalWarn;
  if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
  else delete globalThis.localStorage;
}
for (const row of results) console.log(`${row.pass ? 'PASS' : 'FAIL'} ${row.name}${row.error ? `\n${row.error}` : ''}`);
console.log(JSON.stringify({ cases: results.length, failures: results.filter(x => !x.pass).length, measurements, warnings }));
if (results.some(x => !x.pass)) process.exitCode = 1;
