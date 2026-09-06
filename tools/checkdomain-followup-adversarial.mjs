#!/usr/bin/env node
// Independent actual-module follow-up regressions. No private state writes.
import assert from 'node:assert/strict';
import { createGameState, createBus } from '../src/core/contract.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { boltUnitCard, resinInstallStep } from '../src/ui/screens/site.js';
const cases = [], measurements = [];
const test = (name, run) => cases.push({ name, run });
const contract = { id: 'review-bolt-length', methodId: 'rockbolt', targetDepth: 1,
  seed: 194, flushMedium: 'water' };
function fresh(install = 'friction-bolt-39', bit = 'bolt-bit-38') {
  const state = createGameState();
  state.garage.loadout = { bit, install };
  const ground = { id: 'granite', name: 'Controlled rock', ucs: 100,
    stability: 1, abrasivity: 0, water: 0, top: 0, bottom: 100, index: 0 };
  const sim = createDrillSim({ state, bus: createBus(), geology: {
    strata: [ground], getDrillabilityAt: () => ground,
  }});
  sim.startHole(contract); sim.debug.godMode = true;
  return { state, sim };
}
function firstInstall(sim, visit = () => {}) {
  for (let i = 0; i < 24000; i++) {
    const t = sim.getTelemetry(); visit(t);
    if (t.programme.installs.length) return structuredClone(t);
    sim.setInput('feed', t.optimal.wob);
    sim.setInput('rotation', ['gel', 'hold'].includes(t.programme.installStage) ? 0 : t.optimal.rpm);
    sim.setInput('flush', 0.66);
    sim.debug.stepFixed(1);
  }
  assert.fail('No real installation completed within bounded fixture');
}
test('selected manufacturer 3 m tube defines a 3.05 m hole and longer par', () => {
  const a = fresh('friction-bolt-39'), b = fresh('friction-bolt-46');
  try {
    const x = a.sim.getTelemetry(), y = b.sim.getTelemetry();
    assert.equal(x.programme.boltLengthM, 2.4);
    assert.equal(y.programme.boltLengthM, 3);
    assert.equal(y.programme.holeTargetM, 3.05);
    assert.ok(y.parSec > x.parSec, 'Real run par includes extra selected-length drilling');
    measurements.push({ short: x.programme.boltLengthM, long: y.programme.boltLengthM,
      shortParSec: x.parSec, longParSec: y.parSec });
  } finally { a.sim.dispose(); b.sim.dispose(); }
});
test('real longer bolt cannot enter installation before its selected length is drilled', () => {
  const { sim } = fresh('friction-bolt-46');
  try {
    let beganAt = null;
    const t = firstInstall(sim, t => {
      if (t.phase === 'bolt-install' && beganAt == null) beganAt = t.holeDepth;
    });
    assert.ok(beganAt >= 3.05, `Installation began after only ${beganAt} m`);
    assert.equal(t.programme.boltLengthM, 3);
    measurements.push({ longerInstallStartedAtM: beganAt, install: t.programme.installs[0] });
  } finally { sim.dispose(); }
});
test('selected support length is captured for the run and re-resolves on next start', () => {
  const { state, sim } = fresh('friction-bolt-46');
  try {
    state.garage.loadout.install = 'friction-bolt-39';
    assert.equal(sim.getTelemetry().programme.boltLengthM, 3);
    assert.equal(firstInstall(sim).programme.boltLengthM, 3);
    sim.abortHole('review'); sim.startHole(contract);
    assert.equal(sim.getTelemetry().programme.boltLengthM, 2.4);
    assert.equal(sim.getTelemetry().programme.holeTargetM, 2.45);
  } finally { sim.dispose(); }
});
test('restarted short and unknown runs cannot inherit long-run par or drill-string conditions', () => {
  const old = fresh('friction-bolt-46');
  try {
    firstInstall(old.sim);
    for (const install of ['friction-bolt-39', 'unknown-friction-bolt']) {
      const clean = fresh(install);
      try {
        old.state.garage.loadout.install = install;
        old.sim.abortHole('review'); old.sim.startHole(contract);
        const before = old.sim.getTelemetry(), baseline = clean.sim.getTelemetry();
        for (const key of ['parSec', 'holeDepth', 'stringDepth', 'torque', 'target']) {
          assert.equal(before[key], baseline[key], `${install}: initial ${key} equals fresh instance`);
        }
        old.sim.debug.stepFixed(60); clean.sim.debug.stepFixed(60);
        const after = old.sim.getTelemetry(), expected = clean.sim.getTelemetry();
        for (const key of ['parSec', 'holeDepth', 'stringDepth', 'rop', 'torque']) {
          assert.equal(after[key], expected[key], `${install}: stepped ${key} equals fresh instance`);
        }
        measurements.push({ restartedInstall: install, parSec: after.parSec,
          stringDepthM: after.stringDepth, rop: after.rop });
      } finally { clean.sim.dispose(); }
    }
  } finally { old.sim.dispose(); }
});
test('missing and unsupported length metadata cannot masquerade as a verified 2.4 m product', () => {
  for (const install of [null, 'unknown-friction-bolt', 'cable-bolt-6m', 'rebar-bolt-20']) {
    const { sim } = fresh(install);
    try {
      const p = sim.getTelemetry().programme;
      assert.equal(p.boltLengthM, null, `${install}: missing provenance remains explicit`);
      assert.equal(p.modeledBoltLengthM, 2.4);
      assert.match(p.boltLengthBasis, /NOT SOURCED/);
      assert.equal(p.holeTargetM, 2.45);
      measurements.push({ unsupported: install, length: p.boltLengthM,
        modeled: p.modeledBoltLengthM, basis: p.boltLengthBasis });
    } finally { sim.dispose(); }
  }
});
test('resin spin gel and hold remain real player-time stages and finish successfully', () => {
  const { sim } = fresh('rebar-bolt-20');
  try {
    const stageSeconds = new Map();
    const t = firstInstall(sim, t => {
      const p = t.programme;
      if (t.phase === 'bolt-install') {
        stageSeconds.set(p.installStage, (stageSeconds.get(p.installStage) || 0) + 1 / 120);
        assert.ok(p.installRemainingSec >= 0 && p.installRemainingSec <= 6,
          'Seconds are player-time beat units, not downhole-time compression');
        const ui = resinInstallStep(p);
        assert.equal(ui.index, ['spin', 'gel', 'hold'].indexOf(p.installStage));
        assert.equal(ui.copy[0].toLowerCase(), p.installStage);
      }
    });
    assert.deepEqual([...stageSeconds.keys()], ['spin', 'gel', 'hold']);
    assert.ok(stageSeconds.get('spin') > 1 && stageSeconds.get('spin') < 2);
    assert.ok(stageSeconds.get('gel') > 1 && stageSeconds.get('gel') < 2);
    assert.ok(stageSeconds.get('hold') > 3 && stageSeconds.get('hold') < 4);
    assert.equal(t.programme.installs[0].type, 'resin');
    assert.ok(t.programme.installs[0].anchorage01 > 0.9);
    measurements.push({ resinStageSeconds: Object.fromEntries(stageSeconds) });
  } finally { sim.dispose(); }
});
test('real friction installation cards distinguish fit statuses without invented capacity', () => {
  for (const [bit, install, expected] of [
    ['bolt-bit-38', 'friction-bolt-39', 'In range'],
    ['bolt-bit-33', 'friction-bolt-39', 'Too small'],
    ['bolt-bit-39', 'friction-bolt-39', 'Too large'],
    ['bolt-bit-38', 'unknown-friction-bolt', 'Unknown'],
  ]) {
    const { sim } = fresh(install, bit);
    try {
      const t = firstInstall(sim), card = boltUnitCard(t.programme, t);
      assert.equal(Object.fromEntries(card.rows)['Trial fit'], expected);
      assert.doesNotMatch(JSON.stringify(card.rows), /anchorage|%|ideal/i);
      assert.doesNotMatch(card.note, /statutory|holds nothing|full contact/i);
      assert.ok(card.rows.length <= 3, 'Fits the existing three-cell unit card');
      measurements.push({ uiFit: expected, card });
    } finally { sim.dispose(); }
  }
});
test('completed record controls the UI even when current programme fit differs', () => {
  const { sim } = fresh();
  try {
    const t = firstInstall(sim), p = structuredClone(t.programme);
    p.diameterFit = 'oversize'; p.bitGaugeMm = 99;
    const card = boltUnitCard(p, t);
    assert.equal(Object.fromEntries(card.rows)['Trial fit'], 'In range');
    assert.equal(Object.fromEntries(card.rows).Bit, '38.1 mm');
    p.installs[0].anchorageBasis = null;
    assert.equal(Object.fromEntries(boltUnitCard(p, t).rows)['Trial fit'], 'Unknown',
      'Old records without score provenance cannot become a verified fit from percentages');
  } finally { sim.dispose(); }
});
test('resin card identifies a game score and does not claim friction fit or capacity', () => {
  const { sim } = fresh('rebar-bolt-20');
  try {
    const t = firstInstall(sim), card = boltUnitCard(t.programme, t);
    assert.ok(Object.hasOwn(Object.fromEntries(card.rows), 'Game score'));
    assert.doesNotMatch(JSON.stringify(card.rows), /Anchorage|Trial fit|ideal/i);
    assert.match(card.note, /game score|testing/i);
    assert.doesNotMatch(card.note, /statutory|full contact/i);
    assert.deepEqual(resinInstallStep({ ...t.programme, boltType: 'friction', installStage: 'hold' }),
      { index: -1, copy: null });
  } finally { sim.dispose(); }
});
let failures = 0;
for (const { name, run } of cases) {
  try { await run(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}
console.log(JSON.stringify({ cases: cases.length, failures, measurements }));
if (failures) process.exitCode = 1;
