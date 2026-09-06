#!/usr/bin/env node
/** CPU hero-camera regression: actual loader, GLBs, rig selection and Three
 * projection. This checks screen framing, not physical dimensions; glbinfo.mjs
 * remains the sole dimension CLI. No browser, GPU or glyph-quality claim.
 * Usage: node tools/checkheroframing.mjs [--rig-root path] [--json path]
 * --rig-root is for testing a pending loader/asset integration in its worktree.
 * Synthetic geometry, transforms and HUD inputs are NOT SOURCED test fixtures.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as THREE from 'three';
import { fitHeroCamera, createHeroFramer } from '../src/core/renderer.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createGeology } from '../src/world/geology.js';
import { RIGS } from '../src/game/data.js';
import { LAYOUT, createBus } from '../src/core/contract.js';
import { blenderRigIds } from './checkrigloader.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const option = name => {
  const i = args.indexOf(name);
  if (i < 0) return null;
  assert.ok(args[i + 1] && !args[i + 1].startsWith('--'), `${name} requires a path`);
  return resolve(args[i + 1]);
};
const rigRoot = option('--rig-root') || ROOT;
const jsonPath = option('--json');
const { createGltfRigs } = await import(pathToFileURL(resolve(rigRoot, 'src/core/gltfRig.js')));
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const report = { instrument: 'Actual Three CPU projection; authored and runtime-driven GLB poses; no GPU',
  rigRoot, checks: 0, cases: [], section: [], models: {}, failures: [],
  rendererSha256: sha(resolve(ROOT, 'src/core/renderer.js')),
  loaderSha256: sha(resolve(rigRoot, 'src/core/gltfRig.js')),
  factorySha256: sha(resolve(ROOT, 'src/rig/rigFactory.js')),
  geologySha256: sha(resolve(ROOT, 'src/world/geology.js')),
  gateSha256: sha(resolve(ROOT, 'tools/checkheroframing.mjs')),
  limitations: ['Published bounds cover authored carriage feed, not arbitrary rotation/boom animations.',
    'Front ground edges below the cut plane are reported; bottom-edge fit is not asserted.',
    'HUD extents are explicit CPU fixtures; browser capture must verify actual live layout.'] };
function check(condition, message) {
  report.checks++;
  if (!condition) report.failures.push(message);
}
function near(actual, expected, message, tolerance = 1e-5) {
  check(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${message}: ${actual} vs ${expected}`);
}
function pixel(point, camera, band) {
  const p = point.clone().project(camera);
  return { x: band.x + (p.x + 1) * band.w / 2,
    y: band.y + (1 - p.y) * band.h / 2 };
}
function layout(w, h, top, bottom) {
  const stage = { w: Math.round(Math.min(w, h * 9 / 16)),
    h: Math.round(Math.min(h, w * 19.5 / 9)) };
  stage.x = Math.round((w - stage.w) / 2);
  stage.y = Math.round((h - stage.h) / 2);
  const remaining = stage.h - top - bottom;
  const surface = { x: stage.x, y: stage.y + top, w: stage.w,
    h: Math.round(remaining * LAYOUT.surfaceHeight) };
  const section = { x: surface.x, y: surface.y + surface.h, w: surface.w,
    h: remaining - surface.h };
  const refAspect = stage.w / (stage.h * LAYOUT.surfaceHeight);
  const fov = THREE.MathUtils.radToDeg(2 * Math.atan(
    Math.tan(THREE.MathUtils.degToRad(34) / 2) * refAspect / (surface.w / surface.h)));
  const hw = 20 * 0.5 * stage.w / (stage.h * LAYOUT.sectionHeight);
  const hh = hw / Math.max(0.25, section.w / section.h);
  const sectionCamera = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 0.1, 200);
  sectionCamera.position.set(0, 0, 30);
  sectionCamera.lookAt(0, 0, 0);
  sectionCamera.updateMatrixWorld();
  return { viewport: { width: w, height: h, dpr: 1 }, stage, surface, section, fov, sectionCamera };
}
const layouts = [layout(390, 844, 52, 227), layout(320, 740, 52, 210)];
function fittedCamera(fit, view) {
  const { surface, fov } = view;
  const camera = new THREE.PerspectiveCamera(fov, surface.w / surface.h, 0.25, 2500);
  camera.position.fromArray(fit.position);
  camera.lookAt(new THREE.Vector3(...fit.look));
  camera.updateMatrixWorld();
  // Independently reproduce the live registration contract, measuring the
  // collar first. Do not use the fit's returned shift as the test oracle.
  const collar = pixel(new THREE.Vector3(), camera, surface);
  const hole = pixel(new THREE.Vector3(), view.sectionCamera, view.section);
  const dx = THREE.MathUtils.clamp(collar.x - hole.x, -surface.w * 0.22, surface.w * 0.22);
  const dy = THREE.MathUtils.clamp(collar.y - view.section.y, -surface.h * 0.12, surface.h * 0.12);
  camera.setViewOffset(surface.w, surface.h, dx, dy, surface.w, surface.h);
  const pinned = pixel(new THREE.Vector3(), camera, surface);
  near(pinned.x, hole.x, 'actual collar aligns horizontally with section');
  near(pinned.y, view.section.y, 'actual ground origin meets seam');
  return camera;
}
function fitBounds(framing, matrixWorld, view) {
  return fitHeroCamera({ framing, matrixWorld, width: view.surface.w,
    height: view.surface.h, fov: view.fov });
}
function assertExtent(extent, view, label) {
  const { surface } = view;
  check(extent.left >= surface.w * 0.04 - 1e-4, `${label}: left clearance`);
  check(extent.right <= surface.w * 0.96 + 1e-4, `${label}: right clearance`);
  check(extent.top >= surface.h * 0.06 - 1e-4, `${label}: crown clearance`);
}
function geometryExtent(root, camera, view) {
  const extent = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  let aboveGroundBottom = -Infinity;
  let count = 0, inFront = true;
  const v = new THREE.Vector3();
  function visit(node, excluded = false) {
    excluded ||= node.userData.framing === 'exclude';
    if (!excluded && node.isMesh && node.geometry?.attributes.position) {
      const positions = node.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        node.getVertexPosition(i, v).applyMatrix4(node.matrixWorld);
        const z = v.clone().applyMatrix4(camera.matrixWorldInverse).z;
        if (z >= -camera.near || z <= -camera.far) inFront = false;
        const p = pixel(v, camera, view.surface);
        extent.left = Math.min(extent.left, p.x - view.surface.x);
        extent.right = Math.max(extent.right, p.x - view.surface.x);
        extent.top = Math.min(extent.top, p.y - view.surface.y);
        extent.bottom = Math.max(extent.bottom, p.y - view.surface.y);
        if (v.y >= -1e-6) aboveGroundBottom = Math.max(aboveGroundBottom, p.y - view.surface.y);
        count++;
      }
    }
    node.children.forEach(child => visit(child, excluded));
  }
  visit(root);
  check(count > 0 && inFront, 'actual included vertices are between camera clip planes');
  check(aboveGroundBottom <= view.surface.h * 1.03 + 1e-4, 'above-ground machine stays within ground-crop tolerance');
  extent.aboveGroundBottom = aboveGroundBottom;
  return extent;
}

function feedPoses(root) {
  const poses = [{ label: 'rest', apply: () => {} }];
  root.traverse(node => {
    if (!node.name.startsWith('slide:carriage')) return;
    const data = node.userData;
    const axis = data.travel_axis || 'y';
    assert.ok(['x', 'y', 'z'].includes(axis), `${node.name} declares a glTF travel axis`);
    const rest = node.position[axis];
    let min = data.travel_min_m, max = data.travel_max_m;
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      if (!Number.isFinite(data.travel_m)) return;
      min = Math.min(rest, rest + data.travel_m);
      max = Math.max(rest, rest + data.travel_m);
    }
    if (min === max) return;
    // Explicit endpoints use the declared glTF axis; only the legacy schema
    // uses Y. Restore rest before another joint is exercised.
    for (const [name, value] of [['min', min], ['max', max]]) poses.push({
      label: `${node.name}:${name}`, axis, coordinate: value,
      apply: () => { node.position[axis] = value; }, restore: () => { node.position[axis] = rest; },
    });
  });
  return poses;
}

function copyDrivenPose(runtimeRoot, authoredRoot) {
  // Merging removes static mesh identity, but every actual motion joint is
  // retained. Project the unmerged included vertices under those LIVE joint
  // transforms, not under invented direct-translation substitutes.
  authoredRoot.traverse(node => {
    if (!/^(pivot:|slide:|frame:)/.test(node.name)) return;
    const live = runtimeRoot.getObjectByName(node.name);
    assert.ok(live, `${node.name} must survive runtime merging`);
    node.position.copy(live.position);
    node.quaternion.copy(live.quaternion);
    node.scale.copy(live.scale);
    node.matrix.copy(live.matrix);
  });
  authoredRoot.matrixAutoUpdate = false;
  authoredRoot.matrix.copy(runtimeRoot.matrixWorld);
  authoredRoot.updateMatrixWorld(true);
}

// Invalid data must not turn into an invented frame radius or a poisoned camera.
const fixture = { space: 'rig-local', min: [-2, 0, -2], max: [2, 9, 2], center: [0, 4.5, 0] };
const identity = new THREE.Matrix4();
for (const invalid of [null, { ...fixture, space: 'world' },
  { ...fixture, min: [NaN, 0, 0] }, { ...fixture, max: [-3, 9, 2] },
  { ...fixture, min: [0, 0, 0], max: [0, 0, 0] }]) {
  check(fitBounds(invalid, identity, layouts[0]) === null, 'invalid framing is rejected');
}
check(fitBounds(fixture, new THREE.Matrix4().makeScale(NaN, 1, 1), layouts[0]) === null,
  'nonfinite placement is rejected');
const unchanged = JSON.stringify(fixture);
const transform = new THREE.Matrix4().compose(new THREE.Vector3(4, 1, -3),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.7, 0)), new THREE.Vector3(1.4, 0.8, 1.1));
for (const view of layouts) {
  const fit = fitBounds(fixture, transform, view);
  check(fit && fit.scale > 0, 'translated, rotated, scaled synthetic rig fits');
  assertExtent(fit.projected, view, 'transformed synthetic rig');
  fittedCamera(fit, view);
}
check(JSON.stringify(fixture) === unchanged, 'fit never mutates loader metadata');
const fixtureRoot = new THREE.Group();
const fixtureGroup = new THREE.Group();
fixtureGroup.add(fixtureRoot);
const fixtureSpec = { id: 'synthetic-camera-contract', source: 'glb',
  glb: { framing: fixture, feedFraming: { ...fixture, scope: 'carriage-feed', max: [2, 15, 2] } } };
fixtureRoot.userData.spec = fixtureSpec;
const fixtureRig = { group: fixtureGroup, getSpec: () => fixtureSpec };
const fixtureFramer = createHeroFramer();
const fixtureRequest = { width: layouts[0].surface.w, height: layouts[0].surface.h,
  fov: layouts[0].fov, registered: true };
const firstFit = fixtureFramer.fit(fixtureRig, fixtureRequest);
check(fixtureFramer.info.scope === 'carriage-feed', 'runtime consumer prefers declared feed envelope');
check(firstFit.scale > fitBounds(fixture, identity, layouts[0]).scale, 'feed envelope changes actual camera target');
fixtureGroup.position.set(4, 1, -3);
fixtureGroup.rotation.y = 0.7;
fixtureGroup.scale.set(1.4, 0.8, 1.1);
const placedFit = fixtureFramer.fit(fixtureRig, fixtureRequest);
check(placedFit !== firstFit, 'parent placement invalidates cached runtime fit');
const directFit = fitBounds(fixtureSpec.glb.feedFraming, fixtureRoot.matrixWorld, layouts[0]);
near(placedFit.scale, directFit.scale, 'runtime consumer applies complete parent world matrix');
check(fixtureFramer.fit(fixtureRig, { ...fixtureRequest, width: 320 }) !== placedFit,
  'viewport change invalidates cached runtime fit');
fixtureRoot.visible = false;
check(fixtureFramer.fit(fixtureRig, fixtureRequest) === null && fixtureFramer.info === null,
  'hidden/disposed active root cannot leave a stale fit');
fixtureRoot.visible = true;
fixtureSpec.glb.feedFraming = { ...fixtureSpec.glb.feedFraming, space: 'world' };
check(fixtureFramer.fit(fixtureRig, fixtureRequest) === null, 'invalid replacement metadata clears the fit');
delete fixtureSpec.glb;
check(fixtureFramer.fit(fixtureRig, fixtureRequest) === null, 'procedural/missing metadata keeps authored camera fallback');

const oldDocument = globalThis.document, oldFetch = globalThis.fetch;
const noop = () => {};
globalThis.document = {
  baseURI: 'https://hero-fixtures.invalid/',
  createElement(tag) {
    assert.equal(tag, 'canvas', 'only CPU Canvas2D plumbing is permitted');
    const canvas = { width: 1, height: 1 };
    const context = new Proxy({ canvas, measureText: text => ({ width: String(text).length * 6 }),
      createLinearGradient: () => ({ addColorStop: noop }),
      createRadialGradient: () => ({ addColorStop: noop }),
      getImageData: () => ({ data: new Uint8ClampedArray(canvas.width * canvas.height * 4) }) },
    { get: (target, key) => key in target ? target[key] : noop });
    canvas.getContext = kind => { assert.equal(kind, '2d'); return context; };
    return canvas;
  },
};
globalThis.fetch = async url => {
  const parsed = new URL(url);
  assert.equal(parsed.origin, 'https://hero-fixtures.invalid');
  assert.match(parsed.pathname, /^\/models\/[a-z0-9-]+\.glb$/);
  return new Response(readFileSync(resolve(rigRoot, `public${parsed.pathname}`)));
};
const shared = new THREE.MeshStandardMaterial();
const ctx = { THREE, data: { RIGS }, quality: { id: 'low' }, qs: new URLSearchParams('glb=strict'),
  assets: { material: () => shared }, bus: createBus(), scene: new THREE.Scene(),
  state: { garage: { rigId: 'crawler-lite' }, settings: {} } };
const loader = createGltfRigs(ctx);
ctx.gltfRigs = loader;
const rig = createRigSystem(ctx);
ctx.rig = rig;
const framer = createHeroFramer();
try {
  // The export authority supplies the complete fleet. No per-rig dimensions:
  // exported metadata and actual loaded meshes supply the camera's inputs.
  const ids = blenderRigIds();
  for (const id of ids) {
    await loader.load(id);
    report.models[id] = sha(resolve(rigRoot, `public/models/${id}.glb`));
  }
  await rig.init();
  let previousRoot;
  for (const id of ids) {
    check(rig.setRig(id), `real rig system selects ${id}`);
    const spec = rig.getSpec();
    check(spec.source === 'glb' && spec.id === id, `${id}: selected actual GLB source`);
    const root = rig.group.children.find(child => child.visible && child.userData.spec === spec);
    check(root && root !== previousRoot, `${id}: active source root changes`);
    if (previousRoot) check(!previousRoot.visible, `${id}: previous cached rig is hidden`);
    previousRoot = root;
    check(spec.glb.framing?.space === 'rig-local', `${id}: loader framing metadata is present`);
    const metadataBefore = JSON.stringify(spec.glb.framing);
    root.updateWorldMatrix(true, true);
    // Static merging can combine excluded scenery and included machine into
    // one material mesh. Keep the real loader's unmerged instance for vertex
    // classification, and apply the live placed rig root matrix to it.
    const unmerged = loader.builder(id)(THREE, ctx).root;
    const driven = loader.builder(id)(THREE, ctx).root;
    unmerged.matrixAutoUpdate = false;
    unmerged.matrix.copy(root.matrixWorld);
    unmerged.updateMatrixWorld(true);
    for (const view of layouts) {
      const request = { width: view.surface.w, height: view.surface.h, fov: view.fov,
        collarNdcX: 0, collarNdcY: -1, registered: true };
      const fit = framer.fit(rig, request);
      check(fit, `${id}: measured rest-pose frame solves`);
      check(framer.fit(rig, request) === fit, `${id}: unchanged inputs reuse cached fit`);
      check(framer.info.rigId === id, `${id}: renderer cache follows active GLB identity`);
      const published = framer.info;
      published.position[0] += 100;
      near(framer.info.position[0], fit.position[0], `${id}: QA view cannot mutate camera target`);
      const camera = fittedCamera(fit, view);
      assertExtent(fit.projected, view, `${id} bounds`);
      const origin = pixel(new THREE.Vector3(), camera, view.surface);
      const metre = pixel(new THREE.Vector3(0, 1, 0), camera, view.surface);
      const sectionOrigin = pixel(new THREE.Vector3(), view.sectionCamera, view.section);
      const sectionMetre = pixel(new THREE.Vector3(0, 1, 0), view.sectionCamera, view.section);
      const surfacePxPerM = origin.y - metre.y;
      const sectionPxPerM = sectionOrigin.y - sectionMetre.y;
      for (const pose of feedPoses(unmerged)) {
        pose.apply();
        unmerged.updateMatrixWorld(true);
        const actual = geometryExtent(unmerged, camera, view);
        assertExtent(actual, view, `${id} ${pose.label} actual vertices`);
        report.cases.push({ id, pose: pose.label, axis: pose.axis, coordinate: pose.coordinate,
          viewport: view.viewport, surface: view.surface, elevation: fit.elevation,
          scale: fit.scale, position: fit.position, boundsProjection: fit.projected,
          actualProjection: actual, frontGroundCropPx: Math.max(0, actual.bottom - view.surface.h),
          surfacePxPerM, sectionPxPerM, scaleRatio: surfacePxPerM / sectionPxPerM });
        pose.restore?.();
      }
      for (const load of [0, 1]) for (const u of [0, 0.5, 1 - 1e-9]) {
        // The public update path wraps at a rod's exact end. Sample immediately
        // before wrap; the exact declared endpoints are checked above and by
        // checkrigmetadata's actual setCarriage driver. No flex or work-pose
        // transform is bypassed here. rpm/percussion are held at zero so this
        // is a feed/load probe, not a claim about arbitrary rotary envelopes.
        const state = { ...ctx.state, drill: { active: true, phase: 'drilling',
          depth: u * 3, actionDepth: u * 3, rpm: 0, wob: load, torque: load, wear: 0 } };
        for (let i = 0; i < 60; i++) rig.update(1 / 60, state);
        root.updateWorldMatrix(true, true);
        copyDrivenPose(root, driven);
        const drivenFit = framer.fit(rig, request);
        const drivenCamera = fittedCamera(drivenFit, view);
        const actual = geometryExtent(driven, drivenCamera, view);
        const label = `runtime-feed-${u.toFixed(3)}-load-${load}`;
        assertExtent(actual, view, `${id} ${label}`);
        const liveCarriage = root.getObjectByName('slide:carriage');
        const axis = liveCarriage?.userData.travel_axis || 'y';
        const endpoints = feedPoses(unmerged).filter(p => p.label.startsWith('slide:carriage:'));
        if (liveCarriage && endpoints.length === 2) {
          const lo = endpoints.find(p => p.label.endsWith(':min')).coordinate;
          const hi = endpoints.find(p => p.label.endsWith(':max')).coordinate;
          const direction = liveCarriage.userData.travel_direction || 'min';
          near(liveCarriage.position[axis], direction === 'min' ? hi + (lo - hi) * u : lo + (hi - lo) * u,
            `${id}: public update drives actual declared feed`, 1e-5);
        }
        report.cases.push({ id, pose: label, viewport: view.viewport, surface: view.surface,
          scale: drivenFit.scale, position: drivenFit.position, actualProjection: actual,
          frontGroundCropPx: Math.max(0, actual.bottom - view.surface.h) });
      }
    }
    unmerged.traverse(node => node.geometry?.dispose());
    driven.traverse(node => node.geometry?.dispose());
    check(JSON.stringify(spec.glb.framing) === metadataBefore, `${id}: source metadata stays immutable`);
  }
  // Test the actual geology owner in every mode against the same untouched
  // section cameras. Its real metre projection must survive the hero change.
  for (const view of layouts) {
    const sectionCtx = { THREE, viewport: view.viewport, stage: view.stage,
      bands: { section: view.section }, sectionCamera: view.sectionCamera,
      sectionScene: new THREE.Scene(), quality: { id: 'low' },
      state: { world: { regionId: 'nordic' }, drill: { depth: 0 } } };
    const geology = createGeology(sectionCtx);
    try {
      await geology.init();
      for (const mode of ['vertical', 'profile', 'raise', 'heading', 'pile']) {
        geology.setProfileMode(mode);
        for (let i = 0; i < 60; i++) geology.update(1 / 60, sectionCtx.state);
        sectionCtx.sectionScene.updateMatrixWorld(true);
        const zero = pixel(new THREE.Vector3(0, geology.worldYForDepth(0), 0), view.sectionCamera, view.section);
        const metre = pixel(new THREE.Vector3(0, geology.worldYForDepth(1), 0), view.sectionCamera, view.section);
        near(Math.abs(metre.y - zero.y), geology.pxPerMetre, `${mode}: actual geology metre projection`);
        near(sectionCtx.sectionView.viewMetres, 20, `${mode}: section scale anchor retained`);
        if (mode !== 'heading') check(zero.y > view.section.y && zero.y < view.section.y + view.section.h,
          `${mode}: spud datum remains visible`);
        report.section.push({ viewport: view.viewport, mode, pxPerMetre: geology.pxPerMetre,
          datumBelowBandTop: zero.y - view.section.y });
      }
    } finally { geology.dispose?.(); }
  }
} finally {
  rig.dispose();
  loader.dispose();
  shared.dispose();
  globalThis.document = oldDocument;
  globalThis.fetch = oldFetch;
}
if (jsonPath) writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n');
assert.deepEqual(report.failures, [], 'all camera/pose projections must pass');
console.log(`Hero framing: ${report.checks} checks passed; ${report.cases.length} actual GLB/phone cases; all five section modes.`);
console.table(report.cases.filter(c => c.pose === 'rest').map(c => ({ rig: c.id, width: c.viewport.width,
  cameraScale: +c.scale.toFixed(3), topPx: +c.actualProjection.top.toFixed(2),
  frontGroundCropPx: +c.frontGroundCropPx.toFixed(2), scaleRatio: +c.scaleRatio.toFixed(3) })));
