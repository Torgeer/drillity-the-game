# Model critique — the nine Blender machines

**Written 2026-09-05.** Scope: `blender/<id>.py` read, `public/models/<id>.glb`
parsed byte-for-byte, real-machine data and photography checked on the web.
Graded against the real machines, not against each other.

**Nothing below is quoted from the build reports.** Every number is measured out
of the shipped `.glb`: vertex positions transformed by the real world matrices,
primitives counted, `extras` read, node names scanned. Where a build report and
the file disagree, the file wins and the disagreement is named.

---

## 0. The one-paragraph verdict

**The research is the best part of this project and the geometry is mostly
worthy of it.** Seven of the nine would be named correctly by a driller from
silhouette alone. None is a box with a stick. The sourcing discipline — measuring
drawing rasters against a stated dimension, solving a foot height out of two
published overall heights, refusing to average two machine classes — is
genuinely better than most commercial asset work.

**And then the fleet falls over on the boring half.** Four tyres on the jumbo are
7.3 m tall and hang 6.4 m through the floor. Five of nine machines cannot move
their carriage because the runtime's one required key is missing, misspelled or
on the wrong node. One machine is not registered in the game at all. One is
11.7 MB. Three different naming conventions are in use for "how far this thing
slides". **The models are 85 % done and 0 % finished**, and the gap is entirely
in the last mile that nobody enjoys.

---

## 1. Measured facts — the whole fleet

Draw calls = glTF primitives (three.js draws one per primitive). Triangles and
bounds are from vertex data, not from accessor `min`/`max`.

| id | draw calls | tris | MB | true W × H × L (m) | lamps | carriage drivable | tool anchor |
|---|---|---|---|---|---|---|---|
| `pd55` | 67 | 71,264 | 4.56 | 4.70 × 25.79 × 9.41 | 4 | **NO** | ✓ |
| `foundation-bg` | 33 | 67,892 | 4.28 | 5.07 × 27.13 × 9.77 | 4 | ✓ 10.0 m | ✓ |
| `tunnel-jumbo` | 66 | 28,680 | 1.45 | 2.26 × 8.18 × **15.75** | 11 | **NO** | **NO** |
| `core-rig` | 43 | 23,052 | 1.33 | 2.89 × 12.27 × 6.65 | 4 | ✓ 3.5 m | ✓ |
| `rc-rig` | 43 | **171,908** | **11.73** | 7.88 × 7.21 × 7.61 | 7 | **NO** | ✓ |
| `crawler-th` | 63 | 41,028 | 2.36 | 2.77 × 6.06 × 9.26 | 8 | ✓ 4.24 m | **NO** |
| `dth-crawler` | 53 | 62,252 | 3.93 | 3.23 × 10.08 × 8.84 | 6 | ✓ 5.72 m | ✓ |
| `piling-leader` | 57 | 31,956 | 1.92 | 6.01 × 27.33 × 9.24 | 5 | **NO** | **NO** |
| `cfa-rig` | 40 | 67,468 | 4.30 | 6.84 × 28.78 × 10.10 | 6 | **NO** | ✓ |

**Q4 — draw calls: nothing is over 70.** `pd55` at 67 and `tunnel-jumbo` at 66
have three and four calls of headroom against a hard budget, which is not
headroom. `crawler-th` ships **63 primitives / 41,028 tris**, not the 62 / 39,928
its build report claims — the self-report is one part stale. Every other
machine's self-reported counts match the file exactly.

**Q6 — manufacturer names or model designations in the meshes: none.** All nine
`.glb` files were string-scanned for 40 maker names and designations (Bauer, RTG,
Junttan, Sandvik, Epiroc, Atlas Copco, Boart Longyear, Christensen, Mincon,
Schramm, Foremost, FlexiROC, SmartROC, Explorac, DD211, D65, T35/T40, CS14,
LF160, Robbins, Soilmec, Casagrande, Klemm …) across node names, mesh names,
material names, `extras` and the asset block. **All nine clean.** Provenance
lives in code comments, which is where the rule puts it. This part was done
properly and deserves saying so.

**But §10 is broken one level up, in `data.js`.** `RIGS` row `piling-leader` is
named **"Bergholt PM-78 Leaderline"**. `PM` is the real maker's own live model
prefix — its current catalogue is PM20, PM25H, PMx22, PMx25 — and
`core/assets.js` stamps `params.maker` and the row name onto the machine's data
plate and its shop card. The mesh is clean; **the string a player reads is not.**
The build report flags this itself and it is still shipping. It needs a letter
prefix that is not a live designation.

---

## 2. Ranking, worst first

### 9th — `tunnel-jumbo` (Aurbach FJ-220 Faceline) — FAIL

**Q1, silhouette: fails, and fails on the one thing the class is named for.**

All four tyres are catastrophically broken. Measured from the file:

```
pivot:wheel-fl|rubber        Y −6.417 … +0.928   →  7.345 m tall, 2.333 m fore-aft
pivot:wheel-fl|paintedDark   (the rim)           →  0.532 m — correct
65 % of every tyre's vertices are below y = 0
```

The rim is right. The tyre around it is a **7.3-metre-tall black spike, four of
them, hanging six and a half metres through the floor** on a machine whose entire
reason to exist is a 1,775 mm tramming height. A driller would not identify this
as a low-profile jumbo. A driller would identify it as a crash.

**Cause, exactly.** `build_wheel()` arrays the tread lug with
`use_object_offset = True` against an offset empty parented to the wheel pivot.
Blender computes that offset as `lug.matrix_world.inverted() @ off.matrix_world`
— so each step carries the lug's own `loc=(0, 0, WHEEL_R − 0.010)` **and** its
own `rot=(0.38, 0, 0)` into the transform, and eighteen copies walk off in a
spiral 7.3 m long instead of going round the rim.

**This exact bug is documented twice in this repo and was fixed in the wrong
place.** Fourteen lines below the broken lug array, the wheel-nut loop carries
the comment: *"an object-offset array compounds the bolt's own 90 deg aiming
rotation into every step, and the studs walk outboard until the machine measures
2 391 mm across a sourced 2 260 mm width. Six explicit tubes join into the same
mesh anyway, so it costs nothing to be right."* Somebody diagnosed it, wrote it
down, fixed the nuts, and left the lugs. `rc_rig.py`'s `arrayed()` docstring
documents the same failure a third time, from a different machine.

**And the model's own QA was built to miss it.** `report_extent()` prints
`height=%.3f` from `max(zs)` and never prints `min(zs)`. It measures upward only.
Six point four metres of tyre below the floor is invisible to the check that
exists specifically to catch this.

Everything else about this machine is good: two drilling booms plus a basket boom
on a centre-articulated four-wheel carrier, cable reel on the back deck,
raised/lowered canopy, 11 correctly paired lamps with per-lamp cones — the
richest lighting in the fleet. The class decision (low-profile, not M-class, on
the strength of the brief's own 1,775 mm) was the right call and is defended
properly.

**Other measured faults:**

- **Length 15.75 m against a sourced transport length of 10.375 m.** The cause is
  `build_trailing_cable()`, an 8.6 m hazard-orange cable laid down the drive.
  That is a legitimate and welcome feature — but it is *inside the rig mesh*, so
  `makeSpec()`'s `frameRadius`, derived from the bounding radius, roughly
  doubles. Placement, culling and collision all inherit an 8.6 m tail.
  `report_extent()` already excludes it by name; the runtime does not.
- **No `slide:carriage`, no `mount:tool`.** `gltfRig.makeDyn()` looks up exactly
  those two strings. Both null. The machine has `slide:boom-l-carriage` and
  `slide:boom-r-carriage`, correctly carrying `travel_m: 2.132` — the right
  number, on names the runtime cannot see. **No tool can be attached to this
  machine and no feed can be driven.**
- **38 mesh nodes are named into the `pivot:` / `slide:` namespace** —
  `pivot:articulation|rubber`, `slide:boom-l-feed|rawSteel` and so on. `index()`
  keys its maps on the prefix and sets `userData.dynamic = true` on every hit, so
  38 static meshes are published as movable parts and are exempted from
  `mergeStatic()`. **Only this machine does this**; the other eight suffix
  material with `:` or `_` on a name that does not start with a reserved prefix.
- **19 of 19 real pivots carry no `extras` at all** — articulation, both boom
  slews, lifts, rolls, swings, the basket, the cable reel. No ranges, no limits.
- `castIron` is a whole material for two 44-triangle axle differentials.

**Three highest-value fixes**

1. **Rebuild the tread lugs with an explicit loop**, as the wheel nuts already
   are — `for i in range(18): box(..., rot=(i*TAU/18, 0, 0))` — or move the lug
   to the pivot origin so the object offset is a pure rotation. Then add
   `min(zs)` to `report_extent()` and make it *fail*, not print.
2. **Publish `slide:carriage` and `mount:tool`.** A two-boom rig genuinely needs
   two, so either alias the left boom to the canonical names or extend the
   runtime contract to `carriage[]`/`tool[]` — but ship one of the two, because
   as built the jumbo cannot hold a rod.
3. **Rename every material-split mesh out of the reserved prefixes**
   (`articulation:rubber`, not `pivot:articulation|rubber`), and move the
   trailing cable to a separate node the runtime excludes from the bounds.

---

### 8th — `pd55` (BamBam PD-55 Driveline) — best-researched, least finished

**Q1, silhouette: passes, comfortably.** The parallelogram linkage is real
visible structure with its own three pivots, the mast slides through a guide
collar rather than pivoting, the head folds and carries an auxiliary rope jib,
the counterweight is **three separate stacked slabs with per-slab lifting lugs** —
not one block — and there are two distinct winches on the deck. All ten
identifying features from `rm20-leader.md` §8 are present. Height measures
**25.70 m exactly**, dead on the sourced dim A. Track gauge measures **4.700 m
exactly**, dead on the sourced extended crawler width. This is the most faithful
geometry in the fleet.

**And the game cannot load it.** There is no `pd55` row in `data.js`, no
reference in `rigFactory.js`, nothing in `src/` at all. `tools/checkmodels.mjs`
says so out loud: *"RM 20-class leader: modelled, NOT YET registered in
data.js"*. 4.56 MB and 71,264 triangles of the best modelling here, unreachable.

**And if it were registered, nothing on it would move.** All **22** named
pivot/slide nodes carry **zero `extras`** — no travel, no range, no limits:

```
slide: hammer, carriage, mast, mast-foot, rear-support, rope-fall, rope-leads,
       track-l, track-r
pivot: kin-front, kin-ram, kin-rear, pile-guide-l, pile-guide-r, aux-jib,
       sheaves, mast-head, sledge-tilt, mast-carrier, winch-main, winch-pile, slew
```

`slide:carriage` has no `travel_m`, so `makeDyn()` sets `carriageRange = [y, y]`
and `carriageNoFlex = true`. **The hammer cannot travel down the mast.** The 7 m
sliding mast — the feature the source document leads with, the reason the machine
exists — declares no stroke. The kinematics cannot articulate.

**Other measured faults:**

- Rear extent **4.785 m** against the sourced 4.60 m swing radius over the
  counterweight. 185 mm of glass sits outside a published, safety-relevant
  tail-swing circle that the file deliberately anchored the counterweight rear
  face to.
- 67 draw calls: three under budget, the tightest in the fleet.
- `safetyStripe` spends a material on 1,008 tris across two prims.

**Three highest-value fixes**

1. **Add the `RIGS` row**, or delete the model. A 4.56 MB orphan in
   `public/models/` is copied verbatim into `dist/` and served to nobody.
2. **Parameterise all 22 nodes.** At minimum `slide:carriage {travel_m}`,
   `slide:mast {travel_m: 7.0}` (the headline feature), `pivot:sledge-tilt`,
   `pivot:mast-carrier` and the three `kin-*` pivots with real ranges from [P4]'s
   4.20–5.70 m outreach.
3. Pull the rear glazing 185 mm forward so nothing breaks the 4.60 m tail radius,
   and merge `safetyStripe` into `paintedDark` to buy a call back.

---

### 7th — `cfa-rig` (Lindhorst CF-28 Continuum) — the method cannot be played

**Q1, silhouette: passes, and the auger is the best single object in the fleet.**
Measured: **1.000 m OD, 20.17 m long**, a genuine helical flight (7,112 + 7,300
triangles of real helix, not stacked discs), hanging beside a 28.12 m mast on a
low dark base — exactly the 3 : 1 vertical dominance `cfa-rig.md` §5 asks for.
The concrete head is a flanged drum with a **horizontal 90° elbow** on top, not a
vertical stub, and the concrete line runs from a ground-standing pump 4.6 m off
the machine's right side, up the mast to 22.46 m. The auger cleaner is there, at
1.10 m above ground, on its own pivot with rotating blades. Overall height
measures **28.12 m exactly**, dead on the sourced figure. A driller names this
instantly.

**And then: all 10 named pivot/slide nodes carry zero `extras`.**

```
slide: carriage, mastRodL, mastRodR
pivot: augerCleaner, sheave1, sheave2, spindle, mast, mastRamL, mastRamR
```

`slide:carriage` has no `travel_m`, so the 17 m crowd stroke is zero.
`pivot:spindle` has no rpm. **The auger cannot turn and cannot descend.** For a
machine whose whole method is one continuous auger going down and coming up full,
that is the method deleted.

**Other measured faults:**

- **`depthCapacity: 32` in the shop row against 17–20 m of geometry.** CFA has no
  rod adds — pile depth *is* usable auger length. `CROWD = 17.00`,
  `AUGER_LEN = 18.0`, mesh 20.17 m. `cfa-rig.md` cites a 16,000 / 19,000 mm
  auger. **Nothing anywhere supports 32 m.** The card promises a hole the machine
  cannot drill.
- **Bounding box 6.84 m wide because the concrete pump and its line are inside
  the rig mesh.** Same class of problem as the jumbo's cable: a correct and
  valuable feature (`cfa-rig.md` §5 item 5 — *"the CFA rig is never alone"*)
  living in the wrong node, inflating `frameRadius` for placement and culling.
- `chrome` is a whole material for **124 triangles across 3 draw calls** — 41
  triangles per call. `glass` is 132 across 2.
- 67,468 tris / 4.30 MB, of which `static:wornSteel` alone is 25,284.

**Three highest-value fixes**

1. **Parameterise the ten nodes.** `slide:carriage {travel_m: 17.0}`,
   `pivot:spindle {rpm_max, torque_knm}`, `pivot:mast {rake…}`,
   `pivot:augerCleaner {range_deg}`. Without the first one the rig is furniture.
2. **Fix `depthCapacity` to what the auger reaches** (~18 m), or lengthen the
   auger and say where the number came from. Do not ship a card the mesh
   contradicts.
3. **Move the pump and concrete line under a `static:site-*` node** the runtime
   excludes from bounds, so the rig's radius is the rig.

---

### 6th — `rc-rig` (Kjelvik RC-410 Chipline) — right machine, ruinous cost

**Q1, silhouette: the strongest identification in the fleet.** Every one of
`rc-rig.md` §5's five tests is met and met properly: the fat corrugated sample
hose leaves the head **sideways from a deflector box** (never from the top) and
sags down to a cyclone; the cyclone is a real ceramic-lined barrel-and-cone with
a splitter and calico bags under it, on a fully X-braced stand *and* on a
deck-cantilevered slew arm; the mast is an open lattice at 8.5 : 1; the machine
stands on four jacks with the tracks hanging clear; and there is no cab, because
the reference machine has none. The dual swivel, head wear tube and knock-on hose
tail are all modelled as separate identifiable objects. **This is what "most
realistic possible" looks like.**

**And it costs 171,908 triangles and 11.73 MB.** That is 2.5× the next heaviest
machine, 6× the jumbo, and **9× the core rig** — which is a comparably detailed
machine of similar size. Per draw call it is 4,000 triangles against a fleet
median of 800.

```
wornSteel     107,044 tris across 10 draw calls
  static:wornSteel  64,120      mast:wornSteel  36,544  (a 0.95 × 4.98 × 1.04 m object)
paintedDark    32,852 tris across  5 draw calls
```

36,544 triangles inside a one-metre box. The cause is arrays of **bevelled**
boxes: 30 `strut()` truss members each bevelled, feed-chain links and pins arrayed
at 60 mm pitch up a 5.45 m mast, bolt rings at 260 mm pitch, and
`perforated_panel()`, which builds every hole as a 6-sided tube arrayed on a 78 mm
grid — roughly 3,700 triangles per panel. The reasoning behind each choice is
sound in isolation ("triangles, not calls"); together they produce a machine that
is a **12 MB runtime fetch** in a game that fetches models over the network at
scene entry.

**Other measured faults:**

- **`slide:carriage` declares `range_m: [-1.64, 1.55]` and no `travel_m`.** The
  runtime reads `travel_m` and nothing else. `carriageRange` collapses to
  `[y, y]`. **The head cannot travel.** The data is present, correct, and under
  the wrong key.
- `safetyStripe` is a whole material for a single prim.
- Bounding box 7.88 m wide because the cyclone stand and bag rows are inside the
  rig mesh — again correct content, wrong node.

**Three highest-value fixes**

1. **Rename `range_m` to `travel_m` on `slide:carriage`** (one line) — or better,
   make the runtime accept both and say so once in `rig.py`. Half the fleet is
   guessing at this key.
2. **Halve the triangles.** Drop `bevel` on anything inside an array of more than
   ~8 copies (chain links, bolts, perforation dots, track shoes) — a bevel is
   invisible on a 30 mm object and it is where six figures of triangles went.
   Target ≤ 60k tris / ≤ 4 MB, which is still the heaviest machine in the fleet.
3. **Move the cyclone stand, bag rows, chip trays and bulk pile to a site-props
   node.** They are excellent and they should not be in the rig's bounding
   sphere.

---

### 5th — `piling-leader` (Bergholt PM-78 Leaderline)

**Q1, silhouette: passes on all five tests.** Overall height 26.50 m measured,
**exactly** the sourced figure, over a 5.70 m crawler — a 4.65 : 1 ratio with no
boom, which nothing else on a site has. The leader is genuinely perforated:
`HOLE_PITCH 0.600` measured off 43 detections in the source drawing, punched as
real holes. The deep triangular backstay is there with a chrome-rodded rake
cylinder inside it. The hammer is a 7.16 m body — a long dark object hanging a
quarter of the way down the mast — with a pile below it going 830 mm into the
ground. Correct.

**Contract discipline is the best in the fleet — and it misses the only two names
that matter.** All 13 slides and all 10 pivots carry `extras`; zero bare nodes;
the only machine to manage that. But:

- **No `slide:carriage`.** The hammer rides `slide:hammer-carriage`, which
  declares `travel_lo_m: -13.2` and `travel_hi_m: 1.92` — a **third** naming
  convention for stroke, after `travel_m` and `range_m`. The runtime reads none
  of it.
- **No `mount:tool`.** `mount:pile-head` exists and is the right idea. The
  runtime does not know that string.
- So `dyn.carriage` and `dyn.toolAnchor` are both null. **The hammer cannot fall
  and the pile cannot be held.** On a machine whose row says *"Nothing on this
  machine rotates and nothing circulates — it lifts a pile, sets it plumb and
  hits it."*

**Other measured faults:**

- **`upper_glass` is 60 triangles with a whole material and a whole draw call.**
  The worst material-to-geometry ratio in the fleet. `upper_paint` is another
  single-prim material.
- Width 6.01 m against 5.78 m over the extended tracks — 230 mm of something
  outboard of the widest sourced dimension.
- **`PM-78` reuses the real maker's live model prefix** (§10 breach, in
  `data.js`, not the mesh).
- The code comment immediately above the `piling-leader` `RIGS` row describes a
  different machine entirely: *"A slew ring swinging a short feed through a full
  circle, so one set-up drills a whole ring. The rods are short for the same
  reason."* — pasted from the longhole rig onto a machine with no slew ring on a
  feed, no rotation and no rods.

**Three highest-value fixes**

1. **Alias `slide:hammer-carriage` → `slide:carriage` with `travel_m`, and
   `mount:pile-head` → `mount:tool`.** Two names. Everything else is already
   right.
2. **Rename the marque** away from `PM-`. `mount:marque` is already in the mesh
   waiting for it; only the `data.js` string needs changing. Delete the
   copy-pasted longhole comment while you are in there.
3. Fold `upper_glass` and `upper_paint` into their neighbours — two draw calls
   for 936 triangles.

---

### 4th — `crawler-th` (Steinbach TH-320 Ridgeline)

**Q1, silhouette: passes.** One single-piece feed beam (the report is explicit
that a telescoping beam was a defect being fixed — correct), held far outboard on
a folding articulated boom, **raked 15°** to the one published field configuration
rather than standing vertical, with the mesh-caged 1+7 carousel alongside the
upper feed and a 127 mm ribbed dust hose from the collar hood to a collector. The
beam is `MAT_STEEL`, not body colour — the right call for bare aluminium
extrusion within a fixed palette. Low wide tracked body, small offset glazed cab,
louvred rear enclosure. A driller names it.

**Faults, measured:**

- **11 of 13 named nodes carry no `extras`** — including `pivot:boom-fold`,
  `pivot:boom-lift`, `pivot:boom-swing` and `pivot:feed-tilt`. **The folding
  articulated boom is the feature that separates this class from a DTH crawler
  and from a piling rig, and it declares no range.** `slide:feed-extend` (the
  sourced 1,400 mm extension) is bare too. Only `slide:carriage` (4.24 m ✓) and
  `pivot:rod-carousel` are parameterised.
- **`mount:tool-anchor`, not `mount:tool`.** The runtime falls back to
  `slide:carriage`, so a tool does attach — at the carriage origin rather than at
  the chuck. Degraded, not dead.
- **Width 2.765 m against the file's own `WIDTH = 2.45`.** That constant is not
  decoration: `SHOE_W` and `GAUGE` are *derived from it*, and it is the only
  published machine width the research could find. The built statics reach
  −1.46 / +1.305. **The machine is 13 % wider than the number every other
  dimension in the file hangs off.**
- 63 draw calls, 7 of them spent on 492 triangles of `chrome` — 70 triangles a
  call.
- Ships 41,028 tris / 63 prims against a self-report of 39,928 / 62.

**Three highest-value fixes**

1. **Parameterise the boom.** `pivot:boom-swing {range_deg}`, `pivot:boom-lift`,
   `pivot:boom-fold`, `pivot:feed-tilt` and `slide:feed-extend {travel_m: 1.4}`.
   Without them the machine's identifying motion does not exist.
2. **Find the 315 mm.** Either pull the offending statics inside ±1.225 m or
   change `WIDTH` and re-derive `SHOE_W`/`GAUGE` from the real figure — but the
   file must not contradict its own master dimension.
3. Rename `mount:tool-anchor` → `mount:tool`; merge `chrome` into `wornSteel` for
   the small rods and buy back five draw calls.

---

### 3rd — `dth-crawler` (Brenner DH-750 Ironvein)

**Q1, silhouette: passes cleanly, including the negative tests.** A very tall,
very thin, perfectly straight aluminium beam (measured 10.03 m, a constant section
with real longitudinal flutes) standing off the **front** of the machine on a
folding boom, with visible daylight between beam and carrier. A long high closed
box body with louvred flanks for the compressor. A 203 mm ribbed hose to a
cyclone-and-filter package hung on the beam. **No drifter** — a compact rotary
head, correctly a lump and not a sausage. Tube carousel, single rear support leg.
Every one of `dth-crawler.md` §5's five features, and none of its five negative
tests trips.

**Contract: good.** All 5 slides and 7 of 9 pivots parameterised, with real
numbers (`slide:carriage {travel_m: 5.724, rate_ms: 0.9, force_kn: 40}`,
`pivot:oscillation {osc_m: 0.429, axis: "roll"}`). `slide:carriage` and
`mount:tool` both present and correct. This machine works.

**Faults, measured:**

- **Width 3.225 m against the file's declared `W = 2.650`, +21.7 %.** This is the
  worst dimensional contradiction in the fleet, and it matters more here than
  anywhere because **`W` is the file's master unit**: `FEED_LEN = 3.76 × W`,
  `TRANSPORT_H = 1.40 × W`, `REACH_MIN = 1.08 × W`, `FEED_TRAV = 2.16 × W`. Every
  ratio-derived dimension on the machine is scaled from a width the built machine
  does not have. The overshoot is the left-flank walkway grating
  (`−BODY_W/2 − 0.44` = −1.66 m) plus the right-side handrails; it is a real
  feature built outside the envelope, and at 3.23 m the machine no longer fits a
  3.0 m transport width.
- 62,252 tris / 3.93 MB — heavy for the class. `under_wornSteel` alone is 9,704
  triangles of track.
- `glass` is a whole material for one prim (1,080 tris — defensible, it is the
  cab), `chrome` a whole material for 204 tris across 3 calls.
- `pivot:boomRam` and `pivot:feedSwing` carry no ranges.

**Three highest-value fixes**

1. **Reconcile `W` with the mesh.** Either fold the walkway inside the envelope
   (real machines fold theirs for transport — model it stowed) or set `W` to the
   true over-walkway width and re-check every ratio it feeds.
2. Parameterise `pivot:feedSwing` and `pivot:boomRam`.
3. Trim the track: 9,704 triangles of undercarriage on a machine that spends most
   of its screen time with the boom out is the cheapest 15 % available.

---

### 2nd — `foundation-bg` (Torvald KR-46 Kellyline)

**Q1, silhouette: passes, and the Kelly carries it.** 27.10 m measured — dead on
the sourced upgraded overall height — over a 9.77 m machine, so the 2.5 : 1
tower-on-a-barge proportion is right. The four-part Kelly is a real nest of
concentric round tubes with six drive keys per section, hanging **1.40 m in front
of the mast face** (the sourced drill-axis offset, and the thing that stops it
reading as a crane jib), with a rope swivel above. Counterweight overhangs the
tail. The parallel-linkage leader mount is heavy visible structure. No hammer on
the leader, no single full-length auger, mast vertical — all three negative tests
pass.

**The dimension decode in the header is the best piece of engineering reasoning in
this repo.** Solving the leader foot height `Zf = 4,460 mm` simultaneously from
two published overall heights, and confirming the mast front face at 2,940 mm from
`reach − drill-axis` in both configurations, is exactly right, and the mesh
honours it.

**Contract: best in the fleet on parameters.** 4 of 4 slides and 2 of 3 pivots
carry real `extras` — three Kelly stages at `travel_m: −11.5` with
`overlap_m: 1.71`, `slide:carriage {travel_m: 10}`, `pivot:spindle {rpm_max: 53,
torque_knm: 385}`.

**Faults, measured:**

- **The mesh says 385 kNm; the shop card says 178 kNm.** `pivot:spindle` carries
  the sourced 385 kNm of the upgraded machine, and the `RIGS` row advertises
  `torque: 178`. The build report knows and says so. Two user-visible numbers for
  one machine, differing by 2.16×.
- **`depthCapacity: 78` against a modelled 4-part Kelly whose sourced extended
  length is 49.80 m.** The geometry cannot reach the card.
- **Width 5.065 m against the sourced 4.700 m extended crawler width.** Mirrors
  legitimately overhang — but `slew-wornSteel` (structure, not mirrors) reaches
  −2.589, so **handrails stand outboard of the crawlers**, which on this class
  they do not.
- **Five of nine materials are spent on ≤ 2 prims**: `chrome` 88 tris / 1 call,
  `glass` 108 / 1, `paintedSteel` 2,364 / 2, `rubber` 2, `safetyStripe` 2. Only 33
  draw calls total, so there is room — but two draw calls for 196 triangles is
  waste wherever it happens.
- **`public/models/` ships both `foundation-bg.glb` and `foundation_bg.glb`** —
  different files, 4.28 MB each, only one reachable by id. 4.28 MB of dead weight
  copied verbatim into `dist/`.

**Three highest-value fixes**

1. **Pick one machine.** Either build the basic 112 t / 178 kNm version the card
   sells, or change the card to 385 kNm / 131 t and fix `depthCapacity` to what a
   4-part Kelly reaches. Shipping both numbers is worse than either.
2. **Delete `foundation_bg.glb`** and pull the deck handrails inside 4.70 m.
3. Merge `chrome` and `glass` into a neighbour — 196 triangles do not need two
   draw calls.

---

### 1st — `core-rig` (Meridian CX-1200 Wireline) — the reference

**Q1, silhouette: passes on all five tests, including the hard one.** A slender
**hole-punched plate mast** (real lightening holes at the measured 120 mm /
260 mm pitch) at 12.27 m over a 6.65 m base — the sourced 1.6 : 1 ratio, and the
dotted line of holes is the texture that survives downsampling. The **big open
mesh-sided rod basket tilts with the mast** on its own pivot and hangs off one
side past the rear — the second-largest object in the silhouette and the thing no
other machine has. **No cab**, correctly: a low pedestal console under a light
canopy. Wide low flat-track crawler at the sourced 2.895 m / 2.20 m gauge /
536 mm clearance. And the EN 16228 interlocked rotation barrier and rod-spin
guard are both built — the file's own comment notes the game's procedural version
had `guard: false` and that this is *"period-wrong for any machine sold in
Europe"*. That is the correct instinct applied to the correct detail.

**Numbers: the cleanest in the fleet.** 43 draw calls, **23,052 triangles**,
**1.33 MB** — a third of the fleet median for a machine of comparable detail. All
5 slides and 5 of 7 pivots parameterised, and the parameters are the richest
anywhere: `slide:carriage {travel_m: 3.5, travel_min_m, travel_max_m, rod_pull_m:
6.09}`, `pivot:spindle {rpm_max: 1500, torque_nm: 3212, bore_mm: 117}`, four jacks
at 550 mm each. `slide:carriage` and `mount:tool` both present. **This machine
loads, animates and lights correctly as shipped.**

**Faults, and they are small:**

- Height **12.265 m** against the sourced dim B of 12.155 m — 110 mm over, from
  `mast:rawSteel` above the crown.
- `pivot:sheave-main` and `pivot:sheave-wire` carry no `extras` (rope diameters
  are on the winches, so this is cosmetic).
- `glass` (2 prims, 156 tris), `safetyStripe` (3 prims, 156 tris) and `chrome`
  (6 prims, 280 tris) — **three materials, 11 draw calls, 592 triangles between
  them.** 47 triangles per call on the chrome.

**Three highest-value fixes**

1. Bring the crown 110 mm down so the mesh matches dim B, and add ranges to the
   two sheave pivots.
2. **Merge `chrome` and `safetyStripe` into `wornSteel` and `paintedDark`.** Nine
   draw calls back for no visible change — and this rig has the headroom to spend
   them on the rod-handling system instead.
3. **Make this file the template.** Its `extras` vocabulary (`axis`, `travel_m`,
   `travel_min_m`, `travel_max_m`, plus domain fields) is the one the other eight
   should have used.

---

## 3. Cross-fleet findings

### 3.1 Q5 — the animation contract is broken on five of nine machines

`gltfRig.makeDyn()` reads exactly two strings, `slide:carriage` and `mount:tool`,
and exactly one key, `travel_m`. Its own comment warns that a carriage without
both *"does not throw — it writes NaN into a world matrix and the machine
silently disappears."*

| machine | `slide:carriage` | `travel_m` | verdict |
|---|---|---|---|
| `foundation-bg` | ✓ | 10.0 | works |
| `core-rig` | ✓ | 3.5 | works |
| `crawler-th` | ✓ | 4.24 | works |
| `dth-crawler` | ✓ | 5.724 | works |
| `pd55` | ✓ | **absent** | dead |
| `cfa-rig` | ✓ | **absent** | dead |
| `rc-rig` | ✓ | **`range_m` instead** | dead |
| `tunnel-jumbo` | **absent** | (on `boom-l/r-carriage`) | dead |
| `piling-leader` | **absent** | (**`travel_lo_m`/`travel_hi_m`**) | dead |

**Three different key names are in use for one concept** — `travel_m`, `range_m`,
`travel_lo_m`/`travel_hi_m` — plus `travel_min_m`/`travel_max_m` alongside
`travel_m` on two machines. Nobody wrote the vocabulary down, so nine authors
invented five dialects. `mount:tool` is missing on three machines and misspelled
`mount:tool-anchor` on a fourth.

Bare nodes, fleet-wide: **`pd55` 22/22, `tunnel-jumbo` 19/19 pivots,
`crawler-th` 11/13, `cfa-rig` 10/10** carry no `extras` at all. `piling-leader`
and `rc-rig` have zero bare nodes.

Lighting, by contrast, is in good shape: **every one of the 55 lamps across the
fleet has a correctly paired `mount:`/`aim:` and per-lamp `cone_deg`/`range_m`.
No orphan `aim:` nodes anywhere, and no `mount:` declaring a cone without an
aim.** The `worklight()` half of the contract works.

**The single highest-value fix in this whole review** is to write the `extras`
vocabulary into `blender/lib/rig.py` as named constants, make `finish()` refuse
to export a `slide:` or `pivot:` node with no declared range, and add a
`tools/glbverify.mjs` gate asserting `slide:carriage + travel_m` and `mount:tool`
on every model. That is an afternoon, and it un-breaks five machines.

### 3.2 Q4 — materials wasted on small meshes

All nine files carry 8–9 materials with identical placeholder `baseColorFactor`,
because `swapMaterials()` replaces them by name at load. So a material is not a
texture cost — **it is purely a draw-call partition**, and any material carrying
under a few hundred triangles is a call thrown away.

Worst offenders, measured:

| machine | material | tris | draw calls | tris/call |
|---|---|---|---|---|
| `piling-leader` | `upper_glass` | 60 | 1 | 60 |
| `foundation-bg` | `chrome` | 88 | 1 | 88 |
| `tunnel-jumbo` | `castIron` | 88 | 2 | **44** |
| `foundation-bg` | `glass` | 108 | 1 | 108 |
| `cfa-rig` | `chrome` | 124 | 3 | **41** |
| `cfa-rig` | `glass` | 132 | 2 | 66 |
| `core-rig` | `safetyStripe` | 156 | 3 | **52** |
| `core-rig` | `glass` | 156 | 2 | 78 |
| `dth-crawler` | `chrome` | 204 | 3 | 68 |
| `core-rig` | `chrome` | 280 | 6 | **47** |
| `crawler-th` | `chrome` | 492 | 7 | **70** |

**The pattern is systematic, not incidental.** `chrome` fragments because cylinder
rods live under many different pivots and cannot be joined across them; `glass`
fragments because it is split between a cab group and lamp lenses. About **20 draw
calls fleet-wide carry under 100 triangles each** — and `pd55` (67) and
`tunnel-jumbo` (66) are the machines closest to the 70 ceiling.

### 3.3 Q3 — claimed dimensions the mesh contradicts

Verified by transforming every vertex by its real world matrix.

**Exact — the mesh honours the source to the millimetre:**

| machine | claim | measured |
|---|---|---|
| `pd55` | 25.70 m max rig height, dim A | **25.70** |
| `pd55` | 4.700 m extended crawler width | **4.700** |
| `foundation-bg` | 27.100 m overall, upgraded | **27.100** |
| `piling-leader` | 26.50 m overall height | **26.50** |
| `cfa-rig` | 28.12 m overall, working | **28.12** |
| `core-rig` | 2.895 m overall width | **2.890** |
| `core-rig` | 6.636 m transport length | **6.647** |
| `cfa-rig` | 1.000 m auger diameter | **1.000** |

**Contradicted:**

| machine | claim | measured | error |
|---|---|---|---|
| `tunnel-jumbo` | wheel Ø 917 mm (315/85 R15) | **7,345 mm** | **+700 %** |
| `tunnel-jumbo` | 10.375 m transport length | 15.753 m | +52 % (trailing cable in mesh) |
| `dth-crawler` | `W = 2.650` m, the file's master unit | 3.225 m | **+21.7 %** |
| `crawler-th` | `WIDTH = 2.45` m (only published width) | 2.765 m | **+12.9 %** |
| `foundation-bg` | 4.700 m extended crawler width | 5.065 m | +7.8 % |
| `cfa-rig` | `depthCapacity: 32` m (shop row) | ~18 m of auger | **−44 %** |
| `foundation-bg` | `torque: 178` kNm (shop row) | `pivot:spindle` 385 kNm | **+116 %** |
| `foundation-bg` | `depthCapacity: 78` m (shop row) | 49.80 m Kelly extended | −36 % |
| `piling-leader` | 5.78 m over extended tracks | 6.010 m | +230 mm |
| `pd55` | 4.60 m tail swing radius | 4.785 m | +185 mm |
| `core-rig` | 12.155 m dim B | 12.265 m | +110 mm |
| `tunnel-jumbo` | 2.260 m transport width | 2.260 m | ✓ (the nuts fix held) |

**Two distinct failure modes.** The small ones (110–365 mm) are handrails, mirrors
and walkways built outside a stated envelope — real features in the wrong place.
The large ones (`dth-crawler`, `crawler-th`) are worse in kind: in both files the
violated width is the **master unit every other dimension is derived from**, so
the whole machine is proportioned off a number it does not honour.

**And three machines put site props inside the rig mesh** — the jumbo's 8.6 m
trailing cable, the CFA's ground-standing concrete pump and line, the RC rig's
cyclone stand and bag rows. All three are correct, valuable content. All three
inflate `makeSpec()`'s `frameRadius`, which drives placement and culling: the
jumbo's bounding length roughly doubles.

### 3.4 Q2 — which are still generic

**None of them.** That question does not have an answer here, and it should be
said plainly: there is no box-with-a-stick in this fleet. Every machine carries
the specific structure its class is identified by — the parallelogram linkage and
stacked counterweight discs on the `pd55`, the concentric keyed Kelly on
`foundation-bg`, the punched plate mast and tilting mesh rod basket on `core-rig`,
the sideways sample hose and cyclone-over-bags on `rc-rig`, the single full-length
helical auger and the horizontal concrete elbow on `cfa-rig`, the perforated
leader and triangular backstay on `piling-leader`.

The nearest thing to a generic read is `tunnel-jumbo`, and not because it was
modelled generically — it is one of the better-detailed files — but because four
broken tyres destroy the low, wide, ground-hugging proportion that *is* the
identification. Fix the array and it moves into the top half of this ranking.

### 3.5 Housekeeping

- `public/models/foundation_bg.glb` — 4.28 MB, unreachable duplicate.
- `public/models/pd55.glb` — 4.56 MB, no `RIGS` row.
- `crawler-th`'s self-reported part and triangle counts are stale by one part.
- `RIGS` row `piling-leader` carries a code comment describing the longhole rig.

---

## 4. What to do first

In order of value per hour:

1. **Fix the four jumbo tyres.** One function. It is the only visible catastrophe
   in the fleet.
2. **Write the `extras` vocabulary into `rig.py`, and gate the export on it.**
   Five machines start animating.
3. **Add `slide:carriage` + `travel_m` and `mount:tool` to the five machines
   missing them.** Mostly renames.
4. **Reconcile the four shop-card numbers the meshes contradict** — `cfa-rig`
   depth, `foundation-bg` torque and depth, and the `PM-` marque.
5. **Halve `rc-rig`.** Drop bevels inside long arrays; 11.7 MB is not shippable.
6. **Merge the sub-100-triangle materials** across the fleet — about 20 draw
   calls, free, and `pd55` and `tunnel-jumbo` need the headroom.
7. **Move site props out of rig meshes** into a node the bounds calculation
   ignores.
8. **Find the missing 315 mm and 575 mm** on `crawler-th` and `dth-crawler`, or
   change the master widths and re-derive.

**Nothing in this list requires new research.** The research is done, and it is
good. What is missing is the last mile.
