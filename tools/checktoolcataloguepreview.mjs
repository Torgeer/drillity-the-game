/** CPU-only catalogue-to-public-preview regression.
 * node tools/checktoolcataloguepreview.mjs
 * The actual createPreview API builds and submits tools. Renderer/canvas doubles
 * record that geometry; no GPU, shaded pixels or framing-quality claim is made.
 * This complements checktoolcataloguegeometry.mjs without another dimension ruler.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { createPreview } from '../src/core/preview.js';
import { buildTool, disposeToolLibrary } from '../src/rig/tools.js';
import { ITEMS, RIGS, getItem } from '../src/game/data.js';

// Geometry-local transforms preserve physical shape. The preview's external
// recentering and yaw are intentionally excluded from this equality check.
function geometryFingerprint(root) {
  const digest = createHash('sha256');
  let vertices = 0;
  const visit = (node, parentMatrix) => {
    node.updateMatrix();
    const matrix = node === root ? new THREE.Matrix4().makeScale(node.scale.x, node.scale.y, node.scale.z)
      : new THREE.Matrix4().multiplyMatrices(parentMatrix, node.matrix);
    if (node.isMesh) {
      assert.ok(!node.isInstancedMesh && !node.isSkinnedMesh, 'fixture needs explicit instance/skin support');
      assert.ok(!node.morphTargetInfluences?.some(Boolean), 'fixture needs explicit morph support');
      const position = node.geometry.getAttribute('position');
      assert.ok(position?.count > 0, 'submitted tool geometry must be nonempty');
      assert.ok(Array.from(position.array).every(Number.isFinite), 'submitted vertices must be finite');
      assert.ok(matrix.elements.every(Number.isFinite), 'submitted transforms must be finite');
      vertices += position.count;
      digest.update(JSON.stringify(matrix.elements));
      digest.update(Buffer.from(position.array.buffer, position.array.byteOffset, position.array.byteLength));
      const index = node.geometry.index;
      if (index) digest.update(Buffer.from(index.array.buffer, index.array.byteOffset, index.array.byteLength));
    }
    for (const child of node.children) visit(child, matrix);
  };
  visit(root, new THREE.Matrix4());
  assert.ok(vertices > 0, 'empty submission must fail');
  return { vertices, sha256: digest.digest('hex') };
}

function canvas() {
  const surface = { width: 256, height: 256, clientWidth: 256, clientHeight: 256, isConnected: true };
  const context = { clearRect() {}, drawImage(image) { surface.submitted = image.submitted; } };
  surface.getContext = () => context;
  return surface;
}
class RecordingRenderer {
  constructor({ canvas }) { this.domElement = canvas; }
  setPixelRatio() {}
  setSize(width, height) { Object.assign(this.domElement, { width, height }); }
  render(scene) {
    const pivots = scene.children.filter(node => node.isGroup && node.visible && node.children.length);
    assert.equal(pivots.length, 1, 'one preview pivot must render');
    assert.equal(pivots[0].children.length, 1, 'one preview subject must render');
    const subject = pivots[0].children[0];
    this.domElement.submitted = { spec: structuredClone(subject.userData.spec), ...geometryFingerprint(subject) };
  }
  dispose() {}
}
class CpuPMREM {
  fromScene() { return { texture: new THREE.Texture(), dispose() {} }; }
  dispose() {}
}

const keys = ['window', 'document', 'createImageBitmap', 'fetch'];
const saved = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
let preview;
let count = 0;
try {
  globalThis.window = { devicePixelRatio: 1 };
  globalThis.document = { baseURI: 'https://tool-preview.invalid/', createElement: () => canvas() };
  globalThis.createImageBitmap = async source => ({ width: source.width, height: source.height,
    submitted: source.submitted, close() {} });
  globalThis.fetch = async () => { throw Error('CPU tool preview must never fetch'); };
  const T = { ...THREE, WebGLRenderer: RecordingRenderer, PMREMGenerator: CpuPMREM };
  preview = createPreview({ THREE: T, data: { ITEMS, RIGS, getItem } });
  await preview.init();
  assert.equal(preview.ready, true, 'real public preview must initialize');
  // The two expected nominal diameters are primary-sourced in data.js and
  // research/TOOL_CATALOGUE_DIMENSIONS.md. Other cases use existing alias IDs.
  const fixtures = [
    { id: 'bit-th-t45-76-std', builder: 'button-bit', opts: { thread: 'T45', diameterMm: 76 } },
    { id: 'bit-th-t45-89-hd', builder: 'button-bit', opts: { thread: 'T45', diameterMm: 89 } },
    ...['button-bit-t51-hd', 'ith-bit-216', 'cfa-flight-450', 'core-bit-pq', 'rod-r32']
      .map(id => ({ id, builder: id, opts: {} })),
  ];
  for (const fixture of fixtures) for (const wear of [0, 0.5, 1]) {
    const target = canvas();
    assert.equal(await preview.render(fixture.id, target, { wear }), true, `${fixture.id} renders`);
    assert.ok(target.submitted, `${fixture.id} must reach actual drawImage`);
    const expected = buildTool(THREE, {}, fixture.builder, { ...fixture.opts, wear, preview: true });
    try {
      assert.equal(target.submitted.spec.id, expected.userData.spec.id, `${fixture.id} uses expected builder`);
      assert.equal(target.submitted.spec.diameterMm, expected.userData.spec.diameterMm, `${fixture.id} preserves nominal diameter`);
      assert.deepEqual({ vertices: target.submitted.vertices, sha256: target.submitted.sha256 },
        geometryFingerprint(expected), `${fixture.id} @ ${wear}: actual preview submits expected geometry`);
      count++;
    } finally { expected.userData.dispose(); }
  }
  assert.equal(count, 21, 'every required fixture and wear level must execute');
} finally {
  preview?.dispose();
  disposeToolLibrary();
  for (const [key, descriptor] of saved) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
}
console.log(`PASS tool catalogue public preview: ${count} actual API/render/blit geometry cases; CPU only.`);
