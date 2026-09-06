/** Before/after CPU rig contract gate. Geometry bounds use ONLY glbinfo.measure.
 * Usage: node tools/rigopt_contracts.mjs before.glb after.glb [--bounds-tolerance=0.001]
 *        node tools/rigopt_contracts.mjs --self-test
 * Bounds tolerance is metres; it is comparison precision, not a sourced dimension.
 * Exported primitive totals are not rendered draw calls or GPU performance.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { parseGLB, measure } from './glbinfo.mjs';

const CONTRACT = /^(pivot|slide|mount|aim):/;
const MOVING = /^(pivot|slide):/;
const TRANSFORM_TOLERANCE = 1e-6;
const ANIMATION_TOLERANCE = 1e-6;
const canonical = (v) => Array.isArray(v) ? v.map(canonical)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])])) : v;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const sorted = (v) => [...v].sort();
const delta = (a, b) => {
  if (a.length !== b.length) return Infinity;
  let result = 0;
  for (let i = 0; i < a.length; i++) result = Math.max(result, Math.abs(a[i] - b[i]));
  return result;
};
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const realBounds = (b) => b && [...b.min, ...b.max].every(Number.isFinite) && b.min.every((v, i) => v <= b.max[i]);

// This computes attachment transforms only. No mesh vertex is read here;
// all overall/subtree geometry bounds come from the single existing ruler.
function localMatrix(n) {
  const result = n.matrix ? new Matrix4().fromArray(n.matrix)
    : new Matrix4().compose(new Vector3().fromArray(n.translation || [0, 0, 0]),
      new Quaternion().fromArray(n.rotation || [0, 0, 0, 1]),
      new Vector3().fromArray(n.scale || [1, 1, 1]));
  requireThat(result.elements.every(Number.isFinite), `nonfinite transform on ${n.name}`);
  return result;
}

// Animation samples are decoded independently of accessor indices. Geometry
// POSITION decoding is deliberately left to glbinfo.measure.
function numericAccessor(g, bin, index, purpose = 'animation') {
  const a = g.accessors?.[index];
  const spec = { 5120: ['getInt8', 1], 5121: ['getUint8', 1], 5122: ['getInt16', 2],
    5123: ['getUint16', 2], 5125: ['getUint32', 4], 5126: ['getFloat32', 4] }[a?.componentType];
  const lanes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a?.type];
  requireThat(a && Number.isInteger(a.count) && a.count > 0 && spec && lanes,
    `missing/empty/unsupported ${purpose} accessor ${index}`);
  requireThat(!a.sparse, `sparse ${purpose} accessor unsupported; refusing partial comparison`);
  const values = new Array(a.count * lanes).fill(0);
  if (a.bufferView !== undefined) {
    const bv = g.bufferViews?.[a.bufferView], buffer = g.buffers?.[bv?.buffer];
    requireThat(bv && bv.buffer === 0 && buffer && !buffer.uri && bin, `${purpose} accessor needs local BIN storage`);
    const size = spec[1], stride = bv.byteStride ?? size * lanes;
    const start = bv.byteOffset || 0, offset = a.byteOffset || 0;
    requireThat([start, offset, stride, bv.byteLength, buffer.byteLength].every((n) => Number.isInteger(n) && n >= 0)
      && stride >= size * lanes && stride % size === 0 && (start + offset) % size === 0
      && offset + (a.count - 1) * stride + lanes * size <= bv.byteLength
      && start + bv.byteLength <= buffer.byteLength && buffer.byteLength <= bin.byteLength,
    `${purpose} accessor exceeds/misaligns BIN storage`);
    const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    for (let i = 0; i < a.count; i++) for (let j = 0; j < lanes; j++) {
      values[i * lanes + j] = dv[spec[0]](start + offset + i * stride + j * size, true);
    }
  }
  requireThat(values.every(Number.isFinite), `nonfinite ${purpose} sample`);
  return { type: a.type, componentType: a.componentType, normalized: !!a.normalized, count: a.count,
    extras: a.extras ?? null, values };
}

export function snapshot({ json: g, bin }, bytes = null) {
  const bounds = measure(g, bin);
  requireThat(!bounds.empty && !bounds.unreadable.length && realBounds(bounds.all),
    `unmeasurable geometry: ${bounds.unreadable.join('; ') || 'empty/nonfinite model'}`);
  const nodes = g.nodes || [], byName = new Map(), parents = new Map(), worlds = new Map();
  nodes.forEach((n, i) => {
    requireThat(typeof n.name === 'string' && n.name && !byName.has(n.name), 'unnamed/duplicate node; cannot compare by name');
    byName.set(n.name, i);
    for (const child of n.children || []) {
      requireThat(nodes[child] && !parents.has(child), 'missing/multiply parented child');
      parents.set(child, i);
    }
  });
  function visit(i, matrix) {
    requireThat(nodes[i] && !worlds.has(i), 'cyclic/duplicate scene traversal');
    const world = matrix.clone().multiply(localMatrix(nodes[i]));
    worlds.set(i, world);
    for (const child of nodes[i].children || []) visit(child, world);
  }
  for (const root of g.scenes?.[g.scene ?? 0]?.nodes || []) visit(root, new Matrix4());
  function ancestry(i) {
    const result = [];
    for (let parent = parents.get(i); parent !== undefined; parent = parents.get(parent)) {
      requireThat(!result.includes(nodes[parent].name), 'cyclic parent ancestry');
      result.push(nodes[parent].name);
    }
    return result;
  }
  const animatedTargets = new Set((g.animations || []).flatMap((a) => (a.channels || []).map((c) => c.target?.node)));
  const contracts = {}, extras = {};
  nodes.forEach((n, i) => {
    if (n.extras !== undefined) extras[n.name] = n.extras;
    // An animation can legally target an unprefixed node. Its rest pose and
    // ancestry are just as important: identical samples under a different
    // parent can play at a different world position despite equal rest bounds.
    if (!CONTRACT.test(n.name) && !animatedTargets.has(i)) return;
    requireThat(worlds.has(i), `unreachable contract node ${n.name}`);
    contracts[n.name] = { ancestry: ancestry(i), local: localMatrix(n).elements,
      world: worlds.get(i).elements, extras: n.extras ?? null,
      bounds: realBounds(bounds.sub[i]) ? bounds.sub[i] : null };
  });
  requireThat(Object.keys(contracts).some((name) => CONTRACT.test(name)), 'empty contract node set');
  const materials = {};
  for (const m of g.materials || []) {
    requireThat(m.name && !materials[m.name], 'unnamed/duplicate material');
    requireThat(!(m.extensions?.KHR_materials_transmission?.transmissionFactor > 0), `nonzero transmission on ${m.name}`);
    materials[m.name] = m;
  }
  requireThat(Object.keys(materials).length > 0, 'empty material set');
  requireThat(!(g.images?.length || g.textures?.length), 'baked textures violate rig material-name contract');
  const assignment = {}, totals = { primitives: 0, triangles: 0, bytes, nodes: nodes.length };
  for (const [i] of worlds) {
    const n = nodes[i];
    if (n.mesh === undefined) continue;
    const group = MOVING.test(n.name) ? n.name : ancestry(i).find((name) => MOVING.test(name)) || '(static)';
    const names = assignment[group] ||= new Set();
    for (const p of g.meshes[n.mesh].primitives) {
      const material = g.materials?.[p.material];
      requireThat(material?.name, `missing material on ${n.name}`);
      names.add(material.name);
      totals.primitives++;
      requireThat((p.mode ?? 4) === 4, 'non-triangle rig primitive unsupported');
      const positionCount = g.accessors[p.attributes.POSITION].count;
      if (p.indices !== undefined) {
        const indices = numericAccessor(g, bin, p.indices, 'index');
        requireThat(indices.type === 'SCALAR' && [5121, 5123, 5125].includes(indices.componentType)
          && !indices.normalized, 'invalid index accessor schema');
        requireThat(indices.values.every((v) => Number.isInteger(v) && v >= 0 && v < positionCount),
          'index exceeds POSITION vertex count');
      }
      for (const [semantic, accessor] of Object.entries(p.attributes)) {
        if (semantic === 'POSITION') continue; // Sole POSITION reader remains glbinfo.measure.
        const attribute = numericAccessor(g, bin, accessor, semantic);
        requireThat(attribute.count === positionCount, `${semantic} count differs from POSITION`);
      }
      const count = g.accessors[p.indices ?? p.attributes.POSITION]?.count;
      requireThat(Number.isInteger(count) && count > 0 && count % 3 === 0, 'invalid triangle accessor count');
      totals.triangles += count / 3;
    }
  }
  requireThat(totals.primitives > 0 && totals.triangles > 0, 'empty rendered geometry set');
  const animations = {};
  for (const a of g.animations || []) {
    requireThat(a.name && !animations[a.name] && a.channels?.length, 'unnamed/duplicate/empty animation');
    const channels = {};
    for (const c of a.channels) {
      const target = nodes[c.target?.node], sampler = a.samplers?.[c.sampler];
      requireThat(target && worlds.has(c.target.node) && sampler && c.target.path, 'invalid animation target/sampler');
      const key = `${target.name}/${c.target.path}`;
      requireThat(!channels[key], `duplicate animation channel ${key}`);
      channels[key] = { interpolation: sampler.interpolation || 'LINEAR',
        channelExtras: c.extras ?? null, targetExtras: c.target.extras ?? null, samplerExtras: sampler.extras ?? null,
        input: numericAccessor(g, bin, sampler.input), output: numericAccessor(g, bin, sampler.output) };
    }
    animations[a.name] = { extras: a.extras ?? null, channels };
  }
  return { bounds: bounds.all, contracts, extras, materials, animations, totals,
    assignment: Object.fromEntries(Object.entries(assignment).map(([key, value]) => [key, sorted(value)])) };
}

export function compareSnapshots(before, after, { boundsTolerance = 0.001 } = {}) {
  requireThat(Number.isFinite(boundsTolerance) && boundsTolerance >= 0, 'invalid bounds tolerance');
  const failures = [], note = (condition, text) => { if (!condition) failures.push(text); };
  let maxBoundsDelta = 0, maxTransformDelta = 0, maxAnimationDelta = 0;
  function compareBounds(a, b, label) {
    if (!a || !b) { note(a === b, `${label}: geometry presence changed`); return; }
    const d = delta([...a.min, ...a.max], [...b.min, ...b.max]);
    maxBoundsDelta = Math.max(maxBoundsDelta, d);
    note(d <= boundsTolerance, `${label}: bound changed by ${d} m (tolerance ${boundsTolerance})`);
  }
  compareBounds(before.bounds, after.bounds, 'overall');
  note(same(sorted(Object.keys(before.contracts)), sorted(Object.keys(after.contracts))), 'contract node names changed');
  for (const [name, a] of Object.entries(before.contracts)) {
    const b = after.contracts[name];
    if (!b) continue;
    note(same(a.ancestry, b.ancestry), `${name}: ancestry changed`);
    note(same(a.extras, b.extras), `${name}: extras changed`);
    for (const field of ['local', 'world']) {
      const d = delta(a[field], b[field]);
      maxTransformDelta = Math.max(maxTransformDelta, d);
      note(d <= TRANSFORM_TOLERANCE, `${name}: ${field} transform changed by ${d}`);
    }
    compareBounds(a.bounds, b.bounds, name);
  }
  note(same(before.extras, after.extras), 'node extras changed (including non-contract metadata)');
  note(same(before.materials, after.materials), 'material names/definitions changed');
  note(same(before.assignment, after.assignment), 'material membership changed within moving/static assembly');
  note(same(sorted(Object.keys(before.animations)), sorted(Object.keys(after.animations))), 'animation names changed');
  for (const [name, a] of Object.entries(before.animations)) {
    const b = after.animations[name];
    if (!b) continue;
    note(same(a.extras, b.extras), `${name}: animation extras changed`);
    note(same(sorted(Object.keys(a.channels)), sorted(Object.keys(b.channels))), `${name}: channel targets/paths changed`);
    for (const [key, first] of Object.entries(a.channels)) {
      const second = b.channels[key];
      if (!second) continue;
      const { input: ai, output: ao, ...am } = first, { input: bi, output: bo, ...bm } = second;
      note(same(am, bm), `${name}/${key}: interpolation or channel metadata changed`);
      for (const [label, x, y] of [['input', ai, bi], ['output', ao, bo]]) {
        const { values: xv, ...xm } = x, { values: yv, ...ym } = y;
        note(same(xm, ym), `${name}/${key}: ${label} accessor schema changed`);
        const d = delta(xv, yv);
        maxAnimationDelta = Math.max(maxAnimationDelta, d);
        note(d <= ANIMATION_TOLERANCE, `${name}/${key}: ${label} samples changed by ${d}`);
      }
    }
  }
  return { ok: !failures.length, failures, before: before.totals, after: after.totals,
    contractNodes: Object.keys(before.contracts).filter((name) => CONTRACT.test(name)).length,
    protectedTransformNodes: Object.keys(before.contracts).length, animationClips: Object.keys(before.animations).length,
    animationChannels: Object.values(before.animations).reduce((n, a) => n + Object.keys(a.channels).length, 0),
    overallBoundsDelta: delta([...before.bounds.min, ...before.bounds.max], [...after.bounds.min, ...after.bounds.max]),
    maxBoundsDelta, maxTransformDelta, maxAnimationDelta, boundsTolerance,
    note: 'CPU exported geometry/contracts only; primitive counts are not rendered draw calls. No GPU performance verdict.' };
}

function fixture() {
  const bin = Buffer.alloc(76);
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1].forEach((v, i) => bin.writeFloatLE(v, i * 4));
  [0, 1, 2].forEach((v, i) => bin.writeUInt16LE(v, 68 + i * 2));
  const json = { asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }],
    nodes: [{ name: 'rig-root', children: [1] }, { name: 'pivot:mast', children: [2, 3] },
      { name: 'geometry', mesh: 0 }, { name: 'mount:tool', extras: { axis: 'y' } }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 3, material: 0 }] }],
    materials: [{ name: 'rawSteel' }], buffers: [{ byteLength: bin.length }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }, { buffer: 0, byteOffset: 36, byteLength: 8 },
      { buffer: 0, byteOffset: 44, byteLength: 24 }, { buffer: 0, byteOffset: 68, byteLength: 6 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' },
      { bufferView: 1, componentType: 5126, count: 2, type: 'SCALAR' },
      { bufferView: 2, componentType: 5126, count: 2, type: 'VEC3' },
      { bufferView: 3, componentType: 5123, count: 3, type: 'SCALAR' }],
    animations: [{ name: 'move', channels: [{ target: { node: 1, path: 'translation' }, sampler: 0 }],
      samplers: [{ input: 1, output: 2 }] }] };
  return { json, bin };
}

export function selfTest() {
  const original = fixture(), baseline = snapshot(original);
  let checks = 0;
  function reject(label, change, expected) {
    const f = { json: structuredClone(original.json), bin: Buffer.from(original.bin) };
    change(f);
    let message;
    try { message = compareSnapshots(baseline, snapshot(f)).failures.join('; '); }
    catch (error) { message = error.message; }
    assert.match(message, expected, label); checks++;
  }
  assert.equal(compareSnapshots(baseline, snapshot(original)).ok, true); checks++;
  reject('missing contract', (f) => { f.json.nodes[3].name = 'lost'; }, /contract node names/);
  reject('moved attachment', (f) => { f.json.nodes[3].translation = [0.01, 0, 0]; }, /transform changed/);
  reject('changed ancestry', (f) => { f.json.nodes[1].children = [2]; f.json.nodes[0].children.push(3); }, /ancestry changed/);
  reject('lost extras', (f) => { delete f.json.nodes[3].extras; }, /extras changed/);
  reject('changed material', (f) => { f.json.materials[0].doubleSided = true; }, /material names\/definitions/);
  reject('nonzero transmission', (f) => { f.json.materials[0].extensions = { KHR_materials_transmission: { transmissionFactor: 0.1 } }; }, /nonzero transmission/);
  reject('lost assembly material', (f) => { f.json.nodes[1].children = [3]; f.json.nodes[0].children.push(2); }, /material membership/);
  reject('changed animation values', (f) => { f.bin.writeFloatLE(0.5, 44); }, /samples changed/);
  reject('changed animation target', (f) => { f.json.animations[0].channels[0].target.node = 3; }, /channel targets/);
  reject('changed interpolation', (f) => { f.json.animations[0].samplers[0].interpolation = 'STEP'; }, /interpolation/);
  reject('missing animation', (f) => { delete f.json.animations; }, /animation names/);
  reject('unreadable geometry', (f) => { delete f.json.meshes[0].primitives[0].attributes.POSITION; }, /unmeasurable geometry/);
  reject('empty geometry', (f) => { delete f.json.nodes[2].mesh; }, /unmeasurable geometry/);
  reject('unreadable animation', (f) => { f.json.accessors[2].count = 100; }, /animation accessor exceeds/);
  reject('changed bounds', (f) => { f.bin.writeFloatLE(1.1, 12); }, /bound changed/);
  reject('duplicate names', (f) => { f.json.nodes[2].name = 'mount:tool'; }, /duplicate node/);
  reject('truncated index storage', (f) => { f.json.bufferViews[3].byteOffset = 100; }, /index accessor exceeds/);
  reject('out-of-range vertex index', (f) => { f.bin.writeUInt16LE(999, 68); }, /index exceeds POSITION/);
  reject('invalid index schema', (f) => { f.json.accessors[3].normalized = true; }, /invalid index accessor schema/);
  reject('missing normal storage', (f) => { f.json.meshes[0].primitives[0].attributes.NORMAL = 999; }, /unsupported NORMAL accessor/);
  const reordered = fixture();
  reordered.json.nodes = [original.json.nodes[3], original.json.nodes[2], { ...original.json.nodes[1], children: [1, 0] },
    { ...original.json.nodes[0], children: [2] }];
  reordered.json.scenes[0].nodes = [3]; reordered.json.animations[0].channels[0].target.node = 2;
  assert.equal(compareSnapshots(baseline, snapshot(reordered)).ok, true, 'reordered node indices remain equivalent'); checks++;
  const reorderedAccessors = fixture(), a = reorderedAccessors.json.accessors;
  reorderedAccessors.json.accessors = [a[3], a[2], a[0], a[1]];
  reorderedAccessors.json.meshes[0].primitives[0].attributes.POSITION = 2;
  reorderedAccessors.json.meshes[0].primitives[0].indices = 0;
  reorderedAccessors.json.animations[0].samplers[0] = { input: 3, output: 1 };
  assert.equal(compareSnapshots(baseline, snapshot(reorderedAccessors)).ok, true, 'accessor indices are not contracts'); checks++;
  const interleaved = fixture(), storage = Buffer.alloc(120);
  interleaved.bin.copy(storage);
  for (let i = 0; i < 2; i++) {
    storage.writeFloatLE(interleaved.bin.readFloatLE(36 + i * 4), 76 + i * 8);
    for (let j = 0; j < 3; j++) storage.writeFloatLE(interleaved.bin.readFloatLE(44 + i * 12 + j * 4), 92 + i * 16 + j * 4);
  }
  interleaved.bin = storage;
  interleaved.json.buffers[0].byteLength = storage.length;
  interleaved.json.bufferViews[1] = { buffer: 0, byteOffset: 76, byteLength: 12, byteStride: 8 };
  interleaved.json.bufferViews[2] = { buffer: 0, byteOffset: 92, byteLength: 28, byteStride: 16 };
  assert.equal(compareSnapshots(baseline, snapshot(interleaved)).ok, true, 'equivalent interleaved sample storage'); checks++;
  const animatedGeometry = fixture();
  animatedGeometry.json.animations[0].channels[0].target.node = 2;
  animatedGeometry.json.nodes.push({ name: 'spacer', translation: [1, 0, 0] });
  animatedGeometry.json.nodes[1].children.push(4);
  const animatedBefore = snapshot(animatedGeometry);
  animatedGeometry.json.nodes[1].children = [3, 4];
  animatedGeometry.json.nodes[4].children = [2];
  animatedGeometry.json.nodes[2].translation = [-1, 0, 0];
  assert.match(compareSnapshots(animatedBefore, snapshot(animatedGeometry)).failures.join('; '),
    /geometry: ancestry changed/, 'same rest world position cannot hide shifted animation parenting'); checks++;
  return { ok: true, checks };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--self-test') { console.log(JSON.stringify(selfTest())); return; }
  const files = args.filter((a) => !a.startsWith('--'));
  requireThat(files.length === 2 && args.every((a) => !a.startsWith('--') || /^--bounds-tolerance=/.test(a)),
    'usage: node tools/rigopt_contracts.mjs before.glb after.glb [--bounds-tolerance=0.001] | --self-test');
  const option = args.find((a) => a.startsWith('--bounds-tolerance='));
  const snapshots = files.map((path) => { const buf = readFileSync(path); return snapshot(parseGLB(buf), buf.byteLength); });
  const result = compareSnapshots(...snapshots, option ? { boundsTolerance: Number(option.split('=')[1]) } : {});
  console.log(JSON.stringify({ files, ...result }, null, 2));
  if (!result.ok) process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`rigopt contracts FAILED: ${error.message}`); process.exitCode = 1; }
}
