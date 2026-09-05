# Engineering reference — `longhole-rig`
## Underground longhole / ITH production drill

status: IN PROGRESS (appended as sources are read)
last update: 2026-09-05 — §1.9, §3.4, §8 revisions and §9 added from four OEM
             technical specifications with dimensioned general-arrangement
             drawings for THIS class (previously only a jumbo elevation was in
             hand). §3.4 is now the modelling basis; §3.2 is superseded.
date: 2026-09-04
subject: game rig id `longhole-rig`, built by `buildLonghole()` in `src/rig/rigFactory.js` (line ~5512)

> **NAMING RULE — DOMAIN.md §10.** Everything below is cited to real manufacturer
> literature, because that is the only honest source of geometry. **None of those
> manufacturer names, model designations, badge shapes or logo marks may appear on
> the model, on a decal, in the UI, or in any product string.** Copy the *shape*,
> never the *badge*. The in-game name stays the fictional one. Where a drawing
> shows a wordmark on the hood or the cab door, model the raised panel and leave
> it blank or put the fictional mark on it.

---

## 1. Sources read

### 1.1 `9869_0080_01f_Boomer_M-series_technical_specification_english.pdf` — 5 pp; read pp. 1, 4, 5 (printed 6-7) — **USEFUL, and the most useful local file**
Filed as a face-drilling jumbo, and that is what it is — but it is a fully
dimensioned technical specification of *exactly the articulated four-wheel-drive
underground drill-rig carrier a longhole rig is built on*. PDF p.4 (printed
6-7) carries two dimensioned side elevations, a plan coverage envelope, a
Dimensions table, a Gross weight table and a Carrier options table. Every
carrier figure in §3 comes from here. It says nothing about a ring/fan feed, an
ITH hammer, or longhole rod handling.

### 1.2 `Mincon - Minroc - DTH_Product_Catalogue.pdf` — 89 pp; read pp. 1-8 (TOC + "Choosing the right DTH hammer"), 11, 18, 36, 38 (hammer datasheets) — **USEFUL for the tool, useless for the rig**
No rig geometry at all. What it *does* give is the exact geometry of the ITH
hammer this rig sends down the hole, which is the one part of the machine the
player looks at close up. Every hammer page is an exploded assembly drawing plus
a numbered parts list plus a Specifications table with OD, length, weight,
piston weight, spanner-flat size, bit size and air demand. p.5 (printed) states
the honest range of the method: *"hammers that are capable of drilling holes from
85 mm (3 3/8") thru 610 mm (24")"*.

### 1.3 `Wassara-Explorer_Surveying-System_Brochure-compressed-1.pdf` — 20 pp; read pp. 1-6 — **NOT USEFUL for geometry**
It is a **borehole survey gyro** brochure, not a rig brochure. There is no rig,
no dimension, no drawing of a machine anywhere in the part read. It is worth
exactly two facts, both listed in §9: the gyro's typical positional accuracy is
**0.2 % (~2 m per 1 000 m)** with inclination ±0.1° and azimuth ±0.5°, and the
brochure names **production blastholes** and the **LKAB iron ore mines** as the
application — which is this rig's job and this rig's mine. Housings are 25 mm and
40 mm OD, run in on a wireline winch or pumped in-rod. If the game ever models a
survey probe going down a longhole, that is its size.

### 1.4 `bwh-betek-katalog-bergbau-mining-en.pdf` — 57 pp; read pp. 1-6 — **NOT USEFUL for this rig**
A tungsten-carbide **cutting-tool** catalogue (Betek picks, TungStuds, drum
cutters, roadheader and trenching tools). It is about the *carbide*, not the
machine, and it is about cutting rather than percussive drilling. Nothing in the
pages read describes a longhole rig, a feed, a carrier or an ITH hammer.

### 1.5 `top-hammer-drilling-tools-broshure-english.pdf` — 112 pp; read pp. 61-73, the **"LONG HOLE DRILLING"** chapter (an orange thumb tab down the page edge) — **USEFUL, and it is the catalogue this rig's string comes out of**
Not in the candidate list, but it is in Downloads and it is the *only* local file
with a chapter written specifically for this machine's work. p.61 is the chapter
opener: *"dilution is primarily caused by deviation"*, and a photograph of six
button bits. pp. 62-73 are the thread systems R32 / T35 / T38 / T45 / T51 plus
T45, ST58 and ST68 **tube** drilling tools, each with bit tables, rod tables,
guide-tube rows, coupling sleeves and reaming bits, all dimensioned. Every rod
and guide-tube figure in §4.2 is from here.

### 1.6 `drillity-the-game/research/03-mining.md` §A.2 — **already covers the method, and covers it well**
The existing pack already has: ring vs parallel longhole, upholes vs downholes,
ring spacing and ring burden, the slot raise, why deviation is the enemy in a
stope specifically (dilution, ore loss, dead-pressing, **frozen stope**), the
2 % over 25 m deviation figure, and the crew KPI (hole accuracy and holes
available to the charge crew, **not metres**). It also records the ITH envelope
**Ø89-216 mm to 100 m using 3"-8" hammers** — but flags that figure as
`[W-SANDVIK-DU431, via search summary — verify the exact figures before shipping
any number]`. **That flag is still open; the game's spec block already ships the
number.** See §9. `research/16-site-archetypes.md` covers the *site* the rig
stands in, not the rig. Packs 10, 11 and 12 are foundation, anchor/geotech/HDD
and rock tooling; **10 and 11 contain nothing on this machine**, and 12 is
tooling only (§B.4 DTH shanks, §B.2 thread systems), no rig geometry.

### 1.7 Web — two OEM technical specification sheets, used to fill the one gap the folder has
Nothing in Downloads is a longhole-rig datasheet, so these were fetched (the
local material still came first, and every carrier figure in §3.1 is local).
- `https://www.mining.sandvik/globalassets/products/underground-drill-rigs-and-bolters/pdf/du411-specification-sheet-english.pdf`
  — **ITH longhole drill**, 4 pp, read in full. Carrier, canopy, feed, top drive,
  pipe arm, carousel, onboard booster, water, electric, drift-size envelopes and
  three dimensioned envelope diagrams. **This is the game's machine.**
- `https://www.mining.sandvik/globalassets/products/underground-drill-rigs-and-bolters/pdf/dl431-specification-sheet-english.pdf`
  — **top-hammer longhole drill**, same format. Used for the second half of §3.3
  and for the rock-drill and rod-handler numbers. Its text layer is column-shifted
  in places; only unambiguous rows were quoted, and one that was not is flagged in §8.

### 1.9 Web, second pass 2026-09-05 — **four OEM technical specifications from ONE publisher, with fully dimensioned general-arrangement drawings.** This closes the biggest gap in §8
§1.7's two sheets gave transport H/W/L and envelope diagrams but **no side
elevation with a dimension chain** (§8.2). These four do. They are from the same
publisher as `9869_0080_01f_Boomer_M-series…` already read in §1.1 — same
document family, same drawing conventions, same `9869_xxxx_xxx` numbering — so
the carrier figures in §3.1 and the longhole figures below are **drawn to the
same standard and can be compared directly**, which is not true of §1.7.

Retrieved as PDFs and read with a coordinate-aware extractor (PyMuPDF), so every
printed number could be placed by its (x, y) on the drawing page, and the drawing
regions were rendered at 8–11× and read as images.

> **ARCHIVED LOCALLY.** A sweep of the owner's catalogue library on 2026-09-05
> confirmed it holds **no** longhole-rig specification of any kind — 515 PDFs,
> not one Simba / DL / DU / Solo / Cubex / Normet rig document — so these four
> were web-only and therefore not re-verifiable at all. **The one that governs
> the model is now saved in the repo**, the way `research/rigs/source/` already
> holds the RM20 and core-rig sheets:
> `research/rigs/source/longhole-rig/compact-longhole-rig-S7-technical-specification.pdf`
> (894 kB). The other three stay web citations; anything quoted from them rather
> than from the archived sheet is marked in §3.4.

- **`9869_0087_01e_Simba_S7_technical_specification_english.pdf`** — 5 pp, read
  pp. 3–4 in full. *"Long-hole drilling rig for small to medium sized drifts in
  the 51 to 89 mm hole range."* **THIS IS THE GAME'S MACHINE** — see §3.4 for
  why, and it is the source of every number in §3.4. p.4 carries a **fully
  dimensioned side elevation** and **two coverage-area drawings** (one side, one
  plan). 13 500 kg.
  <https://www.epiroc.com/content/dam/epiroc/underground-mining-and-tunneling/tme/drilling-technical-specifications/simba/9869_0087_01e_Simba_S7_technical_specification_english.pdf>
- **`9869_0081_01e_simba_E7-series_technical_specification_english.pdf`** — 5 pp,
  read pp. 3–4. The big top-hammer/ITH machine, 51–178 mm, **29 500–31 500 kg**,
  2 550 mm wide, 12 700–13 700 mm long. Used as the upper bound of the class band
  and for the **recommended drift-size table**, which the S7 sheet does not carry.
  <https://www.epiroc.com/content/dam/epiroc/underground-mining-and-tunneling/tme/drilling-technical-specifications/simba/9869_0081_01e_simba_E7-series_technical_specification_english.pdf>
- **`9869_0070_01f_Simba_M4_technical_specification_english.pdf`** — 5 pp, read
  pp. 3–4. Mid machine with a **sliding table arm** (*"Turning table ±20°"*),
  *"2 rear and 2 front stinger"*, RHS 17 / 27 / 35 carousels.
  <https://www.epiroc.com/content/dam/epiroc/underground-mining-and-tunneling/tme/drilling-technical-specifications/simba/9869_0070_01f_Simba_M4_technical_specification_english.pdf>
- **`9869_0146_01_Simba_E6-W_WL_technical_specification_english.pdf`** — 5 pp,
  read pp. 3–4. The 89–254 mm **ITH** machine. Source of the four-stinger feed
  arrangement (*"Stinger backward on feed: 2 × BSJ 8-200"*, *"Stinger forward on
  feed: 2 × BSJ 8-115"*), *"Feed extension: 1 200 mm"*, *"Feed dump, drilling:
  +45° forward and −30° backward"*, RHS 35 (35+1 pipes), water hose reel 3″/120 m.
  <https://www.epiroc.com/content/dam/epiroc/underground-mining-and-tunneling/tme/drilling-technical-specifications/simba/9869_0146_01_Simba_E6-W_WL_technical_specification_english.pdf>

Two vendor product pages were also read and are cited only where quoted:
*"front and rear stingers … proper feed stabilization and accuracy in drilling
through constant feed force"* and *"360° feed roll-over"*
(<https://www.mining.sandvik/en/products/equipment/underground-drill-rigs/du431-articulated-in-the-hole-production-drill-rig/>),
and the RHS carousel design note *"with the gripper arms placed inside the
carousel, it can easily and quickly move the rods between the carousel and the
drill centre"*
(<https://www.epiroc.com/en-us/products/drill-rigs/production-drill-rigs/simba-sm60-s>).

### 1.10 Local catalogue library — re-swept in full 2026-09-05; **it has the TOOLING for this method and no rig**
515 PDFs and 272 root images searched by filename and then by extracted full
text. **No Simba, DL, DU, Solo, Cubex, Normet, Joy or Stopemaster rig document
exists in the library**, and no photograph of the class — confirming §1.8 and
§8.1 against the whole folder rather than a sample. The only local rig sheet with
a dimension chain is still the *face jumbo* of §1.1. Two files not previously
read do carry the drill string this machine's ITH variant runs, and they matter
because the carousel is sized by the pipe in it:

- **`C:\Users\henri\Downloads\Epiroc DTH product catalog.pdf` p.31**, table headed
  **"Design group Simba ITH-series"** — the ITH pipe stock for this exact rig
  family. Pipe **Ø76 mm** (6 mm wall, 1.80 m, 29.2 kg, API 2 3/8" Reg),
  **Ø89 mm** (1.50 / 1.80 / 1.87 / 2.00 m, 24–38.5 kg), **Ø102 mm** (1.50 /
  1.80 m, 39.4 / 43.8 kg), **Ø114 mm** (1.50 / 1.87 m, 41 / 47 kg). Circular
  grip 57 / 70 / 83 mm. p.38 gives the saver sub: *"Simba ITH — short adapter
  (220 mm) … Long adapter (580 mm) as fixed adapter."*
- **`C:\Users\henri\Downloads\Mincon_2024-Drill-Pipes_A4_low-res.pdf` p.9**, row
  **"ATLAS COPCO SIMBA UNDERGROUND — outer diameter 76–114 mm"**. The paired
  length column is offset in that page's text layer and was not relied on.

**The ITH pipe is 1.50–2.00 m long — the same short band as the top-hammer
rods.** That is the load-bearing fact for the carousel: whichever way the machine
is specced, the thing in the drum is a ~1.5–2.0 m stick, never a bench rod.

### 1.8 Images in `C:\Users\henri\Downloads` — swept; **no photograph of this class exists in the folder**
274 images in the root plus the `Atpa` and `Atpa/Atpa products` sets. Everything
that shows a drill rig shows a **surface crawler** or a **rail-mounted rig**; the
Atpa sets are tools, bits and casing, photographed on pallets and in a yard.
Useful ones are listed in §7 with what they are actually good for. **This is the
biggest single gap in the folder for this machine.**

---

## 2. What the machine IS

A **longhole production drill** is a low, long, articulated four-wheel-drive
underground rig that parks in a **drill drive** — a small tunnel driven along or
above the orebody — sets itself rigidly against floor and back, and drills a
**ring**: a fan of long holes in one vertical plane radiating out from the drive
into the ore, some going down through the floor, some out sideways, some up over
the back. It then trams a few metres along the drive and drills the next ring.
The holes are charged and fired ring by ring and the ore drops into the stope to
be mucked from a draw point below. **The driller never sees the rock being
broken and never sees the far end of the hole** — which is the whole psychology
of the machine: it is judged on collar position, dip, azimuth and depth of every
hole, and on how many holes are still open when the charge crew arrives, not on
metres drilled (`research/03-mining.md` §A.2). Two power trains: a **diesel
engine to tram** and a **trailing electric cable to drill**, which is why the
machine has a big cable reel on the back and a compressor line, and why it is
plugged in whenever it is working. The percussion is either a **top-hammer
drifter on the feed** (Ø51-127 mm holes, short 0.9-1.8 m rods) or an **ITH/DTH
hammer down the hole** (bigger holes, hammer at the bit). It is the same class
of carrier as a face-drilling jumbo and a rock bolter, with a completely
different working end — and it is *low, wide and articulated because the tunnel
is low, wide and has corners* (`research/16-site-archetypes.md` §47, citing
`03-mining.md` §C).

---

## 3. Proportions

### 3.1 The carrier — hard numbers
All from `9869_0080_01f_Boomer_M-series_technical_specification_english.pdf`,
PDF p.4 (printed pp. 6-7), "Dimensions", "Gross weight" and "Carrier" tables and
the two dimensioned side elevations on the same spread. This is the *jumbo*
version of this carrier; the longhole version of the same carrier family is
within a few hundred mm of it (see §3.3 for where they differ).

| Dimension | Value | Where on the page |
|---|---|---|
| Width | **2 245 mm** | Dimensions table |
| Height with cabin | **3 179 mm** | Dimensions table |
| Height, roof up / roof down | **3 019 / 2 324 mm** | Dimensions table (canopy version) |
| Overall height, booms stowed | **3 043 mm** | side elevation, both variants |
| Cab roof height | **2 387 mm** (M2 Battery) · **2 297 mm** (M2) | side elevations |
| Top of rear power module (hood line) | **1 947 mm** | side elevations, both variants |
| Ground clearance | **260 mm** | Dimensions table |
| Length with feed | **14 297 mm** (BMH 6814) · **14 598 mm** (BMH 6914) | Dimensions table + side elevations |
| Turning radius outer / inner | **7 500 / 4 400 mm**, or 7 200 / 4 400 with the bigger drill | Dimensions table |
| Articulated steering angle | **±41°** — *"reduced to 30° if RHS E or SP2 service platform is equipped"* | Carrier table + its footnote |
| Axle clearance (oscillation) | **13° rear, 22° front** | Carrier table |
| Tyres | **12.00 × R24** | Carrier table |
| Axle | Dana 113 (short), four-wheel drive, automatic differential lock, limited slip | Carrier table |
| Gross weight, one-boom rig | **18 000 – 20 000 kg** total; **9 000 – 11 000 kg** boom end, **9 000 kg** engine end | Gross weight table |
| Gross weight, two-boom rig | 23 000 – 29 000 kg | Gross weight table |
| Diesel | Deutz TCD 2013 L04 **120 kW**, or TCD 4.1 L04 115 kW, or TCD 6.1 L06 129 kW | Carrier table |
| Battery driveline alternative | traction motor **150 kW** | Carrier table + p.1 |
| Fuel tank | 110 l | Carrier table |
| Tramming speed | >15 km/h flat, >5 km/h on 1:8 | Tramming speed table |
| Cable reel | **diameter 1 600 mm** | p.1 equipment list |
| Water hose | 1.5 inch × **70 m** | p.1 equipment list |
| Tramming lights | **8 × 22 W LED** | p.1 equipment list |
| Cab | ROPS and FOPS certified, <80 dB(A), **front window 22 mm** (P8B safety classed), stainless steel cab body optional | Cabin table |
| Canopy (protective roof) | mounting height −80 mm / +310 mm; two operator panels optional | Protective roof table |

### 3.2 The ratios that matter more than the absolutes
Derived from the figures above — these are what to build to.

- **Length : width ≈ 6.4 : 1** with the feed on (14.3 m / 2.245 m). Take the feed
  off and the *carrier alone* scales off the side elevation at roughly **9.0 : 2.245
  ≈ 4 : 1**. This machine is far longer and thinner than a surface crawler.
- **Width : height (body) ≈ 2.245 : 1.947 ≈ 1.15 : 1.** The rear power module is
  very nearly as tall as the machine is wide — it reads almost square in the rear
  three-quarter view, and that squareness is a big part of the silhouette.
- **Hood : cab : stowed-boom heights = 1 947 : 2 387 : 3 043**, i.e. **1 : 1.23 : 1.56**.
  Three clearly separated horizontal bands, and the boom band is the tallest thing
  on the machine when tramming. Get those three steps right and the profile reads.
- **Ground clearance : width = 260 : 2 245 ≈ 1 : 8.6.** The belly is *close* to the
  floor. There is no daylight under this machine.
- **Tyre : machine.** Scaled off the side elevation against the 1 947 mm dimension
  line, the tyre outer diameter measures **≈ 1 050 - 1 100 mm** (radius ≈ 0.53 - 0.55 m).
  **The two sources disagree and both are recorded:** the Carrier table calls the tyre
  **12.00 × R24**, and a nominal 12.00R24 truck tyre is about **1 220 mm** outside
  diameter with a ~315 mm section — 12 % larger than the drawing scales. Do not
  silently pick one. Somewhere in 0.53 - 0.61 m radius is right; **0.55 m** is the
  drawing's own answer and is the safer modelling value because it is the one that
  keeps the 260 mm clearance and the 1 947 mm hood line consistent.
- **Wheelbase.** The side-elevation dimension chain reads
  **1 049 + 2 000 (M2 Battery) or 1 800 (M2) + 2 170 + 795**, with **3 156 / 4 170 / 934**
  on the line beneath. The axle-to-axle span is therefore ≈ **3.97 - 4.17 m**,
  i.e. about **1.8 × the machine's width**, with the articulation joint between them.
- **Working envelope, for scale sanity:** the coverage-area diagram gives a drift
  profile **9 655 mm wide × 7 178 mm high** (outer envelope 10 068 × 7 483). That is
  the *tunnel* this class works in, and it is the right size for the drift the game
  puts the machine in.

### 3.3 The real machine — two published specification sheets for **this exact class**
The local folder has no longhole-rig datasheet, so this is the one gap filled
from the web. Two sheets, one for each way the job is done. **Both are OEM
technical specifications, not marketing pages.**

**(a) ITH longhole drill** — hammer down the hole, the big-hole end.
Source: `https://www.mining.sandvik/globalassets/products/underground-drill-rigs-and-bolters/pdf/du411-specification-sheet-english.pdf`
(doc code TS2-098:05/ENG/METRIC, 2023). **This is the closest published match to
the game's `longhole-rig` as specced** — the game already lists ITH holes and
Ø89-216 mm.

| | Value |
|---|---|
| Transport height / width / length | **2 724 / 2 337 / 9 357 mm** |
| Transport weight | **25 750 kg** |
| Pivot point height | 1 903 mm |
| Ground clearance | **270 mm** |
| Carrier articulation | **±35°** (frame-steered) |
| Rear axle oscillation | **±10°** |
| Tyres | **10.00-20** |
| Axles / transmission | Dana 113 front and rear / Dana T14 hydrodynamic |
| Brakes | SAHR fail-safe wet disc |
| Diesel | Mercedes-Benz OM904LA, **110 kW** Tier 3, with exhaust catalyzer |
| Fuel tank | 114 litres |
| Tramming speed | 8 km/h level; 5 km/h on 1:7 (8°, 14 %); on powerpack 1 km/h, short distance only |
| Gradeability / sideways tilt | max **20° (35 %)** |
| Jacks | **2 × CJ16 front + 2 × CJ16 rear** — four, no roof jack |
| Canopy | FOPS/ROPS to **ISO 3449 / 3471**, tramming type; **operator's seat crosswise mounted**; tramming cameras front and rear |
| Feed | CF706-F, **6' (1 830 mm)** pipe; **feed travel 1 372 mm**; **total feed length 3 665 mm** (CF705 3 360, CF704 3 055) |
| Feed motion | **feed roll-over 360°**; feed tilt back/forward **90° / 15°**; horizontal single slideover HS130, **762 mm** of movement (HS260 option: 1 524 mm) |
| Feed force / speed | 70 kN / up to 0.3 m/s |
| Top drive | RH6230, max torque **5 730 Nm**, 0-60 rpm, **336 kg**, 760 mm long incl. saver sub, to 207 bar |
| Pipe arm | PA15 single axis (PA25 dual, PA35 triple as options) |
| Carousel | PC164 **16+1 pipes**, PC215 20+1, PC324 32+1 — *not* 6 |
| Holes | **Ø89-254 mm to 100 m deep**, using **3"-8" ITH hammers** and **Ø79-127 mm pipe**, pipe length **4'-6' (1 220-1 830 mm)** |
| Onboard air booster | KS921 screw, **24 m³/min (850 scfm) at 28 bar (400 psi)**, 92 kW booster motor, inlet 4-7 bar |
| Water | triplex booster pump, 27 l/min at 48 bar; low-pressure water outlet at the rear of the carrier |
| Hammer lubrication | HLU unit, 0-4 l/h, **32 l tank** |
| Electric | 380-690 V, total installed power **145-201 kW**, automatic cable reel CRH with limit stop |
| Lights | **6 × 50 W 24 V LED** combined working/driving, plus indicator, parking and amber flashing LEDs |
| Fire suppression | **automatic Ansul, 8 nozzles** |
| Also standard | wheel chocks and holders **one on each side**, centralized greasing points, tramming alarm, 2 × 12 V sealed AGM batteries |
| Minimum production drift | **3 788 × 3 788 mm** (6' feed, 100 mm clearance); T-section drift width 4 000 mm |
| Maximum production drift | 4 422 mm H × 5 329 mm W |

**Two figures that must not be misread.** The end-view diagram on the last page
carries **W 9 550 mm** and **H 2 798 mm**. 9 550 mm is a **drilling/fan coverage**
width — the machine itself is 2 337 mm wide and works in a 3 788 mm drift, so it
cannot be a tramming width. 2 798 mm is separately stated as the **tramming height
with the HS260 double slideover** fitted (vs 2 724 mm standard). A web summary of
this same sheet reported "tramming dimensions with double slideover: width
9 550 mm" — **that reading is wrong and both readings are recorded here.**

**(b) Top-hammer longhole drill** — drifter on the feed, the small-hole end.
Source: `https://www.mining.sandvik/globalassets/products/underground-drill-rigs-and-bolters/pdf/dl431-specification-sheet-english.pdf`

| | Value |
|---|---|
| Transport height (with cabin) / width / length | **2 870 / 2 240 / 11 400 mm** |
| Transport weight | **22 100 kg** |
| Ground clearance | **320 mm** |
| Rear axle oscillation | ±10° (articulation angle did not survive text extraction — see §8) |
| Carrier | NC7P frame-steered; M-B OM904LA **110 kW** Stage IIIA (Cummins B4.5 119/129 kW options) |
| Tramming speed / gradeability | 6.5 km/h at 14 % (1:7); max **15° / 5° sideways** |
| Jacks | **2 × TJ40 telescopic front + 2 × TJ60 rear** |
| Fuel tank | 140 litres |
| Rock drill | HL820ST, **21 kW percussion**, to 200 bar, **1 241 mm long with shank adapter** |
| Rod handler | LFRC700 carousel, **20 + 1 rods**, all threads |
| Feed | LFRC706 total feed length **3 550 mm** for 6' rods; LFRC705 3 240 mm |
| Boom | SB120P telescopic, swing left 45° / right 45°, boom extension 1 500 mm, drilling module travel 5 000 mm |
| Holes | **Ø64-89 mm to 38 m**, T38 / T45 / T51 MF-rods or Ø65 mm T45 tube rods |
| Cabin | ROPS/FOPS, **inside height 1 700 mm**, < 80 dB(A) |
| Electric | 380-690 V, 119 kW; powerpack HPP1590 (1 × 90 kW); oil tank 270 l; automatic cable reel |
| Water | WBP3 booster pump, flushing water **10-20 bar**; optional water hose reel THR2.5E, Ø38 mm hose, **65 m** |
| Rock drill air / oil | 200-300 l/min air, 200-500 g/h oil |
| Fire suppression | Ansul, **6 nozzles**, 7.7 or 9 kg ABC |
| Minimum drift | **3.2 m to 3.8 m** H × W; T-section width 3 700 mm |

**The size band, stated plainly.** Across the class: **length 9.4-11.9 m, width
2.24-2.5 m, height 2.7-3.05 m, weight 22-26.5 t, ground clearance 270-320 mm,
articulation ±35-41°.** (DU411 and DL431 above; DL432i 3 050 / 2 500 / 11 850 mm
and 26 500 kg and DL421 3 250-3 700 / 2 290 / 11 250 mm and 22 000 kg per the same
publisher's product pages.) **Length : width sits at 4.0-4.7 : 1 and
height : width at 1.1-1.2 : 1.** Those two ratios are the whole machine.

### 3.4 THE MACHINE TO BUILD — a compact small-drift longhole rig, fully dimensioned
Source: `9869_0087_01e_Simba_S7…pdf` p.4 unless marked. **This section supersedes
§3.2 as the modelling basis**: §3.2 scaled a *jumbo's* elevation because no
longhole elevation was in hand. One now is.

**Why this machine and not the 22–31 t ones.** `data.js` gives the game's
`longhole-rig` **15.2 transport tonnes**, **74 kW** of diesel and **55 kW** of
mains, rods **915 to 1 830 mm**, and **30 m** of depth capacity. Against the
class: the E7 is 29.5–31.5 t on 120–180 kW, the DL431 22.1 t, the DU411 25.75 t —
all roughly double the game's machine. The S7 is **13 500 kg**, its diesel options
are **55 / 60 / 72 kW**, its total installed drilling power is **80 kW (main motor
1 × 75 kW)**, its rod lengths are **915 / 1 220 / 1 525 / 1 830 mm** — the exact
four `data.js` quotes — and its RHS 10 carousel is rated *"mechanized drilling up
to 20 m"*. **Do not average the class** (the same decision `blender/tunnel_jumbo.py`
records making): the game's own spec block describes the compact small-drift
machine, so that is what gets built. Its 216 mm ITH capability is the game's
stretch and is not modelled as a separate working end.

#### Published dimensions

| Measurement | Value |
|---|---|
| Width | **2 100 mm** |
| Height tramming, roof up / down | **2 800 / 2 100 mm** |
| Length tramming (feed BMHP 6804 / 6805 / 6806) | **9 300 / 9 600 / 9 900 mm** (+200 mm with extractor) |
| Ground clearance | **365 mm** |
| Turning radius outer / inner | **5 000 / 2 850 mm** |
| Gross weight total / boom side / engine side | **13 500 / 9 000 / 4 500 kg** |
| Tramming speed | >15 km/h flat, >5 km/h on 1:8 |
| Articulated steering | **±40°** |
| Rear axle oscillation | **±8°** (DANA Spicer 123/90; front axle the same, with automatic diff lock and limited slip) |
| Tyres | **9.00 × R20** |
| Diesel | Deutz **55 kW** (D914 L04 / TD 3.6 L04), 60 kW (TCD 3.6 L04) or **72 kW** (BF4 L 914) |
| Total installed electric power | **80 kW** (main motors 1 × 75 kW), 380–1 000 V |
| Fuel tank | **60 l** |
| Tramming lights | **6 × 40 W LED + 2 × 80 W**, 24 V DC |
| Working lights | **4 × 80 W LED**, 24 V DC — plus joystick-controlled spotlights left/right **70 W** |
| Cab | optional ROPS+FOPS, <80 dB(A), **swingable seat for drilling and tramming**; canopy alternative is FOPS-certified, stainless steel |
| Noise | **106±6 dB(A)** in canopy drilling, **75±3** in cabin |
| Boom / drilling unit | BUT 32PD; **1 × rear and 1 × front stinger**; automatic lubrication |
| Rod handling | **RHS 10 — 10+1 rods**, *"mechanized drilling up to 20 m"*; 3′ rods give **12+1**, T45 speed rods **9+1** |
| Rods | **R32 / T38 / T45**, 3′ / 4′ / 5′ / 6′ |
| Holes | **51–89 mm** (R32 51–64, T38 64–76, T45 70–89) |
| Compressor | Epiroc LE7 or GAR 30, onboard |
| Water | hydraulic booster pump, **60 l/min at 12 bar**, minimum 2 bar inlet; water hose reel with hose |
| Fire suppression | ANSUL — manual, checkfire or automatic |
| Trailing cable | Buflex, **28–37 mm diameter**, **110–200 m** depending on voltage |

**Feed lengths — the table that sizes the working end.** Feed type / intended rock
drill / rod length / **total length**: BMHP 6803 · 915 · **2 731**; 6804 · 1 220 ·
**3 035**; 6805 · 1 525 · **3 340**; 6806 · 1 830 · **3 645** mm. The X variants
(for the MUX drill) add ~200 mm: 2 933 / 3 237 / 3 542 / 3 847 mm.
**A feed is its rod length + 1 815 mm, exactly, across all four.** That constant is
the rotation head, the carriage travel over-run and the two end housings, and it
is the most useful single relationship in this section.

#### The dimensioned side elevation — §8.2 is now closed for this machine
The chain printed along the bottom of the side elevation, rear to front:

```
 |<-- 2 100 -->|<---- 2 800 ---->|<-- 960 -->|            <- printed
 rear end   rear axle        front axle   front frame end
        |<-637->|                 |<- 700 ->|             <- printed, to the jacks
                                              230         <- printed, jack pad above ground
```

- **Rear overhang 2 100 mm**, **wheelbase 2 800 mm**, **front overhang 960 mm** —
  carrier length **5 860 mm**. Carrier length : width = **2.79 : 1**; overall
  length : width = **4.57 : 1** at 9 600 mm, which lands inside the class band in
  §3.3 exactly.
- **Rear jack 637 mm behind the rear axle; front jack 700 mm ahead of the front
  axle**; both pads sit **230 mm above ground** retracted.
- **Departure angle 15°** at the tail — printed on the drawing.
- **Where the feed sits when tramming, derived and cross-checked.** Tramming
  length changes by exactly 300 mm between BMHP 6804/6805/6806 while the feeds
  differ by 305 mm, so the feed's FRONT end sets the tramming length and its rear
  end is fixed. 9 600 − 3 340 = **6 260 mm forward of the rear end** = **400 mm
  ahead of the front frame end**. Three feed variants agree; this is arithmetic on
  printed numbers, not a guess.
- **Tyre outside diameter ≈ 1 030 mm** — and for once **the two methods agree**,
  unlike the §3.2 jumbo case. Scaled off the elevation at 25.1 mm/pt (derived from
  the printed 2 100 / 2 800 / 960 chain, three-way consistent to 1 %) the tyre
  measures **1 036 mm**; a nominal 9.00R20 is 508 mm rim + 2 × 229 mm section =
  **966 mm** bare, ~1 015–1 040 mm as published rolling diameter. **Use 1.03 m
  (radius 0.515 m), section width 0.229 m.** §8.7 is closed for this machine.

#### The coverage drawings — the geometry that makes it a longhole rig
Side coverage drawing, feed vertical, machine set up and drilling:

| | Value |
|---|---|
| **Maximum height, feed vertical, stinger out** | **7 700 mm** |
| **Feed extension** (the feed slides bodily out of its cradle) | **900 mm** |
| **Stinger extension, top (against the back)** | **450 mm** |
| **Stinger extension, bottom (down to the floor)** | **1 000 mm** |
| **Feed tilt about the boom-end cross axle** | **± 114°** |
| **Feed roll-over about its own axis** | **360°** |
| Boom articulation angle shown | **55°**, on a **1 250 mm** boom section |
| **Drilling axis, ahead of the front axle** | **2 605 mm** |
| Second feed station, offset from the first | **1 250 mm** |

Plan coverage drawing, boom swinging across the drive:

| | Value |
|---|---|
| **Total coverage width from one set-up** | **5 975 mm** |
| Boom swing angles marked | **20°** and **35°** |
| Offsets at the two extremes | **397 / 323 mm** |

**±114° of tilt and 360° of roll is the whole machine in two numbers.** 114° each
way means the feed reaches 24° PAST vertical in both directions — it can drill up
over its own back and down through the floor from one set-up, which is what a ring
is. Nothing else in the game's fleet has this. `data.js` says *"the feed swings
through a full circle on the slew ring"*; the printed **360°** roll-over is that
claim, verified.

#### The working end, read off the drawings at 8–11× — §8.3, §8.4 and §8.5 partly closed
- **The boom is a straight two-part telescopic tube**, not a lattice and not a
  knuckled excavator arm. A lower arm pinned to a bulkhead on the front frame just
  ahead of the cab, a **big lift cylinder slung underneath it** pinned to a lug on
  the frame, and an upper section carrying the feed cradle. The visible section
  marked **1 250 mm** is the upper arm. Round tube, stepped in diameter at the
  telescope joint, with a machined pin boss at each end.
- **The feed hangs on a horizontal cross-axle through its middle, not off its
  end.** The boom terminates in a transverse tube that passes through the feed
  cradle at roughly the feed's mid-height; the **±114°** tilt is about that axle
  and the **360°** roll is about the feed's own long axis. Building the feed
  cantilevered off its lower end — the face-jumbo arrangement — is the single
  easiest way to get this machine wrong.
- **Two stingers, on the FEED, not on the carrier**, and they are the load path
  that makes a 20 m hole straight: one extends **1 000 mm** below the feed foot to
  the floor, one **450 mm** above the feed head to the back. The feed is jacked
  floor-to-back like a prop, and only then is the hole drilled. The carrier's own
  front and rear jacks are separate and smaller. The bigger machines scale this
  up: *"2 rear and 2 front stinger"* (M4) and four on the feed (E6-W, 2 × BSJ
  8-200 back and 2 × BSJ 8-115 forward).
- **The carousel is a drum whose axis is PARALLEL to the feed**, mounted beside
  the drill centreline at the lower end of the feed, inside a chamfered-corner
  housing. The plan-view coverage drawing shows it unambiguously as a circle with
  a centre-mark, with a smaller concentric circle inside it — the gripper-arm hub.
  The maker's own copy explains that inner circle: *"with the gripper arms placed
  inside the carousel, it can easily and quickly move the rods between the
  carousel and the drill centre"* — so the arms reach out from the middle of the
  drum, they do not swing in from outside it.
- **Carousel size [GA — scaled, ±5 %].** From the plan coverage drawing at
  ≈34.5 mm/pt (from the printed 397 / 5 975 / 323 chain; the two half-spans
  disagree by 5 %, so the scale carries that): drum **OD ≈ 0.56 m**, drum centre
  **≈ 0.49 m** from the drill centreline. Sanity check against capacity: 10+1 rods
  at 46–52 mm OD need only ~0.25 m of pitch circle, so a 0.56 m drum is generous —
  which is exactly what putting the gripper arms *inside* it costs. Both figures
  are scaled, not printed. **Do not present either as published.**
- **The drill centreline runs in a V-jawed rod guide** at the feed foot, drawn as
  a V-clamp closing on the string. There is a second guide bushing above it.
- **The cable reel is a large spoked drum with a transverse axis at the rear**,
  its side flange seen as a full circle in the side elevation with radial spokes.
  Three-point circle fit on the drawn arc gives **Ø ≈ 1 570 mm, centre ≈ 1.19 m
  above ground** [GA] — which is the **1 600 mm** the M-series carrier publishes
  in §3.1, from a completely independent drawing. Its top stands proud of the
  engine hood. It is the biggest single object on the machine and the clearest
  "this drills on mains" signal there is.
- **The operator station is an enclosed glazed cab on the LEFT of the machine,
  set between the wheels**, with a door, a tall narrow side light, and a
  **swingable seat for drilling and tramming** — the seat turns to face the boom
  when drilling and forward when tramming. Ahead of it is a console/hood box
  carrying the badge panel, and the boom bulkhead is on the front face of that box.
  The canopy alternative is a FOPS plate on posts. **The roof drops 700 mm**
  (2 800 → 2 100 tramming) which is how the machine gets under a low back.
- **The rear body is a long low hood** with a rounded top edge, vertical panel
  breaks, a lifting eye on top, an exhaust/cooling stack toward its front, and a
  **sloping tail at 15°**. It is the biggest painted surface on the machine.
- **Wheels** carry deep chevron lugs, a visible rim ring and a hub with a **10-stud
  bolt circle** and a cap.

---

## 4. Component inventory
Every part that makes it read as **this** machine, and why it matters visually.
The carrier entries are sourced to the Boomer M-series spec (`9869_0080_01f…pdf`,
p.4 side elevations and Carrier / Cabin / Protective roof tables); the tooling
entries to the Mincon and Sandvik catalogues.

### 4.0 The carrier — an articulated two-body machine, not one chassis
1. **The articulation joint is the machine's defining feature.** Two frames,
   front and rear, joined by a vertical pin pair with two steering rams across
   the joint; **±41°** of swing (`Carrier` table). At full lock the machine is a
   V and the two bodies are visibly separate objects. Any render that shows this
   machine as one rigid box is wrong from the first glance. *Visual: the joint
   is the single strongest silhouette cue after the low roof.*
2. **The rear power module** — engine (Deutz 115-129 kW) or a 150 kW traction
   motor and battery. In the side elevation it is a **long low box with a sloping
   nose that drops almost to the floor at the tail**, top face at **1 947 mm**,
   with **side louvre banks** for cooling. *Visual: it is the biggest single
   painted surface on the machine and it sets the hood line.*
3. **The front frame** carries the drilling end, the operator's station and the
   bulkhead the boom/feed structure bolts to. It sits directly over the front
   axle.
4. **Ground clearance 260 mm** with a full-width **belly plate**. The floor of a
   drill drive is broken rock; the underside is scraped bare and dented, never
   painted-looking. *Visual: no daylight under the machine — a common modelling
   mistake is to leave it standing too tall.*
5. **Wheels:** four, **12.00 × R24** tyres, four-wheel drive, Dana 113 short
   axle, automatic differential lock with limited slip. Deep chevron/lug tread.
   Axle oscillation **13° rear / 22° front** — the front axle is the one that
   articulates over broken floor, and at rest on uneven ground the machine sits
   visibly cross-legged. *Visual: the tyres are the only round, soft, black mass
   on an otherwise angular machine.*
6. **Canopy or cab, and they are different machines to look at.** The canopy
   ("Protective roof") is an open **FOPS canopy on four posts** with a mounting
   height adjustment of **−80/+310 mm**; the optional cab is a fully glazed
   **ROPS+FOPS** box, <80 dB(A), with a **22 mm laminated front window (P8B
   safety classed)**, air conditioning, a reversing camera and an optional
   stainless-steel body. On a longhole rig the operator's station is set to
   **one side** of the machine and faces the working end. *Visual: the canopy
   version reads as a skeleton of posts and a flat plate; the cab version reads
   as a glass box. Pick one and commit.*
7. **Cable reel, diameter 1 600 mm** — the machine drills on trailing electric
   cable and trams on diesel. A drum that big is roughly **two-thirds the width
   of the machine** and it is mounted high on the rear body. *Visual: the single
   biggest circular object on the machine and the clearest "this is underground"
   signal there is.*
8. **Water hose reel, 1.5 inch × 70 m** — a second, smaller drum. Flushing water
   comes from the mine's service line, not from a tank on board.
9. **Fire suppression** — ANSUL (manual, checkfire or automatic) or FORREX
   (automatic) are on the options list of every machine in this family. On the
   real machine this is a **pressure bottle in a bracket on the frame** with
   small-bore distribution tube running to the engine bay, the hydraulic pump and
   the fuel filters, plus **two red actuator stations**, one at the operator's
   station and one at ground level at the rear. *Visual: a small red cylinder and
   a red pull-handle plate — it is the one bright red thing on a grey machine.*
10. **Rig washing kit, boot washing kit, manual lubrication kit, central
    lubrication system** — all on the same options list. Central lubrication means
    a **small pump box with a bundle of thin nylon lines fanning out to the pins**.
11. **Service platform (RHS E / SP2)** — a real option, and the spec's footnote
    is the interesting part: *"If RHS E or SP2 service platform is equipped the
    steering angle will be reduced to 30°."* A platform on this machine is big
    enough to foul the articulation. *Visual: a fold-down grating platform with a
    tubular handrail, mounted over the rear body.*
12. **Tramming lights: 8 × 22 W LED**, plus joystick-controlled spotlights left
    and/or right at **70 W** each. Eight small lamps, not two big ones.
13. **Fuel tank 110 l** only — this machine does not tram far.

### 4.3 The working end — feed, drifter/rotation head, and the ring
**This is the part the local material does NOT dimension.** See §8. What is
sourced, and what a driller would insist on:
- The feed is **short** — it has to fit in a drill drive whose back is a few
  metres up. The rod length dictates it: a 1 525 mm rod plus a rotation head plus
  travel means a feed on the order of **2.5-3.5 m**, not the 5-6 m of a jumbo
  feed. `research/03-mining.md` §A.2 states the reason in one line: rods are
  short *"because the drill drive is small and there is no room for a long feed."*
- **The carriage runs on the feed beam, not the other way round.** The feed is an
  extruded/fabricated **box-section rail** with the carriage riding it on slides
  and a chain or screw drive; there is no lattice anywhere on this machine.
  (Lattice belongs to a raise borer's derrick or a piling mast, not here.)
- **A rod-handling carousel** sits alongside the feed and swings rods into the
  hole centreline with an arm. This is the busiest-looking assembly on the
  machine and the one a player watches.
- **Floor and roof jacks.** The machine must not move a millimetre while a 25 m
  hole is being drilled, so it is jacked off its tyres onto **four floor jacks**
  and pushed up against the back by a **roof jack**. *Visual: when working, the
  tyres are visibly unloaded and the machine sits on steel pads.*

### 4.1 The ITH hammer and what goes down the hole
This machine is defined by what is at the *bottom* of the string, and the game
already puts a hammer model on the deck, so the numbers matter. All from
`Mincon - Minroc - DTH_Product_Catalogue.pdf`, one datasheet page per hammer.

| Hammer (PDF page) | OD | Length, backhead shoulder → chuck | Min. bit | Weight less bit | Piston | Spanner flat | Backhead |
|---|---|---|---|---|---|---|---|
| MC30 (p.8) | **77 mm** | **865 mm** | 85 mm | 22.3 kg | 4.1 kg | 64 mm | 2 3/8" API Reg pin |
| MQ50 (p.18) | **115 mm** | **1 057 mm** | 127 mm | 59.9 kg | 15.9 kg | 89 mm | 3 1/2" API Reg pin |
| MC55 (p.11) | **124 mm** | **998 mm** | 140 mm | 67.3 kg | 15.0 kg | 89 mm | 3 1/2" API Reg pin |
| 5DH (p.36) | **124 mm** | **1 054 mm** | 140 mm | 67.3 kg | 17.7 kg | 89 mm | 3 1/2" API Reg pin |
| 6DH (p.38) | **140 mm** | **1 034 mm** | 152 mm | 95.3 kg | 20 kg | 100 mm | 3 1/2" API Reg pin |

**What that means for the model.**
- **A 5" ITH hammer is a plain steel tube about 0.12 m across and 1.0 m long** —
  slightly *longer* than a metre and only a hand's width in diameter. Its
  length-to-diameter ratio is about **8 : 1**. It is not a stubby drum.
- It is **not one smooth cylinder**: backhead (with the API pin and a pair of
  **spanner flats 89 mm across**, which are the visible machined flats near the top),
  then a long **wear sleeve** which is the parallel body, then the **chuck** at the
  bottom which is a slightly different diameter and carries the bit. Three
  cylindrical bands, two shoulders, flats at the top. That is the whole silhouette.
- Wear sleeve discard limit for the 5" is **111.8 mm** against a 124 mm new OD:
  a worn hammer is visibly slimmer in the middle, **~10 % under nominal**, and the
  wear is on the *sleeve*, not the ends.
- Air demand for a 5"-6" hammer is **283 l/s at 17.2-20.7 bar (600 cfm at 250-300 psi)**.
  That is why the machine drags a big air line, and why the compressor is off-board.
- Make-up torque 5 085-6 780 Nm (5") and 6 100-8 135 Nm (6") — these joints are
  broken with a hydraulic wrench, not by hand.
- Method envelope: **85 mm (3 3/8") to 610 mm (24")** hole diameter across the whole
  DTH range (p.5). The longhole/production band is the bottom third of that.

### 4.2 The drill string — rods, couplings and guide tubes
All from `top-hammer-drilling-tools-broshure-english.pdf`, LONG HOLE DRILLING
chapter, one page per thread system. **These are the numbers that make the
racked rods and the carousel read correctly.**

| Thread (page) | Rod OD | Rod lengths available | Flushing hole | Wrench flat | Female end OD | Guide tube: for bit Ø / length / OD |
|---|---|---|---|---|---|---|
| R32 (p.63) | **32 mm** (1 1/4") | **915 / 1220 / 1525 / 1830 mm** (3'/4'/5'/6') | 11.7 mm | 25.4 mm | 45-46 mm | 51-64 mm / 1830 mm / **46 mm** |
| T38 (p.66) | **39 mm** (1 1/2") | 1220 / 1525 / 1830 mm | 14.5 mm | — | 56 mm | 64-76 mm / 1830 mm / — |
| T45 (p.68) | **46 mm** (1 3/4") | 1220 / 1525 / 1830 mm | 17 mm | — | 63 mm | 76-89 mm / 1830 mm / — |
| T51 (p.70) | **52 mm** (2") | 1525 / 1830 mm | 21.5 mm | — | 71 mm | 89-102 mm / 1830 mm / **76 mm** (3") |
| T45 tube (p.71) | **65 mm** (2 1/2") drill tube | 1525 / 1830 mm | 18 mm | — | — | — |
| ST58 tube (p.72) | **76 mm** (2 1/4" thread, Round 76 body) | 1525 / 1830 mm | 26 mm | — | — | — |

Plus: **R32 coupling sleeve — OD 44 mm × 150 mm long** (p.63). Bits for the
chapter run **Ø51 mm to Ø127 mm** across the systems.

**What that means for the model.**
- **The rods really are short.** 0.915-1.83 m, against 3.05-6.10 m for bench
  rods (`03-mining.md` §A.2). *This is the single most reliable visual tell of an
  underground longhole rig* and the game already gets it right at 1.525 m.
- **A rod is not a smooth stick.** Along a 1.525 m T51 rod: a **threaded male end**,
  then an abrupt shoulder onto the parallel 52 mm body, then at the other end
  either a **female box swelling to 71 mm OD** (an MF rod — the swelling is
  visible and it is where the rod is gripped) or a plain male end plus a separate
  **coupling sleeve**, which is a short fat collar every rod-length down the string.
  At thumbnail size the string reads as a stack of segments with a **collar every
  1.5 m**, and that beat is the thing to preserve.
- **Rod-to-hole ratio.** A 52 mm rod in a 89-102 mm hole is roughly **half the hole
  diameter**. There is a visible annulus. The rod does not fill the hole.
- **The guide tube is a separate, fatter, shorter-lived part** that sits directly
  behind the bit to hold the collar straight: **76 mm OD for a 89-102 mm hole,
  1 830 mm long**. It is not a rod and should not look like one.
- **Colour, from the p.61 photograph:** the **rod bodies are matte black**
  (phosphate/coating), the **bit heads are a warm gold-bronze**, the **carbide
  buttons are dark grey-black domes**, and there is a **bright bare-steel band**
  at the machined shoulder just behind the bit head where the coating stops. Three
  materials in 300 mm. See §6.

---

## 5. Distinctive features — the thumbnail test
Five things. If a silhouette at 64 px has these, a driller reads it as an
underground production drill and not as anything else in the fleet.

1. **It is bent in the middle.** The articulation joint with two steering rams
   across it, ±41° (`Boomer M-series` p.4 Carrier table). Nothing else in the
   fleet does this — a crawler slews, this one folds.
2. **It is impossibly low for its length.** Roof line **1 947 mm** over a body
   **14.3 m** long including the feed, on **260 mm** of clearance. The whole
   machine reads as a *plank*. Every surface rig in the game is taller than it is
   long; this one is the reverse.
3. **The feed is short and it is pointed somewhere absurd.** Not at a face ahead
   of it and not straight down — **at the floor, at the sidewall, or straight up
   over the machine's own back**, and it changes between holes. A machine drilling
   vertically upward through its own roofline is a longhole rig and nothing else.
4. **A big cable drum on the back** — Ø1 600 mm, with the cable running away down
   the drive. It says "electric while drilling, diesel while tramming", which is
   the underground production convention.
5. **Fat rubber tyres, not tracks, under a machine that is obviously a drill.**
   Four wheels of ~1.05-1.2 m diameter with deep lugs. Everything else in the
   game that drills sits on tracks or on outriggers.

Secondary, at larger sizes: the machine standing on **jack pads with its tyres
unloaded**; the **short 1.5 m rods** in a rack, which look wrong-scaled next to
the 3-6 m rods on every surface rig; and the **canopy-not-cab** open operator
station on one side.

---

## 6. Materials and paint

**Painted steel** — the great majority. The rear power module skins, the frame
box girders, the canopy posts and roof plate, the feed beam, the boom/cradle
structure, the covers over the hydraulics. Underground OEM paint is a saturated
single colour over a grey primer, with the primer showing at every chipped edge.
Semi-gloss when new; it goes matte fast underground because the surface is
permanently micro-abraded by rock dust.

**Bare / worn steel, unpainted from new** — the belly plate, the jack pads and
their rams, the feed rails where the carriage slides, the articulation pin
bosses, the rod-guide throat, the centraliser/stinger tip, the rod rack cradles,
and every wear pad. These are bright and **polished by contact**, not rusty:
where steel rubs steel every shift, it shines.

**Chrome / polished rod** — every hydraulic cylinder rod: jacks, roof jack,
steering rams, feed extension, carousel arm. Mirror-bright where extended,
usually with a **fine ring of oil film and dust at the wiper seal** and a wet
sheen for the first 100 mm out of the gland. This is a strong, cheap realism cue.

**Rubber** — tyres (matte black, dusty grey when working, with the tread pockets
packed with fines); hose covers; the cable on the reel, which is a **thick matte
black round cable**, not a flat one.

**Glass** — only if the cab version is built: a **22 mm laminated front window**,
which is thick enough that its edge is visible; side and rear glazing thinner.
Underground glass is never clean — a wiped arc on the front, dust everywhere else.

**Bronze/gold and dark carbide, on the tooling only.** From the bit photograph on
p.61 of `top-hammer-drilling-tools-broshure-english.pdf`: bit heads are a warm
**gold-bronze** (the OEM finish), **carbide buttons are dark grey-black domes**,
and there is a **bright bare-steel band** at the machined shoulder behind the
head. Rod bodies are **matte black**. Three materials inside 300 mm.

### Where wear, dirt and rust actually go on a working machine
- **Rock dust everywhere, settling on horizontal surfaces**, heaviest on the top
  of the rear power module and the canopy roof, and it is the **colour of the
  orebody** — not generic brown. It streaks vertically where water has run.
- **Wet, not dry.** A longhole rig drills with water flush. There is standing
  water on the drive floor, a wet fan of spray-back around the collar of the hole
  being drilled, wet slurry running down the feed, and **the machine is grey-wet
  from the feed forward and dusty-dry from the cab back**. That gradient is the
  most characteristic dirt pattern this machine has and it is easy to get wrong.
- **Cuttings pile at the collar.** Drilling a downhole throws a cone of wet grit
  onto the floor; drilling an uphole runs it back down the rod onto the machine
  and the operator's station. Uphole drilling is the dirtiest job on the rig and
  the machine shows it.
- **Rust is limited and local.** A machine washed every shift in a wet mine does
  not rust all over. It rusts on **cut edges and weld toes where paint never
  keyed**, in **bolt-head recesses**, on the **inside of the wheel rims**, on
  **jack pad faces between shifts**, and as staining running down from
  fastener heads. Rust *streaks*, it does not *coat*.
- **Paint loss is where boots and steel go.** The step, the platform edge, the
  frame top rail where people walk, the mudguard tops, the corners of the rear
  body where it has been kissed by a drive wall, and the rod rack. Down to primer
  first, then to shiny steel at the very edge.
- **Hydraulic weeping.** Every rig has a slow leak. Dark stain around one or two
  fittings with dust stuck to it — that is what makes hoses look real.

---

## 7. Photo references
**Stated up front: there is no photograph of an underground longhole rig in
`C:\Users\henri\Downloads`.** Everything below is a partial reference — useful
for one sub-assembly or one material, not for the machine.

| File | What it is | What it is actually good for |
|---|---|---|
| `C:\Users\henri\Downloads\dth-bits-1024x683.jpg` | Studio CG render of a **complete DTH hammer and bit family**, ~20 hammers standing plus two lying down with bits fitted, hard hat for scale | **The best ITH reference in the folder.** Confirms the three-band silhouette from §4.1: a **light bare-steel API pin** protruding from a stepped **backhead collar**, a long parallel **dark graphite body**, then a **longitudinally fluted/ribbed section** at the chuck, then the bit head with black carbide buttons. Also shows the whole size ladder side by side, which is exactly the proportional relationship the game's `dth-hammer` size table needs. |
| `C:\Users\henri\Downloads\top-hammer-drilling-tools-broshure-english.pdf` p.61 | Photograph of six threaded button bits on rod stubs | **Materials.** Gold-bronze bit heads, dark grey carbide buttons, **matte black rod bodies**, bright bare-steel band at the machined shoulder. See §6. |
| `C:\Users\henri\Downloads\Surface_Drill_Rig_1000_0001.jpg` | CG render, surface crawler DTH rig, yellow, tracks | **Hose routing only** — it shows the **mesh hose basket slung under the boom** that carries the slack loop between the machine and a moving feed, plus **coiled airline** loops. That basket is real and the game's longhole rig has nothing like it. **Do not copy the machine** — this is a surface crawler and the wrong shape entirely. |
| `C:\Users\henri\Downloads\surface_top_hammer_drill_rigged_01.jpg` | CG render, surface top-hammer crawler with the feed raised on a boom | **Hose routing and rod handling on a feed.** The hose bundle looping from the boom knuckle to the feed, and the **rod magazine mounted along the side of the feed** — both are correct in principle for a longhole rig, at the wrong scale. |
| `C:\Users\henri\Downloads\3D-Bilde-4525JBR-transport-position-1024x576.png` | CG render, **rail-wagon-mounted** drill rig with a separate power pack | Only useful for one thing: a **short box-section feed with a rotation head, carriage and twin feed cylinders** seen clearly and unobstructed. Different machine, different industry. |
| `C:\Users\henri\Downloads\Atpa\` and `C:\Users\henri\Downloads\Atpa\Atpa products\` | ~80 WhatsApp and studio photographs of drilling **tools** — bits, casing shoes, drill heads, rings | Real-world **wear and finish on working steel**: how bare machined steel actually looks after use, how carbide sits in a body, how rust stains around a weld. Good for §6, useless for §3-5. |
| `C:\Users\henri\Downloads\surface-drill-rig-for-quarrying-and-mining-smartroc-d65-3d-model-77345d1f1d.webp` | Product image of a surface DTH crawler 3D model | Contrast only — this is the machine the longhole rig must **not** be mistaken for. |

**What to go and get.** One photograph of a longhole rig set up in a drill drive
with the feed rolled over past vertical, one of the pipe arm swinging a rod into
the centraliser, and one of the cable reel end of the machine, would be worth
more than everything in the table above.

---

## 8. NOT SOURCED
This list is as valuable as the findings. **Nothing here should be filled in with
a plausible-looking number.**

> **Updated 2026-09-05 after §1.9 / §3.4.** Items **2, 7** are **CLOSED** for the
> machine in §3.4, and **3, 5, 11** are **partly closed**. The strikethrough is
> kept rather than deleted so the shape of what was missing stays visible.
> **Item 1 — no photograph of the class — is still completely open and is still
> the biggest gap.** Everything about *finish* rather than *dimension* rests on
> vector line drawings, which show where things are and never show what they
> look like.

1. **No photograph of an underground longhole rig anywhere in `C:\Users\henri\Downloads`.**
   Not one. Every rig image in the folder is a surface crawler or a rail rig
   (§7). The machine's actual *appearance* — panel breaks, weld lines, where the
   ladder is, what the operator's station looks like from outside — is unsourced.
2. ~~**No dimensioned side elevation or general-arrangement drawing of a longhole
   rig.**~~ **CLOSED 2026-09-05 for the §3.4 machine.** `9869_0087_01e_Simba_S7…`
   p.4 carries a fully dimensioned side elevation with the chain **2 100 / 2 800 /
   960** plus jack positions, departure angle and two coverage drawings. Wheelbase
   and axle positions are now printed, not scaled. **Still open:** where the
   ARTICULATION JOINT sits along the wheelbase is printed on no sheet in hand;
   §3.2's 48/52 split is the *jumbo's* and is what the model uses, flagged.
3. **Boom geometry — partly closed.** The *form* is now sourced from the S7
   coverage drawings: a **straight two-part telescopic round tube**, pinned to a
   bulkhead on the front frame, with a **lift cylinder slung underneath**, and a
   **transverse cross-axle at the far end that passes through the middle of the
   feed** (§3.4). Angles are printed: 55° arm, ±114° feed tilt, 20°/35° swing,
   5 975 mm coverage. **Still open:** tube diameters, wall sections, cylinder
   bores, whether the boom is a weldment or a casting.
4. **Feed cross-section — still open.** Feed total lengths and travels are now
   sourced to four decimal-exact rows (§3.4) and the rod-length + 1 815 mm
   relationship is derived. The **profile** — beam depth, width, rail form,
   carriage on slides or rollers, chain vs screw drive — is still not printed
   anywhere in hand.
5. **Rod-handling arm and carousel geometry — partly closed.** Now sourced: the
   drum's **axis is parallel to the feed**, it sits **beside the drill centreline
   at the lower end of the feed**, and the **gripper arms are inside the drum**
   (maker's own copy, §1.9). Capacities are sourced (10+1 on this machine; 12+1 on
   3′ rods, 9+1 on T45 speed rods; 17+1 / 27+1 / 35+1 on the bigger ones).
   **Drum diameter and centre offset are SCALED, not printed** — 0.56 m and
   0.49 m, ±5 %, tagged `[GA]` in §3.4 and in the model. **Still open:** the arm
   linkage itself, the pocket form, and how the drum is indexed.
6. **Carrier articulation angle for the DL431** — the row exists in the spec sheet
   but the value is lost to a column shift in the text layer. Use the DU411's
   ±35° or the Boomer's ±41° and say which.
7. ~~**Tyre outside diameter.**~~ **CLOSED for the §3.4 machine.** Its tyre is
   **9.00 × R20**; scaling the S7 side elevation gives **1 036 mm** and the
   nominal calculation gives 966 mm bare / ~1 015–1 040 mm rolling. **The two
   methods agree to within 2 %**, which is what the §3.2 jumbo case failed to do.
   Use **1.03 m OD**. Still unsourced for the 12.00 × R24 and 10.00-20 machines,
   where the 12 % disagreement in §3.2 stands unresolved.
8. **Weight distribution front/rear** for a longhole rig. The Boomer sheet splits
   its jumbo's weight (boom side vs engine side); neither Sandvik sheet does.
9. **Paint colours.** No RAL number, no colour callout anywhere in the local
   material. The Sandvik sheet says only *"Colour scheme — Sandvik standard"*.
   Since the game must not wear a real OEM livery anyway (§0), pick the game's own.
10. **Where the ladder, steps, handrails and walkway actually are.** Both spec
    sheets confirm the *existence* of ground-level service access ("All service
    points are accessible from ground level", "Stair and service lights") but
    nothing dimensions or locates them.
11. **The exact form of the stingers — partly closed.** Now sourced: they are on
    the FEED, not the carrier, one at each end, and on the §3.4 machine they
    extend **1 000 mm** at the foot and **450 mm** at the head; the carrier's own
    front and rear jacks are separate, sit **637 mm behind the rear axle and
    700 mm ahead of the front axle**, and their pads rest **230 mm above ground**.
    (Older figures for a different maker: 803 mm front, 1 664 mm rear on the
    CF706.) **Still open:** pad shape, ram diameter, and how they fold for
    tramming.
12. **Hose routing.** `research/` has a Bauer hydraulic-hose catalogue in the
    folder set, but **no hose-routing drawing for this machine**. The routing in
    §4 and §7 is inferred from surface-rig photographs and is marked as such.
13. **Sound, vibration and cab interior** for the longhole class (the Boomer sheet
    has them for the jumbo: 104±6 dB(A) in canopy, 75±3 dB(A) in cab).

---

## 9. Domain-truth warnings
Written 2026-09-05 against §3.4. Each of these is a way the model or the game can
be wrong in a manner a driller would spot in one glance.

1. **A ring is not a hole, and `targetDepth` is not a depth.** `data.js` sets
   `depthRange: [120, 400]` for `longhole` and its own comment says those are
   **ring metres — the sum of every hole in the fan**, while an individual hole
   *"runs to about 30 m"* and the rig's `depthCapacity` is 30. So a 400 m contract
   is roughly **13–20 holes**, not one 400 m hole. **Any model, render or HUD that
   implies a single deep hole contradicts the game's own content.** The model
   answers this by being built in the fan-drilling pose with the feed off vertical
   and the full ±114° / 360° chain present and drivable.
2. **The feed must not be built cantilevered off its lower end.** That is the
   face-jumbo arrangement. On this machine the boom ends in a **transverse axle
   through the middle of the feed** (§3.4). Get this wrong and every pose past
   about 40° reads as a jumbo pointed at the ceiling.
3. **The stingers are on the feed and they are the point.** A longhole rig braced
   only on its carrier jacks is drilling a crooked hole. The **1 000 mm foot
   stinger to the floor and 450 mm head stinger to the back** are what hold the
   collar; the vendor copy is explicit that they exist for *"proper feed
   stabilization and accuracy in drilling through constant feed force"*. If the
   render shows the machine drilling with nothing touching the back, it is showing
   the thing the whole method is about not happening.
4. **Rods are short — 0.915 to 1.83 m — and that is the tell.** `data.js` already
   has 1.525 m. A 3–6 m bench rod on this machine is a domain error, and the
   carousel that holds them is small and close to the feed foot, not a tall rack.
5. **10+1 rods is 20 m of hole, not 400.** The RHS 10 carousel is *"mechanized
   drilling up to 20 m"*. The crew reloads it inside a single deep hole. A
   carousel drawn with enough rods for a whole ring would be an invention.
6. **It is plugged in while it drills.** 80 kW of installed drilling power against
   55–72 kW of diesel: the diesel trams, the mains drills. **The trailing cable
   must be present and must run away down the drive** — 28–37 mm diameter, 110–200
   m of it on a Ø1.57 m reel. A longhole rig rendered without its cable is
   rendered mid-impossibility.
7. **`transportTons: 15.2` vs a real 13.5 t is fine; `stats.power: 74` vs 55–72 kW
   is fine.** Both sit inside the class. **What is NOT sourced is the 216 mm ITH
   figure on a machine of this size** — the real machines that reach 216–254 mm
   are the 25–31 t ITH rigs (DU411, E6-W). The number is not wrong for the
   *method*; it is unsupported for a 15 t *rig*. Flagged here rather than
   changed, because content is `data.js`'s to own.
8. **`research/03-mining.md` §A.2's ITH envelope is still flagged.** It records
   *"Ø89-216 mm to 100 m using 3″-8″ hammers"* with `[verify the exact figures
   before shipping any number]`, and the game ships the number. §1.9's E6-W sheet
   gives **89–254 mm** for that class and the Mincon catalogue gives 85–610 mm for
   DTH overall. **The flag should be resolved against a primary sheet, not against
   this file** (HANDOFF §8D: the pack's own voice is not evidence).
9. **No badge, anywhere.** Every drawing read for this machine carries a wordmark
   on the hood and a model designation on the tail. `DOMAIN.md` §10 binds:
   **model the raised panel, leave it blank.** The in-game marque is
   *"Fennholm LH-60 Fanline"* (`data.js`), and even that goes nowhere near an
   exported object name.
