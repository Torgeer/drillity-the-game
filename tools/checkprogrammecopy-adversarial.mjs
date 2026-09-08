#!/usr/bin/env node
/** Independent regression checks against the pre-repair commit and live telemetry.
 * The uniform ground / short target are UI fixtures, not production-rate evidence.
 * Run: node tools/checkprogrammecopy-adversarial.mjs
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { METHODS, REGIONS, makeContract } from '../src/game/data.js';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { createDrillSim, methodOf } from '../src/sim/drilling.js';
import { twoStageStatus, twoStageUnitCard } from '../src/ui/screens/site.js';

const cwd = fileURLToPath(new URL('../', import.meta.url));
// Keep the historical control reproducible after the repair itself is committed.
const committed = execFileSync('git', ['show', '1f2d285f54ff71b9f05dac895bee0400aa9f61f7:src/game/data.js'], { cwd, encoding: 'utf8' });
const dataUrl = new URL('../src/game/data.js', import.meta.url);
const baselineSource = committed.replace(/from (['"])(\.[^'"]+)\1/g,
  (_, quote, path) => `from ${quote}${new URL(path, dataUrl).href}${quote}`);
const baseline = await import('data:text/javascript;base64,' + Buffer.from(baselineSource).toString('base64'));
const changedMethods = ['cfa', 'cased-cfa', 'hdd', 'jet-grouting'];
const priorPool = baseline.METHODS.filter(m => m.scoredOn !== 'metres drilled').map(m => m.id).sort();
assert.deepEqual(priorPool, ['core', 'driven-pile', 'longhole', 'rc', 'rockbolt', 'site-investigation', 'tunnel-jumbo']);
for (const current of METHODS) {
  const previous = baseline.METHODS.find(m => m.id === current.id);
  const { scoredOn: currentCopy, ...currentTerms } = current;
  const { scoredOn: previousCopy, ...previousTerms } = previous;
  assert.deepEqual(currentTerms, previousTerms, `${current.id}: no physical or economic method-data change`);
  if (changedMethods.includes(current.id)) assert.notEqual(currentCopy, previousCopy);
  else assert.equal(currentCopy, previousCopy, `${current.id}: unrelated scoring copy preserved`);
}

let boards = 0;
for (const region of REGIONS) for (let level = 1; level <= 60; level++) for (let seed = 1; seed <= 20; seed++) {
  const current = makeContract(region.id, level, makeRandom(seed));
  const previous = baseline.makeContract(region.id, level, makeRandom(seed));
  const { description: currentDescription, ...currentTerms } = current;
  const { description: previousDescription, ...previousTerms } = previous;
  assert.deepEqual(currentTerms, previousTerms, `${region.id}/L${level}/S${seed}: contract terms and incentives preserved`);
  if (currentDescription !== previousDescription) {
    assert.ok(changedMethods.includes(current.methodId), 'only targeted methods change prose');
    assert.equal(current.constraint.id, 'none', 'copy does not change tight-tolerance eligibility');
  }
  boards++;
}

const measurements = [];
const failures = [];
for (const methodId of ['cfa', 'cased-cfa']) {
  const state = createGameState(), m = methodOf(methodId);
  const method = METHODS.find(m => m.id === methodId);
  const sim = createDrillSim({ state, bus: createBus(), geology: { getDrillabilityAt: () => ({
    id: 'clay', ucs: 1, stability: 1, abrasivity: 0, water: 0, top: 0, bottom: 100,
  }) } });
  try {
    sim.startHole({ id: `critic-copy-${methodId}`, methodId, method,
      targetDepth: 1, holeDia: method.nominalDia, seed: 194, ground: ['clay'] });
    let tl = sim.getTelemetry();
    let initialPass = null;
    for (let i = 0; i < 14400 && !tl.programme.reverse; i++) {
      sim.setInput('feed', m.optWob);
      sim.setInput('rotation', m.optRpm);
      sim.setInput('flush', m.optFlush);
      sim.debug.stepFixed(1);
      tl = sim.getTelemetry();
      if (!initialPass && !tl.programme.reverse && tl.depth >= .5) {
        initialPass = { depth: tl.depth, display: twoStageStatus(tl.programme, tl) };
      }
    }
    assert.ok(tl.programme.reverse, `${methodId} reaches actual reverse pass`);
    // High supply / slow extraction plus over-rotation deliberately separates
    // the raw quotient from the soil- and rotation-adjusted programme KPI.
    for (let i = 0; i < 120; i++) {
      sim.setInput('feed', .08); sim.setInput('rotation', 1); sim.setInput('flush', 1);
      sim.debug.stepFixed(1);
    }
    tl = sim.getTelemetry();
    const c = tl.programme.concrete;
    assert.ok(c.demandM3h > 0);
    const rawRatio = c.supplyM3h / c.demandM3h;
    assert.ok(Math.abs(rawRatio - c.ratio) > 2, 'fixture exercises adjusted ratio, not an equal-value happy path');
    const card = twoStageUnitCard(tl.programme);
    const misleading = card.rows.find(([label, value]) =>
      /supply\s*\/\s*demand/i.test(label) && Number.parseFloat(value) < rawRatio - .1);
    if (misleading) failures.push(`${methodId}: raw supply/demand ${rawRatio.toFixed(3)} is labelled ${misleading[1]}`);
    measurements.push({ methodId, initialPass, rawRatio, effectiveRatio: c.ratio, band: [c.targetLo, c.targetHi], card });
  } finally { sim.dispose(); }
}
console.log(JSON.stringify({ contractsPreservedAgainstGitHead: boards, allMethodsDataPreserved: METHODS.length,
  measurements, failures }, null, 2));
assert.deepEqual(failures, [], 'programme copy must distinguish effective volume ratio from raw supply/demand');
