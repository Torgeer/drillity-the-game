# Completion navigation and results identity

2026-09-06, integration checkout `codex/astra-improvements`.

## Confirmed defect

The contract-board review executed the actual shell `HOLE_COMPLETE` callback
with real progression and its event bus. After attempt 3 started, attempt 2
was rejected without payment but still requested Results. The former results
reader authenticated only contract ID and approximate depth, allowing one
hole to borrow another hole's settlement. Final-hole progression also emitted
a synchronous Results scene change without the actual completion parameters,
before the shell's completion microtask.

## Implemented boundary

Progression remains the sole settlement authority. Each accepted completion
records its run and attempt on the ledger entry, and a private WeakMap holds a
receipt keyed by the exact accepted payload. The receipt freezes snapshots of
the payload's identity fields. `settlementForCompletion(payload)` returns the
recorded settlement only while those identity fields match and that settlement
still belongs to the live ledger. A copied payload, mutated identity, rejected
attempt, or ledger replaced by load/reset cannot obtain that receipt. This is
an in-memory UI receipt, not a persisted authorization token.

Receipts are recorded before queued settlement notifications flush. The shell
waits one microtask and navigates only for a newly issued receipt that remains
the latest settlement and has not been superseded by a new attempt/job or
navigation away. Multiple callbacks share the settlement level-up window
without a stale callback erasing its announcement. A repeated payload object
is supported when progression actually accepts another hole; its previous
receipt alone cannot trigger navigation.

Final-hole `SCENE_CHANGE` now carries the actual accepted result. The shell
suppresses that duplicate route during its completion window. Direct progression
completion callers still use the scene notification, after its receipt and
current run have been checked.

The results summary reads the receipt for its actual completion, replacing the
contract/depth guess. `__qa.showResults()` directly requests `{result,
preview:true}` and emits no completion event. A preview supplies no settlement,
money, XP or ledger lines, and skips the no-progression statistics fallback.
This preserves visual review without completing a real job.

## Fresh verification

`node tools/checkresults-identity.mjs`: **18 cases passed**, exit 0. Vite's
existing parser extracts and executes the current shell completion, scene and
level-up callbacks, the actual results receipt reader and summary (including
its real formatter/constants), and the actual QA method. Each extracted source
is identified with a line and SHA-256 in the gate output. Real progression,
simulation, generated contracts, event bus, and native microtasks execute.
Navigation recording and browser storage are the controlled boundaries;
contract normalization and cosmetic item lookup are adapters in the summary
fixture. No settlement calculation is copied into the test.

Cases cover malformed completion rejection, real one-hole and three-hole simulation completions; stale,
duplicate, wrong-contract and partial/tokenless identities; reused and mutated
payload objects; tokenless compatibility; receipt availability during money
observers; reentrant stale events and next-attempt starts; direct final-hole
completion; next-job acceptance during notification; reload; disposal/navigation
away; the QA preview; and exact paid versus unpaid results-summary figures.
Captured callback exceptions fail the gate instead of being hidden by the bus.

Existing gates also passed after the change:

- `checkprogression-acceptance.mjs`: 33 cases.
- `checkprogression-settlement.mjs`: 28 cases.
- `checkprogression-protocol-adversarial.mjs`: 12 cases.
- `checkprogression-adversarial.mjs`: 10 cases.

These are CPU callback/module checks, not a mounted-DOM, screenshot, touch-size,
or GPU-performance verdict. No Blender assets, physics tuning, HUD layout,
authored motion, or touch target dimensions were changed in this patch.

Owned changes: `src/ui/shell.js`, `src/ui/screens/results.js`, the additive
receipt/event parameters in `src/game/progression.js`, the final preview action
in `src/main.js`, `tools/checkresults-identity.mjs`, and this report. Concurrent
rig-capacity selection changes in progression belong to their separate owner.
