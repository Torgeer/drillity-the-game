# Infrastructure corridor — Blender environment reference

Research and authoring note for `blender/sites/infrastructure_corridor.py`, which
exports `public/models/sites/infrastructure-corridor.glb`. Checked 2026-09-06.

Read alongside `blender/lib/site.py` (THE BUDGET, AXES, NO GUESSING),
`research/16-site-archetypes.md` §A.2 and §A.17, `research/07-hdd-trenchless.md`
§D5, and `research/sites/urban-plot.md`, which established the pipeline and the
cabin dimensions this file reuses.

**This is a fictional place, not a reconstruction of any scheme.** Its
dimensions are sourced; its layout in the picture is not, and every layout
number is labelled as composition in the module itself. No manufacturer, model
designation, marque, operator or real scheme name is modelled or exported
(`DOMAIN.md` §10), and **nothing on the site carries lettering of any kind** —
see the note on marker posts in §3.6.

---

## 0. What the site has to be, and what it must not imply

`src/game/data.js` `SITE_ARCHETYPES`:

> "A linear alignment — road, rail, pipeline or utility easement — worked from a
> strip that moves along with the job."

`src/world/terrain.js` `ARCHETYPES`:

> "A working strip along an alignment: cleared on the line, untouched a few
> metres either side of it. That contrast IS the archetype."

`terrain.js` routes **four applications** here — `civil-infrastructure`,
`trenching`, `utility-hdd`, `anchoring` — and `data.js` gives this archetype to
**twenty-odd methods**, from `auger` and `cable-tool` through `hdd`, `sonic`,
`anchor`, `driven-pile`, `rockbolt` and `top-hammer`. So the furniture has to be
neutral: it is either the corridor itself (true of all of them) or unconnected
material and plant standing on it. This is the same rule
`research/sites/urban-plot.md` states for the urban compound, applied here.

**Two consequences, both visible in the model:**

1. **Nothing is connected to the machine.** No line runs to the rig, nothing is
   aimed at it, nothing touches it.
2. **The ditch, its spoil and the pipe string all stop short of the working
   position and the machine stands in the break.** That is not a way of dodging
   the question. It is what a corridor looks like wherever the line has to be
   *crossed* rather than dug through, and it is the reason there is a drilling
   rig on a pipeline right-of-way at all.

**There is no open trench modelled**, for two reasons and the second is the
stronger. (a) `terrain.js` owns the ground mesh and it is opaque, so a trench
authored below z = 0 is geometry nobody can ever see; only the rim would poke
through and z-fight. (b) An open trench with a pipe lying in it badges every
contract on this archetype as open-cut pipe laying, which is one method out of
twenty. What is drawn instead is the *evidence* of the ditch: its two windrows
at their sourced widths and separation, its two lips at the sourced spacing, and
its line.

---

## 1. Sources

| key | document | what it is |
|---|---|---|
| `[INGAA-F9902]` | The INGAA Foundation, report **F-9902**, *Temporary Right-of-Way Width Requirements for Pipeline Construction*, prepared by Gulf Interstate Engineering, 1999 — <https://ingaa.org/wp-content/uploads/2012/09/19105.pdf> | Industry trade-association **engineering study**, not a regulation, and it argues a case (for wider ROW). Cited as that. It is the primary source here because it tabulates the width of **every strip across the right-of-way, banded by pipe diameter**, and its own drawings carry the same figures as dimension strings. |
| `[INGAA-PRIMER]` | The INGAA Foundation, *Building Interstate Natural Gas Transmission Pipelines: A Primer*, 2013 — <https://ingaa.org/wp-content/uploads/2023/09/2013_Building-Interstate-Natural-Gas-Transmission-Pipelines-A-Primer.pdf> | Independent second breakdown (Tables A1–A3) and drawing STD-INGAA-1, which agrees with F-9902. |
| `[PCGP-POD]` | Pacific Connector Gas Pipeline, FERC Appendix F.10 *Plan of Development*, filed 23 Jan 2018 — <https://www.ferc.gov/sites/default/files/2020-05/Appendix-F-10-Part-1.pdf> | A **filed regulatory document** for a real 36-inch line. Used only to corroborate the 95 ft width. |
| `[FERC-PLAN]` | FERC, *Upland Erosion Control, Revegetation and Maintenance Plan*, May 2013, reproduced verbatim as Appendix C of the NiSource FEIS — <https://www.fws.gov/sites/default/files/documents/NiSourceFEISappndxC_FERCPlans.pdf> | The ferc.gov copy refuses fetches from this machine; the FWS copy is the same document. |
| `[PENNEAST]` | PennEast Pipeline Project FEIS — <https://www.ferc.gov/sites/default/files/2020-05/Final-Environmental-Impact-Statement_2.pdf> | Trench depth, cover, and the centreline-staking interval. |
| `[OSHA-P]` | 29 CFR 1926 Subpart P — <https://www.law.cornell.edu/cfr/text/29/1926.651> and <https://www.law.cornell.edu/cfr/text/29/1926.652> | `ecfr.gov` 302-redirects and `osha.gov` 403s from this machine; Cornell LII carries the same text. |
| `[CFR-192]` | 49 CFR 192.327 (cover) and 192.707 (line markers) — <https://www.law.cornell.edu/cfr/text/49/192.327> · <https://www.law.cornell.edu/cfr/text/49/192.707> | |
| `[API-5L]` | API Spec 5L, 43rd ed., March 2004, **Table 11** — <http://www.entech.rs/PDF/STANDARDS%20DATA%20SHEETS/STEEL%20API/API%205L.pdf> | Delivered joint length. |
| `[API-1109]` | API RP 1109, 5th ed., Oct 2017 (the copy API released publicly for 811 Day) — <https://www.api.org/~/media/files/oil-and-natural-gas/pipeline/damage-prevention/811week_sec_1109_e5_2017.pdf> | Marker-post height and section. |
| `[SLP-SMP]` | Southampton to London Pipeline Project, CEMP Appendix F, *Soil Management Plan*, Rev 1.0, June 2021 — <https://www.slpproject.co.uk/wp-content/uploads/2021/08/Hounslow-CEMP-Appendix-F-Soil-Management-Plan.pdf> | Angle-of-repose table and stockpile height limits. |
| `[TSM8]` | DfT, *Traffic Signs Manual* Chapter 8 (2009), Table A1.5 — <https://en.wikisource.org/wiki/Page:UK_Traffic_Signs_Manual_-_Chapter_8_-_Part_1_(Traffic_Safety_Measures_and_Signs_for_Road)._Designs_2009.pdf/286> | Cone height and spacing. The DfT PDFs exceed this machine's 10 MB fetch limit; the page-anchored Wikisource transcription of the same document was used. |
| `[MUTCD]` | MUTCD 2009 §6F.64 — <https://mutcd.fhwa.dot.gov/htm/2009/part6/part6f.htm> | Cone banding. |
| `[PPI12]` | PPI *Handbook of PE Pipe*, Ch. 12, printed p.425 and p.457 — <https://conduitcalc.plasticpipe.org/pdf/chapter12.pdf> | Already the source behind `research/07` §D5. Read directly with PyMuPDF for this file (ASTRA §4.6), so the sentences below are quoted off the page rather than off §D5. Used for the HDD comparison in §2.2 and for the pipe diameter. |
| `[VENDOR-MAT]` | <https://totemmats.com/crane-mats-12/> · <https://vikingmat.com/products/12-timber/> | **Manufacturers' published tables, not standards.** Labelled as such at the point of use. |
| `[CABIN]` | Manufacturer technical description v12.06.2023 pp3, 7, 11 — already read and recorded in `research/sites/urban-plot.md`. | Reused unchanged so two sites cannot disagree about the same object. |

---

## 2. The working width

### 2.1 What is sourced, and it is sourced twice

`[INGAA-F9902]`, as a dimension string on its own NPS 18–24 drawing:

> "39' - SPOIL SIDE | DITCH AREA 8' | 48' - WORKING SIDE | 95' RIGHT-OF-WAY WIDTH"

and independently, in a filed FERC plan of development for a 36-inch line,
`[PCGP-POD]`:

> "PCGP proposes to utilize a standardized 95-foot wide temporary construction
> right-of-way with a 50-foot Operational Right-of-Way easement."

**95 ft = 28.956 m.** Two unrelated documents, one number, and the model uses it
unrounded.

For scale, and deliberately **not** used as the model's width, `[FERC-PLAN]`
sets the regulatory default:

> "The construction right-of-way width for a project shall not exceed 75 feet or
> that described in the FERC application unless otherwise modified by a FERC
> Order. However, in limited, non-wetland areas, this construction right-of-way
> width may be expanded by up to 25 feet without Director approval…"

— 22.86 m to 30.48 m, and 95 ft sits inside that band.

### 2.2 The one that was *not* used, and why it matters

`research/07-hdd-trenchless.md` §D5 already carries a corridor width from
`[PPI12]` p425, and it is a real one:

> "On the pipe side of the crossing, sufficient temporary space should be rented
> to allow fusing and joining the PE carrier pipe in a continuous string
> beginning about 75 feet beyond the exit point **with a width of 35 to 50
> feet**, depending on the pipe diameter."

corroborated on the same page by

> "Locate all buried structures and utilities within 10 feet of the drill-path
> for mini-HDD applications and **within 25 feet of the drill-path for maxi-HDD
> applications**."

— 2 × 25 ft = 50 ft, the same number from the other direction.

**That is 10.7–15.2 m and it is the width of a *pipe-stringing* corridor, not of
a construction right-of-way.** An earlier draft of this model built at 15.24 m
and then tried to fit a ditch, two windrows, a make-up strip and a travel lane
into it. They do not fit, because that width was never given for that job. The
figure is recorded here so nobody puts it back.

### 2.3 The cross-section as built

`[INGAA-F9902]` Figures 2 and 3, NPS 18–24 band. The supporting text, verbatim:

> "A three-foot buffer zone is allowed between the edge of the right-of-way and
> the topsoil, and between the topsoil and ditch spoil."
>
> "Depending on the pipe size, the amount of topsoil stripped will require from
> 10 to 20 feet for stockpiling."
>
> "the ditch spoil is stockpiled no closer than two feet to the ditchline, where
> it is segregated from the topsoil by a three foot buffer zone. Depending on
> the pipe size, the ditch spoil will require from 14 to 29 feet for
> stockpiling."
>
> "this area will have a width of 31 to 42 feet that includes a 5 foot
> separation zone for passing and maneuvering of equipment."

and the three-part naming it uses throughout:

> "The analysis divides the construction right-of-way width into three major
> components: (1) Ditch Area, (2) Spoil Side, and (3) Working Side. The ditch
> area is for placement of the pipe; the spoil side is for the temporary
> stockpiling of excavated subsoil during construction; and the working side is
> for the construction equipment and crew."

| strip, spoil side → working side | ft | m | status |
|---|---|---|---|
| buffer, ROW edge to topsoil | 3 | 0.914 | **[F]** |
| **topsoil windrow** | 14 | 4.267 | **[F]** |
| buffer, topsoil to ditch spoil | 3 | 0.914 | **[F]** |
| **ditch-spoil windrow** | 19 | 5.791 | **[F]** |
| **ditch area** | 8 | 2.438 | **[F]** |
| **pipe make-up and welding** | 11 | 3.353 | **[F]** |
| **equipment work area incl. travel lane** | 34 | 10.363 | **[F]** |
| buffer, working side to ROW edge | 3 | 0.914 | **[F]** |
| **total** | **95** | **28.956** | **[F]**, and asserted at import |

The module asserts the sum at import time. Change any strip and every offset in
the model follows — there is no second table of offsets to drift out of step
(ASTRA §5).

Where the travel lane sits inside the equipment strip is fixed by
`[INGAA-PRIMER]` Table A1, which lists the working side outward as: working
lane, worker access, **travel lane**, offset from adjacent property. The mat run
is therefore in the outer half.

`[INGAA-PRIMER]` also puts the pipe string and its supports at the same width
the make-up strip already implies, which is a useful cross-check from the other
direction:

> "The welded pipe string and its temporary wooden skid pipe supports typically
> are ten to twelve feet wide."

### 2.4 Where these land in the picture

Projected into the measured hero frame (see §5) at chainage 30 m along the
line — about 41 to 46 m from the eye — screen-left to screen-right:

| line | NDC x |
|---|---|
| topsoil windrow | ≈ −0.80 |
| ditch-spoil windrow | ≈ −0.45 |
| ditch line | ≈ −0.20 |
| strung pipe | ≈ −0.04 |
| matted travel lane | ≈ +0.48 |
| working-side ROW limit, staked | ≈ +0.66 |

Six parallel lines converging on one vanishing point at NDC x = −0.39. **That
is the whole picture, and the rest of the model is furniture on top of it.**

---

## 3. Every other sourced dimension

### 3.1 Topsoil stripping depth — three sources, one figure

> `[FERC-PLAN]`: "segregate at least 12 inches of topsoil in deep soils (more
> than 12 inches of topsoil)"
>
> `[INGAA-F9902]`: "This study considers the removal of 12 inches of topsoil
> from the ditch line and ditch spoil area."
>
> `[INGAA-PRIMER]`: "Topsoil is removed to its actual depth, up to a maximum of
> 12 inches."

**12 in = 0.305 m.** This is load-bearing twice in the model: it sets the volume
each windrow has to hold (§4), and **it is the height of the step at the edge of
the cleared width** — the ground outside the ROW still has its topsoil on, so it
stands exactly one stripping depth proud of the corridor. That step is the cut,
and it is not an invented number.

### 3.2 Depth of cover

`[INGAA-F9902]` states its own design basis — *"Pipe cover is 36 inches"* — so
36 in (0.914 m) is used, for consistency with the strip widths that were
computed from it. 49 CFR 192.327(a) requires the same figure in Class 2, 3 and 4
locations and at "drainage ditches of public roads and railroad crossings"; a
Class 1 location in normal soil is 30 in (762 mm). The regulation prints both
units itself.

| location | normal soil | consolidated rock |
|---|---|---|
| Class 1 | 30 in (762 mm) | 18 in (457 mm) |
| Class 2, 3, 4 | 36 in (914 mm) | 24 in (610 mm) |
| drainage ditches of public roads and railroad crossings | 36 in (914 mm) | 24 in (610 mm) |

### 3.3 Spoil setback from the ditch

29 CFR 1926.651(j)(2), verbatim:

> "Protection shall be provided by placing and keeping such materials or
> equipment at least 2 feet (.61 m) from the edge of excavations."

`[INGAA-PRIMER]` states the same rule in its own words and applies it to the
pipe as well: *"OSHA regulations require that a setback of two feet be
maintained between the pipe and the trench."* Both are already implicit in the
sourced strip widths above, so the model does not apply the setback a second
time on top of them.

### 3.4 Trench section

`[INGAA-PRIMER]` Table A3 (NPS 36, 36-in cover) gives trench **bottom 5 ft** and
**surface 8 / 10 / 15 ft** for OSHA soil types A / B / C. Type B is the case its
own drawing STD-INGAA-1 assumes (*"DRAWING ASSUMES TYPE 'B' SOIL"*). 10 ft over
5 ft at that depth is **0.42 H : 1 V** — **derived here from the two sourced
widths, not a slope anyone states** — and it is well inside the 1:1 maximum
29 CFR 1926.652 Appendix B allows for Type B soil (Type A ¾:1, Type B 1:1,
Type C 1½:1, all for excavations 20 ft or less).

`[PENNEAST]` gives the real depths for a 36-inch line: *"the excavation of a
trench between about 7 and 10 feet deep to allow burial of the pipeline with 3
to 4 feet of cover."*

### 3.5 The strung pipe

`[API-5L]` Table 11, footnote a, verbatim:

> "Nominal lengths of 20 ft (6 m) were formerly designated \"single random
> lengths\" and those of 40 ft (12 m) \"double random lengths.\""

corroborated by `[INGAA-PRIMER]`: *"Pipe typically is manufactured in 40 to 60
foot lengths"* and *"multiple welding stations spaced for welding 40-foot
nominal length pipe joints"*. **40 ft = 12.192 m** is what the model strings.

*(Note for anyone extending this: **API 5L has no "Range 1 / 2 / 3."** That is
API 5CT, for casing and tubing. API 5L uses a nominal length plus the Table 11
tolerances, with SRL/DRL as the former names for 20 ft and 40 ft.)*

The **skew** of the strung joints is sourced as a *practice* and explicitly not
as an angle — `[INGAA-PRIMER]`: *"The pipe joints are strung at a slight angle
relative to the ditch for handling purposes during assembly."* The model applies
a small alternating skew and `JOINT_SKEW` carries the admission.

**Pipe diameter: 24 in (0.610 m).** It has to sit inside `[INGAA-F9902]`'s
NPS 18–24 band, since every strip width above comes from that band, and 24 in is
also the diameter of the worked pullback example in `[PPI12]` Appendix B p457
(*"Outside Diameter OD = 24 in"*, DR 12, PE4710) that `research/07` §D5 already
leans on. One number, chosen once; every strip follows from it.

### 3.6 Marker posts — sourced height, sourced colour, deliberately no words

`[API-1109]` §5.5.3:

> "Aboveground markers should be sufficiently elevated to allow them to be
> clearly viewed from a distance, and to allow them to remain visible above
> normal vegetation or snow accumulation. **A minimum height of 4 ft above grade
> is recommended.**"

§5.2: *"metal pipe posts should be straight, sound, and have a nominal diameter
of 2 in. or larger."* → **1.219 m tall, ≥ 50.8 mm.**

49 CFR 192.707 puts them *"at each crossing of a public road and railroad"* and
requires the legend to sit *"on a background of sharply contrasting color"* —
which is why they stand at the far crossing in this model and nowhere else on
it, and why they carry a colour band.

**They carry no lettering, and that is a rule, not an omission.** 192.707(d)
requires the legend to include *"The name of the operator and the telephone
number"*. A legible marker post therefore means inventing a pipeline company,
which `DOMAIN.md` §10 forbids. A blank marker is honest; a fabricated one is
not — the same call `terrain.js` already made for the site board.

### 3.7 Centreline staking

`[PENNEAST]`, verbatim: *"PennEast would stake the centerline in 200-foot
intervals and at points of inflection (pipeline bends or PIs)."* At 61.0 m
spacing, **one** centreline stake falls inside a 70 m frame, and one is what the
model draws. The alignment here is straight, so there are no points of
inflection to stake.

### 3.8 Cones, at the access only

`[TSM8]` Table A1.5 Detail B: **450 mm** cones on roads up to 40 mph, **750 mm**
at 50 mph and above, *"Cone spacing 1.5 m"* in every row of the table; Chapter 8
Part 2 clause O7.2.43: *"Under no circumstances shall the size of cone be less
than 450 mm in height."* `[MUTCD]` §6F.64 agrees to within the conversion (18 in
/ 28 in) and gives the banding: *"a 6-inch wide white band located 3 to 4 inches
from the top of the cone"*.

The 450 mm size is used, and **only at the access junction**, because that is the
only place on this site where there is a road. Cones scattered down a rural
right-of-way would be a road-works object in a place that is not road works.

### 3.9 Timber mats — **[VENDOR]**, and labelled as such

Two US manufacturers publish the same section and the same length range for a
12-inch timber crane mat: **12 in thick × 4 ft wide, 16 to 40 ft long**
(`[VENDOR-MAT]`, Totem: *"12″ mats are generally 4′ wide and come in standard
lengths of 16′, 20′, 24′, 28′, 30′, 32′, 36′ and 40′ long"*; Viking agrees). The
shortest standard length is used: **4.877 × 1.219 × 0.305 m**.

**This is a manufacturer's table, not a standard.** The *practice* is sourced
separately, from `[INGAA-PRIMER]`'s own drawing STD-INGAA-36: *"EQUIPMENT TO BE
SUPPORTED ON THE GROUND SURFACE OR TIMBER MATS AS CONDITIONS DICTATE."*

UK bog mats are a different product — 1.0 m wide, 3 to 7 m long, per
<https://www.birkettsbogmats.com/which-size-bog-mat/> and
<https://bogmats.com/specifications/> — and are **not** what is drawn here. The
"4 ft × 16 ft" figure is the US crane-mat convention, and no UK supplier table
matched it.

### 3.10 Welfare cabin

Reused unchanged from `research/sites/urban-plot.md` so the two sites cannot
disagree about the same object: external envelope **6.055 × 2.435 × 2.591 m**
(p3 §1.1), door **0.875 × 2.125 m** (p7 §2.5), window **0.945 × 1.200 m** with a
**0.870 m** parapet (p7 §2.6), and *"at least six support points"* (p11 §4.3) —
six are built, and they meet the ground.

---

## 4. What is DERIVED, and how the derivation is checked

The two windrow heights are **not chosen**. Each windrow has to hold the volume
that came out of the ground beside it, swelled by the sourced factor, inside its
own sourced base width. The height falls out; the resulting side slope is then
**checked** against the sourced angles of repose rather than set from them, and
the module raises if it falls outside.

`[INGAA-F9902]` design basis, verbatim: *"Flat right-of-way (no side slope) with
a 30 percent 'swell' factor on excavated soil."*

`[SLP-SMP]` Table 3.2 (the check): loose topsoil **35–40°** dry, 40–45° wet;
loose clay/silt **20–25°**; sandy gravel 25–30°. Same document: *"Topsoil
stockpiles shall not exceed 4m in height and subsoil stockpiles shall not exceed
5m in height."*

**Topsoil windrow.** Stripped width is stated by `[INGAA-F9902]` — *"removal of
12 inches of topsoil from the ditch line and ditch spoil area"* — so ditch strip
+ buffer + spoil strip = 2.438 + 0.914 + 5.791 = **9.143 m**.

    section area = 9.143 × 0.305 × 1.30            = 3.625 m² per metre of ROW
    height       = 2 × 3.625 / 4.267 (the 14 ft base) = 1.699 m
    side slope   = atan(2 × 1.699 / 4.267)          = 38.5°     ✓ inside 35–40°
                                                                ✓ under the 4 m cap

**Ditch-spoil windrow.** Trench: 8 ft at the surface (sourced), depth = cover +
OD = 0.914 + 0.610 = 1.524 m, battered at the 0.42 H : 1 V derived in §3.4.

    bottom width = 2.438 − 2 × 0.42 × 1.524         = 1.158 m
    section area = (2.438 + 1.158)/2 × 1.524 × 1.30 = 3.562 m² per metre
    height       = 2 × 3.562 / 5.791 (the 19 ft base) = 1.230 m
    side slope   = atan(2 × 1.230 / 5.791)           = 23.0°    ✓ inside 20–25°

Both assertions are live in the module. If a future edit moves a width so that a
windrow could not physically stand up, the build fails rather than shipping it.

---

## 5. Composition — the choices that are art, stated as art

None of the following is a claim about how alignments are set out. They decide
where the line goes **in the picture**, and each is labelled `NOT SOURCED —
composition` at its constant in the module.

**The camera these are solved against is measured, but not measured by this
file.** The seven constants are copied verbatim from `blender/sites/quarry_bench.py`,
which probed the live `ctx.camera`; that file's own comment records two earlier
cameras that were wrong, one of them the fov/aspect figures quoted in
`terrain.js`, the other the boot camera read during the ~28 s shader compile.
**The GPU lease was held by another track throughout this work and no headed
capture was run from here**, so these were not re-measured and the module says
so. If the hero camera moves, this site and `quarry-bench` are mis-framed
together — which is the failure that can actually be found.

| choice | value | why |
|---|---|---|
| bearing of the alignment relative to the view axis | **−9°** | A corridor straight down the view axis puts its vanishing point behind the mast; one crossing the frame leaves both ends off-screen, because at 40 m the frame is only 32 m wide. A straight alignment's vanishing point sits at NDC x = tan(turn)/0.4023, so −9° puts it at **−0.39** — clear of the mast at −0.10, and inboard of the −0.85 that `quarry_bench.py` keeps its geometry within. |
| which side the spoil is on | screen-**left** | The two windrows are low dark earth, and the spoil-side ROW limit is the one that crosses the outer 6 % of the band's width. See §8. |
| modelled length | s = −12 m to +58 m | The eye is 13.75 m in front of the collar, so anything nearer than −13 is behind it; `terrain.js` `CFG.groundSize` is 150, so the ground plane ends at r = 75 m and the far-field skirt rings start at 72. Asserted: no vertex exceeds r = 74. |
| collar keep-clear | 7.0 m | Same as `urban_plot.py`'s. `terrain.js` owns the collar, its live spoil ring, this archetype's `pad: 9.5` decal and the section seam. **Asserted over every exported vertex**, not over the placements. |
| where the access, crossing, compound and laydown sit along the line | s = 31, 51, 43, 20–24 | Solved so each lands inboard of NDC x ≈ 0.8. |
| ROW limit-stake pitch | 9 m | The one sourced staking interval (200 ft) belongs to the **centreline**, not the limit. Limit stakes get an admitted pitch. |
| skid size and count per joint, joint gap, mat butt gap, tank size, cabin footing height, edge-lip envelope | — | All `NOT SOURCED` in the module. |

**One composition decision is worth arguing with.** The boundary is *staked*,
not fenced. `terrain.js`'s procedural corridor kit draws a running Heras fence,
and a rural construction right-of-way is not fenced for seventy metres of open
country — it is staked and flagged at the limit, and fencing goes up at hazards
and stock boundaries. Drawing a continuous fence would be inventing an object;
drawing stakes is cheaper *and* more accurate. If a reviewer wants the fence
back, the Heras panel is sourced at 3.5 × 2.0 m with a 38.1 mm frame tube by two
suppliers (<https://www.clearway.co.uk/wp-content/uploads/2022/02/Clearway-Heras-fencing_Feb-22.pdf>,
<https://hermeq.com/uk/en/anti-climb-temporary-mesh-fencing-panel.html>) and can
be added — but it costs the argument above, not just the triangles.

---

## 6. NOT SOURCED — the admitted gaps

ASTRA §1.1: *"A plausible invented number is worse than an admitted gap, because
nobody will ever check it again."* Everything below is built at a stated size and
marked `NOT SOURCED` in the module at the point of use.

| item | what was searched for | status |
|---|---|---|
| **Wooden pipe-skid size and spacing** | `[INGAA-PRIMER]` sources that they are wooden skids and that string + skids is 10–12 ft wide; it gives no skid size and no spacing. The one sourced spacing — **"PIPE ROLLERS 60' SPACING"** on INGAA drawing STD-INGAA-37 — is **HDD pull-side roller spacing**, a different operation, and is deliberately not substituted. | **NOT SOURCED** |
| **Gap between strung joints** | No fetched document states one. | **NOT SOURCED** |
| **The skew angle of strung joints** | The practice is sourced verbatim; no source quantifies the angle. | **practice [F], angle NOT SOURCED** |
| **ROW limit-stake height and pitch** | The 200 ft interval is for the centreline. | **NOT SOURCED** |
| **Marker-post burial depth** | `[API-1109]` §5.5.2 lists eight factors that determine it and gives no number. | **NOT SOURCED** |
| **A general "pipe OD + X mm each side" trench-width formula** | BS EN 1610 unreachable (plasticpipe.org 403, concretepipes.co.uk refused connection). The `[INGAA-PRIMER]` Table A3 numbers were used instead, which are better than a formula. | **NOT SOURCED** |
| **A UK/Ireland pipeline EIS printing a metric construction working width** | Searched; the Irish EPA Bord Gáis EIS agriculture chapter uses "working width" repeatedly and never gives a number. **Do not let anyone fill this with the commonly-repeated "30 m" — it was not sourced.** | **NOT SOURCED** |
| **A stated UK batter angle** | HSE is deliberately non-numeric: *"Battering the excavation sides to a safe angle of repose may also make the excavation safer."* | **NOT SOURCED** |
| Timber-mat dimensions | Manufacturers' tables only. | **[VENDOR]**, labelled |
| Cabin footing height, tank size, edge-lip envelope, access splay, mat butt gap, sink depth | — | **NOT SOURCED** |
| Every colour on the site | — | **NOT SOURCED**; a muted art palette |

**Two corrections to what was briefed**, recorded so they are not re-introduced:
the UK positioning and colour-coding guidance is **Street Works UK Volume 1,
Issue 10: 2023**, not Volume 2 (Volume 2 is *New Development Sites*); and **API
5L has no "Range 1 / 2 / 3"** — that is API 5CT.

**Environment limits during this work**, for anyone repeating it: the session's
200-call web-search budget was exhausted, and `ecfr.gov`, `osha.gov`, `astm.org`,
`plasticpipe.org` and `ferc.gov`'s plan pages all refuse fetches from this
machine. CFR text came from Cornell LII and govinfo; PDFs had to be extracted
locally with PyMuPDF (ASTRA §4.6), which is how the `[PPI12]`, `[API-5L]`,
`[API-1109]` and INGAA figures were read off the page rather than off a summary.

---

## 7. Measurements

Read off the built artefact, not predicted. `node tools/glbinfo.mjs` is the only
dimension tool in this project and no second one was written — ASTRA §5 records
the four false findings the last second ruler produced.

```
── public/models/sites/infrastructure-corridor.glb
   glTF v2  2481.0 kB  extensions: none
   PRIMITIVES 4  (= draw-call floor)   TRIANGLES 27052   nodes 9   images 0
   materials: dirt, gravel, paintedSteel, timber
   mount:site-access (scene root)
   mount:site-alignment  extras={"bearing_deg":141.29,"row_width_m":28.956} (scene root)
   mount:site-collar (scene root)
   mount:site-compound (scene root)
   mount:site-crossing (scene root)
   static:dirt  mesh=1prim   static:gravel  mesh=1prim
   static:paintedSteel  mesh=1prim   static:timber  mesh=1prim
   DIMENSIONS (m)  W 74.588 x H 4.571 x L 72.056   [glTF Y-up: W=x H=y L=z]
   BOUNDS     x -53.556..21.031   y -1.800..2.771   z -52.644..19.413
```

| | |
|---|---|
| materials | 4 — `dirt`, `gravel`, `paintedSteel`, `timber` — against a budget of 6 |
| primitives / draw-call floor | **4**, one per material after `finish()`'s join |
| triangles | 27,052 |
| file | 2,540,496 bytes |
| named nodes | 5 × `mount:`, all present after the join |
| baked textures | none — names only, as `rig.py` contract 2 requires |
| `transmission` | not set anywhere; nothing on this site is glazed |
| lowest point | y = −1.800 m — the deliberate burial of every ground form, so terrain relief under it cannot leave it hovering |
| highest point | y = +2.771 m — the welfare cabin, on its sourced 2.591 m envelope over a 0.18 m footing |

The build prints its own derivations and its own frame check, so §4 and §2.4 can
be verified without opening the file:

```
CORRIDOR_DERIVED   row=28.956  topsoil h=1.698 slope=38.5deg
                   ditchspoil h=1.230 slope=23.0deg  trench d=1.524
                   vertices_checked=16870
CORRIDOR_FRAME_OK  lines=6  vanishing=-0.3937  crests=-0.0879/-0.1741
                   frameHalfWidthAt45m=18.10m
SITE_OK            materials=4  draws=4  budget=4
```

`vertices_checked=16870` is the collar keep-clear: every exported vertex, tested
against `CLEAR_R` 7.0 m and against the 74 m edge of `terrain.js`'s ground plane.
It is asserted to be a plausible number as well, because a gate over an empty set
passes forever (ASTRA §10).

**On file size.** Roughly a third of the 2.48 MB is the `COLOR_0` attribute:
27,052 triangles is about 2,250 flat-shaded boxes and therefore about 54,000
unshared vertices, each carrying a colour as well as a position and a normal —
≈46 bytes a vertex, which is what the file measures. That is the price of the
vertex-colour trick that holds this to four materials, and it is the same trade
`urban_plot.py` made (2.69 MB / 29,576 tris / 5 materials) and `quarry_bench.py`
did not (0.94 MB / 13,936 tris / 6 materials, no vertex colours). About 0.7 MB
of it is the third windrow pass described below; it earns its place in the
picture and it is stated here so somebody can disagree with the trade.
**It is 2.4 MB that must not ship until the archetype actually fetches it** —
§11.0.

### 7.1 What the renders showed, and what changed because of them

The renders are **offline Blender Cycles CPU renders of the exported `.glb`,
re-imported**. They are **not gameplay captures** and nothing here claims
otherwise: no browser, no GPU and no part of the game ran, and the GPU lease was
held by another track throughout. What they prove is geometry, scale, placement
in the frame and that nothing hovers. What they cannot show is the site as a
player sees it, because `assets.js` generates every one of these materials
procedurally at runtime with wear and dirt driven by gameplay state, and a
`.glb` ships names only — the flat colours in these images are Blender's.

- `shots/corridor-hero.png` — from the measured hero eye, along the measured
  hero axis, at the hero camera's own 20.97° vertical field and 1.72 aspect.
- `shots/corridor-plan.png` — orthographic plan, so the cross-section can be
  counted against §2.3.

**Four real defects were found by looking, and all four are fixed.**

1. **The windrows were scattered boxes, not ridges.** The first build used
   `site.rubble()` for them, and thirteen of its blocks in a 6.1 × 4.3 × 2.1 m
   envelope came back as loose boxes with bare ground showing between them —
   the exact *"wall of smooth pale cardboard cartons with ruled edges"* failure
   `rubble()`'s own docstring says it exists to prevent, reproduced by using the
   prevention on the wrong shape. `rubble()` fills a roughly cubic envelope and
   is right for a **mass**; a windrow is a **line**, and a line has to be
   continuous before it is worth making ragged. `windrow()` was written for it.
2. **Continuous was still not enough.** The second render had ridges, and they
   read as **shipping containers**: two passes of 2.5–3.4 m blocks put three
   flat-topped faces across the near field. Worked ground is broken at every
   scale it is seen at, so there is now a third pass at 0.9 m sitting on the
   crest — and the pass tuple carries an explicit mode, because writing the
   clods in the same form as the toe made 2 m slabs standing on end.
3. **Most of both cut banks was below the ground.** `windrow()` sized a block
   as `(visible height + burial) × fraction`, so a top landed at
   `−burial + (h + burial) × fraction` instead of at `h × fraction`. Ground
   forms here are buried 1.8 m so relief cannot expose them, and where the
   visible height is the sourced 0.305 m of stripping that burial dominates:
   the toe pass (fraction ≈ 0.49) topped out at `0.49h − 0.918`, **below grade
   for every `h` under 1.87 m** — all but the last few metres of both banks —
   and the crest pass stood 0.22 m where 0.29 m was meant. Nothing said so: the
   export was valid, the material budget was met, the keep-clear passed and
   `glbinfo` reported plausible bounds. The two spoil windrows, buried
   0.35–0.40 m under a 1.2–1.7 m height, were only ~0.2 m low, which is why it
   stayed invisible until a bank had to be looked at. Height is now measured
   from grade.
4. **The preview camera was yawed 4.7° off the hero axis.** It aimed at a point
   *on the corridor* rather than *along the view axis*, so every NDC figure in
   this file was being judged against a frame that was not the game's. Fixed —
   and `check_frame()` now asserts all six NDC positions, the vanishing point
   and the two crests straddling the horizon on every build, so the module
   docstring cannot go quietly false. It also gives the four frame helpers a
   consumer, which is the other half of ASTRA §10.

Two smaller things came out of looking as well: the stone tracks read as
**decking** in plan (abutting slabs with nothing on them — they now carry loose
stone), and the bedding stone was the brightest object in the frame (palette
quietened).

**What the renders do not settle.** More than half the band is sky in the hero
shot. That is expected rather than evidence of a problem — the inspection
fixture has a flat grey plane where the game has `terrain.js`'s far field, which
this archetype drives at `farAmp: 0.55`, and the rig itself fills the near
frame — but it is exactly the kind of thing that has to be judged in the game
and has not been. So is whether the near-field ridge faces still read as too
large at 20 m once the procedural `dirt` texture is on them.

---

## 8. The edge artefact, and what this file does about it

`quarry_bench.py` records, at its foot, that geometry from a site model reaching
the **outer ~6 % of the surface band's width** comes back as vertical coloured
speckle — present in five of its captures, absent in the same frame with the
model hidden, unmoved when the geometry was rewritten twice. **The cause is not
diagnosed** and its mitigation is to keep geometry inboard of about NDC x −0.85.

A corridor cannot fully obey that: any line running to the horizon has to cross
that band somewhere. What this file does instead is choose **which** line
crosses it. The spoil-side ROW limit passes NDC x −0.99 at about **41 m** out
and is inboard of −0.88 by about **48 m**, and everything on it through that
stretch is **low dark earth** — the cut bank and the topsoil windrow. The
high-contrast thin verticals (the limit stakes and their flags, the marker
posts, the cones) are all on the working side, where the same limit runs from
+0.94 inward to +0.26. That is a deliberate placement, not a coincidence, and if
the artefact is ever diagnosed the constraint can be dropped.

---

## 9. THE GIVE-BACK — what `src/world/terrain.js` needs, and who owns it

**I do not own `src/world/terrain.js` and have not edited it.** This is the
precise request.

`blender/lib/site.py`, THE BUDGET: *"the archetype's terrain.js branch must give
back at least as many calls as the .glb takes, by dropping the procedural
geometry the .glb now carries."* This model costs **4 draw calls** (4 materials,
joined). The archetype must give back at least 4.

### 9.1 The change

`blender/lib/site.py` now prints this on every build of this module, and it
names the three fields it wants:

> `SITE_TODO archetype=infrastructure-corridor exists but declares no model, so
> this .glb is never fetched. terrain.js needs model:
> 'infrastructure-corridor', a replaces list of the scatters this model takes
> over, and replacesKit: true|false for its buildSiteKit() branch. Send those
> three to the runtime-integration owner; do not edit terrain.js.`

Here are the three, plus the ground request in §9.3. In
`ARCHETYPES['infrastructure-corridor']`:

```js
    model: 'infrastructure-corridor',
    replaces: ['outcrops', 'stones', 'scree'],
    // The authored windrows, cut lips, stone tracks and bedding ARE the loose
    // ground these three instanced scatters were standing in for on a worked
    // alignment — sprinkled before, authored now.
    replacesKit: true,
    flatR: 34, flatFalloff: 62, padCrown: 0,
```

`replacesKit: true` means the procedural branch stands down when the model is
live, the same way `urban` and `quarry` already do:

```js
    if (kit === 'corridor' && !siteModelReady()) {
```

**That gate is not optional here and it is where 2 of the 5 given-back calls
come from** — see §9.2. It is also correctness, not only cost: the procedural
corridor kit draws a live carriageway, a coned taper, an arrow board, a grab
lorry, a wheel wash and a hoarding-style running fence on a bearing of its own
(`AX = -0.633, AZ = -0.775`, about 2.6° off this model's alignment). Two
corridors 2.6° apart in one frame would be worse than either alone.

### 9.2 What the give-back actually is — measured statically, not predicted

**`replaces` gives back 3.** `outcrops`, `stones` and `scree` are loose rock
scattered on a radius, and this model authors the worked ground they were
standing in for. **I deliberately do not claim a fourth from the scatter list.**
`tufts` and `scrub` are the wrong ones to take: this archetype's identity is
*"cleared on the line, untouched a few metres either side of it"*, and deleting
the vegetation would delete the contrast the model exists to create.

**Suppressing the `kit === 'corridor'` branch gives back 2 more, and that is
measured off the source rather than guessed.** `makePropPool().build()` in
`terrain.js` does `if (!list.length) continue;` — **one mesh per surface class
that has content, and none for a class that is empty.** So the question is
exactly: *which surface classes does the corridor kit alone put geometry into?*
Counting every `put(…, 'class')` call site in `terrain.js` and attributing each
to its enclosing `if (kit === …)` branch by brace matching:

```
classes used OUTSIDE every kit branch (i.e. on every archetype):
    metal 33 · paint 12 · rubber 6 · matte 9 · glass 1
the corridor kit's classes:
    earth 2 · metal 12 · rubber 5 · slab 4 · matte 5 · paint 9 · glass 2
classes the corridor kit is the SOLE user of:  earth, slab   -> 2 pool meshes
```

`earth` and `slab` appear **only** inside kit branches anywhere in the file, and
exactly one kit branch runs per build — so with `corridor` suppressed both
buckets are empty and both meshes disappear. (`glass` does **not** count: one
call site outside every branch keeps it alive regardless. That corrects an
earlier guess in this note that `glass` would come back too.)

    give-back = 3 replaced scatters + 2 emptied pool classes = 5
    cost      = 4 materials, joined                          = 4
    net                                                       −1

**This is a static analysis of call sites, not the runtime number.** The real
measurement is `tools/checksiteenvironment.mjs`'s "a site model is measured
against what it actually gives back" test, which counts mesh submissions under
`terrain-root` with the model live minus the same build with it 404'd. Its own
recorded ceilings today are `{ 'quarry-bench': 3, 'urban-plot': 2 }` and it
measured `quarry-bench` at **+2 to +3** and `urban-plot` at **+0** — so neither
shipped site actually pays for itself and the gate records the overspend rather
than forbidding it. **The integration agent must run that test and add an
`infrastructure-corridor` entry to `CEILING` with whatever it actually
measures.** If it comes out worse than the static count says, the fix is to drop
`timber` — the mat run, stack, skids and centreline stake move to `dirt` with a
brown tint, which is worse but honest and takes the model to 3 materials. Do
that rather than raising `MAX_MATERIALS`.

### 9.3 Why `flatR` is asked for, and what happens without it

This archetype declares no `flatR` today, so `terrain.js` flattens only to
`CFG.padRadius` 8.5 m and the natural relief resumes immediately. A cleared
alignment **is** graded — that is what "cleared" means — so a flat is correct
here, and 34 m with a falloff to 62 covers the near two-thirds of the modelled
length while leaving the far end running into rising ground, which is the read
this site wants.

**The model does not depend on it.** Every ground form is built starting 1.8 m
below grade for exactly this reason, so relief under it cannot leave it
hovering. Without `flatR` the far windrows will sit lower into any rise; with it
they read as designed. `padCrown: 0` is asked for the same reason `urban-plot`
asks for it: the decorative pad crown fights the authored edge lip.

**A better fix exists and I am not asking for it in this pass.** `flatR`
flattens a *disc*, and a corridor wants a *strip*. A `flatStrip: { bearing,
halfWidth, falloff }` option in `terrain.js`'s `heightAt()` would flatten the
alignment and leave the country either side of it untouched — which is the
archetype's stated identity, expressed in the height function where it belongs
rather than in a mesh. That is a `terrain.js` design change and it is that
agent's call, not mine.

---

## 10. Findings in files I do not own

Reported rather than edited, per the brief.

### 10.1 The corridor's dressing is not corridor-aware — `src/world/terrain.js`

The archetype's own comment states its identity as *"cleared on the line,
untouched a few metres either side of it. That contrast IS the archetype"*, and
its `dress` keeps substantial vegetation (`spruce: 0.45, birch: 0.5, grass:
0.75, scrub: 0.8`).

But `scatter()` (terrain.js ~4491) samples an **annulus** — `a = rand.range(0,
TAU)`, `r = sqrt(lerp(minR², maxR², rand.f()))` — and its only directional
rejection is a view-corridor test, `if (opts.keepClear && Math.abs(x) < 6 && z >
8) continue`, plus a mast-bearing bias. **Nothing anywhere knows where the
alignment is.** So on every corridor contract today, the region's spruce, birch,
scrub and grass stand **inside the working strip**, which is the one thing the
archetype says can never happen.

The .glb cannot fix this: it can author the corridor but it cannot delete
another system's instances. **The fix is a corridor-aware rejection in
`scatter()`** — the same `flatStrip` bearing and half-width as §9.3 would serve
both — and it is worth more to this archetype than the model is.

### 10.2 Two site modules are being composed against two different cameras

While working, a second site agent's composition solver appeared in the shared
scratchpad deriving the frame from a **look-at target and `fov`/`aspect`**
(`atan(tan(17°) × 0.856)`, giving a half-width of **0.2618 d**).
`quarry_bench.py` states that the fov/aspect figures are wrong for the live
camera, and its **measured** half-width is **0.4023 d** — a factor of 1.54.

I have not verified which is right; I could not, without the GPU. But **two site
models composed against half-widths that differ by 54 % cannot both be framed
correctly**, and this is exactly ASTRA §5's "two tables describing one thing will
drift". Somebody with the GPU lease should re-measure the hero camera once,
write the result in one place, and have both modules read it. Today
`quarry_bench.py` is the only place the measurement is written down, which is why
this module copies it verbatim rather than re-deriving it.

### 10.3 `terrain.js` warns at `prims > 6`, `site.py` budgets **materials**

`loadSiteModel()` warns when a site model has more than 6 **primitives**;
`site.py` enforces 6 **materials**. After `finish()`'s join these are the same
number for a model with no moving parts, so the two agree today — but they are
different quantities and a site that ever parents anything under a `pivot:` node
would make them diverge silently. Worth one comment in `terrain.js` saying the
two are the same only because of the join. Not a bug today.

---

### 10.4 `tools/checksiteenvironment.mjs` fails on its own harness

Reproduced on a clean tree with **no corridor model declared**, so it is not
caused by anything in this work:

```
FAIL no site model stands in the hole: TypeError: Cannot read properties of null (reading 'parses')
    at GLTFLoader.parseAsync (tools/checksiteenvironment.mjs:173:12)
    at async tools/checksiteenvironment.mjs:839:20
SITE_ENVIRONMENT FAIL tests=23 failed=1 mode=cpu-real-loader
```

The gate monkey-patches `GLTFLoader.prototype.parseAsync` (line ~167) to record
each parse into `active.parses`, where `active` is the scenario currently under
test. The collar-throat test at line ~839 calls `new GLTFLoader().parseAsync(…)`
**directly, outside any scenario**, so `active` is `null` and the patched method
throws before the real parser is reached. The test can never have run. Two
plausible fixes for whoever owns `tools/`: guard the patch with
`if (scenario) scenario.parses.push(parsed)`, or have the collar test use the
untouched `originalParse`. **The collar-throat measurement it is meant to make
is a real one and this site depends on passing it** (nothing here comes within
`CLEAR_R` = 7.0 m of the collar, asserted over every exported vertex), so it is
worth fixing rather than deleting.

Also worth noting for whoever wires this in: the same file already carries
`const CEILING = { 'quarry-bench': 3, 'urban-plot': 2 }`, and it needs an
`infrastructure-corridor` row — with a measured number, not an assumed one.

---

## 11. Outstanding issues, honestly

0. **IT IS NOT WIRED IN, AND IT MUST NOT SHIP UNTIL IT IS.** `terrain.js`
   declares no `model:` for this archetype, so the game never fetches this file.
   `node tools/checksites.mjs` says so in its own words today:

   > FAIL  `infrastructure-corridor.glb` is named for archetype
   > "infrastructure-corridor", which declares no `model:` in
   > `src/world/terrain.js`. 2.42 MB that ships in the build and is never
   > fetched. Either declare the model on the archetype or delete the export.

   That is `research/CRITIQUE.md` finding 15 — *"dist/ ships 35.7 MB of models
   that can never be requested"* — waiting to happen again, and it is the exact
   shape of the six-of-eight-machines failure. **Section 9 is the change that
   fixes it and it belongs to the integration agent.**
1. **No in-game capture exists.** Everything visual in this note is from offline
   Blender CPU renders of the exported `.glb`. The model has never been on
   screen in the game, its draw-call cost has never been measured warm, and the
   give-back in §9.2 is a static source analysis rather than the runtime number.
   **This is not finished until `tools/checksiteenvironment.mjs` has measured
   the net and `tools/shoot.mjs --headed` has run on a corridor contract.**
2. **The hero camera was not re-measured** (§5, §10.2).
3. **The give-back is 3 measured + 1 predicted** (§9.2).
4. **`terrain.js` still scatters trees into the alignment** (§10.1); until that
   is fixed the model's central contrast is fighting the dressing.
5. **The spoil-side limit crosses the unexplained edge-artefact band** (§8).
   Mitigated by putting only low dark earth there; not fixed, because the cause
   is not known.
6. **Nine small objects are NOT SOURCED** (§6). Every one is marked in the
   module. The two that would most repay another hour with a live search budget
   are the wooden skid spacing and the ROW limit-stake pitch.
