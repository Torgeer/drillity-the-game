# Rock-bolt trial-bit eligibility — 2026-09-06

## Reproduction

Historical CRITIQUE §13a still reproduced on the completed progression baseline.
The executable `tools/checkdomain-rockbolt.mjs --measure-only` imports the actual
simulation, game state, bus and item catalogue. It creates a rockbolt programme,
fits each real catalogue bit and the real 39 mm friction-bolt item, and fixed-steps
the normal drilling and installation phases without writing simulation internals.
Fixture: seed 194, targetDepth 0.3 (the simulation's existing minimum creates three
bolt positions), UCS 100 MPa, stability 1, abrasivity/water 0, item condition 1.
Normalized input policy: feed 0.38, rotation 0.8, flush 0.66. These are controlled
test inputs, not sourced field operating instructions.

| Actual first installation | Baseline anchorage01 | Corrected game fit score |
|---|---:|---:|
| Catalogue 33 mm bit | 1.000 | 0, undersize |
| Catalogue 38 mm bit, actual gauge 38.1 mm | 0.042 | 1, supported trial bit |
| Catalogue 39 mm bit, actual gauge 39.1 mm | 0.005 | 0, oversize |

The historical 21% figure was only part of the old calculation: the real programme
also shortened driving time and applied the competent-rock exponent, producing
4.2% in this controlled end-to-end fixture. This is a simulation score, not field
anchorage capacity.

## Primary evidence and interpretation

The manufacturer's [SS-39 installation page](https://www.splitset.com.au/ss-39-stabiliser-installation/),
sections **Bit selection and drilling** and **Interpreting test data**, was opened
and read on 2026-09-06. It gives nominal 35–38 mm trial bits, also prints the
1-1/2 inch upper endpoint, and requires site pull tests to select bit size and
driving time for the particular ground. It warns that wear can eventually make
complete insertion impossible. The catalogue's existing 38.1 mm bit is retained
as the exact 1.5-inch conversion. The conservative lower endpoint remains the
printed metric 35 mm, rather than 34.925 mm from the rounded imperial equivalent.
These are nominal trial-size choices, not manufacturer dimensional tolerances.

The manufacturer's [SS-46 installation page](https://www.splitset.com.au/ss-46-stabiliser-installation/),
same sections, was also opened and read. It specifies a separate 41–45 mm trial
range and calls for site pull testing. Applying the smaller family's range to the
46 mm item would therefore be incorrect. The pages are unpaginated HTML; section
names are the location references in code. The original splitset.com PDF failed
direct fetch with HTTP 502, so the readable manufacturer pages are the authority
used here, rather than a search-result-only quotation.

The sources do not establish a universal strength-versus-diameter curve, a
UCS exponent, or guaranteed capacity for every bit in the nominal trial band.
The removed 33 mm ideal/39.5 mm zero curve cannot be repaired by inventing another
physical capacity curve.

## Scoped implementation

Only candidate `src/sim/drilling.js` rockbolt sections/import and corresponding
`src/game/data.js` rockbolt item fields/descriptions change. Sourced item
`stats.bitTrialRangeMm` is consumed directly through `getItem` at programme start;
there is no second simulation range table. Fitted-family selection is captured
for the programme. Resin spin/gel/hold calculations remain unchanged.

The replacement is explicitly a binary authored game compatibility score.
`anchorageBasis: game-fit-score-not-pull-test` accompanies the existing normalized
score in telemetry and installation records; it is neither kN, probability of
support nor a pull-test result. Effective bit gauge uses the existing wear model.
Modeled hole diameter still includes the existing overbreak estimate, but that
estimate cannot invalidate a nominal trial-bit recommendation. Wear/overbreak,
player-time install beat and representative slot cue are marked NOT SOURCED.
Out-of-band/unknown fits do not manufacture a measured slot reading.
The actual `inspectSlot` action rejects these unmeasured cases with an explanatory
reason, so the existing UI cannot format their null reading as a measured zero.

The existing UI compares `holeMm` with a single `holeIdealMm`. There is no sourced
universal ideal hole diameter here. Both legacy values are deliberately equal,
suppressing that old warning for all fits. The correct trial range, effective
bit gauge and fit category are published separately. Presenting those new fields
in the HUD is an explicit remaining UI task; this work does not edit UI ownership.
The HUD's existing **Anchorage** percentage label still displays the compatibility
score. Renaming it to reflect the explicit game-fit basis is another UI-scope
residual; no physical pull-test capacity is claimed by this implementation.

## Verification and limits

`node tools/checkdomain-rockbolt.mjs --source-root .qa-domain-mechanics/rockbolt`
passes 12 real-programme scenarios, including 14 installed bolts: the three
catalogue gauges, moderate-UCS control, wear, stability control, a full three-bolt
actual-GROUND.granite pattern, 46 mm family, unknown family, captured equipment
selection, and two actual resin sequences. It also checks consumed item metadata
and telemetry semantics. The baseline fails the supported-bit score assertion.

Independent adversarial regression
`node tools/checkdomain-mechanics-adversarial.mjs .qa-domain-mechanics/rockbolt bolt`
passes all five cases. That reviewer caught an intermediate error where modeled
overbreak made later granite holes 38.2 mm and reintroduced the penalty. The final
candidate instead scores effective bit gauge; all three granite installations
remain eligible. The own regression has actual gauge wear while the independent
one uses its separate control policy, so the evidence covers both paths.

The catalogue currently supplies no 41–45 mm bolting bit for its 46 mm tube.
That loadout limitation is disclosed in the corresponding item description;
no new tool, price or fabricated physical performance was added. The existing
2.4 m simulation installation length remains shared despite the 46 mm item's
3.0 m description; this diameter-only correction does not claim to repair every
bolt-family mechanic. Existing torque sampling and other ground-support tuning
are unchanged and are not validated as a real friction-bolt pull-test procedure.
No renderer, geology, CFA, lifecycle/progression identities or economic rates
were edited. Root merged the reviewed domain changes and reran the unqualified
command against the real worktree: all 12 scenarios pass. All six pile scenarios,
eight independent combined domain cases and 83 prior progression cases pass;
data validation and the career gate also pass. See domain-mechanics-review.md.
