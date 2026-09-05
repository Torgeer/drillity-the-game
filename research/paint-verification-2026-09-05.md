# Paint and material contract verification

`CRITIQUE.md` finding 1 predates the current paint generator. Commits
`77843a5` and `df24d20` had already removed the 34-cell peel field and the
90-cell metallic flake. Reapplying that fix or reducing wear to hide it would
have changed the wrong version of the material.

## Measured current paint

`tools/checkmaterials.mjs` samples the current pixel programs directly in
Node. It extracts and executes the existing production `normalFromHeight`
function, and reads the production resolution table; neither is duplicated.
The following are **texture-space measurements**, not rendered-frame contrast
or real coating dimensions.

| Intact paint, wear 0 / dirt 0 / seed 7 | Resolution | Albedo RMS / mean | Packed-normal mean tilt | p99 tilt |
|---|---:|---:|---:|---:|
| paintedSteel LOW | 512 | 0.96% | 0.40° | 0.95° |
| paintedSteel HIGH | 1024 | 0.96% | 0.46° | 1.15° |
| paintedDark LOW | 256 | 0.96% | 0.34° | 0.71° |
| paintedDark HIGH | 512 | 0.96% | 0.40° | 0.95° |

The current generator does not reproduce the old reported mean 22.8° peel
normal. Its pixel program was left unchanged. SHA-256 comparisons of the
luminance, height, roughness and metalness arrays confirm unchanged output for
all six paintedSteel samples (clean/default/worn, LOW/HIGH) and both default
paintedDark samples.

## Concrete defects fixed

- **Dark paint ignored wear.** `paintedDark.defaults()` overwrote every caller's
  wear with `0.46`. Requests for clean and fully worn chassis therefore had
  identical pixel-array hashes. It now uses `0.46` only when wear is omitted
  and otherwise clamps the requested value to 0–1. Default appearance is
  unchanged; explicit clean and worn appearances now differ.
- **Chrome could not be unworn.** `p.wear || 0.12` changed a valid zero to
  `0.12`. The check was broadened to every material advertising a wear control,
  and chrome now distinguishes omitted wear from zero too.
- **Transmission depended on every caller remembering the rule.**
  `glass.base()` still produced `transmission: 0.92`; `material()` accepted
  positive overrides. Glass now defaults to zero, the public material API
  rejects nonzero transmission before allocating resources, and returned
  physical materials are pinned to zero. Opacity blending remains available.
  This enforces ASTRA §1.6 at the source instead of relying on loader patches.

No paint-film, chipping, rust, dirt-gradient, roughness or clearcoat formula
was removed or retuned. No texture resolution or material variant count grew.

## Validation

`node tools/checkmaterials.mjs` passes **34 material bases, 12 advertised wear
controls, and 12 deterministic paint samples**, with zero contract failures.
It checks all bases for positive transmission, rejects positive requests for
glass/paint/resin/foam before allocation, verifies wear endpoints and clamping,
and requires clean and worn pixel output to differ.

The intact-paint ceilings are explicitly **authored regression budgets**, not
physical specifications: albedo RMS below 3%, packed-normal mean below 2° and
p99 below 5°. They leave margin above the measured intact controls while
catching the old large relief field. Worn paint is excluded from those limits
so real chipping and corrosion remain visible.

Reports and baseline source are QA scratch under `.bak/wip-finalization/`:
`paint-before.json`, `paint-after.json`, `assets-before.mjs`.

Two original-repo headed HIGH captures were inspected:
`shots/astra-paint-r01-crawler-lite.png` and
`shots/astra-paint-warm-r01-crawler-lite.png`. They show the current chipped
painted panels without the earlier large quilted pattern. Both reported a live
drawing buffer, no lost context and zero shader errors. The second run used a
20-second warm limit, below the harness's 25-second minimum session warm time,
and therefore remained graded **COLD**. This review makes no FPS claim. Its
crawler frame reports **27 rig calls, 50 surface calls and 21
section calls**; the overall run is **INCOMPLETE**, not a performance pass.

GPU access was coordinated and released to the rig/entrance reviewer after
the two browser processes closed. Screen-space autocorrelation was not
recomputed; the numerical amplitude evidence above is from the CPU generator.
