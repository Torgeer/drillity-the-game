#!/usr/bin/env node
/** Shipping readout regression. Compares actual cached module with an in-memory
 * uncached reference; checks paint commands, numeric scheduling, geometry,
 * font-event invalidation and listener cleanup. CPU only: no raster/GPU/FPS.
 * node tools/checkreadoutcache-shipping.mjs [--json]
 */
import * as THREE from 'three';
import { LAYOUT } from '../src/core/contract.js';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Data-URL module stacks otherwise print the entire frozen geology source.
process.on('uncaughtException', (error) => {
  console.error(`READOUT CACHE CPU ERROR: ${error.message}`);
  process.exitCode = 1;
});

const args = process.argv.slice(2);
const sourceUrl = new URL('../src/world/geology.js', import.meta.url);
const source = readFileSync(sourceUrl, 'utf8').replaceAll('\r\n', '\n');
const hash = (s) => createHash('sha256').update(s).digest('hex');
const replaceOnce = (text, before, after) => {
  if (text.split(before).length !== 2) throw Error('Expected one cache reference anchor: ' + before.slice(0, 65));
  return text.replace(before, after);
};
const uncached = replaceOnce(source,
  '    if (readout.lastText === text) { readout.last = d; return; }', '');
const sourceBefore = hash(source), candidateHash = hash(source);

async function loadVirtual(code, label) {
  // Identical read-only probe in both variants; it is never written to source.
  code = replaceOnce(code, '    get profileMode() { return layout.id; },',
    '    get profileMode() { return layout.id; },\n    get __readoutCacheProbe() { return { last: readout?.last, lastText: readout?.lastText }; },');
  code = replaceOnce(code, "from 'three';", `from '${import.meta.resolve('three')}';`);
  code = replaceOnce(code, "from 'three/examples/jsm/utils/BufferGeometryUtils.js';",
    `from '${import.meta.resolve('three/examples/jsm/utils/BufferGeometryUtils.js')}';`);
  code = replaceOnce(code, "from '../core/contract.js';", `from '${new URL('../src/core/contract.js', import.meta.url).href}';`);
  return (await import('data:text/javascript;base64,' + Buffer.from(code + '\n// ' + label).toString('base64'))).createGeology;
}
const factories = await Promise.all([loadVirtual(uncached, 'uncached-reference'), loadVirtual(source, 'actual-shipping')]);
const noop = () => {};
const canvasStateKeys = ['fillStyle', 'strokeStyle', 'lineWidth', 'font', 'textAlign',
  'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'lineCap', 'lineJoin',
  'miterLimit', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY'];
function recordingContext(canvas) {
  const state = { fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '10px sans-serif',
    textAlign: 'start', textBaseline: 'alphabetic', globalAlpha: 1, globalCompositeOperation: 'source-over',
    lineCap: 'butt', lineJoin: 'miter', miterLimit: 10, shadowBlur: 0, shadowColor: 'rgba(0,0,0,0)',
    shadowOffsetX: 0, shadowOffsetY: 0 };
  const stack = [], unknown = new Map();
  const g = { canvas, ...state, commands: [], fullClears: 0, draws: 0, texts: [] };
  const active = () => canvas.width === 240 && canvas.height === 92;
  const pick = (keys) => Object.fromEntries(keys.map(k => [k, g[k]]));
  const paintState = ['globalAlpha', 'globalCompositeOperation', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY'];
  const record = (name, values, keys = []) => { if (active()) g.commands.push([name, values, pick(keys)]); };
  g.clearRect = (x, y, w, h) => {
    if (x <= 0 && y <= 0 && w >= canvas.width && h >= canvas.height) {
      g.commands = []; g.texts = []; g.fullClears++;
    }
    record('clearRect', [x, y, w, h]);
  };
  for (const name of ['beginPath', 'closePath', 'moveTo', 'lineTo', 'quadraticCurveTo',
    'bezierCurveTo', 'rect', 'arc', 'arcTo', 'ellipse']) g[name] = (...values) => record(name, values);
  g.fill = (...values) => { g.draws++; record('fill', values, ['fillStyle', ...paintState]); };
  g.stroke = (...values) => { g.draws++; record('stroke', values,
    ['strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', ...paintState]); };
  g.fillText = (text, ...values) => {
    g.draws++; if (active()) g.texts.push(String(text));
    record('fillText', [String(text), ...values], ['font', 'fillStyle', 'textAlign', 'textBaseline', ...paintState]);
  };
  g.measureText = (text) => ({ width: String(text).length * Number(/([\d.]+)px/.exec(g.font)?.[1] || 10) * 0.62 });
  g.save = () => stack.push(pick(canvasStateKeys));
  g.restore = () => Object.assign(g, stack.pop() || {});
  g.createLinearGradient = g.createRadialGradient = () => ({ addColorStop: noop });
  g.getImageData = () => ({ data: new Uint8ClampedArray(canvas.width * canvas.height * 4) });
  return new Proxy(g, { get(target, key) {
    if (key in target) return target[key];
    if (!unknown.has(key)) unknown.set(key, (...values) => {
      if (active()) throw Error(`Unmodelled readout Canvas2D method: ${String(key)}(${values.length})`);
    });
    return unknown.get(key);
  } });
}
const fontListeners = new Map();
const fontSet = {
  addEventListener(type, fn) { if (!fontListeners.has(type)) fontListeners.set(type, new Set()); fontListeners.get(type).add(fn); },
  removeEventListener(type, fn) { fontListeners.get(type)?.delete(fn); },
  dispatch(type) { for (const fn of [...(fontListeners.get(type) || [])]) fn({type}); },
  count() { return [...fontListeners.values()].reduce((n,s) => n+s.size,0); }
};
globalThis.document = { fonts: fontSet, createElement(tag) {
  if (tag !== 'canvas') throw Error('Unexpected DOM dependency: ' + tag);
  const canvas = { width: 1, height: 1 };
  canvas.getContext = (kind) => {
    if (kind !== '2d') throw Error('GPU context requested: ' + kind);
    return canvas.ctx ??= recordingContext(canvas);
  };
  return canvas;
} };

const HZ = 60, DT = 1 / HZ, FRAMES = 1200, SETTLE = 600;
const report = { evidence: 'CPU recorded readout paint commands/state and real Three.js geometry/texture versions',
  sourceSha256: sourceBefore, candidateSha256: candidateHash, normalizedLineEndings: 'LF',
  comparison: 'Actual shipping cache versus virtual uncached drawReadout; both use current generator',
  fixtureProvenance: 'NOT SOURCED synthetic depths/rates/layouts; not physical game balancing',
  limitations: ['No browser, raster, real font metrics, WebGL, GPU uploads, timing, FPS or visual equivalence proof.',
    'Synthetic 0.62-em width for unrelated Canvas layout; the readout never uses measureText.',
    'Identical normalized paint commands plus Canvas state are command-level output evidence only.',
    'Private last/cache values are read through an identical in-memory probe in both variants.'],
  assertions: 0, failures: [], cases: [] };
function check(ok, label, detail = {}) { report.assertions++; if (!ok && report.failures.length < 30) report.failures.push({ label, ...detail }); }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function applyCamera(ctx) {
  const hw = 20 * 0.5 * ctx.stage.w / (ctx.stage.h * LAYOUT.sectionHeight);
  const hh = hw / Math.max(0.25, ctx.bands.section.w / ctx.bands.section.h);
  Object.assign(ctx.sectionCamera, { left: -hw, right: hw, top: hh, bottom: -hh });
  ctx.sectionCamera.updateProjectionMatrix(); ctx.sectionCamera.updateMatrixWorld();
}
async function createRuntime(factory, mode, spec = {}) {
  const stage = { w: 390, h: 844, x: 0, y: 0 }, band = { w: 390, h: 261, x: 0, y: 359 };
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  camera.position.set(0, 0, 30); camera.lookAt(0, 0, 0);
  const ctx = { THREE, viewport: stage, stage, bands: { section: band }, sectionCamera: camera,
    sectionScene: new THREE.Scene(), quality: { id: 'low', strataSegments: 48, anisotropy: 4 },
    state: { world: { regionId: 'nordic' }, drill: { depth: 0, stage: 0, stageProgress: 0 } } };
  applyCamera(ctx); const geo = factory(ctx); await geo.init();
  geo.generateProfile({ regionId: 'nordic', seed: 20260903, difficulty: 0.25, targetDepth: 300,
    holeDiaMm: 216, methodId: null, ...spec, profileMode: mode });
  return { geo, ctx, settle(depth, pass = 0, progress = 0) {
    Object.assign(ctx.state.drill, { depth, stage: pass, stageProgress: progress });
    for (let i = 0; i < SETTLE; i++) geo.update(DT, ctx.state);
  } };
}
function snapshot({ geo, ctx }) {
  ctx.sectionScene.updateMatrixWorld(true);
  const mesh = ctx.sectionScene.getObjectByName('depth-readout');
  if (!mesh) throw Error('Missing depth-readout');
  const texture = mesh.material.map, canvas = texture.image, g = canvas.ctx;
  return { texture, mesh, version: texture.version, sourceVersion: texture.source.version, clears: g.fullClears,
    output: { dimensions: [canvas.width, canvas.height], commands: g.commands,
      canvasState: Object.fromEntries(canvasStateKeys.map(k => [k, g[k]])), texts: g.texts },
    geometry: { positions: Array.from(mesh.geometry.attributes.position.array), matrix: [...mesh.matrixWorld.elements],
      cameraProjection: [...ctx.sectionCamera.projectionMatrix.elements], visible: mesh.visible,
      root: [geo.sectionRoot.position.x, geo.sectionRoot.position.y], mode: geo.profileMode,
      actionTvd: geo.modeLayout.depthAtY0 - geo.boreholeTip.position.y,
      pxPerMetre: geo.pxPerMetre, visibleMetres: geo.visibleMetres },
    last: geo.__readoutCacheProbe.last, cacheText: geo.__readoutCacheProbe.lastText };
}
const noopAdvance = () => {};
const fixtures = [
  { name: '150-to-151-one-decimal', mode: 'vertical', prepare: r => r.settle(150),
    advance: (r, f) => { r.ctx.state.drill.depth = 150 + (f + 1) * DT * 0.05; } },
  { name: '99.9-to-100.1-format-boundary', mode: 'vertical', prepare: r => r.settle(99.9),
    advance: (r, f) => { r.ctx.state.drill.depth = 99.9 + (f + 1) * DT * 0.01; } },
  { name: 'vertical-scroll-jump-20-to-120', mode: 'vertical', prepare: r => r.settle(20),
    advance: r => { r.ctx.state.drill.depth = 120; } },
  { name: 'mode-transitions-all-five', mode: 'vertical', prepare: r => r.settle(0),
    advance: (r, f) => { if (f % 240 === 0) {
      r.geo.setProfileMode(['profile', 'raise', 'heading', 'pile', 'vertical'][f / 240]);
      Object.assign(r.ctx.state.drill, { depth: 0, stage: 0, stageProgress: 0 });
    } } },
  { name: 'resize-at-unchanged-150', mode: 'vertical', prepare: r => r.settle(150),
    advance: (r, f) => { if (f % 300 === 0) {
      const [w, h] = [[320, 568], [430, 932], [390, 844], [390, 844]][f / 300];
      Object.assign(r.ctx.stage, { w, h }); Object.assign(r.ctx.bands.section, { w, h: Math.round(h * (f === 900 ? 0.24 : 0.31)) });
      applyCamera(r.ctx); r.geo.resize(w, h);
    } } },
  ...[['deep-HDD-return-exit-tangent', 0.05], ['deep-HDD-return-flat', 0.45]].map(([name, fraction]) => ({
    name, mode: 'profile', spec: { targetDepth: 1200, holeDiaMm: 382, seed: 1337 },
    prepare: r => { const total = r.geo.modeLayout.totalLength;
      r.settle(total * 0.5); r.settle(total); r.settle(total, 1, total * fraction); },
    advance: (r, f) => { r.ctx.state.drill.stageProgress = r.geo.modeLayout.totalLength * fraction + (f + 1) * DT; } })),
];

for (const fixture of fixtures) {
  const variants = [await createRuntime(factories[0], fixture.mode, fixture.spec), await createRuntime(factories[1], fixture.mode, fixture.spec)];
  try {
    variants.forEach(fixture.prepare);
    let previous = variants.map(snapshot);
    const metrics = variants.map(() => ({ invalidations: 0, clears: 0, replacements: 0, changedStrings: 0 }));
    const strings = new Set(previous[0].output.texts), fonts = new Set([previous[0].output.canvasState.font]);
    const modes = new Set([previous[0].geometry.mode]);
    const startText = previous[0].output.texts.join('');
    check(same(previous[0].output, previous[1].output), 'initial-output-equal', { case: fixture.name });
    for (let f = 0; f < FRAMES; f++) {
      variants.forEach(r => { (fixture.advance || noopAdvance)(r, f); r.geo.update(DT, r.ctx.state); });
      const now = variants.map(snapshot), detail = { case: fixture.name, frame: f + 1 };
      check(now.every(s => s.output.commands.length > 0 && s.output.texts.length === 1
        && /^\d+\.\d+$/.test(s.output.texts[0])), 'nonempty-readout-paint-output', detail);
      check(same(now[0].output, now[1].output), 'paint-commands-and-canvas-state-equal', detail);
      check(same(now[0].geometry, now[1].geometry), 'geometry-camera-action-equal', detail);
      check(now[0].last === now[1].last, 'numeric-repaint-scheduling-state-equal', detail);
      check(now[1].cacheText === now[1].output.texts[0], 'cache-key-matches-painted-text', detail);
      now.forEach((s, i) => {
        const old = previous[i], replaced = s.texture !== old.texture;
        const versions = s.version - (replaced ? 1 : old.version);
        const sourceVersions = s.sourceVersion - (replaced ? 1 : old.sourceVersion);
        const clears = s.clears - (replaced ? 0 : old.clears);
        check(versions >= 0 && versions === clears && sourceVersions === versions,
          'invalidations-match-full-clears', { ...detail, variant: i, versions, sourceVersions, clears });
        metrics[i].invalidations += versions; metrics[i].clears += clears;
        metrics[i].replacements += Number(replaced);
        metrics[i].changedStrings += Number(!same(s.output.texts, old.output.texts));
        if (replaced) check(s.output.commands.length > 0 && clears === 1, 'new-canvas-painted-once', { ...detail, variant: i });
      });
      now[0].output.texts.forEach(s => strings.add(s)); fonts.add(now[0].output.canvasState.font); modes.add(now[0].geometry.mode);
      previous = now;
    }
    if (fixture.name === '150-to-151-one-decimal') {
      check(metrics[1].invalidations === metrics[1].changedStrings && metrics[1].invalidations < metrics[0].invalidations,
        'same-string-repaints-actually-suppressed', { metrics });
    }
    check(metrics[1].invalidations <= metrics[0].invalidations, 'candidate-never-more-invalidations', { case: fixture.name, metrics });
    check(metrics[0].changedStrings === metrics[1].changedStrings, 'changed-string-count-equal', { case: fixture.name, metrics });
    if (fixture.name.startsWith('99.9')) check(strings.has('99.99') && strings.has('100.0') && strings.has('100.1') && fonts.size === 2,
      'precision-and-font-size-boundary-exercised', { strings: [...strings], fonts: [...fonts] });
    if (fixture.name.startsWith('mode-')) check(modes.size === 5, 'all-five-modes-exercised', { modes: [...modes] });
    if (fixture.name.startsWith('resize-')) check(metrics.every(m => m.replacements === 4), 'four-fresh-canvas-resizes-exercised', { metrics });
    report.cases.push({ name: fixture.name, frames: FRAMES, updateHz: HZ, simulatedSeconds: FRAMES / HZ,
      base: metrics[0], candidate: metrics[1], startText, endText: previous[0].output.texts.join(''),
      distinctTextStrings: [...strings], nominalCanvasFonts: [...fonts], modes: [...modes],
      finalActionTvd: previous[0].geometry.actionTvd });
  } finally { variants.forEach(r => r.geo.dispose()); }
}
check(report.cases.length === 7, 'complete-nonempty-case-matrix');
check(fontSet.count() === 0, 'all-paired-runtimes-release-font-listeners');
const fontRuntime = await createRuntime(factories[1], 'vertical');
try {
  fontRuntime.settle(150);
  check(fontSet.count() === 2, 'one-listener-per-font-event');
  for (const type of ['loadingdone', 'loadingerror']) {
    const before = snapshot(fontRuntime);
    fontSet.dispatch(type);
    fontRuntime.geo.update(DT, fontRuntime.ctx.state);
    const after = snapshot(fontRuntime);
    check(after.version === before.version + 1 && same(after.output, before.output),
      'font-event-repaints-stationary-readout-once', { type });
    fontRuntime.geo.update(DT, fontRuntime.ctx.state);
    check(snapshot(fontRuntime).version === after.version, 'font-event-invalidation-settles', { type });
  }
} finally { fontRuntime.geo.dispose(); }
check(fontSet.count() === 0, 'font-listeners-disposed');
fontSet.dispatch('loadingdone');
check(fontSet.count() === 0, 'late-font-event-has-no-disposed-listener');

check(hash(readFileSync(sourceUrl, 'utf8').replaceAll('\r\n', '\n')) === sourceBefore, 'frozen-production-source-unchanged');
report.passed = report.failures.length === 0;
if (args.includes('--json')) console.log(JSON.stringify(report));
else {
  console.log(`READOUT CACHE CPU: ${report.cases.length} cases, ${report.assertions} assertions, ${report.failures.length} failures`);
  console.log('Texture invalidations and recorded paint-command equivalence; NOT raster, GPU uploads or FPS.');
  for (const c of report.cases) console.log(`${c.name}: invalidations ${c.base.invalidations} -> ${c.candidate.invalidations}; changed strings ${c.base.changedStrings}; new canvases ${c.base.replacements}`);
  if (!report.passed) console.log(JSON.stringify(report.failures, null, 2));
  console.log(`VERDICT: ${report.passed ? 'PASS' : 'FAIL'}`);
}
if (!report.passed) process.exitCode = 1;
