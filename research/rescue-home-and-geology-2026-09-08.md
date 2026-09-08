# Rescue home ordering and live-geology limits

**Correction:** normal Nordic-first careers already return to the Nordic
rescue for zero mobilisation cost from every region. The earlier warning that
being abroad necessarily blocks the return home was not supported by the
code. `travelCost()` multiplies the destination's travel rate; Nordic's rate
is zero. Also, the previous rescue profit-floor tests using a real simulation
without a `geology` service exercise the simulator's fallback ground, not the
geological column used by the running game. Their accounting proof remains
conditional on completed work.

## Accepted scope: preserve the home independently of saved array order

The new candidate chooses Nordic whenever it is among the unlocked regions.
Otherwise it retains the first valid saved region, with the existing Nordic
fallback if none is valid. It changes no travel rate, location authority,
ordinary acceptance rule, ground, method or site. It does not create local
auger jobs at offshore installations or in frozen/rock regions.

The actual loaded-save defect is narrower than the earlier warning. A valid
save with current location Nordic and an unlocked-region array reordered to
put a different region first makes the previous rescue provider choose that
region. At €−2000 all seven such fixtures were refused on a positive travel
quote. There is **no evidence that a current migration produces this order**;
the diagnostic explicitly creates the reordered saved payload and loads it
through production persistence.

| First saved unlocked region | Previous quote from Nordic | New quote |
| --- | ---: | ---: |
| German Construction Site | €951 | €0 to Nordic |
| Iberian Quarry | €1639 | €0 to Nordic |
| Alpine Tunnel Portal | €2220 | €0 to Nordic |
| Saharan Water Field | €5022 | €0 to Nordic |
| North Sea Platform | €7400 | €0 to Nordic |
| Andean Copper Mine | €8722 | €0 to Nordic |
| Arctic Permafrost | €11629 | €0 to Nordic |

All 24 normal-order observations are exactly equal before/after: eight
regions × wallets €−2000/€0/€399, including quoted fee, read-only preview,
acceptance result, final balance and actual location. The seven reordered
saved fixtures now accept the canonical Nordic job for zero mobilisation;
acceptance grants no cash. The existing paid negative controls now request
an explicit foreign canonical posting, since the provider intentionally no
longer turns saved order into a foreign destination.

Run from `drillity-rescue-local-region`:

```
node tools/auditrescuerouting.mjs --source-root=C:/Users/henri/Downloads/threads/drillity-rescue-viability --report=research/rescue-routing-frozen-baseline.json
node tools/auditrescuerouting.mjs --report=research/rescue-routing-nordic-home.json
node tools/checkrescuestart.mjs
node tools/checkrescuestart-adversarial.mjs
node tools/checkrescueviability-adversarial.mjs
node tools/checkrescuehome-adversarial.mjs --baseline=C:/Users/henri/Downloads/threads/drillity-rescue-viability/src/game/progression.js --report=research/rescue-nordic-home-critic-final.json
```

The baseline and candidate JSON reports pin the tested source hashes. Existing
start tests pass 3 + 21 cases, and the profit-floor critic passes 46 cases.
Only its foreign-posting fixture setup changes; the paid-fee and no-support
assertions remain intact. Independent Nordic-home review passes 36/36 cases
against the exact frozen baseline. It also confirms that normal load filters
invalid saved region entries and reconciles a missing Nordic unlock; the
no-Nordic branch is tested as a defensive live-state boundary after init.

## Diagnostic only: the displayed ground differs from the priced call-out

`economy.emergencyContract()` authors three 8 m holes in topsoil/clay/silt.
`world/geology.js:generateProfile()` derives its own column from region,
application, seed and difficulty. Its `CONTRACT_ACCEPT` subscriber never
passes `groundSpec`. `sim/drilling.js:startHole()` uses the geology service
when present; without it, it explicitly passes only `c.ground || c.profile`
to `synthProfile`, again excluding `groundSpec`.

`tools/auditrescuelocalregion.mjs` generates the actual geology using the
same contract input fields, then runs the actual simulation against that
service. It uses adaptive optimal inputs and repeated jam-rescue attempts;
it does not bypass depth, replace the ground or enable god mode. Each hole
has a finite 1000-player-second bound. This is a diagnostic controller, not
an exhaustive human intervention policy or a rendered browser acceptance.

| Region | Existing ordinary auger eligibility | Diagnostic result for the unchanged 8 m call-out |
| --- | --- | --- |
| Nordic | Available | Controller reached 1.94 m, encountering a boulder, still active at the bound |
| German site | Available | Three full holes, approximately 396–398 player seconds each |
| Iberian quarry | Unavailable: no permitted auger site/application | Controller reached 0.94 m in limestone at the bound |
| Alpine | Available for some work | Aborted at 0.26 m after boulder/stuck phases; its column also reaches shale at 2.79 m |
| Sahara | Available for some work | Controller reached 6.80 m in sandstone at the bound; sand ends at 5.94 m |
| North Sea | Unavailable: only offshore sites, no ground beneath a starter land auger | Numeric simulation completed; that does not make the machine/site combination valid |
| Andes | Unavailable: no permitted auger site/application | Aborted at 0.47 m after boulder/stuck phases |
| Arctic | Unavailable: permafrost outside auger's valid ground | Controller reached 1.91 m in permafrost at the bound |

Full measurements: `research/rescue-local-region-baseline.json`. The separate
rerun `research/rescue-local-region-geology-recheck.json` reproduces all eight
records exactly after making the diagnostic's region-only fixture explicit.
Regenerate with `node tools/auditrescuelocalregion.mjs --report=research/rescue-local-region-geology-recheck.json`.
The diagnostic deliberately puts each tested region first and limits that
fixture's unlocked list to that region, in order to probe the existing
canonical factory there. It does not prove the normal board offers all those
geographically invalid call-outs. A stall under this bounded controller does
not prove the job is impossible for every player; explicit method/site/ground
eligibility failures are separate observations.

The next useful investigation is the mismatch between the priced/advertised
call-out column and the column driving both the displayed section and the
physical simulation. A solution needs a common supported profile and actual
live-service completion evidence. This candidate does not override geology,
choose convenient invented soft ground, or claim to solve that mismatch.

## Integration boundary

The earlier local-region routing proposal was withdrawn after inspecting
real travel quotes. `REJECTED-rescue-local-routing-proposal.patch` and its
30-case diagnostic report preserve that exploration only. Do not integrate
them or `checkrescuelocalregion-adversarial.mjs` as the Nordic-home change.

Apply only the separate `rescue-nordic-home-delta.patch` against the frozen
profit-floor candidate. Its baseline lives in
`drillity-coordination/rescue-local-region-dependency.json`. Never copy the
whole progression file: it predates root's later save-v7 integration. The
original profit-floor patch and worktree remain unchanged.
