#!/usr/bin/env node
/** Standalone current-state diagnostic for the vibratory hammer, deliberately
 * outside the default checks. Executes real catalogue and simulation modules;
 * no GPU, browser or field tuning.
 *
 * ── WHAT THIS FILE USED TO SAY, AND WHY IT NO LONGER SAYS IT ──────────────────
 * Its header read: "Exit 0 means the recorded impact fallback was reproduced,
 * NOT vibro validity", and its body asserted that fitting `vibro-hammer-1500`
 * produced a byte-identical IMPACT programme — `programme.hammerItemId ===
 * 'impact-hammer-9t'`, ram 9 000 kg, blows logged.
 *
 * That defect is gone. `src/game/equipment-support.js` now refuses the start,
 * and `resolveMethod()` throws `unsupported-piling-hammer` before any run
 * exists. Run against today's tree, the old file did not report a defect — it
 * died with an uncaught exception at line 33, because `startHole` threw inside
 * its `try` and the assertions below never ran. A diagnostic that crashes is
 * not evidence of anything, and a hardcoded claim in a tool outlives the defect
 * it describes (ASTRA §10). So the tool now MEASURES the current state instead
 * of asserting a historical one.
 *
 * ── WHAT EXIT 0 MEANS NOW ────────────────────────────────────────────────────
 * Three things, all measured:
 *   1. No impact physics is borrowed. The vibratory hammer cannot start a
 *      `driven-pile` run at all — it is refused with a coded error, and nothing
 *      in the catalogue or the state is mutated by the refusal.
 *   2. No vibratory physics exists either. There is no `vibro` programme, no
 *      `vibroHammer` block on any shipped item, and the only vibratory numbers
 *      that reach the runtime are a display-only force and rpm in
 *      `src/rig/tools.js` that no simulation reads.
 *   3. The item is nevertheless the DEFAULT and the AUTO-LOADOUT choice for the
 *      only piling method in the game, because it is the cheaper of the two
 *      hammers and carries the higher `stats.ropMult`.
 *
 * Exit 0 is therefore NOT vibro validity. It means the containment holds and
 * the gap is exactly where `research/VIBRO_DRIVE_MODEL.md` says it is.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getItem, ITEMS, canEquip, itemsForMethod, rigsForMethod,
  defaultLoadoutFor, METHODS } from '../src/game/data.js';
import { createGameState, createBus } from '../src/core/contract.js';
import { createDrillSim, resolveMethod, checkMethodEquipment, TUNING } from '../src/sim/drilling.js';

const impact = 'impact-hammer-9t', vibro = 'vibro-hammer-1500';
// NOT SOURCED: deterministic QA scenario, not a physical benchmark or contract.
const contract = { id: 'audit-vibro', methodId: 'driven-pile', targetDepth: 14,
  flushMedium: 'none', seed: 123, holeDia: 350 };
const sources = Object.fromEntries(
  ['src/game/data.js', 'src/sim/drilling.js', 'src/core/contract.js', 'src/game/equipment-support.js']
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

    // THE ITEM IS STILL SOLD, STILL OWNABLE AND STILL EQUIPPABLE. Only the
    // START is refused, and that asymmetry is the live half of the defect.
    const equip = canEquip(state, 'hammer', hammer);
    assert.equal(equip.ok, true, `${hammer} is still equippable`);
    assert.ok(itemsForMethod(contract.methodId, { slot: 'hammer' }).some(item => item.id === hammer));

    const support = checkMethodEquipment(contract.methodId, { hammerId: hammer });
    const row = { equipped: hammer, install, equip,
      advertisedRopMult: getItem(hammer).stats.ropMult,
      support, resolved: null, phase: null, programme: null, published: null, refusal: null };

    const sim = createDrillSim({ state, bus: createBus() });
    try {
      if (hammer === vibro) {
        // MEASURED, not assumed: resolution throws before a run exists.
        let thrown = null;
        try { resolveMethod(contract.methodId, { hammerId: hammer }); }
        catch (error) { thrown = error; }
        assert.ok(thrown, 'the vibratory hammer is refused at method resolution');
        assert.equal(thrown.code, 'unsupported-piling-hammer');
        assert.equal(thrown.itemId, vibro);
        let started = null;
        try { started = sim.startHole(contract); }
        catch (error) { row.refusal = { code: error.code, itemId: error.itemId, message: error.message }; }
        assert.equal(started, null, 'no run is created for a vibratory hammer');
        assert.ok(row.refusal, 'startHole refuses rather than silently substituting');
        assert.equal(sim.active, false);
        // AND NOTHING IS SUBSTITUTED. The old defect was a silent 9 t default.
        assert.equal(state.drill.programme ?? null, null);
        assert.ok(!state.drill.blows, 'no blows are logged for a machine that never started');
      } else {
        assert.equal(sim.startHole(contract) === null, false);
        sim.setInput('feed', 1); sim.setInput('rotation', 0); sim.setInput('flush', 0.5);
        sim.debug.stepFixed(800);
        sim.update(0);
        const telemetry = sim.getTelemetry();
        row.resolved = resolveMethod(contract.methodId, { hammerId: hammer }).pile.hammerItemId;
        row.phase = telemetry.phase;
        row.programme = structuredClone(telemetry.programme);
        row.published = { blows: state.drill.blows, setMm: state.drill.setMm,
          energyKnm: state.drill.hammerEnergyKnm, dropM: state.drill.hammerDropM,
          bpm: state.drill.hammerBpm };
        assert.equal(row.programme.hammerItemId, impact);
        assert.equal(row.programme.unit, 'blow');
        assert.equal(row.programme.ramKg, 9000);
        assert.ok(row.programme.blows > 0 && row.programme.blowLog.length > 0);
      }
      runs.push(row);
    } finally { sim.dispose(); }
  }
  const pair = runs.slice(-2);
  assert.equal(pair[0].support.ok, true, 'the impact hammer is supported');
  assert.equal(pair[1].support.ok, false, 'the vibratory hammer is not');
  assert.ok(pair[1].programme === null,
    'the vibratory hammer no longer produces an impact programme — the recorded fallback is gone');
}

/* ── THE GAP, MEASURED RATHER THAN ASSERTED ─────────────────────────────────
   Nothing in the shipped catalogue publishes a vibratory envelope, and nothing
   in the simulation would read one if it did. Both halves are checked, so this
   block starts failing on the day either changes — which is the day
   research/VIBRO_DRIVE_MODEL.md's request has been actioned. */
const vibroItems = ITEMS.filter(i => i.slot === 'hammer' && !i.impactHammer
  && i.methods.includes('driven-pile'));
assert.ok(vibroItems.length, 'there is at least one non-impact piling hammer to be missing an envelope');
assert.ok(METHODS.some(m => m.id === 'driven-pile'), 'driven-pile is still the piling method');
const withEnvelope = vibroItems.filter(i => i.vibroHammer);
assert.equal(withEnvelope.length, 0,
  'no shipped item declares a vibratory envelope — if this fails, the data row landed and the sim must follow');
assert.equal(TUNING.methods['driven-pile'].vibro ?? null, null,
  'the simulation has no vibratory drive model — if this fails, the model landed and this tool is stale');

/* ── AND IT IS STILL WHAT THE GAME SUGGESTS ─────────────────────────────────
   The refusal is a wall, not a fix: the cheaper hammer wins the default
   loadout, and the higher advertised ropMult wins auto-loadout. A player who
   accepts both suggestions is handed the one machine that cannot start. */
const suggested = defaultLoadoutFor('driven-pile', 60);
const hammers = itemsForMethod('driven-pile', { slot: 'hammer' })
  .map(i => ({ id: i.id, price: i.price, ropMult: i.stats.ropMult }));

console.log(JSON.stringify({
  status: 'CONTAINED_NOT_MODELLED',
  scope: 'CPU audit. Exit 0 means the impact fallback is gone AND no vibratory model exists.',
  sources, contract, steps: 800,
  fallbackReproduced: false,
  defaultLoadoutHammer: suggested.hammer,
  defaultLoadoutIsRefused: suggested.hammer === vibro,
  hammers,
  vibroItemsWithoutEnvelope: vibroItems.map(i => i.id),
  runs,
}, null, 2));
