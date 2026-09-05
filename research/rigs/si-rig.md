# si-rig — Small site-investigation rig with SPT trip hammer

status: complete for the local material; gaps listed in §8
subject: game rig id `si-rig`, built by `buildSIRig()` in `src/rig/rigFactory.js` (~line 6307)
scope: GEOMETRY and MATERIALS reference for modelling.

> **Naming rule (DOMAIN.md §10).** Every manufacturer and model designation below is here
> as a DIMENSIONAL SOURCE ONLY. Do not put any of these names, logos or model numbers on
> the model, on a decal, on a UI string or in a product name. Model the shapes; invent the
> badge. Note that several of the photographs cited below show the model name painted large
> on the engine hood in the OEM's own typeface. **Do not copy that panel.** Model the hood,
> and leave the badge area blank or put the game's own mark there.

---

## 0. The class problem, stated first

"Small site-investigation rig with an SPT trip hammer" is not one machine. The local
material contains **two distinct size classes**, and the game's `si-rig` is dimensioned as
the smaller one while being modelled with some of the larger one's furniture:

| | **Class A — restricted-access / confined-conditions crawler** | **Class B — geotechnical SI crawler** |
|---|---|---|
| Mass | 0.9 t (light SI/CPT) up to 4.9–6.2 t (confined-access anchor drill) | ~3.5–5 t |
| Width | **750–790 mm** — sourced, see §3 | **1,400–1,700 mm**, variable-width undercarriage |
| Headroom needed | **2.0–2.2 m** — sourced | 6.2 m with mast erect |
| Power | **separate diesel or electric power pack** — sourced | on-board diesel in a deck enclosure |
| Rod handling | hand-fed by the second man | hand-fed from timber trestles |
| Sourced example | KLEMM KR 606-3 / KR 702-3 `[K-8]`; Pagani TG 63-100 `[P11]` | Comacchio GEO 305 `[C-16]` |

**The game's spec block is Class A** (790 mm, 1,250 kg, 2,857 mm work height). Every figure
below is tagged **[A]** or **[B]** so the modeller does not mix scales.

**Source keys used below:** `[C-nn]` = `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` page nn ·
`[K-nn]` = `KLEMM_Lieferprogramm_Product_Range.pdf` PDF page nn · `[P11]` =
`research/11-oem-anchor-geotech-hdd.md` · `[P16]` = `research/16-site-archetypes.md`.

---

## 1. Sources read

| File | Pages read | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` | 1, 2, 3, 8, 11, 14, 15, 16 of 18 | **The single best source in the folder.** p.16 is a fully dimensioned two-view GA drawing (side + front elevation). pp.1–3, 8, 11, 14 are large colour photographs of the real machine in the yard and on site — mast detail, guard cage, control console, crew, dunnage. p.15 is a method-vs-depth table. | **YES — primary** |
| `C:\Users\henri\Downloads\KLEMM_Lieferprogramm_Product_Range.pdf` | 8 (table), 9 (photos), 12 | **Primary for the restricted-access class.** p.8 carries a "Confined Conditions" table giving min. width and min. headroom — the only sourced numbers anywhere in the folder that support a sub-800 mm machine. p.9 photographs those rigs AND the two detachable power packs. | **YES — primary** |
| `C:\Users\henri\Downloads\5.Kravspecifikation geoteknik-1.pdf` | 1–6 (all) | **Useless for this task.** A Swedish municipal framework-agreement requirement spec for geotechnical *consultants* — roles, CV requirements, years of experience, BAS-P duties. Not one machine, dimension, method or piece of equipment. Read in full and discarded. | **NO** |
| `C:\Users\henri\Downloads\Bohrtech_Katalog24_f25.pdf` | text index + method sweep across all 35 pages | A **tooling** catalogue (Rammbohrsystem / driven-casing system, augers, core barrels, drive shoes, drive heads, drive caps). Relevant to the *string*, not to the machine. Contains no SI rig, no GA drawing and no SPT hammer. Not mined further — the string is `research/13-string-elements.md`'s job. | **NO (for geometry)** |
| `C:\Users\henri\Downloads\drillity-the-game\research\11-oem-anchor-geotech-hdd.md` | §A.4 (Comacchio), §A.14 (Pagani) | Already covers the OEM landscape: Comacchio GEO-series naming, GEO 305 torque / feed / clamp / method-depth figures, and the Pagani TG light-crawler mass-vs-push data (910 kg → 100 kN). **Covers no geometry at all** — that is this file's gap to fill. | YES |
| `C:\Users\henri\Downloads\drillity-the-game\research\16-site-archetypes.md` | §B.20 and ~1880–1895 | Already covers the *job*: SPT + U100 undisturbed + disturbed bulk sampling in one hole; a tracked window sampler to 10 m; a low-ground-pressure variant at ~170 g/cm²; handheld window sampling to 5–8 m. Again, no geometry. | YES |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` | 6297–6480 | The current `si-rig` builder, read for comparison only (§9). | YES |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\tools.js` | ~8510–8613 | The `spt-hammer` tool builder, read for comparison. It is **already good** — 63.5 kg, 760 mm, automatic trip, ISO 22476-3 tolerances, cage bars, anvil, guide rod. | YES |
| `C:\Users\henri\Downloads\Atpa\` (full listing, sampled) | — | A **drilling-tool** photo set — drill heads, casing shoes, overburden systems. No site-investigation rig in it. | **NO** |
| `C:\Users\henri\Downloads` root images (~200 files listed) | — | Overwhelmingly Drillity brand/UI screenshots and AI-generated art. **No photograph of this rig class found loose in Downloads.** | **NO** |

### 1b. Manufacturer and standards sources read on the web, 2026-09-05

Added while building `blender/si_rig.py`. §3 of this file said the Class A overall
dimensions "could not be traced to any local file or to any source read here". They can
now, and the match is close enough that it is plainly where the game's numbers came from.

| Source | What it gives | Useful? |
|---|---|---|
| **Dando "Terrier"** specification sheet, published by Soil Engineering — `soil-engineering.co.uk/wp-content/uploads/2024/07/Dando-Terrier.pdf` | **The Class A machine this file could not find.** Transport **2700 × 800 × 1500 mm**; working **2800 × 1000 × 2850 mm**; **1300 kg**; 19 hp 3-cylinder diesel; the 800 mm travelling width sold on fitting through a domestic doorway. Dynamic sampling to 15 m, dynamic probing to 30 m. | **YES — primary, and see the table below.** |
| **Dando "Terrier Mk2"** brochure — `dando.co.uk/wp-content/uploads/2016/05/terrier-mk2.pdf` | 1100 kg; mast **2.22–2.85 m**; **feed stroke 1.3 m**; pulldown 1000 kgf, pullback 7000 kgf; a **300 mm hydraulic mast dump** so the rig tracks hole-to-hole with the mast erect; **controls mounted at the SIDE** with an E-stop and a system pressure gauge, moved forward for visibility of the borehole, plus **tracking controls at the REAR on a folding foot plate**; **folding stabiliser legs with ball-jointed adjustable feet**; tilting undercarriage to 30° slopes; **built-in workpiece clamp and rod racking**. Rotary head: hydraulic motor + 2-speed manual gearbox 7:1 to 1:1, a **¾" integral side-inlet air/water swivel with a BW rod connection**, a **200 mm effective-ID guide ring**, motor options to **2240 Nm at 35 rpm**. **DRIVE HAMMER: a SPLIT weight, 63.5 kg dropping to 50 kg by removing eight bolts, on a SINGLE guide bar (the earlier machine used two), which SWINGS OUT OF THE DRILL LINE at any height, fully guarded, 0–50 blows/min, drop 500–750 mm.** | **YES — primary. This closes §8 item 6.** |
| **ASTM D1586** full text — `azmanco.com/blog/wp-content/uploads/2020/08/D1586.17074.pdf` | Hammer 140 ± 2 lbf; drop 30 ± 1.0 in; **steel on steel** onto the anvil; a fall guide permitting unimpeded fall; **total hammer-assembly mass bearing on the rods ≤ 113 ± 5 kg**. Split-barrel Fig. 2: barrel **457–762 mm**, shoe ID **34.93 ± 0.13**, split-barrel ID **38.1**, shoe wall **2.54 ± 0.25**, OD **50.8 mm**, shoe taper **16°–23°**. Sampling rods ≥ "A" rod, **41.3 mm OD / 28.5 mm ID**. Three 150 mm increments, the first a seating drive; **refusal at 50 blows in one increment, 100 total, or no advance in 10 successive blows** — which is exactly what `src/sim/drilling.js` implements. | **YES** |
| **Ground Engineering, May 2010**, Reading/Lovell/Spires/Powell (Equipe/Geolabs), "The implications of the measurement of energy ratio (Er) for the SPT" | **The construction figure this file was missing.** Names the parts — anvil, drop weight, outer tube/sleeve, lifting swivel, guide rod, lifting pawl — and states that the common winch-rope hammer **trips when its pawls reach a raised section on the guide rod, and the anvil-to-raised-section distance IS the 760 mm drop**. Whole drive-weight assembly **115 kg**; drive head/anvil **15–20 kg**; weights **machined from a cylindrical steel mass to a pre-determined diameter and length**. Measured energy ratios in the field: **43–81 %**. | **YES — this is how to model the hammer.** |
| **Archway Engineering SPT trip hammer** — `archway-engineering.com/product/spt-trip-hammer/` | The only published external envelope: 63.5 kg, 760 mm free fall, **total 105 kg**, **1.8 m unextended / 2.6 m extended**, a **lifting eye at the crown**, an **outer tube sliding over an inner guide shaft**, an anvil in a **BW or 1½" BSW box**, and a **safety cross bolt** locking the sleeve to the guide rod for transport. | **YES** |
| **EN ISO 22476-2 Table 1** (dynamic probing), via insitutek.com | DPSH-A: 63.5 ± 0.5 kg, drop 500 ± 10 mm, cone **16 cm² / 45.0 ± 0.3 mm**, 90° apex, anvil incl. guide rod ≤ 18 kg, blow rate 15–30/min. And the one hard geometric rule available for the hammer BODY: **50 < d < 0.5·D_h** — the body must be more than twice the anvil diameter, so > 100 mm and realistically 150–250. | **YES — it is the only bound on hammer-body diameter that exists.** |
| **Comacchio GEO 205** sheets (Geotron/SOCOTEC/Drilltechniques) | The Class B end of the same family for comparison: 2.6–2.8 t; transport 4.83 × 1.14 × 1.94 m, working 3.3 m long / 4.80 m high; **variable-width tracks 750–1150 mm**; feed stroke 1200–2950 mm; feed and retract both 25 kN; head 200–420 daNm at 80–810 rpm, clamp 45–220 mm; Kubota 42 hp; **two deck-mounted flush pumps** (an 85 l/min piston pump and a 60 l/min progressive-cavity pump); a **fully interlocked rotation safety cage with large stop buttons on each side**. | **YES — comparator** |

### 1c. The Class A dimensions, resolved

| | `data.js` / `rigFactory.js` | **[Terrier], published** |
|---|---|---|
| mass | 1,250 kg (`transportTons: 1.25`) | **1,300 kg** |
| width | 790 mm | **800 mm** (travelling) |
| length | 2,729 mm | **2,700 mm** transport / **2,800 mm** working |
| transport height | 1,460 mm | **1,500 mm** |
| work height | 2,857 mm | **2,850 mm** |
| rotary-head torque | 2.2 kNm | **2,240 Nm** at 35 rpm |
| rod length | 1.0 m | 1.0 m |

**Five independent figures within 3 %.** §3's "`NOT SOURCED` at Class A" is therefore
CLOSED — the game's numbers are this machine's, and `blender/si_rig.py` is built to the
published ones. What is still open is listed in the revised §8.

**One correction this raises, in a file I do not own.** `data.js`'s `description` for
`si-rig` says the machine has "a detachable power pack on hoses" — but every dimension in
the same row is the ON-BOARD-diesel machine's, and `[K-8]` is explicit that the moment the
diesel goes on board the minimum width jumps from **750 mm to 950 mm**. The two readings
cannot both be true of one 790 mm, 1.25 t machine. The Blender model follows the
dimensions (on-board engine hood, per [Terrier]'s 19 hp three-cylinder) because five
figures outvote one adjective, and the `description` string is the thing to change.

---

## 2. What the machine IS

A small tracked geotechnical investigation drill: a two-man machine that walks itself onto
a plot, sets down on four screw jacks and timber dunnage, stands its mast up over one spot,
and takes a **logged, sampled hole** thirty to fifty metres deep. It is not measured in
metres per shift — it is measured in whether the log is defensible, so almost everything on
it exists to let the crew stop, break the string, run a sampler, and go again. It has **no
cab and no seat**: the driller stands on the ground at a side-mounted lever console within
arm's reach of the hole, and the second man works the rods on a timber trestle beside the
machine `[C-14]`. The mast is at the very front of the chassis, ahead of the tracks, so the
operator can see the collar. It changes method inside one hole — auger and open rotary
through soil, SPT at every 1.0–1.5 m of depth, U100 or thin-wall tubes for undisturbed
samples, then wireline coring or a DTH hammer when it reaches rock `[C-15]`, `[P16 §B.20]`.
Where a piling rig is one method done hard, this machine is six methods done carefully by
the same two people, and it is built around the fact that it is constantly stopped.

---

## 3. Proportions

### [B] The one fully dimensioned drawing in the folder
Source: `[C-16]` — dimensioned GA, side and front elevation, all values mm, read directly
off the drawing.

| Dimension | Value | Note |
|---|---|---|
| **Overall height, mast erect** | **6,200 mm** | head parked at the top of the feed |
| **Feed stroke** | **3,600 mm** | the drawing labels it `FEED STROKE 3600` |
| **Overall length** | **3,840 mm** | mast foot at the very front to the rear overhang |
| Track dimension | **1,500 mm** | dimensioned across the track under the machine. The drawing does **not** say whether this is ground-contact length or sprocket–idler centres. **Recorded as ambiguous — not silently resolved.** The drawn track is visibly longer than 1,500, so sprocket–idler centres is the more likely reading |
| **Height over the body** | **1,700 mm** | ground to the top of the deck enclosure and its rear furniture |
| **Track shoe width** | **300 mm** | front elevation |
| **Overall width** | **1,400 – 1,700 mm** | a RANGE, because the undercarriage is **variable-width**: it retracts to tram and extends to work. Slide text on the same page: *"Variable width undercarriage available with steel tracks and rubber shoes"* `[C-16]` |

**Ratios — these matter more than the absolutes:**

- height erect : length = 6,200 : 3,840 ≈ **1.61 : 1**. The machine is markedly taller than
  it is long. This is the single ratio the game must get right.
- feed stroke : overall height = 3,600 : 6,200 ≈ **0.58**. The mast is over half the total
  height and the head travels most of it.
- width : length = 1,700 : 3,840 ≈ **0.44** (retracted, 1,400 : 3,840 ≈ **0.36**). Long and
  thin in plan.
- shoe width : overall width = 300 : 1,700 ≈ **0.18** — the two tracks alone are about 35 %
  of the plan width. **Wide tracks, narrow body.**
- body height : overall width ≈ 1,700 : 1,700 = **1 : 1**. The machine minus its mast is
  roughly a cube sitting on tracks.
- **The mast foot is at station 0 of the overall length** — it overhangs the front of the
  tracks entirely, and the tracks sit under the rear two-thirds.

### [A] Restricted-access / confined-conditions class
Source: `[K-8]`, table headed *Beengte Verhältnisse // Confined Conditions*.

| Model | Operating weight | Powered by | Power | **min. headroom** | **min. width** |
|---|---|---|---|---|---|
| KR 606-3 | 4.9 t (drill rig) | Separate diesel or electric power pack | 55 kW | **2.0 m** | **780 mm** |
| KR 702-3 | 5.6 t (drill rig) | Separate diesel or electric power pack | 45 / 129 kW | **2.2 m** | **750 mm** |
| KR 704-2E | 5.1 t | Electric motor, on-board | 45 kW | 2.2 m | 750 mm |
| KR 704-3G | 6.2 t | Diesel engine, on-board | 55 kW | 2.2 m | **950 mm** |

**This is the source that validates the game's 790 mm.** A 750–790 mm working width with
2.0–2.2 m headroom is a real, catalogued figure for a machine of this family, and
*"Separate Diesel or Electric Power Pack"* in the same rows validates the game's detachable
pack. Note the trade the table makes explicit and the game should respect: **the moment the
diesel goes on board, minimum width jumps from 750 to 950 mm.** On-board power costs 200 mm
of access.

Lighter end, from `[P11]` §A.14 (citing pagani-geotechnical.com and mgs.co.uk): TG 63-100 =
**910 kg** for 100 kN push; TG 73-200 = **2,700 kg** for 200 kN. So a ~1 t machine in this
family is real, but it is a *penetrometer*, not a 5 t confined-access anchor drill.

### `NOT SOURCED` at Class A
Overall **length, height, mast height and track gauge** for a sub-1.5 t SI crawler.
**No dimensioned drawing of a machine that small exists anywhere in this folder.** The
game's 2,729 mm length, 1,460 mm transport height and 2,857 mm work height could not be
traced to any local file or to any source read here. They are not contradicted either —
they are simply unsupported. Treat them as a design choice, not a fact.

---

## 4. Component inventory

Every item below is something actually seen in a photograph or a drawing, with its
reference. "Why" is the visual reason, not a spec reason.

### Mast / feed
- **Box-section mast, not lattice.** `[C-16]`, `[C-8]`, `[C-11]`. A fabricated rectangular
  box with flat side plates. It is **not** a truss and must not be modelled as one.
  *Why:* lattice reads as a big rig; a plate box reads as a small precise one.
- **Oval lightening slots punched through the flat mast plate** `[C-11 right]`, `[C-8 right]`.
  A row of long rounded (stadium-shaped) slots down the mast web.
  *Why:* the cheapest single detail that makes the mast read as a real fabrication rather
  than an extruded primitive.
- **The carriage runs on bolted-on guide rails, driven by a roller CHAIN.** `[C-8 left]`,
  `[C-11 left]`. The chain and its link plates run the full length of the mast beside the
  head, with a **chain tensioner** at the foot and a **sheave at the mast top**. Not a
  rack-and-pinion, not a bare cylinder. The carriage itself is a **flat bolted plate** with
  visible bolt heads clamping it to the head `[C-11 left]`.
  *Why:* a visible chain is the clearest signal of how the head moves.
- **Mast extension.** `[C-16]` text: *"Mast extension to handle 6 m above the clamps
  available"*, and `[C-8 right]` photographs it — a slimmer column bolted on top of the main
  mast, visibly a different and narrower section.
  *Why:* a free silhouette variant for a "long sample" configuration.
- **Energy chain / cable carrier** running the full mast height on one side `[C-8 right]` —
  a black segmented plastic drag chain.
  *Why:* a strong vertical black stripe against the pale mast, for almost no geometry.

### Head
- **A rotary head, not a top-hammer drifter.** `[C-16]`, `[C-2]`, `[C-8]`, `[C-11]`. In every
  photograph the head is a compact gear case with the spindle out of the bottom, and it is
  the **single most saturated colour object on the machine** — bright red against a cream or
  white body in all Comacchio sources.
  *Why:* it is where the eye lands. Get that colour hierarchy right and the rest can be plain.
- **A bellows dust boot around the spindle** where it leaves the head `[C-11 left]` — a short
  concertina.
  *Why:* makes a spindle read as sealed rather than drawn.
- **Water/flushing swivel above the head**, with a gooseneck `[C-16]` front elevation.

### Clamps and the drill table
- **Break-out / rod clamp at the foot of the feed**, at ground level, ahead of the tracks
  `[C-16]`, `[C-8 right]`. Two opposed jaws. Clamp range for this class is **45–220 mm**
  `[P11]` — small jaws, not pile-rig jaws.
  *Why:* it is the object the crew's hands are always near; it sells the scale.

### Cylinders and where the rods sit at working extension
- The mast is carried on a **bent tubular boom that arcs up and over the front** `[C-16]`,
  with a **mast-fold / erection cylinder** working between the deck and the boom. On `[C-16]`
  that boom is a smooth curved tube with a flattened lifting eye at its top — a distinctive
  shape, and not a straight strut.
- **At working extension the rod stands vertical at the very front of the machine**, on the
  hole centreline, outboard of the tracks. The head is at the top of the 3,600 mm stroke at
  the start of a rod and at the bottom at the end; `[C-16]` draws both states, with the lower
  one dashed in red.

### Hoses and their routing — this is the machine's texture
- **A thick black corrugated suction/cuttings hose arcs from the mast top down to the deck**
  `[C-2]`, `[C-14]`. On several site photographs this is the boldest single line on the whole
  machine — a heavy black curve over the rig. Do not omit it.
- **Spiral hose-protection wrap** (black plastic helix) over hose bundles at the mast and the
  head `[C-2]`, `[C-11 left]`.
- **Quick-release coupler blocks** — a bank of hydraulic couplers with hoses hanging off them,
  on the power pack `[K-9 photo 08]` and on the rig `[C-2]`.
- Hoses run **loose and slung, not clipped tight**. On `[K-9 photo 04]` the hoses from the
  power pack lie right across the ground for several metres to the rig.
  *Why:* that ground run is the signature of the detachable-pack layout, and it is what tells
  the player these are two objects and not one.

### Guarding — the biggest missing part in the game
- **A welded mesh guard cage around the whole drilling area.** `[C-2]`, `[C-8 left]`,
  `[C-8 right]`, `[C-11 left]`. Painted square-tube frame, welded-wire mesh infill, a
  **diagonal brace across each panel**, a **hinged door** with hinges, a latch and a grab
  handle, and an **interlock switch** on the frame. On `[C-2]` it is the frontmost object in
  the picture and it dominates the machine's read.
- **A cluster of three red mushroom E-stops in yellow housings** mounted on the guard
  `[C-11 left]`.
- **Warning decals** — yellow triangles and red-and-white pictograms, densely scattered on the
  hood, the console, the mast and the guard `[C-2]`, `[C-8]`.

### Cab / canopy
- **There is none.** No cab, no seat, no canopy and no glazing on any photograph of this
  class. The operator stands on the ground `[C-14]`, `[C-8 right]`.
- **The control station is a side-mounted, steeply angled lever console** `[C-2]`, `[C-14]`:
  a fabricated sloping panel carrying **a dense row of about ten black ball-topped spool
  levers**, two or three round pressure gauges, a couple of small joysticks, on a pedestal at
  standing height, with a **fabricated shroud/visor over it**.
  *Why:* this is the machine's face, and the game currently replaces it with a handheld
  pendant (§9).

### Deck and enclosure
- **A low rectangular engine/hydraulic enclosure** filling the rear two-thirds of the deck,
  with **louvred or perforated side panels** for cooling, **hinged access doors with latches
  and grab handles**, and a **flat top used as a work surface** `[C-2]`, `[C-8 right]`.
- **A vertical exhaust stack** rising above the hood with a rain cap `[C-14]`, `[C-2]`.
- **A gauge/instrument panel** with a large round pressure gauge and coloured indicator lamps
  on the top deck `[C-2]`.

### Undercarriage
- **Rubber-track or steel-shoe crawler, variable width** `[C-16]`. Sprocket at one end, idler
  at the other, a visible row of **bottom rollers**, and a plain welded box track frame
  `[C-2]`, `[C-8 right]`, `[C-14]`.
- **Orange lifting / tie-down hooks** welded to the track frame `[C-2]` — small, bright, and
  the only orange on the machine.
- **Green-and-yellow direction-of-travel markers** on the track frame ends `[K-9 photos 05, 06]`.

### Jacks / outriggers
- **Four screw or hydraulic levelling jacks**, chrome rods with **round foot pads** `[C-14]`,
  `[K-9]`. On `[K-9]` the pads are painted bright red — a deliberate visibility choice and a
  good cheap colour accent.
- **Timber dunnage under the tracks and under the mast foot on nearly every site photograph**
  `[C-14]`, `[C-8 right]`. Sleepers and offcuts. This is not scruff — it is how the machine is
  levelled, and it belongs in the scene.

### Rod handling
- **There is no carousel and no rod magazine on any photograph of this class.** Rods are laid
  on **two timber sawhorse trestles** beside the machine and lifted by hand `[C-14 top-right]`.
  Casing and used rods lie loose on the ground.
- A **winch / wireline drum** is used for coring; on `[C-8 right]` a wireline runs from the
  mast head.

### Power pack (Class A)
- `[K-9 photo 07]` — **the trailer type**: a fully enclosed **yellow box on a road trailer with
  pneumatic wheels**, hinged doors, a red hose reel, and a coupler panel.
- `[K-9 photo 08]` — **the tracked-skid type**: an **open skid frame on its own rubber-track
  crawler**, carrying a motor, a cooler with a large axial fan, a hydraulic valve bank, a
  control panel with a screen, and a bank of quick-release couplers with black hoses hanging
  off it. It has its own red-pad outrigger jacks.
- **Neither is a plain painted box sitting on the ground** — see §9.

---

## 5. Distinctive features (thumbnail silhouette test)

1. **A tall, thin, front-mounted box mast that overhangs the tracks entirely**, at roughly
   1.6× the machine's length in height `[C-16]`. Nothing else in the fleet puts its mast
   completely outside its own wheelbase.
2. **The mesh guard cage** — a boxy, semi-transparent volume wrapped round the bottom of the
   mast, wider than the mast and lighter in value than everything behind it `[C-2]`, `[C-8]`.
   At thumbnail size it reads as a pale rectangle at the machine's front foot, and nothing
   else in the fleet has one.
3. **No cab, and a person standing beside the machine at chest height to the deck** `[C-14]`.
   The human figure is part of this machine's silhouette in a way it is not for a piling rig.
4. **A heavy black corrugated hose arcing from the mast top over the deck** `[C-2]`, `[C-14]`.
5. **A separate power pack with hoses lying across the ground between the two** `[K-9]`. Two
   objects with a visible umbilical, not one object.

---

## 6. Materials and paint

- **Painted steel, pale, over almost everything.** Both OEMs in this folder paint the body
  cream/off-white — `[C-2]` beige-cream, `[C-14]` white with red chassis and mast accents. The
  KLEMM confined-access machines are **orange** `[K-9 04, 06]` or **yellow-and-black**
  `[K-9 05, 08]`. So the class does **not** have one colour; a pale body with one saturated
  accent is the safe read, and §8 records that there is no colour authority here.
- **The head is the saturated accent** — bright red in every Comacchio photograph. Gloss, high
  value, and the eye goes to it first. Keep it the most saturated material on the model.
- **Bare / bright steel** on: the piston rods of every cylinder and jack (chrome), the spindle,
  the drill rods, the exposed feed chain, the clamp jaws, and the sampler shoes. These are the
  only truly reflective surfaces on the machine.
- **Rubber**: track pads, all hoses, the spindle bellows, the spiral wrap, the lever knobs.
- **Glass**: essentially none — gauge lenses and one small console screen. This class has no
  glazing at all, which is a meaningful render saving and is already exploited (§9 item 12).
- **Galvanised, not painted**: the mesh of the guard cage reads bright and slightly bluish in
  `[C-8 left]` while its tube frame is painted body colour. Two different materials in one
  assembly — that contrast is most of why the cage looks right.
- **Plastic**: the black energy chain, a white bucket hanging on the guard `[C-8 right]`, the
  sample-jar crates.

**Where wear, dirt and rust actually accumulate — observed, not assumed:**
- **The mast foot, the clamp jaws and the bottom ~500 mm of the mast** carry wet soil. On
  `[C-8 right]` and `[C-14]` the ground at the collar is churned mud and the machine is
  dirtiest from the deck down.
- **The track pads and the insides of the track frames** are packed with soil.
- **The dunnage timber** is muddy and splintered — model it dirty.
- **Everything above the deck stays clean.** On a site-investigation rig there is no
  circulating drilling mud thrown about; the flush is water. `[C-14]` shows a heavy dust plume
  from DTH work and the body panels are *still white*. **Do not grime this machine like a mine
  rig** — that is the most likely material mistake.
- Rust shows on: **rods and casing lying on the ground**, the **timber trestles' hardware**, the
  **clamp jaw faces**, and **chipped paint on track-frame edges and the guard door**.
- The **guard-cage door** is hand-polished around the latch and handle.

---

## 7. Photo references

**Inside the PDFs — the best photographs available locally:**

| Reference | Shows | Useful for |
|---|---|---|
| `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` **p.2** | Full-bleed three-quarter yard photograph of the whole machine, mast erect | The definitive overall read: guard cage, lever console, hood louvres, gauge panel, track frame, decal density |
| same, **p.3** | Second yard/detail photograph | Secondary angle |
| same, **p.8** | Two photos — left: guard-cage close-up with the feed chain behind it; right: machine erect in a yard **with the mast extension fitted** | Guard-cage construction; mast extension; energy chain; dunnage |
| same, **p.11** | Two photos — left: mast/head/clamp close-up with the E-stop cluster; right: machine on a hardstand against a wall | Mast section, lightening slots, spindle bellows, E-stops, bolted carriage plate |
| same, **p.14** | Four working site photos: hillside DTH work with a dust plume; crew handling rods on timber trestles; the machine working from a pontoon at a bridge pier | **The best "machine at work" reference in the folder** — crew scale, PPE, dunnage, trestles, the black cuttings hose, spoil |
| same, **p.16** | The dimensioned GA drawing, side + front | All of §3 |
| `KLEMM_Lieferprogramm_Product_Range.pdf` **p.9** | Six photos: confined-access crawlers in orange and in yellow, **plus both detachable power packs** (trailer type and tracked-skid type) | Restricted-access proportions; **the power pack, which is the game's weakest part**; hose ground-runs; red jack pads |

**In `C:\Users\henri\Downloads` root and `\Atpa`:** swept and reported honestly — `\Atpa` is a
drilling-**tool** photo set (drill heads, casing shoes, overburden systems) with no
site-investigation rig in it, and the Downloads root images are overwhelmingly Drillity
brand/UI screenshots and AI-generated art. **No photograph of this rig class was found loose
in Downloads.** The usable photographs of this machine are the ones embedded in the two PDFs
above; extract them from there rather than hunting the folder again.

---

## 8. NOT SOURCED

Honest list. Nothing below was invented to fill a gap.

> **§8 was written before the sources in §1b were read. Items 1, 2 and 6 are now CLOSED and
> are struck through with what closed them. Everything not struck through is still a real
> gap, and `blender/si_rig.py` marks each of them at the point of use.**

1. ~~**Class A overall dimensions.**~~ **CLOSED 2026-09-05 — see §1c.** Transport
   **2700 × 800 × 1500 mm**, working **2800 × 1000 × 2850 mm**, **1300 kg**, feed stroke
   **1.3 m**, head **2240 Nm** [Terrier / Terrier Mk2, §1b]. Five of the game's figures land
   within 3 % of these, so they are not unsupported — they are this machine's.
   `blender/si_rig.py` builds to the published ones and `tools/glbinfo.mjs` measures
   **1.000 × 2.850 × 2.800 m** off the exported file.
2. ~~**The game's 1,250 kg at 790 mm width as a pairing.**~~ **CLOSED.** The pairing is real:
   **1,300 kg at 800 mm** is a catalogued machine. Note the distinction §0 was reaching for
   and can now state: the sub-800 mm 4.9–6.2 t KLEMM rows are *confined-access anchor
   drills*, a different job at a similar width; the 1.3 t / 800 mm rig is the SI machine.
3. **Whether the 1,500 mm on `[C-16]` is ground-contact length or sprocket–idler centres.** The
   drawing does not say. Both readings recorded above; neither picked.
4. **Rubber-track pitch, shoe count, roller count, sprocket tooth count** for any machine in
   this class. No drawing at that resolution exists locally.
5. **Mast cross-section dimensions** (the box's width × depth). Photographs only; no section.
6. ~~**Where the SPT trip hammer actually mounts on the rig.**~~ **CLOSED — and it is better
   than a bracket.** [Terrier Mk2, §1b] describes the fitted hammer in detail: a **SPLIT
   weight, 63.5 kg dropping to 50 kg by removing eight bolts** so one hammer covers SPT and
   dynamic probing; it runs on a **SINGLE stainless guide bar** (the earlier machine used
   two); it **swings out of the drill line at any height**; it is fully guarded, has a
   hydraulic automatic stop at end of stroke, runs at **0–50 blows/min**, and its PTO takes
   20 l/min at 152 bar. [Ground Engineering, §1b] adds the mechanism: the weight is lifted
   by pawls and **trips when they reach a raised section on the guide rod — and the
   anvil-to-raised-section distance IS the 760 mm drop**. So the drop height is a *modelled
   dimension* on the guide bar, not a number in a table.
   Still open: the **drop weight's own outside diameter**, which no manufacturer publishes.
   `blender/si_rig.py` COMPUTES it instead — 63.5 kg of steel at 7,850 kg/m³ is 8.089 litres,
   and with a 50 mm bore a 200 mm OD gives a 275 mm long weight — and says "computed" at the
   point of use. EN ISO 22476-2's anvil rule (**50 < d < 0.5·D_h**) is the only published
   bound and puts the body above ~100 mm, which 200 satisfies.
7. **Ground pressure for these specific machines.** `[P16]` gives ~170 g/cm² for a
   low-ground-pressure window-sampler variant; nothing for the Comacchio or KLEMM machines.
8. **Cylinder bore and rod diameters, outrigger stroke, jack pad diameter.** Photographs only.
9. **Colour authority.** Three different liveries across two OEMs in the same folder. There is
   no "correct" colour for this class and the game should not pretend there is.
10. **Two of the four candidate sources contributed nothing to rig geometry** —
    `5.Kravspecifikation geoteknik-1.pdf` (consultants, not machines) and
    `Bohrtech_Katalog24_f25.pdf` (tooling, not machines). Stated plainly so nobody re-reads
    them hoping.
11. **How the variable-width undercarriage actually moves** (sliding beams? swinging frames?).
    Only the two end dimensions are given, not the mechanism.
12. **Any dimensioned drawing of a detachable power pack.** Photographs only `[K-9]`.

---

## 9. Domain-truth warnings vs the current game build

Read against `rigFactory.js` `buildSIRig()` (lines 6297–6480) and its `spec` block, and
`tools.js` `spt-hammer` (~8510–8613).

| # | What the game does | What the sources show | Severity |
|---|---|---|---|
| 1 | `buildDrifter(...)` supplies the head, giving a **percussive top-hammer drifter** with `dyn.percussion`. | Every photograph of this class shows a **rotary head** — a gear case with a spindle, no percussion. A site-investigation rig augers, rotates and cores; percussion *at the head* is an anchor / rock-drill trait. `[C-2]`, `[C-8]`, `[C-11]`, `[C-16]` | **High** — wrong machine family |
| 2 | **No guarding at all** — the builder has no mesh cage. | The mesh guard cage is the most visually dominant single structure on the real machine and is present on **every** Comacchio photograph. `[C-2]`, `[C-8]`, `[C-11]` | **High** — the strongest silhouette cue is missing |
| 3 | The operator interface is a **handheld pendant on a cable** (`'pendant'` group + `pendant-cable`), described in the comment as "this rig is walked, not ridden". | "Walked, not ridden" is **correct**. But the real primary interface is a **fixed, side-mounted, steeply angled lever console** with ~10 spool levers and gauges `[C-2]`, `[C-14]`. Radio remote *does* exist as an option — `[C-16]` text: *"Radio remote control tracking and drilling available"* — so a pendant is defensible **as an option**, but it should not *replace* the console. | **Medium** — keep the pendant, add the console |
| 4 | The mast is two `buildFeedBeam` halves in a `buildMastStack`, folding flat forward (`transportTilt: -1.42`). | The sourced machine carries its mast on a **curved tubular boom** ahead of the tracks and folds it over the deck. The *fold* is right; the **boom is missing**, and the mast sits inboard rather than overhanging the front. `[C-16]` | **Medium** |
| 5 | The power pack is a **plain painted box with a grille on a flat base plate**, standing on the ground. | Real detachable packs are either a **yellow enclosed unit on a road trailer with pneumatic wheels** or an **open skid frame on its own rubber tracks** with a visible cooler fan, valve bank and coupler bank. `[K-9 07, 08]` | **Medium** — cheap fix, large authenticity gain |
| 6 | The sample kit is a **painted steel trestle rack** with four legs and a shelf. | Rods and samplers on site sit on **two timber sawhorses**. `[C-14]` | Low–medium |
| 7 | `spec.methods: ['site-investigation', 'auger', 'anchor']`. | The sourced method list for this class is **wireline coring, hollow-stem auger, rotary, DTH, SPT, dynamic sampling, monitoring-well installation** `[P11]`, `[C-15]`. **`anchor` is not on it**, and `core` / `dth` are missing. Anchor work belongs to the KLEMM confined-access family — a *different* machine that happens to share a width. | Medium |
| 8 | `spec.mastM: 2.40`, `workHeightMm: 2857`, `rodLenM: 1.0`. | Nothing sources a 2.4 m mast for an SPT-capable rig. 2.4 m is barely more than one 1.0 m rod plus the head plus the 63.5 kg hammer above it. The sourced comparable is **6,200 mm overall / 3,600 mm stroke** `[C-16]`, and the confined-access class is sold on **2.0–2.2 m minimum headroom** `[K-8]` — which is a *ceiling clearance*, not a mast height. **If the 2.4 m mast stays, the game must be explicit that this machine takes 1 m rods and cannot swallow a 3 m core barrel.** Flagging the tension, not resolving it. | Medium — needs a decision |
| 9 | Track shoe width `0.20` m; gauge `±0.28` m (0.56 m centres). | Sourced Class B shoe width is **300 mm** on a machine 1,400–1,700 mm wide `[C-16]`. The game's shoes are proportionally **too narrow for a machine sold on low ground pressure** — this class advertises ~170 g/cm² `[P16]`, and that is bought with wide shoes. | Medium |
| 10 | The undercarriage is fixed width. | The sourced machine has a **variable-width undercarriage** — retracts to tram, extends to work `[C-16]`. That is exactly the kind of animated state this game already does for masts, and it is free character. | Low — opportunity, not error |
| 11 | The mast is fed by `buildFeedBeam` with rails. | Correct in principle, but the **feed chain, its tensioner and the mast-top sheave** are plainly visible on the real machine `[C-8]`, `[C-11]` and are absent. Also absent: the **oval lightening slots** in the mast plate and the **black energy chain** down one side. | Low — all cheap |
| 12 | No `cabGlass` on this rig. | **Correct** — this class has no cab and no glazing. | — (correct) |
| 13 | `tools.js` `spt-hammer`. | **Correct and well done.** 63.5 kg, 760 mm, automatic-trip free fall, ISO 22476-3 tolerance `63.5 ± 0.5 kg, 760 ± 10 mm`, cage bars, guide rod, anvil, and the N60 energy-ratio note. No correction needed — only the *mounting* is unsourced (§8 item 6). | — (correct) |
| 14 | `spec.name: 'Rynnval SI-30 Probeline'`. | **Correct practice** under DOMAIN.md §10 — an invented badge, no real OEM name. Keep it, and do not let any decal or texture reintroduce a real one from the photographs cited in §7. | — (correct) |

---

## 10. The Blender model — what it took from this file, 2026-09-05

`blender/si_rig.py`. Registered in `blender/build.py`; exports `public/models/si-rig.glb`.

**Measured off the exported file** (`node tools/glbinfo.mjs public/models/si-rig.glb`):

| | sourced | measured |
|---|---|---|
| width | **1.00 m** working [Terrier] | **1.000** — set by the outer edge of the deployed jack pads |
| height | **2.85 m** working [Terrier] | **2.850** — set by the top of the mast head |
| length | **2.80 m** working [Terrier] | **2.800** — guard cage at the front, tracking foot plate at the rear |
| feed stroke | **1.3 m** [Terrier Mk2] | `slide:carriage travel_m 1.3` |
| head torque | **2,240 Nm** [Terrier Mk2] | `slide:carriage torque_nm 2240` |
| SPT hammer | **63.5 kg / 760 mm** [ASTM D1586, EN ISO 22476-3] | `slide:spt-hammer mass_kg 63.5 drop_mm 760` |
| ground pressure | ~**170 g/cm²** `[P16]` | **168** from 2 × 1.55 m × 250 mm shoes under 1,300 kg |
| draw-call floor | ≤ 70 | **43** |
| triangles | the lane to spend in | 22,024 |
| materials | names only, no textures | 9 names, 0 images |

The three dimensions are **solved, not placed**: the mast's fore-aft station is derived from
where the guard cage's front face has to land, the jack legs from where the pad's outer edge
has to land, and the mast head's height from what is left between the mast top and 2,850 mm.
Change one published figure and the machine re-solves; nothing is dialled in by eye.

**Which of §9's warnings it answers:**

| § | warning | in the model |
|---|---|---|
| 1 | percussive **drifter** instead of a rotary head — *wrong machine family* | a rotary **gear case** with the spindle out of the bottom, a bellows dust boot, and the water swivel with its gooseneck above. No percussion at the head anywhere. |
| 2 | **no guarding at all** — the strongest silhouette cue missing | a hinged rotation guard at the mast foot: painted tube frame, **galvanised mesh** infill (two different materials, which §6 says is most of why a cage looks right), a diagonal brace, hinges, latch, handle and an interlock. |
| 3 | a handheld **pendant** replacing the console | the side-mounted, steeply angled **lever console** — ten ball-topped spool levers, two gauges, a shroud, an E-stop — plus [Terrier Mk2]'s separate **rear tracking controls on a folding foot plate**. |
| 4 | the **curved tubular boom** is missing and the mast sits inboard | the mast stands **entirely ahead of the tracks** on a segmented curved boom with a flattened lifting eye and a fold cylinder. |
| 8 | a 2.4 m mast is barely a rod + head + hammer | the tension is real and it is **resolved in the machine's favour**: 2.40 m of beam plus a 0.17 m head reaches [Terrier]'s published 2,850 mm, the feed is [Terrier Mk2]'s 1.3 m, and 1.3 m of stroke does take a 1.0 m rod. This rig genuinely cannot swallow a 3 m core barrel and the model says so by being that size. |
| 9 | 200 mm shoes on a machine sold on low ground pressure | **250 mm** shoes, chosen so the ground pressure lands on `[P16]`'s sourced ~170 g/cm². |
| 11 | feed chain, tensioner, mast-top sheave, lightening slots, energy chain all absent | all five are in, and all five share materials the machine already carries, so they cost triangles and no draw calls. |

**Two things the model adds that this file had not asked for**, both from [Terrier Mk2]:

- **`slide:mast-dump`** — the 300 mm hydraulic mast dump, so the rig tracks hole-to-hole
  with the mast still erect. A real named feature and a free animation.
- **`pivot:hammer-swing`** — the hammer swings out of the drill line at any height, which is
  how the rotary head gets the hole back after a test. The model is posed with the hammer
  **IN** the line and the head parked at the top of the feed, because SPT is the method
  `src/sim/drilling.js` has the player performing.

**Still a judgement, labelled at the point of use:** mast cross-section, track pitch and
roller count, cylinder bores, stabiliser stroke, jack pad diameter, the drop weight's own
diameter (computed, see §8 item 6), and paint — of which this class has no authority (§8
item 9).

---

*status: complete; §1b, §1c and §10 added 2026-09-05 alongside `blender/si_rig.py`*
