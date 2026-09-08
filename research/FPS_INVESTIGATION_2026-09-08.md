# FPS investigation — 8 September 2026

**The reported 34–47 FPS slowdown remains unexplained.** Three completed captures establish the cost of specific frozen render states on this desktop. They do not reproduce sustained slow frames, measure the active simulation path, demonstrate a performance fix, or certify a phone. The next experiment should capture the live path before freezing it, without changing graphics features.

This report was regenerated from the raw artifacts and the actual profiler source. It supersedes rounded checkpoint summaries where the statistical convention differs. Production changes integrated after these captures require fresh acceptance evidence; these measurements belong to the source manifest below.

## Evidence identity and acceptance

All paths in this report are relative to the `drillity-fps-investigation` repository unless another worktree is named. The three accepted directories are:

| Directory under `evidence/fps/` | Capture start, UTC | End, UTC | Completed windows |
| --- | --- | --- | ---: |
| `oil-derrick-orbit-frozen` | 07:53:13.629 | 07:54:30.233 | 24 |
| `oil-derrick-hero-frozen-retry` | 08:01:16.156 | 08:02:25.395 | 24 |
| `longhole-rig-orbit-frozen` | 07:58:57.074 | 08:00:11.991 | 24 |

Every report records `valid`, `completed`, `sourceUnchanged`, `browserClosed`, and `serverClosed` as true. Every window assessment passes. Each report has zero page errors, failed requests, and HTTP failures. Warnings remain: 12 in each oil run and one in the longhole run; they are discussed below and must not be called zero-warning captures.

The three before/after source manifests are identical, containing 442 files each. They include source, public assets, installed Three sources, and the profiler. SHA-256 of the canonical manifest JSON, using Python `json.dumps(manifest, sort_keys=True, separators=(',', ':')).encode()`, is:

`5e6a1aa2c67bc20ef42aafe5bffa040e635588cd678324b8f5d849358142d5ef`

The captured and reviewed `tools/profileframes.mjs` is 32,620 bytes, SHA-256 `096c503b5004f566fe1c5a3f54d1952b1f921a8fd233e19e12a4b7f12abc1b7c`. The captured `src/core/renderer.js` is 141,939 bytes, SHA-256 `f33ae38987c61e53c3621dcef2d9297063c155ba884de9a6d9474d11eab2c542`. Do not replace either identity with today's integration HEAD: the artifact manifest is the actual captured source record.

| Directory | `report.json` SHA-256 | `cpu-frozen.cpuprofile` SHA-256 |
| --- | --- | --- |
| Oil orbit | `f7c8083483be8a908764c8a0ff2056b4923bfe7e98aa05a753ee639e51cf9e9d` | `9d3d62260acdf3c596912134780e20a30f05f563893375ebe6fc9ce6234ff4d4` |
| Oil hero retry | `1232112ba72091bf9a4c2bb45b97f4ea1ef1ddf883b79056f9743451d39ee47e` | `9ad43f83ef76c4d2d4146134d11cd2692c08d448688b67c1ac15fc676bc87734` |
| Longhole orbit | `71f528a11d97ca227527bbf6534c485232df520b9c7cb30b037926cdaface1e8` | `97c9959b03c7636457075c02bb2ee6346cb14b20d473bee8354d275cc110bbcc` |

Each directory also contains its actual `baseline.png`; these are diagnostic capture records, not current graphics approval.

## What was measured

The recorded adapter is **NVIDIA GeForce RTX 4070 Laptop GPU**, through ANGLE Direct3D11, on Windows headed Chrome 152.0.0.0. The viewport is 390×844 CSS pixels, DPR 2, high quality, actual GLB rigs, visible and focused SITE screens. This is desktop hardware with a mobile-sized viewport.

The tool waits for all generated texture sets and shader readiness, allows live settling, and then wraps every original system update and renderer call with `dt=0`. It restores the frozen clock at the first system each frame. It does not omit the update functions or write simulation internals during freezing, but zero dt prevents fixed simulation substeps and animation advancement. A state marked `active: true` in the JSON therefore does not mean active drilling work was timed.

Each unwrapped baseline contains 180 RAF intervals. CPU/query wrappers are absent from that baseline, while frozen adapters and per-frame identity checks remain. The instrumented window separately contains 180 intervals, 181 counted render calls, and 30 GPU queries. GPU queries surround the complete `renderer.render` call every sixth render and drain asynchronously. All GPU-enabled windows have complete created/completed/deleted accounting, no disjoint events, discarded queries, pending queries, or query errors. These checks establish query integrity; they do not explain variation between elapsed-time samples.

The following statistics are calculated directly from the raw arrays. Median is the average of the two central observations for an even sample count; p95 uses nearest rank, `sorted[ceil(0.95*n)-1]`. Times are milliseconds.

| Frozen case | RAF mean | RAF median | RAF p95 | RAF maximum | Renderer GPU median | GPU p95 | Inclusive render CPU/call |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Oil orbit | 7.565 | 6.900 | 7.100 | **62.700** | 5.136384 | 6.594560 | 2.973481 |
| Oil hero retry | 6.948333 | 6.900 | 7.100 | 7.200 | 5.235712 | 6.039552 | 2.329834 |
| Longhole orbit | 6.947222 | 6.900 | 7.100 | 7.300 | 6.078976 | 6.907904 | 2.968508 |

The earlier checkpoint's GPU values 5.188608 / 5.274624 / 6.108160 ms select the **upper** central observation, `sorted[n//2]`. They come from the same samples, not another capture. The conventional medians above make the calculation explicit.

Oil orbit has two baseline intervals above 33.3 ms, one above 50 ms. Its p95 alone hides those spikes. Its separate CDP window also has a 41.7 ms maximum. Neither spike has been attributed to a cause. The instrumented oil-orbit window's mean is 6.947778 ms, so comparing its smoothness with the separate baseline does not prove instrumentation improved performance.

Inclusive render CPU totals are respectively 538.1999998 / 421.7000000 / 537.2999998 ms across 181 calls. The frozen `system:sim` totals are 16.5000000 / 15.8000000 / 13.7999997 ms, approximately 0.091160 / 0.087293 / 0.076243 ms per update. These small simulation-wrapper values **cannot clear the live fixed-step simulation**. Telemetry is called from other measured systems and renderer child rows overlap their parent. Never add the CPU rows together, or add CPU submission time to GPU elapsed time as an end-to-end frame budget. RAF intervals also include browser/desktop scheduling and are not GPU timings.

The CDP profiles were collected in separate frozen windows with CPU/query wrappers removed. They are sampling profiles, not the matching slow live-frame trace. Their total durations, approximately 1.881 / 1.670 / 1.746 seconds, include CDP start/stop and snapshot overhead around the RAF sample. Large `(idle)` and `(program)` buckets should not be assigned to a game function by assumption.

## Representativeness limits found in the records

The three captures freeze after live settling, not at the requested initial 6 m:

| Case | Frozen depth | Phase | Rods | Ready texture sets | Programs |
| --- | ---: | --- | ---: | ---: | ---: |
| Oil orbit | 36.640637 m | drilling | 2 | 29/29 | 72 |
| Oil hero retry | 38.374120 m | drilling | 2 | 29/29 | 72 |
| Longhole orbit | 23.560608 m | drilling | 12 | 27/27 | 85 |

State/camera equality is enforced **within** a run, including each intervention, but these independent runs do not form a controlled camera-only comparison. Depth, particles, world state, and scene presentation differ. For example, recorded live particle counts are 960 / 1,660 / 958 at the baseline snapshots.

All three snapshots retain starter `auger-flight-std` and `auger-flight-sec-280` in `state.garage.loadout`, with no hammer, compressor, or pump. They were started by the QA preview hook, and each records the unpaid-preview warning. The oil runs also warn about missing `oil-rotary` VFX flush mapping and have `vfx.medium: "air"` while drill/contract flush is mud. Thus these are valid frozen diagnostics of the recorded preview state, not proof of a normal correctly equipped paid career contract or correct oil-fluid presentation. Nine additional oil warnings concern Three texture serialization. None of these warnings by itself establishes the FPS cause.

The saved clock FPS just before freezing is 43.3925 for oil orbit, 65.0631 for oil hero retry, and 103.9376 for longhole. That live counter is a useful lead, but it is a single counter value without a matching continuous live interval/profile record. It is not a fresh sustained-FPS benchmark.

The snapshot's renderer draw totals are 132 / 180 / 185 calls. They describe the renderer's recorded scene frame, not isolated rig draw calls, so they do not test the ≤70-per-rig requirement. No causal conclusion follows from ranking these totals against the separate timings.

## Diagnostic interventions did not isolate the old slowdown

For each available intervention, the tool alternates three pairs in on/off, off/on, on/off order. It warms 12 frozen frames after changing the live object/pass, retains identity checks, restores the baseline, and records another restoration window. Oil has cloud deck, shadow refresh, and AO comparisons; the named airborne-dust object is absent. Longhole has airborne dust, shadow refresh, and AO; its cloud object is not effectively visible. No unique enabled bloom pass is found in any accepted run. An unavailable toggle is **not a measured zero cost**.

Below are conventional GPU-median differences, **on minus off**, for the three pairs in capture order. Positive means the off sample was faster. These are individual observed differences, not an accepted performance saving.

| Case / intervention | Pair 1 | Pair 2 | Pair 3 |
| --- | ---: | ---: | ---: |
| Oil orbit / cloud | +0.207872 | −0.108032 | +1.913856 |
| Oil orbit / shadow refresh | +0.013312 | +0.183296 | −3.325952 |
| Oil orbit / AO | +3.448320 | +0.281088 | −0.071680 |
| Oil hero / cloud | −3.041280 | +0.032256 | −2.945024 |
| Oil hero / shadow refresh | +3.658240 | +0.246272 | +3.379712 |
| Oil hero / AO | +0.213504 | +0.026112 | +2.941440 |
| Longhole / airborne dust | +4.772352 | +0.396800 | −4.019200 |
| Longhole / shadow refresh | +0.049664 | −0.112128 | +4.216320 |
| Longhole / AO | −3.066368 | +0.011776 | +0.041984 |

Several comparisons reverse sign. Even the consistently positive oil-hero shadow/AO pairs vary substantially in magnitude, while their RAF medians remain about 6.9–7.0 ms. This supports further controlled investigation, not removing a feature or naming it as the cause of the historical 25–29 ms oil frame intervals. In particular, shadow refresh suppression retains the existing frozen shadow map; it is not a test of shipping live scenes with shadows removed. AO suppression disables the pass and its renderer-controlled normal/depth prepass together.

## Historical and rejected evidence must remain distinct

Claude's `drillity-claude-sites/shots/gpu-report.json`, dated 6 September 2026 at 15:17:40.314 UTC, has SHA-256 `c1a2671ab659f37e948cb46a9d3941aa158941d3353049efedd6213a5e7defba`. Its relevant rows are:

| Historical row | Actual rig / camera | Reported FPS | RAF ms / worst | Samples | State at identification |
| --- | --- | ---: | --- | ---: | --- |
| `m12-oil-rotary` | oil-derrick / hero | 39.7 | 25.2 / 90.6 | 39 | 720.31 m, drilling |
| `r12-oil-derrick` | oil-derrick / orbit | 34.4 | 29.1 / 50.8 | 39 | 27 m, rod-add |
| `r17-longhole-rig` | longhole-rig / orbit | 47.4 | 21.1 / 26.0 | 39 | 16.23 m, drilling |

All three rows report warm session/stop status, zero program delta, actual GLB identity, and a fitted starter auger with `fits: false`. These are RAF-derived figures; this report does not contain a corresponding GPU frame-time trace for those rows. `oil-rotary` is the method row for the same oil-derrick rig, not another slow machine. The later frozen cases differ in state and depth and cannot be used as a before/after fix comparison.

The handover's statement about 16 samples across three runs is a historical author claim. This report verifies the three raw rows above; it does not independently reconstruct that aggregate or extend it to every rig. The historical report lacks the new profiler's full before/after source manifest. Its existing warm-up discussion also explicitly labels older pre-warm-up reports unreliable for comparative FPS. Preserve those distinctions.

Two local directories are excluded from accepted comparisons:

- `evidence/fps/oil-derrick-orbit`: exploratory live/drifting capture, predating the frozen validator. Its 180-interval baseline median is 13.9 ms and its separate 240-interval instrumented median is 7.0 ms. Different state/camera over those windows prevents interpreting that difference as an improvement. It has no version-2 validity or unchanged-source verdict. Preserve its report (`728c0087926486fb3d71e24b49ef42ce7d100c03e50cac2a6cb54a133c4a3fbc` SHA-256).
- `evidence/fps/oil-derrick-hero-frozen`: aborted after 21 windows with `Target page, context or browser has been closed`; `valid: false`, despite closed owned browser/server and unchanged source. Its baseline median was 16.4 ms, not the successful retry's 6.9 ms. The unfinished run is not accepted, but neither should its different pacing be erased or presented as a measured fix. Preserve its report (`e56439ca314b72aba1f19928de778c45faa9320011bd6276de11271c88ad6203` SHA-256).

## Next minimal live-path experiment — proposed, not run

Start with **oil-derrick in orbit**, because the historical slow row is specifically the 27 m rod-add state and the new profiler recorded a low live clock immediately before freezing. Keep the current source and all graphics features unchanged throughout the experiment. Do not start with another broad fleet sweep or simultaneous source edits.

1. Add a bounded diagnostic mode to the existing profiler's capture harness, reusing its source manifests, ownership/cleanup, texture/shader readiness, CPU wrappers, CDP support, and GPU query accounting. The current script unconditionally freezes after settling and has **no live mode flag**. An unmodified command cannot measure the missing path. The added mode must forward the original dt and must not write `sim.debug.state`.
2. Establish one deterministic scenario and record seed, full contract, loadout, inputs, region, requested/actual camera, quality, DPR, source hashes, actual loaded asset identities, focus/context events, and every phase/depth transition. Use a correctly equipped accepted contract for current gameplay acceptance. If reproducing the historical wrong-loadout preview, label it as a separate legacy diagnostic; do not mix its timing samples with the valid-loadout case.
3. Capture the **natural live approach to and passage through rod-add**, then ordinary drilling, using the normal rod action and controls. Record raw RAF intervals continuously and frame-indexed dt, phase, depth, system CPU timings, GPU samples, and the exact frame index each query belongs to. Trigger a CDP/Chrome performance trace around any sustained 25–30 ms window or a frame above 33.3 ms. These are diagnostic triggers chosen from the old measurements, not new shipping thresholds. Avoid a hardcoded depth teleport being mislabeled as natural runtime reproduction.
4. Freeze immediately after a captured live segment and collect a short frozen control with the existing machinery. Keep feature settings unchanged. Record the exact last live state and frozen state; the live and frozen samples still have different temporal workloads. This control can distinguish a live-only lead from persistent render cost, but cannot identify the responsible system alone.
5. Repeat the same deterministic scenario at least three times, alternating the order of uninstrumented pacing and instrumented/trace captures to expose observation overhead. Live assessment must require stable source/rig/screen/quality/readiness and valid focus/context, while **recording expected phase, state, and animation changes** rather than disabling every frozen guard. Compare matching phase/depth segments and retain the complete trace if pacing changes across the session.

If live frame intervals are slow while renderer GPU time stays short, inspect the captured main-thread task/CPU stacks and scheduling gaps before blaming a game system. If renderer GPU elapsed time grows with the slow frames, investigate the matching frame's actual render passes. If both are short, examine presentation/scheduling in the performance trace rather than assuming the difference is simulation time. If the slowdown does not recur, report that bounded non-reproduction and broaden to the historical hero depth or full-session order; do not declare it fixed.

This experiment needs serialized GPU ownership from the coordinator. It has not been launched by the report author.

## Reproduction and report verification

With the exact captured source/assets and an explicitly granted `codex-fps-profile` lease, the existing frozen tool can generate **new** evidence directories using its actual supported arguments:

```powershell
node tools/profileframes.mjs --rig oil-derrick --camera orbit --frames 180 --repeats 3 --settle-ms 12000 --port 5209 --out evidence/fps/oil-orbit-new-capture
node tools/profileframes.mjs --rig oil-derrick --camera hero --frames 180 --repeats 3 --settle-ms 12000 --port 5209 --out evidence/fps/oil-hero-new-capture
node tools/profileframes.mjs --rig longhole-rig --camera orbit --frames 180 --repeats 3 --settle-ms 12000 --port 5209 --out evidence/fps/longhole-orbit-new-capture
```

These are frozen capture recipes, not commands already rerun for this report. The tool refuses to overwrite an existing `report.json`, so choose fresh output names. Live settling also produces differing states; an identical command is not a guarantee of identical frame content.

The report author only read artifacts/source, calculated statistics and hashes, and ran this CPU-only command:

```powershell
node tools/profileframes.mjs --self-test
```

Result: **23 assessment cases plus the actual frozen-adapter/cleanup fixture passed**. No browser, server, or GPU session was started. No game source, profiler, tests, or captured evidence was changed to produce this report.

## Implementation update after the artifact review

The section above records the original evidence-review task and its captured profiler hash. A subsequent, separately authorized change implemented `--live` in `tools/profileframes.mjs`. The earlier statement that no live flag exists describes the original `096c503…` tool, not this new version. **At this implementation checkpoint no new live browser/GPU capture had run. The later actual captures are documented below; none of the historical measurements above has changed.**

The CPU-reviewed new profiler SHA-256 is `e3d94f5dc96058fe3dcadb16c736970beed64b2a930701022b5c45f58ac93179`. It creates a fresh browser context and explicitly funds a level-60 fixture through progression APIs. It generates a seeded real contract, buys and fits every authored default slot, purchases required certificates through their actual prerequisite chain, and accepts the contract normally. It verifies the selected GLB, the actual simulation bit identity and compatibility, a payable run/attempt, and real geology at zero depth. An ordinary public sheet pauses the SITE during asset/shader warm-up. No QA preview, direct simulation-state write, depth teleport, or invented replacement equipment is used.

The live observer forwards the production dt unchanged, stores raw RAF timestamps separately, and records chronological phase/depth/rod/input/camera state, per-frame inclusive CPU rows, and GPU query results tied to captured frame IDs. A 20 Hz controller uses the game's operator hints and normal action APIs. Its cost and observer cost are recorded separately; this remains an instrumented automated-operator fixture, not a hardware-neutral benchmark. Contract and simulation seeds are recorded; existing environment/VFX randomness and real frame pacing are not claimed deterministic.

Acceptance requires observed drilling, a natural rod-add, and resumed drilling with an increased rod count. A short window, jam, missing transition, wrong loadout, synthetic geology, lost focus, changed source/readiness, malformed timing/camera evidence, or incomplete GPU accounting produces rejected evidence. Slow but correctly recorded frames are not rejected merely for being slow. The mode currently supports the oil-rotary and longhole connection experiments.

`cpu-live.cpuprofile` and `trace-live.json` must contain valid nonempty data. The trace must contain unique chronological `drillity-live-start` / `drillity-live-end` UserTiming marks. CDP records setup and GPU-drain activity outside those marks; phase attribution must use the marked interval and the chronological frame record. The mode does not yet perform the proposed immediate frozen control automatically. Existing frozen mode remains a separate capture with its own recorded state.

After the coordinator grants the GPU lease and freezes source/assets, the first proposed actual invocation is:

```powershell
node tools/profileframes.mjs --live --rig oil-derrick --camera orbit --seed 1337 --live-ms 45000 --settle-ms 12000 --port 5209 --out evidence/fps/oil-orbit-live-01
```

Use a fresh directory for each repeat. `--live-uninstrumented` omits CPU child wrappers, GPU queries, and CDP capture for an overhead comparison, while retaining boundary observers and the same operator controller. Live mode rejects `--frames` and `--repeats`; its duration is explicit and each repeat starts a new invocation. The existing frozen commands above retain their behavior.

Final CPU/source validation on this exact new tool:

- `node tools/profileframes.mjs --self-test`: existing 23 frozen assessment cases and actual frozen-adapter/cleanup fixture, 20 live assessment cases, and five CDP/trace integrity cases pass.
- `node tools/checkliveprofiler-adversarial.mjs`: **100 independent cases pass**, including actual progression/geology/simulation setup, original dt/receiver/arguments/return/error forwarding, malformed evidence, query failures and bounded drain, and partial installation/marker cleanup failures.

Independent fixture SHA-256: `f4aa4ed457e389d933350db6e883495dc19040af549b4f1c923979c330f42eb6`. This is approval of the diagnostic source and its CPU fixtures. Actual Chrome trace semantics, driver timings, browser cleanup, live FPS, and the original slowdown remain to be measured under the coordinator's serialized capture.

## Actual live pair — 8 September, 11:36–11:39 UTC

**A reproducible phase association is now measured: drilling has substantially longer complete-render GPU times than most rod-connection frames. No individual feature is isolated, no performance fix is established, and the historical sustained 34.4 FPS case is not reproduced.** These are two sequential current-game captures, not a phone test or a statistically established overhead comparison.

Both commands actually completed with the exact CPU-reviewed profiler `e3d94f5…` above, under the coordinator's sole GPU grant:

```powershell
node tools/profileframes.mjs --live --rig oil-derrick --camera orbit --seed 1337 --live-ms 45000 --settle-ms 12000 --port 5209 --out evidence/fps/oil-orbit-live-01
node tools/profileframes.mjs --live --live-uninstrumented --rig oil-derrick --camera orbit --seed 1337 --live-ms 45000 --settle-ms 12000 --port 5209 --out evidence/fps/oil-orbit-live-uninstrumented-01
```

Both report `valid`, `sourceUnchanged`, `browserClosed` and `serverClosed` true. Both have 446 source-manifest entries, and the complete manifests are exactly equal across the two captures. The full canonical contract and `before.stable` objects also match exactly. This is the actual oil-derrick GLB, orbit camera, 390 × 844 CSS viewport at DPR 2, 780 × 1688 drawing buffer, high quality including SSAO, and 72 shader programs throughout. Chrome reports **ANGLE / NVIDIA GeForce RTX 4070 Laptop GPU / Direct3D11**, Chrome 152 on Windows. No hardware utilization, GPU clock, thermal, or system-wide process-silence measurement was collected. Other workers coordinated a pause in heavy CPU work; this is coordination evidence, not a measured guarantee that all host processes were idle.

The seeded real contract is `ct-sahara-oil-rotary-5mwh4`, simulation seed `936297571`, generator seed `1337`, generated draw index `1`. It is an accepted Sahara mud-circulation well using actual default loadout `bit-oil-tri-8-econ`, `dp-89-nc38`, `pump-mud-triplex-370`, `bha-collar-121-econ`, `shaker-linear-3`, `mud-spud-gel`, and `wellhead-casing-head-345`; hammer and compressor are null. The actual simulation bit fits. Both runs naturally complete seven rod connections and resume drilling, ending at 200.855 m and 202.213 m respectively. This correct-loadout scenario differs from the historical rejected starter-auger preview.

The first live frame differs: instrumented dt is the production 1/15-second clamp and depth is 2.240 m; control dt is 0.0069 seconds and depth is zero. Both were verified at zero before release, so these are differing first natural updates, not a depth teleport. Orbit orientation also differs: the camera's observed positive-Z basis azimuth starts at −55.916° versus −29.882°. Camera projection values differ slightly as well. Source equality and equal seeds therefore do **not** imply identical time/depth/camera trajectories.

Statistics below use conventional medians and nearest-rank p95 (`sorted[ceil(.95*n)-1]`). RAF samples exclude the first null interval. GPU queries are joined to their actual captured frame IDs and grouped by that row's observed phase.

| Capture / phase | RAF intervals | RAF mean / median / p95, ms | GPU samples | GPU mean / median / p95, ms |
| --- | ---: | --- | ---: | --- |
| Instrumented / all | 3,050 | 14.757 / 13.9 / 20.9 | 509 | 12.294 / 13.681 / 16.626 |
| Instrumented / drilling | 2,329 | 16.536 / 14.0 / 20.9 | 388 | 13.960 / 14.068 / 16.564 |
| Instrumented / rod-add | 721 | 9.009 / 7.0 / 20.9 | 121 | 6.950 / 5.550 / 17.139 |
| Control / all | 2,950 | 15.255 / 13.9 / 20.9 | — | Uninstrumented |
| Control / drilling | 2,227 | 17.274 / 20.7 / 20.9 | — | Uninstrumented |
| Control / rod-add | 723 | 9.034 / 7.0 / 20.9 | — | Uninstrumented |

The whole-run RAF means correspond to 67.765 and 65.553 frames/second. The control's drilling median of 20.7 ms is meaningful slower pacing in this current scenario, but neither whole-run average reproduces the historical sustained 34.4 FPS. Instrumented maximum RAF interval is 48.7 ms; control is 41.8 ms. An apparent improvement from adding instrumentation is not established by this one sequential pair with differing trajectories.

Inclusive CPU mean times during drilling / rod-add are **2.746 / 2.627 ms for complete render**, 0.130 / 0.096 ms for simulation, 0.352 / 0.073 ms for geology update, and 0.075 / 0.076 ms for VFX update. These wrappers overlap and must not be added. The direct `renderEnd - at` controller/update/render span averages 3.792 / 3.349 ms. It excludes some work outside these boundaries and is not total Chrome main-thread utilization. Observer mean is 0.072 ms and controller mean 0.032 ms across the instrumented run. CPU costs alone do not explain the roughly 8.5 ms phase difference between GPU medians.

The transition is not instantaneous: rod-add query rows with actual `phaseT < 0.2` seconds have median GPU **16.090 ms** (13 samples), while `phaseT >= 0.5` seconds has median **5.351 ms** (71 samples). GPU times can drop while reported geometry counts remain literally unchanged: during rod five's connection the queried rows all have 175 calls / 513,181 triangles, while recorded GPU times range from 2.142 to 17.139 ms. Whole-phase median calls are only 175 / 173 and median triangles 512,997 / 507,925. These are complete-render counters, not per-rig budget measurements. They neither identify the responsible shader nor establish a draw-count cause.

An offline neighborhood check grouped positive-RAF rows by `(phase, floor(depth/27), floor(cameraAzimuth/5°), floor(cameraElevation/5°))`; azimuth is `atan2(world[8], world[10])`, elevation is `asin(world[9])`. There are 119 common bins, containing 1,710 instrumented and 1,717 control frames. Only five bins contain at least 20 frames in each capture, none contains 30, and instrumented GPU-query counts per common bin range from zero to four, median two. Even the same 27 m depth bin can contain depths several metres apart. This demonstrates available approximate overlap; it does not turn this pair into an exact camera/depth-matched causal or overhead measurement.

No live VFX particle counts, kind counts, heat-shimmer uniforms, or adaptive `loadScale` values were stored in this pair. Their correlation with GPU time cannot be reconstructed from aggregate draw counts. Source inspection supplies a testable candidate, not a measured answer:

- In captured `src/sim/vfx.js`, `driveFromTelemetry` (line 3980) scales collar returns, cuttings, and engine load from ROP. Its variable named `drilling` tests active/recent telemetry, **not** `phase === 'drilling'`, so claiming all VFX switch off during rod-add would be false. Emission and several visual controls decay or change as ROP falls.
- Four uniquely named transparent instanced meshes (`vfx:surfaceSoft`, `surfaceAdd`, `sectionSoft`, `sectionAdd`) render particle populations; `stats(false)` exposes layer counts and adaptive load without walking every particle. Instance draw ranges alone do not measure currently live particle populations or fragment overlap.
- Both actual captures warn that `oil-rotary` has no `FLUSH_MEDIUM` row and that an air collar plume is used for this mud job. This is a concrete VFX content discrepancy. Correcting it could change the workload, but its performance effect has not been measured.
- `vfx:heatShimmer` is a separate full-band quad. Its ground contribution can persist in Sahara independently of drilling, and the captured configuration has refraction disabled. It must not be conflated with the four particle layers. Geology also moves its section slab/depth uniforms while depth advances. No corresponding feature has yet been isolated.

The relevant captured source hashes are VFX `5b36d58461b61f4e9e65b5df01572de99bde1b1bbfa3153bfe45d7d48495ed93`, geology `895036315fd5924ab7e86b6a516d4fab3f046e740275b9f20f568de7c75d0fdc`, and renderer `ab18d0f124b3e65565574eb1f21543cd6dc3036f4c6a93c5ea33f1a7c29d4f54`. The report manifest, rather than later working-tree contents, defines the measured source.

All 509 GPU queries were created, completed, and deleted; pending, discarded, disjoint events and query errors are zero. The CDP artifact contains 40,213 CPU samples and 81,414 trace events. Its overall profile spans approximately 51.372 seconds, while the `drillity-live-start/end` marks span 45.003 seconds. Phase attribution must stay within the marks and join chronological rows; setup/drain CPU samples are outside the live phase analysis. Both runs have zero page/request/HTTP errors and 26 warnings: the two VFX warnings above and 24 texture-serialization warnings. Independent review recalculated the pair and confirmed the live/CDP assessment verdicts.

Artifact SHA-256 identities, all under `evidence/fps/`:

| File | SHA-256 |
| --- | --- |
| `oil-orbit-live-01/report.json` | `b514e6070cee0ee69a20b25c87783d7d306ac182881835119f39aa1d4f1e8e9e` |
| `oil-orbit-live-01/cpu-live.cpuprofile` | `4e9810df2cb3812e16058a75a66b0b676ace6eb4333dbc006fee062a229205d2` |
| `oil-orbit-live-01/trace-live.json` | `d6f90c13f7fe6847e09815a3169af2705513c5d779b2289e92172af57af4af20` |
| `oil-orbit-live-01/live-end.png` | `5dd2a7cda4ba6443f064a28df721330a903a867bd64e808698705f31999dc9c4` |
| `oil-orbit-live-uninstrumented-01/report.json` | `133a4440b7d6ed8bf339050ff4d907589ecf30bddb9c75466f0794d842c57c3e` |
| `oil-orbit-live-uninstrumented-01/live-end.png` | `bc1fb676640cd3671d5e42d9474c62e6c03dd34bc51032453635e02d8f98214b` |

After both successful runs, an independent local port check confirmed no listener on the owned 5209 port; the owned lease was changed from `codex-fps-profile` to `idle`. Other owners' ports were untouched. These two accepted report files and their artifacts remain unchanged.

## Next bounded diagnostic — implemented and independently reviewed

The coordinator subsequently authorized an optional `--live-vfx-order on-first|off-first` extension to the profiler. It temporarily suppresses **only the four named instanced particle meshes during the original render call**, then restores their exact pre-render visibility in `finally`. Simulation, particle emission, VFX updates, chips, birds, shimmer and other render passes remain running. The planned paired commands use the same accepted rig/method/seed, fresh output directories, and reversed initial block order. No new GPU capture has run for this extension at this checkpoint.

The schedule alternates 600 ms blocks within each natural drilling segment, excluding the first 150 ms in each block from eligible analysis. Rod-add remains visually unmodified. These durations are explicit diagnostic choices, not proven settling requirements. The observer records actual mesh/geometry/material/scene UUIDs, capacities, instance counts, material time, before/applied/render-end/restored visibility, and `stats(false)` layer counts, medium, adaptive `loadScale` and production `clock.fps`. Existing raw RAF/camera/depth/phase/readiness/source/query guards remain in force; at least eight eligible measured GPU frames are required in each mask state. New assessment validates evidence integrity, not a performance result.

There is an important remaining feedback confound: existing VFX code changes `loadScale` according to the game's rolling `clock.fps` thresholds. Suppressing draws may change later particle populations even though emission code still runs. Analyze actual phase/depth/view neighborhoods and particle/adaptive states, counterbalance order, retain transition/settling rows, and reject any causal claim when workloads cannot be matched. A measured family-level difference would locate a candidate render family; it would not identify one layer or justify removing effects from the shipping game.

Independent CPU/source approval completed on profiler SHA-256 `155d2cf39c90dc4aca5d70a65f19ae9fa0bb0e76967137f782b2eb83454ecfc2` (80,643 bytes). `node tools/profileframes.mjs --self-test` passes the existing 23 frozen cases plus actual adapter, 20 live cases, five CDP cases and ten new VFX integrity cases. `node tools/checkliveprofiler-adversarial.mjs` passes **122 independent checks**, including both actual adapter mask orders, unchanged original update arguments/emission progression, original render exceptions, exact visibility restoration, invalid state/schedule/identity rejection and a target replaced during the final render. That last regression was found by the critic and fixed with explicit end-of-render identity proof. Critic fixture SHA-256 is `aa27169caba0ad37594c569b633eff623bf9b6488cb564d3acc16ab25d907179`. This approves the diagnostic source, not an unrun GPU result.

## First VFX probe capture — rejected evidence, preserved

The coordinator later granted the GPU and froze the then-current main source. The actual `--live --live-vfx-order on-first` oil-derrick/orbit/seed-1337 command ran for the requested 45-second window with 12-second settling, output `evidence/fps/oil-vfx-on-first-01`, on 8 September at 12:27:14.803–12:28:57.747 UTC. **Overall validity is false.** Its CPU profile contains four negative raw `timeDeltas`: indices 15,292 / 25,382 / 25,530 / 28,225 contain −48 / −38 / −50 / −32 microseconds. The CPU integrity gate rejected these values. No values or validation rules were changed to make the run pass, and no reverse-order capture followed this failure.

The separate chronological live and VFX-mask gates pass, with 1,801 frames and 301 created/completed/deleted GPU queries. There are 79 eligible on and 69 eligible off GPU samples. The exact draw-time masks, target identities and visibility restoration checks pass. These sub-results remain **raw diagnostic evidence from an overall rejected capture**, not a validated comparison. Eligible drilling GPU medians are 25.298 ms on / 26.085 ms off; corresponding RAF means are 31.665 / 31.808 ms. This run supplies no useful observed reduction when the four particle layers are hidden. It does not establish zero particle cost or identify another feature as the cause.

Whole-capture RAF mean is 25.016 ms, median 27.8 ms; rod-add GPU median is 6.049 ms. The on/off particle populations and adaptive state are not identical: eligible live-particle medians are 721 / 725.5, adaptive `loadScale` medians 0.5297 / 0.5323, and the production rolling `clock.fps` medians 33.517 / 31.981. The source manifest has 448 entries, unchanged within this capture but different from the earlier 446-entry accepted pair. The earlier-to-later pacing difference therefore cannot be attributed to the new probe alone. No GPU clock/utilization measurement resolves that difference.

The rejected capture still cleaned up correctly: both owned browser and server closed, all queries were deleted, and an independent port check found no 5209 listener before the lease was released. Source and captured report files remain unchanged. Its report SHA-256 is `fa30b2be2100ba021c0ff0ace3e7e3a97d80f5bc211108b229b5ce207e2f004d`; CPU artifact is `bf8eaaf6b3c94fd8793d04b31aa3122db6461f12f3356ea4dc7d7ec8bb94dd5b`; trace is `bfa69c181981e9948973c47f6dd3e26d4b5db4f412f709e0572a862347c536fa`. Independent criticism reproduced the rejection reason and raw statistics. The coordinator authorized one fresh retry with unchanged tool and frozen inputs; its outcome must be recorded separately.

## Authorized retry — also rejected; capture attempts ended

`evidence/fps/oil-vfx-on-first-02` ran the same on-first command and unchanged reviewed harness at 12:30:50.023–12:32:15.364 UTC. **Overall validity is again false**, due to negative CPU-profile `timeDeltas` at indices 19,490 / 23,565 / 29,309 / 29,392 / 34,586: −58 / −33 / −31 / −34 / −52 microseconds. Its CPU artifact contains 38,474 samples, and the trace contains 60,982 events. The live and mask integrity gates pass independently; 2,076 chronological frames and all 346 GPU queries were recorded, completed and deleted. Eligible GPU samples are 96 on / 81 off. The repeated negative CPU deltas remain an unresolved diagnostic-artifact issue, not an explanation of the physical rendering cost. The integrity rule was preserved.

No off-first capture and no additional retry was launched after this repeated failure. Both owned browser and server closed, source stayed unchanged, 5209 listener absence was independently checked and the GPU lease was returned to idle. The 448-entry full source manifests, canonical contract and `before.stable` objects are exactly equal between rejected 01 and rejected 02. They still do not guarantee equal evolving cameras, particle populations or host hardware state.

The following values are explicitly **raw observations from rejected 02**, not accepted performance results:

| Eligible drilling mask | GPU queries | GPU mean / median, ms | RAF mean / median, ms | Particle median | Adaptive load median |
| --- | ---: | --- | --- | ---: | ---: |
| On | 96 | 21.479 / 23.234 | 26.112 / 27.8 | 797 | 0.5964 |
| Off | 81 | 21.739 / 22.950 | 26.350 / 27.8 | 831.5 | 0.6631 |

Median draw calls decrease from 175 to 171; complete-render CPU means are 3.830 / 3.700 ms. Rod-add GPU median is 6.168 ms. Whole-capture RAF mean is 21.691 ms, versus rejected 01's 25.016 ms despite unchanged source. The four-layer intervention does not produce a clear sustained pacing reduction in these raw records; the GPU-median direction differs between 01 and 02. No performance fix or zero-cost conclusion follows.

A conservative offline overlap check on eligible GPU samples used `(rods, floor(depth/5m), floor(cameraAzimuth/10°), floor(loadScale/.1), floor(liveParticles/100))`. It finds only six shared on/off bins in 01, containing seven queries per mask, and eight bins in 02, containing nine queries per mask. These are still approximate neighborhoods, not equal pixels or particle configurations. Sparse overlap, adaptive feedback, lack of the reverse-order repeat and failed overall diagnostics prevent a causal result.

Rejected 02 artifact SHA-256 values are report `89cee36f6af906eec507117e1914d69a73899783f52153eba62682dcfae28d04`, CPU `4830ffdb43d86b90687b9cc5102b11f43ea33f2f325e221125404a0827351a86`, and trace `5ac42bd15637beccf310f66e3fa7b0e76badb680f736cdb0927f8c3b47432d0e`. Both rejected directories remain intact beside the earlier accepted baseline pair; they must never be merged into its accepted measurement table.

The next source-backed candidate is a **separate draw-only test of `vfx:heatShimmer`**, after investigating the CDP artifact issue and obtaining a new serialized experiment grant. `ShimmerQuad` names that object at VFX line 2902; `updateShimmer` around line 4267 uses engine load, heat and ROP-derived collar heat. Its full-band fragment shader computes noise before masking/discard. This source behavior warrants isolation but does not prove it caused the observed phase difference. The four-layer probe did not suppress shimmer. Any later shimmer visibility experiment must account for its `onBeforeRender` framebuffer-copy path if enabled; a mesh-level suppression measures the whole quad and associated copy, not shader arithmetic alone. No shimmer harness expansion or graphics production change was made during this wind-down.
