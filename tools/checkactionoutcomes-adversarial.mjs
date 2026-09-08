#!/usr/bin/env node
// Independent boundary review: execute the shipped site action functions with
// the real simulation. Only the UI sink is substituted. Delayed/malformed API
// responses are explicit fault injection; real phases are reached by stepping.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseAst } from 'vite';
import { createBus, createGameState, EVENTS, SCENES } from '../src/core/contract.js';
import { getMethod, defaultLoadoutFor } from '../src/game/data.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { SITE_ACTIONS } from '../src/ui/screens/catalog.js';

const file = new URL('../src/ui/screens/site.js', import.meta.url);
const source = readFileSync(file, 'utf8');
const sha = s => createHash('sha256').update(s).digest('hex');
const ast = parseAst(source), declarations = [], functions = [], methods = [];
function visit(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'VariableDeclaration') declarations.push(node);
  if (node.type === 'FunctionDeclaration') functions.push(node);
  if (node.type === 'Property' && node.method) methods.push(node);
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') visit(v);
  }
}
visit(ast);
function textOf(nodes, accepts) {
  const found = nodes.filter(accepts);
  assert.equal(found.length, 1, 'The gate must execute one real source definition');
  return source.slice(found[0].start, found[0].end);
}
const f = name => textOf(functions, n => n.id?.name === name);
const d = name => textOf(declarations, n => n.declarations.some(v => v.id?.name === name));
const m = name => textOf(methods, n => n.key?.name === name);
const build = new Function('ctx', 'EVENTS', 'SCENES', 'SITE_ACTIONS', `
  const state = ctx.state, notes = [], journal = [];
  const app = { bus: ctx.bus, haptic() {} }, feedSl = { set() {} };
  const say = (...v) => notes.push(v), log = (...v) => journal.push(v);
  const pushControl = () => {}, clearAlert = () => {}, resetWell = () => {}, resetProgramme = () => {};
  let actionMode = 'idle', actionTimer = 0, simTel = null;
  const setAction = v => { actionMode = v; };
  ${declarations.some(n => n.declarations.some(v => v.id?.name === 'leavePending')) ? d('leavePending') : ''}
  ${['actionEpoch', 'PULSE', 'PULSE_REFUSAL', 'PULSE_SUB', 'num', 'int'].map(d).join('\n')}
  ${['actionContext', 'actionContextIsCurrent', 'invalidateActionOutcomes', 'actionRefused', 'startBitChange', 'settleActionOutcomes', 'doAction', 'firePulse', 'bailerBeat', 'simAction'].map(f).join('\n')}
  return { notes, journal, act(mode) { actionMode = mode; return doAction(); },
    liveAction() { simTel = ctx.sim.getTelemetry(); return simAction(); },
    pulse: firePulse, poll() { settleActionOutcomes(ctx.sim.getTelemetry()); },
    invalidate: invalidateActionOutcomes, unmount: ({ ${m('unmount')} }).unmount,
    rod: ({ ${m('onRod')} }).onRod, bail: bailerBeat,
    stop: ({ ${m('onDrillStop')} }).onDrillStop };
`);

const cases = [], fixtures = [];
const test = (name, run) => cases.push({ name, run });
function fixture(methodId = 'top-hammer') {
  const method = getMethod(methodId), state = createGameState(), bus = createBus();
  state.scene = SCENES.SITE;
  state.garage.rigId = method.rigIds[0];
  state.garage.loadout = defaultLoadoutFor(methodId, 60);
  const contract = state.contract = { id: 'critic-actions', methodId, method,
    holes: 1, targetDepth: 40, seed: 3001, ground: ['chalk'], difficulty: 0,
    archetype: method.archetypes[0], flushMedium: method.flushMedium };
  let attempt = 0;
  const ctx = { state, bus, progression: { beginHole: () => ({ runId: 'critic-run', attemptId: ++attempt }) } };
  const sim = ctx.sim = createDrillSim(ctx);
  sim.startHole(contract); sim.debug.forceStratum('chalk');
  const ui = build(ctx, EVENTS, SCENES, SITE_ACTIONS);
  bus.on(EVENTS.ROD_ADDED, ui.rod);
  bus.on(EVENTS.BAILER_RUN, ui.bail);
  bus.on(EVENTS.DRILL_STOP, ui.stop);
  const result = { ctx, state, bus, sim, ui, contract };
  fixtures.push(result);
  return result;
}
const notices = x => x.ui.notes.map(v => v.join(' ')).join('\n');
const journal = x => x.ui.journal.map(v => v[1]).join('\n');
function advance(x, predicate, max = 18000) {
  for (let i = 0; i < max; i++) {
    if (predicate(x.sim.getTelemetry())) return;
    x.sim.debug.stepFixed(1);
  }
  throw Error('Real simulation failed to reach requested phase');
}

test('a trip already started elsewhere is refused without claiming another start', async () => {
  const x = fixture(); x.sim.debug.setDepth(3);
  const original = x.sim.changeBit();
  assert.equal(x.sim.getTelemetry().phase, 'tripping-out');
  await x.ui.act('trip');
  assert.match(notices(x), /busy/);
  assert.doesNotMatch(notices(x), /Changing bit|Bit change complete/);
  assert.equal(x.ui.journal.length, 0);
  x.sim.abortHole('critic-cleanup'); await original;
});

test('the genuine trip cannot announce completion during bit-swap or tripping-in', async () => {
  const x = fixture(); x.sim.debug.setDepth(3);
  const pending = x.ui.act('trip');
  for (const phase of ['bit-swap', 'tripping-in']) {
    advance(x, t => t.phase === phase);
    await Promise.resolve();
    assert.doesNotMatch(notices(x), /Bit change complete/);
  }
  advance(x, t => t.phase === 'drilling'); await pending;
  assert.equal(x.ui.notes.filter(v => v[0] === 'Bit change complete').length, 1);
});

test('undefined, empty, false and explicit refused API results cannot become success', async () => {
  for (const result of [undefined, {}, false, {ok: false, reason: 'stuck'}]) {
    const x = fixture();
    x.sim.changeBit = () => Promise.resolve(result);
    await x.ui.act('trip');
    assert.match(notices(x), /Not yet/);
    assert.equal(x.ui.journal.length, 0);
    assert.doesNotMatch(notices(x), /Changing bit|complete Back in/);
  }
});

test('late rejection after navigation produces no stale user notice', async () => {
  const x = fixture(); let reject;
  x.sim.changeBit = () => new Promise((_, no) => { reject = no; });
  const pending = x.ui.act('trip');
  x.ui.unmount(); x.state.scene = SCENES.RESULTS;
  reject(Error('delayed critic rejection')); await pending;
  assert.equal(x.ui.notes.length, 0);
  assert.equal(x.ui.journal.length, 0);
});

test('same scene and contract with a replacement physical attempt suppresses a late success', async () => {
  const x = fixture(); let resolve;
  x.sim.changeBit = () => new Promise(yes => { resolve = yes; });
  const pending = x.ui.act('trip');
  const old = x.sim.getTelemetry().attemptId;
  x.sim.startHole(x.contract);
  assert.notEqual(x.sim.getTelemetry().attemptId, old);
  resolve({ok: true}); await pending;
  assert.equal(x.ui.notes.length, 0);
  assert.equal(x.ui.journal.length, 0);
});

test('settling an invalidated promise cannot clear the newer pending operation', async () => {
  const x = fixture(), resolve = [];
  x.sim.changeBit = () => new Promise(yes => resolve.push(yes));
  const old = x.ui.act('trip');
  x.ui.invalidate();
  const current = x.ui.act('trip');
  resolve[0]({ok: true}); await old;
  assert.equal(x.ui.notes.length, 0);
  resolve[1]({ok: true}); await current;
  assert.equal(x.ui.notes.filter(v => v[0] === 'Bit change complete').length, 1);
});

test('a refused promise clears pending state so a later genuine trip can start', async () => {
  const x = fixture(), realChange = x.sim.changeBit;
  x.sim.changeBit = () => Promise.resolve({ok: false, reason: 'busy:rod-add'});
  await x.ui.act('trip');
  x.sim.changeBit = realChange;
  const retry = x.ui.act('trip');
  assert.equal(x.sim.getTelemetry().phase, 'tripping-out');
  advance(x, t => t.phase === 'drilling'); await retry;
  assert.equal(x.ui.notes.filter(v => v[0] === 'Bit change complete').length, 1);
});

test('missing simulation action APIs report refusal without success fallback', async () => {
  for (const [mode, method] of [['trip', 'changeBit'], ['casing', 'setCasing'], ['rod', 'pulse']]) {
    const x = fixture();
    x.sim[method] = undefined;
    await x.ui.act(mode);
    assert.match(notices(x), /Not yet/);
    assert.equal(x.ui.journal.length, 0);
  }
});

test('turning casing off during a real run cannot announce casing completed', () => {
  const x = fixture('rotary-kelly'); x.sim.debug.setDepth(3);
  x.ui.act('casing');
  x.sim.setCasing(false);
  advance(x, t => t.phase === 'drilling');
  x.ui.poll(); x.ui.poll();
  assert.equal(x.sim.getTelemetry().casingOn, false);
  assert.match(notices(x), /Casing interrupted/);
  assert.doesNotMatch(journal(x), /run complete/);
});

test('live cable-tool action uses the beat return and only its actual event announces bailing', () => {
  const x = fixture('cable-tool');
  x.sim.debug.setDepth(x.sim.getTelemetry().rodLength - .00001);
  x.sim.setInput('feed', .5); x.sim.setInput('rotation', .5);
  advance(x, t => t.phase === 'bailing-run');
  assert.equal(x.ui.liveAction(), 'beat');
  x.ui.act(x.ui.liveAction());
  assert.match(notices(x), /Missed the window/);
  assert.doesNotMatch(notices(x), /Bailer out|Rod connected/);
  advance(x, t => t.phase === 'drilling');
  assert.equal(x.ui.notes.filter(v => v[0] === 'Bailer out').length, 1);
  assert.doesNotMatch(notices(x), /Rod connected/);
});

test('rod completion after leaving SITE makes no offscreen announcement', () => {
  const x = fixture();
  x.sim.debug.setDepth(x.sim.getTelemetry().rodLength - .00001);
  x.sim.setInput('feed', .5); x.sim.setInput('rotation', .5); x.sim.setInput('flush', 1);
  advance(x, t => t.phase === 'rod-add');
  x.ui.unmount(); x.state.scene = SCENES.CONTRACTS;
  advance(x, t => t.phase === 'drilling');
  assert.equal(x.ui.notes.length, 0);
  assert.equal(x.ui.journal.length, 0);
});

test('synchronous termination and result navigation cannot leave action feedback on the replacement screen', () => {
  const x = fixture('site-investigation');
  x.state.garage.rigId = 'cpt-unit';
  x.state.garage.loadout.probe = 'cpt-piezocone';
  x.sim.startHole(x.contract);
  assert.equal(x.sim.getTelemetry().programme.mode, 'cpt');
  x.bus.on(EVENTS.HOLE_COMPLETE, () => { x.ui.unmount(); x.state.scene = SCENES.RESULTS; });
  x.ui.pulse('terminate');
  assert.equal(x.state.scene, SCENES.RESULTS);
  assert.equal(x.ui.notes.length, 0);
  assert.equal(x.ui.journal.length, 0);
});

let failed = 0;
try {
  for (const {name, run} of cases) {
    try { await run(); console.log('PASS ' + name); }
    catch (error) { failed++; console.error('FAIL ' + name + '\n' + error.stack); }
  }
} finally { for (const x of fixtures) x.sim.dispose(); }
assert.equal(sha(readFileSync(file, 'utf8')), sha(source), 'Source changed during adversarial run');
console.log(JSON.stringify({passed: cases.length - failed, failed, sourceSha256: sha(source)}));
if (failed) process.exitCode = 1;
