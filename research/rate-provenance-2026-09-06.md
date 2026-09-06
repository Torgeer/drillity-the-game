# Rate provenance: nominal, model cap and observed drilling

Date: 2026-09-06. Scope: CRITIQUE §13c, with the related cable-tool and core/sonic assertions in §13b/§13d. This is a read-only audit of all 21 methods. It changes no production rates or economics.

The table mismatch is real, but a nominal estimate is not necessarily an instantaneous maximum. The earlier jumbo full-cycle bit-bonus defect is now resolved: the current identical-contract probe settles **30 hours for both eligible bits**, with the full cycle accounted separately from cutting. Its historical reproduction is preserved below. Cable-tool calibration still needs review against a primary hourly reference. The cap/nominal ratios alone do not establish either a physical error or the correct replacement value.

## Reproduce the inventory

```powershell
node tools/checkrateprovenance.mjs --json .bak/rate-provenance/report.json
```

Latest run: **2026-09-06T01:35:31.607Z**, saved locally to `.bak/rate-provenance-final-review/corrected.json`. Result: **9,369 coverage, finite-value, API, clock-unit and source-stability checks passed; 21 methods covered.** The generated JSON records the actual run timestamp, audit definition date, source SHA-256 values, all ground and loadout inputs, model terms, sampled maxima and their controls, actual simulation window endpoints, wear, load, torque, groove, phases and unavailable reasons. It is a local fixture artifact, not field evidence. The probe deliberately does not assert `nominalRop === ropMax`, freeze the historical settlement defect as an expected passing value, or attach an unconditional defect interpretation to current measurements.

Production sources read unchanged during this run:

| File | SHA-256 |
| --- | --- |
| `src/game/data.js` | `3c442ae7e9ea4a15773e6225de6f0303acaa33e5f06a7bb4936d74a8e33d0b3b` |
| `src/sim/drilling.js` | `76e2f9fce3b0f5fcf62d33ac53ecd5b5ce1a5e9d4f9f47a23e9518d7fc5dd594` |
| `src/game/economy.js` | `2bf90cd24bcf29629b328ddd889a8efb56d64bd1ce5c10f339f7dffcdcbb658a` |
| `src/core/contract.js` | `a374211146b86c5dbc5ea88eb28a49e0505805fa486d585a1531e810414549b5` |
| `tools/checkrateprovenance.mjs` | `dc5b81e934a5fb3d8a63637d8c506c175e30f4ae168a97b3ac45be922c10218c` |

The artifact also hashes the audit tool. Other agents own production edits; rerun this inventory after their integration rather than treating these numbers as timeless.

## Definitions and test conditions

`data.js` documents `nominalRop` as m/h at content hardness 0.5 with stock tooling. Its hardness is thickness-weighted `0.6 × min(UCS/300, 1) + 0.4 × abrasivity`. `estimateHoursBreakdown` adjusts nominal by `1.35 - 0.7 × hardness`, divides contract metres by that rate, then generally adds setup, rod handling and applicable reaming/pullback terms. Its default nominal duty-cycle basis is not otherwise explicit. Jumbo explicitly overrides the meaning to full-cycle tunnel chainage; its current `cycle` component is separate from `drill`, and flat setup excludes generic rod handling of chainage. Bolting is specified in drilled hole metres and converted by the economy.

The simulation uses a different hardness function, `clamp((UCS/100)^0.6, 0.18, 2.4)`, plus method, tool, wear, heat, returns, stability, load, depth and other terms. `ropMax` is the clean cutting cap at groove 1 in the generic branch. Both potential and cap scale with groove, whose authored ceiling is 2.2. Thus cable-tool telemetry at 4.08 with a declared cap of 4 is permitted behavior. Impact pile driving uses set per blow and blow frequency, with its own cap; CPT and jet withdrawal use separate commanded-speed branches. No universal maximum across all states or tooling is claimed by the table below.

All chosen test conditions, selection rules and stability thresholds are **NOT SOURCED regression fixtures**, not representative site statistics:

- Ground: among each method's shipped nonvoid `validGround` rows, choose the closest content hardness to 0.5, remaining below an explicit model UCS ceiling where present. This preserves declared eligibility, but does not imply equal or typical geology across methods. The selected sonic row is a 140 MPa boulder; its low result must not be presented as average sonic productivity.
- Tooling: the real `defaultLoadoutFor(method, unlockLevel)` result, including the pile's dolly. Every actual simulation starts with a fitting tool. The complete loadout is in JSON; primary tool IDs are listed below.
- Clean model: depth 0 m, no heat/wear/load/drag/bind, returns 1, groove 1, ground's shipped stability and water, method's casing-follow flag. WOB/RPM/flush come from production `optimalInputs`. Their normalized values are controls, not measured kN/rpm/litres per minute.
- Sampled maximum: real `torqueModel` and `ropModel`, 21 points per control from 0 to 1, or 9,261 combinations per method. This is a sampled maximum at fixed ground/tool/condition, not a proved global optimum. The JSON separately records a maximum within production torque headroom 0.92. Both maximum values happen to coincide for these fixtures.
- Actual simulation: real `createDrillSim`, public `startHole`, `setInput` and timed `rodStab` pulses; fixed seed 17 and homogeneous external geology. Every 0.1 player seconds, follow current public optimal inputs. Step the actual simulation at 120 Hz for at most 60 player seconds. Hazards, groove, wear, automatic actions and failures remain enabled. No private state is changed.
- Observed steady rate: last uninterrupted 2-second window after the initial 2 seconds, stage 0, positive drilling, no active hazard or bound jam, cutting torque at most 1 (pile impact and CPT push exempt), original stock tool retained, and at most 10% relative ROP spread. The exact window and conditions remain in JSON. This is an observed short stable window, **not** an equilibrium solution, fresh-tool rating, full-shift average or completed-contract production rate.

The clock assertions measure actual downhole/player drilling-time increments and verify `48 × method.timeMul`. Rates remain metres per downhole hour; multiplying them by that compression again would mislabel player-time advance as physical ROP. No complete-cycle rate is reported from this bounded drilling policy.

## All 21 methods

All numerical rate columns are m/h, but their metre/duty-cycle bases must be read with the definitions above. `Unavailable` is intentional; the model value has not been substituted for an unobserved actual window.

| Method | Nominal | Declared cap | Ground | Clean model optimal | Sampled clean maximum | Actual steady window |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| auger | 18 | 70 | till | 22.77 | 39.76 | 23.26 |
| cable-tool | 1.6 | 4 | sandstone | 4.00 | 4.00 | 4.08 |
| top-hammer | 22 | 60 | schist | 60.00 | 60.00 | 35.69 |
| site-investigation | 6 | 26 | till | 26.00 | 26.00 | Unavailable |
| dth | 16 | 55 | schist | 30.92 | 45.72 | 35.40 |
| overburden | 6 | 40 | sandstone | 23.28 | 30.49 | 27.56 |
| core | 5 | 22 | schist | 10.26 | 20.75 | 10.48 |
| rc | 20 | 55 | schist | 31.95 | 43.18 | Unavailable |
| rotary-kelly | 9 | 60 | sandstone | 8.90 | 22.61 | 9.08 |
| cfa | 25 | 75 | gravel | 33.56 | 54.29 | Unavailable |
| rockbolt | 26 | 110 | schist | 100.84 | 110.00 | Unavailable |
| oil-rotary | 7 | 70 | sandstone | 10.06 | 19.66 | 2.85 |
| anchor | 8 | 35 | schist | 35.00 | 35.00 | 35.00 |
| driven-pile | 12 | 90 | sandstone | 12.55 | 16.48 | 11.37 |
| cased-cfa | 12 | 55 | till | 15.38 | 25.35 | 19.11 |
| tunnel-jumbo | 0.5 | 180 | schist | 180.00 | 180.00 | Unavailable |
| hdd | 12 | 45 | sandstone | 9.13 | 17.92 | 9.13 |
| longhole | 20 | 38 | schist | 33.77 | 38.00 | 29.88 |
| sonic | 12 | 65 | boulder | 1.16 | 1.50 | 1.17 |
| jet-grouting | 4 | 26 | till | 17.33 | 26.00 | 17.69 |
| raise-boring | 1.2 | 8 | schist | 4.11 | 8.00 | 4.19 |

The oil fixture ends its reported window at 90.7% tool wear after highly compressed operation (time factor 1,728), so 2.85 is not a fresh-tool rate. The pile row is penetration, the investigation row is SPT predrilling, the jumbo model columns are blasthole cutting, and HDD/raise-boring/jet model columns are their initial cutting passes. These are not all contract advance rates. The earlier pile clean optimal/maximum/steady values were 6.08/7.41/5.89 before the reviewed impact correction; the current row above supersedes them. The rounded stock controls in the tooling table still reproduce unchanged.

| Ground | UCS MPa | Abrasivity | Stability | Water | Content hardness |
| --- | ---: | ---: | ---: | ---: | ---: |
| till | 2 | 0.75 | 0.40 | 0.40 | 0.304 |
| sandstone | 70 | 0.80 | 0.75 | 0.50 | 0.460 |
| schist | 110 | 0.70 | 0.70 | 0.25 | 0.500 |
| gravel | 0.30 | 0.70 | 0.20 | 0.85 | 0.2806 |
| boulder | 140 | 0.85 | 0.30 | 0.50 | 0.620 |

These numbers are shipped content, not newly verified physical characterizations of those material names.

| Method | Initial primary tool | Clean WOB / RPM / flush, rounded |
| --- | --- | --- |
| auger | auger-flight-std | 0.45 / 0.80 / 0.34 |
| cable-tool | ct-chisel-bit | 0.62 / 0.75 / 0.59 |
| top-hammer | bit-th-r32-45-econ | 0.44 / 0.82 / 0.60 |
| site-investigation | auger-flight-std | 0.30 / 0.90 / 0.59 |
| dth | bit-dth-3-econ | 0.47 / 0.65 / 0.72 |
| overburden | bit-dth-3-econ | 0.50 / 0.66 / 0.79 |
| core | bit-core-bq-surf | 0.30 / 0.85 / 0.78 |
| rc | rc-bit-std | 0.46 / 0.68 / 0.78 |
| rotary-kelly | bit-drag-150 | 0.43 / 0.77 / 0.54 |
| cfa | auger-flight-std | 0.40 / 0.85 / 0.32 |
| rockbolt | bolt-bit-39 | 0.40 / 0.80 / 0.66 |
| oil-rotary | bit-oil-tri-8-econ | 0.41 / 0.58 / 0.65 |
| anchor | lostbit-cross-51 | 0.52 / 0.78 / 0.55 |
| driven-pile | dolly-hardwood | 0.80 / 0.36 / 0.50 |
| cased-cfa | boulder-extractor-900 | 0.44 / 0.80 / 0.31 |
| tunnel-jumbo | bit-face-t38-48 | 0.48 / 0.85 / 0.62 |
| hdd | bit-tri-6-mill | 0.43 / 0.77 / 0.84 |
| longhole | bit-lh-t51-89 | 0.42 / 0.80 / 0.66 |
| sonic | sonic-core-barrel-100 | 0.40 / 0.62 / 0.44 |
| jet-grouting | bit-drag-150 | 0.30 / 0.90 / 0.61 |
| raise-boring | rb-pilot-bit-311 | 0.48 / 0.72 / 0.55 |

Unavailable actual windows have concrete causes in this policy:

- Investigation repeatedly enters rod handling and SPT driving; clean cutting samples exist, but no qualifying continuous window.
- RC has 17 accepted rod pulses and 31.4 player seconds of rod handling; its clean intervals do not yield the required stable window.
- CFA becomes stuck and aborts at 3.04 m after 34.28 player seconds. No rescue policy is implemented, so no rescued-run rate is invented.
- Bolting enters installation and plate phases after short drilling intervals. Its final 2.1 m of supported drive is a different quantity from the model's hole-cutting rate.
- Jumbo's cutting varies, wears the stock bit and eventually invokes an automatic field spare before charging. The whole drive remains at zero advance before its round is blasted. No qualifying original-tool steady window or completed cycle is available.

## Findings and recommended ownership

### Resolved: full-cycle jumbo time previously received a cutting-only bonus

Historical reproduction from the first 2026-09-06 audit: `data.js` explicitly defined nominal 0.5 m/h as the complete tunnel cycle. For an identical synthetic 10 m contract at hardness 0.5, the former `estimateHoursBreakdown` labelled 20 hours of that complete cycle `drill`, then added 10.143737 hours of flat terms. The former real `settleRun`, without mobilisation, returned:

| Eligible bit | Bit ROP multiplier | Settlement hours |
| --- | ---: | ---: |
| bit-face-t38-48 | 1.00 | 30.14 |
| bit-face-t45-64-hd | 1.12 | 28.00 |

The historical 2.14-hour saving applied the bit multiplier to all 20 hours, including charging, firing, ventilation and mucking. It contradicted the settlement comment restricting better tooling to ground cutting. The bits are real eligible shop items; the contract quantities are NOT SOURCED fixture inputs. The calculation established the scope error without claiming how large the legitimate cutting-time saving should be.

Historical source hashes: data `ffe18ebead9f80ea9eebf40f4aa0376e14996621d7d065b1272a15187657be65`, simulator `76cb4f0d1dfcc52aaed994215dd2772c923cbc1ef2acf1e83ac5b91ad627b2f4`, economy `916c15c490c81d60adc2376be8b5978ac79c991d6410862ed904dc277c7f4004`; core contract matches the current hash above. These identify the earlier measurements, not current production.

**Current resolution:** the same probe now returns `{ drill: 0, cycle: 20, flat: 10, total: 30 }` and **30.00 hours for both bits**. Settlement adds `cycle` without the cutting-tool multiplier. Generic rod-string handling is no longer added to tunnel chainage. The reviewed fix is described in [Tunnel cycle definition](tunnel-cycle-definition-2026-09-06.md). It preserves the existing undivided full-cycle nominal rate rather than guessing a cutting fraction. That rate, hardness adjustment and separate heading setup remain NOT SOURCED calibration; the implementation boundary is corrected without claiming field calibration is complete. No new production change is recommended from this resolved finding.

### Cable tool: primary hourly evidence warrants calibration review

FRTR's government reference gives 1.5–2.5 ft/h for bedrock/dense till, 2.3–3.3 ft/h for gravel/till and 3.5–4.5 ft/h for silts/clays/sands. Exact conversion gives 0.4572–0.7620, 0.70104–1.00584 and 1.0668–1.3716 m/h respectively. It also describes periodic bailing. The guide does not isolate a cutting-only duty cycle or establish a universal modern machine maximum. Its page has no clear publication date; accessed 2026-09-06, it is an undated reference rather than a 2026 machine benchmark. [FRTR cable-tool reference](https://www.frtr.gov/site/3_2_2.html)

The clean game fixture reaches 4.00 m/h in 70 MPa sandstone, approximately 5.25–8.75 times that reference's bedrock production band. This is an actionable evidence gap, not a proved like-for-like error multiplier. CRITIQUE §13b instead extrapolates instantaneous cutting over a 10-hour day and compares a secondary source's daily production; that extrapolation omits bailing and other interruptions. The exact 13–27× physical claim is not reproduced here.

**Action for the simulation/domain owner:** document whether the cable rate denotes bit-on-bottom cutting or whole boring production, measure a complete bailing/handling cycle, and calibrate to a matching method, diameter and ground reference. Keep the current numeric calibration labelled NOT SOURCED until that link is established.

### Core/sonic: numerical ordering reproduced; universal conclusion unsupported

Using the explicit synthetic comparison ground UCS 25 MPa, abrasivity 0.5, stability 1, water 0, clean stock tools and each method's production optimal controls gives core 22.00 and sonic 8.19 m/h: core is 2.69 times sonic. Cable tool gives 4.00 and jet predrilling 5.68 in the same diagnostic. These are model outputs, not a field comparison. The core tool selected by the actual stock loader is **BQ**, whereas CRITIQUE §13d invokes an NQ rate band. `research/02-prospecting.md` distinguishes tool sizes and instantaneous cutting from shift averages; its cited local Epiroc PDFs were not re-extracted during this audit.

Boart Longyear gives typical diamond-bit penetration of 2–12 inches/minute depending on bit formula and formation, equivalent to 3.048–18.288 m/h. It recommends lower rates in extremely broken hard ground. This supports reviewing the game's 22 m/h clean cap, but the published typical band is not a physical ceiling. [Boart Longyear diamond-bit guidance, 2018](https://www.boartlongyear.com/insite/the-science-of-drilling-are-you-getting-the-most-out-of-your-bits/)

Boart's sonic guidance emphasizes unconsolidated formations, sampling requirements, casing and appropriate barrel size. It does not establish that sonic must exceed diamond core by a fixed multiplier at a chosen UCS. A homogeneous 25 MPa material with a 100 mm sonic barrel cannot stand in for every claimed high-productivity overburden application. [Boart Longyear sonic guidance, 2017](https://www.boartlongyear.com/insite/getting-the-most-out-of-sonic-drilling/)

**Action:** define matched bore/sample geometry, material structure and cycle boundaries before comparing methods or retuning their constants. Treat the observed core/sonic ordering as a reproducible calibration question, not proof that one method is always wrongly faster.

### Intentional or incompatible rate definitions

- Kelly's nominal/cap pair remains 9/60, yet its clean model at the recorded 70 MPa inputs is 8.90, and actual stable drilling is 9.08. A 6.67× cap ratio is not a reproduced 6.67× ordinary-rate mismatch.
- Jet grouting currently has a predrill cap of **26**, so CRITIQUE §13c's **23** is stale. Its later `jet-lift` stage separately commands withdrawal: production calls at commands 0, 0.45 and 1 return 0, 9.45 and 21 m/h. `liftRateSourced: false` explicitly labels the numeric calibration unsupported. A completed treated column is another duty-cycle basis. Keep those three concepts separate.
- The CPT variant converts the production command of 20 mm/s to 72 m/h at zero resistance. That is a push-speed parameter, not a replacement for the investigation method's 6 m/h nominal or its SPT predrill cap. This audit verifies the production conversion, not the physical standard or a completed sounding rate.
- Bolting's nominal 26 is drilled hole metres per hour; `ropBasisFactor` currently converts 8.167 hole metres per supported drive metre. Jumbo's nominal 0.5 already means full-cycle chainage. Direct comparisons to their sim hole-cutting caps are incompatible.
- Groove, time compression, method time multipliers and the sampled control grid are authored gameplay mechanisms. Their existence is explicit; exact `nominalRop`, `K` and `ropMax` calibration provenance across the 21 rows remains unestablished. Unknown calibration should not be described as sourced realism, and missing provenance is not itself proof that every number is wrong.

## Integration limits

Only `tools/checkrateprovenance.mjs`, this report and the ignored JSON fixture output were authored for this task. No production source, package script, rate, payout or tuning value was changed. This inventory is ready for the domain/economy owner to rerun after their edits. The all-method coverage and clock checks can remain useful without imposing an artificial equality between unrelated rate definitions.
