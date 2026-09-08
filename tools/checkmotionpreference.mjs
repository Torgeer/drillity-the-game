#!/usr/bin/env node
/** CPU regression of the actual renderer's event, camera and disposal paths.
 * WebGL drawing and post construction are explicit doubles; Three camera math
 * is real. No browser, pixels, GPU or simulation-performance claim is made.
 * Run: node tools/checkmotionpreference.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EVENTS, QUALITY, createBus } from '../src/core/contract.js';

const sourceUrl = new URL('../src/core/renderer.js', import.meta.url);
const source = readFileSync(sourceUrl, 'utf8');
const sha = (text) => createHash('sha256').update(text).digest('hex');
const replaceOnce = (text, before, after) => {
  assert.equal(text.split(before).length, 2, `Renderer adapter anchor changed: ${before}`);
  return text.replace(before, after);
};

class CpuWebGLRenderer {
  constructor({ canvas }) {
    this.domElement = canvas;
    this.shadowMap = {};
    this.info = { reset() {}, programs: [] };
    this.draws = 0;
    this.disposed = false;
  }
  setClearColor() {}
  setPixelRatio() {}
  setSize() {}
  setRenderTarget() {}
  setViewport() {}
  setScissor() {}
  setScissorTest() {}
  clear() {}
  render() { this.draws++; }
  dispose() { this.disposed = true; }
}
class CpuUnavailablePost {
  constructor() { throw Error('CPU gate: post-processing intentionally unavailable'); }
}

async function loadRenderer(text, label) {
  let virtual = text.replace(/from '([^']+)'/g, (_, path) => {
    const target = path.startsWith('.') ? new URL(path, sourceUrl).href : import.meta.resolve(path);
    return `from '${target}'`;
  });
  virtual = replaceOnce(virtual, 'new THREE.WebGLRenderer({', 'new CpuWebGLRenderer({');
  virtual = replaceOnce(virtual, 'new EffectComposer(gl, rt)', 'new CpuUnavailablePost(gl, rt)');
  virtual += `\n${CpuWebGLRenderer.toString()}\n${CpuUnavailablePost.toString()}\n// ${label}`;
  return (await import('data:text/javascript;base64,' + Buffer.from(virtual).toString('base64'))).createRenderer;
}

function mediaFixture(mode = 'modern', initial = false) {
  let matches = initial;
  const listeners = new Set();
  const query = { get matches() { return matches; } };
  if (mode === 'modern') {
    query.addEventListener = (event, fn) => { assert.equal(event, 'change'); listeners.add(fn); };
    query.removeEventListener = (event, fn) => { assert.equal(event, 'change'); listeners.delete(fn); };
  } else if (mode === 'legacy') {
    query.addListener = (fn) => listeners.add(fn);
    query.removeListener = (fn) => listeners.delete(fn);
  }
  return {
    query,
    count: () => listeners.size,
    change(value) {
      matches = value;
      for (const fn of [...listeners]) fn({ matches, media: '(prefers-reduced-motion: reduce)' });
    },
  };
}

const factory = await loadRenderer(source, 'production-camera');
const originalWindow = globalThis.window;
const originalWarn = console.warn;
let checks = 0;
const passed = (name) => { checks++; console.log(`MOTION_PREFERENCE_PASS ${name}`); };
const samePosition = (a, b) => a.distanceTo(b) < 1e-12;
const live = new Set();

async function runtime({ os = false, game = false, media = 'modern', make = factory } = {}) {
  const pref = mediaFixture(media, os);
  let queries = 0;
  globalThis.window = { innerWidth: 390, innerHeight: 844, devicePixelRatio: 1 };
  if (media !== 'absent') window.matchMedia = (query) => {
    assert.equal(query, '(prefers-reduced-motion: reduce)');
    queries++;
    return pref.query;
  };
  const ctx = {
    canvas: { style: {} }, bus: createBus(), quality: QUALITY.LOW,
    qs: new URLSearchParams('quality=low'),
    state: { scene: 'menu', settings: { reducedMotion: game },
      player: { money: 137 }, drill: { depth: 4.5, rpm: 123 } },
  };
  const api = make(ctx);
  live.add(api);
  await api.init();
  api.update(1 / 60, ctx.state);
  api.render(0);
  const initialPosition = ctx.camera.position.clone();
  const initialGameState = JSON.stringify(ctx.state);
  return { ctx, api, pref, initialPosition,
    position() { api.render(0); return ctx.camera.position.clone(); },
    close() {
      assert.equal(JSON.stringify(ctx.state), initialGameState, 'camera processing leaves unrelated game state intact');
      api.dispose();
      api.dispose(); // repeat teardown must be harmless
      live.delete(api);
      assert.equal(pref.count(), 0, 'media query listener is released');
      assert.equal(ctx.gl.disposed, true, 'renderer disposal still reaches WebGL boundary');
      assert.equal(queries, media === 'absent' ? 0 : 1, 'one query per renderer, never per frame');
    },
  };
}

try {
  console.warn = (message, detail) => {
    if (message === '[renderer]' && String(detail).includes('post chain unavailable')) return;
    originalWarn(message, detail);
  };
  const events = [EVENTS.BOULDER, EVENTS.JAM, EVENTS.BIT_BROKEN, EVENTS.CAVITY];
  for (const event of events) {
    for (const [label, os, game] of [['ordinary', false, false], ['OS only', true, false],
      ['game only', false, true], ['both', true, true]]) {
      const run = await runtime({ os, game });
      try {
        let delivered = 0;
        run.ctx.bus.on(event, () => delivered++);
        run.ctx.bus.emit(event, { severity: 0.75 });
        assert.equal(delivered, 1, 'preference does not suppress the event for other systems');
        assert.equal(samePosition(run.position(), run.initialPosition), os || game,
          `${event}: ${label} must ${os || game ? 'prevent' : 'retain'} event camera shake`);
        assert.ok(run.ctx.gl.draws >= 4, 'reduced motion continues rendering');
        passed(`${event}: ${label}`);
      } finally { run.close(); }
    }
  }

  for (const media of ['modern', 'legacy']) {
    const run = await runtime({ media });
    try {
      assert.equal(run.pref.count(), 1, `${media}: listener installed`);
      run.ctx.bus.emit(EVENTS.BIT_BROKEN);
      assert.equal(samePosition(run.position(), run.initialPosition), false);
      // Two OS changes before the next frame must discard, not replay, the hit.
      run.pref.change(true);
      run.pref.change(false);
      assert.ok(samePosition(run.position(), run.initialPosition), `${media}: old hit cleared by change event`);
      run.pref.change(true);
      run.ctx.bus.emit(EVENTS.BOULDER);
      run.pref.change(false);
      assert.ok(samePosition(run.position(), run.initialPosition), `${media}: suppressed event was not queued`);
      run.ctx.bus.emit(EVENTS.JAM);
      assert.equal(samePosition(run.position(), run.initialPosition), false, `${media}: new hit works after opt-out`);
      passed(`${media}: live preference changes, suppressed hits, fresh hits and cleanup`);
    } finally { run.close(); }
  }

  for (const media of ['modern', 'absent']) {
    const run = await runtime({ media });
    try {
      run.ctx.bus.emit(EVENTS.BOULDER);
      assert.equal(samePosition(run.position(), run.initialPosition), false);
      run.ctx.state.settings.reducedMotion = true;
      assert.ok(samePosition(run.position(), run.initialPosition), 'game setting drops current trauma');
      run.ctx.bus.emit(EVENTS.BIT_BROKEN);
      run.ctx.state.settings.reducedMotion = false;
      assert.ok(samePosition(run.position(), run.initialPosition), 'game opt-out does not replay a suppressed event');
      run.ctx.bus.emit(EVENTS.CAVITY);
      assert.equal(samePosition(run.position(), run.initialPosition), false);
      passed(`${media}: live game preference without a settings event`);
    } finally {
      run.ctx.state.settings.reducedMotion = false;
      run.close();
    }
  }

  // Negative control: the original game-only preference must fail the same
  // observed-camera oracle. No mutation is written to production source.
  const mutant = await loadRenderer(replaceOnce(source,
    '!!state?.settings?.reducedMotion || !!motionQuery?.matches',
    '!!state?.settings?.reducedMotion'), 'game-only-negative-control');
  const negative = await runtime({ os: true, make: mutant });
  try {
    negative.ctx.bus.emit(EVENTS.BOULDER);
    assert.equal(samePosition(negative.position(), negative.initialPosition), false,
      'game-only regression must be observable as camera movement');
    passed('negative control catches the original OS-only failure');
  } finally { negative.close(); }

  assert.equal(sha(readFileSync(sourceUrl, 'utf8')), sha(source), 'source remains unchanged throughout test');
  console.log(`MOTION_PREFERENCE_OK ${checks} cases; renderer SHA256 ${sha(source)}`);
} catch (error) {
  console.error(`MOTION_PREFERENCE_FAIL ${error.message}`);
  process.exitCode = 1;
} finally {
  for (const api of live) api.dispose();
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  console.warn = originalWarn;
}
