# Nordic clear-air fog candidate — pending valid matched captures

Status: UNACCEPTED, isolated and unmerged at the 76%-used wind-down checkpoint. The second new capture completed the Nordic morning pair, with exactly matched cameras and state, but was rejected for different particle geometry and wind. The final random-stream and frame-counter repair is critic-reviewed and frozen, but has never been captured. No accepted matched source pair exists. The first attempt and old regional-fog captures remain rejected. This report makes no visual pass or frame-rate claim.

## Source and production change

Fresh detached worktree: `drillity-next-nordic-fog`, parent `a47de8a6ba199eabb108da447cd660f01c1735e7`, overlaid with all 300 files of the immutable `drillity-coordination/resume-70-baseline-2026-09-08` snapshot. Its full manifest is retained at `evidence/nordic-fog/source-baseline-manifest.json`. The snapshot name is historical; the latest work cutoff is 80% weekly USED, with wind-down at 75%.

Only production delta: `evidence/nordic-fog/nordic-fog-delta.patch`, six added lines in `src/core/env.js`. Baseline SHA-256 `af2afb3afbae2b49965e0673fa42f46d4fbf6b3de9e7e15d3e8ad2b4caca8511`; candidate `3d218dd6d95fa79c1aad2b4872e910f577d214b0531ab8d2095f796f0bd6bcea`.

The Nordic recipe retains its existing base fog for weather and mixes 70% of its existing sky tint into clear-air fog, with clear density 0.0034. These are art-direction authoring values, not sourced physical atmospheric constants. The shared low-sun warming stays intact. At morning/noon/dusk, the actual CPU solver gives candidate fog sRGB `#c1c4c4`, `#adbfcc`, `#c6aca1`; baseline is warmer. No sun, lighting or exposure values change.

## CPU evidence

`node tools/checknordicfog.mjs`: 240 surface cases; only the six Nordic clear cases change, and only fog. All 120 underground cases match. These checks exercise the real public environment API from the actual pinned baseline and candidate sources.

`node tools/measurenordicfog.mjs evidence/nordic-fog/baseline.json --baseline` and `node tools/measurenordicfog.mjs evidence/nordic-fog/candidate.json` generate the real solver expectations, including source hashes. Output files intentionally refuse overwrites.

`node tools/checknordicfog-capture-controls.mjs`: the exact main frame function is extracted and tested in a CPU context. Boot/title updates continue; automatic gameplay updates are held; manual steps use exact dt and create no additional RAF loop. The source injection is reversible to the original main module. Twenty synthetic negative controls and all five actual previous failed camera pairs are rejected, including projection error 0.000139734767 and orbit world-matrix error 48.6912916885.

## Capture design and limits

Run only with the `next-nordic-fog` GPU lease: `node tools/capture-nordic-fog.mjs --out evidence/nordic-fog/captures-01`. Its Vite server owns port 5232 only. The served main-module injection and executed capture/control source files are copied into each evidence directory, with hashes. Baseline/candidate environments are served as actual source variants; the rest of the frozen source and public assets are hashed before and after.

Each source context boots real assets and creates the same seeded generated unpaid QA contract, with the selected rig and supported default method loadout installed before `startDemoContract`. The actual simulator method/bit is asserted. Public QA depth seeking establishes six metres; the sim receives dt=0 while 64 exact manual render/update frames settle the scene. This is not a paid career transaction or a playthrough.

For each pair, both variants receive the exact observed baseline surface and section camera state: type, transform, matrix/world/inverse, projection/inverse, fov, aspect, clipping, zoom, film settings, orthographic fields and view offset. Camera hooks operate before AO and color passes. Every observed `gl.render(scene,camera)` call for either band records and verifies the actual camera. This fixes the earlier comparison failure without changing matrix tolerances.

Snapshots contain complete public game state and simulator state, clocks, canonical scene paths, transforms, geometry attribute/index byte hashes, material properties and recursive uniforms, texture pixel/mipmap hashes where CPU-readable, and geometry/material/texture/image-source sharing. Scene environment/background controls and section fog are included. Glass descriptors record actual boxes, projected centers, material names and center-ray hits; the images still require visual review for useful glazing coverage and new veiling.

Explicit snapshot limitations: GPU render-target texture texels are not read back; they carry dimensions and canonical source/sharing descriptors. File hashes, fixed shader inputs, scene environment controls and matched images provide the bounded evidence. Runtime object UUID bookkeeping is recorded separately from canonical resource topology. Only exact raw UUID value paths may differ between fresh contexts. Engine cache/listener/version bookkeeping is excluded as listed in the raw snapshot scope. No whole state or scene graph is dropped. Only Nordic fog output, the far-field color attribute hash and the cloud horizon fog uniform are permitted production-related differences; every other difference rejects the pair. Surface and section camera checks remain strict.

## Rejected first attempt and narrow lifecycle repair

`evidence/nordic-fog/captures-01/report.json` is `valid:false`: the initial combined QA/menu wait reached its 180-second timeout. There were no page, network, HTTP or console failures; setup was never reached, and no image was captured. The report retains unchanged input/source hashes and successful browser/server closure. Port 5232 was independently verified absent before the GPU lease was released. The exact executed capture, controls and served-main modules are preserved in that directory.

Source diagnosis, independently confirmed by the critic: main sets its phase to ready and then sets `booting=false`; the shell queues its requested menu while `bootHeld`; only a later public `ui.update()` observes progress 1 and calls `releaseBoot()`. Holding all automatic gameplay frames prevented that final shell tick. This is a capture lifecycle defect, not evidence that the product boot failed.

The revised harness first waits for QA, then performs twelve public UI-only steps at dt 1/15 and verifies that game clock and `state.tSec` did not advance. It waits for the shell's real menu callback before setup. No simulation or renderer updates are added to the release sequence. Failure handling now records public boot marks, readiness, DOM, state and a screenshot before cleanup. The explicit `--pairs nordic-hero-0.34` option makes the next attempt a one-pair preflight; the report records that it is not a complete five-pair series. Camera, source and scene identity rules are unchanged.

Capture, scene/simulator control identity and visual acceptance are pending. Preserve failed attempts with their exact executed sources; do not relabel them as matched evidence.

## Rejected second attempt: camera fixed, particle workload differs

`captures-02/report.json` remains `valid:false`, SHA-256 `5af478d5f80c05f0db8bdb30c7d5d4607dae9fc1315f5b4460789dbab7b2c1eb`. Both individual stills passed their within-capture identity checks. Across the two sources, all ten surface/section matrix, world, inverse, projection and projection-inverse maximum errors are exactly zero. Public game state, complete simulator state and glass geometry/material/projection descriptors match. Browser/server closed, port 5232 was verified absent, and the lease was released.

The author inspected both actual PNGs. The candidate horizon is neutral gray instead of ochre, and the machine remains distinct amber. However, the particle plume differs visibly; this pair is not accepted evidence of the fog-only rendering change. The hero view also has foreground equipment obscuring much of the cab, so it cannot by itself prove glazing acceptance.

The 52 unexpected differences have an exact independent classification: 32 full VFX instance-attribute byte hashes, six VFX wind components, five directly fog-driven VFX uniform values, and nine measured loading telemetry values. Author reproduction: `node tools/checknordicfog-pair.mjs`; independent reproduction: `tools/diagnosenordicfog-critic.mjs`. Both leave the raw report rejected. Actual measured timings are preserved and are not an FPS claim.

`sim/vfx.js` captures the original `ctx.rand` object in `createVFX`; replacing `ctx.rand` during QA setup does not reset that retained object. The revised harness reseeds all six public methods on the original object in place, then retains a separate QA contract stream at the original seed. Thus the exact existing contract/site is preserved while the VFX-held stream has a declared seed. This is a source-supported repair hypothesis until full geometry and wind match in a new capture. Private VFX time already matched exactly. Its gust timer starts at three simulated seconds, and clears do not zero inactive particle buffers; the full-buffer gates remain intact.

The report now records both seeds, retained-object and method identity assertions, separate context-stream identity, complete `vfx.stats(true)` and `getWind()`. The CPU check proves all six methods reset correctly and that VFX draws do not consume the separate contract stream. It still rejects all 38 particle/wind differences in the old pair.

Cross-source telemetry handling enumerates only actual asset-slice counters/timings and GLB fetch/parse timing paths; no rig metadata or asset identity object is dropped. The five additional legitimate fog paths are restricted to the actual `vfx:surfaceSoft` and `vfx:surfaceAdd` owners and must equal the real surface FogExp2 source inputs. Additive fog target remains black. Wind, instance geometry, section VFX, other material inputs, all state and all camera gates remain exact. Seven additional negative controls reject wrong wind, geometry, rig primitive count, state, material properties, additive target and fog density.

Before the next run, source review identified one more boot-history input: main's private `fpsAccum`/`fpsFrames` affect when the first public clock FPS recomputation occurs, and VFX uses that value for adaptive emission density. The recorded main-only diagnostic injection now exposes a helper resetting those two counters once beside the existing public clock reset. It records before/after counters and verifies zero. All subsequent manual updates retain the real accounting pipeline. An actual-frame CPU test starts from two different boot histories and proves identical 64-step schedules afterward; the first seven values are 60, then 15 from the fixed 1/15 manual steps. These are diagnostic input schedules, not measured performance. No per-frame FPS substitution is used.

The pair classifier additionally requires finite nonnegative numeric telemetry (integer counters) and unique named VFX layer owners. Its negative-control count is now thirteen, including missing/string/NaN/negative/fractional telemetry and duplicate layer ownership.

## Final frozen preflight for the next owner

Final capture SHA-256 `01260a551670da8a094f6d1d1aa9b871005c19db43d89abcda8cf2e261e345da`; controls `83250843f3ce04c400337139661d660be9c865c15c29bfea5133d771d610f4d3`; pair classifier `b1209b1f6d8b8210cfda46abc572b230b21e5a4494cde3ebedd0d96b38c99e46`. Critic approved this exact preflight source; execution remains pending. No further GPU work was authorized in the wind-down cycle.

After a fresh exclusive lease and unchanged source/public-asset verification, run `node tools/capture-nordic-fog.mjs --out evidence/nordic-fog/captures-03 --pairs nordic-hero-0.34` from the isolated candidate. Stop and retain evidence on any failure. Only after the one-pair result passes independent complete-scene and visual review should noon, dusk, orbit glass and Sahara control be captured. The morning hero is not sufficient glazing evidence because foreground equipment obscures much of the cab. No patch should be integrated until the full intended set is accepted.
