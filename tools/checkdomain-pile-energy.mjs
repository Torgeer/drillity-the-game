#!/usr/bin/env node
// Executes actual shipped data + simulation; candidate source trees are optional.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const sourceIndex = process.argv.indexOf('--source-root');
const sourceRoot = resolve(sourceIndex < 0 ? '.' : process.argv[sourceIndex + 1]);
const from = (file) => import(pathToFileURL(resolve(sourceRoot, 'src', file)));
const data = await from('game/data.js');
const { createDrillSim, methodOf, resolveMethod, hammerSetting } = await from('sim/drilling.js');
const { createGameState, createBus } = await from('core/contract.js');
const tests = [], measurements = [];
const test = (name, fn) => tests.push({ name, fn });
const close = (actual, expected, epsilon = 1e-8) => assert.ok(Math.abs(actual - expected) <= epsilon,
  `${actual} differs from ${expected} by more than ${epsilon}`);
const item = data.getItem('impact-hammer-9t');
const contract = { id: 'qa-pile-energy', methodId: 'driven-pile', flushMedium: 'none',
  targetDepth: 14, seed: 123, holeDia: 350 };
function run(hammer = item.id) {
  const state = createGameState(), bus = createBus();
  state.garage.loadout = { hammer, dolly: 'dolly-hardwood', install: 'precast-pile-350' };
  const sim = createDrillSim({ state, bus });
  sim.startHole(contract);
  return { state, sim };
}
function operate(sim, energy, rate, steps = 800) {
  sim.setInput('feed', energy); sim.setInput('rotation', rate); sim.setInput('flush', 0.5);
  return sim.debug.stepFixed(steps).programme;
}

test('catalogue envelope is the supported 9 t configuration, not the 16 t machine', () => {
  // Primary HHK7/9A datasheet p.2 extension9T: 9000kg,106kNm,1.2m,40–100bpm.
  // https://junttan.com/wp-content/uploads/2015/10/Junttan_HHK_7A_datasheet.pdf
  assert.deepEqual(item.impactHammer, { ramKg: 9000, strokeMaxM: 1.2,
    ratedEnergyKnm: 106, bpmRange: [40, 100] });
  const p = methodOf('driven-pile').pile;
  for (const [key, value] of Object.entries(item.impactHammer)) assert.deepEqual(p[key], value);
});
test('maximum command never exceeds physical drop or rounded catalogue energy', () => {
  const m = resolveMethod('driven-pile', { hammerId: item.id });
  const h = hammerSetting(m, 1, 0);
  close(h.kNm, 105.948); close(h.dropM, 1.2); assert.equal(h.bpm, 40);
  assert.ok(h.kNm < item.impactHammer.ratedEnergyKnm,
    'Keep computed potential and rounded catalogue rating distinct');
  for (const rate of [-1, 0, 0.5, 1, 2]) for (const energy of [-1, 0, 0.5, 1, 2]) {
    const s = hammerSetting(m, energy, rate);
    assert.ok(s.kNm <= 106 && s.dropM <= 1.2 + 1e-9);
    assert.ok(s.bpm >= 40 && s.bpm <= 100);
  }
});
test('real drive publishes 9 t energy/drop and records actual blows and penetration', () => {
  const { sim, state } = run();
  try {
    const p = operate(sim, 1, 0);
    assert.equal(p.hammerItemId, item.id); assert.equal(p.ramKg, 9000);
    assert.equal(p.energyKnm, 105.9); assert.equal(p.dropM, 1.2);
    assert.equal(p.blowRateBpm, 40); assert.ok(p.blows > 0 && p.toeDepthM > 0);
    assert.ok(p.blowLog.length > 0);
    sim.update(0); // production frame publishes state.drill after fixed substeps
    close(state.drill.hammerEnergyKnm, 105.948);
    measurements.push({ case: 'maximum-low-rate', energyKnm: p.energyKnm, dropM: p.dropM,
      bpm: p.blowRateBpm, blows: p.blows, toeDepthM: p.toeDepthM });
  } finally { sim.dispose(); }
});
test('real fast and low-energy commands stay within the fitted envelope', () => {
  for (const [energy, rate] of [[1, 1], [0, 1]]) {
    const { sim } = run();
    try {
      const p = operate(sim, energy, rate);
      assert.equal(p.blowRateBpm, 100);
      assert.ok(p.energyKnm <= 106 && p.dropM <= 1.2);
      if (energy === 1) { assert.equal(p.powerLimited, true); assert.equal(p.energyKnm, 70.5); }
      else assert.equal(p.energyKnm, 12); // retained NOT SOURCED gameplay minimum
      measurements.push({ case: `energy-${energy}-rate-${rate}`, energyKnm: p.energyKnm,
        dropM: p.dropM, bpm: p.blowRateBpm });
    } finally { sim.dispose(); }
  }
});
test('unrelated equipped hammer cannot alter the active drive; next start resolves afresh', () => {
  const { sim, state } = run();
  try {
    const snapshot = structuredClone(sim.debug.state.m.pile);
    state.garage.loadout.hammer = 'dth-hammer-4';
    assert.deepEqual(sim.debug.state.m.pile, snapshot);
    sim.abortHole('qa'); state.garage.loadout.hammer = item.id;
    sim.startHole(contract);
    assert.equal(sim.getTelemetry().programme.hammerItemId, item.id);
    assert.notEqual(sim.debug.state.m, methodOf('driven-pile'), 'Fitted profile resolved per run');
  } finally { sim.dispose(); }
});
test('missing hammer retains explicit 9 t default; vibro refuses unsupported impact start', () => {
  const { sim } = run(null);
  try {
    const p = sim.getTelemetry().programme;
    assert.equal(p.hammerItemId, item.id); assert.equal(p.ramKg, 9000);
  } finally { sim.dispose(); }
  const state = createGameState();
  state.garage.loadout = { hammer: 'vibro-hammer-1500' };
  const unsupported = createDrillSim({ state, bus: createBus() });
  try {
    assert.throws(() => unsupported.startHole(contract), (error) =>
      error.code === 'unsupported-piling-hammer' && error.itemId === 'vibro-hammer-1500');
    assert.equal(unsupported.active, false);
    measurements.push({ containment: 'vibro impact start refused', fitted: 'vibro-hammer-1500' });
  } finally { unsupported.dispose(); }
});
let failed = 0;
for (const { name, fn } of tests) {
  try { fn(); console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}\n${error.stack}`); }
}
console.log(JSON.stringify({ sourceRoot, passed: tests.length - failed, failed, measurements }, null, 2));
if (failed) process.exitCode = 1;
