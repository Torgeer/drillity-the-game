# Owned-rig contract capacity preflight — 2026-09-06

Contract acceptance now filters owned compatible rigs using the public method-specific depth rating before changing selection, charging mobilisation, opening a run, scheduling a save or emitting events. The selected rig remains preferred when it qualifies; otherwise another capable owned rig is selected. A rig visible in the fleet or selected through a malformed save does not bypass ownership.

For example, a 15.2 m CFA card is within the foundation carrier's declared CFA rating but beyond the dedicated CFA machine's 15 m rating. Owning only the dedicated machine now refuses that job unchanged; owning both selects the foundation carrier. At exactly 15 m, the selected dedicated machine remains selected. Explicitly unknown auger, rotary-Kelly and cased-CFA conversions cannot borrow that machine's CFA base rating.

The preflight reuses `DEPTH_IS_VERTICAL` and `rigDepthCapacity()` from the production data module. It does not duplicate a method list or physical ratings. HDD bore length, jumbo chainage, bolting drive metres and longhole ring totals retain their existing contract semantics and are not compared to vertical depth ratings.

## Validation

`node tools/checkprogression-capacity.mjs` executes the actual progression, data, economy and bus modules with in-memory storage and contracts produced by the real generator. Boundary probes alter only the generated card's target depth; they are test inputs, not declarations of physical machine capabilities.

- Before the production change: **6 tests passed, 9 failed**. Failures reproduced acceptance of insufficient/unknown capacity, selection of an insufficient current machine, and the same defects with unowned or mixed-capacity candidates.
- After the change: **15 tests passed, 0 failed**. The fleet-wide grouped test covers **33 rated vertical rig/method pairs**, accepting each exact limit and refusing its limit plus 0.01 m.
- Refusal assertions compare the complete live state, serialized save and stored contents, require zero emitted events, and verify that the next autosave tick makes no storage write.
- Four tests deliberately exceed the unrelated vertical rating for the four nonvertical methods. This catches an erroneous universal comparison; it does not certify feasibility of those bore or chainage lengths.
- `npm run check:progression`: **83 existing tests passed** (33 acceptance, 28 settlement, 10 adversarial persistence/accounting, 12 protocol). No shared regression file changed.

## Scope and remaining limits

This is a depth-eligibility guard, not complete configuration validation. It inherits the legacy base-stat behavior for fleet entries that do not yet declare method-specific ratings. Source and configuration evidence for the foundation ratings remains in [method-capacity-verification-2026-09-06.md](rigs/method-capacity-verification-2026-09-06.md).

Fitted conversion attachments, bore diameter, individual longhole/bolt lengths, and route-specific HDD feasibility still require their own domain checks. In particular, accepting the declared cased-CFA depth does not establish that the chosen bore diameter or rendered conversion matches the sourced equipment configuration. No source authority, physical rating, attachment or simulation constant was modified in this patch.

Owned paths: `src/game/progression.js` imports and `acceptContract()` preflight; new `tools/checkprogression-capacity.mjs`; this report. The concurrent settlement-navigation work owns separate sections of progression. Root integration should stage the combined file only after both changes are reviewed and add the dedicated capacity gate to the progression package command.
