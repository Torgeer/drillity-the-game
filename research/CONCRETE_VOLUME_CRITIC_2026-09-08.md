# Independent CFA concrete quantity review — 2026-09-08

Approved **only the final withdrawal interval repair** in `src/sim/drilling.js` at SHA256 `e11b0e8e4d3fed653d0879284dd19ef38effeeaccc6b38ae6ce202bbf5579790`. The narrow diff introduces `concreteLiftM` from the previous pass position and sends that bounded distance to the existing concrete integrator. It changes no price, pump constant, clock, parked-pump policy, jet pass or pull-force pass.

The independently written gate uses actual `createDrillSim`, progression acceptance, public controls and `update(1/120)`. It reads `debug.state` without mutation only to inspect quantities before display rounding. Contract depths and diameter multipliers are synthetic boundary fixtures, not claims about equipment capacity. No browser or GPU was used.

## Reproduction and result

Run from `drillity-next-concrete-cost`:

```text
node tools/checkconcrete-volume-critic.mjs --out evidence/concrete-volume/critic-baseline.json
node tools/checkconcrete-volume-critic.mjs --out evidence/concrete-volume/critic-after.json
```

The first command ran before the author changed production: **8/12 groups passed**, with four real CFA/cased-CFA final-interval geometry failures. That red artifact is preserved. After the repair, the gate was expanded with four final-slice/input-abort groups; **16/16 groups passed**, exit 0. All four source hashes remained stable during each run. The baseline and after counts differ because the additional groups were added after baseline capture; they are not represented as pre-repair failures.

For a synthetic CFA pile of diameter 600 mm and length 3.137 m, the actual return stopped at 3.137 m but originally logged theoretical volume 0.8890864289291774 m³. The independent cylinder calculation is 0.8869658538880063 m³. The repaired result agrees within 1e-10 m³. The same defect was independently reproduced at nominal and 0.8× nominal diameter for both CFA methods.

The final tick test independently retains the previous actual pass position, then checks geometry increment against remaining length × area and pump increment against the existing distance-sampled supply model over that remaining interval. Its CFA final delivery increment is 0.004212461102191534 m³ versus expected 0.004212461102191514 m³. This proves conservation within the existing model, not a sourced withdrawal speed.

The other groups check equal geometry with distinct pump delivery, real completion receipt and duplicate-event protection, paused partial logs, finite zero/negative/NaN/infinite/malformed public controls, abort without a finished pile or delayed charge, and no new volume after completion. Across all methods, 378 material-cost input combinations and 28 partial/extra-telemetry settlement cases match the frozen economy implementation exactly. General NaN metre inputs retain baseline behavior; that comparison does not certify input sanitization.

## Financial and physical boundaries remain open

`materialsCostForRun` uses authored bundled prices: CFA 92 per contract metre for concrete plus reinforcement cage; cased CFA 122 for concrete, cage and casing, before existing diameter, region and skill factors. `settleRun` does not consume actual concrete volume. No standalone ready-mix price or explicit cage/casing allocation exists in this path. Dividing a whole bundled price by cylinder volume, subtracting the two method rates, assigning a cage fraction, or treating a shop tool price as ready-mix would invent a price basis. This repair adds none of those.

At equal geometry, one synthetic CFA pair records 2.0937483746054197 versus 4.1682906944429305 m³, yet both material charges remain 197 under the existing bundle. The cased-CFA pair similarly records 2.6678471571333797 versus 5.312002634865558 m³ with charges of 262 each. This is an explicitly open actual-consumption accounting gap, not an approved economic consequence. Default cased-CFA pipe wear is also separately costed while the bundle mentions casing; absent an explicit distinction between reusable tooling and installed casing, this is not proof of double charging and must not be used to infer a concrete share.

The parked observation remains unchanged: after controls damp to almost zero withdrawal, five seconds add no pile length or logged volume while public supply reads 46 m³/h. The current counter is sampled through lifted distance. Whether that public channel means commanded pump capability or actual ongoing delivered flow is unresolved here. This audit does not invent motion-independent pumping, stop-time delivery, or a charge for it. The existing reported `placedM3` must not be promoted to a measured field invoice without resolving that semantic boundary.

Current withdrawal-speed caps, tip-pressure magnitude and overbreak-by-soil are still explicitly NOT SOURCED by the programme. The endpoint repair supplies no new physical authority, no material-quality acceptance and no phone/rendering approval.

## Frozen inventory and reproducibility

- Critic tool: `tools/checkconcrete-volume-critic.mjs`, SHA256 `5d8babac1ddd2427a36b8d4faf66adc4253d6bb70aa6d1dd355b707c4cf138b3`.
- Red evidence: `evidence/concrete-volume/critic-baseline.json`.
- Green evidence: `evidence/concrete-volume/critic-after.json`.
- This independent report: `research/CONCRETE_VOLUME_CRITIC_2026-09-08.md`.
- Economy source stayed `ef98a6b8e7569f8542b541f9d8baad8e8c0f01193b088d2ef7ff3e433f7bcac6`.
- Progression source stayed `8b4b1312342fadd820e1cf6ee7ce2a4a939aa716656005623374091bb7daae9f`.
- Data source stayed `bb207515d7c43b643a011f055848a95a7e9d3b3e262a5f2fc0729668fae24c2f`.

The critic tool compares against the read-only sibling snapshot `../drillity-coordination/resume-70-baseline-2026-09-08`; that audit fixture is required to reproduce its economy-preservation group. It is not a self-contained portable CI gate. The author's separate actual-module gate has its own scope and evidence. This critic made no production edit, MAIN edit, commit or push.
