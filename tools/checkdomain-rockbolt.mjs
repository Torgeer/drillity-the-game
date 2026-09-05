#!/usr/bin/env node
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceArg = process.argv.indexOf('--source-root');
const root = resolve(sourceArg >= 0 ? process.argv[sourceArg + 1] : '.');
const { createGameState, createBus, GROUND } = await import(pathToFileURL(resolve(root, 'src/core/contract.js')));
const { createDrillSim } = await import(pathToFileURL(resolve(root, 'src/sim/drilling.js')));
const { getItem } = await import(pathToFileURL(resolve(root, 'src/game/data.js')));

// The actual simulation drills and installs each bolt. Ground and equipment
// condition are controlled test inputs; no internal sim state is written.
function install(bitId, installId = 'friction-bolt-39', { stability = 1, condition = 1, ucs = 100, afterStart, groundInput, count = 1 } = {}) {
  const state = createGameState(), bus = createBus();
  state.garage.loadout = { bit: bitId, install: installId };
  state.garage.condition = { [bitId]: condition };
  const ground = groundInput || { id: 'granite', ucs, stability, abrasivity: 0, water: 0, top: 0, bottom: 100 };
  const sim = createDrillSim({ state, bus, geology: { getDrillabilityAt: () => ground } });
  sim.startHole({ id: 'rockbolt-mechanics', methodId: 'rockbolt', targetDepth: 0.3, seed: 194, flushMedium: 'water' });
  const start = structuredClone(sim.getTelemetry().programme);
  afterStart?.(state);
  for (let i = 0; i < 120 * 90 && sim.debug.state.prog.installs.length < count; i++) {
    // Fixed, reproducible normalized controls. These are fixture inputs,
    // not sourced drilling recommendations. Resin rotation stops after spin.
    const stage = sim.getTelemetry().programme?.installStage;
    sim.setInput('feed', 0.38);
    sim.setInput('rotation', stage === 'gel' || stage === 'hold' ? 0 : 0.8);
    sim.setInput('flush', 0.66);
    sim.debug.stepFixed(1);
  }
  const record = structuredClone(sim.debug.state.prog.installs[0]);
  const records = structuredClone(sim.debug.state.prog.installs);
  assert.ok(record, `${bitId}/${installId} reaches an actual installation record`);
  assert.equal(records.length, count, `${bitId}/${installId} reaches all ${count} requested installations`);
  const inspection = sim.pulse('inspectSlot');
  sim.dispose();
  return { ...record, start, records, inspection };
}

const supported = install('bolt-bit-38');
const undersize = install('bolt-bit-33');
const oversize = install('bolt-bit-39');
const compact = ({ start, records, inspection, ...record }) => record;
console.log(JSON.stringify({ supported: compact(supported), undersize: compact(undersize), oversize: compact(oversize) }));
if (process.argv.includes('--measure-only')) process.exit(0);
assert.ok(supported.anchorage01 >= 0.95, 'Manufacturer-supported bit must not receive an invented anchorage penalty');
assert.ok(supported.anchorage01 > undersize.anchorage01, 'An undersized bit cannot be the universal ideal');
assert.ok(supported.anchorage01 > oversize.anchorage01, 'Oversized hole must not earn supported fit score');
assert.equal(supported.diameterFit, 'supported');
assert.equal(undersize.diameterFit, 'undersize');
assert.equal(oversize.diameterFit, 'oversize');
assert.equal(supported.anchorageBasis, 'game-fit-score-not-pull-test');
assert.equal(undersize.slotClosureIn, null, 'An ineligible fit must not invent a measured slot reading');
assert.equal(oversize.slotClosureIn, null);
assert.equal(supported.inspection.ok, true, 'Eligible game install retains the slot inspection action');
assert.equal(undersize.inspection.ok, false, 'Unknown slot cannot be formatted by UI as a zero-inch measurement');
assert.equal(oversize.inspection.ok, false);
assert.match(undersize.inspection.reason, /No slot measurement/);
assert.equal(supported.start.holeIdealMm, supported.start.holeMm, 'Supported bit must not trigger legacy UI ideal warning');
assert.equal(supported.start.holeZeroMm, null, 'No claimed universal zero-capacity diameter');

const moderate = install('bolt-bit-38', 'friction-bolt-39', { ucs: 60 });
assert.equal(moderate.anchorage01, supported.anchorage01, 'No invented competent-UCS multiplier on fit');
const worn = install('bolt-bit-38', 'friction-bolt-39', { condition: 0.5 });
assert.ok(worn.holeMm < supported.holeMm, 'Real sim consumes equipment condition for hole diameter');
assert.equal(worn.diameterFit, 'supported');
const broken = install('bolt-bit-38', 'friction-bolt-39', { stability: 0.7 });
assert.equal(broken.diameterFit, 'supported', 'Nominal bit trial eligibility does not infer capacity from ground');
assert.equal(broken.anchorage01, supported.anchorage01);
const granite = install('bolt-bit-38', 'friction-bolt-39', { groundInput: { id: 'granite', ...GROUND.granite }, count: 3 });
assert.ok(granite.records.some((record) => record.holeMm > 38.1), 'Actual granite exercises authored overbreak');
assert.ok(granite.records.every((record) => record.diameterFit === 'supported' && record.anchorage01 === 1),
  'All actual granite installs retain supported bit eligibility despite modeled overbreak');

const largerFamily = install('bolt-bit-38', 'friction-bolt-46');
assert.deepEqual(largerFamily.start.bitTrialRangeMm, [41, 45], 'Fitted 46 mm family uses its own manufacturer range');
assert.equal(largerFamily.diameterFit, 'undersize');
const unknown = install('bolt-bit-38', 'unknown-friction-bolt');
assert.equal(unknown.diameterFit, 'unknown', 'Unknown family cannot inherit a recommended range');
assert.equal(unknown.anchorage01, 0);
assert.equal(unknown.inspection.ok, false);
const captured = install('bolt-bit-38', 'friction-bolt-39', { afterStart: (state) => { state.garage.loadout.install = 'friction-bolt-46'; } });
assert.equal(captured.diameterFit, 'supported', 'Install family is captured at programme start');

const resin33 = install('bolt-bit-33', 'rebar-bolt-20');
const resin38 = install('bolt-bit-38', 'rebar-bolt-20');
assert.equal(resin33.type, 'resin');
assert.equal(resin38.type, 'resin');
assert.equal(resin38.inspection.ok, false, 'Resin still has no split-tube slot inspection');
assert.equal(resin33.diameterFit, null);
assert.equal(resin38.diameterFit, null);
assert.equal(resin33.anchorage01, resin38.anchorage01, 'Friction fit must not leak into resin scoring');
assert.ok(resin38.anchorage01 > 0.9, 'Actual resin spin/gel/hold still completes successfully');

for (const [id, actual] of [['friction-bolt-39', supported], ['friction-bolt-46', largerFamily]]) {
  assert.deepEqual(actual.start.bitTrialRangeMm, getItem(id).stats.bitTrialRangeMm,
    `${id}: displayed item and actual consumed sim range agree`);
}
console.log(JSON.stringify({ worn: compact(worn), broken: compact(broken), granite: granite.records, largerFamily: compact(largerFamily), resin: compact(resin38) }));
console.log('PASS: 12 actual rockbolt installation scenarios plus catalogue/telemetry assertions');
