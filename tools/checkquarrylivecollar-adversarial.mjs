/** Independent adversarial tests; no dimensions are measured here.
 * All physical validation goes through the production regression's glbinfo
 * parse/measure path. Fixture coordinates only exercise collision classification.
 * Temporary fixtures are retained under the printed task-specific temp folder.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collarContract, inspectAsset, triangleIntersectsEnvelope } from './checkquarrylivecollar.mjs';

const temp = mkdtempSync(join(tmpdir(), 'drillity-quarry-collar-critic-'));
const contract = collarContract(readFileSync(new URL('../src/world/terrain.js', import.meta.url), 'utf8'));
const results = [];
function glb(json, binary) {
  const text = Buffer.from(JSON.stringify(json));
  const j = Buffer.alloc(Math.ceil(text.length / 4) * 4, 32); text.copy(j);
  const b = Buffer.alloc(Math.ceil(binary.length / 4) * 4); binary.copy(b);
  const out = Buffer.alloc(12 + 8 + j.length + 8 + b.length);
  out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(out.length, 8);
  out.writeUInt32LE(j.length, 12); out.writeUInt32LE(0x4e4f534a, 16); j.copy(out, 20);
  const offset = 20 + j.length;
  out.writeUInt32LE(b.length, offset); out.writeUInt32LE(0x004e4942, offset + 4); b.copy(out, offset + 8);
  return out;
}
function fixture(points = [[2, .1, 0], [3, .1, 0], [2, .1, 1]]) {
  const values = new Float32Array(points.flat()), binary = Buffer.from(values.buffer);
  const json = { asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }],
    nodes: [{ name: 'static:fixture', mesh: 0 }], materials: [{ name: 'gravel' }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    buffers: [{ byteLength: binary.length }], bufferViews: [{ buffer: 0, byteLength: binary.length }],
    accessors: [{ bufferView: 0, componentType: 5126, count: points.length, type: 'VEC3',
      min: [Math.min(...points.map(p => p[0])), Math.min(...points.map(p => p[1])), Math.min(...points.map(p => p[2]))],
      max: [Math.max(...points.map(p => p[0])), Math.max(...points.map(p => p[1])), Math.max(...points.map(p => p[2]))] }] };
  return { json, binary };
}
async function check(name, expected, mutate = () => {}, points) {
  const f = fixture(points); mutate(f);
  const path = join(temp, name + '.glb'); writeFileSync(path, glb(f.json, f.binary));
  let actual, detail;
  try { const r = await inspectAsset(path, contract); actual = r.passed ? 'clear' : 'blocked'; detail = { triangles: r.triangles, interiorVertices: r.interiorVertices, intersectingTriangles: r.intersectingTriangles }; }
  catch (e) { actual = 'rejected'; detail = e.message; }
  results.push({ name, expected, actual, passed: actual === expected, detail });
}

await check('clear-actual-triangle', 'clear');
await check('cap-interior-no-contained-vertices', 'blocked', () => {}, [[-2, .1, -2], [2, .1, -2], [0, .1, 2]]);
await check('vertical-slab-crossing', 'blocked', () => {}, [[-.1, -2, 0], [.1, -2, 0], [.1, 2, 0]]);
await check('empty-scene', 'rejected', f => { f.json.scenes[0].nodes = []; });
await check('empty-mesh', 'rejected', f => { f.json.meshes[0].primitives = []; });
await check('missing-position', 'rejected', f => { delete f.json.meshes[0].primitives[0].attributes.POSITION; });
await check('zero-vertex-accessor', 'rejected', f => { f.json.accessors[0].count = 0; });
await check('unattached-no-position', 'rejected', f => { f.json.meshes.push({ primitives: [{ attributes: {} }] }); });
await check('sparse-position', 'rejected', f => { f.json.accessors[0].sparse = { count: 1 }; });
await check('compressed-position', 'rejected', f => { f.json.extensionsUsed = ['KHR_draco_mesh_compression']; });
await check('nonfinite-position', 'rejected', f => { f.binary.writeFloatLE(NaN, 0); });
await check('truncated-position-storage', 'rejected', f => { f.json.bufferViews[0].byteLength = 12; });
await check('unmeasured-line-mode', 'rejected', f => { f.json.meshes[0].primitives[0].mode = 1; });
await check('partial-triangle-topology', 'rejected', f => { f.json.accessors[0].count = 2; });
await check('transparent-mesh', 'rejected', f => { f.json.materials[0].alphaMode = 'BLEND'; });
await check('unnamed-material', 'rejected', f => { delete f.json.materials[0].name; });
await check('transformed-to-collar', 'blocked', f => { f.json.nodes[0].translation = [-2, 0, 0]; });
await check('morph-target-unexamined', 'rejected', f => {
  f.json.meshes[0].weights = [1];
  f.json.meshes[0].primitives[0].targets = [{ POSITION: 1 }];
  const delta = Buffer.from(new Float32Array([-2, 0, 0, -2, 0, 0, -2, 0, 0]).buffer);
  f.json.bufferViews.push({ buffer: 0, byteOffset: f.binary.length, byteLength: delta.length });
  f.json.accessors.push({ bufferView: 1, componentType: 5126, count: 3, type: 'VEC3', min: [-2, 0, 0], max: [-2, 0, 0] });
  f.binary = Buffer.concat([f.binary, delta]); f.json.buffers[0].byteLength = f.binary.length;
});

// Analytic independent boundary samples: all six vertex permutations must agree.
let permutationAssertions = 0;
for (const [triangle, expected] of [
  [[[-2, .2, -2], [2, .2, -2], [0, .2, 2]], true],
  [[[.5, -.5, 0], [.5, 1, 0], [2, .2, 1]], false],
  [[[-1, -.5, 0], [1, -.5, 0], [0, 1, 0]], true],
]) {
  for (const perm of [[0,1,2], [0,2,1], [1,0,2], [1,2,0], [2,0,1], [2,1,0]]) {
    assert.equal(triangleIntersectsEnvelope(perm.map(i => triangle[i]), contract), expected);
    permutationAssertions++;
  }
}
console.log(JSON.stringify({ temp, fixtureCases: results.length, permutationAssertions, passed: results.every(r => r.passed), results }, null, 2));
process.exitCode = results.every(r => r.passed) ? 0 : 1;
