# rc-rig — Reverse-circulation exploration rig (cyclone + sample train)

status: complete
subject: game rig id `rc-rig` (builder: `src/rig/rigFactory.js`, `buildRCRig`, ~line 4947)
scope: GEOMETRY and MATERIALS reference for modelling. Not a spec sheet, not a sales document.

> **Naming rule (DOMAIN.md §10).** Every manufacturer name and model designation below is
> here ONLY to say where a dimension came from. **None of it may appear on the model** — no
> badge, no decal text, no product name, no recognisable logo silhouette. Model the *shape*,
> invent the *brand*. Where I give a number, the source is named so the modeller can go and
> look at the same picture I did.

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `Downloads/Mineral Exploration Tooling - Catalog.pdf` | 21-24 text; **p.22 rendered at 150 dpi and looked at** | **The single best local source.** p.22 is a full-page studio three-quarter photograph of a crawler-mounted RC exploration rig (Epiroc *Explorac 235*), plus the only local depth rating for the class: *"designed specifically for reverse circulation drilling to depths of 300-400 meters… available for assembly on a truck or crawler chassis"* (p.22). p.21 is RC hammer / bit / dual-wall-pipe text. | **YES — primary** |
| `Downloads/Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf` | 1 page, **scanned, no text layer** — rendered at 150 dpi and read as an image | Trade product-directory page (*Australian Mining*, Jan 2011, journal p.19). Field photo of a **truck-mounted** RC-and-coring exploration rig standing in red dirt with the mast up; plus pullback / torque figures for two exploration rigs, and a supplier listing that names **boosters** as a normal RC-spread item. | **YES — secondary** |
| `Downloads/RC_Hammer_Catalogue.pdf` | 1-9, text (`pdftotext -layout`) | Rocksmith RC hammer / shroud / bit tables. **Tooling only — not one word about the rig.** Genuinely useful for `tools.js` (hammer OD and length, the shroud diameter ladder, bit face type), useless for rig geometry. Also badly typeset: the extractor shuffles headers against values, so cross-check any number taken from it. | Partly (tool only) |
| `Downloads/Mincon-Rotary-Product-Catalog-Condensed-Version.pdf` | 5 pp. | Rotary / tricone product range. **Not RC, no rig.** | **No** |
| `research/02-prospecting.md` | §A2, §E4 | Already the deepest RC write-up in the project: dual-wall pipe construction, air demand, the surface-train component order, sample mass and interval, depth and pace, and the 50-metre core-vs-RC identification test. Cites `[MIN-RC]` and `[BL-RC]` page by page. | **YES** |
| `research/16-site-archetypes.md` | §B.7 `rc`, §A.5, §A.8, source table | Site-level: what stands *around* the rig; splits 6.25-12.5 %; alumina-ceramic-lined cone splitter with a double 25 L drop box rated 3 000 cfm / 750 psi; calico bag size range; 2-3 kg per metre; and the hard rule that **an RC rig cannot be underground**. | **YES** |
| `research/12-oem-rock-tooling.md` | §C.6 | RC hole sizes across the wider family, **133-914 mm (5¼"-36")**; RC hammers do **not** use DTH bit shanks. | Partly |
| `research/10-oem-foundation.md`, `research/11-oem-anchor-geotech-hdd.md` | grep | Their "reverse circulation" hits are **RCD / pile-top foundation drilling** — a completely different machine (a bored-pile rig with an airlift). **False friends. Do not let them contaminate this model.** | **No** |
| `src/rig/rigFactory.js` | `buildRCRig`, ~4938-5210 | The current builder, read for the comparison in §9. | n/a |

| `Downloads/Bauer-Maschinen-Hydraulikschläuche-hydraulic hoses-DE-EN-905-213-1+2.pdf` | 2 pp., text | The hose catalogue the brief pointed at. It is a **foundation-rig** hose catalogue, but the routing idiom is universal and genuinely changes how hoses should be modelled: hose **packages** running bulkhead-plate to bulkhead-plate through a **deflection guide**, electric cable inside the bundle, the whole thing inside a **fabric hose bag**, crimped ferrules stamped with the part number. Bore ranges and pressures in §4.12. | **YES (routing idiom)** |
| `Downloads/surface-drill-rig-…-smartroc-d65-3d-model-….webp`, `Downloads/Surface_Drill_Rig_1000_0001.jpg` | looked at | **Not RC** — surface top-hammer/DTH blasthole crawlers. Kept as a *materials* reference for what a fat black corrugated hose into a cone-bottomed collector looks like. See §7. | Analogue only |
| `Downloads/Rotary_Drilling_Rig_1000_0001.jpg` | looked at | A **foundation rotary/CFA kelly rig**. Checked and rejected — wrong machine entirely. | **No** |
| `Downloads/Atpa/**` (incl. `IMG_20250319_090942.JPG`) | swept, samples looked at | Casing shoes and ring bits on pallets — overburden/foundation tooling. **No RC rig anywhere in the folder.** Useful only as a surface reference for fabricated drilling steel. | Materials only |

## 2. What the machine IS

A **reverse-circulation exploration and grade-control drill**: a self-propelled crawler
(or truck-deck) rig whose entire purpose is to punch **90-146 mm holes to 300-400 m**
quickly and deliver **dry rock chips** to surface up the *inside* of a dual-wall pipe. The
rock is broken by a **down-the-hole hammer at the bottom of the string**, not by the rig,
so the machine on the surface is essentially a **feed frame, a rotary head and a rod
handler** — it supplies rotation, hold-back and thrust, and it has nowhere near the torque
or the mud plumbing of a foundation or a core rig. Air goes **down the annulus** between
the two pipe walls, crosses at the bit, and the cuttings come **up the centre tube**, sealed
from the hole wall the whole way (`research/02` §A2). That is the whole trick, and it is why
the rig is only half the spread: an RC hammer wants roughly **25.5 m³/min at 24.1 bar
(900 cfm @ 350 psi)** (`research/02` §A2, citing `[MIN-RC]` pp.8-9), which is a
trailer-or-truck-mounted primary compressor standing alongside, plus frequently a
**booster** for deep or wet holes. It works standing on **four vertical jacks with the tracks
lifted clear**, on a cleared exploration pad or an open-pit bench, and it is drilled from the
**front** of the machine, off the end of the deck. The site is **dusty, not wet** — the
50-metre test against a core rig (`research/02` §E4) is exactly this: cyclone and bag rack
hanging off it, a fat hose looping from the head down to the cyclone, and a compressor the
size of a shipping container parked alongside. **It is never underground** (`research/16`
§B.7 — the dust load and the sample train do not fit in a 5 m drive).

## 3. Proportions

### 3a. What is actually sourced

| Quantity | Value | Source |
|---|---|---|
| Depth rating (the size of machine this is) | **300-400 m** for RC | `Mineral Exploration Tooling - Catalog.pdf` **p.22** |
| Chassis | *"available for assembly on a **truck or crawler chassis**"* — the same drill module goes on either | same, p.22 |
| Rotary-head load rating | **30-40 tonnes** radial + axial, head swings **±90° from vertical for fan drilling** | `Mincon-RC-Solutions-2025-A4-WEB.pdf` **p.13** (DQ8000 MK3) |
| Pullback, comparable exploration rigs | **21.5 t** (truck-mounted RC-and-coring rig) and **132 kN ≈ 13.5 t** with **5 456 Nm** rotation (heli-portable modular surface exploration rig) | `Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf` p.1 (journal p.19) |
| Heaviest single module of a heli-transportable rig of this family | **680 kg** | same |
| Drill pipe on the rack | dual-wall, **3½", 4" and 4½" OD**, in **1.5 m, 3 m and 6 m** lengths | `research/02` §A2 citing `[BL-RC]` p.6 |
| Hole size | **90 mm and 124 mm** standard; **86-165 mm** across the bit range; RC family overall 133-914 mm | `RC_Hammer_Catalogue.pdf` pp.1-9; `research/12` §C.6 |
| Hammer at the bottom of that string | OD **82-132 mm**, length **1 063-1 363 mm** without bit, **27-87 kg** | `research/02` §A2 citing `[MIN-RC]` pp.8-9 |
| Hammer (second source, same class) | OD **81-122 mm**, length without bit **1 142-1 279 mm**; shroud OD ladder **84.1-200 mm** | `RC_Hammer_Catalogue.pdf` pp.1-9 |

### 3b. Ratios measured off the photograph

I measured the silhouette of the rig on `Mineral Exploration Tooling - Catalog.pdf` **p.22**
by rendering the page at 300 dpi and taking the extent of non-white pixels row by row.
**Caveat, stated plainly: this is a three-quarter studio view, so anything running
front-to-back is foreshortened.** Ratios in the *vertical* plane are trustworthy; ratios
mixing vertical and depth are indicative only. No absolute dimension is published on that
page, so **all absolutes below are NOT SOURCED** (§8) — these are shape ratios, which is
what the brief says matters more anyway.

| Measured (300 dpi pixels) | Value | Ratio |
|---|---|---|
| Mast crown (top sheave bracket) to jack feet | 2 219 px | **1.00** (reference) |
| Mast crown down to deck level | 1 380 px | **0.62 of standing height** |
| Deck level down to ground | 839 px | **0.38 of standing height** |
| Mast length along its own axis (crown to mast foot) | ≈2 084 px | **0.94 of standing height** |
| Mast rake in this frame, from vertical | ≈**19°** | leaning back over the deck |
| Overall silhouette width (3/4 view, jack pad to jack pad incl. mast overhang) | 1 622 px | **0.73 of standing height** |
| Mast structural width (side face, mid-mast) | ≈250 px | **0.11 of standing height** — i.e. the mast is roughly **8-9× longer than it is wide** |
| Rod-handling arm at full reach, beyond the mast | out to 2 007 px at dy 900 | reaches **~0.55 of standing height** sideways from the mast |

**The two numbers a modeller should actually hold on to:**
1. **Mast above deck : deck to ground = 1.64 : 1.** The mast dominates; the carrier is a
   little more than a third of the standing height.
2. **Mast slenderness ≈ 8.5 : 1.** It is a long, thin, open truss — not a stubby beam.

## 4. Component inventory

Everything below is read off `Mineral Exploration Tooling - Catalog.pdf` **p.22** (the rig
photograph, examined at 300 dpi in four crops), the exploded CAD render on
`Mincon-RC-Solutions-2025-A4-WEB.pdf` **pp.12-13**, the field photo on
`Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf` p.1, and the two research packs.
Where I am reading a picture rather than a caption, I say so.

### 4.1 Mast — a LATTICE TRUSS, telescoping, chain feed

**The single biggest thing to get right, and the current game model gets it wrong (see §9).**
On p.22 the mast is a **welded open lattice**: parallel chord rails with **diagonal X-web
members** between them, visible as open triangles against the white background right up the
length. It is **not** a closed box-section feed beam. It is a **two-stage telescope** — an
inner section slides within/alongside the outer, and the two are visibly different sections
at the overlap.

- **Feed:** **two heavy roller/leaf chains**, one down each outer face, exposed for their
  whole length, over sprockets at the crown. Visually a continuous fine-toothed dark band
  down both edges of the mast.
- **Crown:** a black fabricated head frame carrying (a) the chain sprockets, (b) a
  **cantilevered jib arm projecting forward past the mast top** with a sheave at its end, and
  (c) a **winch line hanging from it with a swivel hook**. That free-hanging hook is one of
  the most recognisable details in the whole photograph.
- **Why it matters visually:** the open web lets sky through. At silhouette size the mast
  reads as a *ladder*, not a bar. A solid beam kills the machine's identity instantly.

### 4.2 Rotary head and carriage

A bulky **gearbox body with a conical bell lower housing**, riding a carriage on the mast
rails, with a splined dark spindle below. On the OEM rig the head is painted in the machine
colour while the mast is grey — the head is the one bright, complicated object moving up and
down a plain structure, so it carries most of the eye. Rated **30-40 t axial and radial** and
**swings plus/minus 90 degrees from vertical for fan drilling** (`Mincon` p.13), so the
head-to-mast joint must read as a rated pivot, not a bracket.

> **THE HEAD IS NOT COAXIAL WITH THE MAST, and the model got this wrong until
> 2026-09-06.** The carriage rides rails on the mast's FRONT face, so the axis
> the string actually turns on stands clear in front of the mast structure — on
> `Mineral Exploration Tooling` p.22 the rod clamp / breakout assembly at the
> mast foot is visibly proud of the lattice on the same working face. The model
> had `mount:hole`, the rod guide, the breakout table and both clamp levels on
> the mast CENTRELINE and the spindle 0.79 m in front of them, at every feed
> position. **No published RC drawing dimensions that setback** — see §8 — so it
> is derived from the model's own head geometry and marked `NOT SOURCED`. Full
> evidence, the two repair scopes and the decision: `rc-axis-repair.md`.

### 4.3 The RC plumbing at the head — what makes it RC and not a rotary rig

In flow order (`research/02` §A2 from `[BL-RC]`; shapes from `Mincon` pp.12-13):

1. **Combination / dual swivel** — one rotating joint carrying **two flow paths**: air in,
   sample out. A stepped chrome shaft inside a compact housing.
2. **Head wear tube / BBBD assembly** — a long straight tube with **bolted flanges along its
   length** and a **90 degree bend** at one end, running alongside the head; blow-back is a
   sliding hydraulic cylinder on it.
3. **Deflector box** — a heavy fabricated wedge-shaped body with a bolted flange face and a
   smooth **90 degree internal path**. This is where the sample turns from vertical to
   horizontal and leaves the rig.
4. **Knock-on hose tail** — a **3 inch or 4 inch** tapered steel tail with a coarse
   retaining nut.
5. **Sample hose** — `research/16` §A.8 calls it a **fat corrugated hose**, looping from the
   head down to the cyclone. Thick, sagging, and **ribbed**, not smooth.
6. **Sample hose reel** and **sample support arm** — the reel takes hose up as the head
   travels; the support arm is a heavy hydraulically-articulated arm holding the loop clear
   of the ground and out of the working area.

**Why it matters visually:** a rotary rig and an RC rig share a mast, a head and a carriage.
The *only* things that say RC are the fat corrugated hose leaving the head **sideways** and
where that hose goes. Model it leaving from a **box on the side of the head**, never from the
top.

### 4.4 Cyclone and splitter — CANTILEVERED OFF THE DECK, not only a free-standing tower

`research/16` §A.8 is explicit: the cyclone-and-splitter assembly is *"cantilevered off the
rig deck with a fat corrugated sample hose looping into it"*, in a cloud of dust. The
`Mincon` pp.12-13 render shows how: a **slew/pivot base plate bolted to the deck**, a heavy
fabricated **support arm** with a **hydraulic cylinder** to deploy and level it, and the
cyclone hanging on the end of that arm. *"Automatic deploy, restore, and leveling options"*
(`Mincon` p.13) only make sense for a rig-mounted arm.

Cyclone geometry, read off the render, top to bottom:

- **Inlet head / wear bend** — a fabricated box at the top with a **tangential inlet flange**
  on one side. This is the alumina-ceramic-tiled wear bend.
- **Barrel (drum)** — a squat cylinder, roughly **as tall as it is wide**, bolted flanges top
  and bottom, with a **hinged inspection lid on gas-assist struts** and **over-centre lever
  locks** on top (`Mincon` p.13).
- **Cone** — a long taper below the barrel, in the render about **1.5-1.6 times the barrel
  diameter** in length, down to a small outlet.
- **Vibrators** — *"multi heavy-duty vibrators: assist in un-clogging of damp sample"*
  (`Mincon` p.13): small drum-shaped motors bolted to the cone. Visible lumps, not smooth.
- **Below the cone** a flat sloping **chute plate** into the **splitter / drop box**, whose
  face carries **red-handled levers** in the render.

**Splitter** (`research/16` §B.7): cone type, **alumina-ceramic-lined**, **double 25 L drop
box**, **bolt-in 4/6/8/10 % blades**, working splits **6.25-12.5 %**, rated **3 000 cfm /
750 psi**.

**Both patterns exist in the field, and this doc records both:** the deck-mounted arm above
(grade control, in-pit, and every modern conversion kit) *and* a **separate free-standing
cyclone stand** beside the rig on deep exploration spreads. The game currently builds only
the second. If the game keeps the stand, the arm still has to exist somewhere and the hose
still has to reach.

### 4.5 Sample handling on the ground

- **Calico bags** — drawstring cloth, standard sizes **200x300 mm up to 600x900 mm**,
  pre-numbered or barcoded, **2-3 kg of chips per metre**, normally **one sample per metre**
  (`research/16` §B.7; `research/02` §A2). `research/16` §A.8 says they are **laid out in
  rows on the dirt**, one or two per metre drilled. A bag *rack* is a convenience; the rows
  on the ground are what the photograph shows.
- **Bulk reject pile** — everything that did not go into a bag, growing all shift under the
  splitter.
- **Chip trays** — *"long, thin plastic cases with a row of half-cup size sections"*, one
  section per metre (`research/02` §A2). The RC equivalent of a core tray, and a completely
  different-looking prop: shallow, sectioned, plastic — not a timber core box.

### 4.6 Rod handling and the rod rack

On p.22 the rods lie **horizontally in a rack along the deck** — a bundle of plain grey tubes
between upright stanchions, running most of the deck length. Alongside the mast is a
**rod-handling arm**: a long straight tube with its own hydraulic cylinder strapped to it,
hinged near the head end of the mast, reaching **out and up** to about **0.55 of the
machine's standing height**, ending in a gripper. It is painted in the machine colour and is
one of the few bright objects away from the body.

**There is no rod carousel on this machine.** Rods come off a **deck rack via a swinging
arm**. On the truck-mounted rig in the *Australian Mining* photo the rods likewise lie on the
truck deck behind the mast. (A carousel is a core-rig and a tophammer-rig idiom.)

### 4.7 Deck, guarding, access, cab

- A **flat working deck** over the tracks; the drill centre is off the **front** of the
  machine, forward of the tracks.
- **Perforated guard panels** — the most characteristic guarding detail in the photograph:
  flat dark plates with a **regular grid of round holes** on a square pitch, standing
  vertically at the deck edge beside the mast and at the rear corner. Not woven mesh, not
  expanded metal: **punched round holes**.
- **Louvred power-pack enclosure** — the engine box on the deck has **horizontal pressed
  louvre slots** in groups in its side panels, plus a separate darker panel carrying the
  maker's badge (do not reproduce the badge).
- **Access stair** — an open stepped ladder frame with handrails at the rear quarter, light
  in colour against the machine.
- **Handrails and stanchions** along the deck edge, plain round tube.
- **No operator cab on the crawler machine.** The p.22 rig has **no cab at all** — it is run
  from a control stand at deck level and, per `Mincon` p.13, optionally by **remote control /
  in-cab joystick with PLC** where a cab exists. The truck-mounted rig in the *Australian
  Mining* photo has the **truck's own cab**, forward, facing away from the drill. This is a
  real fork in the class: **crawler = no cab; truck = cab at the far end, unrelated to the
  drill.**

### 4.8 Undercarriage

Excavator-style crawler: **triple-grouser steel track shoes**, a **plain drum idler at the
front**, a **toothed sprocket at the rear**, track frames as heavy grey box beams with the
bottom rollers tucked inside so they barely read from the side, and a **track guard over the
top run**. In the photograph the shoes are dark grey with the wear faces polished bright.

### 4.9 Jacks — vertical, outboard of the tracks, tracks lifted clear

Four **square-section vertical legs** dropping straight down at the deck corners, **outboard
of the track width**, each with a large **dished round foot pad** and its own hydraulic hose.
In the photograph the machine **stands on the jacks with the tracks off the ground** — that is
the working stance and it changes the whole silhouette (the tracks hang; they do not carry).
Not swing-out outriggers, not a dozer blade.

### 4.10 Hose routing

Three distinct hose populations that must not be confused:

1. **Hydraulic hoses** — small bore, in **tight parallel ranks**, running from the power pack
   forward along the deck and up the mast in a clipped tray run, plus a bright
   **spiral-wound flexible conduit** looping to the moving head so it can follow the
   carriage. Black with coloured tracer bands, clipped in ranks. (p.22, mid crop.)
2. **The sample hose** — a single **fat 3-4 inch corrugated hose**, an order of magnitude
   fatter than any hydraulic hose on the machine, hanging in a lazy loop from the head box to
   the cyclone inlet. If the model shows only one hose, this is the one.
3. **Air bull hose from the compressor** — lying on the ground from a separate machine to the
   rig. The trade page in the same folder
   (`Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf` p.1, "Drill hoses") gives it
   concretely: **2 inch and 1.5 inch bore, 1 300 psi and 1 450 psi working pressure, two
   braided layers of high-tensile steel wire under an abrasion-resistant synthetic rubber
   cover**, with non-skive couplings. So: thick, matte black rubber, stiff, with big swaged
   steel end fittings.

### 4.11 The rest of the spread — the machine is only half of it

`research/02` §E4 and `research/16` §A.8: a **primary compressor** delivering ~25.5 m3/min at
24.1 bar, trailer or truck mounted; frequently a **booster** on its own skid or truck for deep
and wet holes; a **support truck with fuel and water tanks and a crane**. *"A diamond pad does
not have a compressor truck"* (`research/16` §A.8). A pad with two or three vehicles on it is
the correct picture; a lone rig is not.

### 4.12 How hoses are actually routed on a drilling machine (Bauer hose catalogue)

`Downloads/Bauer-Maschinen-Hydraulikschläuche-hydraulic hoses-DE-EN-905-213-1+2.pdf` (2 pp.)
is a foundation-rig hose catalogue, not an RC one, but the **routing idiom is universal** and
it is the local source the brief pointed at. It changes how the hoses should be modelled:

- Hoses are sold and fitted as **packages**, not as individual lines: a *"main hose package —
  from hose deflection to bulkhead"* with **six main working lines** plus high-pressure lines,
  and a separate *"mast hose package — from bulkhead base carrier to bulkhead rotary drive"*.
- So the geometry is: **bulkhead plate → bundle → hose-deflection guide → bundle → bulkhead
  plate.** Model a flat **bulkhead plate with a row of bulkhead unions** where the bundle
  crosses from carrier to mast, and a **deflection roller/guide** where the bundle turns. Do
  not model dozens of independently wandering hoses.
- The bundle carries the **electric cable inside it** and is wrapped in a **flat tarpaulin /
  hose bag** (*"Neue Flachplane"*, *"New hose bag"*) — a fabric sleeve, not bare hoses. That
  is a distinct material: dark, matte, slightly slack, with a different silhouette from
  rubber.
- Bore range for the sizes that matter here: **suction hose NS 25-100 mm**; two-layer
  low-pressure **NS 6-75**; six-layer high-pressure up to **NS 25**; **R15 420 bar hose
  NS 32-50**, lengths up to **120 m**. Temperature range **-55 °C to +150 °C**.
- Fittings are **press-fit (crimped) ferrules** with the part number stamped on the ferrule —
  so every hose end is a short knurled steel sleeve, not a clamp.

## 5. Distinctive features — what identifies this class at thumbnail size

In priority order. If the model only gets three things right, make them 1, 2 and 3.

1. **A fat corrugated hose leaving the head sideways and looping down to a cone.** No other
   drill has this. It is the whole method made visible: sample out of the head, along a
   sagging ribbed loop, into a cyclone. `research/02` §E4 makes it the 50-metre identification
   test, and `research/16` §A.8 puts it in a cloud of dust.
2. **A cone hanging in the air with bags under it.** The cyclone-plus-splitter, whether
   cantilevered off the deck or on its own stand, puts a large inverted cone at head height
   with small pale sacks beneath it. A cone silhouetted above bags is unmistakable.
3. **A long, slender, OPEN-WEB mast** — roughly 8-9 times longer than it is wide, with sky
   visible through diagonal bracing, twin exposed chains down the edges, and a small jib and
   hook projecting past the crown.
4. **The machine standing on four vertical jacks with the tracks hanging clear**, jacks
   outboard of the track width on round dished pads. It is jacked up, not sitting down.
5. **A second machine on the pad.** The compressor (and often a booster and a support truck)
   is part of the read. `research/16` §A.8: *"A diamond pad does not have a compressor
   truck."* At thumbnail size, one machine plus a container-sized box beside it says RC;
   one machine alone says core.

**Anti-tells — if the model has these, it is reading as the wrong machine:**
- a **mud pit, sump or water tank** (that is the core rig; the RC site is dusty)
- a **thin wireline over a crown sheave** and **timber core trays on trestles** (core rig)
- a **kelly bar, auger or casing oscillator** (foundation rig)
- a **solid plank-like mast**
- **any of it underground** (`research/16` §B.7 — impossible for RC)

## 6. Materials and paint

**Painted steel — most of the machine.** On the reference rig (`MET` p.22) the livery is
split, and the split is structural, not decorative:

- **Machine colour (bright, saturated)** on everything that is *equipment*: the power-pack
  enclosure, the tanks, the rotary head, the rod-handling arm, the mast-foot hood, the small
  guards and covers.
- **Grey / dark grey** on everything that is *structure*: the **whole mast**, the deck
  beams, the track frames, the jack legs, the rod rack stanchions. This two-value split is
  most of why the machine reads as built rather than moulded. **A mast painted the same
  value as the body silhouettes as one flat shape and kills the truss.**
- **Black** on the crown head frame, the chain, the perforated guard plates and the badge
  panel.

**Bare / worn steel.** The chain running faces, the mast rails where the carriage rollers
run (polished to bright metal in two continuous stripes down the mast — a very cheap, very
convincing detail), the track shoe grousers where they touch ground, the rod bodies in the
rack, the hose-tail and knock-on nut, the exposed threads on subs. Local reference for what
new fabricated drilling steel actually looks like: `Downloads/Atpa/IMG_20250319_090942.JPG`
— black mill scale with an oily sheen, bright machined threads, visible weld beads.

**Chrome.** Cylinder rods only, and only the exposed stroke: jack rods, mast-dump ram,
carriage/feed rams, rod-arm cylinder. Bright, and dirty at the wiper.

**Rubber.** The sample hose (fat, matte black, **corrugated**), the air bull hoses, hydraulic
hose covers, jack foot pads, cab door seals. Nothing on this machine is glossy rubber.

**Ceramic and urethane — the wear parts, and they are a different family of surfaces.**
`Mincon` p.13: cyclone wear bend **alumina ceramic tiles**; barrel/drum **alumina ceramic
vortex scroll**; base cone **polyurethane 60 shore**. Ceramic reads pale grey-white, matte,
tiled/faceted; the urethane cone liner reads as a dull coloured (often red, tan or black)
soft-looking sleeve. These are only visible with the inspection lid open, but they justify
making the cyclone's interior a different material family from its shell.

**Glass.** Only if a cab exists. The crawler reference has **no cab and therefore no glass**
(see §4.7).

**Where dirt, dust and wear actually accumulate on a working RC rig** — and this is the one
place RC differs sharply from every other rig in the game:

- **Everything is grey rock dust, not mud.** `research/02` §E4: *"The core rig site is wet;
  the RC site is dusty."* Fine pale dust settles on every upward-facing surface: deck plate,
  the tops of the power-pack box, the top face of every horizontal beam, the tops of the rod
  rack rods, the jack pads.
- **A dust cone around the collar.** The heaviest deposition is a rough circle on the ground
  around the hole, thinning outward, with the reject pile downwind of it.
- **The cyclone and everything under it is the dirtiest object on site** — dust cakes on the
  cone exterior, streaks down from the inspection lid seam, and the splitter and drop box
  are packed with chips.
- **Bags and chip trays are dusty, and the bags are pale cloth** — they are the lightest
  objects in the scene and they collect a uniform film.
- **Rust** shows on the mast where the paint has been rubbed by the carriage and the rods, at
  every weld the paint has cracked over, on the breakout table jaws, and on the deck where
  rods are dropped. **Not** general rust — the machine is a working asset, so rust is local
  to impact and abrasion.
- **Grease** at the head, the rod-arm pivots and the jack pins — dark, thrown in radial
  streaks by rotation.
- **Oil staining** on the deck plate under the power pack.
- **Track frames carry caked ground material** from tramming, but note the rig has been
  jacked up: the tracks are *not* the dirtiest part of an RC rig the way they are on a
  foundation machine, because the rig moves rarely and short distances between holes on a
  grid.

## 7. Photo references in `C:\Users\henri\Downloads`

### Genuinely this class

| Reference | What it is good for |
|---|---|
| **`Mineral Exploration Tooling - Catalog.pdf` p.22** — full-page studio three-quarter photo of a crawler RC exploration rig | **The primary reference. Use this one.** Whole-machine proportions, the lattice mast with twin chains, the crown jib and hook, the rotary head and carriage, the deck rod rack, the rod-handling arm, the perforated guard panels, the louvred power-pack box, the access stair, the crawler details, and the four vertical jacks with the tracks lifted clear. Render it yourself with `pymupdf` at 300 dpi — the detail is there. |
| **`Mincon-RC-Solutions-2025-A4-WEB.pdf` pp.12-13** — exploded CAD render of a complete RC conversion kit on a dark blue ground | The only local source that shows the **RC-specific hardware as geometry**: deflector box, combination swivel, head wear tube with flanged joints, hose tails and knock-on nuts, and — most valuable — the **cyclone with its slew-base support arm and hydraulic deploy cylinder**, its barrel/cone proportions, its inspection lid, and the splitter below it. Colours are OEM CAD blue; ignore them. |
| **`Mincon-RC-Solutions-2025-A4-WEB.pdf` pp.6-7** — RC hammer product render and cutaway callouts | The tool at the bottom of the string: a long slim tube, stepped adapter sub at top, bit at the bottom. Good for `tools.js`, not for the rig. |
| **`Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf` p.1** — scanned trade page, field photo in red dirt | The **truck-mounted** variant of the same class, on a real site with real light and real dust. Low resolution and halftone-screened, so use it for stance, setting and colour, not for detail. |

### Useful analogues that are NOT this machine — cite them for surfaces, never for shape

| Reference | Why it helps | Why it must not be copied |
|---|---|---|
| `Downloads/surface-drill-rig-for-quarrying-and-mining-smartroc-d65-3d-model-77345d1f1d.webp` | The best local picture of a **fat black corrugated hose running into a cone-bottomed collector** — exactly the read the RC sample hose and cyclone need. Also good crawler track, jack and hose-bundle detail on an air rig in the same livery family. | It is a **surface top-hammer / DTH blasthole crawler**: boom-mounted feed, box-section feed beam, cab, dust collector — not a sample train. Wrong machine. |
| `Downloads/Surface_Drill_Rig_1000_0001.jpg` | Same class as above, clean studio render; useful for boom/feed hardware and coiled hose bundles. | Same reason. Not RC. |
| `Downloads/Atpa/IMG_20250319_090942.JPG` (and the rest of `Downloads/Atpa/`) | **Materials only** — what real fabricated drilling steel looks like in daylight: black mill scale with an oily sheen, bright machined threads, weld beads, weathered timber. | The Atpa folder is **casing shoes and ring bits** — overburden/foundation tooling. No RC rig anywhere in it. |

### Checked and rejected

- `Downloads/Rotary_Drilling_Rig_1000_0001.jpg` — a **foundation rotary/CFA piling rig** with a
  kelly bar and auger. A false friend: it is what "reverse circulation" means in the
  foundation packs (`research/10`, `research/11`), and it is a completely different machine.
  Do not use it for this rig.
- `Downloads/Mincon-Rotary-Product-Catalog-Condensed-Version.pdf` — rotary/tricone bits, no rig.
- `Downloads/RC_Hammer_Catalogue.pdf` — tables only, no photographs of a rig.
- `Downloads/Atpa/**` swept — drilling tools and casing shoes, no rig photographs.

## 8. NOT SOURCED

> ### RESOLVED 2026-09-05 — a dimensioned GA of a tracked RC rig does exist
>
> This section's headline claim — that no dimensioned general arrangement of
> any RC rig was found — is **no longer true**. Two manufacturer brochures
> carry a dimensioned three-view of a tracked RC exploration rig, and both are
> now cited in `blender/rc_rig.py`'s header with their URLs.
>
> **[E235] Epiroc Explorac 235**, doc 9868 0310 01f, brochure **p.7** — a
> dimensioned 3-view in BOTH working and transport pose, spec tables pp.4-6.
>
> | dimension | value |
> |---|---|
> | Transport L x W x H | **11 100 x 3 450 x 4 640 mm** |
> | Height, mast erected 90 deg | **11 220 mm** (8 050 at 45 deg) |
> | Track shoe / grouser | **500 mm** |
> | Feed stroke / pullback | **7 680 mm** / 220 kN |
> | Operating weight | **46 500 kg** GMM (min 35 100) |
> | Engine / compressor | 522 kW / 555 l/s at 35 bar (1 250 cfm at 510 psi) |
> | Rods | **6 m (20 ft), OD 4.5 in (114.3 mm)**, 50 in the rack |
>
> **[E100] Epiroc Explorac 100**, doc 9868 0018 01f (2022-10), lettered GA on
> **p.7** with its letter table on **p.6**: A overall height mast erected
> **7 840**, B overall length working **6 120**, D transport height **2 980**,
> E transport length **7 730**, F transport width **2 240** without rod rack /
> **2 800** with. Weight 14 400 kg, feed travel 4 400 mm, rods 3 m OD 114.3 mm.
>
> **Section 9.A's lattice-truss instruction is now backed by a drawing.** The
> [E235] mast on p.7 is unmistakably an open lattice with diagonal web bracing
> between two chords along its full length. The [E100] mast on its p.7 is a
> plain closed box beam. So **lattice-vs-box splits by size class and both
> answers are sourced** — big, deep-capacity, 6 m rods, on-board ~1 250 cfm
> means lattice.
>
> **What the model measures against that, verified per primitive, not assumed.**
> `glbinfo` reports 7.883 x 7.215 x 7.857 (re-measured 2026-09-06; this line
> read 7.883 x 7.214 x 7.606, from before the working-axis repair took the
> length to 7.857). The MACHINE lies inside
> x = +/-1.561 — 3.12 m over the deployed jacks, between [E100]'s 2.80 and
> [E235]'s 3.45, and **not too wide**. The 7.883 m bounding box is the site
> spread: the free-standing cyclone stand, the calico bag rows, the chip trays
> and the reject pile out at x = +5.250, plus the bull hose at -2.633. That is
> correct content in the wrong NODE, not in the wrong place — and there is no
> blender-side lever for it, because `src/core/gltfRig.js` derives `prep.size`
> and `prep.radius` from the whole scene graph with no exclusion.
>
> ### STILL NOT SOURCED after both GAs — 2026-09-06, REWRITTEN THE SAME DAY
>
> **Conclusion unchanged: neither GA dimensions the rotary head's standoff from
> the mast, and neither places the bore relative to the carrier.** Everything
> this note said about *why* was wrong, and is replaced. What it said:
>
> > *"A sweep of the whole local catalogue library found no dimensioned GA of
> > any RC rig, and both Epiroc PDFs now return HTTP 403 … The transcriptions
> > above are all anybody has."*
>
> The first clause contradicts the table immediately above it, which is a
> transcription of two dimensioned GAs. The second is a request-header problem
> mistaken for an access wall. Corrected, with the work actually done:
>
> 1. **The brochures are reachable.** `Invoke-WebRequest` with only a browser
>    User-Agent gets 403; `curl` sending `Referer` plus `Sec-Fetch-Dest/Mode/
>    Site` gets **HTTP 200** on both (2 022 709 B and 930 680 B). Both read.
> 2. **`Mineral Exploration Tooling` p.22 IS the Explorac 235** — captioned so
>    on the page, and §1 of this document already recorded it. The primary
>    SHAPE reference and the primary DIMENSION reference are **the same
>    machine**, which nobody had noticed, which is why nobody had tried scaling
>    the standoff off a drawing of the rig in the photograph.
> 3. **[E235] p.7 is pure vector** (38 837 paths, no raster, no resolution
>    ceiling) and **it is genuinely to scale**: 8 800 mm over 190.096 pt =
>    46.293 mm/pt and 11 220 mm over 239.386 pt = 46.870 mm/pt, agreeing to
>    0.6 % when measured arrowhead-tip to arrowhead-tip. The third callout,
>    11 050 mm, reads 4 % off because it is the *mast's own total length
>    including jib boom* (p.6) drawn as the horizontal projection of the
>    lowered mast: 226.947 pt × 46.58 = 10 576 mm = 11 050 × cos 16°.
> 4. **And it still carries no dimension to the drill axis.** Every callout is
>    an envelope or a component figure — erected heights, mast length, working
>    and transport lengths, width, plus a balloon giving 500 mm shoe and
>    640 / 330 / 150 mm jack clearances. Traced on the vector, the two
>    dimensions nearest the drilling end have their arrowhead tips at x =
>    972.506 and 1009.215 pt and their extension lines run up into white space
>    beside the envelope extremes; neither lands on a centreline.
> 5. **Scaling it off the illustration was attempted and refused.** The working
>    elevation is a shaded render of a PARKED machine — no string, no bit, no
>    centreline. Choosing "the mast centreline" means choosing between chords,
>    front rails, carriage and parked head, and at 46.6 mm/pt one POINT of that
>    choice is 47 mm of answer. Readings ran 0.16 m to 1.02 m depending on the choice — a
>    6× spread. A choice, not a measurement. See `rc-axis-repair.md` §6.2.
>
> **What the GAs DID settle:**
>
> - **[E235] mast fore/aft silhouette depth 0.95–1.00 m** — 20.45–21.43 pt
>    across, read at five clean heights, at 46.29–46.87 mm/pt. Call it 0.97 ±
>    0.03 m. Partly closes the "mast cross-section" gap below — depth only, and
>    only for the [E235] size class.
> - **Its slenderness is 11 050 / 0.97 = 11.4 : 1** (11.0–11.6 across the depth
>    spread), against the **8.5 : 1**
>    §3b measured off the photograph **of the same machine**. A raked
>    three-quarter studio shot reads the mast about 34 % deeper than it is.
>    §3b's slenderness ratio should be treated as a photographic impression,
>    not a proportion to hold; `blender/rc_rig.py` has withdrawn its claim that
>    the ratio is "held exactly".
> - **[E100] letter C = 2 740 mm, a TRANSPORT dimension**, listed with D, E and
>    F. This note hoped C might be "a working radius or a bore position, which
>    is exactly the gap above". It is not. Gap still open, door now shut.
> - **Size class, sharper.** [E235]: holes **150–200 mm**, spindle 114 mm
>    4.5"-IF, feed travel 7 680 mm, drilling angle 45–90°, slipstable max
>    opening 296 mm, GMM 46 500 / operating 36 200 / min 35 100 kg. [E100]:
>    holes **127–165 mm**, rods 114.3 and 101.6 mm OD, depth 250 m, "a
>    mechanized breakout table … fitted as standard which guides and locks rods
>    hydraulically", 30-rod positionable rack. The model's 124 mm hole and
>    114.3 mm rod sit in [E100]'s band, **below** [E235]'s.
>
> **The Bauer comparator, with its caveats, because they get dropped when this
> is summarised.** Where a bore-to-mast figure is published at all it is
> drill-axis to mast **FRONT FACE**, or drill-axis to **slew centre** ("reach" /
> "working radius"). Nobody publishes drill-axis to mast structural
> centre-plane. The one located instance of the front-face form is **Bauer
> BG 36 H / BS 95, doc 905.868.2 (12/2020), printed p.16** — *"Drilling axis
> 1,100 mm (without upper Kelly guide) / 1,400 mm (with)"*, arrow landing on the
> leader front face. **A foundation kelly rig, NOT this class**: cite it for the
> convention only, never let 1.40 m migrate onto an RC rig. This model's
> front-face equivalent is 0.46 m — **2.4× to 3.0× SMALLER** than those
> figures, so it is not corroboration of anything.
>
> **Left open on purpose, not guessed:** the machine is built at [E100] SIZE
> (5.45 m mast, 3.05 m rods, 7.2 m erected against 7.84, 7.857 m long against
> 7.73) but with [E235] FEATURES (open lattice mast, on-board power-and-air
> pack). Those belong to different size classes. Committing to [E235] means
> re-scaling by ~1.45 and going to 6 m rods; committing to [E100] means tearing
> out the lattice this document asked for. That is a design decision with real
> consequences either way and it is not made here.
>
> **Still NOT SOURCED:** mast cross-section WIDTH for any machine in the class
> — no manufacturer publishes it, and a side elevation cannot show it. (Mast
> **depth** is no longer in this list: 0.97 ± 0.03 m, measured off [E235] p.7's
> vector at 46.3–46.9 mm/pt — see the block above. It is the [E235] size class,
> so it does not transfer to this model's [E100]-size mast without the
> size-class decision being made first.) Also still NOT SOURCED: track gauge as
> distinct from overall width; cyclone STAND height (barrel diameter and body height are
> published, e.g. Multi-Power PI at 27.5 in barrel / 36 in body for 1 150 CFM,
> which is the right band for a 1 250 cfm rig).


This list is as important as the findings. **Nothing below may be invented and presented as
fact.** Where the model needs a number that is here, it must be declared as a modelling
choice, not a specification.

**No dimensioned drawing or general arrangement of any RC rig exists anywhere in
`C:\Users\henri\Downloads`.** Every geometric statement in §3 and §4 comes from photographs
and product renders. That is the single biggest gap.

Specifically not sourced:

1. **Overall length, width and height** of an RC rig, working or transport. No catalogue in
   the folder publishes one.
2. **Mast height in metres**, retracted and extended, and the **feed stroke**. `research/16`
   §A.8 says the spread runs a *"2 m mast dump-feed"* — I am not confident whether that means
   a 2 m feed stroke, a 2 m rod, or something else, and I will not guess.
3. **Track gauge, track length, shoe width, number of rollers.**
4. **Machine mass / weight class.** The **21.5 t** in the *Australian Mining* article is
   **pullback**, not mass — do not let those be confused.
5. **Deck height above ground**, which is what would turn every ratio in §3b into a metre.
6. **Jack spread, jack stroke, foot-pad diameter.**
7. **Cyclone absolute dimensions** — barrel diameter, cone length, overall height. Only
   *ratios* are readable from the `Mincon` render, and only roughly.
8. **Sample hose bore beyond "3- and 4-inch"**, its corrugation pitch, and its minimum bend
   radius (which governs how the loop hangs).
9. **Compressor and booster package dimensions.** *"The size of a shipping container"*
   (`research/02` §E4) is a simile, not a dimension.
10. **Whether the reference mast is two-stage or three-stage.** I read two stages in the
    p.22 photograph; no text confirms it.
11. **How many rods the deck rack holds.** `research/16` §A.8 says a *"200 m capacity
    automated rod handler"*, which is a capacity, not a rack count.
12. **Engine power, hydraulic pressures, rotation speed range.**
13. **The colour.** I describe the *structure* of the reference livery (bright on equipment,
    grey on structure, black on hardware) and deliberately **do not name the hue**, because
    the actual colour is OEM trade dress. Pick a colour for the game and stay off theirs.
14. **Anything about the operator station** — controls, seat, screen layout. Not photographed
    from a usable angle.
15. **Sound, dust volume, and the visual density of the dust plume.** Every source says
    "dusty"; none quantifies it.

### Source disagreements recorded, not resolved

- **Air supply.** `research/02` §E4 (from `[MIN-RC]` pp.8-9) frames the requirement as a
  **primary compressor delivering ~25.5 m³/min at 24.1 bar (900 cfm @ 350 psi)** standing
  alongside. `research/16` §A.8 (from `[RCD-SETUP]`) describes **an onboard compressor of
  roughly 1 000 cfm at 500 psi**, with boosters at 1 350 cfm/500 psi for 300-400 m holes and
  up to 2 700 cfm/1 000 psi combined. These are not contradictory in engineering — one is the
  hammer's demand, the others are machine ratings — but they support **two different
  pictures** (all-external air vs onboard package plus booster). Both are drawn in the field.
  The game currently draws both at once, which is legitimate.
- **Rod length.** `[BL-RC]` (via `research/02` §A2) lists dual-wall pipe in **1.5 m, 3 m and
  6 m**; `research/16` §A.8 mentions a **2 m** mast dump-feed. All are real.
- **Splitter type.** `research/16` §B.7 documents a **cone splitter** with a double 25 L drop
  box and bolt-in blades; the game builds a **riffle splitter**. Both types are used in RC.
- **Cyclone mounting.** `research/16` §A.8 says **cantilevered off the rig deck**,
  *"hydraulically raised and rotatable"*; free-standing cyclone stands also exist on deep
  exploration spreads. Both recorded in §4.4.

## 9. Domain-truth warnings — what the current builder gets wrong

Read against `src/rig/rigFactory.js` `buildRCRig` (~4938-5210), `buildFeedBeam` (1236-),
`buildMastStack` (1953-1958), and `src/rig/tools.js` `rc-cyclone` / `rc-splitter` /
`sample-bag`. **I own no source files and have changed nothing.** Ordered by how much the fix
would buy.

### A. The mast is a box beam. It should be an open lattice truss. — highest value

`buildRCRig` builds its mast entirely from `buildFeedBeam(..., width: 0.56, depth: 0.42)`;
`buildMastStack` contributes **no structure at all** (rigFactory.js:1953-1958 returns three
empty groups). `buildFeedBeam` makes **two webs, a dark back plate, folded flange lips and
transverse diaphragms** — a closed channel. The reference machine
(`Mineral Exploration Tooling - Catalog.pdf` p.22) has a **welded open lattice with diagonal
X-web members and no back plate**: sky shows through it for its whole length. The feed beam's
own comment (rigFactory.js:1260-1265) reasons carefully about how to stop a mast reading as a
plank — the honest answer for *this* machine is that it should not be a plank-shaped object
at all. This is the difference between "a drill rig" and "**this** drill rig".

### B. Two exposed feed chains are missing

Reference p.22: a heavy chain runs the full length of **each outer face** of the mast, over
sprockets at the crown. At any distance it is a continuous fine-toothed dark band down both
mast edges, and it is one of the strongest texture cues on the machine. The builder has no
chain.

### C. The mast crown has no jib and no hanging hook

Reference p.22: a black head frame at the crown with a **jib arm cantilevered forward past
the mast top**, a sheave at its end, and a **winch line with a swivel hook hanging free**.
It is the most memorable small detail in the photograph. Nothing in `buildRCRig` builds it.

### D. The machine has a cab; the reference crawler has none

`buildRCRig` passes `cab: { w: 1.10, h: 1.86, d: 1.28, p: [-0.80, 1.28, -2.45] }`. The p.22
crawler has **no operator cab at all** — it is run from a deck-level control stand, and
`Mincon` p.13 sells *"in-cab joystick or remote control with PLC"* as alternatives. The
truck-mounted variant (`Article-Australian-Mining…` p.1) does have a cab, but it is the
**truck's** cab, at the far end, facing away from the drill. So: either drop the cab and give
the machine a control stand and canopy (as `crawler-lite` already does — rigFactory.js:1978,
*"no cab on a rig this size"*), or commit to the truck variant. The current arrangement — a
small cab amidships on a crawler — matches neither photograph.

### E. A rod carousel is the wrong rod-handling idiom for this machine

`buildRCRig` calls `buildCarousel(..., rods: 5, rodLen: 3.05, radius: 0.50)` at mid-mast.
The reference machine carries its rods **lying horizontally in a rack along the deck** and
brings them to centre with a **hydraulic swing arm** hinged near the head — clearly visible
in p.22 and in the truck-mounted photo. `research/16` §A.8 calls it a *"200 m capacity
automated rod handler"*. A carousel is a core-rig and tophammer idiom. The swing arm is also
a much better animation: it is big, it moves across the silhouette, and it is unmistakably
this class.

### F. Mast-to-carrier proportion looks about twice too tall — flag to check, not to blind-fix

The builder sets `mastH = 8.4` and pushes the mast pivot to ground level
(`stack.pivot.position.y = -(car.deckY + 1.26)`, with `deckY 0.88` and the slide at body
y 1.26), so the deck sits at **≈2.14 m** and the mast crown at **8.4 m** —
**mast-above-deck : deck-to-ground ≈ 2.9 : 1**. Measured off p.22 (§3b) the same ratio is
**1.5-1.6 : 1**. **Caveat: I have no absolute dimension for the reference machine (§8), and a
6 m-rod rig would legitimately be taller than a 2 m or 3 m-rod one.** So this is a check, not
a correction: either the mast is long for its rods, or the deck is low, or the reference is a
smaller machine than the one the game intends. Whoever changes it should decide the rod
length first (§8, source disagreement) and let the mast follow.

### G. The sample hose is smooth; it should be corrugated

`G.tube(..., 0.062, ...)` gives a 124 mm OD tube — a good size for a 3-4 inch RC hose — but
smooth. `research/16` §A.8 says **fat corrugated hose**, and this hose is identification cue
number one for the whole class (§5). A ribbed profile, or failing that a normal/roughness
treatment that reads as ribbing, is the cheapest single gain in this whole document.
`Downloads/surface-drill-rig-…-smartroc-d65-….webp` shows locally what the surface looks like.

### H. The cyclone has a free-standing tower but no support arm

`buildRCRig` builds `cyclone-stand` as four 3.95 m posts with a walkway at 1.62 m, handrail
and ladder, cyclone at 3.70 m. `research/16` §A.8 describes the cyclone as **cantilevered off
the rig deck**, *"hydraulically raised and rotatable"*, and `Mincon` pp.12-13 sells exactly
that: a slew base plate, a heavy fabricated support arm and a hydraulic deploy cylinder,
with *"automatic deploy, restore, and leveling"*. **Free-standing stands do exist**, so the
tower is not simply wrong — but the machine currently has **no support arm anywhere**, which
no modern RC rig lacks, and the hose therefore has nothing to hang from. Adding the arm is
the fix; removing the tower is a separate decision.

### I. The cyclone tool is well sourced — two named parts are missing

`tools.js` `rc-cyclone` already carries the ceramic-tiled wear bend, the alumina vortex
scroll and a urethane cone lining, which match `Mincon` p.13 word for word. Good. Missing
from p.13's own list, and both are visible lumps that read at distance:
**a hinged inspection lid on gas-assist lift struts with over-centre lever locks**, and
**multiple heavy-duty vibrators bolted to the cone** (*"assist in un-clogging of damp
sample"*). Proportion note: the tool computes `barrelH = Rb * 2.5` and `coneH = Rb * 4.2`
(barrel 1.25 diameters tall, cone 2.1 diameters long, ≈2.9 m overall at a 100 mm inlet). My
read of the `Mincon` render is a **squatter barrel (about 1 diameter tall) and a shorter cone
(about 1.5-1.6 diameters)**. My reading is eyeballed off a perspective render, so treat it as
"look again", not as a number.

### J. Splitter type — both are real, the doc records both

`tools.js` builds a **riffle** splitter (420 × 300 mm riffle box). `research/16` §B.7
documents a **cone splitter**, alumina-ceramic-lined, with a **double 25 L drop box** and
**bolt-in 4 / 6 / 8 / 10 % blade sets**, rated **3 000 cfm / 750 psi**, at working splits of
**6.25-12.5 %**. Both exist in RC. Whichever the game keeps, the split percentages should
come from that blade ladder rather than from a round number.

### K. Missing detail that would cost almost nothing

- **Perforated round-hole guard panels** — the most characteristic guarding detail in the
  reference photograph (flat dark plates, regular grid of round holes on a square pitch), at
  the deck edge beside the mast and at the rear corner.
- **Bulkhead plates and a hose-deflection guide** where the hose bundle crosses from carrier
  to mast, and a **fabric hose bag** over the bundle (§4.12, from the Bauer hose catalogue).
- **Two polished stripes** down the mast where the carriage rollers run — free, and it is the
  detail that makes a mast look used.

### L. Things the builder gets RIGHT — do not "fix" these

- **Four vertical jacks outboard of the tracks.** `gauge 1.18` + `trackWidth 0.62` puts the
  track outer edge at 0.90; the jacks sit at ±1.24. Correct, and the in-file comment already
  explains why they are not swing-out outriggers.
- **The onboard air package on the deck is correct and well sourced** — `research/16` §A.8:
  *"an onboard compressor of roughly 1 000 cfm at 500 psi"*. Note the builder's own header
  comment cites 25.5 m³/min @ 24.1 bar; that is `[MIN-RC]` pp.8-9 and it is the **hammer's
  demand**, not the onboard machine's rating. Two different numbers — keep them straight.
- **The booster skid** is sourced: *"1 350 cfm/500 psi for 300-400 m, up to 2 700 cfm/1 000 psi
  combined"* (`research/16` §A.8).
- **Deflector box on the side of the carriage**, sample leaving sideways — exactly right.
- **Hose reel and support arm on the rig** — both are named catalogue items (`Mincon` p.12).
- **Breakout table and rod holder at the mast foot** — right for heavy dual-wall pipe.
- **Chip trays on a trestle** — correct, and correctly *not* core boxes.
- **Bulk reject pile** growing all shift — correct.
- **Calico bag at 200 × 340 mm** — inside the sourced range of 200×300 to 600×900 mm.
- **Fictional naming** (`Kjelvik RC-410 Chipline`, `Drillity Chipline Cyclone`) — compliant
  with DOMAIN.md §10. **Nothing cited in this document may migrate onto a decal, a badge or a
  product name.** The manufacturer names here exist so a modeller can find the same
  photograph, and for no other reason.

### M. One site-level rule worth restating

`research/16` §B.7: **an RC rig can never appear underground.** The cyclone, the splitter,
the bag rows and a container-sized compressor do not fit in a 5 m drive, and the dust load is
unmanageable in a ventilated heading. If the game can place this rig in an underground
archetype, that is a bug.
