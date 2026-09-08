# Independent core and sonic sample workflow review

**The interval workflow passes this bounded CPU review. Physical tender
compatibility remains a release blocker, and material recovery/quality gameplay
remains incomplete.** No browser, GPU, mobile layout, renderer animation or
physical-device acceptance was performed.

The critic owns only `tools/checksamplegameplay-adversarial.mjs`, its JSON
evidence and this report. Production changes belong to the consumer author and
the separate equipment author. The previously approved pure ledger is unchanged.

## Reproduction and result

From `C:/Users/henri/Downloads/threads/drillity-sample-gameplay`:

```powershell
node tools/checksamplegameplay-adversarial.mjs --out research/sample-gameplay-adversarial-2026-09-08.json
```

Final result: **20 / 20 groups passed; exit 0; all nine production input hashes
matched before and after execution.** No test or owned server remains running.
The evidence JSON records each outcome, real sample receipts and generated-hole
observations.

| Input | Final SHA-256 |
|---|---|
| `src/core/contract.js` | `dfb40a897139a7a67fc9d62a2d17a473096a51f42513becca6e3391767e3cf53` |
| `src/game/data.js` | `9b40e3e60237882f72d3573e1425b6a0cffa64a25c0a3a38eaa61445584feab3` |
| `src/game/equipment-support.js` | `f4fbb68c439cd2ceb210c9305e4da3479f4c5784a1db7029cca6842df3348666` |
| `src/game/progression.js` | `75489bd63d38daad3082a138c7516b35014950ee074045b4706184bedb39c991` |
| `src/sim/drilling.js` | `da4a5f214e02f128b6ed8beecf9b14637bde46799f9b4860724b34acbf09c0ec` |
| `src/sim/sample-ledger.js` | `6d17b4da3b4906f12c1d1fc7c0f272a83ab701b1ebd5392bc1194ff8dd73f45e` |
| `src/sim/sample-product.js` | `29992d3fd17348722a8b4c583da59bc82b757a6078406903a4a6450c131d0f0d` |
| `src/ui/screens/site.js` | `e836a292f85a616894dfdc401d373610162462089fe72109fbb5d1f86729e6ff` |
| `src/ui/screens/results.js` | `373591702151714496206bfc79a25fc6d1e4334f1e8399cab703177967668497` |
| `tools/checksamplegameplay-adversarial.mjs` | `6d22b82167787970c2429c208c8e3d710312bed3e2eada8048168983b2cc6457` |

## What was exercised

The gate creates real progression and simulation instances, accepts actual
contracts, uses public controls and `update()`, starts actual timed operations,
and consumes genuine `HOLE_COMPLETE` receipts. It does not teleport, enable god
mode, alter tuning, inject a successful completion or substitute an economy.
Short synthetic contracts are labelled boundary fixtures and do not represent
ordinary tender pricing or valid physical contract specifications.

- Core and sonic finish short, exact-boundary and partial-final intervals only
  after retrieval and handling finish. Starting an operation changes its timed
  phase without immediately changing custody or paying the player. Duplicate
  starts during that phase are refused.
- Waiting at a filled barrel does not add bore depth, wear, rods, hazards or
  money. Two tiny first-step targets confirm that the actual accepted slice
  incurs wear and that doubled accepted length doubles that wear. Source review
  also confirms the physical increment is bounded before `holeDepth`,
  `rollHazards()` and `stepWear()` consume it; the sample-wait transition occurs
  after final-slice wear.
- The current 1.5 m core barrel is separate from its 3 m rod. Handling at the
  first barrel stop adds no rod. At the coincident rod stop, a separate timed
  rod connection is still required, emitting `kind: 'rod'`. Sample retrieval and
  handling do not emit fake rod-extension events.
- Sonic refuses extraction before actual casing completion. All sampling stages
  freeze while paused, reject actions while paused and resume without accumulated
  wall-time catch-up. Abort and replacement attempts cannot complete old timed
  work or inherit its intervals.
- Genuine completion replay leaves every player total and saved product
  unchanged. Missing, incomplete, malformed, wrong-method and wrong-identity
  sample payloads cannot consume a pending attempt. Negative forged payloads are
  explicitly rejection tests; no forged success is counted as gameplay proof.
- Finished records survive actual JSON save/reload. A malformed primary sample
  record falls back to a real valid backup. Mid-hole reload creates a new physical
  attempt at zero depth with no inherited interval ledger.
- The actual shipped Site action and observer functions are extracted through
  the JavaScript AST. Started operations do not announce completed custody;
  completed records appear once, including when a new barrel opens between UI
  polls. Old-attempt and unmounted-screen snapshots are ignored. Only notice/log
  sinks and screen lifetime boundaries are substituted; native DOM dispatch and
  layout are not tested.
- The actual Results `buildSummary()` and its source helpers consume only the
  authenticated receipt. Preview mode, detached stale payloads and an explicitly
  fault-injected malformed receipt remain without a sample-product claim.
- Explicit BQ, HQ and sonic-bit replacements cannot trip into the current NQ
  sample train. A compatible replacement and the existing default spare trip
  preserve the open interval. Source review confirms automatic `_spare` paths
  are normalized in `beginTrip()` too; the gate does not claim it triggered a
  naturally occurring emergency bit failure.

Two unmodified generated tender holes also completed through public gameplay:

| Method | Tender ID | Target | Intervals | Campaign coverage |
|---|---|---:|---:|---|
| Sonic | `ct-nordic-sonic-9nb6i` | 33 m | 11 | First hole of nine |
| Core | `ct-nordic-core-3cf1g` | 205.8 m | 138 | First hole of three |

They are selected from 1,200 actual `makeContract('nordic', 60, random)` calls
with `makeRandom(20260919)`, choosing the shortest observed target of each
method. These runs establish game-path continuity and receipts; **the next
section prevents interpreting them as physically compatible tender acceptance.**

Three warnings were retained in the evidence: the existing contract-cleared
while-SITE-remains-mounted diagnostic, the intentional replay with no remaining
contract, and the intentionally malformed primary save falling back to backup.
This is not a claim of a warning-free browser run.

## Findings corrected during review

The initial Site observer inspected only `lastInterval`. Because the 1.5 m core
barrel can be handled between rod extensions, a new row can open at 120 Hz before
the next 8 Hz UI poll. That lost the prior boxed/logged transition. The final
observer consumes all unseen completed records, validates the current attempt,
and retains a completed interval for the unit card.

The author also identified that public bit changes could bypass startup sampling
compatibility. The final implementation validates proposed replacements before
starting the trip and retains a compatible physical identity for default and
automatic spares. The independent trip regression passes.

### Capacity-provenance follow-up

The final shared equipment metadata distinguishes the core inner-tube length
from sonic's **authored gameplay run limit**. The sonic 3 m interval must not be
represented as a measured usable inner capacity. Three new independent groups
verify the additional `capacityBasis` / `sampleCapacityBasis` fields through live
programme summaries, state, real completion, settlement, actual Results summary
and JSON save/reload. The Site card explicitly labels sonic's value a game
setting.

Ten genuine simulation completions have their basis envelope deliberately
corrupted before the progression listener receives them: missing, null,
wrong-method, invented-string and object values for each method. Every one is
refused before money, XP or career progress changes. Older settled records with
no recorded basis remain readable with an unrecorded basis; neither loading nor
Results promotes them to measured capacity. An explicitly wrong recorded basis
is rejected. Existing malformed-product tests provide a correct basis so that
the new guard cannot hide the older validation path behind an earlier rejection.

All prior 17 groups were rerun with this provenance delta. The pure ledger hash
remains unchanged; the table above supersedes the earlier workflow hashes.

## Release blockers and limits

1. **The current equipment guard does not validate tender hole diameter.** The
   generated core tender above requests **106 mm**, while its accepted default
   NQ bit and barrel both have sourced `holeDiameterMm: 75.7`. The generator and
   defaults therefore permit a job the selected physical train does not match.
   `checkSampleEquipment()` explicitly limits itself to family/role metadata.
   This is an observed incompatibility, not permission to invent an NQ diameter
   or quietly rename the tender. Correct generated specifications, supported
   tool choices and readiness must agree before that milestone is closed.
2. The sonic tender above requests **116 mm** and selects the generic 100 mm
   barrel / 150 mm casing set. Thread hands are recorded, while the 3 m sampling
   interval is now explicitly a gameplay setting. Usable inner capacity, full
   dimensions and clearance of that exact tool train remain **NOT SOURCED**.
   The workflow must not be described as a sourced geometric fit.
3. Retrieved/handled bore coverage is not recovered material length, TCR, SCR,
   RQD, intactness or undisturbed sonic quality. Actual product-quality outcomes
   and their grade/payment consequence remain open. Finishing interval handling
   now gates the existing tender payout; it does not fulfil core's entire
   recovery-quality promise.
4. Source AST callback checks do not establish rendered layout, touch targets,
   focus behavior, accessibility announcements, mobile overlap, sampling rig
   animation, phone performance or sustained player experience. Those need
   separate browser/device evidence after integration.
5. Full assembled CPU/build checks and non-sampling method regressions remain
   the root's integration responsibility. This candidate contains copied earlier
   reviewed work; integrate only its recorded sampling delta, not whole files
   over a newer main worktree.

The interval workflow may be integrated as a reviewed increment. Do not mark
core or sonic, or the physical generated-contract milestone, complete from this
report.
