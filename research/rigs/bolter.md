# Rig reference — `bolter` : underground rock bolting rig

status: in progress
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
| `C:\Users\henri\Downloads\Minova-SDA-Brochure-EN-USA-MEX.pdf` | in progress | Self-drilling anchor (hollow bar) system - bar, coupler, sacrificial bit, nut, plate. Consumable geometry, not machine geometry. | partial |
| `C:\Users\henri\Downloads\bwh-betek-katalog-bergbau-mining-en.pdf` | in progress | Mining tooling catalogue. | partial |
| `C:\Users\henri\Downloads\drillity-the-game\research\16-site-archetypes.md` | grep | Already covers the *context* thoroughly: §B.13 `rockbolt` machine class, the bolt-vs-hole diameter table, defect **D4** (`bolter` wrongly also offers the surface `anchor` method), defect **N4** (`rockbolt` reachable in `nordic` with no underground archetype). Carries no machine dimensions. | YES (context) |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` | L5729-5960 | The current `buildBolter()`. Read for comparison only - see §9. | YES |

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

**Figures below are for the Epiroc Boomer M2 / M2 Battery articulated underground drilling
carrier**, the closest dimensioned machine in the local material. A dedicated bolter shares this
carrier class; what differs is the boom and the feed on the front. Source:
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

### Ratios that matter more than the absolutes
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

*(in progress)*

## 5. Distinctive features (thumbnail silhouette)

*(in progress)*

## 6. Materials and paint

*(in progress)*

## 7. Photo references

*(in progress)*

## 8. NOT SOURCED

- The reference points for the `2 387` / `2 297` / `1 947` height dimensions on the Boomer p.7 side
  elevation - the extension lines are not legible at the resolution the PDF renders.
- No dimensioned drawing of a **dedicated bolter** (Boltec / Bolter Miner class) exists anywhere in
  `C:\Users\henri\Downloads`. Everything in §3 is a jumbo carrier of the same class.

## 9. Domain-truth warnings

*(in progress)*
