#!/usr/bin/env node
/** CPU regression for section instruments. No WebGL, browser, models or GPU.
 * Runs the real geology implementation and projects its real Three.js meshes.
 * Canvas text widths are SYNTHETIC (0.62 em/character); they are an adversarial
 * layout fixture, never evidence of real glyph clipping, contrast or legibility.
 * Nominal font sizes, camera spans, mesh bounds and axis values are measured.
 * All dimensions/depths below are synthetic regression fixtures, NOT SOURCED
 * physical dimensions. They are not claims about production phone layouts.
 * Usage: node tools/checkruler.mjs [--report-only] [--json path] [--width-em 0.62]
 */
import * as THREE from 'three';
import { createGeology } from '../src/world/geology.js';
import { LAYOUT } from '../src/core/contract.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const reportOnly = args.includes('--report-only');
const jsonPath = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
if (args.includes('--json') && !jsonPath) throw new Error('--json requires a path');
const widthEm = args.includes('--width-em') ? Number(args[args.indexOf('--width-em') + 1]) : 0.62;
if (!Number.isFinite(widthEm) || widthEm <= 0 || widthEm > 2) throw new Error('--width-em must be in (0, 2]');
const noop = () => {};
const fontSize = (font) => Number(/([\d.]+)px/.exec(font)?.[1] || 10);
function recordingContext(canvas) {
  const stateKeys = ['font', 'textAlign', 'textBaseline', 'fillStyle', 'globalAlpha'];
  const stack = [];
  const target = {
    canvas, calls: [], paintedPaths: [], pathPoints: [], font: '10px sans-serif', textAlign: 'left',
    textBaseline: 'alphabetic', fillStyle: '#000', globalAlpha: 1,
    measureText(text) {
      const em = fontSize(this.font);
      return { width: String(text).length * em * widthEm,
        actualBoundingBoxAscent: em * 0.8, actualBoundingBoxDescent: em * 0.2 };
    },
    fillText(text, x, y, maxWidth) {
      const em = fontSize(this.font);
      const width = Math.min(this.measureText(text).width, maxWidth ?? Infinity);
      this.calls.push({ text: String(text), x, y, width, em, font: this.font,
        align: this.textAlign, baseline: this.textBaseline, color: this.fillStyle });
    },
    clearRect(x, y, w, h) {
      if (x <= 0 && y <= 0 && w >= canvas.width && h >= canvas.height) {
        this.calls = []; this.paintedPaths = [];
      }
    },
    // Cursor paint consists of a triangle and arcTo rounded rectangle. Record
    // their control-point bounds separately: the mesh's transparent margin
    // must not be reported as an opaque cursor/footer collision. Curve-corner
    // AABBs remain conservative and are not raster opacity evidence.
    beginPath() { this.pathPoints = []; },
    moveTo(x, y) { this.pathPoints.push({ x, y }); },
    lineTo(x, y) { this.pathPoints.push({ x, y }); },
    arcTo(x1, y1, x2, y2) { this.pathPoints.push({ x: x1, y: y1 }, { x: x2, y: y2 }); },
    fill() {
      if (this.pathPoints.length) this.paintedPaths.push({ ...rectOf(this.pathPoints), pad: 0 });
    },
    stroke() {
      if (this.pathPoints.length) this.paintedPaths.push({ ...rectOf(this.pathPoints), pad: (this.lineWidth || 1) / 2 });
    },
    save() { stack.push(Object.fromEntries(stateKeys.map((key) => [key, this[key]]))); },
    restore() { Object.assign(this, stack.pop() || {}); },
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    getImageData: () => ({ data: new Uint8ClampedArray(canvas.width * canvas.height * 4) }),
  };
  return new Proxy(target, { get: (o, p) => p in o ? o[p] : noop });
}
globalThis.document = {
  createElement(tag) {
    if (tag !== 'canvas') throw new Error(`Unexpected DOM dependency: ${tag}`);
    const canvas = { width: 1, height: 1 };
    canvas.getContext = (type) => {
      if (type !== '2d') throw new Error(`GPU context requested: ${type}`);
      return canvas.ctx ??= recordingContext(canvas);
    };
    return canvas;
  },
};

const report = {
  instrument: 'CPU / actual Three.js projection / synthetic text widths',
  syntheticWidthEm: widthEm,
  fixtureProvenance: 'Synthetic regression inputs; NOT SOURCED physical dimensions or shipping layouts',
  sourceSha256: Object.fromEntries(['src/world/geology.js', 'src/core/renderer.js'].map((path) =>
    [path, createHash('sha256').update(readFileSync(new URL(`../${path}`, import.meta.url))).digest('hex')])),
  limitations: ['No browser, WebGL, real fonts, raster pixels, contrast, postprocessing, or GLB verification',
    'Recorded text bounds use nominal em height and synthetic widths; text calls can include later overpainted text'],
  checks: 0, failures: [], observations: [], cases: [],
};
function check(ok, label, detail) {
  report.checks++;
  if (!ok) report.failures.push({ label, ...detail });
}
function project(point, camera, band) {
  const p = point.clone().project(camera);
  return { x: band.x + (p.x + 1) * band.w / 2, y: band.y + (1 - p.y) * band.h / 2 };
}
function rectOf(points) {
  return { left: Math.min(...points.map((p) => p.x)), right: Math.max(...points.map((p) => p.x)),
    top: Math.min(...points.map((p) => p.y)), bottom: Math.max(...points.map((p) => p.y)) };
}
function meshRect(mesh, camera, band) {
  const pos = mesh.geometry.getAttribute('position');
  if (!pos || !pos.count) throw new Error(`${mesh.name} has no vertices`);
  return rectOf(Array.from({ length: pos.count }, (_, i) => project(
    new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld), camera, band)));
}
function inside(rect, band, tolerance = 0.75) {
  return rect.left >= band.x - tolerance && rect.right <= band.x + band.w + tolerance
    && rect.top >= band.y - tolerance && rect.bottom <= band.y + band.h + tolerance;
}
function textRects(mesh, camera, band) {
  const canvas = mesh.material.map?.image;
  if (!canvas?.ctx) return [];
  const { width, height } = mesh.geometry.parameters;
  const p = (x, y) => project(new THREE.Vector3(
    (x / canvas.width - 0.5) * width, (0.5 - y / canvas.height) * height, 0,
  ).applyMatrix4(mesh.matrixWorld), camera, band);
  return canvas.ctx.calls.map((call) => {
    const x = call.x - (call.align === 'right' || call.align === 'end' ? call.width
      : call.align === 'center' ? call.width / 2 : 0);
    const y = call.y - (call.baseline === 'top' || call.baseline === 'hanging' ? 0
      : call.baseline === 'middle' ? call.em / 2 : call.em * 0.8);
    const rect = rectOf([p(x, y), p(x + call.width, y), p(x, y + call.em), p(x + call.width, y + call.em)]);
    return { ...call, ...rect, anchor: p(call.x, call.y), fontCss: Math.abs(p(0, call.em).y - p(0, 0).y),
      visible: rect.bottom > band.y && rect.top < band.y + band.h
        && rect.right > band.x && rect.left < band.x + band.w,
      source: mesh.name };
  });
}
function overlap(a, b, gap = 0) {
  return a.left < b.right + gap && a.right + gap > b.left
    && a.top < b.bottom + gap && a.bottom + gap > b.top;
}
function cursorPaintRects(mesh, camera, band) {
  const canvas = mesh.material.map.image;
  const { width, height } = mesh.geometry.parameters;
  const p = (x, y) => project(new THREE.Vector3((x / canvas.width - 0.5) * width,
    (0.5 - y / canvas.height) * height, 0).applyMatrix4(mesh.matrixWorld), camera, band);
  return canvas.ctx.paintedPaths.map(({ left, right, top, bottom, pad }) => rectOf([
    p(left - pad, top - pad), p(right + pad, top - pad),
    p(left - pad, bottom + pad), p(right + pad, bottom + pad),
  ]));
}
function applyCamera(ctx, zoom = 1) {
  // Renderer width-anchor policy (renderer.js updateSectionFrustum), using
  // real camera projection below as the measurement authority.
  const hw = ctx.sectionView?.viewMetres * 0.5 || 10;
  const widthHalf = hw * ctx.stage.w / (ctx.stage.h * LAYOUT.sectionHeight);
  const heightHalf = widthHalf / Math.max(0.25, ctx.bands.section.w / Math.max(1, ctx.bands.section.h));
  Object.assign(ctx.sectionCamera, { left: -widthHalf, right: widthHalf,
    top: heightHalf, bottom: -heightHalf, zoom });
  ctx.sectionCamera.updateProjectionMatrix();
  ctx.sectionCamera.updateMatrixWorld();
}
function settle(geo, ctx, frames = 90) {
  for (let i = 0; i < frames; i++) geo.update(1 / 30, ctx.state);
  ctx.sectionScene.updateMatrixWorld(true);
}
function measure(geo, ctx, label, { atSpud = false, deep = false, driven = false, deepHdd = false } = {}) {
  const camera = ctx.sectionCamera, band = ctx.bands.section;
  const detail = { case: label, mode: geo.profileMode };
  const top = new THREE.Vector3(0, 1, 0).unproject(camera);
  const bottom = new THREE.Vector3(0, -1, 0).unproject(camera);
  const span = top.distanceTo(bottom);
  const origin = project(new THREE.Vector3(0, 0, 0), camera, band);
  const metre = project(new THREE.Vector3(0, -1, 0), camera, band);
  check(Math.abs(geo.visibleMetres - span) < 1e-4, 'camera-visible-span', { ...detail, actual: geo.visibleMetres, expected: span });
  check(Math.abs(ctx.sectionView.visibleMetres - span) < 1e-4, 'published-visible-span', detail);
  check(Math.abs(geo.pxPerMetre - Math.abs(origin.y - metre.y)) < 1e-4, 'camera-pixels-per-metre', detail);
  check(Math.abs(ctx.sectionView.viewMetres - 20) < 1e-6, 'stable-scale-anchor', detail);
  check(geo.modeLayout.id === detail.mode, 'mode-contract', detail);
  check(Math.abs(ctx.sectionView.metresPerUnitX - geo.modeLayout.metresPerUnitX) < 1e-6,
    'published-horizontal-scale', detail);
  check(Math.abs(ctx.sectionView.verticalExaggeration - geo.modeLayout.verticalExaggeration) < 1e-6,
    'published-vertical-exaggeration', detail);
  const groundY = project(new THREE.Vector3(0, geo.worldYForDepth(0), 0), camera, band).y - band.y;
  if (atSpud && geo.profileMode !== 'heading') check(groundY > 1 && groundY < band.h * 0.35, 'ground-visible-at-spud', { ...detail, groundY });
  const get = (name) => ctx.sectionScene.getObjectByName(name);
  const names = ['depth-ruler', 'drill-log', 'depth-readout', 'scale-plate'];
  if (geo.modeLayout.horizontal) names.push('station-ruler');
  for (const name of names) check(!!get(name)?.visible, 'instrument-present', { ...detail, name });
  for (const name of ['depth-ruler', 'drill-log']) {
    const bounds = meshRect(get(name), camera, band);
    check(bounds.left >= band.x - 0.75 && bounds.right <= band.x + band.w + 0.75,
      'instrument-horizontal-mesh-bounds', { ...detail, name, bounds });
  }
  check(!!get('station-ruler') === geo.modeLayout.horizontal, 'station-ruler-mode-scope', detail);
  const texts = names.flatMap((name) => get(name) ? textRects(get(name), camera, band) : []);
  const visible = texts.filter((text) => text.visible);
  check(visible.length > 3, 'nonempty-instrument-text', { ...detail, count: visible.length });
  const marker = get('depth-readout');
  let markerMeasurement = null;
  if (marker) {
    const bounds = meshRect(marker, camera, band);
    check(inside(bounds, band), 'depth-marker-bounds', { ...detail, bounds });
    const printed = marker.material.map.image.ctx.calls.find((call) => /^-?\d+(\.\d+)?$/.test(call.text));
    const world = marker.getWorldPosition(new THREE.Vector3());
    const actionWorld = geo.boreholeTip.getWorldPosition(new THREE.Vector3());
    const expectedTvd = geo.worldYForDepth(0) - world.y;
    check(!!printed && Math.abs(Number(printed.text) - expectedTvd) <= (expectedTvd < 100 ? 0.035 : 0.11),
      'depth-marker-axis', { ...detail, printed: printed?.text, expectedTvd });
    const actionDeltaPx = Math.abs(project(world, camera, band).y - project(actionWorld, camera, band).y);
    check(actionDeltaPx < 0.01, 'depth-marker-action-alignment', { ...detail, actionDeltaPx });
    markerMeasurement = { bounds, paintBounds: cursorPaintRects(marker, camera, band), printed: printed?.text, expectedTvd,
      actionTvd: geo.worldYForDepth(0) - actionWorld.y, actionDeltaPx };
    check(markerMeasurement.paintBounds.length >= 2, 'nonempty-cursor-paint-measurement', detail);
    for (const text of texts.filter((text) => text.source === 'depth-readout')) {
      check(text.left >= bounds.left - 0.5 && text.right <= bounds.right + 0.5,
        'depth-marker-text-fixture-fit', { ...detail, text, bounds });
    }
  }
  const footer = visible.filter((text) => text.source === 'scale-plate');
  if (geo.profileMode === 'heading') {
    check(footer.some((text) => /TUNNEL HEIGHT TRUE SCALE/.test(text.text)), 'tunnel-height-scale-declared', detail);
  } else {
    const declaration = footer.find((text) => /Ø/.test(text.text));
    const diameter = declaration?.text.match(/Ø\s*(\d+)→(\d+) mm · (?:DRAWN)?×([\d.]+)/);
    check(!!diameter, 'bore-scale-declared', { ...detail, text: declaration?.text });
    if (diameter) {
      // Compare the printed final diameter with the actual face shader radius
      // uniforms, not another label. CPU checks uniforms; no shader execution.
      const uniforms = get('section-face').material.uniforms;
      const radius = geo.profileMode === 'profile'
        ? Math.max(uniforms.uPathC.value.w, uniforms.uBore.value.z) : uniforms.uHoleR.value;
      const nominalMm = Number(geo.holeDiaMm);
      check(Number(diameter[1]) === Math.round(nominalMm)
        && Number(diameter[2]) === Math.round(2 * radius * 1000)
        && Math.abs(Number(diameter[3]) - 2 * radius * 1000 / nominalMm) <= 0.051,
      'bore-scale-values', { ...detail, text: declaration.text, radius, nominalMm });
      if (geo.profileMode === 'profile' || geo.profileMode === 'raise') {
        check(/FINAL/.test(declaration.text), 'final-bore-qualified', detail);
      }
    }
  }
  if (geo.modeLayout.horizontal) {
    const axis = footer.find((text) => /V\.?E\.?/.test(text.text));
    const ve = axis?.text.match(/V\.?E\.?\s*×([\d.]+)/);
    check(!!ve && Math.abs(Number(ve[1]) - geo.modeLayout.verticalExaggeration) <= 0.051,
      'horizontal-exaggeration-declared', { ...detail, text: axis?.text });
    check(!!axis && /TVD m/.test(axis.text) && /OFFSET m/.test(axis.text),
      'horizontal-axes-named', { ...detail, text: axis?.text });
  }
  for (const text of footer) {
    check(text.fontCss >= 9.45, 'footer-type-size', { ...detail, text: text.text, fontCss: text.fontCss });
    check(inside(text, band), 'footer-text-fixture-bounds', { ...detail, text });
  }
  for (let i = 0; i < footer.length; i++) for (let j = i + 1; j < footer.length; j++) {
    check(!overlap(footer[i], footer[j]), 'footer-text-fixture-overlap', { ...detail, a: footer[i].text, b: footer[j].text });
  }
  if (markerMeasurement) {
    for (const text of footer) {
      check(!markerMeasurement.paintBounds.some((bounds) => overlap(text, bounds)),
        'footer-text-fixture-marker-clearance',
        { ...detail, text: text.text, textBounds: text, markerBounds: markerMeasurement.paintBounds });
    }
  }
  const rulerTexts = visible.filter((text) => text.source === 'depth-ruler');
  const rulerNumbers = rulerTexts.filter((text) => /^\d+(\.\d+)?$/.test(text.text));
  check(rulerNumbers.length > 0, 'nonempty-ruler-number-measurement', detail);
  for (const text of rulerNumbers) {
    // Check the actual numeric anchor, independent of synthetic glyph width.
    const expectedY = project(new THREE.Vector3(0, geo.worldYForDepth(Number(text.text)), 0), camera, band).y;
    check(Math.abs(text.anchor.y - expectedY) < 0.15, 'ruler-number-axis',
      { ...detail, text: text.text, anchorY: text.anchor.y, expectedY });
    check(text.fontCss >= 9.45, 'ruler-number-type-size',
      { ...detail, text: text.text, fontCss: text.fontCss });
  }
  if (deep) check(rulerNumbers.some((text) => Number(text.text) >= 1000),
    'four-digit-ruler-exercised', { ...detail, numbers: rulerNumbers.map((text) => text.text) });
  if (driven) {
    check(geo.pile?.driven === true, 'driven-pile-fixture-exercised', detail);
    check(rulerTexts.some((text) => /BLOWS/.test(text.text)), 'driving-record-heading-visible', detail);
    check(rulerNumbers.length > 0, 'driving-record-depth-scale-visible', detail);
  }
  const logTexts = visible.filter((text) => text.source === 'drill-log');
  if (geo.profileMode === 'heading') {
    check(!logTexts.some((text) => /\bMPa\b/.test(text.text)), 'heading-column-no-laboratory-strength', detail);
  }
  const plateBounds = meshRect(get('scale-plate'), camera, band);
  if (deepHdd) {
    check(geo.borePath.Dc > geo.visibleMetres, 'deep-profile-exercised',
      { ...detail, cover: geo.borePath.Dc, visibleMetres: geo.visibleMetres });
    check(markerMeasurement.bounds.bottom <= plateBounds.top + 0.75,
      'deep-profile-cursor-above-footer', { ...detail, markerBounds: markerMeasurement.bounds, plateBounds });
  }
  for (const text of logTexts) {
    check(text.fontCss >= 9.45, 'log-label-type-size', { ...detail, text: text.text, fontCss: text.fontCss });
    check(inside(text, band), 'log-text-fixture-band-bounds', { ...detail, text });
    check(text.bottom <= plateBounds.top + 0.75, 'log-text-fixture-footer-clearance',
      { ...detail, text: text.text, bottom: text.bottom, footerTop: plateBounds.top });
  }
  for (let i = 0; i < logTexts.length; i++) for (let j = i + 1; j < logTexts.length; j++) {
    check(!overlap(logTexts[i], logTexts[j]), 'log-text-fixture-overlap',
      { ...detail, a: logTexts[i].text, b: logTexts[j].text });
  }
  const escaped = visible.filter((text) => !inside(text, band));
  if (escaped.length) report.observations.push({ ...detail, syntheticTextCrossingBand: escaped.map(({ text, source, top, bottom, left, right }) => ({ text, source, top, bottom, left, right })) });
  ctx.sectionScene.traverse((object) => {
    for (const mat of Array.isArray(object.material) ? object.material : [object.material]) {
      if (mat) check(!(mat.transmission > 0), 'zero-transmission', { ...detail, material: mat.name });
    }
  });
  const logMesh = get('drill-log');
  const logWorld = logMesh.getWorldPosition(new THREE.Vector3());
  report.cases.push({ ...detail, band: { ...band }, zoom: camera.zoom,
    requestedTarget: geo.spec.targetDepth, actualTotalLength: geo.modeLayout.totalLength,
    generatedProfileDepth: geo.profileDepth,
    rawMeasuredLength: ctx.state.drill.depth, stage: geo.stage, stageProgress: geo.stageProgress,
    visibleMetres: geo.visibleMetres, pxPerMetre: geo.pxPerMetre, groundY,
    marker: markerMeasurement, logMesh: meshRect(logMesh, camera, band),
    logWindowTopMetres: logWorld.y + logMesh.geometry.parameters.height / 2 - top.y,
    strata: geo.strata.map(({ id, name, top, bottom }) => ({ id, name, top, bottom })),
    textCount: visible.length, texts: visible,
    footerMinimumFontCss: Math.min(...footer.map((text) => text.fontCss)) });
}

for (const [width, height] of [[320, 568], [390, 844], [430, 932]]) {
  const stage = { w: width, h: height, x: 0, y: 0 };
  const band = { w: width, h: Math.round(height * 0.31), x: 0, y: Math.round(height * 0.42) };
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  camera.position.set(0, 0, 30); camera.lookAt(0, 0, 0);
  const ctx = { THREE, viewport: stage, stage, bands: { section: band }, sectionCamera: camera,
    sectionScene: new THREE.Scene(), quality: { id: 'low', strataSegments: 48, anisotropy: 4 },
    state: { world: { regionId: 'nordic' }, drill: { depth: 0, stage: 0, stageProgress: 0 } } };
  applyCamera(ctx);
  const geo = createGeology(ctx); await geo.init();
  for (const mode of ['vertical', 'profile', 'raise', 'heading', 'pile']) {
    geo.generateProfile({ regionId: 'nordic', targetDepth: 60, seed: 20260903, difficulty: 0.25,
      // The synthetic 6000 mm raise exercises a displayed diameter below
      // nominal size; the other modes exercise exaggeration above 1×.
      holeDiaMm: mode === 'raise' ? 6000 : 152, profileMode: mode, methodId: null });
    check(geo.profileMode === mode, 'requested-mode-preserved', { mode, actual: geo.profileMode });
    for (const fraction of [0, 0.35, 0.95]) {
      ctx.state.drill.depth = geo.modeLayout.totalLength * fraction;
      ctx.state.drill.stage = 0; ctx.state.drill.stageProgress = 0;
      settle(geo, ctx);
      measure(geo, ctx, `${width}x${height}/${mode}/${fraction}`, { atSpud: fraction === 0 });
    }
    if (mode === 'profile' || mode === 'raise') {
      ctx.state.drill.stage = 1; ctx.state.drill.stageProgress = geo.modeLayout.totalLength * 0.4;
      settle(geo, ctx); measure(geo, ctx, `${width}x${height}/${mode}/second-pass`);
      ctx.state.drill.stage = 0; ctx.state.drill.stageProgress = 0;
    }
    // HUD-only band resize: the renderer changes camera/band without window resize.
    const oldHeight = band.h; band.h = Math.round(height * 0.24); applyCamera(ctx);
    settle(geo, ctx); measure(geo, ctx, `${width}x${height}/${mode}/chrome-resize`);
    band.h = oldHeight; applyCamera(ctx); settle(geo, ctx);
    // An explicit resize must preserve the same measurement contract at zoom.
    applyCamera(ctx, 1.2); geo.resize(width, height); settle(geo, ctx);
    measure(geo, ctx, `${width}x${height}/${mode}/zoom`);
    applyCamera(ctx); geo.resize(width, height); settle(geo, ctx);
    if (!geo.modeLayout.horizontal) {
      // A fixed raw depth can still move the damped action point/window. This
      // catches retained log labels whose repaint depends only on raw depth.
      ctx.state.drill.depth = geo.modeLayout.totalLength * 0.55;
      for (const frames of [1, 9, 80]) {
        settle(geo, ctx, frames);
        measure(geo, ctx, `${width}x${height}/${mode}/settling-${frames}`);
      }
    }
  }
  // Additional declared synthetic fixtures, NOT SOURCED physical contracts.
  for (const fixture of [
    { id: 'deep-well', mode: 'vertical', targetDepth: 3000, holeDiaMm: 216, deep: true },
    // A 600 m input with this seed only reaches 11.422 m TVD. The synthetic
    // 1200 m input reaches 15 m, beyond the full camera height, reproducing
    // the depth of the observed offscreen browser return pass without
    // claiming to reconstruct that browser contract's unrecorded seed.
    { id: 'deep-hdd', mode: 'profile', targetDepth: 1200, holeDiaMm: 382, seed: 1337, deepHdd: true },
    { id: 'short-driven-pile', mode: 'pile', methodId: 'driven-pile', targetDepth: 9, holeDiaMm: 400, driven: true, seed: 1 },
  ]) {
    geo.generateProfile({ regionId: 'nordic', seed: fixture.seed ?? 20260903, difficulty: 0.25,
      profileMode: fixture.mode, methodId: fixture.methodId ?? null,
      targetDepth: fixture.targetDepth, holeDiaMm: fixture.holeDiaMm });
    if (fixture.driven) check(geo.modeLayout.totalLength <= 10, 'short-pile-length-exercised',
      { case: `${width}x${height}/${fixture.id}`, actual: geo.modeLayout.totalLength });
    for (const fraction of [0.55, 0.95]) {
      ctx.state.drill.depth = geo.modeLayout.totalLength * fraction;
      ctx.state.drill.stage = 0; ctx.state.drill.stageProgress = 0;
      settle(geo, ctx);
      measure(geo, ctx, `${width}x${height}/${fixture.id}/${fraction}`, fixture);
    }
    if (fixture.deepHdd) {
      ctx.state.drill.stage = 1;
      ctx.state.drill.stageProgress = geo.modeLayout.totalLength * 0.8;
      settle(geo, ctx);
      measure(geo, ctx, `${width}x${height}/${fixture.id}/return`, fixture);
    }
  }
  // A translated camera must not change the true-depth contract. Unlike
  // footer positioning this is a coordinate check, independent of glyphs.
  camera.position.y = 3.25; camera.lookAt(0, 3.25, 0);
  camera.updateMatrixWorld(); geo.resize(width, height); settle(geo, ctx);
  measure(geo, ctx, `${width}x${height}/translated-camera`, { driven: true });
  geo.dispose();
}
check(report.cases.length === 132, 'complete-case-matrix', { cases: report.cases.length });
if (jsonPath) writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n');
const counts = Object.fromEntries([...new Set(report.failures.map((f) => f.label))]
  .map((label) => [label, report.failures.filter((f) => f.label === label).length]));
console.log(`RULER CPU: ${report.cases.length} cases, ${report.checks} assertions, ${report.failures.length} failures`);
console.log(`Text widths use a synthetic ${widthEm} em fixture; real glyphs/contrast/WebGL are NOT verified.`);
for (const [label, count] of Object.entries(counts)) console.log(`  ${label}: ${count}`);
if (report.failures.length) console.log(JSON.stringify(report.failures.slice(0, 8), null, 2));
console.log(`VERDICT: ${report.failures.length ? 'FAIL' : 'PASS'}`);
if (report.failures.length && !reportOnly) process.exitCode = 1;
