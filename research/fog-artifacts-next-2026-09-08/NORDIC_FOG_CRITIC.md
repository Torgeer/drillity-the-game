# Nordic fog retry — UNACCEPTED, no further capture this cycle

Status: **UNACCEPTED**. Root ended further fog GPU work during the 76%-used
wind-down. There is no accepted matched source pair. The final repaired
preflight was reviewed but never captured; `captures-03` remains the next
one-pair step for a later authorized cycle. The legacy regional-fog capture
and the new `captures-01` and `captures-02` remain rejected and preserved.

Final reviewed checkpoint: capture harness
`01260a551670da8a094f6d1d1aa9b871005c19db43d89abcda8cf2e261e345da`,
controls `83250843f3ce04c400337139661d660be9c865c15c29bfea5133d771d610f4d3`,
pair classifier `b1209b1f6d8b8210cfda46abc572b230b21e5a4494cde3ebedd0d96b38c99e46`.
The saved 58 independent CPU controls support the prepared harness only.
No additional tests or GPU work were run for this final status update.

The current worktree starts from the immutable 300-file resume-70 snapshot. My
independent hash comparison found only `src/core/env.js` different among those
300 files. The candidate retains the old six-line Nordic clear fog delta,
SHA256 `3d218dd6d95fa79c1aad2b4872e910f577d214b0531ab8d2095f796f0bd6bcea`.
The frozen baseline environment is
`af2afb3afbae2b49965e0673fa42f46d4fbf6b3de9e7e15d3e8ad2b4caca8511`.
No additional AO, geology or rig source change is part of this candidate.

## Why the old captures fail

The renderer has independent damped FOV state and SITE view-offset registration.
Orbit additionally accumulates its own angle. Freezing the public clock and
passing `dt=0` preserves any startup differences already in those values.
Source: `updateSurfaceCamera`, `registerBands` and `setCameraMode` in the actual
renderer. Camera drift itself is disabled; these are separate state paths.

The initial `node tools/checknordicfog-critic.mjs --self-test` run passed 46 gate self-tests
(expanded to 58 at the final checkpoint below).
It rejects all five real historical camera pairs using the original `1e-7`
tolerance. It also rejects missing matrix/lens evidence, NaN, altered view
offsets, viewport, simulation, geometry, geology color, material properties and
material-sharing topology. Output is `evidence/nordic-fog-critic/negative-controls.json`.
These are validation tests, not evidence that a rendered candidate passed.

## Required invariants for the new capture

Both source variants must use the same declared observed baseline cameras at
the actual AO and color render calls. Preserve both surface and section camera
positions, quaternion/scale/up, local/world/inverse matrices, projection and its
inverse, full lens fields and view offset. Validate matrix/inverse consistency,
viewport, buffer, DPR, stage and both bands. A correct-looking snapshot alone is
insufficient if different cameras render the image.

Use real generated contracts and compatible method equipment, preserve public
simulation and complete game-state identity, and explain the fixed-clock capture
controls. The Vite-only frame hook must be exactly recorded and reversible;
neither source variant may receive a separate gameplay or geology intervention.

Canonical scene traversal paths and resource indices must preserve geometry
position/normal/index bytes, scene transforms, material/map values and sharing.
Raw fresh-context UUID values may differ only in the explicit bookkeeping table.
The expected Nordic differences are the real fog output, the specifically named
far-field's baked color attribute, and the cloud material's `uHorizonCol` values.
All additional differences require source-backed explanation before acceptance.

Material serialization must include nested `defines`, extensions, arrays and
uniform structures. Scene-level background, fog, override material and global
environment intensity/texture controls also matter. Glass is a shared material
category; a fog review must not silently recolor lamp lenses or screens.

The runtime fog must exactly match independently generated solver values for
the selected source hash, region and time. A selected disk-file hash alone does
not prove Vite served that source. Nordic outputs must actually differ as
specified; the Sahara control must remain unchanged.

## Approved capture controls

The final reviewed harness SHA256 is
`32f3f039a7177527c9a7ba66c5e614225449a6f8528ee64e7578492d02ebc8bc`;
controls SHA256 is
`fc53071c56c578772c8d88bc17aed472eddf7eaf4cd8530ceb07d5a05687ed56`.
Root granted one five-pair run under the `next-nordic-fog` lease on port 5232.
I confirmed these bytes before the author launched. This is permission to run a
fail-closed diagnostic, not approval of its eventual images.

The controls now use a recorded reversible replacement only at the real main
frame entry. Automatic title/boot frames remain active; automatic gameplay
frames hold. Manual frames use the exact requested delta, followed by held
captures. Both source contexts receive the same full canonical observed cameras
through the actual camera update methods. The real renderer's AO and color calls
record which cameras they receive. Supported defaults and selected GLB load
before the generated preview starts; actual simulation method and bit are checked.

Nested material values and scene-level lighting/override controls are captured.
Each snapshot independently hashes image/canvas contents, with shared-resource
deduplication confined to that snapshot. Ray evidence now checks all ancestors'
visibility. Real source-hashed solver expectations guard against a stale Vite
environment module passing with identical fog in both variants.

Run `node tools/checknordicfog-critic.mjs --report <capture-directory>` only on a
finished report; it refuses rejected or incomplete evidence. It independently
checks complete camera matrices and inverses, actual AO/color observations,
the limited source delta, full unaltered state/scene identity and precise allowed
fog/UUID differences. The checker has not yet accepted a rendered set.

### First retry failed during boot; second preflight reviewed

The new `evidence/nordic-fog/captures-01` run timed out before setup while waiting
for QA and Menu together. No images or scene comparison were produced. Its
report remains `valid: false`, with unchanged inputs and closed browser/server.

Independent source review identified a deadlock in the diagnostic: main marks
`booting = false` before the shell consumes its final ready-progress tick. The
frame hold then prevents `ui.update()` from calling `releaseBoot()`, while the
shell queues `show(Menu)` behind `bootHeld`. The original failure lacked a final
public boot-state snapshot, so that state is a source-derived explanation rather
than a recorded private-variable observation.

Revised harness SHA256
`f13ceef1400e8350486efcaeb08bcf7d8e542de0a0f4112b6de6a2e75fbc9f2f`
was reviewed for one-pair `captures-02` preflight. Controls remain `fc53071c…`.
It waits for QA, drives 12 bounded public UI-only ticks, proves the game clock
and `tSec` did not advance, and then waits for the real Menu callback. It records
DOM and public boot/QA state plus an image on failures before cleanup. A declared
one-pair preflight cannot be presented as a completed five-pair series.

### Second preflight: camera repair works, VFX mismatch rejects acceptance

`evidence/nordic-fog/captures-02/report.json` is preserved with `valid: false`.
Its SHA256 is `5af478d5f80c05f0db8bdb30c7d5d4607dae9fc1315f5b4460789dbab7b2c1eb`.
Both individual captures stayed exactly unchanged while their PNG was taken.
The paired surface and section matrix, world, inverse, projection and projection
inverse errors are all exactly zero. The full camera metadata, actual render
observations, public state, simulation, glass descriptors, clock, viewport,
bands, UI geometry, quality, DPR and drawing buffer also compare exactly.
The source manifests and archived inputs remained unchanged; browser and server
cleanup succeeded.

The complete pair nevertheless has 52 rejected differences: 32 particle
instance-attribute hashes, six wind components, five fog-derived particle
uniform values and nine asset timing fields. The geometry belongs to the actual
`vfx:surfaceSoft`, `vfx:surfaceAdd`, `vfx:sectionSoft` and `vfx:sectionAdd` meshes.
None of that geometry or wind may be excluded from the identity requirement.

The independently viewed PNGs show the intended neutral gray horizon and similar
near paint, but the exhaust and visible particles differ. These remain rejected
visual evidence. There is no valid noon, dusk, orbit or Sahara set yet.

Source diagnosis: `createVFX` captures the original `ctx.rand` object at
`src/sim/vfx.js:3089`; the harness later replaces `c.rand`, leaving the VFX
reference untouched. The proposed diagnostic reseeds all six methods on that
original object, then retains the existing separate seed-3 QA stream so rig
events cannot change the contract/site selection. The exact earlier random
consumer sequence is not recorded, so this is a source-supported repair
hypothesis pending rendered identity verification.

Run `node tools/diagnosenordicfog-critic.mjs` to reproduce the independent raw
capture checks and actual `makeRandom` retained-reference test. It records
`evidence/nordic-fog-critic/captures-02-diagnosis.json`, explicitly `accepted:
false`. `node tools/checknordicfog-critic.mjs --report
evidence/nordic-fog/captures-02 --preflight` correctly exits 1 because the capture
is rejected.

The five particle fog values are direct surface FogExp2 propagation in
`vfx.js:3860–3873`; any later allowance must identify the actual owned particle
layers and equal the source-hashed fog solver exactly, including a black
additive target. The timing differences originate in asset gate counters
(`assets.js:945–950`, `5126–5130`) and GLB fetch/parse durations
(`gltfRig.js:720–721`). These justify only explicit timing bookkeeping paths,
not dropping asset metadata or material records wholesale.

### Third preflight preparation reviewed

The reviewed next harness is `b0ca9866f8fa66ba1412c425fb6538f200c68032e4e7f3c47ce161a2e449b60c`,
controls `c7bc9e74aaf18f247d303e33b6c384aaca2b455f5cb5a68392e1011291032d40`,
and pair classifier `b1209b1f6d8b8210cfda46abc572b230b21e5a4494cde3ebedd0d96b38c99e46`.
It records separate visual and QA seeds, verifies retained object identity and
all six reseeded method references without consuming them, and snapshots actual
deep VFX stats and public wind. No particle buffer or wind allowance was added.

Specific load timing fields are now normalized for comparison only after finite,
nonnegative numeric checks; scheduling counters must be integers. Raw values
remain in the evidence. Surface particle fog values require unique owning
meshes and exact agreement with FogExp2; the additive target stays black.
The independent checker implements its own normalization, additionally compares
the full surface scene fog with the solver output and validates all snapshots,
input hashes, random controls, VFX stats and geometry.

`node tools/checknordicfog-critic.mjs --self-test` now passes 58 controls, including
the real rejected VFX pair, changed wind/geometry/state/asset structure, wrong
fog values, malformed timing fields and duplicate particle owners. The author's
13 classifier negatives also pass independently. These are CPU results and a
reviewed next preflight proposal, not a successful rendered retry. The shared
GPU lease still requires root's explicit grant.

Before launch, the author found a further deterministic input: main's private
`fpsAccum` and `fpsFrames` retain boot history even when the public clock is
reset. VFX reads the resulting `clock.fps` for adaptive particle demand
(`vfx.js:4860–4862`). The earlier third-preflight hash is therefore on hold.
A proposed recorded helper resets only those two counters once at the existing
QA boundary, preserving subsequent real frame updates. It needs source review
and a CPU test that different boot histories converge to the same FPS schedule
before the next GPU grant. No geometry or wind comparison may be removed.

That correction is now reviewed: capture harness
`01260a551670da8a094f6d1d1aa9b871005c19db43d89abcda8cf2e261e345da`,
controls `83250843f3ce04c400337139661d660be9c865c15c29bfea5133d771d610f4d3`,
with the same `b1209b1f…` pair classifier. Independently rerunning
`node tools/checknordicfog-capture-controls.mjs` passed the actual source-frame
test. Different boot histories now produce the same 64-step FPS schedule:
60 for seven steps, then 15, because this still harness advances at fixed 1/15
second. This is deterministic frame accounting, not measured performance.
The 20 existing controls and five historical camera rejections also remain.
The revised helper is limited to a once-only reset of `fpsAccum` and `fpsFrames`;
normal subsequent main-frame accounting is unchanged. Final one-pair preflight
signoff has been sent to root; capture results remain pending.

## Explicit limits

GPU render-target textures are represented by descriptors and source/input
provenance, not pixel readback. Do not call all texture contents byte-identical.
The environment PMREM uses a separate `skyIBL` scene; the cloud-horizon fog color
is not itself added to that bake. Final glass and paint appearance still requires
actual images.

This critic has launched no browser or GPU process. The qualitative improvement
in the old images remains useful direction, not matched acceptance, and no FPS
or physical-phone result follows from this work.
