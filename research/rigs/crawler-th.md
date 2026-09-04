# Engineering reference — `crawler-th`
## Surface top-hammer crawler drill with screw compressor

status: **in progress** (rev 2)
subject: game rig id `crawler-th` (game name "Steinbach TH-320 Ridgeline")
compiled: 2026-09-04

> **NAMING RULE — read before modelling.** `DOMAIN.md` §10: the game must not use
> real manufacturer names or model designations as product names. This document
> cites real machines and real catalogues because that is where the truth is.
> Copy the **geometry, proportions and materials**. Never copy a badge, a logo
> colour block, a model-number decal, or a trade name onto the mesh or into the
> UI. Where a real designation appears below it is **reference data only**.

---

## 1. Sources read

| file | pages / part | what it actually showed | useful? |
|---|---|---|---|
| `Downloads/Surface_Drill_Rig_1000_0001.jpg` | whole image | **The single best geometry reference in the folder.** Rear-quarter studio render of a small yellow boom-mounted surface crawler drill: tracked undercarriage, glazed cab forward-left on the deck, engine/compressor bonnet behind the cab, a folding articulated boom reaching forward-left, and a short **vertical box-section feed beam** carried on the boom nose. Dust hood at the beam foot, a **large-bore corrugated flexible suction hose** running from it to a **dust-collector box mounted on the side of the feed**, coiled spiral hydraulic hoses on the boom, a black mesh dust curtain, cylindrical tank at the rear right. | **YES — primary** |
| `Downloads/surface_top_hammer_drill_rigged_01.jpg` | whole image | A larger top-hammer crawler in front 3/4, feed beam **inclined ~45°**, the whole feed and rod magazine wrapped in a **perforated / mesh guard cage**, cab forward-left, tall rear enclosure with **vertical louvre grilles** (engine + compressor cooling). Shows the class at working attitude, which the first image does not. Carries a model badge — do not copy it. | **YES — primary** |
| `Downloads/digital-solutions-for-surface-drilling-brochure-english.pdf` | 1–15, text | **Not this machine.** Entirely about **rotary blasthole** rigs (DR410i / DR412i / DR413i / DR416i, 152–406 mm holes) and automation software (SICA, iDrill, AutoMine, TIM3D). No top-hammer rig, no dimensions, no drawings. | **NO — wrong machine class** |
| `research/03-mining.md` §C.1.1 | — | An in-project silhouette description of exactly this rig already exists: tracked undercarriage, boom + feed beam, drifter riding **on top** of the beam, rod carousel on the side, dust hood at the ground end with a big flexible hose to a cyclone/filter box, diesel + **screw compressor** in the body, cab offset to see the collar. | **YES** |
| `research/12-oem-rock-tooling.md` §B.2, §C.1, §C.2 | — | Thread / hole / rod ladder (R25 → GT60), rod lengths **3.0–6.1 m**, top hammer's whole hole range **28–152 mm**, and one published field configuration: 87 mm GT60 pilot tube, **4.3 m GT60 rods**, 115 mm ballistic retrac bits, 20 m holes at **15°** in granite. | **YES — tool end** |
| `research/16-site-archetypes.md` §A.4, §A.5, D4 | — | Where the machine stands (quarry bench, pit bench, infra corridor, slope & cutting, tunnel portal, urban rock excavation) and the sourced class split **top hammer ≈ 1–5.5 in holes / DTH 3.5–8 in**. Already flags defect **D4** — `crawler-th` offering `jet-grouting`. | **YES** |

_(more source rows appended in §1b as they are read)_

---

## 2. What the machine IS

A **surface top-hammer crawler drill** is a self-propelled tracked carrier whose
whole purpose is to hold a **feed beam** steady at an arbitrary angle and push a
**hydraulic drifter** down it. The drifter sits **on top** of the string and
hammers through the rod — percussion happens at the surface, not in the hole,
which is the entire difference from a DTH rig. It drills **blastholes** on a
quarry or pit bench (the archetypal job), plus pre-split and smooth-blast rows
along a highwall, rock dowels and drainage holes into cut slopes, portal collars
at a tunnel mouth, and rock excavation in cities. Hole range for the method is
**28–152 mm** with the practical production band around **76–127 mm**
(`research/12` §B.2, §C.1). It carries its **own screw compressor**, but a small
one: on a top-hammer rig the air is only for **flushing cuttings out of the
hole**, not for driving a hammer, so it is a low-pressure, modest-flow package —
unlike the DTH rig next to it on the same bench, whose compressor is the largest
single thing on the machine. It stands on the bench crest on a flagged pattern,
usually with the feed **inclined**, not vertical — inclined holes are normal
practice, and the published field example drills at **15°** (`research/12` §C.2).
`research/03` §C.1.1 states the modelling consequence bluntly: the feed *"tilts
and slews independently of the tracks; the machine ... looks wrong if the feed
only ever points straight down."*

---

## 3. Proportions

status: **partly sourced.** Only figures I can attach to a file or a URL appear
here. Anything I could not source is in §8, not invented.

| dimension | value | source |
|---|---|---|
| Hole diameter, method envelope | **28 – 152 mm** | `research/12` §B.2 / §C.1, quoting `top-hammer-drilling-tools-broshure-english.pdf` |
| Hole diameter, typical surface production | **1 – 5.5 in ≈ 25 – 140 mm** (top hammer) vs **3.5 – 8 in** (DTH) | `research/16` §A.4, `[EPIROC-SURF]` |
| Rod length (extension / drifter rods) | **3.0 – 6.1 m**; listed steps 3 700 / 4 305 / 4 915 / 5 525 / 6 095 mm | `research/12` §C.2, Sandvik extension-rod tables |
| Rod diameter by thread | R32 = 32 · T38 = 38 · T45 = 45 · T51 = 51 · ST58 = 58 · **GT60 = 60 mm** | `research/12` §C.2 table |
| One published field configuration | 87 mm GT60 pilot tube, **4.3 m GT60 rods**, 115 mm ballistic retrac bit, **20 m holes at 15°** in granite | `research/12` §C.2, from `top-hammer-drilling-tools-broshure-english.pdf` |
| Bench hole depth the feed must serve | *"a few meters to 30 m or more, depending on the desired bench height"* | `research/16` §A.4, `[BRITANNICA-Q]` |

**Ratios matter more than absolutes.** The two reference images carry no scale
bar, so the following are **measured ratios from those images**, explicitly
flagged as such — they are not published dimensions:

- **Feed beam length ≈ 1.0–1.3 × the track length.** The beam is *not* a tall
  tower. It is roughly one rod, plus the drifter's travel, plus the rod-handling
  allowance. A top-hammer feed that looks like a piling mast is wrong.
- **The feed stands well outboard of the tracks** — the boom carries it forward
  and to one side so the hole is clear of the undercarriage, typically about a
  full track-length ahead of the front idler. This overhang is the single most
  characteristic proportion of the class.
- **Deck superstructure height ≈ 0.8–1.0 × track height.** The machine is low
  and wide relative to its feed, unlike a rotary blasthole rig, which
  `research/16` §A.5 describes as *"a tower two to four times the machine's body
  length."*
- **The cab is small** — roughly one third of the deck length, set forward and
  offset to one side, glazed on three faces plus the roof front so the operator
  can watch **up the feed and down at the collar** at once.
- **Track gauge ≈ 0.55–0.7 × overall track length**, wide shoes, deep frames.
  This machine works on blasted rock, not on a road.

---

## 4. Component inventory

**Feed beam (not a "mast").** A straight **box-section or extruded beam** with
machined rails along its top faces. It is the visual signature
(`research/03` §C.1.1). The **drifter carriage runs along the top of the beam**
on those rails. Feed force comes from a **chain or cable drive with a hydraulic
cylinder**, running inside or under the beam, over an **idler sheave at each
end** — the round wheel at the top of the beam in `Surface_Drill_Rig_1000_0001.jpg`
is that sheave and must be modelled. *Why it matters:* a smooth featureless bar
reads as a prop; the rails, the sheave and the chain run are what say "feed."

**Hydraulic drifter (rock drill).** A rectangular hydraulic block on the
carriage, with a **shank adapter** projecting from its nose into the rod string;
percussion *and* rotation are both taken through it. Hoses enter from the rear
and side and **must move with the carriage** — a hose loop, hose guide or hose
drum taking up slack over the full feed travel is mandatory and very visible.
*Why it matters:* the drifter travelling down the beam while the hoses pay out
is the animation the whole machine exists for.

**Boom.** A folding, articulated boom from the front of the deck to the beam
cradle, with **two or three cylinders** (lift, extension/dump, and the beam's
own tilt actuator at the nose). In `Surface_Drill_Rig_1000_0001.jpg` it is a
fabricated box with a visible transverse pivot pin at the nose.
*Why it matters:* the boom is what puts the feed anywhere in a working envelope;
it is the joint that makes inclined and offset holes possible.

**Feed cradle / beam-tilt joint.** Between boom nose and beam: a rotator plus a
cylinder swinging the beam from vertical through to past horizontal.
*Why it matters:* pre-split and dowel work needs shallow angles.

**Rod handling.** A **carousel or magazine of rods on the side of the feed**
(`research/03` §C.1.1), or a linear rack alongside it, with a **swing arm** that
lifts a rod out of store onto the beam axis. In
`surface_top_hammer_drill_rigged_01.jpg` the magazine and the whole upper feed
are **enclosed in a perforated mesh guard cage** — a large, flat, grey,
semi-transparent surface and one of the biggest visual masses on the machine.
*Why it matters:* the rod store is the visible reason the rig can drill 20 m
with 4 m rods.

**Rod holder / breakout table at the beam foot.** Hydraulic jaws that grip the
string while the drifter unscrews, plus a centraliser.
*Why it matters:* it is the mechanism the "add a rod" cycle plays against.

**Dust hood and dust collection.** A **hood over the collar at the foot of the
beam**, a **large-bore corrugated flexible suction hose** from it to a
**cyclone / filter box**, and the collector itself. In
`Surface_Drill_Rig_1000_0001.jpg` the collector is a tall box **mounted on the
side of the feed assembly**, not on the deck, with the corrugated hose running
up its outside. `research/03` §C.1.1 describes the **deck-mounted** variant.
**Both layouts are real — record both, do not silently pick one.**
*Why it matters:* dry dust collection is a defining top-hammer surface feature,
and the fat ribbed hose is recognisable at thumbnail size.

**Dust curtain.** A black flexible skirt / mesh curtain around the collar,
visible in `Surface_Drill_Rig_1000_0001.jpg`. Cheap to model, very characteristic.

**Engine and screw compressor package.** Under one bonnet or in one enclosure
behind the cab: diesel engine, hydraulic pumps, and a **screw compressor** whose
air goes to flushing only (`research/03` §C.1.1). Cooling is through **louvred
or grilled panels** — in `surface_top_hammer_drill_rigged_01.jpg` the rear
enclosure is almost entirely **vertical louvre grille**, a strong striped
texture. An air receiver and oil separator sit inside; on this class they are
modest, **not** the dominant cylinder they are on a DTH rig.

**Tanks.** Cylindrical fuel and hydraulic tanks at the rear or rear corner
(`Surface_Drill_Rig_1000_0001.jpg` shows a horizontal cylinder at the rear
right). Hydraulic oil volume on a machine with this many cylinders is large and
the tank should read as such.

**Cab / canopy.** A small ROPS/FOPS cab, forward and offset to one side, heavily
glazed including a **roof window** so the operator can see up the feed; a
**guard grille or bar over the front and roof glass** against flyrock is normal.
An open-canopy variant exists on the smallest machines. *Why it matters:* the
offset and the roof glass are what say "drill rig operator," not "excavator."

**Walkway, handrails, ladder.** Deck walkway with a **kick plate**; tubular
two-rail-plus-mid-rail handrails at the platform edges; a fixed or hinged ladder
/ step set at the track frame giving access to the deck.

**Guarding.** Beyond the rod-store cage: belt and fan guards inside the engine
bay, a hose guard along the boom, and rock-guard plating under the deck.

**Undercarriage.** Excavator-type crawler: **grouser track shoes** (deep bars —
this machine works on shot rock), a **drive sprocket at one end**, an **idler
with a grease-cylinder track tensioner** at the other, **bottom rollers**
(5–7 per side read off `Surface_Drill_Rig_1000_0001.jpg` — an image count, not a
published figure), one or two **top carrier rollers**, and a deep welded track
frame with a **guide guard** over the top run.

**Levelling jacks / outriggers.** Front and rear hydraulic jacks with flat pads
that take weight off the tracks and level the machine before drilling — short
vertical cylinders with round feet. *Why it matters:* a top-hammer rig drilling
with its tracks still loaded is wrong; jacks down / tracks unloaded is the
"drilling" pose.

**Hose routing — two families, and they must look different.**
1. **Carrier hoses:** bundled and clamped in **P-clips along the boom's top
   face**, entering at the base swivel. Straight, tidy, bundled runs.
2. **Feed / drifter hoses:** must accommodate travel. In
   `Surface_Drill_Rig_1000_0001.jpg` these are **tightly coiled spiral hoses**
   (phone-cord form) slung between boom and feed, plus a slack loop.
   The corrugated dust hose is a third, much larger-diameter, non-pressure line.
*Why it matters:* hoses are the cheapest thing that makes a rig read as a
working machine rather than a CAD block.

**Winch.** NOT confirmed for this class from the local material — see §8.

---

## 5. Distinctive features — the thumbnail silhouette

1. **A short straight feed beam held far outboard on a folding boom.** Not a
   tall mast on the deck centreline. The cantilever of beam-beyond-tracks
   separates it instantly from a DTH crawler, a piling rig, or a rotary
   blasthole rig.
2. **The feed is at an angle.** Inclined holes are normal (`research/12` §C.2
   field case at 15°; `research/03` §C.1.1: a permanently vertical feed
   *"looks wrong"*).
3. **The fat ribbed dust hose looping from the collar hood to a collector box**,
   with the black dust curtain at the ground.
4. **The rod magazine cage** — a flat grey perforated panel mass alongside the
   upper feed (`surface_top_hammer_drill_rigged_01.jpg`).
5. **Low wide tracked body, small offset glazed cab, louvred rear enclosure** —
   deck height about equal to track height, no tall tower.

---

## 6. Materials and paint

- **Painted steel, machine colour** (the class is overwhelmingly **yellow** in
  both reference images; orange, red and white are also real — pick a house
  colour, never a maker's exact hue + logo combination): deck panels, bonnet,
  engine enclosure, cab shell, boom, feed beam body, handrails, dust collector
  box, tank shells.
- **Dark grey / near-black painted steel:** track frames, track shoes, boom
  pivots and pins, the drifter body, hose clamps, the beam underside, guard
  grilles and louvres. The two-tone yellow-body / dark-undercarriage split is
  visible in both images and does most of the work of reading as a machine.
- **Bare / bright steel:** shank adapter, drill rods, the exposed length of
  **every cylinder rod** (chrome — distinctly brighter and more specular than
  paint), track pins, and the machined feed rails, which polish to bare metal
  exactly where the carriage runs.
- **Rubber:** hose covers (matte black, slightly dusty), cab seals, the dust
  curtain, engine bay mounts.
- **Glass:** cab glazing, faintly green-tinted, with the guard grille in front.

**Where wear and dirt actually accumulate.** The site is rock dust:
`research/16` §A.4 on a quarry — *"everywhere the colour of the rock as dust."*
So the dirt is **the colour of the local rock**, not brown mud: pale grey-white
in limestone, buff in sandstone, grey in granite.

- **Heaviest dust:** the feed beam foot, the dust hood, the collar area, the
  lower third of the boom, the track frames, and the deck walkway.
- **Track shoes:** polished bright on the grouser tips, dust packed in the shoe
  pockets and between grousers.
- **Feed rails:** worn to bright bare steel along the carriage travel band, with
  grease at the ends.
- **Cylinder rods:** bright where extended in normal use, a faint witness line
  and a wiped-clean band at the gland.
- **Paint wear:** rock-chip pitting on the **front and lower faces** (facing the
  hole), scuffing on handrails and ladder rungs, paint gone along the beam's
  lower edges.
- **Rust:** only where paint is gone and water sits — beam foot, underside of
  the collar hood, hood clamps, behind the dust collector where fines pack wet.
  A thin edge effect, not a texture wash.
- **Oil:** dark staining at hose junctions and the drifter's lower body, with a
  drip trail down the beam under the drifter.
- **The cab is the cleanest thing on the machine**, except a dust-fogged lower
  windscreen and clean wiper arcs.

---

## 7. Photo references

| file | shows | good for |
|---|---|---|
| `C:/Users/henri/Downloads/Surface_Drill_Rig_1000_0001.jpg` | small boom-mounted surface crawler, rear 3/4, feed vertical | boom geometry, dust hose + collector mounted on the feed, coiled hoses, rear tank, track/deck proportions |
| `C:/Users/henri/Downloads/surface_top_hammer_drill_rigged_01.jpg` | larger top-hammer crawler, front 3/4, feed at ~45° | **working attitude**, mesh rod-store guard cage, louvred rear enclosure, cab position |

_(further image-sweep results appended below)_

---

## 8. NOT SOURCED

- **Overall length, width, height, transport height** — no dimensioned drawing
  of a top-hammer surface crawler exists in the supplied folder.
- **Operating weight** — not found locally. The game claims 12 500 kg; I can
  neither confirm nor refute that from the supplied material.
- **Engine power (kW)** — not found locally. Game claims 168 kW.
- **Feed length and feed force (kN)** — not found. Game claims 42 kN.
- **Drifter percussion power (kW), impact rate, rotation torque** — not found.
- **Compressor rating for a top-hammer rig (m³/min, bar)** — the folder has a
  full **DTH** compressor-sizing table (`research/12` §C.4, 10 / 18 / 24 bar) but
  **nothing for top-hammer flushing air**, which is a different, much smaller duty.
- **Track gauge, shoe width, roller count as published figures** — read from
  images only, flagged as ratios in §3, never as measurements.
- **Whether this class has an oscillating or extendable undercarriage.**
- **Whether this class carries a winch**, and where.
- **Ground pressure, gradeability, tramming speed.**
- **PDF pages could not be viewed as images on this machine** — poppler /
  `pdftoppm` is not installed, so every PDF was read as **extracted text only**.
  Any drawing, dimensioned diagram or photograph inside those PDFs is unread.
  **Installing poppler would unlock the largest remaining source of truth.**

---

## 9. Domain-truth warnings — what the game currently gets wrong

_(rev 3 — being written)_
