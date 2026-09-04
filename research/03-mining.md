# 03 — Mining drilling: surface and underground

Research brief for **Drillity I The Game**. Written for an implementer.
Companion to `DOMAIN.md` (§1 methods, §3 equipment tree, §4 threads),
`PLATFORM_TRUTH.md` (Part C accuracy rules), `GAMEDESIGN.md`, `DESIGN_EXPANSION.md`.

**Status of this file:** research only. Nothing under `src/` was touched.

---

## 0. How to read this file

### 0.1 Citation keys

Every factual claim below carries a key in square brackets. Anything I could not
source is marked `UNVERIFIED` and must not ship without being checked first
(`PLATFORM_TRUTH.md` Part C rule 6: *if in doubt, delete it*).

**Local files** (all in `C:\Users\henri\Downloads`):

| Key | File | What it is |
|---|---|---|
| `L-BETEK` | `bwh-betek-katalog-bergbau-mining-en.pdf` | BWH/BETEK **Mining** tungsten-carbide tool catalogue — round-shank cutter bits (roadheader / continuous-miner picks), radial bits, holders, extraction tools |
| `L-TH` | `top-hammer-drilling-tools-broshure-english.pdf` | Sandvik Construction **Top hammer drilling tools** product catalogue. Chapters: small hole / drifting and tunnelling / bench drilling / long hole drilling / shank adapters |
| `L-DTH` | `catalog_rocktool_english.pdf` | DTH hammer + DTH bit catalogue (Hyundai Everdigm "Rocky" range) — shank designations, hole-size ranges, working pressures |
| `L-ROT` | `Rotary_Drill_Bits_2025_A4_E-version.pdf` | Mincon XP+ **rotary tricone blasthole bit** catalogue 2025 — sizes, IADC codes, insert shapes, UCS bands |
| `L-PARAM` | `Epiroc Guide to Drilling Parameters.pdf` | Drillers' guide to ROP / RPM / water flow / WOB — the three sliders, from the industry's own mouth |
| `L-EPIDTH` | `9866 0401 01 Epiroc DTH drill bits brochure_A4 webb.pdf` | DTH bit shank sizes and face geometries |
| `L-TAX` | `Drillity_Taxonomy_v5.3.pdf` | The iMarket taxonomy — confirms which shop nodes exist for mining |

**Web sources** — full URLs listed in §I.

### 0.2 Hard constraints carried from the project docs

- **No real model designations as game content.** Several sources below are named
  manufacturer documents. They are cited for traceability. The rig and tool
  *names* in them (`DD211L-V`, `GT60`, `XP+`, `DU431`, `Alimak`, `Swellex`,
  `Split Set`) are **source material, never product names in the game.**
  Evoke, never copy — `DOMAIN.md` §6.
- **Units:** MPa for UCS · mm for diameters · m/h for ROP · bar for pressure ·
  kN for force · Nm for torque · kg/m³ for powder factor · EUR for money.
- **Thread families never mix** — `DOMAIN.md` §4 and `DESIGN_EXPANSION.md` §4.
  Mining adds no exception to this: a percussion thread is a percussion thread.

### 0.3 The one sentence that should govern the whole mining vertical

Mining drilling is **not one activity**. It is seven, each with its own rig, its
own tooling, its own crew and its own scoreboard. Only one of them (grade
control) is scored on metres. The rest are scored on **accuracy, quality or
cycle time** — never raw speed. Building mining as "top hammer but underground"
would be the single most visible authenticity failure in the game.

---

## A. The distinct methods

---

### A.1 Surface blasthole drilling — bench drilling in an open pit or quarry

**The job.** Drill a pattern of vertical or near-vertical holes in a bench, so
that when they are charged and fired the bench breaks to the designed profile
with the designed fragment size. The driller is drilling a *pattern*, not a
hole. The blast is the customer.

#### Geometry — what the pattern actually is

| Term | Definition | Rule of thumb |
|---|---|---|
| **Bench height (H)** | Vertical face height being blasted | **CORRECTED 2026-09-04.** This read *"typically 1.5–4.0 × burden"* cited to [W-OSMRE] Module 3. **It is not in Module 3.** The 1.5–4.0 × burden ratio is USBR Chapter 19's **hole-depth**-to-burden rule — a different quantity, since hole depth = bench height **+ sub-drill**. Use bench height from the real cases below (8–15 m) rather than a ratio. |
| **Burden (B)** | Distance from a hole to the nearest free face | `B = K_B × D` where D = hole diameter; **K_B ≈ 25 for surface**, **≈ 20 underground**, for standard ANFO in rock ~2.5 g/cm³ [W-PSU-831] |
| **Spacing (S)** | Distance between holes in a row | `S = K_S × B`, **K_S = 1 to 1.3** [W-PSU-831]. For simultaneously-fired holes in one row, 1.8–2.0 × B is a common starting point; for sequential V or box-cut firing, 1.0–1.2 × B [W-OSMRE, via search summary — verify] |
| **Stemming (T)** | Inert collar fill that confines the charge | `T = K_T × B`, **K_T = 0.7** [W-PSU-831] |
| **Sub-drill (J)** | Extra hole below grade so the floor breaks flat | **WITHDRAWN 2026-09-04 — NOT IN THE CITED SOURCE.** The table (0.0–0.1 × B … 0.5 × B) attributed to [W-OSMRE] Module 3 **does not appear in Module 3 at all.** Sourced field values from the cases below: **1.5 m** sub-drill on a 12 m bench (Kevitsa) and on a 15 m bench (Aitik). Spacing, stemming and K_B ≈ 25 in this table were re-checked and **do** verify verbatim. |
| **Charged length** | Typically ~70 % of hole length; stemming takes the rest [W-PSU-831] |
| **Powder factor** | `PF = (M_c × L_c) / (B × S × L)` — charge per metre × charged length, over the rock volume the hole is responsible for [W-PSU-831] |

**Hole diameter.** Bench blasting ranges roughly **75–380 mm (3"–15")**; the
small end is underground work, the middle-to-large end is surface [W-PSU-831].
A screening rule quoted in the surface-blast literature: hole diameter should
not exceed **0.016 × bench height** [W-OSMRE, via search summary — verify].

**Why sub-drill matters and what happens without it.** Sub-drilling gives an
even floor, which is what lets loaders and trucks work the bench without
bogging or damaging tyres [W-PSU-83]. Too little sub-drill leaves **toe** — a
hard ridge at the base of the face that has to be secondary-blasted or ripped.
Too much sub-drill wastes explosive, over-breaks the crest of the bench below,
and damages the rock the *next* bench has to stand on.

#### Method choice: top hammer vs DTH vs rotary

This is the fork the player should feel, and it maps onto three genuinely
different rig silhouettes.

| | **Top hammer** | **DTH** | **Rotary blasthole** |
|---|---|---|---|
| Where the energy is made | Hydraulic drifter **on the mast**; blow travels down the rods | Piston hammer **at the bit**, driven by compressed air | No percussion — **weight + rotation** grinds the rock |
| Practical hole diameter | up to ~**127 mm**; some systems to 152 mm [W-MINDRILL, via search summary; `L-TH` shows threaded button bits Ø28–152 mm and a Ø60 mm rod system "optimised for Ø92–152 mm holes"] | ~**85–254 mm** in normal pit work, up to 978 mm with the largest hammers [`L-DTH`] | typically **>200 mm**; the tricone catalogue runs **7 7/8"–13 3/4" (200–349 mm)** [W-MINDRILL via summary; `L-ROT`] |
| Practical depth | **<20 m** typically; energy is lost at every coupling [W-MINDRILL via summary] | Deep — energy at the bit does not fade with depth [W-FRD] | Deep, limited by pulldown and mast |
| Best rock | soft → medium-hard | hard, abrasive, deep | soft → medium; big-tonnage pits |
| Failure mode the player should learn | **coupling losses** and rod-string bending → deviation | **stall** — too much feed and the hammer stops cycling | **bearing / shirttail wear** on the tricone |

Field comparison worth stealing for a tooltip: on the same granite bench, a
top-hammer rig drilling 20 m holes at 15° with an Ø87 mm pilot tube, 4.3 m rods
and Ø115 mm ballistic Retrac bits burned **42 l/h** of fuel against **78 l/h**
for a high-pressure DTH rig doing the same holes [`L-TH`]. Top hammer is the
cheaper metre until the hole gets deep or the rock gets hard; then DTH takes
over. *(This is exactly the trade the existing `FACTS` list already teaches for
DTH vs top hammer — mining is where it becomes a money decision, not a flavour
line.)*

#### Why hole straightness matters for the blast

This is the heart of it and it must be the surface-bench KPI.

- The blast design assumes each hole's **toe** is where the pattern says it is.
  Deviation moves the toe, so the real burden at the bottom of the hole is not
  the designed burden.
- Too-small real burden → the charge blows out at the face: **flyrock**,
  airblast, wasted energy.
- Too-large real burden → the toe does not break: **toe, oversize, hard
  digging**, and a bench floor the loader cannot clean.
- Stiffer strings deviate less. A drill string with male-female (MF) rods has
  **~50 % less thread play** than one using separate coupling sleeves, and the
  catalogue explicitly ties that to *"improved hole straightness"*, *"better
  blasting results in terms of controlled rock fragmentation and reduced risk
  for fly rock, back break and ground vibrations"* [`L-TH`].
- Bigger rod cross-section does the same job: a Ø60 mm rod has **40 % more
  cross-section and 65 % higher bending stiffness** than a Ø51 mm rod [`L-TH`].
- Guide tubes are sold specifically for this: Ø46 mm guide tube for Ø51–64 mm
  bits, Ø63 mm for Ø76–89 mm bits, Ø76 mm for Ø89–102 mm bits [`L-TH`].

**Crew KPI:** *holes drilled to the designed collar position, angle, azimuth and
depth* — measured by the surveyor and by how the shot performs. Metres per shift
is the contractor's number; **pattern conformance is the mine's number.**

---

### A.2 Underground production drilling — longhole / long-hole open stoping

**The job.** From a **drill drive** (a small tunnel driven along or above the
orebody), drill **rings** or **fans** of long holes out into the ore. Charge
them, fire them ring by ring, and the ore falls into the stope and is mucked
from a draw point below. The drill never sees the rock it is breaking.

#### The geometry

- Holes are drilled as a **ring** (a fan of holes in one vertical plane,
  radiating from the drill drive) or as **parallel longholes**. Successive rings
  are drilled at a fixed **ring spacing** along the drive; the distance the ring
  has to break is the **ring burden**.
- Holes can be **downholes** (drilled down from an upper drill drive) or
  **upholes** (drilled up from a lower drive). This changes everything about
  charging — see A.7.
- A **slot raise** is opened first at one end of the stope to give the first
  ring a free face to break to. Without a slot, the first ring has nowhere to go
  and freezes. (Slot raises are made by drop-raising, by raise boring, or by a
  long-hole burn cut — see A.5.)
- Ring blasting is the standard final-excavation method in longhole stoping, and
  it is chosen because large-diameter holes let you move a lot of tonnes fast
  [W-SPRINGER].

#### Hole diameter and length

- **Top-hammer longhole:** the underground long-hole chapter of the tool
  catalogue runs **R32, T35, T38, T45, T51** thread systems plus **T45, ST58
  (2¼"), ST68 (2¾") tube drilling tools**, with bits from **Ø51 mm up to Ø127 mm**
  [`L-TH`]. Rods for longhole are short — **915 / 1220 / 1525 / 1830 mm
  (3'/4'/5'/6')** — because the drill drive is small and there is no room for a
  long feed [`L-TH`]. This is a real, visible difference from bench drilling,
  where rods are 3050–6095 mm [`L-TH`].
- **ITH (in-the-hole) production drilling:** a DTH hammer taken underground. An
  articulated ITH production rig class is specified for **Ø89–216 mm holes up
  to 100 m long, using 3"–8" ITH hammers** [W-SANDVIK-DU431, via search
  summary — verify the exact figures before shipping any number]. This is the
  big-hole end of production drilling.
- Fan rings of **Ø165 mm holes, 20–30 m long, charged with 2 m explosive
  columns at the toe** appear as a worked example in the ring-blasting patent
  literature [W-RING-PATENT, via search summary].
- Long-hole **raises** (drilled from the bottom) use smaller holes, **50–89 mm
  (2–3½")**, with a burn cut for relief, and single blasts up to **12.2 m
  (40 ft)** have been advanced [W-REVEY].

#### Why deviation is the enemy — and it is a different enemy than on the bench

On a bench you can see the collar and the face. In a stope you can see neither.
A hole that wanders:

- **misses the ore** → you blast waste into the muck: **dilution**;
- **leaves ore standing** → **ore loss**;
- **bunches with the next hole** → over-break, or worse, the charge in one hole
  is close enough to the next to dead-press it;
- **spreads from the next hole** → the ring does not break: a **frozen stope**,
  which is one of the most expensive things that can happen to an underground
  mine.

For longhole stoping over **25 m**, a deviation exceeding **2 %** is reported to
cause poor fragmentation, dilution or frozen stopes [W-AIVYTER, via search
summary]. The tool catalogue puts it bluntly at the head of its long-hole
chapter: *"dilution is primarily caused by deviation"* [`L-TH`].

**Crew KPI:** **hole accuracy** — collar position, dip, azimuth and *depth* of
every hole in the ring, plus **holes available to the charge crew** (a hole that
has collapsed or is blocked is a hole that did not get drilled). Metres are
almost irrelevant. A ring is only finished when every hole in it is open,
correct and surveyed.

---

### A.3 Development face drilling — the jumbo drilling the round

**The job.** Advance a heading (a drive, a decline, a crosscut, an access) by
drilling a **round** in the face, charging it, firing it, mucking it, supporting
it, and doing it again. This is a *cycle*, not a continuous process — and the
cycle, not the drilling, is what the crew is judged on.

**How it differs from tunnelling.** Technically the drill-and-blast round is the
same. In a mine, four things differ:

1. **Round length is shorter and the heading is smaller.** Typical mine
   headings are a few metres square; civil tunnels are tens of square metres.
   Powder factor is inversely proportional to face area, so small mine headings
   burn a lot more explosive per cubic metre than a big tunnel does — see the
   table below [W-REVEY].
2. **The heading is temporary.** A civil tunnel is the product and gets a final
   lining. A mine drive is infrastructure with a design life; ground support is
   sized for that life, not for a hundred years.
3. **Grade follows you.** A development heading in ore is producing revenue as
   it advances; a heading in waste is pure cost. The mine geologist marks the
   face.
4. **The jumbo often also bolts.** Combination rigs drill both the round and the
   support holes, so the same machine appears in two different gameplay modes
   [W-SANDVIK-DD211L].

#### The round, hole by hole

A heading round is not one blast — it is **four interacting mini-blasts**:
a **cut** blast, a **slash** blast, a **perimeter** blast and a **lifter**
blast [W-REVEY]. Hole names, which the game should use verbatim:

- **Cut holes** — the tightly-grouped holes at the centre that open the round.
- **Relief / void holes** — uncharged, usually larger holes in the cut that give
  the broken rock somewhere to swell into.
- **Stoping / easer holes** — the bulk of the face, breaking to the cut.
- **Knee holes** — the low corners.
- **Rib holes** — the walls.
- **Back / arch holes** — the roof perimeter.
- **Lifters** — the bottom row, heavily loaded, whose job is to heave the muck
  out for the loader.

[W-REVEY, figure "Perimeter Hole Layout"]

#### Cut types

- **Burn cut / parallel-hole cut** — all holes parallel, one or more large
  uncharged relief holes. Now near-universal in tunnel contracting [W-REVEY].
  Advantages: round depth does not depend on how much room you have to swing the
  boom; deep pulls even in tough rock; simple to drill; less throw and better
  fragmentation; higher muckpile (a better platform for scaling and bolting);
  round length is trivially adjustable [W-REVEY]. Disadvantages: needs a bigger
  or reamed relief hole; higher powder factor; **drilling must be accurate or it
  fails** [W-REVEY]. The trend toward parallel-hole cuts came directly from the
  arrival of multi-boom hydraulic jumbos [W-NATURE].
- **V-cut / wedge cut and swing cut** — angled holes. Advance is limited by the
  physical width of the heading and the angle of the cut, so these give **less
  advance** than a burn cut [W-REVEY].

#### Numbers

| Parameter | Value | Source |
|---|---|---|
| Hand-held drills (small headings, raises, shafts) | **32–41 mm** holes | [W-REVEY] |
| Mechanised jumbo | **41–51 mm** holes | [W-REVEY] |
| Loaded holes / relief holes in a typical drift round | ~**51 mm (2")** loaded, occasionally **102 mm (4")** unloaded relief | [W-PSU-832] |
| Drifter rod lengths (hex 25 shank, R32 top thread) | **1870 / 2175 / 2475 / 2630 / 2785 / 2935 / 3090 / 3340 / 3700 mm** | [`L-TH`] |
| Drifting/tunnelling bit threads and sizes | R25, R28, R32, R35 bit thread; bits **Ø33–48 mm** in the R25 range | [`L-TH`] |
| Round design target | most operators settle on a depth that **consistently breaks 95 % of the hole** — drilling deeper than that is waste | [W-REVEY] |
| Burn-cut over-drill | over-drill cut holes by **15–30 cm (6–12")** so bootleg in the burn does not cost the whole face its advance | [W-REVEY] |
| Relief-hole area, rounds over 8 ft | at least **25 %** of the immediate cut area | [W-REVEY] |
| Void space in the cut, any rock type | keep above **15 %** | [W-REVEY] |
| Minimum separation, separately-delayed loaded holes in soft/seamy rock | **≥ 30 cm (12")** | [W-REVEY] |
| Cut delay intervals | **50 ms** (short-period) or **100 ms** hole-to-hole in hard rock to speed the cut; long-period elsewhere | [W-REVEY] |
| Smoothwall / perimeter hole spacing | **45–60 cm (18–24")**; smoothwall **burden : spacing = 1.5 to 2** | [W-REVEY] |
| Perimeter "look-out" | perimeter hole toes are aimed **outside** the design line, by just enough for the drill head to fit at the collar. Parallel perimeter drilling cannot maintain cross-section | [W-REVEY] |
| Cycle example | a twin-boom unit drilling **45 holes × 4 m in a 24 m² face** in **2.2–2.8 h** including tramming and setup | [W-AIVYTER-JUMBO, via search summary] |

#### Powder factor by face area — heading rounds

Small headings burn far more explosive per m³ than big ones, because the heavily
loaded cut is a large fraction of a small face [W-REVEY]:

| Face area (m²) | Powder factor (kg/m³) |
|---|---|
| 3.7 | 3.3 – 7.0 |
| 5.6 | 2.7 – 5.7 |
| 7.4 | 2.0 – 4.4 |
| 9.3 | 1.5 – 3.1 |
| 18.6 | 1.2 – 2.6 |
| 27.9 | 1.0 – 2.1 |
| 37.2 | 0.8 – 1.8 |
| 46.4 | 0.8 – 1.6 |

[W-REVEY, "Heading Round Powder Factor Range Table"]

Note for comparison: side-slash rounds in a highway tunnel ran **1.1 kg/m³**;
the same rock in floor-bench rounds needed **1.5 kg/m³**, because the charges
had to heave broken rock upward. It is normal practice to raise powder factor by
**35 % or more** when ground must be lifted [W-REVEY].

**Crew KPI:** **advance per round** (metres pulled ÷ metres drilled — the 95 %
target), **overbreak** against the design profile, and **cycle time**. Not
metres drilled.

---

### A.4 Ground support — bolting, cabling, mesh, shotcrete

**The job.** Stop the roof and walls falling on people and equipment. In a mine
this is a permanent, continuous, legally mandated activity, not an occasional
one. It is also where mining kills people, so the regulation is heavy.

#### The regulatory frame (cite this, do not paraphrase it loosely)

- **US, underground metal/nonmetal — 30 CFR § 57.3360 Ground support use:**
  *"Ground support shall be used where ground conditions, or mining experience
  in similar ground conditions in the mine, indicate that it is necessary. When
  ground support is necessary, the support system shall be designed, installed,
  and maintained to control the ground in places where persons work or travel…"*
  [W-CFR-573360]
- **30 CFR § 57.3200 Correction of hazardous conditions:** *"Ground conditions
  that create a hazard to persons shall be taken down or supported before other
  work or travel is permitted in the affected area."* Until corrected, the area
  must be posted against entry and, when unattended, barricaded [W-CFR-573200].
- **30 CFR § 57.3401 Examination of ground conditions:** designated experienced
  persons must examine and test ground **before work commences, after blasting,
  and as conditions warrant during the shift**. Underground haulageways and
  travelways, and surface highwalls and banks adjoining travelways, weekly or
  more often [W-CFR-573401].
- **Torque-tensioned bolts:** where rock bolts tensioned by torquing are used,
  installation tension should be at least **50 %** of the lesser of the bolt
  yield point or the anchorage capacity of the rock, and no greater than that
  value; the **first bolt, every tenth bolt, and the last bolt** installed in
  each work area during the shift must have its torque accurately determined
  immediately after installation, with corrective action if out of range
  [W-MSHA-TIP].
- **Bolt certification:** for bolts and accessories covered by ASTM F432, the
  operator must obtain and hold a manufacturer's certification of manufacture
  and test to that specification [W-MSHA-TIP].
- **UK — The Mines Regulations 2014, reg. 32 "Duty to take ground control
  measures":** the operator must keep secure every place where persons work or
  pass; must carry out a **recorded, reviewable risk assessment of ground
  movement before any excavation**; and must take sufficient control measures as
  soon as possible [W-UK-REG32].

#### The bolt families — genuinely different mechanics

**1. Mechanical point-anchor bolt.** An expansion shell at the far end of the
hole grips when the bolt is torqued. Anchorage is at **one point**. Fast, cheap,
tensionable — but it relies on competent rock at the anchor horizon, and it
loosens if the ground moves. This is the family the MSHA torque-testing rule
above is written for.

**2. Resin-grouted rebar.** Resin cartridges are pushed to the back of the hole,
the rebar is spun in through them, and the shattered cartridges mix and cure —
producing a **fully bonded** anchor along the resin column [W-EMJ]. Common in
North American mines; less used in Australia, where friction bolts dominate
[W-EMJ]. Taxonomy nodes exist for **Rock Bolts**, **Bolt Plates & Nuts** and
**Resin Cartridges** [`L-TAX`].
*Install quality is everything:* the wrong number of cartridges, too little
spin, spinning after the resin has gelled, or a hole that is too wide all give
you a bolt that looks installed and holds nothing.

**3. Friction bolts — the split-tube type.** A slotted steel tube of **larger**
diameter than the hole, hammered in with a percussion drill. The slot narrows,
the tube springs against the hole wall, and anchorage is **frictional along the
whole length** [W-TRM]. Real numbers, from a study of over 450 pull tests:

| Nominal OD | Bolt lengths | Steel capacity, average | Steel capacity, minimum |
|---|---|---|---|
| **33 mm** | 0.9 – 2.4 m | 10.9 t | 7.3 t |
| **39 mm** | 0.9 – 3.0 m | 12.7 t | 9.1 t |
| **46 mm** | 0.9 – 3.6 m | 16.3 t | 13.6 t |

[W-ROCSCIENCE]

Facts about them that make excellent gameplay:

- The hole must be **slightly smaller than the bolt** — 1.3" bit for a 33 mm
  bolt, 1.5" bit for a 39 mm bolt [W-ROCSCIENCE].
- **Pull-out strength falls as bit size rises.** Across all 39 mm test results
  the five common bit sizes were **1.35, 1.375, 1.438, 1.5 and 1.538 in**, and
  the trend is monotonic: bigger bit → weaker bolt [W-ROCSCIENCE].
- **Competent rock is the most sensitive to bit size**, because there is almost
  no overbreak, so the hole really is the bit diameter [W-ROCSCIENCE].
- The hole must be **at least two inches longer than the bolt** [W-ROCSCIENCE].
- **CORRECTED 2026-09-04 — this said the opposite of its own source.**
  It read *"Crooked or curved holes reduce capacity"*. [W-ROCSCIENCE] states,
  verbatim: *"Crooked or rough holes **do not adversely affect** the performance
  of a Split Set, but rather they **increase the anchorage and hence the
  pull-out strength**."* A friction bolt anchors by radial spring force against
  the wall, so irregularity adds interference. Only the depth half of the
  original claim survives: the hole must be at least 50 mm deeper than the bolt.
  **This finding is about Split Sets specifically.** Do not generalise it to a
  resin-grouted rebar bolt, where a varying annulus plausibly does affect
  mixing and encapsulation — that is untested here and unsourced.
- Anchorage can be judged in the field two ways: by **drive time** (there is a
  direct relationship between how long the bolt takes to drive and its immediate
  capacity), and by **shining a light down the tube and looking at slot
  closure** — a slot closed by 1/16 in means full rock-to-metal contact; a slot
  the same width as before installation means the hole was too big and the bolt
  has **zero or near-zero anchorage** [W-ROCSCIENCE].
- Strength develops **per metre of bolt**, so pull-out is normally reported as
  tons/ft or kN/m, not as a single number. In laminated rock, **0.8–1.4 tons/ft**
  is common [W-ROCSCIENCE].

**4. Inflatable friction bolts (the folded-tube, water-pressure-inflated type).**
A folded steel tube pushed into an oversized hole and inflated with high-pressure
water so it conforms to the hole wall. Installs in seconds, works in a hole
whose diameter you cannot control precisely. Pull tests on these typically
measure the **breaking strength of the steel** rather than the bond, which is
why the friction-bolt literature above restricted itself to split tubes
[W-ROCSCIENCE].

**5. Cable bolts.** Steel strand, much longer than a rock bolt, grouted with
cement. Used at intersections, in wide openings, over stope backs and around
fractured zones — anywhere the unsupported span is too big for a 2.4 m bolt
[W-EMJ]. Cable bolts are grouted over their length to distribute load, and may
be tensioned [W-EMJ]. Taxonomy node: **Cable Bolts** [`L-TAX`].
> **GAP.** I could not source hard numbers (strand diameter, hole diameter,
> water:cement ratio, breather-tube vs grout-tube method, plated vs plain,
> bulbed strand capacity). See §H. Do **not** invent them.

**6. Soil nails.** In the taxonomy alongside rock bolts and cable bolts
[`L-TAX`], but in a mine these belong to portal, box-cut and surface-slope work
rather than underground development. Treat as a *surface / portal* item, not an
underground one.

**7. Surface support — mesh, plates, shotcrete.** Bolts hold the big blocks;
**mesh and shotcrete hold the small ones between the bolts**. Taxonomy nodes:
**Mesh & Screening**, **Support Plates**, **Grout & Resin Consumables**,
**Geotextiles** under *Mesh, Surface Support & Grout*, and **Shotcrete
Equipment** under *Grouting & Injection* [`L-TAX`].

**Crew KPI:** **install quality, not bolts per shift.** Specifically: hole
drilled to the right diameter and at least bolt-length + 50 mm deep; hole
straight; bolt fully seated; plate tight to the rock; torque inside the
specified range on the sampled bolts; pattern complete with no gaps. A bolter
operator who installs 60 bad bolts has done worse than one who installs 40 good
ones — and the regulation agrees with that (see the first-bolt / every-tenth /
last-bolt torque rule above).

---

### A.5 Raise boring — and its two cheaper cousins

#### A.5.1 Conventional raise boring (down-pilot, up-ream)

**The sequence** — this is the whole method and the game should show all three
stages [W-SANDVIK-RB]:

1. **Pilot.** From the upper level, a **roller bit with sealed bearings** drills
   a pilot hole downward on **hollow drill pipes 1.5 m long** with a high-torque
   international-standard thread. **Water flushing** goes down the string and up
   the annulus. A directional system can be used if the pilot must be steered.
2. **Break-through.** The pilot enters the lower level. The bit is removed.
3. **Ream.** A **reaming head** is bolted on and **rotated and pulled back
   upward** toward the machine. **The cuttings fall by gravity** into the lower
   chamber and are mucked with an LHD.

**Numbers** [W-SANDVIK-RB]:

- Reaming heads from **0.6 m to 6 m** diameter. Raises **up to 6 m diameter and
  up to 1000 m long are not uncommon**.
- Head types: **integral** (strongest, no transport restriction), **segmented**
  (base head + two removable segments, so it fits down a small cage and along a
  narrow drift, then bolts together at the collaring site), and **extendable**
  (base head + 4 or 6 segments, so one head builds several diameters).
- **Stem** (the shaft that follows the pilot hole) sizes **Ø228–381 mm
  (9"–15")**; head centre bores **Ø340 / 360 / 390 mm**.
- Cutter count scales with diameter: a **1060 mm** head takes **4** cutters; a
  **1829 mm** head takes **10**; a **2440 mm** head **14**; a **3094 mm** head
  **16**; a **5876 mm** head **32**.
- Head weight including stem, saddles and cutters: **~2.7 t at 1060 mm**, **~7.3 t
  at 2134 mm**, **~15 t at 3696 mm**, **~38 t at the largest**.
- All heads have a **flat cutting profile** for smooth rotation and low torque
  demand. Cutters sit in **saddles**, which are **bolted** and can be
  repositioned to change button-row spacing for different rock — only two cutter
  types are needed on any one head.
- Used for **ventilation shafts, ore passes, manways, penstocks** [W-SANDVIK-RB].

**Variants the game can also use** [W-SANDVIK-RB]:

- **Blind boring** — no upper access. A special head drills the pilot and reams
  simultaneously, **pushed and rotated upward**; cuttings fall out. Normal blind
  raise diameters **0.6–1.8 m**. The string is in **compression**, so
  large-diameter **stabilizers** are required.
- **Down boring** — reaming *downward* into a stope through a pre-drilled pilot,
  guided by a nosepiece. **0.6–1.8 m** fill-holes. Also compression, also needs
  stabilizers.
- **Horizontal boring** — pilot then ream sideways, **0.6–4.5 m**, with a
  **special cuttings-removal system** (scrapers) because gravity no longer
  mucks for you. Requires good rock stability.

**Crew KPI:** **pilot accuracy first** (a deviated pilot misses the lower level
entirely and the whole raise is scrap), then **cutter life and steady reaming
without stalling the head**. `DESIGN_EXPANSION.md` §1 already specifies the
two-stage `raise` profile mode; this section supplies the numbers for it.

#### A.5.2 Raise climbers

A rail-mounted work platform that climbs the raise wall, carrying miners and
equipment to the face, with a **shield that protects them from falls of ground**
[W-REVEY]. The raise is then advanced conventionally: drill the face from the
platform, retreat, blast, ventilate, return. Slower than raise boring, needs no
upper access, and works in ground a raise borer would struggle in.

**Safety context that should shape the game's tone here:** *"Of all the
development headings, raise blasting is considered the most dangerous. Many
serious accidents and fatalities caused by falls of ground have occurred in
raise work over the years"* [W-REVEY].

#### A.5.3 Drop raising

Blast the raise **downward** from the top so nobody ever stands under fresh
ground.

- **VCR / crater drop raising** — large-diameter vertical holes drilled from the
  upper level; spherical crater charges are placed at successive horizons and
  fired from the bottom up, dropping the muck away. Hole sizes **101–165 mm
  (4–6½")**. Very forgiving of moderate hole deviation. Leaves rough walls;
  needs top-loading access; must be fired as a series of small shots. A worked
  example: **320 lb per round, 7 ft advance, powder factor 15.7 lb/yd³**
  [W-REVEY].
- **Long-hole drop raising** — from the bottom, where that is the only access
  (e.g. removing a crown pillar). Burn cut for relief, holes **50–89 mm**, and
  the whole raise must be fired in a **single blast**, because it is unsafe to
  go back under it. Advances up to **12.2 m (40 ft)** in one blast are recorded;
  the achievable length depends on **drilling accuracy** and on how much swell
  room the burn cut provides [W-REVEY].

---

### A.6 Grade control drilling — RC on the pit floor

**The job.** Before the bench is drilled and blasted, find out **where the ore
is**, so the shovel and the trucks send the right rock to the mill and the wrong
rock to the waste dump. The output is not a hole; it is a **sample**, and then a
**dig line** painted on the bench.

**Two competing ways to get the sample:**

1. **Blasthole sampling** — sample the cuttings pile from the production
   blasthole you were drilling anyway. Nearly free. But its reputation in the
   sampling literature is poor: delimitation bias, extraction bias and weighting
   bias are structural, not accidental [W-AUSIMM-BH].
2. **Dedicated RC grade-control drilling** — a separate, purpose-drilled hole on
   its own pattern. Reverse circulation gives **lower sampling variability** than
   blasthole sampling, at significantly **higher cost** [W-TANDF]. At least one
   large open pit moved its in-pit grade control from blasthole to RC
   specifically to get more representative samples, to maximise ore recovery,
   minimise dilution and improve production forecasting [W-AUSIMM-RC].

**How RC works mechanically** (already specified in `DESIGN_EXPANSION.md` §2 and
consistent with the taxonomy node **RC / Dual-Wall Drill Pipe** [`L-TAX`]):
air travels **down the annulus** between the outer and inner tube of a dual-wall
pipe, and the sample returns **up the inner tube** to a cyclone and a splitter.
The sample is chips, not core. The failure mode is **contamination** — lose the
seal, or let the hole cave, and the assay is worthless even though the hole
looks perfect.

**Crew KPI:** **sample quality and sample integrity** — correct sample mass at
each interval, dry sample, no contamination between intervals, correct labelling
and no bag mix-ups. Metres drilled is the contractor's invoice; the mine pays
for the *assay it can trust*.

**Do not conflate this with exploration drilling.** Grade control is *inside* a
known orebody, on a tight pattern, on a production timescale (this bench, this
week). Exploration RC/core is *looking for* an orebody. Same rig family, entirely
different objective and scoreboard.

---

### A.7 Blasting — what the charge-up crew and the shot firer actually do

Talent lists **Blaster / Shot Firer** as a job function [`DOMAIN.md` §7], so this
needs to be a real role with a real loop, not a cutscene.

#### The products

| Product | Character | Where it is used |
|---|---|---|
| **ANFO** | Ammonium nitrate prills + fuel oil. Dry, free-flowing, cheap. Delivered by **loose pour** or **pneumatic loading**; pneumatic loading makes it effective in underground development and tunnelling [W-DYNO]. Density used in worked examples: **0.98 g/cc** [W-REVEY] | Dry holes. Surface benches, dry development rounds |
| **Emulsion** | Water-in-oil. Water-resistant, higher energy than pure ANFO, **inert until sensitised**, which is a real safety gain over ANFO handling [W-FARMONAUT]. Cartridge emulsion density in a worked example: **1.12 g/cc** [W-REVEY] | Wet holes, and increasingly everything. Pumped emulsion has let some mines cut required drilling by as much as **30 %** versus cartridge products and pneumatic ANFO [W-REVEY] |
| **Cartridge / packaged explosive** | Sticks or chubs, tamped or untamped | Perimeter and buffer holes, priming, awkward geometry |
| **Primer / cast booster + detonator** | What starts the column | Every charged hole |
| **Detonating cord** | Core load in **g/m** or **grains/ft** [W-REVEY] | Trunklines, downlines |

#### Charge-weight arithmetic the game can literally implement

Load factor (mass of explosive per metre of hole) [W-REVEY]:

```
Load factor (kg/m) = CD² × d × 0.785 / 1000
    CD = charge diameter in mm   (for pumped emulsion or pneumatic ANFO,
                                   CD = the hole diameter)
    d  = explosive density in g/cc
```

Worked examples from the source: pneumatic ANFO, d = 0.98 g/cc, CD = 40 mm →
**1.23 kg/m**. Cartridge emulsion, d = 1.12 g/cc, tamped diameter 1.7 in →
**1.1 lb/ft** [W-REVEY].

Then `Charge weight = charge length × load factor`. Detonating cord:
`weight (kg) = core load (g/m) × length (m) / 1000` [W-REVEY].

**Note the tamping rule:** if a cartridge is tamped, use the **estimated tamped
diameter**, not the cartridge's nominal diameter [W-REVEY]. And: *"Never tamp
primer cartridge"* [W-REVEY, figure "Typical Tunnel Round Charges"].

#### Charge design by hole type (development round)

- **Smoothwall / trim charge (perimeter):** a **decoupled** charge — deliberately
  smaller in diameter than the hole — with a half-stick tamped emulsion primer
  cartridge and stemming. Lightly loaded so it shears the perimeter without
  damaging the rock behind it [W-REVEY].
- **Buffer charge (first row in from the perimeter):** untamped emulsion
  cartridges [W-REVEY].
- **Regular blasthole (48 mm / 1⅞"):** tamped emulsion cartridges + primer +
  stemming [W-REVEY].
- **Overloading perimeter and buffer holes damages rock beyond the perimeter,
  weakens the opening, and increases scaling and cycle time** [W-REVEY]. This is
  a superb scoring rule: over-charging is *punished*, not rewarded.

#### Timing

- Electronic detonators give **millisecond-precision timing and flexible
  sequencing**, and buy better fragmentation with less flyrock and lower ground
  vibration [W-FARMONAUT].
- Cut holes in hard rock often benefit from **faster** timing: **100 ms**
  hole-to-hole using intermediate delays, or **50 ms** with short-period
  detonators [W-REVEY].
- Elsewhere, **long-period delays** ensure each hole's rock has broken and been
  ejected before the next fires [W-REVEY].
- **Dead-pressing / pre-compression** is the failure mode specific to water-based
  emulsion and water-gel in tightly-spaced cut holes: the shock from the
  neighbouring hole compacts the explosive before it fires and it does not
  detonate properly. Fix by **spreading the loaded holes further apart**, not by
  adding more of them; and put open relief holes between loaded cut holes
  [W-REVEY].
- **Freezing the cut** is the other failure: too much energy compacts the broken
  rock in place instead of ejecting it. Fixes: keep holes parallel; more or
  larger relief holes; lower energy per metre in the cut; adjust geometry; angle
  "diamond" holes inward at the toe; control the sequence [W-REVEY].

#### The charging machines

Charging underground longholes by hand from a platform is the old way. The
modern way is a **charge-up rig**:

- ANFO units: stainless vessels of **275–909 kg**, enclosed cap-and-booster
  storage with static-preventing lamination, pneumatic valve control
  [W-IM-GETMAN].
- Emulsion units: deck space for tanks up to **4,450 litres**, integrating a
  third-party emulsion pump [W-IM-GETMAN].
- Automated hose handling — pushers, reels, guides — for safer standoff and less
  strain, especially in **upholes** [W-IM-GETMAN].
- Emulsion charging vehicles carry **FOPS-tested person-lifting basket booms**
  [W-NORMET].

**Upholes vs downholes matters here.** In a downhole, gravity is on your side and
the explosive stays where you put it; you need a plug or the charge falls to the
bottom. In an uphole, you are pushing product *up* against gravity, the hose has
to be pushed the full hole length, and the charge must be retained — which is
why the automated hose-pusher exists and why uphole rings take longer to charge
than downhole rings [W-IM-GETMAN].

#### What the shot firer does — the shift, in order

Reconstructed from the regulations, which is the only defensible way to write it:

1. **Check the holes.** *"Before loading, blastholes shall be checked and,
   wherever possible, cleared of obstructions"* — 30 CFR § 56.6301
   [W-CFR-566301]. A blocked hole is a hole that cannot be charged to design.
2. **Secure the blast site.** When explosives are brought to the site, it *"shall
   be attended; barricaded and posted with warning signs"* — 30 CFR § 56.6306(a)
   [W-CFR-566306].
3. **Keep the site clear.** During loading, only blast-related activities are
   permitted at the site (plus surveying, stemming, sampling and reopening holes
   with reasonable care) — § 56.6306(c) [W-CFR-566306].
4. **Load and fire continuously.** *"Loading and blasting shall be conducted in
   a manner designed to facilitate a continuous process, with the blast fired as
   soon as possible following the completion of loading."* If firing may be
   delayed more than **72 hours**, the operator must notify the MSHA district
   office — § 56.6306(d) [W-CFR-566306].
5. **Clear the blast area before hooking up.** Everyone leaves before connecting
   to a power source or attaching initiating devices, except persons in a
   blasting shelter — § 56.6306(e) [W-CFR-566306].
6. **Warn, guard, fire.** Ample warning, clear exit routes, all access routes
   guarded or barricaded — § 56.6306(f) [W-CFR-566306].
7. **Post-blast examination.** Work does not resume until a post-blast
   examination addressing blast-related hazards has been done by a person with
   the ability and experience — § 56.6306(g) [W-CFR-566306].
8. **Look for misfires.** *"Faces and muck piles shall be examined for misfires
   after each blasting operation."* Only work necessary to safely remove a
   misfire is permitted in the affected area until it is disposed of. If it
   cannot be safely disposed of, post warning signs at all visible entry points
   and notify management immediately. **Any misfire during a shift must be
   reported to management before the shift ends** — 30 CFR § 57.6311
   [W-CFR-576311].

Who is allowed to do this: *"Only persons trained and experienced in the handling
and use of explosive material shall direct blasting operations and related
activities. Trainees and inexperienced persons shall work only in the immediate
presence of [such] persons"* — 30 CFR § 56.6300 [W-CFR-566300].

**Crew KPI:** the **shot result** — fragmentation, muckpile shape and diggability,
floor condition, overbreak against the profile, no flyrock beyond the exclusion
zone, no misfires, and vibration/airblast inside limits.

---

## B. The professions

Talent already carries **Mining** as a specialisation and **Blaster / Shot
Firer** and **Heavy Machinery Operator** among its job functions
[`PLATFORM_TRUTH.md` Part B; `DOMAIN.md` §7]. Below is what those roles actually
are underground and on surface.

### B.1 Roster of roles

| Role | Where | What the shift looks like | Judged on |
|---|---|---|---|
| **Production driller (longhole / ITH operator)** | UG | Tram the rig to the drill drive, set up on the ring line, level and stabilise, drill each hole in the fan to its designed dip and length, add and pull rods, redrill blocked holes, mark up the ring | Ring completed, **all holes open and on design**, deviation |
| **Jumbo operator (development)** | UG | Tram to the face, scale-check, set up on the survey line, drill the round (cut, easers, perimeter, lifters), often drill the bolt holes too, wash the face, mark up for the charge crew | **Advance per round**, overbreak, cycle time |
| **Charge-up crew / charge hand** | UG | Check and clear holes, prime, load ANFO or emulsion, stem, hook up the initiation, tie in, retreat | Every hole charged to design, no dead-pressed cut, no misfires |
| **Shot firer / blaster** | UG + surface | Owns the blast: design conformance, site security, warning, firing, re-entry timing, post-blast examination, misfire management (see A.7) | The shot. And that nobody was in the blast area |
| **Bolter operator** | UG | Drill the bolt hole to the right diameter and depth, install resin/friction/mechanical bolt, plate it, tension it, sheet the mesh, repeat on the pattern | **Install quality**, pattern completeness, torque checks |
| **Cable bolter operator** | UG | Long holes (much longer than the drive is high, so the rig must handle the string in a confined space), install strand, grout, breather/grout tube management | Grout return, embedment length, no voids |
| **Raise bore operator** | UG | Set up and grout the machine down, drill the pilot on 1.5 m pipes with water flush, break through, change to the reamer, ream up, change cutters from below | **Pilot accuracy**, cutter life, no stall |
| **Surface blasthole driller** | Surface | Move on the pattern peg, collar, drill to depth + sub-drill, log the hole, move on. Dozens of holes a shift | Pattern conformance, hole quality, hole availability |
| **Grade control driller (RC)** | Surface | Drill the grade-control pattern, run the cyclone and splitter, bag and label every interval | **Sample quality and integrity** |
| **Shift boss / shift supervisor** | UG | Allocate the crew across headings and stopes, walk the workplaces, check ground and ventilation, keep the cycle moving, sign off re-entry | The whole shift's cycle |
| **Mine geologist** | Both | Mark the face, log the round, log RC/blasthole samples, draw the dig lines and ore boundaries, reconcile predicted vs delivered grade | Reconciliation |
| **Mine surveyor** | Both | Set the survey marks the jumbo and the production rig work to; paint control lines and offsets on the face for alignment and grade; pick up as-drilled and as-blasted | The mine going where the plan says |

On the surveyor: *"Mine surveyors paint control lines and offsets on heading
faces to provide references for tunnel alignment and grade. Accuracy of
hole-collar placement and drilling alignment will affect hole deviation and blast
results"* [W-REVEY]. In the UK, mines are legally required to **appoint a
surveyor** and submit working plans — The Mines Regulations 2014, Part 7
[W-UK-MINES2014].

### B.2 Crew structure

- **Development heading:** the classic unit is a **two-person crew per heading**
  (jumbo operator + offsider), with the charge-up crew and the bolter crew
  following through on the same heading on later parts of the cycle, and a
  **shift boss** covering several headings.
- **Production:** one operator per longhole rig; charge crews of two; the drill
  drive is usually being drilled while another drive is being charged and a third
  is being fired, so the mine runs several stopes at different stages at once.
- **Surface bench:** one operator per blasthole rig; a **drill-and-blast
  engineer** designs the pattern, a **surveyor** pegs it, and the **shot firer**
  owns the loaded pattern.

### B.3 Underground vs surface — the real differences

| | Underground | Surface |
|---|---|---|
| The rig | Low, wide, articulated (see §C) | Tall mast, tracked, big |
| Ventilation | Engineered and finite; blast fumes must clear before re-entry | Ambient |
| Ground | Overhead — it can fall on you | Beside you — highwall stability [30 CFR § 56.3130: mining methods must maintain wall, bank and slope stability where persons work or travel; bench width and height must be based on the equipment used for bench cleaning and scaling — W-CFR-563130] |
| Cycle | Drill → charge → fire → ventilate → muck → scale → support → repeat | Drill the pattern → charge → fire → load and haul |
| Blast timing | Fired at shift change, into an evacuated and ventilated mine | Fired at a scheduled window with an exclusion zone |
| Escape | Escapeways, refuge chambers, self-rescuers | Walk away |

### B.4 Tickets and statutory qualifications — heavily regulated, cite the regime

This is one of the strongest ties to the Talent model already in the game
(*expired = cannot mobilise*, `PLATFORM_TRUTH.md` Part B).

**United States (MSHA, 30 CFR Part 48).** A **new underground miner** must
receive **no less than 40 hours** of training before being assigned work duties,
of which about **8 hours** must be at the mine site in conditions simulating
actual underground work. The syllabus is prescribed and includes: statutory
rights; **self-rescue and respiratory devices, with hands-on donning practice**;
entry and exit procedures, transportation and communications; the work
environment and mining methods; mine maps, escapeways, emergency evacuation and
barricading; **roof/ground control and ventilation plans**; health control plans;
hazard recognition including explosives hazards; electrical hazards; first aid;
**mine gas detection and avoidance**; and the health and safety aspects of the
assigned task [W-CFR-485].

**Blasting, United States.** No separate federal blaster's licence for
metal/nonmetal — the requirement is competence: only trained and experienced
persons may direct blasting, and trainees work only in their immediate presence
[W-CFR-566300].

**Australia — Queensland.** A **shotfirer licence** is required to use, possess,
purchase, store or transport blasting explosives; it also covers transport of up
to **250 kg** without a separate transport licence. To get one you need: a
current **Queensland Explosives Security Clearance**, a **statement of
attainment** from a registered training organisation covering the approved units
of competency **dated within the past 5 years**, and a **medical certificate**
(within 6 months) plus a doctor's letter confirming you are physically able to
handle explosives in blasting activities. Licences run **1 year or 5 years**
[W-QLD-SHOTFIRER; W-QLD-COMPETENCY].

**Australia — Western Australia.** A **shotfiring licence** is required to blast
rock. Minimum age **18**; you must hold or have applied for a WA **dangerous
goods security card** or recognised security clearance; training must be
delivered by providers accredited for the national **RIIBLA** blasting units of
competency [W-WA-SHOTFIRING].

**United Kingdom.** The Mines Regulations 2014 require a **management structure**
(reg. 10) and **competence** (reg. 11), and the mine operator's rules must
include *"requirements relating to shotfiring operations; procedures for
appointing shotfirers; procedures for authorising other persons who will be
involved with the transport, storage, handling and use of explosives;
requirements relating to misfires;"* and, in places classified as hazardous under
DSEAR, *"requirements relating to testing for the presence of flammable gases
before any shot is fired"* — reg. 31 [W-UK-REG31]. Temporary underground
explosives storage places must be **suitable, capable of being made secure, and
at all times either secure or supervised** — reg. 30 [W-UK-REG30].

**Game rule this justifies:** a mining career track should gate on (a) a general
mine induction/new-miner training, (b) a **ground awareness / scaling**
competency for anyone working under unsupported ground, and (c) a **shotfirer
licence with a hard expiry** plus a **medical with a shorter expiry** — the
medical is the one that catches people out, because it is renewed on a different
clock than the licence. That is exactly the "expired = cannot mobilise" mechanic
the platform doc calls the single best game mechanic on the platform.

### B.5 Day rates

**Rule for this section: every figure below is in its source currency, sourced.
The EUR column is a conversion and the FX rate itself is `UNVERIFIED`. Do not
ship the EUR numbers until the rate is checked against a live source.**

Australian underground mining is the best-published market and is where day rates
(rather than salaries) are the norm:

| Level | Sourced figure | Source |
|---|---|---|
| New starter underground | **A$450–550 / day** | [W-UGTRAINING] |
| Working independently | **A$550–650 / day** | [W-UGTRAINING] |
| Experienced truck operator | **A$550–700 / day** | [W-UGTRAINING] |
| **Jumbo operator, shift supervisor, foreman** — the top earners underground | **A$1,000–2,500+ / day**, i.e. **A$180,000–350,000+ / year** depending on employer | [W-SYNERGIE] |
| Underground operator, average | **A$151,750 / year** | [W-GLASSDOOR-UGOP] |
| Underground mining, average | **A$165,707 / year ≈ A$87.21 / hour** | [W-JOOBLE] |
| Mining industry, all roles, median | **A$2,761 / week** (ABS, Aug 2025) — the highest-paid industry in Australia by median weekly earnings | [W-SEEK] |

Rosters that go with those rates: the higher-paying roles typically run **8:6 or
7:7**, and the highest rates are with contractors running a more demanding
**2:1** roster [W-SYNERGIE]. Those map onto the rotation patterns Talent already
models (`14/14`, `21/21`, `28/28`, `4/4`, `6/3`, ad-hoc, staff/residential)
[`DOMAIN.md` §7].

> **GAP — EUR day rates.** I could not source European (German / Nordic / Iberian)
> mining day rates: the salary aggregators returned HTTP 403 and my web-search
> budget was exhausted. See §H. Until sourced, express in-game mining pay as a
> **day rate band** derived from the Australian evidence with an explicit note
> that the currency is converted, or source EU figures separately.

### B.6 Career path

A defensible mining ladder for the game, built only on roles evidenced above:

```
Surface:   Offsider ─► Blasthole driller ─► Senior driller / trainer
                                        └─► Drill & blast technician ─► Shot firer
           Grade control driller (RC) ─────► Grade control / sampling supervisor

Underground: Nipper / offsider
               ├─► Bolter operator ────────────────┐
               ├─► Jumbo operator (development) ───┤
               ├─► Longhole / production driller ──┼─► Shift boss ─► Mine captain
               ├─► Charge hand ─► Shot firer ──────┘
               └─► Raise bore operator (specialist, lateral entry)

Technical spine (parallel, not above): mine geologist · mine surveyor ·
                                       drill & blast engineer · ground control engineer
```

The raise bore operator deserves calling out as a **specialist lateral**: it is
a small population, the machine is unlike anything else in the mine, and the
skill is process discipline over hours, not hand-eye speed.

---

## C. The machines — distinct silhouettes

The single most important modelling note, and it is not decoration:

> **Underground machines are low, wide and articulated because the tunnel is
> low, wide and has corners.** A development drive might be 4–5 m high and 4–5 m
> wide; a low-profile drive can be **2 m** [W-SANDVIK-DD211L]. A machine that has
> to tram kilometres through that, then turn a 90° intersection, cannot be tall
> and cannot be rigid. It is therefore: **long and flat**, **centre-articulated**
> (the whole machine bends in the middle rather than steering with the front
> wheels), with **oscillating axles** (so all four wheels stay on a broken
> floor), **big low-pressure tyres**, and **everything mounted low**. The
> operator sits **beside** the boom, not behind it, under a **canopy**, not in a
> tall cab.

### C.1 Surface

**C.1.1 Crawler top-hammer rig.**
Silhouette: tracked undercarriage; a boom carrying a **feed beam** (a rail) with
the **hydraulic drifter** sliding along it; the drifter is **on top**, hammering
down the rod string. A **rod carousel or magazine** on the side of the feed
swings rods in and out. A **dust collector hood** at the ground end of the feed
with a big flexible hose to a **cyclone/filter box** on the deck. Diesel engine
and a **screw compressor** in the body. Cabin at the rear, offset to see the hole
collar. Modelling cues: the feed is the visual signature — a long straight beam
that tilts and slews independently of the tracks; the machine can drill inclined
holes and looks *wrong* if the feed only ever points straight down.

**C.1.2 DTH surface rig.**
Same crawler family, but the compressor is the dominant component — DTH runs on
air, and the air does the work. Bigger air receiver, bigger cooler pack, more
radiator area. The feed is often longer, the pipes fatter (rigid drill pipe,
not slender rods), and the carousel carries fewer, heavier pipes. The **hammer
is down the hole and invisible** — which is a gift for the cross-section band,
where it should be the visible star.

**C.1.3 Rotary blasthole rig — the big pit one.**
A completely different silhouette and it should read as a different tier of
machine. A **tower/mast**, often 15 m+, standing on a large **crawler
platform**; three or four **hydraulic jacks** that level the whole machine off
its tracks before drilling; a **rotary head** that travels up and down the mast
on a **pulldown** chain or cable system; **drill pipe** carried in a rack on the
mast; a **deck** with an operator house on one corner; large **dust suppression**
or dust collector at the deck. It looks like a small building that walks. It
drills **7 7/8"–13 3/4" (200–349 mm)** holes [`L-ROT`], vertical or slightly
angled, on a bench, with **no percussion at all** — the sound is a grinding
rumble, not a hammer.

### C.2 Underground

**C.2.1 Twin-boom development jumbo.**
The archetypal mine machine. Concrete geometry from a published spec sheet for a
**single-boom low-profile** class (use as the small end of the family; twin-boom
machines are bigger) [W-SANDVIK-DD211L]:

| | |
|---|---|
| Designed for headroom as low as | **2 m** |
| Tramming height | **1,775 mm** low / **1,950 mm** high |
| Transport width | **2,260 mm** |
| Transport length | **10,375 mm** |
| Total weight | **13,600 kg** |
| Drift size class (H × W) | **2,000 × 3,040 mm** |
| Boom parallel coverage area | **16.3 m²** |
| Hole size | **38–51 mm** |
| Hole length | **2,132 mm**; rods 2,435 / 1,830 mm |
| Rock drill | **14 kW**, **140 bar** percussion pressure, **110 Hz** blow rate, max **530 rpm** rotation, **340 Nm** rotation torque |
| Feed force | max **31 kN** |
| Carrier | **frame-steered (centre-articulated), articulation ± 43°**, rear axle oscillation **± 15°**, ground clearance **300 mm**, four-wheel drive, four radial-piston wheel motors, hydrostatic |
| Tramming speed | **8.6 km/h** level, **4.3 km/h** on a 1:7 (14 %, 8°) grade; max tilt 15° |
| Power | **74 kW diesel** to tram, **380–575 V / 70 kW electric** to drill, on an **automatic cable reel** |
| Flushing | **water**, 33 l/min at 15 bar; flushing water pressure 10–15 bar |
| Shank lubrication | **air/oil mist**, from a 1.6 m³/min at 7 bar onboard compressor |
| Canopy | **FOPS/ROPS to ISO 3449** |
| Noise at the operator station | **98 dB(A)** measured to **EN 16228** |

Modelling cues: **two booms** each carrying a feed and a drifter, crossing and
uncrossing as they work the face; a **cable reel** on the rear deck paying out a
fat orange cable back down the drive (this is a huge authenticity detail — the
jumbo drives on diesel and **drills on mains electricity**); a **canopy, not a
cab**; a hinge in the middle of the chassis; **four jacks** that come down before
drilling; water hose and air hose alongside the cable.

Larger classes: face rigs are built for headings up to **12.9 m wide × 8.2 m
high** with a minimum tramming height of **2.9 m**, and low-profile variants for
headings up to **8.35 m × 6.0 m** with a **1.4 m** minimum tramming height
[W-MINEMASTER].

**C.2.2 Longhole production rig.**
Similar carrier, completely different working end. Instead of a long horizontal
feed pointed at a face, it has a **short feed on a rotating ring or "cradle"**
that swings through a full circle in a vertical plane, so it can drill every hole
in a ring — straight up, out sideways, and down — from one setup. A **rod
handling magazine** carrying **short rods (0.9–1.8 m)** [`L-TH`], because the
drive is small. Jacks and a roof-jack (a vertical stinger that presses against
the back) to lock the machine solid. ITH variants carry a rotary head and **DTH
pipe** instead, for **Ø89–216 mm** holes [W-SANDVIK-DU431, via summary]. The
silhouette reads: *a low articulated body with a big protractor on the front.*

**C.2.3 Bolter.**
A jumbo carrier with a **bolting boom**: a feed that drills the hole, then
rotates or indexes to present a **bolt magazine / carousel**, plus a **resin
cartridge** feed or a **grout/water inflation** line depending on the bolt type,
and a **basket** for the operator on some designs. Frequently also carries a
**mesh handling attachment** — an arm that lifts and holds a mesh sheet against
the back while the bolt is installed through it. The visual tell is the
**carousel of bolts** and the boom pointing **upward** almost all the time.

**C.2.4 Cable bolter.**
Same idea, harder problem: cable bolts are far longer than the drive is high, so
the rig must **drill a long hole with short rods** and then **push flexible
strand** up it from a coil. Add a **grout pump and mixer** on the deck and hoses
running to the boom.

**C.2.5 Raise borer.**
Unlike anything else. It is not a mobile machine — it is **set up and grouted
down** onto a prepared concrete floor in a small chamber on the upper level. A
short, extremely stiff **derrick** over a **large-diameter rotary drive** with a
**thrust cylinder** frame; **1.5 m drill pipes** [W-SANDVIK-RB] handled by a
pipe loader; a hydraulic power pack and a water pump alongside. The **reamer
head** — the object the player will remember — is a flat steel disc **0.6–6 m**
across studded with **4 to 32 roller cutters** in bolted **saddles**, weighing
**2.7 to 38 tonnes** [W-SANDVIK-RB]. Segmented versions split into a base head
plus two removable segments so they can go down a cage and along a narrow drift,
then bolt together at the collar [W-SANDVIK-RB]. Show the head being assembled
in the lower level — it is the best set-piece in the entire mining vertical.

**C.2.6 Charge-up rig.**
A carrier with a **pressure vessel** (ANFO, 275–909 kg) or an **emulsion tank**
(up to ~4,450 l) and a pump, plus **enclosed, static-safe storage for detonators
and boosters**, hose reels, and a **person-lifting basket on a boom** so the
charge hand can reach uphole collars [W-IM-GETMAN; W-NORMET]. The silhouette:
*low articulated carrier + tank + basket boom.*

**C.2.7 LHD and truck — for context.**
The **LHD** (load-haul-dump) is the shape of underground mining: a centre-hinged
machine with an enormous bucket at one end and the engine at the other, the
operator sitting **sideways** in the middle so they can see both directions
without turning around, and no cab roof to speak of. The **underground truck** is
a similar articulated shape with a low, wide box body. Both exist in the scene to
tell the player that drilling is one station in a cycle, not the whole mine.

---

## D. Tooling and consumables

All of these are real taxonomy nodes [`L-TAX`; `DOMAIN.md` §3] — so they are
already shop-legal.

### D.1 Top hammer — threads, rods, bits, shanks

Thread families in use, by application chapter [`L-TH`]:

| Application | Bit thread / system | Bit diameters |
|---|---|---|
| Small hole | H19 (¾"), H22, R22 (⅞"), R23 (29/32"), R25 (1") | small |
| **Drifting and tunnelling** | **R25, R28, R32, R35** | **Ø33–48 mm** in the R25 range |
| **Bench drilling** | **R32, T35, T38, T45, T51, Ø60 mm system** | **Ø51–127 mm** (R32: 51/57/64/76; T51: 89/102/115/127) |
| **Long hole underground** | **R32, T35, T38, T45, T51** + tube systems **T45, ST58 (2¼"), ST68 (2¾")** | **Ø51–127 mm** |

Complementing `DOMAIN.md` §4 (R25–R51 · T38–T127 · H55–H114): the mining
chapters show the practical, narrower working set. Threaded button bits across
the whole catalogue run **Ø28–152 mm** [`L-TH`].

**Rods.**

| Type | Lengths | Notes |
|---|---|---|
| Drifter rod (jumbo), R32–Hex 25–R25 | **1,870 / 2,175 / 2,475 / 2,630 / 2,785 / 2,935 / 3,090 / 3,340 / 3,700 mm** | Flushing hole Ø8.6 mm. Hex section is the visual tell of a drifter rod |
| Longhole extension/MF rod, R32 | **915 / 1,220 / 1,525 / 1,830 mm** | Short, because the drive is short |
| Bench extension/MF rod, R32 | **2,440 / 3,050 / 3,660 mm** | Flushing hole Ø11.7 mm; wrench flat 25.4 mm |
| Bench MF rod, T45 | **3,050 / 3,660 / 4,265 / 6,095 mm** | Flushing hole Ø17 mm; female end Ø63 mm |
| Bench MF rod, Ø60 mm system | **3,660 / 4,265 / 5,335 / 6,095 mm** | Flushing hole Ø22.5–25 mm; female end Ø82–85 mm; for bits **Ø92–152 mm** |
| Pilot tube, Ø60 mm system | Ø**76 mm** and Ø**87 mm** | Stiffens the top of the string |
| Guide tube | Ø**46 mm** (for Ø51–64 bits), Ø**63 mm** (Ø76–89), Ø**76 mm** (Ø89–102) | Straightness aid |
| Coupling sleeve | R32: **150 mm** long, Ø44 mm · T45: **210 mm**, Ø63 mm | The alternative to MF rods |

**Two engineering claims worth teaching in-game, both sourced** [`L-TH`]:
- **MF rods have ~50 % less thread play than a separate coupling sleeve**, which
  is why they drill straighter.
- A **Ø60 mm rod has 40 % more cross-section and 65 % higher bending stiffness
  than a Ø51 mm rod**, permitting straighter holes and better patterns.

**Bit geometry** [`L-TH`]: button shapes **spherical / conical / ballistic**;
skirt designs **regular** or **retrac** (a retrac skirt has reaming ribs so the
bit can be pulled back through caving ground). Gauge/front button counts and
sizes are specified per bit — e.g. an Ø89 mm T51 bit with 5 × Ø13 mm front and
8 × Ø13 mm gauge buttons at a 35° gauge angle. **Cross bits** also exist for
smaller diameters. **Reaming bits** of **Ø102 mm (4")** and **Ø127 mm (5")** run
on a **pilot adapter for reaming 51 mm pilot holes** — that is exactly how you
make the large relief hole for a longhole burn cut or a slot [`L-TH`].

**Shank adapters** are their own chapter [`L-TH`] and their own taxonomy node.
Reminder from `PLATFORM_TRUTH.md` Part C: a **shank adapter** (top hammer,
transmits blow energy from the drifter into the string) is **not** a **DTH
shank** (couples the hammer to the string). Do not merge them.

### D.2 DTH — hammers, shanks, bits

Hammer shank designation families, with top connection, hammer OD and
recommended hole size [`L-DTH`]:

| Class | Shank designations | Top thread | Hammer OD | Recommended hole size |
|---|---|---|---|---|
| ~2" | BULROC2 | DIN 405 RD50 box | 62 mm | **73–89 mm** |
| 3" | IR3.5 | API 2⅜ REG pin | 86 mm | **95–130 mm** |
| 4" | DHD340 / QL40 / SD4 / M40 | API 2⅜ REG pin | 101.6 mm | **105–152 mm** |
| 5" | DHD350 / QL50 / SD5 / M50 | API 3½ REG pin | 126 mm | **140–203 mm** |
| 6" | DHD360 / QL60 / SD6 | API 3½ REG pin | 146 mm | **156–254 mm** |
| 8" | DHD380 / QL80 / SD8 | API 4½ REG pin | 180 mm | **200–254 mm** |
| 10–12" | SD10, N120 / QL120 | 6⅝ API 4N pin | 225 / 272 mm | **251–445 mm** |
| Big | N120 / IR112 / ED120, N125 / ED320 | API 6⅝ REG pin | 272 mm | **302–610 mm** |
| Bigger | SD15 / ED370 | API 8⅝ REG pin | 320 mm | **457–762 mm** |
| Biggest | N180 / SD18 / QL200, N240 / ED520, ED300 | API 8⅝ REG pin / BECO 10" pin | 374 / 402 / 519 / 640 mm | **610–978 mm** |

Working pressure: **7–34 bar (100–500 psi)** for the small and mid hammers,
falling to **7–21 bar** and **7–16 bar** for the largest [`L-DTH`]. Hammer body
length **805–2,425 mm**; piston mass **2.9 kg to 1,270 kg** [`L-DTH`]. Those two
numbers alone justify a whole tier of the shop: an 18" hammer's piston weighs
more than a car.

**DTH bit designation grammar** [`L-DTH`], useful for generating plausible
in-game part descriptions without copying anyone's numbers:

```
[type] [diameter mm] [shank design] [button config] [front design] [holes] [valve]
 N = normal          S = spherical      FF = flat face        FV = foot valve
 H = heavy duty      P = parabolic      CC = concave          FL = foot-valve-less
 R = reverse circ.   B = ballistic      CV = convex
                     C = conical        CF = convex+concave
                     F = spherical+ballistic   RM = reaming
```

Bit masses that make the "heavy bit" flavour real: Ø76 mm = **2.6 kg**;
Ø89 = **3.0**; Ø102 = **7.5**; Ø115 = **8.4**; Ø127 = **12–13**; Ø152 = **16 kg**
[`L-DTH`]. Larger DTH bits are two-hand lifts and then crane lifts — one brochure
explicitly frames longer bit life as **fewer heavy lifts and less injury risk**
[`L-EPIDTH`].

Large-diameter DTH bit face geometries in production: **flat front**, **super
flat front**, and **convex/concave**, in **Ø165, 171, 178 mm**, on **QL 50 / QL
60 / TD 40** shanks [`L-EPIDTH`].

### D.3 Rotary blasthole — tricone bits

[`L-ROT`]

- **Sizes:** 7⅞", 9", 9⅞", 10⅝", 12¼", 13¾" (≈ **200–349 mm**).
- **IADC codes** seen in the range: **432, 512, 532, 612, 632, 712**. (IADC is the
  industry's four-character bit classification — the game can use "IADC code" as
  a real, checkable spec on a listing.)
- **Insert shapes:** conical (CO), offset conical wedge (OW), spherical (SP),
  semi-spherical (SS), wedge (WE), wedgecrest (WC), flat-top conical (FT), ogive
  (OG).
- **Insert count** 106–170 across 11–13 rows; harder rock → more, blunter inserts.
- **Bearings:** air-cooled (the bailing air also cools the bearings; a water and
  debris separator keeps that air clean).
- **Threads:** **API** or **BECO**.
- **Wear anatomy worth modelling:** the **shirttail** (the thin lower part of each
  leg) is the classic wear-out point — it is abraded by cuttings during flushing,
  and shirttail protection is a major selling point. Shirttail-to-hole-wall
  clearance is a design trade: more clearance = less arm wear + better bailing.
- **Rock hardness bands used to select the bit** — directly usable as the game's
  UCS bands for surface mining:

| Band | UCS | Typical rock |
|---|---|---|
| Soft | **< 117 MPa** | claystone, mudstone, chalky limestone, soft shale, semi-consolidated sandstone |
| Medium | **100–200 MPa** | consolidated sandstone, medium shale, tuff, soft schist, limestone, marble, granite, gneiss |
| Hard | **200–303 MPa** | andesite, rhyolite, quartzite, diorite, diabase, hard shale, slate, dolomite, basalt, granodiorite, taconite |
| Very hard | **289–414 MPa** | basalt, tactite/skarn, taconite, **banded iron formation**, chert, quartzite, amphibolite, hornfels, **haematite ore**, gabbro |

Note how well that dovetails with `DESIGN_EXPANSION.md` §2's commodity table:
**iron (BIF/haematite/magnetite) sits in the top band** — "brutally abrasive" is
correct, and now it is sourced.

### D.4 Roadheader picks and continuous-miner tools

From the mining catalogue [`L-BETEK`], which is exactly the taxonomy's
**Roadheader Picks** and **Round-Shank / Point-Attack Picks** node [`L-TAX`]:

- **Round-shank cutter bits**, organised by **shank system**: **Ø25 mm (1")**,
  **Ø30 mm (1.18")**, **Ø35 mm (1.38")**, **Ø38 mm (1.5")**, and **step shanks**
  **Ø38/30 mm (1.5"/1.18")** and **Ø43/35 mm (1.70"/1.38")**.
- Within a shank system, bits are further specified by **shank length** —
  **76 mm (3")**, **82 mm (3.2")**, **93 mm (3.6")**, **96 mm (3.8")** — and by
  **gauge / head diameter** — **89 mm (3.5")**, **100–102 mm (4")**,
  **114 mm (4.5")**.
- **Radial (flat/chisel) bits** in sizes such as **145 × 38 × 22 mm**,
  **200 × 137 × 30.5 mm**, **230 × 137 × 30.5 mm**, including heavy-duty variants.
- **Holders** (the pick box welded to the drum) are a separate item from the pick,
  and each holder family has its own **assembly and disassembly tools**.
- **Extraction tools are a real consumable category:** bit extractors and bit
  pullers per bit series, and **wedge pullers for shaft diameters 20–25 mm and
  30–38 mm**. A worn pick that will not come out of its holder is a genuine
  underground time-sink.
- **Flexible weld-on wear protection** for the drum body itself.
- Manufacturing note usable as flavour: carbide tip and steel body have very
  different thermal expansion coefficients, so the joint is a **brazed** one, and
  brazing **shear strength** is a tested quality parameter [`L-BETEK`].

### D.5 Raise boring tooling

[W-SANDVIK-RB] — see §A.5.1 for the full numbers. Taxonomy nodes exist for
**Raise Bore Equipment**, **Raise Bore Reamer Heads**, **Raise Bore Cutters**,
**Raise Bore Drill Stems & Stabilizers** and **Raise Bore Pilot Bits** [`L-TAX`].

- **Pilot bits:** sealed-bearing roller bits with hard-wearing gauge buttons.
- **Drill pipe:** **1.5 m**, hollow, high-torque thread.
- **Stems:** Ø**228–381 mm**, bolted to the base head so one head can follow
  different pilot-hole sizes.
- **Cutters:** two types cover most applications; repositioning them in their
  saddles changes button-row spacing to suit the rock.
- **Stabilizers:** large-diameter, mandatory whenever the string is in
  **compression** (blind boring, down boring).

### D.6 Ground support consumables

Taxonomy: **Rock Bolts · Cable Bolts · Soil Nails · Bolt Plates & Nuts · Resin
Cartridges**, and **Mesh & Screening · Support Plates · Grout & Resin
Consumables · Geotextiles** [`L-TAX`].

Sourced numbers available today (all §A.4): friction-bolt ODs **33 / 39 / 46 mm**,
lengths **0.9–3.6 m**, steel capacity **7.3–16.3 t**, and the bit-size ↔
anchorage relationship [W-ROCSCIENCE]. **ASTM F432** is the specification MSHA
points to for roof and rock bolts and accessories [W-MSHA-TIP].

### D.7 ANFO loaders and charging consumables

Taxonomy node: **ANFO Loaders** under *Tunneling & Underground* [`L-TAX`].
Consumables: ANFO, packaged and pumped emulsion, primers/cast boosters,
detonators (electric, non-electric, electronic), detonating cord (specified in
**g/m** or **grains/ft**), stemming (drill cuttings, water stemming bags, plugs),
and inert water-gel cartridges used as **deck separators** in decked charges
[W-REVEY].

---

## E. Hazards and the correct response

Format: **what the crew sees first → what it is → correct action → source.**
These map one-to-one onto in-game hazard events.

### E.1 Ground fall (fall of ground, FOG)

- **What you see first:** drummy sound when the back is sounded with a scaling
  bar; new cracks or a "guttering" line along a shoulder; **broken or bagged
  mesh**; plates that have gone slack; fresh dust or spalls on the floor; a bolt
  that has been pulled through its plate; water suddenly appearing along a
  structure.
- **Correct action:** stop; **do not go under it**; bar down (scale) from a safe
  position under supported ground, or support it, before any other work or travel
  in the area. Until it is corrected, **post it against entry** and, when
  unattended, **barricade it** [W-CFR-573200]. Examination and testing of ground
  is required **before work starts, after blasting, and as conditions warrant
  during the shift**, by designated experienced persons [W-CFR-573401]. In the UK
  the parallel duty is to keep secure every place where persons work or pass, on
  the basis of a recorded ground-movement risk assessment made **before**
  excavation [W-UK-REG32].
- **Special case — raises:** raise blasting is regarded as the most dangerous
  development work there is, with a long history of fatal falls of ground; the
  shielded raise-climber platform and, better, **drop raising** (which removes
  the need to stand under fresh ground at all) exist precisely because of that
  history [W-REVEY].

### E.2 Misfire

- **What you see first:** at the post-blast examination — an uncharacteristically
  short pull, **bootlegs** (unfired hole butts) in the face, undetonated product
  or a detonator lead in the muckpile, a hole count that does not match, an
  intact collar where a hole should have been.
- **Correct action:**
  1. **Wait before approaching.** Do not enter the blast area for **30 minutes**
     if safety fuse and blasting caps were used; **15 minutes** for other
     detonator types; **30 minutes** (or the manufacturer's recommended time,
     whichever is longer) for **electronic** detonators [W-MSHA-MISFIRE].
  2. **Examine faces and muck piles for misfires after every blast** —
     30 CFR § 57.6311 [W-CFR-576311].
  3. Only work **necessary to safely remove the misfire** is permitted in the
     affected area until it is disposed of [W-CFR-576311].
  4. If it cannot be safely disposed of, **post warning signs at all points of
     visible entry** and **notify management immediately** [W-CFR-576311].
  5. **Report any misfire to management before the end of the shift**
     [W-CFR-576311].
  6. The mine's own rules must contain **requirements relating to misfires** —
     UK Mines Regulations 2014, reg. 31(d) [W-UK-REG31].

### E.3 Drilling into a charged hole or a bootleg

This is the one that kills drillers, and the correct answer is a chain of
controls, not a reflex:

- **Prevent:** loading and blasting must be **continuous, with the blast fired as
  soon as possible after loading is complete**; if firing might be delayed more
  than **72 hours** the regulator must be notified — the whole point being that
  charged holes should not be left standing around near drilling work
  [W-CFR-566306(d)]. During loading, **only blast-related work is allowed at the
  blast site** [W-CFR-566306(c)], so a drill has no business being there.
- **Detect:** the **post-blast examination** and the **misfire search of the face
  and muckpile** after every shot are what find the bootleg *before* the drill
  does [W-CFR-566306(g); W-CFR-576311].
- **At the collar:** *"Before loading, blastholes shall be checked and, wherever
  possible, cleared of obstructions"* — 30 CFR § 56.6301 [W-CFR-566301]. A hole
  that will not clean out is a hole that gets escalated, not forced.
- **If you believe you have collared on a bootleg or a charged hole:** stop
  drilling immediately, do not withdraw or work the string further than needed to
  make it safe, withdraw people from the area, treat it as a misfire (E.2), and
  notify the shift boss and the shot firer. Do not attempt to "drill past it".
> The specific "do not drill within X metres of a charged hole" distance is set
> by **site rules and jurisdiction**, not by a single federal number I could
> source. Marked `UNVERIFIED` — do not put a distance in the game text.

### E.4 Flyrock

- **What you see first:** on design — a burden that is too small at the toe or at
  the collar, an under-stemmed hole, a hole that has broken into an old void or a
  weak seam, an over-charged perimeter row. On the day — rock beyond the
  exclusion zone.
- **Root cause the game should teach:** flyrock is a *geometry* failure far more
  often than a *product* failure. Hole deviation changes the real burden. Stiffer
  drill strings and straighter holes are explicitly sold on **"reduced risk for
  fly rock, back break and ground vibrations"** [`L-TH`].
- **Correct action:** before firing — **ample warning**, clear exit routes, and
  **all access routes to the blast area guarded or barricaded**; everyone out of
  the blast area except those in a blasting shelter that protects against
  concussion, flying material and gases [W-CFR-566306(e),(f)]. After firing —
  no work until the **post-blast examination** is done by a competent person
  [W-CFR-566306(g)].

### E.5 Hole collapse / blocked hole

- **What you see first:** flushing return goes away or turns to slurry; the rod
  binds on the way out; the hole measures short when you tape it; the charge hose
  stops at a depth that is not the hole bottom.
- **Consequences:** a blocked production hole is a hole missing from the ring, so
  the ring will not break to design. A blocked bench hole is a hole missing from
  the pattern, so the burden on its neighbours doubles.
- **Correct action:** clear it before loading — this is the § 56.6301 duty
  [W-CFR-566301]. If it cannot be cleared, it must be **reported and redrilled**,
  and the blast design adjusted. A hole that is quietly charged short is how you
  get a frozen stope or a standing toe.
- **Prevention:** in caving ground use a **retrac skirt** bit so the bit can ream
  its way back out [`L-TH`], and keep flushing up.

### E.6 Water

- **What you see first:** flush return goes from dry dust to mud; water running
  from the collar of an uphole; a downhole that will not stay dry between drilling
  and charging.
- **Correct action:** switch explosive product. **ANFO is destroyed by water** —
  it is a dry, free-flowing product [W-DYNO]. **Emulsion is water-resistant** and
  is the reason wet holes are chargeable at all [W-FARMONAUT]. For the game, this
  is a clean, real decision: the ground tells you which product to buy.
- **Secondary:** water in the hole changes the effective charge density and
  therefore the load factor; water stemming is also a deliberate technique
  [W-REVEY, VCR example uses "4 to 5 ft water stemming"].

### E.7 Gas and fumes

- **What you see first:** after a blast, the drive is full of fume and dust and
  the ventilation has not turned it over yet; personal gas detectors alarm.
- **Correct action:** **re-entry is a ventilation decision, not a clock**. The
  crew waits for the fumes to clear and for the workplace to be examined. In the
  UK, where a place is classified as **hazardous under DSEAR**, the mine's rules
  must require **testing for flammable gases before any shot is fired** —
  reg. 31(e) [W-UK-REG31]. Underground ventilation is its own duty — Mines
  Regulations 2014, Part 4, reg. 43 [W-UK-MINES2014]. Under MSHA's new-miner
  syllabus, **mine gas detection and avoidance** is a mandatory training subject
  [W-CFR-485].
- Related surface/underground hazard the machine spec sheets acknowledge: diesel
  exhaust. Diesel particulate filters are an offered fitment on underground
  drills [W-SANDVIK-DD211L].

### E.8 Deviation into an old working

- **What you see first:** the hole suddenly takes off — feed pressure collapses,
  rotation unloads, flushing return is lost completely, the rod free-falls.
- **What it is:** you have intersected a void — an old stope, a filled working, a
  natural cavity — that either was not on the plan or was not where the plan said.
  Underground, an intersected old working may also contain **water** or
  **oxygen-deficient or noxious air** under pressure.
- **Correct action:** stop feeding immediately (the same reflex the game already
  teaches for karst voids in `FACTS_VERIFIED.md`), do not attempt to charge the
  hole, report it, and get it surveyed. A hole into an unplanned void must be
  treated as an unknown, not as a hole.
- **Prevention is the drilling KPI:** this is precisely why deviation is scored
  and not tolerated in longhole work — a 2 % deviation over 25 m is 0.5 m of
  error, and at 50 m it is a metre [W-AIVYTER, via summary; W-LTH on deviation
  and dilution].

### E.9 Surface-specific: highwall and bench stability

- **The duty:** *"Mining methods shall be used that will maintain wall, bank, and
  slope stability in places where persons work or travel… When benching is
  necessary, the width and height shall be based on the type of equipment used
  for cleaning of benches or for scaling of walls, banks, and slopes"* —
  30 CFR § 56.3130 [W-CFR-563130].
- **Drilling relevance:** the drill works **on the bench crest** — the single most
  exposed position on a pit. Over-charged perimeter holes on the previous shot
  damage the crest the next drill has to stand on. Back-break from a bad blast is
  therefore a **drilling hazard**, not just a blasting inefficiency.

---

## F. Game mechanics proposal

### F.0 The three sliders, grounded

`GAMEDESIGN.md` §3 already fixes the control set: **Feed (WOB) · Rotation /
Percussion · Flushing**. That is the correct set and the industry's own drillers'
guide validates the pedagogy behind it [`L-PARAM`]:

- **ROP is the outcome you tune for**, and *"to find the optimum ROP, you should
  start by using the ROP suggested on the bit label. You can then fine tune the
  weight on bit (WOB) and rotation speed (RPM) in small increments"* [`L-PARAM`].
  → **The sweet-spot band mechanic is literally how the job is taught.**
- **WOB has a hard upper bound and a real downside on both ends.** Too high →
  premature wear of the drill, rods, bit and barrel, *and* **"a higher
  probability of borehole deviation"**. Too low → lost productivity and a
  **polished** bit that has to be sharpened [`L-PARAM`].
  → **Feed is the deviation lever. This is the single most important mapping in
  the mining vertical.**
- **The correct WOB changes as the string grows.** *"As you advance deeper into
  the hole, you will add rods and your rod weight will increase. It is likely
  that you will need to reduce your feed pressure… your rod weight alone can
  become more than the pressure you have been exerting, meaning that you may need
  to hold back"* — and experienced drillers *feel* when to do it [`L-PARAM`].
  → **The Feed sweet spot should drift downward with depth.** Free, real, and it
  makes long holes genuinely harder than short ones.
- **Flush is not a monotonic good.** *"The water flow should be as high as
  possible but must be related to the bit size and type of rock… in soft or
  fractured rock, the water flow must be high. However in a very hard and
  competent rock, where the speed of penetration is low, the water flow must be
  reduced"* [`L-PARAM`]. Improper flushing regrinds cuttings, hurting both ROP
  and bit life [`L-PARAM`].
  → **Flush already has a two-sided sweet spot in the game's model; keep it.**

### F.1 Per-method slider meanings and scoring

#### F.1.1 Surface blasthole (bench)

| Slider | Means | Effect |
|---|---|---|
| **Feed** | Pulldown / hydraulic feed force | ↑ ROP, ↑ wear, **↑ deviation**, ↑ jam risk in broken ground. Must ease at collaring and at every stratum change |
| **Rotation** | Percussion rate (top hammer/DTH) or RPM (rotary) | ↑ ROP, ↑ heat. On **DTH, rotation is secondary — the air does the work**; on **rotary, rotation + weight is the whole method** |
| **Flush** | Air (bailing velocity) + dust suppression | Clears the annulus; too little → regrind, hot bit, stuck rod; too much in weak ground → over-gauge collar |

**Scored on: pattern conformance, not metres.**

```
Hole score  = collar accuracy   (distance from the pegged position)
            × angle/azimuth accuracy
            × depth accuracy    (design depth + sub-drill, ±)
            × straightness      (integrated deviation down the hole)
            × hole availability (open and clean at the collar when the
                                 charge crew arrives)

Pattern grade = worst-N holes, not the mean.
                One bad hole ruins its neighbours' burden.
```

**The multi-hole objective:** the player is given a **pattern**, not a hole — say
**5 × 6 holes**, Ø115 mm, 12 m bench + 1.5 m sub-drill, burden 3.5 m, spacing
4.0 m. The bench view shows the whole pattern as pegs; drilled holes get collar
caps; the section shows only the hole currently under the bit. **Between holes,
tramming and re-setup is a real cost** — so the tempo is: set up fast, drill
clean, move.

**Then show the blast.** After the pattern is complete the player watches the
shot and gets a **fragmentation and floor result derived from their own hole
accuracy**: tight pattern → even muckpile, flat floor, S grade; scattered
pattern → oversize boulders, standing toe, backbreak into the crest, and a
**flyrock** incident if any real burden went below design. This closes the loop
that makes the accuracy KPI *make sense* rather than being an abstract number.

**Unique surface scene:** a **bench face** — a vertical rock wall with the crest
above and the muck floor below, the drill standing on the crest, the pattern
pegged out behind it in dust, and the previous shot's muckpile with a loader
working it in the far field. Golden hour, long shadows down the face.
**Unique cross-section:** the **bench profile** — not just a hole. Show the free
face on the left, the **burden** as a measured horizontal distance, the hole with
its **stemming column**, **explosive column** and **sub-drill** below grade, and
the **design break line** from the toe of the hole to the toe of the face. When
the hole deviates, the section should show the *real* burden at the toe diverging
from the design burden. That single drawing teaches the whole method.

#### F.1.2 Underground longhole / production

| Slider | Means | Effect |
|---|---|---|
| **Feed** | Feed force on a short feed with a long, slender string | ↑ ROP, **↑↑ deviation** — this is the deviation-critical method |
| **Rotation** | Percussion (top hammer) or air + rotation (ITH) | Standard |
| **Flush** | Water or air | Critical in **upholes**, where cuttings have to be lifted *and* the water comes back down over the operator |

**Scored on: hole accuracy and deviation. Explicitly not speed.**

```
Ring score = Σ over holes of:
      toe position error vs design (this is THE number)
      × depth error
      × hole open at charge-up time
  penalised by: any hole outside the ore boundary  (dilution)
                any ore left unbroken              (ore loss)
                two holes converging               (dead-press risk)
```

**The multi-hole objective is a ring, and it is a fan, not a grid.** Present the
ring as a **fan diagram**: 9–13 holes radiating from the drill drive, each with a
designed dip and length, some up, some out, some down. The player works around
the fan hole by hole. The rig's **feed cradle rotates** between holes — a visible,
satisfying, mechanical beat that is unique to this method.

**Uphole vs downhole should play differently:**
- **Downholes:** cuttings fall back in; the hole can pack; the player must
  over-flush and may need to redrill a blocked hole. Charging later is easy.
- **Upholes:** cuttings and water come out over the machine; visibility is poor;
  the drill is fighting gravity on the rod add. Charging later is **slower and
  needs the hose pusher** [W-IM-GETMAN].

**Unique surface scene:** there is no surface. The "surface view" band becomes the
**drill drive** — a low, wet, lit tunnel with the rig set up broadside, the roof
bolted and meshed above, cables and vent bag along the back, muddy floor,
head-lamp beams and machine work-lights as the only illumination. This is the
biggest lighting/mood contrast in the whole game and should be leaned into hard.
**Unique cross-section:** the **stope ring fan** — a vertical slice showing the
drill drive as a small box, the orebody as a coloured band, and the fan of holes
radiating out into it, with the **ore boundary** drawn and the **previously fired
rings** shown as void behind. As each hole is drilled it fills in; if it deviates,
the section shows it wandering **out of the ore and into waste** — which is
dilution made visible. Nothing else in the game can show this.

#### F.1.3 Development face drilling (jumbo)

| Slider | Means | Effect |
|---|---|---|
| **Feed** | Feed force; also **collaring power**, which is a separate, lower setting real machines have [W-SANDVIK-DD211L] | Too much at the collar → the bit walks off the mark |
| **Rotation** | Percussion rate | Standard |
| **Flush** | Water at 10–15 bar [W-SANDVIK-DD211L] | Standard |

**Scored on: advance per round, overbreak and cycle time.**

```
Round score = advance achieved / round drilled     (target ≥ 95%)  [W-REVEY]
            × cut-hole parallelism                  (burn cut fails if not parallel)
            × perimeter accuracy → overbreak volume vs design profile
            × cycle time
```

**The multi-hole objective is the round**, and it must be drilled **by hole class,
not in a blob**: cut → easers → knee → rib → back/arch → lifters. Give each class
a different tolerance:

- **Cut holes:** parallelism is everything; tolerance tiny. Over-drill them by
  **15–30 cm** for the advance bonus [W-REVEY].
- **Perimeter (back/arch/rib):** must be collared on the line and drilled with
  the correct **look-out** — toes *outside* the design line by just enough for
  the drill head [W-REVEY]. Over-look-out → overbreak; under-look-out → the drive
  chokes down and the next round has to slash it out.
- **Lifters:** must be drilled to grade or the floor comes out wrong.

**Two-boom mechanic:** the twin-boom jumbo is the game's one genuine
**two-hands** machine. Let the player run both booms — either alternately with a
timing bonus for keeping both drilling, or with one on auto and one manual. The
booms **must not collide**; real machines have anti-collision. That is a free,
authentic, skill-expressing mechanic no other method offers.

**Unique surface scene:** the **heading** — a square-ish rock face lit by the
jumbo's work lights, survey control lines and offsets painted on it by the
surveyor [W-REVEY], the round marked up in paint, water spray, the cable reel
paying out behind, and the drive receding into darkness behind the machine.
**Unique cross-section:** not a hole — a **face-on round diagram**. Show the
heading profile with every hole in the round as a marked position, colour-coded
by class (cut / relief / easer / knee / rib / back / lifter), filling in as they
are drilled, with the **design profile line** and, at the end, the **actual
break line** so overbreak is visible. Optionally a small side elevation showing
round depth, look-out angle and expected break — exactly the figure the source
uses [W-REVEY].

#### F.1.4 Ground support (bolting)

| Slider | Means | Effect |
|---|---|---|
| **Feed** | Feed force while drilling the bolt hole | ↑ ROP; too much → **the hole goes oversize**, and an oversize hole is what kills a friction bolt — [W-ROCSCIENCE] finds crookedness *increases* Split Set anchorage, so do not model crookedness as a penalty |
| **Rotation** | Percussion / rotation | Standard. On the **install** phase, rotation becomes **resin spin** — with a hard time window |
| **Flush** | Water | Also **hole cleaning** — a dirty hole bonds badly |

**Scored on: install quality. Never bolts per hour.**

```
Bolt score = correct bit size for the bolt        (bigger bit → weaker bolt)  [W-ROCSCIENCE]
           × hole depth ≥ bolt length + 50 mm                                  [W-ROCSCIENCE]
           × hole straightness                                                 [W-ROCSCIENCE]
           × install execution:
               friction bolt → drive fully home; drive time is the tell        [W-ROCSCIENCE]
               resin bolt    → right cartridge count, spin through, stop
                                before gel, hold while it cures
               mech. anchor  → torque inside the specified band                [W-MSHA-TIP]
           × plate tight to the rock
Pattern score = completeness. A gap in the pattern is a hole in the roof.
```

**Two beautiful, real, sourced mechanics available here and nowhere else:**

1. **The slot-closure inspection.** After installing a friction bolt, the player
   can **shine a light down the tube** and read the slot: closed by ~1/16" =
   full contact and full anchorage; unchanged = **the hole was too big and the
   bolt is holding nothing** [W-ROCSCIENCE]. Give the player a torch action and a
   close-up. That is a genuine field skill rendered as a game verb.
2. **The statutory torque sample.** *First bolt, every tenth bolt, and the last
   bolt* of the shift must be torque-tested, with corrective action if out of
   range [W-MSHA-TIP]. Make that a scheduled interrupt the player must honour —
   and make the audit at end of shift check that they did.

**Unique surface scene:** the **back**. Camera should physically tilt *up*. Wet
rock, mesh sheets overlapping, plates and nuts in a grid, a bolt magazine
rotating, resin cartridge wrappers on the floor, the boom working overhead.
**Unique cross-section:** a **rock-mass cutaway**, not a borehole. Show the
jointed rock above the drive with bedding/joint sets drawn, the **bolts crossing
those joints**, and a **shaded "supported zone"** that grows as the pattern
completes. A bolt that is too short to cross the joint set, or a gap in the
pattern, leaves a visible unsupported wedge — and that wedge is what falls.

#### F.1.5 Raise boring

Already specified as `profileMode: raise` in `DESIGN_EXPANSION.md` §1. Sliders:

| Stage | Feed | Rotation | Flush |
|---|---|---|---|
| **Stage 1 — pilot, downward** | Thrust on the pilot bit | Rotary speed | **Water** down the string, up the annulus [W-SANDVIK-RB] |
| **Stage 2 — ream, upward** | **Pull force** (the gauge is now pull, not push) | Rotary speed; watch **torque** | **None — gravity mucks** [W-SANDVIK-RB]. Flush slider becomes **cutter cooling / hole condition** or is disabled with an on-screen explanation |

**Scored on:**
```
Stage 1: pilot accuracy — does it break through inside the target circle
         on the lower level? Miss and the whole raise is scrap.
Stage 2: cutter life + no stalls. Reaming too fast stalls the head.
         Cutters are changed from below — a real time cost.
```

**Multi-stage objective, not multi-hole.** One hole, three acts: pilot, head
assembly, ream. **Act 2 is the set piece** — assembling a segmented reamer head
from a base head plus two segments in a cramped lower-level chamber, because the
whole head could not fit down the cage [W-SANDVIK-RB]. Make it a real, short,
tactile sequence.

**Unique surface scene:** two of them, and switching between them is the drama —
the **raise bore chamber on the upper level** (machine grouted to the floor,
derrick, pipe rack, power pack, water pump) and the **lower level chamber**
(reamer head being built up, muck starting to fall, an LHD waiting).
**Unique cross-section:** the **two-level section** the design doc already
specifies — upper drive, lower drive, the pilot descending in stage 1, then the
reamer ascending in stage 2 with cuttings falling away beneath it and the
progress bar running **in reverse**.

#### F.1.6 Grade control (RC)

| Slider | Means | Effect |
|---|---|---|
| **Feed** | Feed force | ↑ ROP, ↑ wear |
| **Rotation** | RC hammer / rotation | Standard |
| **Flush** | **Air volume and pressure — and this is the sample** | Too little → sample lost in the annulus and **contamination**; too much → sample fines blown through the cyclone |

**Scored on: sample quality and integrity, not metres.**

```
Interval score = sample mass recovered vs expected
               × dryness (wet sample = smeared interval)
               × no contamination from the interval above
               × correct split ratio at the splitter
               × correct labelling / no bag mix-up
Hole score     = the assay the mine can trust
```

The failure mode is already correctly identified in `DESIGN_EXPANSION.md` §2:
**you can drill a perfect-looking hole and deliver nothing.** That is the whole
tension of this method and it should be scored ruthlessly. It is also the only
method in the game where the player can *fail invisibly* — which is a genuinely
interesting design space.

**Unique surface scene:** the **pit floor**, not the crest — flat, dusty, a wall
of bench above and behind, the pattern pegged in a tight grid, the **cyclone and
splitter** on the rig with sample bags in rows, and a geologist bagging and
labelling. **Unique cross-section:** the **ore body against the dig line**. Show
the assay result building up interval by interval as a **grade bar** beside the
hole, and at the end draw the **ore/waste boundary** the geologist derives from
it — then show whether the shovel would have dug the right rock.

#### F.1.7 Blasting / shot firing

This is a **different verb** and probably should not use the three sliders at
all. Proposed loop, straight out of §A.7:

1. **Check holes** — tape each hole; find the blocked ones; clear or report
   [W-CFR-566301].
2. **Design the charge** — per hole class, choose product (ANFO if dry, emulsion
   if wet), charge length and stemming. The **load factor formula** from §A.7 is
   the arithmetic; show the resulting **powder factor** against the face-area
   band table and flag if it is out of range [W-REVEY].
3. **Load** — with the tamping rule (never tamp the primer) and the
   pre-compression rule (spread the cut holes; put relief between them)
   [W-REVEY].
4. **Time it** — assign delays. Fast in the cut (50–100 ms), long-period
   elsewhere [W-REVEY].
5. **Secure and fire** — attend, barricade, sign, warn, guard, clear, fire
   [W-CFR-566306].
6. **Wait** — the re-entry timer is real and jurisdictional: 15 or 30 minutes
   depending on detonator type [W-MSHA-MISFIRE].
7. **Examine** — post-blast examination; search the face and muckpile for
   misfires [W-CFR-566306(g); W-CFR-576311].

**Scored on the shot:** fragmentation, muckpile shape, floor/profile, overbreak,
zero flyrock beyond the exclusion zone, zero misfires. **Over-charging the
perimeter must be punished** — it damages the rock behind the line, weakens the
opening and increases scaling and cycle time [W-REVEY]. This is the rare case
where "more explosive" is a *worse* score, which is exactly the sort of
counter-intuitive-but-true rule that makes real drillers trust a game.

### F.2 Cross-cutting mechanics worth adding for mining

1. **The ring / pattern / round as the unit of work.** Every mining method above
   is a multi-hole objective. The contract should be *"ring 47, stope 3"* or
   *"pattern 12-04 on bench 940"*, not *"drill 40 m"*.
2. **Hole availability as a scored quantity.** A hole you drilled but which
   collapsed is worse than a hole you did not drill, because the charge crew
   discovers it. This makes flushing discipline matter *after* the drilling is
   over.
3. **Deviation should be invisible while drilling and revealed at the end** for
   longhole — because that is true. Give the player *cues* (feed pressure,
   torque, the sound of the string) but not a live deviation readout, unless they
   buy a survey tool from iMarket. **Selling the ability to see your own error is
   a perfect shop item and a perfect skill-tree node.**
4. **The cycle, not the hole.** Development should show the other stations —
   charge, fire, ventilate, muck, scale, support — even if only as a compressed
   interstitial. The player should feel that their drilling either fed or starved
   the cycle behind them.
5. **Diesel to tram, electric to drill.** The jumbo and longhole rig run on a
   trailing cable [W-SANDVIK-DD211L]. Reeling out, catching the cable on a
   corner, and reeling in is a real underground annoyance and a free
   authenticity beat.
6. **Certifications gate mining contracts** exactly as `PLATFORM_TRUTH.md` Part B
   describes: general induction, ground awareness/scaling, and a shotfirer
   licence with a hard expiry plus a shorter-cycle medical (§B.4).

---

## G. Reconciliation with the existing docs

- `DESIGN_EXPANSION.md` §5 lists Mining as thin, with **"underground long-hole /
  ITH production drilling missing"** and **"rock bolting missing"**. §A.2 and
  §A.4 above are the source material for both, and §F.1.2 and §F.1.4 are the
  mechanics.
- §7 of that table lists Tunneling as missing **"drill & blast face drilling with
  a tunnel jumbo"** and names **Tunnel Drilling Jumbos** and **ANFO Loaders** as
  the taxonomy nodes. §A.3, §A.7, §C.2.1 and §C.2.6 cover those, and §A.3's
  "how a mine heading differs from a civil tunnel" note is the differentiator the
  brief asked for.
- Every shop item implied above resolves to an existing taxonomy subcategory
  [`L-TAX`]: Tunnel Drilling Jumbos · Roadheader Picks · Raise Bore Equipment /
  Reamer Heads / Cutters / Drill Stems & Stabilizers / Pilot Bits · ANFO Loaders ·
  Rock Bolts · Cable Bolts · Soil Nails · Bolt Plates & Nuts · Resin Cartridges ·
  Mesh & Screening · Support Plates · Grout & Resin Consumables · Button Bits ·
  Tricone Bits · DTH Bits · DTH Hammers · Shank Adapters · Drill Rods (Threaded) ·
  RC / Dual-Wall Drill Pipe · Shotcrete Equipment.
- Nothing above requires inventing a category.

### G.1 Candidate `FACTS` lines (each sourced; add to `FACTS_VERIFIED.md` first)

Following the style rules in `FACTS_VERIFIED.md` — one idea, present tense,
≤ ~150 characters, no brands, no model designations:

```
'In production drilling you are not paid for metres. You are paid for holes that land where the ring plan says they land.'                  [L-TH]
'Dilution is caused by deviation. A hole that wanders out of the ore blasts waste into your muck.'                                          [L-TH]
'Over 25 m of longhole, more than 2% deviation buys you bad fragmentation, dilution, or a stope that will not break.'                       [W-AIVYTER]
'Rods for underground longhole are 0.9 to 1.8 m. The drive is too small for anything longer, and every joint is a chance to wander.'        [L-TH]
'MF rods have half the thread play of a coupling sleeve. That is why they drill straighter and why the blast comes out cleaner.'            [L-TH]
'Sub-drill is what gives you a flat floor. Too little leaves toe; too much wrecks the crest of the bench below.'                            [W-PSU-83]
'Burden is roughly 25 times hole diameter on surface, 20 underground. Spacing is 1 to 1.3 times burden. Stemming is 0.7 times burden.'      [W-PSU-831]
'Most heading crews drill a round they know will break 95 percent of the hole. Drilling deeper than that is paying for nothing.'            [W-REVEY]
'Over-drill the burn cut by 15 to 30 cm. Bootleg in the cut costs the whole face its advance.'                                              [W-REVEY]
'A burn cut freezes if you overload it. The energy compacts the broken rock instead of throwing it out.'                                    [W-REVEY]
'Keep at least 15 percent open void in the cut. Below that the round has nowhere to swell and it will not pull.'                            [W-REVEY]
'Perimeter holes are lightly loaded and closely spaced. Overload them and you damage the rock you are trying to keep.'                      [W-REVEY]
'Smaller headings burn more explosive per cubic metre, because the heavily loaded cut is a bigger share of a small face.'                   [W-REVEY]
'A friction bolt needs a hole slightly smaller than the bolt. Drill it oversize and you have installed a steel tube that holds nothing.'    [W-ROCSCIENCE]
'Shine a light down a friction bolt. Slot closed means full anchorage. Slot unchanged means the hole was too big.'                          [W-ROCSCIENCE]
'Bolt holes must be at least 50 mm deeper than the bolt.'   <-- CUT the second sentence: [W-ROCSCIENCE] says crooked holes INCREASE Split Set anchorage.
*** WITHDRAWN — NOT IN THE CITED SOURCE. [W-MSHA-TIP] does not contain this rule and neither does 30 CFR 57.3360. The nearest real rule is 30 CFR 75.204(f), first tensioned bolt per drill head then one in four — and that is US underground COAL roof bolting, the wrong jurisdiction for this game's hard-rock and tunnelling rockbolt. ***
'Raise boring drills a pilot down, then pulls a reamer up. A deviated pilot misses the level below and the raise is scrap.'                 [W-SANDVIK-RB]
'A reamer head is 0.6 to 6 m across and can weigh 38 tonnes. Big ones ship in segments and get bolted together underground.'                [W-SANDVIK-RB]
'Blind boring pushes the head upward, so the string is in compression. That is why it needs large stabilizers.'                             [W-SANDVIK-RB]
'ANFO is dry and cheap. Emulsion is water resistant. The hole decides which one you can use.'                                               [W-DYNO]
'Check every blasthole and clear it before you load it. A hole you cannot clean is a hole you report, not a hole you force.'                [W-CFR-566301]
'After every blast, the face and the muckpile get searched for misfires. Every misfire is reported before the shift ends.'                  [W-CFR-576311]
'Suspect a misfire and you wait. Fifteen minutes for most detonators, thirty for safety fuse or electronic.'                                [W-MSHA-MISFIRE]
'Ground gets examined before work starts, after every blast, and any time it changes. That is a legal duty, not a habit.'                   [W-CFR-573401]
'Bad ground gets barred down or supported before anyone works or travels under it. Until then it is posted and barricaded.'                 [W-CFR-573200]
'Underground rigs are low, wide and hinged in the middle because the drive is low, wide and has corners.'                                   [W-SANDVIK-DD211L]
'A jumbo trams on diesel and drills on mains power. The cable on the reel behind it is not decoration.'                                     [W-SANDVIK-DD211L]
'A grade control hole is not sold by the metre. It is sold by whether the assay can be trusted.'                                            [W-TANDF]
```

---

## H. Gaps — what is NOT sourced and must not be invented

| # | Gap | Why it matters | How to close it |
|---|---|---|---|
| 1 | **Cable bolt numbers** — strand diameter, hole diameter, standard lengths, capacity, grout water:cement ratio, breather-tube vs grout-tube method, bulbed strand | §A.4 and §F.1.4 cover cable bolting qualitatively only | Fetch a public cable-bolt technical brochure or a NIOSH ground-control publication. The Queen's Mine Design Wiki page on cable bolting is the obvious source but its TLS certificate would not verify from this machine |
| 2 | **EUR day rates for European mining roles** | §B.5 is Australian-only; the game's currency is EUR | Salary aggregators returned HTTP 403 and the web-search budget was exhausted. Source national statistics offices (Destatis, SCB, Statistics Finland) or a Nordic mining union agreement |
| 3 | **The FX rate** used for any AUD→EUR conversion | §B.5 | Check live before shipping any converted figure |
| 4 | **A specific "do not drill within X m of a charged hole" distance** | §E.3 | This is set by jurisdiction and site rule, not one federal number. Either omit the distance or source a specific jurisdiction |
| 5 | **Ring burden and toe spacing numbers for longhole stoping** | §A.2 gives hole diameter, length and deviation, but not the burden/spacing design values | The Springer *Underground Ring Blasting* chapter and the AusIMM ring-design literature are paywalled/403. Try a NIOSH or university open-access source |
| 6 | **The OSMRE surface-blast-design numbers** (burden vs explosive diameter by rock density; the subdrill table; the 0.016 × bench height screen; bench height 1.5–4.0 × burden) | Used in §A.1 and flagged inline | These came from a search-engine summary of the OSMRE Module 3 PDF, which exceeded the fetch size limit. Download and read the PDF directly |
| 7 | **The ITH production rig figures** (Ø89–216 mm, 100 m, 3"–8" hammers) and the **twin-boom cycle example** (45 holes × 4 m in 24 m², 2.2–2.8 h) | §A.2, §A.3 | Both from search summaries of vendor pages. Verify against the pages themselves |
| 8 | **Shotcrete** — thickness, fibre vs mesh, wet-mix vs dry-mix, spraying rates | §A.4 names it only | Taxonomy node exists (*Shotcrete Equipment*); source technical data separately |

---

## I. Source list (full URLs)

**Web**

| Key | URL |
|---|---|
| `W-PSU-83` | https://courses.ems.psu.edu/mng230/node/867 |
| `W-PSU-831` | https://courses.ems.psu.edu/mng230/node/869 |
| `W-PSU-832` | https://courses.ems.psu.edu/mng230/node/871 |
| `W-REVEY` | https://higherlogicdownload.s3.amazonaws.com/SMENET/d1f74698-76c6-4c73-8ced-5de57b15be03/UploadedImages/UCA-YM/TUNNEL-SHAFT%20BLAST%20DESIGN%20Updated%20OCTOBER%202013.pdf — REVEY Associates, *Tunnels, Shaft and Development Headings Blast Design*, updated Oct 2013 |
| `W-OSMRE` | https://www.osmre.gov/sites/default/files/inline-files/Module3_0.pdf — *Surface Blast Design*, Module 3 (exceeded fetch size limit; figures used are via search summary) |
| `W-SANDVIK-RB` | https://www.mining.sandvik/globalassets/products/rock-tools/pdf/raise-boring-tools-brochure.pdf |
| `W-SANDVIK-DD211L` | https://www.mining.sandvik/globalassets/products/underground-drill-rigs-and-bolters/pdf/dd211l-v-specification-sheet-english.pdf |
| `W-SANDVIK-DU431` | https://www.mining.sandvik/en/products/equipment/underground-drill-rigs/du431-articulated-in-the-hole-production-drill-rig/ |
| `W-ROCSCIENCE` | https://www.rocscience.com/assets/resources/learning/papers/Factors-Influencing-the-Effectiveness-of-Split-Set-Friction-Stabilizer-Bolts.pdf |
| `W-EMJ` | https://www.e-mj.com/features/rockbolting-technology-keeps-mines-safe-and-secure/ |
| `W-TRM` | https://www.miningfrictionbolt.com/fb-39-friction-bolt/39-friction-bolt-split-set.html |
| `W-SPRINGER` | https://link.springer.com/chapter/10.1007/978-981-99-2645-9_6 — *Underground Ring Blasting* |
| `W-RING-PATENT` | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8826820 — *High energy blasting* |
| `W-NATURE` | https://www.nature.com/articles/s41598-023-29803-6 — parallel hole cut vs V-cut |
| `W-AIVYTER` | https://www.aivyter.com/blog/engineering-guide-to-underground-drill-rig-selection-and-operation/ |
| `W-AIVYTER-JUMBO` | https://www.aivyter.com/blog/underground-mining-jumbotechnical-specs-performance-selection/ |
| `W-MINEMASTER` | https://www.minemaster.eu/product-category/drill-rigs/ |
| `W-FRD` | https://frdusa.com/dth-or-top-hammer-drill-comparing-two-types-of-rock-drills/ |
| `W-MINDRILL` | https://www.mindrill.com/dth-vs-top-hammer-drilling-which-method-works-best-for-different-rock-types/ |
| `W-KELLEG` | https://kellegdrill.com/docs/rock-drill-bit-types-explained/ |
| `W-DYNO` | https://www.dynonobel.com/products-services/products/bulk-technology/anfo/ |
| `W-FARMONAUT` | https://farmonaut.com/mining/mining-explosives-2025-innovations-safer-blasting |
| `W-IM-GETMAN` | https://im-mining.com/2025/07/22/getmans-integrated-approach-to-explosives-delivery/ |
| `W-NORMET` | https://www.normet.com/en/explosives-charging |
| `W-AUSIMM-BH` | https://www.ausimm.com/publications/conference-proceedings/sampling-2008-conference/blasthole-sampling-for-grade-control---the-many-problems-and-solutions/ |
| `W-AUSIMM-RC` | https://www.ausimm.com/publications/conference-proceedings/eighth-international-mining-geology-conference-2011/improved-grade-control-using-reverse-circulation-drilling-at-mogalakwena-platinum-mine-south-africa/ |
| `W-TANDF` | https://www.tandfonline.com/doi/abs/10.1080/03717453.2017.1414104 — blasthole vs RC variographic experiment |
| `W-CFR-573360` | https://www.law.cornell.edu/cfr/text/30/57.3360 — ground support use |
| `W-CFR-573200` | https://www.law.cornell.edu/cfr/text/30/57.3200 — correction of hazardous conditions |
| `W-CFR-573401` | https://www.law.cornell.edu/cfr/text/30/57.3401 — examination of ground conditions |
| `W-CFR-576311` | https://www.law.cornell.edu/cfr/text/30/57.6311 — handling of misfires |
| `W-CFR-566306` | https://www.law.cornell.edu/cfr/text/30/56.6306 — loading, blasting, and security |
| `W-CFR-566301` | https://www.law.cornell.edu/cfr/text/30/56.6301 — blasthole obstruction check |
| `W-CFR-566300` | https://www.law.cornell.edu/cfr/text/30/56.6300 — control of blasting operations |
| `W-CFR-563130` | https://www.law.cornell.edu/cfr/text/30/56.3130 — wall, bank, and slope stability |
| `W-CFR-577052` | https://www.law.cornell.edu/cfr/text/30/57.7052 — drilling positions |
| `W-CFR-485` | https://www.law.cornell.edu/cfr/text/30/48.5 — new underground miner training |
| `W-MSHA-TIP` | https://arlweb.msha.gov/stats/top20viols/tips/75202.htm — ground support use, 57.3360 / 75.202 / 77.1000 |
| `W-MSHA-MISFIRE` | https://www.ecfr.gov/current/title-30/chapter-I/subchapter-K/part-57/subpart-B — re-entry waiting periods after a suspected misfire (via search summary of eCFR Part 57; eCFR itself redirects and could not be fetched here — **verify the exact times against § 56.6311 / § 57.6311 before shipping**) |
| `W-UK-MINES2014` | https://www.legislation.gov.uk/uksi/2014/3248/contents/made — The Mines Regulations 2014 |
| `W-UK-REG30` | https://www.legislation.gov.uk/uksi/2014/3248/regulation/30/made — storage of explosives |
| `W-UK-REG31` | https://www.legislation.gov.uk/uksi/2014/3248/regulation/31/made — rules required by reg. 12 (shotfiring, misfires, gas testing) |
| `W-UK-REG32` | https://www.legislation.gov.uk/uksi/2014/3248/regulation/32/made — duty to take ground control measures |
| `W-QLD-SHOTFIRER` | https://www.business.qld.gov.au/industries/mining-energy-water/explosives-fireworks/requirements/blasting/shotfirer-licence |
| `W-QLD-COMPETENCY` | https://www.rshq.qld.gov.au/resources/documents/explosives-and-fireworks/competency-requirements-shotfirer-licences.pdf (403 on fetch; content via search summary) |
| `W-WA-SHOTFIRING` | https://www.wa.gov.au/government/multi-step-guides/dangerous-goods-personal-licensing/dangerous-goods-shotfiring-licence-new |
| `W-UGTRAINING` | https://undergroundtraining.com.au/new-starter/pay-rates-rosters/ |
| `W-SYNERGIE` | https://synergieaustralia.com.au/the-most-in-demand-roles-in-mining/ |
| `W-SEEK` | https://au.seek.com/career-advice/role/miner/salary |
| `W-GLASSDOOR-UGOP` | https://www.glassdoor.com.au/Salaries/underground-operator-salary-SRCH_KO0,20.htm |
| `W-JOOBLE` | https://au.jooble.org/salary/underground-mining |

**Local** — see §0.1.

---

*Compiled 2026-09-04. Research only; no files under `src/` were modified.*
