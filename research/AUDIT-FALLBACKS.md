# Silent-fallback audit — world / sim / ui / economy / data

Read-only audit, 2026-09-05. Every claim marked **RUN** was executed; anything
marked **SUSPICION** was not. Ranked by **how much can go missing with no
visible symptom**, which is the only ranking that matters for this bug class.

Context: `ASTRA.md` §8 records five silent fallbacks and two vacuous gates found
in a single day. This is the systematic sweep that followed.

---

## Two claims in ASTRA.md were STALE — corrected here

**1. "jet-grouting has no sim tuning at all."** False now. **RUN:**
`METHODS` 21, `TUNING.methods` 22, **methods with no tuning: 0**. The extra key
is `_default`. The `WARN` line in `checkdata.mjs:107-109` is **dead code** — a
gate that has already been satisfied. The `oil-rotary` rodLength divergence is
gone too.

**2. "`adoptCameraScale()` rejects on the shipping layout and returns
silently."** False now — the function was rewritten. **RUN**, reproducing
`renderer.updateSectionFrustum()` against it:

| stage / band | camAspect | bandAspect | `off` | result |
|---|---|---|---|---|
| 390×844, band 390×261 | 1.4943 | 1.4943 | **0.0000 %** | **ADOPT** |
| 390×844, band 390×279 | 1.3978 | 1.3978 | **0.0000 %** | **ADOPT** |

`off` is **exactly zero by construction**: the renderer derives `hh` from the
same two band fields `bandRect()` reads. Four of the five failure paths now
`sayOnce`; the one silent path (`if (ownsCamera) return false`) is correct and
covered.

**But two residual findings stand:**
- **The guard is now tautological.** It compares a camera against the band the
  camera was derived from — structurally the same echo `ownsCamera` exists to
  forbid, one level up. **It cannot detect the failure it is named for.**
- **`renderer.js:1128-1130` still documents the deleted behaviour** — *"REJECTS
  a camera whose aspect is more than 35 % off"*. Load-bearing prose sitting
  directly above the function that makes it false.

---

## The findings, worst first

### 1. A failed `tools.js` import silently mis-pictures 149 of 260 shop items, permanently

`src/ui/screens/catalog.js:450-464`. **RUN:** 260 items → 220 resolve a builder
id, of which **71 come from an explicit `item.model` field and 149 come through
`BUILDER_IDS`**.

```js
builderPromise = import('../../rig/tools.js')
  .then((m) => { …; BUILDER_IDS = new Set(ids); return true; })
  .catch(() => { BUILDER_IDS = new Set(); return false; });   // line 461
```

If that import rejects — `rig/tools.js` is the largest file in the tree at
**11,039 lines** — `BUILDER_IDS` becomes an **empty Set, which is truthy**. So
`pickBuilder()` returns `undefined` for all 149, `previewRefFor()` falls back to
`preview.js`'s pattern matcher, **and line 451's `if (BUILDER_IDS) return` now
short-circuits forever**, so the repaint-when-it-arrives retry can never re-arm.

**What the player sees:** the shop renders. Every card has a picture. 149 of
them are the *wrong* picture. **No symptom, nothing logged.**

**Fix:** one `console.warn` in the catch, naming the consequence.

### 2. One unlogged `catch` turns the entire live HUD generic

`src/ui/screens/site.js:1747`:

```js
try { tl = sim.getTelemetry(); } catch (e) { simTel = null; return null; }
```

Every other catch in this 2,650-line file logs (`667`, `1032`, `1136`, `1218`,
`1732`, `1972`, `2482`). **This one and `readSweetSpot()` at `1671` do not** —
and this is the load-bearing read.

`simTel === null` removes in one frame: control labels, the dock-shape lock, the
well/BOP panel, the sim warning line, the rod-add beat, the action rail, the
unit card, the elapsed clock, the bailer beat, the job-progress arc and the
gauge. The screen falls back to the `state.drill` mirror and **keeps running**.

**What the player sees:** a working site screen with a frozen clock, no well
panel, no rod-add prompt, and three sliders reading "Weight on bit / Rotation /
Flushing". It looks like a plain rotary job.

### 3. The control-vocabulary layer reads three fields `data.js` does not have

`src/ui/screens/site.js:1066-1081` reads `m.kind`, `m.controls`, `m.wellControl`.
**RUN** against the real rows:

```
rows with .kind        : 0 / 21
rows with .wellControl : 0 / 21
rows with .controls    : none
```

So `controlFamily()`'s entire kind ladder is unreachable from the data row —
**RUN: 18 of 21 methods fall through to the terminal `return 'rotary'`.** And
`m.controls`, an authored-label mechanism documented as *"when it does, it wins
outright"*, has **zero data behind it and can never fire**.

Only `simTel.method.kind` rescues it, so **correct labels arrive only once
telemetry lands** — and on mount, and permanently if finding #2 has fired, a
tunnel jumbo, a sonic rig, a pile hammer and a core barrel are all labelled
"Weight on bit / Rotation / Flushing".

This is the exact failure `drilling.js:1989-1996` writes down by name — *"Jet
grouting spent its whole life doing exactly that, with 'Withdrawal rate' wired
to weight-on-bit pushing down"* — reproduced from the other direction. Nothing
detects it: `validateData()` has no invariant on `kind` or `controls`.

### 4. One `catch` drops every material in the site to flat colour, unlogged

`src/world/terrain.js:1668`. The bad-`kind` branch above it **shouts**
(`console.warn` at 1646). The `ctx.assets` failure branch does not — and it is
the one that takes out everything at once. `?.` chaining means a missing
`ctx.assets` never even reaches the catch.

**What the player sees:** the whole site in 21 flat MeshStandard colours, no
maps, no normals. It reads as "the low quality tier", not as a fault.
**`terrain.js` has 2 `console.warn` calls in 6,307 lines and neither is this.**

### 5. No gate asserts terrain's archetype/region coverage against `data.js`

Four silent substitutions in `terrain.js`, none logged: `REGIONS[regionId] ||
REGIONS.nordic` (1466), `byRegion[regionId] || 'exploration-pad'` (583),
`REGIONS[id] ? id : 'nordic'` (6109), and `ARCHETYPES[id] ? id : null` (6140) —
**where `null` means no site kit at all.**

**RUN:** all four tables are complete today. **The finding is that nothing keeps
them that way.** `checkdata` loads `data.js`, `rigFactory.js` and `drilling.js`;
`checkbeds`, `checkmodels` and `checkfacts` do not load `terrain.js` either. The
project's own asymmetry rule — *"the data may never know more than the
renderer"* — is enforced for methods and rigs and **not** for archetypes or
regions, which are the two things `terrain.js` builds an entire site from.

**What a 9th region would look like:** the card names Chile, the board pays
Chilean rates, and the site outside the cab is a Nordic spruce clearing.

### 6. The section band can stop updating and nothing will say so

`src/world/geology.js:7607` — `if (!scene || !faceMesh) return;`. Everything
below never runs: the frustum solve, the camera follow, the strip window, the
scale plate, the ruler, the readout. Hazard events still fire, so the sim keeps
producing numbers.

**This is not hypothetical in this file.** `geology.js:2998-3004` records that a
missing `let` made `applyHoleDiameter()` throw out of `init()` and **the entire
section band never built** — *"nothing moving in ten method frames, because
there was nothing there."* The declaration was fixed; **the guard that would
have named it was not added.** The file already has a `sayOnce` helper 1,200
lines away.

### 7. `mustResolve()` is the project's own named remedy and is used four times

`src/ui/components.js:110-137` states the rule: *"no bare `||` / `??` default on
a value that describes the job, the method, the region or the site."*

**RUN:** four call sites. Meanwhile the bare form appears on exactly those
value-kinds at nine sites, including **`geology.js:4058-4059` — the ground
column and the application the strata are generated from**, silently defaulted
to a Nordic water well.

`menu.js:195-215` is the counter-example done right: it drops the pill and shows
"Content unavailable" rather than filling it with a guess.

### 8. A missing region silently bills at base rate

`src/game/economy.js:1084` — `getRegion(regionId)?.costMult ?? 1`. `economy.js`
is otherwise the best-instrumented file in the set (four `warnOnce` covering
no-contract, no-methodId, unknown-methodId, no-regionId). **This one line is the
gap, and it is on money:** upkeep and fuel are both multiplied by it, and the
results screen shows the total with no indication the multiplier never applied.
A player in Sahara or Arctic sees Nordic operating costs.

---

## `validateData()` — 47 invariants, and which ones check almost nothing

**RUN** collection sizes: METHODS 21 · RIGS 19 · ITEMS 260 · REGIONS 8 · CERTS
14 · SKILLS 24 · APPLICATIONS 18 · SITE_ARCHETYPES 10 · SLOTS 22 · GROUND 21.
**No top-level collection is empty; no invariant is vacuous at the outer loop.**

But several iterate a field that is usually empty:

| invariant | measured |
|---|---|
| cert unlocks an unknown region | **8 of 14 certs have an empty `unlocksRegions`** — runs over **6 rows**, reads as broad coverage |
| cert prereq | 6 of 14 empty — runs over 8 |
| skill prereq | 4 of 24 empty — runs over 20 |
| **item method-id** | **11 of 260 items carry an empty `methods[]`** — and those 11 therefore skip the **entire connection-scoping block** (drill-string, percussion-family, DTH-shank), because it is a `for (const mm of i.methods)` body |
| `pullbackPerMetre` ⇒ `reamPasses` | fires on exactly **1** method (`hdd`) |
| `renderRigId` resolves | fires on exactly **1** rig |

**The 11 method-less items are a real hole:** an SPT split-spoon or a percussion
rod filed with `methods: []` skips five connection and vocabulary rules while
passing the whole gate.

## `methodOf()` — the one terminal fallback in `drilling.js` with no warning

```js
export function methodOf(id) { return T.methods[id] || T.methods._default; }
```

Every other terminal fallback in that file has a `warnOnce`. **RUN:** `_default`
carries **24 fields against up to 54** on a real entry — it lacks `blowHz`,
`resonanceCentre/Sigma`, `stages`, `wellControl`, `coreRun`, `ring`, `bolt`,
`pile`, `cpt`, `probe`, `founder*`, `rodAddKind`, `mustBail`, `flushIsSpoil`.
A method landing on it drills as a mud rotary with a 3 m rod beat, no
programme, no hazards — **under a HUD still carrying the real method's slider
labels.**

It cannot fire today. It fires silently the day someone adds method #22 to
`data.js` and forgets `TUNING`, **and the gate that would catch that is a WARN,
not a FAIL.**

---

## Checked and found CLEAN — these are the templates

- **`applyHoleDiameter()` / `boreExag`** — the exaggeration is **declared twice
  on screen and drawn rather than asserted**: a `BORE 7.1:1` badge with the
  arithmetic under it (*"Ø 152 mm DRAWN 1086 mm"*), and a `×7.1 Ø` ruler tag
  with two bars — the bore as drawn beside the same bore at true scale — so the
  ratio is measurable off the picture. Both read the same variable so they
  cannot drift. Below 1.05× it draws nothing rather than "×1.0". **RUN:**
  0.30 + 0.152×1.6 = 0.5432 → 1.0864 m → **7.147×**. This is the discipline the
  rest of this report measures against.
- **`resolveFlushMedium()`** — refuses to invent, publishes `null`, warns once,
  names the fix in `data.js`. The template for the whole class.
- **`results.js`** — names which criteria arrived unscored and refuses to
  display a grade that contradicts its own composite.
- **`renderer.js` post-chain** — every fallback goes through `warnOnce` and
  names what is lost.
- **`progression.js`** — 14 warn sites in 1,646 lines.
- **`Object.keys(x)[0]` "just pick one"** — **RUN**, grep across nine files:
  **zero occurrences.**
- **Empty `catch {}`** — **RUN**: **zero fully-empty blocks.** Every one carries
  a comment; the problem cases above are the ones whose comment is not a log.

---

## Recommended gates (SUSPICION — none implemented or tested)

1. Promote `checkdata`'s `noSim` warn to a **FAIL**. It is satisfied today, so
   it costs nothing now and closes the `methodOf` hole permanently.
2. Add a `checkdata` block asserting `terrain.ARCHETYPES ⊇ data.SITE_ARCHETYPES`
   and `terrain.REGIONS ⊇ data.REGIONS`. `terrain.js` imports `three`, so this
   needs the static-parse approach `checkmodels.mjs` uses, not a live import.
3. Move the control vocabulary onto the method row (`m.controls`), which
   `site.js:1073` already names as the intended authority and which **0 of 21**
   rows populate.
4. `catalog.js:461` and `site.js:1747` each need one `console.warn` naming the
   consequence. **Two lines close the two worst findings in this report.**
