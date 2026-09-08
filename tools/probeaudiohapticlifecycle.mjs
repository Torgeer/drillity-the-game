#!/usr/bin/env node
// Exact production shell callback + actual audio init/event subscription.
// No DOM rendering, browser, AudioContext, speaker or physical vibration.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseAst } from 'vite';
import { createAudio } from '../src/audio/audio.js';
import { createGameState, createBus, EVENTS } from '../src/core/contract.js';

// Historical defect reproduction uses committed pre-fix source, so it remains
// runnable after the repair without requiring a sibling worktree or snapshot.
const baselineRef = '859fde2023e531d44e5ff334355e4d24e4c4d92c';
const source = execFileSync('git', ['show', `${baselineRef}:src/ui/shell.js`], {
  cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8', maxBuffer: 2 * 1024 * 1024,
});
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
function one(predicate, name) {
  const found = nodes.filter(predicate); assert.equal(found.length, 1, name);
  return source.slice(found[0].start, found[0].end);
}
const table = one(n => n.type === 'VariableDeclaration'
  && n.declarations.some(d => d.id?.name === 'VIBRATE'), 'Actual shell actuator table');
const fn = one(n => n.type === 'FunctionDeclaration' && n.id?.name === 'haptic', 'Actual shell haptic callback');
const makeShellCallback = new Function('state', 'bus', 'EVENTS', 'navigator', `${table}\n${fn}\nreturn haptic;`);
const originals = Object.fromEntries(['window', 'document', 'navigator', 'location'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
const put = (key, value) => Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
const paths = ['src/audio/audio.js', 'src/audio/haptics.js', 'src/ui/shell.js', 'src/ui/screens/menu.js', 'src/main.js'];
const hashes = async () => Object.fromEntries(await Promise.all(paths.map(async path => [path,
  createHash('sha256').update(await readFile(new URL('../' + path, import.meta.url))).digest('hex')])));
const beforeHashes = await hashes(), observations = [];
try {
  for (const [search, enabled] of [['', true], ['?shot', true], ['?mute', true], ['?shot&sound', true], ['', false]]) {
    put('window', new EventTarget());
    put('document', Object.assign(new EventTarget(), { visibilityState: 'visible' }));
    put('location', { search });
    const calls = [], actuator = { vibrate: pattern => { calls.push(structuredClone(pattern)); return true; } };
    put('navigator', actuator);
    const state = createGameState(), bus = createBus(); state.settings.haptics = enabled;
    const audio = createAudio({ state, bus });
    try {
      await audio.init();
      assert.equal(audio.isReady, false, 'Init does not construct an audio graph');
      const haptic = makeShellCallback(state, bus, EVENTS, actuator);
      haptic('success');
      observations.push({ search, enabled, calls, recordedAudioPattern: audio.debug.haptics.stats.last?.pattern ?? null });
    } finally { audio.dispose(); }
  }
  assert.equal(observations[0].calls.length, 2, 'One ordinary shell success currently reaches the actuator twice');
  assert.equal(observations[1].calls.length, 1, 'Shell direct actuator bypasses shot silence');
  assert.equal(observations[2].calls.length, 1, 'Shell direct actuator bypasses mute silence');
  assert.equal(observations[3].calls.length, 2, 'Explicit sound mode retains duplicate dispatch');
  assert.equal(observations[4].calls.length, 0, 'Player haptics=false suppresses both paths');
  const afterHashes = await hashes(); assert.deepEqual(afterHashes, beforeHashes, 'Production sources unchanged');
  const report = { status: 'DEFECT_REPRODUCED', scope: 'Actual module/callback actuator calls using an instrumented capability; no physical-device or audio-rendering claim',
    observations, callbackSource: `git:${baselineRef}:src/ui/shell.js`, callbackSourceSha256: createHash('sha256').update(source).digest('hex'),
    sourceHashes: beforeHashes, productionSourceStable: true };
  const output = process.argv.indexOf('--output');
  if (output >= 0) await writeFile(process.argv[output + 1], JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  for (const [key, descriptor] of Object.entries(originals)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
}
