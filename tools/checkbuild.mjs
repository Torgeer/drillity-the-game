/** Verify the artifact the player receives, after Vite's plugin hooks ran. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveConfig } from 'vite';
import { RIGS } from '../src/game/data.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const config = await resolveConfig({ root, logLevel: 'silent' }, 'build');
const inline = config.build.assetsInlineLimit;
assert.equal(typeof inline, 'function', 'binary guard was overwritten by a build plugin');
for (const ext of ['glb', 'gltf', 'bin', 'ktx2', 'basis', 'hdr', 'exr', 'drc']) {
  assert.equal(inline(`/fixture/model.${ext}`, Buffer.alloc(4)), false, `${ext} must stay external`);
}
assert.equal(inline('/fixture/logo.png', Buffer.alloc(4)), true, 'logo should remain in the single-file shell');
const out = resolve(root, config.build.outDir);
const html = readFileSync(join(out, 'index.html'), 'utf8');
assert.equal((html.match(/<script\b/g) || []).length, 1, 'the game needs exactly one inline script');
assert.doesNotMatch(html, /<script\b[^>]*\bsrc\s*=/i, 'game code escaped the inline shell');
for (const tag of html.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || []) {
  assert.match(tag, /href=["']https:\/\/fonts\.googleapis\.com\//, 'local CSS escaped the inline shell');
}
assert.ok(!existsSync(join(out, 'models/teststub.glb')), 'pipeline teststub must never ship');
const rigIds = new Set(RIGS.map((r) => r.id));
const modelFiles = readdirSync(join(out, 'models')).filter((f) => f.endsWith('.glb'));
assert.deepEqual(modelFiles.slice().sort(), [...rigIds].map((id) => `${id}.glb`).sort(),
  'the shipped fleet must match the content authority exactly');
const walk = (dir, prefix = '') => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`]);
let publicBytes = 0;
const expected = walk(join(root, 'public')).filter((p) => p !== 'models/teststub.glb');
// Equality checks over expected assets alone miss stale chunks and abandoned
// binaries. The current artifact contract is one shell plus the public assets;
// any new emitted resource needs to become an explicit part of that contract.
assert.deepEqual(walk(out).sort(), ['index.html', ...expected].sort(),
  'built output inventory must be exactly index.html and the shipped public assets');
for (const path of expected) {
  const source = readFileSync(join(root, 'public', path));
  assert.ok(source.equals(readFileSync(join(out, path))), `${path} is missing or stale in the built game`);
  publicBytes += source.length;
}
console.log(`OK: one inline game script; ${rigIds.size} shipped rigs; ${expected.length} public assets, `
  + `${publicBytes} bytes; no teststub; binary inlining guard survives Vite plugins.`);
