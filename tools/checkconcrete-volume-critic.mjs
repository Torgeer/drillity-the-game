#!/usr/bin/env node
/** Independent concrete quantity boundary gate. Real accepted attempts and public
 * controls only; debug.state is READ ONLY to avoid hiding errors by UI rounding.
 * Targets/diameter multipliers are synthetic software boundary fixtures, not
 * physical prescriptions. No pump price or concrete/cage split is invented.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { getMethod, RIGS, CERTS, METHODS, defaultLoadoutFor } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { materialsCostForRun, settleRun } from '../src/game/economy.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const bufferHash = value => crypto.createHash('sha256').update(value).digest('hex');
// This committed source matches the original frozen September 8 audit snapshot
// after CRLF normalization. Pin both the full revision and Git blob bytes: the
// gate needs no untracked sibling worktree or machine-specific directory.
// A shallow clone must contain this historical commit to run the comparison.
const historicalRevision = '859fde2023e531d44e5ff334355e4d24e4c4d92c';
const historicalHashes = {
  'src/game/economy.js': '4673e38601f65284e693ba8531c5e563aa4659606ddf1eb61a266a9fa11e3026',
  'src/game/data.js': '899f9d285c4d157df7876916a84f7b640116c14092bdf7dff79ac5cea7d8be7c',
  'src/game/equipment-support.js': 'a1b908fbaf6ee8b1ea2b00014c65fe3f4de3d2efc882581acb2d83bec6d3aee9',
  'src/core/contract.js': 'a374211146b86c5dbc5ea88eb28a49e0505805fa486d585a1531e810414549b5',
};
async function loadHistoricalEconomy() {
  const temporaryParent = path.resolve(os.tmpdir());
  const temporary = fs.mkdtempSync(path.join(temporaryParent, 'drillity-concrete-critic-'));
  try {
    assert.equal(execFileSync('git', ['rev-parse', `${historicalRevision}^{commit}`], { cwd: root, encoding: 'utf8' }).trim(), historicalRevision);
    fs.writeFileSync(path.join(temporary, 'package.json'), '{"type":"module"}\n');
    for (const [relative, expected] of Object.entries(historicalHashes)) {
      const content = execFileSync('git', ['show', `${historicalRevision}:${relative}`], { cwd: root, maxBuffer: 4 * 1024 * 1024 });
      assert.equal(bufferHash(content), expected, `Pinned historical source matches: ${relative}`);
      const destination = path.join(temporary, relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, content);
    }
    return await import(pathToFileURL(path.join(temporary, 'src/game/economy.js')));
  } finally {
    // Delete only the exact temporary directory created above. Verify the final
    // absolute target and parent before this recursive filesystem operation.
    assert.equal(path.dirname(path.resolve(temporary)), temporaryParent);
    assert.ok(path.basename(temporary).startsWith('drillity-concrete-critic-'));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
const oldEconomy = await loadHistoricalEconomy();
const sourcePaths = ['src/sim/drilling.js', 'src/game/economy.js', 'src/game/progression.js', 'src/game/data.js'];
const hashes = () => Object.fromEntries(sourcePaths.map(p => [p, hash(path.join(root, p))]));
const beforeHashes = hashes(), results = [], measurements = [], warnings = [];
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWarn = console.warn;
console.warn = (...args) => warnings.push(args.map(String).join(' '));
let ordinal = 0;
const H = 1 / 120;
async function fixture(methodId = 'cfa', { target = 3.137, diaFactor = 1, holes = 1 } = {}) {
  const storage = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,String(v)), removeItem: k => storage.delete(k),
  } });
  const state = createGameState(), bus = createBus(), ui = { gameplayPaused: false };
  const progression = createProgression({ state, bus, rand: makeRandom(20260908), SCENES });
  await progression.init();
  state.player.level = 60; state.player.money = 1e8; state.player.certs = CERTS.map(x => x.id);
  state.unlocked.methods = [methodId]; state.unlocked.rigs = RIGS.map(x => x.id);
  const m = getMethod(methodId);
  state.garage.rigId = m.rigIds[0]; state.garage.loadout = defaultLoadoutFor(methodId, 60);
  state.garage.owned = Object.values(state.garage.loadout).filter(Boolean);
  const contract = { id: `critic-concrete-${++ordinal}`, title: 'Synthetic quantity boundary',
    methodId, regionId: 'nordic', applicationId: 'foundation-piling', archetype: 'urban-plot',
    targetDepth: target, holes, metres: target * holes, holeDia: m.nominalDia * diaFactor,
    payout: 10000, bonus: { time: 1000, quality: 1000 }, deadlineHours: 24,
    reputationReward: 10, requiredCerts: [], difficulty: 1, hardness: .2, abrasivity: .2,
    seed: 194, ground: [{ id: 'clay', top: 0, bottom: 100 }], flushMedium: m.flushMedium };
  const ready = progression.previewContract(contract); assert.equal(ready.ok, true, JSON.stringify(ready));
  assert.equal(progression.acceptContract(contract).ok, true);
  const events = []; bus.on(EVENTS.HOLE_COMPLETE, p => events.push(p));
  const sim = createDrillSim({ state, bus, progression, ui }); sim.init();
  assert.ok(sim.startHole(contract));
  return { state, bus, progression, ui, sim, contract, events, storage,
    dispose() { sim.dispose(); progression.dispose(); } };
}
function tick(c, n = 1) { for (let i = 0; i < n; i++) c.sim.update(H); }
function controls(c, { feed, rotation, flush }) {
  c.sim.setInput('feed', feed); c.sim.setInput('rotation', rotation); c.sim.setInput('flush', flush);
}
function optimal(c) { const p = c.sim.getTelemetry().optimal; controls(c, { feed: p.wob, rotation: p.rpm, flush: p.flush }); }
function until(c, condition, limit = 12000, policy = optimal) {
  for (let i = 0; i < limit; i++) { if (condition()) return; policy?.(c); tick(c); }
  throw new Error(`Bounded condition missed: ${c.sim.getTelemetry().phase}`);
}
function reverse(c) { until(c, () => c.sim.getTelemetry().stageReverse); }
function close(actual, expected, tolerance, message) { assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected} (+/- ${tolerance})`); }
async function group(name, fn) {
  const fixtures = [];
  try { await fn(async (...args) => { const c = await fixture(...args); fixtures.push(c); return c; }); results.push({ name, pass: true }); }
  catch (error) { results.push({ name, pass: false, error: error.stack }); }
  finally { for (const c of fixtures) c.dispose(); }
}

try {
  for (const methodId of ['cfa', 'cased-cfa']) {
    for (const diaFactor of [1, .8]) await group(`${methodId} ${diaFactor} diameter: final partial lift equals exact cylinder`, async fresh => {
      const c = await fresh(methodId, { diaFactor }); reverse(c);
      assert.equal(c.events.length, 0, 'Pilot reaching target cannot complete a pile');
      until(c, () => !c.sim.active);
      const s = c.sim.debug.state, C = s.prog.concrete;
      const expected = Math.PI / 4 * (c.contract.holeDia / 1000) ** 2 * c.contract.targetDepth;
      const payload = c.events[0];
      measurements.push({ name: `${methodId}-${diaFactor}-endpoint`, actual: C.theoreticalM3, expected, passM: s.prog.passM, target: s.target, placedM3: C.placedM3, public: payload?.breakdown?.quality });
      close(s.prog.passM, c.contract.targetDepth, 1e-12, 'Actual withdrawal endpoint');
      assert.equal(c.events.length, 1, 'Exactly one physical completion');
      close(C.theoreticalM3, expected, 1e-10, 'Theoretical volume cannot include the overshooting final increment');
      assert.equal(payload.breakdown.quality.theoreticalM3, +expected.toFixed(2));
      assert.equal(payload.breakdown.quality.concretePlacedM3, +C.placedM3.toFixed(2));
    });
    await group(`${methodId}: equal geometry, distinct supply and unchanged bundled settlement`, async fresh => {
      const runs = [];
      for (const flush of [.45, .9]) {
        const c = await fresh(methodId, { diaFactor: .8 }); reverse(c);
        controls(c, { feed: .16, rotation: .1, flush });
        until(c, () => !c.sim.active, 15000, null);
        const C = c.sim.debug.state.prog.concrete, p = c.events[0];
        const receipt = c.progression.settlementForCompletion(p); assert.ok(receipt);
        const expected = materialsCostForRun(methodId, p.depth, c.contract.holeDia, c.state.player.skills, c.contract.regionId);
        assert.equal(receipt.costs.materials, expected.total, 'Existing concrete+cage bundle charged once');
        const before = structuredClone(c.progression.serialise()); c.bus.emit(EVENTS.HOLE_COMPLETE, p);
        assert.deepEqual(c.progression.serialise(), before, 'Replay cannot charge or reward twice');
        runs.push({ placed: C.placedM3, theoretical: C.theoreticalM3, materials: receipt.costs.materials });
      }
      measurements.push({ name: `${methodId}-consumption`, runs });
      close(runs[0].theoretical, runs[1].theoretical, 1e-10, 'Equal geometry regardless of surplus pumping');
      assert.ok(runs[1].placed > runs[0].placed * 1.7, 'Distinct actual pump delivery must remain distinguishable');
      assert.equal(runs[0].materials, runs[1].materials, 'No unsupported concrete price split introduced');
    });
    await group(`${methodId}: partial log freezes across gameplay pause`, async fresh => {
      const c = await fresh(methodId); reverse(c);
      controls(c, { feed: .2, rotation: .1, flush: .8 }); tick(c, 100);
      const partial = structuredClone(c.sim.debug.state.prog.concrete), pass = c.sim.debug.state.prog.passM;
      assert.ok(pass > 0 && pass < c.contract.targetDepth); assert.equal(c.events.length, 0);
      c.ui.gameplayPaused = true; tick(c, 1200);
      assert.deepEqual(c.sim.debug.state.prog.concrete, partial); assert.equal(c.sim.debug.state.prog.passM, pass);
      c.ui.gameplayPaused = false; tick(c);
      assert.ok(c.sim.debug.state.prog.passM > pass);
    });
    await group(`${methodId}: parked controls observation is finite and cannot invent pile length`, async fresh => {
      const c = await fresh(methodId); reverse(c);
      controls(c, { feed: 0, rotation: 0, flush: 1 }); tick(c, 600);
      const start = structuredClone(c.sim.debug.state.prog.concrete), passStart = c.sim.debug.state.prog.passM;
      tick(c, 600);
      const end = c.sim.debug.state.prog.concrete, passEnd = c.sim.debug.state.prog.passM;
      measurements.push({ name: `${methodId}-parked-last-five-seconds`, passStart, passEnd, placedDelta: end.placedM3-start.placedM3, reportedSupplyM3h: c.sim.getTelemetry().programme.concrete.supplyM3h, actFeed: c.sim.debug.state.act.wob,
        interpretation: 'Supply telemetry is not independently established as motion-independent delivered flow; no pricedelta is inferred.' });
      assert.ok(Number.isFinite(end.placedM3) && end.placedM3 >= start.placedM3);
      close(passEnd, passStart, 1e-10, 'Damped stopped feed cannot create appreciable pile length');
      assert.equal(c.events.length, 0);
    });
    await group(`${methodId}: last tick clips delivered concrete to the actual remaining interval`, async fresh => {
      const c = await fresh(methodId, { target: 1.013 }); reverse(c);
      controls(c, { feed: .85, rotation: .1, flush: .9 });
      let previous;
      for (let i = 0; i < 5000 && c.sim.active; i++) {
        const s = c.sim.debug.state;
        previous = { pass: s.prog.passM, placed: s.prog.concrete.placedM3, theoretical: s.prog.concrete.theoreticalM3 };
        tick(c);
      }
      assert.equal(c.sim.active, false);
      const s = c.sim.debug.state, C = s.prog.concrete;
      const remaining = c.contract.targetDepth - previous.pass;
      const rate = s.act.wob * s.m.stages[1].liftMaxMh;
      const expectedDeliveredIncrement = C.supplyM3h * remaining / rate;
      close(C.placedM3 - previous.placed, expectedDeliveredIncrement, 1e-12, 'Final pump increment uses only the remaining interval');
      const area = Math.PI / 4 * (c.contract.holeDia / 1000) ** 2;
      close(C.theoreticalM3 - previous.theoretical, area * remaining, 1e-12, 'Final geometry increment is remaining length times area');
      measurements.push({ name: `${methodId}-last-tick`, remaining, recordedDeliveredIncrement: C.placedM3-previous.placed, expectedDeliveredIncrement,
        basis: 'Conservation within the EXISTING distance-sampled pump model; authored lift cap is read from runtime, not asserted as sourced.' });
      const finished = structuredClone(C), beforeSave = structuredClone(c.progression.serialise()); tick(c, 1200);
      assert.deepEqual(c.sim.debug.state.prog.concrete, finished, 'Idle completion cannot accrue concrete');
      assert.deepEqual(c.progression.serialise(), beforeSave, 'Idle completion cannot charge again');
    });
    await group(`${methodId}: malformed and zero controls preserve finite partial quantities, abort never settles`, async fresh => {
      const c = await fresh(methodId); reverse(c);
      for (const value of [0, -1, NaN, Infinity, -Infinity, undefined, null, '1', {}]) {
        controls(c, { feed: value, rotation: value, flush: value }); tick(c);
        const C = c.sim.debug.state.prog.concrete;
        for (const key of ['placedM3', 'theoreticalM3', 'supplyM3h', 'demandM3h', 'ratioSum', 'neckM']) {
          assert.ok(Number.isFinite(C[key]) && C[key] >= 0, `${key} finite and nonnegative after ${String(value)}`);
        }
      }
      const C = structuredClone(c.sim.debug.state.prog.concrete), pass = c.sim.debug.state.prog.passM;
      assert.ok(pass > 0 && pass < c.contract.targetDepth);
      c.sim.abortHole('independent-partial-volume');
      const player = structuredClone(c.state.player); tick(c, 1200);
      assert.equal(c.events.length, 0, 'Partial abort is not a finished pile');
      assert.deepEqual(c.sim.debug.state.prog.concrete, C, 'Partial log does not grow after abort');
      assert.deepEqual(c.state.player, player, 'Aborted idle state cannot charge material or give rewards');
    });
  }
  await group('Legacy materials and settlement are unchanged across geometry, partial completion and malformed extra telemetry', async () => {
    // Other reviewed work may change rescue factories or core-tender guards in
    // these modules. Protect the actual charging functions exactly, then their
    // behavior across all methods and the genuine CFA receipt/replay path.
    const sourceLF = fn => fn.toString().replaceAll('\r\n', '\n');
    assert.equal(sourceLF(materialsCostForRun), sourceLF(oldEconomy.materialsCostForRun), 'Material charging function remains unchanged');
    assert.equal(sourceLF(settleRun), sourceLF(oldEconomy.settleRun), 'Settlement charging function remains unchanged');
    const values = [0, -1, NaN, 1, 3.137, 12];
    for (const m of METHODS) for (const metres of values) for (const diaFactor of [.5, 1, 2]) {
      assert.deepEqual(materialsCostForRun(m.id, metres, m.nominalDia * diaFactor, {}, 'nordic'), oldEconomy.materialsCostForRun(m.id, metres, m.nominalDia * diaFactor, {}, 'nordic'));
    }
    const contract = { id: 'critic-policy', methodId: 'cfa', regionId: 'nordic', metres: 24, targetDepth: 12, holes: 2,
      holeDia: getMethod('cfa').nominalDia, hardness: .2, abrasivity: .2, payout: 10000, bonus: {time:100,quality:100}, deadlineHours:24 };
    for (const holesCompleted of [0, .25, 1, 2]) for (const volume of [undefined, 0, -1, NaN, Infinity, 1, 1000]) {
      const p = { holesCompleted, rigId: 'cfa-rig', loadout: defaultLoadoutFor('cfa',60), concretePlacedM3: volume,
        concrete: { placedM3: volume, theoreticalM3: volume }, breakdown: { quality: { concretePlacedM3: volume } } };
      assert.deepEqual(settleRun(contract,p), oldEconomy.settleRun(contract,p));
    }
    measurements.push({ name: 'Unchanged economy policy', materialsCases: METHODS.length * values.length * 3, settlementCases: 28,
      boundary: 'Extra actual-volume telemetry remains ignored. NaN general metre inputs retain baseline behavior; this gate does not claim they are sanitized.' });
  });
} finally {
  console.warn = originalWarn;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete globalThis.localStorage;
}
const afterHashes = hashes();
results.push({ name: 'Source hashes stable during independent execution', pass: JSON.stringify(beforeHashes) === JSON.stringify(afterHashes) });
const report = { createdAt: new Date().toISOString(), command: process.argv.join(' '), historicalRevision, historicalHashes, sourceHashes: beforeHashes, afterHashes, results, measurements, warnings,
  scope: 'CFA/cased-CFA quantity repair only. No sourced ready-mix unit price or cage/casing split exists in the tested path; actual-volume charging remains open.' };
const outAt = process.argv.indexOf('--out');
const out = path.resolve(root, outAt >= 0 ? process.argv[outAt+1] : 'research/concrete-volume-critic-2026-09-08.json');
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(report,null,2)+'\n');
for (const row of results) console.log(`${row.pass ? 'PASS' : 'FAIL'} ${row.name}${row.error ? '\n'+row.error : ''}`);
console.log(`${results.filter(r=>r.pass).length}/${results.length} PASS; ${out}`);
if (results.some(r=>!r.pass)) process.exitCode = 1;
