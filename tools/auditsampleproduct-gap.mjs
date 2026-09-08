#!/usr/bin/env node
/** Read-only core/sonic product gap diagnostic. No forged completion, teleport,
 * tuning mutation, browser or GPU. Run: node tools/auditsampleproduct-gap.mjs
 * Expected to report the current gap; this is not a product acceptance gate.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { getMethod, RIGS, CERTS, defaultLoadoutFor } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';

const sourceFiles = ['src/core/contract.js', 'src/game/data.js', 'src/game/economy.js',
  'src/game/progression.js', 'src/sim/drilling.js', 'src/ui/screens/results.js'];
const hashes = () => Object.fromEntries(sourceFiles.map(p => [p,
  crypto.createHash('sha256').update(fs.readFileSync(new URL('../' + p, import.meta.url))).digest('hex')]));
const before = hashes(), results = [], warnings = [];
const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWarn = console.warn;
console.warn = (...args) => warnings.push(args.map(String).join(' '));
try {
  for (const [methodId, targetDepth, groundId] of [['core', 30.5, 'limestone'], ['sonic', 6.5, 'clay']]) {
    const memory = new Map();
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem: k => memory.get(k) ?? null,
      setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k),
    } });
    const state = createGameState(), bus = createBus();
    const progression = createProgression({ state, bus, rand: makeRandom(20260908), SCENES });
    let sim;
    try {
      await progression.init();
      const method = getMethod(methodId);
      state.player.level = 60; state.player.money = 1e8;
      state.player.certs = CERTS.map(c => c.id);
      state.unlocked.methods = [methodId]; state.unlocked.rigs = RIGS.map(r => r.id);
      state.garage.rigId = method.rigIds[0];
      state.garage.loadout = defaultLoadoutFor(methodId, 60);
      state.garage.owned = Object.values(state.garage.loadout).filter(Boolean);
      const contract = { id: `sample-gap-${methodId}`, title: 'Sample product audit fixture',
        methodId, regionId: 'nordic', applicationId: 'mineral-exploration', archetype: 'exploration-pad',
        targetDepth, holes: 1, metres: targetDepth, holeDia: method.nominalDia,
        payout: 10000, bonus: { time: 1000, quality: 1000 }, deadlineHours: 24,
        reputationReward: 10, requiredCerts: [], difficulty: 1,
        hardness: 0.2, abrasivity: 0.2, seed: 194,
        ground: [{ id: groundId, top: 0, bottom: 100 }], flushMedium: method.flushMedium,
      };
      assert.equal(progression.previewContract(contract).ok, true, `${methodId} readiness`);
      assert.equal(progression.acceptContract(contract).ok, true, `${methodId} acceptance`);
      const completions = [], connections = [], phases = new Set();
      bus.on(EVENTS.HOLE_COMPLETE, p => completions.push(p));
      bus.on(EVENTS.ROD_ADDED, p => connections.push(p));
      sim = createDrillSim({ state, bus, progression }); sim.init();
      assert.ok(sim.startHole(contract));
      const start = sim.getTelemetry();
      let frames = 0;
      for (; frames < 240000 && sim.active; frames++) {
        const t = sim.getTelemetry(); phases.add(t.phase);
        sim.setInput('feed', t.optimal.wob); sim.setInput('rpm', t.optimal.rpm);
        sim.setInput('flush', t.optimal.flush);
        if (t.rodAdd && !t.rodAdd.hit && t.rodAdd.t >= t.rodAdd.windowStart
          && t.rodAdd.t <= t.rodAdd.windowEnd) sim.pulse('rodStab');
        sim.update(1 / 60, state);
      }
      const end = sim.getTelemetry(), payload = completions[0];
      assert.equal(completions.length, 1, `${methodId} actual completion after ${frames} frames; ${end.phase}`);
      const settlement = progression.settlementForCompletion(payload);
      assert.ok(settlement, `${methodId} authoritative receipt`);
      results.push({ methodId, targetDepth, startProgramme: start.programme, endProgramme: end.programme,
        observedPhases: [...phases], frames, connections,
        completion: { depth: payload.depth, grade: payload.grade, timeSec: payload.timeSec,
          quality: payload.breakdown.quality, weights: payload.breakdown.weights,
          rods: payload.breakdown.rods, payloadKeys: Object.keys(payload) },
        settlement: { revenue: settlement.revenue, net: settlement.net, xp: settlement.xp,
          depth: settlement.depth, keys: Object.keys(settlement) },
        methodPromise: method.scoredOn,
      });
    } finally { sim?.dispose(); progression.dispose(); }
  }
} finally {
  console.warn = originalWarn;
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
  else delete globalThis.localStorage;
}
const after = hashes();
assert.deepEqual(after, before, 'Inspected production inputs remained unchanged during diagnostic');
console.log(JSON.stringify({ generatedAt: new Date().toISOString(), sourceHashes: before,
  sourceUnchanged: true, limits: 'Bounded CPU fixtures using optimal telemetry inputs and public update/actions. No UI, phone, adverse-operation or natural-play acceptance.',
  results, warnings }, null, 2));
