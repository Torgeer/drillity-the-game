#!/usr/bin/env node
// Independent CPU review. Synthetic bounds/transforms are NOT SOURCED test
// inputs, not machine dimensions. Renderer camera bodies are executed directly;
// no WebGL, screenshot, GPU, or physical-device claim is made here.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { fitOrbitCamera, createOrbitFramer, keepOrbitOutsideRig } from '../src/core/orbitFraming.js';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { RIGS } from '../src/game/data.js';
import { blenderRigIds } from './checkrigloader.mjs';

const rendererSource = readFileSync(new URL('../src/core/renderer.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const sha = name => createHash('sha256').update(readFileSync(new URL(name, import.meta.url))).digest('hex');
const sourceIdentity = { renderer: sha('../src/core/renderer.js'), helper: sha('../src/core/orbitFraming.js') };
const rootArg = process.argv.indexOf('--rig-root');
const modelRoot = rootArg >= 0 ? resolve(process.argv[rootArg + 1]) : fileURLToPath(new URL('..', import.meta.url));
const between = (begin, end) => {
  const start = rendererSource.indexOf(begin), stop = rendererSource.indexOf(end, start + begin.length);
  assert.ok(start >= 0 && stop > start, `renderer extraction: ${begin}`);
  return rendererSource.slice(start, stop);
};
const springBody = between('class Spring3 {', '/** The dual-band scene pass.');
const modesBody = between('const CAMERA_MODES = {', 'const REG_MAX_X');
const updateBody = between('  function updateSurfaceCamera(dt, state) {', '  /**\n   * Depth follow');
const motionPreferenceBody = between('  const reducedMotion = ', '  const onMotionPreference = ');
const registerBody = between('  function registerBands(dt) {', '  /* ═══════════════════════════════════════════════════════════════════════\n     Adaptive quality');
const setModeBody = between('    setCameraMode(next) {', '    /**\n     * Camera trauma.');
let checks = 0;
const check = (value, label) => { checks++; assert.ok(value, label); };
let seed = 0xC0FFEE;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const corners = (min, max, matrix = new THREE.Matrix4()) => Array.from({ length: 8 }, (_, n) =>
  new THREE.Vector3(n & 1 ? max[0] : min[0], n & 2 ? max[1] : min[1], n & 4 ? max[2] : min[2]).applyMatrix4(matrix));
const base = { width: 390, height: 305, fov: 27.378309615321225,
  radius: 13, eyeY: 2.7, look: [0, 3.05, 0], near: 0.25, far: 2500 };
let projections = 0;
function measure(camera, points) {
  camera.updateMatrixWorld();
  const result = { x: 0, y: 0, near: Infinity, far: 0, minY: Infinity, maxY: -Infinity,
    croppedAboveGround: 0, highestCroppedWorldY: null };
  for (const point of points) {
    const local = point.clone().applyMatrix4(camera.matrixWorldInverse);
    const ndc = point.clone().project(camera);
    result.x = Math.max(result.x, Math.abs(ndc.x));
    result.y = Math.max(result.y, Math.abs(ndc.y));
    result.near = Math.min(result.near, -local.z);
    result.far = Math.max(result.far, -local.z);
    result.minY = Math.min(result.minY, ndc.y); result.maxY = Math.max(result.maxY, ndc.y);
    if (point.y > 0 && (Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1)) {
      result.croppedAboveGround++;
      result.highestCroppedWorldY = Math.max(result.highestCroppedWorldY ?? -Infinity, point.y);
    }
    projections++;
  }
  return result;
}
// Deliberately cover negative pitch, extreme aspect, near and far planes,
// reflected/non-uniform transforms, tilted roots and off-origin placements.
for (let sample = 0; sample < 360; sample++) {
  const min = [-random() * 12, -random() * 15, -random() * 12];
  const max = [random() * 12, random() * 65 + 1, random() * 12];
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(random() * 60 - 30, random() * 10, random() * 60 - 30),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(random(), random() * 6, random())),
    new THREE.Vector3((random() < 0.5 ? -1 : 1) * (0.2 + random() * 2), 0.2 + random() * 2, 0.2 + random() * 2));
  const view = { ...base, width: 240 + random() * 900, height: 100 + random() * 1000,
    fov: 8 + random() * 112, eyeY: random() * 80 - 40, near: 0.05 + random() * 3,
    radius: 1 + random() * 70, far: 50000 };
  const fit = fitOrbitCamera({ framing: { space: 'rig-local', min, max }, matrixWorld: matrix, ...view });
  check(fit, `finite synthetic fit ${sample}`);
  const camera = new THREE.PerspectiveCamera(view.fov, view.width / view.height, view.near, view.far);
  const points = corners(min, max, matrix);
  for (let azimuth = 0; azimuth < 17; azimuth++) {
    const angle = random() * Math.PI * 2;
    camera.position.set(fit.look[0] + Math.sin(angle) * fit.radius, fit.eyeY, fit.look[2] + Math.cos(angle) * fit.radius);
    camera.lookAt(new THREE.Vector3(...fit.look));
    const projection = measure(camera, points);
    check(projection.x <= 0.92000001 && projection.y <= 0.88000001,
      `synthetic all-corner projection ${sample}: ${JSON.stringify(projection)}`);
    check(projection.near > view.near && projection.far < view.far, `synthetic clip planes ${sample}`);
  }
}

// Cache identity and conservative fallback checks do not depend on mesh
// traversal. Mutable framing records and root parents model live replacements.
const cacheGroup = new THREE.Group(), cacheRoot = new THREE.Group();
cacheGroup.add(cacheRoot);
const cacheSpec = { id: 'independent-cache', glb: { framing: { space: 'rig-local', min: [-1, 0, -1], max: [1, 3, 1] } } };
cacheRoot.userData.spec = cacheSpec;
const cacheRig = { group: cacheGroup, getSpec: () => cacheSpec }, cache = createOrbitFramer();
const cacheView = { ...base, height: 456, fov: 40 };
const small = cache.fit(cacheRig, cacheView);
check(small?.authored && small.radius === 13 && small.eyeY === 2.7 && small.look.join(',') === '0,3.05,0',
  'small machine that already fits preserves original composition');
check(cache.fit(cacheRig, cacheView) === small, 'unchanged state reuses object');
for (const delta of [{ width: 320 }, { height: 250 }, { fov: 33 }, { radius: 14 }, { eyeY: 4 },
  { near: 0.6 }, { far: 1900 }, { clearanceFov: 90 }, { look: [1, 3.05, 0] }]) {
  const before = cache.fit(cacheRig, cacheView), after = cache.fit(cacheRig, { ...cacheView, ...delta });
  check(after !== before, `cache view mutation ${JSON.stringify(delta)}`);
}
const beforeFeed = cache.fit(cacheRig, cacheView);
cacheSpec.glb.feedFraming = { ...cacheSpec.glb.framing, scope: 'feed', max: [1, 35, 1] };
check(cache.fit(cacheRig, cacheView) !== beforeFeed, 'feed envelope replacement invalidates');
const beforeBounds = cache.fit(cacheRig, cacheView);
cacheSpec.glb.feedFraming.max[1] = 36;
check(cache.fit(cacheRig, cacheView) !== beforeBounds, 'in-place bound mutation invalidates');
const beforePlacement = cache.fit(cacheRig, cacheView);
cacheGroup.position.set(4, 7, 2);
check(cache.fit(cacheRig, cacheView) !== beforePlacement, 'parent translation invalidates');
cacheRoot.visible = false;
check(cache.fit(cacheRig, cacheView) === null, 'hidden source clears fit');
cacheRoot.visible = true;
check(cache.fit(cacheRig, cacheView) !== beforePlacement, 'visible source recovers');
cacheSpec.glb.feedFraming.min = [NaN, 0, 0];
check(cache.fit(cacheRig, cacheView) === null, 'bad source coordinates clear fit');
delete cacheSpec.glb;
check(cache.fit(cacheRig, cacheView) === null, 'procedural/no-metadata fallback stays available');

for (let i = 0; i < 180; i++) {
  const currentFov = 8 + random() * 112;
  const fit = fitOrbitCamera({ ...base, clearanceFov: currentFov,
    framing: { space: 'rig-local', min: [-6, -2, -8], max: [6, 50, 8] }, matrixWorld: new THREE.Matrix4() });
  const position = new THREE.Vector3((random() - 0.5) * 5, random() * 100 - 30, (random() - 0.5) * 5);
  keepOrbitOutsideRig(position, fit, random() * Math.PI * 2);
  const camera = new THREE.PerspectiveCamera(Math.max(base.fov, currentFov), base.width / base.height, base.near, base.far);
  camera.position.copy(position);
  camera.lookAt(random() * 120 - 60, random() * 120 - 60, random() * 120 - 60);
  camera.rotateZ(random() * Math.PI * 2); camera.updateMatrixWorld();
  for (const x of [-1, 1]) for (const y of [-1, 1]) {
    const point = new THREE.Vector3(x, y, -1).unproject(camera);
    check(Math.hypot(point.x - fit.look[0], point.z - fit.look[2]) >= 10 - 1e-8,
      'transition guard keeps near rectangle outside cylinder at arbitrary look and roll');
  }
}

// Execute production camera spring/update/registration functions with real
// Three cameras and minimal context; only WebGL/environment construction is absent.
function makeCameraHarness(framing, { site = false, width = 390, height = 305,
  rootPosition = [0, 0, 0], initialPosition = [0, 2.7, 13] } = {}) {
  const group = new THREE.Group(), root = new THREE.Group();
  const spec = { id: 'review-fixture', glb: { feedFraming: framing } };
  group.add(root); root.position.fromArray(rootPosition); root.userData.spec = spec;
  const ctx = { rig: { group, getSpec: () => spec } };
  return new Function('THREE', 'ctx', 'createOrbitFramer', 'keepOrbitOutsideRig', 'options', `
    const TAU = Math.PI * 2;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
    ${springBody}
    ${modesBody}
    const REG_MAX_X = 0.22, REG_MAX_Y = 0.12;
    let mode = 'orbit', time = 0, trauma = 0, focus = null;
    // This framing fixture runs with the OS preference off; the dedicated
    // motion gate covers live OS changes. Execute the production resolver.
    const motionQuery = { matches: false };
    ${motionPreferenceBody}
    const CAMERA_DRIFT = 0;
    const camera = new THREE.PerspectiveCamera(40, options.width / options.height, 0.25, 2500);
    const sectionCamera = new THREE.PerspectiveCamera(40, options.width / options.height, 0.25, 2500);
    sectionCamera.position.set(0, 0, 50); sectionCamera.lookAt(0, 0, 0); sectionCamera.updateMatrixWorld();
    const bands = { surface: { x: 0, y: 0, w: options.width, h: options.height },
      section: { x: 0, y: options.height, w: options.width, h: options.height } };
    const posSpring = new Spring3(...options.initialPosition), lookSpring = new Spring3(0, 3.05, 0);
    let fovCurrent = 40, orbitAngle = 0;
    const drift = new THREE.Vector3(), shakeOffset = new THREE.Vector3(), lookTarget = new THREE.Vector3();
    const orbitFramer = createOrbitFramer();
    const modeConfig = () => CAMERA_MODES[mode];
    const activeHeroFit = () => null;
    const fovForBand = fov => clamp(2 * THREE.MathUtils.radToDeg(Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * options.height / (844 * 0.54))), 8, 120);
    const onSiteScene = () => options.site;
    let registerBandsOn = true;
    const registration = { x: 0, y: 0, active: false, collarErrPx: 0, groundErrPx: 0 };
    const regPoint = new THREE.Vector3();
    const clearRegistration = () => { camera.clearViewOffset(); registration.active = false; registration.x = registration.y = 0; };
    ${updateBody}
    ${registerBody}
    const api = { ${setModeBody} };
    return { camera, ctx, api, registration, get angle() { return orbitAngle; },
      step(dt) { time += dt; updateSurfaceCamera(dt, {}); registerBands(dt); },
      pose(pos, look) { camera.position.fromArray(pos); camera.lookAt(new THREE.Vector3(...look));
        posSpring.snap(new THREE.Vector3(...pos)); lookSpring.snap(new THREE.Vector3(...look)); },
      set mode(value) { mode = value; }, get mode() { return mode; } };
  `)(THREE, ctx, createOrbitFramer, keepOrbitOutsideRig, { site, width, height, rootPosition, initialPosition });
}

const originalFetch = globalThis.fetch, originalDocument = globalThis.document;
globalThis.document = { baseURI: 'https://orbit-review.invalid/' };
globalThis.fetch = async url => {
  const parsed = new URL(url);
  assert.equal(parsed.origin, 'https://orbit-review.invalid');
  assert.match(parsed.pathname, /^\/models\/[a-z0-9-]+\.glb$/);
  return new Response(readFileSync(resolve(modelRoot, `public${parsed.pathname}`)));
};
const material = new THREE.MeshStandardMaterial();
const loader = createGltfRigs({ THREE, qs: new URLSearchParams('glb=strict'), data: { RIGS },
  quality: { id: 'low' }, assets: { material: () => material } });
const report = { instrument: 'Independent CPU projection and extracted production camera functions; no GPU',
  source: sourceIdentity,
  randomCases: 360, fleet: [], findings: [] };
try {
  for (const id of blenderRigIds()) {
    await loader.load(id);
    const framing = loader.info(id).feedFraming;
    check(framing?.space === 'rig-local', `${id} actual feed metadata`);
    const points = corners(framing.min, framing.max);
    const built = loader.builder(id)(); built.root.updateMatrixWorld(true);
    const actualRestVertices = [];
    built.root.traverse(node => {
      if (!node.isMesh || node.userData.framing === 'exclude') return;
      for (let i = 0; i < node.geometry.attributes.position.count; i++) {
        actualRestVertices.push(node.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(node.matrixWorld));
      }
    });
    const item = { id, modelSha256: createHash('sha256').update(readFileSync(resolve(modelRoot, `public/models/${id}.glb`))).digest('hex'), layouts: [] };
    for (const height of [250, 305, 456]) for (const site of [false, true]) {
      const harness = makeCameraHarness(framing, { height, site });
      for (let i = 0; i < 480; i++) harness.step(1 / 60);
      const worst = { x: 0, y: 0, near: Infinity, far: 0 };
      let worstYCamera, worstXCamera;
      for (let i = 0; i < 1200; i++) {
        harness.step(1 / 60);
        const projection = measure(harness.camera, points);
        if (projection.x > worst.x) worstXCamera = harness.camera.clone();
        if (projection.y > worst.y) worstYCamera = harness.camera.clone();
        worst.x = Math.max(worst.x, projection.x); worst.y = Math.max(worst.y, projection.y);
        worst.near = Math.min(worst.near, projection.near); worst.far = Math.max(worst.far, projection.far);
      }
      const actualAtWorstY = measure(worstYCamera, actualRestVertices);
      const actualAtWorstX = measure(worstXCamera, actualRestVertices);
      item.layouts.push({ height, site, worst, actualAtWorstY, actualAtWorstX,
        cropped: worst.x > 1 || worst.y > 1,
        actualRestCropped: actualAtWorstX.x > 1 || actualAtWorstY.y > 1 });
      if (!site) {
        check(worst.x < 1 && worst.y < 1 && worst.near > 0.25, `${id} live non-site orbit stays framed`);
      }
    }
    report.fleet.push(item);
  }
} finally {
  loader.dispose(); material.dispose(); globalThis.fetch = originalFetch; globalThis.document = originalDocument;
}

const croppedSite = report.fleet.filter(item => item.layouts.some(layout => layout.site && layout.actualRestCropped)).map(item => item.id);
if (croppedSite.length) report.findings.push({ kind: 'site-registration-crop', rigs: croppedSite });
const shifted = { space: 'rig-local', min: [-1, 0, -1], max: [1, 12, 1] };
const switched = makeCameraHarness(shifted, { rootPosition: [100, 0, 0] });
switched.mode = 'hero'; switched.pose([100, 6, 20], [100, 6, 0]); switched.api.setCameraMode('orbit');
const angleErrorDegrees = THREE.MathUtils.radToDeg(switched.angle);
if (Math.abs(angleErrorDegrees) > 1e-6) report.findings.push({ kind: 'mode-entry-around-origin', angleErrorDegrees,
  fixture: 'NOT SOURCED translated camera: rig center (100,0), eye (100,20) in horizontal x/z plane; expected entry angle 0 degrees' });

const registrationHarness = makeCameraHarness(shifted, { site: true });
for (const mode of ['hero', 'mast', 'downhole']) {
  registrationHarness.mode = mode; registrationHarness.step(1 / 60);
  check(registrationHarness.registration.active && registrationHarness.camera.view?.enabled,
    `${mode} retains existing SITE collar registration`);
}
for (const mode of ['orbit', 'menu']) {
  registrationHarness.api.setCameraMode(mode); registrationHarness.step(1 / 60);
  if (registrationHarness.registration.active || registrationHarness.camera.view?.enabled) {
    report.findings.push({ kind: 'revolving-mode-registration-retained', mode });
  }
}

report.checks = checks; report.projections = projections;
assert.deepEqual({ renderer: sha('../src/core/renderer.js'), helper: sha('../src/core/orbitFraming.js') },
  sourceIdentity, 'production source must remain unchanged during review');
const output = process.argv.indexOf('--json');
if (output >= 0) writeFileSync(process.argv[output + 1], JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ checks, projections, findings: report.findings, fleetCount: report.fleet.length }, null, 2));
if (report.findings.length && !process.argv.includes('--observe')) process.exitCode = 1;
