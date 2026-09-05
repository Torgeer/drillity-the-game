# _gaps.md — what the reference library still does not know, and what it got wrong

status: in progress — written skeleton-first; sections filled as the last
documents land.

**Read this before commissioning any more research or starting any more models.**
It is the index of weakness in `research/rigs/`: which references are thin, which
catalogues nobody has opened, where the photo library runs out, and — the long
part — **every domain-truth warning from every reference, deduplicated and ranked
by how embarrassing it would be to a working driller.**

---

## 0. Contents

- **§1 The tooling unlock** — four capabilities the library was largely written
  without, one of which had been recorded as permanently impossible. Read this
  first; it changes what a follow-up run can do.
- **§2 References ranked by how weak they are**
- **§3 Catalogues nobody has read** — the explicit list
- **§4 The photo library, and where it runs out**
- **§5 Domain-truth warnings, deduplicated and ranked**
- **§6 Things the game already gets RIGHT** — do not "fix" these
- **§7 Ratios that must not be scaled**
- **§8 Process notes and one citation error**

---

## 1. The tooling unlock — read this first

### 1.1 PDFs are readable. They were recorded as unreadable, and that was wrong.

The Read tool's `pages` parameter fails on this machine with:

```
pdftoppm is not installed. Install poppler-utils … to enable PDF page rendering.
```

**An earlier agent took that at face value and recorded two catalogues as
permanently blocked** (`cable-percussion.md` §1, since struck through and
corrected in place). It is wrong. On this machine:

- **`pymupdf` is installed** (PyMuPDF 1.28.2) — it can render any page to PNG,
  which the Read tool then displays.
- **`pdftotext` is installed** (`/mingw64/bin/pdftotext`) — full text layers.
- `pdfplumber` and `pypdf` are also present.

Two helper scripts were written for this run and are worth keeping:

| script | modes |
|---|---|
| `<scratchpad>/pdfpage.py` | `info <pdf>` — page count, bookmarks, and the **first line of every page**, which is a usable table of contents for a catalogue with no bookmarks · `text <pdf> <first> <last>` · `png <pdf> <first> <last> <dpi> <tag>` — renders into `<scratchpad>/pdfpages/` for the Read tool to open |
| `<scratchpad>/crop.py` | `<pdf> <page> <x0> <y0> <x1> <y1> <dpi> <out>` — fractional page coordinates, ~400 dpi, for reading a dimension off a drawing or counting buttons on a bit face |

**Workflow that worked:** `info` to find the drawings → `text` for the tables →
`png` / `crop` + Read for the geometry. Never read a catalogue linearly.

**One gotcha, already patched in the script:** Python's stdout on this machine is
cp1252, so extracting text from a German or Chinese catalogue raises
`UnicodeEncodeError` on the first ligature. `sys.stdout.reconfigure(encoding='utf-8',
errors='replace')` fixes it.

**Two related findings from other agents on this run:**
- **WebFetch drops binary PDFs into `~/.claude/.../tool-results/`**, where
  `pdftotext` can reach them — which is how two web PDFs the fetcher itself could
  not parse were recovered.
- **HEIC files cannot be read directly.** Convert to JPEG first. The four
  `IMG_790x.HEIC` files — the photographs the 114.3 mm drill-rod pin-end drawing
  was reconstructed from — were converted into scratchpad and the method noted in
  `_photos.md` so the next reader does not hit the same wall.

### 1.2 There are native CAD models in `Downloads`, and they can be opened

`C:\Users\henri\Downloads` contains **Autodesk Inventor assemblies and parts**,
not only PDFs — `1524,4 CC sm carb comp\`, `88,9 ff sm carb comp\`,
`Aarsleff Outerbit\` and `lost bit 178 x 190\` each hold `.iam` / `.ipt` files
for overburden tooling. An **Inventor bridge is available in this environment**,
and they can be opened **read-only** to pull a **BOM** and **mass properties**.

This is the strongest form of evidence in the whole library. On
`tools-overburden` the BOM independently confirmed the printed catalogue to three
decimals (**20 × HM10 buttons plus 6 stud pins on the crown; 24 × HM10 on the
head**), and a bounding-box measurement settled the carbide-exposure question
outright — **crown body 170.001 mm → assembly 175.000 mm, so exactly 5.0 mm of
projection**. **Where a CAD model exists, measure it rather than reading a number
off a page.**

**Discipline that was followed and should be repeated:** open read-only, never
save, close every document afterwards, and close with `skip_save` anything a
query has marked dirty. Inventor was left with zero open documents.

**Nobody has checked whether CAD models exist for any other tool family.** That
is worth ten minutes and it could be the cheapest accuracy win available.

### 1.3 The session's WebSearch budget is exhausted

**200 of 200 calls used.** From that point, only direct `WebFetch` on a guessed
URL was possible. For `raisebore`, whose local sourcing is almost nil, three of
four guessed URLs returned 404 and one 403 — so **the thinnest document in the
library is thin partly for a mechanical reason, not only a real one.**

**A rerun with search available is the single highest-value follow-up in this
whole file.** It would most likely close `raisebore` §8 items 1–5 in minutes.

---

## 2. References ranked by how weak they are

Weakest first. "Thin" here means *sourcing*, not length — several thin documents
are long precisely because they spend their length being honest about gaps.

| rank | reference | state |
|---|---|---|
| 1 | **`raisebore`** | **The worst-sourced machine in the library.** No manufacturer general arrangement, no dimensioned drawing, no photograph. **The machine's entire envelope is unsourced** — height, footprint, weight, thrust, torque, power. What *is* well sourced is the reaming head (cutter counts and weights at five diameters), the string, and the method. §8 lists 17 gaps. |
| 2 | **`oil-derrick`** | Well sourced on *structure* — one filled-in 66-page IADC equipment list for a real jack-up carries derrick, substructure, blocks, drawworks, rotary, BOP, mud, power, hull, legs, spudcans, cantilever. **But there is no photograph of an offshore drilling unit anywhere**, so everything about weathering is reasoned rather than observed, and **equipment envelopes** (top drive, drawworks, mud pumps, blocks) are rated but not dimensioned. |
| 3 | **`cable-percussion`** | Long and careful, but **no photograph of either family exists** — 272 images swept, zero hits — so its visual claims rest on one period engraving. **Weights for every British tool** (shell, clay cutter, stubber, chisels) sit behind a members-only trade-association document. |
| 4 | **`tools-piling-hammers`** | Two strong primary catalogues, but **no dimensioned general arrangement of an impact hammer exists in them**. Length and weight are sourced for 26 machines; width, depth, flange pitch, cap height and guide-jaw spacing are read off photographs. The vibratory-hammer dimension letters (L1/L2/L3, H1/H2, W1/W2/W3) are tabulated **with the key diagram missing**. |
| 5 | **`tools-core-dth`** | Confident on the geometry it covers, but **fourteen further catalogues on the same subject went unread**, including **five water-powered DTH hammer datasheets** — a genuinely different machine that **nothing in the library covers at all**. |
| 6 | **`tools-kelly-foundation`** | Two excellent primaries, one of which had never been opened. **Ten single-product datasheets were left unread** and several almost certainly carry the dimensioned drawing of an individual tool that the document could not find. Tooth and tooth-holder dimensions are named but never dimensioned anywhere. |

| 7 | **`hdd-rig`** | Well sourced *because* the agent went to the web — only three of ~20 local PDFs earned their place. Manufacturer sheets, a tooling catalogue and six patents carry it. **No photograph of an HDD rig, spread, reamer, entry pit or mud recycler exists anywhere.** Three specific things stay unsourced: the **beam cross-section** (searched for, found nowhere), the **carriage stroke** (every maker publishes speed, none publishes stroke), and the **slant-face angle**, which no manufacturer publishes at all. |
| 8 | **`tools-anchors-sda`** | Strong on the bar, coupler, nut and plate — six sources agreeing on the size ladder. Its one gap is **missing by design and cannot be closed from catalogues**: the **over-drill ratio, bit Ø against bar Ø**, is not published because **bit adapters deliberately decouple bit size from bar size**, and the grout-cover requirement lives in EN 14199 / 14490 and the ETA — none of which are in the folder. The document fences off the nearest parallel as non-transferable rather than borrowing it. |

**At the other end of the scale — the strongest document in the library is
`tools-overburden`**, and it should be the template for what "well sourced"
means here. It rests on the owner's own manufacturing drawings, a 63-page casing
drawing set, four native CAD models measured directly (§1.3), and a published
table that pins the eccentric expanded/retracted relationship across 46 rows and
four system families. Its one real gap is stated plainly: **the eccentric reamer
itself has no drawing anywhere in the folder**, so its arm length, plate
thickness, hinge-pin diameter, hinge offset, cutting-flank shape and swing
mechanism are all `NOT SOURCED`. The diameters constrain that mechanism; they do
not describe it.

*(Rows for `tools-bits-carbide` and `tools-rods-pipe` are appended when those
documents land.)*

The **fourteen references written before this run** (`foundation-bg`, `cfa-rig`,
`piling-leader`, `tunnel-jumbo`, `bolter`, `longhole-rig`, `core-rig`, `rc-rig`,
`dth-crawler`, `crawler-th`, `crawler-lite`, `si-rig`, `cpt-unit`, `sonic-truck`)
were **not re-audited on this run** and their weaknesses are not assessed here.
`HANDOFF.md` §9.8 already asks for a citation-verification pass over every
research pack; §8.2 below records the first hit that pass would find.

---

## 3. Catalogues nobody has read

Every one of these sits in `C:\Users\henri\Downloads` and is directly on subject.
They are listed so that "we looked" is never assumed.

### 3.1 Highest value — likely to contain a dimensioned drawing of one tool

- **Ten foundation-tool product infos**: `2025_BMA_Productinfo_SB-SB-2_EN.pdf` ·
  `2025_Productinfo_CFA_Anfaenger_EN.pdf` · `2025_Productinfo_FDP_Anfaenger_EN.pdf` ·
  `2025_Productinfo_SCM_Anfaenger_EN.pdf` · `2025_Produktinfo_KBF-K_flach_high_EN.pdf` ·
  `2025_Productinfo_KR-RM-HF_EN.pdf` · `2025_Productinfo_Abfangschelle_EN.pdf` ·
  `2025_Productinfo_DW-S_EN.pdf` · `2025_Productinfo_KR-WS-29_EN.pdf` ·
  `2025_Productinfo_RS-WS_EN.pdf`. Short files. **Cheapest large win available.**
- **Fifteen water-powered DTH files, not five.** The `hdd-rig` agent checked all ten `PD_W*` files on the hypothesis that one might be an HDD general arrangement. **None is** — every one is water-powered DTH material: `PD_W70/100/120/150/280` are **hammers**, `PD_WASP*` are **water pumps**, `PD_WS150/WS200/WIS` are **water swivels**. Add the five `13.1–13.5 BWH…WAI35/40/50/60/80` datasheets and there are **fifteen files on a machine the library covers with nothing at all.** A negative result on one question that closed a bigger gap on another.
- **Four Chinese casing drawings**, the only likely source anywhere for the **upset casing end** (墩头) that `tools-overburden.md` could not close: `133墩头打击套管 STR133001-Model.pdf` — **the highest-value unread file in that set** — plus `101.6套管双母扣 STR102002.pdf`, `152套管公母扣2025.3.12-Model.pdf` and `180打击套管 STR180001-Model.pdf`. **A dimensioned drawing is language-independent** — do not skip these because the filename is Chinese.
- The **~300 remaining exploded views** in
  `Kelly-Spare_Parts_and_Wear_Parts_DE_EN_905_835_1_2.pdf` — one per Kelly section,
  every diameter from Ø254 to Ø559. Only one page has been read. Render any
  diameter you need.

### 3.2 Read only in part

- `InHoleTools_Catalog.pdf` — 238 pp.; only the 3-page system overview was read.
  The remaining ~200 pages are per-size kits and spare parts.
- `bauer-maschinen-drilling-tools-and-casings-de-en-11-25_0.pdf` — pp. 13–17
  (buckets), 18–24 (core barrels, cross cutter), 26–35 (the second tool range),
  39–40, 42–43 unread.
- `Epiroc DTH product catalog.pdf` — pp. 8–19 (shank-to-bit-diameter mapping) and
  pp. 30–33 (drill pipe by design group) belong to other documents and are unread.
- `PalPile-Brochure-2025.pdf` — pp. 16–19 (pipe walls, interlocks) and 22–27
  (anchoring) indexed, not mined.
- `Junttan_Hammers_brochure_EN_2025_web.pdf` p.7 and the carrier-level Junttan
  brochures and operator's manual.

### 3.3 Named on subject, never opened

`Mincon - Minroc - DTH_Product_Catalogue.pdf` · `Mincon-RC-Solutions-2025-A4-WEB.pdf` ·
`dth_catalog_digital_version_eng_2023.pdf` · `DTH Hammers & DTH Bits.pdf` ·
`DTH-BIT.pdf` · `DTH-HAMMER.pdf` · `潜孔全英文版本180628.pdf` ·
`Reverse-Circulation-Tools.pdf` · `Epiroc Guide to Diamond Tools.pdf` ·
`Epiroc Guide choosing right core bit.pdf` · `Epiroc guide Extending core bit life.pdf` ·
`Diamond_Bits_Catalogue.pdf` · `Mineral Exploration Tooling - Catalog.pdf` ·
`Xploration+Products+Geology+Katalog+V.3+(English).pdf` ·
`Mincon-Bluebook-2025-WEB.pdf` · `Mincon_Shock_Absorbers_2024.pdf` ·
`Wassara-Explorer_Surveying-System_Brochure.pdf` · `SED_Reference book_EN_L.pdf` ·
`Field_Reference_Guide_2014_UPDATE_1.pdf` · `Bohrtech_Katalog24_f25.pdf` ·
`KLEMM_Lieferprogramm_Product_Range.pdf` · `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` ·
`SUNWARD_DRILLING-RIGS_S-SERIES_EN.pdf` (p.25 mined by `cfa-rig.md`; the rest unread) ·
`116-015-23_SCXProductGuide-1.pdf` · `116-012-22_SCXTechnicalSpecs-DE140.pdf` ·
`Drilltechniques-Sonic-Brochure.pdf` · `4530_TS-_Technical_Data_ENG_2025-3.pdf` and the
other `*_TS-_Technical_Data_*` sheets · `nov_rotary-handling-tools-land-offshore.pdf` ·
`HMH-Technical-Training-Catalog-Equipment-System-Solutions.pdf` ·
`Offshore_Product_Reference_Guide.pdf` · `Gulf-Rig-Catalog.pdf` (checked: a **parts**
catalogue with no rig dimensions — a negative result, recorded so nobody re-opens it).

---

## 4. The photo library, and where it runs out

From `_photos.md` — **205 of 279 top-level images were opened**, 74 rejected on
stated patterns, none unaccounted for.

**The single most important finding: this is a tooling library, not a machine
library.** It is exceptionally strong on overburden tooling (31 images, including
a CAD side elevation of a casing crown and an unbranded six-view set of a
DTH/ring bit) and very weak on machines.

### 4.1 Machine ids with NO photograph at all — eleven of eighteen

`sonic-truck` · `core-rig` · `rc-rig` · `si-rig` · `cpt-unit` · `hdd-rig` ·
`raisebore` · `oil-derrick` · `cable-percussion` · `bolter` · `longhole-rig`

For `hdd-rig` the gap is wider than the machine: there is **no photograph of an HDD spread, back-reamer, entry or exit pit, or mud recycler** either — and an HDD rig is only one item in a spread.

**Four of those eleven are one procurement gap, not four:** there is **no
underground photograph of any kind in the folder**. One trip underground with a
camera would serve `bolter`, `longhole-rig`, `raisebore` and `tunnel-jumbo`.

### 4.2 Ids served only by CG renders — no photograph of the real class

`crawler-th` · `dth-crawler` · `cfa-rig` · `foundation-bg`

A render inherits whatever the renderer got wrong. These four should be treated
as one grade weaker than their reference length suggests.

### 4.3 Effectively unsourced despite having an image

`tunnel-jumbo` — its only image is a **rail-mounted** unit, which is the wrong
architecture for a boom jumbo.

### 4.3b The tool families are photographed unevenly, and one is not photographed at all

`_photos.md` records **31 overburden images**, which makes that family the best-photographed subject in the library — but `tools-overburden.md` reports that **not one of them shows a casing crown, ring bit, pilot head, lost bit, ring shoe or eccentric as a finished object**. Its §6 wear description is therefore **reasoned from geometry and materials, not observed**. Three stock photographs would close that section entirely, and it is the family the owner actually sells — so it is the one where a wrong wear pattern would be noticed first.

### 4.4 What one photo trip would fix, in priority order

1. **Anything underground** — closes four ids at once (§4.1).
2. **A reaming head on the floor with a person for scale** — the memorable object
   of `raisebore`, completely unsourced visually.
3. **An offshore drilling unit** — closes the whole of `oil-derrick` §6.
4. **A cable-percussion tripod** — closes a document currently resting on one
   period engraving.
5. **A core rig and an RC rig working** — two substantial references with no
   photograph behind them.
6. **Overburden tooling as finished objects** — a casing crown, a ring bit and an eccentric, new and worn. Cheap, and it is the owner's own product line.

### 4.5 Two cautions carried from `_photos.md`

- Several supplier CAD drawings in the folder carry **title blocks and drawing
  numbers**. Use proportions only (`DOMAIN.md` §10), and note the standing house
  rule that drawing numbers and title blocks are stripped from anything
  customer-facing.
- **Five files are identity documents and a signed power of attorney carrying
  personal ID numbers.** They are listed by name in `_photos.md` so they are
  recognised and skipped. Nothing was copied out of them and nothing should be.

---

## 5. Domain-truth warnings, deduplicated and ranked

**Ranked by how embarrassing it would be to a working driller**, not by how hard
it is to fix. Tier A items are ones where the object as modelled **could not
exist or could not do its job** — a driller does not need to measure anything to
see them. Tier D items are proportion errors that only a specialist would catch.

Each entry names the reference that carries the full argument. **None of these
were fixed by this work — `research/rigs/` is documentation only, and nothing
under `src/` was touched.**

### Tier A — the geometry contradicts itself

These are the ones that get laughed at. Note that `HANDOFF.md` §8E already names
this exact failure class from a previous round — *"an Odex eccentric that could
not have come out of its own hole… a ring bit advertised as cutting 0.146 mm… a
belling tool whose arms crossed the centreline"* — and its instruction stands:
**read the figure off the mesh.**

**A1. Three of the game's five DTH hammers are wider than the smallest hole their
own size class is specified to drill.** `tools-core-dth.md` §9.2. The
manufacturer's rule is explicit that the hammer's outside diameter is the
limiting factor on hole size. Game 5″ hammer OD **133 mm** against a minimum
recommended hole of **130 mm**; 6″ **159** against **152**; 8″ **210** against
**200**. The hammer cannot enter its own hole. Real ODs are 117 / 138 / 181 mm.

**A2. The raise borer's hold-down could not hold it down.** `raisebore.md` §9.2.
The machine is grouted and rock-bolted to a concrete floor to react its pull into
the rock; the game holds it with **four chrome rods 28 mm in diameter** against
its own claimed **4 500 kN of pull** — roughly **1 830 N/mm²**, far beyond any
structural steel. They also read as hydraulic rods, which is the opposite of what
they are.

**A3. A production platform is drawn with a moonpool.** `oil-derrick.md` §9.B,
and open defect #7 in `HANDOFF.md`. A moonpool is a hull opening; a fixed
platform bolted to the seabed has no hull. `data.js` states in its own comment
that the archetype is a fixed installation, and `terrain.js` draws the hull
opening anyway. The correct geometry — a **well-slot grid with a skidding drill
floor**, conductors standing in rows — is now sourced.

**A4. A bored-pile casing joint must not intrude into the bore.**
`tools-kelly-foundation.md` §9.3. Casings are **double-walled specifically so the
string has a continuous flush bore** and a bucket coming up cannot snag on a
coupling. Any casing mesh with a proud coupling inside the bore describes a tool
that would jam on its first trip. This is A1 and the historic Odex error in a
third family.

**A5. The concentric string does not line up, so the pilot could not be
retrieved.** `tools-overburden.md`. The sourced ladder closes exactly — **casing
bore Ø128 = crown bore Ø128 > pilot head Ø125**, three millimetres of diametral
clearance the whole length of the hole — and *that continuity is the reason the
pilot can come back up inside its own casing*. The game **necks the crown bore
4–5 % under the casing bore**, worst case `ringId = ro * 0.70` in
`buildRingBitSystem`. A pilot that cannot be withdrawn is the same class of error
as A1 and A4.

**A6. The wing bit is under gauge before its buttons are fitted.**
`tools-overburden.md`. The authored arm geometry puts the open tip at about
**137 mm on a Ø139.7 mm casing** — i.e. the tool as modelled cuts a hole
*narrower than the casing it is supposed to clear a path for*, and it
contradicts its own docstring while doing it.

**A7. A 12-tonne pulling swivel on a 330 kN rig.** `hdd-rig.md`. The sourced
rule is that the swivel is rated at **≥ 1.5 × pullback**, which on a 330 kN
(≈34 t) machine means about **50 t**. The game fits **12 t** — roughly a quarter
of the load it would see on the pullback it claims. The swivel is the single
component in an HDD spread whose failure loses the whole product string.

### Tier B — a number a specialist knows by heart, wrong by a lot

**B1. Vibratory hammer frequency is 35–56 % too high.**
`tools-piling-hammers.md` §9.4. Every normal-frequency machine in the source
table runs **1 400–1 700 rpm**, falling as the machine grows. The game presets
are **2 500 rpm at 1 500 kN** (real ≈ 1 600) and **2 300 rpm at 700 kN** (real
1 700). Frequency is the number a vibro operator knows without looking, and it
drives both the audio and the shake amplitude.

**B2. Raise-bore cutter counts are wrong at every published diameter, and the
error is visible.** `raisebore.md` §9.1. Published: 4 / 10 / 14 / 16 / 32 cutters
at 1 060 / 1 829 / 2 440 / 3 094 / 5 876 mm. The game's `Math.max(6, dia/260)`
gives **+50 %** on the smallest and **−25 to −36 %** on every larger one. The
1 800 mm head parked on the floor in every raise-boring scene gets **7 cutters
where the published count is 10** — and a viewer can count them.

**B3. The offshore racking board holds 14 % of the pipe the rig's own depth
capacity requires.** `oil-derrick.md`. Sourced: 20 000 ft of 5″ pipe — **219
trebles or 328 doubles**. The game holds **18 stands** against its own declared
`depthCapacity: 2400`. It is already an `InstancedMesh`, so this is nearly free
to fix, and it transforms the silhouette.

**B4. A BOP is a block, not a column — and it nearly fills the substructure.**
`oil-derrick.md`. A 13⅝″ 10K double ram is 1.69 m tall but **2.90 m long**,
growing to **4.39 m with the bonnets open**. Annular plus single plus double is
**4.13 m of body and 19.3 t** under **6.40 m** of clear height. Two independent
documents cross-validate: the three preventer weights sum to within 2 % of the
same rig's own BOP-hoist SWL.

**B5. Impact hammer masses run 25–32 % heavy in the middle of the range.**
`tools-piling-hammers.md` §9.3. At 9 t of ram the game says **17 800 kg** against
a real **13 500**; at 16 t, **30 500** against **23 200–24 400**. The check is the
hammer-mass ÷ ram-mass ratio: real is **1.45–1.60**, the game is **1.91–1.98**.

**B6. The cable-tool chisel mass formula is linear where it should be roughly
quadratic** — producing a **799 kg bit** when the entire sourced tool string
weighs **544–907 kg**. `cable-percussion.md`. And the **jars default to a 500 mm
stroke** when new jars are sourced at **102–127 mm** and are *retired* at
305–356 mm.

**B7. Every DTH hammer is oversized in both diameter and length**, by **+8 to
+16 %**. `tools-core-dth.md` §9.2. The redeeming detail: the **length-to-diameter
ratios are close to correct**, so the shape is right and both dimensions are
simply scaled together — multiplying the whole table by about **0.88** would put
it on the sourced numbers and preserve the proportions.

**B8. Two `IMPACT_HAMMER` rows are cross-bred from two different real machines.**
`tools-piling-hammers.md` §9.2. The 30 t row takes energy, stroke and blow rate
from one hammer and length and weight from a **different** one with a different
stroke. This is `HANDOFF.md` §8B's *"two tables describing one thing"* appearing
**inside a single table**.

**B9. Percussive casing wall is modelled at little more than half thickness.**
`tools-overburden.md`. Sourced wall is **~12–13 mm on every size from Ø88.9 to
Ø152.4**; the game defaults to **7–8 mm**. Two consequences, and the second is
the serious one: it **looks like water-well casing** rather than percussive
casing, and it **silently relaxes the retraction constraint by 14 %** on the
Ø114.3 eccentric — so a tool that would not really come home appears to.

**B10. The eccentric reamer's expansion sits below every published row.**
`tools-overburden.md`. `reamR = ro * 1.06` is on the bottom edge of the sourced
band and **below every entry in the eccentric shoe table**. The sourced range is
**Expanded ≈ 1.06–1.13 × casing OD**; **1.10–1.14 lands inside both sources.**

**B11. The HDD rig has the weight of one machine class and the force of
another.** `hdd-rig.md`. `weightKg: 9600` is a **real and accurate** weight — for
a **124.6 kN** machine. The spec claims **330 kN**, whose real-world equivalent
is **23.6 t** on a 9.05 m chassis. Someone took two numbers from two different
rigs. This is `HANDOFF.md` §8B's *"two tables describing one thing"* again, and
it is the third instance found on this run.

**B12. Anchor plate thickness is hard-coded and matches no real plate.**
`tools-anchors-sda.md`. The sourced ladder runs **150 × 150 × 8 mm up to
350 × 350 × 90 mm** — **thickness scales 11× while side scales only 2.3×**, so the
thickness-to-side ratio sweeps from **1:19 to 1:4**. The game uses
**`thicknessMm: 20` for every plate**, which corresponds to **no row on the
ladder**. A 350 mm plate at 20 mm thick would fold.

**B13. The SDA coupler is built 73 % too long at the large sizes.**
`tools-anchors-sda.md`. Sourced coupler length is **140–250 mm across the entire
family** — it **barely scales at all**. The game uses `majorMm * 5`, which builds
a **380 mm** coupler where the real part is **220 mm**. (Its OD ratio of
× 1.36 is fine — sourced is 1.24–1.37. Only the length is wrong.)

### Tier C — a missing feature a driller looks for first

**C1. A Kelly bar has six drive keys and lock recesses between them.**
`tools-kelly-foundation.md` §9.1–9.2. Published: **six per section**, welded flat
strips standing only **17–18 mm proud** in 30 mm and 70 mm widths — a low rail,
not a fin and not a machined spline. **The gaps between the strips are the lock
recesses**, they are the brightest steel on the tool, and they are the only
visual difference between a locking bar and a friction bar. A continuous
unbroken rail is the wrong geometry. **The Kelly is the part a rotary-rig
operator looks at all day.**

**C2. A drilling bucket needs a hinged bottom and a vent pipe.**
`tools-kelly-foundation.md` §9.4. Both are catalogue fitment on every bucket.
Without the vent, a full bucket lifting out of a wet hole is a piston pulling a
vacuum under itself. **A bucket with a solid bottom is not a bucket.**

**C3. The wireline core barrel is missing half its named components.**
`tools-core-dth.md` §9.4. The manufacturer's own walkthrough names ten parts; the
game builds three. Missing, in order of visual value: the **locking coupling with
its stabilizing pads** (worn flat in service, and the only external feature on
that coupling), the **landing ring**, the **inner-tube stabilizer**, the **core
lifter case and core lifter**, and the **reaming shell** — which is not optional,
because it is the diameter the game's own hole sizes are derived from.

**C4. The cable-tool drilling line must be LEFT lay.** `cable-percussion.md`. It
turns the tools right, keeping the joints tight, and its untwist on the drop is
what makes the hole round. **It should be the only left-lay rope in the game.**

**C5. The RC hammer has no shroud.** `tools-core-dth.md` §9.6. The shroud is a
separate, **larger-diameter** sleeve over the hammer body and it is the visible
difference between an RC hammer and a DTH hammer. Sourced at five sizes from
84.1 to 100 mm over an 81 mm body.

**C6. Reaming heads are segmented, and the split lines are free to model.**
`raisebore.md` §9.4. Base head plus two removable segments (or four to six on the
extendable type), bolted together at the collar. The split lines and their bolted
flanges are **lines and bolt circles on a disc that already exists**, and they
tell the entire story of how a 7-tonne head got into an underground chamber.

**C7. Every auger and every bucket carries a fishtail pilot.**
`tools-kelly-foundation.md` §9.8. Standard fitment on both. Small, always there,
and the part that touches the ground first.

**C8. A vibratory hammer has an inverted-U suspension yoke.**
`tools-piling-hammers.md` §9.4. It is the machine's most recognisable feature and
the game does not have it. The game also puts the hose manifold on the wrong face
— at the back near the top, with three hoses, where the reference has a
**six-coupling plate on the side at mid-height** — and draws the eccentric
housings as **cylinders protruding through the case** where the real case has
**flush machined oval pockets in a staggered two-row array**.

**C9. The game's rod threads are single-start; the one rod actually measured is
3-start.** `tools-rods-pipe.md` §1.1. A three-start thread shows **three helices
running side by side**, visually three times as coarse as the pitch alone
suggests. The same drawing shows a **plain guide nose** ahead of the thread that
stabs and aligns before any thread engages — **no rod in the game has one**.

**C10. HDD pipe does not live in a carousel.** `hdd-rig.md`. It lives in
**gravity-fed columns in a box** on the frame, and real on-board capacity is
**28–75 rods**. The shop currently offers a **"220-rod carousel"** — wrong
mechanism and roughly 3–8× the wrong capacity.

**C11. The HDD rig folds its beam DOWN for transport; the game raises it 48°.**
`hdd-rig.md`. The transport pose is backwards.

**C12. The anchor head has one part too many, and the sphere is on the wrong
component.** `tools-anchors-sda.md`. The game builds flat plate + dome +
a separate `'seat'` washer + a flat-ended hex nut. The sourced head is **flat
plate + a cold-formed domed plate + a nut with a spherical end** — three parts,
not four, with the sphere on the *nut*. **And nothing tilts**, which is the
entire reason the spherical seat exists: an anchor is rarely square to the face,
and the ±5° seat is what accommodates that. The tilt is the detail that says
"anchor" rather than "bolt".

**C13. The HDD anchors are power augers, not stakes — and the anchor plate is
also the drip tray.** `hdd-rig.md`. Two patents give the mechanism: two power
augers on a mount pivoting about a transverse axis, one laterally movable to dodge
obstacles. The plate they bear on **doubles as the drilling-fluid collecting
tray**. One part that is simultaneously the load path and the dirt story — and
the best single detail available for making an HDD entry pit read as real.

### Tier D — proportion and scaling errors

**D1. The offshore derrick is 22 % too squat and does not taper enough.**
`oil-derrick.md` §9.A. Sourced height : base = **5.33 : 1** with crown : base =
**0.267** (160 ft on a 30 ft base tapering to 8 ft). The game is **4.13 : 1** and
**0.42** — losing three-fifths of its width where it should lose three-quarters.
Two one-line fixes.

**D2. The impact-hammer length curve is too steep.**
`tools-piling-hammers.md` §9.1. Real: a **10× increase in ram mass buys only
1.62× the length** (exponent ≈ 0.21). The game's exponent is **0.285**, which
makes its 30 t hammer **2.0 m too long** — nearly 10 % of a 21 m leader.

**D3. A vibratory hammer is a slab, not a box.** `tools-piling-hammers.md` §9.4.
Sourced L : H : W ≈ **7.3 : 5.9 : 1**; the game builds **1.7 : 1.9 : 1** and makes
the machine taller than it is long, where every real one is longer than it is
tall.

**D4. An RC hammer is markedly more slender than a DTH hammer.**
`tools-core-dth.md` §9.5. Sourced **14.1 diameters long** against **8.1–9.9** for
a conventional DTH. If the game builds RC on the DTH body proportion it is too
stubby by about 40 %.

**D5. The reaming shell must be a barely-proud band, not a step.**
`tools-core-dth.md` §9.7. It runs **0.15–0.32 mm larger on radius** than the bit
— essentially flush. It does not ream a bigger hole; it holds gauge.

**D6. The raise borer's cutter rings are stepped where the source says the
profile is flat.** `raisebore.md` §9.3. *"All heads have a flat cutting profile,
for smooth rotation and low torque demand"* is the one explicit shape statement
available; the game steps its two cutter rings **120 mm** apart. Flagged as
unverified rather than wrong — but if the step reads in silhouette it contradicts
the only thing the source actually says about the shape.

### Tier E — unsourced numbers printed as fact

`PLATFORM_TRUTH.md` Part C rule 7 requires these to carry `sourced: false` and
never print as fact.

- **`crownHeightMm: 12`** and **`matrixSeries: 'Series 6 (medium-hard)'`** on the
  core bit — neither supported by anything read (`tools-core-dth.md` §9.8).
- **The raise borer's entire envelope** — 26 t, 250 kW, 120 kNm, 2 800 kN thrust,
  4 500 kN pull, 4.6 m column. Not one of these is supported or refuted by any
  source found (`raisebore.md` §8).
- **`weightKg: 9400`** on the cable-percussion rig (`cable-percussion.md` §3d).
- **`slantDeg: 15`** on the HDD pilot head. **No manufacturer publishes the
  slant-face angle at all** (`hdd-rig.md` §8), so this is an invention and is
  flagged as one in that document. Keep the flag.
- **`ultimateLoadKN: 400` on the R38 anchor bar is the YIELD figure, not the
  ultimate.** Ultimate is **500 kN**, confirmed by two independent sources
  (`tools-anchors-sda.md`). This one is not merely unsourced — **it is a wrong
  label on a right number**, which is worse, because it passes a spot check.
- **Every `priceEur` formula.** Game-economy numbers, which is fine — but they
  should not be presented to the player as specifications.

---

## 6. Things the game already gets RIGHT — do not "fix" these

Every round of review costs more when someone "corrects" something that was
already right. These were checked against primary sources on this run and
**confirmed**.

**Verified against a source, and subtle:**

- **The `WIRELINE` table is right, and right for a non-obvious reason.**
  `tools-core-dth.md` §9.1. Every core diameter lands dead centre of its
  tolerance band, and **every hole diameter lands inside the *reaming shell*
  band, not the bit band** — which is correct, because the reaming shell is the
  largest diameter in the string and it is what sizes the hole. **Someone
  "correcting" these to the bit OD would make the table worse.**
- **The `piling-leader` hammer spec block is an exact match to a real 9 t
  hammer** — ram 9 000 kg, 106 kNm, 1 200 mm stroke, 40–100 blows/min, four for
  four (`tools-piling-hammers.md` §9).
- **The DTH thread mapping is four for four** — 4″→API 2⅜, 5″→API 3½, 6″→API 3½,
  8″→API 4½ (`tools-core-dth.md` §9.3).
- **The 200 mm Kelly box** is confirmed by **two independent catalogues**
  (`tools-kelly-foundation.md` §9.9).
- **The raise borer's `pullKn` > `thrustKn`** — correct, and correct for the
  right reason: reaming is a pulling operation. Its **1.5 m pipe**, **254 mm
  stem**, **bolted flange** and **sealed-bearing tricone pilot** are all sourced
  (`raisebore.md` §9.8).
- **The RC bit's drop-centre face and hemispherical carbide** match the source
  exactly (`tools-core-dth.md` §9.5).

**Two warnings that the evidence reversed — recorded because a correction that
turned out to be wrong is worth as much as one that was right:**

- **`entryDeg = 16` is right. Leave it.** `hdd-rig.md` §9-D. An earlier draft of
  that document called it too steep; **eleven manufacturer sheets** then showed
  mid-size HDD rigs are built for **14–21°**, putting 16° dead centre. The
  warning was withdrawn in place rather than deleted.
- **The chain feed is legitimate.** `hdd-rig.md` §9-F. Called "flat wrong" in an
  earlier draft; a patent then described exactly this as a **2:1
  block-and-tackle chain drive**.

**Also confirmed correct on this run:** `buildAnchorBar`'s **3 m default bar
length** and `buildRingBitSystem`'s **lost-ring / retrieved-pilot logic** are both
already right (`tools-anchors-sda.md` §9.12) — recorded so a later pass does not
undo them.

**Well-observed modelling that should be left alone:**

- **The precast pile is octagonal, not square**, with a chamfer *"on every real
  pile"*, close-pitched links at **both** ends, and **mould seams down two
  opposite faces**. A genuinely well-observed model.
- **The pile helmet comment** — *"the helmet must NOT be a tight fit on the pile
  head — it has to let the pile rotate when it hits an obstruction"* — is exactly
  right and is the kind of thing a driller checks.
- **The vibro clamp's serrated grip teeth** (*"a smooth jaw would drop the
  pile"*), `alsoExtracts: true`, and the granular-soils application note.
- **`ramModular: true`** — the ram block really is modular, with 1 t and 2 t
  extension blocks on one frame.
- **The impact hammer's bolted side plates with eleven bolts a side** — a hammer
  is a bolted assembly and it looks like one.
- **The raise borer's `noMastRaise`** and fixed pivot — it is a reaction frame,
  not a mast, and it correctly cannot rake.
- **The raise borer's scattered "pack"** — power pack, control stand and stem
  rack as separate floor objects joined by hoses. That is the hardest thing about
  this machine to get right and it is already right.
- **The parked-reamer comment** in `buildRaisebore` — that on the ream pass the
  head is climbing on the bottom of the string and must not be merged into the
  pad — is correct method and a real bug fix.

---

## 7. Ratios that must not be scaled

Several dimensions in this domain are **constant** or **shrink** with size.
Parameterising them proportionally is the most common way a generated model goes
wrong, and it goes wrong worst on the biggest, most visible tools.

| ratio | the rule | source |
|---|---|---|
| **Auger and bucket head allowance** | **A constant ~615 mm** above the flight or barrel, on every diameter and every length. It is the Kelly box, the spine plate and the lifting eye. **It does not scale.** Scale it and a 2.5 m bucket grows a head four times too tall. | `tools-kelly-foundation.md` §9.5 |
| **Tooth projection on foundation tools** | **50 mm per side up to Ø900**, rising only to **85 mm at Ø1830** — so as a fraction of diameter it **falls from 19 % to 9 %**. Scale it and large tools look like circular saws. | `tools-kelly-foundation.md` §9.6 |
| **Impact hammer length** | Grows as **ram^0.21**. A 30 t hammer is barely longer than a 9 t one; it is much fatter and much heavier. **Scale the section, barely the length.** | `tools-piling-hammers.md` §3 |
| **DTH hammer slenderness** | **Falls** with size: 9.9 diameters at 4″, 8.1 at 8″. Big hammers are relatively stubbier. | `tools-core-dth.md` §3 |
| **Raise-bore cutter spacing** | **Not** a single line through the origin. About **one cutter per 184 mm of diameter above 1.8 m**, but **265 mm per cutter at 1.06 m** — small heads are deliberately sparser. | `raisebore.md` §3 |
| **Raise-bore head weight** | Scales as **D^1.4–1.5**, not D². Big heads are **lightened structures with webs and gullets**, not solid plates — the weight figure is a modelling instruction. | `raisebore.md` §3 |
| **Kelly drive key projection** | **17–18 mm** on tubes from Ø254 to Ø559 — i.e. **7 % of diameter on the smallest bar and 3 % on the largest**. A low rail, and relatively lower as the bar grows. | `tools-kelly-foundation.md` §3 |
| **Auger weight** | Scales with **diameter, not diameter squared** — a flight is a surface, not a volume. A 2.9× diameter increase buys only 2.0× the weight. | `tools-kelly-foundation.md` §3 |
| **Hammer total weight ÷ ram weight** | **Falls** with size: 2.00 at 3 t, 1.50 at 9 t, 1.45 at 16 t. | `tools-piling-hammers.md` §3 |
| **Reaming shell over bit** | A fixed **+0.30 to +0.63 mm on diameter** across the whole size range — it does not scale at all. | `tools-core-dth.md` §3 |
| **Carbide button exposure** | **Exactly 5.0 mm, on every bit in the overburden family.** A Ø10 × 15 mm button seated 10 mm deep with a spherical R5.0 crown is a true hemisphere, so **the tip never projects further than its own radius.** Confirmed twice — stated in the spec, and measured as a bounding-box difference on the CAD model. | `tools-overburden.md` |
| **Percussive casing wall** | **Near-constant at ~12–13 mm** from Ø88.9 to Ø152.4, so bore/OD *rises* from 0.72 to 0.84 as the casing grows. **Not proportional.** | `tools-overburden.md` |
| **Eccentric expanded / retracted** | **Retracted Ø < casing I.D. < casing O.D. < Expanded Ø**, without exception across 46 rows and four system families. Expanded ≈ **1.06–1.13 × casing OD**; Retracted ≈ **0.88–0.93 × casing I.D.**; Expanded ≈ **1.27–1.37 × Retracted**. **This is the checkable rule that would have caught the historic Odex error.** | `tools-overburden.md` |
| **SDA coupler length** | **Barely scales at all — 140–250 mm across the entire bar family.** Its **OD** scales normally (× 1.24–1.37 on the bar), but its length is nearly constant. Multiplying length by thread size builds a coupler 73 % too long at the top of the range. | `tools-anchors-sda.md` |
| **Anchor plate thickness** | **Scales 11× while the plate side scales 2.3×** — 8 mm on a 150 mm plate, 90 mm on a 350 mm plate. Thickness:side sweeps **1:19 → 1:4**, so it is the *thickness* that must be driven by load, not by plate size. | `tools-anchors-sda.md` |
| **Ring-bit over-cut** | **6–18 mm on diameter** (3–9 mm of annulus on radius) — never a fraction of a millimetre. The historic "0.146 mm" claim was wrong by two orders of magnitude. | `tools-overburden.md` |

---

## 8. Process notes

### 8.1 Line numbers in these references will drift

`src/` was being edited by other agents throughout this run —
`rigFactory.js`, `tools.js`, `geology.js`, `terrain.js`, `drilling.js`,
`site.js`, `styles.css` and `gltfRig.js` all changed while the references were
being written. **Every `src/` line number cited in `research/rigs/` is a snapshot
and will be wrong soon.** Re-locate by **function name** (`buildRaisebore`,
`buildImpactHammer`, `WIRELINE`, `IMPACT_HAMMER`), never by line.

Nothing under `src/` was modified by any of the reference work.

### 8.2 A citation error, found in passing — the first hit of the audit HANDOFF §9.8 asks for

`research/16-site-archetypes.md` cites **two** sources for the **1.8–3.0 m
well-slot spacing** on a production platform. Only one of them carries the
number:

- `[DM-PLATFORM]` **does** carry it verbatim, along with the skidding mechanism
  and the "ten to more than forty wells" figure. **Verified.**
- `[OGP-OFFS]` **does not.** It was fetched and checked; it carries the skid-beam
  mechanism but **not the spacing figure**. **That citation needs a one-line
  correction.**

Independent support for the figure arrives from an unrelated direction: an
offshore-engineering handbook gives the API conductor-shielding factor as valid
for spacing/diameter < 4, i.e. **under 2.64 m for a standard 26″ conductor** —
different discipline, same order of magnitude.

This is exactly the failure mode `HANDOFF.md` §8D describes — *"research that
fails against its own sources"* — and it was found by re-opening the primary
document rather than trusting the pack's own voice.

### 8.3 A second source-vs-source discrepancy, recorded rather than smoothed over

The lost-bit catalogue prints **115.8** as the height of the Ø178 size. The
release drawing dimensions the same part at **177.37**, and the native CAD model
measures **177.373**. The catalogue row has transcribed an **intermediate step
height**, not the overall height. **Model 177.4.**

Two independent confirmations against one printed table is exactly the standard
`HANDOFF.md` §8D asks for, and it is only possible because the CAD models were
opened (§1.3).

### 8.4 One trap quarantined rather than used

The same offshore handbook gives a **fully sourced square slot grid at 8–14 ft**
— but it is a **spar centrewell**, spaced by buoyancy-can diameter, not a jacket
well bay. Importing that number onto a fixed platform would be the same category
error as the moonpool it would be trying to fix. **Recorded, not used.**
