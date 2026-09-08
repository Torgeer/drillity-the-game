# Call-out recovery: completion support

The normal settlement model can charge more than a slow, grade-D call-out
earns. Making its zero-cost acceptance possible in debt did not make that
completion profitable. This candidate implements the coordinator-approved
game balancing rule below; it does not change a real operating-price claim.

## Rule and accounting

A canonical local call-out that delivers all three specified 8 m boreholes
earns at least `ECON.brokeBelow` (€400) in total net cash. This reuses the
existing board recovery threshold. Each hole retains its existing grade,
time, tender, wear, cost, XP and reputation calculation. The final hole pays
only the extra amount needed to reach that minimum. Faster/better jobs
already earning more receive no extra amount.

The final settlement and whole-contract summary carry `recoverySupport`
separately. `revenue` remains the original tender-derived gross;
`net = revenue - costs + recoverySupport`. Wallet events name the support,
and the results ledger has a separate “Recovery support — All boreholes
complete” row. The card description explains the completion condition.

Acceptance does not grant cash or erase debt. Abandoning does not pay support.
Completing one or two genuine holes retains their ordinary per-hole payments;
those earned payments are not a completion bonus. Zero, missing, malformed,
partial and over-depth call-out completion records are rejected without
consuming the attempt. Every earlier hole must have a matching full-depth
receipt in the current run before the final support can be awarded.

## Identity and saved progress

The debt exemption now checks the factory's complete economic/workload shape,
including nested bonuses and ground specification, as well as the existing
current-posting identity. UI normalization may add display fields. Accepted
local call-outs rebuild their work order from the factory and deeply freeze
that private snapshot, so added fields and subsequent edits to the caller's
card cannot change the accepted economics.

The posting level is read from its canonical ID when checking an active job;
earning a level does not invalidate its support. The existing saved contract,
run accounting and per-hole ledger are sufficient: no save version or new
persisted flag is introduced. Load freezes the recognized snapshot again.
Old partial/malformed receipts do not become full delivery on reload.

## Reproduction and limits

Run from `drillity-rescue-viability`:

```
node tools/checkrescueviability.mjs
node tools/checkrescueviability-adversarial.mjs
node tools/checkrescuestart.mjs
node tools/checkrescuestart-adversarial.mjs
node tools/checkprogression-settlement.mjs
node tools/checkprogression-adversarial.mjs
node tools/checkprogression-protocol-adversarial.mjs
node tools/checkresults-identity.mjs
node tools/checkresults-critic.mjs
node tools/checkmethodsettlement.mjs
node tools/checkmethodsettlement-adversarial.mjs
```

Author gate: seven groups, including 432 complete-contract accounting cases:
all eight regions, levels 1/20/60, grades D/C/S, performance ratios 0.4/1/3,
and rig condition 0/1. Every wallet delta reconciles with the unaltered cost
lines and separate support, and equals `max(400, ordinary net)`.

Repeated slow grade-D completions with a fully worn starter rig move €−2500
to €700 after eight jobs. A separate actual fixed-step simulation, using
feed 0.45, rotation 0.5 and flush 0.75, completes all three holes without
depth teleport, god mode or invented completion events: each grades D and
takes 61.4 player seconds against approximately 35.6 seconds par. This is a
deterministic CPU play fixture, not a measured human play session or GPU test.

The historical €−151 raw result is reproduced by the independent critic's
accepted-attempt boundary fixture: gross €942, costs €1093. The existing
real-sim-start fixture on the current dependency snapshot produces €−157
before support because its control state differs. These are distinct
fixtures, not conflicting measurements. Both now finish at +€400 net.

The current call-out still originates in the first unlocked/home region.
This candidate does not waive positive mobilisation fees for a player
stranded elsewhere, and makes no claim that every possible debt/travel state
can reach it. It also does not change `settleRun`'s ordinary P&L or the separate
`simulateCareer` balancing loop; this policy is applied by real progression
only when its accepted full-job receipts establish delivery. Their existing
estimate-only safety-net claims are not proof of this new progression rule.

Existing missing call-out `archetype` and `flushMedium` diagnostics are visible
and unchanged. Results extraction verifies receipt-to-summary behavior;
layout and real phone/touch acceptance still require the root's browser pass.

Independent final review passes 46/46 cases in
`research/rescue-viability-critic-final.json`, whose source hashes match the
exported candidate. It executes the actual results summary reader and ledger
callback: the last hole's supported net is not mislabeled as the whole job's
net. It also verifies the no-mobilisation qualifier in the card promise.
The critic's earlier 34/34 and 45/45 reports are intermediate evidence.

## Integration boundary

The isolated worktree starts from commit `1f2d285`, with then-current main
progression/economy/data/simulation dependencies copied before this work.
`drillity-coordination/rescue-viability-dependency.json` records their exact
baseline text and SHA-256. Apply only the delta against that snapshot, not a
whole isolated source file or its Git diff against HEAD: those also contain
earlier main changes belonging to other tasks. Root owns integration, package
wiring and commits. This agent launches no browser and makes no commit/push.
