# CFA — the concreting and withdrawal programme

Every constant in `src/sim/drilling.js` `TUNING.methods.cfa.stages[1].concrete`,
`TUNING.methods['cased-cfa'].stages[1].concrete`, `FLIGHTING` and
`TUNING.hazard.cfaHead` traces to a line on this page, or is marked
**NOT SOURCED** here and beside the constant itself.

**Why this file exists.** Until 2026-09-06 the game's CFA methods were a single
downward bore. `handover.md` §"What I observed that Claude must not miss" item 5:
*"CFA has no implemented pumping/withdrawal simulation programme. The continuous
feed adapter supports a decreasing actionDepth, but an injected test is not
evidence of a real return programme."* `research/CFA_FEED_MOTION.md`
§"Limits that remain open" said the same thing, and `tools/checkcfafeed.mjs`
printed it in its own limitation list. The design had already been written —
`research/05-foundation-piling.md` §E3, "Concreting up — the tension" — and never
built. This is that design, built, with the sources it needed.

---

## Source keys

New in this pass. The first three were fetched and read in full during this
session; page and section numbers below are from the documents themselves, not
from search-result summaries.

| Key | Document |
|---|---|
| `[FPS-OF]` | Federation of Piling Specialists, **CFA Piling: Preventing ground & rig instability through over-flighting**, July 2014. 8 pp. <https://www.fps.org.uk/content/uploads/2018/12/CFA-Piling-Preventing-ground-rig-instability-through-over-flighting-FINAL.pdf> — also mirrored at `forumcourt.myzen.co.uk/fps/guidance/safety/`. Quotes **BS EN 1536:2010 §8.2.5.3** and **ICE SPERW 2nd ed. (2007) §B4.4.1 and §C4.4.2** verbatim. Already keyed as `[FPS-OVERFLIGHT]` in `research/16-site-archetypes.md`; the same document, read here in full. |
| `[SIEGEL]` | Siegel, T. C. (2012). **Testing of Augered Cast-in-Place Piles Installed with Varying Auger Rotations.** Invited paper, Fellenius GSP 227. Dan Brown and Associates. 16 pp. <https://danbrownandassociates.com/wp-content/uploads/2012/07/Siegel_Invited-Paper-Fellenius-GSP-227_2012.pdf> Quotes **FHWA GEC-8 (Brown et al., 2007)** and defines the grout factor. |
| `[BUNGENSTAB]` | Bungenstab, F. C. & Beim, J. W. (2015). **Continuous Flight Auger (CFA) Piles — A Review of the Execution Process and Integrity Evaluation by Low Strain Test.** In *From Fundamentals to Applications in Geotechnics*, Manzanal & Sfriso (Eds.), IOS Press, pp. 414–421. doi:10.3233/978-1-61499-603-3-414 <https://www.grlengineers.com/wp-content/uploads/2022/09/STAL9781614996033-0414-1.pdf> |
| `[UFGS-ACIP]` | US guide specification, **Auger-placed grout piles** (augered cast-in-place / CFA), 10 pp., as published by Subsurface Constructors. <https://www.subsurfaceconstructors.com/pdfs/specs/augered-cast-in-place-cfa-piles-specification.pdf> |

Already keyed elsewhere in the pack and reused unchanged:

| Key | Where it is defined |
|---|---|
| `[TOM]` | Tomlinson & Woodward, *Pile Design and Construction Practice*, 5th ed. — `research/05-foundation-piling.md:29` |
| `[FPS-PUMP]` | FPS, *Guidance for Pumping Concrete to Form Piles*, Rev. 2021 — `research/16-site-archetypes.md:3666` |
| `[BAU-CFA]` | Bauer CFA starter product info — `research/05-foundation-piling.md:40` |
| `[S1]` | Sunward SWDM240SC drilling-rig catalogue p.25 — `research/rigs/cfa-rig.md:156`, hashed in `research/rigs/cfa-capacity-verification-2026-09-06.md` |
| `[LIEB]` | Liebherr CFA-AU auger data, quoted with its P/D ratios at `src/rig/tools.js:4081-4082` |

---

## 1. The pass that was missing, in the sources' own words

> *"A **continuous flight auger** with a **hollow stem**, plugged at the bottom,
> is screwed to full depth in one pass… At depth, high-slump concrete is pumped
> down the hollow stem; **once sufficient pressure has built up**, the auger is
> withdrawn at a controlled rate."*
> — `research/05-foundation-piling.md` §A6, from `[TOM]` §2.4.2, §3.4.7

> *"Grout is then injected through the auger shaft as the auger is being
> withdrawn in such a way as to exert removing pressure on the withdrawing
> earth-filled auger as well as lateral pressure on the soil surrounding the
> grout-filled pile hole."*
> — `[UFGS-ACIP]` §1.5

> *"The method involves boring a continuous flight auger (CFA) drilling tool to
> the desired pile depth and then placing concrete through the tip of the auger
> tool as it is extracted from the ground. The method has the advantage that
> there is never an open or unsupported pile bore."*
> — `[FPS-OF]` §2

This is why the method is modelled as `stages[]` with `reverse: true` on the
second pass, the same machinery `hdd`, `raise-boring` and `jet-grouting` use,
and why `completeOnProgramme: true` — the pile is finished when the auger is
back at the collar, not when the bore reaches the contract depth.

`armOnEnter: true` on the lift is the second half of that sentence: the pump is
running and the pressure is up **before** the auger moves. It is also already a
shipped fact — `FACTS_VERIFIED.md`: *"CFA never lifts the auger until concrete
is pumping. Pull dry and the bore collapses."*

---

## 2. The pump — sourced at both ends, and therefore printed in its own units

| Constant | Value | Source |
|---|---|---|
| `pumpMinBar` / `pumpMaxBar` | **55 / 95 bar** | `[FPS-PUMP]`, via `research/16-site-archetypes.md:361`: *"pump pressure **55–95 bar**; ground and rig lines are steel or reinforced rubber hose rated 80–120 bar, usually 100 mm or 125 mm"* |
| `pumpMaxM3h` | **46 m³/h** | `[SIEGEL]` p.6: *"The grout pump (ball and seat style) pump was capable of delivering 0.023 m3 (0.82 ft3) per stroke and approximately **46 m3 (60 yd3) per hour**."* |

These are the only two figures the pour prints with a unit attached, and both
endpoints of each are published. `[UFGS-ACIP]` §1.8 confirms the machine class:
*"The grout pump shall be a positive displacement pump… The pump discharge
capacity shall be calibrated in strokes per cubic foot."*

**Caveat carried in the code.** 46 m³/h is one machine on one job, not a class
maximum. It is used as the ceiling of the game's pump because it is the only
CFA/ACIP pump throughput in the pack with a document behind it. If a
manufacturer figure for the shipped rig's pump is ever sourced, that is the
number to replace it with.

---

## 3. The KPI — the volume ratio per metre

The acceptance criterion is dimensionless, which is why it can be shown as a
number without inventing a unit. Three independent documents state it.

> *"To avoid it, the operator has to control the auger withdraw rate, so there
> is always a positive pressure of about 50 to 100 kPa and a **relative
> consumption ratio (real to theoretical volume) of about 15 to 20 % of
> concrete**."*
> — `[BUNGENSTAB]` §3 → `targetLo: 1.15`, `targetHi: 1.20`

> *"This situation may be exacerbated if during the pile concreting operation an
> **insufficient volume of concrete is placed (i.e. less than the volume of soil
> removed during the pile boring)**."*
> — `[FPS-OF]` §2 → `neckAt: 1.00`

> *"The volume of grout per linear foot of pile shall be **not less than the
> volume of grout per foot of test piles**."*
> — `[UFGS-ACIP]` §3.1

`[SIEGEL]` p.4 names the same quantity as the industry's control parameter:
*"the installation control of ACIP piles has focused on the **grout factor**
(i.e., the volume of grout pumped into the borehole divided by the theoretical
borehole volume) and the **grout return** (i.e., the depth of the auger when
grout is observed exiting the ground surface)."*

`research/05-foundation-piling.md` §E3 had already written the loop:

```
  V_theoretical = pi/4 * D^2 * 1 m
  V_actual      = integral of pump flow over that metre
  ratio         = V_actual / V_theoretical
  ratio < 1.0   ->  NECK.       ratio ~ 1.0 -> perfect.
  ratio > 1.0   ->  OVERBREAK.  Not a defect - it is concrete you paid for.
```

The implementation is that loop as a quotient of rates, because that is what it
is: `supply = pumpMaxM3h × pump slider`, `demand = pi/4 D² × withdrawal rate`,
`ratio = supply / demand`. `D` is the contract's own `holeDia`.

**`gaugeTol: 0.10` is NOT the acceptance band.** The acceptance band is ±0.025
about 1.175 and it is what the log prints and what `concreteQuality()` grades
against; the green band on the gauge is wider because one step of a touch slider
moves the ratio by roughly 0.02, and a band narrower than the control that has
to reach it is the reachability failure ASTRA §1.3 warns about. Both are
published separately in telemetry so a caption cannot mistake one for the other.

---

## 4. The failure, and why its answer is the opposite of jet grouting's

> *"Raising up the withdraw auger speed can simultaneously reduce the pumping
> pressure. In such cases, the space between the auger tip and soil cannot be
> completely filled by concrete, resulting in a **soil collapse inward and a
> neck in the pile**."*
> — `[BUNGENSTAB]` §3

> *"Rate of grout injection and rate of auger withdrawal from the soil shall be
> coordinated to **maintain, at all times, a positive pressure** on this gauge
> which will, in turn, indicate the existence of a 'removing pressure' on the
> bottom of the auger flight."*
> — `[UFGS-ACIP]` §1.6

> *"If the **auger jumps upward during withdrawal**, it shall be reinserted to
> the original tip elevation and the **rate of withdrawal decreased** to prevent
> further jumping."*
> — `[UFGS-ACIP]` §1.6

The game reuses the `return-lost` hazard kind, which the haptic vocabulary
already files under "the ground went away" — literally the void behind the
auger. **The correct answer is not jet grouting's.** A jetting monitor that has
lost its return is pumping into the formation and the answer is to *cut the
pump*; a CFA auger that has lost its head is not filling the void and the answer
is to *slow down and pump harder*. `TUNING.hazard.cfaHead` carries the CFA
answers and `hintFor()` prints the CFA caption. Same for `pull-stall`, which on
this pass is the auger jump.

### The other end of the gauge is real too, and is not the same kind of failure

> *"Soft soils: Necks/section reductions are caused by soil instability. To
> control it, an **overconsumption of concrete is often used**, as well as
> **bulge formations, which are commonly undesirable because of soil negative
> friction effect**."*
> — `[BUNGENSTAB]` §3

So over-supply costs money and, pressed into soft ground, quality — but it is
not a void. `bulgeColMul: 0.88` against `neckColMul: 0.55`, and the score charges
`0.20 × bulge fraction` against `0.85 × neck fraction`.

`[BUNGENSTAB]` §3 also explains why the concrete the pump delivers is charged in
full even when the ground will not take it: the surplus *"flows up the auger
flights (until the ground level)"*, which is precisely why stroke-counted volume
over-reads. The game's `placedM3` is what the pump delivered, which is what the
contractor pays for.

### Why it is hidden until the log prints

> Unlike a conventional bored pile *"you cannot inspect the stratification or
> the soil quality during installation"* — `[TOM]` §2.4.2, quoted at
> `research/05-foundation-piling.md` §A6.

Klingmüller & Kirsch's study of 3 773 integrity tests found *"in 18 % of the
analyzed cases a considerable deficiency was detected"* for CFA or screw piles
(`[BUNGENSTAB]` §3, fig. 1). The failure rate of this method in the field is not
small, and the game's scoring should not make it feel small.

---

## 5. Over-flighting — the bore's own gauge

> *"As the drilling tool or 'auger' is bored and crowded… into the ground,
> **rotation slightly greater than one rotation per flight pitch is required**
> to loosen the soil and allow the tool to penetrate… In stiffer and stronger
> soils greater rotation of the auger is required and **more soil is rotated or
> flighted to the surface than the volume contained within the auger flights**."*
> — `[FPS-OF]` §3

> *"**Undetected voids or excessive settlement below a piling platform may
> undermine the stability of the piling machine** relying on its support."*
> — `[FPS-OF]` §3

### The two ratios, which are not the same number

**Revolutions per pitch of penetration** — the competent band:

> *"The FHWA publication, Design and Construction of Continuous Flight Auger
> Piles (Brown et al., 2007) **suggests maintaining the number of revolutions
> per auger pitch penetration between 1.5 and 2**."*
> — `[SIEGEL]` p.4 → `optRevPerPitchLo: 1.5`, `optRevPerPitchHi: 2.0`

The identity itself, `[SIEGEL]` p.5, quoting Brown et al. 2007 Eq. 2:
`rate of penetration = n·p / v`, where `v` = auger penetration rate (m/min),
`n` = rotations/minute, `p` = auger pitch (m). Siegel notes the term is a
misnomer — *"better described as ratios rather than rates"* — and adopts
**auger penetration ratio**, which is the name used in the code.

**Revolutions per metre** — the specification's trigger:

> *"**C4.4.2** Excessive penetration resistance or flighting in typical soils may
> be defined as **rate of penetration of less than 1 m per 10 auger revolutions**
> for standard or heavy duty CFA augers and could be **less than 1 m per 20
> auger revolutions** for extra heavy duty CFA augers."*
> — ICE SPERW 2nd ed. (2007), quoted verbatim in `[FPS-OF]` §4
> → `trigRevPerM: 10` (the 20 is recorded in the code comment, not carried as a constant with no consumer)

`[FPS-OF]` §4 adds that SPERW does not define the duty classes, and that *"FPS
members typically define a heavy duty auger as having a stem diameter of 150 mm
or greater."*

The two inputs to those ratios:

| Constant | Value | Source |
|---|---|---|
| `rpmMin` / `rpmMax` | **6 / 28 rpm** | `[S1]`, via `research/rigs/cfa-rig.md:156` — the shipped CFA rig's rotary head |
| `pitchPerDia`, clamped `0.25–0.95 m` | **0.735 × D** | `[LIEB]`, quoted at `src/rig/tools.js:4081-4082`: *"Liebherr's CFA-AU data gives 500→350, 600→450, 900→650, 1200→900 — P/D ≈ 0.72-0.75."* The same number the tool geometry uses, deliberately: the model and the mesh must not disagree about the pitch of one auger. |

### The cost, and its ceiling

> *"**Flighting** — vertical movement of the soil on the auger relative to the
> soil on the bore wall. In loose silty sands, over-rotation disturbs the
> surrounding soil and **can reduce shaft resistance by 30 %**."*
> — `[TOM]` §2.4.2, at `research/05-foundation-piling.md:932` → `lossMax: 0.30`

Corroborated and bounded by measurement. `[SIEGEL]` p.10, four instrumented and
load-tested piles at average auger penetration ratios of 2.2, 4.9, 9.8 and 1.9:
*"The measured shaft resistances ranged from 50 % to 91 % of the calculated
shaft resistances. This range narrows to 73 % to 91 % when only considering the
shaft resistance for the entire pile."*

And the constraint that stops the game inventing a curve, from the same page:

> *"The reduction **does not appear to be predictable as a proportion to the
> number of rotations or the auger penetration ratio.**"*

So `lossMax` is sourced, `sourcedLossShape: false`, and the accumulation is
linear to that one published ceiling. Nothing claims a relationship the
measurement says is not there.

The prone-ground list is sourced as a **list**, not as weights — `[FPS-OF]` §3
names *soft cohesive and cohesionless soil overlying firm to hard strata*,
*soft clays, loose silts and sandy silts*, *loose single sized sands*, *a high
water table*, and *close pile spacing*. `FLIGHTING.prone` carries
`proneSourced: false` for the magnitudes.

### **NOT SOURCED, AND THEREFORE NOT CHARGED: the rate basis**

`FLIGHTING.chargeScore` is **false** and the reason is in the code beside it.

`revPerM = rpm ÷ (rop in m/min)` is an identity, so it is only as real as its
two inputs. The rpm is real. The rate is not on the same footing:
`game/data.js` gives CFA `nominalRop: 25` m/h, `drilling.js` caps it at 75, and
**measured through the actual model an 18 m CFA bore in clay runs at about
23 m/h**. Put that into the identity at a real auger's rotation and every CFA
bore in the game reads **30–95 revolutions per metre** against SPERW's trigger
of 10.

That does not mean every bore in the game is over-flighting. It means the CFA
rate model and a real auger's geometry are not yet expressed in the same units —
which is `handover.md` item 6: *"`nominalRop`, model caps and actual drilling
rates have different definitions."*

Inverting the identity says the same thing from the other side: at 25 m/h and a
441 mm pitch, holding the sourced 1.5–2.0 revolutions per pitch would need the
head to turn at about **1.7 rpm**, a quarter of the slowest speed the drive has.

The gauge is therefore **computed and published** — hiding a measurement would
hide the finding — and it does not touch the score. Charging it would grade
every player 30 % down for a mismatch in the game's own units; scaling it to
make the number come out right would be the plausible invented constant the
owner's rule forbids. Telemetry carries `rateBasisReconciled: false` and the
score detail carries `flightingCharged: false`.

**To close it:** reconcile CFA's `nominalRop` with real CFA boring rates (a real
rig bores a 20 m pile in single-digit minutes, i.e. hundreds of m/h, not 25),
then flip `FLIGHTING.chargeScore` in the same commit. Do not add a third
definition of rate to do it.

---

## 6. Ground take-up — ordering sourced, magnitudes not

`takeUp` is the ceiling on how much more than the theoretical bore volume a bed
will accept before the surplus stops being volume and becomes pressure. Only the
ordering is sourced:

- *"Soft soils: Necks/section reductions are caused by soil instability. To
  control it, an overconsumption of concrete is often used"* — `[BUNGENSTAB]` §3
- Loose sands with a high water table are where *"soil mining could be a
  problem"* — `[BUNGENSTAB]` §3
- `[FPS-OF]` §3's high-risk list is the same ordering seen from the bore side.

Cased CFA's ladder is the same ordering compressed, because the casing is the
whole point of the method: `research/05` §A7 has it existing for ground *"where
you must not lose spoil to the surrounding soil."*

**No overbreak-by-soil table exists in the pack and none is invented.** The
constants scale a ceiling on a dimensionless index; nothing derives a diameter
from them, and telemetry publishes `overbreakBySoilKnown: false`.

Related sourced context in `[SIEGEL]` p.2 that is *not* used as a constant, but
which is why the ordering runs the way it does: *"Loose sand is expected to
experience a volume reduction of 5 to 10 % during shearing while dense sand is
expected to experience a volume increase. The volume reduction expected in loose
sand is offset by the auger volume, which is typically 10 to 15 % of the
theoretical excavation volume."*

---

## 7. What could NOT be sourced

| Quantity | Status | Why |
|---|---|---|
| **Auger withdrawal rate**, in any unit | `liftMaxMh: 190` (CFA) / `150` (cased), `liftRateSourced: false` | No document in the pack or fetched here states one. `[UFGS-ACIP]` §1.6 says why: the magnitude of the pressure and *"other augering and grouting procedures, such as rate of augering, rate of grout injection, and control of grout return around the auger flight are **dependent on soil conditions and equipment capability** and shall be at the option of the Contractor."* The values are winch caps, calibrated so a competent operator's optimum lands inside the sourced ratio band; they print nowhere. |
| **Tip pressure**, in kPa | index only, `tipPressureKnown: false` | `[BUNGENSTAB]`'s 50–100 kPa is a **measurement at the tool**. This model does not compute one, and deriving one from a normalised surplus would be inventing exactly the magnitude `[UFGS-ACIP]` §1.6 declines to table. What is modelled is the sourced RULE: positive at all times. |
| **Overbreak by soil type** | ordering only, `overbreakBySoilKnown: false` | No table exists. |
| **Monitor/auger rpm during the pour** | `optRpm: 0.22`, normalised | `[FPS-OF]` §5 says over-rotation during concreting *"should be minimised"*. That is a direction, not a speed. |
| **The head-index constants** (`headIdeal`, `headPerSurplus`, `headLambda`, `dryAt`, `bulgeAt`) | `sourced: false` | Normalised game tuning. None prints beside a unit. |
| **`gaugeTol`** | game tuning | See §3. |
| **`nominalDiaMm` fallback** (600 / 750) | mirrors `game/data.js` | Not an independent claim: it is the same file's `nominalDia`, used only when a contract carries no `holeDia`. |
| **The concrete rise-rate figure of ≥ 3 m/h** in `research/05:1246` | **deliberately not used** | It is DIN 4126 for **diaphragm-wall trench stability**, not for a CFA pile, and reusing it here would be the class of error this project's rules exist to prevent. |
| **EN 1536's own CFA concreting clauses** (§8.4/§8.5) | not reached | The standard is paywalled. `[FPS-OF]` §4 quotes §8.2.5.3 verbatim and that clause is used; nothing else from EN 1536 is claimed here that the pack did not already carry. |
| **TxDOT Special Specification 4089's 115 % deficiency threshold** | **not used** | It appeared in a search-result summary and both hosts refused the PDF (TLS chain failure and 404). It would have been a fourth corroboration of the 1.15 floor; it is not cited because it was not read. |
| **FHWA GEC-8 itself** | quoted **through** `[SIEGEL]` | Both mirrors of the primary PDF exceed the fetch size limit. The 1.5–2.0 revolutions-per-pitch figure is used on the authority of `[SIEGEL]` p.4, which quotes it directly, and both citations are given wherever it appears. |

---

## 8. Requests to files this pass does not own

See the delivery report. In short: `game/data.js` `scoredOn` for both CFA rows
should stop saying "metres drilled" (the deliverable is the pile), CFA's
`nominalRop` needs reconciling before `FLIGHTING.chargeScore` can be flipped,
and `game/economy.js` should charge the concrete actually placed rather than a
flat per-metre rate now that the sim publishes `placedM3`.
