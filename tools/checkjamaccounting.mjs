#!/usr/bin/env node
// Actual sim/progression event integration plus the extracted Site observer.
// Text sinks replace rendering; QA ground/god mode reach repeatable jams.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAst } from 'rollup/parseAst';
import { createGameState, createBus, makeRandom, SCENES, EVENTS } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';

assert.equal(process.argv.length, 2, 'No ignored options');
const source = readFileSync(new URL('../src/ui/screens/site.js', import.meta.url), 'utf8');
const observers = [];
function walk(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'Property' && node.method && node.key?.name === 'onJamCleared') observers.push(node);
  for (const v of Object.values(node)) Array.isArray(v) ? v.forEach(walk) : walk(v);
}
walk(parseAst(source)); assert.equal(observers.length, 1, 'one actual Site observer');
const observerSource = source.slice(observers[0].start, observers[0].end);
const makeObserver = new Function('state', `const notices=[], journal=[];
  const setAction=()=>{}, say=(...args)=>notices.push(args), log=(...args)=>journal.push(args);
  return { ...({${observerSource}}), notices, journal };`);
const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const warnings = [], warn = console.warn;
console.warn = (...args) => warnings.push(args.map(String).join(' '));
function memory() {
  const rows = new Map();
  return { getItem: key => rows.get(key) ?? null,
    setItem: (key, value) => rows.set(key, String(value)), removeItem: key => rows.delete(key) };
}
async function fixture(store = memory()) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const ctx = { state: createGameState(), bus: createBus(), rand: makeRandom(21) };
  ctx.progression = createProgression(ctx); await ctx.progression.init();
  ctx.state.scene = SCENES.SITE;
  ctx.sim = createDrillSim(ctx); ctx.sim.init();
  const ui = makeObserver(ctx.state), events = [], offs = [];
  offs.push(ctx.bus.on(EVENTS.JAM_CLEARED, payload => { events.push(payload); ui.onJamCleared(payload); }));
  return { ...ctx, ctx, ui, events, store,
    close() { offs.forEach(off => off()); ctx.sim.dispose(); ctx.progression.dispose(); },
  };
}
function start(f) {
  const contract = f.state.contract || f.progression.getContracts().find(c => f.progression.previewContract(c).ok);
  assert.ok(contract, 'a generated starter contract is playable');
  if (!f.state.contract) assert.equal(f.progression.acceptContract(contract).ok, true);
  f.sim.startHole(contract); assert.equal(f.sim.active, true);
  f.sim.debug.forceStratum('granite'); f.sim.debug.godMode = true;
}
function advance(f, predicate) {
  for (let i = 0; i < 20000; i++) {
    if (predicate(f.sim.getTelemetry())) return i;
    f.sim.debug.stepFixed(1);
  }
  assert.fail('actual simulation did not reach the requested boundary');
}
function induce(f, target = 'stuck') {
  f.sim.setInput('feed', 1); f.sim.setInput('rotation', 1); f.sim.setInput('flush', 0);
  advance(f, t => t.jam.state === target);
  assert.equal(f.sim.getTelemetry().jam.state, target);
}
function relieve(f) {
  const events = f.events.length;
  f.sim.setInput('feed', 0); f.sim.setInput('rotation', .5); f.sim.setInput('flush', 1);
  advance(f, () => f.events.length > events);
  assert.equal(f.events.length, events + 1, 'one physical recovery emits one event');
  assert.equal(f.sim.getTelemetry().jam.state, 'free');
}
let passed = 0;
async function test(name, body) { await body(); passed++; console.log('PASS ' + name); }
try {
  await test('three legitimate recoveries in one accepted attempt each increment once with Site mounted', async () => {
    const f = await fixture();
    try {
      start(f); const attempt = f.sim.getTelemetry().attemptId;
      assert.ok(attempt > 0);
      for (let count = 1; count <= 3; count++) {
        induce(f); relieve(f);
        assert.equal(f.state.player.stats.jamsCleared, count);
        assert.equal(f.sim.getTelemetry().attemptId, attempt, 'later jam is in the same physical attempt');
      }
      assert.equal(f.ui.notices.filter(n => n[0] === 'String free').length, 3);
      assert.equal(f.ui.journal.filter(n => n[1] === 'String free').length, 3);
      assert.equal(f.progression.save(), true);
      assert.equal(JSON.parse(f.store.getItem(SAVE_KEY)).player.stats.jamsCleared, 3);
    } finally { f.close(); }
  });
  await test('binding relieved before a full stuck state also counts exactly once', async () => {
    const f = await fixture();
    try { start(f); induce(f, 'binding'); relieve(f); assert.equal(f.state.player.stats.jamsCleared, 1); }
    finally { f.close(); }
  });
  await test('a Site observer replay does not mutate career state or create a save request', async () => {
    const f = await fixture();
    try {
      start(f); induce(f); relieve(f); assert.equal(f.progression.save(), true);
      const before = JSON.stringify(f.progression.serialise());
      for (let i = 0; i < 10; i++) f.ui.onJamCleared(f.events[0]);
      assert.equal(JSON.stringify(f.progression.serialise()), before);
      assert.equal(f.progression.getSaveStatus().pending, false);
    } finally { f.close(); }
  });
  await test('simulation and Site alone cannot write career statistics when progression is disposed', async () => {
    const f = await fixture();
    try {
      start(f); f.progression.dispose(); induce(f); relieve(f);
      assert.equal(f.events.length, 1); assert.equal(f.state.player.stats.jamsCleared, 0);
      assert.equal(f.ui.notices.length, 1, 'display still receives its event');
    } finally { f.close(); }
  });
  await test('saved recovery count survives reload and a new actual attempt adds one further clearance', async () => {
    const store = memory(); const first = await fixture(store);
    try { start(first); induce(first); relieve(first); assert.equal(first.progression.save(), true); }
    finally { first.close(); }
    const second = await fixture(store);
    try {
      assert.equal(second.state.player.stats.jamsCleared, 1);
      start(second); induce(second); relieve(second); assert.equal(second.state.player.stats.jamsCleared, 2);
      assert.equal(second.progression.save(), true);
      assert.equal(JSON.parse(store.getItem(SAVE_KEY)).player.stats.jamsCleared, 2);
    } finally { second.close(); }
  });
  await test('existing clearance notifications without an accepted run retain their one-event accounting', async () => {
    const f = await fixture();
    try {
      assert.equal(f.state.contract, null);
      // Existing notifications have no unique jam ID. Distinct events must not
      // be collapsed by one shared attempt ID, depth or empty-payload shape.
      for (const payload of [{}, {}, { abandoned: 'hole' }, { abandoned: 'bolt' }]) f.bus.emit(EVENTS.JAM_CLEARED, payload);
      assert.equal(f.state.player.stats.jamsCleared, 4);
    } finally { f.close(); }
  });
} finally {
  console.warn = warn;
  if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage); else delete globalThis.localStorage;
}
console.log(`Jam accounting: ${passed} groups passed; ${warnings.length} expected fixture diagnostics.`);
