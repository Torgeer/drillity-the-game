# DRILLITY I THE GAME — handover

## Continuation 2026-09-05 — Blender pipeline, first module

The historical assessment below remains a baseline, not current verification.
Latest work: `research/19-oem-visual-pass.md` documents references and limits.

- Fixed the undeclared `boreExag` which actually prevented startup in this checkout.
- Connected the configured Blender MCP to Blender 5.2.1; authored a compact
  rotary head in a separate scene. Editable source is in the task outputs;
  `tools/blender_compact_head.py` is the reproducible authoring script.
- GLB is loaded at rig init, embedded in the single-file build, and used on
  crawler-lite at HIGH/MEDIUM. LOW retains procedural rotary geometry.
- The rotor and tool outlet survive batching as animation anchors. Top-hammer
  selects the percussive head, while auger selects rotary.
- Corrected duplicated feed end equipment on the starter mast's flex split,
  added crown cheeks/sheave, and moved rails behind the gearbox to avoid overlap.
- Reduced excessive normal-map amplitude on paint, raw/worn steel and chrome.
  UV/material reconstruction remains open; this is not a complete fleet remake.
- `npm run build` passes: facts/data + new model tests, 47 modules, 3,412.72 kB.
  Vite now imports its ESM config directly through `tools/vite.mjs`, fixing the
  restricted-Windows parent-directory error. Dev dependency discovery is disabled.
- New `tools/rig-review.html` provides orbit, close-up, method selection and
  draw-call/triangle readouts using the actual game rig system. Workshop figures
  are NOT full-game or mobile benchmarks.
- Known: jet-grouting warning remains; browser can emit texture-serialization
  warnings. Startup and workshop had no observed console errors after the fix.
- Next: whole compact carrier/positioner/clamps/guarding in Blender, tool/string
  continuity, accurate auger return, then separate foundation and rock-drill families.

---

**For whoever takes this over.** Written 2026-09-04, after a long multi-agent
day. Repo: <https://github.com/Torgeer/drillity-the-game> (public).

Read §1 to know the tree is safe, §2 to know how far off we are, §3 for the only
review that has actually been run, then §9 — **the improvements** — which is
where the leverage is. Everything else is reference.

---

## 1. State of the tree — verified at the moment of writing

| check | result |
|---|---|
| `node --check`, all modules | **27 / 27 parse** |
| `styles.css` braces | **balanced** (644 / 644) |
| `npm run build` | **green** — 45 modules, 2.685 MB single file |
| `tools/checkfacts.mjs` | **pass** |
| `tools/checkdata.mjs` | **pass** — one known warning (`jet-grouting` has no sim tuning) |
| `validateData()` | **0 problems** |
| content | **21 methods · 18 rigs · 260 items** |
| last capture | **12/12 states verified, 0 console errors** (`shots/ind-*`) |

Nothing needs repairing before work resumes.

**Run:** `npm run dev` (5178) · `npm run build` → `dist/index.html`
**Phone:** `npm run preview` binds to the LAN, or open `dist/index.html` on the
device — everything is inlined bar two font hosts.
**Capture:** `node tools/shoot.mjs --headed` — **headless cannot bind the
discrete GPU on this machine**; without `--headed` you get SwiftShader and
meaningless numbers.

### Draw calls, last full capture — all inside budget

```
                    surf  sect   rig     fps
m21-raise-boring      49    35    25   143.9
m09-rotary-kelly      53    16    31   141.9
m12-oil-rotary        57    22    33   143.9
m14-driven-pile       64    17    42   141.9
m17-hdd               65    15    46   143.9
m18-longhole          73    20    56   143.9
m01-auger             76    19    47    26.9   <-- see §9.4
m07-core              78    20    51    26.0   <-- see §9.4
m16-tunnel-jumbo      79    20    62   143.9
m11-rockbolt          80    20    62   143.9
budget                80    60    70      60
```

Underground was 141–172 surface that morning. Three `transmission > 0`
materials were the entire cause — see §8F.

---

## 2. How far from done — about 45 %

| area | state |
|---|---|
| Systems & architecture | **~85 %** |
| Domain accuracy | **~75 %** |
| Performance | **~65 %** |
| **Visual quality** | **~30 %** |
| **Critic acceptance** | **~5 %** |

The estimate went **down** after the first real critic round, which is what a
first review should do. **The game underneath is in good shape; the game you can
see is not.**

---

## 3. The only review that has been run — and it failed everything

`shots/critique-ui-section.md`. Scope was deliberately limited to the UI screens
and the section band, because the surface was mid-rewrite. **FAIL on every shot,
both hard gates.**

**It refused to trust the previous agent's numbers, and two of three were
wrong.** `.hudqa/measure.mjs` measured **a hand-written allowlist of ~19 class
names**, so anything it did not know about was invisible — which is how "0
overlaps" was reported while `rockbolt` had **8**.

### Domain truth (axis 11, weighted double, hard gate)

- **The bit measures 1.36–2.64 m against the depth ruler** while the contract
  says Ø152 mm. **I traced this and the critic's diagnosis is wrong — see §4.**
- **The auger has no flight.**
- Ø262 mm window sampling against 30–150 mm in the repo's own research.

### HUD restraint (axis 7a, hard gate)

- **A DOM leak.** Ordinary navigation grows `.sitedock` **427 → 471 → 515 → 559
  → 603 px, +44 px per visit**; `.screen` nodes 3 → 5. **By the fifth visit the
  dock is 71 % of the screen and the 3D under 30 %** — worse than the 26 %
  baseline that started the HUD work.
- **Split is 67.1/32.9 or 71.6/28.4 against 54/46**, and **190–228 px of the
  section — 49–59 % of it — is rendered under the opaque dock and discarded
  every frame.**
- `.sstrip` measures **135 px live against `LAYOUT.chromeTop`'s declared 52**.
- **Meshes overlay the 3D, which no DOM harness can see**: the drill-log strip,
  the ruler, the callout, the stratum labels. **Torque is stated four ways** in
  one 250×160 block. `.railbtn` is a **12 px** touch target against a 44 px rule.

### False numbers on the results screen

- `SCORE 51 % · grade B` when **B starts at 62 %**.
- `SPEED 18 %` from a hard-coded `avgRop / 45` at **`results.js:327`**, on a job
  whose nominal is 6 m/h where the player did 8.3. **The real breakdown arrives
  in `HOLE_COMPLETE.breakdown` — read the payload, never re-derive.**
- `KW / KNM / M` at `styles.css:1528` → kW, kNm, m.

### Section band — the previous pass's claims did not survive

"6 beds, 5 contacts in 20 m" was false: **2 lithologies plus one marker**. **Both
contacts move together** — a constant-thickness ribbon, not two independent
surfaces. Granite (**55 % of the band**) still at 0.34 m feature size. **The whole
band lives in L\* 0–47 with no highlight at all.** Crack edges blur over
**8.0–8.5 px** vs 5.0 in the surface band. **Nothing moves in any of ten method
frames** (axis 9).

---

## 4. One critic finding I disproved — read this before "fixing" the bore

The critic reported *"there is no borehole"* and a bit **9–17× oversize**. I
traced `applyHoleDiameter()` (~line 2650 of `geology.js`):

```js
holeR = clamp(CFG.holeRBase + (mm / 1000) * CFG.holeRGain, CFG.holeRBase, CFG.holeRMax);
// holeRBase 0.30 · holeRGain 1.6 · holeRMax 1.60 — units are metres (1 section unit = 1 m in Y)
```

For 152 mm: `0.30 + 0.152 × 1.6 = 0.543` → **drawn Ø 1.086 m against a true
0.152 m ≈ 7.1×.** With the over-gauge term in `holeRadius()` (`×1.40` in loose
ground) that reaches 1.52 m; a 300 mm contract reaches 2.18 m. **That brackets
the critic's measured 1.36–2.64 m exactly.**

**The exaggeration is deliberate and necessary.** The code says why: *"the
smallest hole still has to read as a hole."* A 152 mm bore in a 20 m band is
about **1.3 px** — invisible. `holeRBase` is a floor so a 38 mm micropile reads;
`holeRMax` is a ceiling so a 6 m raise bore does not eat the frame.

**The defect is that it is never declared.** The ruler is 1:1 in Y while the bore
is ~7× in X, and nothing says so — the section silently contradicts its own
ruler. The game already solves this honestly elsewhere: **`profile` mode badges
its ~6:1 vertical exaggeration.** Do the same for the bore. **Do not shrink the
hole to 152 mm — it will vanish.**

Still genuinely open: confirm the rock texture and joint network **terminate at
the bore wall** above the bit. `FACE_FRAG` discards on
`if (drilled) { if (dHole < 0.0) discard; }`, and `drilled` is 0 below the bit,
which is correct. Verify against pixels.

---

## 5. The reference library — the day's most durable output

`research/rigs/` was built by a fan-out of read-only agents over the owner's own
catalogue library in `C:\Users\henri\Downloads` (~500 OEM PDFs, ~270 photos):
Bauer's machine catalogue and Kelly-bar books, the Epiroc Boomer spec, four
Junttan piling brochures, the Diamond Driller's Technical Book, EMDE, Klemm,
Comacchio, HP/BL overburden with 3D drawings, BETEK carbide, Mincon.

**14 machines have substantial sourced references. 8 entries are stubs.**

| solid (300–722 lines, 10–49 PDF citations) | stub (28–91 lines) | never written |
|---|---|---|
| `foundation-bg` `cfa-rig` `piling-leader` `tunnel-jumbo` `bolter` `longhole-rig` `core-rig` `rc-rig` `dth-crawler` `crawler-th` `crawler-lite` `si-rig` `cpt-unit` `sonic-truck` | `hdd-rig` `oil-derrick` `raisebore` `cable-percussion` `tools-overburden` `tools-anchors-sda` `tools-bits-carbide` `tools-rods-pipe` | `tools-piling-hammers` `tools-core-dth` `tools-kelly-foundation` `_photos.md` `_gaps.md` |

**Finish the stubs before more modelling.** The workflow script is saved and
re-invokable — see §10. Note the fix that made this run work at all: agents now
**write their file skeleton first and append as they read**, because an earlier
identical run was stopped mid-read and produced **zero** files.

---

## 6. What was in flight when work stopped

**None of this is finished.** Re-brief a fresh agent per file. Partial edits are
committed at `d2d5baf`, so `git diff` against `ee8aaa2` shows what moved.

| file(s) | task | last position |
|---|---|---|
| `world/geology.js` | borehole badge, bit scale, strata | *"Now the computed exaggeration in applyHoleDiameter()"* |
| `ui/**`, `.hudqa/` | DOM leak, overlaps, false numbers | *"40 → 38, slider/strip/pit families gone. Two root causes left — the caption's text overflows its 11px row, and hiding the dock rows let the sliders slide up under the card."* |
| `core/renderer.js` | band inset, seam, fps mystery | **found a real harness bug:** *"`tools/shoot.mjs:899` waits 1.5 s; warm-up takes 60–100 s"* — see §9.4 |
| `world/terrain.js`, `core/env.js` | archetype review, volumetric beams, deck | just started |
| `rig/rigFactory.js`, `rig/tools.js`, `core/assets.js` | build from the references | queued behind §5 |

---

## 7. Five rules that must not be broken

1. **The logo is a wordmark**, bundled at `src/ui/assets/logo-*.png`. Never
   redraw, re-letter, recolour, or invent a drill-bit roundel (`DOMAIN.md` §10).
   `#F59E0B` is a **UI accent**; machine paint is `BRAND.amberPlant`.
2. **Drillity is the marketplace, not an OEM.** Machines carry invented marques;
   the wordmark never goes on tooling. `brandTexture()` is deliberately blank.
   The references in `research/rigs/` are for **geometry and materials only** —
   never copy a badge.
3. **Facts flow from `FACTS_VERIFIED.md` to the code, never the reverse.** The
   guard enforces **string identity only** — it cannot catch a wrong claim, and
   two shipped in a green build.
4. **Unsourced numbers carry `sourced: false` and never print as fact**
   (`PLATFORM_TRUTH.md` Part C rule 7): coal, iron, lithium and diamond grades,
   and Cerchar abrasivity.
5. **`NOT SOURCED` is always acceptable. A plausible invented number is not.**
   The owner: *"no guessing! i want you to do your research! we dont wanna look
   stupid."*

---

## 8. Failure patterns — each cost multiple rounds

### A. The silent fallback
**Not one `console.warn` existed on any missing-contract path in `src/`.** It
produced: a HUD meter reading 0 for four rounds; six audio voices receiving
nothing; **`sim.methodId` reading `auger` for 513 of 519 samples** in a longhole
run; blank shop thumbnails from **four independent silent bails**.

Still open: `site.js:2293` `: 'auger'` (seeds `pendingMethod` in **both** env and
terrain — one contract-less mount pins the session to a surface auger) ·
`shell.js:157` (a contract missing every key becomes **an auger job in Nordic**)
· `geology.js:3212` (`modeForMethod(null)` returns `'vertical'` for HDD, raise,
jumbo, pile) · `drilling.js resolveMethodId` (silent `|| 'auger'`) · `vfx.js`
(three of four fallbacks read fields **never written by anything in the repo**).
**And `menu.js` calls `audio.setSfxVolume?.()` / `setMusicVolume?.()`, neither of
which exists — the volume sliders are dead, swallowed by `?.`.**

**`audio.js` is the only consumer that survives** — it holds the last good id and
refuses unknown ones. Copy it.

### B. Two tables describing one thing
`catalog.js` grew a parallel universe (`chile` vs `andes`, `en791` vs
`rig-operator-licence`) — deleted. The sim keeps a private tuning table and
diverged on `rodLength`. `terrain.js:246 ASSET_PARAMS` is a **second** param
whitelist in front of `assets.material()`'s own. `tools/checkdata.mjs` guards
some of this and gates the build.

### C. The instrument that lies
A harness that can only see what it was told to look for produces **confident
false negatives** — the HUD allowlist. `auditMethodProfitability` once took a
bare seed and **silently ignored both arguments**, making every "measurement" the
same default run. **Verify your harness varies what you think it varies.**

### D. Research that fails against its own sources
`research/03-mining.md` had **five** claims wrong against the documents they
cited — including a **statutory rule that does not exist**, already implemented
in the sim, and one that penalised the player for something the source says
*increases* anchorage. All corrected at source. **Re-open the primary document;
the pack's own voice is not evidence.**

### E. Quoted dimensions the geometry contradicts
An **Odex eccentric that could not have come out of its own hole** (swept
179.1 mm on a 114.3 mm casing, closed to 169.4) · a **ring bit advertised as
cutting 0.146 mm** · a **belling tool whose arms crossed the centreline** · **jars
quoting a stroke with no dynamic node**. **Read the figure off the mesh.**
`.qa-topology.mjs`, `.qa-dimensions.mjs`.

### F. `transmission > 0` — the most expensive property in the codebase
Any material with `transmission > 0` **in the visible list** makes three.js
re-render the **entire opaque list** into a transmission target. Measured
**+65 to +81 draw calls, and it does not scale with the object** — a 30 mm quad
costs the same as a windscreen. Three instances found (cab glazing, `resin`,
`foam`); the glazing one was **doubling the whole rig fleet**.

### G. The GPU-process crash
A single `&&` in `geology.js` `FACE_FRAG` sent D3DCompile into unbounded
recursion; Chrome's GPU process died with `STATUS_STACK_OVERFLOW`, killing every
WebGL context. three.js then held stale program handles, surfacing as **48
`VALIDATE_STATUS false` errors with empty info logs, on two shaders that had
nothing to do with it.** **The named victims in a GL error are not the cause.**
Three GLSL sites are deliberately de-short-circuited — do not undo them.

---

## 9. IMPROVEMENTS — where the leverage actually is

Ranked. The first three are structural and would each retire a whole class of
bug rather than one instance.

### 9.1 End the two-tables problem structurally, not with a guard
`data.js`, `sim/drilling.js`'s private `TUNING`, `rigFactory.js`'s `METHOD_RIGS`
and `terrain.js`'s `ASSET_PARAMS` each keep an independent view of the same
facts. `checkdata.mjs` catches drift **after** it happens. The sim's isolation is
deliberate and worth keeping (it imports only `contract.js`, which is what makes
it runnable headlessly in node) — but the *content* numbers should flow one way.
**Make the sim take its per-method numbers from the method row passed into
`startHole(contract)`**, keeping only true tuning constants local. That deletes
the whole `rodLength` divergence category.

### 9.2 A `mustResolve()` helper, and ban the bare `||` default
Pattern A above is the single most expensive bug class in this project — three
lost rounds. Add one helper that takes a value, a name and a fallback, **warns
once** when it falls through, and use it at every `|| 'auger'` site. Then grep
for the remaining bare defaults as a lint step. A plausible wrong answer is worse
than a crash, because it survives review.

### 9.3 Declare every visual exaggeration
The bore is drawn ~7× (§4); `profile` mode is ~6:1 vertically; `heading` is
1.6–3.2×. **`profile` badges its factor and the others do not.** Make the badge a
property of the section, computed from the actual transform, and show it
whenever it is not 1:1. This is the same discipline as `sourced: false` on
numbers — the game already believes in it, just unevenly applied.

### 9.4 The fps mystery — and a harness bug that may explain it
`m01-auger` 26.9 fps, `m07-core` 26.0, `m04-site-investigation` 24.6, **at 75–78
draw calls, the same as states running at 143.9.** Before hunting shader cost,
note what the renderer agent found immediately before it was stopped:

> **`tools/shoot.mjs:899` waits 1.5 s, but warm-up takes 60–100 s.**

So the slow states may simply be the ones captured before the GPU clocked up —
i.e. **the numbers may be an artefact, not a regression.** Fix the harness wait
first, re-measure, and only then go looking. This is pattern C again.

### 9.5 Express budgets in the instrument's own terms
`README.md` listed "≤ 80 surface · ≤ 70 rig" as if disjoint; the harness's
`surface` bucket **includes** the rig, so `surface` could never be read against
80. Corrected in the README, but the lesson generalises: **a budget the
instrument cannot report is not a budget.**

### 9.6 Finish the reference library before more modelling
Eight stubs and three missing files (§5). Five builder agents were explicitly
told to wait for their reference; without it they will guess, which is exactly
what the owner has forbidden twice.

### 9.7 The seam is the highest-leverage single visual fix
The owner's reference (`research/18`) is **one continuous scene** — machine above
and tool below sharing one light, one perspective, **no visible seam**.
`GAMEDESIGN.md` §1 already asks for it. **How invisible the seam is, is the
difference between the reference and a diagram with a picture stuck on top.**
Nothing else in the visual list changes the read of the whole frame this much.

### 9.8 A citation-verification pass over every research pack
Five wrong citations were found in `research/03` **alone**, one of them already
implemented in the sim as a statutory rule that does not exist. The other packs
have not been audited. One agent per pack, re-opening primary sources, would be
cheap insurance against the owner's stated worst case.

### 9.9 Use the git history that now exists
Added today after an agent lost unrecoverable work. **Brief every agent to commit
per unit of work.** The next accident should be a `git checkout`.

### 9.10 Re-run the critic on the full scope
One round has run, on a limited scope, and it failed everything and **found more
than it confirmed**. That is the correct starting point. `REVIEW_RUBRIC.md` now
has a double-weighted domain-truth axis and a measured HUD-restraint gate.

---

## 10. Open defects — nobody is working on these

1. **`ui/`** — the DOM leak, mesh overlays, 12 px touch target, false results
   numbers, dead volume sliders (§3, §8A).
2. **`world/geology.js`** — the undeclared bore exaggeration (§4), auger flight,
   strata (§3).
3. **`core/renderer.js`** — the band inset. Read **`ctx.hud = { top, bottom }`**
   (the site screen publishes *measured* chrome pixels; the dock's height is
   method-dependent and no fixed fraction can express it), gated on
   `ctx.renderer.usesHudChrome`.
4. **The 24–27 fps states** — see §9.4; check the harness first.
5. **`rigFactory.js`** — the mast is still a flat slab. The owner's single
   biggest visual complaint. Build from `research/rigs/` (§5).
6. **No volumetric shafts underground** — a hard gate on rubric axis 2; the
   lighting agent said so itself. Half-barrels are 3–8 px where raw rock shows.
7. **`platform-deck` draws a moonpool.** A production platform drills through
   **well slots on a 1.8–3.0 m grid** with a **skidding** drill floor; the
   moonpool and cantilever belong to jack-ups and vessels. It is the only
   offshore-specific geometry in the game and it names the wrong feature.
8. **`geology.js` `heading` mode** renders as a near-black void with a glowing
   ring.
9. **`jet-grouting` has no sim tuning** and is *actively wrong*: `site.js` labels
   its sliders WITHDRAW / JET / ROTATION while the rotary fallback makes
   "withdrawal rate" weight-on-bit pushing **down**. A sourced spec is recorded
   in `drilling.js` at the `_default` fallback.
10. **`vfx.js:1314`** has `'jet-grouting': 'water'` against `data.js`'s
    `flushMedium: 'mud'`; the `jet` label family is gated on mud.
11. **57 of 24,000 contracts (0.24 %)** bottom in a bed the method cannot drill,
    all in `andes`. Needs a retry in the generator.
12. **The face shader sits one `&&` from crashing the GPU process** (§8G).
    Hardening it with `#define` specialisation per borehole mode is recommended
    and not done.
13. **A ninth region is the highest-value content addition**: an **alluvial delta
    city** — soft clays and silts, deep water table, tight urban plots — would
    properly serve `cfa`, `cased-cfa`, `driven-pile`, `jet-grouting`, `hdd` and
    `site-investigation`. `cfa` currently reaches **one** region, correctly (§11).

---

## 11. Decisions taken, with reasons — do not relitigate without new evidence

- **`cfa` reaches one region, and that is correct.** `till` removed from its
  `validGround` on sourced grounds (Bauer's envelope: *"cohesive, friable soils.
  No boulders"*). Nordic and Alpine had only ever qualified *through the till bed
  the research forbids*. Swedish Pile Commission: driven pre-cast **60 %**, CFA
  only under *"other pile types occasionally used"*. `SOLE_REGION_METHODS` records
  it as a **self-cleaning** exemption — the moment `cfa` reaches two regions,
  validation fails until the entry is deleted.
- **Camera motion is off.** `BIT_IMPACT` fired a camera shake, and bit impacts
  fire *continuously* while drilling; `shake()` **accumulates** trauma, so **the
  camera never returned to rest for an entire run.** Removed, with the per-frame
  handheld drift. **The world moves, the camera does not.** `CAMERA_DRIFT`
  brings it back by degrees.
- **Underground machines never appear on the surface — except a jumbo at a
  tunnel portal** installing pipe-umbrella pre-support. **Rock bolting is
  genuinely surface work too**; the rule is *the underground **bolter** never
  appears on the surface*, with surface bolting served by `anchor`. **Raise
  boring is routinely surface-to-underground** — an upper-level machine whose
  invariant is an opening *below*, not darkness above.
- **Prospecting for gold happens in a mine.** Minesite exploration hit a
  record-high **45 %** of global exploration budgets in 2025 while grassroots
  fell to a record-low 21 %; gold took **50 % ($6.2 bn)** of $12.40 bn. Build the
  **underground exploration cuddy** — 6 m high × 7 m deep off a 5×5 m drive,
  every ~100 m, sourced from two real gold mines.
- **`rigsForMethod` honours the method's own `rigIds` order.** It filtered the
  `RIGS` array, so ordering came from rig declaration order — and **every
  rockbolt scene rendered a tunnel jumbo** instead of a bolter.
- **Audio is silent under the harness.** Agents run headed Chrome on the owner's
  machine, so captures played the game aloud. All 20+ launch sites pass
  `--mute-audio`, and `audio.js` mutes itself under `?shot` / `?mute` so a probe
  written later that forgets the flag is still quiet. `?sound` forces it on.

---

## 12. Architecture and ground truth

```
src/
  core/    contract.js (shared contract; imports nothing) · renderer.js
           (two-band scissor + post chain) · env.js (sky, IBL, underground
           lighting) · assets.js (every texture, procedural) · preview.js
  world/   geology.js (the section) · terrain.js (the surface site)
  rig/     rigFactory.js (18 machines) · tools.js (270 tool ids)
  sim/     drilling.js (imports only contract.js → runs headless in node)
           vfx.js (pooled particles)
  game/    data.js (the content authority) · economy.js · progression.js
  audio/   audio.js (everything synthesised at runtime)
  ui/      styles.css (tokens; no hex outside :root) · shell.js · screens/
```

**Read before changing content:** `DOMAIN.md` (§10 hard rules) ·
`PLATFORM_TRUTH.md` (Part C binding fact rules) · `FACTS_VERIFIED.md` ·
`GAMEDESIGN.md` (§7 Advance/Work/Protect) · `METHOD_IDS.md` (fixed id contract) ·
`REVIEW_RUBRIC.md` · `AUDIT_ACCURACY.md`.

**`research/01`–`18`** (~1.8 MB sourced) plus **`research/rigs/`** (§5). Most
useful: **16** site archetypes (3,765 lines, 218 sources, 50 `NOT SOURCED`
markers) · **17** spot-verifications · **18** the owner's visual reference.

### The site-archetype layer — and the correction that matters

Ten archetypes in `data.js` (`urban-plot`, `infrastructure-corridor`,
`quarry-bench`, `open-pit-bench`, `tunnel-portal`, `underground-drive`,
`exploration-pad`, `well-pad`, `platform-deck`, `marine-spread`), each with a
`plane` and a **`renders` note written for `terrain.js`**. Pairing is a three-way
intersection of method × region × application.

**Read `state.world.site`, NOT `contract.archetype`.** `progression.js` clears
`state.contract` at settlement, and `finishContract()` runs from **inside
`HOLE_COMPLETE` dispatch** — so on the eight single-unit methods the contract is
null for the whole results screen while the site is still on screen:

```
contract: rockbolt / german-site / underground-drive / underground / holes 1
state.contract after run   : null
state.world.site after run : rockbolt / underground-drive / underground
```

**When everything is null, hold the previous value — never `setMethod(null)`.**
That collapse rebuilds an underground drive into a surface pad mid-run.

---

## 13. Tooling

**Guards, wired into `npm run build`:** `tools/checkfacts.mjs` (shipped facts vs
the verified list; **string identity only** — a green pass does *not* mean the
list is true) · `tools/checkdata.mjs` (content tables vs the renderer, encoding
an **asymmetry**: the renderer may know more than the data; the data may never
know more than the renderer).

**Headless simulation:** `drilling.js` imports only `contract.js`, so
`debug.simulate(sec, policy)` runs the whole game in node with no GPU.
**Frame-rate independence is a standing requirement** — 30 vs 120 fps must give
identical depth to three decimals.

**Scratch probes at the repo root** (`.qa-*.mjs`, `.perf-*.mjs`,
`.vfx-measure.mjs`, `.hudqa/`) — topology proofs, dimension guards, transmission
A/B, underground luminance, seam metrics. **Read them before writing a new one.**

**The reference workflow** is saved and re-invokable:
`Workflow({ scriptPath: "<session>/workflows/scripts/rig-reference-extraction-wf_54ee2e40-a77.js" })`
— 26 read-only agents, one per machine and tool family, plus a photo sweep and a
completeness critic.

---

## 14. What to do next, in order

1. **Fix `tools/shoot.mjs:899`'s 1.5 s wait** (warm-up is 60–100 s) and
   re-measure — the fps "mystery" may not exist (§9.4).
2. **Finish the eight stub references** (§5), then unblock the builders.
3. **The DOM leak** (`ui/`) — the game gets worse the longer it is played.
4. **The band inset** (`renderer.js`) — half the section is drawn and discarded.
5. **Badge the bore exaggeration** (`geology.js`, §4) — cheap, and it removes a
   domain-truth failure.
6. **Machine detail from the references** (`rigFactory.js`) — the owner's biggest
   complaint. **Detail sharing an existing material merges into the same draw
   call**; a new material is a new call.
7. **The seam** (§9.7).
8. **Re-run the critic on the full scope** and expect it to find more.

**Standing instruction from the owner:** *"It should be utterly perfect, visually
beautiful, with every single thing done at AAA quality. A separate sub-agent
should check it visually… a really harsh critic… don't stop until utterly
wowed."* One round has run. It failed everything. **That is the correct starting
point, not a setback.**
