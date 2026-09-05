# RC rig and quarry WIP finalization

Reviewed `4ddbdbf` against ASTRA, the RC section of `_model-critique.md`,
`rc-rig.md`, and `16-site-archetypes.md` §A.4. This review covers only
`blender/rc_rig.py` and `blender/sites/quarry_bench.py`.

## Confirmed defects and changes

- **RC hose corrugations were detached.** The rubber core uses Blender's
  AUTO-handled Bezier segments through four waypoints. The ribs interpreted
  those waypoints as the control handles of one different cubic. The isolated
  before render shows a separate U-shaped chain of rings beside a smooth hose.
  Ribs now sample the core's actual resolved handles and wrap the hose in the
  after render. Neither the ring count nor the core geometry changed.
- **Quarry conveyor supports stopped below their beam.** Their former height
  ended at `tz - 0.9`; the authored pitched beam's underside is
  `tz - (gantry_depth / 2) / cos(pitch)`. Supports now derive their tops from
  that underside. Before and after renders show the disconnected and connected
  structures. These are corrections to authored plant geometry, not sourced
  specifications for a real conveyor.
- **Conveyor drums extended to one side.** `tube()` starts at its base, but its
  base had been placed at the conveyor centreline. Each base is now offset half
  the existing drum width opposite the rotated cylinder axis.
- **Standalone RC export used the wrong filename.** Running `rc_rig.py`
  directly now writes `rc-rig.glb`, matching the runtime rig ID and the batch
  export path.
- **Gripper contact surfaces were painted to save a primitive in the WIP.**
  They retain worn steel, consistent with the contact-wear treatment in
  `rc-rig.md` §6. This restores one primitive without changing geometry.
- **Provenance comments contradicted their own sources.** The code no longer
  claims no RC dimensioned GA exists, calls the game's exact 3.05 m rod a
  catalogue 3 m dimension, or claims runtime hose deformation already exists.

## Measurements

All dimensions below are from `tools/glbinfo.mjs`, which transforms every
exported vertex. No other dimension ruler was used. These are model bounds,
not real-machine specifications.

| Full exported model | WIP baseline | Final |
|---|---:|---:|
| RC primitives (draw-call floor) | 35 | 36 |
| RC triangles | 70,804 | 70,804 |
| RC file size, as printed by glbinfo | 4,596.5 kB | 4,596.7 kB |
| RC overall W × H × L, m | 7.883 × 7.215 × 7.608 | unchanged |
| Quarry primitives (draw-call floor) | 6 | 6 |
| Quarry triangles | 13,936 | 13,936 |
| Quarry file size, as printed by glbinfo | 938.8 kB | 938.8 kB |
| Quarry overall W × H × L, m | 71.370 × 16.268 × 54.654 | unchanged |

The final files contain 4,706,976 and 961,304 bytes respectively. The quarry
export's own gate reports `materials=6 draws=6 budget=6`. Runtime draw calls
and warm frame rates were not measured by this review.

The isolated first conveyor's five support tops changed from
`1.900, 3.100, 4.300, 5.500, 6.700 m` to
`2.497, 3.697, 4.897, 6.097, 7.297 m` in glTF Y-up coordinates. The fixture
remains 208 triangles. In the hose fixture, the unchanged core measures
`1.550 × 1.632 × 2.353 m`; the complete corrugated assembly grows vertically
from 1.643 to 1.669 m because the ribs now follow the lowest part of the core.
The whole rig's bounds remain unchanged.

## Verification and reproduction

Both complete Blender exports exited successfully using Blender 5.2.1. The
model contract gate passed: 19 rigs, 19 Blender modules, 19 exported models.
The existing five missing-spindle notes remain outside this review's scope.

`tools/verify_blender_wip.py` is an export/render fixture, not a dimension
instrument. `--before` reads the interrupted `4ddbdbf` source. Its renders use
Cycles **CPU**, so they do not compete with headed Chrome GPU measurements.

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python tools/verify_blender_wip.py -- --before --render
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python tools/verify_blender_wip.py -- --render
node tools/glbinfo.mjs --parts .bak/wip-finalization/rc-hose-before.glb .bak/wip-finalization/rc-hose-after.glb .bak/wip-finalization/quarry-conveyor-before.glb .bak/wip-finalization/quarry-conveyor-after.glb
node tools/glbinfo.mjs --parts public/models/rc-rig.glb public/models/sites/quarry-bench.glb
node tools/checkmodels.mjs
```

The four inspected PNGs and GLBs are regenerated under
`.bak/wip-finalization/`. That directory is ignored build/QA output.

## Remaining cross-file work

- `gltfRig.js` does not consume `slide:sample-hose`, `mount:sample-out` or
  `mount:cyclone-inlet` to deform the hose as the head moves. The corrected
  Blender shape is a rigid exported assembly until a runtime driver lands.
- The RC model still combines the small reference's size with the large
  reference's open-lattice features. Its header records both GA sources and
  the unresolved class choice. No scale change was justified by this review.
- The quarry's historical edge-speckle report is still **undiagnosed**. A post
  process sampling outside the band is a suspicion, not a proven cause. The
  inboard mitigation remains, and isolated renders do not test the live
  game's post chain. It needs a live reproduction before declaring it fixed.
- Subsequent commits `4ba2df2` and `7e90ab1` publish and consume explicit
  scenery exclusions for RC loader framing. The measurements above remain the
  historical WIP comparison, not the later metadata export's primitive count.
