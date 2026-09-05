# Geology ruler adversarial review

Date: 2026-09-06. Private worktree: `drillity-geology-ruler`.
This reviewer owns this report only. No browser, WebGL, GPU, installation,
renderer, site-screen, shader, or production-source edits were performed.

Read the complete `ASTRA.md`, its current
`research/ASTRA-progress-2026-09-06.md` checkpoint, all three existing geology
reviews, the relevant `GAMEDESIGN.md` contract and `CRITIQUE.md` finding 14,
and actual ruler, projection, shader, renderer and site-screen source.
Historical complaints were checked against this source rather than accepted
as current failures.

## Evidence and limits

The independent CPU probe imported the actual `createGeology()` and Three.js.
It created an orthographic camera using the renderer's width-anchor formula,
then settled each case for 90 updates at 1/30 s. Fixture: 390 x 844 stage,
390 x 261 section band, seed 20260903, requested target 60 m, difficulty 0.25,
nominal diameter 152 mm. These are synthetic test inputs, **NOT SOURCED
physical dimensions**, and are not an assertion about the shipping DOM band.
Generated mode totals are taken from `modeLayout.totalLength`, not guessed
from requested target depth.

The Canvas2D recording stub returned a deliberately synthetic text width of
0.62 em per character. It recorded the actual strings submitted by production
code. World positions, camera projection, action-point TVD and numerical
string mismatches do not depend on that width. It provides no rendered glyph,
font-loading, clipping, contrast, shader-compilation or usability evidence.

## Confirmed incoming defects

### A1. The marker prints measured length on a true-depth axis

`update()` sends raw `depth` to `drawReadout()` but positions the horizontal
marker at `actY`, the true vertical depth of the action point. This gives one
marker two incompatible meanings. The actual generated values were:

| Mode/state | Action TVD (m) | Printed marker | Marker center from band top (CSS px) |
|---|---:|---:|---:|
| Profile, 35% first pass | 7.316639 | 55.12 | 173.089796 |
| Profile, 95% first pass | 0.624867 | 149.6 | 43.189125 |
| Profile, 40% pullback | 4.998939 | 157.5 | 128.098599 |
| Profile, 90% pullback | 3.892647 | 157.5 | 106.623273 |
| Heading, spud | 38.578254 | 0.00 | 135.72 |
| Heading, 35% advance | 38.578254 | 21.00 | 135.72 |
| Heading, 95% advance | 38.578254 | 57.00 | 135.72 |

The profile generated a total measured length of 157.485442 m; the 60 m
requested target is not its solved length. This distinction matters when
constructing a regression fixture.

The right-axis marker should print the action point's TVD and explicitly name
that axis. Along-bore MD and tunnel chainage remain useful progress quantities;
replacing their only readout with TVD would lose that information on a flat
segment or a constant-depth heading.

SLB defines measured depth as wellbore length and TVD as vertical distance to
a reference datum. These are distinct quantities away from a vertical well.
The game's datum is its local depth zero, so the UI should not imply a
different surveyed reference elevation.
Sources: [SLB, measured depth](https://glossary.slb.com/terms/m/measured_depth),
[SLB, true vertical depth](https://glossary.slb.com/Terms/t/true_vertical_depth.aspx),
[SLB, depth reference](https://glossary.slb.com/terms/d/depth_reference).

### A2. Raise reaming leaves the marker at the bottom of the completed pilot

`actionStation()` reverses stage-two travel, but the nonhorizontal readout
position remains `-smoothDepth`. For a generated 60 m raise with completed
pilot depth 60 m:

| Ream progress (m) | Actual head TVD (m) | Readout TVD (m) | Head Y / readout Y within the 261 px band |
|---|---:|---:|---:|
| 24 | 36 | 60 | 78.3 / 544.188 |
| 54 | 6 | 60 | 78.3 / 1126.548 |

The number and its own Y coordinate agree, so a test that only compares those
two can pass while the marker is attached to the wrong point and is entirely
off screen. The projection-regression author was asked to compare marker
position to `boreholeTip` directly. If later design clamps an offscreen head,
the test must require an explicit directional indicator instead of silently
treating the clamped marker as a true depth position.

### A3. Profile X is horizontal distance, not measured bore length

`secXForStation()` converts measured length through `hddXAtStation()`, while
`drawStationRuler()` labels uniformly spaced `s / metresPerUnitX`. Its labels
therefore measure the horizontal projection. Calling the footer's X axis
`BORE` can imply the same along-bore quantity that the sim calls depth.

Use an unambiguous horizontal-distance/station label and keep MD separately
identified. Do not change the geometry to force two different quantities to
match. SLB's displacement definition distinguishes horizontal projection from
wellbore length: [SLB, displacement](https://glossary.slb.com/en/terms/d/displacement).

### A4. A single bore ratio does not describe every opening

The incoming plate and ruler header print `spec.holeDiaMm` against `2 * holeR`
in every mode. Actual `boreSDF()` uses:

- Profile pilot: `uBore.z`, derived from `holeR * 0.62` with a clamp. Backreamed
  portions use the final radius separately.
- Raise pilot: `uBore.z`, derived from the generated `raise.pilotDiaMm`.
  Reamed portions use `uHoleR`.
- Heading: tunnel crown/invert from `uTun`; the opening does not use
  `uHoleR` at all.
- Vertical/pile: the nominal final radius, with authored irregularity/bulge.

An explicit *nominal final bore* declaration is supportable in bore modes.
Claiming it is the current pilot's measured exaggeration, or a tunnel opening
ratio, is not. Pilot/final labels should distinguish these cases; authored
irregularity should not be advertised as a precisely constant physical width.
No shader edit is needed to correct the declaration.

The incoming header also clamps only the drawn comparison bar to its strip.
The true-width bar then clips independently at the canvas edge. At sufficiently
large diameters this destroys the ratio the comment promises the player can
measure. Removing the duplicate tiny gauge or fitting both bars with a common
factor is more truthful than independently clipping them.

### A5. The incoming site screen already hides ordinary numerical depth

`src/ui/screens/site.js` constructs the depth cell hidden and updates
`showCell = !!unitFmt`; ordinary metre-based work has no `STATUS_UNIT`
formatter and therefore no visible depth cell. The comments explicitly say
the ruler replaces it. Relevant incoming source is around lines 604-643 and
2314-2327.

This conflicts with the current task instruction to retain numerical HUD depth
until actual ruler validation. This reviewer and the geology owner cannot edit
the site screen. Integration must restore or verify a working numeric fallback
for ordinary depth/MD/chainage while preserving the specialized programme-unit
formatters. A source-only ruler pass is not grounds for removing that fallback.

## Known limitations and adversarial checks

- `drawLog()`'s retained-window offset and visible-sliver tier selection are
  real incoming source defects already isolated by the log/label reviewer.
  A successful font-size check cannot establish that a label was placed in the
  visible bed intersection or away from the PROJECTED divider and footer.
- Incoming heading `logFrontier()` returns the heading-axis TVD at chainage
  zero, which made the column treat overlying beds as logged. The reviewed
  patch qualifies the heading column as projected, omits its observed UCS and
  assay claims, and preserves the existing shader uncertainty implementation.
  This resolves the displayed log claim; it is not a new geological survey
  simulation or validation of all subsurface uncertainty mechanics.
- The source's camera adoption now uses the actual measured band. This review
  independently reproduced positive spud headroom of 31.0592 CSS px and
  19.412 CSS px per true vertical metre in the reference fixture. The old
  negative-spud and rejected-camera assertions are stale.
- The camera review's surface/section 2.811983108 scale ratio is a separate
  renderer-framing issue. No source dimension or ruler number should be altered
  to conceal it; renderer integration owns any camera change.
- A font threshold in `checkruler.mjs` is an authored design criterion, not a
  WCAG standard. Synthetic width failures are valuable adversarial fixtures,
  but neither their failure nor their success certifies actual browser glyphs.
- A gate must require all five modes and nonempty instrument/text sets. It
  must fail on real assertion failures and distinguish any report-only override.
  Cursor/axis truth must be checked independently of marker self-consistency.

## Shader preservation checkpoint

Before the ruler patch, the complete shader-definition block from
`const GLSL_NOISE` up to `export function createGeology` had SHA-256
`97ad91419a4a890d1ea67132529d483f19d3d0608de53eb9e895c024433c4490`.
`boreSDF` has initialized `distanceOut`, `drilledOut` and `rOut`, followed by
one executable `return distanceOut;`. A simple keyword count incorrectly finds
two `return` tokens because one is in its explanatory comment; preservation
must compare source or parse code rather than reporting that naive count.

Source preservation demonstrates no new shader-text change. It does not prove
the runtime compiled or rendered; the integration checkpoint contains previous
five-mode headed evidence, and the final ruler still needs its own coordinated
capture.

## Patch review and independent regression

The revised production source was read and its CPU regression was executed
independently: `node tools/checkruler.mjs` reported **123 cases, 8,852
assertions, zero failures, exit 0**. This matrix includes all five modes,
mode changes, second passes, HUD band resizing, zoom, moving retained windows,
a four-digit deep well and the driven-pile chart. The harness author's report
owns the detailed fixture inventory and later checks; these counts identify
the exact execution reviewed here, not a permanent expected assertion count.

Confirmed implemented corrections:

- The cursor's number and Y coordinate both use the action point's TVD.
  Raise reaming follows the reversing head. The regression now compares the
  marker with that head, not merely with its own Y coordinate.
- The horizontal footer names TVD and horizontal offset separately. The
  profile exit datum says EXIT. Raise level datums use short UPPER/LOWER names
  that fit the wider, readable ruler gutter.
- The footer identifies the profile/raise **final** diameter using the actual
  final shader radius uniform. Heading carries a true-height statement instead
  of an unrelated circular-bore ratio. The independently clipped miniature
  gauge bars were removed.
- Log labels use the actual retained window and its usable bed intersection,
  clear the projected divider and footer, and have a width check on the UCS
  as well as the lithology name. Heading's column is explicitly projected.
- Instrument strips reset their horizontal placement when returning from a
  horizontal mode. The regression author's real mesh measurement had exposed
  the retained position: a 320 px fixture's raise log mesh was at x434.7125
  through507.8709. The corrected matrix no longer loses the strip or its
  numerals off screen. This was a real mesh-position failure, independent of
  the synthetic text-width recorder.
- Numeric ruler typography now has allocated width instead of shrinking deep
  labels to the previous 6.5 px floor. Footer/log/driving-chart checks exercise
  actual nominal projected type sizes, with real rendered type still pending.

The shader-definition block SHA-256 remains exactly
`97ad91419a4a890d1ea67132529d483f19d3d0608de53eb9e895c024433c4490`.
After comments are removed, `boreSDF` has one executable return and all three
outputs remain initialized.

The final source-consistency correction was also confirmed in the source:
`uGeoX` fracture-clip bounds now reset unconditionally along with the
instrument-strip X positions. Leaving only that update behind `if (horiz)`
would retain the previous horizontal viewport's bounds on a mode change,
since `rebuildFromProfile()` does not call `computeView()`. Related water-line,
event-label and pile-bearing placements now use the actual dynamic ruler width.

The numeric HUD restoration in A5 remains an **integration requirement**.
No independent browser capture was performed by this reviewer. The subsequent
image inspection below adds limited rendered evidence and is not approval to
remove the numerical fallback or a contrast, performance or AAA acceptance
claim.

## Inspection of the owner's headed captures

The owner later supplied five actual game captures in
`shots/ruler-integration-now/`: `section-vertical.png`, `section-profile.png`,
`section-raise.png`, `section-heading.png` and `section-pile.png`. This reviewer
opened and visually inspected all five using `view_image`, with the design
critique skill. No browser was launched by this reviewer. These are 780 x 1688
pixel images from the owner's 390 x 844, DPR 2 run; image dimensions are not
CSS font sizes.

The associated `report.json` records the requested mode, actual GLB source,
visible section and `contextLost: false` for every capture. It also records a
network-access error and deleted-program WebGL warnings. This is **not a clean
browser-run claim**. The owner owns that harness execution and its diagnostic
follow-up. Whole-frame draw counts are not per-rig budgets or warm FPS results.

### What the pixels now establish

| Instrument | Rendered observation | Limit |
|---|---|---|
| Current cursor | 2.05 vertical, 6.95 profile, 3.10 raise, 101.5 heading and 6.53 pile are readable and retained inside their bands | One captured state per mode; no live numerical projection measurement here |
| Lithology column | Complete GLACIAL TILL, FRACTURED, LIMESTONE, SHALE and other visible names fit the left edge | Does not establish every thin-bed or scrolling transition |
| Axis naming | Profile/heading display TVD and OFFSET; vertical/raise/pile display DEPTH | MD/chainage still needs the independent HUD fallback where applicable |
| Diameter declaration | FINAL and DRAWN explicitly qualify the profile/raise diameter; heading states tunnel height instead of a circular-bore ratio | A final-bore declaration does not describe the pilot's instantaneous diameter |
| Footer | Two rows have distinct positions and no visible left/right text collision in these frames | Its fine type remains much less clear than the DOM HUD |
| Driven-pile chart | BLOWS /250 mm heading and depth numerals remain on screen | Thin plotted bars and threshold rules are visually weak; this is not a usability pass for reading blow counts |

The current cursor is the strongest element in the instruments. This is the
correct priority. The log names are a substantial improvement over clipped
historical captions. However, the field is still visually dominated by bright
boulders or underground lighting, while the scale declaration occupies a dark,
visually noisy corner. Merely retaining the labels does not meet the stated
AAA readability bar.

### Rendered collision sent back for correction

In `section-heading.png`, a faint TD caption is visible immediately above the
101.5 cursor; the plate covers most of the caption, with a nearby 102 tick
label partly exposed below it. Source explains the direct conflict:
`datum(tdTvd, 'TD')` in a heading lies on the same constant-TVD line as the
action point. Tunnel progress and target are chainage, so calling that line TD
also creates an unnecessary depth-target suggestion.

The narrowly scoped recommendation sent to the owner was to suppress that TD
datum in heading and reserve cursor clearance for nearby ruler labels. The
latest source now implements both corrections: heading is excluded from the
TD datum and label fitting reserves the painted cursor's vertical extent.
This is a visual observation supported by source geometry, not a synthetic
glyph overlap claim. The provided PNG is evidence of the defect before
correction; it does not prove the subsequent source change rendered correctly.

### Renderer follow-up needed for small instrument text

Fine log, ruler and footer text has visible red/blue edge fringing and a muddy,
dark appearance compared with the clean DOM labels below the band. This is a
subjective legibility observation. No WCAG contrast ratio, pixel segmentation
measurement or controlled before/after comparison was performed.

The source exposes a precise mechanism worth testing rather than raising font
brightness again:

- `GradeShader` in `src/core/renderer.js` applies chromatic displacement to all
  pixels. With `uChroma = 1.25`, the formula gives opposite R/B offsets of
  1.25 render pixels at an extreme stage corner: 2.5 render pixels total,
  or 1.25 CSS px at DPR 2. This is source-formula arithmetic, not a measured
  displacement in the PNG.
- The section-depth vignette multiplies the band foot by 0.72 at the default
  `uSectionVignette = 0.28`, on top of the global elliptical vignette. This
  source multiplier is not a measured text/background contrast ratio.
- Grain is added after that darkening. `env.js` sets grain to 0.052 for the
  underground mood, versus 0.030 in ordinary conditions. The screenshot's
  appearance is consistent with this pipeline, but causality needs an A/B.

Integration should test keeping the instrument layer or its measured screen
rectangles free of chromatic split, vignette and grain while preserving the
world's grade and required output encoding. Setting a material's
`toneMapped = false` alone cannot bypass this custom full-frame grade shader.
The test should compare the same state at the actual 390 px viewport and
measure the resulting text clarity/contrast before retiring the numeric HUD.
No renderer edit was made or requested inside this geology-only worktree.

## Deep-profile return: browser failure and CPU confirmation of the fix

The owner's subsequent 12-state browser harness found a real failure in
`shots/ruler-browser/profile-return.png`. Its actual glyph report records
action TVD **15 m** and cursor text `15.00` at CSS y675.1038-686.1871, below a
section band spanning y359-620. This reviewer opened the screenshot and
confirmed the cursor was absent. The earlier 123-case CPU fixtures did not
exercise a deep enough HDD profile; their pass could not clear this case.

The owner corrected profile framing with the minimum vertical translation:

```text
actionWorldY = rootY + secYForDepth(actionTVD)
actionFloor = bandBottomWorldY + footerHeight + cursorHalfHeight + 3 / pxPerMetre
rootY = max(originalGroundPose, actionFloor - secYForDepth(actionTVD))
```

This keeps the actual head at or above the safe floor while leaving both its
number and true-depth axis unchanged. It preserves the existing spud pose and
all states that already fit. The section window scrolls only when necessary;
the camera/frustum scale is unchanged. Clamping the readout alone would instead
place a correct number on a false depth position.

An independent actual-Three.js CPU probe used a 390 x 844 stage, 390 x 261
band at CSS y359, target 1200 m, seed 1337 and nominal 382 mm diameter. These
are synthetic regression inputs, not sourced physical contracts. The generated
profile has exactly 15 m cover and 1200 m measured length.

| Pose | Action TVD | Printed | Action and marker center Y | Marker bottom / footer top | Clearance |
|---|---:|---|---:|---:|---:|
| Spud | 0 | 0.00 | 390.0592 | 404.6259 / 552.0588 | 147.4329 CSS px |
| Mid-pilot | 15 | 15.00 | 534.4921 | 549.0588 / 552.0588 | 3 CSS px |
| Near exit | 8.404680 | 8.41 | 534.4921 | 549.0588 / 552.0588 | 3 CSS px |
| 80% return progress | 15 | 15.00 | 534.4921 | 549.0588 / 552.0588 | 3 CSS px |

Spud depth zero remains 31.0592 CSS px below the section top. At the 15 m
action point the zero datum is above the visible section, as expected for a
scrolling depth window. The ruler/log placement follows that actual window.
These are geometry and numeral measurements, not new rendered evidence; the
owner's recapture is still needed to verify the final pixels.

After the regression author strengthened the deep fixture, an independent
`node tools/checkruler.mjs` run passed **132 cases, 9,845 assertions, zero
failures, exit 0**. The original 123-case pass is retained above to show its
limited coverage rather than silently rewriting that earlier evidence.

The browser harness's return fixture was also flagged for correction: it
initially kept only `min(target * 0.35, 60)` m of completed pilot while asking
for a return pass from the far end. Return captures should set completed pilot
depth to `modeLayout.totalLength` and derive return progress from that same
actual solved total, so the reaming head is not displayed beyond an undrilled
pilot. This fixture issue does not excuse the deep-profile visibility failure.

### Font-reporting limitation

The browser report's failed request is the Google Fonts CSS for Inter and
Oswald. Its `interLoaded: true` and `monoLoaded: true` fields came from
`document.fonts.check()`, which does not certify that a named font is available:
it also returns true for a nonexistent font when rendering would not trigger
a font swap. The actual Canvas2D glyph metrics remain genuine measurements of
the browser's chosen face, including a fallback; they do not prove the intended
font loaded. Source: [MDN, FontFaceSet.check()](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/check).

The owner was asked to qualify these flags or inspect actual FontFace entries
and successful font resources. No network retry, package install or permission
request was made by this reviewer.

## Report commit status

The report is saved but uncommitted. Ordinary
`git add research/GEOLOGY_RULER_ADVERSARIAL.md` was denied with:

```text
fatal: Unable to create 'C:/Users/henri/Downloads/drillity-the-game/.git/worktrees/drillity-geology-ruler/index.lock': Permission denied
```

No escalation or approval retry was requested, following the user's explicit
steering. The parent can include only this explicit report path in its scoped
integration commit. No other files were changed by this reviewer.
