# Independent terrain AO review — 2026-09-08

**Approve the narrow `farField.userData.noAO = true` implementation.** The actual
captured candidate removes the horizontal weave from the far horizon in both
reviewed scenes. It preserves the normal color pass, near ground, rigs and the
geological section. This does not resolve the Nordic horizon's ochre cast, the
remaining weave on the nearby oil-site ground, or the broader rig brightness.

Reviewed production file SHA256:
`390b3591b2783a80b0d45fd15f6e70d79d44c16b3c16255355c4e15871aac8a0`.
The only production diff against Claude `3aab87d` is this flag plus three comment
lines. Geometry, materials, fog, lights, shadows and simulation are unchanged.

## Independent verification

Run from this isolated worktree:

```text
node tools/checkterrainao-adversarial.mjs
```

Result: **9 groups passed**. This is a review artifact tied to these source hashes
and captures, not a portable package gate. It launches no browser or GPU.

The test extracts and executes the real `skipInAO`, `collectNoAO`, and
`renderAOPrepass` source against actual Three.js scenes and an observing renderer.
It verifies:

- Only the tagged far-field leaves the surface AO render; opaque ground and rig
  meshes remain, and the geological section still renders with the normal material.
- The scene is restored for the color pass. The far-field keeps `castShadow = false`
  and `receiveShadow = false`; the renderer's prior shadow setting is restored.
- Existing exclusion rules still distinguish mixed material arrays from wholly
  transparent/depth-disabled arrays. A separate mesh named `far-field` is not
  excluded by its name. Points, lines and sprites retain their existing behavior.
- Tagged parents suppress descendants during the render. Restoration does not
  expose children that were already hidden.
- Exceptions in either scene render restore override materials, section background,
  original shadow enablement and visibility. An absent AO target changes nothing.
- Restoring the legacy membership adds only the far-field to that AO scene.

The full 476-entry served base manifest matches the recorded before/after hashes
and current frozen files. The Vite load plugin substitutes only the exact
`src/world/terrain.js` module; its candidate file is hashed separately. The
candidate and current harness hashes match the record. The served renderer is
the approved graphics/framing candidate, and its extracted prepass is byte-equal
after newline normalization to the prepass exercised by the test. This is an
isolated combination of reviewed graphics candidates, not the currently assembled
gameplay integration worktree.

Every candidate-03 image hash matches its recorded value. Before/after state is
equal within each capture. Candidate, legacy-AO and restored captures also have
identical simulation, state, camera matrices, scene transforms/visibility/geometry
IDs, rig, material values, fog, exposure, clocks, quality, viewport, SITE and site
model identity. Each hide diagnostic changes exactly the intended mesh's recorded
visibility. The report has no page, HTTP or request errors, and records closed
contexts, browser and server.

The harness mutates only `far-field.userData.noAO` for the candidate/legacy pair.
It does not disable the AO pass. The legacy flag adds exactly one recorded render
call in each scene, while hiding the candidate far-field removes exactly one
color-pass call. These are observed render counts, not a frame-time result.

## Image inspection and quantitative limits

I opened both candidate-03 baseline and legacy-AO images, plus diagnostic-02's
global `no-ao` and far-material `no-fog` images with `view_image`.

The Nordic and Sahara candidate horizons visibly lose the fine horizontal weave.
Their shapes and rig framing remain. The geology's authored layers remain. The
global AO-off diagnostic also changes local machine/contact shading; the candidate
keeps that shading. The no-fog diagnostic retains the woven pattern and exposes
more green on the nearer Nordic skirt, supporting separate AO and color issues.

An independent PNG decoder/calculation reproduced the author's recorded horizon
row-gradient results: Nordic 16.976 to 1.674 and Sahara 24.114 to 1.641. These
selected rectangles include the final film grain. They quantify the visible
pattern in these stills, not all regional terrain or all cameras.

Nordic controls, geological-section ROI and full restored pair have zero changed
pixels. Oil controls have zero changed pixels; its geological-section ROI has 15
changed pixels, and the full restored pair has 289 changed pixels despite exact
recorded state identity. Those differences must not be represented as exact pixel
stability. The independent test confirms these counts instead of treating them as
zero.

The existing warning list includes unpaid-preview setup, multiple imported Three.js
instances, and oil method VFX mapping warnings. They are not runtime errors or
changes in this patch, but these scenes do not establish paid gameplay correctness.

## Small documentation correction before integration

The production comment currently attributes the pattern specifically to "depth
reconstruction." The captures isolate Contact AO; they do not isolate a particular
reconstruction, depth precision or sample term. Prefer:

```js
// Contact AO introduces horizontal stippling on this distant backdrop.
// Keep it in the color pass, outside the AO prepass; nearby ground,
// rigs and the subsurface section retain contact AO.
```

A comment-only correction needs no new GPU capture, but its new hash must be
identified as a comment-only successor to the captured candidate. Preserve the
original report and hashes. The generated diagnostic also retains inherited
header/factor descriptions about the older graphics test; its actual command and
candidate substitution behavior are described above and in the author's report.

I did not independently run GPU work, profile a frame, test a phone, or validate
all regions/cameras. No FPS improvement or complete graphics acceptance follows
from this review.
