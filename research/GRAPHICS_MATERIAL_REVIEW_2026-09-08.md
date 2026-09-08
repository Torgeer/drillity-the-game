# Machine finish candidate, 8 September 2026

This is a CPU-verified material candidate awaiting a matched rendered review.
It does not establish that the overall graphics are fixed.

## What reaches the renderer

`blender/lib/rig.py` assigns `paintedSteel` to bodywork and `paintedDark` to
chassis/frame parts. `_mat()` exports a name-only stub. The 19 current rig GLBs
read from the integration worktree all contain both names.
`src/core/gltfRig.js` replaces those stubs with shared `assets.material(kind)`
instances. `paintedDark` exists and uses `BRAND.plantDark` (`#33383D`); the old
missing-kind fallback is already fixed.

The current oil hero screenshot is dominated by ochre even where different
materials exist. Its close orbit still contains dark paint/steel. That distance
dependence belongs to the separate lighting/fog investigation. Darkening the
palette to compensate would conflate two changes, so this candidate changes no
colour, material name, Python geometry, normal texture, wear pattern or clearcoat.

## Candidate change and evidence

Only `src/core/assets.js` production code changes. The paint base roughness and
metalness factors become 1. The ORM pixel program already authors final channel
values; installed Three r169 multiplies each channel by the corresponding base
factor. The previous .34/.04 factors made intact paint very glossy and suppressed
the metal response of exposed chips. `paintedDark` inherits the same adjustment.

`tools/checkpaintresponse.mjs` uses the production pixel program, texture
constructor and map attachment. It checks the installed Three shader convention
and samples 192² points in each of eight states. It creates no canvas context,
browser or renderer. These are CPU material measurements, not frame brightness.

| Surface | Before roughness mean | Candidate mean |
|---|---:|---:|
| Clean paint/chassis | .1020 | .3000 |
| Default paint | .1237 | .3637 |
| Default chassis | .1273 | .3745 |
| Fully worn paint/chassis | .1420 | .4176 |

Clean paint remains a dielectric: metalness .03 with no sampled pixel above .05.
At wear 1, exposed-metal maximum changes .028 to .70; 3,474/36,864 samples exceed
.5, while remaining paint stays below .05. All eight albedo digests are identical
before/after. Dirt still increases roughness. ORM uses `NoColorSpace`; albedo is
sRGB. Transmission remains zero.

Reproduce the candidate with:

```
node tools/checkpaintresponse.mjs --report research/paint-response-candidate-2026-09-08.json
node tools/checkmaterials.mjs --report research/paint-material-contract-candidate-2026-09-08.json
```

The response gate passes eight candidate states. Running it with `--source`
pointing at the unchanged integration `src/core/assets.js` produces the recorded
eight failures; `--measure-only` records baseline data without a failing exit.
The existing material gate passes 34 bases, 12 wear controls and 12 deterministic
paint samples. No Blender or GPU process was used.

The two paint kinds are shared by site props and procedural tools. Terrain's
explicit scalar assignments remain in force. Tool helpers forward roughness and
metalness parameters that `assets.material()` already ignores; those consumers
inherit this candidate too. This review does not change that separate API issue.
Rubber, hoses, bare steel, glass and other material kinds are unchanged.

## Required rendered comparison

Capture a frozen camera, clock and simulation after textures finish generating,
with identical exposure, lights, shadow state, buffers and loaded geometry:

1. Original fog and original paint response.
2. Lighting candidate with original paint response.
3. The same lighting candidate with this paint response.

Use oil-derrick hero for distant silhouette separation, a close crawler bodywork
view for highlight width/colour retention and undercarriage form, and longhole
underground for shadow detail. A site with painted props is also a shared-consumer
check. Compare full native images; a darker average alone is not success.

For a same-session material-only A/B on the candidate, collect unique materials
with name `drillity:paintedSteel` or `drillity:paintedDark` **and scalar values
exactly 1/1** before making any changes. Save their values. Change only that
collection to roughness .34 / metalness .04 for the original response, then
restore the saved values in `finally`. Leave explicitly overridden materials
alone. Do not replace maps or mark a draw-budget/FPS result as measured until a
real frame has been captured. This intervention is a comparison recipe, not a
second shipping material path.
