# Shared tunnel-cycle estimate and measured-run integration

The economy-only delivery is now followed through into the public estimator and
normal progression consumer. No new physical rate, time constant or cutting
fraction is introduced. The nominal 0.5 m/h, hardness response and separate 10 h
heading setup remain **NOT SOURCED** calibration. Primary cycle definitions and
their limits are in `tunnel-cycle-definition-2026-09-06.md`.

`estimateHoursBreakdown('tunnel-jumbo', ...)` now returns zero cutting-eligible
`drill`, explicit undivided `cycle`, unchanged per-heading `flat` setup and their
`total`. It removes the generic chainage/rod-length surcharge. All other methods
retain their exact return shape and numbers. `estimateHours` therefore supplies
corrected estimates to the generated board and deadline calculation. Economy
reads this one shared definition; its interim private reinterpretation is removed.
Explicit caller `hoursOverride` remains authoritative with existing mobilisation
and minimum-hours semantics.

## What the actual simulation measures

Production `computePar` integrates cutting then adds `parBeatSeconds`, trips
and handling. For a round, `parBeatSeconds` calls `jumboParSchedule`, whose beats
include boom setup, charging, firing and mucking. Production `scoreBreakdown`
publishes `S.parSec` and whole-run `S.timeSec`; these are not cutting-only times.
The normal jumbo progression calculation consequently applies that whole-run
ratio to the unsplit cycle, preserving the separate heading setup. Settlement
then adds mobilisation once. There is no bit/skill ROP discount on the cycle.
The ratio and its existing 0.4–3 clamp are authored gameplay accounting, not a
sourced conversion from phone seconds to field hours.

At 10 m, hardness 0.5 and one heading, the public estimate is 30 h, including
20 h nominal cycle and 10 h setup. Ratios 0.8 / 1 / 1.5 give 26 / 30 / 40 h
before mobilisation. The former measured-run path multiplied the old rod
surcharge and heading setup by performance too. Other 20 methods keep their
original measured-run expression unchanged.

## Verification

- `node tools/checktunnelestimator.mjs`: **6,846 checks pass**. The 6,400-card
  deterministic sweep includes 153 jumbo cards. Public estimate inputs include
  zero and fractional completion, depths at rod multiples, and hardness ends.
- The same checker starts the actual simulator with the actual progression
  lifecycle and receives its emitted completion payload. Production par is
  162.51834749232194 s (published as 162.5); actual elapsed times 97.5 and
  227.5 s produce ratios 0.6 and 1.4, settlements **22.29 and 38.29 h**, and
  matching `hoursWorked` and 11-hour-shift `daysElapsed` changes.
- These two simulator fixtures advance the real clock then use public
  `debug.setDepth` to trigger completion. They prove computePar/payload/receipt/
  settlement/clock wiring. They are **not completed physical-cycle observations**
  or evidence that a player can achieve those times with those controls.
- Updated `node tools/checktunnelcyclehours.mjs`: **29 scenario groups pass**,
  including unchanged explicit override semantics, both bits, ROP skills,
  mobilisation, fractional completion and synthetic non-unit par ratios.
- `npm run check:progression`: **83 pass**. `node tools/checkdata.mjs` passes
  with the existing ground-ceiling warnings; `node tools/checkcareer.mjs`
  passes its 10 assertions and retains its existing design findings.
- Independent replay against frozen pre-follow-through modules:
  **720 non-jumbo breakdowns, 480 full settlement payloads and 6,247 generated
  non-jumbo cards are identical**. All 153 jumbo cards retain every field other
  than `estimatedHours` and `deadlineHours`; 51 deadlines decrease after normal
  rounding. No payout, depth, ground, item or rig field changes.

## Reproduction and remaining boundaries

Private scratch: `C:\Users\henri\Downloads\threads\drillity-tunnel-estimator-integration`.
`.baseline/` holds exact frozen input bytes (economy already includes the
previous four-file delivery), an isolated baseline module tree, the independent
`compare.mjs`, preservation JSON and checker outputs. No original-repository
source, Git index, browser, GPU or public asset was modified by this task.

The patch is **incremental after `tunnel-cycle-hours.patch`**, against snapshots
of original data/progression at assignment. Apply the original patch first.
The earlier research report's legacy-estimator limitation describes that old
delivery; this follow-through closes it. The original physical calibration,
support/logistics scope and lack of a measured completed cycle remain open.

Stored accepted-contract deadline terms are not migrated or rewritten. Freshly
generated cards use the corrected estimator. Published contract hardness is
rounded to 0.001 after generation, while estimated hours round to 0.1; the
generated-card checker propagates exactly those rounding bounds. It does not
assert false exact equality between recomputed rounded inputs and generation.
