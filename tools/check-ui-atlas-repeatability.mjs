/** Re-render in a separate directory from a different cwd; compare real bytes.
 * No package install, browser, GPU, or edits to the checked-in asset set.
 * Usage: node tools/check-ui-atlas-repeatability.mjs [--blender /path/to/blender]
 * The initial authored export plus this render form the two measured runs.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
assert(args.length === 0 || (args.length === 2 && args[0] === '--blender'),
  'Usage: node tools/check-ui-atlas-repeatability.mjs [--blender /path/to/blender]');
const blender = args[1] || process.env.BLENDER_BIN ||
  (process.platform === 'win32' ? 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe' : 'blender');
const reference = join(root, 'public/ui/blender');
const manifest = JSON.parse(await readFile(join(reference, 'manifest.json'), 'utf8'));
assert(manifest.sprites?.length > 0, 'Cannot verify repeatability over an empty asset set');
assert.equal(manifest.generator.engine, 'CYCLES');
assert.equal(manifest.generator.device, 'CPU');
const listed = [...Object.values(manifest.atlases),
  ...manifest.sprites.flatMap(sprite => Object.values(sprite.files))];
assert(listed.length > 2, 'No individual rendered assets');
const expected = [...listed.map(row => row.file), 'manifest.json'].sort();
assert.equal(new Set(expected).size, expected.length, 'Duplicate manifest file names');
assert(expected.every(name => /^[a-zA-Z0-9@._-]+$/.test(name)), 'Unexpected asset filename');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const before = new Map(await Promise.all(expected.map(async name =>
  [name, hash(await readFile(join(reference, name)))])));
const scratch = join(root, 'shots/ui-atlas');
await mkdir(scratch, { recursive: true });
const output = await mkdtemp(join(scratch, 'reproduce-'));
const log = [];
const start = performance.now();
// Deliberately use the temporary output as cwd. The source must resolve its own
// repo references correctly, matching Blender's documented project workflow.
const commandArgs = ['--background', '--factory-startup', '--threads', '4',
  '--python-exit-code', '1', '--python', resolve(root, 'blender/ui_atlas.py'), '--',
  '--out', output, '--samples', String(manifest.generator.samples),
  '--threads', String(manifest.generator.threads), '--seed', String(manifest.generator.seed)];
await new Promise((resolveRun, reject) => {
  const child = spawn(blender, commandArgs, { cwd: output, windowsHide: true });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => {
    const text = chunk.toString();
    log.push(text);
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith('UI_SPRITE ') || line.startsWith('UI_ATLAS_OK')) console.log(line);
    }
  });
  child.on('error', reject);
  child.on('close', code => code === 0 ? resolveRun() :
    reject(new Error(`Blender exit ${code}\n${log.join('').slice(-4000)}`)));
});
await writeFile(join(scratch, 'repeatability-render.log'), log.join(''));
assert.deepEqual((await readdir(output)).sort(), expected, 'Re-render inventory differs');
const rows = [];
for (const name of expected) {
  const original = await readFile(join(reference, name));
  const fresh = await readFile(join(output, name));
  assert.equal(hash(original), before.get(name), `Reference changed during verification: ${name}`);
  assert(original.equals(fresh), `CPU re-render is not byte-identical: ${name}`);
  rows.push({ file: name, bytes: fresh.length, sha256: hash(fresh) });
}
const report = {
  status: 'PASS', scope: 'same installed Blender version and CPU host; no cross-platform determinism claim',
  blenderVersion: manifest.generator.blenderVersion, files: rows.length,
  bytes: rows.reduce((sum, row) => sum + row.bytes, 0), seconds: (performance.now() - start) / 1000,
  alternateWorkingDirectory: output, outputDirectory: output, identical: rows,
};
await writeFile(join(scratch, 'repeatability.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`UI_ATLAS_REPEAT_OK ${report.files} files, ${report.bytes} identical bytes, ${report.seconds.toFixed(2)}s`);
