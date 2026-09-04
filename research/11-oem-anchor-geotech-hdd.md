# 11 — OEM research: anchor / micropile / geotechnical / sonic / CPT / HDD

**Purpose.** Source material for two *separate* game systems. Keep them separate.

1. **"Fits rig / brand" is a real iMarket facet** (`DOMAIN.md` §6). This file documents
   real **model-series naming conventions** and, in §C, **what physically has to match**
   for a part to fit a machine. That is the compatibility logic the shop models.
2. **The game's own machines must be original** (`DOMAIN.md` §6, §10; `PLATFORM_TRUTH.md`
   Part C rule 4). §B gives **capability envelopes** — weight / torque / feed force /
   percussion / mast length / kW bands — so invented rigs land in believable classes.

> **HARD RULE, repeated.** Never use a real model designation as an in-game product
> name. `KR 806-5G`, `MC 22`, `D24x40`, `JT40`, `HBR 605`, `TG 63-150`, `AVN 1200`
> are **reference data only**. Invent names; borrow only the *class*.
>
> **Second hard rule.** `DOMAIN.md` §10 forbids using any single supplier's parts
> catalogue or part numbers in the game. The Eurodrill catalogue read for §C is full of
> order numbers — **none are reproduced here**, only the fit *logic*.

**Sourcing discipline.** Every number below carries a URL or a local filename. Anything
that could not be confirmed is marked `UNVERIFIED` or `INFERRED` and left visible rather
than quietly filled in. Ranges across a series are labelled as ranges.

---

## §0. Source index

### Local files (`C:\Users\henri\Downloads\`)

| File | What it gave |
|---|---|
| `KLEMM_Lieferprogramm_Product_Range.pdf` (KLEMM Bohrtechnik GmbH, **August 2025**) | The single richest source here. Complete KR rig list with weights/power, full KH rotary-head torque table, full KD drifter table, MAG/HBR rod handling, KA excavator attachments, PP power packs, HDI jet-grouting figures, grout pump/mixing plant tables. |
| `EURODRILL_DRILLING_ACCESSORIES_BOHRZUBEHOER_2025_26.pdf` | The shank-adapter compatibility matrix used in §C: drifter model → shank shaft Ø → available thread profiles, with hand (LH/RH) and box/pin. |
| `Drilltechniques-Sonic-Brochure.pdf` | Sonic head specs: Toa Tone EP-26N, SP-50, SP-8000; Sonic Drill Corp / Sonicor 50K and 33K. Also names the rigs the heads were mounted on. |
| `Structural_drilling_using_the_high-frequency_sonic-in-Slovenia.pdf` (peer-reviewed, RMZ, received Sept 2016) | Sonic physics: eccentric masses, sinusoidal wave, resonance, liquefaction, "frequencies of up to 150 Hz may be generated". |
| `Comacchio-GEO-305Pres_2023_FULL_WEB.pdf` (Drilltechniques, 2023) | GEO 305 depth-by-method table; mast feed/retract "up to 5 tonnes". |
| `EMDE-Anchor-Drilling.pdf` / `2-1-EMDE-Katalog-Ankerbohren.pdf` | The anchor-drilling *method* list a tooling house organises around, and confirmation that shank adapters are cut "for usual drifters" — i.e. cross-brand. |
| `DTD-Glossary-of-HDD-Terminology.pdf` | HDD vocabulary. **Note:** checked for mini/midi/maxi definitions — **it does not define them.** Class boundaries in §B come from trade press instead. |

### Web sources
Cited inline at each claim. Principal ones: `klemm.de`, `equipment.bauer.de`,
`huette-bohrtechnik.com`, `comacchio.com`, `tescar.com`, `fraste.com`, `geax.it`,
`pagani-geotechnical.com`, `apvandenberg.com`, `terrasonicinternational.com`,
`vermeer.com` / `protips.vermeer.com`, `ditchwitch.com`, `tracto.com`,
`herrenknecht.com`, `akkerman.com`, `americanaugers.com`, `prime-drilling.de`,
plus `hddbroker.com` and `thedriller.com` for published specs and class boundaries.

---

# §A. Per manufacturer

## A.1 KLEMM Bohrtechnik — the reference for anchor and micropile drilling

**Who.** KLEMM Bohrtechnik GmbH, Wintersohler Str. 5, 57489 **Drolshagen, Germany**
(`KLEMM_Lieferprogramm_Product_Range.pdf`, back cover). Part of the **BAUER Group** —
Bauer hosts KLEMM's rig launches on its own equipment site
(https://equipment.bauer.de/en/klemm-drilling-rigs-bauma-2025), and the KLEMM product
range routes its pumps/mixing plants through "BAUER MAT Slurry Handling Systems, a
branch company of BAUER Maschinen GmbH" (same PDF, Pumps and Mixing Plants page).

**Segment they own.** Anchor drilling, micropiles, injection/jet grouting. Their own
claim: "More than 2500 KLEMM drill rigs carry out all types of drilling jobs for
anchoring, micro piles, injections, ground investigation, well sinking and geothermal
drillings" (same PDF, Drill Rigs page). Their drifters are described as "the bench mark
in the special foundation industry" with "more than 50 years of experience" (same PDF,
Hydraulic Drifters page) — marketing copy, but it reflects the trade view: in European
anchor and micropile work KLEMM is the machine other machines are compared to.

**Marketing signature.** "DYNAMIC POWER", "Made in Germany", lowest TCO (same PDF).

### A.1.1 The product-range shape — this is the important structural fact

KLEMM does not sell a rig; it sells a **kit that composes**. From the Product Range page
of `KLEMM_Lieferprogramm_Product_Range.pdf`:

| Series | What it is | Published range |
|---|---|---|
| **KR** | Drill rigs | **4 t to 32 t** total operating weight |
| **PP** | Hydraulic power packs, diesel or electric | **45 kW to 129 kW** |
| **KA** | Excavator attachment systems | (2 models, see below) |
| **KD** | Hydraulic drifters | piston weight **6.8 kg to 28 kg** |
| **KH** | Hydraulic rotary heads | torque **up to 61.5 kNm** |
| **MAG** / **HBR** | Rod handling for single and double strings | see A.1.5 |
| **MBS** | Drilling data recording + "B-Report" software | — |
| — | Jet grouting (HDI): one-, two-, three-phase | see A.1.6 |

**Game-design read:** this composability *is* the mechanic. A rig is a **carrier +
mast + rotary head and/or drifter + rod-handling magazine**, and the same carrier
appears in four different application tables with different tops. That is a far better
model than "buy rig, rig has stats."

### A.1.2 KR series — model list and what the designation encodes

Two sources, both authoritative, that disagree slightly on weight because the website
quotes current configurations and the PDF quotes August 2025 ones. **Both are given.**

**Confined conditions** (`KLEMM_Lieferprogramm...pdf`, Confined Conditions table) — this
is the low-headroom / restricted-access class and the numbers are the interesting part:

| Model | Weight (PDF) | Power | **min. headroom** | **min. width** |
|---|---|---|---|---|
| KR 606-3 | 4.9 t (rig) + separate power pack | 55 kW / 45 kW | **2.0 m** | **780 mm** |
| KR 702-3 | 5.6 t (rig) + separate power pack | 129 kW / 55 kW | 2.2 m | 750 mm |
| KR 704-2E | 5.1 t | 45 kW, electric on-board | 2.2 m | **750 mm** |
| KR 704-3G | 6.2 t | 55 kW, diesel on-board | 2.2 m | 950 mm |

Website figures for the same class: KR 606-3 4.8 + 2.0 t, 45/55 kW; KR 702-3 5.6 t +
3.4 t, 129 kW; KR 704-2E 5.1 t, 45 kW; KR 704-3G 6.8 t, 55 kW
(https://www.klemm.de/en/products-1/drilling-rigs/).

**Universal / anchor** (PDF, Universal Applications table):

| Model | Weight | Power | Main hydraulic circuits |
|---|---|---|---|
| KR 800-3G | 9.0 t | 100 kW | 2 × 120 l/min LS |
| KR 801-3GK | 10.6 t | 129 kW | — |
| KR 801-3GS | 11.6 t | 129 kW | 2 × 150 l/min LS |
| KR 805-3G | 15.0 t | 160 kW | 2 × 190 l/min LS |
| KR 806-3E | 23.5 t | 140 kW **electric** | 2 × 246 l/min LS |
| KR 806-3GS | 19.5 t | 175 kW | 2 × 240 l/min LS |
| KR 806-4E | 23.5 t | 140 kW **electric** | 2 × 240 l/min LS |
| KR 806-4GM | 21.9 t | 175 kW | 2 × 320 l/min LS |
| KR 806-5G | 21.9 t | 180 kW | 2 × 240 l/min LS |
| KR 806-5GP | 22.4 t | 245 kW | 2 × 270 l/min LS |
| KR 807-7G | 26.0 t | 180 kW | 2 × 270 l/min LS |
| KR 807-7GP | 26.5 t | 245 kW | 2 × 270 l/min LS |
| KR 909-2 | 13.3 t | 129 kW | 2 × 150 l/min LS |
| KR 909-3G | 13.6 t | 129 kW | 2 × 150 l/min LS |

**Vertical:** KR 708-3G 10.3 t / 129 kW; KR 709-3G 18.2 t / 175 kW (PDF). Website adds
**KR 710-3G 20.2 t / 175 kW** (https://www.klemm.de/en/products-1/drilling-rigs/).

**Geothermal:** KR 708-3GW 13–14 t / 129 kW; KR 717-3GW 26–29 t / 250 kW;
KR 805-3GW 18–20 t / 175 kW — all "depending on configuration" (PDF).

**Jet grouting (HDI)**, with the spec that matters for that method — **single-pass depth**:

| Model | Weight | Power | max. single-pass drill depth |
|---|---|---|---|
| KR 801-3GS | 11.6 t | 129 kW | 12.5 m |
| KR 909-2 / 909-3G | 13.3 / 13.6 t | 129 kW | 16.5 m |
| KR 805-3G | 17.5 t | 160 kW | 16.5 m |
| KR 806-3E | 23.5 t | 140 kW | 18.0 m |
| KR 806-3GS | 20.0 t | 175 kW | 18.0 m |
| KR 709-3G | 18.2 t | 175 kW | 20.0 m |
| KR 806-5G | 21.9 t | 180 kW | 21.2 m |
| **KR 720** | **32.0 t** | 123 kW | **25.0 m** |

#### Designation decode

| Element | Meaning | Confidence |
|---|---|---|
| `KR` | the drill-rig series | **Sourced** — "KR series", PDF Product Range page |
| leading digit `6 / 7 / 8 / 9` | chassis/mast family, **not** a clean size ladder | `INFERRED`. Evidence: the families group by application table, but KR 909-3G (13.6 t) is lighter than KR 806-3GS (19.5 t), so it is not a monotonic size code. Do not model it as one. |
| suffix number `-2 / -3 / -4 / -5 / -7` | generation / mast-kinematics variant | `INFERRED` — KR 909-2 is EU Stage IIIA while KR 909-3G is Stage V (PDF footnotes), consistent with a generation index |
| `E` | **electric drive** | **Sourced** — KR 704-2E "Elektro, integriert"; KR 806-3E/-4E "Elektrisch angetrieben" (PDF). Corroborated by the PP series: PP 45E/PP 55E electric, PP 55G/PP 117G diesel |
| `G` | **on-board diesel** | **Sourced** — KR 704-3G "Diesel, integriert" (PDF); same E/G split in PP series |
| `P` | **uprated power** | **Sourced** — KR 806-5G 180 kW vs KR 806-5**GP** 245 kW; KR 807-7G 180 kW vs -7**GP** 245 kW (PDF) |
| `W` | **geothermal / water-well configuration** | **Sourced** — every `-GW` model sits in the "Geothermische Bohrungen" table (PDF) |
| `M` | magazine-equipped | `UNVERIFIED` — plausible given KR 806-4GM's rod magazine coverage (https://www.geodrillinginternational.com/piling/news/1382971/klemm-launches-kr-806-4gm-anchor-drilling-rig) but KLEMM does not state it |
| `S`, `K` | configuration variants | `UNVERIFIED` — no source found |

#### Mast designation — a second, cleaner code
KLEMM masts are named `<family>/<number>`, and the number × 10 is the feed force in kN,
with **retraction = half of feed**:

| Mast | Feed / retraction | Source |
|---|---|---|
| 202/**10** | **100** / 50 kN | KR 806-3GS and KR 806-5GP pages |
| 202/**13** | **130** / 65 kN | KR 806-3GS page |
| 203/**13** | **130** / 65 kN | KR 806-5G and -5GP pages |
| 303/**10** (HPI) | **100** / 50 kN | KR 806-3GS and KR 806-5G pages |
| 303/**13** | **130** / 65 kN | KR 806-5GP page |

Sources: https://www.klemm.de/en/products-1/drilling-rigs/kr-806-5g-5gp/ and
https://klemm.de/en/products-1/drilling-rigs/kr-806-3gs/.
The `×10 = kN` rule is `INFERRED` but every one of the five data points fits it.
The `20x` vs `30x` prefix tracks mast frame family (303 is the HPI/jet-grouting mast).

Feed rates, same sources: **standard 5–11 m/min, fast 27–65 m/min** (KR 806-5G);
5/11 and 5/9 m/min (KR 806-3GS).

**Worked example — KR 806-5G / -5GP** (https://www.klemm.de/en/products-1/drilling-rigs/kr-806-5g-5gp/):
19.7 t; 180 kW (TCD 6.1 L6) or 245 kW (TCD 7.8 L6); mast frame 4,800 / 7,000 / 7,600 mm
with up to 2,500 mm extension and lattice extensions 6,000 + 4,000 + 3,000 mm giving
**single-pass depth up to 21,100 mm**; chassis width 2,700 mm, chain 500 mm 3-rib,
ground clearance 350 mm, ground pressure 68 kN/m². Hydraulics: two load-sensing main
pumps at 240 l/min, up to **350 bar**. Fits **KH 62** (quoted there at max **54 kNm** on
this rig — lower than the 61.5 kNm catalogue maximum, so **rotary-head torque is
rig-limited, not head-limited**; model that), plus KH 39 or KH 21 in double-head, and
drifters **KD 3428R** or **KD 1215R**.

**Worked example — KR 806-3GS** (https://klemm.de/en/products-1/drilling-rigs/kr-806-3gs/):
19.5 t; 175 kW (Stage V) or 160 kW (Stage IV); chassis 2,500 mm standard / 2,600 mm
optional; masts 202/10, 202/13, 303/10; frame 7,300–7,600 mm, up to 18,200 mm with
lattice mast. Head/drifter: rotary **KH 39**, drifter **KD 3428**, double-head
**KH 39 + KD 1215R** or **KH 39 + KH 21**. Method: "anchor drilling with overburden
drilling methods and double-head systems."

### A.1.3 KH rotary heads — full table
From `KLEMM_Lieferprogramm_Product_Range.pdf`, Hydraulic Rotary Heads page. Speeds are
"max. data in continuous operation".

| Type | max torque (kNm) | max speed (rpm) | hollow shaft Ø (mm) |
|---|---|---|---|
| KH 6DS | 3.2 | 312 | 20 |
| KH 4-1 | 5.0 | 360 | 65 |
| KH 5A (axial piston motor) | 6.5 | 193 | 89 |
| KH 10A (axial piston) | 9.5 | 224 | 120 |
| KH 9 | 10.1 | 193 | 82 |
| KH 10S | 10.2 | **607** | 64 |
| KH 11-1 | 10.7 | 212 | 95 |
| KH 9SK | 10.8 | 193 | 94 |
| KH 14SK | 14.5 | 243 | 120 |
| KH 12SK | 14.8 | 140 | 140 |
| KH 17 | 15.2 | 326 | 103 |
| KH 15 (formerly KH 12) | 15.3 | 306 | 82 |
| KH 21A (axial piston) | 19.1 | 224 | 120 |
| KH 21 | 20.4 | 243 | 120 |
| KH 25 (formerly KH 22) | 24.4 | 203 | 102 |
| KH 34 (formerly KH 27) | 33.6 | 221 | 102 |
| KH 41 | 40.8 | 102 | 150 |
| KH 47 | 46.8 | 143 | 150 |
| **KH 62** | **61.5** | 161 | **180** |

**Decode:** `KH <max torque in kNm, rounded>`. Holds for KH 4-1, 5A, 9, 15, 21, 25, 34,
41, 47, 62. **Breaks** for the `SK` sub-family (KH 9SK = 10.8, KH 12SK = 14.8,
KH 14SK = 14.5) and for KH 17 (15.2) and KH 10S/10A. State the rule with its
exceptions — do not present it as absolute.

**Note the inverse relationship**: torque up, speed down, hollow shaft up. KH 10S is the
outlier — 607 rpm at 10.2 kNm through a 64 mm shaft, i.e. a **speed head**. That
trade-off (torque vs rpm vs bore) is a clean, real basis for a game upgrade tree.

Floating spindle ("Gewindeausgleich") is available on request on KH 4-1, 11-1, 21, 34
and 62. Many heads "can also be incorporated into our double head units."

### A.1.4 KD hydraulic drifters — full table
Same PDF, Hydraulic Drifters page. **KLEMM publishes torque, speed and piston weight —
not impact energy in joules.** No joule figure for the KD series was found in any source
consulted; treat percussion energy for this brand as `UNVERIFIED` and use piston weight
as the proxy the manufacturer itself uses.

| Type | max torque (kNm) | max speed (rpm) | piston weight (kg) |
|---|---|---|---|
| KD 408 | 5.0 | 360 | 6.8 |
| KD 511 | 5.5 | 362 | 11.5 |
| KD 1011 | 11.0 | 362 | 11.5 |
| KD 1108 | 10.7 | 212 | 6.8 |
| KD 1215R | 16.7 | 297 | 14.3 |
| KD 2117 | 20.4 | 243 | 16.5 |
| KD 2524 (formerly KD 1624) | 24.4 | 203 | 24.0 |
| KD 3428 (formerly KD 2728R) | 33.6 | 211 | 28.0 |
| KD 4724 | 46.8 | 143 | 24.0 |

**Decode — this one is strong:** `KD <max torque in kNm> <piston weight in kg>`.
KD 2117 → 20.4 kNm / 16.5 kg. KD 2524 → 24.4 / 24.0. KD 3428 → 33.6 / 28.0.
KD 4724 → 46.8 / 24.0. KD 511 → 5.5 / 11.5. KD 1011 → 11.0 / 11.5.
KD 1108 → 10.7 / 6.8. The only partial misfit is **KD 1215R** (16.7 kNm vs "12"), likely
because the `R` variant is offered in more than one torque configuration — the PDF notes
"further torque and rotation variations possible". Flag it, don't hide it.

"Rotating, mechanical damping on request" on KD 511, 1011, 2117, 2524, 3428, 4724.

**Drifter/head pairings actually published** (rig product pages, cited above):
KR 806-3GS → KH 39 + KD 3428, double-head KH 39 + KD 1215R.
KR 806-5G/-5GP → KH 62 / KH 39 / KH 21 + KD 3428R or KD 1215R.
KLEMM singles out **KD 1011 and KD 1215R** as "proven to be very successful when
incorporated in double head systems" (PDF).
*(Note: `KH 39` appears on the rig pages but not in the Aug-2025 catalogue rotary-head
table — a catalogue/website mismatch, left as-is rather than reconciled by guesswork.)*

### A.1.5 Rod handling — MAG and HBR
> ⚠️ **Naming collision to be aware of.** **KLEMM `HBR` = a rod-handling gripper
> loader / manipulator.** **HÜTTE `HBR` = their entire drilling-rig series.** Same three
> letters, completely different things, both German anchor-drilling houses. If the game
> models a "fits-rig" facet this is exactly the kind of trap that makes a real driller
> trust or distrust the shop.

Functional principles, from the PDF Rod Handling page:

| Types | Principle | Mounts on | String |
|---|---|---|---|
| MAG 2.1, 2.1V, 2.3V, 2.5; MAG 8.0–8.3 | Rack / box magazine | drill rig | single / double |
| MAG 3.0, 4.0, 4.1, 6.0, 7.0 | Linear magazine | drill rig | single |
| MAG 1.2, 1.3, 1.4 | Carousel magazine | drill rig | single / double |
| HBR 120, 122, 124 | Gripper loader | drill rig | single |
| HBR 50, 180, 181, 200, 300, 301, 360 | Manipulator | **mini excavator** | single / double |
| (HBR handling system) | Handling system | auxiliary crane / drill rig | single / double |

The HBR 120/122/124 modular table gives the fit gate that matters: **rod OD clamping
range** — HBR 120 handles **76.1–177.8 mm**, HBR 122 **114.3–254 mm**, HBR 124
**133–356 mm** — plus rod length (1.5–4 m), number of clamps (1–3), clamp spacing
(350–1000 mm), system weight (290–880 kg) and the **slewing torque (3,600–8,700 Nm)
and tilt-rotator torque (900–4,400 Nm) the carrier must supply**. That last pair is a
genuine cross-machine compatibility constraint: the manipulator only fits if the
excavator's tiltrotator can produce the required moment.

### A.1.6 Jet grouting (HDI) and grouting plant
HDI systems (PDF, Jet Grouting Systems page): drilling tubes for **one-phase (grout)**,
**two-phase (grout–air)** and **three-phase (grout–water–air)**; flushing heads, nozzle
holders, nozzles, drill bits; MBS 5 data recording; mixing plants; backflow suction hose
pumps. High-pressure injection pumps on request:
**240–600 kW · max 700 bar · max 400 l/min.**

Grouting/flushing pumps DP 36-B → DP 160-E: **13 → 600 l/min**, **80–140 bar**,
**4.0 → 55 kW**. Grouting units VS 41-E → VS 110-D: 36 → 175 l/min, 55–100 bar,
9.5 → 37.0 kW. Automatic units AVS 110-E → AVS 550-D: 175 → 320 l/min, 100–140 bar,
mixer 200–500 l, storage 500–1,500 l, nominal mixing **8.0 → 18.0 m³/h**, 30.6 → 55 kW.
(All PDF, Pumps and Mixing Plants pages.)

### A.1.7 Excavator attachments — KA
| | KA 140 | KA 162 |
|---|---|---|
| Total length | 6,137 mm | 7,050 mm |
| Slide stroke | 4,500 mm | 4,500 mm |
| Feed / retraction force | **30 kN** | **60 kN** |
| Feed / fast feed | 13 / 40 m/min | 7 / 36 m/min |
| Required flow min/max | 140 / 250 l/min | 170 / 280 l/min |
| Max pressure | 250 bar | 270 bar |
| Weight without adaption | 2.0 t | 4.3 t |

(PDF, Excavator Attachments page.) This is a distinct, cheap **entry class** for the
game: a mast bolted to a hired excavator, no dedicated carrier.

### A.1.8 Methods KLEMM machines perform
From the accessories page of the PDF: **rotary, rotary-percussive, overburden and
double-head drilling**; geothermal and flush drilling; rotary and rotary-percussive
augers, **displacement augers and hollow-stem augers**; casing extractors and casing
breaking devices; **preventers for double-head and duplex systems**; jet-grouting
flushing heads, tubes, nozzle holders and nozzles.

Maps onto `DOMAIN.md` §1 as: `anchor`, `overburden`, `jet-grouting`, `dth`,
`top-hammer`, `auger`, `displacement`.

---

## A.2 HÜTTE Bohrtechnik

**Who.** HÜTTE Bohrtechnik, **Olpe, Germany** (https://huette-bohrtechnik.com/) —
roughly 20 km from KLEMM's Drolshagen. The Sauerland is the world's anchor-drilling
cluster; that geographic fact is good colour for the game.
Ownership/acquisition history: `UNVERIFIED` — not confirmed from a primary source.

**Segment.** Micropiles, ground anchors, foundations; the HBR 605 is "specially designed
for anchor drilling with **double-head units**" with two load-sensing main pumps
(https://huette-bohrtechnik.com/micropiles-and-anchors/hbr-605-4/).

**HBR series.** Grouped by leading digit — 2xx, 5xx, 6xx, 7xx. Note that HÜTTE's
headline published force is **extraction (pull) force**, not feed — a different
convention from KLEMM's feed/retraction pair, and worth mirroring as a per-brand quirk.
All from https://huette-bohrtechnik.com/micropiles-and-anchors/:

| Model | Engine power | Extraction force | Weight |
|---|---|---|---|
| HBR 202 D/E | 65 / 55 kW | 62 kN | 8,200 / 7,200 kg |
| HBR 203 D/E | 119 kW | 62 kN | *(figure scraped as "2700–6200 kg" — implausible against the 202; `UNVERIFIED`)* |
| HBR 203-3 | 100 kW | 50 kN | 6,700 kg |
| HBR 204 | 209 kW | 150 kN | 18,000 kg |
| HBR 207 | 209 kW | **400 kN** | **32,000 kg** |
| HBR 502-3 | 142 kW | 50 kN | 12,500 kg |
| HBR 504-2 | 160 kW | 100 kN | 16,000 kg |
| HBR 508-2 | 160 kW | 50 kN | 15,000 kg |
| HBR 602 | 186 kW | 100 kN | 16,900 kg |
| HBR 605-4 | 186 kW | 100 kN | 16,900 kg |
| HBR 608-4 | 186 kW | 100 kN | 16,900 kg |
| HBR 610 | 209 kW | 130 kN | 24,000 kg |
| HBR 610 L | 160 kW | 130 kN | 20,400 kg |
| HBR 710 | 209 kW | 130 kN | **42,500 kg** |

HBR 605 overall weight also quoted as **14,800 kg "depending on mounted equipment"**
(https://pdf.directindustry.com/pdf/huette-bohrtechnik/hbr-605/57764-243079.html) versus
17,000 kg for the HBR 605-4 with 186 kW and 2,500 mm crawler width — again, **weight is
configuration-dependent across this whole segment**. Model that as a range, never a point.

HBR 605-4 swivels: rear **540 rpm at 100 bar water**, front **390 rpm at 50 bar**, rod
applications **60–114 mm** and **79–194 mm** nominal (manufacturer page above).
HBR 203 is described as a **cellar drill rig** with **19 kNm** torque — i.e. HÜTTE also
plays the low-headroom game. `UNVERIFIED` beyond a single secondary mention.

**Decode:** leading digit = chassis family, following digits ascend with size within it;
`D`/`E` = diesel/electric (HBR 202 D/E), `L` = a lighter variant (HBR 610 L is 20,400 kg
vs 24,000 kg). Suffix `-2/-3/-4` = generation. Letter meanings beyond D/E are `INFERRED`.

---

## A.3 EURODRILL

**Who.** EURODRILL GmbH, Germany. **This is the important structural point: Eurodrill is
a component supplier, not primarily a rig maker.** They build the *tops* — rotary heads,
hydraulic drifters, vibration heads, coring heads, double-head drilling systems, E-heads
and rotary heads **for pile rigs** — which other OEMs and contractors bolt onto their
carriers (`EURODRILL_DRILLING_ACCESSORIES_BOHRZUBEHOER_2025_26.pdf`, cover). Named in
`DOMAIN.md` §6 as a fits-rig brand, which is exactly right: you buy Eurodrill *for* a rig.

**Product families** (same catalogue): **RH x-series** rotary-percussive heads/drifters —
RH1X, RH2X, RH3X, RH4X, RH5X, RH6X, RH10X, RH12X, RH15X, RH16X, RH24X, RH32X, RH40X,
RH52X, RH65X — and **HD-series** drive heads — HD1002, HD2004, HD4010, HD4011, HD5012,
HD8021.

**Decode `INFERRED` but consistent:** in the RH series the number ascends with size, and
it tracks the shank shaft diameter (see §C.2): RH1X–RH4X on Ø56, RH10X/RH12X/RH15X on
Ø65, RH6X on Ø68, RH16X/RH24X on Ø95, RH32X/RH40X on Ø115. For the HD series the pattern
`HD <2 digits> <2 digits>` (1002, 2004, 4010, 5012, 8021) looks like a
capability-encoded pair in the KLEMM style, **but no source states what the digits mean —
`UNVERIFIED`, do not assert it.**

Their catalogue is the single best public artefact of **cross-brand fit**: it lists which
thread profile you can have on which drifter, in LH and RH. See §C.

---

## A.4 Comacchio

**Who.** Comacchio, **Riese Pio X, Italy** (https://www.comacchio.com/). The broadest
range in this group — they cover micropiles/anchors, geotechnical investigation,
geothermal, water well and large-diameter piling with separate series.

**Unit convention:** Comacchio publishes torque in **daNm** and force in **daN**, not
kNm/kN. `DOMAIN.md` §5/`PLATFORM_TRUTH.md` Part C rule 3 already allow daNm — this is
why. 1,000 daN = 10 kN; 100 daNm = 1 kNm.

**The series map** (https://www.comacchio.com/en/products):

| Series | Segment | Models listed |
|---|---|---|
| **MC** — Limited access | micropiles/anchors, tight sites | MC 2D, 3D, 4D, 5D, 8D |
| **MC** — Fully articulated multipurpose | the core anchor/micropile line | MC 2, 3, 6, 6S, 8, 12, 12P, 14, 15, 15P, 20, 22, 22A, 28, 28 HD |
| **MC** — Vertical multipurpose | vertical work | MC 4, 6V, 16, 24, 30, 40 |
| **MC** — Long reach | reach over slopes/water | MC 5 LR, 9 LR, 50 LR |
| **MC-E** — Drilling attachments | excavator-mounted | MC-E 6, 15, 20, 25, 30, 45, 80 |
| **MC ... TX** — Tunnelling | underground | MC 15 TX, MC 30 TX |
| **CH** | large-diameter piles, multipurpose + dedicated CFA | CH 4, 12, 18, 23, 36 |
| **GEO** — crawler | geotechnical investigation | GEO 105, 205, 300, 305, 405, eGEO 405, 600, 601, 601W, 602, 700W, 900, 901 |
| **GEO-T** — truck | geotechnical investigation | GEO-T 3, 5, 7, 10, 15 |
| **GEO / GT** | geothermal & water wells, single- and double-head | GEO 405, 500, 501, 600, 601, 602, 700A, 900, 900A |
| **CA / CA-T** | water wells, crawler / truck | CA 0707, 1010, 1012, 1415, 1515, 1520, 3030, 3550; CA-T 10, 15, 20, 30, 50 |

**Decode:** the letters are the *segment* and the number ascends with size —
`MC` micropile crawler, `GEO` geotechnical, `CA` water well (*captazione acqua*,
`INFERRED`), `CH` large-diameter. Suffixes are configuration: `D` limited access,
`V` vertical, `LR` long reach, `TX` tunnel, `P`/`A`/`S`/`HD` variants, `-E` excavator
attachment, `-T` truck-mounted, `e` electric (eGEO 405), `W` water. Suffix meanings
beyond the page's own grouping are `INFERRED`.

**MC 22** — the anchor/micropile reference in this range, and "the first drilling rig
equipped with the innovative Comacchio mast articulation system"
(https://nppius.com/micro-drill-rig/comacchio-mc-22/,
https://www.comacchio.com/en/products/foundations-and-ground-improvement/microdrilling/fully-articulated-multipurpose-rigs/mc-22-9637663-321534269.html):
~180–205 kW; ~22–24 t; overall width ~2,500 mm; mast feed/stroke ~4,750–10,200 mm;
**~9,500 daN (≈95 kN) feed and retract**; choice of **R3000 rotary head or TE1000
drifter** giving **~1,700–2,900 daNm (17–29 kNm)**; clamp range **45–520 mm**.
Methods: heavy civil micropiles, anchors, soil nails, jet grouting, deep foundations.

**MC 30** — long-stroke masts for single-pass micropiles, and jet grouting **to 33 m in
a single pass** (https://www.comacchio.com/en/machine-configuration/mc-30). Compare
KLEMM KR 720's 25.0 m — useful calibration for the top of the jet-grouting class.

**GEO 305** — the site-investigation multi-tool. From the manufacturer's range page:
rotary torque **335–1,100 daNm (3.35–11.0 kNm)**, feed and retract **3,500–5,000 daN
(35–50 kN)**, rotary speed **55–750 rpm**, clamp range **45–220 mm**
(https://www.comacchio.com/en/products/geotechnics-and-exploration/geotechnics/crawler-mounted-drill-rigs/geo-305-1077952484.html).
Methods: wireline coring, hollow-stem auger, rotary, DTH, SPT, dynamic sampling,
monitoring-well installation.

**Depth by method** for the GEO 305 — the best single table in this whole file for
modelling *method vs depth vs diameter* trade-offs (`Comacchio-GEO-305Pres_2023_FULL_WEB.pdf`):

| Method | Size | Depth guide (m) |
|---|---|---|
| Diamond coring (wireline) | PQ | 100–150 |
| Diamond coring (wireline) | HQ | 130–180 |
| Diamond coring (wireline) | NQ | 180–250 |
| DTH hammer (rock) | 6" | 50–60 |
| DTH hammer (rock) | 4–5" | 100–120 |
| Conventional rotary (auger, blade bit) | 8½" | 60–80 |
| Conventional rotary (auger, blade bit) | 4½" | 80–120 |

Same source: mast options "with up to **5 tonnes** feed and retract force" (≈49 kN,
consistent with the 5,000 daN above), mast extension to handle 6 m above the clamps,
variable-width undercarriage with steel tracks or rubber shoes, radio remote control for
tracking and drilling. Marketed as an "excellent market entry rig" — i.e. this is the
**tier-1 purchase** in the geotechnical branch of a progression tree.

---

## A.5 TESCAR (TES CAR Srl)

**Who.** TES CAR Srl, **Osimo (AN), Italy** (https://www.tescar.com/). They claim to have
brought the first "mini-drills" for foundation piles to market in **1985**, now known as
the **CF SERIES** (same source).

**CF series ranges** (manufacturer + dealer sources):
- Mini-drills: **torque 12–40 kNm, weight 5–13 t**.
- Medium piling machines: **torque 50–100 kNm, weight 14–30 t**.
(https://www.tescar.com/cms/sezione.php?id_sezione=133154354871875)

| Model | Spec | Source |
|---|---|---|
| CF2.5 Compact | 27 kNm torque, 42 kW, max depth 15 m, max Ø 800 mm, 7 t | https://www.directindustry.com/prod/tes-car-srl/product-99606-1156395.html |
| CF4 | max Ø 1,200 mm, min Ø 400 mm, max depth 28 m | https://pdf.directindustry.com/pdf/tescar-srl/cf4/99606-390443.html |
| TT8 | CFA rig | https://www.directindustry.com/prod/tescar-srl/product-99606-2833552.html |

**Segment:** rotary/Kelly piling and CFA — *not* percussion anchor drilling. It is the
`rotary-kelly` / `cfa` branch of `DOMAIN.md` §1, distinct from the KLEMM/HÜTTE branch.
Kelly bars offered in long and short versions for limited-space work.

---

## A.6 Fraste

**Who.** FRASTE SpA, San Bonifacio, Italy — "top quality drilling rig manufacturer since
**1964**", covering water well, foundations, geotechnical, geothermal and mineral
exploration (https://www.fraste.com/en/products).

**Series:** **MULTIDRILL XL** (XL 140, XL 275, XL MAX, XL DR double-rotary),
**MULTIDRILL ML** and **ML T** (truck), **FS** series (e.g. FS 250). The XL series is
"the absolute most-sold model within the Fraste rigs range" and covers "geotechnical,
sonic, water well, and geothermal drilling"
(https://www.marltechnologies.com/drill-and-carrier/fraste-multidrill-xl-series/,
https://www.fraste.com/en/products/multidrill-xl-275).

**XL 140** — the one model with a full published spec set:
**148 HP (≈110 kW) · 10 t pull-up · 3,700 mm stroke · 1,600 daNm (16 kNm) max torque ·
1,250 rpm max speed**
(https://www.fraste.com/en/news/last-news/multidrill-xl-140-geotechnical-drilling-rig-one-of-fraste-best-sellers-compact-but-complete-and-powerful).

Note the **1,250 rpm** — an order of magnitude above an anchor rig's rotary head. That is
the signature of a **coring/geotechnical** machine and a good way to make the game's
method classes feel different.

`XL <number>` decode: `UNVERIFIED`.

---

## A.7 Beretta (Beretta Alfredo srl)

**Who.** Beretta Alfredo srl, Italy — "manufacturing drilling machines since **1964**"
(https://www.drillwell.co.uk/drilling-rigs/beretta-drilling-rigs/beretta-t46/).
*(Unrelated to the firearms company of the same surname — search results conflate them.)*

**T series** — small-to-medium micropile/tieback/soil-nail rigs. **T46**:
- Engine **55–74 kW (75–100 HP)**
- Mast working stroke **1,200 / 1,700 / 2,200 mm**
- **Mast pull-push 40–50 kN**
- Weight **4.7 t**
- **Width just 1.0 m, variable track opening to 1.4 m**
- "Can be equipped with several kinds of rotary heads (2–4 speeds) and drifters"
(https://www.directindustry.com/prod/beretta-alfredo/product-59184-1529237.html)

Other models referenced in their catalogue set: **T51**, **T209**
(https://pdf.directindustry.com/pdf/beretta-alfredo-59184.html). Specs `UNVERIFIED`.

This is the **bottom of the tracked anchor-rig class** — 4.7 t, 1 m wide, 40–50 kN feed.
Compare KLEMM KR 606-3 at 4.9 t / 780 mm. Two brands, same envelope: that convergence is
what makes the class real.

---

## A.8 Massenza

**Who.** Massenza Drilling Rigs, **Parola (Parma), Italy**
(https://www.massenzarigs.com/). Range explicitly covers **micropiles and anchors**
(https://www.massenzarigs.com/drilling-rig-micropiles-anchors/) — rigs that "can perform
foundations, micropiles and anchors in all directions" — and **geotechnical**
(https://www.massenzarigs.com/geotechnical-drilling-rigs/) — "soil sampling and soil
investigations, augers, percussion and rotary drilling, SPT tests, coring."

**MI series** (e.g. MI 6) referenced in equipment databases. **Per-model specifications
were not obtained from a primary source — `UNVERIFIED`.** Treat Massenza as a
*confirmed participant* in the micropile/anchor and geotechnical segments with an
undocumented spec set, not as a source of numbers.

---

## A.9 MDT

**Who.** "The Italian manufacturer **MDT** develops and manufactures drilling rigs and
drilling equipment in the field of **special foundations**", with "numerous patents"
(https://boring.market/mdt/micropiling/drilling/rig/). *Source is a specialist
marketplace, not the manufacturer's own site — company identity is corroborated but
**not primary-sourced**.*

Model table from the same source (torque in daNm; pull/feed in kN):

| Model | Weight (kg) | Engine | Torque (daNm) | Speed (rpm) | Pull / feed (kN) |
|---|---|---|---|---|---|
| MDT40K | 4,200–4,900 | 47 kW | 1,400 | 100 | 3.5 / 3.5 |
| MDT40SK | 4,600 + 3,600 | 110 + 8 kW | 1,400 | 128 | 3.5 / 3.5 |
| MDT80B | 9,840–11,500 | 129 kW | 1,500 | 120 | 7 / 7 |
| MDT80V | 9,000–10,000 | 129 kW | 1,500 | 120 | 12 / 6 |
| MDT200B | 17,700–18,600 | 160 kW | 3,200 | 132 | 10 / 10 |
| MDT230B | 23,400–27,500 | 160 kW | 3,200 | 132 | 10 / 10 |
| MDT200BEG | 19,500 | 160 kW | 1,800 / 3,660 (upper/lower) | 137 / 68 | 15 / 15 |
| MDT300V | 32,000–36,000 | 200 kW | 3,200 (opt. 5,500) | 132 | 20 / 20 |

> ⚠️ **Unit warning.** The published "pull/feed" values (3.5–20) are almost certainly
> **tonnes-force, not kN** — 3.5 kN on a 4.2 t rig is implausible, whereas 3.5 tf
> (≈34 kN) matches the Beretta T46 class exactly. Marked `UNVERIFIED`; **do not import
> these force numbers without re-checking the unit.** The weights, powers and torques
> are internally consistent and usable.

The `MDT40SK` two-part weight/power ("4,600 + 3,600 kg", "110 + 8 kW") is the same
**rig + separate power pack** pattern as KLEMM's KR 606-3 and KR 702-3 — a recurring
architecture in the restricted-access class.

---

## A.10 GEAX

**Who.** Geax Srl, Italy (https://www.geax.it/).

**XD series** — the extreme end of restricted access. Marketed as "the smallest hydraulic
piling rigs in the world", designed for "extremely tight spaces, limited headroom, and
job sites difficult to access for any other standard piling rig", with
**minimum working height 2.8 m and width 1.63 m**, **max depth 12 m**, **max diameter
600 mm** (https://www.piling-equipment-ltd.com/about/news/item/all-about-geax,
https://ciancaleoni.com/en/geax-drilling-machines/xd-series/).

Confirmed models: **XD6, XD9** (https://www.geax.it/product/xd9/,
https://www.henint.com/geax-xd6, https://www.henint.com/geax-xd9).
*(Models "XD 1000 / XD 1500 / XD 2000" were searched for and **not found** — that
guess is wrong; the series numbers are single digits.)*

Mechanically this is a **rotary/Kelly** machine, not a percussion one: "rotary drive and
telescopic Kelly bar, mounted on a tilting crawler base", with "auxiliary winch,
interlocking Kelly bar, and crowd cylinder for harder soils" (piling-equipment-ltd, above).
Group with TESCAR under `rotary-kelly`, not with KLEMM.

Corporate ownership: `UNVERIFIED` (no confirmation of a Vermeer or Digga relationship
was found).

---

## A.11 Nordmeyer / PRAKLA

Two related German names, and the relationship is genuinely tangled — report it as such.

- **PRAKLA Bohrtechnik GmbH**, founded **1937**, based in **Peine, Germany**;
  manufactures multi-purpose drilling rigs and equipment; produces the **RB series**
  (https://discovery.patsnap.com/company/prakla-bohrtechnik/). Example model in the
  field: **Prakla RB 50** (https://geopsbg.com/project/prakla-rb-50/).
- **Nordmeyer** — "supplier of drilling rigs & tools since **1935**"
  (http://www.nordmeyer.nl/en/dsb4.htm). Product line is the **DSB series**, named
  `DSB <n>/<n>`: DSB 1/3.5, DSB 1/5, DSB 1/6 K, DSB 2/7, DSB 2, DSB 4 — seen across
  the manufacturer pages and used-equipment listings
  (http://www.nordmeyer.nl/en/dsb2.htm,
  https://machineryline.info/-/sale/drilling-rigs/Nordmeyer/DSB-27--26052718094805031700).
  The two-part number's meaning is `UNVERIFIED`.
- **NORDMEYER SMAG Mining & Drilling Technologies GmbH**, founded 2013, Salzgitter;
  Salzgitter Maschinenbau later agreed to sell it
  (https://www.cbinsights.com/company/nordmeyer-smag-mining-drilling-technologies).
- Separately, **PRAKLA-SEISMOS** (the geophysical business, not the rig business) was
  **purchased by Schlumberger in 1991** — a different company from PRAKLA Bohrtechnik.
  Do not merge them.

**Segment:** water well, geothermal, site investigation, multi-purpose. Per-model specs
`UNVERIFIED`.

---

## A.12 WIRTH

**Who.** WIRTH, founded **1895**, **Erkelenz, Germany**. Formerly *WIRTH Maschinen- und
Bohrgeräte-Fabrik GmbH*; **renamed Aker Wirth GmbH on 30 June 2009**
(https://www.mining-technology.com/contractors/tunnelling/wirth2/,
https://energy-oil-gas.com/news/wirth-maschinen-und-bohrgerate-fabrik-gmbh/).
Aker Solutions later sold the Aker Wirth tunnel-boring technology
(https://www.offshore-energy.biz/aker-solutions-sells-aker-wirth/). The Wirth-branded
**pile-top / reverse-circulation drill rig** line is now carried by HMH
(https://hmhw.com/wp-content/uploads/2023/01/2022-12-PBA-brochure.pdf).

**Why they matter historically — two firsts:**
- **1963:** introduced an **electro-hydraulic raise driller** in which the pilot hole is
  drilled from the lower level to the upper level and then **reamed downwards** — this
  is the raise-boring sequence still used today and it is exactly `DOMAIN.md` §1's
  `raise-boring` ("Pilot bit → reamer head, underground").
- **1967:** entered the **TBM** market; one of the first hard-rock TBMs was a special
  machine for inclined shaft tunnelling.
(Both: https://www.mining-technology.com/contractors/tunnelling/wirth2/ and
https://en.wikipedia.org/wiki/Raise_borer)

**Reputation:** heavy end — raise boring, large rotary rigs, TBMs, shaft drilling. In a
game this is the "legacy manufacturer whose name is on the oldest heavy iron" archetype.

---

## A.13 Sonic — Sonic Drill Corporation, Toa Tone Boring, Terra Sonic

**The method first** (from the peer-reviewed local paper
`Structural_drilling_using_the_high-frequency_sonic-in-Slovenia.pdf`, plus
`Drilltechniques-Sonic-Brochure.pdf`):

Two **counter-rotating eccentric masses** in the head generate a **high-frequency
sinusoidal force along the axis of the drill pipe**. That wave travels down the string;
the operator tunes the frequency so the string runs at **resonance** (the brochure
diagram labels a "3rd harmonic standing wave established in drill pipe"). At the bit the
oscillation **liquefies** a thin annulus of soil, collapsing its structure so it behaves
"more like a fluid powder or paste than a rigid mass", which cuts side friction and stops
material sticking to the string. The paper: "frequencies of up to **150 Hz** may be
generated"; the brochure: the string moves "up to **150 times per second**".

**Consequences that should be game mechanics:**
- **Continuous, undisturbed core** — the headline advantage. Sonic is the sampling method.
- **Very straight holes**, because the advance is axial.
- **Air or water flush is reduced or, in some materials, eliminated entirely** — a real
  cost/logistics advantage over rotary.
- Claimed **3–5× faster** than conventional drilling depending on soil (Sonic Drill Corp
  via brochure) and "up to five times faster" (Slovenian paper). Two independent
  statements of the same multiplier.
- The rig is a **carrier + sonic head**: the brochure shows a Toa Tone **EP26** head on a
  **Comacchio GEO 305** and a Sonic Drill Corp **50K** head on a **Comacchio 900P**.
  Sonic is bought as a *head*, mounted on someone else's crawler.

**Companies.**
- **Sonic Drill Corporation (SDC), Canada** — the originator; "more than 30 years in
  sonic research and development", holds patents on the technology (brochure).
- **Toa Tone Boring Co., Japan** — founded 1916 as Shioda Shoten; launched Japan's first
  150 m-class rotary drilling machine in 1926; renamed Tone Boring 1936; **licensed by
  Sonic Drill Corporation** for the Asian market and "manufactures the same patented
  drill head", licence acquired **2002** (brochure).
- **Terra Sonic International, USA** (https://www.terrasonicinternational.com/) —
  builds complete sonic rigs, TSi series.

**Head specifications** (`Drilltechniques-Sonic-Brochure.pdf` unless noted):

| Head | Max frequency | Max vibration/oscillator force | Rotation torque | Rotation speed |
|---|---|---|---|---|
| Toa Tone **EP-26N** | 4,000 cpm (**67 Hz**) at 37 l/min | **38 kN** | 3.395 kNm at 20.6 MPa | 0–159 rpm at 95 l/min |
| Toa Tone **SP-50** | 4,000 cpm (**67 Hz**) at 70 l/min | **65 kN** | low 4.2 / high 2.1 kNm | low 0–36 / high 0–62 rpm |
| Toa Tone **SP-8000** | 4,000 cpm (**67 Hz**) at 70 l/min | **78.4 kN** | low 5.4 / high 2.7 kNm | low 0–27 / high 0–54 rpm |
| SDC **Sonicor 50K** | **150 Hz** | **50,000 lbf = 222 kN** | 5,250 ft-lb fwd / 7,000 ft-lb rev | 160 rpm standard |
| SDC **Sonicor 33K** | **133 Hz** | (listed 50,000 lbf — see warning) | as 50K | 160 rpm standard |
| Terra Sonic **TSi 150** | **0–150 Hz** | **50,000 lbf = 222 kN** | — | — |

SP-50 weight with water swivel ≈ **520 kg**; air damper on SP-50/SP-8000 at 0.7 MPa,
min 8 l/min.
Terra Sonic figures: https://www.terrasonicinternational.com/products/tsi-sonic-rigs/tsi-150cc-compact-crawler/
and https://www.terrasonicinternational.com/wp-content/uploads/2025/04/150CCE_vF.pdf —
**TSi 150CC**: **180 kW Stage V** diesel powering all driving, drilling and accessory
functions; rated depth **300 m (1,000 ft) with 6" tooling** depending on lithology;
**3 m (10 ft)** tooling sections; casing to **12" (305 mm)**; angle drilling **0° to 45°**.

> ⚠️ **Two errors in the Sonicor brochure page — do not propagate them.**
> 1. It prints "5,250 ft-lbs **[7110 kn-m]**" and "7,000 ft-lbs **[9,480 kn-m]**". The
>    correct conversions are **≈7.1 kNm** and **≈9.5 kNm** — the brochure is off by 1000×.
> 2. It gives the **33K** the same "50,000 lbs force" as the 50K, which contradicts the
>    model name. The 33K's true oscillator force is `UNVERIFIED`.
> The **cross-check that does hold**: SDC 50K at 222 kN / 150 Hz and Terra Sonic TSi 150
> at 222 kN / 150 Hz agree exactly, from independent sources. Use **222 kN @ 150 Hz** as
> the top-of-class sonic figure.

**Frequency is the class split.** Toa Tone's hydraulic-motor heads top out at **67 Hz**;
the SDC/Terra Sonic heads reach **133–150 Hz**. That is a real, citable two-tier
capability difference, and it maps directly onto a game upgrade.

---

## A.14 CPT — Pagani and A.P. van den Berg

CPT is **not drilling**. Nothing rotates and nothing is cut: a cone on rods is **pushed**
into the ground at a controlled rate, and tip resistance, sleeve friction and (for a
piezocone) pore pressure are logged continuously. The entire engineering problem is
**where the reaction force comes from**. That makes it visually and mechanically distinct
from every other machine in this file.

### A.P. van den Berg (Netherlands) — the truck-mounted school
- **CPT Truck** with the **HYSON 200 kN** penetrometer. Suitable for pushing capacities
  **140 to 200 kN or more** (https://www.apvandenberg.com/onshore-cone-penetration-testing/cpt-truck).
- The **HYSON** is a **twin-cylinder "H"-form** set in which **the piston rods are fixed
  to the truck frame and the cylinders move** — an unusual arrangement and a strong
  visual identifier.
- **Reaction is the truck's own dead weight**: the truck frame is reinforced with a
  subframe to take the CPT forces, and **all-wheel-drive 6×6 is the most popular
  configuration**. Features include automatic truck jacking and levelling.
- **CPT Crawler**: "a **20 tonne** crawler provides counterforce up to **200 kN**"
  (https://www.apvandenberg.com/onshore-cone-penetration-testing/cpt-crawler).

> **This confirms the brief's expectation and gives the exact rule: ≈20 t of reaction
> mass buys ≈200 kN of push.** 10 t → ~100 kN. That linear relationship is the CPT
> class's whole design constraint and is a clean game mechanic: *you cannot push harder
> than you weigh.*

### Pagani Geotechnical Equipment (Italy) — the light-crawler school
Naming decode is explicit and clean: **`TG <frame series>-<push capacity in kN>`.**

| Model | Push capacity | Extraction capacity | Weight |
|---|---|---|---|
| TG 63-100 | **100 kN** ("10 tons" pushing force) | 12 t extraction | **910 kg** |
| TG 63-150 | **150 kN** | 160 kN | — |
| TG 73-200 | **200 kN** | 250 kN | **2,700 kg** without accessories |

Sources: https://www.pagani-geotechnical.com/en/tg-63-100,
https://www.mgs.co.uk/product/tg63-100/,
https://www.mgs.co.uk/product/tg63-150/,
https://pdf.directindustry.com/pdf/pagani-geotechnical-equipment/tg73-200/124137-710236.html.

All are configurable for **static (CPT)** or **static/dynamic (DPSH)** penetration
testing, with average dynamic efficiency **78%**; hydraulic tracked carriage;
**operable by a single user**.

> **The key contrast for the game.** A 910 kg Pagani crawler pushes 100 kN. A 20 t van
> den Berg crawler pushes 200 kN. The light machine cannot be getting its reaction from
> its own mass — it must be **anchored to the ground** (screw/helical anchors) or
> ballasted. The heavy machine reacts against itself. **Two different answers to the same
> physics problem** — that is a far more interesting pair of machines than "small CPT"
> and "big CPT". *(The specific anchoring method for the Pagani class is
> `UNVERIFIED` from the sources consulted — verify before writing player-facing text.)*

---

## A.15 Vermeer — HDD

**Who.** Vermeer, Pella, Iowa, USA. The volume leader in utility HDD. Product line:
**Navigator** HDD, D-series.

**Naming decode — sourced and important:** the classic two-number name encodes
**pullback in thousands of pounds × rotational torque in hundreds of ft-lb**. So
`D24x40` = 24,000 lb pullback, 4,000 ft-lb torque — "accurate for the original and
Series II machines."

**But the badge went stale.** The S3 generation was uprated while keeping the old name:
the **D24x40 S3 actually delivers 28,000 lb (124.6 kN) and 4,200 ft-lb (5,694 Nm)**,
not 24,000/4,000 (https://www.hddbroker.com/en/resources/equipmentlibrary/viewmodel.php?id=1868,
https://worldhdd.com/blog/vermeer-d24x40-used-buyers-guide). The Series II figures were
24,000 lb (106.8 kN) / 4,000 ft-lb (5,423 Nm)
(https://www.hddbroker.com/en/resources/equipmentlibrary/viewmodel.php?id=951).

**And in 2024 Vermeer abandoned the two-number scheme**, moving to a **single number =
thrust/pullback**, because operators said thrust/pullback is the spec they actually
select on. The documented transition is **D23x30 S3 → D24**, where the new D24 is "equipped
for maximum thrust/pullback at **24,700 lb (110 kN)**". Vermeer explicitly states the
**D24x40 S3 and D24 are two separate machines**, and that the change applies only to
future models
(https://protips.vermeer.com/underground/2024/11/12/new-models-and-model-name-changes-for-vermeer-horizontal-directional-drills/).

> **This is the single best "fits-rig facet" lesson in the whole file.** A model name is
> a *marketing* label that drifts away from the *engineering* spec. A shop that matches
> parts on the badge will mis-sell. Two machines can share a badge family and not share
> a spec; one machine can be renamed and be a different machine. If the game wants the
> compatibility facet to feel real, **the fit must key off the physical interface
> (thread, rod OD, shank), never off the model name.**

**Selected models:** D40x55 S3 — **40,000 lb (177.9 kN)** thrust/pullback, **5,500 ft-lb
(7,457 Nm)** torque
(https://vermeeruk.co.uk/new-equipment/horizontal-directional-drilling-/vermeer-d40x55-s3-navigator-horizontal-directional-drill).
Range spans roughly D8x12 at the mini end to **D220x500** at the maxi end
(https://trenchlesstechnology.com/product-showcase-vermeer-d220x500-s3-navigator-horizontal-directional-drill/).

**Firestick** is Vermeer's proprietary drill rod. `DOMAIN.md` §4 lists sizes
**1.66"–2.875"**. *(The rod-by-rig mapping was not obtained from a Vermeer primary
source — `UNVERIFIED`; see §C.3 for what can be said safely.)*

---

## A.16 Ditch Witch

**Who.** Ditch Witch (Charles Machine Works), Perry, Oklahoma, USA.

**JT series decode:** the number is **pullback in thousands of pounds**. Evidence:
- **JT20** — thrust **17,000 lb (75.6 kN)**, pullback **20,000 lb (89 kN)**, max spindle
  speed 210 rpm (https://www.ditchwitch.com/directional-drills/directional-drills/jt20/).
  Note thrust ≠ pullback, and the badge follows **pullback**.
- **JT24** — 24,000 lb thrust and pullback, 3,000 ft-lb spindle torque, 225 rpm
  (https://www.hddbroker.com/en/resources/equipmentlibrary/viewmodel.php?id=2184).
- **JT40** — 40,000 lb thrust/pullback, 5,500 ft-lb torque, 250 rpm
  (https://www.hddbroker.com/en/resources/equipmentlibrary/viewmodel.php?id=2073).

**AT = All Terrain, and it is a genuinely different machine**, not a trim level. The AT
uses a **dual-pipe** system: "an **inner rod** that drives a rock bit and an **outer pipe**
that steers the downhole tool for drilling pilot holes and provides rotary torque for
backreaming." The inner pipe "works as a mechanical motor, driving the bit during the
bore"; the outer pipe "thrusts the bit forward while steering the drill shaft", and during
backreaming "the outer pipe transmits full machine torque downhole." The construction is a
**hex-shaped rod turning inside an outer pipe**
(https://undergroundinfrastructure.com/magazine/2018/september-2018-vol-73-no-9/features/evolution-of-dual-pipe-makes-mid-sized-rock-drilling-practical,
https://www.ditchwitch.com/hdd-tooling/drill-pipe/).

**Why it matters mechanically:** it is "similar to a machine with a mud motor, except the
bit is not powered by drilling fluid, eliminating the need for high volumes of fluid and
the accessory equipment to mix, circulate, clean and haul it away" (same source). So AT
trades **rod cost and complexity** for **mud logistics** — a real strategic choice, and
an excellent game decision node: *rock capability without a mud spread.*

**Forged HDX** is their drill pipe, "designed to match competitive threads", forged from
steel meeting **S135** strength (https://www.ditchwitch.com/hdd-tooling/drill-pipe/).
Note "designed to match competitive threads" — an explicit cross-brand fit claim.

---

## A.17 Herrenknecht

**Who.** Herrenknecht AG, Schwanau, Germany. The only company here that spans
**HDD rigs, microtunnelling and full-size TBMs**.

**AVN microtunnelling — the naming decode is clean and useful.**
- **AVN** = *Automatic Tunnelling machine, wet* — slurry-supported machines with a **cone
  crusher**, covering diameters **0.4 m to about 4 m**
  (https://www.herrenknecht.com/en/products/productdetail/avn-machine/,
  https://www.directindustry.com/prod/herrenknecht-ag/product-59259-2131995.html).
- **The number is the nominal tunnel diameter in millimetres.** AVN400 → from 400 mm;
  AVN1200 → 1,200 mm. Concretely, the **AVN 1200** has a **cutterhead diameter of
  1,515 mm** and a **machine lining outer diameter of 1,505 mm** — i.e. the *name* is the
  nominal pipe ID class, and the *cut* is larger
  (https://www.exapro.com/herrenknecht-avn-1000-xc-p230926079/ for the XC variant naming;
  diameter figures per the AVN 1200 listing).
- Ground range: "silt to clay to incohesive soils, and further to gravel and rock."

> **Great detail for the game:** the machine is named for the **product** (the pipe you
> install), not for the machine's own size. That is the opposite convention to Vermeer's
> (named for force) and Pagani's (named for force). Three different naming philosophies
> in one shop — a genuinely authentic texture for an iMarket facet.

**Direct Pipe** — their combined method: a Direct Pipe thruster of **up to 750 tons of
force** can support an HDD rig during pullback of a large heavy pipe string, and unlike
HDD the equipment is "primarily located on one side of the project", suiting small
footprints, wet retrievals and urban crossings
(https://www.michels.us/michels-trenchless-inc/solutions/construction-installation-5/).

**HDD rigs:** Herrenknecht produces an HDD rig line
(https://www.herrenknecht.com/en/products/productdetail/hdd-rig/) — per-model pullback
designations `UNVERIFIED` from the sources consulted.

**TBM types:** the raise-boring and TBM lineage is covered under Wirth (A.12); for
Herrenknecht the type families relevant to `DOMAIN.md` §3 D are EPB, Mixshield, Gripper
and shielded hard-rock machines. Specific diameter ranges per family `UNVERIFIED` here.

---

## A.18 TRACTO / Tracto-Technik (TT Group)

**Who.** TRACTO-TECHNIK GmbH & Co. KG, **Lennestadt, Germany** (https://tracto.com/) —
again the Sauerland. Trenchless specialists.

**The GRUNDO- naming family is the cleanest brand system in this document: one prefix per
method.**

| Product | Method | Published capability |
|---|---|---|
| **GRUNDOMAT** | Soil displacement hammer (impact mole) | **14 models, 45–80 mm** hammer diameter; installs socketless short/long pipes **to OD 160** (plastic) or cables; also piling, pipe ramming, pipe bursting; **< 40 m** drives |
| **GRUNDODRILL** | HDD | installation of PE pipes **to ND 700** under roads, railways, buildings |
| **GRUNDOPIT** | Mini / pit-launched HDD | "fluid-assisted mini drill rigs" |
| **GRUNDORAM** | Pipe ramming (dynamic) | steel pipes **to ND 4000**, lengths **to 80 m** |
| **GRUNDOBURST** | **Static** pipe bursting | **ND 50 to 1000**; models **400 G, 400 S (manhole), 800 G, 1250 G, 1900 G, 2500 G** |
| **GRUNDOCRACK** | **Dynamic** pipe bursting | — |

Sources: https://en.tracto.com/Brand%20Portal/Products/TRACTO_NODIG-SYSTEMS_EN.pdf,
https://tracto.com/en/Products/GRUNDOBURST-Static-pipe-bursting-systems,
https://tracto.com/en/Products/GRUNDOBURST-Static-pipe-bursting-systems/GRUNDOBURST-1900G,
https://www.tttechnologies.com/products/grundoram-pneumatic-pipe-ramming/,
https://www.weiner.pt/wp-content/uploads/2022/05/Weiner-TRACTO-GrundoPit.pdf.

**GRUNDOBURST decode `INFERRED`:** the number appears to be **pulling force in kN**
(400 G ≈ 400 kN, 2500 G ≈ 2500 kN), with `G` = the standard frame and `S` = the
manhole/shaft variant. **Not stated by the manufacturer — verify before use.**

> ⚠️ One secondary source states GRUNDORAM provides "thrust forces up to 40,000 **Nm**".
> **Nm is a torque unit and cannot express thrust** — the figure is unit-garbled at
> source. Marked `UNVERIFIED`; do not use.

**Static vs dynamic bursting is a real distinction** and `DOMAIN.md` §1 already carries
`pipe-bursting` as one method — GRUNDOBURST (static, pulled) and GRUNDOCRACK (dynamic,
hammered) are the two sub-methods and could be two upgrade paths.

---

## A.19 Prime Drilling

**Who.** Prime Drilling GmbH, Wenden, Germany (https://prime-drilling.de/). HDD rigs
including a Compact line.

**Naming decode — and it is the European counter-convention to Vermeer's:**
**`PD <pullback in tonnes-force> / <rotary torque in kNm> RP`.**

Verified against a full spec set — **PD 250/90 RP**: max thrust **2,500 kN
(562,022 lb)**, max pullback **2,500 kN**, max rotary torque **90 kNm (66,381 ft-lb)**,
engine **470 kW (630 hp)**, weight **32 t**, entry angle 6°–15°
(https://www.hddbroker.com/en/resources/equipmentlibrary/viewmodel.php?id=1451).
2,500 kN ≈ 250 tf and 90 kNm — **both numbers in the name land exactly.**

Other models in the range confirming the pattern: PD 30/18 RP, PD 60/33 RP, PD 80/45 RP,
PD 100/50 RP, PD 250/90 RP, PD 600/180 RP
(https://www.hddbroker.com/en/resources/equipmentlibrary/viewmodel.php?id=1446,
https://www.hddbroker.com/en/resources/equipmentlibrary/viewmodel.php?id=2124,
https://www.hddbroker.com/en/resources/equipmentlibrary/viewmodel.php?id=1448,
https://pd.nt-rt.ru/en/catalog/burovye-ustanovki-gnb).
*(No "PD 250/100" model was found — that designation appears not to exist.)*

> **Use this contrast deliberately.** American HDD brands name machines in **thousands of
> lbf**; German ones name them in **tonnes and kNm**. Same machines, two measurement
> cultures. That is exactly the kind of authentic friction a multilingual B2B marketplace
> actually has, and iMarket already ships in six languages (`PLATFORM_TRUTH.md` Part A).

---

## A.20 American Augers

**Who.** American Augers, West Salem, Ohio, USA (https://americanaugers.com/). Maxi-rig
HDD and auger boring.

**DD-series decode:** number = **thrust/pullback in thousands of pounds**, same family as
Vermeer/Ditch Witch. **DD-440T**: **440,000 lb** thrust/pullback; rotational torque
**60,000 ft-lb (80,000 Nm)**; max **breakout** torque 230,000 ft-lb (311,839 Nm); max
**makeup** torque 152,000 ft-lb (206,085 Nm); rack-and-pinion, track-mounted maxi rig
(https://americanaugers.com/wp-content/uploads/2022/08/AA-PROD-12812-01-DD-440T-Sales-Sheet-2021_V2-Web.pdf,
https://www.hddbroker.com/en/resources/equipmentlibrary/viewmodel.php?id=1225).

> Note the three distinct torque figures — **rotational**, **breakout**, **makeup**.
> Breakout torque (311.8 kNm) is nearly **4×** rotational (80 kNm). Any game that models
> "torque" as one number is throwing away the most interesting part: the tool joint that
> will not come apart is a different failure from the string that will not turn.

---

## A.21 Akkerman

**Who.** Akkerman Inc., Brownsdale, Minnesota, USA (https://www.akkerman.com/).
Pipe jacking, microtunnelling and guided boring — the `microtunnelling` and
`auger-boring` methods of `DOMAIN.md` §1.

**Product families:**
- **GBM — Guided Boring Machines** (pilot-tube systems). Models **240A**, **308A**,
  **339A**, **4800 Series**. The 4800 is "an all-in-one system excelling in all pilot
  tube installation methods including auger boring, pilot tube microtunneling, and rock
  boring" (https://www.akkerman.com/equipment/gbm-4800-series-jacking-frame/). The 240A
  is "the industry-leading pilot tube system for accurately guiding horizontal auger bore
  equipment" (https://www.akkerman.com/equipment/gbm-240a-system/). The 308A/339A suit
  direct installation of sewer and water infrastructure "when space is limited"
  (https://www.akkerman.com/equipment/308a-339a-jacking-frame-system/).
- **MTBM jacking frames** — "built to deliver high thrust capacity while minimizing
  launch shaft requirements", using a **multi-cylinder keyhole design that applies thrust
  loads through the centre of the pipe axis**; additional thrust cylinders can be added on
  **MT8102K and larger** frames to increase capacity for extended drives
  (https://www.akkerman.com/equipment/mtbm-jacking-frames/).
- **GBM power packs** — diesel or electric, with hydraulic hose reels
  (https://www.akkerman.com/equipment/gbm-power-packs/).

**Jacking force class:** keyhole jacking frames operate out of a **16–24 ft (4.87–7.3 m)
shaft** and provide **800–1,200 tons (726–1,089 t) of thrust at 8,000 psi (550 bar)**,
advancing pipe at **15 to 9.5 inch/min (381–241 mm/min)** (MTBM jacking frames page).

> **The defining constraint of this class is the launch shaft.** Unlike every other
> machine in this file, a pipe-jacking rig works **from a pit**, reacting against a
> thrust wall. "Minimizing launch shaft requirements" is the selling point. In the game
> this class should have a **site-preparation cost** the others do not — you dig and
> shore a shaft before you bore.

---

# §B. Capability envelope tables

**Use:** size invented rigs into these bands. **All figures are sourced above.** Bands are
the observed spread across the real machines cited, not a standard.

## B.1 Anchor / micropile / geotechnical crawler classes

| Class | Operating weight | Torque (kNm) | Feed force (kN) | Percussion | Mast / feed length | Engine kW | Real machines this band is drawn from |
|---|---|---|---|---|---|---|---|
| **Excavator attachment** (entry) | 2.0–4.3 t (unit only) | (host rig's) | **30–60** | drifter-dependent | slide stroke **4,500 mm** | host machine's hydraulics (140–280 l/min, 250–270 bar) | KLEMM KA 140 / KA 162 |
| **Restricted-access / low-headroom** | **4.8–6.8 t** | ~10–19 | ~35–50 | small drifter (piston ~7–12 kg) | short mast; **min headroom 2.0–2.8 m** | **45–129 kW** (often separate power pack) | KLEMM KR 606-3 / 702-3 / 704-2E / 704-3G; GEAX XD6/XD9 (2.8 m × 1.63 m); Beretta T46 (1.0 m wide) |
| **Small anchor rig** | **4.7–11 t** | ~10–20 | **40–62** | KD 408–KD 1011 class | stroke 1,200–2,200 mm (Beretta); to ~7 m | **47–129 kW** | Beretta T46; KLEMM KR 800-3G / 801-3G*; HÜTTE HBR 202/203; MDT40K/80B |
| **Mid anchor / micropile rig** | **13–20 t** | **20–34** | **100–130** | KD 1215R / KD 2117 / KD 3428 class | frame **7,000–7,600 mm**, to **18.2 m** with lattice | **129–186 kW** | KLEMM KR 805-3G, KR 806-3GS, KR 909; HÜTTE HBR 504/602/605/608; MDT200B |
| **Large anchor / micropile rig** | **20–32 t** | **34–61.5** | **130** (mast-limited) | KD 3428 / KD 4724 class | to **21.1 m** single pass | **175–250 kW** | KLEMM KR 806-5G/-5GP, KR 807-7G/-7GP, KR 720, KR 717-3GW; HÜTTE HBR 610/710 (to 42.5 t); MDT300V |
| **Heavy / high pull** | **32–42.5 t** | up to ~55 | pull to **400 kN** | — | — | 200–250 kW | HÜTTE HBR 207 (400 kN, 32 t), HBR 710 (42.5 t); KLEMM KR 720 (32 t) |

**Cross-cutting rules worth encoding:**
- **Retraction ≈ ½ of feed** on KLEMM masts (100/50, 130/65 kN). Pulling out is cheaper
  than pushing in — until it isn't, and that's when you're stuck.
- **Torque is rig-limited, not head-limited.** KH 62 = 61.5 kNm on the bench, **54 kNm**
  fitted to a KR 806-5G. The carrier's hydraulics cap the top.
- **Weight is a range, not a number** — every manufacturer says "depending on
  configuration" (KLEMM geothermal 13–14 / 26–29 / 18–20 t; HÜTTE 14.8 vs 17.0 t for the
  same HBR 605).

## B.2 Rotary / Kelly mini-piling class (a *different* class — do not merge)

| Class | Weight | Torque (kNm) | Max Ø | Max depth | Engine kW | Drawn from |
|---|---|---|---|---|---|---|
| Micro / limited access Kelly | ~5 t | 12–27 | 600–800 mm | 12–15 m | ~42 kW | GEAX XD6/XD9; TESCAR CF2.5 Compact |
| Mini piling (CF class) | **5–13 t** | **12–40** | to 1,200 mm | to 28 m | — | TESCAR CF series (mini) |
| Medium piling | **14–30 t** | **50–100** | — | — | — | TESCAR medium range |

Sources: §A.5, §A.10.

## B.3 Geotechnical investigation / coring class

| Metric | Band | Source |
|---|---|---|
| Rotary torque | **3.35–16 kNm** (335–1,600 daNm) | Comacchio GEO 305; Fraste XL 140 |
| Rotary speed | **55–1,250 rpm** | Comacchio GEO 305 (55–750); Fraste XL 140 (1,250 max) |
| Feed / retract | **35–50 kN** (3,500–5,000 daN, "up to 5 tonnes") | Comacchio GEO 305 |
| Pull-up | 10 t | Fraste XL 140 |
| Stroke | 3,700 mm | Fraste XL 140 |
| Clamp range | 45–220 mm | Comacchio GEO 305 |
| Engine | ~110 kW (148 hp) | Fraste XL 140 |

**High rpm is the class signature** — 750–1,250 rpm versus 100–360 rpm on an anchor rig.
Depth-by-method table in §A.4 (GEO 305).

## B.4 Sonic class

| Metric | Toa Tone tier | SDC / Terra Sonic tier |
|---|---|---|
| **Max frequency** | **67 Hz** (4,000 cpm) | **133–150 Hz** |
| **Oscillator force** | **38 / 65 / 78.4 kN** (EP-26N / SP-50 / SP-8000) | **222 kN** (50,000 lbf) |
| **Rotation torque** | 2.1–5.4 kNm | ≈7.1 kNm fwd / ≈9.5 kNm rev *(corrected — see A.13 warning)* |
| **Rotation speed** | 0–159 rpm | 160 rpm standard |
| Head weight | ~520 kg (SP-50 with water swivel) | — |
| Rig engine | — | **180 kW** Stage V (TSi 150CC) |
| Rated depth | — | **300 m (1,000 ft)** with 6" tooling |
| Casing | — | to **12" (305 mm)** |
| Tooling sections | — | **3 m (10 ft)** |
| Angle | — | **0°–45°** |

Sonic **rate advantage: 3–5× conventional** (two independent sources, §A.13).
Sonic is bought as a **head on someone else's carrier** — model it as an attachment.

## B.5 CPT class — reaction mass is the spec

| Class | Machine mass | **Push capacity** | Extraction | Reaction source | Source |
|---|---|---|---|---|---|
| Light tracked CPT/DPSH | **910 kg** | **100 kN (10 tf)** | 12 tf | anchored/ballasted (`UNVERIFIED`) | Pagani TG 63-100 |
| Mid tracked | — | **150 kN** | 160 kN | — | Pagani TG 63-150 |
| Heavy tracked | **2,700 kg** | **200 kN** | 250 kN | — | Pagani TG 73-200 |
| **CPT crawler (ballasted)** | **20 t** | **200 kN** | — | **own dead weight** | A.P. van den Berg CPT Crawler |
| **CPT truck** | 6×6 truck, reinforced subframe | **140–200 kN or more** | — | **own dead weight + jacking/levelling** | A.P. van den Berg CPT Truck, HYSON 200 kN |

**The brief's "10–20 t" is confirmed for the ballasted classes** and the relationship is
explicit: **20 t ⇒ 200 kN**. Note the light Pagani machines break that rule by an order of
magnitude, which is the interesting part — see §A.14.

## B.6 HDD thrust/pullback classes — mini / midi / maxi

> ⚠️ **There is no standard.** Trade sources state this plainly: "there are not standards
> to differentiate between mini, midi and maxi rigs." The two schemes below are both
> in real use and they **disagree in the middle**. Present the game's own bands as a
> design choice, not as an industry fact. `DTD-Glossary-of-HDD-Terminology.pdf` was
> checked and **does not define these classes**.

**Scheme 1 — small / medium / large** (https://www.thedriller.com/articles/85848-what-size-hdd-rig):

| Class | Thrust/pullback | Torque | Mud pump |
|---|---|---|---|
| **Small** | **< 40,000 lbf (< 177.9 kN)** | < 4,000 ft-lb (< 5.4 kNm) | < 75 gpm |
| **Medium** | **40,000–100,000 lbf (177.9–444.8 kN)** | 4,000–20,000 ft-lb (5.4–27.1 kNm) | 50–200 gpm |
| **Large** | **> 100,000 lbf (> 444.8 kN)** | > 20,000 ft-lb (> 27.1 kNm) | > 200 gpm |

Same source: "systems below **20,000 pounds** thrust/pullback primarily are used for
installation of utility cable and small diameter pipes in congested urban areas."

**Scheme 2 — compact / midsize / maxi** (https://trenchlesstechnology.com/midsize-rigs-stabilizing-force-in-hdd-market/):

| Class | Thrust/pullback |
|---|---|
| **Compact** | up to **20,000 lb (89.0 kN)** |
| **Midsize** | **20,000–60,000 lb (89.0–266.9 kN)** (majority of rigs) |
| **Maxi** | **> 100,000 lb (> 444.8 kN)** |

**Recommended game bands** (a synthesis — label as the game's own):

| Game class | Pullback | Real machines in band |
|---|---|---|
| Mini | **< 89 kN (< 20,000 lb)** | Vermeer D8x12; GRUNDOPIT |
| Compact/Midi-low | **89–178 kN (20–40,000 lb)** | Ditch Witch JT20 (89 kN), JT24; Vermeer D24x40 S3 (124.6 kN), D24 (110 kN) |
| Midi | **178–445 kN (40–100,000 lb)** | Vermeer D40x55 (177.9 kN); Ditch Witch JT40 (177.9 kN); Prime Drilling PD 30/18–PD 100/50 |
| Maxi | **> 445 kN (> 100,000 lb)** | Prime Drilling PD 250/90 (2,500 kN); American Augers DD-440T (440,000 lb ≈ 1,957 kN); Vermeer D220x500 |

**Verified HDD spec points:**

| Machine | Thrust / pullback | Rotary torque | Other |
|---|---|---|---|
| Ditch Witch JT20 | 17,000 lb (75.6 kN) thrust / **20,000 lb (89 kN)** pullback | — | 210 rpm max spindle |
| Ditch Witch JT24 | 24,000 lb both | 3,000 ft-lb (4.07 kNm) | 225 rpm |
| Ditch Witch JT40 | 40,000 lb (177.9 kN) | 5,500 ft-lb (7.46 kNm) | 250 rpm |
| Vermeer D24x40 Series II | 24,000 lb (106.8 kN) | 4,000 ft-lb (5,423 Nm) | badge-accurate |
| Vermeer D24x40 S3 | **28,000 lb (124.6 kN)** | **4,200 ft-lb (5,694 Nm)** | **badge stale** |
| Vermeer D24 (2024) | 24,700 lb (110 kN) | — | new single-number name |
| Vermeer D40x55 S3 | 40,000 lb (177.9 kN) | 5,500 ft-lb (7,457 Nm) | — |
| Prime Drilling PD 250/90 RP | **2,500 kN** both | **90 kNm** | 470 kW, 32 t, entry 6°–15° |
| American Augers DD-440T | **440,000 lb** | 60,000 ft-lb (80 kNm) rotational; **breakout 230,000 ft-lb (311.8 kNm)**; makeup 152,000 ft-lb (206.1 kNm) | rack-and-pinion maxi |

## B.7 Trenchless — non-HDD classes

| Class | Capability | Source |
|---|---|---|
| Soil displacement hammer (impact mole) | **45–80 mm** body, 14 models; pipe to **OD 160**; drives **< 40 m** | GRUNDOMAT |
| Static pipe bursting | **ND 50–1000**; frames 400 G → 2500 G *(number ≈ kN, `INFERRED`)* | GRUNDOBURST |
| Pipe ramming | steel pipe to **ND 4000**, length to **80 m** | GRUNDORAM |
| HDD (mini, PE) | pipe to **ND 700** | GRUNDODRILL |
| Guided boring / pilot tube | GBM 240A, 308A, 339A, 4800 series | Akkerman |
| **Pipe jacking / MTBM** | **800–1,200 tons (726–1,089 t) thrust @ 8,000 psi (550 bar)**; **16–24 ft (4.87–7.3 m) launch shaft**; advance **241–381 mm/min** | Akkerman MTBM keyhole frames |
| Microtunnelling (slurry, MTBM) | diameters **0.4–~4 m**; AVN number = nominal mm | Herrenknecht AVN |
| Direct Pipe thrust assist | up to **750 tons** | Herrenknecht / Michels |

---

# §C. Brand-scoped compatibility — the shop facet

`DOMAIN.md` §4 already lists the connection families and states the rule: **never mix
these across segments.** This section supplies the *fit logic* — what actually has to
match — grounded in a real manufacturer's catalogue.

## C.1 The governing principle

> **A part fits a machine when the physical interface matches — not when the brand
> matches, and never when the model name matches.**

The Vermeer case in §A.15 proves the last clause: a `D24x40 S3` and a `D24x40 Series II`
share a badge and differ by 4,000 lb and 200 ft-lb; a `D24x40 S3` and a `D24` are, per
Vermeer, *"two separate machines."* And EMDE advertise shank adapters cut "for **usual
drifters**" (`EMDE-Anchor-Drilling.pdf`) — i.e. a third party will make you the interface
for whoever's hammer you own. **Brand is a filter, geometry is the gate.**

## C.2 Top-hammer / anchor drilling — the three-part fit gate

Read off the Eurodrill catalogue
(`EURODRILL_DRILLING_ACCESSORIES_BOHRZUBEHOER_2025_26.pdf`). To hang a shank adapter on a
drifter, **three things must match**:

**1. Shank shaft diameter (the primary gate — set by the drifter).**

| Shaft Ø | Drifters / drive heads on that shaft | Thread profiles offered on it |
|---|---|---|
| **Ø56** | RH1X, RH2X, RH3X, RH4X, HD1002, HD2004 | IB30 LH box, IB40 LH box, IB52 LH/RH pin, R32 LH box, R38 LH box, R51 Mai LH pin, T38 LH box/pin, T45 LH pin, **H55 RH pin** |
| **Ø65** | RH10X, RH12X, RH15X, HD4010, HD4011 | **H55 LH/RH pin, H64 LH/RH pin, C64 LH/RH pin**, R32 LH box, R38 LH box |
| **Ø68** | RH6X (+ an RH3X/RH4X-family option) | **H64 LH/RH pin, H66 RH pin**, IB30/IB40/IB52 box, R32/R38 LH box, R51 Mai LH box, T38/T45 LH box |
| **Ø95** | RH16X, RH24X, HD5012, RH15X (option) | **H90 LH/RH pin, H92 LH/RH pin, C90 LH/RH pin** |
| **Ø100** | RH3X, RH4X (large option), RH10X/RH12X/HD4010 | **T76 KSB RH box, R51 LH box** — *direct rod thread, no H-shank* |
| **Ø110** | RH12X | (see catalogue) |
| **Ø115** | RH32X, RH40X, HD8021 | **H112 LH/RH pin, H114 LH/RH pin, C112 LH/RH pin** |

> **The clean, citable rule the game should encode: the H-series shank size scales with
> the drifter's shaft diameter.** Ø56→H55 · Ø65→H55/H64 · Ø68→H64/H66 · Ø95→H90/H92 ·
> Ø115→H112/H114. **You cannot put a big shank on a small hammer.** That single
> constraint makes an upgrade path feel physical: buying a bigger drifter obsoletes your
> shank adapters, and that should cost the player something.

**2. Thread profile.** R-series (**rope thread**: R25/R28/R32/R38/R44/R51) is the
lighter-duty standard for smaller drills and holes roughly **33–64 mm**; T-series
(**trapezoidal**: T38/T45/T51/GT60/T76–T127) uses a trapezoidal profile "designed for
higher torque transfer and larger hole diameters, typically **64 mm to 127 mm**", and
"resists over-tightening and keeps energy transfer efficient across long drill strings —
which is why the T series scales where the R series stops"
(https://www.rock-drillbits.com/knowledge/drill-rod-sizes,
https://www.litechtools.com/t38-vs-t45-vs-t51-drill-rod-how-to-choose.html).
Indicative bit sizes: **R32 → 45–51 mm · T38 → 64–76 mm · T51 → 89–102 mm**
(https://www.bloommachinery.com/news/how-to-select-r32-t38-t51-threaded-button-bits.html).

**The non-interchangeability rule, sourced:** "Drill rod thread type must match the shank
adapter **and** bit thread on the existing drilling system, since **threads are not
interchangeable across series**. Mismatched threads cause incomplete engagement, energy
loss, and rapid wear on both components" (rock-drillbits, above). *That is the sentence
the shop's compatibility warning should paraphrase.*

**3. Hand and gender.** The catalogue lists **LH and RH** and **box vs pin** as separate
items for the same thread size. An `H64 LH pin` and an `H64 RH pin` are different parts.
**Left-hand thread is standard on much of this equipment** — note how many entries above
are LH. A shop that ignores hand will sell the wrong part.

**Plus, from the same catalogue:** flushing (`with flushing` / without) and sealing
(`with sealing` / without) are independent options on the same shank, and the **flushing
ring and bracket are model-specific** (a different part number per drifter model). So a
complete "does it fit" check is: **shaft Ø · thread profile · hand · box/pin · flushing ·
sealing · bracket for that model.** Seven facets. That is a rich, real filter set.

**Also seen in this catalogue and worth adding to `DOMAIN.md` §4:** the **IB** thread
family (**IB30 / IB40 / IB52**) and the **C** shank family (**C64 / C90 / C112**),
alongside the H-series. And **R51 "Mai"** — the MAI self-drilling anchor thread, sitting
in the anchoring family of §4 rather than the percussion family.

## C.3 HDD — the proprietary-thread problem

| Family | Nature | Interchangeable? |
|---|---|---|
| **API** (REG, IF, FH, NC) | Standardised under **API Spec 5DP / 7-2** | **Yes** — "precise dimensions that ensure interchangeability and consistent performance across various manufacturers" (https://www.sinodrills.com/api-drill-pipe-thread-types/) |
| **Vermeer Firestick** (1.66"–2.875") | Proprietary rod/thread design | **No** — brand-scoped |
| **Ditch Witch Forged HDX** | Proprietary, but "**designed to match competitive threads**", S135 steel (https://www.ditchwitch.com/hdd-tooling/drill-pipe/) | Partly — an explicit cross-fit claim by the OEM |
| **BECO, Cubex, Beadlock, H90, Mayhew, FEDP, Z-thread, RD (round)** | Non-API proprietary/legacy | **No** — "non-API proprietary threads like BECO and Cubex represent manufacturer-specific designs that may not be interchangeable with standard API connections" (https://sossusa.com/2024/06/24/drill-pipe-thread-compatibility-chart/) |

> **Game rule:** API threads are the *generic* tier — cheap, cross-brand, always
> available. Proprietary threads are the *brand-locked* tier — you buy from the OEM or
> from a licensed match. That is a clean economic mechanic and it is true.

**Ditch Witch AT is a compatibility class of its own.** The dual-pipe system (§A.16) uses
a **hex inner rod inside an outer pipe**. An AT rig does not take JT pipe and vice versa —
the interface is structurally different, not just differently threaded. Treat `AT` as a
**separate rig family** in the fits-rig facet, not a variant.

## C.4 Casing, rod handling and other gates

- **Casing joints** (`DOMAIN.md` §4): conical/cylindrical profile · RH/LH ·
  cone-ring / welded-thread / Leffer joint · trapezoidal / flat (DIN 4918) / round.
- **Rod-handling fit is by rod OD**, from the KLEMM HBR table (§A.1.5):
  HBR 120 → **76.1–177.8 mm**, HBR 122 → **114.3–254 mm**, HBR 124 → **133–356 mm**.
  Plus rod length, clamp count, clamp spacing — **and the carrier's slewing torque
  (3,600–8,700 Nm) and tiltrotator torque (900–4,400 Nm)**. A manipulator that the
  excavator cannot swing does not fit, regardless of jaw size.
- **Clamp/chuck range on the rig** is the other end of the same gate:
  Comacchio GEO 305 **45–220 mm**, MC 22 **45–520 mm**. A rig physically cannot grip a rod
  outside its clamp range.
- **Single vs double string** is a hard split in the magazines: KLEMM MAG types are
  specified as `single`, or `single / double` (§A.1.5). Double-head/duplex work needs
  double-capable handling.
- **Swivel pressure/speed** as a fit constraint: HÜTTE HBR 605-4 rear swivel 540 rpm at
  **100 bar** water, front 390 rpm at **50 bar**, for rods **60–114** and **79–194 mm**.

## C.5 Families that never interchange — the "never mix" list

1. **Percussion threads (R/T/H/IB/C) ↔ HDD threads (Firestick/HDX/API/BECO/Cubex).**
   Different segments entirely.
2. **R-series ↔ T-series** rock threads — different profiles (rope vs trapezoidal),
   sourced as non-interchangeable.
3. **H-shanks across shaft diameters** — H55 ≠ H64 ≠ H90 ≠ H112, and each is tied to a
   drifter shaft Ø (§C.2).
4. **LH ↔ RH** anything.
5. **Ditch Witch AT dual-pipe ↔ conventional single drill pipe.**
6. **Wireline core sizes** (AQ/BQ/NQ/HQ/PQ) are their own closed family (`DOMAIN.md` §4).
7. **Kelly-box sizes** (130/150/200 mm) — rotary/Kelly segment only, never percussion.

---

# §D. The visual read — how each class must look

For the modeller. Every geometric claim below is tied to a sourced dimension; anything
that is styling rather than fact is marked *(design guidance)*.

## D.1 Small tracked anchor rig
**Silhouette: a mast that dwarfs its carrier.** 4.7–6.8 t on narrow tracks —
**780 mm wide** (KLEMM KR 606-3), **750 mm** (KR 702-3/704-2E), **1.0 m with tracks
closed and 1.4 m opened** (Beretta T46). The tracks are **variable-width**: they retract
to squeeze through a doorway or gateway and extend on site for stability — that
transformation is the class's defining animation.

The mast **tilts and rotates through a compound articulation** so it can drill at any
angle including uphill and horizontally — Massenza describe rigs that drill "**in all
directions**", and Comacchio's MC line is built around a "**mast articulation system**"
(§A.4, §A.8). Do not model the mast as a fixed vertical tower; the joint stack between
carrier and mast is the interesting geometry.

Feed stroke is short — **1,200 / 1,700 / 2,200 mm** on a T46 — so the mast is stubby
relative to a vertical rig, and rods are short. Often **no on-board engine**: KR 606-3
and KR 702-3 tow a **separate power pack** (a second small skid or tracked box, 1.4–3.7 t)
connected by hydraulic hoses (§A.1.1). *That umbilical is a strong visual signature —
two objects, not one.* *(design guidance)*

## D.2 Micropile rig under low headroom
**Silhouette: crushed vertically.** Minimum headroom **2.0 m** (KR 606-3), **2.2 m**
(KR 702/704), **2.8 m** (GEAX XD). That is *below the ceiling of a domestic basement* —
HÜTTE literally call the HBR 203 a "**cellar drill rig**" (§A.2).

Consequences the model must show: **the mast is shorter than the rods it must handle**,
so the machine works in very short strokes and couples rods constantly. Rod length drops
to **1.5–2 m** (KLEMM HBR handling table). Expect a **telescopic or folding mast**, the
rotary head travelling a stroke shorter than the pile, and **no room above the head** —
the top of the mast nearly touches the ceiling slab. *(design guidance)*

Environment sells it: put it **indoors, under an existing structure**, with the ceiling
visible and close. That single framing distinguishes this class from D.1 more than any
machine detail.

## D.3 Mid/large anchor rig (the KR 806 class)
**Silhouette: heavy crawler, long mast, and a magazine.** 19.5–22 t, chassis
**2,500–2,700 mm** wide, **500 mm 3-rib chain**, ground clearance **350 mm**, ground
pressure **68 kN/m²** (§A.1.2). Mast frame **7.0–7.6 m**, extending to **18.2–21.1 m**
with lattice sections — so in transport it is a compact box and in work it is a tower
two to three times its own length. *That deployment is the class's hero animation.*

The distinguishing feature versus the small class is the **rod magazine** — a rack,
carousel or linear cassette bolted to the mast, holding rods and swinging them into line
(KLEMM MAG 1.x carousel / 2.x rack / 3.x–7.x linear, §A.1.5), with a published
**magazine load of up to 1,100 kg** on the KR 806-4GM
(https://www.geodrillinginternational.com/piling/news/1382971/klemm-launches-kr-806-4gm-anchor-drilling-rig).

**Double-head is the visual tell of anchor/overburden work:** two power units stacked on
one feed — a rotary head **and** a drifter (KH 39 + KD 1215R), or two rotary heads
(KH 39 + KH 21) — turning inner rod and outer casing independently on the same mast
(§A.1.2, §A.1.4). If the model shows one head, it reads as a generic rig; **two heads on
one carriage reads as anchor drilling to anyone who does it.**

Add: hydraulic hoses in bundles, a rod-handling arm, and — for jet grouting — hoses
running off to a **separate grout plant** (mixer 200–500 l, storage 500–1,500 l, on its
own skid, §A.1.6).

## D.4 Sonic rig
**Silhouette: an ordinary crawler carrying an extraordinary head.** The carrier is a
standard geotechnical crawler — the brochure literally shows a Toa Tone head on a
**Comacchio GEO 305** and an SDC 50K on a **Comacchio 900P** (§A.13). So **do not design
a bespoke sonic chassis**; design a **head**.

The head is a heavy, boxy, **isolated** mass at the top of the mast. Two features are
diagnostic and both come from the brochure diagram: **counter-rotating eccentric masses**
inside, and an **air damper / air spring** isolating the oscillator from the mast
(SP-50 and SP-8000 both list an air damper at 0.7 MPa). Visually: a substantial cast
housing on **visible isolation mounts**, with air and hydraulic lines into it. It is
noticeably bulkier than a rotary head of the same torque — the SP-50 weighs ~520 kg while
producing only 2.1–4.2 kNm, because the mass is there to shake, not to turn.

**Motion is the whole point.** At 67–150 Hz the head's oscillation is far too fast to
render as discrete motion — it should read as a **blur or hum**, with the visible drama
in the *soil*: the ground around the string fluidising, the string sinking smoothly and
straight rather than grinding. And **often no flush** — no mud return, no cuttings pile
(§A.13). A sonic hole is conspicuously **clean** compared to a rotary one.

Tooling: **3 m sections**, casing to **12" (305 mm)**, and the output is **continuous
core in liners** — show the sample tubes, they are the product.

## D.5 CPT truck and CPT crawler — two answers, two looks
**The CPT truck.** A **6×6 all-wheel-drive truck** with a **reinforced subframe** and an
enclosed body — it looks like a service or survey vehicle, not a rig. The mast is
**inside** or barely proud of the body. It **jacks itself off its wheels automatically
and levels** before testing (§A.14). The whole **20 t of vehicle is the reaction mass**,
so it sits *down* on its jacks and the body becomes the load path.

The **HYSON** penetrometer is the detail worth getting right and it is genuinely unusual:
an **"H"-form twin hydraulic cylinder set in which the piston rods are fixed to the truck
frame and the cylinders move** (§A.14). So the visible moving parts are the **cylinder
bodies travelling up and down the fixed rods** — the inverse of every other hydraulic ram
in this document. Operation is from a **touch screen (HMI)** with semi-automatic push/pull
clamps.

**The CPT crawler.** Two sub-types, and they must not look alike:
- **Ballasted** (van den Berg, 20 t): a squat, heavy, deliberately over-massed tracked
  box. All that weight exists only to be sat on.
- **Light** (Pagani TG 63-100, **910 kg**): a small, almost portable tracked frame,
  **operable by a single person**. It is far too light to react 100 kN by mass, so it must
  be tied down or ballasted — *if the anchoring method is confirmed, show the screw
  anchors going in first; that is a distinct and interesting pre-test ritual.*
  *(anchoring `UNVERIFIED` — confirm before modelling)*

**Nothing rotates in this class.** No cuttings, no flush, no mud, no noise. A CPT scene is
quiet and clinical — rods going in at a steady rate, a screen showing traces. That
restraint is what makes it read as *testing* rather than *drilling*.

## D.6 HDD rig on its slant
**Silhouette: a long, low, inclined frame — the only machine here that is not vertical.**
The rig sits on the surface with its carriage rail set at a shallow **entry angle: 6°–15°**
(Prime Drilling PD 250/90, §A.19). That wedge stance is the instantly readable HDD pose.

The **pipe box** is the second signature: a rack or magazine of drill rods sitting
alongside or under the frame, feeding rods onto the carriage one at a time as the
carriage runs down the rail, breaks the joint, and returns for the next. On a maxi rig
this is **rack-and-pinion** drive on a long beam (American Augers DD-440T, §A.20).

**Scale spread is enormous and should be visible.** A mini rig at **< 89 kN** is a
compact machine one person walks beside. A maxi at **2,500 kN / 32 t / 470 kW** (Prime
Drilling) or **440,000 lb** (American Augers) is a semi-trailer-sized installation. Same
pose, an order of magnitude apart.

**The rest of the spread is the giveaway that this is HDD and not drilling-in-place:**
an HDD site is a *system*, not a machine — mud mixing and recycling plant, mud tanks,
a power pack, a locator walking the bore path above ground with a receiver, and an
**exit pit some distance away**. Show the second location; HDD is the only method here
that has two ends. *(design guidance, consistent with `DOMAIN.md` §3 A "Locating &
Steering Systems")*

**The AT variant looks the same but the pipe is different** — dual-wall with a hex inner
rod (§A.16). If the model shows rod cross-sections, that distinction is worth a beat.

## D.7 Pipe jacking / microtunnelling — the one that works from a hole
**Silhouette: there is barely a machine on the surface.** The jacking frame sits **down in
a shaft, 4.87–7.3 m across** (Akkerman, §A.21), pushing pipe horizontally against a thrust
wall with **multi-cylinder keyhole geometry applying load through the centre of the pipe
axis**. On the surface you see: the **shaft with its shoring**, a **crane** lowering pipe
segments, a **power pack**, a control cabin, and a separation plant.

The MTBM itself is a **cutterhead in a can** — for slurry machines a cone crusher behind
the head, slurry lines running back through the pipe string (Herrenknecht AVN,
§A.17). It is only ever seen twice: going into the shaft, and coming out of the reception
pit.

**Speed sells the scale**: pipe advances at **241–381 mm/min** under **726–1,089 t** of
thrust. It is slow and immensely forceful — the opposite of the sonic rig's fast, light
buzz. *(design guidance)*

## D.8 The one-line disambiguation table
So they don't all read as the same crawler:

| Class | The one thing that identifies it at a glance |
|---|---|
| Small anchor rig | Narrow retractable tracks + articulated mast at an odd angle + separate power pack on a hose |
| Micropile / low headroom | **A ceiling.** 2.0–2.8 m of air above the machine |
| Mid/large anchor rig | **Two heads on one feed** + a rod magazine on the mast |
| Rotary/Kelly mini-pile | **Telescopic Kelly bar** and an auger/bucket, not a rod string |
| Geotechnical / coring | Small crawler, high-rpm head, **core boxes** on the ground |
| Sonic | Boxy isolated head on air mounts, blurred motion, **no flush, clean hole, core in liners** |
| CPT truck | **A truck on its jacks**, nothing rotating, a screen |
| CPT crawler (light) | 900 kg frame, one operator, **anchored down** |
| HDD | **6°–15° slant**, pipe box, and a second site over the horizon |
| Pipe jacking | **A shaft.** The machine is below ground level |

---

# §E. The two ambiguous names — findings

## E.1 "Tactex" — **RESOLVED, but almost certainly not the company meant**

A real company with that exact name exists: **TactEX Industries**, **Parksville, British
Columbia, Canada**, founded **2021**, describing itself as "Canada's most innovative
drilling equipment supplier" delivering "all-in-one geotechnical drill solutions for the
**diamond drilling** industry", with customisable drills across three platforms, all
parts built in-house and interchangeable
(https://tactexindustries.com/, https://tactexindustries.com/our-company/about/).

**But it does not fit the brief's sector.** TactEX is a young Canadian **diamond
core / exploration** drill maker, not a European anchor / micropile / HDD OEM. It belongs
to `DOMAIN.md` §1 `core` (exploration wireline), not `anchor`.

**On the user's guess that "Tactex" might be TESCAR:** phonetically plausible, and
**TESCAR is real and does belong to this sector** — TES CAR Srl, Osimo, Italy, CF-series
mini piling rigs since 1985, 12–100 kNm, 5–30 t (§A.5). If the name was heard rather than
read in a foundation-drilling context, **TESCAR is the more likely intended company**.
But the two are genuinely different firms and I cannot tell from the name alone which was
meant. **Both are documented above (§A.5 for TESCAR); the user should pick.**

## E.2 "SPD" — **UNRESOLVED. Say so plainly.**

**No drilling-equipment manufacturer named SPD or S.P.D. could be confirmed in this
sector.** Five searches were run across different framings: general web, Italian-language
company directories (`perforazioni` / `trivelle` / `srl`), Europages, DirectIndustry,
used-equipment marketplaces (Mascus), and the HDD/drifter/anchor niches specifically.
None returned a match.

**What was ruled out along the way**, in case it narrows things:
- Not an Italian foundation-drilling firm findable via Europages or Italian trade
  directories — those searches surfaced Geax, Mori, Sime, Moioli, Ciancaleoni, Adriatech,
  ECDRILL, Massenza, Casagrande, but no SPD.
- Not a brand indexed on Mascus in the anchor/micropile/surface-drill categories.
- Not a German or Italian HDD, drifter or rotary-head maker findable by name — those
  searches surfaced Herrenknecht, TRACTO, Krupp, IMT, Soilmec, Prime Drilling.
- **`S.P.A.`** (*Società per Azioni*) and **`S.r.l.`** are Italian company-form suffixes
  that appear constantly in this sector (Casagrande S.p.A., TES CAR Srl, Fraste SpA). It
  is worth checking whether "SPD" was a mishearing of a company *form* rather than a
  company *name*.

**Candidates the user might be thinking of, offered as questions — none confirmed:**
- **Prime Drilling** (German HDD, "PD" model prefix, §A.19) — the model designations are
  literally `PD 250/90`. "SPD" could be a garbled "PD".
- **SDA** — *self-drilling anchor*, a method abbreviation in `DOMAIN.md` §3 E, not a company.
- **DSB** — the Nordmeyer rig series (§A.11), a similar three-letter shape.

**Recommendation:** treat SPD as unresolved and ask the user for one more datum — country,
a model designation, a product photo, or where they saw the name. Do **not** put a guessed
company into the research file or the game.

---

# §F. Implementer notes

## F.1 How to use this without breaking the naming rule
- **Take the envelope, leave the name.** "A 20 t double-head anchor crawler, 130 kN feed,
  34 kNm rotary, 7.6 m mast extending to 18 m, 175 kW" is a *class*, and it is accurate.
  `KR 806-3GS` is a *trademark*, and it is off-limits (`DOMAIN.md` §6, §10).
- **Invent naming conventions in the manner of the real ones, not copies of them.** The
  real conventions observed here are worth imitating *structurally* because each encodes
  something different:
  - capability-encoded (KLEMM `KD <kNm><kg>`, `KH <kNm>`) — the number *is* the spec;
  - force-encoded imperial (Vermeer `D<klb>x<hundreds ft-lb>`, Ditch Witch `JT<klb>`,
    American Augers `DD-<klb>`);
  - force-encoded metric (Prime Drilling `PD <tf>/<kNm>`, Pagani `TG <series>-<kN>`);
  - product-encoded (Herrenknecht `AVN<mm of pipe>`);
  - method-encoded (TRACTO `GRUNDO<METHOD>`);
  - segment-plus-size (Comacchio `MC`/`GEO`/`CH`/`CA` + number).
  Pick **one** scheme per in-game manufacturer and hold it. That consistency is what
  makes a fictional brand feel real.
- **Let a badge go stale on purpose.** The Vermeer S3 case (§A.15) is a gift: a machine
  whose name no longer matches its spec is *authentic*, and it justifies the shop keying
  compatibility off interfaces rather than names.

## F.2 Mechanics this research directly supports
1. **Rigs are composed, not bought.** Carrier + mast + head(s) + magazine. KLEMM's own
   catalogue is organised exactly this way (§A.1.1).
2. **The carrier caps the tool.** KH 62 = 61.5 kNm alone, 54 kNm on a KR 806-5G. Buying a
   bigger head does nothing without the hydraulics behind it.
3. **Shank Ø gates the drifter upgrade.** §C.2 — a bigger hammer strands your shank
   adapters. Real, sourced, and it gives upgrades a cost beyond price.
4. **Reaction mass gates CPT.** 20 t ⇒ 200 kN (§A.14). You cannot push harder than you
   weigh — unless you anchor.
5. **Frequency tiers sonic.** 67 Hz vs 150 Hz is two distinct capability tiers from
   independent sources (§A.13/B.4).
6. **Method vs depth vs diameter trade-off** is fully specified by the GEO 305 table
   (§A.4): PQ 100–150 m, NQ 180–250 m, 6" DTH 50–60 m, 4–5" DTH 100–120 m. Bigger hole,
   shallower hole.
7. **Static vs dynamic, mud vs no-mud, one site vs two** — GRUNDOBURST/GRUNDOCRACK,
   Ditch Witch AT vs JT, HDD vs everything else. Real strategic forks.
8. **The launch shaft** as a site-prep cost unique to pipe jacking (§A.21).
9. **API = generic tier, proprietary = brand-locked tier** for HDD consumables (§C.3).

## F.3 Open items — verify before any of this reaches a player
| Item | Status |
|---|---|
| KLEMM KD percussion energy in **joules** | `UNVERIFIED` — KLEMM publishes piston weight, not J. No J figure found for any KD model. |
| Pagani light-CPT **anchoring/reaction method** | `UNVERIFIED` — physics demands it, source not found |
| MDT published **pull/feed units** (tf vs kN) | `UNVERIFIED` — almost certainly tf; do not import as kN |
| HÜTTE HBR 203 weight ("2,700–6,200 kg") | `UNVERIFIED` — inconsistent with the HBR 202 |
| HÜTTE ownership / acquisition history | `UNVERIFIED` |
| GEAX corporate ownership | `UNVERIFIED` |
| Eurodrill `HD <nnnn>` digit meaning | `UNVERIFIED` |
| GRUNDOBURST number = kN | `INFERRED` only |
| GRUNDORAM "40,000 Nm thrust" | **Unit-garbled at source — do not use** |
| Sonicor 50K/33K brochure torque conversions | **Wrong by 1000× at source — corrected in §A.13, use the corrected values** |
| Sonicor 33K oscillator force | `UNVERIFIED` — brochure duplicates the 50K figure |
| KLEMM `KH 39` | Appears on rig pages, absent from the Aug-2025 catalogue table |
| KLEMM suffixes `S`, `K`, `M` | `UNVERIFIED` |
| Herrenknecht HDD per-model pullback; TBM diameter ranges by family | `UNVERIFIED` |
| Massenza per-model specs; Beretta T51/T209; Nordmeyer DSB number meaning | `UNVERIFIED` |
| **"SPD"** | **UNRESOLVED — see §E.2** |

---

*Compiled 2026-09-04. Local sources as listed in §0; web sources cited inline. Every
number above is traceable; everything that is not is labelled. Per `DOMAIN.md` §10, no
supplier part numbers or drawing numbers have been carried into this file.*
