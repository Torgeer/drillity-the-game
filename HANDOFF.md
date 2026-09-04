# DRILLITY I THE GAME — handover

**Paused 2026-09-04.** Thirteen agents were stopped mid-flight across the day.
Read this before touching anything; several of these findings exist nowhere else.

---

## 1. State of the tree — verified at the moment of writing

| check | result |
|---|---|
| `node --check`, all modules | **27 / 27 parse** |
| `styles.css` braces | **balanced** (643 / 643) |
| `npm run build` | **green** — 45 modules, 2.68 MB single file |
| `tools/checkfacts.mjs` | **pass** |
| `tools/checkdata.mjs` | **pass** — one known warning (`jet-grouting` has no sim tuning) |
| `validateData()` | **0 problems** |
| content | **21 methods · 18 rigs · 260 items** |
| capture | **12/12 states verified, 0 console errors** (`shots/ind-*`) |

Nothing needs repairing before work resumes.

**Run:** `npm run dev` (5178) · `npm run build` → `dist/index.html`.
**Phone:** `npm run preview` binds to the LAN, or open `dist/index.html`
directly on the device — everything is inlined bar two font hosts.

### Draw calls as of the last capture — all inside budget

```
                    surf  sect   rig     fps
m21-raise-boring      49    35    25   143.9
m09-rotary-kelly      53    16    31   141.9
m12-oil-rotary        57    22    33   143.9
m14-driven-pile       64    17    42   141.9
m17-hdd               65    15    46   143.9
m18-longhole          73    20    56   143.9
m01-auger             76    19    47    26.9
m07-core              78    20    51    26.0
m16-tunnel-jumbo      79    20    62   143.9
m11-rockbolt          80    20    62   143.9
budget                80    60    70      60
```

Underground was 141–172 surface this morning. Three `transmission > 0` materials
were the cause; see §6F. **The states at 24–27 fps are the open performance
question** — same draw calls as states running at 143, so it is fill or shader
cost, not geometry.

---

## 2. How far from done — about 45 %

| area | state |
|---|---|
| Systems & architecture | **~85 %** |
| Domain accuracy | **~75 %** |
| Performance | **~65 %** |
| **Visual quality** | **~30 %** |
| **Critic acceptance** | **~5 %** |

The estimate moved **down** after the first real critic round, which is what a
first review should do. **The game underneath is in good shape; the game you can
see is not.**

---

## 3. The verdict that matters

`shots/critique-ui-section.md` — **FAIL on every shot, both hard gates.** Scope
was deliberately limited to the UI screens and the section band, because the
surface was mid-rewrite.

**It refused to trust the previous agent's numbers, and two of three were
wrong.** `.hudqa/measure.mjs` measures **a hand-written allowlist of ~19 class
names**, so anything it does not know about is invisible. That is how "0
overlaps" was reported while `rockbolt` had **8**.

### Domain truth (axis 11, weighted double, hard gate)

- **There is no borehole.** The string sits in intact rock **with the joint
  network running unbroken through it.** The worst single item in the critique.
- **The bit measures 1.36–2.64 m** against the depth ruler *in the same image*
  (36.7 px/m) while the contract says **Ø152 mm — 9–17× oversize**.
- **The auger has no flight.**
- Ø262 mm window sampling against 30–150 mm in the repo's own research.

### HUD restraint (axis 7a, hard gate)

- **A DOM leak.** Through ordinary navigation `.sitedock` grows **427 → 471 →
  515 → 559 → 603 px, +44 px per visit**, `.screen` nodes 3 → 5. **By the fifth
  visit the dock is 71 % of the screen and the 3D is under 30 %** — worse than
  the 26 % baseline that started the HUD work.
- **Split is 67.1/32.9 or 71.6/28.4 against 54/46**, and **190–228 px of the
  section — 49–59 % of it — is rendered under the opaque dock and discarded
  every frame.**
- `.sstrip` measures **135 px live against `LAYOUT.chromeTop`'s declared 52**.
- **Meshes overlay the 3D, which no DOM harness can see**: the drill-log strip
  (the rubric names it as belonging off the HUD), the ruler, the callout, the
  stratum labels. **Torque is stated four ways** in one 250×160 block.
  `.railbtn` is a **12 px** touch target against a 44 px rule.

### False numbers on the results screen

- `SCORE 51 % · grade B` when **B starts at 62 %**.
- `SPEED 18 %` from a hard-coded `avgRop / 45` at **`results.js:327`**, on a job
  whose nominal is 6 m/h where the player did 8.3. **The real breakdown already
  arrives in `HOLE_COMPLETE.breakdown`** — read the payload, never re-derive.
- `KW / KNM / M` at `styles.css:1528` — unit case (kW, kNm, m).

### Section band — the previous pass's claims did not survive

- "6 beds, 5 contacts in 20 m" is false: **2 lithologies plus one 1.0 m marker**.
- **Both contacts move together** — a constant-thickness ribbon, not two
  independent surfaces.
- Granite — **55 % of the band** — still at 0.34 m feature size.
- **The whole band lives in L\* 0–47 with no highlight at all.**
- Crack edges transition over **8.0–8.5 px** vs 5.0 in the surface band: every
  joint is a 22 cm blur.
- **Nothing moves in any of ten method frames** (rubric axis 9).

---

## 4. What was in flight when stopped

**None of these is finished.** Re-brief a fresh agent per file.

| file(s) | task | last position |
|---|---|---|
| `rig/rigFactory.js` | machine detail — mast structure, carriage, cylinders, hoses | *"Now panel lines, hatches and hard fittings on the machine bodies."* |
| `core/renderer.js` | band inset for the 54/46 split; seam continuity; the LOW-tier AA question | *"Let me make LOW's AA measurable both ways in the shipping path."* |
| `ui/**`, `.hudqa/` | the critic's HUD failures | *"Starting with the unit-case bug and the touch targets"* |
| `world/geology.js` | borehole, bit scale, strata | barely started |
| (review) | domain-truth check on rig changes | barely started |

---

## 5. Five rules that must not be broken

1. **The logo is a wordmark**, bundled at `src/ui/assets/logo-*.png`. Never
   redraw, re-letter, recolour, or invent a drill-bit roundel (`DOMAIN.md` §10).
   `#F59E0B` is a **UI accent**; machine paint is `BRAND.amberPlant`.
2. **Drillity is the marketplace, not an OEM.** Machines carry invented marques;
   the wordmark never goes on tooling. `brandTexture()` is deliberately blank.
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

## 6. Failure patterns — each cost multiple rounds

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
(three of four fallbacks read fields **never written by anything in the repo** —
dead code posing as defence).

**`audio.js` is the only consumer that survives** — it holds the last good id and
refuses unknown ones. Copy it.

### B. Two tables describing one thing

`catalog.js` grew a parallel universe (`chile` vs `andes`, `en791` vs
`rig-operator-licence`) — deleted. The sim keeps a private tuning table and
diverged on `rodLength`. `tools/checkdata.mjs` now guards this and gates the
build. **Still live: `terrain.js:246` `ASSET_PARAMS` is a second param whitelist
in front of `assets.material()`'s own** — a param must be added in both.

### C. The instrument that lies

A harness that can only see what it was told to look for produces **confident
false negatives**. The HUD allowlist is one. `auditMethodProfitability` once took
a bare seed and **silently ignored both arguments**, making every "measurement"
the same default run. **Verify your harness varies what you think it varies.**

### D. Research that fails against its own sources

`research/03-mining.md` had **four** claims wrong against the documents they
cited — including a **statutory rule that does not exist**, already implemented
in the sim, and one that penalised the player for something the source says
*increases* anchorage. All corrected at source. **Re-open the primary document;
the pack's own voice is not evidence.**

### E. Quoted dimensions the geometry contradicts

An **Odex eccentric that could not have come out of its own hole** (swept
179.1 mm on a 114.3 mm casing, closed to 169.4) · a **ring bit advertised as
cutting 0.146 mm** · a **belling tool whose arms crossed the centreline** instead
of opening · **drilling jars quoting a stroke with no dynamic node**.
**Read the figure off the mesh.** `.qa-topology.mjs`, `.qa-dimensions.mjs`.

### F. `transmission > 0` — the most expensive property in the codebase

Any material with `transmission > 0` **in the visible list** makes three.js
re-render the **entire opaque list** into a transmission target. Measured
**+65 to +81 draw calls, and it does not scale with the object** — a 30 mm quad
costs the same as a windscreen. Three instances found (cab glazing, `resin`,
`foam`); the glazing one was **doubling the whole rig fleet**.

---

## 7. Open defects — nobody is working on these

1. **`ui/`** — the DOM leak, mesh overlays, 12 px touch target, false results
   numbers. Measurements in §3.
2. **`world/geology.js`** — no borehole, bit 9–17× oversize, auger without a
   flight, the strata items in §3.
3. **`core/renderer.js`** — the band inset. Read **`ctx.hud = { top, bottom }`**
   (the site screen publishes *measured* chrome pixels, because the dock's height
   is method-dependent and no fixed fraction can express it), gated on
   `ctx.renderer.usesHudChrome`. `LAYOUT.chromeTop/chromeBottom` exist in
   `contract.js` with the derivation documented.
4. **Several states run at 24–27 fps** at the same draw calls as states running
   at 143. Fill or shader cost. Unexplained, and the last performance unknown.
5. **`rigFactory.js`** — the mast is still a flat slab. The owner's single
   biggest visual complaint.
6. **No volumetric shafts underground** — a hard gate on rubric axis 2; the
   lighting agent says so itself. Half-barrels are 3–8 px where raw rock shows.
7. **`geology.js` `heading` mode** renders as a near-black void with a glowing
   ring.
8. **`jet-grouting` has no sim tuning** and is *actively wrong*: `site.js` labels
   its sliders WITHDRAW / JET / ROTATION while the rotary fallback makes
   "withdrawal rate" weight-on-bit pushing down. The spec for building it is
   recorded in `drilling.js` at the `_default` fallback.
9. **`vfx.js:1314`** has `'jet-grouting': 'water'` against `data.js`'s
   `flushMedium: 'mud'`; the `jet` label family is gated on mud.
10. **57 of 24,000 contracts (0.24 %)** bottom in a bed the method cannot drill,
    all in `andes`. Needs a retry in the generator.
11. **The face shader sits one `&&` from crashing the GPU process** — see §9.
12. **`preview.js`/`catalog.js` routing** may swallow `casing-crown`, `ring-bit`,
    `wing-bit`, `concentric` into `casing-pipe`. One agent reported it, another
    contradicted it. **Verify before acting.**
13. **A ninth region is the highest-value content addition**: an **alluvial delta
    city** — soft clays and silts, deep water table, tight urban plots — would
    properly serve `cfa`, `cased-cfa`, `driven-pile`, `jet-grouting`, `hdd` and
    `site-investigation`. See the `cfa` decision in §10.

---

## 8. Architecture and ground truth

```
src/
  core/    contract.js (shared contract; imports nothing) · renderer.js
           (two-band scissor + post chain) · env.js (sky, IBL, underground
           lighting) · assets.js (every texture, procedural) · preview.js
  world/   geology.js (the section) · terrain.js (the surface site)
  rig/     rigFactory.js (18 machines) · tools.js (270 tool ids)
  sim/     drilling.js (imports only contract.js, so it runs headless in
           node) · vfx.js (pooled particles)
  game/    data.js (the content authority) · economy.js · progression.js
  audio/   audio.js (everything synthesised at runtime)
  ui/      styles.css (tokens; no hex outside :root) · shell.js · screens/
```

**Read before changing content:** `DOMAIN.md` (§10 hard rules) ·
`PLATFORM_TRUTH.md` (Part C binding fact rules) · `FACTS_VERIFIED.md` ·
`GAMEDESIGN.md` (§7 Advance/Work/Protect) · `METHOD_IDS.md` (fixed id contract) ·
`REVIEW_RUBRIC.md` · `AUDIT_ACCURACY.md`.

**`research/01`–`18`**, ~1.8 MB sourced. Most useful: **16** site archetypes
(3,765 lines, 218 sources, 50 `NOT SOURCED` markers) · **17** spot-verifications
· **18** the owner's visual reference · **13** string elements · **14** well
services · **15** field facts.

### The site-archetype layer, and the correction that matters

Ten archetypes in `data.js` (`urban-plot`, `infrastructure-corridor`,
`quarry-bench`, `open-pit-bench`, `tunnel-portal`, `underground-drive`,
`exploration-pad`, `well-pad`, `platform-deck`, `marine-spread`), each with a
`plane` and a **`renders` note written for `terrain.js`**. Pairing is a
three-way intersection of method × region × application.

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

## 9. Tooling

**Guards, wired into `npm run build`:** `tools/checkfacts.mjs` (shipped facts vs
the verified list; string identity only — a green pass does **not** mean the list
is true) and `tools/checkdata.mjs` (content tables vs the renderer, encoding an
**asymmetry**: the renderer may know more than the data; the data may never know
more than the renderer).

**Capture:** `node tools/shoot.mjs --headed [state ...] --tag x` — ~51 states,
per-shot metrics to `shots/<tag>-report.json`. **Headless Chrome cannot bind the
discrete GPU on this machine**; without `--headed` you get SwiftShader and
meaningless numbers.

**Headless simulation:** `drilling.js` imports only `contract.js`, so
`debug.simulate(sec, policy)` runs the whole game in node with no GPU.

**Scratch probes at the repo root** (`.qa-*.mjs`, `.perf-*.mjs`,
`.vfx-measure.mjs`, `.hudqa/`) — topology proofs, dimension guards, transmission
A/B, underground luminance. Read them before writing a new one.

### The GPU-process crash — do not re-learn this

A single `&&` in `geology.js` `FACE_FRAG` sent D3DCompile into unbounded
recursion; Chrome's GPU process died with `STATUS_STACK_OVERFLOW`, killing every
WebGL context. three.js then held stale program handles, which surfaced as **48
`VALIDATE_STATUS false` errors with empty info logs, on two shaders that had
nothing to do with it.** **The named victims in a GL error are not the cause.**
Three GLSL sites are deliberately de-short-circuited. Hardening the face shader
with `#define` specialisation per borehole mode is recommended and not done.

---

## 10. Decisions taken, with reasons

- **`cfa` reaches one region, and that is correct.** `till` removed from its
  `validGround` on sourced grounds (Bauer's envelope: *"cohesive, friable soils.
  No boulders"*). Nordic and Alpine had only ever qualified *through the till bed
  the research forbids*; both still buy the same work through `cased-cfa` and
  `driven-pile`. Swedish Pile Commission: driven pre-cast **60 %**, CFA only
  under *"other pile types occasionally used"*. `SOLE_REGION_METHODS` records it
  as a **self-cleaning** exemption — the moment `cfa` reaches two regions,
  validation fails until the entry is deleted.
- **Camera motion is off.** `BIT_IMPACT` fired a camera shake, and bit impacts
  fire *continuously* while drilling; `shake()` **accumulates** trauma, so **the
  camera never returned to rest for an entire run**. Removed, with the per-frame
  handheld drift. The principle, now in code: **the world moves, the camera does
  not.** `CAMERA_DRIFT` brings it back by degrees.
- **Underground machines never appear on the surface — except a jumbo at a
  tunnel portal** installing pipe-umbrella pre-support. **Rock bolting is
  genuinely surface work too** (highway and rail cuts); the rule is *the
  underground **bolter** never appears on the surface*, with surface bolting
  served by `anchor`. **Raise boring is routinely surface-to-underground** — an
  upper-level machine whose invariant is an opening *below*, not darkness above.
- **Prospecting for gold happens in a mine.** Minesite exploration hit a
  record-high **45 %** of global exploration budgets in 2025 while grassroots
  fell to a record-low 21 %; gold took **50 % ($6.2 bn)** of $12.40 bn. Build the
  **underground exploration cuddy** — 6 m high × 7 m deep, ~7 holes, off a
  5×5 m drive, every ~100 m, sourced from two real gold mines.
- **`rigsForMethod` honours the method's own `rigIds` order.** It used to filter
  the `RIGS` array, so ordering came from rig declaration order — and **every
  rockbolt scene rendered a tunnel jumbo** instead of a bolter.

---

## 11. What to do next, in order

1. **The borehole** (`geology.js`). Nothing else in the section matters while
   the hole is not there and the bit is 9–17× oversize.
2. **The DOM leak and the mesh overlays** (`ui/`). The leak makes the game worse
   the longer it is played.
3. **The band inset** (`renderer.js`). Half the section is rendered under the
   dock and discarded.
4. **Machine detail** (`rigFactory.js`) — the mast is a flat slab. **Detail
   sharing an existing material merges into the same draw call**; a new material
   is a new call.
5. **The 24–27 fps states** — unexplained, and the last performance unknown.
6. **Then re-run the critic round on the full scope**, and expect it to find
   more.

**Standing instruction:** *"It should be utterly perfect, visually beautiful,
with every single thing done at AAA quality. A separate sub-agent should check it
visually… a really harsh critic… don't stop until utterly wowed."* One round has
run, on a limited scope. It failed everything. **That is the correct starting
point, not a setback.**
