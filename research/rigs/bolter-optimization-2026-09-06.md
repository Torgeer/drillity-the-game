# Bolter mesh optimization — 2026-09-06

Scope: `blender/bolter.py`, dedicated export/profile and CPU render tools.
Complete ASTRA/current checkpoint, optimization checkpoint and bolter source
research were read before editing. The unchanged source was freshly exported
before any changes and reproduced the previous checkpoint. Dimensions use only
the existing `tools/glbinfo.mjs` actual-vertex ruler.

## Measured exports

| Metric | Before | Final | Change |
| --- | ---: | ---: | ---: |
| Exported primitives | 47 | 47 | 0 |
| Triangles | 39,708 | 36,956 | −2,752 (−6.93%) |
| Bytes | 2,450,896 | 2,323,080 | −127,816 (−5.22%) |
| Nodes | 93 | 93 | 0 |
| Contract nodes | 45 | 45 | 0 |
| W × H × L, working pose | 2.115 × 4.690 × 11.820 m | identical | exact bounds |

These are exported primitive counts, **not rendered draw calls**. All six raw
overall-bound coordinates and every protected contract-subtree bound are
identical, without rounding. This is a working-pose envelope including the
trailing cable, not the source's transport length.

## Measured component changes

The pre-join profile contains 666 parts before and after. Exactly 36 change:

- Eleven hydraulic hoses: four boom runs, two boom loops, four carrier service
  runs and the water line. Only `bevel_resolution` changes from 2 to 1: actual
  eight-vertex radial sections become six-vertex sections. Bezier control
  points, AUTO handles, longitudinal sampling, radius and parents are unchanged.
  These save 1,152 triangles.
- Twenty-five thin plates/rails/treads retain their bevel widths with one
  segment instead of two: three toe boards, three stair treads, three feed
  rail/face pieces, eleven mounted bolt plates and five stored plates. Each
  evaluates to 108 → 44 triangles, saving 1,600 triangles.

The changes sum exactly to the exported reduction. No parts were removed and
no material assignments changed. Tyres, painted body panels, boom sections,
feed body and domed nuts retain their geometry. All 122 top-level constant
assignments are AST-identical to the session snapshot. Independent normalized
AST comparison also confirmed dimensional expressions and attachment calls
are unchanged after accounting only for the intended helper/segment edits.

## Bounds findings corrected during review

An initial candidate simplified four drifter hoses and the injection line too.
The drifter profile changed a carriage-subtree extremum by 1.248 mm. A stricter
batch assertion then caught a 0.585288557 mm overall forward-bound change,
which the earlier 1 mm comparison accepted. The initial statement that overall
bounds were exact was therefore wrong. The sole ruler isolated that overall
change to `dyn_boltIndex_rubber`, containing `inject_hose`; restoring only the
drifter profile did not fix it. Both profiles are now retained, along with the
trailing cable. Final raw overall and protected-subtree deltas are zero.

Internal rubber material-mesh bounds still change with radial sampling (up to
4.181 mm on `dyn_boomLift_rubber`). Exact overall and contract bounds do not
mean every vertex or every material-mesh bound is unchanged.

## Validation and reproduction

`tools/rigopt_contracts.mjs` checks actual exported node names, ancestry,
local/world transforms, extras, materials and assembly assignments. All 45
contract nodes match exactly. Neither export contains animation clips: the
runtime-driven motion hierarchy is preserved, but runtime animation playback
was not tested. The batch gate additionally requires exact overall bounds,
smaller triangle/byte totals, unchanged primitive count and a byte-identical
private public export. It passes.

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python tools/rigopt_bolter.py -- .rig-optimization/bolter/before.glb .rig-optimization/session-source/bolter.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python tools/rigopt_bolter.py -- .rig-optimization/bolter/after.glb
node tools/glbinfo.mjs --parts .rig-optimization/bolter/before.glb .rig-optimization/bolter/after.glb
node tools/rigopt_contracts.mjs .rig-optimization/bolter/before.glb .rig-optimization/bolter/after.glb
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python tools/rigopt_bolter_render.py -- before
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python tools/rigopt_bolter_render.py -- after
```

The baseline snapshot is private session evidence; use the matching source
revision when reproducing elsewhere. The six fixed-camera whole/feed/deck
images import the actual GLBs, using Cycles CPU, two threads, 24 samples and
seed 0 with identical material stand-ins. Initial paired views retained the
silhouette, hose routing and components, with small highlight changes on thin
plates. The final after images are regenerated after restoring the two hose
families. These views assess geometry, not live procedural game materials.

Final GLB SHA-256:
`82758778d86ec797472ff9e75c605f841df128fc6dfe1deeb1ea9a7f78cdc04f`.
Private `public/models/bolter.glb` matches `.rig-optimization/bolter/after.glb`.
The evidence directory also contains both profiles, their component delta,
glbinfo reports and contract comparison. No GPU lease or browser session was
used; no rendered draw-call reduction, FPS improvement or AAA verdict is claimed.
