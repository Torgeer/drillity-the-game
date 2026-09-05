# Tool family: Anchors, self-drilling anchors, rock bolts, micropiles
`tools-anchors-sda` — engineering reference for GEOMETRY and MATERIALS

status: COMPLETE for the material available locally. Anything marked `NOT SOURCED`
stayed unfound and must not be invented. §8 lists the real gaps — the largest by
far is the **SDA bit diameter for a given bar size**, which no source in the folder
publishes, and which §3.6 explains is missing by design rather than by accident.

> **Naming rule (DOMAIN.md §10).** Everything below cites real manufacturers so the
> modeller can check the geometry. NONE of these names, model designations or
> badge artwork may appear on an in-game product. Thread designations (R32, T76,
> Ø32/16) are industry-generic and *are* allowed — they are sizes, not brands.
> Steel-grade designations (S460NH, E470, E500/700, EN 10083-1) are likewise
> generic. Do not paint a supplier logo on a bar, a plate, a nut or a bit.

> **Scope note.** This document covers the **consumables** — what goes in the
> ground and stays there. `research/rigs/bolter.md` covers the underground
> machine that installs them; `research/11-oem-anchor-geotech-hdd.md` covers the
> thread-compatibility grammar (shank Ø → thread profile → hand → box/pin) and is
> **not** re-derived here. `HANDOFF.md` ll. 478–480 records that rock bolting is
> genuinely surface work as well as underground, served by the `anchor` method,
> so this family serves **two** machines: `bolter` and every `anchor`-method rig.

---

## 1. Sources read

| File | Pages / extent | What it ACTUALLY showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\482200326_1078807137620999_5363155536554947896_n.jpg` | whole image, OPENED | **The single best source for this family anywhere in the library.** A photograph of a printed Swedish hollow-bar specification table. For **twelve** bar sizes (R32L/N/S, R38N, R51L/N, T51S, T63N, T76N/S, T111L/N) it gives bar OD, bar ID, section area, ultimate and yield stress, ultimate and yield load, kg/m — **and then, for the same twelve sizes, the coupler OD + length + weight, the nut across-flats + length + weight, and the bearing-plate side + thickness.** Nothing else found fixes the *ratios* between bar, coupler, nut and plate. Flagged by `_photos.md` §2. | **Yes — primary** |
| `C:\Users\henri\Downloads\Minova-SDA-Brochure-EN-USA-MEX.pdf` | pp. 2, 4, 5, 6, 7, 8 — text extracted; **pp. 2 and 8 rendered and looked at** | The labelled exploded assembly (Nut / Plate / Hollow bar / Extension coupling / Sacrificial drill bit), plus a large installed-in-a-face photograph. Independent confirmation of the whole bar table (R25N–T111N) with **outside diameter as distinct from nominal size**. p.8 carries an **eleven-type sacrificial-bit nomenclature with silhouettes** (EW, XX, EX, EXX, EC, ECC, EY, EYY, ES-F, ESS-F, ES-D). p.7 is the component prose — couplers, nuts, plates, spacers, protection tubes, grout swivels. p.6 is corrosion protection. **No bit diameters anywhere.** | **Yes — primary** |
| `C:\Users\henri\Downloads\PalPile-Brochure-2025.pdf` | pp. 22, 23, 24, 25 (text) | The confirmed hit left by the `tools-piling-hammers` author. p.22 is the prose for all three families. p.23 is a self-drilling hollow-bar table given as **OD × WALL THICKNESS** (42.4×8.0 → 95.0×25.0) — the complement to the ID-based tables above. pp. 24–25 are **hot-rolled anchor bars** and **solid threaded anchor bars**, i.e. the *other* two products, with their own section ladders. This is the source that separates the three families cleanly. | **Yes — primary** |
| `C:\Users\henri\Downloads\Einsteckende Klemm.pdf` | 1 p., rendered at 220 dpi and the thread detail cropped at 400 dpi, both LOOKED AT | Not what the filename suggests. A **fully dimensioned single-part manufacturing drawing of a shank adapter** ("ADAPTER SHANK, KLEMM KD1215R / BW64, LH PIN INTERNAL FLUSH", scale 1:2, 23 kg). Overall length, spline count and diameters, striking-face chamfer, internal flush bore, material and case-hardening spec — **and a 45° section detail of the rope-thread profile with major, minor and both flank angles.** The only dimensioned rope thread in the folder. | **Yes — primary (for the thread and the machine end)** |
| `C:\Users\henri\Downloads\R8 plate.pdf` | 1 p., rendered 220 dpi, LOOKED AT | **Not an anchor bearing plate.** "R8 Platte 3d" at scale 10:1 is a **brazed carbide chisel insert**: 25 × 15 × 6 mm, one corner on R8, a 1 mm chamfer, 7° relief. Valuable, but for the *bit face*, not the head assembly. | Yes — but for §4.2, not §4.5 |
| `C:\Users\henri\Downloads\Dachplatte 32.pdf` | 1 p., rendered 220 dpi, LOOKED AT | Same story. "Dachplatte 32" at scale 5:1 is a **roof/gable carbide insert**: 32.5 wide × 22 high × 9 thick, apex R3, shoulders R4, 10°/20° roof, 5° draft. Independently confirms the plate-insert family `_photos.md` recorded from `carbide_info.png`. | Yes — for §4.2 |
| `C:\Users\henri\Downloads\2-1-EMDE-Katalog-Ankerbohren.pdf` | 52 pp., full text extracted with `pdftotext -layout`, chapter headers swept | **Despite the title, there is no hollow-bar / self-drilling-anchor chapter in it.** "Ankerbohren" here means *drilling for anchors*: the content is drive-drilling, double-head, overburden, auger, high-pressure grouting and shank adapters — already the subject of `tools-overburden.md` and research pack 11. Its one contribution to *this* family is the **lost-bit ("Rammspitze") vs tube-diameter ladder** on pp. 4–7, which is an over-drill ratio for the *cased* family and must not be transferred to SDA. | Marginal |
| `C:\Users\henri\Downloads\EMDE-Anchor-Drilling.pdf` | 1 p. (text) | A contact-details flyer. A bulleted list of methods offered (drive, double-head, overburden, auger, geothermal, freeze tubes, tunnel roofing, high-pressure, shank adapters, discharge preventer). **No geometry of any kind, no dimension, no drawing.** | **Useless for geometry** |
| `C:\Users\henri\Downloads\EMDE-Connectors.pdf` | 1 p. (text) | Octagonal connectors, SW 150/160/175/190/200/250/300 mm, with torsion / bending / traction ratings. These are **large-diameter foundation tooling connectors** (CFA, FDP, CCFA, soilmixing) — a different product at a different scale entirely. Not anchor couplers. | **Off-topic for this family** |
| `C:\Users\henri\Downloads\Price list Ischebeck.pdf` | 2 pp. (text) | **Did not pay off as hoped.** The coordinator expected "a price list often carries the full size ladder with weights". It does not: this is a two-page **shank-adapter, flushing-shaft and spare-parts** price list (flushing shafts OD 160 and OD 100; shank adapters for named drifters; flat / angled / thick clamping jaws; seal rings). **Not one hollow-bar size, weight or load.** Its only geometric contributions are the flushing-shaft outside diameters (Ø160, Ø100) and confirmation that shank threads come in matched LH **and** RH variants. The clamping-jaw line items are genuinely useful for §6 (they are sold in 50/100/300 lots — they are consumables, so they bite hard enough to wear out). | Marginal |
| `C:\Users\henri\Downloads\drillity-the-game\research\rigs\_photos.md` | §2 `tools-anchors-sda`, §2 carbide entries, §3 site-and-ground | Pointed straight at the Swedish table image (correctly called "the most information-dense single image in the library for any tool family"), at the two carbide-insert screens, and at the jet-grout/micropile site sequence that carries the grout-on-the-ground truth for §6. Read first, as instructed; no folder sweep needed. | **Yes** |
| `C:\Users\henri\Downloads\drillity-the-game\research\11-oem-anchor-geotech-hdd.md` | §C.2 ll. 1220–1270, ll. 1538 | The parent pack. Already owns the shank-Ø → thread-profile matrix, the R-vs-T explanation, the LH/RH and box/pin grammar, and the non-interchangeability rule. **Not re-derived here.** Contributes one secondary number this document could not source locally: indicative bit sizes **R32 → 45–51 mm**, T38 → 64–76 mm, T51 → 89–102 mm (web citation, flagged secondary there and here). | Yes — as parent |
| `C:\Users\henri\Downloads\drillity-the-game\research\rigs\bolter.md` | §1 source table, §4 consumables, p.5 spec quotes | Already logged the Minova brochure for the *props*. Adds the underground face-plate size class from an Epiroc Boltec S spec: **rectangular max 150 × 150 mm, round max Ø 200 mm**, bolt length **1.5–2.4 m**. Complementary, not overlapping. | Yes — secondary |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\tools.js` | `THREAD_SPECS` ll. 578–600; §10 `buildAnchorBar` / `buildSacrificialBit` / `buildAnchorCoupler` / `buildBearingPlate` ll. 4731–4875 | The current game model, READ-ONLY, compared against the sourced material in §9. | Yes (as the subject) |

**Second pass — eight further PDFs mined after the first draft:**

| File | Pages / extent | What it ACTUALLY showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\ITB-EPD_140-Minova-update-v2.pdf` | pp. 2–3; **Fig. 2 and Fig. 3 read as images** | The Environmental Product Declaration behind the Minova brochure, and it carries geometry the brochure does not. **Table 1 p.3 is the R/T bar ladder a third time** (kg/m, inner Ø, outer Ø, area) and adds **R28**, which no other source here has. **Fig. 3 gives the standard bar length as a dimension line: L = 3 m** — the one number that closes a NOT SOURCED item. Fig. 2 is an annotated SDA assembly naming a **coupler with a centre stop** and a **domed plate made of cold-formed flat steel** sitting over a flat plate. **Carries no load ratings and no steel grade at all** — a real gap in an EPD. | **Yes — primary** |
| `C:\Users\henri\Downloads\SSAB_RR_and_RD_palar_Anvisningar_for_projekting_och_installation.pdf` | 40 pp.; Tables 2.7–2.12, 3.3–3.7, 5.3; **Figs. 2.3, 2.4 and pp. 9, 19 read as images** | **The richest single PDF found for this family.** A Swedish steel tube-pile design and installation manual. Gives the **only published over-drill ladder anywhere in the library** (Table 5.3: ring-bit OD from six vendors against pile OD), a full **threaded coupler OD + length + tightening-torque table**, a full **bearing-plate side × thickness table**, the pile OD × wall-thickness × steel-grade matrix, standard supply lengths, and three separate **corrosion-allowance** tables. Tables survive the Swedish, exactly as the coordinator predicted. | **Yes — primary** |
| `C:\Users\henri\Downloads\RDT CAS catalog_2024-11-2.pdf` | pp. 3, 8–10; **p.8 read as an image because the text layer scrambled the row order** | Casing-advancement systems, casing **88.9 → 508 mm**, with **pilot-bit OD, ring-bit OD, ring-bit ID and casing wall thickness on every row**, plus weights and the part-numbering grammar. The best bit-vs-tube data in the folder — and it includes explicit **oversize ("OD") ring-bit variants**, i.e. the same casing deliberately drilled with a bigger annulus. | **Yes — primary (for the cased family)** |
| `C:\Users\henri\Downloads\spantec.pdf` | 8 pp., pp. 2, 4–6 | Stressing jacks and hydraulic accessories, not consumables. **One genuinely valuable thing:** p.6 lists the product families side by side and separates them the way this document needs — micropiles / soil nails, rock bolts and SN-anchors / **bar anchor** / **strand anchor** / folding anchor / self-drilling systems. And pp. 4–5 give the functional split that identifies each on site: *"Stressing heads: for tensioning and checking of strand anchors"* vs *"Tensioning chair: easy tensioning of bar anchors"*. **No consumable dimensions whatsoever.** | Marginal — one taxonomy nugget |
| `C:\Users\henri\Downloads\SSAB_Bilaga_B_Tabeller_for_borrade_palar.pdf` | 116 pp.; p.2 contents, p.3 sampled as an image | 56 near-identical load-capacity tables (ULS/SLS × corrosion allowance × empty vs concrete-filled). **No component geometry at all.** Its only structural contribution is the corrosion-allowance sweep the tables are indexed by (external 0.0/1.2/2.0/2.5/3.0/3.5 mm × internal 0.0/0.5/1.0 mm). | Marginal — load ratings only |
| `C:\Users\henri\Downloads\RDT Forepoling leaflet_2024-11.pdf` | 2 pp. | Forepoling ring-bit sets for casing 88.9–139.7 mm. **Entirely a subset of the CAS catalogue above.** Nothing new. | Redundant |
| `C:\Users\henri\Downloads\EPD_SSdr-pile_2022.pdf` | 10 pp. | An environmental declaration. Names the components (tube, top plate, sleeve, threading, driving shoe / ring set) and the steel grade, and declares a 6 m functional unit. **Zero dimensions.** | **Useless for geometry** |
| `C:\Users\henri\Downloads\2022-12-PBA-brochure.pdf` | 16 pp. | Pile-top reverse-circulation **drill rigs** for 0.6–8.5 m bored piles — machine torque, thrust, weight, transport envelope. **A dud for this subject**: it is a rig brochure, not a consumable one, and the piles it makes are two orders of magnitude bigger than an anchor. | **Useless — wrong subject** |

---

## 2. What the tool family IS

Three products get called "an anchor" on a drawing and they are **not the same
object**. A modeller who blends them will produce something that no groundworker
recognises. Separate them first.

### 2.1 Self-drilling anchor (SDA) / hollow bar — the subject of most of this document

A **seamless steel tube with a coarse thread cold-rolled along its entire
length**, which is simultaneously the drill rod, the reinforcement and the grout
pipe. It is drilled into the ground under percussion and rotation with a
**sacrificial bit screwed on the leading end that is never recovered**, flushed
with water, air or neat cement grout down its own bore, extended with **couplers**
as it goes, and finally grouted so the tube ends up encased in a cement annulus.
At the collar it is finished with a **bearing plate and a nut**.

The defining feature, and the one thing that must be right on the model: **the
thread runs end to end.** There is no plain shank, no upset, no collar, no
tool joint. *"The hollow bars are fitted with left-hand or right-hand R-threads or
T-threads for easy extension and connection to conventional rock drilling
equipment. The hollow bars are manufactured from seamless steel tubes"* — Minova
p.2. Because the thread is continuous, **a bar can be cut anywhere and coupled
anywhere**, which is exactly why crews do cut them on site and why the head end
of an installed anchor is a raw sawn face (§6).

Used above ground as **soil and rock nails** for slope and retaining-wall
stabilisation, and as **micropiles** for foundations, underpinning and buoyancy
control; used underground for **forepoling, spiling, face bolting and radial
bolting** (Minova pp. 4–5). One product, both worlds — which is precisely the
`HANDOFF.md` point about `anchor` serving the surface while `bolter` serves the
underground.

Two installation modes, and they look different on site:
- **Soil/rock nails** — drilled with **water or air flush**, then **post-grouted**.
- **Micropiles** — drilled with **simultaneous grouting**, cement grout as the
  flushing medium. *"After reaching the final depth, the water to cement ratio is
  decreased to fill the annular space between hollow bar and borehole wall for
  optimum load transfer"* (Minova p.4). This is the one that makes the mess: grout
  returns up the annulus and out over the ground for the whole drilling operation.

### 2.2 Bar anchor / solid threaded bar — the "GEWI-type"

A **solid round bar** with a continuous coarse thread, either hot-rolled in or
cold-rolled on. **No bore, no bit, no flush.** It is placed into a hole somebody
else drilled (or into a driven casing) and then grouted. PalPile p.22:
*"Solid threaded bars from Ø 30 mm up to Ø 100 mm can be used as solid core
tensile and compression anchors … All accessories such as couplers, turnbuckles,
nuts, washer plates are available."*

Note the **turnbuckle** — it appears in the bar-anchor accessory list and not in
the SDA list. A turnbuckle on a tie-back is a bar-anchor tell.

Visually against an SDA: same coarse thread, **solid section, thinner for the same
load, and it arrives as a bundle of straight bars with plain sawn ends** rather
than as a drill string. Grades in the local source: S355 / S530 / S600 (p.22),
and section tables at E355/470, S500/700, E550/620 and E670/800 (pp. 24–25).

### 2.3 Strand anchor — a different animal, and **NOT SOURCED here**

A tendon made of **multiple seven-wire prestressing strands**, not a bar,
stressed against the structure and locked off with a **barrel-and-wedge** head
(an anchor block with tapered wedges per strand) rather than a nut. It has a
sheathed, greased **free length** and a **bonded length**.

**One sourced sentence separates it from a bar anchor, and it is a good one.**
`spantec.pdf` pp. 4–5 sells two different tools for the two products:
*"Stressing heads: for tensioning and checking of **strand anchors**"* and
*"Tensioning chair: easy tensioning of **bar anchors**"*. That is the field
distinction — **a strand anchor is stressed and locked at a stressing head with
wedges; a bar anchor is stressed against a chair and locked with a nut.** The same
page lists them as separate product lines alongside micropiles, soil nails, rock
bolts, folding anchors and self-drilling systems, which is the cleanest taxonomy
found anywhere in the folder.

**Every dimension is still NOT SOURCED.** No strand count, no strand diameter, no
head or barrel diameter, no wedge geometry, no sheathing diameter. The only
numbers `spantec.pdf` carries are for the **jacks** — hollow-piston through-holes
of 90 / 105 / 110 / 130 / 140 / 150 / 180 mm and bodies from Ø190 × 280 to
Ø563 × 412 mm, 80–500 t at 700 bar (p.2) — which describe the tool, not the
anchor, and must not be read as tendon diameters. **Do not model a strand anchor
from this document.** See §8.

### 2.5 Drilled steel tube micropile — the fourth product the sources actually document

The brief asked for three families; the local sources document a fourth that sits
squarely inside this tool family's remit, because `DOMAIN.md`'s `anchor` method
covers micropiles and this *is* a micropile.

A **plain steel tube, 88.9 – 323.9 mm OD**, drilled into the ground ahead of a
**ring bit** with a **pilot bit** inside it, extended by **external threaded
sleeve couplers**, finished at the top with a **square bearing plate carrying a
welded centring spigot**, and then filled with concrete or injection grout. It is
*not* an SDA: the tube is far bigger, it is not threaded along its length, the
reinforcement is the tube wall itself (plus rebar inside), and the bit assembly is
a two-part pilot-and-ring rather than a single sacrificial head.

Sourced from `SSAB_RR_and_RD_palar…pdf` and `RDT CAS catalog…pdf`; the full
ladders are in §3.8. Two structural facts worth knowing before modelling one:

- The **ring bit stays in the ground with the tube**, exactly like an SDA
  sacrificial bit; the **pilot bit comes back out** through the tube. That is a
  two-part lost/retrieved split the SDA family does not have.
- Corrosion is handled by **deducting steel rather than by coating** (§6.7) — these
  piles are bare black steel by design, which is why they look completely different
  from a galvanised SDA bar in the same yard.

### 2.4 Rock bolt — the underground overlap

`bolter.md` §4 already carries the underground bolt taxonomy handled by a bolting
rig (friction bolts, expanding-shell, resin- or cement-grouted rebar, cable
bolts). An SDA bar is one of the options that goes through the same feed, and is
the one this document covers. Face-plate sizes for the underground class, from
that document's Boltec S citation: **rectangular max 150 × 150 mm, round max
Ø 200 mm**; **bolt length max 1.5–2.4 m**. Compare with §3 — the underground
plate is at the *small* end of the SDA plate ladder, which is the honest
difference between a 2 m bolt and a 20 m surface anchor.

---

## 3. Proportions and dimensions

### 3.1 The hollow bar — full ladder, two independent sources agreeing

From the Swedish specification-table photograph (`482200326_…n.jpg`), verbatim
columns, cross-checked against `Minova-SDA-Brochure-EN-USA-MEX.pdf` p.8. Where
the two differ the difference is noted; otherwise they agree exactly.

**R-thread (rope thread) bars:**

| | R25N | R32L | R32N | R32S | R38N | R51L | R51N |
|---|---|---|---|---|---|---|---|
| Nominal size (mm) | 25 | 32 | 32 | 32 | 38 | 51 | 51 |
| **Actual OD (mm)** | **24.7** | **31.3** | **31.3** | **31.3** | **38.0** | **50.0** | **50.0** |
| **ID / bore (mm)** | **14** | **20.6** | **18.5** | **15** | **19** | **33.3** | **30.2** |
| Section area (mm²) | 300 | 350 | 430 | 520 | 750 | 900 | 1070 |
| Weight (kg/m) | 2.35 | 2.75 | 3.4 | 4.1 | 5.9–6.0 | 7.0–7.05 | 8.4 |
| Yield load (kN) | 150 | 160 | 230 | 280 | 400 | 450 | 630 |
| **Ultimate load (kN)** | **200** | **210** | **280** | **360** | **500** | **550** | **800** |

Actual OD is from Minova p.8 ("Nominal Diameter — Outside mm"); the Swedish table
prints the nominal (32, 51) in its `Ytterdiameter` row. **The name is not the
outside diameter.** An R32 bar is 31.3 mm over the thread, an R51 is 50.0.

**A third source, `ITB-EPD_140-Minova-update-v2.pdf` p.3 Table 1, confirms every
row of both tables above** and adds one size the others omit:

| | R28 |
|---|---|
| Actual OD (mm) | **28.0** |
| ID / bore (mm) | **12.0** |
| Section area (mm²) | 440 |
| Weight (kg/m) | 3.40 |

Note what the R28 row does to the ID:OD rule — **12.0 / 28.0 = 0.43**, lower than
any other bar in the family. It is the thickest-walled bar on the ladder
(8.0 mm wall) and the exception that proves §3.7's warning: **never derive the
bore from a fixed fraction.**

**Standard supply length: L = 3 m.** From `ITB-EPD_140-Minova-update-v2.pdf` p.3,
**Fig. 3**, read off the drawing's dimension line (it is not in the text layer of
any source). The same figure labels the section `Di` / `Da`. This closes the
biggest of the §8 length gaps: an SDA bar arrives in **3 m sticks**, which is why
couplers exist and why a 20 m anchor shows six of them.

**Thread hand.** *"Left-hand or right-hand R-threads or T-threads"* (Minova
brochure p.2), but the EPD p.2 makes **left-hand the standard** for the
self-drilling system. `research/11-oem-anchor-geotech-hdd.md` §C.2 already records
that LH is standard on much of this equipment and that LH and RH are separate part
numbers. For the *cased* tube family the rule is set by the hammer instead —
`SSAB_RR_and_RD_palar…pdf` p.32, footnote to Table 5.3: **DTH drilling uses
left-hand sleeves and piles; top-hammer drilling uses right-hand.**

**T-thread (trapezoidal) bars:**

| | T51S | T63N | T76N | T76S | T111L | T111N |
|---|---|---|---|---|---|---|
| Nominal size (mm) | 51 | 63 | 76 | 76 | 111 | 111 |
| **Actual OD (mm)** | **51.9** | **64.9** | **75.4** | **75.4** | **111.0** | **111.0** |
| **ID / bore (mm)** | 26.6–26.8 | 40.6 | 51 | 44 | 81–85 | 75.5–76 |
| Section area (mm²) | 1325 | 1720 | 1870 | 2400 | 3185 | 4395 |
| Weight (kg/m) | 10.4 | 13.5 | 14.7–15 | 18.85–19.7 | 25–28.4 | 34.5–36.3 |
| Yield load (kN) | 750 | 900 | 1200 | 1500 | 2000 | 2750 |
| **Ultimate load (kN)** | **1050** | **1400** | **1600** | **1900** | **2640** | **3650** |

Here the **T sizes measure slightly OVER their name** (T51 = 51.9, T63 = 64.9)
while the **R sizes measure slightly UNDER** (R32 = 31.3, R51 = 50.0). Small, but
it is the kind of thing a spec-sheet reader in the game would notice.

Thread standards, from the Swedish table's `Gängtyp` row: **R-thread to ISO 10208**
for the R32 and R38 sizes, **R to ISO 1720** for R51, and a proprietary
trapezoidal standard for the T sizes (the table names its originator — cite only).
Steel to **EN 10083-1**. Elongation at max load **≥ 5.0 %** for every size.

**The complementary tube view** — `PalPile-Brochure-2025.pdf` p.23, "SELF DRILLING
THREADED HOLLOW ANCHOR BARS — Steel grade E500/700", given as **OD × wall
thickness**, which the ID-based tables above never state directly:

| OD × WT (mm) | Area (mm²) | kg/m | Yield (kN) | Ultimate (kN) |
|---|---|---|---|---|
| 42.4 × 8.0 | 865 | 6.79 | 432 | 605 |
| 42.4 × 11.0 | 1 085 | 8.52 | 543 | 760 |
| 51.0 × 10.0 / 11.0 / 12.5 | 1 288 / 1 382 / 1 512 | 10.11 / 10.85 / 11.87 | 644 / 691 / 756 | 902 / 968 / 1 058 |
| 60.3 × 12.5 / 16.0 | 1 877 / 2 227 | 14.74 / 17.48 | 939 / 1 113 | 1 314 / 1 559 |
| 70.0 × 14.2 / 17.5 / 20.0 | 2 489 / 2 886 / 3 142 | 19.54 / 22.66 / 24.66 | 1 245 / 1 443 / 1 571 | 1 742 / 2 020 / 2 199 |
| 76.1 × 14.2 / 17.5 / 20.0 | 2 761 / 3 222 / 3 525 | 21.68 / 25.29 / 27.67 | 1 381 / 1 611 / 1 762 | 1 933 / 2 255 / 2 467 |
| 82.5 × 17.5 / 20.0 / 22.2 / 25.0 | 3 574 / 3 927 / 4 206 / 4 516 | 28.05 / 30.83 / 33.01 / 35.45 | 1 787 / 1 963 / 2 103 / 2 258 | 2 501 / 2 749 / 2 944 / 3 161 |
| 95.0 × 20.0 / 22.2 / 25.0 | 4 712 / 5 077 / 5 498 | 36.99 / 39.86 / 43.16 | 2 356 / 2 539 / 2 749 | 3 299 / 3 554 / 3 848 |

**Wall thickness on a hollow anchor bar therefore runs 8 mm to 25 mm.** It is a
thick-walled tube, not a pipe. PalPile p.22 gives the overall family envelope as
**Ø 30 to Ø 135 mm**, in **S460NH and E470** (p.22 prose) — note that the p.23
table is printed at **E500/700**, a different grade to the p.22 prose in the same
brochure. Both are stated; neither is invented here.

### 3.2 The coupler, the nut and the bearing plate — the head assembly ladder

All from the Swedish table photograph. `SKARVHYLSA` = splice sleeve (coupler),
`MUTTER` = nut, `PLATTA` = plate, `Nyckelvidd` = across flats,
`Godstjocklek` = material thickness.

| Bar | Coupler OD (mm) | Coupler length (mm) | Coupler kg | Nut A/F (mm) | Nut length (mm) | Nut kg | Plate (mm) | Plate thickness (mm) |
|---|---|---|---|---|---|---|---|---|
| R32L | 42 | 160 | 0.85 | 46 | 45 | 0.35 | 150 × 150 | **8** |
| R32N | 42 | 160 | 0.85 | 46 | 45 | 0.35 | 200 × 200 | **10** |
| R32S | 42 | 160 | 0.85 | 46 | 45 | 0.35 | 200 × 200 | **12** |
| R38N | 51 | 220 | 1.7 | 50 | 50 | 0.4 | 200 × 200 | **12** |
| R51L | 63 | 140 | 1.15 | 75 | 70 | 1.55 | 200 × 200 | **30** |
| R51N | 63 | 200 | 1.9 | 75 | 70 | 1.55 | 250 × 250 | **40** |
| T51S | 70 | 160 | 2.21 | 75 | 70 | 1.5 | 250 × 250 | **50** |
| T63N | 84 | 180 | 3.49 | 90 | 75 | 2.17 | 250 × 250 | **60** |
| T76N | 95 | 220 | 6.4 | 100 | 80 | 3.6 | 250 × 250 | **60** |
| T76S | 95 | 220 | 6.4 | 100 | 80 | 3.6 | 250 × 250 | **60** |
| T111L | 140 | 250 | 11.5 | 125 | 125 | 9.3 | 300 × 300 | **80** |
| T111N | 140 | 250 | 11.5 | 120 | 120 | 9.3 | 350 × 350 | **90** |

### 3.3 The rope thread itself — the only dimensioned profile in the folder

From `Einsteckende Klemm.pdf`, the 45° section detail on a **BW64 / H64 rope
thread** shank adapter. This is the *shank* thread, not a bar thread, but it is
the same family of profile and it is the only one anywhere here with numbers on
it:

| Feature | Value |
|---|---|
| Thread designation | BW64 (Eurodrill H64), **2 tpi, left hand**, "Wellengewinde / Rope thread" |
| Major diameter | **Ø 71.8 −0.1** |
| Minor diameter | **Ø 67** |
| **Derived thread depth** | **(71.8 − 67) / 2 = 2.4 mm** |
| Flank angles | **7.5°** on one flank, **7° +0.5** on the other |
| Profile widths shown on the 45° detail | 5.5 and 8 |
| Threaded length on the adapter | 231 mm |

**The modeller's takeaway: a rope thread is SHALLOW and ROUND.** 2.4 mm of depth
on a 71.8 mm diameter is a **radial depth of 1/30 of the diameter**. The flanks
lie back only 7°, so the profile is not a V — it is a broad, low, rounded wave,
which is exactly why it is called a rope thread and why it survives being hammered
through rock. Model it as a shallow helical *swell*, not as a machine screw. At
any normal camera distance it reads as ribbing, not as teeth.

### 3.4 The rest of that shank adapter — the machine end of the string

Also from `Einsteckende Klemm.pdf`, because it fixes what the top of an anchor
string looks like at the drifter:

- Overall length **746 ± 0.3 mm**; mass **23 kg**.
- Striking / butt face **Ø 70 −0.05**, with a **15° chamfer** and R2 edge.
- **12-spline drive section**: **Ø 107.5 −0.3 over the splines**, root Ø 69,
  **124 mm long**, starting **87 mm** back from the butt face. This is the widest
  part of the adapter and the only non-round feature — silhouette-relevant.
- Body **Ø 70**, stepping to Ø 65 +0.10, then a **Ø 59 neck**, then the thread.
- **Internal flush bore Ø 16** the whole way through, with a **Ø 10 cross-hole**
  through a **25 mm flat**, 243.5 mm from the thread end.
- 2 × 45° chamfer and a 10° lead on the threaded nose.
- Material **1.6587**, **case hardened 0.8–1.2 mm**, surface **56 +2 HRC**, core
  **32 +2 HRC**. *"All edges rounded Rmin = 1."*

Flushing shafts that go with this class of adapter come in **OD 160** and
**OD 100** (`Price list Ischebeck.pdf` p.1).

### 3.5 The carbide inserts on the bit face

Two single-part drawings, both dimensioned, both **carbide inserts and not anchor
plates** despite the filenames:

**`R8 plate.pdf` — "R8 Platte 3d", scale 10:1** (a chisel insert):
- **25.00 long × 15.00 wide × 6.00 thick**
- one corner on **R8.00**, leaving a **7.00** flat across the top
- **17.00** from the base to where the radius starts
- **1.00 × 1.00 chamfer** along the top edge
- **7° relief** on the flank — the insert **tapers**, it is not a prism

**`Dachplatte 32.pdf` — "Dachplatte 32" (roof plate 32), scale 5:1** (a gable insert):
- **32.50 wide × 22.00 high × 9.00 thick**
- **R3.00** at the apex, **R4.00** at both shoulders
- roof faces at **10°** and **20°**; a further **10°** on the back
- **5° draft** on the leading face

These independently confirm what `_photos.md` recorded from `carbide_info.png`
and from the scanned three-view (15 × 10 × 6, R6 corner, 2° flank draft, 7° top,
0.8 × 45° chamfers). **Three separate sources now agree that the inserts on
chisel and cross bits are tapered PLATES with radiused corners and chamfers all
round — not buttons and not prisms.**

### 3.6 The over-drill ratio — the number that makes the grout annulus

**This is the most important number in the family and it is NOT SOURCED in this
folder.** Every SDA source read here dodges it:
- Minova p.8: *"All bits sizes available."* No table.
- Minova p.8: *"Drill bit adapters increase flexibility by allowing the use of
  drill bits designed for other dimensions of hollow bars"* — i.e. bit size is
  explicitly **decoupled** from bar size, which is why no such table exists.
- Minova p.7: spacers *"ensure the correct grout cover of the load-bearing element
  according to the relevant standards and as specified in the approvals"* — the
  cover requirement lives in EN 14199 / EN 14490 and the ETA, not the brochure.
- PalPile p.22: lists "clay bits and (button) rock bits" as stock items, no sizes.

What can be honestly offered:

- **Secondary, web-sourced, already in research pack 11 §C.2 (l. 1246):**
  indicative bit sizes **R32 → 45–51 mm**, T38 → 64–76 mm, T51 → 89–102 mm.
  For an R32 bar of actual OD 31.3 that is an over-drill ratio of **1.44 – 1.63**
  and a **radial annulus of 6.9 – 9.9 mm**. Flagged secondary there; flagged
  secondary here. Do not promote it to a fact.
- **A different family, for contrast only, from EMDE pp. 4–7:** in *cased*
  drive-drilling the lost bit is only **1.05 – 1.33 ×** the tube it sits on
  (80/85/90 on Ø 76.1; 95/100/110 on Ø 88.9; 107/115/135 on Ø 101.6). **Do not
  transfer this to SDA.** A cased tube follows its own bit into the hole and
  needs only clearance; an SDA bar deliberately sits in a hole much larger than
  itself so grout can surround it. The two ratios exist for opposite reasons.
- **Also a different family, but properly published, and the closest thing to a
  real over-drill ladder in the whole library:** the drilled tube micropile of
  §2.5 / §3.8. Its ring bit runs **1.08 – 1.20 ×** the tube OD, a **radial annulus
  of 8 – 20 mm**, and the source even sells deliberate **oversize variants** for a
  bigger annulus. Again: **do not transfer the ratio to SDA** — but do note the
  principle it proves, that **the annulus is chosen, not incidental**, and that
  suppliers sell more than one over-drill for the same string.

**What this means for the model, honestly stated:** the SDA bar-to-bit ratio is
the family's defining proportion and it is the one number nobody publishes,
because bit selection is by ground condition and bit adapters break the link
deliberately. A modeller has to pick a value. **Pick it once, note it as chosen
rather than sourced, and keep it consistent.** Somewhere in the 1.4–1.6 band is
defensible from the pack-11 secondary; anything outside it has nothing behind it.

### 3.7 Ratios a modeller can actually use

Ratios survive a change of size; absolutes do not. All of these are arithmetic on
the cited tables in §3.1 and §3.2 — no interpolation, no invention.

- **Coupler OD ≈ 1.3 × bar OD.** Measured across the whole ladder: 1.31 (R32),
  1.34 (R38), 1.24–1.37 (R51), 1.33 (T63), 1.25 (T76), 1.26 (T111). This is the
  tightest ratio in the family — use **1.3** and you will never be wrong by more
  than 6 %.
- **Coupler length barely scales at all: 140–250 mm for the ENTIRE range.**
  A coupler on an R32 bar is 160 mm; on a T111 bar four times the diameter it is
  250 mm. As a multiple of bar OD it *collapses* from 5.0× (R32) to 2.25× (T111).
  **A coupler is always a hand-sized sleeve.** Do not scale its length with the bar.
- **Nut across-flats ≈ 1.3–1.45 × bar OD**, falling to 1.13 at T111.
- **Nut length ≈ 0.83–1.0 × its own across-flats.** 46 A/F × 45 long;
  50 × 50; 75 × 70; 100 × 80; 125 × 125. **A hollow-bar nut is as long as it is
  wide — a stubby cube of a hex, not a thin nut.** This is one of the two details
  that make an anchor head read correctly.
- **Nut A/F ≈ coupler OD, within about 10 %.** 46 vs 42; 50 vs 51; 75 vs 63–70;
  100 vs 95; 125 vs 140. At a glance **the nut and the coupler are the same size
  of lump on the bar** — which is why a coupler in the spoil pile is routinely
  mistaken for a nut.
- **Plate side ≈ 2.7 – 6.25 × bar OD**, falling with size: 4.7–6.25 at R32,
  3.9–4.9 at R51, 3.3 at T76, 2.7–3.2 at T111.
- **Plate thickness : side climbs from 1 : 19 to 1 : 4.** 8 mm on a 150 plate;
  10 and 12 on a 200; **30 mm on a 200**; 40 on a 250; 60 on a 250; 90 on a 350.
  **This is the single most-missed proportion in the family.** A small anchor
  plate is a *sheet*. A big one is a *slab* you could not lift with one hand — the
  T111 plate is 350 × 350 × 90 mm, roughly 86 kg of steel. Thickness scales
  **11 ×** across the range while side scales only **2.3 ×**.
- **Plate side ≈ 2.5 – 4.0 × nut across-flats.** The nut covers a quarter to a
  third of the plate's width. It does not look lost on it.
- **Mass, for animation weight:** a 3 m R32N bar is **10.2 kg** — one hand, one
  man, thrown onto a rack. A 3 m T111N bar is **109 kg** — it goes on the rig by
  crane or handling arm and never by hand. Couplers run 0.85 → 11.5 kg, nuts
  0.35 → 9.3 kg.
- **Bar ID : OD is NOT constant** — it runs from **0.47** (R32S) to **0.73**
  (T111L) and generally *rises* with size. Never derive the bore from a fixed
  fraction of the outside; use the table.

### 3.8 The drilled tube micropile ladder (§2.5) — a fully dimensioned parallel family

Worth having in full, because it is the **only** anchor-family product in this
folder whose bit, coupler and plate are all published against the same size ladder.
Where the SDA sources go quiet, this one does not.

**Ring bit OD against pile OD** — `SSAB_RR_and_RD_palar…pdf` Table 5.3 pp. 32–33
(six vendors quoted; the spread across vendors is the interesting part) with pile
OD from Table 2.7 p. 9:

| Pile OD (mm) | Ring-bit OD range across vendors (mm) | Radial annulus (mm) | Ratio |
|---|---|---|---|
| 88.9 | 105 – 107 | 8.1 – 9.1 | 1.18 – 1.20 |
| 114.3 | 128 – 140 | 6.9 – 12.9 | 1.12 – 1.22 |
| 139.7 | 158 – 168 | 9.2 – 14.2 | 1.13 – 1.20 |
| 168.3 | 188 – 200 | 9.9 – 15.9 | 1.12 – 1.19 |
| 219.1 | 240 – 254 | 10.5 – 17.5 | 1.10 – 1.16 |
| 273.0 | 300 – 312 | 13.5 – 19.5 | 1.10 – 1.14 |
| 323.9 | 350 – 364 | 13.1 – 20.1 | 1.08 – 1.12 |

**The ratio falls as the pile grows but the radial annulus stays roughly constant
at 8–20 mm.** That is the real rule: the annulus is an absolute clearance, not a
percentage. Different vendors on the same pile differ by up to 12 mm.

**Pilot bit, ring bit and casing together** — `RDT CAS catalog_2024-11-2.pdf`
pp. 8–10, the three-diameter relationship that no other source gives:

| Casing OD (mm) | Pilot OD (mm) | Ring-bit OD (mm) | Ring-bit ID (mm) |
|---|---|---|---|
| 88.9 | 71 | 95 | 55 |
| 101.6 | 84 | 108 | 65 |
| 114.3 | 92 – 93 | 119 / 122 / 125 / **129** | 68 – 82 |
| 127.0 | 105 | 135 | 90 |
| 139.7 | 116 – 126 | 150 / 160 / **180** | 87 – 116 |
| 168.3 | 139 – 152 | 178 / 179 / 190 / **210** | 110 – 141 |
| 219.1 | 190 – 202 | 230 / 234 / 246 / **279** | 158 – 190 |
| 273.0 | 242 – 254 | 286 / 302 / **333** | 203 – 240 |
| 323.9 | 292 – 297 | 336 / 352 / **383** | 254 – 282 |
| 406.4 | 370 – 375 | 419 / 438 / **466** | 336 – 356 |
| 508.0 | 454 | 518 | 432 |

Bold entries are the catalogue's **oversize ("OD") ring-bit variants** — the same
casing, deliberately given a larger annulus. Note the shape of the assembly:
**the pilot is smaller than the casing, the ring bit is larger.** The pilot drills
the core and comes back out; the ring reams the shoulder and stays.

Naming grammar, verbatim structure from the same catalogue p.3:
`Model – Nominal casing size – Max wall thickness – Ring bit or shoe ID –
Additional info – Component`. Model families: **A** thin-walled, **B** thick-walled,
**T** forepoling, **X** heavy-duty, **R** retrievable.

**Threaded sleeve couplers** — `SSAB…pdf` Table 5.3, external sleeves that sit
proud of the tube (confirmed on Fig. 2.4 p. 9):

| Pile OD (mm) | Coupler OD (mm) | Coupler length (mm) | Ratio OD |
|---|---|---|---|
| 88.9 | 101.6 | 160 | 1.14 |
| 114.3 | 126.9 | 160 | 1.11 |
| 139.7 | 152.4 | 160 | 1.09 |
| 168.3 | 181.9 | 200 | 1.08 |
| 219.1 | 234.9 | 200 | 1.07 |
| 273.0 | 292.0 | 200 | 1.07 |
| 323.9 | 343.0 | 220 | 1.06 |

**Compare with the SDA coupler (§3.7): OD ratio 1.3 there, only 1.06–1.14 here.**
An SDA coupler is a fat lump; a tube-pile sleeve is a barely-raised band. Coupler
length is again almost flat — **160–220 mm across a 3.6× range of pile diameter**,
the same rule as the SDA family. Splice tensile capacity is *"guaranteed 50 % of
the pile's compression capacity"* (SSAB p. 10), 380 → 3 370 kN (Table 2.9 p. 11).

**Top / bearing plates** — `SSAB…pdf` Table 2.10 p. 12, square flat plates in
S355J2 as standard:

| Plate (mm) | Fitted to pile OD (mm) | Thickness : side |
|---|---|---|
| 150 × 150 × 15 | 76.1 – 88.9 | 1 : 10 |
| 200 × 200 × 20 | 114.3 | 1 : 10 |
| 250 × 250 × 25 | 114.3 – 139.7 | 1 : 10 |
| 300 × 300 × 30 | 168.3 – 273.0 | 1 : 10 |
| 350 × 350 × 35 | 219.1 – 273.0 | 1 : 10 |
| 400 × 400 × 30 | 323.9 | 1 : 13 |
| 450 × 450 × 40 | 273.0 – 323.9 | 1 : 11 |
| 500 × 500 × 40 | 323.9 | 1 : 12.5 |

**A striking contrast with the SDA plate ladder in §3.2.** Here thickness:side is
held at almost exactly **1 : 10** across the whole range; on the SDA ladder it
sweeps from 1 : 19 to 1 : 4. Two different products, two different rules — which
is precisely why a modeller cannot borrow one plate ladder for the other.

The detail that identifies a tube-pile top plate on sight: **a spigot tube
("styrrör") is welded to the underside** to centre the plate on the pile
(SSAB p. 11 and Fig. 2.4 p. 9). Plates may also be drilled for post-grouting or
for a tension anchor through the middle (p. 11) — **hole diameter NOT SOURCED.**

**Standard supply lengths, tube micropiles** (`SSAB…pdf` Table 2.8 p. 10):
**1 / 1.2 / 1.5 / 2 / 3 / 4 / 6 / 12 m**, with **6 m** the stock length for most
sizes and 12 m for the larger. Compare **3 m** for an SDA bar (§3.1).

**Rock shoe types** (SSAB Fig. 2.3 p. 8): three — **structural-steel stud**,
**hardened stud**, and **hollow stud** (the hollow one lets a tension anchor be
drilled and grouted straight through the pile into rock). Plus **end
reinforcement**: a steel band **150–500 mm wide** and **10, 15 or 20 mm thick**
welded around the outside of the tube nose.

---

## 4. Component inventory

Named exactly as the labelled exploded assembly on `Minova-SDA-Brochure…` p.2
names them, in the order they appear on the string.

### 4.1 The hollow bar

The tube itself. **Seamless**, thick-walled (8–25 mm per §3.1), with the coarse
thread **cold-rolled** — not cut — along its whole length. Cold rolling matters
visually: the crests are **formed and rounded**, with no cut chip marks and no
sharp start-of-thread; the thread simply *is* the surface of the bar.

**Why it matters visually:** it is the one object on a drilling site that reads as
a giant screw. Every other rod, tube and casing has a plain body and a joint at
each end; this has neither. If the model shows a plain section anywhere along an
SDA bar, it is not an SDA bar.

Second-order details worth having: the **bore is visible at every cut end** as a
dark annulus (§3.1 gives the exact ID per size), and it is the flush and grout
path — a bar lying on the ground with grout still setting in it will have a grey
plug at the low end.

### 4.2 The sacrificial (lost) drill bit

Screws onto the leading end and **stays in the ground forever**. Female thread up
the middle, a stubby body roughly as long as it is wide, flushing ports through
the face, and a cutting face whose shape is chosen for the ground.

Eleven types, with silhouettes, from `Minova-SDA-Brochure…` p.8 (looked at):

| Code | Name | What the silhouette looks like |
|---|---|---|
| **EW** | Clay Bit | Broad flat face with two long swept wings much wider than the body — an arrow-head |
| **XX** | Clay Cross Cut | A **star**: four long thin blades radiating well past the body. The widest silhouette in the set |
| **EX** | Cross Cut Hardened Steel | Compact faceted cone with crossing chisel edges cut into it |
| **EXX** | Cross Cut Carbide | Cylindrical body, an **X of dark carbide plates** across the face |
| **EC** | Hardened Arching Bit | Smooth **domed / arched** crown, rounded nose |
| **ECC** | Carbide Arching Bit | Same arch with a dark carbide plate set across it |
| **EY** | Hardened Center Drop | Two raised outer lobes with a **recessed middle** |
| **EYY** | Carbide Drop Center | Same drop-centre form, carbide inserts |
| **ES-F** | Steel Button | Cylindrical, domed face, **rounded steel buttons** |
| **ESS-F** | Carbide Button | Cylindrical, domed face, **dark carbide buttons** |
| **ES-D** | Tricone Button Bit | Genuinely a **miniature tricone** — three roller cones |

**Why it matters visually:** the bit is the only place the string gets *bigger*
going down. It is a flare at the end of a uniform screw. It is also the part the
player pays for and never gets back, which is the whole economic point of the
family — *"The correct selection of the drill bit dependent on the geological
conditions on site is essential"* (p.8).

Cutting media: **carbide PLATES** on the chisel/cross/arching types (§3.5 gives
two dimensioned real ones: 25 × 15 × 6 with an R8 corner and 7° relief;
32.5 × 22 × 9 with an R3 apex and 5–20° roof angles), **buttons** only on the
ES-F / ESS-F / ES-D types. A cross bit is **a steel body with plates brazed into
the leading faces**, not a solid carbide cross.

**Drill bit adapters** also exist — a short thread-to-thread step that lets a bit
sized for one bar go onto another (Minova p.8). One more small part in the crate.

### 4.3 The coupler / extension coupling

A **plain cylindrical sleeve, internally threaded right through**, that joins two
bars. 1.3 × bar OD, 140–250 mm long, 0.85–11.5 kg (§3.2, §3.7). The outside is
smooth in the labelled assembly illustration — no flats, no knurl, no hex.

The detail that decides how it is modelled: *"All couplers are designed to safely
transfer the specified system load, **with the faces of the hollow bars bearing
against each other** to ensure safe energy transfer between the hollow bars and
the drill bit **without affecting the couplers mechanically**"* (Minova p.7). The
two bar ends **butt in the middle of the sleeve**; the coupler is a spacer that
holds them concentric and takes tension, and the hammer blow passes steel-to-steel
straight through the joint. So the coupler sits centred on the joint with the
thread of both bars disappearing into it, roughly half its length on each side.

**The EPD names the feature that makes that work.** `ITB-EPD_140-Minova…pdf` p.2,
Fig. 2 callout: *"Coupler with **centre stop** enabling direct end-to-end bearing
between rods thereby minimizing energy loss during drilling."* So the sleeve is
**not a plain tube inside** — there is an internal stop ring or shoulder at
mid-length that both bar ends land on. Two consequences for the model: the coupler
is **exactly centred** on the joint, not slid to one side; and if it is ever shown
in section or as a loose part, the bore has a step in the middle.

Two variants exist: the **standard** coupler, and a **short ("LC") R-thread
coupler** made possible by a different thread design (p.7). A short one and a long
one on the same bar in the same shot is a real thing.

For contrast, the *tube micropile* sleeve of §3.8 is a very different object —
**OD only 1.06–1.14 × the tube** instead of 1.3 ×, and it needs a stated
**tightening torque of 1–3 kNm** (SSAB Table 5.3). A coupler that has a torque
spec is a coupler somebody puts a wrench on.

**Why it matters visually:** it is the only interruption in the thread pattern
along the whole bar, and it **stands proud** — a smooth barrel 30 % fatter than
the bar, with the ribbing resuming on both sides. On a long anchor there is one
every bar-length, so a 20 m anchor shows a regular rhythm of lumps.

### 4.4 The nut — and the spherical seat

*"The nuts are manufactured with **at least one spherical end** to compensate for
deviations of the borehole angle with respect to the plate surface"* (Minova p.2,
repeated p.7). **This is the detail that says "anchor" rather than "bolt".**

An anchor is almost never square to the face it bears on — it goes into the ground
at whatever angle the design and the rig geometry gave it, and the face is rock or
shotcrete or a wall, not a machined surface. The **spherical end of the nut seating
into a chamfered bore in the plate** is what takes up that mismatch:
*"The steel plates feature a chamfered bore allowing an **angle of deviation of
five degrees in all directions**"* (Minova p.7).

**There is no separate spherical washer in this system.** The sphere is **on the
nut**, and the seat is **in the plate**. (A separate hemispherical washer is the
convention on some solid-bar rock bolts, which is a different product — §2.2/§2.4.)

**What the head stack actually is**, from `ITB-EPD_140-Minova…pdf` p.2 Fig. 2
(read as an image): **a flat plate against the face, a domed plate on top of it,
and the nut outboard of the domed plate** — the figure labels the middle part
*"Domed plate made of cold-formed flat steel"*. So a real head can carry **two
plates**, and the domed one is a **pressed dish**, not a turned washer. Its
concave underside beds on the flat plate and its chamfered bore takes the nut's
spherical end. That is three parts, not four, and none of them is a lathe-turned
spherical seat. See §9.3.

Geometry: across-flats **46–125 mm**, length **45–125 mm**, and **as long as it is
wide** (§3.7). A hex, one end flat, the other end a spherical cap.

**Why it matters visually:** a stubby, almost cubic hex that sits *tilted* on the
plate whenever the anchor is skew. A nut sitting perfectly square with a flat face
on a flat plate is the single most common way an anchor head is modelled wrong.

### 4.5 The bearing plate

*"The **domed or flat** plates feature a chamfered bore to ensure firm seating of
the nut"* (Minova p.2). Both forms exist; the labelled assembly illustration shows
a **flat square plate**, and the installed-face photograph on the same page shows
flat square plates lying against the face.

Square, side 150–350 mm, thickness 8–90 mm, chamfered central bore (§3.2, §3.7).
Underground the class is smaller — **rectangular max 150 × 150, round max Ø 200**
(`bolter.md`, Boltec S).

**Why it matters visually:** it is the only flat plane in the whole assembly and
the only part that touches the structure, so it catches light differently from
everything around it and it collects grout, shotcrete overspray and dirt at its
lower edge. Get the **thickness** right (§3.7) or the head reads as a washer.

### 4.6 Spacers / centralisers

*"Spacers are used to centre the hollow bars within the borehole and to ensure the
correct grout cover of the load-bearing element according to the relevant standards
and as specified in the approvals"* (Minova p.7).

Clipped onto the bar at intervals, they hold it off the borehole wall so grout can
get all the way round. In the field they are **plastic spiders** with radial fins.

**Why it matters visually:** they are the reason the bar sits in the *middle* of
its grout column rather than lying on the bottom of the hole. On the surface they
are only seen at installation, on bars laid out on the ground before they go in.

**Dimensions, fin count, spacing and colour: NOT SOURCED.** See §8.

### 4.7 Grout, and where it ends up

Grout is pumped down the bar's own bore and comes back up the annulus between bar
and borehole. It ends as a **cement column with the bar buried in the middle of
it**. The over-drill (§3.6) is what creates the space it fills.

On site (from `_photos.md` §3, the jet-grout / micropile sequence — the richest
grout reference in the library):
- **Grey cement grout spoil flows away from each borehole in a wide pale tongue**
  across the ground and **dries lighter than the soil around it.**
- **Grouting hoses lie coiled loose in long lazy S-curves**, grey-black, running
  from the rig to the pumps, never tidied.
- Steel buckets and drums stand about (grout samples, waste).
- A cut-off casing stub stands proud of the ground **with grout spilled around its
  collar**.
- Tall orange binder silos on tripod legs with a screw conveyor to a mixing
  container; pallets of bagged binder and white bulk bags beside the containers.

### 4.8 Grout swivel / rotary injection adapter

*"The grout swivels consist of a **grout body and a swivel shaft** and are attached
to the **shank adapter**. The grout swivels are suitable for simultaneous drilling
and grouting"* (Minova p.7); p.4 calls the same thing a **rotary injection
adapter**. It is what lets a non-rotating grout hose feed a rotating, hammering
bar. On the rig it sits between the drifter's shank adapter and the hose.

### 4.9 Neck protection tubes

*"Protection tubes for soil and rock nails (plastic tubes) and pile neck protection
tubes (plastic or steel tubes) are available upon request"* (Minova p.7). A sleeve
over the top of the bar where it exits the ground — the most corrosion-exposed
zone. Dimensions NOT SOURCED.

### 4.10 The shank adapter (the machine end, not a consumable)

Fully dimensioned in §3.4. Included because the string has to *end* somewhere on
the model: butt face, 12-spline drive collar, plain body, rope thread, internal
flush bore end to end.

### 4.11 Clamping jaws (rig-side consumable)

`Price list Ischebeck.pdf` p.2 lists **flat**, **flat angled** and **thick**
clamping jaws priced in lots of **50 / 100 / 300**, plus seal rings at €0.10.
Consumables bought by the hundred are consumables that wear out fast — these are
the serrated jaws in the rod holder / breakout table that grip the bar, and their
bite marks are a §6 wear feature.

---

## 5. Distinctive features (thumbnail silhouette test)

At 64 px, in shadow, with no texture — what still identifies each of these?

1. **The SDA bar: a screw, end to end.** A continuous helical rib with **no plain
   section anywhere**. No collar, no upset, no tool joint, no shoulder. That
   uniformity across the full length is unique on a drilling site — every rod,
   casing and auger in the game has joints. If a silhouette shows a smooth middle
   with threaded ends, it is a drill rod, not an anchor bar.
2. **The thread is shallow and rounded, not toothed.** Depth ≈ 1/30 of diameter,
   flanks laid back 7° (§3.3). At thumbnail size it reads as **ribbing or a
   corkscrew shadow**, never as a sawtooth. A V-thread silhouette is wrong.
3. **The coupler is a smooth barrel that interrupts the ribbing.** 1.3 × the bar
   OD, hand length, and the thread resumes on both sides. On a long anchor these
   repeat at regular intervals — the rhythm itself is a tell.
4. **The bit is a flare.** The only place the string gets wider going down, and it
   is stubby: roughly as long as it is wide. Cross and star types throw blades
   well outside the body diameter; button and arching types stay near it.
5. **The head is: flat plate → stubby hex → stub of bar sticking out past the
   nut.** The projecting stub is what says *installed but not yet trimmed*, which
   is what almost every real anchor head looks like.
6. **The nut is nearly cubic.** As long as it is wide (§3.7). A thin nut on a
   thick plate is the wrong way round; an SDA head is a **fat nut on a plate that
   may be thinner than the nut is long** at the small sizes.
7. **The head is TILTED.** Spherical nut end in a chamfered plate bore, ±5° in any
   direction (§4.4). A row of anchors on a face is a row of *slightly different*
   angles, not a grid of identical square-on bolts.
8. **Plate thickness is the size cue.** Sheet-thin at 150 mm square; a 90 mm slab
   at 350 mm square. If every plate in the scene is the same relative thickness,
   the size ladder has been faked.
9. **Family discrimination at a glance:** SDA = screw with a knob (bit) on the
   end; **bar anchor** = same screw, **no knob, solid section, thinner**;
   **strand anchor** = a bundle of cables with a round head, no thread at all.

---

## 6. Materials, paint and wear

### 6.1 The three finishes, and they look nothing alike

`Minova-SDA-Brochure…` p.6 lists exactly three, and the difference is the biggest
material decision on this family:

- **Bright (uncoated) steel — "black bar".** A seamless tube straight from the
  mill: **dark blue-grey mill scale**, matt, patchy, with darker and lighter
  bands along the length. Outdoors it goes **orange-brown all over within days**,
  and a bundle left in a yard for a season is uniformly rust-brown with the scale
  showing through in flakes. This is what temporary work (≤ 2 years, p.6) gets.
- **Hot-dip galvanised to ASTM A123.** A **matt mid-grey**, slightly mottled, with
  a faint crystalline spangle. **It is not chrome and it is not shiny.** Zinc
  pools and drips at the ends and in the thread roots, so the roots read slightly
  lighter and softer than the crests. With age and wet ground it dulls to a grey-
  white and grows **white powdery zinc-oxide bloom** in the recesses. Minimum
  average thickness quoted in the corrosion legend on the same page: **85 µm**.
- **HDG + epoxy ("TwinCoat").** Three layers, and the brochure's own legend names
  them bottom-up: **Bright Steel → Zinc Layer → EP Layer**. Epoxy over zinc over
  steel. **Colour NOT SOURCED** — do not guess one.

The corrosion table on p.6 works in **sacrificial corrosion loss in mm** against
soil aggressiveness (low / medium / high) and design life (2 years → 50 years+),
with steel A = bright, steel B = galvanised. The design consequence, for anyone
writing shop text: a permanent anchor is deliberately **over-sized in section** to
have steel left after fifty years of corrosion.

### 6.2 The rust bloom on a cut end

Bars get **cut to length on site** — that is the whole point of a continuous
thread. A disc-cut end is a **bright bare-steel annulus** (bore in the middle,
thread crests around the outside) that within hours goes straw, then within a day
or two orange-brown, and it **bleeds a short distance back down the first two or
three thread turns**.

**On a galvanised bar this is the only rust on the entire part**, which is exactly
why it reads so strongly: a uniform matt grey bar with **one orange ring at the
cut end**. Get this and the model looks used; leave it out and it looks like a CAD
render.

### 6.3 Where the drifter damages the thread

The bar is hammered. Everything at the machine end takes it:

- **The driven end's thread crests get peened, burred and bright.** Zinc is gone
  from the first turns; the crests are flattened and silver, with the roots still
  grey. This is the second-most-visible wear feature after the cut end.
- **The rod-holder / breakout jaws bite.** The jaws are a bulk consumable bought
  50–300 at a time (§4.11), so they grip hard: expect **bright cross-hatched bite
  marks** in short bands where the jaws close, again with the coating removed.
- The **shank adapter** itself is case-hardened only 0.8–1.2 mm deep at 56 HRC over
  a 32 HRC core (§3.4). Its striking face mushrooms, its splines polish bright on
  the drive flanks and stay dull on the back flanks.

### 6.4 Grout, which goes everywhere

Grout is the family's signature material and the game has nothing like it
(`_photos.md` §3 is explicit that this is the most site-specific detail in the
whole library).

- On the ground: **wide pale-grey tongues** flowing from each borehole, drying
  **lighter than the surrounding soil**, cracking as they cure.
- On the head assembly: **lumpy pale-grey crust in the thread roots**, a collar of
  spilled grout around the hole mouth, splashes up the plate. The plate's lower
  edge is usually **half-buried** in it.
- On everything else: splash on the mast, the feed, the hoses, the operator's
  boots and the lower metre of the rig. It dries as a **chalky film that dulls
  paint** rather than as glossy drips.
- Fresh vs cured: fresh grout is a **wet mid-grey with a sheen**; cured is
  **chalky, pale and matt**. Both appear on the same site at the same time.

### 6.5 The carbide

Inserts and buttons read **lighter, greyer and colder** than the steel body they
sit in — almost a silver-grey. Matt when new. A worn cutting edge **polishes to a
mirror wear-flat** while the rest stays matt, and that contrast is the whole
visual story of a used bit.

### 6.6 Paint on small bits

From `_photos.md` §2: small cross bits photographed on a desk ship **painted** —
one **bright orange-red**, one **dark oxblood/maroon** — in a thick, slightly
textured enamel over a granular cast surface. Bare steel is wrong for the small
size class.

### 6.7 The other approach: no coating at all, and extra steel instead

The drilled tube micropile of §2.5 is **deliberately uncoated**. Corrosion is
handled by making the wall thicker and writing the loss off, which is why a yard
holding both products shows **matt grey galvanised anchor bars beside frankly
rusty black tube piles** and neither is neglected.

The design allowances, from `SSAB_RR_and_RD_palar…pdf`, are worth having because
they say how rusty is normal. Table 3.3 p. 18, loss in **mm** per EN 1993-5:

| Ground | 5 yr | 25 yr | 50 yr | 75 yr | 100 yr |
|---|---|---|---|---|---|
| Undisturbed natural soil (sand, silt, clay, shale) | 0.00 | 0.30 | 0.60 | 0.90 | 1.20 |
| Non-compacted non-aggressive fill | 0.18 | 0.70 | 1.20 | 1.70 | 2.20 |
| Contaminated natural soil / industrial ground | 0.15 | 0.75 | 1.50 | 2.25 | 3.00 |
| Aggressive natural soil (bog, marsh, peat) | 0.20 | 1.00 | 1.75 | 2.50 | 3.25 |
| Non-compacted aggressive fill (ash, slag) | 0.50 | 2.00 | 3.25 | 4.50 | 5.75 |

Table 3.5 p. 19 gives a simplified 100-year allowance of **2 mm** in sand and
gravel, **3 mm** in clay and silt, **4 mm** in gyttja, peat and mud (above
groundwater; one millimetre less below it). Table 3.4 p. 18 gives the VTT
equivalent as **1.2–2.5 mm per 100 years** depending on fill.

Concrete cover inside a filled tube pile: *"minst **40 mm**"* from the tube's
inner wall to the main reinforcement, or **25 mm** where a smaller tube is used as
the reinforcement (SSAB p. 39). Piles under **200 mm** diameter are normally filled
with **injection grout** rather than concrete; larger ones with higher-strength
concrete, re-vibrated at **1.5 m** intervals. **This is internal cover in a tube —
it is not the SDA grout annulus and must not be reused as one** (§8).

---

## 7. Photo references

Read `research/rigs/_photos.md` first; it indexes the whole folder and it was
written before this document. What it flags for this family:

| Image | What it gives |
|---|---|
| `C:\Users\henri\Downloads\482200326_1078807137620999_5363155536554947896_n.jpg` | **The primary source of §3.1–§3.2.** A printed R/T hollow-bar specification table with bar, coupler, nut and plate ladders. `_photos.md`: *"The most information-dense single image in the library for any tool family."* Opened and transcribed here. |
| `Minova-SDA-Brochure-EN-USA-MEX.pdf` p.2 (rendered) | The **labelled exploded assembly** (Nut, Plate, Hollow bar, Extension coupling, Sacrificial drill bit) *and*, filling the right half of the spread, a large **installed photograph of a bolted face**: bars projecting at a downward angle from a dark wet shotcrete/rock face, **cut off at visibly different lengths**, flat pale square plates lying against the face, a hex nut on each, mesh crossing behind, and **orange rust bloom on some bars where the coating is broken**. This is the best "what it looks like installed" reference found. |
| `Minova-SDA-Brochure-EN-USA-MEX.pdf` p.8 (rendered) | The **eleven bit-type silhouettes** transcribed in §4.2. |
| `Einsteckende Klemm.pdf` (rendered + 400 dpi crop) | Dimensioned shank adapter and the **only dimensioned rope-thread profile** in the folder (§3.3, §3.4). |
| `R8 plate.pdf`, `Dachplatte 32.pdf` (rendered) | Dimensioned **carbide inserts** (§3.5). |
| `C:\Users\henri\Downloads\carbide_info.png`, `WhatsApp Image 2026-08-22 at 10.57.35.jpeg` | Per `_photos.md`: the same insert family at other sizes, and the one that gives the **draft angles**. Confirms §3.5 independently. |
| `WhatsApp Image 2026-06-30 at 13.00.10.jpeg`, `… 16.36.00.jpeg` | Per `_photos.md`: two **four-blade cross bits** on a desk with office clutter for scale, one orange-red one maroon; and a macro of the crown head-on showing a **rectangular carbide insert set into each leading face** and the flushing holes. Directly applicable to §4.2. |
| `WhatsApp Image 2026-08-06 at 12.24.27 (1)/(2)`, `12.24.28`, `12.24.29 (1)/(2)/(3)` | Per `_photos.md` §3: the **complete jet-grout / micropile site** — grout tongues, hoses, silos, containers, sheet piling, crane, crew. The §6.4 grout description comes from this sequence. |

**The gap `_photos.md` itself records, verbatim in its own summary:** for
`tools-anchors-sda` there is *"one specification table, which is excellent for
proportion, but **not one photograph of an anchor, a coupler, a nut or a bearing
plate as a physical object**. Nothing shows the galvanised finish, the thread's
rolled profile, or how a plate sits."* The Minova p.2 face photograph found while
writing this document partially closes that — it shows installed heads at
distance — but there is still **no close-up of a single anchor component in hand**.

---

## 8. NOT SOURCED

Everything here stayed unfound. **None of it may be invented.**

**The big one:**
1. **Sacrificial bit diameter for a given bar size.** No table exists in any source
   read, and Minova explicitly decouples the two by selling bit adapters (§3.6).
   Therefore the **over-drill ratio and the grout annulus thickness are NOT
   SOURCED.** The only figure available is the secondary web citation already in
   research pack 11 (R32 → 45–51 mm). Treat as indicative, not as fact.
2. **Grout cover requirement in mm.** Minova points at EN 14199 / EN 14490 and the
   ETA; neither document is in the folder.

**Bit geometry:**
3. Bit body length, face profile, flushing-port count, port diameter, blade
   thickness, blade sweep angle — the p.8 silhouettes are unscaled thumbnails.
4. Which bit types exist in which diameters ("All bits sizes available" is all the
   brochure says).
5. Drill-bit-adapter dimensions.

**Head assembly:**
6. **Spherical seat radius on the nut**, and the **chamfer angle and bore diameter
   of the plate**. Only the functional consequence is sourced: ±5° in any direction.
7. Domed-plate geometry — dome height, radius, whether the dome is pressed or
   machined. Only *"domed or flat"* is stated.
8. Whether the plate bore is round or slotted.

**Centralisers:**
9. **Everything.** Outside diameter, fin count, fin shape, axial length, spacing
   along the bar, material, colour. Minova states only that spacers exist and why.

**The bar:**
10. ~~Standard supply lengths.~~ **CLOSED on the second pass.** `ITB-EPD_140-Minova…pdf`
    p.3 Fig. 3 dimensions the bar as **L = 3 m**. Kept in the list, struck through,
    so nobody re-opens it.
11. Published pitch and thread depth per R/T size. Only the BW64 **shank** profile
    is dimensioned here (§3.3). The `THREAD_SPECS` values in `tools.js` are not
    confirmed by anything in this folder.
12. Whether the R51 major diameter is 50.0 (Minova p.8) or 50.8 (`tools.js`) — the
    two disagree and no third source settles it.
13. Coupler wall thickness, and whether the coupler outside is truly plain (the
    brochure illustration shows plain; no drawing confirms it).
14. Neck-protection-tube dimensions.

**Whole sub-family:**
15. **Strand anchors — every dimension.** Strand count, strand diameter,
    head/barrel diameter, wedge geometry, sheathing diameter, free-length vs
    bond-length proportion: all unfound. §2.3 now carries one *sourced functional*
    distinction (stressing head + wedges vs tensioning chair + nut, `spantec.pdf`
    pp. 4–5) and nothing dimensional. Do not model one.

**Found on the second pass and still missing:**
16. The Minova EPD carries **no load ratings and no steel grade** for any bar,
    which is a genuine hole in an EPD. The loads in §3.1 come from the brochure and
    the Swedish table instead; the grade (EN 10083-1) from the Swedish table alone.
17. **Coating thicknesses** for galvanised and TwinCoat. Only the 85 µm minimum
    average in the brochure's corrosion legend; the EPD gives none.
18. **SDA plate parameters, named but never numbered.** `ITB-EPD_140-Minova…pdf`
    p.3 lists thrust plates as varying by *"different diameters, square sides,
    sheet thicknesses and hole diameters"* — all four of the things a modeller
    wants, and not one value. The §3.2 plate ladder comes from the Swedish table
    photograph only.
19. **Dome geometry on the domed plate** — height, radius, blank thickness. Only
    *"cold-formed flat steel"* (EPD p.2 Fig. 2).
20. **Tube-pile top-plate hole diameter** where plates are drilled for post-grouting
    or a through anchor (SSAB p. 11).
21. The internal-corrosion table (SSAB Table 3.6 p. 19) has **two unlabelled numeric
    columns** under one merged header; the sub-agent that read the rendered page
    reports the column meanings are genuinely not printed. **Do not guess which is
    which.**

**Materials:**
16. **Epoxy / TwinCoat colour.** Only the layer stack is given.
17. Paint colours for anchor-family bits (the orange-red and maroon in §6.6 come
    from photographs of small cross bits, not from a specification).

---

## 9. Domain-truth warnings — what the game currently gets wrong

All quotations are from `src/rig/tools.js` **§10 SELF-DRILLING ANCHORS (SDA)**,
ll. 4731–4875, and `THREAD_SPECS` ll. 578–600, read read-only. **Do not edit that
file from this document** — this section is a findings list for whoever does.

### 9.1 The bearing plate is a constant 20 mm thick. Real thickness scales 11×.

```js
part(T, g, G.box(T, s, mm(20), s), galv, { p: [0, -mm(10), 0] });
…
thread: thread, sideMm: sideMm, thicknessMm: 20, finish: 'Hot-dip galvanised',
```

`thicknessMm` is hard-coded at **20** for every plate the game builds, at any
`sideMm`. **Not one row of the sourced ladder is 20 mm** (§3.2): the ladder is
8, 10, 12, 12, 30, 40, 50, 60, 60, 60, 80, 90. The default 200 mm plate should be
**10–12 mm** on an R32/R38 bar and **30 mm** on an R51L. The T111N plate should be
**350 × 350 × 90**. **Plate thickness : side runs 1:19 at the bottom of the family
and 1:4 at the top** — a fixed thickness destroys the entire size ladder, and it is
the single largest geometry error in this family.

### 9.2 The nut is sized from the PLATE, not from the bar, and comes out 43 % oversize

```js
part(T, g, G.cyl(T, s * 0.19, s * 0.19, mm(46), 6), steel, { p: [0, -mm(108), 0] });
```

`s` is the plate side. With the default `sideMm: 200` that is a hex of
circumradius 38 mm — **across-flats ≈ 65.8 mm**. The sourced R32 nut is
**46 mm across flats** (§3.2). The nut is **43 % too big**, and it will change
size if the plate changes size while the bar does not — which is backwards: **the
nut belongs to the bar.** Correct ratio is **A/F ≈ 1.3–1.45 × bar OD**.

The nut *length* is right: `mm(46)` against a sourced 45 mm. Keep it, and note
that this accidentally encodes the good rule from §3.7 — **a hollow-bar nut is as
long as it is wide.**

### 9.3 One part too many at the head, and the sphere is on the wrong component

```js
part(T, g, G.box(T, s, mm(20), s), galv, { p: [0, -mm(10), 0] });      // flat plate
part(T, g, G.lathe(T, [ … ], seg, true), galv, { name: 'dome' });       // dome
// spherical seat washer + hex nut
part(T, g, G.lathe(T, [ … ], seg, true), steel, { name: 'seat' });      // seat washer
part(T, g, G.cyl(T, s * 0.19, s * 0.19, mm(46), 6), steel, { … });      // hex nut
```

**Four parts. The sourced head has three.** `ITB-EPD_140-Minova-update-v2.pdf` p.2
Fig. 2 shows **flat plate → domed plate → nut**, with the middle part labelled
*"Domed plate made of cold-formed flat steel"*, and the brochure explains why:
*"The nuts are manufactured with **at least one spherical end** to compensate for
deviations of the borehole angle"* and *"the domed or flat plates feature a
**chamfered bore** to ensure firm seating of the nut"* (Minova pp. 2, 7).

So the corrections are:
- **Delete the `'seat'` washer.** There is no separate spherical washer in an SDA
  head. (A loose hemispherical washer is a solid-bar rock-bolt convention — a
  different product, §2.2/§2.4.)
- **Put the sphere on the nut.** One end of the hex is a spherical cap; the game's
  nut is a plain flat-ended hex.
- **Make the dome a pressed dish, not a turned boss.** "Cold-formed flat steel"
  means a plate stamped into a shallow dish of roughly constant thickness, with a
  chamfered bore — not the solid lathe profile the game builds.

Related: **nothing in the game tilts the head.** The whole reason the spherical
seat exists is that the anchor is not square to the face. Anchors placed on a
surface should sit at up to **±5°** off normal with the nut taking up the
difference (Minova p.7) — that is the detail that says "anchor" rather than
"bolt". `bolter.md` already recorded the ±5° figure; what is new here is that the
*part count and the location of the sphere* are also wrong.

Related: **nothing in the game tilts the head.** The whole reason the spherical
seat exists is that the anchor is not square to the face. Anchors placed on a
surface should sit at up to **±5°** off normal with the nut taking up the
difference — that is the detail that says "anchor" rather than "bolt".

### 9.4 The bar bore is a fixed 0.52 of the major diameter. Real ID:OD runs 0.47 → 0.73.

```js
const ro = mm(ts.majorMm) * 0.5;
const ri = ro * 0.52;
```

Sourced ID:OD (§3.7): R32S **0.47**, R38N 0.50, T51S 0.53, R32N 0.58, T76S 0.58,
R51N 0.59, R32L 0.64, T63N 0.64, R51L 0.65, T76N **0.67**, T111N 0.68,
T111L **0.73**. It generally *rises* with size; the game holds it flat at the
thin end. Consequences at the top of the ladder:

| Size | Game bore | Sourced bore | Error |
|---|---|---|---|
| R32 | 16.3 mm | 15 / 18.5 / 20.6 mm | in range, but only by luck |
| R51 | 26.4 mm | 30.2 / 33.3 mm | **4–7 mm too small** |
| T76 | 39.5 mm | 44 / 51 mm | **4.5–11.5 mm too small** |

Use the table in §3.1. The bore is visible at every cut end and at the bit, so
this is not invisible internal geometry.

Related and correct: the bar body is drawn at `ro * 2 * 0.9`, i.e. a core 0.9 ×
major, with the thread added on top. Against a sourced rope-thread depth of
1/30 of diameter (§3.3) that core is slightly under-sized but the right idea.

### 9.5 The R38 ultimate load is the YIELD figure

```js
ultimateLoadKN: { R25: 200, R32: 280, R38: 400, R51: 800, T76: 1900 }[thread] || 280,
```

Two independent sources (Swedish table; Minova p.8) give **R38N ultimate =
500 kN** and **R38N yield = 400 kN**. The game has published the yield number as
the ultimate. R25 (200), R32 (280), R51 (800) and T76 (1900) are all correct
against both sources.

Secondary point: the map collapses the **L / N / S sub-grades**, which are real
and are the reason the same nominal size exists three times. R32 alone is
**210 / 280 / 360 kN** ultimate at **2.75 / 3.4 / 4.1 kg/m** — three different
products at one diameter. That is a genuine shop-inventory mechanic sitting unused.

### 9.6 Coupler length scales with bar size. Real coupler length barely moves.

```js
const L = mm(ts.majorMm * 5);
const R = mm(ts.majorMm) * 0.5 * 1.36;
```

**The OD ratio is good.** 1.36 × major against a sourced 1.24–1.37 (§3.7) — keep
it, or tighten to 1.3.

**The length rule is wrong at the top of the ladder.** Sourced coupler length is
**140–250 mm for the entire family**; as a multiple of bar OD it falls from 5.0×
(R32) to 2.25× (T111). Against `majorMm * 5`:

| Size | Game length | Sourced length | Error |
|---|---|---|---|
| R32 | 157 mm | **160 mm** | correct |
| R38 | 190 mm | 220 mm | 30 mm short |
| R51 | 254 mm | 140 (L) / 200 (N) mm | 54–114 mm too long |
| T76 | 380 mm | **220 mm** | **73 % too long** |

A T76 coupler in the game is a 380 mm barrel; the real part is a 220 mm sleeve you
hold in one hand. Also check the OD at the top: game T76 coupler OD 103 mm vs
sourced **95 mm**; game R51 69 mm vs sourced **63 mm**.

### 9.7 The cross bit's blades are solid carbide

```js
part(T, g, G.box(T, R * 1.94, mm(30), mm(13)), carb, { … });
```

Two boxes of material `carb` (carbide) crossing, each spanning nearly the full bit
diameter — at the default R32/50 mm bit that is a **48.5 × 30 × 13 mm slab of
carbide**. Real cross bits are **a steel body with carbide plates brazed into the
leading faces** (`_photos.md` macro of a real cross bit crown; §3.5 gives two
dimensioned real inserts at **25 × 15 × 6** and **32.5 × 22 × 9**). Three
independent sources now agree the inserts are **tapered plates with radiused
corners and chamfers** — 7° relief, R8 or R3/R4 corners, 1 mm chamfers, 5° draft —
not prisms and not full-width slabs. The `'button'` style is fine; the `'cross'`
style needs a steel blade with a small plate in it.

### 9.8 The bit over-drill ratio is at the very top of the only available band

```js
const diaMm = opts.diameterMm || Math.round(ts.majorMm * 1.6);
```

**1.6 × the bar's major diameter.** No source in this folder publishes a
bit-Ø-per-bar-Ø figure (§3.6, §8.1), so this cannot be called wrong — but the only
figure available anywhere, the secondary one in research pack 11 (R32 → 45–51 mm),
gives **1.44–1.63**, and 1.6 sits at the top of it. For an R32 bar the game's bit
is 50 mm, which is inside the band. **Flag it in the code as unsourced rather than
as derived**, and do not extend the same 1.6 to the T sizes without a source.

Note also `const L = mm(diaMm * 1.05)` — bit length = 1.05 × bit diameter. The
"about as long as it is wide" proportion matches the p.8 silhouettes qualitatively,
but no dimension confirms it. Same treatment.

### 9.9 Missing parts

The `anchor` method has no model for four components the sourced system has:

- **Centralisers / spacers** (§4.6). `grep -i centralis src/rig/tools.js` finds
  only the overburden guide device. Anchors in the game therefore have no reason
  to sit centred in their grout.
- **The grout swivel / rotary injection adapter** (§4.8) — the part that makes
  simultaneous drilling-and-grouting physically possible.
- **The neck protection tube** (§4.9).
- **The drill-bit adapter** (§4.2) — and this one is a *mechanic*, not just a
  prop: it is exactly the "make the wrong-size bit fit" item that a parts shop
  wants to sell.

### 9.10 Nothing in the game represents grout

The largest single visual gap in the family, and `_photos.md` §3 already says so
independently: *"Grey cement grout spoil flows away from each borehole in a wide
pale tongue across the sand and dries lighter than the ground. This is the single
most site-specific detail in the whole library and the game has nothing like it."*
§6.4 above lists what it looks like on the ground, on the head assembly and on the
machine. An `anchor`-method site without grout tongues is not an anchor site.

### 9.11 Smaller notes

- `THREAD_SPECS.T76.majorMm = 76.0` carries the comment `// NOT SOURCED`. It is
  **now partly sourced**: Minova p.8 gives T76N/T76S **outside diameter 75.4 mm**
  (nominal size 76). Same page also gives T51S **51.9**, T63N **64.9**,
  T111 **111.0**, R25N **24.7**, R32 **31.3**, R38N **38.0**, R51 **50.0** — so
  `T51: 50.80` disagrees with the source by 1.1 mm and `R51: 50.8` by 0.8 mm.
  The **pitch and depth** columns remain NOT SOURCED (§8.11).
- The bar is named `'Drillity SDA Bar R32 x 3000 mm'`. Thread designation in the
  name is allowed (DOMAIN.md §10 — R32 is a size). No change needed; noted so
  nobody "fixes" it.
- `buildBearingPlate` reports `finish: 'Hot-dip galvanised'` unconditionally.
  Sourced finishes are **three**: bright/uncoated, HDG to ASTM A123, and HDG +
  epoxy (§6.1) — with a real durability consequence (temporary ≤ 2 years vs
  permanent 50 years+). A finish choice is a shop-mechanic waiting to be used, and
  bright vs galvanised look completely different on the model.
- The `'clay'` bit style builds three wings at `(i/3) * Math.PI`, i.e. spread over
  180°, not 360°. Three wings at 0°, 60° and 120° leaves one half of the face
  empty. Sourced clay bits (EW, XX on Minova p.8) are symmetric about the axis.
  Worth a look by whoever owns the file.

### 9.12 Two things the game already gets right — do not "fix" them

Recorded so a later pass does not undo good work:

- **`opts.lengthMm || 3000` on `buildAnchorBar` is correct.** The sourced standard
  supply length for an SDA hollow bar is **exactly 3 m**
  (`ITB-EPD_140-Minova…pdf` p.3, Fig. 3). The default is right for the right
  reason. What is *missing* is the consequence: a 3 m module means **a coupler
  every 3 m**, so a 12 m anchor carries three of them at even spacing. Nothing in
  the game places couplers along a bar.
- **`buildRingBitSystem` (ll. 3035–3115, `Casing & Overburden Tools`) has the
  mechanism right**: *"ring bit — on the casing shoe, left in the ground with the
  casing"* and *"pilot bit — retrieved up through the casing"*. That matches
  `RDT CAS catalog` pp. 8–10 and `SSAB…pdf` Table 5.3 exactly. **The §3.8 ladder
  in this document is the dimensional check that tool has been missing** — pilot
  OD < casing OD < ring-bit OD, with a radial annulus of 8–20 mm, and published
  oversize variants. That belongs to `tools-overburden.md`; it is flagged here
  because this document is where the numbers were found.

### 9.13 Priority order, if only some of this gets fixed

1. **§9.1 plate thickness** — one hard-coded constant destroys an eleven-fold
   size ladder. Cheapest fix, biggest visual return.
2. **§9.3 head assembly** — delete one part, move the sphere onto the nut, tilt the
   head. This is what makes an anchor read as an anchor.
3. **§9.2 nut sizing** — drive it from the bar, not the plate.
4. **§9.5 R38 load** — a one-line data error, and it is a *number the player sees*.
5. **§9.6 coupler length** — wrong by 73 % at T76.
6. **§9.4 bore ratio** — visible at every cut end.
7. **§9.10 grout** — the largest visual gap, but scene work rather than tool work.
