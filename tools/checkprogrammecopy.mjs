#!/usr/bin/env node
/** Actual simulation telemetry -> the HUD's own stage/card formatters.
 * Synthetic 1 m targets and uniform ground exercise UI transitions only;
 * this is neither a capacity test nor phone-layout acceptance.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { createDrillSim, methodOf } from '../src/sim/drilling.js';
import { METHODS, REGIONS, makeContract } from '../src/game/data.js';
import { twoStageStatus, twoStageUnitCard } from '../src/ui/screens/site.js';

const changed = ['cfa', 'cased-cfa', 'hdd', 'jet-grouting'];
const stages = [];
for (const methodId of [...changed, 'raise-boring']) {
  const method = METHODS.find(m => m.id === methodId);
  const m = methodOf(methodId);
  const state = createGameState();
  const rock = methodId === 'raise-boring';
  const sim = createDrillSim({ state, bus: createBus(), geology: { getDrillabilityAt: () => ({
    id: rock ? 'limestone' : 'clay', ucs: rock ? 20 : 1,
    stability: 1, abrasivity: 0, water: 0, top: 0, bottom: 100,
  }) } });
  try {
    sim.startHole({ id: `copy-${methodId}`, methodId, method,
      targetDepth: 1, holeDia: method.nominalDia, seed: 194, ground: [rock ? 'limestone' : 'clay'] });
    let tl = sim.getTelemetry(), p = tl.programme;
    assert.equal(twoStageStatus(p, tl)[0], m.stages[0].name, `${methodId} initial stage`);
    let sawOutboundProgress = false;
    for (let i = 0; i < 120 * 120 && !p.reverse; i++) {
      sim.setInput('feed', m.optWob);
      sim.setInput('rotation', m.optRpm);
      sim.setInput('flush', m.optFlush);
      sim.debug.stepFixed(1);
      tl = sim.getTelemetry(); p = tl.programme;
      if (!p.reverse && tl.depth >= 0.5 && tl.depth < 0.8) {
        assert.equal(Number.parseFloat(twoStageStatus(p, tl)[1]), Number(tl.depth.toFixed(1)), `${methodId} outbound distance follows real depth`);
        sawOutboundProgress = true;
      }
    }
    assert.ok(sawOutboundProgress, `${methodId} has measured outbound progress`);
    assert.equal(p.reverse, true, `${methodId} must enter its real return pass`);
    const status = twoStageStatus(p), card = twoStageUnitCard(p);
    assert.equal(status[0], m.stages[1].name, `${methodId} active stage`);
    assert.match(status[1], /^\d+\/1 m$/, `${methodId} pass distance remains metres`);
    assert.equal(card.title, m.stages[1].name);
    const text = JSON.stringify(card);
    if (methodId === 'cfa' || methodId === 'cased-cfa') {
      assert.ok(p.concrete);
      assert.match(text, /Concrete placed/);
      assert.match(text, /m³/);
      assert.match(text, /Effective volume/);
      assert.ok(card.note.includes(`${p.concrete.targetLo.toFixed(2)}–${p.concrete.targetHi.toFixed(2)}×`));
      assert.doesNotMatch(text, /Cutters|Stalls|pull, not rate|Pilot|Ream/);
    } else if (methodId === 'jet-grouting') {
      assert.ok(p.jet);
      assert.match(text, /Jet pressure/);
      assert.match(text, /bar/);
      assert.match(text, /Column index/);
      assert.doesNotMatch(text, /Cutters|Stalls|pull, not rate|Pilot|Ream/);
    } else {
      assert.match(text, /Cutters/);
      assert.match(text, /Stalls/);
      assert.doesNotMatch(text, /Concrete placed|Column index/);
    }
    stages.push({ methodId, initial: m.stages[0].name, returned: status[0] });
  } finally { sim.dispose(); }
}
assert.equal(twoStageStatus({ passM: 2, passTargetM: 3 })[0], 'Pass', 'unknown stage is not guessed from direction');

// Compare to the old copy-dependent eligibility rule. Only description prose
// may differ: changing labels must not alter contracts, money or random draws.
const url = new URL('../src/game/data.js', import.meta.url);
let before = readFileSync(url, 'utf8');
for (const methodId of changed) {
  const copy = METHODS.find(m => m.id === methodId).scoredOn;
  assert.notEqual(copy, 'metres drilled', `${methodId} must name its quality product`);
  before = before.replaceAll(`scoredOn: '${copy}'`, "scoredOn: 'metres drilled'");
}
assert.ok(before.includes('TOLERANCE_CONTRACT_METHODS.includes(x.method.id)'));
before = before.replace('TOLERANCE_CONTRACT_METHODS.includes(x.method.id)', "x.method.scoredOn !== 'metres drilled'");
before = before.replace(/from (['"])(\.[^'"]+)\1/g, (_, q, path) => `from ${q}${new URL(path, url).href}${q}`);
const legacy = await import('data:text/javascript;base64,' + Buffer.from(before).toString('base64'));
const seenCopy = new Set();
let contracts = 0;
for (const region of REGIONS) for (let seed = 1; seed <= 120; seed++) {
  const current = makeContract(region.id, 60, makeRandom(seed));
  const previous = legacy.makeContract(region.id, 60, makeRandom(seed));
  const { description: currentDescription, ...currentTerms } = current;
  const { description: previousDescription, ...previousTerms } = previous;
  assert.deepEqual(currentTerms, previousTerms, `${region.id}/${seed}: copy must not rebalance the contract`);
  if (changed.includes(current.methodId) && current.constraint.id === 'none') {
    assert.ok(currentDescription.includes(METHODS.find(m => m.id === current.methodId).scoredOn));
    assert.notEqual(currentDescription, previousDescription);
    seenCopy.add(current.methodId);
  }
  contracts++;
}
assert.deepEqual([...seenCopy].sort(), [...changed].sort(), 'all four corrected clauses reach generated contracts');
console.log(JSON.stringify({ passed: true, stages, contractTermsPreserved: contracts, correctedClauses: [...seenCopy] }, null, 2));
