# `underground-drive` — the site model, what it is, and what it is not

Module: `blender/sites/underground_drive.py`
Export: `public/models/sites/underground-drive.glb`
Renders: `shots/underground-drive-export.png`, `shots/underground-drive-export-detail.png`
Written 2026-09-06. Every measurement below was taken on this tree on that day.

```
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
  --python blender/sites/underground_drive.py

# ... append `-- --preview` to also write the two offline Blender renders
```

---

## 0. The one-paragraph version

This model does **not** build the drive. `src/world/terrain.js` `buildDrive()`
already builds it, per method, at four different sizes, with a rock shader, a
shotcrete boundary that tracks the player's own progress, a breathing vent duct,
services, a festoon, bolt plates, muck, mesh and water — and `research/16` §A.6's
verdict on that work is *"This archetype is the best thing in the game and should
be the model for the rest."* What a `.glb` can add that a swept shell and a shader
cannot is **the crew's material**: the ground-support consumables staged along
the rib, the power they run off, and the markers that stop a machine reversing
into them. That is what this is: a **laydown in the near field, between the
machine and the player**, four materials, four draw calls, 6,160 triangles.

---

## 1. What was measured before anything was authored

### 1.1 The four rooms — one archetype id, 2.5× on a side

`underground-drive` is the only archetype the four underground methods declare
(`src/game/data.js` `UNDERGROUND_METHODS`). `src/core/env.js` `UNDERGROUND` gives
each of them a different room:

| method | width × height | wallH | faceZ | backZ |
|---|---|---|---|---|
| `tunnel-jumbo` | 12.6 × 8.4 | 4.0 | −7.0 | 62 |
| `raise-boring` | 12.0 × 6.8 | 3.4 | −9.0 | 34 |
| `rockbolt` | 5.6 × 5.4 | 2.8 | −13.0 | 50 |
| `longhole` | 5.0 × 5.0 | 2.6 | −30.0 | 48 |

**A rib at x = −2.5 in a production drive is at x = −6.3 in a jumbo heading.** So
nothing in this model may hang on, lean against or be dimensioned from a rib: it
would be buried in rock in two of the four and floating in mid-air in the other
two. Everything stands **free on the invert, inside the smallest profile**, and
the build refuses to export if any vertex leaves that envelope. The module parses
these figures out of `env.js` at build time rather than copying them.

### 1.2 The machine-fit check — and it found a live defect

`rigFactory.js` only **translates** the rig to `terrain.collarPosition`;
`terrain.js` yaws the tube (`DRIVE_YAW = 0.73787 rad = 42.28°`) and not the
machine. So every machine stands **diagonally across its own drive**.

Measured by transforming **every vertex** of the shipped exports through its
node's world matrix and rotating into drive-local — `tools/glbinfo.mjs`'s own
parser and vertex walk, with one rotation added and nothing else (ASTRA §5: one
ruler). Validated twice before any number was used: at yaw 0 it reproduces
`glbinfo`'s printed `DIMENSIONS` for all four files to the millimetre, and at
yaw = `DRIVE_YAW` it reproduces the drive-local figures `src/core/env.js`
publishes for the raise borer (`lx −5.554..5.524`, `lz −5.681..5.691`) exactly.

| machine | drive-local x | drive-local y | drive-local z | drive half-width | fits? |
|---|---|---|---|---|---|
| `tunnel-jumbo` | −5.875 .. +5.360 | 0 .. 1.775 | −5.789 .. +6.316 | 6.30 | yes |
| `raise-boring` | −5.554 .. +5.524 | −0.350 .. 5.100 | −5.681 .. +5.691 | 6.00 | yes |
| `bolter` | −3.186 .. +5.852 | 0 .. 4.688 | −5.136 .. +3.143 | **2.80** | **no** |
| `longhole-rig` | −2.981 .. +3.385 | 0 .. 3.940 | −3.345 .. +3.661 | **2.50** | **no** |

> **FINDING (not this agent's to fix).** The bolter overhangs the rib of its own
> 5.6 m drive by **3.05 m** on one side and 0.39 m on the other; the longhole rig
> overhangs its 5.0 m drive by **0.89 m** and 0.48 m. Per-metre slices confirm it
> is real geometry and not an AABB artefact — e.g. the bolter occupies
> x +4.32..+5.85 at z −5..−4, and the longhole rig x −2.98..+0.27 at z +1..+2.
> `env.js`'s own NEEDS note anticipates this ("comes back the day a rig is yawed
> with its drive"). **The fix is to yaw the rig with the drive, not to widen the
> drives** — widening a 5.0 m production drive to fit a machine standing across
> it would contradict `research/03` §C and `[ARANZAZU]` both.
>
> These are REST-POSE exports. In game the booms articulate, which takes the
> machine further **up** and further **toward the face** — away from this model.

**Where that leaves room.** Within the |x| ≤ 2.4 strip this model can occupy, the
four machines reach z = +4.0, +4.0, +4.0 and +6.0. So **z ≥ +6.60 is clear of all
four**, and it stays clear back to the player at drive-local z = +13.75. This
model lives in that ~7 m of drive. It is also where a crew really stages material
— you do not leave a pack of mesh at the face, it gets blasted.

### 1.3 The hero frame

The composition is solved against the frame coefficients
`blender/sites/quarry_bench.py` **measured** on the live hero camera on
2026-09-05 by projecting probe points through `ctx.camera` and bisecting for the
NDC edges:

```
half_width(d) = 0.4023 · d      top(d) = 2.25 + 0.2065 · d      bottom(d) = 2.25 − 0.1638 · d
```

**I did not re-measure them underground.** The shared headed-Chrome/GPU lease is
held elsewhere. The vertical pair is independently reproducible from the stated
fov and eye height to within 1 % (2.25 + 0.2088 d / 2.25 − 0.1613 d) — a
cross-check, not a measurement; the horizontal 0.4023 is **not** reproducible
from fov and aspect (they give 0.3190) and rests on `quarry_bench`'s authority
alone. **If the underground frame differs, this model is mis-composed.** That is
the first thing to re-measure with a lease.

Two consequences decided the layout:

- **The strip is a wedge.** Staying left of the collar column costs
  `x ≤ EYE_X + KEEP_NDC_X · 0.4023 · d`, which with the rib clearance leaves
  0.55 m of usable width at the far end and 0.99 m at the near one.
- **The frame closes downward as things come nearer.** `bottom(d)` is 1.10 m
  above the invert at the far end of this window and 2.09 m one metre in front of
  the eye, so **nothing under about 2.2 m tall reaches the hero frame anywhere in
  this window.** That is arithmetic, not a preference, and it is why the tall kit
  is spread through the depth and the low kit sits near, where it reads in
  `renderer.js`'s orbit and menu modes instead.

---

## 2. What was built, and what each thing is sourced from

Working outward from the machine along the drive (drive-local chainage):

| z | object | sourced from |
|---|---|---|
| 6.72–7.97 | mesh stillage A — a strapped pack of weldmesh stood on edge | sheet size from `data.js` `mesh-2400`; wire/aperture and handling from [VILLAESCUSA13], [HOEK-PRE15] |
| 8.14 | delineator, retroreflective bands | [HIVIS], [FSP], [NIOSH-ESC] |
| 8.42–9.62 | bolt basket — 39 mm × 2.4 m split-tube friction bolts, dished 150 mm plates, a scaling bar | `data.js` `friction-bolt-39` / `bolt-plate-150`, both matching [HOEK-SUEHR] Table 12.1; scaling as a work item from [NFF26] |
| 9.86 | delineator | as above |
| 10.12–11.37 | mesh stillage B | as A |
| 11.62 | blank marker panel on legs | `DOMAIN.md` §10 — see §4 |
| 11.85–12.50 | scrap bin with cropped bolt ends | NOT SOURCED (see §3) |
| 12.72–13.57 | portable distribution board on a skid, two trailing cables | services list from [VERTEX]; all hardware NOT SOURCED |
| 13.80 | delineator | as above |
| 14.30 | pallet with a roll of spare lay-flat duct and a coil of Ø8 mm hanging rope | [WP-VENT], [MINETEK], [PMC-DUCT]; rope diameter is [PMC-DUCT]'s |

### 2.1 The consumables are the items the player buys

This is the part worth defending hardest. `data.js` is **the content authority**
(ASTRA §11), so the sizes are parsed out of the items themselves rather than
re-derived — a mesh sheet in the drive that is not the sheet on the shop card is
exactly the drift ASTRA §5 is about, and it is the kind a driller notices.

| item in `data.js` | what the module reads | independent source |
|---|---|---|
| `friction-bolt-39` — *"Split-Tube Friction Bolt, 39 mm × 2.4 m"*, `bitTrialRangeMm: [35, 38.1]` | 39 mm, 2.4 m | **[HOEK-SUEHR] Table 12.1, exactly**: 39 mm tube, recommended nominal bit **35–38 mm**, tube lengths 0.9–3.0 m, plates 150×150 / 125×125 mm |
| `bolt-plate-150` — *"Dished Bolt Plate, 150 mm"* | 150 mm, dished | same table's 150×150 plate for the 39 mm tube |
| `mesh-2400` — *"Weldmesh Sheet, 2.4 × 1.2 m"* | 2.4 × 1.2 m | see the discrepancy below |

**The bolt/hole rule is drawn correctly and it is the one a driller checks.**
[HOEK-SUEHR], on the friction bolt: *"It is installed by pushing it into a
slightly undersized hole and the radial spring force generated, by the
compression of the C shaped tube, provides the frictional anchorage along the
entire length of the hole."* So the bolts here are **slotted tubes with the slot
showing and nothing threaded on them** — printing a rod thread on a friction bolt
is the specific error `DOMAIN.md` §4 names. The game already had this right; the
model matches the game rather than re-deriving it.

> **CROSS-FILE FINDING for whoever owns `src/game/data.js`.**
> [VILLAESCUSA13] measures the population of underground support mesh:
> *"The most common configuration consists of 5.6 mm diameter wires spaced at
> 100 mm centres"* and *"Sheets are generally **2.4 m wide**, the maximum that may
> be specified, with variable **lengths, commonly 3.6 m and up to 6 m**. Larger
> sheets generally cause handling and placement problems."*
> `mesh-2400` is **2.4 × 1.2 m**. Both are real objects — 2.4 × 1.2 m is the
> hand-portable size, and [HOEK-PRE15] notes weldmesh is chosen partly because it
> is *"light enough for one person to handle"* — but the **common** sheet is
> 2.4 × 3.6 m and the game sells the small one. That is a content question, not a
> Blender one. **The geometry follows `data.js`.**
> A second one from [HOEK-SUEHR]: `DOMAIN.md` §4's *"46 mm bolt in a 45–48 mm
> hole"* has the top of the range inverted — the published bit range for the
> 46 mm tube is **41–45 mm**. The principle (hole smaller than bolt) is right;
> the upper number is not. `friction-bolt-46`'s own `bitTrialRangeMm: [41, 45]`
> is already correct, so this is a `DOMAIN.md` prose fix.

### 2.2 The mesh is not drawn as mesh, and that is a measurement

A 5.6 mm wire at the 5–7 m this pack stands from the eye is **sub-pixel**: the
frame is ~4.6 m wide across a ~744 px band at that range, i.e. 6.2 mm per pixel.
`quarry_bench.py` recorded the same finding twice (a 90 mm belt skirting at 56 m,
a 90 mm walkway plate at 62 m) — detail below the resolution of the shot does not
read as detail, it reads as noise, and it costs triangles to make the noise. A
strapped pack of sheets is a solid slab anyway; it is drawn as one, with the top
five sheet edges separated where they genuinely are a centimetre apart.

---

## 3. Sources, and what could not be sourced

### Cited

| key | source |
|---|---|
| [HOEK-SUEHR] | Hoek, Kaiser & Bawden, *Support of Underground Excavations in Hard Rock* — https://mirarco.org/wp-content/uploads/Books/Support_of_Underground_Excavations_in_Hard_Rock.pdf — Table 12.1 friction-bolt tube/bit/length/plate table; Lang's rule; Barton's L = 2 + 0.15 B / ESR |
| [HOEK-SUPPORT] | Hoek, *Support in Underground Hard Rock Mines* — https://www.rocscience.com/assets/resources/learning/hoek/1987-Support-in-Underground-Hard-Rock-Mines.pdf — split sets in rockburst ground *"will slip under shock loading but will retain some load and keep mesh in place"* (via `research/16` §A.6) |
| [HOEK-PRE15] | Hoek, *Practical Rock Engineering* ch. 15, Shotcrete Support — https://static.rocscience.cloud/assets/resources/learning/hoek/Practical-Rock-Engineering-Chapter-15-Shotcrete-Support-Remediated.pdf — weldmesh not chainlink where shotcrete is involved; 4 mm wire on 100 × 100 mm, one-person handling |
| [VILLAESCUSA13] | Villaescusa, Thompson & Player, Ground Support 2013, ACG — https://papers.acg.uwa.edu.au/p/1304_11_Villaescusa/ — 5.6 mm wire at 100 mm centres; sheets 2.4 m wide, commonly 3.6 m long, up to 6 m |
| [ARANZAZU] | Aura Minerals / SLR, *NI 43-101 Technical Report, Aranzazu Mine*, 2025 — https://minedocs.com/28/Aranzazu-TR-03282025.pdf — *"Haulage galleries are designed at 4.5 m high by 4.5 m wide to accommodate the installation of mine services and to provide effective clearance for mobile equipment"*; Table 16-4 support by ground class — bolt length constant at 2.4 m, pattern 1.8 → 1.5 → 1.2 → 1.0 m, shotcrete 50 → 75–100 mm |
| [ISLANDGOLD] | Alamos Gold, *Island Gold Mine NI 43-101 TR*, 2020 — https://s24.q4cdn.com/779615370/files/doc_downloads/island_reports/08/IG-Phase-III-Technical-Report-Final.pdf — Table 16-1 standard excavations (jumbo sill 4.0 × 4.0, jumbo ramp 4.75 × 4.75 arched, level entrance 5.5 × 5.5, muck bays 5.0 W × 4.5–6.5 H × 13.5 L); 8 in air line down the ramp stepping to 6 in on levels; 16-channel leaky feeder |
| [NFF26] | Norwegian Tunnelling Society Publication 26 — https://tunnel.no/wp-content/uploads/sites/3/2020/04/Publication-26.pdf — shotcrete 80–150 mm; bolts c/c 2.5 × 2.5 → 1.3 × 1.3 m; **manual scaling 1 h/h**; look-out 63.12 → 85.03 m² (via `research/16` §A.6) |
| [HURTADO17] | San Martín / Hurtado et al., Underground Mining Technology 2017, ACG — https://papers.acg.uwa.edu.au/p/1710_14_Hurtado/ — *"Duo duct with 1 m diameter and drift cross-section of 4.5 × 4.5 m"*; *"minimum safety distance of 0.5 m between equipment and pipeline"* |
| [VERTEX] | https://www.abnnewswire.net/press/en/132593/Vertex-Minerals-Limited-(ASX-VTX)-Reward-Gold-Mine-Project-Update.html — the services a drive carries: 11 kV power cable, water line, air line (via `research/16` §A.6) |
| [WP-VENT] [MINETEK] [PMC-DUCT] | https://en.wikipedia.org/wiki/Mine_ventilation · https://minetek.com/en-us/resource-hub/news/underground-mine-ventilation-performance-guide/ · https://pmc.ncbi.nlm.nih.gov/articles/PMC12504577/ — forcing vs exhausting; disposable fabric ducting; duct on **Ø8 mm steel wire ropes**, hooks on M12 anchors at 5 m centres (via `research/16` §A.6) |
| [DUCT-COLOUR] | https://www.ducting.com/mine-ventilation/ · https://www.plascorp.com.au/products/underground-mine-ventilation/ — lay-flat duct is made in orange, yellow, white, black, blue and silver, and at least one maker codes the colour to **diameter**, not duty |
| [HIVIS] [FSP] [NIOSH-ESC] | https://hivis.com/products/underground-general-signage · https://www.fspglobalproducts.com/mining/deliniation-signage/ · https://stacks.cdc.gov/view/cdc/215359/cdc_215359_DS1.pdf — underground signage on retroreflective sheeting; colour-coded reflective delineation; coloured retroreflective markers distinguishing primary from secondary escapeways |
| [30CFR57] [30CFR75] | https://www.ecfr.gov/current/title-30/part-57 · https://www.ecfr.gov/current/title-30/part-75 — §57.17001 illumination is **surface only** and carries no number; §57.17010 *"Individual electric lamps shall be carried for illumination by all persons underground"*; §75.1719-1 (coal) 0.06 footlamberts, *"in addition to that provided by personal cap lamps"*, lighting the face and the ribs/roof/floor/equipment |
| [LUX-LADDER] | https://www.nordland-lighting.com/html.lighting-technical/lux-levels-mining-applications.html — drives ~20 lux, loading points ~50, work areas ~100. **A secondary compilation attributing the figures to the ILO and the South African DMR, not a standard**, and used only as an order of magnitude |
| [CAVE-PHOTO] | https://startcaving.com/caving-guides/cave-photography — *"a photo of some rocks at your feet can look similar to a room"*; always include a person or a known-size object |
| [YANG-GDC18] | Robert Yang, GDC 2018, *How to Light a Level* — https://www.blog.radiator.debacle.us/2018/03/gdc-2018-how-to-light-level-slides-and.html — where a key would be lost, use rim and background light so the silhouette carries the read |
| [OSEMAN-SMOKE] | Neil Oseman, *The Science of Smoke* — https://neiloseman.com/the-science-of-smoke/ — haze *"lifts the shadows by scattering light into them"*; *"smoke shows up best when it's backlit"* |
| [MBV81] | https://cinemascholars.com/my-bloody-valentine-1981-the-making-of-a-slasher-classic/ — a working colliery cleaned up for a film crew *"looked like Disneyland"* and had to be re-dirtied |

### NOT SOURCED — and each is marked again at the point of use in the module

1. **The back arch radius as a ratio of drive width.** Neither research pass could
   find a published figure. The module does not need one — it reproduces
   `terrain.js`'s own profile for the containment test — but anyone authoring an
   arch from scratch should know it is not available. What *is* sourced: the
   profile is *"variably arched"* [POTVIN15 via research], arching is a
   deliberate stress choice [HOEK-PRE], and [HURTADO17] gives an area/perimeter
   pair (18.85 m² / 15.57 m for a stated 4.5 × 4.5 m drift) that any arch model
   can be validated against.
2. **The thickness of a delivered mesh pack** (0.40 m here), and that mesh is
   stored **on edge**. The stillage, its skids and its posts.
3. **The bolt basket** — its size, the lean of the bolts, and that eleven are
   left in it. The **scaling bar's length** (2.10 m).
4. **The scrap bin** entirely, and what is in it.
5. **The distribution board and its skid** entirely. [VERTEX] gives an 11 kV
   cable and no hardware; **no switchgear rating is invented or lettered
   anywhere.**
6. **The duct roll's diameter, its pallet, and how much duct is on it.** And
   deliberately not asserted: **the duct's colour** — [DUCT-COLOUR] shows it is
   made in at least six and that one maker codes it to diameter, so *"vent duct
   is yellow"* is not a fact. The roll carries a material **name** only, as
   everything in this pipeline does.
7. **Delineator height, spacing, and the marker panel's size.** The
   retroreflective banding itself is sourced; **the colour KEY is not** — the
   delineation vendor confirms the colours are coded and does not publish what
   they mean — so nothing here asserts a meaning by colour and there is one
   banding material.
8. **Any clearance a laydown is required to keep from a traffic lane.**
   [HURTADO17]'s 0.5 m equipment-to-pipeline figure is the nearest published
   number and it is about a hung vent duct; it is recorded in the module and
   explicitly **not** quoted as a rule for stacked material.
9. **Which side of a drive services hang on.** Genuinely unsourced by both
   research passes. This model takes the LEFT rib because `terrain.js` already
   puts the services, the ditch and the festoon on the RIGHT — you stack material
   on the wall that has nothing on it — which is an argument from the game's own
   layout, not from a source.
10. **Bolt-plate colour coding by bolt type.** Searched for specifically; nothing
    found. If it exists it appears to be mine-specific. Not depicted.

---

## 4. Naming and factual accuracy

`DOMAIN.md` §10. No object, material or exported string carries a manufacturer, a
model designation or a real mine's name. The `[HOEK-SUEHR]` table's product names
are used as **dimension classes only** ("39 mm friction bolt") and none reaches
the file.

**The marker panel carries no lettering, and that is a rule rather than an
omission.** `DOMAIN.md` §10 records four separate places where invented text
reached the player; the fix applied to `terrain.js`'s own site board is the
precedent — it *"now draws NOTHING. A blank sign is honest; a fabricated one is
not."* A heading identifier, a chainage or a level name would be a fact this file
cannot source, and a player could not read it at 4 m anyway.

---

## 5. Cost — measured

`node tools/glbinfo.mjs public/models/sites/underground-drive.glb`:

```
glTF v2  382.4 kB  extensions: none
PRIMITIVES 4  (= draw-call floor)   TRIANGLES 6160   nodes 5   images 0
materials: paintedDark, rawSteel, rubber, safetyStripe
mount:site-collar (scene root)
DIMENSIONS (m)  W 0.944 x H 2.640 x L 8.058
BOUNDS     x -2.144..-1.200   y 0.000..2.640   z 6.750..14.808
```

Those bounds are read directly off the export and they are the drive-local strip
the module authored: inside the 5.0 m drive's rib clearance, 0.15 m clear of the
nearest machine at z = 6.75, and 2.64 m tall against a 5.0 m back.

Build-time gate output, over **3,344 real vertices** (depsgraph-evaluated, so the
hose curves are measured as the tubes they export as):

```
UG_GATES vertices=3344 in_frame=404 profile_slack=0.006 z_clearance=0.150
         collar_min=6.957 max_ndc_x=-0.171 tallest=2.640
```

### Four materials, not six, and why

`blender/lib/site.py` allows six; this passes `budget=4` so it cannot quietly
grow. `env.js`'s own transmission measurement records the **underground** surface
totals after that fix — `rockbolt` 86, `tunnel-jumbo` 89, `longhole` 74, against
a ceiling of **80**. Two of three are already over with no `.glb` on the site at
all.

> **THIS IS A NET ADDITION AND THERE IS NO CHANGE PURSE.** `quarry-bench` pays
> for its six materials by dropping three instanced scatter meshes and a pad
> decal it no longer needs. This model **replaces nothing** — it adds objects the
> procedural drive does not have. So the honest accounting is
> **+4 draw calls underground**, taking the three measured states to roughly 90,
> 93 and 78. That is a real cost and the integration owner should decide whether
> it is worth paying before wiring it up. Two ways to pay for it exist and both
> belong to `terrain.js`, not here: the drive currently draws its `drive-ditch`
> water plane and its `drive-drips` Points as separate calls, and the festoon
> bulbs are a third; and `arch.replaces` already has the machinery to let a site
> model retire procedural geometry.

---

## 6. How the enclosed-space visibility problem was solved

The brief: *you are enclosed, and the game still has to be readable.* Here is the
reasoning, not a guess.

**The premise is wrong in an instructive way — underground is not high contrast.**
The published illuminance ladder is haulage drives ~20 lux, loading points ~50,
work areas ~100 [LUX-LADDER] — about **2.3 stops** end to end. And there is no
numeric requirement at all for a metal-mine face: 30 CFR Part 57 Subpart P is two
sections, one of which is **surface only** and the other of which says
*"Individual electric lamps shall be carried for illumination by all persons
underground"* [30CFR57]. So the sourced light model underground is *a lamp on
every head plus work lights on the machine* — precisely the rig `env.js` already
builds — and a black tube with one blazing object in it is not what underground
looks like.

**So the answer was not to add light.** `env.js` solves every underground light
per variant against `work` and `ROCK_ALBEDO = 0.095` through `cd()`, on an
explicit ladder (the work at linear 0.62, near walls 0.11, beyond 30 m under
0.006). Two failures are already recorded against that ladder — a shotcrete
lining that rendered at sRGB ~150 while the work sat at 56, and a vent bag whose
top edge clipped white — and both were **a surface between the eye and the subject
that was brighter than the subject**. Adding a bright near object would be the
third.

The model's answer is four rules, each **enforced by a gate that reports what it
measured** (ASTRA §10: a gate over an empty set passes forever):

1. **Nothing is emissive and nothing is pale.** Four materials, all mid or dark:
   `rawSteel`, `paintedDark`, `rubber`, `safetyStripe`. No `concrete`, no
   `galvanised`, no white.
2. **Nothing stands in front of the work.** Every vertex is projected through the
   measured hero frame and refused if it lands inside the NDC column the collar
   occupies. Measured on the shipped model: `max_ndc_x = −0.171` against a limit
   of −0.16, i.e. the whole model sits left of the work with room to spare. The
   hero render carries a **machine proxy** — a featureless block at the longhole
   rig's measured drive-local envelope — so the claim is checkable by eye rather
   than only by assertion.
3. **It is a silhouette layer, not a lit one.** Every light in the drive is ahead
   of this geometry, on the machine, so these objects are **back-lit**: dark
   shapes with a rim, read against the lit work beyond. [YANG-GDC18] states the
   principle for exactly this case — where a key would be lost, use rim and
   background light so the silhouette carries the read. It costs no light, no
   material and no draw call.
4. **It uses light that is already there.** `env.js` hangs a festoon bulb over
   this stretch of every one of the four drives (`ugFest*`, on the opposite rib
   4–5 m across), so the laydown gets a genuine warm top-side key from a
   practical that is in shot; and `dust.base` 0.048–0.052 already puts scattering
   medium between these objects and the work, which is what *"lifts the shadows
   by scattering light into them"* [OSEMAN-SMOKE] without an unmotivated fill.

**And the strongest argument for the model existing at all in a dark room:**
an enclosed rock space has **no readable scale** without a known-size object in
it — *"a photo of some rocks at your feet can look similar to a room"*
[CAVE-PHOTO]. The game has no people underground. A pack of 2.4 × 1.2 m mesh
sheets, a basket of 2.4 m bolts and a 1.05 m delineator are objects a driller
knows the size of by heart, and putting them in the near field is what tells the
eye how big the drive is.

---

## 7. What makes this unmistakably underground and not a portal

Another agent is building `tunnel-portal` — outside, daylight, looking in. The
separation here is by **content**, because a `.glb` carries no light:

- **Nothing in this file has ever seen weather.** No sun-facing surface, no
  drainage to daylight, no vegetation, no netting, no cut slope, no wing wall, no
  headwall, no stockpile, no conveyor, no road furniture, no horizon line.
- **Everything is at drive scale.** A portal stages material outside on a laydown
  the size of a car park; a drive stages it *in* the drive, in single stillages a
  machine can lift, because there is nowhere else.
- **Retroreflective delineation.** A retroreflector only earns its place where the
  only light is on a machine or a helmet [HIVIS], [FSP], [NIOSH-ESC]. On a portal
  apron in daylight it is pointless.
- **The consumables are ground support** — mesh, friction bolts, dished plates.
  That is the work that exists because rock is over your head.
- **It is dirty and it is being worked out of** — a scrap bin with cropped bolt
  ends, not a tidy stack. [MBV81] is the cleanest statement of why a clean site
  reads as a set.
- **Nothing is taller than the smallest back.** 2.64 m in a 5.0 m drive with a
  2.6 m springing line.
- **And the composition itself**: a strip of kit running away up ONE side of a
  corridor, converging, with the far end going to black. A portal composition is
  an arch in a rock face with sky above it and a road leading to it. There is no
  arch in this model and no sky anywhere near it.

One thing that was **considered and rejected**: a **refuge chamber**, which is
the single most recognisable "you are underground" object there is, and which the
regulator literature treats as standard fitting (sited off the drive, with
comms, atmospheric monitoring and a compressed-air supply — NSW Resources
Regulator, *Emergency planning — self-escape and refuge — Underground mines*,
https://www.resources.nsw.gov.au/sites/default/files/2023-01/compliance-priority-report-emergency-planning-self-escape-refuge-ug-mines.pdf).
It does not fit: a 5–6 m × 2.4 m box in this window covers NDC −0.54 to +0.45 of
the frame at z = +8, i.e. it hides the lower half of the machine. It needs a
cuddy cut off the rib, and a rib is exactly what this model cannot have (§1.1).
**If per-method site models ever exist, the refuge chamber is the first thing to
add to them.**

---

## 8. The renders

Both are under `shots/` and both are **offline Blender renders of the exported
`.glb`, Cycles CPU, with inspection fixtures — never gameplay captures.** They
re-import the real file rather than photographing the scene that made it, because
a render of the authoring scene proves nothing about the export.

- `underground-drive-export.png` — **the player's own eye, in the player's own
  frame**, rebuilt from the measured coefficients (43.9° horizontal field, 2.173
  aspect) rather than from `renderer.js`'s declared `fov: 34`, which is not what
  the live camera runs at. The yellow block is the **machine proxy** described
  above. What it shows: three dark verticals at three depths running away up the
  left edge, converging, with the work completely unoccluded.
- `underground-drive-export-detail.png` — a three-quarter of the laydown with the
  shell removed, so the objects can be identified.

**The materials in both are inspection greys, not the game's.** `assets.js`
generates all four names procedurally at runtime with wear driven by gameplay
state, and none of that runs in Blender. Do not read colour off these images.
The lamps are exposed to make the render legible; they are **not** solved the way
`env.js` solves the game's rig, and no brightness in either image means anything
about the game.

Three things were changed *because of* what a render showed, which is the point
of having them:

1. The first hero render came back as **a picket fence** — the stillage's top
   rails and posts dominated the pack. The rail went, the posts shortened, and
   the pack got the width. A fence is a surface object and it is the worst thing
   this model could look like.
2. The first layout clustered both stillages at the far end; the render showed
   one small cluster and then nothing. They were spread through the depth with
   the bolt basket between them.
3. The scrap bin's offcuts came through its own side walls. Length and spread are
   now bounded by the bin.

A fourth was caught by a gate rather than a render: the module was originally
written with Blender's +Y as the chainage, which put the entire laydown on the
**face side** of the machine. The profile gate reported it as a 9.137 m
excursion. There is now exactly one coordinate conversion in the file.

---

## 9. Outstanding — what the integration agent needs to know

1. **`terrain.js`'s `ARCHETYPES` table has no `model:` key for this archetype.**
   Line 578 reads `'underground-drive': { plane: 'underground' },`, so
   `attachSiteModel()` returns at `if (!id) return;` and this file is never
   fetched. **Adding `model: 'underground-drive'` is the one line that turns this
   on** — and it should not be added until (2) is decided.
2. **It costs 4 draw calls and nothing gives them back** (§5). Two of the three
   measured underground states are already over the surface band's ceiling of 80.
   Decide whether to pay, and if so where from.
3. **The export is DRIVE-LOCAL and carries no rotation.** `siteParent()` hangs it
   on `driveGroup`, which already yaws it. Do not add a yaw at either end. This
   file originally exported pre-yawed, because when it was written `rebuild()`'s
   underground branch returned before `attachSiteModel()` and `siteModelReady()`
   began with `!ugSpec`; the integration agent's rewrite landed mid-build and the
   module was changed to match the live file. Re-reading rather than trusting the
   earlier note is what caught it.
4. **One archetype, four rooms.** This model is composed for the 5.0–5.6 m
   development/production drive (`longhole`, `rockbolt`). In the 12.6 m jumbo
   heading and the 12.0 m raise-bore chamber it is inside the profile and clear
   of the machine — it is never *wrong* — but it stands out in the open rather
   than against a rib, which in a heading that size is a normal place for kit and
   in a chamber is a little arbitrary. **The refuge chamber, a cuddy, a cross-cut
   and any wall-hung furniture all need per-method models**, and the archetype id
   is currently the filename (ASTRA §4.4 contract 4), so that needs a decision
   about naming before anyone builds one.
5. **`env.js` makes a cap-lamp light with nothing making it.** `ugCap` is a
   panning spot at drive-local `[W·0.55, 1.72, 8.5]` commented *"a cap lamp on a
   crew member"*. There is no crew member anywhere in the game underground. That
   is the same class of defect as the two lamp housings `env.js` records having
   floated unsupported in the middle of the drive, seen from the other end — a
   beam with no source. Its position is section-dependent (`W·0.55` is 1.375 m in
   a longhole drive and 3.465 m in a jumbo heading) so this model cannot supply
   it. Flagging it, not fixing it.
6. **Support does not reach the floor in a real drive**, and `terrain.js`'s bolt
   plates currently run the full height of the ribs. Published practice puts the
   lower limit of reinforcement and surface support at *"gradeline (3.5 m from
   the floor)"* or *"close to the floor (say approximately 1 m)"* (Potvin &
   Hadjigeorgiou, *Underground Design Methods 2015*, ACG,
   https://papers.acg.uwa.edu.au/p/1511_25_Potvin/), and one deep mine's enhanced
   standard is described as extending support *"to within 0.6 m (rather than
   1.5 m) of the floor"* (Yao et al., ACG,
   https://papers.acg.uwa.edu.au/p/2465_10_Yao/) — i.e. its ordinary standard
   stopped **1.5 m up**. A plate pattern that runs to the invert is a small,
   cheap, sourced correction in `terrain.js`.
7. **`env.js`'s vent duct is the published size**, which is worth recording as a
   confirmation rather than a defect: [HURTADO17] gives a 1 m duct in a 4.5 × 4.5
   and a 5.5 × 5.5 m drift, and `env.js` hangs `vent.r = 0.50` in its 5.0 m drive.
8. **The frame coefficients have not been re-measured underground** (§1.3). If
   they differ, the composition and the NDC gate are both grading against the
   wrong numbers. This is the highest-value thing to check with a GPU lease.
