# Progression adversarial investigation — 2026-09-06

Scope: actual `src/game/progression.js`, with the shipped event bus, state
factory, data and economy modules. The only environmental substitute is an
in-memory `localStorage` implementation that can reject selected writes. No
economic rates, renderer, UI, data or simulation files were changed here.

Executable gate: `node tools/checkprogression-adversarial.mjs`.

## Baseline measurements

All seven cases failed on the initial progression source (save version 4).

| Case | Observed failure |
| --- | --- |
| Reenter completion from `MONEY_CHANGE` | A nested completion returned a settlement for the same first hole. |
| Save from first payout notification | Reload restored EUR 4,891, zero XP and zero completed holes; the finished transaction held EUR 4,412, 361 XP and one completed hole. Costs, run progress and ledger were absent from the successful observer save. |
| Reenter acceptance from mobilisation notification | The nested acceptance returned success while the outer acceptance was still committing. |
| Valid JSON, structurally invalid primary with valid backup | `unlocked.rigs: {}` threw after primary name/money had already replaced live values; the backup was not applied. |
| Recover corrupt primary, then fail next primary write | The corrupt primary text overwrote the good backup before the failing primary write. |
| Deny writes while permitting reads | A readable saved EUR 4,623 career loaded as the fresh EUR 4,500 career because the storage helper required a write probe. |
| Transient failed autosave | A later successful-storage update retained the prior EUR 4,500 save instead of retrying the unsaved EUR 4,623 state. |

The monetary and XP figures above are outputs from the actual modules for the
shipped emergency auger contract and starter loadout. They are test evidence,
not newly proposed rates or balancing recommendations.

## Review criteria

Event notification queuing must be paired with committed duplicate protection:
otherwise a completion observer could book a second hole while the originating
completion call has not returned. The final patch consumes `holePending` before
notifications and closes a finished job before its results event. It therefore
rejects duplicate completion while permitting a results observer to accept the
next job. Saving from a queued notification observes the committed transaction.

A readable malformed primary must be rejected before touching live state and
must not prevent trying the backup. A known-corrupt primary must never be copied
over the last valid backup, especially when the new primary write subsequently
fails. A failed save must remain pending for retry.

## Final patch verification

Independent rerun against the production patch: **10 tests passed, 0 failed**,
exit code 0, using `node --test-reporter=spec tools/checkprogression-adversarial.mjs`.

The review found and reproduced two further gaps while the patch was being
built; both are fixed and retained as regressions:

- Explicit `null` career collections bypassed the first structural validator.
  `ledger: null` threw during restore after changing the live balance. The test
  now covers null ledger, reputation, certificate-expiry and first-time maps.
- A restore observer's failed save request was erased when `load()` reset its
  dirty flag after emitting notifications. Dirty-state initialization now runs
  before the restore transaction, preserving a failed observer save for retry.

Another case verifies that an unsolicited `CONTRACT_ACCEPT` notification
cannot open, replace or dirty a job. Storage-write counts are asserted as well
as snapshot equality, so an identical-JSON redundant save does not hide a dirty
flag regression. Restore notifications still reach normal event consumers.

The event ordering was also checked against `src/ui/shell.js`: queued
progression notifications still drain synchronously before the shell's
`HOLE_COMPLETE` microtask mounts the results screen.

## Limits

No browser storage, rendering, GPU capture or UI interaction was exercised by
this gate. The existing emergency-contract missing-archetype warning remains
visible and was not changed. The validator is not a complete hostile-save
numerical schema. The original review identified missing per-attempt simulation
identity as a cross-file limitation. The subsequently authorized simulation
follow-up fixes that gap with captured run/attempt IDs; see
`progression-protocol-review.md` and the final section of
`progression-settlement-investigation.md` for current executable evidence.
This original investigation agent made no simulation production edits.
