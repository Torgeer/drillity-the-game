#!/usr/bin/env node
/** Independent public-API and save-boundary checks for Contract Book. */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { LEVELS, REGIONS } from '../src/game/data.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';

assert.equal(process.argv.length, 2, 'This gate accepts no arguments');
const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const instances = [];
const failures = [];
let cases = 0;
const BOOK = 'sl.contract-book';
const normal = (board) => board.filter((job) => !job.emergency);

async function fresh() {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  const state = createGameState();
  const random = makeRandom(903162);
  let randomCalls = 0;
  // A generator-call budget makes a pathological count reproducible without
  // allocating an enormous board or hanging the test process.
  const rand = Object.fromEntries(Object.entries(random).map(([key, method]) => [key, (...args) => {
    assert.ok(++randomCalls <= 20000, 'Contract board exceeded 20,000 generator calls');
    return method(...args);
  }]));
  const progression = createProgression({ state, bus: createBus(), rand });
  instances.push(progression);
  await progression.init();
  return { state, progression, storage, resetBudget: () => { randomCalls = 0; } };
}

function buyBook(ctx, ranks = 3) {
  const { progression, state } = ctx;
  progression.addXP(LEVELS.cumulative[22] - state.player.xp, 'Critic prerequisite fixture');
  for (const id of ['sl.negotiator', 'sl.logistics']) {
    assert.equal(progression.spendSkillPoint(id).ok, true);
  }
  for (let i = 0; i < ranks; i++) assert.equal(progression.spendSkillPoint(BOOK).ok, true);
}

async function check(name, fn) {
  cases++;
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  } finally {
    for (const instance of instances.splice(0)) instance.dispose();
  }
}

try {
  await check('real purchases spend exactly 12 points and update the same live provider', async () => {
    const ctx = await fresh();
    buyBook(ctx, 0);
    const initialPoints = ctx.state.player.skillPoints;
    let previous = ctx.progression.getContracts();
    for (let rank = 1; rank <= 3; rank++) {
      assert.equal(ctx.progression.spendSkillPoint(BOOK).ok, true);
      const board = ctx.progression.getContracts();
      assert.equal(normal(board).length, 5 + rank);
      assert.notStrictEqual(board, previous);
      assert.strictEqual(ctx.progression.getContracts(), board);
      previous = board;
    }
    assert.equal(ctx.state.player.skillPoints, initialPoints - 12);
    assert.equal(ctx.progression.spendSkillPoint(BOOK).ok, false);
    assert.strictEqual(ctx.progression.getContracts(), previous);
  });

  await check('count changes, region changes and refresh retain the purchased bonus', async () => {
    const ctx = await fresh();
    buyBook(ctx);
    for (const count of [0, 1, 2, 5, 0, 5]) {
      ctx.resetBudget();
      const board = ctx.progression.getContracts(count);
      assert.equal(normal(board).length, count + 3);
      assert.strictEqual(ctx.progression.getContracts(count), board);
    }
    for (const region of REGIONS) {
      ctx.resetBudget();
      ctx.state.world.regionId = region.id; // Generator fixture, not a travel action.
      const board = ctx.progression.getContracts();
      assert.equal(normal(board).length, 8);
      assert.ok(board.every((job) => job.regionId === region.id));
    }
    ctx.resetBudget();
    const board = ctx.progression.getContracts();
    const refreshed = ctx.progression.refreshContracts();
    assert.notStrictEqual(refreshed, board);
    assert.equal(refreshed.length, 8);
  });

  await check('rescue entry cannot replace a paid slot, and does not regenerate ordinary jobs', async () => {
    const ctx = await fresh();
    buyBook(ctx);
    const board = ctx.progression.getContracts();
    ctx.progression.addMoney(-ctx.state.player.money - 1000, 'Critic debt fixture');
    const debt = ctx.progression.getContracts();
    assert.equal(debt.length, 9);
    assert.equal(debt.filter((job) => job.emergency).length, 1);
    assert.deepEqual(normal(debt), board);
    ctx.progression.addMoney(100000, 'Critic debt recovery fixture');
    assert.strictEqual(ctx.progression.getContracts(), board);
  });

  await check('save/load restores ranks and reset removes the bonus and stale cache', async () => {
    const ctx = await fresh();
    buyBook(ctx);
    assert.equal(ctx.progression.save(), true);
    const saved = ctx.storage.getItem(SAVE_KEY);
    const board = ctx.progression.getContracts();
    assert.equal(ctx.progression.reset(), true);
    assert.equal(ctx.progression.getContracts().length, 5);
    ctx.storage.setItem(SAVE_KEY, saved);
    assert.equal(ctx.progression.load(), true);
    assert.equal(ctx.progression.skillRank(BOOK), 3);
    const loaded = ctx.progression.getContracts();
    assert.equal(loaded.length, 8);
    assert.notStrictEqual(loaded, board);
  });

  for (const count of [NaN, Infinity, -Infinity, -1, 0.25, '8', null, {}, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 3]) {
    await check(`invalid/pathological base count ${String(count)} cannot create an unbounded board`, async () => {
      const ctx = await fresh();
      buyBook(ctx);
      ctx.resetBudget();
      const board = ctx.progression.getContracts(count);
      assert.equal(board.length, 8, 'Invalid counts should use the normal five-offer base');
    });
  }

  // These are actual JSON save payload values, not function/proxy injection.
  const malformedRanks = [null, -3, 1000000, 1.8, '3', 'not a rank', {}, [], [3], { valueOf: null, toString: null }];
  for (const rank of malformedRanks) {
    await check(`loaded Contract Book rank ${JSON.stringify(rank)} keeps a finite board`, async () => {
      const ctx = await fresh();
      buyBook(ctx);
      assert.equal(ctx.progression.save(), true);
      const payload = JSON.parse(ctx.storage.getItem(SAVE_KEY));
      payload.player.skills[BOOK] = rank;
      ctx.storage.setItem(SAVE_KEY, JSON.stringify(payload));
      assert.equal(ctx.progression.load(), true);
      const board = ctx.progression.getContracts();
      assert.ok(board.length >= 5 && board.length <= 8, `Expected 5..8 offers, got ${board.length}`);
      assert.strictEqual(ctx.progression.getContracts(), board);
    });
  }

  await check('malformed unrelated saved skill cannot take the contract board down', async () => {
    const ctx = await fresh();
    buyBook(ctx);
    assert.equal(ctx.progression.save(), true);
    const payload = JSON.parse(ctx.storage.getItem(SAVE_KEY));
    payload.player.skills['sl.negotiator'] = { valueOf: null, toString: null };
    ctx.storage.setItem(SAVE_KEY, JSON.stringify(payload));
    assert.equal(ctx.progression.load(), true);
    assert.equal(ctx.progression.getContracts().length, 8);
  });
} finally {
  for (const instance of instances.splice(0)) instance.dispose();
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
  else delete globalThis.localStorage;
}

console.log(`Contract slots adversarial: ${cases - failures.length}/${cases} cases passed.`);
if (failures.length) process.exitCode = 1;
