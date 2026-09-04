# Engineering reference — `dth-crawler` (Surface DTH crawler drill)

> status: complete (2026-09-04)
> Subject: the game rig `dth-crawler`, built in `src/rig/rigFactory.js` as `buildDTHCrawler()` (line ~2211), spec name "Brenner DH-750 Ironvein".
> Purpose: GEOMETRY and MATERIALS reference for the modeller. **Not** a product sheet.

## ⚠ NAMING RULE (DOMAIN.md §10)
Every real name in this document — Epiroc, Atlas Copco, Sandvik, Mincon, SmartROC, PowerROC, FlexiROC, ROC, Ranger, Pantera, DM/DR, COP, Secoroc, Bauer — appears here **only to cite a dimension or a photograph**. None of them may appear on the model: no badge, no decal text, no product name, no model designation, no logo silhouette on a counterweight or a cab door. Copy the *shapes and proportions*, invent the *branding*. The rig's in-game name stays fictional (currently "Brenner DH-750 Ironvein").

---

## 1. Sources read

| File | Pages | What it actually showed |
|---|---|---|
| `C:\Users\henri\Downloads\Surface_Drill_Rig_1000_0001.jpg` | image | **The single most useful source in the folder.** A clean 3/4 studio render of exactly this class: yellow tracked carrier, cab at the front-right, engine/compressor canopy behind the cab, and a **boom-carried feed beam** swung out over the front. Everything in §4 and §5 below is checked against this image. |
| `C:\Users\henri\Downloads\Epiroc DTH product catalog.pdf` | 1–5, 20–22, 30–37 | **Tooling, not rigs.** No machine drawings at all — it is a hammer/bit/pipe catalogue. But it is the authority for the *downhole* geometry: hammer OD, hammer length, drill-pipe OD and length. Directly usable for `tools.js`; useless for rig proportions. |
| `C:\Users\henri\Downloads\drillity-the-game\research\03-mining.md` | §C.1.1–C.1.3 (lines 908–945) | Already carries a written silhouette spec for this exact class. See §2. It correctly separates crawler top-hammer / DTH crawler / rotary blasthole into three tiers. |
| `C:\Users\henri\Downloads\drillity-the-game\research\16-site-archetypes.md` | §B.4 (line 2131) | Where the machine is allowed to stand: quarry bench, open-pit bench, rural water-well plot, Nordic/Arctic, greenfield pad, permafrost pad. Never offshore, never underground, marginal in a dense urban plot (air flush dust). |
| `C:\Users\henri\Downloads\Mincon - Minroc - DTH_Product_Catalogue.pdf` | hammer spec tables (MC30/MC42/MC51/MC61) | An **independent second source** for hammer OD, length, minimum bit size and weight. Agrees closely with the Epiroc figures — which makes the game's numbers wrong against *two* manufacturers, not one. Uniquely gives **"Minimum Bit Size"** per hammer, which is the annulus rule stated as a hard number. |
| `C:\Users\henri\Downloads\digital-solutions-for-surface-drilling-brochure-english.pdf` | 1–12 | **Not this machine — useful only as a negative.** It is a Sandvik *rotary blasthole* iSeries brochure (DR410i–DR416i, 152–406 mm holes). Confirms the class boundary: above ~254 mm you are looking at a rotary rig with a tower on a deck, not a DTH crawler with a boom. No geometry for our subject. |
| `C:\Users\henri\Downloads\surface-drill-rig-for-quarrying-and-mining-smartroc-d65-3d-model-77345d1f1d.webp` | image | **Equal-best source.** A high-resolution 3/4 front render of a mid-size surface DTH crawler with the feed **erected vertical and the boom folded in**. Shows the two-tone paint split, the cyclone-and-filter dust package hung on the *feed*, the boom knuckle and lift ram, the ROPS mesh over the windscreen, and the undercarriage in detail. This is the geometry to copy. |

## 2. What the machine IS

A **surface down-the-hole crawler drill**: a self-contained tracked machine, roughly excavator-sized, that stands on a quarry or open-pit bench and drills vertical or inclined **blast holes** in the 90–254 mm range. A diesel engine in the body drives a **hydraulic system** and — this is the defining difference from its top-hammer sister — a large **screw compressor**, because on a DTH rig the percussion happens at the bottom of the hole. The hammer is screwed on below the drill pipe and travels down with it; there is no drifter banging on top of the string, only a **rotation head** that turns the pipe and a **feed system** that pushes it. The air that runs the hammer comes back up the annulus carrying the cuttings, so the machine also carries a **dust collection package** — a cyclone and a filter — and a hood that seals against the ground at the collar. It works from a bench crest, tracks a few metres between holes on a drill pattern, drills 15–30 m per hole, and adds pipe from a carousel on the feed. `research/03-mining.md` §C.1.2 puts it exactly: *the compressor is the dominant component… the hammer is down the hole and invisible.*

Crucially — and both photographs in the folder agree — **the feed is carried on an articulated boom, not on a slide or a turret mast.** The boom lets the operator place the collar point away from the tracks and set any hole angle from vertical to well past 45°, which is what a bench pattern with a face-parallel row demands. The rotary-blasthole machine with a fixed vertical tower on a deck is a *different and much bigger class* (`research/03` §C.1.3) and must not be confused with this one.

The DTH range boundary from `Epiroc DTH product catalog.pdf` p.20: *"The optimum range of hole size for blast hole drilling with DTH is 90 mm to 254 mm (3½"–10"). Smaller blast holes are generally drilled using tophammer, and larger holes generally use rotary machines."* That single sentence sets this machine's place between the game's `crawler-th` and any rotary rig.

## 3. Proportions

**Source for this whole section:** the manufacturer brochure for a mid-size surface DTH crawler, `https://s3.amazonaws.com/cws-cdn-east/AtlasCopco/SmartROCD65/2017/NV5038797_A49.pdf` (spec pages, "HEIGHT AND LENGTH", "WEIGHT", "ALUMINIUM FEED", "CARRIER", "COMPRESSOR", "ENGINE"). Fetched because **no local file in Downloads carries rig dimensions for this class** — the local PDFs are all tooling catalogues. Cross-checks against local material are noted per row.

### 3.1 Absolutes

| Dimension | Value | Note |
|---|---|---|
| **Width over tracks** | **2,500 mm** | brochure dimension diagram; **3,000 mm** with the optional track widening kit |
| **Transport height** (feed dumped) | **3,500 mm** | H1, same for both feed lengths |
| **Transport length** (feed dumped) | **11,350 mm** standard feed / **11,600 mm** long feed | L1 — the dumped feed overhangs the front, which is why it is so much longer than the carrier |
| **Feed height erect** (H2) | **9,400 mm** standard feed / **11,600 mm** long feed | This is the same number as the feed beam's own total length |
| **Feed beam total length** | **9,400 mm** SF / **11,600 mm** LF | |
| **Feed travel (single-pass hole depth)** | **5,400 mm** SF / **7,540 mm** LF | cross-checked against the brochure's own "Single pass drilling, max hole depth: 5.4 m / 7.5 m" — the two figures agree, so this pairing is safe |
| **Feed extension** (beam slides out to reach the collar) | 1,900 mm SF / 1,150 mm LF | |
| **Operating weight** | **22,600–24,100 kg** | 22,600 (SF, Tier 3) → 24,100 (LF, Tier 4), excluding options and drill steel |
| **Track oscillation** | **405 mm** | the track frames rock relative to the body — a real articulation the model should allow |
| **Horizontal reach of the boom** | **2,700–3,190 mm** (standard feed), **2,465–2,950 mm** (long feed) | quoted at 17° and 25° feed angles. **This is the number that kills the linear-slide design** — see §9.2 |
| **Vertical reach** (long feed) | A = 1,040 mm, B = 2,659 mm | above/below track level |
| Engine | 403 kW / 540 HP at 1800 rpm | |
| Compressor | two-stage screw, **FAD 470 l/s at 30 bar** (995 cfm) | |
| Feed force / feed rate / feed chain | **40 kN** / 0.9 m/s / **45 mm** chain | |
| Tramming speed | 3.2 km/h max | it barely moves — model it crawling between holes |
| Hole diameter | **110–203 mm** | inside the 90–254 mm DTH window from `Epiroc DTH product catalog.pdf` p.20 |
| Drill tube sizes | **89–114 mm** and **127–140 mm** OD | matches the Epiroc pipe tables (76 / 89 mm stock, p.33) |
| Drill tube lengths | **5 m** and **6 m**, plus a **7.5 m starter tube** | see the disagreement note below |
| Max hole depth | 45 m (5 m tubes, 89–114 mm) → 55.5 m (6 m tubes + 7.5 m starter) | |

### 3.2 Ratios — use these, not the absolutes

Take **width over tracks = 1.0 W** (2,500 mm). Everything else follows, and this is what makes the machine read right at any scale:

| | × W |
|---|---|
| Width over tracks | **1.00** |
| Transport height, feed dumped | **1.40** |
| Feed beam total length (erect height) | **3.76** (standard feed) |
| Feed travel / single-pass depth | **2.16** |
| Transport length, feed dumped | **4.54** |
| Boom horizontal reach | **1.08–1.28** |

**The single most important proportion: the erect feed is nearly four times the machine's width, and about 2.7 times its transport height.** This machine is dramatically vertical. A silhouette that does not look top-heavy and slightly precarious is not this machine.

⚠ **The game is proportionally short.** `rigFactory.js` uses `mastH = 7.2` on a carrier 2.65 m over tracks → ratio **2.72 W**, against a real **3.76 W**. To hit the real proportion at the game's existing track width the feed should be **≈ 9.9 m**, or the carrier should shrink. Recommendation: raise the feed rather than shrink the carrier — the tracks are already correctly sized for the 19,500 kg the spec claims (§9.6).

### 3.3 Where sources disagree — recorded, not resolved

**Drill tube length.** The brochure for this 23 t class quotes **5 m and 6 m** tubes with a 7.5 m starter. But `Epiroc DTH product catalog.pdf` p.33 lists **3 m** (and 1.5/1.8/4/5/6 m) tubes in 76 mm and 89 mm OD as stock for the surface crawler series. Both are real: the bigger the rig and the longer the feed, the longer the tube. The game's `rodLen: 3.05` (10 ft) suits a rig **smaller** than the brochure machine, which is consistent with its 19,500 kg spec versus the brochure's 22,600 kg. **Do not "correct" 3.05 m to 6 m** — but do keep the ratio honest: feed travel should be a whole number of tubes plus the head, so a 3.05 m tube wants ~3.4–3.6 m of travel, not 5.4 m.

**Hammer OD.** Epiroc and Mincon differ slightly at the same nominal size (5": 117 mm STD vs 124 mm; 6": 138 mm vs 140 mm). Both are recorded in §9.1. Either is defensible; the game's numbers match neither.

## 4. Component inventory

Front-to-back, with why each one matters to the silhouette. Sources: the two photographs in `Downloads`, the brochure spec pages (URL in §3), and `Bauer-Maschinen-Hydraulikschläuche-hydraulic hoses-DE-EN-905-213-1+2.pdf` for hose practice.

### 4.1 Feed beam (do **not** call it a mast)

- **Structure: an extruded ALUMINIUM profile.** The brochure names it twice — *"Aluminium profile feed beam"* and *"Aluminum profile feed with hose guide and double drill tube support."* This is a material fact with real visual consequence: it is **not** a lattice, **not** a welded steel box, and it is **not painted the machine colour**. It reads as a slightly satin, pale grey-silver extrusion with sharp longitudinal edges and constant cross-section over its whole length. The rotary-blasthole rigs get steel lattice towers; this class gets an aluminium extrusion. Getting this wrong is the fastest way to make the model read as the wrong tier of machine.
- **Length: 9,400 mm** (standard feed). Constant section end to end — extrusions do not taper.
- **The carriage runs on the extrusion itself.** The profile has integral machined ways along its faces; the rotary head's carriage clamps around them with slide pads. There are no separate round rails bolted on. A **45 mm feed chain** (brochure) runs the carriage up and down, driven by a hydraulic feed motor at one end over a sprocket, with an idler and a chain tensioner at the other. **Model the chain** — a visible chain run along the beam face is one of the most recognisable details on any feed.
- **Hose guide** along the beam: the hoses to the rotary head must follow it up and down, so they run in a guided loop or a chain-type carrier along the beam. Never model them as straight taut lines.
- **Double drill tube support**: two guide/centraliser points along the beam that stop the tube whipping.
- **Movable lower guide / dust hood** at the ground end, plus a **break-out table** for cracking joints (brochure: *"support with break-out table and movable lower guide/dust hood"*). The game already has a breakout table here — correct.
- **Feed foot** at the very bottom, which lands on the rock and takes the drilling reaction. A **"wide feed foot"** is a listed option, so model a substantial plate, not a peg.
- **Feed extension**: the whole beam slides 1,900 mm relative to its cradle to place the collar without moving the boom.
- Optional **service winch with a jib boom mounted on the feed** — for lifting hammers and tubes. A small davit near the top of the beam.

### 4.2 The boom — the component the game is missing

A heavy fabricated **steel box-section boom**, dark grey, pinned to the front of the carrier body. It carries the feed cradle at its outer end through a **swing/dump joint** that gives feed angle and rotation. Underneath it sits a large **boom lift cylinder**; further cylinders control feed dump and feed swing. In the D65-class render the boom is folded so the feed stands close to the carrier; in the other photograph the boom is extended and the feed is out over the ground several metres ahead. **Both poses must be reachable** — that articulation is the machine's whole reason for existing.

Sourced envelope: **horizontal reach 2,700–3,190 mm**, **vertical reach 1,040 mm up / 2,659 mm down**, feed swing angles quoted at 17° and 25° in the brochure diagrams.

### 4.3 Rotary head

Not a drifter — there is no percussion on the deck. A compact gearbox with a hydraulic motor hanging off it, riding the feed carriage. Output is a **threaded box connection: API 2⅜" REG or API 3½" REG** (brochure). Speed and torque from the brochure's rotary-head table: **54–137 rpm**, torque up to roughly **1,839 / 2,353 / 5,800 / 6,600 Nm** across the head sizes.
⚠ The rpm and torque columns in the fetched text are mis-aligned by the layout, so the *pairing* of a specific rpm to a specific torque is **NOT SOURCED**; the ranges are.
Visually: a dark, oily, cast-and-fabricated block, noticeably smaller than a top-hammer drifter, with two big hydraulic hoses entering from the side and a water/air swivel above. Because the hammer is downhole, **nothing about this head should suggest impact.**

### 4.4 Compressor and engine package

The dominant mass of the machine, and the thing that makes it a DTH rig (`research/03-mining.md` §C.1.2). A **two-stage screw compressor** delivering **470 l/s at 30 bar**, driven off a **403 kW** diesel. Consequences for the model:
- A long, tall **engine/compressor canopy** filling the rear two thirds of the superstructure, with **large louvred or mesh intake panels** on both flanks and a big **cooler pack** at the rear (the machine has to reject both engine heat and compression heat — `Hydraulic oil cooler` and an aftercooler are listed separately).
- A **vertical exhaust stack** behind the cab — clearly visible in the D65-class render as a black pipe with a rain cap.
- **Heavy duty air intake filters** are a listed option: cylindrical pre-cleaner cans on the canopy roof are period-correct.
- An **air receiver** and the fat air line running forward to the rotary head.

### 4.5 Dust collection package — a major visual mass

Brochure figures: **suction capacity 1,270 l/s (2,690 cfm)** and — the number the modeller needs — **suction hose diameter 203 mm (8")**.
The package hangs on the outboard side of the feed: a tall black **cyclone** can, a **filter box** on top of it (yellow in both photographs), and a **203 mm corrugated flexible hose** sweeping in a lazy S from the hood at the collar up to the cyclone. At 8" diameter this hose is as thick as a man's thigh — it must not be modelled as a thin pipe. A second, smaller hose returns cleaned air. Multiple filter elements inside, cleaned by pulses of compressed air.

### 4.6 Cab

Small, tall and glassy, set on the superstructure to one side so the operator can see the collar past the feed. Sourced fittings:
- **ROPS and FOPS approved, on rubber vibration dampers**
- **Clear laminated glass in the front and roof windows**; **toughened glass in the side and rear windows**. The **roof window** is essential — the operator watches the head climb the feed.
- A steel **FOPS mesh guard** over the windscreen (clearly visible in the D65-class render as a dark grid across the front glass)
- 2 wipers with washer, rear view mirror, cabin light, adjustable seat and foot rest, 6 kg dry-powder fire extinguisher, 24 V outlet, beacon
- **LED / halogen work lights front, rear and on the feed** — including *"halogen work light pointing to feed support"*

### 4.7 Handrails, walkways, guarding

- **"Protection hand rails on top of canopy"** (brochure) — a rail run along the engine canopy roof for service access. Tubular, painted the machine colour.
- **"Protective guard, according to EN16228"** is a listed option — EN 16228 is the drilling-machine safety standard; it means mesh or plate guarding around the rotating string at the working level.
- Steps/ladder up the side of the superstructure to the cab door and the canopy roof.
- **Central lubrication system (Lincoln type)** — a manifold block with a fan of small nylon lube lines running to the boom and feed pivots. A tiny detail that reads as very real up close.

### 4.8 Undercarriage

- **Width over tracks 2,500 mm** (3,000 mm with the widening kit), **track oscillation 405 mm** — the track frames pivot relative to the body, so on a broken bench the machine sits skewed. Model the oscillation joint.
- Excavator-type: **drive sprocket at one end, idler at the other, track rollers along the bottom, carrier rollers on top**, grouser shoes on a sealed chain. Both photographs show a deep, chunky single-grouser shoe.
- **Tramming speed 3.2 km/h**, tractive effort in the region of **138 kN**.
- Track frames and their guards are **dark grey, not the machine colour**, in both photographs.
- **A single hydraulic support leg** is listed (see §9.3) — not a set of four outriggers.

### 4.9 Rod / tube handling

A **hydraulic tube handling system** ("Auto Rod Handling" in the brochure) mounted on the feed: a carousel or magazine of tubes with a swing arm that lifts one into line with the head. Capacity follows from the depth figures — 45 m of hole in 5 m tubes is **8–9 tubes** on board. The game's 5-pipe carousel with 3.05 m rods is the smaller-rig equivalent and is fine; just keep the tubes visibly **fatter and fewer** than a top-hammer rod magazine, per `research/03-mining.md` §C.1.2.

### 4.10 Hose routing

From `Bauer-Maschinen-Hydraulikschläuche-hydraulic hoses-DE-EN-905-213-1+2.pdf` (a rotary-rig catalogue, but the practice is industry-wide):
- Hoses run as **bundled packages inside a flat sleeve or hose bag**, not as loose individual lines. The catalogue sells them as a *Hauptschlauchpaket* (main hose package) and *Mastschlauchpaket* (mast hose package).
- They terminate at **bulkhead plates** (*Schottplatte*) — one on the base carrier, one at the drive — rather than running end to end. A bulkhead plate is a flat steel plate with a row of drilled-through couplings, and it is a great small detail.
- The bundle leaves the carrier at a **hose deflection** (*Schlauchumlenkung*) — a roller or curved shoe that sets the bend radius.
- Sizes to draw from: **suction hoses NS 25–100 mm**, low-pressure NS 6–75 mm, high-pressure up to NS 25 mm, and **R15 420 bar hoses NS 32–50 mm**. So: a few fat lines (32–50 mm) plus many thin ones (6–20 mm) — never a uniform bundle of same-diameter tubes.
- Rated **−55 °C to +150 °C**, which is why the covers are matt black rubber and go chalky-grey with age.
- On the feed specifically, the run must be a **guided moving loop** (§4.1) so it can follow the carriage.

### 4.11 Where the rods sit at working extension

At the start of a hole the carriage is at the **top** of the feed with a full tube hanging below it; at the end of a pass the carriage is at the **bottom**, with the tube almost entirely in the ground and only the head, the break-out table and the collar hood visible. Single-pass travel is **5,400 mm** of the beam's 9,400 mm — so the carriage sweeps a little over half the beam, and roughly the top 3.5 m of beam is *never* covered by the carriage. That upper section carries the hose loop, the tube-handling magazine and the winch jib. Do not model the whole beam as bare track.

## 5. Distinctive features (thumbnail silhouette test)

Five things. If a 64-pixel thumbnail has these, a driller will name the class; if it has three of them plus a lattice tower, they will call it a rotary rig and be annoyed.

1. **A very tall, very thin, perfectly straight beam standing off the FRONT of a small tracked machine — carried on a folding boom, not rising from the deck.** The beam is ~3.8× the machine's width. The gap of daylight between the beam and the carrier, spanned by the boom, is the single most identifying feature. A rotary blasthole rig has its tower *on* the deck with no gap; a top-hammer crawler has the same gap but a shorter, stubbier feed.
2. **The body is a long, high, closed box — much bulkier than an excavator of the same track size** — because the compressor and its coolers live in it. Big louvred flanks and a rear cooler face. The machine looks nose-light and tail-heavy.
3. **A fat black corrugated hose looping from the bottom of the beam up to a cylinder-and-box package hung on the beam's outboard side.** At 203 mm diameter this hose is unmissable even at thumbnail size, and nothing else in the game's fleet has it.
4. **Two-tone paint with a hard horizontal split**: coloured superstructure and cab sitting on a dark grey undercarriage, with the boom and the beam also dark/pale-neutral. The colour never reaches the ground.
5. **No drifter on the beam.** The thing riding the beam is a small, dark, compact head — not the long tapered body of a top-hammer rock drill. Silhouette-wise the carriage is a *lump*, not a *sausage*.

Negative test — if you see any of these, it is not this machine: a lattice tower; four big jacks lifting the tracks clear of the ground; a rod string visible above the head; a cab at the *back* of a long deck; the beam rising vertically out of the deck with no boom.

## 6. Materials and paint

### 6.1 Surface by surface

| Surface | Material and finish | Source |
|---|---|---|
| **Feed beam** | **Bare extruded aluminium** — satin, pale grey-silver, faintly directional along the extrusion axis. Not painted, not chrome, not steel-blue. Oxidises to a flat chalky grey; wear polishes the carriage ways to a brighter line. | brochure: *"Aluminium profile feed beam"* |
| Superstructure covers, canopy doors, cab shell | **Painted steel**, gloss, the house colour. Chipped to primer and then to bare metal on every leading edge and door corner. | both photographs |
| Boom, feed cradle, break-out table | **Painted steel in the dark tone** — charcoal/graphite. Semi-gloss when new, quickly scuffed. | both photographs |
| Track frames, sprocket, idler, roller guards | **Painted dark grey**, but the paint survives almost nowhere below the top of the frame. | both photographs |
| Track shoes and chain | **Bare hardened steel**, no paint at all. Rust-brown in the recesses, mirror-polished on the grouser tips and on the rail the rollers run on. | both photographs |
| Cylinder rods (boom, feed dump, feed extension, support leg) | **Hard-chromed steel** — genuinely mirror-bright, with the classic fine scratch marks along the stroke. The only true chrome on the machine. | both photographs |
| Cylinder barrels | Painted, same dark tone as the boom. | |
| Hoses | **Matt black rubber**, chalking to grey-brown with UV age; bundled in a flat sleeve. Fittings are raw zinc-plated or blued steel and go orange at the crimp. | Bauer hose catalogue |
| Dust suction hose | **Black corrugated flexible**, 203 mm, dull and heavily dust-coated. | brochure |
| Cyclone / filter box | Painted steel, house colour on the box, often black on the cyclone. | both photographs |
| Glass | Front and roof **laminated**, sides and rear **toughened**. Slight green edge tint. Roof glass always the dirtiest panel on the machine. | brochure |
| FOPS window guard, walkway grating | **Bare or galvanised steel mesh**, dull grey, no gloss. | D65-class render |
| Handrails | Painted tube, house colour, worn to bare metal exactly where hands go. | brochure: *"Protection hand rails on top of canopy"* |
| Drill tubes | **Bare steel**, cold-drawn, so a smooth even surface. Rust film over most of the length; the threads and the wrench area polished bright. | `Epiroc DTH product catalog.pdf` p.30: *"made from cold drawn piping, providing a superior surface finish"* |
| Hammer and bit | Bare hardened steel; the wear sleeve scored and burnished; carbide buttons pale grey against the darker steel face. | Epiroc / Mincon tables |

### 6.2 Where dirt, dust and wear actually accumulate

This machine's dirt has a specific signature, and it is **rock dust, not mud**. It is drilling dry with air flush on a rock bench.

- **A pale, fine dust film over everything**, heaviest on upward-facing surfaces: canopy roof, walkway, boom top, cab roof, the top face of the feed beam. It dulls the colour rather than staining it. Colour comes from the rock — grey in granite, buff in limestone, red in ironstone. **This is the dominant weathering effect and the game should key it to the site's rock type.**
- **The lower 1.5 m of the feed beam and the whole dust hood are the filthiest parts of the machine** — caked, not filmed, because that is where cuttings come out of the hole.
- **The collar area of the tracks**: dust packed into the chain links and around the sprocket, turning to a hard crust.
- **Wiped-clean arcs** on the windscreen where the wipers sweep, with a dust crescent outside them. On the roof glass, no wiper, so it is opaque with dust — a lovely detail.
- **Handrails, grab handles, cab door edge, ladder rungs, the steps to the canopy**: polished to bare bright metal by hands and boots. Never dusty.
- **Paint chipping** on every corner the tubes swing past: the break-out table, the lower guide, the beam's lower flank, the tube magazine.
- **Oil**: a dark wet-looking sheen around the rotary head and down the beam below it (thread lubrication is sprayed on — the brochure lists a *"thread lubrication, spray system"*), and around the central lubrication manifold. This is the one wet, dark, shiny area on an otherwise dry dusty machine, and the contrast sells it.
- **Rust**: not much on painted surfaces — this machine lives in dust, not water. Rust lives on **track shoes, the chain, tube racks, the feed foot, and any unpainted bracket**, plus orange streaks running down from bolt heads and hose crimps.
- **Chrome rods stay clean** where they retract into the seal and dusty where they are always out. The wiped band on a rod is a strong readability cue for how far a cylinder has been stroking.
- **Heat discoloration** on the exhaust stack — straw to blue near the top.

## 7. Photo references

All paths under `C:\Users\henri\Downloads\`.

| Image | Shows | Use it for |
|---|---|---|
| **`Surface_Drill_Rig_1000_0001.jpg`** | 3/4 rear render of a compact surface DTH/rock crawler, boom **extended**, feed vertical and set out ahead of the tracks | **The working pose.** Boom articulation and how far the feed stands off the machine; the gap between beam and carrier; coiled spiral air/hydraulic hoses along the boom; the dust-collection sock hanging under the boom; cab and canopy massing; track proportions. This is the pose the game should use for "drilling". |
| **`surface-drill-rig-for-quarrying-and-mining-smartroc-d65-3d-model-77345d1f1d.webp`** | High-res 3/4 front render of a mid-size surface DTH crawler, boom **folded**, feed erect and close in | **The detail reference.** Best single image in the folder for: the aluminium feed profile and its bare finish; the cyclone + filter box on the feed's outboard side and the fat corrugated suction hose; the FOPS mesh over the windscreen; exhaust stack; canopy louvres; the two-tone paint split; sprocket/idler/roller layout and grouser shoes; the yellow lower guide and feed foot. |
| `Atpa\656646487_18102637706496456_755721845416423955_n.jpg` | A real site: a stack of threaded drill rods and casing on churned ground, strapped in bundles, with a tracked machine behind | **Material and site dressing.** Exactly how steel rods look in the field — rust-brown shading to grey, polished thread crests, white paint index bands, steel strapping, ends caked in mud. Also the correct *scatter* of a working site. (These are threaded rods rather than DTH tubes, so use it for finish and staging, not for tube geometry.) |
| `Atpa\IMG_20230414_094715.JPG` | Close-up down the bore of a carbide-buttoned ring bit / casing shoe | **Tooling close-up.** Button seating, braze fillets, weld spatter, the burnished vs. rusted contrast on hardened steel. Relevant to the rig's `overburden` method rather than to DTH proper. |
| `Rotary_Drilling_Rig_1000_0001.jpg` | A rotary drilling rig (different class) | **Negative reference.** Use it to check you have *not* drifted toward the wrong silhouette. |
| `dth-bits-1024x683.jpg` | DTH bit faces | Bit face geometry for `tools.js`; nothing for the rig. |
| `C:\Users\henri\Downloads\Atpa\` (rest), `Atpa\Atpa products\` | ~100 WhatsApp photos of casing shoes, ring bits, drill heads and welded tooling | **Tooling only — no rigs of this class.** Genuinely useful for `overburden` and bit modelling, useless for this document's subject. Recorded honestly so nobody re-sweeps them. |

**Not found in the folder:** any photograph of a surface DTH crawler *working on a bench* (dust plume, collar, bench face), any side elevation or dimensioned GA drawing of this class, and any close-up of a feed beam, rotary head, tube carousel or undercarriage on this machine type.

## 8. NOT SOURCED

Everything below was looked for and **not** found. None of it should be invented; a modeller hitting one of these should either leave it generic or go back to the owner for a photograph.

**From local material — the biggest gap:**
1. **There is no rig specification sheet for this class anywhere in `Downloads`.** Every DTH PDF in the folder is a *tooling* catalogue (hammers, bits, pipes, adapters). All rig dimensions in §3 come from a web-fetched brochure, not from the owner's own material. **If the owner has a rig brochure for this class, it would be the single most valuable file to add.**
2. No **GA / dimensioned side elevation** of any surface DTH crawler. Everything in §3 is a spec-table number, not a scaled drawing, so *relative positions* (where the boom foot sits fore-and-aft, cab offset from centreline, deck height above track top) are estimated from photographs only.

**Specific numbers not found:**
3. **Track shoe width** for this class — 500 mm is inferred from a *different* 19.5 t crawler class (`research/11` §D.3), not from a DTH rig sheet.
4. **Track length on ground** and **number of track rollers**. Only width over tracks (2,500 mm) is sourced.
5. **Ground clearance** and **ground pressure** for this machine.
6. **Cab dimensions**, door size, glass panel sizes, seat position, and which side of the centreline the cab sits on. Photographs suggest one arrangement but the two images are not consistent enough to call it.
7. **Boom cross-section dimensions**, pin diameters, cylinder bore/rod diameters anywhere on the machine.
8. **Feed beam cross-section** — width and depth of the aluminium extrusion, and the shape of its machined ways. Only its length (9,400 mm) and material are sourced.
9. **Rotary head physical dimensions** (length, diameter, weight). Only thread, rpm and torque are sourced — and the rpm↔torque pairing is itself uncertain (§4.3).
10. **Tube carousel capacity** as a printed number. 8–9 tubes is *derived* from depth ÷ tube length, not quoted.
11. **Exact hammer OD for the 3" size** in the Epiroc table (only Mincon's MC30 at 77 mm was read).
12. **Where the counterweight is, or whether this class has one at all.** No source found either way. Excavator-derived carriers usually do; a purpose-built drill carrier may not. **Do not model one on a guess.**
13. **Winch specification** (line pull, rope diameter) for the optional feed-mounted service winch.
14. **Paint colours as manufacturer values.** The photographs show a yellow-and-charcoal scheme, but the game must invent its own livery anyway (§ naming rule), so this is a non-issue by design.
15. **Sound.** Nothing in any source about noise level or character. A DTH rig is dominated by compressor whine plus a muffled thudding from underground — but that is **domain knowledge, not sourced from these files**, and is flagged as such.
16. **Dust plume behaviour** at the collar — volume, colour, how far it drifts. The 1,270 l/s suction figure bounds it but does not describe it.

**Checked and confirmed empty:**
17. `research/10-oem-foundation.md`, `11-oem-anchor-geotech-hdd.md`, `12-oem-rock-tooling.md` — pack 12 covers DTH **tooling** vendors (Bulroc, Halco, Mincon, Sandvik) and is good on hammers and bits, but **none of the three packs covers surface DTH rig manufacturers or rig geometry.** Pack 16 §B.4 covers where the machine may stand, not what it looks like. `research/03-mining.md` §C.1.2 is the only prose description of the machine and it is four sentences long.

## 9. Domain-truth warnings — what the game currently gets wrong

### 9.1 🔴 **Every DTH hammer in `tools.js` is too fat to enter its own hole.** (hard error, fully sourced)

`src/rig/tools.js` line 1414, `buildDTHHammer()` size table, versus `Epiroc DTH product catalog.pdf` p.20–21:

| size | game OD | game length | real OD (STD / heavy-duty) | real length w/o bit | nominal hole Ø |
|---|---|---|---|---|---|
| 3in | 85 mm | 900 mm | *not in the QL table read* | — | 76.2 mm |
| 4in | **108 mm** | 1050 mm | **100 mm** (QL 340 STD) | 994 mm | 101.6 mm |
| 5in | **133 mm** | 1180 mm | **117 mm** STD / 124 mm heavy-duty | 1067 mm | 127.0 mm |
| 6in | **159 mm** | 1320 mm | **138 mm** STD / 146 mm heavy-duty | 1132 mm | 152.4 mm |
| 8in | **210 mm** | 1600 mm | **181 mm** STD / 194 mm heavy-duty | 1461 mm | 203.2 mm |

The catalogue states the governing rule on p.20: *"As a rule of thumb, the smallest hole diameter a DTH hammer can drill is its nominal size… The limiting factor is the outside diameter of the hammer."* A hammer's OD must therefore always be **smaller** than its nominal hole size, with clearance left for cuttings to evacuate up the annulus.

**In the game, every single size violates this** — 85 > 76.2, 108 > 101.6, 133 > 127, 159 > 152.4, 210 > 203.2. The modelled hammer could not be lowered into the hole it just drilled. Fix: adopt the real ODs above (they also make the hammer read as correctly *slender* inside the cross-section band, which is the whole point of the DTH visual). Lengths are 11–17 % long too; the 8" should be ~1,460 mm, not 1,600 mm.

The **annulus** this creates is the visual: a 138 mm hammer in a 165 mm hole leaves a ~13 mm gap all round. In the cross-section view, that thin bright gap full of rising dust is the DTH story. If the hammer fills the hole, the story is invisible.

### 9.2 🔴 The rig carries its feed on a linear slide. Real machines use an articulated boom.

`rigFactory.js` ~line 2244 builds a `mast-slide` — a box with two chromed slide bars and a traverse ram, on which the mast stack sits. **Both photographs in the Downloads folder show something completely different**: a heavy fabricated **boom** with a knuckle, pinned to the front of the carrier body, with a large lift cylinder underneath and a feed-swing/dump joint at its outer end.

This is not a cosmetic difference. The boom is *why* the machine exists in this shape — it lets the operator reach the collar point without moving the tracks, and set hole angle independently of the machine's stance on the bench. The slide gives roughly 0.8 m of travel along one axis; the real boom gives a working envelope several metres across and a full range of hole angles. `research/03-mining.md` §C.1.1 says it outright: *"the feed is the visual signature — a long straight beam that tilts and slews independently of the tracks; the machine can drill inclined holes and looks wrong if the feed only ever points straight down."*

The linear slide belongs to the **rotary blasthole** class (§C.1.3: a tower on a deck, jacked off its tracks), which is a different and much larger machine. As built, the game's DTH crawler is a small rotary rig wearing a DTH badge.

### 9.3 🟡 Four outriggers is probably one class too many.

The builder puts four `buildOutrigger` units on the rig. Neither photograph shows four jacks on a machine of this size — the D65-class render shows the machine sitting on its **tracks**, with levelling done by the boom and a **single foot / drill-steel support at the base of the feed**. Larger surface DTH rigs do get rear jacks. Recommendation: keep at most two rear jacks and add the feed-foot, or drop the jacks entirely and let the feed foot plus tracks carry it. **NOT SOURCED** to a spec sheet — this is read from photographs and should be confirmed before ripping out working code.

### 9.4 🟡 The dust package is in the wrong place and too small.

The builder calls `buildDustHood` at the mast base and nothing else. Both photographs show the dust collection as a **major visual mass hung off the feed structure itself**: a tall black cyclone can on the outboard side, a yellow filter box on top of it, and a fat black corrugated flexible hose sweeping down from the cyclone to the hood at the collar. On a DTH rig this package is second only to the compressor in visual weight, and `research/03-mining.md` §C.1.2 names the compressor as the dominant component precisely because of the air path. Currently the game's rig reads as a hydraulic rig with a small skirt.

### 9.5 🟡 Paint is applied as one colour; the real machines are firmly two-tone.

`addDecals` / `p.paint` puts the body colour broadly. Both references show a consistent split: **yellow (or the house colour) on the superstructure covers, cab and the dust-package box; charcoal/dark grey on the boom, the feed beam, the track frames and the undercarriage.** See §6.

### 9.6 🟢 Things the builder gets right — do not "fix" these

- **Track geometry.** `gauge: 1.05` is a *half*-gauge in `buildCarrier` (`x: s * o.gauge`), so track centres are 2.10 m apart and width over tracks is 2.10 + 0.55 = **2.65 m**, with 550 mm shoes. That sits correctly in the band `research/11-oem-anchor-geotech-hdd.md` §D.3 gives for a 19.5 t crawler: chassis **2,500–2,700 mm** wide on **500 mm** chain. The `weightKg: 19500` in the spec matches that same band. Leave it alone.
- **`holeMm: '105-203'`** sits inside the sourced DTH blasthole window of **90–254 mm** (`Epiroc DTH product catalog.pdf` p.20). Correct.
- **`rodLenM: 3.05`** (10 ft) is a real catalogue length — the pipe tables list 3 m stock in 76 mm and 89 mm OD (p.33). Correct.
- **A carousel of 5 pipes** matches §C.1.2's *"the carousel carries fewer, heavier pipes."* Correct instinct.
- **The fictional name** "Brenner DH-750 Ironvein" is correctly invented. Keep it that way (see the naming rule at the top).
