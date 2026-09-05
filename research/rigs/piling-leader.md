# Rig reference: `piling-leader` — Driven-piling leader rig, hydraulic impact hammer (Junttan class)

status: complete (2026-09-04)
Subject: game rig id `piling-leader` (in-game name "Bergholt DP-78 Leaderline")
Builder: `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` → `buildPilingLeader()`
Purpose: GEOMETRY + MATERIALS reference for the modeller. Not a gameplay balance sheet.

> **Naming rule (DOMAIN.md §10).** Everything below is sourced from real manufacturers
> (Junttan Oy, RTG, ABI, SSAB/Ruukki, Peikko). Those names and model designations are cited
> here ONLY so the geometry is traceable. **Do not put any real manufacturer name, model
> number, logo or badge shape on the model.** Decals must be the game's own fictional brand.
> Copy the *shapes*, never the *badges*. This matters especially here: the game's current
> spec block is a near-verbatim transcription of a real Junttan PM 25H datasheet (see §9).

---

## 1. Sources read

All paths under `C:\Users\henri\Downloads`.

| File | Pages read | What it actually showed | Useful? |
|---|---|---|---|
| `13915_Junttan_PM25H_Datasheet.pdf` | 1-2 of 3 | **The single most valuable document in the folder.** p.1 is a full-height side elevation in working position. p.2 carries the complete technical table AND two *dimensioned* GA drawings (standard config and longest-leader config). Every hard number in §3 comes from here. I also pixel-scanned p.1 to measure the leader hole pattern. | YES — primary |
| `Junttan_Hammers_brochure_EN_2025_web.pdf` | text of all; technical-data spread in detail | Full HHK Classic / SHK and HHX X-series spec tables: ram weight, energy, stroke, blow rate, **hammer length and weight**, drive-cap sizes. Plus the noise-control and drive-cap/dolly narrative. The marketing pages in the first third are pure copy and gave nothing. | YES — hammer proportions |
| `Junttan_General_Brochure_General_2022_web.pdf` | index of 9; p.2 and p.4 in detail | p.4 carries the full pile-driving-rig comparison tables (PMx22–PMx28, PM16 / PM23LC / PM25H) **and three usable photographs**: a rig on timber mats at a quay, a close-up of a precast pile in the leader guides with the hose bundle, and a long-range two-rig silhouette. It also gave the 2022 figures that **disagree** with the 2011 datasheet. | YES |
| `16291_Junttan_Piling_brochure_3_2013_WEB.pdf` | index of 11; p.1 and p.7 | **p.1, the cover, is the best photograph in the whole folder** for this class (see §7). p.7 is rig-model copy; pp. 3–5 are application illustrations not needed here. | YES — photo |
| `rtg-rammtechnik-gmbh-rg-rammgerät-im-einsatz-pile-driver-in-action-2023.jpg.webp` | image | Low three-quarter working shot of an RTG leader rig. Best available reference for the A-frame plate structure, the cab and its FOPS guard, the track cross-carrier, and real working grime. Carries a drilling head, not a hammer — carrier architecture right, tool wrong. | YES — materials |
| `drillity-the-game/research/` packs `05-foundation-piling.md`, `10-oem-foundation.md`, `16-site-archetypes.md`, `18-visual-reference.md` | grepped; §C1, §A1, §A.10, §B.4 read | **Packs 05 and 10 already cover this class well.** Pack 05 §C1 has the rig archetype, a four-tier size ladder, the telescopic-vs-fixed-leader distinction, what moves, and the hammer size range; §A1 has the helmet / dolly / packing consumable story and driving-to-set practice. Pack 10 §A.10 has the Junttan naming conventions and §B.4 the rig ladder. **This document deliberately does not repeat them** — it adds the drawing-derived geometry they lack. Pack 18 is a cross-section animation reference, not a rig source. | YES — context |
| `PalPile-Brochure-2025.pdf` | first pages | Steel piling **products** catalogue — sheet piles, tubes, bracing, micro piling, casing. Nothing about rigs. | NO |
| `EPD_SSdr-pile_2022.pdf` | first pages | ISO 14025 Environmental Product Declaration for SSdr piles. Carbon accounting. Zero geometry. | NO |
| `Junttan_Vibratory_Hammers_brochure_2023_web.pdf`, `Junttan_VH120_vibro-hammer_datasheet-1.pdf` | first pages | **Free-hanging, crane-suspended** vibro hammers — a different mounting and a different rig. Relevant only to the spare vibrator sitting in the game's pile store. | NO for this rig |
| `pile-design-and-construction.pdf` | not opened | Design / theory text. Pack 05 already mines a design text for set and driving practice. Flagged in §8. | NOT READ |
| `Atpa\` (folder listing), `00a0012.jpg`, `AdobeStock_576965172.jpeg` | listing / images | Swept for photographs of this class. Atpa is ATPA drill-tooling product shots; the two root images are a studio portrait and a generic stock PPE illustration. **No piling-rig photographs.** | NO |

**Tooling note for whoever runs this next.** The Read tool cannot render PDFs on this machine —
`pdftoppm` (poppler-utils) is not installed and Read fails on any PDF. But `pdftotext -layout`
**is** on PATH and **PyMuPDF works** (`import pymupdf`). Render a page to PNG with
`page.get_pixmap(matrix=pymupdf.Matrix(z, z))`, save it, then Read the PNG. That is how every
drawing in this document was read, and it is also how the leader hole pattern was measured.

---

## 2. What the machine IS

A **crawler-mounted, self-erecting, telescopic-leader driven-piling rig** — the "purpose-built
piling rig" class, not a crane with a lead hung off it. There is **no boom**. A single very tall
vertical leader (a "leader" or "mast"; British sites say *leader*, some say *lead*) is pinned to
the front of a slewing upperstructure and braced back to it by an A-frame and rake cylinders. A
**hydraulic impact hammer** rides up and down that leader on guide shoes, hanging on its own
winch rope; the pile hangs below it on a second rope, guided by the same leader. The machine
stands the leader up on its own hydraulics in a few minutes (self-erecting), spots the pile by
sliding the whole leader horizontally on the carrier, rakes the leader fore/aft and sideways for
raked piles, drives the pile to set, then tracks a few metres to the next pile position and does
it again. It works standing on the ground — no outriggers under the tracks in normal driving —
and its stability comes from mass, a very low centre of gravity, a **hydraulically expandable
track gauge** and a **movable counterweight**. It lives on soft-ground foundation sites:
housing plots, bridge abutments, quay walls, wind-farm bases. It is a production machine —
its whole design is about doing one pile every few minutes, all day.

Two things a driller would insist on that the silhouette must show:
1. **The leader is taller than everything else by a factor of four or five.** The carrier is a
   low, squat, wide box; the leader is a thin line going up out of frame.
2. **The leader runs down past the tracks to the ground, and the pile goes down the leader.**
   The bottom of the leader is at or below track-top level, right at the pile.

---

## 3. Proportions

All figures from `13915_Junttan_PM25H_Datasheet.pdf` p.2 unless noted.
Ratios matter more than absolutes — the ratio column is what to model to.

### Hard, tabulated numbers (p.2 "Technical Data")

| Quantity | Value | Ratio / note |
|---|---|---|
| Nominal operational weight | **78 000 kg** | ~78 t class |
| Overall height, standard config | **26 500 mm** (87 ft) | dimensioned on the left GA, p.2 |
| Overall height, longest leader config | **30 650 mm** (100½ ft) | right GA, p.2 |
| Crawler length | **5 700 mm** (225 in) | the master scale bar |
| Track gauge, min (travel) | **3 380 mm** over 900 mm shoes | |
| Track gauge, max (working) | **4 880 mm** over 900 mm shoes | **expands 1 500 mm** |
| Track shoe width options | **800 / 900 / 1 000 mm** | 900 is the datasheet default |
| Slewing ring | **1 600 mm**, single row, single drive | |
| Counterweight | **6 000 kg + 2 000 kg extendable** | |
| Leader telescope stroke | **4 000 mm** | |
| Leader foot travel up/down | **1 000 / 500 mm** | |
| Leader horizontal (spotting) travel | **1 500 mm** | |
| Leader capacity | 20 000 kg | |
| Pile winch / hammer winch / aux winch | 10 000 / 15 000 / 5 000 kg | **three** winches, not two |
| Max pile length | 25 m (with the smallest recommended hammer) | |
| Engine | 280 kW (376 hp) | |
| Fuel / hydraulic oil tank | 420 l / 670 l | |
| Hydraulic max pressure | 320 bar; flow 2×280 + 120 l/min | |

### Dimensioned on the GA drawing (p.2, left elevation, "Standard PM 25H with HHK 7A hammer")

| Dimension | Value | What it is |
|---|---|---|
| Track frame, sprocket-to-idler centres | **4 800 mm** | inner dim on the crawler |
| Track frame, overall | **5 700 mm** | outer dim on the crawler |
| Pile axis → slew centre | **5 100 … 3 600 mm** | range = the 1 500 mm horizontal leader shift |
| Slew centre → rear extremity | **4 200 … 5 700 mm** | range = 1 500 mm; sums with the above to a constant 9 300 mm total |
| Leader below reference / foot region | **4 000 mm** (13⅛ ft) | vertical dim at the leader foot |
| Upper vertical chain (top down) | **900 · 1 800 · 6 000 · 13 800** mm | leader section breaks; 13 800 mm (45¼ ft) is the big lower span |

**Two sources disagree — record both, do not pick one:** the GA's rear overhang range
(4 200…5 700 mm) and the pile-axis range (5 100…3 600 mm) both span exactly 1 500 mm and always
sum to 9 300 mm. That is consistent with the counterweight extending in step with the leader
shift, but the datasheet never says so in words. **Treat the linkage as unconfirmed.**

### Derived ratios for the modeller (calibrate on crawler length = 5 700 mm)

- **Overall height : crawler length = 26 500 : 5 700 ≈ 4.65 : 1.** This is the ratio that makes
  the machine read correctly. If the mast looks less than ~4.5 crawler-lengths tall, it is wrong.
- **Track gauge : crawler length = 4 880 : 5 700 ≈ 0.86 : 1 working, 0.59 : 1 travelling.**
  Working stance is nearly as wide as it is long — squat and square in plan.
- Total plan length (pile axis to rear) : crawler length = 9 300 : 5 700 ≈ **1.63 : 1**.
  The machine overhangs its own tracks substantially, front *and* rear.
- Scaled off the p.2 GA against the 5 700 mm bar (±5 %, my measurement not a printed dim):
  track frame height incl. grousers **≈ 800–900 mm**; cab **≈ 1 900 mm long × 1 900 mm tall**;
  engine house **≈ 3 100 mm long × 1 500 mm tall** above the deck.

### The hammer's own proportions (this drives the whole carriage)

From `C:\Users\henri\Downloads\Junttan_Hammers_brochure_EN_2025_web.pdf`, "Technical Data"
spread (Classic Series HHK-A / HHK-S tables and X-Series SHK / HHX tables):

| Model | Ram block | Max energy | Stroke | Blow rate | **Hammer length\*** | Hammer weight\* | Drive caps |
|---|---|---|---|---|---|---|---|
| HHK3A | 3 000 kg | 35 kNm | 1 200 mm | 40-100 | 5 160 mm | 6 000 kg | 470x470 mm / d770 mm |
| HHK5A | 5 000 kg | 59 kNm | 1 200 mm | 40-100 | 5 900 mm | 8 400 kg | 470x470 / d770 |
| **HHK7A** (the hammer drawn on the PM 25H GA) | 7 000 kg | 82 kNm | 1 200 mm | 40-100 | **6 640 mm** | 11 000 kg | 550x550 / d850 |
| HHK9A | 9 000 kg | 106 kNm | 1 200 mm | 40-100 | **7 380 mm** | 13 500 kg | 550x550 / d850 |
| SHK5 (X-series; PM25H "recommended type" is SHK110-5..-9) | 5 000 kg | 61 kNm | 1 200 mm | 50-140+ | 6 172 mm | 9 250 kg | 470x470 / d770 |
| SHK9 | 9 000 kg | 119 kNm | 1 200 mm | 50-140+ | 7 675 mm | 14 800 kg | 550x550 / d850 |

\* The brochure's own footnote: "Excluding cap and sleeve". Add the drive cap and pile sleeve and
a 9 t-ram hammer is **over 8 m long overall**.

**This is the proportion the game most needs to get right.** A 9 000 kg-ram hammer body is
**7.4 m long on a 26.5 m leader - 28 % of the leader height.** It is not a small block sliding up
a big mast; it is a long slender frame-plus-cylinder that occupies more than a quarter of the
leader. Modelled to scale, the hammer alone reads as a machine.

Ram stroke is **1 200 mm** across the Classic A-series and the X-series SHK line (1 500 mm on the
heavier S-series). That is the visible ram travel inside the hammer frame - the animation
amplitude. Blow rate 40-100/min (Classic) or 50-140+/min (X-series).

Drive cap face sizes are small and specific: **470x470 mm square** or **d770 mm round** for
3-5 t rams; **550x550 mm / d850 mm** for 7-9 t rams. Note these are *bigger* than the pile: a
350 mm precast pile goes into a 470 mm cap with a timber/plastic cushion around it.

---

## 4. Component inventory

Ordered roughly bottom-to-top. "Why it matters" is what the part does for the *silhouette*,
not what it does for the machine.

### 4.1 Undercarriage

- **Crawler frames, 5 700 mm long, D7A-type track chain** `[PM25H p.2]`. Track shoes
  **800 / 900 / 1 000 mm wide**, offered with **3-edge (triple grouser), flat-edged, or flat**
  surface and **normal / chamfered / bent** edge type `[PM25H p.2]`. Default 900 mm.
  *Why it matters:* 900 mm shoes on a 5 700 mm frame is a **very wide, short track** — the plan
  aspect is nothing like an excavator. Triple-grouser shoes are the default read.
- **Expanding track gauge, 3 380 to 4 880 mm** `[PM25H p.2]`. The track frames slide outward on
  telescoping cross-carriers under the turntable. In the RTG photo
  (`rtg-rammtechnik-...2023.jpg.webp`) the **cross-carrier is a visible heavy dark fabricated box
  between the upperstructure and the track frame**, standing proud of everything around it.
  *Why it matters:* this is the one undercarriage detail that says "piling rig" and not
  "excavator". Model the carrier beams as real, visible, greasy structure — not hidden.
- **Sprocket / idler.** On the PM25H GA side elevation the large toothed wheel is at the **rear**
  (counterweight end) and the rounded idler at the **front** (leader end) — drive at the back,
  idler under the leader. `SCALED FROM DRAWING, not a printed note` — verify before treating as
  certain. Roughly **9 bottom track rollers** and **2-3 carrier rollers** per side, counted off
  the GA.
  *Why it matters:* under the leader is the idler, which is smooth and takes the pounding.
- **No outriggers under the tracks in normal driving.** The datasheet lists **"rear support
  legs"** as an *option* only `[PM25H p.2]`, and the GA draws a single **vertical jack with a
  round foot pad at the extreme rear**, behind the counterweight. There is nothing under the front.
  *Why it matters:* the game currently puts a pair of front jacks under the leader. See §9.

### 4.2 Upperstructure

- **Slewing ring: 1 600 mm, single row, single drive** `[PM25H p.2]`. On the GA it reads as a
  narrow hatched band between the car body and the deck — a thin tidy joint, not a big turret.
- **Deck / machine house.** A **low, long, slab-sided box**, roughly 3.1 m long and 1.5 m tall
  above the deck (scaled off the GA, plus/minus 5 %), with the engine and coolers in it. Fuel
  420 l, hydraulic oil 670 l, **2 x T8 coolers** `[PM25H p.2]` — so there is a lot of radiator
  area, and the house needs real grille panels, not a painted rectangle.
- **Counterweight, 6 000 kg + 2 000 kg extendable** `[PM25H p.2]`. On the GA it is a **flat slab
  at the very rear**, roughly flush with the house sides, not a bulbous crane counterweight.
- **Operator cab.** Scaled off the GA at roughly **1 900 mm long x 1 900 mm tall**, sitting
  **forward on the deck, immediately behind the leader**, raised on a pedestal so the operator's
  eye line clears the track top. In the RTG photo the cab is a **tall narrow glasshouse with a
  full-height front screen**, a **curved tubular FOPS guard cage standing off the front glass**,
  and a **flat step platform at its base**. Junttan's own text stresses an "ergonomic and safety
  tested cabin" `[PM25H p.2]`.
  *Why it matters:* the operator has to look **straight up the leader**, so the cab is offset to
  one side of the pile axis and heavily glazed for an upward view. That offset is a silhouette cue.
- **Deck walkways and handrails.** Visible in the Junttan 2022 general brochure p.4 top-right
  marine photo: a walkway with a **plain tubular handrail** along the top of the house, a
  **rotating amber beacon on a stalk**, and **two thin whip aerials** at the rear. The RTG photo
  shows the same: aerials, beacon, and a boarding ladder.

### 4.3 The leader — the whole identity of the machine

- **Type: telescopic**, "Telescopic PM25H" `[PM25H p.2]`. Two nested sections; **4 000 mm of
  telescope stroke**. Transport height comes down, working height goes up.
- **Cross-section: a welded BOX / plate girder, NOT a lattice.** On both GA drawings the leader
  side plate carries a **continuous row of large round lightening holes running its entire
  length**. Measured off the p.1 elevation by pixel scan, calibrated on the 26 500 mm overall
  height: **hole pitch about 580-600 mm, hole diameter about 230-250 mm** — the hole is about
  **0.41 x the pitch**, and the pitch is about **1/45 of the leader height**. The leader's
  fore-aft depth scales to **about 1.0 m**, roughly **1.7 x the hole pitch**.
  `SCALED FROM DRAWING, plus/minus 10 %. Not a printed dimension.`
  *Why it matters:* **this is the single strongest identifying feature of the class, and the game
  does not have it.** A 26 m leader with ~45 evenly spaced round holes reads instantly as a piling
  leader. A plain box with splice flanges reads as a mast off any other rig.
- **Guide rails.** The hammer and the pile carriage run on rails on the *front* face. The hammer
  grips them with **guide jaws / shoes** top and bottom. Everything that rides the leader is
  captured by it — nothing swings free.
- **Leader foot,** with **1 000 mm up / 500 mm down** travel `[PM25H p.2]`. The foot reaches
  **down past the track line to the ground at the pile**, and can push down to bear or lift to
  clear. On the GA the leader continues **below the top of the tracks**, right down to the ground.
- **Horizontal leader shift, 1 500 mm** `[PM25H p.2]` — the whole leader slides fore/aft on a
  slide on the front of the carrier to spot the pile without tracking the machine. On the GA this
  is why the pile-axis dimension is a **range, 5 100 to 3 600 mm** from the slew centre.
- **Rake.** Fore/aft *and* sideways, "according separate capacity tables", with an **electronic
  inclinometer included as standard** `[PM25H p.2]`. Raked piles are real work; the leader
  visibly leans.
- **A-frame / backstay.** On the GA, and clearly in the RTG photo, this is **not two thin struts** —
  it is a **deep fabricated plate structure**, a tapering triangular box running from the front of
  the machine house up to a bracket on the leader, itself **pierced with large lightening holes**.
  Alongside it runs **one heavy hydraulic rake cylinder per side** with a bright chrome rod, plus
  slender **tie rods / stays** as a second thinner line. The Junttan 2022 marine photo shows four
  near-parallel dark lines going up: two heavy members and two thin ties.
  *Why it matters:* the triangle between leader, backstay and deck is the second-strongest
  silhouette cue after the leader itself.
- **Leader head / cathead.** A block at the top carrying the sheaves for the hammer line and the
  pile line. A **side cathead** is a listed option `[PM25H p.2]`.
- **Self-erecting** — the rig raises its own leader and is transported **in one piece without
  removing the hammer** `[Junttan 2013 piling brochure]`. That means the erection hinge, the
  erection cylinder and the transport cradle are all real hardware and should be modelled.

### 4.4 Winches — there are THREE

`[PM25H p.2]`: **pile winch 10 000 kg**, **hammer winch 15 000 kg**, **auxiliary winch 5 000 kg**
(the auxiliary is listed under Accessories, so it is an option).
The 2022 general brochure gives the same machine's hammer winch as **16 500 kg** —
*the two sources disagree; both recorded, neither picked.*
*Why it matters:* two ropes run up the leader and over the head — one to the hammer, one to the
pile. When the hammer is high and a pile is being pitched, both ropes are loaded, at different
angles, and both are visible against the sky.

### 4.5 The hammer and everything under it

- **Hammer body:** a long slender bolted steel frame — see the table in §3. 6.6 m (7 t ram) to
  7.4 m (9 t ram) **excluding cap and sleeve**. Ram stroke 1 200 mm.
- **Guide jaws** top and bottom, gripping the leader rails.
- **Hydraulic hoses** running from the carrier up the leader to the hammer. In the Junttan 2022
  brochure p.4 close-up the hoses are a **black bundle strapped down the side of the leader with a
  service loop**, not a tidy internal run. In the RTG photo a **loose hose/cable loop hangs free
  at mid-leader**. Hose routing on this machine is external, visible and slightly untidy.
- **Drive cap / helmet / dolly / packing.** Drive cap faces **470x470 mm or 770 mm dia** (3-5 t
  rams) and **550x550 mm or 850 mm dia** (7-9 t rams) `[Junttan hammers 2025]`. Between hammer
  and pile: a **helmet** holding a resilient **dolly** (cap block) with **packing** on the pile
  head; the helmet **must not fit tightly**, so the pile can rotate if it strikes an obstruction
  `[research pack 05 §A1, citing Tomlinson]`. Dollies: elm for easy driving;
  oak / greenheart / pynkado / hickory set end-on to the grain for harder driving; laminated
  phenolic-resin plastic for hard concrete and steel.
  *Why it matters:* the drive cap is **wider than the pile**, and the joint is loose and grubby —
  splintered timber, shredded packing, burred steel. That is where the wear story lives.
- **Noise-control variants** exist and look different: special drive caps, **guide tubes** and
  **insulation jackets** over the hammer `[Junttan hammers 2025]`. A good visual upgrade path.

### 4.6 Optional third tool (good silhouette variation)

`[PM25H p.2, Accessories]`: **side cathead**, **side auger (JD3)**, **rear support legs**,
**auxiliary winch**, **air conditioning**, **iPiler PCD** (the on-board pile-driving data system).
The general text adds "an optional side drill or vibrator hammer". These bolt to the *side* of the
leader and change the profile noticeably.

---

## 5. Distinctive features (thumbnail silhouette)

Five things. If a 64-px thumbnail has these, a driller reads it correctly.

1. **One line, and it is enormous.** Overall height : crawler length = **4.65 : 1**. Nothing else
   on a construction site has that ratio with no boom.
2. **The perforated leader.** A continuous ladder of large round holes down the full length of a
   plain box mast, pitch about 1/45 of the mast height. Reads even at thumbnail size, as a dotted
   line up the mast.
3. **The deep triangular backstay** from the machine house up to a point roughly halfway up the
   leader, pierced with its own holes, with a chrome-rodded rake cylinder inside the triangle.
4. **A long dark object hanging a quarter of the way down the mast** — the hammer, 7 m-plus of it —
   with a pile below it going into the ground. Not a small sliding block.
5. **A wide, short, low carrier.** Working track gauge about 0.86 x crawler length; the carrier is
   barely taller than the tracks plus a cab. It looks *squashed* under the mast, and the mast foot
   runs down past the front of the tracks to the ground.

Sixth, if there is room: **the mast is often not vertical.** Raked piles are normal work.

---

## 6. Materials and paint

Sourced from the photographs in §7; general engineering practice is flagged where it is not
directly visible in a source.

| Surface | Finish |
|---|---|
| Machine house, counterweight, cab shell, leader body | **Painted steel**, gloss, flat welded panels with visible seams and bolted access covers. Contractor liveries observed in the sources: green + orange diagonal (Junttan 2022 p.4 marine photo), yellow + white (Junttan 2022 p.4 site photo), yellow + dark grey (RTG photo). The leader is often painted a **different, darker colour than the carrier** — dark navy / near-black in the Junttan 2022 p.4 close-up. |
| A-frame / backstay | Usually **darker than the body** — near-black in both the marine photo and the general-brochure close-up. |
| Leader guide rails, hammer guide jaws, sheave grooves, drive-cap face | **Bare polished steel**, worn bright by contact. These are the only genuinely shiny metal surfaces on the machine. |
| Cylinder rods (rake, erection, foot, track spread) | **Chrome**, bright, but with an oil film and a dirt collar at the gland. |
| Hoses and cable runs | **Black rubber**, matte, dusty, with steel P-clips and abrasion sleeves at the rub points. |
| Tracks, sprocket, idler, rollers, cross-carriers | **Bare / oxidised steel** where the paint has been ground off. Rust-brown on the shoe faces, polished bright on the roller and link running surfaces, black grease at the pins. |
| Glass | Cab glazing, large, and usually **filthy at the bottom and clean where the wiper sweeps**. |
| Precast concrete piles | **Light warm grey**, matte, sharp chamfered arrises, cast-in lifting points, plain cast face. |
| Timber mats under the tracks | Weathered grey-brown hardwood, oily and mud-smeared. In the Junttan 2022 marine photo the whole rig is working off a **timber mat platform** — a genuine and very cheap piece of site dressing. |

**Where dirt, wear and rust actually accumulate on a working machine:**

- **The bottom 1.5 m of the leader**, worst of all. Everything the pile brings up — spoil, water,
  grout, splintered dolly timber — is thrown at the leader foot. It is the dirtiest single place
  on the machine and the most important place to dirty in the model.
- **The guide rails** get a bright polished stripe exactly where the hammer jaws run, and rust
  above and below that stripe where the hammer never travels. The stripe is a free storytelling
  detail: its length tells you how far the hammer normally goes.
- **Track frames and cross-carriers:** caked mud in the recesses, bright polished links, oil weep
  from the final drive.
- **The drive cap and helmet:** splintered hardwood, shredded packing hanging out, hammered and
  burred steel edges, concrete dust.
- **Deck and walkway plate:** worn through to bare steel on the walked lines, oily near the
  hydraulic tank.
- **Around the winch drums:** rope dressing — black tar-like grease — flung onto the surrounding
  paint.
- **Chip and scrape damage on every leading edge:** leader foot, track frame ends, counterweight
  corners, cab step. This machine gets reversed into things all day.
- **The exhaust stack** discolours and streaks the paint behind it.

## 7. Photo references

All paths are under `C:\Users\henri\Downloads`.

### Best in the folder for this class

| Image | What it shows | Use it for |
|---|---|---|
| `16291_Junttan_Piling_brochure_3_2013_WEB.pdf` **p.1 (cover photo)** | Full three-quarter view of a working driven-piling leader rig on a bulk-materials site: **blue leader on a red carrier**, hammer up near the top of the leader, a field of already-driven steel piles cut off at random heights, a next pile standing on the auxiliary line. | **The single best photograph available.** It confirms the round lightening holes visually (they are plainly visible down the blue leader), the leader/carrier two-colour scheme, the backstay geometry, and the huge free-hanging hose loop. |
| `13915_Junttan_PM25H_Datasheet.pdf` **p.1** | Full-height clean side elevation, working position, no dimensions. | Overall proportion, leader hole pattern, backstay angle, where the hammer sits, how far the leader foot goes below the tracks. |
| `13915_Junttan_PM25H_Datasheet.pdf` **p.2** | Two *dimensioned* GA drawings side by side. | Every hard dimension. Also the clearest view of cab, engine house, counterweight, rear support leg, slew ring, track roller layout. |
| `rtg-rammtechnik-gmbh-rg-rammgerät-im-einsatz-pile-driver-in-action-2023.jpg.webp` | Low three-quarter shot of an RTG leader rig working in rock, dust everywhere. | **Best material/wear reference.** The A-frame as a deep pierced plate box; the cab as a tall glasshouse with a tubular FOPS guard; the track cross-carrier; the aerials and beacon; a working machine's actual colour of grime. *Caveat: this one carries a drilling head, not an impact hammer — the tool is wrong, the carrier and leader architecture are right.* |
| `Junttan_General_Brochure_General_2022_web.pdf` **p.4** | Three photos plus the full rig comparison tables. Top-right: a green/orange rig **working off a timber mat platform** at a quay, driving steel. Lower-right: a close-up of the leader with a **grey precast pile in the guides and a black hose bundle strapped down the leader**. Background: two rigs on an urban site, good long-range silhouette. | Livery, timber mats, hose routing, pile-in-guides close-up, and the cross-model spec tables. |

### Checked and NOT useful for this rig

- `00a0012.jpg` — a studio portrait of a person. Nothing to do with machinery.
- `AdobeStock_576965172.jpeg` — generic stock "workers in orange PPE at night" illustration. No rig geometry.
- `C:\Users\henri\Downloads\Atpa\` — swept the file listing: ATPA drill-tooling product photos (drill heads, casing shoes, `Sw100.JPG`, `Bohrkopf_*`), stickers and WhatsApp product shots. **No piling-rig photographs.** Not the right folder for this subject.
- `PalPile-Brochure-2025.pdf` (36 pp) — a **steel piling products** catalogue (sheet piles, tubes, bracing, micro piling, casing). Useful for what gets driven, useless for the rig.
- `EPD_SSdr-pile_2022.pdf` (10 pp) — an ISO 14025 **Environmental Product Declaration** for SSdr piles. Carbon figures. Zero geometry.
- `Junttan_Vibratory_Hammers_brochure_2023_web.pdf` / `Junttan_VH120_vibro-hammer_datasheet-1.pdf` — **free-hanging, crane-suspended** vibro hammers. Right family, wrong tool for this rig; relevant only to the spare vibrator sitting in the game's pile store.
- `pile-design-and-construction.pdf` — not opened this run. It is a design/theory text; research pack 05 already mines it for helmet/dolly/set practice. Flagged in §8.

### Site dressing worth stealing from the photographs

- A **field of already-driven piles cut off at uneven heights**, rusty brown, around the rig (2013 cover).
- **Timber crane mats** under the tracks on soft or made ground (2022 p.4 marine photo).
- **Red-topped survey pegs** in the ground marking the next pile positions (RTG photo).
- Two ground crew standing close to the leader foot in hi-vis, at the pile, not at the machine
  (2022 p.4 site photo).
- **Spare piles laid out on timber bearers** on the pad — the game already does this and it is right.

---

## 8. NOT SOURCED

Everything here is a real gap. None of it should be invented; if the modeller needs it, get a
photograph or ask.

**Geometry not printed anywhere in the local material:**

- **The leader's actual cross-section dimensions.** No printed width or depth for the leader box.
  My figures are scaled off the drawing, ±10 %.
- **The lightening-hole pitch and diameter as printed dimensions.** Only measured by pixel scan.
- **Any plan view or rear/front elevation of a machine in this class.** Every drawing in the
  folder is a side elevation. Cab width, house width, how the cab sits relative to the pile axis
  in plan, and the shape of the track cross-carriers in plan are all **unknown**.
- **Which side the cab is on.** Photographs show it beside the leader, but different machines and
  different camera sides make it ambiguous. Do not state left or right as fact.
- **Track roller and carrier-roller counts** as a printed figure — only counted off a small drawing.
- **Sprocket-at-rear vs sprocket-at-front** as a printed note. Read off the GA only.
- **Cylinder bore and rod diameters** for the rake, erection, leader-foot, and track-spread rams.
- **The number and arrangement of sheaves in the leader head**, and the exact cathead geometry.
  Both drawings render the top few metres too small to read.
- **The pile gate / pile clamp arm** that projects sideways from the leader on the GA — its shape
  and travel are unresolved.
- **The transport configuration.** The datasheet gives transport *dimensions* but draws the rig
  erect. There is **no drawing of the leader folded down for transport** in any local file, so the
  transport pose and the cradle it lands in are unsourced.
- **Whether the counterweight extension is mechanically linked to the leader shift.** The two
  1 500 mm ranges on the GA are suggestive, not stated. See §3.

**Materials not sourced:**

- **No manufacturer standard colour is stated anywhere in the local files.** Every colour in §6 is
  an observed contractor livery from a photograph, not a specification. Do not treat any of them
  as "the" colour of this machine class.
- Paint gloss level, surface finish spec, or any RAL reference.

**Documents not read this run:**

- `pile-design-and-construction.pdf` — not opened. Likely relevant to *process* (set, blow counts,
  driving damage) rather than rig geometry, and research pack 05 already draws on a design text
  for that. Worth a pass by whoever writes the gameplay side.
- `16291_Junttan_Piling_brochure_3_2013_WEB.pdf` pp. 2-6 and 8-11 — only pp. 1 and 7 examined.
  pp. 3-5 are the application-family illustrations (driven / driven cast-in-situ / drilling) and
  p. 8 is a rig comparison table; research pack 10 has already mined the naming and the ladder.

---

## 9. Domain-truth warnings vs the current game build

Read against `src/rig/rigFactory.js` → `buildPilingLeader()` and `buildLeaderMast()`, and
`src/rig/tools.js` → `buildImpactHammer()` / `IMPACT_HAMMER`.

**First, what the build already gets right, and it is a lot.** Expandable tracks (narrow 1.69 →
wide 2.44 half-gauge = 3 380 → 4 880 mm — *exactly* the datasheet numbers), 5.70 m crawler length,
900 mm shoes, movable counterweight, telescoping upper leader with 4 m stroke, fore/aft and side
rake, the spotting slide, self-erecting, a hammer carriage on guide shoes, a pile that stays in the
ground when the hammer lifts, a pile store on bearers, and a spare vibrator. All of that is
correct and sourced. The corrections below are about proportion and one missing signature feature.

### Ranked, worst first

1. **The leader has no lightening holes.** `buildLeaderMast()` builds a rounded box with splice
   flanges, stiffener ribs, guide rails and a service-line run — but no perforation. The
   continuous row of large round holes is **the identifying feature of this class** (§4.3, §5) and
   it is visible in both the datasheet drawings and the 2013 brochure cover photo. Add a hole
   every ~0.58 m at ~0.24 m diameter, through the side plate, full length. Highest value change in
   this document.

2. **The leader is too short for its own spec.** `const leaderH = 21.0`, but the same function's
   spec block claims `maxPileM: 25`. **A 25 m pile does not go in a 21 m leader.** The real machine
   needs **26 500 mm** overall for the 25 m pile, and 30 650 mm for the long-leader configuration
   `[PM25H p.2]`. Either raise `leaderH` to ~26.5 or drop `maxPileM`. As built, the height:crawler
   ratio is 21/5.7 = 3.7 : 1 where it should be **4.65 : 1** — the machine reads too stumpy.
   Note `frameRadius: 14.5` will need to grow with it.

3. **The A-frame is built as thin struts; it should be a deep pierced plate box.** The game uses
   `roundedBox(0.30, 0.30, 3.10)` per side plus a 0.20 m cylinder and a 0.13 m chrome rod, and it
   reaches only about 3 m above ground. On the real machine the backstay is a **deep tapering
   fabricated plate structure with its own lightening holes**, reaching roughly **45 % of the
   leader height**, with heavy rake cylinders inside the triangle. This is the second-strongest
   silhouette cue and currently it barely reads.

4. **Outriggers are in the wrong place.** The build puts `buildJackSet` at `[-1.55, 0.55, -0.35]`
   and `[1.55, 0.55, -0.35]` — a pair at the **front, under the leader**. The datasheet lists only
   **"rear support legs", as an option** `[PM25H p.2]`, and the GA draws a single vertical jack
   with a round foot pad at the **extreme rear behind the counterweight**. In normal driving this
   machine stands on its tracks alone. Move them aft, or drop them to an optional fit.

5. **Hoses stop at the machine.** `dyn.hoses` routes four hoses from the deck up to about
   `y = 3.6` near the leader foot. On the real machine the hydraulic hoses **run all the way up to
   the hammer** and hang in a long free catenary loop that changes shape as the hammer travels —
   unmistakable on the 2013 brochure cover and the RTG photo. Cheap to add, very high visual
   payoff, and it animates for free with the carriage.

6. **The hammer is too heavy in the data table, and slightly short.**
   `IMPACT_HAMMER[9000] = { lenMm: 7100, massKg: 17800 }`. Sourced values for a 9 000 kg ram:
   HHK9A **7 380 mm / 13 500 kg**, SHK9 **7 675 mm / 14 800 kg**, both *excluding cap and sleeve*
   `[Junttan hammers 2025]`. 17 800 kg is ~25 % high. Length is close enough.

7. **Only two winches.** The build makes `wPile` and `wHam`. The datasheet lists **three**: pile
   10 000 kg, hammer 15 000 kg, **auxiliary 5 000 kg** `[PM25H p.2]`. The auxiliary is how the next
   pile gets pitched — visible in the 2013 cover photo as a separate chain to a standing pile.

8. **Two sources disagree on two of the game's spec numbers, and the game silently uses one.**
   - `hammerWinchKg: 15000` — the 2011 PM25H datasheet says 15 000 kg; the **2022 general brochure
     says 16 500 kg** for the same machine.
   - `powerKw: 280` — the 2011 datasheet says 280 kW; the **2022 brochure says 286 kW / 272 kW**.
     Both pairs should be recorded as a range, not resolved by picking one.

9. **The counterweight is drawn as a crane-style block.** The build makes a 3.10 × 1.45 × 1.05 box
   with two lifting lugs and eyes. On the GA the counterweight is a **flat slab at the rear,
   roughly flush with the machine house sides**. It is *extendable* (the datasheet's word), not a
   stack of removable plates.

10. **The helmet does not overhang the pile.** The build fits `pile-helmet` at `pileMm: 350` on a
    350 mm pile with a 9 t-ram hammer. The real drive cap for a 7-9 t ram is **550 × 550 mm** (or
    850 mm dia round) `[Junttan hammers 2025]` — it should visibly overhang the pile head, with
    cushioning packed in the gap, because **the helmet must not fit tightly** (the pile has to be
    able to rotate on an obstruction). That loose, grubby, oversize joint is a good detail.

11. **Guide-shoe spacing on the carriage.** Guide shoes are at `±1.45 m`. For a 7.4 m hammer the
    jaws sit at roughly `±1.9 m`. Minor, but it changes how the hammer "grips" the leader visually.

### Naming — act on this before art goes near it

The spec block reproduces the Junttan PM 25H datasheet almost line for line: 78 000 kg,
20 000 kg leader capacity, 5 000-9 000 kg recommended ram, 25 m pile, 4 000 mm telescope,
1 500 mm leader shift, 5 700 mm undercarriage, 3 380-4 880 mm tracks, 6 000 + 2 000 kg
counterweight, electronic inclinometer as standard. Using the *numbers* is fine and correct — they
are how the machine is proportioned. But the in-game name is **"Bergholt DP-78 Leaderline"**, and
**`PM` is Junttan's own model prefix** (PM16, PM25H, PMx22…). Under DOMAIN.md §10 that is a real
manufacturer model designation. **Change the letter prefix**, and make sure no decal, badge shape
or panel graphic on the model imitates a real maker's mark. Same applies to the tool:
`buildImpactHammer` names itself "Drillity Leaderline Hydraulic Hammer 9 t", which is fine — keep
that pattern for the rig too.
