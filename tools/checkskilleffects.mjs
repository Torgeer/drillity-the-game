#!/usr/bin/env node
/** Real-module skill contracts. CPU only. Synthetic fixtures test game rules,
 * not field performance or balance across an entire career.
 */
import assert from 'node:assert/strict';
import { createBus, createGameState, EVENTS, GROUND } from '../src/core/contract.js';
import { getSkill, defaultLoadoutFor, getMethod } from '../src/game/data.js';
import { resolveSkills, resolveSkillRank, wearFromRun } from '../src/game/economy.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim, ropModel, methodOf, bitOf, TUNING } from '../src/sim/drilling.js';

let checks = 0;
function test(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
function near(actual, expected, message, epsilon = 1e-10) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) < epsilon,
    `${message}: actual=${actual}, expected=${expected}`);
}
function fixture(skills = {}, methodId = 'top-hammer', groundId = 'granite') {
  const state = createGameState(), bus = createBus();
  state.player.skills = { ...skills };
  state.garage.rigId = getMethod(methodId).rigIds[0];
  state.garage.loadout = defaultLoadoutFor(methodId, 60);
  if (methodId === 'site-investigation') state.garage.loadout.probe = 'cpt-cone-15';
  state.contract = { id: 'skill-formula-test', methodId, regionId: 'nordic',
    archetype: 'quarry', targetDepth: 80, holes: 1, difficulty: 0, seed: 48,
    flushMedium: 'air', holeDia: 89, hardness: .6, abrasivity: .7 };
  const g = { ...GROUND[groundId], id: groundId, top: 0, bottom: 200, index: 0 };
  const strata = [{ ...g, bottom: 8 }, { ...g, top: 8, bottom: 200 }];
  const sim = createDrillSim({ state, bus, geology: {
    getDrillabilityAt: () => g, strata,
  } });
  sim.init(); sim.startHole(state.contract);
  return { sim, state, bus, close() { sim.dispose(); } };
}
function measure(skills, fn, method, ground) {
  const f = fixture(skills, method, ground);
  try { return fn(f); } finally { f.close(); }
}
const width = ({ sim }) => sim.getSweetSpot().halfWidth01;
const oneStepWear = ({ sim }) => {
  sim.debug.stepFixed(1);
  assert.ok(sim.debug.state.wear > 0, 'wear fixture actually cut ground');
  return sim.debug.state.wear;
};
const rodTiming = ({ sim }) => {
  sim.debug.setDepth(sim.debug.state.m.rodLength - .000001); // QA positioning immediately before a connection.
  for (let i = 0; i < 240 && sim.getTelemetry().phase !== 'rod-add'; i++) sim.debug.stepFixed(1);
  assert.equal(sim.getTelemetry().phase, 'rod-add', 'nonempty rod-add fixture');
  return { ...sim.debug.state.rodAdd };
};

test('Steady Hand every legal rank widens the actual nonstandard band by 12% per rank', () => {
  const base = measure({}, width);
  for (let rank = 0; rank <= getSkill('op.steady-hand').maxRank; rank++) {
    near(measure({ 'op.steady-hand': rank }, width) / base, 1 + .12 * rank, `width rank ${rank}`);
  }
});
test('each migrated skill observes its catalogue maximum and aliases do not stack', () => {
  near(measure({ 'op.steady-hand': 99 }, width), measure({ 'op.steady-hand': 4 }, width), 'rank clamped at four');
  near(measure({ 'op.steady-hand': 1, 'operator-groove': 4 }, width), measure({ 'op.steady-hand': 4 }, width), 'alias highest wins');
  near(measure({ 'op.steady-hand': -2 }, width), measure({}, width), 'negative rank ignored');
  near(measure({ 'op.steady-hand': Number.NaN }, width), measure({}, width), 'NaN rank ignored');
  near(measure({ 'op.steady-hand': 2, 'operator-groove': Number.NaN }, width),
    measure({ 'op.steady-hand': 2 }, width), 'invalid alias does not erase canonical rank');
  for (const [id, key] of [['op.steady-hand', 'groove.width'], ['ts.carbide-care', 'bit.life'],
    ['op.rod-handler', 'rodAdd.time'], ['op.feed-finesse', 'wob.tolerance']]) {
    near(resolveSkills({ [id]: 99 }).m(key), resolveSkills({ [id]: getSkill(id).maxRank }).m(key), `${id} maxRank`);
  }
  near(measure({ 'ts.carbide-care': 99 }, oneStepWear), measure({ 'ts.carbide-care': 5 }, oneStepWear), 'live life cap');
  near(measure({ 'op.rod-handler': 99 }, rodTiming).dur, measure({ 'op.rod-handler': 4 }, rodTiming).dur, 'live handling cap');
});
test('CPT prescribed rate band does not widen with Steady Hand', () => {
  near(measure({ 'op.steady-hand': 4 }, width, 'site-investigation', 'clay'), measure({}, width, 'site-investigation', 'clay'), 'prescribed band');
});
test('Carbide Care life and actual first-step wear use reciprocal units, matching accounting', () => {
  const baseWear = measure({}, oneStepWear);
  const args = { item: 'bit-th-t45-89-hd', metres: 10, hardness: .6, abrasivity: .7 };
  const baseBook = wearFromRun(args);
  assert.ok(baseBook.wear > 0, 'accounting fixture has actual catalogue life');
  for (let rank = 0; rank <= getSkill('ts.carbide-care').maxRank; rank++) {
    const skills = { 'ts.carbide-care': rank }, life = 1 + .15 * rank;
    near(measure(skills, oneStepWear) / baseWear, 1 / life, `live wear rank ${rank}`);
    const book = wearFromRun({ ...args, skills });
    near(book.effectiveLife / baseBook.effectiveLife, life, `book life rank ${rank}`);
    near(book.wear / baseBook.wear, 1 / life, `book wear rank ${rank}`);
  }
});
test('shared life modifiers also include Heat Management and do not multiply twice', () => {
  const skills = { 'ts.carbide-care': 5, 'ts.heat-management': 3 };
  near(measure(skills, oneStepWear) / measure({}, oneStepWear), 1 / 1.90, 'combined life additive ranks');
  const alias = { 'ts.carbide-care': 1, 'toolsmith-bit-life': 5 };
  near(measure(alias, oneStepWear), measure({ 'ts.carbide-care': 5 }, oneStepWear), 'live legacy alias');
  const args = { item: 'bit-th-t45-89-hd', metres: 10 };
  near(wearFromRun({ ...args, skills: alias }).wear,
    wearFromRun({ ...args, skills: { 'ts.carbide-care': 5 } }).wear, 'accounting legacy alias');
});
test('Rod Handler every legal rank reduces actual duration and perfect window time by 12% per rank', () => {
  const base = measure({}, rodTiming);
  for (let rank = 0; rank <= getSkill('op.rod-handler').maxRank; rank++) {
    const row = measure({ 'op.rod-handler': rank }, rodTiming), time = 1 - .12 * rank;
    for (const key of ['dur', 'windowStart', 'windowEnd']) near(row[key] / base[key], time, `${key} rank ${rank}`);
    near(base.fast / row.fast, time, `perfect timing rank ${rank}`);
  }
});
test('Rod Handler retains tool-trip scope with the same time units and minimum duration', () => {
  const trip = ({ sim }) => {
    sim.debug.setDepth(60);
    void sim.changeBit();
    assert.equal(sim.getTelemetry().phase, 'tripping-out');
    return sim.debug.state.phaseDur;
  };
  const base = measure({}, trip);
  assert.ok(base * .52 > TUNING.trip.minSec, 'trip fixture clears minimum-duration floor');
  near(measure({ 'op.rod-handler': 4 }, trip) / base, .52, 'rank four trip time');
});
test('Feed Finesse broadens the authored percussive coupling window by 10% per rank', () => {
  const m = methodOf('top-hammer'), bit = bitOf('button-bit-r32', m), g = GROUND.granite;
  const env = { depth: 0, load: 0, wear: 0, heat: 0, returns: 1, stability: 1, combo: 1, torque01: 0 };
  for (const sign of [-1, 1]) {
    const offset = sign * .07;
    const ref = ropModel(m, bit, g, { wob: m.optWob + offset, rpm: .6, flush: .8 }, env).terms.coupling;
    for (let rank = 0; rank <= 4; rank++) {
      const tolerance = resolveSkills({ 'op.feed-finesse': rank }).m('wob.tolerance');
      const got = ropModel(m, bit, g, { wob: m.optWob + offset * tolerance, rpm: .6, flush: .8 },
        { ...env, wobTolerance: tolerance }).terms.coupling;
      near(got, ref, `equal penalty at ${tolerance}x deviation, sign ${sign}`);
    }
  }
});
test('Feed Finesse reduces live binding pressure by 6% per rank without improving forecast confidence', () => {
  const pressure = ({ sim }) => {
    sim.setInput('feed', 1); sim.setInput('rotation', 1); sim.setInput('flush', 0);
    for (let i = 0; i < 1200; i++) {
      sim.debug.stepFixed(1);
      const jam = sim.getTelemetry().jam.raw;
      if (jam > 0) return { jam, step: i };
    }
    assert.fail('binding fixture never produced pressure');
  };
  const base = measure({}, pressure, 'auger', 'sand');
  for (let rank = 0; rank <= 4; rank++) {
    const got = measure({ 'op.feed-finesse': rank }, pressure, 'auger', 'sand');
    assert.equal(got.step, base.step, 'matched first pressure step');
    near(got.jam / base.jam, 1 - .06 * rank, `binding pressure rank ${rank}`);
  }
  const forecast = ({ sim }) => sim.getForecast(100).map(s => [s.top, s.confidence]);
  const unskilled = measure({}, forecast);
  assert.ok(unskilled.some(([top]) => top > 0), 'forecast comparison contains an upcoming stratum');
  assert.deepEqual(measure({ 'op.feed-finesse': 4 }, forecast), unskilled);
});
test('buying a rank updates the live effect through the actual unlock event', () => {
  const f = fixture();
  try {
    const base = width(f);
    f.state.player.skills['op.steady-hand'] = 1;
    f.bus.emit(EVENTS.UNLOCK, { kind: 'skill', id: 'op.steady-hand', rank: 1 });
    near(width(f) / base, 1.12, 'live skill unlock');
  } finally { f.close(); }
});
test('maximum legacy rank is visible and refuses an empty-effect purchase', () => {
  const f = fixture({ 'operator-groove': 4 });
  f.state.player.level = 60; f.state.player.skillPoints = 10;
  const progression = createProgression({ state: f.state, bus: f.bus });
  try {
    assert.equal(progression.skillRank('op.steady-hand'), 4);
    const row = progression.getSkillTree().skills.find(s => s.id === 'op.steady-hand');
    assert.equal(row.rank, 4); assert.equal(row.canBuy, false);
    assert.equal(progression.skillCost('op.steady-hand'), Infinity);
    assert.equal(progression.spendSkillPoint('op.steady-hand').ok, false);
    assert.equal(f.state.player.skillPoints, 10);
    near(progression.getEffects().m('groove.width'), 1.48, 'maximum alias effect');
  } finally { progression.dispose(); f.close(); }
});
test('legacy prerequisite and next-rank purchase use the same rank and actual cost', () => {
  const f = fixture({ 'op.steady-hand': 1, 'operator-groove': 2 });
  f.state.player.level = 60; f.state.player.skillPoints = 10;
  const progression = createProgression({ state: f.state, bus: f.bus });
  try {
    assert.equal(progression.skillRank('op.steady-hand'), 2);
    assert.equal(progression.canSpendSkillPoint('op.feed-finesse').ok, true, 'alias satisfies prerequisite');
    assert.equal(progression.skillCost('op.steady-hand'), 3);
    const before = width(f);
    assert.deepEqual(progression.spendSkillPoint('op.steady-hand'), { ok: true, reason: '', cost: 3 });
    assert.equal(f.state.player.skillPoints, 7);
    assert.equal(f.state.player.skills['op.steady-hand'], 3);
    assert.equal(f.state.player.skills['operator-groove'], 2, 'legacy data is preserved');
    assert.equal(progression.getSkillTree().skills.find(s => s.id === 'op.steady-hand').rank, 3);
    near(progression.getEffects().m('groove.width'), 1.36, 'purchased effect');
    near(width(f) / before, 1.36 / 1.24, 'actual purchase refreshed live band');
  } finally { progression.dispose(); f.close(); }
});
test('fractional saved ranks cannot index a missing price or spend nonfinite points', () => {
  const f = fixture({ 'op.steady-hand': 1.9 });
  f.state.player.level = 60; f.state.player.skillPoints = 10;
  const progression = createProgression({ state: f.state, bus: f.bus });
  try {
    assert.equal(progression.skillRank('op.steady-hand'), 1);
    assert.equal(progression.skillCost('op.steady-hand'), 2);
    near(progression.getEffects().m('groove.width'), 1.12, 'same integral rank for effects');
    assert.equal(progression.spendSkillPoint('op.steady-hand').cost, 2);
    assert.equal(f.state.player.skillPoints, 8);
    assert.equal(progression.skillRank('op.steady-hand'), 2);
  } finally { progression.dispose(); f.close(); }
});
test('malformed JSON ranks cannot throw, invent purchases or erase valid aliases', () => {
  const malformed = [null, {}, [], [3], true, false, { valueOf: null, toString: null },
    { valueOf: 3, toString: '4' }, Number.NaN, Infinity, -Infinity, 'Infinity', 'not-a-rank'];
  for (const value of malformed) {
    for (const id of ['op.steady-hand', 'sl.contract-book', 'sl.negotiator']) {
      assert.equal(resolveSkillRank({ [id]: value }, id), 0, `${id} rejects malformed rank`);
      assert.deepEqual(resolveSkills({ [id]: value }).raw, resolveSkills().raw, 'no invented effect');
    }
    const skills = { 'op.steady-hand': value, 'operator-groove': 2 };
    assert.equal(resolveSkillRank(skills, 'op.steady-hand'), 2, 'valid alias remains authoritative');
    skills['op.steady-hand'] = 2; skills['operator-groove'] = value;
    assert.equal(resolveSkillRank(skills, 'op.steady-hand'), 2, 'invalid alias cannot erase valid rank');
  }
  assert.equal(resolveSkillRank({ 'operator-groove': '3' }, 'op.steady-hand'), 3, 'numeric legacy string');
  assert.equal(resolveSkillRank({ 'op.steady-hand': '2.9' }, 'op.steady-hand'), 2, 'numeric string is floored');
});
console.log(`Skill effect contracts: ${checks} groups passed.`);
