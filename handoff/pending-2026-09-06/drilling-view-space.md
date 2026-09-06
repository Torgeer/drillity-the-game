# Drilling view space — scoped delivery for parent review

Status: source and DOM evidence ready for review; overall font gate still FAIL.
82% and integrated rendered visibility are NOT achieved or accepted here.

Private checkout: C:/Users/henri/Downloads/threads/drillity-drilling-view-space
Branch: codex/drilling-view-space
Baseline/HEAD: a3fb99412d4996d352e3e95609bb5b3ff8d2752f
Production ownership: src/ui/screens/site.js and site/HUD portions of src/ui/styles.css only.
No renderer, geology, camera, model, simulation, contract/economy, menu, atlas,
global stage geometry or asset changes. Shared dependency/model junctions read-only.

## Exact delivery

- Patch: drilling-view-space.patch (two production files and four new test/report files).
- Manifest: drilling-view-space.manifest.json (SHA-256 for every delivered file and selected evidence).
- Patch SHA-256: 643c1d1a93f90a0e379f0d503fd630b4ddb8097589ce881797a741c972792bae
- site.js SHA-256: bad773d03fb8c0c9055b84c7668a2e10fd3accddd0bcc6277ea7fc1be1359a3d
- styles.css SHA-256: 7849f13c9a34d27f0beeb563f0e14e7c40055ffc2f103977c54452708a0284c5
- Full independent reports: research/drilling-view-space-layout-analysis.md and research/drilling-view-space-measurement.md in the private checkout and patch.

Final patch validation: `git apply --check --reverse` PASS against all six
captured working files; `git diff --check` PASS. No index mutation was needed.

## Measured result

The historical45.4–67.3% metric was DOM scene opportunity from the two empty
site spacers, not actual rendered pixels after opaque-ruler/log subtraction.
The final nine-viewport612-case baseline spans 45.42–67.81% of the DOM
stage; final candidate spans 48.24–75.32%. Viewport-area share is
45.38–67.81% before and 47.44–75.32% after.
Identically named cases reclaim 0–70 vertical CSS pixels;
some short no-auxiliary unit-card cases gain zero because readable outcomes need
their own stable reserve. No paired DOM opportunity regression was observed.

| Viewport | Plain | Auxiliary programme | No-auxiliary unit programme |
|---|---:|---:|---:|
| 320x568 | 53.87 → 59.51% | 45.42 → 48.24% | 53.87 → 53.87% |
| 390x844 | 67.30 → 72.75% | 61.61 → 65.17% | 67.30 → 68.96% |
| 280x653 | 59.88 → 62.33% | 52.53 → 54.98% | 59.88 → 59.88% |
| 390x664 | 60.54 → 65.36% | 53.31 → 55.72% | 60.54 → 60.54% |
| 375x667 | 60.72 → 65.52% | 53.52 → 55.92% | 60.72 → 60.72% |
| 320x844 | 67.30 → 72.75% | 61.61 → 65.17% | 67.30 → 68.96% |
| 430x932 | 67.81 → 75.32% | 62.66 → 68.45% | 67.81 → 71.89% |

These percentages exclude opaque HUD and side gutters. They do not prove the
renderer uses the same rectangles or that its instrument panels leave them visible.
The report includes a conditional bound explaining why the retained stacked
controls/footer/instruments cannot supply82% on the tested phones.

## Changes and verification

Compact horizontal target gauge keeps the real units, sweet spot, limit and
spring pointer. Numeric depth/target remains. Full control names, programme
outcomes and leave confirmation remain; four-cell outcomes use two columns,
three-cell fitting and caption line-height1.4 are preserved. Site container
queries use actual stage width. Native44px targets keep their bounds while
pressed. Height reservation is stable per run:190px plain,254px auxiliary,
222px no-auxiliary unit card,206px ordinary plain at≤300px, plus40px status
before safe-area additions.

Final612 main and246 supplementary synthetic-telemetry cases have zero
layout, clipping, interline overlap, small-target, canvas/backing, published
chrome or interaction failures. Coverage includes18 families,8 card families,
all29 beat and9 primary-action entries, oil gain/loss, both motion settings,
47/34px safe-area injection, delayed telemetry, and leave confirmation.
Four further final-source cases verify maximum-input labels at375/390px.
Actual CSS/native geometry uses DPR1; the existing physical reach assessor is
used only at its calibrated390x844 viewport, not extrapolated to other phones.

Syntax, git diff whitespace, checkreach --self-test, checkmotion and checkqa
pass. checkhaptics still fails the untouched baseline tools/check-ui-atlas.mjs
mute check; no exemption or out-of-scope fix was made. The parent already has
a newer haptics fix; it must rerun the integrated checks. No full game build,
headed reach, FPS or combined-renderer validation was performed here.

## Remaining integration work and resources

The actual Google Font request was denied by ERR_NETWORK_ACCESS_DENIED.
CDP identifies Segoe UI/Segoe UI Black fallback. All three final runs retain
their two explicit browser/intended-font failures and exit nonzero; no route
around the denial, approval request or font substitution was introduced.
Intended Inter/Oswald proof is still required in the parent environment.

No headed Chrome/WebGL/GPU session was started by this task. Its CPU browsers
reject WebGL and disable GPU; its owned browsers/servers were closed after
each run. The known orphan storage utility was not ours to terminate. User
server5178 and other tasks' servers/processes were not stopped.

Parent must review/apply this exact patch and capture the HUD with its current
hero/instrument renderer. Include375x667 and320x844, compare ctx.hud/ctx.stage/
ctx.bands with actual DOM rects and subtract opaque renderer panels. Numeric
depth remains until the integrated ruler is accepted. See the separate
drilling-view-space.gpu-request.md for precise stage/scissor hypotheses.
Private HEAD has the older renderer; unrelated captures cannot provide this proof.

This worktree is preserved and has not been committed, pushed or integrated.
Parent owns integration, remaining verification and task archive.

Final live account check: 9% remaining. This task has stopped new work;
all scoped files, evidence and reviewed patch are saved and resources closed.
