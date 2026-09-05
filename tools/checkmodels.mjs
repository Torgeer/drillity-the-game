#!/usr/bin/env node
/**
 * checkmodels — a Blender machine that never reaches the screen.
 *
 *   node tools/checkmodels.mjs
 *
 * ── WHAT THIS CAUGHT ───────────────────────────────────────────────────────
 * `src/core/gltfRig.js` fetches `models/<rigId>.glb`, and its own error text
 * says the filename "must be the RIG ID verbatim, hyphens and all". The rig ids
 * in `data.js` are hyphenated — `cfa-rig`, `core-rig`, `tunnel-jumbo`. The
 * Blender modules are Python, so they are named with underscores —
 * `cfa_rig.py`, `core_rig.py`, `tunnel_jumbo.py` — and each one exported a
 * `.glb` under its own module name.
 *
 * So eight machines were modelled and **six of them never loaded**. The loader
 * shouted about each one, fell through to the procedural builder exactly as it
 * is designed to, and the game drew the old machine. Nothing looked broken.
 * The two that did work — `dth-crawler` and `piling-leader` — worked only
 * because somebody had made a hand-copy under the hyphenated name, which is
 * precisely what stopped anybody noticing the other six.
 *
 * This is not a loader bug and not a naming nit. It is a day of modelling that
 * was not on screen, and the only reason it was invisible is that the fallback
 * is good. **A fallback that works is the most expensive kind of silent
 * failure**, because it removes the symptom and keeps the cause.
 *
 * ── WHAT IS CHECKED ────────────────────────────────────────────────────────
 *   1. every `.glb` in `public/models/` is named for a real rig id;
 *   2. no rig has two model files under two spellings — one of them is stale
 *      the moment the other is rebuilt, and which one wins is the loader's
 *      accident, not a decision;
 *   3. every `blender/<id>.py` maps to a rig id (or is a known non-rig).
 *
 * An EMPTY `public/models/` is not a failure. Models are gitignored and are
 * built by `npm run blender`, so a fresh clone legitimately has none and the
 * game is fully playable procedurally. What is a failure is a file that is
 * *there* and cannot be *found*.
 *
 * Exits 0 clean, 1 on any violation.
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const data = await import(pathToFileURL(join(ROOT, 'src/game/data.js')).href);

/**
 * Files that are deliberately not a rig.
 *
 * `teststub` is the pipeline's own proof — `blender/teststub.py` builds a
 * minimal machine to show that named nodes and material names survive export,
 * and it is how the pipeline was verified end to end before any real model
 * existed. It must never be a rig.
 *
 * That is the only one. `pd55` used to be listed here as a machine that was
 * modelled but not registered; it is a real rig now, so the exemption is gone.
 */
const NOT_A_RIG = new Map([
  ['teststub', 'the pipeline proof — must never be a rig'],
]);

const rigIds = new Set(data.RIGS.map((r) => r.id));
const fail = [];
const warn = [];
const note = [];

/* ── 1 & 2. the exported models ──────────────────────────────────────────── */
const MODELS = join(ROOT, 'public/models');

/* TOP LEVEL vs SUBDIRECTORY, and why the distinction is the whole point.

   `readdirSync` is not recursive. A .glb dropped in `public/models/tools/`
   would have been invisible to every check below — the rig-name rule, the
   duplicate rule and the material rule alike — and this file would have gone
   on printing OK. That is the "gate over an empty set" pattern (ASTRA.md §8),
   and it was caught before the first tool landed rather than after.

   The two levels are checked differently on purpose:
     - a .glb at the TOP LEVEL is a machine, and the loader asks for it by
       `models/<rigId>.glb`, so its name must BE a rig id;
     - a .glb in a SUBDIRECTORY is something else — tooling, site furniture —
       addressed by its own loader under its own naming scheme, so the rig-name
       rule does not apply to it.
   The MATERIAL rule applies to both, because assets.js is the only thing that
   can make a material and it does not care what asked for one. */
const listGlb = (dir, prefix = '') => (existsSync(dir)
  ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory()
    ? listGlb(join(dir, e.name), prefix + e.name + '/')
    : (e.name.endsWith('.glb') ? [prefix + e.name] : [])))
  : []);

const allGlb = listGlb(MODELS);
/** Machines: the top level only. These are the ones addressed by rig id. */
const models = allGlb.filter((f) => !f.includes('/'));
/** Everything else, checked for materials but not for rig names. */
const nested = allGlb.filter((f) => f.includes('/'));

/** Which rig, if any, a filename is TRYING to be. */
const intended = (stem) => (rigIds.has(stem) ? stem
  : rigIds.has(stem.replace(/_/g, '-')) ? stem.replace(/_/g, '-')
    : null);

const byRig = new Map();
for (const f of models) {
  const stem = f.slice(0, -4);
  if (NOT_A_RIG.has(stem)) { note.push(`${f} — ${NOT_A_RIG.get(stem)}`); continue; }
  const want = intended(stem);
  if (!want) {
    fail.push(`${f} is named for no rig at all. The loader asks for `
      + `models/<rigId>.glb and will never request this file. Either it is for a `
      + `machine missing from RIGS, or the name is wrong.`);
    continue;
  }
  if (stem !== want) {
    const size = statSync(join(MODELS, f)).size;
    fail.push(`${f} will NEVER load — the loader asks for "${want}.glb". `
      + `${(size / 1048576).toFixed(1)} MB of model that the game silently `
      + `replaces with the procedural builder.`);
  }
  if (!byRig.has(want)) byRig.set(want, []);
  byRig.get(want).push(f);
}

for (const [rig, files] of byRig) {
  if (files.length > 1) {
    fail.push(`rig "${rig}" has ${files.length} model files — ${files.join(', ')}. `
      + `One of them goes stale the moment the other is rebuilt, and which one the `
      + `game gets is the loader's accident rather than anybody's decision.`);
  }
}

/* ── 3. the Blender modules ──────────────────────────────────────────────────
   Read from `build.py`'s own MACHINES list rather than by globbing `*.py`.
   The directory also holds helper scripts — `preview.py`, `glb_report.py`,
   `inspect_glb.py` — which build nothing and are not machines, and an
   allowlist of those would need editing every time somebody wrote another
   tool. MACHINES is the list the build actually iterates, so it is the only
   one that can be wrong in a way that matters. */
const BUILD_PY = join(ROOT, 'blender/build.py');
let modules = [];
if (existsSync(BUILD_PY)) {
  const src = readFileSync(BUILD_PY, 'utf8');
  const m = /^MACHINES\s*=\s*\[([^\]]*)\]/m.exec(src);
  if (!m) {
    fail.push('blender/build.py has no MACHINES list this can read — the export '
      + 'is unverifiable, which is how eight machines came to be exported under '
      + 'names the loader never asks for.');
  } else {
    modules = [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
  }
}
for (const stem of modules) {
  if (NOT_A_RIG.has(stem)) continue;
  if (!intended(stem)) {
    warn.push(`build.py lists "${stem}", which is not a rig id and is not in `
      + 'NOT_A_RIG. Either register the machine in data.js or say here why it is not one.');
  }
}

/* THE ROOT CAUSE, checked directly. `build.py` exports with
   `mod.build(os.path.join(OUT, mid + '.glb'))`, where `mid` is the PYTHON
   MODULE name — underscored, because that is what an importable module has to
   be. The loader asks for the RIG ID, which is hyphenated. One line, eight
   machines, 31 MB that never reached the screen. */
if (existsSync(BUILD_PY)) {
  const src = readFileSync(BUILD_PY, 'utf8');
  if (/os\.path\.join\(OUT,\s*mid\s*\+/.test(src) && !/replace\(\s*['"]_['"]/.test(src)) {
    fail.push("blender/build.py exports to `mid + '.glb'` — the Python module name, "
      + 'which is underscored. The loader asks for the hyphenated rig id, so every '
      + "machine whose id contains a '-' exports to a filename the game never "
      + "requests. Export to the rig id: `mid.replace('_', '-') + '.glb'`.");
  }
}

/* ── 4. every material a model asks for must EXIST ───────────────────────────
   A .glb ships material NAMES only — `src/core/assets.js` generates all 33-odd
   texture kinds procedurally at runtime with wear and dirt driven by gameplay,
   so a baked map would be discarded and blow the texture budget. That is
   contract 2 of the pipeline, stated at the top of `blender/lib/rig.py`.

   It was broken by the pipeline itself. `rig.py` has named its chassis material
   `paintedDark` since the day it was written — "chassis, frames, guarding" —
   and assets.js had no such kind, so `resolve()` fell through to its `rawSteel`
   default and every frame, track guard and walkway on every Blender machine
   rendered as BRIGHT BARE METAL where the real machine is dark paint.
   Fleet-wide, and the only symptom was one warning line per model in a console
   nobody was reading.

   This reads the names out of the exported GLB rather than out of rig.py,
   because the GLB is what the loader will actually ask for — a hand-written
   material in one machine module would never appear in rig.py's MAT_ table. */
{
  const src = readFileSync(join(ROOT, 'src/core/assets.js'), 'utf8');
  const kinds = new Set([
    ...[...src.matchAll(/^      ([A-Za-z][A-Za-z0-9_]*):\s*\{/gm)].map((m) => m[1]),
    ...[...src.matchAll(/KINDS\.([A-Za-z0-9_]+)\s*=/g)].map((m) => m[1]),
  ]);
  for (const f of [...models, ...nested]) {
    let names = [];
    try {
      const buf = readFileSync(join(MODELS, f));
      if (buf.length > 12 && buf.readUInt32LE(0) === 0x46546c67) {
        let off = 12;
        while (off + 8 <= buf.length) {
          const len = buf.readUInt32LE(off);
          const type = buf.readUInt32LE(off + 4);
          if (type === 0x4e4f534a) {
            const j = JSON.parse(buf.slice(off + 8, off + 8 + len).toString('utf8'));
            names = (j.materials || []).map((m) => m.name).filter(Boolean);
            break;
          }
          off += 8 + len;
        }
      }
    } catch (e) { warn.push(`${f}: could not read materials — ${e.message}`); continue; }
    const unknown = [...new Set(names)].filter((n) => !kinds.has(n));
    if (unknown.length) {
      fail.push(`${f} asks for material(s) assets.js does not have: ${unknown.join(', ')}. `
        + `They will be silently substituted with rawSteel — bare metal where the `
        + `machine should be painted. Add the kind to assets.js, or use one of: `
        + `${[...kinds].slice(0, 8).join(', ')}…`);
    }
  }
}

/* ── what has been modelled, and what has not ────────────────────────────── */
const modelled = new Set([...byRig.keys()]);
const haveModule = new Set(modules.map(intended).filter(Boolean));
const missing = [...rigIds].filter((id) => !haveModule.has(id));

/* ── Report ──────────────────────────────────────────────────────────────── */
console.log(`rigs ${rigIds.size}   blender modules ${haveModule.size}   `
  + `exported models ${modelled.size}`
  + (nested.length ? `   non-machine .glb ${nested.length}` : ''));
if (missing.length) {
  console.log(`\nno Blender model yet (drawn procedurally): ${missing.join(' ')}`);
}
if (!models.length) {
  console.log('\npublic/models/ is empty — nothing has been exported. That is fine: '
    + 'models are gitignored and built by `npm run blender`.');
}
for (const n of note) console.log('NOTE  ' + n);
for (const w of warn) console.log('WARN  ' + w);

if (fail.length) {
  console.error('');
  for (const f of fail) console.error('FAIL  ' + f);
  console.error(`\n${fail.length} model(s) the game cannot load. A fallback that works `
    + 'is the most expensive kind of silent failure: it removes the symptom and keeps '
    + 'the cause.');
  process.exit(1);
}
console.log('\nOK    every exported model is named for the rig that asks for it.');
