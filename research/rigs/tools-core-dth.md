# tools-core-dth — Core barrels, wireline systems and down-the-hole hammers

**Engineering reference for 3D modelling. GEOMETRY AND MATERIALS ONLY.**

status: COMPLETE for the material available locally. Everything unfound is in §8
and must not be invented.

Subject: the in-hole tooling for the game rigs `core-rig`, `rc-rig`,
`dth-crawler` and `crawler-th` — the wireline core barrel assembly, the
impregnated core bit, and the down-the-hole hammer with its bit and its
reverse-circulation cousin. Compared against `src/rig/tools.js`
(`WIRELINE` table l. 2567, `buildCoreBit` l. 2580, `buildCoreBarrel` l. 2700,
`buildDTHHammer` l. 1927, `dth-bit`, `rc-bit`) — **read only, never edited**.

> **NAMING RULE (`DOMAIN.md` §10).** Real manufacturer names and model
> designations appear below ONLY to cite where a dimension came from. **None may
> become a product name, a badge, a laser-etched brand or a stamped model code on
> a game mesh.** Model the shapes; invent the marque.
>
> **The exception, and it matters here:** the letter sizes (AQ / BQ / NQ / HQ /
> PQ), the casing letter sizes (EW / AW / BW / NW / HW / PW), the API pin/box
> designations (2⅜ Reg, 3½ Reg, 4½ Reg) and the hammer shank families are
> **industry standards, not trademarks**. They are sizes, and they are safe to
> show stamped or printed. A driller reads them as sizes and would find their
> absence odd.

> **DIVISION OF LABOUR.** `research/rigs/core-rig.md` (722 lines) covers the
> *machine* — mast, feed, rotation head, rod handling, water system. It contains
> **no DTH content at all** and does not cover in-hole tooling. This document
> covers what goes *down* the hole. `research/rigs/tools-bits-carbide.md` owns
> button and carbide geometry; this document does not duplicate it.

> **METHOD NOTE — PDFs are readable on this machine.** The Read tool's `pages`
> parameter fails with `pdftoppm is not installed`, and an earlier agent recorded
> catalogues as permanently unreadable on that basis. **That is wrong.**
> `pymupdf` (1.28.2) and `pdftotext` are installed. Helper scripts:
> `<scratchpad>/pdfpage.py` (`info` / `text` / `png`) and `<scratchpad>/crop.py`.
> Every figure below came through them. Recorded in `_gaps.md`.

---

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Diamond Driller's Technical Book.pdf` | 36 pp.; indexed by `info`, text p.35, pages 19 and 21 rendered at 160 dpi | **The primary source for coring geometry.** pp.19–21 are **dimensioned axial sections of every core bit size** — bit OD and ID with min/max tolerances, **and the reaming shell OD separately**. p.35 is a table of **diamond coring bit and casing shoe OD / ID / hole volume** for EW through PW. p.21 also carries an excellent **on-site photograph of a core bit on the end of a barrel**. pp.5–13 are drilling parameters and bit-wear diagnosis (RPM, ROP, concave face wear, polished crown, cracked waterways) — behavioural, not geometric, but they name the wear modes used in §6. | **Yes — primary** |
| `C:\Users\henri\Downloads\InHoleTools_Catalog.pdf` | 238 pp.; contents p.3, **system overview pp.18–20** read in full, structure indexed | **The primary source for the core barrel assembly.** pp.18–20 are a **numbered component walkthrough of the whole wireline system** — overshot, locking coupling, adapter coupling, head assembly, landing ring, outer tube, inner tube, inner-tube stabilizer, core lifter case, core lifter — each with a paragraph saying **what it does and why it is shaped that way**. That is exactly a component inventory. The remaining ~200 pages are per-size kit and spare-parts listings with part numbers; useful for a parts count, not for dimensions. | **Yes — primary** |
| `C:\Users\henri\Downloads\Epiroc DTH product catalog.pdf` | 42 pp.; indexed, **pp.20–21 read in full** | **The primary source for DTH hammer geometry.** p.20 states the **hole-size rule** in the manufacturer's own words. p.21 is a full table: **thread connection, outside diameter, recommended hole size, shank style, working pressure, length without bit and weight without bit** for the 4″ through 8″ range including heavy-duty variants. pp.8–19 map **shank family to bit diameter**; pp.30–33 are drill pipe (belongs to `tools-rods-pipe`). | **Yes — primary** |
| `C:\Users\henri\Downloads\RC_Hammer_Catalogue.pdf` | 9 pp.; p.1 read | A **reverse-circulation hammer datasheet**: hammer OD, hole size, top thread, total length without bit, plus **shroud** sizes and a **bit table with face configuration and carbide design**. Small file, high density. The RC/DTH contrast in §3c comes entirely from here. | **Yes** |
| `C:\Users\henri\Downloads\Mincon - Minroc MQ Imlochhammer Range.pdf` | 2 pp.; both read | **A two-page marketing leaflet with no dimension table.** It does name real construction features that are visible or that explain visible ones: *"hardened wear sleeve"*, *"multi-start threads on backhead and chuck"*, *"valveless, high frequency design"*, *"common shanks with the foot valve removed"*, *"fewer internal components"*. Worth having for the component names; **useless for geometry**, and I am saying so plainly. | Marginal |
| `src/rig/tools.js` — `WIRELINE` (l. 2567), `buildCoreBit` (2580), `buildCoreBarrel` (2700), `buildDTHHammer` (1927), `dth-bit` (1910), `rc-bit` (6664) | as cited | The current game tools, compared in §9. **Read only.** | Yes (as the subject) |
| `Mincon - Minroc - DTH_Product_Catalogue.pdf`, `Mincon-RC-Solutions-2025-A4-WEB.pdf`, `dth_catalog_digital_version_eng_2023.pdf`, `DTH Hammers & DTH Bits.pdf`, `DTH-HAMMER.pdf`, `潜孔全英文版本180628.pdf`, `Reverse-Circulation-Tools.pdf`, `13.1–13.5 BWH water-powered DTH datasheets`, `Epiroc Guide to Diamond Tools.pdf`, `Epiroc Guide choosing right core bit.pdf`, `Epiroc guide Extending core bit life.pdf`, `Diamond_Bits_Catalogue.pdf`, `Mineral Exploration Tooling - Catalog.pdf`, `Xploration+Products+…` | **indexed, NOT read** | Fourteen further catalogues on exactly this subject. Enough was found in the four above to write a confident document, and reading all fourteen would have been low marginal value — but the **five water-powered DTH datasheets** are a genuinely different machine that nothing in the library covers, and the RC catalogues would deepen §3c. Recorded honestly; carried into `_gaps.md`. | Not read |

---

## 2. What these tools ARE

### 2a. The wireline core barrel — a tube inside a tube

The point of wireline coring is that **the core comes out without pulling the
rods**. The string is a drill rod with an **outer tube** on the bottom carrying
the bit; inside it, held stationary while the outer tube rotates, is an **inner
tube** that fills with core. When it is full, an **overshot** is dropped or
pumped down on a cable, latches onto the inner tube's spearhead, and hauls just
that inner tube back to surface. The rods never move.

Two consequences a modeller must respect:

1. **Every part of this system is a slender concentric tube.** There is nothing
   chunky about it. The whole assembly is an ~1.5–3 m string of cylinders whose
   diameters differ by a few millimetres.
2. **The inner tube does not rotate.** It hangs in a bearing in the head
   assembly. That is the single most important behavioural fact about the
   assembly and it is what protects the core.

### 2b. The impregnated core bit

A short steel **blank** with a **crown** on the end — a band of synthetic diamond
in a tungsten-carbide matrix, cut through by **waterways** so flushing water can
get to the face and cuttings can get away. The crown wraps around **both** the
outside and the inside gauge, because the bit has to hold size on the hole *and*
on the core.

**Behind the bit sits a reaming shell** — a short sleeve set slightly larger in
diameter than the bit, whose job is to hold the hole to gauge as the bit wears.
**It is the largest diameter in the string, and it is what actually defines the
hole.** See §3a; this is the detail almost everyone gets backwards.

### 2c. The down-the-hole hammer

A **piston hammering directly on the back of the bit, at the bottom of the hole.**
Compressed air comes down the pipe, drives the piston, and exhausts through the
bit to flush the cuttings up the annulus. Because the hammer is *at* the bit,
energy does not have to travel down a rod string — which is why DTH beats top
hammer below about 90 mm and out to great depth.

The manufacturer's own rule, verbatim (`Epiroc DTH product catalog.pdf` p.20):

> *"As a rule of thumb, the smallest hole diameter a DTH hammer can drill is its
> nominal size. A 4 inch hammer will drill a 4 inch (102 mm) hole. **The limiting
> factor is the outside diameter of the hammer**, because, as hole diameter
> reduces, airflow is restricted. Maximum hole size for production drilling is
> the nominal hammer size plus 1 inch."*

And the working window: *"The optimum range of hole size for blast hole drilling
with DTH is 90 mm to 254 mm (3½″–10″). Smaller blast holes are generally drilled
using tophammer, and larger holes generally use rotary machines."* (`ibid.` p.20)

**Read that first sentence again before modelling a hammer.** It says the
hammer's OD is the constraint — so the hammer must be visibly *narrower* than the
hole it is in. §9.2 is about the game failing this test.

Externally a DTH hammer is a **plain hard cylinder** with:
- a **backhead** at the top carrying the API pin that screws into the pipe;
- a **wear sleeve** — the main body, hardened, and on the heavy-duty variants
  fatter than the standard one;
- a **chuck** at the bottom that retains the bit's splined shank;
- **multi-start threads on backhead and chuck** (`Mincon…MQ` p.2) so the joints
  make up in a fraction of a turn;
- and essentially **no other external features at all**. Its blankness is its
  identity.

### 2d. The reverse-circulation hammer

Same principle, but the sample comes back **up the middle** instead of up the
annulus, through a dual-wall pipe, so the sample is uncontaminated by the hole
wall. That forces two visible differences: the bit has **sample ports through its
face**, and the hammer wears a **shroud** — a separate sleeve, **larger in
diameter than the hammer body**, that seals against the hole wall. It also makes
the hammer much more slender for its diameter (§3c).

---

## 3. Proportions

### 3a. Core bit, core and reaming shell — the sourced ladder

Source: `Diamond Driller's Technical Book.pdf` **pp.19–21**, dimensioned axial
sections with min/max tolerances. Rendered: `<scratchpad>/pdfpages/ddtb_p019.png`
and `ddtb_p021.png`.

| designation | bit OD (hole) max / min mm | bit ID (core) max / min mm | **reaming shell OD** max / min mm | kerf per side (mm) |
|---|---|---|---|---|
| thin-kerf 46 | 46.12 / 45.87 | 35.41 / 35.15 | **46.42 / 46.17** | 5.4 |
| thin-kerf 48 | 47.75 / 47.50 | 35.41 / 35.15 | **48.13 / 47.88** | 6.2 |
| A-series conventional | 47.75 / 47.50 | 27.10 / 26.85 | **48.13 / 47.88** | 10.3 |
| A-series thin wall | 47.75 / 47.50 | 30.43 / 30.18 | **48.13 / 47.88** | 8.7 |
| B-series thin wall | 59.69 / 59.44 | 42.14 / 41.88 | **60.07 / 59.82** | 8.8 |
| B-series conventional | 59.69 / 59.44 | 36.53 / 36.27 | **60.07 / 59.82** | 11.6 |
| H-series conventional | 95.76 / 95.38 | 63.63 / 63.38 | **96.27 / 95.89** | 16.1 |
| P-series triple-tube | 122.30 / 121.80 | 83.19 / 82.93 | **122.81 / 122.43** | 19.6 |
| P-series conventional | 122.30 / 121.80 | 85.09 / 84.84 | **122.81 / 122.43** | 18.6 |

Casing shoes and the matching hole (`ibid.` p.35):

| size | OD / hole diameter | ID | hole volume |
|---|---|---|---|
| EW | 47.63 mm | 37.97 mm | 178.1 l/100 m |
| AW | 59.56 | 48.26 | 278.6 |
| BW | 75.31 | 60.38 | 445.5 |
| NW | 91.82 | 76.20 | 662.2 |
| HW | 117.48 | 99.70 | 1 083.9 |
| PW | 143.51 | 123.27 | 1 617.5 |
| HWT | 117.48 | 101.09 | 1 083.9 |

### 3b. DTH hammers — the sourced ladder

Source: `Epiroc DTH product catalog.pdf` **p.21**.

| nominal | **OD (mm)** | recommended hole (mm) | **length w/o bit (mm)** | **weight w/o bit (kg)** | top thread | working pressure |
|---|---|---|---|---|---|---|
| 4″ | **100** | 110 – 130 | **994** | **49** | API 2⅜ Reg Pin | 6 – 25 bar |
| 5″ | **117** | 130 – 152 | **1 067** | **60** | API 3½ Reg Pin | 6 – 24 bar |
| 6″ | **138** | 152 – 191 | **1 132** | **91** | API 3½ Reg Pin | 6 – 24 bar |
| 6″ heavy-duty | **146** | 165 – 191 | **1 132** | **111** | API 3½ Reg / BECO 3½ Pin | 6 – 24 bar |
| 8″ | **181** | 200 – 305 | **1 461** | **203** | API 4½ Reg Pin | 6 – 24 bar |
| 8″ heavy-duty | **194** | 216 – 305 | **1 461** | **250** | API 4½ Reg / BECO 4½ Pin | 6 – 24 bar |

### 3c. The reverse-circulation hammer, for contrast

Source: `RC_Hammer_Catalogue.pdf` p.1, one machine:

- **Hammer OD 81 mm · standard hole size 90 mm · total length without bit
  1 142 mm · top thread 3 inch Remet.**
- **Shrouds** available at **84.1 / 87.3 / 90.5 / 93.7 / 100 mm** — i.e. a family
  of sleeves stepping the hammer's effective diameter up from 81 mm to as much as
  100 mm.
- **Bits** at **86 / 88.9 / 90 / 95.2 mm**, all with a **drop-centre face** and
  **hemispherical carbide**.

**The contrast that matters:** at 81 mm OD and 1 142 mm long this RC hammer has a
**length-to-diameter ratio of 14.1**, against **8.1–9.9** for the conventional
DTH hammers above. **An RC hammer is markedly more slender**, because the sample
tube runs up its middle. Do not model them at the same proportion.

### ★ Ratios a modeller can actually use

1. **The reaming shell — not the bit — is the largest diameter in a coring
   string.** It runs **+0.30 to +0.63 mm on diameter** over the bit OD across the
   whole range (46.42 vs 46.12; 96.27 vs 95.76; 122.81 vs 122.30). That is
   **0.15–0.32 mm on radius** — a hair. It does **not** ream a bigger hole; it
   holds gauge. **Model it as a barely-proud band, not a step.**
2. **A core bit's kerf grows from 5.4 mm to 19.6 mm** across the range, and as a
   fraction of the bit OD it stays remarkably steady at **12–19 %**. A core bit is
   a thin ring, not a thick-walled tube.
3. **Thin-kerf vs conventional is a real, visible distinction.** At the same
   47.75 mm OD, a thin-wall bit's kerf is **6.2 mm** and a conventional one's is
   **10.3 mm** — a **66 % difference in the width of the cutting band**, at
   identical outside diameter.
4. **A DTH hammer is 8–10 × longer than its diameter**, and the ratio **falls**
   with size: 9.9 at 4″, 9.1 at 5″, 8.2 at 6″, 8.1 at 8″. Big hammers are
   relatively stubbier.
5. **A DTH hammer is always narrower than its hole**, by the manufacturer's own
   rule. At the minimum recommended hole the annulus is only
   **5 mm per side at 4″** (100 in 110), **6.5 mm at 5″**, **7 mm at 6″** and
   **9.5 mm at 8″**. **It is a very tight fit and it must look like one.**
6. **Hammer weight scales as roughly OD² × length**: 49 kg at Ø100 × 994, 203 kg
   at Ø181 × 1 461. Predicted 4.8×, actual 4.1×.
7. **The heavy-duty variant is the same length, ~7 % fatter and ~23 % heavier.**
   Heavy-duty chuck and wear sleeve, nothing else changed. A good, cheap variant
   to build from one base mesh.
8. **An RC hammer is ~14 × longer than wide** — nearly half again as slender as a
   conventional DTH of the same class.
9. **An RC shroud steps the diameter up by 4–24 %** over the bare hammer
   (81 → 84.1…100 mm). It is a *separate* visible sleeve, not the hammer body.
10. **Casing ID is 70–86 % of casing OD** across the EW–PW range (37.97/47.63 =
    0.80; 123.27/143.51 = 0.86). Coring casing is thin-walled and gets relatively
    thinner as it grows.

---

## 4. Component inventory

### 4a. The wireline core barrel assembly, top to bottom

From `InHoleTools_Catalog.pdf` **pp.18–20**, which numbers and describes each part.

| # | Part | What it does, and why it matters visually |
|---|---|---|
| 1 | **Overshot** | Dropped or pumped down the string on a **wireline cable** to retrieve the inner tube. It is a separate object that lives on the rig floor or on the cable, not part of the string. |
| 2 | **Locking coupling** | Connects the drill string to the outer-tube assembly and gives the head-assembly latches a surface to ride against. **It carries wear-resistant stabilizing pads that wear down against the hole wall** — so it has *visible pads on its outside*, unlike a plain coupling, and they are worn flat on a used one. |
| 3 | **Adapter coupling** | Mates between the locking coupling and the outer tube, providing the pocket the latches deploy into. **Not required on the newer roller-latch assemblies** — so its presence or absence dates the system. |
| 4 | **Head assembly** | The most complex object in the string: latching and pivoting **spearpoint** mechanisms, a **bearing** that lets the inner tube stay stationary while the outer tube turns, fluid-pressure indication, and a **shut-off valve that signals the driller when the inner tube is full or blocked**. |
| 5 | **Landing ring** | Sits in the upper end of the outer tube; the head assembly's landing shoulder strikes it and that sets the inner tube into drilling position. A thin ring, easily missed, and the reason the assembly stops where it does. |
| 6 | **Outer tube** | Houses the inner tube and connects to the bit. *"The increased wall thickness of the outer-tube provides additional rigidity for directional control and a tighter hole annulus."* **Multiple outer tubes can be coupled** to extend the run. |
| 7 | **Inner tube** | Captures the core. **Also extensible with couplers.** |
| 8 | **Inner-tube stabilizer** | Seated in the reaming shell or in a mated outer-tube extension. **Replaceable and reversible** — centralises the inner tube and acts as the bearing between the stationary inner and the rotating outer. |
| 9 | **Core lifter case** | Mates to the inner tube and **houses the core lifter in a tapered socket**. On a core break it bottoms out inside the bit and transfers the pull-back load to the lifter. |
| 9 | **Core lifter** | *"a hardened steel, split collar with a tapered body"* that mates to the tapered socket. It is the part that actually grips and snaps the core. Small, and the whole run fails without it. |
| — | **Reaming shell** | Between the outer tube and the bit; holds gauge (§3a). |
| — | **Core bit** | The crown. |

### 4b. The core bit itself

**Steel blank with a wireline thread up the bore → an outer gauge band of matrix
→ the crown face, cut into segments by waterways → an inner gauge band of
matrix.** The dimensioned sections on `ddtb_p019.png` draw the matrix as
cross-hatched bands wrapping **both** shoulders, with a **sawtooth/crenellated
face** between them — that crenellation is the waterways, and it is the bit's
whole silhouette.

### 4c. The DTH hammer

**Backhead (API pin at the top) → wear sleeve / outer body → chuck → bit shank
retained in the chuck.** Internally: piston, cylinder and air distribution — none
of it visible. Named external features from `Mincon…MQ` p.2: **hardened wear
sleeve**, **multi-start threads on backhead and chuck**.

**There is nothing else on the outside.** No fins, no ports, no fittings. A DTH
hammer is one of the cleanest objects in the whole fleet, and that is what makes
it read as a DTH hammer.

### 4d. The RC hammer

**Backhead → body → shroud (a separate, larger-diameter sleeve) → chuck → bit
with sample ports through its face.** The shroud is the visible difference and it
comes in a size ladder of its own (§3c).

---

## 5. Distinctive features (thumbnail silhouette test)

1. **A core bit is a short ring with a crenellated face.** The waterway slots cut
   up from the face are the whole read. Both gauges carry a visible band of
   matrix in a different material from the blank.
2. **A DTH hammer is a featureless hard cylinder 8–10 diameters long**, with a
   thread at each end and nothing in between. If it has ports, fins or fittings on
   its body it is not a DTH hammer.
3. **A DTH hammer is visibly narrower than its hole**, with 5–10 mm of annulus per
   side at the tight end. Bit gauge > hammer OD, always.
4. **An RC hammer is the same cylinder made half again as slender**, wearing a
   sleeve that is *fatter* than the body it sits on.
5. **A wireline core string is concentric tubes whose diameters differ by
   millimetres.** Inner tube, outer tube, reaming shell, bit — four diameters
   within a few per cent of each other. The only chunky object in the whole
   system is the head assembly.

---

## 6. Materials, paint, and where wear and dirt accumulate

**The photograph on `ddtb_p021.png`** (a bit and barrel lying on the ground beside
a pipe wrench, a boot in frame) is the best material reference available:

- **The bit body is dark** — a black or blued coating over the steel blank, with
  the matrix crown a distinctly different, lighter, grainier material at the face.
- **The tube behind it is pale** — bright worn steel with a **whitish film of rock
  flour and dried drilling fluid**, crossed by **dark longitudinal scratch lines**
  from the hole wall. This pale, chalky, scratched look is what a coring string
  actually looks like in the field, and it is nothing like clean steel or rust.
- **The ground around it is rock chips and fine grey-white dust.**

**Where wear actually is:**

- **Core bit outer gauge** — worn back first; a bit at end of life has lost its
  outer gauge and will no longer hold hole size.
- **Core bit face** — the named failure modes (`Diamond Driller's Technical Book`
  pp.10–13) are worth modelling as wear states because they are visually
  distinct: **optimum wear** (an even, slightly rough face), **concave face wear**
  (the middle of the crown dished out), **polished crown** (a glazed, mirror-like
  face — the diamonds have stopped cutting), and **cracks in the waterways**
  (radial splits running up from the slots).
- **Reaming shell OD** — polished bright, because holding gauge *is* rubbing.
- **Locking coupling stabilizing pads** — worn flat, the only worn feature on an
  otherwise plain coupling.
- **Core lifter and its tapered socket** — polished, and the lifter is a
  consumable that gets replaced constantly.
- **Inner tube bore** — smeared with rock flour, ringed where core has sat.
- **DTH hammer wear sleeve** — **polished in a band around the middle** where it
  rubs the hole wall, and scored longitudinally. The ends stay comparatively dull.
- **DTH backhead and chuck threads** — thread grease, black and dirt-laden, is
  visible at every made-up joint; a **thread compound** is a catalogued
  consumable in its own right (`Epiroc DTH product catalog.pdf` p.27).
- **DTH chuck face** — hammered and peened where the bit shoulder strikes it.
- **RC shroud** — the sacrificial part; worn thin and eventually holed.
- **Bit shank splines** — bright, with the retaining-ring groove the brightest
  feature on the whole bit.

**Materials:** hardened and heat-treated alloy steel throughout — *"all critical
internal components are heat treated under strict control"* (`Mincon…MQ` p.2).
Tungsten-carbide matrix with impregnated synthetic diamond on core bits;
tungsten-carbide buttons on DTH and RC bits. **Nothing in this family is
painted.** Every one of these tools is bare, coated or blued steel. A painted
DTH hammer would be wrong.

---

## 7. Photo references

**Rendered from source PDFs** (regenerate with `<scratchpad>/pdfpage.py png`):

| Image | From | What it gives |
|---|---|---|
| `ddtb_p019.png` | `Diamond Driller's Technical Book.pdf` p.19, 160 dpi | **Dimensioned axial sections** of six core bit sizes with bit OD, bit ID and **reaming shell OD** separately, each with min/max. The drawing convention also shows how the matrix wraps both gauges around a crenellated face. |
| `ddtb_p021.png` | `ibid.` p.21, 160 dpi | Three more sizes (H and P series) **plus the field photograph** described in §6 — the single best material reference for a coring string. |

**Photographs in `C:\Users\henri\Downloads`:** see `_photos.md`. Two files whose
names point squarely at this subject and which this agent did **not** open:
`dth-bits-1024x683.jpg` and `carbide_info.png` / `carbide_buttons_weights.png` /
`carbide_buttons_cost_eur.png`. They are catalogued in `_photos.md`; the carbide
files also belong to `tools-bits-carbide.md`.

---

## 8. NOT SOURCED

1. **Core barrel assembly lengths.** The catalogue lists kits at **1.5 m / 5 ft**
   and other lengths by part number, but I did not extract a length table.
   `tools.js` defaults to `lengthMm: 1500`, which is consistent with the 1.5 m kit
   name — but that is a **name**, not a dimension I read off a drawing.
2. **Head assembly dimensions.** Described in words, never dimensioned in the
   pages read. Its length, diameter and the spearhead's shape are unsourced.
3. **Overshot dimensions and shape.**
4. **Inner and outer tube wall thicknesses.** The catalogue says the outer tube
   has *"increased wall thickness"* but gives no figure anywhere I read.
5. **Reaming shell length.** Its **diameter** is precisely sourced; **how long it
   is** is not.
6. **Waterway count, width and depth on a core bit.** Visible as a crenellation in
   the drawings; never counted or dimensioned. `tools.js` parameterises
   `segments`; nothing here validates any number.
7. **Crown height.** `tools.js` asserts `crownHeightMm: 12`. **No source read
   supports or refutes it.** Treat as unverified.
8. **Matrix series / hardness mapping.** `tools.js` asserts `'Series 6
   (medium-hard)'`. The technical book has a matrix selection chart on p.2 that I
   did not extract.
9. **3″ DTH hammer.** The sourced table starts at 4″. The game's 3″ row has no
   source at all.
10. **10″ and larger DTH hammers**, and the whole rotary crossover above 254 mm.
11. **DTH hammer internal geometry** — piston, cylinder, valving. Invisible, so
    low priority, but genuinely unsourced.
12. **Air consumption and blow-rate figures** for DTH.
13. **Water-powered DTH hammers.** Five datasheets sit unread in `Downloads`
    (`13.1`–`13.5 BWH…WAI35/40/50/60/80`). A water-powered hammer is a genuinely
    different machine and **nothing in the reference library covers it.**
14. **RC dual-wall pipe geometry.** Belongs to `tools-rods-pipe.md`; flagged here
    because the RC hammer is meaningless without it.
15. **The other fourteen catalogues listed in §1 as not read.**

---

## 9. Domain-truth warnings — what the game currently gets wrong

Read from `src/rig/tools.js`. **Read only; nothing edited.** Ranked.

### 9.1 The `WIRELINE` table is RIGHT — and right for a subtle reason. Do not "fix" it.

| size | game hole | game core | sourced bit OD band | sourced core ID band | **sourced reaming-shell OD band** |
|---|---|---|---|---|---|
| AQ | 48.0 | 27.0 | 47.50 – 47.75 | 26.85 – 27.10 | **47.88 – 48.13** |
| BQ | 60.0 | 36.5 | 59.44 – 59.69 | 36.27 – 36.53 | **59.82 – 60.07** |
| HQ | 96.0 | 63.5 | 95.38 – 95.76 | 63.38 – 63.63 | **95.89 – 96.27** |
| PQ | 122.6 | 85.0 | 121.80 – 122.30 | 84.84 – 85.09 | **122.43 – 122.81** |

**Every core diameter lands dead centre of its tolerance band. Every hole
diameter lands inside the *reaming shell* band — not the bit band.** That is the
correct choice: the reaming shell is the largest diameter in the string and it is
what sizes the hole (§3a, ratio 1). Someone who "corrects" these to the bit OD
would be making the table **worse**. Record this as verified and leave it.

*(NQ 75.7 / 47.6 was not among the sizes drawn on the pages read, so it is
unverified rather than confirmed. It sits consistently in the same series.)*

### 9.2 Every DTH hammer in the game is oversized — and three of five cannot fit their own hole

`buildDTHHammer` (`tools.js` l. 1930):

```
'3in': { od: 85,  len: 900,  thread: 'API238', shank: 'DHD3'  },
'4in': { od: 108, len: 1050, thread: 'API238', shank: 'DHD35' },
'5in': { od: 133, len: 1180, thread: 'API312', shank: 'QL5'   },
'6in': { od: 159, len: 1320, thread: 'API312', shank: 'QL6'   },
'8in': { od: 210, len: 1600, thread: 'API412', shank: 'QL6'   },
```

Against the sourced table:

| size | game OD | real OD | error | game length | real length | error |
|---|---|---|---|---|---|---|
| 4″ | 108 | **100** | **+8.0 %** | 1 050 | **994** | +5.6 % |
| 5″ | 133 | **117** | **+13.7 %** | 1 180 | **1 067** | +10.6 % |
| 6″ | 159 | **138** | **+15.2 %** | 1 320 | **1 132** | +16.6 % |
| 8″ | 210 | **181** | **+16.0 %** | 1 600 | **1 461** | +9.5 % |

**And now the part that a driller would laugh at.** The manufacturer's rule is
that the hammer's OD is the limiting factor on hole size. Compare each game
hammer's OD against the **minimum recommended hole for its own size class**:

| size | game hammer OD | minimum recommended hole | verdict |
|---|---|---|---|
| 4″ | 108 | 110 | fits, 1 mm per side |
| 5″ | **133** | **130** | **DOES NOT FIT** |
| 6″ | **159** | **152** | **DOES NOT FIT** |
| 8″ | **210** | **200** | **DOES NOT FIT** |

**Three of the game's five DTH hammers are physically larger than the smallest
hole their own class is specified to drill.** This is exactly the failure pattern
`HANDOFF.md` §8E already names — *"an Odex eccentric that could not have come out
of its own hole"* — repeating in a different tool family. **Read the figure off
the mesh.**

**The good news:** the game's **length-to-diameter ratios** are close to correct
(10.6 / 9.7 / 8.9 / 8.3 / 7.6 against a real 9.9 / 9.1 / 8.2 / 8.1). **The shape
is right; both dimensions are simply scaled up together.** Multiplying every OD
and length by about **0.88** would put the whole table on the sourced numbers and
preserve the proportions.

### 9.3 The thread mapping is exactly right — keep it

Game: 4″ → API 2⅜, 5″ → API 3½, 6″ → API 3½, 8″ → API 4½.
Sourced: 4″ API 2⅜ Reg Pin, 5″ API 3½ Reg Pin, 6″ API 3½ Reg Pin, 8″ API 4½ Reg
Pin. **Four for four.** Leave it alone.

### 9.4 The core barrel is missing half its named components

`buildCoreBarrel` (l. 2700) builds a **head assembly, a split chrome-lined inner
tube and a twin spring latch**. The manufacturer's own component walkthrough
(`InHoleTools_Catalog.pdf` pp.18–20) names ten parts. Missing from the game, in
order of visual value:

- **the locking coupling with its stabilizing pads** — visible pads on the
  outside, worn flat in service, and the only external feature on that coupling;
- **the landing ring** — the thing that stops the assembly where it stops;
- **the inner-tube stabilizer** — replaceable and reversible;
- **the core lifter case and core lifter** — the split tapered collar that
  actually breaks the core;
- **the reaming shell** — and this one is not optional, because it is the
  diameter the game's own `WIRELINE` hole sizes are derived from (§9.1).

### 9.5 The RC bit face and carbide are confirmed — keep them

`rc-bit` asserts `face: 'Drop centre'` and `buttonKind: 'spherical'`.
`RC_Hammer_Catalogue.pdf` p.1 lists every RC bit in the range with **bit face
configuration "Drop Centre"** and **carbide design "Hemispherical"**. That is a
direct match. Keep it.

**But the RC hammer's proportion should be checked**: a real RC hammer at Ø81 mm
is **1 142 mm long — 14.1 diameters**. If the game builds RC on the same body
proportion as a conventional DTH hammer (8–10 diameters), it is too stubby by
about 40 %.

### 9.6 The RC shroud is missing

The sourced RC hammer offers **five shroud sizes from 84.1 to 100 mm** over an
81 mm body. The shroud is the visible difference between an RC hammer and a DTH
hammer, and it is a **separate, larger-diameter sleeve**. Nothing in
`buildDTHHammer` or `rc-bit` corresponds to it.

### 9.7 The reaming shell should be a barely-proud band, not a step

If any mesh models the reaming shell, it must be **0.15–0.32 mm larger on
radius** than the bit — i.e. essentially flush. Modelling it as a visible
shoulder would be wrong in the way that ends up in a review.

### 9.8 `crownHeightMm: 12` and `matrixSeries: 'Series 6'` are unverified

Both are asserted as facts in the `core-bit` spec block and **neither is supported
by anything read here** (§8.7, §8.8). Per `PLATFORM_TRUTH.md` Part C rule 7 they
should either be sourced or carried as unsourced — they should not print as fact.

### 9.9 Nothing in this family is painted

Every tool here is bare, coated or blued steel. If any of these meshes reaches
for `paintedSteel`, it is wrong. The correct look is the **pale, chalky,
scratched, rock-flour-filmed steel** in `ddtb_p021.png`, and a dedicated surface
for that would serve the whole coring and DTH fleet.
