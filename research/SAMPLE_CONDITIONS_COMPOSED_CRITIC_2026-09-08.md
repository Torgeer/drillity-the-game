# Sampling operating records — composed review

**Approved within the CPU logic scope: 17/17 groups pass, exit 0.** All eleven
inspected production hashes remained stable during the final run. The gate ran
successfully from the repository and by absolute path from its parent directory.
No production code, dependencies, browser, GPU, Blender or service was changed
by this critic. The owned test is frozen for root's integration suite.

## Reproduce

From the repository:

```powershell
node tools/checksampleconditions-adversarial.mjs
exit $LASTEXITCODE
```

The final run also used this command from `C:/Users/henri/Downloads/threads`:

```powershell
node C:/Users/henri/Downloads/threads/drillity-fps-investigation/tools/checksampleconditions-adversarial.mjs
exit $LASTEXITCODE
```

Final tool SHA-256:
`26e7bf8e7a1b8dd12884a53f22bc1d6ac1ea89a547cbd5d839e1978389d59c9f`.
Final raw report: `sample-conditions-composed-adversarial-2026-09-08.json`, SHA-256
`12ffcab7d9d8195d6d2a35b11bc582d8df6b68df3372624e600f87f589ab4d34`.
That report includes exact before/after hashes for simulation, progression,
equipment, data, economy, ledger, product, Site, Results, geology and the shared
contract module; individual group results; independent exposure measurements;
historical blob hashes; and successful temporary-directory cleanup.

## What changed in the critic

The first composed run passed 7/15 groups. Every real simulation fixture failed
at acceptance because its generic core diameter was 96 mm. This is the intended
behavior of the newly composed tender guard. The failure is preserved in
`sample-conditions-composed-adversarial-failed-01-2026-09-08.json`, SHA-256
`1a7db2483a99e5a04b61ce8da5c6c9c9daee143f303d454911cf628645a1bac0`.

Valid core fixtures now explicitly request the catalogue-sourced 75.7 mm nominal
NWL bore, and assert that the real default core crown metadata agrees. This
does not assert a measured crown outside diameter or manufacturing clearance.
A new negative group preserves the old 96 mm case: preview, acceptance and a
direct simulator start all refuse it before changing state or issuing an
attempt. No production guard was weakened and no generated tender was rewritten
to obtain a pass.

The historical economic oracle no longer imports a sibling worktree. It loads
the seven-module simulator dependency closure from exact Git blobs at committed
revision `859fde2023e531d44e5ff334355e4d24e4c4d92c`, verifies their pinned SHA-256
hashes, materializes a fresh temporary ESM tree and removes that exact temporary
directory after execution. The seven sources were independently compared with
the former snapshot and were identical after CRLF normalization. This changes
where the historical implementation comes from, not which implementation runs.

A normal clone needs its installed test dependencies, Git, and that commit in
local history; no `drillity-coordination` folder or snapshot manifest is required.
A shallow clone without that commit fails the historical group instead of
silently substituting current code or skipping the comparison. The negative
control explicitly requires historical receipts to lack `operatingConditions`.
Identical public controls still produce the same grades, costs, revenue, net,
experience, wear and career/player state, excluding only new product evidence
and independently allocated run/attempt identifiers.

## Combined behavior reviewed

The existing fifteen operating-record groups remain intact, including the
independent pre/post-state cutting oracle, malformed histories, floating-point
restore boundaries, immutability, pause/trips/rods/handling, final partial
intervals, genuine settlement/save/backup/replay, and actual Site/Results logic.
They pass against the composed sources rather than the isolated candidate.

The second new group mutates the original caller's accepted core offer before
starting: it changes target depth, method, hole diameter, seed, ground and payout.
The simulation still uses the private accepted core contract. Its actual depth,
ground, sample programme, per-interval operating evidence, grade and payment
match the unmutated control. Accepted ground records are frozen and the live
simulator's contract is the canonical accepted object. This independently
checks the interaction between the new sampling producer and the private
contract start path, including a caller copy that tries to change to sonic.

The same group executes the actual `captureSoilWorkOrder` function from the
composed geology source and verifies that an accepted core contract does not
enter its auger-only soil-column path. No rendering is initialized. Source
review confirms that the CFA partial concrete-lift clamp stays in the concrete
return branch; sampling still receives actual accepted bore advance and the
fixed player-time step through its separate programme branch. The original
pre-step heat and post-input flushing/returns/torque oracle still matches every
recorded sampling step, which would expose a misplaced call or wrong time input.

No additional production defect was found in this composed review. The initial
failure was an obsolete test fixture exposed by a correct, stricter guard.

## Limits

This approves operating-condition provenance and the specified composition
paths. Material recovery, TCR/SCR/RQD, fragment integrity and physical sample
damage remain unmeasured, with quality weight zero. No new quality or payment
policy was introduced. The current core default's nominal tender-size mismatch
is addressed by the separately composed fit guard and the explicit positive and
negative checks here; this supersedes the older isolated critic's statement that
this particular mismatch remained open. Sonic's 3 m interval remains a gameplay
run limit, not sourced usable capacity or casing clearance.

The Site/Results collector checks logic and truthful copy, not visual layout.
The geology method-boundary check does not certify its rendered section. Root's
full assembled suite and browser/device acceptance remain separate gates.
