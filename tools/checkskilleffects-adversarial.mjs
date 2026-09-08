#!/usr/bin/env node
/** Independent real-module checks for skill units, saved aliases and purchase
 * events. CPU fixtures are not evidence of full-career balance or field rates.
 * Optional --compare-baseline=<commit> reports matched old/new game effects.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as core from '../src/core/contract.js';
import * as data from '../src/game/data.js';
import * as economy from '../src/game/economy.js';
import * as drilling from '../src/sim/drilling.js';
import { createProgression, SAVE_KEY, SAVE_VERSION } from '../src/game/progression.js';

const current = { core, data, economy, drilling };
let passed = 0;
const failures = [];
const closeTo = (a, b, label, tolerance = 1e-10) => assert.ok(
  Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance,
  `${label}: got ${a}, expected ${b}`);
async function check(name, action) {
  try { await action(); passed++; console.log(`PASS ${name}`); }
  catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message}`); }
}

function fixture(skills = {}, methodId = 'top-hammer', groundId = 'granite', modules = current) {
  const { core: C, data: D, drilling: S } = modules;
  const state = C.createGameState(), bus = C.createBus();
  state.player.skills = { ...skills };
  state.player.level = 60;
  state.player.skillPoints = 100;
  state.garage.rigId = D.getMethod(methodId).rigIds[0];
  state.garage.loadout = D.defaultLoadoutFor(methodId, 60);
  if (methodId === 'site-investigation') state.garage.loadout.probe = 'cpt-cone-15';
  const contract = { id: 'independent-skill-test', methodId, regionId: 'nordic',
    archetype: 'quarry', targetDepth: 90, holes: 1, difficulty: 1, seed: 903,
    flushMedium: methodId === 'site-investigation' ? 'none' : 'air', holeDia: 89 };
  state.contract = contract;
  const g = { ...C.GROUND[groundId], id: groundId, top: 0, bottom: 200, index: 0 };
  const strata = [ { ...g, bottom: 9 }, { ...g, top: 9, bottom: 20 },
    { ...g, top: 20, bottom: 200 } ];
  const sim = S.createDrillSim({ state, bus, geology: { getDrillabilityAt: () => g, strata } });
  sim.init(); sim.startHole(contract);
  return { state, bus, sim, contract, close: () => sim.dispose() };
}
function measured(skills, action, method, ground, modules) {
  const f = fixture(skills, method, ground, modules);
  try { return action(f); } finally { f.close(); }
}
const band = ({ sim }) => sim.getSweetSpot().halfWidth01;
const firstWear = ({ sim }) => {
  sim.debug.stepFixed(1);
  const wear = sim.getTelemetry().wearTrue;
  assert.ok(wear > 0, 'fixture must actually cut and wear a bit');
  return wear;
};
function handling({ sim }) {
  // Documented QA position seam; no writes to read-only debug.state.
  sim.debug.setDepth(sim.debug.state.m.rodLength - 1e-7);
  for (let i = 0; i < 500 && !['rod-add', 'bailing-run'].includes(sim.getTelemetry().phase); i++) {
    sim.debug.stepFixed(1);
  }
  const s = sim.debug.state;
  assert.ok(['rod-add', 'bailing-run'].includes(s.phase), 'actual handling phase must be entered');
  return { phase: s.phase, seconds: s.phaseDur };
}
function trip({ sim }, depth = 60) {
  sim.debug.setDepth(depth);
  void sim.changeBit();
  assert.equal(sim.getTelemetry().phase, 'tripping-out');
  return sim.debug.state.phaseDur;
}
function incomingBinding({ sim }) {
  sim.setInput('feed', 1); sim.setInput('rotation', 1); sim.setInput('flush', 0);
  for (let step = 0; step < 1200; step++) {
    sim.debug.stepFixed(1);
    const t = sim.getTelemetry();
    if (t.jam.raw > 0) return { step, pressure: t.jam.raw };
  }
  assert.fail('fixture never accumulated binding pressure');
}

await check('all supported alias spellings match canonical effect values without stacking', () => {
  for (const [canonical, aliases] of Object.entries(data.SKILL_ALIASES)) {
    const skill = data.getSkill(canonical);
    for (const alias of aliases) {
      for (const rank of [0, 1, skill.maxRank, 99]) {
        const saved = { [canonical]: Math.min(1, rank), [alias]: rank };
        assert.deepEqual(economy.resolveSkills(saved).raw,
          economy.resolveSkills({ [canonical]: Math.min(rank, skill.maxRank) }).raw,
          `${canonical}/${alias} rank ${rank}`);
      }
    }
  }
});

await check('legacy alias saves show the actual rank and cannot purchase already-owned ranks', () => {
  for (const [canonical, aliases] of Object.entries(data.SKILL_ALIASES)) {
    const skill = data.getSkill(canonical);
    const state = core.createGameState();
    state.player.level = 60; state.player.skillPoints = 100;
    state.player.skills = { [aliases[0]]: skill.maxRank };
    const p = createProgression({ state, bus: core.createBus() });
    assert.equal(p.skillRank(canonical), skill.maxRank, `${canonical} actual rank`);
    assert.equal(p.getSkillTree().skills.find(s => s.id === canonical).rank, skill.maxRank);
    assert.equal(p.spendSkillPoint(canonical).ok, false, `${canonical} cannot buy duplicate`);
    assert.equal(state.player.skillPoints, 100);
  }
});

await check('actual progression purchase charges the next alias rank and refreshes the active sim', () => {
  const f = fixture({ 'operator-groove': 2 });
  const p = createProgression({ state: f.state, bus: f.bus });
  try {
    const before = band(f), points = f.state.player.skillPoints;
    const result = p.spendSkillPoint('op.steady-hand');
    assert.equal(result.ok, true);
    assert.equal(result.cost, data.getSkill('op.steady-hand').cost[2]);
    assert.equal(f.state.player.skillPoints, points - result.cost);
    assert.equal(p.skillRank('op.steady-hand'), 3);
    closeTo(band(f) / before, 1.36 / 1.24, 'real purchase changed width');
    assert.equal(p.canSpendSkillPoint('op.feed-finesse').ok, true, 'legacy prerequisite is recognised');
  } finally { f.close(); }
});

await check('load preserves alias-owned effects and purchase accounting across a saved game', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  // This intentionally sparse alias save predates v7's required field-grind history.
  const payload = { version: 6, player: { level: 60, skillPoints: 20,
    skills: { 'op.steady-hand': 1, 'operator-groove': 3 } } };
  const saved = new Map([[SAVE_KEY, JSON.stringify(payload)]]);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value),
    removeItem: key => saved.delete(key),
  } });
  try {
    const state = core.createGameState(), p = createProgression({ state, bus: core.createBus() });
    assert.equal(p.load(), true, 'real load accepted the legacy payload');
    assert.equal(p.skillRank('op.steady-hand'), 3);
    closeTo(p.getEffects().m('groove.width'), 1.36, 'loaded live effect');
    assert.equal(p.spendSkillPoint('op.steady-hand').cost, 4);
    assert.equal(state.player.skillPoints, 16);
    assert.equal(p.save(), true);
    const restored = createProgression({ state: core.createGameState(), bus: core.createBus() });
    assert.equal(restored.load(), true);
    assert.equal(restored.skillRank('op.steady-hand'), 4);
    assert.equal(restored.spendSkillPoint('op.steady-hand').ok, false);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});

await check('fractional and above-cap stored ranks use valid integer purchase indexing', () => {
  for (const [saved, expected] of [
    [{ 'op.steady-hand': 2.9 }, 2], [{ 'operator-groove': 2.9 }, 2],
    [{ 'op.steady-hand': -3, 'operator-groove': 1 }, 1],
    [{ 'op.steady-hand': 99 }, 4], [{ 'op.steady-hand': 1, 'operator-groove': 99 }, 4],
  ]) {
    const state = core.createGameState(); state.player.level = 60; state.player.skillPoints = 50;
    state.player.skills = saved;
    const p = createProgression({ state, bus: core.createBus() });
    assert.equal(p.skillRank('op.steady-hand'), expected);
    closeTo(p.getEffects().m('groove.width'), 1 + .12 * expected, 'same integer rank');
    if (expected < 4) {
      assert.equal(p.spendSkillPoint('op.steady-hand').cost, expected + 1);
      assert.ok(Number.isFinite(state.player.skillPoints));
    } else assert.equal(p.spendSkillPoint('op.steady-hand').ok, false);
  }
});

await check('malformed saved rank values do not throw, create ranks or poison purchase balances', () => {
  for (const value of [{ valueOf: null, toString: null }, {}, [], [3], true, false,
    Number.NaN, Infinity, -Infinity, 'invalid', null]) {
    for (const key of ['op.steady-hand', 'operator-groove']) {
      const state = core.createGameState(); state.player.level = 60; state.player.skillPoints = 50;
      state.player.skills = { [key]: value };
      const p = createProgression({ state, bus: core.createBus() });
      assert.equal(p.skillRank('op.steady-hand'), 0, `${key} rejects ${String(value?.constructor?.name)}`);
      closeTo(p.getEffects().m('groove.width'), 1, 'malformed rank grants no effect');
      assert.equal(p.spendSkillPoint('op.steady-hand').cost, 1);
      assert.equal(state.player.skillPoints, 49);
    }
  }
  const state = core.createGameState();
  state.player.skills = { 'op.steady-hand': { valueOf: null, toString: null }, 'operator-groove': 2 };
  const p = createProgression({ state, bus: core.createBus() });
  assert.equal(p.skillRank('op.steady-hand'), 2, 'invalid canonical cannot suppress a valid alias');
});

await check('all four skill caps affect actual simulation through canonical and legacy inputs', () => {
  for (const [id, alias, action] of [
    ['op.steady-hand', 'operator-groove', band],
    ['ts.carbide-care', 'bit-life', firstWear],
    ['op.rod-handler', 'trip-speed', trip],
  ]) {
    const max = data.getSkill(id).maxRank;
    const expected = measured({ [id]: max }, action);
    closeTo(measured({ [id]: 100 }, action), expected, `${id} canonical cap`);
    closeTo(measured({ [id]: 1, [alias]: 100 }, action), expected, `${id} alias cap`);
    closeTo(measured({ [id]: 0, [alias]: 0 }, action), measured({}, action), `${id} zero ranks`);
  }
  const max = measured({ 'op.feed-finesse': 4 }, incomingBinding, 'auger', 'sand');
  for (const skills of [{ 'op.feed-finesse': 100 }, { 'feed-control': 100 }]) {
    assert.deepEqual(measured(skills, incomingBinding, 'auger', 'sand'), max);
  }
});

await check('life extension uses reciprocal wear in live cutting and settlement accounting', () => {
  for (const skills of [{ 'ts.carbide-care': 5 },
    { 'toolsmith-bit-life': 5, 'ts.heat-management': 3 }]) {
    const life = economy.resolveSkills(skills).m('bit.life');
    closeTo(measured(skills, firstWear) / measured({}, firstWear), 1 / life, 'live reciprocal wear');
    const item = data.defaultLoadoutFor('top-hammer', 60).bit;
    const book = { item, metres: 16, hardness: .7, abrasivity: .6 };
    const actual = economy.wearFromRun({ ...book, skills });
    closeTo(actual.effectiveLife / economy.wearFromRun(book).effectiveLife, life, 'accounted lifespan');
    // Heat Management also has a separate pre-existing accounting aggression
    // effect. Keep that background rank fixed to isolate the bit.life change.
    const background = skills['ts.heat-management'] ? { 'ts.heat-management': 3 } : {};
    const backgroundLife = economy.resolveSkills(background).m('bit.life');
    closeTo(actual.wear / economy.wearFromRun({ ...book, skills: background }).wear,
      backgroundLife / life, 'settlement reciprocal life at matched heat-rate modifier');
  }
});

await check('rod connections, cable bailing and trips retain direct time reductions and floor', () => {
  for (const [method, ground] of [['top-hammer', 'granite'], ['cable-tool', 'clay']]) {
    const base = measured({}, handling, method, ground);
    assert.equal(base.phase, method === 'cable-tool' ? 'bailing-run' : 'rod-add');
    const full = measured({ 'op.rod-handler': 4 }, handling, method, ground);
    closeTo(full.seconds / base.seconds, .52, `${method} time at rank four`);
  }
  closeTo(measured({ 'op.rod-handler': 4 }, trip) / measured({}, trip), .52, 'deep trip time');
  closeTo(measured({ 'op.rod-handler': 4 }, f => trip(f, 0)), drilling.TUNING.trip.minSec,
    'shallow trip minimum remains enforced');
});

await check('Feed Finesse changes off-centre coupling without changing the optimal or CPT rate', () => {
  const env = { depth: 0, load: 0, wear: 0, heat: 0, returns: 1, stability: 1, combo: 1, torque01: 0 };
  const method = drilling.methodOf('top-hammer'), bit = drilling.bitOf('button-bit-r32', method);
  const coupling = (wob, tolerance) => drilling.ropModel(method, bit, core.GROUND.granite,
    { wob, rpm: .6, flush: .8 }, { ...env, wobTolerance: tolerance }).terms.coupling;
  closeTo(coupling(method.optWob, 1.4), coupling(method.optWob, 1), 'optimal coupling is unchanged');
  for (const sign of [-1, 1]) {
    assert.ok(coupling(method.optWob + sign * .06, 1.4) > coupling(method.optWob + sign * .06, 1));
  }
  const input = f => { f.sim.debug.stepFixed(20); return { depth: f.sim.getTelemetry().depth, width: band(f) }; };
  assert.deepEqual(measured({ 'op.feed-finesse': 4, 'op.steady-hand': 4 }, input,
    'site-investigation', 'clay'), measured({}, input, 'site-investigation', 'clay'));
});

await check('binding reductions compose by catalogue and Feed Finesse never grants geological confidence', () => {
  const base = measured({}, incomingBinding, 'auger', 'sand');
  const skills = { 'op.feed-finesse': 4, 'op.jam-sense': 3 };
  const combined = measured(skills, incomingBinding, 'auger', 'sand');
  assert.equal(combined.step, base.step);
  closeTo(combined.pressure / base.pressure, .31, '24% plus 45% less incoming pressure');
  const forecast = ({ sim }) => sim.getForecast(100).map(s => ({ top: s.top, confidence: s.confidence }));
  const plain = measured({}, forecast);
  assert.ok(plain.some(s => s.top > 0), 'forecast has real upcoming strata');
  assert.deepEqual(measured({ 'op.feed-finesse': 4 }, forecast), plain);
});

await check('new-hole reset refreshes cached effects and dispose removes the unlock listener', () => {
  const f = fixture({ 'op.steady-hand': 4 });
  try {
    const skilled = band(f);
    f.state.player.skills = {};
    f.sim.abortHole(); f.sim.startHole(f.contract);
    closeTo(band(f) / skilled, 1 / 1.48, 'new hole refreshes a changed save');
    f.close();
    const width = band(f);
    f.state.player.skills = { 'op.steady-hand': 4 };
    f.bus.emit(core.EVENTS.UNLOCK, { kind: 'skill', id: 'op.steady-hand', rank: 4 });
    closeTo(band(f), width, 'disposed sim receives no skill events');
  } finally { f.close(); }
});

const comparison = process.argv.find(arg => arg.startsWith('--compare-baseline='));
if (comparison) await check('matched baseline comparison is loaded from a committed artifact', async () => {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const requested = comparison.slice('--compare-baseline='.length);
  const revision = execFileSync('git', ['rev-parse', '--verify', `${requested}^{commit}`],
    { cwd: repo, encoding: 'utf8' }).trim();
  const temporary = await mkdtemp(path.join(tmpdir(), 'drillity-skill-baseline-'));
  const paths = ['src/core/contract.js', 'src/game/data.js', 'src/game/economy.js',
    'src/game/equipment-support.js', 'src/sim/drilling.js'];
  try {
    await writeFile(path.join(temporary, 'package.json'), '{"type":"module"}');
    for (const file of paths) {
      const target = path.join(temporary, file);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, execFileSync('git', ['show', `${revision}:${file}`],
        { cwd: repo, maxBuffer: 4 * 1024 * 1024 }));
    }
    const baseline = {};
    for (const [key, file] of Object.entries({ core: paths[0], data: paths[1], economy: paths[2], drilling: paths[4] })) {
      baseline[key] = await import(pathToFileURL(path.join(temporary, file)).href);
    }
    const rows = [];
    for (const [effect, skills, action] of [
      ['band width', { 'op.steady-hand': 4 }, band],
      ['first-step bit wear', { 'ts.carbide-care': 5 }, firstWear],
      ['rod connection duration', { 'op.rod-handler': 4 }, f => handling(f).seconds],
      ['deep trip duration', { 'op.rod-handler': 4 }, trip],
    ]) {
      const oldBase = measured({}, action, undefined, undefined, baseline);
      const newBase = measured({}, action);
      closeTo(newBase, oldBase, `${effect} zero-rank baseline`);
      const before = measured(skills, action, undefined, undefined, baseline);
      const after = measured(skills, action);
      rows.push({ effect, zeroRank: oldBase, before, after, oldMultiplier: before / oldBase,
        newMultiplier: after / newBase });
    }
    console.log(JSON.stringify({ baseline: revision, evidence: 'matched CPU fixtures, not whole-career balance', rows }, null, 2));
  } finally {
    // Only remove the uniquely generated directory inside the OS temp root.
    const target = path.resolve(temporary), root = path.resolve(tmpdir());
    assert.equal(path.dirname(target), root);
    assert.ok(path.basename(target).startsWith('drillity-skill-baseline-'));
    await rm(target, { recursive: true, force: true });
  }
});

console.log(`Independent skill checks: ${passed} passed, ${failures.length} failed.`);
if (failures.length) process.exitCode = 1;
