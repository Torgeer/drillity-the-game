#!/usr/bin/env node
// Independent CPU-only exercise of the actual serialized manager. Real Three
// scene objects are used; GPU query/renderer doubles are not FPS acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { installLiveShimmerPairs, assessShimmerPairs, verifyShimmerSidePasses } from './live-shimmer-pairs.mjs';
import { installLiveHarness, assessLiveWindow } from './profileframes.mjs';
const hash = path => createHash('sha256').update(fs.readFileSync(new URL(path, import.meta.url))).digest('hex');
const sourceHash = hash('./live-shimmer-pairs.mjs');
const helperSource = fs.readFileSync(new URL('./live-shimmer-pairs.mjs', import.meta.url), 'utf8');
const profilerHash = hash('./profileframes.mjs');
const threeRendererPath = '../node_modules/three/src/renderers/WebGLRenderer.js';
const threeRendererSource = fs.readFileSync(new URL(threeRendererPath, import.meta.url), 'utf8');
const threeModule = fs.readFileSync(new URL('../node_modules/three/build/three.module.js', import.meta.url), 'utf8');
const extractRenderObject = source => {
  const start = source.indexOf('\t\tfunction renderObject( object, scene, camera, geometry, material, group ) {');
  const end = source.indexOf('\n\t\tfunction getProgram(', start);
  assert(start >= 0 && end > start); return source.slice(start, end).trim();
};
const threeRenderObject = extractRenderObject(threeRendererSource);
assert.equal(threeRenderObject, extractRenderObject(threeModule), 'installed source and shipped module renderObject agree');
const threeSourceHash = hash(threeRendererPath);
const results = [];
async function test(name, action) {
  try { await action(); results.push({ name, pass: true }); }
  catch (e) { results.push({ name, pass: false, error: e.stack }); }
}
async function fixture(action, options = {}) {
  const keys = ['window', 'document', 'performance', 'setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const descriptors = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let now = 1000, current = null, sequence = 0, renders = 0, serial = 0, paused = !!options.live;
  const raf = new Map(), timers = new Map();
  const owned = new Set(), deleted = [], log = [];
  const scene = new THREE.Scene(), sectionScene = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({ uniforms: { uHasScene: { value: 0 }, uScene: { value: null },
    uTime: { value: 1 }, uStrength: { value: 1 }, uScale: { value: 1 }, uRise: { value: 1 },
    uChroma: { value: 1 }, uHaze: { value: 1 }, uGround: { value: 1 }, uAspect: { value: 1 },
    uSrc: { value: new Float32Array(16) } }, transparent: true, depthWrite: false });
  const target = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  target.name = 'vfx:heatShimmer'; target.frustumCulled = false;
  scene.add(target);
  const particleGeometry = new THREE.InstancedBufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0]), 3));
  particleGeometry.setAttribute('iPos', new THREE.InstancedBufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3));
  particleGeometry.instanceCount = 2;
  const particle = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial()); particle.name = 'vfx:surfaceSoft'; scene.add(particle);
  const glass = [];
  const glassMaterial = new THREE.MeshPhysicalMaterial({ transparent: true, side: THREE.DoubleSide, transmission: 0 });
  glassMaterial.version = 4409;
  if (options.doubleSide) for (let i = 0; i < (options.sharedGlass ? 2 : 1); i++) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glassMaterial); mesh.name = 'fixture-glass-' + i;
    if (options.beforeGlass) mesh.onBeforeRender = (...args) => options.beforeGlass({ mesh, material: glassMaterial, args });
    scene.add(mesh); glass.push(mesh);
  }
  scene.updateMatrixWorld(true); sectionScene.updateMatrixWorld(true);
  const camera = new THREE.PerspectiveCamera(), sectionCamera = new THREE.OrthographicCamera();
  camera.updateMatrixWorld(true); sectionCamera.updateMatrixWorld(true);
  const ext = { TIME_ELAPSED_EXT: 100, GPU_DISJOINT_EXT: 101 };
  const gl = { CURRENT_QUERY: 102, QUERY_RESULT_AVAILABLE: 103, QUERY_RESULT: 104,
    drawingBufferWidth: 780, drawingBufferHeight: 1688,
    getExtension: () => options.unsupported ? null : ext, isContextLost: () => !!options.contextLost,
    getParameter: () => !!options.disjoint,
    getQuery: () => options.foreignQuery ? { foreign: true } : current,
    createQuery() { if (options.createNull) return null; const q = { id: ++sequence }; owned.add(q); return q; },
    beginQuery(type, q) { if (options.beginThrow) throw options.beginThrow; assert.equal(current, null); current = q; q.mask = target.visible ? 'on' : 'off'; },
    endQuery() { if (options.endThrow) throw options.endThrow; assert(current); current = null; },
    getQueryParameter(q, name) { if (options.queryThrow) throw options.queryThrow; return name === gl.QUERY_RESULT_AVAILABLE ? !options.neverReady : options.nanQuery ? NaN : (q.mask === 'on' ? 8 : 3) * 1e6; },
    deleteQuery(q) { assert(owned.has(q), 'only owned queries deleted'); assert(!deleted.includes(q), 'query deleted once'); deleted.push(q); owned.delete(q); if (current === q) current = null; },
  };
  const raw = { getContext: () => gl, getPixelRatio: () => 2, info: { programs: [{ name: 'warm' }], render: { calls: 20 } },
    render() { now += .1; }, copyFramebufferToTexture() { log.push('copy'); },
    renderBufferDirect(cam, scene, geometry, material, object, group) {
      now += .05; log.push({ direct: true, side: material.side, version: material.version, material: material.uuid, object: object.uuid });
      options.onDraw?.({ camera: cam, scene, geometry, material, object, group });
      return 'original-direct-result';
    } };
  const originalDirect = raw.renderBufferDirect;
  const actualRenderObject = new Function('_this', 'DoubleSide', 'BackSide', 'FrontSide', 'return ' + threeRenderObject)(raw, THREE.DoubleSide, THREE.BackSide, THREE.FrontSide);
  const originalHook = function () { log.push(['hook', this === target]); return 'original-hook-result'; };
  target.onBeforeRender = originalHook;
  const sim = { runId: 1, attemptId: 2, contract: { id: 'fixture-canonical' }, methodId: 'oil-rotary', phase: 'drilling',
    active: true, depth: 20, timeSec: 2, rods: 1, m: { bitKinds: ['tricone'] }, bit: { id: 'fixture', kind: 'tricone' },
    syntheticGeology: false, cmd: { wob: .3 }, act: { wob: .3 }, rop: 8 };
  if (options.live) { sim.depth = 0; sim.timeSec = 0; }
  class SpatialFixturePass { constructor() { this.enabled = true; this.needsSwap = true; this.clear = false; this.renderToScreen = true;
    this.material = new THREE.ShaderMaterial({ uniforms: { uExposure: { value: 1 } } }); this.uniforms = this.material.uniforms; } }
  const rt1 = new THREE.WebGLRenderTarget(390, 844), rt2 = new THREE.WebGLRenderTarget(390, 844);
  const c = { scene, sectionScene, camera, sectionCamera, composer: { passes: [new SpatialFixturePass()], renderTarget1: rt1, renderTarget2: rt2, readBuffer: rt1, writeBuffer: rt2 },
    state: { screen: 'site', tSec: 2, rigId: 'oil-derrick', methodId: 'oil-rotary', runId: 1, attemptId: 2,
      contract: { id: 'fixture-canonical', methodId: 'oil-rotary' }, garage: { loadout: { bit: 'fixture' } } },
    progression: { run: { runId: 1, attemptId: 2 } }, rig: { getSpec: () => ({ id: 'oil-derrick', source: 'glb' }) },
    clock: { frame: 0, t: 2, dt: .016, elapsed: 2, fps: 60 }, sim: { debug: { state: sim } },
    ui: { currentScene: 'site', get gameplayPaused() { return paused; } }, canvas: new EventTarget(),
    terrain: { siteModel: { wanted: 'well-pad', model: 'well-pad', procedural: false, problem: null } },
    quality: { id: 'high' }, viewport: { w: 390, h: 844, dpr: 2 }, bands: { surface: { x: 0, y: 0, w: 390, h: 422 }, section: { x: 0, y: 422, w: 390, h: 422 } },
    assets: { stats: () => ({ sets: 1, setsReady: 1, pending: 0, failed: 0 }) },
    vfx: { stats: () => ({ active: true, live: 2, capacity: 2, loadScale: 1, layers: [{ name: 'surfaceSoft', live: 2, capacity: 2 }] }) } };
  const renderer = { gl: raw, cameraMode: 'orbit', registration: { active: false }, render(dt) {
    assert.equal(this, renderer); if (!options.live) assert.equal(dt, 0); renders++; now += 2;
    raw.render(); scene.updateMatrixWorld();
    if (target.visible && target.parent === scene) target.onBeforeRender.call(target, raw, scene, camera, target.geometry, mat, null);
    for (const mesh of glass) actualRenderObject(mesh, scene, camera, mesh.geometry, mesh.material, null);
    options.onRender?.({ c, target, particle, raw, gl, sim, renders, log });
    if (options.renderThrow) throw options.renderThrow;
    return 'original-render-result';
  } }; c.renderer = renderer;
  let systemCalls = 0;
  Object.assign(c.sim, { __name: 'sim',
    getTelemetry() { now += .01; return { ...sim, optimal: { wob: .3, rpm: .6, flush: .7 }, jam: { state: 'free' } }; },
    setInput: () => true, pulse: () => ({ ok: true }),
    update(dt) { systemCalls++; now += .1; if (!paused) { sim.timeSec += dt; sim.depth += .01;
      sim.phase = c.clock.frame >= 80 && c.clock.frame < 100 ? 'rod-add' : 'drilling'; sim.rods = c.clock.frame < 100 ? 1 : 2; } },
  });
  c.systems = [c.sim, { __name: 'vfx', update(dt) { target.material.uniforms.uTime.value += dt; } }];
  const originalCopy = raw.copyFramebufferToTexture;
  const page = Object.assign(new EventTarget(), { __DRILLITY: c, __LIVE_SETUP: { sheet: { close() { paused = false; } }, result: {} } });
  Object.defineProperty(globalThis, 'window', { configurable: true, writable: true, value: page });
  Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: Object.assign(new EventTarget(), { visibilityState: 'visible', hasFocus: () => true }) });
  Object.defineProperty(globalThis, 'performance', { configurable: true, writable: true, value: { now: () => now, timeOrigin: 1000000, mark: () => {} } });
  Object.defineProperty(globalThis, 'setTimeout', { configurable: true, writable: true, value: (fn, delay) => {
    if (!options.live) { now += delay; queueMicrotask(fn); return 1; }
    const id = ++serial; timers.set(id, { fn, at: now + delay }); return id;
  } });
  Object.defineProperty(globalThis, 'clearTimeout', { configurable: true, writable: true, value: id => timers.delete(id) });
  Object.defineProperty(globalThis, 'requestAnimationFrame', { configurable: true, writable: true, value: fn => { const id = ++serial; raf.set(id, fn); return id; } });
  Object.defineProperty(globalThis, 'cancelAnimationFrame', { configurable: true, writable: true, value: id => raf.delete(id) });
  function tickTimers() { for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.fn(); } }
  async function settle() { for (let i = 0; i < 1000; i++) { await new Promise(resolve => setImmediate(resolve));
    if (page.__LIVE_PROFILE?.current().after && timers.size) { now = Math.max(now, Math.min(...[...timers.values()].map(t => t.at))); tickTimers(); }
    if (page.__LIVE_PROFILE?.current().completed) break;
  } }
  const api = { c, target, particle, glass, glassMaterial, raw, gl, sim, owned, deleted, log, originalHook, originalCopy, originalDirect,
    install: () => installLiveShimmerPairs({ requestedPairs: 8, spacingMs: 500 }),
    run(index) { now += 501; c.clock.frame = index + 1; return window.__SHIMMER_PAIRS.run(index + 1); },
    get manager() { return window.__SHIMMER_PAIRS; }, get renders() { return renders; },
    get systemCalls() { return systemCalls; }, get pendingRaf() { return raf.size; },
    step() { const timestamp = 1000 + (c.clock.frame + 1) * 16; now = timestamp; c.clock.frame++; c.clock.t += .016; c.state.tSec += .016;
      for (const s of c.systems) s.update(.016, c.state); renderer.render(.016);
      const batch = [...raf]; raf.clear(); for (const [, fn] of batch) fn(timestamp); tickTimers(); }, settle,
  };
  try { await action(api); }
  finally {
    if (window.__LIVE_PROFILE) { const clean = window.__LIVE_PROFILE.cleanup(); await settle(); await clean; }
    if (window.__SHIMMER_PAIRS) await window.__SHIMMER_PAIRS.cleanup();
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
}
let accepted, acceptedSide;
await test('serialized and exported side verifiers have identical bodies', () => {
  const start = helperSource.indexOf('  function verifyShimmerSidePasses(');
  const end = helperSource.indexOf('\n  const texture', start);
  assert(start >= 0 && end > start);
  const normalize = s => s.trim().split('\n').map(line => line.trim()).join('\n');
  assert.equal(normalize(helperSource.slice(start, end)), normalize(verifyShimmerSidePasses.toString()));
});
await test('actual manager retains identical state, alternates on/off and restores ownership', () => fixture(async f => {
  f.install(); for (let i = 0; i < 8; i++) f.run(i);
  assert.equal(f.manager.current().gpu.pending, 2, 'last pair remains genuinely pending before drain');
  const r = await f.manager.finish(); accepted = structuredClone(r);
  assert.deepEqual(assessShimmerPairs(r).faults, []);
  assert.equal(f.renders, 16); assert.equal(r.gpu.created, 16); assert.equal(r.gpu.completed, 16); assert.equal(r.gpu.deleted, 16);
  assert.equal(r.gpu.samples.filter(q => q.mask === 'on' && q.ms === 8).length, 8);
  assert.equal(r.gpu.samples.filter(q => q.mask === 'off' && q.ms === 3).length, 8);
  assert.equal(f.target.visible, true); assert.equal(f.owned.size, 0);
  const cleanup = await f.manager.cleanup(); assert.equal(cleanup.restored, true);
  assert.equal(f.target.onBeforeRender, f.originalHook); assert.equal(f.raw.copyFramebufferToTexture, f.originalCopy);
}));
await test('installed Three DoubleSide function provides exact witnessed version increments without erasing raw versions', () => fixture(async f => {
  f.install(); for (let i = 0; i < 8; i++) f.run(i);
  const r = await f.manager.finish();
  assert.deepEqual(assessShimmerPairs(r).faults, []);
  assert.equal(f.glassMaterial.version, 4409 + 32); assert.equal(f.glassMaterial.side, THREE.DoubleSide);
  acceptedSide = structuredClone(r);
  assert.equal(f.log.filter(x => x?.direct && x.side === THREE.BackSide).length, 16);
  assert.equal(f.log.filter(x => x?.direct && x.side === THREE.FrontSide).length, 16);
  for (const p of r.pairs) for (const m of p.members) {
    const before = m.before.identity.materials.find(x => x.uuid === f.glassMaterial.uuid);
    const after = m.after.identity.materials.find(x => x.uuid === f.glassMaterial.uuid);
    assert.equal(after.version, before.version + 2);
  }
  await f.manager.cleanup(); assert.equal(f.raw.renderBufferDirect, f.originalDirect);
}, { doubleSide: true }));
await test('shared eligible material requires every actual back/front draw pair', () => fixture(async f => {
  f.install(); for (let i = 0; i < 8; i++) f.run(i);
  const r = await f.manager.finish(); assert.deepEqual(assessShimmerPairs(r).faults, []);
  assert.equal(f.glassMaterial.version, 4409 + 64);
  for (const p of r.pairs) for (const m of p.members) assert.equal(
    m.after.identity.materials.find(x => x.uuid === f.glassMaterial.uuid).version,
    m.before.identity.materials.find(x => x.uuid === f.glassMaterial.uuid).version + 4);
}, { doubleSide: true, sharedGlass: true }));
await test('composed live capture separates extra renders, owns both query sets and restores in reverse order', () => fixture(async f => {
  const originalRender = f.c.renderer.render, originalRaw = f.raw.render, originalSim = f.c.sim.update;
  f.install(); installLiveHarness({ durationMs: 7000, instrument: true });
  for (let i = 0; i < 445; i++) { f.step(); if (window.__LIVE_PROFILE.current().after) break; }
  await f.settle(); const live = await window.__LIVE_PROFILE.done;
  assert.deepEqual(assessLiveWindow(live).faults, []);
  assert.deepEqual(assessShimmerPairs(live.shimmerPairs).faults, []);
  assert.equal(live.shimmerPairs.pairs.length, 8);
  assert(live.frames.every(row => row.cpu['render-total'].count === 1 && row.cpu['three-render'].count === 1));
  assert.equal(f.systemCalls, live.frames.length); assert.equal(f.renders, live.frames.length + 16);
  await window.__LIVE_PROFILE.cleanup(); await f.manager.cleanup();
  assert.equal(f.c.renderer.render, originalRender); assert.equal(f.raw.render, originalRaw); assert.equal(f.c.sim.update, originalSim);
  assert.equal(f.target.onBeforeRender, f.originalHook); assert.equal(f.raw.copyFramebufferToTexture, f.originalCopy);
  assert.equal(f.owned.size, 0); assert.equal(f.pendingRaf, 0);
}, { live: true }));
await test('renderer exception survives query failure and visibility is restored', () => fixture(async f => {
  f.install();
  assert.throws(() => f.run(0), error => error.message === 'ORIGINAL');
  assert.equal(f.target.visible, true); const r = await f.manager.finish();
  assert.match(r.fatal, /ORIGINAL/); assert.equal(assessShimmerPairs(r).valid, false); assert.equal(f.owned.size, 0);
}, { renderThrow: new Error('ORIGINAL'), endThrow: new Error('SECONDARY QUERY') }));
await test('actual DoubleSide direct-draw exception survives secondary query failure and hook cleanup', () => fixture(async f => {
  f.install(); assert.throws(() => f.run(0), error => error.message === 'ORIGINAL DIRECT');
  const r = await f.manager.finish(); assert.match(r.fatal, /ORIGINAL DIRECT/); assert.equal(assessShimmerPairs(r).valid, false);
  assert.equal(f.target.visible, true); assert.equal(f.owned.size, 0);
  await f.manager.cleanup(); assert.equal(f.raw.renderBufferDirect, f.originalDirect); assert.equal(f.target.onBeforeRender, f.originalHook);
}, { doubleSide: true, onDraw() { throw new Error('ORIGINAL DIRECT'); }, endThrow: new Error('SECONDARY END') }));
for (const [name, options] of [
  ['extra pre-draw material increment', { doubleSide: true, beforeGlass: ({ material }) => { material.needsUpdate = true; } }],
  ['material mutation during actual direct draw', { doubleSide: true, onDraw: ({ material }) => { material.needsUpdate = true; } }],
  ['non-version material mutation during actual direct draw', { doubleSide: true, onDraw: ({ material }) => { material.opacity = .2; } }],
  ['same-version particle data mutation', { onRender: ({ particle, renders }) => { if (renders === 1) particle.geometry.attributes.iPos.array[0] += 10; } }],
  ['shimmer uniform mutation', { onRender: ({ target, renders }) => { if (renders === 1) target.material.uniforms.uStrength.value += 1; } }],
  ['final-member target replacement', { onRender: ({ target, renders }) => { if (renders === 16) target.geometry = new THREE.PlaneGeometry(3, 3); } }],
  ['target detachment', { onRender: ({ target, renders }) => { if (renders === 1) target.removeFromParent(); } }],
  ['camera world mutation', { onRender: ({ c, renders }) => { if (renders === 1) c.camera.matrixWorld.elements[12] += 1; } }],
  ['copy happened despite disabled-copy uniforms', { onRender: ({ raw }) => raw.copyFramebufferToTexture() }],
]) await test('actual manager rejects ' + name, () => fixture(async f => {
  f.install(); let thrown = null; try { for (let i = 0; i < 8; i++) f.run(i); } catch (e) { thrown = e; }
  const r = await f.manager.finish(); assert.equal(assessShimmerPairs(r).valid, false, name); assert.equal(f.target.visible, true);
  assert.equal(f.owned.size, 0);
}, options));
for (const [name, options] of [['never-ready query deadline', { neverReady: true }], ['disjoint timer', { disjoint: true }],
  ['NaN result', { nanQuery: true }], ['createQuery null', { createNull: true }], ['foreign active query', { foreignQuery: true }]]) {
  await test('query ownership rejects ' + name, () => fixture(async f => {
    f.install(); try { for (let i = 0; i < 8; i++) f.run(i); } catch {}
    const r = await f.manager.finish(); assert.equal(assessShimmerPairs(r).valid, false); assert.equal(f.owned.size, 0); assert.equal(f.target.visible, true);
    if (options.neverReady) {
      assert.equal(r.gpu.drainTimedOut, true); assert.equal(r.gpu.unresolvedAtDrain, 16);
      assert.equal(r.gpu.pending, 0, 'deleted unresolved queries are not still owned');
    }
  }, options));
}
if (acceptedSide) {
  for (const [name, mutate] of [
    ['null material row', m => { m.before.identity.materials[0] = null; }],
    ['null graph row', m => { m.before.identity.graph[0] = null; }],
    ['null camera row', m => { m.before.identity.cameras[0] = null; }],
  ]) await test('standalone verifier rejects ' + name + ' without throwing', () => {
    const m = structuredClone(acceptedSide.pairs[0].members[0]); mutate(m);
    assert.equal(verifyShimmerSidePasses(m.before.identity, m.after.identity, m.sidePasses), false);
  });
  const corrupt = [
    ['no direct-draw witnesses', m => { m.sidePasses = []; }],
    ['missing front event', m => { m.sidePasses.pop(); }],
    ['reversed front/back events', m => { m.sidePasses.reverse(); }],
    ['duplicated complete events', m => { m.sidePasses.push(...structuredClone(m.sidePasses)); }],
    ['null direct event', m => { m.sidePasses[0] = null; }],
    ['unrelated object', m => { m.sidePasses[0].object = m.sidePasses[1].object = 'foreign-object'; }],
    ['unrelated geometry', m => { m.sidePasses[0].geometry = m.sidePasses[1].geometry = 'foreign-geometry'; }],
    ['unrelated camera', m => { m.sidePasses[0].camera = m.sidePasses[1].camera = 'foreign-camera'; }],
    ['mismatched front/back group', m => { m.sidePasses[1].group = { start: 0, count: 3, materialIndex: 0 }; }],
    ['extra version increment', m => { m.sidePasses[0].versionBefore++; }],
    ['version changed during direct call', m => { m.sidePasses[0].versionAfter++; }],
    ['throwing direct call', m => { m.sidePasses[0].threw = true; }],
    ['unsupported forceSinglePass', m => { m.sidePasses[0].forceSinglePassBefore = true; }],
    ['side not restored to DoubleSide', m => { m.after.identity.materials.find(x => x.uuid === m.sidePasses[0].material).side = THREE.FrontSide; }],
    ['unrelated non-version drift', m => { m.after.identity.materials.find(x => x.uuid === m.sidePasses[0].material).roughness += .1; }],
    ['missing raw version', m => { delete m.before.identity.materials.find(x => x.uuid === m.sidePasses[0].material).version; }],
  ];
  for (const [name, mutate] of corrupt) await test('side accounting rejects ' + name, () => {
    const r = structuredClone(acceptedSide); mutate(r.pairs[0].members[0]); assert.equal(assessShimmerPairs(r).valid, false);
  });
  await test('otherwise explainable version events cannot conceal drift between member boundaries', () => {
    const r = structuredClone(acceptedSide), m = r.pairs[0].members[1], id = m.sidePasses[0].material;
    m.before.identity.materials.find(x => x.uuid === id).version++;
    m.after.identity.materials.find(x => x.uuid === id).version++;
    m.sidePasses.forEach(e => { e.versionBefore++; e.versionAfter++; });
    assert.equal(verifyShimmerSidePasses(m.before.identity, m.after.identity, m.sidePasses), true);
    assert.equal(assessShimmerPairs(r).valid, false);
  });
}
if (accepted) {
  const mutations = [
    ['empty pair array', r => { r.pairs = []; }], ['null pair', r => { r.pairs[0] = null; }],
    ['null member', r => { r.pairs[0].members[0] = null; }], ['null query', r => { r.gpu.samples[0] = null; }],
    ['duplicate GPU sample', r => { r.gpu.samples[1] = r.gpu.samples[0]; }],
    ['negative GPU time', r => { r.gpu.samples[0].ms = -1; }], ['missing completed counter', r => { delete r.gpu.completed; }],
    ['missing camera evidence everywhere', r => { for (const p of r.pairs) for (const m of p.members) { delete m.before.identity.cameras; delete m.after.identity.cameras; } }],
    ['empty graph everywhere', r => { for (const p of r.pairs) for (const m of p.members) { m.before.identity.graph = []; m.after.identity.graph = []; } }],
    ['NaN camera matrices everywhere', r => { for (const p of r.pairs) for (const m of p.members) { m.before.identity.cameras[0].world[0] = NaN; m.after.identity.cameras[0].world[0] = NaN; } }],
    ['missing final identity proof', r => { delete r.pairs[7].members[1].target.identityHeldAtRenderEnd; }],
    ['false restore', r => { r.pairs[0].members[0].target.restored = false; }],
    ['mask inversion', r => { r.pairs[0].members[0].target.drawVisible = false; }],
    ['unobserved on hook', r => { r.pairs[0].members[0].hookCalls = 0; }],
    ['wrong frame association', r => { r.gpu.samples[0].frame = 100; }],
    ['copy-path uniforms enabled', r => { r.pairs[0].members[0].before.identity.shimmer.uHasScene = 1; }],
  ];
  for (const [name, mutate] of mutations) await test('assessor rejects ' + name + ' without throwing', () => {
    const r = structuredClone(accepted); mutate(r); assert.equal(assessShimmerPairs(r).valid, false);
  });
}
assert.equal(hash('./live-shimmer-pairs.mjs'), sourceHash, 'source changed during review');
assert.equal(hash('./profileframes.mjs'), profilerHash, 'profiler changed during review');
assert.equal(hash(threeRendererPath), threeSourceHash, 'installed Three source changed during review');
const report = { version: 1, generated: new Date().toISOString(), valid: results.every(r => r.pass),
  sourceHash, profilerHash, threeSourceHash, threeModuleHash: hash('../node_modules/three/build/three.module.js'),
  toolHash: hash('./checkheatshimmer-adversarial.mjs'), results,
  semantics: 'CPU-only manager/assessor adversarial proof using real Three scene objects and a fake query driver. No browser/GPU/FPS acceptance.' };
const out = process.argv.indexOf('--out');
if (out >= 0) fs.writeFileSync(new URL('../' + process.argv[out + 1], import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ valid: report.valid, groups: results.length, failures: results.filter(r => !r.pass), sourceHash, toolHash: report.toolHash }, null, 2));
if (!report.valid) process.exitCode = 1;
