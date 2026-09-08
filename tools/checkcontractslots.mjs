#!/usr/bin/env node
/**
 * Contract Book behaviour through the actual progression, skill purchases,
 * regional generator and save/load boundary. Storage is the only browser double.
 * Run: node tools/checkcontractslots.mjs
 * This is a CPU gate; the shell-provider gate separately covers UI authority.
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { LEVELS, REGIONS, getMethod, getSkill } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';

assert.equal(process.argv.length, 2, 'Unknown contract-slot gate argument');
const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const instances = [];
const tests = [];
const BOOK = 'sl.contract-book';
const ordinary = (board) => board.filter((contract) => !contract.emergency);

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

async function fresh(store = memoryStorage()) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState();
  const bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(20260908) });
  await progression.init();
  instances.push(progression);
  return { state, progression, store };
}

function unlockBook(ctx) {
  const { progression, state } = ctx;
  progression.addXP(LEVELS.cumulative[22] - state.player.xp, 'Contract-slot gate fixture');
  assert.equal(state.player.level, 23);
  for (const id of ['sl.negotiator', 'sl.logistics']) {
    assert.equal(progression.spendSkillPoint(id).ok, true, `Buy prerequisite ${id}`);
  }
}

function buyAll(ctx) {
  unlockBook(ctx);
  for (let rank = 0; rank < getSkill(BOOK).maxRank; rank++) {
    assert.equal(ctx.progression.spendSkillPoint(BOOK).ok, true);
  }
}

function test(name, fn) { tests.push({ name, fn }); }

test('each successful purchased rank adds one ordinary offer immediately', async () => {
  const ctx = await fresh();
  unlockBook(ctx);
  const points = ctx.state.player.skillPoints;
  let spent = 0;
  assert.equal(ctx.progression.getContracts().length, 5);
  for (let rank = 1; rank <= 3; rank++) {
    const previous = ctx.progression.getContracts();
    const purchase = ctx.progression.spendSkillPoint(BOOK);
    assert.equal(purchase.ok, true);
    spent += purchase.cost;
    const board = ctx.progression.getContracts();
    assert.equal(ordinary(board).length, 5 + rank);
    assert.notStrictEqual(board, previous, 'Existing cache must not conceal purchased slots');
    assert.strictEqual(ctx.progression.getContracts(), board, 'Unchanged reads retain the offers');
  }
  assert.equal(spent, 12);
  assert.equal(ctx.state.player.skillPoints, points - spent);
});

test('failed purchases and unrelated skills do not reshuffle or expand offers', async () => {
  const ctx = await fresh();
  const starter = ctx.progression.getContracts();
  assert.equal(ctx.progression.spendSkillPoint(BOOK).ok, false);
  assert.strictEqual(ctx.progression.getContracts(), starter);
  buyAll(ctx);
  const maxed = ctx.progression.getContracts();
  assert.equal(ctx.progression.spendSkillPoint(BOOK).ok, false);
  assert.strictEqual(ctx.progression.getContracts(), maxed);
  assert.equal(ctx.progression.spendSkillPoint('sl.logistics').ok, true);
  assert.strictEqual(ctx.progression.getContracts(), maxed);
});

test('explicit base counts participate in the cache and retain the purchased bonus', async () => {
  const ctx = await fresh();
  buyAll(ctx);
  const full = ctx.progression.getContracts();
  assert.equal(full.length, 8);
  const small = ctx.progression.getContracts(2);
  assert.equal(small.length, 5);
  assert.notStrictEqual(small, full);
  assert.strictEqual(ctx.progression.getContracts(2), small);
  assert.equal(ctx.progression.getContracts(0).length, 3);
  assert.equal(ctx.progression.getContracts().length, 8);
});

test('invalid requested counts use the ordinary five-offer default', async () => {
  const ctx = await fresh();
  buyAll(ctx);
  const board = ctx.progression.getContracts();
  for (const count of [NaN, Infinity, -1, 2.5, '2', null, 6, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 3]) {
    assert.strictEqual(ctx.progression.getContracts(count), board, `Invalid count ${String(count)}`);
  }
});

test('a rescue is additional to all eight purchased ordinary offers', async () => {
  const ctx = await fresh();
  buyAll(ctx);
  const normal = ctx.progression.getContracts();
  ctx.progression.addMoney(-ctx.state.player.money - 250, 'Debt fixture');
  const rescue = ctx.progression.getContracts();
  assert.equal(rescue.length, 9);
  assert.equal(rescue[0].emergency, true);
  assert.deepEqual(ordinary(rescue), normal);
  assert.equal(ctx.progression.getContracts(2).length, 6);
  ctx.progression.addMoney(10000, 'Recovery fixture');
  assert.equal(ctx.progression.getContracts().length, 8);
  assert.equal(ctx.progression.getContracts().some((contract) => contract.emergency), false);
});

test('refresh regenerates a full skilled board and reload preserves the purchased ranks', async () => {
  const ctx = await fresh();
  buyAll(ctx);
  const first = ctx.progression.getContracts();
  const refreshed = ctx.progression.refreshContracts();
  assert.equal(refreshed.length, 8);
  assert.notDeepEqual(refreshed.map((contract) => contract.id), first.map((contract) => contract.id));
  assert.equal(ctx.progression.save(), true);
  ctx.progression.dispose();
  const loaded = await fresh(ctx.store);
  assert.equal(loaded.progression.skillRank(BOOK), 3);
  assert.equal(loaded.state.player.skillPoints, ctx.state.player.skillPoints);
  assert.equal(loaded.progression.getContracts().length, 8);
  assert.equal(loaded.progression.refreshContracts().length, 8);
});

test('region and level still invalidate the cache, without removing locked offers', async () => {
  const ctx = await fresh();
  buyAll(ctx);
  const level23 = ctx.progression.getContracts();
  ctx.progression.addXP(LEVELS.totalToMax - ctx.state.player.xp, 'Regional level fixture');
  const level60 = ctx.progression.getContracts();
  assert.notStrictEqual(level60, level23);
  assert.equal(level60.length, 8);
  let locked = 0;
  // Place the player at each fixture region; travel fees/certificates are not
  // bypassed as a game action. This exercises generation for the current region.
  for (const region of REGIONS) {
    ctx.state.world.regionId = region.id;
    const board = ctx.progression.getContracts();
    assert.equal(board.length, 8, `${region.id}: a full ordinary board`);
    assert.strictEqual(ctx.progression.getContracts(), board);
    for (const contract of board) {
      assert.equal(contract.regionId, region.id);
      assert.ok(getMethod(contract.methodId).unlockLevel <= ctx.state.player.level);
      assert.ok(Array.isArray(contract.requiredCerts));
      if (!ctx.progression.hasCerts(contract.requiredCerts)) locked++;
    }
  }
  assert.ok(locked > 0, 'Locked offers remain visible instead of consuming purchased slots through filtering');
});

test('loading a lower-rank save clears a previously larger board', async () => {
  const ctx = await fresh();
  unlockBook(ctx);
  assert.equal(ctx.progression.save(), true);
  for (let rank = 0; rank < 3; rank++) assert.equal(ctx.progression.spendSkillPoint(BOOK).ok, true);
  assert.equal(ctx.progression.getContracts().length, 8);
  assert.equal(ctx.progression.load(), true);
  assert.equal(ctx.progression.skillRank(BOOK), 0);
  assert.equal(ctx.progression.getContracts().length, 5);
});

try {
  for (const { name, fn } of tests) {
    await fn();
    console.log(`PASS ${name}`);
    for (const progression of instances.splice(0)) progression.dispose();
  }
  console.log(`Contract slots: ${tests.length} behavioural cases passed.`);
} finally {
  for (const progression of instances) progression.dispose();
  if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
  else delete globalThis.localStorage;
}
