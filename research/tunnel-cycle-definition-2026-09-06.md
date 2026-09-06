# Tunnel-jumbo settlement: existing time boundary

Date: 2026-09-06. This is a focused definition investigation for the private
`codex/tunnel-cycle-hours` task. Production ownership remains with the economy
implementer. This investigation changed no production source, rate, simulator,
deadline, payout, or existing checker.

## Recommendation

Treat the jumbo's existing nominal chainage duration as an **unsplit full-cycle
duration** in economy settlement. Apply neither the bit `ropMult` nor the
combined cutting-speed skill multiplier to it. Do not convert it to drilled
hole metres and do not substitute the simulator's cutting cap. Remove the
generic chainage-derived rod-joint surcharge for this method. Preserve the
existing explicit per-heading setup allowance and separate mobilisation
behavior while identifying their numeric calibration as **NOT SOURCED**.

This establishes accounting eligibility, not a physical assertion that jumbo
drilling takes zero hours or that better bits never improve tunnel productivity.
The current data does not isolate cutting time. A future supported cutting
component could receive the appropriate bonus; inventing that component now
would conceal the uncertainty.

## Local definition chain

Read before investigation: `ASTRA.md` in full, its current
`research/ASTRA-progress-2026-09-06.md` checkpoint, and
`research/rate-provenance-2026-09-06.md`.

- `src/game/data.js`, the `tunnel-jumbo` method: `targetDepth` is chainage,
  contracts have one heading, and `nominalRop: 0.5` is expressly described as the
  full cycle. The surrounding description names drilling, charging, firing,
  ventilation and mucking. The row independently declares `setupPerHole: 10`.
- `src/game/economy.js`, `ropBasisFactor`: the existing explanation repeats that
  jumbo nominal time is already per contract metre and must not receive the
  hole-metre conversion. The separate `holeMetresFor` conversion exists for
  consumption; it does not define time.
- `src/game/data.js`, `estimateHoursBreakdown`: `metres / adjustedNominalRop`
  goes into `drill`, generic setup and `metres / rodLength * 0.035` go into
  `flat`. Its comments define `drill` as the hours cutting tooling can shorten.
  That meaning conflicts with the jumbo's specific full-cycle nominal basis.
- `src/game/economy.js`, `settleRun`: the pre-correction expression divides
  `split.drill * ropBasis` by a multiplier combining the selected bit's
  `ropMult` with `sk.m('rop.mult')`. For the jumbo that grants a cutting bonus
  to a mixed drilling/non-drilling cycle. The error is in eligibility of the
  time component; it is not evidence for a replacement rate or duty fraction.
- `DOMAIN.md` section 4 and `src/sim/drilling.js`, jumbo `stringFromHole` and
  `nominalStringM`: face-drilling string length follows the current short
  blasthole, not accumulated tunnel advance. Simulator charging, firing and
  mucking are separately authored beats. Their player-second constants are not
  a sourced physical decomposition of the nominal economy cycle.

An independent call to the unchanged data estimator reproduced the synthetic
10 m, hardness 0.5, one-heading fixture:

| Component | Hours |
| --- | ---: |
| Nominal full cycle, returned under `drill` | 20 |
| Explicit heading setup | 10 |
| Generic rod surcharge: `10 / 2.435 * 0.035` | 0.1437371663244353 |
| Returned `flat` | 10.143737166324435 |
| Returned total | 30.143737166324435 |

The fixture and coefficients are **NOT SOURCED** physical inputs. These are
measured code outputs, not observed field productivity. The earlier rate audit
records actual settlement of 30.14 h versus 28.00 h for eligible bit multipliers
1 and 1.12. The economy implementer owns fresh settlement regressions and final
post-change values; this report does not claim those tests passed.

## Primary evidence and its limits

The Norwegian Tunnelling Society's *Norwegian Tunnelling*, Publication 14,
section 7.5 (PDF page index 30), describes a 100 m² reference round with roughly
140 holes. Drilling, charging and blasting take 4–5 h **together**; ventilation,
scaling, mucking and bolting also contribute to the roughly 12 h complete
round. Section 7.4 describes 18 ft drill steels and approximately 4.5–5.0 m
advance per round. These are reference conditions, not universal timings.
The cited cycle cannot isolate the cutting portion even within its combined
4–5 h term. It also does not establish the game's exact 0.5 m/h or its hardness
formula as measured rates. The simple 4.5 m / 12 h reference is 0.375 m/h,
which is not a reason to retune this bounded accounting fix.
[NFF Publication 14](https://nff.no/wp-content/uploads/sites/2/2020/04/Publication-14.pdf)

Epiroc's 2018 prospectus, printed page 48 (PDF page index 49), independently
depicts a drill-and-blast cycle containing drilling, charging/blasting,
ventilation, scaling, loading/haulage, and rock reinforcement. It supports the
operation boundary without providing a transferable cutting-time fraction.
[Epiroc cycle diagram](https://www.epirocgroup.com/content/dam/epiroc/corporate/documents/listing-of-epiroc/english/Epiroc%20Prospectus%202018%20Eng.pdf)

The Epiroc Boomer M-series technical specification, printed page 5, lists
ordinary feeds plus optional extension-drilling and rod-adding equipment. That
supports distinguishing the game's ordinary single-steel face pattern from an
extension-drilling configuration. It does **not** justify saying that all
jumbos everywhere have no coupling: the manufacturer's tooling table also
includes the shank-to-rod coupling. The present defect needs only the narrower
fact that tunnel chainage is not the length or joint count of the current
blasthole string. No source supplies the generic 0.035 h/joint surcharge for
this full-cycle nominal.
[Epiroc M-series technical specification](https://www.epiroc.com/content/dam/epiroc/underground-mining-and-tunneling/tme/drilling-technical-specifications/boomer/9869_0080_01f_Boomer_M-series_technical_specification_english.pdf)

The primary PDFs were checked through their extracted text. The web screenshot
endpoint returned cache-miss errors for the NFF and prospectus pages; no visual
inspection of those pages is claimed in this task.

## What is confirmed, and what remains open

**Confirmed scope correction:** the nominal full cycle must not be called
cutting-eligible time. Excluding its current cutting-speed multiplier is the
conservative correction when no split is available. This includes the existing
combined `rop.mult` multiplier; otherwise the same erroneous discount survives
through skills.

**Confirmed inappropriate rod calculation:** the generic surcharge counts a
new joint for each 2.435 m of tunnel advance. It does not follow the current
face hole or actual extension handling. Ordinary drilling handling belongs
inside the declared full-cycle basis unless a separately defined exceptional
operation is supplied. Removing this surcharge avoids adding generic borehole
handling to that basis. The 0.143737 h is the amount removed from the fixture,
not a primary measurement of real handling time or a sourced duplicate duration.

**Preserve explicit heading setup:** `setupPerHole: 10` is a distinct authored
field, and a jumbo contract's unit is a heading. The source does not prove this
entire ten-hour allowance overlaps the nominal round or separate mobilisation.
Keep it for this correction and label its amount and intended activity boundary
**NOT SOURCED**. `includeSetup` presently controls mobilisation cost/time in
settlement; it does not switch off data's per-heading setup. Do not silently
change that existing option behavior while fixing the cycle discount.

**Support, water, access:** the primary cycle already contains routine scaling
and bolting. Any future generic support surcharge needs an explicit incremental
scope to avoid counting those activities again. Extraordinary water control,
pre-grouting, restricted access and unusual support are not quantified by the
existing nominal definition. Their extra physical hours and any coefficients
remain **NOT SOURCED**; do not invent them to compensate for this fix. In the
files inspected, data's water/access constraints alter authored tender/deadline
terms, not separately itemized settlement hours. Preserve those terms. The
generic regional standby and `workHours` costing assumptions also remain
outside this bounded time-eligibility correction; no claim of fully calibrated
tunnel fuel, support, logistics or weather accounting is made.

**Keep all three rates distinct:** 0.5 m/h is the authored nominal average of
contract chainage; 180 m/h is the declared clean simulator blasthole cutting
cap; a measured steady simulator window is a conditional observation of the
actual simulation. None is a substitute for the other. The earlier audit had
no qualifying stock-tool jumbo steady window and no completed-cycle observation.
The correction should neither invent that evidence nor weaken its checker.

## Review implications

With production edits limited to `economy.js`, the unchanged data estimator and
generated contract estimates can still report the old `drill` label and generic
rod term. Document that boundary explicitly rather than implying the underlying
data API has been corrected. Do not rewrite existing contract deadline semantics
without a separate, supported requirement. Dedicated tests should exercise real
`settleRun`, both eligible bits, cutting-speed skills, mobilisation toggles,
explicit hours overrides, and unchanged unrelated-method outputs. Reference
values must be independent expectations, not the corrected helper called twice.
