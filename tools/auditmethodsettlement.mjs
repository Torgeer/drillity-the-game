#!/usr/bin/env node
/** Bounded diagnostic, not a passing release gate. Run: node tools/auditmethodsettlement.mjs
 * Executes the production bus, progression and simulation. Only browser storage,
 * owned/unlocked player fixture and explicit contract geology are supplied here.
 * No state teleport, god mode, synthetic completion, or production-source patch.
 */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { getMethod, RIGS, CERTS, defaultLoadoutFor } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { settleRun } from '../src/game/economy.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const reportPath = new URL('../research/method-settlement-findings-2026-09-08.json', import.meta.url);
const sources = ['src/sim/drilling.js', 'src/game/progression.js', 'src/game/economy.js', 'src/game/data.js'];
const hash = async p => createHash('sha256').update(await readFile(new URL(`../${p}`, import.meta.url))).digest('hex');
const sourceHashes = Object.fromEntries(await Promise.all(sources.map(async p => [p, await hash(p)])));
const cases = [], warnings = [], errors = [];
const originalWarn = console.warn, originalError = console.error;
console.warn = (...args) => warnings.push(args.map(String).join(' '));
console.error = (...args) => errors.push(args.map(String).join(' '));
const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const clone = structuredClone;

function contract(name, methodId, ground) {
  const m = getMethod(methodId), targetDepth = methodId === 'site-investigation' ? 10 : 8;
  return { id: `method-settlement-${name}`, title: `Diagnostic ${name}`, methodId,
    regionId: 'nordic', applicationId: methodId === 'site-investigation' ? 'site-investigation' : 'foundation-piling',
    archetypeId: 'urban-plot', targetDepth, holes: 1, metres: targetDepth,
    holeDia: m.nominalDia, payout: 10000, bonus: { time: 1000, quality: 1000 },
    deadlineHours: 24, reputationReward: 10, requiredCerts: [], difficulty: 1,
    hardness: 0.2, abrasivity: 0.2, seed: 194, ground,
    flushMedium: m.flushMedium,
  };
}
async function start(name, methodId, ground) {
  const entries = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: k => entries.get(k) ?? null,
    setItem: (k, v) => entries.set(k, String(v)), removeItem: k => entries.delete(k),
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
  const c = contract(name, methodId, ground);
  const preflight = progression.previewContract(c);
  assert.equal(preflight.ok, true, `Readiness ${name}: ${preflight.reason}`);
  assert.equal(progression.acceptContract(c).ok, true);
  const completions = [];
  bus.on(EVENTS.HOLE_COMPLETE, p => completions.push(p));
  const sim = createDrillSim({ state, bus, progression });
  sim.init();
  assert.ok(sim.startHole(c), `Accepted simulation start: ${name}`);
  assert.ok(sim.getTelemetry().attemptId != null, 'Production attempt identity');
  return { name, state, sim, progression, c, completions, preflight,
    before: clone(state.player), ticks: 0,
    dispose() { sim.dispose(); progression.dispose(); },
  };
}
function step(ctx, n = 1) {
  const s = ctx.sim.debug.state; // the public read-only diagnostic surface
  ctx.beforeTerminalStep = { active: s.active, depth: s.depth, timeSec: s.timeSec,
    phase: s.phase, toeDepthM: s.prog?.toeDepthM ?? null,
    headDepthM: s.prog?.headDepthM ?? null };
  ctx.sim.debug.stepFixed(n); ctx.ticks += n;
}
function until(ctx, predicate, maxTicks = 36000) {
  for (let n = 0; n < maxTicks; n++) {
    if (predicate()) return;
    step(ctx);
  }
  throw new Error(`Bounded step limit: ${ctx.name}, ${ctx.sim.getTelemetry().phase}`);
}
function finishRecord(ctx, beforeAction = null, action = null) {
  assert.equal(ctx.completions.length, 1, 'One genuine completion event');
  const payload = ctx.completions[0];
  const settlement = ctx.progression.settlementForCompletion(payload);
  assert.ok(settlement, 'Actual progression accepted the event');
  return { name: ctx.name, fixture: clone(ctx.c), preflight: ctx.preflight,
    loadout: clone(ctx.state.garage.loadout), ticks: ctx.ticks,
    beforeAction, action, beforeTerminalStep: ctx.beforeTerminalStep ?? null,
    completion: clone(payload), settlement: clone(settlement),
    playerStatsDelta: { metresDrilled: ctx.state.player.stats.metresDrilled - ctx.before.stats.metresDrilled,
      money: ctx.state.player.money - ctx.before.money, xp: ctx.state.player.xp - ctx.before.xp },
    observedProgramme: clone(ctx.sim.getTelemetry().programme),
  };
}
async function run(name, fn) {
  let ctx;
  try { ctx = await fn(); }
  catch (e) { cases.push({ name, harnessError: e.stack }); }
  finally { ctx?.dispose(); }
}

try {
  for (const mode of ['immediate', 'partial', 'target', 'thrust-limit']) {
    await run(`cpt-${mode}`, async () => {
      const ctx = await start(`cpt-${mode}`, 'site-investigation',
        [{ id: mode === 'thrust-limit' ? 'sandstone' : 'clay', top: 0, bottom: 100 }]);
      try {
        ctx.sim.setInput('feed', 20 / 34);
        if (mode === 'partial') until(ctx, () => ctx.sim.getTelemetry().depth >= 2);
        if (mode === 'target' || mode === 'thrust-limit') until(ctx, () => !ctx.sim.active);
        const before = clone(ctx.sim.getTelemetry());
        const action = mode === 'immediate' || mode === 'partial' ? ctx.sim.pulse('terminate') : null;
        const row = finishRecord(ctx, before, action);
        row.expectedDepthBasis = mode === 'target' ? ctx.c.targetDepth : before.depth;
        // Automatic stop has already reset depth in the pre-action snapshot;
        // preserve the last active fixed-step depth and last measured reading.
        if (mode === 'thrust-limit') row.expectedDepthBasis = row.beforeTerminalStep.depth;
        row.lastMeasuredDepthM = row.completion.breakdown.quality.trace.at(-1)?.depthM ?? null;
        row.reportedDepthExceedsDelivered = row.completion.depth > row.expectedDepthBasis + 0.1;
        cases.push(row); return ctx;
      } catch (e) { ctx.dispose(); throw e; }
    });
  }
  await run('cpt-dissipation', async () => {
    const ctx = await start('cpt-dissipation', 'site-investigation', [{ id: 'clay', top: 0, bottom: 100 }]);
    try {
      const before = clone(ctx.sim.getTelemetry());
      const action = ctx.sim.pulse('dissipation');
      const rawDuration = ctx.sim.debug.state.phaseDur;
      step(ctx);
      const after = clone(ctx.sim.getTelemetry());
      cases.push({ name: ctx.name, fixture: ctx.c, preflight: ctx.preflight, action,
        authoredDuration: ctx.sim.debug.tuning.hazard.coneDesat.dissipationSec,
        usedDurationFinite: Number.isFinite(rawDuration), usedDuration: String(rawDuration),
        elapsedPlayerSeconds: after.timeSec - before.timeSec,
        beforeDissipations: before.programme.dissipations, afterDissipations: after.programme.dissipations,
        phaseAfterOneTick: after.phase,
      }); return ctx;
    } catch (e) { ctx.dispose(); throw e; }
  });
  for (const mode of ['early-unfounded', 'accepted-control']) {
    await run(`pile-${mode}`, async () => {
      const ctx = await start(`pile-${mode}`, 'driven-pile',
        [{ id: mode === 'early-unfounded' ? 'clay' : 'sandstone', top: 0, bottom: 100 }]);
      try {
        const actions = [];
        if (mode === 'early-unfounded') {
          until(ctx, () => ctx.sim.debug.state.prog.pitched && ctx.sim.getTelemetry().phase === 'drilling');
          actions.push({ before: clone(ctx.sim.getTelemetry()), result: ctx.sim.pulse('takeSet') });
          until(ctx, () => !ctx.sim.active || (ctx.sim.debug.state.prog.reDrives === 1 && ctx.sim.getTelemetry().phase === 'drilling'));
          if (ctx.sim.active) actions.push({ before: clone(ctx.sim.getTelemetry()), result: ctx.sim.pulse('takeSet') });
        }
        until(ctx, () => !ctx.sim.active);
        const row = finishRecord(ctx, actions.at(-1)?.before ?? null, actions);
        const q = row.completion.breakdown.quality;
        row.qualityHasNestedDetail = Object.hasOwn(q, 'detail');
        row.deliveredPile = q.founded || q.hardRefused;
        // Read-only counterfactual through production economy (not an emitted
        // completion): confirms that zero delivered units must suppress revenue.
        row.economyZeroUnitsControl = settleRun({ ...ctx.c, metres: row.completion.depth }, {
          rigId: ctx.state.garage.rigId, loadout: ctx.state.garage.loadout,
          grade: row.completion.grade, unitsCompleted: 0, holesCompleted: 1,
        }).revenue;
        row.paidWithoutDeliveredPile = !row.deliveredPile && row.settlement.revenue > 0;
        cases.push(row); return ctx;
      } catch (e) { ctx.dispose(); throw e; }
    });
  }
} finally {
  console.warn = originalWarn; console.error = originalError;
  if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
  else delete globalThis.localStorage;
}
const sourceHashesAfter = Object.fromEntries(await Promise.all(sources.map(async p => [p, await hash(p)])));
const report = {
  schema: 1, generatedAt: new Date().toISOString(), command: 'node tools/auditmethodsettlement.mjs',
  baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sourceHashes, sourceHashesAfter, sourceStable: JSON.stringify(sourceHashes) === JSON.stringify(sourceHashesAfter),
  scope: 'Production simulation/progression/bus; bounded deterministic CPU fixture. Not phone/UI certification.',
  fixtureLimits: 'Owned/unlocked level60 fixture, authored10m CPT/8m pile contracts with explicit ground; no invented completion, debug-state writes, godMode or setDepth. CPU fixed-step API only.',
  cases, warnings, errors,
};
await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ report: fileURLToPath(reportPath), sourceStable: report.sourceStable,
  cases: cases.map(c => ({ name: c.name, harnessError: c.harnessError ?? null,
    reportedDepthExceedsDelivered: c.reportedDepthExceedsDelivered,
    depth: c.completion?.depth, delivered: c.expectedDepthBasis, revenue: c.settlement?.revenue,
    deliveredPile: c.deliveredPile, paidWithoutDeliveredPile: c.paidWithoutDeliveredPile,
    usedDurationFinite: c.usedDurationFinite, elapsedPlayerSeconds: c.elapsedPlayerSeconds,
  })), errors }, null, 2));
if (cases.some(c => c.harnessError) || errors.length || !report.sourceStable) process.exitCode = 1;
