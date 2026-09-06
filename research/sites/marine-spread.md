# Marine spread — Blender environment reference

Research checked 2026-09-06 for `blender/sites/marine_spread.py`, which exports
`public/models/sites/marine-spread.glb`.

This is a **fictional** four-legged, towed, self-elevating work barge — a
jack-up — with a moonpool amidships and an offshore site-investigation spread on
its deck. Real vessel names, numbers and operators appear **in this note and in
code comments only**; nothing branded reaches the player (`DOMAIN.md` §10). It
is not a reconstruction of any real unit and it is not a naval-architecture
design: no stability, strength, load or capacity claim is made anywhere.

Read alongside `research/16-site-archetypes.md` §A.11 and §A.12,
`research/01-oil-gas.md` §C.1.2 and §C.1.8, `research/17-site-verification-notes.md`
§4, and `blender/lib/site.py`.

---

## 1. Which methods stand here, and the class chosen to match them

`src/game/data.js` is the content authority. Three methods list `marine-spread`
in their `archetypes`:

| method | unlock | rigs | depth range |
|---|---|---|---|
| `site-investigation` | 8 | `si-rig`, `cpt-unit`, `crawler-lite` | 10–35 m |
| `core` | 18 | `core-rig` | 30–600 m |
| `oil-rotary` | 30 | `oil-derrick` | 400–2400 m |

Two of the three are small geotechnical machines and the **first** time a player
ever sees this place is at level 8 with an SI rig on it. Three further things in
`data.js` point the same way:

- `ARCHETYPE_RIG_TYPES['marine-spread'] = ['Jackup', 'Semi-submersible', 'Drillship', 'Barge rig']` — **Jackup first**.
- the north-sea site prose for this archetype opens with **“a jack-up stood off with its legs on the seabed”**.
- `RIG_TYPE_WATER.Jackup = [25, 140]` m — a shallow-water machine and nothing else.

`research/16` §A.12 splits offshore geotechnical work into four classes and (c)
is *“Jack-up or liftboat for shallow water”*, with the rationale stated plainly:
*“JUBs are suited to coastal environments as the legs are fixed to seabed and
don’t move with the waves”* `[FUGRO-AYM]`.

**So: a jack-up, not a drillship.** That is the class.

### 1.1 THE SCALE PROBLEM — reported, not hidden

The class the SI work actually uses is *much smaller than this game’s deck*.
Sourced, this session:

| unit | LOA × breadth | source |
|---|---|---|
| Sandpiper (SI jack-up, Combifloat C-5) | **18.30 × 12.20 m** | [Sandpiper data sheet](https://www.lankelma.com/wp-content/uploads/2019/11/Sandpiper-Nov-2019-2.pdf) |
| Shearwater (SI jack-up, Combifloat C-5) | **21.30 × 18.20 m** | [Shearwater data sheet](https://www.lankelma.com/wp-content/uploads/2021/08/Shearwater-Data-Sheet.pdf) |
| Combifloat C-7 | 30.50 × 18.30 m | [C-7 spec sheet](https://combifloat.com/wp-content/uploads/2025/05/Combifloat_C-7_specsheet-E-HPU-1.pdf) |
| Combifloat C-9.5 (largest catalogue unit) | 36.60 × 27.45 m | [C-9.5 spec sheet](https://combifloat.com/wp-content/uploads/2026/02/Combifloat_C-9.5_specsheet-E-HPU-and-Diesel-v-Feb.26.pdf) |
| JB-114 (construction jack-up) | 55.50 × 32.20 m | [JB-114](https://www.jackupbarge.com/products/jb-114) |
| JB-117 (construction jack-up) | **75.90 × 40.00 m** | [JB-117](https://www.jackupbarge.com/products/jb-117) |

Against that:

- `oil-derrick.glb` measures **19.192 × 24.798 m in plan and 67.706 m tall**
  (`node tools/glbinfo.mjs public/models/oil-derrick.glb`).
- `src/world/terrain.js` `buildSpecials()` lays **56 × 34 m** of deck for this
  archetype, unconditionally.

**No purpose-built SI spud barge could carry any of the three machines the game
puts here, and none of them is as large as the deck terrain.js already draws.**
So the modelled unit is the **large end of the jack-up work-barge class** —
JB-117’s published hull and legs — carrying the SI class’s own sourced deck
fit-out (containerised laboratory, seabed CPT frame, tow gear).

That is a deliberate, stated compromise, not an accident. If the owner would
rather have the SI-authentic 20–30 m spud barge, two things have to change and
neither is mine: `buildSpecials()`’s deck outline must shrink, and `oil-rotary`
must stop advertising `marine-spread` (or get its own archetype). **Recorded as
a decision for the owner, exactly as `ASTRA.md` §9 records the others.**

---

## 2. What makes this unmistakably MOBILE and not a fixed platform

Another agent is building `platform-deck` — a fixed installation founded on the
seabed. This repository already states the discriminator, three times, and it is
not a matter of taste:

- `src/world/terrain.js`, `kit === 'offshore'` branch, verbatim: the fixed
  structure *“continues down into the water and stays there”*, and **“the air
  gap is what makes a thing a jack-up”**.
- `research/01-oil-gas.md` §C.1.2: *“a hull that floats **above** the sea on
  nothing. **The air gap is the tell** — 35 ft of daylight between the sea and
  the hull bottom `[IADC-JU]` §A.6. A jack-up with its hull touching the water
  is a jack-up in transit, not a jack-up drilling.”*
- §C.1.8’s modeller’s cheat sheet: *“a hull standing in the air on … lattice
  legs → **jackup**”*.

The model carries **eight** mobile tells, and a fixed platform can have none of
them:

1. **Legs that go up.** Four spud legs standing **37.0 m above the working
   deck**, leaving the top of the hero frame at about 15 m and continuing.
2. **Spud well towers** at the foot of each leg, with the hydraulic climbing
   cylinders and the crosshead locks that raise and lower the whole barge.
3. **Pin holes up the legs** — the ladder the crossheads climb.
4. **An air gap.** The hull bottom stands **8.00 m** clear of the sea, legs wet
   below it.
5. **A hull.** Plated sides, longitudinal stringers, a bilge keel, an
   oxide-red **boot topping** and **draft marks** — all of them high and dry,
   which only happens on a thing that floated here and then climbed out.
6. **Tow gear on the bow.** Two forward tow points, a **bridle**, and
   **Panama-type fair-leads forward of and in line with them** — the exact
   arrangement RenewableUK’s jack-up guidelines specify (§3 below).
7. **A moonpool with skid beams**, so the drill floor reaches the next borehole
   without moving the barge.
8. **No propulsion anywhere.** No propellers, thrusters or rudders exist in the
   file, because this class does not have them: propulsion is an *optional*
   extra on every Combifloat sheet and the SI jack-ups state their support
   requirement as *“Tug with 6–10 T bollard pull”*.

Everything a production platform would bring is deliberately absent.
`research/16` §A.12 states the three hard negatives flatly: **no riser, no BOP,
no flare.** There are also no conductor guides, no Christmas trees and no
boat landing (`terrain.js` gives *“a boat landing and a barnacle line”* to the
FIXED platform, so borrowing them would blur exactly the line this model exists
to draw).

Measured against the sibling export, `public/models/sites/platform-deck.glb`
(4 primitives, 18 480 triangles, 94.618 × 46.968 × 28.238 m): this model is
85.438 × 80.186 × 51.080 m and **80 m of that height is legs and crane**, which
is the silhouette difference in one number.

---

## 3. Sources, with URLs

Everything below was either fetched this session or is an in-repo research
document that carries its own citations. `research/16` marks its own claims
`[F]` fact / `[I]` inference / NOT SOURCED and those markers are carried through.

### 3.1 The unit — hull, legs, jacking, crane, helideck

One published four-legged jack-up work barge, so the proportions are a real
vessel’s and not an assembly of borrowed parts.

| constant | value | source |
|---|---|---|
| `HULL_L` | 75.90 m | [JB-117](https://www.jackupbarge.com/products/jb-117), “Dimensions” |
| `HULL_B` | 40.00 m | same |
| `HULL_D` | 6.00 m | same |
| `DRAFT` | 3.90 m (5.0 m incl. spudcan) | same |
| `LEG_DIA` | 3.50 m, **tubular** | same |
| `LEG_TOTAL` | 80.00 m (optional 90.00 m) | same |
| spud cans | 47.6 m² each, **removable** — below the sea plane, not modelled | same |
| `HELI_D` | 19.5 m diameter, Super Puma / 9.3 t | [JB-114](https://www.jackupbarge.com/products/jb-114), [JB-117](https://www.jackupbarge.com/products/jb-117) |
| crane | 1 000 t @ 22 m / 220 t @ 76 m, boom **60–98 m** | [JB-117](https://www.jackupbarge.com/products/jb-117) |
| `BOOM_L` = 60.0 m | the **shortest** published boom for the family (JB-114: 60–90 m) | [JB-114](https://www.jackupbarge.com/products/jb-114) |
| `JACK_STROKE` = 1.70 m, 0.65 m/min | JB-114, the **sister** unit — stated as sister-unit data, not JB-117’s | [JB-114](https://www.jackupbarge.com/products/jb-114), [scheepvaartwest](https://www.scheepvaartwest.be/CMS/index.php/dredgers-workboats/5144-jb-114-imo-8770728) |
| not self-propelled | JB-114 carries 2 × 164 kW gensets for onboard power only | [scheepvaartwest](https://www.scheepvaartwest.be/CMS/index.php/dredgers-workboats/5144-jb-114-imo-8770728) |

**Jacking is hydraulic crosshead-and-cylinder, NOT rack and pinion**, and this
was a correction that changed the model. Verbatim for the class: *“The jacking
mechanism consists of two hydraulically operated crossheads per spud well, to
lock and unlock the spud for vertical movement. Vertical movement is
accomplished by four hydraulic heavy duty cylinders”*
([Combifloat C-7](https://combifloat.com/wp-content/uploads/2025/05/Combifloat_C-7_specsheet-E-HPU-1.pdf),
“Jacking System”), and *“Automated hydraulic with pilot console — 2 rams per
spudwell”* ([Sandpiper](https://www.lankelma.com/wp-content/uploads/2019/11/Sandpiper-Nov-2019-2.pdf)).
Rack and pinion appears in the sourced material only for the big offshore
**drilling** jack-ups ([RenewableUK guidelines](https://iadc.org/wp-content/uploads/2015/04/ruk13-h_Guidelines-for-the-Selection-and-Operations-of-Jack-ups-in-the-Marine-Renewable-Energy-Industry.pdf)
§18.7). **The first draft of this module had racks on the legs and they were
wrong for this unit; they were removed.**

Leg type is also corroborated in-repo as a class fact: legs number *“three,
four, six and even eight”*, lattice **or tubular**, jacking is *“a rack and
pinion gear arrangement…”*, preloading *“simulates the loads on the soil that
might be experienced in a 100-year weather event”* — `research/16` §A.11
`[WP-JACKUP]`.

### 3.2 The air gap

Sourced as a **rule**, not a number: *“Airgap: Vertical distance between the
bottom of the rig hull and the water surface”*, and *“Minimum (Survival) Hull
Elevation = LAT + HAT + Surge + Wave crest elevation + 1.5 m”*
([RenewableUK guidelines](https://iadc.org/wp-content/uploads/2015/04/ruk13-h_Guidelines-for-the-Selection-and-Operations-of-Jack-ups-in-the-Marine-Renewable-Energy-Industry.pdf),
Appendix H). The same document says the hull is levelled at **zero air gap
immediately after preloading** and then elevated.

The modelled gap is **8.00 m** and it is DERIVED, not chosen: `terrain.js` puts
the sea at y = −14 and the deck at y = 0, so the gap is `14.0 − HULL_D`. The one
published air-gap NUMBER in this repository is **35 ft (10.67 m)**, for a
different, three-legged cantilever unit (`[IADC-JU]` §A.6, `research/01` §C.1.2).
8.00 m is therefore not contradicted by anything sourced, but it is set by
`terrain.js`’s sea plane and not by naval architecture. **Integration item, not
a fudge:** thinning the hull to make the number match would have been the fudge.

### 3.3 Leg length above the deck — derived from the game’s own numbers

```
LEG_TOTAL  =  above deck  +  deck→sea  +  water depth  +  penetration
   80.00   =    37.00     +    14.00   +     25.00     +     4.00
```

- **80.00 m** is JB-117’s published leg length.
- **14.00 m** is `terrain.js`: deck y = 0, sea y = −14.
- **25.00 m** is the shallow end of `RIG_TYPE_WATER.Jackup = [25, 140]` in
  `src/game/data.js` — the game’s own statement of where a jack-up works. It is
  corroborated by the real class: SI jack-ups work *“from the surf zone to 15 m
  water depth”* ([Lankelma nearshore](https://www.lankelma.com/nearshore-marine-services/)),
  the C-7 to 30 m and the C-9.5 to ~40 m; `research/16` §A.12(c) records a real
  jack-up SI campaign in water **to 37 m** `[FUGRO-AYM]`; and `research/01`
  §C.1.2 gives the jack-up band as **3–125 m** `[DM-OFFS]`.
- **4.00 m** of penetration is **NOT SOURCED**. The only penetration figure I
  could source is *“6 m average leg penetration”* for the much smaller SI
  jack-ups ([Sandpiper](https://www.lankelma.com/wp-content/uploads/2019/11/Sandpiper-Nov-2019-2.pdf)),
  which belongs to a different unit.

86 m of leg would sit inside the standard jack-up band `research/16` quotes
(*“generally less than 120 metres (390 ft)”* `[WP-JACKUP]`); 80 m is the
published figure and is used directly.

### 3.4 Tow and mooring — arrangement, and the arrangement is the meaning

All from the [RenewableUK jack-up guidelines](https://iadc.org/wp-content/uploads/2015/04/ruk13-h_Guidelines-for-the-Selection-and-Operations-of-Jack-ups-in-the-Marine-Renewable-Energy-Industry.pdf):

| clause | text |
|---|---|
| §12.9.1 | *“The jack-up shall be **towed from the forward end using a bridle** of suitable construction. If two tugs are used, the bridle may be split and each tug connected to a single leg of the bridle.”* |
| §12.11.1 | *“**Capped fair-leads or Panama-type fair-leads** shall be fitted forward of and in line with the tow connection points.”* |
| §12.10.2 | tow connection strength *“at least three times the static bollard pull”* of the tug |

Support craft: *“Tug with 6–10 T bollard pull”*
([Sandpiper](https://www.lankelma.com/wp-content/uploads/2019/11/Sandpiper-Nov-2019-2.pdf),
[Shearwater](https://www.lankelma.com/wp-content/uploads/2021/08/Shearwater-Data-Sheet.pdf)).
Mooring: a 4-point system is an **optional** extra on the Combifloat range, and
a real SI campaign used *“three-point anchoring”*
([Lankelma overwater experience](https://www.lankelma.com/wp-content/uploads/2021/11/Overwater-Experience-2011-2021.pdf), p3).

### 3.5 The spread on deck

| item | value | source |
|---|---|---|
| ISO 20 ft container envelope | 6.055 × 2.435 × 2.591 m | [CONTAINEX technical description v12.06.2023 p3](https://catalog.containex.com/catalog/CONTAINEX/EN/catalogs/Technische-Beschreibung-CONTAINEX-BASICLINE/pdf/Technische-Beschreibung-CONTAINEX-BASICLINE.pdf) — the same document `blender/sites/urban_plot.py` uses |
| the lab and welfare ARE containers, not a deckhouse | *“20' welfare container”* + *“40' container housing 20' laboratory, 12' workshop and 8' bargemaster office”* | [Shearwater](https://www.lankelma.com/wp-content/uploads/2021/08/Shearwater-Data-Sheet.pdf); [Sandpiper](https://www.lankelma.com/wp-content/uploads/2019/11/Sandpiper-Nov-2019-2.pdf) |
| the laboratory is the identifying object | *“a large soil laboratory centrally located next to the drill floor”*, plus a reefer for samples and a geological sample store | `research/16` §A.12 `[MTN-VOYAGER]`, `[BM-ZEPHYR]` |
| seabed CPT frame | 2 × 2 m footprint, **2.13 m** high, 7.3 T ballasted / 3.6 T deballasted, 50 kN, 20 mm/s | [Roson 50 kN data sheet](https://www.lankelma.com/wp-content/uploads/2021/11/Roson-50kN.pdf) |
| …and its three tells | *“an unmanned open frame with **no controls on it**, **one fat umbilical** entering the top at a bend restrictor, and **wide flat feet** — because its own weight is all the reaction it has”* | `research/16` §A.12 photograph |
| 20 in conductor | *“bespoke 20in conductor hostile environment riser casing”* that *“allows the drill string to remain in place through inclement weather events”* | `research/16` §A.12(c) `[FUGRO-AYM]` |
| sliding drill deck | *“a sliding drill deck”* so the rig reaches each location without moving the barge, *“saving up to 12 hours of marine operations at each location”* | `research/16` §A.12(c) `[FUGRO-CODLING]` |
| moonpool | published geotechnical moonpools **4.0 × 4.2 m to 7.2 × 7.2 m**; `terrain.js` cuts 6.0 × 6.0 m, inside that band | `research/16` §A.12 `[GQM-*]`; `terrain.js` `buildSpecials()` |
| helideck cantilevered off a corner | *“a rectangular barge hull, blunt-ended, helideck cantilevered off a corner”* | `research/16` §A.11 photograph `[I]` |

Boreholes actually achieved from jack-ups and spud barges, for scale against the
game’s 10–35 m SI and 30–600 m core: **70 m boreholes and CPT to 55 m** below
seabed in 5–20 m of water; **60 m** by cable percussion; 15 boreholes **to 40 m**
on the Fehmarnbelt SI; **54.5 / 52.5 / 53.5 m** on a Bass Strait jack-up
([Lankelma overwater experience](https://www.lankelma.com/wp-content/uploads/2021/11/Overwater-Experience-2011-2021.pdf);
[Fugro Peejay-1 report](https://www.mrt.tas.gov.au/mrtdoc/petxplor/download/OR_0796/N4808_16_3_Peejay_1.pdf)).

Drill masts actually used on these decks are **5.50 m under the sheaves /
6.87 m erected** (cable percussion) and 6.0 m (sonic), with a **12 m mast** when
a wireline CPT is rigged
([Dando 4000](https://www.lankelma.com/wp-content/uploads/2021/11/Dando-4000.pdf),
[CRS](https://www.lankelma.com/wp-content/uploads/2021/11/CRS-Rotary-sonic-drilling.pdf),
[Wison-APB](https://www.lankelma.com/wp-content/uploads/2021/11/Wison-APB.pdf)).
**No mast is modelled here** — the mast belongs to the machine, and that is also
why the procedural drill tower has to go (§5).

### 3.6 Source conflicts, reported unharmonised

- Combifloat C-7 deck strength: **15 mT/m²** (2020/2021 sheets) vs **20 mt/m²** (Feb 2026 sheet), both on combifloat.com.
- Combifloat C-5 water depth: **23 m** (2020) vs **~20 m** (Feb 2026).
- Combifloat C-7 water depth: **30 m** (spec sheet) vs **28 m** (project page).
- C-5 leg length: **27.00 / 27.30 / 27.40 m** across Combifloat, Sandpiper and Shearwater — three real configurations, not a discrepancy to average.

None of these feeds a constant in the module; they are recorded because
averaging them would have been the wrong instinct.

---

## 4. NOT SOURCED — the explicit gaps

Marked again at the point of use in the module, not only here.

1. **Leg centres (`LEG_X = 24.0`, `LEG_Y = 15.5`).** No dimensioned
   general-arrangement drawing is published for any unit in this class, so
   *nobody* publishes leg spacing. These are composition constants solved
   against the hero camera (§6) — 48 m × 31 m centres on a 75.90 × 40.00 m
   hull. **The biggest single gap in the file.**
2. **Spud-can penetration (4.00 m).** See §3.3.
3. **Hull plating thickness, stringer positions, bilge-keel size, freeing-port
   size and spacing, draft-mark pitch.** Drawn to read at deck scale.
4. **Boot-topping band height, and therefore the exact waterline band.** The
   draft itself (3.90 m) is published.
5. **Spud well tower height and plan (`WELL_H`, `WELL_PAD`).** `research/16`
   §A.11 requires *“jacking houses at their bases”* and dimensions none.
6. **Pin-hole pitch on the legs.** Drawn at the sourced 1.70 m jacking stroke,
   because a climbing cylinder must reach the next hole in one stroke. That is
   an **inference and it is labelled one in the module** — it is not a published
   pin pitch and must not be quoted back as one.
7. **Guard-rail height and course count, bulwark height.** This session’s
   web-search budget was already spent when the module was written, so I could
   not reach a citable text of the IMO MODU Code or SOLAS guard-rail clause.
   1.10 m and two courses are ordinary marine practice, **not a quoted rule**.
8. **Bollard, bitt, fair-lead and bridle dimensions.** The tow ARRANGEMENT is
   sourced (§3.4); no dimension of any fitting is.
9. **Crane luff angle and slew in the stowed pose; pedestal diameter.**
10. **Helideck support truss, perimeter net and marking layout.** The 19.5 m
    diameter and the Super Puma rating are published; nothing else is, and no
    landing-area standard is claimed.
11. **Pipe-rack layout, bearer sizes and joint lengths.** The 20 in conductor
    size is sourced; the rack is not — no published rack dimension exists for
    this class.
12. **Skid-beam section and travel.** The sliding drill deck is sourced as a
    thing that exists; its geometry is not.
13. **Livery.** Every colour is fictional. No real operator’s colours.
14. **Fugro “Excalibur”** — hull, legs, water depth, moonpool: nothing usable
    was reachable. A search-engine summary asserted “8-legged, 40 m water
    depth”; it was **not** confirmed on any page actually fetched and is
    therefore not used. Same for DEME “Thor”/“Goliath”, “Wind Server”,
    “Deep Diver”, “Vagant” and Seajacks.

---

## 5. Offshore placement in `terrain.js` — exactly what is there

**The integration agent owns every one of these. I changed nothing in `src/`.**
Line numbers are as of this worktree on 2026-09-06.

### 5.1 The archetype does not declare a model, so the file is never fetched

```js
// src/world/terrain.js:593
'marine-spread': { kit: 'marine', plane: 'offshore', deck: 'mobile' },
```

`attachSiteModel()` opens with `const id = arch && arch.model; if (!id) return;`
— **no `model`, so `loadSiteModel()` is never called and the .glb is dead on
disk.** `platform-deck` (line 592) is in the same state.

The declaration also has to satisfy `tools/checksiteenvironment.mjs`, which
fails an archetype that declares a `model` without also declaring **both**
`replaces` and `replacesKit` (“an undeclared decision, not a safe default”):

```js
'marine-spread': {
  kit: 'marine', plane: 'offshore', deck: 'mobile',
  model: 'marine-spread',
  replaces: [],            // measured: offshore offers NO scatter — see 5.3
  replacesKit: true,       // the .glb IS the barge — see 5.2
},
```

### 5.2 The procedural `kit === 'marine'` branch is NOT gated, and it has a live defect

`terrain.js:2756` and `:4099` read `if (kit === 'urban' && !kitSuperseded())`
and `if (kit === 'quarry' && !kitSuperseded())`. **`terrain.js:3768` reads
`if (kit === 'marine') {`** — ungated. So does `kit === 'offshore'` at `:3953`.

With the model live and the branch on, the procedural monohull draws *inside*
the barge: a bulwark at z = ±11, a transom at x = 12.6, hull plating down to the
waterline (so no air gap at all), a soil lab, a stern A-frame and a deck crane —
a second, smaller, floating vessel occupying the same space. `replacesKit: true`
plus the one-word change at 3768 fixes it.

**And there is a defect in that branch that exists today, with or without this
model.** It builds an 11 m drill tower over the collar with its legs at
`x = ±3.3, z = ±3.0` and a head frame at 11.3 m:

```js
// terrain.js, kit === 'marine'
put(box(T, 0.30, 11.0, 0.30, s * 3.3, 5.5, t * 3.0), 0x9AA0A6, 'metal');
...
put(box(T, 7.2, 0.5, 6.6, 0, 11.3, 0), 0x77808a, 'metal');   // head frame
```

Every machine that stands on this archetype occupies that volume —
`si-rig` is 2.850 m tall, `core-rig` 12.267 m, `oil-derrick` 67.706 m — so the
site’s own tower is drawn **through the rig**, and the head frame at 11.3 m sits
inside `core-rig`’s mast. `oil-derrick`’s plan is 19.192 × 24.798 m, which
swallows the whole tower. This model deliberately builds **no** mast over the
moonpool for exactly that reason.

### 5.3 Offshore has no scatter to give back — measured

`node .probe-sites.mjs` (the integration agent’s own scratch probe, run
unmodified, 2026-09-06):

```
arch=marine-spread plane=- drive=null draws=14
    instanced[0]: -
    propPool[5]: props-paint:5972v props-metal:9392v props-matte:1360v props-rubber:1897v props-glass:464v
    other[9]: (unnamed) x7  deck  sea
arch=platform-deck  draws=14   instanced[0]: -   propPool[5]  other[9]
```

`marine-spread` has **`dress` undefined**, so `buildDressing()` offers nothing
and `addInstances()` — *“the only place the model’s cost can be paid back”* —
has nothing to drop. **`replaces` can only honestly be `[]`.**

That matters because `tools/checksiteenvironment.mjs` requires a recorded
net-cost ceiling per modelled archetype (`const CEILING = { 'quarry-bench': 3,
'urban-plot': 2 }`) and fails on an archetype that has none. **A ceiling for
`marine-spread` must be measured and recorded once the declaration lands; I
could not measure it, because measuring it requires the declaration and I do not
own `terrain.js`.** What is known:

- the export is **6 primitives**, so the .glb adds at most +6 mesh submissions;
- `replacesKit: true` will give back some of the 5 pooled prop meshes, but not
  all — `props-matte` is fed by something other than the marine branch, so at
  least one pool mesh survives. **The net is between 0 and +6 and must be
  measured, not assumed.**

**There is real headroom here, and this is the one archetype where there is.**
`blender/lib/site.py`’s own measured table gives `marine-spread` a surface total
of **44 draw calls against the band ceiling of 80** — the cheapest of the nine
archetypes it measured, and 36 calls clear. Eight of twenty-one method states
are already over that ceiling on land; offshore is not one of them.

### 5.4 What `buildSpecials()` fixes, and what this model is dimensioned to

For `plane: 'offshore'` (`onDeck()` true):

| fact | value | where |
|---|---|---|
| grating deck plate | a `ShapeGeometry` spanning x ±28, world z ±17 → **56 × 34 m** | `buildSpecials()` |
| the hole in it | `hx = fixed ? 5.4 : 3.0, hz = fixed ? 4.2 : 3.0` → **6.0 × 6.0 m** at the collar for `deck: 'mobile'` | same |
| sea | a 900 × 900 plane at **y = −14** | same |
| ground | still built, but `ground.visible = !onDeck()` | `buildGround()` |
| `terrainHeight()` | returns **0** everywhere when `onDeck()` | `terrainHeight()` |
| far field | skipped offshore | `buildFarField()` |
| pad decal | skipped offshore | `buildDecal()` |
| the .glb’s placement | `node.position.set(0,0,0)` — *“the .glb’s origin IS the collar”* | `attachSiteModel()` |

So the model’s origin is the hole, the deck is y = 0, and **the 56 × 34 m
grating plate is drawn whether or not a model loads**. This module therefore
supplies the plating *outside* that rectangle only, and the seam falls 17–28 m
from the collar where the grating working area meets the plated main deck —
which is how a drill-floor area is finished on a real barge, and is far from the
machine and the hole. **Nothing in the file covers the moonpool.**

`buildSpecials()`’s 56 × 34 m outline is not sourced from anything and is
larger than every published SI jack-up (§1.1). If it is ever reduced, `HULL_L`
and `HULL_B` here should be reduced with it.

### 5.5 Other integration notes

- `package.json` `blender:sites` **already** includes `blender/sites/marine_spread.py`
  (the integration agent added it before this module existed). Verified working.
- `tools/checkmodels.mjs` passes with the export in place: *“19 rigs, 19 blender
  modules, 19 exported models, 10 non-machine .glb — OK.”*
- `tools/checksiteenvironment.mjs`’s test **“nothing self-seeds on an offshore
  deck”** already covers `plane === 'offshore'` archetypes and asserts a `deck`
  exists, `heightAt(0,0) === 0` and `ground.visible === false`. Nothing in this
  model interferes with any of them.
- The export carries six `mount:` anchors, including `mount:site-collar` at the
  origin, which `checksiteenvironment.mjs` asserts is present and within 1e-5 of
  (0,0,0).
- **`blender/lib/site.py` changed under this module while it was being written**,
  and two of its corrections were consumed rather than ignored: the machine
  anchors to the **collar** and not to `CFG.pad` (§6.1), and the live camera
  field is **unresolved** between the authored 34° and a measured ~21° (§6).
  Both changed real geometry in this file. Nothing in `blender/lib/`, `src/`,
  `tools/` or `package.json` was edited by this agent.

---

## 6. Composition — why things are where they are

The hero camera is read live from `src/core/renderer.js:160`, which is the
authority: `pos [8.40, 2.25, 10.94]`, `look [-1.55, 2.60, 0.00]`. In Blender
that is eye (8.40, −10.94, 2.25) on a sight-line azimuth of **132.3°**.
`blender/lib/site.py`’s axis note applies: Blender **+Y is away from the
camera**, so anything meant to close the sky goes there.

**The horizontal field is UNRESOLVED and the composition is built to survive
it.** `site.py`’s header records the disagreement: `renderer.js:160` authors
`fov: 34`, but `fovForBand()` re-solves the vertical field every frame and
modules measure the live value near **21°**. On the surface band’s 0.856 aspect
those give horizontal half-fields of **14.67°** and about **9.0°** — so an
object 13° off axis is in frame under one and off-screen under the other.
Resolving it needs one read of the live `camera.projectionMatrix`, which needs
the GPU lease this agent was told not to take. **Every element that carries the
site’s identity is therefore placed inside 9°.**

- **The port-quarter leg is at Blender (−24.0, +15.5)** — **8.5°** left of the
  sight line at 39.7 m, beside the machine rather than behind it, leaving the
  top of the frame at about 15 m and continuing. That single leg and its spud
  well tower are the site’s identity in the hero shot, and their position is the
  whole reason `LEG_X`/`LEG_Y` are what they are. An earlier draft had
  `LEG_X = 30`, which put the leg at 13.2° — visible under the authored 34° and
  gone under the measured 21°. **Do not move them back out without measuring the
  field.**
- **The far bulwark and rail** run across the background at Blender y = +20,
  41.9 m out, with sea and horizon over them and **nothing below** — a fixed
  platform shows cranes, decks and a jacket over its rail. The bulwark spans the
  frame at any field.
- **The laboratory walkway rail** crosses the frame at 3.8° off axis, 31.9 m out.
- **The soil laboratory** sits on the port quarter at Blender y = +8, outboard
  of the machine reserve, where the hero camera looks past the rig.
- **The seabed CPT frame, its umbilical winch and the crane** are aft
  (Blender −x), which is the far half of the deck from the camera.
- **The tow gear, the mooring winch, the pipe racks and the conductor** are
  forward (+x), behind the camera in the hero shot and in frame on the orbit and
  mast cameras.
- **The helideck** is cantilevered off the forward-port corner with the air gap
  under it — sourced (§3.5) and out of the hero field.

### 6.1 KEEP_CLEAR, and the correction it had to absorb

Nothing rises above **0.45 m** inside `|x| ≤ 10.60, −17.40 ≤ y ≤ +15.00`, **at
any height** — “at any height” because `oil-derrick` is 67.7 m tall, so there is
no altitude at which a crane boom or a walkway may cross the machine.

The band is a **union**, and that is a correction, not a margin.
`blender/lib/site.py`’s header was updated mid-build with:

> **THE MACHINE DOES NOT STAND AT `CFG.pad`. IT STANDS ON THE COLLAR.** …
> `rigFactory.js:9049-9052` does `group.position.copy(anchor)` with
> `anchor = ctx.terrain.collarPosition`, i.e. (0, 0, 0) … *“The rig’s local
> origin IS the drilling centreline, so it anchors to the COLLAR, not to
> terrain’s padCenter.”*

`oil-derrick`’s measured z bounds are −14.364 … +10.434, so:

| anchoring | Blender y extent |
|---|---|
| at `CFG.pad` (what the old header said) | −16.76 … **+8.03** |
| at the collar (**correct**) | −10.43 … **+14.36** |

The first draft of this module used the `CFG.pad` band alone and would have left
the forward pipe rack and the conductor bearers standing **inside the derrick**.
Both were moved (the racks inboard to Blender y = ±10 and forward to
x 11.2 … 20.8; the conductor onto the centreline at x 11.5 … 22.9), the skid
beams were recentred on the collar rather than on `CFG.pad`, and the band is now
the union of both readings so the model is safe under either.

Nothing at all is inside the 6.0 × 6.0 m moonpool opening. `build()` asserts
**both promises on real vertices before export**, and the build **fails** rather
than exporting a model that stands inside the rig. The assertion caught four
real placements during authoring: the moonpool hazard stripe at 0.455 m, a
laboratory service line, the CPT umbilical run, and the forward pipe rack after
the anchoring correction.

---

## 7. Measured

`node tools/glbinfo.mjs public/models/sites/marine-spread.glb` — the only
dimension tool in this repository (`ASTRA.md` §5):

```
glTF v2  3929.7 kB   PRIMITIVES 6 (= draw-call floor)   TRIANGLES 44236
nodes 12   images 0
materials: galvanised, paintedSteel, rawSteel, rubber, safetyStripe, wornSteel
mount:site-collar  mount:site-crane  mount:site-helideck
mount:site-lab     mount:site-moonpool  mount:site-tow
DIMENSIONS (m)  W 85.438 x H 80.186 x L 51.080
BOUNDS  x -37.970..47.468   y -18.000..62.186   z -30.420..20.660
```

`blender/lib/site.py` `finish()` at export: `SITE_OK materials=6 draws=6
budget=6` — **exactly at the budget, not over it.**

Reading the bounds, because the overall bound of a model is not its width
(`ASTRA.md` §5):

| extreme | what reaches it |
|---|---|
| x = +47.468 | the **tow pennant** running out over the bow toward the tug that is not modelled — 9.5 m past the hull, deliberately, the way `cfa_rig`’s concrete line runs out to the pump truck |
| x = −37.970 | the hull stern, `HULL_L/2` exactly |
| y (glTF, up) = +62.186 | the **crane boom tip**, luffed to 68°: 6.40 + 60·sin 68° = 62.03 plus chord offset |
| y (glTF) = −18.000 | the legs, stopping 4 m below `terrain.js`’s opaque sea plane |
| glTF z ±(30.420, 20.660) | Blender +y 30.420 = the **helideck** and its net, 10.4 m outboard; Blender −y 20.660 = the starboard hull side plus its fenders |

Leg tops are at 8.4 + 37.0 = **45.4 m**; the crane boom is the tallest thing in
the file at 62 m.

Against the other nine site exports in `public/models/sites/`:

| site | prims | triangles |
|---|---|---|
| underground-drive | 4 | 6 160 |
| quarry-bench | 6 | 13 936 |
| tunnel-portal | 6 | 15 956 |
| well-pad | 6 | 16 736 |
| platform-deck | 4 | 18 480 |
| infrastructure-corridor | 4 | 18 796 |
| exploration-pad | 5 | 24 552 |
| urban-plot | 5 | 29 576 |
| open-pit-bench | 4 | 29 852 |
| **marine-spread** | **6** | **44 236** |

**This is the heaviest site in triangles and the largest file (3.93 MB).** Draw
calls are the budget and it is inside it, and `site.py` is explicit that
triangles are *“the lane to spend in”* — but the file size is real and is listed
as an outstanding issue (§8.2). At 89 bytes/triangle it is the same rate as
`urban-plot` (93 B/tri), so it is a big model rather than a bloated one.

---

## 8. Outstanding issues — honest

**8.1 The scale compromise is unresolved and is the owner’s call.** §1.1. The
unit modelled is a 76 m construction-class jack-up carrying an SI fit-out,
because that is what fits the machines and the deck the game already has. A
purpose-built SI spud barge is 18–30 m and could carry none of them.

**8.2 3.93 MB and 44 236 triangles is the heaviest site in the game.** The legs
were cut from 18-sided to 13-sided and the pin-hole rows from 9 to 7 during
authoring, which took it from 48 328 to 44 236. Further cheap savings exist
(container corrugation ribs, freeing ports, bevels on the hull plating) if
somebody measures a real cost. Nobody has measured this model on the GPU —
`tools/shoot.mjs --headed` is the only thing that can, the shared GPU lease was
held elsewhere, and I was instructed not to take it.

**8.3 No warm, headed capture exists.** Everything in §7 is CPU measurement of
the exported file, and everything in §9 is an offline Cycles render. **Neither
is a performance verdict and neither proves how this looks in the game**, whose
surfaces are generated procedurally at runtime by `assets.js` and cannot be
reproduced offline.

**8.4 The net draw-call cost is unmeasured.** §5.3. It cannot be measured until
`model`/`replaces`/`replacesKit` are declared, and a `CEILING` entry must be
recorded in `tools/checksiteenvironment.mjs` at the same time or that gate
fails.

**8.5 The air gap is 8.00 m because the sea is at −14.** §3.2. It is a
consequence of `terrain.js`, not of naval architecture, and it is below the one
published air-gap number in the repository (35 ft).

**8.6 Guard rails, bulwark and every deck fitting are unsourced.** §4.7, §4.8.
The session’s web-search budget was exhausted before those could be chased. The
IMO MODU Code / SOLAS guard-rail clause and a bollard or fair-lead catalogue are
each a single fetch away for whoever picks this up next.

**8.7 Spud cans are not modelled.** JB-117’s are published (47.6 m² each,
removable) but they sit below `terrain.js`’s opaque sea plane, where no camera
can see them. If the sea ever becomes transparent, they are missing.

**8.8 There is no support craft.** A tug or a crew-transfer RIB standing off
would be the ninth mobile tell and both are sourced (*“Tug with 6–10 T bollard
pull”*, *“Mob boat — Ribcraft 6.4 m RIB”*). It was cut because it sits 14 m
below the deck, where no in-game camera looks. **Reconsider if the camera ever
leaves the deck.**

**8.9 The moonpool interior is a plain trunk.** Guide rails, a diverter, or the
casing string running down it are all things a real one has. None is sourced and
none is modelled.

---

## 9. The renders

`shots/marine-spread-offshore.png`, `shots/marine-spread-quarter.png`,
`shots/marine-spread-deck.png`.

**These are OFFLINE BLENDER RENDERS, not gameplay captures.** They re-import the
**real exported `.glb`** — no proxy mesh — and render it with Cycles on the CPU.
Reproduce with:

```
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
    --python blender/sites/marine_spread.py -- --preview
```

Three fixtures are in the render and **in nothing else**: the sea plane at
y = −14, `terrain.js`’s 56 × 34 m grating deck with its 6 × 6 m moonpool cut,
and a stand-in for the machine sized to `si-rig.glb`. They exist so the render
shows the composite the player sees rather than a barge with a hole in the
middle of it. **None of them is in the `.glb`.**

`marine-spread-deck.png` uses the game’s own hero eye, target and 34° vertical
field at the surface band’s 780 × 911 aspect — the same framing, rendered
offline.

**One real bug was found by looking at these rather than by reasoning about
them:** the first build laid the hull bottom as a single plate, which spanned
the moonpool, so a player looking down `terrain.js`’s opening would have seen
steel instead of sea. The bottom is now four strips round a trunk, and the
moonpool goes through the hull the way a moonpool does.
