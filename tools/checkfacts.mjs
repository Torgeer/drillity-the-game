#!/usr/bin/env node
/**
 * checkfacts — assert the shipped "from the field" lines match their source.
 *
 *   node tools/checkfacts.mjs
 *
 * `FACTS_VERIFIED.md` is the authority: nothing enters that list without a
 * source tag, and two claims already in it were removed as wrong (a wing bit
 * was described as a lost bit; Symmetrix was described as eccentric). The code
 * holds a copy, and a copy drifts. This caught exactly that:
 *
 *   verified : '…the most abrasive ground in the game.'
 *   shipped  : '…the most abrasive ground you will meet.'
 *
 * The first is scoped to the GROUND table and true by construction. The second
 * is an unqualified superlative about the real world that no source supports.
 * One word, and the difference between a fact and a thing a driller would
 * argue with.
 *
 * The direction of truth is always FROM the markdown TO the code. If a line is
 * wrong, fix the source and re-source it — never quietly edit the copy.
 *
 * Exits 0 when identical, 1 on any drift.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Pull a single-quoted JS string-array literal out of a source text. */
function parseArray(text, name) {
  // Non-greedy to the first `\n];` at column 0-ish, which is how both files
  // close the literal. Anchoring on the newline avoids stopping at a `];`
  // that appears inside a string.
  const m = new RegExp(`${name}\\s*=\\s*\\[(.*?)\\n\\s*\\];`, 's').exec(text);
  if (!m) return null;
  const out = [];
  for (const raw of m[1].split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue;
    const q = line[0];
    if (q !== "'" && q !== '"') continue;
    // Walk the literal so an escaped quote inside the string does not end it.
    let s = '';
    let i = 1;
    for (; i < line.length; i++) {
      const c = line[i];
      if (c === '\\') { s += line[++i] === q ? q : '\\' + line[i]; continue; }
      if (c === q) break;
      s += c;
    }
    out.push(s);
  }
  return out;
}

/** Find the module that exports FACTS, wherever it currently lives. */
function findShipped() {
  const walk = (dir) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) { const r = walk(p); if (r) return r; continue; }
      if (!p.endsWith('.js')) continue;
      const text = readFileSync(p, 'utf8');
      if (!/export const FACTS\s*=\s*\[/.test(text)) continue;
      const facts = parseArray(text, 'FACTS');
      if (facts && facts.length) return { path: p, facts };
    }
    return null;
  };
  return walk(join(ROOT, 'src'));
}

const shipped = findShipped();
if (!shipped) {
  console.error('FAIL  no module in src/ exports a FACTS array.');
  console.error('      If it was renamed, update this guard — do not delete it.');
  process.exit(1);
}

const verified = parseArray(readFileSync(join(ROOT, 'FACTS_VERIFIED.md'), 'utf8'), 'FACTS');
if (!verified) {
  console.error('FAIL  FACTS_VERIFIED.md has no FACTS array to check against.');
  process.exit(1);
}

const where = relative(ROOT, shipped.path).replace(/\\/g, '/');
console.log(`shipped  ${where}  ${shipped.facts.length} facts`);
console.log(`verified FACTS_VERIFIED.md              ${verified.length} facts\n`);

const vset = new Set(verified);
const sset = new Set(shipped.facts);
const unverified = shipped.facts.filter((f) => !vset.has(f));
const unshipped = verified.filter((f) => !sset.has(f));

// Pair each drifted line with its nearest verified counterpart so the report
// shows the edit, not just two lists.
const near = (s, pool) => {
  let best = null;
  let bestScore = 0;
  for (const c of pool) {
    const a = new Set(s.split(/\s+/));
    const b = new Set(c.split(/\s+/));
    let hit = 0;
    for (const w of a) if (b.has(w)) hit++;
    const score = hit / Math.max(a.size, b.size);
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return bestScore > 0.5 ? best : null;
};

if (!unverified.length && !unshipped.length) {
  console.log('OK    every shipped fact is present in the verified list.');
  process.exit(0);
}

for (const f of unverified) {
  const match = near(f, unshipped);
  console.error('DRIFT shipped line is not the verified one:');
  console.error('  shipped  : ' + f);
  console.error('  verified : ' + (match || '*** no close match — this fact has no source at all ***'));
  console.error('');
}
for (const f of unshipped) {
  if (near(f, unverified)) continue; // already reported as a pair
  console.error('MISSING verified fact is not shipped:');
  console.error('  ' + f + '\n');
}

console.error('Fix the CODE to match FACTS_VERIFIED.md. If the verified line is itself');
console.error('wrong, correct it there with a source first — see PLATFORM_TRUTH.md Part C.');
process.exit(1);
