# cfa-rig — CFA / cased-CFA fixed-mast (fixed-leader) piling rig

status: in progress
subject: game rig id `cfa-rig` (builder: `src/rig/rigFactory.js` → `buildCFARig`)
compiled: 2026-09-04

> **NAMING RULE (DOMAIN.md §10):** everything below is GEOMETRY and MATERIALS reference only.
> Real manufacturer names and model designations (Bauer BG/MC, Liebherr LB/LRB, Casagrande B/C,
> Soilmec SR/SF, IMT AF, Junttan, EMDE, BWH/Betek …) must NOT appear as product names, badges,
> decals or spec-sheet text in the game. Model the shapes, invent the badge.

## 1. Sources read
## 2. What the machine IS
## 3. Proportions
## 4. Component inventory
## 5. Distinctive features
## 6. Materials and paint
## 7. Photo references
## 8. NOT SOURCED
## 9. Domain-truth warnings (what the game currently gets wrong)

---

# INTERIM FINDINGS (research packs first, primary PDFs below)

## 2. What the machine IS — draft

A CFA rig is a **crawler-mounted, slewing bored-piling rig whose front end is a
single tall fixed mast** carrying a **rotary drive that travels the full length
of the mast** and, hanging from that drive, **one continuous flight auger as long
as the pile is deep**. It is not a drilling rig in the rod-handling sense: there
is no rod string, no carousel, no Kelly bar, no flush. The auger goes in **in one
pass** — `[FPS-PUWER3]`: *"the auger or digging tool extends over the full depth
of the pile bore… screwed into the ground in one pass"* (`research/16` §B.9). The
auger's hollow stem is plugged at the toe; at depth, high-slump concrete is
pumped down the stem and the auger is withdrawn at a controlled rate while
concrete fills behind it — never lift the auger dry. That gives the machine its
two unique visual organs: a **concrete delivery hose running from a ground-based
concrete pump, up the mast, to a swivel on top of the rotary head**, and an
**auger cleaner** stripping spoil off the flights as they come up
(`research/05` §C4, `[TOM]` §3.4.7, §3.3.1).

The **cased-CFA / double-rotary (CCFA, German *Doppelkopfbohren*, catalogued as
VdW / FOW)** variant stacks a **second, counter-rotating drive head** on the same
mast driving an outer casing around the auger (`research/05` §A7, `[EMDE-PF]`).
Two heads on one mast, turning opposite ways, is the whole silhouette difference.

Where it stands: urban plot and infrastructure corridor. Never on a boulder or
shallow-rock site (you cannot pull a continuous auger through a boulder), never
where there are overhead obstructions — *"The mast height should exceed the pile
length"* `[STRUCTVILLE-CFA]` — and never anywhere concrete cannot be supplied
continuously (`research/16` §B.9).

## 3. Proportions — draft (from research packs; primary-PDF figures below)

| Quantity | Value | Source |
|---|---|---|
| **Mast height ≥ pile length** — the governing rule | *"The mast height should exceed the pile length"* | `[STRUCTVILLE-CFA]` via `research/16` §B.9 |
| CFA depth on a *leader* piling rig in CFA configuration | **26 m** pile, Ø **1 200 mm**, 400 kNm torque, 100 t extraction, 36 t pull-down | `[JUN-PILE]` via `research/05` §A6, §C4 |
| CFA depth on a large rotary rig | **24–34.5 m** (vs **70–101.7 m** on Kelly, same machine) | Soilmec SR-95 datasheet via `research/10` §D.6 |
| Long-stroke special CFA rigs | **34 m** deep piles | `[TOM]` §3.3.1 |
| Published method envelope | Ø **600–1 200 mm**, max depth **50 m** | `[BAUER-METHODS]` via `research/16` §B.9 |
| Heavy machine in **CCFA** configuration | **600 kNm casing / 240 kNm auger**, **1 060 kN** combined line pull, **24.1 m** at Ø 1 000 mm, 597 kW | `[BAU-CAT]` (bauma 2025 catalogue) via `research/05` §A7, §C3 |
| Mast extensions are the visible CFA upgrade | "mast extension 3 m or 5 m"; **"mast extension 5 + 5 m for CFA"** | BG 45 brochure p.6 via `research/10` §D.6 |
| Red zone on site (scene scale) | **10 m** for CFA (vs 5 m for large-diameter auger) | `[FPS-RZ]` via `research/16` |

**RATIO THAT MATTERS:** mast height ÷ pile depth ≈ **1.15–1.3** (mast must exceed
pile length, plus the head's own stroke reserve and the masthead above it).
Mast height ÷ overall machine length is the other one — on this class the mast is
**taller than the machine is long**, which is already true from the midi class up
(`research/10` §D.3).

## 4. Component inventory — draft (research packs)

- **Mast**: tall, fixed (non-telescoping), box or lattice, with the rotary drive
  running its full length on guide rails. Mast extension sections are bolted on
  for deeper CFA (BG 45 brochure p.6). `research/05` §C3: "a long lattice or box
  mast, a rotary drive (KDK) that travels up and down the mast".
- **Rotary drive (KDK)** on a carriage — travels the whole mast, not a short
  stroke. This is the crowd/feed system.
- **Concrete swivel + delivery line** — swivel on top of the rotary head, hose
  down the mast to a **ground-based concrete pump**. `research/05` §C4:
  *"That hose is the CFA rig's signature and no other foundation machine has
  it."* Concreting bore in the auger stem **100 or 127 mm** `[TOM]` §3.4.7;
  the starter's concreting line **Ø 120 mm**, outlet **between the cutting
  edges** `[BAU-CFA]`; alternative concreting ID range **125–200 mm** `[EMDE-PF]`.
- **The auger itself** — Ø 400–1 200 mm (`[EMDE-PF]`); standard starter Ø
  **500, 550, 600, 630, 750, 770, 880, 1 000, 1 180 mm** `[BAU-CFA]`. Flight
  pitch **100–150 mm** small Ø, **100–300 mm** mid, **250–400 mm** large
  `[EMDE-PF]`. Central pipe **168×20, 178×25, 203×40 mm**, or **445×10 with
  146×10** `[EMDE-PF]`. Sections **1–9 m** useable length, **hexagonal or
  octagonal couplings** (claw coupling with link-chain securing on request).
- **Auger cleaner** — hydraulic arm stripping spoil off the flights, adjustable
  across diameters **400–2 000 mm** `[TOM]` §3.3.1, `[BAU-CAT]`.
- **Spoil handling** — spoil *"travels up the auger string and is deposited from
  the top of the casing into a series of telescopic tubes safely expelling it
  directly into a disposal vehicle, a skip or to a holding area"* `[WP-CFA]`,
  `[SB-CFA]`. Largest machines: "spoil discharge system with chute-bucket
  assistant for directed ejection" `[BAU-CAT]`. **A skip beside the rig is part
  of the machine's read.**
- **Counterweight** — a slab at the back, routinely removed for transport; Bauer
  headline weights are quoted "transport weight **w/o counterweight**"
  (`research/10` §D.5).
- **Winches** — three or four visible on the uppercarriage on the big class:
  main, auxiliary, crowd; single-layer winch for minimised rope wear, swing-down
  for transport (`research/10` §D.5).
- **Walkways with folding handrails** on the upper level, folding guardrails for
  transport — "a real, visible detail on every big rig" (`research/10` §D.5).
- **Telescoping undercarriage** — widens for work, narrows for transport
  (`research/10` §D.3, §D.5).
- **Cab screen** — depth, torque, rotation speed, penetration rate while boring;
  concrete pressure and flow while concreting `[TOM]` §2.4.2.
- **CCFA second drive head** — two drives stacked on the mast turning opposite
  ways, casing torque 60–180 kNm / auger 35–90 kNm across Ø 406–900 mm
  `[EMDE-PF]`; concreting passage through the drive **100–190 mm**; casing joints
  **watertight by O-ring seals**; a **box for controlled outlet of the drill
  goods** `[EMDE-PF]`.

status: continuing into primary PDFs for dimensions and photographs

---

# PRIMARY SOURCE 1 — dimensioned general arrangement of a CFA-configured rotary rig
### `C:\Users\henri\Downloads\SUNWARD_DRILLING-RIGS_S-SERIES_EN.pdf`, **p.25** (page label "24"), SWDM240SC

**This is the single most useful document found for this rig.** It is a side-elevation
general-arrangement drawing of a **CFA-configured** crawler rotary rig with the
continuous auger hung on the mast, fully dimensioned, plus the transport
elevation and the full parameter table. (`S`-series suffixes decode as:
plain `S` = Kelly rotary, `SW` = long-stroke, `SC` = **the CFA / continuous-auger
configuration** — its giveaway is a short drilling depth against a huge crowd
stroke: Ø 1 000 mm × 22 m depth with a **17 000 mm crowd stroke**, p.25.)

## Dimensions read off the drawing (all mm unless stated), p.25

| Dimension | Value | Note |
|---|---|---|
| **Overall height, working state** | **28 120** | mast + masthead + rope guide arch |
| **Crowd stroke** (dimensioned on the mast) | **17 000** | the rotary drive travels 17 m of the mast |
| **Overall length, working state** | **9 663** | split **3 788 + 4 750** on the drawing about the slew/mast reference |
| **Chassis (track frame) length** | **5 755** | separately dimensioned over the crawler |
| **Track shoe width** | **800** | parameter table |
| **Crawler retractable width (over tracks)** | **3 000 – 4 500** | → centre-to-centre gauge ≈ **2 200 – 3 700** |
| **Transport width** | **3 000** | |
| **Transport length** | **17 945** | mast laid back over the machine, with **8 235** as the sub-dimension |
| **Transport height** | **3 615** | |
| **Auger diameter dimensioned on the drawing** | **1 000** | max drilling diameter |
| **Auger cleaner height above ground** | **1 100** | the star-shaped cleaner sits here |
| **Base / drilling-table box height** | **1 630** | orange box at the mast foot |
| **Operating weight** | **73 t** | |
| Engine | Cummins L9, **252 kW @ 1 800 rpm** | |
| Rotary | **248 kNm**, 6–28 rpm | |
| Main winch | 280 kN, 72 m/min, **rope Ø 32 mm** | |
| Crowd | 270 kN crowd / 270 kN pull, **stroke 17 000** | |
| Auxiliary winch | 80 kN, 58 m/min, **rope Ø 20 mm** | |
| Mast inclination | **±5° left/right**, **5° forward / 90° back** | back-90° = it lies down for transport |
| Depth vs kelly extension | no ext. **15 m** · +3 m ext. **19 m** · +5 m **21 m** · +6 m **22 m** | with "auger kelly" |

## ★ RATIOS (the part that actually matters for modelling), from p.25

- **Working height ÷ track length = 28.12 / 5.755 ≈ 4.9 : 1.** The machine is
  five track-lengths tall. This is the proportion the game must not get wrong.
- **Working height ÷ working length = 28.12 / 9.663 ≈ 2.9 : 1.**
- **Crowd stroke ÷ mast height ≈ 17.0 / 28.12 ≈ 0.60.** The drive travels 60 % of
  the overall height — a CFA drive runs almost the whole mast, unlike a Kelly rig.
- **Track width over tracks ÷ track length = 3.0–4.5 / 5.755 = 0.52–0.78.**
  Nearly square in plan when extended.
- **Transport length ÷ working length = 17.945 / 9.663 ≈ 1.86.** Laying the mast
  down almost doubles the machine's footprint length.
- **Transport height ÷ working height = 3.615 / 28.12 ≈ 0.13.**
- Auger Ø 1 000 against mast height 28 120 → **the auger is 1/28 of the mast
  height in width.** It reads as a thread, not a column.

## What the p.25 drawing SHOWS (geometry, in order top to bottom)

1. **A rope-guide arch / auger top guide** at the very top — a slim inverted-U
   frame standing above everything, with the auger's top stub passing through it.
2. **A masthead frame that cantilevers FORWARD of the mast**, carrying **two large
   rope sheaves** side by side on a cross-beam. The head is visually a separate
   assembly, wider than the mast.
3. **The rotary drive head** on a carriage, drawn near the top of stroke. It is a
   compact block, wider than deep, with hydraulic motors visible on top.
4. **The drill axis stands OFF the mast front face** by roughly one auger radius
   plus clearance — the auger does not touch the mast.
5. **The mast is BOX SECTION, not lattice** — a plain fabricated column with a
   regular pattern of oval lightening/handling holes down the face, and the
   carriage rails on its front. This is the standard for this class.
6. **A rope deflection sheave block partway down the mast** (about 1/3 height),
   projecting sideways.
7. **A heavy diagonal mast cylinder** with a visible chrome rod running from the
   uppercarriage up to about mid-mast, plus a **triangular A-frame / parallelogram
   linkage** from the uppercarriage deck to the mast foot. The mast is carried on
   this linkage, not bolted rigidly to the deck.
8. **Two ropes** run from the uppercarriage winches over the masthead sheaves.
9. **The star-shaped auger cleaner** at 1 100 mm above ground — a multi-arm rotor
   that sweeps the flights. It is a small, busy, unmistakable detail.
10. **An orange base/drilling-table box** at ground level at the mast foot, 1 630
    mm high, sitting under the auger.
11. **Cab forward-left, low and glazed on three sides**, with a slanted front
    screen; roof guard.
12. **Uppercarriage with a full-length walkway and handrails** along the top of
    the engine housing.
13. **A slab counterweight** at the extreme rear.
14. **Long crawler with an idler at the front, sprocket at the rear** and roughly
    eight track rollers between them; the base frame passes through above them.

## The transport elevation on the same page

Mast folded back **90°** and laid over the machine, resting on a support at the
rear; the whole thing becomes **17 945 × 3 000 × 3 615 mm**. The mast when laid
down overhangs the tracks at BOTH ends. Note the mast-tilt kinematics: forward
travel is only **5°** but rearward is **90°** — so the fold is one direction only.


---

# PRIMARY SOURCE 2 — the CFA string itself
### `C:\Users\henri\Downloads\2-2-EMDE-Katalog-Pfahlbohren.pdf`

Index of the pages that matter (74 pages total; most of it is Kelly tooling,
buckets, core barrels — not this rig): **p.40–43 "SOB-System / CFA-System"**,
**p.44–48 "VdW-System / FOW-System"** (= cased CFA / double rotary),
p.55–58 displacement augers, p.59–61 full displacement tool. Pages 5–8 (Kelly
bars), 17–29 (buckets, core barrels), 62–71 (soilmix, wear parts) were **not
useful for this rig**.

## p.41 — exploded assembly of a CFA string, top to bottom

This is the drawing that tells you what sits on top of the drive head:

1. **`Betonierkopf` / concrete head, complete with concrete kelly and pipe bend
   (`Rohrbogen`)** — a squat **cylindrical drum body with a flange on top**,
   from which a **90° elbow rises and turns HORIZONTALLY**, ending in a flanged
   coupling of nominal bore `DN`. **The concrete hose therefore leaves the top of
   the head sideways, not straight up.** The game currently draws a vertical
   stub cylinder; the elbow is the correct shape and it is unmistakable.
2. **`Adapter`** — a short conical/frustum piece stepping down from the drum to
   the square coupling `SW`.
3. **`Bohrschnecke` / auger sections** — the central pipe with the helix welded
   round it, dimensioned `NL` (usable length), `P` (pitch), `S` (flight plate
   thickness), `d` (coupling), central-pipe Ø, and a **male square SW spigot at
   the top and a socket at the bottom** of every section. Each joint carries
   **3.1 a locking device, 3.2 a screw, 3.3 an O-ring seal** — the seal is there
   because concrete runs through the joint.
4. **`Anfänger` / starter** — the bottom section, in two variants:
   **4.1 side-opened concrete outlet** and **4.2 centrally/radially-opened
   outlet**, plus **4.3 a cap (`Deckel`)** and **4.4 an O-ring seal**. The cap is
   the plug that keeps soil out of the stem on the way down and is blown off by
   the concrete — a real, small, correct detail. The starter carries a ring of
   teeth on a flat cutting head, with **twin helix starts** visible on the
   drawing.

Companion tables (p.42–43): pile Ø **400–1 200 mm**; central pipe
**168×20, 178×25, 203×40**, or **445×10 with 146×10 mm**; useable section length
up to **10.0 m**; flight pitch and weights per size.

## p.45 — `Systemdarstellung` of the VdW / FOW system (cased CFA / double rotary)

The single best picture of what a **cased** CFA front end looks like:

- **Two drive units stacked coaxially, one above the other**, each with its own
  **hydraulic motors mounted radially, projecting sideways off the drive body**
  (two motors visible per drive on the elevation). The upper drives the auger,
  the lower the casing.
- Between them the drawing dimensions **`300 mm Hub / Lift`** — the axial travel
  between the two drives. That 300 mm offset is what lets the casing tip stay
  ahead of the auger tip.
- Below the lower drive, a **casing drive head / clamping box**, **1 635 mm** tall
  over the casing, gripping a **Ø 406 mm** casing, with **65 mm** at the top and
  a **270 mm** joint length.
- **The casing string**: nominal **Ø 406**, **Ø 435 over the joint collars**,
  cutting shoe **Ø 450** at the toe; sections of **4 000** and **6 000 mm**,
  strings of **10 200 / 11 920 mm**; every joint shows a **ring of bolt heads**
  on the collar — the visual signature of a cased string.
- **The inner auger**: cutting head **Ø 370**, sections **4 000 / 6 000 mm**,
  strings **10 750 / 11 770 mm**, with **755 mm** and **300 mm** dimensions at
  the toe assembly. A short **1 020 mm** starter auger with a **270 mm** stub is
  drawn separately.
- **Resulting pile: Ø 406 mm, possible pile length 10 000 mm** (`herstellbare
  Pfahllänge`).

**★ THE RATIO A MODELLER NEEDS:** auger cutting Ø **370** inside casing Ø **406**
inside cutting shoe Ø **450** — the auger is about **91 %** of the casing bore,
and the casing collars stand about **7 %** proud of the pipe. Concentric, tight,
and the casing is what you see from outside.

## p.47–48 — cased CFA drive torque by pile size (confirms `research/05` §A7)

Ø 406 → 60/35 kNm · Ø 508 → 60/35 · Ø 610 → 120/60 · Ø 750 → 160/80 ·
Ø 900 → 180/90 kNm (casing / auger).


---

# PRIMARY SOURCE 3 — hose routing (this corrects the game)
### `C:\Users\henri\Downloads\Bauer-Maschinen-Hydraulikschläuche-hydraulic hoses-DE-EN-905-213-1+2.pdf`, **p.2**

Two pages only. p.2 is the useful one: it names the three hose packages a rig of
this class actually carries, and carries a large photograph of a mast folded onto
a low-loader that shows the routing directly.

**The architecture, in the manufacturer's own terms (p.2):**

| Package | Runs | Contains |
|---|---|---|
| **`Hauptschlauchpaket` / Main hose package** | **from the hose deflection (`Schlauchumlenkung`) to the KDK bulkhead plate (`Schottplatte KDK`)** | **six main lines to the KDK**, plus high-pressure lines depending on equipment |
| **Main hose package complete** | same run | all hoses to the KDK bulkhead + **electric cable inside the hose package** + **new flat tarpaulin / hose bag (`Flachplane`)** |
| **`Mastschlauchpaket` / Mast hose package complete** | **from the base-carrier bulkhead plate to the KDK bulkhead plate** | all hoses base carrier → KDK bulkhead, **electric cable in the package**, new flat tarpaulins |

**★ So the correct routing is a four-stage chain, not loose tubes:**
**base carrier → BULKHEAD PLATE (a flat steel plate with a row of couplings) →
one FLAT, STRAPPED, TARPAULIN-WRAPPED BUNDLE up the mast → a HOSE DEFLECTION
(a large drum/sheave that takes up slack as the drive travels) → a SECOND
BULKHEAD PLATE on the KDK → short jumper hoses to the motors.**

**What the p.2 photograph shows (mast folded flat on a low-loader):**

- The mast is a **plain box-section beam** — flat top face, plate sides, with a
  **smooth machined rail band** running its full length for the carriage. **Not
  lattice.**
- The hose bundle runs **along the side/underside of the mast as a flat ribbon**,
  banded at intervals, not as separate free-hanging hoses.
- A **large flat black circular drum** is mounted on the end face of the masthead
  — the hose deflection reel. It is a big, plain, dark disc and it is one of the
  most recognisable objects on the mast.
- **U-shaped bright-steel grab/guard tube rails** project from the mast side at
  intervals along its length.
- A **light-grey valve manifold block** is bolted to the mast side.
- At the carrier end, **ten or more hoses fan out** from the flat package to the
  bulkhead — the fan only exists at the two ends; the middle is a tidy bundle.
- The masthead is a **fabricated bright-metal box** with a dense cluster of
  hoses, valve blocks and a red lifting eye beneath it.

