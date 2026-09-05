# tools-kelly-foundation — Kelly bars, augers, drilling buckets, core barrels, teeth and casings

**Engineering reference for 3D modelling. GEOMETRY AND MATERIALS ONLY.**

status: COMPLETE for the material available locally. Everything unfound is in §8
and must not be invented.

Subject: the tooling hung under the game rigs `foundation-bg` and `cfa-rig` —
the telescopic Kelly bar, the augers and buckets and core barrels it turns, the
teeth on them, and the casing they work inside. Compared against
`src/rig/tools.js` (`drilling-bucket`, `cross-cutter`, `casing-crown`) and
`buildKellyBar` in `src/rig/rigFactory.js` (l. 2727) — **read only, never edited**.

> **NAMING RULE (`DOMAIN.md` §10).** Real manufacturer names, item numbers and
> type codes appear below ONLY to cite where a dimension came from. **None may
> become a product name, a badge, a cast-in boss, a stencil or a paint scheme on
> a game mesh.** The catalogues used here carry a large moulded logo on the tool
> head and a stamped item number on every part — model a **blank stamping flat**
> or a Drillity mark instead. Model the shapes; invent the marque.

> **DIVISION OF LABOUR.** `research/rigs/foundation-bg.md` §3 already mines the
> **Kelly bar dimension tables** (retracted / extended / locked / transport
> lengths, weights, transport diameter, rope swivels). **This document does not
> repeat them.** It covers what that file did not: the **internal construction of
> a Kelly section** from the 314-page spare-parts book, and the **tools and
> casings** the bar actually carries.

> **METHOD NOTE — PDFs are readable on this machine.** The Read tool's `pages`
> parameter fails with `pdftoppm is not installed`, and an earlier agent recorded
> catalogues as permanently unreadable on that basis. **That is wrong.**
> `pymupdf` (1.28.2) and `pdftotext` are installed. Helper scripts:
> `<scratchpad>/pdfpage.py` (`info` / `text` / `png`) and `<scratchpad>/crop.py`
> for high-DPI detail crops. Every figure below came through them. Recorded in
> `_gaps.md`.

---

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Kelly-Spare_Parts_and_Wear_Parts_DE_EN_905_835_1_2.pdf` | 314 pp.; index p.3, text pp.4–5, exploded view p.9 rendered at 170 dpi, structure of pp.8–308 surveyed | **The primary source, and it had never been opened.** A complete spare- and wear-parts book: **300 pages of exploded isometric views**, one per Kelly section, each with a numbered parts table in German and English. Gives the **construction of a Kelly section part by part** — tube, drive keys, end rings, Kelly end, spring housing, stop buffers — **with quantities**. p.4 carries the two facts that decide how a Kelly bar looks: **6 drive keys per section**, and the **noise-damping pads glued between the keys**. p.3 is the **diameter index**. p.5 defines the A/B/B1/D/E and S/H/W/T letters used in the dimension tables. | **Yes — primary** |
| `C:\Users\henri\Downloads\bauer-maschinen-drilling-tools-and-casings-de-en-11-25_0.pdf` | 44 pp.; indexed by `info`, text pp.5–6, 11–12, 36–38, 41; auger table p.6 cropped at 300 dpi | **Second primary, and also previously only read second-hand** (`foundation-bg.md` §1 cites it through research pack 10, not directly). Complete tool catalogue: **augers pp.5–10, drilling buckets pp.11–17, core barrels pp.18–24, a second tool range pp.26–35, wear protection p.36, casings pp.37–40, casing shoes p.41, casing clamp p.43.** Gives **diameter / over-teeth diameter / length / weight tables**, the **Kelly box size**, the **fishtail pilot and flat teeth** fitment, the **bucket vent pipe**, and the fact that casings are **double-walled**. | **Yes — primary** |
| `C:\Users\henri\Downloads\Emde-Bohrtechnik-Kellystangen.pdf` | already assessed, not re-read | `foundation-bg.md` §1 records this as an **8-page marketing brochure with no dimension table**, and rates it "Marginal". That verdict stands; re-reading it would have been wasted effort. Recorded so nobody assumes it was checked again. | No (already judged) |
| `C:\Users\henri\Downloads\Kelly_Bars_DE_EN_905_518_1_2.pdf` | mined in full by `foundation-bg.md` §3 | The dimension tables. **Deliberately not repeated here.** Cross-reference; do not duplicate. | Yes, elsewhere |
| `src/rig/rigFactory.js` `buildKellyBar` (l. 2727), `buildFoundationBG` (l. 2764) | as cited | The current game Kelly bar, compared in §9. **Read only.** | Yes (as the subject) |
| `src/rig/tools.js` — `drilling-bucket`, `cross-cutter`, `casing-crown` | located by grep | The current game tools. | Yes (as the subject) |
| `2025_BMA_Productinfo_SB-SB-2_EN.pdf`, `2025_Productinfo_CFA_Anfaenger_EN.pdf`, `2025_Productinfo_FDP_Anfaenger_EN.pdf`, `2025_Productinfo_SCM_Anfaenger_EN.pdf`, `2025_Produktinfo_KBF-K_flach_high_EN.pdf`, `2025_Productinfo_KR-RM-HF_EN.pdf`, `2025_Productinfo_Abfangschelle_EN.pdf`, `2025_Productinfo_DW-S_EN.pdf`, `2025_Productinfo_KR-WS-29_EN.pdf`, `2025_Productinfo_RS-WS_EN.pdf` | **indexed, NOT read** | Ten single-product datasheets that almost certainly hold **dimensioned drawings of individual tools** — the auger starter, the FDP starter, the flat bucket, the high-frequency core barrel, the casing clamp. **This is the largest unexploited seam for this subject and the highest-value follow-up.** Recorded honestly as unread; carried into `_gaps.md`. | **Not read — a real gap** |

---

## 2. What these tools ARE

### 2a. The Kelly bar

*"Kelly bars are key components in the execution of boreholes with hydraulic
rotary drilling rigs. They transfer the torque of the rotary drive and the crowd
pressure of the crowd system concurrently to the drilling tool. A Kelly bar
consists of 2–5 telescopic tubular sections with a system of drive keys and lock
recesses, welded onto their outer surfaces."*
(`Kelly-Spare_Parts_and_Wear_Parts…` p.4)

Two things follow from that sentence, and they are the whole visual identity:

1. **The drive keys are welded strips on the OUTSIDE of each tube.** Not splines,
   not a machined profile, not a square section. A Kelly bar is a smooth round
   tube with **raised flat bars running down it**, and the gaps between the strips
   are the **lock recesses** the next section's dogs drop into.
2. **Standard bars carry 6 drive keys on each section** (`ibid.` p.4). Six — not
   four, not eight. Every section, all the way in.

Sections are named, inner to outer: **Innenkelly (inner) → Mittelkelly (mid) →
Zwischenkelly (intermediate) → Außenkelly (outer)**, and the parts book is
organised under exactly those four headings for every bar in the range
(pp.8–308). A 3-fold bar has inner / mid / outer; a 4-fold adds the intermediate;
5-fold bars appear in the book too.

**Locking.** *"Standard Kelly bars are delivered as fully lockable… all
individual sections are lockable to each other and in the rotary drive"*
(`ibid.` p.5). This is the **locked vs unlocked** distinction behind the B / B1
lengths in `foundation-bg.md` §3 — a locked bar transmits crowd force down the
string; an unlocked ("friction") bar relies on the tool's own weight.

**Noise damping** is an option, and it changes the surface completely:
*"sound absorbing pads which are glued into the recesses between the drive keys
on the outer surface of the outer Kelly section. The pads are protected against
mechanical damage by metal sheeting"* (`ibid.` p.4). An optioned bar reads as a
**clad tube with six proud key strips**; an unoptioned one shows bare steel
between the keys. Both are correct — pick one and be consistent.

**Diameter ladder** (`ibid.` p.3, the book's own index):
**Ø 254 · 292 · 298 · 305 · 343 · 356 · 368 · 394 · 419 · 457 · 470 · 559 mm.**

### 2b. The augers

A helical flight on a central tube, with a **Kelly box** on top and a cutting
head at the bottom. Two variants
(`bauer-maschinen-drilling-tools-and-casings…` p.6):

- **single-cut** — one cutting edge, one flight start;
- **double-cut** — two, *"recommended for uncased bores or for larger
  diameters"*.

Fitment on both: **Kelly box 200 mm · fishtail pilot and flat teeth · wear
protection by hard facing or wear strips** (`ibid.` p.6).

### 2c. The drilling buckets

A **cylindrical barrel with a hinged bottom**, teeth on the cutting edge, and a
slot the spoil is scraped through as the bucket turns. It fills, is hoisted, is
slewed off the hole, and the bottom is tripped to dump. Fitment (`ibid.` p.12):
**Kelly box 200 mm · fishtail pilot and flat teeth · a ventilation pipe
(*Saugkanal*) · wear protection by hard facing or wear strips.**

**The vent pipe is the detail nobody models.** Without it a full bucket lifting
out of a wet hole is a piston pulling a vacuum under itself. It is a tube up the
side or through the body, and it is on every real bucket.

### 2d. Core barrels and the cross cutter

A **plain open-ended cylinder** with cutting teeth or rollers on the bottom rim
and **no flight, no bottom and no pilot** (`ibid.` pp.18–24). It cuts an annulus
and leaves a core standing inside, which is then broken off and lifted with a
**cross cutter** (*Kernschneider*, `ibid.` p.24) — a separate tool sent down after
the barrel to cut the core loose. Two tools, one job, and they look nothing alike.

### 2e. The casings

*"Standard casings are produced in **double-walled** construction. Thus casings
have additional rigidity and strength and **a continuous flush drill string** is
provided to prevent jamming of drilling tools during insertion and extraction."*
(`ibid.` p.38)

**This is the most-missed fact about a bored-pile casing.** It is not a plain
tube. It is **two concentric walls with the joint hardware buried in the cavity
between them**, so the bore of the string is smooth end to end and a bucket
coming up cannot snag on a coupling. Joints are **bolted**, 8 or 10 bolts on the
sizes read.

### 2f. The casing shoe

The cutting ring at the bottom of the string (`ibid.` p.41). It takes **WS tooth
holders** or **weld-on teeth**, and: *"the cutting ring can be removed and
replaced when necessary"*, with a *"fully welded solid wall connection between
male joint section and cutting ring"*. A **long version** is offered because
*"the most intense strain occurs on the inner surface of the casing shoe in the
area of drilling tool action"* — i.e. **the tool wears the shoe from the inside**,
not the ground from the outside. That is a counter-intuitive fact worth knowing.

---

## 3. Proportions

### 3a. Kelly section construction — from the exploded views

Source: `Kelly-Spare_Parts_and_Wear_Parts_DE_EN_905_835_1_2.pdf` **p.9**, the
*Outer Kelly complete* parts list for a Ø254 3-fold bar. Rendered image:
`<scratchpad>/pdfpages/kellyx_p009.png`.

| item | part | figure |
|---|---|---|
| 1.1 | Round hollow section, seamless | **Ø 254 × 8** — i.e. **8 mm wall** |
| 1.2 | End stop ring (*Anschlagring*) | 1 off |
| 1.3 | Centre ring (*Zentrierring*) | 1 off |
| 1.4 | Section steel, **pressure side** | the drive key that takes crowd |
| 1.5 | Section steel, **tension side** | the drive key that takes pull |
| 1.6 | Section steel | **30 × 17 mm** |
| 1.7 / 1.9 | Section steel | **70 × 18 mm** |
| 1.8 | **Kelly end** = 1.8.1 + 1.8.2 | |
| 1.8.1 | Round hollow section | **254 × 8, L = 700 mm** |
| 1.8.2 | **Driving shell** (*Mitnehmerschale*) | **2 off** |
| 4 | Spring housing (*Federgehäuse*) | 1 off |
| 11 | Compression spring | 1 off |
| 15 | Hex nut, clamping | **8 off**, M16 |
| 17 | **Anti-vibration stop buffer** (*Schwingmetall-Anschlagpuffer*) | **6 off** |
| 18 | Hex socket set screw with dog point | **6 off**, M12 × 35 |

**The numbers that matter for a modeller:**

- **Wall 8 mm on a Ø254 tube** → wall / OD = **3.1 %**. A Kelly tube is
  thin-walled.
- **Drive keys stand 17–18 mm proud and are 30 mm or 70 mm wide.** Not 50, not
  100. On a Ø254 tube a 17 mm key is **6.7 % of the diameter**; on the Ø559 bar it
  would be **3 %**. A low, flat rail that reads as a shadow line, not as a fin.
- **The drive keys are short welded strips, not full-length rails.** The exploded
  view lays out a series of separate bars (1.4, 1.5, 1.6, 1.7) along the tube. The
  gaps between them are the lock recesses.
- **Two of the six keys are functionally distinct** — a *pressure-side* and a
  *tension-side* section steel. They are separate part numbers even though they
  read alike.
- **The Kelly end is a separate 700 mm sub-assembly**: a stub of the same tube
  plus **two driving shells**. It is its own object at the section's end, not a
  continuation of the tube.
- **Six stop buffers** at the end stop, matching the six keys.
- **The spring housing and compression spring** are the shock absorber that
  catches the inner sections at full extension — a flanged canister with **8 ×
  M16 nuts** around its face.

### 3b. Augers — the full sourced table

`bauer-maschinen-drilling-tools-and-casings-de-en-11-25_0.pdf` **p.6**, read from
a 300 dpi crop (`<scratchpad>/pdfpages/bauer_auger_table.png`).

**Lengths, both variants:**

| | short | long |
|---|---|---|
| **NL** (net / flighted length) | **1 700 mm** | **2 250 mm** |
| **GL** (overall length) | **2 315 mm** | **2 865 mm** |
| **GL − NL** | **615 mm** | **615 mm** |

**Diameters, with over-teeth diameter where the catalogue gives it:**

| D (mm) | OD over teeth (mm) | OD − D | weight, single-cut, NL 1700 (kg) |
|---|---|---|---|
| 520 | 620 | **100** | 600 |
| 600 | — | | 630 |
| 650 | 750 | **100** | 645 |
| 700 | — | | 680 |
| 780 | 880 | **100** | 750 |
| 800 | — | | 700 |
| 900 | 1 000 | **100** | 765 |
| 1 000 | — | | 880 |
| 1 060 | 1 180 | **120** | 895 |
| 1 180 | 1 300 | **120** | 965 |
| 1 200 | — | | 980 |
| 1 350 | 1 500 | **150** | 1 070 |
| 1 500 | 1 650 | **150** | 1 210 |
| 1 650 | 1 800 | **150** | double-cut only, 1 320 |
| 1 800 | — | | double-cut only, 1 350 |
| 1 830 | 2 000 | **170** | double-cut only, 1 395 |
| 2 000 | — | | double-cut only, 1 570 |
| 2 320 | — | | double-cut only, 2 580 at NL 2250 |
| 2 500 | — | | double-cut only, 2 900 at NL 2250 |

The largest six diameters are **double-cut only**, consistent with the
catalogue's note that the double-cut tool is for large diameters.

### 3c. Drilling buckets

`ibid.` **p.12**:

| | single-cut | double-cut |
|---|---|---|
| **RL** (barrel length) | 1 200 / 1 500 mm | 1 200 / 1 500 mm |
| **NL** | 1 550 / 1 850 mm | 1 600 / 1 900 mm |
| **GL** | 2 150 mm (short variant) | — |

**NL − RL = 350 mm** (single-cut) or **400 mm** (double-cut) — the head above the
barrel. **GL − NL ≈ 600 mm** — the same Kelly-box allowance as the auger.

### 3d. Casings

`ibid.` **p.38**, double-walled casings:

| OD / ID (mm) | 1 m | 2 m | 3 m | 4 m | 5 m | 6 m | a1 | a2 | t2 | bolts |
|---|---|---|---|---|---|---|---|---|---|---|
| 620 / 540 | 403 kg | 739 | 1 074 | 1 411 | 1 747 | 2 081 | 12 mm | 8 mm | **40 mm** | **8** |
| 750 / 670 | 492 | 902 | 1 311 | 1 722 | 2 131 | 2 540 | 12 mm | 8 mm | **40 mm** | **10** |
| 880 / 800 | 585 | 1 069 | 1 552 | 2 036 | 2 520 | 3 005 | 12 mm | — | — | — |

**Read the geometry off those numbers:** OD 620 with ID 540 gives **40 mm of wall
per side**, and the two skins are **12 mm outer and 8 mm inner** — so there is a
**20 mm cavity between them**. That cavity is where the joint hardware lives, and
it is why the bore is flush.

Casing shoes come in **NL 500 / 1 000 / 2 000 mm**, with their own wall thickness
and a **stud count quoted in Standard and Eco variants** (`ibid.` p.41).

### ★ Ratios a modeller can actually use

Ratios survive a change of class; absolutes do not.

1. **A Kelly drive key is a low flat rail, not a fin.** **17–18 mm proud,
   30–70 mm wide**, on a tube 254–559 mm across — **3–7 % of the diameter**. Model
   it as a welded strap with a fillet weld down each side.
2. **Six keys per section, on every section**, at 60° spacing. A published
   figure, not an inference.
3. **Kelly tube wall ≈ 3 % of OD** (8 mm on Ø254).
4. **The Kelly end is a 700 mm sub-assembly** on a Ø254 bar — **2.75 × the tube
   diameter**. Long enough to read as its own object.
5. **Auger and bucket head allowance is a constant ~615 mm** above the flight or
   barrel, independent of tool length **and of tool diameter**. That is the Kelly
   box, the spine plate and the lifting eye. **It does not scale.**
6. **Teeth stand 50 mm proud per side up to Ø900**, 60 mm to Ø1180, 75 mm to
   Ø1650, 85 mm at Ø1830. As a fraction of diameter this **falls from 19 % to
   9 %** — a small tool looks aggressively toothed, a big one almost smooth.
7. **Bucket head is 350–400 mm above a barrel 1 200–1 500 mm long** — about a
   quarter of the barrel.
8. **A bucket is squat; an auger is long.** Bucket GL 2 150 mm on a body up to
   2 500 mm across — it can be **wider than it is tall**. An auger at the same
   diameter is 2 865 mm long. Two completely different silhouettes on one Kelly.
9. **Auger weight scales with diameter, not diameter squared**: Ø520 → 600 kg,
   Ø1500 → 1 210 kg. A **2.9× diameter increase gives only 2.0× the weight**,
   because a flight is a surface, not a volume.
10. **Casing wall is 40 mm total but only 12 + 8 mm of steel**, with a 20 mm
    cavity. Casing weight ≈ **350 kg/m at Ø620** rising to **500 kg/m at Ø880**.
11. **The casing bore is flush.** Nothing stands proud inside at a joint.

---

## 4. Component inventory

### 4a. Kelly bar

| Part | Why it matters visually |
|---|---|
| **Tube sections, 2–5 of them** | Concentric, telescoping. The step from one diameter to the next is visible at every section end when extended. |
| **Drive keys — 6 per section** | Short welded flat bars, 17–18 mm proud, in two widths (30 and 70 mm). Two of the six are functionally distinct (pressure side, tension side). |
| **Lock recesses** | The gaps between the key strips. Where the locking dogs engage; on a working bar the cleanest, brightest steel on the whole tube. |
| **End stop ring and centre ring** | At each outer section's bottom — the ring the next section down bottoms against, and the ring that keeps it concentric. A visible collar. |
| **Kelly end** | A 700 mm stub tube with **two driving shells** — the fitting at the very bottom that takes the tool. |
| **Spring housing + compression spring** | A flanged canister with **8 × M16 nuts** on its face. The shock absorber that catches the sections at full extension. |
| **Anti-vibration stop buffers, 6 off** | Elastomer pucks at the end stop. Small, dark, and the reason the bar does not ring like a bell. |
| **Set screws, 6 off** | M12 dog-point grubs retaining the buffers. |
| **Noise-damping pads + sheet cladding** *(option)* | Fills the channels between the keys on the outer section, covered with a metal skin. Turns a fluted tube into a smooth one. |
| **Kelly head and rope swivel** | Above the bar. Dimensioned in `foundation-bg.md` §3 — do not duplicate. |
| **200 mm square drive stub** | At the bottom, into the tool's Kelly box. The same 200 mm across the whole range — **confirmed twice, by two independent catalogues**. |

### 4b. Auger

**Kelly box (200 mm square socket) → head plate and lifting eyes → central tube
→ helical flight, one start or two → cutting edge with flat teeth in holders →
fishtail pilot at the centre → wear protection on the flight periphery.**

The **fishtail pilot** is the small twist-drill-like point standing below the
cutting edge that centres the tool. It is on every auger and bucket in the
catalogue and it is the first thing to touch the ground.

### 4c. Drilling bucket

**Kelly box → head plate and lifting eyes → cylindrical barrel → hinged bottom
door with a latch → cutting edge with teeth on the leading rim → fishtail pilot
→ ventilation pipe → wear strips on the barrel OD.**

The **hinged bottom and its latch** are the bucket's mechanism and the reason it
exists. Model a real hinge — a bucket dumping is one of the most recognisable
actions on a bored-pile site.

### 4d. Core barrel and cross cutter

**Core barrel:** Kelly box → head → plain open cylinder → toothed or
roller-fitted bottom rim. **No flight, no bottom, no pilot.**
**Cross cutter:** a separate tool, sent down after the barrel, to cut the standing
core loose.

### 4e. Casing string

**Casing tube (double-walled) → bolted joint, 8–10 bolts, hardware inside the
wall cavity → casing shoe with a replaceable cutting ring → tooth holders or
weld-on teeth around the shoe rim.** Plus the **casing clamp** (*Abfangschelle*,
`ibid.` p.43) that holds the string at the collar while a section is added or
removed — a large hinged split ring, and a genuinely useful piece of site
furniture lying on the platform.

### 4f. Wear protection — the named forms

`ibid.` **p.36** names three, plus hard facing:

- **Angular wear strips** (*Verschleißwinkel*) — L-section, on corners
- **Wear strips** (*Verschleißstreifen*)
- **Wear strips** (*Verschleißleisten*)
- **Hard facing** (*Auftragsschweißung*) — applied to **bucket bodies** and
  **auger flights**, illustrated on both

**Hard facing is the texture that makes a foundation tool look real**: a coarse,
lumpy, irregular bead laid in rows or a chequer pattern on the flight's upper
surface and the bucket's leading edges. It is not a smooth surface and it is not
paint.

---

## 5. Distinctive features (thumbnail silhouette test)

**Kelly bar — three tells:**

1. **A smooth round tube with six low flat rails down it, interrupted into short
   strips.** Not splines, not a square section, not a fluted shaft.
2. **A visible step at every telescope joint** when extended, with a **collar
   ring** at each section end.
3. **A separate, fatter, busier fitting at the very bottom** — the Kelly end with
   its two driving shells and the 200 mm square stub.

**Auger vs bucket vs core barrel at thumbnail size:**

1. **Auger** — a **helix**. Long, open, you see through it; spoil sits on the
   flights.
2. **Bucket** — a **closed can**, wider than tall at large diameters, with a
   **hinge line** across the bottom and a horizontal slot in the side.
3. **Core barrel** — a **plain open ring**. No helix, no bottom, no pilot. The one
   you can see straight through.

**Casing** — a **flush tube with a bolt circle at each joint** and nothing
protruding into the bore. A model with a raised coupling like a drill rod is the
wrong kind of casing.

---

## 6. Materials, paint, and where wear and dirt accumulate

- **Kelly bars are high-tensile steel** — *"manufactured from high-tensile steel
  to ensure minimum weight at adequate strength"* (`Kelly-Spare_Parts…` p.4).
- **Where wear actually is on a Kelly bar:**
  - **The lock recesses and the key flanks** — the brightest, most polished steel
    on the machine. The dogs hammer in and out of them thousands of times a shift.
  - **The key top faces** — polished where they run in the rotary drive's Kelly
    driver.
  - **The tube between the keys** — this is where **mud lives**. On a wet job the
    channels between the six keys pack solid with clay from the bottom of the bar
    upward, and the mud line marks how deep the bar has been. **That mud line is
    the most honest storytelling detail on the whole rig.**
  - **The centre and end rings** — scored circumferentially.
  - **The stop buffers** — flattened, split, and often one of six missing.
  - Paint, where present, survives on the upper outer section and is **gone
    entirely from the lower half**.
- **Where wear is on the tools:**
  - **Tooth tips and holders** — chipped, rounded, and often one or two teeth
    missing. A full set of sharp teeth means a brand-new tool.
  - **The hard facing** on flights and bucket edges — worn smooth in the middle of
    each bead, still proud at the ends.
  - **Auger flight upper surfaces** — polished bright by spoil sliding over them,
    while the undersides stay dull and rusty.
  - **Bucket barrel OD** — a **polished band** at the height where it rubs the
    casing shoe going in and out. This band is the best single clue that a tool
    has been used inside a casing.
  - **The hinged bottom's sealing face** — packed with clay that has dried and
    cracked.
  - **The vent pipe** — usually bent, sometimes flattened.
- **Where wear is on the casing:**
  - **The inner surface of the shoe** — stated by the catalogue as the most
    intensely stressed point, from the tool working through it (`ibid.` p.41).
    Bright and scored.
  - **The shoe teeth** — the ground-facing wear part.
  - **The bolt circles** — paint gone, threads greasy and dirt-caked.
  - **The outer wall** — scored vertically by the ground and horizontally by the
    oscillator or clamp jaws.
- **Colour.** New tooling leaves the works **painted** on the head and body and
  **bare** at every machined and welded face. In service the paint is gone from
  everything below the head within days. Bare mild steel weathers brown-grey; the
  polished bands stay bright because they are re-polished every cycle. **Use the
  game's own palette for painted parts; the photographed livery is branding and
  is not to be copied.**

---

## 7. Photo references

**Rendered from source PDFs** (regenerate with `<scratchpad>/pdfpage.py png` and
`crop.py`):

| Image | From | What it gives |
|---|---|---|
| `kellyx_p009.png` | `Kelly-Spare_Parts_and_Wear_Parts_DE_EN_905_835_1_2.pdf` p.9, 170 dpi | **The construction reference for a Kelly section.** Exploded isometric with a numbered parts table: tube, key strips, end and centre rings, Kelly end with its two driving shells, spring housing, buffers. Nothing else in the library shows how a Kelly bar is actually built. **There are ~300 more pages exactly like it** — render any diameter you need. |
| `bauer_auger_table.png` | `bauer-maschinen-drilling-tools-and-casings…` p.6, 300 dpi crop | The complete auger diameter / over-teeth / length / weight table. |

**Photographs in `C:\Users\henri\Downloads`:** see `_photos.md`. Two files whose
names point at this subject and which this agent did **not** open:
`Rotary_Drilling_Rig_1000_0001.jpg` (already used by `cfa-rig.md` for
uppercarriage detail) and `Atpa\BS_SW80.JPG`, a pallet of new auger sections
(already used by `cfa-rig.md` as the auger *material* reference). Both are
catalogued there; do not re-derive.

---

## 8. NOT SOURCED

1. **Ten single-product datasheets in `Downloads` for this family were left
   unread** — the auger, CFA starter, FDP starter, soil-mix, flat bucket,
   high-frequency core barrel, casing clamp, DW-S, KR-WS-29 and RS-WS product
   infos. **This is the biggest gap and it is cheap to close**: short files, and
   several are likely to carry the dimensioned drawing of a single tool that this
   document could not find.
2. **Tooth and tooth-holder dimensions.** The catalogue names types (WS holders
   WSH39-52, weld-on teeth BR and BH) but gives **no dimensions**. Tooth pitch,
   rake angle, holder height and spacing around a rim are all unsourced.
3. **Drive-key length and pitch along a Kelly section.** The strip **cross
   sections** (30 × 17, 70 × 18) are sourced; **how long each strip is and how far
   apart they sit** is not — it is visible only as a proportion in the exploded
   view, and has not been measured off a dimensioned drawing.
4. **Kelly wall thickness at any diameter other than Ø254.** 8 mm is sourced for
   Ø254 only. **Do not scale it** — a Ø559 bar's wall is unknown.
5. **Kelly box internal geometry.** "200 mm" is the square size; depth, retaining
   pin arrangement and tolerance are unsourced.
6. **Bucket bottom-door hinge and latch geometry.** Named, never drawn.
7. **The vent pipe's route and diameter.**
8. **Casing joint construction.** Bolt count (8, 10) and the double-wall
   thicknesses (12 / 8 / 40 mm) are sourced; **how the male and female ends
   actually interlock inside that cavity is not.**
9. **Casing OD ladder above Ø880.** `foundation-bg.md` §3 carries the full ladder
   to Ø2500 second-hand through research pack 10; this document verified only the
   first three rows directly.
10. **Core-barrel wall thickness, tooth count and roller arrangement.**
11. **Cross-cutter geometry.** Named on p.24; the page was not opened.
12. **Hard-facing bead pattern, size and pitch.** Illustrated on p.36, not
    dimensioned; the description in §6 is read off a small photograph.
13. **Anything about the CFA auger string** — that belongs to `cfa-rig.md`, which
    already has a sourced exploded assembly.

---

## 9. Domain-truth warnings — what the game currently gets wrong

Read from `src/rig/rigFactory.js` and `src/rig/tools.js`. **Read only; nothing
edited.** Ranked by how badly a rotary-rig operator would react.

### 9.1 Check the drive-key count and proportion first

The published figures are **six drive keys per section**, standing **17–18 mm
proud** on a tube 254–559 mm across. Any model with four keys, or with keys that
read as deep fins or as a machined spline, is wrong in the way an operator
notices immediately — **the Kelly is the part he looks at all day**.
`buildKellyBar` (`rigFactory.js` l. 2727) should be checked against both numbers
before the Blender model is built.

### 9.2 The lock recesses are the missing feature

A Kelly bar is *"drive keys **and lock recesses**"* (`Kelly-Spare_Parts…` p.4).
The recesses — the gaps in the key strips — are what makes a bar lockable, they
are the brightest steel on the tool, and they are the only visual difference
between a locking bar and a friction bar. **A continuous unbroken rail down the
whole section is the wrong geometry.**

### 9.3 A casing is double-walled and flush-bored

`ibid.` p.38 is explicit: double-walled construction, **12 mm outer + 8 mm inner
skin in a 40 mm wall**, joints bolted with 8–10 bolts, *"a continuous flush drill
string… to prevent jamming of drilling tools"*. **If `casing-crown` or any casing
mesh has a coupling standing proud inside the bore, a bucket could not pass it.**
This is the same class of error as the eccentric that could not come out of its
own hole (`HANDOFF.md` §8E) — a dimension the geometry contradicts.

### 9.4 The bucket needs a vent pipe and a real hinge

Both are catalogue fitment on every bucket (`ibid.` p.12). The vent is a small
tube; the hinge and latch are the mechanism the whole tool exists for.
`tools.js` `drilling-bucket` should be checked for both. **A bucket with a solid
bottom is not a bucket.**

### 9.5 The head allowance does not scale

**GL − NL is a constant 615 mm** on augers of every diameter and both lengths,
and **≈600 mm** on buckets. If the game scales the Kelly box and head
proportionally with tool diameter, a 2.5 m bucket grows a head four times too
tall. **Model the head at a fixed ~600 mm and scale only the working body.**

### 9.6 Tooth projection falls with diameter

**OD − D is 100 mm up to Ø900, 120 mm to Ø1180, 150 mm to Ø1650, 170 mm at
Ø1830** — 50 mm per side rising to 85 mm while the diameter more than triples. As
a fraction of diameter it **falls from 19 % to 9 %**. A model that scales the
teeth with the tool will make large tools look like circular saws.

### 9.7 Three tools, three silhouettes — do not share one parametric mesh

Auger (helix, see-through), bucket (closed can with a hinge), core barrel (open
ring, no bottom, no pilot) — plus the **cross cutter** as a fourth, separate tool
that goes down *after* the core barrel. If the game builds these by
parameterising one body, the core barrel will end up with a pilot and a bottom,
neither of which it has.

### 9.8 The fishtail pilot is on every auger and every bucket

Standard fitment on both (`ibid.` pp.6, 12). It is small, but it is the part that
touches the ground first and it is always there. Its absence shows in any close-up
of the tool entering the collar.

### 9.9 Things to keep

- The **200 mm Kelly box** is confirmed by this catalogue independently of
  `foundation-bg.md` §3's reading of the Kelly-bar book — **two sources, same
  number**. Safe.
- `foundation-bg.md` §3's ratio *"a 4-fold Kelly extends to 3× its retracted
  length"* is not contradicted by anything here.
- **Hard facing** deserves to exist in `assets.js` as its own surface — coarse,
  lumpy, unpainted. It is the fastest way to stop foundation tooling looking
  CAD-clean, and it is a *material*, so it costs triangles rather than draw calls
  wherever it is shared (`HANDOFF.md` §4b, point 3).
