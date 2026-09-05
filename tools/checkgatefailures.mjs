/** Mutation checks run in an isolated fixture tree, never against live models. */
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { RIGS } from '../src/game/data.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const fixture = mkdtempSync(join(tmpdir(), 'drillity-gate-regression-'));
const put = (path, content) => {
  const target = join(fixture, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
};
const copy = (path) => {
  mkdirSync(dirname(join(fixture, path)), { recursive: true });
  copyFileSync(join(root, path), join(fixture, path));
};
const run = (script, args = []) => {
  const r = spawnSync(process.execPath, [join(fixture, script), ...args], { cwd: fixture, encoding: 'utf8' });
  if (r.error) throw r.error;
  return { status: r.status, text: r.stdout + r.stderr };
};
const reject = (result, reason) => {
  assert.equal(result.status, 1, result.text);
  assert.match(result.text, reason);
};
try {
  for (const path of ['tools/checkmodels.mjs', 'tools/checkbeds.mjs', 'tools/glbinfo.mjs', 'src/game/data.js',
    'src/core/contract.js', 'src/core/assets.js', 'blender/build.py']) copy(path);
  put('package.json', '{"type":"module"}');
  reject(run('tools/checkmodels.mjs'), /0 machines|0 machine|read 0|missing/);
  mkdirSync(join(fixture, 'public/models'), { recursive: true });
  reject(run('tools/glbinfo.mjs'), /empty/);
  for (const rig of RIGS) copy(`public/models/${rig.id}.glb`);
  assert.equal(run('tools/checkmodels.mjs').status, 0, 'real fleet fixture must first pass');
  const model = `public/models/${RIGS[0].id}.glb`;
  const original = readFileSync(join(fixture, model));
  assert.equal(run('tools/glbinfo.mjs', [model]).status, 0, 'real model must first be measurable');
  const json = Buffer.from(JSON.stringify({ asset: { version: '2.0' }, scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'mount:tool' }], materials: [{ name: 'paintedSteel' }],
    meshes: [{ primitives: [{ attributes: {}, material: 0 }] }] }));
  const aligned = (json.length + 3) & ~3;
  const incompleteGlb = Buffer.alloc(20 + aligned, 0x20);
  incompleteGlb.writeUInt32LE(0x46546c67, 0);
  incompleteGlb.writeUInt32LE(2, 4);
  incompleteGlb.writeUInt32LE(incompleteGlb.length, 8);
  incompleteGlb.writeUInt32LE(aligned, 12);
  incompleteGlb.writeUInt32LE(0x4e4f534a, 16);
  json.copy(incompleteGlb, 20);
  put(model, incompleteGlb);
  reject(run('tools/glbinfo.mjs', [model]), /INCOMPLETE|no POSITION/);
  reject(run('tools/checkmodels.mjs'), /INCOMPLETE|no POSITION/);
  for (const [offset, value] of [[4, 1], [8, 20]]) {
    const invalidHeader = Buffer.from(original);
    invalidHeader.writeUInt32LE(value, offset);
    put(model, invalidHeader);
    reject(run('tools/glbinfo.mjs', [model]), /header|declared length/);
    reject(run('tools/checkmodels.mjs'), /header|declared length/);
  }
  put(model, '<!doctype html><p>SPA fallback</p>');
  reject(run('tools/checkmodels.mjs'), /unreadable model/);
  put(model, original.subarray(0, original.length - 8));
  reject(run('tools/checkmodels.mjs'), /declared length/);
  put(model, original);
  const manifest = readFileSync(join(fixture, 'blender/build.py'));
  put('blender/build.py', 'MACHINES = []');
  reject(run('tools/checkmodels.mjs'), /MACHINES list is empty/);
  rmSync(join(fixture, 'blender/build.py'));
  reject(run('tools/checkmodels.mjs'), /build.py is missing/);
  put('blender/build.py', manifest);
  rmSync(join(fixture, model));
  reject(run('tools/checkmodels.mjs'), /is missing/);
  // Exercise the actual contract gate with a generator that produces nothing.
  put('src/game/data.js', `export const METHODS=[]; export const RIGS=[];
export const MAX_LEVEL=60; export const REGIONS=[{id:'fixture'}];
export function makeContract(){return null;}`);
  reject(run('tools/checkbeds.mjs', ['1']), /makeContract returned no contract/);
  console.log('OK: empty, missing, non-GLB and truncated models fail; null contract generation fails.');
} finally {
  // This exact directory was created by mkdtempSync above; no computed user path.
  rmSync(fixture, { recursive: true, force: true });
}
