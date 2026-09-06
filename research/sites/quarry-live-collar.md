# Quarry live collar correction

Baseline: `37f92a48abfd4ce3a20654359cb869dcd46ba25d` on private branch
`codex/quarry-live-collar`. Production scope is `blender/sites/quarry_bench.py`
and its matching generated private quarry GLB. Root integration is separate.

**Final CPU result: PASS. Rendered acceptance: PENDING.** The actual matching
export has zero intersecting triangles out of13,840, with27,030 vertices
measured. The final authoring comparison removes exactly5 of1,030 objects;
all1,025 survivors are bit-identical, including UV data. Other23 pattern
positions,59 scatter blocks and the earlier conveyors remain unchanged.

Candidate source SHA256:
`b0b750e43cd08dc3d0ae76f3322ffdc7848161e90d6b4949e78685c74a1705d4`.
Candidate GLB SHA256:
`5b53090ed7c92c89be48e4dcf668a7400634aa62eb3d7b89482c4cfc7db78930`.
GLB size955,160 bytes;6 primitives and4 named site anchors. The previous export
was961,304 bytes and13,936 triangles. These are file/geometry counts, not FPS.

The original source explicitly places one shot hole at the live collar. Its
helper emits a capped cuttings cylinder, then the module places stemming,
a pin and a flag there. The correction reserves that exact pattern position
for terrain.js's live throat/cuttings/casing, retaining the original pattern
list so every other hole keeps its deterministic index and variations.

Independent actual-export analysis found one additional opaque scatter block,
`spill-11-4`, intersecting the same throat. Its isolated actual Blender export
accounts for exactly the five rock triangles not explained by the four center
objects. Remove only that block; preserve the other 59 spill blocks. No new
engineering clearance number, physical dimension or material is introduced.

## Evidence categories

- Source: exact original module, shared helpers and live `buildCollar()`.
- Authored geometry: actual prejoin Blender objects, including independent
  center and spill fixtures; survivor comparison covers the whole site.
- Exported geometry: `tools/glbinfo.mjs` parses/measures actual vertices.
  The dedicated gate classifies actual transformed triangles after clipping
  against the live grade-to-casing-top interval. It also catches triangles
  crossing the throat with all three vertices outside it.
- Rendered evidence: **pending**. No rendered acceptance or FPS claim.

Original root GLB SHA256:
`61a93902888f54b9913fdda690f308008dae8a80cb5b2b2e10208e4d219428dd`.
It has 6 primitives, 13,936 triangles, 961,304 bytes and 65 intersecting
triangles: gravel36, rawSteel12, safetyStripe12 and blastedRock5. The actual
center fixture contributes60; the independently exported spill fixture5.

The radius/height used by the regression come from the current runtime throat
and casing. They define ownership of a drawn opening, not a real-world safety
distance or a sourced blasthole diameter. Existing unrelated site dimensions
and provenance gaps are not recertified by this change.

The source supports intersecting opaque geometry. It does not establish the
earlier reported z-fighting: the puddle plane is inside the cuttings solid,
not coplanar with its horizontal caps. The helper uses base-origin cylinders,
so the actual flagpin top is0.62m; a centered-cylinder inference was withdrawn.

## Verification commands

Run from the private checkout, using the installed Blender executable:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --threads 2 --python-exit-code 1 --python tools/verify_quarry_live_collar.py
node tools/glbinfo.mjs --parts public/models/sites/quarry-bench.glb
node tools/checkquarrylivecollar.mjs --json .bak/quarry-live-collar/candidate-collision.json
node tools/checkquarrylivecollar.mjs --asset C:/Users/henri/Downloads/drillity-the-game/public/models/sites/quarry-bench.glb --json .bak/quarry-live-collar/root-baseline-collision.json
node tools/checkquarrylivecollar-adversarial.mjs
```

The original root asset is a negative control and must exit1. The source
regression reads the immutable baseline from Git and writes only private
outputs. `--python-exit-code 1` is necessary: Blender otherwise returned0
after a Python assertion during the first preservation check.

An earlier check found one repeated Blender artifact: the unchanged
crusher-hopper differed in20 UV components by one float32 ULP. Three resets
of the unchanged plant source reproduced the exact same alternate UV data.
Another run found8 one-ULP UV differences on crusher-body. Geometry/topology/
material/transforms remained exact. The verifier now requires exact geometry
and accepts only a complete UV signature measured in an unchanged-source
control; it does not introduce a numeric tolerance or alter either crusher
object. **The final successful run used no alternate signature at all:**
all1,025 complete survivor signatures equal their baseline counterparts.
The recorded failed runs remain as evidence of Blender UV repeatability limits.

## Render queue and limits

`tools/checkquarrylivecollarbrowser.mjs` is prepared for four headed states:
baseline/candidate, each uncased/cased. It separately labels normal gameplay
screenshots and isolated actual site/live-collar diagnostic renders with
authored diagnostic camera/lighting. Capture success itself is not acceptance;
the images must be opened and inspected.

It requires exact GPU lease `quarry-live-collar`. This task never received
that lease and launched no browser/GPU capture. The attempted private Vite
startup failed before binding because esbuild was denied directory access
(`Cannot read directory "../../..": Access is denied`). No escalation,
permission change, alternate-config workaround or preview retry was attempted.
The GPU request/checkpoint is in the sibling drillity-coordination directory.

After a permitted preview is available and the exact lease is granted:

```powershell
node tools/checkquarrylivecollarbrowser.mjs --port 5207
```

No full build, player-facing visual acceptance, integration, push or archive is
claimed. User5178 and root5198 were untouched. Source-only, authored and actual
exported evidence remains useful independently of the queued rendered review.

Detailed independent evidence: `quarry-live-collar-repro.md`,
`quarry-live-collar-implementation.md`, and `quarry-live-collar-critic.md`.
Final source/asset hashes and verification result are delivered in the live
coordination checkpoint alongside the scoped patch.
