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

1. **No photograph of an underground longhole rig anywhere in `C:\Users\henri\Downloads`.**
   Not one. Every rig image in the folder is a surface crawler or a rail rig
   (§7). The machine's actual *appearance* — panel breaks, weld lines, where the
   ladder is, what the operator's station looks like from outside — is unsourced.
2. **No dimensioned side elevation or general-arrangement drawing of a longhole
   rig.** The Boomer M-series spec gives a *jumbo's* elevations, which is a
   different working end on a similar carrier. The two Sandvik sheets give
   transport H/W/L and envelope diagrams but **no side elevation with a dimension
   chain**, so wheelbase, axle positions, the front/rear frame split and the
   position of the articulation joint along the machine are all unsourced for
   this class. §3.2's wheelbase figures are the *jumbo's*.
3. **Boom geometry.** The SB120P / longhole boom is named and its swing (±45°),
   extension (1 500 mm) and module travel (5 000 mm) are given, but there is **no
   drawing and no section**. How many joints, where the cylinders sit, whether the
   boom is a box weld or a casting — unsourced.
4. **Feed cross-section.** Feed total lengths and travels are sourced. The
   **profile** — beam depth, width, rail form, whether the carriage runs on slides
   or rollers, chain vs screw drive — is not.
5. **Rod-handling arm and carousel geometry.** Carousel *capacities* are sourced
   (16+1 / 20+1 / 31+1 / 32+1) and pipe diameters are sourced. The carousel's
   **drum diameter, its axis orientation and the pipe-arm linkage** are not.
6. **Carrier articulation angle for the DL431** — the row exists in the spec sheet
   but the value is lost to a column shift in the text layer. Use the DU411's
   ±35° or the Boomer's ±41° and say which.
7. **Tyre outside diameter.** Only the *designations* are sourced: **10.00-20**
   (DU411 ITH longhole), **12.00 × R24** (Boomer jumbo carrier). No OEM sheet in
   hand states the rolling diameter. §3.2 records a **scaled** value from the
   Boomer drawing (≈1 050-1 100 mm) that **disagrees with a nominal 12.00R24 by
   about 12 %**; both are on the page and neither is picked.
8. **Weight distribution front/rear** for a longhole rig. The Boomer sheet splits
   its jumbo's weight (boom side vs engine side); neither Sandvik sheet does.
9. **Paint colours.** No RAL number, no colour callout anywhere in the local
   material. The Sandvik sheet says only *"Colour scheme — Sandvik standard"*.
   Since the game must not wear a real OEM livery anyway (§0), pick the game's own.
10. **Where the ladder, steps, handrails and walkway actually are.** Both spec
    sheets confirm the *existence* of ground-level service access ("All service
    points are accessible from ground level", "Stair and service lights") but
    nothing dimensions or locates them.
11. **The exact form of the stingers.** Front and rear stinger extensions are
    given as numbers (803 mm front, 1 664 mm rear on the CF706). What they look
    like — pad shape, ram diameter, how they fold for tramming — is not.
12. **Hose routing.** `research/` has a Bauer hydraulic-hose catalogue in the
    folder set, but **no hose-routing drawing for this machine**. The routing in
    §4 and §7 is inferred from surface-rig photographs and is marked as such.
13. **Sound, vibration and cab interior** for the longhole class (the Boomer sheet
    has them for the jumbo: 104±6 dB(A) in canopy, 75±3 dB(A) in cab).

---

## 9. Domain-truth warnings
_pending_
