# Optimized rig identity correction — saved WIP only

2026-09-06. Narrow correction in the private worktree only. **19/19 CPU checks pass; runtime remains 0/8 and UNASSESSED.** No browser, GPU, server, dependency retry, production integration or new agents.

The final review found that `timeOfDay === 0.34` rejects the actual environment setter's modulo-normalized `0.3400000000000001`. Root additionally identified the setter's early return: an existing exact `0.34` can remain unchanged. The new `assessIdentity` is used directly by the real measurement gate. It accepts either exact requested or normalized representation at the first snapshot, then requires strictly identical time at every snapshot. All original rig, method, simulator method, quality, GLB source, hero camera, depth and parked-state checks remain in that helper; every other measurement gate is unchanged. No epsilon tolerance or threshold relaxation was added.

Four focused cases were added to the existing CPU self-test. They execute the actual `setTimeOfDay` body extracted from the frozen `src/core/env.js`, with only writeBack/solve effects stubbed: normalization from 0.5 passes, early return from raw 0.34 passes, changed time to 0.35 fails, and even a switch between the two accepted floating-point representations across snapshots fails. Together with the existing 15 sample cases, 19 checks pass. Node syntax check passes. These tests exercise the same helper called by `row.identityValid`; they do not certify device, browser setup or performance.

## Preserved evidence and delivery

- Updated private harness: `C:/Users/henri/Downloads/threads/drillity-optimized-rig-runtime/tools/checkoptimizedrigruntime.mjs`
- Separate delta, to apply AFTER the unchanged original five-path candidate: [optimized-rig-identity-fix.patch](optimized-rig-identity-fix.patch)
- Machine-readable hashes: [optimized-rig-identity-fix-hashes.json](optimized-rig-identity-fix-hashes.json)
- Exact prior harness backup: private `.optimized-rig-runtime/checkoptimizedrigruntime.pre-identity-fix.mjs`

| Artifact | SHA-256 |
|---|---|
| Updated harness | `0777a650bddf731b46c47c9f40780501f3b74ba01dc031f4c416cca92b96538d` |
| Identity delta | `dd6e30a404cdf85c7aafa74e2e464e47722daecf4db4d5c3829cf2ce307da621` |
| Prior harness, preserved | `dded0bc81fced7419fd165798b4561592b2879d8043615f7a98bf7b5b5a7ed36` |
| Original full patch, unchanged | `d9174c81a38bf5981e84deb9ba33b1d14ea17737fec68f05671d7ea8ccd3a987` |

All 98 frozen served files were rehashed against the existing manifest and remain unchanged. The freeze manifest, original full patch, prior reports/checkpoint evidence, main source and package were not edited. Historical checkpoint hashes therefore continue to identify the prior candidate; the separate delta and this report identify the later WIP.

## Still open

The final review's viewport/drawing-buffer/effective-DPR, expected section mode and live SITE-state validation gaps remain open. Software-renderer-name rejection is not universal hardware-acceleration proof. The private dependency-access denial remains unresolved and must not be bypassed. An authorized functioning preview, renewed exact lease, completed eight-case runtime capture and independent raw-data/image review remain prerequisites for acceptance. No draw-budget, FPS, appearance or performance-improvement claim is made.

Only this proven identity defect was corrected. Root will review/preserve the later WIP. No owned resources remain running; ready to stop.
