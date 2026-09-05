# Contract acceptance investigation — 2026-09-06

Scope: the public `createProgression().acceptContract()` API and its persistence.
No UI, renderer, rates, economic formulas, or production files were changed by
this investigation. Read against the current `ASTRA.md` and checkpoint.

Run the executable regressions with:

```text
node tools/checkprogression-acceptance.mjs
```

The test imports the real `progression.js`, `data.js`, `economy.js`, and
`core/contract.js`. Contracts come from seeded `makeContract()` calls. The
mobilisation expectation comes from the real `travelCost()` export. The only
substitute is in-memory localStorage, including one explicitly injected primary
write failure; tests do not read or overwrite a browser career.

## Baseline measured before the progression fix

The initial execution produced **5 passed / 11 failed** across 16 scenarios.

Already passing:

- Starter acceptance requests autosave and restores its contract, run, site,
  selected rig, money and career clock into a fresh progression instance.
- A missing compatible owned rig rejects without state or event changes when
  the selected rig is also incompatible.
- Missing contract certificates and a null contract reject without changes.
- Dispose flushes a just-accepted contract before its first autosave tick.

Confirmed failures:

- An unaffordable foreign job changes `garage.rigId` from `crawler-lite` to
  `hdd-rig` before returning a mobilisation rejection. It also emits the rig
  change and marks state dirty through `selectRig()`.
- A selected compatible `hdd-rig` is accepted even if it is absent from the
  owned rig list.
- The starter's multi-method rig can accept top-hammer work at level 1. Adding
  the method to the unlocked list also bypasses its level requirement.
- A currently expired required certificate still present in state authorizes
  acceptance. The test sets an expiry equal to the current career day; it does
  not impose any policy about certificates expiring during mobilisation.
- Same-object repeat clicks, cloned-card repeat clicks, repeats after reload,
  and a different card while a job is active all succeed and replace the run.
- An unknown destination is accepted at zero mobilisation via the economy
  module's documented unknown-region fallback.
- A failed autosave clears the pending-save flag. Later updates do not retry
  the accepted contract.

One measured duplicate consequence: generated job
`ct-german-site-hdd-7v8ap` costs **3049** to mobilize with the real HDD quote.
The first acceptance leaves money 0 and `run.mobilisation = 3049`. A second
cloned-card acceptance leaves money 0 but replaces the run with
`run.mobilisation = 0`. The lost cost would inflate the reported contract net;
the test requires the existing run to survive unchanged.

## API agreement with the production owner

Successful acceptance retains `{ ok: true, reason: '', mobilisation }`.
Rejected acceptance returns `{ ok: false, reason }` with a displayable reason.
An active job causes repeat or replacement acceptance to reject without changing
state, emitting changes, charging money, or replacing its accumulator. Validation
must finish before rig selection, mobilisation, or world mutation. Certification
is checked at acceptance time; arrival-time expiry is a separate policy question.

## Final acceptance gate measurement

After the parent's progression fix, the expanded gate passes **33 scenarios,
0 failures**. This includes all original 16 cases, malformed input regressions,
and event-order checks. The intentional primary-write failure still prints one
warning; a later update persists the same accepted job successfully.

On acceptance, a synchronous `CONTRACT_ACCEPT` observer sees the accepted
`targetDepth` already copied to `drill.target`, depth and stratum index reset to
zero, the matching world contract ID, and the established run. Rejection is
tested with nonzero stale drilling values and a previous world contract ID, so
accidentally clearing telemetry would fail the immutable-state assertion.

The malformed tests reject missing, blank, numeric or object IDs; unknown
methods; non-finite, zero or string depth; zero or fractional hole counts;
negative or non-finite payouts; non-array certificates; and an array decorated
with otherwise valid contract properties. The latter loses its named properties
when serialized as JSON and therefore must not be accepted as a saveable job.

A separate reload check covers an actual integration boundary: `main.js`
initializes geology before progression, and geology's `CONTRACT_ACCEPT` listener
generates the active profile. Restoring a contract without that event would leave
the initial default profile or change only its region. The gate verifies the
real progression/event bus delivers exactly one
`{ contract: savedContract, restored: true }` notification after restoring the
run, drilling target and world identity. The saved mobilisation and money remain
unchanged, and no nonzero money-change event is published. The test observes the
boundary; it does not duplicate geology generation in a fake.

## Limits

These tests establish CPU module behavior. They do not exercise contract-board
buttons or drilling telemetry restoration in a browser. Separate settlement
regressions own hole/reward replay after reload. No research here establishes or
changes economic rate provenance. The 33-case result was measured against the
parent's current production patch in this private worktree before commit.
