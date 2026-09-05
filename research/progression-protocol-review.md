# Completion protocol adversarial integration review

Scope: the actual progression, drilling simulation, event bus and production
contract generator. `tools/checkprogression-protocol-adversarial.mjs` replaces
only browser storage and advances depth through the simulation's public QA API.
No reward formula, physics, model, renderer or UI is copied into the test.

Run with `node tools/checkprogression-protocol-adversarial.mjs`.

## Final verification

**12 tests passed, 0 failed; process exit 0.** The executable rejects swallowed
bus-handler errors and checks complete progression snapshots for rejected events.
The expected denied-save and unpaid-preview warnings remain visible as compact
diagnostics in its JSON report.

The independent attacks cover:

- Reset and accept the same generated card while retaining its old completion.
- Remove either or both identity fields from an actual old completion after a
  new identified attempt starts.
- Replay, forge or omit IDs on a DRILL_START notification after settlement.
- Load an older same-process save after completing a later attempt.
- Abandon, save, reload and accept the same card while retaining an old result.
- Hold an actual completion, begin and abort the next attempt, deliver the old result.
- Begin the next hole from a synchronous completion observer; inspect the old
  completion and subsequent stop notification and replay that completion.
- Deny a save write, restore the older successful save, start and replay a
  completion from the unsaved newer attempt.
- Complete an unpaid real-simulation QA preview, then accept that same card
  and replay the preview completion.
- Submit a result with the actual just-aborted token before any new start.
- Reject allocations for absent or unrelated contracts without advancing IDs.
- Replay old, forged and tokenless abort notifications during a newer attempt;
  prove its real completion still settles exactly once.

The abort-revocation attack intentionally attaches an actual aborted start token
to previously generated result fields. It tests token authorization only; it does
not claim the physical simulation emitted that synthetic adversarial request.
All other completion payloads are produced by the real simulation itself.

In the deterministic full test process, older-save rollback preserved run 10
and advanced attempt 12 to 13. Replaying attempt 12 left the entire serialized
progression unchanged. The same protection held after a failed save restored
the older successful primary. Reset also kept outstanding IDs from being reused.

## Producer and consumer review

The producer captures scalar identity before publishing completion. A synchronous
HOLE_COMPLETE observer can start the next hole; the old trailing DRILL_STOP still
carries the old pair. The adversarial test proves it does not cancel or overwrite
the newer attempt. Delayed handlers receive captured values rather than values
looked up from the simulation's mutable current state.

The consumer matches both identities and consumes payment eligibility before
publishing transaction observers. Real-sim starts allocate through beginHole;
DRILL_START cannot rearm an identified run. Matching non-completion DRILL_STOP
revokes an aborted attempt; stale stops cannot revoke newer work. Older snapshot
restore preserves the process highwater, and save payloads persist the sequence.
Unpaid preview events with null identity fields cannot claim an accepted run.

No additional actionable protocol defect was found in the tested final source.
The existing no-sim compatibility path remains tokenless until a real simulation
attempt has been allocated. It is explicitly outside claims that tokenless
legacy result producers have immutable attempt identity. Tests do not claim
browser rendering coverage, hostile storage security, or cross-process delivery
from a deliberately rolled-back save.

## Intermediate baseline

With only the producer patch present, the initial nine cases failed: eight could
not start accepted work because the progression consumer had not yet published
beginHole; the unpaid-preview case exposed the existing completeHole fallback
paying unaccepted work (holesDone 0 to 1). Root was notified before its consumer
landed. Both integration boundaries pass in the final twelve-case gate above.
