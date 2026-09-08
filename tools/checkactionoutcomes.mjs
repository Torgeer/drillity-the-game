#!/usr/bin/env node
/** Actual site handlers with real simulation returns/events. DOM notices are
 * captured at their boundary; no browser or WebGL, and no simulation-state
 * writes. Debug depth/ground fixtures only shorten the approach to an action.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseAst } from 'vite';
import { createBus, createGameState, SCENES, EVENTS } from '../src/core/contract.js';
import { getMethod, defaultLoadoutFor } from '../src/game/data.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { SITE_ACTIONS } from '../src/ui/screens/catalog.js';

const sourcePath = new URL('../src/ui/screens/site.js', import.meta.url);
const source = readFileSync(sourcePath, 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const nodes = [];
function walk(node) {
  if (!node || typeof node !== 'object') return;
  nodes.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') walk(value);
  }
}
walk(parseAst(source));
function extract(predicate) {
  const matches = nodes.filter(predicate);
  assert.equal(matches.length, 1, 'One actual source implementation');
  return source.slice(matches[0].start, matches[0].end);
}
const fn = name => extract(n => n.type === 'FunctionDeclaration' && n.id?.name === name);
const declaration = name => extract(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === name));
const method = name => extract(n => n.type === 'Property' && n.method && n.key?.name === name);
assert.ok(nodes.some(n => n.type === 'CallExpression' && n.callee?.object?.name === 'C'
  && n.callee?.property?.name === 'tap' && n.arguments[0]?.name === 'actionBtn'
  && source.slice(n.arguments[1].start, n.arguments[1].end).includes('doAction()')), 'Actual contextual button calls the tested handler');
for (const hook of ['mount', 'unmount', 'onDrillStop', 'destroy']) {
  assert.ok(method(hook).includes('invalidateActionOutcomes()'), `${hook} invalidates late feedback`);
}
assert.ok(fn('paint').includes('settleActionOutcomes(simTel)'), 'Actual paint consumes authoritative casing telemetry');
const factory = new Function('ctx', 'SCENES', 'EVENTS', 'SITE_ACTIONS', `
const state = ctx.state, notices = [], logs = [], app = { bus: ctx.bus, haptic() {} };
const say = (...args) => notices.push(args), log = (...args) => logs.push(args);
const feedSl = { set() {} }, pushControl = () => {}, simTel = null;
const clearAlert = () => {}, resetWell = () => {}, resetProgramme = () => {};
${nodes.some(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === 'leavePending')) ? declaration('leavePending') : ''}
let actionMode = 'idle', actionTimer = 0;
const setAction = mode => { actionMode = mode; };
${declaration('PULSE')}
${declaration('PULSE_REFUSAL')}
${declaration('PULSE_SUB')}
${declaration('num')}
${declaration('int')}
${declaration('actionEpoch')}
${['invalidateActionOutcomes','actionContext','actionContextIsCurrent','actionRefused','startBitChange','settleActionOutcomes','doAction','firePulse','bailerBeat'].map(fn).join('\n')}
const onRod = ({ ${method('onRod')} }).onRod;
return { notices, logs, act(mode) { actionMode = mode; return doAction(); },
  poll() { settleActionOutcomes(ctx.sim.getTelemetry()); }, pulse: firePulse, invalidate: invalidateActionOutcomes,
  onRod, onBailer: bailerBeat, onDrillStop: ({ ${method('onDrillStop')} }).onDrillStop,
  unmount: ({ ${method('unmount')} }).unmount, mode: () => actionMode };
`);

const fixtures = [], tests = [];
const test = (name, run) => tests.push({name, run});
function fresh(methodId = 'top-hammer') {
  const state = createGameState(), bus = createBus(), method = getMethod(methodId);
  state.scene = SCENES.SITE;
  state.garage.rigId = method.rigIds[0];
  state.garage.loadout = defaultLoadoutFor(methodId, 60);
  const contract = state.contract = { id: 'action-fixture', methodId, method,
    targetDepth: 20, holes: 1, seed: 4242, ground: ['chalk'], archetype: method.archetypes[0],
    flushMedium: method.flushMedium, difficulty: 0 };
  let attempts = 0;
  const ctx = { state, bus, progression: { beginHole: () => ({ runId: 'fixture-run', attemptId: ++attempts }) } };
  ctx.sim = createDrillSim(ctx);
  ctx.sim.startHole(contract);
  ctx.sim.debug.forceStratum('chalk');
  const ui = factory(ctx, SCENES, EVENTS, SITE_ACTIONS);
  bus.on(EVENTS.ROD_ADDED, ui.onRod);
  bus.on(EVENTS.BAILER_RUN, ui.onBailer);
  bus.on(EVENTS.DRILL_STOP, ui.onDrillStop);
  const f = {ctx, state, bus, sim: ctx.sim, ui, contract};
  fixtures.push(f);
  return f;
}
function until(f, predicate, maxSteps = 12000) {
  for (let i = 0; i < maxSteps; i++) {
    const telemetry = f.sim.getTelemetry();
    if (predicate(telemetry)) return telemetry;
    f.sim.debug.stepFixed(1);
  }
  throw Error('Action did not reach the expected real simulation phase');
}
function rodWindow(f) {
  const length = f.sim.getTelemetry().rodLength;
  f.sim.debug.setDepth(length - .00001);
  f.sim.setInput('feed', .5); f.sim.setInput('rotation', .5); f.sim.setInput('flush', 1);
  return until(f, t => t.phase === 'rod-add');
}
const messages = f => f.ui.notices.map(n => n.join(' ')).join('\n');
const logText = f => f.ui.logs.map(n => n[1]).join('\n');

test('early rod tap reports a miss; only the real completion event announces connection', () => {
  const f = fresh(); rodWindow(f);
  f.ui.act('rod');
  assert.match(messages(f), /Missed the window/);
  assert.doesNotMatch(messages(f), /Rod connected|Rod in|clean stab/i);
  assert.doesNotMatch(logText(f), /connected|stabbed/);
  until(f, t => t.phase === 'drilling');
  assert.match(messages(f), /Rod connected Connected after a missed window/);
  assert.equal(f.ui.logs.filter(n => n[1].includes('connected')).length, 1);
  assert.equal(f.ui.mode(), 'idle', 'Completion must not open another timing window');
});
test('clean timing is acknowledged before the actual rod completes', () => {
  const f = fresh(); rodWindow(f);
  until(f, t => t.rodAdd.t >= t.rodAdd.windowStart);
  f.ui.act('rod');
  assert.match(messages(f), /Timing caught Rod connection is still running/);
  assert.doesNotMatch(messages(f), /Rod connected|Rod in/);
  until(f, t => t.phase === 'drilling');
  assert.match(messages(f), /Rod connected Clean timing/);
});
test('stale or repeated rod taps report no-window without invented completion', () => {
  const f = fresh(); f.ui.act('rod');
  assert.match(messages(f), /The window has gone/);
  assert.equal(f.ui.logs.length, 0);
  rodWindow(f); f.ui.act('rod'); f.ui.act('rod');
  assert.equal(f.ui.notices.at(-1)[1], 'The window has gone');
  assert.doesNotMatch(messages(f), /Rod connected|Rod in/);
});
test('bit replacement remains pending through the real trip and completes exactly once', async () => {
  const f = fresh(); f.sim.debug.setDepth(2);
  const before = f.sim.getTelemetry().bitsUsed;
  let resolved = false;
  const pending = f.ui.act('trip');
  pending.then(() => { resolved = true; });
  await Promise.resolve();
  assert.equal(resolved, false);
  assert.match(messages(f), /Changing bit/);
  assert.doesNotMatch(messages(f), /complete|New crown/);
  f.ui.act('trip');
  assert.match(messages(f), /already in progress/);
  until(f, t => t.phase === 'drilling'); await pending;
  assert.equal(f.sim.getTelemetry().bitsUsed, before + 1);
  assert.equal(f.ui.notices.filter(n => n[0] === 'Bit change complete').length, 1);
  assert.equal(f.ui.logs.filter(n => n[1] === 'Replacement bit fitted').length, 1);
});
test('busy bit-change refusal is visible and does not claim work started', async () => {
  const f = fresh(); rodWindow(f);
  await f.ui.act('trip');
  assert.match(messages(f), /The machine is busy/);
  assert.doesNotMatch(messages(f), /Changing bit|complete/);
  assert.equal(f.ui.logs.length, 0);
});
test('idle bit-change refusal is visible', async () => {
  const f = fresh(); f.sim.abortHole('fixture-idle');
  await f.ui.act('trip');
  assert.match(messages(f), /No hole is running/);
  assert.equal(f.ui.logs.length, 0);
});
test('rejected and synchronous failing bit operations do not disappear or claim success', async () => {
  for (const asynchronous of [true, false]) {
    const f = fresh();
    f.sim.changeBit = () => {
      if (asynchronous) return Promise.reject(Error('fixture action failure'));
      throw Error('fixture action failure');
    };
    await f.ui.act('trip');
    assert.match(messages(f), /could not be completed/);
    assert.doesNotMatch(messages(f), /Bit change complete|New crown/);
    assert.equal(f.ui.logs.length, 0);
  }
});
test('a late promise cannot announce completion after unmount, replacement, abort or a new attempt', async () => {
  for (const change of ['unmount', 'contract', 'attempt', 'abort', 'sim']) {
    const f = fresh(); let resolve;
    f.sim.changeBit = () => new Promise(r => { resolve = r; });
    const pending = f.ui.act('trip');
    if (change === 'unmount') { f.ui.unmount(); f.state.scene = SCENES.MENU; f.state.scene = SCENES.SITE; }
    if (change === 'contract') f.state.contract = {...f.contract, id: 'replacement'};
    if (change === 'attempt') f.sim.startHole(f.contract);
    if (change === 'abort') f.sim.abortHole('fixture-abort');
    if (change === 'sim') f.ctx.sim = { getTelemetry: () => f.sim.getTelemetry() };
    resolve({ok: true}); await pending;
    assert.equal(f.ui.logs.length, 0, change);
    assert.equal(f.ui.notices.length, 0, change);
  }
});
test('accepted casing starts work; completion is emitted only after authoritative cased depth', () => {
  const f = fresh('rotary-kelly'); f.sim.debug.setDepth(2);
  f.ui.act('casing'); f.ui.poll();
  assert.equal(f.sim.getTelemetry().phase, 'casing-run');
  assert.match(messages(f), /Running casing/);
  assert.doesNotMatch(messages(f), /Casing set|complete|secured/);
  until(f, t => t.phase === 'drilling');
  assert.ok(f.sim.getTelemetry().casedDepth >= 2);
  f.ui.poll(); f.ui.poll();
  assert.equal(f.ui.notices.filter(n => n[0] === 'Casing set').length, 1);
  assert.equal(f.ui.logs.filter(n => n[1] === 'Casing run complete').length, 1);
});
test('refused casing makes no completed or started claim', () => {
  for (const busy of [false, true]) {
    const f = fresh(busy ? 'rotary-kelly' : 'top-hammer');
    if (busy) f.sim.changeBit();
    f.ui.act('casing');
    assert.match(messages(f), busy ? /The machine is busy/ : /cannot run casing/);
    assert.equal(f.ui.logs.length, 0);
  }
});
test('unmount and replacement attempt discard pending casing feedback', () => {
  for (const replace of [false, true]) {
    const f = fresh('rotary-kelly'); f.sim.debug.setDepth(2); f.ui.act('casing');
    if (replace) f.sim.startHole(f.contract); else f.ui.unmount();
    until(f, t => t.phase === 'drilling'); f.ui.poll();
    assert.doesNotMatch(messages(f), /Casing set|Casing interrupted/);
    assert.doesNotMatch(logText(f), /complete/);
  }
});
test('bailer completion uses the authoritative event and does not create an invented new action', () => {
  const f = fresh('cable-tool');
  f.sim.debug.setDepth(f.sim.getTelemetry().rodLength - .00001);
  f.sim.setInput('feed', .7); f.sim.setInput('rotation', .7);
  until(f, t => t.phase === 'bailing-run');
  f.ui.act('bail');
  assert.doesNotMatch(messages(f), /Bailer out/);
  until(f, t => t.phase === 'drilling');
  assert.match(messages(f), /Bailer out Cuttings lifted/);
  assert.equal(f.ui.mode(), 'idle');
});
test('the action rail reports timed blow-down as started and rejects a repeated busy tap', () => {
  const f = fresh('rc');
  f.ui.pulse('blowDown');
  assert.equal(f.sim.getTelemetry().phase, 'blow-down');
  assert.match(logText(f), /Blow-down started/);
  assert.doesNotMatch(messages(f), /Blown down|is clear/);
  f.ui.pulse('blowDown');
  assert.equal(f.ui.logs.length, 1);
  assert.match(f.ui.notices.at(-1)[1], /busy|still clearing/);
});

let failed = 0;
try {
  for (const {name, run} of tests) {
    try { await run(); console.log('PASS ' + name); }
    catch (error) { failed++; console.error('FAIL ' + name + '\n' + error.stack); }
  }
} finally { for (const f of fixtures) f.sim.dispose(); }
assert.equal(hash(readFileSync(sourcePath, 'utf8')), hash(source), 'Source unchanged during this gate');
console.log(JSON.stringify({passed: tests.length - failed, failed, sourceSha256: hash(source)}));
if (failed) process.exitCode = 1;
