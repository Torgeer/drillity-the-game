# tunnel-jumbo — Two-boom tunnelling face-drilling jumbo (Epiroc Boomer M class)

status: complete for the material available locally; see §7 and §8 for the gaps
subject: game rig id `tunnel-jumbo`, builder `buildTunnelJumbo()` in `src/rig/rigFactory.js` (~line 5245)

> **Naming rule (DOMAIN.md §10).** This document cites real OEM literature for
> GEOMETRY, PROPORTION and MATERIALS only. No manufacturer name or model
> designation — Epiroc, Atlas Copco, Boomer, BUT, BMH, COP, DCS, RCS, Sandvik —
> may appear in the game as a product name, badge, decal, hull text or UI string.
> **Copy the shapes; never copy the badge.** Note that the elevation drawings cited
> below carry an "Epiroc" wordmark on the engine hood and on the boom extension tube,
> and a "BOOMER" nameplate on the cab pillar; if the modeller traces those panels,
> the lettering must not come with them.

---

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\9869_0080_01f_Boomer_M-series_technical_specification_english.pdf` | 5 physical pages / printed 1–8. Text extracted whole; printed p.7 rendered at 260 dpi and read as an image; carrier and boom crops re-rendered at 600 dpi | **The primary source.** Two fully dimensioned side elevations (M2 Battery w/ COP 1838, and M2 w/ COP 3038), a dimensioned coverage-area front view, and complete dimension / weight / tramming tables. Plus the full option matrix: rock drills, booms, feeds, electrics, cabin, protective roof, lighting, fire suppression. | **Yes — §3 and most of §4 come from here** |
| `C:\Users\henri\Downloads\Top_Hammer_Tools.pdf` (Mitsubishi Materials Hardmetal, rev. Jun-2024, 88 pp) | Text extracted whole; printed p.21–32 ("DRIFTING & TUNNELLING DRILLING EQUIPMENT") read as text, PDF p.22 rendered at 110 dpi and read as an image | **Yes, for the tooling on the front of the machine.** An exploded string diagram — **button bit → HEX drifting rod → coupling sleeve → shank adapter** — plus complete rod-length menus. Confirms drifting rods are **hexagonal**, and gives the real rod-length ladder (see §4.11). Also disagrees with the rig OEM about which thread is a "drifting" thread — recorded in §4.11. | **Yes** |
| `C:\Users\henri\Downloads\bwh-betek-katalog-bergbau-mining-en.pdf` (BWH Bohrwerkzeuge Hoffmann / Betek, 57 pp) | Text extracted whole; TOC and front matter read | **Not useful for this subject.** It is a tungsten-carbide *pick and cutting-tool* catalogue — foundation drilling, trenching, tungstuds, drum cutters, roadheader picks. The strings "jumbo", "face drill", "drifter" and "boomer" do not appear anywhere in the extracted text. It has nothing to say about a face-drilling jumbo. | **No** |
| `C:\Users\henri\Downloads\drillity-the-game\research\04-tunnelling.md` §C1 | lines ~1142–1172 | The existing project brief for this machine: silhouette, "booms >> body", coverage 6–206 m², ~3 m telescopic booms extending to ~4 m, cable reel and hose drum, drill-steel changer racks, retro-reflective striping, the lift/swing/re-collar beat. **Already correct and consistent with the OEM drawings**, and richer than this doc on motion and on the in-game-name rule. | **Yes — read it alongside this** |
| `research/16-site-archetypes.md` §B.14 + §A.6 | lines ~830–860, 2443–2455 | Covers the *setting*, not the machine: the underground heading archetype (12.6 × 8.4 m heading vs 5.0 × 5.0 m production drive, already implemented in `core/env.js UNDERGROUND`), ventilation duct along the crown, and the fact that a jumbo also works at a tunnel portal in daylight. Also the standing note that "a surface crawler is not an underground jumbo — underground machines are low, wide, centre-articulated". | **Yes, for context** |
| `research/10`, `research/11`, `research/12` | grepped | **10 and 11 are foundation / anchor / geotech OEM packs** — KLEMM, Bauer, Eurodrill, EMDE. They cover drifters as *components* and feed beams on articulated arms, but nothing on a face jumbo. **12 is rock tooling** and is the right pack for threads, shanks and bits; it already indexes shank adapters by drifter maker and warns (§ its own note) that rock-drill *model* names are unsafe to reuse. | **10/11 no; 12 yes for tooling** |
| `research/18-visual-reference.md` | whole (81 lines) | About the cross-section piling animation and the surface/section seam. Nothing on jumbos. | **No** |
| `C:\Users\henri\Downloads\3D-Bilde-4525JBR-transport-position-1024x576.png` | image | Read on the chance "JBR" meant a jumbo. It does not — it is a **rail-mounted geotechnical/rotary drill on a flat wagon with a separate power pack**, red livery. Useful only as a counter-example of what this machine is *not*. | **No** |
| `C:\Users\henri\Downloads\AdobeStock_576965172.jpeg`, `AdobeStock_576964972.jpeg` | images | AI-generated stock portraits of workers in hi-vis (one underground-ish, one offshore). No machine visible. | **No** |
| `C:\Users\henri\Downloads\Atpa\` (43 files) | listing + `atpa-de-slide-3.jpg` sampled | A drilling-**tool** manufacturer's product and factory photography — bits, drill heads, a works interior with a curtainsider being loaded. **No underground machines of any kind.** | **No** |

---

## 2. What the machine IS

A **two-boom electro-hydraulic face-drilling jumbo**: a low, centre-articulated,
four-wheel rubber-tyred carrier that carries two long hydraulic booms on its nose,
each boom ending in a slender feed beam with a hydraulic percussive rock drill that
runs along it. It exists to drill the **blast round** in a tunnel or mine development
heading — sixty-odd parallel 38–64 mm holes, several metres deep, in a
cut / easer / stoping / contour / lifter pattern — as fast and as accurately as one
operator can place them, then to reverse out so the round can be charged and shot.
It **trams on diesel and drills on mains electricity**, dragging its own supply cable
off a reel on the back deck; the motors driving the hydraulic pumps are 55–95 kW *each*
(source: technical specification, printed p.5, "Total installed drilling power 118 kW …
2x55 kW", "158 kW … 2x75 kW", "198 kW … 2x95 kW", "Voltage 380–1 000 V 50/60 Hz").

It stands **in the heading, square to the face**, close enough that the feeds touch
rock. The coverage diagram (printed p.7) gives a drilling envelope of
**10 068 mm wide × 7 483 mm high** for the two-boom machine — it drills a full 65 m²
tunnel profile without moving the carrier. It is *not* a crawler, *not* a mast rig, and
it does not drill downward: the feeds point **horizontally at a vertical rock face** and
swing through the whole arch above and beside the machine.

---

## 3. Proportions

All from `9869_0080_01f_Boomer_M-series_technical_specification_english.pdf`, printed
p.7 ("Technical specifications — Dimensions in millimeters"), two-boom M2.

### 3.1 Printed dimension table (p.7)

| Quantity | Value | Note |
|---|---|---|
| Width | **2 245 mm** | over tyres |
| Height with cabin | **3 179 mm** | |
| Height, protective roof up / down | **3 019 / 2 324 mm** | canopy version |
| Length with BMH 6814 feed(s) | **14 297 mm** | feeds forward, horizontal |
| Ground clearance | **260 mm** | |
| Turning radius outer / inner (COP 1838) | **7 500 / 4 400 mm** | |
| Turning radius outer / inner (COP 3038) | **7 200 / 4 400 mm** | |
| Tramming speed, flat (rolling resistance 0.05) | >15 km/h | electric driveline >12 km/h |
| Tramming speed, 1:8 incline | >5 km/h | |
| Gross weight, **two-boom rig** | **23 000–29 000 kg** | boom side 17 500–19 000 kg; engine side 6 000–10 000 kg |
| Gross weight, one-boom rig | 18 000–20 000 kg | boom side 9 000–11 000 kg; engine side 9 000 kg |

**The weight split is a modelling fact, not trivia.** On a two-boom machine roughly
**70 % of the mass sits on the front (boom) frame**. The front frame must read as the
heavy end — deep box frame, big jacks, thick bumper plate — and the rear frame as a
lighter sheet-metal power-pack module.

### 3.2 Dimension chain along the bottom of the elevation (p.7)

Upper drawing — M2 Battery with COP 1838:

```
[rear extremity] --3 156--> [REAR AXLE] --2 000--> [ARTICULATION] --2 170--> [FRONT AXLE] --795--> [boom mount face]
                                        \__________________ 4 170 wheelbase __________________/
                                                                        \_____ 934 front overhang _____/
                      total, feeds extended forward:  14 598 with BMH 6914
```

Lower drawing — M2 with COP 3038: 2 900 / 1 800\* / 2 170 / 795, wheelbase 3 970,
total **14 297 with BMH 6814** (\* footnote: "COP 3038 adds 200 mm").

**Derived carrier length: 3 156 + 4 170 + 934 = 8 260 mm.** The carrier is ~8.3 m; the
machine is ~14.3–14.6 m with the feeds out. **The booms and feeds therefore project
roughly 6.0–6.3 m beyond the front bumper — about three-quarters of the carrier's own
length again.** That overhang is the most important proportion on the machine.

### 3.3 Heights read off the elevation (p.7)

| Marked dimension | Battery / COP 1838 | M2 / COP 3038 | What it measures |
|---|---|---|---|
| Overall (top of raised feed / roof up) | **3 043** | **3 043** | tallest point |
| Cab roof | **2 387** | **2 297** | |
| Rear power-pack hood | **1 947** | **1 947** | top of the engine-side deck |

**Disagreement recorded, not resolved:** the elevation says overall 3 043 mm; the table
on the same page says "Height with cabin 3 179 mm" and "Height roof up/down
3 019 / 2 324 mm". These are three different option builds documented on one page.
Both sets are given; do not silently average them.

### 3.4 Ratios that matter more than the absolutes

- **Carrier length : width ≈ 8 260 : 2 245 ≈ 3.7 : 1.** Long and narrow.
- **Width : hood height ≈ 2 245 : 1 947 ≈ 1.15 : 1.** The rear power pack is nearly as
  tall as it is wide — a squat brick, not a slab.
- **Ground clearance : width = 260 : 2 245 ≈ 0.116.** Visually it almost drags.
- **Wheelbase : carrier length = 4 170 : 8 260 ≈ 0.50.** Rear overhang (3 156) is over
  three times the front overhang (934) — the machine looks like it is leaning forward
  onto its booms.
- **Coverage envelope : machine width = 10 068 : 2 245 ≈ 4.5 : 1.** The booms sweep four
  and a half machine-widths.
- **Cab roof : overall height = 2 387 : 3 043 ≈ 0.78.**
- **Feed length : feed depth ≈ 20 : 1** (see §4.2 — scaled, not printed).

### 3.5 Coverage area (p.7, dimensioned front view)

| | Two-boom rig | One-boom rig |
|---|---|---|
| Envelope width | **10 068 mm** | 9 655 mm |
| Envelope height | **7 483 mm** | 7 178 mm |
| Envelope extends **below floor level** by | **200 mm** | |
| Marked width at machine centre | 1 600 mm | |
| Stated coverage area | "up to 65 m²" (cover, printed p.1) | |

The **200 mm below floor level** matters: the lifter row is drilled *below* the invert so
the round breaks to grade. A boom that stops at floor level is wrong.

### 3.6 Wheels, axles, driveline (printed p.6, "Carrier")

- Tyres **12.00 × R24**. (Overall tyre diameter NOT SOURCED here.)
- **Dana 113 (short) axle**; four-wheel drive; automatic differential lock, limited slip.
- **Articulated steering ±41°** — reduced to **30°** if the RHS E or SP2 service platform
  is fitted (footnote, p.6).
- Clearance outside axles **13° rear, 22° front**.
- Diesel options: Deutz TCD 2013 L04 **120 kW** (Stage IIIA/Tier 3), TCD 4.1 L04
  **115 kW** (Stage V/Tier 4F), TCD 6.1 L06 **129 kW** (CN4). Battery version:
  **traction motor 150 kW**; "150 kW electric drive train … emits 80 % less heat during
  tramming than its diesel-driven counterpart's 120 kW diesel engine" (printed p.3).
- **Fuel tank 110 l only.** It barely trams; it drills on the cable.

---

## 4. Component inventory

Everything below is read off the printed p.7 elevations (rendered at 600 dpi) or the
p.5–6 option tables of the same PDF, unless another source is named.

### 4.1 Booms — BOX SECTION, NOT LATTICE

Two booms, mounted **side by side on the front face of the front frame, ahead of the
front axle, at roughly front-hub height** (the elevation puts the boom base pin about
level with the top of the front wheel). Each boom is:

- a **straight, gently tapering welded rectangular box arm** — smooth plate, no lattice,
  no trusswork. This is the biggest silhouette difference from a surface drill rig.
- carrying a **telescopic extension**: a smaller box section slides out of the main arm
  (visible as a stepped-down section with a witness line about two-thirds along). The
  option list names the booms **BUT 35 SL** and **BUT 36 S**; "the new heavy-duty BUT 36S
  boom is optimized for tough conditions" (printed p.3).
- driven by a **lift cylinder slung underneath**, from a lug on the base bracket to a lug
  about half-way along the arm. Dark barrel, bright chrome rod — the elevation draws the
  rod as a distinctly lighter, thinner cylinder emerging from the barrel.
- carrying a **parallel-holding link**: a slim second tube running parallel to and below
  the main arm, base bracket to head bracket, forming a parallelogram so the feed keeps
  its attitude as the boom lifts. **This is the detail that makes a boom read as a jumbo
  boom and not as an excavator stick.**
- ending in a **compact positioning head** with two more short cylinders (feed roll and
  feed swing) and a forked yoke clamping the feed cradle.

*Why it matters visually:* a jumbo silhouette is two long horizontal lines (the feeds)
carried on two short diagonal lines (the booms), converging on one point at the nose of a
low carrier.

**A boom is a bolting tool too.** Printed p.3: "the Boomer M-series … offers a safe
bolting boom function for the semi-mechanized installation of rock bolts. Due to the
design of the BUT 36S booms and the side platforms on both sides of the operator station,
it is possible to swing the feed all the way back to a position where the operator can
safely load bolts into the feed without having to pass in front of the machine into areas
with an unsupported roof." **So the feed must be able to swing right back over the
machine, past the cab, to a loading position.** That is a required pose, not decoration.

### 4.2 Feed and cradle

- **Feed beam:** a long, constant-section, ribbed **extrusion** — the elevation shows four
  or five continuous longitudinal ribs the whole length. Feeds offered: **BMH 6000-series
  in 12 ft, 14 ft, 16 ft and 18 ft**, plus **telescopic BMHT 6000-series (max 18 ft)** for
  low headings (printed p.5, "Feed"). The two elevations are drawn with BMH 6814 and
  BMH 6914.
- **Scaled off the p.7 elevation** (using the printed 14 598 mm dimension line as scale —
  a measurement, not a printed figure, so treat as ±3 %): the complete feed assembly,
  drifter at the rear stop to centraliser nose, is **≈ 6 800–6 900 mm long**; feed depth
  ≈ 300–350 mm. **Length : depth ≈ 20 : 1** — a very long, very slender beam.
- **Cradle / feed holder:** a broad flat **plate saddle under the feed**, roughly a third
  of the feed's length, between feed and boom head. The feed **slides fore-and-aft in this
  cradle** on a **feed-extension cylinder** mounted horizontally beneath the beam (drawn as
  a dark barrel with chrome rod, under the cradle, pointing forward). That is how the
  operator pushes the feed onto the face without moving the machine.
- **Front centraliser / drill-steel support:** a short **black block at the very nose of
  the feed**. It holds the rod concentric and is the part that physically touches rock —
  always the most battered item on the machine.
- **Water spraying kit on cradle** is a listed feed option (printed p.5).
- **Rod handling:** the option list gives **Rod Adding System (RAS)** and **extension
  drilling set BSH 110**, both "BMH feeds only", RAS "not in combination with COP 3038,
  max 14 ft feed". **On a standard face jumbo the round is drilled single-pass with one
  rod; there is no rod carousel and no rod rack.** See §9.

### 4.3 Rock drill (drifter) — one per boom

- **The drifter sits at the REAR of the feed and is pulled forward along it.** In the
  elevation it is drawn parked at the rear stop with a fan of five or six hose lines
  curving off its back.
- Models: **COP 1638HD+, COP 1838HD+, COP 2238HD+, COP 3038, COP MD20** (printed p.5).
  Recommended service interval 1 000 impact hours; "up to 30 % less RDT consumption"
  (printed p.3).
- **Shank adapters R38 / T38 / R32 / TC42**; **couplings ø55 × 170 mm and ø57 × 175 mm**
  (printed p.6).
- **Minimum hole diameter 38 mm** with COP 1838 / 2238 on SR35-H35-T38 Speedrod;
  **45 mm** with COP MD20 on SR35-R39-T38; **64 mm** with COP 3038 on TC42-R39-TC42
  Speedrod (printed p.6, "Drifter rods"). Extension/injection rods: Rnd 32 Speedrod and
  Rnd 39 Speedrod.
- Ancillaries listed: **hole blowing kit**, **water mist flushing**, **rock drill
  lubrication warning kit**, **lubrication air filtration system** (printed p.5).

### 4.4 Cab / canopy — on the FRONT (boom) frame, behind the booms

Two build states, both documented:

- **ROPS/FOPS certified cabin**, noise **<80 dB(A)**, **body made of stainless steel**,
  **front window 22 mm, P8B safety-classed**, air conditioning (with water-transferred
  heating), reversing camera with monitor, fixed or swingable seat "for drilling and
  tramming", **joystick-controlled spotlights left and/or right, 70 W**, media player,
  12 V radio outlet, electric heater 1.2 kW 230 V or 10 kW 700 V. Mounting height
  adjustable **−140 / +250 mm**; **low-profile cabin −150 mm** (printed p.6).
- **Protective roof** (open canopy) version: mounting height **−80 / +310 mm**, manual
  spotlight left and/or right, **two operator panels for standing operation only**,
  swingable seat (printed p.6).

The elevation draws a **glazed cab, mounted transversely over/just behind the front axle,
with a steeply raked windscreen, a flat roof carrying a small forward visor**, and a broad
door with a full-height window. **The cab is NOT at the back of the machine** — the
operator sits between the articulation and the booms, looking straight down the feeds.

### 4.5 Rear frame — the power pack

- A **low, closed sheet-metal hood** with a strongly **down-sloping tail**, top at
  **1 947 mm**, tapering almost to the bumper. This rearward taper is distinctive.
- **Cable reel, drum diameter 1 600 mm** (printed p.5, "Electrical system"), with **dual
  controls for cable reel**. In the elevation it is the large flat spiral lying **on top of
  the rear hood, tilted, axis transverse** — a disc almost as tall as the hood itself. The
  most recognisable single object on the back of the machine.
- **Water hose reel**; water hose **ø1.5 inch × 70 m** (printed p.5).
- **Exhaust silencer and stack** behind the cab: a horizontal cylindrical vessel with a
  short vertical stack, plus a second cylindrical vessel (air receiver for the compressor).
- **Radiator / electric-motor block:** a tall finned vertical block immediately behind the
  cab, at the articulation.
- **Hydraulically driven screw compressor** (Atlas Copco GA 5 or GA 30); **water booster
  pump**, hydraulic 15 bar / 200 l/min or 30 bar / 400 l/min, or electric 15 bar /
  300 l/min; minimum water inlet 2 bar (printed p.5).
- **Stainless steel electrical enclosure**; digital voltmeter/ammeter in the cabinet;
  transformer 8 kVA (100 kW for battery charging); electric outlets 16 A / 32 A CE;
  24 V system with **2 × 125 Ah** batteries; battery version **700 V, 280 Ah**.
- **Fire suppression: ANSUL (manual, checkfire or automatic) or FORREX (automatic)** —
  reads as a bottle rack plus small-bore distribution tubing threaded over the power pack.
- **Central lubrication system**, manual lubrication kit, **rig washing kit**, **boot
  washing kit**, heater kit for hydraulic tank / engine / motors.
- Hydraulic tank with **low oil level indicator**, **oil temperature gauge on the tank**,
  **oil filter indicator**, 16 µm filtration, electrical oil filling pump.

### 4.6 Articulation joint

Between the two frames, **2 000 mm ahead of the rear axle and 2 170 mm behind the front
axle**. The elevation draws it as a dense vertical stack of pinned lugs with hoses
threading through — the busiest single area on the machine, because the whole hydraulic
and electrical harness crosses here. **Steering angle ±41°**, 30° with a service platform.
"Hose/cable guiding at water/cable reel" is a listed carrier item.

### 4.7 Jacks / stabilisers

The elevation shows a **slim vertical jack cylinder with a round foot immediately behind
the front wheel**, tucked against the frame. The rig jacks up on these while drilling so
the tyres cannot move under feed thrust. **Number, stroke and rear positions NOT SOURCED**
in this document — see §8.

### 4.8 Access — platforms, stairs, handrails

- **"Illuminated stairs LED"** (printed p.5) — so there is a lit **stair**, not a ladder,
  on at least one side.
- **"side platforms on both sides of the operator station"** (printed p.3). They exist so
  the operator can swing a feed back and load a rock bolt into it **without walking in
  front of the machine under unsupported roof**. That safety story is *why* the platforms
  are wide and *why* they are there.
- **RHS E / SP2 service platform** is an option, and fitting it **cuts steering from 41°
  to 30°** — i.e. it is a large structure overhanging the articulation.
- Handrails follow the platform edges. Heights and post spacing NOT SOURCED.

### 4.9 Lighting

- **Tramming lights 8 × 22 W LED**
- **Working lights 4 × 150 W, 24 V DC**
- **Illuminated stairs LED**
- **Joystick-controlled spotlights 70 W** left and/or right (cabin option), or manual
  spotlights (protective-roof version)

(printed p.5, "Electrical system"; p.6, "Cabin" / "Protective roof".)
**Note the count: eight tramming lights, only four work lights.**

### 4.10 Hose routing

Not dimensioned in this PDF, but the 600 dpi elevation crop shows the pattern clearly:

1. A **fan of 5–6 hoses off the back of the drifter**, looping down and back along the top
   of the feed beam. This loop must stretch and slacken as the drifter travels — a static
   hose here is an immediate tell.
2. Hoses running **along the underside of the boom box** and along the parallel link,
   clipped at intervals.
3. A dense **crossing bundle at the boom base bracket**, and again at the articulation.
4. The **supply cable** paying off the reel and trailing on the floor behind the machine.

### 4.11 The drill string — what actually hangs off the front

From `Top_Hammer_Tools.pdf`, printed p.21–32, "DRIFTING & TUNNELLING DRILLING EQUIPMENT".
The exploded diagram on printed p.22 (read as an image) gives the string, in order:

**button bit → HEX drifting rod → coupling sleeve → shank adapter → (drifter)**

- **The drifting rod is HEXAGONAL, not round.** The catalogue calls it a "HEX drifting rod"
  and draws it as a hex bar with upset, threaded ends. A round extension rod (`ER32R32`)
  exists in the same series and is a *different* product. A face-jumbo rod modelled as a
  plain cylinder is losing the six flats that catch the light.
- **Rod length ladder, R32 hex** (printed p.32): **3 100 / 3 700 / 4 310 / 4 920 /
  5 530 mm** = 10 / 12 / 14 / 16 / 18 ft. **These are exactly the BMH feed sizes the rig
  OEM lists.** So a 14 ft feed carries a 4 310 mm rod, and the round is ~4 m.
  Weights: 27.0 kg (4 310), 30.9 kg (4 920), 41.3 kg (5 530) for Ø35 hex.
- **Shorter ladder, R25 hex** (printed p.23): 2 175 / 2 475 / 2 600 / 2 800 / 3 100 mm.
  Even the shortest catalogued drifting rod is **2 175 mm**.
- **Round rods, R32** (p.32): 1 830 / 2 440 / 3 050 / 3 660 mm.
- **Coupling sleeves:** R32 **Ø45 × 150 mm**, R38 **Ø54 × 170 mm** (p.32). The rig OEM
  independently gives **Ø55 × 170 mm** and **Ø57 × 175 mm** (Boomer spec, printed p.6) —
  the two sources agree to within a couple of millimetres.
- **Shank adapter** is drawn as a bright, polished, plain cylinder with a splined tail —
  visually the *cleanest* steel on the whole machine, because it lives inside the drifter.

**Two sources disagree about the thread — recorded, not resolved:**
| Source | Says |
|---|---|
| `9869_0080_01f_Boomer_M-series…pdf` p.6 | Face-drilling rods are **SR35-H35-T38 Speedrod / SR35-R39-T38 / TC42-R39-TC42**; shank adapters **R38, T38, R32, TC42**; minimum hole **38 mm (T38)**, 45 mm (MD20), 64 mm (COP 3038). |
| `Top_Hammer_Tools.pdf` | Puts **R25 / R28 / R32 / NR34 / R35** under "DRIFTING & TUNNELLING", recommended gauge **Ø33–Ø64**; and puts **T38** under "**BENCH & LONG HOLE**", recommended gauge **Ø64–Ø102**. |
Both are true of their own product world — a modern jumbo really does run T38 Speedrods at
45–51 mm; a conventional tooling house sells hex R-rods for drifting. **Record both; do not
let the game assert one as the fact.**

Button-bit geometry that the tooling catalogue does give (printed p.22–23), useful for the
bit model at a face-drilling diameter: a Ø45 mm type-23 bit carries **6 × Ø9 mm gauge
buttons + 3 × Ø8 mm face buttons**, gauge angle **30°**, **1 side + 3 face flush holes**,
mass **0.7 kg**. A Ø45 type-06 bit: **5 × Ø11 gauge + 2 × Ø9 face**, 1 side + 2 face holes.
Cross bits at Ø35–45 use carbide **10 × 19 mm**, 2 side + 1 face hole.

---

## 5. Distinctive features — the thumbnail silhouette test

1. **Two long horizontal beams sticking far out in front of a low carrier** — ~6 m of feed
   past an 8.3 m carrier. Nothing else underground has this shape.
2. **Centre-articulated, four-wheel, rubber-tyred, extremely low** — 2 245 mm wide, hood at
   1 947 mm, 260 mm clearance, big flotation tyres, rear frame tapering away to the tail.
3. **A large disc lying on the back deck** — the 1 600 mm cable reel. At thumbnail size it
   reads as a wheel where no wheel should be.
4. **All the mass at the front** — ~70 % of a 23–29 t machine on the front frame. The
   silhouette leans onto its booms.
5. **No mast, no derrick, nothing vertical.** Every long line on this machine is horizontal
   or shallow-diagonal. A thumbnail with a vertical tower is not a face jumbo.

---

## 6. Materials and paint

Explicit from the document:

- **Cabin body made of stainless steel** (printed p.6) — bare/brushed, not painted.
- **Stainless steel electrical enclosure** (printed p.5) — same.
- **Front window 22 mm, P8B safety-classed** — thick laminate; it should read as a deep,
  slightly green edge, not thin glass.
- **Ni-Cr plated piston rods** (printed p.5, hydraulic system; "limitations exist") — every
  extended cylinder rod is **bright mirror chrome**, not grey steel. The elevations confirm
  this: rods are drawn a full tone lighter than the barrels.
- **Mineral or biodegradable hydraulic oil** — a leaking machine leaves a dark stain.
- Tyres **12.00 × R24** — black rubber, deep lug tread.

Inferred surface reading (marked as inference, NOT sourced):

| Surface | Finish |
|---|---|
| Frames, hoods, cab shell, boom arms, cradle | painted steel, single colour, gloss |
| Cylinder rods | bright chrome |
| Cylinder barrels | dark, near black |
| Feed beam | extrusion — duller, greyer, satin; polished bright where the carriage runs |
| Drifter body | dark grey/black casting, oily |
| Rods, shanks, couplings, bits | bare steel, rust-flashed and mud-coated |
| Front centraliser nose | bare, hammered, no paint left |
| Hoses | matte black rubber, dulled grey by rock dust |
| Handrails, grab bars, stair treads | contrast paint, worn bright at hand and foot |
| Trailing cable | matte black, muddy |

Where wear and dirt actually accumulate on a working face jumbo:

- **The nose of the feed and the front metre of the boom** — closest to the face, hit by
  cuttings and flushing water. Effectively no paint survives here.
- **The whole underside.** It drives on muck at 260 mm clearance; everything below hub
  height is one colour — wet rock mud.
- **Two clean stripes along the feed beam** where the carriage rides, polished bright.
- **Chrome rods stay bright except at the seal** — a dirt ring marks full extension.
- **Grey-white rock flour** dusted over the top of the hood and the cable reel, streaked by
  water runs.
- Rust is thin and orange at plate edges, weld toes and the bumper. Underground and wet, so
  it is a *film* of rust, not deep scale.

---

## 7. Photo references

**Result of the sweep, stated plainly: there is no photograph of a face-drilling jumbo
anywhere in `C:\Users\henri\Downloads` or in `C:\Users\henri\Downloads\Atpa`.** I checked
the root image list (every `.png` / `.jpg` / `.jpeg` / `.avif`, sorted by size), opened the
plausible candidates, and listed and sampled the `Atpa` folder. What is actually there:

| Path | What it is | Use for this machine |
|---|---|---|
| `C:\Users\henri\Downloads\9869_0080_01f_Boomer_M-series_technical_specification_english.pdf` printed p.7 | **Two dimensioned side elevations and a dimensioned coverage front view.** Line art, but it is a *general-arrangement drawing* and better than a photo for geometry. | **The reference. Render printed p.7 at 300–600 dpi and model from it.** Boom architecture, feed and cradle, cable reel, cab, hood taper, articulation, front jack all legible at 600 dpi. |
| Same PDF, printed p.2–4 (spread pages, PDF pages 2–3) | Marketing spread with machine photography and callouts (safe bolting boom, BUT 36S boom, ROPS/FOPS cabin, filtration package, upgraded feeds). | Colour, livery and in-service context — **but read the naming rule at the top of this file before using anything with a wordmark on it.** |
| `Top_Hammer_Tools.pdf` printed p.22 (PDF p.22) | Exploded string diagram: button bit, hex drifting rod, coupling sleeve, shank adapter, plus bit face photographs (types 23, 06, cross). | **The tool models** — bit face layout, hex rod, polished shank. |
| `C:\Users\henri\Downloads\3D-Bilde-4525JBR-transport-position-1024x576.png` | Rail-mounted geotech/rotary drill on a flat wagon, with a separate skid power pack, red livery, white background 3D render. | **Counter-example only.** Shows how a *non*-jumbo underground/rail drill reads: single feed, no articulated carrier, no booms. |
| `C:\Users\henri\Downloads\Atpa\*` (43 files) | Drill bits, drill heads, works interiors, a curtainsider being loaded, product slides. | Nothing. |
| `AdobeStock_576965172.jpeg`, `AdobeStock_576964972.jpeg`, `AdobeStock_69686132.jpeg` | AI-generated hi-vis worker stock imagery. | Nothing (and `research/18` already warns about AI-labelled reference). |

**Gap to fill:** the owner has said there are "a lot of info in Downloads and pictures".
For this machine there are not. If a photo pack for a face jumbo exists elsewhere on the
machine it has not been put in Downloads; ask for it, or accept that the general-arrangement
drawing is the reference.

---

## 8. NOT SOURCED

- Drilled hole depth / round length for a given feed size (the PDF gives feed sizes in feet
  but no drilled depth).
- Number, stroke and exact positions of the stabiliser jacks.
- Feed beam cross-section dimensions (only scaled off a drawing, ±3 %).
- Boom base pin height above ground; boom section dimensions; telescope stroke.
- Boom slew and lift angular ranges (only the coverage envelope is given).
- Handrail heights, platform widths, stair geometry.
- Overall tyre diameter for 12.00 × R24.
- Paint colours — the drawings are line art; there is no colour anywhere in this PDF.
- Rock-drill physical dimensions (COP 1838 / 3038 length, width, mass).
- Water and air flow rates **at the drill**; flushing pressure at the bit. (Rig-level
  booster-pump capacities are sourced; per-drill flow is not.)
- Percussion power, impact pressure, blow frequency, rotation speed/torque and feed force —
  **the rig spec sheet publishes none of these**, only rock-drill model names.
- Hose routing dimensions and clamp spacing. The Bauer hydraulic-hose catalogue named in
  the brief was **not** consulted: it is a hose-*product* catalogue and carries no routing
  geometry for this machine. If someone wants hose diameters for the drifter loop, that is
  where to look; the routing itself is only available from the elevation and from photos
  that do not exist locally (§7).
- **Paint colour and livery.** No colour image of this machine class is in the material
  read. This is the one gap that does not matter: DOMAIN.md §10 requires the game's own
  livery regardless.
- A **photograph** of the class from any angle other than a line-art side elevation —
  no plan view, no rear three-quarter, no view of the operator station or the platforms.
- Ventilation-duct clearance / the machine's relationship to the heading profile it drills
  (covered instead by `research/16` §A.6 and `core/env.js UNDERGROUND`).

---

## 9. Domain-truth warnings vs the current game builder

Read against `src/rig/rigFactory.js` — `buildTunnelJumbo()` (~line 5245), the spec block at
~5435, `buildJumboBoom()` (~4882), and the `'tunnel-jumbo'` tool mapping (~7249). **I own no
source files and changed nothing.**

### 9.0 First, what the builder gets RIGHT — do not "fix" these

- **Centre-articulated four-wheel carrier**, not a crawler. Correct, and the header comment
  gives the right reason (turning a 90° intersection).
- **Cab/canopy offset to one side of the front frame.** Correct, and matches
  `research/04` §C1.
- **Cable reel on the rear deck, diesel to tram / mains to drill.** Correct, and it is the
  single detail the header comment is proudest of — deservedly.
- **Two hose drums beside the reel.** Correct; the OEM lists a water hose reel with
  ø1.5 in × 70 m of hose.
- **Boom built as a stepped box girder with weld flanges, with a telescope and a
  roll-tilt head** (`buildJumboBoom`). Correct architecture, correct anti-toy instinct.
- **Boom-mounted work lights, one per boom, aimed down the feed at the collar**, with the
  comment that these are *the* light in the heading. Correct and well argued.
- **A basket boom for charging and scaling.** Real on charging variants
  (`research/04` §C1) — see the caveat in 9.9.
- **Transport width 2 260 mm** vs the OEM's 2 245 mm. Essentially exact.
- **Frame turning radius 7.8 m** vs the OEM's 7.5 m outer. Close.
- **Charging hose and detonator reel on the deck between rounds.** The OEM lists a
  "hydraulic outlet for charging with Mini SSE", so charging kit lives on the machine.

### 9.1 The class question — the biggest issue, and it is a decision, not a bug

The builder's spec block describes a **low-profile mini jumbo**: 16 800 kg, 74 kW diesel,
70 kW electric, tramming height 1 775 mm, transport length 10 375 mm, 2 132 mm holes on
2 435 mm rods, 8.6 km/h. That is a coherent machine and a real class.

**It is not the class this reference covers.** A two-boom M-series is:

| | game `tunnel-jumbo` | sourced two-boom M-series |
|---|---|---|
| Gross weight | 16 800 kg | **23 000–29 000 kg** |
| Diesel | 74 kW | **115–129 kW** (or 150 kW traction motor) |
| Drilling power | 70 kW | **118–198 kW** (2 × 55 / 75 / 95 kW motors) |
| Feed | 3.90 m | **12 / 14 / 16 / 18 ft**, feed assembly ≈ **6.8 m** |
| Hole length | 2 132 mm | **~3.1–5.5 m** (rod ladder, §4.11) |
| Rod | 2 435 mm | **3 100 / 3 700 / 4 310 / 4 920 / 5 530 mm** |
| Transport length | 10 375 mm | **14 297–14 598 mm** |
| Tramming | 8.6 km/h | **>15 km/h** flat |
| Articulation | 43° | **41°** (30° with a service platform) |
| Ground clearance | 300 mm | **260 mm** |

**Decide deliberately.** Either scale to the M-class (and inherit the ~6 m feed overhang
that makes the silhouette), or stay low-profile — but if you stay low-profile, fix 9.2–9.8,
because those are wrong for *both* classes. **Do not average the two.**

### 9.2 The feed is built as a MAST. A jumbo has no mast.

`buildTunnelJumbo` calls **`buildSimpleMast(...)`**, keeps `dyn.mastPivot`,
`dyn.mastLower`, `dyn.mastUpper`, `dyn.mastHeight`, `dyn.flexScale`, and then rotates the
whole thing flat with `dyn.workTilt = -Math.PI / 2`.

A face jumbo has **no mast anywhere on it**. The feed is a beam carried in a cradle on a
boom head; there is no mast foot, no mast pivot on the carrier, no lower/upper mast
section, and nothing that stands up. Turning a vertical mast 90° gets the *pose* right and
the *structure* wrong — and it inherits mast semantics (flex, transport tilt about a
carrier-mounted pivot) that do not describe this machine. §5 item 5: **no vertical anything.**

### 9.3 There is a drill-steel rod rack on the carrier. There should not be.

`buildRodRack(..., { rows: 2, cols: 4, len: 2.435 })` puts eight rods along the front frame.
A face jumbo drills its round **single-pass with one rod in the feed**. The OEM's
rod-adding equipment — **RAS (Rod Adding System)** and **extension drilling set BSH 110** —
is an *option*, is restricted ("BMH feeds only", "not in combination with COP 3038, max
14 ft feed"), and **lives on the feed, not on the deck**.

(`research/04` §C1 does list "drill steel changer racks along the carrier" as a
sell-it detail, so this is a genuine disagreement between the project's own notes and the
OEM spec. Recorded both ways: a rack is defensible as a *spares* rack, but eight rods
staged for a round is not how this machine drills.)

### 9.4 The rod is 2 132 mm. That is shorter than any catalogued drifting rod.

`rodLen = 2.132`, `holeLenMm: 2132`, `rodMm: 2435`. The shortest hex drifting rod in
`Top_Hammer_Tools.pdf` is **R25 at 2 175 mm** (p.23); the R32 ladder starts at **3 100 mm**
(p.32). Even a genuinely low-profile jumbo drills a longer round than this. If the machine
stays low-profile, the honest short end is **R25 hex, 2 175–2 800 mm**, giving ~2.0–2.6 m
of hole — and the doc should say which rod it is using.

### 9.5 The rod string is drawn round. Drifting rods are hexagonal.

Tool mapping at ~7249 sets `stringDia: 0.038` and `rod-2` is built as `G.cyl(...)`. The
tooling catalogue is explicit: the drifting rod is a **HEX drifting rod** (p.22 diagram).
Six flats read very differently from a cylinder under a boom light. Round extension rods
exist, but they are the *other* product.

### 9.6 The feed is rigidly attached to the boom head. It should slide in a cradle.

`buildFeedRail` is added straight to `stack.beam` / `feed2`. The elevation shows a broad
**cradle plate under the feed** and a **feed-extension cylinder** that pushes the whole
feed forward against the face. This is a visible cylinder, a visible sliding joint, and a
motion the player would see every time the machine collars a hole without moving.

### 9.7 The boom has no parallel-holding link.

`buildJumboBoom` builds slew → lift → telescope → roll-tilt head. The real boom carries a
**second slim tube parallel to and below the main arm**, base bracket to head bracket. It
is the detail that separates a jumbo boom from an excavator stick (§4.1). It is also cheap:
one more capsule per boom.

### 9.8 Lighting count.

`addWorkLight` × 2, `wattHint: 70`. Sourced: **working lights 4 × 150 W, 24 V DC**;
**tramming lights 8 × 22 W LED**; **illuminated stairs LED**; **joystick-controlled
spotlights 70 W** (the 70 W figure the game uses is the *cab spotlight*, not the work
light). The model currently has **no tramming lights at all** — and a machine that reverses
out of a heading after every round needs them, at both ends.

### 9.9 Things on the real machine that are entirely absent from the model

- **Side platforms on both sides of the operator station** — and the *reason* for them:
  the operator swings a feed all the way back past the cab to load a rock bolt without
  walking under unsupported roof. The game lists `rockbolt` in
  `methods: ['tunnel-jumbo', 'rockbolt']` but does not model the swing-back pose or the
  platforms that make it safe. This is the machine's headline safety feature.
- **Illuminated access stairs.**
- **Fire suppression** (ANSUL or FORREX) — bottle rack plus small-bore distribution tubing
  over the power pack. Standard on every underground diesel machine.
- **Screw compressor, water booster pump, stainless electrical cabinet**, exhaust silencer
  and stack, radiator/motor block at the articulation.
- **The rear hood's down-sloping tail.** The builder gives the rear frame a flat deck; the
  real one tapers away hard toward the tail.
- **Front-frame mass.** ~70 % of the machine's weight is on the boom frame. The model's
  `frontLen: 4.00` / `rearLen: 5.10` makes the *rear* the longer frame.
- **Basket boom caveat:** a basket/service boom is real on charging jumbos
  (`research/04` §C1), but **this OEM spec sheet does not list one** for the M-series — it
  solves bolt handling with the swing-back feed and the side platforms instead. Keep the
  basket boom if the game wants it, but know that it is a variant feature, not standard,
  and that on a 16.8 t low-profile carrier a basket boom *plus* two drilling booms is a lot
  of machine.

### 9.10 Figures in the spec block that are unsourced or contradicted

| Spec block field | Status |
|---|---|
| `flushing: 'Water 33 l/min at 15 bar'` | **Unsourced per-drill flow.** The OEM gives rig-level booster pumps: 15 bar / 200 l/min, 30 bar / 400 l/min, or electric 15 bar / 300 l/min, min inlet 2 bar. The 15 bar is right; the 33 l/min is not in any source read. |
| `powerSupply: '… 380-575 V'` | OEM range is **380–1 000 V, 50/60 Hz** (and 690–1 000 V for the big motor option). |
| `axleOscillationDeg: 15` | Not a quantity this OEM publishes. It gives **"clearance outside axles 13° rear, 22° front"**. |
| `noiseDbA: 98`, `noiseStandard: 'EN 16228'` | The OEM cites **ISO 11201** and **ISO 3744**, not EN 16228, and gives sound *power* **128 dB(A) re 1 pW** (131 with COP 3038) and operator sound *pressure* figures of **104 ± 6** and **75 ± 3 dB(A) re 20 µPa** (cabin is specified **<80 dB(A)**). The extracted table's rows and values are column-misaligned in the PDF, so **which figure belongs to canopy vs cabin vs bystander is not certain from this source** — do not quote a single number as fact. |
| `percussionKw: 14`, `percussionBar: 140`, `blowHz: 110`, `rotationRpm: 530`, `rotationNm: 340`, `feedKn: 31` | **None of these appear in any source read.** The rig spec sheet names rock-drill *models* but publishes no percussion power, impact pressure, blow frequency, rotation torque or feed force. Plausible for a small drifter; unverified. |
| `canopy: 'FOPS/ROPS to ISO 3449'` | The OEM says "ROPS and FOPS certified cabin" but **names no standard number**. ISO 3449 is the FOPS standard, so this is likely right — but it is not in the source. |
| `holeMm: '38-51'` | Consistent with the OEM's **min 38 mm** on T38, but the OEM's range runs up to **64 mm** with the big drill. Also note the disagreement in §4.11 about whether T38 is a drifting thread at all. |
| Bit `{ thread: 'T38', diameterMm: 48 }` | Defensible from the rig OEM. **Contradicted** by `Top_Hammer_Tools.pdf`, which puts T38 in bench/longhole with a recommended gauge of Ø64–102 and puts Ø33–64 drifting on R25/R28/R32/R35. Both recorded. |

### 9.11 The naming rule, again, because it applies to the model and not just the text

`spec.name` is already an invented house designation, which is correct
(DOMAIN.md §10, and `research/04` §C1: "must be original … never a real designation").
The risk in *this* reference is the drawings: the elevations carry an **"Epiroc" wordmark
on the engine-hood panel and on the boom extension tube**, and a **"BOOMER" nameplate on
the cab pillar**. Those are exactly the panels a modeller traces. **Model the panel, drop
the lettering, and put the game's own livery on it.** Paint colour is NOT SOURCED anywhere
in the material read — which is convenient, because the game must choose its own anyway.
