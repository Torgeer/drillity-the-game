#!/usr/bin/env node
/** Portable lossless artifact verification/extraction. The optional review calls
 * only the retained ledger/public-access critic, never the drilling runner. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const directory = path.dirname(fileURLToPath(import.meta.url));
const [command = 'verify', targetArg] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const portable = relative => relative.replaceAll('\\', '/');
const targetPath = (base, relative) => {
  relative = portable(relative);
  assert.ok(!path.isAbsolute(relative) && !relative.split('/').includes('..') && !relative.includes(':'), 'Relative bundle path required');
  const resolved = path.resolve(base, relative);
  assert.ok(resolved.startsWith(path.resolve(base) + path.sep), 'Bundle path must stay under target');
  return resolved;
};
function verify() {
  assert.equal(manifest.format, 'drillity-career-evidence-gzip-v1');
  assert.equal(hash(fs.readFileSync(path.join(directory, 'provenance/author-export.json'))), manifest.authorExportSha256);
  assert.equal(hash(fs.readFileSync(path.join(directory, 'provenance/critic-export.json'))), manifest.criticExportSha256);
  const raw = new Map();
  let compressedBytes = 0, uncompressedBytes = 0;
  for (const entry of manifest.files) {
    assert.equal(raw.has(entry.path), false, 'No duplicate archived paths');
    const compressed = fs.readFileSync(targetPath(directory, entry.compressedPath));
    assert.equal(compressed.length, entry.compressedBytes, entry.path + ' compressed size');
    assert.equal(hash(compressed), entry.compressedSha256, entry.path + ' compressed hash');
    const restored = gunzipSync(compressed);
    assert.equal(restored.length, entry.bytes, entry.path + ' restored size');
    assert.equal(hash(restored), entry.sha256, entry.path + ' restored exact hash');
    raw.set(entry.path, restored);
    compressedBytes += compressed.length; uncompressedBytes += restored.length;
  }
  assert.deepEqual({ files: raw.size, uncompressedBytes, compressedBytes }, manifest.totals);
  const json = relative => JSON.parse(raw.get(portable(relative)).toString('utf8'));
  const rows = ['01', '02', '03'].flatMap(n => json(`research/earned-career-chain-${n}/chain.json`).jobs);
  const successes = rows.filter(row => row.outputSave);
  assert.equal(successes.length, 102, 'All 102 successful raw jobs retained');
  assert.equal(rows.filter(row => !row.outputSave).length, 1, 'Failed controller diagnostic retained');
  let prior = null, receipts = 0;
  for (const row of successes) {
    const report = json(row.report), save = raw.get(portable(row.outputSave));
    assert.ok(save, 'Actual save bytes present');
    assert.equal(hash(save), row.outputSaveSha256, 'Actual saved chain hash');
    assert.equal(report.outputSaveSha256, row.outputSaveSha256);
    assert.equal(row.inputSaveSha256, prior, 'Unbroken successful persisted chain');
    prior = row.outputSaveSha256;
    receipts += report.events.filter(event => event.event === 'drill:complete').length;
  }
  assert.equal(receipts, 414, 'All actual completion events retained');
  assert.equal(hash(raw.get(manifest.criticalSave)), manifest.criticalSaveSha256);
  console.log(JSON.stringify({ verified: true, ...manifest.totals, savedJobs: successes.length, completionEvents: receipts, criticalSaveSha256: manifest.criticalSaveSha256 }));
  return raw;
}
const raw = verify();
if (command === 'verify') {
  // Verification is read-only and does not import game code.
} else if (command === 'extract') {
  if (!targetArg) throw new Error('Usage: node bundle.mjs extract TARGET_FOLDER');
  const target = path.resolve(targetArg);
  // Validate every existing target first; no partial overwrite of old evidence.
  for (const entry of manifest.files) {
    const destination = targetPath(target, entry.path);
    if (fs.existsSync(destination)) assert.equal(hash(fs.readFileSync(destination)), entry.sha256, entry.path + ' exists with different bytes; extraction refuses to overwrite');
  }
  for (const entry of manifest.files) {
    const destination = targetPath(target, entry.path);
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, raw.get(entry.path), { flag: 'wx' });
    }
    assert.equal(hash(fs.readFileSync(destination)), entry.sha256, entry.path + ' extracted exact hash');
  }
  console.log(JSON.stringify({ extracted: true, target, files: manifest.files.length, productionFilesCopied: 0 }));
} else if (command === 'review') {
  if (!targetArg) throw new Error('Usage: node bundle.mjs review MATCHING_SOURCE_WORKSPACE');
  const target = path.resolve(targetArg);
  for (const entry of manifest.files) assert.equal(hash(fs.readFileSync(targetPath(target, entry.path))), entry.sha256, entry.path + ' extracted evidence changed');
  for (const [relative, expected] of Object.entries(manifest.sourceHashesRequiredForOriginalReview)) {
    assert.equal(hash(fs.readFileSync(targetPath(target, relative))), expected, relative + ' differs from the original reviewed source; do not relabel another source as this checkpoint');
  }
  const output = path.join(directory, 'reviews', `earned-career-portable-review-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  assert.equal(fs.existsSync(output), false, 'New review output only');
  // Historical JSON paths use Windows separators. Normalize only filesystem
  // lookups on other hosts, preserving the original artifact and tool bytes.
  const originalRead = fs.readFileSync;
  fs.readFileSync = function (filename, ...options) {
    return originalRead.call(this, typeof filename === 'string' ? portable(filename) : filename, ...options);
  };
  const previousDirectory = process.cwd(), previousArgs = process.argv;
  const tool = path.join(target, 'tools/check-earned-career-independent.mjs');
  try {
    process.chdir(target);
    process.argv = [process.execPath, tool, output];
    await import(pathToFileURL(tool).href);
    const reviewRaw = fs.readFileSync(output);
    const reviewCompressed = gzipSync(reviewRaw, { level: 9 });
    assert.deepEqual(gunzipSync(reviewCompressed), reviewRaw, 'Review output compresses without loss');
    fs.writeFileSync(output + '.gz', reviewCompressed, { flag: 'wx' });
    const integrity = { path: path.basename(output) + '.gz', bytes: reviewRaw.length, sha256: hash(reviewRaw), compressedBytes: reviewCompressed.length, compressedSha256: hash(reviewCompressed), simulationRun: false };
    fs.writeFileSync(output + '.integrity.json', JSON.stringify(integrity, null, 2), { flag: 'wx' });
    fs.unlinkSync(output);
    console.log(JSON.stringify({ reviewOutput: output + '.gz', ...integrity }));
  } finally {
    fs.readFileSync = originalRead;
    process.chdir(previousDirectory); process.argv = previousArgs;
  }
} else {
  throw new Error('Commands: verify; extract TARGET_FOLDER; review MATCHING_SOURCE_WORKSPACE');
}
