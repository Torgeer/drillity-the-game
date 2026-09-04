# core-rig — Diamond core / wireline exploration rig

status: complete
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

### 4.1 Mast / feed frame — **THE BIGGEST CORRECTION IN THIS DOCUMENT**

**A surface core rig mast is NOT a lattice of tubular chords.** Every surface
machine photographed in the local material uses a **fabricated plate / box-section
feed beam** — two parallel steel plate webs joined into a channel or box, with a
**row of large circular lightening holes punched down the web**, evenly spaced the
full length. This is unmistakable in `[MET]` p.17 and `[MET]` p.18, where the holes
read as a dotted line down the whole mast even at thumbnail size.

- The **carriage runs on the flanges of that beam**, not around four corner chords.
  Gibs bear on machined rails on the beam faces.
- The mast is **in two sections** with *"robust and sturdy hinges"* `[C140]` pp.3, 6
  — the upper section folds back over the lower for transport. Model the **hinge and
  its joint plates**; it is a visible band across the mast.
- **Exception, and it is a real one:** the *deep-hole 9 m-stand* archetype `[XP]`
  p.20 **does** use an open **ladder / lattice telescoping mast** — an inner section
  sliding inside an outer, with rungs. If the game wants a lattice mast, that is the
  machine it must be, and it must then telescope and run 9 m stands, not 3 m rods.
  **Do not mix the two.** `[XP]` p.20: *"telescopic mast… can be angled to
  near-horizontal position"*, *"pulling and running rods in 9 m (30 ft) lengths"*.
- **Mast angle range: 45° to 90°** `[C140]` p.10 (*"Drilling angles from 45° to
  90°"*) — and the dimension drawing is drawn at exactly those two positions. The
  deep-hole rig goes further, to *"near-horizontal"* `[XP]` p.20.
- Mast raise/dump is hydraulic: *"Hydraulic mast raise"*, *"Hydraulic mast dump"*
  `[C140]` p.6 — so there **are** tilt rams, and they are large.
- *"**Ware [wear] lines on lower mast**"* `[C140]` p.6 — replaceable wear strips
  down the lower mast where rods drag. A visibly different strip.

**Why it matters visually:** the punched-hole plate beam is the single feature that
says *core rig* rather than *piling rig* or *blasthole rig*. Get this wrong and the
machine reads as the wrong trade entirely.

### 4.2 Crown block — the top of the mast

*"**Large crown sheave wheel**"* `[C140]` p.6, and the design note: *"Improved
robustness of the **crown block with steel sheaves and larger wireline pulleys**
extends the service life of both the wire and the pulleys"* `[C140]` p.3. In `[MET]`
p.17 this is a distinctly **boxy housing, wider than the mast**, at the very top,
painted the machine colour, with sheave axles protruding as small round bosses each
side. `[MET]` p.18 shows grab handles on it.

**Two rope systems pass over it and they are very different sizes** — a detail most
game models get wrong:

- **Main hoist rope: 16 mm diameter**, 29 m long, 80 kN single line bare drum,
  44 m/min `[C140]` p.6.
- **Wireline rope: 4.76 mm (3/16 in) diameter**, 2 000 m capacity, line speed up to
  **420 m/min full drum** `[C140]` p.6.

So the wireline is a **hair-thin cable, under 5 mm**, running at up to 7 m/s. The
main hoist line is over three times thicker.

### 4.3 Rotation head / drive

- **Gear-driven, two-gear** rotation unit `[MET]` p.17, `[C140]` p.3 — *"a new two
  gear rotation unit"*, with a **gear indicator on the control panel** `[C140]` p.6.
- **Hollow spindle** with a **hydraulic chuck** `[C140]` p.3; bore sized by rod
  family: N 77–103 mm, H 103 mm, **P 120 mm / 4.73 in** `[XP]` pp.13–21.
- Speed and torque: up to **1 500 RPM**, **3 212 Nm** `[XP]` p.19 — fast and light.
- Visually a **compact rectangular gearbox block** straddling the beam, chuck below
  it, hose ports on the back. In `[MET]` p.18 it is dark grey/black against the
  yellow mast.
- Deep-hole variant: *"'P' size **chuck drive** C40 rotation head with hollow
  spindle and **stepless speed control**"* `[XP]` p.20.

### 4.4 Rod holder / foot clamp at the collar

*"Hydraulic **PW-size rod holder**"* `[C140]` p.6 — standard equipment. It sits at
the **mast foot at the collar**, is full P/PW bore, and grips the string while the
head backs off. Model it as a **squat hydraulic jaw block bolted across the bottom
of the mast**, two opposing jaw inserts, a pair of small cylinders. One of the
wettest, dirtiest parts on the rig.

### 4.5 Safety guarding — mandatory, and it changes the silhouette

**EN 16228 compliance is stated on every surface rig in the folder** (`[MET]` p.17,
`[C140]` p.2). Concretely:

- *"**Safety guards with inter-lock**"* `[C140]` p.6; *"a safety guard with an
  interlock function that automatically stops the rig when activated"* `[C140]` p.3.
- *"Fitted with a **rod spin guard** for maximum safety"* `[XP]` p.14.
- Underground sister machines: *"**protecting safety guards** protect the operator
  from moving parts"* `[MET]` p.16.

Visually: a **hinged mesh or perforated-plate screen standing between the operator
and the rotating chuck**, roughly chest high, usually in the bright accent colour.
**A modern core rig without a chuck guard is period-wrong** and would fail a
European site inspection. The game currently builds the carriage with `guard: false`.

### 4.6 Rod handling — the big visual mass

**(a) The tilting rod rack / magazine.** In both `[MET]` p.17 and `[MET]` p.18 the
largest single object on the machine after the mast is a **big open rectangular
basket with expanded-metal mesh sides and floor**, mounted so it **tilts with the
mast** and lies parallel to it, hanging off one side and past the rear. Painted the
bright accent colour. Rods lie in it in flat layers. On the deep-hole rig `[XP]`
p.18 the same thing appears as an open yellow cage against the red machine.

**(b) The Rod Handling System (RHS)**, an option `[C140]` pp.10–11, whose named
parts are worth modelling because they are what moves:

- **Beam** — a long boom lying alongside/over the mast
- **Shuttle** — travels along the beam
- **Swing arm** — swings a rod from the rack onto the mast centreline
- **Main control panel** plus a separate **assistant control panel**

Sourced capacities `[C140]` p.10: rack holds **B = 25, N = 20, H = 15, P = 11 rods**;
*"Handles 3 meter and 6 meter drill rod"*; *"Handles the complete core barrel as well
as inner tube"*; the RHS alone weighs **2 500 kg** and transports at
**8 250 × 1 700 × 2 150 mm**.

**A rack of 11–25 rods is the right count**, and the count should follow the size
being run — not a fixed 15.

### 4.7 Winches

Two, and they are **different sizes** `[C140]` p.6:

- **Main hoist** — the bigger drum, 16 mm rope, 80 kN, for running the barrel and
  handling rods.
- **Wireline winch** — smaller drum but far more rope on it (2 000 m of 4.76 mm),
  and it carries *"**level wind, depth indicator and parking brake**"* `[C140]` p.6.
  The **level wind** is a visible traversing guide bar across the front of the drum —
  small, and very characteristic.
- The deep-hole rig adds a *"**Wireline wiper** and safety cut out – Keeps rig
  cleaner and prevents overwind during wireline operations"* `[XP]` p.20 — a small
  wiper box the wet wireline passes through.

### 4.8 Water / mud system — a core rig is a WET machine

- **Water pump**: *"Trido 140H"*, **140 L/min at 68.95 bar (1 000 psi)** `[C140]`
  p.6. A triplex piston pump: crankcase, three fluid-end cylinders in a row,
  pulsation bottle.
- **Hydraulic mud mixer** is standard equipment `[C140]` p.6 — a tank with a
  paddle/venturi and a hopper.
- Consumption, measured on a real project: **N-size 4.49 L/m, H-size 7.23 L/m**; mud
  pit ~4 000 L emptied every ~150 m
  ([Coring Magazine / Servitec-Foraco](https://coringmagazine.com/article/servitec-foraco-optimized-drilling/))
  via `research/02` §E1.
- A **water swivel** hangs under the crown on the hoist line when tripping
  (`research/02` §E1).

### 4.9 Hydraulics and hose routing

- Three pumps `[C140]` p.6: primary **28 MPa / 240 L/min**, secondary
  21.5 MPa / 123 L/min, auxiliary 20 MPa / 77 L/min. **Air**-cooled oil. Hydraulic
  oil tank **100 L**, diesel tank **200 L**.
- *"**Improved hose routing** makes the working environment safer and neater during
  operation. Wear is reduced, resulting in improved hose reliability and longevity"*
  `[C140]` p.3 — modern rigs run hoses **bundled and clamped in tidy runs along the
  mast**, not sprayed loose across the machine.
- **But the one loose loop is real, and it is the signature:** in `[MET]` p.18 a
  **thick black hose loop hangs in a slack catenary from the head carriage down to
  the mast foot**, long enough to follow the head over its full stroke. That loop is
  the most recognisable hydraulic detail on a core rig, and it **must lengthen and
  shorten as the carriage moves**.

### 4.10 Undercarriage

- **Crawler band width 400 mm (15.7 in)**, ground pressure **9.5 / 65 kPa**,
  **radio-remote tramming at max 2.1 km/h** `[C140]` p.6.
- Width over tracks **2 600 mm**, so **gauge ≈ 2 200 mm** (§3.4).
- Ground clearance **536 mm**.
- The tracks in `[MET]` p.17 are **low-profile, flat-top, small-diameter** — many
  small rollers, sprocket and idler at much the same height, no raised drive. A
  *dozer-style flat track*, not an excavator's high-drive triangle.
- **A trailer variant exists and is common**: four wheels **215/75R17.5** with a
  towing package `[C140]` p.6 — a second, wheeled silhouette for the same machine,
  and 2 000 kg lighter.

### 4.11 Levelling jacks — not outriggers in the excavator sense

**Four hydraulic jack legs** `[C140]` p.6, *"to adjust rig height"*, **pad diameter
230 mm at the mast end and 200 mm at the towbar end**, **leg adjust range 550 mm**.
Note how short that stroke is: these are **levelling** jacks, not the long-reach
stabilisers of a piling rig. Short vertical rams with round foot pads.

### 4.12 Operator station — NO CAB

There is **no cab and no seat** on this class. `[C140]` p.6 lists a *"**Control
panel – pilot controlled**"* with a joystick for making and breaking, a
constant-penetration-rate knob, a rotation-unit gear indicator, an emergency stop,
and an **LED screen** showing penetration rate, water flow and pressure, feed force
and hold-back, engine information and a **wireline counter**, switchable
metric/imperial. Photographs show a **waist-high pedestal console** with the operator
standing at it; `[MET]` p.17 shows a **light canopy roof on posts** over that
position; `[C140]` p.9 shows the operator standing in the open in hi-vis and hard
hat. `[XP]` p.18 goes further: *"**Radio remote tramming with no driver
compartment**"*. With the rod handler fitted there is also an *"assistant control
panel"* `[C140]` p.10 — **two panels, two people**.

### 4.13 Deck, handrails, walkways, ladders

`[XP]` p.18 shows the class clearly: a **raised open work platform** with a
**mesh/grating floor**, **tubular handrails in the safety accent colour** around its
edge, a **short stair with handrails** down to ground, and a separate **detached
grating catwalk on legs** set out in front at the collar for the crew to stand on.
`[C140]` p.9's close-up shows grating deck plate and handrail stanchions. A
*"**Lighting kit**"* is standard `[C140]` p.6 — work lamps on the mast and over the
deck.

### 4.14 Power pack / engine enclosure

- **142 kW / 190 hp Tier 4** on the surface rig `[XP]` p.19; the modular rig runs a
  *"**Cummins B4.5** diesel"* with *"a class-leading power-to-weight ratio"* `[MET]`
  p.18.
- Visually: a **louvred sheet-metal enclosure** with removable side panels, an
  **exhaust stack curving up out of the top**, a radiator pack at one end. On the
  modular rig `[MET]` p.18 the power pack is a **visibly separate box** on the same
  skid — split lines and lifting eyes on show.
- On the deep-hole rig `[XP]` p.18 the engine end is left **open and dark** — *"Open
  and accessible design for maintenance"* is a stated design theme across `[XP]`.

### 4.15 Counterweight — **there isn't one**

No counterweight is listed or visible on any surface core rig in the material. The
mast is light and stands near-vertical over the base; there is nothing to
counterbalance. **A counterweight on this machine would be a domain error** — that is
a piling/foundation-rig feature. (The game correctly does not build one; noted here
so nobody adds one later.)

### 4.16 What a modular / heli variant adds

`[MET]` p.18, `research/02` §E2: *"split into a small number of units"*, *"each unit
is fitted with **sturdy lifting points**"*, assembled rapidly on site. The visual
signature is **padeyes on every module and obvious split lines**, sitting on **skids
rather than tracks**, on a **timber-cribbed pad**. Module mass ceiling ~860 kg for
small helicopters; 7 modules is typical.


## 5. Distinctive features — the thumbnail silhouette test

If a player sees this machine at 64 px, five things must be present. In order of
how much they carry the read:

1. **A slender, hole-punched plate mast standing at a slight backward lean, far
   taller than the machine is long.** ~10.8 m of mast over a 6.6 m base `[C140]`
   p.6 — a **~1.6 : 1 mast-to-base** ratio. The dotted line of circular lightening
   holes down the web is the texture that survives downsampling (`[MET]` pp.17, 18).
2. **A big mesh-sided rod basket tilted parallel to the mast**, hanging off one
   side and out past the rear, in a contrasting bright colour. It is the second
   largest object in the silhouette and it is the thing that is *not* on any other
   drilling machine (`[MET]` pp.17, 18; `[XP]` p.18).
3. **No cab.** The gap where a cab would be is a positive identifying feature.
   Just a low pedestal console under a light canopy, with a standing figure
   (`[C140]` pp.6, 9; `[XP]` p.18 — *"no driver compartment"*).
4. **A wide, low, flat-track crawler** — gauge ≈ 2.2 m under a 2.9 m-wide machine
   with 536 mm clearance `[C140]` p.6. Broad and squat, sitting close to the ground,
   with four short jack legs poking down at the corners.
5. **A hair-thin wireline running from a drum at deck level, up the mast, over a
   boxy crown block, and straight down the hole** — 4.76 mm rope `[C140]` p.6. Plus
   the **wet ground and stacked core trays on trestles** around it (`research/02`
   §E4). If the site is dusty and there is a cyclone, you have drawn an RC rig.

**The one-line disambiguator**, from `research/02` §E4 — worth quoting to any
artist who works on this machine:

> *"The core rig has a thin wireline running over a sheave at the mast crown, a
> water tank and sump, and core trays stacked on trestles. The core rig site is
> wet; the RC site is dusty."*

## 6. Materials and paint

Sourced primarily from the close-up photograph `[C140]` p.9 (a wet, working rig
photographed in the field, not a studio shot) and the studio shots `[MET]` pp.17–18.

| Surface | Material read | Notes |
|---|---|---|
| Main structure, mast, rod basket, handrails | **Painted steel, semi-gloss**, one strong brand colour | The class runs bright: **yellow** `[MET]` pp.17–18, **red/orange** `[XP]` pp.18, 20. Pick one and commit. |
| Frames, skid, engine enclosure, deck beams | **Anthracite / blue-grey painted steel**, flatter finish | The two-tone (bright + dark grey) is consistent across every machine in the folder. Do not paint everything one colour. |
| Guarding, rod basket sides, deck floor | **Expanded metal / perforated plate**, painted | Reads as a fine regular mesh. Very characteristic; worth an alpha-mapped plane rather than geometry. |
| **Drill rods** | **Bare mild steel, rust-brown**, NOT chrome, NOT painted | `[C140]` p.9 shows this unambiguously: warm rust-brown along the body, with **bright machined threads** at the pin and a darker tool joint. Rods pulled from a wet hole are wet and rusty within hours. |
| Cylinder rods (tilt rams, jacks, clamp) | **Hard chrome, genuinely mirror-bright**, with an oil film | The only truly chrome parts on the machine. |
| Rod-handler brackets, small fabrications | **Bright zinc-plated / galvanised**, slightly mottled silver | Visible in `[C140]` p.9 against the yellow paint. |
| Hoses | **Matte black rubber**, with **plated steel fittings** and coloured ID clamps | `[C140]` p.9 shows blue/silver clamp bands. |
| Tracks, shoes, sprocket, idler | **Bare worn steel**, polished bright on the shoe grousers where they touch ground, dark and packed with mud elsewhere | |
| Glass | Almost none — **no cab**. At most a small instrument lens and lamp glass | See §9: the game should not spend a transparent pass here. |
| Fresh-welded / unpainted fabrications | Grey mill scale with **blue and straw heat-tint around the welds** | Seen directly in `Downloads/Atpa/_MG_7700-Bearbeitet.jpg` — different tooling, same steel language. |

**Where wear, dirt and rust actually accumulate** — this class is specific, because
**a core rig site is wet, not dusty** (`research/02` §E4, `research/16`):

- **Everything below about knee height is wet and mud-splashed**, not dust-coated.
  Streaks run **downward**, and the mud is **grey-brown slurry**, often with a
  drilling-fluid sheen — cuttings-laden water, not dry dust.
- **The collar area is the filthiest place on the machine**: the rod holder, the
  bottom metre of the mast, the front jack pads. Continuous return water plus
  cuttings.
- **Down the lower mast** there is a distinct **rubbed, paint-worn band** where rods
  drag against the wear lines — `[C140]` p.6 literally sells replaceable *"ware
  lines on lower mast"*, so put the wear exactly there.
- **The rod basket** is scratched to bare metal on its cradles and along the top
  edges where rods are dragged in and out.
- **Chuck jaws and rod-holder jaws** are bare polished steel, never painted.
- **Rust** appears on rods, on unpainted fasteners, on the wireline itself, and as
  bleed-streaks below chipped paint edges — not as broad panel rust. The machines are
  young; the *consumables* are what look old.
- **Grease** shows dark at every pin joint and on the mast pivot.
- **Hydraulic oil weep** darkens the mast below the cylinder glands.
- **The wireline drum** is bright, shiny, oil-and-water-slicked steel — 2 000 m of
  thin rope that has been in and out of a wet hole.

## 7. Photo references

**Honest headline: there are no photographs of a diamond core rig loose in
`C:\Users\henri\Downloads` or in `Downloads\Atpa`.** Every usable image of this class
is *inside the PDFs*. I rendered the relevant pages to PNG so a modeller can open
them directly.

| Rendered image (scratchpad) | Source page | Useful for |
|---|---|---|
| `met_p17.png` | `Mineral Exploration Tooling - Catalog.pdf` p.17 | **The best overall side-on view.** Tracked surface rig, mast at ~70°, whole machine visible against white. Read: mast hole pattern, crown block, tilted rod basket, canopy, flat-track undercarriage, two-tone paint. |
| `met_p18.png` | same, p.18 | **The most legible single image of the class.** Three-quarter view of the modular/skid rig. Read: plate feed beam, the **hanging hose loop** from the carriage, the mesh rod basket, the separate power-pack module, the pedestal console. |
| `xp_p18.png` | `Xploration+Products+Katalog+2024+-+English.pdf` p.18 | Deep-hole surface rig in red. Read: raised deck, **handrails, access stair, detached grating catwalk**, open rod cage, whip antenna for radio remote, dark open engine bay. |
| `xp_p20.png` | same, p.20 | **The lattice/telescoping archetype.** Ladder-type mast with rungs; the alternative mast design, and the one that runs 9 m stands. |
| `c140_p4.png` | `[C140]` pp.6–7 | **The dimensioned general arrangement** — side and front elevations, mast at 90° and 45°, letters A–K. This is the drawing everything in §3.4 comes from. Use it as modelling underlay. |
| `c140_p5.png` | `[C140]` pp.8–9 | **The materials reference.** Wet working close-up: rust-brown rods with bright threads, yellow paint, zinc brackets, mesh, grating, black hose, chrome rod, and the crew's hi-vis and hard hat. |

Scratchpad path:
`C:\Users\henri\AppData\Local\Temp\claude\C--Users-henri-Downloads-threads\58b8454d-8bd2-4e3d-8c05-92b4953f6ab5\scratchpad\`
These are temporary. If they matter, copy them into the repo before the session ends.

**Checked and NOT useful for this rig:**

- `Downloads\Atpa\*` — verified by opening `_MG_7700-Bearbeitet.jpg` and the file
  listing: **continuous-flight augers and large-diameter drill heads** (hex-drive
  augers, `Bohrkopf_für_VdW508`, `BohrköpfeØ129_238API`). That is foundation/piling
  tooling, a different trade. Good *steel and weld* reference, no core-rig content.
- `Downloads` root images — logos, Drillity marketing, AI-generated (`Gemini_*`,
  `ChatGPT Image *`) and stock (`AdobeStock_*`) files. **AI-generated images must not
  be used as geometry reference for a "no guessing" brief.**
- `Downloads\drillity-the-game\shots\*core*.png` — these are the game's own renders,
  useful only as the "before" picture (see §9).

## 8. NOT SOURCED

Everything below I could not find in the local material or in one targeted web pass.
None of it is guessed at anywhere above.

- **Feed stroke of the specific dimensioned rig** `[C140]`. The brochure gives mast
  angles, depths and hoists but **never prints a feed length**. The 3 450 mm used in
  §3.1 is from a *different* manufacturer's surface rig `[XP]` p.19. Do not attribute
  it to the dimensioned machine.
- **Mast cross-section dimensions** — web depth, flange width, plate thickness, and
  the **diameter and pitch of the lightening holes**. Visible in photos, never
  dimensioned. Must be eyeballed off `met_p17.png` / `met_p18.png`; flag as estimated.
- **Track length, number of rollers, sprocket and idler diameters.** Only the *shoe
  width* (400 mm), *width over tracks* (2 600 mm) and *ground clearance* (536 mm) are
  published. Track length is not.
- **Deck height above ground.** Derivable only loosely; the ~1.3 m mast-pivot height
  in §3.4 is arithmetic, not a published deck height.
- **Rotation head physical size** (length/width/height of the gearbox block) and
  **chuck outside diameter**. Only bore, torque and RPM are published.
- **Rod-holder / foot-clamp dimensions.** Only *"PW-size"*.
- **Winch drum diameters and widths.** Rope diameter, length, pull and speed are all
  published; the drums themselves are not dimensioned.
- **Crown block dimensions and sheave count.** *"Large crown sheave wheel"* and
  *"steel sheaves and larger wireline pulleys"* (plural) — but no count and no size.
  The game's 2 sheaves is a reasonable read of the photo, not a sourced number.
- **Rod magazine dimensions** for the standard tilting rack. The **RHS option** is
  dimensioned (8 250 × 1 700 × 2 150 mm, 2 500 kg) but that is the *optional handler*,
  not the basic rack.
- **Exact paint colours / RAL references** for any manufacturer. Deliberately not
  chased — see §10 note; the game must not copy a livery anyway.
- **Cycle times** — how long a wireline overshot run actually takes at depth, and the
  rod-tripping rate per hour. Line *speed* is published (up to 420 m/min) but not the
  full cycle.
- **Sound.** Nothing in the local material describes what this machine sounds like.
- **Underground core rig anchoring arrangement** — already flagged as `NOT SOURCED`
  in `research/16` line 3420, and I did not improve on it.
- **Whether the mast upper section on the dimensioned rig folds or telescopes.**
  Sources say *"mast in two sections"* with *"hinges"* `[C140]` — implying folding —
  while a different manufacturer's rig explicitly *telescopes* `[XP]` p.20. **The two
  mechanisms are genuinely different and both exist in the class.** Not resolved.

## 9. Domain-truth warnings — what the game currently gets wrong

Compared against `src/rig/rigFactory.js` → `buildCoreRig` (from ~line 2597) and the
current render `shots/mq7-core-rig-w7000.png`.

### 9.1 Wrong — fix these

| # | Game now | Reality | Source |
|---|---|---|---|
| 1 | **`buildLatticeMast(...)` — a four-chord lattice tower with X-bracing.** The render reads as a **miniature oil derrick**. | A surface core rig runs a **plate/box feed beam with a row of round lightening holes**. The lattice belongs to the *other* archetype, which must then telescope and run 9 m stands. | `[MET]` pp.17, 18; `[XP]` p.20 |
| 2 | `gauge: 0.86`, `trackWidth: 0.40` → **1.26 m over tracks**, `bodyW: 1.90` | **Width over tracks 2 600 mm; overall width 2 895 mm.** The game machine is roughly **half as wide as it should be** and reads as a mini-excavator. Gauge should be ≈ **2.2 m**. | `[C140]` p.6 |
| 3 | `mastH = 5.4` | Mast ≈ **10.8 m** (derived), working height **12 155 mm**. The game mast is **about half height** — and at 5.4 m it **cannot handle the 6 m core barrels** the class is defined by. | `[C140]` p.6; `[MET]` p.17 |
| 4 | Wireline modelled as **one** rope at `r: 0.008` (**16 mm dia**) | **Two ropes, different sizes**: main hoist **16 mm**, wireline **4.76 mm**. The game's single rope is the *main hoist* diameter used for the *wireline* — **3.4× too thick**. | `[C140]` p.6 |
| 5 | `weightKg: 8200`, `powerKw: 97` | **13 000 kg** crawler (11 000 kg trailer), **142 kW**. Both game figures are low. | `[C140]` p.6; `[XP]` p.19 |
| 6 | `buildCarriage(..., guard: false)` | **EN 16228 requires an interlocked guard** at the chuck, and a **rod spin guard**. Stated on every surface rig in the folder. A modern rig without one is period-wrong. | `[C140]` pp.3, 6; `[MET]` p.17; `[XP]` p.14 |
| 7 | `buildRodRack(..., rows: 3, cols: 5)` = **15 rods, lying flat on the deck** at `[0, 1.02, -3.4]` | The rack is a **mesh basket that tilts with the mast**, parallel to it, off the side and past the rear. Capacity **B 25 / N 20 / H 15 / P 11** — it should follow the size being run. | `[C140]` p.10; `[MET]` pp.17, 18 |
| 8 | `capacityM: { BQ: 1200, NQ: 900, HQ: 600, PQ: 350 }` | Published: standard **B 1 536 / N 1 211 / H 804 / P 491 m**; deep-hole **B 1 824 / N 1 381 / H 1 100 / P 770 m**. Game is uniformly conservative. Also the *name* says "CX-**1200**" while NQ capacity is set to 900 — internally inconsistent. | `[C140]` p.5 |
| 9 | Hoses run body → mast base only | The signature is a **slack hose loop hanging from the head carriage** that **lengthens and shortens with the stroke**. Missing entirely. | `[MET]` p.18 |
| 10 | No deck stair, no detached collar catwalk, no work lighting | Class has a **raised grating deck, handrails, an access stair**, a **separate grating catwalk on legs at the collar**, and a standard **lighting kit**. | `[XP]` p.18; `[C140]` pp.6, 9 |
| 11 | Wireline winch is a plain drum | Real one has **level wind, depth indicator and parking brake**; the deep-hole rig adds a **wireline wiper**. The level-wind bar is a cheap, high-value detail. | `[C140]` p.6; `[XP]` p.20 |

### 9.2 Already right — do not "fix" these

- `trackWidth: 0.40` — **exactly** the published crawler band width of 400 mm.
- `buildOutrigger(..., stroke: 0.55)` — **exactly** the published leg adjust range of
  550 mm, and there are correctly **four** of them.
- `rodLen = 3.0` and rod radius `0.035` (70 mm OD) — correct for 3 m N-size rods.
- **No cab, operator stands at a console** — correct, and the code comment *"core
  drillers work standing"* is right. `[C140]` p.9, `[XP]` p.18.
- **No counterweight** — correct; adding one would be a piling-rig error.
- `buildMastStack` giving `lower` + `upper` — matches *"mast in two sections"*.
- `tiltDeg: '45-90'` in the spec — **exactly** the published *"Drilling angles from
  45° to 90°"*.
- Two winches of different sizes (`r0: 0.20` wireline, `0.24` main) — correct that
  they differ, and correct which is bigger.
- Water pump + mud tank present — correct; a core rig is a wet machine.
- `carriageRange` gives a **3.18 m stroke**, close to the published **3.45 m** feed
  length. Keep the stroke; it is the *mast* around it that is too short.

### 9.3 Cheap wins, highest visual return first

1. Swap the lattice for a **plate beam with punched holes** (§4.1). Biggest single
   gain, and an *instanced hole ring* is cheaper than lattice bracing.
2. **Widen the track gauge to ≈2.2 m** and widen the body to match. Costs nothing.
3. **Thin the wireline to ~5 mm** and add a second, thicker main-hoist line.
4. **Tilt the rod rack to lie parallel to the mast** and give it mesh sides.
5. Add the **carriage hose loop**.
6. Add the **chuck guard** (`guard: true`).
7. Grow the mast toward ~10 m, or accept a deliberately compact variant — but then
   drop the "6 m core barrel" claim from any copy.

### 9.4 Glazing note

`rigFactory.js`'s header discusses a glazing pass across the fleet and lists
`core-rig` among machines whose glazing *"is buried inside the body and cannot be
seen from any angle"*. That is consistent with reality for a different reason worth
recording: **this machine has no cab and essentially no glass at all.** The only
glazing is an instrument lens and lamp covers. If any budget is still being spent on
a transparent pass for `core-rig`, it can be removed outright rather than
approximated.

## 10. Naming — read before modelling

`DOMAIN.md` §10 forbids real manufacturer names and model designations as in-game
product names. Manufacturer names appear throughout this document **only so the
figures can be cited**. Specifically:

- **Do not put a badge, logo, model plate or decal** copied from any source photo
  onto the mesh. The studio photographs in `[MET]` and `[C140]` all carry visible
  maker's marks — model the *shape*, invent the *brand*.
- **Do not reuse a livery** as an identity. Bright yellow with anthracite, or red
  with yellow safety furniture, are both *class-typical*; a specific maker's exact
  colour plus their layout is not.
- The game's own invented name for this rig is fine in principle, but note that
  `research/02` line 3518 already lists real rig and hammer family names to avoid,
  and that **`BQ / NQ / HQ / PQ`** carries a manufacturer's "Q" series branding.
  The neutral industry designations used by other manufacturers throughout this
  document are simply **B, N, H and P** — safer, and equally readable to a driller.

## 11. Source keys

| Key | File / URL |
|---|---|
| `[C140]` | Manufacturer brochure for a tracked/trailer surface core drilling rig, 7 pp., 2021. Retrieved from `https://firstbreak.co.nz/wp-content/uploads/2021/02/christensen-140.pdf` (mirror; the manufacturer's own copy returned HTTP 403). **The only fully dimensioned source found.** |
| `[MET]` | `C:\Users\henri\Downloads\Mineral Exploration Tooling - Catalog.pdf`, pp.15–18 |
| `[XP]` | `C:\Users\henri\Downloads\Xploration+Products+Katalog+2024+-+English.pdf`, pp.11–21 |
| `[DDTB]` | `C:\Users\henri\Downloads\Diamond Driller's Technical Book.pdf`, pp.31–33 (rigs), pp.48–49 (rod weights, via `research/02`) |
| `research/02` | `C:\Users\henri\Downloads\drillity-the-game\research\02-prospecting.md` §E1–E4 |
| `research/16` | `C:\Users\henri\Downloads\drillity-the-game\research\16-site-archetypes.md` |
| — | Container internal dimensions: https://www.maersk.com/transportation-services/shipping-containers/dry |
| — | Fluid consumption case study: https://coringmagazine.com/article/servitec-foraco-optimized-drilling/ |
| — | Rod handling weights: https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/ |
| — | Heli module mass: https://bluemaxdrilling.com/heli-portable-drilling |
| — | Conflicting trailer weight (9 500 kg): https://www.scribd.com/document/661313765/CS-14 |
