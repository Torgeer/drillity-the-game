# Sample operating-condition provenance candidate

Candidate: `C:/Users/henri/Downloads/threads/drillity-next-sample-quality`, detached
from `a47de8a6ba199eabb108da447cd660f01c1735e7` and overlaid from the root's frozen
`resume-70-baseline-2026-09-08` snapshot. All 300 baseline files were verified
against their SHA-256 values before copying. The complete baseline manifest is
retained as `research/SAMPLE_QUALITY_BASELINE_2026-09-08.json`; its SHA-256 is
`66dceba44f2d7be035b66009db349f80cb4f211df77017103e6f568d1186d0d1`.

**This adds truthful operator feedback, not material-quality physics.** The
existing core/sonic workflow already retrieves, boxes/sleeves and logs bore
intervals. Its timed handling actions have no real material-damage or loss
producer. Existing simulation inputs do support an operating-condition record:
the time spent drilling under its existing low-flush, overheat and overtorque
thresholds. That record now follows each actual interval into its immutable
settlement and saved history, and appears on Site and Results.

Whole-core recovery, sonic sample integrity, physical loss, TCR/SCR/RQD and a
sample-quality-dependent reward remain **OPEN**. No grade weight, payout
formula, physical threshold or material-loss equation was added or changed.

## Signal definitions and sampling point

The new `stepSample(dt, dBore)` observation runs only for a core/sonic programme
when the accepted physical bore increment is positive. Depth has already been
capped at its actual rod/barrel/target boundary. The observation sees:

| Recorded condition | Exact producer and threshold | Meaning and limit |
|---|---|---|
| Core low flush | `S.act.flush * S.returns < S.m.flushCritical` | The same effective-flow expression and method threshold already used by core flush-sensitive wear. Current core model value is 0.45. No field flow rate or sample-loss threshold is inferred. |
| Overheat | `S.heat > T.heat.overheatAt` | Existing normalized model threshold, currently 0.85. The reading is taken before this step's thermal/wear update. It is not a measured sample temperature. |
| Over torque | `S.torque > T.torque.overLimit` | Existing displayed overtorque threshold, currently 1.0. Values above 1 remain valid inputs. This is distinct from the existing sustained safety-event threshold of 1.05. |

These are existing **authored simulation thresholds**, not newly sourced
physical sample-damage limits. Their exact values are retained in each interval
as provenance, rather than silently reinterpreted using a later version's
tuning. `sample-ledger.js` adds no new physical numeric constant.

The sample point is after input damping, return-flow calculation, torque/ROP
calculation and actual bore advance, but before this fixed step's heat/wear
update. Accordingly an independent oracle uses pre-step heat and the actual
post-input/returns/torque values at the penetration calculation. Each accepted
positive-advance step contributes the existing **player/simulation `dt`**,
matching `S.drillSec`. A final capped slice contributes its whole accepted
fixed step, just as the existing drilling clock does. This is not calibrated
downhole exposure or an interpolation of the fraction of a barrel filled.

No positive advance means no observation. Pauses, waiting, rod connections,
retrieval, casing, container handling and bit trips contribute no cutting time.
Conditions may overlap: each duration is at most that interval's cutting time,
but their sum can exceed it. They are not summed into a grade or recovery bar.

Sonic has **no existing low-flow critical threshold**, so its recorded
`effectiveFlushMin` and `lowFlushSec` are null. The UI omits a sonic low-flush
claim. It does not print “0 s low flush” and imply a known safe-flow limit.

## Data and compatibility

The ledger's `advance` event may now carry an optional `observation` with
`elapsedSec`, `effectiveFlush01`, `heat01`, `torque01` and `limits` containing
`effectiveFlushMin`, `heatMax`, `torqueMax`. The reducer derives the accumulated
record; callers cannot directly add a purported recovery percentage.

Each observed interval has an optional `operatingConditions` object:

```js
{
  version: 1,
  basis: 'authored-simulation-thresholds',
  clock: 'player-simulation-seconds',
  limits: { effectiveFlushMin, heatMax, torqueMax },
  steps,
  cuttingSec, lowFlushSec, overheatSec, overtorqueSec
}
```

`steps` counts accepted observed advances and supports chronology validation;
it is not a quality measure. Older interval records can omit the new field.
They stay **Unrecorded**, not a zero-excursion success. A single open interval
cannot switch between recorded and unrecorded advances or change its threshold
basis midway. Fresh subsequent intervals can have their own explicit basis.

Observation and nested limit keys are canonicalized for replay comparison.
Reordering JSON properties does not make an exact newest replay conflict;
changing a value under the same sequence does. The reducer freezes detached
records without freezing the caller's observation. Existing attempt identity,
sequence, interval conservation and custody checks remain in force.

Restore rejects invalid record versions/clocks/bases, extra fields, non-finite
or coerced numbers, inapplicable sonic/core fields, negative durations, or any
individual condition duration exceeding cutting time. The newest observation
must be contained in the cumulative record, with a feasible remaining history:
a calm newest step cannot leave more earlier low-flush time than earlier
cutting time. A one-step record must equal that one contribution. Completed
receipts use the existing `readSampleProduct` validation and progression
identity boundary; no new payment path was introduced.

Observed step counts are bounded by that interval's own retrieval sequence,
reserving retrieval and sonic casing events. A later interval cannot donate
sequence slots to an earlier record. The calm latest-step feasibility check
reconstructs its elapsed time by addition: subtracting rounded cumulative
seconds rejected a valid 60-step record in independent testing. Tiny earlier
durations can also round away beside a much larger final elapsed time, so the
validator does not demand that floating-point subtraction recover them.
Untouched published JSON must restore without introducing a physical minimum
duration or numerical tolerance. Clear impossible residual histories still
fail closed.

## Player feedback

- Site retains its existing four sample-card rows. Its note shows the recorded
  excursions and identifies their clock as play time. A recorded excursion
  makes that card warning-colored without claiming a failed sample. The
  existing ordered Site log records the operating feedback once when the
  interval is handled. Existing observer sequence guards prevent duplication.
- Results adds each interval's operating record inside the existing expandable
  sample log, followed by its drilling play time. Missing old data says
  **Unrecorded**. The footer identifies game thresholds and unmeasured material
  condition. The separate material-recovery row remains **Unmeasured**.
- `sampleOperatingRecord()` in `sample-product.js` supplies both views from the
  same validated data. A small positive exposure is shown as `<0.1 s`, not
  rounded to a false zero. No-excursion sonic wording names only heat/torque.

The Site layout was kept to its existing row count, but this task has no GPU
grant. Browser wrapping/geometry and actual device experience remain unverified;
the candidate must receive the root's bounded UI acceptance before a visual
claim is made.

## Reproduction and evidence

```powershell
node tools/checksampleconditions.mjs
```

The new author gate passes 9 groups and preserves exact production input
hashes in `research/sample-operating-conditions-author-2026-09-08.json`.
It uses real readiness/acceptance, public controls and `update(1/120)`, genuine
sampling completion and progression receipts. It does not mutate tuning,
teleport, inject hazards or invent completions. Replaying the genuine event is
used only to test the existing duplicate boundary.

| Real-control fixture | Normal inputs | Initially poor inputs, then normal recovery |
|---|---|---|
| Core, 3.25 m limestone | 10.8083 s cutting; 0 low flush, 0 overheat | 12.0250 s cutting; 4.0167 s low flush, 2.6583 s overheat |
| Sonic, 6.5 m marl | 20.5667 s cutting; 0 overheat | 46.5500 s cutting; 25.7750 s overheat |

Poor inputs use feed 1, work 1 and flush 0.05 for the first 4 player seconds
on core or 35 on sonic, then follow the ordinary published optimal inputs.
These are explicit test controls, not new game constants. Both cases complete
three actual intervals through the normal actions. Total recorded cutting time
matches the existing drilling clock within floating-point roundoff, and saved
receipts contain the same records. Sonic's low-flush field stays null.
No actual overtorque excursion occurred in these four fixtures; its threshold
and overlapping-time behavior are separately tested at the pure boundary.

Core's short contract is below its catalogue depth range and is a declared
boundary fixture, not an unmodified generated tender. Sonic's 6.5 m lies within
its depth range. Both fixtures retain the existing nominal tender/tool-diameter
questions; this task neither fixes nor hides that separate compatibility work.
The €10,000 fixture tender is test data, not a claimed market or career price.

The first author run failed a harness assertion that incorrectly expected
`startHole()` to return boolean true; the real function returns telemetry.
That failed artifact is retained as
`sample-operating-conditions-author-failed-01.json`. Correcting the assertion
to test a successful start yielded the actual-control measurements above.
No production behavior was changed to satisfy that harness error.

Existing sampling gameplay 12-group and pure-ledger 18-group gates also passed
after the initial producer/UI integration. They are regression evidence, not
the new operating-record acceptance.

The final independent condition-specific gate passes **15/15**, exit 0, with
all nine production input hashes stable. Its separate pre/post-state oracle
matches actual core/sonic records, verifies pause/handling/trip exclusion,
checks real saved and backup receipts plus the actual Site/Results blocks,
and compares grade and settlement behavior against identical controls on the
frozen baseline. It covers the valid floating-point JSON restore cases and
retains the impossible-history rejection. The critic approved only this
passive operating provenance; see `SAMPLE_CONDITIONS_CRITIC_2026-09-08.md`.

```powershell
node tools/checksampleconditions-adversarial.mjs
```

That independent baseline comparison requires the documented local sibling
snapshot `drillity-coordination/resume-70-baseline-2026-09-08` and its manifest
hash shown above. It is not a claim that the local comparison runs from a
clean clone without this evidence. Failed critic runs 01/02 preserve corrected
fixture errors; failed run 03 preserves the real floating-point restore
regression, and the intermediate pass-14 artifact retains the earlier scope.

Final ledger SHA-256:
`2c5853338fa7472f37928063e70ae02007bebf5e8059aaf841c71c95f3a1dca7`.
All five final production hashes, both tools and evidence artifact hashes
are exported in `drillity-coordination/next-sample-conditions-delta.json`.

## Integration scope

Only these five production files belong to the candidate delta:

- `src/sim/sample-ledger.js`: optional condition observation/record validation,
  immutable accumulation and replay semantics.
- `src/sim/sample-product.js`: shared factual operating-record presentation.
- `src/sim/drilling.js`: sampling-only `stepSample(dt, dBore)` observation.
- `src/ui/screens/site.js`: sampling card note/tone and ordered sample-log entry.
- `src/ui/screens/results.js`: sampling interval-log evidence.

Root owns integration. Export the delta against the frozen snapshot, not the
detached HEAD or another candidate's source. Sample fit changes own the separate
start/preflight path; do not overwrite them. No main source, shared generated
asset, browser, Git index, commit or push was changed by this candidate.
