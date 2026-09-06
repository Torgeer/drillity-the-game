# Fitted bolt programme length — 2026-09-06

## Verified defect and correction

The completed domain-mechanics baseline still assigned every rockbolt programme
the method's hardcoded 2.4 m length. The real-module regression
`node tools/checkdomain-rockbolt-length.mjs --measure-only` reproduced both
friction-bolt items starting with `boltLengthM: 2.4`, `holeTargetM: 2.45` and all
three actual install transitions at a reported 2.46 m into the hole.

The selected 46 mm item describes a 3.0 m tube. The corrected programme captures
the supported item's explicit `stats.boltLengthM` at start. This supplies the hole
target, nominal string limit used by the time estimate, drilling-metres time
allowance, programme telemetry and each installation record. The 39 mm item
continues to use 2.4 m. Neither catalogue names nor consumable `life` fields are
parsed as a physical dimension. The item field is consumed by the actual
simulation, without a duplicate tuning table.

| Actual complete three-bolt pattern | Selected length | Hole target | Install transition readings |
|---|---:|---:|---|
| 39 mm item | 2.4 m | 2.45 m | 2.46, 2.46, 2.46 m |
| 46 mm item | 3.0 m | 3.05 m | 3.05, 3.06, 3.05 m |

Transition readings are actual simulation telemetry rounded to centimetres.
The small excess is the normal fixed-step crossing of the target, not added
physical allowance. Records state the selected nominal bolt length and target;
they are not proof of physical embedment, capacity or adequate support.

## Primary manufacturer provenance

The [SS-39 product page](https://www.splitset.com.au/product/split-setstabilisers-ss-39/),
**Order information**, explicitly lists a 2,400 mm tube: standard CPN 72243462
and galvanized CPN 90321258. The [SS-46 product page](https://www.splitset.com.au/product/split-setstabilisers-ss-46/),
**Order information**, lists a 3,000 mm tube: standard CPN 90321563 and galvanized
CPN 90321787. Both primary manufacturer pages were opened and read directly on
2026-09-06. The source URLs and table locations sit beside the item constants.
Real manufacturer/model identifiers occur only in source comments/research.

The existing 0.05 m overdrill value is retained. The manufacturer's
[SS-46 installation instructions](https://www.splitset.com.au/ss-46-stabiliser-installation/),
**Bit selection and drilling**, specify a hole at least 5 cm beyond the tube.
The [SS-39 instructions](https://www.splitset.com.au/ss-39-stabiliser-installation/)
give the same metric instruction. This is not a newly invented allowance.
The current Australian brochure's summary table labels its largest nominal
diameter 47 mm; that row was deliberately not substituted for the explicit
46 mm product's order table.

## Unknown definitions and consumer contract

Only the two verified split-tube items receive physical-length metadata.
Missing/unknown items, the cable bolt and the resin item have no verified
length field in this scope. They retain the existing bounded game cycle to
preserve prior lifecycle behavior, but now publish:

- `boltLengthM: null` — no verified physical length.
- `modeledBoltLengthM: 2.4` — the retained game default.
- `boltLengthBasis: 'NOT SOURCED: legacy programme default'`.
- `holeTargetM: 2.45` — the target of that explicitly modeled default.

Known item dimensions instead use `boltLengthBasis: 'manufacturer-item'`.
These fields are identical in programme telemetry and installation records.
An active programme keeps its captured length after a loadout edit; the next
programme resolves the newly fitted item. The UI owner was told to show unknown
physical lengths as unknown, never format null as a verified zero or silently
promote the modeled default to a manufacturer dimension.

The 46 mm tube still has no 41–45 mm bolting bit in this catalogue. Its full
simulation cycle therefore proves drilling-length behavior, not valid tool fit
or successful physical support. Existing fit scoring, resin stages, torque-test
rules and installation timing remain unchanged.

## Executable checks and scope

`node tools/checkdomain-rockbolt-length.mjs` passes seven full actual-module
patterns, 21 installations and one fresh start. It uses actual game state,
bus, catalogue and simulation with controlled ground, fixed normalized inputs
and normal fixed-step advancement; it does not teleport or mutate sim internals.
It asserts complete events, target-crossing depths, selected-length records,
time allowance ordering, captured equipment, missing/unknown/cable definitions,
and all resin spin/gel/hold phases and timings. The fixture's UCS, stability,
input values and seed are test controls, not operating recommendations.

The unchanged preceding `tools/checkdomain-rockbolt.mjs` still passes its
12 scenarios. `tools/checkdata.mjs` passes with zero problems and 39 rig-runtime
assertions; the existing auger/site-investigation/cased-CFA ground warnings
remain. Each progression process was also checked independently: 33 acceptance,
28 settlement, 10 persistence adversary and 12 protocol adversary cases pass
(83 total, all four exits zero). Root owns final adversarial follow-up review.

Only rockbolt branches in `src/sim/drilling.js`, two item metadata entries in
`src/game/data.js`, this report and the new length regression are owned here.
No CFA, pile, lifecycle identities, pricing, renderer, UI, geology, prior tests
or prior reports were edited. `domain-mechanics.patch` remains unchanged with
SHA256 `54a2533ac0beec7731fe605f33b73083434075b5f4c665903592e424a41ad1d9`.
Root exports a separate follow-up patch against the frozen completed baseline.
