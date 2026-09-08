# Core and sonic loadout compatibility

The old independent cheapest-per-bay defaults paired a BQ crown with an NQ
barrel, and used a sonic drive shoe instead of casing pipe. Both default sets
now select the required sample components together. The same pure helper feeds
career readiness and the separate sampling gameplay consumer's start guard.

## Source basis

`C:/Users/henri/Downloads/InHoleTools_Catalog.pdf`, PDF/printed page 23, explicitly
distinguishes the two standard inner-tube lengths (1.5 m and 3 m) and states that
the inner-tube length sets maximum retrievable core per run. The existing NQ and
HQ3 game assemblies select the 1.5 m option. This is an explicit supported
configuration, not an inferred full assembly dimension.

`C:/Users/henri/Downloads/Diamond Driller's Technical Book (1).pdf`, PDF page 35,
printed page 69, supplies the diamond-coring bit rows used in metadata:

| Existing game family | Core diameter mm | Hole diameter mm |
| --- | ---: | ---: |
| BQ / BWL | 36.5 | 60.0 |
| NQ / NWL | 47.6 | 75.7 |
| HQ / HWL | 63.5 | 96.0 |
| HQ3 / HWL3 | 61.1 | 96.0 |
| PQ / PWL | 85.0 | 122.6 |

HQ and HQ3 share a hole gauge but do not share a core diameter. A common `HQ`
thread prefix therefore cannot certify the sample train. No matching HQ3 crown
is currently stocked; this change does not invent one.

The [Boart Longyear Sonic Equipment and Tooling catalogue (2012)](https://diateam.no/wp-content/uploads/2017/03/SonicCatalog-Equipment.pdf),
printed pages 4-6, distinguishes the RH barrel/rod and LH override casing and
shoe. Printed page 37 lists the 3 m metric barrel variant. Its usable internal
sampling capacity is **NOT SOURCED** here: the game uses an explicitly authored
3 m run limit, exposed as `capacityBasis: 'gameplay-run-limit'`. Core instead
exposes `capacityBasis: 'inner-tube-length'`. The consumer must preserve this
distinction. Exact clearance of the existing nominal 100/150 mm sonic items is
also **NOT SOURCED**; the helper checks component role and handedness, without
claiming measured wall clearance or universal interchangeability.

## Player behavior

The cheapest complete stocked core train is the NQ bit and NQ barrel. Sonic
defaults select its core barrel, standard sonic rod and override casing pipe.
No default query purchases, equips or mutates inventory.

Explicit autofit selects a complete compatible set from owned, unlocked stock.
When none is owned, existing manual selections are preserved and missing parts
are suggested. Public readiness rejects a missing, mismatched, unowned or locked
sampling component before accepting a job.

The stock-wide `sampleItemSupport` check also prevents the shop from selling or
recommending parts that have no supported stocked mate: BQ/HQ/PQ crowns, HQ3
barrel and the shoe-only sonic casing selection. The existing unavailable
presentation is reused in Shop and Garage. Existing saved ownership is retained;
these items remain sellable and removable. NQ parts can be bought in stages.

Garage's former thread-prefix verdict could display a green matching string for
HQ/HQ3. Its core and sonic summaries now use the same sample helper. Sonic's
summary describes fitted roles and handedness without claiming a measured fit.

## Earliest playable unlock

| Method | Method and rig unlock | Default tools at unlock | Rig list price | Tool list total |
| --- | ---: | --- | ---: | ---: |
| Core | 18 | NQ bit 18; NQ barrel 18; pump 18; swivel 12 | EUR 285,000 | EUR 14,006 |
| Sonic | 42 | Barrel, rod and casing 42; pump 18 | EUR 465,000 | EUR 16,780 |

The corrected defaults cost EUR 300 more for core and EUR 1,892 more for sonic
than the defective combinations. No item price or operating statistic changes.
These prices are game catalogue balance values, not external market quotes.

`node tools/checksampleloadouts.mjs` exercises actual public XP boundary unlocks,
one-euro-short rig refusal, rig purchase/selection, exact quoted tool purchases,
certification prerequisites and acceptance of an actual generated contract at
levels 18 and 42. The seeded sonic job requires a EUR 640 course; the seeded core
job requires none. XP and funds are boundary fixtures. This proves availability
and correct purchasing; it does not prove an unaided career earns enough money.

## Integration

Isolated worktree: `drillity-sample-loadouts`, git base `1f2d285`. Main's current
source and check dependencies were copied after root released its source edits;
the snapshot includes 40 source paths and records every hash in
`drillity-coordination/sample-loadout-main-dependencies/dependencies.json`.

Production changes are limited to `src/game/data.js`, `equipment-support.js`,
`progression.js`, `src/ui/screens/shop.js` and `garage.js`. Apply the exported
snapshot-based delta, never whole-copy these source files over newer main work.
The separate sample gameplay author owns the simulator start/change-bit checks,
sample actions, telemetry, results and receipt handling.

The default gate now rejects the actual old selectors for piling, core and
sonic, while retaining unchanged-selection assertions for unaffected slots.
The vertical-depth readiness and progression-capacity fixtures purchase and equip actual sample stock
before testing core/sonic depth boundaries; all original purity and capacity
assertions remain.

## Verification status

The final five source files passed the independent 23-group sample/loadout
gate and seven actual Shop/Garage callback and copy groups. These include all
1,260 method/level default choices, unchanged defaults for the other 19 methods,
unchanged item prices/statistics, public staged purchasing, legacy save
preservation, removal, and truthful unavailable component listings.

Focused regression checks also passed: 15 default-loadout adversarial groups;
37 readiness cases (2,499 previews, 115 purity checks, 33 rated rig/method pairs);
15 progression-capacity cases; seven vibro-catalogue cases; two earliest-unlock
purchase routes; the data gate; and the contracts CPU gate (378 boards and
1,890 contracts across 21 methods/eight regions, plus ten negative fixtures).
The data gate retains three pre-existing ground-ceiling warnings.

Exact source hashes and independent commands are recorded in
`evidence/sample-loadout-critic/REVIEW.md`. The separate gameplay candidate's
earlier four runtime guard cases passed before the final shared metadata
refresh; they must be repeated on the final assembled source before claiming
runtime integration approval. This loadout candidate does not own those
simulator changes.

No browser layout, real device, complete unaided career, exact sonic clearance,
or tender-to-tool diameter acceptance is certified here. Generated core tenders
still have a separate pre-existing arbitrary-diameter gap; this helper validates
the fitted component set rather than certifying those tender dimensions.
