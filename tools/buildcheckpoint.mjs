/** Build and record exact local inputs/output; no release or device approval.
 * Run: node tools/buildcheckpoint.mjs
 * Generated public assets are inputs here, not regenerated Blender outputs.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveConfig } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const walk = (base, prefix = '') => readdirSync(resolve(root, base, prefix), { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(base, `${prefix}${e.name}/`) : [`${prefix}${e.name}`]).sort();
const record = (base, path) => {
  const bytes = readFileSync(resolve(root, base, path));
  return { path, bytes: bytes.length, sha256: sha(bytes) };
};
const inputs = () => [
  'index.html', 'package.json', 'package-lock.json', 'vite.config.js',
  'tools/buildcheckpoint.mjs', 'tools/checkbuild.mjs', 'tools/servedSourceIdentity.mjs',
  ...walk('src').map(p => `src/${p}`), ...walk('public').map(p => `public/${p}`),
].sort().map(path => record('', path));
const before = inputs();
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const worktreeStatus = execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=normal'],
  { cwd: root, encoding: 'utf8' }).trimEnd().split(/\r?\n/).filter(Boolean);
const vitePackage = require.resolve('vite/package.json');
const vite = JSON.parse(readFileSync(vitePackage, 'utf8'));
const viteBin = resolve(dirname(vitePackage), typeof vite.bin === 'string' ? vite.bin : vite.bin.vite);
execFileSync(process.execPath, [viteBin, 'build'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, [resolve(root, 'tools/checkbuild.mjs')], { cwd: root, stdio: 'inherit' });
assert.deepEqual(inputs(), before, 'Build inputs changed during the checkpoint');
const config = await resolveConfig({ root, logLevel: 'silent' }, 'build');
const output = resolve(root, config.build.outDir);
const files = walk(output).map(path => record(output, path));
const inventory = {
  capturedAt: new Date().toISOString(), sourceCommit,
  sourceIncludesUncommittedFiles: worktreeStatus.length > 0, worktreeStatus,
  buildCommand: 'node tools/buildcheckpoint.mjs',
  completedSteps: ['Vite build', 'tools/checkbuild.mjs', 'input identity before/after build'],
  note: 'Verified local bytes. sourceCommit is the parent when inputs are uncommitted; input hashes identify the actual build. Public assets remain ignored and were consumed, not regenerated. No career, graphics, FPS or real-device acceptance is implied.',
  runtime: { node: process.version, vite: vite.version,
    three: JSON.parse(readFileSync(resolve(root, 'node_modules/three/package.json'), 'utf8')).version,
    singleFile: JSON.parse(readFileSync(resolve(root, 'node_modules/vite-plugin-singlefile/package.json'), 'utf8')).version },
  inputs: before, files,
};
const target = resolve(root, 'research/CURRENT_BUILD_ASSETS.json');
writeFileSync(target, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
console.log(`Recorded ${files.length} output files and ${before.length} unchanged inputs in research/CURRENT_BUILD_ASSETS.json`);
