# Sonic truck mesh optimization — 2026-09-06

Scope: `blender/sonic_truck.py`, dedicated `tools/rigopt_sonic_*` helpers and
this research note. No shared Blender library, runtime, content-data or other
machine source changed. No commits by this sub-agent; the coordinator owns the
scoped commit. All exports and renders are private worktree artifacts under
`.rig-optimization/sonic/`.

## Reproduced baseline and final export

Read the complete ASTRA handover/current implementation checkpoint, the rig
optimization checkpoint, sonic research and sonic adversarial review. Freshly
exported unchanged sonic source before editing; did not substitute a copied
public GLB for the baseline. Source snapshot:
`.rig-optimization/session-source/sonic_truck.py`.

Measured actual exports with the existing `tools/glbinfo.mjs` actual-vertex
ruler. These are **primitive counts, not rendered draw-call measurements**.

| Measurement | Before | After | Change |
| --- | ---: | ---: | ---: |
| Exported primitives | 33 | 33 | 0 |
| Triangles | 20,436 | 19,308 | −1,128 (−5.52%) |
| Bytes | 1,230,900 | 1,180,604 | −50,296 (−4.09%) |
| Nodes | 54 | 54 | 0 |
| Contract nodes | 21 | 21 | 0 |
| W × H × L, working pose | 2.515 × 7.304 × 7.630 m | same | exact bounds |

All six overall-bound coordinates are numerically identical. Every moving
subtree and mesh bound is identical. One static material group, `static:rubber`,
changes one extremum by 0.0000748634 m (0.075 mm), from the thin air-line profile.
The authored radii and sourced dimension constants remain unchanged.

Final SHA-256:
`003edafe42cec1762461f85e305206ab97924e6e3b78fa9788c76184b9612d5e`.
`public/models/sonic-truck.glb` matches `.rig-optimization/sonic/after.glb`
byte-for-byte. The ignored GLB is reproducible build output, not a source file
for the commit.

## Changes and measured attribution

| Parts | Before triangles | After triangles | Saved |
| --- | ---: | ---: | ---: |
| Nine under-deck chassis crossmembers (`xmem0`–`xmem8`) | 9 × 108 | 9 × 44 | 576 |
| Coiled hose (`coil_hose`) | 2,016 | 1,512 | 504 |
| Thin air line (`air_line`) | 192 | 144 | 48 |
| Total | | | 1,128 |

Crossmembers retain their original dimensions and 4 mm bevel width; only the
bevel segment count changes from two to one. Cab, hood, oscillator, mast,
tooling, guard cage and all other bevelled parts keep their original geometry.
The repeated energy-chain and cage meshes already used unbevelled boxes in the
baseline, so those were left alone.

The local `hydraulic_hose` helper changes only `bevel_resolution` from 2 to 1
on the coil and thin air line. Blender 5.2.1 evaluation **measures eight profile
vertices before and six after**. For example, the three-point air line has
104 vertices in 13 rings before and 78 in 13 rings after; its triangles change
192 → 144. The original `sides=6` argument is not a literal six-sided profile.
All eight hoses retain their exact radii, control points, evaluated AUTO handles
and six samples per Bezier span. The thicker head loops, three mast bundles and
thin winch rope keep their original profile tessellation.

An initial trial reduced all seven hydraulic hose profiles. The actual-vertex
subtree check caught a 4.266 mm mast-rubber extremum change and a 1.660 mm carriage
change. The thick hoses were restored instead of relaxing the gate. This is why
the final change is smaller than that trial.

## CPU validation

`tools/rigopt_sonic_build.py` profiles evaluated parts before joining and exports
the actual GLB using the normal module build. The unchanged snapshot was also
profiled to attribute every saved triangle. `tools/rigopt_sonic_verify.mjs`
imports `parseGLB` and `measure` from the sole ruler; it does not introduce
another dimension implementation.

The comparison verifies:

- All 54 node local transforms, parent relationships and extras match exactly;
  therefore their world transforms match too, including all 21 attachment and
  motion contract nodes.
- Material definitions and per-moving-assembly material partitions match
  exactly. No material substitutions, textures or transmission were added.
- Both exports contain zero animation clips. The existing runtime motion-node
  hierarchy and properties are preserved; no new animation behaviour is claimed.
- Overall actual-vertex bounds remain exact and all measured subtree bounds
  remain within 1 mm (maximum 0.075 mm, on static rubber only).
- Exactly the 11 parts above change triangle counts; the sum of their changes
  equals the difference in the exported GLBs. All hose paths and radii match.

Independent reviewer tool `tools/rigopt_contracts.mjs` passes its default 1 mm
gate: 21 contract nodes, maximum protected-transform delta 0, maximum moving
subtree-bound delta 0. `node tools/checkmodels.mjs` passes against all 19 private
machine exports. `git diff --check` passes on the owned source/tool paths.

Rendered the actual before/after GLBs in Cycles **CPU**, three threads, 32
samples, seed 0, fixed cameras and identical material stand-ins. Inspected all
six PNGs: `before/after-whole.png`, `before/after-head.png`, and
`before/after-hoses.png`. Overall and head silhouettes remain the same in these
views. The close hose view shows a small change in the coil's profile highlight.
The existing coil/energy-chain intersection is visible in both exports; this
mesh optimization does not reroute it or claim to fix it.

Pixel comparison, using RGB channels on a 0–255 scale:

| View | Mean absolute channel difference | Pixels with any channel difference >16 |
| --- | ---: | ---: |
| Whole, 900 × 1000 | 0.002643 | 0.000111% |
| Head, 900 × 900 | 0.017422 | 0.012099% |
| Hoses, 900 × 1000 | 0.040510 | 0.033444% |

These numbers are observations for the fixed CPU views, not a visual guarantee
at every camera angle or with game materials. CPU rendering does not verify
GPU performance, runtime draw calls or warm FPS. No browser/GPU session or GPU
lease was used by this sub-agent.

### Reproduce

From the private worktree, with the installed Blender 5.2.1 executable:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --threads 3 --python tools/rigopt_sonic_build.py -- --source .rig-optimization/session-source/sonic_truck.py --out .rig-optimization/sonic/before-profile.glb
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --threads 3 --python tools/rigopt_sonic_build.py -- --out .rig-optimization/sonic/after.glb
node tools/glbinfo.mjs --parts .rig-optimization/sonic/before.glb .rig-optimization/sonic/after.glb
node tools/rigopt_sonic_verify.mjs .rig-optimization/sonic/before.glb .rig-optimization/sonic/after.glb .rig-optimization/sonic/verification.json .rig-optimization/sonic/before-profile.profile.json .rig-optimization/sonic/after.profile.json
node tools/rigopt_contracts.mjs .rig-optimization/sonic/before.glb .rig-optimization/sonic/after.glb
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --threads 3 --python tools/rigopt_sonic_render.py -- .rig-optimization/sonic/before.glb .rig-optimization/sonic/before
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --threads 3 --python tools/rigopt_sonic_render.py -- .rig-optimization/sonic/after.glb .rig-optimization/sonic/after
node tools/checkmodels.mjs
```

The system Python lacks Pillow. Pixel analysis used the already bundled Codex
Python runtime's Pillow/NumPy; no packages were installed or changed. Ordinary
worktree CPU commands succeeded. Blender printed existing user-preference/cache
warnings while completing exports and CPU renders; no escalation was requested.

## Existing cross-file findings, checked against this snapshot

The historical sonic review is not an assertion that all its findings still
exist. One example is already stale: `src/core/gltfRig.js:602` reads
`transport_tilt_rad`, while the sonic source comment still claims no consumer.

Two runtime/content mismatches are still visible in this worktree and were
reported without editing those files:

- `gltfRig.js:415` reads `watt_hint`; all five exported sonic lamps publish
  `watt_w`. Their authored 60/60/50/50/50 values therefore miss that read.
- `rigFactory.js:2586` still uses `oscillatorKn: 180`, and `data.js:1230` still
  says 90–160 Hz; the sonic module's existing cited constants remain 222 kN and
  150 Hz. This pass does not modify content or re-certify those source claims.

The broader historical model/domain review remains separate work. Preserving
the existing contracts and sourced constants during optimization is not an AAA
or physical-correctness verdict for the entire sonic machine.
