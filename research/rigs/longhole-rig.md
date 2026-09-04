# Engineering reference — `longhole-rig`
## Underground longhole / ITH production drill

status: IN PROGRESS (appended as sources are read)
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

---

## 4. Component inventory
_pending_

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

---

## 5. Distinctive features
_pending_

---

## 6. Materials and paint
_pending_

---

## 7. Photo references
_pending_

---

## 8. NOT SOURCED
_pending_

---

## 9. Domain-truth warnings
_pending_
