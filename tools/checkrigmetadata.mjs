/**
 * CPU-only regression checks for the public GLB rig loader.
 *
 * Usage: node tools/checkrigmetadata.mjs
 *        node tools/checkrigmetadata.mjs --fixtures-only  (authoring iteration)
 *
 * Every fixture coordinate/range below is synthetic and NOT SOURCED. These
 * deliberately exaggerated shapes are contract probes, never physical rig
 * measurements. For real model dimensions use tools/glbinfo.mjs, the existing
 * actual-vertex ruler. No browser, server, renderer, GPU, or model rebuild is
 * involved: actual Three objects pass through GLTFExporter and GLTFLoader.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createBus } from '../src/core/contract.js';
import { mergeStatic } from '../src/rig/tools.js';
import { RIGS } from '../src/game/data.js';

const results = [];
let fixtureSerial = 0;

// GLTFExporter only needs this browser API to read its in-memory output Blob.
// There are no images, textures, external buffers, or network requests here.
class FixtureFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    }, (error) => {
      this.error = error;
      this.onerror?.(error);
    });
  }
}

function group(name, parent) {
  const node = new THREE.Group();
  node.name = name;
  if (parent) parent.add(node);
  return node;
}

function mesh(name, geometry, parent) {
  const material = new THREE.MeshStandardMaterial();
  material.name = 'rawSteel';
  const node = new THREE.Mesh(geometry, material);
  node.name = name;
  if (parent) parent.add(node);
  return node;
}

function fixture(extras = { travel_m: 2 }, rest = 1) {
  const root = group('fixture-root');
  const mast = group('pivot:mast', root);
  const beam = mesh('mast-beam', new THREE.BoxGeometry(2, 4, 2), mast);
  beam.position.y = 2;
  const carriage = group('slide:carriage', mast);
  carriage.position.y = rest;
  // Endpoint fixtures default to the complete agreed exported contract.
  // A field explicitly set to undefined is omitted by the exporter, allowing
  // missing-schema cases below to exercise real GLB JSON rather than a mock.
  const endpoints = 'travel_min_m' in extras || 'travel_max_m' in extras;
  carriage.userData = { ...(endpoints ? {
    travel_space: 'parent-local', travel_axis: 'y', travel_direction: 'min',
  } : {}), ...extras };
  group('mount:tool', carriage);
  return { root, mast, carriage, beam };
}

function near(actual, expected, message, tolerance = 1e-6) {
  assert.ok(Number.isFinite(actual), `${message}: ${actual} must be finite`);
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}`);
}

function rangeNear(actual, expected) {
  assert.ok(Array.isArray(actual) && actual.length === 2, 'two feed endpoints');
  actual.forEach((value, index) => near(value, expected[index], `feed endpoint ${index}`));
}

function assertCleanFraming(runtime, id, built) {
  const { size, framing, feedFraming } = runtime.info(id);
  near(size.x, 2, 'included machine framing width');
  near(size.y, 4, 'included machine framing height');
  near(size.z, 2, 'included machine framing length');
  near(built.dyn.mastHeight, 4, 'scenery-free carriage flex height');
  near(built.spec.mastM, 4, 'scenery-free mast spec');
  near(built.spec.frameRadius, 1.15, 'scenery-free placement radius');
  assert.deepEqual(framing, { space: 'rig-local', min: [-1, 0, -1], max: [1, 4, 1], center: [0, 2, 0] },
    'exact measured bounds are published in unplaced rig coordinates');
  assert.deepEqual(built.spec.glb.framing, framing, 'camera and placement share one measured box');
  assert.deepEqual(feedFraming, { ...framing, scope: 'carriage-feed' },
    'a carriage without geometry cannot invent a larger feed envelope');
  assert.deepEqual(built.spec.glb.feedFraming, feedFraming, 'feed framing is shared at API boundaries');
}

function assertInsideFeed(root, framing, label) {
  assert.equal(framing.space, 'rig-local');
  assert.equal(framing.scope, 'carriage-feed');
  const point = new THREE.Vector3();
  let count = 0;
  root.updateMatrixWorld(true);
  root.traverse(node => {
    if (!node.isMesh || node.userData.framing === 'exclude') return;
    for (let i = 0; i < node.geometry.attributes.position.count; i++) {
      node.getVertexPosition(i, point).applyMatrix4(node.matrixWorld);
      for (const [axis, value] of point.toArray().entries()) assert.ok(
        value >= framing.min[axis] - 1e-5 && value <= framing.max[axis] + 1e-5,
        `${label}/${node.name}: vertex ${value} is outside feed framing [${framing.min[axis]}, ${framing.max[axis]}] on axis ${axis}`);
      count++;
    }
  });
  assert.ok(count > 0, 'feed containment must inspect included geometry');
}

function disposeFixture(root) {
  if (!root) return;
  const geometries = new Set();
  const materials = new Set();
  root.traverse((node) => {
    if (node.geometry) geometries.add(node.geometry);
    const list = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of list) if (material) materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}

async function withRig(root, inspect, mode = 'strict', source = null) {
  const previous = {
    FileReader: globalThis.FileReader,
    document: globalThis.document,
    fetch: globalThis.fetch,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  const id = source ? source.id : `metadata-fixture-${++fixtureSerial}`;
  let runtime;
  const clones = [];
  const liveMaterial = new THREE.MeshStandardMaterial();
  liveMaterial.name = 'rawSteel';
  const diagnostics = [];
  const events = [];
  try {
    globalThis.FileReader = FixtureFileReader;
    const binary = source ? source.binary : await new GLTFExporter().parseAsync(root, { binary: true });
    globalThis.document = { baseURI: 'https://rig-fixtures.invalid/' };
    globalThis.fetch = async (url) => {
      assert.equal(url, `https://rig-fixtures.invalid/models/${id}.glb`,
        'fixture must not request anything outside its in-memory GLB');
      return new Response(binary);
    };
    console.info = (...args) => diagnostics.push(args.join(' '));
    console.warn = (...args) => diagnostics.push(args.join(' '));
    console.error = (...args) => diagnostics.push(args.join(' '));
    runtime = createGltfRigs({
      THREE,
      qs: new URLSearchParams(mode ? `glb=${mode}` : ''),
      assets: { material: () => liveMaterial, _kinds: source ? undefined : { rawSteel: true } },
      bus: { emit: (name, payload) => events.push({ name, payload }) },
    });
    const build = () => {
      const builder = runtime.builder(id);
      assert.equal(typeof builder, 'function', 'public loader must publish a builder');
      const built = builder(THREE, {});
      clones.push(built.root);
      return built;
    };
    await inspect({ runtime, id, build, diagnostics, events,
      assets: { material: () => liveMaterial } });
  } finally {
    runtime?.dispose();
    for (const clone of clones) disposeFixture(clone);
    disposeFixture(root);
    liveMaterial.dispose();
    globalThis.FileReader = previous.FileReader;
    globalThis.document = previous.document;
    globalThis.fetch = previous.fetch;
    console.info = previous.info;
    console.warn = previous.warn;
    console.error = previous.error;
  }
}

async function test(name, run) {
  try {
    await run();
    results.push({ name, ok: true });
    console.log(`  PASS  ${name}`);
  } catch (error) {
    results.push({ name, ok: false });
    console.error(`  FAIL  ${name}: ${error.message}`);
  }
}

console.log('GLB rig metadata: synthetic NOT SOURCED fixtures, CPU-only public-loader checks.');

for (const [name, extras, rest, expected] of [
  ['legacy positive travel keeps descending feed', { travel_m: 2 }, 1, [3, 1]],
  ['legacy negative travel keeps descending feed', { travel_m: -2 }, 1, [1, -1]],
  ['absolute bounds alone drive a nonzero-rest carriage',
    { travel_min_m: 0, travel_max_m: 2 }, 1, [2, 0]],
  ['absolute bounds override rest-plus-travel placement',
    { travel_m: 2, travel_min_m: 0, travel_max_m: 2 }, 1, [2, 0]],
  ['negative travel agrees with an absolute range',
    { travel_m: -2, travel_min_m: -1, travel_max_m: 1 }, 0, [1, -1]],
  ['negative absolute endpoints still descend',
    { travel_min_m: -3, travel_max_m: -1 }, -2, [-1, -3]],
  ['translated absolute bounds remain absolute',
    { travel_m: 2, travel_min_m: 5, travel_max_m: 7 }, 6, [7, 5]],
  ['pd55-style high rest does not add a second stroke',
    { travel_m: 2, travel_min_m: 1, travel_max_m: 3 }, 3, [3, 1]],
]) {
  await test(name, async () => {
    await withRig(fixture(extras, rest).root, async ({ runtime, id, build, events }) => {
      await runtime.load(id);
      const { dyn } = build();
      rangeNear(dyn.carriageRange, expected);
      near(dyn.mastHeight, 4, 'finite mast flex height');
      dyn.carriage.position.y = expected[1];
      const second = build();
      rangeNear(second.dyn.carriageRange, expected);
      near(second.dyn.carriage.position.y, rest, 'fresh instance retains authored rest');
      assert.deepEqual(events.map((event) => event.name), ['rig:model-ready'],
        'valid metadata emits one ready event');
    });
  });
}

await test('rotated sparse mast uses actual vertices rather than rotated AABB corners', async () => {
  const { root, beam, mast } = fixture();
  beam.geometry.dispose();
  beam.geometry = new THREE.BufferGeometry();
  beam.geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0,
    4, 0, 0,
    0, 4, 0,
  ], 3));
  beam.position.y = 0;
  mast.rotation.z = Math.PI / 4;
  await withRig(root, async ({ runtime, id }) => {
    await runtime.load(id);
    const { size } = runtime.info(id);
    // Analytic corners of this one synthetic triangle after the 45-degree
    // rotation: (0,0), (sqrt(8),sqrt(8)), (-sqrt(8),sqrt(8)). The unoccupied
    // local AABB corner (4,4) would incorrectly double its framed height.
    near(size.x, 2 * Math.sqrt(8), 'rotated triangle framing width');
    near(size.y, Math.sqrt(8), 'rotated triangle framing height');
    near(size.z, 0, 'planar triangle framing length');
  });
});

for (const [name, attachScenery, expectedPrimitives] of [
  ['arbitrary authored exclusion with nested transformed descendants', ({ root }) => {
    const excluded = group('unrelated-authoring-label', root);
    excluded.userData.framing = 'exclude';
    excluded.position.set(20, 30, -25);
    excluded.rotation.z = Math.PI / 4;
    const nested = group('nested-unmarked-assembly', excluded);
    nested.scale.set(3, 2, 5);
    mesh('retained-scenery', new THREE.BoxGeometry(1, 1, 1), nested);
  }, 2],
  ['same-material scenery mesh inside the mast subtree', ({ mast }) => {
    const excluded = mesh('retained-scenery', new THREE.BoxGeometry(1, 1, 1), mast);
    excluded.position.set(20, 30, -25);
    excluded.userData.framing = 'exclude';
  }, 2],
  ['inherited exclusion survives lifting a named pivot off a mesh', ({ root }) => {
    const excluded = mesh('excluded-mesh-ancestor', new THREE.BoxGeometry(1, 1, 1), root);
    excluded.position.set(20, 30, -25);
    excluded.userData.framing = 'exclude';
    const pivot = group('pivot:prop-motion', excluded);
    mesh('retained-scenery', new THREE.BoxGeometry(1, 1, 1), pivot);
  }, 3],
  ['inherited exclusion survives lifting a named mount off a mesh', ({ root }) => {
    const excluded = mesh('excluded-mesh-ancestor', new THREE.BoxGeometry(1, 1, 1), root);
    excluded.position.set(20, 30, -25);
    excluded.userData.framing = 'exclude';
    const mount = group('mount:prop-attachment', excluded);
    mesh('retained-scenery', new THREE.BoxGeometry(1, 1, 1), mount);
  }, 3],
]) {
  await test(`excludes ${name} from all framing consumers`, async () => {
    const scene = fixture();
    attachScenery(scene);
    await withRig(scene.root, async ({ runtime, id, build }) => {
      await runtime.load(id);
      const built = build();
      assertCleanFraming(runtime, id, built);
      assert.equal(runtime.info(id).prims, expectedPrimitives,
        'draw-call floor must still count scenery');
      const retained = built.root.getObjectByName('retained-scenery');
      assert.ok(retained?.isMesh, 'scenery must still be instantiated');
      assert.equal(retained.visible, true, 'exclusion must not hide scenery');
    });
  });
}

await test('untagged distant machine geometry still affects framing', async () => {
  const { root } = fixture();
  const extension = mesh('untagged-machine-extension', new THREE.BoxGeometry(1, 1, 1), root);
  extension.position.set(20, 30, 0);
  await withRig(root, async ({ runtime, id, build }) => {
    await runtime.load(id);
    const built = build();
    near(runtime.info(id).size.x, 21.5, 'included distant component width');
    near(runtime.info(id).size.y, 30.5, 'included distant component height');
    near(built.dyn.mastHeight, 30.5, 'included distant component flex height');
    near(built.spec.mastM, 30.5, 'included distant component mast spec');
    near(built.spec.frameRadius, 12.36, 'included distant component placement radius');
  });
});

for (const [name, extras] of [
  ['minimum without maximum', { travel_m: 2, travel_min_m: 0 }],
  ['maximum without minimum', { travel_m: 2, travel_max_m: 2 }],
  ['string minimum', { travel_m: 2, travel_min_m: '0', travel_max_m: 2 }],
  ['string maximum', { travel_m: 2, travel_min_m: 0, travel_max_m: '2' }],
  ['null minimum', { travel_m: 2, travel_min_m: null, travel_max_m: 2 }],
  ['boolean maximum', { travel_m: 2, travel_min_m: 0, travel_max_m: true }],
  ['nonfinite minimum', { travel_m: 2, travel_min_m: -Infinity, travel_max_m: 2 }],
  ['nonfinite maximum', { travel_m: 2, travel_min_m: 0, travel_max_m: Infinity }],
  ['NaN minimum', { travel_m: 2, travel_min_m: NaN, travel_max_m: 2 }],
  ['reversed range', { travel_m: 2, travel_min_m: 2, travel_max_m: 0 }],
  ['collapsed range', { travel_m: 2, travel_min_m: 1, travel_max_m: 1 }],
  ['travel disagrees with range span', { travel_m: 3, travel_min_m: 0, travel_max_m: 2 }],
  ['missing travel space', { travel_min_m: 0, travel_max_m: 2, travel_space: undefined }],
  ['missing travel axis', { travel_min_m: 0, travel_max_m: 2, travel_axis: undefined }],
  ['missing feed direction', { travel_min_m: 0, travel_max_m: 2, travel_direction: undefined }],
  ['world coordinate space', { travel_min_m: 0, travel_max_m: 2, travel_space: 'world' }],
  ['unsupported travel axis', { travel_min_m: 0, travel_max_m: 2, travel_axis: 'w' }],
  ['unsupported feed direction', { travel_min_m: 0, travel_max_m: 2, travel_direction: 'up' }],
  ['axis without endpoint declarations', { travel_axis: 'y' }],
  ['rest outside endpoint range', { travel_min_m: 5, travel_max_m: 7 }],
  ['invalid legacy stroke', { travel_m: '2' }],
  ['overflowing endpoint span', { travel_min_m: -Number.MAX_VALUE, travel_max_m: Number.MAX_VALUE }],
]) {
  await test(`rejects ${name} before publishing a model`, async () => {
    // JSON has no NaN or infinity: GLTFExporter encodes these as null. They
    // must still reject as invalid declared metadata, rather than disappearing
    // into a missing-field fallback. This does not claim raw JSON stores NaN.
    await withRig(fixture(extras).root, async ({ runtime, id, events }) => {
      await assert.rejects(runtime.load(id), (error) => {
        assert.match(error.message, /travel_(?:min_m|max_m|m|space|axis|direction)/,
          'rejection must identify the broken travel contract');
        assert.match(error.message, /slide:carriage/,
          'rejection must identify the authored slide');
        return true;
      });
      assert.equal(runtime.has(id), false, 'invalid model must not enter the prepared cache');
      assert.equal(runtime.info(id), null, 'invalid model must not publish geometry facts');
      assert.equal(runtime.isLoading(id), false, 'failed load must leave the inflight set');
      assert.equal(runtime.problems().length, 1, 'failure remains inspectable');
      assert.throws(() => runtime.builder(id)(), /strict/i,
        'strict builder must refuse failed metadata rather than build a substitute');
      assert.deepEqual(events.map((event) => event.name), ['rig:model-failed'],
        'invalid metadata never emits a ready event');
    });
  });
}

await test('normal mode also rejects an invalid declaration on a secondary slide', async () => {
  const { root, mast } = fixture();
  const secondary = group('slide:auxiliary-fixture', mast);
  secondary.userData = { travel_min_m: 1 };
  await withRig(root, async ({ runtime, id, events }) => {
    await assert.rejects(runtime.load(id), (error) => {
      assert.match(error.message, /slide:auxiliary-fixture/);
      assert.match(error.message, /travel_(?:min_m|max_m|m)/);
      return true;
    });
    assert.equal(runtime.has(id), false);
    assert.equal(runtime.builder(id), null, 'normal mode cannot build invalid GLB metadata');
    assert.deepEqual(events.map((event) => event.name), ['rig:model-failed']);
  }, '');
});

// Exercise the actual private runtime helpers on real Three objects. This
// extracts their source, rather than copying their algorithm into a test
// double; no browser, renderer or GPU is needed to drive a local transform.
const factorySource = readFileSync(new URL('../src/rig/rigFactory.js', import.meta.url), 'utf8');
const setterSource = factorySource.match(/function setCarriage\(u\) \{[\s\S]*?\n  \}/)?.[0];
const getterSource = factorySource.match(/function setCarriageGet\(dyn\) \{[\s\S]*?\n  \}/)?.[0];
assert.ok(setterSource && getterSource, 'actual carriage driver functions must be available');
const clamp01 = (value) => Math.max(0, Math.min(1, value));
function drivers(dyn) {
  return new Function('active', 'clamp01', 'lerp', `${setterSource}\n${getterSource}
    return { set: setCarriage, get: () => setCarriageGet(active.dyn) };`)(
    { dyn }, clamp01, (a, b, k) => a + (b - a) * k);
}

for (const [axis, direction] of [['x', 'min'], ['y', 'max'], ['z', 'max']]) {
  await test(`actual driver follows ${axis}/${direction} and preserves other authored coordinates`, async () => {
    const scene = fixture({ travel_min_m: -3, travel_max_m: 3,
      travel_axis: axis, travel_direction: direction });
    scene.carriage.position.set(0.3, 1.1, -0.7);
    scene.carriage.rotation.set(0.2, -0.3, 0.4);
    await withRig(scene.root, async ({ runtime, id, build }) => {
      await runtime.load(id);
      const { dyn } = build();
      assert.equal(dyn.carriageAxis, axis);
      const rest = dyn.carriageRest.clone();
      const rotation = dyn.carriageRestRotation.clone();
      const control = drivers(dyn);
      const expected = direction === 'min' ? [3, -3] : [-3, 3];
      rangeNear(dyn.carriageRange, expected);
      for (const k of [0, 0.25, 1, 0.25]) {
        control.set(k);
        near(dyn.carriage.position[axis], expected[0] + (expected[1] - expected[0]) * k, 'actual feed position');
        near(control.get(), k, 'actual feed getter');
        assert.deepEqual(dyn.carriage.rotation.toArray(), rotation.toArray(),
          'zero-flex feed preserves every authored carriage rotation');
        for (const other of ['x', 'y', 'z'].filter((value) => value !== axis)) {
          near(dyn.carriage.position[other], rest[other], `retained ${other} coordinate`);
        }
      }
      if (axis !== 'y') assert.equal(dyn.carriageNoFlex, true, 'Y-to-Z flex cannot overwrite another feed axis');
    });
  });
}

await test('legacy procedural driver still follows Y without new metadata', async () => {
  const dyn = { carriage: new THREE.Group(), carriageRange: [3, 1], mastHeight: 4 };
  const control = drivers(dyn);
  control.set(0.25);
  near(dyn.carriage.position.y, 2.5, 'procedural feed position');
  near(control.get(), 0.25, 'procedural feed getter');
});

await test('lifting a slide preserves authored frame and endpoints through runtime merging', async () => {
  const scene = fixture({ travel_min_m: 0, travel_max_m: 2 });
  const carrier = mesh('static-carrier', new THREE.BoxGeometry(1, 1, 1), scene.mast);
  carrier.position.set(4, 5, 6);
  carrier.rotation.set(0.2, 0.3, 0.4);
  carrier.scale.set(2, 3, 4);
  const parentFrame = group('unmarked-nonmesh-frame', carrier);
  parentFrame.rotation.set(-0.1, 0.2, 0.1);
  parentFrame.position.set(0.2, 0.4, 0.6);
  parentFrame.add(scene.carriage);
  const head = mesh('moving-head', new THREE.BoxGeometry(0.2, 0.2, 0.2), scene.carriage);
  scene.root.updateMatrixWorld(true);
  const expected = [0, 0.5, 1].map((k) => {
    const point = scene.carriage.position.clone();
    point.y = 2 - 2 * k;
    return point.applyMatrix4(parentFrame.matrixWorld);
  });
  await withRig(scene.root, async ({ runtime, id, build }) => {
    await runtime.load(id);
    const built = build();
    const { dyn } = built;
    const control = drivers(dyn);
    mergeStatic(THREE, built.root);
    assert.ok(built.root.getObjectByName(head.name), 'moving geometry remains attached after merge');
    for (const [index, k] of [0, 0.5, 1].entries()) {
      control.set(k);
      built.root.updateMatrixWorld(true);
      const point = dyn.carriage.getWorldPosition(new THREE.Vector3());
      near(point.distanceTo(expected[index]), 0, 'authored-frame world endpoint', 3e-6);
      near(control.get(), k, 'feed getter after parent lift');
    }
    for (let p = dyn.carriage.parent; p; p = p.parent) {
      assert.equal(p.isMesh, undefined, 'slide must have no static mesh ancestor');
    }
  });
});

for (const value of ['include', 'hidden', true, null, 0]) {
  await test(`rejects unsupported framing ${JSON.stringify(value)}`, async () => {
    const scene = fixture();
    scene.mast.userData.framing = value;
    await withRig(scene.root, async ({ runtime, id, events }) => {
      await assert.rejects(runtime.load(id), /framing.*exclude/);
      assert.equal(runtime.has(id), false);
      assert.deepEqual(events.map((event) => event.name), ['rig:model-failed']);
    });
  });
}

await test('empty included framing cannot publish a zero-sized machine', async () => {
  const scene = fixture();
  scene.root.userData.framing = 'exclude';
  await withRig(scene.root, async ({ runtime, id }) => {
    await assert.rejects(runtime.load(id), /framing includes no measurable geometry/);
    assert.equal(runtime.has(id), false);
  });
});

await test('travel metadata on a non-slide node cannot silently go unused', async () => {
  const scene = fixture();
  const misplaced = group('unrecognized-moving-part', scene.mast);
  misplaced.userData.travel_m = 2;
  await withRig(scene.root, async ({ runtime, id }) => {
    await assert.rejects(runtime.load(id), /unrecognized-moving-part.*travel.*slide:/);
    assert.equal(runtime.has(id), false);
  });
});

await test('an entirely empty model cannot pass framing', async () => {
  await withRig(group('empty-machine'), async ({ runtime, id }) => {
    await assert.rejects(runtime.load(id), /framing includes no measurable geometry/);
    assert.equal(runtime.has(id), false);
  });
});

await test('framing API copies cannot corrupt later instances or source facts', async () => {
  const scene = fixture();
  await withRig(scene.root, async ({ runtime, id, build }) => {
    await runtime.load(id);
    const first = build();
    const reported = runtime.info(id);
    reported.size.x = 999;
    reported.framing.min[0] = -999;
    reported.framing.max[1] = 999;
    first.spec.glb.framing.center[0] = 999;
    reported.feedFraming.min[0] = -999;
    reported.feedFraming.max[1] = 999;
    first.spec.glb.feedFraming.center[0] = 999;
    first.root.position.set(99, 99, 99);
    const second = build();
    assertCleanFraming(runtime, id, second);
    assert.deepEqual(second.root.position.toArray(), [0, 0, 0], 'one game placement cannot alter the next root');
  });
});

for (const [name, extras, expectedMin, expectedMax] of [
  ['positive legacy stroke', { travel_m: 6 }, [-1, 0, -1], [1, 8, 1]],
  ['negative legacy stroke', { travel_m: -4 }, [-1, -4, -1], [1, 4, 1]],
  ['stationary legacy carriage', { travel_m: 0 }, [-1, 0, -1], [1, 4, 1]],
  ['explicit Y feed', { travel_min_m: -2, travel_max_m: 6 }, [-1, -3, -1], [1, 7, 1]],
  ['explicit X feed', { travel_axis: 'x', travel_direction: 'max', travel_min_m: -3, travel_max_m: 6 },
    [-4, 0, -1], [7, 4, 1]],
  ['explicit Z feed', { travel_axis: 'z', travel_direction: 'max', travel_min_m: -3, travel_max_m: 6 },
    [-1, 0, -4], [1, 4, 7]],
]) {
  await test(`feed framing measures ${name} and restores authored rest`, async () => {
    const scene = fixture(extras);
    mesh('moving-head', new THREE.BoxGeometry(2, 2, 2), scene.carriage);
    const excluded = group('external-carriage-hose', scene.carriage);
    excluded.userData.framing = 'exclude';
    mesh('distant-hose', new THREE.BoxGeometry(50, 50, 50), excluded).position.set(100, 100, 100);
    await withRig(scene.root, async ({ runtime, id, build, events }) => {
      await runtime.load(id);
      const built = build(), info = runtime.info(id), feed = info.feedFraming;
      assert.deepEqual(info.framing, { space: 'rig-local', min: [-1, 0, -1], max: [1, 4, 1], center: [0, 2, 0] },
        'rest framing stays independent of the feed envelope');
      assert.equal(feed.space, 'rig-local');
      assert.equal(feed.scope, 'carriage-feed');
      assert.deepEqual(feed.min, expectedMin);
      assert.deepEqual(feed.max, expectedMax);
      assert.deepEqual(feed.center, expectedMin.map((lo, axis) => (lo + expectedMax[axis]) / 2));
      assert.deepEqual(built.spec.glb.feedFraming, feed);
      assert.deepEqual(events[0].payload.spec.glb.feedFraming, feed, 'ready event includes feed framing');
      for (const copy of [built, build()]) {
        assert.deepEqual(copy.dyn.carriage.position.toArray(), [0, 1, 0], 'measurement restores source local rest');
        assert.deepEqual(copy.dyn.carriageRest.toArray(), [0, 1, 0], 'runtime reset is based on authored rest');
        assert.deepEqual(copy.dyn.carriage.getWorldPosition(new THREE.Vector3()).toArray(), [0, 1, 0],
          'measurement restores source world matrices');
      }
      assert.ok(built.root.getObjectByName('distant-hose'), 'excluded moving geometry remains present');
    });
  });
}

await test('feed framing measures rotated actual vertices and preserves parent transforms', async () => {
  const scene = fixture({ travel_axis: 'x', travel_direction: 'max', travel_min_m: -2, travel_max_m: 2 }, 0);
  // Three actual triangle points; transforming its AABB corners would add
  // unoccupied extrema. The quarter-turn parent also tests glTF parent axes.
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 4, 0, 0, 0, 2, 0], 3));
  mesh('moving-triangle', geometry, scene.carriage).rotation.z = Math.PI / 4;
  scene.mast.position.set(3, 2, 1);
  scene.mast.rotation.z = Math.PI / 2;
  await withRig(scene.root, async ({ runtime, id, build }) => {
    await runtime.load(id);
    const built = build(), feed = runtime.info(id).feedFraming;
    const root = built.root;
    const pose = built.dyn.carriage.position.clone();
    const rotation = built.dyn.mastPivot.quaternion.clone();
    // Mast occupies X[-1,3], Y[1,3]. Triangle's rotated Y envelope is
    // [-sqrt(2)-2, sqrt(8)+2] relative to the translated parent.
    near(feed.min[0], -1, 'measured minimum X');
    near(feed.max[0], 3, 'measured maximum X');
    near(feed.min[1], -Math.sqrt(2), 'actual triangle minimum Y');
    near(feed.max[1], 4 + Math.sqrt(8), 'actual triangle maximum Y');
    root.updateMatrixWorld(true);
    assert.deepEqual(built.dyn.carriage.position.toArray(), pose.toArray());
    assert.deepEqual(built.dyn.mastPivot.quaternion.toArray(), rotation.toArray());
  });
});

await test('real rig activation and update preserve authored rake without creating carriage flex', async () => {
  const scene = fixture({ travel_min_m: 0, travel_max_m: 2 });
  scene.mast.rotation.x = -0.6;
  scene.carriage.rotation.x = 0.2;
  mesh('moving-head', new THREE.BoxGeometry(0.2, 0.2, 0.2), scene.carriage);
  await withRig(scene.root, async ({ runtime, id, build, assets }) => {
    await runtime.load(id);
    let built;
    const system = createRigSystem({ THREE, assets, scene: new THREE.Scene(),
      sectionScene: new THREE.Scene(), bus: createBus(), quality: { id: 'low' },
      state: { garage: { rigId: id }, settings: {} },
      data: { RIGS: [{ id, name: 'Synthetic NOT SOURCED mast fixture', methods: ['cfa'] }] },
      qs: new URLSearchParams('glb=strict'),
      gltfRigs: { ...runtime, builder: () => () => { built = build(); return built; } } });
    try {
      system.setMethod('cfa');
      await system.init();
      assert.equal(system.getSpec().source, 'glb');
      near(built.dyn.mastPivot.rotation.x, -0.6, 'activation preserves authored work rake');
      for (const depth of [0, 1.5, 2.999]) {
        system.update(1 / 60, { drill: { active: true, depth, actionDepth: depth,
          rpm: 0, torque: 0.7, wob: 0.7, wear: 0, phase: 'drill' } });
        near(built.dyn.mastPivot.rotation.x, -0.6, 'update preserves deployment rake');
        near(built.dyn.carriageFlexAngle, 0, 'a deployment pivot alone is not a flex segment');
        near(built.dyn.carriage.rotation.x, 0.2, 'actual update retains carriage mounting angle');
        near(built.dyn.carriage.position.z, built.dyn.carriageRest.z, 'actual update stays on the feed rail');
      }
    } finally { system.dispose(); }
  });
});

await test('a moving mesh pivot keeps its carriage and mount attached after merging', async () => {
  const root = group('fixture-root');
  const mast = mesh('pivot:mast', new THREE.BoxGeometry(2, 4, 2), root);
  mast.position.set(1, 2, 3);
  const carriage = group('slide:carriage', mast);
  carriage.position.y = 1;
  carriage.userData = { travel_space: 'parent-local', travel_axis: 'y', travel_direction: 'min',
    travel_min_m: 0, travel_max_m: 2 };
  mesh('moving-head', new THREE.BoxGeometry(0.2, 0.2, 0.2), carriage);
  const mount = group('mount:pivot-light', mast);
  mount.position.set(0.4, 1.5, 0.2);
  group('aim:pivot-light', mount).position.y = -1;
  mesh('other-static', new THREE.BoxGeometry(1, 1, 1), root);
  await withRig(root, async ({ runtime, id, build }) => {
    await runtime.load(id);
    const built = build();
    mergeStatic(THREE, built.root);
    const dyn = built.dyn;
    const control = drivers(dyn);
    const liveMount = dyn.mounts.get('pivot-light');
    for (const angle of [0, 0.3, -0.2]) {
      dyn.mastPivot.rotation.z = angle;
      control.set(0.25);
      built.root.updateMatrixWorld(true);
      const expectedHead = new THREE.Vector3(0, 1.5, 0).applyMatrix4(dyn.mastPivot.matrixWorld);
      const expectedMount = mount.position.clone().applyMatrix4(dyn.mastPivot.matrixWorld);
      near(dyn.carriage.getWorldPosition(new THREE.Vector3()).distanceTo(expectedHead), 0,
        'carriage must follow its moving mesh parent');
      near(liveMount.getWorldPosition(new THREE.Vector3()).distanceTo(expectedMount), 0,
        'mount must follow its moving mesh parent');
    }
  });
});

await test('a named mesh attachment remains live when same-material statics merge', async () => {
  const scene = fixture();
  const mount = mesh('mount:mesh-light', new THREE.BoxGeometry(0.2, 0.2, 0.2), scene.root);
  mount.position.set(4, 5, 6);
  group('aim:mesh-light', mount).position.set(1, -1, 0);
  mesh('another-static', new THREE.BoxGeometry(1, 1, 1), scene.root);
  await withRig(scene.root, async ({ runtime, id, build }) => {
    await runtime.load(id);
    const built = build();
    const live = built.dyn.mounts.get('mesh-light');
    mergeStatic(THREE, built.root);
    assert.equal(built.root.getObjectByName('mount:mesh-light'), live, 'attachment identity must remain in scene');
    built.root.position.set(1, 2, 3);
    built.root.updateMatrixWorld(true);
    const expected = mount.position.clone().add(built.root.position);
    near(live.getWorldPosition(new THREE.Vector3()).distanceTo(expected), 0, 'attachment follows live root');
    assert.ok(live.getObjectByName('aim:mesh-light'), 'aim survives with attachment');
  });
});

if (!process.argv.includes('--fixtures-only')) {
  assert.ok(RIGS.length > 0, 'the shipped fleet must not be empty');
  assert.equal(new Set(RIGS.map((rig) => rig.id)).size, RIGS.length, 'every shipped rig id must be unique');
  for (const { id } of RIGS) {
    await test(`shipped GLB ${id} loads and drives through its declared endpoints`, async () => {
      const binary = readFileSync(new URL(`../public/models/${id}.glb`, import.meta.url));
      await withRig(null, async ({ runtime, build, events }) => {
        await runtime.load(id);
        assert.equal(runtime.has(id), true);
        assert.ok(runtime.info(id).prims > 0, 'a real model must contain geometry');
        assert.ok(Object.values(runtime.info(id).size).every(Number.isFinite), 'framing must be finite');
        const built = build();
        const dyn = built.dyn;
        const feedFraming = runtime.info(id).feedFraming;
        assert.deepEqual(built.spec.glb.feedFraming, feedFraming);
        assertInsideFeed(built.root, feedFraming, `${id}/rest`);
        // This envelope covers authored carriage translations. The runtime's
        // separate mast/flex driver is not part of that declared scope.
        const feedPose = build();
        if (dyn.carriage) {
          const extras = dyn.carriage.userData;
          if (Object.prototype.hasOwnProperty.call(extras, 'travel_min_m')) {
            assert.equal(dyn.carriageAxis, extras.travel_axis);
            rangeNear(dyn.carriageRange, extras.travel_direction === 'min'
              ? [extras.travel_max_m, extras.travel_min_m] : [extras.travel_min_m, extras.travel_max_m]);
          }
          const control = drivers(dyn);
          for (const k of [0, 0.5, 1]) {
            control.set(k);
            near(dyn.carriage.position[dyn.carriageAxis],
              dyn.carriageRange[0] + (dyn.carriageRange[1] - dyn.carriageRange[0]) * k,
              'real declared feed endpoint');
            if (dyn.carriageRange[0] !== dyn.carriageRange[1]) near(control.get(), k, 'real feed getter');
            built.root.updateMatrixWorld(true);
            built.root.traverse((node) => assert.ok(node.matrixWorld.elements.every(Number.isFinite),
              `${id}/${node.name} must retain a finite world matrix at feed ${k}`));
            assertInsideFeed(built.root, feedFraming, `${id}/actual-driver-${k}`);
            feedPose.dyn.carriage.position[feedPose.dyn.carriageAxis] =
              feedPose.dyn.carriageRange[0] + (feedPose.dyn.carriageRange[1] - feedPose.dyn.carriageRange[0]) * k;
            assertInsideFeed(feedPose.root, feedFraming, `${id}/feed-${k}`);
          }
        }
        assert.deepEqual(events.map((event) => event.name), ['rig:model-ready']);
        assert.deepEqual(runtime.problems(), []);
      }, 'strict', { id, binary });
    });
  }
}

const failed = results.filter((result) => !result.ok);
assert.ok(results.length > 0, 'a zero-fixture run must never pass');
console.log(`\n${results.length - failed.length}/${results.length} checks passed; ${failed.length} failed.`);
process.exitCode = failed.length ? 1 : 0;
