#!/usr/bin/env node
// Exercise the actual top-level QA programs with browser/server transports
// stubbed. No Chrome, HTTP listener, shared lease, or real process is touched.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const cases = [
  ['server', true], ['launch', true], ['launch', false],
  ['context', true], ['route', true], ['page', true],
  ['goto', true], ['ready', true], ['measurement', true],
  ['measurement', false], ['gate', true], ['gate', false],
  ['success', true], ['success', false],
  ['browser-close', true], ['browser-close', false], ['server-stop', true],
  ['measurement+browser-close+server-stop', true],
];
let checked = 0;

for (const relative of ['tools/checkreach.mjs', '.hudqa/bandshare.mjs']) {
  const reach = relative.includes('checkreach');
  const path = resolve(root, relative);
  // Strip only static dependency declarations; all acquisition, measurement,
  // gate verdict, and finally control flow below executes from the real file.
  const source = readFileSync(path, 'utf8')
    .replace(/^#![^\r\n]*/u, '')
    .replace(/^import .+ from '[^']+';\r?$/gmu, '')
    .replace(/^export function /gmu, 'function ')
    .replaceAll('import.meta.url', JSON.stringify(pathToFileURL(path).href));
  assert.ok(!/^import /mu.test(source), `${relative}: fixture must resolve every static import`);
  const run = new AsyncFunction('chromium', 'devices', 'writeFileSync', 'ensureServer', 'assert',
    'ENUMERATE', 'resolve', 'dirname', 'fileURLToPath', 'process', 'console', source);
  const ownCases = [...cases, ...(reach ? [['fetch', true], ['screenshot', true]] : [['context-close', true]])];

  for (const [phase, spawned] of ownCases) {
    const events = [], failures = new Map();
    const fail = (point) => {
      if (!phase.split('+').includes(point)) return;
      const error = new Error(`fixture:${point}`);
      failures.set(point, error);
      throw error;
    };
    let width = 390, height = 844;
    const page = {
      request: { fetch: async () => fail('fetch') },
      on() {},
      goto: async () => fail('goto'),
      waitForFunction: async () => fail('ready'),
      waitForTimeout: async () => {},
      screenshot: async () => fail('screenshot'),
      evaluate: async (fn) => {
        if (fn.name === 'GOTO_SITE') return;
        fail('measurement');
        if (fn.name === 'COLLECT') return phase === 'gate' ? [] : [
          { cls: 'site__leave', isLeave: true, tag: 'BUTTON', x: 131, y: 760, w: 128, h: 44, reach: 'drilling', inDock: true },
          { cls: 'feed', isLeave: false, tag: 'BUTTON', x: 173, y: 630, w: 44, h: 44, reach: 'drilling', inDock: true },
        ];
        const bandH = Math.round(height * 0.8);
        if (fn.name === 'RENDER_STATE') return { bandsH: bandH, chromeTop: 40, chromeBottom: 80 };
        return {
          W: width, H: height, dom: { stripH: 40, dockH: 80 },
          bands: { surface: { h: bandH }, section: { h: 0 } },
          split: { stagePct: 80, surfPct: 80, sectPct: 0 },
          overlaps: phase === 'gate' ? 1 : 0, overlapList: ['fixture overlap'],
          targets: 2, smallTargets: [], targetList: [], onBand3D: [], clipped: [],
        };
      },
    };
    const browser = {
      newContext: async (options) => {
        fail('context');
        ({ width, height } = options.viewport);
        return {
          route: async () => fail('route'),
          newPage: async () => { fail('page'); return page; },
          close: async () => fail('context-close'),
        };
      },
      close: async () => { events.push('browser-close'); fail('browser-close'); },
    };
    const exitSignal = { fixtureExit: true };
    const processStub = {
      argv: ['node', path, ...(reach ? ['62999'] : ['cleanup-fixture', '62999'])],
      exitCode: 0,
      exit(code) { this.exitCode = code; throw exitSignal; },
    };
    let caught;
    try {
      await run(
        { launch: async () => { events.push('launch'); fail('launch'); return browser; } },
        {}, () => { throw new Error('fixture must not write artifacts'); },
        async () => {
          events.push('server'); fail('server');
          return { origin: 'http://fixture.invalid', spawned,
            stop: async () => { events.push('server-stop'); fail('server-stop'); } };
        },
        assert, 'fixture-enumerate', resolve, dirname, fileURLToPath,
        processStub, { log() {}, error() {} },
      );
    } catch (error) { caught = error; }
    const tag = `${relative}: ${phase}, ${spawned ? 'owned' : 'reused'} server`;
    const expected = ['server'];
    if (phase !== 'server') expected.push('launch');
    if (!['server', 'launch'].includes(phase)) expected.push('browser-close');
    if (spawned && phase !== 'server') expected.push('server-stop');
    assert.deepEqual(events, expected, `${tag}: exact ownership and cleanup order`);
    if (phase === 'success') assert.equal(caught, undefined, tag);
    else if (phase === 'gate') {
      assert.equal(caught, exitSignal, tag);
      assert.equal(processStub.exitCode, 1, `${tag}: a failed verdict still fails after cleanup`);
    } else {
      assert.ok(caught instanceof Error, `${tag}: failures must propagate`);
      for (const error of failures.values()) {
        assert.ok(caught === error || caught.cause === error || caught.errors?.includes(error),
          `${tag}: the original ${error.message} must remain visible`);
      }
    }
    if (phase === 'fetch') assert.equal(processStub.exitCode, 2, `${tag}: keep reachability exit code`);
    checked++;
  }
}
console.log(`QA cleanup PASS: ${checked} actual-program transport fixtures; owned handles closed once, reused servers untouched, failures retained; no browser/server launched`);
