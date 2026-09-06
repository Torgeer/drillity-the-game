#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createGameState, createBus } from '../src/core/contract.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { boltUnitCard, resinInstallStep } from '../src/ui/screens/site.js';

// Real simulation programmes enter the same exported mappers the actual HUD uses.
// No copied UI functions, source matching, internal writes, or browser substitute.
function installed(bit, bolt = 'friction-bolt-39') {
  const state = createGameState(), bus = createBus();
  state.garage.loadout = { bit, install: bolt };
  state.garage.condition = { [bit]: 1 };
  const sim = createDrillSim({ state, bus, geology: { getDrillabilityAt: () => ({
    id: 'granite', ucs: 100, stability: 1, abrasivity: 0, water: 0, top: 0, bottom: 100,
  }) } });
  sim.startHole({ id: 'rockbolt-ui', methodId: 'rockbolt', targetDepth: 0.3,
    seed: 194, flushMedium: 'water' });
  const stages = new Map();
  try {
    for (let i = 0; i < 120 * 90; i++) {
      const tl = sim.getTelemetry(), p = tl.programme;
      if (p.installs.length) return { tl, card: boltUnitCard(p, tl), stages };
      if (p.installStage && !stages.has(p.installStage)) stages.set(p.installStage, structuredClone(tl));
      sim.setInput('feed', 0.38);
      sim.setInput('rotation', p.installStage === 'gel' || p.installStage === 'hold' ? 0 : 0.8);
      sim.setInput('flush', 0.66);
      sim.debug.stepFixed(1);
    }
    assert.fail(`${bit}/${bolt} must reach a real completed install`);
  } finally { sim.dispose(); }
}
let count = 0;
const check = (name, fn) => { fn(); count++; console.log(`PASS ${name}`); };
const samples = [
  ['supported', 'bolt-bit-38', 'friction-bolt-39', 'In range'],
  ['undersize', 'bolt-bit-33', 'friction-bolt-39', 'Too small'],
  ['oversize', 'bolt-bit-39', 'friction-bolt-39', 'Too large'],
  ['unknown', 'bolt-bit-38', 'unknown-friction-bolt', 'Unknown'],
  ['larger-family', 'bolt-bit-38', 'friction-bolt-46', 'Too small'],
].map(([name, bit, bolt, expected]) => ({ name, expected, ...installed(bit, bolt) }));

for (const sample of samples) check(`${sample.name} actual install maps to trial-fit guidance`, () => {
  const { card, tl, expected } = sample;
  assert.equal(card.rows.length, 3);
  assert.equal(card.rows[0][0], 'Trial fit'); assert.equal(card.rows[0][1], expected);
  assert.ok(!JSON.stringify(card).includes('%'), 'Friction fit must not be presented as a capacity percentage');
  assert.ok(!card.rows.some(([label]) => label === 'Anchorage' || label === 'Hole vs ideal'));
  assert.equal(card.title, `Bolt ${tl.programme.installs.at(-1).index} of ${tl.programme.boltsTotal} in`,
    'Completed record index must win over the next-bolt programme cursor');
  if (sample.name === 'supported') {
    assert.equal(card.rows[1][1], '38.1 mm'); assert.equal(card.rows[2][1], '35–38.1 mm');
    assert.match(card.note, /pull test/);
  }
  if (sample.name === 'larger-family') assert.equal(card.rows[2][1], '41–45 mm');
  if (sample.name === 'unknown') assert.equal(card.rows[2][1], '—');
});

check('missing physical metadata cannot become zero-mm or supported-fit claims', () => {
  const p = structuredClone(samples[0].tl.programme);
  p.installs.at(-1).bitGaugeMm = null; p.installs.at(-1).anchorageBasis = null;
  p.bitTrialRangeMm = null;
  const card = boltUnitCard(p);
  assert.deepEqual(card.rows.map((row) => row[1]), ['Unknown', '—', '—']);
  assert.equal(card.tone, 'warn');
});
check('abandoned record never inherits supported live fit', () => {
  const p = structuredClone(samples[0].tl.programme);
  p.installs.at(-1).abandoned = true;
  const card = boltUnitCard(p);
  assert.equal(card.rows[0][1], 'Skipped'); assert.equal(card.tone, 'bad');
  assert.match(card.title, /skipped/); assert.match(card.note, /no installed support/);
});
const resin = installed('bolt-bit-38', 'rebar-bolt-20');
check('actual resin completion keeps game score distinct from real capacity', () => {
  const card = resin.card;
  assert.equal(card.rows.length, 2); assert.equal(card.rows[0][0], 'Game score');
  assert.match(card.note, /game score/i);
  assert.match(card.note, /not a capacity test|Anchorage needs testing/);
});
check('actual resin spin/gel/hold stages work without remembered hazard frames', () => {
  assert.deepEqual([...resin.stages.keys()], ['spin', 'gel', 'hold']);
  for (const [stage, tl] of resin.stages) {
    const copy = resinInstallStep(tl.programme);
    assert.equal(copy.index, ['spin', 'gel', 'hold'].indexOf(stage));
    assert.equal(copy.copy[0].toLowerCase(), stage);
    const late = structuredClone(tl); late.hazards = [];
    assert.deepEqual(resinInstallStep(late.programme), copy);
  }
  assert.deepEqual(resinInstallStep(resin.tl.programme), { index: -1, copy: null },
    'After installation the resin stage highlight must stop');
  assert.deepEqual(resinInstallStep(samples[0].tl.programme), { index: -1, copy: null });
});
console.log(JSON.stringify({ passed: count, cards: samples.map(({ name, card }) => ({ name, card })), resin: resin.card }, null, 2));
