# Instrument lifecycle GPU validation

## Root integrated result — 2026-09-06

The six-case headed run now passes in
`shots/instrument-lifecycle-postfix/report.json`: zero new programs immediately
after warmup, zero frozen repeat differences, zero failed assertions, errors or
failed resources. The browser closed normally. Source hashes are recorded before
and after in the report; renderer SHA256 is
`7e628334cefd403ed0ad38ea09150a4df9f83d0d2b06b73e56b5a28e33d0b02c`.

The earlier `shots/instrument-lifecycle-programs` run failed four immediate
post-warm checks. It disclosed three missing SMAA materials on medium/high and
a screen Grade variant plus two depth programs on low. The post destination fix
described in POST_WARMUP_DESTINATIONS.md was the only subsequent renderer edit.
None of those new programs appeared in the latest run. No separate shadow
warmup change was made; disappearance of the depth variants alone does not prove
their earlier cause. Both reports are retained.

Actual target sizes:390 high/medium780x1688,390 low585x1266;320 low480x852,
320 medium/high640x1136. Target ownership/disposal and source identity checks
pass. Root inspected the320-high whole-page and390 vertical instrument images:
footer text is legible without the prior stretching softness, and numeric depth
remains visible. This is a narrow manual inspection, not a fleet-wide readability,
contrast, overlap or performance certification. HUD space remains separate work.

The companion ten-case A/B also passes at
`shots/instrument-grade-converged/report.json`: zero repeat differences,
zero changed world pixels outside instrument alpha, and zero opaque-instrument
differences when photographic optics change. Every case first reached three
identical consecutive RGB frames in3-5 draws, within a strict16-draw bound.
No settling occurred after comparison toggles and no thresholds were relaxed.
Retained warnings identify the separately assigned underground lamp binding bug
and deliberately unpaid QA preview. Neither is presented as fixed by this work.

## Original harness preparation (historical)

2026-09-06. This is a report stub for `tools/checkinstrumentlifecyclebrowser.mjs`.
No browser/GPU was launched by its author. `node --check` passed. No production
source was modified for this preparation task. Actual GPU results and manual
image review remain pending with the root coordinator.

Run only after the root has assigned the exact `instrument-grade` GPU lease:

```powershell
node tools/checkinstrumentlifecyclebrowser.mjs --port 5198 --lease C:/Users/henri/Downloads/threads/drillity-coordination/gpu-owner.txt
```

The harness requires an existing server and never launches or stops a server.
It runs one actual DTH GLB through six states: high/medium/low at390x844, then
low/medium/high at320x568, DPR2 subject to the actual quality cap. Quality changes
exercise production post-chain disposal/reconstruction with instruments visible.
The browser viewport and actual owners are resized. Full WebGLRenderer disposal
and recreation are outside this bounded matrix and are not claimed.

Assertions use actual drawing-buffer size, instrument target ownership and
dispose events, unique live instrument meshes, finite geometry APIs, finite
half-float target samples, nonempty/opaque source coverage, preserved layers,
context health and repeat pixels. The harness verifies that actual warmShaders
binds the current instrument target. It saves program identities immediately
after warm-up and after the FIRST render, before any settling, and fails on new
programs. Following frozen renders have another strict program/repeat assertion;
settling never hides the immediate post-warm result. The prior first-frozen-frame
artifact does not establish a shadow cause.

Automatic system updates/rendering are temporarily replaced inside the private
page while lifecycle measurements run; resize methods remain real. Frozen owner
updates are called at zero dt to refresh layout. Finally restores captured methods,
closes context/browser and records browserClosed. HMR alone is suppressed. Console
errors, request failures and INVALID_/CONTEXT_LOST WebGL warnings fail the run;
other warnings remain visible in report.json. Source hashes are checked before
and after capture to reject edits during validation.

Outputs: `shots/instrument-lifecycle/report.json`, six canvas PNGs and six whole
page PNGs. Inspect footer/ruler/readout at both viewports for actual readability,
clipping and overlap. The tool does NOT certify text readability, real contrast,
FPS, GPU timing or absence of long-term leaks automatically.

Frozen preparation SHA256:

- tools/checkinstrumentlifecyclebrowser.mjs:2e990f2cf7af384b2dd1b976436ef5d19b45a8789ef1b17140d54cbc68b15225.
- src/core/renderer.js:d3617da51095d6781c2bb2254169c0db5769ea44ca56ee7a1aa207aa79e74781.
- src/world/geology.js:381dc07762aaa22707c3b343c58adf669c588dda1557920340b0ffeedb0628d9.

These are preparation hashes, not assertions that the root must never update the
candidate. The harness captures its own fresh before/after hashes when executed.
