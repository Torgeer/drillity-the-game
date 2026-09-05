# Method-specific foundation capacity — 2026-09-06

The complete fleet now caps CFA contracts at **15.2 m**, cased-CFA at **17 m**, and rotary-Kelly at **48 m**. A carrier's base Kelly capacity no longer supplies its CFA rating. These are ratings for the explicitly described equipment configurations below; they do not certify that the current renderer fits the required conversion attachments.

This is a separate patch after `c52ce36`, which corrected the dedicated CFA rig's base rating. Scope: the two foundation rig capacity declarations, public capacity queries, the fleet-depth consumer, a dedicated CPU gate and this report. No geometry, loader, renderer, simulation or contract-acceptance consumer changed.

## Source evidence and configuration limits

**B1:** BAUER BG 36 H on BS 95, document 905.868.2, December 2020. [Manufacturer brochure hosted by its equipment distributor](https://www.ecanet.com/uploads/files/Resources/BG_36_H_BS_95_Rotary_Drilling_Rig_EN_905_868_2.pdf). Downloaded to `tmp/pdfs/bauer-bg36h-bs95-2020.pdf`; SHA256 `3efbc95609f294d5c7601f5ae47bc0345b31c6ca51040c754a100e7505f6e90f`. Printed/physical pages 17, 18 and 20 were rendered with Poppler and visually read.

| Rig / method | Declared depth | Manufacturer configuration |
| --- | ---: | --- |
| `foundation-bg` / rotary-Kelly | 48 m | B1 p.17, four-part `/4/48` Kelly: A 15.3 m, B 49.8 m; 1.9 m effective tool, minimum mast reach and OEM attachment. |
| `foundation-bg` / CFA | 15.2 m | B1 p.18, basic conversion: 1.5 m mast extension, no Kelly extension, auger cleaner. |
| `foundation-bg` / cased-CFA | 17 m | B1 p.20, KDK/BTM400, 3 m mast extension, 1,000 mm configuration. |

B1 separately rates upgraded CFA at 28.9 m with a 10.5 m Kelly extension, and the 880 mm CCFA configuration at 18.5 m. Neither is substituted for the selected configurations. The brochure's 68 m headline uses a longer Kelly than the modeled bar; the old 78 m data value is unsupported here.

The modeled Kelly identification is source-backed, not inferred from its rest-pose height: `blender/foundation_bg.py` declares `KELLY_A = 15.30`, `KELLY_B = 49.80` and four elements. Its header identifies the 3 m mast/upper-guide arrangement. The matching B1 table provides the depth rating.

**S1:** [Sunward S-series catalogue](https://sunward.eu/wp-content/uploads/2023/08/SUNWARD_DRILLING-RIGS_S-SERIES_EN.pdf), printed p.24 / physical p.25, SWDM240SC. The no-Kelly-extension CFA rating is 15 m. The source was visually verified in the preceding [CFA capacity report](cfa-capacity-verification-2026-09-06.md), which records its hash and measurements.

`cfa-rig` therefore declares CFA 15 m and explicitly **unknown (`null`)** for its advertised cased-CFA, short-auger and rotary-Kelly conversions. No applicable primary rating was established for those configurations; they do not inherit 15 m merely because the same carrier advertises the methods. Their `methods` entries remain unchanged for subsequent eligibility/configuration work.

## API and contract behavior

`rigDepthCapacity(rigOrId, methodId)` returns a positive finite number in metres or `null` when the rig/method is absent or the rating is unknown. It accepts either a rig id or an object, making the same lookup usable for future selected-rig checks.

- If `methodDepthCapacity` exists, it is authoritative. A null value or missing method key returns unknown; neither can fall back to `stats.depthCapacity`.
- Invalid map types and nonpositive/nonfinite/non-numeric values throw. An explicit `undefined` value also fails, so malformed data is not treated as a researched unknown.
- Other fleet entries without a map retain the existing base-stat behavior. That is a compatibility boundary, not a claim that their method-specific capacities have been researched.

`fleetDepthFor(methodId, rigs = RIGS)` takes the largest known rating among rigs advertising the method. If a vertical method has no rated rig, it throws rather than generating unlimited or zero-depth work. Optional subsets bypass the complete-fleet cache. Nonvertical bore-length/chainage methods retain the existing `Infinity` sentinel because those windows are not vertical rig depths.

`depthWindow()` now consumes this method-aware fleet cap. The foundation catalogue's base `stats.depthCapacity` becomes the matching Kelly rating for existing display code. It is retained for compatibility; new eligibility consumers must use the accessor.

The selected configuration records are intentionally modest: the deeper CFA extension package is not assumed, and the CCFA depth does not borrow its narrower-bore rating. These declarations specify what a properly converted rig is rated to do. The current foundation GLB remains a Kelly machine; its CFA/CCFA conversion geometry and attachment selection are still pending work, not verified by this data patch.

## Meaningful regression gate

Run `node tools/checkrigcapacity.mjs`; add this command to the root package check during integration.

Nine grouped checks cover source-rated production entries; complete declaration coverage; explicitly conflicting Kelly/CFA fixture ratings; unknown/missing and malformed declarations; absence-only legacy fallback; unknown whole fleets; subset/cache isolation; actual public depth windows; nonvertical semantics; and real generated contracts. The assertion groups combine related cases; the printed count is groups, not individual assertions.

The deterministic generation sweep covers all eight regions at levels 29, 36 and 60: **4,800 contracts**, including **160 rotary-Kelly, 69 CFA and 111 cased-CFA** jobs. Maximum sampled depths were respectively **46.4, 15.2 and 16.7 m**; all were positive and within their method-specific cap. Separate exact window checks exercise the unsampled upper endpoints.

Adversarial check: imported an in-memory copy of the production module with only `rigDepthCapacity(r, methodId)` replaced by the former shared-stat read. It produced CFA **35 m** and cased-CFA **30 m** windows; the gate's expected **15.2/17** boundary assertions rejected both. No working source was overwritten for the mutation check.

Validation also passed:

- `checkdata`: 0 integrity problems; the same pre-existing ground-strength warnings remain for auger, site-investigation and cased-CFA.
- `checkbeds`: 0 failures over 6,400 generated contracts.
- `checkcareer`: all 10 assertions passed. Its depth diagnostic still independently reads the base statistic and consequently omits the newly binding CFA/CCFA caps; the dedicated new gate checks those correctly. Migrate that diagnostic to the public accessor in a separate tool-owned change.
- `git diff --check`: clean. No model export was needed because geometry is unchanged.

## Next integration points — not changed here

`src/game/progression.js::acceptContract()` checks only method membership, first on the selected rig and then among owned rigs. It can still accept a CFA job deeper than the dedicated rig's rating while the fleet-wide window is valid for another carrier. Before charging mobilisation or changing selection, eligibility must use `rigDepthCapacity(candidate, contract.methodId)`, reject unknown ratings, and compare the target against the selected owned rig. If auto-selecting another rig, use the same rule on the owned candidates and do not charge or mutate the run when none qualifies.

That follow-up must also check the fitted configuration and diameter. In particular, the current cased-CFA method permits up to 1,200 mm while the sourced rating above is for 1,000 mm. A depth-only accessor does not prove a 1,200 mm job is feasible. This patch does not silently shrink method/item diameters or claim the conversion is already fitted.

The earlier dedicated CFA model also retains its measured withdrawal-clearance and live-feed gaps. Changing a capacity declaration cannot repair those physical behaviors; they remain assigned to the appropriate geometry/runtime workstreams.
