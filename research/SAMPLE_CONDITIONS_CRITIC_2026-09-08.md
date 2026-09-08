# Sampling operating-condition review — acceptance scope

Status: **approved for the bounded operating-condition increment**. The final
independent CPU gate passes 15/15 groups with all nine inspected production
hashes unchanged during execution. Exact final hashes and command output are in
`sample-conditions-adversarial-2026-09-08.json`. This does not approve physical
sample quality, tender/tool compatibility or browser/device presentation.

The integrated interval workflow and its previous review are complete within
their recorded scope. This follow-up addresses a new question: can the game
truthfully record operation-dependent conditions for each sampled interval?
The source currently provides authored simulation thresholds and actual control
state, not recovered material lengths, fragment sizes, fracture classifications
or calibrated sample-loss measurements.

The root approved optional, versioned `operatingConditions` within each interval.
It may report observed cutting-state exposure to the existing model's low-flush,
overheat and overtorque conditions. It must not call those observations recovery,
TCR, SCR, RQD, intactness or undisturbed quality, derive an unexplained quality
percentage from them, or imply that a quiet record certifies a physical sample.
The material-quality and payment-policy milestone stays open.

## Independent failure criteria

1. A competent and a deliberately adverse public control policy must produce
   different, independently observed condition records. Added labels or a
   counter that remains zero for every operation are insufficient.
2. The time basis is existing **player/simulation seconds**, a whole fixed step
   whenever accepted cutting advance is positive. It is not a calibrated field
   exposure duration. Record the sampling point: current input, returns and
   torque, but heat before this step's heat/wear update.
3. An independent per-step oracle must observe real pre/post simulation state,
   identify actual positive accepted advance and allocate that step to the
   correct interval. It must not use the new exposure counters as its oracle.
4. Waiting, pause, rod extension, casing, extraction, handling and bit trips
   cannot add cutting-condition time. Large boundary steps and final partial
   intervals cannot charge time to an already handled or not-yet-cut interval.
5. Conditions may overlap. Each exposure is bounded by cutting time, but their
   sum may exceed cutting time. Restore validation must not invent a mutually
   exclusive partition or add overlapping exposures into a material-loss score.
6. Sonic has no existing critical-flush producer. Its inapplicable threshold
   and exposure must remain explicit null/unrecorded values, not a zero that
   implies measured safe flushing.
7. Completed interval evidence remains immutable. New controls, a later bit
   trip, a new interval or a new physical attempt cannot rewrite prior exposure.
   Replay cannot double recorded seconds or any existing settlement effects.
8. An observed interval cannot silently mix missing observations with recorded
   ones or change threshold definitions mid-interval. Older unobserved records
   remain unknown; restore must not replace absent data with all-zero exposures.
9. Malformed JSON, non-finite/coerced/negative durations, impossible latest
   observation contributions, changed thresholds and inconsistent nullability
   reject without partially mutating state. Reordered JSON keys remain equivalent
   for replay; changed elapsed time or observation values do not.
10. The same identified evidence must survive real completion, settlement and
    actual JSON save/reload, and reach Site/Results with truthful model/clock
    labels. Existing grade and payment behavior must remain unchanged under
    identical controls because this increment explicitly adds no quality policy.

## Reproduction and evidence

Run from `C:/Users/henri/Downloads/threads/drillity-next-sample-quality`:

```powershell
node tools/checksampleconditions-adversarial.mjs
exit $LASTEXITCODE
```

This is a **local candidate acceptance gate**, not a portable clean-clone test.
Its economic comparison imports the original simulation from the required
read-only sibling snapshot:
`C:/Users/henri/Downloads/threads/drillity-coordination/resume-70-baseline-2026-09-08`.
The snapshot `manifest.json` SHA-256 is
`66dceba44f2d7be035b66009db349f80cb4f211df77017103e6f568d1186d0d1`.
The JSON report records all nine baseline source hashes, all nine candidate
hashes before and after execution, the critic tool hash, each result and the
actual independent oracle measurements. Dependencies are the candidate's
existing `node_modules` junction. No browser, GPU, Blender or service is started.

The oracle reads existing model state before and after each public 1/120-second
update. It uses positive accepted bore advance, pre-step heat, and post-input
actual flushing/returns and torque. It obtains the core threshold from the
simulation's existing method model, not the catalogue or newly added record.
Each interval's observed step count, cutting time and three independent exposure
times match this separate oracle, including the final partial interval. The new
record is not used to compute expected exposure.

| Actual fixture and public controls | Recorded cutting time | Low flush | Overheat | Overtorque |
| --- | ---: | ---: | ---: | ---: |
| Core 1.75 m limestone, optimal controls | 5.7833 s | 0 s | 0 s | 0 s |
| Core 1.75 m limestone, low flushing | 24.6083 s | 24.5583 s | 19.5000 s | 0 s |
| Sonic 6.25 m marl, optimal controls | 19.7917 s | Inapplicable/null | 0 s | 0 s |
| Sonic 6.25 m marl, adverse first 20 player seconds then recovery | 33.3667 s | Inapplicable/null | 10.7750 s | 0 s |

These are authored game-model observations in player/simulation seconds. Core
uses two intervals (1.5 m plus 0.25 m); sonic uses three (3 m, 3 m, 0.25 m).
The synthetic short contracts are controlled boundary fixtures, not proof of
real tender diameters or sampled material quality. The overtorque field is
covered by independent reducer observations above the existing threshold; these
particular real-control runs did not produce overtorque exposure.

The remaining groups verify legacy absence and sonic nullability; overlapping
conditions; invalid/mixed observations; nested JSON replay; impossible restore
histories; immutable records through waiting, pause, trips, rods and handling;
one fixed step for tiny positive final slices; abort/restart identity; genuine
completion and once-only settlement; JSON reload with malformed-primary backup
recovery; malformed new product refusal before rewards; and actual Site card
and Results sample-block output. Results source is executed with a minimal DOM
collector, which is a logic check and **does not validate layout or rendering**.

The same public controls were also run through the untouched baseline simulation
and the candidate. Grades, time, costs, revenue, net, experience, inventory wear
and career/player state matched after excluding the deliberately added product
evidence and fresh run/attempt identities. No new payment or quality policy is
being smuggled into the condition record.

## Defects found and fixed

1. Latest-observation validation admitted impossible residual histories and
   phantom first-event exposure. The author added an observed-step count,
   sole-step equality checks and per-condition consistency checks.
2. Closed intervals could borrow later event sequence numbers to claim more
   observed advances than occurred before their own retrieval. The author now
   bounds each interval by its retrieval and prior-handling sequence, reserving
   casing and retrieval events where applicable.
3. Subtracting a latest calm step introduced a real floating-point restore
   regression: 59 exposed steps plus one calm step, each 1/120 second, yielded a
   valid published record that rejected its untouched JSON. The author replaced
   that subtraction with forward reconstruction, with no physical threshold or
   arbitrary tolerance. The critic checks 1,000 transition boundaries per method
   and finite duration pairs spanning widely different scales. Every accepted
   record in these cases restores unchanged; clearly impossible histories still
   reject.

The production regression is preserved in
`sample-conditions-adversarial-failed-03-2026-09-08.json` (14/15, source stable).
Earlier `failed-01` and `failed-02` reports are also retained. They include critic
fixture mistakes (the catalogue does not own the simulation flush threshold;
legacy `undefined` becomes `null` inside JSON arrays; new attempts have distinct
IDs) and an indefinitely adverse sonic fixture that could remain jammed at the
boundary. Those are not presented as production defects. The adverse sonic
fixture now explicitly tests a bounded episode followed by normal recovery.

## Remaining product limits

This increment makes operating choices leave truthful, visible records. It does
not produce recovered-material lengths, fragments, fractures, TCR/SCR/RQD,
intactness, calibrated damage or a sample-quality score. Those require a real
producer and an explicit quality/payment policy. Core tender/NQ diameter
compatibility remains a separate open issue; sonic's 3 m interval is a
`gameplay-run-limit`, and usable inner capacity and exact geometry remain
unsourced. Neither is legitimized by these successful boundary fixtures.

Root still owns integration and the full assembled build/UI/device gates. This
critic changed only its tool, raw reports and this report in the candidate; no
main production files, commits, pushes, browser processes or GPU resources.
