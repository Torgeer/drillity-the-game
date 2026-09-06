#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createGameState, createBus, EVENTS } from '../src/core/contract.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { getItem } from '../src/game/data.js';

function cycle(installId, afterStart) {
  const state = createGameState(), bus = createBus(), completions = [];
  state.garage.loadout = { bit: 'bolt-bit-38', install: installId };
  state.garage.condition = { 'bolt-bit-38': 1 };
  bus.on(EVENTS.HOLE_COMPLETE, (event) => completions.push(structuredClone(event)));
  const sim = createDrillSim({ state, bus, geology: { getDrillabilityAt: () => ({
    id: 'granite', ucs: 100, stability: 1, abrasivity: 0, water: 0, top: 0, bottom: 100,
  }) } });
  const contract = { id: 'length-cycle', methodId: 'rockbolt', targetDepth: 1, seed: 410, flushMedium: 'water' };
  sim.startHole(contract);
  const start = structuredClone(sim.getTelemetry());
  afterStart?.(state);
  const entries = [], phases = new Set();
  let previousPhase = 'drilling';
  for (let i = 0; i < 120 * 120 && sim.active; i++) {
    const t = sim.getTelemetry(), stage = t.programme?.installStage;
    phases.add(stage);
    sim.setInput('feed', 0.38);
    sim.setInput('rotation', stage === 'gel' || stage === 'hold' ? 0 : 0.8);
    sim.setInput('flush', 0.66);
    sim.debug.stepFixed(1);
    const next = sim.getTelemetry();
    if (next.phase === 'bolt-install' && previousPhase !== 'bolt-install') entries.push(next.programme.intoHoleM);
    previousPhase = next.phase;
  }
  assert.equal(sim.active, false, 'Actual programme completes without teleports/internal state writes');
  assert.equal(completions.length, 1, 'Exactly one real completion');
  const records = structuredClone(sim.debug.state.prog.installs);
  assert.equal(records.length, 3, 'Full three-bolt pattern completed');
  return { state, sim, contract, start, entries, records, phases, completion: completions[0] };
}

const short = cycle('friction-bolt-39'), long = cycle('friction-bolt-46');
console.log(JSON.stringify({ short: { bolt: short.start.programme.boltLengthM, target: short.start.programme.holeTargetM, entries: short.entries },
  long: { bolt: long.start.programme.boltLengthM, target: long.start.programme.holeTargetM, entries: long.entries } }));
if (process.argv.includes('--measure-only')) { short.sim.dispose(); long.sim.dispose(); process.exit(0); }
assert.equal(short.start.programme.boltLengthM, 2.4);
assert.equal(long.start.programme.boltLengthM, 3, 'Fitted 46 mm tube has the verified 3 m item length');
assert.equal(short.start.programme.holeTargetM, 2.45);
assert.equal(long.start.programme.holeTargetM, 3.05);
assert.ok(long.entries.every((depth) => depth >= 3.05), 'Actual install cannot start at the old 2.45 m hole depth');
assert.ok(short.entries.every((depth) => depth >= 2.45));
for (const ctx of [short, long]) {
  for (const record of ctx.records) {
    assert.equal(record.boltLengthM, ctx.start.programme.boltLengthM);
    assert.equal(record.holeTargetM, ctx.start.programme.holeTargetM);
    assert.equal(record.boltLengthBasis, 'manufacturer-item');
  }
  assert.equal(ctx.start.programme.boltLengthM, getItem(ctx.state.garage.loadout.install).stats.boltLengthM);
}
assert.ok(long.start.parSec > short.start.parSec, 'Par drilling allowance reflects the longer holes');
short.sim.dispose(); long.sim.dispose();

const captured = cycle('friction-bolt-46', (state) => { state.garage.loadout.install = 'friction-bolt-39'; });
assert.ok(captured.records.every((record) => record.boltLengthM === 3), 'Running programme captures installed item length');
captured.sim.startHole(captured.contract);
assert.equal(captured.sim.getTelemetry().programme.boltLengthM, 2.4, 'Next programme reads the newly fitted item');
captured.sim.dispose();

for (const id of ['unknown-friction-bolt', undefined, 'cable-bolt-6m', 'rebar-bolt-20']) {
  const ctx = cycle(id);
  assert.equal(ctx.start.programme.boltLengthM, null, 'Unknown or unsourced length is not inferred from a label/life stat');
  assert.equal(ctx.start.programme.modeledBoltLengthM, 2.4, 'Legacy programme remains bounded and playable');
  assert.match(ctx.start.programme.boltLengthBasis, /NOT SOURCED/);
  assert.ok(ctx.records.every((record) => record.boltLengthM === null && /NOT SOURCED/.test(record.boltLengthBasis)));
  if (id === 'rebar-bolt-20') {
    assert.equal(ctx.start.programme.boltType, 'resin');
    for (const phase of ['spin', 'gel', 'hold']) assert.ok(ctx.phases.has(phase), `Actual resin ${phase} stage runs`);
    assert.equal(ctx.start.programme.spinSec, 1.4);
    assert.equal(ctx.start.programme.gelSec, 2.6);
    assert.equal(ctx.start.programme.holdSec, 1.8);
    assert.ok(ctx.records.every((record) => record.anchorage01 > 0.9));
  }
  ctx.sim.dispose();
}
console.log('PASS: 7 full actual-module bolt patterns (21 installations), captured length, par and resin lifecycle');
