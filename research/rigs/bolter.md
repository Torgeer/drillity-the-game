# Rig reference — `bolter` : underground rock bolting rig

status: complete
subject: game rig id `bolter` (game name "Skarnes GB-14 Boltline", `src/rig/rigFactory.js` ~L5729)
purpose: GEOMETRY AND MATERIALS reference for the modeller. Every figure is cited to a file+page or a URL.

> **Naming rule (DOMAIN.md §10).** Real manufacturer names and model designations appear below
> (Epiroc Boomer M / Boltec, Deutz, Minova, Betek, Split Set, Swellex) **as dimensional and
> geometric evidence only**. Do NOT copy a badge, a decal, a model number or a brand colour onto
> the game model. Model the *shape*; the game keeps its own invented name.

## 1. Sources read

| Source | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\9869_0080_01f_Boomer_M-series_technical_specification_english.pdf` (Epiroc Boomer M-series technical specification, doc 9869 0080 01f, 2022-02, Örebro) | printed p.2-3 and p.6-7 (physical sheets 2 and 4 of 5; the file is laid out as A3 spreads) | **The single most valuable local source.** A fully dimensioned SIDE ELEVATION and a FRONT COVERAGE diagram of an articulated underground drilling carrier, plus a complete component checklist (carrier, boom, feed, air/water, hydraulics, electrics, protective roof, cabin). It is a face-drilling jumbo, not a dedicated bolter — but it is the *same carrier class*, and printed p.3 documents its "safe bolting boom function for the semi-mechanized installation of rock bolts", i.e. this exact machine is sold to bolt. Every carrier proportion in §3 comes from here. | **YES - primary** |
| `C:\Users\henri\Downloads\Minova-SDA-Brochure-EN-USA-MEX.pdf` (Minova SDA Hollow Bar System, EN-USA-MEX, 9 PDF pages) | PDF p.2, 4, 6, 7-8 | Self-drilling anchor system: exploded illustration of nut / plate / hollow bar / extension coupler / **sacrificial drill bit** (p.2); underground uses - forepoling, spiling, face bolting, radial bolting (p.4); corrosion protection and finishes incl. hot-dip galvanizing to ASTM A123 and the TwinCoat epoxy process (p.6); full hollow-bar dimension tables R25N-T111L with OD, ID, area, kg/m, yield and tensile load (p.7-8). **Consumable geometry only - no machine geometry at all.** | YES for the props, NO for the rig |
| `C:\Users\henri\Downloads\bwh-betek-katalog-bergbau-mining-en.pdf` | full text extracted and searched | **USELESS for this rig.** Searched for `bolt`, `anker`, `roof`: **zero hits**. It is a cutting/mining-tool catalogue, not ground support and not machines. | **NO** |
| `C:\Users\henri\Downloads\drillity-the-game\research\16-site-archetypes.md` | grep | Already covers the *context* thoroughly: §B.13 `rockbolt` machine class, the bolt-vs-hole diameter table, defect **D4** (`bolter` wrongly also offers the surface `anchor` method), defect **N4** (`rockbolt` reachable in `nordic` with no underground archetype). Carries no machine dimensions. | YES (context) |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` | L5729-5960 | The current `buildBolter()`. Read for comparison only - see §9. | YES |
| **WEB GAP-FILL** — Epiroc **Boltec S** technical specification, doc **9869 0088 01, 2018-09, Örebro**. Mirror: https://amt-inc.ca/wp-content/uploads/2019/08/Epiroc-Boltec_S.pdf (the epiroc.com original, `.../boltec/9869_0088_01c_Boltec_S_technical_specification_english.pdf`, returns HTTP 403 to a fetcher) | PDF p.2-3 (feature callouts), p.5 (full equipment list), **p.7 (dimensioned side elevation, Weight and Dimensions tables, coverage diagram)** | **The dedicated-bolter source the Downloads folder does not contain.** A fully dimensioned side elevation of a real rock bolting rig, its weight split, its bolting-unit spec (magazine capacity, bolt types, face-plate sizes), its lighting counts, its carrier and its coverage envelope. **This is now the primary geometry source for this rig**; the Boomer M jumbo is kept as the larger-machine comparison. | **YES - primary** |
| WEB — Epiroc product pages / spec index, via search | — | Confirms the family: **Boltec S** for 3 m x 3 m drives up to 7.5 m heading height, bolts 1.5-2.4 m; **Boltec M** for 4 m x 4 m up to 9 m boom reach, bolts **1.5-3.5 m**, width **2 245 mm**, height cabin **3 021 mm**, protective roof **2 361 / 3 061 mm**, tramming length **14 129 mm**, ground clearance **275 mm**, turning radius **7 100 / 4 550 mm**. Shows the size range the class spans. | YES |

## 2. What the machine IS

An **underground rock bolting rig** is a low, long, **centre-articulated four-wheel rubber-tyred
carrier** that installs permanent ground support in the back (roof) and walls of a mine drive or
tunnel. It drives itself in on diesel and then **works on mains electricity through a cable reel** —
an underground rig is a plugged-in machine at the face, not a self-powered one. It parks under
freshly blasted, *unsupported* ground, sets its jacks, and a single **boom that points UP almost all
the time** swings a short feed against the back. The feed drills a hole, then installs a bolt
through the same feed: a friction bolt driven, or resin/cement-grouted rebar or cable. A **bolt
carousel or magazine on the feed** presents the next bolt without a man walking under bad ground -
that is the machine's whole reason to exist, and the reason the equivalent function on a jumbo is
sold as a "safe bolting boom function... where the operator can safely load bolts into the feed
without having to pass in front of the machine into areas with an unsupported roof"
(`9869_0080_01f...pdf` printed p.3). Many bolters also carry a **mesh handling arm** that holds a
sheet of weldmesh flat against the back while the bolt goes through it. It is a *support* machine,
not a *production* machine: its output is installed and load-tested bolts, not metres drilled.

## 3. Proportions

### 3.1 PRIMARY — a real dedicated rock bolting rig (Epiroc Boltec S)

Source: **Epiroc Boltec S technical specification, doc 9869 0088 01, 2018-09**, PDF **p.7**
(dimensioned side elevation + Weight and Dimensions tables) and **p.5** (equipment list), mirrored
at https://amt-inc.ca/wp-content/uploads/2019/08/Epiroc-Boltec_S.pdf
**Model this machine.** It is a small-to-medium bolter for drives from **3 m x 3 m**, heading
heights to **7.5 m**, bolts **1.5-2.4 m** (p.2).

| Dimension | Value | Source |
|---|---|---|
| **Width** | **2 115 mm** | p.7 Dimensions |
| **Height, roof DOWN (tramming)** | **2 100 mm** | p.7 Dimensions + side elevation |
| **Height, roof UP (working)** | **2 841 mm** | p.7 Dimensions + side elevation |
| **Cabin height** (option) | **2 841 mm**; **lowered cabin 2 691 mm**; low-designed cabin for a seated operator **2 655 mm** | p.7 Dimensions; p.5 Cabin |
| **Length, tramming** | **10 020 mm** (boom and feed folded) | p.7 |
| **Ground clearance** | **365 mm** | p.7 |
| **Side-elevation dimension chain, rear to front** | **1 470 \| 637 \| 1 400 \| 1 400 \| 700 \| 850** mm | p.7 side elevation |
| — **rear overhang** (tail to rear axle) | **2 107 mm** (= 1 470 + 637) | derived from the chain; confirmed by measuring the rear wheel centre against the tick positions on the drawing |
| — **wheelbase** | **2 800 mm** (= 1 400 + 1 400) | same |
| — **articulation joint** | **exactly mid-wheelbase, 1 400 mm from each axle** | same |
| — **front overhang** (front axle to front of carrier) | **1 550 mm** (= 700 + 850) | same |
| — **boom + feed projection beyond the carrier** | **~3 563 mm** (10 020 − 6 457) | arithmetic on the chain, *derived not printed* |
| **Turning radius outer / inner** | **5 200 / 2 780 mm** | p.7 |
| **Weight, total** | **13 700 kg** — **boom side 9 000 kg, engine side 4 700 kg** | p.7 Weight table |
| **Tramming speed** | **>15 km/h** flat (rolling resistance 0.05); **>5 km/h** on 1:8 | p.7 |
| **Steering / articulation** | **±40 deg** | p.5 Carrier |
| **Tyres** | **9.00 x R20** (derived: **~966 mm dia, ~229 mm section**) | p.5 Carrier |
| **Clearance outside axles** | **rear 15 deg** | p.5 Carrier |
| **Diesel engine** | Deutz D914 L04 **55 kW** (77.8 hp @ 2 300 rpm, 270 Nm @ 1 500 rpm); or Deutz BF4 L 914 **72 kW**; or Deutz TD3.6 L4 **55 kW** | p.5 Carrier |
| **Electrical** | total installed **80 kW / main motors 75 kW** (50 Hz) or **66 kW / main motor 55 kW** (60 Hz); **380-1 000 V**; soft start; transformer 5 kVA; **stainless steel electrical enclosure**; **cable reel with limiting switch** | p.5 Electrical system |
| **Fuel tank** | **60 l** | p.5 Carrier |
| **24 V system, batteries** | **2 x 12 V, 70 Ah** | p.5 Carrier |
| **Boom** | **BUT 32**, automatic boom lubrication on the rear part | p.5 Boom |
| **Rock drill** | **COP RR11** (light-weight, high frequency); optional **COP RR14** for larger hole diameters / harder rock | p.5 Drilling system, p.3 |
| **Bolt magazine capacity** | **10 bolts** | p.5 Bolting unit |
| **Bolt length** | **max 1.5-2.4 m**; dual bolt lengths supported, shorter bolt **70 %** the length of the longer; dual bolt types | p.5 Bolting unit |
| **Face plates** | **rectangular max 150 x 150 mm**; **round max dia 200 mm** | p.5 Bolting unit |
| **Bolt types handled** | Swellex **Mn 12 / Mn 16 / Mn 24**; Split-set **SS39, SS46**; mechanically anchored (expanding shell); split wedge; rebar with **manual resin/cement cartridges** (extension system for the injection hose) | p.5 Bolting unit |
| **Air / water** | compressor **Atlas Copco GA5**; hydraulic water booster pump **12 bar, 66 l/min**; minimum water inlet **2 bar**; **water hose reel including hose** | p.5 Air/water system |
| **Lighting** | **tramming: 6 x 40 W LED + 2 x 70 W halogen**; **working lights mounted on the roof: 3 x 35 W, 24 V HID**; **illuminated stairs for platform**; optional manual spotlight left and/or right | p.5 Carrier / Cabin |
| **Jacks** | **front and rear hydraulic jacks** | p.5 Carrier |
| **Coverage (2.4 m bolts)** | **2 m either side of rig centre** on the left and right walls; **4 m height** on the roof; grid on the diagram is **500 mm** | p.7 coverage diagram |
| Other listed fittings | central lubrication + central grease point; **boot washing kit**; fire suppression ANSUL (manual or automatic); Ni-Cr plated piston rods; hydraulic oil leakage shutdown; **FOPS certified grizzly bar for the front window**; front window **16 or 24 mm**; **swingable seat for drilling and tramming** | p.5 |

**Ratios from the dedicated bolter — these are the numbers to model to:**
- **Tramming length : width = 10 020 : 2 115 = 4.74 : 1.** Long and narrow.
- **Width : roof-up height = 2 115 : 2 841 = 0.74 : 1.** **The identical ratio comes out of the
  larger jumbo (2 245 : 3 019 = 0.744).** Two independent machines, same proportion — this is a
  hard rule for the class: **it is always about a third taller than it is wide.**
- **Roof down : roof up = 2 100 : 2 841 = 0.74.** The roof drops by **741 mm**, a quarter of the
  machine's height, to tram. That is a real, visible articulation, not a detail.
- **Wheelbase : tramming length = 2 800 : 10 020 = 0.28.** The wheels are bunched in the middle
  third; **the overhangs are enormous** — 2 107 mm behind and 1 550 mm in front, i.e. the
  overhangs together (3 657 mm) exceed the wheelbase by 30 %.
- **Articulation joint is exactly at mid-wheelbase**, 1 400 mm from each axle.
- **Ground clearance : width = 365 : 2 115 = 0.17.**
- **Wheel dia : ground clearance = 966 : 365 = 2.65 : 1.**
- **Boom + feed projects ~3 563 mm ahead of the carrier when FOLDED for tramming**, i.e. **~36 %**
  of the machine's total length is boom hanging out front even in transport.
- **Mass split is 2 : 1 toward the boom end** (9 000 vs 4 700 kg) — *the opposite of the jumbo's
  near-50/50*. On a bolter the front frame with its boom, bolting unit and full magazine is by far
  the heavy end, and the rear module is comparatively light.

### 3.2 SECONDARY — the larger articulated underground carrier (Epiroc Boomer M2 jumbo)

Kept because it is the local, owner-supplied source and because it dimensions things the Boltec S
sheet does not (cable reel diameter, water hose length, clearance angles both ends, coverage
envelope in mm). **Where the two disagree, the Boltec S wins for this rig** — it is the actual
machine class. A dedicated bolter shares this carrier family; what differs is the boom and feed.
Source:
`9869_0080_01f_Boomer_M-series_technical_specification_english.pdf` printed **p.7**
("Technical specifications - Dimensions in millimeters": two side elevations, a front coverage
diagram, and the Dimensions / Tramming speed / Gross weight tables) and printed **p.6**
(Carrier / Protective roof / Cabin / Air-water / Electrical checklists).

| Dimension | Value | Source |
|---|---|---|
| **Width** | **2 245 mm** | p.7 Dimensions table |
| **Height, protective roof up** | **3 019 mm** (side elevation overall reads **3 043 mm**) | p.7 table "Height roof up/down 3 019/2 324"; side elevation `3 043` |
| **Height, roof down (transport)** | **2 324 mm** | p.7 table |
| **Height with enclosed cabin** (option) | **3 179 mm** | p.7 table |
| Secondary heights on the side elevation | **2 387 mm** (M2 Battery) / **2 297 mm** (M2 with COP 3038), and **1 947 mm** | p.7 side elevations. *Which features these reference is not legible at print resolution - see §8.* |
| Protective roof mounting-height adjustment | **-80 / +310 mm** (cabin: -140 / +250 mm; low-profile cabin -150 mm) | p.6 |
| **Ground clearance** | **260 mm** | p.7 table |
| **Wheelbase** | **3 970 mm** standard; **4 170 mm** long variant | p.7: `1 800 + 2 170 = 3 970`; `2 000 + 2 170 = 4 170` |
| - articulation joint to REAR axle | **1 800 mm** (2 000 mm long variant) | p.7 side elevation |
| - articulation joint to FRONT axle | **2 170 mm** | p.7 side elevation |
| **Rear overhang** (rear axle to rear extremity) | **2 900 mm** / **3 156 mm** long variant | p.7 side elevation |
| **Front overhang** (front axle to front of frame) | **934 mm** (a nested `795 mm` is also dimensioned) | p.7 side elevation |
| **Carrier length without boom/feed** | **~7 800 mm** (std) / **~8 260 mm** (long) - *derived by adding the p.7 chain, not printed* | arithmetic on p.7 |
| **Overall length with feed** | **14 297 mm** (BMH 6814 feed); **14 598 mm** (BMH 6914) | p.7 |
| **Articulation angle** | **+/-41 deg**, reduced to **30 deg** when the service platform option is fitted | p.6 Carrier |
| **Turning radius outer / inner** | **7 500 / 4 400 mm** (COP 1838); **7 200 / 4 400 mm** (COP 3038) | p.7 table |
| **Clearance angles outside the axles** | **13 deg rear, 22 deg front** | p.6 Carrier |
| **Tyres** | **12.00 x R24** | p.6 Carrier |
| **Gross weight** | one-boom rig **18 000-20 000 kg**, split **9 000-11 000 kg boom side / 9 000 kg engine side**; two-boom 23 000-29 000 kg | p.7 Gross weight table |
| **Tramming speed** | **>15 km/h** flat (rolling resistance 0.05); **>5 km/h** on 1:8; electric driveline **>12 km/h** | p.7 |
| **Cable reel diameter** | **1 600 mm** | p.6 Electrical system |
| **Water hose** | **1.5 inch dia x 70 m** on a hose reel | p.6 Air/water system |
| **Coverage envelope** | one-boom **9 655 mm wide x 7 178 mm high**; two-boom **10 068 x 7 483 mm**; **1 600 mm** across the machine roof in that view; **200 mm** dimensioned at floor level | p.7 front-view coverage diagram |
| Engines offered | Deutz TCD 2013 L04 **120 kW**; TCD 4.1 L04 **115 kW**; TCD 6.1 L06 **129 kW**; battery traction motor **150 kW** | p.6 Carrier |
| Installed electrical power | 83 / 118 / 158 / 198 kW options; **380-1 000 V, 50/60 Hz** | p.6 Electrical system |
| Fuel tank | 110 l | p.6 Carrier |
| Lighting | **tramming lights 8 x 22 W LED**; **working lights 4 x 150 W, 24 V DC**; illuminated stairs LED; optional joystick spotlights 70 W | p.6 Electrical system / Cabin |

### Ratios from the larger jumbo carrier (cross-check on §3.1)
- **Bare-carrier length : width = 7.8 m : 2.245 m = 3.5 : 1.** A long, narrow machine.
- **Width : roof-up height = 2.245 : 3.02 = 0.74 : 1** - it is **taller than it is wide**. The
  instinct that an underground machine is "low and squat" is wrong: it is low *relative to its
  length*, not squat in section. Get this wrong and the model reads as a skid loader.
- **Ground clearance : width = 260 : 2 245 = 0.116.** The belly plate runs very close to the floor.
- **Wheel:** 12.00R24 gives a 24 in (610 mm) rim + 2 x ~305 mm section = **~1 220 mm dia,
  ~305 mm wide** (derived from the tyre code, not printed as a diameter). **Wheel radius : ground
  clearance = 610 : 260 = 2.35 : 1** - the axle centres sit well above the belly.
- **The working end projects ~6 500 mm ahead of the frame** (14 297 - ~7 800), i.e. **~83 % of the
  carrier's own length** hangs out in front of it.
- **Coverage height : machine height = 7 178 : 3 019 = 2.4 : 1.** The boom reaches to more than
  twice the machine's own height. A model whose boom cannot plausibly do that is wrong.
- **Front/rear mass split is near 50/50** (9-11 t vs 9 t): the boom end is heavy, and the rear
  power-pack module genuinely acts as the counterweight.

## 4. Component inventory

### 4.0 What the dedicated-bolter side elevation shows (Boltec S p.7) — read this first

The Boltec S drawing is a clean line elevation and it settles several things the jumbo photo left
open. Working from tail to nose:

- **Rear module: a smooth, faired, sloping hood, not a boxy engine cover.** It has a shallow
  chamfered shoulder line running its whole length, a **lifting eye on top**, and small hinged
  service doors let into the flank. It reads as one sculpted volume.
- **The cable reel is mounted HIGH at the rear, drawn as a large circle inside the hood outline**,
  and it is the single biggest circular object on the machine. It sits *above* the rear axle,
  not behind it.
- **The cab is on the FRONT module, tall, upright and fully glazed** — a near-vertical box with a
  door with its own window, a large fixed side window, and a **flat roof cap that overhangs
  forward past the windscreen**. It occupies roughly the top half of the machine's height. This is
  the important difference from the jumbo, where the reference machine wears a low open canopy.
  Both exist; a bolter with a proper glazed cab is not wrong.
- **A real staircase, not a step.** Between the rear wheel and the cab door there is a **three- or
  four-tread open stair with a checker-plate landing** under the door. This is what "illuminated
  stairs for platform" (p.5) refers to.
- **A grizzly bar** (FOPS bar) can be fitted across the front window — a horizontal bar grille
  standing off the glass (p.5, option). Very distinctive if used.
- **Jacks: one behind the rear wheel and one just ahead of the front wheel**, each a short vertical
  cylinder ending in a **round dished pad**, tucked inside the machine width.
- **Mudguards are bolted arch plates** hugging the tyre closely, front and rear.
- **The boom pedestal is a tall triangular fabrication at the extreme front of the front frame**,
  carrying the machine's name badge on its flank — a natural place for the game's own badge.
- **The hose loom runs OVER the top of the boom in a shallow arc, on a row of regularly spaced
  saddle clamps** — the drawing shows roughly eight clamps along the boom. This is the single most
  characteristic service detail of the machine, and it is drawn as an ordered run, not a mess.
- **The nose below the boom pedestal slopes down and forward** into a low bumper/skid.

### 4.1-4.9 Detail (jumbo photo + both spec sheets)

Everything below is what I could see in the dimensioned side elevation
(`9869_0080_01f...pdf` printed p.7) and the large product photograph on printed p.2-3, plus the
equipment checklist on printed p.6. "Why it matters" is a modelling note, not a source claim.

### 4.1 Chassis: two frames and a hinge
- **Centre-articulated, two-module frame.** Front module carries the boom, the operator station
  and the drill services; rear module carries the engine/motor, hydraulics and the cable reel.
  They meet at a **vertical articulation pin** 1 800-2 000 mm ahead of the rear axle (p.7). The
  **steering cylinders sit across the joint**, one each side, and at full 41 deg lock the two
  modules break into a visible V.
  *Why it matters:* this hinge, not a turret, is how the machine aims itself down a drive. If the
  model has a slew ring instead, it stops being an underground machine.
- **Heavy fabricated box-section side rails** in dark grey/graphite, plainly a different colour
  from the yellow superstructure (visible on p.2-3 photo).
- **Full-length sloping belly skid plate.** On the p.2-3 photo the front module's underside is one
  continuous plate that ramps up towards the front bumper, with a lifting/access hole punched in
  it. With **260 mm** ground clearance (p.7) this plate is the machine's floor-contact surface and
  it is always the dirtiest, most scraped part of the whole machine.
  *Why it matters:* the single largest continuous surface in a low three-quarter view.
- **Front bumper / tow point** at the very front of the front module, 934 mm ahead of the front
  axle (p.7).

### 4.2 Undercarriage: WHEELS, NOT TRACKS
- **Four rubber tyres, 12.00 x R24** (p.6), four-wheel drive, **Dana 113 (short) axle** with
  automatic differential lock and limited slip (p.6). Derived diameter **~1 220 mm**, section
  **~305 mm**.
- **Deep, chunky, near-square block tread** with wide voids (p.2-3 photo). Not an agricultural
  lug pattern and not a smooth industrial tyre.
- **Dark grey/near-black wheel rims** with a visible ring of wheel nuts on a shallow-dish centre
  (p.2-3 photo).
- **Rigid steel mudguards / wheel arches** over the rear pair, bolted to the frame.
- **Clearance angles 13 deg rear, 22 deg front outside the axles** (p.6) — the front end is cut
  back much more steeply than the rear.
  *Why it matters:* **there is no sprocket, no idler, no track roller and no track shoe on this
  machine.** Any track-related geometry is wrong for this class (see §9).

### 4.3 Boom
- **One heavy universal boom** on a bolter (a jumbo takes two or three). The unit on p.2-3 is a
  "new heavy-duty BUT 36S boom"; the alternatives listed on p.6 are BUT 35 SL and BUT 36 S.
- **Big cast/fabricated pedestal** on the front frame, with a horizontal slew axis, then a
  boom-lift knuckle. On the p.2-3 photo the pedestal is a large yellow casting with visible
  bolt circles.
- **Telescopic boom extension** — the boom is a square-section outer with a smaller inner that
  slides out; the joint line and the wear-pad adjusters are visible.
- **Parallel-hold linkage** at the tip: a second link rod running the length of the boom keeps
  the feed at a constant attitude while the boom lifts. This is what lets the operator set the
  feed square to the back and then just move the boom.
- **Cylinders visible at working extension** (p.2-3): boom lift (one large cylinder under the
  boom, rod-out when the boom is up), boom telescope (internal), feed roll-over and feed swing at
  the head. Rods are **bright chrome / Ni-Cr plated** — p.6 lists "Ni-Cr plated piston rods" as an
  option, so the exposed rod on a working machine is a mirror-bright cylinder, not painted.
  *Why it matters:* a chrome rod standing 400-800 mm proud of its barrel is the strongest single
  "this machine is under load right now" cue in the whole model.

### 4.4 Feed and head
- **A short feed beam**, not a mast. It is an **extruded/fabricated beam of roughly square
  section with a machined bright top face**, drilled with a regular row of lightening/fixing
  holes along the web (clearly visible on p.2-3). The carriage runs on **rails machined into the
  beam's flanks**, not on a lattice.
- On a jumbo the feeds are 12/14/16/18 ft (BMH 6000-series, p.6). **A bolter's feed is much
  shorter than a jumbo's**, because it must fit between the floor and a back only ~3-5 m up and
  still hold a bolt: bolt length plus stroke, typically well under half a jumbo feed.
- **Feed extension cylinder** and a **feed-front support foot** at the collar end that is pushed
  against the rock to hold the hole position.
- **Black wheel/roller at the very tip of the feed** (p.2-3) — the feed's front support.
- **The drifter (rock drill)** rides the carriage: on p.6 the options are COP 1638HD+, 1838HD+,
  2238HD+, 3038 and COP MD20. Physically it is a **long, ribbed, oil-tight steel housing** with
  the percussion end at the back, the rotation motor as a bulge on the side, and the **shank
  adapter / chuck** at the front. The p.2-3 photo shows it as a dark grey/silver machined body
  sitting in a yellow cradle, with **four or five hoses entering it from behind**.
- **Hose/cable drag chain along the feed** to serve the moving carriage — a black articulated
  chain or a bundle in a spiral wrap, doubling back on itself as the carriage travels.
- **Water spraying kit on the cradle**, **hole blowing kit**, **water mist flushing** (p.6): the
  collar end has a **flushing head with a hose to it** and a **dust shroud**.

### 4.5 The bolting hardware (what makes it a BOLTER, not a jumbo)
Sourced from `research/03-mining.md` §C.2.3 and §A.4 and `research/16-site-archetypes.md` §B.13:
- **Bolt magazine / carousel** mounted on or beside the feed, indexing the next bolt into line.
- **Bolt-type-dependent second system:** a **resin cartridge feed**, or a **grout pump + mixer +
  water tank** on the deck, or a **high-pressure water pump** for inflatable friction bolts.
- **Mesh handling attachment** — an arm that lifts a mesh sheet and holds it against the back
  while the bolt goes through it.
- **Operator basket** on some designs.
- Consumable geometry, from `Minova-SDA-Brochure-EN-USA-MEX.pdf` **PDF p.7-8** ("Minova's hollow bar technical
  data", printed p.12-13) — real numbers for the props lying on the deck:
  - Hollow bar **R25N**: 24.7 mm OD, 14 mm ID, 300 mm2, **2.35 kg/m**, yield 150 kN.
  - **R32N**: 38 mm OD, 19 mm ID, 750 mm2, **5.9 kg/m**, yield 230 kN, tensile 280 kN.
  - **R51N**: 51 mm nominal, yield 630 kN, tensile 800 kN.
  - **T76N**: 111 mm OD, 85 mm ID, 1 870 mm2, **25 kg/m**, tensile 1 600 kN.
  - **Nuts have a spherical (domed) cap on at least one end**, to take a bolt that is not square
    to the plate; **plates have a chamfered bore** allowing **5 deg of deviation in any
    direction** (Minova **PDF p.2 and p.7**). A flat washer face on a game bolt plate is wrong.
  - Finish: **bright (uncoated) steel, hot-dip galvanized to ASTM A123**, or galvanized plus an
    epoxy coat ("TwinCoat", corrosion category C5-M / Im3 to ISO 12944-2) (Minova **PDF p.6**).
  - A **sacrificial drill bit** is left in the hole at the end of a self-drilling anchor
    (Minova **PDF p.2**) — so a spent bit is *not* recovered and a used SDA bar has a bit welded on.
- Also on p.6 of the Boomer spec: **"Hydraulic Swellex pump type H1 for manual installation"** —
  a separate skid-mounted high-pressure water pump is a real deck item on a bolting machine.

### 4.6 Operator station
- **Protective roof (canopy) as standard, enclosed cabin as an option** (p.6). The canopy version
  is what most bolters run: a **flat, thick steel roof plate on four heavy posts**, open at the
  sides, ROPS/FOPS certified. On the p.2-3 photo the roof is a black plate with a **louvred /
  slotted front edge** and a broad flat cap.
- **Roof height is adjustable: -80 / +310 mm** for the canopy, **-140 / +250 mm** for the cabin,
  and a **low-profile cabin is -150 mm** (p.6). That adjustment exists because the drive height is
  the constraint.
- Cabin option: **ROPS/FOPS, <80 dB(A), stainless steel body, 22 mm P8B safety-classed front
  window**, air conditioning, reversing camera, **swingable seat for drilling and tramming** (p.6).
  *Why it matters:* the seat swings because the operator faces sideways/backwards to drill and
  forwards to tram. A fixed forward-facing seat is a truck, not a bolter.
- **Side platforms on both sides of the operator station** — this is precisely what makes the
  "safe bolting boom function" possible: the feed swings all the way back to the platform so the
  operator loads bolts *without walking under unsupported ground* (p.3). **Two side platforms with
  handrails, reached by steps, are a defining feature of a bolter and are load-bearing visually.**
- **Illuminated stairs (LED)** are listed on p.6 — so there IS a stair/step assembly with lights
  in it, on the operator side.
- **Two operator panels for standing operation** (p.6, option): a bolter operator often stands.

### 4.7 Services, hoses and reels
- **The hose bundles are the loudest visual feature of the whole machine.** On the p.2-3 photo,
  bundles of 4-8 hoses in **black spiral-wrap protection** leave the front frame, drop into a
  **deep free catenary loop below the boom pedestal**, and run up the boom in shallow S-curves
  with clamps at intervals. The loops are generous, not tight: they have to survive full boom
  articulation. Get the loop slack wrong and the machine reads as a toy.
- **Cable reel, 1 600 mm diameter** (p.6) — a large drum at the rear, usually the tallest object
  on the rear module, with the trailing cable running off it to the wall socket.
- **Water hose reel**, hose **1.5 in x 70 m** (p.6). A second, smaller reel.
- **Hose/cable guiding at water/cable reel** is a listed option (p.6) — a fabricated fairlead.
- **Hydraulically driven screw compressor** (Atlas Copco GA 5 or GA 30, p.6) and a **water booster
  pump** (15 or 30 bar, 200-400 l/min) live on the rear deck as recognisable boxes.
- **Central lubrication system**, **fire suppression** (ANSUL or FORREX), **rig washing kit**,
  **boot washing kit** (p.6) — a bolter carries a wash-down hose because the operator's boots are
  in the mud. All small deck fittings worth a bump on the silhouette.
- **Stainless steel electrical enclosure** (p.6) — the electrical cabinet on the deck is
  **unpainted brushed stainless**, a different material from everything around it. Visible on the
  p.2-3 photo as a louvred cabinet behind the operator station.
- **24 V batteries 2 x 125 Ah**; battery version carries a **700 V, 280 Ah** pack (p.6).

### 4.8 Stabilisers
- **"Front and rear hydraulic jacks"** (Boltec S p.5). On the Boltec S elevation there is **one
  behind the rear wheel and one just ahead of the front wheel**, each a short vertical cylinder
  with a **round dished pad**, tucked inside the machine width. Also visible on the Boomer p.2-3
  photo.
- **A roof jack (vertical stinger against the back) is NOT listed** on the Boltec S. It is
  attributed to the longhole rig in `research/03-mining.md` §C.2.2; I found no source putting one
  on a bolter. See §8.

### 4.9 Lighting
- **Bolter (Boltec S p.5):** **tramming lights 6 x 40 W LED + 2 x 70 W halogen** = eight lamps;
  **working lights mounted on the roof, 3 x 35 W, 24 V HID**; **illuminated stairs for platform**;
  optional manual spotlight left and/or right.
- **Larger jumbo (Boomer p.6), for comparison:** **8 x 22 W LED tramming** and **4 x 150 W, 24 V DC
  working lights**; optional joystick-controlled 70 W spotlights; illuminated stairs LED.
- Both machines therefore carry **eight tramming lamps** and **three to four roof-mounted work
  lamps**. Two sources, same count of tramming lamps, different wattages — both recorded.
  *Why it matters:* underground, the machine's own lamps are the only light source in frame. Eight
  small tramming lamps + four big work lamps is the real count, and a lamp aimed **up the feed at
  the collar** is what a bolter actually needs.

## 5. Distinctive features (thumbnail silhouette)

1. **The break in the middle.** A long low body with a **visible vertical hinge** and two steering
   cylinders across it, and at lock the two halves bent into a V. Nothing else on a mine site has
   that shape except an LHD and a truck.
2. **A single boom pointing UP, with a short feed held square to the roof.** The boom reaches
   **2.4x the machine's own height** (7 178 mm coverage vs 3 019 mm machine, p.7). At thumbnail
   size the feed is a short bright bar tilted against the roof, not a tall mast.
3. **Big black hose catenaries.** Thick spiral-wrapped bundles hanging in visible loops between
   the frame and the boom — a fat black scribble across the yellow. Recognisable at 64 px.
4. **The cable reel drum at the tail** — a 1 600 mm circle standing above the rear deck, with a
   cable running away from it along the floor. It says "plugged in", i.e. underground.
5. **Rubber tyres bunched in the middle third, with huge overhangs both ends.** Wheelbase is only
   **28 % of the machine's length** (2 800 of 10 020 mm, Boltec S p.7). At thumbnail size the
   machine reads as a long body with the wheels tucked under the middle — which is exactly what an
   LHD looks like too, and exactly what a truck does not.
6. **No tracks.** Wheels, not tracks; a rubber-tyred machine. A tracked, tall-masted machine is
   the wrong species entirely.

*(The roof up/down state is a sixth tell but not a silhouette one: the same machine is 2 100 mm
tall tramming and 2 841 mm tall working — Boltec S p.7.)*

## 6. Materials and paint

| Surface | Treatment | Where |
|---|---|---|
| Superstructure, boom, feed cradle, engine hood, deck boxes, handrails | **Gloss painted steel**, one dominant high-visibility body colour (the reference machine is yellow — *use the game's own palette, not a manufacturer's yellow*) | Everything above the frame rails |
| Main frames, belly plate, bumper, mudguards, boom pedestal base, jack legs | **Painted steel in a second, much darker grey/graphite** | Chassis and anything that meets the ground |
| Cylinder rods at working extension | **Bright chrome / Ni-Cr plate** (p.6 lists Ni-Cr plated piston rods) — mirror finish, never painted | Boom lift, telescope, feed extension, jacks |
| Feed beam top face and rails | **Bare machined steel, polished by the carriage** — a bright wear stripe running the length of the beam | Feed |
| Drifter housing | **Machined/phosphated steel, dark grey with oil sheen**, ribbed | On the carriage |
| Electrical cabinet | **Brushed / unpainted stainless steel** (p.6 "Stainless steel electrical enclosure"); the optional cabin body is also stainless | Rear deck, behind the operator |
| Hoses | **Black rubber under black spiral-wrap plastic**, matte, slightly dusty | Everywhere |
| Tyres | **Black rubber**, matte, dust-loaded to grey in the tread voids | Four wheels |
| Glazing | Cabin option only: **22 mm P8B safety-classed front window** (p.6). Canopy version has **no glass at all** | Cab front |
| Bolts, plates, nuts, mesh | **Hot-dip galvanized to ASTM A123** (Minova **PDF p.6**) — a dull, crystalline, blue-grey spangled finish, NOT chrome and NOT painted; or bright uncoated steel; or galvanized + epoxy | Consumables on deck and in the carousel |

**Where dirt, wear and rust actually accumulate** (an underground machine gets dirty in a very
specific pattern, and it is not the pattern of a surface rig):
- **Wet grey-brown rock slurry, not dry dust.** Underground bolting uses water flush and the floor
  is wet. The machine is *washed* by that water as much as coated by it: **vertical surfaces run
  streaky and clean-ish, horizontal surfaces hold a flat film of grey mud.**
- **The belly plate and the lower 300-400 mm of both frames** — plastered, scraped down to bare
  metal on the high points of the skid plate.
- **Wheel arches and behind the tyres** — the heaviest mud build-up on the machine.
- **The top of the feed beam and the boom's upper surfaces** — because the machine works under a
  roof it is drilling into, everything that falls comes down **on top of the boom and feed**:
  cuttings, water, and occasionally the rock itself. This is the reverse of a surface rig, where
  the top surfaces stay cleanest.
- **A clean bright stripe down the feed rails** where the carriage wipes it, inside an otherwise
  filthy beam.
- **Chrome rods**: clean and wet where they have retracted inside the wiper, filmed and slightly
  scored where they stay out.
- **Rust** shows on: chipped edges of the belly plate and bumper, jack feet, the ends of handrail
  tubes, the mesh sheets stacked on the deck (mesh is often bare steel and rusts in weeks), and
  any bolt plates in stock that are not galvanized. **Galvanized items do not rust orange** — they
  go dull grey and chalky, which is a different and much less common look.
- **Paint wear**: the handrails, the steps, the grab points and the platform floor plate are
  polished bare by gloved hands and boots; that is a metallic sheen, not rust.
- No sun-fade, no bleached paint: underground there is no UV. **Underground paint stays saturated
  and gets scratched; it does not chalk.**

## 7. Photo references

Honest answer: **`C:\Users\henri\Downloads` contains no photograph of an underground rock bolter.**
I swept the Downloads root, `Atpa\`, `Atpa\Atpa products\` and the file listing of every
subdirectory. The best *machine* image in the folder is a jumbo studio shot inside a PDF. The one
true dedicated-bolter drawing had to come from the web.

| File / source | Useful for |
|---|---|
| **Epiroc Boltec S technical specification p.7** (web, mirrored at https://amt-inc.ca/wp-content/uploads/2019/08/Epiroc-Boltec_S.pdf) | **The best reference for this rig, full stop.** A clean, complete, dimensioned line elevation of a real rock bolting rig: hood form, cable reel position, cab, stairs and landing, jacks, mudguards, boom pedestal, hose loom on saddle clamps over the boom, feed and bolting head. Use it for silhouette and for every proportion. Also carries the coverage diagram and the weight split. |
| `C:\Users\henri\Downloads\9869_0080_01f_Boomer_M-series_technical_specification_english.pdf` printed **p.2-3** | **The only real reference image of this machine class in the folder.** A large, sharp studio photograph of an articulated underground drilling carrier at a three-quarter front angle with the booms raised. Use for: hose routing and loop slack, boom pedestal casting, feed beam section and hole pattern, drifter and cradle, canopy roof form, electrical cabinet, wheel/tyre tread, belly plate, mudguards, frame-vs-body colour split. |
| same file, printed **p.7** | Dimensioned side elevation (twice) and front coverage envelope. Use for: every proportion in §3, and for the boom/feed folded transport attitude. |
| same file, printed **p.3** (three small inset photos) | Underground lighting reference: how a machine lit only by its own lamps reads against a wet grey drive. Low value, but real. |
| `C:\Users\henri\Downloads\Minova-SDA-Brochure-EN-USA-MEX.pdf` **PDF p.2** | An exploded line illustration of the anchor: **nut, plate, hollow bar, extension coupling, sacrificial drill bit**, correctly proportioned. Use for the consumable props. |
| `C:\Users\henri\Downloads\drillity-the-game\shots\*r11-bolter*.png`, `*m11-rockbolt*.png` | These are **the game's own renders**, not references. Useful only as before/after. |
| `C:\Users\henri\Downloads\Atpa\` and `Atpa\Atpa products\` | ~60 photographs of **drilling tools and drill heads** (casing shoes, drill bits, rotary heads). No underground machines. Useful for tool/bit material and wear reference, nothing else. |
| `C:\Users\henri\Downloads\AdobeStock_*.jpeg`, `Gemini_Generated_Image_*.png` | AI-generated / stock marketing images (checked `AdobeStock_576964972.jpeg`: an offshore worker in the rain). **Not usable as engineering reference; do not model from them.** |

## 8. NOT SOURCED

Everything below I could not find and did not invent:

**Not in the local material at all (had to be pulled from the web, or is still missing):**
- **No dimensioned drawing of a dedicated bolter exists in `C:\Users\henri\Downloads`.** §3.1 is a
  web gap-fill. The owner's folder gave the jumbo carrier and the consumables, nothing more.
- **No photograph of an underground bolter, jumbo, LHD or drive exists in Downloads.**
- **Bolter feed length in mm.** Boltec S p.2 says only that the bolting unit is *"100 mm reduced
  feed length"* versus earlier units, and that dead length is short. No absolute figure found.
  Do NOT put a 12-18 ft jumbo feed on this machine.
- **Bolt carousel geometry**: capacity is sourced (**10 bolts**, Boltec S p.5) but the **drum
  diameter, the number of arms, and whether it indexes about the feed axis or beside it** are not.
  The p.2 text does say it *"can be loaded in the vertical position without power to the
  machine"*, which implies the magazine can be brought upright and reached from the platform.
- **Mesh handler arm geometry** — reach, lift, fork spacing, sheet size held. Confirmed to exist as
  a class feature (`research/03-mining.md` §C.2.3); the Boltec S sheet does not list one at all,
  so I cannot say whether this size of bolter normally carries one.
- **Resin / cement cartridge magazine form and capacity.** Boltec S p.5 lists only *"rebar bolts —
  manual resin/cement cartridges"* and an *"extension system for injection hose for resin
  cartridges"*. No grout pump, mixer or water tank is listed on this model — **the game's deck-
  mounted grout pump + mixer + water tank may belong to a cement-grouted (Boltec "C") variant
  rather than this one, and I could not confirm which.**
- **Roof-jack (vertical stinger)**: Boltec S lists only *"front and rear hydraulic jacks"*. No
  roof jack is listed. `research/03-mining.md` §C.2.2 attributes one to the longhole rig; I found
  no source putting one on a bolter.
- **Cable reel diameter for a bolter.** Sourced only for the larger jumbo (1 600 mm).
- The reference points of the `2 387` / `2 297` / `1 947` heights on the Boomer p.7 side elevation.
- **Bolt spacing / pattern in a real drive** (row and ring spacing) — not verified in this pass.
- **Colour.** No source specifies a colour for a *game* machine, and copying the reference
  machines' yellow-and-graphite would be copying a brand. The palette must come from the game's
  own art direction. Only the *material* breakdown in §6 is transferable.

**Checked and found useless:**
- `bwh-betek-katalog-bergbau-mining-en.pdf` — full text extracted, searched for `bolt`, `anker`,
  `roof`: **zero hits.** Cutting-tool tooling, not ground support and not machines.
- `C:\Users\henri\Downloads\AdobeStock_*.jpeg` / `Gemini_Generated_Image_*.png` — AI/stock
  marketing imagery. Sampled `AdobeStock_576964972.jpeg`: an offshore worker in the rain.
- `C:\Users\henri\Downloads\Atpa\**` — ~60 photographs of drill bits, casing shoes and rotary
  heads. Good tool reference, no machines.

## 9. Domain-truth warnings

Read against `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` `buildBolter()`
(L5741-5960) and its `spec` block.

**What the game already gets right, and should not be "fixed":**
- Articulated wheeled underground carrier (`buildUndergroundCarrier`), canopy, jacks, cable reel,
  resin/grout system on the deck, mesh handler arm, bolt carousel, a work light **on the feed
  aimed up at the collar**, the parallel-hold comment, the hole-smaller-than-the-bolt rule for
  friction bolts, and scoring on install quality rather than metres. All of that matches
  `research/03-mining.md` §C.2.3 and §A.4 and the Boomer spec.
- `frameRadius: 6.8`, `articulationDeg: 43`, `groundClearanceMm: 300` are all in the right
  neighbourhood.

**Discrepancies worth checking against the sources:**

| # | Game value / behaviour | Source says | Note |
|---|---|---|---|
| W1 | `width: 2.24 m` in `buildUndergroundCarrier` | **Boltec S 2 115 mm**; Boomer M2 / Boltec M **2 245 mm** | Right for the family, ~130 mm wide for a small bolter. Keep or trim slightly. |
| W2 | `frontLen: 3.60 + rearLen: 4.80 = 8.40 m` carrier length | **Boltec S carrier = 6 457 mm** (1 470+637+1 400+1 400+700+850), tramming length with the folded boom **10 020 mm** | **The game's carrier body is ~30 % too long.** More importantly the game's proportion is wrong in *distribution*: see W2b. |
| W2b | Game front module 3.60 m, rear module 4.80 m — **the rear is the longer half** | Boltec S: **front of the articulation = 1 400 + 1 550 = 2 950 mm; rear of the articulation = 1 400 + 2 107 = 3 507 mm**, and the wheelbase is only 2 800 mm with the joint exactly mid-wheelbase | The game's split (0.75 : 1) is not far off the real 0.84 : 1, but the **wheelbase is the thing to fix**: 2 800 mm on a 10 m machine means the wheels sit in the middle third with huge overhangs at both ends. |
| W3 | `clearance: 0.30` (and `groundClearanceMm: 300`) | **Boltec S 365 mm**; **Boltec M 275 mm**; **Boomer M2 260 mm** | **Three sources, three values.** All recorded; none picked silently. The game's 300 mm sits inside the range and is defensible. |
| W4 | `wheelR: 0.52` → 1 040 mm dia, `wheelW: 0.44` → 440 mm wide | Boltec S runs **9.00 x R20** → **~966 mm dia, ~229 mm section**; the bigger jumbo runs 12.00R24 → ~1 220 x ~305 mm | Diameter is fine. **The width is roughly double any sourced tyre** — 440 mm vs 229-305 mm. Game wheels will read as flotation tyres, not mine-machine tyres. This is the clearest single geometry error. |
| W5 | `articulationDeg: 43` | **Boltec S ±40 deg**; Boomer M2 **±41 deg** (30 deg with a service platform) | Close; 40-41 is the sourced number. |
| W6 | `trammingHeightMm: 1900` | **Boltec S height roof DOWN 2 100 mm**, roof up **2 841 mm**; Boltec M protective roof **2 361 / 3 061 mm** | **~200 mm too low** against the closest machine. Also: the game has **no roof up/down state at all**, and on the real machine the roof drops **741 mm (26 % of the machine's height)** to tram. That is a big, animatable, very characteristic movement the game is missing. |
| W7 | `weightKg: 14 600` | **Boltec S total 13 700 kg** (boom side 9 000, engine side 4 700) | **The game is right.** My earlier read against the 18-20 t jumbo was the wrong comparison. Keep 14 600. |
| W8 | `dieselKw: 74, electricKw: 55` | Boltec S diesel **55 kW / 72 kW / 55 kW** options; electrical **main motor 55 kW (60 Hz) or 75 kW (50 Hz)**, total installed 66 / 80 kW | **The game is right, essentially exactly.** 74 kW diesel matches the 72 kW option; 55 kW electric matches the 55 kW main motor. Keep both. |
| W8b | `magazine: 8` bolts | **10 bolts** (Boltec S p.5 Bolting unit) | Two short. Trivial to fix, and the carousel is the machine's headline feature. |
| W8c | `boltLengthsM: '0.9-3.6'`, `boltLenM: 2.40` | Boltec S **1.5-2.4 m**; Boltec M **1.5-3.5 m** | The 2.40 m modelled bolt is exactly right. The advertised range 0.9-3.6 m is wider at both ends than either real machine. |
| W8d | `bolt-plate` 150 mm and 200 mm variants; `bolt-nut-m24` | Boltec S handles **rectangular plates max 150 x 150 mm** and **round plates max dia 200 mm** | **Exactly right, both sizes.** Note the real distinction: 150 is the square/rectangular one, 200 is the round one. |
| W8e | Weight distribution not modelled | Boltec S **boom side 9 000 kg vs engine side 4 700 kg — nearly 2 : 1 toward the front** | If the game ever sags suspension or tilts the machine, the front end is the heavy end on a bolter (unlike the jumbo, which is near 50/50). |
| W9 | Canopy built at `w: 1.05, h: 1.00, d: 1.15` with a `screen` (glazing) | The **standard** fit is an open **protective roof**, not a glazed cabin; the cabin is an **option** (p.6). Roof height is adjustable −80/+310 mm | A canopy this small (1.05 m wide on a 2.245 m machine) is plausible for a half-cab, but the glazing should be optional/absent on the base machine. |
| W10 | **No side platform on the operator side for bolt loading** — the code builds one small platform at `[-1.00, deckY, -2.30]` for the mesh hand, plus one 3-point handrail | The reference machine's whole safety argument is **side platforms on BOTH sides of the operator station** so the feed can swing back to the operator "without having to pass in front of the machine into areas with an unsupported roof" (p.3) | **This is the biggest missing feature.** Two side platforms with handrails and a lit step assembly are what make a bolter read as a bolter rather than a small jumbo. |
| W11 | No steps/stairs modelled | **"Illuminated stairs LED"** is a listed item (p.6) | Add a step assembly on the access side. |
| W12 | One `feed-work-light` at `wattHint: 50`; no other lamps | Boltec S: **tramming 6 x 40 W LED + 2 x 70 W halogen**; **working lights on the roof 3 x 35 W, 24 V HID**; **illuminated stairs**. Boomer M2: 8 x 22 W tramming + 4 x 150 W working | The single feed lamp is the right *idea* and the code's reasoning for it is sound. But the real machine carries **8 tramming lamps and 3 roof-mounted work lamps** — and underground those lamps are the whole lighting model. The 50 W hint sits between the sourced 35 W and 70 W, so it is fine; the **count** is what is missing. |
| W13 | No compressor, no water booster pump, no water hose reel modelled | Boltec S: **compressor Atlas Copco GA5**, **hydraulic water booster pump 12 bar / 66 l/min**, **water hose reel including hose** (p.5). Boomer M2: booster 15-30 bar, 200-400 l/min, hose 1.5 in x 70 m | The deck is missing its air and water half. Only the resin/grout half is modelled. Two reels — cable and water — is the real arrangement. |
| W14 | `cableReel` radius 0.55 → **1 100 mm drum**, placed at `deckY + 0.72` on the rear module | Boltec S lists a **cable reel with limiting switch** but does **not** dimension it; the Boomer M2 gives **1 600 mm** (p.6). On the Boltec S elevation the reel is drawn as a large circle **high inside the rear hood, above the rear axle** | Two sources; only one carries a number, and it is for the bigger machine — so **1 100 mm is not demonstrably wrong for a small bolter.** What *is* checkable: the reel should sit **high and above the rear axle, inside the hood line**, and be the largest circular object on the machine. |
| W14b | No roof up/down mechanism | **Height, roof down 2 100 / roof up 2 841 mm** (Boltec S p.7); the Boomer canopy adjusts **-80/+310 mm** and the cabin **-140/+250 mm** (p.6) | A 741 mm vertical travel on the operator's roof, used every time the machine trams. Nothing in the game expresses it. |
| W15 | Electrical cabinet not modelled | **Stainless steel electrical enclosure** (p.6) | A brushed-stainless box is a free, cheap material-contrast win on an otherwise single-colour machine. |
| W16 | `methods: ['rockbolt', 'anchor']` | `research/16-site-archetypes.md` **defect D4**: `anchor` is a **surface** slope/retaining-wall method; giving it to an articulated underground bolter puts this machine on a Nordic forest track | **Already logged as a known defect elsewhere in the research; still present in the builder.** Not a geometry issue, but it is a domain-truth issue on this exact rig. |
| W17 | `frictionCapacityT: '7.3-16.3'` | `16-site-archetypes.md` gives **Split Set 90 kN** and **Swellex 130 kN** capacities | 7.3-16.3 t = 72-160 kN, which brackets both. Consistent — no conflict. |
| W18 | Materials: the carrier is built almost entirely from `p.paint` / `p.dark` | The reference machine is **two clearly different painted greys/colours** (bright body vs graphite chassis) plus **bare stainless**, **bright chrome rods**, **bare machined feed rails** and **galvanized consumables** | The palette in the code has all these materials available (`steel`, `worn`, `chrome`, `__galv`); the bolter uses them sparsely. More material contrast, especially a dark chassis under a bright body, would do more for realism than any added geometry. |

**One structural warning that is not in the table:** the class has **no tracks, no sprocket, no
idler, no track rollers and no track shoes.** If anything in the shared rig helpers ever attaches
track geometry to this machine it is wrong for the species — this is a four-wheel, rubber-tyred,
centre-articulated machine and the wheels are the identity.

