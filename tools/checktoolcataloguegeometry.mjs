/** CPU regression for catalogue parameters and tool alias option precedence.
 *
 * node tools/checktoolcataloguegeometry.mjs [--json research/tool-catalogue-geometry.json]
 * node tools/checktoolcataloguegeometry.mjs --source-ref HEAD  (pre-fix reproduction)
 * node tools/checktoolcataloguegeometry.mjs --compare-ref HEAD (unchanged defined inputs)
 * node tools/checktoolcataloguegeometry.mjs --mutant old-merge|missing-76|missing-89
 *   Deliberately broken in-memory sources must fail; production files stay intact.
 *
 * This is a bounded regression, not another dimension CLI. The adapter only
 * packages actual procedural POSITION data and world matrices as glTF input;
 * tools/glbinfo.mjs measure() remains the sole bounds ruler. XYZ extents are
 * assembly bounds, NOT nominal hole diameter or carbide swept diameter.
 * Override values below are synthetic NOT SOURCED test inputs, not new content.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import * as THREE from 'three';
import { measure } from './glbinfo.mjs';
import { modelIdFor } from '../src/core/preview.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
function argument(name) {
  const i = args.indexOf(name);
  if (i < 0) return null;
  assert.ok(args[i + 1] && !args[i + 1].startsWith('--'), `${name} requires a value`);
  return args[i + 1];
}
const sourceRef = argument('--source-ref'), compareRef = argument('--compare-ref');
const jsonPath = argument('--json');
const mutant = argument('--mutant');
assert.ok(!sourceRef || !compareRef, 'choose source-ref OR compare-ref');
assert.ok(!mutant || (!sourceRef && !compareRef && ['old-merge', 'missing-76', 'missing-89'].includes(mutant)),
  'choose one supported in-memory mutant without historical source options');
const hash = value => createHash('sha256').update(value).digest('hex');
function source(path, ref) {
  return ref ? execFileSync('git', ['show', `${ref}:${path}`], { cwd: ROOT, encoding: 'utf8' })
    : readFileSync(resolve(ROOT, path), 'utf8');
}
async function load(path, ref) {
  let raw = source(path, ref);
  if (mutant === 'old-merge' && path === 'src/rig/tools.js') {
    const block = /    if \(alias\) \{\r?\n      \/\/ Optional caller fields[\s\S]*?\r?\n    \}/g;
    assert.equal([...raw.matchAll(block)].length, 1, 'old-merge mutant must remove exactly the new default restoration');
    raw = raw.replace(block, '');
  } else if (mutant?.startsWith('missing-') && path === 'src/game/data.js') {
    const id = mutant === 'missing-76' ? 'bit-th-t45-76-std' : 'bit-th-t45-89-hd';
    const diameter = mutant === 'missing-76' ? 76 : 89;
    const field = new RegExp(`(it\\(\\{ id: '${id}'[\\s\\S]*?)diameterMm: ${diameter},`, 'g');
    assert.equal([...raw.matchAll(field)].length, 1, 'diameter mutant must target exactly one current field');
    raw = raw.replace(field, '$1');
  }
  // A read-only historical module: no temporary production file or index writes.
  const rewritten = raw.replace(/from (['"])([^'"]+)\1/g, (full, quote, specifier) => {
    const url = specifier.startsWith('.') ? new URL(specifier, pathToFileURL(resolve(ROOT, path))).href
      : import.meta.resolve(specifier);
    return `from ${quote}${url}${quote}`;
  });
  return { module: await import(`data:text/javascript;base64,${Buffer.from(rewritten).toString('base64')}`), sha256: hash(raw) };
}
const library = await load('src/rig/tools.js', sourceRef);
const content = await load('src/game/data.js', sourceRef);
const previous = compareRef ? await load('src/rig/tools.js', compareRef) : null;
const { buildTool, TOOL_ALIASES, listTools, disposeToolLibrary } = library.module;
const { ITEMS } = content.module;
const previewSource = readFileSync(resolve(ROOT, 'src/core/preview.js'), 'utf8');
const optionExpression = /group\s*=\s*buildTool\(THREE_,\s*ctx,\s*modelId,\s*(\{[\s\S]*?\})\s*\);/.exec(previewSource);
assert.ok(optionExpression, 'review the real preview forwarding expression when its API changes');
const previewOptions = (item, wear) => runInNewContext(`(${optionExpression[1]})`, { item, wear });
const toolIds = new Set(listTools());
const results = [], samples = [];
let buildCount = 0, vertexCount = 0;
function check(name, fn) {
  try { fn(); results.push({ name, pass: true }); }
  catch (error) { results.push({ name, pass: false, error: error.message }); }
}

function inspect(root) {
  root.updateWorldMatrix(true, true);
  const g = { asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [] }],
    nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [] };
  const chunks = [], fingerprint = createHash('sha256');
  let bytes = 0, vertices = 0, triangles = 0, carbideMeshes = 0;
  root.traverse(node => {
    if (!node.isMesh) return;
    assert.ok(!node.isSkinnedMesh, 'add a measured adapter before accepting skins');
    assert.ok(!node.morphTargetInfluences?.some(Boolean), 'active morphs need measured adaptation');
    const geometry = node.geometry, p = geometry?.getAttribute('position');
    assert.ok(p?.count > 0, 'every generated mesh must have nonempty POSITION');
    assert.ok(!p.isInterleavedBufferAttribute && p.itemSize === 3 && p.array instanceof Float32Array,
      'review POSITION storage before adapting a new geometry format');
    const instances = node.isInstancedMesh ? node.count : 1;
    assert.ok(Number.isInteger(instances) && instances >= 0, 'instance count must be explicit and valid');
    for (let instance = 0; instance < instances; instance++) {
      const matrix = node.matrixWorld.clone();
      if (node.isInstancedMesh) {
        const local = new THREE.Matrix4();
        node.getMatrixAt(instance, local);
        matrix.multiply(local);
      }
      const data = Buffer.from(p.array.buffer, p.array.byteOffset, p.array.byteLength);
      const index = g.nodes.length;
      g.scenes[0].nodes.push(index);
      g.nodes.push({ name: node.name, matrix: [...matrix.elements], mesh: index });
      g.meshes.push({ primitives: [{ attributes: { POSITION: index } }] });
      g.accessors.push({ bufferView: index, componentType: 5126, type: 'VEC3', count: p.count });
      g.bufferViews.push({ buffer: 0, byteOffset: bytes, byteLength: data.length });
      chunks.push(data); bytes += data.length; vertices += p.count;
      triangles += (geometry.index?.count ?? p.count) / 3;
      fingerprint.update(JSON.stringify({ matrix: matrix.elements, count: p.count,
        groups: geometry.groups, drawRange: geometry.drawRange }));
      fingerprint.update(data);
      if (geometry.index) fingerprint.update(Buffer.from(geometry.index.array.buffer,
        geometry.index.array.byteOffset, geometry.index.array.byteLength));
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      if (materials.some(material => /carbide/.test(material?.name))) carbideMeshes++;
    }
  });
  assert.ok(vertices > 0, 'an empty geometry inspection must fail');
  g.buffers.push({ byteLength: bytes });
  const bounds = measure(g, Buffer.concat(chunks));
  assert.equal(bounds.empty, false, 'the ruler must measure an actual assembly');
  assert.deepEqual(bounds.unreadable, [], 'partial measurement cannot pass');
  const extentMm = bounds.all.max.map((v, axis) => (v - bounds.all.min[axis]) * 1000);
  assert.ok(extentMm.every(v => Number.isFinite(v) && v > 0), 'all measured extents must be finite and positive');
  vertexCount += vertices;
  return { fingerprint: fingerprint.digest('hex'), vertices, triangles, meshes: g.meshes.length,
    carbideMeshes, extentMm, boundsM: bounds.all };
}
function build(id, opts, lib = library.module) {
  const before = opts && Object.getOwnPropertyDescriptors(opts);
  const aliasBefore = JSON.stringify(lib.TOOL_ALIASES);
  const root = lib.buildTool(THREE, { THREE }, id, opts);
  buildCount++;
  try {
    const expectedId = lib.TOOL_ALIASES[id]?.id ?? (lib.TOOL_BUILDERS[id] ? id : 'billet');
    assert.equal(root.userData.spec.id, expectedId, `${id} must build its real family, not an unintended fallback billet`);
    assert.equal(root.userData.toolId, id, 'the requested alias identity must survive');
    const out = { ...inspect(root), spec: root.userData.spec, wear: root.userData.wear };
    assert.deepEqual(opts && Object.getOwnPropertyDescriptors(opts), before, 'caller options must not mutate');
    assert.equal(JSON.stringify(lib.TOOL_ALIASES), aliasBefore, 'alias defaults must not mutate');
    return out;
  } finally { root.userData.dispose(); }
}
function same(a, b, label) {
  assert.equal(a.fingerprint, b.fingerprint, `${label}: actual vertex/index/transform data must agree`);
  assert.deepEqual(a.extentMm, b.extentMm, `${label}: measured bounds must agree`);
  assert.deepEqual(a.spec, b.spec, `${label}: resolved physical spec must agree`);
  assert.equal(a.wear, b.wear, `${label}: wear must agree`);
}

check('ruler adapter applies nested world and per-instance transforms', () => {
  // Synthetic NOT SOURCED fixture coordinates solely validate the adapter.
  const root = new THREE.Group();
  root.position.set(1, 2, 3); root.rotation.z = Math.PI / 2;
  const geometry = new THREE.BoxGeometry(2, 2, 2), material = new THREE.MeshBasicMaterial();
  const instances = new THREE.InstancedMesh(geometry, material, 2);
  instances.setMatrixAt(0, new THREE.Matrix4());
  instances.setMatrixAt(1, new THREE.Matrix4().makeTranslation(4, 0, 0));
  root.add(instances);
  try {
    const actual = inspect(root);
    assert.equal(actual.vertices, 48, 'both instances contribute their actual vertices');
    const expected = { min: [0, 1, 2], max: [2, 7, 4] };
    for (const side of ['min', 'max']) for (let axis = 0; axis < 3; axis++) {
      assert.ok(Math.abs(actual.boundsM[side][axis] - expected[side][axis]) < 1e-6,
        'world rotation must transform the instance translation as well as its vertices');
    }
  } finally { geometry.dispose(); material.dispose(); }
});

// The two explicit expected nominal sizes are supported by the cited catalogue
// evidence beside the matching data.js entries, not inferred from item labels.
const catalogue = [['bit-th-t45-76-std', 76], ['bit-th-t45-89-hd', 89]];
for (const [id, diameterMm] of catalogue) {
  check(`${id}: sourced numeric catalogue diameter`, () => {
    const item = ITEMS.find(item => item.id === id);
    assert.ok(item, 'required catalogue entry must exist');
    assert.equal(item.diameterMm, diameterMm);
  });
}
for (const lod of [undefined, 'low']) for (const wear of [0, .5, 1]) {
  check(`catalogue geometry ${lod ?? 'normal'} wear ${wear}`, () => {
    const built = catalogue.map(([id, expected]) => {
      const item = ITEMS.find(item => item.id === id);
      assert.ok(item, 'a missing catalogue entry cannot pass');
      const idForTool = toolIds.has(id) ? id : modelIdFor(item);
      assert.equal(idForTool, 'button-bit', 'execute the real model resolver');
      const options = { ...previewOptions(item, wear), lod };
      const actual = build(idForTool, Object.freeze(options));
      samples.push({ type: 'catalogue', id, lod: lod ?? 'normal', wear,
        nominalMm: actual.spec.diameterMm, ...actual });
      assert.equal(actual.spec.diameterMm, expected, 'the real preview options must reach the builder');
      const explicit = build('button-bit', { thread: 'T45', diameterMm: expected, wear, lod });
      same(actual, explicit, `${id} forwarding`);
      return actual;
    });
    assert.notEqual(built[0].fingerprint, built[1].fingerprint, '76mm and 89mm catalogue bits must produce distinct vertices');
    assert.ok(built[1].extentMm[0] > built[0].extentMm[0], 'larger catalogue bit must have a larger measured X extent');
  });
}

const aliases = [
  'button-bit-t51-hd', 'button-bit-face-45', 'dth-bit-4', 'ith-bit-216',
  'dth-hammer-6', 'tricone-milled-445', 'core-bit-bq', 'core-bit-hq',
  'rod-t45', 'rod-t38-face-1830', 'rc-pipe-114-6m', 'rc-bit-146',
  'casing-crown-168', 'pdc-bit-311', 'cfa-flight-450', 'push-rod-reducer',
  'mud-motor-241', 'sample-bag-calico', 'tube-pile-914', 'spt-hammer-auto',
];
assert.equal(aliases.length, 20, 'review bounded family coverage if the fixture changes');
for (const id of aliases) for (const wear of [0, .5, 1]) {
  check(`${id}: undefined defaults / wear ${wear}`, () => {
    const alias = TOOL_ALIASES[id];
    assert.ok(alias && Object.keys(alias.opts).length, 'every alias case needs real defaults');
    const options = { wear, lod: 'low' };
    const absent = build(id, Object.freeze({ ...options }));
    const explicit = build(alias.id, { ...alias.opts, ...options });
    const undefineds = Object.fromEntries(Object.keys(alias.opts).map(key => [key, undefined]));
    const suppliedUndefined = build(id, Object.freeze({ ...undefineds, ...options, unrelated: undefined }));
    samples.push({ type: 'alias', id, wear, ...absent });
    same(absent, explicit, `${id} alias dispatch`);
    same(suppliedUndefined, absent, `${id} undefined omission equivalence`);
    if (previous) same(absent, build(id, options, previous.module), `${id} original default geometry`);
  });
}

// Exercise each default separately across the complete current alias table.
// The representative sweep above supplies normal/pristine/scrap coverage;
// this catches a future special alias or a partially repaired argument merge.
let aliasKeys = 0;
const allAliases = Object.entries(TOOL_ALIASES);
assert.ok(allAliases.length >= aliases.length, 'the complete alias manifest cannot be empty');
for (const [id, alias] of allAliases) {
  check(`${id}: every alias default key independently`, () => {
    const absent = build(id, { wear: .5, lod: 'low' });
    for (const key of Object.keys(alias.opts)) {
      aliasKeys++;
      same(build(id, Object.freeze({ [key]: undefined, wear: .5, lod: 'low' })), absent,
        `${id}.${key} undefined`);
    }
  });
}

const overrides = [
  ['button-bit-t51-hd', { thread: 'T38', diameterMm: 64, buttonKind: 'spherical' }],
  ['core-bit-bq', { size: 'PQ' }],
  ['rod-t38-face-1830', { thread: 'R32', lengthMm: 2435 }],
  ['rc-pipe-114-6m', { lengthMm: 3000 }],
  ['push-rod-reducer', { reducer: false }],
  ['mud-motor-241', { bendDeg: 0 }],
  ['sample-bag-calico', { fill: 0 }],
  ['button-bit-t51-hd', { flutes: 0, merge: false }],
  ['push-rod-reducer', { reducer: null }],
  ['core-bit-bq', { size: '' }],
];
for (const [id, override] of overrides) {
  check(`${id}: explicit ${JSON.stringify(override)}`, () => {
    const alias = TOOL_ALIASES[id];
    const options = Object.freeze({ wear: 0, lod: 'low', ...override });
    const actual = build(id, options);
    same(actual, build(alias.id, { ...alias.opts, ...options }), 'defined caller override');
    assert.notEqual(actual.fingerprint, build(id, { wear: 0, lod: 'low' }).fingerprint,
      'the override fixture must visibly change geometry, not pass on ineffective inputs');
    if (previous) same(actual, build(id, options, previous.module), 'existing explicit override semantics');
  });
}

check('single undefined does not discard another explicit override', () => {
  const actual = build('button-bit-t51-hd', Object.freeze({ thread: undefined, diameterMm: 127, wear: 0 }));
  same(actual, build('button-bit', { thread: 'T51', diameterMm: 127, buttonKind: 'ballistic', wear: 0 }),
    'partial undefined plus explicit diameter');
});
check('inherited option stays excluded and frozen own option stays intact', () => {
  const options = Object.freeze(Object.assign(Object.create({ diameterMm: 76 }), { thread: undefined, wear: 0 }));
  same(build('button-bit-t51-hd', options), build('button-bit-t51-hd', { wear: 0 }), 'own enumerable caller contract');
});
check('omitted options, undefined options and empty options agree', () => {
  same(build('button-bit-t51-hd'), build('button-bit-t51-hd', {}), 'whole option omission');
  same(build('button-bit-t51-hd', undefined), build('button-bit-t51-hd', { wear: 0 }), 'explicit pristine wear zero');
});
for (const id of ['button-bit', 'core-bit', 'push-rod', 'catalogue-regression-unknown-id']) {
  check(`${id}: direct/fallback undefined caller semantics`, () => {
    const options = Object.freeze({ diameterMm: undefined, thread: undefined, size: undefined,
      reducer: undefined, wear: 0, lod: 'low' });
    const actual = build(id, options);
    same(actual, build(id, { wear: 0, lod: 'low' }), 'direct undefined omission');
    if (previous) same(actual, build(id, options, previous.module), 'original direct/fallback behaviour');
  });
}
check('procedural T45 wear changes carbide geometry and loses buttons at scrap', () => {
  const states = [0, .5, 1].map(wear => build('button-bit', { thread: 'T45', diameterMm: 89, merge: false, wear }));
  assert.equal(new Set(states.map(state => state.fingerprint)).size, 3, 'wear must change actual vertices');
  assert.deepEqual(states.map(state => state.carbideMeshes), [13, 13, 6], 'scrap wear retains six of thirteen carbide buttons');
  assert.ok(states[2].vertices !== states[0].vertices, 'scrap changes topology as well as colour');
  samples.push(...states.map((state, i) => ({ type: 'wear-unmerged', wear: [0, .5, 1][i], ...state })));
  if (previous) for (const wear of [0, .5, 1]) same(states[[0, .5, 1].indexOf(wear)],
    build('button-bit', { thread: 'T45', diameterMm: 89, merge: false, wear }, previous.module), 'preserved wear geometry');
});

disposeToolLibrary();
previous?.module.disposeToolLibrary();
const failed = results.filter(result => !result.pass);
const report = { pass: failed.length === 0, sourceRef, compareRef, mutant,
  sourceHashes: { 'src/rig/tools.js': library.sha256, 'src/game/data.js': content.sha256,
    'src/core/preview.js': hash(previewSource), 'tools/glbinfo.mjs': hash(source('tools/glbinfo.mjs')) },
  previousToolsSha256: previous?.sha256 ?? null,
  cases: results.length, passed: results.length - failed.length, failed: failed.length,
  builds: buildCount, inspectedVertices: vertexCount, aliasCount: allAliases.length,
  independentlyTestedAliasKeys: aliasKeys, results, samples,
  limits: 'CPU geometry only; no GPU, pixels, occlusion, draw calls, FPS or whole-catalogue physical certification. Assembly XYZ bounds are not nominal or swept cutting diameter.' };
if (jsonPath) writeFileSync(resolve(ROOT, jsonPath), JSON.stringify(report, null, 2) + '\n');
for (const failure of failed) console.error(`FAIL ${failure.name}: ${failure.error}`);
console.log(`${report.pass ? 'PASS' : 'FAIL'} tool catalogue geometry: ${report.passed}/${report.cases} cases, ${buildCount} builds, ${vertexCount} actual POSITION vertices`);
if (failed.length) process.exitCode = 1;
