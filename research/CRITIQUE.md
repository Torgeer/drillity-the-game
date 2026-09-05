# CRITIQUE — a second harsh verdict

**Written 2026-09-05, ~22:10.** Scope: the whole game as it renders, not the
Blender files. Read `research/rigs/_model-critique.md` first — that is the
verdict on the geometry of the first nine machines and **this file deliberately
does not repeat it.** Where I re-touch a machine it is because the defect
survived, or because a *new* machine acquired the same one.

**How to read this.** Every numbered finding carries a number I took myself or a
capture I made, plus a reproduction and the file that owns the fix. Findings
marked **[A]** came from a sub-audit I ran and are attributed as such; I have
spot-checked but not independently re-derived them. Anything I did not measure
is marked **SUSPICION** and is not a finding.

**What I did not look at.** Audio. Save/load. The economy curve over a career.
`geology.js` internals below the level of what appears on screen (a separate
section-band audit was still running when this was written). Localisation.

---

## 0. The one-paragraph verdict

**The research, the domain model and the instrumentation are better than the
game.** Twenty-one methods with genuinely different scoring, three separate
depth concepts kept honest, a hazard vocabulary that is method-native on paper,
a capture harness that verifies its own frames and grades fps warm — this is a
serious piece of work and almost none of it is visible.

**What is visible is a machine made of woven fabric standing in front of a
floating card.** Every painted surface in the fleet carries a periodic pattern
at 8–24 screen pixels and **38–46 % RMS luminance contrast** against a 5 % noise
floor — it reads as basketwork, cork or corduroy, and it is on 19 of 19 machines
in 100 % of frames. Eight of nineteen machines draw **no drill string and no bit
at all**. One purchasable rig is downloaded, parsed, and then refused by the
renderer, which silently shows the previous machine. Three of the four gameplay
captures I took show a hazard the method cannot physically have, with advice the
machine cannot follow, printed twice, next to a button describing a *different*
hazard. The performance harness prints `VERDICT: FAIL` and exits 0; **35 of the
39 verdict-bearing reports on disk say FAIL.**

The project's own diagnosis in `ASTRA.md` §8 is exactly right and is still the
whole story: *a silent fallback that works is the most expensive kind of
failure.* Every one of the five biggest findings below is one. **The pattern was
named, and then fixed one instance at a time instead of once with a gate** — and
the two machines added since (`hdd-rig`, `longhole-rig`) shipped with the
identical defect the previous critic had already written up.

---

# PART 1 — BROKEN

---

## 1. Every painted surface in the game reads as woven fabric

**Worst first because it is on every machine, in every frame, at all times, and
it is the single reason these captures do not look like an App Store game.**

Measured off `shots/r01-crawler-lite.png`, `shots/r06-core-rig.png` and
`shots/r19-raisebore.png` — luminance RMS contrast and horizontal/vertical
autocorrelation over a rectangle known to be one painted panel:

| region | mean L | RMS contrast | dominant period (screen px @2×) | autocorr |
|---|---|---|---|---|
| **CONTROL — sky, crawler-lite** | 176.4 | **5.0 %** | — | — |
| crawler-lite body paint | 90.9 | **37.6 %** | 17–19 px horizontal (harmonic 32–38) | 0.37 |
| core-rig yellow paint | 87.6 | **41.0 %** | 15–24 px vertical | **0.62–0.64** |
| core-rig dark grey panel | 67.4 | **48.5 %** | aperiodic | — |
| raisebore frame post | 101.3 | **45.5 %** | 43 px vertical | 0.58 |
| crawler-lite bright slab (foreground) | 146.9 | **41.0 %** | **7 px** vertical (harmonics 14, 22, 24, 31) | **0.74** |

The sky control establishes that 5 % is the capture noise floor. Real painted
steel on a machine, photographed, varies a few percent inside a flat panel, and
the variation comes from form shading, dirt runs and edge wear — **not from a
periodic field at correlation 0.6**.

At 2× device pixel ratio, 17 px is **8.5 CSS px on a 390 px phone**. That is the
size of a body-text glyph. A 8.5 px lozenge at 38 % contrast is not paint; it is
upholstery. Crop `shots/r01-crawler-lite.png` at (120, 470, 350, 230) and
upscale ×4: the engine cover is a **diamond-quilted mustard weave with dark ovals
scattered through it**. Crop `shots/r06-core-rig.png` at (150, 420, 400, 250):
the yellow is a **dense granular oatmeal** and the grey panel beside it is
**horizontally banded**.

The **7 px** row is worse than the others and separate: that is the bright
striped slab that dominates the foreground of the starter machine's frame. Seven
screen pixels is **3.5 CSS px** — at or below the display's Nyquist limit. It
will shimmer into moiré the instant the camera moves, and it is the brightest
object in the first frame the player ever sees.

**Reproduce.** The measurement script is 40 lines: draw the PNG region to a
canvas, take luminance, subtract the mean, autocorrelate rows and columns to 60
lags. I ran it through headed Chrome via Playwright (`channel: 'chrome'` —
Playwright's own chromium is not installed on this machine).

**Owner.** `src/core/assets.js`. `paintedSteel` (line 1589) declares
`wrap: { s: 'repeat', t: 'clamp' }` and builds an "orange peel" layer as
`worley(u*34, v*34, …)` combined at `(_W.f2 - cell) * 0.9 + vfbm(u*96, …) * 0.22`.
The comment block immediately below shows somebody already fought the *frequency*
half of this fight and won it ("fewer, larger cells at 90… the feature size is
now set by the cell, not by the threshold"). **The amplitude was never
addressed:** `* 0.9` on a cell field is an enormous albedo swing for paint.
`paintedDark` derives from it (line 3951) and inherits it, which is why the whole
fleet has it.

**The next measurement to make, which I did not:** whether one UV repeat covers
the same number of metres on every machine. `t: 'clamp'` with `s: 'repeat'` means
u tiles around the bodywork, and if the Blender boxes carry default per-face UVs
then a 3 m engine cover and a 0.4 m toolbox get the same 34 cells. That would
explain why the crawler's cell is a lozenge and the core rig's is a grain.
**SUSPICION until somebody measures it.**

---

## 2. `pd55` is purchasable, downloaded, parsed — and the renderer refuses it **[A]**

`data.js:1317` says *"The .glb is what actually draws."* `checkdata.mjs` passes.
`checkmodels.mjs` passes. `ASTRA.md` §1 counts it as one of the 18 modelled.

`rigFactory.js:9254` gates on the **procedural** table and returns before the GLB
path is ever consulted:

```js
if (!RIG_BUILDERS[id]) { console.warn('[rig] unknown rig "' + id + '"'); return false; }
```

Live browser, after `warm(['pd55'])` reports `{ok:true}` and the parse succeeds:

```
[gltfRig] "pd55" 4668.9 kB · 67 primitives · 71264 tris · 13 pivots, 9 slides, 4 lamps
[rig] unknown rig "pd55"
setRig('pd55') -> false      rig now: piling-leader      <- the previous machine stays
```

**4.78 MB fetched over the network and thrown away, and the player sees whatever
machine they were looking at before.** `rigRenderId()` — the function the entire
`renderRigId` contract rests on — has **zero callers in `src/`**; it exists only
in the harness. And `rigFactory.js:9000` boots a saved pd55 garage as
`crawler-lite`, not even the declared stand-in.

**Reproduce.** `npm run dev`, console: `__DRILLITY.rig.setRig('pd55')` → `false`.

**Owner.** `src/rig/rigFactory.js:9254`; `tools/checkdata.mjs:62` must stop
believing a mapping the runtime does not perform.

---

## 3. Eight of nineteen machines draw no drill string and no bit **[A]** — and two of them cannot hold a tool at all

`gltfRig.makeDyn()` looks up five strings. All five guards protect against
*throwing* and none against *missing*. `applyTooling()` then gates the visible
string on `if (spec.stringDia > 0 && dyn.mastLower)` and the bit on
`if (spec.surface && dyn.toolAnchor)`.

Measured live, building every rig's GLB builder and reading the resulting `dyn`:

```
GLB machines with NO dyn.mastLower: 8
  cable-percussion, crawler-th, hdd-rig, tunnel-jumbo,
  piling-leader, pd55, cpt-unit, raisebore
```

**On those eight machines there is no string in the hole and the mast never
rakes, while the HUD counts metres.** No console line, no banner, no exception.
It reads as an animation-timing bug.

I then measured the two runtime-critical names across all 19 exported files
myself, straight out of the glTF JSON chunk:

| file | `slide:carriage` | `mount:tool` |
|---|---|---|
| bolter, cable-percussion, cfa-rig, core-rig, crawler-lite, dth-crawler, foundation-bg, oil-derrick, raisebore, rc-rig, si-rig | ✓ with `travel_m` | ✓ |
| **cpt-unit** | ✓ 1.35 | **ABSENT** |
| **crawler-th** | ✓ 4.24 | **ABSENT** |
| **hdd-rig** | present, `extras: {}` — **no `travel_m`** | **ABSENT** |
| **longhole-rig** | present, `extras: {}` — **no `travel_m`** | ✓ |
| **pd55** | present, `extras: {}` — **no `travel_m`** | ✓ |
| **piling-leader** | **ABSENT** | **ABSENT** |
| **tunnel-jumbo** | **ABSENT** | **ABSENT** |
| teststub | `extras: {}` | ABSENT |

`piling-leader` and `tunnel-jumbo` have neither, so `dyn.toolAnchor` —
`mounts.get('tool') || slides.get('carriage')` — is **null on both**. Those two
machines cannot hold a tool at all. On a piling leader whose own shop row reads
*"it lifts a pile, sets it plumb and hits it."*

**The bare-node problem is worse than the previous critic found, not better.**
Named nodes carrying **no `extras` at all**: `pd55` 28 of 32, `tunnel-jumbo` 30
of 50, `longhole-rig` 28 of 42, `crawler-th` 20 of 30, `cfa-rig` 18 of 26,
`oil-derrick` 18 of 36, `hdd-rig` 17 of 22.

**And five dialects are still in use for one concept.** Across the fleet the
slide nodes carry: `travel_m`, `travel_min_m`/`travel_max_m`, `stroke_m`,
`range_m`, `travel_lo_m`/`travel_hi_m`, `travel_up_m`/`travel_down_m`. The
runtime reads exactly one of them.

**Reproduce.** Parse each `public/models/*.glb`'s JSON chunk and look for a node
named `slide:carriage` with `extras.travel_m > 0`, and one named `mount:tool`.

**Owner.** `blender/<machine>.py` for the names; the missing gate belongs in
`tools/checkmodels.mjs`.

---

## 4. The fix for #3 was applied per machine and never gated — so the two newest machines shipped with the identical defect

`research/rigs/_model-critique.md` §3.1 diagnosed this exactly and its **single
highest-value recommendation** was: *"write the `extras` vocabulary into
`blender/lib/rig.py` as named constants, make `finish()` refuse to export a
`slide:` or `pivot:` node with no declared range, and add a `tools/glbverify.mjs`
gate asserting `slide:carriage + travel_m` and `mount:tool` on every model."*

What happened instead: `cfa-rig` and `rc-rig` were fixed individually (commit
`e8c64ac`, and `rc-rig`'s `range_m` became `travel_m`). **No gate was written.**
`hdd-rig` and `longhole-rig` — both added *after* that critique — arrived with
`slide:carriage` carrying an empty `extras` object.

And the check that does exist is vacuous in precisely the broken cases.
`tools/glbverify.mjs:156`:

```js
const carriageOk = !b.dyn.carriage
  || (Array.isArray(b.dyn.carriageRange)
    && (typeof b.dyn.mastHeight === 'number' || b.dyn.carriageNoFlex === true));
```

`piling-leader` and `tunnel-jumbo` have no carriage → `!b.dyn.carriage` → **pass**.
`hdd-rig`, `longhole-rig`, `pd55` have a carriage with no `travel_m` → `makeDyn`
sets `carriageNoFlex = true` → **pass**. The gate named "the carriage invariant"
returns true for every machine whose carriage is dead, and false for none. It is
also **in no npm script**, so it never runs anyway.

**Owner.** `tools/glbverify.mjs:156` and `package.json`.

---

## 5. Generic hazards leak into methods that have their own, with advice the machine physically cannot follow

`GAMEDESIGN.md` §3b is explicit: the seven generic hazards are *"the vertical
borehole hazard set"*, and every method brought its own, *"and the point of every
one is that it has no drilling answer."* Three of the four gameplay states I
captured show the generic set instead.

| capture | banner | why it is impossible |
|---|---|---|
| `shots/base-m16-tunnel-jumbo.png` | **WATER — "Lift it or case it"** | You do not case a blast hole in a tunnel face. §3b's jumbo hazards are `collar-slip`, `cut-choke`, `bad-ground` |
| `shots/base-m18-longhole.png` | **WATER — "Lift it or case it"** (identical string) | You do not case a production longhole. §3b: `hole-blocked`, `uphole-flush`, `rod-whip` |
| `shots/r19-raisebore.png` | **BOULDER STRIKE — "Torque spike — back off feed, raise percussion"** | **A raise borer has no percussion.** §3b: two-pass methods get `pull-stall` |

The raisebore frame is the worst of the three because it contradicts itself
inside one screen: the banner says BOULDER STRIKE and the primary button, 1,200
px below it, says **`KILL FEED / Lost return`** — a *different* hazard. Two
simultaneous, mutually exclusive hazard prompts.

**Owner.** `src/sim/drilling.js` (hazard selection per method) and
`src/ui/screens/site.js` (the banner and the action button must read one source).

---

## 6. Every hazard is stated two or three times at once — the exact failure 7a was written for

`REVIEW_RUBRIC.md` axis 7a: *"State any value **once**: a baseline screen showed
the resin mix three times at once, as a slider, a gauge bar and a text card."*
Measured across four captures:

| capture | statement 1 (banner) | statement 2 | statement 3 |
|---|---|---|---|
| `r01-crawler-lite` | "ROD JAM / Work the string free — tap repeatedly" | button `WORK FREE / String is stuck` | `ROP 0.0` + torque needle pinned at 100 % |
| `base-m11-rockbolt` | "RESIN GELLING / Stop the rotation now" | card `RESIN BOLT CURING 1.7 s — STOP the rotation — the resin is gelling` | `SPIN·GEL·HOLD` segmented bar, **plus** the `MIX 72` slider |
| `base-m21-raise-boring` | "STUCK / Work the string on the beat" | button `WORK FREE / String is stuck` | `ROP 0.0` |
| `r19-raisebore` | "BOULDER STRIKE / …back off feed, raise percussion" | button `KILL FEED / Lost return` | — (and they disagree, see #5) |

`base-m11-rockbolt` also puts three **contradictory** instructions on one screen
simultaneously: *"Stop the rotation now"*, *"STOP the rotation"*, and
*"HOLD — Steady on the groove"*.

**Owner.** `src/ui/screens/site.js`.

---

## 7. The wrong tool is fitted on every method the harness photographed — and the harness says so

`shots/base-report.txt`, written 19:27 today, per-shot detail line for **all
four** methods captured:

```
m11-rockbolt      … tooling=shank-adapter/button-bit · bit=auger-flight-std (DOES NOT FIT THIS METHOD)
m16-tunnel-jumbo  … tooling=shank-adapter/button-bit · bit=auger-flight-std (DOES NOT FIT THIS METHOD)
m18-longhole      … tooling=shank-adapter/button-bit · bit=auger-flight-std (DOES NOT FIT THIS METHOD)
m21-raise-boring  … tooling=-/raisebore-pilot-bit    · bit=auger-flight-std (DOES NOT FIT THIS METHOD)
```

An **auger flight** fitted to a tunnel jumbo, a rock bolter, a longhole
production rig and a raise borer. The harness detects it, prints it in capital
letters, and the run still verifies `ok` and exits 0.

`m21-raise-boring` compounds it: the state line reads `stage=1/2 (ream)` while
the tooling reads `raisebore-pilot-bit`. `GAMEDESIGN.md` §7 says stage 1 is the
**pilot down** and stage 2 is the **reamer up**. Stage 1 is labelled ream and
carries the pilot bit — one of the two is wrong, and both are on screen.

**Owner.** `src/game/data.js` (the default loadout per method) and
`tools/shoot.mjs` (make the "DOES NOT FIT" detection fail the run).

---

## 8. The performance harness prints `VERDICT: FAIL` and exits 0. 35 of 39 reports on disk say FAIL **[A]**

`tools/shoot.mjs` has three `process.exit*` sites in 1,728 lines. `writeReport()`
— which computes every budget breach — contains **no `exitCode` write at all**.

```
$ grep -ac "VERDICT: FAIL" shots/*-report.txt  ->  35 files
$ grep -ac "VERDICT: PASS" shots/*-report.txt  ->   4 files
```

My own run tonight (`shots/report.txt`, 19:41, all 19 rigs, HEADED, warm):

```
  draw calls   surface ≤ 80   section ≤ 60   rig ≤ 70      frame rate ≥ 60 fps
  VERDICT: FAIL
    surface   over budget in 4 state(s): r08-rc-rig=83 r11-bolter=85 r14-tunnel-jumbo=89 r17-longhole-rig=85
    rig       over budget in 1 state(s): r14-tunnel-jumbo=73
    fps       over budget in 1 state(s): r17-longhole-rig=59.2
```

**`ASTRA.md` §7.5 lists exactly one over-budget state (`m07-core` at 82). There
are six**, and `shots/ar5-report.txt` records `rig m11-rockbolt=125` against a
ceiling of 70 — **79 % over** — and exited 0.

The **59.2 fps** matters most. That is the `longhole-rig` portrait on a desktop
discrete GPU with the session warmed for 28.8 s. `GAMEDESIGN.md` §6 targets
60 fps on a mid iPhone. A machine that cannot hold 60 on this hardware will not
be close on a phone.

Two further holes in the same file **[A]**: `:1555` `if (!m || m.error) continue;`
skips every state whose metrics threw, so an all-metrics-fail run prints
`VERDICT: PASS`; and `:1542` asserts *"Every id in the manifest and every rig in
data.js has a frame in this run"* over zero methods and zero rigs.

I also hit the abort path twice tonight — once with `renderer: NO WEBGL CONTEXT`
and `[boot] FATAL: game/data.js failed to load`, once with `page.goto:
net::ERR_ABORTED`. Nothing was captured. **Unpiped exit code: 0.**

**Owner.** `tools/shoot.mjs:1568`, and `package.json` — nothing runs it.

---

## 9. The drilling HUD is a floating card. The 3D gets 66 % of the screen against a spec of ~82 %

Measured on the live site screen, iPhone 13 Pro viewport (390 × 664 CSS px),
`getBoundingClientRect()` on every visible element:

```
canvas               [0, 0, 390, 664]     — full-bleed, 4 canvas elements
.sstrip              [29, 0, 332, 52]     bg rgba(13,18,25,0.953)
.sitedock            [29, 454, 332, 210]  bg rgb(13,18,25)
```

- **The dock is 332 px wide on a 390 px screen.** There are **29 px of live 3D
  running down each side of it**, and 29 px down each side of the status strip.
  That is not "reserved space in a stacked layout" — that is a card floating over
  the render, which is the thing the owner objected to in the first place.
- **The dock is 210 / 664 = 31.6 % of the screen.** `GAMEDESIGN.md` §1 budgets
  the gauges and sliders from ~82 % to 100 % — **18 %**. The dock is **1.76× its
  brief.**
- 3D visible: 664 − 52 − 210 = **402 px = 60.5 %** as a clean band, 66.4 %
  counting the side gutters. Against ~82 % specified.
- `.sstrip` is `rgba(13,18,25,0.953)` — **a semi-transparent scrim over the 3D**.
  Rubric 7a forbids it by name.

In the captured frames the section band carries four more overlays: the amber
depth pill (`25.89`, `13.30`, `6.51`, `11.53` — half of it hangs off the right
edge in three of four captures), the left log gutter, the right ruler gutter, and
the scale legend (`DEPTH 1:1 · BORE 7.1:1 · Ø 152 mm DRAWN 1086 mm`). The gutters
are translucent panels through which the strata are visible.

**Owner.** `src/ui/screens/site.js` and its stylesheet.

---

## 10. The only way out of a job is a 30 × 30 px button in the worst corner, and the reach gate is written to excuse it

```
30x30  centre (334, 25)  UNDER 44  button.sstrip__leave  ""
```

Every other target on the screen is ≥ 44 px (`65×68` sliders, `88×68` action
button). This one is 30 × 30, unlabelled, top-right — the far corner for a right
thumb *and* outside the arc for a left one.

`npm run check:reach` passes with `hard 0` because the sort puts it in
`between jobs, outside the arc (reported — for some of these that is the point)`.
**The sort is declared by the screen being tested** (commit `6c229af`, "the sort
is declared by the screen"). A screen that misplaces a control can exempt it by
relabelling it.

And `tools/checkreach.mjs:9` states: *".hudqa/measure.mjs already **gates** on
44 × 44 css px and on overlap, and both pass."* **Nothing in `package.json` runs
`.hudqa/measure.mjs`** [A]. A 30 × 30 target ships under a comment claiming a
gate covers it — ASTRA §8's highest-value bug class, verbatim.

**[A]** also found that `checkreach` scores a *point*, not a *control*:
`.actionbtn` has **24.1 % of its area inside the gate's own HARD zone for the
right hand** (its centre clears the inner radius by 15.5 px; its nearest corner
is 37.3 px *inside* it). The two controls §7.3 named as the original failures are
still the two with a quarter of their area in the hard zone, for the same hands.

**Owner.** `src/ui/screens/site.js` (make the leave control ≥ 44 px and move it),
`tools/checkreach.mjs:322` (evaluate the rectangle, not the centre),
`package.json`.

---

## 11. The contract board — the first real decision in the game — truncates five strings and offers no decision

`shots/03-contracts.png`, 390 px portrait:

- **`AUGER DRIL…`** — the method name, the single most important field on a
  contract card, ellipsised on all three visible cards.
- **`FOUNDATION / P…`**, **`SITE INVESTIGA…`** — the application, ellipsised.
- **`SORT`** clipped at the left screen edge; **`Deepes`** clipped at the right.
  The sort row is a horizontal scroller with no fade, no chevron and no
  affordance — it reads as broken layout.
- **The thumbnail is byte-identical on all three cards** — the same beige
  speckled sample column. Three different jobs, one picture.
- **All three visible cards are the same method** (auger), the **same ground**
  (`Topsoil → Glacial Till · 2 MPa`) and the **same deadline** (`6h`), and two
  are the same application. On a board of five, the three above the fold present
  nothing to choose between.
- Card height ≈ 187 CSS px under 142 px of header and chips, so **2.5 cards fit
  above the fold**.
- The **signal-strength bars** top-right of each card are unexplained and
  unlabelled. Rubric 7a: nothing on screen the player does not act on in 3 s.

Two domain problems on the same three cards:

- **"Window sample traverse", method AUGER DRILLING, `Ø248 mm`.** Window sampling
  is percussive dynamic sampling in 60–80 mm liners. It is not augering and it is
  not a 248 mm hole.
- **`Ø204 / Ø248 / Ø266 mm`.** 204 ≈ 8″ is fine. 248 and 266 are not standard
  auger sizes (108 / 133 / 152 / 165 / 203 / 254 / 305). They read as invented
  numbers, which is exactly the "we don't wanna look stupid" failure.

**And the shipped capture carries a developer error dialog across the bottom
23 % of the screen:**

> **Machine model unavailable** — crawler-lite could not be loaded… *this is a
> bug, please report it.* · `http://localhost:5178/models/crawler-lite.glb is not
> a GLB — the server answered with something else (1229 bytes). This is usually
> an SPA fallback page, not a model.`

**Credit: this is the right instinct and the opposite of a silent fallback.** But
it is shipped user-facing UI in the tone of a stack trace, with a raw URL and a
byte count, in a game aimed at the App Store front page. It needs a player-facing
face and a developer-facing console line, not one string doing both.

**Owner.** `src/ui/screens/contracts.js`, `src/game/data.js` (contract copy and
diameters), `src/core/gltfRig.js` (the error surface).

---

## 12. The raise borer is a bare-box pergola, and both versions of it fail

`shots/r19-raisebore.png` and `shots/base-m21-raise-boring.png`. Crop
(230, 240, 300, 220) ×4 and look at it: **four square posts, three square rails,
a dark slab on top, two bare cylinders inside.** No fasteners, no gussets, no
flanges, no weld beads, no lifting eyes, no chamfers. Rubric axis 4 —
*"primitives left visible as primitives (a bare box, a bare cylinder) = automatic
fail"* — five of them.

A raise borer is one of the densest machines in mining: a thrust frame reacting
thousands of kilonewtons, a gearbox the size of a car, a power pack, bolted to a
poured pad. `blender/raisebore.py`'s own header cites the pad and the tie-down
bolts. What is on screen is a market stall.

**Both paths fail, and the Blender one costs a third of the frame budget.** I
captured all five states twice, once normally and once with `?glb=off`:

| machine | GLB draws / fps | procedural draws / fps |
|---|---|---|
| `raisebore` | 28 / **61.3** | 29 / **90.9** |
| `tunnel-jumbo` | **73** *(over the 70 budget)* / **67.6** | 63 / **90.1** |
| `crawler-lite` | **27** / 128.2 | 43 / 128.2 |
| `core-rig` | 45 / 103.1 | 48 / 111.1 |
| `foundation-bg` | 31 / — | 38 / — |

**Say it plainly, as asked.** The Blender machines are better on `crawler-lite`
(27 draws against 43, same fps) and on `core-rig` (marginal both ways, and the
geometry is far better). They are **worse on `tunnel-jumbo`** — 10 more draw
calls, over the hard budget, and **25 % slower** — and **worse on `raisebore`**,
which is **33 % slower for a machine that still reads as a step-stool**
(`shots/proc-r19-raisebore.png` is four yellow posts and three rungs; the GLB at
least has a top slab and side blocks). The procedural raise borer is not better;
it is differently bad and cheaper. **Neither should ship.**

**Owner.** `blender/raisebore.py`, `blender/tunnel_jumbo.py`.

---

## 13. Domain truth: the numbers a driller would check **[A]**

A full audit of `src/game/data.js`, `src/sim/drilling.js` and the research packs
is in my sub-audit; the findings that would embarrass us most:

**13a. The rock-bolt model punishes the correct bit.** `drilling.js:1447` runs
`bitMmIdeal: 33.0`, `bitMmZero: 39.5` — anchorage ramps to zero at 39.5 mm. The
comment on the same line, and `research/03-mining.md:388`, both say *"1.5″ bit for
a 39 mm bolt"* = **38.1 mm**, and the real SS-39 spec is a 35–38 mm hole. **The
manufacturer-recommended bit scores 21 % anchorage.** The shop copy compounds it:
`bolt-bit-33` is sold as *"The right bit… the reason the bolt holds what the
drawing says"* (it is 5 mm below the tested range) and `bolt-bit-38` — the correct
one — is *"the one that makes a bad habit look fine for a year."* A bolting crew
would spot this in one shift.

**13b. Cable tool is 13–27× too fast against this project's own research pack.**
`drilling.js:814 ropMax: 4` m/h, flat across 2–120 MPa. `research/rigs/cable-percussion.md:578`:
*"10 to 30 feet per day"* (3–9 m/day); hard rock 1.5–3 m/day. 4 m/h is 40 m in a
10 h day. `data.js`'s own `nominalRop: 1.6` is already 2–5× over.

**13c. `nominalRop` and the sim's `ropMax` are two rate tables, unreconciled, and
nothing compares them.** `estimateHours()` prices the job from one; the sim
drills it at the other. Ratios of **2.1× to 6.7×** across 14 methods
(`rotary-kelly` 9 vs 60, `sonic` 12 vs 65, `jet-grouting` 4 vs 23).
`checkdata.mjs:95` compares **one** field between the two files — `rodLength`.
`HANDOFF.md` §8B's own lesson: *two tables describing one thing will drift, and
the one that is wrong will be believed.*

**13d. `core` beats its own pack's fastest size, and beats `sonic` in sonic's own
ground.** `ropMax: 22` against `research/02-prospecting.md`'s NQ band of
5.2–12.6 m/h and an AQ ceiling of 20.4. The packs say sonic is *"up to four
times"* core; the game makes core **2.3× faster than sonic** at 25 MPa.

**13e. Jet grouting is assigned to a top-hammer crawler — and the file argues
against itself.** `crawler-th` is the **only** rig for `jet-grouting`, and
`data.js:1146` states the rule that kills it: *"This machine's mast carries a
hydraulic DRIFTER… A down-the-hole hammer needs a rotary head with real torque."*
A 700-bar jet monitor needs the same. `data.js:1051`'s own comment describes the
machine it should be and then points at a different one.

**13f. The driven-pile hammer the player buys is not the hammer the sim drives.**
Card, method row and item all say **9,000 kg / 106 kNm / 1,200 mm**. `drilling.js:1539`
runs **16,000 kg / 1.5 m = 235 kNm**. **2.2×.**

**13g. Three regions are not the geology they are named for.** `andes` "Andean
Copper Mine" is `schist / granite / quartzite` — a Chilean copper mine is a
**porphyry** system, and there is no porphyry, andesite or diorite anywhere in
the `GROUND` table. `arctic` models permafrost as a 6–18 m **stratum** with
unfrozen till beneath it — permafrost is a thermal state 100–500 m thick and the
till below is frozen too. `german-site` puts limestone under the Emscher marl;
the Rhein-Ruhr bedrock is Carboniferous sandstone/shale/coal measures.

**13h. FACTS is green and two of its 36 lines are still wrong.** `checkfacts`
enforces **string identity only**, exactly as `FACTS_VERIFIED.md` warns. *"Families
do not mix"* — the game's own shop sells `adapter-r32-t45` "Drive Adapter R32 to
T45". *"Past about seventy percent worn, penetration falls off a cliff"* has no
field basis; it is a tuning constant in a driller's voice. And the line rewritten
specifically to stop omitting a thread family still omits **GT60** and
**ST58/ST68**, both tabulated in `research/12`.

**13i. What `checkdata` and `checkbeds` cannot see.** Not one rate. Not one
diameter (`rotary-kelly` advertises 3000 mm piles on a fleet whose best rig is
178 kNm; `hdd` advertises 1200 mm with a 350 mm reamer; `raise-boring` advertises
6000 mm with a 1800 mm head). Not one `depthCapacity` against a `depthRange`.
Not price magnitude or monotonicity — the **45 mm bit costs €420 and the 64 mm
costs €312**, and the bolting bits get *cheaper as they get bigger* (214 → 178 →
142). Not whether a rig can be sent where its method works — the 6 m underground
bolter is sold `anchor`, whose archetypes are five surface sites and whose
`depthRange` is 3–40 m.

**Owner.** `src/game/data.js`, `src/sim/drilling.js`, `tools/checkdata.mjs`.

---

## 14. The section band: the scales are declared, the labels are not legible

**Credit first, because two of `ASTRA.md` §7.2's open items are closed and the
next reader should not re-open them.** The bore exaggeration **is** badged
(`BORE 7.1:1` · `Ø 152 mm DRAWN 1086 mm` · `×7.1 Ø`), the vertical exaggeration
**is** badged in `heading` mode (`CHAINAGE 1 u = 2.4 m · V.E. 2.4:1`), and
look-ahead uncertainty **has started** — `LIMESTONE 90 MPa` carries a
**`PROJECTED`** marker in `shots/base-m11-rockbolt.png` and
`shots/base-m16-tunnel-jumbo.png`. That is the right instinct applied to the
right thing.

What is broken, from four captures:

- **The log gutter labels are clipped on every single capture.**
  `shots/base-m21-raise-boring.png` reads **`AVEL`**, **`CLAY`**, **`ARL`**;
  `shots/proc-r19-raisebore.png` reads **`AND SOIL`**, **`VEL`**, **`LAY`**;
  `shots/r01-crawler-lite.png` puts `GLACIAL TILL` flush against x = 0 with no
  margin. The gutter is drawn at negative x and the strata names — the one thing
  in the band a driller reads first — are cut in half.
- **The `×7.1 Ø` badge is clipped by the band's right edge** in all four
  captures; the trailing `m` sits on the boundary.
- **The depth pill hangs off the right edge** in three of four captures
  (`25.89`, `13.30`, `11.53`).
- **The `SHALE` label is cut in half by the dock's top edge** in the rockbolt and
  jumbo captures.
- **Three scales on one 390 px band** — `DEPTH 1:1`, `CHAINAGE 1 u = 2.4 m /
  V.E. 2.4:1`, `BORE 7.1:1` — set in ~9 px monospace at low contrast against a
  moving render.
- **Boulders read as popcorn.** In `r01-crawler-lite`, `base-m21-raise-boring`
  and `r19-raisebore` the clasts are smooth pale lobate blobs. They are the
  highest-contrast objects in the band and they read as vegetables. Real till
  clasts are angular to sub-rounded, in a matrix that shares their colour.
- **In `base-m16-tunnel-jumbo` the excavated drive is a flat black rectangle**
  occupying the left-centre of the band with nothing in it — and for a method
  scored on *pull per round and overbreak*, the round pattern, the previous
  round's profile and the overbreak are all absent.

**SUSPICION, not a finding:** in `shots/base-m21-raise-boring.png` the state line
says `section=raise` and the band draws a plain vertical hole through
sand/gravel/clay with a normal depth ruler — no second level, no reamer, nothing
running upward. I did not instrument the mode selector, so I cannot say whether
this is a silent fallback to `vertical` or a QA-bridge artefact. **A dedicated
section-band audit was running when this was written and should settle it.**

**Also SUSPICION:** raise boring through sand, gravel and clay appears in two
independent captures. You cannot raise-bore unconsolidated ground.

**Owner.** `src/world/geology.js`.

---

## 15. `dist/` ships 35.7 MB of models that can never be requested **[A]**

`dist/models/` holds 12 files, 41,862,716 bytes. Eight of them are the
**underscored module names** the pipeline says were fixed (`cfa_rig.glb`,
`core_rig.glb`, `crawler_th.glb`, `dth_crawler.glb`, `foundation_bg.glb`,
`piling_leader.glb`, `rc_rig.glb`, `tunnel_jumbo.glb`), plus `pd55.glb` (which
the renderer refuses, #2) and `teststub.glb` (not a rig).

**Loadable: 6,133,092 bytes. Unreachable: 35,729,624 bytes — 85.4 %.** And 10 of
19 rigs have no model in `dist` at all.

The 2.686 MB single-file property does hold (`dist/index.html` is 2,821,276 B,
one `<script>`, one external stylesheet). But a player's first load is that plus
a 2.48 MB `crawler-lite.glb` — **5.2 MB before they see a machine** — from a
directory 85 % of which is dead weight.

**Owner.** `tools/checkmodels.mjs` (extend to `dist/models` after a build).

---

## 16. `teststub.glb` ships, `glbinfo` calls it INCOMPLETE, and exits 0

```
teststub.glb   3.242 × 3.588 × 2.890   ground +2.325   5 draws   INCOMPLETE (2 prim)
```

`tools/glbinfo.mjs`'s own header claims it *"REFUSE[S] TO REPORT A NUMBER IT
CANNOT MEASURE"*. It reports the number, flags it INCOMPLETE, and
`process.exit(0)` unconditionally at line 391 **[A]**. It is in no npm script.

---

## 17. A shader in the section band has an uninitialised variable, on every frame

`shots/base-report.txt`, console section:

```
THREE.WebGLProgram: Program Info Log: (257,1): warning X4000: use of potentially
uninitialized variable (f_boreSDF)
(295,1): warning X4000: use of potentially uninitialized variable (f_boreSDF)
```

Two sites, in the bore signed-distance function, in the shader that draws the
game's signature element. Uninitialised reads are undefined behaviour: HLSL/D3D
happens to give you something, and a Mali or Adreno driver on the target platform
is under no obligation to give you the same thing. `ASTRA.md` §9 records that
`geology.js` has already taken down the whole GPU process once via `FACE_FRAG`.

**I did not reproduce this on mobile hardware. It is a warning I read in a report
I generated, not a rendering defect I observed.**

**Owner.** `src/world/geology.js`.

---

## 18. Smaller, measured

- **`terrain.js:236`'s "every material kind assets.js knows about" list is 20 of
  41**, and the documented fallback is wrong: the comment says an unknown kind
  *"silently falls back to rawSteel"*; the code at `:1645` substitutes **`dirt`**.
  Missing from the list: `castConcrete`, `shotcrete`, `resin`, `galvanised`,
  `mesh`, `blastedRock`, `timber`, … and **`paintedDark`**, the kind of the
  original fleet-wide bug. Nothing compares the two lists. **[A]**
- **`tools.js:325`** wraps every one of ~260 material requests in
  `try { … } catch (e) { /* assets not ready */ }` with **zero console output**.
  Any exception inside the 5,000-line foundry is indistinguishable from "not
  booted", and the entire procedural texture system collapses into 33 flat
  colours that read as art direction. **[A]**
- **`vite.config.js`'s `NEVER_INLINE` guard is dead code** — `viteSingleFile()`
  on the next line overwrites `assetsInlineLimit` with `() => true`. Measured
  before/after the plugin's config hook. The comment says *"This is the guard for
  when they do, and it is here because the failure it prevents is invisible."*
  **[A]**
- **`?glb=strict` is silently ignored on three paths**, and `buildPreview()`
  never consults the GLB system at all — **every shop and garage preview in the
  game is the procedural machine**, even when the `.glb` loaded cleanly. **[A]**
- **Every GLB machine's feed travels the wrong way.** `gltfRig.js:595` builds
  `[y, y + travel]` (ascending); all 18 procedural assignments in `rigFactory.js`
  are descending. Measured: **17 of 19 GLB machines ASCENDING, 2 FROZEN, 0
  descending.** **[A]**
- **`checkbeds.mjs:139` drops a null contract before it is counted**, so with
  `makeContract` returning null it prints `TOTAL 0 / 0` and *"OK: every sampled
  contract bottoms in ground its method can drill"*, exit 0. Latent today. **[A]**
- **`checkmodels.mjs`'s material gate runs zero iterations on a fresh clone** —
  `public/models/*.glb` is gitignored and the empty case is an explicit pass. It
  still reports only `sonic-truck` as unmodelled with **zero** models on disk,
  because `missing` comes from `build.py`'s list, not from the directory. **[A]**
- **`body.booted` is not the end of the boot screen.** In one of my runs the
  class was set at 4,763 ms and the boot screen was still on screen at
  *"Rig assembly 50 %"* with 42 DOM nodes. Any harness that waits on that class
  and then measures is measuring the loading screen.
- **Boot time is wildly variable and nobody has bounded it.** Five measurements
  tonight, same tree: `body.booted` at **3.7 / 3.8 / 4.7 / 7.2 / 9.0 s** on a
  private server; `shoot.mjs` reported **7.1 s** and **10.5 s**; `checkreach`
  reported **"boot cleared after 27.0 s"** on the shared server; and one failed
  run sat on the boot screen for **70.5 s** before giving up. **ASTRA's flat
  "27.8 s shader compile" is one point on a 3.7–70 s range**, and the range is
  the finding.
- **`ASTRA.md` §1 said "18 rigs" and "145 commits, all pushed".** Measured:
  **19 rigs**, **170 commits today, 10 unpushed**. **[A]** (§1's rig count was
  corrected while the audit ran.)

---

# PART 2 — CHOICES I DISAGREE WITH

These are not defects. I would argue them.

1. **11 px carries the drilling screen.** Measured font sizes on the site screen:
   **`11px` × 14, `13px` × 6.** Two sizes is correct restraint. But 14 of the 20
   text elements are 11 px, and they include every slider label, the groove
   multiplier and the action button's subtitle. The stated player is standing up,
   one-handed, possibly in sunlight, possibly in gloves. 11 px is the iOS floor
   for *non-essential* labels. `FEED 45` is not non-essential.
2. **Six spacing values on one screen.** `gap` census: `2, 3, 4, 5, 8, 12 px`.
   `2, 3, 5` are off any scale. Two corner radii (`10px`, `14px`) on the site
   screen, three more (`14, 24, 999`) on the menu. The rubric asks for one
   spacing scale and one radius; this is close enough to be worth finishing.
3. **The three sliders are 65 × 68 px stacked side by side in the bottom-left.**
   They pass the reach gate. They are also the three controls the player holds
   *continuously* while a fourth (`Hold`) is the one they tap. I would put the
   continuous controls under the thumb and the discrete one where the eye is.
4. **`CLEANING 30` as a PROTECT label.** Correct per `GAMEDESIGN.md` §7's rule
   (`flushMedium: none` → "hole cleaning"), and meaningless as a control label. A
   driller knows what flushing is; nobody knows what "cleaning 30" commands.
5. **`Balance €4,500` and `LVL 1` in the drilling status strip.** Neither is
   actionable mid-hole. Rubric 7a says nothing on screen the player does not act
   on within three seconds; two of the four status values are inert.
6. **The starter site is a Nordic forest in a sand-dune desert.** `r01-crawler-lite`
   puts flat low-poly spruce on horizontally-terraced beige dunes.
   `GAMEDESIGN.md` §1's one-line pitch is *"a beaten crawler and an auger flight
   in the Nordic forest"*. This is the first frame of the game.
7. **`holeDiaRange` means five different things** — hole, pile, column, reamer,
   pile again. A driller reading *"jet grouting, hole 600–4000 mm"* reads it as a
   hole. **[A]**
8. **Underground machines are ~2× under-priced** while consumables are over.
   `tunnel-jumbo` €495k (real twin-boom 800k–1.4M), `bolter` €460k (real
   900k–1.5M). Not wrong, but the shop's relative prices teach the player a false
   economy. **[A]**

---

# PART 3 — WHAT IS RIGHT (do not "fix" these)

Stated so the next agent does not burn a day re-deriving them.

- **The bore and V.E. exaggerations are now declared on screen.** `BORE 7.1:1`,
  `Ø 152 mm DRAWN 1086 mm`, `CHAINAGE 1 u = 2.4 m · V.E. 2.4:1`. ASTRA §7.2's
  complaint is closed.
- **Look-ahead uncertainty has started** — the `PROJECTED` marker in the log
  gutter. ASTRA §7.4 calls it "not started"; it is not finished, but it exists.
- **`check:reach` is wired into `npm run check` and passes.** ASTRA §7.3's two
  named failures are gone from the centre-point test (see #10 for what remains).
- **The `pivot:`/`aim:` lighting half of the node contract works.** All 55 lamps
  across the fleet pair correctly; no orphan aims; per-lamp cones and ranges.
- **The `.glb` files are clean of manufacturer names** — string-scanned across
  node, mesh, material and `extras` blocks.
- **Hard rule 3 holds at runtime**: 0 of 106 live materials carry
  `transmission > 0`. **[A]**
- **`blender/lib/rig.py`'s `_selfcheck()` genuinely raises** on both primitives,
  and there are no compensations left in the machine modules. **[A]**
- **A very large amount of the domain data is digit-for-digit correct** —
  wireline hole sizes AQ 48 → PQ 122.6, every DTH shank↔bit pairing, every
  top-hammer thread↔diameter, RC circulation direction stated correctly, the
  whole SPT and CPT specification, driven-pile refusal criteria, jumbo look-out
  and cut burdens, the 9 t ram → 106 kNm arithmetic. **[A]**
- **The model-unavailable banner is honest.** It is the right behaviour wearing
  the wrong clothes (see #11).

---

# PART 4 — The single change

> ## Give every gate a set it cannot be empty over, and a non-zero exit — starting with the four names `gltfRig.js` looks up.

Not the fabric paint, though that is #1 on the list and the thing you *see*.
Here is why.

Every finding in Part 1 above the domain section is the same finding. `pd55`
downloads and is refused — no error. Eight machines draw no drill string — no
error. Two machines cannot hold a tool — no error. `?glb=strict` falls back
anyway — a warning. Every preview in the shop is the procedural machine — no
error. The material list in `terrain.js` is stale by 21 entries with a comment
saying it is asserted — no error. `NEVER_INLINE` is overwritten by the next line
— no error. `VERDICT: FAIL` — exit 0. `teststub.glb INCOMPLETE` — exit 0. 35 of
39 reports say FAIL and the build is green.

**The project already knows this.** `ASTRA.md` §8 names it, names five instances,
and says *"Make 'measured nothing' a failure everywhere."* And then the fix for
the carriage contract was applied to `cfa-rig` and `rc-rig` **one machine at a
time**, no gate was written, and the next two machines built — `hdd-rig` and
`longhole-rig` — arrived with the identical defect. That is the whole argument:
**a class of bug that is fixed instance-by-instance reproduces itself at the rate
new content is added.**

The concrete first move, and it is an afternoon:

1. Write the `extras` vocabulary into `blender/lib/rig.py` as named constants —
   one key per concept, `travel_m` and no synonyms. Make `finish()` **refuse to
   export** a `slide:` or `pivot:` node with no declared range.
2. Extend `tools/checkmodels.mjs` to assert, **per rig id, out of the exported
   file**, the four names `gltfRig.js` actually looks up — `pivot:mast`,
   `slide:carriage` **with `travel_m > 0`**, `mount:tool`, and a non-empty lamp
   set — and to **fail on an empty model directory** instead of calling it fine.
3. Make `writeReport()` in `tools/shoot.mjs` set `process.exitCode` on any budget
   breach, and make **zero captured states** a failure.
4. Wire `glbverify`, `glbinfo`, `glbpack --check` and `.hudqa/measure.mjs` into
   `npm run check`, and delete `glbverify`'s vacuous `carriageOk` — it returns
   true for every machine whose carriage is dead.
5. Then fix the eight machines. The gate will tell you when you are done, and it
   will tell the next author the same thing on the day they add machine twenty.

The fabric paint (#1) is the single change I would make to the *picture*, and it
is one amplitude constant in `src/core/assets.js`. Make it second. It will
survive; the string missing from eight machines will not, because nothing is
watching.
