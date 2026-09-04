# Rig reference — `sonic-truck` (truck-mounted sonic / resonant drilling rig)

status: in progress — head geometry sourced, rig-scale geometry in progress

> **Naming rule (DOMAIN.md §10):** this document cites real manufacturers and
> model designations so the geometry can be verified against a real object. The
> GAME must NOT use any of these names, badges or model numbers as a product
> name or a decal. Model the shapes; invent the badge.

## 1. Sources read

| File | Pages | What it actually showed |
|---|---|---|
| `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` | 18 pp; p15, p16, p17 read closely, p2/3/5/8/11/14 are photos | Sales deck for the exact carrier the sonic head in the brochure photo is bolted to. **p16 and p17 are dimensioned general-arrangement drawings** (working and transport position) with a red sonic-style head drawn on the mast - the only hard dimensions in the whole source set. p15 is a depth-vs-method table. p1-p14 are photographs with no text. |
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

(pending)

## 8. NOT SOURCED

(pending)

## 9. Domain-truth warnings vs the current game builder

(pending)
