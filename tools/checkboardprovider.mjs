#!/usr/bin/env node
/**
 * Exercise the shipping shell's exact board-provider method with real data,
 * progression and in-memory storage. No DOM, browser, server or GPU.
 * Run: node tools/checkboardprovider.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import * as game from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';

assert.equal(process.argv.length, 2, 'Unknown board-provider gate argument');
const source = readFileSync(new URL('../src/ui/shell.js', import.meta.url), 'utf8');
const methods = [...source.matchAll(/    _rawContracts\(\) \{[\s\S]*?\n    \},/g)];
assert.equal(methods.length, 1, 'Exactly one actual shell provider must be extracted');
const method = methods[0][0];
function shell(ctx, state, body = method) {
  // The actual method closes over these three shell bindings. Retain its
  // cache between calls instead of implementing a parallel test provider.
  return new Function('ctx', 'state', `let boardCache = null; return ({${body}});`)(ctx, state);
}
const savedStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const reports = [];
const fixtures = [];
async function career(money = 4500) {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  const state = createGameState(), bus = createBus(), rand = makeRandom(20260908);
  const ctx = { state, bus, rand, game };
  const progression = createProgression(ctx);
  ctx.progression = progression;
  await progression.init();
  progression.addMoney(money - state.player.money, 'board-provider fixture balance');
  const fixture = { ctx, state, progression, storage, provider: shell(ctx, state) };
  fixtures.push(fixture);
  return fixture;
}
function test(name, fn) {
  return Promise.resolve().then(fn).then(detail => reports.push({ name, pass: true, ...detail }));
}
function rescueOn(board) {
  assert.ok(Array.isArray(board), 'Provider must return an array');
  const rescues = board.filter(contract => contract.emergency === true);
  assert.equal(rescues.length, 1, 'The real career recovery card must reach the UI');
  return rescues[0];
}
function select(fixture, contract) {
  const result = fixture.progression.acceptContract(contract);
  assert.equal(result.ok, true, result.reason);
  assert.deepEqual(fixture.state.contract, contract, 'Selection accepts the displayed work and economics');
  assert.equal(fixture.progression.run.contract, fixture.state.contract, 'State and run share the accepted snapshot');
  if (contract.emergency === true) {
    assert.notEqual(fixture.state.contract, contract, 'A recovery posting is snapshotted before acceptance');
    assert.equal(Object.isFrozen(fixture.state.contract), true, 'Accepted recovery terms are immutable');
  }
  return result;
}

try {
  await test('ready content board remains available before progression exists', () => {
    const state = createGameState();
    const ready = game.makeContractBoard('nordic', 1, makeRandom(1234));
    const ctx = { game: { ...game, contracts: ready }, rand: makeRandom(1234) };
    assert.equal(shell(ctx, state)._rawContracts(), ready);
    return { cards: ready.length };
  });
  await test('real content generation stays cached before progression exists', () => {
    const state = createGameState();
    let calls = 0;
    const ctx = { game: { ...game, makeContractBoard(...args) {
      calls++; return game.makeContractBoard(...args);
    } }, rand: makeRandom(1234) };
    const provider = shell(ctx, state), first = provider._rawContracts();
    assert.ok(first.length > 0);
    assert.equal(provider._rawContracts(), first);
    assert.equal(calls, 1);
    return { cards: first.length, generatorCalls: calls };
  });
  await test('missing content and progression returns an empty board', () => {
    assert.deepEqual(shell({}, createGameState())._rawContracts(), []);
  });
  await test('normal real career owns board selection even with a ready content board', async () => {
    const f = await career();
    const decoy = game.makeContractBoard('nordic', 1, makeRandom(91));
    f.ctx.game = { ...game, contracts: decoy };
    const expected = f.progression.getContracts(), shown = f.provider._rawContracts();
    assert.equal(shown, expected);
    assert.notEqual(shown, decoy);
    assert.equal(shown.filter(contract => contract.emergency).length, 0);
    const chosen = shown.find(contract => f.progression.previewContract(contract).ok);
    assert.ok(chosen, 'An actual starter board offers selectable work');
    select(f, chosen);
    return { cards: shown.length, selected: chosen.id };
  });
  for (const money of [0, -250]) {
    await test(`real recovery card is displayed and selectable at EUR ${money}`, async () => {
      const f = await career(money), shown = f.provider._rawContracts(), rescue = rescueOn(shown);
      const before = f.state.player.money;
      select(f, rescue);
      assert.equal(f.state.player.money, before, 'Local recovery never charges mobilisation');
      assert.equal(f.state.contract.emergency, true);
      return { cards: shown.length, selected: rescue.id, balance: before };
    });
  }
  await test('recovery appears and disappears with live balance without a shell cache reset', async () => {
    const f = await career(), ordinary = f.provider._rawContracts();
    f.progression.addMoney(-f.state.player.money, 'fixture reaches zero');
    const zero = f.provider._rawContracts();
    rescueOn(zero);
    assert.deepEqual(zero.filter(contract => !contract.emergency), ordinary);
    f.progression.addMoney(4500, 'fixture recovery');
    assert.equal(f.provider._rawContracts(), ordinary);
    return { normal: ordinary.length, zero: zero.length, recovered: ordinary.length };
  });
  await test('late progression installation supersedes the cached content fallback', async () => {
    const f = await career(0), progression = f.ctx.progression;
    delete f.ctx.progression;
    const early = f.provider._rawContracts();
    assert.equal(early.filter(contract => contract.emergency).length, 0);
    f.ctx.progression = progression;
    const live = f.provider._rawContracts();
    rescueOn(live);
    return { fallback: early.length, live: live.length };
  });
  await test('career board refresh reaches shell immediately', async () => {
    const f = await career(), before = f.provider._rawContracts();
    const refreshed = f.progression.refreshContracts();
    assert.notEqual(refreshed, before);
    assert.equal(f.provider._rawContracts(), refreshed);
  });
  await test('an intentionally empty authoritative board never falls back to content', async () => {
    const f = await career(), empty = [];
    f.ctx.progression = { getContracts: () => empty };
    assert.equal(f.provider._rawContracts(), empty);
  });
  await test('invalid or failed authoritative provider is reported without substituted contracts', async () => {
    const f = await career(), messages = [], warn = console.warn;
    console.warn = (...args) => messages.push(args);
    try {
      f.ctx.progression = { getContracts: () => ({ length: 5 }) };
      assert.deepEqual(f.provider._rawContracts(), []);
      f.ctx.progression = { getContracts() { throw new Error('Injected provider failure'); } };
      assert.deepEqual(f.provider._rawContracts(), []);
    } finally { console.warn = warn; }
    assert.equal(messages.length, 2);
    assert.match(messages[0][0], /invalid board/);
    assert.match(messages[1][0], /getContracts failed/);
  });
  await test('negative control catches content-first recovery suppression', async () => {
    const f = await career(0);
    // Remove only the production priority block: the unchanged real content
    // fallback reproduces the baseline masking failure in a mounted game.
    const contentFirst = method.replace(/      if \(typeof ctx\.progression\?\.getContracts === 'function'\) \{[\s\S]*?      const g = ctx\.game;/,
      '      const g = ctx.game;');
    assert.notEqual(contentFirst, method, 'Negative control must mutate the provider');
    const masked = shell(f.ctx, f.state, contentFirst)._rawContracts();
    assert.ok(masked.length > 0);
    assert.throws(() => rescueOn(masked), /real career recovery card/);
    return { maskedCards: masked.length, rescueCards: masked.filter(contract => contract.emergency).length };
  });
  console.log(JSON.stringify({ pass: true, cases: reports.length,
    shellSourceSHA256: createHash('sha256').update(source).digest('hex'), reports }, null, 2));
} finally {
  // Every fixture owns only memory storage. No actual browser save is touched.
  for (const f of fixtures) {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: f.storage });
    f.progression.dispose();
  }
  if (savedStorage) Object.defineProperty(globalThis, 'localStorage', savedStorage);
  else delete globalThis.localStorage;
}
