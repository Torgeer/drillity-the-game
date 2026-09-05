# Geology ruler implementation — 2026-09-06

Private worktree `C:\Users\henri\Downloads\threads\drillity-geology-ruler`.
Production ownership: `src/world/geology.js` only. No renderer, site, styles,
packages, factual catalogue or model edits. The synchronized initialized,
single-return `boreSDF` is preserved byte-for-byte.

## Final behavior

- The index marker prints the action point's true vertical depth in every
  mode. Horizontal measured length no longer appears on a TVD axis. Raise
  and HDD return passes track the returning action instead of the initial
  drilled length. The heading axis is TVD; the horizontal axis is OFFSET.
- A deep HDD profile translates the vertical window only when necessary to
  keep its real action point above the footer. Its physical scale is unchanged;
  the marker is never pinned to an incorrect depth. Independent Three.js
  projection of a 15 m fixture measured **3.000000 CSS px** clearance between
  the marker mesh bottom and the footer top. Spud datum remains 31.0592 CSS px
  below the top in the 390×844 fixture.
- Ruler width has a 56 CSS px floor; numbers use 12/10 px type. The cursor is
  at least 76 CSS px wide. Log names are 11 px and secondary/code text 10 px.
  These are authored layout choices, **NOT SOURCED physical dimensions**.
- Log labels use the actual retained-window offset and visible bed portion,
  reserving the footer and projected divider before fitting a label. All
  strip positions and fracture clipping reset when leaving horizontal modes.
- Two full-width footer rows use 11 px type in 36 CSS px. Nominal and drawn
  diameters plus `DRAWN×…` come from current mode uniforms. Profile/raise
  qualify the final diameter; heading declares true tunnel height instead of
  a fictitious circular bore. Clipped miniature comparison bars were removed.
- Heading's vertical geological column is identified as projected and no
  longer prints laboratory strengths or assays for every bed above the drive.
- Ruler labels reserve the cursor's painted area, and heading no longer puts
  a `TD` datum at its constant tunnel-axis depth. Profile exit is `EXIT`.

## Verification

The original unexecuted draft was run first: **81 cases / 3,289 assertions /
227 failures**, exit 1. Stale negative-spud and rejected-camera claims did not
reproduce. Final enforced CPU runs cover **132 cases** with **9,845 assertions
at 0.62 em** and **9,707 at 0.74 em**, both zero failures. Character widths in
these two runs are synthetic; their limitations remain explicit in the tool
and `GEOLOGY_REGRESSION.md`.

`tools/checkrulerbrowser.mjs` is a separate headed full-game instrument test.
It records actual `CanvasRenderingContext2D.measureText()` bounding boxes and
projects them through the live section camera. It freezes simulation and seeks
explicit layout fixtures; screenshots are not evidence of physical progress,
game balancing, or FPS. It verifies actual GLB source and closes Chrome in
`finally`. It refuses to launch without the exact shared GPU lease.

Evidence directories (generated, not source):

- `shots/ruler-integration-now`: existing rig-visual harness reached all five
  modes with actual GLBs, nonempty rendered frames and no lost contexts. Its
  overall run failed due a resource error; shaderWarnings was empty. Many
  deleted-program WebGL warnings were also recorded. No clean-browser claim.
- `shots/ruler-browser`: 12 actual-font spud/scroll/return states. Eleven
  passed layout; profile return exposed the real offscreen action at 15 m TVD.
  This is preserved failing evidence from before the vertical-window fix.
- `shots/ruler-profile-fixed`: interrupted by a Vite hot reload, measured zero
  cases; not evidence of production failure. The dedicated harness now freezes
  HMR during capture and requires a new run for each source snapshot.
- `shots/ruler-profile-fixed-final`: three post-fix profile states, zero glyph
  layout failures. Return progress in this earlier fixture was synthetic with
  an incomplete pilot; do not use it as proof of drilling-stage realism.
- `shots/ruler-profile-return-final`: final consistent return-pass capture,
  completed 943.8 m pilot followed by 80% return progress (755.04 m),
  **zero actual-glyph layout failures**, action/cursor **14.860059 m TVD**.
  The screenshot visibly retains the cursor above the footer. Its only
  failed request is the Google Fonts stylesheet; the overall tool exits 1
  rather than hiding that error. Chrome closed in the finalizer.

Browser runs record a blocked Google Fonts stylesheet
(`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap`,
`ERR_NETWORK_ACCESS_DENIED`). Glyph measurements therefore verify what the
browser actually rendered, including fallback faces, not downloaded font
availability. `document.fonts.check()` can pass without a matching font-face;
the current tool states that limitation and records actual font-face entries.
The final capture reports only `Oswald Fallback` loaded in that collection.
It does not turn that resource error into a passing overall verdict.

## Measured cross-file handoff

The parent confirmed restoration of ordinary numeric depth/target in `site.js`
and a passing 44 px rail layout. This private snapshot's HUD predates that
restoration, so screenshots here do not prove the parent's latest HUD. Keep
the numeric fallback: the ruler's final visual treatment still needs work.

The adversarial reviewer saw red/blue fringing and darkened footer text in
all five full-game captures. `renderer.js` applies `uChroma=1.25` universally
(opposite red/blue offsets, up to 2.5 render px separation / 1.25 CSS px at
DPR 2), section-bottom vignette multiplier 0.72 at `uSectionVignette=0.28`,
global vignette and grain. This is source arithmetic plus visual observation,
not a causal A/B or measured contrast ratio. Narrow proposal: exclude the
instrument layer/rectangles from chromatic split, vignette and grain after
tone mapping, preserving the world grade. `material.toneMapped=false` alone
does not bypass the custom full-frame pass. No renderer changes made here.

The already measured surface/section scale ratio **2.811983108** remains a
separate camera-framing decision. The ruler must not conceal it. The CPU
3,000 m fixture also exposed the existing basement-generation cap at
2,061.891110 m; it verifies four-digit labels, not a cursor near 3,000 m.

## Integration and permissions

The ordinary scoped Git add failed because the private worktree's Git index
lives outside this task's writable sandbox:
`C:/Users/henri/Downloads/drillity-the-game/.git/worktrees/drillity-geology-ruler/index.lock`.
No commits were created. One readability agent had an earlier escalation
pending for 951.9 seconds until aborted; root interrupted it and resumed
without a Git retry. No further approval prompts are requested.

`GEOLOGY_RULER_SOURCE.patch` is the geology-only delta from the synchronized
starting file, deliberately excluding the parent's already-integrated
`boreSDF` change. Parent can apply that patch and copy the following owned paths
explicitly, then create scoped commits from its writable integration context:

- `tools/checkruler.mjs`
- `tools/checkrulerbrowser.mjs`
- `research/GEOLOGY_REGRESSION.md`
- `research/GEOLOGY_READABILITY_REVIEW.md`
- `research/GEOLOGY_RULER_ADVERSARIAL.md`
- `research/GEOLOGY_RULER_IMPLEMENTATION.md`

The three actual subagents were `projection_regression`, `log_label_review`
and `adversarial_ruler`; their independent reports remain separate. All other
synchronized modifications in this worktree are pre-existing and unowned.
