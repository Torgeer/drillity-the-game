# Quarry live-collar dressing correction

2026-09-06. Private baseline `37f92a48abfd4ce3a20654359cb869dcd46ba25d`.
Source scope: `blender/sites/quarry_bench.py` only. Shared site/rig libraries,
terrain, renderer, materials, other sites and the earlier conveyor correction
remain unedited. No engineering clearance dimension was introduced.

## Reproduced cause and correction

`terrain.js` supplies the live `CFG.collar` at the origin and `buildCollar()`
owns its throat, cuttings and casing. `attachSiteModel()` places the quarry GLB
at that same origin. `S.pattern()` places original index 4 there; its alleged
dust ring is actually a capped cylinder. Removed `shot-collar-4-0`, `stem-4`,
`flagpin-4` and `flag-4`. The complete original `at` ordering stays intact, so
all other holes retain their keyed stemming/flag choices. No hole was reindexed.

Independent inspection of the actual original joined GLB also found five
`blastedRock` triangles crossing the live throat. An actual Blender fixture
made by the original `build_bench()` identified all five as `spill-11-4`;
the other four blocks in that fixture had zero intersections. Removed that
single deterministic scatter block and retained the other 59 spill blocks.
The spill sizes remain inherited authored geometry, **NOT SOURCED** engineering
dimensions. The exclusion follows the existing live throat ownership contract.

The root GLB contained 13,936 triangles. Its collision gate failed on 65 actual
triangles: 60 from the four center pieces and five from `spill-11-4`.
The four center meshes contain 84 triangles total; the separate five-block
spill fixture contains 60 total. These are exported triangle findings, not an
AABB inference. See `quarry-live-collar-repro.md` for the independent
gate's provenance and algorithm controls.

## Authoring preservation and inherited UV limitation

`tools/verify_quarry_live_collar.py` loads the exact baseline through read-only
`git show`, builds baseline and candidate in Blender, and compares actual
prejoin vertices, topology, transforms, parents, materials, vertex colors,
UVs and anchors. Only the five named objects may disappear; zero new objects
may appear. The original baseline and individual object reinsertion controls
must fail. The emitted private asset uses the candidate's own `S.finish()`.

Early runs correctly refused to claim complete byte equality. Unchanged
`build_plant()` repeated three times reproduced exactly the same 20 hopper
UV component differences observed in the first full comparison, each
`5.960464477539063e-8` (one float32 ULP). A later reset history moved the
difference to eight crusher-body UV components, each `2.9802322387695312e-8`.
Vertices, topology, transforms and materials remained exactly equal. No
production plant code or numeric tolerance was changed. The final run collects
five actual unchanged-source plant controls. Any UV acceptance is stated
separately from exact geometry preservation and the original raw asset hash.

**Final run passed with no UV exception:** 1,030 baseline objects became 1,025;
all 1,025 survivors were bit-exact, including UVs. Only the five listed objects
were removed. Actual counts were 24→23 shot collars, 24→23 pins, 24→23 flags,
12→11 stems and 60→59 spill blocks; both conveyors retained all ten named
objects each. All six negative controls rejected the offending geometry.
`authoring-report.json` records every before/after object signature.
`authoring-full-payload-postcheck.json` independently verifies the full-payload
criterion; the final run required no alternate control payload at all.
The verifier now also requires a complete original control signature on any
future UV-variation branch, preventing acceptance of an unobserved mixture of
individually observed component values. That added branch did not need to run
for this successful final export.

Diagnostic evidence is preserved in `.bak/quarry-live-collar/`:
`hopper-repeat-probe.json`, `probe_hopper.py`,
`unexpected-object-deltas.json`, `baseline-center-authored.glb`,
`spill-11-authored.glb`, and the independent collision JSON reports.

## Reproduction

From the private checkout (PowerShell):

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python-exit-code 1 --python tools/verify_quarry_live_collar.py
node tools/glbinfo.mjs --parts public/models/sites/quarry-bench.glb
node tools/checkquarrylivecollar.mjs --asset public/models/sites/quarry-bench.glb --json .bak/quarry-live-collar/candidate-collision.json
node tools/glbinfo.mjs .bak/quarry-live-collar/baseline-center-authored.glb
node tools/glbinfo.mjs --parts .bak/quarry-live-collar/spill-11-authored.glb
```

`--python-exit-code 1` matters: Blender otherwise returned process exit 0 for
the first failed Python assertion. No dimension tool was added; the fixture
exports use `tools/glbinfo.mjs` for actual vertex bounds.

## Frozen source and final artifact status

Candidate source SHA-256:
`b0b750e43cd08dc3d0ae76f3322ffdc7848161e90d6b4949e78685c74a1705d4`.
Original on-disk source SHA-256:
`a791c5a64c156497ef758205cf0cae2bb7c175d80b9259e759ea69dda0b38b91`.
Original root GLB SHA-256:
`61a93902888f54b9913fdda690f308008dae8a80cb5b2b2e10208e4d219428dd`.

Candidate GLB SHA-256:
`5b53090ed7c92c89be48e4dcf668a7400634aa62eb3d7b89482c4cfc7db78930`.
It is 955,160 bytes, 13,840 actual triangles, six primitives/materials, ten
exported nodes and zero images. The 96-triangle reduction is exactly the five
removed objects. `glbinfo.mjs --parts` measures actual vertex bounds
71.370 × 16.268 × 54.654 m; this is an asset extent, not a sourced quarry size.
Six primitives are an asset draw-call floor, not measured runtime draws/FPS.
The independent actual-triangle gate passes with **0/13,840** intersections
and zero of 27,030 vertices inside the live throat/casing envelope. The exact
original root GLB remains a failing negative control: **65/13,936**, exit 1.
Evidence: `.bak/quarry-live-collar/candidate-collision.json` and
`root-baseline-collision.json`. Root independently repeated the candidate gate
and checked all 1,025 survivor hashes and six authoring negatives.

Baseline Git-source SHA-256 (LF representation):
`6de66e13a7cacf60b5b9259e59f2044f86a0033c727fc339e296df6f09e7bb16`.
Original disk source uses different line endings. Shared-input SHA-256 values:

- `blender/lib/site.py`: `ba59e6817f1eaf55c71624967ce90ade45145c6186205a9ebab21c47e8d24172`
- `blender/lib/rig.py`: `b162741a7e6f032a3a3e817e4b33125069f70b9ed7d3f54a8cddaf371d7a8ed5`
- `src/world/terrain.js`: `ff23ce1428b84e4d95dbfad5caa097dbdb97b548f55e07544345fe9f08318cf5`
- `authoring-report.json`: `4a72a106f2f93c9bb0e9daf7cc5c24197d0e71f71baa7f58d02d86939f418cc0`

The final Blender session exited 0 after the successful export; `git diff
--check` passed. Only private output paths were written. No render,
warm GPU performance, overall site framing or visual acceptance is claimed.
The GPU lease was never granted to this implementation worker. No headed
browser, render, user/root server change, root asset write or integration ran.
