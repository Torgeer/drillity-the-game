# Tunnel jumbo mesh optimization — 2026-09-06

Scope: `blender/tunnel_jumbo.py`, dedicated CPU audit/render tools, and this
report. The baseline was exported from the unchanged session source before
editing. The source already contained the earlier wheel-array, carriage,
spindle, attachment-name and material-batching fixes; the old 66-primitive
critique is historical. No sourced dimension, material, motion hierarchy or
attachment was changed in this pass.

## Actual exported measurements

`tools/glbinfo.mjs --parts` is the sole dimension ruler. Counts refer to
exported primitives and triangles, **not measured rendered draw calls**.

| Metric | Fresh unchanged source | Optimized export | Change |
| --- | ---: | ---: | ---: |
| Referenced primitives | 53 | 53 | 0 |
| Triangles | 28,680 | 24,280 | −4,400 (−15.34%) |
| Bytes | 1,528,376 | 1,335,616 | −192,760 (−12.61%) |
| Nodes | 113 | 113 | 0 |
| Materials | 7 | 7 | 0 |
| Overall W × H × L | 2.260 × 1.808 × 15.753 m | identical | 0 |

The overall bounds include the trailing power cable. The 15.753 m length is
therefore **not transport length**. Actual vertex bounds in glTF coordinates
are x −1.130…1.130, y −0.033…1.775, z −7.148…8.605 m (rounded to 1 mm).
No envelope was resized to force agreement with a transport dimension.

## Changes and attribution

- Thirty-four existing hydraulic/service curves use Blender bevel resolution
  1 instead of 2 through the existing shared `hose(..., sides=3)` argument.
  Fresh evaluated geometry confirms **eight to six profile vertices**, rather
  than interpreting that misleading argument name as a literal side count.
  Example: the four-control-point `art-cable` has 19 longitudinal rings,
  152 → 114 vertices and 288 → 216 triangles. Every control point, AUTO handle,
  radius and longitudinal `resolution_u=6` is identical. Across all changed
  curves this saves **2,352 triangles**. The trailing power cable is untouched.
- Thirty-two small detail boxes retain their authored bevel widths with one
  chamfer segment instead of two rounded segments: boom flanges, feed ribs,
  rails, lamp guards, carriage shoes, station rails and basket posts. Each
  evaluates to **108 → 44 triangles**, saving **2,048 triangles**. The main
  panels, boom bodies, telescope sections, tyres and drifters are untouched.
- Removed the module's `report_extent()` output. It transformed local
  `bound_box` corners, the approximation explicitly rejected by ASTRA §5.
  The module now directs dimension checks to the exported-vertex ruler.

These are tessellation choices, not new machine dimensions. Existing sourcing
comments and documented low-profile carrier/game-variant decisions remain.

## CPU verification

`tools/rigopt_tunnel_build.py` records evaluated component triangles before
joining and exports the real GLB. A second unchanged-source export reproduces
the original 53 primitives, 28,680 triangles and 1,528,376 bytes. The component
comparison verifies all **318 component names, material assignments and
parents**, and all **53 pre-join motion/attachment matrices and extras**,
remain identical. The only audited changes are the 34 curve profile settings
and 32 bevel segment settings described above.

The independent `tools/rigopt_contracts.mjs` comparison of actual GLBs verifies
53 contract nodes, exact local/world matrices and extras, material definitions
and assembly membership. Maximum transform difference is **0**. Both exports
contain **zero animation clips**; this machine retains its runtime-driven
nodes, so this is not a baked-animation playback test.

The default 1 mm subtree-bound tolerance correctly reports a change. The
maximum is **1.67934597 mm** on the carriage/feed ancestry as the same-radius
drifter hoses sample their circular cross section differently. Overall bounds
are exact. `glbinfo.measure()` isolates this to `carriage:rubber`: its max z
changes from −3.49544221958 to −3.49712156555 m; the carriage's chrome and
painted-dark geometry bounds are identical. With an explicitly declared
**2 mm** tolerance the full contract
comparison passes; this tolerance applies to sampled geometry bounds, never
attachment positions or matrices.

CPU Cycles renders use the actual before/after GLBs, the same authored cameras,
stand-in material palette, lighting, seed and 20 samples at 1100 × 700. Three
views cover the machine, feed detail and rear deck. Renderer device is CPU and
thread count is fixed at two. These renders do not prove the live game
materials, GPU cost or FPS.

All six renders finished and were inspected at full output size. The overall
silhouette, tyre tread, boom bodies, attachment positions and hose routing
remain visually consistent in these views. The feed close-up shows sharper,
brighter highlights on the thin chamfered rails; this is a visible change in
edge shading, not a claim of pixel identity. No missing component or new hose
discontinuity was observed. This review supports the local tessellation trade;
it is not an AAA verdict for the pre-existing model or the in-game render.

## Reproduction and evidence

From the worktree root, use Blender 5.2 with `--background --threads 2`:

```text
--python tools/rigopt_tunnel_build.py --
  --source blender/tunnel_jumbo.py
  --out .rig-optimization/tunnel/after.glb
  --audit .rig-optimization/tunnel/after-components.json

node tools/glbinfo.mjs --parts .rig-optimization/tunnel/after.glb

node tools/rigopt_contracts.mjs .rig-optimization/tunnel/before.glb
  .rig-optimization/tunnel/after.glb --bounds-tolerance=0.002

--python tools/rigopt_tunnel_render.py --
  .rig-optimization/tunnel/after.glb .rig-optimization/tunnel/after
```

Private evidence lives in `.rig-optimization/tunnel/`: before/after GLBs,
`before-glbinfo.txt`, `after-glbinfo.txt`, `before-components.json`,
`after-components.json`, `component-delta.json`, `component-verification.json`,
`contracts.json`, `hose-bound-attribution.json`, build/render logs and
`before/after-{hero,feeds,rear}.png`.
The copied private `public/models/tunnel-jumbo.glb` also passed the same
contract comparison (`contracts-public.json`). The unchanged module snapshot is
`.rig-optimization/session-source/tunnel_jumbo.py`. Public model exports are
private ignored build output; integration must rebuild from source.

## Limits and cross-file observations

No GPU lease or browser session was used. There is **no fresh rendered
draw-call count or FPS claim** here. In particular, the historical 89-call
surface-band figure in `research/CRITIQUE.md` is not a per-rig measurement;
that document separately reports a historical 73-call jumbo capture, which
also requires reproduction against the current source.

The existing standalone module entry point still names `tunnel_jumbo.glb`;
the project build and these dedicated commands explicitly use the correct
hyphenated runtime filename. This pre-existing export-entry-point issue was
not folded into the mesh optimization. No shared library or runtime file was
edited, and no `FACTS_VERIFIED.md` values were changed.
