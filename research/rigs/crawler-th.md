# Engineering reference — `crawler-th`
## Surface top-hammer crawler drill with screw compressor

status: **complete for this pass** (rev 4)
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
| `Downloads/surface-drill-rig-for-quarrying-and-mining-smartroc-d65-3d-model-77345d1f1d.webp` | whole image | A clean full-machine render of the **sibling DTH surface crawler** — same boom-mounted-vertical-feed architecture, yellow cyclone + black cone dust collector on the left of the feed with two corrugated hoses to the collar hood, grey/yellow two-tone body, guard-grilled cab, steel tracks, rear mesh-grille enclosure with exhaust stack, front levelling jacks, a circular step platform at feed mid-height, and a **bare bright-metal feed beam**. Its compressor bay is oversized for top hammer — the one thing not to copy. Badged; do not copy the badge. | **YES — layout and materials** |
| `Downloads/Atpa/` (folder, sampled) | listing + `atpa-de-slide-3.jpg` | ATPA tooling-company product, factory and logistics photography — drill heads, casing shoes, bits, a works interior with a steel delivery truck. **No surface top-hammer rigs.** | **NO** |

**See §1b immediately below** for the photographs recovered from inside the PDFs — they are the strongest references in this document.

---

## 1b. Additional sources read — images recovered from inside the PDFs

Poppler is not installed, so PDF **pages** cannot be rasterised. I instead
extracted the **embedded photographs** out of the PDFs with `pypdf`
(`page.images`) and viewed those directly. That worked, and it produced the four
best references in this document. Extracted copies are in the session scratchpad
at `.../scratchpad/pdfimg/`.

| source | what it showed | useful? |
|---|---|---|
| `top-hammer-drilling-tools-broshure-english.pdf` **p.16** (embedded photo) | **A real small surface top-hammer construction crawler at work**, red, in a rock trench in a Nordic forest. **Rubber tracks. No cab at all** — the operator stands off to the side with a **hanging remote-control box on a neck strap**. Short vertical feed on a folding red boom, standing well outboard; tall rear enclosure with a **louvred grille door** (engine + compressor); rear stabiliser legs down. | **YES — class-defining** |
| `top-hammer-drilling-tools-broshure-english.pdf` **p.60** (embedded photo) | **The best component photograph found.** A boom + feed + drifter assembly close up (this one is an underground longhole boom, *not* a surface rig — flagged honestly — but the feed/drifter/hose subassembly is the same family). Shows: the feed is an **open fabricated frame with two bright round guide bars**, not a solid box; a **festooned loop of ~10 black hoses** hanging in the middle of the feed as the drifter's travel take-up; **two large-bore black corrugated hoses in catenary droops** from feed to carrier; the boom as a red box-section with a bare chrome extension-cylinder rod; a red rotator/tilt casting at the boom nose; a hose-protection **coil spring**; a **yellow/black hazard-striped decal** on the carrier corner. | **YES — best component reference** |
| `Tophammer catalog.pdf` **p.2** (embedded photo) | **The dust hood, close up, on a yellow surface rig on a quarry bench.** A **large black flexible rubber bell/skirt** clamped to the mouth of a **yellow fabricated steel duct**, with a **black corrugated suction hose** leaving the top of the duct. Behind it, the feed's **bright bare-aluminium / silver extruded beam** with bolted plates, and hose bundles in **black spring guards**. Also: a hand-held **yellow-painted button bit with bare carbide buttons** on a black rod, and a second yellow drill rig on the bench in the background. | **YES — dust hood + materials** |
| `Tophammer catalog.pdf` **p.11** (embedded photo) | Shank adapters and rods standing in a pickup bed. Material fact: drill steel is delivered **painted (bright yellow here) on the body with bare, bright, machined splines and thread ends** — a two-material look worth copying on rods in the game. | **YES — tool materials** |
| `Tophammer catalog.pdf` **p.43** (embedded photo) | A finished blasthole in granite: **angular grey cuttings 2–8 mm heaped in a ring around the collar**, the hole mouth slightly bevelled, faint spiral rings on the hole wall. | **YES — collar / cuttings** |
| `catalog_rocktool_english.pdf` | Scanned all 34 pages: **contains no embedded photograph over 60 kB.** It is a tables-and-line-art tooling catalogue. | **NO — no imagery** |
| `Top_Hammer_Tools.pdf` (Mitsubishi, 88 pp.) | Large images exist (pp. 1, 2, 3, 6, 7, 17, 21, 41, 61, 83) but the catalogue is a **shank-adapter / tooling cross-reference**, already mined by `research/12` §B.3. Not a rig source. | **partly — tools only** |

### What those four photographs change

1. **There are two distinct sizes in this class, and they look different.**
   The **small construction machine** (brochure p.16) is **rubber-tracked, has no
   cab, and is run by a walking operator on a remote box**. The **quarry
   production machine** (`surface_top_hammer_drill_rigged_01.jpg`, and the
   background rig in catalogue p.2) is **steel-tracked, cabbed, bigger, with a
   mesh-caged rod magazine**. `crawler-th` is written as the second, but the
   first is equally real and is the machine that does urban rock excavation,
   trenching and slope work. **Record both; do not silently merge them.**
2. **The feed is an open frame, not a closed box.** Brochure p.60 shows two
   **bright round guide bars** running the length of a fabricated frame, with the
   carriage riding them. Catalogue p.2 shows the same beam as a **bright
   bare-aluminium extrusion**, not painted. A solid painted box beam is the wrong
   read.
3. **The hose festoon is a large, visible, load-bearing piece of the silhouette.**
   Roughly ten hoses looped in a hanging bundle in the middle of the feed
   (p.60) — not two thin tubes.
4. **The dust hood is a rubber bell on a fabricated duct**, not a simple cone,
   and the corrugated suction hose is genuinely fat — comparable in diameter to
   a drill rod several times over.

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

**And the size split, which changes the silhouette entirely.** Two machines
share this class name and both are real:

| | **small construction crawler** (brochure p.16) | **quarry production crawler** (`surface_top_hammer_drill_rigged_01.jpg`, D65 render) |
|---|---|---|
| operator | **none on board — a walking operator with a hanging remote-control box** | **cabbed**, glazed, guard-grilled |
| tracks | **rubber** | steel, grousered |
| rod store | small or none (single rods handed in) | **mesh-caged magazine on the feed** |
| where | trench and city rock excavation, slope work, portal collars | bench blastholes, pre-split rows |

`crawler-th` as built is the second. The first is the better-sourced photograph
in this folder and is the obvious candidate if the game ever wants a cheaper
starter tier of the same method.

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
- **Bare / bright steel and aluminium:** shank adapter, the exposed length of
  **every cylinder rod** (chrome — distinctly brighter and more specular than
  paint), track pins, and the machined feed rails, which polish to bare metal
  exactly where the carriage runs. **Correction from the photographs: on the
  real machines the whole feed beam is often bare bright extrusion, not painted
  at all** — catalogue p.2 shows a silver extruded beam with bolted plates, the
  D65 render shows bright metal rails the full length of the feed, and brochure
  p.60 shows two bright round guide bars. Do not paint the beam body-colour by
  default; a bare metal feed against a painted body is a strong, correct
  material contrast.
- **Drill steel is painted, with bare ends.** Catalogue pp.11 and 17: rods,
  shanks, coupling sleeves and bit bodies are **painted a bright colour** (yellow
  in this catalogue) over the body, with **bare, bright, machined threads,
  splines and gauge faces**, and **bare hemispherical carbide buttons** in the
  bit face. A uniformly bare-steel rod is wrong; so is a uniformly painted one.
- **Two-tone body is normal.** The D65 render is **grey lower structure + yellow
  upper panels**; `Surface_Drill_Rig_1000_0001.jpg` is yellow over a dark grey
  undercarriage; brochure p.16 is red over black. All three keep the
  undercarriage dark and the superstructure bright.
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

Ranked. The first four are the ones to model from.

| file | shows | good for |
|---|---|---|
| **1.** `C:/Users/henri/Downloads/Surface_Drill_Rig_1000_0001.jpg` | small boom-mounted surface crawler, rear 3/4, feed vertical | boom geometry, dust hose + collector **mounted on the feed**, coiled hoses, rear tank, track/deck proportions, feed-head sheave |
| **2.** `C:/Users/henri/Downloads/surface-drill-rig-for-quarrying-and-mining-smartroc-d65-3d-model-77345d1f1d.webp` | **a clean full-machine 3/4 render of the sibling DTH crawler.** Same architecture as `crawler-th` — boom-mounted vertical feed, yellow cyclone + black cone dust collector on the left of the feed with **two corrugated hoses down to the collar hood**, grey/yellow two-tone body, cab with side guard grille and roof guard, steel tracks, rear enclosure with mesh grille panels and a black exhaust stack, front levelling jacks, a circular step platform at the feed's mid-height. **The feed beam reads as bare bright metal, not painted.** | **overall layout and material split.** Its compressor bay is oversized for a top-hammer rig — that is the one thing not to copy. Carries a maker's badge and model letters: **do not copy them.** |
| **3.** `C:/Users/henri/Downloads/surface_top_hammer_drill_rigged_01.jpg` | larger top-hammer crawler, front 3/4, feed at ~45° | **working attitude**, mesh rod-store guard cage, louvred rear enclosure, cab position |
| **4.** `.../scratchpad/pdfimg/THB_p60.jpg` (from `top-hammer-drilling-tools-broshure-english.pdf` p.60) | boom + feed + drifter close-up (underground longhole boom, same subassembly family) | **the best component reference**: open feed frame with bright round guide bars, the ~10-hose festoon loop, corrugated hose catenaries, boom-nose rotator casting, hose spring guard, hazard-stripe decal |
| 5. `.../scratchpad/pdfimg/THC_p2.jpg` (from `Tophammer catalog.pdf` p.2) | dust hood close-up on a yellow surface rig, quarry bench | **the dust hood**: black rubber bell on a yellow fabricated duct, corrugated suction hose, bare-aluminium feed extrusion, hose spring guards; and a second rig on the bench behind |
| 6. `.../scratchpad/pdfimg/THB_p16.jpg` (brochure p.16) | small red construction crawler in a rock trench | **the cabless remote-operated variant**: rubber tracks, louvred rear enclosure, rear stabiliser legs, walking operator with a neck-strap control box |
| 7. `.../scratchpad/pdfimg/THC_p32.jpg` (catalogue p.32) | large underground longhole rig, feed at ~45° | open lattice feed frame with parallel tubes and cross-bracing, a large box magazine slung under the feed, corrugated hose loops |
| 8. `.../scratchpad/pdfimg/THC_p17.jpg` and `THC_p11.jpg` | bits, coupling sleeve, shank adapter, rods | **tool materials**: yellow-painted bodies, bare bright machined threads and splines, bare hemispherical carbide buttons |
| 9. `.../scratchpad/pdfimg/THC_p43.jpg` (catalogue p.43) | a finished blasthole in granite | **collar detail**: angular grey cuttings 2–8 mm ringed around the hole, faint spiral rings on the hole wall |

**Swept and found nothing for this class:** `C:/Users/henri/Downloads/Atpa/` —
sampled `atpa-de-slide-3.jpg` and the file listing; it is an ATPA tooling
company's product, factory and logistics photography (drill heads, casing
shoes, bits, a works interior with a steel delivery truck). **No surface
top-hammer rigs.** `catalog_rocktool_english.pdf` holds no embedded photos at all.

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
- **Feed beam length as a published figure**, and the drifter's stroke / travel.
- **The rod-magazine capacity** on the quarry machine (the cage hides it).
- **Whether the small cabless variant uses a cable umbilical or radio remote** —
  brochure p.16 shows a box on a neck strap but the link is not visible.
- **PDF *pages* could not be rasterised on this machine** — poppler / `pdftoppm`
  is not installed. **Worked around it** by pulling the **embedded photographs**
  out of the PDFs with `pypdf` (`page.images`) and viewing those, which produced
  five of the nine photo references in §7. What remains unread is anything that
  lives as **vector line art or a dimensioned drawing on the page** rather than
  as an embedded raster — and a dimensioned general-arrangement drawing is
  exactly the thing still missing from §3. **Installing poppler would let a later
  pass rasterise pages and check for GA drawings.**
- **No rig-maker specification sheet for a top-hammer surface crawler exists in
  the folder at all.** Every PDF supplied for this rig is a **tooling** catalogue
  (bits, rods, shanks, couplings) or a **rotary blasthole** automation brochure.
  If the owner wants sourced absolute dimensions for this machine, the folder
  needs one surface-drill-rig product sheet — that single file would close most
  of this section.

---

## 9. Domain-truth warnings — what the game currently gets wrong

Checked against `src/rig/rigFactory.js` `buildCrawlerTH()` (from ~line 2098).

| # | what the game does | what the material says | fix |
|---|---|---|---|
| **W1** | **The feed is split into two halves stacked by `buildMastStack`** — `buildFeedBeam(stack.lower, mastH*0.5)` + `buildFeedBeam(stack.upper, mastH*0.5)` — i.e. a telescoping mast. | The *section* `buildFeedBeam` draws (two webs, a back plate, an open front, rails outside the section) is **right** and matches catalogue p.2. The **two-stage stack is the problem**: a top-hammer surface rig has a **single one-piece feed beam**. `research/03` §C.1.1: *"a feed beam (a rail) with the hydraulic drifter sliding along it."* Brochure p.60 and catalogue p.32 both show one continuous frame. | Keep the section. Drop the upper/lower split — one beam of full length. The two-stage stack is a piling-rig idiom. |
| **W2** | **`jet-grouting` is in `methods`.** | Already flagged as defect **D4** in `research/16`: *"A screw compressor is not a high-pressure grout pump."* Jet grouting needs a 400-bar grout pump and a multi-tube monitor string `[EN12716]`. | Remove `jet-grouting` from `crawler-th`. |
| **W3** | **Cab is always present** (`cab: { w: 1.05, h: 1.80, d: 1.20 }`). | Brochure p.16 shows the small construction machine of exactly this class with **no cab at all** and a walking operator on a remote box. | Not wrong for the big machine — but if the game ever wants a small/cheap tier of this rig, the cabless remote-control variant is the sourced one. |
| **W4** | **`trackWidth: 0.46`, `gauge: 0.92`, steel-track look.** | Both are plausible for the cabbed quarry machine; the small class runs **rubber tracks** (brochure p.16). | Note only — the game's figures are unsourced either way (§8). |
| **W5** | **Feed rails are modelled but the feed-chain sheaves are not.** `buildCarriage` gets `railX`/`railZ`, but there is no idler wheel at either beam end. | `Surface_Drill_Rig_1000_0001.jpg` shows a prominent **round sheave at the top of the beam**; it is one of the few circular shapes on the whole machine and reads at distance. | Add a sheave at each beam end. |
| **W6** | **`buildDustHood` does draw a skirt plus a suction tube** (`G.tube(..., 0.075, ...)`), but the tube runs only ~1.5 m and **stops in mid-air**; the deck cyclone is a separate `lathe` at `[-0.72, 1.10, -3.60]` and nothing joins the two. | The **corrugated hose between hood and collector is the most recognisable single line on the machine** (`Surface_Drill_Rig_1000_0001.jpg`, catalogue p.2). Also, the hood in catalogue p.2 is a **black flexible rubber bell clamped to a fabricated steel duct**, not a bare lathe skirt, and the hose is **ribbed**, not smooth. | Run the tube all the way to the cyclone; ribbed geometry or a ribbed normal map; add the duct between skirt and hose. Both mounting positions (on the feed, on the deck) are real — pick one and route the hose to it. |
| **W7** | **Hose sets are 4 smooth tubes of r = 0.022–0.05 m, all on the body, none on the feed.** One `addCoiledAirline` exists on the body. | Brochure p.60: the drifter's hoses are a **festooned bundle of ~10 hanging on the feed itself**, and they are what must move as the carriage travels. `Surface_Drill_Rig_1000_0001.jpg`: the coiled spiral hoses are **between boom and feed**, not on the body. | Move the coil and add a feed-mounted hose loop; the body hoses are the least visible ones. |
| **W8** | **Three outriggers** (two front at ±0.95, one rear). | Consistent with brochure p.16 (rear legs visible) — no correction, but the "drilling" pose should visibly **unload the tracks**. | Pose note only. |
| **W9** | **`rodLen = 3.05` m, carousel of 6.** | 3.05 m is at the **bottom** of the sourced range; published extension-rod steps run **3.0–6.1 m**, and the one published field configuration for this exact duty uses **4.3 m GT60 rods** (`research/12` §C.2). | 3.05 m is defensible; 4.3 m is the better-sourced default for bench work. Either way, cite it. |
| **W10** | **`holeMm: '76-127'`.** | Sits correctly inside the sourced top-hammer envelope **28–152 mm** and inside the surface production band **1–5.5 in** (`research/12`, `research/16` §A.4). | **Correct — leave it.** |
| **W11** | **`weightKg: 12500`, `powerKw: 168`, `feedKn: 42`, `drifterKw: 21`.** | **None of these four is sourced** from any file in the folder. | Leave them, but they are guesses; see §8. Do not print them in-game as if they were spec-sheet truth. |
| **W12** | **The rod carousel is a bare cluster of rods** (`buildCarousel` with `rods: 6`). | On the real quarry machine the whole magazine is **inside a perforated mesh guard cage** (`surface_top_hammer_drill_rigged_01.jpg`) — a large flat grey mass that changes the silhouette. | Add the cage; it is cheap geometry and a top-5 identifying feature. |
| **W13** | Naming: **`name: 'Steinbach TH-320 Ridgeline'`.** | Correct approach per `DOMAIN.md` §10 — an invented name, no real badge. | **Correct — keep doing this.** Do not let any real designation from this document (DC125R, GT60, T51, COP, HD) reach a product name or a decal. Thread designations like **T51 / GT60 are industry standards, not brands**, and are safe as *tool* specs; model numbers are not. |
| **W14** | **Two different rod lengths for the same method.** `rigFactory.js` `buildCrawlerTH` sets `rodLen = 3.05`; `data.js` `top-hammer` sets `rodLength: 3.66`. | Both are inside the sourced 3.0–6.1 m band, so neither is wrong — but the rig and the method disagree with each other, and the carousel geometry is built from the rig's number while the drilling cycle is presumably driven by the method's. | Pick one. `research/12` §C.2's field configuration for bench work uses **4.3 m**. |
| **W15** | **The `top-hammer` method in `data.js` is otherwise well set.** `holeDiaRange: [38, 127]`, `nominalDia: 76`, `depthRange: [3, 45]`, `flushMedium: 'air'`, `threadFamily: 'R/T percussion'`, archetypes `quarry-bench / open-pit-bench / infrastructure-corridor / tunnel-portal / urban-plot`. | All of it agrees with the sourced material: 38–127 mm sits inside top hammer's 28–152 mm envelope; air flushing is correct; the archetype list matches `research/16` §A.4 exactly, including urban rock excavation. | **Correct — leave it.** This is the best-sourced part of the rig's data. |

