#!/usr/bin/env node
/**
 * checksites — the SITE half of `checkmodels`.
 *
 *   node tools/checksites.mjs
 *
 * `checkmodels.mjs` gates the nineteen MACHINES in `public/models/*.glb`.
 * Nothing gated the PLACES in `public/models/sites/*.glb`, and every failure
 * mode that cost this project a day on the machines is reachable again, one
 * archetype at a time, as the ten site modules land.
 *
 * ── WHY EACH CHECK EXISTS ──────────────────────────────────────────────────
 *
 * THE FILENAME. `src/world/terrain.js` fetches `models/sites/<archetype>.glb`
 * and its own error text says the name "must be the ARCHETYPE ID verbatim,
 * hyphens and all". Blender modules are Python and cannot be hyphenated, so
 * `open_pit_bench.py` naturally wants to export `open_pit_bench.glb` — a
 * filename the loader will never request. That exact mistake, on the machine
 * side, meant SIX OF EIGHT MACHINES HAD NEVER ONCE BEEN ON SCREEN: 31 MB of
 * modelling silently replaced by the procedural builder, invisible precisely
 * because the fallback works (ASTRA.md §4 contract 4). The site loader has the
 * same good fallback and therefore the same blind spot.
 *
 * THE MATERIAL NAME. A `.glb` ships material NAMES only; `src/core/assets.js`
 * makes the surface at runtime. A name `assets.js` cannot make does not throw —
 * `resolve()` falls through to `rawSteel`. `rig.py` called its chassis material
 * `paintedDark` from the day it was written, `assets.js` had no such kind, and
 * every frame, track guard and walkway ON ALL 17 MACHINES rendered as bright
 * bare metal for the life of the pipeline. One warning line was the only
 * symptom (ASTRA.md §4 contract 2).
 *
 * THE MATERIAL COUNT. `finish()` joins statics by material, so a site .glb
 * costs exactly ONE DRAW CALL PER MATERIAL, and it spends the surface band's
 * ceiling of 80 — which eight of twenty-one method states already breach with
 * no .glb on the site at all. `blender/lib/site.py` sets the number and
 * enforces it at build time. This is the other end of the same measurement,
 * for a file that reached the directory some other way (a hand-copy under the
 * right name is exactly what hid the machine bug for a week).
 *
 * THE SUPPRESSION KNOBS, AND A RULE THIS FILE GOT WRONG. `replaces` and
 * `replacesKit` are how an archetype says what its .glb takes over. This gate
 * used to FAIL any modelled archetype whose `replaces` was not NON-EMPTY, and
 * that rule was retired on 2026-09-06 after three measurements: a non-empty
 * list never once made an archetype net-neutral (all nine are additive, the
 * longest lists included); on the offshore plane no scatter is offered at all,
 * so the rule demanded a name that this same file's next check would reject;
 * and where it could be satisfied it deleted a whole 60 m disc of scatter to
 * buy one call. What is graded now is that the decision is DECLARED — an
 * omission is still a hard failure — that every name in a list is real, that
 * a `replacesKit: true` actually has a consumer in terrain.js, and that the
 * gross cost is PRINTED beside the declaration. The NET cost is enforced by
 * `tools/checksiteenvironment.mjs`, which measures it against a live terrain
 * build; a static gate cannot count a draw call and must not pretend to. The
 * full derivation is in `src/world/terrain.js` under THE EMPTY-LIST RULE.
 *
 * TRANSMISSION. Measured at +65 to +81 draw calls, independent of object size,
 * because three.js re-renders the whole opaque list into a transmission target.
 * One cab window doubled the entire fleet's cost. Found three separate times in
 * this codebase. Site glazing — a cabin window, a car windscreen, a site-office
 * pane — is precisely where somebody reaches for it (ASTRA.md §1.6).
 *
 * THE ORIGIN. `attachSiteModel()` does `node.position.set(0, 0, 0)` with the
 * comment "the .glb's origin IS the collar". A site whose datum is off by its
 * own height puts the machine underground or leaves it hanging in the air, and
 * nothing anywhere reports it.
 *
 * MEASURING NOTHING. `checkreach` once reported ZERO TARGETS AND CALLED IT A
 * PASS (ASTRA.md §10). Every count below is printed, and a count of zero is a
 * failure: no site files, no expected sites, no vertices, no materials, no
 * archetypes parsed — each one fails loudly and says why.
 *
 * ── ONE RULER ──────────────────────────────────────────────────────────────
 * Every dimension, bound and emptiness verdict here comes from
 * `tools/glbinfo.mjs`'s exported `parseGLB()` and `measure()`, which transform
 * EVERY ACTUAL VERTEX. This file computes no bound of its own. `glbdims.mjs`
 * existed for a few hours, measured the eight corners of each local AABB
 * through the world matrix, produced FOUR FALSE FINDINGS — three reported as
 * real — and was deleted (ASTRA.md §5). The only geometry-free arithmetic done
 * here is composing an anchor node's stated TRANSLATION chain, which is a point
 * the file declares rather than an extent measured off geometry; where the
 * anchor sits at the scene root (both shipped sites today) even that is a
 * direct read with no arithmetic at all, and the output says which path was
 * taken for every anchor.
 *
 * Exits 0 clean, 1 on any violation.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { parseGLB, measure } from './glbinfo.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

const fail = [];
const warn = [];
const note = [];
/** Every check records how much it actually looked at. A zero is a failure. */
const counted = new Map();
const count = (label, n, why) => { counted.set(label, { n, why }); return n; };

const FAIL = (m) => fail.push(m);
const WARN = (m) => warn.push(m);

/* ═══════════════════════════════════════════════════════════════════════════
   THE SOURCES OF TRUTH — parsed, never copied

   ASTRA.md §5: "two tables describing one thing will drift, and the one that is
   wrong will be believed." Nothing below is restated in this file. Every list
   is read out of the file that owns it, and every reader fails loudly when it
   reads less than it should — a parser that quietly returns an empty set turns
   this whole gate into one that passes forever.
   ═══════════════════════════════════════════════════════════════════════════ */

/** 1. `src/game/data.js` — THE CONTENT AUTHORITY for what an archetype is. */
const data = await import(pathToFileURL(join(ROOT, 'src/game/data.js')).href);
const dataArch = new Map((data.SITE_ARCHETYPES || []).map((a) => [a.id, a]));
if (count('archetypes in data.js', dataArch.size) < 8) {
  FAIL(`src/game/data.js exported ${dataArch.size} SITE_ARCHETYPES. The game ships ten. `
    + 'Reading fewer than that means this gate is grading a set it cannot see.');
}

/** Strip JS comments so a `{` or `}` inside one cannot break brace matching. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
}

/** Text of the object literal that follows `needle`, braces balanced. */
function literalAfter(src, needle, whose) {
  const start = src.indexOf(needle);
  if (start < 0) {
    FAIL(`${whose}: could not find \`${needle}\`. That file is another agent's and may `
      + 'have been restructured — FIX THIS PARSER. Do not fall back to a hardcoded '
      + 'list: a second table drifts and the wrong one gets believed (ASTRA §5).');
    return null;
  }
  let i = src.indexOf('{', start);
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  FAIL(`${whose}: unbalanced braces after \`${needle}\`.`);
  return null;
}

/** 2. `src/world/terrain.js` — THE LOADER'S OWN TABLE: what it asks for. */
const TERRAIN = join(ROOT, 'src/world/terrain.js');
/* The raw source, kept for checks that must ask what the LOADER actually does
   rather than restate it in prose. A hardcoded claim inside a gate is the same
   bug wearing a lab coat. */
const TERRAIN_SRC = existsSync(TERRAIN) ? readFileSync(TERRAIN, 'utf8') : '';
/** terrain.js with every comment blanked to spaces and every newline kept.
 *
 * ONE COPY, USED BY EVERY CHECK THAT SEARCHES FOR CODE, because two of them
 * blanking comments two different ways is the drift this file exists to stop
 * (ASTRA §5). Blanking rather than deleting keeps offsets and therefore line
 * numbers exactly terrain.js's own.
 *
 * WHY COMMENTS MUST GO. The `kitSuperseded()` search below asks whether a
 * branch is guarded, and the guarded branches now carry comments that QUOTE
 * their own condition — `if (kit === 'marine' && !kitSuperseded())` appears in
 * prose three times. Against the raw text a comment describing a fix would
 * satisfy a check looking for the fix, which is `check:haptics` printing a
 * claim about code that had already changed under it (ASTRA §10). */
const TERRAIN_CODE = TERRAIN_SRC
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:'"\\])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
/** Is this kit's branch of buildSiteKit() gated on `kitSuperseded()`? */
const kitBranches = (kit) => [...TERRAIN_CODE.matchAll(new RegExp(`if \\(kit === '${kit}'([^)]*)\\)`, 'g'))];
const archetypes = new Map();
if (!existsSync(TERRAIN)) {
  FAIL('src/world/terrain.js is missing; site models cannot be verified at all.');
} else {
  const body = literalAfter(stripComments(readFileSync(TERRAIN, 'utf8')),
    'const ARCHETYPES = {', 'src/world/terrain.js');
  if (body) {
    /* Walk the top level of the literal only. Depth is tracked so a nested
       `dress: { ... }` cannot be mistaken for another archetype. */
    let depth = 0;
    const entry = /(['"])([a-z0-9-]+)\1\s*:\s*\{/y;
    for (let i = body.indexOf('{') + 1; i < body.length; i++) {
      const c = body[i];
      if (c === '}') { if (depth === 0) break; depth--; continue; }
      if (depth === 0) {
        entry.lastIndex = i;
        const m = entry.exec(body);
        if (m) {
          let d = 0, j = body.indexOf('{', i);
          for (let k = j; k < body.length; k++) {
            if (body[k] === '{') d++;
            else if (body[k] === '}' && --d === 0) { j = k; break; }
          }
          const text = body.slice(entry.lastIndex - 1, j + 1);
          /* `replaces` IS AN ARRAY OR IT IS ABSENT, AND THIS READER MUST BE
             ABLE TO TELL THOSE APART. It could not. The old expression was

                 (/\breplaces\s*:\s*\[([^\]]*)\]/.exec(text) || [])[1] || null

             and on `replaces: []` the regex MATCHES, capture 1 is the empty
             string, and `'' || null` is null — the identical value it returns
             when the key is not there at all. Four archetypes declare
             `replaces: []` on purpose, each with its reason written beside it,
             and this gate failed all four with the words "declares no
             `replaces:`" — a statement about the file that was not true of the
             file (ASTRA §10: a hardcoded claim inside a gate is the same bug
             wearing a lab coat). `tools/checksiteenvironment.mjs` has always
             parsed this correctly (`Array.isArray(a.replaces)`); the two gates
             had drifted and the wrong one was believed (ASTRA §5).

             Now: `null` means ABSENT, `[]` means DECLARED EMPTY, and the
             checks below grade the difference. */
          const rawReplaces = /\breplaces\s*:\s*\[([^\]]*)\]/.exec(text);
          const rawKit = /\breplacesKit\s*:\s*(true|false)\b/.exec(text);
          archetypes.set(m[2], {
            id: m[2],
            text,
            model: (/\bmodel\s*:\s*(['"])([^'"]+)\1/.exec(text) || [])[2] || null,
            plane: (/\bplane\s*:\s*(['"])([^'"]+)\1/.exec(text) || [])[2] || null,
            kit: (/\bkit\s*:\s*(['"])([^'"]+)\1/.exec(text) || [])[2] || null,
            replaces: rawReplaces
              ? rawReplaces[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
              : null,
            replacesKit: rawKit ? rawKit[1] === 'true' : null,
          });
          i = j; continue;
        }
      }
      if (c === '{') depth++;
    }
  }
}
count('archetypes parsed from terrain.js', archetypes.size);

/* THE PARSER'S OWN SELF-CHECK, and it is the reason the parser is trustworthy.
   If terrain.js is restructured this gate must stop, not shrug: a silently
   empty ARCHETYPES map would make every check below pass over nothing. */
if (archetypes.size !== dataArch.size
  || [...dataArch.keys()].some((id) => !archetypes.has(id))) {
  FAIL(`the ARCHETYPES reader took ${archetypes.size} archetype(s) out of `
    + `src/world/terrain.js against ${dataArch.size} in src/game/data.js `
    + `(missing: ${[...dataArch.keys()].filter((id) => !archetypes.has(id)).join(', ') || 'none'}; `
    + `extra: ${[...archetypes.keys()].filter((id) => !dataArch.has(id)).join(', ') || 'none'}). `
    + 'Either the two tables have drifted, or this parser has. Fix whichever it is '
    + '— every check below grades the set this reader produced.');
}
for (const [id, a] of archetypes) {
  const d = dataArch.get(id);
  if (d && d.plane && a.plane && d.plane !== a.plane) {
    FAIL(`archetype "${id}" is plane "${a.plane}" in terrain.js and "${d.plane}" in `
      + 'data.js. The plane decides whether a site model can ever be attached.');
  }
}

/** The scatters an archetype can hand back, read off terrain.js's own calls. */
const scatterNames = new Set();
if (existsSync(TERRAIN)) {
  const src = readFileSync(TERRAIN, 'utf8');
  for (const m of src.matchAll(/addInstances\(\s*(['"])([a-z0-9-]+)\1/g)) scatterNames.add(m[2]);
  // `addInstances(`spruce-crown-${v}`, …)` — the stem, so the variants match.
  for (const m of src.matchAll(/addInstances\(\s*`([a-z0-9-]*-)\$\{/g)) scatterNames.add(m[1]);
}
if (count('procedural scatters found in terrain.js', scatterNames.size) < 4) {
  FAIL(`only ${scatterNames.size} addInstances() call(s) were found in `
    + 'src/world/terrain.js. The `replaces` check would then reject every valid '
    + 'name, so this reader is wrong and must be fixed rather than relaxed.');
}

/** 3. `blender/lib/site.py` — THE BUDGET, with its measurement written down. */
const SITE_PY = join(ROOT, 'blender/lib/site.py');
let MAX_MATERIALS = null;
if (!existsSync(SITE_PY)) {
  FAIL('blender/lib/site.py is missing; the site draw budget is unverifiable.');
} else {
  const m = /^MAX_MATERIALS\s*=\s*(\d+)\s*$/m.exec(readFileSync(SITE_PY, 'utf8'));
  if (!m) {
    FAIL('blender/lib/site.py has no `MAX_MATERIALS = <n>` this can read. The budget '
      + 'is the whole cost model of a site .glb (one draw call per material once the '
      + 'statics are joined) and it must come from that file, not from this one.');
  } else MAX_MATERIALS = Number(m[1]);
}

/** 4. `src/core/assets.js` — the ONLY thing that can make a material. */
const kinds = new Set();
{
  const src = readFileSync(join(ROOT, 'src/core/assets.js'), 'utf8');
  const start = src.indexOf('const KINDS = {');
  if (start < 0) {
    FAIL('src/core/assets.js has no `const KINDS = {` this can read. assets.js is '
      + 'another agent\'s file — fix this parser rather than hardcoding kinds.');
  } else {
    let i = src.indexOf('{', start), depth = 0, end = -1;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}' && --depth === 0) { end = i; break; }
    }
    if (end < 0) FAIL('src/core/assets.js: unbalanced braces in the KINDS literal.');
    else {
      /* BOUNDED TO THE LITERAL, deliberately stricter than checkmodels.mjs.
         checkmodels harvests six-space-indented keys from the WHOLE file, so it
         also swallows `PATTERNS`, `PATTERN_FEAT` and `noise` — names assets.js
         cannot serve. A site whose material is called `clay` or `void` passes
         that gate and is then silently substituted at runtime.
         `blender/lib/site.py`'s own `kinds()` scopes the scan this way; this is
         the same scope, so the build gate and the asset gate cannot disagree. */
      for (const m of src.slice(start, end).matchAll(/^\s{6}([A-Za-z][A-Za-z0-9_]*)\s*:\s*\{/gm)) kinds.add(m[1]);
      for (const m of src.slice(end).matchAll(/^\s*KINDS\.([A-Za-z0-9_]+)\s*=/gm)) kinds.add(m[1]);
    }
  }
  if (count('material kinds in assets.js', kinds.size) < 20) {
    FAIL(`only ${kinds.size} material kind(s) were read out of src/core/assets.js. `
      + 'The material check would then reject everything or accept nothing. '
      + 'A gate over an empty set passes forever (ASTRA §10) — this one stops.');
  }
}

/** 5. `blender/sites/*.py` — the authoring side. */
const SITES_DIR = join(ROOT, 'blender/sites');
const modules = new Map();     // archetype id -> { file, module, budget }
if (!existsSync(SITES_DIR)) {
  FAIL('blender/sites/ does not exist. The site pipeline has no source at all.');
} else {
  for (const f of readdirSync(SITES_DIR)) {
    if (!f.endsWith('.py') || f.startsWith('_')) continue;
    const stem = f.slice(0, -3);
    const id = stem.replace(/_/g, '-');
    const src = readFileSync(join(SITES_DIR, f), 'utf8');
    /* `budget=` may be a literal or a module constant. Resolve the constant
       rather than shrugging to the library default: a module that quietly
       falls back to the library ceiling is a module whose own stated ceiling
       nobody is grading. A named constant that does not exist is worse than
       either — the export raises NameError and produces no file at all. */
    const arg = /\.finish\s*\([^)]*?\bbudget\s*=\s*([A-Za-z_][A-Za-z0-9_]*|\d+)/.exec(src);
    let b = null;
    if (arg && /^\d+$/.test(arg[1])) b = [null, arg[1]];
    else if (arg) {
      const c = new RegExp(`^${arg[1]}\\s*=\\s*(\\d+)`, 'm').exec(src);
      if (c) b = [null, c[1]];
      else {
        FAIL(`blender/sites/${f} calls finish(budget=${arg[1]}) and never defines `
          + `${arg[1]}. The export raises NameError and writes no file, so the game `
          + 'draws the procedural kit and the only evidence is a build log.');
      }
    }
    /* EXPORTS, not merely exists. A module still being written has no
       `<lib>.finish(...)` call and cannot put a byte in public/models/sites, so
       it is not yet an unrequested export — it is a file in progress, and
       failing on it would train people to ignore this gate. The moment it can
       export, every rule below applies. Matching `.finish(` and not `finish(`
       on purpose: every one of these modules discusses `finish()` in prose. */
    modules.set(id, {
      file: `blender/sites/${f}`,
      module: stem,
      exports: /\.finish\s*\(/.test(src),
      budget: b ? Number(b[1]) : MAX_MATERIALS,
    });
  }
}
count('Blender site modules', modules.size);
count('site modules that can export', [...modules.values()].filter((m) => m.exports).length);
if (!modules.size) {
  FAIL('blender/sites/ contains no site module. Nothing is being authored, so every '
    + 'per-site check below would grade an empty set and pass.');
}

/** 6. `package.json` — what the build ACTUALLY runs. */
let buildScript = '';
try {
  buildScript = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts?.['blender:sites'] || '';
} catch (e) { FAIL(`package.json is unreadable: ${e.message}`); }
if (!buildScript) {
  FAIL('package.json has no `blender:sites` script. Site modules are then built by '
    + 'hand, if at all, and `npm run blender` produces a tree whose sites are '
    + 'whatever somebody last ran locally.');
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. THE REGISTRY — three tables that must agree before a byte is read

   Authoring (blender/sites), building (package.json) and asking (terrain.js)
   are three separate files, and the machine-side disaster was exactly a
   disagreement between two of them that nothing compared.
   ═══════════════════════════════════════════════════════════════════════════ */
for (const [id, mod] of modules) {
  if (!archetypes.has(id)) {
    FAIL(`${mod.file} builds "${id}", which is not an archetype at all. The loader `
      + 'only ever asks for `models/sites/<archetype id>.glb`, so nothing will '
      + 'request this. Either register the archetype or rename the module '
      + `(a module named <a_b>.py must be archetype "a-b").`);
    continue;
  }
  if (!mod.exports) {
    note.push(`${mod.file} has no \`<lib>.finish(...)\` call yet — it cannot export, so `
      + 'it is graded as work in progress rather than as an unrequested asset. '
      + 'A .glb under that name would still be checked.');
    continue;
  }
  if (buildScript && !buildScript.includes(mod.file)) {
    FAIL(`${mod.file} is not run by the \`blender:sites\` npm script, so `
      + '`npm run blender` never builds it. Whatever is on disk under that name '
      + 'came from a hand-run and goes stale silently.');
  }
  const a = archetypes.get(id);
  if (!a.model) {
    FAIL(`${mod.file} authors and exports "${id}.glb", but the "${id}" archetype in `
      + 'src/world/terrain.js declares no `model:`, so terrain.js NEVER FETCHES IT. '
      + 'This is the six-of-eight-machines failure in its site form: a fully built '
      + 'asset that the game silently replaces with the procedural kit, with a good '
      + 'fallback hiding it. Add `model: \'' + id + '\'` to the archetype.');
  }
  if (mod.budget != null && MAX_MATERIALS != null && mod.budget > MAX_MATERIALS) {
    FAIL(`${mod.file} calls finish(budget=${mod.budget}) against MAX_MATERIALS `
      + `${MAX_MATERIALS} in blender/lib/site.py. A module may spend less than the `
      + 'library allows; it may not raise its own ceiling.');
  }
}

/** Which archetypes are supposed to have a file on disk, and why. */
const expected = new Map();
for (const [id, a] of archetypes) {
  if (!a.model) continue;
  if (a.model !== id) {
    FAIL(`archetype "${id}" declares model: "${a.model}". terrain.js fetches `
      + `models/sites/<model>.glb and this gate, the module name and the `
      + 'archetype id are then three different strings. The filename must be the '
      + 'ARCHETYPE ID VERBATIM (ASTRA §4 contract 4).');
  }
  if (!modules.has(a.model)) {
    FAIL(`archetype "${id}" asks for models/sites/${a.model}.glb and there is no `
      + `blender/sites/${a.model.replace(/-/g, '_')}.py to build it. The model is `
      + 'then whatever happens to be on disk, from a source nobody can rebuild.');
  }
  /* ── THE SUPPRESSION KNOBS MUST BE DECLARED. THE LIST MAY BE EMPTY. ──────
     THIS RULE USED TO BE "the list must be NON-EMPTY", and it was wrong. It
     failed exactly four archetypes — underground-drive, exploration-pad,
     platform-deck, marine-spread — every one of which declares `replaces: []`
     with its reason written beside it, and it failed them with the words
     "declares no `replaces:`", which was false about all four (the reader
     above could not tell `[]` from absent; see the note there).

     Three measurements retired it. All taken 2026-09-06 on this tree:

     1. A NON-EMPTY LIST NEVER ONCE BOUGHT THE MODEL BACK. The net-cost A/B in
        `tools/checksiteenvironment.mjs` — meshes under `terrain-root` with the
        model live minus the same build 404'd — is ADDITIVE for all nine
        surface/offshore archetypes: urban-plot +1, open-pit-bench +2,
        infrastructure-corridor +3, quarry-bench +3, tunnel-portal +4,
        platform-deck +4, exploration-pad +5, well-pad +5, marine-spread +6.
        The five with the longest `replaces` lists are additive too. So this
        test sorted archetypes by whether they had written a list, not by what
        anything cost, and the rule it cited ("must give the calls back") was
        met by NONE of them, listed or not.

     2. ON THE OFFSHORE PLANE IT WAS UNSATISFIABLE, AND THE CHECK IMMEDIATELY
        BELOW IS WHY. `dressFor()` returns all-zero counts on a deck, so
        `addInstances()` is never called there: `siteSuppression.offered` for
        `platform-deck` and `marine-spread` is the EMPTY SET over all seven
        regions the gates walk (21 builds each, measured). Any name they could
        have written would be a suppression that suppresses nothing — the very
        thing the loop below fails, and that `checksiteenvironment.mjs` fails
        again against a live build. One rule demanded a name; another forbade
        every name available. That is a broken rule, not broken data.

     3. WHERE IT WAS SATISFIABLE IT WAS DESTRUCTIVE. `replaces` drops a whole
        InstancedMesh out to 60 m+ to buy one draw call. On `exploration-pad`,
        0-12 scatter instances per region fall inside the model's footprint at
        all; in nordic `replaces: ['stones']` would delete 43 stones to save
        one call, 42 of them nowhere near the model. Underground, the three
        drive scatters exist but the model carries no rock, so naming one
        empties the drive.

     WHAT IS GRADED NOW: that the decision is DECLARED (an omission is an
     undeclared decision and stays a hard failure — that is what the old rule
     was really reaching for); that every NAME in a non-empty list is real;
     and that the COST is visible, printed below beside the model's own
     primitive count. The cost is ENFORCED where it is measured against a live
     build, by `tools/checksiteenvironment.mjs`'s per-archetype net ceilings.
     A static gate cannot measure a draw call and must not pretend to. */
  if (a.replaces === null) {
    FAIL(`archetype "${id}" loads a site model and does not declare \`replaces:\` at all. `
      + 'A .glb costs one draw call per material and `addInstances()` is the ONLY place '
      + 'that cost can be paid back, so which scatters the model takes over is a real '
      + 'decision — and omitting it is an undeclared decision, not a safe default. '
      + '`replaces: []` IS a legal answer (four archetypes give it, with reasons); '
      + 'no answer is not. See THE EMPTY-LIST RULE at the head of ARCHETYPES.');
  }
  if (a.replacesKit === null) {
    FAIL(`archetype "${id}" loads a site model and does not declare \`replacesKit:\`. `
      + 'Leaving the procedural kit on double-dresses the plot — the .glb\'s authored '
      + 'hoarding standing inside the procedural one; turning it off can empty the '
      + 'plot. Both are wrong by accident and only one is right on purpose. State '
      + 'which. (checksiteenvironment.mjs asserts the same thing against a live build.)');
  }
  /* AND THE NAMES IN IT MUST BE REAL. `addInstances()` returns null only when
     `arch.replaces.includes(name)`, so a `replaces` entry that matches no
     scatter gives back exactly nothing — and it reads like a saving. That is
     the declared-contract-with-no-consumer pattern (ASTRA §10) applied to a
     draw-call budget, which is the one place in this project where a
     plausible-looking zero is most expensive. */
  for (const q of a.replaces || []) {
    if (!scatterNames.has(q) && ![...scatterNames].some((s) => s.endsWith('-') && q.startsWith(s))) {
      FAIL(`archetype "${id}" declares replaces: "${q}", and no addInstances() call in `
        + 'src/world/terrain.js is named that. It gives back ZERO draw calls while '
        + `reading as a saving. Known scatters: ${[...scatterNames].sort().join(', ')}.`);
    }
  }
  if (a.plane === 'underground') {
    /* WHETHER THE UNDERGROUND PATH CAN ATTACH IS MEASURED, NOT ASSERTED.
       This used to FAIL unconditionally, on the strength of a sentence about
       `rebuild()` returning inside `if (ugSpec)` before `attachSiteModel()`
       with `siteModelReady()` hard-coded `!ugSpec`. That WAS true, and it is
       the reason this check exists. It has since been fixed: `siteParent()`
       returns `driveGroup` for an underground archetype and `siteModelReady()`
       is now a PLANE test. A hardcoded claim inside a gate is the same bug
       wearing a lab coat -- `check:haptics` printed "drilling.js does not
       forward h.kind" for weeks after drilling.js started forwarding it. So
       read terrain.js and say what is actually there. */
    const parentsToDrive = /function siteParent\(\)\s*\{[^}]*plane\s*===\s*'underground'[^}]*driveGroup/.test(TERRAIN_SRC);
    const readyIsPlaneTest = /function siteModelReady\(\)\s*\{[\s\S]{0,400}?sitePlaneMatches\(\)/.test(TERRAIN_SRC);
    if (!parentsToDrive || !readyIsPlaneTest) {
      FAIL(`archetype "${id}" is plane "underground" and declares model: "${a.model}", `
        + 'but the underground attach path in src/world/terrain.js does not support it: '
        + `siteParent() ${parentsToDrive ? 'does' : 'does NOT'} return driveGroup for an `
        + `underground archetype, and siteModelReady() ${readyIsPlaneTest ? 'is' : 'is NOT'} `
        + 'a plane test. Until both hold, the .glb is fetched, parsed, logged as loaded, '
        + 'counted in the budget -- and never drawn. ASTRA section 10, the silent fallback.');
    } else {
      note.push(`"${id}" is underground and the attach path supports it: siteParent() returns `
        + 'driveGroup (so the model inherits DRIVE_YAW 0.73787 rad) and siteModelReady() '
        + 'is a plane test. Verified against terrain.js, not assumed.');
    }
  }
  expected.set(a.model, { archetype: id, module: modules.get(a.model) });
}

/* ── DOES `replacesKit: true` HAVE A CONSUMER? MEASURED, PER BRANCH. ────────
   `replacesKit` is read in exactly one place — `kitSuperseded()` — and that
   function is only useful if the archetype's own branch of `buildSiteKit()`
   calls it. For nine archetypes that declared `true`, only TWO branches did.
   The other seven drew their procedural furniture ON TOP of a live .glb, which
   is precisely the double-dressing the flag exists to prevent, and nothing
   anywhere said so: `checksiteenvironment.mjs` asserts that the flag is
   DECLARED and that `siteSuppression.kitSuperseded` agrees with it, never that
   a branch OBEYS it. A declared contract with no consumer (ASTRA §10), and it
   had a measured consequence — `marine-spread` stood an 11.55 m procedural
   drill tower on the collar, through the mast of whatever rig was there, while
   `blender/sites/marine_spread.py:93-96` omitted its own tower explicitly
   BECAUSE it believed this branch "has to be gated off when this model is
   live". The module abstained on the strength of a gate that did not exist.

   WARN, NOT FAIL, and the distinction is deliberate. Closing one of these
   means deciding that a specific .glb really does author what a specific
   procedural branch draws, and that is a composition judgement belonging to
   the archetype's builder and its critic — the same reason quarry-bench's net
   overspend is recorded in terrain.js rather than fixed by the loader. What
   this check guarantees is that the gap is COUNTED and NAMED on every run
   instead of being invisible, which is how it survived to nine declarers. */
{
  /* MEASURE EVERY BRANCH FIRST, THEN JUDGE, so the warning can name the
     branches that ARE guarded instead of carrying a list in its own text. The
     hardcoded version of that sentence read "as `urban`, `quarry` and `marine`
     do" and, the first time `marine` was the branch being warned about, it
     told the reader to copy the file it was complaining about. Small, and
     exactly the shape of the `check:haptics` bug (ASTRA §10): a claim inside a
     gate that the gate does not re-derive. */
  const looked = [];
  for (const [id, a] of archetypes) {
    if (!a.model || a.replacesKit !== true || !a.kit) continue;
    /* `kit === 'wellpad'` and `kit === 'desert'` share one `if`, so search for
       this archetype's kit anywhere in a condition, then read the WHOLE
       condition to see whether `kitSuperseded()` is in it. */
    const hits = kitBranches(a.kit);
    if (!hits.length) {
      FAIL(`archetype "${id}" declares kit: "${a.kit}" and src/world/terrain.js has no `
        + `\`if (kit === '${a.kit}'\` branch in buildSiteKit(). Either the kit name is a `
        + 'typo — in which case the archetype is dressed by nothing and the plot is bare '
        + '— or this reader has gone stale. Fix whichever it is.');
      continue;
    }
    looked.push({
      id, kit: a.kit,
      line: TERRAIN_CODE.slice(0, hits[0].index).split('\n').length,
      guarded: hits.some((h) => h[1].includes('kitSuperseded')),
    });
  }
  const gated = looked.filter((x) => x.guarded);
  const example = gated.length
    ? `as \`${gated.map((x) => x.kit).join('`, `')}\` already do`
    : 'nothing in this file does it yet, so copy the shape from `kitSuperseded()` itself';
  for (const x of looked.filter((y) => !y.guarded)) {
    WARN(`archetype "${x.id}" declares \`replacesKit: true\`, but its branch `
      + `\`if (kit === '${x.kit}'…)\` at src/world/terrain.js:${x.line} never calls `
      + '`kitSuperseded()`, so the flag suppresses nothing and the procedural kit draws '
      + `ON TOP of the live .glb. Either guard the branch — \`&& !kitSuperseded()\`, ${example} `
      + '— or set `replacesKit: false` and say in the archetype why double-dressing is '
      + 'right there. A flag with no consumer is not a safe default; it reads exactly '
      + 'like one that works (ASTRA §10).');
  }
  count('replacesKit branches that really consult kitSuperseded()', gated.length,
    `of ${looked.length} archetypes that declare the flag`
    + (gated.length ? ` — gated: ${gated.map((x) => x.kit).join(' ')}` : ''));
}

if (count('archetypes that declare a site model', expected.size) === 0) {
  FAIL('NO archetype in src/world/terrain.js declares a `model:`, so this gate has '
    + 'nothing to grade and would report OK over an empty set forever — the exact '
    + 'shape of the checkreach failure in ASTRA §10. If sites are genuinely not '
    + 'modelled yet, this gate should not be in `npm run check` yet either.');
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. THE DIRECTORY — what is there, what is missing, what should not be
   ═══════════════════════════════════════════════════════════════════════════ */
const DIR = join(ROOT, 'public/models/sites');
/** Recursive on purpose: `readdirSync` is not, and a .glb one level down would
    be invisible to every check below while this file went on printing OK. */
const walk = (dir, prefix = '') => (existsSync(dir)
  ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory()
    ? walk(join(dir, e.name), prefix + e.name + '/')
    : [prefix + e.name]))
  : []);

const present = existsSync(DIR) ? walk(DIR) : null;
if (present === null) {
  FAIL(`${rel(DIR)}/ does not exist. Site models are gitignored build output — run `
    + '`npm run blender` (or `npm run blender:sites`). A procedural fallback is not '
    + 'a verified model, and this gate refuses to pass over a directory that is not '
    + 'there.');
} else if (!present.length) {
  FAIL(`${rel(DIR)}/ is empty — nothing has been exported. Build it with `
    + '`npm run blender:sites`. THIS IS A FAILURE AND NOT A PASS: a gate that finds '
    + 'no files and reports OK is the checkreach failure (ASTRA §10), and it would '
    + 'go on reporting OK for as long as the directory stayed empty.');
}

const files = (present || []).filter((f) => f.toLowerCase().endsWith('.glb'));
for (const f of (present || [])) {
  if (!f.toLowerCase().endsWith('.glb')) {
    FAIL(`${rel(DIR)}/${f} is not a .glb. Nothing loads it, and `
      + '`vite build` copies public/ verbatim, so it ships anyway. '
      + 'Delete it or move it out of public/.');
  } else if (f.includes('/')) {
    FAIL(`${rel(DIR)}/${f} is in a subdirectory. terrain.js builds its URL as `
      + '`models/sites/<archetype>.glb` with no nesting, so this file can never be '
      + 'requested — and it ships anyway.');
  }
}

const seen = new Set();
for (const f of files.filter((x) => !x.includes('/'))) {
  const stem = f.slice(0, -4);
  seen.add(stem);
  if (expected.has(stem)) continue;
  const hyphenated = stem.replace(/_/g, '-');
  const mb = (statSync(join(DIR, f)).size / 1048576).toFixed(2);
  if (hyphenated !== stem && archetypes.has(hyphenated)) {
    FAIL(`${f} WILL NEVER LOAD — the archetype is "${hyphenated}". `
      + `${mb} MB of authored site that the game silently replaces with the `
      + 'procedural kit. This is the underscore-for-hyphen mistake that left six '
      + 'of eight MACHINES off screen for a week (ASTRA §4 contract 4); '
      + "blender/sites modules must export `mid.replace('_', '-') + '.glb'`.");
  } else if (archetypes.has(stem)) {
    FAIL(`${f} is named for archetype "${stem}", which declares no \`model:\` in `
      + `src/world/terrain.js. ${mb} MB that ships in the build and is never `
      + 'fetched. Either declare the model on the archetype or delete the export.');
  } else {
    FAIL(`${f} is named for no archetype at all. ${mb} MB of unrequestable file in a `
      + 'directory that ships verbatim. The loader only ever asks for '
      + '`models/sites/<archetype id>.glb`.');
  }
}
for (const [id, e] of expected) {
  if (!seen.has(id)) {
    FAIL(`models/sites/${id}.glb is MISSING. Archetype "${e.archetype}" asks for it `
      + `every time that site is built, gets an HTTP 404, logs one line and draws `
      + `the procedural kit instead. Build it: ${e.module ? e.module.file : 'no module'}.`);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. THE FILES THEMSELVES
   ═══════════════════════════════════════════════════════════════════════════ */
const NAMED_RE = /^(pivot:|slide:|mount:|aim:)/;      // terrain.js's own regex
const f3 = (n) => (Math.abs(n) < 5e-4 ? 0 : n).toFixed(3);

/** Compose a node's world translation from the chain of stated transforms. */
function worldPos(nodes, parentOf, index) {
  const chain = [];
  for (let i = index; i !== undefined; i = parentOf.get(i)) chain.unshift(i);
  let p = [0, 0, 0];
  let rooted = chain.length === 1;
  for (const i of chain) {
    const n = nodes[i];
    if (n.matrix) {
      const m = n.matrix;
      p = [
        m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
        m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
        m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
      ];
      continue;
    }
    const s = n.scale || [1, 1, 1];
    const q = n.rotation || [0, 0, 0, 1];
    const t = n.translation || [0, 0, 0];
    const v = [p[0] * s[0], p[1] * s[1], p[2] * s[2]];
    const [x, y, z, w] = q;
    // v + 2 * cross(q.xyz, cross(q.xyz, v) + w * v)
    const cx = y * v[2] - z * v[1] + w * v[0];
    const cy = z * v[0] - x * v[2] + w * v[1];
    const cz = x * v[1] - y * v[0] + w * v[2];
    p = [
      v[0] + 2 * (y * cz - z * cy),
      v[1] + 2 * (z * cx - x * cz),
      v[2] + 2 * (x * cy - y * cx),
    ];
    p = [p[0] + t[0], p[1] + t[1], p[2] + t[2]];
  }
  return { p, rooted };
}

/** Every `extras` key a site publishes must have a reader in `src/`. */
const SRC_TEXT = (function readSrc(dir) {
  let out = '';
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out += readSrc(join(dir, e.name));
    else if (e.name.endsWith('.js')) out += readFileSync(join(dir, e.name), 'utf8');
  }
  return out;
}(join(ROOT, 'src')));

let filesChecked = 0;
let vertexTotal = 0;
let materialChecks = 0;
let anchorChecks = 0;
const rows = [];

for (const id of [...expected.keys()].sort()) {
  const file = `${id}.glb`;
  const path = join(DIR, file);
  if (!existsSync(path)) continue;                    // already failed above
  let g;
  let bin;
  let bytes;
  try {
    bytes = statSync(path).size;
    if (!bytes) throw new Error('the file is ZERO BYTES — an interrupted export, not a model');
    ({ json: g, bin } = parseGLB(readFileSync(path)));
  } catch (e) {
    FAIL(`${file}: unreadable — ${e.message}. terrain.js checks the GLB magic before `
      + 'parsing and falls back to the procedural kit, so this is silent in game.');
    continue;
  }
  filesChecked++;
  const say = (m) => FAIL(`${file}: ${m}`);

  if (!g.nodes?.length || !g.meshes?.length || !g.materials?.length) {
    say(`the file parses but declares nodes=${g.nodes?.length || 0} `
      + `meshes=${g.meshes?.length || 0} materials=${g.materials?.length || 0}. `
      + 'A .glb that parses and contains nothing loads without a single error and '
      + 'draws nothing; the procedural kit is suppressed by `replaces` all the same.');
    continue;
  }

  /* ── 3a. geometry actually exported ─────────────────────────────────────
     `measure()` is glbinfo's, transforming every real vertex. It throws on
     compressed geometry, refuses to report a bound it cannot measure, and
     reports every primitive it could not read rather than skipping it (a
     skipped primitive makes a model come out SMALLER, which is
     indistinguishable from a model that is correctly small). */
  let m;
  try {
    m = measure(g, bin);
  } catch (e) {
    say(`DIMENSIONS UNMEASURABLE — ${e.message}`);
    continue;
  }
  if (m.unreadable.length) {
    say(`geometry INCOMPLETE: ${m.unreadable.join('; ')}. A model this ruler cannot `
      + 'fully read is one whose size cannot be trusted in either direction.');
    continue;
  }
  if (m.empty) {
    say('no positioned geometry — the file has meshes and materials and NOT ONE '
      + 'VERTEX in the scene. It parses, it attaches, it draws nothing.');
    continue;
  }

  /* Scene reachability, and the vertex count that proves something is there. */
  const nodes = g.nodes;
  const sceneIndex = g.scene === undefined ? 0 : g.scene;
  const roots = (g.scenes || [])[sceneIndex]?.nodes || [];
  const parentOf = new Map();
  nodes.forEach((n, i) => (n.children || []).forEach((c) => parentOf.set(c, i)));
  const reachable = new Set();
  const stack = [...roots];
  while (stack.length) {
    const i = stack.pop();
    if (reachable.has(i)) continue;
    reachable.add(i);
    for (const c of nodes[i]?.children || []) stack.push(c);
  }
  const orphans = nodes.map((n, i) => i).filter((i) => !reachable.has(i));
  if (orphans.length) {
    say(`${orphans.length} node(s) are not reachable from the scene `
      + `(${orphans.map((i) => nodes[i].name || `#${i}`).slice(0, 6).join(', ')}). `
      + 'They ship in the file and can never be drawn.');
  }

  let prims = 0;
  let verts = 0;
  let tris = 0;
  const usedMesh = new Set();
  for (const i of reachable) {
    const n = nodes[i];
    if (n.mesh === undefined) continue;
    const mesh = g.meshes[n.mesh];
    if (!mesh) { say(`node "${n.name || `#${i}`}" references mesh ${n.mesh}, which does not exist.`); continue; }
    usedMesh.add(n.mesh);
    for (const p of mesh.primitives || []) {
      prims++;
      if (p.material === undefined) {
        say(`a primitive of mesh "${mesh.name || n.mesh}" has NO MATERIAL. three.js `
          + 'gives it a default with an empty name, and terrain.js\'s swapSiteMaterials '
          + 'then logs "a material arrived with no name" and leaves the mesh unbound.');
      }
      const pos = g.accessors?.[p.attributes?.POSITION];
      verts += pos?.count || 0;
      const mode = p.mode === undefined ? 4 : p.mode;
      if (mode !== 4) {
        say(`a primitive of mesh "${mesh.name || n.mesh}" has mode ${mode}. The site `
          + 'pipeline exports triangles; anything else is an authoring accident.');
      } else {
        tris += (p.indices !== undefined ? g.accessors[p.indices].count : (pos?.count || 0)) / 3;
      }
    }
  }
  const deadMeshes = (g.meshes || []).map((x, i) => i).filter((i) => !usedMesh.has(i));
  if (deadMeshes.length) {
    say(`${deadMeshes.length} mesh(es) are referenced by no node in the scene. Their `
      + 'vertex data ships and never draws.');
  }
  if (!verts) {
    say('MEASURED ZERO VERTICES across every drawn primitive. Refusing to call that '
      + 'a pass (ASTRA §10).');
  }
  vertexTotal += verts;

  /* ── 3b. materials ─────────────────────────────────────────────────────── */
  const names = (g.materials || []).map((x) => x.name);
  const distinct = new Set(names);
  materialChecks += distinct.size;
  if (!distinct.size) {
    say('declares no materials. Every mesh then arrives with three.js\'s default '
      + 'material and no name at all.');
  }
  for (const [i, n] of names.entries()) {
    if (typeof n !== 'string' || !n) {
      say(`material #${i} has no name. A .glb ships material NAMES ONLY — assets.js `
        + 'makes the surface at runtime — so an unnamed material is a mesh the '
        + 'runtime cannot resolve at all (rig.py contract 2).');
    }
  }
  const unknown = [...distinct].filter((n) => n && !kinds.has(n));
  if (unknown.length) {
    say(`asks for material(s) src/core/assets.js cannot make: ${unknown.join(', ')}. `
      + 'THIS DOES NOT THROW AT RUNTIME — resolve() falls through to rawSteel and logs '
      + 'one line. That is how every chassis, track guard and walkway on all 17 '
      + 'machines rendered as bright bare metal for the life of the pipeline '
      + '(ASTRA §4 contract 2). Add the kind to assets.js or use an existing one.');
  }

  /* THE BUDGET, from blender/lib/site.py, at the other end of the pipeline.
     `finish()` enforces it before the file is written; this enforces it on the
     file that is actually on disk, because a hand-copy under the right name is
     exactly what hid the machine-filename bug for a week. */
  const budget = expected.get(id)?.module?.budget ?? MAX_MATERIALS;
  if (budget != null) {
    if (distinct.size > budget) {
      say(`uses ${distinct.size} materials against a budget of ${budget} `
        + `(${[...distinct].sort().join(', ')}). A site .glb costs ONE DRAW CALL PER `
        + 'MATERIAL once finish() joins the statics, out of a surface band already '
        + 'over its ceiling of 80 in eight of twenty-one method states. Merge two '
        + 'near-identical surfaces; do not raise the number without a new '
        + 'measurement (THE BUDGET in blender/lib/site.py).');
    }
    if (prims > budget) {
      say(`submits ${prims} primitives against a budget of ${budget}. The primitive `
        + 'count is the DRAW-CALL FLOOR — glTF draws one primitive at a time and no '
        + 'runtime cleverness gets below it. terrain.js only warns about this at '
        + 'load; here it stops the build.');
    }
  }

  /* ── 3c. TRANSMISSION — the rule that has been broken three times ──────── */
  const exts = new Set([...(g.extensionsUsed || []), ...(g.extensionsRequired || [])]);
  const glassy = (g.materials || [])
    .map((x, i) => [x.name || `#${i}`, x.extensions?.KHR_materials_transmission])
    .filter(([, e]) => e)
    .map(([n, e]) => `${n} transmissionFactor=${e.transmissionFactor ?? 1}`);
  if (exts.has('KHR_materials_transmission') || glassy.length) {
    say('CARRIES TRANSMISSION' + (glassy.length ? ` (${glassy.join('; ')})` : '')
      + '. Never set transmission above 0, on anything, at any size: three.js '
      + 're-renders the WHOLE opaque list into a transmission target, measured at '
      + '+65 to +81 DRAW CALLS independent of object size. One cab window doubled '
      + 'the entire rig fleet\'s cost. This has been found three separate times in '
      + 'this codebase (ASTRA §1.6). A glazed surface is the material name "glass" '
      + 'and nothing else — assets.js makes it opaque on purpose.');
  }
  if (exts.has('KHR_materials_volume')) {
    say('declares KHR_materials_volume, which Blender only writes alongside '
      + 'transmission. Whatever produced it, the transmission rule is being '
      + 'reached around.');
  }

  /* ── 3d. materials are NAMES, not surfaces ─────────────────────────────── */
  if ((g.images || []).length || (g.textures || []).length) {
    say(`ships ${(g.images || []).length} image(s) and ${(g.textures || []).length} `
      + 'texture(s). A baked map opts the object out of the wear system AND spends '
      + 'the texture budget twice; terrain.js discards it with a warning nobody '
      + 'reads, so the bytes ship and buy nothing.');
  }
  if ((g.animations || []).length) {
    say(`ships ${g.animations.length} animation clip(s). terrain.js never creates an `
      + 'AnimationMixer for a site — it clones the scene and binds materials — so '
      + 'these can never play. A declared contract with no consumer (ASTRA §10).');
  }
  if ((g.skins || []).length) say(`ships ${g.skins.length} skin(s); the site path has no skinning.`);
  if ((g.cameras || []).length) say(`ships ${g.cameras.length} camera(s); the game owns its cameras.`);
  if (exts.has('KHR_lights_punctual')) {
    say('ships punctual lights. `src/core/env.js` owns EVERY light in the game and '
      + 'grades the scene against them; a light cloned in from a site .glb is '
      + 'outside that entirely.');
  }
  if (exts.has('KHR_draco_mesh_compression')) {
    say('is Draco-compressed. terrain.js installs the MESHOPT decoder and no Draco '
      + 'decoder at all, so this file fails to parse in game.');
  }

  /* ── 3e. ORIGIN, ANCHORS AND THE DATUM ─────────────────────────────────── */
  const prefixed = [...reachable].map((i) => [i, nodes[i]]).filter(([, n]) => NAMED_RE.test(n.name || ''));
  const byName = new Map();
  for (const [i, n] of prefixed) {
    if (byName.has(n.name)) {
      say(`declares TWO nodes called "${n.name}". terrain.js indexes named nodes into `
        + 'a Map keyed by name, so one of them is silently discarded and which one '
        + 'survives is traversal order, not a decision.');
    } else byName.set(n.name, i);
  }

  const collar = byName.get('mount:site-collar');
  if (collar === undefined) {
    say('has no "mount:site-collar". That anchor IS the origin contract: '
      + 'attachSiteModel() does `node.position.set(0, 0, 0)` because "the .glb\'s '
      + 'origin IS the collar", and without the anchor nothing states where the '
      + 'author believed the hole was, so nobody can ever check it.');
  } else {
    anchorChecks++;
    const { p, rooted } = worldPos(nodes, parentOf, collar);
    const off = Math.hypot(p[0], p[1], p[2]);
    if (off > 1e-3) {
      say(`"mount:site-collar" is ${f3(off)} m from the file's origin `
        + `(${p.map(f3).join(', ')}). terrain.js attaches the model at (0,0,0) and `
        + 'the collar is where the hole is, so the whole site is offset by that '
        + 'much under the machine. `finish()`\'s join has relocated mount: nodes '
        + 'before — it deletes what it eats and children do not keep their world '
        + 'transform — and the export still contained a node with the right NAME, '
        + 'which is why "did the name survive?" passed (ASTRA §4 contract 1).'
        + (rooted ? '' : ' (position composed through a parent chain)'));
    }
  }

  const d = [m.all.max[0] - m.all.min[0], m.all.max[1] - m.all.min[1], m.all.max[2] - m.all.min[2]];
  /* THE DATUM. terrain.js flattens the ground to y = 0 around the collar
     (`padRadius` "fully flat"), heightAt() returns a hard 0 on an offshore
     deck, and the model is attached at exactly (0,0,0). So a site must MEET
     y = 0 and must STAND UP from it. */
  if (m.all.max[1] <= 0) {
    say(`is entirely at or below the ground datum (y ${f3(m.all.min[1])}..`
      + `${f3(m.all.max[1])}). The whole site is buried and the machine stands on `
      + 'bare procedural ground with a hidden model under it. A sign flip on the '
      + 'vertical datum looks exactly like this.');
  } else if (m.all.min[1] > 0.05) {
    say(`floats: its lowest vertex is at y ${f3(m.all.min[1])}, above the ground `
      + 'datum. terrain.js attaches at (0,0,0) on ground flattened to y = 0, so '
      + 'nothing on this site touches the ground it is standing on.');
  } else if (m.all.max[1] < 0.5) {
    say(`is ${f3(m.all.max[1])} m tall at its highest point. A site is furniture and `
      + 'evidence of work — structures, plant, markings, spoil. Something this flat '
      + 'is a decal, and the ground mesh already exists in terrain.js.');
  }

  /* ORIENTATION SMOKE TEST — and it is a smoke test, not a measurement.
     blender/lib/site.py: Blender +Y maps to three.js -Z, so anything meant to
     stand BEHIND the work and close the sky goes at Blender +Y and anything in
     the foreground at Blender -Y; getting it backwards "puts the site's whole
     subject off-camera, and it will not be obvious in the Blender viewport".
     The hero camera is out at three.js z = +9.90 looking back at the collar.
     The threshold below is CALIBRATED, not sourced: quarry-bench reaches 2.58x
     further behind the collar than in front of it and urban-plot 5.37x, so a
     site that reaches more than twice as far TOWARD the camera as away from it
     has almost certainly been built with the sign of Blender Y reversed. It is
     deliberately loose enough that a symmetric deck cannot trip it. */
  /* PLANE-AWARE. The rule above is a SURFACE rule: it assumes open sky the
     model is meant to close behind the work. In a DRIVE the player is
     INSIDE the excavation, there is no backdrop and no sky, and the space
     between the machine's tail and the eye is the only place furniture can
     legitimately stand. Two independent measurements agreed on this before
     it was relaxed: the underground builder staged its laydown there on
     purpose, and the collar analysis recorded "-Y is correct there ... not a
     sign error". Applying the surface rule underground produced a FAIL
     against a correct model, which is a false finding from the instrument
     (ASTRA section 5) -- so say what was skipped rather than skipping it
     silently. */
  const behind = Math.max(0, -m.all.min[2]);
  const front = Math.max(0, m.all.max[2]);
  const ownArch = archetypes.get(expected.get(id)?.archetype);
  if (ownArch && ownArch.plane === 'underground') {
    note.push(`${file}: backdrop-orientation test SKIPPED — plane "underground". `
      + `It reaches ${f3(front)} m toward the eye and ${f3(behind)} m away, which on a `
      + 'surface site would fail as a reversed Blender Y. In a drive it is correct: '
      + 'the player is inside the excavation and the space between the machine and '
      + 'the eye is where staged material belongs.');
  } else if (front > 2 * Math.max(0.1, behind)) {
    say(`reaches ${f3(front)} m toward the camera and only ${f3(behind)} m away from `
      + 'it. blender/lib/site.py maps Blender +Y to three.js -Z, so the backdrop — '
      + 'highwall, headwall, hoarding, facades — belongs BEHIND the collar at '
      + 'Blender +Y. This looks like the sign of Blender Y reversed, which puts the '
      + "site's whole subject off camera and is invisible in the Blender viewport.");
  }

  /* EXTRAS WITH NO READER. ASTRA §10's second pattern: something publishes a
     field that reads correct and complete and nothing anywhere consumes it.
     Reported rather than failed — see LIMITS in the tool's report. */
  for (const [, n] of prefixed) {
    for (const k of Object.keys(n.extras || {})) {
      if (!SRC_TEXT.includes(k)) {
        WARN(`${file}: "${n.name}" publishes extras.${k} = ${JSON.stringify(n.extras[k])} `
          + 'and no file under src/ mentions that name. A declared contract with no '
          + 'consumer (ASTRA §10) — give it a reader or drop it.');
      }
    }
  }

  rows.push({
    id, bytes, prims, tris: Math.round(tris), verts,
    mats: distinct.size, budget,
    w: d[0], h: d[1], l: d[2],
    y0: m.all.min[1], y1: m.all.max[1], behind, front,
    anchors: [...byName.keys()].sort(),
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT — every count printed, and a zero is a failure
   ═══════════════════════════════════════════════════════════════════════════ */
count('site .glb files read', filesChecked);
count('vertices measured', vertexTotal, 'across every site, via glbinfo.measure()');
count('material names resolved against assets.js', materialChecks);
count('site-collar anchors located', anchorChecks);

if (rows.length) {
  console.log('');
  console.log('site                     bytes  draws/budget   tris    verts'
    + '      W       H       L    ground   behind    front');
  for (const r of rows.sort((a, b) => a.id.localeCompare(b.id))) {
    console.log(r.id.padEnd(24)
      + String(r.bytes).padStart(9)
      + `${r.prims}/${r.mats} of ${r.budget}`.padStart(14)
      + String(r.tris).padStart(7)
      + String(r.verts).padStart(9)
      + f3(r.w).padStart(7) + f3(r.h).padStart(8) + f3(r.l).padStart(8)
      + f3(r.y0).padStart(10) + f3(r.behind).padStart(9) + f3(r.front).padStart(9));
  }
  console.log('');
  for (const r of rows) console.log(`   ${r.id}  anchors: ${r.anchors.join(' ') || '(none)'}`);
  console.log('');
  console.log('draws/budget is PRIMITIVES/DISTINCT MATERIALS against the module budget.');
  console.log('All bounds are glbinfo.measure() — every vertex transformed (ASTRA §5).');

  /* ── WHAT EACH MODEL COSTS, BESIDE WHAT IT HANDS BACK ────────────────────
     The rule this gate enforces is that the decision is DECLARED, not that
     the list is long (see THE SUPPRESSION KNOBS above). That is only honest
     if the number the old rule was reaching for is still on the screen, so
     it is printed here: one draw call per distinct material, against the
     scatters the archetype gives up. `replaces: []` costs the model's full
     price and this table says so in figures rather than leaving it to a
     comment. The NET figure — what it costs after the terrain build actually
     runs — is measured against a live build by
     `tools/checksiteenvironment.mjs`; this column is the gross. */
  console.log('');
  console.log('archetype                 costs  gives back                                  kit');
  for (const r of rows.sort((a, b) => a.id.localeCompare(b.id))) {
    const a = archetypes.get(r.id);
    if (!a) continue;
    const gives = a.replaces === null ? 'UNDECLARED'
      : a.replaces.length ? a.replaces.join(' ')
        : '[] (declared empty — see the archetype)';
    const kit = a.replacesKit === null ? 'UNDECLARED'
      : a.replacesKit === false ? 'kept'
        /* THE SAME READER THE WARN ABOVE USES, deliberately: this column and
           that warning are one fact, and two readers of one fact drift until
           the wrong one is believed (ASTRA §5). */
        : (a.kit && kitBranches(a.kit).some((h) => h[1].includes('kitSuperseded'))
          ? 'dropped' : 'DECLARED, NOT GATED');
    console.log(r.id.padEnd(24) + String(r.mats).padStart(6) + '  ' + gives.padEnd(44) + kit);
  }
  console.log('');
  console.log('costs is DISTINCT MATERIALS = the model\'s draw calls. gives back is `replaces`.');
  console.log('Neither column is the net cost: tools/checksiteenvironment.mjs measures that');
  console.log('against a live terrain build, and every archetype is net ADDITIVE today.');
}

console.log('');
for (const [label, { n, why }] of counted) {
  console.log(`counted  ${String(n).padStart(6)}  ${label}${why ? '  — ' + why : ''}`);
}
const zero = [...counted].filter(([, v]) => v.n === 0).map(([k]) => k);
if (zero.length) {
  FAIL(`these checks measured NOTHING: ${zero.join('; ')}. A gate over an empty set `
    + 'passes forever (ASTRA §10) — so this one does not pass.');
}

console.log('');
for (const n of note) console.log('NOTE  ' + n);
for (const w of warn) console.log('WARN  ' + w);
if (fail.length) {
  console.error('');
  for (const f of fail) console.error('FAIL  ' + f);
  console.error(`\nCHECKSITES FAIL  ${fail.length} problem(s). A fallback that works is the `
    + 'most expensive kind of failure: it removes the symptom and keeps the cause.');
  process.exit(1);
}
console.log(`CHECKSITES OK  ${filesChecked} site model(s), ${materialChecks} material name(s), `
  + `${vertexTotal} vertices measured, ${warn.length} warning(s).`);
