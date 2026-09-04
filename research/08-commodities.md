# Commodities — what you drill FOR

Distilled from a research pass that sourced every figure by direct retrieval of
primary documents: **USGS Mineral Deposit Models** (SIR 2010-5070 series,
Bulletin 1693, Open-File grade–tonnage databases) and **SEC-filed S-K 1300
Technical Report Summaries / NI 43-101 reports via EDGAR**. Unit conversions are
marked `[conv]`. Unsourceable items are marked **UNVERIFIED** and must not reach
player-facing text.

This is the table behind `DESIGN_EXPANSION.md` §2. It exists so the game can say
*what* you are drilling for, place a believable ore body in the section, and
score the player on the sample rather than the metre.

---

## 0. Master grade–tonnage anchors (for "median vs giant" tuning)

**Porphyry Cu** — Singer, Berger & Moring (2008), USGS OFR 2008-1155.
422 deposits. Median **240 Mt @ 0.44 % Cu**. 10th percentile (the big end)
1,500 Mt @ 0.75 %. Median by-product **Au 0.21 g/t** (recovered from ~⅔ of
deposits), **Ag 2.0 g/t** (~⅓), **Mo 0.013 %**.

**VMS** — Mosier, Berger & Singer (2009), USGS OFR 2009-1034.
Felsic: median **3.0 Mt @ 1.20 % Cu, 3.2 % Zn, 25 g/t Ag**.
Bimodal-mafic: median 1.9 Mt @ 1.40 % Cu. Mafic: median 0.74 Mt @ 1.70 % Cu.
Population of 1,021 deposits spans ~0.001–1,000 Mt.

**Orogenic lode gold** — Bliss (1986) model, restated by USGS 2025:
*"50 percent of deposits have gold grades of at least 16 g/t and ore tonnages of
at least 30,000 tonnes."* A median lode vein is **tiny and very high grade**.
USGS warns this model predates modern bulk open-pit mining of low-grade halos.

**Carlin-type / sediment-hosted Au** — USGS Bulletin 1693.
Real span **0.32–464 Mt @ 0.65–9.60 g/t Au**; typical mid-pack ~5–20 Mt @ 2–4 g/t.

---

## 1. GOLD

### 1a. Orogenic / mesothermal lode gold
*USGS Model 36a "Low-sulfide Au-quartz veins".*

**Shape.** Tabular, high-angle, shear-hosted. St Ives (Yilgarn): a
**0.5–50 cm cataclasite core** wrapped in **0.1 cm–3.0 m** of foliated
cataclasite; the controlling shear runs **>10 km**. A named orebody (Hamlet
North) is **150 m strike × 5–10 m wide × 1,000 m down-plunge**. Casa Berardi
(Abitibi): fault dips **80° S**, traceable **37 km**; the 113 Zone corridor is
**20–70 m wide**, growing from 150 m strike at the 250 m level to >400 m at the
550 m level.

**Grades.** St Ives reserve cut-offs: **open pit 0.35–0.45 g/t; underground mill
feed 2.6–3.6 g/t**. Reserves UG 21,962 kt @ **4.2 g/t**. Casa Berardi reserves
18.82 Mt @ **2.95 g/t**.
**Bonanza — Fosterville, Victoria:** reserves 3,610 kt @ **15.4 g/t**, including
**1,250 koz @ 30.6 g/t** in the Swan Zone; FY2020 mill feed 593,343 t @
**33.9 g/t**.

**Rock.** Greenstone, basalt, dolerite, massive quartz veins → Hoek **R5–R6
(100 to >250 MPa)**. The hardest common gold-drilling environment.

**Method.** DD and RC both; open-pit resources predominantly **5-inch RC**
supported by DD. **RC recovery 70–95 %**; DD nominally 100 %. Paleochannel
material uses **whole-sample aircore**, historically **sonic**. Oriented core via
a metal spear imprint for structural measurement.
**Nugget effect driver** — Casa Berardi: 50 % of gold particles are **<30 µm**,
~3 % **>100 µm**. That >100 µm tail is what smears and biases an RC split.

**Spacing.** Measured **5 × 10 m** → Indicated **20 × 20 m** → Inferred
**40 × 40 m**. Depths: scout 100–300 m; definition 300–800 m; deep extension
800–1,500 m.

### 1b. Epithermal Au-Ag (high / low / intermediate sulphidation)
*USGS SIR 2010-5070-Q.*

| | HS | LS | IS |
|---|---|---|---|
| Depth to top of ore | tens of m – 700 m | m – several hundred m | several hundred m |
| Vertical ore extent | 100–800 m | mostly 100–400 m | up to ~1,000 m |
| Mined vein width | 3–>10 m structural | **<1–3 m** | **<1–>10 m** |

Class envelope: **0.1 to >30 g/t Au, <1 to >1,000 g/t Ag**, forming at
**≤1,500 m** depth and **≤300 °C**.
Examples — HS: Yanacocha, Pueblo Viejo, Pierina. LS: Hishikari, Midas, Sleeper.
IS: Comstock Lode, **Fresnillo**, El Peñón, Roșia Montană.

**Bonanza definitions (use verbatim as game thresholds):** USGS — *"more than
1 troy ounce of gold per short ton"* = **34.3 g/t** `[conv]`. Sillitoe — a
bonanza orebody contains **>1 Moz at >1 oz/t**. Ginguro silver-sulphide bands
run **tenths of a percent to several percent** gold, i.e. 1,000s–10,000s g/t in
centimetre-scale bands.

**Rock.** The defining drilling problem: **silicified sinter and vuggy quartz are
R6 (>250 MPa)** while the enclosing argillic-altered tuff collapses to
**R2–R3 (5–50 MPa)** — very abrupt hard/soft alternation causing core loss and
bit wear. Salares Norte flags its silicified oxide ore as the *second hardest*
material on site.

**Method.** Mostly **HQ diamond core (63.5 mm)** with some RC. Core over RC
because narrow (<1–3 m) steeply-dipping targets need true width and
vein-texture logging — crustiform, colloform and ginguro banding — which RC
cannot resolve at centimetre scale.

### 1c. Carlin-type sediment-hosted gold
*USGS Model 26a. Operator wording: "Carlin-type sediment-hosted disseminated."*

**Shape.** Stratabound/structurally controlled tabular bodies along high-angle
faults and the Roberts Mountains thrust. Real Nevada dimensions `[conv]`:

| Deposit | Length | Width | Thickness |
|---|---|---|---|
| South Carlin | 610–1,220 m | 152–274 m | **3–18 m** |
| Emigrant | 3,658 m | 1,006 m | 3–101 m |
| Goldrush | **5,273 m** | 427 m | 3–107 m |
| Turquoise Ridge UG | 792–1,400 m | 300–792 m | 3–30 m |

**Cut-offs (the open-pit / underground split is the whole economics).**
OP resource **0.17–1.47 g/t**; UG resource **2.71–7.37 g/t**.
Driver: OP mining **US$1.64–3.80/t** vs **UG mining US$61.30–213.72/t**.
Nevada Gold Mines total reserves **520.3 Mt @ 3.00 g/t = 50.22 Moz**.

**Rock.** The classic Carlin problem: decalcified/argillised ore is soft
(**R2–R3**) and caves, while **jasperoid and silicified breccia are R6
(>250 MPa)** — mush and chert alternating within one hole.

**Method.** RC, core, air rotary, mud rotary, Cubex; **churn** where placer gold
is known. RC **140–165 mm (5.5–6.5″)**; core **HQ default, reduced to NQ in
difficult ground, PQ for metallurgy**. Core recovery **95–100 % in competent
mineralisation**. Rotary and churn samples are largely **excluded from resource
estimation** for low confidence.
Spacing: well-drilled **6–21 m**, out to **30–134 m**. Cortez complex alone:
**22,822 holes / 4,109,019 m** (RC avg 155 m, core avg 173 m).

### 1d. Placer / alluvial gold
*USGS Model 39a "Placer Au-PGE".*

Cenozoic only — older placers rarely survive. Highest values sit **at the base of
the gravel**, in riffles, fractured bedrock and bedding planes **transverse to
flow**. Geometry is a ribbon-like **pay-streak** at the gravel/bedrock interface.

**Grade convention:** placers are measured in **g/m³**, converted at
**2.0 t/m³**. Cut-off depends on the *mining method*, not the deposit.
Worked example — Chandalar, Alaska: **5.73 Mm³** `[conv]` of gravel at
**≈1.03 g/m³** `[conv]`; **111 boreholes / 15,550 ft** = avg **42.7 m/hole**;
lines **152 m** apart, holes **15–30 m** along the line, sampled continuously
every **1.5 m**.

**Method.** Churn, sonic, aircore — **whole-sample, large-diameter**. Conventional
DD gets no recovery in saturated unconsolidated gravel, and a single nugget
dominates the assay. Depths 5–50 m to bedrock.

### 1e. Witwatersrand paleoplacer reefs
*USGS SIR 2010-5070-P.*

Basin **350 × 200 km**; production **>50,000 t Au** (~1.6 Goz). Tabular beds
concordant with bedding, **single-pebble to metre-scale thickness**, persisting
**tens to hundreds of kilometres**.
**South Deep:** reserves **175,173 kt @ 5.0 g/t = 28 Moz**; UG reserve cut-off
**4.0–4.4 g/t**; shaft to **2,998 m**, workings planned to **~3,300 m**.
**UCS 193–211 MPa**, and — the number that matters for tooling — **88–93 % SiO₂,
predominantly quartz**: extremely abrasive on bits and mill liners.
Witwatersrand mines are the **deepest on Earth, >3.5 km, approaching 4 km**.

---

## 2. SILVER

**Epithermal Ag-Au veins (Mexican Silver Belt, 800 km).**
Valdecañas/Juanicipio: two structures striking ESE, **dipping 35–50° SW**. Main
vein intersected by 43 holes over **1,800 m strike**, thickness **<1 m to >16 m,
averaging ~5 m true**. Critically: *"the silver-gold rich section of each
structure is typically limited to **200 to 400 m of elevation**, corresponding to
the **boiling zone**."* Resources reported at **200 g/t Ag-equivalent**.
Drilling: **32 core holes / 25,686 m = avg 803 m per hole** — deep surface holes
into steep veins. Indicated at **~100 m centres**, inferred at 200 m sections.

**Lucky Friday, Coeur d'Alene** — clastic-metasediment-hosted veins in Belt
Supergroup quartzite/argillite. Reserves **5.46 Mst @ 470 g/t Ag** `[conv]`,
8.3 % Pb, 3.3 % Zn. Cut-off is a **US$200/t NSR**, not a grade. Minimum mining
widths **2.4–3.4 m** `[conv]`. Shaft to **2,627 m**; fault-slip seismicity is the
governing hazard.

**Byproduct silver.** *"High silver grades in epithermal veins commonly led to
mining subjacent, lower-grade carbonate-replacement silver-lead-zinc
deposits."* Peñasquito: funnel-shaped **diatreme breccia pipes**, Peñasco
**900 × 800 m** at surface; reserves 362 Mt @ **33.84 g/t Ag** = 394 Moz.
25 % of sediment-hosted stratiform Cu deposits carry Ag at **2–200 g/t**.

---

## 3. COPPER

### 3a. Porphyry Cu / Cu-Mo / Cu-Au
*USGS SIR 2010-5070-B; Sillitoe (2010).*

**Shape.** Circular/elliptical in plan, vertical dimension similar to horizontal,
centred on small cylindrical stocks. Orebody plan area **0.02–28 km², median
0.6 km²**; altered rock median **5.1 km²**. Cross-sections vary from **cylindrical
shells around a barren core**, to **inverted cups**, to vertically elongate
ellipses. **Vertical extent of hypogene ore: generally ≤1–1.5 km.**
Stocks and dikes are **≤1 km** in diameter/length (outlier: the 14 km
Chuquicamata stock). **Lithocaps: several to >10 km², locally 100 km², >1 km
thick** — far more extensive than the deposit beneath.

**THE SUPERGENE PROFILE — the most useful thing here for a drilling game.**
- **Leached capping: zero to several hundred metres.**
- **Oxide ore: as much as 300 m thick**, more commonly tens to <200 m,
  0.34–1+ % Cu.
- **Enriched chalcocite blanket: as much as 750 m thick**, most tens to several
  hundred metres, **0.4–1.7 % Cu — invariably higher grade than the hypogene ore
  beneath it.** Supergene enrichment "seldom exceeds 200 m" vertically.

**Escondida, worked in full.** Leached layer **~200 m average, locally 400 m**,
over an enrichment zone **4.5 × 1.8 km, max ~400 m thick**. Mineralisation starts
**150–200 m below surface**. Hypogene **0.2–1 % Cu**; **the enrichment zone
reaches 4 % Cu**. Cut-offs: sulphide **0.25–0.30 % TCu**, oxide **0.20 % SCu**.
Intact rock strength **σci 17.9–147.3 MPa** — argillic/sericitic units weak,
silicified/potassic units hard.
Drilling 1981–2022: **8,596 holes / 2,691,948 m** = avg **313 m**. RC
**139.7–146.05 mm**; DDH **HQ default → NQ → BQ as required**, PQ for metallurgy.
The canonical trade-off, stated by the operator: *"using RC to drill through
barren overburden and switching to DDH shortly above mineralised rock."*
Gyro survey every **20 m**; holes exceeding a cumulative deviation limit are
rejected. Spacing **50 m** near the enrichment mantle, sub-vertical so the
blanket is properly captured.

### 3b. Sediment-hosted stratiform copper
*USGS SIR 2010-5070-M. Three subtypes: reduced-facies, sandstone, red-bed.*

**Reduced-facies deposits are sheets**: strike **3,000–5,300 m**, width
**550–2,000 m**, ore thickness **2–70 m**, economic vertical extent more commonly
**1–15 m**. White Pine is a single continuous ore layer **1–7 m thick over
50 km²**. Sandstone type is tabular/lens, lateral dimensions **20–100× the
thickness**. Red-bed lenses are tens of metres long, <10 m thick.
Grades: outside the Copperbelt **1.08–2.09 % Cu**; **inside the Central African
Copperbelt 2.20–2.59 % Cu**. Kupferschiefer at Lubin: **3–4 m mined thickness at
~2 % Cu**; the medieval shale bed alone averaged **>5 % Cu**.
Ranks **first in world Co production and fourth in Ag**.
Because the target is a *stratigraphic surface* rather than a structure, the
working product is a **grade × thickness contour map** in metre-percent.

### 3c. VMS copper
*USGS SIR 2010-5070-C.*

Typical dimensions **100–500 m**; giants several km². Vertical extent is
**tens of metres** for undeformed deposits; steeply dipping tabular bodies reach
**1,800–2,000 m** (Besshi, Kidd Creek). Feeder zones **generally <100 m**.
Alteration haloes are **two to three times wider** than the economic deposit.
**Greens Creek:** reserves 11.08 Mst @ **387 g/t Ag** `[conv]`, 2.91 g/t Au,
2.6 % Pb, 6.5 % Zn. Cut-off is a **value** cut-off — US$215 NSR/ton — with a
US$50 NSR wireframing threshold. West Zone: **762 m strike, 312 m vertical,
thickness 3 m to >91 m**.
Drilling 1975–2020: **8,202 holes / 1,226,795 m**; surface holes avg **376 m**.
Core sizes and *why*: **NQ/NQTK underground, telescoping to BQ/BQTK when ground
is faulted**; surface uses **HQ tri-cone through overburden purely to set
casing**, then reduces to NQ in bedrock. Definition fans from underground
stations at **15–30 m along strike**.

### 3d. IOCG — Olympic Dam
Reserves **551 Mt @ 1.85 % Cu, 0.59 kg/t U₃O₈, 0.67 g/t Au, 4 g/t Ag**;
M+I resources 899 Mt @ 1.31 % Cu. Underground, nominal milling **11 Mtpa**.
Exploration runs **up to 12 deep directional diamond rigs** at Oak Dam and
**up to 11** at OD Deeps. *Plan dimensions and the ~10 Bt global resource:*
**UNVERIFIED** — Geoscience Australia URLs 404'd.

---

## 4. CROSS-CUTTING RULES — this is what the game should model

### Core sizes actually in use
| Size | Core Ø | Where |
|---|---|---|
| BQ / BQTK | 36.4 mm | bad ground (telescoped down to) |
| LTK60 | 44.0 mm | underground |
| NQ / NQ3 / NQTK | 47.6 mm | UG default; surface reduce-from-HQ |
| HQ / HQ3 | **63.5 mm** | the surface default nearly everywhere |
| PQ | 85 mm | metallurgical samples |
| RC | 140–165 mm | bulk sampling |

### Why a method gets chosen — verbatim drivers, all game-usable
1. **RC through barren cover, then switch to core** above mineralisation — cost.
2. **HQ tri-cone through unconsolidated overburden purely to set casing**, then
   core the bedrock.
3. **Telescope HQ → NQ → BQ when ground is faulted or broken.**
4. **Oriented core** (metal-spear imprint) where structure must be measured.
5. **Whole-sample aircore / sonic** for paleochannel and placer material;
   **churn** in placer ground.
6. **Rotary and churn samples are excluded from resource estimation** — low
   sampling confidence. (Escondida excluded 96 rotary holes outright.)
7. **Recovery reality:** RC **70–95 %**; core **95–100 %** in competent rock.
8. **Hole deviation is a QA gate** — gyro every 20 m, holes over the limit are
   rejected.
9. **Nugget risk scales with gold particle size** — the >100 µm tail is what
   biases an RC split.

### Typical drilled depth by stage
| Stage | Band |
|---|---|
| First-pass scout | 100–300 m |
| Porphyry resource definition | 250–450 m |
| VMS / underground surface holes | 300–400 m |
| Deep epithermal vein from surface | 500–1,000+ m |
| Deep extension / IOCG | 1,000–2,500 m+ |

### Abrasivity proxy
**Cerchar Abrasivity Index numeric values by rock type: UNVERIFIED** — operators
confirm the test is run but publish no values. **Use quartz content instead.**
Witwatersrand reef at **88–93 % SiO₂** is the extreme; quartzite, chert and
quartz-vein hosts are the bit-killers. That maps directly onto the game's
existing `abrasivity` field in the `GROUND` table.

---

## 5. Gaps
1. Cerchar numeric values — unsourced; use SiO₂ content.
2. USGS placer model 39a median grade/tonnage — published only as figures.
3. Central African Copperbelt / Kupferschiefer operator drilling statistics —
   those operators file to TSX/LSE, not SEC.
4. Olympic Dam plan dimensions and global resource.
5. Escondida's per-method drilling table has misaligned labels in the source
   PDF's text layer; only the narrative totals are reliable.
