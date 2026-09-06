# Hero-camera framing

2026-09-06. CPU implementation checkpoint; headed validation is queued with
the coordinator's shared GPU owner. No rendered-image result is claimed here.

The complete `ASTRA.md`, including §1, and its linked September 6 progress
checkpoint were read before this work. The camera review in the geology
worktree was also read in full. Its true-metre section projection and exact
settled collar registration remain the compatibility constraints.

## Problem and implementation

The actual CFA capture from the urban-site work retained camera position
`[8.4, 2.25, 10.94]`: the authored starter-rig pose. `updateSurfaceCamera()` did
not consume any rig dimensions or bounds, so changing machine did not frame
a taller mast. A loaded model and a working source selector were insufficient.

`src/core/renderer.js` now consumes `getSpec().glb.feedFraming`, falling back to
the loader's rest-pose `glb.framing` when there is no feed record. Both contain
actual included-vertex bounds in unplaced rig-local coordinates. The fitter
uses the active machine's complete world matrix, including its parent rig
group placement. A hidden cached rig cannot supply the camera target.

The solver projects the eight conservative corners of those measured bounds
through a real Three perspective camera. It searches for the closest scale
of the authored eye/look pair that meets side and crown clearance. Scaling
both about the world collar preserves the authored view direction and collar
projection. It evaluates the same bounded lens translation that the live
surface/section registration uses. No per-rig dimensions, radii, camera table,
or model-name exceptions are added.

Low, wide footprints otherwise lose excessive front ground to the cut plane:
the initial tunnel-jumbo fit cropped 29.94 CSS px at the 390 px fixture. The
solver lowers the eye only when the projected ground footprint requires it,
adjusting pitch analytically to keep the collar projection. The resulting
included-vertex crop is 6.76 px in that fixture. Four-percent side clearance,
six-percent crown clearance and a three-percent ground-footprint tolerance
are **NOT SOURCED composition choices**, not physical dimensions.

The camera keeps its existing springs and focus/mode behavior. Fit results
are cached by active root, published bounds, complete placement matrix and
actual band/FOV inputs. Source replacement, resize and movement invalidate
the cache. `renderer.heroFraming` exposes a copied target diagnostic; it does
not claim that an in-progress spring transition has already reached its goal.

## Actual-pose regression

Run in the original checkout:

```text
node tools/checkheroframing.mjs --json research/HERO_CAMERA_MEASUREMENTS.json
```

The successful checkpoint has **2,904 checks and 342 actual model/phone/pose
cases**. It loads all 19 rigs from the Blender export manifest with the real
public GLB loader, selects each through the real rig system and exercises two
phone fixtures, 390×844 and 320×740. HUD extents are explicit CPU inputs,
**NOT SOURCED shipping-layout measurements**. Per model and phone it checks:

- The authored rest pose and both declared carriage endpoints. Explicit
  coordinates follow their declared glTF axis, including HDD's Z feed.
- The public `rig.update()` path at feed start, midpoint and immediately
  before rod wrap, each at load 0 and 1. These are real deployment/flex/joint
  transforms, not direct-translation stand-ins. Exact endpoints are separately
  checked above and by the metadata gate's actual `setCarriage()` driver.
- Independent projection of included model vertices, near/far clipping,
  crown/side clearance, above-ground front-edge tolerance, and exact settled
  collar-to-section/ground-to-seam alignment.

`mergeStatic()` may combine excluded scenery and machine into one shared
material mesh. The gate therefore retains a real unmerged loader instance for
vertex classification, applies the active rig's world matrix, and copies its
actual retained motion-joint transforms before projecting. It does not grade
excluded scenery as part of the machine or erase runtime movement to pass.

The full-fleet test found four crown failures under rest-only framing:
crawler-th, piling-leader, bolter and si-rig at maximum feed. The metadata
owner supplied an actual-vertex feed envelope. Its actual driver test also
found authored Bolter mast rake being interpreted as flex. That owner fixed
the loader/rig adapter to preserve authored work rake and rotation and track
flex relative to rest. The camera gate passes on that integrated source.
Those loader/rig changes are dependencies owned by the metadata worker.

The gate additionally exercises the same cache/consumer used by the renderer:
feed-record precedence, parent translation/rotation/scale, source identity,
resize, hidden root, invalid metadata, missing-metadata fallback and immutable
diagnostics. It instantiates actual geology in vertical, profile, raise,
heading and pile modes. Their true-metre projection and 20 m scale anchor
remain unchanged; non-heading spud datums remain visible.

The JSON records source/asset SHA-256 values, all pose projections, measured
crop and section/surface scales. It is a screen-projection instrument;
`tools/glbinfo.mjs` remains the only dimension CLI.

## Scale and scope

The previous geology review measured a 2.811983108 surface/section scale
ratio for the fixed starter pose. The new ratio must vary when larger machines
fit the same surface aperture; the section ruler is not rescaled to hide it.
At the 390×844 CPU fixture, representative settled targets are:

| Rig | Eye position (m) | Surface/section vertical scale ratio |
|---|---|---:|
| crawler-lite | 9.647, 2.584, 12.564 | 2.449 |
| CFA | 46.349, 12.415, 60.364 | 0.510 |
| PD55 | 42.657, 10.693, 55.555 | 0.556 |
| tunnel-jumbo | 19.337, 1.291, 25.185 | 1.249 |
| oil-derrick | 112.270, 26.581, 146.219 | 0.212 |

The authored feed envelope does not claim arbitrary boom, mast-deployment or
rotary swept bounds. The driven probes deliberately hold rpm/percussion at
zero and test feed/load. Geometry authored below the world ground plane can
still cross the section cut; it is reported separately. For example, HDD's
full included-vertex extent reaches 20.52 px below the seam while its actual
above-ground vertices pass the ground-edge tolerance. No model dimensions
were changed to conceal this.

Procedural rigs or absent framing metadata retain the authored camera
fallback. The current shipping 19 GLBs supply measured records. Actual live
HUD layout and spring settling now also have a bounded headed capture in
`.bak/hero-qa/report.json` (preserved as HERO_CAMERA_GPU_MEASUREMENTS.json):
12 cases/six actual GLBs at390x844 and320x740 passed,
with actual source checks, conservative framing margins, <0.1px collar/ground
registration error, no context loss/page/resource errors and browser closure.
Rigs: crawler-lite, cfa-rig, pd55, tunnel-jumbo, hdd-rig and longhole-rig.
Root inspected PD55 at320 and CFA at390: the tall mast tops are on screen.
Below-ground authored feed extents remain reported, not clipped into a false
whole-model framing claim. QA contract warnings are visible in the screenshots;
these are framing fixtures, not evidence of accepted playable job readiness.
No frame-rate, phone-performance, overall composition or glyph-legibility
certification follows. HUD opportunity toward82% remains separate work.

The capture body is preserved in tools/checkheroframingbrowser.mjs with portable
port/output/lease arguments and exclusive hero-camera ownership. That wrapper
passed syntax validation; the recorded run used its original .bak capture body.
The bounded CPU gate independently measures above-ground crop; the GPU gate
checks top/side margins and registration. Authored foreground site props can
still occlude the machine (visible in HDD390), so no unobstructed-model claim.
