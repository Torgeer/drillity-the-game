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
| content | **21 methods · 19 rigs · 260 items · 8 regions** |
| Blender machines | **18 of 19 modelled and exported.** Only `sonic-truck` is still procedural |
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
npm run check          # checkfacts + checkdata + checkbeds + checkmodels + checkreach
npm run check:reach     # thumb reach, both hands. PASSES. Starts its own vite if 5178
                        # is dead (tools/devserver.mjs) and needs HEADED Chrome
npm run blender        # builds every machine, per-machine PASS/FAIL, non-zero exit on any failure
```

**Do not "tidy" the leading `call` out of the `blender` script.** npm runs
scripts through `cmd.exe /d /s /c`, and `/s` strips the outer quotes of a
command that STARTS with a quote — so a script beginning with a quoted
path dies with `'C:\Program' is not recognized` before
Blender is ever launched. It did, for however long the path has had forward
slashes in it: the gate was exiting 1 without building anything, which is
ASTRA §8's "a gate over an empty set passes forever" wearing a different hat.
`call` in front means the command no longer starts with a quote. Verified:
`built=19 failed=0`.

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

### 7.3 — The two controls nobody could press — **CLOSED**

> `npm run check:reach` **passes** on all five methods — 0 hard, 0 stretch,
> 0 undeclared — and is now wired into `npm run check`.
>
> The layout failure quoted below was already fixed by `57e5035`
> (`--reach-floor`, which lifts the controls row to a centre 92 px above the
> bottom edge, out of the fold for both hands). What was still broken is that
> **the gate could not run, so nobody could see it pass.**
> `tools/devserver.mjs` resolved its vite binary with
> `require.resolve('vite/bin/vite.js')`, which throws
> ERR_PACKAGE_PATH_NOT_EXPORTED on every install of vite 5 — the package's
> `exports` map does not list that subpath — and the gate then reported
> *"vite is not installed here (run `npm install`)"* against a tree with vite
> 5.4.21 fully installed. A confident false negative aimed at the operator.
> Fixed in `478bed4`.
>
> The **sort** is now declared by the screen rather than inferred by the
> harness: `site.js` writes `data-reach="drilling" | "between"` beside each
> control with the reason, and an **undeclared interactive target fails the
> gate** (`6c229af`). The old proxy — `el.closest('.sitedock')` — was blind in
> the one direction that matters: a control used while drilling but placed
> outside the dock was scored as not-a-drilling-control and waved through.
> `.sstrip__leave` is declared `between` and measures hard for both hands **on
> purpose**: it abandons the contract, so a thumb finding it by accident is the
> failure.
>
> The reasoning below is kept, because it is the reasoning, and because the
> model's three constants are still assumed rather than sourced.

`npm run check:reach` used to fail, identically on all five methods:

```
.actionbtn   centre (334, 795)   right = HARD   left = easy
.vsl         centre  (54, 795)   right = easy   left = HARD
```

Both bottom corners. **The primary action button failed for the right thumb**,
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
numbers and change the gate**.

### 7.4 — Look-ahead uncertainty — **SHIPPED**, and this entry was wrong

**This section used to say "not started". It landed in `de59d4d` / `26c5db7`
and the API described here was wrong too** — it is `uSurvey` + `uLook`, not the
`uSurveyConfidence` / `depthAt(wp) - uDepth` this file invented.

What shipped: `lookUnc()` is a saturating exponential in metres-ahead, with
`oreConfidence` setting **both** the asymptote and the decay length. It
modulates colour, contact sharpness, pattern, sparkle, boundary wander, joints
and boulders. It is **not an overlay** — no new mesh, material or draw call —
and `max(ahead, 0)` makes it exactly zero behind the bit.

**Two things remain, and they are the ones that matter:**

1. **`geology.setSurveyConfidence()` has no caller anywhere in the repo.** The
   economy hook — the part that makes confidence something a player *buys* —
   is the gameplay, and it is the eighth declared-contract-with-no-consumer
   found in this codebase (see §8).
2. **The amplitude is below perception.** Measured, same contract same frame,
   confidence 0.55 → 1.00: **whole-band mean difference 6.74 / 255, with only
   5.4 % of pixels differing by more than 24.** For scale, `tunnel-jumbo` and
   `rockbolt` — two pictures a reviewer judged *identical* — differ by
   **12.66, twice as much**. An ×6 amplified diff shows the mechanism working
   correctly. At 1× no player will see it. The knobs are `CFG.surveyWander`
   (1.8) and `controlNear` / `controlFar` (1.4 / 18.0).

A real §7.4 violation was found and fixed on the way: **the drill log forgot
ground it had already logged.** Its LOGGED/PROJECTED frontier came from the
bit's *current* TVD, which falls on a trip-out and on the second half of every
HDD shot — so printed strengths were deleted and beds un-logged themselves. It
now uses a monotone `logFrontier()`. Still open in the same area:
`applySurvey()`'s vertical branch re-softens ground a tripped-out string has
already drilled, and the heading mode's log has **no ahead axis at all**, so it
claims perfect knowledge of ground above the crown.

### 7.5 — Open defects, measured, nobody working on them

- **`m07-core` is over its draw-call budget** — surface 82 against 80. Only
  visible once the harness started grading **warm** numbers.
- ~~**Five models sit below y=0**~~ — **DONE.** One was wrong and is fixed;
  four were right and now say so at the node.
  **`oil-derrick` was the wrong one: −1.090 → −0.300.** Its two skid-beam
  layers — the only things the rig stands on — ran from −1.090 to 0.000,
  because the file used z = 0 as two datums at once: `FLOOR_Z` is sourced as
  "drill floor height above MAIN DECK" and measured from z = 0, while
  `sub-shoe` ("base pad on the skid beam") also sat at z = 0. The beams now
  stand on the deck and the columns start on top of them, so the sourced 28 ft
  is preserved and the unsourced beam depth is what moved. The residual
  −0.300 is the well conductor passing through the deck.
  The other four are **correct and commented**: `piling-leader` −0.830 is the
  driven pile (its own statics stop at −0.175), `cfa-rig` −0.660 is the auger
  tip on `pivot:spindle` (statics stop at −0.100), `hdd-rig` −0.439 is the
  string entering the ground 1.87 m ahead of the beam nose (statics stop at
  −0.123), `raisebore` −0.350 is the pilot string through the collar. Each
  carries a note at the node saying why, and not to lift it.
- ~~**Three machines have no first-hand dimensional source at all**~~ —
  **DONE, and two of the three claims were already stale when written.**
  - **`foundation_bg`: 27.100 m IS sourced.** It is printed on p.16 of the
    brochure the builder already cited, in the upgraded-version GA, beside
    24110 · 19640 · Stroke 10000 · 1400 · 4340-5840 · R 4640 · 3000 ·
    BK 420/470/4/48. The file's decode is printed on the same drawing:
    4 460 + 19 640 + 1 500 = 25 600 and
    4 460 + 19 640 + 3 000 = 27 100, side by side. What the re-read DID
    find was a width fault: **5.065 m against a published 3 500–4 700**, caused
    by a track guard 170 mm proud of the shoe and a cab whose **wing mirror**
    was the widest object on the machine. Now **4.700 m exactly**.
  - **`crawler_th` was never 100 % unsourced** — its header already carried
    four datasheets. A fifth, Epiroc PowerROC T35 MkII 9868 0035 01e, has a
    dimensioned GA on p.4 with L1/L2, W1, H1/H2, h1/h2 and l1/l2 printed beside
    their table, which also closes the **boom angles** that left this class's
    defining motion undeclared. Width 2.765 → 2.603, every static now inside
    ±1.231; the residual is the fold ram of a boom swung into its working
    pose, which is the class's defining proportion and is documented as such.
  - **`rc_rig`: a dimensioned GA of a tracked RC rig does exist** — two, in
    fact (Epiroc Explorac 235 p.7 and Explorac 100 p.6/p.7), both now cited
    with URLs. The 235's drawing settles `rc-rig.md` §9.A: its mast really is
    an open lattice. Triangles **171,908 → 84,260** and 11.73 MB → 5.43 MB,
    all of it bevel inside arrays (480 track shoes/grousers and 332 feed-chain
    links at 108 triangles each instead of 12), with bounds and draw calls
    unchanged. Measured per primitive: the **machine** is inside x = ±1.561;
    the 7.883 m bounding box is the cyclone stand and bag rows, which is a
    wrong-NODE problem needing a runtime fix, not a wrong-size one.

  **The tool that unblocked all three, because it will unblock the next one
  too:** `crawler-th.md` §8 concluded that dimensioned drawings could not be
  read on this machine because poppler is missing. Poppler is missing — but
  **PyMuPDF is installed**, and
  `d[9].get_pixmap(matrix=pymupdf.Matrix(3, 3)).save('p10.png')` renders any
  page of any catalogue in this library legibly. Every drawing quoted above was
  read that way. **Reach for it before writing another `NOT SOURCED` entry
  about a drawing.**
- **`data.js` and the model disagree about what `cable-percussion` IS.** The data
  describes an American truck spudder (9.4 t, 82 kW, `depthCapacity: 250`,
  walking beam, three lines off one winch). The model and its reference describe
  a British shell-and-auger tripod (measured 2.37 × 6.68 × 5.37 m, sourced
  **13 kW and 1,700–2,250 kg**). The machine on screen is a quarter the mass its
  own shop card claims. **This is a design decision with real consequences
  either way** — `depthWindow()` is now fleet-capped, so matching the data to the
  model would shrink every `cable-tool` contract in the game. Somebody has to
  pick.
- ~~**`.hudqa` measured DOM growth 163 → 811 nodes (+648)**~~ — **NOT A LEAK,
  and closed.** The cause, re-derived and now written down in
  `.hudqa/measure.mjs`'s own header: `ui/shell.js instantiate()` builds a
  screen the first time it is shown and then KEEPS it, in the `screens` Map and
  as a hidden node under `.screens`. Measured cold, visit 1 saw a document with
  no garage in it and visit 2 saw one with a garage in it — the whole +648
  arrives in ONE step and is then flat, which is not what a leak looks like.
  `.screen` nodes go 2 → 4 on the same step and stop at 4 against a ceiling of
  8. The repair was to make visit 1 and visit 5 comparable with an unmeasured
  warm-up lap, after which the gate is absolute. Measured flat at 838 nodes
  across five visits.

  A **real** leak was found underneath it, invisible to any node count:
  `components.js` `mountPreview()` re-armed a `requestAnimationFrame` chain on
  `canvas.isConnected`, which is true of every canvas on every retained screen
  while `clientWidth` is 0 behind `display:none` — so one `resize` off the
  garage left **nineteen** chains reallocating canvas backing stores every
  frame for the rest of the session. Fixed in `b534bc5`.
- ~~`pd55` is modelled but not registered.~~ **DONE.** It is a rig — 19 now —
  with every stat cited against the datasheet and `renderRigId: 'piling-leader'`
  as its procedural stand-in. The `NOT_A_RIG` exemption `checkmodels.mjs` was
  carrying for it is deleted, which was the point: **the list of modelled-but-
  unreachable machines is empty.**
- **The seventeen un-cleared marque prefixes** (§3.2).

---

## 7b. Two more fixed after this file was first written

**The shop card was showing the back of every tool.** `tools.js` has always
computed `userData.preview.aim` — the direction to look FROM — and its own
comment ended *"Until preview.js reads it, this is inert."* Nothing read it. A
declared contract with no consumer, exactly like `gltfRig.builder()`. Every
bit, crown, shoe and bolt is built business-end-DOWN while the camera sat above
the equator. Raycast-measured over a 96×96 grid, the carbide the player is
buying went **3.8 % → 17.9 %** of the card on a T45 bit and **1.7 % → 8.6 %** on
a DTH bit. **Still open:** the tool covers only 8–10 % of the card because the
framing uses the bounding SPHERE, which is far larger than a long thin tool's
on-screen extent. The `* 1.9` padding exists to stop a rig's mast being
cropped, so changing it needs the coverage harness across the whole catalogue.

**`checkmodels.mjs` could not see a subdirectory.** `readdirSync` is not
recursive, so a `.glb` in `public/models/tools/` was invisible to every check
while the gate printed OK. Fixed before the first tool landed. Top-level `.glb`
files are machines and must be named for a rig id; nested ones are tooling or
site furniture under their own loader, so only the **material** rule applies to
them.

## 7c. A decision waiting on the owner: tooling in Blender

The owner asked for the whole game in Blender. An agent was briefed to convert
the tooling on the premise that **wear is a material, not geometry** — true for
machines — and it **measured that premise false for tools**:

| T45 89 mm bit | wear 0 | wear 0.5 | wear 1 |
|---|---|---|---|
| carbide Ø | 89.89 | 88.76 | 87.64 |
| carbide over body | **+1.69 mm** | +0.56 | **−0.56 mm** |
| buttons present | 13 | 13 | **6** |

That is Rockmore's four wear stages, Halco's +0.80 mm build tolerance and Boart
Longyear's scrap rule (finished when gauge ≤ body) rendered as **mesh**: buttons
flatten, the face scours away leaving survivors on pedestals, then they fall out
and leave sockets. **Ship a Blender bit with material-only wear and all of that
is deleted.**

It also found the collapse had already been done in code: **270 ids = 92 builder
functions + 178 aliases**, zero overlap. `tools.js` *is* the parametric family
library. Three options, none free: port the wear logic to Python and ship
92 × 3 = 276 GLBs; a hybrid (Blender body, procedural carbide); or leave tools
procedural because that version is **more** realistic. The recommendation on
file is the hybrid.

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
