/**
 * CPU regression for quarry dressing inside the live collar work envelope.
 * Usage: node tools/checkquarrylivecollar.mjs [--asset path.glb] [--terrain path.js]
 *        [--json report.json] [--self-test]
 *
 * glbinfo is the sole dimension ruler. Its parser/measure validate every asset
 * before the runtime GLTFLoader exposes actual triangle vertices for collision
 * classification. No local AABB approximation, copied POSITION reader, browser,
 * GPU, geometry-name dependency or engineering clearance is involved.
 *
 * The protected envelope is the live throat's opening disk swept from collar
 * grade to the top of its casing stub. Both come from the actual buildCollar
 * source. This is an authored runtime ownership contract, NOT a safety distance
 * or a sourced real-world bore diameter. A source shape change fails loudly.
 * Surface intersection is tested after exact clipping to the vertical interval;
 * large cap triangles crossing the bore are caught even with every vertex outside.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { parseGLB, measure } from './glbinfo.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
// Numerical comparison tolerance only, not additional physical clearance.
const EPS = 1e-9;

export function collarContract(source) {
  const matches = [...source.matchAll(/function buildCollar\(\)\s*\{/g)];
  assert.equal(matches.length, 1, 'Expected exactly one live buildCollar definition');
  const start = matches[0].index;
  const end = source.indexOf('root.add(collarGroup);', start);
  assert.ok(end > start, 'Cannot locate live collar attachment');
  const body = source.slice(start, end);
  const num = '(-?(?:\\d+(?:\\.\\d*)?|\\.\\d+))';
  function one(re, name) {
    const found = [...body.matchAll(re)];
    assert.equal(found.length, 1, `Cannot uniquely read live ${name}`);
    return found[0].slice(1).map(Number);
  }
  const throat = one(new RegExp('const throat = new T\\.Mesh\\(\\s*new T\\.CylinderGeometry\\(\\s*' + num + ',\\s*' + num + ',\\s*' + num + ',', 'g'), 'throat');
  const casing = one(new RegExp('casingStub = new T\\.Mesh\\(\\s*new T\\.CylinderGeometry\\(\\s*' + num + ',\\s*' + num + ',\\s*' + num + ',', 'g'), 'casing');
  const [casingY] = one(new RegExp('casingStub\\.position\\.y\\s*=\\s*' + num + '\\s*;', 'g'), 'casing Y');
  assert.match(body, /collarGroup\.position\.copy\(collarPosition\)/);
  assert.match(source, /collarPosition\s*=\s*CFG\.collar\.clone\(\)/);
  assert.match(source, /collar:\s*new THREE\.Vector3\(0,\s*0,\s*0\)/,
    'Collar origin contract changed; review the site anchor before widening this gate');
  const contract = { radius: throat[0], yMin: 0, yMax: casingY + casing[2] / 2,
    provenance: 'src/world/terrain.js buildCollar(): throat radius, collarPosition grade, casingStub top',
    meaning: 'Live throat opening swept from collar grade to casing-stub top; authored ownership, not engineering clearance' };
  assert.ok([contract.radius, contract.yMax].every((v) => Number.isFinite(v) && v > 0));
  return contract;
}

function clipY(poly, boundary, keepAbove) {
  const result = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const ai = keepAbove ? a[1] >= boundary : a[1] <= boundary;
    const bi = keepAbove ? b[1] >= boundary : b[1] <= boundary;
    if (ai) result.push(a);
    if (ai !== bi) {
      const t = (boundary - a[1]) / (b[1] - a[1]);
      result.push([a[0] + t * (b[0] - a[0]), boundary, a[2] + t * (b[2] - a[2])]);
    }
  }
  return result;
}

function segmentDistance2(a, b) {
  const dx = b[0] - a[0], dz = b[2] - a[2];
  const length2 = dx * dx + dz * dz;
  const t = length2 ? Math.max(0, Math.min(1, -(a[0] * dx + a[2] * dz) / length2)) : 0;
  return (a[0] + t * dx) ** 2 + (a[2] + t * dz) ** 2;
}

export function triangleIntersectsEnvelope(triangle, c) {
  let poly = clipY(triangle, c.yMin, true);
  if (!poly.length) return false;
  poly = clipY(poly, c.yMax, false);
  if (!poly.length) return false;
  let inside = false;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if (segmentDistance2(a, b) <= c.radius ** 2 + EPS) return true;
    if ((a[2] > 0) !== (b[2] > 0)
      && 0 < a[0] + (b[0] - a[0]) * (-a[2]) / (b[2] - a[2])) inside = !inside;
  }
  return inside;
}

export async function inspectAsset(path, contract) {
  const bytes = readFileSync(path), { json: g, bin } = parseGLB(bytes);
  assert.ok(!(g.skins?.length || g.animations?.length), 'Static quarry gate cannot classify skins or animations');
  for (const node of g.nodes || []) {
    assert.ok(node.skin === undefined && node.weights === undefined, 'Static quarry gate cannot classify skin/morph weights');
    assert.ok(!node.extensions?.EXT_mesh_gpu_instancing, 'Static quarry gate cannot classify GPU instances');
  }
  for (const mesh of g.meshes || []) {
    assert.ok(mesh.weights === undefined, 'Static quarry gate cannot classify mesh morph weights');
    for (const prim of mesh.primitives || []) {
      assert.ok(!prim.targets?.length, 'Static quarry gate cannot classify morph targets');
    }
  }
  const measured = measure(g, bin);
  assert.ok(!measured.empty && measured.unreadable.length === 0,
    `glbinfo could not measure complete asset: ${measured.unreadable.join('; ')}`);
  for (const mesh of g.meshes || []) for (const prim of mesh.primitives || []) {
    assert.equal(prim.mode ?? 4, 4, 'Triangle-only quarry export expected; cannot skip other primitive modes');
  }
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  gltf.scene.updateMatrixWorld(true);
  const byMaterial = {}, witnesses = [];
  let vertices = 0, triangles = 0, intersectingTriangles = 0, interiorVertices = 0, meshes = 0;
  const v = new Vector3();
  gltf.scene.traverse((object) => {
    if (!object.isMesh) return;
    meshes++;
    assert.ok(object.visible, 'Hidden mesh in export requires explicit review');
    const geom = object.geometry, pos = geom.attributes.position, indices = geom.index;
    assert.ok(pos?.count > 0, 'Actual runtime mesh has no position vertices');
    const material = object.material;
    assert.ok(!Array.isArray(material) && material?.name, 'Expected one named material per runtime quarry mesh');
    assert.ok(!material.transparent && material.opacity === 1, 'Unexpected transparent quarry material needs separate contract review');
    const points = [];
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(object.matrixWorld);
      assert.ok([v.x, v.y, v.z].every(Number.isFinite));
      points.push([v.x, v.y, v.z]);
      vertices++;
      if (v.y >= contract.yMin && v.y <= contract.yMax
        && v.x ** 2 + v.z ** 2 <= contract.radius ** 2 + EPS) interiorVertices++;
    }
    const count = indices?.count ?? pos.count;
    assert.equal(count % 3, 0, 'Incomplete triangle topology');
    const counts = byMaterial[material.name] ||= { triangles: 0, intersectingTriangles: 0 };
    for (let i = 0; i < count; i += 3) {
      const tri = [0, 1, 2].map((k) => points[indices ? indices.getX(i + k) : i + k]);
      triangles++; counts.triangles++;
      if (triangleIntersectsEnvelope(tri, contract)) {
        intersectingTriangles++; counts.intersectingTriangles++;
        if (witnesses.length < 12) witnesses.push({ mesh: object.name, material: material.name, triangleIndex: i / 3, vertices: tri });
      }
    }
  });
  assert.ok(meshes > 0 && vertices > 0 && triangles > 0, 'Measured nothing; this is a failure');
  return { asset: resolve(path), assetSha256: sha256(bytes), byteLength: bytes.length,
    contract, meshes, vertices, triangles, interiorVertices, intersectingTriangles, byMaterial, witnesses,
    passed: intersectingTriangles === 0,
    evidence: 'CPU classification of actual exported triangle vertices; no rendered/GPU acceptance' };
}

export function selfTest() {
  const c = { radius: 0.36, yMin: 0, yMax: 0.715 };
  // Fixture values exercise the algorithm, never author production dimensions.
  const cases = [
    ['crossing cap with no vertex inside', [[-1, .1, -1], [1, .1, -1], [0, .1, 1]], true],
    ['remote triangle whose AABB includes origin', [[-.6, .1, 1], [1, .1, -.6], [1, .1, 1]], true],
    ['AABB false-positive control', [[-.1, .1, 1], [1, .1, -.1], [1, .1, 1]], false],
    ['above slab', [[-1, 1, -1], [1, 1, -1], [0, 1, 1]], false],
    ['below slab', [[-1, -.1, -1], [1, -.1, -1], [0, -.1, 1]], false],
    ['vertical edge crosses bore', [[-.1, -1, 0], [.1, -1, 0], [.1, 1, 0]], true],
    ['Y clipping removes distant crossing', [[0, -10, 0], [10, .1, 0], [10, .2, 1]], false],
    ['vertex inside', [[0, .5, 0], [1, .5, 0], [0, .5, 1]], true],
    ['grade contact', [[-.1, 0, -.1], [.1, 0, -.1], [0, 0, .1]], true],
    ['top contact', [[-.1, .715, -.1], [.1, .715, -.1], [0, .715, .1]], true],
    ['radial tangent', [[.36, .2, 0], [1, .2, 0], [.36, .3, 0]], true],
    ['outside tangent', [[.361, .2, 0], [1, .2, 0], [.361, .3, 0]], false],
  ];
  for (const [label, triangle, expected] of cases) {
    assert.equal(triangleIntersectsEnvelope(triangle, c), expected, label);
    assert.equal(triangleIntersectsEnvelope([...triangle].reverse(), c), expected, `${label}: winding`);
  }
  return { cases: cases.length, assertions: cases.length * 2 };
}

async function main() {
  const args = process.argv.slice(2), options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--self-test') { options.selfTest = true; continue; }
    assert.ok(['--asset', '--terrain', '--json'].includes(args[i]), `Unknown argument ${args[i]}`);
    assert.ok(args[i + 1] && !args[i + 1].startsWith('--'), `Missing value for ${args[i]}`);
    options[args[i].slice(2)] = args[++i];
  }
  const checks = selfTest();
  if (options.selfTest && !options.asset) {
    console.log(`PASS quarry live-collar collision self-test: ${checks.cases} cases / ${checks.assertions} assertions`);
    return;
  }
  const terrainPath = options.terrain ?? resolve(repo, 'src/world/terrain.js');
  const source = readFileSync(terrainPath, 'utf8');
  const report = await inspectAsset(options.asset ?? resolve(repo, 'public/models/sites/quarry-bench.glb'), collarContract(source));
  report.terrain = resolve(terrainPath); report.terrainSha256 = sha256(readFileSync(terrainPath));
  report.gateSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
  report.rulerSha256 = sha256(readFileSync(resolve(repo, 'tools/glbinfo.mjs')));
  report.selfTest = checks;
  if (options.json) writeFileSync(options.json, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  console.log(`${report.passed ? 'PASS' : 'FAIL'} quarry live collar: ${report.intersectingTriangles}/${report.triangles} actual triangles intersect the live work envelope`);
  if (!report.passed) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`FAIL quarry live collar: ${error.stack || error}`); process.exitCode = 1; });
}
