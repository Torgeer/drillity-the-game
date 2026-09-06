# Contract readiness — independent adversarial review

Measured on 2026-09-06 in
`C:/Users/henri/Downloads/threads/drillity-contract-readiness`, based on
`a3fb99412d4996d352e3e95609bb5b3ff8d2752f` (`codex/contract-readiness`).
The reviewer owns only this report and `tools/checkcontract-readiness.mjs`.
No production, original-checkout, Git index, browser, server, or GPU writes
were made by this reviewer. Live Codex usage read during review was 67% used,
33% remaining; no reset, credit, escalation, or push was requested.

## Measured result

`node tools/checkcontract-readiness.mjs` passed **37/37 cases**, with
**2,499 preview calls**, **115 full purity comparisons**, all **33 rated vertical
rig/method pairs** at/above their published limits, and **four actual acceptance
observer snapshots**. The gate imports the real progression, data, economy,
game-state, random, and event-bus modules. Only localStorage is replaced by an
in-memory store. Real generated contracts cover all 21 methods; boundary inputs
are clearly test values, never additional machine ratings.

Every purity comparison checks complete JSON live state and progression
serialization, cash and ledger (inside those snapshots), storage reads/writes/
removals and contents, captured event payloads/counts, seeded randomness, input
contract contents, and live run/contract/site/career/cert/loadout identities.
Global `Math.random` is also counted. An additional `update(2)` proves the
preview did not schedule a deferred autosave. The no-career probe deliberately
avoids `serialise()` because that existing API itself creates career state.
Deep-frozen game state and contract inputs also preview successfully.

The cases exercise:

- Null, array, primitive, unknown method/region, malformed ID/depth/holes/pay/
  certification-list refusals; level and method unlock gates; missing and
  expired certificates without silently removing them.
- Unowned selected rigs, no owned compatible rig, unknown conversion ratings,
  exact method-specific vertical limits and excess depth, selected-capable rig
  preference, and fallback to a capable owned alternative without preview
  selecting it. HDD length, jumbo chainage, rock-bolt drive length, and longhole
  totals remain outside the vertical-depth comparison.
- Exact real `travelCost` quoting, one-euro shortage with actionable refusal,
  exact available funds, and detached result tampering. Changing returned
  `ok`, reason, rig, price, or adding fabricated authority never authorizes
  acceptance or mutates game state.
- Ready-preview followed by changed cash, removed/expired certificates, lost
  capable ownership, deeper target, changed selected rig, changed travel origin,
  or another active run. Actual acceptance rechecks live state and either
  refuses unchanged or uses the live rig/cost. Preview adds no unlocked-region
  restriction absent from the real acceptance path.
- Repeated active-run previews preserve run/attempt identity. RIG_CHANGE,
  MONEY_CHANGE, CONTRACT_ACCEPT and REGION_CHANGE observers all see the complete
  selected, paid, identified run/site/world. Observer preview and reentrant
  acceptance refuse without mutation; observer saves contain the complete run.
  Exactly one mobilisation charge and one acceptance event are emitted.

The gate also captures `console.error` per case because the real defensive event
bus catches observer exceptions. A swallowed assertion is a test failure, not
a false pass. Empty generated-method coverage and missing rated-pair coverage
are explicit failures.

The following existing suites were independently rerun against the same
progression source; all exited 0:

| Command | Result |
|---|---|
| `node tools/checkprogression-acceptance.mjs` | 33 passed |
| `node tools/checkprogression-capacity.mjs` | 15 passed, 33 rated pairs |
| `node tools/checkprogression-protocol-adversarial.mjs` | 12 passed |
| `node tools/checkprogression-settlement.mjs` | Passed |
| `node tools/checkprogression-adversarial.mjs` | 10 passed |

Their deliberate storage-denial, missing rescue metadata, and unpaid-preview
diagnostics remain visible. No save, settlement, completion-receipt, or billing
implementation was changed for this work.

## Findings and corrections

No protocol mutation, observer atomicity, run-identity, ownership, capacity,
certificate, or cost regression was found in the reviewed extraction.
`preflightContract` is the single rule owner; public `previewContract` calls it,
and `acceptContract` obtains a fresh result before the existing transaction.
The result carries scalar facts and no shared rig record. The transaction body
and completion/save protocol remain unchanged.

One initial test assumption was rejected by measurement: foundation-bg and
cfa-rig do not produce distinct travel prices in the tested route because both
reach the existing mass-factor clamp. That was a fixture error, not a gameplay
defect. The live-selection probe now uses the real crawler-lite/core-rig pair,
whose measured transport costs differ, without modifying economy or data.

UI inspection confirmed removal of the old duplicate `lockReason` rules,
neutral required-certification rows that do not mislabel expired held entries,
read-only live refresh over displayed contracts, and one actual acceptance
call in the action path. Missing readiness API and caught preview failures fail
closed; actual acceptance failures stay in the sheet without navigation.
Readiness updates retain existing card nodes and keyboard focus rather than
rebuilding the board. These are source-review findings, not rendered evidence.

The UI owner resolved the logging review note. Current source uses a `WeakSet`
of failing contract objects, checks/adds that contract on failure, and calls
`previewErrors.delete(contract)` only when that same contract succeeds.
A successful neighboring card can no longer reset another card's warning
deduplication. This fix was verified by source inspection and the updated
SHA-256 below; the unchanged protocol suites were not unnecessarily rerun.
Root's final headed reproduction and the independent saved-evidence review
below now cover the native-focus and recovery behavior.

## Final headed evidence, separately attributed

Root ran the leased headed production DOM fixture on port 5204. This reviewer
read `.contract-qa/current/report.json`, the earlier
`.contract-qa/focus-recovery-before.json`, `.contract-qa/final-summary.json`, and
`.contract-qa/resources.json` after the browser closed; no new browser or GPU
session was launched. The final report records **218/218 assertions across 60
states** at 320×568 and 390×844. It contains **234 measured native target
instances**, with minimum dimensions **44×44px**, and zero recorded clipping,
overflow, overlap, text overlap, or external occlusion. Root compared labels
against the previous board's actual saved report: **all original 44 states are
present**, plus 14 readiness states and two acceptance-recovery states.

The earlier focused run records six failures: keyboard containment after
readiness disables Accept, dialog focus after real API refusal, and stale
refusal text after restored ownership, each at both widths. The final report
passes those same six checks; restored ownership leaves state unchanged,
reenables Accept, and hides the obsolete error. Current source matches that
behavior: disabling a focused Accept moves focus to Close; retryable refusal
restores Accept focus; changed readiness clears the previous refusal while the
failing click retains the actual API error.

This reviewer independently opened these existing PNGs with `view_image`:

- `.contract-qa/current/320-starter.png`: readiness and rig/mobilisation facts
  sit directly beneath the card title. The visible narrow card has readable
  wrapped text, distinct quote/time metrics, and no visible overlap; further
  content continues in the board scroller.
- `.contract-qa/current/320-accept-recovered.png`: the scrolled sheet shows no
  stale refusal alert, and Close/Accept remain separate, visible native actions
  below the settlement content.
- `.contract-qa/current/390-readiness-funding-details.png`: the bordered current
  readiness panel plainly reports the €951 mobilisation cost and €951 shortage;
  the rig and cost line remain readable, and the unavailable action is visibly
  disabled beside Close without overlap.

Resources are recorded closed. Root reports awaited `browser.close()` followed
by `isConnected() === false`, verified Vite closure, and a successful exclusive
TCP bind to 5204 after closure; `resources.json` records those results. Windows
denied `Win32_Process`/`Get-CimInstance` inventory, and no retry or escalation
was attempted. This is closure evidence with a documented inventory limitation,
not a claim that every system browser process was enumerated.

## Source identity and limits

SHA-256, bytes as reviewed:

| Path | SHA-256 |
|---|---|
| `src/game/progression.js` | `ae89dfb5ee20c3b88324f0cb7337171f14b4bf84484b24fd8e512de497160249` |
| `tools/checkcontract-readiness.mjs` | `f7305d136cc224e17de4d63568b40b5eb93fb7a2a313b93eff34bd42b045c39d` |
| `src/ui/screens/contracts.js` — final headed source | `df3d2e3cb32e99271e05e56980c2d7bd704848d72b2d3aa1c8b9631ca27ce9b8` |
| `src/ui/screens/contracts.css` — final headed source | `d6862cb70412f589ff37be4abca62d888039f3d48d92eb74d3ffcf98ac7120db` |
| `tools/checkcontracts.mjs` — final headed gate | `306e514bcd2ae3dd4195a4643e8635aa8c0c813a123916336ecc53c4717a75d4` |

Final UI hashes were read from disk and match the headed report's source hashes.
The CPU gate emits current source hashes on each run so root can record the
integrated result. No protocol test rerun was needed for the final UI-only fixes.

The CPU results remain independent of the separately attributed headed
evidence. The latter uses desktop Chrome viewports, system fallback fonts,
reduced motion, and zero safe-area CSS values. It does not measure remote font
loading, physical-device safe areas, non-reduced motion, screen-reader speech,
formal contrast compliance, full-game WebGL, the simulation loop, or FPS.
Three independently inspected screenshots support only the visible states
described above; the 60-state assertions come from root's saved actual DOM
measurements. Public models are unnecessary for these probes. Existing gameplay
rules are preserved; the tests do not certify physical feasibility of
nonvertical lengths or the economics themselves.

Owned files are frozen for root review/integration. No browser or service is
owned by this reviewer, and no cleanup or archive action remains here.
