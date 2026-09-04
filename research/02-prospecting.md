# 02 — Mineral exploration / prospecting drilling

Research pack for **Drillity I The Game**, closing the gap identified in
`DESIGN_EXPANSION.md` §5 (Prospecting: "RC drilling missing entirely — half of
all exploration. No commodity, no ore body, no assay, and core recovery is not
scored").

**Scope.** §A the three methods · §B the craft (the heart of it) · §C the crew ·
§D the commodities · §E the machines · §F a mechanics proposal · §G guardrails,
data shapes and open questions.

**Rules obeyed.** Every claim carries a source — a local filename in
`C:\Users\henri\Downloads\` or a URL. Anything unsourceable is marked
`UNVERIFIED` or cut, per `PLATFORM_TRUTH.md` Part C. Manufacturer names appear
**only as citations**; no real model designation may ship as in-game content
(`DOMAIN.md` §6).

### Source key

| Key | Source |
|---|---|
| `[EPI-BIT]` | `Epiroc Guide choosing right core bit.pdf` |
| `[EPI-LIFE]` | `Epiroc guide Extending core bit life.pdf` |
| `[EPI-PARAM]` | `Epiroc Guide to Drilling Parameters.pdf` |
| `[EPI-ROP]` | `Epiroc Guide to improving rate of penetration.pdf` |
| `[EPI-ROD]` | `Epiroc Guide Protecting and Handling your Drill Rods.pdf` |
| `[EPI-DT]` | `Epiroc Guide to Diamond Tools.pdf` |
| `[DDTB]` | `Diamond Driller's Technical Book.pdf` |
| `[MET]` | `Mineral Exploration Tooling - Catalog.pdf` |
| `[HERO8]` | `HERO8 Diamond Tools - Technical Sheet.pdf` |
| `[A3S]` | `Arrow 3S Click Release - Technical Sheet.pdf` |
| `[PRISM]` | `Epiroc Prism wedge technical sheet.pdf` |
| `[SWIV]` | `Technical sheet surface and underground water swivels.pdf` |
| `[MIN-RC]` | `Mincon-RC-Solutions-2025-A4-WEB.pdf` |
| `[BL-RC]` | `Reverse-Circulation-Tools.pdf` (Boart Longyear global catalogue, 3-2009) |
| `[RS-RC]` | `RC_Hammer_Catalogue.pdf` |
| `[RS-FLUID]` | `Drilling_Fluid_Catalogue.pdf` |
| `[DT-SONIC]` | `Drilltechniques-Sonic-Brochure.pdf` |
| `[A&D]` | **Annels & Dominy (2003)**, *Core recovery and quality: important factors in mineral resource estimation*, Applied Earth Science (Trans. IMM B) **112**: B305–B310, DOI 10.1179/037174503225011306 — peer-reviewed; the authority for §B7 |
| `[SPORIN]` | `Structural_drilling_using_the_high-frequency_sonic-in-Slovenia.pdf` — Šporin & Vukelić (2017), *RMZ M&G* Vol. 64 pp. 1–10, DOI 10.1515/rmzmag-2017-0001 |

Web sources are cited inline as links, not keys. The heaviest-used ones, so you
can judge their weight: **Coring Magazine** (trade journal, technical articles) ·
**Boart Longyear InSite** and its **Diamond Products catalogue** (manufacturer) ·
**Dimatec** (manufacturer, operating parameters and waterways) · a **diamond
drilling trainee manual** hosted on pdfcoffee (contractor training material —
detailed and internally consistent, but a re-hosted document; corroborated
wherever it is load-bearing) · **Dominy (2003)**, *Applied Earth Science*
112(3):305–312 (peer-reviewed, the source of the recovery threshold) ·
**US NRC** and **FHWA** technical references (RQD and core-recovery definitions) ·
**IMDEX/AMC** (drilling fluids) · **Job Bank Canada**, **SEEK**, **AusIMM**,
**JORC**, **NI 43-101**, **EFG** (pay, tickets and qualifications).

Two local files could **not** be read: `Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf`
and `GeoDrilling_Sept.pdf` are image-only scans and no OCR tool is installed on
this machine. See §G4.

---

# A. The three methods

## A1. Diamond core drilling (DD) — wireline

### What "wireline" actually does

A conventional core barrel has to be tripped out of the hole every run: pull
every rod, empty the barrel, run every rod back. **Wireline** splits the barrel
into two nested tubes. The **outer tube** — carrying the reaming shell and the
core bit — stays on the bottom of the string and never comes up until the bit
is worn. The **inner tube assembly** is the part that fills with core, and it
rides up and down *inside the rods* on a thin steel wire.

The retrieval cycle, from the tool descriptions in `[MET]` and `[A3S]`:

1. Drill the run. The inner tube fills with core.
2. Run ends (barrel full, or core blocks — see §B6).
3. Stop rotation, break circulation.
4. Drop the **overshot** down the rod string on the **wireline** (winch cable).
5. The overshot latches onto the **head assembly** at the top of the inner tube.
   Modern head assemblies use an automatic latch that engages without the crew
   touching it; the design brief for the `[MET]` DiscovOre/Arrow 3S system was
   explicitly "eliminated the weak and potentially hazardous components of a
   standard core barrel, the spearhead and spring pins" `[MET]`.
6. Winch the inner tube up the rods to surface.
7. Break the tube open, get the core out, lay it into the tray in order.
8. Send the empty inner tube back down, latch it into the outer tube, resume.

The **release** step matters and is a real failure mode: the overshot has to let
go of the head assembly at the bottom of the hole. `[A3S]` documents a
positive-release sleeve, and the field procedure is a rhythm, not a button —
*"Pull up on the wireline with the drill rig approximately 1–2 feet. Lower
overshot 1–2 feet quickly. Repeat steps 5 & 6 approximately 6–8 times or until
there is no resistance when pulling on the wireline"* `[A3S]`. A jammed overshot
means *"retrieval of stuck head assemblies"* — time and money `[A3S]`.

**Core lifter.** At the bottom of the inner tube sits the **core lifter
assembly** — `[MET]` describes it as *"three key parts that allow you to firmly
grip the core sample so that it can be broken and brought to the surface."* When
you lift the barrel, the tapered lifter case squeezes the split lifter ring onto
the core, snaps the core off at the bottom, and holds it in. **This is the
single most direct cause of lost core in the game's model:** `[EPI-LIFE]` warns
that if the bit gets crushed out of round in the rod holder, *"the core bit will
cut a smaller core sample. If the core sample is too small the core lifter
spring will not grip the core and it will stay in the hole."*

### The parts, and the one fact that explains all of them

**The inner tube does not rotate.** The head assembly carries *"a bearing
assembly to allow the inner tube to remain stationary and avoid sample damage
while drilling"*
([diamond drilling trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).
The outer barrel spins around a stationary tube that the core slides quietly
into. Every recovery failure in §B7 is, at bottom, a failure of that stillness.

**Stays down the hole (outer tube assembly):** core bit → reaming shell → outer
tube → adapter coupling → **locking coupling** → drill rods. The outer tube *"is
stabilized by the drill bit, reaming shell, and wear pads"*; the locking coupling
is mated to the rods and *"its end face serves as the load-bearing surface for the
latch mechanism"*
([Boart Longyear](https://www.boartlongyear.com/insite/the-boart-longyear-genuine-q-wireline-system/),
[TMG](https://tmgmfg.com/blog/wireline-core-drilling/)).

**Comes up the wire (inner tube assembly):** spearhead point (hardened, pivoting)
→ latch retracting case → spring-loaded latches → landing indicator ball and
bushing → **shut-off valve discs** → compression spring → thrust and hanger
bearings → inner tube → core lifter case → **core lifter** (retained by a stop
ring)
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).

**Latching:** the inner tube is dropped or pumped down the rod bore; its landing
shoulder seats on the landing ring, and spring-loaded latches *"spring outwardly
into an annular recess (latch seat) in the inner surface of the outer tube
assembly to anchor the assembly against axial movement"*
([US Patent 4,834,198](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/4834198)).

**Core lifter, mechanically:** *"a hardened steel, split collar with a tapered
body."* On lift-off *"the core sample begins to slide out of the inner tube. Grip
features on the inner surface of the core lifter catch the moving core sample and
pull the core lifter towards the smaller end of the tapered socket"*, squeezing it
onto the core; the lifter case *"bottoms out on the inside of the drill bit
transferring the pullback load from the drill string to the core lifter until the
core sample breaks"*
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).
Triple-tube lifters *"are identified by 3 lines cut into the outside diameter"*
and **are not interchangeable** with double-tube parts (same source) — a real
parts-compatibility trap.

**Overshot, mechanically:** its jaws *"engage with and lock onto a spear point
overshot coupling member"*, then the wire *"causes a latch retracting mechanism to
pull the latches inwardly to release the inner tube assembly"*
([US Patent 4,834,198](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/4834198)).
Field detail: *"The compression spring pushes the detent plunger into the valley
on the spear head base"*; on pull, *"the latch retracting case should slide up,
and the latches should retract"*
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).

**Maintenance every single retrieval** — a good source of slow-degradation
states: the spearhead *"must be lubricated with oil… and inspected every time the
inner tube is retrieved"*; the latch retracting case likewise; thrust and hanger
bearings *"must be greased every time the inner tube is retrieved… by pumping
grease into the inner tube cap until grease is pushed through the holes in the
thrust bearings"*
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).
The correct backend feel is *"no play in the components but the shutoff valves
should be able to be twisted by hand and the spindle bearing should spin
relatively freely"* (same source). **An ungreased backend is how you get a
spinning inner tube and destroyed core.** That is a maintenance action with a
scoring consequence, which is exactly what a game wants.

**Reaming shell check.** Try to slide a no-go gauge over the reamer **every rod
pull**; if it goes on, replace it. A worn reamer leaves the bit unstabilised and
*"the core has a wavy appearance."* In deep hard-rock holes, run **two reamers**
and rotate them each rod pull
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).

### Run length — the player's risk dial

Standard barrel lengths are **1.5 m (5 ft) and 3.0 m (10 ft)**, *"determining
maximum core retrieved per run before inner tube retrieval"*
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)),
corroborated as *"Standard: 3 meters maximum; Shallow/fractured zones: 1.5 meters
or less"* ([TMG](https://tmgmfg.com/blog/wireline-core-drilling/)) and *"1.5–3.0
meters depending on conditions"*
([FHWA drilling & sampling course notes](https://pdhonline.com/courses/c250/FHWA_Drilling_Sampling_Soil___Rock___3.pdf)).
Longer runs exist by coupling outer tubes with inner-tube extensions
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)),
and **6 m barrels are real** — `[MET]` p.17 sells a surface rig on *"a sturdy
mast capable of handling **6 meter core barrels**."* So treat **1.5 / 3.0 / 6.0 m**
as the run-length options, with 1.5 and 3.0 as the everyday choices and 6.0 as a
production setting that needs mast height and good ground.

**Why it is the main recovery lever:** shortening runs in poor ground is *"the
cheapest recovery improvement available"*
([TMG](https://tmgmfg.com/blog/wireline-core-drilling/)), and **excessive drill
run lengths** are named as a direct cause of poor recovery in the
resource-estimation literature
([Dominy 2003](https://www.geokniga.org/bookfiles/geokniga-corerecoveryandqualityimportantfactorsinmineralresource.pdf)).
The mechanism is simple: the longer the column of core sitting in the tube, the
more chances a piece has to wedge, and the longer the already-cut core is exposed
to grinding and washing.

> **Make run length a slider the player sets before each run.** Long = fewer
> trips, more metres per shift, sharply rising blockage and grinding risk in bad
> ground. Short = safe, slow, and expensive. That is one control that captures the
> entire speed-vs-recovery tension of the method.

### What wireline actually buys — the trip arithmetic

- Conventional coring: **30–90 minutes per run at depth.** Wireline: **5–15
  minutes per run regardless of depth**
  ([WinDrilling](https://windrilling.com/wireline-core-drilling-complete-field-guide/) —
  vendor source, treat as indicative).
- Why conventional collapses with depth: *"At 100 meters with 3-meter rods, that
  is 33 joints broken out and 33 remade to recover 3 meters of core. At a brisk
  30 seconds per joint each way, roughly 33 minutes of pure rod handling."*
  Wireline pays for itself beyond roughly **25 m**
  ([TMG](https://tmgmfg.com/blog/wireline-core-drilling/)).
- String weight for the feel of it: at 1,000 ft (305 m) an NQ string is
  **~5,200 lb** of steel, HQ **~7,700 lb**
  ([TMG](https://tmgmfg.com/blog/wireline-core-drilling/)).
- Wireline coring was developed in **1958**
  ([Boart Longyear](https://www.boartlongyear.com/insite/the-boart-longyear-genuine-q-wireline-system/)),
  and inner-tube **descent** speed is slow enough that a 30% improvement was a
  marketable product feature
  ([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).

`UNVERIFIED` — a retrieval-time-versus-depth curve. No manufacturer or academic
source published one, and no wireline hoist line speed could be sourced. A
defensible model is *fixed surface handling time + a term linear in depth* — but
do **not** put a specific "X minutes at 800 m" on screen as a fact.

### The size ladder — hole diameter AND core diameter

All figures from the diamond core bit table in `[EPI-DT]` p.16, independently
corroborated by
[Wikipedia — Exploration diamond drilling](https://en.wikipedia.org/wiki/Exploration_diamond_drilling)
(identical values).

| Wireline size | Core Ø mm | Hole Ø mm | Kerf (rock destroyed) |
|---|---|---|---|
| **AQ** (AWL) | 27.0 | 48.0 | 10.5 mm |
| **BQ** (BWL) | 36.5 | 60.0 | 11.75 mm |
| **NQ** (NWL) | 47.6 | 75.7 | 14.05 mm |
| **HQ** (HWL) | 63.5 | 96.0 | 16.25 mm |
| **PQ** (PWL) | 85.0 | 122.5 | 18.75 mm |
| NQ2 | 50.5 | 75.7 | — larger core in the same hole |
| **BQ3 / NQ3 / HQ3 / PQ3** (triple tube) | 33.5 / 45.0 / 61.1 / 83.0 | 60.0 / 75.7 / 96.0 / 122.6 | smaller core, **better recovery** |
| SQ | 102.0 | 146.0 | (Wikipedia only, not in `[EPI-DT]`) |

**Why you will see 75.3 and 75.7 both quoted for NQ.** Bit outside gauge is
published in three grades — **STD** (standard), **RSG** (resharpened/reset gauge)
and **OS** (oversize). For NQ: STD 75.3 mm, RSG 75.7 mm, OS 77.0 mm; HQ 95.6 /
96.1 / 97.3–98.9 mm; PQ 122.0 / 122.6 / 125.7 mm
([Boart Longyear bit-gauge table](https://www.boartlongyear.com/wp-content/uploads/flipbook/1/files/basic-html/page14.html)).
`[EPI-DT]` quotes the RSG column. **Gauge grade is therefore a real, purchasable
property** — an oversize bit cuts extra clearance for a tight or deviating hole.
The same table gives **NQTK = NQ2** (50.7 mm core in a 75.3 mm hole)
([BLY](https://www.boartlongyear.com/wp-content/uploads/flipbook/1/files/basic-html/page37.html)),
matching `[EPI-DT]`'s 50.5 mm to within the gauge tolerance.

Also in `[EPI-DT]`: conventional thin-wall sizes ATW 30.1/48.0, BTW 42.0/60.0,
NTW 56.0/75.7, HTW 70.9/95.6 mm, and thin-kerf wireline AWLTK 30.5/48.0,
BWLTK 40.7/60.0 mm — a thin kerf destroys less rock and returns more core from
the same hole, at the cost of a weaker bit (`[EPI-PARAM]` gives thin-kerf sizes
a lower permitted WOB than the standard equivalent).

**Reaming shell** — sits behind the bit and holds gauge. `[EPI-DT]` p.16 gives
the tolerance bands: NWL 75.57–75.82 mm, HWL 95.89–96.27 mm, PWL
122.43–122.81 mm. Note it is **larger than the bit** — `[EPI-LIFE]` is explicit:
*"the gauge of the reaming shell is larger than the bit's gauge"*, and if both
wear out together, *"they will not be able to maintain the desired gauge of the
bore hole. Forcing a new core bit into a funnel-shaped bottom can cause the
fragile ends of the matrix crown to pop off."*

Premium reaming shells carry **wear indicator bands** — *"proprietary wear
indicator bands that tell the driller when to change the reaming shell, resulting
in better hole control and straightness"* `[MET]` p.5. That is a ready-made,
diegetic UI element: a physical wear stripe on a part, not a percentage bar.
`[MET]` p.5 also sells **locking couplings** that *"help to stabilize the upper
section of the core barrel and minimize hole deviation"*, and reaming shells with
*"a larger active surface to help control deviation."* Straightness is a
purchasable property.

### Stepping down (telescoping) and casing

You start big and reduce. The reason is in the casing table `[EPI-DT]` p.15 —
each casing size nests inside the hole the size above it drilled, and each bit
size fits inside the casing below it:

| Casing shoe | OD mm | ID mm | Sits in the hole drilled by | Lets you drill |
|---|---|---|---|---|
| PW | 143.51 | 123.27 | (collar / overburden) | PQ (122.5) |
| HW | 117.48 | 99.70 | PQ hole 122.5 | HQ (96.0) |
| NW | 91.82 | 76.20 | HQ hole 96.0 | NQ (75.7) |
| BW | 75.31 | 60.38 | NQ hole 75.7 | BQ (60.0) |
| AW | 59.56 | 48.26 | BQ hole 60.0 | AQ (48.0) |
| EW | 47.63 | 37.97 | AQ hole 48.0 | EQ |
| HWT | 117.48 | 101.09 | — thin-wall variant, more clearance | HQ |

Flush-joint casing pipe (`[DDTB]` p.51): AW 57.1/48.4, BW 73.0/60.3,
NW 88.9/76.2, HW 114.3/101.6, PW 139.7/127.0 mm OD/ID.

**Why you step down:**
1. **You are forced to.** A collapsing or water-making zone gets cased off; the
   casing eats the diameter, so the next hole section is one size smaller.
2. **Depth capacity.** `[DDTB]` p.48–49 publishes a rod depth-capacity chart:
   recommended maximum depths run from roughly **1,500 m to 3,300 m** depending
   on rod size and grade, with the chart caveat *"A factor of safety applies to
   depth capacities. These are based on straight vertical down holes and fluid
   filled holes."* The heaviest P-series rods bottom out lowest (~1,500–2,000 m
   band); B- and N-series reach the top of the chart (~2,600–3,300 m). Deep holes
   are therefore drilled in N or B, not P. *(Per-size attribution beyond this is
   not resolvable from the chart's layout — do not quote a single size's number.)*
3. **Rig and hoist capacity.** The water swivel both flushes and hoists —
   `[SWIV]` states plainly: *"Water swivels are responsible for providing
   flushing fluid to the bit and for hoisting the drill rods in and out of the
   bore hole. How deep you are drilling will decide which water swivel you
   should use because it must have enough capacity to lift the weight of the
   drill rods."* Its rod capacity table is a clean depth-gate mechanic:

| Swivel static capacity | B rods | N rods | H rods | P rods |
|---|---|---|---|---|
| 6,350 kg (14,000 lb) | 1,080 m | 840 m | 560 m | n/a |
| 11,800 kg (26,000 lb) | 2,000 m | 1,560 m | 1,035 m | 680 m |
| 22,680 kg (50,000 lb) | 3,850 m | 3,000 m | 1,950 m | 1,350 m |

Source: `[SWIV]`. Read the diagonal: the same swivel that reaches 3,850 m in B
reaches only 1,350 m in P. That *is* the reason for telescoping, in one table.

4. **Cost and speed.** Bigger holes are slower (see the ROP table in §B5) and
   burn more consumables per metre.

### Rod handling numbers

- **Wireline rod make-up torque** `[DDTB]` p.50: A 340 N·m (250 ft-lb),
  B 400 N·m (300), N 600 N·m (450), H 1,000 N·m (750), P 1,000 N·m (750).
  `[DDTB]` warns the joint *"will NOT make itself up during normal drilling
  operation and must be pre-loaded manually… to avoid joints from leaking but
  also premature fatigue and failure of the joint."*
- **Standard wireline rod weight and internal volume** `[DDTB]` p.49:
  AQ 44.5/34.9 mm OD/ID, 13.9 kg per 3 m rod; BQ 55.6/46.0 mm, 17.9 kg;
  NQ 69.9/60.3 mm, 22.9 kg; HQ 88.9/77.8 mm, 34.2 kg; PQ 114.3/101.6 mm,
  56.0 kg. Hole content: AQ 96 L/100 m up to PQ 1,180 L/100 m.

That last column is a good hidden mechanic: **a PQ hole holds ~12× the fluid
volume of an AQ hole per metre**, so flush turnover, mud cost and cuttings
transit time all scale with size.

### Directional work — wedging

Holes deviate, and sometimes you *want* them to. `[PRISM]` documents a one-trip
directional wedge: *"used to deflect a hole towards a specific direction, after
it has been surveyed"*, available in N and H sizes, and — the number that
matters — *"In optimal conditions, achieve a minimum deflection of 1.5 degrees."*
Wedging lets a single expensive deep hole become a fan of daughter holes off one
parent, which is exactly the follow-up-campaign structure `DESIGN_EXPANSION.md`
§2 asks for.

Drilling *past* a wedge is its own hazard: `[MET]` notes *"care needs to be
taken with all the down hole tooling especially the diamond bit, as it can
suffer damage to the tip of the crown, or worse, drill through the wedge."*

### Deep-hole time cost — the headline number

`[EPI-LIFE]`, verbatim:

> *"we can say we have a hole where a bit averages approximately 125 meters…
> if you have to drill a hole that is 1000 meters deep, you can expect to change
> the bit often — even up to eight times… When you are at a depth of about
> 800–1000 meters, it can take up to four hours to replace a bit. That
> translates to four hours where you will not be collecting core."*

And the economic lever: *"If you are able to extend the life of a bit by only
15%, you can expect one less drill bit replacement."* `[EPI-LIFE]`

`[EPI-ROP]` gives the parallel crown-height lever: *"if you are averaging 200
meters with a 13 mm crown, but your borehole is 250 meters, a Vulcan bit can
allow you to complete the hole without changing the bit… a Vulcan typically
lasts up to 33% longer than a normal core bit"* — with the trap attached: *"it
should be used in ground that is not variable… after 100 meters the ground
changes to a very hard ground, the Vulcan will not be suitable and you risk
prematurely wearing the Vulcan or burning it."*

## A2. Reverse circulation (RC)

### The pipe

RC runs **dual-wall drill pipe**: an outer tube with an inner tube inside it,
held by circlips and sealed with O-rings, replaceable in the field `[BL-RC]`
p.6. `[BL-RC]` lists it in **3½", 4" and 4½" ODs**, in **1.5 m, 3 m and 6 m**
lengths, each with a matching **inner tube** part number — literally two
concentric part numbers per rod.

Compressed air goes **down the annulus** between the two tubes; at the bit it
crosses into the centre; the cuttings return **up the inner tube**, sealed off
from the borehole wall the whole way. That is the whole point: the sample never
touches the hole above the bit face, so it cannot be contaminated by material
sloughing in from higher up.

`[MIN-RC]` corroborates the sealing chain, describing a *"New check valve and
spring design to create a stronger seal-off for the hammer during rod changes"*
and *"Optimised internals — revised design for internal aligner to increase
flushing in drilling mode."*

### The hammer and the bit

An RC hammer is a DTH hammer rebuilt around sample transport. `[MIN-RC]` gives
the range:

| Hammer OD | 82 mm | 92 mm | 109 mm | 116 mm | 120 mm | 132 mm |
|---|---|---|---|---|---|---|
| Length | 1,063 mm | 1,146 mm | 1,268 mm | 1,185 mm | 1,363 mm | 1,363 mm |
| Weight | 27.0 kg | 40.0 kg | 58.1 kg | 66.0 kg | 75.2 kg | 87.4 kg |
| Min bit | 86 mm | 102 mm | 115 mm | 124 mm | 127 mm | 140 mm |
| Max bit | 102 mm | 114 mm | 127 mm | 133 mm | 146 mm | 146 mm |
| Piston | 5.4 kg | 7.5 kg | 12.0 kg | 13.9 kg | 17.0 kg | 19.2 kg |
| **Min air package** | **8.5 m³/min @ 13.8 bar** (300 cfm @ 200 psi) | **25.5 m³/min @ 24.1 bar** (900 cfm @ 350 psi) | 25.5 @ 24.1 | 25.5 @ 24.1 | 25.5 @ 24.1 | 25.5 @ 24.1 |

Source: `[MIN-RC]` pp.8–9. So a working RC hole demands roughly
**25 m³/min at 24 bar** — that is a large trailer compressor, and it is why an
RC spread is physically so much bigger than a core spread.

Bit detail `[MIN-RC]` p.10: **16 carbides** on the smaller bits, **19** on the
larger; face type **drop centre**; **sample holes 20–28 mm** through the bit
face. `[RS-RC]` independently lists RC bits 86–165 mm with **drop-centre face
and hemispherical carbides**, standard hole sizes 90 mm and 124 mm, and a
separate **shroud** part range (84.1–163.5 mm) — the shroud is the sleeve around
the hammer that captures the cuttings at the face and forces them into the
inner tube instead of up the annulus.

Face-sampling matters for grade: `[MIN-RC]` p.10 claims venturi-flushing bits
give *"a 40 % plus improvement in sample recovery versus conventional RC drill
bit designs. This is especially beneficial in industries where sample quality is
of the utmost importance, for both exploration and grade control drilling."*

### Keeping the sample dry — the real RC failure mode

Below the water table an RC sample turns to slurry, and a wet sample is a bad
sample. `[MIN-RC]` p.7 describes the countermeasure precisely:

> *"the bleed chuck sleeve and bleed chuck help maintain positive air pressure
> at the bit face by holding the outside water head above the chuck sleeve. This
> maintains a positive air pressure at the bit face, ensuring that collected
> samples remain dry."*

and the flip side, *"Keeping it dry: air-bleed chuck and chuck sleeve to aid
retrieval of dry sample in water-logged ground conditions"* `[MIN-RC]` p.7. On
the bit: *"Venturi bits… are also not hindered by water in the borehole:
consistently high airflow is able to flush out water-logged samples. As a
result, there's a much lower risk of silting and other complications that cause
expensive downtime."* `[MIN-RC]` p.10.

**Game translation:** crossing the water table in RC is not a "hole erodes"
event as in the current `GAMEDESIGN.md` hazard list — it is a *sample quality*
event. Below the water table you either have enough air (booster) to hold the
water back, or your sample goes wet and your assay is degraded.

### The surface train

From the top of the string, `[BL-RC]` names the components in order:
**standard dual swivel** (air in, sample out — two flow paths through one
rotating joint) → **deflector box** → **3" knock-on hose tail** → sample hose.
`[MIN-RC]` p.12–13 lists the rest of the conversion kit: **deflector**
(*"smooth, uninterrupted 90-degree flow path… internal expansion zones…
super alloy wear-resistant design"*), **RC hose fittings** in *"3- and 4-inch
sizes"*, **sample hose reel**, **sample support arm**, **combination swivel**
(*"rotary air seals rated from −40 °C to +120 °C"*), and the **sample system** —
*"Cyclone wear bend: Alumina Ceramic tiles · Barrel/drum lining: Alumina
Ceramic Vortex Scroll · Base cone lining: Polyurethane 60 shore."* Every wetted
surface is a ceramic wear part; RC eats its own plumbing.

`[MIN-RC]` p.13 also documents the **blow-back / blow-down (BBBD)** system —
*"sliding hydraulic cylinder actuation… faster action and switching… improved
sample quality… separated hydraulic and pneumatic systems to prevent
contamination… auto return to neutral/drill position."* This is the mechanism
that clears the string between samples so metre 41 does not carry metre 40's
rock into the bag.

`[RS-FLUID]` even lists a dedicated additive for this method: *"Ground
Stabilizer RC — specialty product for stabilizing RC holes."*

**The sample, quantified.** Cuttings rise through the inner tube to the
**cyclone**, then over a **splitter** into sample bags; the representative split
is typically **2–3 kg per metre**, and samples are usually collected on **1 m
intervals**
([alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods),
[Harlsan](https://www.harlsan.com.au/what-is-rc-drilling/)). The rest goes on the
bulk reject pile beside the rig. Chips are stored in *"long, thin plastic cases
with a row of half-cup size sections"*, one section per metre
([The Gold Advisor](https://thegoldadvisor.com/free-maven/explaining-exploration-what-is-drilling/)) —
the RC equivalent of a core tray, and a completely different-looking prop.

**Depth and pace.** Published working ranges: **50–500 m**, some holes beyond
700 m, at **60–150 m per shift**
([alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods));
or **300–600 m** typical with an optimum band of **300–500 m**, at up to
**200–300 m/day**
([Harlsan](https://www.harlsan.com.au/what-is-rc-drilling/)). Both bracket
`[MET]` p.22's rig rating of **300–400 m**. For comparison, RAB reaches only
**10–80 m** (~100 m in unconsolidated ground) at **100–300 m/shift**
([alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods),
[RC Drilling](https://www.rcdrilling.com/rc-drilling-guide/comparative-costs-of-drilling/)) —
so the game has a natural three-rung cheap-to-dear ladder: RAB → RC → DD.

### Why RC over DD, and what you lose

| | Diamond core | RC |
|---|---|---|
| Sample | Intact cylinder | Chips |
| Structure / orientation | Yes | **No** |
| Geotechnical data (RQD) | Yes | **No** |
| Contamination risk | Low | Real — the whole design fights it |
| Hole size | 48–122.5 mm `[EPI-DT]` | 90–146 mm `[RS-RC]`, `[MIN-RC]` |
| Depth | 1,500–3,300 m rod capacity `[DDTB]` | see below |
| Air/water | Water/mud, ~14–77 L/min `[EPI-PARAM]` | ~25 m³/min air @ 24 bar `[MIN-RC]` |
| Metres per 12-h shift | **15–40 m** (§C8) | **60–150 m**, up to 200–300 m/day (§C8) |
| Cost per metre | USD 80–250 (≈ €69–215) | USD 40–120 (≈ €34–103); **25–40% cheaper** (§C7) |

On depth, the one figure in the local sources: an RC rig described in `[MET]`
p.22 is *"designed specifically for reverse circulation drilling to depths of
300–400 meters."* That is the honest RC working range for an exploration rig.

`[MIN-RC]` p.10 also gives the reason RC bits get chosen for the whole hole:
venturi bits *"can be used in both soft ground and hard rock. This presents a
huge time saving compared to air core drilling, as there is no need to swap
tooling for harder ground."*

## A3. Sonic in exploration

**How it works.** Two counter-rotating eccentric masses in the head generate a
*"high frequency sinusoidal force along axis of drill pipe"*, setting up a
standing wave in the string — `[DT-SONIC]` labels the diagram *"3rd harmonic
standing wave established in drill pipe."* The vibration *"causes a very thin
layer of soil particles around the drill string and drill bit to lose their
structure… behave more like a fluid powder or paste rather than a rigid mass.
This process is called 'liquefaction'"* `[DT-SONIC]`.

`[SPORIN]` (peer-reviewed) states the physics the same way: the head *"generates
a high-frequency sinusoidal wave… transferred through the core barrel to the
drill bit"*, and gives the force/frequency envelope: forces *"range from
22,000 kg to 127,000 kg at frequencies of up to 150 Hz"* `[SPORIN]`. It also
notes the depth problem — *"with an increase in depth, it is necessary to add
multiples of the fundamental frequency"*, i.e. the resonant frequency the
operator must chase moves as the string lengthens.

**Head specifications** `[DT-SONIC]`:

| | Head A | Head B | Head C | Head D | Head E |
|---|---|---|---|---|---|
| Max frequency | 67 Hz (4,000 cpm) | 67 Hz | 67 Hz | **150 Hz** | **133 Hz** |
| Max vibration force | 38 kN | 65 kN | 78.4 kN | 222 kN | 222 kN |
| Rotation speed | 0–159 rpm | 0–36 / 0–62 rpm | 0–27 / 0–54 rpm | 160 rpm | 160 rpm |
| Rotation torque | 3.395 kN·m | 4.2 / 2.1 kN·m | 5.4 / 2.7 kN·m | ~7.1 kN·m | ~7.1 kN·m |

(Model names withheld per `DOMAIN.md` §6; all values `[DT-SONIC]`. Note the
torque units in the source's Sonicor table are misprinted as "kn-m" for what the
ft-lb column shows to be ≈7.1 kN·m — treat the ft-lb figures, 5,250 fwd /
7,000 rev, as authoritative.)

**The three-phase cycle** `[SPORIN]`:
- Phase I — core drilling: *"the core barrel is advanced to the soil. Soil
  material is collected into the core barrel."*
- Phase II — *"Drilling around the core barrel with protective casing… to secure
  the well stability, with override core barrel with sonic casing, so that the
  core barrel can be removed from the well in phase III."*
- Phase III — *"Removal of the core from the borehole along with removal of the
  core from the core barrel."*

That casing-advance step is why sonic works where nothing else recovers a
sample: *"This method is usually used in soil materials, such as gravels, sands,
soft clays, etc., because the open borehole is unstable during the core barrel
extraction manoeuvre and the borehole may collapse"* `[SPORIN]`.

**Measured performance.** `[SPORIN]` ran a controlled comparison at the HE
Brežice site, Slovenia, drilling *"silt, clayey gravel, gravel and
conglomerate"* with one sonic rig and several conventional core rigs on the same
ground:

> *"The progressions achieved using high-frequency core drilling were up to four
> times higher than those achieved using classical core drilling methods. The
> core obtained using the high-frequency method was also superior… more compact
> and there was no secondary fragmentation in the corer, nor was there mixing
> and segregation of the core within the corer."*

`[DT-SONIC]` makes a similar but vendor-sourced claim of *"three to five times
faster (depending on soil conditions) than conventional drills."*

**Fluid.** *"In the case of most materials upon which the high-frequency core
drilling method is applied, the use of flushing water is not required… there is
a lower consumption of flushing water than in core drilling"* `[SPORIN]`.
`[DT-SONIC]` agrees: *"in certain materials the liquefaction reduces (in some
cases entirely removes) the need for injecting air or water."*

**Where it belongs in exploration:** unconsolidated cover — glacial till,
alluvium, sand, tailings, deeply weathered saprolite — where core recovery by
conventional means is poor and RC contaminates. The stated applications in
`[DT-SONIC]` are *"Environmental Investigation · Geological Investigation ·
Underground Geothermal Hole · Monitoring Well · Water well."*

**Barrier to entry** (good progression gate): *"there is currently only one
drilling rig equipped for it in the country. The reason for the poor
representation of such technology may be attributed to the high costs of the rig
and the equipment for it, as well as the modest availability of spare parts"*
`[SPORIN]`.

---

# B. The craft — this is the heart of it

## B1. Matrix selection against Mohs hardness

### The rule, stated correctly

This is the single most counter-intuitive fact in the whole document and the
game must get it right.

> **A higher matrix number is a SOFTER matrix, and a softer matrix is what you
> use in HARDER rock.**

`[EPI-BIT]` states it outright: *"In order to compensate for the lack of
rotation, you would need to use a bit with a softer matrix since a softer matrix
allows the diamonds to expose themselves more efficiently. **Bits with a higher
number, like a 9, are softer than bits with a lower number, like a 7.**"*

Why: an impregnated bit is diamonds embedded through the full depth of a metal
matrix. It only cuts while fresh diamonds are exposed at the face. `[EPI-LIFE]`:
*"as the matrix wears away, new sharp diamonds are exposed at a steady rate, and
dull or worn diamonds are released."* Hard, fine-grained, non-abrasive rock does
not erode the matrix, so the diamonds get worn flat and buried — the bit
**polishes**. A softer matrix erodes fast enough to keep uncovering fresh stone.
Conversely, soft *abrasive* rock sandblasts the matrix away faster than the
diamonds wear out, and the diamonds fall out still sharp — so you go **harder**.

### The worked example (verify — confirmed)

`[EPI-BIT]`, verbatim:

> *"Mike measured an average hardness of 6.5 after performing three scratch tests
> on samples of his latest project. As the ground is coarse grained and slightly
> abrasive, his representative suggests he should choose a HERO 7, HOBIC 7AC or
> AZURE bit. After a few hundred meters, Mike realizes that the penetration rate
> is too slow. He notices that that rock has increased in hardness and is now
> much more fine-grained. His representative then suggests he should use a higher
> number matrix and sends him a couple of HERO 9 core bits."*

`[DDTB]` p.28–29 carries a second version of the same story starting at Mohs 5.5
and ending on the same advice — *"if the penetration rate is too slow, using a
higher matrix could help solve the problem. **However, if bit life is too short,
try a lower number matrix.**"* That last clause is the complete two-way rule,
and it is exactly the shape of a game tuning decision.

`[EPI-BIT]` again on the same axis: *"let's say you are using a HERO 7 or an
AZURE in hard ground and the penetration rate starts to diminish. Your next
choice should be a HERO 9 or a KUBY."*

### The matrix ladder — a numeric table for the game

`[HERO8]` publishes Mohs bands per matrix number:

| Matrix number | Mohs band | Notes `[HERO8]` |
|---|---|---|
| 3 | 3.0 – 5.5 | *"Recommended in a pie-shape configuration to allow a greater evacuation of drill cuttings"* |
| 5 | 4.0 – 6.0 | *"larger synthetic diamonds for optimal penetration in a variety of grounds"* |
| 7 | 5.0 – 6.5 | *"available in a variety of crown configurations"* |
| 8 | 5.5 – 7.0 | *"medium-hard to hard ground conditions, such as granite and gneiss"* |
| 9 | 6.0 – 7.5 | *"Matrix allows easy sharpening and long lasting life"* |
| 11 | 6.5 – 7.5 | *"Extremely sharp matrix provides more bite than lower level matrices"* |
| 13 | 7.0 – 8.0 | *"Good self-sharpening qualities"* |

Line series (the whole family covers Mohs 3.5–8 `[MET]`): a **standard** line,
an **abrasive** line, an **anti-polishing/underground** line, a **PCD/coated**
line for complex formations, and a **wide-range** line for variable ground
`[MET]`, `[HERO8]`.

### Independent confirmation of the rule (four ways)

The rule is counter-intuitive enough that it is worth showing it verified from
four unrelated directions before building a game on it.

1. **The mechanism.** *"as the bit cuts through rock, the matrix erodes at the
   same rate as the diamonds wear and become rounded, with this continuous
   erosion exposing fresh, sharp diamonds"*
   ([Sinocoredrill](https://www.sinocoredrill.com/news/choosing-the-right-diamond-bit-matrix-the-sinocoredrill-advantage-337150.html)).
   No erosion, no fresh diamonds.
2. **Stated outright.** *"for hard, abrasive formations (granite, quartzite,
   basalt, gneiss with Mohs hardness 7–9), a **softer matrix** is required because
   hard rock provides little abrasion to wear the matrix… for soft, less abrasive
   formations (limestone, shale, sandstone, marl), a **harder matrix** is required
   to resist premature wear"*
   ([diamondcorebitmfg](https://www.diamondcorebitmfg.com/matrix-hardness-selection/),
   [rockdrillingrig](https://www.rockdrillingrig.com/news/how-to-select-the-right-jcdrill-core-bit-according-to-rock-hardness-240720.html)).
3. **A second vendor's series numbering.** *"Coarse-grain, abrasive formations:
   use **lower** bit series numbers (harder matrix). Fine-grain, non-abrasive
   formations: use **higher** bit series numbers (softer matrix)"*
   ([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).
4. **A third vendor's, on a 1–16 scale.** *"1 being the hardest matrix and 16
   being the softest"*, with *"the higher the number indicating harder, finer
   grained, more competent and non-abrasive rock types the bit is capable of
   drilling"* ([Hayden](https://haydenbit.com/projects/choosing-a-bit/)).

Points 3 and 4 use different scales and agree exactly with `[EPI-BIT]`'s
*"bits with a higher number, like a 9, are softer than bits with a lower number,
like a 7."* **Four independent vendors, one rule.**

> **One outlier, and it is wrong.** One vendor page states *"soft matrix bits
> (35–45 HRA) are designed for drilling soft to medium formations… the matrix
> must always be softer than the formation"*
> ([wuxipolysource](https://www.wuxipolysource.com/news_show/239.html)). It
> contradicts every other source and the self-sharpening mechanism itself, and it
> also uses HRA where everyone else uses HRC. **Do not build on it.** Logged here
> so nobody re-derives the wrong rule from the same page later.

### The rock-to-matrix-hardness map

Ten matrix grades on the Rockwell C scale, mapped to rock type
([diamondcorebitmfg](https://www.diamondcorebitmfg.com/matrix-hardness-selection/)):

| Matrix HRC | Rock it is for |
|---|---|
| **HRC 50** (hardest matrix) | clay, shale, siltstone, gypsum |
| HRC 48–50 → 45–48 | sandstones, limestones |
| HRC 40–45, 38–42, 38 | marbles, diabase, andesite |
| HRC 35–38, 32–35 | granite, basalt |
| **HRC 20–25, 10–20** (softest matrix) | rhyolite, siliceous rock, dense quartzite, ironstone |

Read the **rock column**, not the label: the harder and less abrasive the rock,
the lower the matrix HRC. *(That source's own prose mislabels HRC 50 as
"softest"; the numeric Rockwell scale and the rock mapping are the reliable
parts.)* Compare `[HERO8]`'s Mohs bands in the table above — the two systems
describe the same axis from opposite ends.

### The five-step selection procedure, as a game flow

([Boart Longyear](https://www.boartlongyear.com/insite/longyear-bits-selecting-the-right-bit-in-5-easy-steps/))

1. **Decide penetration vs bit life.** *"Sometimes, it's more beneficial to cut
   faster even if it means tripping more."* — a genuine strategic choice, not a
   dominant option.
2. **Determine ground hardness with a Mohs scratch-test kit.** *"If the numbered
   tip scratches the rock, the rock is softer than the number on the tip."*
3. **Match to a series.** The bands are colour-coded — *"Purple = Mohs 1–4.5
   (soft) … Red = Mohs 7.5–9 (hardest)."*
4. **Choose waterway geometry** (see §B2).
5. **Test and log.** *"penetration rate on every run, Mohs hardness every run,
   bit life of every bit."*

Step 2 and step 5 together make the scratch test a **per-run action**, not a
one-off — which is exactly the loop §F4 proposes.

### Rock names on the hardness axis

The matrix selection chart in `[HERO8]` labels its Mohs bands with real rock
types — use exactly these for the game's strata:

| Band | Rocks named `[HERO8]` |
|---|---|
| **Soft** | Talc, Calcite, Sandstone, Shale |
| **Medium** | Dolomite, Haematite, Basalt |
| **Hard** | Diorite, Granite, Quartz, Silicified rock |
| **Very hard** | Gneiss, Quartzite |
| **Extremely hard** | Jasperite, Taconite |

Note **taconite** and **haematite** on that chart: iron ore. `[MET]` names a
matrix *"Optimized for iron ore exploration drilling"* and `[EPI-BIT]` says of
the triple-deep/sand waterway that it is *"a very popular choice for iron ore
formations."* Iron is the abrasive-ground boss fight and the sources treat it as
its own category.

### Abrasiveness is a separate axis from hardness

`[EPI-BIT]`: *"This is another ground condition that can be challenging… It can
be difficult to drill through when present in **any hardness of ground**.
Abrasive rock can wear down drill bits prematurely."* The abrasive matrix line
*"consists of alloys and diamonds that when combined, are very resistant to
abrasive conditions and are easy to sharpen in the hardest conditions"* — and
you should *"always look for waterway configurations that specifically address
abrasive conditions, for example, those with wider waterways that flush out
cuttings easily"* `[EPI-BIT]`.

`[DDTB]` p.7 explains the geology behind it: *"The factors most affecting the
drillability of rock are: grain size, rock hardness, weathering and fracturing.
**Larger grain size and fracturing make the rock more abrasive, while fine
grained, hard rock is less abrasive.** Weathering reduces rock strength."*

**Therefore the game needs two independent ground scalars, not one:**
`mohs` (0–10) and `abrasiveness`. They are not correlated — a coarse sandstone
at Mohs 4 can be more abrasive than a fine hornfels at Mohs 7 — and the matrix
choice is a 2-D lookup, not a slider.

`[DDTB]` p.7 also gives the caveat that saves the game from feeling like a
lookup table: *"So-called soft rocks can prove more difficult to drill than hard
rock and the same formations, in separate locations, can drill very differently.
A specific rock type can change drastically, even in the same drill hole."*

## B2. Waterway configuration — competent vs fractured

The waterways are the channels cut across the bit face. They set how much matrix
is in contact with rock, how the flush reaches the cutting face, and — critically
for the game's score — **how hard the flush hits the incoming core**.

`[EPI-LIFE]` gives the rule as a clean two-way:

> *"When drilling in **softer, unconsolidated** ground you should consider
> **wider waterways**. In soft friable formations, wider waterways produce less
> pressure on the core and the tip of the bit, while allowing better evacuation
> of cuttings. This can be further aided by choosing a deep lateral discharge or
> face discharge **to keep flow away from the incoming core as much as
> possible**."*
>
> *"When drilling in **harder, competent** ground, you should consider
> **smaller, narrower waterways**… smaller passages will allow the same flow to
> come through at a higher pressure. This will provide greater cooling at the
> tip of the bit, where the diamonds are working hard at cutting the rock, but
> can be damaging to softer formations."*

And on fractured ground specifically, `[EPI-BIT]`:

> *"a bit with a triple deep waterway configuration is ideal for fractured rock.
> It is designed to allow better water flow to the bit **with reduced risk of
> eroding the core**… The lateral angle and the deeper waterways combine to
> provide the maximum flushing capability possible with this type of design.
> This configuration is a good choice for hard and abrasive ground conditions as
> well as soft, broken ground. It is a very popular choice for iron ore
> formations."*

### The waterway table with real dimensions

The most implementable waterway reference found — each geometry with the ground
it is for and a quantified effect
([Dimatec waterway configurations](https://www.dimatec.com/drilling-products/diamond-impregnated-core-bit/waterway-configurations/)):

| Geometry | Ground it is for | Quantified effect |
|---|---|---|
| **Regular 'W'** | fractured formations; thin-kerf and wireline bits | canal waterways **~3 mm (0.12 in)** wide, ejecting at the crown OD |
| **T-Turbo 'TT'** | hard / very hard, solid or slightly broken — **not** highly fractured | reduces bit-face contact by **~15%**, prevents slurry buildup, *"will generally cut with less bit load"* |
| **Trapezoidal 'TXW'** | where higher flushing volume is needed | **+20% flushing capacity**, ~10% contact-area reduction vs 'W' |
| **Extra-extra-wide 'XXW'** | hard consolidated formations, **deep holes 300 m+**; **NOT** soft formations at risk of core degradation | **~40% greater flushing**, waterway **6.3 mm (0.25 in)**, *"relatively low fluid pressure at the bit face"* |
| **Free Flow 'FF'** | soft, friable formations; hard ground with softer bands | deep input passages *"minimize the erosive action"* on the core; resists port blockage and matrix glazing |
| **Face-Discharge 'FD'** | **soft, unconsolidated formations; triple-tube wireline** | ejects through **face ports**, not the ID → *"**minimum core wash and reduces the potential for undesirable core erosion**"*; canal 6.3 mm, port Ø **4.8 mm** |
| **Slot Face-Discharge 'SFD'** | high-viscosity fluids (foam); silt-blocking conditions | slot ports resist blockage, *"minimal bit face fluid turbulence"*; **N-gauge (76 mm) or larger, kerf ≥ 12.7 mm** |
| **Vortex 'VX'** | soft to medium-hard | helix canals with *"impellor action"*, **+25% to 40% penetration**, clears cuttings without inter-run flushing — but cools differently, so *"may need one matrix grade harder"* |

A second manufacturer sells the same axis as **open area**: 30% open (fastest
cutting) / 25% / 20% (longest life)
([Boart Longyear](https://www.boartlongyear.com/insite/longyear-bits-selecting-the-right-bit-in-5-easy-steps/)).
A third names **Deep I.D. waterways**, which *"maximize the waterway depth on the
I.D of the bit, which reduces the jetting or washing away of the core"*
([Son-Mak](https://son-mak.com.tr/core-bit-configuration-and-dimensions-chart/)).

> **The clincher that ties geometry to a specific damage mode:** "mushroom core"
> — extreme core-spin in weak rock caused by excessive water at the face —
> *"**Open-channel bits exacerbate this; face-discharge bits are preferred for
> weak formations**"*
> ([Coring Magazine](https://coringmagazine.com/article/induced-fractures-damage-diamond-core/)).
>
> So the rule is directional and implementable: **wide-open waterways (XXW,
> Turbo) flush hard and belong in competent rock and deep holes; face-discharge
> and deep-ID waterways keep the flush off the core and belong in weak, friable,
> unconsolidated ground.** Running a wide-open bit into saprolite should be a
> scripted core-loss event.

### Configuration catalogue

Discharge geometry `[EPI-BIT]`, `[EPI-ROP]`: **standard waterways (SWW)** ·
**deep waterways (DWW)** · **lateral discharge (LD)** · **deep lateral discharge
(DLD)** · **face discharge (FD)** · **face discharge with blocked waterways
(FDWBWW)**.

Face pattern `[DDTB]` p.30–31, `[EPI-LIFE]`:

| Pattern | Source says |
|---|---|
| **Standard** | *"Provides great fluid circulation from the inside to the outside diameters"* — the long-established default |
| **Cyclone** | *"specifically angled waterways… excellent ejection of drilling fluids… Works best in broken ground and clay"* |
| **Pie-shaped** | *"pie-shaped openings to ensure greater ejection of rock cuttings that may block waterways… recommended for higher rotation speeds"*; `[DDTB]`: *"the most popular option… often the preferred choice when drilling in abrasive conditions"* |
| **Turbo pie-shaped** | *"a freer cutting bit… can reach higher penetration rates"*; `[DDTB]`: *"suitable for competent ground condition"* |
| **Jet / Jet-Enhanced** | *"Free cutting crown profile designed for 26mm bits with robust geometry. Excellent choice for competent and non-abrasive rock formations"*; `[DDTB]`: *"strong segments suitable for broken ground conditions… optimized for reduced water consumption"* |

Crown height / impregnation depth `[EPI-BIT]`, `[EPI-LIFE]`: standard is
**13 mm**; high-crown options come in **16, 20 and 26 mm**. *"Generally
speaking, bits with a higher impregnation depth are recommended for deeper drill
holes"* `[EPI-BIT]` — because each metre of crown height is metres of hole you
do not have to trip out for.

Waterway **count** is a third knob: *"To obtain more cutting ability from the
bit with less weight on the bit (WOB), you should consider adding more waterways
to your configuration"* `[EPI-LIFE]` — more waterways = less face area in
contact = the same force concentrated on fewer diamonds = cuts freer at lower
WOB, which is exactly what an underrpowered or deep-string rig needs.

Rig-matching rule `[EPI-BIT]`: *"If you are using an older, gear-driven drill
rig with more power and less rotation, then you should choose a bit with a
standard configuration. If you are using a high powered, hydraulic drill rig
capable of much higher rotation speeds but less torque, then a turbo pie-shaped
configuration would be a good choice. If you are using a lower powered,
underground drill rig, then a thin-walled, turbo pie-shaped configuration should
work best."*

## B3. Symptoms of a wrong matrix — the wear-pattern diagnosis table

This is the best single mechanic in the source material. `[EPI-LIFE]` pp.16–19
and `[DDTB]` pp.18–24 both publish a wear-pattern troubleshooting chart; they
agree and complement each other. Merged below. **This is the game's post-run
inspection screen.**

### 0 — Ideal wear (the target)

`[DDTB]`: *"Bit feels sharp to the touch. Good comet tails (diamonds on bit face
well supported at the back side by metal alloy). The wear is even on OD and ID
within gauge."* `[EPI-LIFE]`: *"Even wear to the carbides with the diamonds
evenly worn… the full depth of impregnation is evenly consumed."*
**Action:** *"Continue to use the same drill settings unless the conditions
change."*

### 1 — Polished / glazed crown → **matrix too HARD**

| | |
|---|---|
| **Looks like** | *"Bit doesn't cut and diamonds appear polished"* `[EPI-LIFE]`. *"Smooth to the touch. Matrix smeared, glazed appearance. No comet tails. Waterways restricted"* `[DDTB]` |
| **In-game read** | ROP collapses while torque stays low. Pump pressure normal. |
| **Rock cause** | *"Formation has changed to harder, fine grained and less abrasive conditions"* `[DDTB]` |
| **Drilling cause** | *"Drilling pressure too low for the speed of rotation. Water flow too high"* `[EPI-LIFE]`, `[DDTB]` |
| **Fix (parameters)** | *"Reduce the rotation speed and increase drilling pressure. Reduce water flow"* `[EPI-LIFE]` |
| **Fix (tooling)** | *"Select a bit from a higher series (softer matrix)"* `[EPI-LIFE]`; *"Strip or dress the bit before starting to drill"* `[DDTB]` |

### 2 — Diamonds overly exposed / matrix erosion → **matrix too SOFT**

| | |
|---|---|
| **Looks like** | *"Matrix wears before diamonds have worn out. Diamonds pop out prematurely, reducing bit life"* `[EPI-LIFE]`. *"Very rough to the touch. Rapid crown wear. Diamonds overexposed. Gauges eroded"* `[DDTB]` |
| **In-game read** | ROP fine, but metres-per-bit falls off a cliff. |
| **Rock cause** | *"Formation may have changed and is too coarse grained, fractured or abrasive for the bit used"* `[DDTB]` |
| **Drilling cause** | *"Drilling pressure too high for the speed of rotation. Water flow is too low"* `[EPI-LIFE]`; *"The content of solids in the drilling fluid may be too high"* `[DDTB]` |
| **Fix (parameters)** | *"Increase speed of rotation and reduce the drilling pressure. Increase the water flow"* `[EPI-LIFE]` |
| **Fix (tooling)** | *"Change the bit for a lower series (harder matrix)"* `[EPI-LIFE]`; or a *"different waterway design"* `[DDTB]` |
| **Aftermath** | *"Advance carefully when re-entering the hole if there has been a lot of gauge wear"* `[DDTB]` |

### 3 — Burnt bit / matrix melted → **flush failure**

| | |
|---|---|
| **Looks like** | *"Matrix has completely melted, waterways are closed"* `[EPI-LIFE]`. *"Blackened areas. Smeared or broken out matrix. Closed waterways"* `[DDTB]` |
| **Cause** | *"Water ran out. Poor water circulation"* `[EPI-LIFE]`; *"Fluid flow is insufficient. Poor core barrel stabilization or rod vibration. Reaming down an undersized hole"* `[DDTB]` |
| **Fix** | *"Increase water flow. Check if the pump is working well. Check the rods for leaks in the joints. Confirm whether the inner tube is too long and adjust"* `[EPI-LIFE]` |
| **Aftermath** | *"Be very careful when restarting to drill. Watch for pump pressure cut-off, loss of ROP, loss of circulation"* `[DDTB]` |

### 4 — Concave face wear (inside wears first) → **too much WOB / core trouble**

| | |
|---|---|
| **Looks like** | *"Inside of the bit has worn down before the outside, in a concave pattern"* `[EPI-LIFE]`; *"Face wear angled to ID. ID gauge loss"* `[DDTB]` |
| **Cause** | *"Drilling pressure too high for the rotation speed. **Core left in the hole had to be drilled.** Very broken ground. **Core blocked in the inner tube**"* `[EPI-LIFE]` |
| **Fix** | *"Decrease drilling pressure. Increase rotation speed. Check the core barrel. Add drilling fluids (fractured ground). **Don't try to push through a core block**"* `[EPI-LIFE]` |
| **Consequence if ignored** | *"Continued drilling with concave face wear will cause the bit ID to ring-out"* `[DDTB]` |

### 5 — Convex face wear (outside wears first) → **flush loss / vibration**

| | |
|---|---|
| **Looks like** | *"Outside of the bit has worn down before the inside, in a convex pattern"* `[EPI-LIFE]`; *"Outer edge of the face rounded. OD gauge wear. Diamonds poorly supported"* `[DDTB]` |
| **Cause** | *"Water flow too low. Loss of water from the rods"* `[EPI-LIFE]`; *"Fractured formation. Poor core barrel stabilization or rod vibration, insufficient fluid flow. Reaming down an undersized hole"* `[DDTB]` |
| **Fix** | *"Increase the water flow. Check for leaks. Check the diameter of shell"* `[EPI-LIFE]`; *"stabilize rod and core barrel, try a different RPM… Change the reaming shell"* `[DDTB]` |
| **Consequence if ignored** | *"the bit OD to ring-out"* `[DDTB]` |

### 6 — OD gauge loss / outside ringing

Causes `[EPI-LIFE]`: *"Vibration. Rotation speed too high. Water flow too low.
Cave in, the hole was reamed. Continuous drilling in a convex wear pattern."*
Fixes: *"Increase water flow. Reduce rotation speed. Check the diameter of
reaming shell. Add drilling fluids (to reduce vibration). Try new configurations
(deep lateral discharge or deep waterway)."*

### 7 — ID gauge loss / inside ringing

Causes `[EPI-LIFE]`: *"Hole 'reamed'. Drilling pressure too high. Very broken
ground. **Core left in the hole.** Water flow too low. Matrix too soft.
Continuous drilling in a concave wear pattern."* Fixes: *"Increase rotation
speed. Reduce drilling pressure. Change for a lower series core bit (harder
matrix). Increase water flow. Check the length of inner tube."*

**Why ID gauge loss is fatal to the score:** an undersized ID cuts an undersized
core; an undersized core is not gripped by the lifter; the core stays in the
hole `[EPI-LIFE]`. That is a straight line from a parameter mistake to a
recovery penalty.

### 8 — Cracks in the waterways

`[DDTB]` p.24: *"Cracks are initiated and are visible between the bit
segments."* Causes: *"Formation may have changed to very fractured rock. The
drilling pressure is too high. **The rod or inner tube was dropped in a dry
hole.** Bit might have been crushed by a foot clamp or rod holder."* Fix:
*"Reduce the drilling pressure. In dry hole conditions, send the tube back with
the wireline."* Consequence: *"Continued drilling with a cracked bit might
result in detached segments"* — i.e. junk in the hole and a fishing job.

## B3b. The other damage catalogue — what bad parameters do to the CORE

§B3 is what the ground does to the bit. This is what the driller does to the
sample. Named damage types, with their causes, from
[Coring Magazine — *Induced fractures: damage to diamond core*](https://coringmagazine.com/article/induced-fractures-damage-diamond-core/):

| Damage | What it looks like | Cause |
|---|---|---|
| **Spiral / "pinecone" fractures** | helical breaks | torque applied during core retrieval; rod rotation while breaking the core at the bit |
| **Core-spin** | perpendicular breaks, surfaces *"polished with concentric circular markings"* | the core rotating against itself in the tube. **Destroys orientation** — *"orientation can only be tentatively inferred"* |
| **Mushroom core** | material loss, clay-like coatings | extreme core-spin in weak rock from **excessive water flow at the face**. *"Open-channel bits exacerbate this; face-discharge bits are preferred for weak formations"* |
| **Elephant / alligator skin** | disturbed outer surface | **vibration**. *"often renders core unsuitable for geotechnical testing, as surface disturbance can significantly reduce apparent strength"* |
| **Friction burns** | orange/brown discolouration | insufficient cooling — pump failure, reduced flow, blocked channels. *"may progress to catastrophic bit failure"* |
| **Variable-diameter core** | waisted or barrelled core | excessive WOB, bent barrel components, over-coring. *"longer-wavelength undulations indicate bent equipment"* |
| **Tumbled / "river rock" core** | rounded fragments | repeated impact and abrasion inside the barrel — *"often results from **drilling beyond tube length**"* |
| **Discing / petal / saddle / cupping** | stress-release features | in-situ stress, but note: disc-like features *"could be induced in granite blocks **without confining stress** through increased weight on bit"* |

Causative factors named in the same article: **excessive WOB · high torque ·
excessive vibration · rig operating beyond optimal conditions · pump fluctuations
and failures · rod friction · poor drilling-fluid properties · blocked
circulation channels · bent barrel components · worn or defective bits · loss of
circulation.**

**The line that should sit under the whole scoring system**, from the same
article:

> *"100% recovery does not guarantee that core is fit for geotechnical or
> structural purposes if disturbance is significant."*

and its recommendation, which reads like a game design brief: move *"from
recovery-based KPIs toward **operational envelope conformance**"* — score the
driller on **staying inside the torque / WOB / vibration envelope**, not only on
metres of rock in the tray.

**Natural break vs induced break.** RQD is supposed to exclude *"fractures
created during drilling"*
([NRC RQD reference](https://www.nrc.gov/docs/ml0037/ML003749192.pdf)), which is
only possible if someone records which is which. In practice *"drillers must be
marking their breaks on the core that result from fitting the core into the tray
or removal from the rods"*, and geotechnical loggers measure *"only natural, open
breaks"*
([Coring Magazine](https://coringmagazine.com/article/preparation-diamond-core-geotechnical-logging-dos-donts/)).
They are told apart by weathering and infill: induced breaks are *"sharp, clean…
no weathering or infilling"*
([RockMass core logging guide](https://www.rockmass.net/files/core_logging_guide.pdf)).

> **Game mechanic:** the player marks their own induced breaks. Marking them
> honestly protects the RQD score; the temptation not to is the moral texture of
> the job. This is the rare mechanic where telling the truth is both the right
> thing and the correct play — because unmarked induced breaks will contradict
> the recovery ribbon and the geologist will catch it.

**Core orientation tolerances**, if the game scores orientation
([Coring Magazine](https://coringmagazine.com/article/preparation-diamond-core-geotechnical-logging-dos-donts/)):
acceptable deviation between a driller's successive orientation marks is roughly
**10–15°**; orientation marks should be drawn *"no-lock to no-lock"*; depth
marking should deviate *"no more than 5–20 cm from driller's core block labels,
with less than 5 cm being preferable"*; and watch for *"creeping drift"* of
**5–10 mm per metre** accumulating.

**Standards note.** ASTM D2113 (rock core drilling) *"was withdrawn in January
2023 with no replacement"* and ASTM D6032 (RQD) was withdrawn in 2026; current
alternatives are AASHTO T 225 and ASTM D5434-25
([TMG](https://tmgmfg.com/blog/wireline-core-drilling/)). The withdrawn D2113
nonetheless contains the best hard rule available: **stop drilling when recovery
of the solid portion equals or falls below 50%**, and adjust parameters whenever
recovery drops below 100% (same source). That is a ready-made fail-state trigger.

## B4. How to sharpen a bit in the hole

This is a *live, risky, skill-expressive* action — a perfect minigame. Both
sources give the same recipe.

`[EPI-LIFE]` (aka "stripping"):

1. *"Momentarily **increase the weight on bit (WOB) by 15 to 20 percent**"*
2. *"At the same time, **reduce the water flow to near the minimum** recommended
   by the core bit manufacturer."*
3. *"When you see a **slight increase in the WOB and a spike in the rotation
   torque**, these are indications of stripping and wearing away of the matrix
   to expose new sharp diamonds. The bit should begin to cut."*
4. *"**Immediately restore the water flow** to the original volume and lower
   the WOB."*
5. *"Try adjusting your parameters to different drill settings than the ones you
   used previously, to avoid having the problem repeat itself."*

`[DDTB]` p.17 adds the cost: *"The bit can be sharpened in the hole and drilling
continued but this is a tricky operation and **may consume a lot of matrix**."*
`[EPI-LIFE]`: *"this technique will consume your matrix, the amount of which
will depend on the driller's experience, ability and reflexes."*

**Note it is done without tripping out:** *"It is not necessary to remove the
core bit from the bore hole as this can be done while drilling continues, by
changing or adjusting some of the drilling parameters"* `[EPI-LIFE]`.

`[EPI-ROP]` also documents *"core bits that are self-sharpening… a softer matrix
that has been developed to provide excellent penetration rates by allowing the
diamonds to come into contact with the ground very quickly. **Penetration rate
is optimized with regular sharpening with a high pressure feed.**"*

### A second, independent sharpening procedure — and a hard prohibition

A different manufacturer publishes a variant that is worth having because it
uses **rotation** as the second lever rather than flush
([Boart Longyear](https://www.boartlongyear.com/insite/the-science-of-drilling-are-you-getting-the-most-out-of-your-bits/)):

1. Increase WOB until **torque rises**.
2. Once penetration improves, reduce WOB to hold the desired rate.
3. If that fails, **reduce RPM by half** and wait for torque and penetration to
   recover.
4. Return to normal operation.

> **The prohibition, from two independent sources:** *"**Never use acid or shut
> off water flow while drilling** to sharpen… impregnated bits"*
> ([BLY](https://www.boartlongyear.com/insite/the-science-of-drilling-are-you-getting-the-most-out-of-your-bits/)),
> and *"**Under no circumstances should the water flow be shut off to dry strip a
> drill bit**"*
> ([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).
>
> Note the tension with `[EPI-LIFE]`'s *"reduce the water flow to near the
> minimum recommended"* — **reducing to minimum and shutting off are different
> acts**, and the gap between them is exactly where a player can ruin a bit.
> Model it: the flush slider has a red zone below minimum, and holding it there
> burns the crown (§B3 case 3).

**The abrasive trick, verified in its real form.** The field lore is "drill some
sandstone to dress the bit". What is actually documented is **loose abrasive in
the kerf**: *"Pour a **1/4-inch layer of coarse silica sand** into the kerf"* and
resume at **lower RPM for 3–5 minutes**; alternatively *"reduce water flow until
the discharge becomes visibly muddy"* until penetration improves
([Senmine](https://senmine.com/diamond-core-drill-bit-wear.html)). Deliberately
drilling an abrasive sandstone interval to dress a glazed bit is standard
exploration lore but `UNVERIFIED` — do not present it as sourced.

For surface work there is also a bench sharpening block: rub the bit *"against
the sharpening block, ensuring even contact with the diamond segments"*
([Bluerock](https://bluerocktools.com/blog/how-to-sharpen-your-diamond-core-bit/)) —
a workshop action rather than a downhole one, and a natural fit for the game's
garage screen.

**Torque behaviour during sharpening** is the tell that it is working: maximum
torque occurs *during* sharpening, as matrix contacts rock
([BLY](https://www.boartlongyear.com/insite/the-science-of-drilling-are-you-getting-the-most-out-of-your-bits/)) —
which matches `[EPI-LIFE]`'s *"a spike in the rotation torque"* exactly. Bits with
large diamonds *"can drop or stall RPM when sharpening"*, needing a lower gear for
torque (same source) — so a coarse-grit bit makes sharpening physically harder,
and that should be a property of the bit the player bought.

## B5. What the driller watches — the gauges, with numbers

### Weight on bit (feed)

`[EPI-PARAM]` p.13 / `[EPI-ROP]` p.9 — *normal recommended* bit load range:

| Size | Normal WOB |
|---|---|
| AQ | 8.9 – 18 kN (2,000–4,000 lb) |
| AQ thin kerf | 7.9 – 16 kN |
| BQ | 13 – 24 kN (3,000–5,500 lb) |
| BQ thin kerf | 11 – 21 kN |
| NQ | 20 – 38 kN (4,500–8,500 lb) |
| NQ thin kerf | 19 – 35 kN |
| HQ | 29 – 58 kN (6,500–13,000 lb) |
| PQ | 44 – 84 kN (10,000–19,000 lb) |

`[DDTB]` p.11 additionally gives a **hard structural ceiling** — different
number, different meaning, both should exist in the game:

| Size | A | B | N | H | P |
|---|---|---|---|---|---|
| **Max WOB — never exceed** | 22 kN | 30 kN | 40 kN | 50 kN | 60 kN |

with the warning: *"The maximum permitted WOB shown in the Max WOB table is
based on the structural integrity of the bit and may result in damage to the rod
and core barrel if exceeded. Excessive WOB can also lead to hole deviation."*
`[DDTB]`

`[DDTB]` p.11 lists what excess WOB actually does: *"Abnormal bit wear · Hole
deviation · Core barrel and rod damage."* And what too little does: *"the bit
will lose its ability to self-sharpen and could become polished."*

### The hidden feed mechanic — rod weight and holdback

`[EPI-PARAM]` p.12, and this is the best deep-hole mechanic in the whole
document:

> *"As you advance deeper into the hole, you will add rods and your rod weight
> will increase. It is likely that you will need to reduce your feed pressure.
> At some point if you are using many rods, **your rod weight alone can become
> more than the pressure you have been exerting, meaning that you may need to
> hold back some of your rod weight using the hydraulic holdback pressure.**
> This needs to be managed carefully and many experienced drillers 'feel' when
> the pressure needs to change or be held back."*

So the Feed control must **cross zero and go negative** past a certain depth.
An NQ rod is 22.9 kg per 3 m `[DDTB]` p.49 → 7.6 kg/m → at 300 m the string
weighs ~2,290 kg ≈ **22.5 kN in air**, already at the top of the NQ normal WOB
band before the driller has pushed at all. That crossover is a real, calculable
depth and it should be an audible/visual moment in the game.

### Rotation

Two published bands — the wide manufacturer range and the narrow practical one:

| Size | `[EPI-PARAM]` normal range | `[DDTB]` p.12 practical min–max | `[EPI-BIT]` p.11 quick chart |
|---|---|---|---|
| AQ | 800 – 2,000 rpm | 1,500 – 1,700 | 950 – 1,050 |
| BQ | 650 – 1,600 rpm | 1,200 – 1,450 | 850 – 950 |
| NQ | 500 – 1,250 rpm | 900 – 1,200 | 750 – 900 |
| HQ | 400 – 1,000 rpm | 750 – 950 | 650 – 750 |
| PQ | 300 – 800 rpm | 600 – 750 | 600 – 700 |

All three are internally consistent (the narrower bands sit inside the wide
one). **Core drilling is high-RPM, low-WOB** — an NQ core bit turns at ~900–1,200 rpm
under ~20–38 kN `[EPI-PARAM]`, `[DDTB]`. Nothing else in the game spins like
that, and the low WOB is the reason: `[EPI-PARAM]` p.12 instructs that *"the
force applied by the drill and the weight of the rods must be as low as
possible"* while still avoiding polishing. Compare the game's percussive methods,
where the whole point is energy into the rock; here the whole point is
**restraint**.

`[DDTB]` p.12: *"Excessive RPM without matching penetration rate can result in
polishing the bit and negatively affect the overall drilling economy."*

### Flush — the ground-dependent table

This is the one to implement, because it is indexed by **ground condition**, not
just size. `[EPI-PARAM]` p.10, in L/min:

| Ground | AQ | BQ | NQ | HQ | PQ |
|---|---|---|---|---|---|
| **Very hard to extremely hard, competent** | 14–18 | 23–27 | 27–36 | 36–41 | 45–50 |
| **Hard to very hard, competent** | 18–23 | 23–36 | 36–50 | 45–54 | 55–60 |
| **Other** (soft / broken / fractured) | 27–36 | 32–45 | 56–64 | 64–73 | 68–77 |

Read the columns: **NQ needs roughly twice the flush in broken ground that it
needs in hard competent ground.** `[EPI-PARAM]` p.11 explains why:

> *"in soft or fractured rock, the water flow must be high. However in a very
> hard and competent rock, where the speed of penetration is low, **the water
> flow must be reduced to enable the cutting of the rock and to reduce the risk
> of polishing the diamonds.**"*

Second table, general circulation rate irrespective of ground `[EPI-PARAM]`
p.11: AQ 5.7–13 L/min · BQ 7.6–21 · NQ 13–34 · HQ 19–53 · PQ 28–76.
`[DDTB]` p.13 gives a third, narrower practical band: A 15–20, B 30–36,
N 38–45, H 50–60, P 75–84 L/min.

What flush does, `[DDTB]` p.13: *"Removal of cuttings · Cooling the bit ·
Lubricating the bit and rod… Annular fluid velocity must be sufficient to keep
the cuttings suspended."*

What happens if it is wrong, `[EPI-LIFE]` p.13: *"Improper flushing results in a
negative impact on ROP and bit life because the rock cuttings can adhere to the
cutting face of the bit, leading to a **convex wear pattern** on the face or an
**overheating** of the cutting face."*

And the pump-headroom rule `[EPI-PARAM]`: *"The suggested water flow should be
considered as a **minimum** and the setting of your pump should be well above
this."*

Pump capability for scale `[MET]` p.20: mud pumps 74 L/min @ 50 bar and
109 L/min @ 70 bar; water pumps 106 L/min @ 200 bar and 170 L/min @ 110 bar.

### Rate of penetration

`[EPI-PARAM]` p.9 / `[EPI-ROP]` p.9, at two benchmark cutting intensities:

| Size | @ 150 rev/in (60 rev/cm) | @ 250 rev/in (100 rev/cm) |
|---|---|---|
| AQ | 13 – 34 cm/min → **7.8 – 20.4 m/h** | 8.1 – 20 cm/min → 4.9 – 12.0 m/h |
| BQ | 11 – 27 cm/min → 6.6 – 16.2 m/h | 6.4 – 16 cm/min → 3.8 – 9.6 m/h |
| NQ | 8.6 – 21 cm/min → **5.2 – 12.6 m/h** | 5.1 – 13 cm/min → 3.1 – 7.8 m/h |
| HQ | 6.6 – 17 cm/min → 4.0 – 10.2 m/h | 4.1 – 10 cm/min → 2.5 – 6.0 m/h |
| PQ | 5.3 – 13 cm/min → 3.2 – 7.8 m/h | 3.0 – 7.9 cm/min → 1.8 – 4.7 m/h |

(m/h conversion mine, arithmetic from the cm/min figures.) These are
**instantaneous cutting rates**, not shift averages — actual metres per shift
are far lower once you subtract wireline trips, rod adds, bit changes and
surveys.

### RPI / RPC — the single best "groove" metric in the sources

`[DDTB]` p.14 defines **revolutions per inch (or centimetre) of advance**:

> *"for a rotation speed of 1200 RPM and a penetration rate of 6 in (15 cm) per
> minute: RPI = 1200/6 = 200. RPC = 1200/15 = 80. **The common recommendation of
> 200 – 250 RPI (80 – 100 RPC)** can only be considered as a starting point: in
> modern drilling practices much higher penetration rates are often expected for
> a given rotation speed, resulting in a lower RPI value."*

RPI is *how many turns of the bit it takes to make one inch of hole*, and the two
failure directions map onto it exactly:

- **RPI too high** = many turns per unit advance = *"Excessive RPM without
  matching penetration rate [which] can result in **polishing** the bit"*
  `[DDTB]` p.12; also *"Drilling pressure too low for the speed of rotation"*
  `[EPI-LIFE]`.
- **RPI too low** = few turns per unit advance = *"Drilling pressure too high for
  the speed of rotation"* → **matrix erosion and premature diamond release**
  `[EPI-LIFE]`, `[DDTB]` p.19.

It is a **single scalar that combines two of the three sliders**, and it is
already the industry's own quality index. See §F.

### Vibration — the fourth gauge

`[DDTB]` p.15 lists what excessive rod vibration causes:

> *"High rig maintenance cost and early component failure · Stress fatigue and
> premature failure of drill rod and core barrel · Impacts on the bit and
> premature failure · **Loss of core** · Lower efficiency and high energy/fuel
> consumption"*

and its causes: *"Misaligned in-the-hole equipment · Undersize, worn, bent or
oval rods · Vibration induced from the chuck or drill head · Incorrect pressure
and volume of fluid · Loose rod not properly torqued · **Drilling over core** ·
Incorrect bit selection · Failed bit · Improper use of rod grease · Worn or
improper reaming shell causing insufficient core barrel stabilization."*

The resolution is skill, not equipment: *"the professional diamond driller can
usually find a combination of WOB and RPM that eliminates the excess vibration
and gives a good ROP"* `[DDTB]`. **A vibration gauge with a resonance band you
have to steer around is a better hazard than a random torque spike.**

### The single equation that replaces the RPM table

Rotation is not really set per size. It is set to a **peripheral (surface) speed
at the bit crown OD of 2.7 – 4.7 m/s (9 – 15.5 ft/s)**
([Dimatec operating parameters](https://www.dimatec.com/drilling-products/diamond-impregnated-core-bit/operating-parameters/)).

Check it against a second manufacturer's published RPM figures
([Boart Longyear impregnated bit guidelines](https://www.boartlongyear.com/wp-content/uploads/flipbook/1/files/basic-html/page37.html)):

| Size | Bit OD | Published rpm | Surface speed |
|---|---|---|---|
| BQ | 59.6 mm | 1,200 | **3.7 m/s** |
| NQ | 75.3 mm | 950 | **3.7 m/s** |
| HQ | 95.6 mm | 750 | **3.8 m/s** |
| PQ | 122.0 mm | 600 | **3.8 m/s** |

*(surface speed = π · D · rpm / 60; arithmetic mine)*

**All four sizes run the same surface speed.** So the engine should carry **one**
parameter — surface speed — and derive RPM per size. That collapses a five-row
table into one number and makes the physics visible to the player: *"a bigger bit
turns slower because the edge is going the same speed."*

### A second manufacturer's parameter table (cross-check)

([Boart Longyear](https://www.boartlongyear.com/wp-content/uploads/flipbook/1/files/basic-html/page37.html);
flow column independently corroborated exactly by
[TMG](https://tmgmfg.com/blog/wireline-core-drilling/))

| Size | rpm | WOB | Flow |
|---|---|---|---|
| BQ | 1,200 | 9 – 24 kN (2,000–5,500 lbf) | 20 – 30 L/min |
| NQ | 950 | 13 – 37 kN (3,000–8,500 lbf) | 35 – 50 L/min |
| HQ | 750 | 20 – 56 kN (4,500–12,500 lbf) | 50 – 70 L/min |
| PQ | 600 | 31 – 84 kN (7,000–19,000 lbf) | 80 – 100 L/min |

Compare `[EPI-PARAM]` (§B5 above): NQ 20–38 kN, HQ 29–58 kN, PQ 44–84 kN. **The
two manufacturers agree at the top of the band and differ at the bottom** — Epiroc
starts higher. Either is defensible; pick one and be consistent.

**A third, tighter constraint** — a contractor's *operating limit for straight
(non-deviating) holes*, which is much lower than either bit capability figure:
BQ 2,000 lb (8.9 kN), NQ 5,000 lb (22 kN), HQ 8,000 lb (36 kN), PQ 10,000 lb
(44 kN)
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).

> **Three numbers, three meanings — model all three:**
> 1. **Recommended band** — where you should be `[EPI-PARAM]`
> 2. **Straightness limit** — above this the hole starts to walk (trainee manual)
> 3. **Structural ceiling** — above this you break things: A 22 / B 30 / N 40 /
>    H 50 / P 60 kN `[DDTB]` p.11
>
> A player pushing between (2) and (3) gets metres now and a deviated hole later.
> That is a far better risk than a simple damage bar.

### Torque — the richest gauge, and how to read it

**Establish a baseline first.** Record **off-bottom torque** before drilling. For
HQ, *"your drilling torque shouldn't be more than **700 psi** higher than your
off-bottom torque"* — if off-bottom reads 1,100 psi, stay below 1,800 psi or you
*"will cause damage to your drill bit"*
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).
A **relative** torque gauge, zeroed off-bottom, is more authentic and more
readable than an absolute one.

**The two-by-two that diagnoses the matrix from the gauges alone:**

| | Low torque | High torque |
|---|---|---|
| **Low WOB** | normal light cutting | **matrix too soft** for the formation |
| **High WOB** | **bit polishing / matrix too hard** | sharpening in progress, or overload |

Sources: *"high torque with low weight suggests the bit matrix is too soft for
formation conditions"* and *"low torque with high weight"* indicates polishing
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html));
*"a simultaneous **decrease in torque and penetration rate** indicates the bit is
polishing and needs to be sharpened"*
([BLY](https://www.boartlongyear.com/insite/the-science-of-drilling-are-you-getting-the-most-out-of-your-bits/)).

**Torque rising with depth in clay** is its own event: one documented job had to
halt between **250–300 m** *"due to high torque and expanding clays"*
([Coring Magazine](https://coringmagazine.com/article/happens-hole-stays-core/)).

### Pump pressure — what each movement means

| Signal | Meaning | Source |
|---|---|---|
| **Spike at the start of a run** | the landing-indicator ball passing through its nylon bushing — the inner tube seated correctly | [trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html), [TMG](https://tmgmfg.com/blog/wireline-core-drilling/) |
| **Sudden rise while drilling** | inner tube **full or blocked** — see §B6. The gauge cannot tell you which | [TMG](https://tmgmfg.com/blog/wireline-core-drilling/), [Fordia](https://www.fordia.com/en/resources/blog/2020/diamond-drilling-101-pushing-a-block) |
| **Gradual rise while drilling** | blocked waterways or a plugging inner tube | [trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html) |
| **Loss of return** | lost circulation → *"lubrication problems and increased torque"*, friction burns on the core | [trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html), [Coring Magazine](https://coringmagazine.com/article/induced-fractures-damage-diamond-core/) |
| **Excessive face pressure** | *"can lift the bit off the rock face, causing polishing"* | [BLY](https://www.boartlongyear.com/insite/the-science-of-drilling-are-you-getting-the-most-out-of-your-bits/) |

### Annular velocity — the flush constraint behind the flow tables

The flow figures in the tables above exist to hit an **uphole velocity**. Two
sources, and the gap between them is the game:

- *"You are pumping whatever lifts cuttings at roughly **170 to 185 feet per
  minute**"* (≈ **52–56 m/min**) — target uphole velocity for BQ, NQ, PQ ~180
  ft/min, HQ ~170 ft/min ([TMG](https://tmgmfg.com/blog/wireline-core-drilling/)).
- Annular velocity *"should not exceed **50 m/min**"* to prevent hole-wall
  erosion, with optimum *"approximately **30 m/min**"*
  ([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html));
  turbulent flow above 50 m/min *"causes erosion of hole walls and potential
  cave-in."*

> One source's *target* is at or above the other's *maximum*. Both are internally
> coherent — the higher figure optimises cuttings transport, the lower protects
> the hole wall. **That is not a defect in the research, it is the actual
> engineering tension of the method**, and it is precisely what the Flush slider
> should feel like: too little and the cuttings regrind, too much and you erode
> the hole and wash the core.
>
> **And the resolution is the mud, not the pump** — see §B8: thicker fluid carries
> cuttings at *lower* velocity, so the skilled play in erodible ground is
> *thicken and slow down*, not *pump harder*.

**Penetration-rate envelope** for reference: *"2 ipm to 12 ipm depending on bit
formula and formation"* (≈ **5–30 cm/min**, i.e. 3–18 m/h); and in **broken hard
ground**, *"cut RPM in half and apply sufficient weight on bit to reach 1 to 2
ipm"* (2.5–5 cm/min)
([BLY](https://www.boartlongyear.com/insite/the-science-of-drilling-are-you-getting-the-most-out-of-your-bits/)).
That second instruction is a complete, sourced tactic for the fractured-zone
hazard: **halve the rotation, accept a quarter of the ROP, keep the core.**

## B6. Core blockage — what it is and how you know

A **core block** is the core jamming inside the inner tube instead of feeding up
it. The barrel stops accepting core; the bit keeps turning; everything that
follows is damage.

### The mechanism — the core is its own switch

This is the most elegant piece of engineering in the whole method, and it should
be modelled exactly rather than abstracted into a "blockage %" meter.

*"broken and wedge-like pieces of core can become jammed as the core enters the
inner tube"*
([Fordia / Epiroc driller's blog](https://www.fordia.com/en/resources/blog/2020/diamond-drilling-101-pushing-a-block)).
Once that happens:

> *"when core won't slide up the inner tube, the inner tube is pushed up, the
> latches stop it from sliding up the barrel, causing the **shut-off valves to
> squash and block the water**"*
> ([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html))

Stated formally in the patent literature: *"When the inner tube becomes full or
blocked at the drill bit face, the inner tube will act to move the release valve
to a position where the fluid flow ports are closed. This increase in fluid
pressure will be detected at the surface whereupon the operator will know that
the inner tube is full or blocked"*
([US Patent 10,000,982](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10000982)).

So the block indicator is **not a sensor**. It is the core itself pushing the
inner tube up against its own latches and squashing a stack of rubber discs shut.
The surface symptom: *"The driller should notice a **spike in water pressure** due
to the expansion of the shut off valves on the head assembly… Rising water
pressure is a sign that the core is blocked"*
([Fordia](https://www.fordia.com/en/resources/blog/2020/diamond-drilling-101-pushing-a-block)).

### The ambiguity that makes it a real decision

> *"Shut-off valve discs compress and expand radially against outer tube, choking
> bypass flow — **Same signal, and the gauge cannot tell you which**"*
> ([TMG](https://tmgmfg.com/blog/wireline-core-drilling/))

**A full tube and a tube blocked at 0.4 m produce an identical pressure rise.**
The driller cannot know until they pull. That is a superb mechanic: the gauge
tells you *to pull*, never *what you will find*. Pull on every spike and you lose
metres to false trips; ignore spikes and you eventually push a block.

### Valve stiffness is a player-facing choice

Shut-off valve discs are colour-coded by stiffness
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)):

| Disc | Stiffness | For |
|---|---|---|
| **Black** | soft | *"best for soft formations with core loss concerns"* — trips early, protects core, costs you trips |
| **Yellow** | medium | general purpose |
| **Red** | hard | *"suited for hard/broken formations"* prone to wedging — tolerates more before signalling |

A perfect pre-run decision with a symmetrical cost: sensitive valves cost
productivity in false trips, stiff valves cost core when you miss a real block.

### The correct procedure — four steps

([Fordia](https://www.fordia.com/en/resources/blog/2020/diamond-drilling-101-pushing-a-block))

1. **Pull back on the feed.**
2. **Allow time** for water pressure to return to normal.
3. If pressure drops, **try advancing again**.
4. *"If you cannot get any advancement without rising water pressure then you
   must **pull the tube**, remove the core and try again."*

### What happens if you push it

> *"if you continue to try to advance, the shut-off valves will become compressed
> due to the feed force being exerted. This compression will cause them to expand
> in diameter until they spread out and **touch the walls of the drill rod**."*
> ([Fordia](https://www.fordia.com/en/resources/blog/2020/diamond-drilling-101-pushing-a-block))

Three consequences, all sourced: you destroy the valve stack; you can **jam the
inner tube inside the rods** (now it is a fishing job, not a trip); and everything
cut during the push is ground to powder — the "tumbled / river rock" damage of
§B3b, explicitly attributed to *"drilling beyond tube length"*
([Coring Magazine](https://coringmagazine.com/article/induced-fractures-damage-diamond-core/)).
Plus the bit damage `[EPI-LIFE]` already documents: concave face wear and ID
ring-out.

### Two related failures

**Dry blocking.** *"Avoid dry blocking, use core lifters. **The heat generated in
dry blocking can render a bit useless**"*
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).

**Core left in the hole.** *"Use a **core picker or chopping bit** to remove lost
core"* (same source) — a distinct recovery task with its own trip cost, and the
correct answer to the *"Core left in the hole had to be drilled"* cause in §B3.

**Dry-hole (air) drilling has no pressure signal at all** — the case exists and is
documented, but the page could not be read, so the detail is `UNVERIFIED`
([Fordia](https://www.fordia.com/en/resources/blog/2020/blocked-core-in-dry-hole-drilling)).
The implication is sound and worth using: **drilling dry removes the block
indicator**, leaving the driller with penetration rate and feel alone. That is a
legitimate difficulty modifier.

**How the driller knows** — the sources give three independent tells:

1. **Pump pressure rises.** `[DDTB]` p.23, on restarting after a burn:
   *"Watch for **pump pressure cut-off**, loss of ROP, loss of circulation."*
   The blocked tube restricts the return path and the pressure climbs.
2. **ROP falls** while WOB and RPM are unchanged.
3. **Wear pattern afterwards** — concave face wear, ID gauge loss, listed by
   `[EPI-LIFE]` with *"Core blocked in the inner tube"* named as a direct cause.

**What you must not do:** `[EPI-LIFE]`, in bold in the source, *"**Don't try to
push through a core block.**"* `[DDTB]` p.16 puts the same rule in the Never
list: *"Never… **Grind the core** … Force the bit, if it will not drill with
normal pressure."*

**What it costs if you do:** you drill the core you already cut — *"Core left in
the hole had to be drilled"* / *"Drilling over core"* `[EPI-LIFE]`, `[DDTB]`.
That destroys the sample (recovery loss), rings out the bit ID, and puts you into
the vibration failure list.

## B7. Core recovery — the score, and how it is lost

> **Primary source for this whole subsection.** Annels, A. E. & Dominy, S. C.
> (2003), *"Core recovery and quality: important factors in mineral resource
> estimation"*, **Applied Earth Science (Trans. Inst. Min. Metall. B), December
> 2003, Vol. 112, pp. B305–B310**, DOI 10.1179/037174503225011306. Retrieved and
> read in full via
> [geokniga mirror](https://www.geokniga.org/bookfiles/geokniga-corerecoveryandqualityimportantfactorsinmineralresource.pdf)
> ([ResearchGate record](https://www.researchgate.net/publication/233692507_Core_recovery_and_quality_Important_factors_in_mineral_resource_estimation)).
> Cited below as **`[A&D]`**. This is peer-reviewed and it is the best source in
> the whole pack — everything a game needs to score core recovery is in it.

### The three metrics, defined properly

```
TCR = Total length of core recovered            / Drilled length × 100
SCR = Total length of core in pieces > core Ø   / Drilled length × 100
RQD = Length of core in pieces > 100 mm         / Drilled length × 100
```
`[A&D]` Eq. 1–3.

**SCR is stricter than most secondary sources say.** `[A&D]` is exact: *"with NQ
diameter core (47.6 mm), only core pieces **greater than 47.6 mm** are counted…
Core sections of this length are only included **if a full core diameter
exists**. If a core piece has a length of 60 mm, but does not possess a full core
diameter (i.e. is split longitudinally), it is not counted."* So SCR has **two**
tests — long enough **and** whole — and it is **size-dependent**, because the
threshold *is* the core diameter.

**RQD conditions** `[A&D]`: the core *"should be at least NQ (47.6 mm) and drilled
with a double- or triple-tube core barrel"*; fractures *"produced by handling or
drilling"* must be identified and **ignored**; material *"obviously weaker than
the surrounding rock (such as over-consolidated gouge) is discounted, even if it
appears as intact pieces that are 100 mm or more in length"*; lengths measured
**along the centre line**; and RQD should be determined *"for variable rather than
fixed lengths of core run"*, logging beds, structural domains and fracture zones
separately.

**Report to the nearest 2%** — TCR and SCR both `[A&D]`.

> **All three are directionally dependent.** *"RQD and, indeed, TCR and SCR are
> **directionally dependent parameters** and their values may change significantly,
> depending upon borehole orientation."* `[A&D]`
>
> That single sentence justifies the game's whole hole-angle mechanic. Two holes
> through the same rock at different angles legitimately score differently — a
> hole drilled along the cleavage returns a *"rasher of bacon"* (`[A&D]`'s own
> phrase, geological factor v), one drilled across it returns solid core. **Angle
> is not cosmetic.**

### The pass mark, verbatim

> *"Intersections to be used in a resource estimate should have a **total core
> recovery (TCR) value of at least 85%, and preferably greater than 90%**."*
> `[A&D]`

And the professional obligation attached to it, which is a better tutorial line
than anything invented:

> *"The attitude that recovery measurement is unimportant or even unnecessary must
> be dispelled. If recovery cannot be maintained at high levels due to technical
> or geological problems, then it is important that **this fact is not
> concealed**… **It is unacceptable to estimate recovery or to assume that it is
> 100%.**"* `[A&D]`

### The confidence ladder — the game's grade bands, already published

`[A&D]` Table 2 rates a core intersection by **SCR**, not TCR:

| SCR | Rating | `[A&D]` description |
|---|---|---|
| **> 85%** | 4 | **High confidence** |
| **60 – 84%** | 3 | **Moderately reliable** |
| **30 – 59%** | 2 | **Unreliable** |
| **< 30%** | 1 | **Unacceptably low** |

Ship these four words. They are the industry's own, they are peer-reviewed, and
they are more interesting than D→S because the failure is about *trust*, not
*performance*.

`[A&D]` Table 3 rates **RC** recovery statistically instead — by standard
deviations from the mean sample mass: within ±1 SD, or up to +2 SD, = **High**;
between 1 and 3 SD below the mean = **Moderate**; **above mean +2 SD =
Unreliable, flagged as contamination**; below mean −3 SD = **Unacceptable loss**.
Note that an RC sample that is *too heavy* is as suspect as one that is too
light — that is caving or carry-over, and it is the perfect RC failure state
(§A2, §F7).

### The worked example — use this as the tutorial

`[A&D]` Table 1, three 3 m intersections in the **same quartz vein**, NQ core:

| | Core A | Core B | Core C |
|---|---|---|---|
| **TCR** | 83% | **99%** | 96% |
| **SCR** | 51% | **57%** | 96% |
| **RQD** | 30% | **0%** | 96% |
| Pieces > 48 mm | 13 | 12 | 11 |
| Pieces > 100 mm | 5 | **0** | 11 |
| Rock quality | Poor | **Very poor** | Very good |

**Core B is the lesson.** *"Core B shows a TCR of 99% indicating an excellent
recovery; however, the SCR and RQD values of 57% and 0%, respectively, reveal the
true very poor quality of the core due to severe fragmentation."* `[A&D]`

A player who scored 99% recovery and 0% RQD did everything wrong and the headline
number congratulated them. **That is the argument for putting all three on the
HUD**, and `[A&D]` says so: *"the key conclusion… is that **TCR alone is not the
best indicator of core quality**. It is strongly recommended that all three
parameters are determined during logging."*

Real field examples from the same paper, all epithermal gold in Australia:
a 4.20 m run at **TCR 73 / SCR 55 / RQD 49**; a 4.35 m run at **TCR 95 / SCR 58 /
RQD 41** — of which `[A&D]` says *"Without the SCR and RQD values, the resource
estimator would have no idea of the quality of this intersection. It is highly
likely that (i) **fine material is missing** from the intersection; and (ii) that
the sampling/core cutting process was poor due to the broken core. **Any
intersection grade(s) produced from this core is likely to be suspect**"*; and the
target, a 4.60 m run at **TCR 100 / SCR 99 / RQD 99** — *"the ultimate aim of any
resource drilling programme."*

### Recovery over 100% is a bug with a real cause

*"An intersection could return a **TCR > 100%**, which could be due to measurement
problems or displacement of depth blocks. However, excessive recovery could also
be due to **retrieval of core left behind in the hole after the previous
drill-run**. In this latter case, the **preceding run will show an apparent core
loss**. This problem should be rectified before sampling of the core."* `[A&D]`

A wonderful mechanic: a run that reads 106% means the *previous* run's number was
a lie. Make the player reconcile them.

### `[A&D]`'s technical causes of core loss — a complete, citable list

*"factors that could contribute to either low recovery or to badly broken core,
**even in good ground conditions**"* `[A&D]`:

1. **Bent inner tube** — core will not travel up the tube and is ground; or it
   **rotates with the outer tube**, disturbing and grinding the core; or it fails
   to seat properly, causing **total core loss**
2. **Failure of the back-end bearing** — loss of core by grinding, and grinding
   that leaves **flat faces** on the core
3. **Bent outer tube** — inner tube fails to latch in (core loss), and less than
   full-diameter core
4. **Core spring missing, displaced, damaged, worn or not lubricated**
5. Badly worn or damaged crowns
6. Diamonds inside the kerf damaged, worn or displaced, **causing core to jam in
   the inner tube**
7. Worn stabilisers
8. **Vibration** induced by poor equipment, insecure rig mountings and hole
   deviation
9. Blocked waterways
10. Inadequate flow/pressure of flushing medium, and unsuitable flushing medium
11. Loss of water return
12. **Excessive/inappropriate head pressure and rotation rate**
13. **"Inexperienced driller or driller chasing production bonus"**

> **Item 13 is a gift.** The literature explicitly names *the production bonus* as
> a cause of core loss — and §C7 documents a real contractor paying a per-foot
> bonus above 25.0 m per shift. **Build both.** Pay the player for metres, score
> them on recovery, and let them discover the conflict themselves. That is not a
> designed tension; it is the industry's actual one.

And the single named biggest cause: *"A major cause of poor core quality and loss
is the **failure of the wireline inner tube to seat or latch properly**. This
usually results from bent inner/outer tubes, wrong inner tube length, latch
failure (broken spring), or **a hole angle that is too shallow to allow the inner
tube to travel**."* `[A&D]` — so a flat hole is mechanically harder to core,
because the inner tube has to slide down it.

### `[A&D]`'s geological causes

Soft friable ground from alteration, weathering or leaching · unconsolidated
materials · broken ground with clay infill · soluble components removed by an
unsuitable flushing medium · **low intersection angles with discontinuities**
(cleavage, bedding, joints, schistosity), *"particularly joints following the core
axis, and cleavage disking leading to a **'rasher of bacon' effect** in the inner
tube"* · high frequency of discontinuities per metre · unexpected fault zones ·
secondary porosity or vugs from karstic solution, dolomitisation or hydration of
anhydrite · cavities from karstic weathering along joints and faults, and from
mining (stopes and caved zones) · **alternating rocks of variable hardness and
abrasiveness** · over-stressing (disking on stress release) · **sheared or
brecciated host rocks associated with mineralised zones** · high clay content
blocking waterways/airways · water-saturated ground.

> **"Sheared or brecciated host rocks associated with mineralised zones."** There
> it is, from the peer-reviewed source: **the ore is in the broken ground.** The
> game does not have to invent a reason why recovery collapses exactly where the
> grade is — it is the geology.

### The four remedies, ranked by `[A&D]`

*"Many of the above problems can be ameliorated by the use of **larger diameter
barrels**, a **more suitable flushing medium** or the use of **triple-tube
barrels**. In the case of broken ground, which quickly results in the blocking of
the inner tube, the use of **shorter drill runs** is recommended, thus not
attempting to fill the inner tube to capacity."* `[A&D]`

Four purchasable/settable counters, straight from the literature — and they map
exactly onto §F4's pre-run decisions and §F2b's run-length dial.

### Why lost core is disqualifying, not merely inaccurate

`[A&D]` states the fundamental problem without hedging:

> *"no satisfactory way has been proposed to allow for the fact that **we know
> nothing about the grade of the portion of the core that has been lost**."*

Three consequences of core loss in a mineralised interval `[A&D]`:
(i) **depth and thickness estimation is difficult** for specific lithological or
grade zones; (ii) **accurate estimation of the grade is impossible**; (iii)
**accurate determination of tonnage factor is impossible** — because bulk density
is measured on the core you kept, and *"the loss may reflect poor ground which, in
turn, may be reflected in lower densities."*

And the bias, in both directions, from the source itself:

> *"If the material lost is of **lower grade** than the recovered section then
> **overestimation of grade** results, and a sample which should, perhaps, have
> been allocated to waste, is incorporated into the potential ore zone.
> Conversely, if the lost material is of **higher grade**, the resulting
> **underestimation** results in the loss of ore zone thickness if the sample is
> at the margin, or underestimation of the grade of the ore zone."* `[A&D]`

Plus a second-order problem worth a hazard of its own: *"Badly broken core may
present problems in recognition of grade changes during sampling and also **biased
sampling due to the difficulty of making an accurate longitudinal split of the
core**."* `[A&D]` — you cannot saw rubble in half, so even the sampling step
degrades.

### The diagnostic — how the geologist finds out which way the bias runs

This is a complete, sourced late-game mechanic. `[A&D]`:

- **The field questions:** *"does the mineralisation mainly occur on fractures, or
  is the core recovery lower in strongly fractured or broken zones? Is the
  mineralised zone softer than the surrounding rocks?"*
- **The statistical test:** where poor recovery is notable (*"say at least 20–30
  intersections"*), plot **recovery (SCR and TCR) versus grade** and run a
  regression. *"If the regression line is zero, then there is no correlation… If
  a random scatter is produced, then there is a negative correlation and core
  loss can be suspected of causing a **positive bias** — thus grades of
  mineralisation appear higher than they are. If the gradient of a best-fit
  regression line is positive, then a **negative bias** is likely to be
  present."*
- **The caution:** *"it should be used intelligently. For example, it is possible
  that grade can correlate with the mechanical properties of the rock, in that
  the softer sections with poor core recovery will in reality have a high
  grade."*

> **Game:** after enough holes, unlock a recovery-versus-grade scatter plot. The
> player drills 20–30 intersections, plots them, and *discovers* whether their
> campaign has been over- or under-reporting. That is a genuine late-game reveal
> built entirely from a 2003 journal paper.

**Sample support** is the quiet reason this matters geostatistically: *"0.5 m of
recovered core is being used to represent a 1 m composite"*, and in ore with a
high nugget effect *"the small sample (poor recovery) variance is much higher than
the larger sample variance"*, endangering the variogram `[A&D]`. Practical rule
from the same section: *"It is very important **not to combine a zone of say 100%
recovery with a zone of 45% recovery into one sample**."*

**When it becomes a project-killer** `[A&D]`: *"if only three or four
intersections out of, for example, a few hundred are below 85%, then the issue is
potentially not significant. However, if many intersections show a poor recovery
(say 50% with < 85% recovery) at the prefeasibility/feasibility stage, this raises
the questions of: (i) **is the database valid for resource estimation**; and
(ii) **should more drilling be undertaken**?"* — a perfect campaign-level fail
state: not one bad hole, but *too many* bad holes, checked at a milestone.

### JORC Table 1, verbatim — the reporting obligation

Retrieved and read directly from the
[JORC Code 2012 PDF](https://www.jorc.org/docs/JORC_code_2012.pdf). **Table 1
Section 1, criterion "Drill sample recovery"**, complete:

> - *"Method of recording and assessing core and chip sample recoveries and
>   results assessed."*
> - *"Measures taken to maximise sample recovery and ensure representative nature
>   of the samples."*
> - *"**Whether a relationship exists between sample recovery and grade and
>   whether sample bias may have occurred due to preferential loss/gain of
>   fine/coarse material.**"*

Three sentences, and they are exactly `[A&D]`'s three findings turned into a
reporting duty. Note the code's enforcement mechanism: every Table 1 criterion
must be addressed on an **"if not, why not"** basis — *"each item listed in the
relevant section of Table 1 must be discussed and if it is not discussed then the
Competent Person must explain why it has been omitted"* (JORC Code 2012, clause
notes). And the Code names poor recovery explicitly as a disclosure trigger:
*"Additional disclosure is particularly important where inadequate or uncertain
data affect the reliability of, or confidence in, a statement of Exploration
Results; for example, **poor sample recovery**, poor repeatability of assay or
laboratory results, etc."*

> **The best possible end-of-hole screen:** an "if not, why not" form. The player
> is shown the recovery criterion and must either report a good number or state,
> on the record, why they could not. Silence is not an option — the Code says so.
> That is a moral mechanic straight out of the real profession.

### Secondary corroboration

- *"Professional drilling crews with solid mud programs typically achieve
  approximately **95% recovery**"*
  ([Platinum Diamond Drilling](https://www.platinumdiamonddrilling.ca/post/understanding-core-recovery-in-exploration-diamond-drilling-1)).
- *"Minimum acceptable recovery: **85% TCR**"*
  ([WinDrilling](https://windrilling.com/wireline-core-drilling-complete-field-guide/)).
- The withdrawn **ASTM D2113** rule — *stop drilling when recovery of the solid
  portion equals or falls below 50%*, adjust parameters whenever recovery drops
  below 100% ([TMG](https://tmgmfg.com/blog/wireline-core-drilling/)) — a
  ready-made in-run trigger.
- RQD bands (Very Poor / Poor / Fair / Good / Excellent) and the Deere 1963/64
  attribution: [US NRC](https://www.nrc.gov/docs/ml0037/ML003749192.pdf),
  [FHWA](https://pdhonline.com/courses/c250/FHWA_Drilling_Sampling_Soil___Rock___3.pdf),
  [RockMass](https://www.rockmass.net/files/core_logging_guide.pdf).
- Stake: *"An error of just a few percentage points in grade can result in
  resource estimates being off by **tens of millions of dollars**"*
  ([moperating.kz](https://moperating.kz/en/article/qaqc-drilling-and-sampling)).

### The five mechanisms that actually destroy the score

A compact summary to hand an implementer, assembled from all sources above:

1. **Washing** — flush velocity or face pressure erodes soft or friable material
   before it enters the tube. Countered by face-discharge bits, deep-ID
   waterways, lower flow, higher viscosity. Signature: mushroom core, missing
   gouge/clay/oxide intervals.
2. **Blockage → grinding** — a wedge jams, the tube stops accepting core, and
   everything cut afterwards is powdered. Signalled by a pressure rise
   indistinguishable from "run complete". Countered by pulling immediately,
   shorter runs, triple tube.
3. **Core-spin** — the core rotates inside the barrel (failed or ungreased
   bearings, weak rock, over-torque), grinding itself and destroying orientation.
4. **Induced fracture** — excess WOB, torque and vibration break competent rock
   into sub-100 mm pieces, wrecking RQD *even at 100% TCR*.
5. **Hole instability** — caving, lost circulation, swelling clay. *"the
   formation then became unstable, water return was lost and core recovery was
   near to impossible"*
   ([Coring Magazine](https://coringmagazine.com/article/happens-hole-stays-core/)).
   The answer is fluid chemistry or casing off, **not drilling harder**.

### Additional named causes of core loss

Beyond the local-source list above
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)):
excessive water flow (*"It has a scouring effect on the matrix of the bit"*);
**high penetration rate in soft ground**, where flushing cannot keep up with
cuttings volume, leading to *"reamer lock"*; **inadequate mud viscosity** — thin
mud cannot suspend cuttings; wrong matrix for the formation; **excessive WOB in
plastic ground** — *"if the weight applied to the drill bit is too great, there is
a chance that the bit could press into the clays, blocking the water ways"*; worn
reaming shell; turbulent flow above 50 m/min; and loss of circulation. From the
resource-estimation side: *"inadequate drilling techniques, unsuitable drilling
equipment, insufficient drilling fluid properties, **excessive drill run
lengths**"*
([Dominy 2003](https://www.geokniga.org/bookfiles/geokniga-corerecoveryandqualityimportantfactorsinmineralresource.pdf)).

### Triple tube, quantified

- Triple tube = double tube **+ a split steel tube, a piston and a pump-out
  adaptor**. In a double tube the core rests against the inner tube wall; in a
  triple tube *"core sits inside the split tube instead"*, allowing *"extraction
  with far less disturbance."* Double tube is for *"competent, reasonably intact
  ground"*; triple tube for *"broken, weathered, weak, or structurally
  sensitive"* ground
  ([Sinocoredrill](https://www.sinocoredrill.com/news/double-tube-vs-triple-tube-how-to-choose-the-right-wireline-core-barrel-380578.html)).
- *"Triple tube versions — with a split inner tube — optimize recovery in broken
  formations, achieving **near 100% core retrieval**"*
  ([Pile Buck](https://pilebuck.com/core-barrels-101-practical-handbook-foundation-contractors/));
  *"nearly 100% core recovery"* by disassembling the barrel
  ([Earth Drilling](https://earthdrilling.com/us/drilling-services/triple-tube-split-barrel-coring/)).
- Even a double tube is a recovery device: *"Double-tube barrels improve core
  recovery and sample quality by **reducing internal rotation** and sample damage
  during extraction"* ([NRC](https://www.nrc.gov/docs/ml0037/ML003749192.pdf)).
- **The price, exactly:** the split tube eats radial space, so NQ 47.6 → NQ3
  45.1 mm, HQ 63.5 → HQ3 61.1 mm, PQ 85.0 → PQ3 83.1 mm core in the **same hole**
  ([BLY](https://www.boartlongyear.com/wp-content/uploads/flipbook/1/files/basic-html/page14.html)).
  For NQ that is ~2.5 mm of diameter ≈ **10% of core cross-sectional area** given
  up to buy recovery. A clean, quantified trade for a shop screen.

The three standing recommendations in the resource-estimation literature are, in
order: **triple tube · shorter runs · optimised drilling fluid**
([Dominy 2003](https://www.geokniga.org/bookfiles/geokniga-corerecoveryandqualityimportantfactorsinmineralresource.pdf)).
Those should be the prospecting skill tree's first three nodes.

### The causes named in the local sources

The Epiroc/Fordia material never defines recovery as a number, but it names the
**causes of losing core** repeatedly, and they assemble into a model:

| Cause | Source |
|---|---|
| **Core too small for the lifter to grip** (bit crushed out of round → cuts undersize core → *"the core lifter spring will not grip the core and it will stay in the hole"*) | `[EPI-LIFE]` p.10 |
| **ID gauge loss** — worn bit cuts undersize core, same failure | `[EPI-LIFE]` p.18 |
| **Core blockage** and drilling over core | `[EPI-LIFE]` p.19, `[DDTB]` p.16 |
| **Excessive vibration** — *"Loss of core"* named outright | `[DDTB]` p.15 |
| **Flush eroding the core** in soft/friable ground — the reason wide waterways and lateral/face discharge exist: *"wider waterways produce less pressure on the core"*, *"keep flow away from the incoming core"*, *"reduced risk of eroding the core"* | `[EPI-LIFE]` p.9, `[EPI-BIT]` p.7 |
| **Broken / fractured ground** — the ground itself | `[EPI-BIT]` p.7, `[EPI-LIFE]` |
| **High-pressure groundwater inflow** — an entire tool exists to fix it: *"Safely cross zones of high groundwater flow during drilling operations and still obtain good core recovery… **improving core recovery across groundwater flow zones**"* | `[MET]` p.12 |
| **Single-wall vs multi-tube barrel** — the sonic paper's controlled test found *"secondary fragmentation in the corer… mixing and segregation of the core within the corer"* with a single-walled corer, absent with the better system | `[SPORIN]` |
| **Rough handling / dropping the string** | `[DDTB]` p.16 |

`[EPI-LIFE]` frames the whole objective in one sentence, and this is the game's
thesis statement:

> *"the time spent replacing a bit is not productive. It is time during which
> you are not recovering core and **core recovery is the goal of diamond
> drilling.**"*

## B8. Drilling fluid additives — what they actually do

### The five jobs the fluid does

*"remove cuttings and transport them to surface; cool and lubricate the bit and
rods; maintain suspension of solids when circulation stops; prevent hole caving
and differential sticking; create a protective **filter cake** on the formation
walls"* — and *"Incorrect mixing and, or lack of drilling fluids can cause major
problems down hole"*
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).

Job three — **suspension when circulation stops** — is the one games always miss.
The mud has to hold the cuttings up while the pump is off during a wireline trip,
or the hole packs off around the string while you are on the winch.

### Marsh funnel viscosity — the measurement to put on screen

**Method:** block the funnel outlet, fill to the mark, and time the drain into
the cup
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html));
formally, *"adding one LITER of mud to the marsh funnel, and then measuring the
time, in seconds, required to drain one quart"*
([PVI](https://pvisoftware.com/drilling-glossary/marsh-viscosity.html)).

| Fluid | Marsh (s) | Uphole velocity |
|---|---|---|
| **Fresh water baseline** | **27** | — |
| Low viscosity | 28 | 0.6 m/s |
| Medium viscosity | 35 | 0.4 m/s |
| High viscosity | > 50 | 0.2 m/s |
| **General target** | **30 – 40**, *"depending on the ground conditions"* | — |

Source: [trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html).
Broader industry range: *"Typical funnel viscosity times for drilling fluids
range from **25 to 70 seconds**"* ([drillingformulas.com](https://drillingformulas.com)).
Effective viscosity is *"approximately proportional to excess Marsh funnel time
beyond 24.5 seconds"*, formalised as μₑ = ρ(t − 25)
([SPE/OnePetro](https://onepetro.org/DC/article)).

> **Note the inverse relation — this is the mechanic.** Thicker mud carries
> cuttings at a *lower* uphole velocity. So in erodible, core-washing ground the
> skilled play is **thicken the mud and slow the pump**: you get the transport
> without the scouring. And *"inadequate mud viscosity"* is itself a listed cause
> of core loss, because *"thin mud cannot suspend cuttings effectively, creating
> friction around drilling equipment"*
> ([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).
>
> **Add a fourth control: a Marsh-seconds target for the mud.** It is a real
> number, it is measured with a funnel and a stopwatch, and it changes what the
> Flush slider means.

### A documented real field mix

For unstable sand and gravel, per **1,000 L of water**
([Coring Magazine](https://coringmagazine.com/article/happens-hole-stays-core/)):

| Amount | Product class | What it does |
|---|---|---|
| **4 L** | vegetable-based lubricant / torque reducer | *"reduces in-hole friction and wear"* |
| **2 L** | dry-polymer blend for unconsolidated ground | *"a drilling fluid capable of stabilizing the most difficult sand and gravel formations"* — prevents wall collapse and core crumbling |
| **0.5 L** | clay inhibitor | inhibits clay expansion |
| — | **target viscosity** | **~55 – 60 seconds Marsh** |

Note the target is above the general 30–40 s band — because the ground is the
problem, not the cuttings. That is exactly the kind of context-dependent recipe a
mud-mixing screen should reward.

### The additive families as a shop taxonomy

From a major fluids supplier's own catalogue
([IMDEX / AMC drilling fluids](https://www.imdex.com/product-listing/drilling-fluids)),
mapped to the classes already listed from `[RS-FLUID]`:

| Family | Function / target ground |
|---|---|
| **Bentonite** (standard, high-yield) | *"hole cleaning and filtration control"*; can be *"prehydrated and suspended to mechanically stabilize the wellbore"* |
| **Filtration-control polymer** (polyanionic cellulose, PAC) | filtration control in water-based systems |
| **PHPA** | *"boost viscosity and lubricity and provide **clay inhibition**"* |
| **Suspension polymer** (xanthan class) | *"solids suspension"* — the pump-off job above |
| **Anti-chatter / friction polymer** | *"reducing **rod chatter** and friction"* — the direct counter to the vibration failure in §B5 |
| **Rod grease** | barium-based greases for diamond drill rods |
| **Lubricant / torque reducer** (vegetable-oil based) | *"extreme pressure lubrication properties designed for improved penetration rates and extended bit life"* |
| **Foaming agent** (fresh and saline water grades) | air/foam drilling |
| **Hole stabiliser** | *"proactive approach to minimizing torque and fluid losses"* |
| **Lost circulation** | fluid loss in *"porous and fractured formations"*; fibre products that *"bridge and plug voids and fractures"*; and a swelling plug that *"**absorbs up to 500 times its original volume in water**"* |
| **Shale inhibition — KCl** | potassium chloride or glycols reduce shale swelling ([indicative](https://www.lanzochem.com/blog/what-to-look-for-in-drilling-fluids-for-complex-geological-drilling-tasks)) |
| **Water conditioner** | for recycled or hard artesian water |

Lubricants specifically *"eliminate rod vibration and reduce rotary torque by
depositing a soft, tenacious film of grease on the outside of the rods"*
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)) —
so the mud program is a direct input to the vibration gauge, not just to flushing.

**Lost-circulation ground types**, for the geology model: *"fractured lost
circulation, karst cave lost circulation, and permeability lost circulation"*,
each needing a different LCM
([NCBI](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10648103/)). `GAMEDESIGN.md`
§3 already has a karst-void hazard; this says karst, fracture and porous ground
should each want a **different** plugging product, which turns one hazard into
three.

`[RS-FLUID]` is a real 53-line drilling-fluid product list with one-line
functional descriptions. Stripped of product names, it is the complete additive
taxonomy for exploration drilling:

| Function | Description in `[RS-FLUID]` |
|---|---|
| **Viscosifier — bentonite** | *"Sodium bentonite" / "Wyoming sodium bentonite" / "Bentonite viscosity booster"* |
| **Viscosifier — polymer** | *"Biodegradable natural polymer" / "Dry polymer" / "Liquid polymer" / "High performance liquid polymer"* |
| **Viscosifier — cellulose (PAC)** | *"Low viscosity cellulose polymer" / "High viscosity cellulose polymer" / "High performance cellulose polymer"* |
| **Viscosifier — biopolymer (xanthan)** | *"Biopolymer for enhanced gel strength" / "Dispersible biopolymer for enhanced gel strength"* |
| **Clay inhibitor / stabiliser** | *"Liquid clay inhibitor" / "Clay inhibitor" / "Low viscosity dry polymer clay stabilizer"* |
| **Clay dispersant / breaker** | *"Clay dispersant"* — the opposite job; you use one or the other, never both |
| **Lost circulation material (LCM)** | *"Coarse swelling polymer for lost circulation" / "Fine swelling polymer for lost circulation" / "Lost circulation material"* |
| **Hole stabiliser, loose ground** | *"Drilling system for loose unconsolidated formations" / "Shear stabilizing system" / "Shear stabilizing system for underground drilling"* |
| **Hole stabiliser, air drilling** | *"Air drilling hole stabilizer"* |
| **Hole stabiliser, RC-specific** | *"Specialty product for stabilizing RC holes"* |
| **Sand control** | *"Drilling system for loose unconsolidated formations"* (sand-fix class) |
| **Foaming agent** | *"Foaming agent" / "High performance foaming agent" / "Foam booster/Stiff foam" / "Polyurethane foam"* |
| **Lubricant — rod** | *"Liquid rod grease" / "Diamond drilling rod grease"* |
| **Lubricant — bit/barrel** | *"Diamond drilling lubricant for fresh water" / "High performance biodegradable lubricant" / "Biodegradable lubricant for poor quality water" / "Core barrel soap"* |
| **Penetration enhancer** | *"Penetration enhancer for Diamond Drilling"* |
| **Hammer oil** | *"Biodegradable hammer oil" / "…with graphite"* — DTH/RC only |
| **Flocculant** | *"Flocculant"* — drops solids out in the sump |
| **Biocide / bactericide** | *"Bactericide" / "Biocide"* |
| **Water conditioner** | *"Water softener"* |
| **Grout / plug** | *"Flash setting grout" / "Gypsum cement"* — for sealing a lost zone or abandoning a hole |
| **Degreaser / detergent** | *"Solvent free degreaser" / "Drilling detergent"* |

`[EPI-LIFE]` p.20 names the two functional classes that matter most to bit life:

> *"**Reduction of torque** leads to longer life of your drilling equipment.
> Torqueless is an environmentally safe product that can be used alone or in
> combination with other additives to **lubricate and cool the core bit**… The
> DD-2000 also **raises the viscosity of the drilling fluids so that cuttings
> can be more easily flushed out.** One added benefit is that DD-2000 is
> non-abrasive and when mixed with Torqueless, it results in longer bit life."*

`[EPI-LIFE]` p.19 also prescribes fluid additives as the **fix for two specific
wear faults**: *"Add drilling fluids (fractured ground)"* for concave wear, and
*"Add drilling fluids (to reduce vibration)"* for OD gauge loss. So mud is not
just plumbing — it is a live tuning input against named failure modes.

Mixing gear `[MET]` p.6: *"Having a mud mixer on the job is a must to get a
smooth and consistent mix of drilling additives and water"* — a hydraulic mixer
at ~5 gal/min @ 2,000 rpm, 5 hp, 2,000 psi max.

Also stocked as consumables `[MET]` p.7: **multi-purpose grease** (*"Prevents
wear inside core barrels… protection against water washout"*) and **thread
compound / pipe dope** (*"Prevents wear and galling… Recommended for rods and
casing"*).

## B9. Handling — the do / never list

Straight from `[DDTB]` p.16 and `[EPI-LIFE]` pp.10–12, because these are the
micro-decisions a driller will recognise instantly:

**Always** `[DDTB]`
- *"Treat diamond bits with care and store properly"*
- *"**Start fluid circulation before running the bit to the bottom**"*
- *"Start a new bit several centimeters above the bottom and spin into the
  formation. **Do not go to full ROP until you have drilled 10–20 centimeters
  (4–8 inches)**"*
- *"Check all rod joints for leaks"*
- *"Check the rod and core barrel for alignment"*
- *"Keep the inside of the rod and core barrel free from scale and dirt"*
- *"**Make sure the reaming shell is within gauge and outlasts the bit**"*

**Never** `[DDTB]`
- *"Drop the bit onto the hole bottom"*
- *"**Start turning the bit with weight on it**"*
- *"**Collar a hole with a new bit**"* — you burn a good crown on the roughest
  ground of the whole hole
- *"Allow the bit matrix to come into contact with a pipe wrench"*
- *"**Grind the core**"*
- *"Allow vibration to occur"*
- *"Force the bit, if it will not drill with normal pressure"*

Plus, from `[EPI-LIFE]`:
- Never use the chuck to force the core barrel through the rod holder — *"Ideally,
  you should do this by hand… suspended by the hoisting cable"* p.11
- The rod holder must be **locked open** or *"lateral pressure on the core bit
  can distort its shape from round to oval"* p.10 → undersize core → lost core
- Descending through the casing shoe: *"The jaws on the chuck and the rod
  handler should work in tandem as the bit lowers. Rushing through this
  operation can lead to a slip-up where neither is holding the rod and **the
  string is dropped**"* p.11
- The mitigation, which is beautiful and belongs in the game: *"It is always
  good practice to lower the rod string **with the inner tube latched in place,
  this will restrict water flow and slow the descent** in the event of a dropped
  rod string"* p.11
- **Graphite plug** — protects the crown on the way down, but *"they are not
  indestructible, so dropping a core bit too quickly with the assumption that
  the graphite plug will protect it from damage, is a mistake"* p.11
- Know where the bottom is: *"Keep your log book up to date with detailed and
  precise information. Check the log book and make sure you always stop a few
  feet before the bottom of your bore hole"* p.12

**Recovery tooling exists because things get stuck.** `[MET]` p.12 / `[DDTB]`
p.55 document a fishing tool where *"Drilling water pressure triggers the tool's
three locking keys on the inside diameter of the equipment, which allows the
rods or casing to be recovered almost every time, without damage."* A stuck-string
rescue in the game should require **pressure**, not just tapping.

## B10. The drill string itself — four named failure modes

Source: `Epiroc Guide Protecting and Handling your Drill Rods.pdf` — call it
`[EPI-ROD]`. Four distinct rod failures, each with a cause and a cure, each a
usable game event.

**1. Thread galling.** *"Galling happens with drill rods when high torque or
loading cause seizure or binding of the metal threads. There is pressure between
the female and male threads and **most often the culprit is dirt, or dust that
has not been properly cleaned** from the threads."* It compounds: *"The problem
becomes worse when you use a male end that is damaged and try to thread it onto
an undamaged female end. The damaged thread will damage the good one and the
problem multiplies."* End state: *"extreme difficulty in unscrewing the rods, and
can mean **you may have to scrap the rods**."* `[EPI-ROD]`

The trap for players who think grease fixes everything: *"Many drillers believe
that if they apply a thread compound or grease before use, it will protect
against galling. **Using grease or compounds before threading will not work well
unless the threads have been cleaned beforehand.**"* `[EPI-ROD]`

Cure: clean with a metal brush, wipe with a rag, then apply thread compound
*"with a paint brush… a thin coat, like a coat of paint"*; the compound *"should
contain at least 50% zinc"* `[EPI-ROD]`.

**2. Stripped threads.** *"the rod threads can become stripped if you force a
rotation and the threads have not connected properly. Jamming and wedging can
occur as well. **This can occur when a driller or helper is rushing to make a
connection.**"* `[EPI-ROD]` — i.e. the punishment for missing the rod-add timing
window that `GAMEDESIGN.md` §3 already describes.

**3. Dents and "stabbing".** *"'Stabbing' is another common problem, **especially
on hydraulic rigs that have automatic rod handlers**, or improperly adjusted
power float systems. This occurs when two rods are being made up and the pin
'stabs' the box thereby damaging both rods. These rods can then damage others if
they are not removed from the system. **The problem can compound quickly.**"*
`[EPI-ROD]`

A damaged rod that stays in the rack infects the rack. That is a genuinely good
inventory mechanic: a bad rod must be *found and pulled*, or it spreads.

**4. Leaking rods.** *"As the threaded rods wear, or are damaged prematurely by
abuse or misuse they will eventually leak. **This will reduce the water pressure
and the water flow to the bit.** This can have a bad effect on the bit causing
premature wear and tear and shortening its life. Poor or no lubrication of the
drill string can cause vibration and increased torque."* `[EPI-ROD]`

This closes a loop that appears three separate times in §B3: *"Check the rods for
leaks in the joints"* is the prescribed fix for a **burnt bit**, and *"Loss of
water from the rods"* is a named cause of **convex face wear** `[EPI-LIFE]`. So a
worn rod string quietly de-rates the flush slider without the player touching it —
an excellent hidden-degradation mechanic.

**The upgrade that pays for itself: double-start threads.** *"A drill rod with a
double-start thread… has **two leading edges** that catch the thread, with one
180 degrees across from the other. This makes the connection easier to find,
**requires only half a revolution** and reduces cross-threading."* And: *"[they]
will **thread and unthread twice as fast** as standard rod threads, so adjusting
your parameters may be necessary."* `[EPI-ROD]`

Halving rod-add time is a real, sourced, purchasable upgrade — and the caveat
that you must re-tune afterwards keeps it from being a free win.

`[EPI-ROD]` also gives the honest framing for why any of this matters:
*"**Penetration rate is considered the most important metric or Key Performance
Indicator (KPI).**"*

---

# C. The professions

`DOMAIN.md` §7 already lists **Core Driller** and **Exploration Geologist** under
"Other specialisations". This section documents the whole crew behind those two
labels.

> **Currency note.** All EUR figures are converted at the
> [ECB euro reference rates, 3 September 2026](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html):
> USD 1.1615, AUD 1.6147, CAD 1.6019, SEK 11.1245 per EUR. The source currency is
> stated every time. Do not put a bare EUR number in the game without the source
> currency behind it.

## C1. The roles, and what each one actually does on a shift

### Driller

Runs the rig and the crew. From a live North American contractor posting: operate
the rig, **supervise the drill helpers**, handle rods and tools, collect core
samples, **mix drilling fluids**, maintain equipment, operate support vehicles
(heavy machinery, forklifts), monitor safety, complete shift reports; must lift
23 kg (50 lb)
([Provo Mining](https://provomining.com/jobs/diamond-drillers/)). The Australian
framing is the same job: drillers *"operate rig equipment, manage drilling depth
and pressure, supervise offsiders, complete safety checks and logs"*
([National Courses](https://nationalcourses.edu.au/how-to-become-a-driller-or-drillers-offsider-in-australia-a-complete-guide/)).

The judgement calls in §B are his: matrix choice, when to sharpen, when to stop
for a core block, when to hold back the string weight. `[DDTB]` p.7 frames the
relationship with the geologist exactly, and this line should be somewhere in the
game:

> *"Successful exploration drilling results from a clear understanding and
> cooperation between two professionals, the diamond driller and the geologist.
> Drilling operations are controlled by geologists but they lack the knowledge
> and experience to optimize the operation of the drill. **The professional
> diamond driller should not hesitate to share his knowledge to improve
> operations.**"* `[DDTB]`

### Offsider (AU) / Helper (CA, US) — the same job, two names

Both terms are confirmed. In Canada the *official occupational title* in the
national wage system is **"Driller Helper – Surface Mining"** / **"Driller Helper
– Underground Mining"**
([Job Bank NOC 24609](https://www.jobbank.gc.ca/marketreport/wages-occupation/24609/ca)).
In Australia it is **offsider**
([SEEK](https://au.seek.com/diamond-driller-offsider-jobs)).

What he physically does, from live job ads and a contractor's own FAQ:
**rod handling** (*"lifting drill rods up to 40 kg"*), **rig maintenance and
servicing**, **bagging samples**, **cleaning equipment**, **rig mobilisation and
demobilisation**
([DDH1 FAQ](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/),
[Redfield Resources](https://www.redfieldresources.com.au/careers/fifo-drillers-offsider-labourer-starting-on-42-50-minimum/));
plus **moving rigs and equipment between sites, connecting power cables and
hoses, obtaining core samples, mixing and testing drilling fluids, operating
pumps**
([Atlam Group](https://www.atlamgroup.com/drillers-offsider/)), and
**loading/unloading tools, rig setup and breakdown**
([National Courses](https://nationalcourses.edu.au/how-to-become-a-driller-or-drillers-offsider-in-australia-a-complete-guide/)).

The environment, in the contractor's own words: physically demanding, outdoor
work that is *"dirty, dusty or…very muddy"*, temperatures *"extremely hot to very
cold"* ([DDH1](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/)).

### Core technician / field assistant

Handles the core between the rig and the lab. From a published working QA/QC
protocol
([Maple Gold Mines](https://www.maplegoldmines.com/index.php/en/projects/qa-qc-qp-statement/20-qa-qc)):

- Core is **trucked from the rig to the camp after each shift, by the drill
  contractor**.
- Core is **photographed wet and dry**, *"typically four boxes per image with an
  ID legend."*
- A **qualified technician saws the sampled core in half** along a cut-line
  marked by the geologist **to preserve orientation**; one half is witness
  material, the other is assayed.

Core boxes: *"shallow wooden boxes about **150 cm by 30 cm with 3 to 6
compartments** running lengthways"*, with depth markers
([The Gold Advisor](https://thegoldadvisor.com/free-maven/explaining-exploration-what-is-drilling/)).
RC chips go into *"long, thin plastic cases with a row of half-cup size
sections"*, one section per ~1 m interval (same source).

### Exploration geologist

**Logging.** Core recovery and RQD are calculated and **marked on the drill hole
geology log**; the core is **washed** so structures and textures are visible
([GAEA](https://gaeatech.com/knowledge-center/core-logging-qaqc-mineral-exploration/)).
Logging is done into a database system, and **sample intervals are marked on the
core with a coloured wax pencil**
([Maple Gold](https://www.maplegoldmines.com/index.php/en/projects/qa-qc-qp-statement/20-qa-qc)).

**Core orientation.** Determines the core's original in-ground position; combined
with downhole surveys it lets the geologist measure bedding, fractures and veins
for the geological model. On a modern orientation tool, **the driller enters the
depth at each orientation**, and the tool logs *"accelerometer data, inclination,
roll, gravity, temperature and button presses"*; **two tools alternate so there
is no interruption between runs**; quoted accuracy **0° to ±88° dip**
([IMDEX](https://www.imdex.com/rock-knowledge/structural-geology/act-iii)). The
physical marking action: *"roll the inner tube until the bubble sits between two
black lines, then mark bottom-of-hole with the marking jig"*
([tool manual](https://www.manualslib.com/manual/1950245/Reflex-Act-Iii-Rd.html)).

**Sampling.** *"Samples mostly at **1.0 m intervals**, adjusted to respect
geological contacts and isolate narrow high-grade structures"*
([Maple Gold](https://www.maplegoldmines.com/index.php/en/projects/qa-qc-qp-statement/20-qa-qc)).
That last clause is the geologist's real skill: sampling *to the geology*, not to
a grid.

## C2. Crew size, shifts and roster

- Rigs run **24 hours a day, 7 days a week** — two **12-hour shifts** per day
  ([DDH1](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/)).
- Crew structure is **one driller supervising helper(s)** per shift, explicit in
  the contractor posting *"supervising drill helpers"*
  ([Provo Mining](https://provomining.com/jobs/diamond-drillers/)).
- `UNVERIFIED` — the exact standard headcount per rig per shift. The commonly
  stated **1 driller + 1–2 offsiders** could not be pinned to a hard citation.
  Do not put a specific number on screen as a fact; show the roles instead.

**Rosters** — these map straight onto `PLATFORM_TRUTH.md` Part B's rotation field:

| Pattern | Detail | Source |
|---|---|---|
| **2 weeks on / 1 week off** or **4 on / 2 off** | **12-hour shifts, 84-hour working week.** Day shift 05:00–17:00 or 06:00–18:00; night 17:00–05:00 or 18:00–06:00. Most 2-week rosters run **7 days then 7 nights** — you swap halfway through the swing. **Night shift is compulsory. No days off while away.** | [DDH1](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/) |
| **2:1 or 4:2**, FIFO | FIFO from a capital-city airport | [Redfield](https://www.redfieldresources.com.au/careers/fifo-drillers-offsider-labourer-starting-on-42-50-minimum/) |
| Underground **2/1**, surface up to **4/2** | ~06:00–18:00, with a **24-hour break at the day/night changeover** | [Atlam](https://www.atlamgroup.com/drillers-offsider/) |
| **10–14 hour** shifts | typical day 04:30–18:00 with a 30-min lunch | [National Courses](https://nationalcourses.edu.au/how-to-become-a-driller-or-drillers-offsider-in-australia-a-complete-guide/) |
| **20 days on / 10 off**, 12 h/day | North America | [Provo Mining](https://provomining.com/jobs/diamond-drillers/) |

**Game note:** the **7-days-then-7-nights swap mid-swing** is a far better
mechanic than a static rotation field. It gives the game a reason to change the
lighting halfway through a contract — and `GAMEDESIGN.md` §6 already promises
golden-hour lighting, so a forced night half is a free visual set-piece with a
real-world justification.

## C3. Camp and site life

Two distinct accommodation classes, and the difference is the point
([DDH1](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/)):

- **Mine sites** — permanent accommodation, a mess, recreation facilities.
- **Exploration sites** — *"caravans and portable bathrooms"*, basic meal-prep,
  no gym.

Exploration crews generally use small temporary modular camps; FIFO workers share
quarters and a communal dining hall
([Rapid Camps](https://rapidcamps.com.au/blog/fifo-vs-drive-in-camp/)).

**Helicopter-supported work** — see §E2 for the rig side. The economic driver:
heli-transport cost scales with module weight, so minimising module mass is what
makes remote programmes viable at all
([BlueMax](https://bluemaxdrilling.com/heli-portable-drilling)). Pads are
**timber-constructed** rather than graded
([ConeTec](https://www.conetec.com/equipment/Heliportable)).

**Mental health — texture the game should not flinch from.** Psychological
distress is roughly **3× higher** among remote mining workers than the general
Australian population; **over a third** of FIFO workers score above clinical
cutoffs for depression, anxiety or stress, and **10% score above all three**
([Mining Mental Health Group](https://www.mmhg.com.au/blog/depression-and-anxiety-in-mining-and-fifo-work-australia)).
The counterpoint, worth including so the picture is honest: geologists
specifically report **high job satisfaction** and adapt well to FIFO
([Taylor & Francis](https://www.tandfonline.com/doi/abs/10.1080/03717453.2016.1239036)).

## C4. Safety — the real hazards, with real incident data

**The rod line is the signature injury.** A regulator safety bulletin records a
drill rig operator who **lost a finger when six rods (~24 kg) fell back down the
hole and severed it**, and a database check that found **16 similar incidents**
where operators or assistants suffered hand injuries retrieving a drill string
([NSW Resources Regulator SB11-01](https://www.resources.nsw.gov.au/sites/default/files/documents/sb11-01-drill-rig-operator-sustains-a-serious-hand-injury.pdf)).

Industry-wide: **hand and finger injuries are over 40% of total recordable
injuries annually** in drilling; **70%** of hand injuries involve inadequate or
missing protection; **20%** of disabling workplace injuries involve hands; **30%**
stem from wrong or ill-fitting gloves; the average cost of a lost-time puncture
wound is **USD 53,000 (~€45,600)**. The named mechanisms are **hands inside open
pipe ends during hoisting** (crush and amputation), rotating equipment, unguarded
casing ends and burrs, and entanglement of rings or loose clothing
([The Driller / IADC](https://www.thedriller.com/articles/91639-tips-for-hand-safety-on-drilling-jobs)).
Rotating and moving parts cause injuries and fatalities, aggravated by faulty
hydraulic or compressed-air systems
([SafetyCulture](https://safetyculture.com/topics/drilling-safety)).

This is exactly why `[MET]` p.8 markets head assemblies that *"eliminated the
weak and potentially hazardous components of a standard core barrel, the
spearhead and spring pins"*, why `[MET]` p.16 lists *"protecting safety guards
[that] protect the operator from moving parts"*, and why `[A3S]` prints a WARNING
panel — *"Always use the safety pin outside borehole · Always put the device in
'loaded' position outside borehole · Use proper PPE and tools when manipulating
the product · Inspect the device before every use for worn or damaged parts."*

`[DDTB]` p.6 gives the crew-level rules, and they read like game hint text:

> *"An accident is an unplanned event caused by an unsafe act or condition… Wear
> well-fitting protective clothing · Wear your hard hat, eye protection and safety
> boots · Use your safety belt and life line · **Don't wear rings and jewelry at
> work** · Use the right tool for the job · Don't try to repair moving machinery ·
> **Don't rush** · Keep your work place neat and safe · Lift heavy objects
> properly · Check wire rope and other equipment regularly · Replace worn
> equipment."* `[DDTB]`

**Pre-start requirements (Australia):** National Police Clearance (within 3–6
months), pre-employment medical with drug and alcohol screen, hearing, lung and
fitness assessment, and a **White Card**
([National Courses](https://nationalcourses.edu.au/how-to-become-a-driller-or-drillers-offsider-in-australia-a-complete-guide/),
[Redfield](https://www.redfieldresources.com.au/careers/fifo-drillers-offsider-labourer-starting-on-42-50-minimum/)).

`UNVERIFIED` — **HUET is not confirmed as a requirement for heli-supported
*land* exploration drilling.** HUET is offshore-driven. `DESIGN_EXPANSION.md` §3
correctly attaches BOSIET/HUET/FOET to offshore; do **not** extend them to
heli-portable exploration without a source.

## C5. QA/QC — the geologist's real mechanic

This is the best under-used mechanic in the whole section, and it has published
numbers. From a company's own working protocol
([Maple Gold Mines](https://www.maplegoldmines.com/index.php/en/projects/qa-qc-qp-statement/20-qa-qc)):

- *"**At least 5% total (we use 6.5%) QA/QC samples** including duplicates,
  standards, and blanks."*
- *"~**5% of pulps re-assayed at a second lab.**"*
- **Standards** (certified reference material) are inserted at **both low grade
  and high grade** — you need to know the lab is right at the grade that matters.
- **Blanks** are homogeneous marble with known background values — they catch
  **carry-over contamination** between samples at the lab.
- **Field duplicates are quarter splits**: a quarter is split off the sampled
  half, half is retained as witness; the two quarter splits are averaged and
  compared against the half-core result.

**Why this belongs in the game.** It is a genuine, cheap, recurring decision with
a real failure state: insert too few control samples and a bad batch of assays
goes undetected, so a "discovery" turns out not to be one. Insert too many and
you are paying the lab to assay marble. A **5–6.5% insertion rate** is a
concrete, sourced target the player can hit or miss.

**Sample-train QA/QC on the RC side**: cuttings rise through the inner tube to a
**cyclone**, then over a **splitter** into sample bags; the representative split
is typically **2–3 kg per metre**, and samples are usually collected as **1 m
intervals**
([alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods),
[Harlsan](https://www.harlsan.com.au/what-is-rc-drilling/)).

## C6. Tickets and qualifications

### Drillers — Australia (the best-documented system)

**RII31820 Certificate III in Drilling Operations** is the qualification —
**13 units: 8 core + 5 electives** (at least one from Group A and one from Group
B). Duration **6–12 months**, cost around **AUD 4,500 (~€2,790)** at one RTO or
**AUD 2,450 (~€1,520)** over 12–18 months at another; minimum age 15
([AOT](https://aot.net.au/rii31820-certificate-iii-in-drilling-operations/),
[Well Control Centre](https://www.wellcontrolcentre.com.au/courses/drilling-certificates/drilling-operations/cert3-drilling/),
official record: [training.gov.au](https://training.gov.au/training/details/RII31820)).

**Core units:** BSBWHS301 Maintain workplace safety · MSMENV172 Identify and
minimise environmental hazards · RIIBEF301D Run on-site operations · RIICOM301E
Communicate information · RIIERR302E Respond to local emergencies and incidents ·
**RIINHB301E Set up and prepare for drilling operations** · RIIRIS301E Apply risk
management processes · RIISAM209E Carry out operational maintenance.

**Group A electives include:** RIIBHD301E Conduct surface blast hole drilling ·
**RIINHB304E Conduct reverse circulation drilling operations** · RIINHB311E
Conduct mud rotary drilling · RIINHB323D Conduct horizontal directional drilling.

> **Correction for the design docs:** the Australian unit prefix is **RIINHB**
> ("non-hydrocarbon boring"), **not** RIIDRIL. And note that RC drilling is its
> own competency unit — which is a ready-made in-game certificate gating the RC
> method exactly as `GAMEDESIGN.md` §4 wants.

**Tickets employers actually demand:** **White Card** (mandatory), manual C-class
licence, **First Aid & CPR (HLTAID011)**, National Police Clearance,
pre-employment medical. Strongly recommended or mandatory depending on employer:
**Heavy Rigid (HR) licence** — one major contractor makes it **mandatory, at the
candidate's expense** — **4WD training (RIIVEH305E)**, **Working at Heights**,
fire safety
([National Courses](https://nationalcourses.edu.au/how-to-become-a-driller-or-drillers-offsider-in-australia-a-complete-guide/),
[DDH1](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/),
[Redfield](https://www.redfieldresources.com.au/careers/fifo-drillers-offsider-labourer-starting-on-42-50-minimum/)).

`UNVERIFIED` — Canada's provincial "common core" driller certification. The
regulator pages returned 404.

### The driller's career ladder — with real timings

```
labourer / trainee
      ↓  Cert II
offsider / driller's assistant
      ↓  12–18 months (National Courses) or 12–24 months (Atlam) as a dedicated offsider
      ↓  Cert III in Drilling Operations
driller
      ↓  Cert IV Senior Driller — "at which point you run your own crew"
senior driller / leading hand
      ↓
team leader / site supervisor / field manager
```

Sources:
[National Courses](https://nationalcourses.edu.au/how-to-become-a-driller-or-drillers-offsider-in-australia-a-complete-guide/),
[Atlam](https://www.atlamgroup.com/drillers-offsider/),
[SEEK](https://au.seek.com/diamond-driller-offsider-jobs),
[Well Control Centre](https://www.wellcontrolcentre.com.au/courses/drilling-certificates/drilling-operations/cert3-drilling/)
(Cert III is aimed at *"Drillers Offsiders, Leading Hands, Trainee Drillers"*).

`UNVERIFIED` — the **"2IC" / "second"** intermediate grade is real industry
vocabulary but no definition or timeframe could be sourced.

### Geologists — the Competent Person / Qualified Person concept

This is the single most game-relevant fact in the geologist ladder: **only a
qualified, registered person can sign off a resource.** All three codes converge
on **five years of relevant experience**.

| Code | Requirement |
|---|---|
| **JORC (Australasia) — Competent Person** | Verbatim from the [JORC Code 2012](https://www.jorc.org/docs/JORC_code_2012.pdf): *"A Competent Person must have a **minimum of five years relevant experience in the style of mineralisation or type of deposit under consideration and in the activity which that person is undertaking**."* The activity must match: *"If the Competent Person is preparing documentation on Exploration Results, the relevant experience must be **in exploration**. If… estimating… Mineral Resources, the relevant experience must be in the **estimation, assessment and evaluation** of Mineral Resources."* The operative qualifier is *"the word 'relevant'"*, and experience in analogous deposit types can count — *"a person with (say) 20 years experience… may not require five years specific experience in (say) porphyry copper deposits"*. ([AusIMM review](https://www.ausimm.com/globalassets/downloads/jorc-competent-person---a-baseline-review-in-a-global-context-june-2022-final.pdf), [consent form](https://www.jorc.org/competent/)) |
| **NI 43-101 (Canada) — Qualified Person** | Engineer or geoscientist with **at least five years of experience** in mineral exploration, mine development/operation or project assessment; experience **relevant to the subject matter**; and **member or licensee in good standing of a recognised professional association**. Amendments effective **9 June 2023** removed the standalone education requirement and clarified that industry experience must be gained **after registration**. ([BCSC consolidated NI 43-101](https://www.bcsc.bc.ca/-/media/PWS/New-Resources/Securities-Law/Instruments-and-Policies/Policy-4/43101-NI-July-25-2023.pdf), [Cassels](https://cassels.com/insights/national-instrument-43-101-who-is-a-qualified-person-and-what-are-their-responsibilities/)) |
| **EurGeol (Europe)** | Bachelor in Geoscience or equivalent (**EQF Level 6**, min. 3 years university); **combined minimum 9 years academic + professional, with at least 5 years in professional practice** (6 if the degree is only 3 years); must demonstrate ability to work independently and supervise; **mandatory annual CPD records**. **EurGeol holders with 5+ years of relevant deposit-type experience qualify as Competent Persons under PERC, JORC, SAMCODE and NI 43-101.** ([EFG](https://eurogeologists.eu/eurgeol-title/)) |
| **P.Geo (Canada)** | Recognised geoscience degree in **geology, geophysics or environmental geoscience**; **supervised** geoscience work experience including professional practice and ethics; pass the **national Professional Practice Exam**; register with the provincial regulator. Early-career entrants join a **Geoscientist-in-Training (GIT)** programme. Exact years are set per province. ([Geoscientists Canada](https://geoscientistscanada.ca/becoming-a-p-geo.php)) |
| **RPGeo (AIG, Australia)** | Post-nominal alongside membership grade; requires **at least two proposers who are Members or Fellows, minimum four proposers total**; CPD is *"a specified number of professional development hours each year, averaged over three years."* ([AIG](https://www.aig.org.au/membership/rpgeo/)) |

**Game translation.** `PLATFORM_TRUTH.md` Part B's headline mechanic is *"expired
= cannot mobilise."* Prospecting adds a second, better one: **unqualified =
cannot sign.** The player can drill all the holes they like, but until they hold
a Competent Person / Qualified Person qualification (or hire someone who does),
they cannot publish a resource — and the discovery payout is gated behind that
signature. Five years of relevant experience is a long, meaningful progression
track, and it is exactly what the real codes require.

### The geologist's ladder

```
field assistant / core technician
      ↓  geoscience degree
Geoscientist-in-Training (GIT) / graduate geologist
      ↓  supervised experience + Professional Practice Exam
project geologist  (P.Geo / EurGeol / MAIG RPGeo)
      ↓  5+ years relevant to the deposit type
Competent Person / Qualified Person — can sign a resource statement
      ↓
senior geologist / exploration manager
```

## C7. Money

### Drillers

| Region | Source figure | EUR equivalent |
|---|---|---|
| **Canada** (NOC 83100, Job Bank 2023–24) | low CAD 28.00 · median **CAD 42.00** · high CAD 56.00 /hr | €17.5 · **€26.2** · €35.0 /hr |
| Canada — Saskatchewan (highest median) | median CAD 47.00/hr | €29.3/hr |
| Canada — NWT (highest top end) | high CAD 82.28/hr | €51.4/hr |
| Canada — Québec | 28.00 / 42.00 / 65.93 | €17.5 / €26.2 / €41.2 |
| **Australia** (SEEK, Sept 2026, Mining/Resources) | avg **AUD 115,731**/yr | **€71,700**/yr |
| Australia — Midwest WA (top location) | AUD 190,000/yr | €117,700/yr |
| Australia — Perth | AUD 175,000/yr | €108,400/yr |
| Australia — experienced ceiling | AUD 250,000–300,000/yr | €155,000–186,000/yr |
| Australia — advertised shift rate | up to **AUD 900 per shift** | **€557 per shift** |
| **USA** (Nevada contractor, live ad) | USD 32.00/hr base **+ USD 1.20/ft bonus above 82 ft/shift** + USD 95/day per diem | €27.55/hr + **€3.39/m** + €81.79/day |
| **Sweden** (SCB via SGU, mining/quarry workers) | SEK 40,000/month (men), 39,300 (women) | €3,595 / €3,533 per month ≈ €43,100 / €42,400 /yr |

Sources:
[Job Bank Canada](https://www.jobbank.gc.ca/marketreport/wages-occupation/8761/ca)
(note **97.2%** receive at least one non-wage benefit) ·
[SEEK driller salary](https://au.seek.com/career-advice/role/driller/salary) ·
[Atlam](https://www.atlamgroup.com/drillers-offsider/) ·
[SEEK diamond driller jobs](https://au.seek.com/diamond-driller-jobs) ·
[Provo Mining](https://provomining.com/jobs/diamond-drillers/) ·
[SGU](https://www.sgu.se/geopraktisk/gruvnaring/bergarbetare/hur-ar-jobbet/jobbets-villkor-bergarbetare/vad-tjanar-en-borrare/).

> **The best pay mechanic in the whole set** is the US contractor's structure:
> **base hourly + a per-foot bonus that only starts above 82 ft (25.0 m) per
> shift.** That is a production threshold with a real number, published by a real
> employer. Put it in the game verbatim (converted): *base day rate, plus a bonus
> per metre above 25 m in a 12-hour shift.*

### Offsiders / helpers

| Region | Source figure | EUR equivalent |
|---|---|---|
| **Canada** — Driller Helper, Surface Mining (updated 19 Nov 2025) | CAD 18.25–40.00/hr | €11.4–25.0/hr |
| Canada — Driller Helper, Underground | CAD 23.75–52.00/hr | €14.8–32.5/hr |
| Canada — Driller Helper, Surface, BC | CAD 20.00–38.50/hr | €12.5–24.0/hr |
| **Australia** — SEEK offsider ads | AUD 43–70/hr | €26.6–43.4/hr |
| Australia — entry level, major contractor | *"over AUD 100,000"* | > €61,900/yr |
| Australia — recruiter, entry | AUD 100,000–120,000/yr | €61,900–74,300/yr |
| Australia — live WA FIFO ad | *"starting on AUD 42.50 minimum"*, up to AUD 150,000/yr | €26.32/hr, up to €92,900/yr |

Sources:
[Job Bank 24609](https://www.jobbank.gc.ca/marketreport/wages-occupation/24609/ca) ·
[Job Bank 9163](https://www.on.jobbank.gc.ca/marketreport/wages-occupation/9163/ca) ·
[Job Bank 24609 BC](https://www.jobbank.gc.ca/marketreport/wages-occupation/24609/BC) ·
[SEEK](https://au.seek.com/diamond-driller-offsider-jobs) ·
[DDH1](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/) ·
[Atlam](https://www.atlamgroup.com/drillers-offsider/) ·
[Redfield](https://www.redfieldresources.com.au/careers/fifo-drillers-offsider-labourer-starting-on-42-50-minimum/).

**Pay structure detail worth modelling exactly:** one major contractor pays
**hourly rates during inductions, training and leave, and day rates when working
on site**, plus **production bonuses after a 6-month probation** and retention
bonuses ([DDH1](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/)).
`PLATFORM_TRUTH.md` Part B already insists compensation is a **day rate, not a
salary** — this is the nuance that makes it true: *day rate on site, hourly off
it.*

### Exploration geologists

| Region | Source figure | EUR equivalent |
|---|---|---|
| **Canada** — Exploration Geologist, NOC 21102 (2023–24) | low CAD 30.77 · median **CAD 50.00** · high CAD 100.00 /hr | €19.2 · **€31.2** · €62.4 /hr |
| Canada — Ontario (highest median) | 33.65 / **57.69** / 79.49 | €21.0 / **€36.0** / €49.6 |
| Canada — Saskatchewan | 27.50 / 52.20 / 77.88 | €17.2 / €32.6 / €48.6 |
| **Australia** — Geologist, Mining/Resources/Energy (SEEK, Sept 2026) | avg **AUD 133,040**/yr | **€82,400**/yr |
| Australia — Brisbane (top location) | AUD 161,250/yr | €99,900/yr |
| **Australia — field geologist billing rate** | AUD 55–75/hr (mid 65); manager AUD 75/hr | €34.1–46.4/hr; €46.4/hr |

Sources:
[Job Bank NOC 21102](https://www.jobbank.gc.ca/marketreport/wages-occupation/2548/ca)
(90.2% get a non-wage benefit) ·
[SEEK geologist salary](https://au.seek.com/career-advice/role/geologist/salary) ·
[Coreplan](https://www.coreplan.io/blog/exploration-teams-how-much-is-that-drill-program-really-costing-you).

**AusIMM Professional Employment and Remuneration Survey (2021 edition — bands,
not medians):** **84% of resource professionals on base salaries over AUD 90,000
(~€55,700)**; **60% also have a bonus component**; **69% of Level 4 (leadership)
roles over AUD 180,000 (~€111,500)**; earnings peak at ages **40–60**; sector
unemployment **1.6%** against a national 5.2%
([AusIMM](https://www.ausimm.com/bulletin/bulletin-articles/ausimm-professional-employment-and-remuneration-survey-2021/)).
That age-peak curve is a nice, real justification for a long XP ramp.

`UNVERIFIED` — **Finnish/Nordic driller pay** beyond the Swedish SCB/SGU figure
above; the available aggregators are internally inconsistent and should not be
used. `UNVERIFIED` — **African driller wages**; no per-person data found.

### Contractor charge-out — cost per metre

| Method | Rate | ≈ EUR/m | Source |
|---|---|---|---|
| **Diamond core** | USD 80–250/m | €69–215 | [alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods) |
| Diamond core | *"north of USD 200/m"* typical programme | > €172 | [The Gold Advisor](https://thegoldadvisor.com/free-maven/explaining-exploration-what-is-drilling/) |
| Diamond core | AUD 200/m all-up | €124 | [RC Drilling](https://www.rcdrilling.com/rc-drilling-guide/comparative-costs-of-drilling/) |
| Diamond core | $110–250/m (currency unstated; Australian operator) | €68–155 if AUD | [Novo](https://novoresources.com/exploration/glossary/drilling-techniques-costs/) |
| **RC** | USD 40–120/m | €34–103 | [alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods) |
| RC | AUD 120/m all-up | €74 | [RC Drilling](https://www.rcdrilling.com/rc-drilling-guide/comparative-costs-of-drilling/) |
| RC | $30–55/m base rate | €19–34 if AUD | [Novo](https://novoresources.com/exploration/glossary/drilling-techniques-costs/) |
| **Aircore** | $18–30/m | €11–19 if AUD | [Novo](https://novoresources.com/exploration/glossary/drilling-techniques-costs/) |
| **RAB** | USD 15–40/m | €13–34 | [alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods) |

**Rule of thumb: RC is 25–40% cheaper per metre than diamond drilling**
([RC Drilling](https://www.rcdrilling.com/rc-drilling-guide/comparative-costs-of-drilling/)).
Cost per metre **rises with core diameter and with depth** for both methods
(same source, plus [Novo](https://novoresources.com/exploration/glossary/drilling-techniques-costs/)).

**Audited real-world anchors** (from filed technical reports — the honest end of
the range):

- **111 holes / 14,539 m at ~USD 112/m (~€96/m)**; underground grade-control
  diamond drilling at the same operation **~USD 65/m (~€56/m)**
  ([SEC EDGAR technical report](https://www.sec.gov/Archives/edgar/data/1160791/000110465926031121/goro-20251231xex96d2.htm))
- **223,865 m of diamond drilling for USD 6.4 M = USD 28.6/m (~€24.6/m)** —
  underground, low-cost jurisdiction; the bottom anchor
  ([SEC EDGAR](https://www.sec.gov/Archives/edgar/data/1340677/000117625625000052/exhibit99-1.htm))
- A West African contractor with **95 rigs** reported **USD 143.1 M revenue,
  24% gross margin, 22% EBITDA margin** → **~USD 1.51 M revenue per rig-year
  (~€1.30 M)**
  ([Newswire](https://www.newswire.ca/news-releases/geodrill-announces-2024-fourth-quarter-and-year-end-financial-results-849461685.html))
- A government exploration-incentive schedule caps reimbursable **diamond
  drilling at CAD 200/m (~€125/m)** — `PARTIALLY VERIFIED`, the PDF body would
  not parse
  ([NL MIP fee schedule](https://www.gov.nl.ca/iet/files/mines-exploration-mip-fees-maximum.pdf))

`UNVERIFIED` — published contractor rate cards with actual standby €/day,
mobilisation lump sums, and depth-tier breakpoints. Depth-tiered pricing is
confirmed **as a principle**; no published tier table could be found (these are
commercially confidential).

**Hidden overhead worth modelling:** on a 7-month Australian programme, geologist
data entry at 30 min per geologist per day cost **~AUD 9,100 (~€5,640)** for two
geologists, plus **~AUD 637/month (~€395)** in invoice reconciliation —
**~AUD 13,600 (~€8,420)** of pure programme admin
([Coreplan](https://www.coreplan.io/blog/exploration-teams-how-much-is-that-drill-program-really-costing-you)).

## C8. Productivity — metres per shift

**Diamond core, per 12-hour shift:**

| Figure | Context | Source |
|---|---|---|
| **15–40 m/shift** | general range | [alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods) |
| **≤20 m per 12 h** | difficult-conditions baseline | [Cascade](https://www.cascade-env.com/drilling-technologies/diamond-coring/) |
| **13 → 19.56 → 24.15 m/shift** | documented optimisation curve over three months on one rig, Brazil — **~85% productivity gain** | [Coring Magazine](https://coringmagazine.com/article/servitec-foraco-optimized-drilling/) |
| **52 → 78.24 → 96.60 m/day per rig** | same project, 24-hour basis | same |
| **25.0 m (82 ft)/shift** | the threshold a US contractor sets before paying a production bonus — an implicit "good shift" | [Provo Mining](https://provomining.com/jobs/diamond-drillers/) |

Cross-check against §B5: NQ instantaneous ROP is **5.2–12.6 m/h** `[EPI-PARAM]`.
A 12-hour shift at even the low end would be 62 m if it were all cutting. Actual
is 15–40 m. **So roughly 50–75% of a core drilling shift is not cutting** — it is
wireline trips, rod adds, surveys, core handling and bit changes. That ratio is
the single most important number for pacing the minigame.

**Bit life on the same documented project:** H-size bits went **40 m → 90 m**
(+125%), N-size **95 m → 180 m** (+89%) after parameter optimisation
([Coring Magazine](https://coringmagazine.com/article/servitec-foraco-optimized-drilling/)).
Compare `[EPI-LIFE]`'s *"approximately 125 meters"* average — the real spread is
**40–180 m depending entirely on how well the driller drills**, which is exactly
what a skill-based game wants.

**RC and RAB, per shift:**

- **RC: 60–150 m/shift**; soft/medium ground (laterite, saprolite, oxide)
  **80–150 m/day**; depth range **50–500 m**, some 700 m+
  ([alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods))
- **RC: up to 200–300 m/day**; typical depth **300–600 m**, over 800 m in optimal
  conditions; optimum band **300–500 m**
  ([Harlsan](https://www.harlsan.com.au/what-is-rc-drilling/)) — compare `[MET]`
  p.22's rig rating of 300–400 m
- **RAB: 100–300 m/shift**, depths **10–80 m**, limited to ~100 m in
  unconsolidated ground
  ([alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods),
  [RC Drilling](https://www.rcdrilling.com/rc-drilling-guide/comparative-costs-of-drilling/))
- **Diamond core depth range: 50 – 3,000+ m**
  ([alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods)) —
  consistent with `[DDTB]`'s 1,500–3,300 m rod capacity chart.

`UNVERIFIED` — **bit-change and full rod-trip durations at depth** beyond
`[EPI-LIFE]`'s *"up to four hours"* at 800–1,000 m. Figures circulating on
low-quality vendor blogs ("~8 hours to pull rods on a 1,000 m hole") could not be
sourced properly and must not be used.

---

# E. The machines

> **Modelling note.** Everything below is a *class* description with sourced
> numbers. Per `DOMAIN.md` §6, in-game rig names must be original — the
> manufacturer names here are citations only.

## E0. The three rig characters (the useful taxonomy)

`[EPI-BIT]` p.9 splits exploration rigs by **drive character**, and the split
changes which tooling works:

| Class | `[EPI-BIT]` description | Consequence |
|---|---|---|
| **Gear-driven, high power / low rotation** | *"an older, gear-driven drill rig with more power and less rotation"* | *"choose a bit with a standard configuration"* |
| **Hydraulic, high rotation / lower torque** | *"a high powered, hydraulic drill rig capable of much higher rotation speeds but less torque"* | *"a turbo pie-shaped configuration would be a good choice"* |
| **Underground, low power** | *"a lower powered, underground drill rig"* | *"a thin-walled, turbo pie-shaped configuration should work best"* |

And the depth-fade behaviour that makes rig choice matter in a long hole:

> *"your rig's limit is 1000 meters in NQ. Once you reach 800 or 900 meters, you
> realize your rotation speed is starting to decrease. You need that rotation
> speed so your option would be to use a HOBIC 11AC or a HERO 9. Why? In order
> to compensate for the lack of rotation, you would need to use a bit with a
> softer matrix."* `[EPI-BIT]` p.9

**That is a complete game system on its own:** rig rotation capability decays
toward its rated depth, and the counter-play is a softer matrix. Not a stat
upgrade — a *tactic*.

## E1. Surface core rig — track- or skid-mounted crawler

**Silhouette.** A steel mast raised off a tracked or skid base, with a **feed
frame** the rotation head slides along; a rod-handling arm or carousel on one
side; a separate skid-mounted **hydraulic power pack**; a **water/mud pump** and
mud tank alongside; the **wireline winch** with its sheave at the mast crown;
the **water swivel** hanging under the crown block on the hoist line; a control
station facing the mast. Rod racks on the ground, core trays on trestles.

**Sourced detail** `[MET]` p.17:
- *"a gear driven rotation unit and a constant penetration rate"*
- *"compliance with the latest **EN 16228** safety standards"* — the European
  standard for drilling-and-foundation machine safety, and what puts physical
  guards around the rotating chuck on a modern rig
- *"a sturdy mast capable of handling **6 meter core barrels**"* — mast working
  length is the key dimension
- *"Large core samples"* — surface rigs are the ones that run H and P sizes

**Rod stock.** Rods come in **3 m lengths**, racked in **6 m or 9 m stands**
([explorationcoredrilling.com](https://www.explorationcoredrilling.com/quality-10096815-ntw-drill-rods-3-meters-length-for-conventional-diamond-core-drilling)),
weighing **up to 40 kg each** in the hands of the crew
([DDH1](https://ddh1drilling.com.au/careers/faqs-for-drillers-offsiders/)) —
consistent with `[DDTB]` p.49 (NQ 22.9 kg / 3 m, HQ 34.2 kg, PQ 56.0 kg).

**Depth capability** is set by three ceilings the game can model independently:
the rod string's own capacity (~1,500–3,300 m depending on size, `[DDTB]` p.48),
the **water swivel's hoist rating** (840 / 1,560 / 3,000 m in NQ for the
14,000 / 26,000 / 50,000 lb units, `[SWIV]`), and the rig's rotation power
fading with depth (`[EPI-BIT]` p.9).

**Fluid consumption, measured on a real project**
([Coring Magazine, Servitec/Foraco optimisation case study](https://coringmagazine.com/article/servitec-foraco-optimized-drilling/)):
**N-size 4.49 L of drilling fluid per metre; H-size 7.23 L per metre**; mud pit
capacity 4,000 L, emptied roughly every 150 m.

## E2. Heli-portable / modular surface core rig

**Why it exists** `[MET]` p.18: *"designed for pioneering work"* — ground with
no road access.

**What makes it different, physically** `[MET]` p.18:
- *"The rig is **split into a small number of units** which have all been
  designed to be as light as possible without compromising durability and
  strength."*
- *"Each unit is fitted with **sturdy lifting points** to make heli-transport as
  easy as possible."*
- *"Once on site, the rig can be **assembled rapidly**."*
- Power pack: a compact 4.5 L diesel with *"a class-leading power-to-weight
  ratio… compact and light for heli-transport."*

**Real module counts and depth ratings** (contractor fleet pages — cited as
sources only, do not ship the model names):

| Class | Modules | Depth rating |
|---|---|---|
| Heli-portable core rig, large | **7 parts** | NQ **800 m**, HQ 150 m, PQ 100 m ([Orezone Drilling](https://www.orezonedrilling.com/surface-division/heli-portable-diamond-rigs/)) |
| Heli-portable core rig, deep | **7 modules** | NQ **1,000 m**, BQ 1,300 m ([Geotech Drilling](https://www.geotechdrilling.com/rigs/heliportable-rigs/)) |
| Heli-portable core rig, deepest | **7 modules** | NQ **1,325 m**, BQ 1,700 m (same) |
| Single-lift light rig | **1 module** | NQ **300–365 m** (same) |

Module mass is the design constraint: modules can be **under ~860 kg (1,900 lb)**
to suit small helicopters, and *"heli-transport cost scales with weight"*
([BlueMax Drilling](https://bluemaxdrilling.com/heli-portable-drilling)).
Heli-portable rigs are set up on **timber-constructed drill pads**, small barges
or custom carriers ([ConeTec](https://www.conetec.com/equipment/Heliportable)).

**Modelling cue:** the visual signature is the **lifting eyes and the split
lines** — a heli rig looks like a kit of separate modules bolted together, with
obvious padeyes on every one, sitting on a **timber-cribbed pad** rather than a
graded bench. A 1-module rig on a small pad and a 7-module rig on a timber deck
are two visibly different game assets with two different depth caps.

## E3. Underground diamond drill

**Why it is short and fat.** Underground you have a drift back a couple of
metres above your head and no room to raise a mast. So the rig loses the mast
entirely and becomes a **feed frame on a positioner**.

**Two sub-classes in `[MET]`:**

*Boom-mounted, self-propelled* `[MET]` p.15:
- *"combines the… high productivity and accuracy of a… core drilling rig, with
  the **mobility of a robust carrier designed for underground use**"*
- *"The carrier is based upon the [underground development jumbo] platform"* —
  it looks like a small tunnelling jumbo with a core drill on the boom instead
  of a rock drill
- *"The **articulated carrier** allows it to bend around difficult contours
  while the **highly maneuverable boom** allows the drill to be positioned in
  exactly the desired location."*

*Positioner-and-turntable, set up in a cuddy* `[MET]` p.16:
- *"The sophisticated **positioner and turntable** makes it easy to reach
  desired drilling position and angle without any adjustments"* — this is how
  you shoot a **fan of holes** from one setup, including up-holes
- *"**protecting safety guards** protect the operator from moving parts and all
  operations are performed from an easy to use control panel"*
- *"a unique rod handling system that offers **complete hands free rod
  handling**. Adding and removing of drill rods, inner tubes and core barrels are
  completed by the rod handler."*

**Consequence for tooling:** underground rigs are the low-power class, so
`[EPI-BIT]` p.9 prescribes *"a thin-walled, turbo pie-shaped configuration"*, and
`[MET]` notes a matrix line that *"Provides optimum performance in underground
drilling."* Head assemblies come in a **shorter underground variant** — *"the
same safety features and reliability as the… surface version, but with a
**shorter overall assembly for easier handling** in underground operations"*
`[MET]` p.8. Water swivels likewise: *"In underground drilling the choice of
water swivel will depend on the diameter of the hole you are drilling and what
kind of core barrel you are using"* `[SWIV]`.

**Economics tell:** underground grade-control diamond drilling is markedly
cheaper per metre than surface exploration drilling — one audited operator
reported **~USD 65/m (~€56/m)** for underground grade control against
**~USD 112/m (~€96/m)** programme-wide
([Gold Resource Corp technical report, SEC EDGAR](https://www.sec.gov/Archives/edgar/data/1160791/000110465926031121/goro-20251231xex96d2.htm)).

## E4. RC rig

**The spread, not the rig.** An RC setup is a *system*, and it is visually
enormous next to a core rig:

1. The rig — *"available for assembly on a **truck or crawler chassis**"*
   `[MET]` p.22, rated *"specifically for reverse circulation drilling to depths
   of **300–400 meters**"*
2. A **primary compressor**, trailer-mounted, delivering the ~**25.5 m³/min at
   24.1 bar (900 cfm @ 350 psi)** an RC hammer needs `[MIN-RC]` pp.8–9
3. Frequently a **booster** to raise pressure further for deep or wet holes —
   `[MIN-RC]` p.13 specifies the sample system as *"High-pressure and
   high-volume air-package capable"*
4. On the rig: the **dual swivel** and **deflector box** at the head `[BL-RC]`,
   feeding a **3" or 4" sample hose** `[MIN-RC]` on a **sample hose reel** with a
   **sample support arm** `[MIN-RC]` p.12
5. The **cyclone** — ceramic-lined (*"Cyclone wear bend: Alumina Ceramic tiles;
   Barrel/drum lining: Alumina Ceramic Vortex Scroll; Base cone lining:
   Polyurethane 60 shore"* `[MIN-RC]` p.13)
6. The **splitter** under the cyclone, and the **sample bags**
7. Rod racks of heavy dual-wall pipe in 3 m or 6 m lengths, 3½"–4½" OD `[BL-RC]`

**How to tell an RC rig from a core rig at 50 m:** the RC rig has a **cyclone
and a bag rack hanging off it**, a **fat hose looping from the head down to the
cyclone**, and a **compressor the size of a shipping container** parked
alongside. The core rig has a **thin wireline running over a sheave at the mast
crown**, a **water tank and sump**, and **core trays stacked on trestles**. The
core rig site is wet; the RC site is dusty.

Rotation head detail `[MIN-RC]` p.13: *"Plus & Minus 90-degree from 0-degree for
**fan-type drilling**… high radial and axial load capacity (**30–40 tonnes**)…
'Float'-capable spindle shaft."* That 30–40 t figure is the head's load rating —
useful for scaling the model.

## E5. Sonic rig

A **sonic head** is a bolt-on: `[DT-SONIC]` shows heads mounted on ordinary
tracked geotechnical carriers, and one head is quoted at *"Approx. 520 kg"* with
water swivel. Visually the head is a **large, heavy, drum-shaped oscillator**
sitting above the rotation unit — much bulkier than a plain rotary head — with an
**air damper** (*"Type: Natural aspiration… Operating pressure 0.7 MPa"*
`[DT-SONIC]`) isolating the vibration from the mast, which is the part that keeps
the rig from shaking itself apart.

Hydraulic demand is the giveaway for the power pack: **70–124 L/min at
17.5–20.1 MPa** for the vibration unit alone, on top of the rotation unit's
82–101 L/min `[DT-SONIC]`.

The string is **double**: an inner core barrel and an **override sonic casing**
that follows it down (`[SPORIN]` Phase II), so a sonic rig always has two sizes
of tube on the rack.

## E6. Site kit that must be in the scene

| Item | Source |
|---|---|
| Water/mud pump — plunger for clean water, piston for mud/bentonite/cement | `[MET]` p.20 |
| Mud mixer, hydraulic (~5 gal/min @ 2,000 rpm, 5 hp, 2,000 psi) | `[MET]` p.6 |
| Mud pit / sump — **4,000 L**, emptied roughly every 150 m | [Coring Magazine](https://coringmagazine.com/article/servitec-foraco-optimized-drilling/) |
| Rod racks, 3 m rods in 6 m / 9 m stands | `[DDTB]`, [explorationcoredrilling.com](https://www.explorationcoredrilling.com/quality-10096815-ntw-drill-rods-3-meters-length-for-conventional-diamond-core-drilling) |
| **Core boxes** — *"shallow wooden boxes about 150 cm by 30 cm with 3 to 6 compartments running lengthways"*, with depth markers | [The Gold Advisor](https://thegoldadvisor.com/free-maven/explaining-exploration-what-is-drilling/) |
| **RC chip trays** — *"long, thin plastic cases with a row of half-cup size sections"*, one per ~1 m | same |
| Wireline winch + overshot on the wire | `[A3S]`, `[MET]` |
| Rod holder / foot clamp, chuck jaws | `[EPI-LIFE]` pp.10–11, `[DDTB]` p.24 |
| Full-grip outer-tube wrench and pipe wrenches | `[EPI-LIFE]` p.10 |
| Wooden crates for wedges — 160 kg (N), 295 kg (H) | `[PRISM]` |
| Graphite plug | `[EPI-LIFE]` p.11 |
| Thread compound and rod grease | `[MET]` p.7, `[RS-FLUID]` |
| Core photography station — core shot **wet and dry**, *"typically four boxes per image with an ID legend"* | [Maple Gold QA/QC](https://www.maplegoldmines.com/index.php/en/projects/qa-qc-qp-statement/20-qa-qc) |
| Core saw — *"a qualified technician saws the sampled core in half"* | same |

`UNVERIFIED` — drill-pad dimensions, sump sizing standards and rehabilitation
requirements. Regulator guidance (WA DMIRS, BC MEM, Ontario MNDM) would be the
right source. One hard datapoint exists: Yukon's exploration incentive program
lists **reclamation** as a fundable cost alongside helicopter, assays, wages and
fuel, and caps daily field expenses at **CAD 100 per person per day (~€62)**
([YMEP guidebook](https://yukon.ca/en/yukon-mineral-exploration-program-ymep-hardrock-modules-guidebook)).

---

# F. Game mechanics proposal

Written against `GAMEDESIGN.md` §3 (three sliders + the groove) and
`DESIGN_EXPANSION.md` §2 (recovery is the score).

## F1. What the three sliders mean in core drilling

`GAMEDESIGN.md` already has Feed / Rotation / Flushing. Prospecting re-skins them
without changing the control layout:

| Slider | Core drilling meaning | Real range (NQ) | Sourced behaviour |
|---|---|---|---|
| **Feed** | **WOB / bit pressure**, and past a crossover depth, **hydraulic holdback** | 20–38 kN normal, 40 kN structural ceiling | ↑ROP, ↑deviation risk, ↑matrix erosion; too low → **polishing** `[EPI-PARAM]`, `[DDTB]` |
| **Rotation** | **RPM** | 500–1,250 (mfr) / 900–1,200 (practical) | ↑ROP; excessive RPM without matching ROP → **polishing**; also drives OD gauge loss via vibration `[DDTB]` |
| **Flush** | **Water/mud flow at the bit** | 27–36 L/min hard competent → 56–64 L/min broken | too low → **burnt bit / convex wear**; too high in soft ground → **polishing** *and* **erodes the core** `[EPI-PARAM]`, `[EPI-LIFE]` |

**The inversion that makes core drilling feel different from every other method
in the game:** in DTH and top hammer, more flush is always safer. In core
drilling, **more flush is a way to lose**. `[EPI-PARAM]` p.11: *"in a very hard
and competent rock… the water flow must be **reduced** to enable the cutting of
the rock and to reduce the risk of polishing the diamonds."* And in soft ground
the flush is what washes your score away `[EPI-LIFE]` p.9.

## F2. The groove metric — use RPI

Do not invent a "green band". The industry already has the exact quantity, and
two independent sources publish the same band — `[DDTB]` p.14 and a separate
contractor training manual, which gives the worked example *"800 rpm divided by
4 in/min = 200 RPI"*, with **below 200 → excessive wear** (increase RPM or reduce
weight) and **above 250 → risks polishing** (reduce RPM or increase weight)
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)):

```
RPI = RPM / (ROP in inches per minute)        [DDTB p.14]
RPC = RPM / (ROP in cm per minute)
Target band: 200–250 RPI  (80–100 RPC)        [DDTB p.14]
```

The groove band is `RPI ∈ [200, 250]`, drifting with the stratum. Because RPI
divides Rotation by the ROP that Feed produces, **the player is balancing two
sliders against each other**, which is exactly the "feel" `[DDTB]` describes the
professional driller having. Above the band you are grinding → polish risk. Below
it you are gouging → matrix erosion and diamond pop-out.

`[DDTB]` even supplies the honest caveat for the tutorial: *"can only be
considered as a starting point: in modern drilling practices much higher
penetration rates are often expected for a given rotation speed, resulting in a
lower RPI value."*

**Third gauge: vibration.** `[DDTB]` p.15 gives a resonance the player must steer
around, with **"Loss of core"** named as a direct consequence. Model it as a
narrow band of (RPM × depth × rod-condition) that spikes an amplitude meter; the
cure is *"a combination of WOB and RPM that eliminates the excess vibration"*
`[DDTB]` — two sliders, not one, so it is a real puzzle.

## F2b. Three more controls the sources hand you for free

The three sliders are the moment-to-moment game. These are the *between-runs*
decisions, and each is a real number a real driller sets.

**1. Run length — 1.5 / 3.0 / 6.0 m** (§A1). Long runs mean fewer wireline trips
and more metres per shift; short runs are *"the cheapest recovery improvement
available"*
([TMG](https://tmgmfg.com/blog/wireline-core-drilling/)), and **excessive run
length** is a named cause of poor recovery in the resource-estimation literature
([Dominy 2003](https://www.geokniga.org/bookfiles/geokniga-corerecoveryandqualityimportantfactorsinmineralresource.pdf)).
One dial, the whole speed-versus-recovery tension.

**2. Shut-off valve stiffness — black / yellow / red** (§B6). Soft discs trip
early and protect core in soft ground; hard discs tolerate more before signalling
and suit hard broken ground
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).
Symmetrical cost: false trips versus missed blocks.

**3. Mud viscosity — a Marsh-seconds target** (§B8). Water is 27 s; the general
band is 30–40 s; a documented sand-and-gravel programme ran **55–60 s**
([Coring Magazine](https://coringmagazine.com/article/happens-hole-stays-core/)).
Thicker mud carries cuttings at *lower* uphole velocity, so in washing ground the
skilled play is **thicken and slow the pump** rather than pump harder. This makes
the Flush slider a two-variable control — rate *and* what you are pumping.

## F2c. Score the envelope, not only the tray

The trade press's own recommendation is to move *"from recovery-based KPIs toward
**operational envelope conformance**"*, because *"100% recovery does not guarantee
that core is fit for geotechnical or structural purposes if disturbance is
significant"*
([Coring Magazine](https://coringmagazine.com/article/induced-fractures-damage-diamond-core/)).

So run **two** scores side by side and let them disagree:

- **Outcome score** — TCR / SCR / RQD, revealed at the end of the run.
- **Envelope score** — the fraction of the run spent inside the WOB, torque,
  RPI and vibration bands, accumulated live while drilling.

The envelope score is *"what the player did"*; the outcome score is *"what the
ground did to them"*. A player who stayed in the envelope and still lost core got
unlucky ground and should be told so. A player who bullied a good hole and got
away with it should see a bad envelope score anyway — and it should follow them,
because §B3b's induced fractures show up later in the RQD.

**Zero the torque gauge off-bottom.** `[DDTB]`'s absolute numbers are less useful
than the relative rule: for HQ, *"your drilling torque shouldn't be more than 700
psi higher than your off-bottom torque"*
([trainee manual](https://pdfcoffee.com/diamond-trainee-manual-901190-2-pdf-free.html)).
A gauge that reads *excess over baseline* is both more authentic and easier to
read on a phone.

## F3. The score is core recovery %, not metres

### Definitions and grade bands to put on the HUD

Use the industry's three metrics, defined in full in §B7: **TCR** (primary
score), **SCR** (punishes grinding specifically) and **RQD** (punishes induced
fracture even at 100% TCR). Note RQD was defined for NX-size core (54.7 mm), so
it is size-dependent — a PQ hole and an AQ hole are not directly comparable.

**Grade bands come straight from the literature** — `[A&D]` Table 2 already
publishes a four-point confidence rating, on **SCR**, and the words are better
than any invented grade:

| SCR | Rating | Verdict |
|---|---|---|
| **> 85%** | 4 | **High confidence** |
| **60 – 84%** | 3 | **Moderately reliable** |
| **30 – 59%** | 2 | **Unreliable** |
| **< 30%** | 1 | **Unacceptably low** |

And the TCR pass mark alongside it: *"at least 85%, and preferably greater than
90%"* `[A&D]`. Below 85% TCR, **the intersection cannot be used in a resource
estimate** — a failure, not a smaller payout.

**And put all three on the HUD, because TCR alone will lie to the player.**
`[A&D]`'s own worked example (§B7): a run scoring **TCR 99% / SCR 57% / RQD 0%**
looks like a triumph on the headline number and is *"very poor quality… due to
severe fragmentation."*

**Recovery and RQD are calculated at the rig and written on the geology log**
([GAEA — core logging QA/QC](https://gaeatech.com/knowledge-center/core-logging-qaqc-mineral-exploration/)),
which means the *player* should be entering them, not a results screen.

### The recovery model

Run recovery starts at 100% and is eroded by named, sourced causes. Every term
traces to §B7:

```
recovery_run = 100
  − loss_ground        # fracture density of the stratum        [EPI-BIT p.7]
  − loss_wash          # flush above the ground's erosion threshold, weighted
                       #   by (1 − waterway_gentleness)          [EPI-LIFE p.9]
  − loss_grind         # RPI far below band × ground softness    [DDTB p.14/16]
  − loss_vibration     # vibration amplitude over threshold      [DDTB p.15]
  − loss_lifter        # if bit ID gauge worn past a limit, the lifter
                       #   cannot grip → step loss, not gradual  [EPI-LIFE p.10/18]
  − loss_block         # if a core block was pushed through      [EPI-LIFE p.19]
  − loss_water         # unmitigated high-pressure inflow zone   [MET p.12]
```

Two of those are **step functions, not gradients**, and that is what makes the
system dramatic: `loss_lifter` and `loss_block` do not shave a few percent off,
they take the whole run. `[EPI-LIFE]` p.10 is unambiguous — undersize core means
*"it will stay in the hole."*

### Recovery interacts with tooling, not just sliders

| Choice | Effect on recovery | Source |
|---|---|---|
| **Triple tube** (BQ3/NQ3/HQ3/PQ3) | smaller core in the same hole; *"used to recover core in fractured rock and fault zones"* | `[EPI-DT]` p.16, [Wikipedia](https://en.wikipedia.org/wiki/Exploration_diamond_drilling) |
| **Wide waterways + lateral/face discharge** | *"less pressure on the core"*, *"keep flow away from the incoming core"* | `[EPI-LIFE]` p.9 |
| **Triple-deep / sand waterway** | *"reduced risk of eroding the core"* in fractured ground | `[EPI-BIT]` p.7 |
| **Water-pressure limiter across an inflow zone** | *"improving core recovery across groundwater flow zones"*; also *"reduces operating time by up to 30%"* | `[MET]` p.12 |
| **Thin kerf** | more core, less rock destroyed — but lower permitted WOB | `[EPI-DT]`, `[EPI-PARAM]` |
| **Sonic head in unconsolidated ground** | *"no secondary fragmentation in the corer, nor… mixing and segregation"* | `[SPORIN]` |

### And it is *not* the same as metres

Keep both counters on screen and let them disagree. A hole can be 100% of target
depth and 40% recovery through the ore zone — the worst possible outcome, because
it is exactly the mineralised interval that broke up. That tension is the design.

## F4. The bit-matrix choice as a pre-run decision

**Before spudding, the player picks four things.** All four have sourced
consequences, so all four are real decisions and none is a stat check:

1. **Matrix number** (3 / 5 / 7 / 8 / 9 / 11 / 13, plus an abrasive line and a
   wide-range line). Against the stratum's `mohs` and `abrasiveness`. Bands from
   `[HERO8]`.
2. **Waterway configuration** (standard / cyclone / pie / turbo pie / jet;
   standard–deep–lateral–face discharge; narrow or wide). Against
   competent-vs-fractured. `[EPI-LIFE]`, `[DDTB]`.
3. **Crown height** (13 / 16 / 20 / 26 mm). Against hole depth — *"if you are
   averaging 200 meters with a 13 mm crown, but your borehole is 250 meters, a
   [26 mm] bit can allow you to complete the hole without changing the bit"*,
   *"up to 33% longer"*, but *"should be used in ground that is not variable"*
   `[EPI-ROP]`.
4. **Size / kerf** (AQ…PQ, standard / thin kerf / triple tube).

### The information problem — this is the good part

The player **cannot know the ground before they drill it.** `[EPI-BIT]` p.12 says
so directly:

> *"Sometimes you will be lucky enough to know in what kind of ground you will be
> starting a drilling operation, and sometimes it will be an unknown factor. If
> possible, refer to previous drilling campaigns in the area… **If it is the
> first time the area will be drilled, you may want to avoid using a premium
> bit.** Another option would be to select a drill bit that is suited for a wider
> range of ground."*

So the loop is: a **first hole in virgin ground** is drilled with a cheap
wide-range bit and produces *information*; subsequent holes on the same prospect
are drilled with the correct premium matrix and produce *metres*. A free,
authentic reason for the campaign structure.

### The scratch test — a real, cheap, diegetic minigame

`[EPI-BIT]` p.5, `[DDTB]` p.28: *"The simplest and most reliable way to determine
rock hardness is to perform a **scratch test** using an etcher kit and compare
the results with Mohs scale. If you do not have such tools, you can still
determine the hardness using a **pocket knife or a metal saw**… the average
hardness of [a pocket knife] is approximately **6.0 to 6.5** and if you are using
a **metal saw**, it should be around **6.5 to 7.0** on Mohs scale."*

A complete mechanic: with no kit, the player gets a **binary** answer ("harder
than my knife / softer than my knife") and must choose a matrix from it. Buy the
etcher kit on iMarket and you get a **number** — the matrix choice becomes correct
instead of a guess. A shop item that buys *information*, not stats.

### The mid-hole correction

When the ground changes, the diagnosis is the wear pattern (§B3) and the
correction is a matrix step. `[DDTB]` p.29 gives the complete two-way rule in one
sentence, and it should be the tooltip:

> *"if the penetration rate is too slow, using a higher matrix could help solve
> the problem. However, if bit life is too short, try a lower number matrix."*

## F5. Live loop — the wireline run cycle

The drilling loop for core is **not continuous**, and that rhythm is the method's
character. The key asymmetry, and the reason wireline exists:

> Wireline was developed so the core barrel is **pulled up inside the rod string
> on a cable**, avoiding continuously withdrawing the heavy string; it becomes
> essential at around **300 m** depth.
> ([Wikipedia](https://en.wikipedia.org/wiki/Exploration_diamond_drilling))

**Retrieving core does NOT require a rod trip. Only a bit change (or a downhole
problem) does.** That asymmetry *is* the core mechanic.

```
[ collar carefully ]  — never collar with a new bit [DDTB p.16];
                        start above bottom, spin in, no full ROP for 10–20 cm
      ↓
[ DRILL THE RUN ]     — three sliders, RPI band, vibration band
      ↓  (barrel full, or CORE BLOCK detected)
[ core block check ]  — pump pressure rising + ROP falling ⇒ STOP.
                        Pushing through = run destroyed + bit ID rings out
      ↓
[ WIRELINE TRIP ]     — drop overshot, latch, winch up, break out,
                        core into the tray, tube back down
                        (release rhythm: pull 0.3–0.6 m, drop quickly, ×6–8) [A3S]
      ↓
[ ROD ADD every 3 m ] — core rods come in 3 m lengths, racked in
                        6 m or 9 m stands. Make-up torque must be right:
                        N 600 N·m, H 1,000 N·m [DDTB p.50]
      ↓
[ BIT CHANGE ~125 m ] — FULL TRIP: rack out every stand, change crown,
                        rack back in. At 800–1,000 m: up to 4 h [EPI-LIFE]
```

**Time budget as a gauge.** `[EPI-LIFE]`'s numbers make a shift clock the real
resource: ~125 m per bit, up to 8 bit changes in a 1,000 m hole, up to 4 h per
change at depth. A 26 mm crown buying 33% more life `[EPI-ROP]` is therefore worth
roughly *one whole trip* — which is how the player should feel the price
difference in the shop.

**Calibrate the shift against reality.** See §C5: a good 12-hour core shift is
**15–40 m**, and a documented optimisation programme moved a rig from **13 →
24.15 m/shift** while simultaneously taking N-size bit life from **95 m → 180 m**
([Coring Magazine](https://coringmagazine.com/article/servitec-foraco-optimized-drilling/)).
That is exactly the arc a skill tree should let the player walk, and it is a real
one.

## F6. The assay / discovery loop — what happens after the hole

`DESIGN_EXPANSION.md` §2 sets the payment structure (day rate + recovery bonus +
discovery bonus). The steps the sources support:

1. **Drill the hole.** Score = TCR/SCR/RQD **per interval**, not just overall.
2. **Log it.** Lithology, alteration, mineralisation, structure, recovery, RQD —
   *"core recovery and RQD are calculated and marked on the drill hole geology
   log; core is washed so structures and textures are visible"*
   ([GAEA](https://gaeatech.com/knowledge-center/core-logging-qaqc-mineral-exploration/)).
3. **Orient the core** (optional, costs time, unlocks structural data). The tool
   logs *"accelerometer data, inclination, roll, gravity, temperature and button
   presses"*; **two tools alternate so there is no interruption between runs**;
   quoted accuracy **0° to ±88° dip**
   ([IMDEX](https://www.imdex.com/rock-knowledge/structural-geology/act-iii)).
   The marking action is physical: *"roll the inner tube until the bubble sits
   between two black lines, then mark bottom-of-hole with the marking jig"*
   ([manual](https://www.manualslib.com/manual/1950245/Reflex-Act-Iii-Rd.html)) —
   a two-second alignment minigame per run, and a real one.
4. **Cut and sample.** *"A qualified technician saws the sampled core in half"*
   along a cut-line marked by the geologist to **preserve orientation**; one half
   is the **witness** that stays in the tray, the other is assayed. Samples
   *"mostly at 1.0 m intervals, adjusted to respect geological contacts and
   isolate narrow high-grade structures."*
   ([Maple Gold QA/QC](https://www.maplegoldmines.com/index.php/en/projects/qa-qc-qp-statement/20-qa-qc))
5. **Insert QA/QC.** See §C4 — this is a real, cheap, high-value mechanic.
6. **Assay returns after a lead time** — grade over an interval width.
7. **Payout** = day rate + recovery bonus + discovery bonus.
8. **Discovery** unlocks a step-out pattern at the same prospect.

**The wedge is the follow-up mechanic.** `[PRISM]` gives it a real number: a
directional wedge is *"used to deflect a hole towards a specific direction,
**after it has been surveyed**"*, achieving *"a minimum deflection of
1.5 degrees"*, in a *"one-trip"* operation. So after a good intercept the player
does not start a new hole from surface — they set a wedge above the intercept and
cut a daughter hole. Cheaper, real, and it turns one deep hole into a fan.

**And the reason recovery is worth money:** low recovery *through the mineralised
interval specifically* is what kills a resource estimate. If the ore zone is the
broken zone — and it usually is, because mineralisation follows structure — then
the ore is exactly where you are most likely to lose core. Make the ore body's
fracture density high, and the recovery mechanic and the discovery mechanic
become the same mechanic.

## F7. RC as a different game with the same three sliders

| Slider | RC meaning | Sourced consequence |
|---|---|---|
| **Feed** | keeps the hammer coupled; too much stalls it | (as DTH, `FACTS_VERIFIED.md`) |
| **Rotation** | slow — indexes the bit between blows | |
| **Flush** | **air volume and pressure**, ~25.5 m³/min @ 24.1 bar `[MIN-RC]` | Not enough air below the water table → **wet sample** `[MIN-RC]` p.7 |

**The RC score is sample quality, not core recovery.** Failure modes to model,
all sourced:
- **Wet sample** — lost positive pressure at the bit face `[MIN-RC]` p.7. Counter:
  bleed chuck sleeve, booster, venturi bit.
- **Silting** — *"much lower risk of silting and other complications that cause
  expensive downtime"* with the right bit `[MIN-RC]` p.10.
- **Carry-over between samples** — the blow-back/blow-down cycle `[MIN-RC]` p.13
  exists precisely to clear the string between metres. Skip it, and metre N
  contaminates metre N+1.
- **Cyclone wear** — every wetted surface is a ceramic consumable `[MIN-RC]` p.13.
  Abrasive ground eats the sample train, not just the bit.

**Pace.** RC gives no wireline trip. It runs continuously in 3 m or 6 m rod
increments `[BL-RC]`, one sample bag per metre, to ~300–400 m `[MET]` p.22 —
**60–150 m per shift**, up to **200–300 m/day** in good ground
([alomgeomine](https://www.alomgeomine.com/blog/exploration-drilling-methods),
[Harlsan](https://www.harlsan.com.au/what-is-rc-drilling/)). So RC is a **fast,
loud, dusty, rhythm-based** counterpart to core's **slow, wet, careful,
interrupted** loop. Different music, same three sliders.

**The real campaign shape is both:** RC the pattern out fast and cheap, core the
holes that came back with grade. RC is **25–40% cheaper per metre than diamond
drilling** ([RC Drilling](https://www.rcdrilling.com/rc-drilling-guide/comparative-costs-of-drilling/)),
so the player is always trading cost against sample quality. Design the contract
board so a prospect supports an RC phase then a DD phase on the same ore body.

## F8. The economy — two rules worth building the whole shop around

**Rule 1 — the 2× multiplier.** The headline cost per metre is not the cost:

> *"Additional costs are incurred for consumables, poor drilling penetration
> rates, 'stand-by', mobilization, water cartage etc; often bringing the final
> all-inclusive drilling cost to **double the base rate**."*
> ([Novo Resources glossary](https://novoresources.com/exploration/glossary/drilling-techniques-costs/))

So quote the player a metre rate on the contract board and then bill them for
consumables, standby, mob and water. The gap between quoted and actual is the
skill.

**Rule 1b — pay for metres, score on recovery, and let the conflict bite.** The
peer-reviewed literature lists *"inexperienced driller or **driller chasing
production bonus**"* as a technical cause of core loss `[A&D]`, and §C7 documents
a real contractor paying a per-foot bonus above 25.0 m per shift. Build both
systems honestly and the tension appears on its own — which is far better than a
designed "greed meter".

**Rule 2 — contractors think in utilisation, not metres.** A listed drilling
contractor's headline operating metric is **rig utilisation** — reported at
**51% in Q2 2026 vs 35% in Q2 2025**
([Foraco Q2 2026 results](https://www.newswire.ca/news-releases/foraco-international-s-a-q2-2026-results-895484873.html)).
Once the player owns more than one rig, *keeping them turning* becomes the game,
not any individual hole. That is the natural late-game objective for the
prospecting branch and it comes straight out of how the industry actually
measures itself.

Contract rate structure to mirror in the game
([King & Spalding](https://www.kslaw.com/blog-posts/drilling-contracts-avoiding-misunderstanding-2),
[Lexology](https://www.lexology.com/library/detail.aspx?g=60f13531-f11f-493b-ba29-a31006870213),
[Coreplan](https://www.coreplan.io/blog/exploration-teams-how-much-is-that-drill-program-really-costing-you)):
**metre rate · schedule of rates · standby rate (hot standby, cold standby,
standby-with-crew) · mobilisation and demobilisation · operating rate · repair
rate · force majeure rate · zero rate (contractor at fault) · directional /
survey / grouting rates · consumable cost structure (flat fee, or fee plus a set
percentage) · minimum shift rate.**

That list is a ready-made contract screen. **"Zero rate — contractor at fault"**
is the punishment clause: break your own string and the day stops paying.

## F9. What the cross-section should show that no other industry does

`GAMEDESIGN.md` §1 already renders a scrolling stratigraphic cutaway. Prospecting
adds four layers nothing else in the game has:

1. **The ore body itself** — a vein, lens, seam or pipe cutting the host
   (`DESIGN_EXPANSION.md` §2), with **grade varying across it**, invisible until
   the bit passes through it.
2. **The intercept, drawn as a highlighted length of the bore** — from/to depth,
   downhole width. And the honest geological point: **downhole width is not true
   width.** If the vein dips and the hole is angled, the interval you drilled is
   longer than the thing is thick. A player who learns to angle the hole to cut
   the body closer to perpendicular is learning real exploration geology.
3. **The recovery ribbon** — a parallel strip beside the bore, coloured per run by
   TCR. Gaps in the ribbon are gaps in the knowledge. Where the ribbon is thin
   *through the ore*, the assay is suspect even if the grade is high. No other
   method in the game has a second quality track running alongside depth.
4. **The hole is not vertical.** Exploration holes are drilled at a designed **dip
   and azimuth**, and they **deviate** — `[DDTB]` p.11 names hole deviation as a
   direct consequence of excessive WOB, and `[MET]` p.5 sells locking couplings
   that *"stabilize the upper section of the core barrel and minimize hole
   deviation"* and reaming shells with *"a larger active surface to help control
   deviation."* So draw a **designed trace and an actual trace, diverging**. The
   wedge (§F6) is then the tool that puts you back on target — or deliberately
   off it.

Additions 2 and 3 are unique to this branch: an oil well has no core-recovery
ribbon, a piling job has no intercept, an HDD bore has no grade.

---

# G. Implementation notes, guardrails and open questions

## G1. Data shapes this research implies

Everything below is a direct consequence of a sourced fact above, expressed as
the field it wants to be.

**Ground / stratum** needs *two* independent hardness axes plus a structural one:

```
stratum {
  name              // use the rock names on the matrix chart [HERO8]
  mohs              // 3–10                                    [HERO8], [EPI-BIT]
  abrasiveness      // INDEPENDENT of mohs                     [DDTB p.7]
  grainSize         // coarse ⇒ more abrasive                  [DDTB p.7]
  competence        // competent ↔ fractured                   [EPI-BIT p.7]
  fractureDensity   // drives loss_ground AND RQD              [EPI-LIFE]
  weathered         // "weathering reduces rock strength"      [DDTB p.7]
  erosionThreshold  // flush rate above which core washes out  [EPI-LIFE p.9]
}
```

`[DDTB]` p.7 is the licence to make two strata with identical Mohs behave
differently: *"So-called soft rocks can prove more difficult to drill than hard
rock and the same formations, in separate locations, can drill very
differently."*

**Core bit** is a four-field object, not a tier:

```
coreBit {
  matrixNumber      // 3,5,7,8,9,11,13 — HIGHER = SOFTER       [EPI-BIT p.9]
  matrixLine        // standard | abrasive | anti-polish | PCD | wide-range
  mohsBand          // from the published bands                [HERO8]
  waterway          // standard|cyclone|pie|turboPie|jet
  discharge         // SWW|DWW|LD|DLD|FD|FDWBWW                [EPI-BIT], [EPI-ROP]
  waterwayWidth     // narrow (competent) ↔ wide (soft/friable) [EPI-LIFE p.9]
  waterwayCount     // more ⇒ cuts freer at lower WOB          [EPI-LIFE p.9]
  crownHeight_mm    // 13 | 16 | 20 | 26                       [EPI-BIT p.10]
  size              // AQ..PQ, thinKerf?, tripleTube?          [EPI-DT p.16]
  wearState         // ideal|polished|eroded|burnt|concave|convex|odRing|idRing|cracked
}
```

**Wear state is an enum with a diagnosis, not a 0–100 bar.** That is the whole
point of §B3: each state has a cause, a parameter fix and a tooling fix, and two
of them (`concave`, `idRing`) feed directly into recovery loss.

**Per-size parameter table** — implement `[EPI-PARAM]` verbatim; the numbers are
in §B5. Feed must be allowed to go **negative** (holdback) past the depth where
string weight exceeds the target WOB `[EPI-PARAM]` p.12.

**Rotation should be one number, not five.** Every published RPM figure across
BQ/NQ/HQ/PQ resolves to the same **bit-crown surface speed of ~3.7–3.8 m/s**,
inside a published band of **2.7–4.7 m/s** (§B5). So store surface speed and
derive rpm as `rpm = 60 · v / (π · D_bit)`. One parameter, correct for every size,
and it explains itself to the player: *a bigger bit turns slower because the edge
is going the same speed.*

**Three separate WOB ceilings, not one** (§B5): recommended band → straightness
limit → structural ceiling. Pushing between the second and third trades metres
now for a deviated hole later.

## G2. Guardrails — what must NOT ship

Per `DOMAIN.md` §6 and `PLATFORM_TRUTH.md` Part C:

- **No real model or product designations as game content.** This document cites
  a large number of them because that is what a citation is. None of the
  following may appear as an in-game item name: any HERO / HOBIC / CRAELIUS /
  SHARK / ROCKSTAR / VIKING / T-XTREME / AZURE / KUBY / LAVA / KRAKEN / SHRED /
  FERRO matrix name; VULCAN / JET configuration names; DISCOVORE / ARROW 3S /
  EXCORE / OWL / CLICK RELEASE tool names; PRISM / AQUAGUARD / GATOR / WHITE
  RHINO; DIAMEC / CHRISTENSEN / EXPLORAC / DEEP AIR / MRXT rig and hammer names;
  DD-2000 / TORQUELESS / Z-50 / BLACK WIDOW fluid names; ELEPUMP pump names.
  **The concepts are free; the names are not.**
- **Matrix numbers are safe.** "A 7 matrix" and "a 9 matrix" are industry-generic
  scale positions, like R32 or NQ. `DOMAIN.md` §4 already ships thread
  designations, so a numeric matrix scale is consistent with existing policy.
- **The size designations AQ / BQ / NQ / HQ / PQ are already in `DOMAIN.md` §4**
  and are industry standards, not brands. Ship them.
- **No unit drift.** UCS in MPa, diameters in mm, ROP in m/h, pressure in bar,
  force in kN, torque in N·m, flow in L/min, air in m³/min, money in EUR
  (`PLATFORM_TRUTH.md` Part C rule 3).
- **Do not put a bare EUR wage figure on screen** without the source currency
  behind it — every number in §C7 is converted at a stated rate on a stated date.
- **Do not extend BOSIET / HUET / FOET to land exploration.** Those are offshore
  (`DESIGN_EXPANSION.md` §3). No source was found attaching HUET to
  heli-supported land drilling.
- **Do not repeat the merchandising conflation.** Same discipline
  `FACTS_VERIFIED.md` applies to ring-bit vs wing-bit applies here: a **core
  lifter** is not a **core catcher basket**, a **reaming shell** is not a
  **stabiliser**, and **RC** is not **air core** or **RAB** — they are three
  different methods with three different cost bands (§C7).

## G3. Candidate lines for `FACTS_VERIFIED.md`

Each ≤150 characters, one idea, present tense, no brand names — the house style
in `FACTS_VERIFIED.md`. Every one traces to a source in this document.

```js
// — Core / exploration (ENG, this research pack) —
'A higher matrix number means a softer bit. Hard, fine, non-abrasive rock needs a soft matrix so fresh diamonds keep coming to the face.',
'Soft abrasive ground sandblasts the matrix away and the diamonds fall out still sharp. Go to a lower number — a harder matrix.',
'A polished bit is smooth to the touch and stops cutting. Raise the feed, drop the rotation, cut the water.',
'A bit with the diamonds standing proud and the gauge eroded had too much feed for the speed. More rotation, less pressure, more water.',
'Wireline does not pull the rods. Only the inner tube comes up the hole, on a wire, and the string stays where it is.',
'A core bit that gets crushed out of round cuts undersize core, and the lifter cannot grip it. That core stays in the hole.',
'Never push through a core block. You will drill the core you already cut and ring out the inside of the bit doing it.',
'In broken ground you need roughly twice the flush of hard competent ground — and wide waterways, so it does not wash the core away.',
'Core recovery is the goal of diamond drilling. Metres you cannot put in a tray are metres you did not drill.',
'A crown averages around 125 metres. A thousand-metre hole can take eight changes, and at depth a change costs up to four hours.',
'You can sharpen a bit without pulling it: 15 to 20 percent more feed, water down to minimum, and put it back the moment it bites.',
'Two hundred to two hundred and fifty revolutions per inch of advance is the old rule. Above it you polish; below it you tear the matrix out.',
'Every rod you add is weight on the bit you did not ask for. Deep enough, and you spend the shift holding the string back, not pushing it.',
'Start a new crown a few centimetres off bottom and spin in. No full penetration rate until you have drilled ten to twenty centimetres.',
'Never collar a hole with a new bit. The roughest ground in the hole is the first metre of it.',
'Dirty threads gall. Grease over grit does not save them — clean first, then a thin coat of compound like a coat of paint.',
'A leaking rod joint steals water from the bit. The bit burns, and the log says you had plenty of flow.',
'In reverse circulation the air goes down the outside of the pipe and the sample comes up the inside. That is the whole trick.',
'Below the water table an RC sample goes wet, and a wet sample is a poor sample. You hold the water back with air, or you live with it.',
'Reverse circulation gives you chips, not core. No structure, no orientation, no rock quality — but three or four times the metres.',
'Sonic drilling liquefies a thin skin of soil around the string. In gravel and sand it recovers core that nothing else recovers.',
'Deflect a hole off an existing one with a wedge and you get a second intercept without drilling the first six hundred metres again.',
'Ninety-nine percent recovery can still be worthless. If none of it is longer than your hand, the rock quality is zero and the assay is suspect.',
'An intersection needs at least eighty-five percent recovery to go in a resource estimate. Ninety is what you actually want.',
'Nobody knows the grade of the core you lost. That is why lost core is not an error you can correct — it is an error you have to re-drill.',
'The ore is usually in the broken ground. That is the job: the rock you most need to recover is the rock least willing to come up.',
'A run that reads over a hundred percent recovery is telling you the run before it was wrong.',
'Report recovery to the nearest two percent. Estimating it, or assuming a hundred, is not measuring it.',
'Cleavage running down the hole gives you a rasher of bacon in the tube. Change the angle, not the bit.',
'A bigger bit turns slower because the edge is going the same speed. Roughly three and a half metres a second, whatever the size.',
'Zero the torque gauge off bottom before you drill. What matters is how much you are adding, not what the needle says.',
```

## G4. Open questions — what this pack could not source

| Gap | Why it matters | Where to look next |
|---|---|---|
| **Bit-change and full rod-trip duration at depth**, beyond `[EPI-LIFE]`'s *"up to four hours"* at 800–1,000 m | Sets the pacing of the whole core loop | Drilling-engineering text; contractor technical bulletin. Figures found on vendor blogs were unusable |
| **Published contractor rate cards** — standby €/day, mobilisation lump sums, depth-tier breakpoints | Contract-board economics | Commercially confidential. Best route is junior-miner quarterly MD&A drilling cost line items |
| **Crew headcount per rig per shift** (the "1 driller + 1–2 offsiders" figure) | Crew screen | Contractor safety management plans; ADIA |
| **The "2IC" / "second" grade** — definition and timeframe | Career ladder rung | ADIA; contractor career pages |
| **Canadian provincial "common core" driller certification** | Regional cert gating | Provincial regulator (WSN pages 404'd) |
| **Drill-pad dimensions, sump sizing, rehabilitation standards** | Site art and the environmental beat | WA DMIRS, BC MEM, Ontario MNDM exploration guidance |
| **Finnish / Nordic and African driller pay** | Regional day rates | Tilastokeskus; Teollisuusliitto collective agreement; no African data found |
| **Heli-sling per-module mass limits by helicopter type** | Heli-portable rig gating | Helicopter operator load charts; `~860 kg` is the only sourced figure |
| Two local PDFs could not be read in this environment: `Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf` and `GeoDrilling_Sept.pdf` — both are **image-only scans** and no OCR tool is installed | Possible extra modular-rig detail | Install poppler-utils / tesseract, or read them by eye |

## G5. What to build first

Ranked by how much authenticity each buys per unit of work:

0. **TCR / SCR / RQD as three live numbers, with `[A&D]` Table 2's four
   confidence words (§B7).** Peer-reviewed, quotable, and it makes the headline
   recovery number stop lying. Cheapest high-value thing in the pack.
1. **The wear-pattern diagnosis screen (§B3) and the core damage catalogue
   (§B3b).** Sixteen sourced states between them, each with a cause and a fix. The
   single most recognisable thing in this document to a real driller, and it is a
   static table plus a set of bit and core meshes.
2. **The per-size parameter tables (§B5)** and the **RPI groove band (§F2).**
   Replaces the generic torque band with the industry's own quality index.
3. **Core recovery as the score (§F3)**, with the two step-function losses
   (`loss_lifter`, `loss_block`) that can take a whole run.
4. **The wireline trip loop (§F5)** — because *not* tripping the rods for core is
   the defining fact of the method, and it makes the bit change genuinely
   dreadful by contrast.
5. **The matrix pre-run choice and the scratch test (§F4)** — a shop item that
   buys information rather than stats.
6. **RC as the second method (§A2, §F7)** — different score (sample quality),
   different pace, same three sliders, and it closes `DESIGN_EXPANSION.md` §5's
   named gap.

---

*End of research pack. Sections A, B, E and F are built primarily on the local
PDF library; sections C and D are built primarily on web sources. Every claim
carries a filename or a URL; anything that could not be sourced is marked
`UNVERIFIED` and must not ship.*
