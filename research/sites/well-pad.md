# Well pad — Blender environment reference

Research and build record for `blender/sites/well_pad.py` →
`public/models/sites/well-pad.glb`. Written 2026-09-06.

Read alongside `research/16-site-archetypes.md` §A.13 (onshore well pad, desert
case), §A.14 (water-well plot), §A.15 (permafrost / winter pad),
`research/01-oil-gas.md` §B.1 Phase 0 and §C.1.1, and
`research/06-geotech-water-geothermal.md` §E.4–E.7. Everything below is either
cited to a URL or a local PDF page, or marked **NOT SOURCED**.

---

## 1. THE FINDING THAT SHAPED THE MODEL

### 1.1 Seven methods stand on this archetype and only one of them circulates mud

Read off `METHODS[].archetypes` and `METHODS[].flushMedium` in
`src/game/data.js` on 2026-09-06, by importing the module and enumerating it,
not from memory:

| method | `flushMedium` | rigs | unlock |
|---|---|---|---|
| `auger` | **none** | crawler-lite, cfa-rig, sonic-truck, core-rig, si-rig | 1 |
| `cable-tool` | **water** | cable-percussion (`hasDrillString: false`) | 3 |
| `site-investigation` | **water** | si-rig, cpt-unit, crawler-lite | 8 |
| `dth` | **air** | dth-crawler, rc-rig, pd55 | 10 |
| `overburden` | **air** | crawler-th, dth-crawler, crawler-lite | 14 |
| `oil-rotary` | **mud** | oil-derrick | 30 |
| `sonic` | **water** | sonic-truck | 42 |

`oil-rotary` is also the only one of the seven whose `toolSlots` contains
`mudplant`, `mud` or `wellcontrol`.

Applications routed here by `terrain.js` `resolveArchetype()`: `water-well`,
`geothermal`, `oil-gas`. Regions: `sahara`, `arctic`.

**So mud tanks, a shale shaker, a desander/desilter stack, mud pumps and a
flare are wrong on six of the seven methods that reach this site.**

The primary-source form of the argument, which is stronger than an appeal to
experience:

- A shale shaker is a **liquid-mud** device — SLB Energy Glossary: *"the primary
  and probably most important device on the rig for removing drilled solids
  from **the mud** … The liquid phase of the mud and solids smaller than the
  wire mesh pass through the screen."*
  <https://glossary.slb.com/en/terms/s/shale_shaker>
- Air drilling replaces the liquid entirely — SLB: gases are used *"instead of
  the more conventional use of liquids"*.
  <https://glossary.slb.com/en/terms/a/air_drilling>
- The air-job return path has a different name and a different destination —
  IADC Lexicon, citing **API RP 64**: *"blooey line — The flow line in air or
  gas drilling operations."* <https://iadclexicon.org/blooey-line/>
- Where the cuttings actually go on an air job — NGWA: up the annulus and
  *"onto the adjacent ground"*.
  <https://wellowner.org/resources/basics/drilling-methods/air-rotary/>
- And the game's own pack already says it for the sonic case —
  `research/06` §E.4, from `[SONIC-SI]`: *"Often little or no flush — so no mud
  tank, no shaker, no spray. A clean site."*

### 1.2 The live defect this surfaced, in a file this agent does not own

`src/world/terrain.js`, the `if (kit === 'wellpad' || kit === 'desert')` branch
(lines **3546–3591** on branch `claude/site-environments` at `673f888`), draws
this unconditionally:

```js
// water and mud tanks, and the shale shaker/pipe run between them
for (let i = 0; i < 3; i++) {
  const c = at(-13.0, -2.0 + i * 3.6, 0.06);
  put(c(box(T, 6.4, 2.3, 2.9, 0, 1.20, 0)), i === 1 ? 0x35708c : 0x4B525A, 'paint');
  ...
```

Three mud tanks with a shaker and a pipe run between them, on **every** well
pad — including every `dth` and `overburden` contract, which are air-flush, and
every `auger` contract, which has no flush at all. Five of the seven methods
that reach this archetype are shown a mud system they are not running.

**This is not fixed here.** `terrain.js` belongs to another agent. The request
is in §6.

### 1.3 Why the .glb cannot fix it either, and what it does instead

`terrain.js` `attachSiteModel()` fetches `models/<arch.model>.glb`, keyed on the
**archetype**, once, then caches the parsed master. Nothing on that path knows
the method. There is therefore no honest way for one `well-pad.glb` to carry
method-specific fluid plant.

The model ships **only what is true of all seven methods**: no mud tanks, no
shaker, no desander/desilter/degasser, no mud pumps, no flare, no BOP closing
unit, no generator row, no camp, no fence. What is left is the part of a well
pad that no procedural kit in this game has ever drawn and that the archetype is
named for — **the pad as a piece of surface-water engineering** — plus the
stores and racks that serve any hole whatever is pumped down it.

§7 carries the costed spec for the `well-pad-mud` / `well-pad-air` variants and
the `terrain.js` change that would select them.

---

## 2. SOURCES, AND WHAT EACH ONE ACTUALLY SUPPLIED

### 2.1 The two primary drawings (local PDF, read with PyMuPDF per ASTRA §4.6)

`Wittig_Drilling_intro-part_I.pdf` — V. Wittig, *Drilling Fundamentals I*,
International Geothermal Centre / Hochschule Bochum, 08.11.2017. In
`C:\Users\henri\Downloads\`. Cited in the pack as `[WITTIG]`
(`research/16` §G, `research/01` §A). Pages rendered at 3× and 9–16× and read
directly; nothing below is quoted second-hand.

**Slide 19 (PDF index 17)** — the regulated site requirement set, verbatim:

> Minimum size approx. 3,000 m² (up to 10,000 m² = 1 ha) · Access suitable for
> low loaders and heavy transport · Sealed surfaces for hazardous substances ·
> Drill cellar incl. fundaments for drilling rig · Sewer connection or sewage
> pit · Water supply · Oil separator · Fixed fencing · Power supply · Gas flare
> installation possibility

**Slide 20 (PDF index 18)** — *"Drill site plan + layout for land rig > 100 ton
hook load"*, a real dimensioned general arrangement. Read off the drawing:

| block | what is on it |
|---|---|
| boundary row | toilet, living room, change room, support container, workshop, store |
| boundary column | driller, toolpusher, shower and laundry, toolpusher sleeper, customer, first aid / gas protection facilities |
| pipe yard | **PIPE RACKS**, parallel bearer lines either side of a **CATWALK** running to a **PIPE RAMP** at the rig |
| rig | rotary table, drawworks, doghouse, BOP closing unit, water cooling unit, drill line skid, choke manifold, trip tank |
| mud row | MUD TANK-A 20 m³, MUD TANK-B 43 m³, MUD TANK-C 43 m³, CUTTINGTANK I 46.5 m³, CUTTINGTANK II 20 m³, SOLIDSTANK 20 m³, triple unit tandem screen separator, desander, desilter, mud degasser, 2 × pump FB 1300, double acting manifold, baryte silo (optional), 4 × mud silos 37.5 m³ (optional), hopper manifold |
| power row | oil storage, emergency generator set 400 kVA, 3 × diesel generator containers at **2 500 mm** each, compressor unit **2 438 mm**, **FUEL TANK 30 m³ at 11 500 × 2 050 mm**, SCR container **14 000 × 3 000 mm**, control unit, cable tray |

The fuel-tank figure is the one dimensioned tank on the drawing and is used in
the model for the thing it dimensions.

**Slide 21 (PDF index 19)** — *"Drill site plan e.g. Germany"*, the WEG/BVEG
water-protection zoning plan. **This is the drawing the model is shaped by.**
Labelled, in German:

| label | meaning | in the model |
|---|---|---|
| **Rinne** | drainage channel, running the **whole pad perimeter** | `pad-channel-*` |
| **Rückhaltebecken** | retention basin, **outside** the pad at one corner | `basin-*` |
| **Zu-/Abfahrt** | one access and egress | `gate-*`, `access-track-*` |
| **WGK-Bereich** | the sealed water-hazard-class area under rig and fluid plant | **not drawn — see §5.1** |
| **Zeitweiliger WGK-Bereich (z.B. Rohrlager)** | *temporary* hazard area — the pipe store | `rack-*` |
| **Diesel- und Öllager** | diesel and oil store | `fuel-*`, `oil-drum-*` |
| Chemikalien · Zement-Silos · Waschwasser · Fäkalien | chemicals, cement silos, wash water, sewage | not drawn |

> **The drawing is stamped "Zeichnung nicht maßstabsgerecht" — NOT TO SCALE.**
> Every dimension taken from slide 21 would be invented. **None is.** Only the
> arrangement is used, and the model's dimensions come from the sources below.

### 2.2 The dimensional sources

| key | source | what it gave |
|---|---|---|
| `[GOLDBOOK]` | BLM/USFS *Surface Operating Standards and Guidelines for Oil and Gas Exploration and Development* ("the Gold Book"), 4th ed. rev. 2007 — <https://www.blm.gov/sites/blm.gov/files/uploads/The%20Gold%20Book%20-%204th%20Ed%20-%20Revised%202007.pdf> | Fig.2 p.20 layer stack **surface course → base course → subgrade**; p.25 *"a 14-foot-wide travelway, 2-foot shoulders, 2:1 cut slopes … and 6 inches of crushed aggregate"*; p.29 fill in *"layers not more than 8 inches in thickness"*; Fig.3 p.21 crown **aggregate 2–4 %**, level-ground section **3:1 side slopes**; p.16 the drainage asymmetry (below); pp.16–17 pit rules — 2 ft freeboard, ≥50 % below original grade, dike keyway 2–3 ft below grade, liner ≤10⁻⁷ cm/s and **minimum 12 mils** |
| `[USGS-OFR2012]` | Slonecker et al., USGS Open-File Report 2012-1154, Table 1 — <https://pubs.usgs.gov/of/2012/1154/of2012-1154.pdf> | **Measured** off 1 m NAIP imagery across 380 Marcellus sites: pad-only mean **3.0 ha (Bradford) / 2.9 ha (Washington)**; 4.1–4.3 ha with roads |
| `[DOE-SHALE]` | DOE/NETL *Modern Shale Gas Development in the United States: A Primer*, April 2009, p.47 — <https://www.energy.gov/sites/prod/files/2013/03/f0/ShaleGasPrimer_Online_4-2009.pdf> | Shallow **vertical** well pad **2.0 acres**; horizontal 3.5 acres; **+0.5 acre per additional well** |
| `[NMAC-PITS]` | New Mexico 19.15.17 NMAC — <https://www.srca.nm.gov/parts/title19/19.015.0017.html> | *"closed-loop system means a system that uses above ground steel tanks for the management of drilling fluids"*; temporary-pit freeboard **2 ft**; temporary liner **20-mil** string-reinforced LLDPE; side slopes **no steeper than 2H:1V**; liner anchor trench **at least 18 inches deep** |
| `[NDAC]` | North Dakota Administrative Code 43-02-03 — <https://www.ndlegis.gov/information/acdata/pdf/43-02-03.pdf> | 43-02-03-43(1): during drilling, wells cleaned into a pit or tank *"not less than forty feet [12.19 meters] from the derrick floor"*; 43-02-03-19.4: *"Reserve and circulation of mud system through earthen pits are prohibited unless a waiver is granted"*; 43-02-03-49: dikes sized to *"the total capacity of the largest tank plus one day's fluid throughput"* |
| `[CFR-112]` | 40 CFR 112.9(c)(2) and 112.7(c), via the eCFR renderer — <https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-112/subpart-A/section-112.9> | Containment for *"the entire capacity of the largest single container and sufficient freeboard to contain precipitation"* by *"dikes, berms, or retaining walls"*. **The regulation does not contain "110 %"** — that is an engineering convention |
| `[SLB-RACK]` | SLB Energy Glossary — <https://glossary.slb.com/en/terms/p/pipe_rack> | Pipe racks are *"two elevated truss-like structures having triangular cross sections"*, **"20 ft [6 m] apart"**, with *"wooden sills … placed between the layers of pipe"*; onshore racks have *"few stacked layers and instead extends laterally"* |
| `[TANK500]` | 500 bbl rectangular skid tank spec page — <https://matarbinfraih.com/products/500-bbl-rectangle-storage-tank/> | **12 000 × 2 720 × 3 350 mm** overall (rails folded); internal 10 700 × 2 700 × 2 820; **81 469 L = 512 bbl**; roof hatch **600 × 600 mm**; one 4 in fill, four 3 in circulation, one **6 in discharge manifold with three 6 in butterfly valves** |
| `[SLB-PIT]` | <https://glossary.slb.com/en/terms/m/mud_pit> | Land rigs: rectangular steel tanks *"with partitions, each holding approximately 200 barrels"*; offshore to 1000 bbl |
| `[ALLMAND]` | Light tower spec — <https://www.allmand.com/products/light-towers/night-lite-pro-ii-v-series/> | Mast raised **319 in = 8 108 mm**; transport **120 × 51 × 100 in = 3 043 × 1 283 × 2 530 mm**; outriggers deployed **101 in = 2 555 mm**; 4 × 350 W LED |
| `[ROLLOFF]` | 20-yard roll-off — <https://www.budgetdumpster.com/budget-dumpster-sizes/twenty-yard-dumpster.php> | *"22 feet long, 7.5 feet wide and 4.5 feet tall"* = **6.706 × 2.286 × 1.372 m**. A **general-waste** roll-off, not an oilfield cuttings box |
| `[NB16]` | via `research/06` §E.5 | Water-well steel casing **139.7 / 168.3 / 193.7 mm** *"racked alongside"* |
| `[HELP-BOQ]` | NGO borehole tender, South Sudan — <https://comms.southsudanngoforum.org/uploads/default/original/2X/4/40da0057db7bdad5d54fe25cfa5712c4d923d00f.pdf> | **uPVC 5 in screens in 3 m lengths**, 18 m screen + 62 m plain casing; **35 × 50 kg bags of 2–6 mm gravel** |
| `[OTA-NORTHSLOPE]` | US OTA, *Technologies for Oil and Gas Development on the North Slope of Alaska*, ch.2 — <https://www.princeton.edu/~ota/disk1/1989/8922/892205.PDF> | *"all roads and gravel pads are built about five feet thick"* (1.524 m); reserve pits built below grade using the permafrost for containment |
| `[SCDT-DESERT]` / `[SCDT-CLOSED]` | <https://scdrilltech.com/articles/onshore-desert-drilling-waste.html> · <https://scdrilltech.com/articles/closed-loop-and-zero-discharge.html> | Lined evaporation pits vs the closed-loop steel-tank spread with **cuttings boxes for haul-off**. §A.13: a site shows one or the other, **never both** |
| `[KGS-PRIMER]` | <https://www.kgs.ku.edu/Publications/Oil/primer12.html> | Site preparation, the water/cuttings pit, pipe racked convenient to the floor, water and fuel tanks filled |
| `[LONESTAR]` | <https://www.lonestardrills.com/drilling-water-wells/> | For mud rotary the operator *"digs the pit in the ground or uses portable tanks"* |
| `[DRILLMAN]` | <https://www.drillingmanual.com/determining-drill-pipes-lengths-on/> | API Range 2 **27–31 ft (8.23–9.45 m)** for **drill pipe**. Noted, not used as the casing source |

### 2.3 The drainage asymmetry — the single most useful sentence found

`[GOLDBOOK]` p.16, verbatim:

> The area of the well pad where the drilling rig substructure is located should
> be **level** and capable of supporting the rig. The drill rig, tanks,
> heater-treater, and other production equipment are not to be placed on
> uncompacted fill material. The area used for mud tanks, generators, mud
> storage, and fuel tanks should be at a **slight slope**, where possible … to
> provide surface drainage **from the work area to the pit**.

A well pad is not uniformly graded. The rig stands dead level; the stores side
falls away to the pit. That is a modelable asymmetry and it is what the
`collector-*` channel in the module is: the line that fall runs to, from the
stores and containment side of the pad, through the perimeter channel, to the
retention basin. `PAD_CROWN` is 3 %, the middle of `[GOLDBOOK]` Fig.3's 2–4 %
band for an aggregate surface, and the invert drops at that rate along the run.

---

## 3. WHAT IS IN THE MODEL, AND WHERE EVERY NUMBER CAME FROM

| object | dimension | source |
|---|---|---|
| pad, plan | 60 × 50 m on the view axis = **3 000 m²** | extent NOT SOURCED (§7.6); the AREA is `[WITTIG]` slide 19's stated **minimum**, exactly |
| pad lift | **0.610 m** = 3 × 8 in | rule `[GOLDBOOK]` p.29; the **count of lifts is NOT SOURCED** |
| pad side slope | **3:1** | `[GOLDBOOK]` Fig.3 p.21 |
| pad crown | **3 %** | `[GOLDBOOK]` Fig.3 p.21, mid of the 2–4 % aggregate band |
| surface course | **0.1524 m** = 6 in crushed aggregate | `[GOLDBOOK]` p.25 |
| access track | **5.486 m** = 14 ft travelway + 2 × 2 ft shoulder | `[GOLDBOOK]` p.25 |
| perimeter channel *(Rinne)* | 0.62 × 0.34 m section | **NOT SOURCED** — feature from `[WITTIG]` slide 21, which is not to scale |
| retention basin *(Rückhaltebecken)* | 11.4 × 7.6 × 1.15 m, outside the pad | plan size **NOT SOURCED**; position from `[WITTIG]` slide 21; 100 % below grade satisfies `[GOLDBOOK]`'s ≥50 % rule; freeboard 2 ft and keyway 2 ft from `[GOLDBOOK]` pp.16–17 |
| lined pit | 6.4 × 3.6 × 1.05 m = 24.2 m³ | plan size **NOT SOURCED**; the volume falls inside `[WITTIG]` slide 20's own cutting tanks (20–46.5 m³); batter **2H:1V** and anchor trench **0.457 m** from `[NMAC-PITS]`; **21.1 m from the collar, measured**, against `[NDAC]`'s 12.19 m minimum from the derrick floor — asserted in code, the build raises if it moves |
| pipe racks | **2** trusses, **6.0 m** apart, triangular section, **2** tiers, sills between layers | all four from `[SLB-RACK]`; truss section and rack height **NOT SOURCED** |
| steel casing | Ø **168.3 mm**, sticks **9.0 m** | Ø from `[NB16]`; **length NOT SOURCED — derived from the sourced 6.0 m rack spacing** so the sticks overhang equally. Range 2 (8.23–9.45 m, `[DRILLMAN]`) brackets it but is a *drill-pipe* range and is not claimed as the source |
| uPVC casing / screen | Ø **127 mm (5 in)**, sticks **3.0 m** | `[HELP-BOQ]`; its rack spacing (2.0 m) **NOT SOURCED** |
| gravel-pack bags | **35** bags | `[HELP-BOQ]`; bag size **NOT SOURCED** |
| water tank | **12.00 × 2.72 × 3.35 m**, 512 bbl, 600 × 600 hatch, 6 in manifold with three butterfly valves | `[TANK500]`; class cross-checked against `[SLB-PIT]` |
| fuel tank | **11.5 × 2.05 m**, 30 m³ | `[WITTIG]` slide 20 |
| fuel bund | wall, height **NOT SOURCED** | `[CFR-112]` and `[NDAC]` 43-02-03-49 require a **volume**, not a height. No percentage is asserted anywhere in the module |
| cuttings skips | **6.706 × 2.286 × 1.372 m** | `[ROLLOFF]` — a **general-waste** roll-off; an oilfield cuttings box spec is **NOT SOURCED**, and the source page itself warns dimensions vary |
| light tower | mast **8.108 m**; body 3.043 × 1.283 × 2.530 m; outriggers 2.555 m | `[ALLMAND]`. **Its presence is an inference, not a fact** |
| store container | 6.06 × 2.44 × 2.59 m | ISO 20 ft external, the same envelope `urban_plot.py` cites |
| oil drums, cones | — | **NOT SOURCED** |

### 3.1 Materials — six, which is the budget

`blender/lib/site.py` `MAX_MATERIALS = 6`, and `finish()` deletes the file if
the joined scene exceeds it.

| material | carries |
|---|---|
| `gravel` | pad shoulder and batter, channel and collector inverts, access track, spoil ridges, cuttings in the skip |
| `concrete` | perimeter channel walls, collector walls, basin and pit kerbs, rack plinths, fuel bund |
| `paintedSteel` | water tank, cuttings skips, store container, light-tower body |
| `rawSteel` | rack trusses and stops, steel casing, ladders, handrail, tank manifold and valves, outriggers |
| `paintedDark` | skids, saddles, gate leaves and posts, rack sills, light-tower chassis and mast, pallet |
| `plastic` | pit and basin liners, uPVC casing and screen, gravel-pack bags, oil drums, cones, the water hose |

**One stated trade:** `[SLB-RACK]` says the sills between pipe layers are
**wooden**. `timber` is a real kind in `assets.js` and would be a seventh
material. The sills are drawn in `paintedDark` — right shape, wrong surface —
and that is a decision, not an oversight.

---

## 4. MEASUREMENTS

`node tools/glbinfo.mjs public/models/sites/well-pad.glb`, 2026-09-06. One
ruler (ASTRA §5); no second dimension tool was written or used.

```
glTF v2  1105.9 kB  extensions: none
PRIMITIVES 6  (= draw-call floor)   TRIANGLES 16736   nodes 7   images 0
materials: concrete, gravel, paintedDark, paintedSteel, plastic, rawSteel
mount:site-collar (scene root)
static:concrete / gravel / paintedDark / paintedSteel / plastic / rawSteel
DIMENSIONS (m)  W 82.776 x H 9.500 x L 98.346   [glTF Y-up]
BOUNDS  x -49.099..33.677   y -1.400..8.100   z -61.855..36.491
```

Build output:

```
WELL_PAD_AREA 3000 m2 (>= 3000, [WITTIG] slide 19) . lift 0.610 m (<= 1.524, [OTA-NORTHSLOPE])
WELL_PAD_FRAME furniture_worst_ndc_x=-0.839 on basin-spoil-1-61
             | boundary_worst_ndc_x=-1.380 on pad-toe-0
             | view-axis span -10.9..78.7 m
EXPORT_OK  bytes=1132440 meshes=6 draws~=6 tris=16736
SITE_OK    materials=6 draws=6 budget=6
```

The first line is a live gate, not a caption. `PAD_AREA_MIN` and
`PAD_LIFT_NORTH_SLOPE` were constants with a citation and no consumer — ASTRA
§10's second-most-expensive pattern — until `build()` was made to check the
modelled pad against both and raise. Re-solve the pad under 3 000 m2, or raise
the drawn lift past the North Slope 5 ft, and the build stops.

**Nothing but `mount:site-collar` and the six `static:<material>` meshes reaches
the file** (`nodes 7`), so no object name in this module — `water-tank`,
`fuel-tank`, `rack-steel` and the rest — is exported at all, and DOMAIN.md §10's
naming rule cannot be breached through one. `[WITTIG]` slide 20 names two engine
makes and a pump make; none of them appears anywhere in the module, in a comment
or otherwise, as anything but the drawing's own label.

Against the other two site models on this branch:

| site | primitives | triangles | bytes |
|---|---|---|---|
| `quarry-bench` | 6 | 13 936 | 961 304 |
| `urban-plot` | 5 | 29 576 | 2 754 112 |
| **`well-pad`** | **6** | **16 736** | **1 132 440** |

Notes on the numbers:

- **`y -1.400`.** Deliberate. Every ground-contacting object is sunk below
  grade so that if the terrain under the far edge is not flat (see §6.1) a kerb
  buries rather than floats. The failure is made silent in the safe direction on
  purpose, and it is written into `_seg()`'s docstring.
- **`z -67.642`.** `CFG.groundSize` is 150, so the ground mesh ends 75 m from
  the collar. The first build ran seven access-track segments and `glbinfo`
  measured `z -76.761` — the track was hanging off the end of the world. Cut to
  five. **This is why the model is measured rather than eyeballed.**
- **`boundary_worst_ndc_x = -1.580`.** `quarry_bench.py` records an undiagnosed
  edge artefact in the outer ~6 % of the surface band's width and mitigates it
  by keeping geometry inboard of NDC ±0.85. **A pad's boundary cannot obey
  that** — an edge runs across the frame and out of it, which is what an edge
  is. So the build assertion grades the two groups separately: furniture must be
  inboard of ±0.85 and raises if it is not, the boundary is reported and not
  gated. If the artefact is real, this model will exercise it, and that is the
  first useful test of it since it was found.


### 4.1 TWO THINGS THE OFFLINE RENDERS SHOWED THAT NO NUMBER DID

Both are in `shots/`, both were looked at, and both changed the model.

**(a) The pad was drawn too big and left empty.** The first export was
66 × 60 m = 3 960 m². The orthographic render showed the furniture occupying
about an eighth of it and the rest as a blank rectangle — because the mud row,
the power row and the camp that fill a real pad are all deliberately absent
(§5). Redrawn at **60 × 50 = 3 000 m², exactly `[WITTIG]` slide 19's stated
minimum.** A pad at its sourced minimum is honest about carrying less; a pad
drawn large and left empty is not.

**(b) The machine owns the middle of the frame, and the site only gets the
margins.** The hero render imports `rc-rig.glb` from the game checkout as a
stand-in — an inspection fixture, read-only, **not in this `.glb`** — because
`rigFactory.js` anchors a rig to `collarPosition` (0, 0, 0), the same origin
this site is authored about.

`rc-rig` measures 7.883 m wide (`glbinfo`) and stands at plan distance 13.74 m,
where the measured frame is 2 × 0.4023 × 13.74 = **11.06 m wide**. It fills
roughly **the middle 60 % of the frame and overflows it vertically.** In the
first composition almost every object was inside |NDC x| < 0.3 and was therefore
behind the machine. The furniture was moved out into the |NDC x| 0.45–0.84 bands
either side, and only the low ground works — the pad edge, the perimeter
channel, the collector, the lined pit, the track — were left in the middle,
where a rig on a frame is seen under and past.

**The general lesson, and it is not confined to this archetype:** a site model
must either be TALL enough to stand above the machine, or LATERAL enough to
clear it. `quarry-bench` took the first route (a 7.5 m highwall at 34 m). A well
pad cannot — a pad is flat, that flatness is its identity (§A.13: *"the desert
rig is a spread laid out flat"*), so it has to take the second.

### 4.2 A CONTRADICTION INSIDE THE HERO-CAMERA BLOCK, LEFT FLAGGED NOT FIXED

`quarry_bench.py` records the hero camera twice in one comment block, and the
two records are not the same camera:

| statement | implies |
|---|---|
| `half-width(d) = 0.4023 d` | half-width / d = **0.4023** |
| `top(d) = 2.25 + 0.2065 d`, `bottom(d) = 2.25 - 0.1638 d` | half-height / d = 0.18515 → vertical fov **20.97°** ✓ agrees with the quoted fov |
| `fov 20.97 vertical, aspect 1.724` | half-width / d = 1.724 × 0.18515 = **0.3192** |

**0.4023 against 0.3192 — the quoted aspect implies a frame 21 % narrower than
the fit every placement in both site modules is solved against.** This is
ASTRA §5's *"two tables describing one thing will drift, and the one that is
wrong will be believed"* occurring inside a single comment block.

The three linear fits are used here, because they are what was bisected off the
live projection matrix and what `quarry_bench` itself places geometry with; the
aspect is the derived quantity and is the likelier error. But **this pass could
not re-measure either** — the GPU lease was held elsewhere — so that is a
resolution by provenance, not by measurement. Whoever next gets a headed session
should re-measure the hero camera and correct whichever line is wrong **in
`quarry_bench.py`, since it is the source of both files' constants.**

---

## 5. WHAT IS DELIBERATELY NOT MODELLED

### 5.1 The sealed working area — a "cannot yet" with a named blocker

`[WITTIG]` slide 21's **WGK-Bereich** and slide 19's *"Sealed surfaces for
hazardous substances"* are a **surfacing** distinction — hatching on a plan, a
different ground material in the world. A site `.glb` may not lay an opaque
floor over the live collar and the section seam, so it cannot show it that way.

Drawn as a kerb instead, it has to pass under the largest rig on this
archetype. The first build put one at `a = -13.5` and the keep-clear assertion
in `build()` caught it crossing the derrick's plan rectangle. Reduced to a run
that clears the rig, it lands at NDC ±1.2 — off screen — and buys nothing.

So it is left out. **The honest fix is in `terrain.js`**: a second ground
material over a rectangle around the collar, which the ground shader can do and
a `.glb` cannot.

### 5.2 The cellar

`[WITTIG]` slide 19 requires one, `data.js` names it in the archetype's own
`renders` line, and SLB describes it as *"a dug-out area, possibly lined with
wood, cement or very large diameter (6 ft [1.8 m]) thin-wall pipe"*
(<https://glossary.slb.com/en/terms/c/cellar>). **`terrain.js` already draws
it**, as a lined pit and grating edge at the collar. A second one here would put
authored geometry straight over the live collar and the section seam. It stays
in `terrain.js`.

*(Cellar **depth** is **NOT SOURCED**. The only figure found is one secondary
source giving 3–15 ft; SLB gives only the functional rule that depth is set so
the master valve is reachable from ground level. Do not put a number on it.)*

### 5.3 Fixed fencing, and the camp

Both are sourced, and the sources contradict each other **across the seven
methods**:

- `[WITTIG]` slide 19 requires *"Fixed fencing"* and slide 20 draws a full camp
  (toilet, living room, change room, workshop, store, six sleeper units); real
  desert inventories put **35–90 person** camps on the same location
  (`[FOX-DESERT]` via §A.13).
- §A.14 on a village borehole: *"Unbounded. No hoarding, no cabins, often no
  fence."* `[TGS-REPORT]`'s crew is four, mobilising in two days, and the report
  ends *"the site was cleared."*

Both are true; neither is true of all seven. Neither ships.

### 5.4 A flare

`[WITTIG]` slide 19 requires the **possibility** of a gas flare installation,
not a flare. Only `oil-rotary` could light one. The only setback figure that
could be sourced at all is `[NDAC]` 43-02-03-43(2) — 150 ft [45.72 m] from a
producing well or oil tank, 125 ft with a flame arrestor — and that is a
*production* rule, not a drilling-phase flare-to-wellhead rule. Alberta's AER
Directive 060 §7.8 defers the spacing to CSA Z620.3, which is paywalled.
**Flare stack height, flare line size and flare pit dimensions are all
NOT SOURCED**, and no source was found that discusses a flare on a water or
geothermal well either way.

### 5.5 A cyclone or dust collector

`research/06` §E.5 puts *"a dust collector / cyclone at the collar"* on an air
DTH water well. The 2026-09 pass found a **sourced negative** against modelling
one as standard equipment: across five water-well rig spec sheets from one US
OEM, no cyclone, dust collector or discharge separator appears in standard
features or options; what is listed is water injection, a foam pulse pump and a
line oiler. NGWA's air-rotary and DTH pages describe none. Cyclone dimensions
are **NOT SOURCED**. If an air variant is built (§7), the honest object is an
open deflector discharging to a ground cuttings pile, not a cyclone.

---

## 6. CROSS-FILE REQUESTS — none of these were made by this agent

`blender/sites/well_pad.py`, `public/models/sites/well-pad.glb` and this file
are the only things this agent owns.

### 6.1 REQUIRED — `src/world/terrain.js` `ARCHETYPES['well-pad']`

Without this the model does not load at all, and its far edge sits on
un-flattened ground. **This is not a suggestion — `tools/checksites.mjs`, a
gate another agent added to this branch while this model was being built,
already fails on it**, in exactly these words:

> `FAIL  blender/sites/well_pad.py authors and exports "well-pad.glb", but the`
> `"well-pad" archetype in src/world/terrain.js declares no `model:`, so`
> `terrain.js NEVER FETCHES IT. This is the six-of-eight-machines failure in`
> `its site form: a fully built asset that the game silently replaces with the`
> `procedural kit, with a good fallback hiding it.`

Seven of the eight sites built in this parallel pass are in the same state.
The declaration below is this model's half of the fix.

```js
'well-pad': {
  kit: 'wellpad', plane: 'surface', groundKind: 'gravel', pad: 13.0, farAmp: 0.75,
  dress: { spruce: 0.25, birch: 0.3, rock: 0.35, stone: 0.5, grass: 0.3, scree: 0.5, scrub: 0.55, ice: 0.6 },
  model: 'well-pad',                 // ← ADD. The filename is the archetype id
  replaces: ['stones', 'scree', 'tufts'],   // ← ADD. See the cost note below
  flatR: 60, flatFalloff: 82,        // ← ADD. The pad reaches 56.5 m from the
                                     //   collar; [WITTIG] slide 19's minimum
                                     //   3 000 m² is why it is that big
},
```

- **`flatR: 60`** is measured, not chosen: the pad's furthest authored corner is
  56.5 m from the collar. `flatFalloff: 82` keeps the blend outside it.
  `quarry-bench` uses 46/70 and `urban-plot` 76/100, so this is in family.
- **`replaces` is not optional.** `blender/lib/site.py`'s budget note is
  explicit that a site `.glb` cannot be additive: eight of twenty-one method
  states are already over the surface band's ceiling of 80 with no `.glb` on any
  site. This model costs **6 draw calls** and the three instanced scatters named
  above are what its authored spoil, gravel and stone stand in for. **Somebody
  should measure that trade before shipping it; this agent could not — the GPU
  lease is held elsewhere.** The measurement already exists as a harness:
  `node tools/checksiteenvironment.mjs` prints, for a declared site,
  `MEASURE net quarry-bench@german-site without=19 with=22 modelPrims=6 net=+3`
  — six primitives added, three instanced scatters given back, **net +3 draw
  calls.** `well-pad` also has six primitives, so the same three-scatter
  give-back would land it at net +3, but that is an arithmetic expectation and
  not a measurement until the archetype declares the model and the gate runs.
- `padCrown` is deliberately **not** set to 0 (unlike `urban-plot`). A well pad
  really is crowned — `[GOLDBOOK]` Fig.3, 2–4 % on an aggregate surface — so the
  procedural crown is correct here and the model does not fight it.

### 6.2 REQUIRED — the mud tanks and shaker on air and auger jobs

`src/world/terrain.js` lines **3546–3591**. See §1.2. The minimum honest fix is
to gate the tank/shaker block on the method's flush medium, which `terrain.js`
already has in scope (`methodId` reaches `resolveArchetype`):

```js
// data.js: METHODS[].flushMedium is 'mud' | 'water' | 'air' | 'none'
const flush = (ctx.data?.getMethod?.(methodId) || {}).flushMedium;
if (flush === 'mud') { /* the three tanks and the shaker */ }
```

Even leaving the model out of it entirely, this is a five-of-seven-methods
error that a working driller sees in one second.

### 6.3 OPTIONAL — method variants, and what they would cost

The clean mechanism is one line, because `arch.model` is already a lookup:

```js
const modelId = (arch.modelFor && arch.modelFor(methodId)) || arch.model;
```

with, in the archetype:

```js
modelFor: (m) => ({ 'oil-rotary': 'well-pad-mud',
                    dth: 'well-pad-air', overburden: 'well-pad-air' })[m] || 'well-pad',
```

Each variant is a separate `.glb`, separately budgeted at 6 materials,
separately cached by `siteMasters`, and only fetched if a contract asks for it.
`build()` in `well_pad.py` would take a `variant=` argument and the two extra
exports would be added to whatever drives the site builds.

**`well-pad-mud`** — everything in `well-pad` plus, from `[WITTIG]` slide 20's
dimensioned row and the specs gathered in this pass:

| object | sourced dimension |
|---|---|
| mud tanks A/B/C | 20 / 43 / 43 m³ `[WITTIG]` s.20; a 500 bbl rectangular skid tank is 12.00 × 2.72 × 3.35 m `[TANK500]`; land-rig partitions ~200 bbl each `[SLB-PIT]` |
| shale shaker | 2.97 × 2.00 × 1.62 m (4-panel) or 3.27 × 2.00 × 1.92 m (5-panel), on the tank; SLB: modern rigs run **four or more** |
| desander | **10 in** cones × 2–3, cut point +40 µm, 2.12 × 1.70 × 1.89 m |
| desilter | **4 in** cones × 12–16, cut point +20 µm, 2.12 × 1.70 × 1.80 m |
| vacuum degasser | 2.10 × 1.61 × 1.73 m |
| triplex mud pump (1600 hp class) | **5.436 m** over skids × **2.889 m** over the pinion shaft × **1.905 m** to the top of the gear case, 25 400 kg |
| flowline | bell nipple → possum belly at the mud tanks; **diameter and slope NOT SOURCED** |

The `oil-derrick` model already ends its flow line in mid-air at rig-local
(7.60, −5.20) — it is drawn running away to shakers that do not exist. A
`well-pad-mud` variant is what that line has been waiting for.

**`well-pad-air`** — everything in `well-pad`, minus the lined pit, plus:

| object | sourced dimension |
|---|---|
| compressor | 7.4 × 2.29 × 2.54 m, 7 590 kg, 505 L/s at 10.3–24.1 bar class (`research/06` §E.5 gives the air packages: 118 L/s @ 10.3 bar to 425 L/s @ 24.1 bar) |
| booster | 2.48 × 1.80 × 1.79 m, 3 200 kg, 350 psi in / 1000 psi out; forklift slots, i.e. a skid |
| blooey line / open deflector | API RP 64 names it; **length and diameter NOT SOURCED** |
| dry cuttings fan on native ground | ~60 ft × 15 ft discharge area; NGWA: cuttings go *"onto the adjacent ground"*, *"large, clean, and unmasked"* |
| water / foam injection tank | 25–75 gpm injection is listed on water-well rigs |

**No cyclone** — see §5.5.

### 6.4 OBSERVATION ONLY — `oil-derrick`'s V-door faces away from the camera

Not a request, and it needs confirming by someone who owns the file.
`blender/oil_derrick.py`'s docstring says *"+Y = the V-door and the driller's
cabin (the face the player looks in at)"*. `rig.py` exports with `export_yup`,
which maps Blender +Y → glTF −Z, and the hero camera is on glTF **+Z**.
`node tools/glbinfo.mjs` measures the derrick's bounds as `z -14.364..10.434` —
asymmetric toward −z, which is where the catwalk and pipe ramp are. So the
V-door, the pipe ramp and the driller's cabin appear to face **away** from the
player. Measured, but not confirmed against a live frame.

---

## 7. HONEST OUTSTANDING ISSUES

1. **No headed capture, and no in-game frame.** The GPU lease was held
   elsewhere for this whole pass, and the brief forbade launching headed Chrome.
   Nothing here is a claim about how this model looks in the game or what it
   costs at runtime. The 6 draw calls are `finish()`'s post-join count and
   `glbinfo`'s primitive count agreeing — a build-time number, not a frame.
2. **The hero-camera constants were not re-measured.** They are
   `quarry_bench.py`'s, from 2026-09-05, and that file records how it got them
   the hard way (twice wrong first). If the hero camera has moved since, this
   site is mis-framed **and so is quarry-bench** — it is a shared dependency.
3. **`flatR` has not landed.** Until §6.1 is applied, `terrain.js` flattens only
   to `CFG.padRadius` = 8.5 m and the ground under the pad's far edge is
   region relief. Everything ground-contacting is sunk to fail quietly rather
   than float, but that is a mitigation, not correctness.
4. **The `replaces` trade is unmeasured.** §6.1 names three instanced scatters
   to give back against this model's 6 draw calls. That should be measured warm
   with `tools/shoot.mjs --headed` before anyone calls it paid for.
5. **The pad boundary crosses `quarry_bench`'s edge-artefact band** and cannot
   avoid it. See §4.
6. **The pad's plan extent is NOT SOURCED and it is the biggest unsourced thing
   in the file.** Every area source found reports area only; none reports a
   length by a width. 60 × 50 m is solved against the frame and against
   `CFG.groundSize`, and it is at the bottom of the sourced range — the
   `[WITTIG]` minimum exactly, a third of `[DOE-SHALE]`'s 2.0-acre shallow
   vertical pad, and a tenth of `[USGS-OFR2012]`'s measured Marcellus mean.
   **The model is not a US oilfield pad drawn to scale and does not claim to
   be.** The reason it cannot be is measured: `CFG.groundSize` is 150, so the
   ground mesh is +/-75 m and a 3 ha pad (~173 m square) would run off it.
7. **Casing stick length is NOT SOURCED.** 9.0 m is derived from the sourced
   6.0 m rack spacing. If a real casing range for water or geothermal wells
   turns up, `CASING_LEN` is the constant to change.
8. **The light tower's presence is an inference.** Its dimensions are a
   manufacturer's; nothing sourced says a light tower is on every location. It
   is there because it is method-neutral and because it is the only vertical
   object on the pad.
9. **The sills are the wrong material.** `[SLB-RACK]` says wood; the budget said
   six materials. See §3.1.
10. **`mount:site-collar` is the only published node**, on purpose (ASTRA §10's
    declared-contract-with-no-consumer pattern — nothing in `src/` reads a site
    node today). The places a consumer would want, in the site's own Blender
    frame, one line each the day something reads them:
    `site-rack` on_axis(31.0, −7.4) = (−17.94, 7.02) ·
    `site-water` on_axis(40.0, 8.8) = (−12.01, 24.59) ·
    `site-pit` on_axis(34.5, −2.5) = (−16.67, 12.91) ·
    `site-basin` on_axis(60.0, −12.6) = (−41.31, 24.99) ·
    `site-gate` on_axis(51.6, 15.0) = (−15.23, 37.35).
11. **Two figures in the original research brief were wrong and are recorded
    here so they are not re-introduced:** 40 CFR 112 contains no *"110 %"*, and
    API Range 2 is **27–31 ft**, not 27–30.

---

## 8. REPRODUCING THIS

```bash
# build the model
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
    --python blender/sites/well_pad.py

# build it and render the two offline inspection views under shots/
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
    --python blender/sites/well_pad.py -- --preview --hero

# measure it — the ONE ruler
node tools/glbinfo.mjs public/models/sites/well-pad.glb

# look at it in the GUI (drop --background)
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" \
    --python blender/sites/well_pad.py
```

`shots/well-pad-export.png` (orthographic overview) and
`shots/well-pad-hero.png` (the game's measured hero frame - half-width 0.4023 d
and half-height 0.18515 d, see 4.2) are **offline Blender Cycles CPU renders
of the re-imported `.glb`**. The hero render also imports `rc-rig.glb` from the
game checkout's `public/models/` directory **read-only, as an inspection
fixture**, so the frame can be judged with the hole occupied; it is skipped
with a printed line if that file is absent, and it is **not part of
`well-pad.glb`**. They are not gameplay captures and no gameplay capture of this model
exists. Both use inspection lighting and an inspection ground plane that are
**not** in the `.glb`, and every material in the export is a name that
`src/core/assets.js` fills in at runtime — so they prove geometry, scale and
composition, and nothing whatever about colour.
