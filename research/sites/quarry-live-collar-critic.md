# Quarry live-collar independent critique

Status: **PASS for the scoped source correction and matching actual export.**
All 1,025 surviving authored objects are bit-exact in the final build. The final
asset has zero triangle intersections with the live-collar ownership envelope.
**Rendered acceptance remains pending; no image was available to this critic.**
This report distinguishes source, actual exported vertices, and images. No
rendered acceptance is implied by source or CPU results.

## Scope and authorities

Read original `ASTRA.md` in full, original `handover.md`, and live
`drillity-coordination/root-coordinator.md` / `claude-sites.md`. Production is
read-only for this critic. The reviewed baseline is
`37f92a48abfd4ce3a20654359cb869dcd46ba25d` in the private quarry checkout.
`tools/glbinfo.mjs` is the only dimension reader used.

The actual code contract is `terrain.js`'s `CFG.collar = (0,0,0)`,
`buildCollar()` positioning the live group there, and `attachSiteModel()`
positioning its clone at `(0,0,0)`. The matching `mount:site-collar` is authored
at the origin. No engineering clearance radius is established or introduced
by this correction.

## Independently checked source findings

`site.py` reexports `tube = R.tube`. `rig.py:181` uses
`primitive_cylinder_add(...)` and translates the mesh by half its length,
making `loc` its base, not its midpoint. `site.py:482`'s `pattern()` calls that
primitive even though its prose calls the results dust rings. They are capped
cylinders, not annuli.

The baseline center is the fifth generated point (index 4, grid i=4,j=0).
Three rows of nine with the existing final-row omissions produce 24 generated
points. The four center objects are `shot-collar-4-0`, `stem-4`, `flagpin-4`,
and `flag-4`.

Claude's broad overlap finding is supported; two wordings need precision:

- The dust cylinder is authored from y=0.005 to y=0.065 after Y-up export;
  the live transparent puddle plane is at y=0.03. This is intersecting geometry,
  not proof that surfaces are coplanar or that visible z-fighting occurs.
- The pin is authored from y=0 to y=0.62. Its top is below the live casing
  stub's top y=0.715; the flag extends from y=0.515 to y=0.645. The source
  supports static dressing inside the casing volume. It does not establish a
  flag visibly growing above the casing.

These are existing authored/runtime dimensions, not externally certified
engineering figures. Actual-vertex verification is recorded separately below.

## Candidate source review

The diff reads `S.pattern()`'s returned objects, locates the existing exact
origin, removes that one dust cylinder, and skips that existing index in both
the stemming and flag loops. It retains the entire `at` list and therefore the
original indices used by `S.rnd`. It introduces no physical dimension and
leaves `build_plant()` and its corrected conveyor support/drum formulas intact.
Removing a point from `at` instead would change every subsequent keyed random
variation; this candidate avoids that defect.

The initial candidate source SHA-256 is
`54c42a1d8987f7744aeeed0aca2e3a1bf54226354a2e663630808830e2904027`.
The original root source SHA-256 is
`a791c5a64c156497ef758205cf0cae2bb7c175d80b9259e759ea69dda0b38b91`.
Raw filesystem/Git source hashes can differ by line endings; exact hash
provenance is retained rather than conflated.

## Original exported asset

Command, run from the private checkout:

```powershell
node tools/glbinfo.mjs --parts C:/Users/henri/Downloads/drillity-the-game/public/models/sites/quarry-bench.glb
```

Original asset SHA-256:
`61a93902888f54b9913fdda690f308008dae8a80cb5b2b2e10208e4d219428dd`.
The actual root GLB is measurable and nonempty: 6 primitives, 13,936 triangles,
10 nodes, no images, six materials. The four center names are absent after
static merging; name-only checks on the shipped GLB cannot detect their geometry.
Actual bounds reported by the approved ruler: x −57.765..13.604,
y −1.600..14.668, z −39.379..15.275 (metres, display rounded to 0.001).
These overall bounds alone prove nothing about a local collar obstruction.

## Acceptance boundary

The actual-vertex, preservation, negative-control and malformed-asset checks
below are complete. A zero center-vertex count alone would be insufficient
because a large triangle can span the whole hole; the accepted gate checks
triangle interiors too. The parent's exact-lease images still require
inspection before visual acceptance. This critic launched no browser, GPU
render, or server, and makes no FPS, final gameplay appearance, whole-site
collision or engineering-clearance claim.

## Independent actual-vertex and regression results

The source_repro worker's actual Blender center fixture was read independently
with `parseGLB()` and `measure()` from `tools/glbinfo.mjs`, not a second ruler.
The four meshes are measurable with zero unreadable primitives. Their exported
Y extents confirm the source interpretation: flag 0.514999986..0.644999981,
pin 0..0.620000005, dust cylinder 0.00499999989..0.06499999855, and stemming
0..0.179255635. The stemming's x/z extents are ±0.527554154.

Independently rerunning `inspectAsset()` against the original root GLB gives
65 intersecting triangles: gravel 36, rawSteel 12, safetyStripe 12, and
**blastedRock 5**. The additional rock finding is real. Triangles 8664, 8665,
8666 and 8674 contain the actual transformed vertex
`[0.1894971726389869, 0.3545374870300293, 0.13720865710186025]`, which lies
inside the source-derived disk/slab. Triangle 8667 crosses grade into that
disk even though none of its three vertices is inside it. Therefore a
vertex-only gate would undercount this exact shipping obstruction.

The worker traced this rock to the existing `build_bench()` spill loop's
`spill-11-4`. I read the extraction script and independently measured its actual
Blender fixture through glbinfo. Its x bounds are
0.189492269..0.679633634; y −0.042518697..0.402039699;
z −0.081551851..0.362638147. Small float differences versus the joined root
mesh do not change the robust inside-volume witness. Removing this one
confirmed overlapping decorative rock is within the same narrow live-collar
dressing correction; moving the spill pile or inventing a safe distance is
unnecessary. A candidate removing only the four originally reported objects
must not be declared clear.

Run the independent test:

```powershell
node tools/checkquarrylivecollar-adversarial.mjs
```

The first run passed 17 of 18 fixture cases and all 18 vertex-permutation
assertions. It exposed a real false pass: a nonzero weighted morph target moved
a clear base triangle into the collar while the gate tested only base POSITION.
The gate author fixed this by refusing morph weights/targets, skins, animation
and GPU instancing in this static-site audit. No second geometry implementation
was added. My fresh rerun passed **18 of 18 fixture cases and 18 permutation
assertions**, including the original reproducer. Empty scenes/meshes, missing
POSITION (including an unattached bad mesh), zero count, sparse/compressed or
nonfinite vertices, truncated storage, lines, incomplete triangle topology,
transparent and unnamed materials all fail. A large cap and a vertical
triangle crossing the protected slab are both caught with zero contained
vertices. A transformed mesh is tested in its actual world transform.

The gate's region is explicitly the live throat disk swept from grade to the
top of the live casing stub. This is a local runtime-ownership regression, not
an engineering clearance or whole-site collision certification. No further
broad synthetic testing is required for the delivered static candidate.

## Unchanged-source hopper control

The initial complete prejoin equality test failed on `crusher-hopper`. I read
the saved full before/after payloads and the separate `probe_hopper.py` source
and its three unchanged-source build results. The complete object's only
different field is UV data: 20 scalar components differ by exactly
±5.960464477539063e-8. All non-UV fields are exactly equal. The baseline UV
payload equals the first unchanged-source control exactly; the candidate UV
payload equals the second and third controls exactly.

This establishes an existing Blender repeated-build UV variation; it does
not justify a general geometric tolerance. The final equality test should
accept only the two observed complete UV payloads for that object, while
retaining exact geometry, topology, transform, material and other data checks.
The actual source diff leaves `build_plant()` unchanged. The evidence is in
`.bak/quarry-live-collar/unexpected-object-deltas.json` and
`.bak/quarry-live-collar/hopper-repeat-probe.json`, with the reproducible probe
alongside them.

A later full build exposed the same class of variation in `crusher-body`:
the new delta artifact contains only that object's UV field, with eight scalar
differences of exactly ±2.9802322387695312e-8. I independently checked those
payloads. The implementation is collecting a bounded set of unchanged-source
plant controls before its final export. The acceptance rule remains whole
observed payload equality, with all non-UV fields required exact. If an unseen
UV variant remains, the export can establish exact geometry preservation but
must disclose unresolved UV determinism rather than claim every payload equal.

## Final frozen candidate verification

I independently read the final authoring report, recomputed its production and
asset hashes, checked all recorded shared-source hashes, compared its complete
before/after signature maps, and ran `inspectAsset()` on the matching private
GLB. All checks passed. The actual final build has **no UV variation at all**:
`changed_noncenter_objects = []`, `uv_same_source_controls = {}` and all
**1,025 survivor signatures equal the full original signatures exactly**.
The UV issues above describe earlier failed authoring attempts only; no UV
exception was exercised in the delivered artifact. The final verifier also
requires full-signature control membership before its component checks.

| Check | Final result |
|---|---|
| Authored objects | 1,030 → 1,025 |
| Removed exactly | `flag-4`, `flagpin-4`, `shot-collar-4-0`, `spill-11-4`, `stem-4` |
| Surviving objects bit-exact | 1,025 / 1,025 |
| Unexpected new objects | 0 |
| Authored negative controls | Original baseline plus each of five reinsertions rejected |
| Actual exported meshes | 6 |
| Actual exported vertices | 27,030 |
| Actual exported triangles | 13,840 |
| Triangles intersecting live envelope | 0 (original root: 65) |
| Export size | 955,160 bytes |

The exact survivor comparison covers all other pattern holes and their keyed
random variations, all remaining 59 spill blocks, and the earlier conveyor
support/drum corrections. The final source diff introduces only the confirmed
fifth rock removal beyond the initial four-object correction, with its actual
source/vertex provenance cited beside that removal.

Final source SHA-256:
`b0b750e43cd08dc3d0ae76f3322ffdc7848161e90d6b4949e78685c74a1705d4`.

Final private GLB SHA-256:
`5b53090ed7c92c89be48e4dcf668a7400634aa62eb3d7b89482c4cfc7db78930`.

The complete bound from the approved ruler is x
−57.765350341796875..13.60430793892004, y
−1.600000023841858..14.667548179626465, z
−39.37867784500122..15.275319099961735. These are actual vertex extrema,
not independently sourced physical dimensions.

Reproduce the final CPU audit from the private checkout:

```powershell
node tools/checkquarrylivecollar.mjs --asset public/models/sites/quarry-bench.glb
node tools/checkquarrylivecollar-adversarial.mjs
node tools/glbinfo.mjs --parts public/models/sites/quarry-bench.glb
```

The authoring/export command is recorded in the implementation report and in
`tools/verify_quarry_live_collar.py`. No additional expensive export was run by
this critic. No production source outside the assigned quarry module was
changed by this task, and this critic modified only its dedicated report/test.
