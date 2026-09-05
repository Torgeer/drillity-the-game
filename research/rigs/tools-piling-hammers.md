# tools-piling-hammers — Impact hammers, vibratory hammers, helmets, drive caps and power packs

**Engineering reference for 3D modelling. GEOMETRY AND MATERIALS ONLY.**

status: COMPLETE for the material available locally. Everything unfound is in §8
and must not be invented.

Subject: the hammer end of the piling vertical — the tools carried by the game
rig `piling-leader` (`src/rig/rigFactory.js` → `buildPilingLeader`, l. 6075) and
by the RM 20-class leader documented in `rm20-leader.md`, plus the tool builders
`impact-hammer`, `vibratory-hammer`, `pile-helmet`, `drive-cap` and
`precast-pile` in `src/rig/tools.js`.

> **NAMING RULE (`DOMAIN.md` §10).** Real manufacturer names and model
> designations appear below ONLY to cite where a dimension came from. **None of
> them may become a product name, a badge, a decal, a cast-in boss, a stencil or
> a paint scheme on a game mesh.** Model the shapes; invent the marque. Where a
> real hammer carries a moulded logo down its housing — and the ones photographed
> here do, in letters most of a metre tall — model a blank panel or a Drillity
> mark instead. Sheet-pile section families (Z, U, combi) and steel grades are
> *industry-generic* and are safe to show.

> **METHOD NOTE — a tool unlock this document proved.** The Read tool cannot
> render PDFs on this machine (`pdftoppm is not installed`), and an earlier agent
> recorded catalogues as permanently unreadable on that basis. **That conclusion
> was wrong.** `pymupdf` **is** installed (PyMuPDF 1.28.2), and so is
> `pdftotext`. Every figure below was obtained by extracting text and by
> rendering pages to PNG with a short script, then opening the PNG with the Read
> tool. The scripts are at `<scratchpad>/pdfpage.py` (`info` / `text` / `png`)
> and `<scratchpad>/crop.py` for high-DPI detail crops. **Any future agent told a
> PDF is unreadable should re-test.** Recorded in `_gaps.md`.

---

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Junttan_Hammers_brochure_EN_2025_web.pdf` | 11 pp.; text of 8–10, pages 6 and 8 rendered at 150 dpi | **The primary source for this document.** p.9 is a complete technical table for **26 impact hammers in five families** — ram mass, energy, stroke, blow rate, pressure, oil flow, **hammer length and hammer weight** for every one, plus **drive-cap face sizes**. p.8 is a **numbered cutaway** of both a round-cased and a box-framed hammer showing ram block, drive-cap cavity, guide interface and hose routing. p.6 is a large on-site photograph of a crane-suspended hammer driving a steel tube pile. p.10 gives **power-pack box dimensions**. | **Yes — primary** |
| `C:\Users\henri\Downloads\Junttan_Vibratory_Hammers_brochure_2023_web.pdf` | 7 pp.; text of 3–4, page 4 rendered | **Second primary.** p.4 is a full spec table for **six free-hanging vibratory hammers** — eccentric moment, centrifugal force, **frequency**, amplitude, pulling force, and a **complete weight-and-dimensions block (L1/L2/L3, H1/H2, W1/W2/W3, throat width)**; plus **sheet-pile clamps** and **tube/casing clamps** with clamping force, weight and **gripping-diameter range**. p.3 explains variable-moment phase shifting (resonance-free start and stop). **The letter-key diagram that would define L1/L2/L3 is absent from the file** — see §8. | **Yes — primary** |
| `C:\Users\henri\Downloads\Junttan_VH120_vibro-hammer_datasheet-1.pdf` | 2 pp.; p.1 rendered at 150 dpi, then cropped at 420 dpi | **The best single geometry image in the set.** A clean isometric render of one vibratory hammer against white — suspension yoke, exciter case face, side clamp cylinders, side hose manifold, clamp jaws. The 420 dpi crop resolves the **machined pockets in the case wall**, the **bolt-hole field**, the **six-coupling hose manifold** and the **bolt ring on the clamp cylinder head**. p.2 is a copyright page and is worthless. | **Yes — primary (geometry)** |
| `C:\Users\henri\Downloads\PalPile-Brochure-2025.pdf` | 36 pp.; contents p.5 and section table p.6 read, pp.16–27 indexed only | **A pile catalogue, not a hammer catalogue** — so it answers "what is the hammer hitting", which no other source here does. p.6 gives hot-rolled **Z sheet-pile sections** with width, height and flange/web thickness. Contents show pipe walls and interlocks (pp.16–19), tube supply (p.20) and **anchoring bar systems (pp.22–25)**. The anchoring pages belong to `tools-anchors-sda` and are flagged there, not mined here. | Partly (pile geometry) |
| `src/rig/tools.js` — `IMPACT_HAMMER` table (l. 8021), `buildImpactHammer` (l. 8038), `buildVibratoryHammer` (l. 8152), `buildPileHelmet` (l. 8272), `buildDriveCap` (l. 8368), `buildPrecastPile` (l. 7518) | as cited | The current game models, compared against the sources in §9. **Read only — not edited.** | Yes (as the subject) |
| `src/rig/rigFactory.js` — `buildPilingLeader` (l. 6075) | 6075–6300 | How the tools are mounted, ranged and animated on the leader; the spec block quoted in §9. | Yes (as the subject) |
| `13915_Junttan_PM25H_Datasheet.pdf`, `Junttan_General_Brochure_General_2022_web.pdf`, `16291_Junttan_Piling_brochure_3_2013_WEB.pdf`, `HHK16-22S-Datasheet.pdf`, `Operators manual PM25HD.pdf` | indexed, **not read** | Carrier-level documents already covered by `piling-leader.md` and `rm20-leader.md`; the single-model datasheet duplicates one row of the p.9 table. **Deliberately left unread** — recorded so nobody assumes they were checked. Listed in `_gaps.md`. | Not needed |

---

## 2. What these tools ARE

Four different objects get called "the hammer" on a piling site. They do not look
alike, do not mount alike, and do not belong on the same job.

### 2a. The hydraulic impact hammer

A **falling weight in a case**. A ram block is lifted hydraulically and released
(or accelerated down, on double-acting types) onto an anvil, which passes the
blow through a **drive cap** into the pile head. Energy is set by stroke; rate by
how fast the cycle repeats. The whole object is **long and slender** — several
times taller than it is wide. In silhouette it is essentially a vertical line.

Two structural families are drawn side by side in the same cutaway
(`Junttan_Hammers_brochure_EN_2025_web.pdf` p.8), and they read completely
differently at distance:

- **Round-cased type** — the housing is a **closed tube of roughly circular /
  octagonal section**, ram running inside it. Very few external features: a
  series of **ring flanges** banding the tube, a few oval cut-outs, and a lifting
  head. Smooth, solid, unbroken.
- **Box-framed type** — an **open rectangular frame**: side channels with visible
  cross-members and the ram slab travelling between them. Much more visually
  broken up; **you can see through it**, and the ram is visible in the gap.

Both hang from a **lifting head at the top** and both can be **run down a leader
on guide jaws** or **free-suspended from a crane** on a bail. The same hammer
does both — the mounting is a bolt-on interface, not part of the housing
(`ibid.` p.8, callouts 2 and 7: crane suspension and *"the clever mounting system
enables the hammer to be used with different kinds of leaders"*).

The **ram block is modular**: one case takes several ram weights, changed with
1 t and 2 t extension blocks (`ibid.` p.8, callout 10; p.9 "EXTENSIONS" row).
That is why the same housing appears at several energies in the table.

### 2b. The vibratory hammer

Not a hammer at all — a **counter-rotating eccentric-mass exciter** that shakes
the pile down. It is **wide and squat**: a slab-sided case wider than it is tall,
a suspension yoke on top, and hydraulic **clamps hanging underneath** that grip
the pile. It drives *and extracts*, which the impact hammer cannot do, and
extraction is a large part of its working life.

Free-hanging from a crane rope is the common arrangement
(`Junttan_Vibratory_Hammers_brochure_2023_web.pdf` p.4, the whole range is
described as free-hanging); it can also be leader-mounted or excavator-mounted.

**Frequency is the identifying number.** The normal-frequency machines in the
source table run **1 400–1 700 rpm** across the entire size range, with
**19–26 mm** amplitude (`ibid.` p.4). Frequency *falls* as the machine gets
bigger. See §9 — the game is badly wrong here.

The variable-moment machines add a **phase shifter** that rotates the eccentric
pairs from 0° to 180°, so the machine starts and stops at zero amplitude and
never passes through the soil's resonance while running up (`ibid.` p.3,
"NO RESONANCE / ADJUSTING PHASE / FULL POWER"). Visually this changes nothing;
behaviourally it is why a vibro can work next to a building.

### 2c. The consumable stack between hammer and pile

Never model an impact hammer sitting on a bare pile head. Between them, always:

**anvil → drive cap / helmet → dolly → packing → pile head**

The drive cap is a **deep cup** whose cavity matches the pile section, and it is
a **loose fit on purpose** — a pile that hits an obstruction must be able to turn
inside it. The dolly (hardwood, plastic or a laminated block) crushes and chars
as it works and is changed on a shift basis. **This stack is the dirtiest, most
beaten-up object on the whole rig**, and it is what a driller looks at first.

The cutaway on p.8 shows how deep the cavity really is: on the round-cased
machine the drive cap is a **bell** whose internal bore runs most of the cap's
height, with a **castellated / stepped rim** at the mouth, and internal ribs
across the closed end.

### 2d. The power pack

Big hammers do not run off the carrier. A **separate diesel-hydraulic power pack**
stands on the ground beside the rig, connected by two very heavy hoses. It is a
**skid-mounted box that reads as a small shipping container**: louvred sides,
lifting and stacking lugs, a control panel door
(`Junttan_Hammers_brochure_EN_2025_web.pdf` p.10;
`Junttan_Vibratory_Hammers_brochure_2023_web.pdf` p.6, which explicitly names
*"optimized lifting and stacking features"* — so they stack, and on a busy yard
they are stacked).

### 2e. What is being driven

- **Precast concrete** — square section with **chamfered arrises**, 250–400 mm typical.
- **Steel tube** — open-ended, spirally or longitudinally welded.
- **Sheet pile** — a thin, wide, folded section. Hot-rolled Z sections in the
  local catalogue are **630 mm and 700 mm wide, 374 mm and 420 mm high, with
  8.5 mm flange and web**, at 69.8–74.0 kg/m single pile
  (`PalPile-Brochure-2025.pdf` p.6). **This is the proportion modellers get
  wrong**: a sheet pile is 630–700 mm across the pan and **8.5 mm thick**. It is
  a folded sheet, not a beam.
- **H-pile** — a rolled H section, gripped in the same tube/sheet clamps.

---

## 3. Proportions

### 3a. Impact hammers — the complete sourced table

All from `Junttan_Hammers_brochure_EN_2025_web.pdf` **p.9**. Lengths and weights
marked * in the source **exclude cap and sleeve**.

**Box-framed, 1 200 mm stroke:**

| ram (kg) | energy (kNm) | stroke (mm) | blows/min | length (mm) | weight (kg) |
|---|---|---|---|---|---|
| 3 000 | 35 | 1 200 | 40–100 | 5 160 | 6 000 |
| 5 000 | 59 | 1 200 | 40–100 | 5 900 | 8 400 |
| 7 000 | 82 | 1 200 | 40–100 | 6 640 | 11 000 |
| 9 000 | 106 | 1 200 | 40–100 | 7 380 | 13 500 |

A parallel 1 200 mm-stroke line at a higher blow rate (**50–140+/min**) gives
3 000 kg / 36 kNm / 5 432 mm / 6 920 kg; 5 000 / 61 / 6 172 / 9 250;
7 000 / 89 / 6 935 / 11 730; 9 000 / 119 / 7 675 / 14 800.

**Box-framed, 1 500 mm stroke (the long-stroke line):**

| ram (kg) | energy (kNm) | length (mm) | weight (kg) |
|---|---|---|---|
| 3 000 | 44 | 6 580 | 5 650 |
| 5 000 | 74 | 7 320 | 7 900 |
| 7 000 | 103 | 8 060 | 10 400 |
| 9 000 | 132 | 8 800 | 12 900 |
| 10 000 | 147 | 7 264 | 16 200 |
| 12 000 | 177 | 7 764 | 19 000 |
| 14 000 | 206 | 8 264 | 21 800 |
| 16 000 | 235 | 8 170 *(9 636 on the stacked variant)* | 23 200 *(24 400)* |
| 18 000 | 265 | 8 490 | 26 100 |
| 20 000 | 294 | 8 810 | 28 300 |
| 22 000 | 320 | 9 130 | 40 700 |
| 25 000 | 368 | 7 995 | 40 700 |
| 28 000 | 400 | 8 235 | 45 400 |
| 30 000 | 441 | 8 375 | 48 000 |

The largest three also quote a raised energy on uprated hydraulics (400 / 450 /
500 kNm) — the same iron, more oil.

**Round-cased line (1 000–1 200 mm stroke, blow rate 40–180/min):**

| ram (kg) | energy (kNm) | stroke (mm) | length (mm) | weight (kg) |
|---|---|---|---|---|
| 9 910 | 160 | 1 000 | 5 869 | 19 400 |
| 14 140 | 210 | 1 000 | 6 779 | 25 600 |
| 16 260 | 250 | 1 000 | 7 234 | 28 800 |
| 20 510 | 300 | 1 000 | 8 144 | 34 800 |
| 22 610 | 350 | 1 000 | 8 599 | 37 600 |
| 28 860 | 500 | 1 200 | 10 418 | 46 700 |

**Drive-cap faces** (`ibid.` p.9, listed as an equipment option): **470 × 470 mm
square or Ø770 mm round** for the 3–5 t classes; **550 × 550 mm square or
Ø850 mm round** for the 7–9 t classes.

### 3b. Vibratory hammers — the complete sourced table

All from `Junttan_Vibratory_Hammers_brochure_2023_web.pdf` **p.4**. Class labels
are the source's own size numbers, used here as size bands only.

| | 25 | 30 | 50 | 80 | 120 | 200 |
|---|---|---|---|---|---|---|
| Eccentric moment (kg·m) | 25 | 32.6 | 50.2 | 82.6 | 120 | 203.2 |
| **Centrifugal force (kN)** | 795 | 1 036 | 1 409 | 2 318 | 2 846 | 4 380 |
| **Frequency (rpm)** | **1 700** | **1 700** | **1 600** | **1 600** | **1 480** | **1 400** |
| Amplitude (mm) | 22 | 24 | 24 | 23 | **26** | 19 |
| Pulling force (kN) | 470 | 590 | 706 | 1 059 | 1 059 | 1 880 |
| Power (kW) | 195 | 243 | 352 | 511 | 598 | 1 045 |
| Oil flow (l/min) | 366 | 421 | 605 | 959 | 1 122 | 1 792 |
| Dyn. weight w/o clamp (kg) | 2 270 | 2 750 | 4 130 | 7 109 | 9 145 | 21 700 |
| **Total weight w/o clamp (kg)** | 3 100 | 4 485 | 6 150 | 10 257 | 12 172 | 26 100 |
| Length L1 (mm) | 1 998 | 2 599 | 2 650 | 3 315 | 3 315 | 3 660 |
| Length L2 (mm) | 1 796 | 2 420 | 2 460 | 3 070 | 3 070 | 3 350 |
| Length L3 (mm) | 1 848 | 2 812 | 2 848 | 3 410 | 3 390 | — |
| Height H1 (mm) | 1 610 | 2 034 | 2 117 | 2 200 | 2 682 | 3 620 |
| Height H2 (mm) | 2 282 | 2 704 | 2 861 | 3 615 | 3 786 | — |
| Width W1 (mm) | 371 | 364 | 384 | 451 | 455 | 493 |
| Width W2 (mm) | 550 | 575 | 590 | 761 | 728 | 2 070 |
| Width W3 (mm) | 250 | 250 | 292 | 370 | 370 | — |
| **Throat width (mm)** | 360 | 350 | 360 | 461 | 430 | 800 |

**Note on the letters.** The source gives no key diagram, so which physical
distance each letter measures is `NOT SOURCED` (§8). What the numbers *do*
support without a key: there are **three distinct lengths and two distinct
heights**, so the case is a stepped body, not a plain cuboid; **W1 is much
smaller than W2**, so the machine has a narrow main body with something wider at
one station (almost certainly the clamp spread); and **W1 is only 371–493 mm
across the whole range**, which is the important fact — the body is thin.

**Clamps** (`ibid.` p.4) — the clamp is a **separate item with its own weight**,
and it is heavy:

| | sheet-pile clamp | tube / casing clamp |
|---|---|---|
| clamping force | 1 216 / 1 700 / 3 560 kN | 643 – 1 858 kN **each**, fitted **in pairs** (×2, or ×4 on the largest) |
| weight | **851 / 866 / 2 553 kg** | **307 / 538 / 1 164 kg each** |
| grips | — | **Ø340–1 030 mm** on the smallest, rising to **Ø1 000–3 000 mm** on the largest |

### 3c. Power packs — box sizes

`Junttan_Hammers_brochure_EN_2025_web.pdf` p.10 and
`Junttan_Vibratory_Hammers_brochure_2023_web.pdf` p.6 (identical table):

| | W (mm) | L (mm) | H (mm) | power (kW) | weight (kg) |
|---|---|---|---|---|---|
| PP200 | 1 610 | 3 720 | 1 740 | 160 | 5 400 – 5 500 |
| PP400 | 1 650 | 4 200 | 1 840 | 235 | 6 400 – 6 600 |
| PP700 | 1 820 | 4 520 | 2 175 | 315 – 405 | 7 600 – 8 100 |
| PP900 | 2 030 | 5 230 | 2 210 | *(engine quoted; weight not read)* | — |

Hydraulic tank **350 l** on every size read.

### ★ Ratios a modeller can actually use

Ratios survive a change of class; absolutes do not.

1. **Impact-hammer length grows very slowly with ram mass.** Across the
   box-framed line a **10× increase in ram** (3 t → 30 t) buys only a **1.62×
   increase in length** (5 160 → 8 375 mm) — an exponent of about **0.21**,
   `L ∝ ram^0.21`. **A 30 t hammer is not much longer than a 9 t one; it is much
   fatter and much heavier.** Scale the *section*, barely the length. This is the
   single most useful number in the document and the game currently violates it
   (§9.1).
2. **Total hammer weight ≈ 1.45 – 2.0 × ram weight**, and the ratio **falls** as
   the hammer grows: 2.00 at 3 t, 1.50 at 9 t, 1.45 at 16 t, 1.60 at 30 t. The
   round-cased line sits higher, 1.62–1.96.
3. **Impact-hammer slenderness.** A 9 t hammer is 7 380 mm long with a
   550 × 550 mm drive cap — roughly **11–13 × longer than it is wide**. In the
   p.6 photograph the housing reads as **about the same diameter as the tube pile
   it is driving**. Model it as a pencil, not a barrel.
4. **The drive cap is about ⅓ of the visible hammer.** In the p.6 photograph the
   painted housing occupies roughly the upper two thirds of the exposed hammer
   and the contrasting cap the lower third. It is the strongest two-tone break in
   the silhouette and the fastest way to make the object read as a hammer.
5. **A vibratory hammer is wider than it is tall and very thin.** Take the 120
   class: 3 315 long × 2 682 high × 455 wide. **L : H : W ≈ 7.3 : 5.9 : 1.** It
   is a **slab**. The game's 1 050 × 1 150 × 620 mm (`tools.js` l. 8166) is a
   chunky box and is wrong in every axis — §9.4.
6. **Vibro throat width ≈ 0.13 × length** (430 / 3 315 on the 120 class). The
   throat is the gap the pile passes through; it is narrow relative to the case.
7. **Vibro weight scales almost linearly with centrifugal force** — 3 100 kg at
   795 kN to 26 100 kg at 4 380 kN, i.e. **3.9–6.0 kg per kN**, averaging about
   **4.5 kg/kN** over the middle of the range.
8. **Dynamic weight is 65–83 % of total weight** (2 270/3 100 up to 9 145/12 172).
   The suspension yoke and suppressor are a real fraction of the object, not a
   bracket.
9. **Clamps are 10–20 % of the vibrator's own weight** and hang below it as
   distinct, differently-coloured objects. A vibro modelled without its clamp is
   missing a component the size of a small car.
10. **The power pack is a container.** L ≈ **2.3 × W**; H ≈ **1.08–1.20 × W**.
    1.6–2.0 m wide, 3.7–5.2 m long, 1.7–2.2 m high, 5.4–8.1 t. Model it at
    container proportions on a skid, not as a generator trolley.
11. **A sheet pile is a folded sheet.** Width **630–700 mm**, height
    **374–420 mm**, thickness **8.5 mm** — a **width : thickness ratio of about
    76 : 1**. At any distance it is an edge, not a solid.

---

## 4. Component inventory

### 4a. Impact hammer, top to bottom

Read off the cutaway `Junttan_Hammers_brochure_EN_2025_web.pdf` p.8 and the site
photograph on p.6.

| # | Part | Why it matters visually |
|---|---|---|
| 1 | **Lifting head / bail** | A fabricated plate assembly with a large eye or two lugs. On p.6 it takes **two chain legs to the crane hook**, splayed at maybe 30° — the chains, the shackles and a yellow rated-capacity tag are the top 2 m of the object and they read clearly. Without them the hammer looks like it is floating. |
| 2 | **Housing** | Round-cased: a smooth tube **banded by seven or eight ring flanges** down its length in the p.6 photograph. Box-framed: an open frame of side channels with visible cross-members. **The band spacing is the single best free detail** — it turns a featureless cylinder into a machine at any distance. |
| 3 | **Ram block** | A solid slab or cylinder inside. On the box-framed type it is **visible through the frame**; on the round-cased type only through inspection cut-outs. It is the moving part and the whole reason for the object. |
| 4 | **Cylinder / valve head** | On top of the housing under a cap. On the cutaway it is the assembly the ram rod disappears into. |
| 5 | **Guide jaws / leader claws** | **The bolt-on interface, on the back face only.** Two pairs, well separated vertically, wrapping the leader rails. They are the reason the hammer stands off the leader by a fixed distance and never touches it with the housing. |
| 6 | **Hydraulic hoses** | On p.6, **two very heavy black hoses** leave the top, hang in a shallow catenary, and are **clipped to the housing at intervals down its length** before running out across the ground to the power pack. **They are not free-hanging snakes.** Hose diameter reads at roughly 50–60 mm — as thick as a wrist. |
| 7 | **Shut-off valves** | Called out on p.8 (callout 5) at the hose connections, to stop oil loss when the hammer is uncoupled. Small block valves at the top; visible lumps. |
| 8 | **Anvil** | The struck face at the bottom of the housing. |
| 9 | **Drive cap / pile sleeve** | The **deep cup** below the anvil, quick-coupled (p.8, callout 11). Its cavity accepts the pile head; the p.8 cutaway shows the bore running most of the cap's height with **internal ribs across the closed end** and a **castellated / stepped rim** at the mouth. On p.6 it carries **black-and-yellow hazard chevrons** around its lower band. |
| 10 | **Dolly and packing** | Inside the cap, above the pile head. Invisible when assembled — but a spare, charred and split, lying on the pad beside the rig is one of the most authentic props available. |
| 11 | **Ram extension blocks** | 1 t and 2 t discs stored on the pad; the reason one case covers several energies. |

### 4b. Vibratory hammer, top to bottom

Read off the 420 dpi crop of `Junttan_VH120_vibro-hammer_datasheet-1.pdf` p.1.

| # | Part | Why it matters visually |
|---|---|---|
| 1 | **Suspension yoke** | An **inverted-U channel** straddling the case — two tall side legs joined over the top, open front and back. A **round dark boss** (the suspension pin / damper) sits at the top of one leg. The case's own top plate is visible in the gap between the legs. **This is the machine's most distinctive shape and the game does not have it** (§9.4). |
| 2 | **Elastomer suppressor pack** | Between the yoke and the case. **On this machine it is enclosed inside the yoke legs and not visible from outside.** Other makes expose it — see §8; do not assume either way. |
| 3 | **Exciter case** | The main slab. Its face is not smooth: the lower half carries a **staggered two-row array of machined oval pockets with radiused ends**, each ringed by small bolt holes; the upper half carries a **dense field of small bolt holes in rectangular clusters** on a flat plate. Roughly six to eight pockets are visible on the face in the crop. **Flush machined pockets — not protruding round bosses** (§9.4). |
| 4 | **Hydraulic manifold** | A **plate on the SIDE of the case at mid-height carrying six couplings in a row**, with six black hoses looping up and away from it. **Not on the top, not at the back.** |
| 5 | **Clamp cylinders** | Housed in **pockets let into each side of the case's lower corners**, with chrome rod and short hose whips visible in the pocket. They are recessed, not bolted on the outside. |
| 6 | **Clamp bodies** | Below the case, in a **contrasting colour to the case** on every image in both brochures. Each is a chunky jaw body with a **large circular bolted end cover carrying a ring of twenty-plus bolts** — the clamp cylinder head, and the most jewel-like detail on the machine. |
| 7 | **Grip jaws** | The **dark, serrated** faces inside the clamp mouth. A smooth jaw would drop the pile. |
| 8 | **Lifting / stacking lugs** | On the yoke and case corners. |

### 4c. The power pack

A container-proportioned box on a skid: **louvred side panels** over the engine
bay, a **hinged control-panel door**, an **exhaust stack**, **four corner lifting
lugs** and **stacking feet**, and **two heavy hose reels or a hose bundle** coming
out of one end. On p.6 the pad-mounted unit is a wheeled/skid box with a big
**coil of hydraulic hose** — three metres across — dumped on the ground beside it.

### 4d. Site furniture that belongs with these tools

From the p.6 photograph, all in one frame: a **coil of spare hydraulic hose**
lying flat on the ground; an **orange steel base frame / pile gate** on the pad;
**timber crane mats** laid as a working platform; **orange plastic barrier
fencing** on steel pins; a stack of **steel tube piles** on timber bearers; a
**tool bag** open on the deck. This is what makes a piling scene read as a
working site rather than a machine on a plane.

---

## 5. Distinctive features (thumbnail silhouette test)

**Impact hammer — three tells:**

1. **It is a vertical line with a two-tone break one third up from the bottom.**
   Dark/painted housing above, contrasting drive cap below. Nothing else on a
   piling site has that signature.
2. **Ring flanges band the housing.** Seven or eight horizontal lines down an
   otherwise plain tube. At thumbnail size this is what separates a hammer from a
   drill rod or a mast section.
3. **Two heavy hoses leave the top and are strapped down the body.** They do not
   hang free. The hose pair is as identifying as the hammer itself.

**Vibratory hammer — three tells:**

1. **An inverted-U yoke straddling a slab.** Widest at the top, and open — you
   see sky through the yoke. Nothing else in the fleet has that shape.
2. **Clamps hang below in a contrasting colour**, and they are big: a fifth of
   the machine's height and a fifth of its weight.
3. **It is a slab seen edge-on.** Rotate it 90° and it nearly disappears —
   455 mm across a 3 315 mm length. A vibro modelled as a cube is unrecognisable.

**The two families apart at thumbnail size:** the impact hammer is **taller than
wide by a factor of ten**; the vibro is **wider than tall**. That single
proportion is enough.

---

## 6. Materials, paint, and where wear and dirt accumulate

**Sourced observations** — from the p.6 site photograph, the p.8 cutaway and the
p.4 marine photograph.

- **Two-colour convention, consistently applied.** On every machine in both
  brochures the **case/housing is one saturated colour** and **every part that
  touches the pile is a different, lighter one** — drive cap, clamp bodies, clamp
  jaws. This is a real functional convention (the consumable/wear parts are
  marked out) and it is worth keeping. **Use the game's own palette, not the
  photographed livery** — `BRAND.amberPlant` for plant paint per `HANDOFF.md` §7.
- **Hazard chevrons** in black and yellow diagonal stripe run around the **lower
  band of the drive cap** on p.6 — the pinch point. They are painted directly on
  the steel and they are the first thing to abrade off.
- **Where wear actually is, part by part:**
  - **Drive cap mouth and rim** — the worst-worn surface on the whole rig. Bare
    bright steel, peened and rolled over at the lip, paint gone entirely for
    200–300 mm up from the mouth, with concrete dust or steel scale packed into
    the corner where the cap meets the anvil.
  - **Drive cap internal bore** — polished bright by the pile head, with a
    distinct ring where the head bottoms out.
  - **Housing lower third** — spatter and impact scarring from driving debris;
    paint chipped to primer at every ring flange edge (flanges are what the
    machine gets dragged and knocked on).
  - **Guide jaws / leader claws** — the running faces are **polished mirror
    bright** where they slide on the leader rails, with grease pushed to the ends
    of the wear pads and dirt stuck in the grease. Nothing else on the hammer is
    that shiny.
  - **Ram inspection cut-outs** — oil weep tracks running *down* from the lower
    edge of every opening, then blackening with dust.
  - **Hose clamps** — the paint under and around each hose clip is worn to steel
    by movement, in a band the width of the clip.
  - **Vibro clamp jaws** — the serrations are the wear part: rounded over,
    bright, and often with a smear of the pile's own material (mill scale from
    steel, grey dust from concrete) in the roots.
  - **Vibro case underside and clamp tops** — where spoil, mud and water thrown up
    by the pile collects and dries. The upper surfaces of the yoke collect
    airborne dust; the vertical faces stay comparatively clean because they
    vibrate at 25 Hz and shed everything.
  - **Power pack** — diesel and hydraulic staining down one end panel below the
    fill points, mud up the skid to about 300 mm, and the louvres packed with
    dust and grass.
- **Materials:** fabricated steel plate for cases and yokes; **forged** ram
  blocks; **cast** drive caps and clamp bodies (their corner radii are large and
  soft, unlike the sharp plate edges of the case); chrome rods on every cylinder;
  elastomer suppressor elements; and heavy rubber-covered hydraulic hose with
  visible spiral-wrap texture and metal ferrules at every coupling.
- **Finish detail worth having:** the case faces in the VH120 render carry a
  **visible surface texture** — the mottled look of flame-cut and welded plate
  under paint, not a smooth machined face. Only the **machined pockets and bolt
  spot-faces** are smooth. A perfectly smooth painted slab reads as plastic.

---

## 7. Photo references

**Rendered from the source PDFs** (regenerate with `<scratchpad>/pdfpage.py png`):

| Image | From | What it gives |
|---|---|---|
| `jhammer_p006.png` | `Junttan_Hammers_brochure_EN_2025_web.pdf` p.6, 150 dpi | **The best site photograph available.** Crane-suspended hammer driving a steel tube pile on a waterfront pad. Gives: hammer/pile diameter ratio, ring-flange spacing, hose routing and clipping, chain-leg suspension, hazard chevrons on the cap, and a full inventory of site furniture (hose coil, orange base frame, crane mats, barrier fencing, trailer power unit). |
| `jhammer_p008.png` | `ibid.` p.8, 150 dpi | **Numbered cutaway of both hammer families side by side.** The only place the drive-cap internal cavity, the ram block inside the case, and the difference between round-cased and box-framed construction can be seen at once. |
| `vh120_p001.png` / `vh120_exciter.png` | `Junttan_VH120_vibro-hammer_datasheet-1.pdf` p.1, 150 dpi and a 420 dpi crop | **The geometry reference for the vibratory hammer.** Clean isometric on white. The crop resolves the case-face pocket array, the bolt-hole field, the six-coupling side manifold, the recessed clamp cylinders and the bolt ring on the clamp cylinder head. |
| `vhbro_p004.png` | `Junttan_Vibratory_Hammers_brochure_2023_web.pdf` p.4, 150 dpi | The full spec table plus a second isometric of a larger machine (showing the splayed twin-clamp lower frame) and a working photograph of a vibro on a marine spread driving tube into a rock-armoured shoreline. |

**Photographs in `C:\Users\henri\Downloads`:** `_photos.md` is the catalogue.
The one file whose name points at this subject is
`rtg-rammtechnik-gmbh-rg-rammgerät-im-einsatz-pile-driver-in-action-2023.jpg.webp`
— **not opened by this agent**; see `_photos.md` for the verdict.

---

## 8. NOT SOURCED

Nothing below may be invented. Each is a real gap.

1. **The L1/L2/L3, H1/H2, W1/W2/W3 key diagram for the vibratory hammers.** The
   numbers are sourced; **which distance each letter measures is not.** The
   brochure omits the figure. Do not guess the mapping — model from the isometric
   render and use the numbers only as an envelope.
2. **Any dimensioned general arrangement of an impact hammer.** Length and weight
   are sourced for 26 machines; **width, depth, flange pitch, cap height, guide-jaw
   spacing and stand-off from the leader are not.** Everything in §4a about
   proportions of those features is read off photographs, not measured.
3. **Ring-flange count and pitch as a specification.** Observed as "seven or
   eight" in one photograph of one machine. Not a published figure.
4. **Drive-cap overall height and wall thickness.** Only the **face size**
   (470/550 mm square, Ø770/850 mm round) is published.
5. **Dolly and packing dimensions, materials and service life.** Named in the game
   spec; not sourced anywhere in this material.
6. **Helmet-to-pile clearance** — the "loose fit on purpose" rule is real
   practice, but no source here gives a millimetre figure.
7. **Whether the elastomer suppressor is externally visible** on vibratory
   hammers generally. On the one machine rendered here it is enclosed. One
   machine is not the industry.
8. **Vibro eccentric-shaft count and arrangement.** The case face shows a
   staggered array of machined pockets; **it is not established that pocket count
   equals eccentric count**, and no cutaway of a vibrator exists in this material.
9. **Sheet-pile clamp geometry.** Weights and forces are sourced; shape is not —
   there is no image of a sheet-pile clamp in either brochure.
10. **Power-pack PP900 weight**, and every PP-series figure above PP900.
11. **Leader-mounted vibratory hammer geometry.** The whole vibro brochure is
    free-hanging machines. The leader-mounted arrangement the game uses is
    unsourced here.
12. **Blow-count-to-set practice, driving criteria, and pile-head damage
    thresholds.** Behavioural, not geometric — but the game's `scoring` field
    claims it, so it needs a source it does not have.
13. **Everything about diesel hammers and drop hammers.** Not in this material at
    all. If the game ever offers a period or low-cost hammer, it is unsourced.

---

## 9. Domain-truth warnings — what the game currently gets wrong

Read from `src/rig/tools.js` and `src/rig/rigFactory.js`. **Read only; nothing
edited.** Ranked by how badly a working driller would react.

The current `piling-leader` spec block (`rigFactory.js` l. 6278):

```
id: 'piling-leader', name: 'Bergholt PM-78 Leaderline',
weightKg: 78000, powerKw: 280, leaderM: 21.0, telescopeStrokeMm: 4000,
leaderCapacityKg: 20000, recommendedRamKg: '5000-9000', maxPileM: 25,
hammerRamKg: 9000, hammerEnergyKNm: 106, hammerStrokeMm: 1200, blowRateMin: '40-100',
```

**First, the good news, so nobody "fixes" it:** `hammerRamKg: 9000` /
`hammerEnergyKNm: 106` / `hammerStrokeMm: 1200` / `blowRateMin: '40-100'` is an
**exact match** to a real 9 t hammer in the p.9 table. Those four numbers are
right and internally consistent. Leave them alone.

### 9.1 The hammer length curve is too steep — the biggest geometric error

`IMPACT_HAMMER` (`tools.js` l. 8021) runs **5 400 → 10 400 mm** for **3 t → 30 t**
of ram. That is a **1.93×** length increase for a **10×** ram increase, an
exponent of **0.285**. The real box-framed line runs **5 160 → 8 375 mm**, a
**1.62×** increase, exponent **0.21** (§3, ratio 1).

**Consequence:** the game's biggest hammer is **2.0 m too long** — 10 400 mm
against a real 8 375 mm for the same 30 t ram and the same 441 kNm. On a 21 m
leader that is nearly **10 % of the mast height** of surplus hammer, and it will
look wrong beside the pile.

### 9.2 Two table rows are cross-bred from different real machines

- The **30 t row** takes its **energy, stroke and blow rate** (441 kNm / 1 500 mm
  / 30–100) from one real machine and its **length and weight** (10 400 mm /
  46 700 kg) from a **different** one — the round-cased 500 kNm machine, whose
  published figures are 10 418 mm / 46 700 kg. The two are not the same hammer:
  one has a 1 500 mm stroke, the other 1 200 mm.
- The **3 t row** takes energy and blow rate (35 kNm / 40–100) from the
  1 200 mm-stroke line and length and weight (5 400 mm / 6 900 kg) from the
  higher-blow-rate line (5 432 / 6 920). Minor, but the same fault.

This is the repo's own **"Two tables describing one thing"** failure pattern
(`HANDOFF.md` §8B) reappearing inside a single table.

### 9.3 Hammer masses run 25–32 % heavy in the middle of the range

| ram | game mass | nearest real machine at that ram and energy | error |
|---|---|---|---|
| 9 000 kg | **17 800 kg** | 13 500 kg | **+32 %** |
| 16 000 kg | **30 500 kg** | 23 200 kg (or 24 400) | **+25 to +31 %** |
| 30 000 kg | 46 700 kg | 48 000 kg | −2.7 % |
| 3 000 kg | 6 900 kg | 6 000 kg (or 6 920) | ±0 to +15 % |

The **hammer-mass ÷ ram-mass** ratio is the check: real is **1.45–1.60** at 9 t
and 16 t; the game is **1.98** and **1.91**. Only the 3 t and 30 t rows are in
range. This is a physics-facing number — energy per blow and the load on the
leader both depend on it.

### 9.4 The vibratory hammer is the wrong shape, and its frequency is badly wrong

`buildVibratoryHammer` (`tools.js` l. 8152) at the 1 500 kN preset:

```
const W = mm(1050) * k;  const H = mm(1150) * k;  const D = mm(620) * k;
'vibro-hammer-1500': { forceKn: 1500, rpm: 2500, massKg: 5070 }
'vibro-hammer-700':  { forceKn: 700,  rpm: 2300, massKg: 2400 }
```

- **`rpm: 2500` at 1 500 kN is about 56 % too high.** Every normal-frequency
  machine in the sourced table runs **1 400–1 700 rpm**, and at 1 409 kN the
  published figure is **1 600 rpm**. `vibro-hammer-700` at **2 300 rpm** against a
  published **1 700 rpm** at 795 kN is **35 % high**. Frequency is the number a
  vibro operator knows by heart, and it drives the audio and the shake amplitude.
  **This is the most embarrassing single error in this document's scope.**
- **The case proportion is wrong in every axis.** 1 050 × 1 150 × 620 mm is close
  to a cube (L : H : W = 1.7 : 1.9 : 1). The real 120-class machine is
  **7.3 : 5.9 : 1**, and even the smallest in the range is 5.4 : 4.3 : 1. The game
  builds a **box**; the real thing is a **slab**.
- **Height and width are inverted relative to reality.** The game has H > W_case
  and a shallow depth; but it also makes the machine **taller than it is long**,
  where every real one is **longer than it is tall**.
- **`eccentric-housing` is drawn as cylinders passing through the case and
  standing proud of both faces** (`G.cyl(..., D * 1.02, seg)`, rotated on X). The
  real case face carries **flush machined oval pockets with radiused ends, in a
  staggered two-row array, each ringed with small bolts** — recessed, not
  protruding, and not circular. See `vh120_exciter.png`.
- **There is no suspension yoke.** The game builds a flat `suspension-head` plate
  with four exposed rubber cylinders below it. The reference machine has an
  **inverted-U channel yoke straddling the case with the isolators enclosed
  inside the legs**. The yoke is the machine's most recognisable feature and the
  game does not have it. (Whether exposed isolators are correct for *some* makes
  is `NOT SOURCED` — §8.7 — but the yoke is definitely missing.)
- **The hose block is on the wrong face.** The game puts it at the **back, near
  the top** (`-D * 0.66`, `ey + H * 0.42`) with **three** hoses. The reference has
  a **six-coupling manifold plate on the SIDE at mid-height**.
- **Amplitude is not modelled or declared.** The sourced range is **19–26 mm**,
  and it is the parameter that decides whether a pile moves. Worth adding to the
  spec block as a sourced field.
- **The clamp is drawn integral with the machine.** In the sources the clamp is a
  **separately catalogued item with its own model, force and weight** — 307 to
  2 553 kg — and it is changed between sheet-pile and tube work. Modelling it as a
  swappable child object would be both more correct and more useful.

### 9.5 The mass ÷ force relationship for vibros is roughly right — keep it

`massKg: 5070` at 1 500 kN is **3.4 kg/kN**; `2 400` at 700 kN is **3.4 kg/kN**.
The sourced range is **3.9–6.0 kg/kN** (average ≈ 4.5). The game is **light by
about 15–25 %** but is in the right family, and the two presets are at least
consistent with each other. Lower priority than everything above.

### 9.6 Things the game already gets RIGHT — do not "fix" these

- **`ramModular: true`** and the four-size `IMPACT_HAMMER` key set. Real: the ram
  block is modular with 1 t and 2 t extensions on one frame.
- **The drive cap as a separate `castIron` part at the foot**, and a **separate
  `drive-cap` and `pile-helmet` tool**. Correct — they are separate items.
- **The helmet comment in `buildPileHelmet`**: *"the helmet must NOT be a tight
  fit on the pile head — it has to let the pile rotate when it hits an
  obstruction."* That is exactly right and is the kind of thing a driller checks.
- **`alsoExtracts: true`** on the vibratory hammer. Correct, and it is half of
  what a vibro is for.
- **`bestIn: 'Granular soils and low-displacement sections; poor in stiff clay'`**.
  Consistent with the selection chart on `Junttan_Vibratory_Hammers_brochure_2023_web.pdf`
  p.3, which plots pile weight against soil density from loose to very dense.
- **The precast pile is octagonal, not square** (`buildPrecastPile`, l. 7528), with
  a chamfer *"on every real pile"*, close-pitched links at **both** ends, and
  **mould seams down two opposite faces**. That is a genuinely well-observed
  model. Leave it.
- **The bolted side plates with eleven bolts a side on the impact hammer**
  (l. 8060). A hammer is a bolted assembly and it looks like one. Right instinct.
- **The serrated grip teeth on the vibro clamp jaws** (l. 8232, *"a smooth jaw
  would drop the pile"*). Right, and confirmed by the reference image.

### 9.7 Two smaller notes

- **`vibratory-hammer` is parked on the pile store at `y = 2.10`**
  (`rigFactory.js`, `vib.position.set(2.60, 2.10, -3.20)`) — i.e. **floating 2.1 m
  in the air** beside the rig. A 5 t vibrator with no support under it. Either
  stand it on a stillage or hang it from something.
- **`priceEur` for the impact hammer is `48000 + ramKg * 19`** — a 30 t hammer at
  €618 k. No source in this material supports any price. It is a game-economy
  number, which is fine, but it should not be presented to the player as a fact.
