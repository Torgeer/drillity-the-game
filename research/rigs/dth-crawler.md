# Engineering reference — `dth-crawler` (Surface DTH crawler drill)

> status: in progress
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

_(pending)_

## 5. Distinctive features (thumbnail silhouette test)

_(pending)_

## 6. Materials and paint

_(pending)_

## 7. Photo references

_(pending)_

## 8. NOT SOURCED

_(pending)_

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
