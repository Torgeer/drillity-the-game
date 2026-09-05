#!/usr/bin/env node
/** Actual shell callbacks, results receipt reader and QA method extracted by
 * Vite's parser, executed with real progression, simulation and event bus.
 * The boundary is navigation recording, not a fake implementation of the UI.
 * This CPU gate makes no DOM, rendering, touch-size or performance claim.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseAst } from 'vite';
import { createGameState, createBus, makeRandom, EVENTS, SCENES, clamp } from '../src/core/contract.js';
import { GRADES } from '../src/ui/screens/catalog.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { makeContract } from '../src/game/data.js';

assert.equal(process.argv.length, 2, 'Unknown gate arguments');
const sources = Object.fromEntries(['src/ui/shell.js', 'src/ui/screens/results.js', 'src/main.js']
  .map((path) => [path, fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8')]));
const extracted = [];
function extract(path, predicate, label) {
  const matches = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (predicate(node)) matches.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
    }
  }
  walk(parseAst(sources[path]));
  assert.equal(matches.length, 1, label + ' must identify one actual implementation');
  const node = matches[0], source = sources[path].slice(node.start, node.end);
  extracted.push({ path, label, line: sources[path].slice(0, node.start).split('\n').length,
    sha256: crypto.createHash('sha256').update(source).digest('hex') });
  return source;
}
function handler(event) {
  const call = extract('src/ui/shell.js', (n) => n.type === 'CallExpression'
    && n.callee?.name === 'on' && n.arguments[0]?.object?.name === 'EVENTS'
    && n.arguments[0]?.property?.name === event, event);
  return call.slice(call.indexOf(',') + 1, -1);
}
const callbacks = ['HOLE_COMPLETE', 'SCENE_CHANGE', 'LEVEL_UP'].map(handler);
const wire = new Function('ctx', 'show', 'SCENES', 'queueMicrotask', `
  const state=ctx.state, current=null, CAT={roleAt:()=>null};
  const haptic=()=>{}, toast=()=>{};
  let disposed=false, holeSettling=false, completionCallbacks=0, pendingLevelUp=null;
  return { callbacks:[${callbacks.join(',')}], dispose:()=>{disposed=true},
    settling:()=>({holeSettling,completionCallbacks,pendingLevelUp}) };
`);
const readerSource = extract('src/ui/screens/results.js',
  (n) => n.type === 'FunctionDeclaration' && n.id?.name === 'lastSettlement', 'results receipt reader');
const reader = new Function('app', `return (${readerSource});`);
const summaryParts = ['buildSummary', 'fmtSpan'].map((name) => extract('src/ui/screens/results.js',
  (n) => n.type === 'FunctionDeclaration' && n.id?.name === name, name));
const summaryConstants = ['GRADE_BANDS', 'COST_LINES', 'pct', 'obj', 'plural'].map((name) =>
  extract('src/ui/screens/results.js', (n) => n.type === 'VariableDeclaration'
    && n.declarations.some((d) => d.id?.name === name), name));
const summary = new Function('app', 'clamp', 'GRADES', `
  const state=app.ctx.state; let warnedUnscored=false, warnedGrade=false;
  ${summaryConstants.join('\n')} ${readerSource} ${summaryParts.join('\n')}
  return buildSummary;
`);
const qaSource = extract('src/main.js', (n) => n.type === 'Property'
  && n.method && n.key?.name === 'showResults', 'QA showResults');
const qaMethod = new Function('ctx', 'SCENES', 'EVENTS', `return ({${qaSource}}).showResults;`);

const tests = [], contexts = [];
const test = (name, fn) => tests.push({ name, fn });
const drain = () => new Promise((resolve) => queueMicrotask(resolve));
function contract(holes = 3) {
  const rand = makeRandom(20260906);
  for (let i = 0; i < 1000; i++) {
    const c = makeContract('nordic', 1, rand);
    if (c.holes === holes) return c;
  }
  throw new Error('No generated fixture for ' + holes + ' holes');
}
function storage() {
  const entries = new Map();
  return { getItem: (k) => entries.get(k) ?? null,
    setItem: (k, v) => entries.set(k, String(v)), removeItem: (k) => entries.delete(k) };
}
async function fresh(holes = 3) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage() });
  const ctx = { state: createGameState(), bus: createBus(), rand: makeRandom(5), SCENES };
  const shows = [], emissions = [];
  const bridge = wire(ctx, (scene, params) => {
    shows.push({ scene, params }); ctx.state.scene = scene;
  }, SCENES, queueMicrotask);
  ['HOLE_COMPLETE', 'SCENE_CHANGE', 'LEVEL_UP'].forEach((event, i) =>
    ctx.bus.on(EVENTS[event], bridge.callbacks[i]));
  // This is the production subscription order: UI before progression.init().
  ctx.progression = createProgression(ctx);
  await ctx.progression.init();
  ctx.sim = createDrillSim(ctx);
  ctx.bus.on(EVENTS.HOLE_COMPLETE, (payload) => emissions.push(payload));
  const c = contract(holes);
  assert.equal(ctx.progression.acceptContract(c).ok, true);
  ctx.state.scene = SCENES.SITE;
  const app = { ctx, normalizeContract: (value) => value, itemById: () => null };
  const result = { ...ctx, c, shows, emissions, bridge, read: reader(app),
    summarize: summary(app, clamp, GRADES), ctx };
  contexts.push(result);
  return result;
}
function start(t) {
  t.state.scene = SCENES.SITE;
  assert.ok(t.sim.startHole(t.state.contract));
  return { runId: t.progression.run.runId, attemptId: t.progression.run.attemptId };
}
function payload(t, identity) {
  return { contract: t.c, ...identity, depth: t.c.targetDepth, grade: 'B', timeSec: 60,
    breakdown: { time: { parSec: 60, actualSec: 60 } } };
}
function finish(t) {
  const before = t.emissions.length;
  t.sim.debug.stepFixed(60);
  t.sim.debug.setDepth(t.c.targetDepth);
  t.sim.debug.stepFixed(10);
  assert.equal(t.emissions.length, before + 1, 'Actual simulation must emit completion');
  return t.emissions.at(-1);
}
const book = (t) => JSON.stringify(t.progression.serialise());
function unpaid(t, p) { assert.equal(t.read(p), null); }
function shown(t, p, count = 1) {
  assert.equal(t.shows.length, count);
  assert.equal(t.shows.at(-1).scene, SCENES.RESULTS);
  assert.equal(t.shows.at(-1).params.result, p);
  assert.equal(t.read(p), t.state.player.career.ledger[0]);
}

test('stale attempt after restart does not navigate or mutate the career', async () => {
  const t = await fresh(), old = start(t); start(t);
  const p = payload(t, old), before = book(t);
  t.bus.emit(EVENTS.HOLE_COMPLETE, p); await drain();
  assert.equal(book(t), before); assert.equal(t.shows.length, 0); unpaid(t, p);
});
test('malformed completion values reject before any partial settlement', async () => {
  const t = await fresh(), before = book(t);
  for (const p of [undefined, null, 7, 'complete', [], true, false]) {
    assert.equal(t.progression.completeHole(p), null);
    t.bus.emit(EVENTS.HOLE_COMPLETE, p);
  }
  await drain(); assert.equal(book(t), before); assert.equal(t.shows.length, 0);
});
test('actual one-hole simulation produces one authenticated final results request', async () => {
  const t = await fresh(1); const identity = start(t), p = finish(t); await drain();
  shown(t, p); assert.equal(t.progression.run, null);
  assert.equal(t.read(p).runId, identity.runId); assert.equal(t.read(p).attemptId, identity.attemptId);
});
test('actual three-hole simulation shows each distinct paid hole exactly once', async () => {
  const t = await fresh();
  for (let i = 1; i <= 3; i++) {
    start(t); const p = finish(t); await drain(); shown(t, p, i);
    assert.equal(t.read(p).hole, i);
  }
  assert.equal(t.progression.run, null);
});
test('same-object and cloned completion replays do not reopen results', async () => {
  const t = await fresh(); start(t); const p = finish(t); await drain();
  const before = book(t); t.state.scene = SCENES.MENU; t.shows.length = 0;
  t.bus.emit(EVENTS.HOLE_COMPLETE, p);
  const clone = structuredClone(p); t.bus.emit(EVENTS.HOLE_COMPLETE, clone); await drain();
  assert.equal(book(t), before); assert.equal(t.shows.length, 0); unpaid(t, clone);
});
test('wrong contract, tokenless and partial identity never borrow an earlier receipt', async () => {
  const t = await fresh(); start(t); const accepted = finish(t); await drain(); start(t);
  t.shows.length = 0; const before = book(t);
  const attempts = [structuredClone(accepted), { ...accepted, contract: { id: 'wrong' } }];
  const noRun = { ...accepted }; delete noRun.runId;
  const noAttempt = { ...accepted }; delete noAttempt.attemptId;
  const tokenless = { ...noRun }; delete tokenless.attemptId;
  for (const p of [...attempts, noRun, noAttempt, tokenless]) {
    t.bus.emit(EVENTS.HOLE_COMPLETE, p); unpaid(t, p);
  }
  await drain(); assert.equal(book(t), before); assert.equal(t.shows.length, 0);
});
test('reused payload object cannot change an old receipt to a new identity', async () => {
  const t = await fresh(); start(t); const p = finish(t); await drain();
  const old = t.read(p), next = start(t); Object.assign(p, next);
  unpaid(t, p); assert.notEqual(old.attemptId, next.attemptId);
  t.shows.length = 0; t.bus.emit(EVENTS.HOLE_COMPLETE, p); await drain();
  shown(t, p); assert.notEqual(t.read(p), old); assert.equal(old.hole, 1);
});
test('payload mutated after acceptance cannot authenticate queued old navigation', async () => {
  const t = await fresh(); start(t); const p = finish(t);
  p.attemptId += 1000; await drain();
  unpaid(t, p); assert.equal(t.shows.length, 0); assert.equal(t.state.player.career.ledger.length, 1);
});
test('receipt exists during queued money observers; stale reentrant events do not steal level-up', async () => {
  const t = await fresh(); const identity = start(t), p = payload(t, identity);
  let inspected = 0, lastLevel = null;
  t.bus.on(EVENTS.LEVEL_UP, (event) => { lastLevel = event.level; });
  t.bus.on(EVENTS.MONEY_CHANGE, () => {
    if (inspected++) return;
    assert.equal(t.read(p), t.state.player.career.ledger[0]);
    t.bus.emit(EVENTS.LEVEL_UP, { level: 9 });
    t.bus.emit(EVENTS.HOLE_COMPLETE, { ...p, attemptId: p.attemptId - 1 });
  });
  t.bus.emit(EVENTS.HOLE_COMPLETE, p); await drain(); shown(t, p);
  assert.ok(inspected > 0); assert.equal(t.shows[0].params.levelUp.level, lastLevel);
  assert.deepEqual(t.bridge.settling(), { holeSettling: false, completionCallbacks: 0, pendingLevelUp: null });
});
test('a new attempt begun by a settlement observer suppresses the old navigation', async () => {
  const t = await fresh(); const p = payload(t, start(t)); let restarted = false;
  t.bus.on(EVENTS.MONEY_CHANGE, () => { if (!restarted) { restarted = true; start(t); } });
  t.bus.emit(EVENTS.HOLE_COMPLETE, p); await drain();
  assert.ok(restarted); assert.ok(t.read(p)); assert.equal(t.shows.length, 0);
});
test('direct final-hole completion carries authenticated params on SCENE_CHANGE', async () => {
  const t = await fresh(1), p = payload(t, start(t));
  const s = t.progression.completeHole(p); shown(t, p); assert.equal(s, t.read(p));
});
test('a new job accepted by a final settlement observer cannot receive old results', async () => {
  const t = await fresh(1), p = payload(t, start(t)); let accepted = false;
  t.bus.on(EVENTS.MONEY_CHANGE, () => {
    if (!accepted) { accepted = true; assert.equal(t.progression.acceptContract(contract()).ok, true); }
  });
  t.progression.completeHole(p); assert.ok(accepted); assert.equal(t.shows.length, 0);
});
test('tokenless compatibility completion still has an authoritative receipt', async () => {
  const t = await fresh(), p = payload(t, {});
  t.bus.emit(EVENTS.HOLE_COMPLETE, p); await drain(); shown(t, p);
  assert.equal(t.read(p).attemptId, null);
});
test('tokenless compatibility may reuse an object only after an accepted new hole', async () => {
  const t = await fresh(), p = payload(t, {});
  t.bus.emit(EVENTS.HOLE_COMPLETE, p); await drain(); shown(t, p);
  const old = t.read(p); t.state.scene = SCENES.SITE;
  t.bus.emit(EVENTS.DRILL_START, { contract: t.c });
  t.bus.emit(EVENTS.HOLE_COMPLETE, p); await drain(); shown(t, p, 2);
  assert.notEqual(t.read(p), old); assert.equal(t.read(p).hole, 2);
});
test('reload invalidates in-memory receipts from the previous ledger', async () => {
  const t = await fresh(); start(t); const p = finish(t); await drain(); assert.ok(t.read(p));
  assert.equal(t.progression.save(), true); assert.equal(t.progression.load(), true); unpaid(t, p);
});
test('navigation away or UI disposal before microtask prevents delayed results', async () => {
  for (const disposal of [false, true]) {
    const t = await fresh(); start(t); finish(t);
    if (disposal) t.bridge.dispose(); else t.state.scene = SCENES.MENU;
    await drain(); assert.equal(t.shows.length, 0);
  }
});
test('actual QA method opens an explicit unpaid preview without emitting completion', async () => {
  const t = await fresh(); start(t); const p = finish(t); await drain();
  assert.ok(t.read(p)); assert.equal(t.read(p, true), null);
  t.shows.length = 0; const before = book(t), emissions = t.emissions.length;
  t.ctx.ui = { show: (scene, params) => t.shows.push({ scene, params }) };
  qaMethod(t.ctx, SCENES, EVENTS)(); await drain();
  assert.equal(book(t), before); assert.equal(t.emissions.length, emissions);
  assert.equal(t.shows.length, 1); assert.equal(t.shows[0].params.preview, true);
  assert.equal(t.read(t.shows[0].params.result, true), null);
});
test('actual results summary pays only its receipt; copied, stale and preview payloads stay unpaid', async () => {
  const t = await fresh(); start(t); const p = finish(t); await drain();
  const paid = t.summarize({ result: p }), receipt = t.read(p);
  assert.equal(paid.settled, true); assert.equal(paid.net, Math.round(receipt.net));
  assert.equal(paid.xp, Math.round(receipt.xp));
  for (const params of [{ result: structuredClone(p) }, { result: p, preview: true }, {}]) {
    const result = t.summarize(params);
    assert.equal(result.settled, false); assert.equal(result.net, null);
    assert.equal(result.xp, null); assert.deepEqual(result.items, []);
  }
});

const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const diagnostics = [], oldError = console.error;
console.error = (...args) => diagnostics.push(args.map(String).join(' '));
let passed = 0;
try {
  for (const { name, fn } of tests) { await fn(); passed++; console.log('PASS ' + name); }
  assert.deepEqual(diagnostics, [], 'Real bus callbacks must not hide exceptions');
  console.log(JSON.stringify({ scope: 'CPU actual callbacks/modules; no DOM or GPU', passed, extracted }, null, 2));
} finally {
  console.error = oldError;
  for (const t of contexts) { t.sim.dispose(); t.progression.dispose(); }
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
  else delete globalThis.localStorage;
}
