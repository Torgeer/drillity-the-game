# Quarry live collar — independent source and exported-geometry reproduction

2026-09-06. Private checkout baseline `37f92a48abfd4ce3a20654359cb869dcd46ba25d`.
Root source and generated assets were read-only inputs. No browser, GPU render,
server, material, terrain, shared Blender helper or other site's source was
changed by this reproduction.

## Finding and scope

The root quarry GLB contains opaque authored dressing in the live collar work
space. The source initially identified four center shot objects; actual triangle
inspection found a fifth obstruction, the single rock block `spill-11-4`.
The extra rock was reported before a source or export pass was claimed. Root
authorized its narrow removal after the named Blender fixture independently
confirmed its identity. Other shot holes and all other spill blocks must survive.

This is an authored-runtime ownership correction. It introduces no engineering
clearance or real-world bore-diameter assertion. The protected envelope comes
from `src/world/terrain.js`: `CFG.collar` is the origin; `buildCollar()` authors a
throat with top radius 0.36 and a casing stub of height 0.75 centered at 0.34.
The gate sweeps that throat-opening disk from grade to the casing top,
`0.34 + 0.75 / 2 = 0.715`. These are the game's existing visual geometry values,
not newly sourced physical dimensions.

## Source evidence, kept distinct from measured vertices

- `build_shot()` calls `S.pattern()` with origin `(0, 0, 0)`. The front row has
  nine positions; column 4 is exactly the origin and returned index 4.
- `blender/lib/site.py:pattern()` describes a ring but calls `tube()`: the center
  `shot-collar-4-0` is a **capped cylinder**, not an annulus. It starts at height
  0.005 and is 0.06 high.
- The deterministic stemming and flag loops also dress index 4. `stem-4` is a
  solid gravel cylinder, `flagpin-4` is a steel pin, and `flag-4` is its marker.
- `rig.py:tube()` translates the primitive by half its length before placement;
  its origin is its **base**. Therefore the 0.62-long flag pin reaches height
  0.62. An initial centered-cylinder inference was explicitly withdrawn after
  reading that helper; it is not a finding.
- The extra blasted-rock geometry comes from `build_bench()`'s `spill` loop.
  `.bak/quarry-live-collar/record_spill.py` executes the exact AST-selected
  `rnd`, `rubble`, `on_axis`, constants and spill loop with a recording `box`.
  It records all 60 authored blocks and identifies `spill-11-4` near the collar.
  This is an authored-parameter trace, not a second vertex/dimension ruler.

The source positions make overlap plausible but do not themselves prove the
shipped bytes. The next section uses the actual GLB and actual named Blender
fixture exports supplied by the implementation worker.

## Actual exported geometry

`tools/checkquarrylivecollar.mjs` first validates each asset using the existing
`parseGLB()` and `measure()` from `tools/glbinfo.mjs`. The real Three GLTFLoader
then exposes triangle topology and world-space vertices for collision
classification. There is no local AABB collision shortcut or duplicated POSITION
decoder. A triangle is clipped to the live vertical interval, then its projected
polygon and edges are tested against the throat disk. This catches cap triangles
whose interiors cross the collar even when every vertex lies outside the disk.

| Actual asset | Vertices | Triangles | Vertices inside envelope | Intersecting triangles | CLI exit |
|---|---:|---:|---:|---:|---:|
| Root `quarry-bench.glb` | 27,204 | 13,936 | 105 | 65 | 1 |
| Four named baseline center objects | 150 | 84 | 102 | 60 | 1 |
| Five named `spill-11` blocks | 120 | 60 | 3 | 5 | 1 |
| Final private quarry export | 27,030 | 13,840 | 0 | 0 | 0 |

Root intersections split as gravel 36, rawSteel 12, safetyStripe 12,
blastedRock 5. The four named center meshes account for the first 60; all five
rock intersections in the separate fixture belong to `static:spill-11-4`,
triangles 0, 1, 2, 3 and 10. The other four blocks in that fixture are clear.
The two fixture counts exactly account for all 65 root intersections and all
105 root vertices inside the envelope. Fixture versus merged-root coordinates
have small floating-point differences from Blender joining/export transforms;
the classification is independently performed on each file's actual vertices.

The named fixture establishes object attribution that material-merged shipping
nodes cannot retain. `tools/glbinfo.mjs` remains the sole dimension ruler; the
collision gate reports triangle classifications, not a replacement dimension
table. The implementation report owns full prejoin preservation and source/export
matching; those checks must pass separately.

## Regression and controls

The gate's 12 synthetic algorithm cases run in both windings: 24 assertions,
including an interior-only cap hit, an AABB false-positive control, vertical
clipping, grade/top contact, and tangent/outside cases. The independent critic's
18 malformed/transformed/real-GLB fixture cases and 18 triangle permutations
pass. The critic first reproduced a morph-weight false pass: the narrow static
exporter gate now rejects morphs, skins, animation and GPU instancing explicitly
instead of pretending to classify unexamined deformation.

Missing/empty/unreadable, compressed, sparse, nonfinite and incomplete geometry
fail. The actual root asset and the baseline center fixture are negative controls
and exit **1** under the same contract as the candidate. The controls were rerun
after the gate's final deformation rejection change. They were not relabeled as
success merely because their failure was expected.

## Reproduction

Run from the private checkout:

```powershell
node tools/checkquarrylivecollar.mjs --self-test
node tools/checkquarrylivecollar-adversarial.mjs
node tools/glbinfo.mjs C:/Users/henri/Downloads/drillity-the-game/public/models/sites/quarry-bench.glb
node tools/checkquarrylivecollar.mjs --asset C:/Users/henri/Downloads/drillity-the-game/public/models/sites/quarry-bench.glb --terrain C:/Users/henri/Downloads/drillity-the-game/src/world/terrain.js --json .bak/quarry-live-collar/root-baseline-collision.json
node tools/checkquarrylivecollar.mjs --asset .bak/quarry-live-collar/baseline-center-authored.glb --json .bak/quarry-live-collar/baseline-center-collision.json
node tools/checkquarrylivecollar.mjs --asset .bak/quarry-live-collar/spill-11-authored.glb --json .bak/quarry-live-collar/spill-11-collision.json
python .bak/quarry-live-collar/record_spill.py
node tools/checkquarrylivecollar.mjs --json .bak/quarry-live-collar/candidate-collision.json
```

The three baseline/fixture collision commands intentionally fail. JSON files and
matching logs preserve exact witnesses, paths, hashes, counts and methodology.

## Provenance

SHA-256:

| Input | SHA-256 |
|---|---|
| Root original quarry source, raw bytes | `a791c5a64c156497ef758205cf0cae2bb7c175d80b9259e759ea69dda0b38b91` |
| Root actual quarry GLB | `61a93902888f54b9913fdda690f308008dae8a80cb5b2b2e10208e4d219428dd` |
| Final private quarry source | `b0b750e43cd08dc3d0ae76f3322ffdc7848161e90d6b4949e78685c74a1705d4` |
| Final private quarry GLB | `5b53090ed7c92c89be48e4dcf668a7400634aa62eb3d7b89482c4cfc7db78930` |
| Root and private live terrain source | `ff23ce1428b84e4d95dbfad5caa097dbdb97b548f55e07544345fe9f08318cf5` |
| Sole ruler `tools/glbinfo.mjs` | `057bb6c89e0e8d974e2182b5db758e37c10b2254c3cd18409e8a097fab17cc11` |
| Collision gate `tools/checkquarrylivecollar.mjs` | `80aabff0432262e2802c9c30ee35a173aac5a69084f1e80c9cb1c15ea3bfe445` |
| Four-center named Blender fixture | `6294201e52ca560b913b1fb9d9d493413fed8a1ae10ef44428fe102711d22dab` |
| Five-spill named Blender fixture | `97059471e442a44c68770feb27dfc183baf5534dcb443c5edf2822f8ccdd9cc8` |

Root reports `site.py` raw bytes differ from private baseline only by newline
format, with no `git diff --no-index` content difference; `rig.py` raw hashes
match. This report does not treat a root historical export as automatically
reproducible from a candidate without the independent source/export checks.

## Rendered evidence and remaining acceptance

No rendered findings are claimed here. In particular, the original description
of a duplicate cylinder intersecting the puddle does **not** prove z-fighting:
its side crosses the puddle plane and its top is at a different height. No pixel
artifact, runtime draw call, FPS or player-visible improvement follows from this
CPU test alone. The parent owns rendered evidence under the shared GPU lease.

## Final candidate CPU acceptance

The final matching private GLB passes: **zero intersecting triangles and zero
vertices inside the live envelope**, among 13,840 triangles / 27,030 vertices.
The six material primitives remain; total reduction is 96 triangles / 174
exported vertices / 6,144 bytes. These are file/geometry counts, not GPU savings.
`candidate-collision.json` and its log preserve the positive control. The root
baseline was immediately rerun under the same frozen gate and still exits 1
with its 65 intersections. Root also independently reproduced the candidate's
zero-hit result against the identical asset hash.

I read `authoring-report.json` and independently compared its frozen source and
asset hashes to the files and the collision report. They match exactly. Its
actual prejoin comparison records 1,030 original objects and 1,025 candidate
objects, with precisely `flag-4`, `flagpin-4`, `shot-collar-4-0`, `stem-4`, and
`spill-11-4` removed. All **1,025 survivors are bit-exact**, including UVs, in
the final run. The earlier unchanged-source hopper UV variation did not recur
in that final comparison; no alternate-UV acceptance branch was needed.

CPU acceptance is complete. Rendered visual acceptance remains the parent's
separate GPU-lease responsibility; this report supplies no rendered claim.
