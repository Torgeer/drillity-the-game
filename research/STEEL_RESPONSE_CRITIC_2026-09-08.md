# Independent steel response review — 8 September 2026

**CPU verdict: approved for a serialized visual trial.** No functional blocker
was found in the three steel scalar corrections. This is not an approval of
rendered glare, average brightness, silhouette readability, FPS, or the ≤70 rig
draw-call gate. No browser, Blender, GPU process or server was started.

The review is against the isolated `drillity-rig-glare` candidate, including the
previously approved paint ORM correction. Integrate only the steel delta after
that dependency; this worktree does not contain the coordinator's assembled
gameplay changes.

## Reproduction and evidence

```text
node tools/checksteelresponse-adversarial.mjs --report research/steel-response-independent-2026-09-08.json --models ../drillity-graphics-validation/public/models
node tools/checksteelresponse-adversarial.mjs --source ../drillity-graphics-materials/src/core/assets.js --report research/steel-response-independent-baseline-2026-09-08.json
```

Candidate: **11 groups passed, zero failed**. Paint-only dependency: **six groups
passed, four expected failures**, including independent response samples and
the actual priming path. The optional GLB consumer scan accounts for the eleventh
candidate group. Baseline comparisons are pinned to Claude `3aab87d`; this is a
review-specific tool, not a permanent gate that should reject unrelated future
material changes.

The tool imports the real factory and installed Three r169. Its in-memory canvas
implements pixel storage and uses nearest-neighbour scaling only for the
cosmetic initial mottle. Completed ORM bytes pass through the unchanged
production packing and box filtering. No browser rasterizer, BRDF, lighting,
geometry derivative, tone mapping, or native image appearance is simulated.
The JSON records exact byte and LF-normalized source hashes.

## What was attacked

- **Shader interpretation:** installed shader chunks multiply roughness by ORM
  green and metalness by ORM blue. Physical roughness has the actual 0.0525
  floor and a later geometry derivative addition. Raw and worn steel response
  was sampled across 12 seeds, alongside rusted/polished/thread controls and
  fresh/worn chrome: 96 states, 1,024 offset samples each.
- **The real public API:** initial roughness, metalness and AO maps are attached
  before `material()` returns. Completed raw/worn/chrome generation keeps the
  same texture objects, dimensions, byte allocation, albedo bytes, normal bytes
  and ORM bytes as the baseline. The scalar interpretation changes.
- **Generation failure:** an injected asynchronous canvas write failure leaves
  the previously primed ORM attached. It does not fall into an untextured
  roughness-1 material. The task records its generation failure.
- **Allocation and identity:** repeated requests return the same material. The
  three material families cap at seven texture sets, 21 textures, exactly as
  baseline under excess variant requests. No mesh, material partition, shader
  transparency or transmission setting is added.
- **Wear clones:** the real tool helper retains the same shared maps and lowers
  roughness for polished wear. Its allocations remain bounded. Standalone tools
  with no asset factory retain their existing mapless fallback materials and
  honor explicit fallback descriptors.
- **Overrides:** the terrain material helper clones the supplied material then
  applies explicit roughness and metalness. Such controlled site surfaces keep
  their previous scalar values and maps. `assets.material()` already ignores
  roughness/metalness descriptors used by some tools, in both baseline and
  candidate. That inconsistency is pre-existing and is not repaired here.
- **Other materials:** executable defaults, fallback formulas, set keys and
  pixel programs are unchanged across every material kind. Base scalar changes
  are confined to the three steel kinds and the prior paint dependency. Glass,
  carbide, paint clearcoat, sidedness, opacity and environment intensity remain
  unchanged. Nonzero transmission requests are rejected before allocation.

Default finished low-tier maps, measured through the public bake path:

| Kind | Baseline effective mean roughness | Candidate effective mean roughness |
| --- | ---: | ---: |
| rawSteel | 0.130324 | 0.362011 |
| wornSteel | 0.273318 | 0.569413 |
| chrome | 0.002250 | 0.049994 |

These are texture/scalar inputs before the physical floor, not image luminance.
They use each kind's real default seed, unlike the author's seed-7 samples.
Fresh chrome remains predominantly at the physical floor. Its polished glare
can therefore remain strong after this change; worn chrome now retains a
roughness distinction. Paint's clean hero clearcoat remains 0.85 with clearcoat
roughness 0.08, independently of the corrected base layer.

## Shared scope and required visual controls

The supplied model directory contains steel names on all 19 fleet rigs and
seven site GLBs. Every fleet rig uses rawSteel and wornSteel; 18 use chrome.
The scan also records `teststub.glb` separately in JSON. Among the site controls,
six use rawSteel and two use wornSteel; one has both. This is a material-name
inventory with file hashes, not a count of submitted draws or visible pixels.

Visual acceptance must use matching scene, compatible loadout, time, weather,
camera, settled maps, actual source hashes and an A/B/A sequence. Required
controls are a sunlit Nordic mast and rods, an underground longhole silhouette,
and a site steel prop/rod rack. Include fresh and worn chrome response. Compare
the steel delta alone against the approved paint/haze/camera dependency. Keep
any glass or terrain experiment separate so a favorable combined image cannot
hide the cause of a regression.

Reject loss of dark-frame separation or legibility underground. Inspect the
actual native images, not only whole-frame luminance statistics. Record rig-only
and total scene draws; the CPU allocation invariants do not certify a measured
draw-call total. Paint clearcoat and opaque pale GLB glazing remain separate
causes of strong highlights and pale surfaces. The author has not claimed this
candidate fixes the complete graphics problem.

One comment wording correction was requested during review: the old chrome
factor erased its **roughness variation**, not all wear. Wear already changed
albedo and height/normal inputs. This changes no material behavior.

The author made that correction. Final source byte SHA-256 is
`284427023106420a4b29fbbcc239204ec222d01bab43140a3d226195fa471a95`;
`steel-response-independent-final-2026-09-08.json` records an 11-group passing
rerun. The later bounded visual verdict and its exact-repeat limitation are in
`STEEL_VISUAL_CRITIC_2026-09-08.md`.
