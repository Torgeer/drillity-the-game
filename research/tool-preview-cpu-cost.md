# Preview framing CPU cost — 2026-09-06

The exact-vertex fit increases one-time CPU work compared with the prior cached
bounding-box/sphere fit. Sharing radial calculations and simplifying the static
camera-axis calculation substantially reduced that added work in this measurement.
The optimized fit is not called during ordinary turntable updates; source replacement
is the only `frame()` call inside `update()`.

Measured on Windows x64, AMD Ryzen 7 7435HS, 16 logical processors, Node v22.16.0.
Other tasks share this desktop. CPU contention, clock speed, thermals and incidental
garbage collection were not controlled. These are CPU microbenchmarks, not browser
end-to-end latency, GPU measurements, mobile measurements or FPS.

## Method

The benchmark extracts and executes the production `frame()` bodies verbatim,
including the candidate's verbatim `sweepSupport()` helper. The original body comes
from commit `5f04e837ec3818644ab0c2d44c039fce9d680417`. The closure supplies the actual
Three.js camera initialization, backdrop scale target and imported `clamp` function.
No replacement framing algorithm is timed.

The corpus contains 27 actual tool builders at wear 0 and all 19 actual GLBs loaded
through `gltfRig` and `rigFactory.buildPreview`, with `glbinfo` validation. Each of
four modes gets eight warm rounds and 48 measured calls. A rotating Latin order
alternates the four modes across rounds and items. The already-built group is
shared; construction, loading, parent yaw changes, validation and rendering are
outside the timing interval. Allocations and incidental GC inside `frame()` remain
included. No forced GC runs between samples.

Static framing uses thumbnail yaw −0.5. Live framing starts at yaw 0; the candidate
computes its full yaw and ±0.12 pitch envelope. The original has one common static/live
algorithm. Cached geometry boxes are warm, as they are for already-built previews.
First-call values are retained as order-dependent diagnostics, not controlled cold
measurements. Percentile 95 uses nearest rank over the 48 samples.

## Warm results

Each table entry is the median of the individual items' medians, in milliseconds.
The original column comes from the optimized run, where original and candidate
were interleaved. Before/after optimization are separate runs on the shared CPU.

| Corpus and fit | Original sphere | Before optimization | Optimized |
|---|---:|---:|---:|
| 27 tools, static | 0.011 | 0.475 | 0.216 |
| 27 tools, live | 0.010 | 1.627 | 0.417 |
| 19 rigs, static | 0.086 | 9.953 | 4.815 |
| 19 rigs, live | 0.070 | 31.497 | 7.516 |

| Optimized item | Static median / p95, ms | Live median / p95, ms |
|---|---:|---:|
| PD55 | 9.174 / 10.226 | 14.250 / 15.875 |
| RC rig | 9.460 / 11.816 | 15.616 / 19.581 |
| DTH crawler | 7.827 / 9.306 | 12.148 / 18.138 |
| CFA rig | 8.487 / 9.734 | 13.146 / 14.585 |
| Tricone bit | 1.654 / 2.920 | 2.485 / 4.935 |
| BOP stack | 1.589 / 3.544 | 2.467 / 3.807 |

The worst optimized rig p95 is 12.106 ms for static fitting and 21.401 ms for
live fitting, both on foundation-bg. PD55 live median fell from 63.026 to 14.250 ms;
RC live median fell from 61.464 to 15.616 ms. There remains measurable initial-fit
cost versus the sphere fit, but the work occurs when constructing or replacing a
preview, not on every animation frame.

## Evidence and reproduction

- `tool-preview-cpu-cost-before.json`: preoptimization measurements.
- `tool-preview-cpu-cost.json`: optimized measurements against the same original.

Both reports retain all samples, per-item medians/p95, machine information, exact
executed instrumentation source and hashes of the source/functions timed. The
optimized report pins the original baseline commit in its instrumentation. Re-run
from the private checkout with the candidate source matching the recorded hash;
subsequent source changes are a new benchmark version. No production or harness
source was modified by the timing instrument.
