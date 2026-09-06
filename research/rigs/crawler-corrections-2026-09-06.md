# Crawler feed-lens correction — 2026-09-06

This is a separate correctness change after the frozen mesh optimization.
Only `weld()` in `blender/crawler_th.py` changes. All other Python declarations,
including dimensions, tessellation, materials, lamp wattage, light extras and
motion metadata, are AST-identical to the frozen source.

## Defect and fix

`build_cradle()` joins both feed-lamp lenses into `feed-cradle:glass`. The active
left lens is initially parented to `mount:feed-l`; Blender's join preserves
the two lenses' authored world placement. `weld()` then changed the joined
mesh's parent to `pivot:feed-tilt` while retaining the old local transform,
displacing both lenses away from their housings.

The fix snapshots the joined object's world matrix, changes its parent, then
restores that world matrix. This happens **only when the parent changes**;
already-correct assemblies avoid an unnecessary matrix conversion. No mesh
vertices, materials or lamp specifications are edited.

## CPU proof using actual exports

`tools/rigfix_crawler_lenses.py` captures every authored lens vertex in world
space immediately before the join. It compares that expected set against both
the joined mesh and the actual GLB reimported through Blender. Bidirectional
nearest-vertex comparison accommodates normal-split duplicate vertices in glTF
and rejects missing or extra spatial positions. The comparison tolerance is
0.01 mm, a numerical QA tolerance, not a machine dimension.

| Observation | Frozen-source rebuild | Corrected source |
| --- | ---: | ---: |
| Authored / joined spatial vertices | 48 / 48 | 48 / 48 |
| Exported vertices, including normal splits | 192 | 192 |
| Maximum authored ↔ joined vertex discrepancy | 0.762626953 m | 0.000002432 m |
| Maximum authored ↔ actual-GLB vertex discrepancy | 0.762627021 m | 0.000002399 m |
| Expected result | Displacement reproduced | Authored positions preserved |

Both runs assert that the source SHA and all four shared-library source SHAs
remain unchanged from before import/build until after GLB verification. Their
authored lens snapshots and shared-library hashes also match each other exactly.

`tools/glbinfo.mjs` remains the sole dimension ruler. Its actual-vertex results
show 55 primitives, 37,268 triangles and 86 nodes before and after. Bytes change
from 2,300,500 to 2,300,536 because the corrected transform occupies more JSON.
All 31 named contract-node transforms, ancestry, extras and material definitions
remain identical. Neither export contains animation clips.

The **lens mesh intentionally moves** by approximately
`(-0.367505700, +0.666167139, +0.052547039)` m in glTF world X/Y/Z. The lens
group's bounds before/after, measured by `glbinfo.measure`, are:

| Axis | Before min … max, m | After min … max, m |
| --- | --- | --- |
| X | −0.214286984 … +0.724026491 | −0.581792684 … +0.356520791 |
| Y | +1.575145150 … +1.710374762 | +2.241312289 … +2.376541901 |
| Z | +5.422685688 … +5.564163079 | +5.475232728 … +5.616710118 |

Overall machine bounds and all protected contract-node subtree bounds remain
exactly unchanged: the corrected lenses remain inside those larger envelopes.
That does **not** mean the lens geometry's world placement is unchanged.

## Artifact identity

All new outputs are under `.rig-corrections/crawler/`. The frozen optimization
outputs, old optimization tools/reports and `public/models` were not rewritten.

| Artifact | SHA-256 |
| --- | --- |
| Frozen source | `be4471f3598e0755766fb4858c5da6dc406f62fc6c03f7a563dc908cf10a29e4` |
| Corrected source | `b151ddbdbaf754a6a31975e9d3fefd726592a8e7fd80b602a959aff7109a1e82` |
| Frozen optimization GLB | `7367a9b0e683aec476234c379ef48b6b1c4b50f46fb3a34991def40d1da6cc16` |
| Fresh `before.glb` | `a56fdb5296965a64a1c8835a054c2d741588c67fa267c038b7f123ed67ce2ccc` |
| Final `after.glb` | `15733e9d5bb44045577f21f6908857271630022ef73a0fde8dfb54a32a528500` |

The unchanged-source rebuild is not byte-identical to the frozen optimization
GLB. Investigation found identical JSON, POSITION, NORMAL and index buffers;
differences are confined to UV float roundoff of at most
`5.960464477539063e-8`. The same phenomenon appeared before any correction.
Report the actual hashes rather than claiming deterministic GLB bytes.

`before-lenses.json` and `after-lenses.json` contain source/library/export hashes,
authored matrices/vertices and actual exported vertices. `bounds.json` contains
the sole ruler's exact bounds. `before-render.json` and `after-render.json`
record the input GLB hash, each PNG hash and camera/settings used. The render
tool refuses to finish if its input GLB changes during the render.

The four `before/after-front/side.png` closeups import the actual exports and
use fixed cameras, Cycles CPU, two threads, 16 samples and neutral stand-in
materials. Local inspection shows both lenses restored behind their existing
guard bars. The coordinator independently reviewed all four closeups: the
before views show gray empty housings/grilles, the after views show blue-gray
lenses fitting behind both grilles, and surrounding mast/guard/boxes match.

## Reproduction

From the private worktree, using existing Blender/Node dependencies:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python-exit-code 1 --python tools/rigfix_crawler_lenses.py -- --label before --source .rig-corrections/before/source/crawler_th.py --expect displaced
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python-exit-code 1 --python tools/rigfix_crawler_lenses.py -- --label after --expect preserved
node tools/glbinfo.mjs --parts .rig-corrections/crawler/before.glb
node tools/glbinfo.mjs --parts .rig-corrections/crawler/after.glb
node tools/rigopt_contracts.mjs .rig-corrections/before/models/crawler-th.glb .rig-corrections/crawler/after.glb
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python-exit-code 1 --python tools/rigfix_crawler_render.py -- --label before
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python-exit-code 1 --python tools/rigfix_crawler_render.py -- --label after
```

The old named-contract gate passes even the broken lens export, because the
mount and aim nodes were always correct. The new authored/exported vertex proof
is necessary to detect this specific failure.

No GPU capture or runtime performance claim was made. No approvals, dependency
changes, Git index writes or commits were requested. Early Python source imports
created a bytecode cache beside the frozen source; the coordinator was informed,
and the new proof tool now disables bytecode writes. Original frozen file hashes
remain unchanged.
