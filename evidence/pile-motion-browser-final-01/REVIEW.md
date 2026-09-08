# Pile browser attempt — rejected, 2026-09-08

One root-authorized attempt ran unchanged from checkpoint `a47de8a6ba199eabb108da447cd660f01c1735e7`, 12:40:56–12:42:49 UTC. Result: **CAPTURE_FAILED**. No rerun, production edit, harness edit, or geometry change followed. No clearance or FPS approval.

Reproducer, from `C:/Users/henri/Downloads/threads/drillity-fps-investigation`, after an explicit root graphics grant and the `pile-motion-browser` lease:

```powershell
node tools/checkpilemotion-browser.mjs --out evidence/pile-motion-browser-final-01
```

That output now exists and must not be overwritten. Any future attempt requires a new output directory. The tool uses headed Chrome on owned port 5250, fresh contexts, 390×844 CSS pixels at DPR 2, canonical seeded contracts and actual simulation phases. The funding and operator inputs are disclosed QA inputs. Tool SHA256: `faeb1012be4d913762cdcb37b2422468c7fa57cef2c25da8296c294708203440`.

## Preserved evidence

`report.json` SHA256: `00bc674b6e20c817507c55706e6935da0a5b81cbf33a97fe86a9c6b192163bfd`. It contains source/asset hashes, served identity, camera and node matrices, real simulation states, 20 phase captures and visibility masks, action results, 4,079 unheld frame records, and cleanup results. `sourceUnchanged` is true. Browser and server closed; port 5250 was verified free and the lease released to `idle`.

Normal images inspected:

- `C:/Users/henri/Downloads/threads/drillity-fps-investigation/evidence/pile-motion-browser-final-01/orbit-peak.png`
- `C:/Users/henri/Downloads/threads/drillity-fps-investigation/evidence/pile-motion-browser-final-01/orbit-take-set-falling.png`
- `C:/Users/henri/Downloads/threads/drillity-fps-investigation/evidence/pile-motion-browser-final-01/hero-peak.png`
- `C:/Users/henri/Downloads/threads/drillity-fps-investigation/evidence/pile-motion-browser-final-01/hero-bottom.png`

## Findings and limits

- A nearby building obscures most of the rig in the early orbit images. Eight of the nine non-paused orbit captures contain zero diagnostic ram pixels; take-set-falling contains 24. The visibility gate rejected those zero-pixel captures.
- Hero captures contain 188–200 diagnostic ram pixels. Actual rising/peak/falling and take-set captures show changing ram local positions. These are small pixel areas within a tall rig. A visible gap between the upper hammer assembly and leader is apparent in the inspected hero images. This is an observation of the current integrated build. Its cause and whether it predates the adapter are **unisolated**; no baseline render was run.
- Actual UI pause preserved both ram and simulation state in both cases. Dolly and re-drive show the ram at its authored rest position. This bounded observation does not establish mechanical realism or cap/casing clearance.
- Four captures failed strict identity equality: orbit peak/falling and hero pitch-rest/bottom. The recorded differences include simulation time advancing by one to three simulation steps and, in three cases, carriage/ram transforms changing after the selected frame. Hero bottom initially records a cycle near zero with a ram position which changes during the hold. The hold/ordering cause is **unisolated**; these frames must not be promoted to accepted matched-state screenshots.
- Each case also fails on three asset checks. The harness prefixes `public` to Vite-served `/src/ui/assets/logo-full.png` and `/src/ui/assets/logo-wordmark.png`, then compares with nonexistent public inventory keys. This is a harness path-classification defect; preserve its errors and repair it before a future acceptance run.
- The 20 before/after diagnostic comparisons have equal whole-beauty draw-call counts. These compare diagnostic restoration at a held scene and are **not** a before/after adapter draw budget or an FPS result.

## Next bounded verification

Subsequent source work is recorded in `research/PILE_PLACEMENT_HANDOVER_2026-09-08.md` and `research/pile-placement-combined-review.md`: the carriage's old upward/modulo path ignored authored travel offsets. That narrow path is now corrected and CPU-reviewed. The images in THIS folder predate the correction and remain rejected. The currently active `drillity-next-pile-visual` lane must repair the harness and establish valid rendered acceptance; this historical capture does not approve the new placement.

First fix and independently check only the asset URL mapping and held-frame ordering in the capture harness. Preserve this rejected attempt. Then compare the current build with a separate, matched counterfactual that disables only the new ram displacement consumer while retaining the same assets, public telemetry, seed, contract, loadout, camera, viewport and actual simulation progression. Do not compare against a distant whole-tree baseline with unrelated graphics changes. Capture the same actual phase/depth and compare `slide:hammer-ram`, `slide:carriage`, and `slide:drive-cap` world transforms plus normal images. This will isolate whether the observed assembly gap or occlusion depends on the new ram movement before assigning a cause or changing any sourced geometry. Physical dimension checks remain the responsibility of `glbinfo` and committed authoring references.
