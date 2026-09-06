# Quarry live collar — CPU-reviewed delivery; rendered review pending

Private checkout: C:/Users/henri/Downloads/threads/drillity-quarry-live-collar
Branch: codex/quarry-live-collar
Baseline: 37f92a48abfd4ce3a20654359cb869dcd46ba25d

## Delivered scope

Scoped patch: [quarry-live-collar.patch](quarry-live-collar.patch)
Patch SHA256: c89337a1070a906cce7ba2c23a1050179472b5caf1fc9e533af11524101d9cba
All nine source/tool/report file hashes: [manifest](quarry-live-collar-manifest.json).
Production changes ONLY blender/sites/quarry_bench.py. Matching ignored asset:
C:/Users/henri/Downloads/threads/drillity-quarry-live-collar/public/models/sites/quarry-bench.glb

Source SHA256: b0b750e43cd08dc3d0ae76f3322ffdc7848161e90d6b4949e78685c74a1705d4
Asset SHA256: 5b53090ed7c92c89be48e4dcf668a7400634aa62eb3d7b89482c4cfc7db78930
Asset: 955160 bytes, 6 primitives, 13840 triangles, 27030 vertices.
Original root asset: 961304 bytes /13936 triangles;
SHA256 61a93902888f54b9913fdda690f308008dae8a80cb5b2b2e10208e4d219428dd.
The generated GLB is intentionally separate from the source patch; root pairs them.

## What changed and what was verified

Removed the exact live-origin shot-collar-4-0, stem-4, flagpin-4 and flag-4,
while preserving the original pattern list and seeded indices. Actual exported
geometry independently found one additional opaque scatter block spill-11-4
over the same live throat; removed that one only. No new clearance dimensions.

Actual Blender source comparison: 1030 ->1025 objects, exactly five removed,
all1025 complete surviving object signatures bit-identical (including UVs).
All other23 pattern positions,59 spill blocks, conveyors and four anchors preserved.
No shared library, terrain, renderer, material, other site or Claude module edit.

Actual-root-GLB negative control:65 intersecting triangles, exit1. Center fixture
contributes60; isolated real spill fixture5. Final matching export:0/13840
intersections, exit0. Classification uses actual transformed triangle vertices,
after glbinfo parsing/measurement. No AABB approximation or second dimension CLI.
The tested volume is the live throat disk swept grade-to-live-casing-top,
parsed from terrain.js; it is authored runtime ownership, not engineering clearance.

Collision self-test12cases/24assertions; independent18malformed/geometry cases
plus18permutation assertions pass. Six authoring negative controls reject.
Independent critic found and fixed gate omission of active morphs; unsupported
animated/skinned/morphed/instanced assets now fail closed. Root task independently
reran final collision/glbinfo and compared1025survivor hashes and six controls.

Earlier Blender runs exposed one-ULP UV variations on unchanged crusher body/
hopper. Unchanged-source controls reproduced them; no plant geometry or numeric
tolerance changed. Final run had ZERO differing survivor signatures and used no
alternate UV control. Failed-run evidence is retained; do not promise byte-stable
GLBs across every export. Current verifier includes full-payload control assertion.

Evidence: private .bak/quarry-live-collar/authoring-report.json,
authoring-full-payload-postcheck.json, candidate-collision.json,
root-baseline-collision.json, baseline-center-collision.json,
spill-11-collision.json and corresponding original Blender fixtures.
Human-readable reports: private research/sites/quarry-live-collar*.md.

## Reproducible commands (private checkout, PowerShell)

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python-exit-code 1 --python tools/verify_quarry_live_collar.py
node tools/glbinfo.mjs --parts public/models/sites/quarry-bench.glb
node tools/checkquarrylivecollar.mjs --json .bak/quarry-live-collar/candidate-collision.json
node tools/checkquarrylivecollar.mjs --asset C:/Users/henri/Downloads/drillity-the-game/public/models/sites/quarry-bench.glb
node tools/checkquarrylivecollar-adversarial.mjs
```

Original asset command MUST exit1; candidate command MUST exit0. Blender needs
--python-exit-code1 because default invocation returned0 after an assertion.

## Render queue, process state and root handoff

No rendered acceptance or FPS claim. The earlier z-fighting wording is unproven:
the puddle is inside the solid cuttings cylinder, not coplanar with its caps.
No screenshot/GPU capture was made or seen for this task.

GPU request: [quarry-live-collar.gpu-request.md](quarry-live-collar.gpu-request.md).
Exact lease quarry-live-collar was never granted. Private Vite startup failed
before binding: esbuild Cannot read directory "../../..": Access is denied,
then private vite.config.js could not resolve. No escalation, bypass,
alternate-config workaround or retry was attempted. No owned browser/server/
export is running. User5178 and root5198 were untouched; root inputs read-only.

Prepared capture: node tools/checkquarrylivecollarbrowser.mjs --port 5207
It hard-requires the exact GPU lease and
a permitted preview. Four baseline/candidate uncased/cased states; actual phone
views and labelled isolated site/live-collar diagnostic views. Open the images
before any visual acceptance. This capture has syntax/source review only.

Root handles patch review, source/asset integration and rendered verification.
No push, merge, deployment, original-repo write, approval request or archive here.
Scoped patch passes git apply --check --reverse in the private checkout and
git diff --check. The original repository was not modified for this check.
Active pool last independently checked9% remaining; no new long jobs begun.
Preserve all private WIP/evidence. Do not archive this task until root completes
review, integration and verification.
