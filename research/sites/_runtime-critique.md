# Runtime visual & performance critique — ten site archetypes

**Agent #20, runtime visual and performance critic. Adversarial review, not a build report.**
Worktree `drillity-claude-sites`, branch `claude/site-environments`, baseline `673f888`.
Written 2026-09-06, 02:20–02:45. **The tree moved under me while I worked** — see §0.4.

---

## Verdict at a glance

| # | finding | severity | §|
|---|---|---|---|
| 1 | **Zero runtime numbers in this document.** Lease never held by `claude-sites`. Nothing substituted. | blocked | 0.1 |
| 2 | **No new site can be drawn.** 5 GLBs on disk, 0 with a `model:`, 0 in `blender:sites`. 5.7 MB of new asset ships and can never be requested. | **critical** | 0.2 |
| 3 | **The budget every builder was handed cites `shots/s0-report.txt`, which has never existed**, and its "m08-rc 85 / rig 57" are a misread of an fps column. | **critical** | 0.3 |
| 4 | **The camera in the builders' contract file is the wrong camera.** 7 of 10 modules use the right one anyway. | high | 0.4 |
| 5 | `tools/shoot.mjs` has **zero** archetype awareness — it cannot produce a per-site number at all. | high | 1.1 |
| 6 | The harness **already contains** the silhouette-confusability detector, pointed only at rigs and methods. | opportunity | 1.2 |
| 7 | `platform-deck` vs `marine-spread`: distinct today, but the modules **invert** the distinction with no `replacesKit` guard. | high | 2.2 |
| 8 | `open-pit-bench` vs `quarry-bench`: distinct by 16×; separation authored **one-sidedly**, nothing protects it. | medium | 2.3 |
| 9 | `tunnel-portal` vs `underground-drive`: distinct. **A premise I set out to prove, measured false, and dropped.** | resolved | 2.4 |
| 10 | `checksiteenvironment.mjs` **ratchets both shipped sites' overspend into a permanent allowance** and goes green. | high | 4.1 |
| 11 | `arch.pad` is dead data on 7 archetypes; `urban-plot` declares 2 `replaces` names that can never fire. | medium | 3.2 / 4.2 |
| 12 | An **unknown region id silently renders a complete scene** with no error. | medium | 4.3 |
| 13 | `platform-deck.glb` puts geometry between camera and collar. **Unresolved — needs a frame.** | unresolved | 4A.1 |
| 14 | My own AABB collar test **condemns the two known-good shipping assets** — instrument reported, not its output. | method | 4A.1b |
| 15 | `underground-drive.glb`'s bounding box **contains the hero camera**; collar is outside it entirely. Deliberate, but unresolved. | unresolved | 4A.1c |
| 16 | `underground_drive.py` **parses the camera out of `renderer.js`** instead of restating it — the fix for #4. Adopt across all ten. | opportunity | 0.4 |

---

## 0. THE HEADLINE, BEFORE ANY NUMBER

### 0.1 Not one runtime number in this document. The GPU lease never came to me.

`C:\Users\henri\Downloads\threads\drillity-coordination\gpu-owner.txt`, read at
every checkpoint of my session:

| when | owner |
|---|---|
| my brief's stated value | `ui-atlas` — **already stale when written** |
| 02:20, my first read | `instrument-grade` |
| 02:25 / 02:33 / 02:37 | `instrument-grade` |
| 02:39 | `ui-atlas-adoption` |
| 02:45, final | `contract-readiness` |

**It never read `claude-sites`.** The lease changed hands three times during my
session and reached three other tracks. I re-read the file rather than trusting
my brief, which is the only reason this table is right.

**I launched no headed Chrome, no Playwright, no dev server, no Blender render,
and I did not touch port 5178.** My request is at
`drillity-coordination/claude-sites.gpu-request.md`, filed at low priority
**on purpose** (§0.2 says why).

Therefore, stated once and plainly:

> **WARM DRAW CALLS PER SITE: NOT MEASURED.
> WARM FPS PER SITE: NOT MEASURED.
> COLD FPS PER SITE: NOT MEASURED.
> RUNTIME SILHOUETTE CAPTURES: NOT MEASURED.**

Every number below is **CPU static evidence** — source parsing, GLB parsing via
the sanctioned ruler, or the real `terrain.js` instantiated headless in Node.
CPU counts are evidence. **They are not a substitute for runtime draw
measurement and are not presented as one anywhere in this document.**

### 0.2 It would not have mattered. There is nothing to capture.

This is the finding that reorders the whole track, and it is the reason I filed
the lease request at low priority instead of contending for it:

| what exists (02:37, and moving) | count |
|---|---|
| site modules in `blender/sites/` | **10** (8 new + 2 reference) |
| exported GLBs in `public/models/sites/` | **5** — 2 pre-existing, 3 new (§4A) |
| new archetypes wired into `npm run blender:sites` | **0** |
| new archetypes declaring `model:` in `terrain.js` | **0** |
| new assets the game can fetch | **0** |

```
$ awk '/^const ARCHETYPES = \{/,/^\};/' src/world/terrain.js | grep -E "^  '[a-z-]+':|model:"
  'urban-plot': {           model: 'urban-plot',
  'infrastructure-corridor': {          (no model:)
  'quarry-bench': {         model: 'quarry-bench',
  'open-pit-bench': {                   (no model:)
  'tunnel-portal': {                    (no model:)
  'underground-drive': { plane: 'underground' }
  'exploration-pad': {                  (no model:)
  'well-pad': {                         (no model:)
  'platform-deck': { kit: 'offshore', plane: 'offshore', deck: 'fixed' }
  'marine-spread': { kit: 'marine', plane: 'offshore', deck: 'mobile' }

$ grep -n "blender:sites" package.json
25: ... --python blender/sites/quarry_bench.py && ... --python blender/sites/urban_plot.py
```

Assets are now appearing fast — `well-pad`, `tunnel-portal`, `platform-deck`,
`infrastructure-corridor` and `underground-drive` were all hand-exported between
02:33 and 02:41 while I wrote — which makes the gap sharper, not softer:
**seven site GLBs now total 10.69 MB, of which ~6.98 MB is new, ships in the
build, and can never be requested.** That is CRITIQUE §15's shipped-dead-weight finding, forming again
on sites. Running the track's own gate:

```
$ node tools/checksites.mjs > /dev/null 2>&1; echo $?
CHECKSITES FAIL  16 problem(s).            1
```

**Eight modules, roughly 640 KB of authored Python, cannot be built by the
sanctioned command and could not be drawn if they were.** `loadSiteModel()` is
never called for an archetype with no `model:` key. Handing me the GPU today
would have bought ten captures of the *procedural* kit and zero captures of the
work under review. That is not a scheduling complaint — **it is the review
finding**, and it is ASTRA §1's "a gallery of unused models is not completion"
arriving one step earlier than usual: a gallery of models that were never built.

The track's own asset gate already says all of this: `tools/checksites.mjs`
fails on exactly these cases and names it *"the six-of-eight-machines failure in
its site form"*. **That gate is wired into no npm script** —
`"check:sites": "node tools/checksiteenvironment.mjs"` (package.json:34) runs a
different file. The gate that would have caught this does not run.

### 0.3 The budget every builder was handed cites a report that does not exist

`blender/lib/site.py`'s header — the document all eight builders were briefed
from — derives its **6 materials per site** ceiling like this:

```
    surface ceiling                                              80
    worst rig that stands on a quarry bench (m08-rc, measured)  -57
    everything ... neither the site nor the rig (measured)       -6
    the WHOLE site's allowance                                   17
```

and sources it to `shots/s0-report.txt`.

```
$ ls shots/s0-report.*
ls: cannot access 'shots/s0-report.*': No such file or directory

$ grep -rn "s0-report" --include=*.py --include=*.js .
./blender/lib/site.py:72:  ... on the same afternoon (shots/s0-report.txt), whose
./src/world/terrain.js:527: ... any site (measured, shots/s0-report.txt). An archetype that loads a
```

**The cited evidence file has never existed in this tree.** Two source files
present its numbers as measured fact.

Worse, the numbers are traceable to a **misread column**. The only place
`m08-rc` is followed by `85` in all of `shots/` is `post-report.txt`, and that
file's own legend one row above says what the columns are:

```
$ sed -n '61p;80p' shots/post-report.txt
  id                          fps   frame  surf  sect   rig     tris  part   err   sec  verify
  m08-rc                      85.9    271    87    21    59     438k  1227     0   5.3  FAIL
```

**85.9 is the frame rate.** `m08-rc`'s surface is 87 and its rig is 59 — not 85
and not 57. Across all eleven reports containing `m08-rc`, a surface value of 85
never occurs and a rig value of 57 never occurs.

And the derivation contradicts the table printed two paragraphs above it in the
same file, which gives **rig 27** for every archetype: `80 − 27 − 6 = 47`, not 17.

The same header's headline justification — *"EIGHT OF TWENTY-ONE STATES ARE
ALREADY OVER THE CEILING WITH NO .GLB ON THE SITE AT ALL. That single fact
decides this budget"* — is also not reproducible. Every report on disk that
carries the line disagrees, with each other and with the eight:

```
$ for f in ar5 fin2 post; do sed -n '29p' shots/$f-report.txt; done
ar5    surface over budget in  9 state(s): m05-dth=94 m07-core=87 m08-rc=90 m11-rockbolt=155 ...
fin2   surface over budget in 15 state(s): m05-dth=93 m07-core=86 m08-rc=87 m11-rockbolt=153 ...
post   surface over budget in 19 state(s): 14-section-clean=82 m06-overburden=82 m08-rc=87 ...
```

**9, 15, 19 — and never 8.** `m08-rc`'s surface is 90, 87 and 87 across the
three — never 85. (Worth passing to whoever owns the rigs: `m11-rockbolt=155`
against a ceiling of 80 is 94 % over, and it is not a site problem.)

**Verdict: the "17" is not a measurement. It is the measured cost of
`quarry-bench` (17), with a subtrahend chosen to make it reappear as an
allowance.** Neither the subtrahend, the corroborating count, nor the cited
report survives a check against the evidence in the repository. The 6-material ceiling may well be the right number — `finish()`
genuinely enforces it, and no module breaches it — but **its stated derivation
does not survive contact with the evidence it cites**, and it was given to eight
agents as sourced fact. Under ASTRA §1.1 that is the offence the rule exists to
prevent: *a plausible invented number is worse than an admitted gap, because
nobody will ever check it again.*

### 0.4 The camera in the builders' contract file is the wrong camera

`blender/lib/site.py` exists to be the axes-and-camera authority for all eight
builders. **It is currently the least accurate statement of the camera in the
repository.**

```
$ grep -n "hero:" src/core/renderer.js
160:  hero: { pos: [8.40, 2.25, 10.94], look: [-1.55, 2.60, 0.00], fov: 34, ... }

$ grep -n "7.60\|2.60\|9.90" blender/lib/site.py
156:**the hero camera is further out on +z again**, at three.js [7.60, 2.60, 9.90]
157:looking at about y 3.40 with a 34-degree vertical field.
```

| | site.py (the contract) | renderer.js (live) | delta |
|---|---|---|---|
| eye height | 2.60 m | **2.25 m** | −0.35 m |
| plan distance to collar | 12.48 m | **13.79 m** | +10.5 % |
| look target y | 3.40 | **2.60** | −0.80 m |

`terrain.js` repeats the stale figure three times (lines 173, 2820, 3157), and
two of those disagree with each other about the field of view — `2820` says
*"29.3 deg horizontal"*, `3157` says *"34-deg VERTICAL"*. I did not resolve
whether those two are consistent under the portrait aspect; **I am recording the
disagreement, not adjudicating it.**

**The builders are right and the contract is wrong.** Seven of the ten modules
pin the camera themselves and every one of them uses the *live* value:

```
$ grep -n "EYE = " blender/sites/*.py
exploration_pad.py:137:      EYE = (8.40, -10.94, 2.25)
infrastructure_corridor.py:185: EYE = (8.400, -10.940)      <- 2-tuple, no height
open_pit_bench.py:329:       EYE = (8.400, -10.940, 2.250)
quarry_bench.py:227:         EYE = (8.400, -10.940, 2.250)
tunnel_portal.py:235:        EYE = (8.400, -10.940, 2.250)
urban_plot.py:46:            EYE = (8.4, -10.94, 2.25)
well_pad.py:376:             EYE = (8.400, -10.940, 2.250)
```

Blender `(8.400, -10.940, 2.250)` maps to three.js `(8.40, 2.25, 10.94)` — the
live camera exactly. This is ASTRA §5's central lesson happening live: *two
tables describing one thing will drift, and the one that is wrong will be
believed.* It only failed to cost anything because every builder went and
checked the renderer instead of trusting the brief they were given.

Two things follow that are worth acting on:

- **`platform_deck.py`, `marine_spread.py` and `underground_drive.py` define no
  `EYE` at all** — and two of those three are the pair most at risk of reading
  the same (§2.2). The modules that most needed to solve their geometry against
  the real frame are the ones that did not pin the frame.
- **`infrastructure_corridor.py:185` pins a 2-tuple** `(8.400, -10.940)` with no
  eye height. That may be a deliberate plan-only constant; I did not confirm
  either way, and flag it for its author rather than asserting a defect.

Fix the document, not the code — the code is right (ASTRA §1.6).

**And one builder has already solved this properly, which is the pattern to
adopt.** `underground_drive.py:361-374` does not hardcode the eye at all — it
**parses `CAMERA_MODES.hero` out of `src/core/renderer.js` at build time** and
hard-fails if it cannot:

```python
def parse_hero_eye():
    """`CAMERA_MODES.hero` from `src/core/renderer.js`, converted to drive-local.
    `renderer.js` owns the camera. ..."""
    ...
    'underground_drive: could not read CAMERA_MODES.hero out of '
    'src/core/renderer.js. Fix this parser; do not hardcode the eye.'
```

That is ASTRA §5's one-table rule applied correctly: the camera cannot drift out
from under this module, because the module reads the authority instead of
copying it. **The other six modules that pin `EYE` hardcode today's correct
values and will silently go stale the next time the camera moves — which has
already happened once, and is what produced §0.4.** Adopt the parser across all
ten, and the whole class of defect disappears.

**Unresolved, and I am not adjudicating it:** a *third* field-of-view figure
appears in `underground_drive.py:433` — *"the live hero camera is fov 20.97 /
aspect 1.724"* — alongside `renderer.js`'s `fov: 34`, `terrain.js:3157`'s
"34-deg VERTICAL" and `terrain.js:2820`'s "29.3 deg horizontal". These may all be
consistent under different aspect and band assumptions. **I did not reconcile
them and I am not claiming any is wrong** — only that four figures circulate and
no single file states which is which.

### 0.5 The tree moved while I worked — timestamps, not conclusions

Builders are authoring concurrently. Between 02:19 and 02:35 I watched
`blender/sites/` go from 5 modules to 10, `infrastructure_corridor.py`'s
`MATERIAL_BUDGET` NameError get fixed (it is now `MATERIAL_BUDGET = 4` at
line 499), and several modules grow `finish()` calls they lacked. **Every
module-level statement in this document is a snapshot of the 02:23–02:35
window and must be re-checked before it is acted on.** The two facts that did
*not* move in that window are the two in §0.2: zero new GLBs, zero `model:`
declarations.

---

## 1. Capture cases — prepared, CPU-side, ready for the lease

The brief asked me to prepare integrated capture cases so the lease is spent
measuring rather than setting up. Doing that surfaced a blocker that is itself
the second-largest finding here.

### 1.1 `tools/shoot.mjs` cannot address a site archetype. At all.

```
$ grep -c "archetype" tools/shoot.mjs      -> 0
$ grep -c "terrain\.root" tools/shoot.mjs  -> 0
```

- `--only` accepts **`ui | methods | rigs`** and nothing else (shoot.mjs:33).
  There is no site group and no site shot.
- Per-band attribution exists, but it toggles **`c.rig.group.visible`**
  (shoot.mjs:296-306) and derives the *rig*. `surface` is one undifferentiated
  render of the whole surface scene. **There is no terrain/site band and no code
  path that could produce one.**
- The archetype a shot lands on is a **random, unrecorded draw**:
  `__qa.startDemoContract()` destructures only `{ depth, method, region }`
  (src/main.js:655), and `pageIdentity` records `regionId` but never `archetype`.

So `blender/lib/site.py`'s claim that its nine-row table was measured *"by
rendering the surface scene with `ctx.terrain.root` visible and again with it
hidden (the same per-band attribution `tools/shoot.mjs` uses)"* describes a
capability the harness does not have, in addition to citing a file that does not
exist. **Do not quote that table as harness output.**

`shoot.mjs` also defaults to `http://localhost:5178/` (shoot.mjs:62) — the lease
owner's game server. Any site capture must pass `--url` at another port.

### 1.2 The harness ALREADY contains the silhouette instrument — pointed at the wrong thing

This is the cheapest fix available to this track. `shoot.mjs:1632-1648` computes
a 16×16 luminance signature of the surface band per shot and flags any two shots
within a Hamming distance of `max(2, 4 % of cells)` as *"painting nearly the same
picture"*. Its own comment says why that matters: *"either the subject never
changed or the machines are indistinguishable at this framing."*

**It runs for groups `'rigs'` and `'methods'`. It has never been pointed at
sites** — which is precisely the comparison this track most needs.

### 1.3 What is prepared, and where

`<scratchpad>/shootsites.mjs` — a complete, syntax-checked, argument-guarded
capture runner for all ten archetypes. It is deliberately **not** in `tools/`:
that directory belongs to the asset-validation agent, and my brief says I report
and others fix. If the track wants it as a gate, adopt it deliberately.

It measures, per archetype: `site.calls` by the terrain-visible/terrain-hidden
subtraction site.py describes (the instrument that does not currently exist),
`surface.calls` against the 80 ceiling, warm fps, and the surface-band signature
in **exactly** shoot.mjs's encoding so the two are comparable rather than being a
second drifting ruler (ASTRA §5).

The three measurement rules are enforced in code, not in comments:

- **`--headed` mandatory** — refuses to run without it, `exit 2`. Verified:
  `no-headed exit=2`, `no-url exit=2`, `port5178 exit=2`.
- **Warm grading** — a cold pass is taken, labelled cold and discarded; only the
  post-warm pass is graded.
- **1 Hz clamp** — `meanFrameMs > 400` marks the sample THROTTLED and refuses to
  grade it; `visibilityState` and `hasFocus()` are re-read at every sample,
  because on this machine another agent's browser can occlude the window
  mid-run.
- **A zero is a failure** — empty archetype list, no frame captured, or every
  sample throttled all exit nonzero (ASTRA §10, *"a gate over an empty set
  passes forever"*).
- It validates the region id against the live game, because **an unknown region
  id silently renders a complete scene** (§4.3).

Command, when and only when the lease reads `claude-sites`:

```
npx vite --port 5188 --strictPort                              # NOT 5178
node <scratchpad>/shootsites.mjs --headed --url http://localhost:5188/ --out <dir>
node <scratchpad>/shootsites.mjs --headed --url ... --method rockbolt   # underground pass
```

---

## 2. Silhouette comparison across the ten sites

**Runtime silhouettes: NOT MEASURED (no lease).** What follows is a CPU
structural proxy: the real `terrain.js` instantiated in Node, per archetype,
recording the visible mesh set, the instanced scatter set, the merged material
pools, the ground height ring and the world bounding box.

**Read the proxy correctly: identical descriptors cannot look different, so a
FAIL here is evidence and a PASS here is worth nothing.** It gives a sufficient
condition for confusability, never a necessary one.

### 2.1 The three at-risk pairs

| pair | verdict | on what evidence |
|---|---|---|
| `platform-deck` vs `marine-spread` | **AT RISK — distinct today, and the modules invert the distinction** | §2.2 |
| `open-pit-bench` vs `quarry-bench` | **DISTINCT — by a factor of 14 to 16 in wall height** | §2.3 |
| `tunnel-portal` vs `underground-drive` | **DISTINCT — separated by a plane change, not by geometry** | §2.4 |

**On process, the answer is different and worse: the warning worked on geometry
and failed on process.** Every separation was authored one-sidedly by a single
builder. There is no reciprocal guard, and **no cross-site distinctness check
exists anywhere in the repo** — `tools/checksites.mjs` builds a per-site table
of bounds, extents and material sets and then never compares one row to
another. The intended check was scoped as a GPU capture assigned to me, so no
CPU proxy was ever built, and the data for one is already in hand. If any of
these three pairs regresses, nothing notices.

### 2.2 `platform-deck` vs `marine-spread` — AT RISK, and I must correct my own first reading

**My CPU proxy said CONFUSABLE. It was wrong, and the reason it was wrong is
worth more than the verdict.** Measured, `nordic` and `north-sea`:

```
platform-deck   meshes=14  extent=900 x 51.0 x 900
  stage[9]: (unnamed)x7 deck sea      scatter[0]: -
  pool[5]: props-glass props-matte props-metal props-paint props-rubber
marine-spread   meshes=14  extent=900 x 25.7 x 900
  stage[9]: (unnamed)x7 deck sea      scatter[0]: -
  pool[5]: props-glass props-matte props-metal props-paint props-rubber
```

**Identical mesh count, identical named mesh set, identical material pools, zero
scatter on both, identical flat height field.**

**That is not sufficient, and I over-read it.** Both archetypes' distinguishing
geometry lives *inside* the merged prop pool, which my descriptor counts but
cannot look into. Reading the two kit branches settles it, and they are not the
same shape:

- the **`marine`** kit builds a continuous plated **ship hull** — `terrain.js:3773`
  says so itself: *"the hull side falling away below it is what puts the deck
  INSIDE a ship"* — with boot topping at y −13.4 and a closed transom.
- the **`offshore`** kit stands the deck on four discrete cylinders with bracing
  only at y −8.5 and −20.0, so **you see water between the legs**, and
  `terrain.js:3948` names that as the point: *"the air gap is what makes a thing
  a jack-up."*

So **as shipped, this pair is distinct.** My mesh-count proxy could not see it;
the correct verdict is AT RISK, and the finding is what makes it risky.

**The risk is an identity inversion.** `marine_spread.py` authors a **jack-up**:
`AIR_GAP` 7.904 m of daylight under the hull and four lattice legs `LEG_UP`
44.0 m above deck. `platform_deck.py` authors a **fixed platform** with **zero**
air gap — the band from y −6.846 down to the sea is filled by jacket,
conductors and boat landing. **That is the exact opposite of what ships today**,
where marine-spread is the one with the unbroken side into the water and
platform-deck is the one with daylight underneath.

The wiring to manage that swap does not exist:

```
'marine-spread': { kit: 'marine', plane: 'offshore', deck: 'mobile' }
                   ^ no model:, no replaces, no replacesKit
```

and the `if (kit === 'marine')` branch has **no `!kitSuperseded()` guard** —
only `urban` and `quarry` have one. **Add a `model:` without `replacesKit: true`
and the result is a jack-up hull standing inside a ship's hull, with the ship's
stern A-frame and soil laboratory still on the deck.** That is the
double-dressing failure `terrain.js` already documents for urban-plot, queued up
to happen again on the pair that was specifically warned.

In `terrain.js` these two are one-line definitions while every surface archetype
gets a commented block:

```
'platform-deck': { kit: 'offshore', plane: 'offshore', deck: 'fixed' },
'marine-spread': { kit: 'marine',  plane: 'offshore', deck: 'mobile' },
```

The `deck` field has exactly one consumer (terrain.js:5330) and it changes **only
the size of the hole cut in the deck** — `hx/hz` are half-extents, so a
10.8 × 8.4 m well-slot versus a 6.0 × 6.0 m moonpool. The deck outline itself is the same hard-coded 56 × 34 m rectangle in
both cases. **The hero camera sits at y 2.60 looking at y 3.40 — very nearly
horizontal — so the one authored difference between these two archetypes is seen
almost edge-on, and mostly behind the machine standing over it.**

The one real discriminator the proxy found is the vertical extent, **51.0 m vs
25.7 m** — something tall stands on the platform and not on the spread. That is
a genuine difference and it is the thing to build on. It is not currently enough:
a fixed platform and a mobile spread share a stage.

**This pair ships.** Across 19,200 real contracts from `makeContract()`,
**2,120 land on an offshore archetype** (all in `north-sea`). This is not a
theoretical pairing.

### 2.3 `open-pit-bench` vs `quarry-bench` — the warning worked, in the procedural layer

```
quarry-bench    meshes=22  extent=2320 x  58.8 x 2320  scatter[6]: outcrops spruce-bark
                spruce-crown-0 spruce-crown-1 stones tufts   ground ring @18 m: all 0.00
open-pit-bench  meshes=19  extent=2320 x 202.6 x 2320  scatter[3]: outcrops stones tufts
                ground ring @18 m: 0.02 0.04 0.10 -0.17 0.06 -0.13 -0.21 0.04
```

Three real discriminators: **vertical extent 202.6 m vs 58.8 m** (an open pit is
a landform, a bench is a face), **no trees on the pit** against six scatter
meshes on the bench, and a **broken ground ring vs a flat one**. The
`props-earth` pool on open-pit-bench carries 22,563 vertices against
quarry-bench's 234 — the pit is an earth mass, the bench is not.

As authored, the separation is larger still and it is dimensional, not tint:
`open_pit_bench.py` sets `PIT_DEPTH` **120.0 m** (8 benches × 15.0 m) against
`quarry_bench.py`'s `FACE_H` **7.5 m** — **16×**, and the pit's *single bench* is
twice the quarry's entire wall. Hole diameter 0.203 vs 0.102 m, burden ×
spacing 6.09 × 7.917 vs 2.55 × 2.93 m, plus a 33.5 m haul ramp the quarry has no
equivalent of. Measured against the **live** camera, the pit's backing wall
subtends 32.9° and the quarry's rock tops out near 9°, in a 34° frame.

**But the warning only worked in one direction, and nothing protects it.**
`open_pit_bench.py` carries a 35-line "how this is a different kind of place from
`quarry-bench`" section separating them on six axes. **`quarry_bench.py` has no
reciprocal section** — it names the pit once, as a quality benchmark, not as a
confusable partner. The pit builder's brief contained no differ-from instruction
either; the separation was authored voluntarily. And `data.js:355` defines the
pit *by reference to* the quarry — "the quarry bench geometry an order of
magnitude wider" — which is an open invitation to ship one model at two scales.
This builder declined it. **The next one may not, and no gate would notice.**

**Caveat that matters: the shipped comparison is the *procedural* layer.
`open_pit_bench.py` (96 KB) is not built and not wired**, so its authored
differentiation is unassessed at runtime — the risk it was warned about lands
when the GLB attaches, not before.

### 2.4 `tunnel-portal` vs `underground-drive` — a premise I measured false

I expected the worst here and set out to prove it: force an underground method
and see whether the two collapse. They do, totally —

```
$ node .probe-sites.mjs --ug          # method=rockbolt
arch=tunnel-portal      draws=13  instanced[3]: drive-muckx89 drive-boltsx156 drive-festoonx7
arch=underground-drive  draws=13  instanced[3]: drive-muckx89 drive-boltsx156 drive-festoonx7
```

— byte-identical, and so are all six other surface archetypes under an
underground method. **But that state does not ship.** The track's own contract
sweep over 19,200 real contracts across all eight regions and levels 1–60:

```
UNDERGROUND method on a surface archetype: 0 shapes
SURFACE method on underground-drive archetype: 3 shapes, 527 contracts
```

**Zero.** My hypothesis was wrong and I am recording that rather than dressing
the forced state up as a defect. The pairing is unreachable because
`resolveArchetype()` refuses an archetype the method cannot build.

The *inverse* — 527 contracts putting the surface method `core` on the
`underground-drive` archetype — is real, and the integration agent has already
handled it: `sitePlaneMatches()` (terrain.js:6603) is now a **plane** test,
`arch.plane === 'underground' ? !!(ugSpec && driveGroup) : !ugSpec`, replacing a
hard-coded `!ugSpec` that would have made underground a plane the site pipeline
could never reach. **That fix is real and I verified it in the file rather than
taking the claim.**

Net: these two are **never both drawable**, and they are separated by something
stronger than geometry — **a plane change that removes the sky.** The `ugSpec`
branch of `rebuild()` disposes `ground`, `decal`, `collarGroup`, every
`InstancedMesh`, every prop mesh, the sign mesh and the far field, then calls
`detachSiteModel()` before `buildDrive()`. Underground there is no ground plane,
no horizon and no surface kit at all; the frame is a swept horseshoe with the
camera inside it. `tunnel-portal` is `plane: 'surface'` with `farAmp: 0.9` — it
keeps 90 % of the region's far-field relief, i.e. it keeps a horizon.

The two modules also enumerate their separation and the enumerations are
disjoint: `tunnel_portal.py` builds an approach cut, wing walls, a pale
concrete headwall and a pipe umbrella *seen from its outer end* — its stated
signature, and an object that cannot occur in an underground heading — and
authors **no `worklight()` at all**, deliberately. `underground_drive.py` builds
no shell, no rock, no cut and no horizon, only crew consumables standing free on
the invert. Its builder wrote the risk down explicitly: *"If these two models
are confusable, both have failed."*

**Verdict DISTINCT, with the caveat that neither module ships and the separation
currently comes from the runtime plane branch rather than from either `.glb`.**
The darkness ratio, the fog and the lamp positions are all runtime and all
unmeasured. The real risk for `underground-drive` is different and worse — §3.3.

### 2.5 The other seven pairs the proxy flagged

In `nordic`, my coarse descriptor also flagged `infrastructure-corridor` ≡
`tunnel-portal` ≡ `well-pad` as sharing a stage. **I am not reporting these as
confusable**, because the descriptor is too weak where seven of nine stage
meshes are unnamed: those three differ in `pad` (9.5 / 10.0 / 13.0), `farAmp`
(0.55 / 0.90 / 0.75) and prop vertex counts, none of which my proxy reads. They
are flagged as **UNASSESSED, pending a real capture** — recorded honestly rather
than inflated into eight findings.

---

## 3. Collar and machine visibility

**No runtime capture, so no screen-pixel measurement of the collar or the
machine.** CRITIQUE §9's measured 66 % 3D share against a ~82 % spec could not
be re-measured and **is not re-quoted here as current**.

What I can state from the source:

### 3.1 The offshore deck cuts a real hole over the collar — this is right

terrain.js:5320-5340 builds the deck as a `Shape` with a `Path` hole rather than
a plate with a painted ring, and handles the coordinate sign explicitly:

```
// rotateX(-PI/2) below maps shape-y onto world -z, so the hole's shape-y
// is MINUS the collar's world z. Getting this sign wrong puts the hole on
// the far side of the deck from the machine standing over it.
const ox = collarPosition.x, oz = -collarPosition.z;
```

The collar is preserved by construction on both offshore archetypes. Do not
"fix" this.

### 3.2 A procedural decal is painted over both authored ground surfaces

`buildDecal()` (terrain.js:2185-2210) draws a 39 × 39 m pad decal at ground
+12 mm, unconditionally for any non-deck site. It reads `CFG.padFalloff` and
**never reads `arch.pad`**. It overlaps the authored gravel in *both* shipped
GLBs, and there is no mechanism to suppress it: it is not an `InstancedMesh`, so
it can never be named in `replaces`.

**`arch.pad` is dead data** — declared with a sourced comment (BR 470,
research/16 §A.1) on seven archetypes, and read by nothing in `src/`. I grepped
the tree myself; the only other `.pad` is an unrelated CSS flag in
`components.js:1070`. That is ASTRA §10's *declared contract with no consumer*,
again.

### 3.3 `underground-drive` is authored for a plane its model can never attach to

`underground_drive.py` (76 KB) exports `underground-drive.glb` for an archetype
whose `terrain.js` entry is `{ plane: 'underground' }`. `tools/checksites.mjs`
fails this outright — *"THAT MODEL CAN NEVER BE ATTACHED."* The plane fix in
§2.4 made the *test* correct, but `rebuild()` still returns inside the drive
branch before `attachSiteModel()`. **Until that is closed, this builder's entire
output is invisible.** Flagged; it is the integration agent's to fix, not mine.

---

## 4. Duplicate dressing

The suppression machinery is **sound**, and I want to say so plainly rather than
manufacture a finding. Two knobs — `replaces:` (drops named InstancedMeshes,
terrain.js:4323-4326) and `replacesKit:` (suppresses the archetype's
`buildSiteKit()` branch, terrain.js:1682) — both gated on `siteModelReady()`,
which tests the parsed master rather than the attached node. The first
`rebuild()` draws procedural, the model lands, exactly one more full `rebuild()`
fires. **Transient double-dress for one rebuild, self-healing, de-duplicated.**

The real failures here are arithmetic and provenance, not z-fighting:

### 4.1 Both shipped sites are over the rule, and the test certifies it

site.py's rule is that the terrain.js branch must **give back at least as many
calls as the .glb takes** — net ≤ 0. Measured with `glbinfo.mjs`, the sanctioned
ruler:

| archetype | GLB prims/materials | best-case give-back | net |
|---|---|---|---|
| `urban-plot` | 5 | 3 | **+2** |
| `quarry-bench` | 6 | 4 | **+2** |

`tools/checksiteenvironment.mjs:642` then asserts `net <= cap` with

```
const CEILING = { 'quarry-bench': 3, 'urban-plot': 2 };
```

**The test named for the rule ratchets the current overspend into a permanent
allowance, and `npm run check` goes green with both shipped models over budget.**
This is ASTRA §10's *hardcoded claim inside a gate* — the same bug wearing a lab
coat.

### 4.2 `urban-plot` declares two `replaces` names that can never fire

`birch-bark` and `birch-leaves` (terrain.js:485). `dressFor()` zeroes any scatter
below 4 instances (terrain.js:1646); urban-plot's own multiplier is `birch: 0.14`
and the maximum `birch` base across all eight regions is 14. `14 × 0.14 = 1.96`
— **below the threshold in every region.** `addInstances()` returns before even
recording the name. `scrub` fires only in `sahara`. **Of five declared names, at
most two fire in any single region.**

A `replaces` name matching nothing gives back **zero** draw calls while reading
as a saving. That is a gate over an empty set, in the archetype whose own
comment warns about gates over empty sets.

### 4.3 An unknown region id silently renders a complete scene

Measured, not inferred:

```
$ PROBE_REGION=totally-not-a-region node .probe-sites.mjs | grep quarry-bench
arch=quarry-bench draws=22 h00=-0.014 ...        # identical to nordic, no error
```

The real ids are `nordic german-site iberian-quarry alpine sahara north-sea andes
arctic`. A typo produces believable garbage with no log line. ASTRA §10's
*silent fallback that works* — the most expensive kind. My capture runner
validates the id against the live game for exactly this reason.

---

## 4A. The first delivered assets — measured, 02:33–02:37

Three new GLBs landed while I was writing. Measured with `tools/glbinfo.mjs`,
the sanctioned ruler (every vertex transformed — ASTRA §5), **not** with a
second tool:

| asset | prims / materials | triangles | bytes | W × H × L (m) |
|---|---|---|---|---|
| `well-pad.glb` | **6 / 6** — at ceiling | 16,992 | 1,150,104 | 93.09 × 9.50 × 118.64 |
| `tunnel-portal.glb` | **6 / 6** — at ceiling | 21,004 | 1,951,780 | 36.36 × 20.60 × 36.58 |
| `platform-deck.glb` | **4 / 6** | 17,364 | 1,478,504 | 92.85 × 46.97 × 27.30 |
| `infrastructure-corridor.glb` | **4 / 6** | 21,460 | 1,969,500 | — |
| `underground-drive.glb` | **4 / 6** | 6,208 | 385,700 | 5.98 × 2.76 × 6.21 |

Two more landed at 02:41 while I was writing this section; **seven site GLBs now
total 10.69 MB**, of which the two that the game can actually fetch are the two
that existed before this track started.

All are inside the 6-material budget — `finish()` enforces it and none
breached it. **None of the three is fetched by the game** (§0.2): all three fail
`checksites.mjs` for having no `model:` declaration, and it says so in terms —
*"1.86 MB that ships in the build and is never fetched."*

### 4A.1 Collar clearance in depth — one asset clears it, one I cannot clear

The hero camera is at three.js **z = +10.94**, the machine stands at **z = +2.4**,
the collar is at **z = 0**. Anything an asset places between z = 0 and z = +10.94
is in front of the machine, toward the camera.

- **`tunnel-portal.glb` — clears it, by construction.** Bounds `z −34.943 ..
  +1.639`. The entire model stops **0.76 m short of the machine** and 9.3 m short
  of the camera. All 36.6 m of its depth runs *away* from the viewer. The
  Blender-Y sign convention that `site.py` warns is easy to invert and invisible
  in the viewport was handled correctly here.
- **`platform-deck.glb` — cannot be cleared from an AABB, and it is the one to
  look at.** Bounds `z −14.895 .. +12.402`, `y −21.010 .. +25.958`. **The z
  maximum exceeds the camera's own z**, so some authored geometry lies between
  the camera and the collar in depth. Whether any of it actually occludes the
  collar or the machine depends on its x and y *at that z*, which a bounding box
  cannot answer. `static:wornSteel` spans the model's full 91.9 × 47.0 × 27.3
  extent, so the AABB tells me nothing further.

**I am recording this as an unresolved risk, not as an occlusion finding.** It
needs one frame from the hero camera, which is precisely the measurement the
lease would have bought. Reporting it as a defect on AABB evidence would be
ASTRA §5's *"an approximation in an instrument becomes a false finding in a
report"* — the mistake that produced four false findings on this project already.

### 4A.1b I calibrated that instrument before trusting it, and it failed

I extended the per-subtree measurement to full x/z minima and maxima — reusing
`glbinfo.mjs`'s own exported `parseGLB()` and `measure()` rather than writing a
second ruler — and flagged any subtree whose box contains the collar at
`(x 0, z 0)` with a top above ground.

**It flags four of four subtrees on `platform-deck`, six of six on
`quarry-bench`, and four of five on `urban-plot`.** The last two are the
shipping, reviewed reference assets that are known to work.

**An instrument that condemns the known-good assets is measuring the wrong
thing, and the reason is structural:** `site.py`'s `finish()` **joins all statics
by material**, so every material becomes one site-spanning mesh. Its bounding box
necessarily contains the origin whether or not the geometry has a clean hole at
the collar. **The AABB cannot answer the collar question for any site asset in
this pipeline, ever.**

What it *can* answer soundly is the negative direction, because a maximum is a
hard bound:

| asset | max z of any subtree | in front of the machine (z > 2.4)? |
|---|---|---|
| `tunnel-portal` | **+1.639** | **NO — proven clear** |
| `well-pad` | +41.9 (`gravel`, top y +1.20) | yes, but at pad height under a 2.25 m eye |
| `platform-deck` | +12.40 (`wornSteel`, top y +25.96) | **yes, and tall — unresolved** |
| `quarry-bench` (shipping) | +15.3 | yes — and it is fine, which is the point |

So: **`tunnel-portal` is proven clear. `platform-deck` is unresolved and is the
one to put a frame on first. Everything else is unmeasurable by this method.**
I am reporting the instrument's limit rather than its output.

### 4A.1c `underground-drive.glb` sits entirely in the camera's near field

```
BOUNDS  x 3.010..8.992   y 0.000..2.760   z 6.118..12.327
```

**The collar at (0, 0, 0) is not inside this model at all**, and the hero camera
position `(8.40, 2.25, 10.94)` *is* — every coordinate falls inside the box.
Nothing of this asset is near the collar or the machine; all of it is beside and
around the viewer.

**This appears to be deliberate, and I checked before flagging it.** The module's
header reasons explicitly about *"the near field, on the player's side of the
work"* and about a brightness ladder — *"the work at linear 0.62, near walls at
0.11"* — written to avoid *"a bright near object between the eye and the subject
that was brighter than the subject."* It also has `no galvanised, no white` as a
stated rule for exactly this reason. So the placement is an authored decision by
a builder who was thinking about this problem, not an axis error.

**What I cannot resolve is whether any individual prop intersects the near
plane**, because the same AABB limitation from §4A.1b applies — these are
material-joined meshes. A model whose bounding box contains the camera is the
single strongest case for spending a frame on it. **Unresolved; needs the
capture.** It is also, per §3.3, the one asset that currently cannot attach at
all.

### 4A.2 The site anchor system still has no consumer

`tunnel-portal.glb` publishes four anchors with rich extras —
`mount:site-portal extras={"opening_w":6,"opening_h":6.25,"spring_z":3.25,"bore_m":16}`,
`mount:site-cut-toe extras={"treated_h":6.096}`, `mount:site-muck`,
`mount:site-collar`. `checksites.mjs` already warns that
`quarry-bench.glb`'s `mount:site-face extras.face_h = 7.5` is read by no file
under `src/`. **The new assets are adding more publishers to a contract that has
no reader** — ASTRA §10's *declared contract with no consumer*, now on its tenth
instance and growing.

### 4A.3 A trap I fell into and caught, worth recording

I first read `node tools/checksites.mjs | tail -25` and saw
`CHECKSITES FAIL 16 problem(s)` followed by `EXIT=0` — apparently CRITIQUE §8's
exact bug reproduced in the new gate. **It was my own instrument lying.** The
exit code I captured was `tail`'s, not the gate's. Re-run unpiped:

```
$ node tools/checksites.mjs > /dev/null 2>&1; echo "TRUE_EXIT=$?"
TRUE_EXIT=1
```

**The gate is honest.** Recorded because it is the same shape as the failure
CRITIQUE §8 documented, and a critic who reported it without re-checking would
have filed a false finding against a correct tool.

---

## 5. Warm draw calls and fps per site

**Every cell below is NOT MEASURED. This table exists to make the gap explicit
rather than to fill it.**

| archetype | warm draw calls | warm fps | CPU visible-mesh count (evidence, not a draw count) |
|---|---|---|---|
| `urban-plot` | not measured | not measured | 19 |
| `infrastructure-corridor` | not measured | not measured | 25 |
| `quarry-bench` | not measured | not measured | 22 |
| `open-pit-bench` | not measured | not measured | 19 |
| `tunnel-portal` | not measured | not measured | 25 |
| `underground-drive` | not measured | not measured | 23 |
| `exploration-pad` | not measured | not measured | 24 |
| `well-pad` | not measured | not measured | 25 |
| `platform-deck` | not measured | not measured | 14 |
| `marine-spread` | not measured | not measured | 14 |

`region=nordic, method=cfa`, real `terrain.js` in Node, `quality=high`. **A
visible-mesh count is not a draw call**: instanced meshes are one draw for many
instances, and the merged prop pool is one draw per non-empty material bucket.
These are given as the shape of the scene, nothing more.

### 5.1 The harness's own reports cannot be quoted either

CRITIQUE §8's four holes are now **three fixed, one half-fixed** — verified by
driving the exported `writeReport()` with synthetic data, not by reading:

| hole | status | evidence |
|---|---|---|
| prints FAIL, exits 0 | **FIXED** | over-budget input → `VERDICT: FAIL`, shell exit **1** |
| `if (!m \|\| m.error) continue` → all-fail prints PASS | **FIXED** | every metric errored → `VERDICT: INCOMPLETE`, exit **2** |
| completeness assertion passes vacuously | **HALF FIXED** | verdict correct (exit 2); **the prose still lies** — see below |
| abort path, unpiped exit 0 | **fixed in code, not executed** | `:1211` exit 2, `:1253` exit 3; needs a browser |

The half-fix matters because a reviewer skims prose, not exit codes. A
zero-state run still prints, three lines apart:

```
methods    0/0 photographed
manifest   METHOD_IDS.md lists 21 method ids
── COULD NOT PHOTOGRAPH: nothing. Every id in the manifest and every rig
   in data.js has a frame in this run.
```

plus `All 0 shots measured warm` and `PASS — all 0 frames verified`.

The 1 Hz clamp detector is **real code**, not a comment: `throttled: !!(rafMs &&
rafMs > 400)` (shoot.mjs:393), consumed by `qa-verdict.mjs:34`; a clamped run
grades INCOMPLETE and cannot pass. One residual: `writeReport` never
cross-checks `r.warm` against its own `warmDetail.programsDelta`, so a shot with
shaders still linking during its fps window can be printed as warm.

**And the corpus on disk is unusable regardless.** 55 report files: 31 FAIL,
1 PASS, 23 with no verdict line. **The newest `when` field is
2026-09-05T09:13Z; the harness rewrite landed 2026-09-06 00:26.** Not one report
on disk was produced by the harness that now exists. `shots/` also contains
**zero PNGs** — for a visual QA harness.

`"qa:visual": "node tools/shoot.mjs --headed"` exists in package.json but
`npm run check` does not include it, so no gate ever fires it.

---

## 6. Everything I was blocked from checking, and why

1. **Warm draw calls, warm fps, cold fps, and every runtime capture, for all ten
   archetypes.** The lease read `instrument-grade` for effectively my entire
   session and `ui-atlas-adoption` at the end. **It never read `claude-sites`.**
   Request filed at `claude-sites.gpu-request.md`; never granted. **No
   substitution was made and no CPU count is presented as a draw measurement.**
   The capture runner is written, syntax-checked and its guards are tested
   (§1.3) — the measurement is one lease away, not one day away.
2. **Runtime silhouette comparison.** Same cause. §2 is a CPU structural proxy
   and says so; the luminance-signature test that would settle it needs a frame.
3. **Screen-pixel collar and machine visibility, and CRITIQUE §9's 66 % 3D
   share.** Needs a headed capture at 390 × 844. Not re-measured, not re-quoted.
4. **Any statement about the eight new modules' rendered appearance.** They have
   no GLB, no build wiring and no `model:` declaration — **they cannot be
   rendered at all**, by me or by anyone, until §0.2 is closed. No Blender render
   is presented anywhere in this document, and none would have been evidence of
   runtime appearance if it were.
5. **Coplanarity of GLB faces with the y = 0 ground** for `urban-plot`
   (`static:concrete` bottoms at y −0.025, steel at exactly y 0.000). AABB minima
   cannot answer it; it needs a render. Declined to write a second dimensional
   ruler alongside `glbinfo.mjs` (ASTRA §5).
6. **`tools/shoot.mjs --list`.** `LIST_ONLY` is checked at `:1332`, *after* the
   browser launches at `~:1122` — even listing the capture plan starts Chromium.
7. **The two abort paths** (`NO WEBGL CONTEXT`, `ERR_ABORTED`) — both need a live
   browser. Verified by reading only. Neither left any artifact in `shots/`, so
   CRITIQUE's two aborted runs are unauditable.
8. **Web research.** The session's WebSearch budget was reported exhausted
   (200/200) by another agent in this track. Not attempted. No claim here rests
   on a web source.
9. **Module-level findings are a 02:23–02:41 snapshot.** Builders rewrote
   `blender/sites/` under me throughout — five GLBs appeared during the writing
   of this document. Re-check before acting.
10. **A per-module Python occlusion analysis over all ten modules did not return
   before I closed this report.** §3 and §4A are therefore based on the
   *exported assets* (measured, and stronger evidence) plus targeted source
   reads, not on an exhaustive parse of every primitive call in every module.
   The three modules with no GLB yet — `exploration-pad`, `marine-spread`,
   `open-pit-bench` — have had **no collar or occlusion check of any kind** and
   should not be treated as cleared.
11. **`infrastructure_corridor.py:185` pins a two-component `EYE`** with no eye
   height. I did not determine whether that is a deliberate plan-only constant
   or an omission, and I have not called it a defect.

---

## 7. What I would fix first, in order

1. **Close §0.2.** Module + `blender:sites` entry + `terrain.js`
   `model:`/`replaces:` are **one change, not three**, and eight sites currently
   have one of the three. Nothing else in this document can be measured until
   this is done.
2. **Wire `tools/checksites.mjs` into `npm run check`.** It already detects
   every item in §0.2 and it never runs.
3. **Correct or withdraw the budget derivation in `blender/lib/site.py`**, and
   the `shots/s0-report.txt` citation in `terrain.js:527`. Under ASTRA §1.1 the
   honest move is `NOT SOURCED` plus a real measurement, not a tidier
   subtraction. **The document changes, not the code** — the code's 6-material
   ceiling is enforced and unbreached.
4. **Point the existing luminance-signature detector at sites** (§1.2). It is
   ~10 lines and it is the test this track is missing.
5. **Give `marine-spread` a different stage from `platform-deck`** — a deck
   outline that is not the same 56 × 34 m rectangle, and something that reads as
   a vessel rather than a structure. The 51 m vs 25.7 m height difference is the
   thread to pull.
6. **Delete the `CEILING` ratchet in `checksiteenvironment.mjs:642`** or rename
   the test so it stops claiming to enforce a rule it exempts.
7. **Correct the camera in `blender/lib/site.py` and in `terrain.js` lines 173,
   2820 and 3157** (§0.4). Seven builders already work to the right numbers; the
   authority file is the one that is wrong, and the next builder may trust it.
8. **Guard `marine-spread` before its model lands** (§2.2): the
   `if (kit === 'marine')` branch needs a `!kitSuperseded()` test, and the
   archetype needs `replacesKit: true` in the same change as its `model:`. As it
   stands, wiring the model produces a jack-up inside a ship's hull.
9. **Adopt `underground_drive.py`'s `parse_hero_eye()` across all ten modules**
   (§0.4). It reads `CAMERA_MODES.hero` out of `renderer.js` and hard-fails if it
   cannot, so the camera cannot drift out from under a module. The six modules
   that hardcode today's correct values will go stale the next time the camera
   moves — which has already happened once and is what created finding #4.
   `platform_deck.py` and `marine_spread.py` pin no camera at all, and they are
   the pair most at risk of reading the same.
10. **Put the first frame on `platform-deck.glb` and `underground-drive.glb`**
   (§4A.1, §4A.1c) — the two assets whose geometry provably reaches the camera's
   side of the collar, and the two things in this document that a single capture
   would settle.

### What I am explicitly NOT calling a defect

- The suppression machinery (§4) — it is correct; the transient double-dress
  self-heals in one rebuild.
- The offshore deck's cut hole over the collar (§3.1) — right, and the sign
  hazard is handled explicitly in a comment.
- `tunnel-portal.glb`'s depth placement (§4A.1) — the whole model stays behind
  the machine, which is exactly the convention `site.py` warns is easy to invert.
- `tools/checksites.mjs`'s exit code (§4A.3) — honest; my first reading was my
  own instrument's fault.
- The 6-material ceiling itself — enforced, unbreached by any module. Only its
  *stated derivation* is unsound. And the enforcement is genuinely good, which
  I verified rather than assumed: `site.finish()` checks the material set
  against `assets.js` **before** export, then **re-derives the draw count off
  the joined scene** afterwards — *"the number the game will actually pay, not
  the number we predicted before joining"* — and on a breach it **deletes the
  file** so it cannot ship. That is a gate that cannot pass over an empty or
  optimistic set, which is exactly what ASTRA §10 asks for and what most of the
  other gates in this tree do not do.
- The `sitePlaneMatches()` plane fix (§2.4) — real, verified in the file, and it
  closed a route by which an `underground-drive.glb` would have been fetched,
  parsed, logged as loaded, counted in the budget and never drawn.

---

*Nothing in this document is a gameplay capture. No offline Blender render is
cited as evidence of runtime appearance. Every unmeasured thing is named as
unmeasured.*
