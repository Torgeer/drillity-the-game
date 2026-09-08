#!/usr/bin/env node
/** Actual GLB-loader bounds and independent Three projection. CPU only;
 * screenshots must still judge composition and scenery occlusion. Synthetic
 * transforms below are NOT SOURCED regression fixtures, not rig dimensions.
 * node tools/checkorbitframing.mjs [--rig-root path] [--json path]
 */
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

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  assert.ok(args[index + 1] && !args[index + 1].startsWith('--'), `${name} needs a path`);
  return resolve(args[index + 1]);
}
const rigRoot = option('--rig-root') || ROOT, jsonPath = option('--json');
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
let checks = 0;
function check(value, message) { checks++; assert.ok(value, message); }
const report = { instrument: 'CPU Three projection of actual loader GLB feed bounds; no browser/GPU',
  source: { camera: hash(resolve(ROOT, 'src/core/orbitFraming.js')),
    renderer: hash(resolve(ROOT, 'src/core/renderer.js')), loader: hash(resolve(ROOT, 'src/core/gltfRig.js')) },
  models: {}, cases: [], limitations: ['Feed envelopes do not cover arbitrary boom/rotary animation.',
    'Site props are outside the rig framing contract; browser screenshots still required.'] };
const configurations = {
  orbit: { radius: 13, eyeY: 2.7, look: [0, 3.05, 0], authoredFov: 40 },
  menu: { radius: 16.6, eyeY: 4.2, look: [0, 2.9, 0], authoredFov: 34 },
};
// Includes a narrow live surface band and the full-height menu band. FOVs
// reproduce the renderer's horizontal-field-preserving band adjustment.
const layouts = [
  { width: 390, height: 305, refHeight: 844 * 0.54 },
  { width: 320, height: 250, refHeight: 693 * 0.54 },
  { width: 390, height: 456, refHeight: 844 * 0.54 },
];
function viewFor(config, layout) {
  const fov = THREE.MathUtils.radToDeg(2 * Math.atan(
    Math.tan(THREE.MathUtils.degToRad(config.authoredFov) / 2) * layout.height / layout.refHeight));
  return { ...config, ...layout, fov, near: 0.25, far: 2500 };
}
function cornersOf(framing, matrix) {
  return Array.from({ length: 8 }, (_, i) => new THREE.Vector3(
    i & 1 ? framing.max[0] : framing.min[0], i & 2 ? framing.max[1] : framing.min[1],
    i & 4 ? framing.max[2] : framing.min[2]).applyMatrix4(matrix));
}
function checkProjection(fit, view, points, label) {
  const camera = new THREE.PerspectiveCamera(view.fov, view.width / view.height, view.near, view.far);
  const local = new THREE.Vector3(), projected = new THREE.Vector3();
  let maxX = 0, maxY = 0, minDepth = Infinity;
  for (let degrees = 0; degrees < 360; degrees += 5) {
    const angle = THREE.MathUtils.degToRad(degrees);
    camera.position.set(fit.look[0] + Math.sin(angle) * fit.radius, fit.eyeY,
      fit.look[2] + Math.cos(angle) * fit.radius);
    camera.lookAt(new THREE.Vector3(...fit.look));
    camera.updateMatrixWorld();
    for (const point of points) {
      local.copy(point).applyMatrix4(camera.matrixWorldInverse);
      projected.copy(point).project(camera);
      minDepth = Math.min(minDepth, -local.z);
      maxX = Math.max(maxX, Math.abs(projected.x));
      maxY = Math.max(maxY, Math.abs(projected.y));
      check(local.z < -camera.near && local.z > -camera.far, `${label} ${degrees}°: clip planes`);
      check(Math.abs(projected.x) <= 0.92 + 1e-7, `${label} ${degrees}°: horizontal clearance (${projected.x})`);
      check(Math.abs(projected.y) <= 0.88 + 1e-7, `${label} ${degrees}°: vertical clearance (${projected.y})`);
    }
  }
  return { maxX, maxY, minDepth };
}

const fixture = { space: 'rig-local', min: [-1, 1, -1], max: [1, 4, 1] };
const view = { ...configurations.orbit, width: 390, height: 456, fov: 40 };
const identity = new THREE.Matrix4();
const original = fitOrbitCamera({ framing: fixture, matrixWorld: identity, ...view });
check(original?.authored && Math.abs(original.radius - 13) < 1e-9 &&
  Math.abs(original.eyeY - 2.7) < 1e-9 && original.look[1] === 3.05,
  'small fixtures that already fit retain the exact authored orbit');
for (const bad of [null, {}, { ...fixture, space: 'world' }, { ...fixture, max: [NaN, 3, 1] },
  { ...fixture, max: [-2, 3, 1] }, { ...fixture, max: fixture.min }]) {
  check(fitOrbitCamera({ framing: bad, matrixWorld: identity, ...view }) === null, 'invalid bounds reject safely');
}
for (const badView of [{ fov: 0 }, { width: 0 }, { near: -1 }, { far: 0.1 }, { radius: 0 }, { eyeY: NaN }]) {
  check(fitOrbitCamera({ framing: fixture, matrixWorld: identity, ...view, ...badView }) === null, 'invalid lens/config rejects');
}

const group = new THREE.Group(), root = new THREE.Group();
group.add(root);
const spec = { id: 'synthetic-fixture', glb: { framing: fixture,
  feedFraming: { ...fixture, max: [1, 20, 1], scope: 'carriage-feed' } } };
root.userData.spec = spec;
const rig = { group, getSpec: () => spec }, framer = createOrbitFramer();
const first = framer.fit(rig, view);
check(first && !first.authored, 'runtime consumer prefers larger feed envelope');
check(framer.fit(rig, view) === first, 'unchanged geometry/layout reuses fit');
group.position.set(9, 2, -3); group.rotation.y = 0.73; group.scale.set(1.3, 0.8, 1.6);
const moved = framer.fit(rig, view);
check(moved !== first, 'complete parent world transform invalidates cache');
const measuredCorners = cornersOf(spec.glb.feedFraming, root.matrixWorld);
const measuredRadius = Math.max(...measuredCorners.map(p => Math.hypot(p.x - moved.look[0], p.z - moved.look[2])));
checkProjection(moved, { ...view, near: 0.25, far: 2500 }, cornersOf(spec.glb.feedFraming, root.matrixWorld), 'transformed fixture');
check(framer.fit(rig, { ...view, width: 300 }) !== moved, 'viewport invalidates cache');
root.visible = false;
check(framer.fit(rig, view) === null, 'hidden active root clears cached fit');
root.visible = true; spec.glb.feedFraming = { ...spec.glb.feedFraming, space: 'world' };
check(framer.fit(rig, view) === null, 'invalid replacement metadata does not retain old fit');
delete spec.glb;
check(framer.fit(rig, view) === null, 'missing metadata keeps renderer fallback');

// Test transitions with independent near-plane corner projection. The look
// can lag anywhere while springing; the whole near plane must remain outside
// the cylinder even when the prior camera starts inside it.
for (const point of [new THREE.Vector3(...moved.look), new THREE.Vector3(9, -4, -3), new THREE.Vector3(10, 10, -2)]) {
  const beforeY = point.y;
  check(keepOrbitOutsideRig(point, moved, 0.8), 'inside transition eye is moved outside rig');
  check(point.y === beforeY, 'guard preserves camera elevation');
  check(Math.hypot(point.x - moved.look[0], point.z - moved.look[2]) >= moved.clearanceRadius - 1e-9,
    'guard uses measured cylinder and near-plane clearance');
  const camera = new THREE.PerspectiveCamera(view.fov, view.width / view.height, 0.25, 2500);
  camera.position.copy(point);
  for (const target of [new THREE.Vector3(...moved.look), new THREE.Vector3(-30, 40, 50), new THREE.Vector3(0, -100, 0)]) {
    camera.lookAt(target); camera.updateMatrixWorld();
    for (const x of [-1, 1]) for (const y of [-1, 1]) {
      const corner = new THREE.Vector3(x, y, -1).unproject(camera);
      check(Math.hypot(corner.x - moved.look[0], corner.z - moved.look[2]) >= measuredRadius - 1e-9,
        'actual near-plane corners remain outside measured cylinder while look spring lags');
    }
  }
}
const wideTransition = fitOrbitCamera({ framing: fixture, matrixWorld: identity, ...view, clearanceFov: 100 });
check(wideTransition.clearanceRadius > original.clearanceRadius,
  'wider current FOV reserves its near-plane clearance during lens transition');
const farEye = new THREE.Vector3(1000, 5, 1000), copy = farEye.clone();
check(!keepOrbitOutsideRig(farEye, moved) && farEye.equals(copy), 'already-safe camera remains unchanged');
check(!keepOrbitOutsideRig(farEye, null), 'non-orbit/no-fit camera remains unchanged');

const originalFetch = globalThis.fetch, originalDocument = globalThis.document;
globalThis.document = { baseURI: 'https://orbit-fixtures.invalid/' };
globalThis.fetch = async url => {
  const parsed = new URL(url);
  assert.equal(parsed.origin, 'https://orbit-fixtures.invalid');
  assert.match(parsed.pathname, /^\/models\/[a-z0-9-]+\.glb$/);
  return new Response(readFileSync(resolve(rigRoot, `public${parsed.pathname}`)));
};
const shared = new THREE.MeshStandardMaterial();
const loader = createGltfRigs({ THREE, qs: new URLSearchParams('glb=strict'), data: { RIGS },
  quality: { id: 'low' }, assets: { material: () => shared } });
try {
  for (const id of blenderRigIds()) {
    await loader.load(id);
    const info = loader.info(id);
    check(info?.feedFraming?.space === 'rig-local', `${id}: actual loader measured feed bounds`);
    report.models[id] = hash(resolve(rigRoot, `public/models/${id}.glb`));
    const metadata = JSON.stringify(info.feedFraming);
    for (const [mode, config] of Object.entries(configurations)) for (const layout of layouts) {
      const request = viewFor(config, layout);
      const fit = fitOrbitCamera({ framing: info.feedFraming, matrixWorld: identity, ...request });
      check(fit, `${id} ${mode}: fit solves`);
      const projection = checkProjection(fit, request, cornersOf(info.feedFraming, identity), `${id} ${mode}`);
      if (id === 'oil-derrick' && mode === 'orbit') {
        check(!fit.authored && fit.radius > config.radius, 'actual derrick cannot keep the clipped 13 m orbit');
      }
      report.cases.push({ id, mode, view: request, fit, projection });
    }
    check(JSON.stringify(info.feedFraming) === metadata, `${id}: measured bounds remain immutable`);
  }
} finally {
  loader.dispose(); shared.dispose();
  globalThis.fetch = originalFetch; globalThis.document = originalDocument;
}
report.checks = checks;
if (jsonPath) writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Orbit framing: ${checks} checks passed, ${report.cases.length} actual GLB/view cases; no GPU or screenshot claim.`);
