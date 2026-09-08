#!/usr/bin/env node
/** Real public sampling gameplay, receipts and restart-on-reload policy.
 * Short contracts below catalogue ranges are boundary fixtures, not tender data.
 * No renderer, teleport, injected success or altered physics tuning.
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { getMethod, RIGS, CERTS, defaultLoadoutFor, makeContract } from '../src/game/data.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { summariseSampleLedger } from '../src/sim/sample-ledger.js';
import { readSampleProduct } from '../src/sim/sample-product.js';
import { sampleStatus, sampleUnitCard } from '../src/ui/screens/site.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
let passed = 0;
const reports = [];
const storage = new Map();
const store = { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k) };
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
const clone = x => JSON.parse(JSON.stringify(x));
async function fixture(methodId, targetDepth, saved = false, generated = null) {
  if (!saved) storage.clear();
  const state = createGameState(), bus = createBus();
  const ctx = { state, bus, rand: makeRandom(713), SCENES };
  const progression = ctx.progression = createProgression(ctx);
  await progression.init();
  const method = getMethod(methodId);
  if (!saved) {
    state.player.level = 60; state.player.money = 1e8; state.player.certs = CERTS.map(c => c.id);
    state.unlocked.methods = [methodId]; state.unlocked.rigs = RIGS.map(r => r.id);
    state.garage.rigId = method.rigIds[0]; state.garage.loadout = defaultLoadoutFor(methodId, 60);
    state.garage.owned = Object.values(state.garage.loadout).filter(Boolean);
  }
  const contract = saved ? state.contract : generated || { id: `sample-author-${methodId}-${targetDepth}`,
    title: 'Boundary fixture', methodId, regionId: 'nordic', applicationId: 'mineral-exploration',
    archetype: 'exploration-pad', targetDepth, holes: 1, metres: targetDepth, holeDia: method.nominalDia,
    payout: 10000, bonus: { time: 1000, quality: 1000 }, deadlineHours: 24, reputationReward: 10,
    requiredCerts: [], difficulty: 1, hardness: .2, abrasivity: .2, seed: 194,
    ground: [{ id: methodId === 'core' ? 'limestone' : 'clay', top: 0, bottom: 1000 }], flushMedium: method.flushMedium };
  if (!saved) assert.equal(progression.acceptContract(contract).ok, true, JSON.stringify(progression.previewContract(contract)));
  state.scene = SCENES.SITE;
  const completions = [], rods = [];
  bus.on(EVENTS.HOLE_COMPLETE, event => completions.push(event));
  bus.on(EVENTS.ROD_ADDED, event => rods.push(event));
  const sim = ctx.sim = createDrillSim(ctx); sim.init(); sim.startHole(contract);
  return { state, bus, sim, progression, contract, completions, rods,
    close() { sim.dispose(); progression.dispose(); } };
}
function tick(f, act = true) {
  const t = f.sim.getTelemetry();
  f.sim.setInput('feed', t.optimal.wob); f.sim.setInput('rpm', t.optimal.rpm); f.sim.setInput('flush', t.optimal.flush);
  if (t.rodAdd && !t.rodAdd.hit && t.rodAdd.t >= t.rodAdd.windowStart && t.rodAdd.t <= t.rodAdd.windowEnd) f.sim.pulse('rodStab');
  if (act) for (const a of t.actions) if (a.enabled && a.id.startsWith('sample')) assert.equal(f.sim.pulse(a.id).ok, true);
  f.sim.update(1 / 60);
}
function until(f, predicate, act = true, limit = 240000) {
  for (let i = 0; i < limit; i++) { if (predicate(f.sim.getTelemetry())) return; tick(f, act); }
  throw new Error(`Sampling timeout: ${JSON.stringify(f.sim.getTelemetry().programme)}`);
}
try {
  for (const method of ['core', 'sonic']) for (const depth of [1, 3, 3.25, 6.5]) {
    const f = await fixture(method, depth);
    try {
      const capacity = f.sim.getTelemetry().programme.barrelCapacityM;
      until(f, t => !t.active);
      assert.equal(f.completions.length, 1);
      const payload = f.completions[0], receipt = f.progression.settlementForCompletion(payload);
      const basis = method === 'core' ? 'inner-tube-length' : 'gameplay-run-limit';
      assert.ok(receipt?.sampleProduct);
      assert.equal(payload.sampleCapacityBasis, basis);
      assert.equal(receipt.sampleCapacityBasis, basis);
      assert.deepEqual(receipt.sampleProduct, payload.sampleProduct);
      assert.equal(summariseSampleLedger(receipt.sampleProduct).handledIntervalM, depth);
      assert.equal(receipt.sampleProduct.intervals.length, Math.ceil(depth / capacity));
      assert.equal(f.rods.length, Math.max(0, Math.ceil(depth / 3) - 1));
      assert.ok(f.rods.every(r => r.kind === 'rod'));
      assert.equal(payload.breakdown.quality, null, 'No invented material quality score');
      assert.equal(payload.breakdown.weights.quality, 0);
      assert.equal(f.progression.save(), true);
      const saved = JSON.parse(storage.get(SAVE_KEY)).player.career.ledger[0];
      assert.deepEqual(saved.sampleProduct, clone(receipt.sampleProduct));
      assert.equal(saved.sampleCapacityBasis, basis);
      const expected = { methodId: method, runId: saved.runId, attemptId: saved.attemptId, depth, capacityBasis: basis };
      assert.ok(readSampleProduct(saved.sampleProduct, expected));
      assert.equal(readSampleProduct(saved.sampleProduct, { ...expected,
        capacityBasis: method === 'core' ? 'gameplay-run-limit' : 'inner-tube-length' }), null);
      const p = f.sim.getTelemetry().programme;
      assert.equal(p.capacityBasis, basis); assert.equal(p.summary.capacityBasis, basis);
      assert.equal(sampleUnitCard(p).rows[2][0], method === 'core' ? 'Inner tube capacity' : 'Sampling run limit');
      assert.equal(sampleUnitCard(p).rows.at(-1)[1], 'Unmeasured');
      assert.equal(sampleStatus(p)[0], 'Logged');
      reports.push({ method, depth, intervals: p.intervals.length, rods: f.rods.length, grade: payload.grade, timeSec: payload.timeSec });
      passed++;
    } finally { f.close(); }
  }
  for (const method of ['core', 'sonic']) {
    let f = await fixture(method, 6.5);
    try {
      until(f, t => t.programme.summary.handledIntervalM > 0);
      const previous = f.sim.getTelemetry();
      assert.ok(previous.depth > 0); assert.equal(f.progression.save(), true);
      f.close(); f = await fixture(method, 6.5, true);
      const resumed = f.sim.getTelemetry();
      assert.equal(resumed.depth, 0);
      assert.equal(resumed.programme.intervals.length, 0);
      assert.notEqual(resumed.attemptId, previous.attemptId);
      until(f, t => !t.active);
      assert.equal(f.completions.length, 1);
      passed++;
    } finally { f.close(); }
  }
  // Keep generated tenders byte-for-byte: no shortened depth, fake payout,
  // rewritten ground, forced completion or one-hole mutation of a campaign.
  for (const [method, level] of [['core', 18], ['sonic', 42]]) {
    const contract = makeContract('nordic', level, makeRandom(857));
    assert.equal(contract.methodId, method);
    const before = clone(contract), f = await fixture(method, contract.targetDepth, false, contract);
    try {
      until(f, t => !t.active);
      assert.deepEqual(contract, before);
      assert.equal(f.completions.length, 1);
      const receipt = f.progression.settlementForCompletion(f.completions[0]);
      assert.equal(receipt.sampleProduct.drilledDepthM, contract.targetDepth);
      reports.push({ method, generated: true, contractId: contract.id, targetDepth: contract.targetDepth,
        holesInTender: contract.holes, completedHoles: 1, intervals: receipt.sampleProduct.intervals.length });
      passed++;
    } finally { f.close(); }
  }
  console.log(JSON.stringify({ passed, reports, limits: 'CPU public gameplay and factual UI helpers; browser/mobile and material quality economics remain unverified.' }, null, 2));
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete globalThis.localStorage;
}
