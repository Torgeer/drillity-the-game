# `cpt-unit` — CPT push unit (ballasted truck or crawler)

**Engineering reference for the modeller. GEOMETRY AND MATERIALS ONLY.**
status: in progress

> **NAMING RULE (DOMAIN.md §10):** every manufacturer name and model designation in
> this document — A.P. van den Berg, Pagani, Geomil, Comacchio, Hyson, Envi, Geotech AB,
> and every model number — is here **as a dimensional and visual source only**. The game
> must not use any of them as a product name, a badge, a decal, or a shop item. Model the
> shapes; invent the badge. The in-game name is `Rynnval CP-20 Ballastline`.

---

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Geoteknik-broschyr.pdf` (Geomek / Ingenjörsfirman Geotech AB, Swedish) | 4, 5, 6, 7, 8, 11, 13 (text of all 20) | **The single best source in the folder.** Four tracked Nordic sounding rigs photographed from three-quarter front (p5), a full side view (p4), the Geotech 608 control station in close-up (p6), field photos with the trailer power pack and the radar guard cage (p6), the **CPT cone itself rendered in detail** (p8), and the **push-rod part numbers with real diameters** (p11). This is the machine the owner's own market actually uses for CPT. | **YES — primary** |
| `C:\Users\henri\Downloads\5.Kravspecifikation geoteknik-1.pdf` | 1–6 (full) | Eskilstuna kommun procurement of geotechnical *consultants* (UE 25.127, 2025-11-06). Roles, CV requirements, reference projects, vehicle emissions clause §5.5. **Zero machine content** — no method list, no dimensions, no CPT mention. | **NO — useless for geometry.** Named in the brief; report it as a dead end. |
| `C:\Users\henri\Downloads\Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` | 1–18 (indexed), 2, 8, 16, 17 rendered | A **geotechnical core/rotary crawler**, not a CPT unit — mast, rotary head, wireline coring to PQ. Useful only as a *scale and undercarriage* comparator for the small geotech crawler class ("variable width undercarriage available with steel tracks and rubber shoes", "up to 5 tonnes feed and retract force" ≈ 50 kN). | **PARTIAL — comparator only** |
| `research\06-geotech-water-geothermal.md` | §A.2 (l.286–460), §A.2.8, §E.3 (l.1798–1830), §G.3 | Already carries the full ASTM D5778 geometry set, the rate, the measured channels, the reaction table, and the two-machine split. **Nothing in §A.2 needs correcting.** | **YES** |
| `research\11-oem-anchor-geotech-hdd.md` | §A.14 (l.759–812), §B.5 (l.1118–1127), §D.5 (l.1407–1432) | The OEM layer: A.P. van den Berg truck/crawler, the HYSON inverted-cylinder detail, Pagani TG naming decode and masses. | **YES** |
| `src\rig\rigFactory.js` | l.6486–6740 (`buildCPTUnit`) | The current builder. Compared against everything above in §9. | reference |

## 2. What the machine IS

A **CPT (cone penetration test) push unit** is not a drill rig and a driller will tell you
so in the first sentence. Nothing rotates, nothing is cut, nothing is flushed and no sample
comes up. A 60° cone on a string of 44.5 mm rods is **jacked** into the soil at a constant
**20 ± 5 mm/s**, and the machine logs tip resistance `qc`, sleeve friction `fs` and shoulder
pore pressure `u2` continuously as it goes (pack 06 §A.2.1–A.2.4, citing ASTM D5778).
The entire engineering problem of the machine is therefore **not power — it is reaction**:
D5778 §12.1.1 requires the thrust machine to be *anchored or ballasted, or both*, so that
it does not move relative to the ground while pushing. A full-capacity sounding needs
**100–200 kN** (D5778 Note 6), and the fleet numbers track mass almost 1:1 — 20 t of
machine buys ~200 kN of push (pack 06 §A.2.8 `[INSITU]`; pack 11 §A.14 A.P. van den Berg).

So this machine class is **mostly dead weight with a small, precise ram in the middle of
it**. It stands on a prepared or semi-prepared geotechnical investigation point — a road
verge, a field, a car park, a future foundation footprint — puts its levelling jacks down
until the wheels or tracks are unloaded, and pushes. It is the quietest, cleanest and
least dramatic machine in the fleet: no dust, no mud, no cuttings pile, no noise beyond
the hydraulic pack. Everything that happens visibly happens on a screen inside.

There are **two distinct machines wearing the same job**, and they must not look alike
(pack 06 §E.3, pack 11 §D.5):
- **(a) the ballasted vehicle** — a 20–22 t 6×6 truck or a 20 t low-bearing-pressure
  crawler that reacts against its own mass; and
- **(b) the anchored mini-track** — 1.5–3.5 t on rubber tracks, which cannot possibly
  carry the reaction and instead **screws four helical anchors into the ground** and pulls
  against them.

The game's `cpt-unit` is variant (a) on tracks, and its spec line already names variant
(b) as the alternative — that is correct and well-founded.

## 3. Proportions

### 3.1 The tooling — fully sourced, exact, and the one thing you must not fudge

| Item | Value | Source |
|---|---|---|
| Cone projected area (standard) | **10 cm²** | pack 06 §A.2.2 `[D5778]` |
| Cone diameter | **35.7 mm** (36.1 mm max when worn) | pack 06 §A.2.2 `[D5778]` |
| Cone apex angle | **60°** | pack 06 §A.2.2 `[D5778]` |
| Large cone | **15 cm² / 43.7 mm** (44.2 mm max) | pack 06 §A.2.2 `[D5778]`, `[WIKI-CPT]` |
| Friction sleeve area, 10 cm² cone | **150 cm² ± 2 %** → sleeve length ≈ **150 cm² / (π × 3.57 cm) ≈ 134 mm** | derived from pack 06 §A.2.2 |
| Friction sleeve area, 15 cm² cone | **225 cm² ± 2 %** (min 200 cm² if proven equivalent) | pack 06 §A.2.2 `[D5778]` |
| Gap, cone extension to adjacent element | **≤ 5 mm** | pack 06 §A.2.2 `[D5778]` |
| Push rod OD | **44.5 mm** (ASTM); Nordic supply is **Ø44 mm** "Geostång R32" | pack 06 §A.2.2 `[D5778]`; `Geoteknik-broschyr.pdf` p.11 art. 71200004 / 71200085 |
| Push rod length | **1000 mm** and **2000 mm** both stocked | `Geoteknik-broschyr.pdf` p.11 (Geostång R32 Ø44x1000, Ø44x2000) |
| Lighter sounding rods on the same rigs | **Ø22 / Ø25 / Ø32 mm**, 1000 and 2000 mm | `Geoteknik-broschyr.pdf` p.11 |
| Push rate | **20 ± 5 mm/s**, held the whole stroke | pack 06 §A.2.3 `[D5778]` §12.1.2 |
| Reading interval | **≤ 50 mm**; better at 20 or 10 mm | pack 06 §A.2.3 `[D5778]` §4.4 |
| SCPT sensor spacing in the adapter | **two vibration sensors 1 m apart** | `Geoteknik-broschyr.pdf` p.8 (SCPT-GS2) |

> The 1.00 m rod and the 44.5 mm OD in the game are **correct and sourced**. Keep them.
> The rod magazine mesh at r = 0.0223 m (= Ø44.6 mm) is right to within a fraction of a mm.

### 3.2 The machine — two schools, with their sourced numbers

**School A — ballasted mass (the game's current pick).**

| Configuration | Mass | Thrust | Reaction | Depth | Source |
|---|---|---|---|---|---|
| 6×6 wheeled truck | **20–22 t** | ~200 kN | dead weight | 30–40 m | pack 06 §A.2.8 `[INSITU]` |
| Tracked, low bearing pressure | **20 t** | 200 kN | dead weight | 30–40 m | pack 06 §A.2.8 `[INSITU]` |
| CPT Crawler (van den Berg) | **20 t** | **up to 200 kN** | own dead weight | — | pack 11 §A.14, apvandenberg.com |
| CPT Truck (van den Berg, HYSON) | 6×6 truck + reinforced subframe | **140–200 kN or more** | dead weight + auto jacking/levelling | — | pack 11 §A.14 |

**School B — anchored / light frame.**

| Configuration | Mass | Thrust | Reaction | Depth | Source |
|---|---|---|---|---|---|
| Mini tracked | **3.5 t** | 20 t (~200 kN) | **4 hydraulically driven screw anchors** | 10–30 m | pack 06 §A.2.8 `[INSITU]` |
| Restricted-access rubber-tracked | **1.5 t** | 16 t (~160 kN) | anchors | 30–40 m | pack 06 §A.2.8 `[INSITU]` |
| Excavator-mounted pusher | 2.5 t + host | 20 t | the host excavator | 20–30 m | pack 06 §A.2.8 `[INSITU]` |
| Hand-portable pusher | **30–35 kg** | 10 t | anchors / a structure overhead | 10–20 m | pack 06 §A.2.8 `[INSITU]` |
| Pagani TG 63-100 | **910 kg** | 100 kN push / 12 t extract | anchored (`UNVERIFIED` in pack 11) | — | pack 11 §A.14 |
| Pagani TG 73-200 | **2 700 kg** | 200 kN push / 250 kN extract | — | — | pack 11 §A.14 |

**School C — the Nordic sounding rig with a CPT system bolted on. THIS IS THE CLASS THE
OWNER'S OWN DOCUMENTS SHOW, and it is a third silhouette the game does not have.**
`Geoteknik-broschyr.pdf` p.5 table, verbatim:

| | Geotech 220 | Geotech 404 | Geotech 505 | Geotech EDM | Geotech 608 (p.6) |
|---|---|---|---|---|---|
| Vikt (mass) | **2 500 kg** | 2 500 kg | 3 800–4 200 kg | 1 740 kg | **~6 200 kg** |
| Effekt (power) | **19 kW** | 40.3 kW | 56 kW | — | **CAT 100 kW**, Stage V, HVO100 |
| Emissions | Steg-5 | Steg-5 | Steg-5 | — | steg 5 |
| Matningskraft (feed/push) | **200 kN** | 37 kN | 50 kN | 80 kN | **80 kN** |
| Dragkraft (pull/extract) | **200 kN** | 75 kN | 75 kN | 114 kN | **110 kN** |
| Torque | — | — | — | — | **2 600 Nm** |
| Mast side tilt | — | — | — | — | **±10°** |
| Rod clamp | — | — | — | — | **150 mm opening, clamp force adjustable 0–170 kN, floating clamp** |

> **Note the flat contradiction with the ballast rule, and record both.** Pack 06 §A.2.8 and
> pack 11 §A.14 both say ≈20 t of mass buys ≈200 kN. The Geomek/Geotech table says a
> **2 500 kg** machine delivers **200 kN** of feed *and* 200 kN of pull. Both are true and
> they are not in conflict once you see the mechanism: the 20 t machine sits on its mass,
> the 2.5 t machine is **tied to the ground**. The brochure page does not state the anchoring
> method for the 220, so *how* it is held down is **NOT SOURCED** from this file — but the
> 200 kN / 2 500 kg pairing proves it cannot be mass. See §8.

### 3.3 Ratios for the modeller (what actually matters)

From the p.4 side elevation and the p.5 three-quarter views of the Geotech class, measured
off the photographs as *ratios*, not absolutes (photogrammetry from a marketing photo — treat
as guidance, flagged, not as a dimension):

- **The machine is longer than it is tall, and much longer than it is wide.** Body length
  ≈ 2.2–2.5 × body height (excluding mast); track length ≈ the full body length.
- **The mast is the tall thing and it is roughly 1.3–1.7 × the height of everything else
  put together.** On the Geotech 220 the mast head sits at roughly 2.2–2.5 × the height of
  the track top. In the game the push frame is 2.05 m over a deck at ~0.68 m — that ratio
  is in the right family for the *ballasted* school (where the frame is short) but far too
  short for the Nordic school.
- **The mast is NOT centred on the machine.** On every Geotech in the brochure it overhangs
  the **front or front corner**, outboard of the track footprint, so the rod goes into virgin
  ground the tracks have not driven over. See §5.
- **Track gauge:** `NOT SOURCED` as a figure for any machine in this class. What the p.4/p.5
  photos do show is that the two tracks are set wide relative to the body — the body sits
  *between* the tracks, not on top of them, and the track pads are visibly proud of the body
  sides. Do not invent a number; model the relationship.
- **Ground clearance is low and deliberate.** "Låg tyngdpunkt ger goda terrängegenskaper"
  (low centre of gravity gives good terrain performance) — `Geoteknik-broschyr.pdf` p.6.

Game-relevant: the current builder uses track length 3.30 m, shoe width 0.62 m, roller
radius 0.30 m, track centres ±0.82 m — i.e. gauge 1.64 m, overall width ≈ 2.26 m over
the shoes, and a deck 3.30 m long. For a **20 t** machine that is plausible but on the
narrow side; a 20 t low-bearing-pressure CPT crawler is the widest-shoe machine in the
fleet by definition, since bearing pressure is the whole point. `NOT SOURCED` — no
dimensioned drawing of a 20 t CPT crawler was found in the folder.

## 4. Component inventory

Ordered by how much each contributes to the machine reading as *this* machine.

### 4.1 The push frame — NOT a mast, and the one detail everybody gets wrong

There is no mast in the drilling sense: no crown sheave, no rotary head, no rod carousel
at the top, no drifter. There is a short **push frame / penetrometer** and a carriage that
travels down it. Pack 06 §E.3(a) puts it plainly: *"a hydraulic ram assembly in a hatch
through the middle of the deck… no mast, no rotation."*

**THE HYSON DETAIL — sourced, unusual, and worth the geometry budget.** Pack 11 §A.14 and
§D.5: the A.P. van den Berg HYSON 200 kN penetrometer is an **"H"-form twin-cylinder set in
which the piston rods are FIXED to the truck frame and the CYLINDERS MOVE.** This is the
inverse of every other hydraulic ram in the game.

Why it matters visually, and it matters a lot:
- The **chrome piston rods are full-length and permanently exposed**, standing as two fixed
  polished columns from the deck to the crosshead. They are structure, not stroke.
- What travels is a pair of **fat, dark, machined cylinder bodies** sliding down those
  columns, dragging the crosshead and the rod clamp with them.
- Consequence for animation: the length of visible chrome **never changes**. Nothing
  telescopes. The moving mass slides. That reads completely differently from a feed ram
  and it is the class's signature at close range.
- Consequence for materials: those two chrome columns are exposed to weather and to the
  clay coming up on the rods all day. They wipe clean where the cylinder seals run and get
  dull, waxy and finger-marked above and below the travel band.

**Where the rods sit at working extension.** The carriage stroke has to cover **one rod
length plus the clamp height** — the machine pushes 1.00 m, sets the lower clamp, retracts,
takes a new rod, and pushes again (pack 06 §E.3, "Both variants push 1 m rods and pause at
each rod break"). So design the frame around a **usable stroke of ~1.0–1.2 m** with the
crosshead starting just under the top and finishing just above the lower clamp. If you
build a stroke that a 1 m rod does not fit into, the animation cannot be honest. At full
extension the cylinder bodies sit at the BOTTOM of the fixed rods; at reset they sit at the
top. There is never a gap in the load path.

**A second, real, contradicting arrangement (record both).** The Nordic school
(`Geoteknik-broschyr.pdf` pp.4–7) uses a **chain-fed drill mast** — *"kedjematad
borrställning"* — a tall slim twin-column tower with a black roller chain and a cable/hose
energy chain running its full height, and the head riding the chain. That is a conventional
mast, and those machines do CPT with a CPT system fitted (p.8). So there is no single
"correct" CPT push mechanism; there are at least two. If the game wants one machine, HYSON
is the more distinctive choice. If it ever wants a second CPT silhouette, the chain-fed
Nordic sounding rig is a genuinely different-looking machine doing the same job.

### 4.2 Reaction hardware — the actual subject of the machine

- **Levelling jacks.** Four, at the corners, and they do something specific: they **lower
  until the machine is lifted off its own suspension**, so the dead weight and not the
  springs carries the reaction (pack 06 §E.3(a), `[D5778]` §12.1.1). Van den Berg advertises
  *automatic truck jacking and levelling* (pack 11 §A.14). Visually: the tracks or wheels
  must visibly **unload** — the track sag changes, the machine sits a few centimetres
  higher, and the pads press dirt out sideways. That transition is free drama and the game
  should show it.
- **Jack feet** are large flat pads, usually with a ball or pin joint so they follow ground
  slope, and they get a hardwood or steel spreader plate under them on soft ground.
- **Ballast.** `[INSITU]` and van den Berg give **20 t** with **200 kN** of counterforce.
  *How* that 20 t is packaged — integral heavy chassis vs. a visible stack of removable
  plates — is **NOT SOURCED** in this folder. The game currently shows removable plates with
  burned lifting slots, which is how crane and piling counterweights actually look and is a
  defensible read, but no source here confirms it for a CPT crawler. See §8.
- **The alternative: four hydraulically driven screw anchors** on the light machine
  (pack 06 §A.2.8, §E.3(b), `[INSITU]`). A **3.5 t** machine pushing **20 t**. Helical
  flights wound into the ground at the corners, and the frame then pulls up against them.
  Pack 06 calls this out as an animation nobody else in the game has. The Pagani anchoring
  method specifically is flagged `UNVERIFIED` in pack 11 §A.14 — do not put a specific
  anchor design in a player-facing description.

### 4.3 Rods, rod handling, and the ground-level hardware

- **Rods:** Ø44.5 mm (ASTM) / Ø44 mm "Geostång R32" (Nordic), **1 m** and **2 m** both real.
  Threaded, and on the Nordic supply the thread is an R32 rock-rod thread with a dedicated
  `Kronadapter R32` (`Geoteknik-broschyr.pdf` p.11). Rods are plain steel and **go into the
  ground clean and come out coated in whatever they went through** — grey-brown clay
  smeared full length in Swedish marine clay, sand rings in coarser ground.
- **The rubber rod wiper.** `Geoteknik-broschyr.pdf` p.11 stocks *"Avskrapargummi 42-44"*
  (art. 21190009) — a rubber scraper sized for 42–44 mm rods, alongside 22-25 and 32 sizes.
  This is a small black rubber disc/collar at the hole collar that strips the mud off the
  rod as it is pulled. **It is not in the game and it should be** — it explains why the rods
  in the magazine are cleaner than the rod in the hole, and it is a 3-triangle part.
- **The rod clamps.** Two: an **upper clamp** on the moving crosshead that grips to push,
  and a **lower/hold clamp** that grips the string while the crosshead resets. The game has
  both and that is correct. `Geoteknik-broschyr.pdf` p.7 photographs the Nordic equivalent
  (*stånglås*) as **two black powder-coated rectangular clamp bodies sitting directly on the
  soil at the collar**, straddling the rod, each with a bright **orange operating lever**,
  yellow warning triangle decals, and a bolted foot frame; the 608's version has a **150 mm
  opening** and **clamp force adjustable 0–170 kN**, and is a *floating* clamp so joints
  make up squarely.
- **Rod magazine.** 1 m rods in a rack. `Geoteknik-broschyr.pdf` shows Nordic rigs carrying
  rods in open side racks and vertical tubes; the game's flat rack of 18 rods with a swing
  loader arm is a reasonable, unsourced-in-detail interpretation. The *count* matters: to
  reach the sourced **30–40 m** depth (pack 06 §A.2.8) the machine must carry **30–40 rods**,
  not 18. Either deepen the rack or accept that it visibly reloads.
- **Threaded-joint grease.** `Geomek Gängfett BioPlus 4,5 kg` (p.11) — a bio grease in a
  4.5 kg tub. A greasy tub and a brush at the collar is a correct site prop.

### 4.4 The cone (the tool) — `Geoteknik-broschyr.pdf` p.8 shows it rendered

Reading the p.8 illustration of the "CPT SOND NOVA" with its conductivity adapter, front to
back along the axis:
1. **60° conical tip**, polished steel, with a fine dark seating line at its base.
2. A narrow **gap ≤ 5 mm** and then the **porous filter element** at the shoulder — this is
   the `u2` position, the standard one (pack 06 §A.2.4). Consumables list confirms it:
   *"CPT Spaltfilter NOVA"* — a **slot filter**, not a sintered ring — and *"CPT Olja 2dl"*,
   a 200 ml bottle of saturation oil (p.13). The filter is saturated in de-aired oil before
   the test; that is a genuine pre-test ritual and a nice beat.
3. The **friction sleeve** — a polished cylindrical band, very slightly proud of the body,
   **≈134 mm long** on a 10 cm² cone (derived from the 150 cm² sleeve area).
4. Behind that, alternating **matte dark-grey / anodised bands and polished stainless
   sections** — the illustration reads as a slim striped baton, which is exactly right: a
   CPT cone is a sequence of screwed-together instrument modules, each a different finish.
5. **Adapters** screwed inline: the **electrical conductivity adapter** (measures pore-water
   salinity to find leached, potentially **quick clay** zones — a Swedish obsession and a
   good hazard mechanic), and the **SCPT-GS2 seismic adapter** with **two vibration sensors
   1 m apart**.
6. A **male threaded coupling** at the tail, into the first push rod.

Overall the cone assembly with adapters is **long** — a slim instrument stick well over a
metre, not a stubby bit. It lives in a padded case, and the game is right to show it in one.

### 4.5 Operator station

- Pack 06 §E.3(a) says on the ballasted truck the operator **sits inside, in a cabin over
  the push point, at a screen**. Not a canopy — a cabin.
- The Nordic school does the opposite and it is beautifully specific
  (`Geoteknik-broschyr.pdf` pp.6–7): a **stand-up outdoor console** on an adjustable
  pedestal beside the mast, height- and side-adjustable, consisting of a **large hinged
  weather lid** that props open like a laptop over a **big touchscreen** showing the live
  sounding trace, a **rotary multi-knob**, a **joystick**, and a bank of hard keys. Beside
  it a **separate lockable cabinet for a laptop**. Everything is in a brushed
  aluminium/stainless bezel.
- **Radio remote control.** Both schools have it: Comacchio p.17 lists *"radio remote
  control tracking and drilling"*; Geotech 608 has a two-handed belly-box remote with a
  colour screen, twin joysticks, **dead-man grip** and dual batteries, on a neck strap
  (`Geoteknik-broschyr.pdf` p.7). If the game shows an operator standing away from the
  machine, that box is what is in their hands.
- **The screen is the whole show.** Pack 06 §E.3(a): *"The drama is entirely on the screen
  inside. Lean into that — it is genuinely what the job looks like."* The game already
  builds a `cpt-log` screen panel; make it the brightest thing in the frame.

### 4.6 Undercarriage

- **Rubber tracks over visible bogie road wheels.** Every Geotech in the brochure
  (pp.4, 5, 6, 7) is a rubber-tracked carrier where you can clearly see **5–6 small
  rubber-tyred road wheels with bright red hub centres** running inside the track loop,
  plus a toothed drive sprocket at one end and a plain idler at the other. The red wheel
  centres against the black track are a strong, cheap, high-value detail.
- **Shoe width:** Comacchio's small geotech crawler drawing (p.16/17) dimensions
  **300 mm shoes** on a **1400 mm** gauge, extensible to **1700 mm** ("variable width
  undercarriage available with steel tracks and rubber shoes", p.16). A 20 t
  *low-bearing-pressure* CPT crawler is by definition much wider than that — the game's
  620 mm is a plausible scale-up but is **NOT SOURCED**.
- **Extending/retracting track frames** are normal in this class (Comacchio p.16) — narrow
  to get through a gate, wide to work. Worth a mechanic.
- Ground clearance is **low on purpose**: *"Låg tyngdpunkt ger goda terrängegenskaper"*
  (`Geoteknik-broschyr.pdf` p.6).

### 4.7 Hoses, guarding, and the rest

- **Hose routing.** `C:\Users\henri\Downloads\Bauer-Maschinen-Hydraulikschläuche-hydraulic
  hoses-DE-EN-905-213-1+2.pdf` is an image-set catalogue with almost no extractable text; the
  one hard fact it yields is that the **Bauer part number is stamped on the crimped ferrule**
  (*"Bauer-Teilenummer auf Einpressung"*). No DN table or bend-radius data came out of it —
  see §8. What the Geotech photographs do show is the real pattern: hoses run in **tight
  parallel bundles clipped along the frame**, black with a matte spiral-wrap over the runs
  that rub, **bright silver crimped ferrules** at every end, and on the mast they are carried
  in a **black plastic energy chain** rather than left to swing.
- **Hose ARCHITECTURE, from the Bauer catalogue p.2 (this part is genuinely useful).** Hoses
  are not modelled as loose individual snakes; they are sold and routed as **named packages
  running between bulkhead plates** (*Schottplatte*):
  - **Main hose package** — from the hose deflection point to the bulkhead: **six main lines**
    plus high-pressure lines depending on equipment.
  - **Mast hose package** — from the base-carrier bulkhead to the mast bulkhead: all hydraulic
    hoses **plus the electric cable bundled inside the same package**.
  - The bundle is delivered and carried in a **flat tarpaulin wrap** (*Flachplane* / "hose bag").
  So the correct visual is: a **flat, strapped, tarp-wrapped ribbon of ~6–10 hoses** leaving a
  bolted **bulkhead plate** on the body, crossing the articulation as a loose catenary, and
  terminating at a second bulkhead plate on the frame — with the signal/electric cable
  **inside the bundle**, not running separately. The game currently routes three independent
  round tubes plus a separate signal cable; the bundle-and-bulkhead reading is better sourced.
  The Bauer p.2 photograph of a BG 28 H on a low-loader shows exactly this: thick black
  bundles fanning symmetrically from the mast foot.
- **A hose reel** (large, red or orange, on the rear deck) appears on the Geotech 608 field
  photo (p.6) — used for the external power-pack line.
- **The plug-in electric power pack.** The 608 is a **plug-in hybrid**: it connects to an
  **external electric hydraulic power pack** so soundings run with the diesel shut down
  (p.6). The photo shows it as a **green box trailer on a twin-axle chassis** parked beside
  the rig with a fat hose across the ground. This is a real, current, modern-site prop and a
  great "quiet site" upgrade mechanic.
- **Guarding.** The 608 replaces the physical rotation guard with a **"virtuell skyddsbur"** —
  a **virtual protective cage** made by radar sensors, compliant with Machinery Directive
  2006/42/EC, which **automatically stops rotation and feed if the barrier is broken**, and
  works in clay, snow, rain and dense vegetation (p.6). The brochure visualises it as a
  **glowing yellow-green cylindrical cage** around the rod at ground level (p.6 image).
  That is a game-native visual that happens to be literally true.
- **Handrails, ladders, walkway:** the Geotech 404 (p.5) carries a **checker-plate deck box**
  and the 608 has a step-up platform at the console. No handrail geometry is dimensioned
  anywhere in this folder — `NOT SOURCED`. But a 20 t machine with a deck at ~0.7 m and a
  ballast stack above it needs at minimum a step, a grab handle at the console, and edge
  protection; build them, and label them as designer's judgement, not sourced.
- **Counterweight:** none as a separate item. On this class the counterweight *is* the
  machine.
- **Winches:** none. There is nothing to hoist. Do not add one.
- **Lights:** work lights on the mast head and at the collar; the 608 photo (p.4) shows
  bright forward-facing work lamps on the body front.

## 5. Distinctive features — the thumbnail silhouette

## 6. Materials and paint

## 7. Photo references

## 8. NOT SOURCED

## 9. Domain-truth warnings — what the game currently gets wrong
