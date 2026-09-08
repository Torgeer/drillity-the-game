#!/usr/bin/env node
/** Default suggestions must pass the same equipment boundary as startHole.
 * CPU only. Does not buy, equip, or replace anything in a player's save.
 * Run: node tools/checkdefaultloadout.mjs
 */
import assert from 'node:assert/strict';
import { createGameState, createBus } from '../src/core/contract.js';
import {
  METHODS, ITEMS, MAX_LEVEL, getItem, getMethod, itemsForMethod,
  defaultLoadoutFor, canEquip,
} from '../src/game/data.js';
import { checkMethodEquipment, resolveMethod } from '../src/sim/drilling.js';
import { createProgression } from '../src/game/progression.js';
import { checkSampleEquipment } from '../src/game/equipment-support.js';

const piling = 'driven-pile';
const impact = 'impact-hammer-9t';
const vibro = 'vibro-hammer-1500';

// The old selector is deliberately retained as a failing negative control.
// It also proves that every unrelated method/slot keeps its previous choice.
function priceOnlyDefault(methodId, level) {
  return Object.fromEntries((getMethod(methodId)?.toolSlots || []).map(slot => {
    const options = itemsForMethod(methodId, { level, slot }).sort((a, b) => a.price - b.price);
    return [slot, options[0]?.id ?? null];
  }));
}

function requireSupportedDefault(select, methodId, level) {
  const loadout = select(methodId, level);
  const options = { hammerId: loadout.hammer };
  const support = checkMethodEquipment(methodId, options);
  assert.equal(support.ok, true,
    `${methodId} level ${level}: default ${loadout.hammer} refused by runtime`);
  assert.doesNotThrow(() => resolveMethod(methodId, options));
  if (['core', 'sonic'].includes(methodId) && level >= getMethod(methodId).unlockLevel) {
    const sampling = checkSampleEquipment(methodId, loadout, getItem);
    assert.equal(sampling.ok, true, `${methodId} level ${level}: refused sampling set: ${sampling.reason}`);
  }
  return loadout;
}

assert.ok(getItem(vibro).price < getItem(impact).price, 'negative control requires the cheaper unsupported hammer');
assert.equal(priceOnlyDefault(piling, MAX_LEVEL).hammer, vibro);
assert.throws(() => requireSupportedDefault(priceOnlyDefault, piling, MAX_LEVEL),
  /refused by runtime/, 'gate must reject the actual previous selector');
for (const id of ['core', 'sonic']) assert.throws(() => requireSupportedDefault(priceOnlyDefault, id, MAX_LEVEL),
  /refused sampling set/, `gate must reject the old independent ${id} bay selector`);

const catalogueBefore = JSON.stringify(ITEMS);
let selections = 0;
for (const method of METHODS) {
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const loadout = requireSupportedDefault(defaultLoadoutFor, method.id, level);
    const previous = priceOnlyDefault(method.id, level);
    assert.deepEqual(Object.keys(loadout), [...method.toolSlots], 'slot shape stays unchanged');
    for (const slot of method.toolSlots) {
      const item = getItem(loadout[slot]);
      if (item) {
        assert.equal(item.slot, slot);
        assert.ok(item.methods.includes(method.id));
        assert.ok(item.unlockLevel <= level, 'suggestions obey unlock levels');
      } else {
        assert.equal(loadout[slot], null);
      }
      const changedSampleSlot = method.id === 'core' && ['bit', 'rod'].includes(slot)
        || method.id === 'sonic' && ['bit', 'rod', 'casing'].includes(slot);
      if ((method.id !== piling || slot !== 'hammer') && !changedSampleSlot) {
        assert.equal(loadout[slot], previous[slot], `${method.id}/${slot} level ${level} unchanged`);
      }
    }
    if (method.id === piling) {
      assert.equal(loadout.hammer, level < getItem(impact).unlockLevel ? null : impact);
    }
    selections++;
  }
}
assert.equal(selections, METHODS.length * MAX_LEVEL, 'nonempty complete method/level matrix');
assert.ok(selections > 0);
assert.deepEqual(defaultLoadoutFor('no-such-method', MAX_LEVEL), {});
assert.equal(defaultLoadoutFor(piling).hammer, null, 'omitted level retains level-one semantics');
assert.equal(JSON.stringify(ITEMS), catalogueBefore, 'catalogue, prices, and stats stay unchanged');

// A suggestion must not erase an owned hammer retained by an older save. Static
// catalogue compatibility remains separate from the public fit/start support guard.
const state = createGameState();
state.player.level = MAX_LEVEL;
state.player.money = 250000;
state.garage.rigId = 'piling-leader';
state.garage.owned = [impact, vibro];
state.garage.loadout.hammer = vibro;
const before = structuredClone(state);
assert.equal(canEquip(state, 'hammer', vibro).ok, true, 'static bay/method compatibility is preserved');
assert.equal(defaultLoadoutFor(piling, state.player.level).hammer, impact);
assert.deepEqual(state, before, 'query does not equip, purchase, or mutate existing savings');
assert.equal(itemsForMethod(piling, { level: MAX_LEVEL, slot: 'hammer' }).some(item => item.id === vibro), true,
  'unsupported item remains in the catalogue');
assert.equal(checkMethodEquipment(piling, { hammerId: state.garage.loadout.hammer }).ok, false,
  'explicitly selected vibro remains refused');

// The explicit auto-fit operation may choose owned supported equipment, but it
// must never buy it or delete unsupported equipment from an existing save.
const progression = createProgression({ state, bus: createBus() });
try {
  progression.autoLoadout(piling);
  assert.equal(state.garage.loadout.hammer, impact, 'auto-fit chooses supported owned impact');
  assert.deepEqual(state.garage.owned, before.garage.owned, 'auto-fit retains owned vibro');
  assert.equal(state.player.money, before.player.money, 'auto-fit makes no purchase');
  const fittedImpact = structuredClone(state), refused = progression.equip('hammer', vibro);
  assert.equal(refused.ok, false, 'public fitting refuses the unimplemented programme');
  assert.equal(refused.code, 'unsupported-piling-hammer');
  assert.deepEqual(state, fittedImpact, 'refused fit changes neither equipped impact, ownership nor money');
  assert.equal(checkMethodEquipment(piling, { hammerId: state.garage.loadout.hammer }).ok, true);

  state.garage.owned = [vibro];
  state.garage.loadout.hammer = null;
  const missing = progression.autoLoadout(piling);
  assert.equal(state.garage.loadout.hammer, null, 'auto-fit never installs unsupported owned vibro');
  assert.equal(missing.hammer, impact, 'supported unowned impact is a suggestion');
  assert.deepEqual(state.garage.owned, [vibro]);
  assert.equal(state.player.money, before.player.money);

  // An older save can still contain a fitted vibro. This explicit test input
  // bypasses the new public fit API; automatic selection must not delete it.
  state.garage.loadout.hammer = vibro;
  progression.autoLoadout(piling);
  assert.equal(state.garage.loadout.hammer, vibro);
  assert.equal(checkMethodEquipment(piling, { hammerId: state.garage.loadout.hammer }).ok, false);
  assert.equal(progression.equip('hammer', null).ok, true, 'legacy unsupported equipment remains removable');
  assert.equal(state.garage.loadout.hammer, null);
  assert.deepEqual(state.garage.owned, [vibro], 'removal retains legacy ownership');
  assert.equal(state.player.money, before.player.money, 'removal and refusal charge nothing');
} finally {
  progression.dispose();
}

console.log(`Default loadout: PASS ${selections} method/level selections; piling/core/sonic price-only controls rejected; unsupported public fit refused and legacy ownership/removal preserved.`);
