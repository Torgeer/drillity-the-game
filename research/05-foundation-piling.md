# 05 — Foundation engineering & piling

Research pack for **Drillity I The Game**, closing the gap identified in
`DESIGN_EXPANSION.md` §5 (Foundation: *"driven piling missing (impact hammers,
vibratory hammers, sheet piles — Talent's own 'Pile Driver' spec); diaphragm
wall / hydromill nominal only"*).

**Scope.** Twelve foundation methods, each a different machine and a different
job; the professions that run them; the machine silhouettes to model; the
hazards and their correct response; and a mechanics proposal that answers the
hard question — *what do the three sliders become when the method has no
rotation and no flush?*

**Rules obeyed.** Every claim carries a source: a local filename in
`C:\Users\henri\Downloads\` or a URL. Anything unsourceable is marked
`UNVERIFIED` or cut, per `PLATFORM_TRUTH.md` Part C. Manufacturer names appear
**only as citations**; no real model designation may ship as in-game content
(`DOMAIN.md` §6). German terms are captured throughout because Drillity's home
market is DACH + Nordics.

---

## Source key

### Local files (`C:\Users\henri\Downloads\`)

| Key | File |
|---|---|
| `[TOM]` | `pile-design-and-construction.pdf` — Tomlinson, M. J. & Woodward, J., *Pile Design and Construction Practice*, 5th ed., Taylor & Francis, 2008 (ISBN 0-415-38583-0). Section numbers cited. |
| `[JUN-PILE]` | `16291_Junttan_Piling_brochure_3_2013_WEB.pdf` — the five application families |
| `[JUN-HAM]` | `Junttan_Hammers_brochure_EN_2025_web.pdf` — hydraulic impact hammers + power packs |
| `[JUN-HHK]` | `HHK16-22S-Datasheet.pdf` |
| `[JUN-PM25H]` | `13915_Junttan_PM25H_Datasheet.pdf` |
| `[JUN-VH120]` | `Junttan_VH120_vibro-hammer_datasheet-1.pdf` |
| `[JUN-VIB]` | `Junttan_Vibratory_Hammers_brochure_2023_web.pdf` |
| `[EMDE-PF]` | `2-2-EMDE-Katalog-Pfahlbohren.pdf` — Kelly, augers, buckets, core barrels, casing, tremie, SOB/CFA, VdW/FOW, displacement, soilmix |
| `[EMDE-AN]` | `2-1-EMDE-Katalog-Ankerbohren.pdf` — Rammbohren, Überlagerungsbohren, Doppelkopfbohren, HDI 1-/2-fach |
| `[EMDE-SM]` | `EMDE-Soilmix.Systems.pdf` |
| `[EMDE-AD]` | `EMDE-Anchor-Drilling.pdf` |
| `[BAU-CFA]` | `2025_Productinfo_CFA_Anfaenger_EN.pdf` |
| `[BAU-FDP]` | `2025_Productinfo_FDP_Anfaenger_EN.pdf` |
| `[BAU-SCM]` | `2025_Productinfo_SCM_Anfaenger_EN.pdf` |
| `[BAU-CLAMP]` | `2025_Productinfo_Abfangschelle_EN.pdf` |
| `[BAU-DWS]` | `2025_Productinfo_DW-S_EN.pdf` |
| `[BAU-RSWS]` | `2025_Productinfo_RS-WS_EN.pdf` |
| `[BAU-KRRM]` | `2025_Productinfo_KR-RM-HF_EN.pdf` |
| `[BAU-KRWS]` | `2025_Productinfo_KR-WS-29_EN.pdf` |
| `[BAU-KBFK]` | `2025_Produktinfo_KBF-K_flach_high_EN.pdf` |
| `[BAU-SB]` | `2025_BMA_Productinfo_SB-SB-2_EN.pdf` |
| `[BAU-CAT]` | `geraetekatalog_catalog_of_machines_bauma_2025_bauer_maschinen.pdf` |
| `[BAU-KELLY]` | `Kelly_Bars_DE_EN_905_518_1_2.pdf` |
| `[KLEMM]` | `KLEMM_Lieferprogramm_Product_Range.pdf` (08/2025) |
| `[PAL]` | `PalPile-Brochure-2025.pdf` |
| `[PAL-WS]` | `PalPile-productsheet-16-11-23.pdf` (interlock waterstop) |
| `[RCD]` | `2022-12-PBA-brochure.pdf` — pile-top reverse-circulation drilling rigs |
| `[SSDR]` | `EPD_SSdr-pile_2022.pdf` |

### Standards and web sources

| Key | Source |
|---|---|
| `[EN1536]` | EN 1536:2010+A1:2015 *Execution of special geotechnical work — Bored piles*. Full text of the identical TS EN 1536:2010: https://regbar.com/wp-content/uploads/2019/09/TS_EN_1536_2010.pdf · catalogue https://standards.iteh.ai/catalog/standards/cen/d597649b-330a-4574-ac51-f0e218a9d935/en-1536-2010a1-2015 |
| `[EN12699]` | EN 12699:2015 *Displacement piles* — https://standards.globalspec.com/std/9927209/en-12699 |
| `[EN14199]` | EN 14199:2015 *Micropiles* — https://www.en-standard.eu/bs-en-14199-2015-execution-of-special-geotechnical-works-micropiles/ |
| `[EN1537]` | EN 1537:2013 *Ground anchors* — https://www.en-standard.eu/bs-en-1537-2013-execution-of-special-geotechnical-works-ground-anchors/ ; testing now prEN ISO 22477-5, see https://www.geplus.co.uk/technical-paper/technical-note-the-new-grouted-anchor-testing-standard-en-iso-22477-52018-08-10-2018/ |
| `[EN1538]` | EN 1538:2010+A1:2015 *Diaphragm walls* — https://www.en-standard.eu/bs-en-1538-2010-a1-2015-execution-of-special-geotechnical-works-diaphragm-walls/ |
| `[EN12716]` | EN 12716:2018 *Jet grouting* — https://standards.iteh.ai/catalog/standards/cen/9068ddb8-c5b2-4e26-8fb2-dd1204b98193/en-12716-2018 |
| `[PANDREA]` | Pandrea & Dausch, *The revised execution standard EN 12716 for jet grouting — amendments and changes explained*, XVII ECSMGE 2019, DOI 10.32075/17ECSMGE-2019-0368 — https://www.ecsmge-2019.com/uploads/2/1/7/9/21790806/0368-ecsmge-2019_pandrea.pdf |
| `[EN14679]` | EN 14679:2005 *Deep mixing* — https://knowledge.bsigroup.com/products/execution-of-special-geotechnical-works-deep-mixing |
| `[EN12063]` | EN 12063:2024 *Sheet pile walls* — https://standards.iteh.ai/catalog/standards/cen/a313690f-cedf-42ad-899e-c4f54a072605/en-12063-2024 |
| `[EN14731]` | EN 14731:2005 *Ground treatment by deep vibration* — https://standards.globalspec.com/std/525014/BS%20EN%2014731 |
| `[EC7]` | EN 1997-1:2004 *Eurocode 7 — Geotechnical design, Part 1* — full text https://www.ngm2016.com/uploads/2/1/7/9/21790806/eurocode_7_-_geotechnical_designen.1997.1.2004.pdf ; 2nd generation / EN 1997-3 overview https://www.issmge.org/uploads/publications/51/126/902_C_eurocode_7__second_generation__piled_foundations.pdf |
| `[EFFC]` | EFFC/DFI *Guide to Tremie Concrete for Deep Foundations*, 1st ed. — https://www.effc.org/content/uploads/2016/02/EFFC_Tremie_Concrete_Guide_Final.pdf ; 3rd ed. Dec 2024 — https://www.effc.org/publications/effc-dfi-guide-to-tremie-concrete-for-deep-foundations/ |
| `[FPS]` | Federation of Piling Specialists — https://www.fps.org.uk/ |
| `[FPS-WP]` | FPS working-platform guidance — https://www.fps.org.uk/working-platforms/ |
| `[FPS-PLANT]` | FPS plant guidance — https://www.fps.org.uk/guidance/plant-guidance/ |
| `[FPS-CRS]` | FPS courses — https://www.fps.org.uk/courses/ |
| `[CPCS]` | Construction Plant Competence Scheme (NOCN Group) — https://cpcs.nocn.org.uk/cpcs/ |
| `[AUSB]` | Spezialtiefbauer/in apprenticeship — https://www.ausbildung.de/berufe/spezialtiefbauer/ |
| `[KELLER-JET]` | Keller jet grouting technique page — https://www.keller.co.uk/expertise/techniques/jet-grouting |
| `[IND-PD]` | Indeed UK "Pile Driver" salary page — https://uk.indeed.com/career/piling-rig-operator/salaries (small sample; see §B7) |
| `[STEIN]` | Stein HT diaphragm wall page, citing DIN EN 1538 / DIN 4126 — https://stein-ht.de/en/capabilities/diaphragm-wall/ |

---

# A. The twelve methods

Every one of these is a different machine, a different tooling family, a
different failure mode and a different KPI. That is the whole design point: the
Foundation branch is not one method with skins.

## A0. The map — which standard governs what

| Method | Execution standard | German term |
|---|---|---|
| Bored piles (Kelly), CFA, cased CFA, barrettes | EN 1536 `[EN1536]` | Bohrpfahl / Schneckenortbetonpfahl |
| Driven piles, driven cast-in-situ, screw displacement (FDP), concrete sheet piles | EN 12699 `[EN12699]` | Verdrängungspfahl |
| Micropiles (drilled, < 300 mm) | EN 14199 `[EN14199]` | Mikropfahl / Kleinbohrpfahl |
| Ground anchors (grouted, stressed and tested) | EN 1537 `[EN1537]` | Verpressanker |
| Diaphragm walls, B ≥ 0.40 m | EN 1538 `[EN1538]` | Schlitzwand |
| Jet grouting | EN 12716 `[EN12716]` | Düsenstrahlverfahren |
| Deep mixing (CSM/DSM), min. depth 3 m | EN 14679 `[EN14679]` | Tiefreichende Bodenstabilisierung |
| Sheet pile walls, combi-walls, high-modulus walls | EN 12063 `[EN12063]` | Spundwand |
| Deep vibration, stone columns Ø 0.6–1.2 m | EN 14731 `[EN14731]` | Rütteldruckverdichtung / Rüttelstopfsäulen |
| Design verification for all of the above | EN 1997-1 `[EC7]` | Eurocode 7 |

Historical note worth a loading-screen fact: EN 1536 replaced the German
DIN 4014 for bored piles in June 1999, and EN 12699 replaced DIN 4026 for
displacement piles in May 2001 `[EN12699]`. Rig configuration and rig-imposed
ground pressures are covered by **DIN EN 16228** — every Bauer/RTG machine sheet
in `[BAU-CAT]` carries the line *"Rig configuration according CE / DIN EN
16228"*, and the revised jet-grouting standard now points at EN 16228-1 Annex F
for the loads a working platform must be designed to carry `[PANDREA]` §4.7.

The single hardest boundary to get right, and the one a real foundation engineer
will check: **EN 1536 stops at Ø 0.3 m and EN 14199 starts there.** EN 1536
covers bored piles with a shaft diameter 0.3 m ≤ D ≤ 3.0 m and a depth-to-width
ratio ≥ 5; barrettes with least dimension ≥ 0.4 m, largest/least ratio ≤ 6 and
cross-section ≤ 15 m² `[EN1536]` cl. 1.3. Micropiles below 300 mm are EN 14199
`[EN14199]`.

---

## A1. Driven piling — the impact hammer

**German:** Rammen / Rammpfahl. **Talent role:** Pile Driver.

### The pile

| Pile | Typical section | Notes |
|---|---|---|
| Precast reinforced concrete | Square 300×300 to 450×450 mm, 4 × Ø20–40 mm main bars, links 6–10 mm, cover ≥ 40 mm to links, fck 40 N/mm² `[TOM]` Table 7.2 | Maximum handling length is governed by the **pick-up points**: a 300×300 pile with 4 × Ø25 bars can be 11.0 m if slung at the head, 16.5 m at 0.33 length, 25.0 m at 0.2 length from head and toe `[TOM]` Table 7.2 |
| Precast, to EN 12794 | Concrete class C35/45–C60/70 `[TOM]` Table 2.4 | Prestressing steel ≥ 0.1 % of cross-sectional area `[TOM]` |
| Steel tube | Combi-wall king piles Ø 914.4 × 12.5 mm to Ø 1422.4 × 25.0 mm `[PAL]`; small drilled/driven Nordic tube piles in S460MH `[SSDR]` | Open end reduces end-bearing resistance while driving, but the plug has to be drilled out afterwards if it is to be cast in place `[TOM]` §3.2 |
| H-pile | — | Low-displacement; the section vibratory hammers like best `[JUN-VH120]` |
| Timber | — | Must stay below the water table; the failure mode is **brooming** and splitting of the toe `[TOM]` §1.4 |

Driven displacement piles routinely exceed 25 m in length and pile loads over
10 000 kN are feasible in the large diameters `[TOM]` §2.7.1.

### The hammer

A hydraulic impact hammer lifts a **ram block** and drops it on a **drive cap**
that sits on the pile head. Real ranges, from one manufacturer's current
catalogue `[JUN-HAM]`:

| Class | Ram block | Max energy | Stroke | Blow rate |
|---|---|---|---|---|
| Small | 3 000 kg | 35 kNm | 1 200 mm | 40–100 bpm |
| Medium | 9 000 kg | 106 kNm | 1 200 mm | 40–100 bpm |
| Large | 16 000 kg | 235 kNm | 1 500 mm | 30–100 bpm |
| Very large | 30 000 kg | 441 kNm (500 kNm on uprated hydraulics) | 1 500 mm | 30–100 bpm |
| High-blow-rate steel-pile series | 9 910–28 860 kg | 160–500 kNm | 1 000–1 200 mm | 40–180 bpm |

Two things a driller will look for and the game must get right:

1. **Energy is adjustable, and the low end matters as much as the high end.** A
   16 t ram hammer runs at **235 kNm at 30 blows/min or 12 kNm at 100
   blows/min** — the same machine, two completely different jobs `[JUN-HHK]`.
   You start soft and finish hard. Operating pressure 241 bar, oil flow
   565 l/min for that class `[JUN-HHK]`.
2. **Energy transfer.** A measured efficiency ratio of *more than 95 %* is
   claimed for a well-designed drive cap concentrating the blow on the pile
   centre `[JUN-HAM]`. Independently measured **hammer/cushioning system
   efficiencies**: hydraulic 65–90 %, winch-operated drop 40–55 %, diesel
   20–80 % `[TOM]` §3.1.6. That spread is the whole argument for hydraulic
   hammers and it is a perfect equipment-upgrade axis.

The ram block is **modular** on some hammer frames — one frame, several ram
weights, so the machine can be re-rated per job `[JUN-HAM]`.

### Helmet, dolly, packing — the consumables

Between hammer and pile sits a **helmet** holding a resilient **dolly** (cap
block), with **packing** between helmet and pile head `[TOM]` §3.1.8:

- Easy driving: elm block. Harder driving: oak, greenheart, pynkado or hickory,
  set **end-on to the grain**.
- Hard driving concrete or steel: plastic dollies — a phenolic resin reinforced
  with cross-grain cotton canvas laminations, bonded to aluminium plates or set
  between a steel top plate and a hardwood pad.
- Packing: coiled rope, hessian, thin timber sheets, coconut matting, wallboard
  or asbestos fibre (the last does not char under prolonged driving).
- **The helmet must NOT fit tightly on the pile head** — it has to allow the
  pile to rotate when it strikes an obstruction `[TOM]` §3.1.8.

The dolly and packing degrade during the drive; resilience of the cushioning
material changes with use, which changes the energy actually transmitted to the
pile head `[TOM]` §7.3. **This is a genuine consumable with a genuine
performance curve** — exactly the money sink `GAMEDESIGN.md` §5 asks for.

### Driving to set — the core mechanic

**Set** is the permanent penetration per blow. It is recorded as a blow count:

- Over the full depth of driving, blows are logged for **each 500 mm or each
  250 mm** of penetration.
- **In the final metre or so, sets are recorded in blows per 25 mm.**
- Sometimes the convention is inverted and final sets are recorded as the
  penetration achieved for **10 to 25 blows** of the hammer.
  `[TOM]` §11.3.1

**How a set is physically taken** — and this is a beautiful, animatable detail:
a sheet of graph paper is taped to the pile, a straight-edge is held
horizontally against the pile from a fixed support, and a pencil is drawn across
the paper during the impact. The resulting trace separates **temporary
compression** (elastic rebound of pile and soil) from **permanent set** `[TOM]`
§11.3.1, Fig. 11.5. Modern rigs also count strokes and measure penetration
electronically so that the crucial final blows are taken without anyone standing
next to the hammer `[JUN-PILE]`.

**Practical driving limits and refusal:**

| Threshold | Value | Source |
|---|---|---|
| Practical limit for *sustained* driving, diesel or hydraulic | **120–150 blows / 250 mm** | `[TOM]` §3.1.6 |
| Acceptable for *fairly short periods* | 200 blows / 250 mm | `[TOM]` §3.1.6 |
| API definition of refusal (where the contract says nothing else) | **> 300 blows/ft (248 blows/250 mm) sustained over 1.5 consecutive metres**, or **800 blows/ft (662 blows/250 mm) over 0.3 m** | `[TOM]` §3.1.6, quoting API |
| Max hammer drop to protect the pile | 1.5 m | `[TOM]` §1.4 |

**Why driving past refusal destroys the pile.** Stress-wave research showed the
wave travels head → toe and reflects. If the pile is driven onto hard rock the
sharp reflection at the toe can produce a **compressive stress at the toe twice
that at the head**; when long piles are driven into soil of low resistance the
reflection is **tensile**, and tension develops in the pile `[TOM]` §7.3
(Glanville et al.). And the trap: *cases have occurred where the measured set
per blow was due to the crushing and brooming of the pile toe, not to
penetration* `[TOM]` §1.4. **A "good" set can be the pile destroying itself.**

**Driving stress limits** (EN 12699, as tabulated in `[TOM]` Table 2.4):

- Concrete: calculated driving stress ≤ **0.8 fck**, with a **10 % increase
  permitted if driving stresses are monitored**.
- Steel: ≤ **0.9 fy**, with a **20 % increase if stresses are monitored**.

That "+10 % / +20 % if monitored" is a superb upgrade: buy the instrumentation,
unlock more hammer.

### Inferring bearing capacity

Three generations of technique, and the game should let the player climb them:

1. **Dynamic pile-driving formulae** (Hiley, Engineering News, Janbu, Danish).
   They assume the dynamic resistance to penetration equals the ultimate static
   capacity, then compute the set for a hammer of given rated energy `[TOM]`
   §7.3. `[TOM]` is blunt: these are *"now largely discredited as a means of
   predicting the resistance of piles"* (§1.4), and the manufacturer's rated
   energy is not a reliable input because hammer efficiency collapses with poor
   maintenance or misalignment (§3.1.6). Eurocode 7 penalises them explicitly:
   the correlation factor ξ is multiplied by **1.10 if a driving formula is used
   with measurement of quasi-elastic pile head displacement, and 1.20 if it is
   used without** `[EC7]` Annex A.3.3.3.
2. **Wave-equation driveability analysis** (Smith idealisation; GRLWEAP). The
   pile is modelled as masses and springs, with the hammer, helmet and packing
   as separate masses, shaft friction as springs and dashpots, and an end-bearing
   spring that acts only in compression. Inputs include hammer efficiency,
   elastic modulus and coefficient of restitution of the packing, soil quake and
   damping `[TOM]` §7.3. Output: predicted blow count vs soil resistance, and the
   stresses in the pile — i.e. *"select an energy level which will not damage the
   pile"* `[TOM]` §3.1.6.
3. **High-strain dynamic testing (PDA + signal matching / CAPWAP).** Pairs of
   **accelerometers and strain transducers mounted near the pile head** give
   force and velocity versus time for selected blows; a wave-equation model of
   the pile below the gauges is then tuned — adjusting resistance, quake and
   damping — until computed and measured force/time traces agree. The total
   assigned resistance is then the resistance at the time of driving `[TOM]`
   §7.3. The shape of the force/velocity plot also reveals **a broken pile**.
   - **Requirement:** the toe of a pile up to about 1 m diameter must move
     **≥ 2.5 mm** (preferably more) under the blow to mobilise enough soil
     resistance for a reliable result `[TOM]` §7.3.
   - **Honest calibration for the game's difficulty:** in a Netherlands field
     trial, specialist firms asked to predict the capacity of four instrumented
     precast piles returned a range of **90 to 510 kN for a pile whose static
     failure load was 340 kN** `[TOM]` §7.3.
4. **Static load test** — the referee. Eurocode 7 requires load tests when the
   pile type or ground has no comparable experience, and if only one pile is
   tested it must be at the most adverse location `[EC7]` §7.5.1. Correlation
   factors reward testing more piles: ξ₁ (on the mean) falls **1.40 → 1.30 →
   1.20 → 1.10 → 1.00** for 1, 2, 3, 4, ≥5 static tests `[EC7]` Table A.9. For
   dynamic impact tests the factors are higher and need more piles: ξ₅ = 1.60,
   1.50, 1.45, 1.42, 1.40 for ≥2, ≥5, ≥10, ≥15, ≥20 piles tested — **multiplied
   by 0.85 if signal matching is used** `[EC7]` Table A.11.

That last line is a whole progression tree on its own: *more tests and better
instrumentation buy you a smaller safety factor, which buys you a cheaper
foundation.*

### Re-drive and set-up

Driving resistance changes with time. Re-driving tests are advisable on
preliminary and random working piles, and the waiting periods are specific:
**within a few hours for granular soils, after 12 hours for silts, after 24
hours or more for clays.** If re-driving shows reduced resistance after about
20 blows, driving continues until the original final set is regained `[TOM]`
§11.3.1. A hammer must therefore carry **reserve energy to overcome set-up**
when re-driving a partly driven pile `[TOM]` §7.3.

### Noise — the reason urban jobs pay differently

Measured impact-driving noise at distance, standard vs silenced hammer
`[JUN-HAM]`:

| Distance | 10 m | 20 m | 50 m | 100 m | 400 m | 800 m |
|---|---|---|---|---|---|---|
| Standard | 115 dB | 109 dB | 101 dB | 95 dB | 83 dB | 77 dB |
| Silenced | 100 dB | 94 dB | 86 dB | 80 dB | 68 dB | 62 dB |

Noise depends on pile length, diameter, material and thickness, soil, hammer
and pile alignment, ram block mass and drop height `[JUN-HAM]`. Local
authorities frequently stipulate **70 dB(A) daytime and 60 dB(A) night** in
urban areas, and as low as **40 dB(A)** in sensitive areas `[TOM]` §3.1.7 — and
attenuating the noisiest hammers to 70 dB(A) unaided needs **more than 1 000 m**
`[TOM]` §3.1.7. Noise-abatement towers are real hardware: a sandwiched
steel/plastic/steel box around hammer and pile took a diesel hammer driving a
sheet pile from 118–119 dB(A) at 7 m down to 87–90 dB(A) at the same distance;
shrouding only the lower part of the hammer bought 3–4 dB(A) `[TOM]` §3.1.7.

Worker exposure (UK Noise at Work Regulations 2005): lower action value
**80 dB(A)**, upper **85 dB(A)**, peak action 135–137 dB(A); exposure limit
values **87 dB(A)** and **140 dB(A)** peak `[TOM]` §3.1.7.

### KPI the crew is judged on

**Piles driven per shift, to the specified set, without a rejected pile.**
Secondary: toe level achieved into the bearing stratum; position and verticality
within tolerance; no cracked heads; hammer hours per pile.

---

## A2. Driven cast-in-situ (DCIS)

**German:** Ortbetonrammpfahl. Governed by EN 12699 `[EN12699]`.

### The sequence

A closed-ended steel **working tube** with an **extraction collar** and a
**removable (sacrificial) tip** is driven into the ground with a hydraulic
hammer. At target depth the reinforcement is installed, fresh concrete is
placed into the tube, and the tube is extracted with a dedicated extraction
device — while the hammer's **tapping** function compacts the concrete against
the soil `[JUN-PILE]`.

Two ways to drive the tube, and they behave differently:

| | **Top driving** | **Bottom driving (internal drop hammer on a plug)** |
|---|---|---|
| Mechanics | The blow makes the tube expand and push the soil out at the instant of impact, then contract. That, plus flexure of the tube acting as a long strut, **releases shaft friction** as the tube moves down. | Tension is induced in the upper tube and the diameter contracts; the soil expands back and **friction increases** as the tube moves down. No flexure. |
| Risk | — | Tension can cause **circumferential cracking** of RC and thin-wall steel tubular piles. |
| Advantage | Can be driven open-ended (much lower end-bearing resistance during driving) | Produces a **dry open shaft** for concreting; economy in steel thickness and much less noise in easy driving |
| Source | `[TOM]` §3.2 | `[TOM]` §3.2 |

### The plug rules — hard numbers

When bottom driving on a concrete plug `[TOM]` §3.2:

- Compacted plug height **>= 2.5 x pile diameter**.
- Allow a **20–25 % volume reduction** from uncompacted to compacted height when
  batching.
- Plug mix 1:2:4, **water/cement ratio <= 0.25 by weight**, hard aggregate
  **max 25 mm**.
- **At least 10 initial blows at a drop not exceeding 300 mm**, then increase
  gradually.
- Maximum drop never above the maximum specified for the final set — usually
  **1.2 to 1.8 m**.
- **Driving on one plug must not exceed 1.5 hours.** Then add fresh concrete to a
  height not less than the pile diameter and drive for not more than another
  1.5 hours. For prolonged hard driving, renew the plug every **45 minutes**.
- Great care against **bursting the tube** by impact on the concrete when
  driving through dense granular layers or weak rock with stronger bands.

### Quality control

- **Record the quantity of concrete placed in each shaft against theoretical
  volume** — the check against soil collapse during tube withdrawal `[TOM]`
  §11.3.2.
- Check the level of the concrete as each batch is placed: a discrepancy
  indicates **necking** `[TOM]` §11.3.2.
- Record the volume in an enlarged base against the design base diameter.
- **Check the level of the reinforcing cage after withdrawing the drive tube on
  every pile** — the safeguard against the concrete being lifted with the tube
  `[TOM]` §11.3.2.
- Thin shell piles: inspect before concreting by shining a light down the hole,
  which reveals torn or buckled shells `[TOM]` §11.3.2.

Concrete for DCIS to EN 12699: class **C20/25–C30/37**, and **C25/30 for a
semi-dry mix**; cement content **325 kg/m3 in dry conditions, 375 kg/m3
submerged, 350 kg/m3 for semi-dry concrete** `[TOM]` Table 2.4.

### The machine

A DCIS rig is a heavy pile driver with an **extraction winch** rather than only
a hoist: a representative multipurpose machine in DCIS configuration has ~95 t
working weight, 30 000 kg leader capacity, a 5–7 t recommended ram, max pile
length 24 m, max working tube length 25 m and **max extraction 100 t**
`[JUN-PILE]`. That extraction figure is the whole design driver — pulling a
25 m tube out of the ground while it is full of concrete is the hard part, and
it needs "a reliable load control system" `[JUN-PILE]`.

### KPI

**Concrete over-supply ratio within tolerance and no necking.** Plus piles/shift
and cage level after extraction.

---

## A3. Vibratory driving and extraction

**German:** Rütteln / Vibrationsrammen; extraction = Ziehen.

### When it works

Vibrators — counter-rotating eccentric masses clamped to the pile — work best
**driving low-displacement piles (H-sections, open-ended steel tubes, sheet
piles) into loose to medium-dense granular soils** `[TOM]` §3.1.5. Claimed
average rate of driving in favourable ground: **18 m per minute** `[TOM]`
§3.1.5.

### When it does not

- **Not very effective in firm clays; cannot drive piles deeply into stiff
  clays** `[TOM]` §3.1.5.
- Ideally a pile should be vibrated at or near its **natural frequency** — which
  for a 25 m steel pile is about **100 Hz**. Most vibrators run at 10–39 Hz, so
  only high-frequency machines are really effective for long piles `[TOM]`
  §3.1.5.
- Common US practice where there is no test data: **vibrate the pile to within
  3 m of expected penetration, then finish with an impact hammer** to the
  bearing layer `[TOM]` §3.1.5. That is a two-tool sequence worth modelling.
- In fine soils, frequencies above 40 Hz and high amplitude are needed, but
  carry the risk of **liquefaction and thixotropic transformation** of the soil
  `[TOM]` §3.1.5.
- Predicting vibratory driving performance "is still not very reliable"
  `[TOM]` §3.1.5 — an honest source of in-game variance.

Suggested working parameters (Rodger & Littlejohn, via `[TOM]` §3.1.5):
**10–40 Hz at 1–10 mm amplitude** for granular soil with low point resistance;
**4–16 Hz at 9–20 mm amplitude** for high point resistance.

### Extraction — the vibrator's best trick

"After concreting the pile the vibrators are used to extract the casings and
are quite efficient for this purpose in all soil types" `[TOM]` §3.1.5. They
are also used in bored piling to **seal the borehole casing into clay** after
pre-drilling through granular overburden — the "mudding-in" technique `[TOM]`
§3.3.8.

### Real machine numbers

Free-hanging normal-frequency vibratory hammer range `[JUN-VIB]`:

| Class | Eccentric moment | Centrifugal force | Frequency | Amplitude | Max pull | Dyn. weight |
|---|---|---|---|---|---|---|
| Small | 25 kgm | 795 kN | 1 700 rpm | 22 mm | 470 kN | 2 270 kg |
| Medium | 50.2 kgm | 1 409 kN | 1 700 rpm | 24 mm | 706 kN | 4 130 kg |
| Large | 120 kgm | 2 846 kN | 1 480 rpm | 26 mm | 1 059 kN | 9 145 kg |
| Very large | 203.2 kgm | 4 380 kN | 1 400 rpm | 19 mm | 1 880 kN | 21 700 kg |

Clamps are a separate, chosen item: a sheet-pile clamp at **3 560 kN clamping
force, 2 553 kg**, or a casing clamp for **Ø 520–2 000 mm at 1 858 kN x 2**, or
a four-jaw version for **Ø 1 000–3 000 mm at 1 858 kN x 4** `[JUN-VH120]`. A
free-hanging unit needs a **power pack** — e.g. 1 460 l/min at 350 bar from
2 x 405 kW diesels, 13 100 kg `[JUN-VH120]`. Leader-mounted rig vibrators are
the other family: 1 500 kN max centrifugal force, 2 500 rpm, 5 070 kg, 480 kW
hydraulic, max recommended pile weight 7 000 kg, with an automatic
clamp-coupling system and a "sheet pile assistant" `[BAU-CAT]`. Dipper-arm
mounted vibrators on hydraulic excavators have high power-to-weight but are
**limited by the headroom under the bucket — say 6 m at best** `[TOM]` §3.1.5.

### Vibration near buildings — the constraint that defines urban work

**The start-up and shut-down problem.** A standard, constant-eccentric-moment
vibrator passes through a **critical frequency** on the way up to and down from
operating speed. That transient can resonate with the natural frequency of
nearby buildings and produces "a short period of high amplitude vibrations
which are quite alarming to the occupants" `[TOM]` §3.1.5.

**The fix is mechanical and it is worth modelling.** Variable-moment machines
carry a phase shifter that moves the eccentric masses from **balance (0 degrees,
no resultant force) to full unbalance (180 degrees)** under remote control. The
machine is started and stopped with the masses balanced, so it passes through
the critical frequency generating nothing, then the moment is dialled up
`[JUN-VIB]`. High-frequency (> 30 Hz) variable-moment vibrators with automatic
adjustment "virtually eliminated this start-up and shut-down 'shaking zone',
reducing peak particle velocity to levels as low as 3 mm/s at 2 m" — at the cost
of being less powerful than the standard units `[TOM]` §3.1.5.

**Damage thresholds** (BS 5228 recommended thresholds to avoid non-structural,
"cosmetic" damage, at 10–50 Hz) `[TOM]` §3.1.7:

| Building | Intermittent vibration | Continuous vibration |
|---|---|---|
| Residential | **10 mm/s ppv** | **5 mm/s ppv** |
| Heavy and stiff buildings | 30 mm/s | 15 mm/s |

Protected buildings, buildings with existing defects and statutory services are
subject to specific lower limits `[TOM]` §3.1.7. And the caveat a real engineer
will nod at: "there is little evidence to show that ground-borne vibrations
cause structural damage to buildings" — the driver is usually complaint and
the **human response**, not collapse `[TOM]` §3.1.7. Basic sound levels for
vibratory hammers driving steel bearing piles can still be **around 120 dB(A)**
`[TOM]` §3.1.7.

`UNVERIFIED`: the German DIN 4150-3 guideline ppv table (the DACH equivalent of
the BS 5228 thresholds above). It is the number a German site would actually be
held to, and it should be sourced before any German-region contract quotes a
figure.

### KPI

**Metres per minute at ppv below the neighbour limit.** Miss the ppv and the job
stops, whatever your production.

---

## A4. Sheet piling

**German:** Spundwand. EN 12063:2024 covers sheet pile walls, combined pile
walls, high-modulus walls, synthetic, precast concrete and timber sheet piles
`[EN12063]`.

### The sections and the interlock

Hot-rolled sheet piles come as **Z-profiles** and **U-profiles**; there is also
a cold-formed family and trench sheets `[PAL]`.

| Family | Width | Elastic modulus | Wall weight | Height | Steel grades |
|---|---|---|---|---|---|
| Hot-rolled Z | 630 / 700 mm | 1 675–4 015 cm3/m | 105.7–188.8 kg/m2 | 374–511 mm | S240GP, S270GP, S355GP, S390GP, S430GP, S460GP to EN 10248-1 |
| Hot-rolled U | 600 mm | 744–2 117 cm3/m | 77.2–133.6 kg/m2 | 310–320 mm | S240GP … S430GP to EN 10248-1 |
| Cold-formed | 694–1 504 mm | — | — | 250–345 mm | S235, S275, S355 |

All `[PAL]`. Tolerances to EN 10248-2, certificates to EN 10204/3.1, **maximum
delivered length 24.00 m**, packed as free sections or bundles of max 5 000 kg
`[PAL]`. Flange thicknesses run 8.5–16.0 mm and webs 8.5–13.5 mm on the Z range
`[PAL]` — the single number that governs corrosion allowance and drivability.
Sections are also supplied with **extra thickness to compensate for loss of
thickness due to corrosion** `[PAL]`.

**The interlock** is the whole idea: it is what makes a row of sections into a
wall. Processing available on interlocks includes **pairing, welding or
crimping, cutting, shot blasting/coating and water tightening** `[PAL]`.
Waterproofing is a chemical product, not a detail: a one-component polyurethane
hydro-swelling mastic applied in an uninterrupted band at least 10 mm wide and
high, which **swells to approximately 350 % of its original dry volume** on
contact with moisture and becomes firm in 24–36 hours; against fresh concrete it
needs **at least 7 mm of cover on both sides** so the expansion pressure does
not crack the concrete `[PAL-WS]`.

### Combined walls and pipe walls

Where a sheet wall is not stiff enough, **king piles** (large steel tubes) carry
the bending and sheet piles infill between them. Real combinations `[PAL]`:

| King pile | Infill | System width | Elastic modulus | Allowable moment, S355 |
|---|---|---|---|---|
| Ø 914.4 x 12.5 mm | double Z | 2 364 mm | 3 802 cm3/m | 1 350 kNm/m |
| Ø 1 219.2 x 15.9 mm | double Z | 2 669 mm | 7 037 cm3/m | 2 498 kNm/m |
| Ø 1 422.4 x 25.0 mm | double Z | 2 872 mm | 13 394 cm3/m | 4 755 kNm/m |

A **pipe wall** is a continuous wall of interlocked steel pipes, commonly
Ø 219.1–406.4 mm, **usually installed with a DTH drilling hammer** — the
crossover point between the foundation branch and the DTH branch of the game.
Pipes in S355J2H and S460MH, interlocks in S355/S430 supplied in 12.0 m lengths,
standard pipe spacing 64 mm (also 75, 88, 100 mm), lock welding to EN 1090
EXC2/EXC3, ring bits weldable on request, and an optional **injection channel**
in the female interlock. Male/female interlock max tensile capacity
3 419 kN/m `[PAL]`. Combi-wall pipes and pipe piling for jetty structures can be
fitted with **pile shoes** to ease driving in hard soils and give a solid
footing `[PAL]`.

### Pitching, and panel vs pitch-and-drive

- **Pitch-and-drive**: pitch one pile, thread its interlock into the previous
  one, drive it to depth, move on. Fastest, least plant, but errors accumulate
  and the wall leans or fans out of plumb.
- **Panel driving**: pitch a whole panel of piles into a guide frame first,
  interlocked to each other, then drive them down in stages so the panel stays
  in plane. Slower, far better verticality control, and the more reliable
  approach in hard or variable ground.
- EN 12063 requires the driving method and equipment to be selected on
  comparable experience; where that does not exist, "driving tests or a
  mathematical analysis of the driving process should be adopted" `[EN12063]`.
- EN 12063 specifies tolerances for plan position of the pile top and for
  verticality **measured over the top 1 m**, with different values for primary
  elements of combined walls, on land, and over water; the 2024 edition adds new
  annexes on tolerances for tubular piles and on ground movement `[EN12063]`.
  `UNVERIFIED`: the numeric tolerance values themselves — do not put a number in
  the game without the clause.

### Press-in — the silent option

Hydraulic press-in drivers push sheets in with static force instead of
hammering. A push-pull unit with **2 078 kN pressing force** runs at **around
60 dB(A)** and installs and extracts without vibration. It can be crane-suspended
or mounted on a crawler rig with over 20 tonnes of pulldown on a **rigid**
leader — hanging leaders are not suitable. A self-reacting press-in rig walks
along the wall taking reaction from the sheets already installed and needs a
service crane to pitch the piles; in hard ground it can pre-drill or water-jet
to assist `[TOM]` §3.1.7. **This is the urban, night-work, hospital-adjacent
tool** and belongs behind a contract gate.

### KPI

**Metres of wall per shift with the interlocks intact and the wall in plane.**
A declutched interlock is the failure — the wall is no longer a wall.

---

## A5. Bored piles — the Kelly rig

**German:** Bohrpfahl (Kellybohren). EN 1536 `[EN1536]`.

### The machine's core idea

A telescopic **Kelly bar** hangs from a rotary drive (Kraftdrehkopf, KDK) on the
mast. It transfers **torque and crowd simultaneously** to the tool. A Kelly bar
is 2 to 5 telescopic tubular sections with drive keys welded on their outer
surfaces — standard bars carry **6 drive keys per section** — in high-tensile
steel to keep weight down `[BAU-KELLY]`. Two families:

- **Friction Kelly** — torque is carried by friction between keys and boxes; it
  cannot transmit full torque at full extension.
- **Interlocking / locking Kelly** — mechanical locks between each element and
  between the outer bar and the rotary drive, so **maximum torque is transferred
  over the full extended length** `[EMDE-PF]`, `[BAU-KELLY]`.

That distinction is already in `DOMAIN.md` §4 and `FACTS_VERIFIED.md`; it is
correct and it is the single most useful Kelly fact for a shop tooltip.

**Drilling depth is arithmetic, and it makes a great HUD readout** `[BAU-KELLY]`:

```
T = B + W − H
```

where `T` = drilling depth, `B` = Kelly length fully extended, `W` = tool
length, `H` = height of the rotary drive above ground level. (For the locked
case, use `B1`, the extended *locked* length.) Add the crowd-system stroke `S`
and you have the whole geometry the player is fighting.

Real Kelly bar sizes `[EMDE-PF]` — designation reads
*torque [kNm/10] / number of sections / transport length*:

| Torque class | Sections | Drilling depth | Outer pipe Ø | Weight |
|---|---|---|---|---|
| 100 kNm | 3 | 17–35 m | 292 mm | 3 250–5 350 kg |
| 200 kNm | 3–4 | 21–52 m | 343–394 mm | 4 900–10 100 kg |
| 300 kNm | 3–4 | 24–60 m | 394–470 mm | 6 350–12 900 kg |
| 400 kNm | 3–4 | 24–60 m | 470–546 mm | 7 850–15 850 kg |

Standard tool joint **Kelly box SW 200** (200 mm square) covers drilling tools
up to 250 kNm `[EMDE-PF]`, `[BAU-SB]`. Kelly bars can also be supplied with a
**noise damping system** — absorption pads glued between the drive keys on the
outer section, protected by sheet metal, targeting the high-frequency emission
that jerky Kelly movements generate through the hollow sections `[BAU-KELLY]`.

### The tooling — and it is chosen by the ground

This is where a foundation game earns its authenticity. Tools are selected by
soil, not by size `[EMDE-PF]`, `[BAU-SB]`, `[BAU-KBFK]`, `[BAU-KRWS]`,
`[BAU-KRRM]`:

| Tool | Ground it is for | Notes |
|---|---|---|
| Auger, single-start, flat teeth (FM) + fishtail pilot | Common soft to firm soil, cohesive sand, damp clay, loam, marl | Standard useable length NL = 1 500 mm; cutting Ø 500–2 300 mm |
| Auger, single-start, round-shank chisels (RM) + RM pilot | Low-cohesive, mixed-grained, compacted sand and gravel; soft decomposed laminated soft rock | More teeth than the FM version at the same diameter |
| Auger with Hardox cutting edge (BSES) / with calibration ring (BSES-K) | Compacted gravel, compact fine and medium gravel, brittle medium-hard rock | The calibration ring keeps the bore on gauge |
| Double-start augers | Recommended above Ø 900 mm casing diameter | Two flights, two cutting edges |
| Progressive / tapered augers (BSEP, BSZP) | Heavy ground, rock | Stepped cutting profile |
| Auger, generic (SB / SB-2) | Soft to stiff cohesive; loose to medium-dense non-cohesive. **SB-2 preferred for uncased deep boreholes or large diameters** | Lengths 1 700 / 2 250 mm |
| Drilling bucket | Cleaning the bore bottom, sandy and loose soils; and the general excavating tool below the water table | Revolving bottom in wear bushings; automatic or manual hinged-bottom release; **ventilation tube inside to avoid a vacuum when extracting**; lower third and bottom edges armoured |
| Rock drilling bucket with collar plate, flattened base | Water- or suspension-filled boreholes; very dense sand and gravel; **light to medium-hard rock < 50 MPa** | The flattened base vents the borehole and prevents vacuum, allowing maximum pulling speed; the collar plate increases verticality and centring |
| Core barrel with replaceable teeth | **Coring through reinforced concrete; thin rock layers < 150 MPa; boulders** | Complete cutting ring available as a spare; teeth repairable on site |
| Core barrel with tungsten-carbide pins | **Very hard rock and heavily reinforced concrete** | 22 carbide pins on a Ø 600 barrel |
| Core barrel with round-shank bits | **Rock up to medium hardness (< 100 MPa) and unreinforced concrete** | 6 RM bits on a Ø 600 barrel |
| Roller-bit core barrel with helix flush | **Hard rock > 100 MPa; compact rock** | Three roller-bit types; helix transports material toward the cover; carries a **parameter plate specifying speed and feed by diameter** |

Note that last line: the tool itself carries **a plate telling the operator what
rotation speed and feed to use at that diameter** `[BAU-KRRM]`. That is a real,
in-world justification for the game's sweet-spot band being different per tool.

### Cased or uncased

- **Uncased**, with the bore standing on its own strength — only in stable
  ground, and even in stiff fine-grained soils casings are desirable because
  those soils are frequently fissured or contain sand pockets that collapse and
  leave loose soil at the pile toe `[TOM]` §3.3.8.
- **Cased** with a temporary casing string driven or oscillated ahead of the
  bore. Casing families `[BAU-RSWS]`, `[BAU-DWS]`:
  - **Single-wall casing with a separately attached cutting ring and replaceable
    teeth** — continuous smooth drill string so the drilling tool cannot catch.
  - **Double-wall casing with spiral reinforcing bars between inner and outer
    tube** — higher stability and dimensional stability specifically **for use
    with casing oscillators**.
  - Both: wear-resistant thread and conical rings, easy to replace; modular
    lengths **500–5 000 mm**, diameters **Ø 620–2 500 mm**; optional sealing on
    casing connectors and screws to make the string watertight; **feather keys
    for positioning only — explicitly not for transmission of force.**
  - A **casing clamp (Abfangschelle)** holds the string while it is dismantled;
    one standard wedge covers all diameters within nominal ±20 mm
    `[BAU-CLAMP]`.
- **Under support fluid** (bentonite or polymer). EN 1536 requires an excavation
  under support fluid to be protected by a lead-in tube, or a guide wall for a
  barrette `[TOM]` §3.3.8.

### Support fluid — the numbers that matter

EN 1536 Tables 1 and 2 `[EN1536]`:

| Property | Fresh suspension | Before concreting | For re-use |
|---|---|---|---|
| Density | < 1.10 g/cm3 | **< 1.15 g/cm3** (up to 1.20 in special cases — saline water, very soft soil) | — |
| Marsh value | 32–50 s | 32–50 s | 32–60 s |
| Fluid loss | < 30 cm3 | — | < 50 cm3 |
| pH | 7–11 | — | 7–12 (indicative) |
| Sand content | — | **< 4 % by volume** (up to 6 % for special cases, e.g. friction or unreinforced piles) | — |
| Filter cake | < 3 mm | — | < 6 mm |

Marsh value is the time for 946 ml to pass the cone orifice; test methods to
EN ISO 13500 `[EN1536]`. Bentonite gels when static and goes mobile when
agitated — thixotropic. In granular soil it penetrates the wall and gels there
as a **filter cake**; in clay it does not penetrate and the support is purely
the hydrostatic pressure of a fluid at around **1 040 kg/m3** `[TOM]` §3.3.8.
Practical warnings from the same source: if the mud becomes flocculated and
sand-charged to a density **greater than 1 350–1 400 kg/m3 it must be replaced
by a lighter mud before concreting** and the base cleaned; an overloaded slurry
forms a thick filter cake that concrete will not scour off, and a mechanical
scraper may be needed; a **minimum pile diameter of 600 mm** is recommended for
slurry-supported piles `[TOM]` §3.3.8. Polymer support fluids cost more up
front but recycle without the constant de-sanding bentonite needs, leave a much
thinner and more easily scoured filter cake, and dispose differently — waste
bentonite is handled as hazardous waste `[TOM]` §3.3.8.

### Cleaning and the clock

- Final clean-up removes crumbs of soil and trampled puddled clay from the pile
  base and lumps of clay adhering to the bore wall or lining tubes `[TOM]`
  §3.4.6.
- **The time between final cleaning-up and placing concrete should not exceed
  6 hours.** If there is any appreciable delay, re-check the depth of the pile
  bottom against the measured drilled depth before concreting, to prove nothing
  has fallen in `[TOM]` §3.4.6.

That is a **real, hard, in-game timer** and it is the best mechanic in the whole
bored-pile cycle.

### Concrete and cage

EN 1536 `[EN1536]`:

- Cement content **325 kg/m3 dry placement, 375 kg/m3 submerged**.
- Fines (< 0.125 mm, incl. cement) **400 kg/m3** for coarse aggregate > 8 mm,
  **450 kg/m3** for ≤ 8 mm.
- Max aggregate **32 mm, or ¼ of the clear spacing between longitudinal bars,
  whichever is smaller**. w/c **≤ 0.60**. Strength typically **C20/25–C45/55**.
- Consistence targets (flow diameter / slump):
  - dry placement or pumped — **500 ± 30 mm / 150 ± 30 mm**
  - tremie under water — **560 ± 30 mm / 180 ± 30 mm**
  - tremie under support fluid — **600 ± 30 mm / 200 ± 30 mm**
  - for long pours, "a minimum slump of 100 mm after 4 h is common practice"
- Cover: **75 mm barrettes, 60 mm for D > 0.6 m, 50 mm for D ≤ 0.6 m**; raised
  to 75 mm for uncased piling in soft soil, for submerged placement with 32 mm
  aggregate, where silica fume is used, where the cage is inserted after
  concreting, or where bore walls are uneven; reducible to 40 mm to the external
  face of a permanent casing.
- Reinforcement: minimum **4 bars of Ø 12 mm**; maximum longitudinal spacing
  **400 mm**; minimum horizontal clear distance **100 mm** (80 mm at lap length
  if max aggregate ≤ 20 mm); links/hoops/helix at least max(6 mm, ¼ of the
  longitudinal bar diameter).

`[TOM]` §3.4.6 adds the practical version: slump **100–180 mm** to EN 1536, a
mix that is **self-compacting and does not require ramming or vibrating**, and a
dry mix for the first few charges if the pile base is wet. Also: use widely
spaced stiff hoops rather than helical binding so the cage cannot twist or
buckle, and keep a generous space between bars so concrete flows outward to the
bore wall `[TOM]` §3.4.6.

### Tremie concreting — and why you never let the level drop

Underwater or under-slurry, concrete must be placed by **tremie**: a pipe run to
the bottom of the bore, charged with concrete behind a bung, then lifted
slightly to start flow. The concrete builds from the bottom up and displaces the
water or slurry — it never falls through it.

EN 1536 clause 8.4.3, verbatim rules `[EN1536]`:

| Rule | Value |
|---|---|
| Tremie internal diameter | **≥ 6 × max aggregate size, or 150 mm, whichever is greater** |
| Tremie max outside diameter | **≤ 0.35 × pile diameter** (or casing ID); ≤ 0.6 × inner cage width for piles; ≤ 0.8 × inner cage width for barrettes |
| At start | Pipe extends to the bottom of the bore; a bung/plug is required |
| **The rule** | *"The pipe shall at all times remain immersed in unset and workable concrete … and shall not be withdrawn … until completion"* (8.4.3.15) |
| Minimum immersion, general | **1.5 m**, particularly when disconnecting sections of pipe and casing |
| Minimum immersion, D ≥ 1.2 m | **2.5 m** |
| Minimum immersion, barrettes | **3.0 m**, particularly with two or more tremie pipes |

The EFFC/DFI guide adds the working practice around those minima `[EFFC]`:
**3 m minimum is well accepted in practice**; near the end of a pour the
immersion may be reduced to **2 m**; the UK ICE SPERW caps **maximum embedment
at 6 m** (raised to **12 m for bored piles ≤ 750 mm diameter**); before the
first cut of a tremie pipe **a minimum of 5 m** of embedment is usually
required; minimum tremie section-to-cut length **3 m**; and the initial plug is
released by lifting the pipe **100–200 mm**. With two or more tremies, their
bases must be kept at the same level.

Practical additions from `[TOM]` §3.4.8: inflow of a few centimetres in five
minutes can be baled and sealed with dry concrete, but a strong flow will wash
the cement out entirely; **let the water rise to its rest level and top it up to
at least 1.0 m above that to stabilise the base**; use a flap valve on the tremie
end rather than a plug or polyethylene go-devil; **do not use a bottom-opening
skip instead of a tremie** — the crane operator cannot tell from the rope
whether the bucket is at the right level in the fluid concrete, and releasing
early washes the cement out while plunging deep disturbs concrete already
placed.

Bentonite-specific: there must be enough hydrostatic pressure of concrete in
the tremie above bentonite level to **overcome the external slurry head, rupture
the gel, and overcome friction in the pipe** — a documented case needed a
1 600 kg/m3 mud to hold 18–21 m boreholes open and the concrete then failed to
displace the stiffened gel until a plasticiser plus retarder was used and the
tremie was lifted out in one piece rather than broken joint by joint `[TOM]`
§3.4.8.

### Casing extraction

EN 1536 clause 8.4.4 `[EN1536]`:

- Do not start extraction until the concrete column is high enough to generate
  excess pressure against water and soil inflow **and against cage uplift**.
- During extraction, maintain a sufficient **quantity and head of concrete
  inside the casing** to balance external pressure, so the annular space the
  casing vacates is filled with concrete.
- Supply rate and withdrawal speed must prevent inflow **even on a sudden drop
  of the concrete level when a cavity is uncovered.**

Casting tolerance for cut-off level below the platform (ICE Specification, in
metres, where H is the depth below the commencing surface and C is the length of
temporary casing) `[TOM]` §3.4.6:

- dry bore, permanent casing or cut-off in stable ground below the casing base:
  `0.3 + H/10`
- dry bore, temporary casing: `0.3 + H/12 + C/8`
- **under water or drilling fluid: `1.0 + H/12 + C/8`**

Note it is the **casing length**, not the diameter, that drives the tolerance —
which reflects where the trouble actually is: extracting the temporary casing
`[TOM]` §3.4.6.

### Position and verticality tolerances

EN 1536 clause 8.1 `[EN1536]`:

| Item | Tolerance |
|---|---|
| Plan position at working platform level, D or W ≤ 1.0 m | **e ≤ 0.10 m** |
| 1.0 m < D or W ≤ 1.5 m | e ≤ 0.1 × D |
| D or W > 1.5 m | e ≤ 0.15 m |
| Verticality, vertical piles and rake < 1:15 | **i ≤ 0.02 (1:50)** |
| Raking piles (rake 4° to 15°) | i ≤ 0.04 (1:25) |
| Enlargement centre deviation | e ≤ 0.1 × D |
| Reinforcement cage top elevation after concreting | ±0.15 m |
| Trimming / cut-off level | +0.04 m / −0.07 m |

EN 12699 for displacement piles: plan location tolerance at working level
**100 mm**, deviation **40 mm/m** for both vertical and raking piles — and these
deviations must be taken into account in the design `[TOM]` §3.4.12.

### KPI

**Concrete over-supply ratio, tremie never surfaced, cage at level, hole open
less than 6 hours.** Metres are secondary. A bored pile crew is paid on
integrity.

---

## A6. CFA — continuous flight auger

**German:** Schneckenortbetonpfahl (SOB). Governed by EN 1536 `[EN1536]`; the
records must include **the pitch of the screw** and the data-logger factors —
penetration per revolution, drilling-motor torque, and grout/concrete pumping
pressure `[TOM]` §11.3.3.

### The method in one paragraph

A **continuous flight auger** with a **hollow stem**, plugged at the bottom, is
screwed to full depth in one pass. The bore is supported the entire time by the
auger flights and the soil sitting on them. At depth, high-slump concrete is
pumped down the hollow stem; **once sufficient pressure has built up**, the
auger is withdrawn at a controlled rate, bringing the spoil up on the flights
and leaving a shaft of fluid concrete to ground level. Reinforcement is then
pushed or vibrated into the fresh concrete `[TOM]` §2.4.2, §3.4.7.

### The rule

**Never lift the auger dry.** `FACTS_VERIFIED.md` already states this and it is
correct. The mechanism: the flights and their soil are the only thing holding
the bore open; the moment the auger rises without concrete filling the void
behind it, the bore collapses and you have a discontinuity, a neck, or nothing
at all. `[TOM]` §2.4.2 frames it as the reason CFA "depends for its integrity
and load-bearing capacity, as much as any other in-situ type of pile, on strict
control of workmanship" — and notes that unlike a conventional bored pile **you
cannot inspect the stratification or the soil quality during installation.**

### Geometry and tooling

| Item | Value | Source |
|---|---|---|
| Hollow stem bore | **100 or 127 mm** | `[TOM]` §3.4.7 |
| Concreting line in the starter | **Ø 120 mm**, outlet between the cutting edges | `[BAU-CFA]` |
| Concreting inner diameter, alternative range | 125–200 mm | `[EMDE-PF]` |
| Pile diameters, standard starters | 500, 550, 600, 630, 750, 770, 880, 1 000, 1 180 mm | `[BAU-CFA]` |
| Pile diameters, alternative system | 400–1 200 mm | `[EMDE-PF]` |
| Flight pitch | 100–150 mm (small Ø), 100–300 mm (mid), 250–400 mm (large) | `[EMDE-PF]` |
| Auger section useable lengths | 1–9 m | `[EMDE-PF]` |
| Central pipe | 168 × 20, 178 × 25, 203 × 40 mm, or 445 × 10 with 146 × 10 | `[EMDE-PF]` |
| Couplings | hexagonal or octagonal standard; claw coupling with link-chain securing on request | `[EMDE-PF]` |
| Starters | with side-opened or centrally/radially-opened concrete outlet; **double-start starters recommended** | `[EMDE-PF]` |
| Cutting geometries | flat teeth (AF, AF-2), flat teeth with collar plate (AF-K, AF-K2), round-shank chisel with collar plate (AFF-K, AFF-K2) | `[BAU-CFA]` |

### Ground limits — the numbers that decide whether CFA is even allowed

`[BAU-CFA]` states the application envelope directly:

- **Cohesive, friable soils. No boulders.**
- **CFA: undrained shear strength cu > 15 kN/m2.**
- **Cased CFA (CCFA): UCS < 20 MPa.**

And the failure modes at the edges of that envelope `[TOM]` §2.4.2:

- **Flighting** — vertical movement of the soil on the auger relative to the
  soil on the bore wall. In loose silty sands, over-rotation disturbs the
  surrounding soil and **can reduce shaft resistance by 30 %.**
- **Polishing** of the shaft in stiff clays, from over-rotation.
- Standard CFA may fail to penetrate stiff clayey soils and glacial till, with
  **refusal before design depth** and problems of flighting, shaft waisting and
  discontinuities.
- Doubt about whether the injected concrete has flowed out to cover the whole
  drilled area at the toe — so it can be prudent to **assume a base diameter
  smaller than the shaft**, or a conservative allowable end-bearing pressure.
- CFA is best where **most of the working load is carried in shaft friction**
  and the ground is free of cobbles and boulders.

### Reinforcement

Cages are **pushed into the fluid concrete to about 12 m**; exceptionally, 17 m
cages have been pushed into 30 m piles. Vibrators may be used to assist
penetration `[TOM]` §2.4.2. Shaft diameters run from minipile sections (about
100 mm, using sand–cement grout instead of concrete) up to 1.5 m exceptionally;
pile capacities up to **7 500 kN** are possible `[TOM]` §2.4.2.

### Monitoring — this IS the gameplay

A screen in the cab in front of the operator shows, **continuously**
`[TOM]` §2.4.2:

- **while boring:** auger depth, applied torque, rotation speed, penetration
  rate
- **while concreting:** concrete pumping pressure and flow rate
- **on completion:** a printed pile log recording construction parameters and
  the **under- or over-supply of concrete**

Most specifications require the rig to carry this instrumentation; some
authorities require **all** CFA piles to be tested by non-destructive integrity
tests regardless; regular calibration of the instrumentation is essential
`[TOM]` §2.4.2. The systems are moving from recording to **controlling** — in
particular to guarantee the target concrete volume is achieved throughout the
pile length during withdrawal `[TOM]` §2.4.2.

Rig capability: a leader rig in CFA configuration with max pile length **26 m**,
max pile diameter **1 200 mm**, max torque **400 kNm**, extraction **100 t** and
pull-down **36 t** `[JUN-PILE]`.

### KPI

**Concrete volume ratio at every metre of the withdrawal, and pumping pressure
never below the trigger.** The pile log is the deliverable.

---

## A7. Cased CFA / double rotary

**German:** Doppelkopfbohren (in the anchor/overburden sense); the cased-auger
piling system is catalogued as VdW / FOW `[EMDE-PF]`.

An outer **casing** and an inner **auger** advance together, driven by two
independent rotary heads (usually counter-rotating). The casing supports the
bore absolutely; the auger cuts and lifts the spoil inside it.

**Why:** the double-rotary CFA system overcomes exactly the ground that defeats
plain CFA — stiff clayey soils and glacial till. Results showed **stiff marl
could be effectively penetrated, verticality was better controlled, and overall
performance was similar to conventional bored and CFA piles** `[TOM]` §2.4.2
(citing Bustamante et al.). The obvious secondary win is in **contaminated or
sensitive ground**, because nothing outside the casing is disturbed.

Real system numbers `[EMDE-PF]`:

| Pile Ø | Drive torque (casing/auger) | Casing | Casing weight/m class |
|---|---|---|---|
| 406 mm | 60/35 kNm | 406 × 12.5 mm | 335 kg |
| 508 mm | 60/35 kNm | 508 × 14.2 mm | 470 kg |
| 610 mm | 120/60 kNm | 610 × 14.2 mm | 565 kg |
| 750 mm | 160/80 kNm | 750 × 15 mm | 735 kg |
| 900 mm | 180/90 kNm | 900 × 15 mm | 885 kg |

Concreting passage through the drive 100–190 mm; casing joints in alloy steel,
**watertight by O-ring seals**; accessories include a rig-up system for raising
casing and auger, manual or hydraulic casing guiding, a casing drive with
hydraulically driven pins, and a **box for controlled outlet of the drill goods**
`[EMDE-PF]`. A heavy production machine in CCFA configuration: **600 kNm casing
torque, 240 kNm auger torque, 1 060 kN combined line pull, and 24.1 m drilling
depth at Ø 1 000 mm** `[BAU-CAT]`.

Tooling limit for the cased version: **UCS < 20 MPa** `[BAU-CFA]`.

### KPI

**Casing tip always ahead of the auger tip.** Let the auger lead and you have
lost the reason you brought two rotary heads.

---

## A8. FDP — full displacement piling

**German:** Vollverdrängerbohrpfahl. EN 12699 `[EN12699]`.

### The method

No spoil. A **displacement body** on the end of a drill tube is rotated and
forced down by the rig's crowd; the soil is pushed sideways into the wall of the
hole and **compacted**, not excavated. At depth, concrete is pumped through the
tip as the tool is rotated back out, maintaining the profile; reinforcement is
pressed into the fresh concrete, sometimes with a hydraulic or electric vibrator
`[TOM]` §3.4.7, `[JUN-PILE]`.

The commercial argument writes itself: **no arisings to test, transport or
dispose of**, which is why one manufacturer files it under "sustainable,
resource-saving building" `[BAU-CAT]`. Cost: it takes more power — installing
screw piles can need **about 20 % greater** torque/power than an equivalent CFA
pile `[TOM]` §2.3.5.

### Ground limits — hard numbers

`[BAU-FDP]`, and these are the best "can I even bid this job" numbers in the
whole pack:

- **Displaceable soils**: sandy gravel, sand, silt and clay through to soft
  organic soils.
- **SPT N30 < 30**, *or* **CPT cone resistance < 10 MPa**.
- **Undrained shear strength approx. > 15 kN/m2.**

Outside that window the tool simply will not go down, or the rig lifts itself.

### Tooling

| Item | Value | Source |
|---|---|---|
| FDP starter diameters | 360, 410, 510, 620 mm | `[BAU-FDP]` |
| Working length | 3 025 / 3 400 mm | `[BAU-FDP]` |
| Concreting pipe | Ø 120 mm, outlet between cutting blades | `[BAU-FDP]` |
| Assembly | one-piece (rigid connection between displacement body and cutting geometry) or multi-piece (variable connection, optional feed auger) | `[BAU-FDP]` |
| Cutting geometries | double-cut starter with flat teeth (AF-2); double-cut with round-shank chisel and collar plate (AFF-K2) | `[BAU-FDP]` |
| Displacement tool range, alternative | displacement Ø 250–1 000 mm; couplings SW 150/175/200/250; concreting Ø 100 or 125 mm; **max torque 170 kNm to > 600 kNm depending on diameter** | `[EMDE-PF]` |
| Hollow displacement augers | cutting Ø 200–350 mm+, central tube 152/132 to 254/234 mm, pitch 150–250 mm | `[EMDE-PF]` |
| Tip options | **lost plate**, **lost drill bit**, or **recoverable drill bit** — a real buy/consume decision | `[EMDE-PF]` |
| Couplings | thread, octagonal, or casing joint | `[EMDE-PF]` |

Rig in displacement configuration: max pile length 32 m, **max working tube
length 35 m**, max pile diameter 810 mm, torque 400 kNm `[JUN-PILE]`.

Note the displacement variant that also uses a working tube: the tube is rotated
into the ground displacing soil; at depth the reinforcement is installed **in the
tube**; concrete is placed as the tube is gradually extracted, with concrete
added so **the tube remains full** `[JUN-PILE]`.

### KPI

**Zero spoil, target depth reached, torque within the rig's envelope.** Losing a
lost bit in the wrong place, or stalling short of depth, is the failure.

---

## A9. Micropiles and ground anchors

**German:** Mikropfahl / Kleinbohrpfahl; Verpressanker.

### Micropiles — EN 14199

Definitions that must not be blurred:

- **Drilled micropile: shaft diameter < 300 mm** — the exact boundary where
  EN 1536 stops and EN 14199 starts `[EN1536]`, `[EN14199]`.
- **Driven micropile: ≤ 150 mm.** But note the trap: **BS EN 14199 states it is
  not applicable to driven piles**, whose execution is EN 12699 `[EN14199]`.
- `[TOM]` §2.6 uses "minipile" for anything under 300 mm — shaft diameters
  **50 to 300 mm, working loads 50 to 500 kN** — and reserves "micropile" for the
  lower part of that range.

Installation methods `[TOM]` §2.6:

1. Driving small-diameter steel tubes then injecting grout, with or without
   withdrawing the tubes.
2. Driving thin-wall steel or RC shells, filling with concrete, leaving in place.
3. Drilling by rotary auger, CFA or percussion, then cage and in-situ concrete —
   a conventional bored pile in miniature.
4. Jacking down steel tubes, steel box sections or precast concrete sections,
   jointed by sleeving or dowelling.

The classic use is **low headroom** — underpinning, replacing subsided floors.
Where minipiles are used for underpinning in shrink–swell clays, insert a
**sleeve in a pre-bored hole over the top 2 to 3 m**, and design that length as a
column `[TOM]` §2.6.

### Self-drilling anchors (SDA) — the Drillity-native product

The hollow bar **is** the drill string **and** the reinforcement, drilled and
grouted in one pass — already stated correctly in `FACTS_VERIFIED.md`. Thread
families per `DOMAIN.md` §4: hollow self-drilling bar **R25–R51, T76+**;
GEWI/threadbar; strand for stressed anchors.

### The drilling methods that serve anchors and micropiles

From an anchor-drilling catalogue `[EMDE-AN]`, `[EMDE-AD]` — and note these are
the German names the DACH market actually uses:

| German | English | Sizes catalogued |
|---|---|---|
| **Rammbohren** | Drive drilling (nippled type) | Ø 76.1, 88.9, 101.6, 114.3, 133, 152.4, 177.8, 203, 219 mm |
| **Überlagerungsbohren mit Drehantrieb** | Overburden drilling with rotary drive | — |
| **Überlagerungsbohren mit Hydraulikhammer** | Overburden drilling with hydraulic top drifter | — |
| **Doppelkopfbohren mit Hydraulikhammer** | Double-head drilling with hydraulic top drifter | Ø 108, 114.3, 133, 152.4, 177.8, 203, 219 mm |
| **Schneckenbohren** | Auger drilling | — |
| **HDI 1-fach / 2-fach** | Jet grouting, single / double | rods Ø 88.9 mm; 88.9 and 114.3 mm |

Double-head components are specified per drifter: flushing ring, flushing shaft,
flushing-ring holder, traverse, flange for the drilling gearbox — the catalogue
literally says *"Type of drifter needed"* `[EMDE-AN]`. That is a good in-game
compatibility rule: **the double-head kit is matched to the drifter, not
universal.**

### Ground anchors — EN 1537

- **Temporary anchor = design life under 2 years. Permanent anchor = 2 years or
  more** `[TOM]` §6.7, `[EN1537]`. Temporary anchors need not be sheathed
  provided the corrosion protection suits the design life.
- **Drilling deviation must not exceed 1/30 of the anchor length** `[TOM]` §6.7.
- Anatomy: **free (tendon) length** from the anchor head to the proximal end of
  the fixed anchor length; **bond length (fixed anchor length)** over which the
  load is transferred to the ground through a grout body; and an **anchor head**
  that must allow the tendon to be stressed, proof loaded, locked off and — if
  required — released, destressed and restressed `[EN1537]`.
- Three tests `[TOM]` §6.7, `[EN1537]`:
  1. **Investigation test** — establishes the ultimate resistance at the
     grout/ground interface and the characteristics in the working load range.
     Made on dedicated test anchors, at design stage.
  2. **Suitability test** — confirms the system suits the ground on this site;
     for permanent anchors, made with sheathed tendons, establishing acceptable
     limits of creep or load loss at the proof and lock-off loads.
  3. **Acceptance test — on every working anchor**, after lock-off and before
     the anchorage becomes operational. It must (a) demonstrate the proof load
     can be sustained, (b) determine the apparent tension free length, (c)
     ensure the lock-off load is at design level excluding friction, (d)
     determine creep or load loss at SLS where required.
- Testing procedure has since moved to **EN ISO 22477-5** `[EN1537]`.
- Test counts (per EN 1997-1/A1 as applied in French professional practice):
  suitability tests at **1 per 40 anchors, minimum 3 per site**, and the total
  number of tests "may not be lower than 5 (2 failure tests and 3 suitability
  tests)" — plus an acceptance test on every anchor `[EN1537]` route.
- Grout: cement grouts to EN 445/446/447; prestressing steel to EN 10138; resin
  grouts permitted subject to tests; admixtures and inert fillers allowed
  provided they cannot corrode the tendon `[TOM]` §6.7.
- Prestress loss at lock-off in the order of **2–3 % of maximum tension** for an
  anchor with ~8 m bond length and 12–15 m free length in sandy-gravelly soil
  `[EN1537]` route (illustrative field data, not a code requirement).
- `UNVERIFIED`: the EN 1537 corrosion-protection class naming/numbering. Do not
  ship a "Class I / Class II" label without the clause.

### The rigs

Anchor and micropile rigs are a genuinely different machine class — small,
tracked, low `[KLEMM]`:

- Rig range **4 t to 32 t operating weight**.
- **Low-headroom machines: 4.9 t at 2.0 m minimum headroom and 780 mm minimum
  width; 5.1 t all-electric on-board at 2.2 m / 750 mm.** That is a machine that
  fits through a domestic doorway opening and works in a basement.
- Hydraulic power packs, diesel or electric, **45 to 129 kW**.
- **Hydraulic drifters with piston weight 6.8 to 28 kg** — top hammer, at
  micropile scale.
- **Hydraulic rotary heads with torque up to 61.5 kNm.**
- Rod handling for single **and double** drill strings (magazine and rod-handling
  series) — because double-head drilling needs two strings handled at once.
- Single-pass drilling depths from 12.5 m up to 25.0 m depending on the machine.
- Drilling data recording, evaluation and documentation as a first-class product
  line.

### KPI

**Anchors stressed and locked off at design load, every one passing its
acceptance test.** For micropiles: grout take against theoretical volume, and
hole deviation within 1/30.

---

## A10. Diaphragm walls

**German:** Schlitzwand. EN 1538 `[EN1538]`.

### Scope and geometry

EN 1538 covers walls **B ≥ 0.40 m thick** cast in a slurry- or dry-supported
trench: cast-in-situ concrete, precast concrete, reinforced slurry walls
(retaining), and slurry/plastic-concrete walls (cut-off). It **excludes shallow
trenches with D/B < 5 or D < 5 m** `[EN1538]`. Preliminary design rule of thumb
for wall thickness: **about 4–8 % of the excavation depth**
(https://en.wikipedia.org/wiki/Slurry_wall).

**Guide walls** come first: two low reinforced-concrete beams that define the
trench line, guide the tool, and support the top of the ground. Typically about
**1 m deep and 0.5 m thick** (https://en.wikipedia.org/wiki/Slurry_wall). A
clearance allowance of **3.5 cm** on the trench width has proven effective in
practice `[STEIN]`.

### Grab vs hydromill

| | **Hydraulic grab (clamshell)** | **Hydromill / trench cutter (Schlitzwandfräse)** |
|---|---|---|
| Cutting action | Two jaws bite, close, lift the spoil out of the slurry | Two counter-rotating cutter wheels grind the ground; a submersible pump lifts the cuttings **with the slurry** to the desanding plant (reverse circulation) |
| Ground | Soils, soft rock | **Hard rock**, and the tool of choice for deep panels and tight verticality |
| Depth | Shallower | **Up to 90 m** cutting depth on a current system |
| Panel width | Set by the grab | **1 200 mm** on that system |
| Spoil handling | Out of the trench, jaw by jaw | Continuous, pumped |
| Support | Crawler crane / duty-cycle crane, cable-suspended or kelly-guided | Duty-cycle crane + **separate hydraulic power pack** |

The cutter numbers `[BAU-CAT]`: max cutting depth **90 m**, max hook load
**46 t**, panel width **1 200 mm**, cutter weight **34.7 t**, turning range
**−45° to +95°**; power pack **500 kW electric at 690 V, 350 bar**, guaranteed
sound power level **LWA 105 dB(A)**, replaceable by a diesel unit if the site
has no grid. That "electric or diesel power pack, side/rear/remote mounted" is a
genuinely visible modelling difference.

### Slurry rules

- Support-fluid level **must not fall more than 30 cm below the top of the guide
  wall** `[STEIN]`, citing DIN EN 1538.
- **Concrete rise rate must not fall below 3 m/h** (DIN 4126, the German national
  companion for trench stability) `[STEIN]`.
- **Tremie pipes must remain immersed at least 2 m in fresh concrete**
  `[STEIN]`; EN 1536 sets **3.0 m minimum immersion for barrettes**, especially
  with two or more tremies `[EN1536]`. Use 3 m as the design value and 2 m as the
  end-of-pour minimum, consistent with `[EFFC]`.
- **Verticality: 1 %** per DIN EN 1538 `[STEIN]`.
- **Desanding** is continuous, not optional: the slurry returning from the trench
  goes through a cyclone/screen plant and back. EN 1536's before-concreting limit
  of **sand content < 4 %** is the target the desanding plant exists to hold
  `[EN1536]`.

### Stop-ends and the panel sequence

Panels are built in a sequence — **primary panels first, then secondary panels
between them.** A **stop-end tube** (or an I-section) is lowered at each end of a
primary panel before concreting, so the concrete forms a clean, semicircular
joint face; the tube is extracted as the concrete stiffens. The secondary panel
is then excavated hard against that formed face, giving a water-tight joint.
`UNVERIFIED`: EN 1538's numeric stop-end tolerance and embedment requirements —
the qualitative sequence above is standard practice, but do not put a number on
it without the clause.

Concreting records: **EN 1538:2010 Annex C gives an example of the concreting
graph** — the theoretical-versus-actual concrete volume plot against depth, the
same instrument that catches overbreak and necking `[EFFC]`.

### KPI

**Verticality within 1 %, joints water-tight, slurry inside spec at concreting.**
A leaking joint on a metro box is a project-level failure, not a pile-level one.

---

## A11. Soil mixing / deep stabilisation

**German:** Tiefreichende Bodenstabilisierung / Tiefenmischverfahren; CSM =
Cutter Soil Mixing; DSM = Deep Soil Mixing. EN 14679 `[EN14679]`.

### What it is

Mixing in-situ soil with one or more binders to make a stiffer, stronger
composite, **without removing it**. EN 14679 covers two methods — **wet mixing**
(soil mixed mechanically with a cement slurry) and **dry mixing** (dry binder) —
and defines deep mixing as mixing by rotating mechanical tools **to a minimum
depth of 3 m**, where lateral ground support is not removed `[EN14679]`.

**Binders — and this is the Nordic answer, not the generic one.** Columns,
groups of columns or walls are formed at depth by mixing in-situ material with
one or several binding agents and fillers: **lime, fly ash, gypsum and cement
can all be used, depending on the soil type and the application method**
`[JUN-PILE]`. That list is worth quoting almost verbatim into the game; "just
cement" is the wrong answer for Scandinavian soft clay.

### The tool families

| Family | Geometry | Numbers |
|---|---|---|
| **Single / twin / triple auger mixing** (DSM) | One to three vertical mixing shafts on a common rod | Mixing head Ø **400–1 000 mm** standard; rods in useable lengths 1 000–12 000 mm; central flushing head; separate **upper and lower running guides** for the twin and triple configurations `[EMDE-PF]` |
| Same family, extended | — | Nominal bores NW **1.5", 2" and 3"**, for mixing columns **up to Ø 3 650 mm**; pressure range **up to 150 bar (450 bar on request)**; **central pipes in double-wall design with integrated grout line**; single, twin, triple or quad; optional static bar, reverse cutting and pilot bit change-out `[EMDE-SM]` |
| **Multi-shaft mixing (MSM)** | Up to **4 independent rotary drives** in a row | Torque 65.2 kNm, 118 rpm, axis-centre distance up to 3 197 mm, **max panel length 25.3 m with 914 mm mixing tools**, max mixing depth 30.5 m `[BAU-CAT]` |
| **Cutter soil mixing (CSM)** | Two counter-rotating cutter wheels on a fixed leader — a trench cutter that mixes instead of excavating | Mixing gearbox **2 × 50 kNm**, panel **2 800 × 550 mm**, max depth **30.5 m**, machine 128 t `[BAU-CAT]` |
| **Electric CSM** | Two electric motors driving the mixing wheels — no hydraulics, no leaks, safe in sensitive soils | **2 × 200 kW**, 0–40 rpm, 2 800 / 640 mm; claimed **25 % higher feed rate and 20 % lower energy consumption** `[BAU-CAT]` |

Mixing-tool design detail worth modelling `[BAU-SCM]`: a mixing starter for
clay carries a **rigid mixing paddle** with integrated baffle plates at the tips
for stability against the borehole, plus a **pivoted stator paddle that can be
plugged in at variable diameter to slow the slurry down** — because in clay the
problem is that the slurry short-circuits instead of mixing. Slurry line
Ø 120 mm **with an integrated slurry filter**; a central slurry lip or strip for
diameters under 1 500 mm; standard mixing diameters **800–2 200 mm**.

Deep-stabilisation rigs are their own machine class: purpose-built for over 20
years, they combine **lightweight construction, extremely fast and controlled
column creation, great agility, and simultaneous operation and refilling of the
binder containers** `[JUN-PILE]`. That last one is the production constraint —
the rig should not stop to reload binder.

### Adjacent, but a different standard

**Deep vibration** (EN 14731) is *not* deep mixing: it covers deep vibratory
compaction and **vibrated stone columns, generally Ø > 0.6 m and < 1.2 m**, and
explicitly excludes columns made stiff by adding cement or concrete — those fall
under EN 14679 or EN 12716 `[EN14731]`.

### KPI

**Binder dosage per cubic metre delivered on the profile, column continuity, and
achieved UCS from the wet-grab samples.** Speed is the enemy: a fast column that
did not mix is worthless.

---

## A12. Jet grouting (HDI)

**German:** Düsenstrahlverfahren; Hochdruckinjektion (HDI); "1-fach / 2-fach /
3-fach" for single/double/triple. EN 12716:2018 `[EN12716]`.

### The defining number

**Jet grouting requires a minimum pressure of 25 MPa (250 bar)** for a clear
jet — that threshold in EN 12716's own definition is what separates jet grouting
from the lower-pressure grouting covered by EN 12715 `[PANDREA]` §4.2.

### The three systems

| System | German | Fluids | Mechanism |
|---|---|---|---|
| **Single** | 1-fach | Cement grout only | A slurry grout jet both erodes and cements `[KELLER-JET]` |
| **Double** | 2-fach | Grout + air | A slurry grout jet **surrounded by an air jet** — the air shroud keeps the jet coherent further from the nozzle, so the column is bigger `[KELLER-JET]` |
| **Triple** | 3-fach | Water + air + grout | A **water jet surrounded by an air jet** does the eroding, with a **separate grout port** placing the binder — best control, best spoil replacement `[KELLER-JET]` |

Sequence, from the same source: the monitor is drilled to **maximum treatment
depth first**; then the high-velocity jets are started; then the drill stem and
monitor are **rotated and raised**, eroding and mixing the in-situ soil with
grout as they go `[KELLER-JET]`. Spoil (return, Rückfluss) comes up the annulus
and must be pumped away — the rig kit includes **suction hose pumps for
backflow** `[KLEMM]`.

**The variable that decides everything: soil erodibility.** *"Soil erodibility
plays a major role in predicting geometry, quality, and production"* — and
**cohesionless soils are more erodible than cohesive soils** `[KELLER-JET]`.
That is the game's difficulty dial: the same energy makes a fat column in sand
and a thin one in stiff clay.

New in the 2018 standard `[PANDREA]` §4.2: **"jet piles"** — a cavity created by
jetting is filled with concrete through a tremie, replacing the soil/water fluid
mix. Also new orientation terms: **sub-vertical (≤ 20° from vertical),
sub-horizontal (≤ 20° from horizontal), inclined** (everything else).

### The plant

`[KLEMM]`:

- **Rods for one-phase (grout), two-phase (grout + air) and three-phase (grout +
  water + air).**
- Flushing heads, nozzle holders, nozzles, drill bits.
- **High-pressure injection pumps: 240–600 kW, max 700 bar, max 400 l/min.**
- Grout batching and mixing plants; colloidal mixers with 130–500 l mixing and
  260–1 500 l storage vessels, 8.0–18.0 m3/h output classes.
- Suction hose pumps for the backflow.
- **MBS drilling data recording system** — the record is part of the product.

Tooling detail `[EMDE-AN]`: an HDI string is flushing head → tube → double
nipple → **nozzle holder (Düsenstock) → nozzle (HDI Düse) → non-return steel
ball → automatic valve** → bit. Bit options: **3-wing bit with flushing bore**,
3-wing bit **with nozzle thread**, **step bit** with either, or a **roller bit**
with either. Rods Ø 88.9 mm for single, Ø 88.9 and 114.3 mm for double, in
useable lengths 500–3 000 mm.

### Verification and testing — new and strict

`[PANDREA]` §4.6, §4.8:

- **Sampling: 4 samples per 500 m3** produced in non-cohesive soils; **4 samples
  per 250 m3** in cohesive soils. (The 2001 edition asked for 4 per 1 000 m3 —
  the tightening is significant.)
- **Verticality measurement: 1 in every 10 boreholes for depth > 10 m; every
  single borehole for depth > 30 m.**
- Characteristic UCS by log-normal distribution requires **≥ 10 samples**; below
  that, the **minimum measured value** is the characteristic value. Reliability
  factor **kn = 1.28** for the 10 % fractile; long-term factor **α = 0.85**;
  partial material factor **γm = 1.5** (persistent and transient design
  situations), **1.25** (accidental).
- Only quality-class **A and B** samples (of an A–D classification) may be used
  for material-strength determination.
- Geometry and tolerances in Annex B **borrow the EN 14199 (micropile) values**,
  because the drilling methods and rigs are so similar `[PANDREA]` §4.6.
- **Working platform bearing capacity must be proven** per EN 1997-1 for rig
  loads calculated per **EN 16228-1 Annex F** — the first execution standard to
  give explicit platform-design instructions `[PANDREA]` §4.7.
- Jet grouting projects fall **at least into Geotechnical Category 2, and more
  often than not Category 3** of EN 1997-1 `[PANDREA]` §4.4.

`UNVERIFIED`: specific column-diameter ranges by soil type and system. Column
diameter is the number everyone wants, and it is genuinely project-specific — do
not ship a table without a source. The defensible in-game statement is the
mechanism: *single < double < triple for a given soil, and cohesionless > cohesive
for a given system* `[KELLER-JET]`.

### KPI

**Column diameter achieved at the design UCS, with the return managed.** Losing
control of the return — either no return at all, or heave — is the failure.

---

## A13. Bonus machine — pile-top reverse circulation drilling (RCD)

Not in the brief's twelve, but it exists in `DOMAIN.md` §3 (Rotary & Kelly
Foundation Tools; Reverse-circulation) and it is a distinct silhouette worth a
late-game unlock. A **pile-top drill rig** clamps onto the head of a partially
driven casing or tube and drills from there, with reverse circulation lifting
the cuttings up the drill stem `[RCD]`:

- **Diameters 0.6 m to 8.5 m. Depths to 400 m. Also inclined piles.**
- Best in **mixed ground, boulders and hard rock**.
- Jobs: rock drilling, **rock socketing**, underreaming, bell-out of the rock
  socket, pile cutting, milling deformed casings, anchor drilling, secant wall
  drilling.
- Applications: offshore wind farms, marine structures, bridges, dam
  rehabilitation, ventilation shafts, elevated metros.

A related on-shore variant: a rotary drive plus hydraulic power packs integrated
on one platform and **mounted on top of a partially driven tubular pile** —
462 kNm torque at 320 bar, 40 t pulldown, a clamping device exerting 90 t to
resist torque and pulldown, running a triple telescopic kelly with 3 m and 4.4 m
buckets. It was used to clean out and ream below 4.75 m diameter tubular
monopile foundations so driving could be completed to 61 m at an offshore wind
farm `[TOM]` §3.3.1.

---

# B. The professions

Drillity Talent already names **Pile Driver** and **Foundation Engineer** as
specialisations, and **Hydraulic Grab / Piling Operator, Rigger, Crane Operator,
Foreman / Site Supervisor** as job functions (`DOMAIN.md` §7,
`PLATFORM_TRUTH.md` Part B). Those are real titles. Below is what each of them
actually does inside one pile cycle, which is what the game needs in order to
show a crew rather than a single avatar.

## B1. The crew, by method

A piling gang is not one shape. These are the roles present around a rig, and
which methods need which.

| Role | Driven | Bored / Kelly | CFA | D-wall | Anchors / micropiles |
|---|---|---|---|---|---|
| **Piling rig operator** | ● | ● | ● | ● (cutter/grab op) | ● |
| **Banksman / slinger–signaller** | ● | ● | ● | ● | ○ |
| **Pile driver / piling operative (leading hand)** | ● | ● | ● | ● | ● |
| **Service crane operator** | ● (pitching, cages) | ● (cages, casings) | ● (cages) | ● (cages, stop-ends, cutter) | ○ |
| **Concrete crew / pump operator** | ○ (DCIS only) | ● | ● | ● | ○ |
| **Reinforcement cage crew** | ○ | ● | ● | ● | ○ |
| **Grouting crew (mixing plant + pump)** | — | ○ (base/shaft grouting) | ○ | ○ | ● |
| **Setting-out surveyor** | ● | ● | ● | ● | ● |
| **Site engineer / foundation engineer** | ● | ● | ● | ● | ● |
| **Foreman / site supervisor** | ● | ● | ● | ● | ● |
| **Fitter / equipment technician** | ● | ● | ● | ● | ● |

Typical gang for one rig, working one shift, as a game-balance model:
**operator + banksman + 1–2 operatives + a shared foreman, engineer and fitter
across 2–4 rigs**, plus a concrete gang and a crane when the method needs them.
`UNVERIFIED` as a precise headcount — crew size is contractor- and
country-specific. Treat it as a tunable, not a fact.

## B2. What each does during one pile cycle

### The bored-pile cycle (Kelly), start to finish

1. **Setting-out surveyor** pegs the pile position from the setting-out drawing
   and records the platform level (the "commencing surface" — the datum every
   casting tolerance is measured from `[TOM]` §3.4.6).
2. **Foreman** confirms the working platform is certified for this rig and that
   the exclusion zone is set. (The FPS position is unambiguous: working
   platforms "must be designed, properly constructed, regularly inspected and
   maintained for the plant which will use them", against the BRE **BR470
   *Working Platforms for Tracked Plant*** specification and evidenced by a
   **Working Platform Certificate, WPC 4d** — and *approximately one third of
   dangerous occurrences reported by FPS members involve working platforms*
   `[FPS-WP]`.)
3. **Rig operator** tracks on, sets up over the peg, levels the mast, zeroes the
   depth counter, and starts the bore. He is watching torque, crowd, rotation
   speed, depth and — critically — **the spoil coming off the tool**, which is
   the only ground log he gets.
4. **Banksman / slinger–signaller** works the ground beside the rig: he is the
   operator's eyes on the blind side, directs the tracking, and slings every
   tool change. He never stands under a suspended load and never inside the
   auger cleaning zone. (Auger cleaning is dangerous enough to have its own
   guidance document: FPS **"Guarding and Cleaning Augers on Piling Operations"**,
   written with the HSE and the rig manufacturers as an interpretation of the
   PUWER Regulations 1998 as amended 2002, covering CFA, rotary bored,
   displacement auger, cased secant and mini-piling `[FPS-PLANT]`. And it is an
   EU mandatory safety requirement that **spoil is removed from an auger at the
   lowest possible level during extraction**, so debris cannot fall on people or
   destabilise the rig `[TOM]` §3.3.1.)
5. **Tool changes**: auger for the soil, bucket below water, core barrel for
   rock. Each is a lift, so each is a banksman job. Transport of those tools to
   and from site has its own FPS guidance on **load securing and safe
   loading/unloading** `[FPS-PLANT]`.
6. **Casing**: if the bore needs support, the casing string goes in — driven,
   oscillated or rotated — and comes out again at the end, held on a **casing
   clamp** while sections are broken `[BAU-CLAMP]`.
7. **Clean out.** The bucket takes the last of it; the base is checked. **The
   6-hour clock starts here** `[TOM]` §3.4.6.
8. **Cage crew** land the reinforcement cage — usually crane-handled — check
   spacers and cover, and hang the cage from the top of the shaft if it does not
   reach the base `[TOM]` §3.4.6.
9. **Concrete crew** run the tremie in to the bottom, fit the bung, and start.
   The pump operator and the banksman jointly own the concrete level: the tremie
   never surfaces (§A5). FPS has specific guidance for **pumping concrete to
   form piles**, supplementing the CPA's *Safe Use of Concrete Pumps* and
   covering pipeline maintenance, blockage management and washout water
   `[FPS-PLANT]`.
10. **Site engineer** logs the pile: depth, strata encountered, tool changes,
    concrete volume against theoretical at each stage, cage level, cut-off. The
    EN 1536 Annex B record is a two-part document and it is a contractual
    deliverable `[TOM]` §11.3.3.
11. **Fitter** changes teeth and pilots, greases the Kelly, and is the reason
    the rig is running at all.

### The driven-pile cycle

1. Surveyor pegs; foreman checks platform; rig tracks on and the mast is set to
   the design rake (electronic inclinometer is standard kit `[JUN-PM25H]`).
2. **Pitching**: the pile is lifted by the pile winch, threaded into the leader
   guides, and stood up over the peg. This is the most dangerous minute of the
   cycle — a long slender object under a hammer, held by a winch, with people
   near it. **Banksman controls the pitch.**
3. **Helmet, dolly and packing** are fitted (§A1). The operative checks the dolly
   condition — this is a wear part with a live effect on energy transfer.
4. **Drive.** Operator dials energy: soft to seat the pile, then up. Blow counts
   are logged per 500 or 250 mm `[TOM]` §11.3.1.
5. **Final set.** The pile driver takes the set — paper card and straight-edge,
   or the rig's own stroke-counting and penetration measurement system, which
   exists precisely so **"the crucial final blows now takes place in a safer and
   faster manner"** `[JUN-PILE]`.
6. **Cut-off / splice** as required; the engineer signs the daily pile record
   (per pile, signed by both the Contractor's and Employer's representatives,
   submitted daily; records kept **5 years** after completion `[TOM]` §11.3.1).

## B3. Tickets and competence — UK

**CPCS** (Construction Plant Competence Scheme, operated by NOCN Group) is the
sector's largest plant card scheme: **over 300 000 cards across 60+ plant
categories**, with independent one-to-one testing, an average of ~70 theory
questions per category, and over 90 % of practical tests at purpose-built
centres `[CPCS]`. The categories that matter here `[CPCS]`:

| Code | Category |
|---|---|
| **A30** | Piling Rig — Tripod |
| **A45** | Piling Rig — Driven, below 20 tonnes |
| **A46** | Piling Rig — Driven, above 20 tonnes |
| **A47** | Piling Rig — Bored, below 20 tonnes |
| **A48** | Piling Rig — Bored, above 20 tonnes |
| **A02** | Crawler Crane over 10 tonnes |
| **A40** | Slinger / Signaller |

Note the split: **driven and bored are separate tickets, and each is split at
20 tonnes.** That is a superb progression ladder — four rungs, already real, and
it maps directly onto the game's rig tiers.

**NPORS** is the parallel scheme in the UK; **CSCS** is the umbrella card scheme
that proves occupational competence on site rather than machine competence.
`UNVERIFIED`: NPORS category codes for piling — not sourced here, do not invent
them.

Piling-specific training beyond the machine ticket `[FPS-CRS]`:

- **CITB-accredited one-day piling-specific site safety course** — widely
  accepted as fulfilling basic safety training for the sector.
- **PSSTS — Piling Safety Supervisors Training Scheme**, a two-day course for
  junior engineers, supervisors, foremen and charge hands (currently on hold;
  FPS recommends **SSSTS** in the interim).
- **NVQ Level 3 in Occupational Work Supervision** — a twelve-month
  workshop-based programme with a portfolio and final assessment; this is the
  foreman route.
- The FPS also points at apprenticeships and geotechnical engineering degrees as
  the two ends of the ladder `[FPS-CRS]`.

## B4. Tickets and competence — Germany (DACH)

**Spezialtiefbauer/in** is a recognised **three-year apprenticeship** — a real
Ausbildungsberuf, not a job title. Trainees learn to take soil samples and
analyse soil composition and bearing capacity for the project, to operate
drilling equipment, and to build a **Verbau** (excavation support) typically made
of steel anchor systems and retaining walls `[AUSB]`.

**Training pay** (as published April 2026) `[AUSB]`:

| Year | Monthly gross |
|---|---|
| 1 | **€1 122** |
| 2 | **€1 351** |
| 3 | **€1 610** |

This is the one **fully sourced pay figure** in this pack and it is a very good
one for the game's early career: it is exactly the "you are an apprentice, this
is what an apprentice earns" anchor.

Machine-side, the relevant European standard for the rig itself is **DIN EN
16228** — every current German foundation-machine data sheet carries the line
*"Rig configuration according CE / DIN EN 16228"* `[BAU-CAT]`, and EN 16228-1
Annex F is now the reference for the ground loads a rig imposes, cited by the
revised jet-grouting standard `[PANDREA]` §4.7.

`UNVERIFIED`: the German plant-operator certification scheme names (e.g. the
DGUV-based Baumaschinenführer qualification) and the Nordic equivalents. These
exist and are used; they were not sourced in this pass. Do not put a scheme name
in the game without a citation.

## B5. Noise and health as a career constraint

The Noise at Work Regulations 2005 set **lower action value 80 dB(A), upper
action value 85 dB(A)**, peak action 135–137 dB(A), with exposure limit values
**87 dB(A)** and **140 dB(A)** peak `[TOM]` §3.1.7. Against the measured field
numbers in §A1 — 115 dB at 10 m from an unsilenced impact hammer `[JUN-HAM]`,
around 120 dB(A) basic sound level for a vibratory hammer driving steel bearing
piles `[TOM]` §3.1.7, and up to 110 dB(A) sound power for crane-mounted kelly
augers and large CFA rigs operated 85–100 % of the shift `[TOM]` §3.1.7 — hearing
protection is not optional and acoustic enclosures for engines and power packs
are described as **essential** `[TOM]` §3.1.7.

This is a legitimate, real-world reason for a **health/fatigue meter** in the
career layer, and it is consistent with Talent's cert-expiry model
(`PLATFORM_TRUTH.md` Part B): audiometry lapses, you do not mobilise.

## B6. Career path

Mapped onto Drillity Talent's own vocabulary (`DOMAIN.md` §7):

```
Piling operative / labourer
   └─ Banksman / Slinger–Signaller  (CPCS A40)
        └─ Piling Rig Operator, driven <20 t (A45)  ──┐
        └─ Piling Rig Operator, bored  <20 t (A47)  ──┤
             └─ ... above 20 t (A46 / A48)           ─┤
                  └─ Leading hand / charge hand       │
                       └─ Foreman / Site Supervisor   │  (PSSTS/SSSTS,
                            └─ Site Manager           │   NVQ L3)
                                                      │
   Crane Operator (A02) ──────────────────────────────┘
   Equipment Technician ── Plant Manager

   Site Engineer ── Foundation Engineer ── Geotechnical Engineer
                                              └─ Project Manager
   Setting-out Surveyor ── Senior Setting-out Engineer
```

Two crossings worth building into the skill tree:

- **Operator → Foreman** is a *supervision* qualification, not a bigger machine.
- **Site Engineer → Foundation Engineer** is the branch that unlocks the
  *design* side: choosing the method, specifying the test regime, and buying
  down the Eurocode 7 correlation factor by testing more piles (§A1).

## B7. Day rates in EUR — what is and is not sourced

**Honest position: the game needs day rates, and this pass could not source them
to the standard `PLATFORM_TRUTH.md` Part C demands.** Recording exactly what was
found:

| Figure | Value | Confidence |
|---|---|---|
| German Spezialtiefbauer apprentice, years 1/2/3 | **€1 122 / €1 351 / €1 610 per month gross** | **Sourced** `[AUSB]` (April 2026) |
| UK "Pile Driver" average | £61 906 per year, **6 salaries reported**, updated 17 Aug 2026 | `[IND-PD]` — a six-person sample on a self-report aggregator. **Treat as indicative only**, and note the job title on that page is "Pile Driver", not "piling rig operator". |
| Everything else (operator, banksman, foreman, engineer, crane op day rates in EUR) | — | `UNVERIFIED` |

**Recommendation for the implementer.** Do not ship hard EUR day rates as
*claims*. Ship them as **the game's own economy**, derived from the two anchors
above, and label the career screen the way Talent does — *day rate*, not salary
(`PLATFORM_TRUTH.md` Part B). If a real number is wanted on screen, the
apprenticeship figure is the only one that can be stated as fact, and it should
be stated with its date.

Structural facts about foundation pay that *are* safe to model, because they come
from the platform itself (`PLATFORM_TRUTH.md` Part B):

- Compensation is a **day rate**, in EUR, USD, GBP, NOK or AUD.
- **Rotation pattern is a first-class field** — 5/2 onshore week, 6/3, ad hoc /
  call-out, staff / residential are the ones that fit a foundation crew.
- **Expired certificate = cannot mobilise.** For a piling crew that is the CPCS
  card, the CSCS card, the medical, and the audiometry.

## B8. The one role the game must not miss

**The banksman / slinger–signaller.** In a rotary or CFA scene the operator is in
a cab, and every single tool change, cage, casing and pile is a **lift** with a
person on the ground directing it. CPCS gives it its own category (**A40**)
`[CPCS]`. Visually it is also the best thing on the site: hi-vis, a hand signal,
a load swinging. Model him. He is what makes the surface view read as *work*
rather than *machine*.

---

# C. The machines — nine distinct silhouettes

Written for a modeller. Each entry says **what it looks like**, **what moves**,
and **what makes it unmistakably not one of the others**. All in-game names must
be original (`DOMAIN.md` §6); the specs below are cited so proportions and
capability tiers can be authentic without copying a designation.

Everything on this list carries the line *"Rig configuration according CE /
DIN EN 16228"* on its real data sheet `[BAU-CAT]` — a nice bit of decal detail.

---

## C1. Leader-mounted pile driver, impact hammer

**The shape.** A crawler base with a **very tall, slender vertical leader (the
mäkler / mast)** carried on an A-frame in front of the machine, and a **hammer
riding up and down that leader on guides**. There is no boom in the excavator
sense. The whole visual identity is *one vertical line, one heavy sliding block,
one pile hanging in the guides.*

**Two sub-types, and they look different:**

- **Telescopic leader (Teleskopmäkler).** The leader itself extends. Transport
  height is low; working height is tall. Telescope stroke on one machine is
  **4 000 mm**, with foot movement 1 000 mm up / 500 mm down and 1 500 mm of
  horizontal leader shift for spotting the pile `[JUN-PM25H]`. A current hybrid
  machine reaches **max leader height 26.8 m for a 21.4 m pile** at 89.8 t
  `[BAU-CAT]`.
- **Fixed leader (Starrmäkler).** One rigid mast, no telescope. Stiffer, used
  where the tool needs reaction — e.g. the CSM mixing rig runs a fixed leader
  `[BAU-CAT]`.

**Proportions and tiers** `[JUN-PILE]`, `[JUN-PM25H]`:

| Tier | Working weight | Leader capacity | Recommended ram | Max pile | Engine | Undercarriage L | Track width |
|---|---|---|---|---|---|---|---|
| Small | 37 t | 12 000 kg | 3–4 t | 16 m | 179 kW | 4 460 mm | 3 000–4 000 mm |
| Medium | 64 t | 16 000 kg | 3–6 t | 20 m | 179 kW | 5 100 mm | 3 200–4 700 mm |
| Large | 78 t | 20 000 kg | 5–9 t | 25 m | 280 kW | 5 700 mm | 3 380–4 880 mm |
| Very large | 110 t | 35 000 kg | 9–12 t | 32 m | 280 kW | 5 700 mm | 3 500–5 000 mm |

**What moves, and it is all visible:**

- **Expandable tracks.** The undercarriage widens on site (e.g. 3 380 → 4 880 mm)
  and narrows for transport `[JUN-PM25H]`. Animate this in the mobilise
  cinematic.
- **Movable / extendable counterweight** — e.g. **6 000 kg base + 2 000 kg
  extension** `[JUN-PM25H]`. The low centre of gravity, expandable tracks and
  movable counterweight together are what **allow greater leader inclinations for
  raked piling** `[JUN-PILE]`.
- **The leader rakes.** Raked (battered) piles are a real product and the mast
  visibly leans, forward/back and sideways, per capacity tables, with an
  **electronic inclinometer** as standard `[JUN-PM25H]`.
- **Self-erecting.** The rig raises its own leader; it is transported in one
  piece **without having to remove the hammer** `[JUN-PILE]`. That is a gorgeous,
  short mobilise animation and it is true.
- **Two winches**: a **pile winch** and a **hammer winch**, rated separately —
  e.g. 10 000 kg pile / 15 000 kg hammer on the 78 t machine `[JUN-PM25H]`.

**The hammer.** A steel box longer than it is wide — **5.4 to 10.4 m long,
6 900 to 46 700 kg** across the range `[JUN-HAM]` — sliding on the leader, with
hydraulic hoses running up to it and a **drive cap / helmet** at its foot sized
to the pile (470×470 mm or Ø 770 mm for the small class; 550×550 mm or Ø 850 mm
for the mid class) `[JUN-HAM]`. Noise-control variants exist and look different:
special drive caps, **guide tubes and insulation jackets** `[JUN-HAM]`.

**Optional third tool.** A **side auger** or **side vibrator** can be mounted to
pre-drill or to help in bad ground `[JUN-PM25H]`. Good silhouette variation.

---

## C2. Vibratory hammer — three mountings, three silhouettes

**a) Free-hanging on a crawler crane.** A blocky vibrator case hanging from a
single rope under a lattice or telescopic crane boom, with **a clamp gripping
the pile head at the bottom** and a fat hydraulic hose bundle running back to a
**separate power pack on the ground**. The vibrator is 2.3–21.7 t dynamic weight
and 2.0–3.7 m long depending on class `[JUN-VIB]`. The power pack is a
containerised diesel unit — **1 460 l/min at 350 bar, 13 100 kg, 6 060 mm long**
for the large class `[JUN-VH120]`. That ground-mounted box with hoses snaking
across the site is half the visual story.

**b) Leader-mounted on a piling rig.** The vibrator runs up and down the mast
exactly where an impact hammer would. **1 500 kN centrifugal force, 2 500 rpm,
5 070 kg, 480 kW hydraulic, max recommended pile weight 7 000 kg**, with an
**automatic clamp-coupling system** so the operator can change clamps without
anyone touching it `[BAU-CAT]`.

**c) On an excavator dipper arm.** A vibrator bolted where a bucket goes. High
power-to-weight, but **limited by the headroom under the bucket — about 6 m of
pile at best** `[TOM]` §3.1.5. Model this one short and stubby; it is the
cheap-jobs machine.

**The clamp is the character.** A sheet-pile clamp is a single wide jaw
(**3 560 kN, 2 553 kg**); a casing clamp is two or four curved jaws wrapping a
tube (**Ø 520–2 000 mm at 1 858 kN × 2**, or **Ø 1 000–3 000 mm at 1 858 kN × 4**)
`[JUN-VH120]`. Swapping clamps is a visible, chunky operation.

---

## C3. Large rotary / Kelly foundation rig

**The shape.** The heaviest thing on a foundation site, and the most
recognisable: a big crawler base with a **long lattice or box mast**, a **rotary
drive (KDK) that travels up and down the mast**, and a **telescopic Kelly bar**
hanging below it — a nest of concentric tubes with **6 raised drive keys running
down each section** `[BAU-KELLY]`. The tool hangs on the Kelly's square drive
stub. Behind the cab sits a **large slab counterweight**, and the machine looks
distinctly back-heavy.

**Numbers for proportions** `[BAU-CAT]`:

| Tier | Torque (casing / drilling) | Pulling force | Transport weight w/o counterweight | Engine |
|---|---|---|---|---|
| Mid | 300 / 280 kNm | 565 kN | 63.4 t | 340 kW |
| Large | 385 / 340 kNm | 690 kN (with crowd assist) | 74.6 t | 405 kW |
| Heavy (cased CFA config.) | 600 kNm casing / 240 kNm auger | 1 060 kN | — | 597 kW |

Kelly bars themselves are **3 250 to 15 850 kg** and **292 to 546 mm** outer pipe
diameter, giving 17 to 60 m of drilling depth `[EMDE-PF]`.

**Details that read at a glance:**

- **The tool carousel on the ground.** A Kelly site is surrounded by tools laid
  out flat: augers, buckets, core barrels, casings. This is the single best way
  to communicate "bored piling" visually.
- **A Kelly auger cleaner** — a hydraulic arm that strips spoil off the flights
  low down, adjustable across CFA diameters 400–2 000 mm `[TOM]` §3.3.1,
  `[BAU-CAT]`.
- **Spoil discharge system with a chute-bucket assistant** for directed ejection
  on the largest machines `[BAU-CAT]`.
- **Jack-up system** for fast rig-up and crawler removal, on the biggest class
  `[BAU-CAT]`.
- **Stability Plus**: additional horizontal movement of the mast `[BAU-CAT]`.
- An **all-electric variant** exists and looks the same but quieter: 300 kNm at
  50 rpm, electric rotary drive and electric main winch, **grid-independent for
  up to one 8-hour shift on battery, 7 h recharge at 125 A / 400 V** `[BAU-CAT]`.
  A perfect late-game "urban / night work" unlock.
- **Casing oscillator or casing rotator** as a separate attachment at ground
  level, gripping and twisting the casing string — a low, wide, hexagonal-looking
  machine that sits *around* the pile, not on the rig.

---

## C4. CFA rig

**The shape.** Superficially a Kelly rig, but the difference is unmistakable and
it is the whole point: **the auger is one continuous piece, as long as the pile,
and it is on the mast the entire time.** So the mast is *taller* relative to
everything else, and the machine's outline is dominated by a single enormous
screw. Special long-stroke rigs reach **34 m deep CFA piles** `[TOM]` §3.3.1.

**Distinguishing kit:**

- A **concrete hose** running from a concrete pump on the ground, up the mast, to
  a **swivel on the rotary head** — because the concrete is pumped down the
  hollow stem `[TOM]` §3.4.7. That hose is the CFA rig's signature and no other
  foundation machine has it.
- The **auger cleaner** working continuously as the auger comes up loaded with
  spoil.
- **A screen in the cab** displaying depth, torque, rotation speed and
  penetration rate while boring, then concrete pressure and flow while
  concreting `[TOM]` §2.4.2 — and, in the game, this is the HUD.
- A **cased CFA / double-rotary** variant adds a **second rotary head** driving an
  outer casing, so there are two drives stacked on the mast turning opposite ways.

Capability class in CFA configuration: max pile 26 m, max diameter 1 200 mm,
400 kNm torque, 100 t extraction, 36 t pull-down `[JUN-PILE]`.

---

## C5. Hydraulic grab (clamshell) for diaphragm walls

**The shape.** A **duty-cycle crawler crane** — lattice boom, two or three
free-fall winches — with a **rectangular two-jaw grab** hanging on ropes, or
guided on a kelly. The grab is *not* the round clamshell of a dredger: it is a
long, flat, blade-like box sized to the panel, so it opens into a rectangle. It
disappears into a slurry-filled trench and comes back up dripping grey bentonite
with a bite of soil in its jaws.

**Around it:** the **guide walls** (two parallel low concrete beams at ground
level defining the trench, about 1 m deep and 0.5 m thick,
https://en.wikipedia.org/wiki/Slurry_wall), the **slurry tanks and desanding
plant** with cyclones, and slurry hoses. The trench itself is a black slot in
the ground.

---

## C6. Hydromill / trench cutter (Schlitzwandfräse)

**The shape.** The most alien machine in foundation engineering, and worth the
modelling effort. A **tall rectangular steel frame** — a long flat cage —
suspended from a duty-cycle crane, with **two big counter-rotating cutter wheels
side by side at the very bottom**, studded with picks. Between and above the
wheels sits a **submersible slurry pump**. There is no bucket, no jaw: the ground
is milled and pumped away as a slurry.

**Numbers** `[BAU-CAT]`:

- Max cutting depth **90 m** · panel width **1 200 mm** · cutter weight **34.7 t**
- Turning range **−45° to +95°** — the cutter can be steered in plan
- Max hook load on the carrier **46 t**
- Separate **hydraulic power pack**: 500 kW electric at 690 V, 350 bar, 13.5 t,
  **6 031 × 2 400 × 2 542 mm** — mountable at the side, at the rear, **or
  remotely on the ground**, and swappable for a diesel unit
- Guaranteed sound power level with the electric pack: **LWA 105 dB(A)**

**Around it:** a much bigger **desanding plant** than the grab needs, because the
cuttings come up in the slurry, plus fat suction and delivery hoses running from
the trench to the plant.

---

## C7. Micropile / anchor rig — small, tracked, low

**The shape.** A tiny tracked chassis, often under 1 m wide, with a **short
feed beam (mast) that articulates in almost every axis** — it can point down,
sideways, up at the ceiling, and at compound angles for a raking anchor. A
**hydraulic drifter** (top hammer) rides the feed beam, sometimes with a rotary
head instead or as well. A **rod magazine** on the side holds the drill steel.
Hoses run to a separate power pack.

**Numbers** `[KLEMM]`:

| Class | Operating weight | Power | Min headroom | Min width | Single-pass depth |
|---|---|---|---|---|---|
| Confined-space | **4.9 t** | 55 kW (separate pack) | **2.0 m** | **780 mm** | — |
| Confined-space, on-board electric | 5.1 t | 45 kW | 2.2 m | 750 mm | — |
| Mid | 11.6–18.2 t | 129–175 kW | — | — | 12.5–20.0 m |
| Large | 21.9–32.0 t | 123–245 kW | — | — | up to 25.0 m |

- Rig range overall: **4 t to 32 t** operating weight `[KLEMM]`.
- **Hydraulic drifters, piston weight 6.8–28 kg**; **hydraulic rotary heads to
  61.5 kNm**; power packs 45–129 kW, diesel or electric `[KLEMM]`.
- **Rod handling for single and double drill strings** — the double-head rigs
  need to handle an outer casing and an inner rod at once `[KLEMM]`.
- **Excavator attachment versions** of the same drilling kit exist as a separate
  product family `[KLEMM]` — a cheap entry-tier silhouette.

The 2.0 m headroom / 780 mm width figures are the whole reason this machine
exists. **Show it working inside a building**, under a low slab, next to a
column. Nothing else in the foundation fleet can do that.

---

## C8. Jet grouting rig and plant

**The rig** looks like a micropile rig (C7) — same small tracked chassis, same
articulating feed beam — because it is one. The difference is entirely in what
is attached to it and behind it `[KLEMM]`, `[EMDE-AN]`:

- **A high-pressure swivel and hose** feeding the rod, rated for **700 bar** —
  visibly heavier than a drilling flush hose, usually armoured.
- **Two or three separate lines** for the double and triple systems (grout, air,
  water), so the hose bundle to the rig is thick and colour-coded.
- The rod itself is a coaxial tube (Ø 88.9 or 114.3 mm) ending in a **nozzle
  holder with a small, precisely angled side nozzle** — the jet exits sideways,
  not downward.

**The plant is the scene**, and it is bigger than the rig:

- **High-pressure injection pump: 240–600 kW, max 700 bar, max 400 l/min**
  `[KLEMM]`. This is a container-sized skid with a large diesel or electric
  drive.
- **Grout batching and mixing plant** — colloidal mixer plus storage: e.g.
  200 l mixing / 500 l storage at 8.0 m3/h, up to 500 l / 1 500 l at 18.0 m3/h
  `[KLEMM]`.
- **Suction hose pumps for the backflow (Rückfluss)** and a spoil pit or tank —
  the return is a real, messy, visible product, and managing it is part of the
  job `[KLEMM]`.
- **A drilling data recording system** — the record of pressure, flow, rotation
  and lift rate per column is the deliverable `[KLEMM]`.

---

## C9. Soil mixing rig

**Two distinct silhouettes**, and they should not be confused:

- **Auger mixing (DSM).** A leader rig running **one, two, three or four
  vertical mixing shafts side by side**, each ending in a mixing head with
  paddles and cutting teeth. With multiple shafts there are **running guides at
  the top and bottom** holding the shafts in formation `[EMDE-PF]`. Up to
  **4 independent rotary drives**, axis spacing up to 3 197 mm, panel length up to
  25.3 m with 914 mm tools, 30.5 m deep `[BAU-CAT]`.
- **Cutter soil mixing (CSM).** A **fixed-leader** rig running the same
  twin-wheel cutter geometry as a hydromill, but mixing instead of excavating:
  mixing gearbox **2 × 50 kNm**, panel **2 800 × 550 mm**, max depth **30.5 m**,
  128 t `[BAU-CAT]`. An electric version runs **2 × 200 kW motors, 0–40 rpm**,
  with no hydraulics at all — pitched for **sensitive soils where a hydraulic
  leak is unacceptable** `[BAU-CAT]`.

**Around it:** a **binder silo and mixing plant**, and — the production
constraint — the rig is designed for **simultaneous operation and refilling of
the binder containers** so it never stops `[JUN-PILE]`. Deep-stabilisation rigs
are noted for **lightweight construction and great agility** `[JUN-PILE]`; they
are visibly lighter and nimbler than a Kelly rig.

---

## C10. Support plant — the things around every rig

These are not background dressing; they are the reason the rig can work.

**The working platform.** The single most important piece of "ground" in the
game's foundation scenes. It must be **designed, properly constructed, regularly
inspected and maintained for the plant that will use it**, to the BRE **BR470
*Working Platforms for Tracked Plant*** specification, and evidenced by a
**Working Platform Certificate (WPC 4d)**; **about one third of dangerous
occurrences reported by FPS members involve working platforms** `[FPS-WP]`. The
revised jet-grouting standard now requires the platform's bearing capacity to be
proven per EN 1997-1 against rig loads calculated per **EN 16228-1 Annex F**
`[PANDREA]` §4.7. Visually: a flat, clean, granular mat, larger than the rig,
usually a different colour and texture from the surrounding ground, often with a
geotextile edge. **Rig tilt because the tracks sank into a poorly prepared
platform is a documented cause of bored piles wandering off position** `[TOM]`
§3.4.12 — so the platform is a hazard, not a decoration.

**The service crane.** A crawler or mobile crane is present on almost every
foundation site: it pitches piles, lands reinforcement cages, handles casings and
stop-end tubes, and moves tools. `[TOM]` shows cages being handled by crane on
CFA sites specifically because the cage must go in immediately after concreting
(§3.3.3). CPCS gives crawler crane over 10 t its own category (**A02**) and
slinger/signaller another (**A40**) `[CPCS]`.

**Power packs.** Almost every non-integrated tool needs one, and they are
visible, noisy boxes on the ground:

| For | Rating | Weight |
|---|---|---|
| Impact hammers | 321 kW or 503 kW, 350 bar, 760 or 1 040 l/min, 1 000/1 500 l oil tank | 5 900 / 8 700 kg `[JUN-HAM]` |
| Vibratory hammers | 160 kW to 1 170 kW, 232 to 2 000 l/min, 350 bar | 5 400 to 14 000 kg `[JUN-HAM]` |
| Trench cutter | 500 kW electric, 690 V, 350 bar | 13.5 t `[BAU-CAT]` |
| Micropile / anchor rigs | 45–129 kW, diesel or electric | — `[KLEMM]` |
| Jet grouting | 240–600 kW, 700 bar, 400 l/min | — `[KLEMM]` |

**Concrete supply.** Truck mixers plus a **concrete pump** for CFA, FDP and
tremie work. FPS has dedicated guidance for pumping concrete to form piles,
covering pipeline maintenance, **blockage management** and washout water
`[FPS-PLANT]` — a blocked line mid-pour is a real and modellable failure.

**Slurry plant.** Mixing (high-speed mixers), storage tanks, and a **desanding
plant** with cyclones for any bentonite or polymer job. Slurry is pumped into the
outer annulus and the slurry–soil mixture discharged from the airlift riser is
allowed to settle in lagoons or tanks, then cleaned in a cyclone with gelling
chemicals added before being pumped back `[TOM]` §3.3.8.

---

# D. Hazards and the correct response

Each entry is written the way the game needs it: **the tell** (what the crew sees
or hears first), **the mechanism**, **the correct action**, and **the wrong
action** that a player will instinctively reach for.

## D-summary table

| # | Hazard | First tell | Correct action | Wrong action |
|---|---|---|---|---|
| 1 | Pile head damage | Spalling concrete at the head; the dolly stops rebounding cleanly | Stop, replace dolly/packing, reduce drop, use a heavier ram at lower drop | Keep driving to "get the set" |
| 2 | Refusal short of design | Blow count climbs past 120–150 / 250 mm and keeps climbing | Stop; re-analyse; heavier hammer at lower drop, pre-drill below the toe, or insert pile | Raise the drop height |
| 3 | Obstruction | Sudden torque or blow-count spike; the pile starts to walk off line | Stop; pre-bore/chisel the obstruction; re-pitch | Drive harder; the pile bends or the toe brooms |
| 4 | Bore collapse | Volume of spoil exceeds theoretical; bore depth reads short on re-check | Case it, or raise the support-fluid head; re-clean the base | Carry on and concrete it |
| 5 | Necking / waisting | Concrete volume falls below theoretical at a specific depth band | Stop extraction, top up the head, keep the casing down until concreting is complete | Keep pulling the casing |
| 6 | Overbreak | Concrete volume far exceeds theoretical over a band | Log it and keep the head up — you are filling a cavity; check adjacent piles | Slow the pour to "save concrete" |
| 7 | Loss of bentonite head | Slurry level drops in the bore or trench | Top up immediately from the ready tanks; find the loss zone | Continue excavating |
| 8 | Cage float | Cage top rises above tolerance as casing is extracted | Stop, hold the cage down, re-establish the concrete head | Pull the casing faster |
| 9 | Vibration complaint / ppv exceedance | The ppv monitor alarms; neighbours call | Stop; switch to variable-moment start/stop, press-in, or impact with lower energy | Push through "just this pile" |
| 10 | Services strike | — | Stop everything, evacuate, isolate, notify | Investigate it yourself |
| 11 | Rig / leader instability | Tracks bedding in; mast out of plumb on the inclinometer | Stop, re-level, repair the platform | Continue on a soft platform |
| 12 | Tremie surfaced | Concrete pressure drops; the level plot steps | Special measures before continuing: re-immerse so the contamination sits above cut-off | Carry on pouring |

---

## D1. Pile head damage

**Tell.** Concrete spalling off the pile head; the packing squeezing out; the
sound of the blow changing from a crack to a dull thud; on a steel pile, the head
mushrooming.

**Mechanism.** *"Damage to a pile during driving is most likely to occur at its
head and toe"* `[TOM]` §1.4. The stress wave reflects: hard rock at the toe gives
a **compressive stress at the toe up to twice that at the head**; a long pile
into weak soil reflects a **tensile** wave and the pile is pulled apart `[TOM]`
§7.3. The magnitude of the stress wave depends mainly on **the height of drop**;
the **weight of the hammer** governs the length of the wave and therefore how
efficiently the blow keeps the pile moving `[TOM]` §7.3.

**Correct action.**

- **Reduce drop, not blows.** *"Damage to a pile can be minimized by reducing as
  far as possible the number of hammer blows necessary to achieve the desired
  penetration, and also by limiting the height of drop of the hammer to 1.5 m.
  This necessitates the use of a heavy hammer"* `[TOM]` §1.4. For hard driving
  the hammer should be at least equal in weight to the pile; for easy driving,
  half the pile weight `[TOM]` §1.4.
- **Change the dolly and packing.** They are consumables and their resilience
  changes with use, which changes the transmitted energy `[TOM]` §7.3.
- **Check the helmet fit** — it must not be tight; the pile has to be able to
  rotate when it hits something `[TOM]` §3.1.8.
- Stay within **0.8 fck** (concrete) and **0.9 fy** (steel), or **+10 % / +20 %
  respectively if driving stresses are being monitored** `[TOM]` Table 2.4.

**Wrong action.** Keep driving to hit an arbitrary set. *"The temptation to
continue hard driving in an attempt to achieve an arbitrary set for compliance
with some dynamic formula must be resisted."* And the reason is brutal: *"cases
have occurred where the measured set achieved per blow has been due to the
crushing and brooming of the pile toe and not to the deeper penetration required
to reach the bearing stratum"* `[TOM]` §1.4.

**And it is a people hazard, not only a pile hazard.** *"The safety of operatives
can be endangered if sustained hard driving causes pieces of spalled concrete or
mechanical components to fall from a height"* `[TOM]` §3.1.6.

---

## D2. Refusal short of design depth

**Tell.** The blow count climbs through 120–150 blows/250 mm — the practical
limit for sustained driving — and keeps going `[TOM]` §3.1.6. Or it hits the API
contract definition of refusal: **> 300 blows/ft (248 per 250 mm) over 1.5
consecutive metres, or 800 blows/ft (662 per 250 mm) over 0.3 m** `[TOM]` §3.1.6.

**Mechanism.** Either you have hit the bearing stratum earlier than expected — in
which case the pile may be fine — or you are on a random compact layer, a
boulder, or an obstruction, and the pile is short. **A minimum penetration into
the bearing stratum is necessary precisely because random compact layers cause
localised areas of high driving resistance** `[TOM]` §11.3.1.

**Correct action.**

- **Compare the driving record against the ground investigation data** for that
  layer, and set the termination level from that comparison, not from the blow
  count alone `[TOM]` §11.3.1.
- If stresses would be excessive: **use a heavier hammer** (more mass, lower
  drop). If greater hammer weight and lesser drop still overstress the pile, the
  remaining options are **drilling below the pile toe** or **using an insert pile
  of smaller diameter** `[TOM]` §7.3.
- Consider **jetting or pre-boring** to reduce the amount of driving required
  `[TOM]` §1.4.
- **Re-drive** after the appropriate delay (a few hours in granular, 12 h in
  silts, 24 h+ in clays). If re-driving shows reduced resistance after ~20 blows,
  continue until the original final set is regained `[TOM]` §11.3.1.

**Design nuance worth teaching.** *If* the penetration depth was calculated
properly for a friction pile, the depth into the bearing stratum should
theoretically be the only criterion and final sets should be irrelevant. In
practice, driving to **both** a minimum depth **and** a constant final set (or a
specified range of set) is how natural variation in soil properties is
accommodated `[TOM]` §11.3.1.

---

## D3. Obstruction

**Tell (driven).** A torque or blow-count spike out of nowhere; the pile starts
to walk off line; the helmet lets the pile rotate. *"Driven piles tend to move
out of alignment during installation due to obstructions in the ground or the
tilting of the piling frame leaders"* `[TOM]` §3.4.12.

**Tell (bored).** The tool stops advancing; the spoil changes; the rig torque
peaks and the Kelly bounces.

**Correct action.**

- Bored: switch tool. A rock bucket, a core barrel matched to the strength band
  (§A5), or **heavy chisels** — the classic tool for breaking up boulders and
  other obstructions before drilling on `[TOM]` §2.4. *"Drilling tools can break
  up boulders or other obstructions which cannot be penetrated by driven piles"*
  is one of the standing advantages of bored piling `[TOM]` §2.7.
- Driven, open-ended tube: drill ahead of the shoe. But note the specific trap —
  when the drill penetrates below the shoe of the pile tube **it tends to drop by
  gravity and then fouls the shoe as it is pulled out**; under-reaming tools jam
  the same way. **The drill must not be allowed to penetrate deeply below the toe
  of the pile.** The result is frequent alternation of drilling and driving,
  with the hammer coming off and going back on each time — a real, costly time
  penalty `[TOM]` §3.4.11.
- Rake makes it worse: fouling risk is lower at small rake (say 1 in 10 or
  flatter) and with the drill string properly centralised in the pile tube
  `[TOM]` §3.4.11.

**Wrong action.** Drive harder. The pile bends ("bananas"), the toe brooms, and
the damage is invisible from the surface — which is why alignment deviation at
the head is treated as **an indicator of breakage below ground** `[TOM]` §11.3.1.

---

## D4. Bore collapse

**Tell.** More spoil comes up than the theoretical volume of the bore. On a
re-check before concreting, the measured depth of the pile bottom is **less than
the drilled depth** — soil has fallen in `[TOM]` §3.4.6.

**Mechanism.** Even stiff fine-grained soils are frequently fissured or contain
sand pockets that collapse into the bore, leaving loose soil at the toe or
discontinuities in the shaft `[TOM]` §3.3.8. Below the water table, sand
over-gauges and clay smears. Tilting the rig or operating the auger violently
leads to misalignment and forces corrective reaming of the sides `[TOM]` §3.4.6.

**Correct action.** Case it, or raise the support-fluid head, or both. **Do not
withdraw the casing until the placing of concrete is complete** `[TOM]` §3.4.6.
Re-clean the base and re-check depth against drilled depth — and remember the
**6-hour limit** between final clean-out and concreting `[TOM]` §3.4.6.

**Prevention.** *"Favourable conditions for stability of the borehole are given
by care in setting up the rig on a firm level base and attention to maintenance
of verticality"* `[TOM]` §3.4.6. Casings protecting open pile bores must extend
above ground level and **be provided with a strong cover** — an open hole is an
open hole `[TOM]` §3.4.6.

---

## D5. Necking, waisting and overbreak

This is the concrete-integrity family, and `[TOM]` §3.4.6 gives an unusually
clean list of causes and remedies for defects in a bored pile shaft. It is worth
implementing almost literally as a hazard table:

| Cause | Remedy |
|---|---|
| Hardened concrete or soil encrusted **inside the lining tubes** lifts the concrete as the tubes are withdrawn, leaving gaps | The tubes must be clean before they go down the hole |
| Falling concrete **arches and jams** across the lining tube, or between tube and reinforcement | Use concrete workable enough to slump easily down the hole and fill all voids |
| Concrete **jams between the reinforcing bars** and does not flow out to the bore wall | Generous space between bars; a cage stiff enough not to twist or buckle; **widely spaced stiff hoops rather than helical binding**; check bars have not moved together before lowering |
| **Lumps of clay fall** from the bore wall or lining tubes into the concrete | Always use lining tubes if the soil is potentially unstable; do not withdraw them prematurely; clean adhering clay off the tubes before insertion and after drilling |
| **Soft or loose soils squeeze in from beneath the casing toe as it is withdrawn — necking / waisting** | **Do not withdraw the casing until concreting is complete. Check the volume of concrete placed against the theoretical volume, and if there is a significant discrepancy, remove and replace the concrete.** |
| **Bentonite flows into the concrete** because the disturbed slurry in the annulus is at higher pressure than the fluid concrete when the casing lifts | *"This is a serious defect and is difficult to detect."* Watch the level and density of the bentonite gel as the casing lifts; watch for changes in the concrete surface level and for bentonite appearing in the concrete. If inflow has occurred, remove and replace the defective concrete and **abandon the mudding-in technique** |
| **Groundwater infiltration** causing gaps or honeycombing | Use the underwater-concreting techniques (tremie, raised water level) |

**The instrument that catches all of it** is the same one: **concrete volume
against theoretical volume, plotted against depth.** EN 1538:2010 Annex C gives
an example of exactly this concreting graph `[EFFC]`; CFA logs record under- and
over-supply automatically `[TOM]` §2.4.2; DCIS requires the placed quantity to be
recorded per pile `[TOM]` §11.3.2. **Make this the game's core bored-pile
readout.**

Overbreak — volume far *above* theoretical — is not a defect in itself; it means
you are filling a cavity or a washed-out zone. The correct response is to keep
the concrete head up and log it, then check whether adjacent piles will meet the
same void.

---

## D6. Loss of bentonite / support-fluid head

**Tell.** The slurry level in the bore or trench drops. In a diaphragm-wall
trench the rule is explicit: **the support-fluid level must not fall more than
30 cm below the top of the guide wall** `[STEIN]`.

**Mechanism.** The support is hydrostatic. Losing head loses the trench. In
granular soil the filter cake buys time; in an open fissure or a gravel lens it
buys none.

**Correct action.** Top up immediately from the ready tanks — which is why the
slurry plant is sized for it. Keep the fluid inside spec: before concreting,
**density < 1.15 g/cm3 and sand content < 4 % by volume** `[EN1536]`. If the mud
has flocculated and become sand-charged **above 1 350–1 400 kg/m3, replace it
with a lighter mud before concreting and clean the base** `[TOM]` §3.4.8. If the
slurry is overloaded with solids, the filter cake will be thick and will not be
scoured off by the concrete — **a mechanical scraper may be needed before
concreting** `[TOM]` §3.3.8.

**Adjacent failure.** Even with the head maintained, the concrete has to
**overcome the external slurry head, rupture the gel and overcome friction in
the tremie pipe.** In one documented case, a 1 600 kg/m3 mud was needed to hold
18–21 m boreholes open, the concrete then failed to displace the gel stiffened by
high ground temperatures, and jamming occurred every time placing was suspended
to remove a tremie section. It was solved with a plasticiser plus a retarder, and
by lifting the tremie out **as a single unit** `[TOM]` §3.4.8.

---

## D7. Cage float

**Tell.** The cage top is above tolerance when checked after casing extraction.
EN 1536 allows **±0.15 m** on cage top elevation after concreting `[EN1536]`.

**Mechanism.** The rising concrete, or the friction of the extracting casing,
lifts the cage. EN 1536 addresses it directly in the casing-extraction clause:
extraction shall not begin until the concrete column has reached sufficient
height to generate excess pressure **against water and soil inflow *and* cage
uplift** `[EN1536]` cl. 8.4.4.1.

**Correct action.** Hold the cage down (it should be suspended from the top of
the shaft if it does not reach the base `[TOM]` §3.4.6), re-establish the
concrete head, and slow the extraction. **Check the cage level on every pile** —
for DCIS this is mandated as the safeguard against the concrete being lifted with
the tube `[TOM]` §11.3.2.

**Related.** Keep circumferential steel to a minimum where concrete is placed
under bentonite `[TOM]` §3.4.8, and use widely spaced stiff hoops so the cage
cannot buckle `[TOM]` §3.4.6.

---

## D8. Vibration damage to neighbours

**Tell.** The ppv monitor alarms; or the phone rings, which usually happens
first. Human response to vibration is more sensitive than the damage threshold —
*"there is little evidence to show that ground-borne vibrations cause structural
damage to buildings"* `[TOM]` §3.1.7.

**Thresholds** (BS 5228, to avoid cosmetic damage, 10–50 Hz) `[TOM]` §3.1.7:
residential **10 mm/s ppv intermittent, 5 mm/s continuous**; heavy and stiff
buildings 30 and 15 mm/s. Protected buildings, buildings with existing defects
and statutory services are subject to specific lower limits.

**The specific mechanism to model.** A constant-moment vibrator's **start-up and
shut-down transient** passes through a critical frequency that can resonate with
a nearby building and produce a short burst of high-amplitude vibration `[TOM]`
§3.1.5.

**Correct action, in order of cost:**

1. **Use a variable-moment machine** — start and stop with the eccentric masses
   balanced, so the machine reaches full speed before the moment is dialled up
   `[JUN-VIB]`. High-frequency (> 30 Hz) variable-moment units have reduced ppv
   to **as low as 3 mm/s at 2 m**, at the cost of power `[TOM]` §3.1.5.
2. **Switch method.** Press-in installs and extracts sheets **without vibration**
   at around 60 dB(A) `[TOM]` §3.1.7.
3. **Survey the buildings first** and monitor throughout. BS 7385 covers methods
   of assessing vibration in buildings and gives guidance on potential damage
   levels `[TOM]` §3.1.7.

`UNVERIFIED`: the DIN 4150-3 equivalent table for German sites. Source it before
a DACH contract states a number.

---

## D9. Services strike

**Tell.** Ideally none — a strike is felt, not seen.

**The honest position.** This pass did not source a piling-specific services
guidance document, so the game should not put a numeric rule on screen.
`UNVERIFIED` for any specific procedure or clearance distance.

**What is sourceable and safe to model:** a pile position is fixed by the
**setting-out surveyor** from the setting-out drawing `[TOM]` §3.4.12, and the
whole point of positional tolerance control is that the pile ends up where the
design put it. The in-game framing that follows from that, without over-claiming:
**the contract supplies a services drawing and a permitted position; drilling
outside the permitted position is the player's risk.** Response on a strike:
stop, evacuate, isolate, notify — and that is a generic construction-safety
sequence, not a piling-specific claim.

---

## D10. Rig, leader and platform stability

**Tell.** The tracks bed in; the mast goes out of plumb on the **electronic
inclinometer** `[JUN-PM25H]`; the rig "walks" as it drills.

**Mechanism.** *"In the case of bored piles the auger can wander from the true
position or the drilling rig may tilt due to the wheels or tracks sinking into a
poorly prepared platform"* `[TOM]` §3.4.12. Under the hammer, **the vertical load
of pile and hammer on the leaders must be taken into account**, and where piles
are driven in guides without leaders, the **bending stresses caused by the weight
of the hammer on the upper end of the pile must be added to the driving
stresses** `[TOM]` §3.4.11.

**Correct action.** Stop and fix the ground. The working platform is a designed
element: BR470 *Working Platforms for Tracked Plant*, evidenced by a **Working
Platform Certificate (WPC 4d)**, designed and maintained **for the plant which
will use it**, with FPS publishing a calculation tool for the bearing pressures
tracked plant imposes — and about **one third of dangerous occurrences reported
by FPS members involve working platforms** `[FPS-WP]`. EN 12716 now requires
platform bearing capacity to be proven per EN 1997-1 against rig loads per
EN 16228-1 Annex F `[PANDREA]` §4.7.

**Two secondary rules that read as gameplay:**

- **Spoil must be removed from an auger at the lowest possible level during
  extraction** — an EU mandatory safety requirement — so debris cannot fall on
  personnel, damage machinery, or destabilise the rig `[TOM]` §3.3.1.
- **Rake limits are real and method-specific.** Self-erecting leader rigs can
  drill open holes at rakes up to **1 in 1**, but where casing has to be drilled,
  **rakes flatter than 1 in 3 are difficult to manage**; power augers manage up
  to 1 in 3; driven cast-in-place with an internal drop hammer manages **not
  flatter than 1 in 3.7** because of hammer friction inside the tube `[TOM]`
  §3.4.11. And for raking pile shells, use an over-sanded mix — **475 kg/m3 of
  coarse aggregate with a corresponding increase in cement and sand to give a
  100 mm slump**, pumped down the raking tube `[TOM]` §3.4.11.

---

## D11. Tremie surfaced / lost immersion

**Tell.** Concrete pumping pressure drops suddenly; the concrete-level plot
steps.

**Mechanism.** The tremie toe has come out of the concrete and the pipe is now
discharging through water or slurry. Cement washes out; laitance forms; the pile
has a plane of weakness across it.

**Correct action.** EN 1536 is explicit that **if immersion is lost during
concreting, special precautions are required before placement can continue — for
example re-immersing the tremie so that any contamination will be above the final
cut-off level** `[TOM]` §3.4.8, `[EN1536]` cl. 8.4.3. In practice that means the
defect is pushed up into the part of the pile that will be trimmed off.

**Prevention.** Keep the minimum immersion (1.5 m general, 2.5 m for D ≥ 1.2 m,
3.0 m for barrettes `[EN1536]`; 3 m is the well-accepted practical minimum,
5 m before the first pipe cut, 2 m as the end-of-pour minimum `[EFFC]`). And do
not substitute a bottom-opening skip for a tremie: the crane operator cannot tell
from the rope whether the bucket is at the right level in the fluid concrete, and
releasing the flap early washes the cement out through the water `[TOM]` §3.4.8.

---

## D12. Heave and adjacent-pile interaction

**Tell.** Previously driven piles rise; sets are lost; a pile that had reached
its final set no longer will.

**Mechanism.** Driving piles in groups causes **horizontal ground movements that
deflect the piles** `[TOM]` §3.4.12, and displacement piling heaves the ground.
Driven displacement piles **can be redriven if affected by ground heave** —
that is listed as one of their standing advantages `[TOM]` §2.7.1. In soft clay,
heaved soil tends to slump back down within days of driving `[TOM]` §5.9.

**Correct action.** Re-drive the affected piles to the original final set
`[TOM]` §11.3.1. Respect spacing: centre-to-centre spacing in clay of **at least
three pile diameters, with a minimum of 1 m**; for friction piles, not less than
the pile perimeter, or three diameters for circular piles; closer spacing is
allowed for predominantly end-bearing piles but the clear space between adjacent
piles must not be less than their least width `[TOM]` §5.2.

---

## D13. Integrity — how you find out you were wrong

Every hazard above ends in the same question: is the pile sound? The available
answers, classified `[TOM]` §11.5:

**Direct** — visual inspection during and after installation (including
excavation or extraction); load testing (static, dynamic, internal compression);
drilling, coring or probing alongside or into the pile.

**Indirect** — sonic logging or nuclear backscatter down preformed ducts, CCTV
inspection, water or air pressure testing, calliper dimensional logging;
low-strain acoustic integrity testing and high-strain dynamic measurement from
the pile head; ultrasonic pulses; electrical resistivity; and "parallel seismic"
from a borehole alongside the pile.

Practical notes worth turning into mechanics: a complete pile can rarely be
examined economically by excavation or extraction; **cores are only likely to be
recovered from sound concrete, so the defective zones are exactly the ones that
do not come up**; heavy water losses when a drill hole is filled indicate
defective concrete; calliper logging reveals overbreak `[TOM]` §11.5. And the
neat trick for precast piles: **cast a thin electric cable down the shaft and
test for continuity with a light bulb after driving — if the pile is broken, the
circuit is broken** `[TOM]` §11.5.

---

# E. Game mechanics proposal

## E0. The unifying rule that makes three sliders survive twelve methods

`GAMEDESIGN.md` §3 defines Feed / Rotation / Flush. Foundation work breaks that
literally — a hammer does not rotate and does not flush — but it does **not**
break the underlying shape. Restate the three axes semantically and every method
fits:

| Axis | Meaning | Drilling | Driven piling | Bored / CFA (concreting) | Jet grouting |
|---|---|---|---|---|---|
| **A — Advance** | How hard, or how fast, you move along the axis | Feed (WOB) | **Hammer energy** (stroke / drop height) | **Withdrawal / lift rate** | **Lift rate** |
| **B — Work** | The rate of the working action | Rotation / percussion | **Blow rate** | **Rotation during extraction** | **Rotation rate** |
| **C — Protect** | Whatever keeps the thing you are making intact | Flush (clears the hole) | **Alignment / seating** (protects the pile) | **Concrete pressure & supply** (protects the shaft) | **Jet pressure & flow** |

**Axis C is the through-line of the whole game.** In drilling it protects the
hole. In piling it protects the pile. Same slider, same instinct, same "if you
neglect it, the thing you are making is destroyed" consequence. That is a
better unifying idea than "flushing" ever was, and it is worth adopting
game-wide.

### The full per-method slider map

| Method | A — Advance | B — Work | C — Protect |
|---|---|---|---|
| Driven piling | Hammer energy (stroke) | Blow rate | Alignment / hammer seating |
| DCIS — drive phase | Hammer energy | Blow rate | Alignment |
| DCIS — concrete phase | Tube extraction rate | Tapping rate | Concrete supply |
| Vibratory driving | Crowd / line pull | Frequency | Eccentric moment (amplitude) |
| Vibratory extraction | Lift force | Frequency | Eccentric moment |
| Sheet piling (press-in) | Press force | Stroke rate | Interlock threading / verticality trim |
| Bored Kelly — bore | Crowd | Rotary speed | Support (casing advance or fluid head) |
| Bored Kelly — concrete | Tremie lift rate | Casing extraction rate | Concrete supply rate |
| CFA — bore | Crowd | Auger speed | *(locked — see E3)* |
| CFA — concrete | Withdrawal rate | Auger rotation during extraction | **Concrete pump pressure** |
| Cased CFA | Crowd | Auger speed | Casing lead (casing rpm / advance) |
| FDP — down | Crowd | Rotation | *(locked)* |
| FDP — up | Extraction rate | Rotation | Concrete supply |
| Micropile / anchor | Feed | Rotation / percussion | **Flush** *(the one method that keeps all three literally)* |
| D-wall grab | Grab drop & close | — *(replaced by a rhythm tap)* | Slurry level |
| D-wall cutter | Crowd | Cutter wheel speed | Slurry return pump rate |
| Soil mixing | Penetration / lift rate | Mixing speed | Binder injection rate |
| Jet grouting | Lift rate | Rotation rate | Jet pressure & flow |

---

## E1. Driven piling — the control scheme, in full

### The three controls

**A — Hammer energy.** Real hammers are energy-adjustable across an enormous
range: **235 kNm at the top and 12 kNm at the bottom on the same 16 t ram
machine** `[JUN-HHK]`. Present it as the stroke/drop height, because that is what
governs the stress wave `[TOM]` §7.3, and cap the slider at the real safety rule:
**drop height 1.5 m** `[TOM]` §1.4.

**B — Blow rate.** Real range **30–100 bpm** on the heavy classic hammers,
**50–180 bpm** on the high-rate steel-driving series `[JUN-HAM]`.

**The coupling that makes it a real decision — do not skip this.** On a real
hammer the two are on the *same hydraulic circuit* and trade off against each
other: the 16 t machine gives **235 kNm at 30 bpm, or 12 kNm at 100 bpm**
`[JUN-HHK]`. So:

```
energy × blow_rate <= hammer_hydraulic_power    (a hyperbolic envelope)
```

The player is choosing a point on a curve, not two independent numbers. Big
slow blows or fast light ones. That single constraint is the whole feel of pile
driving and it is free — it is simply true.

**C — Alignment / seating.** Sourced directly: *"the energy delivered by the
hammer to the pile depends on the accuracy of alignment of the hammer, the type
of packing inserted between the pile and the hammer, and on the condition of the
packing material after a period of driving"* `[TOM]` §3.1.6. Model it as a fine
trim that:

- **drifts** as the pile rotates on obstructions (the helmet is deliberately
  loose so the pile *can* rotate `[TOM]` §3.1.8);
- **decays** as the dolly and packing degrade over the drive;
- multiplies the delivered energy — the difference between a 65 % and a 90 %
  hydraulic-hammer efficiency `[TOM]` §3.1.6;
- when badly out, drives **pile head damage** rather than penetration.

### The taps

- **Pitch** (start of pile) — a timing window as the winch stands the pile in
  the leader guides. Nail it, save 20 s; miss it, the banksman re-slings.
- **Change dolly / packing** — mid-drive, costs time, restores axis C headroom.
  This is the consumable purchase from the shop made physical.
- **Take the set** — the end-of-pile minigame (below).
- **Re-strike** — after the delay (few hours granular, 12 h silt, 24 h+ clay
  `[TOM]` §11.3.1) on a later shift; a separate short activity that can rescue or
  condemn a pile.

### The gauge — replace torque with blow count

The drilling minigame's torque gauge with a moving green band becomes a
**set gauge**:

- The needle reads **current set, mm per blow** (equivalently blows per 25 mm).
- The **green band is the design set window** for this contract, derived from the
  design capacity and the hammer.
- Below the band = you are over-driving (damage accumulating). Above the band =
  you are not making capacity yet.
- **The groove**: hold inside the band and the multiplier ramps exactly as
  `GAMEDESIGN.md` §3 specifies, with the audio locking to the blow rhythm. Pile
  driving is *already* rhythmic; this is the easiest groove in the game to sell.

### Driving to set — the scoring model

```
STATE PER PILE
  depth               m
  set[]               array of blows per 250 mm over full depth,
                      then blows per 25 mm over the final metre
  head_damage         0..1
  toe_damage          0..1
  driving_stress      fraction of 0.8*fck (concrete) or 0.9*fy (steel)

THRESHOLDS  (all sourced, §A1)
  practical_limit     120..150 blows / 250 mm     -> amber warning
  short_burst_limit   200 blows / 250 mm          -> allowed briefly only
  refusal_A           248 blows / 250 mm sustained over 1.5 m
  refusal_B           662 blows / 250 mm over 0.3 m
  max_drop            1.5 m
  monitored_bonus     +10% stress allowance (concrete), +20% (steel)
                      -- unlocked by buying PDA instrumentation

DAMAGE
  head_damage += f(drop_height, misalignment, dolly_wear) per blow
  toe_damage  += g(toe_resistance_spike, drop_height) per blow
  -- the trap: when toe_damage is high, MEASURED SET IMPROVES while
     real penetration does not.  [TOM] 1.4.  Show the set gauge lying.
     Only the depth counter tells the truth.

END OF PILE — "take the set"
  Final 250 mm is a dedicated beat:
    - camera pushes in on the pile head
    - the paper card + straight-edge appear (or the rig's stroke counter,
      if the player owns the upgrade)
    - a pencil trace draws live, separating TEMPORARY COMPRESSION from
      PERMANENT SET   [TOM] Fig 11.5
    - the player must hold energy and alignment steady for 10 blows
  Score the pile on:
    set within window        (pass/fail)
    toe level into bearing stratum reached  (pass/fail)
    head_damage, toe_damage  (grade)
    blows used vs par        (grade)
    driving_stress never exceeded  (grade)
```

**Why this is good.** It is the first minigame in the game where **the meter can
lie to you** — a brooming toe produces a beautiful set — and the counter-check is
a different instrument (depth into the bearing stratum). That is a genuinely
sophisticated skill expression and it is 100 % real `[TOM]` §1.4.

### Contract-level scoring: buying down the safety factor

The Eurocode 7 correlation factors are a *ready-made economic minigame*
`[EC7]` Annex A:

| Static tests | ξ₁ (mean) |
|---|---|
| 1 | 1.40 |
| 2 | 1.30 |
| 3 | 1.20 |
| 4 | 1.10 |
| ≥5 | 1.00 |

| Dynamic tests | ξ₅ (mean) |
|---|---|
| ≥2 | 1.60 |
| ≥5 | 1.50 |
| ≥10 | 1.45 |
| ≥15 | 1.42 |
| ≥20 | 1.40 |

…**× 0.85 if signal matching is used**, and **× 1.10 or × 1.20 if you fall back
to a driving formula** (with or without quasi-elastic head displacement
measurement) `[EC7]`.

**Mechanic:** at contract acceptance the player chooses a test regime. More tests
and better instrumentation cost money and days, and *reduce the number of piles
the job needs.* Cheap out, and you drive more piles for the same building. That
is the actual commercial decision a foundation contractor makes, and it turns a
dry table into strategy.

---

## E2. Bored piles (Kelly) — four phases, one clock

**Phase 1 — Bore.** A = crowd, B = rotary speed, C = support (casing advance, or
support-fluid head). The section fills with the strata log as you cut. Tool
choice matters and is checked against the ground: an auger in rock does nothing;
a rock bucket is rated **< 50 MPa**; a replaceable-teeth core barrel handles
reinforced concrete and **< 150 MPa**; a carbide-pin barrel handles very hard
rock; a roller-bit barrel handles **> 100 MPa** `[BAU-KBFK]`, `[BAU-KRWS]`,
`[BAU-KRRM]`. Wrong tool = torque spike, no progress, wear.

**Phase 2 — Clean out, and the clock starts.** A visible **6-hour countdown**
(compressed to game time) from final clean-out to concrete `[TOM]` §3.4.6. Every
subsequent decision costs clock. This is the best pressure device in the whole
foundation branch and it is a real rule.

**Phase 3 — Cage.** A crane beat. Cover, spacers, cage length, and — if the cage
does not reach the base — **suspend it from the top of the shaft** `[TOM]`
§3.4.6.

**Phase 4 — Tremie concrete.** A = tremie lift rate, B = casing extraction rate,
C = concrete supply rate. **The immersion bar is the gauge**: keep the tremie toe
between the minimum (1.5 m; 2.5 m if D ≥ 1.2 m; 3.0 m for barrettes `[EN1536]`)
and the maximum (6 m per SPERW, 12 m for piles ≤ 750 mm `[EFFC]`). Surface it and
you take the §D11 penalty. Lose the concrete head as the casing comes up and you
neck the pile.

---

## E3. CFA — and why concrete pressure is the tension

CFA is the cleanest expression of the whole design, because **the danger is not
the ground, it is the void you create by moving up.**

### Boring down

A = crowd, B = auger speed. C is **locked** — there is nothing to protect yet,
because the flights and the spoil sitting on them *are* the support.

**The gauge for this phase should be penetration per revolution**, because that
is precisely what the real data logger records `[TOM]` §11.3.3 and it is the
number that catches the two real failure modes:

- **Over-rotation → flighting**, in loose silty sands: vertical movement of the
  soil on the auger relative to the bore wall, disturbing the surrounding soil
  and **reducing shaft resistance by up to 30 %** `[TOM]` §2.4.2. Punish it as a
  hidden capacity loss revealed at the end — the player *feels* fine while
  drilling and is graded down at handover. That is exactly how it works in real
  life.
- **Over-rotation → polishing**, in stiff clays: a smeared, glazed shaft with no
  friction `[TOM]` §2.4.2.

Ground gates the method: **cu > 15 kN/m² and no boulders for CFA; UCS < 20 MPa
for cased CFA** `[BAU-CFA]`. Hit a boulder and the correct answer is *change
method*, not push harder.

### Concreting up — the tension

A = withdrawal rate, B = auger rotation during extraction, C = **concrete pump
pressure**.

**The rule, and it is already in `FACTS_VERIFIED.md`:** the auger is not lifted
until concrete is pumping and **sufficient pressure has built up** `[TOM]`
§2.4.2. Then withdrawal and pumping have to stay matched, metre by metre.

```
THE CORE LOOP, PER METRE OF WITHDRAWAL

  V_theoretical = pi/4 * D^2 * 1 m
  V_actual      = integral of pump flow over that metre
  ratio         = V_actual / V_theoretical

  ratio < 1.0   ->  NECK.  The void behind the auger was not filled.
                    Permanent, hidden, and it will show on the pile log.
  ratio ~ 1.0   ->  perfect
  ratio > 1.0   ->  OVERBREAK. Not a defect - you are filling a cavity -
                    but it is concrete you paid for. Log it.

  pressure < P_min at any moment -> the auger is effectively lifting dry.
                    Immediate integrity failure.
```

**Why this is the best tension in the game.** The player wants to go fast
(withdrawal rate = production = money). Going fast drops the pressure and the
volume ratio. Going slow burns the shift and over-supplies concrete. And **the
consequence is invisible until the log prints** — the pile looks perfect from
the surface. `[TOM]` §2.4.2 says exactly this: unlike a conventional bored pile,
you *cannot* inspect the soil during installation, which is why the whole method
depends on instrumentation and workmanship.

### The HUD is the real HUD

Put the actual cab display on screen `[TOM]` §2.4.2:

- **Boring:** auger depth · torque · rotation speed · penetration rate
- **Concreting:** concrete pumping pressure · flow rate
- **On completion:** the **pile log** — a printed strip showing construction
  parameters and the **under/over-supply of concrete against depth**

That printed log should be the end-of-contract results screen. It is the real
deliverable, it is beautiful as an object, and it grades the player without a
single invented metric.

---

## E4. The other methods, in one line each

- **Vibratory.** A = crowd/pull, B = frequency, C = **eccentric moment**. The
  minigame is the **start/stop transient**: bring the moment up only after the
  frequency is above the critical zone, and drop it before slowing down
  `[JUN-VIB]`. A ppv meter on the nearest building is the second gauge, with
  hard limits at **10 mm/s intermittent / 5 mm/s continuous** for residential
  `[TOM]` §3.1.7. Fail it and the job is suspended.
- **Sheet piling.** Two modes to choose at contract start: **pitch-and-drive**
  (fast, verticality error accumulates) or **panel driving** (slow, error
  controlled). The failure state is a **declutched interlock** — visible in the
  section as a gap in the wall.
- **FDP.** No spoil, so there is no cuttings particle system and no spoil pile —
  which is itself a striking visual difference. The gate is numeric and hard:
  **SPT N30 < 30 or CPT < 10 MPa** `[BAU-FDP]`. The failure is stalling short of
  depth on torque.
- **Micropile / anchor.** The only method that keeps Feed / Rotation / Flush
  literally. The second half is the **stressing beat**: jack, proof load, lock
  off, and every working anchor takes an **acceptance test** `[EN1537]`.
  Drilling deviation limit **1/30 of anchor length** `[TOM]` §6.7 gives a
  straightness score.
- **Diaphragm wall.** Panel sequence as a small puzzle: primaries, then
  secondaries between them. Two gauges: **verticality (1 %)** `[STEIN]` and
  **slurry spec** (level not more than 30 cm below the guide wall top `[STEIN]`;
  sand < 4 % before concreting `[EN1536]`). Concrete rise rate **≥ 3 m/h**
  `[STEIN]`.
- **Soil mixing.** A = penetration/lift rate, B = mixing speed, C = binder
  injection rate. Score = binder dosage delivered on profile + column continuity.
  Binder choice is a real decision: **lime, fly ash, gypsum or cement, by soil
  type** `[JUN-PILE]`.
- **Jet grouting.** A = lift rate, B = rotation rate, C = jet pressure and flow,
  with **250 bar as the floor below which it is not jet grouting at all**
  `[PANDREA]`. The hidden variable is **soil erodibility** — cohesionless erodes
  more than cohesive `[KELLER-JET]` — so the same settings make a fat column in
  sand and a thin one in clay, and the player only learns the diameter from the
  **sampling regime: 4 samples per 500 m³ non-cohesive, per 250 m³ cohesive**
  `[PANDREA]`.

---

## E5. What the two bands show

### Surface view (54 %)

Per `GAMEDESIGN.md` §1, cinematic 3/4, golden hour. For foundation work it must
show, at minimum:

- **The working platform** as a distinct, deliberate surface — a clean granular
  mat, wider than the rig, differently textured from the surrounding ground. It
  is a designed element with a certificate `[FPS-WP]` and it should look like
  one. Let it rut and darken as the shift goes on; that is the D10 tell.
- **The rig**, one of the nine silhouettes in §C, with its real moving parts:
  expandable tracks, movable counterweight, raking leader, two winches.
- **The banksman** on the ground, in hi-vis, giving signals for every lift
  (§B8). He is what makes the scene read as work.
- **The tool carousel** for a Kelly rig — augers, buckets, core barrels and
  casing sections laid out on the platform. Instantly communicates "bored
  piling".
- **The cage**, standing or being craned in, for any cast-in-situ method.
- **The concrete truck and pump** with the hose running up the mast to the swivel
  for CFA — the CFA rig's signature (§C4).
- **The slurry plant** — mixers, tanks, cyclone desanders — for anything using
  bentonite.
- **The spoil**, or its pointed absence: FDP and jet grouting produce almost none
  and a return respectively, and both of those are visual statements.

### Cross-section (46 %) — a pile, not a borehole

This is the part `DESIGN_EXPANSION.md` §1 has not yet covered, and it needs its
own `profileMode`. Call it **`pile`**. What it draws:

1. **The strata**, as now — but the log is built *from the drilling*, not
   pre-revealed.
2. **The pile as a solid object with a real diameter that varies.** Not a line,
   not a hole. Draw the **as-built profile**: the actual concrete column, wider
   than nominal where you overbroke, pinched where you necked. This is the single
   most important change from the drilling section, and it is the payoff for the
   volume-ratio mechanic.
3. **The reinforcement cage** inside the concrete, with visible **cover** to the
   bore wall — 50 mm for D ≤ 0.6 m, 60 mm above that, 75 mm for barrettes
   `[EN1536]`. Cage top at its tolerance band **±0.15 m** `[EN1536]`; cage float
   pushes it out of the band visibly.
4. **The toe in the bearing stratum**, with the penetration into that stratum
   called out. For a driven pile, the toe is the score.
5. **The casing**, drawn following the bore down and retracting during
   concreting, with the concrete head **inside** it — because the head inside the
   casing balancing the external pressure is the entire physics of §D5.
6. **The tremie pipe**, with its **immersion depth annotated live** and the
   minimum/maximum band shaded. Surfacing it should be as viscerally alarming as
   losing flush return is in the drilling section.
7. **The water table**, and the support-fluid level where one is used — with
   the 30 cm-below-guide-wall line marked on diaphragm-wall jobs `[STEIN]`.
8. **For driven piling: the driving log IS the depth ruler.** Real pile records
   are blows per 500 mm or 250 mm plotted against depth, tightening to blows per
   25 mm in the final metre `[TOM]` §11.3.1. So draw the depth axis as a
   **horizontal bar chart of blow count**, growing as the pile goes down. It is
   authentic, it is legible at a glance, it makes refusal visible as a wall of
   bars, and no other game has it.
9. **Damage state.** A driven pile's head and toe should visibly degrade —
   spalling at the head, a broomed or crushed toe — and the crushed toe should
   appear *while the set gauge reads green* (§E1). Let the player discover the
   lie.
10. **Neighbours.** For urban contracts, draw the adjacent building at the edge
    of the section with a **ppv readout** attached to it. It makes an abstract
    limit into a thing you can see shaking.

### Two new HUD elements

- **The volume plot.** A live strip alongside the section: actual concrete volume
  vs theoretical, against depth. It is a real instrument (EN 1538:2010 Annex C
  gives an example concreting graph `[EFFC]`; CFA logs print it `[TOM]` §2.4.2),
  it is the diagnostic for necking, overbreak and cage float, and it doubles as
  the end-of-contract grade.
- **The clock.** The 6-hour clean-out-to-concrete limit `[TOM]` §3.4.6 and the
  1.5-hour DCIS plug limit `[TOM]` §3.2 are real, hard, dramatic timers. Show
  them.

---

## E6. Contract design — what a foundation job looks like

Following `GAMEDESIGN.md` §2's contract board, a foundation contract should
carry:

| Field | Example values | Why |
|---|---|---|
| Method | driven / DCIS / vibro / sheet / bored-Kelly / CFA / cased CFA / FDP / micropile / anchor / D-wall / soil mixing / jet grouting | Each is a different machine and control scheme |
| Pile schedule | e.g. 84 piles, Ø 750 mm, 18 m nominal | Production target, not a single hole |
| Design capacity | kN per pile | Sets the set window and the test regime |
| Ground profile + confidence | strata with a variance band | The player never sees the truth until the tool cuts it |
| **Test regime** | n static / n dynamic / signal matching yes-no | Buys down ξ (E1) — a live commercial choice |
| **Neighbour constraint** | ppv limit, dB(A) limit, working hours | Gates vibro vs press-in vs silenced hammer |
| **Working platform** | certified / to be built / suspect | A real pre-condition `[FPS-WP]` |
| Tolerances | position, verticality, cut-off | §A5 table; failing them means re-design or extra piles |
| Standard | EN 1536 / EN 12699 / EN 14199 / EN 1537 / EN 1538 / EN 12716 / EN 14679 / EN 12063 | Flavour, and it tells the player which rulebook is live |
| Certs required | CPCS category (A45/A46/A47/A48), slinger (A40), crane (A02) | `[CPCS]`; ties straight into Talent's expiry mechanic |

**Grading (D→S)** per `GAMEDESIGN.md` §2.4, adapted:

| Weight | Foundation criterion |
|---|---|
| 30 % | **Integrity** — volume ratio within band on every pile; no necking; tremie never surfaced; cage at level |
| 25 % | **Capacity** — sets achieved, toe levels into the bearing stratum, tests passed |
| 20 % | **Production** — piles per shift against par |
| 15 % | **Tolerance** — position, verticality, cut-off within the standard |
| 10 % | **Neighbours & safety** — ppv and noise never exceeded; no platform incident |

Note what is *not* first: metres. A drilling contract pays for metres; **a
foundation contract pays for piles that work.** That difference in scoring is the
clearest way to make the Foundation branch feel like a different career rather
than a reskin — which is exactly what `DESIGN_EXPANSION.md` §5 asks for.

---

## E7. Progression order within the Foundation branch

Consistent with `GAMEDESIGN.md` §4 and the real CPCS ladder (§B3):

```
sheet piling (vibro on an excavator)        entry - cheap, visible, satisfying
  -> driven piling, rig < 20 t              CPCS A45 equivalent
     -> driven piling, rig > 20 t           A46
  -> bored piling (Kelly), rig < 20 t       A47
     -> bored piling, rig > 20 t            A48
        -> CFA
           -> cased CFA / double rotary
        -> FDP (displacement)
  -> micropiles and anchors                 (small rig, low headroom, stressing)
     -> jet grouting                        (same rig, 700 bar plant)
  -> soil mixing (DSM -> CSM)
     -> diaphragm wall: grab -> hydromill   the branch's endgame
  -> driven cast-in-situ                    combines hammer + concrete
  -> pile-top RCD                           late-game, offshore-adjacent
```

Two crossovers into other branches that already exist in `DOMAIN.md` §1 and
should be made explicit, because they are real:

- **Pipe walls are installed with a DTH hammer** `[PAL]` — the Foundation branch
  borrows the DTH skill.
- **Overburden / double-head drilling** serves both the anchor branch and the
  micropile branch `[EMDE-AN]`, exactly as `DOMAIN.md` §1 lists it.

---

# F. Open items — what this pack could not source

Flagged so nobody quietly fills them in. Per `PLATFORM_TRUTH.md` Part C, none of
these may ship as a claim until sourced.

1. **DIN 4150-3 guideline ppv values.** The German equivalent of the BS 5228
   thresholds in §A3/§D8. Needed before any DACH contract states a vibration
   number.
2. **EN 12699 numeric position/verticality tolerance table** from the standard's
   own clause. (`[TOM]` §3.4.12 gives 100 mm plan / 40 mm per m, attributed to
   Clause 7.3 — that is a strong secondary source, but the clause text itself was
   not read.)
3. **EN 12063 numeric tolerances** for sheet pile position and verticality.
4. **EN 14199 grout requirements** (w/c, minimum strength, injection pressure)
   and the Annex B tolerance values.
5. **EN 1537 corrosion-protection class naming/numbering.**
6. **EN 1538's own bentonite table** — the EN 1536 values in §A5 are confirmed
   from EN 1536's text; whether EN 1538 repeats them numerically was not
   confirmed.
7. **EN 1538 stop-end numeric requirements.**
8. **EN 14679 binder dosage requirements.**
9. **Jet-grouting column diameters by soil and system.** The most-wanted number
   in the method and the least safely generalisable. Ship the mechanism, not a
   table.
10. **Day rates in EUR** for piling operator, banksman, foreman, crane operator
    and foundation engineer. Only the German apprenticeship figures are sourced
    (§B7).
11. **NPORS piling category codes**, and the German/Nordic plant-operator
    certification scheme names.
12. **Crew sizes** per rig per method — contractor- and country-specific.
13. **A piling-specific buried-services procedure** (§D9).
