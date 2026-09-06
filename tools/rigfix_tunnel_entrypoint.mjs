/** Exercise the real standalone Blender entry point inside an isolated fixture.
 * node tools/rigfix_tunnel_entrypoint.mjs [--baseline | --verify-latest]
 * All fixture/output writes remain under .rig-corrections/tunnel. The baseline
 * run reproduces the old underscore filename; the default run requires the
 * registered hyphenated filename. Neither run calls build() with a chosen path.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseGLB, measure } from './glbinfo.mjs';
import { snapshot, compareSnapshots } from './rigopt_contracts.mjs';
import { RIGS } from '../src/game/data.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = join(ROOT, '.rig-corrections', 'tunnel');
const FROZEN = join(ROOT, '.rig-corrections', 'before');
const BLENDER = 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe';
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const hashFile = (path) => sha256(readFileSync(path));

// Exact payload comparison, not a dimension ruler: no vertex transform or
// extent calculation occurs here. glbinfo.measure owns every dimension.
function payload(g, bin, index) {
  const accessor = g.accessors[index];
  assert.ok(accessor && !accessor.sparse, 'missing/sparse mesh accessor');
  const view = g.bufferViews[accessor.bufferView];
  const componentBytes = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }[accessor.componentType];
  const lanes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[accessor.type];
  assert.ok(view && view.buffer === 0 && componentBytes && lanes);
  const width = componentBytes * lanes, stride = view.byteStride || width;
  const offset = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  assert.ok(stride >= width && offset + (accessor.count - 1) * stride + width <= bin.length);
  const rows = [];
  for (let i = 0; i < accessor.count; i++) rows.push(bin.subarray(offset + i * stride, offset + i * stride + width));
  return { schema: [accessor.componentType, accessor.type, accessor.count, !!accessor.normalized], bytes: Buffer.concat(rows) };
}

function compareMeshPayloads(before, after) {
  const beforeNodes = new Map(before.json.nodes.filter((node) => node.mesh !== undefined).map((node) => [node.name, node]));
  const afterNodes = new Map(after.json.nodes.filter((node) => node.mesh !== undefined).map((node) => [node.name, node]));
  assert.deepEqual([...afterNodes.keys()].sort(), [...beforeNodes.keys()].sort());
  let uvScalarsChanged = 0, maxUvDelta = 0;
  for (const [name, node] of afterNodes) {
    const original = beforeNodes.get(name);
    for (const key of ['matrix', 'translation', 'rotation', 'scale']) {
      assert.deepEqual(node[key] ?? null, original[key] ?? null, name + ': mesh transform changed');
    }
    const oldPrimitives = before.json.meshes[original.mesh].primitives;
    const newPrimitives = after.json.meshes[node.mesh].primitives;
    assert.equal(newPrimitives.length, oldPrimitives.length);
    newPrimitives.forEach((primitive, i) => {
      const old = oldPrimitives[i];
      assert.equal(primitive.mode ?? 4, old.mode ?? 4);
      assert.equal(after.json.materials[primitive.material]?.name, before.json.materials[old.material]?.name);
      assert.deepEqual(Object.keys(primitive.attributes).sort(), Object.keys(old.attributes).sort());
      const attributes = { ...primitive.attributes, indices: primitive.indices };
      const oldAttributes = { ...old.attributes, indices: old.indices };
      for (const [attribute, index] of Object.entries(attributes)) {
        if (index === undefined) { assert.equal(oldAttributes[attribute], undefined); continue; }
        const a = payload(before.json, before.bin, oldAttributes[attribute]);
        const b = payload(after.json, after.bin, index);
        assert.deepEqual(b.schema, a.schema);
        if (attribute.startsWith('TEXCOORD_')) {
          assert.equal(b.schema[0], 5126, 'UV precision check requires float32');
          for (let offset = 0; offset < b.bytes.length; offset += 4) {
            const delta = Math.abs(b.bytes.readFloatLE(offset) - a.bytes.readFloatLE(offset));
            assert.ok(Number.isFinite(delta) && delta <= 1e-7, name + ': UV change exceeds rounding tolerance');
            if (delta) uvScalarsChanged++;
            maxUvDelta = Math.max(maxUvDelta, delta);
          }
        } else assert.ok(b.bytes.equals(a.bytes), name + ': ' + attribute + ' payload changed');
      }
    });
  }
  return { meshes: afterNodes.size, exactMeshTransforms: true,
    exactPositionNormalIndexPayloads: true, uvScalarsChanged, maxUvDelta, uvTolerance: 1e-7 };
}

function verifyLatest() {
  const result = JSON.parse(readFileSync(join(OUTPUT, 'fixed-result.json'), 'utf8'));
  const currentSource = join(ROOT, 'blender', 'tunnel_jumbo.py');
  assert.equal(result.phase, 'fixed');
  assert.equal(hashFile(currentSource), result.sourceSha256, 'saved fixture is stale against current source');
  assert.equal(hashFile(join(result.fixture, 'blender', 'tunnel_jumbo.py')), result.sourceSha256);
  assert.equal(hashFile(result.exported), result.exportedSha256, 'saved output hash changed');
  assert.equal(hashFile(result.frozenModel), result.frozenModelSha256);
  for (const [name, hash] of Object.entries(result.libraryHashes)) {
    assert.equal(hashFile(join(ROOT, 'blender', 'lib', name)), hash, 'saved fixture is stale against shared library');
    assert.equal(hashFile(join(result.fixture, 'blender', 'lib', name)), hash);
  }
  assert.deepEqual(readdirSync(join(result.fixture, 'public', 'models')), ['tunnel-jumbo.glb']);
  const before = parseGLB(readFileSync(result.frozenModel));
  const after = parseGLB(readFileSync(result.exported));
  const geometry = compareMeshPayloads(before, after);
  const report = { ok: true, artifact: result.exported, exportedSha256: result.exportedSha256,
    sourceSha256: result.sourceSha256, frozenModelSha256: result.frozenModelSha256, geometry };
  writeFileSync(join(OUTPUT, 'geometry-proof.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}

function main() {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--baseline'),
    'usage: node tools/rigfix_tunnel_entrypoint.mjs [--baseline]');
  const baseline = args.includes('--baseline');
  const label = baseline ? 'baseline' : 'fixed';
  const source = baseline ? join(FROZEN, 'source', 'tunnel_jumbo.py') : join(ROOT, 'blender', 'tunnel_jumbo.py');
  const frozenModel = join(FROZEN, 'models', 'tunnel-jumbo.glb');
  const protectedPublic = join(ROOT, 'public', 'models', 'tunnel-jumbo.glb');
  const frozenHash = hashFile(frozenModel);
  const publicHash = hashFile(protectedPublic);
  const sourceHash = hashFile(source);
  const registered = RIGS.filter((rig) => rig.id === 'tunnel-jumbo');
  assert.equal(registered.length, 1, 'expected one registered tunnel-jumbo rig');
  const registeredFilename = registered[0].id + '.glb';
  const frozenSource = join(FROZEN, 'source', 'tunnel_jumbo.py');
  const normalizeLines = (text) => text.replace(/\r\n/g, '\n');
  if (!baseline) {
    const original = normalizeLines(readFileSync(frozenSource, 'utf8'));
    const oldEntry = "'..', 'public', 'models', 'tunnel_jumbo.glb'))";
    assert.equal(original.split(oldEntry).length, 2, 'frozen standalone entry is not uniquely identifiable');
    const expectedSource = original.replace(oldEntry, "'..', 'public', 'models', 'tunnel-jumbo.glb'))");
    assert.equal(normalizeLines(readFileSync(source, 'utf8')), expectedSource,
      'module changed outside the standalone output filename');
  }
  mkdirSync(OUTPUT, { recursive: true });
  // A fresh directory prevents an old artifact from satisfying the assertion.
  const fixture = mkdtempSync(join(OUTPUT, label + '-'));
  assert.ok(relative(OUTPUT, fixture) && !relative(OUTPUT, fixture).startsWith('..'));
  const fixtureBlender = join(fixture, 'blender');
  const fixtureLib = join(fixtureBlender, 'lib');
  const fixtureModels = join(fixture, 'public', 'models');
  mkdirSync(fixtureLib, { recursive: true });
  mkdirSync(fixtureModels, { recursive: true });
  const script = join(fixtureBlender, 'tunnel_jumbo.py');
  copyFileSync(source, script);
  const libraryHashes = {};
  for (const name of readdirSync(join(ROOT, 'blender', 'lib')).filter((name) => name.endsWith('.py')).sort()) {
    const libSource = join(ROOT, 'blender', 'lib', name);
    copyFileSync(libSource, join(fixtureLib, name));
    libraryHashes[name] = hashFile(libSource);
    assert.equal(hashFile(join(fixtureLib, name)), libraryHashes[name]);
  }
  assert.equal(hashFile(script), sourceHash);
  assert.deepEqual(readdirSync(fixtureModels), []);
  const commandArgs = ['--background', '--threads', '2', '--python-exit-code', '1', '--python', script];
  const run = spawnSync(BLENDER, commandArgs, {
    cwd: fixture, encoding: 'utf8', windowsHide: true, timeout: 180000,
    maxBuffer: 8 * 1024 * 1024,
  });
  writeFileSync(join(fixture, 'blender.log'), (run.stdout || '') + (run.stderr || ''));
  assert.ifError(run.error);
  assert.equal(run.status, 0, 'Blender process failed; inspect fixture/blender.log');
  const expected = baseline ? 'tunnel_jumbo.glb' : registeredFilename;
  const unexpected = baseline ? registeredFilename : 'tunnel_jumbo.glb';
  assert.deepEqual(readdirSync(fixtureModels), [expected], 'standalone entry point exported the wrong filename or extra artifacts');
  assert.equal(existsSync(join(fixtureModels, unexpected)), false);
  const exported = join(fixtureModels, expected);
  const outputBytes = readFileSync(exported);
  const parsed = parseGLB(outputBytes);
  const ruler = measure(parsed.json, parsed.bin);
  assert.equal(ruler.empty, false, 'standalone GLB has no geometry');
  assert.deepEqual(ruler.unreadable, []);
  const referenceBytes = readFileSync(frozenModel);
  const reference = snapshot(parseGLB(referenceBytes), referenceBytes.byteLength);
  const current = snapshot(parsed, outputBytes.byteLength);
  const comparison = compareSnapshots(reference, current, { boundsTolerance: 0 });
  const geometry = compareMeshPayloads(parseGLB(referenceBytes), parsed);
  assert.equal(comparison.ok, true, comparison.failures.join('\n'));
  assert.deepEqual(current.totals, reference.totals, 'standalone geometry/node/byte counts changed');
  assert.equal(comparison.maxTransformDelta, 0);
  assert.equal(comparison.maxAnimationDelta, 0);
  assert.equal(hashFile(frozenModel), frozenHash, 'frozen model was modified');
  assert.equal(hashFile(protectedPublic), publicHash, 'public optimization model was modified');
  assert.equal(hashFile(source), sourceHash, 'source changed during standalone build');
  for (const [name, hash] of Object.entries(libraryHashes)) {
    assert.equal(hashFile(join(ROOT, 'blender', 'lib', name)), hash, 'shared library changed during test');
  }
  const report = {
    ok: true, phase: label, fixture, command: [BLENDER, ...commandArgs],
    actualStandaloneInvocation: true, source, sourceSha256: sourceHash,
    frozenModel, frozenModelSha256: frozenHash, exported,
    exportedSha256: sha256(outputBytes), expectedFilename: expected,
    registeredFilename, unexpectedFilenameAbsent: true, publicModelUnchanged: true,
    frozenModelUnchanged: true, libraryHashes, dimensionsRuler: 'tools/glbinfo.mjs',
    actualVertexBounds: ruler.all, comparison, geometry,
  };
  writeFileSync(join(fixture, 'result.json'), JSON.stringify(report, null, 2) + '\n');
  writeFileSync(join(OUTPUT, label + '-result.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}

try {
  if (process.argv.length === 3 && process.argv[2] === '--verify-latest') verifyLatest();
  else main();
}
catch (error) { console.error('TUNNEL_STANDALONE_FAILED: ' + error.message); process.exitCode = 1; }
