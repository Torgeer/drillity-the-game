# Core tender size and accepted-job preservation

Candidate: `drillity-next-sampling-fit`, detached base `a47de8a` with the complete
300-file frozen `resume-70-baseline-2026-09-08` overlay. Snapshot hashes were
verified before edits; `drillity-coordination/next-sampling-fit-baseline.json`
records the exact dependency set. Root alone integrates production.

## Scope and physical evidence

New core offers select the supported unlocked sampling system's nominal bore
size. The stocked complete NQ/NWL pair uses **75.7 mm nominal bore**, sourced in
the existing item metadata to `Diamond Driller's Technical Book (1).pdf`, PDF
page 35 / printed page 69. The spread distinguishes nominal system bore from
component dimensions: this is **not** a claim that the crown's measured OD is
exactly 75.7 mm or that manufacturing tolerance/reaming clearance was modelled.
Exact equality in the new guard compares nominal catalogue sizes.

Core preflight and simulator startup reject missing, malformed and conflicting
nominal sizes before accepting a job or allocating/replacing a physical attempt.
The simulator also guards its actual method-string/row, rig and site resolution
path. Mid-hole replacement still requires a supported matching sample set.

**Sonic is unchanged.** Its existing 100/150 mm item labels do not establish a
sourced bore/clearance configuration. Comparing a tender with the 150 mm casing
label would not prove fit. No sonic diameter, clearance, usable inner capacity
or new physical dimension is introduced or certified here.

## Commercial terms and persistence

The existing random diameter draw is still consumed before selecting the core
system's nominal size. This preserves subsequent random choices and other
methods' offers. New core tenders use the existing economics formula evaluated
at their corrected nominal size; their quoted price can consequently change.
No existing accepted price, bonus, deadline, workload, geology or diameter is
rewritten, and querying a board/readiness does not mutate its cache or charge.

New paid core contracts are detached deep-frozen snapshots. A private progression
reference is the authority for startup and saving; the public run's contract
property cannot be reassigned. A same-ID caller proposal starts the canonical
accepted job, preserving existing restart behavior. An unrelated proposal or
replaced public state cannot substitute new paid terms.

An actual accepted older core run can already require a diameter unsupported by
the current shop. On load only, valid prior run identity and the saved policy
boundary allow the specific old mismatch to retain its original terms. This
exception lives in a private closure, not a caller parameter or public run flag.
Matching old jobs require no exception. Saving records policy version 1 and
derives the legacy marker from that private authority, allowing a legitimate
old job to survive another reload. Closing or resetting the job clears it; the
same mismatched contract cannot then be newly accepted.

Documented v4/v5 accepted accumulators predate identity fields. The loader
retains the original schema version internally before migration and recognizes
that bounded shape only with an actual partial/unstarted hole count and finite
mobilisation. Empty/null old accumulators and modern runs without identity do
not receive the exception. These migration fixtures are derived from committed
MIGRATIONS3/5, not represented as captured historical player saves.

This is a compatibility policy for persisted accepted work, **not physical fit
approval of legacy jobs** or tamper-proof authentication of hand-edited save
files. Unsupported/missing sample components still refuse and can be repaired
through the existing shop. Non-core career load and settlement remain unchanged.

## Verification

`node tools/checksamplingtenderfit.mjs --baseline ../drillity-coordination/resume-70-baseline-2026-09-08`
passes eight author groups, including 314 generated core offers covering all 43
unlocked levels, 3,126 byte-identical non-core offers, and 1,260 unchanged default
choices. Actual public purchases/acceptance, immutable terms, no-mutation
refusals, direct simulator rejection and new/legacy sampled completion run
through production APIs. Funds/short targets are explicit boundary fixtures,
not an unaided career balance claim.

Independent attacks are in `tools/checksampletender-adversarial.mjs`, with exact
source hashes and results under `evidence/sample-tender-critic`. They reproduced
and closed public run/state aliasing, save/reload authority, nominal-size wording
and method fallback gaps. Failed runs retain their original status; a broader
sampling run overlapping source edits was correctly rejected for unstable bytes.

Final independent frozen-source review approved **21 tender groups, 27 existing
loadout/runtime/catalogue groups and 20 sample gameplay groups** (68 total), all
exit 0; the tender/gameplay manifests confirm source stability. See
`evidence/sample-tender-critic/REVIEW.md` for exact final source hashes and the
preserved failed runs.

Focused regression checks passed: progression acceptance 33, settlement 28,
adversarial persistence 10, and protocol 12; readiness 37; contract CPU generation
378 boards / 1,890 offers across 21 methods and eight regions; sampling author 12;
sampling gameplay critic 20; and existing sample loadout/runtime/catalogue 26.
The passive-skill regression gates also pass 12 author and 18 critic groups.
The amended historical programme-copy comparison covers 9,600 offers: 8,748
unchanged non-core terms and 852 intentional core nominal-size updates, with
all 21 method rows unchanged outside the original copy scope.

The two existing sampling gameplay and two passive-skill fixtures now request
the default core system's metadata size rather than 96 mm or an omitted size.
Their gameplay/receipt/skill assertions are retained. The historical programme
copy gate still compares every other contract field/method against its original
commit; it separately recognizes the later core nominal-size/pricing correction
instead of requiring the former arbitrary bore and price.
No ledger/product source, geometry, assets, prices, tool stats, browser or GPU
was changed or used. Renderer/device, complete career and sonic fit acceptance
remain open.
