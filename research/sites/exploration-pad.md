# `exploration-pad` — a greenfield core-drilling pad, built in Blender

Source scope, measurements and open items for
[`blender/sites/exploration_pad.py`](../../blender/sites/exploration_pad.py) →
`public/models/sites/exploration-pad.glb`.

**This is a fictional place assembled from sourced parts.** It is not a
reconstruction of any real site, it is not a pad design, and no manufacturer
name, marque or model designation is exported (ASTRA §1.2, `DOMAIN.md` §10).

```bash
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
  --python blender/sites/exploration_pad.py

# same, plus two offline Cycles renders of the RE-IMPORTED export:
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
  --python blender/sites/exploration_pad.py -- --preview

node tools/glbinfo.mjs --parts public/models/sites/exploration-pad.glb
```

---

## 1. What was measured

`node tools/glbinfo.mjs --parts public/models/sites/exploration-pad.glb`, the
only ruler in this repo (ASTRA §5):

| | |
|---|---|
| materials / draw calls | **5** — `coreTray`, `dirt`, `hose`, `rockFace`, `timber` |
| budget in `blender/lib/site.py` | 6 (`MAX_MATERIALS`); this file passes `budget=5` |
| primitives | **5** — one joined static per material |
| triangles | **20 748** |
| file | **1 901 404 bytes** (1.81 MB) |
| named nodes | 1 — `mount:site-collar` at the origin |
| dimensions | **12.614 × 1.780 × 14.999 m** (glTF y-up: W × H × L) |
| bounds | x −13.965…−1.351 · y −0.180…1.600 · z −14.472…0.527 |
| authored objects checked before the join | **377 meshes, 11 140 vertices**, each against seven keep-outs and for a colour attribute |
| furthest vertex from the collar | **15.30 m**, against the 15.50 m the build asserts |

Everything sits in the three.js −x / −z quadrant — **behind and to the left of
the machine, never in front of it** — and the tallest thing in the file is a
1.60 m sump picket. The machine is 12.267 m. **Nothing in this site can occlude
the subject of the shot.**

The `-0.180 m` in y is deliberate: footings, pickets, pegs and dunnage are set
into the ground so the model degrades to slightly-sunk furniture rather than
floating furniture if §8.1 does not land.

---

## 2. Sources

Keys used in the module. Everything marked here is quoted in the module beside
the constant it produced.

### 2.1 The pad

| key | source |
|---|---|
| `[ONTARIO-BMP]` | Ontario, *Best management practices for mineral exploration* — <https://www.ontario.ca/page/best-management-practices-mineral-exploration-and-development-activities-and-woodland-caribou> · **ground-supported drill pads 20–40 m diameter, helicopter-supported 40–50 m; line cutting ≤ 1.5 m needs only a plan** |
| `[ON-STANDARDS]` | Ontario, *Provincial Standards for Early Exploration* (eff. 2018-04-10, under Mining Act O. Reg. 308/12) — <https://www.geologyontario.mndm.gov.on.ca/mines/lands/mining-sequence/provincial_standards_for_early_exploration_en.pdf> · Part III §1.4 **"cross-piled in an orderly manner to a height not exceeding 1.5 metres and not less than 30 metres from any water body"**; §1.2 casings left in place **"must be marked with durable reflective markers which are clearly visible in all seasons"**; §1.3 drilling fluids/cuttings **not less than 30 m from any water body** |
| `[MB-BMP11]` | Manitoba BMP 11, *Land-based drilling* — <https://earlyexploration.miningmanitoba.org/best-management-practices-bmp/bmp-11-land-based-drilling/> · **max drill pad 900 m² (0.09 ha)**; **pump pads max 400 m², min 30 m from water**; **100 m pad-to-water**; **"drill sites should be prepared by clearing the trees and then cribbing the drill rig on timbers or lumber (no ground disturbance necessary)"**; **exposed casing cut to "15 cm or less above ground level"**; screened intake to the DFO end-of-pipe guideline |
| `[MB-BMP13]` | Manitoba BMP 13, *Core storage* — <https://earlyexploration.miningmanitoba.org/best-management-practices-bmp/bmp-13-core-storage/> · **cross-stacked; bottom layer "approximately 15-45 centimetres off the ground and supported by solid footings"; "at least one inch between individual boxes in a layer to enhance ventilation"; ≥ 100 m from water; aluminium-tape labelling** |
| `[MB-BMP16]` | Manitoba BMP 16, *Decommissioning* — <https://earlyexploration.miningmanitoba.org/best-management-practices-bmp/bmp-16-decommissioning/> · decommissioning within 30 days; slash pulled back over the pad |
| `[BC-BOND]` | BC MEMLCI, *Regional Mine Reclamation Bond Calculator Guidance* (Mar 2021) p.21, p.23–24 — <https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/mineral-exploration-mining/documents/reclamation-and-closure/regional-bond-calculator-supporting-files/bond_calculator_guidance_report_march_2021.pdf> · **"an average drill pad approximately 10 m x 10 m"**; **"average topsoil depth of 0.10 m"**; **"caching of timbers to one or two centralized locations — Small structure, estimate 2 loads per pad"**; drill pads on slopes > 30 % are "large due to the amount of timbers required" |
| `[BC-HANDBOOK]` | *Handbook for Mineral and Coal Exploration in British Columbia* (2008/09) §11.4.2, §11.4.4, §11.4.5 — <https://amebc.ca/wp-content/uploads/2017/04/MX-Handbook-2008-2009-edition.pdf> · **"a sump should be built on the downslope side of the pad"**; **"dug sumps"** listed separately from "impervious walled" ponds; **topsoil "saved separately, nearby in low mounds"** on the upslope side; **"the smallest practicable drill pad area consistent with safe working practices"**; pump **"in a drip tray and preferably covered with a rain cover"** |
| `[BC-NOW]` | BC *Notice of Work Application Companion* (Mar 2021) p.59, p.89–90, p.102–103 — <https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/mineral-exploration-mining/documents/exploration/now_companion_mar_2021_v5.pdf> · the pad inventory: **"vehicle parking, drill, power-pack, equipment storage, supply storage (additives, lubricants, fuel, core boxes, etc.), generator, mud-tank, rod-rack, and/or heli-pad"**; **"drills will be placed on timbers and plastic liners"**; **250 L of fuel in barrels**; sample application: 200 diamond-drill sites over 2.00 ha = **100 m²/site** |
| `[NT-BOXHOLE]` | NT *Box Hole Project Mining Management Plan*, MetalsGrove Mining (2024) §6 p.6 — <https://dme.nt.gov.au/media/docs/publications/enviromental-reports/mining-management-plans/2024/box-hole-project-mmp-metalsgrove-mining-ltd.pdf> · **17 pads at 25 m × 25 m ≈ 1.0625 ha**. ⚠ this project is RC, not diamond core |
| `[NT-AA7029]` | NT DPIR Advisory Note AA7-029, *Construction and Rehabilitation of Exploration Drill Sites* §3.1–3.2 — <https://nt.gov.au/__data/assets/pdf_file/0015/203334/aa7-029-construction-and-rehabilitation-of-exploration-drill-sites.pdf> · **"Sumps require the construction of a slope to allow for fauna egress"**; sumps backfilled with the excavated material and respread with stored topsoil |
| `[YUKON-BMP]` | *Yukon Mineral and Coal Exploration Best Management Practices and Regulatory Guide* (Aug 2010) §19.4, §19.7, Table 7.1 — <https://yukonminers.org/wp-content/uploads/2023/08/BMP_RG_Aug29_FINAL_WebFile.pdf> · geotextile is the **permafrost fallback**, not routine: *"if it is not possible to dig proper sumps use geotextile material and/or straw bales"*; clearings ≤ 200 m² (500 m² for helipads/camps); all sumps filled at programme end |
| `[STIBNITE]` | Midas Gold / Perpetua, *Stibnite Gold Project Plan of Restoration and Operations* Ch.13 p.131 — <https://perpetuaresources.com/wp-content/uploads/2017/05/2016-09-21-Stibnite-Gold-PRO-Chapter-13-Exploration.pdf> · **"Typical dimensions for a helicopter supported drill sump are approximately 12 feet long by 6 feet wide by 3 feet deep, while road supported drill sumps are generally 16 feet long by 8 feet wide by 8 feet deep"**; **"At least one side of the sump is constructed at a shallow grade to create a ramp for egress in the event wildlife enters the sump"** |
| `[WORKSAFEWA]` | WorkSafe WA, *Mineral exploration drilling — code of practice* §2.3 — <https://www.worksafe.wa.gov.au/system/files/documents/2025-02/MSH_COP_MineralExplorationDrilling.pdf> · **"Sumps have been constructed to contain all drilling fluids and are barricaded to prevent inadvertent access"** |
| `[CME-DMIRS]` | Chamber of Minerals and Energy submission, quoted in DMIRS *Response to Submissions – Draft Programme of Work guidance* p.19 — <https://www.wa.gov.au/media/64783/download> · **"the excavated sump, excavated sump push-up and all incidental or collateral next-to pad disturbance"**. ⚠ industry submission inside a government document — attribute to CME, not the regulator |
| `[BLY-PAD]` | Boart Longyear, *Five Tips for Drill Pad Planning* — <https://www.boartlongyear.com/insite/five-tips-for-drill-pad-planning/> · **"at least three meters (10 feet) of clearance around the drilling equipment"**; the sump checklist: *"Right size / Position near rig, hole and mud tank / Ramped / Guarded / Space between splitter and sump and return hose"* |
| `[AUSEARTHED]` | <https://ausearthed.blogspot.com/2021/07/exploration-drilling-and-rehabilitation.html> · ~100 m² pads; deep ripping to 50 cm; monitoring photos at completion, 3, 6 and 12 months. ⚠ education blog, the weakest source used |

### 2.2 The core, the trays and the blocks

| key | source |
|---|---|
| `[WP-EDD]` | <https://en.wikipedia.org/wiki/Exploration_diamond_drilling> · **BQ 36.5/60 · NQ 47.6/75.7 · HQ 63.5/96 · PQ 85/122.6 mm** core/hole; *"the most common wire line tube diameters and purposes are NQ (47.6mm) and HQ (63.5mm)"*. ⚠ the weakest citation in the module; used only for NQ, which four other sources' channel widths agree with |
| `[DISCOVERER-TRAY]` | Discoverer Series 2 — <https://fieldtech.tech/product/discoverer_core_sample_trays_for_nq_pq_hq/> · **N/N2 1065 × 385 × 67.5 mm, 5 rows, 5 m of core, 1.9 kg, beige**; H 1065 × 385 × 81 mm, 4 rows; one-piece moulded UV-stabilised PP, *"Drainage holes throughout"*, built-in handles both ends; **lid "White plastic, custom-made, 1065 × 375mm"** |
| `[GEOPRO-TRAY]` | <https://www.geoprosupplies.com/products/plastic-core-trays> · **NQ 1070 × 385 × 55 mm, 5 or 6 channels, 55 mm channel**; *"the highest UV-stabilised polypropylene available"* |
| `[IMPALA-3]` | <https://www.impalaplastics.com.au/products/impala-3-core-tray/> · **NQ2 67 × 390 × 1085 mm, 5 rows**; *"Trays lock tightly together, which also gives superior stacking stability"* |
| `[GVDRILL]` | <https://www.gvdrill.com/html_products/Core-tray-26.html> · the same 1070 × 385 series with weights; **Core Tray Lid 1070 × 385 × 10 mm, 1.2 kg** |
| `[WESTERNEX]` | Westernex Catalogue 2020 — <https://rapidsupply.com.au/wp-content/uploads/2020/04/westernex_core_tray_plastic.pdf> · colour is a PHOTOGRAPHY decision: **"Grey: Often preferred for photography, also reduces glare / White: Heightens contrast in photography / Black: Ideal for use with high-logger and CoreScan system"**, and *"IF YOU USE BLACK CORE TRAYS, IT IS QUITE LIKELY THEY ARE MADE WITH RECYCLED/REGRIND MATERIAL"* |
| `[DISCOVERER-RACK]` | <https://www.discovererglobal.com/learning_hub/how-to-achieve-a-world-class-core-shed-workflow-within-the-most-basic-of-facilities> · **a loaded tray weighs ≈ 45 kg** (size not stated; the context is a 1065 × 385 tray) |
| `[DISCOVERER-TRESTLE]` | <https://www.discovererglobal.com/products/core-logging-a-frame-trestle-900mm-high> · **standing "Height 90cm, Width 96cm, Depth 93cm"**, *"Weight rated to 450kg"*, supplied as *"2 x A-Frame Trestles and 2 x Lengths of Pipe"*, the pipe **"50NB 3250mm galvanised"** |
| `[PALSATECH]` | <https://palsatech.fi/products/pt80s-logging-table/> · logging tables, **"table lower edge 74-94 cm"** |
| `[USBR-102D9]` | US Bureau of Reclamation drawing **102-D-9, N-size core box**, Fig. 10-9 of the *Geology Field Manual* Vol. 1 Ch. 10 — <https://www.usbr.gov/tsc/techreferences/mands/geologyfieldmanual-vol1/chap10.pdf> · Note 3 **"Twelve spacer blocks … 1-inch nominal clear lumber, 2-1/4 inches square … Spacer blocks shall be painted white"**; Note 4 **"Core loss blocks … standard 2- by 2-inch wood or styrofoam stock. The length of these blocks shall be equivalent to the core loss interval … painted fluorescent orange or tangerine"** |
| `[USBR-GFM]` | same document, p.302, p.305 · **"At the drill site, core boxes should be lined up, preferably on boards or planks, in order from top to bottom, with labels and up side to left, in a safe area and kept covered with lids"**; the core *"should be placed in the core box from left to right, with the top to the left, bottom to the right … so the core reads like a book"*; all blocks nailed down |
| `[USBR-TM]` | USBR *Concrete and Rock Core Handling Guide* TM-8530-2021-03, pp.11, 19–20, 26 — <https://www.usbr.gov/tsc/techreferences/mands/mands-pdfs/ConcreteRockCoreHandlingGuide_TM-8530-2021-03_02-2021_508.pdf> · **"The number of sample channels is primarily determined by the total weight to be handled"**; **"Sample channels should be rigid, firmly attached along the entire length, and higher than the samples to help support the lid"**; **"If stored in the sun, cover with shelters to shade boxes and allow air flow. Directly covering boxes with a tarp is not acceptable"**; core displayed on *"sawhorses or tables"* |
| `[BLY-RODS]` | Boart Longyear *Coring Rods and Casing Catalog* (Sep 2020) and *LF90D Surface Coring Drill Technical Overview* (Sep 2013) — <https://d3qsvy4hh6w8p5.cloudfront.net/website/2026/02/CoringRodsCasingCatalog_Sep2020-2.pdf> · <https://d3qsvy4hh6w8p5.cloudfront.net/website/2026/01/LF90D_TechData_English_Sep2013webready.pdf> · **core rods 3.0 m (10 ft)**; **NQ midbody OD 69.9 mm, 7.8 kg/m, 23.4 kg per 3 m rod**; a bundle of 19 NQ rods is **3.2 × 0.4 × 0.3 m, 453 kg**; water content **NQ 2.9 L/m**. *Recorded, not modelled — see §8.2.* |

### 2.3 Already in the tree

`research/16-site-archetypes.md` §A.8 and `research/02-prospecting.md` §E4/§E6
were the starting point and their keys are still valid: `[CORING-MAG]` (the mud
pit is **4 000 L, emptied roughly every 150 m**), `[GOLDADV]` (*"shallow wooden
boxes about 150 cm by 30 cm with 3 to 6 compartments running lengthways"*),
`[GSI-DRILL]` (trays *"about 1 m long"*), `[PCT-SIZE]` (**NQ 5–6 m of core per
tray**), `[CORING-COLD]` (the cold-weather drill shack), `[DISC-CORE]`,
`[CORING-PALSA]`, `[PNR]`, `[MULTIPOWER]`, `[OREZONE]`, `[GOLIATH]`.

`research/02` §E4 is also the identity test this model is built to pass:
> *"The core rig has a thin wireline running over a sheave at the mast crown, a
> water tank and sump, and core trays stacked on trestles. The core rig site is
> wet; the RC site is dusty."*

Three of those four are in this export. The fourth (the wireline sheave) is on
the machine — `core-rig.glb` has `pivot:sheave-wire` with a 4.76 mm rope.

---

## 3. Two places the sources disagree, and which one the module took

**Tray depth.** `[GEOPRO-TRAY]` says an NQ tray is 55 mm deep;
`[DISCOVERER-TRAY]` says 67.5 and `[IMPALA-3]` says 67. The module takes
**67.5**, because 55 mm leaves 7 mm of freeboard over a 47.6 mm core and
`[USBR-TM]` requires the dividers to stand higher than the sample so that a lid
bears on them rather than on the core. Both numbers are real products; the
disagreement is between tray families, not an error in either source.

**Sump volume.** `[STIBNITE]`'s helicopter-supported sump is 12 × 6 × 3 ft =
**6.11 m³** of excavation. `[CORING-MAG]` via `research/02` §E6 says a mud pit
is **4 000 L**. The module takes `[STIBNITE]`, because a dimensioned source
beats a volume for geometry, and records that the two are consistent: a sump is
not filled to its rim. The 6.11 m³ is then what sizes the push-up (§5).

**Pad area.** The strongest, thrice-confirmed figure is `[BC-BOND]`'s
**10 m × 10 m = 100 m²**, and the module does NOT use it. The reason is
arithmetic on the game's own machine rather than preference:
`node tools/glbinfo.mjs --parts public/models/core-rig.glb` measures the rig
that stands here at **2.890 × 12.267 × 6.647 m**, and `[BLY-PAD]`'s 3 m
clearance around it is 8.89 × 12.65 m = **112 m² before anything else is on the
pad at all**. 100 m² therefore describes a smaller skid rig than this one. The
module works to a 32 m pad (804 m²), which sits inside `[ONTARIO-BMP]`'s
20–40 m band, under `[MB-BMP11]`'s 900 m² cap, and above `[NT-BOXHOLE]`'s real
625 m².

---

## 4. Where anything can stand at all — the measured frame and the search

This was the hardest part of the job and it is not obvious from the file, so it
is written down.

**The camera.** `src/core/renderer.js` `CAMERA_MODES.hero` — which
`renderer.js:2154` selects for the `site` screen — is
`pos [8.40, 2.25, 10.94]`, `look [-1.55, 2.60, 0.00]`, **fov 34 vertical**, and
`renderer.js` sets the aspect from the surface band (780 × 911 px = 0.856). So
the horizontal half-field is `atan(tan 17° × 0.856) = 14.67°` and:

| depth along the view axis | frame width |
|---|---|
| 13.75 m (the collar) | **7.19 m** |
| 20 m | 10.47 m |
| 27 m | 14.13 m |

**The ground is not visible until 8.1 m out.** The eye is 2.25 m up and the
camera pitches 1.45° UP, so the bottom of frame crosses y = 0 at
`2.25 / tan(15.55°) = 8.08 m`. Nothing on the ground nearer than that is in shot.

**Three things eat the rest.**

1. The machine at three.js (0, 0, 2.4), measured at 2.890 × 6.647 m in plan,
   plus `[BLY-PAD]`'s 3 m — a keep-out of x −4.44…+4.45, z −5.57…+7.08.
2. `terrain.js buildProps()` draws seven props on **every** archetype, and two
   of them (the rod racks at three.js (−6.4, −5.4) and (−8.3, −5.4)) are dead
   centre of frame at depth 22. The others: compressor skid (7.2, 6.4), water
   bowser (10.4, 1.4), casing stack (−10.8, −1.2), toolbox (4.2, −6.0), site
   sign (6.2, 10.6), and a hazard-barrier arc on r 5.4 over three.js angles
   −0.9…2.7 rad.
3. The collar's own spoil ring and 2.4 m puddle (`buildCollar`, and `heightAt`
   raises ground for cr < 3.0 m).

**What is left is a crescent, not a yard.** The largest free, visible,
unoccupied rectangle inside a 15.5 m collar radius is about **5.1 × 3.9 m**, and
it only exists at the right-hand edge of frame. A grid search over the frame
(the map is reproducible from the constants in the module) placed the groups;
they were then re-checked by an assertion in `build()` that tests **every
authored vertex** against all seven keep-outs before the material join.

**Occlusion was found by looking, not by reasoning.** The hero eye is 2.25 m up,
so a nearer object hides a further one whenever `h_near/d_near > h_far/d_far`.
Three groups were deleted or moved after seeing a render:

- a fourth core pile solved at u −0.10, depth 27 — **directly behind the
  12.267 m machine at depth 12.** Geometry nobody would ever see.
- a third pile at u +0.76, depth 23 — **exactly in front of the sump.**
- a topsoil windrow — no legal spot left once the sump had grown to its sourced
  size. Dropped rather than shrunk to a token (and see §6: it was also the
  worst offender for the biome problem).

The right-hand core pile is 5 layers, not 11, for the same reason: at depth
20.9 anything over 1.29 m hides the sump's 1.25 m bank behind it. The cached
crib timbers went from 5 layers to 4 for the same arithmetic. Those are the
kind of numbers that only come out of an actual render.

---

## 5. What is in the export, and what each thing is for

| group | what it is | sourced by |
|---|---|---|
| **core laydown** | two runs of NQ trays on timber planks, the last three open and part-full | `[USBR-GFM]` boxes *"lined up, preferably on boards or planks"*, lids on |
| **core piles** | cross-piled trays on solid timber footings, 0.30 m off the ground, 25.4 mm gaps, ≤ 1.5 m finished | `[MB-BMP13]`, `[ON-STANDARDS]` III §1.4 |
| **logging trestle** | two A-frames at 900 mm carrying two 3.25 m rails, with an open tray being logged and a second waiting | `[DISCOVERER-TRESTLE]`, `[PALSATECH]` |
| **the core itself** | NQ 47.6 mm sticks in broken runs, in `rockFace` | `[WP-EDD]` |
| **marker blocks** | white 2¼-inch spacer blocks at run boundaries, one fluorescent-orange core-loss block | `[USBR-102D9]` Notes 3 and 4 |
| **the sump** | 12 × 6 × 3 ft of water, a 1.25 m push-up bank behind it, low flanks, a ramped fourth side, a picket-and-rail barricade | `[STIBNITE]`, `[CME-DMIRS]`, `[NT-AA7029]`, `[WORKSAFEWA]` |
| **return + suction lines** | the wet half of the method: layflat from the working area over the ramp, suction back out to the pump's own pad | `[BLY-PAD]`, `research/02` §E4 |
| **hole pegs** | three pickets with tags — this is not the crew's first hole here | `[ON-STANDARDS]` III §1.2, `[MB-BMP11]` |
| **cached crib timbers** | the other half of `[MB-BMP11]`'s preferred pad prep, and a `[BC-BOND]` reclamation line item | `[MB-BMP11]`, `[BC-BOND]` |

**The push-up's height is arithmetic, not taste**, and it is the one number
worth repeating here. The excavation is 3.658 × 1.829 × 0.914 m = **6.11 m³**,
and that material has to be somewhere. Heaped mostly on the far side as a
triangular prism 4.60 m long × 1.04 m wide, a crest of
`2 × 2.99 / (4.60 × 1.04) = 1.25 m` carries 2.99 m³; the two flanks at 0.74 m
carry 0.89 m³ and the ramp wedge about 0.7 m³ — ~4.6 m³ of the 6.11, the rest
spread and walked into the pad. **Bulking is ignored** (loose ground takes
20–30 % more room than it did in situ), so this is the low estimate rather than
an invented one.

The first hero render had that bank at 0.40 m and the sump was **invisible** —
from a 2.25 m eye 26 m away a flat quad on the ground subtends nothing. The
bank standing behind the water is what makes a pit read as a pit, and it is
also what the source says is there. That is the single best argument in this
file for doing the arithmetic instead of eyeballing it.

### What is deliberately absent

- **No vegetation, snow, sand, stumps or slash** — see §6.
- **No shelter or tarp over the mast.** The machine is the subject; a heated
  drill shack is a cold-climate object (`[CORING-COLD]`); and `[USBR-TM]` says
  flatly that *"directly covering boxes with a tarp is not acceptable"*.
- **No timber crib under the rig**, although `[MB-BMP11]` makes cribbing the
  *preferred* preparation. It would sit inside the machine's own footprint and
  fight its four `slide:jack-*` nodes. The cached timbers at the pad edge are
  that crib's other half.
- **No third rod rack, no compressor, no bowser, no toolbox, no sign.**
  `terrain.js` already draws all of them on every archetype.
- **No fuel drums or bunded pallet**, although `[BC-NOW]` puts 250 L of barrels
  on a real pad and `[BC-HANDBOOK]` requires 110 % secondary containment. It
  needs a painted-steel surface and this file has spent its five materials.

---

## 6. The eight biomes — what the loader can and cannot express

**The assignment asked whether a Nordic pad and a desert pad can be different
clearings. The honest answer is: the SURROUNDINGS already are, and the .glb
cannot be.** Both halves are read out of the code, not assumed.

### 6.1 What already varies per region — and it is a lot

`terrain.js` `REGIONS` has eight entries and `ARCHETYPES['exploration-pad']`
keeps **0.90–0.95** of each region's own scatter, against 0.06–0.55 on every
other built archetype. Its own comment says why: *"the pad is cut OUT of the
biome, so the biome is left almost untouched around it — this is the one
surface archetype that keeps nearly all of its region."*

| region | `groundKind` | what grows, at ×0.9 |
|---|---|---|
| nordic | `dirt` | 46 spruce, 14 birch, 22 rock, 40 stone, 260 grass |
| german-site | `gravel` | 6 spruce, 4 birch, 6 rock, 26 stone, 90 grass |
| alpine | `rockFace` | 20 spruce, 34 rock, 60 stone, 90 grass, 220 scree |
| iberian-quarry | `gravel` | 26 rock, 70 stone, 40 grass, 160 scree, 34 scrub |
| sahara | `sand` | 10 rock, 34 stone, 40 scree, 46 scrub — **no trees at all** |
| andes | `gravel` | 30 rock, 64 stone, 70 grass, 240 scree, 26 scrub |
| arctic | `snow` | 4 spruce, 14 rock, 22 stone, **40 ice** |
| north-sea | `concrete` | nothing (offshore; not an exploration pad) |

plus per region: `colA`/`colB`/`rock`/`spoil` albedo, the `snow`/`dust`/`wet`
ground-shader uniforms, `propTint`, `haze`, and the whole far field
(`amp`/`near`/`tint`/`forest`/`snowLine`/`sharp`). **That is eight genuinely
different clearings already, and it is better than a .glb could do**, because
it is instanced scatter that costs nothing extra per region.

**So the correct thing for this module to do was to add no vegetation at all** —
and that is the single biggest design decision in the file. A spruce authored
here would be right in nordic and wrong in the other seven, and it would also
be pure addition on a band that has no headroom (§7).

### 6.2 What cannot vary, verified in `src/world/terrain.js`

| where | why it cannot |
|---|---|
| `loadSiteModel(id)` | the parsed master is keyed by **archetype id only** (`siteMasters` / `siteInflight` / `siteProblems` are all `Map<archetypeId, …>`) |
| `attachSiteModel()` | clones that master and adds it at (0,0,0) with **no region argument anywhere on the path** |
| `bindSiteMaterials(node, id)` → `siteMaterial(kind, id, vertexColors)` | resolves each kind with `mat(kind, {color: 0xffffff, vertexColors: true})` — **a fixed colour, no region input**, where the procedural prop pool multiplies by `region.propTint` at `terrain.js:2181` |
| `site.finish()` | joins statics **by material**, so the export has five meshes named `static:<material>` and **no per-object node is left for a loader to hide** |

There is no hook. A per-region site is not expressible today.

### 6.3 The one place it bites this model, and it is small

`dirt` is used for exactly two things: the sump's push-up/ramp, and the sump
water. `terrain.js` would give that spoil `region.spoil` —
`0x6a6053` nordic, `0xbda37a` sahara, `0x9aa6b0` arctic, `0x7a6a52` andes — and
the .glb cannot ask for it, so it ships at an authored neutral `0x6E6252`. In
the Sahara and the Arctic that is a warm-brown bank on pale ground, and it is
wrong. **It is stated at the point of use in the module and it is the only such
compromise in the file** — the topsoil windrow, which was the other one, was
deleted rather than shipped wrong (§4).

### 6.4 Two fixes, in order of cost. Both belong to the integration agent.

**(a) Pass the region's tint into `siteMaterial()`. Zero draw calls, two lines.**
The procedural pool already does exactly this at `terrain.js:2181`
(`const tint = new T.Color(region.propTint); const put = (g, col, cls) => P.add(g, col, cls, tint)`).
A site .glb gets no such treatment, so a modelled site sits in a different light
from the procedural props standing next to it — which is a defect on *all three*
site models, not only this one. Making `siteMaterial()` multiply by
`region.propTint` when the mesh carries vertex colours would fix that and cost
nothing. It does **not** fix the spoil colour.

**(b) A region-variant filename, tried first, falling back.** In `siteUrl()`:
try `models/sites/<archetype>--<regionId>.glb`, fall back to
`models/sites/<archetype>.glb`. `siteMasters` would key on the resolved url
instead of the archetype id. Cost: one extra 404 per region on first load, and
one extra parsed master in memory per region actually visited. That is what
would let a Nordic pad ship stumps and a slash windrow, an Arctic pad a snow
berm and a heated shack on skids (`[CORING-COLD]`), and a Sahara pad a shade
frame — while the default file stays correct everywhere.

**I did not build eight files.** I own one filename and building seven more
without the loader change would be seven unused models, which is the pattern
this project already has nine instances of.

**A third option that does NOT work, so nobody spends a day on it:** tagging
geometry per region and hiding it at attach time. `site.finish()` joins by
material, and anything excluded from the join (parented under `pivot:`/`slide:`)
becomes its own mesh and therefore its own draw call. With a budget of 6 there
is no room for per-region groups inside one file.

---

## 7. The draw-call problem, and it is this archetype's specifically

`blender/lib/site.py` writes down the measurement its budget comes from, and
**`exploration-pad` is the most expensive procedural site of the nine**:

```
archetype                site   surface total   rig
urban-plot                 15              48    27
quarry-bench               17              50    27
exploration-pad            20              53    27     <-- the most expensive
platform-deck              10              43    27
```

It is expensive for exactly the reason it is good: it keeps 0.90–0.95 of its
region's scatter, which is up to seven or eight `InstancedMesh` draws, where
`urban-plot` keeps 0–0.15 of it.

`site.py`'s allowance arithmetic gives the *whole* site 17 calls
(80 ceiling − 57 worst rig − 6 sky/vfx). **exploration-pad already spends 20
before any .glb exists.** And the state this model appears in, `m07-core`,
measured **81 against the ceiling of 80** in `shots/s0-report.txt`.

**So this site has no change purse, and I could not find one that is honest.**
`quarry-bench` paid for its model with `replaces: ['outcrops','scree','stones']`
because its authored rock *is* what those scatters stood in for. Here the
equivalent move would be to delete vegetation, and the vegetation **is** the
archetype. The procedural `kit === 'exploration'` branch does get superseded by
this model (§8.1), but it lives in the merged prop pool, which is 6–7 draws for
everything in it however much is in it — so removing it gives back **zero**.

That is a decision for the integration agent, not for me, and it is the reason
this file spends 5 of its 6 materials rather than 6. Three ways to look at it:

1. **Accept +5 and measure it.** Re-run `node tools/shoot.mjs --headed --only
   methods` with the model wired and see what `m07-core` actually becomes. The
   81 was measured with the procedural site; if the giveback in §8.1 removes
   whole prop-pool classes it may be less than +5.
2. **Spend fewer.** Dropping `hose` (the return and suction lines) and `dirt`
   (the sump earthwork) would get to 3, at the cost of the two things that say
   "this hole is wet" — which `research/02` §E4 names as the test that separates
   a core pad from an RC pad.
3. **Gate it on quality.** `arch.model` could be ignored below `quality=high`.
   Nothing in `terrain.js` does that today for any site.

**I have not measured the live draw-call cost, but somebody has built the tool
that would.** `node tools/checksiteenvironment.mjs` already prints, for the two
wired sites, exactly the number this section is arguing about:

```
MEASURE net quarry-bench@german-site    without=19 with=22 modelPrims=6 net=+3
MEASURE net quarry-bench@iberian-quarry without=21 with=23 modelPrims=6 net=+2
PASS a site model is measured against what it actually gives back
```

**So the moment `model: 'exploration-pad'` is added (§8.1), that gate will print
the real net for this archetype in every region, on the real loader, for free.**
Run it before deciding anything in this section. It is a CPU-real-loader
measurement rather than a headed GPU one, so it grades the giveback, not the
frame rate; the frame rate still needs `node tools/shoot.mjs --headed --only
methods`, which needs the discrete GPU and the shared lease that the brief told
me not to take.

---

## 8. Cross-file requests — precise, and none of them made by me

I own `blender/sites/exploration_pad.py`,
`public/models/sites/exploration-pad.glb` and this file. Everything below is a
request.

### 8.0 The gate already agrees with §8.1, in writing

`node tools/checksites.mjs` fails today with 16 problems, two of them mine, and
it words the request better than I can:

> **FAIL** `blender/sites/exploration_pad.py` authors and exports
> "exploration-pad.glb", but the "exploration-pad" archetype in
> `src/world/terrain.js` declares no `model:`, so terrain.js **NEVER FETCHES
> IT**. This is the six-of-eight-machines failure in its site form: a fully
> built asset that the game silently replaces with the procedural kit, with a
> good fallback hiding it.
>
> **FAIL** exploration-pad.glb … 1.81 MB that ships in the build and is never
> fetched. Either declare the model on the archetype or delete the export.

**All eight unwired sites are in the same state**, not just this one:
`infrastructure-corridor`, `marine-spread`, `open-pit-bench`, `platform-deck`,
`tunnel-portal`, `underground-drive` and `well-pad` all fail identically. Only
`quarry-bench` and `urban-plot` are wired. That is a single decision for
whoever owns `terrain.js`, and §7 is the reason it is a decision rather than a
formality.

### 8.1 `src/world/terrain.js` `ARCHETYPES['exploration-pad']` — REQUIRED

```js
'exploration-pad': {
  kit: 'exploration', plane: 'surface', pad: 7.0, farAmp: 1.0,
  dress: { spruce: 0.95, birch: 0.95, rock: 0.9, stone: 0.9,
           grass: 0.9, scree: 0.9, scrub: 0.9, ice: 0.9 },
  model: 'exploration-pad',
  // [ONTARIO-BMP] a ground-supported diamond drill pad is 20-40 m in diameter;
  // [MB-BMP11] caps one at 900 m2. pi*16^2 = 804 m2 is a 32 m pad, inside both.
  flatR: 16, flatFalloff: 26, padCrown: 0,
},
```

**`flatR` is not optional and it is why.** `heightAt()` flattens to y = 0 only
inside `CFG.padRadius` 8.5 m of the pad centre, then raises a compacted crown of
up to +0.28 m from r 6.8 to 16.8. Evaluated from that function: **+0.02 m at
r 7.0, +0.09 at 8.0, +0.16 at 8.5, +0.25 at 9.3.** Without the change the
flat-to-3-cm ground on this archetype is a crescent about 4 m wide, and a core
tray lying on an 0.16 m step is visibly broken. Both archetypes that already
load a model declare exactly this (`quarry-bench` flatR 46; `urban-plot` flatR
76, padCrown 0).

Every vertex in the export is asserted inside 15.5 m of the collar, so a
`flatR` of 16 carries it with 0.5 m to spare. Footings, pegs and dunnage are
sunk 40–160 mm, so **if the change does not land, the model degrades to
slightly-sunk furniture rather than floating furniture** — but the far groups
would sit up to 0.25 m proud and it would be visible.

### 8.2 `src/world/terrain.js` `buildSiteKit()`, the `kit === 'exploration'` branch (~line 3510)

It draws its own core rack, sample bags, sump and access track. **This model
supersedes the first three**, so the branch should be gated on
`!siteModelReady()` the way `addInstances()` gates the scatter — otherwise a
wired model puts two sets of core boxes and two sumps on one pad.

Three things about that branch are worth handing over separately, all measured
by projecting them through `CAMERA_MODES.hero`:

| procedural object | three.js | frame position |
|---|---|---|
| core rack (3 × 5 boxes) | (−4.6, 8.4) | depth 10.6, **u −2.84 — off frame** |
| sample bags (10) | (6.4, −9.4) | depth 16.4, **u +2.85 — off frame** |
| sump + bund | (11.5, 6.5) | depth 1.2, **u +16.8 — beside the camera** |
| access track | from (13.5, 17.5) | entirely behind the camera |

**Every exploration-specific object `terrain.js` draws today is outside the hero
frustum.** The universal kit fares better but not much: of its seven props only
the two rod racks are in frame (u +0.01 and −0.22 at depth 22); the compressor,
bowser, casing stack, toolbox and site sign are all off camera. That is a real
finding about a file I do not own, and it is independent of whether this model
ever ships.

Also in that branch: the universal rod racks draw **4.4 m rods at 230 mm
diameter**. A core rod is **3.0 m at 69.9 mm OD** (`[BLY-RODS]`), and the rig
itself already publishes `pivot:rodrack extras={"rods":20,"rod_len_m":3}`. The
racks are drawing something that is not a core rod on the archetype whose method
is `core`.

### 8.2b `buildCollar()` — an undeclared 9.5x exaggeration, found in passing

`terrain.js buildCollar()` draws the hole's throat as a cylinder of
**r = 0.36 m — a 720 mm bore**. The hole this archetype's machine is actually
making is **NQ, 75.7 mm** (`[WP-EDD]`, and the rig publishes
`pivot:spindle extras={"bore_mm":117}`). That is **9.5x**.

The exaggeration is almost certainly necessary — a true-scale 76 mm collar at
13.7 m from a 34-degree camera is about 4 px — but it is exactly the same
undeclared-scale problem ASTRA §8.7 already records for the section band's
7.1x bore, where the conclusion was that *"a working driller will spot it in
ten seconds and then trust nothing else on screen"*, and that declaring it
turns a lie into a diagram. The same argument applies here and the collar is
the more visible of the two. `buildCollar()` is not my file; recorded, not
worked around.

### 8.3 `heightAt()` — optional, and it would finish the sump

The sump's excavation belongs in the height function, not in a site .glb
(`site.py`: *"If you find yourself modelling terrain here, it belongs in the
height function instead"*). A depression of the sourced 3.658 × 1.829 × 0.914 m
at the model's sump position, ramped on the pad-facing side, would turn the
water quad from "a dark patch inside a bank" into a real pit. The model reads
acceptably without it; it reads correctly with it.

### 8.4 `blender/lib/site.py` — BROKEN RIGHT NOW BY ANOTHER AGENT

At the time of writing, `blender/lib/site.py` **does not compile**, and
therefore **no site module in the repo can build**:

```
SyntaxError: (unicode error) 'unicodeescape' codec can't decode bytes
in position 8716-8717: truncated \UXXXXXXXX escape
```

The cause is at **line 155**, inside the module docstring. An earlier edit put a
literal Windows path in the docstring, hit this exact error, and fixed the path
to forward slashes — but the sentence written to explain the fix contains the
escape sequence itself, so the file still fails to parse. A docstring is a
string literal; a lone backslash-U in one is a syntax error wherever it appears,
including in prose about backslash-U.

The fix is one character: make it a raw docstring (`r"""`) or double the
backslash. **I have not made it — `site.py` is another agent's file and two
agents in one file clobber each other (ASTRA §12).** It is reported here and in
my hand-off instead.

---

## 9. NOT SOURCED — the admitted gaps

Every one of these is marked at its point of use in the module.

| what | why it is not sourced |
|---|---|
| **number of layers in a core pile** | no source gives a pad stacking practice. The 30-high figure is a lumber-strength claim and the 60-per-pallet is a packing claim. The module instead asserts every column against `[ON-STANDARDS]`'s **1.50 m** ceiling, which *is* sourced, and picks 11 and 5 inside it for composition reasons stated in §4 |
| **timber dunnage section** | `[USBR-GFM]` says *"boards or planks"* and gives no size. Drawn at 150 mm. `[USBR-TM]`'s 4×4 blocking figure is for forklift clearance under stacked boxes, not for laying a run on the ground |
| **the sump barricade** | `[WORKSAFEWA]` requires "barricaded", `[BLY-PAD]` requires "guarded", and **no source found names the physical barrier**. Drawn as a picket-and-rail line |
| **hole-peg dimensions** | the requirement to mark is sourced (`[ON-STANDARDS]` III §1.2); the peg is not |
| **the intake screen's mesh** | three documents cite the DFO *Freshwater Intake End-of-Pipe Fish Screen Guideline* by name; the guideline itself could not be retrieved. The strainer is drawn as a plain body |
| **the trestle's rails as timber** | the geometry is sourced (`[DISCOVERER-TRESTLE]`: 3.25 m, 50NB); the real rails are **galvanised pipe**. This .glb has no steel material inside its five, so they are drawn as timber of the same 60.3 mm section and the substitution is stated in the module rather than hidden |
| **the tray laydown pitch** | hand-laid, not a rack; 30 mm gaps between runs is an art choice |
| **every colour in the file** | except the tray colour, which `[WESTERNEX]` sources as a photography decision (grey preferred, white for contrast, black usually recycled stock) |
| **the topsoil windrow's height** | it was deleted before it shipped (§4), so the gap is moot — recorded because the derivation (`[BC-BOND]`'s 0.10 m topsoil depth × stripped area) is the right way to size one if it comes back |

Two gaps the research could not close, both worth another pass with a working
search budget: a **second independent set of core-drilling sump dimensions**
(the `[STIBNITE]` pair is the only one found), and **loaded core-tray weight by
core size** (only the one 45 kg figure, size unstated).

---

## 10. Outstanding issues

1. **`blender/lib/site.py` does not compile** (§8.4). No site can be rebuilt
   until somebody fixes line 155. The `.glb` on disk was built before the
   breakage.
2. **The live draw-call cost is not measured** (§7). It needs headed Chrome on
   the discrete GPU and the lease is held elsewhere.
3. **The model is not wired**, and `node tools/checksites.mjs` fails on it by
   name (§8.0) along with six other sites. §8.1 is the patch and it is
   deliberately not mine to apply. Until it lands this is 1.81 MB that ships
   and is never fetched.
4. **`shots/exploration-pad-offline-blender-hero.png` and
   `shots/exploration-pad-offline-blender-plan.png` are offline Blender renders
   and nothing else** — the label is in the filename because a filename is what
   survives a screenshot being pasted into a review.
   Their sky, key light, ground plane and exposure are inspection fixtures
   invented in `preview()`. They do not reproduce `assets.js`'s procedural
   materials, `env.js`'s light rig or `renderer.js`'s grade pass. **No frame in
   this repo shows this model as the game would draw it**, and none should be
   presented as if it did.
5. **The core-box laydown is a low band and it will stay one.** At depth 26.5 it
   is 0.18 m tall behind a 0.90 m trestle. Bringing it nearer is not possible —
   §4 shows why — so it reads as texture rather than as a subject. The trestle
   and the piles carry the identity instead.
6. **The sump water is a quad 30 mm over grade.** It is 6.7 m², it is inside its
   own bank, and it is the sump — but until §8.3 lands there is no hole under
   it, and a player who walks the camera close will see that.
7. **`tools/checksiteenvironment.mjs` flaked once in four runs**, on
   *"a site model is measured against what it actually gives back"* with
   `AssertionError: Timed out: model settle`. Three other runs of the same
   command in the same ten minutes passed 23/23. This machine was running eight
   Blender builds concurrently at the time, so the most likely cause is the
   settle timeout being tight under load rather than anything in the loader —
   but a gate that fails under load is a gate somebody will learn to re-run
   until it passes, which is worse than a slow one. Handed to whoever owns that
   file; it is not mine and nothing in my model is wired into it yet.
8. **`[WP-EDD]` is Wikipedia**, and it is the source for the NQ core diameter
   that sizes every core stick in the file. Four independent tray makers publish
   a 55 mm NQ channel, which is consistent with a 47.6 mm core, so the number is
   corroborated — but a first-party wireline standard would be better.
