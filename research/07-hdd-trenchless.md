# 07 — HDD and trenchless technology

Research pack for **Drillity I The Game**, closing the gap identified in
`DESIGN_EXPANSION.md` §1 and §5 (HDD: *"geometry is wrong — drawn as a vertical
hole; no steering, no locator, no pullback"*).

**Scope.** The HDD process end to end; the other trenchless methods, each of
which is a different machine; the real crew; the machines as silhouettes to
model; the hazards; and a concrete mechanics proposal for the long-section
profile band.

**Rules obeyed.** Every claim carries a source — a local filename in
`C:\Users\henri\Downloads\` or a URL. Anything unsourceable is marked
`UNVERIFIED` or cut, per `PLATFORM_TRUTH.md` Part C. Manufacturer and
association names appear **only as citations**; no real model designation may
ship as in-game content (`DOMAIN.md` §6).

**Units.** Sources are overwhelmingly US-customary. Every figure is given in the
source's own units first, with the SI conversion in brackets. Conversions are
mine; the arithmetic constants are 1 lbf = 4.44822 N, 1 ft·lb = 1.35582 N·m,
1 US gal = 3.78541 l, 1 in = 25.4 mm, 1 ft = 0.3048 m, 1 psi = 6.89476 kPa.

---

### Source key

| Key | Source |
|---|---|
| `[DTD]` | `DTD-Glossary-of-HDD-Terminology.pdf` — Directed Technologies Drilling Inc., *Glossary of Terms for HDD Environmental Drilling*, June 2009 (local, `C:\Users\henri\Downloads\`) |
| `[PERF]` | `perforator_drill_pipes_22.pdf` — drill pipe catalogue, HDD section (local) |
| `[PPI12]` | PPI *Handbook of PE Pipe*, Ch. 12 "Horizontal Directional Drilling" — https://conduitcalc.plasticpipe.org/pdf/chapter12.pdf |
| `[GP1]` | *HDD Good Practice Guidelines — Part 1*, The Driller — https://www.thedriller.com/articles/86381-hdd-good-practice-guidelines-part-1 |
| `[GP3]` | *HDD Good Practices Guidelines — Part 3*, The Driller — https://www.thedriller.com/articles/85293-hdd-good-practices-guidelines-part-3 |
| `[GP4]` | *HDD Good Practices Guidelines — Part 4*, The Driller — https://www.thedriller.com/articles/86394-hdd-good-practices-guidelines-part-4 |
| `[SIZE]` | *What Size HDD Rig?*, The Driller — https://www.thedriller.com/articles/85848-what-size-hdd-rig |
| `[APE]` | Alliance for PE Pipe, *Section 02XXX Horizontal Directional Drill*, rev. 12/2023 — https://pepipe.org/wp-content/uploads/2024/02/2023-HorizontalDirectionalDrill.pdf |
| `[SHORE]` | IBP576_03 *Horizontal Directional Drilling (HDD) for Shore Approach Applications* — https://www.osti.gov/etdeweb/servlets/purl/20987431 |
| `[DCA-IR]` | Distribution Contractors Association, comments on FERC draft HDD guidance, 26 Dec 2018 — https://dcaweb.org/wp-content/uploads/2024/05/DCA-Comments-on-FERC-Draft-Guidance-on-HDD_122618-FINAL.pdf |
| `[DCAE]` | DCA Europe, *HDD Technique* — https://dca-europe.org/hdd-technology?lang=en |
| `[HK]` | Herrenknecht, *HDD Rig* product page — https://www.herrenknecht.com/en/products/productdetail/hdd-rig/ |
| `[WIKI-DB]` | Wikipedia, *Directional boring* — https://en.wikipedia.org/wiki/Directional_boring |
| `[TT-FRAC]` | *How to Evaluate Hydraulic Fracture Risk in HDD Design*, Trenchless Technology — https://trenchlesstechnology.com/how-to-evaluate-hydraulic-fracture-risk-in-hdd-design/ |
| `[JBT]` | *HDD: How the Drill Bit is Steered*, JB Trenchless — https://www.jbtrenchless.com/portfolio/horizontal-directional-drilling-how-the-drill-bit-is-steered/ |
| `[MB-R]` | *How to Properly Measure Your Reamer and Choose the Right Size*, Melfred Borzall — https://www.melfredborzall.com/blog/hdd-tips/measure-reamer-right-size.html |
| `[MB-T]` | *13 Weird HDD Terms and Their Definitions*, Melfred Borzall — https://www.melfredborzall.com/blog/hdd-tips/13-weird-hdd-terms.html |
| `[VM-MUD]` | *Drilling Fluid Management Drives Success on Large Diameter HDD*, Vermeer Pro Tips — https://protips.vermeer.com/underground/2024/05/15/drilling-fluid-management-drives-success-on-large-diameter-hdd-projects/ |
| `[HSG47]` | HSE, *Avoiding danger from underground services*, HSG47 3rd ed. 2014 — https://www.hse.gov.uk/pubns/books/hsg47.htm · full text: https://www.powerandcables.com/wp-content/uploads/2017/07/HSG47-UK-HSE-Avoiding-Danger-From-Underground-Services.pdf |
| `[AKK]` | Akkerman, *Methods* comparison table — https://www.akkerman.com/methods/ |
| `[AKK-AB]` | Akkerman, *Auger Boring* — https://www.akkerman.com/methods/auger-boring/ |
| `[AKK-PT]` | Akkerman, *Pilot Tube* — https://www.akkerman.com/methods/pilot-tube/ |
| `[AKK-MT]` | Akkerman, *Microtunneling* — https://www.akkerman.com/methods/microtunneling/ |
| `[AKK-PJ]` | Akkerman, *Pipe Jacking & Utility Tunneling* — https://www.akkerman.com/methods/pipe-jacking-utility-tunneling/ |
| `[WIKI-MT]` | Wikipedia, *Microtunneling* — https://en.wikipedia.org/wiki/Microtunneling |
| `[WIKI-PR]` | Wikipedia, *Pipe ramming* — https://en.wikipedia.org/wiki/Pipe_ramming |
| `[WIKI-PB]` | Wikipedia, *Pipe bursting* — https://en.wikipedia.org/wiki/Pipe_bursting |
| `[TP-SPB]` | Trenchlesspedia, *Static pipe bursting* — https://trenchlesspedia.com/definition/2661/static-pipe-bursting |
| `[TP-PPB]` | Trenchlesspedia, *Pneumatic pipe bursting* — https://trenchlesspedia.com/definition/2660/pneumatic-pipe-bursting |
| `[TRACTO]` | TRACTO, static pipe bursting product family — https://en.tracto.com/v/products/grundoburst |
| `[PJA-SZ]` | Pipe Jacking Association, *Preferred pipe sizes* — https://www.pipejacking.org/viewdocument/show/~assets~pj~uploads~publications~Preferred_pipe_sizes.pdf |
| `[PJA-HE]` | Pipe Jacking Association, *Guidance on the design of hand excavated pipejacks*, rev. Sep 2006 — https://www.pipejacking.org/viewdocument/show/~assets~pj~uploads~publications~PJAGuidanceV2.pdf |
| `[WIKI-CIPP]` | Wikipedia, *Cured-in-place pipe* — https://en.wikipedia.org/wiki/Cured-in-place_pipe |
| `[WIKI-SL]` | Wikipedia, *Sliplining* — https://en.wikipedia.org/wiki/Sliplining |
| `[F1962]` | ASTM F1962-20, *Standard Guide for Use of Maxi-Horizontal Directional Drilling…* — https://store.astm.org/f1962-20.html (title/scope only; standard not read) |
| `[BLS]` | US BLS OEWS, *47-5023 Earth Drillers, Except Oil and Gas*, May 2023 — https://www.bls.gov/oes/2023/may/oes475023.htm |
| `[EUROSTAT]` | Eurostat, *Hourly labour costs*, 2025 — https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Hourly_labour_costs |

---

# A. The HDD process, step by step

HDD has exactly **three phases**, and every source agrees on them: pilot bore,
reaming (borehole enlargement), pullback (installation of the product pipe)
`[DCAE]` `[SHORE]` `[HK]` `[DCA-IR]`. Everything else is detail hanging off
those three.

The single most important framing correction for the game: **the rig sits on a
slant and pushes a curve, it does not sit level and drill down.** `[SHORE]`
calls the machine literally "a slant drill unit". `[HK]` describes the rig as a
main beam with a rack-and-pinion carriage that travels *along the inclined
frame*. Progress is measured as **bore length along the path**, not depth.

---

## A1. Design — the bore profile

### Entry and exit angles

These are two different angles and the industry names them from two opposite
points of view, which is a genuine trap:

| Angle | Value | Source |
|---|---|---|
| Entry angle (drill enters ground at the rig) | 8–16°, up to 20° on large-diameter projects | `[GP1]` |
| Entry angle, shore approaches | 8–16° | `[SHORE]` |
| **ASTM F1962**: "Bore Entry (Pipe exit) angle" | **8–20°** | `[APE]` citing ASTM F1962-11 |
| Exit angle (drill breaks ground at the far side) | 5–10° | `[GP1]` |
| **ASTM F1962**: "Bore Exit (Pipe entry) angle" | **relatively shallow, preferably < 10°** | `[APE]` citing ASTM F1962-11 |
| Exit angle, shore approaches | 3–6°, to ease transition to the offshore lay | `[SHORE]` |

> **Naming trap for the UI.** The *bore* entry is the *pipe* exit and vice
> versa: the drill starts at the rig, the pipe is pulled in from the far side.
> `[APE]` writes both names on the same line for exactly this reason. Pick one
> convention in the game and stick to it. Recommendation: label the rig end
> **ENTRY** and the far end **EXIT** (the driller's convention, `[GP1]`), and
> never use the pipe's convention in the HUD.

The rig is set back **3–20 ft (0.9–6.1 m) behind the entry point**, depending on
rig size and entry angle `[GP1]`.

### The bore profile shape

The ideal profile is a fixed five-part sequence `[GP1]`:

```
  straight tangent (inclined)  →  upward sweeping curve  →  horizontal segment
                               →  upward sweeping curve  →  straight tangent (exit)
```

`[SHORE]` describes the same thing as "straight tangents and long radius arcs",
and adds the reason for the tangent at the start: it is drilled *before* the
curve is introduced. `[GP1]` gives the two reasons the entry tangent exists —
**to gain enough depth, and to get steering reaction**. A bit that has not yet
buried itself has nothing to push against.

The horizontal segment under the obstacle is the **sag bend** in ordinary
usage; `[SHORE]` calls it the elevation "providing the design cover", from which
"long horizontal runs can be made at this elevation before curving up towards
the exit point".

ASCII of the real geometry, for the section renderer:

```
 rig                        river / road / rail                       exit pit
  ▣                    ~~~~~~~~~~~~~~~~~~~~~~~~~                          ▣
  ┃╲  8–20°                                                        3–10° ╱
  ┃ ╲___                                                            ____╱
  ┃     ╲______                                              ______╱
  ┃            ╲____________________________________________╱
  ┃            ↑ sag bend / design depth of cover ↑
  ┃            ←—————— long radius arcs, R ≥ R_min ——————→
```

### Minimum bend radius

The rule the game should teach, and it is confirmed verbatim:

> **A general "rule-of-thumb" for the radius of curvature is 1200 times the
> pipeline diameter for steel line pipe.** `[SHORE]`

Arithmetic identity worth putting in the tutorial, because it is how drillers
actually say it: 1200 × D, with D in inches, is 1200 inches of radius per inch
of diameter — i.e. **100 ft of radius per inch of pipe diameter**. In SI that
is **1.2 m of radius per mm of diameter**, e.g. a 300 mm steel pipe wants
R ≥ 360 m.

Three qualifications, all sourced, and all of them good game content:

1. **The pipe is usually not what limits you — the drill rod is.** "More often,
   the permitted bending radius of the drill rod controls the curvature and thus
   significant bending stresses do not occur in the pipe." `[PPI12]`
2. **PE is far more flexible than steel.** SDR 11 PE can be cold bent to
   **25 × its nominal OD**; but to limit ovaling "some manufacturers limit the
   radius of curvature to a minimum of 40 to 50 times the pipe diameter"
   `[PPI12]`. So a PE crossing is bend-radius-limited by the *rod*, a steel
   crossing by the *pipe*.
3. **Curvature is expensive twice.** It induces bending stress *and* it raises
   pullback load through the **capstan effect** — "the increase in frictional
   drag when pulling the pipe around a curve due to a component of the pulling
   force acting normal to the curvature" `[PPI12]`. Higher tension then *reduces
   the pipe's collapse resistance* `[PPI12]`. This is the mechanical chain that
   makes an over-steered pilot bore fail at pullback, which is the mechanic
   proposed in §F.

Design instruction from `[PPI12]`: "creating as large a radius of curvature as
possible within the limits of the right-of-way"; minimise the number of curves,
maximise their radii, and avoid "extraneous curvature due to undulations
(dog-legs) from frequent over-correcting alignment".

### Depth of cover

There is no single universal number, and the sources are explicit about *why*:

- The governing rule is that **HDD is deliberately deeper than structural need**
  — "Generally, HDD pipes are always installed at a deeper depth so as to
  prevent inadvertent returns from occurring during the boring." `[PPI12]`
- The opposing rule from the specification side: "The depth of the directional
  drilling shall be the minimum necessary to prevent surface heave" `[APE]`.
- Maximum depth is set by clearance from crossed utilities `[APE]`.
- Clearance between adjacent services: **250 mm, or 1.5 × the diameter of the
  pipe being laid, whichever is greater**; for electricity cables, clearance for
  maintenance should be **approximately 300 mm** `[HSG47]` §169.
- Utility search radius before drilling: locate all buried structures within
  **10 ft (3.0 m)** of the drill path for mini-HDD, **25 ft (7.6 m)** for
  maxi-HDD `[PPI12]`.
- Avoid entry/exit elevation differences greater than **50 ft (15.2 m)**
  `[PPI12]`.

**Game reading:** depth of cover is a *tension*, not a target. Too shallow →
frac-out. Too deep → longer bore, more curvature to get back up, higher pull
load. That is a slider, not a constant.

### Accuracy tolerances — these are the scoring numbers

| Quantity | Tolerance | Source |
|---|---|---|
| Installed bore path, vertical | **± 6 in (± 152 mm)** | `[APE]` |
| Installed bore path, horizontal | **± 2 ft (± 0.61 m)** | `[APE]` |
| Guidance system accuracy, vertical | **± 2 % of borehole depth** at depths up to 100 ft (30.5 m) | `[APE]` |
| Guidance system accuracy, horizontal | **within 2 ft (0.61 m)** | `[APE]` |
| Guidance system required tracking depth | 40 ft (12.2 m), or 20 ft (6.1 m) below design path, whichever is greater | `[APE]` |
| Survey record interval | at least once **per drill pipe length or 25 ft (7.6 m)**, whichever is more frequent | `[APE]` |

> The survey interval is the game's natural tick: **one locator reading per
> rod**. Note the implication that a drill rod on a large rig can exceed 25 ft
> — otherwise the "whichever is more frequent" clause would be dead text.

---

## A2. Pilot bore — slide vs rotate

### The two steering systems

**Soft ground — slant-face bit (no motor).** The bit has "an asymmetrical
leading edge" `[JBT]`. To steer:

> "rotation is stopped and the drill head slanted face of the bit is
> preferentially oriented in the borehole. The drill rig then pushes the entire
> drill string forward. As the slanted face of the drill bit is pushed against
> the soil, the entire assembly is deflected in the desired direction." `[GP3]`

To go straight, you **rotate**: "rotates the drill bit while applying thrust to
maintain a straight bore path" `[JBT]`.

Bits are made in a "flat" construction and a more popular **"bent"**
construction, "giving a two-plane slanted-face for more aggressive steering"
`[GP3]`.

**Hard ground — mud motor with a bent sub.** "Directional control with mud
motors is attained by a small bend (or bent sub) in the motor or drill housing
just behind the cutting head, which serves the same function as the slant on the
face of a slanted-face bit" `[GP3]`. `[HK]` gives the bend magnitude as
**approximately 2°**. `[JBT]` describes the same assembly: "a bent sub at the
drill head houses an internal drill motor, which allows the drill bit to rotate
independently of the outer drill string."

A pneumatic **air hammer** variant exists, using compressed air rather than a
motor `[JBT]`; `[GP4]` notes that "as rock hardness increases, the penetration
rate of percussive drilling surpasses that of rotary drilling."

### The duty cycle — the numbers that make this a game

| Parameter | Value | Source |
|---|---|---|
| Drill string rotation with a bent assembly | **< 50 rpm, typically ~30 rpm** | `[GP3]` `[GP4]` |
| Why | "the assembly oscillates in the bore when rotated and may be severely damaged or prematurely worn if rotated at excessive speeds" | `[GP3]` |
| After a steering correction | rotation must be started "slowly and carefully… to assess bore restrictions" | `[GP4]` |
| Steering correction size | "Steering corrections should be gradual and remain within the allowable bend radius" | `[GP1]` |
| Limit on how hard you can slide | "There are limits to which the rods can be pushed before they deflect excessively" | `[DTD]` s.v. *deflection* |
| Advancing too fast | produces a **dry hole** — "the drilling tools advance beyond the drilling mud" | `[DTD]` s.v. *dry hole* |

**How far you can steer per rod — the honest answer.** No source gives a
degrees-per-rod figure; it is a function of the rod's allowable bend radius, the
face offset and the fraction of the rod drilled in slide. `UNVERIFIED` as a
number. But the *model* is fully sourced and is the right one for the game:
sliding the whole rod at full face offset produces the tightest curve the rod
can physically make (its minimum bend radius, `[PPI12]`); sliding a fraction of
the rod produces a proportionally gentler curve; rotating produces zero
curvature `[JBT]`. §F3 builds the control on exactly that.

### The hard-rock spread — a complete, sourced equipment gate

`[GP4]` gives the minimum kit for very hard rock, which is an excellent
progression gate for the game's shop:

| Item | Minimum | SI |
|---|---|---|
| Rig thrust | 50,000 lb | 222 kN |
| Drill pipe OD | 2⅞ in | 73 mm |
| Pilot bore, tricone roller bit | 4¾ in | 121 mm |
| Mud motor OD | 3⅜ in | 86 mm |
| Mud pump capacity | 135 gpm | 511 l/min |

And the wall: "Penetration rates become slow and expensive when unconfined
compressive strengths exceed 40,000 psi" `[GP4]` — **276 MPa**, which is well
inside the game's existing UCS vocabulary (`PLATFORM_TRUTH.md` Part C §3).

For percussive HDD: high-velocity air **up to 6,000 ft/min (30.5 m/s)** clears
cuttings, plus **1–3 gpm (3.8–11.4 l/min)** of water or water-foam mixture
whose *only job* is to cool the tracking transmitter `[GP4]`. That is a lovely
detail — in percussion HDD the flush slider is partly a *sonde thermal
management* control.

### Drill pipe

`[PERF]` (local) confirms the product category and, usefully, the class
vocabulary the game already uses:

- "Friction welded and integrally forged HDD drill pipes" `[PERF]`
- "HDD drill pipes for many drill rig types **from Mini to Maxi**" `[PERF]`
- Optional hard banding as wear protection `[PERF]`

This lines up with `DOMAIN.md` §4's HDD connection family (Firestick
1.66"–2.875" = 42–73 mm OD; forged HDX; API REG/IF/FH/NC; Beadlock/BECO/Cubex).
The hard-rock minimum of 2⅞ in (73 mm) `[GP4]` sits exactly at the top of that
OD band — so the game's connection facet and its rock gate agree without any
invention.

**Rod length:** `UNVERIFIED`. The only usable inference is `[APE]`'s "per drill
pipe length or 25 ft, whichever is more frequent", which implies rods longer
than 25 ft (7.6 m) exist on large rigs.

Terminology from `[DTD]`: **pin** = the male threaded end of a drill rod;
**box** = the female thread. Use these; they are already in `DOMAIN.md`'s
register.

---

## A3. Locating — the walkover locator and the sonde

### What the sonde is and what it broadcasts

The **sonde** (= **transmitter**) is "the downhole component of an electronic
locating system that is positioned directly behind the drill bit in the drill
string. The device has gravity sensing accelerometers that allow determination
of the sondes pitch and roll." `[DTD]`

It does **two separate things**, and the distinction matters for the HUD:

1. It **transmits data** — pitch and roll — by radio (or by wire, see below).
2. It **emits a magnetic field**, whose shape the locator interprets to get
   horizontal position and depth. `[DTD]`

### What the locator reads

The **locator** is "a hand-held electronic device, operated by a steering
technician on a drilling crew" `[DTD]`. Its display presents **depth, pitch,
and rotary orientation** for the steering technician to record, and it also
**transmits that data to a remote display at the drill rig** so the driller sees
the same numbers `[DTD]`. That remote unit is called, plainly, the **remote**
`[DTD]`.

**Pitch** is "the vertical angle of the drillhead… measured in either percent or
degrees. **Most walkover systems use percent** while inertial or wireline
systems measure in degrees." `[DTD]` — a real, cheap, high-authenticity HUD
detail: the walkover HUD should show **%**, and only the gyro/wireline HUD
should show **degrees**.

**Roll / clock position** is the steering control:

> "The operator aligns the drill bit using a clock-face system: **12 o'clock
> steers up, 9 o'clock steers left, 6 o'clock steers down**" `[JBT]`

(so 3 o'clock steers right; `[JBT]` gives 12, 9 and 6 explicitly).

### The locate ritual — front locate and rear locate

The sonde's magnetic field "is hourglass in shape when viewed in map view; in
front of the sonde the field is positive and behind the field is negative"
`[DTD]`.

- **Front locate point** — "the point in the magnetic field created by the sonde
  where the field is both positive and oriented vertically" `[DTD]`
- **Rear locate** — "the point… where the field is both negative and oriented
  vertically" `[DTD]`

The locator technician physically walks to these points. This is why the locator
is *on top of the bore*, ahead of and behind the bit — which is the whole basis
of the electrical-strike hazard in §E7.

### Where walkover fails, and what replaces it

`[DTD]` is unusually direct about the failure modes:

> "this data can sometimes be distorted by local interference from electrical or
> electronic equipment or ferrous masses" `[DTD]`

and, on the position specifically: "The accuracy of the over bit position is
affected by ferrous metals (either in the ground or on the ground surface) that
can warp the orientation of the magnetic field." `[DTD]`

The escalation ladder, in order of cost:

| Tier | System | When | Source |
|---|---|---|---|
| 1 | **Walkover** — battery sonde, hand-held receiver | needs physical surface access directly above the bore path | `[DTD]` |
| 2 | **Wireline sonde (cable sonde)** — battery replaced by a conductor drawing power from the rig; a length of wire must be threaded through **every rod** as it is added | deeper bores, or electronic interference; boosts the signal | `[DTD]` |
| 3 | **Surface-coil system** — a surveyed wire coil on the ground is pulsed with DC to create a magnetic field of *known* orientation, sensed downhole | interference, or no line of sight | `[DTD]` |
| 4 | **Inertial / gyro guidance** — gyroscopes and accelerometers on a wireline, computing position in 3D | "deep and long bores that have precise bore path requirements"; used "when boring depth, surface obstructions, and/or radio interference preclude the use of a walkover" system | `[DTD]` |

`[DTD]` puts a number on tier 1's ceiling: "**For deep installations (75+ feet)**
or areas with other obstructions or interference, a different navigation system
may be required" — **~23 m**.

Independent accuracy figures for the deep systems `[WIKI-DB]`:
- wire-line magnetic: over **2 km** with an accuracy of **2 %**
- gyro-based: up to **2 km** with **less than 1 m** position error

For long/offshore crossings, a **magnetic steering tool** is used: "a tri-axis
magnetometer to determine the tool position relative to the earth's local
magnetic field. A tri-axis accelerometer package… relative to the earth's axis.
Together, the data output… yield the tool attitude. The attitude includes the
**inclination** of the steering tool and the **tool face**." `[SHORE]` Each
successive set of measurements gives an incremental position, summed to plot the
actual drill path `[SHORE]`.

> **Design consequence.** The walkover HUD is *local and absolute* (a person
> standing over the bit reads its depth directly). The gyro HUD is *cumulative
> and relative* (position is integrated from attitude). That is a genuine
> gameplay difference and §F5 uses it.

### Strike detection

`[APE]` requires, as equipment: "The rig shall be grounded during drilling and
pull-back operations. There shall be a system to **detect electrical current from
the drilling string** and an **audible alarm** which automatically sounds when an
electrical current is detected." `[DTD]` names the device: **strike alert** — "a
protective device used while drilling that sounds an alarm if the drill string
contacts a buried electrical utility."

---

## A4. Reaming / backreaming

### What the reamer is and which way it goes

A **back reamer** is "a tool designed to enlarge a pilot hole… usually employed
by attaching it to the drill string once the drill head exits the ground (in a
surface to surface installation)" `[DTD]`. It is pulled *back* toward the rig.

A **forward reamer** does the same job pushed *away* from the rig, and is what
you must use for a **blind well / single-entry well** — one drilled and completed
from one end only, where "the pilot bit is removed from the borehole" and a
forward reamer is advanced through the pilot `[DTD]`. `[SHORE]` notes forward
reaming has also been advantageous on some shore approaches.

Critically, for the animation: **"A complete drill string is in the borehole at
all times, regardless of the position of the reamer."** `[DCAE]` As the reamer is
retracted, "additional drill rods are added behind it, to maintain a continuous
string of drill steel through the borehole" `[DTD]`. The rig is simultaneously
pulling at one end and the crew is adding rod at the other.

### Pass sizing — the rule

The industry rule, stated twice, identically, and it is a **minimum of two
criteria**:

> Final bore diameter = the **lesser of** (product diameter + 12 in) **or**
> (1.5 × product diameter). `[GP1]` `[GP4]`

Corollaries and cross-checks:

| Statement | Value | Source |
|---|---|---|
| Normal over-sizing | **1.2 – 1.5 ×** the diameter of the carrier pipe | `[PPI12]` |
| Reaming enlargement (European framing) | typically **30–50 % larger** than the pipeline diameter | `[HK]` |
| Small products, ≤ 8 in (203 mm) | minimum **2 in (51 mm) annular space** — i.e. 4 in (102 mm) larger than the product | `[GP1]` |
| Number of reaming passes | typically **0–3**; more may be required for larger diameters | `[GP1]` |
| Rule of thumb, plainly | "1.5× bigger than the outside diameter of the pipe you're pulling in" | `[MB-R]` |

`[MB-R]` gives the *judgement* around the rule, which is what turns it into a
decision rather than a constant:

| Condition | Adjustment |
|---|---|
| Solid rock | can reduce **closer to pipe diameter** — no collapse risk |
| On-grade bores (gravity sewer) | drill as tight as possible without squeezing the pipe |
| Clay | strictly 1.5 × **or add extra clearance** — clay swells when wet |
| Unstable material (cobble, sand) | hold 1.5 × for easier pullback |
| Short bores (< 150 ft / 46 m) | can use less clearance |
| Long bores | ensure space for cuttings you cannot reach |
| Always | account for couplings, which can be **up to 2 in (51 mm) wider** than the pipe |

`[APE]` states the reason for the *upper* bound explicitly: "Minimize potential
damage from soil displacement or settlement by limiting the ratio of the bore
hole to the product size."

### Why you upsize in stages

Two sourced reasons:

1. **Cuttings load.** "The larger the hole, the more important it is to mix the
   cuttings into a slurry with the drilling fluid before and during product
   installation" `[GP4]`. A single huge pass generates more cuttings than the
   annulus can carry.
2. **Hole stability.** "The stability of the uncased drill channel is essentially
   ensured by the hydrostatic pressure of the drilling fluid" `[DCAE]` — the mud
   column, not the rock, is holding the hole open, and each size step is a step
   change in what that column has to support.

### The swab pass

"Prior to pullback, a final reaming pass is normally made using **the same sized
reamer as will be used when the pipe is pulled back** (swab pass). The swab pass
cleans the borehole, removes remaining fine gravels or clay clumps and can
compact the borehole walls." `[PPI12]`

Vocabulary `[MB-T]`: to **swab** is "to clean out a bore hole for easier pullback
of product pipe"; a **pig** is "a stabilizer barrel used to swab the hole".

### Reamer types — distinct silhouettes

| Type | What it is | Source |
|---|---|---|
| **Fly cutter** | "Style of reamer that has an open blade configuration. Also sometimes called a 'wagon wheel'." | `[MB-T]` |
| **Compaction reamer** | "enlarges a borehole diameter through compaction of the soil surrounding it" — note it is *bad* for a well screen, because it destroys hydraulic communication | `[DTD]` |
| **Wing cutter / wing reamer** | "A reaming tool with wing-shaped extensions… used to effectively mix the soil cuttings with the drilling fluid for effective removal" | `[DTD]` |
| **Barrel / pig** | stabiliser barrel, swabbing | `[MB-T]` |
| **Hole opener** | `DOMAIN.md` §3 lists "Backreamers & Hole Openers" as the taxonomy node | `DOMAIN.md` |

Measuring a reamer, if the game ever wants a workshop minigame: lay a straightedge
parallel to the shaft across the top cutter, measure from the middle of the shaft
perpendicular to the straightedge, **double it** `[MB-R]`.

---

## A5. Pullback

### The four components of pull force

`[PPI12]` gives the ASTM F1962-based model. The terms, in plain language:

1. **Frictional drag** against the borehole and against the ground on the layout
   side. Coefficients: **≈ 0.25** between pipe and slurry (in the hole),
   **≈ 0.40** between pipe and ground (on the surface, before the breakover)
   `[PPI12]`.
2. **The capstan effect** at every curve — an exponential term, `exp(μ·θ)` for
   each entry/exit angle `[PPI12]`. This is why curvature is so expensive: the
   force multiplies rather than adds.
3. **Hydrokinetic drag** — the force of dragging the pipe through the moving mud
   slurry. "This hydrokinetic pressure is estimated to be in the **30 to 60 kPa
   (4 to 8 psi)** range" acting on the pipe's external surface area `[PPI12]`.
4. **Buoyant weight** — the net up- or downward force per metre, which depends
   entirely on whether the pipe is ballasted (below).

`[APE]` requires the contractor to submit, sealed by a licensed PE: maximum
allowable pipe loading limits; design radius including minimum radii for all
curves; pullback load calculation "based on proposed drill path plan and
profile"; confirmation that installation stress stays inside allowable pipe
stress; and buoyancy effect calculations.

### The numbers

| Quantity | Value | Source |
|---|---|---|
| Pullback speed | **1 to 2 ft/min (0.30–0.61 m/min)** | `[PPI12]` |
| Overpull allowance for stretch recovery | pull the nose out **3 % longer** than the total pull; worst case **4 % (40 ft per 1000 ft)** | `[PPI12]` |
| Consequence of exceeding max allowable pull load | "the Owner may request the drill be re-installed with new Polyethylene pipe **at the Contractor's expense**" | `[APE]` |

That last line is the game's failure economics, written by the industry.

### The swivel

> "A reamer is attached to the drill string, and then connected to the pipeline
> pullhead via a **swivel**. The swivel prevents any translation of the reamer's
> rotation into the pipeline string allowing for a smooth pull into the drilled
> hole." `[SHORE]`

`[DCAE]` says the same: "a swivel prevents rotation transfer to the pipe." It is
a required, separately-specified item on the equipment submittal `[APE]`.

A **Chinese finger** is the alternative/companion grip: "A woven wire device used
to pull materials into a bore… When it is pulled, it tightens on the material,
becoming tighter the harder it is pulled upon." `[DTD]`

### Buoyancy control — the "wet pull"

This is the single best under-modelled mechanic in HDD, and `[PPI12]` spells it
out:

> "**Filling the pipe with fluid significantly reduces the buoyancy force and
> thus the pulling force.** … **Most major pullbacks are done 'wet'.** That is,
> the pipeline is filled with water as it starts to descend into the bore (past
> the **breakover point**). Water is added through a hose or small pipe inserted
> into the pullback pipe." `[PPI12]`

And the failure chain if you do not:

> "The buoyant force pushing the empty pipe to the borehole crown will cause the
> PE pipe to 'rub' the borehole crown. During pullback, the moving drill mud
> lubricates the contact zone. **If the drilling stops, the pipe stops, or the
> mud flow stops**, the pipe — slightly ring deflected by the buoyant force — can
> push up and squeeze out the lubricating mud. The resultant **'start-up'
> friction is measurably increased**. The pulling load to loosen the PE pipe from
> being 'stuck' in the now decanted (moist) mud can be very high." `[PPI12]`

Mitigations, from the same passage: thicker (lower DR) pipe, wet pulls, and
**"stopping the pull only when removing drill rods."** `[APE]` lists "Effects of
ballasting plan on pipe pullback forces" as a required calculation.

### Why a stuck product pipe is catastrophic

- "the native soil tends to sediment and embed the pipeline when installation
  velocity and mud flow are stopped, thus allowing the soil to grip the pipeline
  and prevent forward progress or removal. Under such unfortunate stoppage
  conditions, **many pipelines may become stuck within minutes to only a few
  hours**." `[PPI12]`
- "the possibility of recovering from a 'stuck pipe' situation **greatly
  diminishes with time**" `[SHORE]`
- "Loss of circulation could cause a locking up and possibly overstressing of the
  pipe during pullback." `[PPI12]`

Protection: "During pullback it is advisable to monitor the pulling force and to
use a **'weak link'** (such as a pipe of higher DR) mechanical break-away
connector or other fail-safe method to prevent over-stressing the pipe."
`[PPI12]` — i.e. the industry deliberately installs a fuse. That is a purchasable
upgrade in the game's shop.

### As-builts

"Obtain 'as-built' drawings based on the final course followed by the **reamer**
and the installed pipeline. The gravity forces may have caused the reamer to go
**slightly deeper than the pilot hole**, and the **buoyant pipe may be resting on
the crown of the reamed hole**." `[PPI12]`

That is a beautiful, free piece of game truth: **the pipe does not end up where
the pilot went.** The reamer sags, the pipe floats. The as-built is a third
curve, between the two.

---

## A6. Drilling fluid — the whole job

### What the mud does

`[PPI12]`, condensed — the mud must:

- **reduce drilling torque**
- **give stability and support** to the bored hole
- have **sufficient gel strength to keep cuttings suspended** for transport
- **form a filter cake** on the borehole wall that contains the water in the
  fluid
- **provide lubrication** between the pipe and the borehole on pullback

`[DTD]` adds the same list for bentonite specifically, plus: it is inexpensive;
it prevents inflow of formation water; it has relatively high viscosity and
density; and it has "relatively high lubricity". **Gel strength** is defined
precisely: "the shear stress measured at low shear rate after a mud has set
quiescently for a period of time (10 seconds and 10 minutes in the standard API
procedure)" `[DTD]`.

**Filter cake** `[DTD]`: "The cake that forms along the walls of the borehole,
composed of layered mineral platelets in bentonite-based drilling mud. Filter
cake creates a barrier between the borehole and the formation, limiting the
amount of drilling mud needed to complete the borehole and preventing influx of
groundwater." `[MB-T]` says it "seals the borehole, preventing the flow of
liquids from the borehole into the native soil."

**After the job:** "Drilling muds are thixotropic and thus thicken when left
undisturbed after pullback. However, unless cementitious agents are added, the
thickened mud is **no stiffer than very soft clay**. Drilling mud provides little
to no soil side-support for the pipe." `[PPI12]` — which is why the oversized
hole means the pipe must carry earth load without side support `[PPI12]`.

### The chemistry

| Material | What it is | Source |
|---|---|---|
| **Bentonite** | sodium montmorillonite clay; swells on hydration, "the individual bentonite lattice structures swell to several times their original size" | `[DTD]` `[DCA-IR]` |
| **Soda ash** (sodium carbonate) | "used to soften the water and reduce pH of the drilling fluid water" | `[DCA-IR]` |
| **Polymers** | "may also be used to enhance the properties of drilling fluids to overcome challenging drilling conditions" | `[DCA-IR]` |
| **Biodegradable polymer (biopolymer) mud** | "a blend of naturally-derived vegetable gums that create long polymer chains when hydrated… break down to simple sugars and water after the well screen has been installed" — corn starch, guar, xanthan | `[DTD]` |
| **Enzyme breaker / hypochlorite** | injected to accelerate the breakdown of biopolymer mud | `[DTD]` |
| **Surfactant** | "used to prevent formation materials from **balling** and sticking to drilling tools" | `[DTD]` |

The trade-off, verbatim and worth a tooltip: bentonite's advantages during
drilling "become liabilities during well operation" because it is very difficult
to remove from a horizontal well afterwards; the biopolymer alternative costs
"several times that of bentonite for equal volumes" `[DTD]`.

### Annular pressure and frac-out

**Definition.** "Inadvertent returns (IRs) are defined as **unintended surface
release of drilling fluids** during HDD operations." `[DCA-IR]`

**Mechanism**, from two independent sources:

> "During HDD operations, the cuttings are transferred through the annulus of the
> drilled hole using drilling fluid. For this drilling fluid is subject to
> pressure to overcome hydrostatic fluid pressure and cutting transfer pressure.
> **This pressure may cause the formation to fracture or IRs to occur through
> pre-existing fractures in the formation.**" `[DCA-IR]`

> "If the borehole becomes obstructed, collapses, or the fluid pressure becomes
> too great inside the borehole, the fluid pressure can fracture the surrounding
> formation, creating a pathway for the fluid to migrate from the borehole,
> typically upward to the ground surface." `[DTD]` s.v. *frac out*

**When the risk is highest — this is the key gameplay fact:**

> "The maximum risk of formation fracture and IR to occur during the HDD
> operation is **when the pilot hole is drilled**. This is because, in a stable
> hole, the annular space is the **minimum** during the pilot hole phase."
> `[DCA-IR]`

DCA therefore recommends recording and monitoring annular pressure **during the
pilot hole phase**, and explicitly does *not* recommend requiring it during
reaming, "because the risks of IR during this phase is minimal" `[DCA-IR]`.

**Where the risk is highest:**

> "higher risks for IR are in **soft clay formations and highly fractured rock
> formations** where drilling fluid can release to surface through pre-existing
> fractures. **Cobbles, boulders, and high gravel content formations** are also
> susceptible to high risks of IRs primarily because of challenges related to
> hole stability. The annular pressure required to transfer the larger cuttings
> and through unstable hole is generally high and therefore IR risks
> significantly increase." `[DCA-IR]`

**How the allowable pressure is computed.** The **Delft method**, "developed from
Dutch cavity expansion research and published by the U.S. Army Corps of Engineers
in 1998", remains "the standard when evaluating the risk of hydraulic fracture
for HDD installations" `[TT-FRAC]`. Three steps `[TT-FRAC]`:

1. Estimate the **formation limit pressure** — the soil's resistance to
   fracturing, from total stress and shear strength.
2. Calculate the **required drilling pressure** — hydrostatic (depth-dependent)
   plus hydrodynamic (friction-dependent on hole length).
3. Compute the **factor of safety** = resisting ÷ driving.

`[TT-FRAC]` notes USACE moved to a more conservative approach in 2020 with
stricter 2023 engineering regulations for levee projects.

> **This is the game's frac-out model, already built.** Risk rises with
> *shallower cover* (less hydrostatic resistance), with *longer hole* (more
> hydrodynamic pressure needed), with *higher flush*, and with the ground class.
> The existing `drilling.js` already has `ecdPerFlush` — this is the same idea.

**Prevention.** `[TT-FRAC]`: proper cuttings removal and hole conditioning;
careful soil shear strength selection; **maintaining full drilling fluid returns
throughout**; and targeted profile design that routes the bore through
higher-strength layers.

**Relief holes / burp holes.** `[APE]` requires the Engineer's approval of "the
location and all conditions necessary to construct **relief holes** to relieve
excess pressure". `[MB-T]` gives the field name: **burp hole** — "A hole dug
along the bore path to relieve downhole pressure to help prevent inadvertent
returns or hydrolocking."

### The correct response to a frac-out

Two sources, and they are *not* saying the same thing — which is itself worth
modelling as a tension between the contractor and the spec.

**The specification's procedure** `[APE]`:

> "in the event that inadvertent returns or returns loss of drilling fluid occurs
> during pilot hole drilling operations, the Contractor shall **cease drilling,
> wait at least 30 minutes, inject a quantity of drilling fluid with an
> appropriate viscosity and then wait another 30 minutes**. If mud fracture or
> returns loss continues, the Contractor shall cease operations and notify the
> Owner."

**The contractors' position** `[DCA-IR]`:

> "**It is not a good practice to stop, terminate or close a project down in
> cases of IRs.** It is a good practice to implement IR mitigation and cleanup
> plan and continue with the drilling operation. **Stoppages of operation often
> cause the degradation of the drill hole and increase potential of further IRs,
> collapsed hole, increased string torque, lodged tooling or stuck pipe.**"

Also required: a **12 in (305 mm) minimum berm** maintained around the drill rig,
mixing system, entry and exit pits and recycling systems "to prevent spills into
the surrounding environment"; pumps and/or vacuum trucks of sufficient size to
convey excess fluid to storage; mobile spoil removal equipment on site during all
drilling, pre-reaming and pullback; immediate notification, containment and
clean-up `[APE]`.

### What to monitor

| Parameter | Where | Source |
|---|---|---|
| Drilling fluid **pressures and flow rates** — continuously, recorded, measured at the pump — during pilot, reaming **and** pullback | rig | `[APE]` |
| Pumping rate, pressures, **viscosity and density** | mud system | `[APE]` |
| **Filtrate loss and rheology** (DCA's addition to the FERC list) | mud system | `[DCA-IR]` |
| Annular pressure, **during the pilot hole phase** | downhole pressure sub | `[DCA-IR]` |
| Fluid returns, **thrust force, torque** — "typically indicators of IRs before or while they occur" | rig | `[DCA-IR]` |
| Surface walk-out or **drone inspections** at defined frequencies | the route | `[DCA-IR]` |
| Axial tension readings, constant insertion velocity, mud flow circulation/exit rates, footage installed | pullback | `[PPI12]` |

Note `[APE]` lists a **downhole pressure sub** as a separately-specified item of
equipment — i.e. a purchasable upgrade that *turns the frac-out gauge on*. That
is a superb shop item: without it, the player flies blind on annular pressure.

Mud motors specifically: "It is important to have functional fluid flow and
pressure gauges when drilling with any tooling, but it is **essential** when
drilling with mud motors", where the critical parameters are distance from bit to
steering tool, bend angle, fluid volume, off-bottom pressure, **stall pressure**
and differential pressure `[GP4]`. Mud motors need "much higher fluid volumes
than rotary methods, but the majority of the fluid can be recycled and reused"
`[GP4]`.

---

## A7. Mud recycling and disposal on site

**The requirement.** The equipment spread must include "a drilling fluid mixing,
delivery and recovery system of sufficient capacity", "a **drilling fluid
recycling system to remove solids from the drilling fluid so that the fluid can
be re-used**", and "a **vacuum truck** of sufficient capacity to handle the
drilling fluid volume" `[APE]`.

**The mixing system** shall be "a self contained, closed, drilling fluid mixing
system… of sufficient size to mix and deliver drilling fluid" and shall
"**continually agitate** the drilling fluid during operations" `[APE]`. Water
must be potable; water and additives "mixed thoroughly and be absent of any
clumps or clods"; and the crew is told to "**vary the fluid viscosity to best fit
the soil conditions encountered**" `[APE]`. The delivery system has in-line
filters to keep solids out of the drill pipe `[APE]`.

**The recycling system** "shall separate sand, dirt and other solids from the
drilling fluid to render the drilling fluid re-usable. Spoils are separated from
the drilling fluid will be stockpiled for later use or disposed" `[APE]`.
`DOMAIN.md` §3 group C already names the components: **Mud Pumps · Mixing &
Recycling · Mud Tanks · Shale Shakers · Desanders & Desilters · Drilling Fluids
& Additives** — use exactly those names.

**The economics, with the only hard percentages anyone publishes:**

> "if you can use reclaimers and retain **70 % to 80 %** of the drilling fluid
> that is being pumped down the hole and reuse **90 % to 100 %** of that recycled
> fluid, you've reduced those dumping costs dramatically." `[VM-MUD]`

`[VM-MUD]` also names the real site constraints, all of which are game
constraints: large-diameter bores need big volumes; **exit-side** fluid
management in urban environments with limited space; and **vacuum truck capacity
limitations during back-reaming**. And the framing line: "The drilling fluid is
the bloodline of HDD."

**Disposal and site restoration.** Recovered spoil is either reused in the hole
opening operation or "hauled by the Contractor to an approved location or landfill
for proper disposal"; the contractor must "thoroughly clean the project area of
any fluid residue upon completion of installation and replace any and all plants
and sod damaged, discolored or stained by drilling fluids" `[APE]`.

**Fluid volume vs hole volume.** The volume that must be pumped exceeds the
geometric bore volume, often substantially — this is stated in the HDD Good
Practices series but I could only retrieve it via a search snippet, not from the
page itself. Mark `UNVERIFIED` pending a direct read of Part 2.

**Rod wiper / "doughnut".** "A rubber or synthetic grommet placed over the drill
rods during pullback to strip excess mud from the rods before they are stowed"
`[DTD]`; the field name is **doughnut** — "the rubber rod wiper at the front of
the drill rig that wipes mud off the drill pipe as it pulls back" `[MB-T]`. A
tiny, cheap, extremely authentic bit of rig animation.

---

# B. The other trenchless methods

Each of these is a **different machine with a different silhouette, a different
pit arrangement and a different KPI**. The game should never let one rig do two
of them (`DESIGN_EXPANSION.md` §4).

The single most useful comparison table anyone publishes `[AKK]`:

| Method | Diameter (OD) | Nominal drive length | Groundwater | Grade control |
|---|---|---|---|---|
| **Pilot tube** | 4–48+ in (102–1219 mm) | ~400 ft (122 m), decreasing with diameter | above **and** below | yes |
| **Auger boring** | 12–72 in (305–1829 mm) | ~400 ft (122 m) | **above only** | directional **and** non-directional |
| **Microtunneling** | 30–114 in (762–2896 mm) | ~2,000 ft (610 m), increasing with diameter | above **and** below | yes |
| **Pipe jacking / utility tunneling** | 48–168 in (1219–4267 mm) | 2,000+ ft (610+ m) | above, and select conditions below | yes |
| **Rehabilitation** | 30–102 in (762–2591 mm) | ~2,500 ft (762 m) | above and below | n/a |

Contrast with HDD `[SIZE]`: up to 48 in (1219 mm) pipe and up to 6,500 ft
(1,981 m) — HDD wins on **length**, loses on **grade control**. That is the
choice the contract board should present.

---

## B1. Auger boring (horizontal auger boring, HAB)

**When you choose it.** A road or rail crossing in non-pressurised ground,
**above the water table** `[AKK]`, where you need a steel casing and you do not
need HDD's length. Also called **jack-and-bore** `[AKK-AB]`.

**How it works** `[AKK-AB]`:

> "a trenchless method to install steel casing from a launch shaft to a reception
> shaft with excavation done via a **rotating cutterhead driven by a series of
> augers inside the casing pipe**."

Spoil "exits through the auger string that is powered by the auger boring machine
in the launch shaft" `[AKK-AB]`. Two things move at once: the casing is **jacked**
forward, and the auger inside it **rotates** to carry the spoil back.

**The machine — what it looks like.** The auger boring machine sits **in the
launch shaft, on a track**, and pushes along that track; the shaft is "typically
**40 feet** [12.2 m]" long to accommodate **20-foot (6.1 m) pipe sections**
`[AKK-AB]`. Silhouette: a long, low, open steel frame in the bottom of a shored
rectangular pit, with a rotating drive head at the back end that both spins the
auger and shoves the whole string forward. It is the only trenchless machine that
lives *in a hole* and is *longer than it is tall*.

**Tooling.** Steel casing (the product pipe), auger flights inside it, cutting
head at the face. Note `DOMAIN.md` §3 already files **Auger Boring Tools** under
HDD & Trenchless.

**KPI — accuracy, and it splits cleanly into two grades** `[AKK-AB]`:

| Variant | Accuracy |
|---|---|
| **Unguided** — steered by water-level monitoring, auger tripping and shim adjustments | approximately **1 % of the casing diameter** |
| **Guided** | **± 1 in (± 25 mm)** from design grade and **± 3 in (± 76 mm)** from design alignment at any point |

That is a superb difficulty ladder: the unguided machine's tolerance *scales with
the pipe*, so a big casing is forgiving and a small one is brutal.

**Failure modes.** Above-water-table restriction is the hard one `[AKK]`; running
sand — "a hazard that can occur where excavations in the sand go below the water
table" `[MB-T]` — will flood the shaft and the auger.

**Torque/thrust figures:** `UNVERIFIED` — Akkerman's public pages give accuracy
and geometry but no force ratings.

---

## B2. Pilot tube / guided boring — the accuracy method

**When you choose it.** When you need HDD-class ease with **gravity-sewer-class
grade**, in displaceable soils, at short length. "All pilot tube systems are
suitable for **displaceable soils**. Installing pilot tubes in non-displaceable
soils, variable ground, and rock may be possible with additional tooling and
accuracy allowance." `[AKK-PT]`

**How it works.** "a multistage method of accurately installing a pipe to line
and grade by use of a **guided pilot tube followed by upsizing** to install the
pipe", integrating features of microtunneling, auger boring, pipe ramming and
HDD `[AKK-PT]`.

**KPI.** **± 1 in (± 25 mm)** grade, **± 3 in (± 76 mm)** alignment `[AKK-PT]` —
the same tolerance as guided auger boring, and roughly **6× tighter in the
vertical than HDD's ± 6 in (± 152 mm)** `[APE]`. That contrast alone justifies
having both methods in the game.

**Drive length.** ~400 ft (122 m) or less `[AKK-PT]` `[AKK]`.

**Guidance.** The theodolite-and-illuminated-target arrangement is the standard
description of this method, but Akkerman's public page does not state it — mark
`UNVERIFIED` and cite only the accuracy figures.

---

## B3. Pipe jacking and microtunnelling

These are two related methods separated by **one fact: whether a person is inside
the tunnel.**

### Microtunnelling — the definition has four hard requirements

`[AKK-MT]` gives the industry definition, and all four must hold:

1. **Remote controlled** — "Personnel entry is not required in the tunnel during
   normal operations."
2. **Guided** — to gravity-sewer accuracy.
3. **Pipe jacking** — "Product pipe is advanced by pipe jacking from the main
   launch pit."
4. **Face support** — "The system must be capable of providing positive face
   support."

Two families `[AKK-MT]`:

- **Slurry** MTBMs "monitor mechanical face pressure to counterbalance earth and
  hydrostatic loads through **slurry pressures**".
- **Auger / pilot-tube** systems balance the face "through an **earth plug**,
  advance rate control, auger rotation speed, and soil conditioning".

### The machines

**MTBM** — "Similar to larger tunnel boring machines", operated remotely from a
console using CCTV or gyro units to monitor location and orientation `[WIKI-MT]`.
Silhouette: a steel cylinder the diameter of the pipe, with a rotating cutterhead
face, articulated behind the shield for steering, umbilicals (slurry lines, power,
data) running back down the pipe string.

**Jacking frame** — sits in the launch shaft and "contains hydraulic rams that
generate **hundreds of tons of force**" to advance the machine and liner; the
entrance shaft must withstand these pressures `[WIKI-MT]`. `[AKK-PJ]`: "A
hydraulic jacking frame positioned in the launch shaft provides advancement forces
transmitted through the **product pipe itself**." Silhouette: a heavy steel cradle
at the bottom of a deep circular or rectangular shaft, with long rams pushing
against a **thrust/reaction wall** behind it.

**Interjacks** — "smaller jacks positioned between liner sections that push two
liner sections apart", distributing forces and preventing backward sliding
`[WIKI-MT]`. This is how you break a very long drive into force-manageable
segments.

**Guidance** — for man-entry pipe jacking, the operator inside the TBM steers
using "**a pipe laser** set to the desired line and grade" with a target inside
the machine `[AKK-PJ]`. `[WIKI-MT]`'s general note: "The laser is the basic
control device and it works with inclinometers and gyroscopes."

**Spoil removal** — for man-entry pipe jacking, excavated material transfers "into
specially designed **haul units** that carry the soil back to the launch shaft for
removal at the surface" `[AKK-PJ]`. For slurry MTBM, it goes out in the slurry
circuit `[AKK-MT]`.

### Friction control — the mechanic that makes this a game

`[WIKI-MT]`:

- **Over-cutting** creates a **0.5–1.5 in (13–38 mm)** gap between the tunnel and
  the liner.
- **Bentonite slurry** is injected into that gap "to maintain pressure and prevent
  collapse".
- But over-cutting causes **subsidence**: on road/rail crossings a **35 mm** cut
  is reduced to limit subsidence to a maximum of **10 mm**.

That is a perfect two-sided slider: **more overcut = lower jacking force but more
settlement**; less overcut = tighter forces and a stalled drive. It is the direct
analogue of HDD's frac-out/bend-radius tension.

### Sizes and lengths

| Quantity | Value | Source |
|---|---|---|
| Microtunnelling diameter | **0.35–4 m** (~1–13 ft) | `[WIKI-MT]` |
| Microtunnelling diameter (Akkerman product range) | 30–114 in (762–2896 mm) | `[AKK]` |
| Microtunnelling drive length | ~2,000 ft (610 m) nominal, **increasing** with diameter | `[AKK]` |
| Pipe jacking diameter | 48–168 in (1219–4267 mm); "typical installations require 48-inch and above" | `[AKK]` `[AKK-PJ]` |
| Pipe jacking drive length | 2,000+ ft (610+ m) | `[AKK]` |
| Pipe jacking shaft | "typically a **40 ft** [12.2 m] long pit" | `[AKK-PJ]` |
| **Preferred jacking pipe sizes, clay** | 200, 300, 450, 600 mm nominal | `[PJA-SZ]` |
| **Preferred jacking pipe sizes, concrete** | 450, 600, 900, 1000, 1200, 1350, 1500, 1800, 1950, 2100, 2400 mm nominal | `[PJA-SZ]` |
| Ground suitability (pipe jacking) | "non-pressurized ground to weathered rock" | `[AKK-PJ]` |

**Man-entry limit.** The Pipe Jacking Association's guidance on *hand* excavated
pipejacks sets a hard floor: pipe internal diameter **< 1200 mm — "Not
acceptable"**. At 1200 mm ID and greater: **25 m** guide length in cohesive soils,
**40 m** in non-cohesive, "not more than two drive lengths", and rock "not
recommended" `[PJA-HE]`. The reason is health, not geotechnics: hand-arm vibration
exposure action level **2.5 m/s²** (limit 5.0 m/s²) and noise exposure action level
**80 dB(A)**, both normalised over 8 hours `[PJA-HE]`.

**KPI.** Jacking force (kN) against the reaction wall's capacity, and line-and-grade
deviation. Exact kN figures for jacking frames: `UNVERIFIED` — the only public
statement found is "hundreds of tons of force" `[WIKI-MT]`, which at 100–900 tonnes
is roughly **1,000–9,000 kN**, but that is my arithmetic on a vague phrase, not a
sourced range.

**Failure modes.** Jacking force runaway (friction climbs until the frame or the
pipe joint fails — the answer is lubrication and interjacks `[WIKI-MT]`);
settlement/heave at the surface from overcut `[WIKI-MT]`; and for man-entry work
the whole confined-space hazard list: inundation, methane and other atmospheric
contaminants, oxygen deficiency, fire and smoke, access and rescue `[PJA-HE]`.

---

## B4. Pipe bursting

**When you choose it.** Replacing an existing buried pipe **on its own line**,
without removing it — and optionally **upsizing** it. "a trenchless method of
replacing buried pipelines… without the need for a traditional construction
trench", using launching and receiving pits `[WIKI-PB]`.

**Host pipe materials.** "cast iron (CI), ductile iron, steel, plastic and other
**fracturable** pipe materials" `[TP-SPB]`. That word is the constraint: the host
must be brittle enough to break.

**Replacement pipe.** "HDPE pipe is the common replacement pipe" `[WIKI-PB]`;
pneumatic systems also install PVC and FRP `[TP-PPB]`.

### Static vs pneumatic — genuinely different machines

**Static** `[TP-SPB]`: **bursting rods** are pushed through the host from the
target pit and connected end to end; at the far end the crew attaches the
**cutting blades**, the **conical expander** and the product pipe; then the whole
string is **pulled back**, the cutter fragmenting the host while the expander
pushes the debris into the surrounding soil and the new pipe follows into the
void. Purely a pulling machine — no percussion.

**Pneumatic** `[TP-PPB]`: a percussive tool "operates similarly to a jackhammer,
delivering repeated impacts". A **winch at the exit** retrieves the bursting head
while the head advances "through the old pipe via pneumatic force". New pipe
follows automatically behind the tool. Insertion is "through an existing manhole
or insertion pit".

**Common equipment** `[WIKI-PB]`: expander head with a smaller leading diameter to
guide through the existing pipe and a larger trailing (bursting) end; **fins** as
the contact points that break the pipe around its full circumference; a pulling
mechanism of "heavy interlocking links" forming a chain; and one or more hydraulic
power units.

**Silhouette.** Two pits and a cable. In the launch pit: a small compact frame
(static) or nothing but the pipe entry (pneumatic). In the reception pit: the
**pulling unit / winch**, which is the heavy end. Above ground on the launch side:
a long fused HDPE string on rollers, exactly like the HDD exit side. The
distinctive visual is the **rod chain** or **cable** disappearing into a manhole.

**Capacity.** Static systems replace "damaged pipes up to **ND 1,200**" `[TRACTO]`.
Upsizing "from 100 mm to 225 mm is well established", with projects on 36-inch
(914 mm) diameter and larger `[WIKI-PB]`.

**KPI.** Metres burst per shift, and whether the upsize ratio was achieved without
damaging adjacent services.

**Failure modes.** `[HSG47]` §168 names the one that matters: "if **moling or pipe
bursting** are undertaken **too near to other services or ducts, displaced soil may
damage or enter them**." The burst does not just break the host — it *displaces
ground*, and that ground has to go somewhere.

**Pulling forces in kN/tonnes:** `UNVERIFIED` — manufacturer pages did not expose
force ratings to retrieval.

---

## B5. Pipe ramming

**When you choose it.** "pipe and casing installations **under railway lines and
roads**, where other trenchless methods could cause **subsidence or heaving**"
`[WIKI-PR]`. It is the low-disturbance option, and the **unsteerable** one:
"pipe ramming lacks active directional control, making it preferable for shorter
distances and applications not requiring tight directional control, such as cable
installations" `[WIKI-PR]`.

**How it works.** "a trenchless method for installation of **steel pipes and
casings**" using **pneumatic percussive blows** to advance the pipe `[WIKI-PR]`.
The key geometric fact: the pipe's leading edge "remains almost always **open**"
and carries a soil-cutting shoe or special bands. This "creates a controlled
overcut that reduces friction and **channels excavated material inward rather than
compacting it externally**" `[WIKI-PR]` — which is exactly why it does not heave
the rail formation.

**Spoil removal.** Auger, compressed air, or water jetting. Short installations
are cleaned out *after* the pipe is fully placed; longer ones may need
mid-installation cleaning "to manage weight" `[WIKI-PR]`.

**Friction reduction.** Bentonite and/or polymer lubrication, "similar to
horizontal directional boring techniques" `[WIKI-PR]`.

**Sizes.** Over **500 mm (20 in)** diameter, "with larger installations common";
drive lengths "**30 metres or more** typically, extensible to much longer
distances"; primarily horizontal, though vertical is possible `[WIKI-PR]`.

**Silhouette.** A large pneumatic hammer clamped to the tail of a steel casing in
a launch pit, with a fat air hose running to a compressor on the surface. No mast,
no rotation, no carriage. The whole machine is a hammer and a hose.

**Distinction to state in the game's codex**, because it is the crispest line in
the trenchless family: "pipe jacking employs hydraulic jacks with active
navigation systems, whereas **pipe ramming uses percussion without directional
control**" `[WIKI-PR]`.

**KPI.** Metres per shift, and whether the alignment landed in the reception pit
at all — since you cannot steer, the setup *is* the skill.

---

## B6. Sliplining and CIPP — context only

**Sliplining** `[WIKI-SL]`: insert a smaller carrier pipe inside the existing one,
grout the annulus, seal the ends. In use since the 1940s. Carrier materials HDPE,
FRP, PVC; typical diameters **0.20–1.5 m (8–60 in)**. Two variants: **continuous**
(a long uninterrupted pipe pulled through between insertion and receiving pits) and
**segmental** (bell-and-spigot pieces lowered and pushed sequentially). Both
"require grouting the annular space between the two pipes" for stability and load
transfer. The drawback is unavoidable: **capacity loss**, because the new inner
diameter is the old pipe's ID minus twice the annulus and the liner wall.

**CIPP** `[WIKI-CIPP]`: "a trenchless rehabilitation method used to repair existing
pipelines" creating "a jointless, seamless pipe lining within an existing pipe". A
felt tube of polyester, fibreglass or carbon fibre is impregnated with resin
(polyester for mains, epoxy for laterals), inserted by pulling through or pushing
from downstream with water or air pressure, then cured — **steam or hot water** for
polyester, **UV light** for fibreglass. Diameters **0.1–2.8 m (2–110 in)**.

**Game role.** These belong in the **rehabilitation** contract family alongside
pipe bursting, not in the installation family. Akkerman groups rehabilitation as
30–102 in (762–2591 mm), ~2,500 ft (762 m) drives, no grade control `[AKK]`. They
are the "you cannot dig and you cannot replace, so you line it" answer.

---

# C. The professions

`DOMAIN.md` §7 gives Drillity Talent's three HDD roles — **HDD Operator, HDD
Locator, HDD Foreman**. The real crew is bigger, and every extra role is sourced
below. `DESIGN_EXPANSION.md` §5 counts HDD as one of Talent's industries with
**3 specialisations**, so the game only has to be *right*, not exhaustive — but
these are the roles.

## C1. The roles

### Rig operator / driller — `HDD Operator`

`[APE]` names them as a distinct qualified party: "Contractor's project manager,
**superintendent, drill operator and guidance system operator** assigned to
horizontal directional drilling shall be experienced in work of this nature".

**During the pilot bore:** works thrust and rotation; alternates slide and rotate
on the locator's call; watches torque, thrust, fluid flow and pressure; starts
rotation "slowly and carefully after steering to assess bore restrictions"
`[GP4]`; adds a rod every cycle; keeps the string off the rod's deflection limit
`[DTD]`. `[GP1]`: "Drill rig operator or superintendent maintains **daily
logbook**."

**During pullback:** watches the load cell against the safe pull load; keeps
"constant insertion velocity"; records "axial tension force readings… mud flow
circulation/exit rates, and footage length installed" `[PPI12]`; and **does not
stop the pull except to remove a rod** `[PPI12]`.

### Locator / tracking technician — `HDD Locator`

`[DTD]` calls the role the **steering technician**. `[GP1]`: "**Drill locator
tracks bore position and provides steering instructions**." `[APE]` calls the
same person the **guidance system operator** and requires separate documented
experience for them.

**During the bore:** walks the bore path above the bit; finds the front locate and
rear locate points to fix the horizontal position `[DTD]`; reads **depth, pitch,
roll/clock** off the receiver; records each reading — at least once per rod or
every 25 ft (7.6 m) `[APE]`; calls the clock position to the driller; and computes
deviation from the design path, which "shall be calculated and reported on the
daily log" `[APE]`.

This is the role that is **physically standing on top of a live drill string**,
which makes §E7 their hazard specifically.

### Mud / drilling-fluid technician (mud engineer)

`[DCA-IR]` is unambiguous that this is a real, separate, required competence:

> "Having **qualified drilling fluids personnel on staff or on contract** will be
> necessary to create and maintain drilling fluid properties. The properties that
> are required from a drilling fluid should be decided by the geology, equipment,
> and drilling practices."

**During the bore:** mixes to the ground — "vary the fluid viscosity to best fit
the soil conditions encountered" `[APE]`; keeps the mix free of "clumps or clods"
`[APE]`; monitors "pumping rate, pressures, viscosity and density" through pilot,
reaming and pullback `[APE]`, plus filtrate loss and rheology `[DCA-IR]`; manages
soda ash and polymer additions `[DCA-IR]`; and holds the SDSs for every additive
on site `[DCA-IR]`.

`DOMAIN.md` §7 already lists **Mud Engineer / Drilling Fluids** as a Talent
specialisation — this is the same person, working onshore.

### Vacuum excavator / vac truck operator

Two distinct jobs, both sourced:

1. **Potholing / daylighting.** A **pothole** is "a small hole excavated from the
   surface to a buried utility in order to provide **positive verification** of
   its location" `[DTD]`. `[HSG47]` requires exactly this verification step before
   mechanical plant is used, and `[PPI12]` notes "Crossing lines are typically
   exposed for exact location."
2. **Fluid and spoil recovery.** "a vacuum truck of sufficient capacity to handle
   the drilling fluid volume" is a mandatory part of the spread `[APE]`; vac trucks
   convey excess fluid from containment to storage/recycling `[APE]`; and vac truck
   capacity is a named bottleneck during back-reaming `[VM-MUD]`.

### Pipe crew / fusion technician

`[APE]` treats HDPE fusion as a **certificated trade with an expiry**, which maps
perfectly onto the game's best mechanic:

> "All high density polyethylene (HDPE) **fusion equipment operators shall be
> qualified**… must possess and be able to provide **written validation (card or
> certificate) of current, formal training** on all fusion equipment employed on
> the project, including training and proper use of the **data logging device**…
> **Training received more than two years prior to operation of the fusion
> equipment shall not be considered current.**"

That is `PLATFORM_TRUTH.md` Part B's "**expired = cannot mobilise**" rule,
occurring naturally in a real construction specification. Use it verbatim as a
mechanic: a **2-year fusion ticket** that lapses.

**During the job:** fuses the product string on the exit side; every joint is data-
logged; strings the pipe on rollers; fits the pull head and swivel. The relevant
standards, all named in `[APE]`: ASTM D2657 (heat-joining), D3261 (butt fusion
fittings), F2620 (heat fusion joining of PE pipe), F1055/F1290 (electrofusion),
F3190 (heat fusion equipment).

### Foreman / superintendent — `HDD Foreman`

`[APE]` names the **superintendent** among the four parties whose experience must
be documented in the bid. `[GP1]` makes them co-owner of the daily logbook with
the operator. Their real job is the plan: `[APE]` requires an approved work plan
covering drilling operations, drilling fluid management, spoils handling and
disposal, pipe pullback and pullback monitoring, prevention of inadvertent fluid
losses, QC and testing procedures, and a safety plan — **plus** a *supplemental*
work plan that pre-answers seven specific problems (listed in §E0 below).

### Survey / setting-out

`[APE]`: "Locate positions of entry and exit pits, **establish elevation and
horizontal datum for bore head control**, and lay out pipe assembly area." All
tracking is "relative to an established surface survey bench mark" `[APE]`. On
long crossings, "Topographic and bathymetric surveys are required" alongside the
geotechnical investigation `[SHORE]`.

At the end: **as-builts**. "Obtain 'as-built' drawings based on the final course
followed by the reamer and the installed pipeline… essential to know the exact
pipeline location and to avoid future third party damage." `[PPI12]` `[APE]` makes
this a payment condition: "Final acceptance including final payment… will not be
made until directional bore logs have been submitted."

## C2. Crew size

`UNVERIFIED` as published numbers. What *is* sourced is the minimum set of
distinct competences that must be present on a job: drill operator, guidance
system operator, pipe joining (fusion) operator, drilling fluids personnel,
superintendent, project manager `[APE]` `[DCA-IR]` — **six named roles**, plus a
vac truck `[APE]`.

For the game, a defensible ladder built only from those roles (labelled as a
game-design choice, not a sourced fact):

| Class | Roles on site |
|---|---|
| Mini | operator + locator + labourer/vac = **3** |
| Midi | + fusion tech + foreman = **5** |
| Maxi | + mud technician + second vac + survey = **8** |

## C3. Pay

**This is the weakest-sourced part of this pack. Two real anchors, and neither is
an HDD day rate.**

**Anchor 1 — occupational wages (US, USD, May 2023)** `[BLS]`, SOC 47-5023 *Earth
Drillers, Except Oil and Gas* (18,010 employed):

| Percentile | Hourly | Annual |
|---|---|---|
| 10th | $19.50 | $40,560 |
| 25th | $23.00 | $47,840 |
| **Median** | **$27.24** | **$56,660** |
| 75th | $32.55 | $67,700 |
| 90th | $39.56 | $82,280 |
| Mean | $28.97 | $60,250 |

**Anchor 2 — employer hourly labour cost (EU, EUR, 2025)** `[EUROSTAT]`:

| Region / sector | € per hour |
|---|---|
| EU | 34.9 |
| Euro area | 38.2 |
| Germany | 45.5 |
| Sweden | 48.9 |
| **EU construction sector** | **31.5** (the lowest of the economic sectors) |

> **Read this correctly.** Eurostat's figure is **total employer labour cost**
> (wages + non-wage costs), *not* take-home pay and *not* a contractor day rate.
> `[BLS]` is a gross wage. They are not comparable and must not be presented as
> if they were.

**A defensible in-game derivation** — labelled in the design doc as a derivation,
never as a sourced fact. Take the EU construction hourly labour cost of €31.5/h
`[EUROSTAT]` as the **1.0× baseline** for an unskilled site hand and scale by role
using the BLS percentile spread `[BLS]` as the shape of the distribution
(10th→90th spans 0.67×→1.37× of the mean):

| Role | Multiplier | ≈ €/h | ≈ €/8 h day |
|---|---|---|---|
| Labourer / pipe crew | 0.85 | 27 | 215 |
| Vac truck operator | 1.00 | 32 | 250 |
| Fusion technician | 1.15 | 36 | 290 |
| **HDD Locator** | 1.20 | 38 | 300 |
| **HDD Operator** | 1.35 | 43 | 340 |
| Mud technician | 1.35 | 43 | 340 |
| **HDD Foreman** | 1.60 | 50 | 400 |

Round these to the nearest €10 in game. **Specific published EUR day rates for
HDD roles: `UNVERIFIED`.** If precise figures matter later, the sources to chase
are German collectively-agreed construction wage tables (Bau-Mindestlohn /
SOKA-BAU) and national salary surveys — neither was retrievable in this session.

## C4. Tickets and certifications

**Sourced, and directly job-gating:**

| Ticket | What it gates | Source |
|---|---|---|
| **HDPE fusion certification**, valid **2 years** | You may not operate fusion equipment. Written card/certificate required, including data-logger training. | `[APE]` |
| **Manufacturer training** on the specific drilling, drill-guidance and pipe-joining equipment, by "an authorized representative of the equipment manufacturer(s) or their authorized training agents" | You may not operate that machine. | `[APE]` |
| **Documented similar-project experience** for PM, superintendent, drill operator and guidance operator, submitted with the bid | The company may not bid. | `[APE]` |
| **Competence to use cable-locating equipment** — HSG47 requires that anyone using locating equipment is competent: knowledge, skills and experience to use it, interpret results and make safe decisions | You may not locate. | `[HSG47]` |
| **IR monitoring and management training** pre-construction, covering fluid returns, thrust force, torque and annular pressure as IR indicators, plus walk-out/drone inspection and the project's IR response plan | You may not work a monitored crossing. | `[DCA-IR]` |
| **Confined space / tunnelling competence** where man-entry pits and pipejacks are involved — the hazard list is explicit: inundation, methane and atmospheric contaminants, oxygen deficiency, fire and smoke, access and rescue | You may not enter. | `[PJA-HE]` |

`DOMAIN.md` §7 already lists the ground-side tickets the game should carry
(confined space, first aid, working at height, EN 791 rig safety). The HDD-specific
addition this research supports is the **2-year fusion ticket** and the
**locating-equipment competence** — both are real, both expire or must be
demonstrated, and both fit the "expired = cannot mobilise" rule exactly.

## C5. Career path

The ladder is legible from `[APE]`'s own hierarchy of documented competences, and
mirrors `DOMAIN.md` §7's Field Operations track:

```
 labourer / pipe crew
        ↓  (fusion ticket, 2-yr renewable [APE])
 fusion technician  ─────┐
        ↓                │
 vac truck operator      │
        ↓                ├──→ locator / guidance system operator  [APE][GP1]
 assistant operator      │            ↓
        ↓  (manufacturer training on the rig [APE])
 HDD Operator (drill operator)  ←─────┘
        ↓  (documented similar-project experience [APE])
 HDD Foreman / superintendent — owns the work plan, the daily log,
                                the IR response plan [APE][DCA-IR][GP1]
        ↓
 project manager
```

Note the genuinely interesting branch: **the locator is not junior to the
operator.** `[APE]` requires the *same* level of documented experience for the
"guidance system operator" as for the "drill operator", and `[GP1]` gives the
locator the authority — they "provide **steering instructions**". Model it as a
parallel specialisation, not a rung.

---

# D. The machines — distinct silhouettes

`[APE]` gives the canonical equipment list, which is exactly the model manifest:
1 HDD rig · 2 drilling system components · 3 downhole drilling assembly and
reaming equipment · 4 **downhole pressure sub** · 5 guidance and control system ·
6 pulling head · 7 swivels · 8 rollers · 9 solids separation and drill fluid
recirculation systems · 10 pipe fusion equipment.

## D1. The HDD rig — and the slant

**It is not vertical, and it is not horizontal.** `[SHORE]`: "A **slant drill
unit** is set up on the land site." `[APE]` describes the function precisely: "a
power system to **rotate, push and pull hollow drill pipe into the ground at a
variable angle** while delivering a pressurized fluid mixture to a guidable drill
(bore) head."

**Core components** `[HK]`: drill bit · bent sub (~2° curve) · break-out unit ·
drill rods · chassis · **carriage (main drive)** · erector unit · **main beam with
rack-and-pinion drive**.

**Silhouette to model.** A long inclined steel beam (the main beam) set at the
entry angle (8–20°, `[GP1]` `[APE]`), staked down at the low end, with a **carriage
that travels the full length of the beam on a rack and pinion** `[HK]`. The
carriage carries the rotary drive; it moves down the beam to push a rod in and
returns to pick up the next. At the low end, the **break-out unit** (the wrenches
that make and break the joint) and the **rod wiper / doughnut** `[DTD]` `[MB-T]`.
The whole assembly is anchored — it has to react up to its full thrust and
pullback into the ground.

**Five rig configurations exist and they are visually distinct** `[HK]` — a good
basis for the game's rig ladder without copying any model name:

| Configuration | Character |
|---|---|
| **Frame rig** | low weight, crane-dependent — arrives in pieces |
| **Trailer rig** | 2-axle, self-contained — tows behind a truck |
| **Crawler rig** | tracked, terrain-adaptable |
| **Modular rig** | containerisable — ships in ISO containers |
| **Compact rig** | urban-focused, small footprint |

**Class boundaries.** `[SIZE]` attributes the classification to the *HDD
Consortium*'s "HDD Good Installation Guidelines" (six member organisations
including NASTT and DCA):

| Class | Thrust / pullback | Torque | Mud pump | Pipe Ø | Bore length |
|---|---|---|---|---|---|
| **Small (mini)** | < 40,000 lb (**< 178 kN**) | < 4,000 ft·lb (**< 5.4 kN·m**) | < 75 gpm (**< 284 l/min**) | small | "not excessive" |
| **Medium (midi)** | 40,000–100,000 lb (**178–445 kN**) | 4,000–20,000 ft·lb (**5.4–27.1 kN·m**) | 50–200 gpm (**189–757 l/min**) | up to 16 in (**406 mm**) | up to 2,000 ft (**610 m**) |
| **Large (maxi)** | > 100,000 lb (**> 445 kN**) | > 20,000 ft·lb (**> 27.1 kN·m**) | > 200 gpm (**> 757 l/min**) | 16–48 in (**406–1219 mm**) | up to 6,500 ft (**1,981 m**) |

Cross-checks from other sources:

- `[PPI12]`: mini-HDD handles pipe "up to 10" or 12"" (254–305 mm) and is used
  primarily for urban utility construction; conventional/maxi HDD handles pipe "as
  large as 48"" (1219 mm) with pullback "ranging up to several hundred thousand
  pounds".
- `[WIKI-DB]`: the top of the market is tractor-trailer units at **1,320,000 lb
  (5,871 kN ≈ 599 tonnes)** thrust/pullback and **150,000 ft·lb (203 kN·m)**
  rotary; small portable rigs run **5,000–100,000 lb (22–445 kN)**.
- `[HK]` (European framing): pulling forces **45 to 500 tonnes** (≈ **441–4,905
  kN**), power packs **278 to >1,000 kW**, borehole diameters **0.2–2 m**.
- `[DCAE]` (European utility framing): "max. pulling force between **10 t
  (100 kN) and 30 t (300 kN)**" is the *common* rig size for utility work, with
  crossings "more than 2 km" and pipe "up to a diameter of around DN 1400".
- Hard-rock minimum spread: 50,000 lb (222 kN) thrust `[GP4]`.

> **Game mapping.** These four independent sources agree well enough to define
> three rig tiers with confidence: **mini < 178 kN**, **midi 178–445 kN**,
> **maxi > 445 kN**, with a super-maxi tier up to ~5,900 kN for the marquee river
> crossing. Use kN in the UI (`PLATFORM_TRUTH.md` Part C §3 mandates kN for force).

## D2. Drill pipe box / rod magazine

`[HK]` names the **erector unit** as a core component — the mechanism that moves a
rod from storage into the drill axis. Rods themselves: friction-welded and
integrally forged, mini to maxi, optional hard banding `[PERF]`. Terminology: pin
(male) and box (female) ends `[DTD]`.

**Silhouette.** A rack of parallel steel tubes alongside or under the main beam,
with an arm that swings one rod at a time up into line with the carriage. On maxi
rigs it is a substantial separate structure; on mini rigs, a compact vertical or
horizontal cassette. Rod length `UNVERIFIED`; > 25 ft (7.6 m) is implied on large
rigs `[APE]`.

## D3. Mud mixing and recycling

**Mixing system:** "a **self contained, closed**, drilling fluid mixing system…
of sufficient size to mix and deliver drilling fluid", which "shall **continually
agitate** the drilling fluid during operations", with **in-line filters** on the
delivery side `[APE]`.

**Recycling system:** "shall separate sand, dirt and other solids from the drilling
fluid to render the drilling fluid re-usable" `[APE]`. `[WIKI-DB]` calls the unit a
**reclaimer**: it "separates drill cuttings and maintains proper viscosity".
Components, per `DOMAIN.md` §3-C: mud pumps, mixing & recycling, mud tanks,
**shale shakers**, **desanders & desilters**.

**Silhouette.** A skid or trailer-mounted stack: a hopper at the top for dry
bentonite and soda ash; a bank of open rectangular tanks; a **vibrating shaker
screen** on top of the first tank throwing wet sand into a spoil pile; **cyclone
cones** (desander, then desilter) mounted above the tanks with their characteristic
inverted-cone shape and an underflow spraying grit out the bottom. Everything
sits inside a **300 mm berm** `[APE]`. Performance target for the animation:
70–80 % of the pumped fluid comes back, 90–100 % of that goes back down `[VM-MUD]`.

## D4. Vacuum excavator

Required as "a vacuum truck of sufficient capacity to handle the drilling fluid
volume" `[APE]`, and named as a capacity bottleneck during back-reaming `[VM-MUD]`.

**Silhouette.** A truck with a large horizontal cylindrical debris tank, a boom-
mounted flexible suction hose at the rear or side, a water tank and a blower. Two
jobs, two poses: parked at the pit sucking mud, or out on the route with the hose
in a small square **pothole** over a utility `[DTD]`.

## D5. Entry and exit pit arrangement

`[APE]`: entry and exit pits "are to be of sufficient size to contain the expected
return of drilling fluids and soil cuttings", each ringed by a **12 in (305 mm)**
berm.

- **Entry side** (rig side): the pit is at the toe of the slant beam, catching
  returns that come back up the annulus and run out around the drill pipe.
- **Exit side**: the pit catches returns at the far end; beyond it, the **product
  pipe string on rollers** ("pipe rollers… of sufficient size to fully support the
  weight of the pipe while being hydro-tested and during pull back operations.
  Sufficient number of rollers shall be used to prevent excess sagging" `[APE]`),
  the fusion machine, and the pull head + swivel.

**Site footprint** `[PPI12]`:

| Item | Dimensions |
|---|---|
| Maxi-HDD entry plot, 1,000 ft (305 m) crossing | 100 ft × 150 ft (**30 m × 46 m**) |
| Maxi-HDD entry plot, 3,000+ ft (914+ m) crossing | 200 ft × 300 ft (**61 m × 91 m**) |
| Exit location, most crossings | 50 ft W × 100 ft L (**15 m × 30 m**) |
| Exit location, large diameter | 100 ft × 150 ft (**30 m × 46 m**) |
| Pipe fusing/stringing corridor | starts ~75 ft (23 m) beyond the exit point, **35–50 ft (11–15 m)** wide |

`[PPI12]` also notes the compensating virtue: "The HDD process takes very little
working space versus other methods."

## D6. The other methods' machines

| Method | Machine | Silhouette |
|---|---|---|
| **Auger boring** | Auger boring machine | Long low frame **on a track in the bottom of a ~40 ft (12.2 m) shaft** `[AKK-AB]`; rotating drive head at the rear both spins the auger and jacks the casing. Lives in a hole. |
| **Pilot tube / guided boring** | Pilot tube guidance machine | Same shaft-and-frame family, plus a surveying instrument at the launch end sighting a target in the pilot head `[AKK-PT]` (target mechanism `UNVERIFIED`). |
| **Microtunnelling** | **MTBM** + jacking frame + separation plant + control container | MTBM: a steel cylinder the diameter of the pipe with a rotating cutterhead, articulated for steering, remote-operated from a surface console via CCTV/gyro `[WIKI-MT]`. Jacking frame: heavy steel cradle at the bottom of a deep shaft with long hydraulic rams, "hundreds of tons" `[WIKI-MT]`, pushing against a reaction wall. **Nobody is underground.** |
| **Pipe jacking** | Jacking frame + shield/TBM (man-entry) | Same frame, bigger pipe (≥ 48 in / 1219 mm `[AKK-PJ]`), and **an operator inside** steering to a **pipe laser** target `[AKK-PJ]`, with **haul units** running spoil back to the shaft `[AKK-PJ]`. Add **interjacks** — jack rings set between pipe sections mid-drive `[WIKI-MT]`. |
| **Pipe bursting** | Winch / rod-pulling unit + bursting head | Two pits and a line. Reception pit holds the heavy pulling unit; launch pit feeds the fused HDPE string. Head: conical **expander** with a small leading nose, larger trailing burst end, and **fins** around the circumference `[WIKI-PB]`. Static = rod chain `[TP-SPB]`; pneumatic = percussive tool + winch `[TP-PPB]`. |
| **Pipe ramming** | Pneumatic ram | A large hammer clamped to the tail of a steel casing in a pit, fat air hose to a compressor. **No mast, no rotation, no carriage** `[WIKI-PR]`. |

---

# E. Hazards and the correct response

## E0. The industry's own hazard list

`[APE]` requires a *supplemental* work plan that specifically pre-answers seven
problems. This is the canonical HDD hazard table, written by the spec:

1. Obstructions along the bore path during reaming or pullback
2. Drill pipe or product pipe cannot be advanced
3. **Deviations from design line and grade exceed allowable tolerances**
4. **Drill pipe or product pipe broken off in the borehole**
5. Collapse of product pipe or excessive deformation
6. **Damage to existing utilities**
7. **Excessive subsidence or heave**

Every one of those is a game hazard. Below, each is given its read and its
response.

## E1. Utility strike — the big one

**The prevention regime.** In the UK the controlling document is **HSG47,
*Avoiding danger from underground services*, HSE, 3rd edition 2014** `[HSG47]`.
It applies to all sites "where work involves penetrating the ground at or below
surface level" and is aimed at everyone "involved in commissioning, planning,
managing and carrying out work on or near underground services" `[HSG47]`.

**A safe system of work has three basic elements** `[HSG47]` §22:

1. **planning the work**
2. **detecting, identifying and marking underground services**
3. **safe excavation / safe digging practices**

"These key elements complement each other, and **all three are essential**"
`[HSG47]` §23. Plans alone are not sufficient `[HSG47]` §39. Anyone using cable
locating equipment must be competent to do so `[HSG47]`.

**HSG47 addresses trenchless methods specifically** — §§167–171 — and this is the
passage the game should be built on:

> "The most widely used techniques are **directional drilling, impact moling,
> microtunnelling, pipe bursting and auger boring**." `[HSG47]` §167
>
> "Use plans, detecting devices and trial excavations to locate existing services
> **in the same way as for open-cut excavation methods**. The route of the device
> being used should then be planned accordingly to avoid colliding with, and
> damaging, other services." `[HSG47]` §168
>
> "Moles can be prone to **deflection from their original course** and, if there
> are existing services in the vicinity, you should use a **mole-tracking
> device**." `[HSG47]` §171

Clearances `[HSG47]` §169: minimum between adjacent services **250 mm or 1.5 × the
diameter of the pipe being laid, whichever is greater**; for electricity cables,
maintenance clearance **≈ 300 mm**. §170 adds that these vary with bore diameter
and "**the accuracy and reliability of the technique/equipment being used**" —
i.e. a better locator literally buys you a tighter corridor. That is a shop
upgrade with a mechanical consequence.

In North America the equivalent is the **one-call** regime: `[DCA-IR]` states the
duties plainly — "excavators notify the one-call center prior to excavation, and
facility operators… provide accurate maps, as-built documentation… and ensure
their facilities are accurately located before excavation activities commence. If
either party fails to meet their responsibility in the process, damage prevention
is compromised."

**Verification.** A **pothole** — "a small hole excavated from the surface to a
buried utility in order to provide **positive verification** of its location"
`[DTD]`. "Crossing lines are typically exposed for exact location" `[PPI12]`.

**What the crew sees first.** For an electricity strike, the **strike alert** — the
audible alarm from the current-detection system on the rig `[DTD]` `[APE]`. For a
gas or water main, loss or change of returns and a sudden torque change.

**The consequence of an electricity strike** `[HSG47]` §11: "Injuries are usually
caused by the **explosive effects of arcing current**, and by any associated fire
or flames that may result when a live cable is penetrated by a sharp object…
Typically, injuries are **severe — potentially fatal — burns to the hands, face
and body; electric shock is possible but less likely.**" `[HSG47]` §13 adds the
cascade: "Other nearby services, such as plastic gas pipes, may also be at risk
from damaged live electricity cables. This could result in explosions and a
greater fire risk."

## E2. Frac-out into a watercourse

**What the crew sees first.** Loss of returns at the entry pit, a drop in annular
pressure, and — the definitive sign — fluid appearing on the surface or in the
water. Monitoring includes "walk out or drone inspections" of the route at defined
frequencies `[DCA-IR]`, precisely because the first evidence is often *away from
the rig*.

**Correct action — and note the two schools:**

- **By the specification** `[APE]`: cease drilling → wait ≥ 30 min → inject a
  quantity of drilling fluid of appropriate viscosity → wait another 30 min → if
  it continues, cease and notify the Owner.
- **By the contractors** `[DCA-IR]`: implement the mitigation and clean-up plan and
  **continue drilling**, because "stoppages of operation often cause the
  degradation of the drill hole and increase potential of further IRs, collapsed
  hole, increased string torque, lodged tooling or stuck pipe."

Always: immediate notification, immediate containment and clean-up, mobile spoil
removal equipment kept on site throughout `[APE]`. **Relief / burp holes** to bleed
downhole pressure `[APE]` `[MB-T]`.

**Prevention** `[TT-FRAC]`: cuttings removal and hole conditioning; maintaining
full returns; and **targeted profile design** through higher-strength soil layers
to raise the formation limit pressure.

## E3. Stuck product pipe

**What the crew sees first.** Pull force climbing away from the trend at constant
speed; or a spike after any pause.

**Why it is catastrophic.** The soil "tends to sediment and embed the pipeline
when installation velocity and mud flow are stopped" and pipelines "may become
stuck **within minutes to only a few hours**" `[PPI12]`; recovery chance "greatly
diminishes with time" `[SHORE]`; and loss of circulation "could cause a locking up
and possibly overstressing of the pipe during pullback" `[PPI12]`.

**Correct action.** Prevention only, and it is all pre-emptive `[PPI12]`: thicker
(lower DR) pipe; **do a wet pull**; and **stop the pull only when removing drill
rods**. Fit a **weak link** — a higher-DR pipe section or mechanical break-away
connector — so that if it does go, the pipe parts at a chosen point instead of
being overstressed `[PPI12]`.

**Consequence if exceeded** `[APE]`: the Owner may require re-installation with new
pipe at the contractor's expense.

## E4. Drill pipe fatigue and twist-off

**The named failure** `[APE]` §I.4: "Drill pipe or product pipe **broken off in
borehole**." This must be pre-answered in the supplemental work plan — i.e. the
industry expects it.

**Causes, sourced:**
- Excessive rotation of a bent assembly: rotate over ~50 rpm and "the assembly
  oscillates in the bore… and may be **severely damaged or prematurely worn**"
  `[GP3]`.
- Over-pushing rods in slide: "There are limits to which the rods can be pushed
  before they **deflect excessively**" `[DTD]`.
- Rising string torque after a hole degrades — one of the four named consequences
  of stopping work during an IR `[DCA-IR]`.
- Excessive thrust in percussion drilling "may decrease penetration and increase
  impact shock transmission" `[GP4]`.

**What the crew sees first.** Torque climbing and becoming erratic; then torque
collapsing to nothing while rotation free-spins.

**Correct action.** Back rotation into the < 50 rpm band; start rotation "slowly
and carefully after steering to assess bore restrictions" `[GP4]`; reduce thrust;
condition the hole rather than force it. `DOMAIN.md`/`DESIGN_EXPANSION.md` §3
already name **twist-off** as an offshore hazard — this is the same failure on
land, and the same response.

## E5. Loss of locating signal

**What the crew sees first.** Depth and clock readings that jump, disagree with
the previous rod, or drop out entirely.

**Cause** `[DTD]`: "this data can sometimes be distorted by local interference from
**electrical or electronic equipment or ferrous masses**", and the over-bit
position specifically is "affected by ferrous metals (either in the ground or on
the ground surface) that can **warp the orientation of the magnetic field**."

**Correct action — the escalation ladder from §A3:** boost the signal with a
**wireline (cable) sonde**, drawing power from the rig rather than a battery
`[DTD]`; or move to a **surface coil** system with a surveyed, known-orientation
field `[DTD]`; or to **inertial/gyro** guidance, which is what you use "when boring
depth, surface obstructions, and/or radio interference preclude the use of a
walkover" `[DTD]`. Depth trigger: **75+ ft (≈ 23 m)** `[DTD]`.

**Never** guess and keep drilling: `[APE]` requires x, y, z recorded at least once
per rod, and deviations "calculated and reported on the daily log", with the
contractor obliged to "undertake all necessary measures to correct deviations and
return to design line and grade."

## E6. Hydro-lock and hole collapse

**Definition** `[DTD]`:

> "**hydro-lock** — A condition where the well casing and screens become 'locked'
> in the borehole during pullback. This occurs when **borehole collapse traps
> drilling [fluid] inside the borehole in front of or behind the well materials**.
> Pressure increases (or decreases) to the point where the drill can no longer pull
> the casing into the hole."

**Related condition** `[DTD]`: a **dry hole** — "the drilling tools advance beyond
the drilling mud. Typically caused by **trying to advance the borehole too
quickly**."

**Correct action.** `[GP4]`: the slurry must be displaced "in quantity equivalent
to the product pipe outer volume to prevent pressure buildup" — i.e. every cubic
metre of pipe you push in must displace a cubic metre of slurry out, or pressure
climbs. `[APE]`: "The pull back rate used shall **maximize the removal of soil
cuttings without building excess down hole pressure**", and relief holes may be
constructed to bleed it. `[MB-T]` names the field fix: the **burp hole**, dug
"along the bore path to relieve downhole pressure to help prevent inadvertent
returns **or hydrolocking**".

## E7. Electrical strike danger to the locator standing over the bore

This is the hazard that is *specific to HDD* and specific to *one person*, and it
is worth its own mechanic because the locator is, by the nature of walkover
locating, standing directly on top of the drill string `[DTD]`.

**The control, verbatim** `[HSG47]` §171:

> "Where you are using trenchless techniques, **all equipment should be effectively
> earthed at all times it is in use using an equipotential mat, as required, in
> case it hits a power cable and causes the machinery to become live.**"

`[APE]` requires the same at the rig: "The rig shall be **grounded** during drilling
and pull-back operations. There shall be a system to detect electrical current from
the drilling string and an **audible alarm** which automatically sounds when an
electrical current is detected." `[DTD]` names the device: **strike alert**.

**What the crew sees/hears first.** The strike alert alarm. Not a visual.

**Correct action.** Everyone off and away from the rig, the string and the ground
above it; nobody touches the machine; the utility owner is notified. The specific
danger is that **the machine and the ground around it become live**, which is why
the control is an *equipotential mat*, not gloves.

**Injury profile** `[HSG47]` §11: severe, potentially fatal **burns** from arcing —
not primarily electric shock.

## E8. Entry / exit pit collapse and confined space

Pits are shallow on HDD but real, and become full shafts on the pipe-jacking
family. The sourced hazard set for man-entry work `[PJA-HE]` is: noise · manual
handling · vibration · heat · dust and chemicals · contaminated water or soils ·
**inundation** · **methane and other atmospheric contaminants** · fire and smoke ·
**access and rescue** · **oxygen deficiency** · working space.

`[PJA-HE]`'s design questions are the correct game framing: "If there is a risk of
flooding/inundation — **how much time will be required for escape/rescue of the
miner(s)?**"

Vibration and noise are hard limits, not advice `[PJA-HE]`: hand-arm vibration
**exposure action level 2.5 m/s²**, **limit 5.0 m/s²**, normalised over 8 hours;
noise **exposure action level 80 dB(A)**. Exceeding the action level "will require
the introduction of preventative measures and planned health surveillance".

## E9. Subsidence and heave

Named as work-plan item 7 `[APE]`. Two mechanisms:

- **Heave during pullback** — `[APE]`: "Minimize heaving during pull back." Caused
  by excess downhole pressure; the response is the pullback rate.
- **Subsidence from overcut** — the microtunnelling case, quantified: a **35 mm**
  overcut is reduced on road/rail crossings to limit subsidence to a maximum of
  **10 mm** `[WIKI-MT]`.
- **Displaced soil from bursting/moling** — `[HSG47]` §168: "if moling or pipe
  bursting are undertaken too near to other services or ducts, displaced soil may
  damage or enter them."

## E10. Ground that HDD should not be in

`[WIKI-DB]`: problematic conditions are "**coarse gravel, boulders, excessive rock
strength, and karst formations**", though the method is suitable for clay, silt,
sand and rock generally. `[DCA-IR]` adds that cobbles, boulders and high gravel
content are also the high frac-out-risk formations because of hole instability.
`[GP4]` gives the strength wall: above **40,000 psi (276 MPa)** UCS, penetration
becomes "slow and expensive".

**Note the elegant overlap with the game's existing hazard set:** boulder strike,
cavity/karst void and fracture zone are already in `GAMEDESIGN.md` §3. In HDD they
do not just slow you down — they *raise frac-out risk* `[DCA-IR]`. Same hazard,
new consequence.

---

# F. Game mechanics proposal

This section is a design proposal, not sourced fact. Every number in it traces to
a citation above; where I have invented a mapping I say so.

## F1. The long-section profile band

`geology.js` gains `profileMode: 'profile'` (per `DESIGN_EXPANSION.md` §1). The
band's semantics change:

| Axis | Vertical mode (today) | Profile mode (HDD) |
|---|---|---|
| **X** | hole width (~1.6 units) | **along-bore station, in metres** |
| **Y** | depth, true metres, `viewMetres: 20` | **depth below ground, true metres** |
| **Scroll** | vertical, as depth grows | **horizontal, as station grows** |
| **Bit anchor** | `bitScreenFrac: 0.28` down the band | **0.38 across the band**, so the player sees more path behind than ahead |

**Vertical exaggeration.** Keep `viewMetres: 20` for Y — it is already tuned and it
keeps the shader lookup unchanged. Set the X window to **120 m of bore length**.
On the reference portrait device (~390 CSS px wide, band ~388 px tall) that gives
≈ 19.4 px/m vertically against ≈ 3.25 px/m horizontally — a **vertical exaggeration
of ≈ 6:1**, squarely inside the 5–10× range that `DESIGN_EXPANSION.md` §1 asks for
and that real HDD profile drawings use.

**Draw two rulers**, as a real profile drawing does: a vertical ruler in metres of
depth and a horizontal ruler in metres of station, each labelled with its own
scale, plus a small `V.E. 6:1` badge. This is not decoration — it is the thing that
stops a player misreading the curve as tighter than it is, and it is a genuine
piece of professional literacy.

**Above the band:** the ground surface line with the obstacle drawn on it — river,
road, rail or runway — plus the entry and exit pits at each end, and the located
utilities as small marked crossings with their HSG47 clearance envelopes (250 mm or
1.5 × Ø, `[HSG47]` §169) drawn as thin bands.

**Two curves, not one.** Draw the **design path** as a dashed line and the **actual
path** as the solid one the player is producing. At pullback, add the third: the
as-built, which sags below the pilot where the reamer ran deep and floats to the
crown where the pipe rode up `[PPI12]`.

## F2. The three sliders in HDD

| Slider | Pilot bore | Backream + pullback |
|---|---|---|
| **Feed** | **Thrust (kN)** on the string. ↑ROP, ↑torque, ↑deflection. Over-thrust in slide busts the bend radius; over-thrust in percussion "may decrease penetration and increase impact shock transmission" `[GP4]`. Also drives the **dry hole** risk — advancing beyond the mud `[DTD]`. | **Pullback force (kN)**, read against the **safe pull load** redline `[PPI12]` `[APE]`. |
| **Rotation** | **The slide/rotate axis** — see F3. | **Reamer rotation.** Torque gauge. Too fast stalls or damages the reamer; too slow fails to mix cuttings into slurry `[GP4]`. |
| **Flush** | **Mud flow (l/min).** Cleans, stabilises, builds filter cake, lubricates `[PPI12]`. **And raises annular pressure → frac-out risk** `[DCA-IR]`. | **Mud flow.** Must displace slurry "equivalent to the product pipe outer volume" `[GP4]` or pressure builds → **hydro-lock** `[DTD]`. |

The existing `drilling.js` already has `ecdPerFlush` — annular pressure as a
function of flush. HDD uses the same term, now with cover depth as the second
input.

## F3. Slide vs rotate as a touch control

**The Rotation slider gets three zones**, drawn as three labelled bands, matching
the real duty cycle `[GP3]` `[GP4]` `[JBT]`:

```
 ┌──────────┬────────────────────────┬──────────────────────┐
 │  SLIDE   │   MOTOR  1–50 rpm      │   ROTATE  >50 rpm    │
 │  0 rpm   │   (sweet spot ~30)     │   ⚠ assembly wear    │
 └──────────┴────────────────────────┴──────────────────────┘
      ↑ steering authority = 100%          ↑ steering = 0%
```

- **Bottom detent = SLIDE (0 rpm).** Steering authority 100 %. ROP reduced.
- **1–50 rpm = MOTOR band**, green sweet spot at ~30 rpm `[GP3]`. Straight-ahead
  drilling with a mud motor. This *is* the groove band for HDD.
- **> 50 rpm = red.** Faster ROP but accumulating assembly damage — "may be
  severely damaged or prematurely worn if rotated at excessive speeds" `[GP3]`.
  Feeds the twist-off hazard (§E4).

**The clock dial.** When the Rotation slider is in the SLIDE detent, a **12-position
radial dial** rises over the section band. The player drags around it to set the
face. Snap to 12 positions — a real locator reports clock position, not continuous
degrees. Labels: **12 = UP, 3 = RIGHT, 6 = DOWN, 9 = LEFT** `[JBT]`.

**Steering authority is proportional to slide distance, not to time.** Track
`slideMetres` for the current rod. Model:

```
curvature_this_rod = (slideMetres / rodLength) × sin(faceOffsetFromNeutral) × κ_max
```

where `κ_max = 1 / R_min` and `R_min` is the *rod's* minimum bend radius (the
binding constraint, `[PPI12]`), which the rig's spec sheet publishes. Sliding a
whole rod at 12 o'clock produces the tightest legal climb; sliding half a rod
produces half the curvature; rotating produces zero.

**HUD readout during a slide:** `SLIDE 1.4 / 3.0 m · CLOCK 12 · Δ +0.9°`.

This is the single most important change: **it makes the player alternate**, which
is what an HDD driller actually does. `[GP1]` gives the discipline in one line:
"Steering corrections should be gradual and remain within the allowable bend
radius."

## F4. The design corridor as the scoring target

**The corridor.** Draw the design path ± tolerance as a translucent band. Use the
real installed tolerances `[APE]` as the S-grade target and relax by difficulty:

| Grade target | Vertical half-width | Source basis |
|---|---|---|
| **S** | ± 0.15 m | `[APE]` ± 6 in |
| A | ± 0.30 m | — |
| B | ± 0.50 m | — |
| C / D | ± 0.80 m | — |

At 6:1 vertical exaggeration, ±0.15 m draws as ~2.9 px either side of the design
line — thin but legible against a 388 px band, and it *should* feel tight.

**The groove, reinterpreted.** `GAMEDESIGN.md` §3's groove becomes: needle inside
the corridor **and** pitch matching the design tangent **and** rotation inside the
motor band. Hold all three → combo ramps 1.0 → 2.2 exactly as today.

**Failure mode 1 — FRAC-OUT (too shallow).** Continuous risk accumulator, not a
binary:

```
fracRisk += dt × k × flush × groundFactor × (1 / max(cover, coverMin))
                × pilotPhaseMultiplier
```

- `groundFactor` highest for **soft clay** and **highly fractured rock**, elevated
  for **cobbles / boulders / high gravel** `[DCA-IR]`.
- `pilotPhaseMultiplier = 1.0` in pilot, **≈ 0.2 in reaming** — because "the
  maximum risk of formation fracture and IR… is when the pilot hole is drilled"
  and DCA explicitly does not require pressure monitoring during reaming
  `[DCA-IR]`. Rewarding the player for getting the pilot deep enough is exactly
  the right lesson.
- The annular-pressure gauge is **only visible if the player owns a downhole
  pressure sub** `[APE]` — a real, separately-specified item. Without it: no gauge,
  and the first sign is fluid on the surface. That is a superb shop upgrade.

**When it fires:** fluid appears on the surface at the shallowest point of the
recent path. If the obstacle is a **watercourse**, it is an environmental incident
and the safety score is gone. Two response buttons, matching the two real schools:

| Button | Effect | Source |
|---|---|---|
| **HOLD & CONDITION** | Stop 30 s (game-time), pump viscous fluid, wait again. Clears the risk. Costs time. If it fails twice, the job stops. | `[APE]` |
| **CONTAIN & CONTINUE** | Keep drilling, deploy containment, take a safety-score hit. Avoids the *worse* outcome — "stoppages… increase potential of further IRs, collapsed hole, increased string torque, lodged tooling or stuck pipe" `[DCA-IR]`. | `[DCA-IR]` |

Both are correct in the real world. Neither is free. That is a genuinely good
decision.

Add a third, pre-emptive option: **dig a burp hole** `[MB-T]` `[APE]` — costs money
and time, permanently lowers pressure at that station.

**Failure mode 2 — BEND RADIUS VIOLATION (too aggressive).** The key design move:
**it does not fail now. It fails at pullback.**

Track accumulated curvature per rod. If it exceeds `1/R_min`, record a **dogleg** at
that station: `{ station, severity }`. Give a soft warning at the moment
(`⚠ DOGLEG @ 84 m`) but let the pilot continue. Then, at stage 2, every dogleg
becomes a **pull-force spike at that exact station**, via the capstan effect
`[PPI12]`. The player watches their own bad decision come back at them, at a
station they can see on the profile they drew.

`R_min` comes from the rig's drill pipe, not the product pipe `[PPI12]`. Display it
in the contract briefing alongside the steel rule of thumb: **R ≥ 1200 × D**
`[SHORE]`, i.e. 1.2 m of radius per mm of pipe diameter.

## F5. The locator HUD

A compact glass panel, top-right of the section band, styled as a rugged handheld:

```
┌─────────────────────────────┐
│  ⬤ LOCATOR        SIG ▮▮▮▯▯ │
│                             │
│   DEPTH      3.8 m          │
│   PITCH     -12 %   (-6.9°) │
│   CLOCK        12           │
│              ╭─────╮        │
│              │  ▲  │  ← 12  │
│              ╰─────╯        │
│  ROD 28  ·  STATION 84.0 m  │
└─────────────────────────────┘
```

Details that make it read as real:

- **Pitch in percent, with degrees secondary** — "Most walkover systems use
  percent while inertial or wireline systems measure in degrees" `[DTD]`. When the
  player upgrades to gyro, **the primary unit flips to degrees**. A one-line change
  that a real locator would notice immediately.
- **Signal strength bar.** Degrades near ferrous mass and electrical plant `[DTD]`.
  At zero, depth and clock go to dashes — see §E5.
- **Reading updates once per rod**, not continuously — `[APE]` requires recording
  "at least once per drill pipe length or 25 ft". Between readings the player is
  flying on the last fix. That is the real tension of walkover locating, and it is
  free drama.
- **The locator's own avatar** walks the surface line above the bit in the surface
  band, stopping at the **front locate** and **rear locate** points `[DTD]`.
- **Depth ceiling.** Above ~23 m of depth `[DTD]`, walkover degrades and the player
  must have bought a wireline sonde, surface coil or gyro. That is the guidance
  upgrade ladder from §A3, spent as money.

## F6. Stage 2 — backream and pullback

**It plays in reverse, and that is the point.** The section scrolls **right to
left**; progress runs from the exit pit back toward the rig. The profile the player
drew in stage 1 is now a fixed track they must survive.

**Sequence, per `[GP1]`:** 0–3 reaming passes, sized as **min(product OD + 305 mm,
1.5 × product OD)** `[GP1]` `[GP4]`, then a **swab pass at the final size**
`[PPI12]`, then pullback. Let the player *choose* the pass schedule — one big pass
is faster and riskier, three passes is slower and safer. Ground modifies the
answer: solid rock lets you go closer to pipe diameter, clay demands the full 1.5 ×
or more because it swells `[MB-R]`.

**New gauges:**

| Gauge | Reads | Redline |
|---|---|---|
| **PULL LOAD** | live kN | **safe pull load** — exceed it and the Owner can demand re-installation at your cost `[APE]` |
| **TORQUE** | reamer torque | stall |
| **ANNULAR P** | if the pressure sub is owned | hydro-lock threshold `[DTD]` |

**Buoyancy control as a discrete decision.** A single **BALLAST** toggle, armed once
the pull-nose passes the **breakover point** `[PPI12]`:

- **Wet pull (ballasted):** fill the product pipe with water as it descends.
  Pull force drops significantly. This is what "most major pullbacks" do `[PPI12]`.
- **Dry pull (unballasted):** the pipe floats to the borehole crown and rubs
  `[PPI12]`. Higher friction. And the killer: **if the pull stops for any reason,
  the mud squeezes out of the contact zone and start-up friction spikes** `[PPI12]`.

**Stopping is punished, correctly.** The only free stop is **removing a drill rod**
`[PPI12]`. Any other pause starts a stuck-pipe timer — "many pipelines may become
stuck within minutes to only a few hours" `[PPI12]` — and the recovery chance falls
with time `[SHORE]`.

**Pullback speed** is 1–2 ft/min (0.30–0.61 m/min) `[PPI12]` — genuinely slow, so
compress it, but keep the *feel*: this stage is tense and patient, where the pilot
was busy and rhythmic. Different verb, same fiction.

**The weak link.** A purchasable **break-away connector** `[PPI12]`. Without it, an
overload destroys the product pipe (re-installation, `[APE]`). With it, the pipe
parts at a chosen point and you lose the pull but not the pipe. Real insurance,
real cost.

**Overpull at the end.** Pull the nose out **3 % longer** than the total pull (up to
4 %) or the string will suck back below the exit overnight as the viscoelastic
stretch recovers `[PPI12]`. Make this the last, quiet input of the stage — a small
"pull 3 % over" prompt that only veterans will understand, and that the results
screen explains.

## F7. The surface scene

Everything below is sourced in §D:

**Entry side (left).**
- The rig on its **slant beam** at the contract's entry angle, 8–20° `[GP1]`
  `[APE]`, staked down, carriage travelling the beam on rack and pinion `[HK]`.
- Break-out wrenches at the low end; the **rod wiper / doughnut** shedding mud on
  every pullback stroke `[DTD]` `[MB-T]`.
- The **rod magazine / erector** feeding one rod at a time `[HK]`.
- The **entry pit** catching returns, inside a **300 mm berm** `[APE]`.
- The **mud plant**: hopper, tanks, shaker screen throwing wet sand, cyclone
  desander and desilter `[APE]` + `DOMAIN.md` §3-C.
- A **vacuum truck** parked at the pit `[APE]`.

**Over the bore.**
- The **locator** walking the line, stopping at front and rear locate points
  `[DTD]`, receiver held low. This is the figure the electrical-strike hazard is
  about (§E7).
- Marked utility crossings and their clearance envelopes `[HSG47]`.
- The **obstacle** — river, road, rail, runway — with real traffic on it, because
  the whole point is that it is undisturbed.

**Exit side (right).**
- The **exit pit** with returns and its berm `[APE]`.
- The **product pipe strung out on rollers** — "sufficient number of rollers…
  to prevent excess sagging" `[APE]` — running away from the exit for the full bore
  length, starting ~23 m beyond the exit and 11–15 m wide `[PPI12]`.
- The **fusion machine** mid-string with the pipe crew and the data logger `[APE]`.
- The **pull head and swivel** at the nose `[SHORE]` `[APE]`.
- On a wet pull, the **water hose** feeding the pipe `[PPI12]`.

**The camera move that sells it.** At the moment of breakthrough — pilot bit
surfacing at the exit pit — cut the surface camera to the exit side for two seconds.
It is the one moment in HDD where something dramatic happens above ground, and the
crew genuinely stops to watch.

## F8. Scoring

Extend `drilling.js`'s existing weights object for `profileMode: 'profile'`:

| Component | Weight | What it measures |
|---|---|---|
| `corridor` | 0.26 | fraction of stations inside the design corridor `[APE]` |
| `time` | 0.18 | metres per shift |
| `pullback` | 0.18 | peak pull load as a fraction of safe pull load `[PPI12]` |
| `fluid` | 0.14 | returns maintained; frac-out events `[TT-FRAC]` `[DCA-IR]` |
| `tool` | 0.12 | reamer/bit wear, assembly damage from over-rotation `[GP3]` |
| `safety` | 0.12 | utility strikes, strike-alert events, environmental incidents `[HSG47]` |

**Job-losing failures** (not score deductions): stuck product pipe `[PPI12]`;
utility strike `[HSG47]`; frac-out into a watercourse; pipe broken off in the
borehole `[APE]`.

## F9. Naming discipline

Brands cited in this pack — Vermeer, Ditch Witch, Herrenknecht, TRACTO, Akkerman,
Melfred Borzall, Perforator, Prime Drilling, American Augers, McElroy, Baroid,
CETCO, Tensor — appear **only as citations**. `DOMAIN.md` §6: "In-game rig names
must be original — evoke these, never copy a real model designation."

Safe, real, generic vocabulary the game *should* use, all sourced above: pilot bore
· back reamer · forward reamer · fly cutter · wing cutter · compaction reamer ·
swab pass · pig · sonde · walkover locator · remote · front locate · rear locate ·
clock position · slide · rotate · bent sub · mud motor · pull head · swivel ·
Chinese finger · rod wiper / doughnut · burp hole · filter cake · gel strength ·
frac-out / inadvertent return · hydro-lock · dry hole · breakover point · weak link
· pin · box · interjack · jacking frame · MTBM · expander head · bursting rods.

---

# Appendix — items marked UNVERIFIED

Listed so they are not quietly promoted to fact later:

1. **Degrees of steering per rod** for a slant-face bit — no source gives a number.
   The proportional model in §F3 is derived from sourced principles, not measured.
2. **HDD drill rod length** by rig class. Only inference available: `[APE]`'s
   "per drill pipe length or 25 ft, whichever is more frequent" implies rods > 25 ft
   (7.6 m) exist on large rigs.
3. **HDD crew sizes** — no published figure found; §C2's ladder is a design choice
   built on the six sourced role competences.
4. **EUR day rates for HDD roles** — not found. §C3 gives two real anchors
   (`[BLS]`, `[EUROSTAT]`) and a transparent derivation, clearly labelled.
5. **Jacking forces in kN** for microtunnelling/pipe jacking frames — only
   "hundreds of tons of force" `[WIKI-MT]`.
6. **Pipe bursting pulling forces** in kN/tonnes — manufacturer pages did not
   expose ratings; only the diameter ceiling ND 1,200 `[TRACTO]`.
7. **Auger boring thrust and torque** ratings.
8. **Pilot tube guidance mechanism** (theodolite + illuminated target) — the
   accuracy figures are sourced `[AKK-PT]`, the mechanism is not.
9. **HDD drilling fluid volume as a multiple of bore volume** — retrieved only as a
   search snippet attributed to the HDD Good Practices series, not read from the
   page. Chase Part 2 of `[GP1]`'s series.
10. **Marsh funnel viscosity targets** for HDD mud — `[APE]` requires viscosity be
    monitored and varied to suit the ground, but publishes no target values.

Two documents that would close most of these and were **not** obtainable in this
session: the **DCA Europe HDD Technical Guidelines** (available only via
third-party document hosts) and the Pipe Jacking Association's **Guide to Best
Practice for the Installation of Pipe Jacks and Microtunnels** (free, but behind a
registration form — a form I should not submit on the user's behalf). Both are
worth getting properly.
