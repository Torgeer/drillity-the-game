# Live profiler independent review

Status: the original instrumented/control oil live captures pass independent artifact
review as bounded diagnostics. Their phase association is credible; a
specific rendering feature or the historical FPS cause remains unisolated.

The assigned scope is `tools/profileframes.mjs` live measurement and its setup,
assessor, timing adapters, and cleanup. The critic owns the separate
`tools/checkliveprofiler-adversarial.mjs` fixture and this report. It does not
change profiler or game source. Browser and GPU work require the coordinator's
serialized lease and have not been started by this critic.

## Measurement boundaries

The game loop in `src/main.js` limits simulation dt to 1/15 second and calculates
`ctx.clock.fps` using that clamped dt. A slow actual frame can therefore be
reported as a shorter simulation frame. Live performance evidence must retain
raw requestAnimationFrame timestamps and intervals separately from the dt
forwarded to actual systems. The displayed counter cannot establish a measured
FPS floor.

Live simulation and animation are expected to advance. Requiring frozen depth,
phase, clock, or camera matrices would remove the path under investigation.
Conversely, simply deleting frozen guards would allow a paused, unfinished,
wrongly equipped, or switched contract to masquerade as a live measurement.
The setup must use a real generated contract, public acceptance and ordinary
supported equipment. It must retain immutable rig, run, loadout, quality,
readiness, and source evidence while recording temporal changes.

CPU wrapper measurements are inclusive main-thread elapsed time. Nested rows
overlap. GPU query samples belong to particular submitted render frames and
must be checked against the same window, with exact query ownership and
bounded drainage. A fixture proves arithmetic, forwarding and cleanup; it
cannot prove a real GPU timer, browser scheduler, phone workload or FPS cause.

## Verification record

An early `node tools/profileframes.mjs --self-test` invocation overlapped the
author's edits. Its 23 existing frozen assessment cases and adapter cleanup
fixture passed, then the incomplete live implementation raised
`ReferenceError: liveSelfTest is not defined`. This was an intermediate edit,
not a completed candidate regression or a passing overall run. It will be
superseded by a complete stable-source run below.

## Findings addressed before capture

- The first live assessor accepted an instrumented frame window with every
  CPU row absent or empty. It now requires one original simulation call and
  one complete renderer call in each instrumented frame. Explicit
  uninstrumented windows still omit these wrappers legitimately.
- Raw frame timestamps are now required, and each retained interval must
  match consecutive timestamps. Finite camera matrices are required at both
  endpoints and every live frame, while actual camera movement is permitted.
  Query counters are mandatory nonnegative integers, rather than values whose
  truthiness could accidentally admit `NaN` or missing evidence.
- The outer cleanup order now unwinds frozen adapters before live adapters
  if both exist. The implemented live branch does not install a frozen
  control, so this is defensive nesting correctness, not a claim that the
  live branch previously executed that combination.
- Instrumented runs now require a nonempty CPU sampling profile and trace
  with usable start/end correlation marks. The actual installer emits those
  marks and records the corresponding page clock boundaries. Empty timing
  files, unknown sample-node identities, missing durations, and missing or
  reversed marks are rejected. The end-marker failure fixture also proves
  that a secondary marker error preserves the original renderer exception.

The real setup fixtures instantiate the production career, simulation and
geological generator. They verify that the accepted object is unchanged from
the real seeded contract generator; fitted equipment passes real ownership
and compatibility rules; and the run starts at zero with issued run/attempt
identities. They reject an existing career, refused acceptance, unsupported
default equipment and missing real geology. UI/GL loading are explicit CPU
boundaries, so this does not prove that the actual browser loaded a GLB or
rendered the site.

The adapter fixtures run the actual installer with a deterministic frame
scheduler and timer-driver double. They check original `this`, arguments,
return value and thrown exception identity; ordinary dynamic phases and
camera observations; query creation/deletion and bounded drainage; removal of
owned listeners/wrappers; and exclusion of later drain frames from the CPU
window. Failed timer creation, begin, end, query values, disjoint/context
events, unavailable timers, and cancellation cannot pass as a completed
measurement. An explicit 100 ms raw frame with 1/15-second simulation dt stays
100 ms in the evidence.

## Remaining capture requirements

No browser session, WebGL driver, GPU measurement, CDP trace or phone was
executed by this critic. At the initial CPU review stage, the required evidence review covered the actual
rig, site, generated contract, accepted run, fitted loadout, initial pause,
shader/assets readiness, chronological rod-add/resumption, raw intervals,
query identities, source manifests, profile/trace content and cleanup.

The 20 Hz automated operator is a recorded measurement fixture, not a claim
that a human plays the same way. Seeded contract/physics do not make existing
environment randomness or scheduling deterministic. A rejected window can
still contain useful diagnostic information; insufficient connection time,
a hazard interruption or shader changes must remain visible rather than be
changed into an acceptance pass. No historical slowdown or shipping fix is
established by these CPU tests.

## Final stable verification

Run from `C:/Users/henri/Downloads/threads/drillity-fps-investigation`:

```powershell
node tools/checkliveprofiler-adversarial.mjs
node tools/profileframes.mjs --self-test
Get-FileHash -Algorithm SHA256 -LiteralPath tools/profileframes.mjs, tools/checkliveprofiler-adversarial.mjs
```

Results on 8 September 2026: **100 independent checks passed, zero failed**.
The author self-test also passed all **23 frozen assessments, the actual
frozen-adapter cleanup fixture, 20 live assessments and 5 CDP/trace integrity
cases**. No browser, server or GPU was started by these commands.

Reviewed profiler SHA-256:
`e3d94f5dc96058fe3dcadb16c736970beed64b2a930701022b5c45f58ac93179`.

Independent fixture SHA-256:
`f4aa4ed457e389d933350db6e883495dc19040af549b4f1c923979c330f42eb6`.

The fixture verifies its canonical source inputs did not change during the
run and prints their SHA-256 values. In this run they were:

| Input | SHA-256 |
| --- | --- |
| `src/core/contract.js` | `dfb40a897139a7a67fc9d62a2d17a473096a51f42513becca6e3391767e3cf53` |
| `src/game/data.js` | `0684cac453e80e70036ca34fb661226ca4798d9069c7d6c98413df03bf54cb2d` |
| `src/game/economy.js` | `ef98a6b8e7569f8542b541f9d8baad8e8c0f01193b088d2ef7ff3e433f7bcac6` |
| `src/game/equipment-support.js` | `12b6c6aa9b17bad42f38196a110a04d76a283a2f1ee2f813184d9e9be271822b` |
| `src/game/progression.js` | `c2a924ec309c6dd0fa86a00e5bd9c8ca2714c802b466a97255d3f6c43e194fd3` |
| `src/sim/drilling.js` | `75716a736b91edc146688e4ab14dc78d3b9adc2c09fe79dc935f49bec1b1fc3b` |
| `src/world/geology.js` | `895036315fd5924ab7e86b6a516d4fab3f046e740275b9f20f568de7c75d0fdc` |

The independent fixture changes only its test file and this report. The
profiler author made the reviewed implementation changes. Nothing was
committed or pushed by the critic.

## Independent raw capture review after resumption

The coordinator subsequently produced `evidence/fps/oil-orbit-live-01` and
`evidence/fps/oil-orbit-live-uninstrumented-01`. This critic read both raw
reports and the instrumented CPU/trace files, recalculated the figures below,
and reapplied the live and CDP assessors. No capture or heavy test was run.

Both reports pass. Each has 446 unchanged source/asset manifest entries, and
the two manifests are identical. They use the reviewed `e3d94f5d…` profiler,
the same canonical Sahara oil contract, supported owned default loadout,
payable run/attempt, actual oil GLB and well-pad GLB, high quality at
390×844/DPR 2, 29/29 ready texture sets, and 72 unchanged shader programs.
No page/request/HTTP errors or focus/context violations were recorded.
Both owned browsers/servers closed. The instrumented capture created,
completed and deleted exactly 509 elapsed queries without discard or timeout.

Both start from an accepted attempt at zero and observe seven rod-adds,
seven public `rodStab` actions, and resumption with rods increasing from one
to eight. Their 45-second windows end at 200.855 m and 202.213 m respectively.
These depths are the game's recorded simulation, not real-world field rates.

| Capture / phase | Frames | RAF mean ms | GPU median ms | Render CPU mean ms | Simulation CPU mean ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Instrumented drilling | 2,330 | 16.536 | 14.068 (388 queries) | 2.746 | 0.130 |
| Instrumented rod-add | 721 | 9.009 | 5.550 (121 queries) | 2.627 | 0.096 |
| Control drilling | 2,228 | 17.274 | Not measured | Not measured | Not measured |
| Control rod-add | 723 | 9.034 | Not measured | Not measured | Not measured |

RAF excludes the first null interval and uses the recorded row's phase.
Assigning each interval to the preceding frame instead yields drilling /
rod-add means 16.575 / 8.884 ms and 17.315 / 8.908 ms: the association survives
that boundary convention. Medians use the mean of the two central values.
Whole-window mean RAF is 14.757 and 15.255 ms (67.77 and 65.55 average FPS).
There are 10 and eight intervals above 33.333 ms; none exceeds 50 ms.
The historical sustained 34.4 FPS oil result was not reproduced here.

The instrumented rod-add GPU p95 remains 17.139 ms, so every connection frame
is not uniformly cheap. Inclusive render CPU has one 28.1 ms maximum despite
the low mean. These observations support investigation of a changing render
workload without declaring the entire game CPU-safe or one visual effect
responsible. Nested CPU rows must not be added or combined arithmetically
with GPU elapsed time.

This is not an exact instrumentation A/B. Initial orbit yaw differs by about
26.03 degrees. The first instrumented frame receives 1/15-second dt and
advances to 2.240 m; the control receives 0.0069 seconds and remains at zero
until a fixed substep occurs. Camera, depth and particle trajectories then
differ. The slightly faster instrumented mean does not establish negative
overhead. Both modes retain the observer and automated controller.

The CDP profile contains 40,213 samples and the trace 81,414 events. Unique
live marks delimit 45.003 seconds, while the CPU sampling capture spans
51.372 seconds. Phase attribution must exclude setup/drain activity outside
those marks. Both reports retain two real warnings that oil-rotary lacks the
VFX flush mapping and consequently draws an air collar plume despite a mud
loadout; they also retain texture-serialization warnings. Diagnostic validity
does not make that presentation correct.

| Artifact | SHA-256 |
| --- | --- |
| Instrumented `report.json` | `b514e6070cee0ee69a20b25c87783d7d306ac182881835119f39aa1d4f1e8e9e` |
| Control `report.json` | `133a4440b7d6ed8bf339050ff4d907589ecf30bddb9c75466f0794d842c57c3e` |
| `cpu-live.cpuprofile` | `4e9810df2cb3812e16058a75a66b0b676ace6eb4333dbc006fee062a229205d2` |
| `trace-live.json` | `d6f90c13f7fe6847e09815a3169af2705513c5d779b2289e92172af57af4af20` |

## Proposed particle isolation: review boundaries

The author's proposed next diagnostic hides only the four named soft/additive
particle meshes during selected drilling render calls. It preserves updates,
emission, chips, shimmer and other features, and restores the exact visibility
values in `finally`. That is a reasonable bounded hypothesis test if actual
target identities, applied/restored masks, frame queries and comparison
eligibility are recorded. It does not measure all VFX or identify one layer.

The proposed 600 ms blocks and 150 ms initial exclusion are experiment
settings, not measured settling guarantees. Camera/depth/phase and particle
workload still need matching. In particular, `src/sim/vfx.js` derives
`loadScale` from rolling FPS thresholds 52/42/34 and uses it in emission.
Hiding draws can therefore change future particle workload through existing
feedback even though update functions still execute. Record rolling FPS,
loadScale and live layer counts; do not label unmatched on/off differences
as isolated draw cost. A separate shimmer experiment would include its
`onBeforeRender` framebuffer copy, not just its quad shader.

No proposed isolation has been approved as a shipping change, and no phone
performance claim follows from these RTX 4070 Laptop GPU captures.

## Particle probe source review

The author subsequently implemented the bounded four-layer probe in the
profiler. The independent CPU fixture now exercises both `on-first` and
`off-first` orders through the actual adapter. Original VFX updates continue
on every frame with unchanged dt and restored visibility. Render calls see
the intended mask; rod-add remains unmasked; uniforms keep advancing; and
original renderer exceptions propagate after visibility restoration.

The review required schedule continuity, elapsed time relative to each real
phase/rod segment, complete live/capacity totals, and retained adaptive FPS /
loadScale observations. It also reproduced a specific proof gap: replacing
a target geometry inside the final recorded render was accepted because
only its pre-render identity was recorded. The author added an explicit
end-of-render identity check before restoration. The same independent
final-frame mutation now rejects correctly. Disconnected targets, changed
geometry, hidden parents, unapplied masks, incomplete restoration, false
eligibility and insufficient eligible GPU samples also reject.

Final commands were the same two CPU commands above. Results:
**122 independent checks passed**, plus author frozen 23/adapter, live 20,
CDP 5 and VFX probe 10 checks. Each CPU run took only a few seconds; no
browser, GPU or broader game test was launched by this critic.

Approved probe-source SHA-256:
`155d2cf39c90dc4aca5d70a65f19ae9fa0bb0e76967137f782b2eb83454ecfc2`.

Updated independent fixture SHA-256:
`aa27169caba0ad37594c569b633eff623bf9b6488cb564d3acc16ab25d907179`.

This authorizes interpretation of the tool as a bounded integrity-checked
experiment, subject to coordinator resource ownership. It is not a result
from the probe: on/off GPU evidence, matched camera/depth/particle workload
and the FPS-driven emission feedback still require review after capture.
The earlier two raw live reports remain immutable evidence from the older
`e3d94f5d…` profiler.

## First actual particle probe: rejected evidence retained

`evidence/fps/oil-vfx-on-first-01` is **overall invalid**. Independent reading
confirms negative CPU profile time deltas at indices 15292, 25382, 25530 and
28225: respectively −48, −38, −50 and −32 microseconds. These violate the
existing CPU profile integrity rule. The values were not clamped or removed,
and the gate was not relaxed. Their origin has not been established.

The separate live and VFX mask assessors pass the recorded 1,801 frames.
All 301 GPU queries completed and were deleted; none was discarded, pending
or disjoint. The 448-entry source manifest remained unchanged and owned
browser/server cleanup completed. Those facts preserve useful component
diagnostics without promoting the failed run into accepted evidence.

Among eligible drilling samples, on/off GPU medians are 25.298 / 26.085 ms
(79 / 69 queries); RAF means are 31.665 / 31.808 ms. There is no useful
observed four-layer reduction in this rejected series. LoadScale medians are
0.530 / 0.532 and live particle medians 721 / 725.5. Rolling FPS medians are
33.52 / 31.98, with substantially wider distributions; the adaptive workload
and moving camera/depth remain part of the record. These are descriptive
figures, not an accepted zero-cost result or proof that all VFX are cheap.

The older baseline has a different source snapshot, camera and runtime
trajectory. Its faster timings cannot establish that the new probe itself
caused the later slowdown. The coordinator authorized one unchanged fresh
retry, with an opposite-order run only if the retry passes all gates.

| Rejected artifact | SHA-256 |
| --- | --- |
| `report.json` | `fa30b2be2100ba021c0ff0ace3e7e3a97d80f5bc211108b229b5ce207e2f004d` |
| `cpu-live.cpuprofile` | `bf8eaaf6b3c94fd8793d04b31aa3122db6461f12f3356ea4dc7d7ec8bb94dd5b` |
| `trace-live.json` | `bfa69c181981e9948973c47f6dd3e26d4b5db4f412f709e0572a862347c536fa` |

## Final unchanged retry: rejected; capture work stopped

`evidence/fps/oil-vfx-on-first-02` repeats the CPU-profile integrity failure.
Independent reading confirms five negative time deltas: −58, −33, −31, −34
and −52 microseconds at indices 19490, 23565, 29309, 29392 and 34586.
Its **overall invalid classification is retained**. No opposite-order run
was made, no sample was repaired, and no gate was relaxed.

The separate live/mask checks pass 2,076 frames. All 346 GPU queries completed
and were deleted; 96 on and 81 off query frames meet the predeclared
eligibility rule. The source manifest is unchanged within the run and exactly
matches the first rejected probe's manifest. Stable career/render setup also
matches, but the actual initial camera does not. Both owned resources closed.

Descriptively, eligible on/off GPU medians are 23.234 / 22.950 ms and RAF
means 26.112 / 26.350 ms. The small GPU difference changes direction relative
to the first probe, while RAF does not improve. On/off median loadScale is
0.596 / 0.663 and median live particle count 797 / 831.5. Moving camera/depth,
adaptive workload, only one ordering and failed overall integrity prevent a
controlled savings claim. The two rejected runs neither establish a useful
four-layer optimization nor prove those layers cost nothing.

| Rejected retry artifact | SHA-256 |
| --- | --- |
| `report.json` | `89cee36f6af906eec507117e1914d69a73899783f52153eba62682dcfae28d04` |
| `cpu-live.cpuprofile` | `4830ffdb43d86b90687b9cc5102b11f43ea33f2f325e221125404a0827351a86` |
| `trace-live.json` | `5ac42bd15637beccf310f66e3fa7b0e76badb680f736cdb0927f8c3b47432d0e` |

The coordinator stopped this experiment during the usage wind-down. A future
separate hypothesis is the full-band `vfx:heatShimmer` quad and its framebuffer
copy; it remained enabled in these particle probes and responds to engine /
collar heat inputs. That is a source-derived candidate, not an isolated cost
or a demonstrated FPS fix. The negative CPU sampling intervals also remain
an unresolved diagnostic limitation. No further work or GPU run was started
by this critic.
