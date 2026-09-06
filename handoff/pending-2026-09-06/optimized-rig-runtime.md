# Optimized rig runtime — blocked checkpoint

**0/8 runtime cases measured. Actual draw calls and warm FPS are UNASSESSED.**
Single private preview startup failed on a dependency-access denial; no browser
ran. This task makes no <=70-per-rig, FPS60, visual acceptance or improvement
claim. The source patch is a prepared, CPU-checked harness, not a runtime pass.

Task: `01a0745d-464e-7d92-a02b-c9dfb236599f`.
Worktree: `C:/Users/henri/Downloads/threads/drillity-optimized-rig-runtime`.
Branch: `codex/optimized-rig-runtime`.
Baseline: `763f0a91045e1f3afd5ebeeaaee98af7be6b2810`.

## Reviewable delivery

- [Five-path source patch](../drillity-optimized-rig-runtime/.optimized-rig-runtime/optimized-rig-runtime.patch)
  SHA256 `d9174c81a38bf5981e84deb9ba33b1d14ea17737fec68f05671d7ea8ccd3a987`.
- [Source hashes and explicit paths](../drillity-optimized-rig-runtime/.optimized-rig-runtime/source-hashes.json).
- [Full report and intended methodology](../drillity-optimized-rig-runtime/research/OPTIMIZED_RIG_RUNTIME.md).
- [Raw zero-case measurement checkpoint](../drillity-optimized-rig-runtime/.optimized-rig-runtime/checkpoint.json).
- [98-file frozen-source manifest](../drillity-optimized-rig-runtime/.optimized-rig-runtime/freeze.json).
- [Startup diagnostic excerpts and closure](../drillity-optimized-rig-runtime/.optimized-rig-runtime/startup-denial.txt).
- [Independent harness/data review](../drillity-optimized-rig-runtime/research/OPTIMIZED_RIG_RUNTIME_REVIEW.md)
  and [independent performance critique](../drillity-optimized-rig-runtime/research/OPTIMIZED_RIG_RUNTIME_CRITIC.md).

Patch contains only new tools/checkoptimizedrigruntime.mjs,
tools/serveoptimizedrigruntime.mjs and three research/OPTIMIZED_RIG_RUNTIME*.md
files. Evidence/snapshot files are preserved separately, not bulk-added to Git.
No tracked source changed; no original checkout, renderer/runtime, authoring
module, model/dependency junction or existing port was edited. No commit, push,
merge, deployment, escalation or archive occurred.

## Exact current assets

All four match optimization-current-export.md's reviewed current-library
corrected exports exactly. Hashes were checked during snapshot creation and
again at final checkpoint. All98 frozen served files remain byte-identical.

| Rig | SHA256 |
|---|---|
| bolter | `c3a29ca8d6da32eb87f39f8e207ebd3d3aa8da1685f50cb71708d89f0e32ed23` |
| crawler-th | `58175e8ae042856225b435f9476dca99d94a15048d609973b4cffe0c42ac721d` |
| sonic-truck | `f9c5438581f43adbcdd04f8b04ee579c3c4353e45c6f60e289226d6407cc6763` |
| tunnel-jumbo | `4059aaa715b389aa641b5a75256dece9ee48ab342e50b9de7484a9beaf1f6094` |

Authoring-module raw hashes and complete runtime/model hashes are retained in
freeze.json. They identify the current prepared baseline, not a stale private
renderer. Browser-observed `glb:<id>` keys remain unobserved because capture did
not launch. Primitive/triangle/byte counts are not substituted for draws.

## Intended measurement and limits

Eight cases: bolter/rockbolt, crawler-th/top-hammer, sonic-truck/sonic,
tunnel-jumbo/tunnel-jumbo, high and low at390x844 CSS pixels/DPR2 requested.
Explicit hero camera; german-site real seeded1337 contract, final target within
method range and matching geology; parked depth2/timeOfDay0.34. sim.update is
suspended and state.drill.active=false, so simulation CPU cost is excluded.
This is a renderer-oriented parked-state benchmark, not live drilling.

Clean120-frame headed rAF timing comes before40 instrumented actual-renderer
frames and the separate existing-style32px scratch attribution. Actual app
frame IDs, raw intervals, focus/visibility/context/device evidence, completed
warmShaders batch, shader IDs, full source and real model identities are gated.
Warm-up has a fixed minimum and bounded quiet/timeout criteria independent of
the FPS60 threshold. Missing or cold evidence fails, never an empty-set pass.

Surface rig contribution includes fitted surface tools/strings and is graded
against unchanged<=70. Surface-band total<=80 is separate. Actual whole-frame
calls and rig AO/shadow contributions are separate diagnostics. Instrumented
render wall duration includes wrapper and render work; wrapper-only overhead
is unmeasured. Scratch extra calls/wall duration are reported and never folded
into clean FPS. No cold/historical/private-runtime comparison is allowed.

## Exact blocker and verified closure

Root granted exact lease `optimized-rig-runtime` after full build79082 completed
and its reach browser closed. Task reread exact token before its sole startup:
`node tools/serveoptimizedrigruntime.mjs`.

Owned Vite PID41636/session59410 bound127.0.0.1:5208, then esbuild reported:

> X [ERROR] Cannot read directory "../../..": Access is denied.

Relative Three.js imports then failed in ShaderPass, EffectComposer, SMAAPass,
UnrealBloomPass and GLTFLoader under the shared node_modules junction. No GLB
or renderer-budget cause is established: the blocker is the preview environment's
dependency access/resolution. No retry, alternate config or permission bypass
followed. No browser, Blender or GPU process was launched by this task.

Ctrl-C returned session exit1. Subsequent process41636 and socket5208 checks
returned no entries. The server's graceful-close callback file was absent;
closure evidence is session exit plus process/socket absence. User5178 and
root5198 were untouched. The request file records closure; root owns transfer
of the still-named lease.

## Verification and required next step

Final Node syntax checks pass for both new scripts;15 CPU sample-gate adversarial
cases pass. Both reviewers read the current probes and owner rules. They caught
and the author corrected stub/simulation, frame/program completeness, finite
deadlines/restoration, target/geology and evidence-label errors. Final harness
SHA256 is `dded0bc81fced7419fd165798b4561592b2879d8043615f7a98bf7b5b5a7ed36`.
The final identity/device gate edits postdate the independent reviewed hash;
they need root review. The harness has never been browser-validated.

Root/Claude follow-up: review final five-path patch, provide an authorized
functioning private preview environment without retrying this denial, renew the
exact lease, and perform the finite8 cases against these frozen matching bytes.
Do not use root5198/user5178 as a workaround or weaken thresholds. Diagnose any
actual gate failure from source/asset/pass-specific raw measurements before
assigning renderer/model changes. Preserve worktree and evidence; do not archive
until root review/integration/runtime verification. Latest observed active pool
10% remaining; no new long jobs were assigned after that check.
