#!/usr/bin/env node
/** Independent CPU fixtures for the actual live profiler's page adapters.
 * No browser, server, GPU, or performance acceptance run is started here.
 * Query-driver doubles test ownership/accounting, not real WebGL correctness.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as profiler from './profileframes.mjs';
import * as data from '../src/game/data.js';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { createGeology } from '../src/world/geology.js';

const results = [];
async function test(name, action) {
  try { await action(); results.push({ name, pass: true }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, pass: false, error: String(error.stack || error) }); console.error(`FAIL ${name}: ${error.message}`); }
}
const clone = value => structuredClone(value);
const sourcePath = new URL('./profileframes.mjs', import.meta.url);
const sourceBefore = readFileSync(sourcePath, 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const inputFiles = ['tools/profileframes.mjs', 'src/core/contract.js', 'src/game/data.js', 'src/game/economy.js',
  'src/game/equipment-support.js', 'src/game/progression.js', 'src/sim/drilling.js', 'src/world/geology.js'];
const inputHashes = () => Object.fromEntries(inputFiles.map(path => [path, hash(readFileSync(new URL('../' + path, import.meta.url)))]));
const inputsBefore = inputHashes();

await test('import is inert and live entry points are explicit', () => {
  assert.equal(typeof profiler.assessWindow, 'function');
  assert.equal(typeof profiler.assessLiveWindow, 'function');
  assert.equal(typeof profiler.installLiveHarness, 'function');
  assert.equal(typeof profiler.prepareLiveScenario, 'function');
  assert.equal(globalThis.window, undefined, 'import does not create or install a page');
});

function validWindow() {
  const matrix = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const cameras = () => ({ surface: { world: matrix(), projection: matrix() }, section: { world: matrix(), projection: matrix() } });
  const stable = { runId: 1, attemptId: 2, contractId: 'canonical-contract', rigId: 'oil-derrick',
    source: 'glb', screen: 'site', methodId: 'oil-rotary', loadout: { bit: 'oil-bit-fixture' },
    cameraMode: 'orbit', quality: { id: 'high' }, viewport: { width: 390, height: 844 }, dpr: 2 };
  const endpoint = { stable, cameras: cameras(), visible: true, focused: true, contextLost: false, assetsReady: true,
    programs: 8, events: { blur: 0, visibility: 0, lost: 0, restored: 0 } };
  const frames = Array.from({ length: 66 }, (_, i) => ({ frame: i + 1, at: 1000 + i * 16,
    renderEnd: 1002 + i * 16, dt: .016, rafMs: i ? 16 : null, rafTimestamp: 1000 + i * 16, observerMs: .1, cameras: cameras(),
    state: { runId: 1, attemptId: 2, contractId: 'canonical-contract', methodId: 'oil-rotary',
      bitId: 'oil-bit-fixture', bitFits: true, active: true, paused: false,
      depth: i < 20 ? i * .1 : i < 40 ? 2 : 2 + (i - 40) * .1,
      timeSec: i * .016, phase: i < 20 || i >= 40 ? 'drilling' : 'rod-add', rods: i < 40 ? 1 : 2 },
    visible: true, focused: true, contextLost: false, programs: 8, assetsReady: true, identityHeld: true,
    cpu: { 'system:sim': { count: 1, inclusiveMs: .3 }, 'render-total': { count: 1, inclusiveMs: 1.3 } } }));
  const samples = frames.filter(r => r.frame % 6 === 0).map(r => ({ frame: r.frame, ms: 2 }));
  return { completed: true, before: clone(endpoint), after: clone(endpoint), frames, violations: [],
    gpu: { supported: true, created: samples.length, completed: samples.length, deleted: samples.length,
      discarded: 0, disjointEvents: 0, pending: 0, drainTimedOut: false, queryErrors: [], samples } };
}

await test('natural changing depth and rod phase are accepted; no frozen-state rule reused', () => {
  assert.equal(profiler.assessLiveWindow(validWindow()).valid, true);
});
const mutations = [
  ['incomplete capture', w => w.completed = false],
  ['original fatal retained', w => w.fatal = 'original render failure'],
  ['empty live frame window', w => w.frames = []],
  ['missing frame', w => w.frames[30].frame++],
  ['duplicate frame', w => w.frames[30].frame--],
  ['NaN raw interval', w => w.frames[30].rafMs = NaN],
  ['zero raw interval', w => w.frames[30].rafMs = 0],
  ['missing raw frame timestamp', w => delete w.frames[30].rafTimestamp],
  ['nonfinite raw frame timestamp', w => w.frames[30].rafTimestamp = NaN],
  ['raw interval inconsistent with observed timestamps', w => w.frames[30].rafMs = 1],
  ['missing camera evidence', w => delete w.frames[30].cameras],
  ['nonfinite live world camera matrix', w => w.frames[30].cameras.surface.world[0] = NaN],
  ['truncated live section projection matrix', w => w.frames[30].cameras.section.projection.pop()],
  ['missing before camera evidence', w => delete w.before.cameras],
  ['nonfinite after camera projection', w => w.after.cameras.surface.projection[3] = Infinity],
  ['negative render duration', w => w.frames[30].renderEnd = w.frames[30].at - 1],
  ['zero forwarded dt', w => w.frames[30].dt = 0],
  ['NaN forwarded dt', w => w.frames[30].dt = NaN],
  ['paused actual simulation', w => w.frames[30].state.paused = true],
  ['inactive attempt', w => w.frames[30].state.active = false],
  ['no simulation advancement', w => w.frames.forEach(r => r.state.timeSec = 0)],
  ['no connection encountered', w => w.frames.forEach(r => r.state.phase = 'drilling')],
  ['no new rod after connection', w => w.frames.forEach(r => r.state.rods = 1)],
  ['transient run replacement', w => w.frames[30].state.runId++],
  ['transient attempt replacement', w => w.frames[30].state.attemptId++],
  ['transient contract replacement', w => w.frames[30].state.contractId += '-changed'],
  ['transient method replacement', w => w.frames[30].state.methodId = 'longhole'],
  ['unfitted bit', w => w.frames[30].state.bitFits = false],
  ['transient wrong loadout', w => w.frames[30].state.bitId = 'auger-flight-std'],
  ['stable loadout drift', w => w.after.stable.loadout.bit += '-changed'],
  ['transient identity failure', w => w.frames[30].identityHeld = false],
  ['transient hidden page', w => w.frames[30].visible = false],
  ['transient texture readiness loss', w => w.frames[30].assetsReady = false],
  ['transient shader creation', w => w.frames[30].programs++],
  ['context loss event recovered before endpoint', w => w.after.events.lost++],
  ['empty GPU sample window', w => { w.gpu.samples = []; w.gpu.created = w.gpu.completed = w.gpu.deleted = 0; }],
  ['GPU timer unavailable', w => w.gpu.supported = false],
  ['GPU sample not finite', w => w.gpu.samples[0].ms = NaN],
  ['GPU sample zero', w => w.gpu.samples[0].ms = 0],
  ['GPU samples outside measured frame window', w => w.gpu.samples[0].frame = 1000],
  ['GPU sample duplicate frame', w => w.gpu.samples[1].frame = w.gpu.samples[0].frame],
  ['GPU query leak', w => w.gpu.deleted--],
  ['GPU discard', w => w.gpu.discarded++],
  ['GPU disjoint', w => w.gpu.disjointEvents++],
  ['GPU query error', w => w.gpu.queryErrors.push('driver error')],
  ['GPU drain timeout', w => w.gpu.drainTimedOut = true],
  ['GPU pending after drain', w => w.gpu.pending++],
  ['NaN GPU discarded count', w => w.gpu.discarded = NaN],
  ['missing GPU disjoint count', w => delete w.gpu.disjointEvents],
  ['negative GPU pending count', w => w.gpu.pending = -1],
  ['nonfinite CPU time', w => w.frames[30].cpu['system:sim'].inclusiveMs = NaN],
  ['negative CPU time', w => w.frames[30].cpu['render-total'].inclusiveMs = -1],
  ['fractional CPU call count', w => w.frames[30].cpu['render-total'].count = .5],
  ['instrumented window missing all CPU rows', w => w.frames.forEach(r => { delete r.cpu; })],
  ['instrumented window empty CPU objects', w => w.frames.forEach(r => r.cpu = {})],
];
for (const [name, mutate] of mutations) await test(`reject ${name}`, () => {
  const w = validWindow(); mutate(w);
  assert.equal(profiler.assessLiveWindow(w).valid, false, `assessor accepted ${name}`);
});
await test('long raw intervals remain visible instead of being replaced by simulation clamp', () => {
  const w = validWindow();
  for (const [i, row] of w.frames.entries()) { row.at = 1000 + i * 100; row.rafTimestamp = row.at; row.renderEnd = row.at + 2; row.rafMs = i ? 100 : null; row.dt = 1 / 15; }
  assert.equal(profiler.assessLiveWindow(w).valid, true, 'slow but valid timing must not be discarded');
  assert.equal(w.frames[30].rafMs, 100);
  assert.notEqual(1000 / w.frames[30].rafMs, 1 / w.frames[30].dt);
});
await test('explicit uninstrumented live window can omit CPU and GPU instrumentation', () => {
  const w = validWindow(); w.gpu = null; w.frames.forEach(r => { r.cpu = null; });
  assert.equal(profiler.assessLiveWindow(w, { gpu: false }).valid, true);
});

function globals(values) {
  const descriptors = Object.fromEntries(Object.keys(values).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  return () => { for (const [key, descriptor] of Object.entries(descriptors)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  } };
}

async function careerFixture(action, { missingGeology = false, refuseAcceptance = false, invalidDefault = false } = {}) {
  const values = new Map(), generated = [], accepted = [], loaded = [];
  const ctx = { state: createGameState(), bus: createBus(), rand: makeRandom(731), SCENES };
  ctx.data = { ...data,
    makeContract(...args) { const c = data.makeContract(...args); generated.push(clone(c)); return c; },
    defaultLoadoutFor(...args) { const l = data.defaultLoadoutFor(...args); return invalidDefault ? { ...l, bit: 'auger-flight-std' } : l; },
  };
  ctx.rig = { getSpec: () => ({ ...data.getRig(ctx.state.garage.rigId), source: loaded.includes(ctx.state.garage.rigId) ? 'glb' : 'procedural' }) };
  ctx.gltfRigs = { async load(id) { loaded.push(id); } };
  ctx.renderer = { cameraMode: 'hero', setCameraMode(mode) { this.cameraMode = mode; },
    gl: { getContext: () => ({ getExtension: () => null }) } };
  let overlay = false;
  ctx.ui = { currentScene: 'menu', get gameplayPaused() { return overlay; },
    show(scene, { contract } = {}) { this.currentScene = scene; ctx.state.scene = scene; ctx.sim.startHole(contract); },
    sheet() { overlay = true; return { close() { overlay = false; } }; } };
  const restore = globals({
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) },
    window: Object.assign(new EventTarget(), { __DRILLITY: ctx }),
    document: Object.assign(new EventTarget(), { visibilityState: 'visible', createElement: () => ({ textContent: '' }) }),
    navigator: { userAgent: 'CPU fixture; no browser or GPU' },
  });
  try {
    ctx.progression = createProgression(ctx); await ctx.progression.init();
    if (!missingGeology) {
      ctx.geology = createGeology(ctx);
      ctx.bus.on(EVENTS.CONTRACT_ACCEPT, ({ contract }) => ctx.geology.generateProfile({ ...contract, holeDiaMm: contract.holeDia }));
    }
    ctx.sim = createDrillSim(ctx); ctx.sim.init();
    const accept = ctx.progression.acceptContract;
    ctx.progression.acceptContract = contract => { accepted.push(clone(contract)); return refuseAcceptance ? { ok: false, reason: 'critic refusal' } : accept(contract); };
    // Only the browser import URL is relocated. The actual setup body,
    // canonical data, career rules, geological generator and sim are unchanged.
    const body = profiler.prepareLiveScenario.toString();
    const specifier = "import('/src/core/contract.js')";
    assert.equal(body.split(specifier).length, 2, 'exactly one browser module URL to relocate');
    const setup = new Function(`return (${body.replace(specifier, `import(${JSON.stringify(new URL('../src/core/contract.js', import.meta.url).href)})`)});`)();
    await action({ ctx, setup, generated, accepted, values });
  } finally {
    ctx.sim?.dispose(); ctx.geology?.dispose(); ctx.progression?.dispose(); restore();
  }
}
for (const rig of ['oil-derrick', 'longhole-rig']) await test(`${rig} setup uses unmodified generated contract and real accepted fitted attempt`, () => careerFixture(async ({ ctx, setup, generated, accepted }) => {
  const result = await setup({ rig, camera: 'orbit', seed: 20260908 });
  assert.equal(accepted.length, 1);
  assert.ok(generated.some(c => JSON.stringify(c) === JSON.stringify(accepted[0])), 'accepted contract is an untouched actual generator result');
  assert.deepEqual(result.contract, accepted[0]);
  assert.equal(result.telemetry.depth, 0); assert.equal(result.telemetry.timeSec, 0);
  assert.equal(result.telemetry.runId, ctx.progression.run.runId);
  assert.equal(result.telemetry.attemptId, ctx.progression.run.attemptId);
  assert.equal(result.telemetry.bit.fits, true); assert.equal(ctx.sim.debug.state.syntheticGeology, false);
  for (const [slot, id] of Object.entries(result.defaultLoadout)) assert.equal(ctx.state.garage.loadout[slot], id);
  for (const [slot, id] of Object.entries(ctx.state.garage.loadout)) if (id) {
    assert.equal(data.canEquip(ctx.state, slot, id).ok, true, `${slot} passes real equipment guard`);
    assert.ok(ctx.state.garage.owned.includes(id), `${slot} is owned`);
  }
  assert.ok(ctx.ui.gameplayPaused); assert.equal(ctx.renderer.cameraMode, 'orbit');
}));
await test('canonical setup preserves contract refusal instead of bypassing readiness', () => careerFixture(async ({ setup, ctx }) => {
  await assert.rejects(setup({ rig: 'oil-derrick', camera: 'orbit', seed: 20260908 }), /critic refusal/);
  assert.equal(ctx.progression.run, null); assert.equal(ctx.sim.active, false);
}, { refuseAcceptance: true }));
await test('canonical setup rejects unsupported default equipment before accepting anything', () => careerFixture(async ({ setup, accepted }) => {
  await assert.rejects(setup({ rig: 'oil-derrick', camera: 'orbit', seed: 20260908 }), /Invalid default loadout/);
  assert.equal(accepted.length, 0);
}, { invalidDefault: true }));
await test('canonical setup rejects synthetic geology fallback', () => careerFixture(async ({ setup }) => {
  await assert.rejects(setup({ rig: 'oil-derrick', camera: 'orbit', seed: 20260908 }), /real geology/);
}, { missingGeology: true }));
await test('canonical setup rejects an existing live career', () => careerFixture(async ({ setup }) => {
  await setup({ rig: 'oil-derrick', camera: 'orbit', seed: 20260908 });
  await assert.rejects(setup({ rig: 'oil-derrick', camera: 'orbit', seed: 20260908 }), /Fresh isolated career required/);
}));

async function adapterFixture(action, options = {}) {
  let now = 1000, serial = 0, querySerial = 0, activeQuery = null, nextFrame = 0;
  const raf = new Map(), timers = new Map(), created = new Set(), deleted = new Set(), calls = [], marks = [];
  const ext = { TIME_ELAPSED_EXT: 1, GPU_DISJOINT_EXT: 2 };
  const gl = {
    QUERY_RESULT_AVAILABLE: 3, QUERY_RESULT: 4, CURRENT_QUERY: 5,
    drawingBufferWidth: 780, drawingBufferHeight: 1688,
    isContextLost: () => !!options.contextLost,
    getExtension: name => name === 'EXT_disjoint_timer_query_webgl2' && !options.noTimer ? ext : null,
    getParameter: key => key === ext.GPU_DISJOINT_EXT ? !!options.disjoint : null,
    getQuery: () => activeQuery,
    createQuery() { if (options.createFail) return null; const q = { id: ++querySerial }; created.add(q); return q; },
    beginQuery(_kind, query) { if (options.beginFail) throw Error('fixture beginQuery failed'); assert.equal(activeQuery, null); activeQuery = query; },
    endQuery() { if (options.endFail) { activeQuery = null; throw Error('fixture endQuery failed'); } activeQuery = null; },
    getQueryParameter(_query, key) { return key === this.QUERY_RESULT_AVAILABLE ? !options.neverReady : options.invalidGpu ? NaN : 2000000; },
    deleteQuery(query) { assert.ok(created.has(query), 'only owned query deleted'); assert.ok(!deleted.has(query), 'query deleted once'); deleted.add(query); },
  };
  const state = { contract: { id: 'ct', methodId: 'oil-rotary' }, garage: { loadout: { bit: 'test-bit' } }, tSec: 0 };
  const simulation = { contract: state.contract, runId: 1, attemptId: 2, methodId: 'oil-rotary',
    active: true, depth: 0, timeSec: 0, drillSec: 0, rods: 1, phase: 'drilling',
    bit: { id: 'test-bit', kind: 'test-kind' }, m: { bitKinds: ['test-kind'] },
    syntheticGeology: false, cmd: { feed: .5, rotation: .5, flush: .5 }, act: {}, hazards: [] };
  const camera = () => ({ matrixWorld: { toArray: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, simulation.depth, 0, 0, 1] },
    projectionMatrix: { toArray: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] } });
  let paused = true;
  class Target extends EventTarget {
    listeners = new Map();
    addEventListener(type, fn, options) { super.addEventListener(type, fn, options); (this.listeners.get(type) || this.listeners.set(type, new Set()).get(type)).add(fn); }
    removeEventListener(type, fn, options) { super.removeEventListener(type, fn, options); this.listeners.get(type)?.delete(fn); }
    get listenerCount() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
  }
  const c = { state, clock: { t: 0, tSec: 0, dt: 0, fps: 15, frame: 0 }, camera: camera(), sectionCamera: camera(),
    canvas: new Target(), quality: { id: 'high' }, viewport: { w: 390, h: 844 },
    progression: { run: { runId: 1, attemptId: 2 } },
    rig: { getSpec: () => ({ id: 'oil-derrick', source: 'glb' }) },
    terrain: { siteModel: { wanted: 'wellpad', model: 'wellpad', procedural: false, problem: null } },
    assets: { stats: () => ({ sets: 2, setsReady: 2, failed: 0, pending: 0 }) },
    ui: { currentScene: 'site', get gameplayPaused() { return paused; } },
    scene: { updateMatrixWorld() { now += .03; } }, sectionScene: { updateMatrixWorld() { now += .02; } },
  };
  c.sim = { __name: 'sim', debug: { state: simulation },
    getTelemetry() { now += .02; return { ...simulation, optimal: { wob: .5, rpm: .5, flush: .5 }, jam: { state: 'free' } }; },
    setInput(name, value) { calls.push({ input: name, value }); return true; }, pulse(name) { calls.push({ pulse: name }); return { ok: true }; },
    update(dt, s) {
      calls.push({ system: true, dt, sameState: s === state, sameThis: this === c.sim }); now += .2;
      if (options.updateThrow) throw options.updateThrow;
      if (!paused) { simulation.timeSec += dt; simulation.drillSec += dt; simulation.depth += .01;
        simulation.phase = nextFrame >= 20 && nextFrame < 40 ? 'rod-add' : 'drilling'; simulation.rods = nextFrame < 40 ? 1 : 2; }
    },
  };
  c.systems = [c.sim, { __name: 'aux', update(dt, s) { calls.push({ aux: true, dt, sameState: s === state }); now += .1; } }];
  c.renderer = { cameraMode: 'orbit', gl: { getContext: () => gl, getPixelRatio: () => 2,
    info: { programs: [{}, {}], render: { calls: 99 } }, render() { now += .2; }, copyFramebufferToTexture() { now += .05; } },
    render(dt, token) { calls.push({ render: true, dt, token, sameThis: this === c.renderer,
      vfxVisible: c.vfxTargets?.map(o => o.visible) }); now += 1;
      options.onRender?.(c, nextFrame);
      this.gl.render(); c.scene.updateMatrixWorld(); if (options.renderThrow) throw options.renderThrow; return token;
    } };
  if (options.vfx) {
    for (const [name, scene] of [['surface', c.scene], ['section', c.sectionScene]]) {
      Object.assign(scene, { uuid: `${name}-scene`, name, visible: true, parent: null, children: [],
        traverse(fn) { fn(this); for (const child of this.children) fn(child); } });
    }
    c.vfxTargets = ['surfaceSoft', 'surfaceAdd', 'sectionSoft', 'sectionAdd'].map(name => {
      const parent = name.startsWith('surface') ? c.scene : c.sectionScene;
      const o = { name: `vfx:${name}`, uuid: `${name}-mesh`, parent, visible: true, isMesh: true,
        geometry: { uuid: `${name}-geometry`, isInstancedBufferGeometry: true, attributes: { iPos: { count: 100 } }, instanceCount: 12 },
        material: { uuid: `${name}-material`, uniforms: { uTime: { value: 0 } } } };
      parent.children.push(o); return o;
    });
    c.vfx = { __name: 'vfx', stats: () => ({ live: 40, capacity: 400, loadScale: .9, medium: 'air', programme: null,
      sectionReturn: false, layers: Object.fromEntries(c.vfxTargets.map(o => [o.name.slice(4), { live: 10, capacity: 100 }])), chips: { live: 2, capacity: 40 } }),
      update(dt) { calls.push({ vfxUpdate: true, dt, visible: c.vfxTargets.map(o => o.visible) });
        c.vfxTargets.forEach(o => o.material.uniforms.uTime.value += dt); } };
    c.systems.push(c.vfx);
  }
  const originals = { updates: c.systems.map(s => s.update), render: c.renderer.render,
    telemetry: c.sim.getTelemetry, threeRender: c.renderer.gl.render, matrices: c.scene.updateMatrixWorld };
  const page = Object.assign(new Target(), { __DRILLITY: c, __LIVE_SETUP: { sheet: { close() { paused = false; } }, result: {} } });
  const doc = Object.assign(new Target(), { visibilityState: 'visible', hasFocus: () => true });
  const restore = globals({ window: page, document: doc, performance: { now: () => now, timeOrigin: 1000000,
    mark(name) {
      if (options.startMarkThrow && name === 'drillity-live-start') throw Error('fixture start mark failure');
      if (options.endMarkThrow && name === 'drillity-live-end') throw Error('fixture end mark failure');
      marks.push({ name, at: now });
    } },
    requestAnimationFrame: fn => { const id = ++serial; raf.set(id, fn); return id; }, cancelAnimationFrame: id => raf.delete(id),
    setTimeout: (fn, delay) => { const id = ++serial; timers.set(id, { fn, at: now + delay }); return id; }, clearTimeout: id => timers.delete(id),
  });
  function timersAt(t) { now = Math.max(now, t); const due = [...timers].filter(([, timer]) => timer.at <= now); for (const [id, timer] of due) { timers.delete(id); timer.fn(); } }
  function step(rawMs = 16, forwardedDt = Math.min(rawMs / 1000, 1 / 15)) {
    const timestamp = 1000 + (++nextFrame) * rawMs;
    now = timestamp; c.clock.frame++; c.clock.dt = forwardedDt; c.clock.t += forwardedDt; state.tSec += forwardedDt;
    let thrown;
    for (const system of c.systems) { try { system.update(forwardedDt, state); } catch (e) { thrown ||= e; } }
    try { assert.equal(c.renderer.render(forwardedDt, 'return-token'), 'return-token'); } catch (e) { thrown ||= e; }
    const batch = [...raf]; raf.clear(); for (const [, fn] of batch) fn(timestamp);
    timersAt(now);
    return thrown;
  }
  async function settle() { for (let i = 0; i < 400; i++) {
    await Promise.resolve();
    if (page.__LIVE_PROFILE?.current().after) {
      if (!timers.size) break;
      timersAt(Math.min(...[...timers.values()].map(t => t.at)));
    }
  } }
  function assertRestored() {
    c.systems.forEach((s, i) => assert.equal(s.update, originals.updates[i]));
    assert.equal(c.renderer.render, originals.render); assert.equal(c.sim.getTelemetry, originals.telemetry);
    assert.equal(c.renderer.gl.render, originals.threeRender); assert.equal(c.scene.updateMatrixWorld, originals.matrices);
    assert.equal(page.listenerCount + doc.listenerCount + c.canvas.listenerCount, 0, 'owned event listeners removed');
    assert.equal(raf.size, 0); assert.equal(timers.size, 0);
    assert.equal(created.size, deleted.size, 'all created owned queries deleted');
  }
  try { await action({ c, page, doc, calls, gl, created, deleted, marks, step, settle, timersAt, assertRestored, get now() { return now; } }); }
  finally {
    if (page.__LIVE_PROFILE) { const cleaning = page.__LIVE_PROFILE.cleanup(); await settle(); await cleaning; }
    restore();
  }
}

await test('actual live adapter preserves dt, this, arguments, return values and chronological frame/query ranges', () => adapterFixture(async f => {
  profiler.installLiveHarness({ durationMs: 1000, instrument: true });
  for (let i = 0; i < 70 && !f.page.__LIVE_PROFILE.current().after; i++) assert.equal(f.step(), undefined);
  await f.settle(); const w = await f.page.__LIVE_PROFILE.done;
  assert.equal(profiler.assessLiveWindow(w).valid, true, JSON.stringify(profiler.assessLiveWindow(w).faults));
  assert.ok(f.calls.filter(c => c.system).every(c => c.dt === .016 && c.sameState && c.sameThis));
  assert.ok(f.calls.filter(c => c.render).every(c => c.dt === .016 && c.sameThis && c.token === 'return-token'));
  assert.ok(w.frames.every(r => r.cpu['system:sim'].count === 1 && r.cpu['render-total'].count === 1));
  const ids = new Set(w.frames.map(r => r.frame)); assert.ok(w.gpu.samples.every(s => ids.has(s.frame)));
  assert.notDeepEqual(w.frames[0].cameras, w.frames.at(-1).cameras, 'actual moving camera observations retained');
  assert.deepEqual(f.marks.map(m => m.name), ['drillity-live-start', 'drillity-live-end']);
  assert.ok(w.frames[0].at >= f.marks[0].at && w.frames.at(-1).renderEnd <= f.marks[1].at);
  assert.equal(w.timing.startMs, f.marks[0].at); assert.equal(w.timing.endMs, f.marks[1].at);
  const frameCount = w.frames.length; f.step(); assert.equal(w.frames.length, frameCount, 'post-window frames not included');
  assert.equal((await f.page.__LIVE_PROFILE.cleanup()).restored, true); f.assertRestored();
}));
await test('actual uninstrumented adapter creates no elapsed queries and keeps real slow raw pacing', () => adapterFixture(async f => {
  profiler.installLiveHarness({ durationMs: 7000, instrument: false });
  for (let i = 0; i < 75 && !f.page.__LIVE_PROFILE.current().after; i++) f.step(100, 1 / 15);
  await f.settle(); const w = await f.page.__LIVE_PROFILE.done;
  assert.equal(profiler.assessLiveWindow(w, { gpu: false }).valid, true, JSON.stringify(profiler.assessLiveWindow(w, { gpu: false }).faults));
  assert.equal(f.created.size, 0); assert.ok(w.frames.every(r => r.cpu === null && r.dt === 1 / 15));
  assert.ok(w.frames.slice(1).every(r => r.rafMs === 100));
  await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
}));
for (const kind of ['updateThrow', 'renderThrow']) await test(`actual adapter retains original ${kind} and restores after failure`, () => {
  const original = Error(`original ${kind}`);
  return adapterFixture(async f => {
    profiler.installLiveHarness({ durationMs: 1000 });
    assert.equal(f.step(), original, 'caller receives same original exception object');
    await f.settle(); const w = await f.page.__LIVE_PROFILE.done;
    assert.match(w.fatal, new RegExp(original.message)); assert.equal(profiler.assessLiveWindow(w).valid, false);
    await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
  }, { [kind]: original });
});
for (const option of ['neverReady', 'invalidGpu', 'beginFail', 'endFail', 'createFail', 'disjoint', 'noTimer']) await test(`actual timer adapter rejects ${option} and deletes owned queries`, () => adapterFixture(async f => {
  profiler.installLiveHarness({ durationMs: 1000 });
  for (let i = 0; i < 70 && !f.page.__LIVE_PROFILE.current().after; i++) f.step();
  await f.settle(); const w = await f.page.__LIVE_PROFILE.done;
  assert.equal(profiler.assessLiveWindow(w).valid, false, `${option} must not pass`);
  if (option === 'neverReady') { assert.equal(w.gpu.drainTimedOut, true); assert.ok(w.gpu.pending > 0); }
  await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
}, { [option]: true }));
await test('cancelled capture cannot become a successful empty window and restores wrappers', () => adapterFixture(async f => {
  profiler.installLiveHarness({ durationMs: 1000 });
  const result = await f.page.__LIVE_PROFILE.cleanup();
  assert.equal(result.restored, true); assert.equal(profiler.assessLiveWindow(await f.page.__LIVE_PROFILE.done).valid, false);
  f.assertRestored();
}));
await test('GPU drain excludes later CPU frames and cannot expand the capture window', () => adapterFixture(async f => {
  profiler.installLiveHarness({ durationMs: 1000 });
  for (let i = 0; i < 70 && !f.page.__LIVE_PROFILE.current().after; i++) f.step();
  const end = f.page.__LIVE_PROFILE.current();
  const count = end.frames.length, endFrame = end.frames.at(-1).frame, queries = end.gpu.created;
  for (let i = 0; i < 10; i++) f.step();
  assert.equal(f.page.__LIVE_PROFILE.current().frames.length, count);
  assert.equal(f.page.__LIVE_PROFILE.current().frames.at(-1).frame, endFrame);
  assert.equal(f.page.__LIVE_PROFILE.current().gpu.created, queries);
  await f.settle(); await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
}, { neverReady: true }));
await test('transient context loss is retained after recovery and cannot pass', () => adapterFixture(async f => {
  profiler.installLiveHarness({ durationMs: 1000 });
  for (let i = 0; i < 70 && !f.page.__LIVE_PROFILE.current().after; i++) {
    if (i === 30) f.c.canvas.dispatchEvent(new Event('webglcontextlost'));
    if (i === 31) f.c.canvas.dispatchEvent(new Event('webglcontextrestored'));
    f.step();
  }
  await f.settle(); const w = await f.page.__LIVE_PROFILE.done;
  assert.equal(profiler.assessLiveWindow(w).valid, false);
  assert.equal(w.after.events.lost, 1); assert.equal(w.after.events.restored, 1);
  await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
}));
await test('start trace-marker failure unwinds partially installed wrappers', () => adapterFixture(async f => {
  assert.throws(() => profiler.installLiveHarness({ durationMs: 1000 }), /start mark failure/);
  f.assertRestored();
}, { startMarkThrow: true }));
await test('end trace-marker failure cannot replace the original renderer exception or prevent cleanup', () => {
  const original = Error('original render error before end-marker failure');
  return adapterFixture(async f => {
    profiler.installLiveHarness({ durationMs: 1000 });
    assert.equal(f.step(), original); await f.settle();
    const w = await f.page.__LIVE_PROFILE.done;
    assert.match(w.fatal, /original render error before end-marker failure/);
    await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
  }, { renderThrow: original, endMarkThrow: true });
});

function diagnostics() {
  return { profile: { nodes: [{ id: 1, callFrame: { functionName: 'frame' } }, { id: 2, callFrame: { functionName: 'render' } }],
    samples: [1, 2, 1], timeDeltas: [1000, 1000, 1000], startTime: 1000, endTime: 4000 },
    trace: [{ cat: 'blink.user_timing', name: 'drillity-live-start', ts: 1100 },
      { cat: 'devtools.timeline', name: 'FunctionCall', ts: 2000, dur: 1000 },
      { cat: 'blink.user_timing', name: 'drillity-live-end', ts: 3900 }] };
}
await test('nonempty CDP profile and trace correlation boundaries are accepted', () => {
  const d = diagnostics(); assert.equal(profiler.assessLiveDiagnostics(d.profile, d.trace).valid, true);
});
const diagnosticMutations = [
  ['missing profile', d => d.profile = null],
  ['empty profile samples', d => { d.profile.samples = []; d.profile.timeDeltas = []; }],
  ['empty profile nodes', d => d.profile.nodes = []],
  ['duplicate node identity', d => d.profile.nodes[1].id = 1],
  ['unknown sample node', d => d.profile.samples[1] = 99],
  ['missing sample duration', d => d.profile.timeDeltas.pop()],
  ['nonfinite sample duration', d => d.profile.timeDeltas[1] = NaN],
  ['zero complete timing span', d => d.profile.timeDeltas.fill(0)],
  ['reversed profile duration', d => d.profile.endTime = 999],
  ['empty trace', d => d.trace = []],
  ['missing trace start marker', d => d.trace.shift()],
  ['missing trace end marker', d => d.trace.pop()],
  ['duplicate trace start marker', d => d.trace.push(clone(d.trace[0]))],
  ['reversed trace markers', d => d.trace.at(-1).ts = 1],
  ['nonfinite marker timestamp', d => d.trace[0].ts = NaN],
  ['unrelated category with matching marker name', d => d.trace[0].cat = 'not-user-timing'],
];
for (const [name, mutate] of diagnosticMutations) await test(`reject ${name}`, () => {
  const d = diagnostics(); mutate(d);
  assert.equal(profiler.assessLiveDiagnostics(d.profile, d.trace).valid, false, `accepted ${name}`);
});

let probeSample;
for (const order of ['on-first', 'off-first']) await test(`actual VFX ${order} probe changes only draw visibility and restores before updates`, () => adapterFixture(async f => {
  profiler.installLiveHarness({ durationMs: 5000, vfxOrder: order });
  for (let i = 0; i < 320 && !f.page.__LIVE_PROFILE.current().after; i++) {
    assert.equal(f.step(), undefined);
    assert.ok(f.c.vfxTargets.every(o => o.visible), 'visibility restored before next update');
  }
  await f.settle(); const w = await f.page.__LIVE_PROFILE.done;
  assert.equal(profiler.assessLiveWindow(w).valid, true);
  assert.equal(profiler.assessLiveVfxProbe(w).valid, true, JSON.stringify(profiler.assessLiveVfxProbe(w).faults));
  assert.ok(w.frames.some(r => r.vfxProbe.off && r.vfxProbe.eligible));
  assert.ok(w.frames.some(r => !r.vfxProbe.off && r.vfxProbe.eligible));
  assert.ok(w.frames.filter(r => r.state.phase === 'rod-add').every(r => !r.vfxProbe.off && !r.vfxProbe.eligible));
  const updates = f.calls.filter(c => c.vfxUpdate), renders = f.calls.filter(c => c.render);
  assert.equal(updates.length, w.frames.length, 'VFX update runs every recorded frame');
  assert.ok(updates.every(c => c.dt === .016 && c.visible.every(Boolean)), 'emission update receives original dt and visibility');
  w.frames.forEach((r, i) => assert.ok(renders[i].vfxVisible.every(v => v === !r.vfxProbe.off)));
  assert.ok(w.frames.at(-1).vfxProbe.targets[0].uniformTime > w.frames[0].vfxProbe.targets[0].uniformTime);
  if (order === 'on-first') probeSample = clone(w);
  await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
}, { vfx: true }));
await test('VFX off-mask restoration retains original renderer exception', () => {
  const original = Error('original renderer failure inside off-mask');
  return adapterFixture(async f => {
    profiler.installLiveHarness({ durationMs: 5000, vfxOrder: 'off-first' });
    assert.equal(f.step(), original); assert.ok(f.c.vfxTargets.every(o => o.visible));
    await f.settle(); const w = await f.page.__LIVE_PROFILE.done;
    assert.match(w.fatal, /original renderer failure inside off-mask/);
    assert.ok(w.frames[0].vfxProbe.targets.every(t => t.before && !t.drawVisible && t.after));
    await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
  }, { vfx: true, renderThrow: original });
});
for (const issue of ['disconnected', 'geometry replaced', 'hidden ancestor']) await test(`VFX probe rejects ${issue} target`, () => adapterFixture(async f => {
  profiler.installLiveHarness({ durationMs: 5000, vfxOrder: 'on-first' });
  for (let i = 0; i < 320 && !f.page.__LIVE_PROFILE.current().after; i++) {
    if (i === 100) {
      if (issue === 'disconnected') f.c.vfxTargets[0].parent = null;
      if (issue === 'geometry replaced') f.c.vfxTargets[0].geometry.uuid = 'replacement-geometry';
      if (issue === 'hidden ancestor') f.c.scene.visible = false;
    }
    f.step();
  }
  await f.settle(); const w = await f.page.__LIVE_PROFILE.done;
  assert.equal(profiler.assessLiveVfxProbe(w).valid, false);
  assert.ok(f.c.vfxTargets.every(o => o.visible));
  await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
}, { vfx: true }));
await test('VFX probe rejects geometry replaced during the last recorded render', () => adapterFixture(async f => {
  profiler.installLiveHarness({ durationMs: 5000, vfxOrder: 'on-first' });
  for (let i = 0; i < 320 && !f.page.__LIVE_PROFILE.current().after; i++) f.step();
  await f.settle(); const w = await f.page.__LIVE_PROFILE.done;
  assert.equal(w.frames.at(-1).frame, 313, 'mutation occurs on the final captured render');
  assert.equal(profiler.assessLiveVfxProbe(w).valid, false, 'no later frame exists to expose a replaced target');
  assert.ok(f.c.vfxTargets.every(o => o.visible));
  await f.page.__LIVE_PROFILE.cleanup(); f.assertRestored();
}, { vfx: true, onRender(c, number) { if (number === 313) c.vfxTargets[0].geometry.uuid = 'changed-inside-final-render'; } }));
const probeMutations = [
  ['missing probe metadata', w => w.vfxProbe = null],
  ['duplicate mesh identity', w => w.vfxProbe.targets[1].uuid = w.vfxProbe.targets[0].uuid],
  ['unexpected scene identity', w => w.frames[100].vfxProbe.targets[0].scene = 'another-scene'],
  ['draw mask not applied', w => { const r = w.frames.find(r => r.vfxProbe.off); r.vfxProbe.targets[0].drawVisible = true; }],
  ['draw mask changed within renderer', w => w.frames[100].vfxProbe.targets[0].atRenderEnd = !w.frames[100].vfxProbe.targets[0].drawVisible],
  ['draw visibility not restored', w => w.frames[100].vfxProbe.targets[0].after = false],
  ['discontinuous segment', w => w.frames[100].vfxProbe.segment++],
  ['fabricated elapsed block age', w => { const p = w.frames[100].vfxProbe; p.elapsedMs += 1200; p.block += 2; }],
  ['unrelated phase label', w => w.frames[100].vfxProbe.phase = 'rod-add'],
  ['initial interval falsely eligible', w => w.frames[0].vfxProbe.eligible = true],
  ['missing adaptive FPS observation', w => delete w.frames[100].vfxProbe.stats.clockFps],
  ['invalid adaptive loadScale', w => w.frames[100].vfxProbe.stats.loadScale = NaN],
  ['aggregate particle count mismatch', w => w.frames[100].vfxProbe.stats.live++],
  ['chip live count exceeds capacity', w => w.frames[100].vfxProbe.stats.chips.live = 999],
  ['missing GPU samples in off blocks', w => { const off = new Set(w.frames.filter(r => r.vfxProbe.off).map(r => r.frame)); w.gpu.samples = w.gpu.samples.filter(q => !off.has(q.frame)); }],
];
for (const [name, mutate] of probeMutations) await test(`reject probe ${name}`, () => {
  assert.ok(probeSample, 'actual successful adapter probe captured');
  const w = clone(probeSample); mutate(w);
  assert.equal(profiler.assessLiveVfxProbe(w).valid, false, `accepted ${name}`);
});

const sourceAfter = readFileSync(sourcePath, 'utf8');
await test('reviewed profiler did not change during CPU fixtures', () => assert.equal(hash(sourceAfter), hash(sourceBefore)));
await test('canonical source inputs did not change during CPU fixtures', () => assert.deepEqual(inputHashes(), inputsBefore));
console.log(JSON.stringify({ scope: 'CPU fixtures only; no GPU or FPS claim', sourceSha256: hash(sourceAfter), inputHashes: inputsBefore,
  passed: results.filter(r => r.pass).length, failed: results.filter(r => !r.pass).length, failures: results.filter(r => !r.pass) }, null, 2));
if (results.some(r => !r.pass)) process.exitCode = 1;
