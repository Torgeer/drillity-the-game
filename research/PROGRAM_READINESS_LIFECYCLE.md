# Shader readiness lifecycle correction

2026-09-06. Narrow renderer correction owned by instrument_gpu_diagnostics; no GPU launch.

## Evidence and cause

Root's headed instrument integration run recorded repeated WebGL warnings about `getProgramParameter` using a deleted object. The concrete source mismatch is in installed three.js 0.169.0, `node_modules/three/src/renderers/webgl/WebGLProgram.js:1050`: `isReady()` closes over the original GL `program`. At `:1064`, `destroy()` deletes that handle and clears the wrapper's public `this.program` field. Calling `isReady()` on a previously captured, now destroyed wrapper can therefore query a deleted handle.

The renderer captures wrappers in a Set during compile. Before this change, its `programReadiness()` polled every wrapper and counted exceptions as `done`; `warmTitle()` independently polled every captured wrapper. Neither checked retirement. This source mechanism explains a possible source of the observed warnings; a fresh headed run is still needed to establish that it removes those actual integration warnings. It does not establish the cause of any unrelated frame-to-frame pixel changes.

## Behavior changed

- `programReadiness()` checks the wrapper's `.program` before calling `isReady()`. Retired wrappers are never queried.
- Captured batch `total` remains stable. `done` counts successful readiness only; `pending`, `retired`, and `failed` are separate counts. Query exceptions are reported as failures, not completion.
- `warmShaders()` finishes polling when no pending work remains, preserving incomplete progress for retired/failed programs instead of waiting 60 seconds or inflating `done`. It returns the counters, explicit `ready`, and a reason. Active pending programs still poll under the existing 60-second ceiling. Compile failure and timeout return `ready: false`.
- The nonparallel fallback preserves its single callback and `parallel: false`; `ready: false` explicitly avoids treating three.js's immediate fallback result as measured driver completion.
- `warmTitle()` uses the same helper, declines to display an unready title on retirement/query failure, and distinguishes those outcomes from cancellation, timeout, or no programs. Its existing eight-second ceiling remains.

No changes to compile target selection, shader code, render passes, materials, quality levels, visual thresholds, or general warning handling. No Three dependency patch. Existing `programs`, `ms`, `parallel`, and `post` fields are preserved. No production helper export was necessary: the CPU regression executes the actual source helper and method bodies with recording dependencies.

## Regression and verification

`node tools/checkprogramreadiness.mjs` failed against the original helper at the first behavioral assertion: **retired query count 1, expected 0**. The same regression after the patch covers active ready/pending, retirement before polling and between timer ticks, exception honesty, stable progress denominator, immediate exit for settled retired/failed batches, timeout and extension-unavailable semantics through the actual `warmShaders()` and `warmTitle()` method bodies.

Run `node tools/checkprogramreadiness.mjs`, `node tools/checkinstrumentwarmup.mjs`, and `node --check src/core/renderer.js` for the focused CPU validation. This establishes JavaScript lifecycle/poll behavior, not successful driver compilation or GPU performance.

Root integration: main.js now distinguishes queued programs from driver-ready,
retired and failed counters and records the actual outcome. The new regression
is wired into check:instruments/check:cpu. The six-case headed lifecycle and
ten-case A/B runs recorded no deleted-program/invalid WebGL warnings; see
INSTRUMENT_LIFECYCLE_QA.md for exact evidence and scope. These observations do
not establish the cause of unrelated frozen-frame transition differences.
