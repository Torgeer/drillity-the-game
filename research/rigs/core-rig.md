# core-rig — Diamond core / wireline exploration rig

status: in progress
subject: game rig id `core-rig` (builder: `src/rig/rigFactory.js`, `buildCoreRig`, ~line 2597)
compiled: 2026-09-04

> **Naming rule (DOMAIN.md §10).** Everything below is GEOMETRY and MATERIALS
> reference only. Real manufacturer names and model designations appear here so
> the numbers can be cited — they must NOT be used as in-game product names, and
> no badge, logo or model plate copied from these sources may appear on the mesh.
> Model the shape; invent the brand.

## 1. Sources read

| Source | Pages read | What it actually showed |
|---|---|---|
| `research/02-prospecting.md` §E1, §E2, §E3, §E4 (lines 2812–2975) | — | **The single most useful local source.** A written silhouette of the surface core rig, the E4 "how to tell an RC rig from a core rig at 50 m" test, rod stock in 3 m lengths racked in 6/9 m stands, module counts for heli rigs, EN 16228 guarding. Already covers most of what a modeller needs — this doc mostly adds dimensions and material notes on top. |
| `research/12-oem-rock-tooling.md` §B.6 | — | Wireline core AND hole diameters AQ–PWL; rod OD/ID. This is the *tooling* side, not the machine. |
| `research/16-site-archetypes.md` | — | Site dressing: core rig site is **wet**, core boxes on trestles, ≥3 m clearance around the equipment for the pad, timber-cribbed pads for heli rigs. Also the owner's own line: *"a diamond core rig is one thing, a piling rig is another"*. |
| `research/10-oem-foundation.md` line 1292 | — | Notes that the surface/underground core drill rig families are **out of scope for the foundation packs** and belong to `DOMAIN.md` §1 `core`. Confirms no foundation-pack geometry applies here. |
| `Mineral Exploration Tooling - Catalog.pdf` `[MET]` | pp. 15–18 (rendered and viewed as images) | **The best pictures in the folder.** p.17 = a full side-on studio photograph of a *tracked surface core rig* (Christensen 140). p.18 = a *modular/heli skid* rig (Christensen 160 Smart), three-quarter view, clean white background — the single most legible image of the class. pp.15–16 are underground rigs (Diamec Smart 6M / 8) — different class, useful only as contrast. |
| `Xploration+Products+Katalog+2024+-+English.pdf` | pp. 11–21 (text + pp.12/14/16/18/20 as images) | **The only local source with real spec tables.** Sunny Corner Exploration SCX range: depth, torque, RPM, feed force, pull force, **feed length**, power. p.20 photo = the deep-hole 9 m-rod archetype with a *telescoping lattice mast*. p.11 records that SCX bought the Sandvik Exploration surface-rig IP in 2024. |
| `Diamond Driller's Technical Book.pdf` `[DDTB]` | pp. 31–33 | Rig pages — repeats the same Diamec/Christensen line-up. pp.48–49 (already mined by pack 02) hold rod weights. Tooling book, not a machine book. |
| `Diamond_Bits_Catalogue.pdf` | 1 page | **Useless for this rig.** A single-page bit sheet, no machine content. |
| `Epiroc Guide to Diamond Tools.pdf` | 10 pp. | **No machine content.** Bit/matrix selection only. Same for `Epiroc Guide choosing right core bit.pdf`. |
| `DiscovOre Prime catalogue.pdf` | 16 pp. | **No rig content at all** — consumables catalogue. Not useful for geometry. |

## 2. What the machine IS

A surface diamond core rig is a **sample-recovery machine, not an earthmover**.
It puts a thin annular bit on the end of a slender rod string and cuts a
continuous cylinder of rock, which is retrieved *without pulling the string* by
dropping an overshot down the rods on a thin wireline and winching the inner
tube back up. Everything visible on the machine follows from that one fact: it
needs a **feed frame** long enough to run a 3 m rod or a 6 m core barrel, a
**gear-driven rotation head** that turns fast and gently rather than slowly and
hard, a **wireline winch with a sheave at the mast crown** so the overshot can
be run in seconds, a **water pump and mud tank** because the bit must be flushed
continuously, and a **rod magazine** so the crew is not hand-balling 20–56 kg
rods all shift. It is a comparatively *small, light, low-power* machine — the
whole surface class runs on roughly **92–168 kW** and the compact members weigh
under a tonne bare `[XP]` pp.13–21 — and it stands on a small graded or timber
bench in the bush, not on a construction site. `[MET]` p.17 states its
character in one line: *"a gear driven rotation unit and a constant penetration
rate"*, and its safety envelope in another: *"compliance with the latest
EN 16228 safety standards"*, which is why a modern one has physical guards
around the rotating chuck and a rod-spin guard `[XP]` p.14.

The driller **stands** at a pedestal console facing the mast — there is no cab
and no seat on the surface class. On the newest surface machines even tramming
is done from a belt box: *"Radio remote tramming with **no driver
compartment**"* `[XP]` p.18.

**The site tells you what it is** before the machine does (`research/02` §E4):
*"The core rig has a thin wireline running over a sheave at the mast crown, a
water tank and sump, and core trays stacked on trestles. The core rig site is
wet; the RC site is dusty."*


## 3. Proportions

### 3.1 The one dimension that governs the whole model: FEED LENGTH

A core rig's mast is sized by **how long a single stroke of the feed is**, and
that is a published number:

| Class | Feed length (stroke) | Source |
|---|---|---|
| Compact A-size portable | **800 mm** | `[XP]` p.13 (SCX110) |
| Underground / compact N-size | **1,700 mm** | `[XP]` pp.13, 15, 17 (SCX130, SCX140, SCX142, SCX151 — **four different rigs all at 1,700 mm**) |
| **Surface, heavy-duty** | **3,450 mm / 11 ft 3 in** | `[XP]` pp.19, 21 (SCX712, SCX740) |

**3,450 mm is the number to build the game's surface rig around.** It is the
travel of the head down the beam. The mast structure must be *longer* than the
stroke by the height of the head plus the crown — as a rule the mast is roughly
**1.5–1.8× the feed stroke** for a fixed beam, so a surface core rig's mast is
in the region of **5–6 m** standing. The game's `mastH = 5.4` is therefore
**plausible and should be kept** — but its `carriageRange` must be re-derived
from a 3.45 m stroke, not from the mast height (see §9).

The mast length is independently corroborated from the other direction: the
mast must swallow *"6 meter core barrels"* `[MET]` p.17 — but note that this is
handling length with the mast raised and the barrel hanging on the hoist plug,
not feed stroke. Two different numbers; do not conflate them.

### 3.2 Rods and stands — sets the rack

- Rods come in **3 m lengths**, weighing **NQ 22.9 kg / HQ 34.2 kg / PQ 56.0 kg
  per 3 m** `[DDTB]` p.49 (via `research/02` §E1); a crew handles *"up to 40 kg
  each"* ([DDH1](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/)).
- Racked in **6 m or 9 m stands** (`research/02` §E1). The deep-hole surface
  archetype is explicitly *"capable of pulling and running rods in **9 m
  (30 ft) lengths**"* `[XP]` p.20 — and that is precisely why that rig has a
  **telescoping** mast: a 9 m stand needs ~11 m of clear mast, which will not
  travel down a road.
- **Rod OD is small.** N-size rotation unit hollow spindle **77–103 mm**, H-size
  **103 mm**, P-size **120 mm / 4.73 in** `[XP]` pp.13–21. The spindle bore is
  the *upper bound* on rod OD. So drill rods on this machine are **wrist-thick,
  not thigh-thick** — a 3 m NQ rod is about **70 mm OD**. This is the single
  most commonly botched proportion on a core rig model.

### 3.3 Power and weight class

| Quantity | Value | Source |
|---|---|---|
| Diesel power, surface heavy-duty | **142 kW / 190 hp** (Tier 4) | `[XP]` pp.19, 21 |
| Diesel power, deep compact | 168 kW / 228 hp | `[XP]` p.17 (SCX151) |
| Diesel power, mid | 92 kW / 125 hp | `[XP]` pp.13, 15 |
| Electric power unit | 55–110 kW | `[XP]` pp.13–17 |
| Max torque, surface P-size head | **3,212 Nm** | `[XP]` p.19 |
| Max RPM | **1,500 RPM** (surface), 1,700 RPM (compact) | `[XP]` pp.13, 19 |
| Feed force / pull force, surface | **53.2 kN feed / 91.2 kN pull** | `[XP]` pp.19, 21 |
| Depth capacity NQ, surface | **1,126 m / 3,693 ft** | `[XP]` pp.19, 21 |
| Weight, smallest portable member | **287 kg / 655 lb** | `[XP]` p.12 (SCX110) |
| Heli module mass ceiling | **under ~860 kg (1,900 lb)** per module | [BlueMax](https://bluemaxdrilling.com/heli-portable-drilling) via `research/02` §E2 |

**Note the RPM/torque ratio — it is the whole character of the machine.** 1,500
RPM at 3,212 Nm is a *fast, light* spindle. A foundation rig turns at 20–30 RPM
with two orders of magnitude more torque. If the game's core rig head animates
at foundation-rig speed it will read wrong to anyone who has stood on a pad.

### 3.4 Overall envelope — SOURCED, from a manufacturer dimension drawing

`[C140]` pp.6–7 carries a full dimensioned general-arrangement drawing of a
tracked surface core rig in side and front elevation, with the mast drawn at
both 90° and 45°. Decoded against the drawing:

| Dim | Crawler version | Trailer version | What it measures |
|---|---|---|---|
| **B** | **12 155 mm** | 12 155 mm | **Overall height, mast vertical (90°)** |
| **A** | **8 979 mm** | 8 979 mm | Overall height, mast at 45° |
| **C** | **9 429 mm** | 9 429 mm | Overall length, mast at 45° |
| **D** | **2 895 mm** | 2 700 mm | **Overall width** |
| **E** | **2 600 mm** | 2 290 mm | **Width over tracks** |
| **F** | **2 558 mm** | 2 505 mm | **Transport height, mast lowered** |
| **G** | **400 mm** | 215 mm | Crawler band (track shoe) width — matches the spec line *"Crawler band width 400 mm (15.7 in)"* |
| **H** | **536 mm** | 599 mm | Ground clearance |
| **I** | **6 636 mm** | 8 327 mm | **Transport length, mast lowered** |

`[C140]` p.6 (tables *Working Dimensions*, *Transport dimensions*, *Drill base
supports*).

**Weight** `[C140]` p.6: **crawler 13 000 kg (28 660 lb)**, trailer 11 000 kg
(24 251 lb). ⚠️ **Sources disagree on the trailer figure:** a search-result
summary of the same rig quotes **9 500 kg** for the trailer version
([scribd mirror of the CS14 sheet](https://www.scribd.com/document/661313765/CS-14)).
Both are recorded; the crawler figure of 13 000 kg is consistent across sources
and is the one to model against.

**Derived mast length — the number the drawing does not print.**
The two mast angles give it by simple trigonometry. If the mast pivot sits at
height `h` and the mast has length `L`:
`h + L = 12 155` (at 90°) and `h + L·sin45° = 8 979` (at 45°).
Subtracting: `L(1 − 0.7071) = 3 176` → **L ≈ 10 840 mm**, `h ≈ 1 315 mm`.
So the mast is roughly **10.5–10.9 m long, pivoting about 1.3 m above ground**,
and it folds — *"Mast in two sections"*, *"Robust and sturdy hinges on the mast
facilitate easy transport and setup"* `[C140]` pp.3, 6 — down to a 6 636 mm
transport length. This is a **derived** figure; it is arithmetic on two
published dimensions, not a published dimension, and is labelled as such.

### 3.5 Proportion summary for the modeller

Normalising to overall width = 1.0 (2.895 m):

| Ratio | Value |
|---|---|
| overall width | 1.00 (2.895 m) |
| width over tracks | 0.90 (2.600 m) |
| **track gauge (centre-to-centre)** ≈ E − G | **0.76 (≈2.200 m)** |
| track shoe width | 0.14 (0.400 m) |
| transport height (mast down) | 0.88 (2.558 m) |
| ground clearance | 0.19 (0.536 m) |
| transport length (mast down) | 2.29 (6.636 m) |
| **mast length (derived)** | **3.74 (≈10.84 m)** |
| working height, mast vertical | 4.20 (12.155 m) |

**The three ratios that carry the machine:** the mast is nearly **4 × the
machine's width** and about **1.6 × its transport length**; the tracks are
**wide-set** — gauge is roughly **three-quarters of the overall width**, so the
machine is a broad, squat, stable platform, not a narrow one; and the whole
crawler base is only about **2.5 × as tall as its ground clearance**, i.e. very
low-slung.

### 3.6 Independent cross-check — the container envelope

A second, *smaller* surface rig in the local material states its envelope
differently: it *"**Fits in a high cube 40 ft closed shipping container**"*
`[XP]` p.18. A 40 ft high-cube interior is **12.03 × 2.35 × 2.69 m**
([Maersk container specifications](https://www.maersk.com/transportation-services/shipping-containers/dry)).
That machine is therefore **narrower (≤2.35 m) and slightly taller-limited**
than the 2.895 m-wide rig dimensioned in §3.4 — the two are different sizes in
the same class, and the class spans roughly **2.3–2.9 m wide**.

Either way, the modelling conclusion is the same and it is the opposite of what
the game currently builds: a surface core rig is **wider than a car and low to
the ground**, with the tracks set near the full width of the machine.

### 3.7 Mast length vs feed stroke — do not confuse them

These are three different numbers and a model that muddles them looks wrong:
- **feed stroke** (3 450 mm on the surface rig `[XP]` p.19) — how far the head
  travels in one pull. This is what the carriage animation must use.
- **rod / barrel handling length** (*"6 meter core barrels"* `[MET]` p.17,
  *"3 meter and 6 meter drill rod"* `[C140]` p.10) — what the mast must swallow
  with the head at the top.
- **mast structural length** (≈10.84 m derived, §3.4) — the physical beam.


## 4. Component inventory

## 5. Distinctive features (thumbnail silhouette)

## 6. Materials and paint

## 7. Photo references

## 8. NOT SOURCED

## 9. Domain-truth warnings — what the game currently gets wrong

