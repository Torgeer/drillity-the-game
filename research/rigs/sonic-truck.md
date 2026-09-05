# Rig reference — `sonic-truck` (truck-mounted sonic / resonant drilling rig)

status: COMPLETE - nine sections from the local library, plus §10 and §11
added 2026-09-05 when the machine was actually modelled. **§8 item 1, the big
hole in this document - "a truck-mounted sonic rig, anywhere in the local
material" - is now CLOSED by published web sources.** Read §10 before §3:
§3 is a compact CRAWLER and the game's machine is a TRUCK.

> **Naming rule (DOMAIN.md §10):** this document cites real manufacturers and
> model designations so the geometry can be verified against a real object. The
> GAME must NOT use any of these names, badges or model numbers as a product
> name or a decal. Model the shapes; invent the badge.

## 1. Sources read

| File | Pages | What it actually showed |
|---|---|---|
| `Bauer-Maschinen-Hydraulikschlaeuche-hydraulic hoses-DE-EN-905-213-1+2.pdf` | 2 pp (both) | **Not a sonic document** - it is a Bauer BG piling-rig hose-package flyer. Useful anyway for *hose architecture nomenclature and how a bundle is actually routed*: "hose deflection" to "bulkhead plate", main hose package = **six main lines** plus high-pressure lines, a separate **mast hose package** from base-carrier bulkhead to head bulkhead, **electric cable bundled inside the same package**, and a **flat tarp / hose bag** wrapping the bundle. The photo shows the bundle running the length of the mast as one wrapped black mass, not as loose individual lines. |
| `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` | 18 pp; p15, p16, p17 read closely, p2/3/5/8/11/14 are photos | Sales deck for the exact carrier the sonic head in the brochure photo is bolted to. **p16 and p17 are dimensioned general-arrangement drawings** (working and transport position) with a red sonic-style head drawn on the mast - the only hard dimensions in the whole source set. p15 is a depth-vs-method table. p1-p14 are photographs with no text. |
| `Structural_drilling_using_the_high-frequency_sonic-in-Slovenia.pdf` | 10 pp; text of pp. 1-10, figure page p7 rendered | Sporin & Vukelic, RMZ M&G Vol. 64 (2017), DOI 10.1515/rmzmag-2017-0001. Peer-reviewed. **Physics and process, almost no geometry.** Resonance f = c / 2l, the three-phase core-barrel / override-casing / extraction cycle, "frequencies of up to 150 Hz", bit shape has no decisive influence, over-feed forms a "knot" and can fracture rods, one sonic rig in the whole of Slovenia in 2016. Its only picture of a machine (Fig. 5, p7) is a low-resolution reproduction that adds nothing the brochure does not show better. |
| `drillity-the-game/research/02-prospecting.md` A3/E5, `06-geotech-water-geothermal.md` A.6, `11-oem-anchor-geotech-hdd.md` A.13/B.4, `16-site-archetypes.md` A.16 | grepped and read | **The method is already fully covered by the existing packs** - physics, liquefaction, the two-tier frequency split, the head spec tables with the brochure's unit error already caught, ASTM D6914, the brownfield archetype, and the rule that "sonic is bought as a head on someone else's crawler". They contain **no rig geometry**, which is exactly the gap this file fills. `18-visual-reference.md` has no sonic entry at all. |
| `Drilltechniques-Sonic-Brochure.pdf` | p1-p8 (p1,2,3,7,8 rendered and looked at) | Vendor guide for Toa Tone Boring (JP) and Sonic Drill Corp (CA) heads. **p2 is the single most useful geometry image in the folder**: a labelled render of the sonic head + drill string. **p3 and p7 are the only real photographs of complete sonic rigs in the whole folder** - and BOTH are tracked, not trucks (see 9.1). p4-p6, p8 are head spec tables. p1 is a cover, useless. |

## 2. What the machine IS

A sonic rig is **not a machine type - it is a head bought from a specialist and
bolted onto somebody else's carrier.** That single fact governs the whole model.
Both photographs of complete sonic rigs in the owner's material are captioned
that way: a Toa Tone EP26 head on a Comacchio GEO 305 crawler, and a Sonic Drill
Corporation 50K head on a Comacchio 900P crawler
(`Drilltechniques-Sonic-Brochure.pdf` p3, p7). The carrier is an ordinary compact
geotechnical crawler - the same machine that would otherwise be doing wireline
coring or DTH - so the deck, tracks, engine bonnet and mast are generic
site-investigation hardware, and the *only* part that says "sonic" is the head
and the string it drives.

What it does: the head contains two counter-rotating eccentric masses that shake
the whole drill string axially at up to 150 Hz. The operator tunes the frequency
until the string is at resonance; the wave liquefies a thin annulus of soil so
the bit displaces material instead of cutting it. It drills a **cased** hole
(override casing follows the core barrel down), recovers a **continuous core in a
plastic sleeve**, produces almost no cuttings, and in many soils needs **no flush
at all** (`Drilltechniques-Sonic-Brochure.pdf` p2;
`Structural_drilling_using_the_high-frequency_sonic-in-Slovenia.pdf` pp. 3-6;
ASTM D6914 via `research/16-site-archetypes.md` §A.16).

Where it stands: shallow-to-medium environmental and geotechnical holes - a
brownfield plot, a road or dam investigation, a monitoring-well installation.
Small footprint, narrow gate access, rigged up over one hole with jack feet on
timber pads, one driller and one offsider. It is a **rare and expensive** machine:
`Structural_drilling_using_the_high-frequency_sonic-in-Slovenia.pdf` p9 records
that in 2016 there was exactly **one** sonic rig in the whole of Slovenia.

## 3. Proportions

**All hard numbers below come from the dimensioned GA drawings on
`Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p16 (working position) and p17
(transport position).** This is the small/compact end of the sonic class - the
carrier that the brochure photo's sonic head is actually bolted to. Treat the
*ratios* as canonical for the class and scale up for a bigger machine.

| Dimension | Value | Source |
|---|---|---|
| Overall height, mast vertical, working | **6,200 mm** | p16 |
| Feed stroke (carriage travel on the mast) | **3,600 mm** | p16 |
| Height to top of deck body / bonnet | **1,700 mm** | p16 |
| Overall height, transport (mast folded) | **2,340 mm** [7' 8"] | p17 |
| Undercarriage length | **3,840 mm** (p16) / **3,870 mm** [12' 8"] (p17) - *the two drawings disagree by 30 mm; both recorded, do not silently pick one* | p16, p17 |
| Sub-dimension on track frame | **1,500 mm** [4' 11"] | p16, p17 |
| Track shoe width | **300 mm** [11 13/16"] | p16, p17 |
| Undercarriage width, variable | **1,400 - 1,700 mm** [1,400 = 4' 7"] | p16 (variable), p17 (retracted 1,400) |
| Overall length, mast down | parametric: **Y + 510 mm** and **Y1 + 830 mm** (Y = mast length, which varies with the mast option) | p17 |
| Mast extension option | handles **6 m above the clamps** | p16 bullet text |
| Feed / retract force | up to **5 tonnes** (~49 kN) | p16 bullet text |

### Ratios worth more than the absolutes

Computed from the p16/p17 numbers:

- **Working height / undercarriage length = 6,200 / 3,840 = 1.61.** The machine is
  only about 1.6 mast-heights long. A sonic rig is *tall relative to its
  footprint* - much more so than a truck.
- **Working height / track width (retracted) = 6,200 / 1,400 = 4.4.** Very narrow
  for its height. This is a machine that gets through a gate.
- **Feed stroke / working height = 3,600 / 6,200 = 0.58.** The carriage runs over
  a bit more than half the mast. It does NOT run the full mast height.
- **Deck height / working height = 1,700 / 6,200 = 0.27.**
- **Track shoe width / undercarriage width = 300 / 1,400 = 0.21.** Two narrow
  shoes with a wide gap between them, not a fat dozer track.
- **Transport height / working height = 2,340 / 6,200 = 0.38** - the mast folds to
  well under half the working height.

### Depth capability, same deck p15

| Method | Size | Depth (m) |
|---|---|---|
| Diamond coring (wireline) | PQ / HQ / NQ | 100-150 / 130-180 / 180-250 |
| DTH hammer | 6" / 4-5" | 50-60 / 100-120 |
| Conventional rotary (auger, blade bit) | 8.5" / 4.25" | 60-80 / (see source) |

Source: `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p15. **Note the sonic method is
not listed on that table** - the sonic head is an aftermarket bolt-on to this
carrier, which is itself the single most important fact about the machine.

## 4. Component inventory

### 4.1 The oscillator head — read off `Drilltechniques-Sonic-Brochure.pdf` p2 (labelled render)

This is the part that makes the machine read as *sonic* and nothing else. The
brochure draws it as a **single symmetric casting**, not a stack of boxes:

- **Top:** a short round boss / stub on the centreline (hydraulic + air-damper
  connection), roughly 0.15x the width of the housing.
- **Upper body:** a wide, low housing with **two large circular bosses side by
  side**, one each side of the centreline. Each carries one **counter-rotating
  eccentric roller** (the brochure labels them "COUNTER ROTATING ROLLERS"). The
  bosses read as bearing caps — a raised circular pad with a smaller circular hub
  in the middle. The two circles nearly touch at the centreline. The upper body is
  about **2.2x as wide as it is tall**.
- **Lower body:** the housing **tapers down like a shallow trapezoid / bell** from
  full width to a narrow neck on the centreline. The arrow labelled "HIGH
  FREQUENCY SINUSOIDAL FORCE ALONG AXIS OF DRILL PIPE" points down this taper —
  the taper is the load path.
- **Below the taper:** a round **flange/collar** slightly wider than the neck, then
  a **darker cylindrical adapter/sub** about one collar-diameter long, then the
  **drill pipe**. Pipe diameter is roughly **0.13x the width of the oscillator
  housing** in the render.
- The pipe axis passes **through the middle of the housing, between the two
  eccentrics** — the head is symmetric about the string, not offset like a rotary
  top drive.

Source: `Drilltechniques-Sonic-Brochure.pdf` p2.

Behaviour on the same page (not geometry, but it drives the animation): two
eccentric masses counter-rotate at very high speed; the string moves up and down
**up to 150 times per second**; liquefaction of a thin soil skin removes friction;
in some materials air/water injection is removed entirely.

### 4.2 Head size / power envelope (spec tables)

| Head class | Max frequency | Max vibration force | Rotation | Source |
|---|---|---|---|---|
| Small, hydraulic-motor driven | 4,000 cpm (67 Hz) at 37 L/min | 38 kN | 0-159 rpm | `Drilltechniques-Sonic-Brochure.pdf` p4 |
| Medium | 4,000 cpm (67 Hz) at 70 L/min | 65 kN | 0-36 / 0-62 rpm | p5 |
| Large | 4,000 cpm (67 Hz) at 70 L/min, 123.7 L/min flow | 78.4 kN | — | p6 |
| High-frequency oscillator | 150 Hz | 50,000 lbf (222 kN) | 160 rpm | p8 |

Air damper: 0.7 MPa, min 8 L/min air (p5, p6). **The air damper is a visible
component** — it is what isolates the resonance from the mast, so on a real
machine there is an air line and a receiver/accumulator near the head.

**Unit error in the source, flagged, do not copy:** p8 prints the oscillator
torque as "5,250 ft-lbs [7110 kn-m]". 5,250 ft·lbf is ~7.1 kN·m — the brochure
swapped kN·m for N·m. Use **7.1 / 9.5 kN·m**.

### 4.3 Complete rig, photograph 1 - `Drilltechniques-Sonic-Brochure.pdf` p3

Caption on the page: "A TONE EP26 SONIC HEAD MOUNTED ON A DRILLTECHNIQUES SOLD
AND SERVICED COMACCHIO GEO 305 TRACKED RIG OWNED BY LANDTEST". Three-quarter
view, machine rigged up on a yard, mast vertical. What is visible:

- **Mast: fabricated plate / box-section, NOT lattice.** Two parallel plate-built
  columns with a webbed centre, painted cream. The web plates carry **rectangular
  and round lightening holes** in a repeating pattern up the mast - that hole
  pattern is a big part of how the mast reads at distance. No tubular chords, no
  diagonal bracing, no bays.
- **A full-height black energy chain (drag chain / cable track)** runs up the back
  face of the mast, articulated black links, roughly as wide as one mast column.
  It is the most visually distinctive thing on the mast after the head.
- **The head is bright red against a cream machine.** It is a tall stack sitting on
  the carriage on the front face of the mast: hose manifold and gearbox box at
  the top, a cylindrical rotation unit below it, then a long red cylindrical body
  down to the string. It is substantially **taller than it is wide** as installed -
  the brochure's p2 render shows only the oscillator, not the whole head stack.
- **Hoses everywhere, in bundles, not singles.** Thick black hydraulic hoses run in
  clipped bundles up the mast; a separate **coiled/helical black hose** (like a
  stretched spring) runs from the base up to the head - that is the hose loop that
  takes up the carriage travel. Additional hose bundles loop from the manifold
  block partway up the mast.
- **Clamp / breakout table at the foot of the mast**: two beige box housings side
  by side at ground level with hydraulic jaws between them, plastered with yellow
  and black warning decals.
- **Levelling jacks with foot plates** at the front, standing on timber pads on the
  mud. A separate beige fold-out frame/platform sits to the side of the mast.
- **A wire rope with a chain and hook** hangs from the mast top on one side - the
  service/rod winch line.
- Carrier: **low tracked undercarriage** with steel-shoe tracks; cream body with
  **red panel accents**; a rock guard over the track frame; model decal on the
  side panel. **No cab, no canopy** - the machine is run from panels on the deck.

### 4.4 Complete rig, photograph 2 - `Drilltechniques-Sonic-Brochure.pdf` p7

Caption: "THE SONIC DRILL CORPORATION 50K HEAD MOUNTED ON A DRILLTECHNIQUES SOLD
AND SERVICED COMACCHIO 900P TRACKED RIG OWNED BY COFFEY PTY LTD IN OPERATION IN
NEW ZEALAND". A working machine on a hilltop, one man in orange PPE at the
string. Adds what photo 1 could not show:

- **The head here is white/cream, not red** - head colour follows the head maker,
  not the carrier. Do not treat red as canonical.
- **The head is a fat, roughly cubic housing with a smaller cylindrical section
  below it**, wider than the mast column it rides on, and it overhangs the mast on
  the operator side.
- **Free-hanging hose loops.** Two very large black hoses leave the head in
  generous unsupported loops and drop to the deck. On a working machine the hoses
  are NOT tidy - they hang, sag, and swing.
- **A crown at the mast top**: sheave head, wire rope down the front of the mast,
  and a company flag on a whip aerial above it.
- **A second, narrower black column beside the main mast** - the cable-track /
  hose guide - running the full mast height.
- **The operator stands on the ground at a detached control console**: a separate
  cream box crowded with levers and gauges, sitting on the grass on its own
  skid/pad, umbilical running back to the rig. Sonic is run *facing the string*.
- Site clutter that belongs on a sonic site: an **aluminium tube scaffold work
  platform** built around the rig base, a mesh guard panel, a fire extinguisher on
  a stand, a yellow bucket, a shovel, a wheelbarrow.
- Guarding: a **welded mesh panel** on a frame beside the clamp, and a red
  cylindrical vessel (accumulator or extinguisher) on the frame.

### 4.5 Component inventory - what has to be there, and why it reads

| Component | What it actually is | Why it matters visually | Source |
|---|---|---|---|
| **Mast structure** | **Fabricated plate / box section**, two parallel built-up columns with a webbed centre and a repeating pattern of round and rectangular lightening holes. **Not a lattice** - no tubular chords, no diagonal bracing, no bays. | This is the first thing a driller checks. A lattice mast on a sonic rig is wrong. The hole pattern is what gives the mast its texture at mid distance. | Brochure p3; Comacchio p8, p11, p16 |
| **Carriage / how it runs on the mast** | Slides on **machined gib plates bolted to the mast face**, driven by a **roller chain running in the mast channel** (visible black chain, oiled). Feed stroke **3,600 mm** on a **6,200 mm** mast = 58%. Feed/retract up to **5 t**. | The carriage must not run to the mast top - it stops well short at both ends. The chain is bare oiled steel and catches light. | Comacchio p11 (chain, gibs), p16 (stroke) |
| **The head (the drifter equivalent)** | An **oscillator** (twin counter-rotating eccentrics in a symmetric housing) plus a **rotation unit** plus a **water swivel** plus an **air damper**, stacked vertically. Head weight about **520 kg** for the mid Toa Tone SP-50 with water swivel. | Fat, taller than wide as installed, **wider than the mast**, and in a **different paint colour from the carrier**. Bristling with hose ports on every face. | Brochure p2 (oscillator geometry), p3, p7; `research/11` A.13 |
| **Air damper** | Small air receiver plus line to the head; **0.7 MPa, min 8 L/min**. It isolates the resonance from the mast. | A real, visible small pressure vessel and a thin air line running up with the hose bundle. Without it the model has no explanation for why the mast survives. | Brochure p5, p6 |
| **Cylinders, and where the rods sit at working extension** | (a) **Levelling jacks / outriggers** - one per corner, vertical, hinged foot plates, standing on **timber cribbing**; at working extension the chrome rod is out roughly **half to two-thirds of stroke**, because the machine is levelled, not jacked clear. (b) **Mast raise / tilt rams** between deck and mast foot - at working (vertical) position these are at or near **full extension**. (c) **Mast slide / crowd cylinder** where fitted. | Chrome shows only over the extended length; a jack sitting fully closed or fully open both read as wrong. | Brochure p3 (jacks on timber); Comacchio p16, p17 |
| **Hose routing** | A **wrapped bundle**, not loose lines: base-carrier bulkhead plate to deflection point to up the mast to head bulkhead plate. **Six main working lines** plus high-pressure lines plus an **electric cable in the same bundle**, often under a flat tarp / hose bag. On top of that a **full-height energy chain (drag chain)** carries the moving part of the loom to the carriage, and one **helical / coiled hose** takes up travel. At the head, two very large hoses hang in **free unsupported loops**. | Hoses are the visual signature of a sonic rig. The rule: **bundled and disciplined along the mast, loose and swinging at the head.** | Bauer hose flyer p2 (architecture); brochure p3 (coil, bundles), p7 (free loops); Comacchio p8, p11 (energy chain) |
| **Guarding** | A **welded wire-mesh cage** around the string at the mast foot, in a painted frame, with a **hinged gate**, a **door interlock switch**, and a bank of **three red mushroom E-stops on a yellow/black plate** inside it. Yellow/black hazard chevrons on the frame. | Roughly one man high, semi-transparent grey, a bright rectangle in the silhouette. Modern machines are not sold without it. | Comacchio p8, p11 |
| **Clamp / breakout table** | Two hydraulic clamp boxes at ground level either side of the string with jaws between them; the lower one holds, the upper one breaks. Plastered with yellow/black decals. | Sits *below* the deck at ground level, straddling the hole, not on the deck. | Brochure p3; Comacchio p8 |
| **Handrails and walkways** | The compact crawler has **no perimeter walkway and no handrail** - the deck is bonnet, not floor. Where a work platform exists it is **site-built aluminium tube scaffold** standing on the ground around the rig, not part of the machine. | Do not give this machine a ship-rail deck. That belongs to a big truck rig, not a compact crawler. | Brochure p7 (scaffold); Comacchio p8, p14 |
| **Ladders** | None on the compact crawler. Deck height is only **1,700 mm** to the top of the bonnet and the machine is not walked on. | A ladder is a scale cue that says "big machine" - and it would be wrong here. | Comacchio p16 |
| **Counterweight** | **None.** There is no counterweight on this class - stability comes from the jacks and the track base. | Adding a counterweight would make it read as a piling rig. | All photos |
| **Cab / canopy** | **None on either sonic photograph.** The carrier is run from a **panel on the machine at deck level** (Comacchio p14: operator standing at a stand-up console beside the mast) or from a **detached ground console on its own skid** with an umbilical (brochure p7); radio remote control is an option (Comacchio p17). | The absence of a cab is itself an identifying feature. The driller stands *facing the string*. | Brochure p3, p7; Comacchio p14, p17 |
| **Undercarriage** | Low steel-track crawler. **Track shoe 300 mm**, **variable-width undercarriage 1,400-1,700 mm**, undercarriage length **3,840-3,870 mm**. Steel tracks with optional **rubber shoes**. Sprocket at one end, idler at the other, small bottom rollers, guarded track frame. | Shoe width / track width = 0.21 - two narrow tracks with a wide gap, quite unlike a dozer. The variable width (extend to work, retract to 1,400 mm to get through a gate) is a real, animatable feature. | Comacchio p16, p17 |
| **Winch** | A **service / rod winch** with wire rope over a **crown sheave at the mast top**, hook and chain hanging down one side. Used to lift casing, barrels and the core catcher, not for feed. | The rope down the front of the mast and the hook swinging free are strong small details. | Brochure p3 (rope plus chain hook), p7 (crown, rope, flag whip) |
| **Rod handling** | A **top-of-mast articulated handling arm** on the dimensioned drawing (Comacchio p16 shows a cranked arm at the mast head), plus the winch, plus **hand stabbing by the driller** (brochure p7 shows a man in orange at the string). Rods and casing are **laid on the ground or on a timber trestle**, not always racked on the machine (Comacchio p14 top-right: rods on a wooden trestle). | A carousel is not what these photos show. The rod supply on a compact sonic rig is scruffy and mostly on the ground. | Comacchio p16, p14; brochure p7 |
| **Two sizes of tube** | A sonic rig **always carries two diameters**: the **core barrel** and the **override casing** that follows it down. The game catalogue already ships a **100 mm x 3 m sonic core barrel** and a **150 mm x 3 m sonic override casing** (`src/game/data.js` lines ~1961-1966). | Whatever holds the tubes must show **two visibly different diameters**. One diameter is the single most common way to draw a sonic rig wrong. | `Structural_drilling..._Slovenia.pdf` Phase I/II; `research/02` E5; `src/game/data.js` |
| **Beacon** | Orange rotating beacon on a stalk on the bonnet. | Small, but it is on every one of these machines. | Comacchio p14 |

## 5. Distinctive features (thumbnail silhouette)

Five things, in order of how far away they still read:

1. **A tall, narrow, plate-built mast on a very small crawler.** Working height /
   undercarriage length = 1.6, working height / track width = 4.4
   (`Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p16, p17). The silhouette is a
   flagpole on a shoebox. Nothing else in a geotech fleet is that tall for that
   footprint.
2. **A full-height black articulated energy chain running up the mast.** Visible
   in `Drilltechniques-Sonic-Brochure.pdf` p3 and p7 and in
   `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p8 and p11. Matte black against a
   cream mast, roughly one mast-column wide, present over the whole feed travel.
   This is the single most reliable non-head identifier.
3. **A fat, brightly coloured head that is wider than the mast it rides on**, sat
   at the top of the feed stroke, wrapped in more hose than any other head in the
   fleet. `Drilltechniques-Sonic-Brochure.pdf` p3 (red) and p7 (white) - the head
   is a bought-in item and its colour does NOT match the carrier.
4. **A welded wire-mesh guard cage around the string at the mast foot**, with a
   hinged gate, an interlock switch and a bank of red mushroom E-stops on a
   yellow/black plate. `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p8 and p11. The
   cage is roughly one man high and reads as a bright rectangle of grey mesh.
5. **Free-hanging hose loops, not tidy runs.** Two very large black hoses leave the
   head in unsupported catenary loops and drop to the deck
   (`Drilltechniques-Sonic-Brochure.pdf` p7); a separate helical / coiled black
   hose takes up the carriage travel (p3). A sonic rig looks like it is wearing
   the hydraulics on the outside.

## 6. Materials and paint

All observations from the photographs
(`Drilltechniques-Sonic-Brochure.pdf` p3, p7;
`Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p8, p11, p14).

| Surface | Finish | Notes |
|---|---|---|
| Carrier body, bonnet, mast, jack legs, guard frames | **painted steel, satin/semi-gloss** | Two schemes both appear on the same model: cream/beige body with red accent panels (brochure p3), and red body with white bonnet and white mast (Comacchio p14). Pick one; do not mix. |
| The head | **painted, a different colour from the carrier** | Red on the Toa Tone (brochure p3, Comacchio p11), white/cream on the SDC 50K (brochure p7). It is a bolt-on from another factory. |
| Mesh guard panels | **galvanised or plain welded wire mesh in a painted frame** | Reads grey, semi-transparent. Comacchio p8, p11. |
| Energy chain | **matte black plastic/nylon links** | Not glossy, not metallic. Brochure p3, p7. |
| Hydraulic hoses | **matte black rubber**, with metallic crimped ferrules and bright hose clamps | Bundled in clipped runs; big free loops near the head. |
| Feed chain in the mast | **bare oiled steel roller chain**, dark and shiny with oil | Comacchio p11 shows the chain running in the mast channel. |
| Drill rod / casing on the string | **bare steel**, mill scale and rust, threads bright where made up | Brochure p3, p7. |
| Cylinder rods (jacks, mast raise) | **hard chrome, mirror bright** | Only the exposed stroke is bright; the barrel is painted. |
| Track shoes and sprockets | **bare steel, polished on the wear faces, rusty elsewhere** | Comacchio p8, p14. |
| Track pads (option) | **rubber shoes** on steel tracks (p16 bullet: "steel tracks and rubber shoes") | Black rubber. |
| Glass | Only if the carrier has a cab. **Neither sonic photo shows a cab** - the crawler is open, run from a deck panel or a detached ground console. |
| Decals | Yellow/black hazard chevrons on the clamp and gate frames; red "no hands" and DANGER pictograms on the head (Comacchio p11); model-name decal on the body side. |

### Where the dirt actually is

- **Mud and wet soil up the track frames and over the lower 300-400 mm of the
  crawler**, thrown by the tracks. Brochure p3 shows the machine standing in wet
  churned ground; the track links are dark with it.
- **A soaked, muddy ring around the mast foot and the clamp**, because the hole is
  right there and every rod pull brings wet spoil onto the deck.
- **Timber crib and boards under the jack feet**, themselves muddy - a sonic rig
  never sits its feet straight on soft ground (brochure p3, Comacchio p14).
- **Grease and hydraulic weep streaks** running down from the head and from the
  cylinder glands; darkest immediately under the head.
- **Oil film and dust on the feed chain and the mast rails**, and polished bright
  wear stripes on the carriage gib faces.
- **Paint worn to bare metal on the mast foot, the clamp jaws and the guard gate
  handle** - the three places a driller's boots, rods and gloves land.
- **Rust only where paint has been knocked off**, i.e. edges and corners; the
  panels themselves stay clean because these machines are washed.
- **Dust rather than mud in dry work** - Comacchio p14 shows a huge grey dust
  plume off the hole in air-flush drilling, coating the mast and bonnet. But note
  that sonic itself is the *low-cuttings, low-flush* method, so a sonic rig
  should be **muddy rather than dusty**.

## 7. Photo references

Everything usable is inside the PDFs. **The `C:/Users/henri/Downloads` root holds
about 274 loose images and none of them is a sonic rig** - they are Drillity brand
and UI assets, HP/Atpa business photos, stock photos and AI-generated images. The
`Atpa` subfolder is **drilling tools** (bits, drive shoes, casing heads) not rigs,
and `Atpa/Atpa products` likewise. Checked by filename sweep across the root and
`Atpa`; nothing sonic-named exists.

| Reference | Where | Useful for |
|---|---|---|
| **Sonic head plus string, labelled render** | `Drilltechniques-Sonic-Brochure.pdf` **p2** | The only clean, unobstructed view of the oscillator geometry. Use this for the head shape: twin eccentric bosses, trapezoid taper, collar, adapter, pipe. |
| **Complete sonic rig, three-quarter, mast up** | `Drilltechniques-Sonic-Brochure.pdf` **p3** | Mast plate structure and hole pattern; energy chain; red head stack; coiled hose; clamp table; jacks on timber; tracked carrier. Best all-round reference in the set. |
| **Complete sonic rig, working, operator at the string** | `Drilltechniques-Sonic-Brochure.pdf` **p7** | Head in a different colour; free hose loops; crown sheave and flag; detached ground console; site clutter and scaffold; scale against a man. |
| **Dimensioned GA, working position** | `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` **p16** | Every proportion in section 3. Also shows the mast-head handling arm and the head mounted on the mast face. |
| **Dimensioned GA, transport position** | `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` **p17** | How the mast folds down over the machine; transport envelope; track width retracted. |
| **Mast foot, guard cage, close** | `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` **p8** | Mesh guard and gate; energy chains; head; water swivel; carrier decals; hoses at deck level. |
| **Carriage and mast detail, very close** | `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` **p11** (left half) | Feed chain in the mast channel; gib plates and bolts; three red E-stops on a yellow plate; door interlock switch; DANGER and no-hands decals on the head. The best texture reference in the set. |
| **Working site photos, four views** | `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` **p14** | Operator standing at a deck console; alternative paint scheme (red body, white mast); dust plume; rods on a timber trestle; barrier fencing; timber cribbing; a rig working off a bridge pier. |
| **Hose bundle architecture** | `Bauer-Maschinen-Hydraulikschlaeuche...pdf` **p2** | How a hose package is actually built and wrapped on a drilling mast. Different machine class, correct principle. |
| Figure 5, "drilling equipment fitted with a high-frequency drill head" | `Structural_drilling_using_the_high-frequency_sonic-in-Slovenia.pdf` **p7** | Low-resolution journal reproduction. Confirms the class but adds no geometry the brochure does not give better. |

## 8. NOT SOURCED

Every one of these is a real hole. **Do not invent a number to fill one.**

1. ~~**A truck-mounted sonic rig. Anywhere in the local material.**~~ **CLOSED
   2026-09-05 - see §10.** Still true that no truck-mounted sonic rig exists in
   `C:/Users/henri/Downloads`; both local photographs are tracked crawlers. But
   Terra Sonic International publishes a full dimensioned spec sheet for the
   **TSi 150CT**, a compact truck-mounted sonic rig, *and names its carrier*
   (International HV607). That is now the model's primary source and every
   figure in §10 is cited to it. Section 3 remains a compact CRAWLER and must
   not be used for the truck.
2. **Machine mass.** Neither the Comacchio deck nor the brochure gives an
   operating weight for any sonic rig or carrier. The game asserts 21,000 kg
   (`rigFactory.js`); nothing in the folder supports or refutes it.
3. **Engine power for the carrier.** The Comacchio deck gives none. The only
   sourced sonic-rig engine figure is **180 kW Stage V** for a Terra Sonic TSi
   150CC, via `research/11` A.13 (web-sourced there, not from a local file). The
   game asserts 205 kW - unsourced.
4. **Head physical dimensions.** STILL OPEN. No source anywhere - local or web -
   gives the oscillator housing's height, width or depth in millimetres. The
   brochure p2 render gives **ratios only** (the housing about 2.2x as wide as
   tall; pipe about 0.13x the housing width), and the model solves the housing
   from those ratios against the sourced 100 mm core barrel.
   **Head MASS is now partly closed:** Royal Eijkelkamp is the only publisher
   anywhere that prints one - LargeRotoSonic 50K (227 kN, 0-150 Hz)
   **1,200 kg**; CompactRotoSonic HO (150 kN) **600 kg**; SmallRotoSonic
   **370 kg**. The brochure's 520 kg is the Toa Tone SP-50, a **65 kN** head, and
   is the wrong figure for a 222 kN machine.
5. **Mast cross-section dimensions.** No width, depth or wall thickness for the
   mast box section. Only the overall 6,200 mm height and 3,600 mm stroke.
6. **Mast tilt / angle range for the sonic configuration.** Comacchio p16 and p17
   show the mast vertical and folded, nothing between. The only sourced angle
   figure is **0 to 45 degrees** for a Terra Sonic TSi 150CC via `research/11`.
   **The transport-pose ANGLE is still not published by anyone** - see §11.1,
   where it matters more than it looks.
7. **Rod carousel / magazine.** No source shows one on a sonic rig. Whether this
   class carries an on-board magazine at all is unverified; the photographs show
   ground-laid rods, a trestle and hand stabbing.
8. **Sprocket, idler and roller counts and diameters** for the undercarriage. The
   GA drawings are too small to count rollers reliably.
9. **Ground clearance, track frame height, deck plan dimensions.** Not dimensioned
   on p16 or p17.
10. **The parametric transport length.** p17 gives `Y + 510 mm` and `Y1 + 830 mm`
    where Y is the mast length - **the deck never states what Y is** for any mast
    option, so absolute transport length is unknown.
11. **Exact paint codes / RAL numbers** for either scheme.
12. **Sonic tooling geometry** - the carbide drive shoe is still unsourced, and
    `src/rig/tools.js` still has **no sonic tooling builder at all** (checked: no
    match for "sonic" in that file). But the **barrel and casing geometry is now
    sourced** - see §10.5. Two makers publish full OD/ID/wall tables and both
    sell the class as PAIRS.
13. **The 30 mm disagreement** between p16 (3,840 mm undercarriage length) and p17
    (3,870 mm) is unresolved. Both recorded; neither picked.
14. **Sonicor 33K oscillator force.** The brochure prints the same 50,000 lbf as
    the 50K, which contradicts the model name. Already flagged as unverified in
    `research/11` A.13.

## 9. Domain-truth warnings vs the current game builder

Read from `C:/Users/henri/Downloads/drillity-the-game/src/rig/rigFactory.js`,
function `buildSonicTruck` (around line 2447) and `buildOscillator` (line 1554),
plus `src/game/data.js` and `src/rig/tools.js`. **I own none of these files and
changed none of them.** Ranked by how badly a driller would react.

### 9.1 The carrier is a truck, and every sonic rig in the owner's own material is a crawler

> **SETTLED 2026-09-05, option (b), and it is no longer unsourced.** The brief
> settled the carrier as a truck, and the search then found a published
> truck-mounted sonic rig with a named carrier. §10 replaces the two options
> below. The text is kept because it is the record of how the decision was made.

`buildSonicTruck` builds an **8.2 m, three-axle truck chassis** with a cab, a
walkway, a handrail and four outriggers, and `data.js` line 1225 calls it a
"Truck-mounted sonic head". The two photographs the owner supplied are captioned:

- "A TONE EP26 SONIC HEAD MOUNTED ON A ... **COMACCHIO GEO 305 TRACKED RIG**"
  (`Drilltechniques-Sonic-Brochure.pdf` p3)
- "THE SONIC DRILL CORPORATION 50K HEAD MOUNTED ON A ... **COMACCHIO 900P TRACKED
  RIG**" (`Drilltechniques-Sonic-Brochure.pdf` p7)

`research/11` A.13 already states the rule flatly: *sonic is bought as a head and
mounted on someone else's crawler.* Truck-mounted sonic is a real configuration -
it is not sourced **here**. Two honest options, and the decision is the owner's:

- **(a) Rebuild as a compact crawler.** Everything in section 3 is then a sourced
  number and the machine becomes correct end to end. It also stops the fleet
  having two truck rigs where the reference material has none.
- **(b) Keep the truck** and accept that the geometry is unsourced - but then at
  minimum fix the head, mast, guarding and rod-handling from sections 4 and 5,
  because those parts are the same whatever it is bolted to.

### 9.2 The oscillator force does not match any real head

`rigFactory.js` line 2586: `oscillatorHz: 150, oscillatorKn: 180`.

**150 Hz is correct** for the top tier. **180 kN matches nothing.** The two sourced
tiers are:

| Tier | Frequency | Force | Source |
|---|---|---|---|
| Hydraulic-motor heads | **67 Hz** | **38 / 65 / 78.4 kN** | `Drilltechniques-Sonic-Brochure.pdf` p4, p5, p6 |
| High-frequency oscillator | **133-150 Hz** | **222 kN (50,000 lbf)** | `Drilltechniques-Sonic-Brochure.pdf` p8; corroborated independently by Terra Sonic TSi 150 in `research/11` A.13 |

The current rig mixes the top-tier frequency with a force that sits between the
two tiers. **Use 222 kN at 150 Hz, or 78.4 kN at 67 Hz. Not 180 kN.**

Also `data.js` line 1230 says "running 90-160 Hz". Nothing in the sources gives
90 Hz or 160 Hz; the sourced numbers are 67, 133 and 150 Hz.

### 9.3 The rod rack shows one diameter; a sonic rig always carries two

`buildRodRack(... rows: 2, cols: 5, len: rodLen, r: 0.055 ...)` and
`buildCarousel(... rodDia: 0.089 ...)` - a single diameter in each, and the two do
not even agree with each other. The sonic cycle is **core barrel first, then
override casing down around it**
(`Structural_drilling_using_the_high-frequency_sonic-in-Slovenia.pdf`, Phase I/II;
`research/02` E5: "a sonic rig always has two sizes of tube on the rack"). The
game's own catalogue already ships both: **100 mm core barrel** and **150 mm
override casing** (`src/game/data.js` ~1961-1966).

**Fix:** two visibly different diameters on the rack - roughly 0.100 m and
0.150 m, matching `data.js`. This is cheap and it is the most recognisable sonic
tell there is.

### 9.4 The mast has no energy chain, and that is the class signature

The builder routes hoses with `buildHoseSet` along four short spline points from
the deck to the mast base, and nothing on the mast itself. Every photograph shows
a **full-height black articulated energy chain / cable track** running the whole
feed travel (`Drilltechniques-Sonic-Brochure.pdf` p3, p7;
`Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p8, p11) plus a **helical coiled hose**
and **free hanging loops at the head**. The Bauer flyer confirms the architecture:
a bundled mast hose package running bulkhead to bulkhead, not loose lines.

**Fix, in priority order:** (1) energy chain up the mast, (2) a wrapped bundle
along the mast to a bulkhead plate at the head, (3) two big free loops sagging off
the head.

### 9.5 There is no guarding

The builder gives the machine a "core-catcher table / clamp" at the mast foot and
nothing else. Every modern photograph shows a **welded mesh guard cage** around the
string with a hinged gate, an interlock switch and **three red mushroom E-stops on
a yellow/black plate** (`Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p8, p11). On a
machine whose entire hazard is a violently vibrating string at head height, the
absence of a guard is the detail a driller would notice first.

### 9.6 The oscillator shape is half right

`buildOscillator` is better than most of the fleet: it has **two cylindrical
weight housings side by side with rotating discs**, which genuinely matches the
brochure's "counter rotating rollers", and it has rubber isolation pucks. Three
corrections from `Drilltechniques-Sonic-Brochure.pdf` p2:

- **Aspect.** The game shell is `w=0.82 x h=0.72 x 0.59` - essentially a cube.
  The render shows the oscillator housing about **2.2x as wide as it is tall**.
- **The taper is missing.** The real housing **tapers down as a trapezoid / bell**
  from full width into a narrow neck, then a **collar flange**, then a **darker
  adapter sub**, then the pipe. The game goes straight from box to a thin spindle.
  The taper is the load path and it is what makes the part read as a casting.
- **The air damper is missing.** Rubber pucks are not the whole isolation story -
  the real heads run an **air damper at 0.7 MPa, min 8 L/min**
  (`Drilltechniques-Sonic-Brochure.pdf` p5, p6). Add an air line and a small
  receiver.

### 9.7 A carousel is not what the photographs show

`buildCarousel(... rods: 5 ...)` puts a five-rod magazine on the mast. No source in
this folder shows a magazine on a sonic rig. What is shown is a **mast-head
articulated handling arm** (`Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p16), a
**service winch over a crown sheave** with a hook and chain
(`Drilltechniques-Sonic-Brochure.pdf` p3, p7), and **rods laid on the ground or on
a timber trestle** with the driller stabbing by hand
(`Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p14). Not a blocker, but flagged: the
carousel is an invention, and section 8 item 7 records it as unverified.

### 9.8 Unsourced spec numbers on the rig card

`weightKg: 21000` and `powerKw: 205` (`rigFactory.js` line 2585) have no support in
any local file. The only sourced sonic-rig engine figure anywhere in the research
is **180 kW** (Terra Sonic TSi 150CC, `research/11` A.13). Either cite something or
mark them as game balance, not spec.

### 9.9 Things the builder already gets right - keep them

- The mast is built from `buildFeedBeam`, **not** `buildLatticeMast`. Correct: the
  real mast is plate/box section, and the fleet's core rig correctly gets the
  lattice instead.
- Carriage travel `[mastH - 2.3, 0.75]` over an 8.0 m mast = **62% of mast height**;
  the real figure is 3,600 / 6,200 = **58%**. Close, and correctly short of both
  ends.
- `rodLen = 3.05 m` matches the sourced **3 m (10 ft)** sonic tooling section.
- The deck control stand facing the mast is right in principle - sonic is run
  **facing the string**, from a deck panel or a detached ground console
  (`Drilltechniques-Sonic-Brochure.pdf` p7;
  `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` p14). Add E-stops to it.
- Four outriggers with foot plates is right; put **timber cribbing** under them.

### 9.10 Naming - DOMAIN.md section 10

This document names Comacchio, Toa Tone Boring, Sonic Drill Corporation, Terra
Sonic, Drilltechniques and Bauer, and model designations GEO 305, 900P, EP-26N,
SP-50, SP-8000, Sonicor 50K/33K, TSi 150. **None of them may appear in the game**
as a product name, a decal, a badge or a mast sticker. The game's own name for
this rig ("Corvara SN-6 Resonant", `data.js` line 1225) is correct practice.
Copy the geometry; invent the badge.

---

## 10. The truck-mounted machine, as sourced and as built (2026-09-05)

This section is what `blender/sonic_truck.py` is built from. **§3 is a compact
crawler; this is the truck.** Every figure is quoted from a public document.

### 10.1 The rig - Terra Sonic **TSi 150CT**, "compact truck-mounted"

`terrasonicinternational.com/wp-content/uploads/2025/04/150CT.pdf`, REV 11/2024.
The only truck-mounted sonic rig found anywhere that publishes a full dimensioned
spec **and names its carrier**: *"Design: From Selected Truck Base Model
International HV607"*.

| Dimension | Published | Metric used in the model |
|---|---|---|
| Transport width | 8 ft 3 in | **2.5146 m** |
| Transport length | 23 ft | **7.0104 m** |
| Transport height | 13 ft | **3.9624 m** (a CHECK - the model is authored working) |
| Weight | 25,600 lb std / 33,000 lb optioned | 11,612 / 14,969 kg |
| Mast overall length | 20 ft 1.5 in | **6.1341 m** |
| Head travel / stroke | 14 ft 1 in | **4.2926 m** |
| Mast dump | 55 in | **1.3970 m** |
| Pull-back | 16,800 lbf | 74.7 kN |
| Pull-down | 11,300 lbf | 50.3 kN |
| Oscillator force | 50,000 lbf | 222 kN |
| Oscillator frequency | 0-150 Hz | - |
| Torque / speed | 4,677 ft-lb / 0-62 rpm | 6,341 Nm |
| Jacklegs | 3.5 in x 24 in | 89 mm bore, 610 mm stroke |
| Ground clearance | 9.5 in | 241 mm |

**Two defects in this sheet - do not propagate them.**

1. The spec table says the mast is *"20 ft 1-1/2 in (6.1 m)"*; the feature list on
   the same PDF says *"Standard 19 ft 1 in (5.8 m) Long Mast"*. They disagree by a
   foot. The model uses the spec table and records the disagreement.
2. Several metric conversions are wrong - *"24 in (618 mm)"*, *"6 in (15.24 mm)"*,
   *"20 in (6.1 M)"*. **Where imperial and metric disagree on a TSi sheet, the
   imperial figure is the internally consistent one.**

**Stroke / mast = 4.293 / 6.134 = 0.700**, against **0.581** for the compact
crawler in §3. A truck rig uses more of its mast. That is a real published
difference between the two carriers, not a modelling liberty.

### 10.1a The stroke ratio is a HEAD-HEIGHT measurement, and that is useful

**A mast carries its stroke plus one head height.** The sub face cannot rise
past `mast top - head height`, so whatever a maker does not spend on stroke is
the space the head occupies:

| | mast | stroke | left for the head |
|---|---|---|---|
| TSi 150CT | 6.134 | 4.293 | **1.841 m** |
| Comacchio crawler (§3) | 6.200 | 3.600 | 2.600 m |

That is the only figure anywhere that constrains the **height** of a sonic head,
and §8 item 4 has been open on exactly that question since this document was
written. It is not a dimension of the housing, but it is a hard ceiling on the
whole stack from the sub face to the top of the hose manifold, and it is
published twice by two different makers. Use it.

The same arithmetic is a good sanity check on any rig in this class: if a
published mast and stroke leave less than about 1.5 m, one of the two figures is
wrong.

### 10.2 The larger truck - Terra Sonic **TSi 150T**, for cross-check only

`.../2025/04/150T_vF.pdf`: 8 ft 6 in x 33 ft 10 in x 12 ft 4 in; 42,000 lb;
stroke 24 ft 5 in; pull-back 22,000 lbf; pull-down 15,000 lbf; 50,000 lbf at
0-150 Hz; *"Max Tooling Length: 20 ft (6 m)"*; driller platform *"7 ft 1/4 in
(2 m) L x 12 ft (3.7 m) W"*; jacklegs 4 in x 36 in front, 4 in x 30 in rear.

The class spans further than that in both directions. **Versa-Drill Versa-Sonic**
on a *"Peterbilt 548 6x4"*: 35 ft 10 in x 8 ft, derrick up 40 ft, derrick down
13 ft 2 in, 26 ft top-head stroke, 25,000 lb pullback. **Sonic Drill Corporation
SDC500-28E**: *"MAST: Tubular Construction, 28 FT Head Travel, 37 FT - 8" Overall
Length"*, carrier *"Class 7 or 8 Tandem Axle, Double Wall Frame"*, *"(4) 4" x 36"
Jacklegs"*. **Boart Longyear LS250** is the outlier on frequency: *"Output Force
182 kN / 41,000 lbs"*, *"Frequency Range 0 - 75 Hz"* - i.e. the two-tier
frequency split in §4.2 is real and the low tier is still being sold.

### 10.3 The carrier - International **HV607** 6x4

`gibbstrucks.com/brochures/hv-specsheet-607-06.pdf` and the HV series brochure:
*"107" BBC / 40.3" BA"*, set-back front axle; frame *"11.25" x .5" thick super
single rail"*; wheelbase options **136-340 in**; GVW **68,000 lb (6x4)**.

Supporting chassis geometry, all published:

- **Frame width.** There is **no International "Frame System Overall Width"
  table** - full-text searches of the MV, WorkStar and DuraStar body-builder
  books return nothing of the kind. What International publishes is the *inside*
  figure: *"33.5 (851) BETWEEN FRAME RAILS"*, with rail thicknesses 0.312 /
  0.375 / 0.438 in. **34.25 in is sound arithmetic (33.5 + 2 x 3/8), not a
  published table**, and 34.875 in matches no rail/outsert pair International
  tabulates. Volvo is the one maker that does publish an overall width (Body
  Builder Instructions §7: rails *"1078, 1080, 1082 and 1085 mm (outside
  edges)"* at the front, *"848, 850, 852 and 855 mm (inside edges)"* to the
  rear); Mack states the same splayed shape.
- **Frame height, and the datum trap.** International MV Body Builder Book:
  *"Frame Height at centerline of front axle: unloaded - 33.69", loaded -
  31.73""* and *"...rear axle: unloaded - 35.56", loaded - 32.02""*, with the
  caveat that values *"may vary up to 0.5 inches"*. International's own formula
  **Y = Df + R2 + F** lands on the **TOP of the rail**. PACCAR is the other way:
  *"All heights are given from the bottom of the frame rail."* **The two
  conventions differ by a full rail height, about 10.5 in.** And the MV figures
  are MEDIUM-duty: put an HV607's 11.25 in rail under 32.02 in and the rail
  bottom lands 30 mm above the axle centreline, which cannot be built. The model
  therefore solves its rail height from the running gear and says so.
- **Tandem spacing is an option menu, not a constant.** Peterbilt HD Body Builder
  Manual Table 3-11 lists **52 and 54 in**; International WorkStar lists **52, 55
  and 60 in** (IROS air spring) and **55, 60** (Hendrickson HAS). Peterbilt's own
  caveat: *"Actual axle spacing can depart from nominal ... by more than an
  inch."* The model uses **55 in**, because the carrier is an International.
- **Wheelbase / CA.** *"CA - Cab to axle. Measured from the back of the cab to
  the centerline of the rear axle(s)"*; *"AF - After Frame"*. A published HV607
  build sheet reads *"Wheelbase: 242.00, CA: 174.90, Axle to Frame: 59.00"*.
- **Cab exterior width is NOT PUBLISHED BY ANY US MAKER.** Checked International,
  Peterbilt, Mack, Freightliner and Western Star. The nearest published figure is
  Peterbilt's *"95" Overall Roof Height"* for a 567 UltraLow day cab, and that is
  measured from the frame, not the ground. Cab width, roof height and hood line
  in the model are therefore all flagged NOT SOURCED.

### 10.4 Tyres, track and the legal envelope

- **MICHELIN Truck Tire Data Book, 21st ed.**, X WORKS Z (the on/off-road line,
  which is the right family for a drill truck): **11R22.5 H - overall diameter
  41.8 in / 1,061 mm, loaded radius 19.6 in / 498 mm, overall width 11.3 in /
  288 mm.** Also 12R22.5 1,089 mm; 315/80R22.5 1,089; 11R24.5 1,111.
  **Use the LOADED RADIUS for ride height, not half the overall diameter** - the
  difference is 63 mm, and modelling a tyre at OD/2 about a loaded axle centre
  buries 32 mm of the machine below ground.
- **Peterbilt HD Body Builder Manual Table 3-21**, drive axles, 11R22.5 dual 4-4
  offset: **Track 73.3 in, Overall Width 97.8 in**. The wide-track rows are
  **103.7 and 103.9 in** - a wide-track tandem on this very tyre is already over
  the federal limit before any body goes on. Dual spacing is then arithmetic
  rather than invention: 97.8/2 - 11.3/2 - 73.3/2 gives **334 mm**.
- **23 CFR 658.15(a):** *"No State shall impose a width limitation of more or
  less than 102 inches, or its approximate metric equivalent, 2.6 meters
  (102.36 inches) on a vehicle operating on the National Network."* **658.16**
  excludes mirrors, turn signals, cab handholds, spray suppressants and tyre
  bulge, and says each exclusion *"may not be combined with other excluded
  devices"*. Note that 658.15(b) exempts *"special mobile equipment"*, defined in
  658.5 to include *"road construction or maintenance machinery"* - a drill rig
  plausibly falls there, so 102 in is a strong guide rather than a hard wall.

### 10.5 Tooling - and the two diameters are now fully sourced

- **Terra Sonic tooling catalogue**
  (`.../00042_TSi_Tooling_Catalog_Listing_vF.pdf`): core barrels 3.75 / 4.75 / 6 /
  7 / 8 in OD in **5.5 ft and 10.5 ft** lengths; casing 4.75 / 6 / 7 / 8.1 / 9.25
  / 10.5 / 12 in OD in **2, 2.5, 5 and 10 ft and 1.5 and 3 m**. The half-foot
  offset on the barrels is deliberate: **the barrel leads the casing.** Rods and
  barrels right-hand thread, **casing left hand** - which is exactly what
  `data.js` already ships.
- **Geoprobe** (`geoprobe.com/tooling/sonic-tooling`) sells conventional sonic
  sampling as **4x6, 6x8 and 8x10** - *"a 4 in. core barrel overcased with a 6 in.
  casing"*. Casing sections 120, 60, 24, 18, 12 and 6 in. Liner: DT60 lay-flat,
  4.500 OD / 4.430 ID / 0.035 wall in.
- **Boart Longyear**: *"the core barrel is advanced 10 ft (3.05 m) using sonic
  frequencies. After the core barrel is in place, casing is sonically advanced
  over the core barrel."*

So `data.js`'s **100 mm barrel inside a 150 mm casing at 3 m** is a real pairing
at the small end of the published range, near Geoprobe's 4 in x 6 in. **Two
visibly different diameters on the rack is not a stylistic choice - it is the
method**, and drawing one diameter remains the commonest way to get this machine
wrong (§9.3).

### 10.6 Outriggers

Nobody publishes an outrigger PAD for a sonic rig. What is published:

- Terra Sonic jackleg CYLINDERS - 150CT *"3-1/2 in (89 mm) x 24 in"*; 150T
  *"4 in x 36 in front, 4 in x 30 in rear"*; SDC500 *"(4) 4" x 36""*.
- Geoprobe 8150LS sonic: *"Front outrigger travel 26 in (660 mm); rear outrigger
  travel 26 in (660 mm)"*, four-point stabilisation. Geoprobe 3230DT publishes a
  **stabilizer spread of 78 in (1,981 mm)**.

Pad size and spread for a truck-mounted sonic rig: **NOT FOUND.**

### 10.7 What is still NOT FOUND after the search

- **Cab exterior width**, any US maker, any model. The most-wanted number.
- **Head weight** for the TSi 150, Geoprobe GV4/GV5, Sonicor 50K or Boart
  Longyear heads. Only Eijkelkamp publishes masses (370 / 600 / 1,200 kg).
- **GVWR for the TSi 150CT or 150T** as rigs. The HV607's own 68,000 lb 6x4 GVW
  is published, but not as the rig's rating.
- **Outrigger cylinder bore/stroke** on any drill-rig sheet beyond the jackleg
  sizes above.
- **ASTM D6914** tooling diameters (paywalled).
- Boart Longyear's `Sonic-Rig-Specifications-US.pdf` failed TLS on every attempt
  and is likely the richest un-retrieved source. Worth another try.

---

## 11. Three cross-file findings from building the model

**None of these files is mine and none was touched.** They are recorded here so
the next reader does not have to re-derive them.

### 11.1 A model cannot declare its own transport rake

`src/rig/rigFactory.js` line 7599 hands every `.glb` machine
`transportTilt = -1.32` rad - the mast parked **14.4 degrees above horizontal** -
and `src/core/gltfRig.js`'s `makeDyn()` never reads a machine's own figure, so a
model **cannot declare one**.

**The transport pose was built and measured, not argued about.** Rotating
`pivot:mast` by -1.32 rad and transforming every vertex gives:

| | measured | published [TSi 150CT] |
|---|---|---|
| width | **2.515 m** | 8 ft 3 in = 2.515 m |
| length | 8.090 m | 23 ft = 7.010 m |
| height | **3.912 m** | 13 ft = 3.962 m |

Width exact, height **50 mm** under. So for this machine the game's fixed tilt
lands on the published pose. An earlier draft of this note claimed it could not -
that was reasoning, the measurement contradicted it, and the claim is withdrawn.
The 1.08 m of extra length is the mast **foot**, which swings out behind the
tailboard as the mast lies down; the published 23 ft is evidently measured over
the chassis.

**What made it work is the mast dump, and that is worth saying plainly.** A
6.13 m mast pinned at deck level folds straight through the cab of a 7.01 m truck
at 14.4 degrees, whatever else is done. The TSi publishes **55 in of mast dump**,
so the tilt pin sits 1.4 m above the mast foot and the mast folds from high
enough to land on a rest above the cab roof. Without that published figure this
machine could not have been built to its own published transport height.

What remains true: the next machine whose real transport rake is not 14.4 degrees
has no way to say so. **The fix is two lines** in `makeDyn()`, beside where it
already reads `travel_m` off the carriage:

```js
const t = mastPivot.userData.transport_tilt_rad;
if (typeof t === 'number') dyn.transportTilt = t;
```

`blender/sonic_truck.py` already publishes `transport_tilt_rad` on `pivot:mast`.

### 11.2 `data.js` describes a bigger machine than its own tooling does

| | mass | pull-back | tooling section |
|---|---|---|---|
| TSi 150CT | 11.6-15.0 t | 74.7 kN | 3 m / 10 ft |
| TSi 150T | 19.1 t | 97.9 kN | up to 6 m |
| `data.js` `sonic-truck` | **18 t** | **90 kN** | **3.0 m** |

The mass and the pull-back point at the **larger** machine; the tooling length
points at the **smaller** one. The model is built as the 150CT class, because
that is the machine with a published carrier and a published mast, and because
`rodLength: 3.0` is what the game actually simulates with. Somebody who owns
`data.js` has to pick - this is the same shape of problem as the
`cable-percussion` data-vs-model split recorded in `ASTRA.md` §7.5.

Also still open from §9.2 and §9.8, and unchanged by this work:
`rigFactory.js` `oscillatorKn: 180` matches no real head (use **222 kN at
150 Hz**), `data.js` "running 90-160 Hz" matches no published figure (the sourced
numbers are 67, 133 and 150 Hz), and `weightKg: 21000` / `powerKw: 205` have no
support anywhere.

### 11.3 One measured note on `blender/preview.py`

`preview.py`'s `bounds()` sums `o.bound_box` - the eight corners of each object's
LOCAL AABB - which is a strict over-estimate on any joined mesh whose object
transform carries a rotation. On this model it prints
`size=(2.51, 10.17, 7.53)` against `tools/glbinfo.mjs`'s exact
**2.515 x 7.630 x 7.304**. It only affects camera framing, so it is cosmetic -
but it is the same approximation that produced four false findings in
`ASTRA.md` §5, and it should be read as framing, never quoted as a dimension.
