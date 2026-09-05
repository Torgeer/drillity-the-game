# ASTRA — handover

**For whoever picks this up next, in any tool.** Written 2026-09-05 at the end
of a long multi-agent day. This file assumes you have **no access to the
conversation that produced it** and tells you everything you need.

Repo: <https://github.com/Torgeer/drillity-the-game> (public, branch `master`).

> Read §1 to know the tree is safe, §2 to run it, §3 for the rules you must not
> break, §4 for the Blender pipeline (the single largest thing in flight), §7
> for what is left and exactly how to do it. Everything else is reference.
>
> `HANDOFF.md` is the older, longer handover from the previous day. It is still
> accurate about architecture and history; where the two disagree, **ASTRA.md
> is newer**. Read `HANDOFF.md` §8 (failure patterns) and §12 (architecture)
> when you need depth this file does not carry.

---

## 1. State of the tree, verified at the moment of writing

| check | result |
|---|---|
| `npm run check` | **all green** |
| `tools/checkfacts.mjs` | pass — every shipped fact is in the verified list |
| `tools/checkdata.mjs` + `validateData()` | pass — **0 problems** |
| `tools/checkbeds.mjs` | pass — 0 undrillable contracts in 6,400 sampled |
| `tools/checkmodels.mjs` | pass — every exported model is named for the rig that asks for it |
| content | **21 methods · 18 rigs · 260 items · 8 regions** |
| Blender machines | **17 of 18 modelled and exported.** Only `sonic-truck` is still procedural |
| commits this session | **145**, all pushed |

**Nothing needs repairing before work resumes.** There is uncommitted-then-
committed WIP from six agents stopped mid-task — see §6.

---

## 2. How to run it

```bash
npm install
npm run dev        # http://localhost:5178   — the game
npm run build      # runs every gate, then builds dist/index.html
npm run preview    # serves dist/ on 5179, binds to the LAN for phone testing
```

`npm run build` produces **ONE self-contained 2.686 MB `dist/index.html`** via
`vite-plugin-singlefile`. Everything is inlined except two font hosts and the
`.glb` machine models, which stream from `models/`. That single-file property is
a genuine asset — the game opens anywhere with no install. Do not casually break
it.

### The gates

```bash
npm run check          # checkfacts + checkdata + checkbeds + checkmodels
npm run check:reach    # thumb reach — needs `npm run dev` running. CURRENTLY FAILS (§7.3)
npm run blender        # builds every machine, per-machine PASS/FAIL, non-zero exit on any failure
```

### Measuring a machine

```bash
node tools/glbinfo.mjs                                   # every model, one line each
node tools/glbinfo.mjs --parts public/models/<id>.glb    # one machine, per-subtree bounds
```

### Capturing the game

```bash
node tools/shoot.mjs --headed          # 51 states, screenshots + draw calls + fps
```

**`--headed` is not optional. Headless Chrome cannot bind the discrete GPU on
this machine** and reports either nothing or garbage.

### Blender

```
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
```

One machine, headless:

```bash
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background --python-expr "
import sys, os
R = r'C:\Users\henri\Downloads\drillity-the-game'
sys.path.insert(0, os.path.join(R,'blender')); sys.path.insert(0, os.path.join(R,'blender','lib'))
import piling_leader
piling_leader.build(os.path.join(R,'public','models','piling-leader.glb'))
"
```

Drop `--background` to open the GUI with the machine built in front of you.

---

## 3. Hard rules — these are not style preferences

1. **No guessing.** The owner's words, twice: *"no guessing! i want you to do
   your research! we dont wanna look stupid."* Every dimension must trace to a
   datasheet page cited in a comment beside the constant. Anything you cannot
   source is marked **`NOT SOURCED`** in the file. **A plausible invented number
   is worse than an admitted gap**, because nobody will ever check it again.

2. **No real manufacturer names or model designations as product names.**
   `DOMAIN.md` §10. Model the machine accurately; badge it with an invented
   marque. The fleet's two-letter prefixes are **method-derived** — `TH-320`
   top hammer, `RC-410`, `LH-60` longhole, `CP-24` cable percussion. One rig was
   shipping as `PM-78`, and `PM` is a real maker's live prefix (PM20, PM25H,
   PMx25); it reached the player through the shop card *and* the data-plate
   decal. Renamed `DP-78`. **The other seventeen prefixes have never been
   cleared** — that is an open job.

3. **Never set `transmission` above 0** on any material. It re-renders the
   entire opaque list: **+65 to +81 draw calls measured**, and it does not scale
   with object size. One cab window doubled the whole rig fleet's cost. This has
   been found three separate times in this codebase.

4. **Draw-call budget is ≤ 70 per rig.** Detail sharing a material is free in
   draw calls and costs only triangles — that is the lane to spend in.

5. **`git add <path>`, never `git add -A`.** Up to twenty agents commit
   concurrently; a broad add has already swept another agent's staged work into
   the wrong commit.

6. **When `FACTS_VERIFIED.md` and the code disagree, the CODE changes.** Never
   edit the document to match the code — that defeats the entire guard, and it
   has been done once already.

---

## 4. The Blender pipeline — the largest thing in flight

Machines are **Python scripts**, not `.blend` files, and that is deliberate: a
binary loses its provenance the moment somebody nudges a vertex, whereas a
script is reviewable, diffable, and every dimension sits next to its datasheet
citation. `blender/lib/rig.py` is the shared library; `blender/<machine>.py` is
one module per machine; `blender/build.py` iterates `MACHINES`.

### The four contracts

**1. Named nodes survive export.** `src/core/env.js` reads live nodes from
`ctx.rig.getWorkLights()` **every frame** and re-aims spotlights at them — that
is why boom lamps sweep a drive as a machine works. `rigFactory.js` looks nodes
up **by string**:

| prefix | meaning |
|---|---|
| `pivot:<name>` | the game **rotates** it (boom slew, mast rake, sheave) |
| `slide:<name>` | the game **translates** it (carriage, ram, telescope) |
| `mount:<name>` | fixed attachment point; carries `cone_deg` / `range_m` as glTF `extras` |
| `aim:<name>` | the point a mount looks at |

> **The name was never the contract.** `finish()`'s join was silently
> *relocating* `mount:`/`aim:` nodes — a mount at x=6 came back at x=0, dragging
> its aim with it — because `join()` deletes what it eats and children do not
> keep their world transform. The export still contained a node called
> `mount:…`, so "did the name survive?" passed. Fixed by snapshotting and
> restoring world transforms, parents before children.

**2. Materials are names only.** `src/core/assets.js` generates all ~41 texture
kinds procedurally at runtime, with wear and dirt driven by gameplay state. A
baked map would be discarded *and* blow the texture budget (55 MB HIGH against a
~90 MB cap). **The name must exist in `assets.js` KINDS.**

> `rig.py` named its chassis material `paintedDark` from the day it was written.
> `assets.js` had no such kind, so `resolve()` fell through to `rawSteel` and
> **every frame, track guard, walkway and undercarriage on all 17 machines
> rendered as bright bare metal.** The only symptom was one warning line per
> model. Fixed by deriving `paintedDark` from `paintedSteel` (same steel, same
> panel mapping, same dirt gradient, different albedo, higher wear). Guarded:
> `checkmodels.mjs` now reads material names out of every exported GLB and fails
> if `assets.js` cannot make one.

**3. Statics join by material before export.** glTF emits one draw call per
material per mesh, so 300 separate bolts in one material are 300 draw calls
unjoined and 1 joined. Anything parented under a `pivot:` or `slide:` node is
excluded from the join — it has to move independently.

**4. The exported filename is the RIG ID, not the module name.** `gltfRig.js`
fetches `models/<rigId>.glb`, and rig ids are hyphenated (`cfa-rig`); Python
modules cannot be, so they are `cfa_rig.py`. `build.py` does
`mid.replace('_', '-')`.

> This was broken until this session, and **six of eight machines had never once
> been on screen** — 31 MB of modelling that the game silently replaced with the
> procedural builder every time. Two of them appeared to work only because
> somebody had hand-copied them under the hyphenated name, which is exactly what
> stopped anybody noticing the other six.

### `box()` — read this before trusting any dimension

`box()` returned boxes at **half** the size asked for: `primitive_cube_add(size=1)`
makes a cube of **edge 1**, and the next line then set `scale = size/2`.
`box((4,2,10))` measured **(2.000, 1.000, 5.000)**. `tube()` was always correct,
which is what made it invisible — correct cylinders beside half-size boxes read
as a machine.

It is fixed. `reset()` now probes **both** primitives on every build and
**raises rather than compensating**. Eight per-machine workarounds were removed
in the same commit, and the removal was proved exact: eight of nine machines
measured identical to the millimetre before and after.

**If you write a new machine module, do not add a compensation for anything.**
If a primitive looks wrong, measure it, say so, and fix the library.

---

## 5. Measurement — one ruler, and why

**`tools/glbinfo.mjs` is the only dimension tool. Do not write a second one.**

A second tool, `glbdims.mjs`, existed for a few hours. It measured a machine by
transforming the **eight corners of each primitive's local AABB** through the
node's world matrix. On axis-aligned geometry that is exact and the two agreed
to the millimetre. On a node carrying a **rotation** whose mesh does not fill
its own local box — every joined static under a raked mast — it is a strict
over-estimate. It was larger on four of nine machines and never smaller.

It produced **four false findings**, three of which were reported as real:

| claim | truth |
|---|---|
| pd55 26.218 m tall | **25.790**, max y exactly **25.700** = the datasheet figure |
| rc-rig "reaches 2.598 m below ground — usually a runaway array" | **−0.014 m.** No bug existed |
| tunnel-jumbo 19 mm over its own WIDTH constant | **2.260** = the constant exactly |
| teststub "95 km × 98 km × 107 km" | **3.242 × 3.588 × 2.890** |

`glbinfo`'s `measure()` transforms **every actual vertex**. It also now refuses
to report a number it cannot measure: a primitive with no POSITION used to be
skipped silently, and a skipped primitive makes a machine come out *smaller*,
which is indistinguishable from a machine that is correctly small.

**The general lesson, and it is the most valuable thing in this document:**
`HANDOFF.md` §8B — *two tables describing one thing will drift, and the one that
is wrong will be believed.*

### The overall bound of a model is NOT its width

A hose, a rope or a raked mast authored in a working pose legitimately widens
the bounding box. **Always establish which subtree reaches the extreme before
touching a constant**, with `--parts`.

Worked example, both found in the same hour:

- **`piling_leader` was genuinely 1.13 m too wide.** "Over 900 mm shoes" is an
  outer-to-outer width; the model used it as a centre-to-centre spacing. Three
  faults compounded: the track node at `GAUGE_WIDE/2` instead of
  `(GAUGE_WIDE - SHOE_W)/2`; a cross-carrier written as a `5.70` literal (which
  is `CRAWLER_L`'s value — the crawler *length*, this file's master scale bar —
  used as a width) sitting 410 mm outboard of the shoes; and toolboxes bolted
  115 mm proud of the track they hang on. Now **4.880 m exactly**.
- **`cfa_rig` measured 6.843 m against a printed 3 000 and was correct.** Every
  part of the machine lies within ±2.220 (4.440 m over tracks, inside the
  printed 3 000–4 500 range). The extra 2.4 m is one object: the concrete
  delivery line, which leaves the swan neck and runs **along the ground** out to
  x = 4.60 where the pump truck stands.

Those two are indistinguishable in a one-line dimension table.

---

## 6. What was in flight when this was written

Six agents were stopped mid-task. Everything on disk is committed. **`npm run
check` passes, but that only proves the DATA is sound — none of the source below
was reviewed by its own author.** Read the diff before trusting it.

| file | task | where it stopped, in the author's own words |
|---|---|---|
| `src/world/geology.js` | the **depth ruler** | *"now the tick-ladder helper, which has to serve a 9 m pile and a 3,000 m well on the same band"* |
| `blender/sonic_truck.py` | the last unmodelled machine | *"now the head, wrenches, guard, platform, jacks, tooling, hoses, lights and build"* |
| `blender/oil_derrick.py` | offshore derrick refinement | *"only my file is mine to commit"* |
| `.hudqa/**`, `tools/checkreach.mjs` | the thumb-reach fix | mid-pass |
| `blender/crawler_lite.py` | first machine the player owns | *"now some targeted fixes from looking at it"* |
| `tools/devserver.mjs` | **NEW** — a private dev server, because agents kept navigating each other's shared one | landed |

`research/rigs/_model-critique.md` (628 lines) is the harsh critic's verdict on
the first nine machines. **Read it before touching any of them.**

---

## 7. What is left, in priority order, and exactly how

### 7.1 — `sonic-truck`, the last unmodelled machine

`blender/sonic_truck.py` exists and is mid-build. Finish it, register it in
`blender/build.py`'s `MACHINES` (one line), export, and verify with
`node tools/checkmodels.mjs` and `node tools/glbinfo.mjs`.

It is the fleet's **only truck-mounted rig** — it should read as road-legal,
with a cab, outriggers and a deck, a mast that **folds down for transport**
(a `pivot:`), and the sonic **oscillator head** on the feed (a `slide:`). Sonic
drilling advances casing by high-frequency **axial vibration**, not percussion
and not pure rotary. A huge amount of sourced truck-chassis data was gathered
and is in the session record but **not yet filed** — frame rails, ride heights,
tyre rolling diameters, and the note that a US truck frame is nominally 34 in
outside-to-outside (34.25–34.875 depending on rail thickness).

### 7.2 — Finish the depth ruler in the section band

`src/world/geology.js`. A fixed ticked scale down the band's edge with the bit
as a **moving cursor**, so depth and rate are read off something already on
screen — and then the numeric HUD readout is deleted. **Do not delete the
readout before the ruler lands.**

Its prerequisite is **done**: the two bands used to draw the borehole **62.44 px
apart — 16 % of the stage width** — contradicting `GAMEDESIGN.md` §1 in writing.
That is now solved every frame from the projection itself (`registerBands()` in
`renderer.js` lens-shifts the surface camera by the measured residual) and
measures **0.00**.

Two things still block it, both measured (`node .qa-collar.mjs --depthfrac 0.001`):

- **`sectionGroundAtSeamPx = −24.54 px at spud`** — the cut's depth 0 is off the
  *top* of its own band; its first visible row is already 1.26 m deep.
  `CFG.headroom` asks for 1.6 m of air and delivers −1.26.
- **`viewMetres` claims 19.988 against an actual frustum of 14.261** — geology's
  `halfH` is 10 m against a true 7.13, because `adoptCameraScale()` rejects on
  the shipping layout (aspect 1.408 vs 1.005, 39 % against a 35 % tolerance) and
  **returns silently**. Everything placed from `halfH` is out by that ratio.

**Declare the bore exaggeration on the ruler.** `applyHoleDiameter()` draws
152 mm at ≈ **1.086 m — 7.1×**. The exaggeration is necessary (a true-scale
152 mm bore in a 20 m band is about 1.3 px) but it is **undeclared**, and a
working driller will spot it in ten seconds and then trust nothing else on
screen. A `×7 Ø` tag, or a true-scale hairline inside the exaggerated bore,
turns a lie into a diagram.

**Still open, quantified, not decided:** the scale changes **2.81×** across the
seam — 54.58 px/m above against 19.42 below, so a rod crossing it changes size
by nearly three. Matching at the collar needs the hero eye at 38.4 m instead of
13.69 m, which drops a 4.2 m mast from 70 % of the band to 25 %. Moving the
other side is worse: geology authors its log gutter and ruler in **section
units**, and `adoptCameraScale()` clamps to a ceiling of 32.35 px/m, so 54.58 is
unreachable from that side at all.

### 7.3 — The two controls nobody can press

`npm run check:reach` **currently fails**, identically on all five methods:

```
.actionbtn   centre (334, 795)   right = HARD   left = easy
.vsl         centre  (54, 795)   right = easy   left = HARD
```

Both bottom corners. **The primary action button fails for the right thumb**,
which is two-thirds of one-handed users.

This is not the "bottom third is fine" rule failing at the edges — it is that
rule being **wrong**. The thumb sweeps an **arc** about the joint at its base, so
the corner directly *under* the thumb is among the hardest places on screen.
Hoober's study of 1,300+ observed users: 49 % one-handed, 36 % cradled, 15 %
two-handed, thumbs driving **75 % of all interactions**, and the reachable
region is *"only a third of the screen … at the bottom, **on the side opposite
the thumb**"*. A control is only as reachable as its **worse** hand.

**How:** sort every interactive element into *touched while drilling* and
*touched between jobs* first — that sort is the design decision, the layout
follows. The model and its three assumed constants are documented in
`tools/checkreach.mjs`'s header; if you think the model is wrong, **argue with
numbers and change the gate**. When it passes, wire `check:reach` into
`npm run check`.

### 7.4 — Look-ahead uncertainty in the section (not started)

The single highest-value gameplay change left. Today strata below the bit are
drawn exactly like strata already drilled, so **the section tells the player
nothing they do not already know.** Ground the bit has not reached should read
as uncertain and sharpen as the bit arrives.

Every hook exists in `geology.js`: `depthAt(vec2 wp)`, `uDepth`, `uDepth0`, and
the `drilledOut = step(-uDepth - 0.02, wp.y)` pattern. **`depthAt(wp) - uDepth`
is the metres-ahead field and that is the whole input.**

The physical truth to render is a **geologist's interpretation between
boreholes**: a bed's *existence* is fairly well known, its *depth and thickness*
are interpolated. That asymmetry is the honest thing to draw — not a fog
overlay, which reads as a graphics effect rather than as knowledge.

**Confidence must be buyable, because that is the gameplay.** `data.js` already
carries `oreConfidence` (0..1) and `oreStage` on every contract. Drive a
`uSurveyConfidence` from it. **The look-ahead must never lie** — once drilled,
the section must match what the sim resolved.

### 7.5 — Open defects, measured, nobody working on them

- **`m07-core` is over its draw-call budget** — surface 82 against 80. Only
  visible once the harness started grading **warm** numbers.
- **Five models sit below y=0**, exactly measured: `oil-derrick` −1.090,
  `piling-leader` −0.830, `cfa-rig` −0.660, `hdd-rig` −0.439, `raisebore`
  −0.350. `rig.py` puts the origin at the slew centre at ground level. Some of
  these are correct (a raise borer hangs a string below its own floor); decide
  each on the machine's own facts and **comment the ones that are right** so
  nobody re-opens them.
- **Three machines have no first-hand dimensional source at all** —
  `foundation_bg` (its 27.100 m figure has been quoted in this project as if
  sourced; **it is not**), `crawler_th` (100 % `NOT SOURCED` on dimensions), and
  `rc_rig` (its reference states no dimensioned GA of any RC rig was found).
  `rc_rig` is also **171,908 triangles — 9× `core_rig`**, from bevels inside
  long arrays.
- **`data.js` and the model disagree about what `cable-percussion` IS.** The data
  describes an American truck spudder (9.4 t, 82 kW, `depthCapacity: 250`,
  walking beam, three lines off one winch). The model and its reference describe
  a British shell-and-auger tripod (measured 2.37 × 6.68 × 5.37 m, sourced
  **13 kW and 1,700–2,250 kg**). The machine on screen is a quarter the mass its
  own shop card claims. **This is a design decision with real consequences
  either way** — `depthWindow()` is now fleet-capped, so matching the data to the
  model would shrink every `cable-tool` contract in the game. Somebody has to
  pick.
- **`.hudqa` measured DOM growth 163 → 811 nodes (+648)** across five ordinary
  visits to the site screen. A hard gate failure. The last agent on it said
  *"both remaining failures trace to one cross-file cause"* and **that cause is
  not written down anywhere** — re-derive it.
- **`pd55` is modelled but not registered in `data.js`.** 4.56 MB of RM 20-class
  leader rig with nowhere to go. Adding it needs a `RIGS` row, a builder in
  `rigFactory.js`, and agreement between `RIGS[].methods` and `METHODS[].rigIds`
  (which `checkdata.mjs` enforces).
- **The seventeen un-cleared marque prefixes** (§3.2).

---

## 8. Failure patterns that cost the most time

These recur. Recognising them is worth more than any single fix.

**A silent fallback that works is the most expensive kind of failure** — it
removes the symptom and keeps the cause. Found **five separate times** this
session: `resolveMethodId`, three dead vfx fallbacks, a UI fallback, the model
filename mismatch, and the material substitution. In every case the code was
doing something reasonable and the only evidence was a log line nobody read.

**A gate over an empty set passes forever.** `checkreach` reported **zero
targets and called it a PASS**, for three separate reasons at once:
`document.querySelector('.screen')` returns the retained **hidden boot screen**
at 0×0; the boot screen is a **27.8 s shader compile**, not a splash, so a fixed
wait measures it; and the site screen keeps `is-entering` **indefinitely**,
during which the dock measures 682 px against its settled 227 px. **Make
"measured nothing" a failure everywhere.**

**An approximation in an instrument becomes a false finding in a report.** See
§5.

**fps is meaningless unless it is graded warm.** The same state, same machine:
**26.6 fps cold, 113.6 warm.** `tools/shoot.mjs` now measures over a 40-frame
window, warms the session first, and marks every number warm or cold. It also
detects Chrome's **1 Hz background clamp** — an occluded window once reported
1.0 fps for everything.

**Verify by measurement, not by the absence of an error.** The Blender pipeline
had *correct log lines at every step* while nothing reached the screen.

---

## 9. Architecture, briefly

```
src/main.js            boot order; awaits models BEFORE rigFactory inits
src/core/renderer.js   two scissored bands in ONE context, shared post chain
                       surface 54% / section 46%; registerBands() solves collar
src/core/env.js        every light in the game; reads getWorkLights() per frame
src/core/assets.js     ~41 procedural texture kinds, wear driven by gameplay
src/core/gltfRig.js    fetch/parse/material-swap a .glb -> a RIG_BUILDERS-shaped
                       builder. ?glb=strict refuses to draw; ?glb=off forces
                       procedural (use it to compare the two)
src/core/contract.js   BRAND palette, makeRandom, shared contracts
src/world/geology.js   THE SECTION IS A SHADER (~7k lines). Five section modes:
                       vertical | profile | raise | heading | pile
src/world/terrain.js   10 site archetypes; builds the scene from contract.archetype
src/rig/rigFactory.js  procedural machines; ensureBuild() prefers a .glb
src/rig/tools.js       270 tool ids x 3 wear levels = 825 variants, procedural
src/sim/drilling.js    the drilling model per method
src/game/data.js       6.8k lines: methods, rigs, items, regions, contracts.
                       THE CONTENT AUTHORITY. validateData() lives here
blender/lib/rig.py     the shared library and the four contracts
```

**`geology.js` has form for taking down the whole GPU process:** a single `&&`
in `FACE_FRAG` once sent D3DCompile into unbounded recursion —
`STATUS_STACK_OVERFLOW`, 0 draw calls, and 48 misleading `VALIDATE_STATUS false`
errors on innocent shaders. **Change the face shader in small steps and capture
after each one.**

---

## 10. How to work on this

**Fan out aggressively, one file per agent.** The owner's standing instruction:
*"Spawna så mycket agenter du bara kan hela tiden"* — spawn as many agents as
you can, continuously, and refill as slots free.

**Ownership is per file and must be stated in the brief.** Two agents in one
file will clobber each other. Tell each agent what it owns, what is held by
others, and to **report cross-file needs rather than editing**. That discipline
produced the best findings of the session — agents repeatedly found real bugs in
files they were forbidden to touch and handed them over precisely.

**Give every agent the hard rules from §3 verbatim.** They are not obvious and
each one was learned expensively.

**Tell agents to measure, not to reason.** Every one of the largest findings came
from someone measuring a thing they expected to be fine.
