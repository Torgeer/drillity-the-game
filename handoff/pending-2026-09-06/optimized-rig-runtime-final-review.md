# Optimized rig runtime — final source review

2026-09-06. Bounded independent CPU/source review of the final five-path handoff patch and private worktree. No production edits, integration, server, browser, GPU, export, dependency retry or permission bypass. ASTRA owner rules and usage reserve remain in force.

## Verdict

**REQUIRES CORRECTION before runtime acceptance.** The final identity/device additions are now reviewed; this closes the prior review gap by identifying a concrete identity-gate defect, not by certifying the harness. Runtime remains **0/8**, actual draw calls and warm FPS UNASSESSED. Preserve the private dependency denial and existing evidence.

### Proven identity blocker

`tools/checkoptimizedrigruntime.mjs:156` requires `s.timeOfDay === 0.34` for all three identity snapshots. Actual frozen `src/core/env.js:3022` implements `setTimeOfDay` as `((t01 % 1) + 1) % 1`, then stores that result in `tod`; the getter returns `tod`. For input 0.34, JavaScript produces **0.3400000000000001**. The intended setup therefore fails its own exact numeric gate after successful normalization. This is a harness defect, not evidence of changing world time or failed rendering.

Required correction: derive the expected value using the actual normalization and retain strict unchanged identity across stages, or use a deliberately narrow numeric comparison for the requested time alongside strict before/after stability. Add a focused case covering actual normalization and a genuinely changed time. Do not alter rendering or performance thresholds. No correction was applied by this reviewer.

### Remaining evidence gaps in final device/state gates

- The harness records DPR, drawing buffer, bands and stage, but `row.valid` never validates actual CSS viewport or buffer against effective quality DPR. Before accepting the advertised 390x844 matrix, assert measured viewport and drawing-buffer dimensions using the actual quality cap; do not assume requested DPR2 means effective DPR2 at low quality.
- `sectionMode` is recorded but not checked against the requested method. Live SITE screen is not recorded/gated. Initial rig/spec/root and repeated rig/method/simMethod/quality/source/hero/depth/parked identities are enforced, but these do not establish those missing conditions. Confirm and gate both before accepting the eight cases.
- The hardware gate rejects missing renderer strings and named SwiftShader/llvmpipe/software/Microsoft Basic Render fallbacks. This is useful negative evidence, not universal proof of hardware acceleration. Review captured browser GPU/system information and actual renderer evidence; desktop viewport emulation remains distinct from physical-phone performance.

These are source-review findings. No observed browser failure or device behavior is claimed.

## Verification performed

The final harness matches the explicitly requested hash. Ran only its existing `--self-test`: **15/15 CPU sample-gate cases pass**. Those cases exercise `assessWindow`; they do **not** test final identity, device, contract matching, draw attribution or browser setup. No broad suite or additional test workload was started.

The two tools and three research files match the recorded source hashes, and the delivered patch matches the checkpoint patch hash. Tools are new files only; no production patch was integrated. Existing finite waits, clean timing before instrumented attribution, source/model hashing, frozen-after check and incomplete-case failure remain useful safeguards, but cannot substitute for execution and inspection.

## Required continuation

First correct and review the identity issue and missing measurement-state assertions. Retain a newly hashed patch. The root/Claude must provide an authorized functioning private preview environment without retrying or bypassing the recorded dependency denial, renew the exact `optimized-rig-runtime` lease, and run the finite eight cases on the frozen current assets. Do not use root5198/user5178 as a workaround. Review raw frame/program/device/source data, actual attribution versus scratch agreement, and all eight screenshots before accepting budgets or appearance. Failures remain failures; do not infer FPS improvement or universal rig-budget compliance from this parked-state matrix.

## Exact SHA-256 inventory

| Path | SHA-256 |
|---|---|
| `handoff/pending-2026-09-06/rig-runtime-optimized-rig-runtime.patch` | `d9174c81a38bf5981e84deb9ba33b1d14ea17737fec68f05671d7ea8ccd3a987` |
| `tools/checkoptimizedrigruntime.mjs` | `dded0bc81fced7419fd165798b4561592b2879d8043615f7a98bf7b5b5a7ed36` |
| `tools/serveoptimizedrigruntime.mjs` | `f69661be0352d37bbfbd415aac1ede7366e4cbce770ae31bba052528c051bc9d` |
| `research/OPTIMIZED_RIG_RUNTIME.md` | `001989286f43be25386b78aaefb981b6b52388f6e498880db3da5196edf5feb1` |
| `research/OPTIMIZED_RIG_RUNTIME_REVIEW.md` | `c8844849c684ecef67c82fdf5c49ddc2a7191f67792e7a1d5dd28ec617e00e7e` |
| `research/OPTIMIZED_RIG_RUNTIME_CRITIC.md` | `6e13512ec935b3112eede3199a0ba3082fa95429ab5e8cf69fab5f056283c31f` |

Private worktree: `C:/Users/henri/Downloads/threads/drillity-optimized-rig-runtime`. Delivered patch: `C:/Users/henri/Downloads/drillity-the-game/handoff/pending-2026-09-06/rig-runtime-optimized-rig-runtime.patch`. This review owns no open sessions or running resources; ready to stop within the reserve.

