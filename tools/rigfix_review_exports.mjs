/** Expected-mutation gate for the separate rig-corrections batch.
 * node tools/rigfix_review_exports.mjs crawler|sonic|tunnel before.glb after.glb
 * node tools/rigfix_review_exports.mjs --self-test
 * Bounds use only frozen glbinfo.measure through rigopt_contracts.snapshot.
 * Accessor reads below compare identity, never compute a second dimension ruler.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { parseGLB } from './glbinfo.mjs';
import { snapshot, compareSnapshots } from './rigopt_contracts.mjs';

// Observed maximum in independent unchanged-source crawler and tunnel control
// rebuilds: 5.960464477539063e-8, confined to TEXCOORD_0 FLOAT components.
// No POSITION, NORMAL, index, topology, node or material tolerance is added.
const UV_TOLERANCE = 2 ** -24;
// The frozen sonic optimized export vs a fresh UNCHANGED-source control has
// twice that roundoff on static:paintedDark only. The corrected export repeats
// the same maximum; every other mesh/kind retains the tighter control bound.
const SONIC_DARK_UV_TOLERANCE = 2 ** -23;
const LENS_MATRIX_TOLERANCE = 1e-6; // Float32 export/parent-composition precision.
const LENS = 'feed-cradle:glass';
const LAMP_NAMES = [
  'mount:collar-work-light', 'mount:deck-work-light-l', 'mount:deck-work-light-r',
  'mount:crown-work-light', 'mount:feed-work-light',
];
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const canonical = (v) => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map((key) => [key, canonical(v[key])])) : v;
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
function delta(a, b) {
  if (a.length !== b.length) return Infinity;
  let result = 0;
  for (let i = 0; i < a.length; i++) result = Math.max(result, Math.abs(a[i] - b[i]));
  return result;
}
function local(n) {
  return n.matrix ? new Matrix4().fromArray(n.matrix) : new Matrix4().compose(
    new Vector3().fromArray(n.translation || [0, 0, 0]),
    new Quaternion().fromArray(n.rotation || [0, 0, 0, 1]),
    new Vector3().fromArray(n.scale || [1, 1, 1]));
}
function describe(parsed) {
  const { json: g, bin } = parsed, measured = snapshot(parsed);
  const names = new Map(g.nodes.map((n, i) => [n.name, i]));
  const parents = new Map();
  g.nodes.forEach((n, i) => (n.children || []).forEach((c) => parents.set(c, i)));
  const world = (i) => parents.has(i) ? world(parents.get(i)).multiply(local(g.nodes[i])) : local(g.nodes[i]);
  const accessorCache = new Map();
  function accessor(i) {
    if (accessorCache.has(i)) return accessorCache.get(i);
    const a = g.accessors[i], lanes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a?.type];
    const size = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }[a?.componentType];
    requireThat(a && lanes && size && !a.sparse, 'unsupported accessor identity comparison');
    const { bufferView, byteOffset, ...schema } = a;
    const bytes = Buffer.alloc(a.count * lanes * size);
    if (bufferView !== undefined) {
      const bv = g.bufferViews[bufferView], stride = bv.byteStride || lanes * size;
      const start = (bv.byteOffset || 0) + (byteOffset || 0);
      // snapshot already validates local BIN storage. Copy only accessor
      // components, excluding stride padding and unrelated buffer layout.
      for (let j = 0; j < a.count; j++) bin.copy(bytes, j * lanes * size,
        start + j * stride, start + j * stride + lanes * size);
    }
    const result = { schema, bytes, sha256: sha(bytes) };
    accessorCache.set(i, result);
    return result;
  }
  return { g, bin, names, parents, world, measured, accessor };
}

export function compareParsed(kind, beforeParsed, afterParsed) {
  requireThat(['crawler', 'sonic', 'tunnel'].includes(kind), 'unknown correction kind');
  const a = describe(beforeParsed), b = describe(afterParsed);
  const failures = [], check = (condition, message) => { if (!condition) failures.push(message); };
  check(equal([...a.names.keys()].sort(), [...b.names.keys()].sort()), 'node name set changed');
  check(equal(a.measured.materials, b.measured.materials), 'material definitions changed');
  check(equal(a.measured.assignment, b.measured.assignment), 'material assignment by assembly changed');
  check(equal(a.g.asset, b.g.asset), 'asset metadata changed');
  const scenes = (g) => (g.scenes || []).map((scene) => ({ ...scene,
    nodes: (scene.nodes || []).map((index) => g.nodes[index].name) }));
  check(a.g.scene === b.g.scene && equal(scenes(a.g), scenes(b.g)), 'scene membership/metadata changed');
  check(equal(a.g.extensionsUsed || [], b.g.extensionsUsed || []), 'glTF extensions changed');
  check(equal(a.g.extensionsRequired || [], b.g.extensionsRequired || []), 'required glTF extensions changed');
  check(equal(a.g.extras, b.g.extras), 'document extras changed');
  check(equal(a.measured.bounds, b.measured.bounds), 'overall actual-vertex bounds changed');
  const uvDrift = [], meshes = [];
  let lampRenames = 0, lensMatrixError = null, lensWorldError = null;
  function compareAccessor(firstIndex, secondIndex, node, semantic, primitive) {
    if (firstIndex === undefined || secondIndex === undefined) {
      check(firstIndex === secondIndex, `${node}/${semantic}: accessor presence changed`); return null;
    }
    const first = a.accessor(firstIndex), second = b.accessor(secondIndex);
    check(equal(first.schema, second.schema), `${node}/${semantic}: accessor schema changed`);
    if (first.bytes.equals(second.bytes)) return { semantic, sha256: first.sha256 };
    if (semantic === 'TEXCOORD_0' && equal(first.schema, second.schema)
      && first.schema.componentType === 5126 && first.schema.type === 'VEC2') {
      let maxDelta = 0, changedComponents = 0;
      for (let i = 0; i < first.bytes.length; i += 4) {
        const d = Math.abs(first.bytes.readFloatLE(i) - second.bytes.readFloatLE(i));
        if (d) changedComponents++;
        maxDelta = Math.max(maxDelta, d);
      }
      const tolerance = kind === 'sonic' && node === 'static:paintedDark' ? SONIC_DARK_UV_TOLERANCE : UV_TOLERANCE;
      check(maxDelta <= tolerance, `${node}/${semantic}: UV drift ${maxDelta} exceeds measured control ${tolerance}`);
      uvDrift.push({ node, primitive, semantic, changedComponents, maxDelta, tolerance,
        beforeSHA256: first.sha256, afterSHA256: second.sha256 });
      return { semantic, beforeSHA256: first.sha256, afterSHA256: second.sha256 };
    }
    check(false, `${node}/${semantic}: ordered accessor components changed`);
    return { semantic, beforeSHA256: first.sha256, afterSHA256: second.sha256 };
  }
  for (const [name, firstIndex] of a.names) {
    if (!b.names.has(name)) continue;
    const secondIndex = b.names.get(name), first = a.g.nodes[firstIndex], second = b.g.nodes[secondIndex];
    const descriptor = (g, n) => {
      const { mesh, children, translation, rotation, scale, matrix, ...other } = n;
      return { ...other, meshPresent: mesh !== undefined, children: (children || []).map((i) => g.nodes[i].name) };
    };
    const expectedDescriptor = descriptor(a.g, first);
    if (kind === 'sonic' && LAMP_NAMES.includes(name)) {
      check(typeof first.extras?.watt_w === 'number' && first.extras?.watt_hint === undefined,
        `${name}: baseline is not the expected legacy lamp metadata`);
      expectedDescriptor.extras = { ...first.extras, watt_hint: first.extras?.watt_w };
      delete expectedDescriptor.extras.watt_w;
      lampRenames++;
    }
    check(equal(expectedDescriptor, descriptor(b.g, second)), `${name}: unexpected node properties/extras/children change`);
    const parentName = (d, i) => d.parents.has(i) ? d.g.nodes[d.parents.get(i)].name : null;
    check(parentName(a, firstIndex) === parentName(b, secondIndex), `${name}: parent changed`);
    if (kind === 'crawler' && name === LENS) {
      const mount = a.names.get('mount:feed-l');
      requireThat(mount !== undefined && parentName(a, firstIndex) === 'pivot:feed-tilt'
        && parentName(a, mount) === 'pivot:feed-tilt', 'unexpected crawler lens authoring ancestry');
      // Baseline weld lost the mount parent's transform while retaining the
      // active feed-left lens local matrix. Restore exactly that omitted link.
      const expectedLocal = local(a.g.nodes[mount]).multiply(local(first));
      const expectedWorld = a.world(a.parents.get(firstIndex)).multiply(expectedLocal);
      lensMatrixError = delta(expectedLocal.elements, local(second).elements);
      lensWorldError = delta(expectedWorld.elements, b.world(secondIndex).elements);
      check(lensMatrixError <= LENS_MATRIX_TOLERANCE && lensWorldError <= LENS_MATRIX_TOLERANCE,
        `${name}: corrected transform does not match authored mount transform (${lensMatrixError}, ${lensWorldError})`);
    } else {
      check(equal(local(first).elements, local(second).elements), `${name}: local transform changed`);
      check(equal(a.world(firstIndex).elements, b.world(secondIndex).elements), `${name}: world transform changed`);
    }
    if (first.mesh === undefined || second.mesh === undefined) continue;
    const firstMesh = a.g.meshes[first.mesh], secondMesh = b.g.meshes[second.mesh];
    const { primitives: firstPrims, ...firstMeta } = firstMesh;
    const { primitives: secondPrims, ...secondMeta } = secondMesh;
    check(equal(firstMeta, secondMeta), `${name}: mesh metadata changed`);
    check(firstPrims.length === secondPrims.length, `${name}: primitive count changed`);
    const attributes = [];
    for (let i = 0; i < firstPrims.length && i < secondPrims.length; i++) {
      const p = firstPrims[i], q = secondPrims[i];
      const descriptor = (g, p) => {
        const { attributes, indices, material, ...other } = p;
        return { ...other, material: g.materials[material]?.name, semantics: Object.keys(attributes).sort() };
      };
      check(equal(descriptor(a.g, p), descriptor(b.g, q)), `${name}: primitive metadata/material/semantics changed`);
      attributes.push(compareAccessor(p.indices, q.indices, name, 'indices', i));
      for (const semantic of Object.keys(p.attributes)) {
        attributes.push(compareAccessor(p.attributes[semantic], q.attributes[semantic], name, semantic, i));
      }
    }
    meshes.push({ node: name, attributes });
  }
  check(kind !== 'sonic' || lampRenames === 5, 'expected exactly five sonic lamp renames');
  check(kind !== 'crawler' || lensMatrixError !== null, 'expected crawler lens mesh absent');
  // Allow only the intended sonic extras rename in the existing contract gate.
  const expected = structuredClone(a.measured);
  if (kind === 'sonic') for (const name of LAMP_NAMES) {
    if (!expected.extras[name] || !expected.contracts[name]) continue;
    expected.extras[name].watt_hint = expected.extras[name].watt_w;
    delete expected.extras[name].watt_w;
    expected.contracts[name].extras = expected.extras[name];
  }
  const contractResult = compareSnapshots(expected, b.measured, { boundsTolerance: 0 });
  for (const failure of contractResult.failures) check(false, `contract: ${failure}`);
  return { ok: !failures.length, kind, failures, before: a.measured.totals, after: b.measured.totals,
    overallBoundsDelta: contractResult.overallBoundsDelta, maxContractBoundsDelta: contractResult.maxBoundsDelta,
    maxContractTransformDelta: contractResult.maxTransformDelta, lampRenames,
    lensMatrixError, lensWorldError, lensMatrixTolerance: kind === 'crawler' ? LENS_MATRIX_TOLERANCE : null,
    uvTolerance: UV_TOLERANCE, uvDrift, meshes,
    note: 'Exact ordered geometry/normal/index identity; only measured TEXCOORD_0 control roundoff allowed. CPU only.' };
}

export function compareFiles(kind, beforePath, afterPath) {
  const before = readFileSync(beforePath), after = readFileSync(afterPath);
  const result = compareParsed(kind, parseGLB(before), parseGLB(after));
  result.before.bytes = before.length;
  result.after.bytes = after.length;
  return { beforePath, afterPath, beforeSHA256: sha(before), afterSHA256: sha(after),
    ...result };
}

function fixture() {
  const bin = Buffer.alloc(104);
  const floats = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
  floats.forEach((v, i) => bin.writeFloatLE(v, i * 4));
  [0, 1, 2].forEach((v, i) => bin.writeUInt16LE(v, 96 + i * 2));
  return { bin, json: { asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }],
    nodes: [{ name: 'pivot:feed-tilt', children: [1, 2, 3] },
      { name: 'mount:feed-l', translation: [0.1, 0.2, 0.3] },
      { name: LENS, mesh: 0 }, { name: 'static:body', mesh: 1 }],
    materials: [{ name: 'rawSteel' }], meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] },
      { primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
    buffers: [{ byteLength: 104 }], bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36 }, { buffer: 0, byteOffset: 36, byteLength: 36 },
      { buffer: 0, byteOffset: 72, byteLength: 24 }, { buffer: 0, byteOffset: 96, byteLength: 6 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' },
      { bufferView: 1, componentType: 5126, count: 3, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: 3, type: 'VEC2' },
      { bufferView: 3, componentType: 5123, count: 3, type: 'SCALAR' }] } };
}
export function selfTest() {
  const original = fixture(); let checks = 0;
  const copy = () => ({ json: structuredClone(original.json), bin: Buffer.from(original.bin) });
  assert.equal(compareParsed('tunnel', original, copy()).ok, true); checks++;
  for (const [label, mutate, pattern] of [
    ['position', (f) => f.bin.writeFloatLE(0.1, 0), /POSITION/],
    ['normal', (f) => f.bin.writeFloatLE(0.9, 44), /NORMAL/],
    ['winding', (f) => { f.bin.writeUInt16LE(2, 98); f.bin.writeUInt16LE(1, 100); }, /indices/],
    ['uv', (f) => f.bin.writeFloatLE(0.01, 72), /UV drift/],
    ['node', (f) => { f.json.nodes[3].translation = [0.01, 0, 0]; }, /transform changed/],
    ['extras', (f) => { f.json.nodes[1].extras = { unintended: true }; }, /unexpected node/],
    ['scene extras', (f) => { f.json.scenes[0].extras = { unintended: true }; }, /scene membership\/metadata/],
  ]) {
    const f = copy(); mutate(f);
    assert.match(compareParsed('tunnel', original, f).failures.join('; '), pattern, label); checks++;
  }
  const smallUV = copy(); smallUV.bin.writeFloatLE(UV_TOLERANCE, 72);
  assert.equal(compareParsed('tunnel', original, smallUV).ok, true); checks++;
  const wrongLens = copy(); wrongLens.json.nodes[2].translation = [0.1, 0.2, 0.31];
  assert.match(compareParsed('crawler', original, wrongLens).failures.join('; '), /corrected transform/); checks++;
  const lensBaseline = copy();
  lensBaseline.bin.writeFloatLE(1, 32);
  lensBaseline.json.nodes[3].scale = [3, 3, 3];
  lensBaseline.json.nodes[3].translation = [-1, -1, -1];
  const correctedLens = { json: structuredClone(lensBaseline.json), bin: Buffer.from(lensBaseline.bin) };
  correctedLens.json.nodes[2].translation = [0.1, 0.2, 0.3];
  assert.equal(compareParsed('crawler', lensBaseline, correctedLens).ok, true, 'exact intended lens transform'); checks++;
  const legacy = copy();
  legacy.json.nodes[0].children.push(...LAMP_NAMES.map((name, i) => 4 + i));
  for (const name of LAMP_NAMES) legacy.json.nodes.push({ name, extras: { watt_w: 50, range_m: 10 } });
  const renamed = { json: structuredClone(legacy.json), bin: Buffer.from(legacy.bin) };
  for (const n of renamed.json.nodes.slice(4)) { n.extras.watt_hint = n.extras.watt_w; delete n.extras.watt_w; }
  assert.equal(compareParsed('sonic', legacy, renamed).ok, true); checks++;
  renamed.json.nodes[4].extras.watt_hint = 70;
  assert.match(compareParsed('sonic', legacy, renamed).failures.join('; '), /unexpected node/); checks++;
  return { ok: true, checks };
}
function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--self-test') { console.log(JSON.stringify(selfTest())); return; }
  requireThat(args.length === 3, 'usage: rigfix_review_exports.mjs crawler|sonic|tunnel before.glb after.glb');
  const result = compareFiles(...args);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`rigfix export review FAILED: ${error.message}`); process.exitCode = 1; }
}
