# 06 — Geotechnical site investigation, environmental drilling, water well & geothermal

Research pack for **Drillity I The Game**, closing the gaps identified in
`DESIGN_EXPANSION.md` §5 (Geotechnical: *"no dedicated site-investigation
method; SPT (driven) and CPT (pushed) are mis-filed as drill bits"*) and §4
(*"SPT split-spoons and CPT piezocones filed as drill bits (one is driven, the
other is pushed)"*), plus the two applications that `src/game/data.js` already
declares but has never described properly — **Water Well** and **Geothermal**.

**Scope.** What the site-investigation methods actually are and why two of them
are not drilling at all; environmental and contaminated-land work and what the
driller must do differently; water well and ground-source geothermal design;
water-powered DTH hammers; the real crew; the machine silhouettes to model; the
hazards and the correct response; and a mechanics proposal that answers the hard
question — *what do Feed / Rotation / Flush become when the tool is hammered in
by a falling weight, or pushed in at a constant 20 mm/s with no rotation and no
flush at all?*

**Rules obeyed.** Every claim carries a source: a local filename in
`C:\Users\henri\Downloads\` or a URL. Anything unsourceable is marked
`UNVERIFIED` or cut, per `PLATFORM_TRUTH.md` Part C. Manufacturer names and
model designations appear **only as citations**; none may ship as in-game
content (`DOMAIN.md` §6, `PLATFORM_TRUTH.md` Part C rule 4). Swedish and German
terms are captured because Drillity's home market is Nordics + DACH.

---

## Source key

### Local files (`C:\Users\henri\Downloads\`)

| Key | File |
|---|---|
| `[WAI35]` | `13.1-BWH-MWH-wasserbetriebener-Imlochhammer-WAI35-EN-1.pdf` — water-powered DTH hammer datasheet |
| `[WAI40]` | `13.2-BWH-MWH-wasserbetriebener-Imlochhammer-WAI40-EN-1.pdf` |
| `[WAI50]` | `13.3-BWH-MWH-wasserbetriebener-Imlochhammer-WAI50-EN-1.pdf` |
| `[WAI60]` | `13.4-BWH-MWH-wasserbetriebener-Imlochhammer-WAI60-EN-1.pdf` |
| `[WAI80]` | `13.5-BWH-MWH-wasserbetriebener-Imlochhammer-WAI80-EN.pdf` |
| `[SONIC-BR]` | `Drilltechniques-Sonic-Brochure.pdf` — "Sonic Drilling Guide", sonic head principle + head specifications |
| `[SONIC-SI]` | `Structural_drilling_using_the_high-frequency_sonic-in-Slovenia.pdf` — Sporin & Vukelič, *RMZ – M&G* Vol. 64 (2017), DOI 10.1515/rmzmag-2017-0001, CC BY-NC-ND 3.0 |
| `[SWIVEL]` | `Technical sheet surface and underground water swivels.pdf` — surface/underground water swivel capacities |
| `[DTH-AIR]` | `Mincon - Minroc MQ Imlochhammer Range.pdf` — **cited only** for the air-DTH operating-pressure envelope, as the comparison baseline for water hammers |
| `[MUDPUMP]` | `2023-Mud-Pump-Consumables.pdf` — HMH fluid-end consumables; triplex fluid ends, API 7K valve chambers |

> Note on `[SWIVEL]` and `[DTH-AIR]`: both are single-supplier catalogues.
> Per `PLATFORM_TRUTH.md`, they may inform *vocabulary and orders of magnitude*
> only. No model designation from either file goes into the game.

### Standards and web sources

| Key | Source |
|---|---|
| `[D1586]` | ASTM D1586/D1586M-18, *Standard Test Method for Standard Penetration Test (SPT) and Split-Barrel Sampling of Soils* — https://store.astm.org/standards/d1586 |
| `[D5778]` | ASTM D5778-20, *Standard Test Method for Electronic Friction Cone and Piezocone Penetration Testing of Soils* — https://store.astm.org/d5778-20.html ; full text consulted at https://mhkdr.openei.org/files/529/2020%20-%20American%20Society%20for%20Testing%20and%20Materials%20-%20Test%20Method%20for%20Electronic%20Friction%20Cone%20and%20Piezo.pdf |
| `[22476-2]` | EN ISO 22476-2:2005, *Geotechnical investigation and testing — Field testing — Part 2: Dynamic probing* — https://www.iso.org/standard/36246.html ; full text consulted at https://sanapey.com/wp-content/uploads/2023/12/Iso-22476-2-Dynamic-Probing_compressed.pdf |
| `[22475-1]` | ISO 22475-1:2021, *Sampling methods and groundwater measurements — Part 1* — https://www.iso.org/standard/71002.html |
| `[GE-2009]` | Baldwin, M. (Norwest Holst) & Gosling, D. (Soil Mechanics), *"BS EN ISO 22475-1: Implications for geotechnical sampling in the UK"*, **Ground Engineering**, August 2009, pp. 28–31 — https://cdn.ca.emap.com/wp-content/uploads/sites/13/2009/08/GE-Aug-2009-BS-EN-ISO-22475-1-Implications-for-geotechnical-sampling-in-the-UL-Baldwin-Gosling.pdf |
| `[SPT-NOTES]` | *Notes on the Standard Penetration Test*, GE 441 Advanced Engineering Geology & Geotechnics, University of Memphis — http://www.ce.memphis.edu/4151/Documents/SPT%20Notes.pdf |
| `[SPT-CORR]` | *SPT N-Value Correction Factors Explained — Ce, Cr, Cb, Cs, CN*, DartisTech — https://dartistech.com/docs/spt-correction-factors/ |
| `[WIKI-SPT]` | https://en.wikipedia.org/wiki/Standard_penetration_test |
| `[WIKI-CPT]` | https://en.wikipedia.org/wiki/Cone_penetration_test |
| `[ROB-SBT]` | Robertson, P.K., *"Soil Behaviour Type from the CPT: an update"*, Gregg Drilling & Testing — https://www.cpt-robertson.com/PublicationsPDF/2-56%20RobSBT.pdf |
| `[SBT-IC]` | *Robertson SBT Chart — How to Classify Soils from CPT Data*, DartisTech — https://dartistech.com/docs/sbt-classification/ |
| `[SETTLE3]` | Rocscience, *Settle3 CPT Theory Manual* — https://static.rocscience.cloud/assets/verification-and-theory/Settle3/Settle3-CPT-Theory-Manual.pdf |
| `[BDA]` | British Drilling Association, *BDA Audit Handbook* v2.3 (Jan 2023) — https://www.britishdrillingassociation.co.uk/wp-content/uploads/2024/02/BDA-Audit-Handbook_v2.3.pdf ; scheme page https://www.britishdrillingassociation.co.uk/competence/bda-audit/ |
| `[HSG47]` | HSE, *HSG47 Avoiding danger from underground services*, 3rd ed. — https://www.hse.gov.uk/pubns/priced/hsg47.pdf |
| `[NB16]` | Sveriges geologiska undersökning (SGU), *Normbrunn –16: Vägledning för att borra brunn*, December 2016 — https://resource.sgu.se/produkter/broschyrer/vagledning-normbrunn-16.pdf |
| `[SEPA-DEC]` | SEPA / Environment Agency, *Good practice for decommissioning redundant boreholes and wells* — https://www.sepa.org.uk/media/151841/decomissioning_redundant_boreholes.pdf |
| `[EPA-LF]` | US EPA Region 1, *Low Stress (Low Flow) Purging and Sampling Procedure for the Collection of Groundwater Samples from Monitoring Wells*, EQASOP-GW4 Rev. 4, rev. 19 Sep 2017 — https://www.epa.gov/sites/default/files/2017-10/documents/eqasop-gw4.pdf |
| `[EPA-PFAS]` | US EPA, *TGI — Per- and Polyfluoroalkyl Substances (PFAS) Field Sampling Guide*, Rev. 10, 26 Jan 2022 — https://www.epa.gov/system/files/documents/2023-07/App%20B%20-%20TGI%20for%20PFAS%20Per-%20and%20Polyfluoroalkyl%20Substances%20Field%20Sampling%20Guide.pdf |
| `[OAR]` | Oregon Administrative Rule 690-240-0460, *Monitoring Well Screen, Filter Pack, and Filter Pack Seal* — https://oregon.public.law/rules/oar_690-240-0460 |
| `[WWJ-FP]` | Hanna, T., *"Selection of Filter Pack and Slot Size"*, **Water Well Journal**, April 2024, pp. 40–44 — https://johnsonscreens.com/wp-content/uploads/2025/10/Groundwater-and-wells-April-2024.pdf |
| `[INSITU]` | In Situ Site Investigation, *Our CPT Rigs* (fleet specifications) — https://insitusi.com/our-rigs/ |
| `[GW-WLS]` | Ground & Water, *The G&W Guide to… Windowless Sampling* — https://www.groundandwater.co.uk/blogs/the-gw-guide-to-windowless-sampling/ |
| `[VANWALT]` | Van Walt, *Percussion Window Sampling System* — https://www.vanwalt.com/equipment/window-sampling-system/ |
| `[W120-2]` | DVGW-Arbeitsblatt W 120-2 (A), July 2013, *Qualifikationsanforderungen für die Bereiche Bohrtechnik und oberflächennahe Geothermie (Erdwärmesonden)* — https://shop.wvgw.de/leseprobe/508925_lp%20W%20120-2.pdf ; certification scheme https://www.dvgw-cert.com/leistungen/zertifizierung-von-fachunternehmen/brunnenbau-und-geothermie/w-120-2 |
| `[NPRO]` | nPro Energy, *Sizing of geothermal borehole fields* — https://www.npro.energy/main/en/help/geothermal-borehole-calculation |
| `[EA-GSHC]` | Environment Agency, *Environmental good practice guide for ground source heating and cooling* — https://pdf4pro.com/file/4ab65/pdf_EA_GSHC_Good_Practice_Guide.pdf.pdf |
| `[LUGEON]` | https://en.wikipedia.org/wiki/Lugeon ; procedure at https://www.geotech.hr/en/permeability-test-lugeon-test/ ; unit conversion at https://www.zerdly.com/tools/rock-mass-permeability-estimator/ |
| `[VANE]` | https://en.wikipedia.org/wiki/Shear_vane_test |
| `[SAL-1]` | Indeed UK, *Driller salary in United Kingdom* — https://uk.indeed.com/career/driller/salaries |
| `[SAL-2]` | Glassdoor UK, *Driller salary* — https://www.glassdoor.co.uk/Salaries/driller-salary-SRCH_KO0,7.htm |
| `[SAL-3]` | SalaryExpert, *Rotary Driller Salary in United Kingdom* — https://www.salaryexpert.com/salary/job/rotary-driller/united-kingdom |
| `[SAL-4]` | Jooble UK, *Geotechnical driller salary* — https://uk.jooble.org/salary/geotechnical-driller |

---

# 0. The error in the current data, and the correction

## 0.1 What is wrong, exactly

`src/game/data.js` currently ships two items in the **`bit`** slot:

| line | id | slot | stats |
|---|---|---|---|
| 1365–1369 | `spt-split-spoon` — "SPT Split-Spoon Sampler, 51 mm" | `slot: 'bit'` | `ropMult: 1.0, wearRate: 1.1, maxUCS: 8, life: 320` |
| 1370–1374 | `cpt-cone-piezo` — "Piezocone CPTu Assembly" | `slot: 'bit'` | `ropMult: 1.0, wearRate: 0.85, maxUCS: 5, life: 0` |

`SLOTS[0]` in the same file defines `bit` as *"Bit / Crown — The cutting face.
Everything else exists to feed it."* Both items also carry `maxUCS`, the
rock-strength ceiling that only a cutting tool has.

Neither of these things cuts. Neither is a bit.

- The **split-spoon** is a *sampler* that is **driven** by a falling weight. Its
  penetration resistance **is the measurement**; the soil it recovers is a
  by-product graded as a disturbed, low-quality sample `[GE-2009]`.
- The **piezocone** is a *sensor* that is **pushed** at a constant rate. There is
  no rotation, no percussion, no flush, no cuttings and no hole left behind
  worth the name `[D5778]`.

The `cpt` and `sptSamplers` **categories are already correct** — both point at
`D → Site Investigation & Testing` (lines 158–159), which matches
`DOMAIN.md` §3 group D. The taxonomy is right; the slot and the stats are wrong.

## 0.2 The correction, in the shape the codebase already uses

`DESIGN_EXPANSION.md` §4 says the fix is a **rule**, not a row edit. The rule
these two items need is a new axis alongside `threadFamily` and drive type:

**`advanceMode`** — how the tool gets to depth. Proposed values:

| `advanceMode` | Meaning | Members |
|---|---|---|
| `rotary` | cut by rotation | button bits, tricones, PDC, core bits, augers, drag bits |
| `percussive` | cut by impact + indexing rotation | DTH bits, top-hammer bits |
| `driven` | **hammered in whole**, not cut | SPT split-spoon, drive/liner samplers, window/windowless tubes, dynamic-probe cones, cable-tool chisel |
| `pushed` | **jacked in at constant rate**, not cut | CPT/CPTu/SCPT cones, Shelby tubes, piston samplers |
| `resonant` | advanced by axial resonance | sonic core barrel and override casing |

Then:

1. Move `spt-split-spoon` and `cpt-cone-piezo` out of `slot: 'bit'`. Two new
   slots are needed because they are genuinely different bays on the rig:
   - **`sampler`** — "Sampler / Drive Tube. Recovers ground; does not cut it."
   - **`probe`** — "In-situ Probe. Measures ground; makes no hole."
2. Delete `maxUCS` from both. A split-spoon does not have a rock-strength
   ceiling — it has a **refusal** condition, which is a different thing and is
   defined by standard (§A.1.4).
3. `validateData()` gains one assertion: *an item in the `bit` slot must have
   `advanceMode` of `rotary`, `percussive` or `resonant`.* That single line
   makes the class of error impossible to reintroduce.
4. The SPT trip hammer (`spt-hammer-auto`, line 1360) is already in the
   `workshop` slot; it should move to a first-class **`drive`** slot, because in
   a real SPT the hammer *is* the instrument and its energy ratio is the single
   biggest control on the number the game reports (§A.1.5).

Everything below is the evidence for those five sentences, plus the rest of the
brief.

---

# A. Site investigation — the methods, precisely

## A.1 SPT — the Standard Penetration Test

### A.1.1 What it is

A thick-walled split-barrel sampler is **driven** into the base of a borehole by
a **63.5 kg (140 lb)** hammer falling **760 mm (30 in)** in free fall. The number
of blows is the test. `[D1586]` `[WIKI-SPT]`

`[D1586]`'s own scope wording: the sampler is driven with a 140 lb [63.5 kg]
hammer dropped 30 in. [750 mm], and the N value is the blow count over the
0.5–1.5 ft [0.15–0.45 m] portion of a 1.5 ft [0.45 m] drive.

ISO 22476-3 states the hammer as **63.5 ± 0.5 kg** and the drop as
**760 ± 10 mm** `[WIKI-SPT]`. The ~10 mm difference between the ASTM "750 mm"
and the ISO "760 mm" is a rounding of 30 inches, not a disagreement — worth
knowing so the game does not present it as a controversy.

### A.1.2 The sampler

- Outside diameter **50.8 mm (2 in)**, recovering a **34.9 mm (1 3/8 in)**
  diameter sample `[SPT-NOTES]` `[WIKI-SPT]` (Wikipedia gives OD 5.01 cm,
  ID 3.5 cm).
- Area ratio of an SPT sampler is about **110 %** — against a Shelby tube's
  ~13.7 %, and an "undisturbed" threshold of **≤ 10 %** `[SPT-NOTES]`.
  Area ratio `Ar (%) = (Do² − Di²)/Di² × 100` `[SPT-NOTES]`.
- Consequence, and this is the line the game should teach: **every split-spoon
  sample is a disturbed sample.** `[SPT-NOTES]` says all split-spoon samplers
  should be regarded as disturbed; `[GE-2009]` files the SPT sample (`S-SPT`,
  35 mm × 450 mm) as **sampling category B, quality class 4** — good for
  classification and water content, useless for strength or stiffness.

The game's existing item name "SPT Split-Spoon Sampler, 51 mm" is correct
(50.8 mm rounds to 51). Only its slot is wrong.

### A.1.3 The drive, increment by increment

Total drive **450 mm**, in two parts:

| Part | Length | Counted? |
|---|---|---|
| Seating drive | 150 mm | **discarded** — it is fall-in and disturbed base material `[SPT-NOTES]` |
| Test drive | 300 mm | **this is N** |

- **ASTM practice** records blows per **150 mm** increment, three of them; N is
  the sum of the second and third `[D1586]` `[WIKI-SPT]`.
- **BS / EN ISO 22476-3 practice** records blows per **75 mm**: two increments
  for the seating drive, four for the test drive — six numbers on the log, of
  which the last four sum to N `[GE-2009]`-adjacent UK practice, confirmed in
  ISO 22476-3 procedure summaries.

**This six-number log line is the SPT minigame.** See §G.2.

### A.1.4 Refusal — not "maxUCS"

The test stops (refusal) when any of these occurs `[WIKI-SPT]`:

1. 50 blows applied in any one 150 mm increment;
2. 100 blows total over the 450 mm drive;
3. no observed advance of the sampler in 10 successive blows.

A refused test is reported as blows/penetration (e.g. `50/25 mm`), never as a
made-up N. That is a *result*, not a failure — the game must pay for it.

### A.1.5 Corrections — why the raw number is not the number

Raw N is procedure-dependent. The industry standard is **N60**, normalised to
60 % rod energy ratio, because the original Mohr hammer transferred about 60 %
of theoretical energy `[SPT-NOTES]`:

```
N60 = Em · CB · CS · CR · N / 0.60          (Skempton 1986, via [SPT-NOTES])
```

and for sands, normalised further to 100 kPa effective overburden:

```
(N1)60 = N60 · sqrt(2000 psf / σ'v)         (Liao & Whitman 1986, via [SPT-NOTES])
CN = sqrt(Pa / σ'v0), capped at 2.0          [SPT-CORR]
```

Correction factors `[SPT-CORR]`:

| Factor | Case | Value |
|---|---|---|
| **Ce = Er/60** — energy | Donut hammer | Er 30–60 % → Ce 0.50–1.00 |
| | Safety hammer | Er 55–70 % → Ce 0.92–1.17 |
| | **Automatic trip hammer** | Er 80–100 % → Ce 1.33–1.67 |
| | Hydraulic hammer | Er 80–95 % → Ce 1.33–1.58 |
| **CR** — rod length | < 3 m | 0.75 |
| | 3–4 m | 0.80 |
| | 4–6 m | 0.85 |
| | 6–10 m | 0.95 |
| | > 10 m | 1.00 |
| **CB** — borehole diameter | 65–115 mm (standard) | 1.00 |
| | 150 mm | 1.05 |
| | 200 mm | 1.15 |
| **CS** — sampler | Standard, no liner | 1.00 |
| | Designed for liner, used without | 1.10–1.30 |

Read that table as a **game systems table**, because it is one: the automatic
trip hammer the player can buy does not make them drill faster — it makes their
*data defensible*, and it is the reason the existing item description in
`data.js` line 1364 ("released automatically so the energy ratio is
repeatable") is already correct and should be kept.

Note the trap the correction table sets, and keep it: **CR < 1.0 in the top
6 metres.** The shallowest tests — the ones a foundation actually sits on — are
the least reliable.

### A.1.6 What N means

Relative density of coarse-grained soil from N `[WIKI-SPT]`:

| N | Relative density |
|---|---|
| 0–4 | Very loose |
| 4–10 | Loose |
| 10–30 | Medium |
| 30–50 | Dense |
| > 50 | Very dense |

### A.1.7 Test interval

SPTs are run at intervals down a borehole, alternating with sampling, rather
than continuously. In UK cable-percussion practice the interval is typically
every 1.0–1.5 m in the upper part of the hole and at every change of stratum —
`UNVERIFIED` as a *standardised* figure; the specification, not the standard,
sets it on real jobs. Do not present a specific interval as a rule.

---

## A.2 CPT / CPTu — the Cone Penetration Test

### A.2.1 What it is

A cone on the end of a string of rods is **pushed** into the ground at a
constant **20 mm/s**. Three things are measured continuously: the force on the
tip, the shear on a sleeve behind it, and the water pressure at the shoulder.
There is **no drilling**. `[D5778]`

`[D5778]` §5.3 is blunt about the trade: this method tests the soil in situ and
**no soil samples are obtained**. That is the whole bargain of CPT — continuous,
repeatable, fast, and you never see the ground.

### A.2.2 Geometry

| Item | Value | Source |
|---|---|---|
| Standard cone projected area | **10 cm²** | `[D5778]` |
| Cone diameter | **35.7 mm** (max 36.1 mm worn) | `[D5778]` |
| Apex angle | **60°** | `[D5778]` |
| Larger cone | **15 cm²**, **43.7 mm** (max 44.2 mm) | `[D5778]` `[WIKI-CPT]` |
| Friction sleeve area (10 cm² cone) | **150 cm² ± 2 %** | `[D5778]` |
| Friction sleeve area (15 cm² cone) | **225 cm² ± 2 %** (min 200 cm² if proven equivalent) | `[D5778]` |
| Gap between cone extension and adjacent elements | **≤ 5 mm** | `[D5778]` |
| Push rods | typically **44.5 mm OD** | `[D5778]` |
| Smaller research cones | 5 cm² field, 1 cm² laboratory | `[D5778]` |

Smaller cones resolve thinner layers than larger ones `[D5778]` — a real,
modellable trade-off (see §G.3).

### A.2.3 Rate, and why it is sacred

**20 ± 5 mm/s**, held for the entire stroke while readings are taken `[D5778]`
§12.1.2. Readings at penetration-length intervals of **no more than 50 mm**;
better resolution at 20 mm or 10 mm `[D5778]` §4.4.

`[D5778]` Note 9 records the one legitimate deviation: the operator slows down
when the data imply a precarious situation — a sudden dramatic rise in tip
resistance, bending, or inclination — and **must report it**. That is the
CPT operator's entire judgement call, and it is the mechanic in §G.3.

### A.2.4 What is measured

| Symbol | Name | Definition |
|---|---|---|
| `qc` | cone resistance | vertical force on the tip ÷ cone base area `[D5778]` |
| `fs` | sleeve friction | shear force on the sleeve ÷ sleeve surface area `[D5778]` |
| `u1` | pore pressure, **midface/tip** | filter on the face of the cone `[D5778]` |
| `u2` | pore pressure, **shoulder** | filter in the cylindrical extension behind the tip — **the standard location** `[D5778]` |
| `u3` | pore pressure, **behind the sleeve** | `[D5778]` |
| `Rf` | friction ratio | `Rf = (fs/qc) × 100` %, `fs` and `qc` both in kPa `[D5778]` eq. 4 |
| `qt` | corrected total cone resistance | `qt = qc + u2(1 − an)` where `an` is the **net area ratio** of the cone `[D5778]` eq. 2 |
| `Bq` | pore pressure ratio | excess `u2` ÷ (`qt` − total vertical overburden stress) `[D5778]` |

The `qt` correction exists because water pressure acts on the annulus behind the
cone tip. It matters in soft fine-grained soils; where `qc` > about 1 MPa the
difference between `qc` and `qt` is small `[ROB-SBT]`.

Type 2 (`u2`) piezocones are preferred precisely because only `u2` allows the
`qt` correction `[D5778]`. Type 1 (`u1`) cones read dissipation, compressibility
and thin layers better — especially in fissured soils — but wear and damage
faster `[D5778]` §7.8.1.

Transducer accuracy required: **±100 kPa or 5 % of reading**, whichever is
larger; for the sleeve transducer, **±15 kPa or 15 %**; for pore pressure,
**±25 kPa or 3 %** `[D5778]` §7.7.1, §7.8.4.

### A.2.5 Soil behaviour type — what the trace is *for*

Robertson's charts classify **soil behaviour**, not grain size. `[ROB-SBT]` is
explicit: the cone responds to in-situ mechanical behaviour, not to
classification criteria based on grain size and plasticity measured on
disturbed samples. A soil that a lab calls "silty sand" can plot as clay if its
fines are plastic.

The unified 9 SBTn zones `[ROB-SBT]` `[SETTLE3]`:

| Zone | Soil Behaviour Type |
|---|---|
| 1 | Sensitive fine-grained |
| 2 | Clay — organic soil |
| 3 | Clays: clay to silty clay |
| 4 | Silt mixtures: clayey silt & silty clay |
| 5 | Sand mixtures: silty sand to sandy silt |
| 6 | Sands: clean sands to silty sands |
| 7 | Dense sand to gravelly sand |
| 8 | Stiff sand to clayey sand* |
| 9 | Stiff fine-grained* |

\* overconsolidated or cemented `[ROB-SBT]`

Indices:

```
Non-normalised (usable live, during the push):
ISBT = [ (3.47 − log(qc/pa))² + (log Rf + 1.22)² ]^0.5      pa = 100 kPa   [ROB-SBT]

Normalised (needs unit weight and water table, so: after the push):
Ic   = [ (3.47 − log Qtn)²      + (log Fr + 1.22)² ]^0.5                   [SBT-IC]
Qtn  = [(qt − σv0)/Pa] · (Pa/σ'v0)^n                                       [SBT-IC]
Fr   = [fs/(qt − σv0)] × 100 %                                             [SBT-IC]
```

Ic bands `[SBT-IC]`:

| Ic | Interpretation |
|---|---|
| < 1.31 | Gravelly sand to dense sand (zones 7–8) |
| 1.31–2.05 | Clean sand (zone 6) |
| 2.05–2.60 | Silty sand to sandy silt (zones 4–5) |
| 2.60–2.95 | Silty clay to clay (zone 3) |
| > 2.95 | Clay to organic soil (zones 2–3) |

Indicative normalised values `[SBT-IC]`: zone 3 clay `Qtn < 70`, `Fr 3–8 %`;
zone 6 clean sand `Qtn 70–350`, `Fr 0.4–1.0 %`; zone 7 dense sand `Qtn > 350`,
`Fr < 0.4 %`.

`[ROB-SBT]` notes the normalised and non-normalised charts agree closely when
effective vertical stress is between 50 and 150 kPa — i.e. in the first ~10 m,
the live chart is as good as the processed one. That is a gift to a real-time
game: **the player can be given the live SBT colour bar honestly.**

`UNVERIFIED`: absolute `qc` bands per soil type (e.g. "soft clay 0.2–1 MPa").
Widely quoted but I could not source a set from an authority within budget. Use
the normalised `Qtn`/`Fr`/`Ic` values above instead — they are sourced.

### A.2.6 Dissipation tests

Stop the push, unload the rods, and watch pore pressure decay to the
equilibrium value `u0` `[D5778]` §4, §12.3.5. Practice: with `u2` or `u3`
filters, release the rod force; with a `u1` filter, **maintain** the force.
Run until equilibrium or until 50 % of the initial excess has dissipated
`[D5778]` §12.3.5.

Time scale is the point: in sand, equilibrium in **seconds to minutes**; in high
plasticity clay it can take **many hours** `[D5778]`. That is a real scheduling
decision on a real job — and a real one for the player.

### A.2.7 Seismic CPT (SCPT)

A geophone or accelerometer is built into the cone. A shear wave is generated at
surface and the travel time to the cone gives **shear-wave velocity Vs**, hence
small-strain shear modulus and Poisson's ratio; used in liquefaction assessment
`[WIKI-CPT]`. Referenced test method is ASTM D7400 `[D5778]` §1.4.

Crucially for the game loop: these extra sensors are read **during pauses in the
push, often at the 1 m rod breaks** `[D5778]` §7.8.7-adjacent. So SCPT is
literally the CPT push *plus a beat at every rod change* — which is exactly
where the existing "rod add" timing mechanic (`GAMEDESIGN.md` §3) already lives.

`[D5778]` also strongly recommends an **inclinometer** in the cone: it warns of
damaging situations and gives a verticality/depth reliability check `[D5778]`
§1.4, §7.9.

### A.2.8 Reaction — where the push force comes from

Full-capacity CPT soundings usually need **100 to 200 kN** of thrust `[D5778]`
Note 6. The thrust machine must be **anchored or ballasted, or both**, so that
it does not move relative to the ground during the push `[D5778]` §12.1.1.
High-mass ballasted vehicles can deform the ground surface and change the
near-surface readings — and that must be reported `[D5778]` Note 6.

Real fleet numbers `[INSITU]` — note how mass tracks thrust almost 1:1:

| Configuration | Mass | Thrust | Reaction | Typical depth |
|---|---|---|---|---|
| 6×6 wheeled truck | 20–22 t | 20 t (~200 kN) | dead weight | 30–40 m |
| Tracked, low bearing pressure | 20 t | 20 t | dead weight | 30–40 m |
| Mini tracked | 3.5 t | 20 t | **4 hydraulically driven screw anchors** | 10–30 m |
| Restricted-access rubber-tracked | 1.5 t | 16 t | anchors | 30–40 m |
| Excavator-mounted pusher | 2.5 t + host machine | 20 t | host machine | 20–30 m |
| Hand-portable pusher | 30–35 kg | 10 t | anchors / structure | 10–20 m |

**Model this.** A 3.5 t machine that pushes 20 t is not carrying the reaction —
it is screwing itself to the planet. That is a distinct, animatable, entirely
real silhouette (§E.3).

---

## A.3 Dynamic probing — DPL / DPM / DPH / DPSH

A 90° cone on rods is driven continuously by a falling hammer and the blows per
fixed penetration are logged. No sample, no borehole, no flush: the cheapest
depth-to-resistance profile there is. German: **Rammsondierung** `[22476-2]`.

**EN ISO 22476-2:2005 Table 1** `[22476-2]`:

| | DPL (light) | DPM (medium) | DPH (heavy) | DPSH-A | DPSH-B |
|---|---|---|---|---|---|
| Hammer mass (kg) | 10 ± 0.1 | 30 ± 0.3 | 50 ± 0.5 | 63.5 ± 0.5 | 63.5 ± 0.5 |
| Height of fall (mm) | 500 ± 10 | 500 ± 10 | 500 ± 10 | 500 ± 10 | **750 ± 20** |
| Anvil mass max (kg) | 6 | 18 | 18 | 18 | 30 |
| Cone nominal base area (cm²) | 10 | 15 | 15 | 16 | 20 |
| Cone base diameter, new (mm) | 35.7 ± 0.3 | 43.7 ± 0.3 | 43.7 ± 0.3 | 45.0 ± 0.3 | 50.5 ± 0.5 |
| Cone base diameter, worn min (mm) | 34 | 42 | 42 | 43 | 49 |
| Mantle length L (mm) | 35.7 ± 1 | 43.7 ± 1 | 43.7 ± 1 | **90.0 ± 2** | 51 ± 2 |
| Cone tip length (mm) | 17.9 ± 0.1 | 21.9 ± 0.1 | 21.9 ± 0.1 | 22.5 ± 0.1 | 25.3 ± 0.4 |
| Tip max permissible wear (mm) | 3 | 4 | 4 | 5 | 5 |
| Drive rod mass max (kg/m) | 3 | 6 | 6 | 6 | 8 |
| Drive rod OD max (mm) | 22 | 32 | 32 | 32 | 35 |
| **Specific work per blow, mgh/A (kJ/m²)** | **50** | **100** | **167** | **194** | **238** |

Procedure `[22476-2]`:

- Cone apex angle **90°** for all classes. Cones may be **retained (fixed)** or
  **disposable (lost)** — a real, cheap consumable decision.
- Blows recorded every **100 mm** for DPL/DPM/DPH (`N10`), every **100 or
  200 mm** for DPSH (`N10` or `N20`).
- Normal operating range: `N10` **3–50**; `N20` **5–100**.
- Stop if blows exceed **twice** the maximum, or if the maximum is exceeded
  continuously for **1 m**.
- During heavy driving, **rotate the rods 1½ turns every 50 blows** to keep the
  joints tight.
- **Torque must be measured** — a wrench reading at least 200 Nm, graduated in
  5 Nm steps. Torque tells you how much of your blow count is rod friction
  rather than tip resistance.
- Rod straightness: deflection at mid-point ≤ **1 in 1000** (1 mm/m). Rod
  deviation limits 0.1 % over the lowermost 5 m, 0.2 % on the remainder.
- Mud or water may be **injected through hollow rods near the cone** to cut skin
  friction; casing may be used for the same purpose.
- Hollow rods **should** be used.

**The DP mechanic writes itself:** two competing numbers on screen, `N10` and
torque. If torque climbs while `N10` climbs, you are measuring your own rods,
not the ground — inject, or the log is worthless. See §G.4.

`UNVERIFIED` in this pass, worth a follow-up: the Nordic soundings
(Swedish *viktsondering*/weight sounding, *Jb-totalsondering*, *hejarsondering*)
and their relationship to DP classes. They matter for a Nordic-set game but I
could not source their parameters within budget. Do not invent them.

---

## A.4 Sampling quality — the axis the game is missing

This is the most important idea in the whole pack, because it is the **score**
(§G.5). Under EN 1997-2 / EN ISO 22475-1, samples are graded by **quality class
1–5**, and equipment by **sampling category A/B/C**. What you can determine
depends on the class `[GE-2009]` (Table 1, reproduced from EC7-2):

| Property determinable | Class 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **Unchanged** soil properties | ● | ● | ● | ● | |
| — particle size | ● | ● | ● | | |
| — water content | ● | ● | | | |
| — density, density index, permeability | ● | ● | | | |
| — compressibility, shear strength | ● | | | | |
| Sequence of layers | ● | ● | ● | ● | ● |
| Boundaries of strata — broad | ● | ● | ● | ● | |
| Boundaries of layers — fine | ● | ● | | | |
| Atterberg limits, particle density, organic content | ● | ● | ● | ● | |

Mapping to category: **class 1 and 2 require sampling category A**; classes
3–4 are achievable with B; class 5 with C `[GE-2009]`.

The hard consequence, stated plainly by `[GE-2009]`: **if you want strength or
stiffness, you need a class 1 sample.** Nothing else will do, and this is not
new — the same requirement is in BS 5930.

### A.4.1 Thin wall vs thick wall

`[22475-1]` definition of a **thin-wall sampler** `[GE-2009]`:

- edge taper angle **≤ 5°**
- **area ratio < 15 %**
- **inside clearance ratio < 0.5 %**

Anything not meeting all three is thick-walled by implication — including the
UK's ubiquitous **U100** `[GE-2009]`.

BS 5930 presupposes a U100 area ratio not exceeding **30 %** (its predecessor
CP 2001, 1957, required 25 %); `[GE-2009]` reports that U100 samplers on the
market **with a liner can have area ratios approaching 50 %**, and that those
without a liner barely meet the BS 5930 criterion.

`[GE-2009]`'s verdict on the U100 is worth quoting to the player almost
verbatim in spirit: without modification it can only give a **class 2** sample,
which has implications for laboratory testing. And: it appears almost
inconceivable that a tube sampler incorporating a plastic liner would remotely
approach class 1.

Shelby tube for comparison `[SPT-NOTES]`: internal diameter 2.0 in, wall 16
gauge (0.0578 in) to 18 gauge (0.0451 in), a 36 in tube advanced to recover a
33 in sample, area ratio about **13.7 %**.

### A.4.2 The method → class table

Consolidated from `[GE-2009]` Tables 2 and 3 (their UK-relevant subset of
`[22475-1]`). Values in brackets are achievable **only in particularly
favourable ground**.

| Technique | Hole/sample dia | Achievable category | Achievable class |
|---|---|---|---|
| Rotary **triple-tube** core barrel | 100–200 mm | **A** | **1** |
| Rotary double-tube core barrel | 100–200 mm | B (A) | 3 (1–2) |
| Rotary single-tube core barrel | 100–200 mm | B (A) | 4 (2–3) |
| Hollow-stem auger (sample off the flights) | 100–300 mm | C (B) | 4 (3) |
| **Thin-walled open tube** (OS-T/W) | 70–120 mm, 250–1000 mm long | A (soft/firm cohesive) | **1** |
| Thin-walled open tube in stiff clay | | B (A) | 3 (2) |
| **Thin-walled piston** (PS-T/W) | 50–300 mm, 600–1000 mm long | **A** | **1** |
| Thick-walled open tube (**U100**, OS-TK/W) | > 100 mm | B | **2** at best |
| **SPT split spoon** (S-SPT) | 35 mm × 450 mm | **B** | **4** |
| **Windowless** sampler | 30–100 mm, 1000–2000 mm long | B | 4 (3) |
| Cable percussion with **shell** | 150–300 mm | B | 4 |
| Cable percussion with **clay cutter** | 150–300 mm | B | 4 (3) |
| Percussive drilling (incl. window sampling, open mode) | 30–150 mm | B | 4 (3) |
| **Resonance (sonic) drilling** — cohesive | 80–200 mm | C | 4 |
| Resonance (sonic) drilling — non-cohesive | 80–200 mm | (C) | 5 |
| Block sampling from trial pit | — | A | 1 |

Two entries in that table deserve the player's attention because they are
counter-intuitive:

1. **The SPT sample is class 4.** The most famous test in geotechnics returns
   one of the worst samples on the list. It is a *test*, and its sample is
   change from the transaction.
2. **Sonic is not automatically a quality win.** `[GE-2009]`'s remarks on
   resonance drilling are pointed: UK trials indicated samples exhibiting
   significant disturbance with margins dried by the heat generated during
   drilling. That does **not** contradict §A.6 — sonic recovers *continuously
   and completely*, which is a different virtue from being *undisturbed*. The
   game should carry both facts, because a real geologist would.

`[GE-2009]` also flags that specifying **hand vane tests on window samples is
an unacceptable practice** — you cannot get strength from a class 4/5 sample.
That is exactly the kind of specific, checkable, "a driller would nod at this"
line `FACTS_VERIFIED.md` is for.

### A.4.3 Where the UK is heading

`[GE-2009]`'s recommended replacements for the U100 where strength and
compressibility testing is required:

- thin-wall (including piston) tube samplers in low-strength cohesive deposits;
- **rotary core drilling** in firm to hard cohesive deposits — already normal
  on prestige projects in London Clay and comparable formations;
- more **in-situ testing** (CPT, pressuremeter) instead of lab testing on
  compromised samples.

That is a progression path: the player starts with cable percussion + U100,
and buys their way into thin-wall piston sampling and rotary coring as the
contracts get fussier about class.

---

## A.5 Window and windowless sampling

The small end of the industry, and the one that fits down an alleyway.

**Window sampling**: a steel tube with a longitudinal slot ("window") cut in it,
driven percussively, from which the soil is inspected and dug out.
**Windowless**: a fully enclosed tube with a plastic liner and a one-way valve
at the shoe, so the core comes up sealed `[GW-WLS]`.

| Parameter | Value | Source |
|---|---|---|
| Tube diameters | **40–80 mm** | `[VANWALT]` |
| Tube lengths | 0.5 m and 1.0 m | `[VANWALT]` |
| Max sample depth | ~**10 m**, soil-dependent | `[VANWALT]` |
| Depth in gravel/rock | **2–4 m** depending on density | `[GW-WLS]` |
| Depth in clay | **8–12 m** depending on strength | `[GW-WLS]` |
| Drive | percussion hammer (petrol 2-stroke or electric on hand systems) | `[VANWALT]` |
| Extraction | manual or hydraulic | `[VANWALT]` |
| Production | **15–20 m of drilling per day** | `[GW-WLS]` |

The depth limit is **not** the drive — it is the pull. `[GW-WLS]` states it
precisely: depth is limited by the weight of the rig combined with the
suction/friction on the rods and sampling tube when trying to recover them.
**That is a mechanic, not a footnote** (§G.4).

Tubes telescope: the first drive at the largest diameter, then a smaller tube
inside the hole it made, and so on — each reduction buys depth and costs
diameter. `[VANWALT]`'s 40–80 mm range brackets the sequence; the specific
step sizes are `UNVERIFIED`.

Windowless rigs can also run **SPTs and DPSH down the borehole** `[GW-WLS]`,
which is why the same crew does all three.

---

## A.6 Sonic — how the resonance actually works

### A.6.1 The physics

A hydraulically driven head contains **counter-rotating eccentric masses** whose
imbalance produces a **high-frequency sinusoidal force along the axis of the
drill pipe** `[SONIC-BR]`. When the drive frequency matches the string's axial
resonance, a **standing wave** is established in the pipe — `[SONIC-BR]`'s
diagram labels a 3rd-harmonic standing wave in the drill pipe.

The fundamental axial resonance of a length of rod `[SONIC-SI]` eq. 1:

```
f = c / (2 l)

f = resonance frequency (Hz)
c = speed of sound in the rod material (m/s)
l = length of the drill rods (m)
```

**Read what that equation does to the game.** As the hole gets deeper, `l` grows
and `f` falls. `[SONIC-SI]`: with the extension of the rods it is necessary to
decrease the frequency to maintain resonance, and if you do not, the force the
head generates at the same frequency is reduced — the rods are no longer in
resonance. With depth you must add **multiples of the fundamental frequency** to
keep wave crests near the top or bottom of the string.

**Sonic is a tuning game, and the tuning target moves down with every rod.**
This is the single best mechanic in this entire pack (§G.6).

### A.6.2 What it does to the ground

The vibration causes a thin layer of soil particles around the string and bit to
lose their structure and behave more like a fluid powder or paste than a rigid
mass — the brochure calls this **liquefaction**, and it is what removes friction
from the string `[SONIC-BR]`. The vertical motion also stops soil sticking to
the string, moving **up to 150 times per second** `[SONIC-BR]`.

At the bit, `[SONIC-SI]` is precise and worth carrying into the game: the bit
**does not cut**. It pulsates against the material, which then either crumbles
(rock) or is pushed aside (soil). Consequently the bit's shape, insert
distribution, matrix and flushing channels have **no decisive influence** on
progress — optimisation is mainly about the durability of the bit material.
What governs rate is the **efficiency of energy transfer from head to bit**.

Rotation is slow and exists only to stop the bit hitting the same spot: normally
up to about **150 rpm**; if the rods do not rotate, the teeth keep striking the
same place and progress falls `[SONIC-SI]`.

Over-feeding has a specific, named failure: excessive load means the bit can no
longer move against the material, forming a "knot" at the bit, reducing
progress, and risking **fracturing the drill rods** through vibration
`[SONIC-SI]`. That is the sonic equivalent of stalling a DTH hammer, and it is
already the shape of the game's feed slider.

### A.6.3 The three-phase cycle

`[SONIC-SI]` gives the working cycle, repeated to depth:

1. **Phase I** — core drilling: the core barrel is advanced into the soil and
   fills.
2. **Phase II** — the **override casing** is drilled down around the core
   barrel, securing the hole.
3. **Phase III** — the core barrel is removed from the hole and the core
   extracted from the barrel.

Phase II exists because the open hole is unstable during the barrel-extraction
manoeuvre and would collapse. In competent rock with no collapse risk, the
operation simplifies to drilling with the core barrel alone `[SONIC-SI]`.

**The game already owns the parts**: `data.js` lines 1188–1200 ship a sonic core
barrel, sonic override casing and sonic carbide drive shoe. The cycle above is
the missing *sequence*.

### A.6.4 Flush

In most materials the high-frequency method **needs no flushing water at all**;
where debris removal requires it, plain water is usually enough, and consumption
is lower than in conventional rotary core drilling `[SONIC-SI]`. `[SONIC-BR]`
agrees: in certain materials liquefaction reduces or entirely removes the need
to inject air or water.

**Sonic is the one method where the Flush slider can legitimately sit at zero.**

### A.6.5 Head specifications, for orders of magnitude only

Never ship these designations. They set the envelope.

| Head class | Max frequency | Max vibration force | Rotation | Torque |
|---|---|---|---|---|
| Small (hydraulic motor driven) | 4,000 cpm (**67 Hz**) | **38 kN** | 0–159 rpm | 3.395 kN·m at 20.6 MPa |
| Medium | 4,000 cpm (67 Hz) | **65 kN** | 0–36 / 0–62 rpm | 4.2 / 2.1 kN·m |
| Large | 4,000 cpm (67 Hz) | **78.4 kN** | 0–27 / 0–54 rpm | 5.4 / 2.7 kN·m |
| High-frequency oscillator | **150 Hz** | **222 kN** | 160 rpm standard | 5,250 ft·lbf fwd / 7,000 ft·lbf rev |
| High-frequency oscillator (2) | **133 Hz** | 222 kN | 160 rpm | as above |

Source `[SONIC-BR]`. **Unit error in the source, flagged:** the brochure prints
the oscillator torques as "7110 kn-m" and "9,480 kn-m". 5,250 ft·lbf is
**≈ 7.1 kN·m** and 7,000 ft·lbf is **≈ 9.5 kN·m** — the brochure has swapped
kN·m for what should be N·m, or dropped a decade. Use **7.1 / 9.5 kN·m**. A
head that produced 7,110 kN·m would be a piece of civil infrastructure.

`[SONIC-SI]` independently reports mechanically induced loads in the range
**22,000 kg to 127,000 kg** (≈ 216–1,246 kN) at frequencies up to **150 Hz** —
so the envelope is 40 kN to a few hundred kN of oscillator force, 60–150 Hz.

Air damper on the medium/large heads operates at **0.7 MPa** with a minimum air
flow of **8 L/min** `[SONIC-BR]`. The damper is what stops the resonance
destroying the rig — worth a visible component on the model.

### A.6.6 How much faster, and how much better

- `[SONIC-SI]`, measured head-to-head on one site (HE Brežice, Slovenia, 2016)
  against conventional rigs in the same silt/clayey gravel/gravel/conglomerate:
  progress **up to four times higher** than classical core drilling, with core
  that was more compact, with **no secondary fragmentation in the corer** and no
  mixing or segregation. Harder layers such as conglomerate were **immediately
  visible** in the sonic core, whereas in the single-tube conventional core they
  could only be found by careful review and their thickness could not be
  determined at all.
- `[SONIC-BR]` reports the manufacturer's claim of **three to five times faster
  than conventional drills, depending on soil conditions**. Treat as a vendor
  claim, and label it as one.
- Counterweight, and ship it too: `[GE-2009]`'s UK trials rated resonance
  drilling at **class 4 (cohesive) / class 5 (non-cohesive)** with significant
  disturbance and heat-dried margins (§A.4.2).

The honest game line: *sonic gets you all of the ground, in order, fast. It does
not get you an undisturbed sample.* That distinction is exactly the sort of
precision `PLATFORM_TRUTH.md` Part C rule 2 demands.

`[SONIC-SI]` also documents the commercial reality worth putting on a contract
card: in 2016 there was **one** sonic rig in the whole of Slovenia, and the
reasons given were the high cost of rig and equipment, modest spare-part
availability, and a thin pipeline of projects needing it.

---

## A.7 The rest of the borehole: installation and testing

### A.7.1 Standpipes, piezometers, monitoring wells

- A **standpipe** is a plain slotted pipe reading the water level in whatever it
  is open to — cheap, robust, slow to respond, and it averages everything it
  intersects.
- A **standpipe piezometer** seals a *response zone* against one stratum with
  bentonite above and below, so the level it reads means something specific.
- A **vibrating-wire piezometer** is a sealed transducer grouted in place,
  reading pore pressure directly with a fast response and no water column to
  purge; several can be grouted into one hole at different depths.

`UNVERIFIED` as written above at the level of specific response times and
grout mixes; the *principle* (seal the response zone or the reading is
meaningless) is the same principle SEPA states for decommissioning — an open
hole short-circuits everything it passes through `[SEPA-DEC]`.

Construction dimensions that **are** sourced are in §B.2.

### A.7.2 Packer permeability / Lugeon testing

Isolate a section of borehole between inflatable packers and inject water at
controlled pressure.

- **1 Lugeon = a water take of 1 litre per minute per metre of test section at
  an overpressure of 1 MPa (10 bar)** `[LUGEON]`.
- Conducted in **five stages**; at each stage a constant pressure is held for
  **10 minutes** `[LUGEON]` (geotech.hr). The classic sequence ramps up then
  back down, so the two limbs can be compared — the shape of the loop tells you
  whether you washed out fines, dilated joints, or hit turbulent flow.
- Rule of thumb conversion: `k ≈ Lu × 1.3 × 10⁻⁷ m/s` `[LUGEON]` (zerdly).
- **Single packer** tests the section from the packer to the base of the hole as
  you drill down; **double packer** isolates a section anywhere in a completed
  hole.

Named for Maurice Lugeon, who developed the method in 1933 `[LUGEON]`.

The BDA audit remit lists **BS EN ISO 22282 — Geohydraulic testing** as one of
the standards a UK driller is audited against `[BDA]`.

### A.7.3 In-situ vane

Measures **undrained shear strength of cohesive soil** directly, by rotating a
cruciform vane and reading the peak torque `[VANE]`.

- Two standard vanes: **150 × 75 mm** for soils up to about 50 kN/m², and
  **100 × 50 mm** for stronger soils `[VANE]` — both **H:D = 2:1**.
- Rotation rate **6–12 degrees per minute** `[VANE]`.
- UK methodology governed by **BS 1377** `[VANE]`.

The peak/remoulded ratio gives **sensitivity**, which is what makes SBT zone 1
("sensitive fine-grained") more than a colour on a chart.

`UNVERIFIED`: the Bjerrum plasticity correction factor μ applied to field vane
`cu` — real and standard practice, but I could not source the curve within
budget. Mention that a correction exists; do not state values.

### A.7.4 Borehole geophysical logging

A wireline tool is lowered down the finished hole. Standard geotechnical /
water-well suite and what each answers:

| Log | Reads | Answers |
|---|---|---|
| Natural gamma | natural radioactivity | clay/shale content — picks aquitards through casing |
| Resistivity / induction | formation resistivity | porosity, water salinity, bed boundaries |
| Caliper | hole diameter vs depth | washouts, breakouts, fracture zones, **how much grout the hole will actually take** |
| Sonic (acoustic velocity) | P-wave (and S-wave) velocity | rock quality, dynamic moduli |
| Optical / acoustic televiewer | oriented image of the wall | dip and strike of every fracture and bedding plane |
| Temperature & fluid conductivity | fluid column profile | where water enters and leaves |
| Flow (impeller / heat-pulse) | vertical flow in the hole | which fracture is producing |

`UNVERIFIED` as a list attributable to a single source page (the BGS logging
page I attempted returned 404). Each individual tool is uncontroversial, but do
not attribute the table. `[WWJ-FP]` independently confirms one specific use:
**a caliper log reveals washouts in the borehole, requiring additional filter
pack** — which is the single most game-relevant logging fact in the pack.

---

# B. Environmental / remediation drilling

## B.1 The one idea underneath all of it

An open or badly sealed borehole is a **pipe between things that were not
connected**. `[SEPA-DEC]` states the consequence directly: improperly abandoned
boreholes and wells may act as preferential pathways for groundwater or
contaminant movement, resulting in contamination of groundwater, mixing of
groundwaters of variable quality from different aquifers, or loss of aquifer
yield and pressure. They may also present a physical hazard.

`[EA-GSHC]` frames the same risk for ground-source schemes: systems installed
through several aquitards (such as clay) and aquifer horizons (limestone,
sandstone, sand/gravel) create the multiple-aquifer problem.

`[NB16]` §2.3 states the drilling-time version of the rule for sedimentary
bedrock: where different aquifers are separated by sealing layers and there is a
risk that two or more are **short-circuited**, seals must be installed in the
borehole, or the borehole backfilled in its entirety.

**Everything in this section is a consequence of that one sentence.** Make it
the mission statement of the environmental method in the game.

## B.2 Monitoring well construction

Bottom-up, the standard anatomy:

```
   ┌── protective cover / flush cover + concrete pad
   │
   ├── grout (cement-bentonite), tremied from the base of the seal upward
   │
   ├── BENTONITE SEAL
   │
   ├── filter pack (clean, well-rounded, chemically inert sand)
   │
   ├── SLOTTED SCREEN  ← the only part open to the ground
   │
   └── sump / sediment trap, then base
```

Sourced dimensions `[OAR]` (Oregon Administrative Rule 690-240-0460):

- Filter pack shall **not extend more than 3 ft (0.9 m) above** the top, or
  **1 ft (0.3 m) below** the bottom, of the screen.
- Filter pack seal: **a minimum 3 ft (0.9 m) thick layer of dry bentonite**, or
  a 2 ft (0.6 m) sand layer if grout is used above.
- Where a grout slurry will be applied, **the bentonite shall be adequately
  hydrated before the annular seal is placed**, to prevent grout infiltrating
  the filter pack.
- Filter pack must be placed so as to ensure placement **opposite the screen
  without bridging or size segregation**.
- Screens must be commercially fabricated, of material not knowingly readily
  reactive with the subsurface environment, with adequate collapse strength.

`[WWJ-FP]` adds the reason the pack is over-length: it **should extend well
above the screen to compensate for settling during development**, and a caliper
log may reveal washouts needing more pack — so keep extra filter pack on site,
especially where hole stability is questionable.

Screen/casing material selection: choose the polymer for the **analyte**, not
for the price. `[EPA-PFAS]` makes the sharpest case — PTFE and other
fluoropolymer tubing, bailers, liners, tape, plumbing paste and pump parts are
**known PFAS-containing materials** and are not to be used on a PFAS
investigation; LDPE and glass containers are listed as having potential to
retain PFAS. HDPE and silicone are the acceptable water-sampling materials
`[EPA-PFAS]` Tables 1a/1b.

`UNVERIFIED`: specific slot sizes for monitoring wells (0.5 mm / 1.0 mm are the
common European sizes) and the flush-threaded/no-solvent-cement rule. Both are
real practice; I could not source them to an authority in this pass. The
*water-well* slot-sizing rules in §C.2 **are** sourced and use the same physics.

## B.3 Decommissioning — the same job in reverse

`[SEPA-DEC]` is the cleanest free source in the pack. Its objectives:

- prevent the borehole acting as a **conduit** for contamination of groundwater;
- prevent **wastage of groundwater** from overflow from artesian boreholes;
- make the ground safe and structurally stable.

Method `[SEPA-DEC]`:

1. Get the construction record first — depth, diameter, completion — from site
   records, the **original driller's log**, the regulator or the geological
   survey. *Only once all available information has been collated can the most
   appropriate course of action be determined.* (Design note: the driller's log
   the player writes in one contract is the artefact a later contract needs.)
2. Ensure the hole is free of obstructions. Examine casing and grout condition;
   where casing has corroded or broken, or grouting has failed, those materials
   may have to be **removed**.
3. Backfill so the hole **mimics the strata it passes through**: permeable
   aggregate (pea gravel, sand) against aquifers, low-permeability material
   (clay, bentonite-cement grout, concrete) against low-permeability horizons.
   Alternatively backfill the entire hole with low-permeability material.
4. Materials must be **clean, inert and non-polluting**. Suitable: pea gravel,
   sand, shingle, concrete, bentonite, cement grout, uncontaminated rock.
   `[SEPA-DEC]` shouts this one in capitals: under no circumstances should
   materials likely to cause pollution be used as infill.
5. Aggregate must be graded and fed **in a controlled manner** so accidental
   **bridging** does not occur. Liquid grouts and concrete must be introduced
   through a **tremie pipe** so voids do not form.
6. In **highly fissured aquifers** (some limestones), liquid grout — especially
   pressure-injected — or fine aggregate can be **transported out of the
   borehole into the aquifer through the fissures**. Use coarser gravel and
   monitor carefully.
7. Very deep or wide holes: place a permanent **bridging seal / plug** (usually
   cement, or a mechanical plug plus cement) and infill above it. The bridging
   seal should ideally sit **below the lowest aquifer horizon**; where that is
   impossible, the open hole beneath it must penetrate **no more than a single
   aquifer unit**. Cement seals must cure before backfilling continues.
8. Chemistry matters: **phenol contamination may prevent bentonite grouts from
   curing** `[SEPA-DEC]`. Your grout can be defeated by the contaminant you came
   to investigate.
9. Within 50 m of a potable abstraction, consider **disinfecting the infill
   materials** — while making sure the disinfectant is not itself a pollution
   risk.
10. Cap: the **top 2 m** (or 2 m below plough depth on agricultural land) filled
    with cement, concrete or bentonite grout, then a **concrete cap at least
    1 m greater in diameter** than the backfilled borehole.
11. Record the depth and position of **each layer**, and the type and quantity
    of every material used.

`[NB16]` gives the Swedish version of the same duty: a well not intended for
future use **should always be backfilled** to avoid future problems; if a
replacement well is drilled, an existing well affected by sewage or salt water
should be backfilled with sealing material so the new well and neighbouring
wells are not affected.

## B.4 Artesian boreholes

`[SEPA-DEC]` defines it: groundwater in a confined aquifer at sufficient
pressure to discharge at the ground surface, or into another overlying aquifer,
**without any pumping**.

Control the flow **first**. Options `[SEPA-DEC]`:

- pump the borehole to produce the necessary drawdown;
- pump nearby boreholes;
- **extend the casing above ground level beyond the potentiometric surface** —
  the elegant one: you out-stack the aquifer;
- introduce dense, non-polluting fluids into the hole;
- introduce a pre-cast plug at an appropriate level;
- set an **inflatable packer** and pressure-grout the void below it.

And the piece of field wisdom that belongs in the game as a seasonal
contract-board effect: decommissioning artesian boreholes is easiest in **late
summer**, when groundwater levels and artesian flows are at their lowest. It is
a specialist job requiring expert advice `[SEPA-DEC]`.

`[NB16]` warns of the drilling-side version — drilling in artesian conditions
can push water out into the soil layers if casing or a diverter hose is not set,
and in frost-susceptible ground this can cause ground damage.

## B.5 Groundwater sampling — low-flow

`[EPA-LF]` is the operational standard. The numbers:

**Pump intake** — located **within the screen interval**, at a depth that stays
submerged. Typically the mid-point (or lowest historical mid-point) of the
saturated screen. Intake depth and pumping rate should be **the same at every
sampling event** — repeatability is the entire point.

**Drawdown** — start slow, increase until discharge, then adjust until there is
little or no drawdown. Target **< 0.3 ft (≈ 0.09 m)**. If the minimum
achievable drawdown exceeds 0.3 ft but is stable, continue. If the initial water
level is above the top of the screen, **do not let it fall into the screen**.

**Never use a constriction on the tubing to reduce flow** — the pressure drop
degasses the water and you lose VOCs and dissolved gases `[EPA-LF]`.

**Stabilisation** — purging is complete when **three consecutive readings** are
within:

| Parameter | Criterion |
|---|---|
| Turbidity | 10 % for values > 5 NTU; three values < 5 NTU count as stable |
| Dissolved oxygen | 10 % for values > 0.5 mg/L; three values < 0.5 mg/L count as stable |
| Specific conductance | 3 % |
| Temperature | 3 % |
| pH | ± 0.1 unit |
| ORP | ± 10 mV |

`[EPA-LF]`

**Monitoring frequency** — every five minutes or greater, and the flow rate must
turn over at least one flow-through-cell volume between readings (a 250 mL cell
at 50 mL/min = every five minutes; a 500 mL cell = every ten) `[EPA-LF]`.

**Turbidity is measured before the flow-through cell**, on a separate
instrument; everything else is measured in the cell, which must be kept free of
gas bubbles — angling it at 45° with the port upward helps `[EPA-LF]`.

**The two-hour rule** — if after 2 hours of purging the parameters have not
stabilised, you may (a) keep purging, (b) sample anyway and document that
stabilisation could not be achieved, or (c) stop and explain — noting the risk
that the resulting data may not be usable `[EPA-LF]`.

**Low-yield wells** — if recovery is less than **50 mL/min**, or the well is
essentially being dewatered, sample as soon as the level has recovered enough
for the required volume, and record why `[EPA-LF]`.

Field QC referenced by `[EPA-LF]`: **trip blanks** (a pair per cooler containing
VOC samples), duplicates collected in consecutive order per analyte group,
equipment blanks.

## B.6 PFAS-era protocols — what the driller does differently

`[EPA-PFAS]` Tables 1a and 1b. This is the section that genuinely changes the
crew's day.

**Acceptable:**

| Category | Acceptable |
|---|---|
| Water sampling | **HDPE or silicone tubing**; HDPE passive samplers |
| Drilling & soil | **PFAS-free drilling fluids**; **PFAS-free makeup water** (confirmed by lab analysis before the investigation); **acetate liners** for soil sampling |
| Containers | **HDPE containers with HDPE-lined lids**, lab-supplied |
| Ice | ice in double-bagged polyethylene bags |
| Documentation | ball-point pens; standard paper and paper labels; fine/ultra-fine point permanent markers |
| Decontamination | water-only decon with confirmed PFAS-free water; Alconox/Liquinox followed by deionised or PFAS-free rinse; methanol, isopropanol or acetone |

**Not recommended / prohibited:**

| Category | Avoid | Why |
|---|---|---|
| Field equipment | **PTFE / Teflon / any fluoropolymer-coated or -containing equipment** — tubing, bailers, liners, tape, plumbing paste, pump parts | known PFAS-containing |
| Water sampling | passive diffusion bags; LDPE passive samplers; water particle filters | retain PFAS |
| Drilling & soil | **aluminium foil**; **drilling fluid containing PFAS** | retain / contain |
| Containers | **glass containers with lined lids**; LDPE containers and lids; **PTFE-lined lids** | retain / contain |
| Cold chain | reusable chemical or gel ice packs | suspected |
| Documentation | **self-sticking notes**; **waterproof paper, notebooks and labels**; large markers | contain / suspected |
| Decon | some detergents and decon solutions | contain |

**Personal and clothing rules** `[EPA-PFAS]`:

- Wear **pre-laundered clothing washed at least six times**, not stain-resistant
  and not waterproof.
- Footwear that has been treated for waterproofing should be avoided; footwear
  **without waterproofing** should be worn, while still providing physical
  protection.
- Apply sunscreen and insect repellent **before** starting, and if reapplied,
  do so **more than 10 m away** from the sampling area. Only listed products.
- **No blue ice.** Bring deionised or distilled water for the first decon rinse
  and lab-supplied "PFAS-free" water for the final rinse.
- Use dedicated **HDPE plastic sheeting** or another clean surface.

**The driller-specific consequence.** Fluoropolymer thread tape and plumbing
paste are on the prohibited list. So is any drilling fluid containing PFAS, and
any makeup water that has not been lab-confirmed. That means a PFAS job changes
the *consumables the player buys*, not just the procedure they follow — which
is exactly how `PLATFORM_TRUTH.md` Part A wants the iMarket shop to bite.

## B.7 Cross-contamination control — the sequence

Consolidating `[SEPA-DEC]`, `[NB16]` and `[EPA-PFAS]`:

1. **Work clean to dirty.** Site the first holes in the least-contaminated
   areas.
2. **Decontaminate between holes and between depths.** `[EPA-PFAS]` requires
   water-only decon with confirmed-clean water on PFAS jobs; `[EPA-LF]` prefers
   dedicated equipment per well over portable equipment shared between them.
3. **Never drill from contaminated ground into a clean aquifer without sealing
   the upper part first.** `[NB16]` §2.3: install seals or backfill entirely
   where aquifers may be short-circuited. `[NB16]` also notes that at small soil
   depths it is extra important to seal deep into the rock, because the soil
   layers act as a **cleansing filter** — thin soil means less natural
   protection.
4. **Telescope and seal.** Case and seal the contaminated interval, then drill
   on inside that casing at a smaller diameter. `[NB16]`'s baseline sealed
   construction — casing driven ≥ 2 m into solid rock and grouted — is the
   same principle at the soil/rock boundary.
5. **Contain and characterise the arisings.** `[SEPA-DEC]`'s "clean, inert and
   non-polluting" rule for infill implies its converse for spoil.
6. **Grout on the way out.** Tremie from the base upward; never dump
   `[SEPA-DEC]`.

`[NB16]` adds the regulatory reality for a Nordic contract card: in areas of
known or suspected contaminated ground, the supervisory authority may impose a
**permit requirement or an outright ban** on well drilling; within a water
protection area, drilling is normally subject to permit or prohibited.

## B.8 Why sonic dominates environmental work

Pulling §A.6 into this context:

- **Continuous, complete recovery in order** — no gaps in the log, and the
  contaminant boundary is where the core says it is `[SONIC-SI]`.
- **The casing follows the hole**, so the contaminated interval is cased off as
  you go, not after the fact `[SONIC-SI]` phase II.
- **Little or no flush** — so little or no fluid to become
  investigation-derived waste, and no drilling fluid to fail a PFAS blank
  `[SONIC-SI]` `[SONIC-BR]` `[EPA-PFAS]`.
- The applications lists on the sonic heads themselves name it: environmental
  investigation, monitoring well, geological investigation, underground
  geothermal heat exchange hole, water well `[SONIC-BR]`.

Counter-fact to keep (§A.4.2): recovery is not the same as low disturbance
`[GE-2009]`.

`UNVERIFIED`: quantified reduction in investigation-derived waste volume vs
hollow-stem auger. Frequently claimed; not sourced here.

---

# C. Water well and geothermal

## C.1 Methods for a water well

| Method | Where it wins | Where it loses |
|---|---|---|
| **DTH (air)** | hard rock, fast, straight; the default for a bedrock well | needs a big compressor; dust; struggles in loose overburden without casing |
| **DTH (water-powered)** | see §C.5 | needs a high-pressure water supply and clean water |
| **Rotary (mud)** | unconsolidated sand and gravel; keeps the hole open | mud cake can seal the aquifer you came for — development must remove it |
| **Cable-tool** | slow, cheap, unbeatable in boulders and karst; you sample as you go and you *know* when you hit water | very slow |
| **Rotary-percussion / overburden (duplex)** | drives casing through soil and into rock in one operation | more tooling, more cost |
| **Sonic** | listed as a water-well application on real sonic heads `[SONIC-BR]` | rig cost |

`[NB16]` states the Swedish default explicitly: for a bedrock-drilled well,
**compressed-air-driven down-the-hole hammer equipment combining rotation and
percussion** is used in most cases.

## C.2 Well design — the sourced numbers

### C.2.1 Bedrock well, Nordic pattern `[NB16]`

Two steps: (1) drive casing through the soil and into rock; (2) drill open hole
in the rock until enough water is found or the design depth is reached — **that
open hole is the well**.

| Item | Requirement | Source |
|---|---|---|
| Casing (**foderrör**) driven through soil and into solid rock | **≥ 2 m into solid rock** *and* **≥ 6 m total from ground surface** — in practice you cannot case a well with less than 6 m of casing | `[NB16]` |
| Annulus between casing and rock | **sealed, normally by grouting the casing into the rock with cement**; sealing must always be carried out | `[NB16]` |
| Meaning of "sealed" | **drip-tight** (*dropptät*) — no visible leakage into the well; applies to weld joints and to the casing/rock seal | `[NB16]` |
| Casing driving methods | **eccentric bit (excenterkrona) or ring-bit crown (ringborrkrona)** — i.e. `DOMAIN.md`'s eccentric and concentric overburden systems | `[NB16]` |
| Common hole diameters | **115 mm, 140 mm, 165 mm**; coarser occurs | `[NB16]` |
| Steel casing dimensions | **139.7 × ≥5.0 mm**, **168.3 × ≥5.0 mm**, **193.7 × ≥5.0 mm**, steel grade ST 37.0, tolerances to EN 102 or equivalent | `[NB16]` |
| Non-steel casing | permitted if durability is not below the steel requirement — it must withstand the pressures the soil generates at the depths applied | `[NB16]` |
| Water well casing stick-up | terminate **≥ 0.2 m above ground level** where possible | `[NB16]` |
| Chloride monitoring | measure chloride **or** conductivity **every 20 m** and whenever water yield changes; **> 50 mg/L Cl⁻** or **> 50 mS/m** may affect neighbouring wells; record value and level in the well log | `[NB16]` |

**Yields** `[NB16]`: a newly drilled bedrock well in crystalline basement
normally gives **100–1,000 L/h**. If one or more large fracture zones are
intersected the yield can be much greater. In sedimentary bedrock, capacities
over **10,000 L/h** are not unusual. A normal household usually needs only
**50–100 L/h**.

That last line is the best contract-design fact in the section: **the target is
tiny.** A water well contract is not "drill deep", it is "find the fracture".

**Hydrofracturing / high-pressure jetting** (*tryckning*) `[NB16]`: a packer is
set at a suitable depth to divide the hole so the section above is isolated from
the section below, then a tanker truck — **spol/pressure capacity typically
100–200 bar** — injects water below the packer. Risks: the bedrock well can gain
contact with shallow groundwater, which is precisely why **the packer must not
be set too shallow**. Other documented effects: water pushed up into nearby
wells causing pump and flood damage; occasionally harder to get clear,
silt-free water afterwards. Long experience shows very few permanent damages
where the work is done by skilled contractors.

Blasting with dynamite at the bottom of the well was formerly common and is now
mostly replaced by hydrofracturing; risks are borehole collapse, the water
taking a taste of the dynamite, and no way to predict where the effect will be
greatest `[NB16]`.

**Siting distances** `[NB16]` Appendix 1:

| Pair | Recommended distance |
|---|---|
| Water well (rock) ↔ water well (rock) | **30 m** |
| Water well (rock) ↔ energy well (rock) | **30 m** |
| **Energy well ↔ energy well** | **20 m** |
| Water well (rock) ↔ water well (soil) | 20 m |
| Energy well (rock) ↔ water well (soil) | 20 m |
| Well ↔ sewage / similar contamination source | **minimum 30 m**; recommended **30–50 m** from the source depending on contaminant type, soil infiltration sensitivity, and depth to and slope of the water table |
| Well ↔ house wall | **≥ 4 m** where damage to drainage or building is possible; more if there is a cellar or vibration-sensitive ground |
| Well ↔ property boundary | site **10 m (energy well) / 15 m (water well)** inside the boundary so the neighbour is not prevented from drilling their own |

Where the recommended distance between energy wells cannot be achieved,
`[NB16]` gives the three legitimate answers: **incline the borehole away from
the existing well**, **compensate with increased depth**, or **advise the
customer not to drill**.

Siting principle: place the well **upstream and higher in the terrain** than the
contamination source, because groundwater flow mostly follows the ground surface
slope. Water wells need a larger separation than energy wells, because no water
is abstracted from an energy well and so a contaminant is less likely to be
drawn towards it `[NB16]`.

**Drilling close to buildings** `[NB16]`: inspect facade, foundation and cellar
first and document the result jointly with the owner; drill with **the lowest
possible air pressure** and good control of cuttings transport up the hole.

### C.2.2 Screened well in unconsolidated ground

The filter pack and slot are the whole design. `[WWJ-FP]`:

The purpose of the screen is **only to keep the formation or filter pack in
place** — the screen itself is not a filter. The goal is a **zone of enhanced
hydraulic conductivity** around the screen. Design the well **from the formation
inward**, starting from a sieve analysis of a representative sample.

**Naturally developed well** (no artificial pack — the fines are pulled out
through the screen during development):

- Typical approach in non-homogeneous sediments with good samples: select a slot
  that **passes 60 % and retains 40 %** of the formation.
- Choose a smaller slot **retaining 50 %** in corrosive water and with
  low-carbon steel screens, because slot enlargement of only a few thousandths
  of an inch could let the well pump sand. Corrosion-driven slot enlargement is
  generally not a problem for stainless or PVC screens.
- Conservative slots (retaining 40–50 %) also suit formations of calcium
  carbonate (which dissolves readily under acid treatment) and thin aquifers
  overlain by fine loose material.
- Larger slots extend the permeable zone around the screen, generally increasing
  specific capacity and efficiency, lowering operating costs, and giving longer
  service life before incrustation plugging reduces yield.

**Artificially filter-packed well** — `[WWJ-FP]`'s procedure, verbatim in
structure:

1. Choose the layers to be screened; construct sieve curves for them.
2. Base the pack grading on the **finest** layer.
3. **Multiply the 70 % retained size of that sediment by a factor of 3 to 8**:
   - **3–6** if the formation is uniform and the 40 % retained size is
     ≤ 0.010 in;
   - **6–8** for semi-consolidated or unconsolidated aquifers where the
     sediment is highly non-uniform and includes silt or thin clay stringers;
   - **> 8 risks creating a sand-pumping well.**
4. Plot that as the 70 % size of the pack — the first point on the pack curve.
5. Draw a smooth curve through it with a **uniformity coefficient of about 2.5
   or less**; draw it as uniform as practical.
6. **Select a slot that retains 90 % or more of the pack.** With glass-bead
   packs, retain 100 %, because the beads are uniform.
7. **Extend the pack well above the screen** to compensate for settlement during
   development; a caliper log may show washouts needing more pack — keep spare
   pack on site.

Desirable pack characteristics `[WWJ-FP]` Table 1:

| Characteristic | Advantage |
|---|---|
| Clean | little loss of material during development; less development time |
| Well-rounded grains | greater hydraulic conductivity and porosity; reduced drawdown; higher yield; more effective development |
| **90–95 % quartz grains** | no loss of volume from mineral dissolution |
| **Uniformity coefficient ≤ 2.5** | less separation during installation; lower head loss through the pack |

Uniformity coefficient is defined here as **the 40 % retained size divided by
the 90 % retained size** — lower is more uniform `[WWJ-FP]`.

Filter packing is preferred when sediments are highly uniform and fine-grained;
where sediments are highly laminated and precise layer locations are hard to
determine; where the water is extremely incrusting; and in poorly cemented
sandstone aquifers that give the screen little lateral support `[WWJ-FP]`.
The cost: installing a pack and screen **reduces the specific capacity** of a
well compared with an open-borehole completion — but that reduction is usually
preferable to a sand-pumping well `[WWJ-FP]`.

Practical field detail worth animating: samples for sieve analysis must be
washed in the field to remove drilling fluid, and if the sample is larger than
about **one pound / 450 g** it should be split or quartered. In fine-grained
aquifers with bentonite mud, collect into a 5-gallon bucket and use a
flocculant to decant the fluid `[WWJ-FP]`.

## C.3 Development and testing

**Development** is the step that turns a hole into a well: it removes drilling
fluid and the finest fraction near the screen, establishing the enhanced
conductivity zone. In a naturally developed well, a portion of the finer
formation material near the borehole is removed through the screen, giving
increased porosity and conductivity extending outward, which reduces near-well
drawdown during pumping `[WWJ-FP]`.

`[WWJ-FP]` names the failure mode plainly: with too small a slot, development
takes longer and the well is less efficient than it could have been; drillers
who default to "a 10–20 pack and a 0.030 in slot in every well" avoid sand
problems but often under-design.

Yield testing: **step-drawdown** (several increasing rates, each held to
pseudo-steady state, to find the well's efficiency and the sustainable rate)
followed by a **constant-rate test** with recovery monitoring. Not sourced to a
document in this pass — treat the *names* as standard vocabulary and the
*procedure detail* as `UNVERIFIED`.

`[NB16]` supplies the regulatory bookend: if the well is for drinking water, a
**water analysis must be part of the drilling contract**, meeting at least the
national "normal analysis" scope. And under Swedish law, **submission of the
well record to the national well archive is mandatory** (SFS 1975:424 for water
wells, SFS 1985:245 for energy wells) — a copy of the well log goes to SGU in
addition to the customer's original, and a well whose data are not submitted is
**not approved**.

## C.4 Geothermal — shallow closed loop

### C.4.1 The construction

A borehole heat exchanger (BHE) is a borehole containing a closed loop of
plastic pipe — single-U, double-U or coaxial — through which a heat transfer
fluid circulates. Nothing is abstracted. In Sweden the loop is called the
**kollektor** and the fluid the **köldbärarvätska** `[NB16]`.

| Parameter | Value | Source |
|---|---|---|
| Typical borehole depth | **50–200 m** (validated modelling range) | `[NPRO]` |
| Certification depth bands | **G 100 / G 200 / G 400** — up to 100 m, 200 m, 400 m | `[W120-2]` scheme page |
| Borehole diameter | radius 0.025–0.1 m → **50–200 mm** diameter; worked example ≈ 160 mm | `[NPRO]` |
| Borehole spacing | validated minimum **≥ 6 m**; worked examples **8–10 m** | `[NPRO]` |
| Spacing between energy wells (regulatory, SE) | **20 m** recommended | `[NB16]` |
| Grout thermal resistance | conventional backfill 0.075–0.141 (m·K)/W; **thermally enhanced ≈ 0.08 (m·K)/W** | `[NPRO]` |

Note the two different "spacings": `[NPRO]`'s 6–10 m is the **thermal** field
design within one scheme; `[NB16]`'s 20 m is the **regulatory** separation
between one property's energy well and another's. Both are real and they do not
conflict — a game that models both is modelling the actual argument on site.

`[NB16]` collector requirements:

- **Fully welded plastic pipe collector**, to the national geoenergy centre's
  guidance on collector installation. Welding of plastic couplings must use
  approved material and equipment.
- Mechanical couplings, if used, must be **inspectable** (inspection chamber or
  equivalent) and **may not be used immediately adjacent to the borehole**.
- **Borehole cap** fitted in the casing so the collector cannot be pushed up if
  ice forms on it, and tight enough to stop surface water or soil entering.
- **Pressure test before lowering**: inspect the loop for transport damage, fill
  and vent it, close the return valve, hold **≥ 3 bar overpressure**, then
  inspect visually **not earlier than 30 minutes** after pressurising, keeping
  the pressure up with the pump during the wait. Document in a pressure-test
  record. Test again after installation, during heat-pump commissioning.
- If the energy well is finished below ground, mark its position on the house
  foundation or another clearly visible place, to **± 0.1 m**.
- On any leak or spill of heat transfer fluid, act immediately: pump the loop
  free of fluid, lift and repair or replace it, then fit a pump and **pump the
  well out until the water neither tastes nor smells of the fluid**.

`[EA-GSHC]` describes what is in that fluid and why it is a risk: the closed
loop is filled with thermal transfer fluid comprising **anti-freeze, biocide,
corrosion and scale inhibitors** — so a loop leak is a chemical release into
groundwater, not just a loss of efficiency.

Where the whole borehole must be backfilled with sealing material rather than
left water-filled, `[NB16]` names the triggers: risk of **salt water rising**,
or risk of **short-circuiting groundwater bodies** — the same rule as §B.1.
`[NB16]` also notes that where the whole hole is backfilled to the surface, it
is sufficient for the casing to be anchored in rock (the annulus seal is then
redundant).

### C.4.2 Loop length per kW

`UNVERIFIED` as a sourced figure in this pass. The design route is:

```
required active borehole length (m) ≈ heat extracted from ground (W)
                                      ÷ specific extraction rate (W/m)
```

where the specific extraction rate depends on ground type and annual running
hours — the table for this is **VDI 4640 Blatt 2** (Germany), which is the
recognised reference and is not free. Do not put invented W/m figures in the
game. If a number is needed, either license VDI 4640 or express it in the game
as a *revealed property of the ground* the player learns by drilling, which is
better design anyway (§G.7).

### C.4.3 Deep geothermal, briefly

Distinguish clearly, because conflating them is a `PLATFORM_TRUTH.md` Part C
rule 2 violation waiting to happen:

- **Shallow / near-surface geothermal (oberflächennahe Geothermie)** — closed
  loop, no fluid produced from the ground, heat pump upgrades a low-grade
  temperature. `[W120-2]` bounds it at **Erdwärmesonden bis 400 m**.
- **Deep geothermal** — produces hot fluid from a reservoir, needs a doublet
  (production + injection), and is a well-construction problem closer to oil and
  gas than to a heat pump. Out of scope for this pack.

The 400 m line in `[W120-2]` is a real, citable boundary. Use it.

## C.5 Water-powered DTH hammers

### C.5.1 Why they exist

`[WAI35]`, the vendor's own list of claims for water-powered DTH:

- excellent drilling speed;
- long lifetime;
- **extraordinary drilling stability, small drilling deviations**;
- **environmentally friendly — operation only with water (no oil etc.)**;
- **significant reduction of energy consumption**;
- **no dust formation, therefore preferred use in tunnel construction or in
  urban areas**;
- different bit designs available for the geology;
- fast availability of hammers and spares, low spare-part costs.

Treat "excellent", "long" and "significant" as marketing. The three that are
*structural* and belong in the game are: **no oil in the hole, no dust, and
straight holes.**

The reason for "no oil" is mechanical, not a green claim: an air hammer's piston
is lubricated by oil injected into the air line, which means every air DTH hole
receives a fine mist of lubricant. A water hammer's working fluid lubricates
itself. On a **water well** or a **geothermal borehole in a water protection
area**, that difference is the whole argument.

### C.5.2 The envelope, from the datasheets

| | WAI 35 | WAI 40 | WAI 50 | WAI 60 | WAI 80 |
|---|---|---|---|---|---|
| Standard bit Ø (mm) | 90–105 | 115–127 | 130–152 | 165–203 | 216–273 |
| Casing / drilled steel pile Ø (mm) | — | — | — | — | 273 / 324 / 406 |
| Working pressure (bar) | 60–170 | 60–180 | 60–180 | 50–150 | 50–150 |
| Water, hammer new (L/min) | 75–150 | 130–220 | 180–300 | 200 | 380 |
| Water, hammer worn (L/min) | 170–300 | 210–360 | 280–450 | 600 | 750 |
| Impact frequency (bpm) | up to 3600 | up to 3900 | up to 3300 | up to 2400 | up to 1780 |
| Feed force (N) | 7,000–10,500 | 8,000–20,000 | 11,000–25,000 | 15,000–30,000 | 30,000 |
| Rotation (rpm) | 60–95 | 50–90 | 45–75 | 40–65 | 25–50 |
| Torque (N·m) | 800–1,500 | 1,000–2,000 | 1,500–3,000 | 2,000–4,000 | 3,050–5,000 |
| Length (mm) | 978 | 1,185 | 1,615 | 1,495 | 2,081 |
| Diameter (mm) | 89 (3.5") | 111 | 127 (5") | 160 (6") | ribbed 210 (8") / smooth 251 |
| Weight (kg) | 35 | 56.5 | 111 | 145 | 354 (Ø210) up to 750 |

Sources: `[WAI35]` `[WAI40]` `[WAI50]` `[WAI60]` `[WAI80]`.

### C.5.3 What the table teaches

Four patterns, all game-relevant:

1. **Pressure is an order of magnitude higher than air.** Water hammers run
   **50–180 bar**. Air DTH hammers of comparable size take recommended air
   packages at **10.3 to 24.1 bar**, with an operating-pressure chart topping
   out near 27.6 bar `[DTH-AIR]`. Water is incompressible: you pay in pressure
   instead of in volume, and you do not spend energy compressing the working
   fluid. That is the mechanism behind the "reduced energy consumption" claim,
   and it is the reason the surface plant is a **high-pressure water pump**, not
   a large compressor.
2. **Wear shows up as thirst, not as slowness.** Every datasheet quotes two
   water demands: *hammer new* and *hammer used*. Worn WAI 60: 200 → **600
   L/min** — a **3×** increase. WAI 35: 75–150 → 170–300 L/min, roughly double.
   **This is the best wear mechanic in the whole pack**, because it is a
   consumption number the player watches climb, not a hidden stat (§G.7).
3. **Frequency falls as size rises**: 3,600 bpm at 89 mm down to 1,780 bpm at
   210 mm. Big hammers hit harder and slower — the sound design writes itself.
4. **The biggest one drives casing.** The WAI 80 sheet lists casing / drilled
   steel pile advancing at Ø 273 / 324 / 406 mm `[WAI80]` — so the same water
   hammer family reaches into `DOMAIN.md`'s overburden and micropile
   territory. The WAI 80 also has a "Mega hammer" variant with a **smooth
   Ø 251 mm body for improved flushing**, at up to 750 kg.

The flushing note on the WAI 80 is a genuinely nice modelling detail: **ribbed
body vs smooth body** is a visible difference on a part the player can own, and
the reason is annular flow area.

### C.5.4 Where water hammers win, in one line each

- **Water well** — no oil mist into the aquifer you are about to drink from.
- **Geothermal in a protection area** — same argument, plus `[NB16]`'s
  "biologically degradable oils **should** be used" rule for the rig itself
  shows the industry already thinks this way.
- **Tunnels and underground** — no dust in a confined space `[WAI35]`.
- **Urban sites** — no dust plume over the neighbours `[WAI35]`.
- **Deep holes** — an air hammer's exhaust must lift cuttings up an ever-longer
  annulus against an increasing water column; a water hammer is already pumping
  a liquid column. `UNVERIFIED` as stated by the datasheets, but consistent with
  the "small drilling deviations" and pressure figures. Do not assert it as a
  vendor claim it did not make.

### C.5.5 The surface plant

- **High-pressure water pump** rated to the hammer's working pressure (up to 180
  bar) and its worn-state flow (up to 750 L/min for the largest). That is a
  serious pump, and it is the reason a water-hammer rig looks different from an
  air-DTH rig (§E.5).
- **Water supply and settlement/recycling** — at 300–750 L/min you are not
  running off a bowser.
- **A swivel** rated for the pressure. `[SWIVEL]` shows the general class:
  water swivels feed flushing fluid to the bit **and hoist the drill rods**, so
  they are selected by the weight of string they must lift — quoted capacities
  of **6,350 / 11,800 / 22,680 kg (14,000 / 26,000 / 50,000 lb)** for surface
  units weighing 5.06 / 7.77 / 16.17 kg, with rod capacities of e.g.
  840 / 1,560 / 3,000 m in N size and 560 / 1,035 / 1,950 m in H size.
  Underground units are selected instead by hole diameter and core barrel type,
  with spindle bores of 15.8 mm and 18 mm and max speeds of 2,500 and 1,800 rpm.
  Again: **capacities and vocabulary only, no designations.**
- If mud is used instead (rotary water well work), the fluid end is the
  consumable: triplex pump fluid ends in carbon or stainless steel, valve
  chambers complying with **API 7K**, and valve bonnets with hydraulic
  bolt-tensioning for fast, safe changeouts `[MUDPUMP]`.

---

# D. The professions

`src/game/data.js` files Water Well and Geothermal under `talentIndustry:
'geotechnical'` (lines 222–223), and `DOMAIN.md` §2 lists Talent's geotechnical
specialisations as Geoscientist / Geologist / Survey Technician. That is the
consulting half of the industry with the *entire field half* missing. Here is
the field half.

## D.1 The roles

### Drilling operative / assistant driller ("second man")

**On a shift:** rig up and rig down; handle rods, casing and samplers; drive the
SPT hammer and record the six blow-count numbers; fill and label sample
containers; keep the water tank and the fuel topped; dig and backfill the
inspection pit; strip and clean tools between holes; move the rig between
positions. On a contaminated site, everything above plus decontamination between
holes.

**Career:** works toward the **Level 2 VQ in Land Drilling** for their discipline
`[BDA]`. `[BDA]`'s own auditor biographies show the ladder in practice: one
auditor "spent his formative years learning the drilling trade 'the conventional
way' working his way up from **Second Man to Driller**".

### Lead driller

**On a shift:** owns the hole and the crew. Chooses methods and tooling for the
ground actually encountered; sets out and clears the position for services;
progresses the borehole; takes the samples to the specified class; runs the
in-situ tests to standard; writes the **Driller's Daily Report** (the borehole
log); installs standpipes, piezometers or monitoring wells; backfills and
reinstates to specification.

`[BDA]` is unusually explicit about what a lead driller must personally be able
to demonstrate, and it makes a superb skill-tree:

- have a **legible, accurate borehole measuring tape** and a **working
  water-level dip meter**, and use both correctly and accurately;
- complete the **borehole log for every type of borehole including dynamic
  sampling**, legibly and fully — `[BDA]` notes there are **potentially 19
  things that need to be included**; a log not completed at all is a **major**
  non-conformity;
- sample to **BS EN ISO 22475-1**: correct method for the stratum, correct
  containers/liners/boxes/tubs (**"not sandwich bags"**), samples protected
  immediately from vibration, shock, heat, cold and temperature change, and
  without losing fines;
- **know the sample quality class obtainable by the method they are using** —
  lack of that knowledge is itself a recorded non-conformity;
- test to **BS EN ISO 22476**, with the audit focusing on the SPT: whether
  **self-penetration** has been measured and recorded, **rod straightness**,
  whether the **SPT calibration certificate** is in date, the condition of
  shoes/cones, and whether spares are on the truck;
- complete installations to specification (correct level, sealed, sufficient
  filters, gas tap fitted where required) and measure and report their depths
  and levels accurately.

**Ticket set** `[BDA]`: VQ in Land Drilling; **CSCS card**; First Aid; **Wire
Rope Inspection Training** (rotary and cable-percussion lead drillers
specifically); Asbestos Awareness / NNLW; Manual Handling. Real auditor CVs in
`[BDA]` also show IOSH Safe Supervision of Geotechnical Sites, IOSH Avoiding
Danger from Underground Services, Streetworks, CCNSG Safety Passport, and — for
those who go offshore — **BOSIET** and **ENG1 Seafarer Medical**, which is a
direct bridge to the certification system already in `PLATFORM_TRUTH.md` Part B.

### Site engineer / logger

**On a shift:** describes and logs the soil and rock to **BS EN ISO 14688 /
14689** `[BDA]`; schedules and labels samples; runs hand-vane and hand-penetrometer
tests; takes groundwater readings; keeps the daily record and liaises with the
client; on contaminated sites, does PID/FID headspace screening and manages the
chain of custody.

### Geotechnical engineer

**Off the rig:** writes the ground investigation specification (which decides
what quality class the driller must deliver — `[GE-2009]` puts the burden here:
the designer must understand the relationship between sampling method and
laboratory testing); schedules laboratory testing; interprets N-values,
CPT traces and lab results into design parameters; writes the interpretative
report.

### CPT operator

A separate trade from a driller. Levels and anchors or ballasts the machine,
sets the rams as near vertical as possible `[D5778]` §12.1.1, saturates the
piezocone (deairing in glycerine or silicone oil, or boiling the elements
submerged for at least 4 h `[D5778]`), records baseline readings before and
after every sounding and compares them `[D5778]` §12.2.6, holds the 20 mm/s,
watches for the precarious-situation signals, and knows when the rebound of the
rods means the machine is at thrust capacity `[D5778]` §12.4.3.1.

### Environmental scientist / contaminated land consultant

Designs the sampling and analysis plan; specifies well construction for the
analyte; supervises low-flow sampling to `[EPA-LF]`; owns the QA/QC — trip
blanks, equipment blanks, duplicates; on PFAS jobs, owns the materials list
`[EPA-PFAS]` and enforces it on a crew that has spent twenty years using PTFE
tape.

### Water well driller

Everything the lead driller does, plus: siting to the regulatory separations
`[NB16]`; measuring chloride or conductivity every 20 m; designing screen and
filter pack from a sieve analysis `[WWJ-FP]`; developing the well; pump
installation with drinking-water-approved cable and drip-tight casing
penetration `[NB16]`; taking the water analysis; and filing the well record.

### GSHP installer / geoenergy driller

Drills to depth; **pressure-tests the collector before it goes down the hole and
again at commissioning**; fits the borehole cap so ice cannot push the collector
up; records the well position to ±0.1 m; and, if fluid is spilled, pumps the
well until the water neither tastes nor smells of it `[NB16]`.

## D.2 Tickets, by market

| Market | Scheme | What it certifies |
|---|---|---|
| **UK / Ireland** | **BDA Audit** `[BDA]` | On-site audit of an individual driller and their rig. Contributes to demonstrating compliance with **BS 22475 Parts 2 and 3** (qualification criteria for enterprises and personnel; third-party conformity assessment), the **UK Specification for Ground Investigation ("Yellow Book")**, and **CDM 2015**. |
| UK | **VQ / NVQ in Land Drilling** Levels 1–3 `[BDA]` | The occupational qualification. `[BDA]` cites Level 2 "Lead Driller" endorsed by discipline (e.g. Rotary, Cable Percussion, Dynamic Sampling) and Level 3 Occupational Working Supervision. |
| UK | **CSCS card** (issued alongside the BDA audit card) `[BDA]` | Site access. |
| **Germany** | **DVGW W 120-1** `[W120-2]` | Company qualification for **Bohrtechnik, Brunnenbau, Brunnenregenerierung, Brunnensanierung und Brunnenrückbau** — drilling, well construction, regeneration, rehabilitation and decommissioning. |
| **Germany** | **DVGW W 120-2** `[W120-2]` | Company qualification for **Bohrtechnik und oberflächennahe Geothermie (Erdwärmesonden bis 400 m)**, in depth groups **G 100 / G 200 / G 400**. Required in practice by public clients and permitting authorities for work affecting groundwater. |
| **Sweden** | **Certifierad brunnsborrare** (certified well driller) `[NB16]` | `[NB16]`'s stated goal is that all active well drillers are trained and certified. `[NB16]` also imposes a **statutory duty to report** every water well (SFS 1975:424) and energy well (SFS 1985:245) to SGU's Brunnsarkivet — **a well whose data are not submitted is not approved**. |

**W 120-2's internal structure is a ready-made game system** `[W120-2]` contents:
the certificate requires (a) formal company undertakings and a record of
completed work with references; (b) three tiers of personnel — *verantwortliche
Fachaufsicht* (responsible technical supervision), *bauleitende Fachkraft*
(site-managing specialist) and *Fachpersonal* (skilled personnel), each with its
own qualification requirement; (c) requirements on the **equipment** itself;
(d) a quality/business management system; and (e) ongoing **Fort- und
Weiterbildung** (continuing training), plus a **Fachgespräch** — a technical
interview with the responsible supervisor based on completed or current
projects.

That is: *a company certificate you buy by having the right people, the right
machines and a documented track record, which expires unless you keep training.*
It is `PLATFORM_TRUTH.md` Part B's expiring-certification mechanic, applied to
the **company** rather than the individual — a new and better shape for the
Site Lead branch of the skill tree.

## D.3 Crew size

| Operation | Typical crew |
|---|---|
| Cable percussion | 2 — driller + second man |
| Windowless / dynamic sampling | 2 — driller + assistant; `[GW-WLS]`'s tracked unit is a two-hander |
| Rotary geotechnical | 2, sometimes 3 with a dedicated logger |
| CPT | **1–2**; a truck unit is routinely a one-operator machine — the machine provides the reaction, so there is nothing to handle |
| Water well (DTH) | 2–3, plus a tanker driver on hydrofracturing days |
| GSHP borehole | 2–3 drilling; loop insertion and grouting often a separate team |

`UNVERIFIED` as a sourced table; assembled from the operational descriptions in
`[GW-WLS]`, `[D5778]` and `[NB16]`. Treat as a design default, not a fact to
display.

## D.4 Pay — what is sourceable, and what is not

**Nothing in this pack sources a day rate in EUR for these roles.** What is
sourceable is aggregated UK annual pay, which the game can convert itself. Be
honest in the code comment about which is which.

| Role | Figure | Source |
|---|---|---|
| Driller (UK, all sectors) | average **£35,217/yr**, from 197 job postings over 36 months | `[SAL-1]` |
| Driller (UK) | average **£34,708/yr** (~£17/hr); 25th percentile £25,127; 90th percentile £64,099 | `[SAL-2]` |
| Geotechnical driller (UK) | average **£33,388/yr**, from 201 reported wages | `[SAL-4]` |
| Rotary driller (UK) | entry level (1–3 yrs) **£37,012/yr**; senior (8+ yrs) higher | `[SAL-3]` |

These are **employed salaries**, not contractor day rates, and they are UK-only.
`PLATFORM_TRUTH.md` Part B is right that offshore work is paid as a **day
rate** — but onshore ground investigation in the UK, Germany and the Nordics is
predominantly **staff / residential** employment, which is already a value in
`DOMAIN.md` §7's rotation list. Use `Staff / residential` and `5/2 (onshore
week)` for this whole family of contracts, and reserve day-rate framing for the
offshore and remote work.

If the game needs an in-fiction EUR day rate, derive it and say so:
`£35,000/yr ÷ ~220 working days ≈ £160/day ≈ €185/day` for a driller — clearly
labelled as the game's own derivation from `[SAL-1]`/`[SAL-2]`, not as a
sourced industry figure. Do **not** put a fabricated "€450/day site engineer"
in `FACTS_VERIFIED.md`.

---

# E. The machines — distinct silhouettes

The brief's warning is the right one: these must not all read as the same
crawler. Here is what separates them, with the sourced dimensions that make each
recognisable at a glance.

## E.1 Small tracked geotechnical rig (rotary / dynamic sampling)

**Read:** *narrow.* This machine's whole reason to exist is that it fits where a
truck cannot.

- Width **0.79 m without side cages** — narrower than a domestic doorway
  `[GW-WLS]`.
- Length **2.729 m**; **trackable height 1.460 m** (mast down, driving);
  **working height 2.857 m** (mast up) `[GW-WLS]`.
- Rubber tracks, low ground pressure, walk-behind or radio remote control.
- The mast is short and folds flat forward over the tracks. **Model the fold** —
  the transition from 1.46 m travelling to 2.86 m working is the machine's
  signature move and it is a two-second animation that says everything.
- Hydraulic percussion head at the top of a short feed frame; no rod carousel —
  rods are handed up by the second man.
- Often a **detachable power pack** connected by hoses, so the mast alone can be
  carried into a basement or a back garden.

## E.2 Window sampling — the hand-portable version

**Read:** *a man and a road-breaker.* No rig at all.

- A petrol two-stroke or electric percussion hammer of the road-breaker class
  `[VANWALT]`, hand-held, driving a **40–80 mm** steel tube in **0.5 m or 1.0 m**
  lengths `[VANWALT]`.
- Extraction by a manual jack or a small hydraulic puller braced against the
  ground — the puller is often bigger than the hammer, because §A.5's depth
  limit is the pull, not the drive.
- Tubes stacked on the ground in descending diameters; plastic liners in a box.
- Maximum **~10 m** `[VANWALT]`.

## E.3 CPT unit — two completely different machines

**(a) The ballasted truck.** *Read: a lorry that is mostly ballast.*

- 20–22 t on 6×4 or 6×6 `[INSITU]`, of which the working part is a hydraulic
  ram assembly in a hatch **through the middle of the deck**.
- The operator sits **inside**, in a cabin over the push point, at a screen.
  There is no mast, no rotation, no dust, no noise beyond the hydraulic pack.
- **Levelling jacks lower to raise the machine off its suspension** so the dead
  weight, not the springs, provides the reaction `[D5778]` §12.1.1.
- The whole silhouette is: *box on wheels, feet down, nothing visibly moving.*
  The drama is entirely on the screen inside. Lean into that — it is genuinely
  what the job looks like.

**(b) The anchored mini-track.** *Read: a small machine screwed to the ground.*

- **3.5 t** carrying **20 t of thrust** `[INSITU]` — impossible without anchors.
- **Four hydraulically driven screw anchors** `[INSITU]` wind into the ground at
  the corners, and the machine then pulls against them. **Animate the anchors
  turning in.** Nothing else in the game does this.
- Rubber tracks, 1.5–3.5 t class, restricted-access width.

Both variants push **1 m rods** and pause at each rod break `[D5778]` — that
pause is the beat.

## E.4 Sonic rig

**Read:** *a normal rig doing an abnormal thing.*

- Track- or truck-mounted with a conventional mast, but the head is a **heavy
  block with a visible isolator/damper** between it and the mast. The damper is
  what makes it look different — an air damper running at **0.7 MPa** with a
  minimum **8 L/min** air flow `[SONIC-BR]`.
- The rig visibly **blurs**. Oscillator force up to **222 kN** at up to
  **150 Hz** `[SONIC-BR]`; the string moves up and down **up to 150 times per
  second** `[SONIC-BR]`. Do not animate a shake — animate a *motion blur band*
  on the head and the top rod, and a still, sharp rig below the isolator.
- Rotation is almost nothing: **up to ~150 rpm**, often much less
  `[SONIC-SI]` `[SONIC-BR]`.
- **Two strings, not one**: an inner core barrel and an outer override casing,
  worked alternately `[SONIC-SI]`. A sonic rig's deck has **two size ranges of
  tooling on it**, and that is the visual tell.
- Often **little or no flush** `[SONIC-SI]` — so no mud tank, no shaker, no
  spray. A clean site.
- The product is a rack of **plastic liner sleeves full of continuous core**,
  laid out in order. That rack is the sonic rig's hero prop.

## E.5 Water well rig — air DTH

**Read:** *the rig is the small half of the outfit.*

- Truck- or track-mounted rotary head on a tall mast with a **rod carousel** for
  6 m rods.
- **The compressor is the story.** Air packages for hammers in the 100–200 mm
  class start around **118 L/s at 10.3 bar** and rise to **283 L/s at 20.7 bar**
  and **425 L/s at 24.1 bar** `[DTH-AIR]`. That is a separate trailer-mounted or
  deck-mounted machine as big as the rig, roaring, with a heat haze.
- **A dust collector / cyclone** at the collar with a flexible hood and a hose —
  `[NB16]` requires good control of cuttings transport up the hole when drilling
  near buildings.
- A plume: air DTH in dry rock throws a white dust column. When the hole makes
  water, that plume turns to a **wet grey spray** — and *that transition is the
  water strike*, visible from a hundred metres. Best free VFX moment in the
  section.
- Steel casing in **139.7 / 168.3 / 193.7 mm** `[NB16]` racked alongside, plus
  an eccentric or ring-bit crown for driving it.

## E.6 Water well / geothermal rig — water hammer

**Read:** *the same rig with the compressor swapped for a pump.*

- No compressor, no dust, no plume. Instead a **high-pressure water pump**
  package rated to **150–180 bar** and up to **750 L/min** `[WAI50]` `[WAI80]`,
  hard-piped in armoured hose rather than the fat lay-flat air hose.
- A **water tank / settling and recycling train**, because at 300–750 L/min the
  volumes are real.
- At the collar: no dust hood; a **return flow** of grey water and cuttings into
  a settlement box. Wet, quiet, dirty at ground level and clean in the air —
  visually the exact inverse of the air rig.
- The hammers themselves are a visible size ladder: **978 mm / 35 kg** up to
  **2,081 mm / 354–750 kg** `[WAI35]` `[WAI80]`.

## E.7 Small geothermal rig

**Read:** *a water well rig that has to fit in a garden.*

- Same drilling principle as §E.5/E.6 but sized for **115–165 mm** holes
  `[NB16]` and **50–200 m** depths `[NPRO]`, on a compact crawler.
- Distinctive kit that no other rig carries:
  - a **collector reel** — a big drum of coiled PE loop pipe;
  - a **pressure-test manifold** with a gauge, used before the loop goes down
    and again at commissioning `[NB16]`;
  - a **grout/backfill pump and tremie hose** for the holes that must be
    backfilled `[NB16]`;
  - a stack of **borehole caps** `[NB16]`.
- The loop insertion is its own set piece: two people feeding a doubled pipe
  with a weighted U-bend down a 140 mm hole, 150 m of it, without kinking it.

## E.8 Cable percussion rig

**Read:** *a tripod and a rope.* The oldest silhouette in the game.

- A folding **A-frame / tripod mast** over the hole, a winch on a small
  skid-mounted engine, and a **wire rope**. No rotation, no flush, no hydraulics
  at the hole.
- Tools hang and drop: **shell** (for sand and gravel), **clay cutter** (for
  cohesive soil), chisel, and the SPT drive assembly `[GE-2009]`.
- Casing in **150–300 mm** `[GE-2009]`, driven with the same winch and a
  drive cap.
- The wire rope is a maintained safety item in its own right — a rotary or
  cable-percussion **lead driller must hold Wire Rope Inspection Training**
  `[BDA]`.
- `data.js` lines 1376–1384 already ship the chisel and the sand bailer, and
  `DESIGN_EXPANSION.md` §4 already flags that cable-tool was wrongly given a
  hydraulic crawler and drill rods. This is the correct silhouette.

---

# F. Hazards and the correct response

Format: **what the crew sees first → what it is → the correct action.**

## F.1 Buried services

**Sees first:** the CAT sings, or the ground gives a hollow tap, or a strip of
different-coloured backfill runs across the position.

**Is:** an electricity cable, gas main, water main, telecom duct or sewer, and
`[HSG47]` is clear that plans alone are not sufficient to identify and locate
services before starting work, and that they are not always drawn accurately to
scale — records are frequently found to be inaccurate by omission.

**Correct action** `[HSG47]`:

1. Get plans from the owners/operators **and** treat them as indicative only.
   Copy the service location information onto the working drawings.
2. Use a **detecting device / locator** to determine position and route, then
   **mark the ground**.
3. Dig **trial holes** with hand tools or **vacuum excavation** to confirm the
   position of anything detected.
4. **Excavate alongside the service rather than directly above it.**
5. Do not use hand-held power tools over a service unless it has already been
   exposed and is at a safe depth — **at least 300 mm** below the bottom of the
   hard surface being broken out.
6. **Use insulated tools when hand-digging near electric cables.** Spades and
   shovels — preferably with curved edges — rather than other tools, and not
   thrown or spiked into the ground.
7. Final exposure by **horizontal digging**, because the force on hand tools is
   more controllable that way.
8. Mechanical excavation must be planned and managed, with **a second person
   positioned to see into the excavation** and assist the operator.

`[BDA]` audits this directly: provision of utility detection equipment
(**CAT & genny**) **and a qualified operator** — if the drill crew are clearing
services, they must be trained in how to use the equipment. HSG47 is a named
document in the BDA audit remit `[BDA]`.

**Game shape:** a pre-drill scan phase before the position is committed. Miss it
and the strike is not a random punishment — it is the consequence of a step you
skipped.

## F.2 Artesian flow

**Sees first:** the return does not stop when the pump/compressor does. Water
keeps coming, and keeps coming.

**Is:** a confined aquifer whose head is above ground level `[SEPA-DEC]`.

**Correct action** — control the flow before anything else `[SEPA-DEC]`:
extend the casing above the potentiometric surface; introduce a dense
non-polluting fluid; set an **inflatable packer** and pressure-grout below it;
or draw the head down by pumping this or a nearby borehole. `[NB16]` adds the
immediate site-protection duty: without casing or a diverter hose the water goes
into the soil layers, which in frost-susceptible ground can cause real damage.

**Do not** simply cap it and leave — an uncontrolled artesian hole wastes the
resource and can discharge one aquifer into another `[SEPA-DEC]`.

## F.3 Cross-contamination between aquifers

**Sees first:** the drilling water changes character, or the conductivity meter
climbs, or the log shows you have just passed from a confined unit into an
unconfined one.

**Is:** the borehole has become a conduit `[SEPA-DEC]`.

**Correct action:** seal it. `[NB16]` §2.3: where two or more separate aquifers
risk being short-circuited, install seals in the borehole or backfill it
entirely. `[NB16]` §2.2's salinity rule is the operational trigger:
**> 50 mg/L chloride or > 50 mS/m conductivity** in an energy or water well may
affect neighbouring water wells — and if the risk to surrounding wells cannot be
excluded, **the recommendation is to backfill the well**.

That is a genuinely hard game decision: you have drilled 160 m, you have hit
salt, and the correct answer is to fill it in.

## F.4 Unknown contamination

**Sees first:** a smell, a sheen, a colour, a made-ground horizon full of
fragments — or the PID reading jumps.

**Is:** you are now on a different job than the one you priced.

**Correct action:** stop; do not drill on into a clean aquifer beneath it
(§B.7); tell the client and the supervising engineer; move to
decontamination-between-holes working; and re-plan the hole as a telescoped,
sealed construction. `[NB16]` notes the regulatory teeth: in areas with
established or suspected contaminated ground the supervisory authority may
introduce a permit requirement or a **ban** on well drilling.

**Asbestos** in made ground deserves naming: `[BDA]` audits **Asbestos Awareness
/ Notifiable Non-Licensed Work** as an expected qualification for drilling
operatives.

## F.5 Hole collapse

**Sees first:** the return goes cloudy and heavy; the string becomes hard to
lift; the water level in the hole drops.

**Is:** the wall is failing — over-gauged by too much flush in loose ground, or
unsupported below the water table.

**Correct action:** case it. `[SONIC-SI]`'s phase II exists for exactly this —
the open borehole is unstable during the core-barrel extraction manoeuvre and
may collapse, so the override casing goes down around the barrel **before** the
barrel comes out. In DP, the equivalent tool is casing or injection through the
hollow rods to cut skin friction `[22476-2]`.

## F.6 Gas

**Sees first:** the personal monitor alarms; bubbles in the return; a smell.

**Is:** methane or carbon dioxide from made ground, landfill, coal measures or
organic alluvium; or hydrogen sulphide.

**Correct action:** the hierarchy is monitor → evacuate → eliminate ignition
sources → ventilate → do not re-enter until cleared. `[22476-2]` §5.5 requires
national safety regulations to be followed including provision for **clean air
if working in confined spaces**. `[BDA]` audits fire safety and COSHH management
on every rig.

**Installations matter here too**: `[BDA]` lists "**gas tap fitted where
required**" as part of completing an installation to specification — the
monitoring well the player installs on a landfill is a gas well, and it is
wrong without the tap.

## F.7 Confined space around the borehole

**Sees first:** the hole is inside a basement, a manhole, a shaft or a tented
enclosure, and the rig exhaust has nowhere to go.

**Is:** an oxygen-deficient or contaminated atmosphere hazard created by your
own machine.

**Correct action:** ensure clean air, per `[22476-2]` §5.5. This is a real
scenario for the small rigs in §E.1/E.2 — `[INSITU]` lists a hand-portable
pusher explicitly for **basement** testing, and `[GW-WLS]`'s rig is 0.79 m wide
precisely so it can go indoors.

## F.8 Overhead lines

**Sees first:** the mast is about to go up and there is a line above the
position.

**Is:** the most common fatal accident mode for any masted rig.

**Correct action:** it is a **siting** decision made before the machine moves,
not a drilling decision. `[BDA]` audits "public access / protection of working
area" and "vehicle access provisions" as part of the site setup, and
`[NB16]` figure 9 notes plainly that the rig used for drilling is both large and
heavy.

**Game shape:** overhead lines should constrain the *position selection* screen,
not appear as a mid-drill event. That is where the real decision is.

## F.9 The rig itself

`[BDA]`'s daily-inspection list, which is a ready-made pre-shift checklist
minigame:

- daily rig inspections; **emergency engine stops** — all visible, accessible
  and working correctly;
- **guarding of rotating parts and hot/cold parts** — are all dangerous parts
  guarded;
- rig and equipment condition; compliant **data plates and identification**;
- **winches, wire ropes and lifting equipment** — safe working loads, maximum
  line pulls, correct terminations, and Thorough Examination certificates
  listing all unique IDs and SWLs;
- welfare facilities; first aid kit including eye-wash; **spill kit**;
  COSHH assessments available and followed; PPE.

Governing equipment standard: **BS EN 16228** parts 1 and 2 — *Drilling and
foundation equipment — Safety*, part 2 covering mobile drill rigs for civil and
geotechnical engineering, quarrying and mining `[BDA]`.

`[NB16]` §2.4 adds the Nordic pair: compressor and drill rig shall be inspected
per current industry requirements; **compressed-air hoses shall be matched to
the compressor's maximum working pressure**; and **biologically degradable oils
should be used**.

---

# G. Game mechanics proposal

## G.0 The framing that makes this work

The existing loop is *"hold the needle in the green band, metres accumulate"*
(`GAMEDESIGN.md` §3). Site investigation breaks that loop deliberately, and that
is the point: **this is the branch of the game where metres are not the score.**

Three new verbs, one per method family:

| Family | Verb | Score |
|---|---|---|
| SPT | **strike** — a rhythm activity | a defensible N-value |
| CPT | **push** — a steady-state activity | an uninterrupted, in-tolerance trace |
| Sampling & sonic | **recover** — a tuning activity | quality class and % recovery |

## G.1 What happens to the three sliders

Do not remove them. **Relabel them per method**, exactly as
`DESIGN_EXPANSION.md` §1 already does for HDD:

| Method | Feed | Rotation | Flush |
|---|---|---|---|
| Rotary geotech | WOB | RPM | water/air/mud |
| **SPT** | *(locked — the hammer is the drive)* | **cadence** — blows/min | *(off)* |
| **CPT** | **push rate**, target 20 mm/s | *(off — locked at zero)* | *(off)* |
| **Dynamic probing** | *(locked — the hammer is the drive)* | **rod-turn** — 1½ turns / 50 blows | **injection** through the hollow rods |
| **Window / windowless** | drive energy | *(off)* | *(off)*; third slider becomes **extraction force** |
| **Sonic** | **feed** (over-feed = the "knot") | **frequency** ← the tuning slider | flush, legitimately at zero |
| Water well DTH | WOB | RPM | air or **water pressure** |

The "Rotation" slider being **physically absent** in CPT is not a missing
feature. Grey it out with the label *"the cone does not turn"* and let that
teach.

## G.2 SPT — the blow-count rhythm activity

**What the player does.**

The hammer rises and falls on a fixed cycle. The player's job is not to press
faster — it is to **release cleanly and count honestly**.

1. **Seating drive, 150 mm** — two 75 mm increments. These are counted but
   **greyed out on the log**, with the tooltip *"discarded — fall-in"*.
2. **Test drive, 300 mm** — four 75 mm increments. Each fills a bar on a
   six-slot log strip at the side of the section view.
3. Each blow is one tap. **The timing window is the free-fall release**: hit it
   and the blow transfers full energy; miss and the blow is recorded but the
   effective energy is lower — which means **more blows for the same 75 mm**.
   The player is not punished with a fail state; they are punished with a
   *worse number*, which is exactly the real failure mode.
4. **N appears when the last four increments are full.** The game then shows,
   side by side:
   - the raw `N`
   - the corrected `N60 = Em·CB·CS·CR·N / 0.60` `[SPT-NOTES]`
   - and, in sand, `(N1)60` `[SPT-NOTES]`

   with the four correction factors displayed **as a list of the player's own
   equipment choices** — hammer type (§A.1.5's Ce table), rod length, borehole
   diameter, liner. That single screen makes the shop meaningful: an automatic
   trip hammer at Er 80–100 % vs a donut at 30–60 % `[SPT-CORR]` is a *visible
   correction factor*, not a hidden multiplier.

5. **Refusal is a legitimate outcome, not a fail.** 50 blows in one increment,
   100 total, or no advance in 10 blows `[WIKI-SPT]` → the test terminates and
   the log records `50/25 mm`. **Pay the player for it.** Refusal in dense
   gravel is information the client bought.

**The depth trap to keep:** CR is 0.75 below 3 m and only reaches 1.00 beyond
10 m `[SPT-CORR]`. Surface the message *"shallow tests are the least reliable —
and the foundation sits on them."*

**The bit that makes it a Drillity game:** the SPT trip hammer is a purchasable
item that changes a *correction factor*. No other game does that.

## G.3 CPT — the steady push with a live trace

**What the player does.**

This is the calm, high-tension minigame. There is nothing to hit and everything
to hold.

**Setup phase (matters, and is skippable at your peril):**

1. **Choose the reaction.** Ballast (drive on, drop the jacks so the machine
   sits off its suspension `[D5778]`) or **anchors** (four screw anchors wind
   in `[INSITU]`). Anchors take time; ballast needs ground that will carry
   20 t `[INSITU]` and can deform the near-surface readings `[D5778]` Note 6 —
   a real, sourced trade-off with a visible consequence in the top 2 m of the
   trace.
2. **Saturate the cone** — deair the porous element. Skip it and the `u2` trace
   is junk and `qt` cannot be corrected. `[D5778]` even documents the tell: in
   the worked example, the pore pressure sensor **loses saturation passing
   through a thin dense sand layer at 12 m and regains it at about 17 m**
   `[ROB-SBT]`. Reproduce that: a desaturated `u2` channel that goes flat and
   then wakes up.
3. **Baseline readings** before and after the sounding, compared `[D5778]`
   §12.2.6. Make the post-sounding baseline a **completion check**: drift beyond
   tolerance invalidates the sounding.

**Push phase:**

- One slider: **push rate**. Target **20 mm/s**, tolerance **±5 mm/s**
  `[D5778]`. A narrow band on a vertical gauge. Holding it is the entire skill.
- Three live traces scroll upward beside the cross-section: **qc**, **fs**,
  **u2**. Behind them, a fourth strip: the **live SBT colour bar** from `ISBT`
  `[ROB-SBT]` — legitimate, because the non-normalised index needs only `qc` and
  `Rf`, which is precisely why Robertson kept it.
- **Readings land every 50 mm** (or 20/10 mm on better kit `[D5778]`). A
  smaller cone resolves thinner layers `[D5778]` — so cone size is a shop
  choice that visibly changes the *resolution of the picture*.
- **Inclinometer**: a small drift indicator `[D5778]` §1.4. It creeps in
  gravelly ground. Ignore it and you get §"unusual occurrences" below.

**Events, all sourced:**

| Event | Signal | Correct response |
|---|---|---|
| Precarious situation | sudden dramatic rise in `qc`, bending, or inclination `[D5778]` Note 9 | **slow down** — and it must be reported, so the slow-down is *logged on the trace*, not hidden |
| Thrust capacity reached | rods **rebound** when released; the machine physically moves during penetration `[D5778]` §12.4.3.1 | terminate the sounding — moving the machine mid-push is a hard fail |
| Gravel | "crunching" sounds while penetrating `[D5778]` §12.4.4 | note it; expect damage |
| Dissipation test | player elects to stop at a chosen depth | hold; watch `u2` decay to `u0`; **seconds in sand, many hours in plastic clay** `[D5778]` — a real time-vs-data bargain |
| Rod break | every 1 m | the beat; on SCPT, this is when the seismic reading is taken `[D5778]` |

**Score:** not depth. **Trace integrity** — % of the sounding within
20 ± 5 mm/s, `u2` saturation maintained, baseline drift within tolerance,
inclination within limit, and whether the target depth was reached before thrust
capacity. A shallow, clean sounding beats a deep, dirty one.

**Sound design note:** a CPT has no percussion and no rotation. The audio is a
hydraulic hum, the tick of the depth encoder, and the operator's own breathing.
After twenty hours of hammers, that silence will land.

## G.4 Dynamic probing — two numbers in tension

**What the player does.** Blows accumulate; the log records `N10` (or `N20` for
DPSH) `[22476-2]`. Two gauges:

- **N10** — the ground.
- **Torque** — the rods. `[22476-2]` requires a wrench reading at least 200 Nm
  in 5 Nm steps.

If torque rises with `N10`, the blow count is contaminated by rod friction.
Responses `[22476-2]`: **rotate the rods 1½ turns every 50 blows** (a small
timed input), **inject water or mud through the hollow rods near the cone**
(the third slider), or set casing.

Class selection is a genuine pre-job choice, and the specific work per blow
column makes it legible: **DPL 50, DPM 100, DPH 167, DPSH-A 194, DPSH-B
238 kJ/m²** `[22476-2]`. Bring a DPL to dense gravel and you will exceed
`N10 = 50` and have to stop; bring a DPSH-B to soft clay and you will fall below
`N20 = 5` and resolve nothing.

**Disposable vs retained cones** `[22476-2]` is a per-hole consumable decision:
lose the cone and gain the depth, or keep it and fight the friction.

**Termination:** blows exceed twice the maximum, or the maximum is exceeded
continuously for 1 m `[22476-2]`.

## G.5 Sample quality as the score

This is the headline change and it applies across the whole family.

**Replace metres with class.** The contract specifies what the laboratory needs;
`[GE-2009]`'s table (§A.4) converts that into a **required quality class**;
the class determines which methods can satisfy it.

Contract card, in the game's voice:

> **Ground investigation — 6 boreholes to 15 m**
> Laboratory schedule includes **triaxial and oedometer**.
> → Requires **quality class 1** samples in the cohesive strata.
> → Achievable by: thin-wall open tube · thin-wall piston · triple-tube rotary core.
> → **Not** achievable by: U100 · SPT · windowless · cable percussion.

That single card teaches more real geotechnics than any tooltip, and every line
of it is sourced to `[GE-2009]`.

**Per-hole scoring:**

| Component | What it measures |
|---|---|
| **Class achieved vs class specified** | the primary score |
| **Recovery %** | how much of the drilled interval came up |
| **Log completeness** | `[BDA]`'s "potentially 19 things that need to be included"; missing log = major non-conformity |
| **Sample care** | correct container, sealed, protected from vibration/shock/heat/cold `[BDA]`; fines not lost `[BDA]` |
| **Test validity** | SPT self-penetration measured and recorded; rod straightness; calibration in date `[BDA]` |
| **Installation** | correct level, sealed, sufficient filters, gas tap where required `[BDA]` |
| **Reinstatement** | to specification `[BDA]` |

**The BDA Audit as an end-of-contract grade.** `[BDA]`'s own structure is
already a game system: **observations**, **minor non-conformities**, **major
non-conformities**, and four outcomes — *achieved*, *not yet achieved (pending
rectification of specified minors)*, *terminated (a major was recorded)*, and
*not achieved*. Accumulate **5 or more minors** in the technical section and you
record a general non-conformance and fail the whole audit `[BDA]`. Minors can be
rectified within **21 days** with evidence; majors cannot be rectified later and
must be re-assessed `[BDA]`.

Map that onto the existing D→S grade in `GAMEDESIGN.md` §4 and the game gains a
grading system that a real UK driller would recognise on sight — and a very
specific dread: *"I've got four minors."*

## G.6 Sonic — the tuning minigame

The one genuinely new mechanic in the pack, and it is straight out of
`[SONIC-SI]` eq. 1.

- The **Rotation slider becomes Frequency**, 60–150 Hz `[SONIC-BR]`
  `[SONIC-SI]`.
- The resonance target is `f = c / (2l)` — **it falls continuously as the string
  lengthens** `[SONIC-SI]`. Draw it as a target band that **slides down the
  slider as you drill**.
- Harmonics: `[SONIC-SI]` says that with depth you add **multiples of the
  fundamental** to keep the wave crests near the ends of the string. So the
  slider has **several valid bands** — the fundamental low down and harmonics
  above it — and the higher harmonic is narrower and drills faster. That is a
  risk/reward ladder with a physical justification.
- **In the band:** ROP multiplies. `[SONIC-SI]`'s measured result was **up to
  four times** classical core drilling on the same site; the vendor claims
  **three to five times** `[SONIC-BR]`. Cap the multiplier at 4× and label the
  5× as a marketing claim if it ever appears in flavour text.
- **Out of the band:** `[SONIC-SI]` — the force generated at the same frequency
  is reduced and the rods are no longer in resonance. You are, in
  `FACTS_VERIFIED.md`'s existing phrasing, *just heating steel.*
- **Over-feed:** the **"knot"** — the bit can no longer move against the
  material, progress collapses, and the rods are at risk of **fracturing from
  the vibration** `[SONIC-SI]`. A hard, expensive, correctly-signposted failure.
- **The three-phase cycle** `[SONIC-SI]` becomes the rhythm of the hole:
  core → override casing → retrieve, repeated. In competent rock the player can
  **skip phase II** and go faster — until the hole collapses on the extraction
  manoeuvre.
- **Flush at zero is correct** `[SONIC-SI]` — and the game should reward
  noticing, because a player who has spent 40 levels learning "flushing is not
  optional" will not believe it.

## G.7 Water well and geothermal loops

**Water well — the target is small and hidden.**

The contract asks for a yield, not a depth. `[NB16]`: a normal household needs
**50–100 L/h**; a new bedrock well normally gives **100–1,000 L/h**; sedimentary
bedrock can give **over 10,000 L/h**; and a big fracture zone changes everything.

So the cross-section hides **fracture zones**, and the loop is:

1. Drive casing: **≥ 6 m total, ≥ 2 m into solid rock** `[NB16]` — a real,
   checkable sub-objective with an eccentric or ring-bit crown `[NB16]`, which
   ties straight into `DOMAIN.md` §3's overburden systems.
2. **Grout the annulus.** Drip-tight `[NB16]`. Skip it and every later
   contamination event on that hole is your fault.
3. Drill open hole. **Yield accumulates only when you cut a fracture.** Long
   barren runs are correct and should feel it.
4. **Chloride check every 20 m** `[NB16]`. A rising chloride bar is a slow-motion
   disaster: cross **50 mg/L** and the correct answer may be to backfill a hole
   you have paid for.
5. Optional **hydrofracturing**: set the packer — **not too shallow** — and let
   a 100–200 bar tanker in `[NB16]`. High reward, with the sourced risks:
   contact with shallow groundwater, water pushed into neighbouring wells,
   sometimes permanently cloudy water.
6. **Water analysis** and **file the well record**, or the well is not approved
   `[NB16]`. Make the paperwork a real, small, satisfying final step.

**Geothermal — the anti-water-well.**

You do not want water; you want **length and contact**. Same drilling, different
scoring: depth achieved, hole straightness, and then the installation set piece —
pressure-test the loop to **≥ 3 bar** and inspect **not earlier than 30 minutes**
`[NB16]`, feed the loop, fit the cap so ice cannot lift it `[NB16]`, grout if the
hole must be sealed, and record the position to **±0.1 m** `[NB16]`.

A **spill of heat transfer fluid** is a full failure state with a defined
recovery: pump the loop empty, lift and repair or replace it, then pump the well
until the water neither tastes nor smells of it `[NB16]`.

**Water hammer wear = water consumption.** From §C.5.3: a worn hammer needs up
to **3× the flow** of a new one `[WAI35]`–`[WAI80]`. So the wear gauge for a
water hammer is not a hidden percentage — it is the **L/min readout climbing**
until it exceeds what the pump can deliver, at which point the hammer simply
stops working properly. That is the most legible, most physical wear mechanic
available anywhere in this game.

## G.8 What the cross-section must show that is unique

The section band (`GAMEDESIGN.md` §1, 46 % of the screen) currently draws strata
and a hole. For this family it must draw **the log being built**. Layered, from
the borehole outward:

1. **The borehole**, with **casing where casing is set** and the annulus grout
   as a distinct hatch.
2. **The strata**, revealed as drilled — unchanged.
3. **The water strike**, at the depth it happened, with the level then rising or
   falling to rest. Two marks, not one: *struck at* and *rested at*. Every real
   log has both.
4. **A log column** down the right edge of the section, filling as you go:
   - **SPT results** plotted as N against depth — a horizontal bar per test,
     with refusals drawn differently (`50/25`), and a second, ghosted bar for
     `N60` so the correction is *visible as a difference*;
   - **sample marks** — a small icon per sample, **colour-coded by quality
     class 1–5** `[GE-2009]`. This is the single most valuable new UI element
     in the pack: the player's whole performance, legible in one column.
5. **The CPT trace** — three thin scrolling curves (`qc`, `fs`, `u2`) plus the
   **SBT colour strip** `[ROB-SBT]`. Not a gauge: a *record*, that stays on
   screen and is the deliverable.
6. **The DP profile** — a blow-count histogram, with the torque reading as a
   shadow behind it.
7. **The installed monitoring well**, drawn correctly and to the sourced
   proportions `[OAR]`:
   - sump at the base;
   - **screen**, drawn slotted;
   - **filter pack** — extending **≤ 0.9 m above** and **≤ 0.3 m below** the
     screen, stippled;
   - **bentonite seal** — **≥ 0.9 m** of dry bentonite, drawn as a dense band,
     with a small "hydrating" animation before the grout goes in `[OAR]`;
   - **grout** to surface, drawn being tremied from the bottom up `[SEPA-DEC]`;
   - **cap**: top 2 m sealed, concrete cap **≥ 1 m wider** than the hole
     `[SEPA-DEC]`.
8. **The geothermal loop** — the U-bend at the bottom, two pipe runs to surface,
   and the grout column.
9. **The abandonment**, when a hole is condemned: the section fills from the
   base upward with the layered backfill `[SEPA-DEC]` specifies — permeable
   against aquifers, impermeable against aquitards. Losing a hole should be the
   most beautiful animation in the game.

**The unifying idea:** in the drilling half of Drillity the cross-section is a
*view*. In the site-investigation half it is the **product**. The player is not
watching the hole; they are drawing the log, and at the end of the contract the
log is what they hand over.

---

## Appendix — additions proposed for `FACTS_VERIFIED.md`

Every line ≤ ~150 characters, one idea, present tense, with a source key, per
that file's own style rules. Add these only after the source keys above are
added to its source list.

```js
// — Site investigation (ENG / standards) —
'An SPT is a test, not a bit. A 63.5 kg hammer falls 760 mm and you count blows. Nothing cuts.',                              // [D1586]
'N is the blows for the last 300 mm. The first 150 mm is the seating drive and it is thrown away.',                          // [D1586]
'Fifty blows in one increment is refusal. Log it as blows over penetration — never invent an N.',                             // [WIKI-SPT]
'An automatic trip hammer does not drill faster. It makes the energy repeatable, and that is what N is worth.',                // [SPT-CORR]
'Below three metres of rod the SPT correction is 0.75. The shallowest tests are the least reliable.',                         // [SPT-CORR]
'A split-spoon sample has an area ratio near 110 percent. Every one of them is a disturbed sample.',                          // [SPT-NOTES]
'A CPT cone is pushed at twenty millimetres a second and never turns. There is no hole and no sample.',                        // [D5778]
'Cone resistance, sleeve friction, pore pressure. Three channels, a reading every fifty millimetres, all the way down.',       // [D5778]
'A CPT rig that pushes twenty tonnes either weighs twenty tonnes or is screwed to the ground.',                                // [D5778]
'The cone reads soil behaviour, not grain size. A lab can call it sand and the cone can still call it clay.',                  // [ROB-SBT]
'Dynamic probing gives you two numbers. If torque climbs with the blow count, you are measuring your own rods.',               // [22476-2]
'Strength and stiffness need a class 1 sample. A thick-walled tube has never given one and never will.',                       // [GE-2009]
'Sonic recovers everything, in order. That is not the same as recovering it undisturbed.',                                     // [GE-2009] + [SONIC-SI]
'Sonic resonance falls as the string grows. Every rod you add moves the frequency you have to find.',                          // [SONIC-SI]
'A sonic bit does not cut. It pulsates, and the ground crumbles or is pushed aside.',                                          // [SONIC-SI]

// — Water well and geothermal —
'Case through the soil and at least two metres into solid rock, then grout it drip-tight. That is the well.',                  // [NB16]
'A household needs fifty to a hundred litres an hour. You are not drilling for depth, you are drilling for a fracture.',       // [NB16]
'Measure chloride every twenty metres. Past fifty milligrams a litre, the right answer may be to fill the hole in.',           // [NB16]
'Screen slot is chosen to hold ninety percent of the filter pack. The screen is not the filter — the pack is.',                // [WWJ-FP]
'Multiply the formation grain size by three to eight for the pack. Go past eight and you have built a sand pump.',             // [WWJ-FP]
'A water-powered hammer runs at fifty to a hundred and eighty bar and puts no oil in your aquifer.',                           // [WAI35]
'A worn water hammer does not slow down. It gets thirsty — up to three times the flow of a new one.',                          // [WAI60]
'No dust is why water hammers work in tunnels and in town.',                                                                   // [WAI35]

// — Environmental —
'An unsealed borehole is a pipe between two things that were never connected. That is the whole risk.',                        // [SEPA-DEC]
'Grout goes in through a tremie, from the bottom up. Dumped grout bridges and leaves voids.',                                  // [SEPA-DEC]
'Phenols can stop bentonite grout curing. The contaminant you came for can defeat the seal you brought.',                      // [SEPA-DEC]
'On a PFAS job, thread tape is contraband. So is waterproof paper, and so are your new boots.',                                // [EPA-PFAS]
'Low-flow sampling is done when three readings agree: pH to a tenth, conductivity to three percent, ORP to ten millivolts.',    // [EPA-LF]
'Never choke the tubing to slow a pump. The pressure drop degasses the water and takes the volatiles with it.',                // [EPA-LF]
'Control an artesian flow before you seal it. Easiest in late summer, when the head is at its lowest.',                        // [SEPA-DEC]

// — Competence —
'Plans are never enough. Locate, mark, then dig a trial hole by hand before anything mechanical goes in.',                     // [HSG47]
'Dig alongside a service, not above it. Insulated tools near cables, and never spike a spade in.',                             // [HSG47]
'A driller is expected to know the sample class their method can deliver. Not knowing is a recorded failure.',                 // [BDA]
'Five minor non-conformities and the whole audit fails. Minors can be fixed in twenty-one days; a major cannot.',              // [BDA]
'In Sweden a well that is not reported to the archive is not an approved well.',                                               // [NB16]
```

---

## Open items — what this pack did not close

Listed honestly so the next pass knows where to start.

1. **VDI 4640 Blatt 2 specific extraction rates (W/m by ground type).** The
   recognised design table for shallow geothermal, paywalled. Needed for a
   sourced "loop length per kW". Do not approximate it.
2. **Nordic sounding methods** — *viktsondering* (weight sounding),
   *Jb-totalsondering*, *hejarsondering*, and CPT-SU. Parameters not sourced.
   Important for a Nordic-set game.
3. **Absolute `qc` bands by soil type** in MPa. Use normalised `Qtn`/`Ic`
   (sourced, §A.2.5) until a citable table is found.
4. **Bjerrum's vane correction factor μ** vs plasticity index.
5. **Monitoring well slot sizes** in metric (0.5 / 1.0 mm) and the
   flush-threaded / no-solvent-cement rule — real practice, not yet sourced.
6. **Window sampler telescoping step sizes** — the 40–80 mm range is sourced
   `[VANWALT]`; the individual steps are not.
7. **Quantified IDW reduction for sonic** vs hollow-stem auger.
8. **EUR day rates** for onshore geotechnical roles. §D.4 explains why only UK
   annual salaries could be sourced, and how to label any derivation.
9. **ASTM D5092** (design and installation of groundwater monitoring wells) and
   **EN ISO 22282** (geohydraulic testing) full texts — both would firm up §A.7
   and §B.2.
10. **SPT test interval** down a borehole as a specified rather than customary
    figure.
