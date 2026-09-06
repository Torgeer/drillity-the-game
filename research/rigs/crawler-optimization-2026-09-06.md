# Crawler TH mesh optimization — 2026-09-06

Scope: `blender/crawler_th.py` plus dedicated CPU evidence tools. No sourced
dimension, material assignment, attachment node, animation declaration, shared
library or runtime code changes. The complete `ASTRA.md`, its current checkpoint,
the optimization checkpoint, `crawler-th.md` and the crawler section of
`_model-critique.md` were read before implementation.

## Fresh exports

The unchanged source was rebuilt with Blender 5.2.1 LTS, two CPU threads, before
editing. It reproduced the checkpoint exactly. Both figures below describe
actual exported GLBs measured through the existing `tools/glbinfo.mjs` parser
and actual-vertex ruler. **Primitives are not rendered draw-call measurements.**

| Measurement | Before | After | Change |
| --- | ---: | ---: | ---: |
| Primitives | 55 | 55 | 0 |
| Triangles | 41,028 | 37,268 | −3,760 (−9.16%) |
| Bytes | 2,468,072 | 2,300,500 | −167,572 (−6.79%) |
| Nodes | 86 | 86 | 0 |
| W × H × L, working pose, m | 2.603 × 6.061 × 9.260 | 2.603 × 6.061 × 9.260 | Exact overall bounds |

The overall working-pose bound is not a sourced machine width. The existing
`WIDTH = 2.45` and all dimension provenance comments remain unchanged.

## Changes selected from the profile

The original prototype profile measured a two-segment bevelled box at 108
triangles, a one-segment box at 44, and an unbevelled box at 12. This corrected
the helper's stale comment claiming approximately 470/150 triangles. Track
shoes, sprocket teeth and louvre prototypes already used one segment, so those
meshes retain their existing chamfers. Large painted panels retain two segments.

- The 26 narrow hydraulic hoses in the boom, drifter, festoon and carrier
  families use one radial bevel subdivision: the actual converted sections go
  from eight to six vertices. Their radii, Bezier points, AUTO handles,
  longitudinal subdivision and parents are unchanged. They save 1,776 triangles.
  The defining 127 mm suction hose and its ribs retain their original geometry.
- Eight repeated work lamps retain their dimensions and bevel width, with one
  chamfer segment on the stalk, housing and lens: 24 boxes save 1,536 triangles.
  All lamp mounts, aim nodes, light extras and guard bars are unchanged.
- Seven hazard plates retain their dimensions and bevel width, with one chamfer
  segment: 448 triangles saved.

These three independently counted changes sum to the measured export reduction
of 3,760 triangles. No parts were deleted or materials substituted.

## Contract checks and evidence

`tools/rigopt_contracts.mjs` passes for the final before/after exports:

- All 31 contract-node names, local/world transforms, ancestry and extras match.
  Maximum transform delta is zero.
- Material definitions and material membership inside every moving assembly
  match. Both exports have nine material names and zero textures/images.
- Neither baseline nor final export contains animation clips; runtime-driven
  pivot/slide nodes remain unchanged. This is not an animation-quality verdict.
- All 36 top-level constant assignments are AST-identical to the untouched
  session-source snapshot. All three owned Python files parse successfully.
- Overall actual-vertex bounds match exactly. The largest contract-node subtree bound
  change is **0.000029449316146568094 m**, or **0.029449 mm**, at the carriage,
  from changed hose radial tessellation. A deliberately tighter 0.001 mm check
  rejects this difference; the gate's normal 1 mm comparison tolerance passes.

The gate protects pivot/slide/mount/aim subtrees, not every individual material
mesh's bound. A separate comparison using the same `glbinfo.measure` ruler
records the intended hose-profile changes in `subtree-deltas.json`: the largest
material-mesh bound difference is **3.181353 mm** at `static:rubber`, followed
by 2.530481 mm at `boom-lift:rubber` and 2.107296 mm at `carriage:rubber`.
These are changed polygon cross sections on narrow hoses, not altered routing
or sourced radius constants. They must not be described as zero geometry change.

Evidence is in ignored `.rig-optimization/crawler/`: `before.glb`, `after.glb`,
the two `*-glbinfo.txt` reports, `contracts.json`, `*-profile.json`, saved
`*.blend` scenes, and paired `*-hero.png`, `*-tracks.png`, `*-feed.png`,
`*-hoses.png` CPU renders. `public/models/crawler-th.glb` is a private copy of
the verified final export, SHA-256
`7367a9b0e683aec476234c379ef48b6b1c4b50f46fb3a34991def40d1da6cc16`.

The render tool imports the actual GLBs and uses fixed cameras, fixed seed,
Cycles CPU, two threads and 16 samples. Its neutral material stand-ins assess
geometry; they do not reproduce the game's procedural materials. Local and
independent adversarial review inspected all eight PNGs. No new part loss or
routing/silhouette regression was observed. The slight hose-profile and lamp
chamfer-highlight differences were accepted for this bounded optimization;
that is a CPU geometry comparison, not a runtime/GPU performance verdict.

Reproduce in PowerShell from the worktree (the baseline snapshot is private
session evidence; use the matching source revision when reproducing elsewhere):

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python tools/rigopt_crawler_build.py -- --label before --source .rig-optimization/session-source/crawler_th.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python tools/rigopt_crawler_build.py -- --label after
node tools/glbinfo.mjs --parts .rig-optimization/crawler/before.glb
node tools/glbinfo.mjs --parts .rig-optimization/crawler/after.glb
node tools/rigopt_contracts.mjs .rig-optimization/crawler/before.glb .rig-optimization/crawler/after.glb
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python tools/rigopt_crawler_render.py -- --label before
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python tools/rigopt_crawler_render.py -- --label after
```

## Existing defect reproduced, deliberately separate

The checkpoint suspected `weld()` could relocate the feed-lamp lenses. The
instrumented unchanged-source build confirms it: when joining the glass group
in `build_cradle()`, the active `feed-l_lens` is parented to `mount:feed-l`.
`weld()` then assigns `a.parent = tilt` without restoring its world transform.
The maximum changed world-matrix element is **0.6661670207977295**. Its paired
lens was joined into that mesh, so the glass geometry moves with it. The named
mount/aim empties themselves do not move, explaining why attachment-name gates
cannot catch this visual defect.

The profile's `weld_matrix_changes` records the same result before and after
optimization. The coordinator explicitly kept this mesh-only change separate
from lamp repositioning. A follow-up can preserve the joined object's world
matrix when changing parent and render the corrected lamps; this report does
not claim that follow-up has been implemented.

## Limits

No browser or GPU capture was launched and no GPU lease was held by this agent.
This proves smaller geometry and preserved CPU contracts, not FPS improvement,
an actual per-rig draw-call budget, or overall AAA quality. Baseline exports
already batch moving groups by material, so the historical severe rig draw-call
claims are not a justification for further material simplification.

Blender logged read-only user preference/extension-cache and thumbnail-write
warnings outside the worktree. Export, profile and PNG writes inside the
worktree succeeded; no escalation or permission prompt was requested.
