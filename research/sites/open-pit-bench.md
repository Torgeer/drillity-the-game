# Open-pit bench — Blender environment reference

Research and authoring notes for `blender/sites/open_pit_bench.py`, which
exports `public/models/sites/open-pit-bench.glb`. Checked 2026-09-06.

Read alongside `research/16-site-archetypes.md` §A.5 (the archetype pack),
`blender/lib/site.py` (THE BUDGET, the axes and the origin contract),
`blender/sites/quarry_bench.py` (the neighbouring archetype this one is
deliberately separated from) and `ASTRA.md` §1 and §5.

This is a **fictional pit**. Its plan outline, its depth, where the player
stands in it and the placement of every machine are authored composition. What
is *not* fictional is the engineered geometry those things are made of: bench
height, bench face angle, catch-bench width, inter-ramp angle, ramp width, ramp
grade, safety-berm height and the blast pattern all come from published
sources and are used at true scale. The line between the two is drawn in the
module at every constant, and it is drawn again below.

No real manufacturer name, model designation or mine name is exported. Real
spec sheets are cited here and in code comments because that is where accuracy
comes from; the marque is invented and, in this file, absent entirely — nothing
in the export carries lettering of any kind (`DOMAIN.md` §10, `ASTRA.md` §1.2).

---

## 1. How this reads differently from `quarry-bench`

This was the hardest constraint in the brief: `quarry-bench.glb` already exists
and is a good blasted highwall, so the risk was two models of one picture. The
two are separated on six axes, and every separation is a fact about the two
industries rather than a styling choice.

| | `quarry-bench` | `open-pit-bench` |
|---|---|---|
| **The subject** | ONE wall on ONE side at 34 m; the floor opens past it to a drop | A BOWL: a bench stack closing 360° around the player, seen across 190 m of pit floor |
| **Where you are** | *beside* a face | *inside* a hole |
| **Scale, and its provenance** | face height 7.5 m, explicitly **NOT SOURCED** — §A.4 found no regulation names one, so it is solved against the frame and says so | bench 15 m, face 70°, berm 8.0 m, inter-ramp 48.1° — every one published, at true scale. **One bench here is twice the whole quarry wall** |
| **The thing beyond** | the PLANT: crusher, trestle conveyors, graded stockpiles, misting cannons | MORE PIT. There is no crusher, no conveyor, no stockpile and no product in this file, and that absence *is* the archetype |
| **The haul road** | runs off the bench and out of shot, on the flat | CLIMBS THE WALL at a sourced 10 % on a sourced 33.5 m width, cutting the bench stack — the only diagonal in a frame of horizontals, and the reason the overall slope (40.36 deg) is flatter than the inter-ramp (48.10 deg) |
| **The pattern** | 102 mm holes, 2.55 m burden, 2.93 m spacing | 203 mm holes, 6.090 m burden, 7.917 m spacing — the grid reads coarser at the same range because it *is* coarser |
| **The fleet** | none in shot | a face shovel loading a truck at a muckpile, a production rotary drill, and a loaded truck on the ramp. A 120 m wall has no scale without them |
| **Where the triangles go** | into the face at 34 m, where `rubble()` earns them | into the near field. The far wall is **not** built from `rubble()` — not because it is too small to see (a 1.5 m block out there is 8–10 px) but because the game's own fog is 68–95 % across it and because build time is quadratic in object count. See §5.2a |
| **Sky** | the crest sits at NDC +0.72; the top seventh of the band stays open | the sky is closed. The archetype's own note is *"no edge of the property in sight"*, and `farAmp: 0.35` exists to stop the region's ridge competing |
| **What carries the read** | a face at 34 m: silhouette and `rubble()` | a wall whose every horizontal surface is **above the eye and therefore seen from underneath**. The read is carried entirely by vertical elements — the containment lips, the ramp berm, the face value. This is the single most useful finding of the pass and it is written up in §5.2 |

The one thing they share on purpose is the hero-frame solve and the vertex-colour
value step, because both are properties of the renderer, not of the place.

---

## 2. Sources, with URLs

### 2.1 Bench geometry — the core of the model

| key | source |
|---|---|
| `[RYAN-PRYOR]` | Ryan, T.M. & Pryor, P.R. (2000), *Designing Catch Benches and Interramp Slopes*, Ch.3 of the SME slope-design reference, hosted by Call & Nicholas Inc. — <https://www.cnitucson.com/publications/2000_ch3__Catch%20Bench_sme_tr_pp.pdf> |
| `[CMM-43-101]` | Copper Mountain Mine NI 43-101 Technical Report, 5 Dec 2023, Section 16 / Table 16-1 — <https://s23.q4cdn.com/405985100/files/doc_downloads/tech_reports/canada/cmm-ni-43-101-technical-report-dec-5-2023.pdf> |
| `[NIOSH-MRC]` | Warren, S. et al. (NIOSH), *Revisiting Rockfall Catch Bench Design Criteria: Initial Rockfall Testing Results from the Golden Chest Mine, ID* — <https://stacks.cdc.gov/view/cdc/215575/cdc_215575_DS1.pdf> |
| `[SRK-BFA]` | Gibson, de Bruyn & Walker (SRK), *Considerations in the Optimisation of Bench Face Angle and Berm Width Geometries for Open Pit Mines*, SAIMM — <https://www.saimm.co.za/Conferences/RockSlopes/557-578_Gibson.pdf> |
| `[PSU-MNG230]` | Penn State MNG 230, *Pit Terminology* — <https://courses.ems.psu.edu/mng230/node/877> |
| `[MSHA-56.3130]` | 30 CFR 56.3130, *Wall, Bank, and Slope Stability* — <https://www.law.cornell.edu/cfr/text/30/56.3130> |

**What each one gave:**

- **Bench height 15 m.** `[RYAN-PRYOR]`: *"most large mining operations drill
  and blast on 12- to 15-m intervals (40 to 50 ft), with 15-m intervals being
  the most common"*. `[CMM-43-101]` Table 16-1 uses 15 m single benches (and
  30 m double benches) at a real, permitted, operating pit.
- **Bench face (batter) angle 70°.** `[CMM-43-101]`: batter angles by
  geotechnical zone run 37° and 59.7–73.7°, *most commonly 70°*. `[SRK-BFA]`
  independently analysed 65/75/85/90° and concluded *"a bench face angle in the
  order of 75° is optimal"* and *"angles as low as 65° should be avoided if
  possible"* — 70° sits inside that and is what the real design uses.
- **Catch bench 8.0 m.** `[CMM-43-101]`'s single-bench catch benches run
  8.0–14.4 m; the model uses the narrowest, because the narrowest is the one
  that has to be defended. The defence is `[RYAN-PRYOR]` EQ 3.1, the **Modified
  Ritchie Criterion**: *bench width (m) = 0.2 × bench height + 4.5 m*, which
  for a 15 m bench is **7.5 m**. 8.0 clears it. `_verify_geometry()` asserts
  this on every build, so the pair cannot silently drift.
- **The Modified Ritchie Criterion's own provenance, which matters.**
  `[NIOSH-MRC]` records that *"Call [1986] developed the MRC based on [Ritchie
  1963] rockfall testing for highway design"* — i.e. it is an extrapolation
  from **highway** rockfall ditches to mining catch benches — and that NIOSH is
  currently revising it (2022–2026 Highwall Safety project) because catchment
  performance depends on more than bench height. The criterion is used here as
  a *check*, never printed as a rule.
- **The regulator prescribes nothing.** `[MSHA-56.3130]`: *"When benching is
  necessary, the width and height shall be based on the type of equipment used
  for cleaning of benches or for scaling of walls, banks, and slopes."* A
  performance standard with no number. This matters because §A.4 reached the
  same finding for quarries, and it means neither archetype may print a bench
  dimension as a legal fact.
- **The relation.** `[RYAN-PRYOR]` Fig 3.1: `tan(ψ) = H / (W + H·cot β)`.

### 2.2 The check that makes the geometry trustworthy

The module reproduces a **different published row of the same report** from
first principles. `[CMM-43-101]`'s New Ingerbelle-10 sector is a 30 m double
bench at a 70° batter with a 14 m catch bench, and the report prints an
inter-ramp angle of **50.3°**. The relation gives:

```
atan( 30 / (14 + 30/tan 70°) ) = atan( 30 / 24.92 ) = 50.29°
```

That is the report's own number to 0.01°. It is asserted in
`_verify_geometry()` and the build **fails** if it ever stops holding. It is
the strongest evidence in the module that the relation and the constants are
being used the way their authors meant them.

The model's own stack then gives:

```
face run   = 15 / tan 70°               =  5.460 m
module     = 5.460 + 8.0                = 13.460 m out per 15 m up
inter-ramp = atan(15 / 13.460)          = 48.10°   (inside CMM's 24-55°)
overall    = atan(120 / (8*13.460+33.5))= 40.36°   (the ramp, in the profile)
```

The build prints exactly that line before it writes anything:

```
PIT_GEOMETRY bench=15.0m face=70deg berm=8.0m (MRC 7.5m) module=13.460m              interramp=48.10deg overall=40.36deg depth=120m
PIT_ROAD     ramp_w=33.5m (AASHO 4x8.295=33.18m) grade=10%              berm=1.80m (mid-axle 1.790, rolling r 1.705)
PIT_SHOT     hole=203mm burden=6.090m spacing=7.917m stemming=4.263m S/B=1.30
```

### 2.3 Haul road, ramp and safety berm

| key | source |
|---|---|
| `[KAUFMAN-AULT]` | Kaufman, W.W. & Ault, J.C. (1977), *Design of Surface Mine Haulage Roads — A Manual*, US Bureau of Mines IC 8758 — <https://archive.org/details/designofsurfacem00kauf_0> |
| `[MSHA-56.9300]` | 30 CFR 56.9300 / 57.9300, *Berms or guardrails* — <https://www.law.cornell.edu/cfr/text/30/56.9300>, <https://www.law.cornell.edu/cfr/text/30/57.9300> |
| `[MSHA-56.9301]` | 30 CFR 56.9301, dumping locations — <https://www.law.cornell.edu/cfr/text/30/56.9301> |

- **Ramp width 33.5 m.** `[CMM-43-101]`: *"Ramp widths are designed at 33.5 m
  when accommodating dual-lane traffic. In the few cases where single-lane
  traffic is required, a designed ramp width of 25 m is used."*
- **And it is cross-checked against the truck.** `[KAUFMAN-AULT]` quotes the
  1965 AASHO rule: each lane of travel should provide clearance left and right
  *"equivalent to one half the vehicle width"*, i.e. a lane ≈ 2 × vehicle
  width. The truck modelled here is 8.295 m over the canopy, so a two-lane road
  is 4 × 8.295 = **33.18 m** against the published **33.5 m**. Two sources that
  know nothing about each other, one from 1977 and one from 2023, agree to 1 %.
  Asserted on every build.
- **Grade 10 %.** `[CMM-43-101]`: *"All ramp grades are designed at 10%."*
  `[KAUFMAN-AULT]` independently: *"Many mine operators have found optimum
  operating conditions reflected on maximum sustained grades no greater than 7%
  to 9%"*, *"Many State laws and regulations establish 10% as a permissible
  maximum sustained grade"*, and *"it is reasonable to accept 10% as maximum
  safe sustained grade limitation"*. The trade-off named in the manual is truck
  cycle time against braking capability and retarder heat.
- **Safety-berm height 1.80 m, and two authorities happen to agree.**
  `[MSHA-56.9300]`, binding: *"Berms or guardrails shall be at least mid-axle
  height of the largest self-propelled mobile equipment which usually travels
  the roadway."* Mid-axle height on the modelled truck is half the published
  tyre outside diameter, 3.579 / 2 = **1.790 m**. `[KAUFMAN-AULT]`, engineering
  rule of thumb: *"its height must be equal to or greater than the rolling
  radius of the vehicle's tire"* — the same tyre's published rolling
  circumference of 10 711 mm gives a rolling radius of **1.705 m**.
  `[PSU-MNG230]` restates the second. 1.80 m clears all three; every one of
  them is a *minimum*, so rounding up is the only safe direction. Both are
  asserted on every build.
- **Delineators.** `[MSHA-56.9300]`'s own exception for infrequently-used
  roadways names warning signs, delineators and posted speed limits as what
  stands in for a berm. On a working ramp you get both, and the model draws
  both. **No number is lettered on anything** — at 70–200 m a painted figure is
  sub-pixel, and an unreadable number is not a citation.

### 2.4 The blast pattern

| key | source |
|---|---|
| `[OSMRE-ROT]` | US OSMRE, *Blast Design Rules of Thumb* (2016) — <https://www.osmre.gov/sites/default/files/inline-files/5rulesofThumb2016_0.pdf> |
| `[OSMRE-BLAST]` | US OSMRE, *Surface Blast Design*, Module 3 — <https://www.osmre.gov/sites/default/files/inline-files/Module3_0.pdf> |
| `[NAT-BLAST]` | Open-pit blast design and bench geometry — <https://www.nature.com/articles/s41598-025-90242-6> |
| `[PQ-L4]` | *Pit & Quarry* University Lesson 4 — <https://www.pitandquarry.com/pq-university-lesson-4-drilling-and-blasting/> |
| `[EPIROC-BH]` | surface blasthole rig class band, via `research/16` §G. **Cited for the class capability band only** |

- **Hole 203 mm (8 in)**, chosen because it is the one diameter three
  independent constraints all admit: `[EPIROC-BH]`'s 152–406 mm surface
  blasthole band; `research/03`'s 27–229 mm for the tracked surface crawler
  class, which is what `data.js` sends here as the hero rig; and the 203–311 mm
  published range of the production drill modelled at the far end of the same
  pattern. Drawing a pattern that neither machine in the frame could have
  drilled is exactly what §A.5 complains about.
- **Burden 6.090 m** — `[OSMRE-ROT]`: `B(ft) = 2 to 3 × d(in)`, typically 2.5.
  203 mm is 7.992 in, so 2.5 x 7.992 = 19.98 ft = 6.090 m. The rule is
  sourced; the arithmetic is the module's, and it is done on the metric
  diameter rather than on a rounded 8 in.
- **Spacing 7.917 m** — `[OSMRE-ROT]`: `S = 1 to 2 × B`. 1.3 × B.
- **Stemming 4.263 m** — `[OSMRE-ROT]`: `T = 0.5 to 1.0 × B`, typically 0.7.
  `[PQ-L4]` and `[OSMRE-BLAST]` both require it to be sized crushed stone or
  drill cuttings, against the *"rifle"* or *"gun-barrel"* effect; `[PQ-L4]` adds
  that front-row stemming is increased where the face is less than 90°, which
  on a 70° batter it always is.
- **A cross-check that deliberately fails one way.** `[NAT-BLAST]` measured a
  real open pit at burden 3–3.5 m, spacing 3.5–6 m, stemming 1.5–4.0 m — all
  smaller than the above. That is not a contradiction: the same paper records
  **hole depths of 3.5–10.5 m** at that pit, i.e. benches roughly half this
  one's height. Burden scales with hole diameter, which scales with bench
  height. The pattern here is deliberately outside `[NAT-BLAST]`'s range and
  the reason is written down rather than the range being quietly quoted as
  cover.
- **Powder-factor sanity, derived not sourced.** 15 m bench + subdrill ≈ 16.5 m
  hole, less 4.26 m stemming = 12.2 m of 203 mm column = 0.395 m³; at ANFO's
  ≈0.85 t/m³ that is ≈336 kg against 6.090 x 7.917 x 15 = 723 m3 of rock, or
  **0.46 kg/m³** — inside the band ordinary surface production blasting runs
  at. This is the check that says the three constants are mutually consistent
  rather than merely each individually inside a range.
- **Two drill classes on one bench** — `research/16` §A.5 `[GF-STIVES]`,
  `[DMA-GC]`. Grade control is *"generally expedited by inclined RC drilling on
  grids determined by the ore body characteristics"*; RC *"supports fast
  sampling cycles and adapts well to confined in-pit environments"*. The model
  draws the inclined grade-control collars **and** the production rotary drill,
  because §A.5's central complaint is that the game draws one machine for both.

### 2.5 The fleet — real dimensions, invented (and absent) marque

All three machines are modelled from manufacturer specalogs read directly as
PDFs. Nothing in the export carries a name, a model designation or a badge.

| machine | dimensions used | source |
|---|---|---|
| **226.8 t rigid-frame haul truck** | overall length 13.702 m; overall canopy width 8.295 m; height to top of ROPS 5.597 m; wheelbase 5.905 m; nominal payload 226.8 t (250 short tons); overall tyre width 7.605 m | manufacturer specalog AEHQ6868-01 (02-2013) — <https://www.kellytractor.com/eng/images/pdf/earthmoving/offhighway_trucks/793F.pdf> |
| **its tyres, 40.00R57** | outside diameter 3.579 m (140.9 in); rolling circumference 10 711 mm | tyre-maker data for that size — <https://otrtires.com/product/40-00r57-michelin-xdr2-e4-mb4/> |
| **~570 t hydraulic face shovel** | face-shovel bucket 34.0 m³ heaped 2:1; operating weight 569–570 t; boom 8.0 m, stick 5.1 m; max digging height 15.5 m, max digging reach 16.4 m; basic unit ≈7.6 m high on 8.7–8.8 m tracks, 7.0–9.2 m wide | manufacturer specalog AEHQ7161-01 — <https://www.teknoxgroup.com/fileadmin/user_upload/6060_6060FS_eng.pdf> |
| **rotary blasthole drill** | mast configuration 13.7 m (= single-pass depth); overall height mast up 19.93 m; body length 13.27 m; width front 5.39 m, rear 6.32 m; hole 203–311 mm; triple-grouser shoes 600 mm | manufacturer specalog AEHQ8038-03 (07-2019) — <https://www.teknoxgroup.com/fileadmin/user_upload/md6310.pdf> |

**Two things worth recording about reading those sheets:**

1. **The drill's mast height is not its mast rating.** The specalog gives
   13.7 m as a *mast configuration* and, on the same row, 13.7 m as the
   *single-pass depth* — that number is drilled depth, not steel. The published
   *overall height mast up* for the same configuration is 19.93 m. Building a
   13.7 m mast would have made the machine six metres too short against its own
   datasheet. The model builds to 19.93 m and says so.
2. **The shovel is deliberately a class above what §A.5 quotes.** §A.5's
   150–350 t excavator figure comes from `[GF-STIVES]`, one gold operation
   working 5–10 m benches. This pit works 15 m benches and hauls with a 226.8 t
   truck, and the shovel has to match the truck: 34.0 m³ heaped at a loose
   density around 1.8 t/m³ is ≈61 t a pass, filling this truck in three to four
   passes, which is the standard pairing. A 150 t shovel on a 226.8 t truck
   would be seven passes, and that mismatch is exactly what a mining engineer
   reads first.

---

## 3. What could NOT be sourced

Recorded here as gaps, not filled with plausible numbers. `ASTRA.md` §1.1: *a
plausible invented number is worse than an admitted gap.*

| gap | status |
|---|---|
| **The pit's plan outline, its depth, and where the player stands in it** | **NOT SOURCED, and it never will be** — a pit's outline is its orebody's. `TOE_R`, the toe wander, `N_BENCH`, the mid lift's azimuths and the ramp's phase are authored composition solved against the hero frame, are labelled as such in the module, and must never be quoted back as mining facts. |
| **Angle of repose of blasted rock; swell/bulking factor of blasted hard rock** | **NOT SOURCED.** This is the number the model most wanted. No primary geotechnical or blasting-engineering source could be reached this pass; Wikipedia's own angle-of-repose article was checked directly and carries no sourced value for broken rock. The commonly repeated 35–45° and 1.3–1.4× are **not used and do not appear in the module**. The muckpile is built as a *mass* of stated block size with `site.rubble()`, so its shape emerges from the blocks rather than from an asserted angle — the same decision `quarry_bench.py` made. |
| **Muckpile fragmentation / block size** | **NOT SOURCED.** `[OSMRE-BLAST]` gives fragmentation only as a *consequence* of burden, spacing and stemming and prints no size. The 1.4 m used is authored; the only defence is that it is at the scale a 34 m³ bucket picks up rather than at the scale of the envelope, which is the failure `site.rubble()`'s own docstring records. |
| **Backbreak magnitude** | The *phenomenon* is sourced — `[RYAN-PRYOR]` defines backbreak as *"the horizontal distance between the planned toe and the actual mined crest of the final bench slope"*. Its **magnitude is NOT SOURCED**; ±2.4 m of crest height and ±1.6 m of crest radius are authored. |
| **Containment-berm height on a 15 m bench** | `[RYAN-PRYOR]`'s design table publishes **1.5 m on a 12 m bench** and **2.1 m on a 24 m double bench**. 15 m is between them. The module uses the published 1.5 m rather than interpolating, because an interpolation between two design values is a third value nobody published. |
| **Grade-control grid pitch and hole inclination** | `[GF-STIVES]` says explicitly that grade-control grids are *"determined by the ore body characteristics"*, so there is no number to cite. The 9 m pitch and 60° inclination are **NOT SOURCED**. What *is* sourced is that the holes are **inclined**, and they are drawn inclined. |
| **The "3.5 × vehicle width" haul-road multiplier** | **DELIBERATELY NOT USED.** It is attributed everywhere to `[KAUFMAN-AULT]` Table 9, and in the only retrievable copy of that manual Table 9 is a scanned *graphic* — the multiplier cannot be read from the primary document. A published ramp width from a real design plus the AASHO half-vehicle-width principle (both readable) is worth more than a multiplier nobody can check. |
| **Spacing/burden 1.15 for equilateral patterns** | **NOT USED** — could not be traced to a primary source. `[OSMRE-ROT]`'s 1–2 × B range is used instead. |
| **An exact published formula relating overall slope angle to inter-ramp angle** | **NOT FOUND.** The relationship is real and stated qualitatively everywhere (the overall slope is flatter because ramps cut into the wall) but no primary source for a formula was located. The module therefore *derives* its overall slope from its own geometry — 120 m over (8 x 13.460 + 33.5) = **40.36 deg** — and labels it derived rather than citing it. |
| **Liebherr T 284 / Epiroc PV271 / Sandvik D75KS dimensions** | **Not obtained** — manufacturer pages returned 403/404 to automated fetch. No aggregator figures were used. The three machines modelled are the three whose specalogs were read in full. |
| **Haul-road signage conventions, water-truck capacities, ANFO truck dimensions, light-plant masts** | **Not researched to a primary source.** None of them is in the model. `research/16` §A.5 independently flags haul-road water carts as `NOT SOURCED`: *"model them, do not cite them"* — this file does neither. |
| **The horizontal half-width constant of the hero frame** | See §4. Inherited, not re-measured, and it does not reconcile with the declared fov by a factor of 1.26. |

---

## 4. The camera, and an honest limit on it

The composition is solved against the hero-frame constants **measured by
`blender/sites/quarry_bench.py` on 2026-09-05** and reused here. They were not
re-measured in this pass: the shared GPU lease on this machine is held by
another track, so no headed capture was available, and `ASTRA.md` §5 is
explicit that a second ruler is worse than one.

Two independent checks were run instead:

- The eye position is `CAMERA_MODES.hero.pos` in `src/core/renderer.js`
  verbatim — three.js `[8.40, 2.25, 10.94]` — and the module's plan direction
  reproduces `hero.look` `[-1.55, 2.60, 0.00]` to four decimals. **The camera
  mode is global, not per-archetype**, so a measurement taken on the quarry is
  the same camera this site gets.
- The vertical half-angles are self-consistent with a 20.97° vertical field
  pitched 1.36° up: `atan(0.2065) − 1.36 = 10.31°` and
  `atan(0.1638) + 1.36 = 10.66°`, agreeing to a third of a degree.

**What is not verified is the horizontal constant.** `HALF_W_K = 0.4023` does
not reconcile with `tan(34°/2) × refBandAspect = 0.3185` derived from
`CAMERA_MODES.hero.fov` and `renderer.js`'s own `fovForBand()`, a factor of
1.26 that is unexplained. `fovForBand()` holds the *horizontal* field constant
across band aspects while the vertical field varies with how much chrome the
HUD carves off, so `HALF_W_K` should be layout-invariant and `TOP_K`/`BOT_K`
should not — which is the opposite of what one would want to inherit.

**The site is built so that the gap does not decide the picture.** Its subject
is a ring closing 360°, so it fills the frame at any horizontal field, and its
vertical composition was solved against **both** candidate frames:

| | measured frame (0.2065 / 0.1638) | wider frame implied by fov 34 |
|---|---|---|
| toe of the far wall | NDC y −0.17 | −0.12 |
| bench 1 crest | **+0.21** | **+0.11** |
| bench 2 crest | +0.56 | +0.32 |
| bench 3 crest | +0.86 | +0.51 |
| bench 4 crest | +1.13 (top edge) | +0.67 |
| bench 5 crest | +1.38 | +0.82 |
| bench 6 crest | +1.60 | +0.95 |
| bench 7 crest | +1.80 | +1.07 (top edge) |
| bench 8 crest | +1.98 | +1.18 |

Three crest lines inside the band on the narrow reading and seven on the wide
one; the sky is closed with at least a whole bench to spare on both. That is a
bench stack either way, and it is why the wall is eight benches rather than the
four the narrow frame alone would need.

**This should still be re-measured on a headed capture before the site is
signed off.** It is the largest single unknown in the file.

---

## 5. Composition, and where the triangles went

### 5.1 The three ranges

| range | what is there | why |
|---|---|---|
| **10-50 m** | the production pattern being drilled, collars, stemming heaps, flags, the inclined grade-control grid, drill-pad fines, spilled shot rock | 1 m = 88-39 px, fog ~3 %. The only place small authored detail survives, so this is where it goes |
| **80-130 m** | the mid lift - one 15 m bench standing over the ground to screen-right - its catch bench, the muckpile off its face, the face shovel and the truck it is loading, the near half of the floor haul road | 1 m = 25-15 px, fog ~20 %. Silhouettes read fully; this is the only place `site.rubble()` is spent |
| **190-330 m** | the production rotary drill on the floor; the far wall's eight benches; the haul ramp and its safety berm; the loaded truck on the ramp | 1 m = 10.5-6.0 px, fog 68-95 %. Carried by crest line, vertical relief and silhouette |

*(1 m of world = 740 px / (0.3703 x d), the measured frame's vertical extent
over the surface band. **An earlier draft of this table said 3.5 px at
200-330 m and that is wrong by a factor of three** - it came from mixing an
angular figure with a per-degree one. The corrected numbers are three times
larger, they change the argument in 5.2a, and that argument is re-made there
rather than re-asserted.)*

**The road is one object from the player's feet to the top of the wall.** It
leaves the floor at the ramp foot (psi = -14 deg, NDC x ~ -0.56), and the floor
section's far end is *derived from* that point rather than eyeballed near it -
two separately placed roads that nearly meet is a near-miss that reads instantly
as a mistake and that nobody notices while authoring, because from directly
above in the Blender viewport the gap is one pixel. From there the ramp climbs
at the sourced 10 %, gaining **0.35 m per degree of azimuth**, so across the
~37 deg of wall still in frame it rises **12.8 m - most of one bench.** That is
shallow, and it is shallow because a haul ramp *is* shallow. A ramp drawn steep
enough to look dramatic is exactly what a mining engineer reads in two seconds.

### 5.2 THE FINDING: the eye is at 2.25 m, so every horizontal surface on the wall is seen from underneath

This is what the first render found, it is the single most useful result of the
whole pass, and **no amount of arithmetic would have produced it.**

The first version of this file was composed on the assumption that the bench
stack would read from *"the value step between a vertical face standing in its
own shade and a horizontal catch bench facing open sky"* - which is what
`src/world/terrain.js` authored for its own procedural pit, and it measured that
step at about **2.3 : 1**. That step is real. From a camera **above** the
benches - an aerial, or a shot from the rim looking down - it is the whole
picture.

**From the pit floor it does not exist.** The hero eye is at 2.25 m and the
lowest catch bench is at 15 m. Every bench top on that wall is above the eye
line, so what is in frame is its *underside*. The first render came back as one
flat grey wall with no benches in it - and the diagnosis was initially wrong
too: the assumed cause was that COLOR_0 was not reaching Base Color in the
offline render. It was. Blender's glTF importer wires a Color Attribute node
itself when a primitive carries COLOR_0, and re-rendering with an explicit node
produced a pixel-identical frame. *The cause was geometry, not material.*

So the composition was moved onto the surfaces that are actually visible, all of
which are **vertical**:

| element | height | at 205 m | what it does |
|---|---|---|---|
| **containment lip** on each catch bench's outer edge | 1.5 m | **~14 px** | *this is the crest line.* It is sourced geometry ([RYAN-PRYOR]'s design berm) and on a real pit wall it is exactly why you can count the benches from across the hole |
| the 8 m catch bench it stands on | - | **~4 px, and those 4 px are its underside** | closes the geometry; contributes almost nothing to the read |
| **the ramp's safety berm** | 1.80 m | ~17 px | the running surface is 5-13 m up and therefore invisible; the berm's outer face plus the road slab's own 1.1 m edge **are** the diagonal |
| the bench face | 15 m | ~145 px | carries per-segment and per-bench value variation |

The lip is three and a half times the read of the surface it protects. It is now
drawn on **every** bench inside the hero arc, not just the low ones - an earlier
version limited it to four benches on the strength of the wrong pixel figure.

### 5.2a Why the far wall is still plain boxes and not `rubble()`

`site.rubble()` exists because *"a blasted face's outline is broken at every
scale and a box's is straight at every scale"*, and on `quarry-bench` - a wall
at 34 m - it is unarguably right. With the corrected arithmetic a 1.5 m block
out here is **8-10 px**, so the honest reason is no longer "it would be
invisible". It is two other reasons, and they are worth stating plainly rather
than hiding behind a wrong number:

1. **Fog.** At rho = 0.0052 this wall is 68 % fog colour at its toe and 95 % at
   its crest. Per-block contrast is crushed by an order of magnitude, while a
   long continuous high-contrast horizontal - the crest line - survives
   proportionally.
2. **Build time.** `blender/lib/rig.py`'s `box()` costs two `bpy.ops` calls and
   each walks the scene, so authoring cost is quadratic in object count. The
   wall is already ~1 500 objects and six minutes; rubble on every face would be
   ~20 000 and would not finish.

What the wall *does* buy in the crest line:

- per-segment **backbreak** ([RYAN-PRYOR] defines the phenomenon; its magnitude
  is NOT SOURCED). +-2.4 m of crest height is ~23 px of wander on an 8.8 m
  (31 px) segment - a ragged skyline rather than a machined edge;
- per-segment **toe wander**, on a ~40 deg wavelength, so the plan outline reads
  as a shape rather than a jitter and never as a lathe operation;
- per-segment **and per-bench** face value variation. The first version used
  only the segment term over a 20 % spread and the wall came back as ruled grey
  panelling.

### 5.2b What the wide renders found - one real bug, one wrong finding

Both were invisible in the hero view. **`-bowl.png` and `-profile.png` earned
their render time**, and one of the two things they turned up was my own wrong
diagnosis, which is recorded here rather than deleted.

**1. REAL: a negative backbreak opened a horizontal slot of sky through the
wall.** `crest_z` carries +-2.4 m of backbreak, but the bench *above* still
started at its own nominal `z_hi`. Wherever the wander was negative that left a
slot up to 2.4 m tall and 8 m deep at the catch-bench level, open right through
120 m of rock - bright slots, plainly visible in the first `-profile.png`. Each
face now starts at the crest below it, so the extra is the batter's own
continuation down to its toe and lands on the catch bench, which is exactly
where the rock is. Zero extra objects.

**2. REAL: the crest lines were dashes, not lines.** The containment lip is the
element that draws each bench line (5.2), and it stands 1.5 m - about 14 px at
205 m. It was being placed on `crest_z`, which carries +-2.4 m of backbreak,
i.e. **more than twice the visible height of the thing drawing the line**. The
result was a scatter of bright dashes at different heights rather than a
horizontal. The fix is physical, not cosmetic: a blasted rock crest and a dozed
containment berm are not the same line. The berm is pushed up by a dozer
travelling along the bench and is far more regular, so it now sits on its own
smoothed `berm_z` (+-0.7 m) while the rock face keeps its honest +-2.4 m. The
catch-bench slab went from 1.3 m to 4.0 m thick at the same time, to bridge a
crest that backbreak may have left below the dozed line.

**3. WRONG, and this is the more useful entry.** `-bowl.png` showed the mid
lift's plateau as a radial fan of bright strips with dark wedges between them,
and the finding written up here first was that the slabs had been sized on their
mean radius, were too narrow at their outer end, and had fanned into separate
fins. **They had not.** Measured afterwards:

```
OLD (mean arc)   box length 7.55 m
   at r= 91.3  sector chord 3.51  OVERLAP 4.05 m
   at r=144.7  sector chord 5.55  OVERLAP 2.00 m
   at r=198.0  sector chord 7.60  GAP     0.05 m     <- five centimetres
NEW (outer arc)  box length 9.60 m
   at r=198.0  sector chord 7.60  OVERLAP 2.00 m
```

A five-centimetre gap at one edge is not a fan. What the render actually shows
is **height corrugation**: each plateau segment takes the mid lift's own +-1.9 m
crest wander, so neighbours can sit 3.8 m apart in height on a slab 1.4 m thick,
and the "wedges" are the shaded *sides* of those steps seen from a camera 240 m
up. There is no hole - the slabs overlap tangentially by 4 to 6 m throughout.

It is **left uncorrected, deliberately.** Every game camera is below that
surface: hero 2.25 m, orbit 2.70 m, menu 4.20 m, mast 8.60 m, plateau 14-15 m.
Its top is never in frame. A rebuild costs thirteen minutes of a machine seven
other site builds are sharing, and spending that on a surface no player can see
would be the wrong trade. The sizing change was kept because it is free and
strictly better, but it fixed a defect that did not exist.

**That is two wrong findings in one pass** - this one and the pixels-per-metre
error in 5.1 - both caught by measuring afterwards rather than by reasoning.
`ASTRA.md` 10 says an approximation in an instrument becomes a false finding in
a report; the same is true of an eyeball diagnosis from a render. **Look at the
render to find WHERE to measure. Do not let it tell you WHAT the number is.**

**4. Smaller:** the loading tableau was at 65 m, where a 13.7 m truck is 386 px
of a 1480 px frame - a quarter of the picture, centre-right, in front of the
machine the player is supposed to be looking at. Moved along the lift's face to
80-95 m and against the right edge.

### 5.3 The fog is part of the composition

`src/core/env.js` runs FogExp2 at densities 0.0035–0.0150 by region and
weather. FogExp2 is `1 − exp(−(d·ρ)²)`, so at ρ = 0.0052 the far wall is **82 %
fog colour at 250 m and 94 % at 330 m**. The far wall will render as a hazed
silhouette, and that is correct — a pit wall 250 m away in dust *is* a hazed
silhouette. It is also why the detail budget is spent near, and why nothing in
this file pre-bakes haze into vertex colour: that would double an effect the
renderer already applies.

### 5.4 The wall closes 360°, not just the hero arc

The hero camera sees roughly ±23° of azimuth — the toe line crosses NDC x ±1
at ψ = ±23°, so the wall spans the whole frame width and runs off both edges.
The wall is built the whole way round anyway, at `SEG_FINE` 2.2° inside ±52°
and `SEG_COARSE` 9° outside it, because `CAMERA_MODES.orbit` — the turntable
behind site hero shots, the shop and the garage — rotates a full circle at a
40° field. A 100° arc would have been cheaper and would have shown open country
behind the player on every orbit. Segments outside the hero arc cost triangles
only; they cost no draw calls, because they are the same materials.

**The segment pitch is solved in pixels, not in degrees, and it was solved
twice.** At the far wall's ~230 m mean radius, 2.2° is 8.8 m of crest, which the
measured frame renders about 31 px wide; the ±2.4 m of backbreak on each is
about 8 px of vertical wander. That is a ragged skyline. The first build of this
file used 1.35°, which doubles the object count for wander the mip chain
averages away — and `blender/lib/rig.py`'s `box()` costs two `bpy.ops` calls per
box, each of which walks the scene, so the cost is quadratic in object count.
**That build produced ~4 200 objects and was still running after ten minutes.**
It is worth knowing before authoring another site: on this pipeline, object
count is a *time* budget as well as a triangle budget.

### 5.5 What the model does NOT contain, on purpose

- **No terrain.** `heightAt()` is a shared contract between this module, the
  terrain and the rig agent, and it is a function, not a mesh
  (`blender/lib/site.py`). Everything here is additive and stands **on or above
  z = 0**; nothing cuts down into the floor. That is also why the pit rises
  around the player rather than dropping away from them: a modelled drop would
  have the live terrain drawn straight across it.
- **No opaque decorative floor** over the collar, the live terrain or the
  section seam. `CLEAR_R = 5.0 m` around the collar is asserted on every build
  against **real vertices through each object's world matrix** (local bounding
  boxes over-estimate rotated geometry, and every bench face in this file is
  rotated — `ASTRA.md` §5). 5.0 m and not more, because on this archetype the
  machine stands *in the middle of this file's own geometry*: the origin is a
  blasthole in the pattern and its nearest neighbours are one burden (6.09 m)
  back and one spacing (7.92 m) along, so a larger reserve would have deleted
  real pattern rather than protected the rig. The origin hole itself carries
  no flag and no stemming — it is the one being drilled.
- **No plant.** No crusher, conveyor, stockpile or product. See §1.
- **No lighting.** No `mount:` node carries `cone_deg`/`range_m`, so none is
  read as a lamp by `src/core/env.js`. A production bench works in daylight and
  §A.5 asks for no lighting on one.
- **No `transmission` anywhere.** Not on a cab window, not on anything. The
  measured cost is +65 to +81 draw calls independent of object size. Every
  material this file creates pins `Transmission Weight` to 0 explicitly.
- **No lettering, no badge, no marque, no mine name.**

---

## 6. Measurements

Build of 2026-09-06, `blender/sites/open_pit_bench.py`, six other site builds
running on the same machine at the time.

### 6.1 What the build printed before it wrote anything

```
PIT_GEOMETRY bench=15.0m face=70deg berm=8.0m (MRC 7.5m) module=13.460m
             interramp=48.10deg overall=40.36deg depth=120m
PIT_ROAD     ramp_w=33.5m (AASHO 4x8.295=33.18m) grade=10%
             berm=1.80m (mid-axle 1.790, rolling r 1.705)
PIT_SHOT     hole=203mm burden=6.090m spacing=7.917m stemming=4.263m S/B=1.30
```

### 6.2 Where the composition lands in the hero frame (CPU, from the module)

```
FRAME_WALL     toe_d=205.5
               b1 z= 15 ndc_y=+0.21 | b2 z= 30 ndc_y=+0.55 | b3 z= 45 ndc_y=+0.86
               b4 z= 60 ndc_y=+1.13 | b5 z= 75 ndc_y=+1.37 | b6 z= 90 ndc_y=+1.59
               b7 z=105 ndc_y=+1.79 | b8 z=120 ndc_y=+1.97
FRAME_RAMP     foot_psi=-14  z@psi0=4.7m  z@psi+5=6.5m  climb_over_visible_arc=12.8m
FRAME_MIDLIFT  near end d=95.2  ndc=(0.29, -0.24)  crest ndc_y=+0.61
```

Three bench crests inside the band with the fourth on its top edge; the eighth
at +1.97, so the sky is closed with four benches to spare. The ramp emerges from
the floor at NDC x ≈ −0.56 and climbs 12.8 m across the ~37° of wall still in
frame — most of one bench, at the sourced 10 %. The mid lift stands from the
floor to NDC y +0.61 across the right third.

### 6.3 Objects, and what they cost in build time

```
PIT_STAGE wall      objects= 1578   333.7 s
PIT_STAGE mid-lift  objects=  197    84.5 s
PIT_STAGE muck      objects=  200    93.4 s
PIT_STAGE floor     objects=  391   216.7 s
PIT_STAGE fleet     objects=   52    33.4 s
PIT_OBJECTS authored=2418
```

≈13 minutes wall-clock, CPU-contended against other Blender site builds on the
same machine. See §10.10: on this pipeline object count is a *time* budget too.

### 6.4 The export, and the budget

```
SITE_OK materials=4 draws=4 budget=6
```

`node tools/glbinfo.mjs public/models/sites/open-pit-bench.glb` — **the one
dimension tool** (`ASTRA.md` §5); no second ruler was written:

```
glTF v2  2805.1 kB  extensions: none
PRIMITIVES 4  (= draw-call floor)   TRIANGLES 30944   nodes 8   images 0
materials: blastedRock, gravel, paintedDark, safetyStripe
mount:site-collar (scene root)
mount:site-face  extras={"bench_h":15,"face_deg":70,"berm_w":8,
                         "interramp_deg":48.1,"depth_m":120}
mount:site-lift  extras={"bench_h":15}
mount:site-ramp  extras={"ramp_w":33.5,"grade_pct":10}
static:blastedRock / static:gravel / static:paintedDark / static:safetyStripe
DIMENSIONS (m)  W 629.728 x H 131.373 x L 642.112
BOUNDS  x -299.328..330.400   y -7.539..123.834   z -343.344..298.768
```

| | this site | `quarry-bench` | `urban-plot` | budget |
|---|---|---|---|---|
| materials = draw calls | **4** | 6 | 5 | **6** |
| triangles | 30 944 | 13 936 | 29 576 | — |
| bytes | 2 872 400 | 961 304 | 2 754 112 | — |
| primitives | 4 | 6 | 5 | — |

**On the four contracts** (`ASTRA.md` §4): named nodes survive the join with
their world transforms and their `extras` (four `mount:` nodes above, and the
figures in them are the sourced ones, not repeats of composition constants);
materials are **names only** with `images 0`, and all four exist in `assets.js`
`KINDS` — `site.finish()` parses `assets.js` and would have refused the export
otherwise; statics are joined by material, four groups to four primitives; and
the filename is the archetype id verbatim.

**`images 0` matters.** A baked map would opt the site out of the wear system
*and* spend the texture budget twice, and `terrain.js` warns and discards on
load. Nothing here ships one. There is no `transmission` anywhere.

**On the bounds.** `y -7.539` is not a modelling error and not a claim that the
pit goes below its floor: the lowest bench's face deliberately starts 6 m under
grade so the toe line is buried. The far field's own base sits about 2 m below
grade at this radius, and the first build — whose lowest vertex was at
−1.539 m, purely from the lean on the box — would have left a hairline of
background under 120 m of rock. `W 629.7 × L 642.1` is the 360° ring — this model is a
place, not an object, and its bounding box is the pit's plan diameter plus the
haul-road spiral, which is the correct number for a ~120 m pit at a 48.1°
inter-ramp with a 33.5 m ramp cut into it.

---

## 7. What this needs from files this agent does not own

These are **requests, not edits**. `src/world/terrain.js` is another agent's
file and nothing in it was touched.

### 7.1 `src/world/terrain.js` — `ARCHETYPES['open-pit-bench']`

The archetype declares no `model`, so the export is never fetched. The change
is exactly the shape `quarry-bench` and `urban-plot` already carry — and note
that since this module was started, `terrain.js` has replaced the inline
`kit === '…' && !siteModelReady()` test with a declarative `replacesKit: true`
flag, so the whole request is now three lines in one object:

```js
'open-pit-bench': {
  kit: 'pit', plane: 'surface', groundKind: 'gravel', pad: 0, farAmp: 0.35,
  dress: { spruce: 0, birch: 0, rock: 0.9, stone: 1.2, grass: 0.06,
           scree: 1.5, scrub: 0.15, ice: 0.2 },
  dressMaxR: 40,
  model: 'open-pit-bench',                     // NEW
  replaces: ['outcrops', 'scree', 'stones'],   // NEW
  replacesKit: true,                           // NEW — see 7.2, this one is
                                               //       a correctness blocker
  flatR: 200, flatFalloff: 260,                // NEW
},
```

- **`replaces: ['outcrops', 'scree', 'stones']`.** These are three real
  `addInstances()` names (`terrain.js` 4813 / 4826 / 4842) and this archetype's
  `dress` offers all three (rock 0.9, stone 1.2, scree 1.5), so none of them is
  a dead entry of the kind `checksiteenvironment.mjs` now fails on. The model's
  benches, muckpile, windrows and floor debris are the rock they were standing
  in for.
- **`flatR: 200, flatFalloff: 260`.** The far wall's toe is a nominal 190 m
  plan radius with ±11 m of wander (measured max 201.7 m at ψ = 0), so the
  floor it stands on must be flat to at least ~202 m. Same claim `quarry-bench`
  makes with `flatR: 46`, for the same reason: a pit floor is an engineered
  flat, not ground with a rig on it.
- **`dressMaxR: 40` could now be raised, and this is optional.** Its comment
  says *"The bench floor is 44 m before the first batter stands out of it.
  Everything scattered outside that is inside solid rock."* That is true of the
  procedural pit, whose first ring is at r = 44. With this model the first
  batter is at 82 m (the mid lift) and the wall is at 190 m, so the scatter
  could fill the floor out to ~170 m without ever landing inside rock. It costs
  no extra draw calls — the instances are already allocated — and it would stop
  the near floor reading bare. **Not requested, only noted**: it is a
  composition call for whoever owns the archetype, and it is only correct while
  the model is live, which `dressMaxR` has no way to express today.

### 7.2 `replacesKit: true` is a correctness blocker, not a polish item

The `kit === 'pit'` branch (terrain.js ~2982) draws its own bench rings at
r = 44/70/96/122, backing walls at r = 150/230, a haul ramp, a haul truck, a
bulk-emulsion truck, a second tracked crawler, a blast pattern and a stemming
stockpile. **Every one of those sits inside or on top of this model.** Loading
the model without `replacesKit: true` draws two pits at once: four procedural
bench rings standing on the floor in front of the authored wall, and a second
truck, a second pattern and a second drill class beside the authored ones.

Free in draw calls either way — the kit merges into the vertex-coloured pool —
so this is a double-dressing decision exactly like `urban-plot`'s, and it has
the same answer.

### 7.2a What this is expected to cost, and the one number worth comparing

`quarry-bench`'s measured net cost is recorded in `terrain.js` itself:

```
quarry-bench @ iberian-quarry   21 -> 23   NET +2   dropped: outcrops stones scree
quarry-bench @ nordic           22 -> 25   NET +3   dropped: outcrops stones
```

— i.e. six materials against three scatters given back, and in `nordic` only
two, because `REGIONS.nordic.dress.scree` is 0 and there is no scree instance
there to drop. This model spends **four** materials against the same three
scatters, so on the same measurement it should land at **NET +1**, and **NET +2**
in a region with no scree instance. **That is a prediction from the material
count, not a measurement** — `.probe-netdraws.mjs` has not been run against this
model, because it needs the GPU lease. It should be run before sign-off, and if
it disagrees, the measurement wins.

### 7.3 One real gap, and one thing I got wrong and then checked

**Corrected first, because it matters more than the finding.** An earlier draft
of this document claimed the far-field skirt begins at a Chebyshev half-size of
104 m while the ground mesh only reaches ±75 m, and therefore that a seam might
exist between them that nobody had looked for. **That is wrong.** `CFG.farRings`
begins at **72**, not 104 — 104 is where the list's *ridge window* starts, which
is what the comment above it is describing. The first three rings (72, 74.6,
77.2) straddle the ground plane's own edge exactly as the comment says. There is
no hole. I include this because the claim was already written down as a finding
before I opened the array, and a wrong finding handed to another agent is worse
than no finding — `ASTRA.md` §10: *"Do not take a sub-agent's report at face
value… check the file yourself before acting on a claim about it."*

**The real gap, now measured against the code rather than assumed.**
`terrainHeight()` honours `arch.flatR`; `farHeight()` does not. But `weldTo()`
blends `farHeight` toward `terrainHeight` with
`weld = 1 − smoothstep((c − 72) / 68)`, so `flatR` **does** reach the skirt —
fully at 72 m, fading to nothing by **140 m**. Beyond 140 m the region's own
`farHeight()` governs, and no archetype flag can flatten it.

This model's wall toe is at **190–202 m**, i.e. past the weld. So between roughly
140 m and the toe, the pit floor carries whatever relief `farHeight()` produces
at `farAmp: 0.35` — which `terrain.js`'s own note puts at *"7–10 m"* of relief
for this archetype. The mitigations in the model are that the wall's toe is
buried and the wall is continuous and opaque, so nothing can show *through* it;
what is not mitigated is that the last 60 m of floor in front of the wall may
not be as flat as a pit floor should be.

**This is the first archetype to put authored furniture past the weld**, so it
is the first time the limitation has cost anything. It is not this module's to
fix. Two options for whoever owns `terrain.js`, in order of preference:

1. give `farHeight()` the same `flatR` treatment `terrainHeight()` has, so an
   archetype that declares an engineered floor gets one at any radius; or
2. leave it, and accept a slightly undulating far floor on this one archetype.

Either is defensible. What is not defensible is assuming it is flat because
`flatR` is set, which is what the archetype table currently reads as.

---

## 8. Reproducing this

```bash
# build the model (writes public/models/sites/open-pit-bench.glb)
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" \
  --background --python blender/sites/open_pit_bench.py

# build it AND render the offline inspection views into shots/
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" \
  --background --python blender/sites/open_pit_bench.py -- --preview

# measure it — the ONE dimension tool (ASTRA.md §5). Do not write a second.
node tools/glbinfo.mjs public/models/sites/open-pit-bench.glb
node tools/glbinfo.mjs --parts public/models/sites/open-pit-bench.glb
```

The build prints its own checks before it writes anything: `PIT_GEOMETRY`,
`PIT_ROAD`, `PIT_SHOT`, `FRAME_WALL`, `FRAME_RAMP`, `FRAME_MIDLIFT`,
`PIT_OBJECTS` and finally `SITE_OK … materials=… draws=… budget=…`. Any
assertion in `_verify_geometry()` or `_assert_clear()` fails the build **before**
export, and `site.finish()` deletes the file and raises if the joined scene is
over budget.

---

## 9. Renders

`shots/open-pit-bench-hero.png`, `-bowl.png` and `-profile.png` are **offline
Blender Cycles renders of the real exported `.glb`**. They are **not gameplay
captures** and must never be presented as any. They carry none of the game's
renderer: no `assets.js` procedural materials, no FogExp2, no post chain, no
tone map, no HUD, no rig and no terrain. They prove position, silhouette and
proportion. They prove nothing about colour, exposure, draw calls or frame rate.

Three views, and each one earned its place:

| view | camera | what it is for |
|---|---|---|
| `-hero.png` | the game's own hero eye, on the hero bearing, at the measured 43.9 deg horizontal / 20.97 deg vertical field, 1480 x 681 (the aspect derived from the two measured constants) | the only framing the player will ever see |
| `-bowl.png` | outside and above the pit | the 360 deg closure, the ramp's spiral, the toe line's wander — **and it is the one that found both construction bugs in 5.2b**, neither of which was visible from the hero eye |
| `-profile.png` | a long lens on the ring from outside and above | it looks at the **back** of the far arc, which the player never sees - and that is what makes it useful: it is the view in which a slot right through the wall shows as a bright hole. The first one had several. It also puts the 15 m module and the 70 deg batter side-on for an eyeball check against the numbers the build prints |

**The wide views are not decoration.** Every real defect in this model was found
in `-bowl.png` or `-profile.png` and none of them in `-hero.png`, which looked
plausible while containing a wall with slots through it and a plateau that had
fanned into separate fins.

## 10. Outstanding issues, honestly

Ordered by how much they would cost if ignored.

1. **No in-game frame has ever been taken of this model.** The renders under
   `shots/` are offline Blender renders of the exported `.glb` with none of the
   game's renderer. The GPU lease was held by another track for the whole of
   this pass and the brief forbade launching headed Chrome. Until somebody
   takes a warm headed capture with `site:open-pit-bench` visible, **nothing is
   known about how this looks in the game** — only about where its geometry is.
   Everything in §5.3 about fog is arithmetic, not observation.

2. **The hero-frame constants were inherited, not measured** (§4), and the
   horizontal one does not reconcile with the declared fov by a factor of 1.26.
   The site is built to be robust to that — a 360° bowl fills any horizontal
   field, and the bench stack was solved against both candidate vertical fields
   — but **this needs one headed capture to close.**

3. **`terrain.js` must be changed before this can load at all** (§7.1), and
   **`replacesKit: true` is a correctness blocker** (§7.2) or the game draws
   two pits on top of each other. Neither file was touched.

4. **I made two wrong findings in this pass and caught both by measuring
   afterwards. Read §5.1 and §5.2b.3 before trusting any other number here.**
   (a) The pixels-per-metre figure for the far wall was stated as 3.5 px/m; it
   is 9.7 px/m at 205 m — a factor of three, from mixing an angular figure with
   a per-degree one — and it had already been used to justify limiting the
   containment lip to four benches ("a 1.5 m lip is five pixels"; it is
   fourteen). (b) A render was eyeballed as showing the mid-lift plateau fanned
   into separate fins; measured afterwards, the worst gap in the old geometry
   was **five centimetres** and the boxes overlapped everywhere else. Both the
   numbers and the decisions they produced are corrected, in the module and
   here, and left visible rather than tidied away. The pattern is the same
   both times and it is worth naming: **look at the render to find WHERE to
   measure; do not let it tell you WHAT the number is.**

5. **The angle of repose of blasted rock is still unsourced** (§3). The
   muckpile does not assert one, but the next person to build a muckpile will
   want the number and a working driller will know it. It is a short search
   away for anyone with a working web-search tool.

6. **The `.glb` carries a fixed neutral rock palette, so the region's colour no
   longer reaches the pit walls.** The vertex colours are deliberately
   near-neutral luminance modulations so `assets.js`'s own `blastedRock` and
   `gravel` textures carry the hue and the gameplay-driven wear — but the
   procedural kit tinted its walls from `region.colA` / `region.rock` /
   `region.spoil`, and an authored `.glb` cannot. `open-pit-bench` serves two
   regions (`mining` and `andes`), so both now get the same rock. `urban-plot`
   has the same limitation. Somebody should decide whether it is worth a
   runtime tint hook.

7. **`flatR` stops reaching the ground at about 140 m** (§7.3), so the last
   ~60 m of floor before the wall's toe carries whatever relief `farHeight()`
   produces at `farAmp: 0.35` — 7–10 m by `terrain.js`'s own note. The wall's
   toe is buried to −6 m and the wall is continuous, so nothing can show
   *through* it, but the far floor may not be as flat as a pit floor should be.
   This is the first archetype to put authored furniture past the weld.

8. **The edge artefact is neither reproduced nor ruled out.**
   `quarry_bench.py` records coloured speckle on geometry reaching the outer
   ~6 % of the band width, cause unverified. This model's floor geometry is
   kept inboard of NDC x −0.82 the same way, but **its wall is a ring and
   therefore necessarily reaches both frame edges** — it cannot be kept inboard
   and still be a pit. If the artefact is real and screen-position-dependent,
   this site will show it. That is a reason to find the cause, not a reason to
   build a smaller pit.

9. **`tools/checkmodels.mjs` does not validate site models.** It walks
   `public/models/` for rig ids and knows nothing about `public/models/sites/`.
   Material-name validation for a site happens at *build* time in
   `site.finish()` and at *load* time in `terrain.js`; there is no gate between
   the two. Not this site's problem to fix, but a `.glb` in `sites/` that
   nobody rebuilds after an `assets.js` rename would go stale silently, which
   is this codebase's most expensive habit. (`tools/checksites.mjs` and
   `tools/checksiteenvironment.mjs` exist and were added by another track
   during this pass; whether they close this gap was not checked here.)

10. **Object count is a time budget on this pipeline.** `rig.box()` costs two
    `bpy.ops` calls per box and each walks the scene, so build time is
    quadratic in object count. The first version of this file authored ~4 200
    objects and was still running after ten minutes on a machine with six other
    site builds on it. The shipped version authors ~2 300 and takes ~15 minutes
    under the same contention. Worth knowing before the next site is authored.

11. **The crest lines still break up in places.** After separating the dozed
    berm line from the blast crest (§5.2b.2) they read as lines over long
    stretches rather than as scattered dashes, but they are still interrupted
    where a bench face's downward extension (the §5.2b.1 slot fix) reaches
    inboard across the lip. The two fixes interact and the interaction was not
    designed. It is a refinement, not a defect — and it is worth knowing that
    **the game's own fog will do work this render cannot show**: the wall runs
    68 % fog colour at bench 1 and 95 % at bench 8, so the benches separate by
    depth in the game in a way they cannot in a fog-free Cycles render. Judge
    it on a headed capture before spending another rebuild on it.

12. **The mid lift's plateau is corrugated** (§5.2b.3). Left deliberately: no
    game camera is above 8.6 m and that surface is at 14–15 m.

13. **The near floor is bare in isolation.** The bottom ~40 % of the hero frame
    is open ground with the pattern on it. In the game the rig stands in that
    space and the region's own scatter dresses it, so this is probably an
    artefact of rendering the site alone — but it is listed because it has not
    been confirmed, and because `dressMaxR: 40` currently stops the scatter well
    short of the wall (§7.1).

**Is this ready to wire in?** *A gallery of unused models is not completion.*
The model builds; it passes its own geometry, road, pattern and clearance
assertions; it is inside the material budget with two draw calls to spare; its
origin, node names, node `extras` and material names satisfy all four contracts;
and three offline renders have been looked at, which found three real defects
that are now fixed. **But it is not finished**, for two reasons that are not
about the model: the `terrain.js` changes in §7 have not been made, and no
in-game frame exists. The honest status is **ready to wire in and then
reviewed** — not **done**.
