#!/usr/bin/env node
/** Standalone current-defect diagnostic, deliberately outside default checks.
 * Executes real catalogue and simulation modules; no GPU, browser or tuning.
 * Exit 0 means the recorded impact fallback was reproduced, NOT vibro validity.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getItem, canEquip, itemsForMethod, rigsForMethod } from '../src/game/data.js';
import { createGameState, createBus } from '../src/core/contract.js';
import { createDrillSim, resolveMethod } from '../src/sim/drilling.js';

const impact = 'impact-hammer-9t', vibro = 'vibro-hammer-1500';
// NOT SOURCED: deterministic QA scenario, not a physical benchmark or contract.
const contract = { id: 'audit-vibro', methodId: 'driven-pile', targetDepth: 14,
  flushMedium: 'none', seed: 123, holeDia: 350 };
const sources = Object.fromEntries(['src/game/data.js', 'src/sim/drilling.js', 'src/core/contract.js']
  .map(path => [path, createHash('sha256').update(readFileSync(new URL('../' + path, import.meta.url))).digest('hex')]));
const runs = [];
for (const install of ['precast-pile-350', 'sheet-pile-z-630']) {
  for (const hammer of [impact, vibro]) {
    const state = createGameState();
    state.player.level = 60;
    state.contract = structuredClone(contract);
    state.garage.rigId = rigsForMethod(contract.methodId)[0].id;
    state.garage.owned = [hammer, install, 'dolly-hardwood'];
    state.garage.loadout = { hammer, install, dolly: 'dolly-hardwood' };
    const equip = canEquip(state, 'hammer', hammer);
    assert.equal(equip.ok, true);
    assert.ok(itemsForMethod(contract.methodId, { slot: 'hammer' }).some(item => item.id === hammer));
    const sim = createDrillSim({ state, bus: createBus() });
    try {
      sim.startHole(contract);
      sim.setInput('feed', 1); sim.setInput('rotation', 0); sim.setInput('flush', .5);
      sim.debug.stepFixed(800);
      sim.update(0);
      const telemetry = sim.getTelemetry();
      const programme = structuredClone(telemetry.programme);
      const takeSet = sim.pulse('takeSet');
      const row = { equipped: hammer, install, equip, advertisedRopMult: getItem(hammer).stats.ropMult,
        resolvedHammer: resolveMethod(contract.methodId, { hammerId: hammer }).pile.hammerItemId,
        phase: telemetry.phase, gauge: telemetry.gauge,
        programme, published: { blows: state.drill.blows, setMm: state.drill.setMm,
          energyKnm: state.drill.hammerEnergyKnm, dropM: state.drill.hammerDropM,
          bpm: state.drill.hammerBpm }, takeSet };
      assert.equal(programme.hammerItemId, impact);
      assert.equal(programme.unit, 'blow');
      assert.equal(programme.ramKg, 9000);
      assert.ok(programme.blows > 0 && programme.blowLog.length > 0);
      assert.equal(takeSet.ok, true);
      assert.equal(takeSet.blows, 10);
      runs.push(row);
    } finally { sim.dispose(); }
  }
  const pair = runs.slice(-2);
  assert.deepEqual(pair[0].programme, pair[1].programme,
    'Same pile/commands currently produce an identical impact programme for both hammers');
  assert.deepEqual(pair[0].published, pair[1].published);
}
console.log(JSON.stringify({ status: 'DEFECT_REPRODUCED', scope: 'CPU audit, not realism acceptance',
  sources, contract, steps: 800, runs }, null, 2));
