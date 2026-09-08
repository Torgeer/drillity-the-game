# Lighting contrast candidate — 2026-09-08

Status: source candidate prepared; a matched before/after render is still required.

The current oil derrick hero view loses most of the machine's local colour to
distance haze. The close orbit image retains dark steel, although that camera is
inside the structure and is not an acceptable composition. Cutting exposure
would darken both the machine and its background without addressing this cause.

## Evidence and calculation

Inspected integration capture:
`evidence/fps/oil-derrick-hero-frozen-retry/baseline.png`, and its `report.json`.
The report has `valid: true`, `sourceUnchanged: true`, a GLB oil derrick, Sahara,
clear weather, time of day 0.34, and exposure 0.4592. Its surface-camera inverse
matrix has element 14 = -187.0339584921156, so the world origin is at view depth
187.0339584921156 m. This is a point sample at the machine's base, not a measured
percentage of every rig pixel.

The recorded source identities are:

| File | SHA-256 |
| --- | --- |
| `src/core/env.js` | `89d502ef6dd09e72d66acfb74a0306d337bd75b4afc5f9d59c9369d4f67d9d4d` |
| `src/core/renderer.js` | `f33ae38987c61e53c3621dcef2d9297063c155ba884de9a6d9474d11eab2c542` |
| `public/models/oil-derrick.glb` | `43d3275ae9355bd5afeff9a09db18b74f40a1870ddb0668a6a1ee8c7e874323a` |

Three 0.169.0's installed `src/renderers/shaders/ShaderChunk/fog_fragment.glsl.js`
uses `1 - exp(-density * density * viewDepth * viewDepth)` as the linear RGB
blend from a surface's lit colour to the fog colour. The shipped clear Sahara
density is 0.0062; the candidate is 0.0032. Reproduce the calculation with:

```sh
node -e "for (const d of [187.0339584921156,400]) console.log(d, ...[.0062,.0032].map(r => 1-Math.exp(-((d*r)**2))))"
```

At the recorded base depth, haze falls from 73.94% to 30.11%. At 400 m the
candidate still blends 80.57% haze. These are shader calculations, not measured
final pixel improvements or sourced atmospheric visibility values.

## Candidate scope

`src/core/env.js` adds `clearFogDensity: 0.0032` to Sahara's recipe. The fog solve
uses that override only for clear weather. Existing fog/rain/snow/overcast
densities, other regions, underground lighting, exposure, tone mapping, IBL,
sunlight, shadows, bloom and draw calls are unchanged. The constant is an
explicit art direction choice; no physical measurement is asserted.

`node --check src/core/env.js` and `git diff --check` passed. No GPU or Blender
process was launched by this worktree while root owned the profiling lease.

## Required matched capture

Use one serialized headed Chrome session at 390 × 844 CSS px, DPR 2, quality
high, strict GLBs, with all assets ready and `warmShaders().ready === true`.
Start a real method demo, fit the correct rig, and use its settled hero camera.
Freeze simulation, camera and environment time before taking the pair; do not
write `sim.debug.state`. Root's frozen update adapter is available in
`tools/profileframes.mjs` in the integration tree. Preserve full source hashes.

In the unchanged scene, alternate only `ctx.scene.fog.density` between the
current and candidate values, take the same frame at each value, and restore
the original value in `finally`. Record actual fog colour/density, exposure,
camera matrices, asset readiness, draw calls and frame intervals with each
image. This runtime diagnostic isolates the scalar change; then capture the
source candidate normally to prove that the recipe selects it.

Required cases:

1. Oil derrick, Sahara, clear, time 0.34, hero: 0.0062 → 0.0032.
2. Oil rotary rig, same weather/time: verify the treatment also works at its
   shorter camera distance without an unnaturally sharp horizon.
3. A normal Nordic forest rig (crawler top hammer or DTH), clear, hero: control
   must retain its existing recipe and image.
4. Longhole underground, hero and orbit: control must retain its work lighting
   and existing underground fog. The observed orbit image has a pale lit cab
   pane amid a dark chassis; that is not evidence for a global exposure cut.
5. Sahara fog and overcast: density and image must remain at their established
   weather settings. Clear noon and late day should retain visible daylight
   variation and background depth.

Accept only if machine structure separates from the berm at portrait size,
paint, dark chassis and metal remain distinct, and distant dunes still recede.
Inspect clipping and near-black coverage as well as the pictures; do not infer
success from one luminance number. A fog scalar adds no passes or materials,
but frame pacing still needs a warm check in the final integrated build.
