# Tunnel-cycle hours: adversarial review

Date: 2026-09-06. Scope: the private `codex/tunnel-cycle-hours` economy-only
delivery. This review read `ASTRA.md` in full, its current checkpoint and the
rate-provenance report before inspecting production code. It changes no
production source or permanent checker.

## Verdict

No blocking issue found in the bounded production change. The private
`settlementHoursBreakdown` adapter (`src/game/economy.js:493`) keeps the existing
nominal jumbo duration as an undivided cycle, preserves the explicit heading
setup allowance, and removes the generic chainage-derived rod surcharge. The
settlement expression (`src/game/economy.js:1660`) grants the cutting multiplier
only to the separate `drill` term. Jumbo has no supported cutting allocation
there; `drill: 0` denotes ineligibility for an estimated bonus, not a claim that
no drilling occurs.

The reviewed source SHA-256 is
`e316c6105d49f21120c6b4b5a00f194f0254ad20e31b7ab5eaef2aa5ad0e43fd`.
The root-preserved exact initial economy copy is
`bcd233f34bfa2892d3348594c844e4dfebe38aadd51041229c702575cc531bfd`.

## Independent measurements

Before the edit, the reviewer captured complete `settleRun` return values for
480 cases: all 20 other methods, hardness 0/0.5/1, and eight combinations covering
default setup, no mobilisation, arbitrary overrides, the minimum-time floor,
zero/partial completion, speed/upkeep skills, and grade/reputation/travel/hazards.
The exact command was rerun after the edit. Every serialized result is identical.
Both payload SHA-256 values are
`7cb5367439abec1b305cdc4986c1293379e0925f75b80aac1bc65dbf55fa8859`.

The replay file is an ignored local review artifact, authorized by the root:

```powershell
node .bak/tunnel-cycle-hours/non-jumbo-preservation.mjs
```

It verifies the preserved initial-source hash and the current complete-payload
digest. This is a frozen regression fixture, not a permanent declaration that
future unrelated economics must never change.

A separate actual settlement probe used a synthetic 10 m heading, hardness 0.5,
Nordic region, jumbo rig, and no mobilisation. All fixture inputs and expected
calibration values are **NOT SOURCED** physical quantities.

| Case | Settled hours | Consumables EUR | Fuel EUR |
| --- | ---: | ---: | ---: |
| Stock eligible face bit | 30.00 | 1030 | 1020 |
| Premium eligible face bit, ROP multiplier 1.12 | 30.00 | 801 | 1020 |
| Stock plus both maximum cutting-speed skills | 30.00 | 1030 | 1020 |

The premium bit's consumable advantage remains; a time discount does not leak
into fuel, crew or the time bonus. The crew-boss skill still changes its separate
cost effect. Turning mobilisation on returned 30.29 h with a 0.29 h mobilisation
field and unchanged EUR 1020 fuel. Fractional half completion returned 15.00 h;
zero completion retained the existing 0.50 h floor. An arbitrary 7.25 h override
remained 7.25 h. At hardness 1, the unchanged nominal-hardness formula returned
40.77 h including the same heading setup.

## Dedicated checker review

The final `tools/checktunnelcyclehours.mjs` passed all 29 scenario groups in an
independent reviewer run. It exercises actual production settlement and three
actual progression completions: the corrected fallback plus the intentionally
retained par overrides, including career hours and the existing 11-hour shift
clock. The no-par fallback emits the expected existing diagnostic warning.

Running the same direct settlement assertions with
`--economy .bak/tunnel-cycle-hours/baseline/economy.js` rejected the exact initial
source with exit code 1 and `30.14 !== 30`. This is a regression that fails on
the reproduced defect, not a changed assertion that accepts the old behavior.

The optional saved-source mode initially retained a static progression import
of current production. Review identified the misleading candidate scope; the
implementer corrected it to explicitly skip progression in saved-source mode.
`--economy src/game/economy.js` then passed 26 direct settlement groups and
reported the progression skip. Default mode still performs all three actual
progression integrations. No unresolved checker issue remains in this scope.

## Boundaries checked

- `data.js:977` defines the nominal as a full cycle, and `economy.js:468`
  already distinguishes its chainage basis from consumption hole metres.
  The correction does not multiply cycle hours by `holeMetresFor` or use the
  simulator's 180 m/h cutting cap.
- The generic data estimator (`data.js:4567`) counts rod joints using total
  contract chainage. The actual jumbo simulator instead declares
  `rodLength: 0` and `stringFromHole: true` (`drilling.js:1269`, `:1278`). This
  confirms a local definition mismatch without inventing real handling time.
  See `tunnel-cycle-definition-2026-09-06.md` for the primary technical evidence
  and its limits; no universal claim that jumbos cannot extend rods is made.
- `setupPerHole: 10` is a separate authored heading allowance. Its numeric value
  and activity boundary remain **NOT SOURCED**. The available evidence does not
  prove it duplicates the whole-cycle nominal, so preserving it is appropriate.
  `includeSetup: false` still suppresses mobilisation rather than that allowance.
- The bit and `rop.mult` skill terms share the cutting-eligible multiplier;
  neither can discount the unallocated cycle. Rig, method-variant and simulator
  timing policies were not changed. Mobilisation still follows the chosen rig.
- Explicit override, deadline adjustment, completion scaling, time-bonus formula,
  costing and payout formulas were not rewritten. The changed default duration
  legitimately flows into their existing costs/bonus calculations.

## Material integration limit

**This is not an end-to-end correction of normal measured-par gameplay.** The
unchanged public `data.js:4559` estimator still returns `drill: 20` and
`flat: 10.143737166324435` for the synthetic 10 m heading. Generated contract
estimates and deadlines still use it (`data.js:5923`).

Normal progression computes `estimateHours(...) * ropBasisFactor(...) * parRatio`
at `progression.js:999` and supplies that value as `hoursOverride` to settlement.
That caller continues to include the legacy rod allowance. The economy adapter
intentionally preserves the meaning of an explicit caller-owned duration; it
cannot safely infer or remove a hidden fraction from arbitrary overrides. At a
par ratio of 1, the same 10 m raw estimate would still settle as 30.14 h through
that override path, before mobilisation. A coordinated data/progression change
is required to reconcile this path and the public estimator later.

The unchanged rate-provenance checker is a baseline instrument. Its observed
settlement values will change, but its historical interpretation prose still
describes the original error. A passing coverage/clock probe is not evidence
that every historical sentence or the public data estimator has been fixed.
This review makes no new claim about actual steady jumbo ROP, completed physical
cycle productivity, or real drill/non-drill proportions.
