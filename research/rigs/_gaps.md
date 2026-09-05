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

- **§1 The tooling unlock** — three capabilities the library was written without,
  two of which had been recorded as permanently impossible. Read this first; it
  changes what a follow-up run can do.
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

### 1.2 The session's WebSearch budget is exhausted

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

*(Rows for `hdd-rig`, `tools-overburden`, `tools-bits-carbide`, `tools-rods-pipe`
and `tools-anchors-sda` are appended when those documents land.)*

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
- **Five water-powered DTH datasheets**: `13.1`–`13.5 BWH-MWH-wasserbetriebener-Imlochhammer-WAI35/40/50/60/80-EN`.
  **Nothing in the library covers water-powered DTH.**
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

### 4.4 What one photo trip would fix, in priority order

1. **Anything underground** — closes four ids at once (§4.1).
2. **A reaming head on the floor with a person for scale** — the memorable object
   of `raisebore`, completely unsourced visually.
3. **An offshore drilling unit** — closes the whole of `oil-derrick` §6.
4. **A cable-percussion tripod** — closes a document currently resting on one
   period engraving.
5. **A core rig and an RC rig working** — two substantial references with no
   photograph behind them.

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

*Filled in below once the last documents land.*

---

## 6. Things the game already gets RIGHT

*Filled in below once the last documents land.*

---

## 7. Ratios that must not be scaled

*Filled in below once the last documents land.*

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

### 8.3 One trap quarantined rather than used

The same offshore handbook gives a **fully sourced square slot grid at 8–14 ft**
— but it is a **spar centrewell**, spaced by buoyancy-can diameter, not a jacket
well bay. Importing that number onto a fixed platform would be the same category
error as the moonpool it would be trying to fix. **Recorded, not used.**
