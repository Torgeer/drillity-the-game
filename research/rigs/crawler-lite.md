# crawler-lite — Light multi-purpose geotechnical / anchor crawler (Comacchio / Klemm class)

status: COMPLETE for this pass (2026-09-04). Every figure is cited to a file and a page.
Everything that could not be sourced is listed in §8 rather than guessed.

Game id: `crawler-lite`. Builder: `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js`,
`buildCrawlerLite()` (~line 1964). Current in-game spec: 3800 kg, 37 kW, mast 4.2 m, rod 1.5 m,
feed 25 kN, torque 1800 Nm.

> **NAMING RULE (DOMAIN.md §10).** Everything below is cited to a real manufacturer's
> literature because that is where real geometry lives. The game must NOT carry any
> real manufacturer name or model designation as a product name, decal, badge, nameplate
> or texture. Model the *shapes and proportions*; invent the badge. The existing in-game
> name "Nordvik NV-90 Scout" is the correct pattern — keep it, and keep the mesh-guard
> panels, hood louvres and console layout **without** the maker's wordmark or logo tile.

---

## 1. Sources read

| File | Pages | What it actually showed | Useful? |
|---|---|---|---|
| `C:\Users\henri\Downloads\Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` | 1–18 (text), 2 + 16 rendered as images | **The single best source in the folder.** 18 pages, pp. 2–14 are full-bleed photographs of a GEO 305 with no text layer; p. 15 is a drilling-capability table; **p. 16 carries a fully dimensioned two-view general-arrangement drawing (side + front elevation)** — this is the geometry backbone of this document. | YES — primary |
| `C:\Users\henri\Downloads\KLEMM_Lieferprogramm_Product_Range.pdf` | 1–13 | KLEMM KR-series product range, Aug 2025. p. 5 = range envelope (4 t–32 t rigs, KD drifters 6.8–28 kg piston, KH rotary heads to 61.5 kNm). **p. 8 = the "Confined Conditions" table, which is exactly this weight class** (KR 606-3, KR 702-3, KR 704-2E, KR 704-3G) with weights, power, minimum headroom and minimum width. p. 9 = photo plate of those same machines. p. 12 = separate Power Pack table. p. 13 = KH rotary-head torque/hollow-shaft table. | YES — primary for weight/width/power |
| `C:\Users\henri\Downloads\Einsteckende Klemm.pdf` | 1 (the whole file) | A single dimensioned **shank-adapter production drawing** for a KLEMM **KD 1215R** hydraulic drifter: 12-tooth spline drive, 107.5 mm over teeth, 746 mm long, 23 kg, **BW64 rope thread (Eurodrill H64), 2 tpi left-hand, internal flush through a 16 mm bore**, 1.6587 case-hardened to 56 HRC. Nothing about the rig's body, but it is hard evidence that this class does run a **top-hammer drifter with a rope-thread, internally-flushed string** - so the game's `top-hammer` method on this rig is sound. (Part and document numbers deliberately not reproduced.) | YES - for the head and string only |
| `C:\Users\henri\Downloads\2-1-EMDE-Katalog-Ankerbohren.pdf` | 1-4 (contents + drive-drilling) | Tooling catalogue: drive drilling, overburden with rotary drive, overburden with hydraulic top drifter, double-head drilling, augers, HDI 1- and 2-fold, accessories. Casing sizes 76.1 / 88.9 / 101.6 / 114.3 / 133 / 152.4 / 177.8 / 203 / 219 mm. **No rig general arrangement.** | NO for the rig |
| `C:\Users\henri\Downloads\Bohrtech_Katalog24_f25.pdf` | 1-4 | Bohr Tech GmbH general product catalogue (founded 1984, Spezialtiefbau supplier). Overburden rotary/rotary, auger, rotary-percussive, drive-drilling and HDI **systems**, anchor and large-bore tooling. **Tooling only, no rigs.** | NO for the rig |
| `C:\Users\henri\Downloads\Atpa\` | 43 files, 3 sampled | ATPA tooling maker. Sampled a workshop truck-loading still, a lathe close-up, and a welded auger/drive head on concrete. **No drill rig anywhere in the folder.** | NO |
| `C:\Users\henri\Downloads\` root images | swept by name | Drillity marketing, AI-generated images, UI screenshots, unrelated business paperwork. **No photograph of this machine class.** | NO |
| `research\10-oem-foundation.md` | A.3, A.9, D.1, D.2 | Already covers KLEMM (Bauer group, Drolshagen) and Comacchio as makers, the KR naming key, the class bands, and a short visual read of the micro/anchor rig. Its D.1 is the direct predecessor of this document. | YES - context |
| `research\11-oem-anchor-geotech-hdd.md` | A.1.1, the confined-conditions table, D.1, D.2 | The richest existing text on this class: the same KLEMM table, plus the two statements this document leans on most - *"a mast that dwarfs its carrier"* and the variable-width tracks as *"the class's defining animation"*, and the separate-power-pack umbilical as a visual signature. | YES - context |
| `research\12-oem-rock-tooling.md`, `research\16-site-archetypes.md` | grepped | 12 is rock tooling (what the rig runs, not what it is). 16 A.3 **"Slope, cutting and retaining wall"** is this rig's home site: a bench cut into a slope, anchor holes under 150 mm dia, access by platform, scaffold, crane basket or rope. **16 also records two existing domain bugs (D2, D4) where `anchor` is reachable by machines that should not have it** - unrelated to this rig but worth knowing. | YES - context |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` | `buildCrawlerLite()` | The game's current picture of the machine - read for comparison only, not edited. | reference |
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\tools.js` | grepped | Confirms the tooling side already exists for this rig's methods: SDA hollow anchor bars and sacrificial bits, casing/overburden (ring-bit, eccentric, concentric, wing-bit, casing shoes), augers. Nothing to correct here. | reference |

**Read but yielded nothing / not reached:** `EMDE-Anchor-Drilling.pdf` and
`SUNWARD_DRILLING-RIGS_S-SERIES_EN.pdf` were **not opened** in this pass. SUNWARD's S-series is a
surface top-hammer range and belongs with `crawler-th`, not here.

---

## 2. What the machine IS

A **light tracked drilling rig in the 5–6 tonne class**, built to drill *small-diameter holes
in awkward places*: ground anchors and soil nails into cuttings and retaining walls, micropiles,
grout-injection holes, site-investigation and core holes, shallow geothermal. It is not a
production rig — it is the machine you put where a 20-tonne rig cannot go. Everything about its
layout follows from two constraints: **it must fit through a gap** (KLEMM quote minimum widths
of **750 mm** for the KR 702-3 and KR 704-2E and **780 mm** for the KR 606-3, and minimum
headrooms of **2.0–2.2 m** — KLEMM p. 8), and **it must be able to point its mast anywhere**,
including horizontally and above the horizontal into a rock face. So the mast is not on a
fixed A-frame: it is on a slewing/tilting mast carrier at the very front of the machine, and
the driller stands **beside** the machine at a manual valve console rather than sitting in a cab.
Below roughly 6 t the class routinely has **no cab at all**, and often **no engine either** —
KLEMM's KR 606-3 and KR 702-3 are listed as "Drill Rig" weights only, driven by a **separate
diesel or electric power pack** parked off the machine and connected by hose (KLEMM pp. 8, 12).

## 3. Proportions

All figures below are read off the dimensioned GA on **p. 16 of `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf`**
unless another source is named. Scale checked twice against two independent dimensions on the
same drawing (3840 and 1500 both resolve to 3.15 mm/px at the render used), so the *derived*
figures marked "scaled" are good to roughly ±5 %.

| Dimension | Value | Source |
|---|---|---|
| Overall length, mast vertical, jacks down | **3840 mm** | GA p. 16, dimensioned |
| Overall height, mast vertical | **6200 mm** | GA p. 16, dimensioned |
| Feed stroke (carriage travel on mast) | **3600 mm** | GA p. 16, dimensioned |
| Overall width across tracks | **1400 mm retracted → 1700 mm extended** (variable-gauge undercarriage) | GA p. 16, dimensioned |
| Track shoe width | **300 mm** | GA p. 16, dimensioned |
| Height over the carrier body (top of rear deck furniture) | **1700 mm** | GA p. 16, dimensioned |
| Track wheelbase, idler centre → sprocket centre | **1500 mm** | GA p. 16, dimensioned |
| Track overall length (outside of idler to outside of sprocket) | ≈ **2000 mm** | scaled from GA p. 16 |
| Track assembly height (shoe bottom to top of track frame) | ≈ **390 mm** | scaled from GA p. 16 |
| Deck / main-frame underside above ground | ≈ **520 mm** | scaled from GA p. 16 |
| Engine-and-tank enclosure: length × height | ≈ **2330 × 630 mm**, top edge ≈ 1150 mm above ground | scaled from GA p. 16 |
| Track gauge (centre-to-centre), retracted | ≈ **1100 mm** (1400 overall − 300 shoe) | derived from GA p. 16 |
| Mast structure length (excl. ground clearance under the foot) | ≈ **5.0–5.5 m** | derived: 6200 overall height less mast-foot/clamp stack |

**Weight and power for the class** (KLEMM p. 8 — these are the numbers to argue from, not the
Comacchio brochure, which gives none):

| Model | Operating weight | Power | Min. headroom | Min. width |
|---|---|---|---|---|
| KR 606-3 | 4.9 t (rig only, separate power pack) | 45–55 kW | 2.0 m | 780 mm |
| KR 702-3 | 5.6 t (rig only, separate power pack) | 55–129 kW | 2.2 m | 750 mm |
| KR 704-2E | 5.1 t, **electric motor on board** | 45 kW | 2.2 m | 750 mm |
| KR 704-3G | 6.2 t, **diesel engine on board** | 55 kW | 2.2 m | 950 mm |

Comacchio give the GEO 305 up to **5 tonnes (≈49 kN) feed and retract force** and a mast
extension option "to handle 6 m above the clamps" (p. 16 bullet list).

### The ratios that matter for modelling

- **Length : width = 3840 : 1400 ≈ 2.7 : 1** (2.26 : 1 with the undercarriage extended).
- **Height (mast up) : length = 6200 : 3840 ≈ 1.6 : 1.** The machine is *taller than it is long.*
  This is the single most important proportion and the one a small rig is most often drawn wrong.
- **Track length : overall length = 2000 : 3840 ≈ 0.52.** The tracks cover only half the footprint;
  the mast and its clamp stack hang out in front of the idler, and the rear jack hangs out behind
  the sprocket.
- **Track height : body-top height = 390 : 1700 ≈ 0.23.** The undercarriage is a thin dark band
  under a tall pale body; it is *not* a chunky excavator undercarriage.
- **Feed stroke : mast height = 3600 : 6200 ≈ 0.58.**
- **Track width : gauge = 300 : 1100 ≈ 0.27.**

## 4. Component inventory

Sources for this section: the dimensioned GA and the photographs in
`Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` (pp. 2, 4, 7, 10, 13, 16) and the photo plate on
**p. 9 of `KLEMM_Lieferprogramm_Product_Range.pdf`** (KR 702-2, KR 702-3 with PP 55E,
KR 702-2R, PP 55E power pack). Where the two makers differ, both are recorded.

### 4.0 The one big structural fork - read this before modelling anything

There are **two different mast-carrying architectures in this class and they look different**:

- **"Vertical" / slide-frame type** - Comacchio GEO 305 (GA p. 16, photos pp. 2, 4). The mast
  is carried at the **very front of the machine on a fabricated slide frame**: a pair of parallel
  guide beams that let the whole mast translate fore/aft and up/down, plus a tilt pivot and one
  big diagonal dump ram. The mast stays roughly upright. Good for vertical and near-vertical holes.
- **"Fully articulated" / boom-stack type** - KLEMM KR 702 (photos 04, 05, 06 on p. 9). The mast
  is on a **stack of joints** - kingpost off the deck front, swing/lift arm, knuckle, then the feed
  beam - so it can be pointed **in any direction including horizontally and above horizontal into
  a rock face**. Research pack 11 SD.1 states this explicitly: *"Do not model the mast as a fixed
  vertical tower; the joint stack between carrier and mast is the interesting geometry."*

**The game currently builds the boom-stack type** (`buildCrawlerLite` makes a `boom` group with a
`mast-dump-ram` and a `boom-lift-ram`). That is a legitimate choice and matches the KLEMM pattern -
but the boom is *far too short and too simple*: it is one 1.10 m box with two small rams. On a real
articulated rig the joint stack is a visible, multi-jointed, hose-covered structure and the mast's
foot ends up **ahead of and below the track front**, not above the deck.

### 4.1 Mast / feed beam
- **Box section, not lattice.** Both makers use a welded rectangular/box-section beam. On the GEO 305
  GA the mast section reads about **400 mm deep** in side view. There is **no lattice anywhere on this
  class** - lattice belongs to the big vertical rigs. *The game's `buildFeedBeam` is correct in kind.*
- **Flat top plate pierced by a row of oval lightening slots** (GEO 305 p. 4, mast horizontal -
  clearly visible as a repeating row of stadium-shaped holes down the beam's top face). This is a
  cheap, high-value detail: it reads at distance and instantly says "fabricated plate beam".
- **The carriage runs on rails on the FRONT face**, on plain slide pads or rollers, not inside the
  section. Feed is by **hydraulic-motor-driven chain** (the chain and its top sheave are what the
  crown carries), not by a long cylinder - a cylinder feed would be visible on the GA and is not.
- **Feed stroke 3600 mm on a 6200 mm standing height** (GA p. 16). So the carriage travels roughly
  the middle 58 % of the mast. Pack 11 SD.1 records much shorter strokes for the smaller machines
  in the class (**1200 / 1700 / 2200 mm** on a Beretta T46), so mast length is genuinely variable -
  model the mid case and note it.
- **Mast crown**: a fabricated arm that **hooks forward over the hole** at the top, with a slotted
  lightening hole through it, carrying the feed-chain sheave and a lifting eye (GEO 305 GA p. 16
  detail; visible again in the p. 4 photo with a **service-winch rope running back down at a slant**
  to the machine). *This forward-hooking crown is a silhouette feature and the game does not have it.*
- **Cable/energy chain (drag chain)** running the length of the mast, carrying the head's hoses.
  On the GEO 305 (p. 4) it lies along the top of the beam as a light-grey plastic link chain and is
  one of the most recognisable things on the machine. *The game has no drag chain.*
- **Mast extension option** - Comacchio: "Mast extension to handle 6m above the clamps available"
  (p. 16). A **telescoping two-stage mast is therefore defensible** for this class, but the *default*
  machine on the GA is a single-stage beam.

### 4.2 The head - and the thing the game gets wrong
- On the GEO 305 GA (p. 16) and photos the head is a **ROTARY head, not a top-hammer drifter**:
  a squat rectangular gearbox body with a cylindrical hydraulic motor block on top, a second smaller
  block on the side, and a **tapered chuck / hollow spindle below** carrying the rod stub. It is
  painted **signal red** against the sand-coloured machine.
- KLEMM sell **both** for this class and they are interchangeable modules - **KH rotary heads** to
  61.5 kNm, and **KD hydraulic drifters** with 6.8-28 kg piston weight (KLEMM p. 5). The small heads
  from the KH table (p. 13) that fit this weight class: **KH 4-1 = 5.0 kNm / 360 rpm / 65 mm hollow
  shaft**, **KH 6DS = 3.2 kNm / 312 rpm / 20 mm**, **KH 5A = 6.5 kNm / 193 rpm / 89 mm**.
- **So the class's normal head is a rotary head with a hollow spindle, sometimes with a separate
  drifter above it for percussion.** The game builds only `buildDrifter` (percussion). Not wrong -
  the machine can carry one - but it means the game is showing the *less common* fit as the default,
  and the game's `torqueNm: 1800` is well under the 3.2-6.5 kNm the real small heads produce.
- **Double-head (drifter above, rotary below) is the visual tell of anchor/overburden work** -
  research pack 11, SD section. Two power units stacked on one carriage. Worth building as a variant.
- **If a drifter is fitted, this is what it drives** (`Einsteckende Klemm.pdf`, a dimensioned shank
  drawing for a KLEMM **KD 1215R**): a **12-tooth splined shank, 107.5 mm over the teeth, 746 mm
  long, 23 kg**, ending in a **BW64 rope thread (Eurodrill H64), 2 tpi left-hand**, with **internal
  flush down a 16 mm bore**. So the visible geometry at the head is: a splined stub entering the
  drifter's chuck, a shoulder, then a coarse-pitch rope-thread pin - *no shoulder-and-taper joint,
  no wrench flats.* Worth getting right because it is the joint the camera sees during a rod change.

### 4.3 Clamp / breakout unit at the mast foot - MISSING FROM THE GAME
On the GEO 305 GA (p. 16) there is a **boxy two-block assembly at the very bottom of the mast, at
ground level, forward of the track front**, with two horizontal cylinders projecting sideways out of
it. That is the **rod clamp and breakout clamp**: the lower jaw grips the rod in the hole, the upper
one turns to break the joint. Comacchio's own mast bullet refers to handling *"6m above the clamps"*
(p. 16), i.e. the clamps are the datum the machine measures from.

This assembly is **always there** on an anchor/micropile rig, it is at knee-to-waist level, it is
where the driller works, and it is where all the mud is. `buildCrawlerLite` has no clamp block at
all - the mast just runs down to nothing. **This is the single biggest missing component.**

### 4.4 Cylinders, and where the rods sit at working extension
- **Mast dump/tilt ram** - one big diagonal cylinder from a bracket low on the mast back to the
  carrier deck (GEO 305 GA p. 16, clearly drawn with barrel and exposed chrome rod).
- **Mast slide/crowd ram(s)** on the slide-frame type; **lift + knuckle rams** on the articulated type.
- **Track-gauge cylinders** - a **transverse cylinder with exposed chrome rod, visible under the belly
  between the two track frames**, that pushes the frames apart from 1400 to 1700 mm (GEO 305 p. 4
  photo, and the 1400-1700 dimension on the GA). *The game has no variable gauge and no such cylinder.*
  Pack 11 SD.1 calls the retract/extend transformation **"the class's defining animation."**
- **Stabiliser jacks** - GEO 305 GA shows one just behind the mast and one at the rear, both vertical,
  both a chrome rod out of a short barrel onto a round foot pad. KLEMM photos 04/05 show **four,
  with bright red round pads**. Game builds two front outriggers only - add the rear pair.
- **Rods at working extension**: the head sits at the top of its stroke with a **full rod length of
  clean pipe hanging below it inside the mast** and its bottom end in the clamp. Rod length for this
  class is **1.5-2 m** (pack 11 SD.2, from the KLEMM HBR handling table) - the game's `rodLen: 1.5`
  is right. Rod diameter in the game is 45 mm; the KH hollow shafts of 20/65/89 mm bracket that
  sensibly. When tripping, the joint being made is at chest height right above the clamp.

### 4.5 Hose routing
This class is **covered in hose** and that is a large part of how it reads. From the GEO 305 photos:
- **Large-bore blue thermoplastic hose** = water / flush, running from the machine body forward and
  up the mast to the swivel (p. 4, p. 13).
- **Black rubber hydraulic hose with silver crimped ferrules and blue-collared quick couplings**
  (p. 13), in bundles, with **black spiral hose-wrap** where they cross a moving joint (p. 2, p. 4).
- **A plastic drag chain** carries the head's hoses up the mast (p. 4) - the tidy route.
- The untidy route is the truth: a **loose bight of hose hanging in a catenary between the deck and
  the mast foot**, plus a bundle that swings when the mast tilts. `buildCrawlerLite` already models
  seven hose runs with drape and sway - that is the right instinct and probably its best feature.
- **Umbilical to a separate power pack.** On the KR 606-3 / KR 702-3 there is *no engine on the rig*;
  a bundle of large hoses leaves the machine and runs across the ground to a **separate 1.4-3.7 t
  power pack** (KLEMM p. 8, p. 12; photo 04 shows the second machine in the background and the hose
  bundle leaving frame left). Pack 11 SD.1: *"That umbilical is a strong visual signature - two
  objects, not one."* **The game does not have this and it is free scene-telling.**

### 4.6 Guarding, handrails, walkways, ladders
- **Welded wire-mesh guard panels in a bolted tube frame** are the dominant guarding idiom on this
  class - GEO 305 p. 2 shows a full mesh cage on the operator side; p. 4 shows a mesh-sided cage
  round the rod rack at the rear. This is *mesh*, not plate and not perforated sheet.
- **Punched raised-lug anti-slip decking** for the standing surfaces (GEO 305 p. 10, right edge).
- **A red perforated cylindrical guard basket** over the rotating spindle area (p. 4).
- **Handrails: present but small.** At 1700 mm body height there is no walkway a person stands on
  the way there is on a 20 t rig - the driller stands **on the ground beside the machine**. The
  game's `buildWalkway`/`buildHandrail`/`buildLadder` at 0.52 m deck height are plausible but must
  stay small; a full guarded catwalk would be wrong for 5 t.
- **A ladder is questionable at 520 mm deck height** - you step up, you do not climb. The game
  builds a 0.52 m ladder, which is about one step and reads as clutter at this scale.

### 4.7 Counterweight, cab, canopy
- **There is no counterweight on this class.** Pack 10 SD.1: *"No counterweight worth seeing, no
  slew superstructure to speak of."* The stability comes from the jacks and the extended tracks.
- **There is no cab.** KLEMM KR 702-2 (photo 04) has no cab and no canopy at all - just a low box.
  The Comacchio GEO 305 has no cab either; it has a **manual valve console on a bracket**, and a
  **radio remote-control belly-box** (GEO 305 p. 7 - a handset with eight paddle levers, a red
  mushroom E-stop, about twenty toggle switches and a clear flip-up lid, worn on a shoulder strap).
- **The control console** (GEO 305 pp. 2, 10) is the thing to model instead of a cab: a sand-painted
  sheet-steel box, a **raised strip along the top carrying 3-4 round chrome-bezel pressure gauges**,
  a bank of **8-12 black lever handles** in a row, **knurled chrome relief-valve adjusters** on the
  top deck, a **tubular guard rail bent over the levers** to stop them being knocked, a round white
  level/tilt indicator, and pictogram decal plates on the face.
- **`buildCrawlerLite` builds a canopy roof on two posts at 1.72 m plus a glazed screen panel.**
  A roof canopy is defensible on some machines in the class but the **glazed pane is not** - this
  machine has no glass at all. (The game's own header comment already notes the crawler-lite pane
  is invisible and paid for nothing; the domain answer is that it should not exist.)

### 4.8 Undercarriage
- **Variable-gauge crawler**: two track frames on transverse slides, **1400 mm closed to 1700 mm
  open** (GEO 305 GA p. 16). KLEMM/Beretta figures for the smallest machines: **750-950 mm closed**
  (KLEMM p. 8), **1.0 m closed to 1.4 m open** (Beretta T46, via pack 11 SD.1).
- **Shoe width 300 mm** (GA p. 16). Comacchio offer **steel tracks and rubber shoes** (p. 16 bullet);
  the photographed machine has **black rubber-padded steel-link tracks**.
- **Wheelbase (idler ctr to sprocket ctr) 1500 mm; overall track length about 2000 mm; track assembly
  height about 390 mm** (GA p. 16 + scaled).
- **Sprocket at the rear, idler at the front**, a small number of bottom rollers (the GA shows a
  short frame with two visible roller positions), **no top carrier roller** on a frame this short.
- The **track frame is a flat-sided box, painted a contrast colour** - signal red on the GEO 305
  against the sand body (p. 4), with **cast/forged tie-down loops painted red-orange** and yellow
  hazard decals along the side.
- Game: `trackLen 2.4, trackWidth 0.32, gauge 0.62, r 0.24` gives overall width 0.94 m, length 2.4 m.
  **Real is shorter and much wider: 2.0 m long, 1.40-1.70 m wide.** See section 9.

### 4.9 Winches and rod handling
- **A small service winch at the mast crown** with a rope running down the front of the mast -
  visible on GEO 305 p. 4 (a thin cable from the crown back to the machine at a slant). It is for
  lifting rods and casing into the mast, not for hoisting the string.
- **Rod rack**: on the GEO 305 p. 4 there is a **mesh-guarded rack at the rear of the machine**
  holding red-painted rods. Pack 10 SD.1 for the smaller machines: *"Rods are short and handled by
  hand or by a small carousel."* KLEMM's own carousels (**MAG 6.1**) are quoted for the 21.9 t
  KR 806-4GM, i.e. **a proper rotating carousel is a bigger-machine feature** (pack 10).
  **The game gives crawler-lite a 4-rod rotating carousel with a transfer arm. For 5 t that is
  generous** - a rack of loose rods plus hand loading is the honest fit, and cheaper to draw.

## 5. Distinctive features - thumbnail silhouette

Five things, in the order they survive being shrunk:

1. **Taller than it is long, and the mast is most of it.** 6200 mm high on a 3840 mm footprint,
   with a carrier only 1700 mm tall (GA p. 16). At thumbnail size this is a thin vertical stroke
   standing on a small dark dash. Pack 11 SD.1: *"a mast that dwarfs its carrier."*
2. **The mast overhangs the front of the tracks and reaches the ground.** The mast foot and its
   clamp block sit **ahead of the front idler and touch the ground**, so the machine's outline is an
   L, not a T (GA p. 16). No other class in the game does this.
3. **Wide, short, thin tracks under a narrow body.** 1400-1700 mm across on a 2000 mm track - nearly
   square in plan - and only about 390 mm tall. A splayed, low, spidery stance, not an excavator stance.
4. **No cab, no counterweight, no slew ring worth seeing.** The rear of the machine just ends in a
   louvred box and a jack. Anything with a cab in the silhouette is a different class.
5. **Hose everywhere, and possibly a second object.** A drag chain up the mast, bights of hose
   between deck and mast, and - for the power-pack variants - **a hose umbilical running off-machine
   to a separate small tracked box** (KLEMM pp. 8, 9, 12).

## 6. Materials and paint

- **Painted steel is nearly everything**: the body enclosure, the mast, the boom/slide frame, the
  track frames, the console, the guards. Sheet-steel panels with visible bolt heads and rounded
  corner returns; the mast and frames are welded plate with visible weld seams at the gussets.
- **Two-colour is the class norm.** Comacchio GEO 305: **pale sand/cream body and mast plus signal-red
  track frame, head and rod guards** (pp. 2, 4, 10). KLEMM: **bright orange overall** (KR 702-2,
  photo 04); customers repaint whole machines **yellow** (KR 702-3, photo 05). Take the *scheme*,
  not the hue - the game may pick its own.
- **The head is the colour accent.** On the GEO 305 GA the rotary head is the only red object on an
  otherwise sand drawing. Keep the head a different colour from the mast; it makes the feed stroke
  readable in motion.
- **Bare / chrome steel**: every cylinder rod (mast dump, jacks, track gauge) - bright, oil-filmed,
  and the one genuinely shiny thing on the machine. Also relief-valve adjuster knobs, gauge bezels,
  hose ferrules, and hydraulic fittings (GEO 305 pp. 10, 13).
- **Stainless / aluminium**: filter canisters and accumulators near the hydraulic block (p. 13).
- **Rubber**: track pads, hose outer covers, grommets. **Plastic**: the drag chain, the remote-control
  housing, decal laminates. **Glass**: essentially none - a couple of gauge faces and the clear lid
  of the remote handset. *No windows.*
- **Where wear, dirt and rust actually go on a working machine of this class:**
  - **The bottom metre of the mast and the clamp block** - cuttings, grout and drilling water come
    straight out of the hole here. This is the dirtiest place on the machine by a wide margin.
  - **The whole underside and the track frames** - spoil packed into the sprocket teeth and between
    the shoes; a tide line of dried mud up the frame sides to about half track height.
  - **The mast rails where the carriage slides** - polished bright by the carriage, dark grease at
    the ends of the stroke. Paint is gone here; it is the classic bright wear stripe.
  - **Cylinder rods** - bright where they stroke, a fine mist of oil and dust on the barrel behind
    the seal.
  - **Chipped paint on every edge that gets hit by a rod**: the mast mouth, the clamp jaws, the top
    of the guard rails, the corners of the deck.
  - **Rust: mostly not.** These are young, high-value, well-painted machines; real rust appears as
    **thin bleed lines under bolt heads and at weld toes**, and as orange staining running down from
    the clamp area. A machine rusted all over would read as scrap, not as a working rig.

## 7. Photo references

**Everything worth looking at for this class is inside two PDFs.** The loose images in
`C:\Users\henri\Downloads` (root) and in `C:\Users\henri\Downloads\Atpa` were swept and
**contain no photograph of this machine class** - see section 8.

### The good ones (extract these pages as PNG and put them on the modelling board)

| Reference | What it is good for |
|---|---|
| `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` **p. 16** | **The dimensioned GA - side and front elevation.** The one image to model from. Overall L/W/H, feed stroke, shoe width, wheelbase, variable-gauge range, mast-crown shape, clamp stack at the mast foot, jack positions. |
| same, **p. 2** | Three-quarter rear view in a workshop. Mesh guard cage, the manual valve console with its lever bank and gauge strip, hood louvres and hinged doors, track-frame tie-down eyes, rear jacks. |
| same, **p. 4** | **Full side elevation with the mast lowered to transport.** The single best component photo: mast top plate with oval lightening slots, the drag chain along the mast, the crown and its winch rope, the rear mesh-caged rod rack, the transverse track-gauge cylinder under the belly, red track frames against a sand body, four jacks. |
| same, **p. 7** | The radio remote-control handset (paddle levers, mushroom E-stop, clear lid, shoulder strap). Good for a prop and for justifying "no cab". |
| same, **p. 10** | Close-up of the manual valve console: gauge strip, knurled relief adjusters, pictogram decals, punched raised-lug anti-slip decking at the edge. |
| same, **p. 13** | Hydraulic-block close-up: finned cooler, stainless filter canisters, blue-collar quick couplings, silver crimped hose ferrules, black drag chain with a blue water hose in it. Material reference. |
| `KLEMM_Lieferprogramm_Product_Range.pdf` **p. 9** | Photo plate of the whole small end of the class: **04** KR 702-2 (orange, articulated boom stack, mast near-vertical, no cab, red jack pads, umbilical leaving frame to a second machine); **05** KR 702-3 in customer yellow with a PP 55E power pack; **06** KR 702-2R with the mast folded back over the deck for transport; **08** PP 55E - the separate tracked power pack, an excellent second object for the scene. |
| `KLEMM_Lieferprogramm_Product_Range.pdf` **p. 8** | The Confined Conditions table (weights, power, min headroom, min width) - not a picture but the numbers that keep the model honest. |

A working extraction command (PyMuPDF is installed on this machine; poppler/pdftoppm is not,
so the Read tool cannot render PDF pages directly):

```python
import pymupdf
d = pymupdf.open(r"C:\Users\henri\Downloads\Comacchio-GEO-305Pres_2023_FULL_WEB.pdf")
d[15].get_pixmap(dpi=300).save("geo305_GA.png")   # p.16 is index 15
```

## 8. NOT SOURCED

Honest gaps. None of these should be invented; each is a thing to either find or leave out.

**Dimensions and mass**
- **Operating weight of the GEO 305 itself.** The brochure gives no weight anywhere. The 4.9-6.2 t
  used above is the **KLEMM** confined-conditions band (p. 8) standing in for the class. The two
  makers' machines are not the same machine.
- **Mast structure length as a separate number.** Only the 6200 mm standing height and the 3600 mm
  feed stroke are dimensioned; the mast's own length is inferred.
- **Mast section width and depth**, carriage width, rail spacing - all scaled off a 1:x brochure
  drawing, never dimensioned.
- **Ground clearance**, track ground-contact length (as opposed to the 1500 mm wheelbase), number
  and spacing of bottom rollers, sprocket tooth count, shoe pitch.
- **Slew range of the mast about the vertical**, mast tilt range in degrees, boom joint travel.
  Nothing in either PDF quantifies the articulation, and it is exactly what the game animates.
- **Engine make/model, exhaust stack position, radiator and fan position**, fuel and hydraulic tank
  capacities and where the fillers are.
- **Cab-less operator position**: no source states where the driller is meant to stand relative to
  the machine, or how far the remote-control working distance is.

**Components**
- **Whether this class normally carries a rod carousel at all.** The GEO 305 photo shows a
  mesh-caged rack; KLEMM's rotating MAG carousels are quoted only for 20 t+ machines. **No source
  found either way for a 5 t rotating carousel.** The game already builds one.
- **The rear-mounted round-faced unit** on the GEO 305 GA (behind the sprocket, on a swing arm).
  Could be a winch, a hose reel, a water pump or a remote receiver. **Not identified.**
- **Where the water/flush pump lives** and whether it is on the machine or off it.
- **Rod diameter and thread** actually used on this class. `tools.js` has the tooling (SDA hollow
  anchor bars, casing and overburden systems, augers) but nothing here ties a rod OD to this rig.
- **Dust/cuttings collection.** Nothing on either machine suggests a cyclone or a dust hood; on a
  wet-flush anchor rig there would not be one. Not confirmed either way.

**Materials**
- **No paint code found for either maker** (no RAL number is printed in either PDF). Colours above
  are read off photographs.
- **No decal, plate or pictogram artwork is reproduced here on purpose** - see the naming rule.

**Sources checked and found NOT useful for this rig's geometry**
- `2-1-EMDE-Katalog-Ankerbohren.pdf` (52 pp.) - a **tooling** catalogue: drive-drilling, overburden
  drilling with rotary drive and with hydraulic top drifter, double-head drilling, augers, HDI
  single/double, accessories. Excellent for what hangs *below* the machine and already covered by
  research pack 12; **contains no rig general arrangement.** Not read past the contents and the
  drive-drilling size list.
- `C:\Users\henri\Downloads\Atpa\` (43 files) - ATPA is a **tooling manufacturer**. Sampled
  `atpa-de-slide-3.jpg` (a truck being loaded in a workshop), `atpa-de-slide-10.jpg` (a lathe cutting
  a bar) and `WhatsApp Image 2026-06-23 at 13.53.05 (5).jpeg` (a welded auger/drive head lying on
  concrete - good tooling reference, heat-tint colours on fresh weld). **No drill rig in the folder.**
- `C:\Users\henri\Downloads` root images - swept by name; the population is Drillity marketing,
  Gemini/ChatGPT generated images, screenshots and unrelated business documents. **No photograph of
  a light anchor crawler found.** Generated images must not be used as geometry sources anyway
  (research pack 18 makes the same point about the Facebook reel).
- `Einsteckende Klemm.pdf` - opened: a **KD 1215R drifter shank-adapter** drawing. Real and useful,
  but it describes the *string interface*, not the machine. See section 1.
- `Bohrtech_Katalog24_f25.pdf` - opened: **tooling only**, no rigs.
- `EMDE-Anchor-Drilling.pdf` and `SUNWARD_DRILLING-RIGS_S-SERIES_EN.pdf` - **NOT OPENED** in this
  pass. SUNWARD's S-series is a surface top-hammer range and belongs to `crawler-th`, not here;
  `EMDE-Anchor-Drilling.pdf` is very likely the English twin of the German EMDE tooling catalogue.
  **Expected yield for this rig: low.**

## 9. Domain-truth warnings vs the current game build

Read against `buildCrawlerLite()` in `src\rig\rigFactory.js`. Nothing here is edited - this is a
list for whoever owns that file.

### 9.1 Wrong by a lot - the stance

| | Game | Real (GEO 305 GA p. 16) | Effect |
|---|---|---|---|
| Overall width across tracks | `gauge 0.62 + trackWidth 0.32` = **0.94 m** | **1.40 m closed, 1.70 m open** | Game is 33-45 % too narrow |
| Track length | `trackLen 2.4` | **~2.0 m** | Game is 20 % too long |
| **Width : track length** | **0.39** | **0.70-0.85** | **This is the error that matters.** The game's machine is a long thin sled; the real one is nearly square in plan and splays wider to work. |
| Track shoe width | `0.32` | **0.30** | fine |
| Deck height | `deckY 0.52` | **~0.52 m** | correct, keep it |
| Body length | `bodyD 1.60` | **~2.33 m** | Game body is 30 % short for its tracks |
| Mast height | `mastH 4.2` | **6.2 m standing** (mast structure ~5-5.5 m) | Game mast is short; its feed stroke works out at ~2.2 m against a real 3.6 m. Defensible only if this is deliberately the *small* end of the class (a Beretta T46 does run 1.2/1.7/2.2 m strokes) - but then the tracks should shrink too, not stay long. |

**No variable-gauge undercarriage.** Research pack 11 SD.1 calls the track retract/extend
*"the class's defining animation"*, Comacchio dimension it **1400-1700** and offer it as a headline
bullet, and KLEMM sell the whole class on **750-950 mm minimum width**. The game has a fixed gauge
and no transverse gauge cylinder. This is the highest-value single addition on the list.

### 9.2 Missing components, in order of visual payoff
1. **The clamp / breakout block at the mast foot, at ground level, ahead of the tracks** (GEO 305
   GA p. 16). Absent entirely. It is the machine's business end.
2. **Variable-gauge tracks + the transverse gauge cylinder** under the belly (GEO 305 p. 4).
3. **The forward-hooking mast crown** with its feed-chain sheave, lifting eye and slotted web
   (GA p. 16). The game's mast just stops.
4. **The drag chain up the mast** carrying the head hoses (GEO 305 p. 4).
5. **Oval lightening slots in the mast's face plates** (GEO 305 p. 4). Nearly free; reads at range.
6. **Rear stabiliser jacks.** Game has two front outriggers; GA shows front and rear, KLEMM photos
   show four with red pads.
7. **The separate power-pack variant and its hose umbilical** (KLEMM pp. 8, 9, 12). Two objects,
   not one - and it gives the scene a second thing to look at for very little geometry.
8. **A service winch at the crown** with a visible rope (GEO 305 p. 4).

### 9.3 Present but wrong
- **`cabGlass` / the glazed screen panel.** This machine has **no glass**. The file's own header
  already records that crawler-lite's pane "is buried inside the body and cannot be seen from any
  angle" and paid a full render pass for nothing. The domain answer agrees with the perf answer:
  **delete it.** Model the control screen as an unglazed painted bezel, or as the real thing - a
  **manual lever console with a gauge strip and knurled relief adjusters** (GEO 305 pp. 2, 10).
- **The 0.52 m ladder** (`buildLadder ... h: 0.52`). At a 520 mm deck you step up. A ladder here is
  clutter that reads as scale-confusion.
- **The 4-rod rotating carousel with a transfer arm.** Generous for 5 t. KLEMM's rotating magazines
  start at 20 t+ machines (pack 10). The sourced fit for this class is a **rack** of short rods,
  mesh-guarded (GEO 305 p. 4), plus hand loading. Keep the carousel only if the game needs the
  animation; do not treat it as documented.
- **The percussive drifter as the only head.** The GEO 305 GA shows a **rotary head**; KLEMM sell
  KH rotary heads *and* KD drifters as interchangeable modules for this class (KLEMM pp. 5, 13).
  A rotary head - or a **double head**, drifter over rotary, which pack 11 calls the visual tell of
  anchor/overburden work - is the more representative default.
- **Two-stage telescoping mast.** Real default is a single-stage box beam; the telescope is an
  *option* ("mast extension to handle 6m above the clamps", GEO 305 p. 16). Not wrong, but it should
  not be presented as what the class is.
- **The boom is too short.** `boom` is a single 1.10 m box with two small rams. Both real
  architectures (slide frame or articulated stack) put a visibly larger, multi-jointed structure
  between deck and mast, and both put the **mast foot ahead of and below the track front** - the
  game's mast foot sits above the deck, which is what makes its silhouette read as a T instead of
  the class's L.

### 9.4 Spec-sheet numbers to revisit
| Field | Game | Sourced range | Note |
|---|---|---|---|
| `weightKg` | 3800 | **4900-6200 kg** (KLEMM p. 8) | Below the whole documented class. 5000-5500 would be honest. |
| `powerKw` | 37 | **45-55 kW** on-board; 55-129 kW via power pack (KLEMM p. 8) | Low. |
| `feedKn` | 25 | **up to ~49 kN** ("up to 5 tonnes feed and retract force", GEO 305 p. 16) | Low but inside the class if this is the small end. |
| `torqueNm` | 1800 | smallest KLEMM rotary heads are **3200 Nm (KH 6DS)**, **5000 Nm (KH 4-1)**, **6500 Nm (KH 5A)** (KLEMM p. 13) | Below the smallest catalogued head. |
| `rodLenM` | 1.5 | **1.5-2 m** (pack 11 SD.2) | **Correct.** |
| `methods` | auger, top-hammer, anchor, overburden, site-investigation | KLEMM: anchoring, micropiles, injections, ground investigation, well sinking, geothermal (p. 6). Comacchio GEO 305: wireline coring PQ/HQ/NQ, DTH 4-6 in, rotary auger/blade (p. 15). | Good. **Coring and jet grouting are both defensible additions**; the GEO 305 is explicitly a coring machine. |
| `klass` | "Geotechnical / anchor crawler" | matches | Keep. |
| `name` | "Nordvik NV-90 Scout" | - | **Correct pattern - invented name, no real badge.** Keep doing this. |

### 9.5 The naming rule, once more, for the modeller
Do **not** carry across, in geometry or in texture: the maker wordmarks and logo tiles on the
console and hood (GEO 305 pp. 2, 4, 10), the model designation, the "High Tech Line" strapline, the
maker's name on the track frame ID plates (KLEMM photos 04, 05), or the remote-control handset's
maker plate (p. 7). **Copy the *layout* - a red wordmark of that size in that place, a yellow
pictogram plate of that size in that place - and fill it with the game's own marks.** DOMAIN.md
Section 10.
