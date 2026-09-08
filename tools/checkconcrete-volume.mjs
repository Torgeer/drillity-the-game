/** Actual-module CPU acceptance for CFA return-volume integration.
 * node tools/checkconcrete-volume.mjs --json evidence/concrete-volume/author-after.json
 * --observe preserves pre-fix failures without requiring a failing exit status.
 * Geometry and funding below are synthetic test inputs, not sourced capacities.
 * The simulator is driven with public inputs/update only. debug.state is read
 * without mutation solely to retain precision discarded by display telemetry.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim, TUNING } from '../src/sim/drilling.js';
import { getMethod, RIGS, CERTS, defaultLoadoutFor, METHODS } from '../src/game/data.js';
import { materialsCostForRun } from '../src/game/economy.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const arg = name => process.argv[process.argv.indexOf(name) + 1];
const output = resolve(root, process.argv.includes('--json') ? arg('--json') : 'evidence/concrete-volume/author-after.json');
const sourceFiles = ['src/sim/drilling.js', 'src/game/economy.js', 'src/game/progression.js', 'src/game/data.js', 'tools/checkconcrete-volume.mjs'];
const hash = path => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
const report = { passed: false, generatedAt: new Date().toISOString(), command: process.argv.join(' '),
  fingerprints: Object.fromEntries(sourceFiles.map(path => [path, hash(path)])), cases: [], checks: [], failures: [],
  limitations: ['No financial concrete overconsumption consumer added: existing CFA material rates bundle concrete, cage and possibly casing without an authored component split.',
    'Synthetic test contracts and funded inventory; no physical capacity or market-price assertion.',
    'Public controls/update drive the real sim and progression. Read-only raw state verifies volume before two-decimal presentation rounding.',
    'Parked pump behaviour is observed, not assigned a new delivered-volume policy by this endpoint repair.'] };
function check(ok, label, detail = {}) { report.checks.push({ label, passed: !!ok, ...detail }); if (!ok) report.failures.push(label); }
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const near = (a, b, epsilon = 1e-9) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= epsilon;

async function fixture(methodId, holeDia, suffix, holes = 1) {
  const storage = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key),
  } });
  const state = createGameState(), bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(991) }); await progression.init();
  state.player.level = 60; state.player.money = 1e8; state.player.certs = CERTS.map(x => x.id);
  state.unlocked.methods = [methodId]; state.unlocked.rigs = RIGS.map(x => x.id);
  state.garage.rigId = 'cfa-rig'; state.garage.loadout = defaultLoadoutFor(methodId, 60);
  state.garage.owned = Object.values(state.garage.loadout).filter(Boolean);
  const targetDepth = 3.137;
  const contract = { id: `concrete-author-${methodId}-${suffix}`, methodId, regionId: 'nordic', archetype: 'urban-plot',
    applicationId: 'foundation-piling', targetDepth, holes, metres: targetDepth * holes, holeDia,
    payout: 10000 * holes, bonus: { time: 1000 * holes, quality: 1000 * holes }, deadlineHours: 24,
    requiredCerts: [], difficulty: 1, reputationReward: 10, hardness: .2, abrasivity: .2, seed: 4242,
    flushMedium: getMethod(methodId).flushMedium, ground: [{ id: 'clay', top: 0, bottom: 100 }] };
  assert.equal(progression.previewContract(contract).ok, true, JSON.stringify(progression.previewContract(contract)));
  assert.equal(progression.acceptContract(contract).ok, true);
  const completions = []; bus.on(EVENTS.HOLE_COMPLETE, payload => completions.push(payload));
  const sim = createDrillSim({ state, bus, progression }); sim.init(); sim.startHole(contract);
  return { state, bus, progression, sim, contract, completions, close() { sim.dispose(); progression.dispose(); } };
}
function tick(f, multiplier = 1, override = {}) {
  const t = f.sim.getTelemetry(), optimal = t.optimal;
  f.sim.setInput('feed', override.feed ?? optimal.wob);
  f.sim.setInput('rotation', override.rotation ?? optimal.rpm);
  f.sim.setInput('flush', override.flush ?? optimal.flush * (t.stage === 1 ? multiplier : 1));
  f.sim.update(1 / TUNING.sim.hz);
}
function until(f, predicate, multiplier = 1, override = {}) {
  for (let i = 0; i < 100000; i++) { if (predicate()) return i; tick(f, multiplier, override); }
  throw new Error(`Bounded run did not finish: ${f.contract.id} ${f.sim.getTelemetry().phase}`);
}
const saveState = f => JSON.stringify({ player: f.state.player, run: f.progression.run, save: f.progression.serialise() });

try {
  for (const methodId of ['cfa', 'cased-cfa']) {
    for (const diameterRatio of [1, .8]) {
      const pair = [];
      for (const multiplier of [1, 1.08]) {
        const dia = getMethod(methodId).nominalDia * diameterRatio;
        const f = await fixture(methodId, dia, `${diameterRatio}-${multiplier}`);
        try {
          until(f, () => f.sim.getTelemetry().stage === 1);
          check(f.completions.length === 0, `${methodId}/${diameterRatio}/${multiplier}: bore alone never settles`);
          const entry = structuredClone(f.sim.debug.state.prog.concrete);
          until(f, () => !f.sim.active, multiplier);
          assert.equal(f.completions.length, 1, 'one genuine completion required');
          const event = f.completions[0], settlement = f.progression.settlementForCompletion(event);
          assert.ok(settlement, 'progression must consume the genuine simulator event');
          const C = structuredClone(f.sim.debug.state.prog.concrete), passM = f.sim.debug.state.prog.passM;
          const expectedTheoreticalM3 = Math.PI * .25 * (dia / 1000) ** 2 * f.contract.targetDepth;
          const beforeReplay = saveState(f), replayWarnings = [], oldWarn = console.warn;
          try { console.warn = (...args) => replayWarnings.push(args.map(String).join(' ')); f.bus.emit(EVENTS.HOLE_COMPLETE, event); }
          finally { console.warn = oldWarn; }
          check(saveState(f) === beforeReplay, `${methodId}/${diameterRatio}/${multiplier}: genuine completion replay is inert`);
          const beforeIdle = JSON.stringify(C); for (let i = 0; i < 10; i++) f.sim.update(.1);
          check(JSON.stringify(f.sim.debug.state.prog.concrete) === beforeIdle, `${methodId}/${diameterRatio}/${multiplier}: no volume after completion`);
          check(near(C.theoreticalM3, expectedTheoreticalM3), `${methodId}/${diameterRatio}/${multiplier}: volume equals actual pile geometry`, { measured: C.theoreticalM3, expected: expectedTheoreticalM3, excessM3: C.theoreticalM3 - expectedTheoreticalM3 });
          check(near(passM, f.contract.targetDepth), `${methodId}/${diameterRatio}/${multiplier}: return finishes at target`);
          check(entry.placedM3 === 0 && entry.theoreticalM3 === 0, `${methodId}/${diameterRatio}/${multiplier}: no bore-pass concrete volume`);
          check(event.breakdown.quality.concretePlacedM3 === +C.placedM3.toFixed(2), `${methodId}/${diameterRatio}/${multiplier}: receipt matches measured volume rounding`);
          const result = { methodId, dia, multiplier, passM, expectedTheoreticalM3, concrete: C,
            grade: event.grade, quality: event.breakdown.quality, settlement, replayWarnings };
          report.cases.push(result); pair.push(result);
        } finally { f.close(); }
      }
      check(pair[1].concrete.placedM3 > pair[0].concrete.placedM3, `${methodId}/${diameterRatio}: equal-geometry pump choices consume different concrete`);
      check(near(pair[1].concrete.theoreticalM3, pair[0].concrete.theoreticalM3), `${methodId}/${diameterRatio}: pump choice does not change pile geometry`);
      // This asserts the known open accounting boundary, not a financial fix.
      check(pair[1].settlement.costs.materials === pair[0].settlement.costs.materials, `${methodId}/${diameterRatio}: bundled material cost remains unchanged (OPEN financial policy)`);
    }
    const f = await fixture(methodId, getMethod(methodId).nominalDia, 'partial');
    try {
      until(f, () => f.sim.getTelemetry().stage === 1); until(f, () => f.sim.debug.state.prog.passM > .5);
      const beforeAbort = structuredClone(f.sim.debug.state.prog.concrete), materialReceipts = f.completions.length;
      f.sim.abortHole('author-partial-test'); const player = saveState(f);
      for (let i = 0; i < 10; i++) f.sim.update(.1);
      check(f.completions.length === materialReceipts && materialReceipts === 0, `${methodId}: partial aborted lift does not become a completion`);
      check(saveState(f) === player && JSON.stringify(f.sim.debug.state.prog.concrete) === JSON.stringify(beforeAbort), `${methodId}: idle abort adds no volume or settlement`);
      report.cases.push({ methodId, kind: 'partial-abort', concrete: beforeAbort });
    } finally { f.close(); }
    const bad = await fixture(methodId, getMethod(methodId).nominalDia, 'malformed-inputs');
    try {
      until(bad, () => bad.sim.getTelemetry().stage === 1); until(bad, () => bad.sim.debug.state.prog.passM > .1);
      for (const value of [NaN, Infinity, -Infinity, -1, '1', {}, null]) {
        bad.sim.setInput('feed', value); bad.sim.setInput('rotation', value); bad.sim.setInput('flush', value);
        bad.sim.update(1 / TUNING.sim.hz);
        const C = bad.sim.debug.state.prog.concrete;
        check(Object.values(C).every(x => typeof x !== 'number' || Number.isFinite(x)), `${methodId}: malformed control remains finite (${String(value)})`);
      }
      report.cases.push({ methodId, kind: 'malformed-controls', concrete: structuredClone(bad.sim.debug.state.prog.concrete) });
    } finally { bad.close(); }
    const multi = await fixture(methodId, getMethod(methodId).nominalDia, 'two-holes', 2);
    try {
      until(multi, () => !multi.sim.active);
      const first = multi.completions[0], one = multi.progression.settlementForCompletion(first);
      assert.ok(one && !one.complete, 'first hole must settle while second remains');
      const firstVolume = structuredClone(multi.sim.debug.state.prog.concrete);
      multi.sim.startHole(multi.contract);
      const beforeReplay = saveState(multi); multi.bus.emit(EVENTS.HOLE_COMPLETE, first);
      check(saveState(multi) === beforeReplay, `${methodId}: previous hole cannot settle a new attempt`);
      check(multi.sim.debug.state.prog.concrete.placedM3 === 0, `${methodId}: new hole resets its concrete log`);
      until(multi, () => !multi.sim.active, 1.08);
      assert.equal(multi.completions.filter(x => x !== first).length, 1, 'second genuine completion exists');
      const second = multi.completions.at(-1), two = multi.progression.settlementForCompletion(second);
      assert.ok(two?.complete, 'second hole finishes contract');
      check(two.costs.materials === one.costs.materials, `${methodId}: one bundled materials charge per equivalent hole (OPEN financial policy)`);
      report.cases.push({ methodId, kind: 'two-holes', first: { concrete: firstVolume, settlement: one },
        second: { concrete: structuredClone(multi.sim.debug.state.prog.concrete), settlement: two } });
    } finally { multi.close(); }
  }
  report.legacyMaterials = METHODS.map(method => ({ methodId: method.id, nominalDia: method.nominalDia,
    result: materialsCostForRun(method.id, 3.137, method.nominalDia, {}, 'nordic') }));
  for (const path of sourceFiles) check(hash(path) === report.fingerprints[path], `source remained frozen: ${path}`);
  report.passed = report.failures.length === 0;
} catch (error) { report.failures.push(error.stack || String(error)); }
finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete globalThis.localStorage;
  mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ passed: report.passed, cases: report.cases.length, checks: report.checks.length, failures: report.failures, output }));
if (!report.passed && !process.argv.includes('--observe')) process.exitCode = 1;
