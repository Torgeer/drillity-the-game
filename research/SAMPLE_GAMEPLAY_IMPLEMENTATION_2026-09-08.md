# Core and sonic interval delivery candidate

Isolated candidate `drillity-sample-gameplay`, based on the root's assembled
September 8 source snapshot. This builds playable interval handling. It does
**not** close the material recovery, integrity or quality economics milestone.
No main-tree source, browser, GPU, Git index, commit or push was changed here.

## Implemented path

The real `startHole` checks the fitted train before issuing an attempt, then
creates the approved immutable ledger using that attempt's actual identities
and the fitted barrel's capacity. Core now retrieves its inner tube and boxes
and logs the interval. Sonic advances protective casing, extracts the barrel,
and sleeves and labels the interval. These are native action-rail buttons with
the existing action-context protections and timed beat presentation.

Physical advance is clamped before hole-depth accumulation, random hazard
exposure and wear. A filled or final partial barrel stops drilling. The last
interval must be handled before the hole completes and progression can settle
it. A rod connection remains separate: a 1.5 m core retrieval does not extend
the 3 m rod string. The final target does not add an unnecessary rod.

The active Site publishes the actual current interval and next action. Finished
retrieval and handling records produce separate log entries; the observer reads
all unseen records so a new interval opening between UI updates cannot conceal
the previous handling. The transient card displays the last completed operation
even after the next barrel starts. The Results screen validates this exact
completion's progression receipt and provides an expandable ordered interval
log. Older results without such a receipt say the log is unavailable.

`HOLE_COMPLETE.sampleProduct`, `state.drill.sampleProduct` and the authoritative
settlement's `sampleProduct` contain the same identified interval evidence.
Progression restores and validates a detached immutable value before it pays.
Its existing duplicate receipt boundary remains in force. Saved settled records
are validated on load, including a software limit of 1,024 intervals per hole;
malformed new evidence cannot quietly become a successful sample. Existing
careers may omit this optional field. The current mid-hole reload policy stays
unchanged: restart the physical attempt at zero depth with a fresh empty ledger.

Bit changes validate the proposed cutting assembly against the captured physical
sample train before starting a trip. Automatic/default spares retain the same
compatible assembly ID and the existing generic spare condition rule. Sampling
records survive legitimate trips without being delivered by the trip itself.

## Sources and explicit limits

- The core barrel is the existing compatible NQ assembly configured for the
  **1.5 m** inner tube used by its existing preview. Primary local
  `C:/Users/henri/Downloads/InHoleTools_Catalog.pdf`, PDF page 23, was read
  directly with `pypdf`. It identifies 1.5 m and 3 m standard inner tubes and
  explains that their length limits the run before retrieval. The tube is not
  inferred from rod length. The catalogue/loadout agent owns the metadata,
  complete train matching and its independent source report.
- Sonic consumes the catalogue/loadout helper's 3 m configured barrel. The
  dependency agent verified that length option in its primary source; exact
  generic 100/150 component wall clearances and universal interchangeability
  remain **NOT SOURCED**. This candidate does not claim those measurements.
- Final metadata distinguishes the core `inner-tube-length` basis from sonic's
  `gameplay-run-limit`. Sonic's 3 m is an authored sampling stop interval;
  **usable inner capacity is NOT SOURCED**. Programme telemetry and its summary,
  live state, completion and persisted settlement retain that basis. New payment
  requires the correct recorded basis, while older finished receipts missing it
  remain unrecorded. Site and Results say **Sampling run limit / game setting**
  for sonic and **Inner tube capacity** for core. They do not infer a measured
  inner capacity from a nominal tool length.
- The action durations are explicit **NOT SOURCED game pacing**: core/sonic
  retrieval 4 player seconds, container handling 2, sonic casing 3. They are
  added to par and use the existing beat clock. They are not field winch,
  casing penetration or laboratory procedure rates. No new independent UI
  animation timer or Blender clip was authored.
- Drilled, retrieved and handled metres mean **bore interval coverage**. They
  do not measure the material that came out. Recovery remains **Unmeasured**.
  There is no TCR, SCR, RQD, sample-mass estimate, induced fracture calculation,
  intactness guarantee or undisturbed quality guarantee.
- Generic grade and payout calculations remain unchanged after truthful
  delivery gating. No fractional recovery revenue, quality weighting or new
  process-quality index was introduced. The old product promises in contract
  prose remain a separate open quality milestone, not evidence it is finished.
- Unaccepted QA previews have no authenticated paid sample ledger. Paid
  progression will reject a sample completion with no valid handled receipt.
  Browser/mobile presentation and new physical extraction animations are not
  certified by this CPU candidate.

## Validation

Run from the isolated candidate:

```powershell
node tools/checksampleledger.mjs
node tools/checksampleledger-adversarial.mjs
node tools/checksamplegameplay.mjs
node tools/checksamplegameplay-adversarial.mjs
node tools/checksampleloadouts-adversarial.mjs --start-only
npm run check:methodsettlement
node tools/checkpauselifecycle.mjs
node tools/checkactionoutcomes.mjs
```

The author gameplay gate currently passes 12 groups: exact and partial barrels
for both methods, persisted completed evidence, fresh-attempt restart, truthful
Site helpers, and genuine unmodified generated tenders. The generated core
68.2 m hole delivered 46 intervals; the generated sonic 12.7 m hole delivered
5 intervals (the first hole of an eight-hole campaign). These runs use the real
public update, inputs and actions, without teleporting, injected completion or
physics tuning edits. The fixture's stored contract is checked unchanged.

Focused non-regression passed CPT/pile settlement (7 author and 16 independent
groups), existing pause lifecycle (9), and action outcomes (13). The expected
standalone CPU Site-settlement warning is visible; a rendered shell was not
mounted in those gameplay fixtures. The independent consumer critic's final
**20/20 groups passed with stable production hashes**, including actual Site
callbacks and Results receipt consumption, malformed-primary/valid-backup save
recovery, tiny final-slice wear, compatible trip preservation and incompatible
replacement refusal, final capacity-basis propagation, invalid-basis payment
rejection and older-receipt unknown-basis preservation. Its generated runs separately covered core 205.8 m with
138 intervals and sonic 33 m with 11 intervals. Full assembled CPU and browser
checks belong to root integration.

The final independent equipment runtime guard check also passed **4/4** on
the same final catalogue/helper dependency. Its scope is startup and bit-change
refusal, including legacy saved stock; it does not certify physical tender size.

**Separate release blocker found by that critic:** an unmodified generated
core tender requesting a 106 mm hole accepts the internally compatible 75.7 mm
NQ train. The equipment helper deliberately validates the assembly but does not
yet validate tender diameter. Workflow acceptance is not physical contract-size
acceptance; root and the catalogue author were notified. This candidate must not
be presented as solving all sample contract compatibility or recovery quality.

## Integration

`drillity-coordination/sample-gameplay-delta.patch` is a narrow four-file patch
against `drillity-coordination/sample-gameplay-baseline`, not against the old
Git commit. It includes only sim, Site, Results and progression consumer edits.
Root must merge those hunks with later main changes. Add the new approved
`src/sim/sample-ledger.js`, the new `src/sim/sample-product.js` and focused test
tools explicitly. The sample-loadout candidate's catalogue/helper/readiness
delta is a required separate dependency; do not overwrite its progression
readiness edits with this candidate's whole progression file. The manifest
alongside the patch records original dependency and final source hashes.

The final root-ready export is instead
`drillity-coordination/sample-gameplay-main-delta.patch` with its `.json`
manifest. It merges this four-file consumer delta onto the current main source
after root integrated the final sample catalogue. Sim, Site and Results merged
cleanly; the progression import conflict was resolved by retaining both the
existing equipment helpers and new sample-product helpers. Temporary merged
sources are in `sample-gameplay-main-merge`; root source was read only. Use the
manifest's pinned main hashes before applying, and its explicit new-file list.

Wire the new checks into appropriate gates and include both new sampling modules
in any isolated copied-source fixture. Do not declare recovery quality or the
whole game complete based on this first factual delivery interaction.
