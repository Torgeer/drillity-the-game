/** Adversarial CPU geometry test through the exported createPreview API.
 *
 * node tools/checkpreviewframing.mjs
 *
 * Real Three Object3Ds, instance transforms, cameras and projection matrices;
 * only WebGL/browser output is replaced by a recording renderer. Geometry is
 * an arbitrary test fixture, never a sourced machine dimension. The renderer
 * temporarily supplies extreme allowed turntable poses to test the fixed live
 * camera through the real update() path. No fit implementation is copied here.
 */
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createPreview } from '../src/core/preview.js';

const FRAME_EDGE = 0.88;
const EPS = 1e-6;
const STATIC_YAWS = [-2, -0.5, 0, 1, Math.PI];
const LIVE_PITCHES = [-0.12, -0.06, 0, 0.06, 0.12];
const AIM = [0.44, -0.30, 0.84];
const FALLBACK_AIM = [0.42, 0.34, 0.86];
const AIM_CASES = [
  { label: 'vertical-up', aim: [0, 1, 0], expected: [0, 1, 0] },
  { label: 'vertical-down', aim: [0, -1, 0], expected: [0, -1, 0] },
  { label: 'zero-fallback', aim: [0, 0, 0], expected: FALLBACK_AIM },
  { label: 'nan-fallback', aim: [NaN, 1, 0], expected: FALLBACK_AIM },
].flatMap(view => [
  { ...view, id: 'framing-aim-' + view.label, dimensions: [1, 20, 1] },
  { ...view, id: 'framing-aim-' + view.label + '-near-depth', dimensions: [0.001, 1000, 0.001] },
]);

function fixture(material) {
  const root = new THREE.Group();
  root.name = 'framing-fixture';
  root.userData.preview = { aim: AIM, roll: 1.15 };
  const branch = new THREE.Group();
  branch.position.set(3, -7, 2);
  branch.rotation.set(0.3, 0.6, -0.2);
  branch.scale.set(1.1, 0.7, 1.3);
  root.add(branch);
  const geometry = new THREE.BoxGeometry(0.1, 20, 0.1);
  const instances = new THREE.InstancedMesh(geometry, material, 3);
  branch.add(instances);
  for (let i = 0; i < 3; i++) {
    instances.setMatrixAt(i, new THREE.Matrix4().compose(
      new THREE.Vector3(i * 3, -i * 2, i * 2),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(i * 0.1, i * 0.3, i * 0.05)),
      new THREE.Vector3(1, 1, 1),
    ));
  }
  const hiddenGeometry = new THREE.BoxGeometry(1e6, 1e6, 1e6);
  const hidden = new THREE.Mesh(hiddenGeometry, material);
  hidden.visible = false;
  root.add(hidden);
  let disposals = 0;
  root.userData.dispose = () => {
    assert.equal(++disposals, 1, 'A fixture must be disposed exactly once');
    geometry.dispose();
    hiddenGeometry.dispose();
    instances.dispose();
    root.removeFromParent();
  };
  return root;
}

function measureActualVertices(root, camera, expectedVertices = 72) {
  root.updateWorldMatrix(true, true);
  camera.updateMatrixWorld(true);
  const point = new THREE.Vector3();
  const matrix = new THREE.Matrix4();
  const instance = new THREE.Matrix4();
  const inverse = camera.matrixWorldInverse;
  const result = { vertices: 0, maxNdc: 0, depthMin: Infinity, depthMax: -Infinity,
    minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  root.traverseVisible(mesh => {
    if (!mesh.isMesh) return;
    const position = mesh.geometry?.getAttribute('position');
    assert.ok(position?.count > 0, 'The submitted fixture needs actual POSITION vertices');
    for (let j = 0; j < (mesh.isInstancedMesh ? mesh.count : 1); j++) {
      matrix.copy(mesh.matrixWorld);
      if (mesh.isInstancedMesh) {
        mesh.getMatrixAt(j, instance);
        matrix.multiply(instance);
      }
      for (let i = 0; i < position.count; i++) {
        point.fromBufferAttribute(position, i).applyMatrix4(matrix).applyMatrix4(inverse);
        const depth = -point.z;
        assert.ok(depth > camera.near && depth < camera.far, 'Actual vertex must clear both depth planes');
        result.depthMin = Math.min(result.depthMin, depth);
        result.depthMax = Math.max(result.depthMax, depth);
        point.applyMatrix4(camera.projectionMatrix);
        assert.ok(Number.isFinite(point.x + point.y + point.z), 'Actual projection must be finite');
        result.maxNdc = Math.max(result.maxNdc, Math.abs(point.x), Math.abs(point.y));
        result.minX = Math.min(result.minX, point.x);
        result.maxX = Math.max(result.maxX, point.x);
        result.minY = Math.min(result.minY, point.y);
        result.maxY = Math.max(result.maxY, point.y);
        result.vertices++;
      }
    }
  });
  assert.equal(result.vertices, expectedVertices, 'Every submitted vertex must be measured; hidden geometry must not enter');
  assert.ok(result.maxNdc <= FRAME_EDGE + EPS, `Subject exceeds authored frame edge: ${result.maxNdc}`);
  return result;
}

export async function checkPreviewFraming() {
  const keys = ['document', 'window', 'createImageBitmap'];
  const saved = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let api, poseOverride = null, buildFinished = null, liveCameraPosition = null, activeAimCase = null;
  let frames = 0, vertices = 0, staticMax = 0, liveMax = 0, materialDisposals = 0;
  const framingIntervals = [], originalBoundIntervals = [];
  const material = new THREE.MeshBasicMaterial();
  material.addEventListener('dispose', () => materialDisposals++);
  function canvas() {
    const element = { width: 256, height: 256, clientWidth: 256, clientHeight: 256, isConnected: true, draws: 0 };
    const context = { clearRect() {}, drawImage() { element.draws++; } };
    element.getContext = () => context;
    return element;
  }
  class Renderer {
    constructor({ canvas }) { this.domElement = canvas; }
    setPixelRatio() {}
    setSize(w, h) { this.domElement.width = w; this.domElement.height = h; }
    render(scene, camera) {
      const renderStarted = performance.now();
      const subjects = [];
      scene.traverseVisible(o => { if (o.name === 'framing-fixture') subjects.push(o); });
      assert.equal(subjects.length, 1, 'Each actual render must contain exactly one visible subject');
      const root = subjects[0], pivot = root.parent, rotation = pivot.rotation.clone();
      const declared = new THREE.Vector3(...(activeAimCase?.expected || AIM)).normalize();
      assert.ok(camera.position.clone().normalize().dot(declared) > 1 - EPS, 'Authored preview.aim must survive');
      if (poseOverride) {
        pivot.rotation.set(poseOverride.pitch, poseOverride.yaw, 0);
        if (!liveCameraPosition) liveCameraPosition = camera.position.clone();
        assert.ok(camera.position.distanceTo(liveCameraPosition) < EPS, 'Live fitting must keep a fixed camera');
      } else if (!activeAimCase) {
        framingIntervals.push(renderStarted - buildFinished);
        // This records only the prior algorithm's Box3 stage, not the full old
        // API. Tiny cold fixture timings are diagnostics, never a speed verdict.
        const boundStarted = performance.now();
        new THREE.Box3().setFromObject(root);
        originalBoundIntervals.push(performance.now() - boundStarted);
      }
      try {
        const measured = measureActualVertices(root, camera, activeAimCase ? 24 : 72);
        if (activeAimCase) {
          for (const key of ['minX', 'maxX', 'minY', 'maxY']) {
            assert.ok(Math.abs(measured[key] - api.lastFrame.projected[key]) <= EPS,
              `${activeAimCase.id}: actual ${key}=${measured[key]} must match telemetry ${api.lastFrame.projected[key]}`);
          }
          for (const key of ['depthMin', 'depthMax']) {
            assert.ok(Math.abs(measured[key] - api.lastFrame[key]) <= EPS,
              `${activeAimCase.id}: actual ${key} must match telemetry`);
          }
        }
        vertices += measured.vertices;
        frames++;
        if (poseOverride) liveMax = Math.max(liveMax, measured.maxNdc);
        else staticMax = Math.max(staticMax, measured.maxNdc);
      } finally {
        pivot.rotation.copy(rotation);
        root.updateWorldMatrix(true, true);
      }
    }
    dispose() {}
  }
  class PMREMGenerator {
    fromScene() {
      const texture = new THREE.Texture();
      return { texture, dispose() { texture.dispose(); } };
    }
    dispose() {}
  }
  try {
    globalThis.window = { devicePixelRatio: 1 };
    globalThis.document = { createElement: () => canvas() };
    globalThis.createImageBitmap = async source => ({ width: source.width, height: source.height, close() {} });
    api = createPreview({
      THREE: { ...THREE, WebGLRenderer: Renderer, PMREMGenerator },
      data: { RIGS: [{ id: 'framing-fixture' }, ...AIM_CASES.map(({ id }) => ({ id }))] },
      rig: {
        listRigs: () => ['framing-fixture'],
        getSourceKey: () => 'fixture',
        buildPreview() {
          let group;
          if (activeAimCase) {
            group = new THREE.Group();
            group.name = 'framing-fixture';
            group.userData.preview = { aim: activeAimCase.aim, roll: 0 };
            const geometry = new THREE.BoxGeometry(...activeAimCase.dimensions);
            group.add(new THREE.Mesh(geometry, material));
            group.userData.dispose = () => geometry.dispose();
          } else group = fixture(material);
          buildFinished = performance.now();
          return group;
        },
      },
    });
    await api.init();
    assert.ok(api.ready, 'The actual preview API must initialize');
    for (const yaw of STATIC_YAWS) {
      const before = frames;
      assert.ok(await api.thumbnail('framing-fixture', { yaw }));
      assert.equal(frames, before + 1, 'Each distinct thumbnail pose must render');
      assert.ok(api.lastFrame?.ok && api.lastFrame.radius < 100, 'Hidden extreme geometry must not inflate fit');
      assert.equal(api.lastFrame.fill, FRAME_EDGE);
    }
    const target = canvas();
    api.setLive('framing-fixture', target);
    assert.ok(api.lastFrame?.ok && api.lastFrame.turntable);
    assert.ok(api.lastFrame.radius < 100, 'Live fit must also exclude hidden geometry');
    for (const pitch of LIVE_PITCHES) for (let degree = 0; degree < 360; degree++) {
      poseOverride = { pitch, yaw: degree * Math.PI / 180 };
      const before = frames, draws = target.draws;
      api.update(1 / 30);
      assert.equal(frames, before + 1, 'Every live sample must be a fresh actual API render');
      assert.equal(target.draws, draws + 1, 'Every live sample must reach its destination canvas');
    }
    api.clearLive();
    assert.equal(materialDisposals, 0, 'Preview disposal must preserve the shared fixture material');
    assert.equal(frames, 1805);
    assert.equal(vertices, 129960);
    poseOverride = null;
    // Three's lookAt perturbs an aim parallel to its default up vector. These
    // public-API cases require measured projections, not self-consistent but
    // incorrect telemetry. The long box stresses geometry close to the camera.
    for (const aimCase of AIM_CASES) {
      activeAimCase = aimCase;
      const before = frames;
      assert.ok(await api.thumbnail(aimCase.id, { yaw: 0 }));
      assert.equal(frames, before + 1, aimCase.id + ': must actually render');
      assert.ok(api.lastFrame?.ok, aimCase.id + ': telemetry must remain valid');
    }
    assert.equal(frames, 1813);
    assert.equal(vertices, 130152);
    return { frames, vertices, staticMax, liveMax, aimCases: AIM_CASES.length,
      cpuDiagnostics: {
        framingIntervalsMs: framingIntervals,
        priorBoxStageMs: originalBoundIntervals,
        limitation: 'Five cold synthetic fixtures only. Framing interval excludes builder and recording projection but includes API pivot/size setup; prior timing is only Box3. These are not comparable whole-frame or GPU performance measurements.',
      },
    };
  } finally {
    api?.dispose();
    material.dispose();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkPreviewFraming();
  console.log(`OK preview framing: ${result.frames} poses, ${result.vertices} actual vertex projections, static edge ${result.staticMax.toFixed(6)}, live edge ${result.liveMax.toFixed(6)}.`);
  console.log(JSON.stringify(result.cpuDiagnostics));
}
