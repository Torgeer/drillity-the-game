# crawler-lite — Light multi-purpose geotechnical / anchor crawler (Comacchio / Klemm class)

status: IN PROGRESS — written live. Sections below are appended as sources are read.
Anything not yet cited is in §8 NOT SOURCED.

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
| `C:\Users\henri\Downloads\drillity-the-game\src\rig\rigFactory.js` | `buildCrawlerLite()` | The game's current picture of the machine — read for comparison only, not edited. | reference |

*(more sources appended below as they are read)*

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

*(being written — see the GA and photo notes below)*

## 5. Distinctive features — thumbnail silhouette

*(being written)*

## 6. Materials and paint

*(being written)*

## 7. Photo references

*(being written)*

## 8. NOT SOURCED

*(being written)*

## 9. Domain-truth warnings vs the current game build

*(being written)*
