#!/usr/bin/env node
/** Read-only rate inventory using production content/model/simulation APIs.
 * No rate-equality assertion: nominal, cap, cutting, advance and cycle rates
 * have different meanings. All fixed operating inputs below are NOT SOURCED
 * regression fixtures, not field production claims. No physics is retuned.
 * Usage: node tools/checkrateprovenance.mjs [--json path]
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { METHODS, defaultLoadoutFor, groundHardness, estimateHoursBreakdown, itemsForMethod } from '../src/game/data.js';
import { GROUND, createBus } from '../src/core/contract.js';
import { TUNING, methodOf, bitOf, dollyOf, resolveMethod, optimalInputs,
  ropModel, torqueModel, createDrillSim } from '../src/sim/drilling.js';
import { ropBasisFactor, holeMetresFor, settleRun } from '../src/game/economy.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const outIndex = args.indexOf('--json');
const out = outIndex < 0 ? null : resolve(args[outIndex + 1] || '');
if (outIndex >= 0) assert.ok(args[outIndex + 1], '--json requires a path');
const sha = name => createHash('sha256').update(readFileSync(resolve(ROOT, name))).digest('hex');
const report = { auditDefinitionDate: '2026-09-06', runAt: new Date().toISOString(), sourceSha256: Object.fromEntries([
  'src/game/data.js', 'src/sim/drilling.js', 'src/game/economy.js',
  'src/core/contract.js', 'tools/checkrateprovenance.mjs',
].map(name => [name, sha(name)])),
  scope: 'Authored content and actual production model/sim; not physical-rate validation',
  fixture: { groundSelection: 'Eligible nonvoid validGround closest to content hardness 0.5, inside declared model UCS ceiling',
    modelDepthM: 0, modelCondition: 'new stock tool, clean returns, no heat/load/wear, combo 1, actual ground stability',
    grid: 'normalized WOB/RPM/flush 0..1 in 0.05 steps; sampled maximum, not a proved global maximum',
    runtime: '60 player seconds, seed 17, public optimal-input policy and timed rod pulses; hazards/wear/groove unchanged',
    steady: 'last uninterrupted 2s drilling window after 2s with <=10% relative ROP spread, no active hazard, stage 0; cutting torque <=1; original stock tool retained',
    provenance: 'All chosen conditions/thresholds are synthetic NOT SOURCED test inputs; shipped ground numbers are read unchanged' },
  methods: [], comparisons: [], assertions: 0 };
function check(condition, message) { assert.ok(condition, message); report.assertions++; }
const finite = (value, name) => check(Number.isFinite(value) && value >= 0, `${name} must be finite/nonnegative`);
const cleanEnv = ground => ({ depth: 0, load: 0, wear: 0, heat: 0, returns: 1,
  stability: ground.stability, drag: 0, bind: 0, combo: 1, casing: false,
  torque01: 0, hazardTorque: 0, dollyCond: 1, embedM: 0, groundResist: 0, stageRopMul: 1 });
function contentBasis(id) {
  if (id === 'tunnel-jumbo') return 'contract chainage m/h, full cycle (explicit data comment)';
  if (id === 'rockbolt') return 'drilled hole m/h; economy converts to supported drive metres';
  if (id === 'driven-pile') return 'pile penetration m/h; not rock cutting';
  return 'm/h at content hardness 0.5; duty-cycle basis unspecified';
}
function modelBasis(m) {
  return m.kind === 'impact' ? 'pile penetration m/h from set×blows'
    : m.kind === 'push' ? 'cone push m/h from mm/s'
    : 'instantaneous drilled hole m/h (stage 0)';
}
function chooseGround(row, model) {
  return row.validGround.filter(id => GROUND[id]?.ucs > TUNING.rock.voidUcs
    && (!model.rockCeilingUcs || GROUND[id].ucs < model.rockCeilingUcs))
    .map(id => ({ id, hardness: groundHardness([{ id, thickness: 1 }]) }))
    .sort((a, b) => Math.abs(a.hardness - 0.5) - Math.abs(b.hardness - 0.5) || a.id.localeCompare(b.id))[0];
}
function evaluate(m, bit, g, inp, env) {
  const torque01 = torqueModel(m, bit, g, inp, env);
  const result = ropModel(m, bit, g, inp, { ...env, torque01 });
  return { rop: result.rop, potential: result.potential, torque01, inputs: { ...inp }, terms: result.terms };
}
function sampledMax(m, bit, g, env) {
  let any = null, withinTorque = null;
  for (let w = 0; w <= 20; w++) for (let r = 0; r <= 20; r++) for (let f = 0; f <= 20; f++) {
    const measured = evaluate(m, bit, g, { wob: w / 20, rpm: r / 20, flush: f / 20 }, env);
    if (!any || measured.rop > any.rop) any = measured;
    if ((m.kind === 'impact' || m.kind === 'push' || measured.torque01 <= TUNING.torque.optimalHeadroom)
        && (!withinTorque || measured.rop > withinTorque.rop)) withinTorque = measured;
  }
  return { any, withinTorque };
}
function runtimeProbe(row, ground, loadout) {
  const bus = createBus();
  const ctx = { bus, state: { settings: { haptics: false },
    garage: { rigId: row.rigIds[0], loadout, condition: {} }, world: { regionId: 'nordic' } },
    geology: { strata: [{ ...ground, top: 0, bottom: 100000 }],
      getDrillabilityAt: () => ({ ...ground, top: 0, bottom: 100000, index: 0 }) } };
  const sim = createDrillSim(ctx);
  const phases = {}, hazardKinds = new Set(), stages = new Set();
  let lastSteady = null, window = [], samples = [], clockChecks = 0, rodPulses = 0;
  try {
    sim.init();
    const target = Math.min(row.depthRange[1], Math.max(row.depthRange[0], 40));
    sim.startHole({ id: `rate-fixture-${row.id}`, methodId: row.id, flushMedium: row.flushMedium,
      targetDepth: target, holeDia: row.nominalDia, difficulty: row.difficulty,
      regionId: 'nordic', seed: 17, holes: 1 });
    let before = sim.getTelemetry();
    const initialBit = { ...before.bit };
    check(before.methodId === row.id, `${row.id}: actual sim must use requested method`);
    check(before.bit.fits || sim.debug.state.m.toolIsDolly, `${row.id}: actual stock tool must fit`);
    for (let tick = 0; tick < 600 && sim.active; tick++) {
      const desired = before.optimal;
      sim.setInput('feed', desired.wob); sim.setInput('rotation', desired.rpm); sim.setInput('flush', desired.flush);
      const rod = before.rodAdd;
      if (rod && !rod.hit && !rod.missed && rod.t >= rod.windowStart && rod.t <= rod.windowEnd) {
        const pulse = sim.pulse('rodStab');
        check(pulse.ok, `${row.id}: timed rod pulse accepted by actual API`); rodPulses++;
      }
      const beforeDownhole = sim.debug.state.downholeSec;
      const beforeDrill = sim.debug.state.drillSec;
      const after = sim.debug.stepFixed(12);
      const raw = sim.debug.state;
      const dtD = raw.downholeSec - beforeDownhole;
      const dtDrill = raw.drillSec - beforeDrill;
      if (dtDrill > 1e-8 && after.phase === 'drilling' && before.phase === 'drilling') {
        const expected = TUNING.sim.timeCompression * (raw.m.timeMul || 1);
        check(Math.abs(dtD / dtDrill - expected) < 1e-5, `${row.id}: downhole/player clock units`);
        clockChecks++;
      }
      phases[after.phase] = (phases[after.phase] || 0) + 0.1;
      after.hazards.forEach(h => hazardKinds.add(h.kind));
      stages.add(raw.stage);
      const clean = after.phase === 'drilling' && before.phase === 'drilling' && raw.stage === 0
        && after.hazards.every(h => h.phase !== 'active') && after.jam.state === 'free'
        && after.timeSec > 2 && after.rop > 0
        && after.bit.id === initialBit.id
        && (raw.m.kind === 'impact' || raw.m.kind === 'push' || after.torque <= 1);
      if (clean) {
        const sample = { timeSec: after.timeSec, rop: after.rop, depth: after.depth,
          bitId: after.bit.id, combo: after.combo, wear: after.wearTrue, load: after.load, torque: after.torque,
          inputs: { wob: after.wob, rpm: after.rpm, flush: after.flush } };
        samples.push(sample); window.push(sample);
        if (window.length > 20) window.shift();
        if (window.length === 20) {
          const rates = window.map(x => x.rop);
          const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
          if ((Math.max(...rates) - Math.min(...rates)) / mean <= 0.1) lastSteady = {
            meanMh: mean, minMh: Math.min(...rates), maxMh: Math.max(...rates),
            fromSec: window[0].timeSec - 0.1, toSec: after.timeSec,
            first: window[0], last: sample, basis: modelBasis(raw.m),
          };
        }
      } else window = [];
      before = after;
    }
    finite(before.rop, `${row.id} final ROP`);
    return { targetDepthM: target, methodKind: sim.debug.state.m.kind, initialBit, finalBit: before.bit,
      elapsedPlayerSec: before.timeSec, actualDrillPlayerSec: before.drillSec, downholeHours: before.jobHours,
      phaseSeconds: phases, hazardsObserved: [...hazardKinds], stagesObserved: [...stages], clockChecks, rodPulses,
      cleanDrillingSamples: samples.length, observedCleanRangeMh: samples.length
        ? [Math.min(...samples.map(x => x.rop)), Math.max(...samples.map(x => x.rop))] : null,
      steady: lastSteady, unavailableReason: lastSteady ? null
        : 'No uninterrupted qualifying 2s stage 0 drilling window; no substituted rate is reported',
      finalPhase: before.phase, finalReason: before.reason, finalProgressM: before.depth, fullCycleRate: null,
      fullCycleUnavailable: 'Fixture is a bounded drilling-policy probe; method-specific job actions are not fully operated' };
  } finally { sim.dispose(); }
}

check(METHODS.length === 21, 'audit must explicitly cover the current 21 methods');
for (const row of METHODS) {
  const m = methodOf(row.id);
  check(m === TUNING.methods[row.id], `${row.id}: no default method substitution`);
  finite(row.nominalRop, `${row.id} nominal ROP`); finite(m.ropMax, `${row.id} cap`);
  const selection = chooseGround(row, m);
  check(selection, `${row.id}: a valid declared-ground fixture must exist`);
  const ground = { id: selection.id, ...GROUND[selection.id] };
  const loadout = defaultLoadoutFor(row.id, row.unlockLevel);
  const bit = m.toolIsDolly ? dollyOf(loadout.dolly || loadout.bit) : bitOf(loadout.bit, m);
  const env = { ...cleanEnv(ground), casing: !!m.casingFollows };
  const reference = evaluate(m, bit, ground, optimalInputs(m, ground, 0, bit), env);
  const maxima = sampledMax(m, bit, ground, env);
  const runtime = runtimeProbe(row, ground, loadout);
  const fixtureHardness = groundHardness([{ id: ground.id, thickness: 1 }]);
  const economyHours = estimateHoursBreakdown(row.id, 1, fixtureHardness, 1);
  const entry = { id: row.id, nominalMh: row.nominalRop, nominalBasis: contentBasis(row.id),
    declaredCapMh: m.ropMax, capBasis: modelBasis(m), capToNominalArithmetic: m.ropMax / row.nominalRop,
    capAtMaximumGrooveMh: m.ropMax * (m.kind === 'impact' || m.kind === 'push' ? 1 : TUNING.rop.comboMax),
    grooveCapBasis: m.kind === 'impact' || m.kind === 'push'
      ? 'No groove multiplier in impact/push ROP branch'
      : 'Generic cutting cap scales with actual combo; not an absolute cap or a jet withdrawal limit',
    timeCompression: TUNING.sim.timeCompression, methodTimeMultiplier: m.timeMul || 1,
    ground: { id: ground.id, ucsMPa: ground.ucs, abrasivity: ground.abrasivity,
      stability: ground.stability, water: ground.water, contentHardness: fixtureHardness },
    loadout, bit: { id: bit.id, kind: bit.kind, aggression: bit.aggression, carbide: bit.carbide },
    cleanModelOptimal: reference, sampledCleanMaximum: maxima,
    contentEstimate: { ...economyHours, rateAtFixtureHardness: row.nominalRop * (1.35 - 0.7 * fixtureHardness),
      economyRopBasisPerContractMetre: ropBasisFactor(row.id), holeMetresPerContractMetre: holeMetresFor(row.id, 1) },
    runtime, tuningProvenance: 'Exact nominalRop/K/ropMax calibration source not established by this inventory' };
  if (row.id === 'site-investigation') {
    const cpt = resolveMethod(row.id, { probeMode: 'cpt' });
    const inp = optimalInputs(cpt, ground, 0, bit);
    entry.cptVariant = { kind: cpt.kind, commandedInputs: inp,
      resultAtZeroResistance: ropModel(cpt, bit, ground, inp, cleanEnv(ground)),
      basis: 'Cone-push speed is a survey operating parameter, not the SPT nominal/cutting rate' };
  }
  if (row.id === 'jet-grouting') {
    const stage = m.stages.find(s => s.liftMaxMh > 0);
    entry.withdrawalVariant = { stage: stage.id, liftMaxMh: stage.liftMaxMh,
      liftRateSourced: stage.liftRateSourced,
      cases: [0, stage.optWob, 1].map(wob => ({ command: wob,
        result: ropModel(m, bit, ground, { wob, rpm: stage.optRpm, flush: stage.optFlush },
          { ...env, stageLiftMaxMh: stage.liftMaxMh }) })),
      basis: 'Commanded monitor withdrawal m/h, separate from predrill cutting and completed column production' };
  }
  report.methods.push(entry);
}
const diagnosticGround = { id: 'synthetic-25MPa', name: 'NOT SOURCED equal-ground fixture',
  ucs: 25, abrasivity: 0.5, stability: 1, water: 0 };
for (const id of ['core', 'sonic', 'cable-tool', 'jet-grouting']) {
  const row = METHODS.find(r => r.id === id), m = methodOf(id);
  const loadout = defaultLoadoutFor(id, row.unlockLevel), bit = bitOf(loadout.bit, m);
  report.comparisons.push({ id, ground: diagnosticGround,
    cleanOptimal: evaluate(m, bit, diagnosticGround, optimalInputs(m, diagnosticGround, 0, bit), cleanEnv(diagnosticGround)) });
}
// Reproduce the authored full-cycle/cutting definition boundary using the real
// settlement API. This records current behavior, including the separately
// accounted cycle after the fix; it does not assert a historical defect.
const jumbo = METHODS.find(r => r.id === 'tunnel-jumbo');
const jumboBits = itemsForMethod(jumbo.id, { level: 100, slot: 'bit' })
  .sort((a, b) => (a.stats.ropMult || 1) - (b.stats.ropMult || 1));
const cycleContract = { id: 'rate-full-cycle-fixture', methodId: jumbo.id, regionId: 'nordic',
  metres: 10, targetDepth: 10, holes: 1, hardness: 0.5, abrasivity: 0.5, holeDia: 48,
  payout: 24000, deadlineHours: 100 };
const cycleSplit = estimateHoursBreakdown(jumbo.id, 10, 0.5, 1);
report.fullCycleToolingProbe = {
  basis: 'NOT SOURCED identical 10m contract fixture; nominal 0.5m/h is explicitly full cycle in production data',
  contract: cycleContract, split: cycleSplit,
  cases: [jumboBits[0], jumboBits.at(-1)].map(bit => {
    const loadout = { ...defaultLoadoutFor(jumbo.id, jumbo.unlockLevel), bit: bit.id };
    const result = settleRun(cycleContract, { loadout, rigId: jumbo.rigIds[0], includeSetup: false });
    finite(result.hours, `jumbo settlement ${bit.id}`);
    return { bit: bit.id, bitRopMultiplier: bit.stats.ropMult || 1, settledHours: result.hours };
  }),
  interpretation: 'The split and eligible-bit settlements above are measured current outputs. Compare drill, cycle and flat components with each settledHours value; this inventory does not infer a defect or guess a replacement cycle split.',
};
check(new Set(report.methods.map(m => m.id)).size === METHODS.length, 'all methods reported once');
for (const [name, hash] of Object.entries(report.sourceSha256)) {
  check(sha(name) === hash, `${name}: source remained stable throughout this probe`);
}
if (out) { mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, JSON.stringify(report, null, 2) + '\n'); }
console.log(`Rate provenance: ${report.methods.length} methods; ${report.assertions} coverage/finite/unit checks; no nominal=cap requirement.`);
console.table(report.methods.map(r => ({ method: r.id, nominal: r.nominalMh, cap: r.declaredCapMh,
  ground: r.ground.id, modelOptimal: +r.cleanModelOptimal.rop.toFixed(2),
  sampledMax: +r.sampledCleanMaximum.any.rop.toFixed(2),
  steady: r.runtime.steady ? +r.runtime.steady.meanMh.toFixed(2) : 'unavailable', phase: r.runtime.finalPhase })));
