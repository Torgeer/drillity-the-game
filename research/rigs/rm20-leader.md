# RM 20 class — piling / drilling leader rig on a 55 t base carrier

**Primary source:** RTG Rammtechnik GmbH, *RM 20 Ramm- / Bohrgerät · Piling
Drilling Rig*, document **905.836.1+2, 12/2019**, 12 pp. Saved in-repo at
`research/rigs/source/RTG_RM20_official_905_836_1_2.pdf`. Manufacturer page:
<https://www.rtg-rammtechnik.de/en/rm-20>.

**Every figure below is from that datasheet.** Page numbers cited. Nothing here
is inferred; anything absent is marked `NOT SOURCED`.

> **Naming.** This document describes **geometry, kinematics and proportions**.
> `DOMAIN.md` §10 and `PLATFORM_TRUTH.md` Part C forbid a real manufacturer name
> or model designation appearing as a product name in the game. **Model the
> machine accurately; badge it with an invented marque.** Shape is not branding
> — this is the same separation every racing and construction sim makes. See
> §9 for why this matters commercially as well as legally.

---

## 1. What it is

A **leader rig** — not a boom rig. A vertical mast (German *Mäkler*) carried on a
tracked base carrier by a **parallelogram kinematic linkage**, with winches
running a hammer or a rotary head down the mast. It is configurable for two
distinctly different jobs, and **the two configurations have different
dimensions** (p. 4 vs p. 7):

- **HDP / piling** — hydraulic impact hammer on the mast, driving piles
- **DTH drilling** — an `MB 100 DTH` rotary head on a **tiltable sledge**

It also pre-equips for **FDP** (full displacement piling) and **CFA**, with a
`KDK 150` rotary drive (p. 8).

---

## 2. Principal dimensions — piling configuration (p. 4)

| ref | dimension | value |
|---|---|---|
| **A** | Max rig height (as drawn) | **25.7 m** |
| **A1** | Min rig height | **19.5 m** |
| **B** | Max cylinder stroke | **7.0 m** |
| **C** | Min working radius | **4.2 m** |
| **C** | Max working radius (at min mast height) | **5.7 m** |
| **D** | Swing radius with counterweight | **4.6 m** |
| **E** | Max pile length (hammer-dependent) | **18.0 m** |

**Mast inclination: 18.5° forward / 45° backward / 18.5° sideways** (p. 3, p. 4).
The 45° rearward figure is unusually large and is a defining trait — it is drawn
on the silhouette diagram on p. 3.

Winches: **main/hammer winch 133 kN**, **pile winch 80 kN** (p. 4).
Optional predrilling system: 20 kNm torque, 60 kN line pull.

## 3. Principal dimensions — DTH configuration (p. 7)

| ref | dimension | value |
|---|---|---|
| **A** | Max rig height | **24.5 m** |
| **A1** | Min rig height | **18.3 m** |
| **C** | Max working radius | **6.0 m** |
| **E** | Max casing length | **20.0 m** |

Sledge pretensioning force **200 kN push / 200 kN pull**, **400 kN pull when
supported**. **Admissible torque 150 kNm.** Auxiliary winch crowd 43 kN.

**Clamping and breaking jaws: 38–508 mm, breaking moment 45 kNm at 250 bar**
(p. 6). **Prismatic guide: 508–1016 mm, hydraulically tiltable arms** (p. 6).

## 4. Base carrier BT 55 S / undercarriage UW 60 F (p. 9)

| | value |
|---|---|
| Overall crawler length (A) | **5.20 m** |
| Wheel distance, sprocket→idler (B) | **4.34 m** |
| Track shoe width | **900 mm** (optional 800 / 1000) |
| Crawler width, **extendable** | **3.20 – 4.70 m** |
| Width of upper carriage | **3.00 m** |
| Towing force | 460 kN |
| Travel speed | 0 – 1.46 km/h |

**The extendable undercarriage is a modelling detail worth having** — the track
frames move out from 3.20 m to 4.70 m, so working and transport stances differ
visibly.

## 5. Powerpack (p. 9)

Cummins **QSB 6.7**, **201 kW @ 2000 rpm** (Stage III A / Tier 3); optional
Cummins **B 6.7 Stage V / Tier 4 final**, **209 kW @ 2000 rpm**.
Diesel tank **600 l**, hydraulic tank **620 l**.
Main pumps **2 × 210 l/min**, auxiliary **1 × 230 l/min**, oil cooler **85 kW**.

## 6. Transport data and weight (p. 10)

| | HDP | DTH |
|---|---|---|
| Transport length | 19.83 m | 19.91 m |
| Transport height | 3.2 m | 3.35 m |
| Crawler length | 5.19 m | 5.19 m |
| Width (undercarriage, 900 mm shoes) | 3.2 m | 3.2 m |
| Width (upper carriage) | 3.1 m | 3.1 m |
| **Weight**, no counterweight | **49.5 t** | **51.5 t** |

**Counterweight: stackable, 2 × 1.8 t + 4.9 t = 8.5 t** (p. 8) — *"variably
stackable counterweight elements"*, so the discs are separate visible objects,
not one block.

## 7. Component inventory — from the numbered diagrams (pp. 2 and 5)

Piling configuration (p. 2):

| # | German | English |
|---|---|---|
| 1 | Unterwagen | Undercarriage |
| 2 | Oberwagen | Upper carriage |
| 3 | Heckabstützung | **Rear support unit** |
| 4 | Absturzsicherung am Oberwagen | **Safety rails, upper level** |
| 5 | Hauptwinde / Hammerwinde | Main winch / hammer winch |
| 6 | Pfahlwinde | Pile winch |
| 7 | Kinematik System | **Kinematic system** (parallelogram linkage) |
| 8 | Mäkler | **Mast** |
| 9 | Mastkopf | **Mast head** |
| 10 | Hammer | Hammer |
| 11 | Pfahlführung | **Pile guide** |
| 12 | Mäklerführung | Mast guide |
| 13 | Untere Mastverlängerung mit hydraulischer Abstützung | Lower mast extension with hydraulic support |
| 14 | Vorbohrsystem mit Schnecke und Führung | Predrilling system, auger and guide |

DTH configuration (p. 5) swaps 10 → **MB 100 DTH on tiltable sledge**,
11 → **prismatic guide**, 13 → **mast support cylinder**.

## 8. The features that make the silhouette specific

These are what separate it from a generic yellow leader rig:

1. **Parallelogram kinematic linkage** with a **high mast pivot point** —
   *"minimised change of centre of gravity"*, outreach to **5.70 m** piling /
   **6.00 m** DTH (pp. 3, 6). The linkage is visible structure, not a hidden
   mechanism.
2. **Sliding mast — vertically displaceable by 7 m**, *"underfloor works
   possible"* (pp. 3, 6). The mast slides through its guide; it does not merely
   pivot.
3. **Hydraulically folding mast head** with a **patented damping system** that
   absorbs hammer forces to reduce rope wear (p. 3). In DTH trim it gains a
   **pivotable auxiliary rope jib** (p. 6).
4. **Stackable counterweight discs** (2 × 1.8 t + 4.9 t) — separate elements.
5. **Upward-folding service doors** on the upper carriage (pp. 3, 6, 8).
6. **Synchronised twin-winch concept** — two distinct winches, main/hammer and
   pile, visible on the upper carriage.
7. **Rear support unit** and **safety rails** around the upper deck.
8. **Access ladder to the upper carriage** and a **catwalk beside the cab**
   (p. 8).
9. **On-board lighting: 4 spotlights** (p. 8) — relevant to `getWorkLights()`.
10. Bauer comfort cab, **FOPS protective roof grate**, **sliding cab door with a
    sliding window**, reversing camera, wash-wipe on roof *and* front glass.

## 9. Hammer compatibility (p. 2)

| hammer | max pile length |
|---|---|
| HRS 4 / HRS 5 / HRS 6 | 18.38 m |
| Fambo HR 5000 | 20.04 m |
| Fambo HR 7000 | 19.84 m |

The web summary quoted a **5,000 kg ram** for HRS-series work and hammers in the
**4/5/6 tonne** range; the datasheet itself gives the class names but not ram
masses, so treat the tonnage as **indicative, not sourced from the datasheet**.

## 10. NOT SOURCED

- Mast cross-section dimensions and profile (box? lattice? the drawings are
  silhouettes at this scale)
- Counterweight disc diameter and thickness
- Cab dimensions and glazing-bar layout
- Hose routing (Bauer's own hydraulic-hose catalogue is in the owner's library:
  `Bauer-Maschinen-Hydraulikschläuche-hydraulic hoses-DE-EN-905-213-1+2.pdf`)
- Paint breakdown and livery placement
- Exact ram masses for HRS 4/5/6
- Sprocket and idler diameters (only the 4.34 m centre distance is given)

**Photographs are the gap.** The datasheet is dimension drawings and silhouettes.
For surface detail, panel lines, hose routing and wear, the owner's photo library
in `C:\Users\henri\Downloads` and the manufacturer's own gallery are the sources
to use next.

## 11. How this maps into the game

Closest existing rig is **`piling-leader`** (currently a Junttan-class machine,
badged *Bergholt PM-78 Leaderline*). An RM 20-class machine is a **different
proposition** and arguably deserves its own entry, because:

- it is **dual-configuration** (impact hammer *and* DTH rotary head), which the
  game models as two separate methods — `driven-pile` and `dth`/`overburden`
- it carries a **predrilling system**, CFA and FDP capability
- at **49.5–51.5 t** it sits between the light crawlers and the 118 t foundation
  rig

If added, it must satisfy `tools/checkdata.mjs`: a rig in `data.js` needs a
builder in `rigFactory.js`, and `RIGS[].methods` must agree with
`METHODS[].rigIds` in both directions.
