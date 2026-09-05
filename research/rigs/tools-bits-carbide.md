# tools-bits-carbide — Rock bits and carbide

**Engineering reference for 3D modelling. GEOMETRY AND MATERIALS ONLY.**
status: in progress

> **NAMING RULE (DOMAIN.md §10).** Everything below cites real manufacturer
> catalogues because that is where the real geometry is. The game must NOT use
> any real manufacturer name or model designation as a product name, and the
> modeller must NOT model a manufacturer badge, logo, laser-etched brand, or
> stamped model code onto a bit face or shank. Model the *shape*; the stamping
> on a real bit crown becomes a generic size/serial ring in-game.
>
> **The exception, and it matters on this family:** the top-hammer thread codes
> (**R25 R28 R32 R38 T38 T45 T51 GT60**), the API rotary connections
> (**2⅜ / 3½ / 4½ / 6⅝ / 7⅝ REG**, IF, FH, NC), the wireline letter sizes
> (AQ BQ NQ HQ PQ) and the **IADC** code are *industry standards, not
> trademarks*. They are sizes. They are safe to show stamped, and a driller
> would find their absence odd. What must never appear is a maker's wordmark,
> a proprietary shank name used as a brand, or a supplier drawing number.

> **METHOD NOTE — the PDFs in this folder are readable.** The Read tool's
> `pages` parameter fails with `pdftoppm is not installed`. **Ignore it.**
> `pymupdf` (1.28.2) and `pdftotext` are installed; `<scratchpad>/pdfpage.py`
> (`info` / `text` / `png`) does the work, and pages rendered at 350–450 dpi are
> how every button count below was obtained. **Nothing in this document is a
> guessed count.** Where a number could not be found it says `NOT SOURCED`.

### Already covered by the existing research packs — do not re-derive
`research/12-oem-rock-tooling.md` is the parent document for this subject and it
is good. It already carries, sourced:
- **§B.2** top-hammer thread families (R/T/H/IB/C), *"the number IS the nominal
  thread diameter in millimetres"*, and thread -> hole-diameter ranges.
- **§B.4** DTH shank families (DHD / QL / SD / Mission / Numa / COP M / TD) and
  **spline count as the visible proof of family — 6, 8, 10, 12, 16.**
- **§B.5** the four independent button axes (shape, position, face profile,
  skirt) — reproduced and extended below because it is pure geometry.
- **§B.7** API REG / IF / FH / NC rotary connections.
- **§B.8** the BETEK carbide grade table (WC:Co, grain, density, HV10).
- **§B.9** the never-interchange list.

`research/16-site-archetypes.md` is about sites, not tooling — nothing here.
`research/rigs/tools-core-dth.md` owns the **hammer** and the **core barrel**;
this document owns the **bit on the end of it** and the **carbide in the bit**.
`research/rigs/tools-overburden.md` owns **ring bits, casing crowns and lost
bits**; they are cited here for their button layouts only.

This file does **not** repeat the fit logic. It adds what pack 12 did not need:
**where the metal actually is**, in millimetres, for a modeller.

---

## 1. Sources read

| File | Pages / where | What it ACTUALLY showed | Useful? |
|---|---|---|---|
| `Downloads\BETEK_Katalog_Tungsten_carbide.pdf` | 33 pp.; `info` on all; **p.14 rendered at 200 dpi**, **pp.20–22 rendered at 350 dpi**; text pp.14–31 | **The primary source for this whole document, and far better than expected.** It is not a marketing brochure — it is a **carbide parts catalogue with dimension tables**. p.14 draws **all six carbide "bottom shapes" A–F** side by side *and* in section, with the two radiused ones called out **R1.5** and **R0.8** and the four dished ones at **140°, 140°, 132.5°, 130°**. pp.15–18 are tricone insert tables; **pp.20–22 are TH- and DTH-bit button tables** giving, per part, **Ø D, overall height H, nose height h1, nose radius R, cone included angle, and bottom shape** — which is exactly the button geometry §3 needed and nothing else in the library has. pp.23–31 are plate and block tables for tunnelling, stone splitting, anchor drilling and wear parts. p.14 also carries a **micrograph of the carbide structure**. | **Yes — primary** |
| `Downloads\SPIBO-HM-10x15x6-R6_drawing.pdf` | 1 p.; text + **rendered at 200 dpi and read** | **The single most precise carbide geometry in the folder, and it paid off.** A full A3 dimensioned drawing of **one carbide tip: 10 wide × 15 tall × 6 thick, R6 nose**, at scale 5:1, with **three separate taper angles (2° flank in front view, 6° flank in top view — the same face, so it is one compound-ground flank — and 7° on the top face)** and **0.8 × 45° chamfers on both faces, along the bottom edge, around the R6 nose and up the nose face**. Material called out as **cemented carbide WC-Co at ρ = 14.5 g/cm³**. **This is the drawing that proves a carbide plate is not a prism.** | **Yes — primary** |
| `Downloads\SPIBO_Carbide_tip_10x15x6_R6_technical_review.pdf` | 5 pp.; pp.1–3 read | The engineering note behind that drawing, and it gives the **derived** numbers the drawing does not: **volume 768.02 mm³, surface area 512.8 mm², mass 11.14 g at 14.5 g/cm³**, and — most useful for a modeller — the **consequences of the tapers stated numerically**: the 10 mm width becomes **9.48 mm at the front face and 8.85 mm at the back face**, and the 15 mm height becomes **14.26 mm at the back face**. It also states the tapers are datumed so the whole tip stays inside its nominal envelope. ⚠ It carries **budgetary prices — the owner's commercial data. Those must not reach the game** (`PLATFORM_TRUTH.md` Part C) and are not reproduced here. | **Yes — primary** |
| `Downloads\Vollbohrkrone ZT0759801.pdf` | 1 p.; text + **rendered at 200 dpi, face view re-cropped at 450 dpi and counted** | **A dimensioned production drawing of a complete full-face crown**, and the proper source for what `_photos.md` only had as a photograph of a screen. Three views (side elevation, face plan, isometric). Gives **overall length 160 mm, face Ø125 mm, thread 101.6 mm three-start conical left-hand**, and **material 42CrMo4 V** for the bit body. The face plan is clean enough to count off: **7 gauge buttons on 7 castellated lobes, 7 face buttons, 3 flushing holes.** ⚠ Carries a company mark, a drawing number and an explicit copyright notice. **Proportions only.** | **Yes — primary** |
| `Downloads\Atpa\ATPA-Bohrkronen.pdf` | 7 pp.; no text layer; **pp.1–4 rendered at 110 dpi and looked at** | A photographic product sheet, image-only. **p.2 is the best photograph of a DTH bit face anywhere in the library** — a bright machined crown, seats bored but **buttons not yet fitted**, shot against black. Counted off it: **7 gauge lobes each with one seat, ~6 face seats, 3 large blow holes**, with milled junk slots running from the holes out through the gauge. Independently confirms the layout counted on the two CAD sets. | **Yes** |
| `Downloads\Hm anschweißfinger.pdf` | 1 p.; text + **rendered at 150 dpi and read** | A small CAD drawing of a **weld-on carbide finger** (German *Anschweißfinger*): **25 long × 14 tall × 8 thick**, with **20° chamfers on both top corners in front view**, a **10° taper on the top face in side view**, and **1 × 1 chamfers at the bottom edge**. A hardfacing element, not a button — worth having because the game has nothing of this shape. | **Yes** |
| `Downloads\carbide_buttons_weights.png` | opened | Four button forms rendered in 3D with **diameter × height and mass** called out: **spherical Ø14 × 20 = 40 g · spherical Ø12 × 17 = 25 g · conical Ø10 × 15 = 12 g · serrated Ø8 × 7 = 4.7 g**. The masses are the useful part — they let a modeller sanity-check a button against the 14.5 g/cm³ density. ⚠ The sibling `carbide_buttons_cost_eur.png` is the same renders with prices; **geometrically a duplicate, and the prices are the owner's business data.** | **Yes** |
| `Downloads\carbide_info.png` | opened | Two carbide **plate** forms as dimensioned silhouettes with volumes and masses: an **"R8 plate" 15 × 25 × 6 mm with an R8 top corner, 1 × 1 chamfer and 7° taper — 2.1 cm³, 30 g**; and a **gable/"roof" plate 32.5 wide × 22 tall × ~9 thick, 5–10° taper, R4/R3/R1 — 4.5 cm³, 65 g**. Density stated as **≈14.5 g/cm³**. Same family as the SPIBO tip at two other sizes. Prices again excluded. | **Yes** |
| `Downloads\Rotary_Drill_Bits_2025_A4_E-version.pdf` | 16 pp.; all extracted; **pp.8, 9, 14 cropped at 400–900 dpi and counted** | **Useful, but dimensionless — and that is the honest headline.** pp.10–15 are full cutting-structure tables: **IADC code, total row count, total insert count, gauge/inner insert split, insert shape and bearing type** for every size from 7⅞″ to 13¾″. p.6 lists the six diameters and the feature package. What it does **not** contain anywhere is a **diameter / length / connection table** — there is no dimension section in the catalogue at all. The renders are high quality and countable: the **nozzle boss on the leg flank**, the **staggered carbide button field in the shirttail**, the **lug wear carbides**, and the **three-race bearing pack** were all counted off them. | **Yes** |
| `Downloads\Mincon-Rotary-Product-Catalog-Condensed-Version.pdf` | p. 2 | Two tables that matter: the **six blasthole diameters in mm and inch**, and the **nozzle option table (min Ø, max Ø, thru bore per size)** — the only nozzle dimensions found anywhere. Also the bearing options and the WOB / rpm envelope. | **Yes** |
| `Downloads\Wittig_Drilling_intro-part_I.pdf` | 116 pp.; bit chapter pp. 63–116; pp. 79, 80, 83, 85, 87, 96, 99, 103 rendered | **A lecture, not a catalogue, and exactly the right kind of source for the things catalogues never print.** p.79 is a **fully labelled sealed-journal leg section** (reservoir, diaphragm, fill hole, ball hole plug, seal, races) — that is where the grease cap goes. p.83 gives the **only numeric cone offset in the folder: "High 5 degree skew"**. p.85 is the soft-versus-hard tricone design table. pp.86–88 explain the **IADC code structure with three worked examples**. p.96 gives the **PDC diamond table thickness (~0.5 mm on a WC cylinder)**. p.99 defines **back rake, side rake and exposure — with diagrams but no numbers**. | **Yes — primary for the things nobody publishes** |
| `Downloads\BL_Overburden_Drilling-Catalog-FINAL_2026-02_2_low-res.pdf` | 153 pp.; pp. 32, 90–91; photographs cropped at 600–900 dpi and counted | **The one place in the library that pairs a bit diameter to a connection size**: 85 / 105 / 125 mm → API 2⅜ REG · 145 → 3½ REG · 160 / 185 / 200 → 4½ REG, identical across four three-wing bit families. The photographs are good enough to count wings, plates, buttons and flushing ports off. **Three-wing rotary bits, not tricones — the table must not be reused for a tricone.** | **Yes** |
| `Downloads\Bits-Catalog.pdf` | 152 pp.; PCD section pp. 102, 109, 113 | **Mostly the wrong subject** — it is overwhelmingly a catalogue of impregnated-diamond *core* bits, which belong to `tools-core-dth.md`. But its PCD section carries the one thing this document could not otherwise source: **"Standard … PDC bits are available with either 8 mm or 13 mm PDC cutters"** (p.109), with p.113 pairing 13 mm to 3⅞″–6¼″ bits. | **Partly — one number** |
| `Downloads\PD_DrillBits_21-01.pdf` | 3 pp.; read | **Not rotary bits at all.** It is a datasheet for **water-powered DTH bits**. Named by the coordinator as a rotary source; it is not one. Recorded plainly. | **No** |
| `Downloads\Mincon-Bluebook-2025-WEB.pdf` | indexed; p. 17 read | Large-diameter piling rock bits, **prose only, no dimensions**. | Marginal |
| `Downloads\bwh-betek-katalog-spezialtiefbau-foundationdrilling-en.pdf` | 61 pp.; `info` on all; **pp.51–53 read and p.52 rendered at 130 dpi** | **Mostly the wrong tool family for this document** — pp.7–48 are round-shank cutter picks, weld-on teeth, scraper blades and HDD tools, which belong to `tools-overburden.md`. **But pp.51–52 are gold for §6**: p.51 names three **BeCoat hardfacing types (FeCr · NiCr + fused tungsten carbide · TC grit)** at a **coating thickness ≤ 6 mm**, and **p.52 is a page of dimensioned sections of stud-welded carbide wear studs** — base Ø16/19/22, carbide Ø12/15/18, a bore up the middle, and **8,4–14 mm of carbide standing proud**, plus domed, conical and grooved variants. That turns "hardfacing" from a texture into geometry. | **Partly — §6 only** |
| `Downloads\bwh-betek-katalog-bergbau-mining-en.pdf` | 57 pp.; `info` on all | Same structure, same conclusion: a **cutter-pick catalogue**, not a rock-bit catalogue. Its TungStuds section duplicates the foundation one. **Read the index, took nothing new.** Recorded so nobody works through 57 pages again. | Marginal |
| `Downloads\bwh-datenblatt-tm-14-17.pdf`, `…-tm-16.pdf`, `…-tm-20.pdf`, `…-tm-22.pdf` | all four `info`-indexed; tm-14-17 and tm-20 text-read | **These are not carbide datasheets and contain no carbide at all.** They are **general-arrangement datasheets for telescopic-leader piling rigs** (MOBILRAM system, TM 14/17 V, TM 16, TM 20, TM 22) — mast heights, leader inclinations, counterweights, carrier engine data. The coordinator's guess that they were "single-part carbide datasheets, likely dimensioned drawings of individual tools" was **wrong**, and I am saying so plainly rather than quietly dropping them. They belong to `piling-leader.md`, not here. | **No — dead end** |
| `research/rigs/_photos.md` | §2 `tools-bits-carbide`, `tools-overburden`, `tools-core-dth`; §4 in full | The photograph catalogue, and the correct first stop. It routed me to every image used in §7 and it supplies §6 almost entirely. Its `tools-overburden` CAD-set entries are the reason I opened the six-view set at all. | **Yes — index** |
| `research/12-oem-rock-tooling.md` | §B.2, §B.4, §B.5, §B.7, §B.8, §B.9 | Threads, shanks, spline counts, the four button axes, API connections, the carbide grade table, the never-interchange list. **Not re-derived.** §3 below *corrects and extends* its button-diameter figures against the primary catalogue. | **Yes — parent** |
| `src/rig/tools.js` — `TH_BUTTONS` (l. 1604), `DTH_BUTTONS` (l. 1610), `buildButtonBit` (1625), `buildDTHBit` (1859), `triconeCone` (2200), `buildTriconeBit`, `buildPDCBit` (2427), `buildDragBit` (2601), `buildCoreBit` (2723), `buildRCBit` (6729) | as cited | The current game geometry, compared in §9. **READ ONLY — never edited.** It turns out to be unusually well researched already, and §9 says so where it is right. | Yes (as the subject) |

_(the tool-catalogue rows — top-hammer, DTH and rotary — are appended below as they are read)_

---

## 2. What these tools ARE

Seven families, and they divide on **how the rock is broken**, not on what they
look like. Get that straight and the silhouettes follow.

### 2a. Top-hammer button bit — percussion delivered down a rod

A **short threaded steel head**, screwed onto the end of a drill rod, with
tungsten-carbide buttons pressed into its face. A hammer at the *top* of the
hole strikes the rod; the stress wave travels the whole string and arrives at
the bit as an impact. The bit indents the rock, the rig rotates it a few
degrees, it indents again. The rotation does not cut — **it only re-aims the
hammer.**

The consequence for a modeller: **the bit is a female part.** It screws *onto*
the rod, so the top of a button bit is an **open threaded bore**, not a pin.
There is no other connection on it. Flushing air or water comes down the rod,
through the bore, out of holes in the face.

### 2b. DTH bit — the same crown, with the hammer behind it

Identical cutting structure, completely different back end. The piston is now
**in the hole, directly behind the bit**, so no thread is needed and none
exists: the bit is retained in the hammer's chuck by **external splines and a
retaining ring dropped into a groove**. `research/12` §B.9 item 8 states the
rule that follows — **a DTH bit has no thread anywhere on it at all.**

Because the hammer strikes the bit's shank directly, the shank is long, hard
and plain: a straight splined cylinder roughly the same length as the head.
That doubles the bit's overall length against a top-hammer bit of the same
diameter, and it is the single most reliable way to tell the two apart.

### 2c. Tricone — rotary crushing, and the only bit with moving parts

Three legs welded into a body; a **journal** forged into the bottom of each leg
at an angle to the bit axis; a **cone** running on bearings on each journal. The
string pushes down and turns; the cones roll on the hole bottom, and because
their axes are offset from a true rolling cone they also **scrape**. The teeth
crush and gouge; nothing about it is percussive.

Two cutting structures on the same carcass:

- **Milled-tooth (MT / steel-tooth)** — the teeth are **machined out of the cone
  itself** and then hardfaced. Tall, widely spaced, chisel-shaped, and they
  look like a gear. For soft rock.
- **TCI (tungsten-carbide insert)** — the cone is smooth and carries **pressed-in
  carbide inserts** in rows. Shorter, far more numerous, and they look like a
  studded roller. For hard rock.

The connection is an **API REG pin pointing up**. A tricone is the only bit in
this document that can be worn out by its *bearings* rather than its cutters.

### 2d. PDC bit — shearing, not crushing or indenting

A one-piece body with **fixed blades** spiralling out from the centre, and along
the leading edge of each blade a row of **polycrystalline-diamond cutters**:
flat discs of synthetic diamond sintered onto a carbide substrate. They do not
hammer and they do not crush — they **shear** the rock like a lathe tool. There
are no bearings, no cones, nothing that rotates relative to anything else.

Visually this is the odd one out and it must not be modelled as a button bit
with flat buttons. The cutters lie **on their edges along the blade**, showing a
circle to the rock, and they are **black**. Between the blades are deep
**junk slots** — the whole point of a PDC's silhouette is the alternation of
solid blade and open slot.

### 2e. Drag / wing bit — the cheap soft-ground tool

A steel body with two, three or four **flat wings** swept back from the axis,
with **brazed carbide plates** — not buttons — along the leading edge. It
scrapes. It is useless in rock and excellent in clay, marl and weathered
ground, and it is by a long way the cheapest thing in the shop. The **cross bit
and chisel bit** are the small percussive members of the same "carbide plate,
not button" family.

### 2f. RC bit — a DTH bit with the sample brought back up the middle

Reverse circulation: air goes **down the annulus** between an outer and inner
tube and returns **up the centre**, carrying the cuttings inside the string
where they cannot contaminate. The bit therefore has a **central sample port**
straight up its axis, and the flushing that a normal DTH bit does through face
holes happens instead around the outside of the face. Externally it is a DTH
bit; the give-away is the **hole up the middle of the face**.

### 2g. Core bit — cutting a ring, leaving the middle

Owned by `tools-core-dth.md` and not re-derived here. Named for completeness:
it is an **annulus**, its cutting structure is impregnated diamond in a carbide
matrix rather than carbide buttons, and the hole in the middle is the product.

---


## 3. Proportions

### 3a. THE BUTTON ITSELF — the primary geometry of this document

`research/12` §B.5 gives button diameters as **10 / 12 / 16 / 19 mm**. Against
the primary catalogue that is **close but wrong in a way that shows**: real
carbide buttons are **not made in round millimetres**. The catalogue sizes are,
verbatim (`BETEK_Katalog_Tungsten_carbide.pdf` pp. 20–22):

> **7,4 · 8,2 · 8,3 · 9,0 · 9,3 · 9,4 · 10,3 · 10,6 · 11,3 · 11,4 · 12,3 ·
> 12,4 · 13,0 · 13,3 · 13,4 · 14,3 · 14,4 · 14,6 · 16,3 · 16,4 · 17,0 · 17,9 ·
> 18,4 · 19,4 · 20,4 mm**

A modeller who models a Ø10,0 button is modelling a size nobody makes. Model
**Ø10,3**, **Ø12,4**, **Ø14,3**, **Ø16,3**, **Ø19,4**. At render scale the
number does not matter; **the fact that they cluster just above the round
figure does**, because it is the fingerprint of a part pressed into a bore
machined to the round size.

#### Every button is a cylinder plus a nose, and the catalogue dimensions both

The catalogue's three symbols, read off the dimensioned figures rendered from
pp. 20–22 at 350 dpi:

- **Ø D** — the cylinder diameter. This is the whole button's diameter; the
  nose never overhangs it.
- **H** — overall height, tip of the nose to the bottom face.
- **h1** — **the height of the NOSE alone**, from the tip down to where the
  parallel cylinder begins. `H − h1` is the length of bare cylinder, and **that
  is the part that disappears into the steel.**

**Spherical / hemispherical** (`ibid.` p. 20, 41 rows; a representative span):

| Ø D | H | h1 | nose R | H/D | h1/D | R/D |
|---|---|---|---|---|---|---|
| 7,4 | 10,5 | 2,6 | 3,8 | 1,42 | 0,35 | 0,51 |
| 10,3 | 13,5 | 4,4 | 5,1 | 1,31 | 0,43 | 0,50 |
| 10,3 | 16,0 | 4,4 | 5,1 | 1,55 | 0,43 | 0,50 |
| 12,4 | 18,0 | 4,7 | 6,3 | 1,45 | 0,38 | 0,51 |
| 14,3 | 22,0 | 4,9 | 7,5 | 1,54 | 0,34 | 0,52 |
| 16,3 | 21,0 | 6,6 | 8,2 | 1,29 | 0,40 | 0,50 |
| 19,4 | 25,4 | 7,2 | 10,0 | 1,31 | 0,37 | 0,52 |
| 20,4 | 30,2 | 8,8 | 10,2 | 1,48 | 0,43 | 0,50 |

**The three ratios, and they hold across the whole 7–20 mm range: nose radius
R ≈ 0,50 × D · nose height h1 ≈ 0,34–0,43 × D · overall H ≈ 1,3–1,55 × D.**

Note what that means geometrically. **R is essentially D/2, but h1 is smaller
than R** — so the dome is *not* a clean hemisphere sitting on a cylinder. It is
a sphere of about D/2 **blended into** the cylinder through a short transition.
Modelling a perfect hemisphere on a perfect cylinder gives a button slightly
too tall with too hard a shoulder line.

**Parabolic / semi-ballistic** (`ibid.` p. 21, 31 rows):

| Ø D | H | h1 | H/D | h1/D |
|---|---|---|---|---|
| 7,4 | 11,5 | 3,4 | 1,55 | 0,46 |
| 10,3 | 16,0 | 5,4 | 1,55 | 0,52 |
| 12,4 | 21,0 | 6,6 | 1,69 | 0,53 |
| 14,3 | 25,0 | 6,5 | 1,75 | 0,45 |
| 16,3 | 23,0 | 8,1 | 1,41 | 0,50 |

**Nose height h1 ≈ 0,50 × D — half as tall again as a spherical nose — and
H ≈ 1,4–1,75 × D.** The profile is an ogive: neither cone nor dome.

**Conical / ballistic** (`ibid.` p. 22, 12 rows — the table that gives the
*angle*):

| Ø D | H | h1 | tip R | included angle | H/D | h1/D |
|---|---|---|---|---|---|---|
| 7,4 | 10,5 | 3,7 | 2,5 | 60° | 1,42 | 0,50 |
| 8,2 | 11,4 | 4,2 | 3,0 | 57° | 1,39 | 0,51 |
| 9,0 | 13,0 | 4,7 | 3,0 | 60,8° | 1,44 | 0,52 |
| 10,3 | 17,0 | 4,7 | 3,15 | 75° | 1,65 | 0,46 |
| 11,3 | 18,4 | 6,4 | 1,5 | 75° | 1,63 | 0,57 |
| 12,4 | 19,5 | 6,8 | 3,0 | 67° | 1,57 | 0,55 |
| 14,3 | 23,7 | 6,6 | 4,2 | 75° | 1,66 | 0,46 |

**Included angle 57–75°; tip radius 0,13–0,35 × D.** A ballistic button is a
**blunt cone with a generously rounded tip**, not a spike. Even the sharpest
row (R1,5 on a Ø11,3) is still 0,13 D.

**Serrated** — from `carbide_buttons_weights.png`: **Ø8 × 7 mm**, i.e.
**H ≈ 0,88 × D — shorter than it is wide** — with vertical grooves cut around
the dome. The only button form that reads as squat.

**Tricone inserts are a different animal** (`ibid.` pp. 15–18). The
hemispherical tricone insert can be **far flatter**: Ø10,3 × H10,0 with
**h1 1,6 and R 9,0** — a nose radius of **0,87 D** on a nose only **0,16 D**
tall. Beside it the catalogue offers a **roof-top shape** at an **included angle
of 48–65°** (Ø8,3 at 62°, Ø17,9 at 48°) and a **tricone shape** whose h1/D runs
**0,70–0,76** — far more proud than anything on a percussion bit.
**So: tricone inserts run either much blunter or much more proud than DTH
buttons, and the big ones get blunter, not sharper.** A real visual
distinction, and free to model.

#### Cross-check on mass

`carbide_buttons_weights.png` gives **Ø14 × 20 = 40 g**, **Ø12 × 17 = 25 g**,
**Ø10 × 15 conical = 12 g**, **Ø8 × 7 serrated = 4,7 g**, at the WC-Co density
of **≈14,5 g/cm³** used throughout (`SPIBO … technical_review.pdf` p. 1;
`carbide_info.png`). A Ø14 × 20 cylinder-plus-dome comes to ≈2,7 cm³ × 14,5 ≈
40 g — **the sheet is internally consistent**, so the shapes it renders can be
trusted as proportion references.

#### The bottom of the button — six shapes, and they are drawn

`BETEK_Katalog_Tungsten_carbide.pdf` **p. 14** draws all six **bottom shapes**
in elevation *and* in section. Nobody models this:

| Bottom shape | What it is |
|---|---|
| **A** | flat bottom, edge broken **R1,5** |
| **B** | flat bottom, edge broken **R0,8** |
| **C** | **dished** — a shallow cone recessed into the base, **140° included** |
| **D** | dished, **140°** |
| **E** | dished, **132,5°** |
| **F** | dished, **130°** |

**Every row in the TH/DTH tables is coded A–F**, and the dished ones outnumber
the flat ones. The modelling consequence is small but real: **the bottom of a
button is never a plain flat disc and never a square edge.** It matters only
when a button has been knocked out and the empty socket is on show — which, per
§6, is exactly what a heavily worn bit looks like.

**NOT SOURCED: the seat bore diameter and the interference fit.** No local
source states how much smaller the hole in the steel is than the button, nor
how deep it is pressed. What the catalogue *does* show is that buttons are made
at 7,4 / 10,3 / 12,4 / 14,3 / 16,3 / 19,4 — sitting just above round numbers —
and that is hard to read as anything but a press fit into a round-number bore.
**I am not turning that into a number.**

#### Button projection — how far it stands out of the steel

**Not sourced from anything in this folder** — but it turns out the game
already has the answer, from documents that are not local. `src/rig/tools.js`
(l. 848–854) quotes a carbide sharpening guide twice, as a floor and a ceiling:

> *"at least **1/2 of the carbide diameter** should protrude"* and *"carbides
> should not protrude more than **3/4 of the carbide diameter** — removing
> excessive steel body will result in carbide failure"*, with a second maker
> putting the same rule in millimetres (grind so carbide stands **no more than
> 9 mm proud** in abrasive ground).

**So protrusion is 0,50–0,75 × D.** ⚠ **I could not verify those two documents
— neither is in `Downloads\`.** They are cited here at second hand, from the
game's own source comments, and flagged as such.

They are nonetheless consistent with what the primary geometry implies, which
is worth recording as an independent check. `H − h1` — the bare cylinder — runs
**0,8–1,1 × D** on spherical buttons, and `_photos.md` §2 records buttons
standing proud **as hemispheres, not as capsules**. Working from those alone I
get nose (h1 ≈ 0,34–0,43 D) plus a little cylinder, i.e. **≈0,45–0,6 × D** —
the bottom half of the quoted band. **Two routes, one answer. Use 0,50–0,75 D.**

**Still genuinely NOT SOURCED: the seat depth and the interference.** How deep
the bore is and how much smaller than the button — neither is anywhere.

### 3b. THE CARBIDE PLATE — a chisel / cross / drag insert is not a prism

The best drawing in the folder, and the reason to open
`SPIBO-HM-10x15x6-R6_drawing.pdf` early. One tip, fully dimensioned at 5:1:

| Feature | Value |
|---|---|
| Envelope (maximum material) | **10 wide × 15 tall × 6 thick** |
| Nose | **R6** on one corner |
| Flank taper, front view | **2°** |
| Flank taper, top view | **6°** — *the same face*, so it is **one compound-ground flank** |
| Top face | **7°** |
| Edge chamfer | **0,8 × 45°**, on **both** faces — along the bottom edge, around the R6 nose, and up the nose face |
| Height tolerance | 15,00 **+0,30 / −0** |
| Thickness tolerance | 6,00 **± 0,10** |
| Volume / mass | **768,02 mm³ / 11,14 g** at 14,5 g/cm³ |
| Surface area | **512,8 mm²** |

And the derived figures from the review (p. 2), which are what a modeller
actually needs because they say what the tapers *do*:

> the width across the 15 mm end is **9,48 mm at the front face and 8,85 mm at
> the back face**, and the height at the back face is **14,26 mm**

**A carbide plate therefore loses about 1,2 mm of width and 0,75 mm of height
across only 6 mm of thickness.** It is a slab that visibly narrows towards its
back face. Model it as a lofted solid, not an extruded rectangle, and **put the
0,8 mm chamfers on — they are what catch the light, and they are the reason a
carbide tip reads as ground rather than cast.**

Two more plates at other sizes, same family (`carbide_info.png`):

- **"R8 plate" — 15 × 25 × 6 mm**, R8 top corner, 1 × 1 chamfer, **7° taper**.
  2,1 cm³, **30 g**.
- **Gable / roof plate — 32,5 wide × 22 tall × ~9 thick**, roof form,
  **5–10° taper**, corner radii **R4 / R3 / R1**. 4,5 cm³, **65 g**.

And the catalogue's own plate table (`BETEK … Tungsten_carbide.pdf` p. 27,
*"TC for integral drill steel and anchor drilling"* — i.e. **exactly the insert
in a chisel or cross bit**):

| L (mm) | B (mm) | H (mm) | angle |
|---|---|---|---|
| 34,5 | 9,9 | 17,9 | 6° |
| 36,5 | 9,9 | 17,0 | 6° |
| 38,5 | 9,9 | 17,9 | 6° |
| 39,5 | 9,9 | 17,9 | 6° |
| 40,5 | 9,9 | 17,9 | 6° |

**L is the long axis, lying across the bit face; B is the thickness; H is the
height.** So a chisel-bit plate for a small bit is roughly **35–40 long × 10
thick × 18 tall, with a 6° taper** — and note **B = 9,9**, the same
just-under-round trick as the buttons, for the same seat reason.

The same page gives heavier plates for stone splitting: **39 × 11,9 × 20 and
48 × 11,9 × 20 at 90° with R74 / R84**, and **58 × 13,9 × 25 at 90° with R120**.
**The radius on a plate is enormous relative to the plate** — R74 on a 39 mm
plate is an almost-straight edge with the corners eased, not a curve you would
notice unless you looked for it.

### 3c. THE WELD-ON CARBIDE FINGER

`Hm anschweißfinger.pdf`, rendered at 150 dpi and read. A carbide block that is
**welded on**, not pressed into a bore or brazed into a pocket:

- **25 long × 14 tall × 8 thick**
- **20°** chamfers on **both** top corners in front view — a long flat top with
  two sloped ends, a shallow gable
- **10°** taper on the top face in side view
- **1 × 1** chamfers along the bottom edges

Proportion worth remembering: **L : H : B = 25 : 14 : 8 ≈ 3 : 1,75 : 1.** It is
a brick, not a tooth, and it goes on in rows as hardfacing.

### 3d. THE BIT HEAD — one fully dimensioned crown

`Vollbohrkrone ZT0759801.pdf` is the only complete, dimensioned bit head in the
folder. Everything below is read straight off it:

| Dimension | Value |
|---|---|
| Overall length | **160 mm** |
| Face diameter | **Ø125 mm** |
| Thread | **101,6 mm, three-start, conical, left-hand** |
| Body material | **42CrMo4 V** (quenched and tempered alloy steel) |

From which:

- **Length / diameter = 160 / 125 = 1,28.** A crown is a stubby thing, only
  slightly longer than it is wide.
- **Thread Ø / face Ø = 101,6 / 125 = 0,81.** The threaded shank is about
  four-fifths the diameter of the head, so the head overhangs it as a distinct
  collar all the way round.
- Measured off the rendered side elevation (**a proportion, not a dimension**):
  **castellated crown ≈ 40 % of the length**, **threaded section ≈ 50 %**, and a
  **short plain band at the end ≈ 10 %**. That is close to the independent
  reading `_photos.md` took off the CAD elevation of a casing crown (30/55/15),
  and the two together are good enough to model from.

**Counted off the face plan re-rendered at 450 dpi — not estimated:**

- **7 gauge buttons**, one on each of **7 castellated lobes**, evenly spaced at
  360/7 ≈ 51,4°, with a **notch, not a lobe, at the 12 o'clock position**
- **7 face buttons** on the flat inner face in a loose two-ring arrangement,
  **indexed off the gauge row** so no two buttons track the same circle in the
  rock
- **3 flushing holes** at 120°, each opening into a **milled junk slot** that
  runs out across the face and through the gap between two gauge lobes

**14 buttons on a Ø125 head.** That is the one hard button count in this
document taken from a dimensioned production drawing.

### 3e. BUTTON LAYOUT — counted three times, on three independent objects

Three separate images of mid-size bit faces in this library, all counted at
high magnification, all agreeing:

| Object | Source | Gauge lobes | Gauge buttons | Face buttons | Flushing holes |
|---|---|---|---|---|---|
| Ø125 full-face crown, production drawing | `Vollbohrkrone ZT0759801.pdf`, face plan @450 dpi | **7** | **7** | **7** | **3** |
| DTH / pilot bit, CAD face plan | `WhatsApp Image 2026-08-06 at 15.14.23 (2).jpeg`, upscaled ×3 | **7** | **7** | **6** | **3**, each with a milled slot |
| DTH bit, photograph, seats bored but empty | `Atpa\ATPA-Bohrkronen.pdf` p. 2 @110 dpi | **7** | **7** | **~6** | **3** |

**That is the layout rule for a bit in the 100–130 mm class, and it is now
evidence rather than assumption:**

> **Seven gauge lobes at ~51°, one gauge button on each. Six or seven face
> buttons on the inner face, rotated off the gauge row. Three flushing holes at
> 120°, each sitting in the floor of a junk slot that runs outward and exits
> between two lobes.**

Two riders a modeller must respect:

1. **The face buttons are indexed, not aligned.** On all three objects the
   inner buttons sit at angles that avoid the gauge buttons' radii. A bit whose
   buttons line up in neat radial spokes is wrong, and it reads wrong even in a
   thumbnail because it looks like a wheel.
2. **The junk slot is cut *through* the gauge, not just across the face.** On
   all three, the slot starts at a blow hole, crosses the face, and is milled
   right through the gauge band so cuttings can leave. That notch in the
   silhouette of the gauge is the thing that makes a bit face look machined.

`_photos.md` reads the same CAD face plan as *"six gauge lobes, about nineteen
button seats"*. **I count seven lobes and fourteen seats on the crown drawing
and seven lobes on all three.** Both readings are honest; mine is at higher
magnification and on three objects, so §3e is the one to model from. Recorded
so the discrepancy is visible rather than silently resolved.

### 3h. TRICONE

**Diameters offered** (`Mincon-Rotary-Product-Catalog-Condensed-Version.pdf`
p. 2; the same six at `Rotary_Drill_Bits_2025_A4_E-version.pdf` p. 6):

| 7⅞″ | 9″ | 9⅞″ | 10⅝″ | 12¼″ | 13¾″ |
|---|---|---|---|---|---|
| **200 mm** | **229 mm** | **250 mm** | **270 mm** | **311 mm** | **350 mm** |

**Nozzles — the best hard number set found on this family**
(`Mincon-Rotary-Product-Catalog-Condensed-Version.pdf` p. 2, *"Nozzle Options"*):

| Bit | 7⅞″ | 9″ | 9⅞″ | 10⅝″ | 12¼″ | 13¾″ |
|---|---|---|---|---|---|---|
| Min Ø | 3/8″ | 3/8″ | 3/8″ | 3/8″ | 1/2″ | 9/16″ |
| Max Ø | 7/8″ | 7/8″ | 1″ | 1″ | 1⅛″ | 1¼″ |
| Thru bore | 1″ | 1″ | 1¼″ | 1⅛″ | 1⅜″ | 1⅜″ |

In 32nds, which is how the trade speaks: **min 12/32–18/32, max 28/32–40/32.**
(The 10⅝″ thru-bore is smaller than the 9⅞″. That is what the page says.)

**Nozzle count and position — and the game has this in the wrong place.**
Counted off the renders at `Rotary_Drill_Bits_2025_A4_E-version.pdf` pp. 9 and
14 at 900 dpi: on an **air blasthole tricone** the nozzle is a **raised
cylindrical boss with a counterbored round bore on the OUTER FLANK OF EACH
LEG**, above the shirttail and behind the cone, jetting down the outside past
the cone. **One per leg, so three — but on the legs, not in the crotch.**
`Wittig_Drilling_intro-part_I.pdf` p. 80 gives the other convention for mud
drilling: *"In roller cone tri-cone bits most commonly there are either: 3
nozzles or 1 central nozzle."* **Both are legitimate; which one you model
should follow the drilling method.**

**Cutting structure — rows and insert counts, verbatim**
(`Rotary_Drill_Bits_2025_A4_E-version.pdf` pp. 10–15; TCI):

| Bit | Total rows | Total inserts | Gauge / inner split |
|---|---|---|---|
| 7⅞″ | 11–12 | 106–141 | 44 gauge / 62 inner → 53 / 88 |
| 9″ | 12–13 | 121–170 | 58 gauge / 112 inner at the top of the range |
| 9⅞″ | 12–13 | 145–165 | — |
| 10⅝″ | 12–13 | 135–169 | — |
| 12¼″ | 12–16 | 141–**260** | 72 gauge / 25 + 163 inner |
| 13¾″ | 13–15 | 181–215 | — |

**Read that correctly: rows and insert counts are for the WHOLE BIT, all three
cones.** Gauge + inner sums exactly to the total on every row checked. So
**12 rows ≈ 4 rows per cone**, and **gauge inserts per cone = gauge ÷ 3** (24
per cone on the 260-insert 12¼″). A mid-size tricone therefore carries
**roughly 35–50 inserts per cone in 4 rows** — which is a very different
density from a percussion bit's 13 buttons.

**Insert shape legend, printed on every one of those pages:**
`Conical = CO · Offset conical wedge = OW · Spherical = SP · Semi-spherical =
SS · Wedge = WE · Wedgecrest = WC · Flat-top conical = FT · Ogive = OG`.
Gauge rows use SS / WE / SP; inner rows use CO / OG.

**Cone offset (skew).** `Wittig_Drilling_intro-part_I.pdf` p. 83: *"Rotational
axes of the rollers do not intersect in the vertical axis of the borehole …
Large offset in soft formations · No offset in hard formations"*, with the
figure captioned **"High 5 degree skew"**. That is **the only numeric offset
value anywhere in the folder**. So: **soft-formation bits up to ~5° skew,
hard-formation bits ~0°.**

The same lecture's soft-versus-hard design table (p. 85) is worth having whole,
because it says what changes when a tricone is designed for hard rock:

| | Soft formation | Hard formation |
|---|---|---|
| Teeth | long | short |
| Bearings | small | large |
| Cone shells | thin | heavy |
| Journals | light | heavy |
| Offset | large | none or very little |
| WOB | low | high |
| Rotary speed | high | low |

**The bit covers about 70 % of the hole bottom**, inner rows **intergear** into
one another, and **the outer gauge row wears fastest** (`ibid.` p. 82).

**Bearing and lubrication — fully labelled section** (`ibid.` p. 79). Parts, in
position: leg · **pressure-equalizing ports on the top/outer face of the leg** ·
pressure-equalizing diaphragm · lubricant · **lubrication fill hole** ·
lubrication passageway running diagonally down the leg into the journal ·
circumferential lubricant reservoir · **ball hole plug on the leg's outer face
at ball-race level** · bearing seal · journal hardmetal inlay · cone alloy inlay
· ball bearings · thrust plug · leg out-thrust hardmetal inlay.
**That answers where the grease cap goes: the reservoir and diaphragm live in
the top/back of the leg above the journal, and the fill hole and equalizing
ports open on the leg's outer top face.** Two small circular features on each
leg flank, and they are the detail that says "sealed bearing".

Bearing types offered: **air bearing** or **sealed roller**
(`Mincon-Rotary … Condensed` p. 2); every model in the 2025 blasthole catalogue
is **air cooled**. Counted off the cutaway at
`Rotary_Drill_Bits_2025_A4_E-version.pdf` p. 8 at 400 dpi: **outer cylindrical
roller race → ball retaining race → inner smaller roller race**, with an air
passage and a ribbed water/debris separator plug down the leg.

**Shirttail — and this is a genuine miss in most models.** Shirttail protection
is **not just a weld bead**. Counted at 800 dpi off `ibid.` p. 14: a **dense
staggered field of round flat-top carbide buttons set flush in the shirttail
face** — two clearly resolvable staggered rows of 12–13 buttons around the
shirttail arc, and the deeper cutaway on p. 8 shows five or more staggered
rows. Model it as a staggered grid of flush or barely-proud discs.
The catalogue also names **lug wear carbides** (p. 6) — cylindrical carbides
set into the leg's outer face above the shirttail — confirmed visually in
section at 500 dpi from p. 9. And **double back row carbides from 9⅞″ upward**
(single back row below that), stated per model on pp. 10–15.

**IADC code — what is legitimately stamped.**
`Wittig_Drilling_intro-part_I.pdf` pp. 86–88: the IADC Roller Bit
Classification System, in use since 1972, revised at the 1992 IADC/SPE Drilling
Conference. **Four characters: digits 1–3 numeric, position 4 a letter.**
Worked examples, verbatim:

- **`135M`** — soft formation, **milled tooth**, roller bearings with gauge
  protection, motor application
- **`447X`** — soft formation **insert** bit, friction bearings with gauge
  protection, **X = chisel inserts**
- **`637Y`** — medium-hard insert bit, friction bearing with gauge protection,
  **Y = conical inserts**

The blasthole catalogue prints only the **3-digit** form (432, 512, 522, 542,
612, 622, 632, 642, 712, 722, 742, 832), with `2` in the third position
throughout. **A 3-digit or 4-character IADC code is a standard, not a brand,
and is safe to model as a stamp.** Model names like "XP+43" are **not** IADC
and must not be modelled.

**What is actually stamped — PARTIALLY FOUND.** A milled-tooth bit photograph
(`ibid.` p. 87) cropped at 1200 dpi shows **raised/engraved alphanumerics on
the smooth annular back-face land of each cone shell**, between the gauge row
and the cone heel — cone part numbers. Illegible at source resolution, so
nothing is transcribed. **No source states what is stamped on the shirttail or
shank.** Treat generic cone-back-face alphanumerics as safe; do not invent a
shirttail stamp.

### 3i. PDC

**Cutter diameter — FOUND, and it is smaller than most people assume.**
`Bits-Catalog.pdf` p. 109, verbatim:

> *"Standard Longyear® PDC bits are available with either **8 mm or 13 mm** PDC
> cutters."*

p. 113 pairs cutter size to bit OD: **13 mm on 3⅞″–6¼″ bits** (3.875, 5.50,
5.625, 5.75, 6.125, 6.25″), **8 mm on a 5.469″ bit**. **16 mm and 19 mm
cutters do not appear anywhere in this folder** — see §8.

**The diamond table is thin.** `Wittig_Drilling_intro-part_I.pdf` p. 96:

> *"Cutting elements made of approx. **0.5 mm** tungsten carbide matrix with
> polycrystalline and synthetic diamonds · Cutting elements are placed on
> **tungsten carbide cylinders** and installed directly onto drill bit or
> placed on a **steel bolt**."*

So a PDC cutter is a **tungsten-carbide cylinder with a ~0.5 mm diamond skin on
one end face**. Two mounting conventions: brazed straight into a pocket in the
blade, or on a **steel stud** pressed into the blade. The black disc a modeller
sees is the *diamond face*; the cylinder behind it is carbide grey.

**Back rake, side rake and exposure — defined but never numbered.**
`ibid.` p. 99 carries three labelled diagrams with captions: side rake gives
*"lateral discharge of cuttings"*; back rake is *"standard cutter angle of
attack; for soft formations smaller angles"* and is **explicitly negative by
convention**; exposure is *"space between drill bit and drill hole; no damage
to the bit body, no accumulation before cutting element"*. **No numeric degrees
appear on the page.** See §8.

**Hydraulics and junk slots.** `ibid.` p. 103: *"Channels (grooves) in the drill
bit face allow for drilling fluid to rinse over the entire bit surface · **side
grooves (junk slot)** allow for drilling fluid to flow out to the annulus"*,
with a mud pressure loss over the bit face of **0.6–1.2 MPa (6–12 bar)**.
Junk slots are named and explained; **they are never dimensioned.**

**Operating envelope, useful only as a scale sanity check.** PDC costs
**5–15× a tricone** and runs **60–80 rpm** at low weight-on-bit (`ibid.` p. 100);
a roller cone runs **under 50 rpm** at roughly **2 t per inch of diameter**
(`ibid.` p. 74). Blasthole tricones: **1,000–8,000 lb/inch and 50–140 rpm**
(`Mincon-Rotary … Condensed` p. 2).

### 3j. DRAG AND WING BITS — the strongest connection table found

**Diameter → API pin connection**, identical across four bit families on
`BL_Overburden_Drilling-Catalog-FINAL_2026-02_2_low-res.pdf` pp. 90–91:

| Outer Ø | API thread |
|---|---|
| **85 mm** | **API 2⅜ REG** |
| **105 mm** | **API 2⅜ REG** |
| **125 mm** | **API 2⅜ REG** |
| **145 mm** | **API 3½ REG** |
| **160 mm** | **API 4½ REG** |
| **185 mm** | **API 4½ REG** |
| **200 mm** | **API 4½ REG** (ballistic family only) |

*"Note: Larger drill diameters on request."* **This is the one place in the
whole library where a bit diameter is paired to a connection size.** It is for
three-wing rotary bits, **not** for tricones — do not silently reuse it for a
12¼″ tricone.

**Wing count and cutting elements — counted off the photographs at 600–900 dpi**
(`ibid.` p. 90):

- **GDU type** — **3 straight wings** (not spiralled), cutting elements are
  **large flat rectangular carbide PLATES** brazed into the leading edge and
  standing **clearly proud of the wing top face**. **3 junk slots.** Behind each
  wing a short cylindrical **gauge pad carrying one round carbide button on the
  OD**. One round flushing hole on the face.
- **Three-wing, scraping buttons** — **3 straight wings**, cutting elements are
  **round scraping BUTTONS, not plates**: **≈6 per wing, ≈18 visible**, in a
  staggered pattern with an outer/gauge row of about 3 per wing (some hidden by
  perspective, so 6 per wing is a floor, not a ceiling).
  **3 elongated OVAL flushing ports, one per wing**, at mid-radius on the
  trailing face of each wing.

Design intent, verbatim (`ibid.` p. 32): *"The three-wing type bits are
available with both ballistic and scraping button carbide styles … the carbide
tipped cutting wings provide efficient penetration when rotary drilling"* and
*"three-wing bits provide highly effective flushing."*

**The two-wing fishtail** is the other member of the family
(`Wittig_Drilling_intro-part_I.pdf` pp. 70–72): *"cutting elements are an
integral part of the bit … no moving parts"*, *"usually designed for use in
soft, unconsolidated, loose formations such as small gravel, compacted sands or
sediments."*

---

## 4. Component inventory

Every part, and **why it matters visually**. A part that cannot be seen is not
listed.

### 4a. Top-hammer button bit — parts, face to thread

| # | Part | Why it matters visually |
|---|---|---|
| 1 | **Gauge buttons** | The outermost ring, set on the corner between face and skirt and **tilted outward**. They are the largest carbide on the bit and the only ones that cut the hole wall. In silhouette they are what makes the bit's widest point *carbide*, not steel. |
| 2 | **Face / front buttons** | Smaller, on the flat or dished inner face, tilted only slightly. Their job is to break the middle. Visually they are the texture of the face. |
| 3 | **The face profile itself** | Flat, drop-centre, convex or concave. It decides whether the face reads as a disc, a dish or a dome. See §5. |
| 4 | **Blow / flushing holes** | Bored through the face into the bore. Two to four. **They open into the floor of a waterway, never onto a flat land** — a hole discharging onto a land has nowhere to send the chips. Dark circles on a bright face; strong small-scale contrast. |
| 5 | **Waterways across the face** | Milled channels from the blow holes outward. They cut *through* the gauge band. This is the notch that makes a bit face look machined rather than cast. |
| 6 | **Gauge band / periphery** | The short parallel band at full diameter. It is what rubs the hole wall, so it is where the bright polished ring appears (§6). |
| 7 | **Skirt flutes** | Continuations of the waterways up the outside of the body. Deep, long, and the reason a bit is a lobed cylinder rather than a plain one. |
| 8 | **Castellated lobes** | The steel between the flutes, carrying the gauge buttons. **Seven on the mid-size bits counted here** (§3e). |
| 9 | **Wrench flats** | Two flats up near the back, where the crew breaks the bit off the rod. Small, but they stop the body being a perfect cylinder and they catch light differently from the round parts. |
| 10 | **Female rope thread up the bore** | The connection. Because it is internal it is **invisible from outside except as an open hole at the top** — which is itself the family's identifying feature. |
| 11 | **Size / serial marking** | On a real bit, stamped or laser-etched on the flank. In-game: **a generic size/serial ring, never a maker's mark** (DOMAIN.md §10). `_photos.md` records a real workshop alternative that is completely brand-free and looks right — **the size hand-written in black marker straight onto the bright machined steel**. |

### 4b. DTH bit — what changes

Everything above the gauge band is different:

| # | Part | Why it matters visually |
|---|---|---|
| 1 | **Splined shank** | A long plain cylinder with **straight external splines**. It is roughly as long as the head, and it doubles the bit's overall length. **Spline count is the visible proof of shank family — 6, 8, 10, 12, 16** (`research/12` §B.4). |
| 2 | **Retaining-ring groove** | A single square groove turned around the shank near its top. The split ring that drops into it is the only loose part of the assembly. |
| 3 | **Drive collar / shoulder** | The step where the shank meets the head. It takes the blow, so it is the hardest-worked flat surface on the bit. |
| 4 | **NO THREAD ANYWHERE** | `research/12` §B.9 item 8. If there is a thread on it, it is not a DTH bit. |
| 5 | **Foot valve seat** | Inside the top of the shank. Invisible externally; listed so nobody models a plug there. |

### 4c. Tricone — parts, top to bottom

| # | Part | Why it matters visually |
|---|---|---|
| 1 | **API REG pin** | Points **up**. A tapered male thread with a shoulder. The only bit family in this document whose connection points up and is male. |
| 2 | **Bit body / crotch** | The short barrel the three legs are welded into. The welds are visible and are usually left as a rough bead. |
| 3 | **Three legs** | Each sweeps down and outward. Their outer faces are the bit's full diameter. |
| 4 | **Shirttail** | The bottom outer corner of each leg, right beside the cone. It rubs the hole wall and it is the part most often protected with hardfacing or carbide inserts — so it reads as an **encrusted patch on an otherwise smooth leg**. |
| 5 | **Journal** | Forged into the bottom of each leg, angled to the bit axis. Invisible when the cone is on, but it fixes the cone's attitude and therefore the whole silhouette. |
| 6 | **Three cones** | Rotate. Their axes are **offset** from true rolling, which is what makes them scrape as well as crush. |
| 7 | **Cutting structure** | **Milled teeth** cut from the cone and hardfaced, *or* **pressed-in TCI inserts**. Rows run around the cone; the outermost row is the gauge row. |
| 8 | **Bearing seal + grease reservoir plug** | A small circular boss on the outside of each leg, often with a weld plug beside it. It is a tiny detail and it is the thing that says "sealed bearing". |
| 9 | **Nozzles** | Sit in the crotch between the legs, pointing down. Replaceable, so they read as a distinct insert in a bored seat. |

### 4d. PDC — parts

| # | Part | Why it matters visually |
|---|---|---|
| 1 | **Blades** | Fixed, standing off a solid crown, usually **spiralled** rather than radial. The number of blades is the bit's most obvious property. |
| 2 | **PDC cutters** | Flat **black discs** lying on the leading edge of each blade, showing a circle to the rock. Each sits in a bored pocket and is **brazed**, so there is a visible braze line all round. |
| 3 | **Junk slots** | The open channels between blades. **They are as much of the silhouette as the blades are.** A PDC read at thumbnail size is an alternation of solid and void. |
| 4 | **Gauge pads** | The parallel section at the back of each blade that holds the hole to size. Flat, polished by use. |
| 5 | **Nozzles** | In the junk slots, pointing down and slightly outward. |
| 6 | **Crown / matrix body** | The one-piece body the blades stand on. If it is a matrix bit it is cast tungsten-carbide and reads darker and slightly granular; if steel-bodied it reads like machined steel. |
| 7 | **API REG pin** | Up, as on a tricone. |

### 4e. Drag / cross / chisel — parts

| # | Part | Why it matters visually |
|---|---|---|
| 1 | **Wings / blades** | Two, three or four, swept back. On a cross bit, **four blades at 90°**; on a chisel bit, **two**. |
| 2 | **Brazed carbide plates** | Along the leading edge. **Plates, not buttons** — and per §3b they taper, they are chamfered, and they stand **proud of the steel, not dressed flush**. `_photos.md` records an engineering sheet that states the proud condition explicitly for a ring-bit tooth. |
| 3 | **Braze fillet** | A visible line of braze alloy around each plate where it meets the pocket. Different colour from both the carbide and the steel. |
| 4 | **Central flushing hole** | On a small cross bit, one oval hole in the middle of the crown. |
| 5 | **Body flutes** | Vertical grooves down the outside. |
| 6 | **Raised oval boss with a stamped size** | `_photos.md` records this on a real small bit: a raised oval on one blade flank carrying a stamped size, **rubbed bright where the paint has worn off the raised lettering**. **Generic, not a brand — safe to model, and it is a lovely detail.** |

### 4f. RC bit — what changes

Everything from 4b, plus a **central sample port straight up the axis of the
face**, and no ordinary face blow holes. The port is the single largest opening
on any bit face in this document.

### 4g. The carbide itself — the parts inside the parts

| Part | Where it goes | Geometry |
|---|---|---|
| **Spherical / hemispherical button** | percussion bit face and gauge | §3a — R ≈ 0,50 D, h1 ≈ 0,34–0,43 D, H ≈ 1,3–1,55 D |
| **Parabolic / semi-ballistic button** | percussion, medium rock | h1 ≈ 0,50 D, H ≈ 1,4–1,75 D |
| **Conical / ballistic button** | percussion, softer rock, and DTH concave faces | 57–75° included, tip R 0,13–0,35 D, H ≈ 1,4–1,7 D |
| **Serrated button** | grooved dome, specialist | H ≈ 0,88 D — squat |
| **Tricone insert** (hemispherical, roof-top, tricone shape) | TCI cone rows | either much flatter (R up to 0,87 D) or much more proud (h1/D 0,70–0,76) than a percussion button |
| **Carbide plate** | chisel, cross, drag, ring-bit teeth | §3b — tapered on every face, 0,8 mm chamfers, R6-ish nose |
| **Weld-on finger** | hardfacing rows | §3c — 25 × 14 × 8, gabled, 10° top taper |
| **Hardfacing beads** | shirttails, casing shoe rims, ring-bit outer faces | `_photos.md`: *"a dense ring of pale grey-white overlapping rounded beads"* — the finish changes from machined to encrusted |

---

## 5. Distinctive features

**Four silhouettes at thumbnail size.** The draft this document inherited was
right; what follows keeps it and hangs sourced numbers on it.

### 5a. The four families, in silhouette

1. **Top-hammer button bit** — a *short* cylinder, roughly **as long as it is
   wide**, with a **female thread up the bore** (it screws onto the rod, so the
   top end is an open hole, not a pin). Flushing flutes cut down the outside of
   the skirt. Nothing else on it.
   **Sourced proportion:** the one dimensioned crown in the folder is
   **160 long × Ø125** — **L/D = 1,28** — with the thread at **0,81 × the face
   diameter**, so the head overhangs its own shank as a collar (§3d).
2. **DTH bit** — the same crown but on a **long splined shank**; total length
   **around 2× the diameter**. The shank is the giveaway: straight external
   splines and a retaining-ring groove, and **no thread anywhere on the bit at
   all** (`research/12` §B.9 item 8).
   **Sourced proportion:** `src/rig/tools.js` records overall bit lengths taken
   off the DTH catalogue's shank drawings — **DHD 3.5 = 180,9 · DHD 340A /
   TD 40 = 209 · QL 50 = 239,6 · QL 60 = 253,3 mm** — giving **L/D ≈ 1,6–2,0**.
3. **Tricone** — three legs welded into a body, three cones on offset journals,
   an **API REG pin pointing up**. The only one of the four with moving parts.
   **Sourced detail:** the cones carry **11–16 rows and 106–260 inserts across
   the whole bit** (§3h) — so at any distance a tricone reads as *dense stipple
   on three curved rollers*, not as a handful of buttons. **Skew up to 5°** in
   soft-formation designs, **~0°** in hard.
4. **PDC / drag** — fixed blades spiralling off a solid body, black
   **disc-shaped** cutters lying on the leading edge of each blade, deep junk
   slots between. No cones, no buttons standing proud.
   **Sourced detail:** cutters are **8 mm or 13 mm** diameter (§3i) — *small*,
   and there are many of them; the black face a modeller sees is a **~0,5 mm
   diamond skin** on a carbide cylinder.

**The single most reliable tell in a thumbnail: what stands proud of the face.**
Button/DTH = **hemispheres or points**, light grey, standing **0,50–0,75 of
their own diameter** out of the steel (§3a). PDC = **flat black circles lying
flush along a blade edge**. Tricone insert = hemispheres too, but arranged in
**rows around cones**, not on a flat face — and blunter than a percussion
button, because a tricone hemispherical insert can have a nose radius of
**0,87 D** against a percussion button's **0,50 D**.

### 5b. The three-to-five things that identify each family

**Top-hammer button bit**
1. **An open threaded hole at the top.** No pin, no splines. Nothing else in
   this document looks like that.
2. **As long as it is wide** (L/D ≈ 1,3).
3. **Deep flutes down the skirt**, cutting the cylinder into lobes — **seven
   lobes on the mid-size bits counted here.**
4. **A gauge row tilted outward on the corner**, so the widest point of the bit
   is carbide, not steel.
5. **Wrench flats near the back**, the only non-round feature on the body.

**DTH bit**
1. **A long splined shank, roughly as long as the head** — the whole silhouette
   is head-plus-stick, and the stick is half of it.
2. **A retaining-ring groove** turned round the shank near the top.
3. **No thread anywhere.**
4. **Spline count identifies the family** — 6 / 8 / 10 / 12 / 16.
5. **Flat front is the honest default**, not a dome (see §9).

**Tricone**
1. **Three cones.** Nothing else has them.
2. **API REG pin pointing UP** — male, tapered, with a shoulder.
3. **Three legs with visible weld seams into the body.**
4. **Nozzles: either three bosses on the leg flanks (air blasthole) or three in
   the crotch / one central (mud).** Both are real; pick by method.
5. **A shirttail carbide field** — a staggered grid of flush flat-top buttons
   on the leg's outer bottom corner — plus **two small circular features on the
   leg flank** (the lubricant fill hole and the ball hole plug).

**PDC**
1. **Blades and junk slots alternating** — the voids are as much of the
   silhouette as the solids.
2. **Small black circles in a row along each blade's leading edge.**
3. **A gauge pad** — a flat parallel land behind each blade.
4. **No moving parts and no buttons standing proud.**
5. **An API REG pin, up.**

**Drag / wing / cross**
1. **Flat wings, straight — not spiralled** on every wing bit counted here.
2. **Carbide PLATES along the leading edge, standing proud**, or round scraping
   buttons — two distinct sub-families (§3j).
3. **Three wings and three junk slots** on the rotary family; **two** on a
   fishtail; **four at 90°** on a percussive cross bit.
4. **Elongated oval flushing ports, one per wing**, on the scraping-button type.
5. **Painted, on the small sizes** — orange-red or maroon enamel, not bare
   steel.

### 5c. What separates a NEW bit from a FINISHED one at thumbnail size

This is the other silhouette question, and it matters more for gameplay than
the family distinction does:

- **New:** the widest point of the bit is **carbide**. Domes are round. Face
  and body are different finishes from each other.
- **Finished:** the widest point is **steel**, because the gauge carbide has
  worn back level with a body that has itself gone undersize; the head has
  narrowed into a **cone**, not a smaller cylinder; the domes are **flats with
  hard-edged highlights**; and some sockets are **empty**.

**The rim of a wear flat is the whole read.** A flat catches the key light as a
hard-edged highlight; a fresh dome catches it as a soft one. That single
difference is legible at any size at which the bit is legible at all.

---

## 6. Materials, paint, and where wear and dirt accumulate

**New versus blunt is the whole story on a bit.** A rig looks broadly the same
at the start and end of a shift; a bit does not. This section is therefore the
most gameplay-relevant part of the document, because `src/rig/tools.js` already
declares in its own header that *"the player must be able to SEE a finished
bit"*.

### 6a. What tungsten carbide actually looks like

**Colour.** Carbide is a **cool, neutral, slightly darker grey than steel**.
It is not silver and it has no warmth. Beside bright machined steel it reads as
*a different metal*, and that difference is the single most important material
fact on the whole family.

**Microstructure.** `BETEK_Katalog_Tungsten_carbide.pdf` p. 14 prints a
micrograph of grade B25 (90 % WC / 10 % Co). Cropped and looked at at 500 dpi
it is **a dense mosaic of irregular, angular, pale-grey grains separated by a
faint slightly darker network** — the cobalt binder between the tungsten-carbide
grains. No directionality, no colour cast, no porosity. At any distance the
game will ever render, this is invisible; it matters only as the character of a
**fresh fracture surface**, which is granular and matte, never smooth.

**Two finishes on the same button, and the catalogue says which.**
`ibid.` p. 11 sets out the finishing processes, and they map straight onto
appearance:

- **Centreless cylindrical grinding** — this is applied to the **barrel** of the
  button. A ground cylinder has a fine, uniform, slightly directional satin
  finish running *around* the part.
- **Centrifugal vibratory finishing** — the catalogue says this *"deburr[s]
  carbides, round[s] off edges and clean[s], mat[s] and polish[es] the carbide
  pins"*. So **edges are rounded, not crisp**, and the surface lands somewhere
  between matte and polished.
- **Surface compaction** — a further tumbling step that work-hardens the skin.

The practical rule: **an as-sintered carbide surface is matte, faintly granular
and very slightly soft-edged; a ground one is satin and directional; a used one
is mirror-bright.** All three can appear on one button.

**How it is held in the steel — sourced, and it differs by family.**
`ibid.` p. 11, under *"Ready for your product"*, states the fitting method
per application in the manufacturer's own words:

> **Tricone bits (press-fit) · DTH- and TH bits (shrunk-in) · High pressure
> grinding rolls (bonded)**

So a **tricone insert is pressed** into its bore, while a **DTH or top-hammer
button is shrunk in** — the steel is expanded with heat, the button dropped in,
and the joint made by the steel contracting onto it. There is therefore
**no braze fillet and no visible joint line around a button** — just a clean
circular boundary where carbide meets steel. **A brazed fillet belongs to
plates, not buttons**, and putting one round a button is a tell that the modeller
worked from a photograph of a lathe tool.

**Plates are brazed, and that joint IS visible.** On a cross, chisel, drag or
ring-bit tooth the carbide sits in a milled pocket with a **braze alloy line all
round it** — a thin, warmer, brassy-to-silver seam distinct from both the
carbide and the steel, often with a small squeezed-out bead at the corners.

### 6a-bis. Hardfacing — the other way carbide gets onto a tool

Not every piece of carbide on a drilling tool is a button. `_photos.md` records
casing-shoe rims *"covered in a dense ring of tungsten-carbide hardfacing beads
— pale grey-white, rounded, overlapping"*, and the two BETEK application
catalogues give that appearance real geometry.

**Weld-on carbide studs** (`bwh-betek-katalog-spezialtiefbau-foundationdrilling-en.pdf`
p. 52, dimensioned sections, rendered at 130 dpi and read). These are
**stud-welded**, one at a time, onto a steel surface in a grid. Each is a short
**carbide ring on a small welded steel pedestal that flares into the parent
metal with a fillet**, and — the detail nobody expects — **the carbide is
hollow**, bored up the middle for the weld stud:

| Base Ø | Carbide Ø | Bore Ø | Height after welding | Overall height | Carbide standing proud |
|---|---|---|---|---|---|
| 16 | 12 | 7 | 11 | 16 | 8,4 |
| 16 | 12 | 7 | 14 | 19 | 11,4 |
| 19 | 15 | 9 | 11 | 16 | 8,4 |
| 19 | 15 | 9 | 14 | 19 | 12 |
| 22 | 18 | 12,6 | 11 | 16 | 8,4 |
| 22 | 18 | 12,6 | 14 | 19 | 12 |
| 22 | 18 | 12,6 | 17 | 22 | 14 |

Plus **domed and conical variants** (Ø19,2 dome standing 10 proud on a Ø22 base;
a tall Ø15,6 cone standing 13,3 proud on a Ø19 base) and one with a **grooved
band** round its barrel. **So a hardfaced surface is a field of Ø16–22 pads,
each standing 8–14 mm proud, on a visible welded flare.** That is a far better
model than a bumpy displacement map, and it is cheap geometry.

**Applied hardfacing coatings** (`ibid.` p. 51): three types — **FeCr**,
**NiCr + fused tungsten carbide (FTC)**, and **TC grit** — at a stated
**coating thickness ≤ 6 mm**. A coating, unlike a stud field, reads as a
**rough, granular, matte crust with a slightly irregular edge** where it stops,
and it is thin enough that it changes the surface but not the silhouette.

⚠ Both BETEK application catalogues (`…bergbau-mining-en.pdf`, 57 pp.;
`…spezialtiefbau-foundationdrilling-en.pdf`, 61 pp.) are, for the most part,
catalogues of **round-shank cutter picks and weld-on teeth** for roadheaders,
trenchers and augers — **a different tool family from the rock bits in this
document**, and they belong to `tools-overburden.md`. Only the hardfacing and
TungStuds sections earn a place here, and I read only those.

### 6b. The steel around the carbide

- **Body material: 42CrMo4 V** — quenched and tempered alloy steel
  (`Vollbohrkrone ZT0759801.pdf`). Which is exactly what `src/rig/tools.js`
  already declares (`material: 'Carbide grade DP55 / body 42CrMo4(V)'`). The
  game is right and should not be changed.
- **Machined-but-unused steel is pale grey and slightly frosted**, with visible
  lathe and mill tool marks and **no rust at all** (`_photos.md` §4, from
  `2026-06-25 at 13.45.01 (1)` and `(2)`).
- **Carbide buttons are markedly shinier than the steel they sit in** — polished
  domes against a matte machined body (`ibid.`, from `13.45.01 (7)`).
- **On a black-oxide bit the buttons go glossier, not brighter** — dark glossy
  spheres on a matte-black body (`ibid.`, from `2026-08-04 at 12.49.48`).
- **A bit can carry two finishes at once** — black-oxide head, bright polished
  thread (`ibid.`, from `2026-08-04 at 12.52.20`).
- **Small bits ship PAINTED, not bare** — thick, slightly textured orange-red or
  maroon enamel over a granular cast surface (`ibid.`, from
  `2026-06-30 at 13.00.10`). **The game's bare-steel small bits are wrong for
  that size class** and this is already flagged in `_photos.md`.
- **Raised stamped lettering rubs bright while the recesses keep their paint**
  (`ibid.`, from `2026-06-30 at 16.36.00`).
- **Tungsten-carbide hardfacing reads as a dense ring of pale grey-white
  overlapping rounded beads**, changing a rim from machined to encrusted
  (`ibid.`, from `13.45.01 (4)`).

### 6c. The wear story, in the order it happens

This is the sequence to drive a wear parameter with. It is assembled from the
bit-wear diagnosis material cited in `tools-core-dth.md` §1, the dull-grading
vocabulary already in `src/rig/tools.js`, and the direct photographic
observations in `_photos.md` §4.

**Stage 0 — new.** Buttons stand proud as clean domes, satin-ground on the
barrel, slightly matte on the nose. Body either bright machined, black oxide, or
painted. Threads bright. **No two adjacent surfaces the same finish** — that is
what makes a new bit look expensive.

**Stage 1 — run in (the first few metres).** The **paint comes off the leading
edges first**. The gauge band develops a **bright polished ring** where it has
rubbed the hole wall — `_photos.md` §4 states the general rule from the rotary
drive head: *"Polished steel appears exactly where a part rubs."* On a bit that
means the **gauge band and nothing else**. The button noses lose their matte and
start to shine.

**Stage 2 — worn.** The buttons **lose their crown radius**: a spherical button
flattens on top, a ballistic one goes blunt. **Straw and then blue heat
colouring** appears on the head — the classic tempering colours, straw first at
the hottest points (the gauge corner and around the blow holes), then blue.
Rock flour packs into the waterways and the skirt flutes: a **pale, dry,
fine-grained deposit** that sits in the corners of the milled channels and dulls
everything it touches, in contrast to the bright metal of the lands beside it.

**Stage 3 — blunt.** **Wear flats** on the face buttons — each dome carries a
**mirror-polished flat, ground square across the direction of travel**. This is
the difference that reads instantly at close range: **a worn button is not a
smaller dome, it is a dome with a mirror on it.** The gauge goes undersize and
the head visibly narrows into a taper — hardest scrub is at the corner meeting
uncut rock, so the steel loses diameter as a **cone, not as a smaller
cylinder**. The whole body polishes to a low sheen from rubbing the hole.

**Stage 4 — finished.** **Buttons snapped out.** Empty sockets with a
**chipped crater lip** where the steel has torn away around the missing button.
Adjacent buttons **chipped and spalled** rather than smoothly worn. On a
tricone the equivalent is different and important: **steel teeth do not fall
out of their sockets — they blunt, then SNAP, and the stub stays in the cone.**
TCI inserts do break out, but later and fewer.

**PDC wears differently again and must not be given button wear.** A diamond
table does not round over. It **grinds a polished wear flat**, it **chips**, and
because the shoulder does the most work per revolution it **rings out** — losing
a whole radial band of cutters and letting the blade behind them erode into a
groove. Three distinct signatures, none of them "dome becomes smaller dome".

### 6d. Where dirt actually sits

Directional, never uniform:

- **Rock flour packs into the flutes and waterways** and stays there. It is
  pale, dry and fine, and it never sticks to a polished rubbing surface — so
  the contrast between **packed grey flour in the channels** and **bright
  polished lands** is the strongest small-scale contrast on a used bit.
- **Wet mud runs down the flutes** and dries in tongues.
- **Rust is directional** (`_photos.md` §4): heaviest on upward faces and every
  sharp edge, running in **drip streaks down the sides**, sheltered undersides
  still dark. Scattered white specks (dried salt or lime) sit on top.
- **Sharp machined edges catch light as thin bright lines** where the rust has
  been knocked off.
- **A bit that has been in the ground is never clean anywhere except where it
  rubbed.** Everything else is dulled.
- **Hand-written marker and crayon on bare steel is normal workshop practice**
  and makes an excellent brand-free decal — `_photos.md` records `"Pilot 102"`
  written straight onto bright machined steel in black marker.

### 6e. Where the bit sits when it is not in the hole

Because the shop and yard renders need it, and `_photos.md` §2 has it all:
**upright and crowded, on timber** — a batch of crowns stands together on a
weathered pallet top on a concrete floor. Loose bits lie on **black polythene**,
on **rough-sawn timber crates**, on a **scarred steel welding table**, or in
**galvanised wire-mesh stillages**. Threads get **white or orange plastic thread
protectors**. None of this is invented; every item is from a photograph in the
library.

---

## 7. Photo references

`research/rigs/_photos.md` is the catalogue for the whole library and it is the
correct first stop. Listed below are **only** the frames that earn their place
on this family, in the order a modeller should open them, with what each is
actually for. Every one was opened.

### The geometry set — open these first

| Image | Viewpoint | What to take from it |
|---|---|---|
| `Downloads\Vollbohrkrone ZT0759801.pdf` (rendered) | **DIMENSIONED 3-VIEW** | The only fully dimensioned bit head available: 160 long, Ø125 face, 101,6 3-start conical LH thread, 42CrMo4 V. **Count the buttons off the face plan; take the three-band proportion off the side elevation.** ⚠ copyright notice, company mark, drawing number — **proportions only, nothing lettered.** |
| `Downloads\SPIBO-HM-10x15x6-R6_drawing.pdf` (rendered) | **DIMENSIONED 3-VIEW + 2 isometrics** | The carbide plate, completely specified: 10 × 15 × 6, R6 nose, 2°/6°/7°, 0,8 × 45° chamfers. **The isometrics show what those tapers look like as a solid** — that is the shape to build. |
| `Downloads\Hm anschweißfinger.pdf` (rendered) | **DIMENSIONED 3-VIEW + isometric** | The weld-on finger, 25 × 14 × 8 with a 20° gable and a 10° top taper. |
| `Downloads\WhatsApp Image 2026-08-06 at 15.14.23 (2).jpeg` | **CAD FACE PLAN** | The DTH/pilot bit face. Small (505 × 529) — **upscale it ×3 before counting.** 7 gauge lobes, 6 face seats, 3 flushing holes with milled slots. |
| `Downloads\WhatsApp Image 2026-08-06 at 15.14.23 (1).jpeg` | **CAD 3/4** | The same bit in three-quarter: face, lobes, junk slots cut through the gauge, external thread of about six turns at the back. |
| `Downloads\WhatsApp Image 2026-08-06 at 15.14.23.jpeg` | **CAD, from behind** | The back of that bit: internal thread of about eight turns, counterbore, **four flushing holes around a central hole**, six-lobed skirt from the rear. |
| `Downloads\WhatsApp Image 2026-08-06 at 15.16.08 (1).jpeg` | **CAD SIDE ELEVATION** | A casing crown / ring bit in elevation — the three-band proportion (crown ≈30 % : rope thread ≈55 % : plain band ≈15 %) that cross-checks the Vollbohrkrone reading. |
| `Downloads\WhatsApp Image 2026-08-06 at 15.16.07.jpeg` | **CAD FACE PLAN** | A **ring bit** face: twelve large button seats around the outer face alternating with twelve smaller inner seats, twelve shallow scallops around the edge. The alternating large/small ring is the thing to get right. |
| `Downloads\Atpa\ATPA-Bohrkronen.pdf` p. 2 (rendered) | **PHOTOGRAPH, near face-on** | The best photograph of a DTH bit face in the library: bright machined crown, **seats bored but buttons not fitted**, black background. Use it to see what an empty seat looks like — which is what a bit at wear 1.0 looks like. |

### The carbide set

| Image | What to take from it |
|---|---|
| `Downloads\carbide_buttons_weights.png` | Four button forms in 3D with Ø × H called out: spherical Ø14 × 20, spherical Ø12 × 17, conical Ø10 × 15, serrated Ø8 × 7. **The proportions to model.** |
| `Downloads\carbide_info.png` | Two carbide plates as dimensioned silhouettes — the R8 plate and the gable plate. **Use for chisel and cross bits, which take plates, not buttons.** |
| `Downloads\WhatsApp Image 2026-08-22 at 10.57.35.jpeg` | A scanned three-view of a carbide plate 15 × 10 × 6, R6 corner, **2° flank / 7° top draft, 0,8 × 45° chamfers** — an independent confirmation of the SPIBO tip at a different size. |
| `Downloads\WhatsApp Image 2026-06-25 at 13.45.01 (7).jpeg` | **MACRO, the material split.** Polished carbide domes against matte machined steel, plus `"Pilot 102"` in black marker on bare steel. **The single best reference for how carbide sits in steel.** |
| `Downloads\WhatsApp Image 2026-08-04 at 12.52.20.jpeg` | **Conical (ballistic) buttons as real objects** on a black-oxide body, with the thread left bright below. A two-finish part. |
| `Downloads\WhatsApp Image 2026-08-04 at 12.49.48.jpeg` | The same crown type in **glossy black oxide** — the finished, shipped appearance, with the buttons reading as darker glossier spheres. |
| `Downloads\WhatsApp Image 2026-06-25 at 13.45.01 (4).jpeg` | A bit **with its buttons fitted**, held above casing shoes whose rims carry **tungsten-carbide hardfacing beads**. Both finishes in one frame. |
| `Downloads\WhatsApp Image 2026-06-25 at 13.45.01 (1)/(2).jpeg` | A crown with its **button seats bored but EMPTY**, plan and elevation. Bare machined steel, tool marks, no rust. |
| `BETEK_Katalog_Tungsten_carbide.pdf` p. 14 (rendered 200 dpi) | **All six bottom shapes A–F drawn in elevation and section**, plus the carbide **micrograph**. |
| `BETEK_Katalog_Tungsten_carbide.pdf` pp. 20–22 (rendered 350 dpi) | The dimensioned button figures with D / H / h1 / R labelled — **the figures that decode the tables in §3a.** |

### Small bits and painted finishes

| Image | What to take from it |
|---|---|
| `Downloads\WhatsApp Image 2026-06-30 at 13.00.10.jpeg` | Two **four-blade cross bits**, one orange-red, one maroon, on an office desk with a stapler and a mug for honest scale. **Small bits ship painted.** |
| `Downloads\WhatsApp Image 2026-06-30 at 16.36.00.jpeg` | **MACRO of the maroon bit's crown**: four tapered blades, a lighter grey carbide plate in each leading face, flushing holes between, and a **size stamped in a raised oval boss, rubbed bright where the paint has worn off the raised lettering**. Generic, not a brand — **safe to model and worth modelling.** |

### The family in context

| Image | What to take from it |
|---|---|
| `Downloads\dth-bits-1024x683.jpg` | ~20 DTH hammers standing, two lying with bits fitted, **a yellow hard hat in frame for scale**. The size ladder. Note the bits' faces are the darkest thing in the render. |
| `Downloads\WhatsApp Image 2026-06-25 at 13.45.01.jpeg` | About twenty finished crowns upright and crowded on a weathered timber pallet. **How a batch of tooling actually sits.** |
| `Downloads\WhatsApp Image 2026-06-25 at 13.45.01 (6).jpeg` | A ring bit with its **pilot bit nested inside it**, on black polythene, muddy boots in frame. The pair is one assembly. |

### Recorded so nobody reopens them

- `Downloads\carbide_buttons_cost_eur.png` — the same four renders as
  `carbide_buttons_weights.png` with prices instead of masses.
  **Geometrically a duplicate, and the prices are the owner's commercial data.**
- `Downloads\WhatsApp Image 2026-06-30 at 16.36.07.jpeg` — a kitchen scale
  reading 387 g and nothing else. No geometry.
- `Downloads\bwh-datenblatt-tm-14-17.pdf` and its three siblings — **piling-rig
  datasheets, no carbide content whatsoever.** See §1.
