#!/usr/bin/env node
/** Actual control-dependent operating records, not material-quality estimates. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { getMethod, getItem, RIGS, CERTS, defaultLoadoutFor } from '../src/game/data.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { createSampleLedger, applySampleEvent, restoreSampleLedger, readSampleOperatingConditions } from '../src/sim/sample-ledger.js';
import { readSampleProduct, sampleOperatingRecord } from '../src/sim/sample-product.js';
import { sampleUnitCard } from '../src/ui/screens/site.js';

const { values } = parseArgs({ options: { report: { type: 'string' } } });
const reportPath = values.report === undefined
  ? fileURLToPath(new URL('../evidence/verification/latest/sample-conditions-author.json', import.meta.url))
  : resolve(values.report);
const files = ['src/game/data.js', 'src/game/equipment-support.js',
  'src/sim/sample-ledger.js', 'src/sim/sample-product.js', 'src/sim/drilling.js',
  'src/ui/screens/site.js', 'src/ui/screens/results.js', 'src/game/progression.js'];
const hashes = () => Object.fromEntries(files.map(p => [p, crypto.createHash('sha256')
  .update(fs.readFileSync(new URL('../' + p, import.meta.url))).digest('hex')]));
const before = hashes(), original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const tests = [], measurements = [];
const clone = x => JSON.parse(JSON.stringify(x));
const identity = { runId: 12, attemptId: 34 };
const config = { ...identity, methodId: 'core', targetDepthM: 3.25, barrelCapacityM: 1.5 };
const limits = { effectiveFlushMin: 0.45, heatMax: 0.85, torqueMax: 1 };
const observation = (elapsedSec = .25, more = {}) => ({ elapsedSec,
  effectiveFlush01: .2, heat01: .9, torque01: 1.1, limits, ...more });
const event = (sequence, type, fields) => ({ ...identity, sequence, type, ...fields });
function test(name, body) { try { body(); tests.push({ name, pass: true }); }
  catch (error) { tests.push({ name, pass: false, error: error.stack }); } }
async function testAsync(name, body) { try { await body(); tests.push({ name, pass: true }); }
  catch (error) { tests.push({ name, pass: false, error: error.stack }); } }
async function fixture(methodId, targetDepth, groundId) {
  const memory = new Map(); Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k),
  } });
  const state = createGameState(), bus = createBus(), ui = { gameplayPaused: false };
  const ctx = { state, bus, ui, rand: makeRandom(713), SCENES };
  const progression = ctx.progression = createProgression(ctx); await progression.init();
  const method = getMethod(methodId);
  state.player.level = 60; state.player.money = 1e8; state.player.certs = CERTS.map(c => c.id);
  state.unlocked.methods = [methodId]; state.unlocked.rigs = RIGS.map(r => r.id);
  state.garage.rigId = method.rigIds[0]; state.garage.loadout = defaultLoadoutFor(methodId, 60);
  state.garage.owned = Object.values(state.garage.loadout).filter(Boolean);
  // Authored NQ boundary tender: use the sourced 75.7 mm nominal bore already
  // recorded in data.js sampling metadata, matching the actual default crown.
  // Keep the real tender-fit guard active; the method-wide 96 mm is an HQ size.
  const holeDia = methodId === 'core' ? 75.7 : method.nominalDia;
  if (methodId === 'core') assert.equal(getItem(state.garage.loadout.bit).sampling.holeDiameterMm, holeDia);
  const contract = { id: `sample-conditions-${methodId}-${targetDepth}`, title: 'Conditions boundary fixture',
    methodId, regionId: 'nordic', applicationId: 'mineral-exploration', archetype: 'exploration-pad',
    targetDepth, holes: 1, metres: targetDepth, holeDia,
    payout: 10000, bonus: { time: 1000, quality: 1000 }, deadlineHours: 24, reputationReward: 10,
    requiredCerts: [], difficulty: 1, hardness: .2, abrasivity: .2, seed: 194,
    ground: [{ id: groundId, top: 0, bottom: 1000 }], flushMedium: method.flushMedium };
  assert.equal(progression.acceptContract(contract).ok, true);
  state.scene = SCENES.SITE;
  const completions = []; bus.on(EVENTS.HOLE_COMPLETE, p => completions.push(p));
  const sim = ctx.sim = createDrillSim(ctx); sim.init(); assert.ok(sim.startHole(contract));
  return { state, bus, ui, sim, progression, completions, memory, contract,
    close() { sim.dispose(); progression.dispose(); } };
}
function controls(f, adverse) {
  const t = f.sim.getTelemetry();
  f.sim.setInput('feed', adverse ? 1 : t.optimal.wob);
  f.sim.setInput('rpm', adverse ? 1 : t.optimal.rpm);
  f.sim.setInput('flush', adverse ? 0.05 : t.optimal.flush);
  if (t.rodAdd && !t.rodAdd.hit && t.rodAdd.t >= t.rodAdd.windowStart && t.rodAdd.t <= t.rodAdd.windowEnd) f.sim.pulse('rodStab');
  for (const a of t.actions) if (a.enabled && a.id.startsWith('sample')) assert.equal(f.sim.pulse(a.id).ok, true);
}
function totals(rows) {
  return rows.reduce((a, r) => {
    const c = r.operatingConditions; assert.ok(c);
    for (const key of ['cuttingSec', 'overheatSec', 'overtorqueSec']) a[key] += c[key];
    if (c.lowFlushSec !== null) a.lowFlushSec += c.lowFlushSec;
    return a;
  }, { cuttingSec: 0, lowFlushSec: 0, overheatSec: 0, overtorqueSec: 0 });
}
try {
  test('overlapping observed excursions are separate actual durations, never summed quality', () => {
    const initial = createSampleLedger(config), e = event(1, 'advance', { toDepthM: .5, observation: observation() });
    const next = applySampleEvent(initial, e).ledger, c = next.intervals[0].operatingConditions;
    assert.equal(c.cuttingSec, .25); assert.equal(c.lowFlushSec, .25); assert.equal(c.overheatSec, .25); assert.equal(c.overtorqueSec, .25);
    assert.ok(c.lowFlushSec + c.overheatSec + c.overtorqueSec > c.cuttingSec);
    assert.equal(Object.isFrozen(e.observation), false); assert.equal(Object.isFrozen(e.observation.limits), false);
    e.observation.heat01 = 0; assert.equal(next.lastEvent.observation.heat01, .9);
    for (const key of ['quality', 'recovery', 'TCR', 'RQD', 'score']) assert.equal(key in c, false);
  });
  test('absent legacy conditions remain unknown; mixed recording modes fail closed', () => {
    const legacy = applySampleEvent(createSampleLedger(config), event(1, 'advance', { toDepthM: .5 })).ledger;
    assert.equal(sampleOperatingRecord(legacy.intervals[0], 'core'), null);
    assert.equal(applySampleEvent(legacy, event(2, 'advance', { toDepthM: .6, observation: observation() })).reason, 'condition-recording-mode-mismatch');
    const observed = applySampleEvent(createSampleLedger(config), event(1, 'advance', { toDepthM: .5, observation: observation() })).ledger;
    assert.equal(applySampleEvent(observed, event(2, 'advance', { toDepthM: .6 })).reason, 'condition-recording-mode-mismatch');
  });
  test('newest replay survives nested JSON reordering without accruing time twice', () => {
    const e = event(1, 'advance', { toDepthM: .5, observation: observation() });
    const ledger = applySampleEvent(createSampleLedger(config), e).ledger, saved = clone(ledger);
    saved.lastEvent = Object.fromEntries(Object.entries(saved.lastEvent).reverse());
    saved.lastEvent.observation = Object.fromEntries(Object.entries(saved.lastEvent.observation).reverse());
    saved.lastEvent.observation.limits = Object.fromEntries(Object.entries(saved.lastEvent.observation.limits).reverse());
    const restored = restoreSampleLedger(saved, identity), replay = applySampleEvent(restored, e);
    assert.equal(replay.duplicate, true); assert.equal(replay.ledger, restored);
    assert.equal(applySampleEvent(restored, { ...e, observation: observation(.3) }).reason, 'sequence-conflict');
  });
  test('invalid observation/condition data cannot become safe zero readings', () => {
    const initial = createSampleLedger(config), good = event(1, 'advance', { toDepthM: .5, observation: observation() });
    for (const patch of [{ elapsedSec: 0 }, { elapsedSec: NaN }, { heat01: '0.9' }, { torque01: -1 }, { limits: { ...limits, heatMax: null } }]) {
      assert.equal(applySampleEvent(initial, { ...good, observation: { ...good.observation, ...patch } }).ok, false);
    }
    const ledger = applySampleEvent(initial, good).ledger;
    for (const mutate of [c => c.version = 2, c => c.overheatSec = .5, c => c.clock = 'field-seconds',
      c => c.lowFlushSec = null, c => c.cuttingSec = 0, c => c.recovery = 1]) {
      const saved = clone(ledger); mutate(saved.intervals[0].operatingConditions);
      assert.throws(() => restoreSampleLedger(saved, identity));
      assert.equal(readSampleOperatingConditions(saved.intervals[0].operatingConditions, 'core'), null);
    }
    assert.equal(applySampleEvent(ledger, event(2, 'advance', { toDepthM: .6,
      observation: observation(.1, { limits: { ...limits, heatMax: .7 } }) })).reason, 'condition-limits-changed');
  });
  test('sonic flow threshold stays inapplicable and torque above one remains observable', () => {
    const o = observation(.5, { limits: { ...limits, effectiveFlushMin: null } });
    const ledger = applySampleEvent(createSampleLedger({ ...config, methodId: 'sonic' }),
      event(1, 'advance', { toDepthM: .5, observation: o })).ledger;
    const c = ledger.intervals[0].operatingConditions;
    assert.equal(c.lowFlushSec, null); assert.equal(c.overtorqueSec, .5);
    assert.doesNotMatch(sampleOperatingRecord(ledger.intervals[0], 'sonic').text, /flush/i);
  });
  for (const method of ['core', 'sonic']) await testAsync(`${method}: actual controls affect recorded operations, not invented quality`, async () => {
    const outputs = [];
    for (const adverse of [false, true]) {
      const f = await fixture(method, method === 'core' ? 3.25 : 6.5, method === 'core' ? 'limestone' : 'marl');
      try {
        let steps = 0;
        for (; f.sim.active && steps < 120000; steps++) {
          // Use deliberately poor inputs for the initial part, then recover
          // through ordinary controls; no tuning, teleport or injected hazard.
          controls(f, adverse && f.sim.getTelemetry().timeSec < (method === 'core' ? 4 : 35));
          f.sim.update(1 / 120);
        }
        assert.equal(f.completions.length, 1, JSON.stringify({ method, adverse, steps,
          phase: f.sim.getTelemetry().phase, depth: f.sim.getTelemetry().depth }));
        const payload = f.completions[0], receipt = f.progression.settlementForCompletion(payload);
        assert.ok(receipt?.sampleProduct);
        const rows = receipt.sampleProduct.intervals, sum = totals(rows), t = f.sim.getTelemetry();
        assert.ok(Math.abs(sum.cuttingSec - t.drillSec) < 1e-8);
        assert.equal(payload.breakdown.quality, null); assert.equal(payload.breakdown.weights.quality, 0);
        assert.ok(rows.every(r => r.operatingConditions.limits.effectiveFlushMin === (method === 'core' ? .45 : null)));
        assert.equal(sampleUnitCard(t.programme).rows.at(-1)[1], 'Unmeasured');
        assert.equal(f.progression.save(), true);
        const saved = JSON.parse(f.memory.get(SAVE_KEY)).player.career.ledger[0];
        assert.deepEqual(saved.sampleProduct, clone(receipt.sampleProduct));
        assert.ok(readSampleProduct(saved.sampleProduct, { methodId: method, runId: saved.runId,
          attemptId: saved.attemptId, depth: saved.depth, capacityBasis: saved.sampleCapacityBasis }));
        const beforeReplay = clone(f.progression.serialise()); f.bus.emit(EVENTS.HOLE_COMPLETE, payload);
        assert.deepEqual(f.progression.serialise(), beforeReplay);
        const out = { method, adverse, steps, timeSec: t.timeSec, drillSec: t.drillSec, totals: sum,
          intervals: rows.length, net: receipt.net, grade: payload.grade,
          intervalRecords: rows.map(r => ({ fromM: r.fromM, toM: r.toM, operatingConditions: r.operatingConditions })) };
        outputs.push(out); measurements.push(out);
      } finally { f.close(); }
    }
    if (method === 'core') assert.ok(outputs[1].totals.lowFlushSec > outputs[0].totals.lowFlushSec);
    else assert.ok(outputs[1].totals.overheatSec > outputs[0].totals.overheatSec
      || outputs[1].totals.overtorqueSec > outputs[0].totals.overtorqueSec,
    JSON.stringify(outputs.map(o => ({ adverse: o.adverse, totals: o.totals }))));
  });
  await testAsync('pause and timed handling do not accrue cutting exposure', async () => {
    const f = await fixture('core', 3.25, 'limestone');
    try {
      while (f.sim.getTelemetry().depth < .3) { controls(f, false); f.sim.update(1 / 120); }
      const paused = clone(f.sim.getTelemetry().programme.intervals); f.ui.gameplayPaused = true;
      for (let i = 0; i < 120; i++) f.sim.update(.25);
      assert.deepEqual(f.sim.getTelemetry().programme.intervals, paused);
      f.ui.gameplayPaused = false;
      while (f.sim.getTelemetry().phase !== 'sample-wait') { controls(f, false); f.sim.update(1 / 120); }
      const row = f.sim.getTelemetry().programme.lastInterval;
      for (let i = 0; i < 120; i++) f.sim.update(1 / 120);
      assert.deepEqual(f.sim.getTelemetry().programme.lastInterval.operatingConditions, row.operatingConditions);
      assert.equal(f.sim.pulse('sampleRetrieve').ok, true);
      for (let i = 0; i < 600 && f.sim.getTelemetry().phase !== 'sample-wait'; i++) f.sim.update(1 / 120);
      assert.deepEqual(f.sim.getTelemetry().programme.lastInterval.operatingConditions, row.operatingConditions);
    } finally { f.close(); }
  });
} finally {
  if (original) Object.defineProperty(globalThis, 'localStorage', original); else delete globalThis.localStorage;
}
const after = hashes(), sourceUnchanged = JSON.stringify(before) === JSON.stringify(after);
test('production inputs unchanged during author checks', () => assert.equal(sourceUnchanged, true));
const report = { generatedAt: new Date().toISOString(), passed: tests.filter(t => t.pass).length,
  total: tests.length, sourceUnchanged, sourceHashes: before, tests, measurements,
  limits: 'Operating provenance only. Physics quality/recovery and browser/mobile visual acceptance remain open. No new grade or payout calculation.' };
fs.mkdirSync(dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
for (const t of tests) console.log(`${t.pass ? 'PASS' : 'FAIL'} ${t.name}${t.error ? '\n' + t.error : ''}`);
console.log(JSON.stringify({ passed: report.passed, total: report.total,
  measurements: measurements.map(({ method, adverse, totals, intervals }) => ({ method, adverse, totals, intervals })) }));
if (tests.some(t => !t.pass)) process.exitCode = 1;
