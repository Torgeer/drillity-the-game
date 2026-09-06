# Drilling view space — independent DOM measurement

Status: final 612-case candidate matrix, 246 supplementary cases and four
maximum-input cases complete on matching frozen source. Each report retains
the two font/network failures. This report is not a renderer,
performance, intended-font, or 82% acceptance claim.

## Instrument

`tools/checkdrillingviewspace.mjs` builds a dedicated fixture from the actual
`createSiteScreen`, components, catalogue and CSS. Baseline production sources
come from `git show a3fb994:<path>`; current production sources are frozen in
memory for one run and identified by SHA-256. The fixture supplies synthetic
telemetry. Its owned animation loop executes the actual screen continuously
with the production main loop's 0–1/15 second dt clamp.
All captured cases use DPR 1. Screenshot geometry and 2D instrument drawing
come from that same continuously updated fixture state.

Chrome runs headless with `--disable-gpu --disable-webgl
--disable-software-rasterizer`; WebGL context requests are rejected and recorded.
No renderer is instantiated and no model assets are loaded. The catalogue's
transitive static tool definitions are bundled, but no geometry builder runs.

The unmodified `.hudqa/enumerate.js` measures painted overlap, horizontal text
clipping, hit testing and the scene spacer regions. Additional measurements
record native control bounds, the actual pointer-sensitive slider tracks,
text Range boxes against clipping ancestors, CSS/font metrics, the published
`ctx.hud` insets, visible 2D canvas backing dimensions and source hashes.
Distinct lines in one text node are also compared for intersecting Range
boxes; this found a caption defect the separate-node overlap enumerator missed.
Existing `checkreach.mjs` assessment code is extracted and executed unchanged
at its native 390×844 viewport. Other viewport control positions are reported;
no scaled physiological reach model is invented.

The confirmation tests execute the exact production shell's `confirm`,
`closeOverlay` and overlay Escape handler, with the actual DOM components.
Normal and reduced motion test safe default focus, Escape/cancel retaining the
run, focus return, and one abort/navigation only after explicit confirmation.
The renderer, simulation and navigation destination are mocked boundaries.

## Coverage and retained limitations

The main final matrix covers 320×568, 390×844, 390×664, 280×653, 360×640,
393×852, 430×932, 375×667 and 320×844, normal and reduced motion, 18 method
control/programme families, eight programme unit-card families, and selected
plain-method beats: 612 cases. Cards include three and four cells.

The supplementary fixture enumerates every actual `BEAT_COPY` key and every
actual `SITE_ACTIONS` key, checks those sets against production source, and
supplies matching family contexts. It also tests gaining/losing well states
with a negative pressure margin and the friction-specific bolt-install copy:
41 supplementary states × three viewports × two motion modes = 246 cases.
Safe-area injection uses top 47 px and bottom
34 px at 390×844. These are explicit test inputs, not a device measurement.

The HTML uses the real `index.html` Google Fonts link. This environment denies
that network request with `net::ERR_NETWORK_ACCESS_DENIED`. CDP proves the
measured glyphs use Segoe UI Black / Segoe UI fallback faces. No fonts were
invented, downloaded by an alternate route, or substituted into production.
Intended Inter layout validation remains incomplete, and the runner
returns failure for that missing evidence even if its geometry checks pass.
Oswald is requested by the real page link but is not used by the sampled site
text; its absence is not a separate invented site-font requirement.

## Baseline measured

`shots/drilling-view-space-final/baseline.json` completed 612 cases using the
continuous production HUD update loop. DOM scene opportunity spans
45.4225–67.8112% of the actual stage and 45.3846–67.8112% of the viewport.
The 320×568 and 390×844 cases reproduce the prior 45.4225–67.2986% envelope.

The stage calculation uses the real `.ui-stage.is-site` CSS, including the
existing baseline minimum 320 px width rule. A 320×568 site therefore has a
320 px stage; the generic `--stage-w` 284 px cap does not override the site
rule. Letterbox gutters are excluded from viewport scene opportunity.

Baseline fallback-font measurements found 1,608 painted overlap pairs,
494 horizontal clipped labels and 3,528 text Range/ancestor clip records
across those cases; these are repeated per-state records, not distinct bugs.
There were no undersized hit targets. The full baseline fails on these layout
findings, some reduced-motion HUD inset mismatches, and unavailable webfonts.

The baseline and final runner hashes differ. The 612 named main-matrix
geometry cases remain comparable; later runner/fixture additions cover 2D
canvas backing size, delayed first telemetry, and the supplementary
friction/well states. Those additions are candidate-only checks, not claimed
as measurements of the recorded baseline. Raw report hashes retain this
distinction.

## Final main matrix

The final candidate completed the same 612 case names as the recorded
baseline; an exact ordered-name comparison passed. Its only two reported
failures are the denied Google Fonts request/browser error and the missing
proof of Inter. There are no JavaScript page errors or WebGL attempts.

| Recorded main-matrix measure | Baseline | Candidate |
| --- | ---: | ---: |
| Painted overlap pairs | 1,608 | 0 |
| Horizontal clipped labels | 494 | 0 |
| Text Range / ancestor clip records | 3,528 | 0 |
| Undersized enumerated targets | 0 | 0 |
| Stage scene-opportunity envelope | 45.42–67.81% | 48.24–75.32% |
| Whole-viewport opportunity envelope | 45.38–67.81% | 47.44–75.32% |

Additional candidate checks found zero same-text line intersections, native
controls/tracks below 44 px, painted UI on scene spacer bands, hit-test
failures, or published-inset mismatches. The 68 native-size reach cases pass
the existing 390×844 assessor. All 120 held-button samples across 32 states
retain their native dimensions and remain free of painted overlaps.

Every visible 2D canvas matches its CSS size × DPR within 1 px rounding
tolerance. Four delayed-first-telemetry probes pass without an explicit
screen resize. Injected safe-area layout, native targets, reach and published
chrome pass. Normal/reduced confirmation both default to Keep drilling,
retain the run on Escape/cancel, return focus, and abort/navigate exactly once
on confirmation.

The final supplementary sweep completed all 246 cases with zero geometry,
interline, native-target, reach, published-inset or canvas failures. It covers
all 29 `BEAT_COPY` keys, all nine `SITE_ACTIONS` keys, the friction-install
variant and gaining/losing well states at 320×568, 390×844 and 280×653 in both
motion modes. The final four maximum-input cases supply input01=1 for jet at
375×844 and 390×844, both motion modes; full WITHDRAW labels fit. These two
reports retain only the same font/network failures as the main run.

## Findings that changed the candidate

- Four-cell outcome cards clipped labels such as Half-barrel, Into bearing,
  Inclination and Energy ratio. The compact implementation now gives those
  cards two rows while preserving three-cell fitting and caption line-height
  1.4.
- The oil pit state collided with its pressure margin. Three friction-bolt
  action labels and long generic beat text also needed measured fitting.
- The existing reduced-motion universal `transition-duration:1ms` rule gives
  previously unanimated elements an implicit transition because their default
  transition property is `all`. Instrumented `ctx.hud` writes observed a plain
  dock publishing 254 px while its class already said plain, then settling to
  182 px with no later publication. Scoped `transition-property:none` on the
  dock was verified to publish the final 182 px in both motion modes. This was
  a real measured lifecycle defect, not a measurement waiver.
- Raw text Range boxes exposed vertical clipping from 11 px slider label
  boxes around 15 px fallback font metrics and 14.94 px outcome value/title
  boxes around 17 px metrics. Site-scoped line-height and spacing changes
  removed those failures in the verified 320/390 refinement states.
- After the dock publication fix, reduced motion still sized a plain gauge
  canvas to a transient 48 px backing height while its CSS height settled to
  32 px; the no-auxiliary two-stage card had a 48 px backing against 64 px CSS.
  Removing structural height transitions from the site rows, gauge box and
  canvases fixed these measured mismatches. The probe also releases first
  telemetry after mounting, without calling `screen.resize`, and checks both
  motion modes. Interactive control/state motion remains outside that fix.
- The complete beat sweep found narrow friction-install, blow-down,
  cradle-indexing and replacement-pile text exceeding their reserved boxes.
  Compact copy and alert line-height changes passed all 36 affected cases at
  280×653, 320×568 and 390×844 before the full candidate run.
- The first complete candidate sweep exposed viewport-based slider rules that
  missed letterboxed stages: 390×664 has a 332 px site stage, and 375×667 has
  a 333.5 px stage. Their input numbers competed with full control names,
  clipping ROTATION, CLEANING, WITHDRAW, HAMMER and CADENCE. A separate
  maximum-input probe is required because the rendered `100` is wider than
  the main matrix's `50`.
- The pile blow chart measured its initial one-line caption, then added toe
  depth and wrapped the caption. This left a 59 px backing canvas in a 48 px
  CSS box. The first viewport-resize case also retained a prior-width gauge
  backing size; that is reported as an isolated fixture lifecycle finding,
  without claiming the real app's resize dispatcher was executed.

## Render integration boundary

DOM opportunity is the area of the two unpainted site spacer rectangles.
It is an upper opportunity for a renderer using the same stage and chrome;
it is not evidence that the actual renderer draws visible scene pixels there.
Opaque chrome and side gutters are never counted as visible 3D.

This private branch has the older camera/renderer from baseline `a3fb994`.
The parent's uncommitted hero/instrument renderer has not been captured by this
fixture. Its stage width, chrome clamp, band seam, readability and actual
unoccluded rendered scene must be checked after integration. No combined
renderer/HUD proof and no FPS result are claimed here.

## Before/after reserved DOM space

These percentages measure scene spacer opportunity, with identical state names
and stage rules. The compact status strip is 40 px versus 52 px. The ordinary
dock is 190 px, the auxiliary-programme dock 254 px, and the no-auxiliary
two-stage card dock 222 px; safe-area inputs add their explicit reserves.

| Viewport / state | Stage width | Stage opportunity before → after | Whole viewport before → after |
| --- | ---: | ---: | ---: |
| 320×568 ordinary rotary | 320 px | 53.87% → 59.51% | 53.87% → 59.51% |
| 320×568 RC programme | 320 px | 45.42% → 48.24% | 45.42% → 48.24% |
| 320×568 two-stage card | 320 px | 53.87% → 53.87% | 53.87% → 53.87% |
| 390×844 ordinary rotary | 390 px | 67.30% → 72.75% | 67.30% → 72.75% |
| 390×844 RC programme | 390 px | 61.61% → 65.17% | 61.61% → 65.17% |
| 390×844 two-stage card | 390 px | 67.30% → 68.96% | 67.30% → 68.96% |
| 375×667 ordinary rotary | 333.5 px | 60.72% → 65.52% | 54.00% → 58.27% |
| 375×667 RC programme | 333.5 px | 53.52% → 55.92% | 47.60% → 49.73% |
| 320×844 ordinary rotary | 320 px | 67.30% → 72.75% | 67.30% → 72.75% |
| 320×844 RC programme | 320 px | 61.61% → 65.17% | 61.61% → 65.17% |

The two-stage card on the shortest phone gains no scene area: its preserved
three-cell outcome needs the larger stable instrument reserve. The narrow
280 px ordinary dock also reserves an additional 16 px for complete beat copy.
This implementation does not reach 82% on either primary phone.

## Source identity

Hashes are SHA-256 of the exact bytes frozen for the run; the JSON files also
record every other bundled production input and the unchanged enumerator.

| Input | Baseline recorded run | Final candidate |
| --- | --- | --- |
| `src/ui/screens/site.js` | `fd7395f927f490b97a7c21c79c6e09c485434492f13dffb242c31ef0bb0be2cf` | `bad773d03fb8c0c9055b84c7668a2e10fd3accddd0bcc6277ea7fc1be1359a3d` |
| `src/ui/styles.css` | `52e4f7d1d9f707f0065203a88404490e76cbeb4533ad693ad022b0a1d4ce6dc0` | `7849f13c9a34d27f0beeb563f0e14e7c40055ffc2f103977c54452708a0284c5` |
| Runner | `3aa6b3306ad93716ed068118ee374fb5a084aeecc8eaad68559c1acd263e9175` | `5b9089a1b01a52ebc776e9e07796afab82da7417fda6c37c8ebffcfb299fab8b` |
| Fixture | `ab57d32ac76a44059badea008161b872c3b1e8d1a53b87ba43d39afa6ef431d0` | `faa1a07564358a0e8e23291988d6f025321187e054c88a774c8080aaa160fab0` |

The final runner adds immediate failure reporting, exact three/four-cell card
assertions, a rejection for an empty case matrix, same-text line intersections,
and the optional maximum-input probe. Its default 612 case names and synthetic
input values match the recorded baseline. The 30-case
`drilling-view-space-boundary-final` report uses the earlier pre-cache-fix JS
hash `8c6d156a…`; it is diagnostic typography evidence, not a final-JS match.

## Reproduction

```powershell
Set-Location C:\Users\henri\Downloads\threads\drillity-drilling-view-space
node tools/checkdrillingviewspace.mjs --tag baseline --out shots/drilling-view-space-final
node tools/checkdrillingviewspace.mjs --tag current --out shots/drilling-view-space-final
node tools/checkdrillingviewspace.mjs --tag current --supplementary --viewports 320x568,390x844,280x653 --out shots/drilling-view-space-supplementary
node tools/checkdrillingviewspace.mjs --tag current --families jet --only-modes steady --viewports 375x844,390x844 --input01 1 --out shots/drilling-view-space-maximum-input-final
```

Re-running the baseline with the final runner also executes its later added
assertions. The saved baseline's failure count belongs to the recorded earlier
runner hash; its 612 geometry cases are the comparison used above.

The runner closes its owned browser and HTTP server in `finally`, then writes
each JSON report through a temporary file and rename. Earlier quick/refinement
reports are diagnostic snapshots; the final directory and matching source
hashes identify the deliverable evidence.

Final evidence folders, each containing `current.json` and matching PNGs:

- `shots/drilling-view-space-final` (also contains the recorded `baseline.json`
  and baseline PNGs).
- `shots/drilling-view-space-supplementary`.
- `shots/drilling-view-space-maximum-input-final`.

All three final JSON reports were checked for the exact final site, CSS and
runner hashes and the same two expected font failures. The owned browser and
HTTP server closed successfully before each atomic final report was written;
no measurement browser or service remains running. Runner and fixture are
frozen. The diagnostic `before-stage-fix` and `boundary-final` folders are
retained for the failure history and are not final acceptance evidence.
