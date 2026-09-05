# Independent results identity and owned capacity review

2026-09-06, original integration checkout. **Bounded pass: no blocker reproduced
in the reviewed settlement/navigation or owned-depth preflight changes.**

`node tools/checkresults-critic.mjs` exited 0 with **27 passing cases**: the
existing 18 actual-callback cases plus 9 independently chosen critic cases.
The extension imports the existing gate's extraction and fixtures; it adds
scenarios, not an alternative implementation of settlement or navigation.
Each executed production callback and the full studied files are SHA-256
identified. The gate refuses a run whose production hashes change in flight.

Additional probes executed three real simulation completions synchronously
before the results microtask and verified that only the third receipt was
shown, with its own exact rounded payout. They also covered synchronous reuse
of a tokenless compatibility payload, reset and load during queued navigation,
rejected duplicate acceptance from money observers, a completed card accepted
again with the same contract ID, real SCENE_CHANGE navigation away, and normal
completion after reset while an old-career completion was rejected.

The ninth case starts the actual HDD, tunnel-jumbo, rockbolt, and longhole
simulations after acceptance, using generated contracts with explicit boundary
probe lengths above unrelated vertical ratings. Every simulation retained the
accepted target, without a universal vertical-capacity clamp. This verifies
units and lifecycle integration; it does not certify route geometry, individual
bolt/longhole lengths, attachments, or practical physical feasibility.

Independently rerun supporting gates:

- `node tools/checkprogression-capacity.mjs`: **15 passed**, including all
  **33 rated vertical rig/method pairs** exactly at and above their limits.
- `npm run check:progression`: **83 passed** (33 acceptance, 28 settlement,
  10 persistence/accounting adversarial, 12 attempt-protocol cases).

Source review confirmed that main initializes UI separately before progression
initialization (`src/main.js`, UI init around line 539), matching the callback
harness's listener order. `changeContract()` records the settlement and receipt
before it flushes observer events. Receipt invalidation compares both the exact
payload identity fields and membership in the live ledger; reset/load therefore
invalidate the old ledger references even if the contract ID is later reused.
Depth preflight is before selection, mobilisation and event publication, and
shares `DEPTH_IS_VERTICAL` and `rigDepthCapacity()` with the production data.

## Limits

These are CPU tests using real modules and actual extracted callback source,
with recorded navigation and in-memory browser storage. They do not mount the
complete DOM, test animated screen transitions, measure GPU performance, or
prove every future subscriber ordering. Existing summary fixtures normalize
contracts and item lookup through adapters. Copying/replaying arbitrary console
objects is not treated as a security boundary. The receipt intentionally remains
available for an older valid result while its settlement remains in the live
ledger; automatic navigation additionally requires the newest settlement.

No production files were edited or staged by this reviewer. A transient test
composition error (an inserted import before a shebang) was fixed in the new
critic harness before the final 27-case passing run. Final execution log is the
local ignored `.bak/results-critic-review.log`.

## Stable reviewed SHA-256

| File | SHA-256 |
|---|---|
| src/game/progression.js | a65b45cd7af075cd3c2f209241e8f10c186ad293db42355ae52f21cb9bc67b17 |
| src/ui/shell.js | db7780068ae96f906f09778b220e774453856d8e9e97318a1887868f26e7b011 |
| src/ui/screens/results.js | ea61aacaa684a1c921d6b7b7ffc3d1a8ede4f078dea8b679a5db2826e96ce8a4 |
| src/main.js | 5cb5a8f4f216c9334f0a99eb9b558ebbe11d8920e90df915156a8d05e287e738 |
| src/game/data.js | 8596c00a72daa61394097a128c476ad565efe82494c0ea30d5850558aa2dda57 |
| src/sim/drilling.js | 42abeb1f9c09a427e16575dd78ee2dd0c63a66588e3dd363f776e37ae5ad2ed0 |
