#!/usr/bin/env node
// Lossless artifact packaging only. No game production files are copied.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const [candidateArg, authorManifestArg] = process.argv.slice(2);
if (!candidateArg || !authorManifestArg) throw new Error('Usage: node build-bundle.mjs CANDIDATE AUTHOR_EXPORT_MANIFEST');
const candidate = path.resolve(candidateArg);
const directory = path.dirname(fileURLToPath(import.meta.url));
const main = path.resolve(directory, '../..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const authorRaw = fs.readFileSync(authorManifestArg);
const author = JSON.parse(authorRaw);
const approvedTopLevel = [
  'research/CAREER_PLAYTHROUGH_2026-09-08.md',
  'research/EARNED_CAREER_INDEPENDENT_REVIEW_2026-09-08.md',
  'research/CAREER_JOURNEY_INDEPENDENT_2026-09-08.md',
  'tools/check-earned-career-independent.mjs',
  'tools/probe-career-playthrough.mjs',
  'tools/run-career-earned.mjs',
  'tools/check-earned-career-provenance.mjs',
  'tools/check-earned-core-access.mjs',
];
const criticPaths = [
  'tools/checkcareerjourney-independent.mjs',
  'tools/checkordinarysoil-independent.mjs',
  'tools/check-earned-career-independent.mjs',
  'research/CAREER_JOURNEY_INDEPENDENT_2026-09-08.md',
  'research/EARNED_CAREER_INDEPENDENT_REVIEW_2026-09-08.md',
  ...fs.readdirSync(path.join(candidate, 'research')).filter(name =>
    /^(career-journey-independent.*|ordinary-soil-independent.*|earned-career-independent.*)\.json$/.test(name)
  ).map(name => 'research/' + name),
].sort();
assert.equal(criticPaths.length, 21, 'Expanded frozen critic inventory includes all 12 journey JSON reports');
const critic = { owner: 'completion_checkpoint_refresh', inventory: 'Explicit tool/report paths plus all frozen journey, ordinary-soil and earned-review JSON files; 21 files, including rejected/preliminary artifacts.', files: criticPaths.map(relative => {
  const raw = fs.readFileSync(path.join(candidate, relative));
  return { path: relative, sha256: hash(raw), bytes: raw.length };
}) };
const expectations = new Map();
for (const entry of [...author.files, ...critic.files]) {
  assert.ok(/^(research|tools)\//.test(entry.path) && !entry.path.split('/').includes('..'), 'Artifact path only');
  const prior = expectations.get(entry.path);
  if (prior) assert.equal(prior.sha256, entry.sha256, 'Overlapping manifest identity');
  expectations.set(entry.path, entry);
}
const entries = [];
for (const expected of [...expectations.values()].sort((a, b) => a.path.localeCompare(b.path))) {
  const raw = fs.readFileSync(path.join(candidate, expected.path));
  assert.equal(raw.length, expected.bytes, expected.path + ' source size');
  assert.equal(hash(raw), expected.sha256, expected.path + ' source hash');
  const compressed = gzipSync(raw, { level: 9 });
  assert.deepEqual(gunzipSync(compressed), raw, expected.path + ' exact decompression');
  const relative = 'payload/' + expected.path + '.gz';
  const destination = path.join(directory, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (fs.existsSync(destination)) assert.deepEqual(fs.readFileSync(destination), compressed, relative + ' existing bytes');
  else fs.writeFileSync(destination, compressed, { flag: 'wx' });
  entries.push({ path: expected.path, compressedPath: relative, bytes: raw.length, sha256: hash(raw), compressedBytes: compressed.length, compressedSha256: hash(compressed) });
}
const topLevelCopies = [];
for (const relative of approvedTopLevel) {
  const expected = expectations.get(relative);
  assert.ok(expected, 'Top-level copy must be in a frozen export');
  const destination = path.join(main, relative);
  if (fs.existsSync(destination)) {
    assert.equal(hash(fs.readFileSync(destination)), expected.sha256, relative + ' existing file must match; never overwrite');
    topLevelCopies.push({ path: relative, sha256: expected.sha256, status: 'already-identical' });
  } else {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(candidate, relative), destination, fs.constants.COPYFILE_EXCL);
    assert.equal(hash(fs.readFileSync(destination)), expected.sha256);
    topLevelCopies.push({ path: relative, sha256: expected.sha256, status: 'copied-absent' });
  }
}
fs.mkdirSync(path.join(directory, 'provenance'), { recursive: true });
fs.writeFileSync(path.join(directory, 'provenance/author-export.json'), authorRaw);
const criticRaw = Buffer.from(JSON.stringify(critic, null, 2));
fs.writeFileSync(path.join(directory, 'provenance/critic-export.json'), criticRaw);
const accepted = JSON.parse(fs.readFileSync(path.join(candidate, 'research/earned-career-independent-final.json')));
const manifest = {
  format: 'drillity-career-evidence-gzip-v1',
  scope: 'Exact retained author and critic evidence; no production files; no game simulation run by packaging or default verification.',
  authorExportSha256: hash(authorRaw), criticExportSha256: hash(criticRaw),
  sourceHashesRequiredForOriginalReview: accepted.sourceHashes,
  criticalSave: author.criticalSave, criticalSaveSha256: author.criticalSaveSha256,
  files: entries, topLevelCopies,
  totals: { files: entries.length, uncompressedBytes: entries.reduce((n, e) => n + e.bytes, 0), compressedBytes: entries.reduce((n, e) => n + e.compressedBytes, 0) },
  retainedLimits: [
    '102 saved successful contracts plus the original failed controller diagnostic and exact checkpoint restart.',
    '16.16 rounded completion-clock hours differ from 682.29 billed career hours; no human or phone timing claim.',
    'Earned level 18 does not imply core equipment affordability or a played core job.',
    'Historical JAM_CLEARED events were not captured; the saved jams statistic remains unvalidated by the chain.',
  ],
};
fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ ...manifest.totals, topLevelCopies, criticalSaveSha256: manifest.criticalSaveSha256 }, null, 2));
