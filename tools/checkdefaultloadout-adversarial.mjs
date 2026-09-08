#!/usr/bin/env node
/** Independent career-boundary checks for automatic piling equipment.
 * Synthetic contract inputs are fixtures, not physical or balance claims.
 * Run: node tools/checkdefaultloadout-adversarial.mjs
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { defaultLoadoutFor, getItem, getMethod, getRig, ITEMS, CERTS, unlockedUpTo } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';

const IMPACT = 'impact-hammer-9t', VIBRO = 'vibro-hammer-1500';
const methodId = 'driven-pile';
const contract = { id: 'default-loadout-critic', methodId, regionId: 'nordic',
  archetype: 'urban-plot', targetDepth: 14, holes: 1, payout: 12000,
  difficulty: 2, requiredCerts: [], flushMedium: 'none', seed: 123, holeDia: 350 };
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const cases = [];
const test = (name, fn) => cases.push({ name, fn });

async function fixture({ level = 60, rigId = 'piling-leader', own = [IMPACT, VIBRO], hammer = null } = {}) {
  const values = new Map();
  const storage = { getItem: k => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  const state = createGameState(), bus = createBus(), events = [];
  const progression = createProgression({ state, bus, rand: makeRandom(159) });
  await progression.init();
  state.player.level = level;
  state.player.money = 1e6;
  state.player.certs = CERTS.map(c => c.id);
  const unlocked = unlockedUpTo(level);
  state.unlocked.methods = unlocked.methods;
  state.unlocked.rigs = unlocked.rigs;
  state.garage.rigId = rigId;
  state.garage.owned = [...new Set([...own, 'dolly-hardwood', 'precast-pile-350'])];
  state.garage.loadout = { hammer, dolly: 'dolly-hardwood', install: 'precast-pile-350' };
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  const sim = createDrillSim({ state, bus, progression });
  return { state, bus, progression, sim, events, values,
    close() { sim.dispose(); progression.dispose(); } };
}

function snapshot(f) {
  return JSON.stringify({ state: f.state, saved: f.progression.serialise(), run: f.progression.run,
    events: f.events, storage: [...f.values], telemetry: f.sim.getTelemetry() });
}

function requireAcceptedImpact(f) {
  const preview = f.progression.previewContract(contract);
  assert.equal(preview.ok, true, preview.reason);
  assert.equal(f.progression.acceptContract(contract).ok, true);
  const start = f.sim.startHole(contract);
  assert.equal(start.programme.hammerItemId, IMPACT);
  assert.ok(f.progression.run.attemptId, 'actual career issued an attempt');
  return start;
}

for (const level of [33, 36, 37, 60]) {
  for (const rigId of ['piling-leader', 'pd55'].filter(id => getRig(id).unlockLevel <= level)) {
    test(`shop suggestion can be equipped, accepted and started at level ${level} on ${rigId}`, async () => {
      const f = await fixture({ level, rigId });
      try {
        const suggested = defaultLoadoutFor(methodId, level);
        for (const [slot, itemId] of Object.entries(suggested)) {
          if (!itemId) continue;
          f.state.garage.owned.push(itemId);
          assert.equal(f.progression.equip(slot, itemId).ok, true);
        }
        requireAcceptedImpact(f);
      } finally { f.close(); }
    });
  }
}

test('price-only suggestion is refused by public fit and an older fitted save is refused at career/start', async () => {
  const f = await fixture();
  try {
    const faultySuggestion = { ...defaultLoadoutFor(methodId, 60), hammer: VIBRO };
    const beforeFit = snapshot(f), fit = f.progression.equip('hammer', faultySuggestion.hammer);
    assert.equal(fit.ok, false);assert.equal(fit.code, 'unsupported-piling-hammer');
    assert.equal(snapshot(f), beforeFit, 'faulty suggestion cannot charge, equip, save, or emit');
    // Represent the old supported-by-catalogue fitting in a real serialized save.
    // Do not make the now-refused public API pretend to equip it.
    f.state.garage.loadout.hammer = VIBRO;
    assert.equal(f.progression.save(), true);
    f.state.garage.loadout.hammer = IMPACT;
    assert.equal(f.progression.load(), true);
    assert.equal(f.state.garage.loadout.hammer, VIBRO, 'load preserves an older fitted item');
    const beforeRefusal = snapshot(f);
    assert.throws(() => requireAcceptedImpact(f), /cannot start this drive/,
      'the end-to-end acceptance probe must reject the original defect');
    assert.equal(f.progression.run, null);
    assert.throws(() => f.sim.startHole(contract), error => error.code === 'unsupported-piling-hammer');
    assert.equal(snapshot(f), beforeRefusal, 'legacy acceptance and start refusal have no side effects');
  } finally { f.close(); }
});

test('a suggestion neither grants equipment nor bypasses the level gate', async () => {
  const f = await fixture({ level: 32, own: [] });
  try {
    const before = snapshot(f);
    assert.equal(defaultLoadoutFor(methodId, 32).hammer, null);
    assert.equal(f.progression.equip('hammer', IMPACT).ok, false);
    assert.equal(f.progression.previewContract(contract).ok, false);
    assert.equal(snapshot(f), before);
    f.state.player.level = 60;
    assert.equal(defaultLoadoutFor(methodId, 60).hammer, IMPACT);
    assert.deepEqual(f.progression.equip('hammer', IMPACT), { ok: false, reason: 'Not owned' });
  } finally { f.close(); }
});

test('automatic owned selection prefers an implemented drive and charges no purchase', async () => {
  const f = await fixture({ hammer: VIBRO });
  try {
    const money = f.state.player.money, owned = [...f.state.garage.owned];
    f.progression.autoLoadout(methodId);
    assert.equal(f.state.garage.loadout.hammer, IMPACT);
    assert.equal(f.state.player.money, money);
    assert.deepEqual(f.state.garage.owned, owned);
    requireAcceptedImpact(f);
  } finally { f.close(); }
});

test('unsupported-only inventory with an empty slot suggests purchase without fitting vibro', async () => {
  const f = await fixture({ own: [VIBRO] });
  try {
    const missing = f.progression.autoLoadout(methodId);
    assert.equal(f.state.garage.loadout.hammer, null);
    assert.equal(missing.hammer, IMPACT);
    assert.equal(f.state.garage.owned.includes(IMPACT), false);
  } finally { f.close(); }
});

test('unsupported-only fitted inventory is preserved and still refused without side effects', async () => {
  const f = await fixture({ own: [VIBRO], hammer: VIBRO });
  try {
    f.progression.autoLoadout(methodId);
    assert.equal(f.state.garage.loadout.hammer, VIBRO);
    const before = snapshot(f);
    const refused = f.progression.acceptContract(contract);
    assert.equal(refused.code, 'unsupported-piling-hammer');
    assert.throws(() => f.sim.startHole(contract), error => error.code === refused.code);
    assert.equal(snapshot(f), before);
    const money = f.state.player.money, owned = [...f.state.garage.owned];
    assert.equal(f.progression.equip('hammer', null).ok, true, 'legacy fitted item remains removable');
    assert.equal(f.state.garage.loadout.hammer, null);
    assert.deepEqual(f.state.garage.owned, owned);assert.equal(f.state.player.money, money);
  } finally { f.close(); }
});

test('public unsupported fitting and wrong bays or methods refuse without replacing impact', async () => {
  const f = await fixture({ hammer: IMPACT });
  try {
    const before = snapshot(f);
    const refused = f.progression.equip('hammer', VIBRO);
    assert.equal(refused.ok, false);assert.equal(refused.code, 'unsupported-piling-hammer');
    assert.equal(f.state.garage.loadout.hammer, IMPACT);
    assert.equal(snapshot(f), before);
    assert.equal(f.progression.equip('install', IMPACT).ok, false);
    const foreign = ITEMS.find(item => item.slot === 'hammer' && !item.methods.includes(methodId));
    assert.ok(foreign, 'non-piling hammer negative control exists');
    f.state.garage.owned.push(foreign.id);
    assert.equal(f.progression.equip('hammer', foreign.id).ok, false);
    f.state.garage.owned.pop();
    assert.equal(snapshot(f), before);
  } finally { f.close(); }
});

test('unrelated automatic hammer ranking is unchanged for an owned DTH inventory', async () => {
  const items = ITEMS.filter(item => item.slot === 'hammer' && item.methods.includes('dth'));
  const candidates = items.map(item => ({ item, merit: item.stats.ropMult * (item.stats.life || 1) }))
    .sort((a, b) => b.merit - a.merit);
  assert.ok(candidates.length > 1);
  const f = await fixture({ rigId: getMethod('dth').rigIds[0], own: items.map(item => item.id) });
  try {
    f.progression.autoLoadout('dth');
    assert.equal(f.state.garage.loadout.hammer, candidates[0].item.id);
  } finally { f.close(); }
});

test('cold module imports work in either dependency entry order', () => {
  for (const order of [
    ['src/game/data.js', 'src/game/progression.js', 'src/sim/drilling.js'],
    ['src/sim/drilling.js', 'src/game/progression.js', 'src/game/data.js'],
  ]) {
    const urls = order.map(path => new URL('../' + path, import.meta.url).href);
    const script = `for (const url of ${JSON.stringify(urls)}) await import(url);`;
    execFileSync(process.execPath, ['--input-type=module', '-e', script], { stdio: 'pipe' });
  }
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
console.log(`Default loadout adversarial: PASS ${passed} cases; real career/start boundaries, regression injection and fresh import orders.`);
