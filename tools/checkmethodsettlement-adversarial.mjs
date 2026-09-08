#!/usr/bin/env node
/** Independent simulation-to-settlement checks. No browser or source mutation.
 * Natural completion cases use accepted production simulation attempts and no
 * setDepth. Separately labelled legacy/malformed payload cases exercise the
 * settlement boundary with a fixture payload and a real issued attempt token.
 * Run: node tools/checkmethodsettlement-adversarial.mjs
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { getMethod, RIGS, CERTS } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { payoutForContract, reputationForContract, xpForContract, mobilisationHours } from '../src/game/economy.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const cases = [], observations = [];
const test = (name, fn) => cases.push({ name, fn });

function captureWarnings(action) {
  const old = console.warn, messages = [];
  console.warn = (...args) => messages.push(args.map(String).join(' '));
  try { return { value: action(), messages }; }
  finally { console.warn = old; }
}

async function start({ id, methodId = 'site-investigation', groundId = 'clay', holes = 1 } = {}) {
  const storage = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key),
  } });
  const state = createGameState(), bus = createBus(), events = [];
  const progression = createProgression({ state, bus, rand: makeRandom(991) });
  await progression.init();
  state.player.level = 60;
  state.player.money = 1e8;
  state.player.certs = CERTS.map(c => c.id);
  state.unlocked.methods = [methodId];
  state.unlocked.rigs = RIGS.map(r => r.id);
  const cpt = methodId === 'site-investigation';
  state.garage.rigId = cpt ? 'cpt-unit' : 'piling-leader';
  state.garage.loadout = cpt ? { probe: 'cpt-cone-piezo', rod: 'push-rod-1m' }
    : { hammer: 'impact-hammer-9t', dolly: 'dolly-plastic', install: 'precast-pile-350' };
  state.garage.owned = Object.values(state.garage.loadout);
  const targetDepth = cpt ? 10 : 8;
  const contract = { id, methodId, regionId: 'nordic', archetype: 'urban-plot',
    applicationId: cpt ? 'site-investigation' : 'foundation-piling',
    targetDepth, holes, metres: targetDepth * holes, holeDia: getMethod(methodId).nominalDia,
    payout: 10000 * holes, bonus: { time: 1000 * holes, quality: 1000 * holes },
    deadlineHours: 24, requiredCerts: [], difficulty: 1, reputationReward: 10,
    hardness: .2, abrasivity: .2, seed: 194, flushMedium: getMethod(methodId).flushMedium,
    ground: [{ id: groundId, top: 0, bottom: 100 }] };
  assert.equal(progression.previewContract(contract).ok, true);
  assert.equal(progression.acceptContract(contract).ok, true);
  const completions = [];
  bus.on(EVENTS.HOLE_COMPLETE, event => completions.push(event));
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  const sim = createDrillSim({ state, bus, progression });
  sim.init();
  sim.startHole(contract);
  assert.ok(sim.getTelemetry().attemptId);
  return { state, bus, progression, sim, contract, completions, events,
    before: structuredClone(state.player),
    close() { sim.dispose(); progression.dispose(); } };
}

function until(f, predicate, limit = 12000) {
  for (let tick = 0; tick < limit; tick++) {
    if (predicate()) return tick;
    f.beforeTick = structuredClone({ depth: f.sim.getTelemetry().depth });
    f.sim.debug.stepFixed(1);
  }
  throw Error(`Bounded simulation failed to reach condition: ${f.contract.id}, ${f.sim.getTelemetry().phase}`);
}

function receipt(f, index = 0) {
  const event = f.completions[index];
  assert.ok(event, 'genuine simulator completion exists');
  const settlement = f.progression.settlementForCompletion(event);
  assert.ok(settlement, 'progression consumed that exact completion');
  assert.equal(settlement.attemptId, event.attemptId);
  return { event, settlement };
}

function checkReplay(f, event) {
  const before = JSON.stringify({ player: f.state.player, run: f.progression.run,
    contract: f.state.contract, save: f.progression.serialise() });
  assert.equal(f.progression.completeHole(event), null);
  assert.equal(JSON.stringify({ player: f.state.player, run: f.progression.run,
    contract: f.state.contract, save: f.progression.serialise() }), before);
}

for (const mode of ['immediate', 'partial', 'target', 'thrust-limit']) {
  test(`CPT ${mode} records delivered depth through genuine settlement`, async () => {
    const f = await start({ id: 'critic-cpt-' + mode, groundId: mode === 'thrust-limit' ? 'sandstone' : 'clay' });
    try {
      f.sim.setInput('feed', 20 / 34);
      let actual;
      if (mode === 'partial') until(f, () => f.sim.getTelemetry().depth >= 2);
      if (mode === 'immediate' || mode === 'partial') {
        actual = +f.sim.getTelemetry().depth.toFixed(2);
        const terminal = captureWarnings(() => f.sim.pulse('terminate'));
        assert.equal(terminal.value.ok, true);
        assert.deepEqual(terminal.messages, [], 'a real zero-time CPT stop is valid timing evidence');
      } else {
        until(f, () => !f.sim.active);
        actual = mode === 'target' ? f.contract.targetDepth : +f.beforeTick.depth.toFixed(2);
      }
      assert.equal(f.completions.length, 1);
      const { event, settlement } = receipt(f);
      assert.equal(event.depth, actual, 'completion must not replace delivered depth with the target');
      assert.equal(settlement.depth, actual, 'zero cannot fall through to target in progression');
      assert.equal(f.state.player.stats.metresDrilled - f.before.stats.metresDrilled, +actual.toFixed(1));
      if (actual === 0) {
        assert.equal(settlement.revenue, 0, 'no sounding was delivered');
        assert.equal(settlement.xp, 0, 'zero delivery earns no work or first-method XP');
        assert.equal(settlement.reputation, 0, 'zero delivery earns no reputation');
        assert.equal(f.state.player.career.firstTimes['site-investigation'] ?? false, false);
      } else if (mode === 'target') {
        assert.ok(settlement.revenue > 0);
        assert.ok(settlement.xp > 0);
      } else {
        assert.ok(settlement.revenue > 0);
        assert.ok(settlement.revenue < f.contract.payout,
          'this two-metre sounding must not collect the full ten-metre contract payout');
      }
      // Independent economy boundary: the fixture's tender is EUR 1,000/m,
      // each bonus is EUR 100/m and its reputation basis is one point/m.
      // These are exact fixture ratios, so no rounding policy is assumed here.
      const paidDelivery = { ...f.contract, metres: actual,
        payout: actual * 1000, bonus: { time: actual * 100, quality: actual * 100 },
        reputationReward: actual };
      const payOptions = { grade: event.grade,
        deadlineHours: f.contract.deadlineHours + mobilisationHours(f.state.garage.rigId, f.contract.methodId),
        holesCompleted: 1, skills: f.before.skills,
        roleId: f.before.roleId, reputation: 0,
        hazardsHit: event.hazardsHit || 0, safetyIncidents: event.safetyIncidents || 0 };
      // Public receipts round operating hours to two decimals. Check the full
      // rounding interval through the economy's published payment authority.
      const maximum = payoutForContract(paidDelivery, { ...payOptions, hours: settlement.hours - .005 }).gross;
      const minimum = payoutForContract(paidDelivery, { ...payOptions, hours: settlement.hours + .005 }).gross;
      assert.ok(settlement.revenue >= minimum && settlement.revenue <= maximum,
        `base payment and bonuses use delivered work: ${settlement.revenue} outside ${minimum}..${maximum}`);
      assert.equal(settlement.reputation, reputationForContract(paidDelivery,
        { grade: event.grade, skills: f.before.skills, roleId: f.before.roleId }));
      assert.equal(settlement.xp, Math.round(xpForContract(f.contract,
        { grade: event.grade, holesCompleted: 1, skills: f.before.skills, firstTime: true })
          * actual / f.contract.targetDepth), 'metre, per-hole and first-time XP are scaled exactly once');
      checkReplay(f, event);
      observations.push({ mode, actual, revenue: settlement.revenue, xp: settlement.xp });
    } finally { f.close(); }
  });
}

test('two-hole contract keeps partial delivery and cannot replay it during the next attempt', async () => {
  const f = await start({ id: 'critic-cpt-two-holes', holes: 2 });
  try {
    f.sim.setInput('feed', 20 / 34);
    until(f, () => f.sim.getTelemetry().depth >= 2);
    const firstDepth = +f.sim.getTelemetry().depth.toFixed(2);
    f.sim.pulse('terminate');
    const first = receipt(f);
    assert.equal(first.settlement.depth, firstDepth);
    assert.equal(first.settlement.complete, false);
    assert.equal(f.state.contract, f.contract);
    f.sim.startHole(f.contract);
    assert.notEqual(f.sim.getTelemetry().attemptId, first.event.attemptId);
    checkReplay(f, first.event);
    f.sim.setInput('feed', 20 / 34);
    until(f, () => !f.sim.active);
    assert.equal(f.completions.length, 2);
    const second = receipt(f, 1);
    assert.equal(second.settlement.depth, f.contract.targetDepth);
    assert.equal(second.settlement.complete, true);
    assert.equal(f.state.player.stats.metresDrilled - f.before.stats.metresDrilled,
      +(firstDepth + f.contract.targetDepth).toFixed(1));
  } finally { f.close(); }
});

test('zero CPT delivery preserves the first-method award for a later completed sounding', async () => {
  const f = await start({ id: 'critic-cpt-zero-then-full', holes: 2 });
  try {
    f.sim.pulse('terminate');
    assert.equal(receipt(f).settlement.xp, 0);
    assert.equal(f.state.player.career.firstTimes['site-investigation'] ?? false, false);
    f.sim.startHole(f.contract);
    f.sim.setInput('feed', 20 / 34);
    until(f, () => !f.sim.active);
    const second = receipt(f, 1);
    const fullHole = { ...f.contract, holes: 1, metres: f.contract.targetDepth };
    assert.equal(second.settlement.xp, xpForContract(fullHole,
      { grade: second.event.grade, holesCompleted: 1, skills: f.before.skills, firstTime: true }));
    assert.equal(f.state.player.career.firstTimes['site-investigation'], true);
  } finally { f.close(); }
});

for (const delivered of [false, true]) {
  test(`real pile ${delivered ? 'founded' : 'unfounded'} completion controls unit revenue`, async () => {
    const f = await start({ id: 'critic-pile-' + delivered, methodId: 'driven-pile', groundId: delivered ? 'sandstone' : 'clay' });
    try {
      if (!delivered) {
        until(f, () => f.sim.debug.state.prog.pitched && f.sim.getTelemetry().phase === 'drilling');
        assert.equal(f.sim.pulse('takeSet').ok, true);
        until(f, () => !f.sim.active || (f.sim.debug.state.prog.reDrives === 1 && f.sim.getTelemetry().phase === 'drilling'));
        if (f.sim.active) assert.equal(f.sim.pulse('takeSet').ok, true);
      }
      until(f, () => !f.sim.active);
      assert.equal(f.completions.length, 1);
      const { event, settlement } = receipt(f);
      const q = event.breakdown.quality;
      assert.equal(q.founded || q.hardRefused, delivered, 'real programme delivered the intended control');
      assert.equal(Object.hasOwn(q, 'detail'), false, 'test actual flattened completion schema');
      if (delivered) assert.ok(settlement.revenue > 0);
      else assert.equal(settlement.revenue, 0, 'an undelivered pile cannot be sold as one unit');
      checkReplay(f, event);
      observations.push({ deliveredPile: delivered, revenue: settlement.revenue });
    } finally { f.close(); }
  });
}

for (const [name, quality, paid] of [
  ['current hard-refusal record', { founded: false, hardRefused: true }, true],
  ['legacy founded record', { detail: { founded: true, hardRefused: false } }, true],
  ['legacy rejected record', { detail: { founded: false, hardRefused: false } }, false],
  ['explicit rejection beats stale nested acceptance',
    { founded: false, hardRefused: false, detail: { founded: true, hardRefused: true } }, false],
  ['string refusal is not boolean evidence', { founded: false, hardRefused: 'false' }, false],
  ['numeric refusal is not boolean evidence', { founded: false, hardRefused: 1 }, false],
]) {
  test(`accepted-attempt payload boundary: ${name}`, async () => {
    const f = await start({ id: 'critic-pile-schema-' + name, methodId: 'driven-pile' });
    try {
      const live = f.sim.getTelemetry();
      const payload = { contract: f.contract, runId: live.runId, attemptId: live.attemptId,
        methodId: 'driven-pile', depth: 8, grade: 'C', timeSec: 1,
        breakdown: { quality, time: { parSec: 60, actualSec: 60 } } };
      const settlement = f.progression.completeHole(payload);
      assert.ok(settlement, 'current accepted attempt permits the boundary fixture');
      if (paid) assert.ok(settlement.revenue > 0);
      else assert.equal(settlement.revenue, 0, 'an explicit unfounded pile needs boolean hard-refusal evidence');
      checkReplay(f, payload);
    } finally { f.close(); }
  });
}

test('accepted-attempt payload boundary: malformed zero-time CPT still warns', async () => {
  const f = await start({ id: 'critic-cpt-invalid-time' });
  try {
    const live = f.sim.getTelemetry();
    const payload = { contract: f.contract, runId: live.runId, attemptId: live.attemptId,
      methodId: 'site-investigation', depth: 0, grade: 'C', timeSec: 0,
      breakdown: { quality: { axis: 'SOUNDING', mode: 'cpt' }, time: { actualSec: 0 } } };
    const result = captureWarnings(() => f.progression.completeHole(payload));
    assert.ok(result.value);
    assert.equal(result.messages.filter(message => message.includes('HOLE_COMPLETE carried no breakdown.time')).length, 1,
      'missing positive finite parSec must not inherit the valid immediate-stop exemption');
    assert.equal(result.value.revenue, 0);
    assert.equal(result.value.xp, 0);
  } finally { f.close(); }
});

test('dissipation lasts the authored player time and holds sounding depth', async () => {
  const f = await start({ id: 'critic-cpt-dissipation' });
  try {
    const before = f.sim.getTelemetry();
    const tuning = f.sim.debug.tuning;
    const duration = tuning.hazard.coneDesat.dissipationSec;
    assert.ok(Number.isFinite(duration) && duration > 0);
    assert.equal(f.sim.pulse('dissipation').ok, true);
    assert.equal(f.sim.debug.state.phaseDur, duration);
    assert.equal(f.sim.pulse('dissipation').ok, false, 'cannot overlap timed tests');
    const ticksBeforeCompletion = Math.ceil(duration * tuning.sim.hz) - 1;
    f.sim.debug.stepFixed(ticksBeforeCompletion);
    const held = f.sim.getTelemetry();
    assert.equal(held.phase, 'dissipation');
    assert.equal(held.programme.dissipations, before.programme.dissipations);
    assert.equal(held.depth, before.depth);
    until(f, () => f.sim.getTelemetry().phase === 'drilling', 3);
    const after = f.sim.getTelemetry();
    assert.equal(after.programme.dissipations, before.programme.dissipations + 1);
    assert.equal(after.depth, before.depth);
    assert.ok(after.timeSec - before.timeSec >= duration);
    assert.ok(after.timeSec - before.timeSec <= duration + 2 / tuning.sim.hz);
    assert.equal(f.completions.length, 0);
    observations.push({ dissipationSeconds: after.timeSec - before.timeSec });
  } finally { f.close(); }
});

let passed = 0;
try {
  for (const { name, fn } of cases) {
    await fn();
    passed++;
    console.log('PASS ' + name);
  }
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
assert.equal(passed, cases.length);
console.log(JSON.stringify({ passed, cases: cases.length, observations }, null, 2));
