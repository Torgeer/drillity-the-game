# Hydraulic top-hammer drifters, and R32 / T38 extension rods

**Every figure here was read off a manufacturer PDF or product page that was
actually fetched and opened.** Where two manufacturer documents disagree, both
are given and neither is averaged. Where nothing was published, it says
`not found` — which is a finding, not a gap to fill in later from memory.

Rod tables here **extend** [`tools-rods-pipe.md`](tools-rods-pipe.md); read both.

---

## 1. Model names — check this before using any of them

Several drifter names in common circulation are wrong, discontinued, or belong
to a different product family. The full Epiroc rock-drill catalogue was
enumerated and every name probed directly.

| name | status |
|---|---|
| **COP 1028** | current |
| **COP 1132** | **discontinued** — 404, absent from the catalogue. Launched 2005; spare shank adapters still listed |
| **COP 1238** | current model is **COP 1238K**; plain "COP 1238" 404s |
| **COP 1435** | discontinued, **replaced by COP SC14** — they share shank adapter 469-19004,10, listed as "COP 1435, RR14, SC14" |
| COP 1028HD · COP 1032 · COP 1238ME | **do not exist** / discontinued |
| **COP 5 · COP 6** | **no such hydraulic drifters.** See §4 — almost certainly a confusion with **COP 628** (6 kW hydraulic) or the **pneumatic DTH COP M6** |
| **Montabert HC 25 / 28 / 50** | current |
| **Montabert HC 109** | **legacy only** — in the 2010 range brochure, absent from the current range. Current equivalent is **HC 110** |
| **Montabert HC 50 Dyna** | **not found** in any Montabert or Komatsu source. Current variants are HC50 and HC50 ATEX |

**Complete current Epiroc small-drifter list:** COP 1022, COP 1025, COP 1028,
COP 628, COP SC14, COP 1238K, COP RR11, COP RR14.

### The 4–5 t rig class

FlexiROC T15 R — **3 570 kg**, rubber-tyred, chain tracks optional — carries
**COP 1022 / COP 1028**. FlexiROC T20 R — **5 600 kg** Tier 3 / **6 500 kg**
Stage V, tracked — carries **COP SC14**. The game's `crawler-lite` at 4.5 t sits
between the two.

---

## 2. Epiroc hydraulic drifters

| | COP 1022 | COP 1028 | COP 628 | COP SC14 | COP 1238K | COP 1132 *(disc.)* |
|---|---|---|---|---|---|---|
| Impact power | 4.5 kW ¹ / 4 kW ² | 5.5 kW | 6 kW max | 14 kW max | 12 kW nom | 11 kW max ³ |
| Input power max | not found | not found | 15 kW | not found | 26 kW | not found |
| **Weight** | **50 kg** approx | **51 kg** approx | **98 kg** | **81 kg** ⁴ | **172 kg** | ~75 kg ³ |
| Length w/o shank | not found | not found | **380 mm** | **735 mm** | **1 008 mm** | 200 mm shorter than COP 1032 ³ |
| Width incl. connectors | not found | not found | 296 mm | 290 mm | 285 mm | not found |
| Height | not found | not found | 285 mm | 194 mm | 223 mm | not found |
| Height over drill centre | not found | not found | 185 mm | 77 mm | 88 mm | not found |
| Frequency | 70 Hz | 50 Hz | 100 Hz | 80 Hz | 40–60 Hz | not found |
| Impact energy | not found | 110 J ³ | not found | not found | not found | 110 J ³ |
| Hydraulic pressure max | 150 bar | 185 bar | 220 bar | 210 bar | 220 bar | not found |
| Percussion flow | not found | not found | 45 l/min | 85 l/min | 61–79 l/min | not found |
| Rotation torque max | 126 Nm | 205 Nm | 305 Nm | 657 / 825 Nm | 640 / 1000 / 1550 Nm | not found |
| Rotation speed | not found | not found | 0–750 rpm | 0–250 / 0–200 | 0–340 / 0–210 / 0–140 | not found |
| Rotation motor sizes | not found | not found | 100 cc | 160 / 200 cc | 100 / 160 / 250 cc | not found |
| Hole range | 25–41 mm | 25–51 mm | 28–35 mm | 35–64 mm | 51–89 mm | 33–51 mm ³ |
| **Shank adapter** | HEX 22×108 | R25, R28, R32, SR28, SR32, tapered 7° | SR22, SR25, SR28 | R32E, T35E, TC35E | R32, R38, T38, T45 | R28, SR28, R32 male; R32 female ³ |
| Flushing water press. | not found | not found | 25 bar | 25 bar | 20 bar | not found |

¹ rig brochure · ² product page — **Epiroc's own two documents disagree**
³ **Not a manufacturer datasheet.** Atlas Copco press release reproduced by trade
press, 29/10/2005, <https://tunnelbuilder.com/News/New-COP-1132-Rock-Drill-from-Atlas-Copco.aspx>.
Same source gives COP 1032 = 7.5 kW / 165 J.
⁴ **81 kg** in the drill brochure, **75 kg "approx"** in the T20 R rig brochure —
two Epiroc documents disagreeing again. Both cited; do not average them.

COP 1025 has a product page but publishes only 30–41 mm and 5.5 kW.

**Sources.** Product pages under
`epiroc.com/en-us/products/parts-and-services/rock-drills-and-rotation-units/rock-drills/`
for COP 1022, 1025, 1028. Brochure PDFs: COP 628 `9865 0122 01`, COP SC14
`9865 0009 01`, COP 1238K `9865 0024 01`. Rig brochures: FlexiROC T15 R
`9868 0026 01c` (2026-01) — the **only** source for COP 1022/1028 weight, bar,
Hz and Nm — and FlexiROC T20 R `9868 0055 01c`.

### Shank adapter geometry

Epiroc *Tophammer drilling tools Product catalog*, doc **9866 0424 01**,
2024-12, pp. 12–13.

| rock drill | thread | length mm | Ø D mm | Ø strike face | spline | spline L | spline Ø | dim |
|---|---|---|---|---|---|---|---|---|
| COP 1028 | R32 (403-07202,10) | 400 | 45 | 25 | straight | 55 | 33 | 7 |
| COP 1028 | R28 / SR28 / SR32 | 400 | 45 | 25 | straight | 55 | 33 | 7 |
| COP 1028 | R25 female | 245 | 45 | 25 | straight | 55 | 33 | 7 |
| COP 1132, RR11 | R32 (403-15701,10) | 410 | 35 | – | straight | 79 | 38 | 5 |
| COP 1132, RR11 | R32 (403-15704,10) | 500 | 35 | – | straight | 79 | 38 | 5 |
| COP 1132, RR11 | SR28 / TC35 | 435 / 500 | 35 | – | straight | 79 | 38 | 5 |
| COP 1435 | T35 (433-19004,10) | 500 | 35 | – | **helical** | 79 | 38 | 5 |
| COP 1435, RR14, SC14 | TC35 (469-19004,10) | 500 | 35 | – | **helical** | 79 | 38 | 5 |
| COP 1032HL | R32 / T38 | 340–550 | 45 | 34 | straight | 59 | 54 | 9 |
| COP 1036/1038/1238 | R32 / T38 / T45 | 485–575 | 38–45 | 34 | straight | 74 | 54 | 9 |
| COP 628 | SR22 / SR25 / SR28 | 245 | 30 | 38 | straight | 37–39 | 53–54 | 9 |

**The helical splines on the SC14/1435 family are the single easiest visual cue
to get right** — they read as a corkscrew where every other drill has straight
splines.

---

## 3. Montabert (Komatsu) HC series

**Three manufacturer sources disagree on several figures.** All are given.

| | HC 20 | HC 25 | HC 28 | HC 50 | HC 109 *(legacy)* | HC 110 |
|---|---|---|---|---|---|---|
| Weight, Komatsu sheet | – | **72 kg** | **103 kg** | **103 kg** | – | **215 kg** |
| Weight, montabert.com | – | 72 kg | 104 kg | **118–122 kg** | – | not published |
| Weight, 2010 brochure | 69 kg | 71 kg | – | 102 kg | **142 kg** | 201 kg |
| Length w/o shank, Komatsu | – | 694–702 | 785 | 826 | – | 1 093 |
| Length, montabert.com | – | 700–714 | 843.5 | 825–848 | – | – |
| Length, 2010 brochure | 679 | 702 | – | 830 | **1 095** | 1 244 |
| Length **with** shank | – | 779–839 | 913 | 996–1 007 | – | 1 210 |
| **Width** | – | **200** | **226** | **314** | – | **333** |
| **Height** | – | **191.5** | **200** | **164.5** | – | **200.5** |
| Height above shank axis | – | 83.5 | 86 | 75.5 | – | 107.5 |
| Output power, Komatsu | – | 6–8 kW | 6–9.8 kW | 12–14 kW | – | 24–32 kW |
| Output power, montabert.com | 2–4 kW | 5–8 kW | 6–9.5 kW | 7–13 kW | – | 17–27 kW |
| Input power | – | 16 kW | 16 kW | 21–23 kW | – | 41–54 kW |
| Percussion flow max | – | 65 l/min | 68 l/min | 90–105 | – | 150–170 |
| Percussion pressure max | – | 150 bar | 160 bar | 130–150 | – | 165–190 |
| **Frequency** | – | **3 900 bpm · 55–65 Hz** | **3 200 bpm · 47–55 Hz** | **3 300–4 200 bpm · 40–62.5 Hz** | – | **3 800–4 300 bpm** |
| Impact energy max | – | 117 J | 160 J | 180–220 J | – | 250–380 J |
| Hole range | 26–51 | 32–51 | 32–64 | 45–76 | 48–102 | 51–89 |
| **Shank adapters** | Hex25×108, Hex22×108, R25F, R32F | D45: H25F, R28F, R32F, R32M, R38M, T38M | R25F, R28F, R32F, R32M, T35M, R38M, T38M | D45 H25F/R32F, D38 R32M/R38M/T38M | R38M, T38M, T45M | D45 R38M/T38M/T45M, D51 T51M |
| Water flushing | – | 20–50 l/min | 30–60 | 30–60 | – | 130 |
| Lube air @ 3 bar | – | 300 l/min | 300 | 300 | – | 250–300 |

**Rotation motors** — displacement / max rpm / oil flow / max pressure / max torque:

- **HC 25** — 100 cc: 300 rpm / 30 l/min / 175 bar / 251 Nm · 125 cc: 300 / 37.5 / 175 / 313 · 160 cc: 300 / 48 / 175 / 401
- **HC 28** — 160 cc: 300 rpm / 48 l/min / 175 bar / 480 Nm
- **HC 50** — 31 cc: 235 / 25 / 140 / 230 · 43 cc: 209 / 30 / 140 / 305 · 55 cc: 193 / 35 / 140 / 385 · 67 cc: 237 / 52 / 140 / 466
- **HC 110** — 80 cc: 291 / 65 / 210 / 670 · 100 cc: 269 / 75 / 210 / 840 · 160 cc: 175 / 78 / 210 / 1340

**Montabert states HC 25 and HC 28 use a patented IN-LINE rotation system** —
not a side-hung motor. No such claim for HC 50. **This changes the silhouette
and must not be modelled the Epiroc way.**

Sources: Komatsu spec sheets for HC25, HC28, HC50, HC110, HC95 LM under
`komatsu.com/.../spec-sheet/drifter-retrofits/`; product pages at
`montabert.com/en/product/`; 2010 HC range brochure, doc **86715521-EN**.

---

## 4. The COP naming trap — hydraulic vs pneumatic

Epiroc uses "COP" for **two unrelated families**, and confusing them puts the
wrong machine on screen:

| family | type | models | where it works |
|---|---|---|---|
| COP nnnn · COP SCnn · COP 628 | **hydraulic top-hammer drifter** | 1022, 1025, 1028, 628, SC14, SC19, SC25, 1238K, 1638+ | sits **outside** the hole, on the feed beam |
| COP M-series · COP Gold | **pneumatic down-the-hole hammer** | M6, M7, M8; 44/54 Gold; W4 2.0 | travels **down inside** the hole, behind the bit |

There is **no** pneumatic "COP 5" or "COP 6". The nearest real names are **COP
M6** (6″ pneumatic DTH, 165–171 mm bits) and **COP 628** (6 kW hydraulic
drifter).

---

## 5. What a drifter actually looks like

Read off photographs and renders opened at high magnification: COP 1238K
brochure p. 2; COP SC14 brochure pp. 1–2; COP 628 brochure p. 2; Komatsu HC 50
spec sheet p. 1.

**Overall form — not a "long flat body".** A **stubby, chunky casting**: a
stepped block roughly 3–4 lengths long by 1 wide. COP 1238K 1008 × 285 × 223;
COP SC14 735 × 290 × 194; **COP 628 is almost cubic at 380 × 296 × 285**.
Cross-section is a rounded-corner rectangle, **wider than tall**, reading as a
fat cylinder half-buried in a slab. Epiroc drills are gloss black (1238K, 628)
or grey (SC14); Montabert are bright green with a **red front-guide collar**.

**Front / shank end.** Tapers through a stepped, near-conical **front head** to a
small round mouth, with a bronze **front guide bushing** visible in the mouth on
the SC14. The **shank adapter** projects as a stub with prominent **helical
splines** on the Epiroc drills. On the HC 50 the protruding shank is plain black
with a smooth taper.

**Rear end.** Squared off, carrying a manifold face with several drilled ports.
The COP 1238K has a long **cylindrical accumulator/damper tube** along the
top-rear, parallel to the axis.

**Rotation motor — on the SIDE, low down, not on top.** On the COP 1238K and
COP 628 it is an unmistakable **flat "pancake" orbital motor** bolted to the
flank about a third back from the front, with its own pair of ports on its outer
face. The COP SC14 instead carries **two squat cylinders side by side** on the
flank — motor plus damper accumulator — each with a **yellow-capped charging
valve**. **Exception: Montabert HC 25 and HC 28 are in-line** (see §3).

**Hoses and ports — counted from the COP 628 photograph, not published.** They
cluster in the **rear half, on the side opposite the shank**; nothing enters the
front head. Counted: **two large steel nipples on the upper rear manifold**
(percussion feed and return), **two more on the rotation-motor face** (rotation
feed and return), plus **at least two smaller fittings** lower down (flushing
water, lubrication air), and a yellow-capped charging valve on the motor. So
roughly **four large and two small, all rearward-facing**. "AIR" is cast into
the flank of the COP 1238K beside its lubrication port.

**Attachment to the feed — not a slide rail on the drifter itself.** The casting
carries **flat machined pads with bolt holes and discrete bolted feet**; the
COP 628 has a clear rectangular mounting foot with a through-hole at the bottom
front, the SC14 machined flats with bolt bosses along its top face. These bolt
to a **separate cradle**, and the *cradle* slides on the feed beam's rails. The
FlexiROC T15 R photo shows the result: an aluminium-profile feed beam carrying
the drill-and-cradle assembly, with a heavy corrugated **hose bundle looping
from the rear of the drifter back along the beam**.

The COP 1132 was advertised as mountable **left- or right-handed without moving
the hoses**, which implies a symmetric port layout.

**Montabert-specific.** The HC 50 render shows a **monobloc body with no
tie-rods** — Montabert states this explicitly for HC 25/28/50 — so the surface is
smooth and sculpted. Epiroc drills by contrast show prominent **hex-headed side
bolts** clamping the front head to the body. **That is the clearest
brand-silhouette difference between the two.**

---

## 6. Extension rods — R32 and T38

Reported per manufacturer, never merged.
**No manufacturer among the four publishes thread pitch in mm.** All four
publish only the nominal size: **R32 = 1¼″ rope thread, 32 mm** ·
**T38 = 1½″ trapezoidal thread, 38 mm**.

### 6.1 Epiroc — Tophammer catalog, doc 9866 0424 01, 2024-12

No weights, no thread pitch published.

**R32**

| product | body | section mm | flush mm | coupling Ø | lengths mm |
|---|---|---|---|---|---|
| extension rod MM | round 32, wrench flat | 32 | **11.7** | – | 915, 1000, 1220, 1525, 1830, 2200, 2400, 3050, 3660, 4000, 4310 |
| extension rod MM | hex 25 | 28.4 | 8.6 | – | 1000 |
| **speed rod MF** | round 32 | 32 | 11.7 | **46** | 1220, 1525, 1830, 2400, 3050 |
| drifter rod R32–Hex32–R38 | hex 32 | 35.8 | 9.6 | – | 2400, 2700, 3090, 3700, 4310, 4600 |
| drifter rod R32–Hex35–R38 | hex 35 | 39.6 | 9.5 | – | 3090, 3700, 4310, 4920, 5530 |
| drifter rod R32–Hex32–T38 | hex 32 | 35.8 | 9.6 | – | 2400, 3090, 3400, 3700 |
| drifter rod R32–Hex35–T38 | hex 35 | 39.6 | 9.5 | – | 2700, 3090, 3700, 4310, 4500, 4920, 5530, 6095, 6400 |

**T38**

| product | body | section mm | flush mm | coupling Ø | lengths mm |
|---|---|---|---|---|---|
| extension rod MM | **round 38**, wrench flat | 38 | **14.5** | – | 1830, 3050, 3660, 4000, 4270 |
| extension rod MM | hex 32 | 35.8 | 9.6 | – | 3050, 4000 |
| **speed rod MF** | round 38 | 38 | 14.5 | **57** | 600, 915, 1220, 1525, 1830, 2400, 3050, 3660, 4270, 4880, 5530 |
| speed rod MF | round 45 | 45 | 17 | 65 | 6095 |
| drifter speed rod MF | hex 35 | 39.6 | 9.5 | 57 | 3700 |

*Arithmetic note, not a published claim:* Epiroc's "section" for hex rods tracks
across-**corners**, not across-flats — Hex 25→28.4, 28→31.8, 32→35.8, 35→39.6,
all ≈ AF × 1.13. The shape name gives the across-flats.

### 6.2 Sandvik — Top hammer drilling tools 2024

**The only one of the four that publishes a weight for every rod.**

**R32**

| product | body | D mm | flush mm | wrench flat | female end | length → kg |
|---|---|---|---|---|---|---|
| MF-rod R32–round 32–R32 | round | 32 | **9.2** | 25.4 | **Ø45** | 915→5.4 · 1220→7.0 · 1525→9.0 · 1830→10.5 · 2435→13.5 · 3050→16.9 · 3660→20.2 · 4265→23.4 |
| extension rod MM ¹ | round | 32 | **11.7** | 25.4 | – | 1220→6.4 · 1830→9.8 · 2435→13.1 · 3050→15.0 · 3660→19.8 · 4265→23.1 |
| drifter rod R32–Hex28–R28 | hex 28 | 28 | 8.8 | – | – | 2475→12.3 · 2630→13.1 · 2785→13.9 · 3090→15.4 · 3700→18.5 · 4305→21.5 |
| drifter rod R32–Hex25–R25 | hex 25 | 25 | – | – | – | 1870→7.2 … 3700→14.3 |
| guide tube | round | 46 | – | – | Ø46 | 1830, 3050 |
| coupling sleeve R32 | – | **44** | – | – | – | L 150 |

¹ **Catalogue error flagged.** This block is printed under the heading *"Drifter
rod, T38 – Hex 32 – R32"*, but its own drawing shows a plain **round** MM rod
labelled **R32 at both ends**, and Sandvik's own numerical weight index lists
these part numbers (7853-3324-30 … 7853-3343-30) as **"EXTENSION ROD R32 R32"**.
Treat it as an R32 round-32 MM extension rod.

**T38**

| product | body | D mm | flush mm | wrench flat | female end | length → kg |
|---|---|---|---|---|---|---|
| MF-rod T38–round 39–T38 | round | **39** | **14.5** | – | **OD 56** | 915→8.0 · 1220→10.4 · 1525→12.8 · 1830→15.3 · 2435→20.1 · 3050→25.1 · 3660→29.9 · 4265→34.8 · 4875→39.6 |
| extension rod MM | round | 39 | 14.5 | **32** | – | 915→7.0 · 3050→24.4 · 3660→29.0 · 4265 listed |
| drifter rod T38–Hex32–R32 | hex 32 | 32 | 9.6 | – | – | 3090→19.6 · 3700→23.5 · 4305→27.3 |
| drifter rod T38–Hex35–R32 | hex 35 | 35 | 9.5 | – | – | 2475→19.0 · 3090→24.0 · 3700→28.7 · 4305→34.0 · 4915→38.2 · 5525→43.0 · 6135→47.8 · 6440 listed |
| drifter rod R38–Hex35–R32 | hex 35 | 35 | 9.5 | – | – | 3090, 3700, 4305, 4915, 5525 |
| drifter rod R38–Hex32–R32 | hex 32 | 32 | 9.6 | – | – | 3700, 4305, 4915 |
| coupling sleeve T38 | – | **55** bench / **52** face | – | – | – | L 191 |

### 6.3 Robit — Top Hammer Product Catalogue 2/2025

**Robit does not use "T38" for rods.** Its 1½″ thread is designated **C38**
(CT38 for shoulder-drive tubes). Reported as printed.

| product | body | threads | flush mm | length → kg |
|---|---|---|---|---|
| extension **M/M** R32–round 32–R32 (FC) | RND32 | R32/R32 | **11.7** | 915→4.6 · 1220→6.3 · 1525→8.0 · 1830→9.7 |
| extension **M/M** R32–round 32–R32 | RND32 | R32/R32 | 11.7 | 3050→16.5 · 3660→19.8 |
| extension **M/F** R32–round 32–R32 (FC) | RND32 | R32/R32 | 11.7 | 915→5.3 · 1220→7.3 · 1525→8.9 · 1830→10.5 |
| extension **M/F** R32–round 32–R32 | RND32 | R32/R32 | 11.7 | 3050→17.1 · 3660→20.9 |
| extension **M/F** C38–round 39–C38 (FC) | RND39 | C38/C38 | **14.5** | 1220→10.9 · 1525→13.5 · 1830→16.0 |
| extension **M/F** C38–round 39–C38 | RND39 | C38/C38 | 14.5 | 3050→25.6 · 3660→30.4 · 4265→35.2 |
| extension **M/M** C38–round 39–C38 | RND39 | C38/C38 | 14.5 | 3050→24.3 · 3660→29.2 |
| drifter R32–Hex25–R25 | HEX25 | R32/R25 | 8.6 | 2175→8.5 · 2475→9.6 · 2630→10.2 · 2750→10.6 · 2795→10.8 · 3090→12.0 · 3340→13.0 |
| drifter R32–Hex28–R28 | HEX28 | R32/R28 | 8.8 | 1870→9.5 · 2175→11.0 · 2475→12.5 · 2795→14.1 · 3090→15.6 · 3340→16.9 |
| drifter C38–Hex32–R32 | HEX32 | C38/R32 | 9.6 | 2400→15.3 · 3090→19.7 · 3700→23.6 · 4305→27.4 |
| drifter C38–Hex35–R32 | HEX35 | C38/R32 | 9.5 | 3090→23.9 · 3700→28.7 · 4305→33.5 · 4915→38.3 · 5525→43.1 |
| drifter R38–Hex32–R32 | HEX32 | R38/R32 | 9.6 | 3090→19.7 · 3700→23.6 · 4305→27.4 · 4915→31.3 |
| drifter R38–Hex35–R32 | HEX35 | R38/R32 | 9.5 | 3090→23.9 · 3700→28.7 · 4305→33.5 |

### 6.4 Rockmore International — Product Handbook, rev. 3/1/2023

Publishes **lengths, body OD/hex and thread designation only**. **Weight: not
found. Rod flushing hole: not found** — the "flushing hole" columns in this
handbook are for bits. Its value is listing **metric and imperial lengths side
by side**.

| product | body | lengths mm |
|---|---|---|
| R32–R32–Rd 32, carburized | round 32 | 610, 915, 1000, 1220, 1525, 1830, 2000, 2435, 3000, 3050, 3660, 4265, 4915, 5490 |
| T38–T38–Rd 39, HF hardened | round 39 | 1000, 1220, 1500, 1525, 1830, 2000, 2435, 3000, 3050\*, 3660, 4000, 4265 (\*wrench flats) |
| T38–T38–Rd 39, tandem thread | round 39 | 3050, 3660, 4265 |
| T38–T38–Rd 39, carburized | round 39 | 915, 3050, 3660, 4265 |
| R38–R38–Rd 39, HF hardened | round 39 | 1220, 1830, 2435, 3050, 3660, 4265 |
| R32–R32–Hex 32 | hex 32 | 1500, 2350, 2475, 2700, 3090, 3400, 3700, 4005, 4305, 4915 |
| R32–T38–Hex 32 | hex 32 | 2475, 2600, 3090, 3400, 3700, 4005, 4305, 4915, 5525 |
| R32–T38–Hex 35 | hex 35 | 2475, 3090, 3700, 4305, 4460, 4915, 5525, 6140, 6400 |
| R25–R25–Hex 25 | hex 25 | 610, 915, 1000, 1220, 1500, 1525, 1830, 2100, 2435, 3050, 3660, 4305 |

Rockmore's own wording: **"R32 — 1-1/4″ ROPE THREAD (32 mm)"**,
**"T38 — 1-1/2″ TRAPEZOIDAL THREAD (38 mm)"**. Also offers proprietary **XR32**
and an **MF-rod R32M–T38F–Hex 35**.

### 6.5 Cross-manufacturer summary

- **Lengths.** The imperial-derived series — 610/915/1220/1525/1830/2435/3050/
  3660/4265 — is catalogued by **all four**. **True metric lengths
  (1000/1500/2000/3000/4000) are catalogued by Epiroc and Rockmore only.** So
  **"1200 / 1800 / 2400" are not listed by anyone**; the real values are
  **1220 / 1830 / 2435**. Any rod length in the game ending in a round hundred
  is probably invented.
- **Body OD.** R32 round = **32 mm** everywhere. T38 round = **39 mm** at
  Sandvik, Robit and Rockmore; **Epiroc calls the same rod "round 38"** with
  section 38. **That 38-vs-39 is a real catalogue difference, not rounding.**
- **Hex sizes.** R32 rods in hex 25 / 28 / 32 / 35 and round 32; T38 rods in
  hex 32 / 35 and round 38–39.
- **MM vs MF.** **No manufacturer designates either as "the standard".** All
  four catalogue both for round rods. Hex rods are essentially always **MM with
  two different threads** — larger at the shank end, smaller at the bit end.
- **Flushing hole**, consistent across Epiroc / Sandvik / Robit: R32 round MM
  **11.7 mm**; R32 round MF **9.2 mm** (Sandvik); T38 round 38/39 **14.5 mm**;
  hex 32 **9.6**; hex 35 **9.5**; hex 28 **8.8**; hex 25 **8.6**.
- **Thread pitch in mm: NOT FOUND in any of the four catalogues.**

---

## 7. What a rod actually looks like

From dimensioned catalogue drawings opened and viewed: Robit 2/2025 p. 34;
Sandvik 2024 p. 45 and p. 17.

**Round MM extension rod.** A plain cylindrical bar. At **each end** the coarse
thread is cut over a short length, and **the thread crest diameter is essentially
equal to the body OD** — R32 thread on a 32 mm body — joined by a short conical
run-out. **There is no dramatic upset**; the silhouette is nearly a
constant-diameter cylinder with two ribbed ends. Two shallow milled **wrench
flats** appear as recessed rectangular pads, one about a quarter and one about
three-quarters along. A through flushing bore runs the full length.
Proportionally a 3050 × 32 mm rod is **~95:1** — extremely slender, with the
threaded portion at each end only a few percent of the length.

**Round MF "speed" rod.** Asymmetric, and this is where the real upset is. One
end is a **smooth cylindrical female box, clearly fatter than the body** —
Sandvik R32 **Ø45 box on a Ø32 body**, T38 **OD 56 on Ø39**; Epiroc quotes the
same as coupling Ø 46 and 57. The box steps down through a short shoulder and
taper. The other end is a normal male thread. **Sandvik dimensions L from the
shoulder of the female box to the tip of the male thread** — check that before
scaling from a drawing.

**Hex drifter rod.** The hexagonal prism runs **the great majority of the
length**. At both ends the hex **runs out through a short forged taper** — the
six corners fade into a round neck over roughly 1.5–2× the hex width — and the
neck becomes the male thread. Here the ends **are** visibly upset: on Sandvik's
R38–Hex35–R32 the R38 shank-end thread is noticeably **fatter than the hex
across-flats**, while the R32 bit end is about equal. The rod is **asymmetric by
design** — larger thread at the shank end, smaller at the bit end, with the
larger end's threaded section the longer of the two. **No wrench flats**, because
the hex is the wrench surface.

**Coupling sleeve**, needed to join MM rods: a plain thick-walled tube.
**R32: L 150 × Ø44. T38: L 191 × Ø52–55** (Sandvik); Epiroc R32 sleeve Ø44.

---

## 8. NOT RESEARCHED

**Mitsubishi Materials, Brunner & Lay and Bulroc** — the session that produced
this hit a 200-call web-search limit before reaching them. Everything above was
fetched and read directly; nothing here is from memory.
