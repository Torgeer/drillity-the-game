#!/usr/bin/env node
// Independent composed-consumer test: exact shell producer + real bus +
// actual audio.init subscription + real haptics policy + recorded actuator.
// No duplicate implementation of a haptic policy and no browser/physical claim.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parseAst } from 'vite';
import { createBus, createGameState, EVENTS } from '../src/core/contract.js';
import createAudio from '../src/audio/audio.js';
import { BUDGET_MS, onMs } from '../src/audio/haptics.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const option = (key, fallback) => { const i = process.argv.indexOf('--' + key); return i < 0 ? fallback : process.argv[i + 1]; };
const baseline = process.argv.includes('--baseline');
assert(!(baseline && process.argv.includes('--shell')), 'Choose either the pinned baseline or an explicit shell file');
const baselineRef = '859fde2023e531d44e5ff334355e4d24e4c4d92c';
const sourcePath = baseline ? `git:${baselineRef}:src/ui/shell.js` : resolve(root, option('shell', 'src/ui/shell.js'));
const source = baseline ? execFileSync('git', ['show', `${baselineRef}:src/ui/shell.js`], {
  cwd: root, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024,
}) : await readFile(sourcePath, 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
function find(root, predicate) {
  const found = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (predicate(node)) found.push(node);
    for (const child of Object.values(node)) if (Array.isArray(child)) child.forEach(visit); else if (child && typeof child === 'object') visit(child);
  }
  visit(root); return found;
}
const ast = parseAst(source);
const producer = find(ast, node => node.type === 'FunctionDeclaration' && node.id?.name === 'haptic');
assert.equal(producer.length, 1, 'One actual shell haptic producer');
const tables = find(ast, node => node.type === 'VariableDeclaration' && node.declarations.some(decl => decl.id?.name === 'VIBRATE'));
assert(tables.length <= 1);
const extracted = [...tables, ...producer].sort((a, b) => a.start - b.start).map(node => source.slice(node.start, node.end)).join('\n');
const makeProducer = new Function('state', 'bus', 'EVENTS', 'navigator', extracted + '\nreturn haptic;');
const report = { status: 'RUNNING', scope: 'CPU execution of exact extracted shell producer with actual bus/audio subscription and haptic policy, recorded actuator; no physical handset evidence',
  sourcePath, sourceSha256: hash(source), extractedSha256: hash(extracted), cases: [] };
const saved = new Map(['navigator', 'location', 'performance'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const put = (key, value) => Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
async function check(name, callback) {
  const issued = [], events = []; let clock = 100;
  const state = createGameState(); state.settings.haptics = true;
  const bus = createBus(); bus.on(EVENTS.HAPTIC, payload => events.push(structuredClone(payload)));
  const navigator = { vibrate: pattern => { issued.push(structuredClone(pattern)); return true; } };
  if (name.startsWith('absent')) delete navigator.vibrate;
  put('navigator', navigator); put('location', { search: (name.includes('shot') ? '?shot' : name.includes('mute') ? '?mute' : '')
    + (name.includes('sound override') ? '&sound' : '') });
  put('performance', { now: () => clock * 1000 });
  const audio = createAudio({ state, bus, EVENTS }); await audio.init();
  const haptic = makeProducer(state, bus, EVENTS, navigator);
  try {
    await callback({ state, navigator, bus, audio, haptic, issued, events, later: seconds => { clock += seconds; } });
    report.cases.push({ name, status: 'PASS', events, issued, stats: structuredClone(audio.debug.haptics.stats) });
  } catch (error) {
    report.cases.push({ name, status: 'FAIL', failure: error.message, events, issued, stats: structuredClone(audio.debug.haptics.stats) });
  } finally { audio.dispose(); }
}
try {
  for (const pattern of ['light', 'medium', 'heavy', 'success', 'fail']) {
    await check('single dispatch ' + pattern, ({ haptic, issued, events, audio }) => {
      haptic(pattern); assert.equal(events.length, 1, 'One producer notification');
      assert.equal(issued.length, 1, 'One actual actuator dispatch');
      assert.deepEqual(events[0], { pattern });
      assert(audio.debug.haptics.stats.last, 'Policy bookkeeping proves real audio consumer');
      assert(Array.isArray(issued[0]), 'Actual signature array reaches actuator');
    });
  }
  for (const flag of ['shot', 'mute']) await check(flag + ' suppresses only actuator', ({ haptic, issued, events, audio }) => {
    haptic('heavy'); assert.equal(events.length, 1); assert.equal(issued.length, 0, 'Capture mute reaches final actuator');
    assert(audio.debug.haptics.stats.last, 'Muted mode retains real policy bookkeeping');
  });
  for (const flag of ['shot', 'mute']) await check(flag + ' sound override', ({ haptic, issued, events }) => {
    haptic('heavy'); assert.equal(events.length, 1); assert.equal(issued.length, 1, 'Existing explicit sound override survives');
  });
  await check('disabled preference and live re-enable', ({ state, haptic, issued, events, later }) => {
    state.settings.haptics = false; haptic('heavy'); assert.equal(events.length, 0); assert.equal(issued.length, 0);
    state.settings.haptics = true; haptic('heavy'); assert.equal(events.length, 1); assert.equal(issued.length, 1);
    later(10); state.settings.haptics = false; haptic('heavy'); assert.equal(issued.length, 1);
    later(10); state.settings.haptics = true; haptic('heavy'); assert.equal(issued.length, 2);
  });
  await check('burst cannot bypass existing policy budget', ({ haptic, issued, events }) => {
    for (let i = 0; i < 1000; i++) haptic(['heavy', 'medium', 'light', 'success', 'fail'][i % 5]);
    assert.equal(events.length, 1000); assert(issued.length > 0);
    assert(issued.reduce((sum, pattern) => sum + onMs(pattern), 0) <= BUDGET_MS, 'Real actuator obeys channel motor budget');
    assert(issued.length < 1000, 'Burst suppression controls every actual actuator call');
  });
  await check('absent vibration API degrades without throwing', ({ navigator, haptic, events, issued }) => {
    delete navigator.vibrate; assert.doesNotThrow(() => haptic('medium'));
    assert.equal(events.length, 1); assert.equal(issued.length, 0);
  });
  report.status = report.cases.every(c => c.status === 'PASS') ? 'PASS' : 'FAIL';
} finally {
  for (const [key, descriptor] of saved) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  if (option('output', null)) await writeFile(resolve(root, option('output')), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
if (report.status !== 'PASS') process.exitCode = 1;
