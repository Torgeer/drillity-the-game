# cfa-rig — CFA / cased-CFA fixed-mast (fixed-leader) piling rig

status: complete
subject: game rig id `cfa-rig` (builder: `src/rig/rigFactory.js` → `buildCFARig`)
compiled: 2026-09-04

> **NAMING RULE (DOMAIN.md §10):** everything below is GEOMETRY and MATERIALS reference only.
> Real manufacturer names and model designations (Bauer BG/MC, Liebherr LB/LRB, Casagrande B/C,
> Soilmec SR/SF, IMT AF, Junttan, EMDE, BWH/Betek …) must NOT appear as product names, badges,
> decals or spec-sheet text in the game. Model the shapes, invent the badge.

## Contents
1. [Sources read](#1-sources-read) — at the end, with what each actually showed
2. [What the machine IS](#2-what-the-machine-is--draft)
3. [Proportions](#3-proportions--draft-from-research-packs-primary-pdf-figures-below) + the dimensioned GA in **Primary Source 1**
4. [Component inventory](#4-component-inventory--draft-research-packs) + **Primary Sources 1–5**
5. [Distinctive features](#5-distinctive-features--the-thumbnail-test)
6. [Materials and paint](#6-materials-and-paint)
7. [Photo references](#7-photo-references)
8. [NOT SOURCED](#8-not-sourced)
9. [Domain-truth warnings](#9-domain-truth-warnings--what-the-game-currently-gets-wrong)

**The most important single source is Primary Source 1** — a fully dimensioned
side elevation of a CFA-configured rig, in the owner's own Downloads folder.

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


---

# PRIMARY SOURCE 4 — tooling material reference (photographs)
### `C:\Users\henri\Downloads\Atpa\` — a drilling-TOOL manufacturer's photo set, not a machine set

The whole `Atpa` folder (≈31 unique images) is workshop and product photography
from a tooling maker: casings, cutting shoes, auger sections, DTH bits, hex
couplings, welders, a factory exterior, a truck being loaded. **There is no
photograph of a CFA rig, or of any complete machine, in this folder.** It is
nonetheless the best local source for what the TOOLING is made of and coloured.

## `Atpa\BS_SW80.JPG` — a pallet of new auger sections. ★ Use this for auger material.

- **Flights AND central pipe are painted one uniform matt/satin dark blue-grey**
  — around RAL 7016 anthracite. **Not black, not bare silver, and the flight is
  not a different colour from the pipe.**
- Paint has a soft sheen: the curved flight surfaces catch a broad, low-contrast
  highlight rather than a specular hotspot.
- **The male square drive spigot is BARE BRIGHT MACHINED STEEL** (`SW 80` here),
  with a chamfered end and a through-hole for the locking pin. This is the
  single strongest material contrast on an auger — a bright silver stub against
  dark grey paint, at every joint.
- **Locking pins and bolts are bright zinc-plated** — small silver dots on the
  side of each coupling socket.
- Single-start flights, welded to the pipe; the outer edge of a new flight is a
  plain sheared plate edge with no armouring.
- A cutting head lies in front: dark-painted holders, **bright carbide picks**.

## `Atpa\Bohrkopf_für_VdW508.jpg` — a cased-CFA (VdW) Ø 508 casing cutting shoe

- The shoe is a heavy ring welded to a black casing tube and is **painted a
  bright glossy gold/ochre yellow** — a deliberate high-visibility colour against
  the near-black tube.
- Around the outer rim, **round-shank chisel bits in blocky weld-on holders**,
  angled outward and downward, roughly 8 visible on the circumference, with
  **bright polished carbide tips**.
- **Weld-on drive lugs** on the top face for the casing joint.
- The bore is stepped — an internal shoulder ring is clearly visible.
- The casing tube itself is **near-black with a wet-looking sheen** (fresh paint
  or oiled mill scale).

Other `Atpa` images (`IMG_20230414_132933`, `IMG_20240207_131749`, `Sw100.JPG`)
repeat the same story at other sizes: dark anthracite flights, bright machined
couplings, bright bolts. `atpa-de-slide-3/5/6/7/10/11`, `IMG_1979`,
`656646487_...jpg`, `ATPA-Aufkleber_v1.jpg` are **not useful** — building
exteriors, a curtain-side truck, a company sticker, a staff group photo.

---

# PRIMARY SOURCE 5 — uppercarriage / undercarriage detail
### `C:\Users\henri\Downloads\Rotary_Drilling_Rig_1000_0001.jpg`

A studio **3D render** (not a photograph) of a crawler rotary rig, near and far.
Treat proportions as indicative only — but it is a clean, unobstructed read of
the parts the catalogues never photograph:

- **Handrails wrap the entire upper deck**, including a full-width rail behind
  the counterweight, in bright unpainted steel tube with vertical stanchions and
  a mid-rail.
- **Engine housing in machine colour with long hinged access doors** down the
  side; a **contrasting-colour vertical ladder** on the housing side up to the
  deck.
- **Counterweight**: a dark slab across the full rear.
- **Undercarriage**: sprocket at the REAR (large, toothed), idler at the FRONT,
  roughly **7–8 bottom rollers** and **2 carrier rollers** on top; triple-grouser
  shoes.
- **The mast is box section with a regular pattern of large ROUND lightening
  holes** punched in the plate — matching the oval holes in the Sunward drawing.
- The mast is carried on a **heavy parallelogram / A-frame linkage** with very
  large pin joints, plus two diagonal cylinders.
- A **visible loop of hoses** hangs behind the mast foot.
- The rotary drive is a large **cylindrical drum with round lightening holes in
  its casing** and a toothed lower flange.


---

## 5. Distinctive features — the thumbnail test

Five things, in order of how far away they still read:

1. **ONE ENORMOUS SCREW, FULL MAST LENGTH, HANGING BESIDE THE MAST.** No other
   machine on a foundation site has this. From the Sunward p.25 elevation the
   auger runs from the drive head to the ground — at full extension it occupies
   more than half the machine's total height. `research/05` §C4: *"the machine's
   outline is dominated by a single enormous screw."* **No Kelly bar, no rod
   magazine, no carousel, no rod string, no flush hose.**
2. **A MAST TALLER THAN THE MACHINE IS LONG — by about 3:1.** 28.12 m of height
   over a 9.66 m working footprint (Sunward p.25). The silhouette is a thin
   vertical dominating a low, long, dark base.
3. **A CONCRETE HOSE, NOT A HYDRAULIC HOSE, ARRIVING AT THE TOP OF THE HEAD.**
   A single fat line snaking across the ground from a ground-standing concrete
   pump, up the mast, into a **horizontal 90° elbow on top of the rotary drive**
   (EMDE p.41 item 1). `research/05` §C4 calls it the CFA rig's signature and
   notes **no other foundation machine has it.**
4. **THE AUGER CLEANER, LOW DOWN, AT ~1.1 m ABOVE GROUND** (Sunward p.25). A
   small busy multi-arm mechanism swinging at the auger — the only moving thing
   near the ground, and the reason the machine throws spoil sideways.
5. **A SKIP OR A SPOIL CHUTE BESIDE THE HOLE, AND A CONCRETE PUMP AND TRUCK
   MIXERS BEHIND IT.** *"spoil… is deposited from the top of the casing into a
   series of telescopic tubes safely expelling it directly into a disposal
   vehicle, a skip or to a holding area"* `[WP-CFA]`, `[SB-CFA]` via
   `research/16` §B.9. The CFA rig is never alone: it is a machine plus a pump
   plus a skip.

**For the cased-CFA (CCFA) variant, add a sixth:** **two drive units stacked
coaxially on the mast, each with hydraulic motors projecting sideways, 300 mm of
axial lift between them** (EMDE p.45), and a **bolt-collared casing** standing at
the hole with the auger inside it.

---

## 6. Materials and paint

| Surface | Treatment | Source |
|---|---|---|
| Mast box section, uppercarriage bodywork, engine housing, cab shell, counterweight | **Painted steel**, satin/gloss, machine colour | Sunward p.25 elevation; `Rotary_Drilling_Rig_1000_0001.jpg`; hose-catalogue photo |
| **Auger flights AND central pipe** | **One uniform matt/satin dark blue-grey (≈ RAL 7016 anthracite)** — flight is NOT a different colour from the pipe | `Atpa\BS_SW80.JPG` |
| **Auger square drive spigots / couplings** | **Bare bright machined steel**, chamfered, with a through-hole | `Atpa\BS_SW80.JPG` |
| Locking pins, coupling bolts | **Bright zinc-plated** | `Atpa\BS_SW80.JPG` |
| Casing cutting shoe (cased CFA) | **Bright glossy gold/ochre** ring | `Atpa\Bohrkopf_für_VdW508.jpg` |
| Casing tube | **Near-black, wet sheen** | `Atpa\Bohrkopf_für_VdW508.jpg` |
| Round-shank picks / flat teeth | Dark painted holder, **bright polished carbide tip** | both Atpa images; EMDE p.65–71 |
| Handrails, stanchions, mast grab rails | **Bare / bright galvanised steel tube** — deliberately not machine colour | `Rotary_Drilling_Rig_1000_0001.jpg`; hose-catalogue photo |
| Ladder | Contrasting colour to the housing it is bolted to | `Rotary_Drilling_Rig_1000_0001.jpg` |
| Hydraulic hose bundle | **Matt black rubber**, banded, wrapped in a **flat tarpaulin (`Flachplane`) / hose bag** | hose catalogue p.2 |
| Cylinder rods | **Bright hard-chrome**, mirror | Sunward p.25 (mast cylinder rod drawn bright) |
| Cab glazing | Large flat panes, three sides + front roof window | Sunward p.25; render |
| Track shoes, sprocket, idler, rollers | **Bare steel**, no paint survives | render; standard |
| Concrete hose | **Thick black rubber with steel end couplings**; heavy, laid on the ground, kinked, not a tidy curve | inferred from EMDE p.41 `DN` flanged elbow + `research/05` §C4 — **shape NOT SOURCED photographically** |

### Where wear, dirt and rust actually accumulate on a working CFA rig

- **The auger flights** — spoil coats them along their entire length while
  drilling. This is the dirtiest object on the site and the dirt is *wet, sticky
  and the colour of the ground*, not dust. The flight **outer edge and the
  underside of each flight** polish to bright bare steel from soil abrasion; the
  upper (soil-carrying) face stays caked.
- **The starter / cutting head** — picks polish bright at the tips, the holders
  keep paint on their lee side only.
- **Everything within ~1.5 m of the ground at the mast foot**: the drilling-table
  box, the auger cleaner, the base of the mast, the lower mast rails. The cleaner
  throws spoil, so there is a **spray pattern radiating sideways from the mast
  foot** at low level.
- **The tracks and lower track frames** — encased in spoil and concrete splatter.
- **CONCRETE SPLATTER is the CFA-specific dirt.** Grey-white hardened splashes
  around the pile position, on the mast foot, on the lower auger, and on the
  concrete line's couplings. A Kelly rig does not have this.
- **Rope and sheaves** — the ropes go dark with grease and shed rust dust down
  the mast face beneath each sheave.
- **Cylinder rods** stay bright (they are wiped by their own seals) but the
  cylinder **barrels** collect a grimy film.
- **Handrails and step treads** polish bright where hands and boots land.
- The **cab windows** stay comparatively clean — the operator has to see the
  auger and there are wipers.

---

## 7. Photo references (files in `C:\Users\henri\Downloads`)

| File | Shows | Useful for |
|---|---|---|
| `SUNWARD_DRILLING-RIGS_S-SERIES_EN.pdf` **p.25** (also p.19, p.23, p.9 for other sizes) | **Fully dimensioned side elevation of a CFA-config rig, working state AND transport state** | ★ Everything: overall proportion, mast height, crowd stroke, track length, masthead, drive position, auger-cleaner height, the transport fold |
| `Bauer-Maschinen-Hydraulikschläuche-hydraulic hoses-DE-EN-905-213-1+2.pdf` **p.2** | Large photo of a folded mast on a low-loader | ★ Hose routing, bulkhead plates, hose-deflection drum, mast box section and rail band, mast grab rails, masthead detail |
| `2-2-EMDE-Katalog-Pfahlbohren.pdf` **p.41** | Exploded CFA string: concrete head + elbow, adapter, auger sections, starter, cap, seals | ★ What sits on top of the drive head; auger joint construction |
| `2-2-EMDE-Katalog-Pfahlbohren.pdf` **p.45** | Cased-CFA (VdW/FOW) system elevation, dimensioned | ★ Double-head geometry, casing/auger nesting diameters |
| `Atpa\BS_SW80.JPG` | Pallet of new auger sections | ★ Auger paint colour, sheen, bright-steel coupling contrast |
| `Atpa\Bohrkopf_für_VdW508.jpg` | Ø 508 cased-CFA casing cutting shoe, close-up | ★ Cutting-shoe colour, bit holders, carbide tips |
| `Atpa\IMG_20230414_132933.JPG`, `Atpa\IMG_20240207_131749.JPG`, `Atpa\Sw100.JPG` | More auger sections and flights at other diameters | Repeat confirmation of the same materials |
| `Atpa\IMG_20230414_094715.JPG` | Casing shoe with button inserts | Casing-toe alternative geometry |
| `Rotary_Drilling_Rig_1000_0001.jpg` | 3D render of a crawler rotary rig, two views | Uppercarriage handrails, ladder, engine doors, undercarriage roller/sprocket layout, mast lightening holes, drive drum. **A render, not a photo — do not take dimensions from it** |
| `geraetekatalog_catalog_of_machines_bauma_2025_bauer_maschinen.pdf` **p.6** | CCFA spec table + two thumbnail rig photos (too small to model from) | Torque / pull / depth numbers only |

**Files checked and NOT useful for this rig:** `atpa-de-slide-3/5/6/7/10/11.jpg`
(factory exterior, curtain-side truck, welding shots), `Atpa\IMG_1979.jpg`
(building), `Atpa\ATPA-Aufkleber_v1.jpg` (sticker), `Atpa\656646487_*.jpg`
(staff photo), `Atpa\Atpa products\*` (~30 WhatsApp images of loose tooling on
pallets — tooling only, no machine).

**Cross-check on stance, from a comparable-weight leader rig**
(`13915_Junttan_PM25H_Datasheet.pdf` p.2, 78 t — a *driven-piling* machine, not
this one): crawler length **5 700 mm**, width **3 380 → 4 880 mm** on
**800/900/1 000 mm** shoes, slewing ring **1 600 mm single row**, counterweight
**6 000 + 2 000 kg extendable**, engine **280 kW**. Almost identical undercarriage
proportions to the 73 t CFA rig above — so the stance figures are robust across
two independent manufacturers.

---

## 8. NOT SOURCED — could not find; do not invent

- **A photograph of a complete CFA rig actually drilling**, in any local file.
  Everything here is drawings, one folded-mast transport photo, one render, and
  tooling close-ups. **The single biggest gap.**
- **Mast cross-section dimensions** (box width × depth) for any rig in this
  class. The Sunward drawing is a side elevation only — no plan, no section.
- **The stand-off distance from the mast front face to the drill axis.** Known
  qualitatively (the auger clears the mast); the number is in no local file. For
  Kelly rigs `research/10` §D.5 quotes drill-axis distances of
  **1 300 / 1 550 mm, expandable to 1 700 / 2 000 mm** — **that is a Kelly figure
  and must not be silently reused for CFA.**
- **Carriage / rail geometry** — how the drive is guided on the mast (gib blocks?
  rollers? rail profile?). The hose photo shows a rail band; the section is not
  sourced.
- **The auger cleaner's actual mechanism and shape.** The Sunward elevation shows
  a star / multi-arm silhouette at 1 100 mm; `[TOM]` §3.3.1 and `[BAU-CAT]`
  describe a hydraulic **arm** adjustable across **400–2 000 mm** diameters.
  **Two sources imply two different devices (a rotating star vs a swinging arm)
  — both recorded, neither picked.**
- **Number, size and position of winches** on a CFA-configured machine
  specifically. `research/10` §D.5 says three or four on the big Kelly class;
  the Sunward elevation shows two ropes but the winch bodies are hidden.
- **The concrete delivery hose**: diameter, how it is supported up the mast,
  whether it runs in a guide or hangs free. Only the pump-end bore is sourced
  (`DN` at the elbow; stem bores of **100 / 120 / 127 / 125–200 mm**).
- **Cab interior**, screen layout, seat, joysticks. `[TOM]` §2.4.2 lists the
  *data* on the screen (depth, torque, rpm, penetration rate; then concrete
  pressure and flow) but nothing about the physical console.
- **Track shoe grouser profile and pitch**, roller count, sprocket tooth count —
  all read off a render, none dimensioned anywhere local.
- **Where the spoil chute / telescopic tubes physically mount.** Described in
  words `[WP-CFA]`, `[SB-CFA]`, `[BAU-CAT]`; no drawing found.
- **The concrete pump and truck mixers** that must stand beside the rig — no
  local source for their geometry at all.
- **Colour.** The game must not copy trade dress (`research/10` §D.11,
  `PLATFORM_TRUTH.md` Part C rule 4). Machine colour is a design decision from
  `DOMAIN.md` §8, **not a research finding.**
- `bwh-betek-katalog-spezialtiefbau-foundationdrilling-en.pdf` (22 MB) and
  `bauer-mat-lieferprogramm-product-range-de-en-10-25.pdf` were **not opened**
  — out of time. Both are worth a follow-up pass, the first for pick and tooth
  geometry.

### Where sources disagree (both recorded, nothing picked)

| Question | Source A | Source B |
|---|---|---|
| **Max CFA pile depth** | **26 m** `[JUN-PILE]`; **24.1 m** at Ø 1 000 CCFA (bauma catalogue p.6); **22 m** at Ø 1 000 (Sunward p.25) | **34 m** for long-stroke specials `[TOM]` §3.3.1; **24–34.5 m** (Soilmec SR-95); **50 m** published envelope `[BAUER-METHODS]` |
| **Max CFA pile diameter** | **1 180 / 1 200 mm** `[BAU-CFA]`, `[EMDE-PF]`, `[JUN-PILE]` | **up to 1.5 m exceptionally** `[TOM]` §2.4.2 |
| **Mast type** | Box section — Sunward p.25, hose-catalogue photo, and the render all agree | `research/05` §C3 says *"long lattice **or** box mast"* for the rotary family generally. **Lattice exists in the family; every CFA image found locally is box.** |

---

## 9. Domain-truth warnings — what the game currently gets wrong

Read from `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js`
(`buildCFARig`, from ~line 2882) and `src\rig\tools.js` (`cfa-flight`, from
~line 3284). **I own no source files and changed nothing.**

### A. Hard contradictions inside the game's own spec

1. **`mastH = 21.5` m but `maxDepthM: 24`.** The mast is SHORTER than the deepest
   pile it claims to drill. This breaks the one rule that defines the method:
   *"The mast height should exceed the pile length"* `[STRUCTVILLE-CFA]`, and
   *"the auger… extends over the full depth of the pile bore… in one pass"*
   `[FPS-PUWER3]` (`research/16` §B.9). Either the mast grows past 24 m or the
   depth drops below ~19 m. The real machine at this depth carries **28.12 m** of
   height for **22 m** of pile (Sunward p.25) — a **1.28 ratio**.
2. **The auger is built at `lengthMm: 14000` against `maxDepthM: 24`.** A 14 m
   auger cannot make a 24 m pile in one pass, and one pass is the method.
3. **The auger is built at `diameterMm: 600` against `maxDiaMm: 900`.** Harmless
   as a default, but the visible tool never reaches the advertised size.

### B. The mast is the wrong structure

4. **The game builds a LATTICE mast** (`buildLatticeMast` × 2, `bays: 8`,
   `chordR: 0.070`, `0.98 × 0.98` m). **Every CFA machine in the local material
   has a BOX-SECTION mast** — the Sunward p.25 elevation (plate column with oval
   lightening holes and a rail band), the Bauer hose-catalogue photograph (flat
   box beam with a machined rail band), and the `Rotary_Drilling_Rig` render
   (plate mast with round lightening holes). A lattice mast reads as a
   *crawler-crane / duty-cycle* machine — the trench-cutter and grab class
   (`research/10` §D.9) — and it is the wrong visual language for this rig.
5. **The drill axis is coincident with the mast centreline** (carriage, KDK and
   `augerNode` all sit at local x = 0, z = 0 inside a 0.98 m mast). On the real
   machine **the auger hangs FORWARD of the mast front face** — Sunward p.25
   shows clear air between the auger and the mast over its whole length. A Ø 900
   auger cannot be concentric with a 0.98 m mast; it would pass through it.

### C. The concrete system — the machine's signature — is the weakest part

6. **The concrete swivel is a plain vertical cylinder** (`G.cyl(0.16, 0.16,
   0.45)` at `[0, 1.35, 0]`). EMDE p.41 item 1 shows the real object: a **squat
   flanged drum with a 90° elbow (`Rohrbogen`) that turns HORIZONTAL** and ends
   in a flanged `DN` coupling. The elbow is the recognisable shape.
7. **The concrete line stops in mid-air at ~3.6 m** (`cline` ends at
   `[0.5, 3.6, -0.7]`). In reality it runs **from a ground-standing concrete
   pump, across the ground, and up the mast** — `research/05` §C4: *"a concrete
   hose running from a concrete pump on the ground, up the mast, to a swivel on
   the rotary head… no other foundation machine has it."* **A CFA rig with no
   visible concrete pump and no ground-run hose does not read as a CFA rig.**
   Neither the pump nor a spoil skip exists in the scene.

### D. Hydraulic hoses

8. **Three loose free-hanging hoses ending at y ≈ 4.8 m.** The manufacturer's own
   hose catalogue (p.2) gives the real architecture: **six main lines to the
   KDK**, running **base carrier → bulkhead plate → one flat, banded,
   tarpaulin-wrapped bundle up the full mast → a hose-deflection drum at the head
   → a second bulkhead plate on the KDK**, with the **electric cable inside the
   same package**. Three loose tubes stopping a fifth of the way up the mast is
   the wrong count, the wrong form and the wrong terminus. **The big flat black
   hose-deflection drum at the masthead is missing entirely** and is one of the
   most recognisable objects on the machine.

### E. Stance and the undercarriage

9. **The track stance is far too narrow for the weight.** Game: `gauge 1.75` +
   `trackWidth 0.85` → **2.60 m over tracks** on a **92 t** machine, with
   `trackLen 5.2`. Real machines of 73 t and 78 t sit on **3.0–4.5 m** and
   **3.38–4.88 m** over tracks, on track frames of **5.755 m** and **5.700 m**
   (Sunward p.25; Junttan PM25H p.2). **The game's rig is roughly a metre too
   narrow and would look tippy to anyone who has stood next to one.**
10. **The undercarriage does not telescope.** Widening for work and narrowing to
    a legal transport width is a defining, visible feature of this class
    (`research/10` §D.3, §D.5; Sunward p.25: retractable width 3 000–4 500,
    transport width 3 000). It is also a good gameplay beat.
11. **The uppercarriage body (`bodyW: 3.05`) is wider than the whole
    undercarriage (2.60).** On the real machine the body sits within or over a
    wider track span.

### F. Proportion

12. **Height-to-track-length ratio.** Game: mast 21.5 m over 5.2 m of track ≈
    **4.1 : 1**. Real: 28.12 m over 5.755 m ≈ **4.9 : 1** (Sunward p.25). The
    game's machine is **stubby** for its class. Fixing warning #1 fixes this too.
13. **Mast fold.** `buildMastStack` gives a pivot, but the real kinematics are
    strongly asymmetric: **5° forward, 90° backward** (Sunward p.25 table) — it
    lies flat backwards over the machine for transport, reaching **17 945 mm**
    long × **3 615 mm** high, nearly double the working footprint. Worth
    modelling because it is a whole second silhouette.

### G. Numbers to sanity-check

14. `torqueKNm: 240` — **exactly right** for a heavy CCFA auger drive (bauma
    catalogue p.6: "Max. auger torque 240 kNm"). Keep it.
15. `powerKw: 354` at `weightKg: 92000` sits between the real data points — 73 t
    → **252 kW** (Sunward p.25), 78 t → **280 kW** (Junttan p.2), heavy CCFA →
    **597 kW** (bauma catalogue p.6). Plausible but on the low side; **both
    bounds recorded, neither picked.**
16. `crowdKn: 250 / pullKn: 320` vs real **270 kN crowd / 280 kN main winch**
    (Sunward p.25) and **1 060 kN combined crowd + main winch** on the heavy CCFA
    machine (bauma catalogue p.6). In range.
17. `frameRadius: 13.0` — the sourced CFA exclusion zone is **10 m** `[FPS-RZ]`
    (`research/16`). Not wrong, but 10 is the sourced number.

### H. What the game already gets RIGHT — do not "fix" these

- The **auger cleaner** exists, and at 1.35 m is close to the real 1 100 mm.
- The **auger hangs from the head over the working length**, driven — correct.
- **Walkway, handrails, ladder, counterweight slab** — all correct for the class
  (`research/10` §D.5).
- **`carriageRange` gives ≈ 14.9 m of travel on a 21.5 m mast (0.69).** The real
  ratio is **17.0 / 28.12 = 0.60**. Close, and correct in spirit: a CFA drive
  runs almost the whole mast, unlike a Kelly rig.
- The rig name **`Lindhorst CF-28 Continuum`** is invented — **correct per
  `DOMAIN.md` §10.** Keep it that way: **nothing in this document may become a
  badge, decal, livery or product name in the game.** Model the shapes; invent
  the badge.

---

## 1. Sources read

| File | Pages read | Useful? | What it actually showed |
|---|---|---|---|
| `src\rig\rigFactory.js` (`buildCFARig`) | ~2879–2986 | yes | The game's current model — see §9 |
| `src\rig\tools.js` (`cfa-flight`) | ~3284–3331 | yes | Auger geometry: stem, flight, wear edge, bolt ring, head with round-shank picks, sacrificial concrete cap on the tip. The cap matches EMDE p.41 item 4.3 — a genuinely good detail already present |
| `research/05-foundation-piling.md` | §A6, §A7, §C3, §C4 | ★ yes | The method, the ground envelope, the tooling table, and the "shape" paragraphs for the Kelly rig and the CFA rig |
| `research/10-oem-foundation.md` | §D.1–D.11 | ★ yes | Class-by-class silhouettes; §D.6 is a direct CFA-vs-Kelly comparison; §D.11 the colour rule |
| `research/16-site-archetypes.md` | §B.9, §B.10 | ★ yes | Where CFA can and cannot stand; the mast-height rule; the over-flighting failure mode; the 10 m red zone |
| `research/11`, `research/12`, `research/18` | grepped | no | 11 is anchor/geotech/HDD, 12 is rock tooling, 18 has no photo index. Nothing CFA-specific |
| **`SUNWARD_DRILLING-RIGS_S-SERIES_EN.pdf`** | index of 36 pp; read **p.25** in full, p.19 and the p.3–33 tables | ★★ yes | **The dimensioned CFA-configuration general arrangement.** The best source found anywhere locally |
| **`2-2-EMDE-Katalog-Pfahlbohren.pdf`** | index of 74 pp; read **p.41, p.45**; tables p.42–43, p.47–48 | ★★ yes | CFA string exploded assembly; cased-CFA (VdW/FOW) system elevation with nesting diameters |
| **`Bauer-Maschinen-Hydraulikschläuche…pdf`** | **p.2** of 2 | ★ yes | Hose-package architecture in the maker's own words, plus a folded-mast photograph |
| `geraetekatalog_…bauma_2025_bauer_maschinen.pdf` | text-searched all 29 pp; read **p.6** | partly | Only p.6 mentions CFA. Gives CCFA torque / pull / depth / power. **No dimensioned drawing anywhere in this catalogue** |
| `13915_Junttan_PM25H_Datasheet.pdf` | p.2 of 3 | partly | A *driven-piling leader rig*, not this machine — but an independent cross-check on undercarriage stance and counterweight |
| `Atpa\BS_SW80.JPG` | image | ★ yes | Auger paint, sheen, bright coupling contrast |
| `Atpa\Bohrkopf_für_VdW508.jpg` | image | ★ yes | Cased-CFA casing cutting shoe close-up |
| `Atpa\` (all 31 images, via contact sheet) | thumbnails | mostly no | Tooling and workshop only. **No machine photograph in the folder** |
| `Rotary_Drilling_Rig_1000_0001.jpg` | image | partly | A render. Good for deck and undercarriage detail, useless for dimensions |
| `2025_Productinfo_CFA_Anfaenger_EN.pdf` | 1 page, text | marginal | Confirms starter diameters and cutting geometries already captured in `research/05` §A6; nothing new geometrically |
| `bwh-betek-katalog-spezialtiefbau-foundationdrilling-en.pdf` | **NOT OPENED** | — | 22 MB wear-parts catalogue; out of time |
| `bauer-mat-lieferprogramm-product-range-de-en-10-25.pdf` | **NOT OPENED** | — | Out of time |
| `2-1-EMDE-Katalog-Ankerbohren.pdf`, `KLEMM_Lieferprogramm…`, `Comacchio-GEO-305…` | not opened | — | Different machine classes (anchor / micropile) |
