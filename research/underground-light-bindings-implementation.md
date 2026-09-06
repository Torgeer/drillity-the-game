# Underground work-light binding implementation

Private worktree: `C:/Users/henri/Downloads/threads/drillity-underground-light-bindings`.
Branch: `codex/underground-light-bindings`.
Baseline: `beedaafbf3834ecf6df01864f47c94c33860d559`.

Production ownership is limited to the work-light contract/selection regions of
`src/core/env.js`. This worker also owns this report. No Git index or commit was
mutated. The shared `node_modules` and `public/models` junctions were read only.

## Established cause before production edits

The independent actual-GLB reproduction ran the real `createGltfRigs`,
`createRigSystem`, and `createEnvironment` modules. Baseline evidence was secured
before editing. A completed direct raisebore-to-jumbo switch, with no interleaved
environment update, still left both floods reading the old raisebore array on
repeated frames. The exact root warning requested `boom-l-lamp-0` and
`boom-r-lamp-0` while reporting `table-work-light, feed-work-light`.

The environment cached `getWorkLights()` until `RIG_CHANGE`, but public
`rig.setRig()` and late `rig:model-ready` replacement can change the active build
without that event. Reversing the direct rig/contract assignment order did not
repair the retained array; emitting `RIG_CHANGE` did. This is a persistent
consumer defect, independently of any transient mismatch in a capture fixture.

Fresh legal rockbolt scenes exposed a separate defect. The site method selected
`feed-work-light` even when the active allowed rig was a longhole rig or jumbo.
The ordinal fallback placed the key on `tram-r-0` or `tram-f-00` respectively.
See `underground-light-bindings-reproduction.md` for source/model hashes and
reproducible baseline observations.

## Final behavior

The existing four method-to-semantic-lamp pairs now have one definition,
`UG_WORK_LIGHTS`; there is no additional table of rig IDs. The active built
`getSpec().methods` limits eligible profiles, and the live publisher identifies
the applicable named contract. The active machine must also declare the current
site method. A transient incompatible machine/site pair remains diagnosed.

A sole declared profile retains its expected names even if broken. With
alternatives, any exact semantic member identifies a candidate; exactly one
candidate must match. Multiple matches are rejected even when one is complete:
a complete generic profile cannot conceal a broken partial specific profile.
Matching never uses publisher order, lamp movement flags, position, or inferred
machine dimensions.

Every underground update reads the active lamp array and active spec. Their
identities scope diagnostics, rather than acting as an event-invalidated cache.
Each followed light requires one uniquely named descriptor with live mount/aim
nodes and finite, distinct world positions. Zero world coordinates are valid.
Missing, duplicate, ambiguous or malformed contracts remain warned and restore
the authored position, target, cone, range, colour and watt trim. They never bind
an unrelated lamp or keep the previous machine's pose.

Valid bindings consume the live mount and aim world positions every update,
preserving pose changes even when the array identity stays fixed. Descriptor
cone, range, colour and watt treatment remains the existing implementation.
The site's light powers, falloffs, targets, quality counts, medium settings,
environment dimensions and geometry constants were not retuned. No researched
physical-characteristic change was necessary.

Only slots already authored to follow a machine bind. In rockbolt, `ugFloodL`
follows the actual machine's work lamp; `ugFloodR` stays the existing authored
platform fill even when the rig is a jumbo. Changing that fixed fill to another
moving work light would require separate visual evaluation.

## Validation and freeze

Final raw `src/core/env.js` SHA-256:
`5cf8bc01192d9686aefd1f5905b9863c92d9bd3a09a75723a0cd503862d7b886`.
Executable-tested candidate raw SHA-256:
`ce598171084bdd32829910463083e7991b04de585b1387aa09eb2d69b58c739d`.
The final source differs only by a historical comment clarified at the parent's
request: the bottom `NEEDS` note now identifies `followAt` as removed.
Original worktree env SHA-256:
`05fe543057ed850f4ee4624dea81a7c4efd373ce92324ee4aa35c400e4ed800b`.
Baseline Git LF blob SHA-256:
`545e6105aa262ac7fef66b9c35acd24e7f31918bbee7d155c95a2263a45ae7d9`.

- `node --check src/core/env.js`: passed.
- `git diff --check -- src/core/env.js`: passed; Git only notes its existing
  LF-to-CRLF checkout policy.
- Actual-GLB regression worker: **29/29 scenarios passed**, including all six
  legal underground rig/method pairs at three quality tiers, direct switch
  orders, event control, same-method swaps, an actual public carriage update,
  and independent mount-parent/aim pose probes.
- Independent adversarial worker: **25/25 cases, 209 assertions passed** against
  the frozen hash. Cases include actual same-ID procedural-to-GLB replacement,
  cached/direct/method-first switches, missing/duplicate names, invalid aims,
  nonfinite/coincident targets, exact authored property restoration, missing or
  ambiguous metadata, partial competing profiles, day transitions and LOW.
- Parent independent rerun: actual baseline **18/29** to candidate **29/29**;
  expanded adversarial baseline **7/25** to candidate **25/25**. Existing loader
  **39** and metadata **80** checks passed. Parent scope verifier found all
  **12** underground authored solves, constants and fixture outputs unchanged.

Both test workers found an early harness omission: `ctx.data` must also be
passed into the actual GLB loader so its spec carries the same declared methods
as production. They repaired the fixtures and reran them. Production was not
changed to accommodate that fixture issue.

## Root integrated verification — 2026-09-06

Root applied the six-file delivery and verified every LF-normalized source hash
against its manifest. The29-case and25-case/209-assertion CPU suites pass again
in the original checkout. The full current CPU suite also passed before the
subsequent independent vibro integration.

The headed game smoke now passes5/5 actual-GLB cases in
`shots/underground-light-bindings-verified/report.json`: raisebore, direct
raisebore-to-jumbo and rockbolt with bolter/longhole/jumbo. Three settled actual
mount/aim samples per case match, with zero steady binding warnings, errors or
failed resources. All transition warnings remain recorded; the sole warning
was the deliberately unpaid QA preview. Browser started and closed normally.
Root inspected the rockbolt-longhole whole-page image: the scene and instrument
labels render, with visible illumination. This is not an appearance, motion-lag,
shadow-quality or performance certification.

The exact capture body is preserved as tools/checkundergroundlightbrowser.mjs;
only its own filename/reference changed after the recorded .bak run. Source and
four GLB identities were verified against actual served bytes. The first attempt
stopped before browser creation because Vite served main.js raw without a JSON
export wrapper; the verifier now accepts either representation only on exact
normalized source equality. Ten CPU identity controls reject stale/malformed
content. No access denial or resource error was bypassed.

## Original private verification limits (historical)

No headed browser, GPU lease, server, renderer or dimension CLI was started.
These checks prove actual loaded node contracts and live consumer behavior,
not illumination quality, visibility, shadows, shader behavior or FPS.
Production registers/updates env before rig; its possible one-frame pose lag
predates this patch and is not fixed or certified here. The private renderer is
older than root's uncommitted integrated candidate. Final integrated runtime
verification and archival remain the parent's responsibility.

Executable source was frozen after the incompatible-method guard and before the
final independent review. The parent then requested the historical-comment
clarification above. No outstanding implementation defect was reported by the
critic at that freeze.
