# hdd-rig — Horizontal Directional Drilling rig

**status: COMPLETE** for the material available locally and on the web as of 2026-09-05.
Anything marked `NOT SOURCED` stayed unfound and must not be invented. §8 lists the real gaps,
and §8.0 lists what was a gap in an earlier draft and is now closed. Two warnings in §9 were
**withdrawn or softened** when better evidence arrived (§9-D, §9-F); both are recorded in place
rather than deleted, because knowing that a plausible-sounding correction turned out to be
wrong is worth as much as the correction would have been.

Engineering reference for the game rig `hdd-rig`, built in
`C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` (`buildHDDRig`, RIG 8).
For GEOMETRY and MATERIALS only.

> **NAMING RULE (DOMAIN.md §10).** Every manufacturer name and model designation in this
> document is cited as a *dimensional source*, never as a product name for the game. Do not
> copy a badge, a logo, a decal, a colour that reads as a specific OEM livery, or a model
> string onto the model. The in-game machine is "Halvard HD-330 Traverse" — a fictional name.
> Real names below (Perforator, Prime Drilling, Vermeer, Ditch Witch, Herrenknecht, Bauer,
> TRACTO/Grundodrill) exist here so the modeller can check proportions, not so they can be
> lettered on the hood.

**Relationship to the existing packs.** `research/07-hdd-trenchless.md` (2,195 lines) already
owns the *process* — bore profile, slide-vs-rotate, reaming rules, pullback mechanics, mud,
hazards. `research/11-oem-anchor-geotech-hdd.md` owns the *OEM landscape and class bands*.
`research/16-site-archetypes.md` §A.17 owns the *site footprint*. **This document does not
re-derive any of that.** It extends them with the one thing they do not carry: geometry a
modeller can build from, and a component-by-component read of the current mesh. Where a fact
already lives in a pack, it is cited to the pack rather than restated at length.

---

## 1. Sources read

| File | Pages / extent | What it ACTUALLY showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\DTD-Glossary-of-HDD-Terminology.pdf` | **all 9 pp.**, text-extracted | **The naming backbone, and it earns its billing.** Definitions for back reamer, forward reamer, compaction reamer, wing cutter, pilot bore, sonde/transmitter, locator, **remote**, **rod wiper**, box/pin, **deflection**, frac out, front/rear locate point, chinese finger, pitch, dry hole, hydro-lock, strike alert, thread compound, filter cake, bentonite, annulus, casing, screen. Carries the best steering quotation in the whole library (§4.5). **Honest limit: it is an *environmental* HDD glossary and it does NOT define entry angle, rod box/magazine, thrust frame, anchor/stakedown, vise or breakout wrench, or the mini/midi/maxi classes** — pack 11 §B.6 had already checked and recorded the last of those. | **Yes — primary for naming** |
| `C:\Users\henri\Downloads\perforator_drill_pipes_22.pdf` | p. 3 of 5 | One paragraph and three bullets under "Drill Pipes and Drilling Tools for Horizontal Directional Drilling": HDD pipes are **friction-welded and integrally forged**, made "from Mini to Maxi", with **optional hard banding as wear protection**. Confirms construction and finish. **No dimension, no table, no drawing for HDD** — the OD tables on that page belong to the RC product beside it. | Partly — construction only |
| `C:\Users\henri\Downloads\perforator_auger_boring_bro_22.pdf` | 17 pp.; read pp. 4–7, 9–13 | **Auger boring, not HDD** — a different machine that lives in a shaft. Valuable for two things: (a) it states plainly that even in the pilot-tube variant *"the product pipe is laid using the pull-back method with backreamer and bentonite"* (p. 6) — an independent confirmation of the pullback pass; (b) it gives real spec tables for the *contrast* machine (mini thrust 98–385 kN, pullback 63–259 kN, **height of machine axis 270–635 mm**; maxi 2,350–3,200 kN for pipe to OD 1,720 mm). | Partly — as contrast |
| `PD_W100-131_21-01.pdf` · `PD_W120_G3_22-01.pdf` · `PD_W150-121_1400023_06.pdf` · `PD_W280_1400111_03.pdf` · `PD_W70-220_1400108.pdf` | `info` + first-page text on every one | **These are NOT HDD machine datasheets, and there is no dimensioned general arrangement anywhere among them.** Every one is an **LKAB Wassara water-powered DTH hammer** product data sheet — 1–2 pp. of performance graph, spec block and parts list. W70/W100/W120/W150/W280 are *hammers*, not rigs. | **No — wrong machine entirely** |
| `PD_WASP80D_1401.pdf` · `PD_WASP100D_1606.pdf` · `PD_WASP150-Diesel_1611.pdf` · `PD_WASP200D_1606.pdf` | `info` + first-page text | **Also not HDD rigs.** WASP = Wassara high-pressure **water pump** units for water-powered DTH. The closest they come to this subject is being "a pump on a skid", which is not close enough to measure anything from. | **No** |
| `PD_WS150_1400039_08-1.pdf` · `PD_WS200_1400040_04.pdf` · `PD_WIS_2008.pdf` | all, 1–2 pp. each | Wassara **water swivels** — a rotating union that "transfers the high-pressure water from the hose to the drill string". WS150: **length A 251 mm, B 110 mm, 8 kg, 250 bar max, 605 l/min, 200 rpm max, thread M45×2 LH, hose ISO 228-G 1½"**. Real dimensions, but of the **wrong swivel**: an HDD *pullback* swivel is a load-bearing anti-rotation link between reamer and pull head, not a fluid union. Do not transfer these numbers. | **No — different component sharing one word** |
| `C:\Users\henri\Downloads\PD_DrillRods_1701.pdf` | both pp. | Wassara **DTH** drill-rod table. Transferable *construction* detail: **friction-welded, cold-drawn seamless mid-body (API N-80) up to 140 mm OD; submerged-arc welded (API J-55) at 168–194 mm; tool joints surface-hardened to 58–62 HRC; an O-ring seated in the thread box**; **wall thickness 6.3 mm** across 48–102 mm OD; lengths **1.0 / 1.5 / 2.0 / 3.0 m**; **4-way wrench flats** (e.g. 65×40 mm). Adjacent class — a DTH rod, not an HDD rod — but the friction-weld construction matches what Perforator states about HDD pipe. | Partly — rod construction |
| `PD_Duplex-Drill_Tubes-JG_1001-1.pdf` · `PD_Duplex-Swivel-JG_1601.pdf` · `PD_Hose-kit_1701.pdf` · `PD_CheckValves_1400073_1901.pdf` | 1–2 pp. each, `info` + text | Wassara duplex tubes, duplex swivel, HP hose kit, check valves. All water-powered-DTH accessories. **Nothing about HDD.** | **No** |
| `perforator_injektionstechnik_22.pdf` | 3 pp. | Resin **injection** pumps for rock and concrete consolidation. Unrelated to this machine. | **No** |
| `perforator_disccutter_schneidrolle_22.pdf` | 2 pp. | **Disc cutters / Schneidrollen** — the roller cutters of a TBM or microtunnelling cutterhead. HDD back-reamers at the sizes this game models use picks and blades, not disc cutters. Wrong tool family. | **No** |
| `C:\Users\henri\Downloads\2023-Mud-Pump-Consumables.pdf` | 24 pp.; `info` + pp. 3–11 | HMH **oil-and-gas triplex mud-pump spare parts** — zirconia and chrome liners, pistons, valves and seats for Wirth TPK 800/1000/1600/2200. That is a rig-floor pump the size of a car; an HDD midi rig's onboard pump is a fraction of it. Vocabulary only (fluid end, liner, piston, valve and seat). | **Mostly not** |
| `C:\Users\henri\Downloads\Drilling_Fluid_Catalogue.pdf` | both pp. | A numbered **product list** of drilling-fluid additives (DF-1 … DF-49+: hole stabilisers, shear stabilising systems, bio oils). Names of sacks, not shapes of equipment. No geometry whatsoever. | **No** |
| `research/07-hdd-trenchless.md` | §A1, §A2, §A3, §A4, §A5, §A7, §C2, §D1–D6 | **The parent process pack, and it is excellent.** Entry/exit angle bands with sources, bore profile, slide-vs-rotate quotations, the bend-radius rule, reamer pass sizing, the swivel, the rod wiper/doughnut, the reclaimer stack, the pit-and-berm arrangement, the class table attributed to the HDD Consortium, and Herrenknecht's core-component list. **Everything geometric in §3–§5 below either comes from here or extends it.** | **Yes — primary** |
| `research/11-oem-anchor-geotech-hdd.md` | §A.15–A.20, §B.6, §C.3, §D.6, §D.8 | OEM landscape, naming decodes, verified thrust/torque spec points, the mini/midi/maxi disagreement, and the one-line silhouette table. Already carries a 6°–15° entry-angle figure for one specific maxi rig. | **Yes — secondary** |
| `research/16-site-archetypes.md` | §A.17, §A.18, §B.17 | The spread footprint in metres, the pit berm, the reclaimer, the locator walking the line, and the frac-out hazard. | **Yes — for staging** |
| `src/rig/rigFactory.js` — `buildHDDRig` ll. 2989–3140; helpers `buildFeedBeam` l. 1236, `buildMastStack` l. 1953, `buildSimpleMast` l. 1854 | read READ-ONLY | The current mesh, compared against the sources in §9. | Yes (as the subject) |
| `src/rig/tools.js` §11, ll. 4373–4530 (`buildHDDPilotHead`, `buildSondeHousing`, `buildBackreamer`) | read READ-ONLY | The downhole tooling, compared in §9. | Yes (as the subject) |
| `src/game/data.js` ll. 985–992 (method `hdd`), ll. 1216–1223 (rig entry), ll. 1885–1925 (HDD shop items) | read READ-ONLY | The spec numbers and the shop copy — and the source of the sharpest contradiction in §9. | Yes (as the subject) |
| `C:\Users\henri\Downloads\*.jpg jpeg png webp` — ≈279 files, top level | filename + pixel-dimension sweep of all; 2 opened | **No photograph of an HDD rig, an HDD spread, a reamer, a pit or a mud recycler exists in the library.** See §7. | **No — this is the document's biggest gap** |

### 1b. Web sources — where the general arrangements actually were

Because the local library turned out to contain no HDD machine datasheet at all, the
dimensional work was done on the web. **All accessed 2026-09-05.** Full per-figure citations
sit beside the numbers in §3; this is the index.

| Source | What it gave | Useful? |
|---|---|---|
| **TRACTO GRUNDODRILL factory sheets** — JCS300, JCS130E, 18ACS/18N, 20ACS (`en.tracto.com` Brand Portal PDFs) | **The best find of the whole exercise.** Full spec blocks *and* dimensioned working/transport envelopes, including the same machine dimensioned in two poses and at two rack angles. The **JCS300 at 300 kN / 23.6 t / 9.05 m** is this game rig's closest real analogue. Also: rack-and-pinion named verbatim, rod magazine capacities, anchor plate = drip tray, cabin swivel envelopes. | **Yes — primary** |
| **Vermeer spec sheets** — D24x40 S3, D40x55 S3, D100x140 S3, D220x300 S3, D220x500 S3 (`vermeer.com` PDFs) | Transport L × W × H, weights, rack-angle bands, rod tables with bend radii and box capacities, vise configuration and slide travel, catwalk, stackable rod boxes, rod loader, four-bar-linkage rack, stakedown options and weights. | **Yes — primary** |
| **Ditch Witch JT24 spec PDF** and JT40 / AT40 pages | Transport dimensions, ground clearance, **entry angle 18° vs 12° "tracks on ground"**, drill pipe **by the boxful (40 pipe / 28 pipe)**, anchor weights. ⚠️ JT40 entry angle is printed as "20-29%" on one page and "20-29 degrees" on another — **not reliably sourced, excluded**. | **Yes**, with one exclusion |
| **Westlake Pipe trenchless guidelines bulletin** (PDF), quoting **ASCE MOP 108** and **NASTT** | The entry/exit angle recommendation verbatim (8–20° / 5–12°), and the NASTT three-band reamer-sizing table. A standards-grade citation rather than a trade article. | **Yes** |
| **Melfred Borzall catalogue, Edition 22** (PDF) | **Sonde housing OD banded by rig thrust**, **pullback swivel Ø banded by capacity**, reamer families with cut and shaft diameters, bolt-on blade patterns, dual SuperNozzles, hardfacing distribution. The single richest source for tooling that scales with rig size. | **Yes — primary for tooling** |
| **US patents 6497296 B1, 11879331 B2, 7467670 B2, 6357537 B1, 11225845 B2, 20090095526 A1** (Google Patents) | Anchoring by **power augers on a pivoting mount, one laterally movable**; the thrust-wall threshold at 100 tons; rod magazine as **gravity-fed columns**; the **2:1 block-and-tackle chain drive**; the hybrid rack-plus-cylinder carriage. Patents describe mechanisms, which is exactly what a modeller needs and what brochures omit. | **Yes** |
| **Elite Underground Tools HDD tooling guide** | The **steer face belongs to the housing**; drill collar function; housing/sonde size pairs; drive chuck and saver sub; the **1.5× swivel sizing rule**. | Yes |
| **Vermeer Pro Tips** — big-drill crew roles; R125 reclaimer | Crew roles on a maxi job; **reclaimer 2.60 × 2.16 m, 500 l/min, six 4-in hydrocyclones**, matched to the 107–178 kN rig class. | Yes |
| **DNV / Subsea 7 conference paper IBP1070_09** (osti.gov) | Independent corroboration of the **1000 × D / 1200 × D** product-pipe bend-radius rules and the 1000–2000 D design range. | Yes |
| **hddbroker.com equipment library** — GRUNDODRILL 25N, AT40, DD-440, D100x140 | Dimensions and weights for machines whose factory sheets were not reachable. ⚠️ Its D100x140 dataset is an **older revision** than Vermeer's 2026 sheet and disagrees with it; the factory sheet was preferred. | Partly |
| Assorted contractor blogs (`projectinfrastructure.com`, `worldhdd.com`, `horizontaldrill.com`) | Spread equipment lists and crew-size claims. **Used only where nothing better existed, and flagged inline.** A 2–3 person mini crew figure was reached only via a search summary and is **not verified**. | Marginal |

_(further rows appended at the end of this section as more sources are read.)_

---

## 2. What the machine IS

**It is the one machine in the fleet that does not drill down.**

An HDD rig is a **surface-mounted, ground-anchored thrust-and-pullback frame set at a shallow
angle to the horizon**, which pushes a steerable head into the earth, steers it along a
designed arc under an obstacle, brings it back out of the ground several hundred metres away,
and then **drags the hole open backwards** while pulling a product pipe in behind it. Every
other rig in this game stands over its hole; this one leans at it.

The functional definition, verbatim from the industry specification, is worth having because
it names all four verbs: *"a power system to **rotate, push and pull** hollow drill pipe into
the ground **at a variable angle** while delivering a pressurized fluid mixture to a guidable
drill (bore) head"* — Alliance for PE Pipe §02XXX, via `research/07` §D1 `[APE]`. Rotate,
push, pull, pump. There is no hoist, no mast, no Kelly bar, no hammer.

**Three consequences follow, and all three are visual:**

1. **The frame is an inclined ladder anchored to the ground, not a mast standing on a
   machine.** Herrenknecht's own component list for an HDD rig reads *"drill bit · bent sub
   (~2° curve) · break-out unit · drill rods · chassis · **carriage (main drive)** · erector
   unit · **main beam with rack-and-pinion drive**"* (`research/07` §D1 `[HK]`). A *beam*
   with a *carriage*, not a mast with a rotary head — and `research/07` §D1 states the
   consequence plainly: *"The whole assembly is anchored — it has to react up to its full
   thrust and pullback into the ground."* A 27 t crawler cannot hold 330 kN of pullback by
   sitting on it; the load goes into the soil through stakes or anchors at the nose of the
   beam. **This is the most important structural idea on the machine.**
2. **It works in two directions, on two passes, and the second pass is the paid one.** Pass 1
   is the **pilot bore**, pushing. Pass 2 (and 3, and 4) is **back-reaming**, pulling: the
   reamer is attached at the *far* end and dragged home. `research/07` §A4 gives the
   animation invariant, quoted from `[DCAE]`: *"A complete drill string is in the borehole at
   all times, regardless of the position of the reamer."* Rod comes off the carriage at the
   rig end while rod is being added at the exit end.
3. **It is one item in a spread, not a machine on a site.** The canonical equipment list runs
   to ten items — rig, drilling system components, downhole assembly and reaming equipment,
   downhole pressure sub, guidance and control system, pulling head, swivels, rollers, solids
   separation and fluid recirculation, pipe fusion equipment (`research/07` §D `[APE]`).
   Modelled alone, the rig is about a third of the picture. See §4.9.

**Class.** By the classification `research/07` §D1 attributes to the HDD Consortium's *HDD
Good Installation Guidelines*: **small/mini < 178 kN · medium/midi 178–445 kN · large/maxi
> 445 kN** thrust-pullback. The game's stated **330 kN** puts `hdd-rig` squarely in the
**midi** band — pipe to 406 mm, bores to about 610 m, mud pump 189–757 l/min — with which the
game's own `mudLpm: 340` agrees. It is **not** a maxi rig; see §9-A.

**What it is not.** Not an auger boring machine (that one sits on a track in the bottom of a
~12 m shaft and jacks casing, `research/07` §D6). Not a pipe rammer (no rotation, no
carriage). Not a microtunnelling jacking frame (that is below ground level entirely). The HDD
rig is the only trenchless machine that stands **on the surface, in the open, at an angle**,
with its work disappearing into undisturbed ground at its own feet.

---

## 3. Proportions

**Read this first: the local library contains no general arrangement of an HDD rig.** Every
`PD_W*`, `PD_WASP*` and `PD_WS*` file was checked and every one turned out to be an LKAB
Wassara water-powered-DTH product sheet — hammers, water pumps and water swivels — not an HDD
machine datasheet (§1). **The manufacturer datasheets that do carry dimensioned general
arrangements were found on the web instead**, and §3.1 below is built from them. Web sources
were all accessed **2026-09-05**.

### 3.1 Dimensioned general arrangements — the section the local library could not supply

**The single most useful finding in this document: there is a real machine that matches the
game's rig almost exactly.**

**TRACTO GRUNDODRILL JCS300** — cited as a dimensional source only, per DOMAIN.md §10.
<https://en.tracto.com/Brand%20Portal/Products/GRUNDODRILL-NEW-GENERATION/Marketing-Material/JCS300/TRACTO_GRUNDODRILL_JCS300_EN.pdf>
(factory sheet, 06/2025; accessed 2026-09-05)

| Parameter | Value |
|---|---|
| **Thrust / pullback** | **300 kN** |
| **Max torque** | **13,000 Nm** |
| Max spindle speed | 200 min⁻¹ |
| Bentonite pump (HD) | 750 l/min @ 60 bar |
| **Rod magazine capacity** | **315 m** |
| **Effective rod length / count / Ø** | **4,500 mm / 70 pcs / 104 mm**, 98 kg each |
| Min drilling radius | 70 m |
| **L × W × H, transport** | **8,630–8,760 × 2,550 × 3,205–2,980 mm** |
| **L × W × H, working, cabin in** | **9,050 × 2,550 × 4,370 mm** |
| **L × W × H, working, cabin out** | **9,050 × 3,220 × 4,370 mm** |
| **Weight** | **23,600 kg** |
| Engine | 231 kW, Stage V; fuel 295 l |
| **Angle of inclination** | **0–29°** |
| Driving speed | 2.3 / 3.6 km/h |

Set that beside the game's own numbers — `feedForce: 330` kN, `transportTons: 27`,
`torque: 21` kNm, `power: 186` kW, shop pipe **4.6 m** — and the match is close enough that
**this machine should be treated as the game rig's real-world size reference.** The one thing
it settles beyond argument: a 300 kN HDD rig is **~8.6–9.1 m long, ~2.55 m wide, ~23.6 t**,
and carries **70 rods of 4.5 m**. See §9 for what that does to the current mesh.

**The rest of the class ladder**, for checking that a ratio survives a change of size. All
figures from the manufacturer sheet or spec page cited on each row; all accessed 2026-09-05.

| Machine (dimensional source only) | Thrust/pullback | Torque | L × W × H | Weight | Rack angle | Rod |
|---|---|---|---|---|---|---|
| Vermeer D24x40 S3 <br><small>vermeer.com spec sheet PN 296431555</small> | 124.6 kN | 5,694 Nm @ 270 rpm | transport **6.1 × 2.26 × 1.93 m** (2.6 m with cab) | **9,389–10,092 kg** | **14–21°** | 3 m × Ø60 mm, 33 kg, bend R 33 m |
| Ditch Witch JT24 <br><small>ditchwitch.com JT24-specs.pdf</small> | 107 kN | 4,076 Nm @ 225 rpm | transport **5.7 × 1.66 × 2.11 m**; ground clearance 147 mm | **6,736 kg** | **18°; 12° with tracks on ground** | 3.05 m × Ø57 mm, 32.9 kg, bend R 35.7 m |
| Vermeer D40x55 S3 <br><small>vermeer.com PN 296431556</small> | 177.9 kN | 7,457 Nm @ 227 rpm | transport **6.1 × 2.26 × 1.93 m** (2.34 m with cab) | 10,151–11,843 kg | **15.5–20.5°** (3 m rod) · **12.5–17.5°** (4.6 m rod) | 3 m or 4.6 m; Ø60–67 mm |
| Ditch Witch AT40 <br><small>hddbroker.com id=2097</small> | 178 kN | 7,460 Nm; outer 225 / inner 280 rpm | **7.50 × 2.36 × 2.90 m** | 9,800 kg (no pipe) | **17°** | 4.57 m × Ø71–78 mm |
| TRACTO GRUNDODRILL 18ACS / 20ACS <br><small>en.tracto.com factory sheets</small> | 180 / 200 kN | 7,500–10,000 Nm outer | transport **7.15 × 3.05 × 3.15 m**; working **6.70 × 2.35 × 2.62 m** (cabin out) | 15,350–16,350 kg | **13–19°** on the drawing; inclination **0–30°** | 3.0 m × Ø73 / 82 / 81 / 98 mm; **70–75 rods, 210–225 m** |
| TRACTO GRUNDODRILL 25N <br><small>hddbroker.com id=1442</small> | 245 kN | 10,000 Nm @ 200 rpm | **6.60 × 2.51 × 2.60 m** | 19,000 kg with rods | — | magazine **288 m** |
| **TRACTO JCS300** | **300 kN** | 13,000 Nm | see table above | 23,600 kg | 0–29° | 4.5 m × Ø104 mm, **70 rods** |
| Vermeer D100x140 S3 <br><small>vermeer.com PN 296431539, 04/26</small> | 444.8 kN | 18,982 Nm @ 210 rpm | transport L **9.5–11.0 m**, W 2.59 m, H **2.98 m** (no crane) | **22,816–23,814 kg** | **11–24°**, via a *"unique four-bar linkage rack"* | 4.6 or 6.1 m × Ø89 mm, joint Ø111 mm |
| Vermeer D220x300 S3 <br><small>vermeer.com PN 296431566</small> | 1,076.9 kN | 41,691 Nm @ 164 rpm | transport **11.3 × 2.54 × 3.4 m** | **33,566 kg** | **10–17°** | 6.1 m × Ø127 mm, joint OD 168 mm, 245 kg |
| American Augers DD-440 <br><small>hddbroker.com id=1046</small> | 1,957 kN | 208,800 Nm @ 80 rpm | **15.7 × 2.5 × 4.1 m** | 42,547 kg | **10–18°** | — |

**What this ladder actually shows, and it is the most transferable thing in the document:**

- **Width is nearly constant.** From a 107 kN mini to a 1,077 kN maxi, width runs **1.66 →
  2.55 m** — because the machines are road-transportable. Force multiplies by ten; width grows
  by half. **Do not scale an HDD rig isotropically.**
- **Length is what grows.** **5.7 m → 15.7 m** across the same span, i.e. **2.7×**.
- **Height grows least of all** in transport: **1.93 → 4.1 m**, and most rigs sit under 3 m
  because they travel under bridges.

### 3.2 The set-up geometry — the numbers that place the machine on the ground

| Dimension | Value | Source |
|---|---|---|
| **Entry angle**, common practice | **8–16°** | `research/07` §A1 `[GP1]` |
| **Entry angle**, ASTM F1962 "Bore Entry (Pipe exit) angle" | **8–20°** | `research/07` §A1 `[APE]` citing ASTM F1962-11 |
| **Entry angle rigs are built for** | *"drilling rigs are typically **manufactured to operate at 10° to 12°**"* | `research/16` §B.17 quoting `[OSTI-HDD]` |
| **Entry angle**, one published maxi rig | **6–15°** | `research/11` §A.19 (Prime Drilling PD 250/90, via hddbroker) |
| **Exit angle** | **5–10°**; ASTM "preferably < 10°"; shore approaches **3–6°** | `research/07` §A1 `[GP1]` `[APE]` `[SHORE]` |
| **Rig setback behind the entry point** | **3–20 ft = 0.9–6.1 m**, depending on rig size and entry angle | `research/07` §A1 `[GP1]` |
| **Entry / exit pit berm height** | **12 in = 305 mm** | `research/07` §D5 `[APE]` |
| **Entry plot**, 305 m crossing | **30 m × 46 m** | `research/07` §D5 / `research/16` §A.17, from `[PPI12]` |
| **Entry plot**, 914 m+ crossing | **61 m × 91 m** | ibid. |
| **Exit plot**, most crossings | **15 m × 30 m** | ibid. |
| **Pipe stringing corridor** | starts **~23 m** beyond the exit, **11–15 m** wide | ibid. |

**And here the design guidance and the machines disagree — the machines win.**

The design standard is unambiguous. ASCE *Manuals and Reports on Engineering Practice No. 108,
Pipeline Design for Installation by Horizontal Directional Drilling*, quoted verbatim in
Westlake Pipe's trenchless guidelines bulletin
(<https://www.westlakepipe.com/sites/default/files/PI-TB-023-US-EN-0224.1_Trenchless-Guidelines_0.pdf>,
accessed 2026-09-05):

> *"The recommended pipe entry angles are limited by equipment capabilities and should
> generally be designed between 8° and 20°."*
> *"The recommended pipe exit angles should generally range from 5° to 12°."*

But **what the rigs are actually built to do is steeper than the "typically 10–12°" line that
`research/16` §B.17 quotes.** Every manufacturer sheet found in §3.1 says so — all accessed
2026-09-05, sources as cited on the §3.1 rows:

| Machine (dimensional source only) | Published rack / entry angle |
|---|---|
| Vermeer D24x40 S3 | **14–21°** |
| Vermeer D40x55 S3 | **15.5–20.5°** (3 m rod) · **12.5–17.5°** (4.6 m rod) |
| Ditch Witch JT24 | **18°**; **12°** with tracks on ground |
| Ditch Witch AT40 | **17°** (angle of approach) |
| TRACTO 18ACS / 20ACS | **13–19°** on the working drawing; inclination **0–30°** |
| TRACTO JCS130E | dimensioned working poses at **14°** and **30°**; inclination 0–30° |
| TRACTO JCS300 | inclination **0–29°** |
| Vermeer D100x140 S3 | **11–24°** |
| Vermeer D220x300 S3 | **10–17°** |
| Vermeer D220x500 S3 | **8.5–16°**; max operating angle **30°** |
| American Augers DD-440 | **10–18°** |

**Three rules fall out of that table, and all three are modelling instructions:**

1. **Small and mid utility rigs sit STEEPER (14–21°); maxi rigs sit SHALLOWER (8.5–17°).** The
   relationship is the opposite of what "bigger machine, steeper everything" would suggest, and
   it is consistent across two manufacturers and eleven machines.
2. **Long rods force a shallower rack.** Vermeer publishes this explicitly on one machine: the
   D40x55 S3 runs **15.5–20.5° with a 3 m rod but 12.5–17.5° with a 4.6 m rod**. A longer rod
   needs more clear height above the entry point, so the frame has to lie down to load it.
3. **The steepest angles need the machine jacked off its tracks.** Ditch Witch prints two
   numbers for the JT24: **18°**, and **12° "entry angle, tracks on ground"**. Vermeer sells
   the alternative as a feature — the D100x140's *"unique four-bar linkage rack and additional
   pads allow operators to set up entry angles of 11°–24° — increasing range attainable with
   tracks fully on ground."* So the tilt mechanism is a real design fork: **simple rams plus
   jacking the back up, or a four-bar linkage and stay on the tracks.**

**The exit angle is shallower than the entry angle, always.** That asymmetry is the profile's
signature and it exists because the pipe has to be lifted into the exit without over-bending
it. The five-part profile is fixed: *straight inclined tangent → upward sweeping curve →
horizontal segment → upward sweeping curve → straight exit tangent* (`research/07` §A1
`[GP1]`, `[SHORE]`).

### 3.3 The class bands — what a 330 kN machine is

From the classification `research/07` §D1 attributes to the HDD Consortium's *HDD Good
Installation Guidelines*:

| Class | Thrust / pullback | Rotary torque | Mud pump | Product pipe Ø | Bore length |
|---|---|---|---|---|---|
| Small / mini | **< 178 kN** (< 40,000 lb) | < 5.4 kNm | < 284 l/min | small | "not excessive" |
| **Medium / midi** | **178–445 kN** (40–100,000 lb) | **5.4–27.1 kNm** | **189–757 l/min** | to **406 mm** (16 in) | to **610 m** (2,000 ft) |
| Large / maxi | **> 445 kN** (> 100,000 lb) | > 27.1 kNm | > 757 l/min | 406–1,219 mm | to **1,981 m** (6,500 ft) |

Cross-checks in the same section: the European utility framing puts the *common* rig at
**100–300 kN** pulling force `[DCAE]`; Herrenknecht frames the whole HDD range as **441–4,905
kN** pull, power packs **278 to > 1,000 kW**, borehole diameters **0.2–2 m** `[HK]`; the top
of the world market is a tractor-trailer unit at **5,871 kN** `[WIKI-DB]`.

Verified individual spec points, from `research/11` §B.6 — useful because they show how
thrust, torque and rpm move together across the class:

| Machine (cited as a dimensional source only) | Thrust / pullback | Rotary torque | Max spindle |
|---|---|---|---|
| Ditch Witch JT20 | 75.6 kN thrust / **89 kN** pullback | — | **210 rpm** |
| Ditch Witch JT24 | 106.8 kN | 4.07 kNm | **225 rpm** |
| Ditch Witch JT40 | **177.9 kN** | 7.46 kNm | **250 rpm** |
| Vermeer D24x40 S3 | 124.6 kN | 5.69 kNm | — |
| Vermeer D40x55 S3 | **177.9 kN** | 7.46 kNm | — |
| Prime Drilling PD 250/90 RP | **2,500 kN** | **90 kNm** | 470 kW, 32 t, entry 6–15° |
| American Augers DD-440T | **1,957 kN** | 80 kNm rotary; **breakout 311.8 kNm** | rack-and-pinion maxi |

Note the ratio that repeats: at the midi boundary (**178 kN**) both a Ditch Witch JT40 and a
Vermeer D40x55 sit at **7.46 kNm** of rotary torque. The game's `hdd-rig` at **330 kN** should
therefore carry roughly **12–18 kNm**, and `data.js`'s `torque: 21` is close; the builder's
`torqueNm: 8000` is a JT40-sized figure on a machine claiming nearly twice a JT40's force
(§9-A).

### 3.4 Hole and tooling geometry — the ratios that size everything downhole

| Rule | Value | Source |
|---|---|---|
| **Final bore diameter** | the **lesser of** (product Ø + 12 in / 305 mm) **or** (**1.5 × product Ø**) | `research/07` §A4 `[GP1]` `[GP4]` |
| Normal over-sizing | **1.2–1.5 ×** carrier pipe Ø | `[PPI12]` |
| European framing of the same rule | **30–50 % larger** than the pipeline | `[HK]` |
| Small products ≤ 203 mm | minimum **51 mm annular space** all round (= product + 102 mm) | `[GP1]` |
| Number of reaming passes | typically **0–3** | `[GP1]` |
| Swab pass | a final pass at **the same size as the pullback reamer** | `[PPI12]` |
| Couplings allowance | couplings can be **up to 51 mm wider** than the pipe — size for them | `[MB-R]` |

**Hard-rock minimum spread** — a complete, internally consistent set of downhole diameters, and
the best single source of tooling *ratios* in the library (`research/07` §A2 `[GP4]`):

| Item | Minimum |
|---|---|
| Rig thrust | **222 kN** (50,000 lb) |
| **Drill pipe OD** | **73 mm** (2⅞ in) |
| **Pilot bore, tricone roller bit** | **121 mm** (4¾ in) |
| **Mud motor OD** | **86 mm** (3⅜ in) |
| Mud pump capacity | **511 l/min** (135 gpm) |

**Bend radius** (`research/07` §A1):

- Steel product pipe rule of thumb: **radius = 1200 × pipe diameter** `[SHORE]` — i.e. 100 ft
  of radius per inch of diameter, or **1.2 m of radius per mm of diameter**. A 300 mm steel
  pipe wants R ≥ 360 m.
- PE: cold bendable to **25 × nominal OD**, but *"some manufacturers limit the radius of
  curvature to a minimum of 40 to 50 times the pipe diameter"* to limit ovaling `[PPI12]`.
- **And the constraint that usually bites is the rod, not the pipe:** *"More often, the
  permitted bending radius of the drill rod controls the curvature"* `[PPI12]`.

**Rates, for animation timing:**

| Quantity | Value | Source |
|---|---|---|
| String rotation with a bent assembly | **< 50 rpm, typically ~30 rpm** | `research/07` §A2 `[GP3]` `[GP4]` |
| Max spindle speed, midi machines | **210–250 rpm** (the machine's ceiling, not the working speed) | `research/11` §B.6 |
| **Pullback speed** | **0.30–0.61 m/min** (1–2 ft/min) | `research/07` §A5 `[PPI12]` |
| Overpull allowance for stretch recovery | pull the nose out **3 %** longer than the pull; worst case **4 %** | `[PPI12]` |
| Fluid recovered / reused | **70–80 %** recovered, **90–100 %** of that reused | `research/07` §A7 `[VM-MUD]` |

**Reamer sizing, from the standard rather than from a trade article.** Westlake Pipe's
trenchless bulletin (URL above, accessed 2026-09-05) attributes this to **NASTT**, and its
Table 7 turns the rule into a three-band ladder — which is more useful than the single "1.5×"
because it says what to do at the ends:

> *"NASTT recommends a final bore hole diameter that is the smaller of 1.5 times the actual
> outside diameter (OD) or 12 inches (300 mm) larger than the actual OD of the product pipe.
> It may be advisable to use a bore hole diameter less than 1.5 times the product OD in
> collapsing soil formations. Also, it may be necessary to increase the final bore hole
> diameter by 25% if substantial swelling of the soil is expected to occur."*

| Product diameter | Bore hole diameter |
|---|---|
| **< 200 mm** (8 in) | product **+ 100 mm** (4 in) |
| **200–600 mm** (8–24 in) | product **× 1.5** |
| **> 600 mm** (24 in) | product **+ 300 mm** (12 in) |

### 3.5 Downhole tooling sized by rig thrust — the tables that scale the string

These are the numbers that let a modeller size the tooling to *this* rig rather than to a
generic one. Source for both tables: Melfred Borzall catalogue Edition 22
(<https://www.melfredborzall.com/media/footer_pdf/default/Melfred_Borzall_Catalog_V158_compressed.pdf>,
pp. 16–18 and 45; accessed 2026-09-05) — cited as a dimensional source only.

**Sonde / transmitter housing OD, banded by rig thrust:**

| Rig thrust | Housing Ø | Rear × front thread | Torque limit |
|---|---|---|---|
| < 8,000 lb (36 kN) | 2.5 in (64 mm) | FST200 | — |
| 10,000–20,000 lb (44–89 kN) | 2.75 in (70 mm) | 2 in IF | — |
| 20,000–35,000 lb (89–156 kN) | 3.25 in (83 mm) | 2⅜ in Reg | — |
| 25,000–40,000 lb (111–178 kN) | 3.5 in (89 mm) | 2⅜ IF × 2⅜ Reg | to 4,568 ft-lb |
| **50,000–80,000 lb (222–356 kN)** | **4.25 in (108 mm)** | **2⅞ IF × 2⅞ Reg** | to 10,148 ft-lb |
| 80,000–150,000 lb (356–667 kN) | 4.75 in (121 mm) | 3½ IF × 3½ Reg | to 13,879 ft-lb |

**A 330 kN rig therefore takes a ~4.25 in (108 mm) housing on 2⅞ in threads** — which is
exactly the thread the game's shop already specifies for its HDD pipe. The two agree; use
108 mm as the housing OD.

A second, independent housing ladder keyed to rig *model* rather than thrust
(<https://eliteundergroundtools.com/hdd-tooling-complete-guide/>, accessed 2026-09-05) runs
1.5 in → 3.25 in across the mini-to-midi range, carrying a **1.25–2.5 in sonde** inside. It
also gives the drive-chuck sizes at the other end of the string: **FST #600 (2.375 in OD)**
on a D24x40-class machine up to **FST #1000 (3.5 in OD)** on a D100x140-class one, with a
**saver sub** threaded onto the chuck as the sacrificial wear piece.

**Pullback swivel diameter, banded by capacity** (same catalogue, p. 45, "Deluxe DUB"):

| Pullback capacity | Swivel Ø |
|---|---|
| 5,000 lb (22 kN) | 2 in (51 mm) |
| 20,000 lb (89 kN) | 3.75 in (95 mm) |
| **30,000 lb (133 kN)** | **4.75 in (121 mm)** |
| 40,000 lb (178 kN) | 5.75 in (146 mm) |
| 60,000 lb (267 kN) | 6 in (152 mm) |
| 80,000 lb (356 kN) | 6.5 in (165 mm) |
| **100,000–120,000 lb (445–534 kN)** | **7.5 in (191 mm)** |
| 160,000 lb (712 kN) | 9 in (229 mm) |

**And the sizing rule that goes with it**, verbatim from
<https://eliteundergroundtools.com/hdd-tooling-complete-guide/> (accessed 2026-09-05):

> *"Always match the swivel's working load rating to at least 1.5× the maximum pullback force
> of your rig."*

For a 330 kN rig that means a swivel rated **≥ 495 kN (≈ 111,000 lb)** — a **7.5 in (191 mm)**
body. See §9-M: the game's shop currently sells this rig a **12 t** swivel.

**Reamer families and their cut diameters** (same catalogue), useful because they are genuinely
different silhouettes and the game only models one:

| Reamer | Character (verbatim from the catalogue) | Cut Ø offered |
|---|---|---|
| **Shredder** | *"Carbide cutter teeth rip through ground such as shale, sandstone or hardpan"*; integrated stabiliser ring at 18 in and larger; fluid channelled out through blades and shaft | 6–48 in |
| **Tornado** | *"Incredible mixing, pumping and cutting action"*; blade cut-outs let slurry flow through; gusseted blades | 6–48 in |
| **Hedgehog** | *"Tapered, bi-directional blades with carbide cutting teeth"*, push or pull; stability ring at 10 in and larger | 8–42 in |
| **Sabertooth** | *"Angled placement of cutters in a spiral pattern"* | 6–48 in |
| **Juggernaut** (fluted) | *"Deep, spiralled flutes allow for plenty of slurry to flow past"* | 4.5–8 in machined; 10–16 in cast |
| **Packer** | hardfaced, **toothless**, for swabbing the hole | 4–6 in |

Reamer **shaft** diameters across that range: **2.75 in (2 in IF box × box) · 3.25 in (2⅜ Reg)
· 4.25 in (2⅞ IF) · 4.75 in (3½ IF) · 6.5 in (4½ IF)**. So the shaft is roughly **⅓ to ⅕ of
the cut diameter** on mid-size reamers — the body is slim and the blades do the work.

**Mud recycler, matched to this class.** Vermeer R125 reclaimer
(<https://protips.vermeer.com/underground/2025/02/27/vermeer-r125-reclaimer-expands-mud-recycling-solutions-for-utility-hdd/>,
accessed 2026-09-05): **125 gpm (500 l/min)** at 20 % solids; **607-gal (2,298 l) water tank**;
**2.60 m long × 2.16 m wide**; *"a double screen deck and six 4-in (10.2-cm) long-body
hydrocyclones"*; engineered for rigs in the **24,000–40,000 lb (107–178 kN)** class. **Height
and weight `NOT SOURCED`.** Six cyclone cones, not two or three — that matters, because the
cone bank is the reclaimer's silhouette.

### 3.6 Rod construction dimensions — adjacent class, flagged as such

From `PD_DrillRods_1701.pdf` (a **DTH** rod table, not an HDD one — transfer construction, not
sizes):

| Property | Value |
|---|---|
| OD range | 48 – 194 mm |
| **Wall thickness** | **6.3 mm** across 48–102 mm OD |
| Lengths offered | **1.0 / 1.5 / 2.0 / 3.0 m** |
| Mid body | cold-drawn seamless, API N-80 (to 140 mm); submerged-arc welded API J-55 (168–194 mm) |
| Tool joints | micro-alloyed steel, **surface hardened 58–62 HRC** |
| Sealing | **O-ring seated in the thread box** |
| Wrench flats | 4-way, e.g. 65 × 40 mm |

The **6.3 mm wall on a 48–102 mm tube** is the useful transferable number: it says a drill rod
is a *thick*-walled tube — the bore is roughly three quarters of the OD, not a thin pipe. The
**4-way wrench flats** are a DTH feature and should **not** be copied onto an HDD rod, whose
vice grips the tube body or the upset (`NOT SOURCED` which).

### 3.7 Drill-rod bend radius — published, per rod, and much tighter than the pipe rule

**Do not apply the product-pipe rule to drill rod.** The 100 ft-per-inch (1200 × D) rule in
§3.4 is for *steel line pipe*. Drill rod is published per rod and runs roughly **half** that.
All rows from the manufacturer sheets cited in §3.1, accessed 2026-09-05:

| Rod | OD | Published min bend radius |
|---|---|---|
| Vermeer 2.38 in Firestick | 60 mm | **33 m** (108 ft) |
| Ditch Witch 2.25 in Power Pipe HD | 57 mm | **35.7 m** (117 ft) |
| TRACTO EL-D67 | 67 mm | **32 m** |
| Vermeer 2.63 in Firestick | 67 mm | **44.2 m** (145 ft) |
| TRACTO EL80 | 81/68 mm | **35 m** |
| TRACTO TD73 | 73/63 mm | **55 m** |
| TRACTO TD82 | 82 mm | **60 m** |
| Vermeer 3.5 in Firestick | 89 mm | **60 m** (197 ft) |
| TRACTO EL D101 / EL95 | 101 / 98 mm | **55 m** |
| TRACTO EL D104 | 104 mm | **70 m** |

The **1000 × D** figure for the product pipe is corroborated independently by a DNV / Subsea 7
conference paper (*Methodology for Definition of Bending Radius and Pullback Force in HDD
Operations*, IBP1070_09, Rio Pipeline 2009, <https://www.osti.gov/etdeweb/servlets/purl/21245434>,
accessed 2026-09-05): *"It is usual in designing HDD paths to consider a bending radius equal
to 1000 times the nominal diameter of the pipe to be installed. Another general 'rule-of-thumb'
for the bending radius is 100ft/1in diameter for steel line pipe, which is equivalent to 1200
times the nominal diameter of the pipe."* The same paper puts the practical design range at
**1000 D to 2000 D**.

**For the game's 2.875 in (73 mm) rod the sourced comparables are 44–60 m.** The shop copy for
`hdd-pipe-2875` currently says *"made to bend to a 40 m radius"* — slightly tighter than
anything published for that size. See §9-N.

### 3.8 Ratios a modeller can actually use

Ratios survive a change of class; absolutes do not. These are the ones worth building to.

**Machine proportions, derived from the general arrangements in §3.1:**

- **Length : width ≈ 3.4 : 1 to 4.5 : 1.** JT24 5.7 / 1.66 = 3.4; D24x40 6.1 / 2.26 = 2.7;
  AT40 7.50 / 2.36 = 3.2; JCS300 9.05 / 2.55 = 3.5; D220x300 11.3 / 2.54 = 4.5; DD-440
  15.7 / 2.5 = 6.3. **The machine gets proportionally narrower as it gets bigger**, because
  width is pinned by road transport and length is not.
- **Transport height : width ≈ 0.85 : 1 to 1.25 : 1.** These are boxy, road-legal packages —
  roughly as tall as they are wide, and they duck under bridges. Nothing about an HDD rig is
  tall.
- **Working height ≈ 1.4–1.6 × transport height.** JCS300: 2.98–3.21 m transport → **4.37 m**
  working. JCS130E: 2.78 m transport → 3.42 m at 14° → **4.65 m at 30°**. The rack going up is
  most of the difference, and **the steeper the angle the taller the machine** — at 30° a rig
  is over half a metre taller than at 14°.
- **Rack length ≈ 0.75–0.95 × machine length.** Read off Vermeer's transport drawings, where
  the rack callout (e.g. 26.8 ft rack on a 43.1 ft machine for the D220x500 with a 20-ft rack)
  is the dominant single member. The beam is *most of the machine*, and the powerpack and cab
  are tucked behind it.
- **Rod length ≈ 0.5 × machine length.** 3 m rods on a 6.1 m D24x40; 4.5 m rods on a 9.05 m
  JCS300; 6.1 m rods on an 11.3 m D220x300. This is remarkably stable across the whole class
  and it is a very good sanity check on a model: **stand a rod against the machine and it
  should reach about halfway.**
- **Weight scales with force, roughly linearly, at ~65–80 kg per kN.** JT24 6,736 kg / 107 kN
  = 63; D24x40 9,389 / 124.6 = 75; AT40 9,800 / 178 = 55; 25N 19,000 / 245 = 78; **JCS300
  23,600 / 300 = 79**; D220x300 33,566 / 1,077 = 31. Below the maxi class the band is tight.
- **On-board rod capacity is 28–75 rods, i.e. 85–315 m — not hundreds.** JT24 large box **40
  pipe**, small box **28 pipe**; D24x40 and D40x55 **500 ft (152 m)**; D100x140 **135 ft (41 m)**
  in the permanent rod box, **270 ft (82 m)** stacked; TRACTO 18ACS/20ACS **70–75 rods,
  210–225 m**; **JCS300 70 rods, 315 m**; 25N **288 m**. See §9-B.
- **Carriage rapid-travel speed 36–73 m/min.** D24x40 240 fpm (73.2 m/min); JT24 210/216 fpm
  (64/66 m/min); JT40 and AT40 180 fpm (55 m/min); D100x140 200 fpm (61 m/min); D220x300
  120 fpm (36.6 m/min); TRACTO max feed rate 36 m/min. **That is the empty-return speed, not
  the drilling advance** — the carriage snaps back for the next rod in seconds and then creeps
  forward while drilling.


- **The beam is set at 1 : 4 to 1 : 7 (rise : run).** An 8° entry is 1 : 7.1; a 16° entry is
  1 : 3.5; the manufactured-for 10–12° is **1 : 5.7 to 1 : 4.7**. Build the beam so the
  gradient reads as *ramp*, not as *mast*: at 12°, the far end of a 6.6 m beam is only **1.37 m**
  higher than the near end. **The whole machine is low.** This is the proportion the game most
  needs to feel in its bones — an HDD rig is longer than it is tall, which is true of nothing
  else in the fleet.
- **Rig setback ≈ 0.15–1.0 × the beam length.** 0.9–6.1 m of clear ground between the beam nose
  and the entry point `[GP1]`, against a 6.6 m beam. Even the minimum is a visible gap; the
  entry pit lives in it.
- **Final bore ≈ 1.5 × product pipe OD**, and **each ream pass steps, it does not jump** —
  0–3 passes `[GP1]`. If the game shows a reamer and a product pipe together, the reamer must
  be visibly half again as wide.
- **Pilot bit ≈ 1.65 × drill rod OD** (121 mm bit on 73 mm rod, hard-rock minimum `[GP4]`).
  The head is *not* much fatter than the string — this is a small hole made by a small tool,
  and the drama is all in its length.
- **Mud motor ≈ 1.18 × rod OD** (86 mm on 73 mm). A mud motor is a long slim sub, barely
  wider than the pipe.
- **Annular clearance ≥ 51 mm all round on small products** `[GP1]` — that is the gap the mud
  and cuttings travel in, and it is narrow. A cross-section render should show a thin annulus,
  not a pipe rattling in a tunnel.
- **Rod wall ≈ 0.09–0.13 × OD** (6.3 mm on 48–102 mm, adjacent class). Cut rod ends read as
  *thick*.
- **Rotation is slow: ~30 rpm working, 210–250 rpm maximum.** One turn every two seconds is
  the look. A blurred spindle is wrong.
- **Pullback is very slow: 0.3–0.6 m/min.** A 4.6 m rod takes **8–15 minutes** to come out. HDD
  is not a fast-cutting animation; it is a slow, relentless, continuous drag.
- **The spread is ~50–100 × the rig in plan.** A 30 × 46 m entry plot around a machine perhaps
  8 m long. If the camera can see the whole rig, it is seeing a small fraction of the job.

**Still NOT sourced, and NOT to be inferred from the current mesh:** beam **section** width and
depth; carriage **stroke** as a published figure (only carriage *speed* is published anywhere);
pipe-box rows × columns; track gauge and shoe width; ground clearance except on the JT24
(147 mm). These are §8 items — the mesh's current values for them are plausible art, not
measurements, and must not be quoted back as facts.

### 3.9 The component LAYOUT — closed 2026-09-05 by the manufacturer's own overview diagram

**This section did not exist before the `blender/hdd_rig.py` modelling pass, and it closes the
largest remaining practical gap: not "how big is it" but "what is where".** Ratios and
envelopes tell a modeller the box the machine fits in; they do not say whether the engine is in
front of the cab or behind it, and every earlier section of this document is silent on it.

**The source is a numbered component overview printed on the TRACTO GRUNDODRILL 18ACS / 18N
factory sheet** (`en.tracto.com` Brand Portal, EN edition; text-extracted in full 2026-09-05;
cited as a dimensional source only per DOMAIN.md §10). Ten callouts, verbatim:

| # | Callout, verbatim |
|---|---|
| 01 | *"Comfort cabin hydraulically-adjustable and vibration, dampened, user-friendly, clear layout, **can be positioned flexibly**"* |
| 02 | *"**Large rod magazine** — up to 225 m of TD 73 jet drilling rods or 210 m of ELICON 80 rock drilling rods on board"* |
| 03 | *"**Anchoring system** for enhanced stability while drilling"* |
| 04 | *"**Hydraulic loading crane** for self-sufficient handling of optional stacking boxes, drilling rods and attachments"* |
| 05 | *"**Bentonite collecting tray** — optionally with Bentonite suction pump"* |
| 06 | *"**Two stabilisers** — maximum stability, **variable inclination of the cradle for an ideal penetration angle**"* |
| 07 | *"**Broad undercarriage** — with **rubberised steel tracks** — extremely mobile and self-supporting"* |
| 08 | *"**High performance bentonite pump** — for rapid reaming speed and large reaming diameters"* |
| 09 | *"**Diesel engine** with the highest output of its class"* |
| 10 | *"**Large GRP hood** — easily accessible for service and maintenance"* |

**Read in plan order from the drilling end, that is the machine's arrangement:**

> **NOSE** → bentonite collecting tray (05) + two stabilisers (06) → anchoring system (03) →
> hydraulic loading crane (04) → rod magazine (02) → cabin (01) → bentonite pump (08) →
> diesel engine (09) under the GRP hood (10) → **REAR**

with the undercarriage (07) under the middle of it. `blender/hdd_rig.py` is built to exactly
this order.

**Four things fall out of it that no other source in this document states:**

1. **The mud pump is ON the rig and it sits between the cabin and the engine**, in its own bay
   rather than under the engine hood. §4.7 already knew the rig carries the high-pressure pump;
   this says where. The JCS300's is a **750 l/min @ 60 bar** unit and the 18ACS's **320–400
   l/min @ 90 bar** — a pump the size of a large chest freezer, not an incidental.
2. **The cabin sits BEHIND the rod magazine, not in front of it** — so the operator looks
   forward *along* the magazine and *down* the rack. That is the same problem the cab swivel
   solves (§4.7), and it is why the offset station in the game's mesh is defensible.
3. **The tilt mechanism is the STABILISERS.** Callout 06 does not call them outriggers or
   levelling jacks: it says they give *"variable inclination of the cradle for an ideal
   penetration angle"*. So on this machine family the entry angle is set by **jacking the
   machine**, not only by rams between chassis and beam — which is the mechanism §3.2 rule 3
   inferred from Ditch Witch publishing 18° and 12° "tracks on ground" for one rig, now
   confirmed directly by a second manufacturer. **And the beam is called a "cradle".**
4. **The anchor system and the drip tray are two callouts, not one** (03 and 05), and the tray
   is listed at the very nose with its own optional suction pump. §4.6 had them as one object.

**Corroborated on the JCS130E sheet**, whose overview repeats the same arrangement with three
useful additions: *"**Anchor plate as drip pan for drilling fluid** contributes to a clean
jobsite"*, *"Undercarriage options with a choice of **rubber, steel or rubberised steel
tracks**"*, and — for the magazine — *"Quick connection of an **additional drill rod box** with
automatic retrieval via the drill rod crane"*. **The crane exists to serve the rod box**, which
is why those two callouts sit together on both sheets.

### 3.10 Pose geometry — the same machine dimensioned at two rack angles

**The most useful geometric find of the modelling pass, and the one that says what happens when
the game drives `pivot:rack`.** The GRUNDODRILL JCS130E sheet (EN, text-extracted 2026-09-05)
dimensions **one machine in three poses**, which nothing else in this document does:

| Pose | L × W × H |
|---|---|
| Transport | **7,020–7,484 × 1,910–2,577 × 2,782 mm** |
| Working, **14°** | **8,365–8,637 × 1,910–2,577 × 3,424 mm** |
| Working, **30°** | **7,175–7,537 × 1,910–2,577 × 4,652 mm** |

*(the L and W ranges are "depending on configuration"; H is single-valued.)*

**Two rules, and both are modelling instructions:**

1. **Coming down makes the machine LONGER.** Transport → 14° adds **~1.2–1.35 m of length** and
   ~0.64 m of height. The rack extends forward off the nose as it lowers, so the working
   footprint is *bigger* than the transport one. This is the opposite of every other machine in
   this game, where deploying a mast makes the footprint smaller and the machine taller. It
   also reinforces §9-E: the beam folds **down and back** to travel, never up.
2. **Standing up makes it SHORTER and TALLER.** 14° → 30° costs **~1.15 m of length** and gains
   **~1.23 m of height**. Rack angle drives overall height hard, so any transport- or
   clearance-checking logic has to read the angle.

**And an honest negative result, recorded because it stopped an invention.** Those two deltas
**cannot both be produced by rotating a rigid beam about a single fixed pivot**: the length
change implies an effective radius of ~11.0 m and the height change one of ~4.8 m, on a machine
8.6 m long. So the real linkage is doing something more — almost certainly **tipping the whole
machine on its stabilisers as well as rotating the cradle**, which is exactly what §3.9 callout
06 describes. **The exact linkage remains `NOT SOURCED`** and must not be reverse-engineered
from three envelope numbers. `blender/hdd_rig.py` therefore gives the game one honest
`pivot:rack` plus a separate `slide:` pair for the stabilisers, and says so at the constant.

**Also newly read off the same family of sheets** (all accessed 2026-09-05):

- **18ACS dimensioned poses**, which carry the rack-angle callout directly on the drawing:
  **working 7,150 long × 3,150 high with "13–19°" printed against the rack**; **transport
  6,700 × 2,350 × 2,620 mm**. This is the drawing §3.2's rack-angle table cites.
- **JCS300**: *"Up to **six additional rods** can be reloaded simultaneously"* — the mechanism
  behind the stack-up box, quantified.
- **Vermeer D40x55 S3** (PN 296431556, read in full): with the **4.6 m × 67 mm** rod its
  **carrying capacity is 160 m — about 35 rods**, against 152 m / ~50 rods for the 3 m rod. So
  a longer rod does *not* buy more metres on board; it buys fewer, larger pieces, which is a
  real trade and not a spec-sheet artefact. Also *"Breakout system: **Standard hydraulic
  vise**"*, *"**Stakedown system: Standard**"*, and *"**Drilling lights: Standard**"* — the
  only sourced statement anywhere that work lights are standard fit on this class (the
  **count** remains `NOT SOURCED`, §8.5). And **"Min bore diameter 4 in (10.2 cm)"**, an
  independent check on §3.4's 121 mm pilot.
- **18ACS**: bentonite pump **320 / 400 l/min at 90 bar**, **fresh water tank 105 l**, diesel
  **180 l**, **bore length 400 m**, **upsizing 600 / outer pipe 500 mm**, sound **77 dB LPA /
  104 dB LWA**, workplace vibration **0.5 m/s²**.

---

## 4. Component inventory

Names below are the **industry's own**, taken from `DTD-Glossary-of-HDD-Terminology.pdf`
(cited `[DTD]` + page) and from Herrenknecht's HDD component list via `research/07` §D1
(cited `[HK]`). Where the game already uses a name, it is flagged. Where two names exist for
one object, both are given — a driller will use the field name.

### 4.1 The main beam — the machine's spine, and its reaction member

`[HK]` calls it the **main beam with rack-and-pinion drive**. `research/11` §D.6 calls the
pose *"a long, low, inclined frame — the only machine here that is not vertical"*. The game
calls it `rack` / `mast-pivot` / `feed-beam`.

**Why it matters visually.** Everything else on the rig hangs off it, and its angle *is* the
machine's identity at thumbnail size. Three sub-features carry the read:

- **The rack.** A toothed strip running the beam's full length, with the pinion and its
  gearcase on the carriage. This is what makes it a *rack*, not a mast, and it is the single
  detail that distinguishes an HDD beam from every other feed rail in the game (which use
  chain or cylinder feed). See §9-D — it is currently absent.
- **The nose.** The low, forward end. It carries the **break-out unit**, the **rod wiper**,
  the anchor tie-in, and it is the point that must be set back **0.9–6.1 m** from where the
  string enters the ground (`research/07` §A1 `[GP1]`).
- **The tilt mechanism.** Rams (or a four-bar linkage — §3.2) between chassis and beam foot set
  the entry angle. The angle is *set-up geometry*, not a live control: the crew levels, angles
  and anchors the rig before the first rod goes in, and on the steeper settings **jacks the
  back of the machine off its tracks** (Ditch Witch publishes 18° vs 12° "tracks on ground" for
  the same rig).
- **The catwalk.** Vermeer's D220x500 S3 sheet (§3.1) is explicit: *"The **full-length catwalk**
  provides access to the entire length of the rack for ease of wire lining and assisting in the
  rod loading process."* A **walkway running the whole length of the beam, alongside it**, is
  therefore real hardware on the larger machines, and it is where the crew stands. The game's
  mesh has none. It is also the single best place to put a figure in a staged shot.

**Section type.** `NOT SOURCED` for HDD specifically. `buildFeedBeam` builds a two-web
open-front channel with a dark back plate and transverse diaphragms, which is a plausible and
internally consistent choice and reads well; there is no local drawing to check it against.
Do not represent it as verified.

### 4.2 The carriage — `[HK]`'s "carriage (main drive)"

The rotary drive rides the beam on the rack. It does four things at once: **rotates** the
string, **pushes** it (thrust), **pulls** it (pullback), and **passes drilling fluid** into
it. `[APE]`'s definition of the whole machine (§2) is really a definition of this component
plus the beam it slides on.

**Why it matters visually.** It is the only large moving object on the machine, and its travel
*is* the drilling animation: down the beam to push a rod in, back up to collect the next. It
must carry:

- a **rotary drive housing** with a visible gearcase and a spindle on the drill axis;
- the **pinion housing** engaging the rack (see above);
- a **swivel / fluid inlet** where the mud hose enters the back of the spindle — the hose has
  to follow the carriage over its full travel, which means a **moving hose loop** the length
  of the beam (`buildFeedBeam` already builds a cable carrier and a following hose loop for
  exactly this — keep it, and make sure the *mud* hose is in the bundle and is visibly the
  fattest line in it);
- **slide pads or rollers** on the beam rails, with the bolted-on hardened rail strips they
  eat (`buildFeedBeam` already models the rails as separately bolted and replaceable — that is
  a good, true detail: keep it).

**Speed.** With a bent assembly downhole, string rotation is **< 50 rpm, typically ~30 rpm**
(`research/07` §A2 `[GP3]` `[GP4]`), because *"the assembly oscillates in the bore when
rotated and may be severely damaged or prematurely worn if rotated at excessive speeds"*. So
the spindle turns **slowly and visibly** — not as a blur.

### 4.3 The break-out unit — the vice and the wrenches

`[HK]` names it the **break-out unit**. Field usage: **vise**, **breakout wrench**, **wrench
tongs**. The game builds it as `vice` with two jaws and cylinders, at the beam nose — the
right object in the right place.

**Why it matters visually.** It is the only part of the rig the crew physically touches every
few minutes. Every rod added on the pilot bore and every rod removed on pullback passes
through it, and the joint is made and broken there. It is therefore:

- the **greasiest, most polished, most chipped** thing on the machine (§6);
- the natural place for a **crew member to be standing** in any staged shot;
- a **two-jaw clamp plus a rotating wrench**, not a single vice — one jaw holds the string
  while the other turns the joint.

**It is open-topped, and it SLIDES.** Vermeer publishes the vise configuration on every sheet
(§3.1, accessed 2026-09-05): D100x140 S3 *"Angled, open-top"*; D220x500 S3 *"semi-open top
vise"*; D220x300 S3 *"Open-top, dual clamp"* with a **10.2 in (259 mm) diameter opening** and —
the detail worth having — **"vise slide travel 35.4 in (899 mm)"**. So on a large rig the whole
break-out unit **travels nearly a metre along the beam** to make and break the joint, and the
jaws are **open at the top** so a rod can be dropped in from above rather than threaded in from
the end. The game's vice is a fixed block with two side jaws; both of those are wrong in kind,
not just in detail. `NOT SOURCED`: slide travel and opening diameter for a 300 kN machine — the
899 mm / 259 mm figures are from a 1,077 kN rig and must not be transferred directly.

**Thread compound** lives here: *"an anti-seizing compound, frequently a high-pressure,
copper-petroleum based grease, used to prevent the drill rods threads from seizing"*
`[DTD]` p. 8. A copper-coloured, filthy tub or bucket with a brush in it, sitting on the
frame beside the vice, is one of the most authentic props available.

### 4.4 The rod wiper — the "doughnut"

*"A rubber or synthetic grommet placed over the drill rods during pullback to strip excess mud
from the rods before they are stowed"* `[DTD]` p. 8; field name **doughnut**, *"the rubber rod
wiper at the front of the drill rig that wipes mud off the drill pipe as it pulls back"*
`[MB-T]` via `research/07` §A7.

**Why it matters visually.** It is the boundary between the wet world and the dry one. Rod
coming out of the ground is coated in bentonite; rod going into the box is (mostly) not — and
the doughnut is where the transition happens, with a **collar of slumped grey mud around its
base** that never fully goes away. It is small, cheap and enormously legible. The mesh already
has a rubber ring at the collar; §9-I says name it.

### 4.5 The pipe box and the erector unit — **not a carousel**

`[HK]`: **erector unit** — the mechanism that moves a rod from storage into the drill axis.
`research/11` §D.6: **pipe box**. `research/07` §D2: *"a rack of parallel steel tubes alongside
or under the main beam, with an arm that swings one rod at a time up into line with the
carriage."*

**Why it matters visually.** It is the **second signature of the machine** after the slant
(`research/11` §D.6), and it is the thing most likely to be modelled wrongly, because every
other rod-handling rig in this game uses a vertical carousel and the temptation is to reuse
it. HDD rod lies **flat, in rows, parallel to the beam**, in an open rack with end stops —
you can see the rod ends. The count is visibly finite and visibly depleting.

**Internal arrangement: vertical COLUMNS, gravity-fed.** US Patent 7467670 B2 (Vermeer
Manufacturing, *Method and apparatus for indexing between selected columns in a drill rod
magazine*, <https://patents.google.com/patent/US7467670B2/en>, accessed 2026-09-05): rods are
*"stored in a plurality of columns within the storage magazine"*; **"gravity is utilized to
lower the drill rod within the respective columns"**; "outer walls" and "inner walls" form the
individual column compartments; the worked example uses **five columns**; and rods are removed
*"sequentially from the first column … proximal to the drill string"* working outward, with
column selection by *"mechanical stops … offset from one another"*. US 20090095526 A1 adds the
position: *"a rod magazine located generally **above and to the side of the rack frame** stores
drill rods"*, *"stored with their longitudinal axes parallel to one another"*, with *"a pipe
transfer mechanism … to move the drill rod from the magazine to a position in line with the
drill string."*

**So the box is a set of vertical columns whose rods drop as the stack is drawn down**, and it
empties **column by column, nearest the drill axis first** — not evenly. That is a much better
animation than a uniform fade, and the game's 4 rows × 8 columns with an alternating row offset
is already structurally compatible with it.

**Three published details worth stealing:**

- **The boxes stack, and they are demountable.** Vermeer D100x140 S3: *"**Stackable rod boxes**
  are easy to use with a single pin and patent-pending auto lock"* — and the capacity is quoted
  twice, **41 m in the permanent rod box** and **82 m stacked**, i.e. the second box doubles it.
  TRACTO JCS130E: *"Optional stack-up boxes make reloading additional drill rods a child's
  play"*, with *"fully automatic loading or unloading of the rod box from the stack-up box."*
  **A spare rod box sitting on the ground beside the rig, or stacked on top of the fitted one,
  is a correct and very cheap piece of site furniture.**
- **The loader stages several rods at once on big rigs.** Vermeer D220x300 S3: *"A **single row,
  sliding arm rod loader** allows for the staging of **five rods** at one time, increasing
  boring efficiency by minimizing rod loading time."*
- **The rods are rotated within the box on purpose.** TRACTO 18ACS: *"**Rotation of drill rods
  within rod box possible during normal operation**, which results in consistent use and
  consistent wear of the rods."* That is why a used rod rack does not have a few destroyed rods
  and a lot of clean ones — wear is deliberately evened out across the set (§6.3).

Rod construction, for the surface detail: HDD pipes are **friction-welded and integrally
forged**, with **optional hard banding as wear protection** (`perforator_drill_pipes_22.pdf`
p. 3). The adjacent-class Wassara table (`PD_DrillRods_1701.pdf`) adds what a friction-welded
rod actually looks like: a **cold-drawn seamless mid-body** with a **separately forged,
surface-hardened tool joint (58–62 HRC)** at each end and an **O-ring seated in the box** —
i.e. the tube is one colour and the two upset ends are another, with a visible friction-weld
line where they meet. **Hard banding** is a raised, rough, tungsten-bearing band around the
tool joint OD; on a used string it is the shiniest part of the rod because it is what rubs.

**Terminology to keep straight** `[DTD]` pp. 3, 7: **box** = the female thread; **pin** = the
male thread. The game already uses both correctly in `data.js`.

### 4.6 The anchor / stakedown — the part that makes HDD physically possible

The most under-appreciated component on the machine. `research/07` §D1: *"The whole assembly
is anchored — it has to react up to its full thrust and pullback into the ground."*

**Why it matters visually.** It is the entire answer to the question a viewer will ask
subconsciously: *how does a 27-tonne machine pull 33 tonnes without sliding backwards?* It
doesn't — the soil does. So the anchor must read as **structure carrying load**, not as pegs
in the dirt: a transverse member across the beam nose, stakes or anchors passing through it,
gussets into the beam, and a bearing foot. §9-G.

**The question of *what kind* of anchor is now answered: they are AUGERS — screwed in, not
driven.** US Patent 6497296 B1, *Anchoring system for a directional drilling machine*
(<https://patents.google.com/patent/US6497296B1/en>, accessed 2026-09-05), describes the
arrangement in enough detail to model it:

- **Two stake-down units** on a common stake-down mount at the front of the machine.
- Each uses a **power auger** — the patent's term covers devices with *"flights, threads,
  projections or similar structures"* — which resists movement by being *"screwed or embedded
  into the ground."*
- The mount is *"pivotally connected to the frame at a tilt axis"* which is *"transversely
  oriented relative to the thrust axis"* — so the whole anchor assembly **tips** as the rack
  angle changes.
- **One unit is fixed and the other is laterally movable** on a *"lateral extension member"*,
  so the operator can *"maximize the spacing between the anchors"* and dodge buried obstacles.
  **The two anchors are not symmetric, and that asymmetry is a real, visible thing.**

Corroborated by US 11879331 B2 (<https://patents.google.com/patent/US11879331B2/en>, accessed
2026-09-05), which states the principle outright — *"all directional drilling rigs should be
anchored to the ground to prevent them from axial movement caused by substantial forces
applied to a string of drill rods or casings"* — describes traditional anchors as **augers
"driven into the ground pushed by the cylinders and rotated by rotary drives"**, and adds the
scale limit: **"when the thrust force of a rig exceeds 100 tons, the machine is anchored to a
thrust wall"** of sheet piles or bored piles. (A 330 kN rig is ~34 tonnes-force, so it anchors
with augers, not a thrust wall.)

**Anchor hardware, as published by manufacturers** (sheets cited in §3.1, accessed 2026-09-05):

| Machine | Anchor / stakedown |
|---|---|
| Vermeer D24x40 S3, D40x55 S3 | *"Stakedown system: Standard"* |
| Vermeer D100x140 S3 | optional *"Spade Stakedown"* or *"Aggressive Rotary Stakedown"*, **weight 454 kg** |
| Ditch Witch JT40 / AT40 | standard anchor **340 kg**; HD anchor **590 kg** |
| TRACTO 18ACS / 18N | *"Anchoring system with drilling fluid collecting tray"* |
| TRACTO 20ACS | *"Anchor drilling system … with optimised auger profile"*; slurry pump and loading crane mount **on the anchor plate** |
| TRACTO JCS130E | *"Optional anchor bore system"*; *"**Anchor plate as drip pan for drilling fluid** contributes to a clean jobsite"* |
| GRUNDODRILL 25N | *"Anchoring hammer system"* |

**The best single modelling detail in this whole document is in that table.** On the European
machines the **anchor plate under the drill axis doubles as the bentonite drip tray** — TRACTO
says so explicitly on two separate sheets. So the plate at the nose of the rig is not just a
reaction member: it is a **shallow steel tray that catches returning mud**, and it is therefore
the wettest, dirtiest, most permanently caked object on the machine (§6.3). It also explains
where the slurry suction pump mounts.

**Anchor mass is not trivial**: 340–590 kg on a 178 kN rig, 454 kg on a 445 kN rig. These are
substantial forged/fabricated assemblies carried on the machine, not tent pegs.

`NOT SOURCED`: auger flight diameter, stake length, embedded depth, and holding capacity in kN.
**Do not invent them.** Also `NOT SOURCED`, and searched for specifically: **any evidence of
vacuum-based anchoring of an HDD rig** — nothing supports it; do not model it.

### 4.7 Chassis, power pack and operator station

- **Chassis.** `[HK]` lists five rig configurations, all visually distinct: **frame rig**
  (crane-dependent, arrives in pieces) · **trailer rig** (2-axle, self-contained) · **crawler
  rig** (tracked) · **modular rig** (containerisable) · **compact rig** (urban)
  (`research/07` §D1). `buildHDDRig` builds a **crawler rig**, which is a legitimate choice
  and needs no defence — but it is a *choice*, and the game could later use the same beam on a
  trailer for a mini tier.
- **Power pack.** Diesel, hydraulic tanks, cooler. On a crawler rig it sits behind the
  operator. Nothing here is HDD-specific.
- **Operator station — offset to the side, and that is correct.** The pipe occupies the
  centreline for the whole length of the beam, so the operator cannot sit behind it. The game
  places the station at `x = −1.15` with a canopy, two joysticks and a screen. **Keep this.**
  The screen matters: `[DTD]` p. 8 defines the **remote** — *"walkover equipment typically
  includes a direct reading receiver held by the locating technician and a remote unit that
  receives a radio signal containing information from the locator. The remote is located at
  the drilling machine and enables the driller to see the same information as the locator."*
  So the display in front of the operator is **repeating the locator's numbers**, and the
  driller is steering on data relayed by a person standing 60 m away in a field.
- **On the bigger machines the cab SWIVELS, and it changes the machine's footprint.** TRACTO
  publishes two different working envelopes for the same rig — 20ACS *"working, cabin swivelled
  out"* **6,700 × 2,350 × 2,620 mm** vs *"cabin swivelled in"* **7,150 × 2,350 × 3,150 mm**; and
  JCS300 *"cabin in"* **9,050 × 2,550 × 4,370** vs *"cabin out"* **9,050 × 3,220 × 4,370 mm**
  (§3.1). The cab swings **out to the side by ~670 mm** to give the operator a view down the
  rack past the drill string — which is the same problem the game solves with an offset open
  station. Vermeer describes the large-rig equivalent as *"an excavator-style cab (cab on) for
  fast, compact setup and view of the semi-open top vise, rack and rod loader"* (D220x500 S3).
- **An on-board crane, from the midi class up.** TRACTO 18ACS: *"The on-board crane facilitates
  easy handling of the rods, stacking boxes and additional components."* Vermeer D100x140 S3
  offers one as an option: **1,179 kg, max reach 5.95 m, 2,300 kg at 3.95 m, 360° rotation** —
  and note that fitting it raises transport height from **2.98 m to 3.56 m**, which is why it
  is optional. A small folded knuckle-boom crane behind the cab is a strong, true silhouette
  element the game's mesh does not have.
- **Mud pump and tank on the deck.** The rig carries the high-pressure pump that feeds the
  string; the *mixing and recycling* plant is a separate unit in the spread (§4.9). On-board
  bentonite pump output, from the TRACTO sheets (§3.1): **190 l/min @ 85 bar** (JCS130E, 130 kN)
  · **320–400 l/min @ 90 bar** (18ACS/20ACS, 180–200 kN) · **750 l/min @ 60 bar** (JCS300,
  300 kN). The game's `mudLpm: 340` sits between the 200 kN and 300 kN machines — reasonable,
  arguably a little low for 330 kN.

### 4.8 The downhole string — what the rig is actually pushing

In order, from the rig to the face:

| Component | What it is | Source |
|---|---|---|
| **Drill rod / drill pipe** | Friction-welded or integrally forged, pin one end, box the other, optional hard banding | `[PERF]` p. 3; `[DTD]` pp. 3, 7 |
| **Sonde / transmitter housing** | A sub with a milled window and a bolted cover, holding the sonde *"directly behind the drill bit in the drill string"* | `[DTD]` pp. 8, 9 |
| **Bent sub** *(hard ground only)* | *"a small bend… just behind the cutting head, which serves the same function as the slant on the face of a slanted-face bit"* — **approximately 2°** | `research/07` §A2 `[GP3]` `[HK]` |
| **Mud motor** *(hard ground only)* | Positive-displacement motor turning the bit on fluid flow so the string can stay still and steer | `research/07` §A2 `[JBT]` |
| **Pilot head / slant-face bit** | Asymmetric leading edge, carbide on the slant, jetting ports | `research/07` §A2 `[JBT]` `[GP3]` |

**Two corrections to the naive assembly, both sourced, and both change the mesh:**

**(a) The steer face belongs to the HOUSING, not to a separate bit.** From
<https://eliteundergroundtools.com/hdd-tooling-complete-guide/> (accessed 2026-09-05),
describing the transmitter housing: *"The cylindrical steel body that holds the electronic
locating transmitter (sonde) during the bore. Connects between the drill collar and the pilot
bit, and **its angled face (steerface) is what allows the operator to steer the bore path by
rotating the drill string to different clock positions**."* The housing also carries *"fluid
nozzle ports on nose."*

**(b) The cutting blade BOLTS ON to that steer face.** Melfred Borzall's catalogue (Edition 22,
URL in §3.5) describes *"machined dowel pins that mate the steer face to your blade"* — the
"**Pit Bull Ready**" feature, whose stated purpose is to *"reduce the risk of losing a blade
downhole"* — and lists bolt patterns per manufacturer: **5 or 6 bolts** (*"VER 6, 1/2 in
bolts"*, *"DW 5, 12 mm × 25 mm bolts"*, *"DW 6, 16 mm × 35 mm bolts"*) across body diameters
2.5 / 2.75 / 3.25 / 3.5 / 4.25 / 4.75 in.

So the real front end is a **three-part stack**: **drill collar → sonde housing carrying the
steer face → bolt-on blade**. The drill collar is *"a short, thick-walled steel sub … to
provide a rigid, non-bending transition between the flexible drill string and the
housing/bit assembly"* (Elite Underground Tools, same page). Blade cut diameters offered in
the catalogue run **4¼, 4½, 5 and 5½ in**.

**Jets: two, and they are a named feature.** The catalogue's SD housing page lists **"DUAL
SUPERNOZZLES — Double the jet power with two SuperNozzles"**, with replaceable nozzle and plug
parts. The game's `buildHDDPilotHead` builds **exactly two jet nozzles** — that is correct, keep
it.

**Where the hardfacing goes.** Same page: *"MORE HARDFACING — Robotically-applied carbide
hardfacing on all high-wear areas, **including 3× our standard hardfacing on the nose**, which
can increase the housing life up to 50 %."* So the carbide is **not evenly distributed**: it is
heaviest on the nose and on the leading edge, and the rest of the housing is plain steel. The
lid over the sonde cavity is retained by **coiled pins** — *"dual lid retention system uses a
coiled pin for extra lid security"* — not by the bolt ring the game currently models.

**The slots.** ⚠️ *Medium confidence — reached via a search summary of US patents 6470979 /
7600582 ("Sonde housing structure"), not fetched directly:* the housing carries *"a plurality
of longitudinally extending slots … provided to allow radio waves generated by the sonde to
emerge unimpeded from the sonde housing."* The same summary describes *"a tilted-face slant bit
with a head comprising a slant face facet and a front face facet"* — i.e. the two-plane
("bent") construction `[GP3]` names. Treat the slot description as probable, not proven, and
do not quote a slot count.

**`NOT SOURCED`, searched for specifically: the slant-face angle in degrees.** Melfred Borzall
markets bits with *"extra taper to steerface for quicker steering"* and a *"steep taper
Ultrabit"* but publishes no angle anywhere. The game's `slantDeg: 15` is an invention and must
stay flagged as one.

**The steering geometry — the single most important paragraph in this document.**

The head does **not** bend to steer. It is *oriented* and *shoved*:

> *"rotation is stopped and the drill head slanted face of the bit is preferentially oriented
> in the borehole. The drill rig then pushes the entire drill string forward. As the slanted
> face of the drill bit is pushed against the soil, the entire assembly is deflected in the
> desired direction."* — `[GP3]` via `research/07` §A2

`[DTD]` p. 4 says the same thing in one line, under *deflection*: **"The drill head is steered
by pushing it into the formation without rotation."** To go straight you **rotate** while
thrusting `[JBT]`. And the orientation is read off a clock face: *"the operator aligns the
drill bit using a **clock-face system: 12 o'clock steers up, 9 o'clock steers left, 6 o'clock
steers down**"* `[JBT]` (so 3 o'clock steers right).

**What this means for the model and the animation:**
- The slant face must be **visibly asymmetric** and its orientation must be **readable** from
  outside — that is the whole steering interface. Bits come in a "flat" construction and a
  more popular **"bent"** construction *"giving a two-plane slanted-face for more aggressive
  steering"* `[GP3]`.
- In **slide**, the string does not rotate at all — it slides forward with the face held at a
  fixed clock position. In **rotate**, it turns. Those are two completely different
  animations, and they are the game's core HDD control (`research/07` §F3).
- There is a limit: *"There are limits to which the rods can be pushed before they deflect
  excessively"* `[DTD]` p. 4.

**On the pullback pass**, from the exit end back:

| Component | What it is | Source |
|---|---|---|
| **Back reamer** | *"A tool designed to enlarge a pilot hole… attached to the drill string once the drill head exits the ground"* | `[DTD]` p. 2 |
| — **fly cutter** | *"open blade configuration. Also sometimes called a 'wagon wheel'"* | `[MB-T]` via `research/07` §A4 |
| — **compaction reamer** | *"enlarges a borehole diameter through compaction of the soil surrounding it"* | `[DTD]` p. 4 |
| — **wing cutter / wing reamer** | *"a reaming tool with wing-shaped extensions… used to effectively mix the soil cuttings with the drilling fluid"* | `[DTD]` p. 9 |
| — **barrel / pig** | stabiliser barrel used to **swab** the hole | `[MB-T]` |
| **Swivel** | *"connected to the pipeline pullhead via a swivel. The swivel prevents any translation of the reamer's rotation into the pipeline string"* | `[SHORE]`, `[DCAE]` via `research/07` §A5 |
| **Pull head** | The fitting that grips the product pipe. A separately specified item | `[APE]` via `research/07` §D |
| **Chinese finger** | *"A woven wire device used to pull materials into a bore. The finger is placed over the material. When it is pulled, it tightens on the material, becoming tighter the harder it is pulled upon."* | `[DTD]` p. 4 |
| **Product pipe** | Usually fused HDPE, with a bead at each joint; or welded steel | `research/07` §A5 `[PPI-HDD]` |

A **forward reamer** is the same tool pushed the other way, used for a **blind / single-entry
well** where there is no exit `[DTD]` pp. 3, 5. Worth knowing the word exists; the game's
crossings are all double-entry.

### 4.9 The rest of the spread — two thirds of the picture

Not on the rig, but the rig is meaningless without them. `[APE]`'s canonical list via
`research/07` §D: rig · drilling system components · downhole assembly and reaming equipment ·
**downhole pressure sub** · guidance and control system · pulling head · swivels · rollers ·
solids separation and fluid recirculation · pipe fusion equipment.

| Item | What it looks like | Source |
|---|---|---|
| **Mud recycler / reclaimer** | A skid or trailer: a dry-bentonite hopper on top, a bank of open rectangular tanks, a **vibrating shaker screen** throwing wet sand into a spoil pile, and **cyclone cones** (desander then desilter) above the tanks with grit spraying from the underflow | `research/07` §D3 `[APE]` `[WIKI-DB]` |
| **Mud tanks and mixing** | *"self contained, closed"*, must **continually agitate**, in-line filters on the delivery side | `[APE]` |
| **Entry pit** | At the toe of the beam, sized to *"contain the expected return of drilling fluids and soil cuttings"*, ringed by a **305 mm** berm | `[APE]` via `research/07` §D5 |
| **Exit pit** | Same, at the far end | `[APE]` |
| **Product pipe on rollers** | A single continuous string stretching to the horizon; *"sufficient number of rollers shall be used to prevent excess sagging"* | `[APE]` |
| **Pipe fusion machine** | At the exit end, joining HDPE | `[APE]` |
| **Vacuum excavator** | Truck with a horizontal cylindrical debris tank, boom-mounted suction hose, water tank and blower | `research/07` §D4 `[APE]` |
| **The locator** | **A person on foot**, walking the bore line with a handheld receiver, stopping at the front and rear locate points | `[DTD]` pp. 5, 6, 7 |
| **Excavator at the exit pit** | Digs the pit, handles spoil, helps the pullback | `research/16` §A.17 |

**Footprint** (`research/16` §A.17, `research/07` §D5, from `[PPI12]`): entry plot
**30 m × 46 m** for a 305 m crossing, **61 m × 91 m** for 914 m+; exit **15 m × 30 m**; pipe
stringing corridor starting **~23 m** beyond the exit and **11–15 m** wide.

---

## 5. Distinctive features (thumbnail silhouette)

The five things that identify this machine at 64 px, in order of how much work each one does.

1. **The slant.** A long, low frame raked at **8–20°** into undisturbed ground
   (`research/07` §A1). `research/11` §D.8's one-line disambiguation for this machine is
   exactly this: *"6°–15° slant, pipe box, and a second site over the horizon."* **Nothing
   else in the game's line-up leans.** Every other rig is vertical, near-vertical, or a boom
   swinging around a vertical hole. Get the angle wrong and it reads as a broken mast; get it
   right and it reads as HDD instantly. The beam should also be **long relative to the machine
   under it** — the frame, not the chassis, is the dominant mass. **And the whole thing is
   low**: the general arrangements in §3.1 give a 300 kN rig as **9.05 m long, 2.55 m wide and
   ~3 m high in transport**, i.e. roughly **3.5 times longer than it is wide**, with a rod
   standing about **half the machine's length**. Every proportion on this machine points along
   the ground.
2. **The absence of a hole under the machine.** This is the negative-space feature, and it is
   as diagnostic as the slant. There is no hole at the rig's feet, no casing standing up, no
   spoil ring around a collar. The work goes **sideways into flat, undisturbed ground a metre
   or two in front of the nose**, and the ground beyond the entry is *untouched* — that is the
   whole selling point of trenchless. A viewer's eye follows the beam and finds ordinary
   grass.
3. **The pipe box: flat rows of rod ends, horizontal, beside the beam.** Not a vertical
   carousel (§4.5, §9-B). At thumbnail size it reads as a **striped rectangular block** —
   dozens of parallel circles or lines — and the stripes are horizontal while the beam above
   them is raked. That mismatch of angles is itself a recognition cue.
4. **The staked nose and its grey puddle.** The forward end of the beam is pinned to the
   ground, and around the point where the string enters there is a **bunded pit of grey-brown
   fluid** with returns welling up (`research/07` §D5, `[APE]`'s 305 mm berm). Bentonite is
   the loudest colour on an HDD site and it is concentrated in exactly this one spot.
5. **The second site over the horizon.** HDD is the only method in the game with **two ends**
   (`research/11` §D.6). A single continuous **string of product pipe on roller stands running
   off to the edge of frame**, and **a person on foot with a handheld locator out in the
   middle of nowhere**, tell the viewer this job is hundreds of metres long without showing
   any of it.

**Negative space — the five things that must NOT be there:**

- **No mast, no derrick, no hoist rope, no crown sheave.** There is nothing to lift.
- **No vertical rod carousel.** §9-B.
- **No Kelly bar, no auger, no bucket on the ground.** Those belong to `foundation-bg` /
  `cfa-rig`.
- **No hammer on the frame.** That is `piling-leader` / `rm20`.
- **No spoil pile at the machine's feet.** The cuttings come back as *fluid*, into a pit, and
  leave in a vacuum truck. A conical heap of dry muck beside an HDD rig is wrong.

---

## 6. Materials, paint, and where wear and dirt accumulate

### 6.1 Paint

**`NOT SOURCED`.** No local document gives a paint breakdown, a livery layout or a colour for
any HDD rig, and there is no photograph in the library (§7). What can be said honestly:

- HDD rigs are **utility plant**, not foundation plant — they work on verges, in streets and
  on farmland, and the class convention is a **single strong body colour on the chassis and
  covers, with the structural beam in a darker second value**. That is a *convention*, not a
  citation; treat the specific colours as a game art decision.
- The `foundation-bg` reference's three-value split (dark graphite structure / saturated body
  / light safety furniture) transfers as a *method*, not as a palette.
- **Do not choose a colour that reads as a specific OEM livery.** DOMAIN.md §10. The two
  dominant real HDD liveries are strongly associated with two named manufacturers, and either
  one will be recognised.

Mapping onto the game's existing material buckets
(`paint · dark · black · accent · steel · worn · chrome · rubber · glass`):

| Surface | Bucket | Reasoning |
|---|---|---|
| Chassis, covers, engine housing, canopy | `paint` | body colour |
| Main beam webs and back plate, pipe-box frame, anchor beam | `dark` | the structure reads as a second, darker value — `buildFeedBeam` already does this deliberately |
| Beam rails, rack teeth, vice jaws, stake heads | `worn` | bare, rubbed, hardened steel |
| Drill rod bodies | `worn` with a mud gradient | see 6.3 |
| Hard banding on tool joints | `steel`, brighter than the rod | it is the part that rubs the hole |
| Carbide on the pilot head, picks on the reamer | `chrome`-adjacent bright, chipping to `worn` | tungsten carbide reads brighter and greyer than steel |
| Tilt-ram and vice-cylinder rods | `chrome` | game convention |
| **Rod wiper / doughnut** | `rubber` | it is literally a rubber grommet `[DTD]` p. 8 |
| Hoses | `rubber`, black | mud hose is fatter than hydraulic hose — model it as a visibly larger diameter |
| Operator screen, gauges | `glass` | the **remote** display, §4.7 |

### 6.2 Bentonite — what it is, and what colour it is

This is the one machine in the fleet that lives in drilling mud, so it is worth getting the
material right. From `[DTD]` p. 2:

> Bentonite is *"a clay mineral… noted for its ability to **swell** upon introduction of water
> into its crystal matrix"*; it is *"effective in building a **filter cake** that lines the
> borehole walls"*, has *"relatively high **viscosity and density**"*, and *"has a relatively
> **high lubricity**"*.

`[DTD]` p. 5 on **filter cake**: *"the cake that forms along the walls of the borehole,
composed of layered mineral platelets."*

Visually that means: **wet bentonite is a slick, faintly glossy, mid grey-brown slurry that
clings and slumps rather than runs; dry bentonite is a pale, chalky, cracking grey-buff crust
that dusts off.** Both states appear on the same machine at the same time — wet at the wiper
and the pit, dried and cracking on surfaces splashed an hour ago.

**It stains, and there is a specification clause that proves it.** `[APE]`, via `research/07`
§A7, requires the contractor to *"thoroughly clean the project area of any fluid residue upon
completion of installation and **replace any and all plants and sod damaged, discolored or
stained by drilling fluids**."* You do not write that clause about mud that washes off.

`research/16` §A.17 puts it plainly: **"HDD sites are unmistakably wet and grey-brown even in
dry weather."**

### 6.3 Where it cakes — the map

**Heaviest, permanent, never fully cleaned:**

1. **The rod wiper and the collar around it.** The single dirtiest object on the machine. A
   slumped grey collar at its base, drips down the beam nose beneath it, and a wet smear on
   the underside of everything within half a metre.
2. **The beam nose and the lower third of the beam.** Everything forward of the vice is inside
   the splash zone. The gradient should be strong: filthy at the nose, thinning up the beam,
   effectively clean at the top.
3. **The vice jaws and the break-out area.** Mud *plus* thread compound — greasy grey with a
   copper cast (§4.3). The jaw serrations hold it.
4. **A fan on the ground in front of the machine**, spreading from the entry point outward and
   sideways, walked flat by boots. This is the largest single area of mud in any HDD shot and
   it belongs on the *ground plane*, not on the rig.
5. **Track shoes, track frames and the chassis skirt.** The machine tracks through its own
   spill every setup.
6. **The lower rungs of any ladder or step, and the deck plate at the operator's feet.** Boot
   transfer. Chipped paint on the nosings underneath it.
7. **The anchor augers and their plate.** The augers are **screwed** in and out at every setup
   (§4.6), so the flights are **polished bright on their leading faces** and packed with soil
   between them, with rust and dried mud on everything that does not cut. The **anchor plate is
   also the drip tray** — it is the wettest, most permanently caked single part on the machine,
   and it should never be seen clean.

**The gradient that tells the story — the drill rod itself:**

- **New rod in the pipe box: clean**, factory finish, hard banding bright.
- **Rod that has been down the hole: coated** for its full length, with the wiper having taken
  the worst off — so it reads as *stained and darkened* rather than *dripping*.
- On the **pullback** pass the box therefore fills from clean to dirty as the job proceeds.
  Modelling the box with a few visibly cleaner rods at one end and mud-stained ones at the
  other is a cheap, true detail that no other rig in the game can use.

**Where it stays clean — just as important, because uniform filth reads as a texture bug:**

- **The top third of the beam**, above the splash zone.
- **The canopy roof, the top of the engine covers, the exhaust** — nothing throws upward.
- **The operator's screen and controls**, which are wiped every shift because they have to be
  readable; a clean rectangle inside a dirty machine is a strong authenticity cue.
- **The upper faces of the pipe box's top row** of unused rod.
- **The chrome ram rods** where they have been inside the barrel — a clean band at the wet end
  of a dirty rod.

**Other wear, non-mud:**

- **Grease** at the vice pivot pins, the carriage slide pads, the pinion housing and the beam
  rail ends — dark, streaked, catching dust.
- **Rail polish.** The bolted-on hardened rails have a **bright, mirror-worn stripe** where the
  slide pads run, and dull unpolished ends beyond the carriage's travel. That single stripe
  does more to show the machine works than any amount of dirt.
- **Rust** on the stakes, the anchor beam, the pit-side of the chassis, and any bracket that is
  unbolted for transport.
- **Chipped paint** on the beam nose (rod ends hit it), on the pipe-box end stops (rods drop
  in), and along the walkway edge — the game's `addWearStory` already chips at the walkway
  edge and it is right.
- **Thread compound splatter** — a copper-brown, greasy speckle radiating from the vice. Nothing
  else on any rig in this game has that colour.

---

## 7. Photo references

**There is no photograph of an HDD rig, an HDD spread, a back-reamer, a pilot head, an entry
pit or a mud recycler in `C:\Users\henri\Downloads`.** This is the weakest section of the
document and the honest answer is that the sweep found nothing.

**Method.** All ≈279 top-level image files (`*.jpg *.jpeg *.png *.webp`) were listed with
their pixel dimensions and file sizes and triaged by name and aspect; the plausible candidates
were opened. The subfolders `Atpa\` (drilling tools and bits — already swept for
`foundation-bg.md` §7) and the various project/brand folders were excluded as out of scope.

| Image | What it actually is | Useful for HDD? |
|---|---|---|
| `C:\Users\henri\Downloads\extrabilder51314847_large.jpg` (and `…852`, `…857`, `…867`, `…872`, `…882`) | **Opened.** A stack of large-diameter rusty steel pipe strapped in bundles in an overgrown yard, with an auction watermark. Casing or line pipe, not drill rod. | **Marginal — material only.** It is a genuinely good reference for **uniform orange-brown surface rust on stacked steel tube**, which is what a neglected rod rack looks like. Nothing else. |
| `C:\Users\henri\Downloads\00a0012.jpg` | **Opened.** A studio portrait of a person. | No |
| `rtg-rammtechnik-gmbh-rg-rammgerät-im-einsatz-pile-driver-in-action-2023.jpg.webp` | A driven-pile leader rig | **Contrast only** — a vertical raked leader with a hammer. The silhouette `hdd-rig` must not resemble. |
| `Surface_Drill_Rig_1000_0001.jpg`, `surface_top_hammer_drill_rigged_01.jpg`, `surface-drill-rig-…-smartroc-d65-….webp` | Surface top-hammer / DTH crawlers | **Negative reference.** These are the rigs whose **vertical rod carousel** must not be copied onto the pipe box (§9-B). |
| `Rotary_Drilling_Rig_1000_0001.jpg` | A rotary-Kelly piling rig render | Wrong class; useful to `foundation-bg.md`, not here |
| `kr-806-3gs-vertikal-laengs.jpg`, `3D-Bilde-4525JBR-transport-position-….png` | An anchor/micropile rig and a pile driver in transport pose | Wrong class. The second is at least a **useful precedent for a transport-pose reference shot** — which is the pose `hdd-rig` currently gets wrong (§9-E). |
| `Gemini_Generated_Image_*.png`, `ChatGPT Image *.png`, `r1_cinematic.png` | AI-generated imagery | **Reject as reference.** `research/18-visual-reference.md` already flags the AI-generated reel as a mood target, not a source of truth. An AI image of a drilling rig will invent hardware, and this document exists to stop exactly that. |
| `AdobeStock_*.jpeg`, `dth-bits-1024x683.jpg`, brand/UI/portrait/screenshot files (the large majority) | Stock photos, bit product shots, Drillity brand and UI assets, personal photos | No |

### What to acquire — a specific shopping list

This is the highest-value action anyone can take for this model. Four photographs would close
most of §8:

1. **A full side elevation of a midi HDD rig set up at the entry**, square-on, showing the beam
   angle, the beam length against the chassis length, the pipe box, and the ground in front.
   This one image would convert most of §3 from ratios to absolutes.
2. **A close-up of the beam nose**: vice / break-out unit, rod wiper, the anchor arrangement,
   and the string entering the ground. This is where the machine's identity and all of its dirt
   are concentrated.
3. **The carriage**, showing the rack and pinion, the slide pads on the rails, and the fluid
   swivel with its hose loop.
4. **The spread from above or from a distance** — rig, entry pit, reclaimer, tanks, and the
   pipe string running away — to fix the *relative* sizes of the machines in the scene.

A fifth, if it is going: **a back-reamer on the ground with a swivel and pull head attached**,
which is the only way to get the reamer/swivel/pull-head proportions honestly.

---

## 8. NOT SOURCED

Honest list. None of these may be invented, and none of them may be back-filled by measuring
the current mesh — the mesh's numbers are art, not evidence.

### 8.0 What was a gap and is now CLOSED

Recorded because the change matters: an earlier state of this document listed the machine
envelope as its largest hole. **The web sweep closed it.** Now sourced, with citations in §3:
overall L × W × H in transport and working poses for eleven machines from 107 kN to 1,957 kN;
weights; **manufacturer rack-angle bands**; rod length, OD, weight and bend radius by class;
**on-board rod capacity**; carriage speeds; anchor type (**augers**) and anchor mass;
**sonde-housing OD by rig thrust**; **pullback-swivel Ø by capacity**; reamer families and
shaft diameters; and mud-recycler plan dimensions.

Two of §9's warnings were **withdrawn or softened** by that evidence — the entry angle (§9-F)
and the carriage drive (§9-D). Both are recorded in place rather than quietly deleted.

**Closed again 2026-09-05 by the `blender/hdd_rig.py` modelling pass** (§3.9, §3.10). A gap
only shows up when somebody tries to build the thing, and this one did: the document could size
the machine but could not say **what sits where on it**. Now sourced, from the manufacturers'
own numbered overview diagrams and multi-pose dimensioned drawings:

- **the front-to-back component layout** — tray and stabilisers at the nose, then anchors,
  loading crane, rod magazine, cabin, bentonite pump, and the engine under a GRP hood at the
  rear;
- **that the on-board mud pump has its own bay between the cabin and the engine**;
- **that the cabin sits behind the rod magazine**, looking forward along it and down the rack;
- **that the entry angle is set by jacking the machine on its two stabilisers** — the sheet's
  own words are *"variable inclination of the cradle"* — confirming from a second manufacturer
  what §3.2 rule 3 had only inferred from Ditch Witch's two published angles;
- **how the envelope changes with rack angle**, from one machine dimensioned in three poses;
- **that work lights are standard fit** on this class (the count is still unsourced, §8.5);
- **that a longer rod buys FEWER metres on board**, not more — 160 m on a 4.6 m rod against
  152 m on a 3 m rod, same machine.

One thing the pass deliberately did **not** close, and recorded as a negative result instead:
the **rack tilt linkage** (§3.10). Three published envelope numbers are not enough to determine
it, and inventing a mechanism that fits them would have been exactly the failure this document
exists to prevent.

### 8.1 The machine envelope — what is still missing

- **Main beam length as a published figure**, and beam length as a ratio of chassis length.
  Vermeer's transport drawings carry the numbers but the PDF text layer does not carry the
  leader-line targets, so which callout labels the rack is **inference, not a citation**. The
  0.75–0.95 ratio in §3.8 is offered as orientation only.
- **No dimensioned GA exists in the local library**, and that remains true: the hypothesis that
  one of the `PD_W*` files might be one was tested on all ten and is **false** — they are
  Wassara water-hammer, water-pump and water-swivel sheets (§1). Everything dimensional here
  came from the web.
- **Beam cross-section**: width, depth, plate thickness, whether it is a welded box, an open
  channel, or a truss. `buildFeedBeam`'s two-web open channel is plausible and unverified.
- **Carriage travel / stroke**, and whether the carriage runs the *full* beam length. `[HK]`'s
  wording — *"a carriage that travels the full length of the beam on a rack and pinion"*
  (`research/07` §D1) — implies full travel, but that is a paraphrase in a secondary source,
  not a dimension.
- **Rack module, pitch, width; one rack or two.**
- **Track gauge, track shoe width, sprocket and idler diameters, roller count.**
- **Operating weight and transport weight** for a specific midi rig, from a datasheet.
- **Ground pressure**, and whether this class uses mats.

- **Beam cross-section**: width, depth, plate thickness, and whether it is a welded box, an open
  channel or a truss. Searched for specifically and **not found in any source** —
  `buildFeedBeam`'s two-web open channel is plausible and unverified.
- **Carriage stroke / travel** as a published number. Every manufacturer publishes carriage
  *speed*; **none publishes stroke**. `[HK]`'s paraphrase *"travels the full length of the
  beam"* (`research/07` §D1) is the only statement on it and it is second-hand.
- **Track gauge, shoe width, sprocket and idler diameters, roller count.** Only the JT24's
  **147 mm ground clearance** turned up.
- **Ground pressure**, and whether this class mats its working platform.

### 8.2 The anchoring system — now sourced in kind, still unsourced in size

- **Auger flight diameter, stake length, embedded depth.**
- **Holding capacity in kN**, and whether 330 kN is reacted entirely by the augers or partly by
  machine mass. (The one hard threshold found: **above 100 tons-force a rig is anchored to a
  thrust wall** instead — US 11879331 B2. A 330 kN rig is well below it.)
- **The anchor plate's dimensions**, though its *function* is now sourced twice over (reaction
  member and drilling-fluid drip tray, §4.6).
- **Vacuum anchoring** — searched for specifically and **no supporting source found at all**.
  Treat as non-existent unless someone produces one.

### 8.3 Pipe handling

- **Rod box rows × columns.** *Columns* are sourced (gravity-fed, five in one patent
  embodiment, emptied nearest-first); **rows per column are stated nowhere.**
- **Whether an HDD rod has wrench flats** or the vice grips the tube body / upset. The 4-way
  flats in the Wassara table are a **DTH** feature and must not be assumed onto HDD rod.
- **Hard banding** dimensions — band width, standoff, position relative to the tool joint. The
  *existence* is sourced (`[PERF]` p. 3, "optional hard banding as wear protection").
- **Whether the string is carried entirely on the machine or topped up from a pipe trailer** on
  a long bore. Capacities are now known (28–75 rods, 85–315 m) and are clearly less than a
  600 m bore needs — but no source says how the rest arrives.

### 8.4 Tooling geometry

- **Slant-face angle in degrees.** Searched for hard. Melfred Borzall markets *"extra taper to
  steerface"* and a *"steep taper Ultrabit"* and publishes **no angle anywhere**. The game's
  `slantDeg: 15` is an invention and must stay flagged as one.
- **Pilot head and reamer length as a ratio of diameter.** `buildHDDPilotHead` uses **3.2 ×**,
  `buildSondeHousing` **6 ×**, `buildBackreamer` **1.5 ×**. All three are the game's own
  choices and **none is sourced**; the sourced tooling numbers are diameters (§3.4, §3.5), not
  lengths.
- **Sonde housing slot count and geometry.** The longitudinal-slot description is ⚠️ *medium
  confidence* — a search summary of US 6470979 / 7600582, patents not fetched directly. Do not
  quote a slot count.
- **Back-reamer blade count and helix angle.** The game uses 4; the catalogue confirms open
  multi-blade bodies and gives cut diameters but names no blade count.
- **Pull head geometry** — still not modelled and still not dimensioned anywhere found.
- **Reamer body length.** Cut diameters (6–48 in) and shaft diameters (2.75–6.5 in) are sourced;
  **length is not.**

### 8.5 Appearance

- **Paint breakdown, livery layout and colour** for any HDD rig. Nothing local. §6.1.
- **Whether the beam is painted or bare** below the splash line.
- **Cab / canopy dimensions**, glazing layout, and whether this class has a cab at all or only
  a weather canopy over a seat.
- **Work-light count and positions** (`getWorkLights()` will want these).
- **Decal and warning-label placement conventions** for utility plant.

### 8.6 Photography

- **A photograph of any of it.** §7 lists the four shots that would close most of this section.
  This is the cheapest and highest-value gap to fill and it needs no research — just images
  dropped into `Downloads`.

### 8.7 Deliberately out of scope

Already owned by other packs and not re-derived here: the bore profile and design corridor,
frac-out mechanics, mud chemistry, crew roles and pay, hazard responses, the other trenchless
methods, and the site archetype layout. See `research/07-hdd-trenchless.md`,
`research/11-oem-anchor-geotech-hdd.md` and `research/16-site-archetypes.md` §A.17.

---

## 9. Domain-truth warnings — what the game currently gets wrong

Read against `buildHDDRig`, `src/rig/rigFactory.js` from l. 2992; the HDD tooling in
`src/rig/tools.js` §11 (`buildHDDPilotHead` l. 4565, `buildSondeHousing` l. 4617,
`buildBackreamer` l. 4648); and the data entries in `src/game/data.js`. **Line numbers are as
at the time of writing — `tools.js` moved by ~190 lines during this session, so re-locate by
function name, not by line.** Nothing in `src/` was edited.

**The spec block as it currently stands** (`buildHDDRig`, end of function; `rackLen = 6.6`,
`entryDeg = 16`, `rodLen = 3.05`):

```js
    spec: {
      id: 'hdd-rig', name: 'Halvard HD-330 Traverse',
      klass: 'Horizontal directional drilling rig', weightKg: 9600, powerKw: 130,
      rackM: rackLen, entryAngleDeg: entryDeg, thrustKn: 180, pullbackKn: 180,
      torqueNm: 8000, rodLenM: rodLen, mudLpm: 340,
      methods: ['hdd'], frameRadius: 6.0,
    },
```

**A lot of this rig is right.** The pose is right, the vice is in the right place, the pipe
box is a box, the operator station is offset to the side, the rod OD is 74 mm (2⅞ in — the
sourced hard-rock minimum, `research/07` §A2 `[GP4]`), and the shop copy for the steering
head, the pulling swivel, the locator and the mud motor is domain-accurate and should not be
touched. What follows is the list of things a working driller would notice.

---

### A. The machine contradicts itself across three files, and one of the contradictions is a class error

| Quantity | `buildHDDRig` spec | `data.js` rig entry | `data.js` description |
|---|---|---|---|
| Mass | `weightKg: 9600` | `transportTons: 27` | — |
| Thrust / pullback | `thrustKn: 180`, `pullbackKn: 180` | `feedForce: 330` | "33-tonne thrust/pullback" |
| Rotary torque | `torqueNm: 8000` (8 kNm) | `torque: 21` (21 kNm) | — |
| Power | `powerKw: 130` | `power: 186` | — |
| Rod length | `rodLenM: 3.05` | — | shop sells **4.6 m** pipe |

Mass differs by a factor of **2.8**, thrust by **1.8**, torque by **2.6**. The name
(`HD-330`), the description ("33-tonne") and `feedForce: 330` agree on **330 kN**, so that is
the number to keep; `thrustKn`/`pullbackKn: 180` is the outlier.

**And the source of the 9,600 kg is probably identifiable.** A **Vermeer D24x40 S3 weighs
9,389–10,092 kg** — at **124.6 kN**. So `weightKg: 9600` is a real and accurate mass, for a
machine with **a third of this rig's stated force**. Somebody took the weight of one class and
the force of another.

**The right target is now available.** §3.1 identifies a real 300 kN machine — the TRACTO
GRUNDODRILL JCS300, cited as a dimensional source only — and it lines the game's numbers up
almost perfectly:

| | Game `hdd-rig` | JCS300 (300 kN) |
|---|---|---|
| Thrust / pullback | 330 kN | **300 kN** |
| Torque | 21 kNm (`data.js`) | **13 kNm** |
| Power | 186 kW (`data.js`) | **231 kW** |
| Mass | 27 t (`data.js`) / 9.6 t (builder) | **23.6 t** |
| Rod length | 4.6 m (shop) / 3.05 m (builder) | **4.5 m** |
| Rod count on board | "220" (shop copy) / 32 (mesh) | **70** |
| Mud pump | 340 l/min | **750 l/min** |
| **Overall L × W × H, working** | mesh ≈ **6–7 m** long | **9.05 × 2.55 × 4.37 m** |

**Read the last row twice.** The current mesh — `trackLen: 3.9`, `bodyD: 3.60`, `rackLen: 6.6`,
with everything between the anchors at `z ≈ +0.9` and the engine at `z ≈ −5.3` — is roughly
**6–7 m long**. A real machine of this force is **9 m long and 23.6 t**. **The mesh is a third
too short and, by its own spec field, less than half the mass.** Whichever way that is resolved
— scale the machine up to its stated force, or drop the force to match a 6 m machine — the two
must be made to agree, because §3.8 shows the class scales its length far faster than its width
and this is exactly the proportion a viewer reads.

**And 330 kN is a *midi* rig, not a maxi one.** `research/07` §D1, quoting the classification
attributed to the HDD Consortium's *HDD Good Installation Guidelines*: **small/mini
< 178 kN · medium/midi 178–445 kN · large/maxi > 445 kN**. `research/11` §B.6 records the
same boundary from two independent trade sources and notes they disagree only in the middle,
not at the maxi line. The word **"maxi-rig" in the rig description is wrong by the game's own
research.** Call it a midi rig, or raise the force past 445 kN — but the mesh is not a maxi
machine: a real maxi is a semi-trailer-sized installation (`research/11` §D.6), and
`buildHDDRig` builds a 3.9 m crawler.

Consistency check that *passes*, and is worth keeping: `mudLpm: 340` sits inside the midi
band's **189–757 l/min** (`research/07` §D1). Do not change it.

### B. "Carousel" is the wrong word for the wrong object — and it appears twice

`data.js` rig description: *"33-tonne thrust/pullback maxi-rig with a **220-rod carousel**"*.
`data.js` item `hdd-pipe-2875`: *"Two hundred of them fill the **carousel**."*

**HDD pipe does not live in a carousel.** A carousel is the rotating vertical rod magazine on
a top-hammer or anchor rig, where rods hang parallel to a vertical mast. HDD rod lies flat in
a **box / magazine / rack** alongside or under the main beam, and an arm lifts one rod at a
time onto the drill axis. `research/07` §D2 describes exactly that — *"a rack of parallel
steel tubes alongside or under the main beam, with an arm that swings one rod at a time up
into line with the carriage"* — and names the mechanism with Herrenknecht's own term, the
**erector unit** (`research/07` §D1 `[HK]`). `research/11` §D.6 calls it the **pipe box** and
lists it as the machine's *second* signature after the slant.

**The mesh already gets this right** — `buildHDDRig` builds a `pipe-box` group with a 4 × 8
instanced grid and a `pipe-loader` arm. **Only the shop copy is wrong.** Change the word to
"pipe box" or "rod box" in both places; the geometry needs no change.

Two further notes on that same copy:

- **220 rods against a mesh that holds 32.** `rows = 4, cols = 8` = 32 rods of 3.05 m ≈ 98 m
  of string, against a method `depthRange` of `[50, 1200]` m. Whether a real midi rig carries
  its whole string on board or is fed from a **pipe trailer** in the spread is `NOT SOURCED`
  — but 220 rods is not what the model shows, and the two should agree.
- **Rod length disagrees with the shop.** `rodLenM: 3.05` in the builder; both shop pipe items
  are **4.6 m**. Pick one. (`research/07` §A2 marks HDD rod length `UNVERIFIED`, with the only
  usable inference being `[APE]`'s "per drill pipe length or 25 ft, whichever is more
  frequent", implying rods longer than 7.6 m exist on large rigs. So 3.05 m and 4.6 m are both
  defensible; being two different numbers in two files is not.)

### C. The main beam is built as a *flexing two-piece mast*. An HDD beam is a stiff reaction member

```js
  const stack = buildMastStack(T, ctx, root, { p: [0, 0, 0], height: rackLen });
  stack.pivot.rotation.x = -tilt;
  buildFeedBeam(T, ctx, stack.lower, { height: rackLen * 0.5, width: 0.60, depth: 0.36, q: q });
  buildFeedBeam(T, ctx, stack.upper, { height: rackLen * 0.5, width: 0.60, depth: 0.36, q: q });
```

`buildMastStack` exists to give a tall derrick two segments **so it can bow** under load — the
codebase says so itself, in the doc comment on its sibling `buildSimpleMast` (l. 1854): *"A
21 m derrick wants two segments so it can bow; a 2.4 m jumbo feed is a stiff rail and
splitting it buys nothing but a second merge scope."* A 6.6 m HDD beam **staked to the
ground** is the stiff-rail case, not the derrick case: it is the member through which the
machine's entire thrust and pullback is reacted into the soil (`research/07` §D1). It should
not visibly bow.

**And the seam is not merely implied — it is modelled.** `buildFeedBeam` ends with a
`splice` block that draws *"the splice flange: where a real mast is joined"* — a plate plus two
3-bolt rows — and it is **on by default** (`if (o.splice !== false)`), at the top of each
beam. `buildHDDRig` passes no `splice` option, so the two stacked 3.3 m halves put **a bolted
splice flange exactly halfway up the beam**. On a sectional derrick that is correct and
handsome. On a 6.6 m HDD beam it is a joint that should not be there.

Two concrete fixes:
1. Use `buildSimpleMast`, or one full-length `buildFeedBeam`, so there is **no mid-beam
   splice** and no independent diaphragm ladder and rail strip on each half.
2. It also saves a flex node on a member that should never flex.

### D. The carriage drive — I was going to call the chain wrong. It isn't. But it is modelled as the wrong *kind* of chain

`buildFeedBeam` builds two webs, a dark back plate, transverse diaphragms, two bolted-on
hardened rails — and then a **feed chain**: a chain strip with instanced links down the back of
the section, a **feed motor and idler sprocket** at each end with guards, and a **chain tension
screw at the foot**. That is a well-observed chain feed of the kind used on drill masts.

**My first conclusion here was that this was simply wrong**, because `research/07` §D1 quotes
Herrenknecht's component list as *"main beam with rack-and-pinion drive"* and `research/11`
§D.6 records rack-and-pinion on the maxi class. **The web sweep proved that conclusion too
strong, and it is worth recording why.** All three architectures are real and in current
production:

| Architecture | Evidence |
|---|---|
| **Rack and pinion** | TRACTO 18ACS/18N factory sheet, verbatim: *"**Drive carriages with 'rack and pinion'**: Stepless adjustment of torque and speed for maximum rotational power and maximum productivity at any speed."* Vermeer calls the frame itself **"the rack"** on every large-rig sheet (*"four-bar linkage rack"*, *"20-FT RACK"*, *"the entire length of the rack"*). |
| **Chain, in a 2 : 1 block and tackle off a hydraulic cylinder** | US 6357537 B1 (Vermeer Manufacturing), verbatim: *"The chain drive assembly includes a chain that is entrained around pulleys or gears in a **block and tackle arrangement** such that an incremental stroke of the hydraulic cylinder results in an increased displacement of the rotational driver"* — and specifically *"the chain drive assembly displaces the rotational driver a distance equal to **about twice the stroke length** of the hydraulic cylinder."* |
| **Hybrid: rack-engaging gears AND cylinders on the same machine** | US 11225845 B2, *Hybrid carriage drive for an underground drilling machine* — hydraulic motors driving gears against a **rack structure** for *"higher linear speeds … over longer continuous/uninterrupted distances"*, plus a hydraulic-cylinder path *"capable of providing precise slow speed operation and … very controlled axial loads"*, preferred in *"harder conditions such as rocky conditions"*. |

(All accessed 2026-09-05: <https://en.tracto.com/Brand%20Portal/Products/GRUNDODRILL/Marketing-Material/18ACS/TRACTO_GRUNDODRILL-18N-ACS_EN.pdf>,
<https://patents.google.com/patent/US6357537B1/en>, <https://patents.google.com/patent/US11225845B2/en>.)

**So the corrected finding is narrower and more useful:**

1. **A chain on an HDD rack is defensible — but not this chain.** The real chain drive is a
   **2 : 1 block and tackle reeved off a hydraulic cylinder**, not a motor-and-sprocket loop
   running the full beam. If the game keeps a chain, model the **cylinder and the reeving**,
   because that is the mechanism and it looks completely different: a big cylinder lying along
   the beam, sheaves at its rod end, and chain doubling back.
2. **Rack and pinion is the better choice for this rig anyway**, on two grounds: TRACTO — the
   manufacturer whose 300 kN machine is this rig's closest real analogue (§3.1) — publishes
   rack-and-pinion by name; and a rack is the one feed architecture **no other rig in this game
   uses**, so it is free silhouette differentiation. Model it as a **toothed strip running the
   beam's full length** with the **pinion and gearcase visible on the carriage**.
3. **`NOT SOURCED` either way**: tooth module, rack width, one rack or two. Do not model a tooth
   count that someone can count against a photograph.

**What `buildFeedBeam` already gets right and must survive any of these changes:** the
**bolted-on, separately-replaceable hardened rails** (they are consumable — the slide pads eat
them), and the **cable carrier with a hose loop that follows the carriage** at the end of the
function. That loop is exactly right: the mud hose and the hydraulics have to reach a carriage
that travels the whole beam, so a growing and shrinking loop is real hardware, not decoration.

### E. The transport pose raises the beam. A real HDD rig lays it down

```js
  dyn.workTilt = -tilt;               // -1.292 rad → beam 16° above horizontal ✓
  dyn.transportTilt = -tilt * 0.35;   // -0.452 rad → beam 64° above horizontal ✗
```

Read against the convention the rest of the file uses — `-1.44` is commented *"folded flat
over the deck to travel"* (l. 6815), the global default is `-1.32` (l. 7550), and vertical-mast
rigs use `-2.30` to lay the mast back over the machine — `transportTilt` becomes **more
negative** as the mast goes down. The HDD rig's value is *less* negative than its work tilt,
so it **stands the beam up by 48° to travel**.

That is backwards. An HDD rig's work pose is already almost flat; to travel it folds the beam
**down onto the chassis**, not up. `transportTilt` should be at or past **−π/2** (beam
horizontal or slightly nose-up over the deck), i.e. around **−1.50 to −1.60**. This is a
one-number fix and it is currently the most visible wrong thing in the transport animation.

### F. The entry angle is RIGHT — I withdraw an earlier draft of this warning. But the rig sits far too close to its own entry point

`entryDeg = 16`. The sourced bands:

| Statement | Value | Source |
|---|---|---|
| Entry angle, common | **8–16°** | `research/07` §A1 `[GP1]` |
| ASTM F1962 "Bore Entry (Pipe exit) angle" | **8–20°** | `research/07` §A1 `[APE]` citing ASTM F1962-11 |
| *"drilling rigs are typically **manufactured to operate at 10° to 12°**"* | **10–12°** | `research/16` §B.17 quoting `[OSTI-HDD]` |
| One specific maxi rig's published range | **6–15°** | `research/11` §A.19 (Prime Drilling PD 250/90, via hddbroker) |

**An earlier draft of this section recommended dropping to 10–12°, on the strength of
`[OSTI-HDD]`'s "rigs are typically manufactured to operate at 10° to 12°". The manufacturer
datasheets in §3.2 contradict that line, and they win.** Eleven published machines give:
Vermeer D24x40 S3 **14–21°**, D40x55 S3 **15.5–20.5°** with a 3 m rod, Ditch Witch JT24 **18°**,
AT40 **17°**, TRACTO 18ACS/20ACS **13–19°** on the working drawing. **For a mid-size utility rig
of exactly this class, 14–19° is the manufactured band — and `entryDeg = 16` sits dead in the
middle of it. Keep 16°. Change nothing.**

Two refinements if the tilt rams are ever made functional:

- The **useful sweep is 8–29°**, not 8–20°: TRACTO publishes an *"angle of inclination 0–29°"*
  for the JCS300 and **0–30°** for the 18ACS/20ACS/JCS130E, and Vermeer publishes a *"maximum
  operating angle 30°"* for the D220x500 S3. The 8–20° figure is a *design* recommendation for
  the bore, not a limit on the machine.
- **Steeper needs jacking.** Ditch Witch publishes **18°** and **12° "entry angle, tracks on
  ground"** for the same JT24; Vermeer sells a *"unique four-bar linkage rack and additional
  pads"* on the D100x140 S3 precisely to get **11–24° with tracks fully on ground**. So if the
  game ever animates the rig going steep, the back of the machine should come **up off its
  tracks onto pads**.

**And one thing the mesh should gain from this: at 30° the machine is over half a metre
taller.** TRACTO dimensions the JCS130E in two working poses — **3,424 mm high at 14°** and
**4,652 mm at 30°** — so rack angle drives overall height strongly, which matters for any
transport/clearance logic.

**Separately: the entry point is 0.28 m in front of the beam pivot.**

```js
  // entry seal / mud return box at the collar
  part(T, root, G.roundedBox(T, 0.8, 0.35, 0.55, 0.04, 2), p.dark, { p: [0, 0.18, 0.28] });
```

`research/07` §A1 `[GP1]`: **"The rig is set back 3–20 ft (0.9–6.1 m) behind the entry
point"**, depending on rig size and entry angle. 0.28 m is a third of the minimum. The drill
string should emerge from the beam nose and travel a visible stretch of open ground before it
enters the earth — and **that gap is where the entry pit goes** (§4.9). Closing it up loses
both the setback and the pit.

### G. The anchoring is a gesture, and it is carrying 330 kN

```js
  // ground anchors at the front
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1;
    part(T, root, G.cyl(T, 0.05, 0.05, 0.9, segAt(q, 10)), p.worn, { p: [s * 0.75, 0.2, 0.75], r: [tilt, 0, 0] });
    part(T, root, G.box(T, 0.24, 0.12, 0.24), p.dark, { p: [s * 0.75, 0.55, 0.62] });
  }
```

Two 100 mm × 0.9 m stakes and two small caps. The principle is right — and `research/07` §D1
states it explicitly: *"The whole assembly is anchored — it has to react up to its full thrust
and pullback into the ground."* But the **load path is not drawn**: there is no anchor beam,
no cross-member tying the two stakes into the beam nose, and no bearing foot. As modelled, the
stakes appear to be stuck in the ground *near* the machine rather than *holding* it.

**And the "screw anchors or driven stakes?" question, which an earlier draft left open, is now
answered: they are AUGERS.** §4.6 has the full evidence; the short version is that US
6497296 B1 describes **two stake-down units, each a power auger, on a common mount pivoted
about a transverse tilt axis, with one unit laterally movable so the operator can maximise the
spacing and dodge buried obstacles**; and US 11879331 B2 confirms traditional HDD anchors as
augers *"driven into the ground pushed by the cylinders and rotated by rotary drives"*.

**What to change, in order of visual return:**

1. **Make them augers, not spikes.** Helical flights on the lower portion, and a **rotary drive
   head on top of each one** — they are screwed in by hydraulic motors, so they must have
   motors. Straight smooth cylinders are the one thing they are definitely not.
2. **Put them on a mount that pivots on a transverse axis**, so the anchor assembly tips with
   the rack angle instead of being pinned to the world.
3. **Make the two of them asymmetric** — one fixed, one on a lateral slide. That asymmetry is
   the sourced arrangement and it looks deliberate rather than decorative.
4. **Add the anchor plate, and make it a tray.** TRACTO's sheets call it an *"anchoring system
   with drilling fluid collecting tray"* and an *"anchor plate as drip pan for drilling fluid"*.
   This is the highest-value single addition in this section: it gives the rig nose a **shallow
   steel tray under the drill axis that catches returning mud**, which is both the load path and
   the dirt story in one part (§6.3).
5. **Give it mass.** Published anchor weights are **340 kg** (Ditch Witch standard), **590 kg**
   (HD) and **454 kg** (Vermeer stakedown). These are heavy fabrications, not pegs.

`NOT SOURCED` and still not to be invented: auger flight diameter, stake length, embedded depth,
holding capacity in kN. Also searched for and **not found: any evidence of vacuum anchoring of
an HDD rig** — do not model it.

### H. Downhole tooling — mostly right, with three specific notes

**H1. The pilot head conflates the slant face with the bent sub.** `buildHDDPilotHead`'s doc
comment reads *"slanted face, carbide, jets, bent sub"* and its spec declares
`slantDeg: 15`. The geometry it builds — an asymmetric extruded slant plate, five carbide
inserts along the leading edge, two jet nozzles — is a **slant-face bit**, and that is
correct and well sourced (`research/07` §A2: `[JBT]` "an asymmetrical leading edge";
`[GP3]` on orienting the face). But a **bent sub is a different, hard-ground component**: a
*"small bend (or bent sub) in the motor or drill housing just behind the cutting head, which
serves the same function as the slant on the face of a slanted-face bit"*, magnitude
**approximately 2°** (`research/07` §A2 `[GP3]`, `[HK]`). The two are **alternatives**, not
parts of one assembly. Remove "bent sub" from that comment; it belongs with the mud motor
(`motor-mud-3-5`, "3.5 in Bent Housing", which is correctly named).

**H2. The sonde housing is a separate mesh but a single shop item.** `buildSondeHousing`
builds a body of `L = 6 × diameter` (540 mm at 90 mm) with a slotted window and a 6-bolt
cover — the right idea, and the right place: `[DTD]` puts the transmitter *"directly behind
the drill bit in the drill string"*. But the shop sells **one** item, `hdd-head-slant`
("Slant-Face Pilot Head with Sonde Housing"). Whatever is rendered for that item should be
**head + housing as one assembly**, so the player sees the thing they bought.
`NOT SOURCED`: the real window geometry — slot count, size, whether it is a milled window with
a non-metallic cover or a slotted steel sleeve. The signal has to get out, so an aperture is
necessary; its shape is a guess.

**H3. The back-reamer carries its own swivel; the industry treats the swivel as a separate
link — and the pull head is missing entirely.** `buildBackreamer` ends with:

```js
  // pulling swivel + eye
  const sw = group(T, g, 'swivel', { p: [0, -L, 0], dynamic: true });
```

a 140 mm chrome cylinder and a torus eye. Two issues:
- **The chain is longer than that.** `research/07` §A5, quoting `[SHORE]`: *"A reamer is
  attached to the drill string, and then connected to the **pipeline pullhead** via a
  **swivel**. The swivel prevents any translation of the reamer's rotation into the pipeline
  string."* `[DCAE]`: *"a swivel prevents rotation transfer to the pipe."* So the correct
  train is **reamer → swivel → pull head → product pipe**, and `[APE]` lists pulling head and
  swivels as two separate specified items. The **pull head is not modelled anywhere**, and it
  is the piece that actually grips the pipe. A **Chinese finger** is the alternative or
  companion grip — *"a woven wire device… when it is pulled, it tightens on the material"*
  `[DTD]` — and it is a lovely, cheap, instantly recognisable object.
- **Chrome is the wrong material for it.** A pullback swivel is a heavy forged steel body that
  spends its life in a mud-filled hole. `p.worn` or `p.steel` with grease at the seal, not
  `chrome`.

Everything else about the reamer is right: **fly cutter** is correctly named — *"style of
reamer that has an open blade configuration. Also sometimes called a 'wagon wheel'"*
`[MB-T]` via `research/07` §A4 — and the open helical blades, round-shank picks and fluid
ports match that description.

### I. The rubber ring at the collar is a real named part. Name it

```js
  part(T, root, G.cyl(T, 0.12, 0.12, 0.20, segAt(q, 12)), p.rubber, { p: [0, 0.30, 0.28], r: [tilt, 0, 0] });
```

This is the **rod wiper**, and its field name is the **doughnut**: *"a rubber or synthetic
grommet placed over the drill rods during pullback to strip excess mud from the rods before
they are stowed"* `[DTD]`; *"the rubber rod wiper at the front of the drill rig that wipes mud
off the drill pipe as it pulls back"* `[MB-T]` — both via `research/07` §A7. The mesh already
has it and already made it rubber. **Give the node the name `rod-wiper`** so it can be
animated (it is the one part of the machine that is *always* the dirtiest thing in frame, §6)
and so the next person to read the file knows what it is.

### J. `depthRange` measures the wrong axis, and `frameRadius` is a tenth of the site

- `data.js` method `hdd`: `depthRange: [50, 1200]`. On this method the number is **bore
  length**, not depth — HDD depth of cover is a few metres while the bore runs hundreds. The
  field is shared across methods so it may have to keep its name, but any UI that prints
  "depth" against an HDD job is printing the wrong word. `research/07` §A1's five-part profile
  (tangent → arc → horizontal → arc → tangent) makes the distinction concrete.
- `frameRadius: 6.0` against a sourced entry plot of **30 m × 46 m** for a 305 m crossing
  (`research/16` §A.17, `research/07` §D5, from `[PPI12]`). Six metres is the rig; it is not
  the site. If `frameRadius` drives the staging footprint, HDD needs a much larger one than
  any drill-in-place method — it is the only method in the game with **two plots and a
  corridor**.

### K. What is missing from the scene, not the machine

The rig alone is roughly a third of an HDD spread (§2, §4.9). None of these are on the rig, so
none of them are `buildHDDRig`'s fault — but a scene with only the rig in it is the single
biggest way this method can look wrong:

1. **The mud recycler / reclaimer** — tanks, a shaker deck, cyclone cones (`research/07` §D3).
2. **The entry pit at the rig's nose**, ringed by a **305 mm berm** `[APE]`, with returns
   welling up around the pipe.
3. **The exit pit and the strung product pipe on rollers**, hundreds of metres away.
4. **A person walking the bore line with a handheld locator** — the locator technician
   physically walks to the front and rear locate points `[DTD]`.
5. **A pipe trailer**, a **vacuum excavator**, and an **excavator at the exit pit**.

`research/16` §A.17 already specifies all of it; this is a staging job, not a research gap.

### L. Five pieces of real hardware the mesh does not have, all now sourced

None of these needed inventing — each is printed on a manufacturer datasheet (§3.1, all
accessed 2026-09-05) and each is legible at normal viewing distance:

1. **A full-length catwalk alongside the rack.** Vermeer D220x500 S3: *"The full-length catwalk
   provides access to the entire length of the rack for ease of wire lining and assisting in
   the rod loading process."* This is where the crew stands, and the mesh has nowhere for a
   figure to be.
2. **An open-top vise that slides.** Vermeer publishes *"Angled, open-top"*, *"semi-open top
   vise"*, and for the D220x300 S3 an explicit **"vise slide travel 35.4 in (899 mm)"** with a
   **10.2 in (259 mm) opening**. The game's vice is a fixed block with two side jaws — open-top
   and travelling are both different in kind. (§4.3; the absolute figures are from a 1,077 kN
   rig and must not be transferred straight to a 330 kN one.)
3. **An on-board knuckle crane.** TRACTO 18ACS: *"The on-board crane facilitates easy handling
   of the rods, stacking boxes and additional components."* Vermeer's optional crane on the
   D100x140 S3: **1,179 kg, reach 5.95 m, 360° rotation** — and fitting it takes transport
   height from **2.98 m to 3.56 m**, which is why it is an option.
4. **A swivelling cab.** TRACTO dimensions two working envelopes for the same machine —
   JCS300 *"cabin in"* **2,550 mm** wide vs *"cabin out"* **3,220 mm** — so the cab swings out
   ~670 mm to see down the rack past the string. The game's offset open station solves the same
   problem a different way and is defensible; but if a cab is ever added, it must swivel.
5. **A spare, stackable rod box.** Vermeer: *"Stackable rod boxes are easy to use with a single
   pin and patent-pending auto lock"*, with capacity quoted both **fitted (41 m)** and
   **stacked (82 m)**. A second box on the ground beside the rig is free site furniture that is
   both true and story-bearing.

### M. The pulling swivel in the shop is undersized by roughly a factor of four

`data.js` sells this rig `hdd-swivel-12t`, *"Pulling Swivel & Head, 12 t"*. **12 t is 118 kN,
against a rig rated 330 kN of pullback.** The industry sizing rule is explicit
(<https://eliteundergroundtools.com/hdd-tooling-complete-guide/>, accessed 2026-09-05):

> *"Always match the swivel's working load rating to at least **1.5× the maximum pullback
> force** of your rig."*

So a 330 kN rig needs a swivel rated **≥ 495 kN (≈ 111,000 lb)**, which from the Melfred
Borzall capacity/diameter ladder in §3.5 is a **7.5 in (191 mm) body** — not a 12 t unit, which
sits down at about **4–4.75 in (100–121 mm)**.

This is worth fixing precisely because the shop copy for that item is otherwise excellent
(*"Isolates the product pipe from the rotation of the reamer. Skip it and you will pull a
twisted gas main into the ground"*) — it teaches the right lesson with the wrong number. Either
raise the rating to **~50 t**, or make swivel capacity a real fit constraint and let the player
discover that the 12 t unit is for a mini rig.

Related, and also fixable from §3.5: **the sonde housing OD should be ~4.25 in (108 mm) on
2⅞ in threads** for a rig in the 222–356 kN band — which is exactly the thread family the shop
already lists for its HDD pipe. The tooling and the pipe agree; only the swivel does not.

### N. The published rod bend radius is tighter than any real rod of that size

`data.js` item `hdd-pipe-2875` (2.875 in = 73 mm): *"made to bend to a **40 m radius** and come
back straight."* Sourced comparables for rod of that OD (§3.7, all manufacturer sheets accessed
2026-09-05):

| Rod | OD | Published min bend radius |
|---|---|---|
| Vermeer 2.63 in Firestick | 67 mm | 44.2 m |
| TRACTO TD73 | 73 mm | **55 m** |
| TRACTO TD82 | 82 mm | 60 m |
| Vermeer 3.5 in Firestick | 89 mm | 60 m |

**40 m is optimistic for a 73 mm rod by roughly 10–15 m.** Not a howler — it is the right order
and the right units, which is more than most game copy manages — but **44–55 m** is the sourced
band and the sentence would be no less good with 50 in it. Worth correcting if the number is
ever used in a mechanic, because `research/07` §A1 records that *"the permitted bending radius
of the drill rod controls the curvature"* more often than the product pipe does — so this
number, not the pipe's, is the one that decides whether a bore path is legal.

### O. Naming — do not regress

`spec.name` is already the fictional `Halvard HD-330 Traverse`, and the shop items are already
badged `Drillity`. Correct per DOMAIN.md §10. Every real designation in this document —
Wassara, Perforator, Prime Drilling, Vermeer, Ditch Witch, Herrenknecht, TRACTO — exists here
so the modeller can check a proportion, and must never appear on a mesh, a decal
(`addDecals` `brand`), or in shop copy. **Shapes are free to copy; badges are not.**
