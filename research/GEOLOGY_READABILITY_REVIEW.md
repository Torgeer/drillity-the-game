# Section ruler readability checkpoint

Date: 2026-09-06. Worktree: `drillity-geology-ruler`, branch `codex/geology-ruler`.
Scope: independent read-only audit of `src/world/geology.js`; this report is the
only file owned or changed by this reviewer. Work stopped at the coordinator's
checkpoint request, before live captures or implementation review.

## Evidence reviewed

Read the whole `ASTRA.md`, `research/CRITIQUE.md` section 14, the section-mode
contract in `GAMEDESIGN.md`, `research/07-hdd-trenchless.md` F1,
`research/05-foundation-piling.md` E5, the current ruler/log/plate implementation,
and the existing `.hudqa/ruler-report.txt`. The older
`shots/critique-ui-section.md` was consulted as historical evidence, not as a
current measurement.

The screenshots named in CRITIQUE section 14 are absent from this worktree.
No browser or GPU session was opened. No screenshot clipping claim is reproduced
by this checkpoint. The DOM report cannot clear section-mesh text or overlaps.

## Findings established from current source

1. **Several handover premises are already stale.** `adoptCameraScale()` compares
   the camera aspect to the measured `bandRect()` aspect, with a 6% guard, and
   publishes the actual height separately as `visibleMetres`. It no longer uses
   the old layout-fraction comparison described in ASTRA section 8.7. This is
   source evidence only; actual projection and ground-at-spud still need a live
   measurement.

2. **Bore exaggeration is already declared.** `drawScalePlate()` prints the
   actual `boreExag`, nominal diameter, and drawn diameter. `drawRulerHead()`
   repeats the ratio and draws true/drawn diameter bars. The horizontal modes
   also declare V.E. The remaining task is readability and correctness of their
   placement, not adding a missing declaration.

3. **The type is deliberately small.** The following are authored CSS sizes;
   canvas supersampling is normalized through each strip's `k`, so a larger
   texture does not make the text larger on screen. Rounding and any mismatch
   between the adopted camera and the actual projection must be measured live.

   | Label | Authored nominal CSS px |
   |---|---:|
   | Depth major tick | 12, shrinking toward 6.5 to fit |
   | Depth intermediate tick | 8.5, shrinking toward 6.5 to fit |
   | Log lithology name | 9.5 |
   | Log strength | 7.5 |
   | Thin-bed code / PROJECTED / GWL / level datum / offscale TD | 7 |
   | Plate true-axis statement | 8.5 |
   | Plate BORE / V.E. badge | 9.5 |
   | Plate diameter arithmetic | 8 |
   | Ruler bore exaggeration header | 7 |

   The moving readout uses a fixed 240px canvas with 52px type below 100m and
   46px type thereafter. At the file's reference scale of 19.4 CSS px/m and
   its 3.25-unit mesh width, those project to approximately 13.7px and 12.1px.
   These are calculations from source, not measurements of a shipping frame.

4. **The scale plate has no text collision solver.** Its left title and its
   right BORE/V.E. badges share the first row. At the reference 390px width and
   19.4px/m, the area between the 5.6-unit log and 2.6-unit ruler, with two 4px
   insets, is about 223 CSS px. No `measureText()` test checks the title against
   the leftmost badge. Horizontal-mode strings therefore need an actual-font
   bounding-box measurement. An initial private estimate of their total width
   was too rough to use as a finding; no numeric overlap is claimed here.

5. **Log text uses an assumed visible window.** `drawLog()` derives `viewTop`
   from fixed `stripLead()`, while the visible window within a retained strip
   is `topDepth - logStrip.top`. The strip is repainted on logged-depth movement
   and occasionally recentered, so these quantities are not generally equal.
   The ruler already handles the equivalent issue using `ruler.windowTop` and
   a separate window-movement repaint condition. The log lacks that mechanism.
   This is a concrete placement mismatch; clipping magnitude needs measurement.

6. **Log fitting considers full bed height, not the visible safe area.** Label
   tier selection uses the bed/texture intersection. Its final placement clamps
   inside the geological bed, without reserving the scale plate, station ruler,
   or the PROJECTED divider. A thin visible sliver of a thick bed can therefore
   retain a taller label block than that visible sliver. This is an overlap
   risk in the code, not a reproduced screenshot finding.

7. **Old left/right clipping fixes already exist.** The log mesh spans
   `[-halfW, -halfW + logWidth]`; text is measured against an internal column.
   The readout is anchored from its half-width with a 0.15-unit right margin.
   Do not reapply the historical width/anchor fixes without inspecting their
   actual world-to-screen projection.

## Contrast and accessibility limits

Foreground alpha is 0.60 for intermediate ruler labels, 0.62 for log strengths
and the ruler unit, 0.66 for the plate's second row, and 0.74 for its axis title.
These values alone cannot establish displayed contrast: they composite over
gradient furniture and geology, then pass through the renderer's grade chain.
No final contrast ratios were measured, and this checkpoint is not a WCAG pass
or fail. For the eventual contrast check, W3C specifies at least 4.5:1 for
normal text and images of text; it also notes that thin anti-aliased type can
look fainter than the nominal color combination suggests.
Source: [W3C, Understanding Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).

The numerical HUD depth must remain until the ruler is demonstrated usable.
No DOM accessibility or keyboard changes were investigated or requested.

## Next concrete step

After obtaining the shared GPU slot, capture all five actual section modes at
spud and after settled scrolling, with actual GLB model source verified and
audio muted. Measure the projected strip/readout bounds and the actual-font
text rectangles for the horizontal plate row. Include a deep four-digit ruler,
a short driven pile, and a partially visible bed at the bottom edge.

Then prioritize a measured safe-area layout: give the log its real visible
window, choose labels from visible usable height, and wrap plate declarations
into nonoverlapping rows at a readable size. Preserve actual camera-derived
scales and all mode-specific axis semantics. Typography constants are design
choices, not sourced physical dimensions. No physical facts or shaders need
changing to investigate these findings.

## Checkpoint status

No source changes, tests, installs, package changes, GPU work, or Git commits
were made by this reviewer. This report is saved for the parent task to retain
or commit. Work stopped immediately after the coordinator's checkpoint request.

---

## Resumed independent review — 2026-09-06

This section records a fresh CPU/source review for the resumed ruler work.
Everything above remains the earlier checkpoint, not a verdict on the new
implementation. The reviewer owns only this report; the coordinator owns
`src/world/geology.js` and a separate agent owns `tools/checkruler.mjs`.
The complete ASTRA and its current checkpoint were reread, along with the
camera and regression review reports and the actual log, plate, axis and
update code. No browser, GPU session, package change or production source
edit was performed by this reviewer.

### What the executed baseline establishes

The projection agent executed the formerly unexecuted draft and supplied
`.ruler-baseline.json`: **81 cases, 3,289 assertions, 227 failures**. I read
that file directly. These are results for the pre-ruler-change source with
the previously integrated initialized, single-return `boreSDF`; they are not
the final implementation's result. The draft combines distinct evidence
classes, which must remain separate:

| Observation | Evidence and limit |
|---|---|
| At 320×568, the footer's smallest projected nominal type is 7.8928 CSS px | Actual canvas font declaration and Three.js mesh/camera projection; independent of estimated character widths |
| The 320×568 vertical footer arithmetic row has a nominal em rectangle ending at y=416.06145 against a band ending at y=415 | Projected nominal text box extends 1.06145 px beyond the band; actual glyph ink and texture clipping were not measured |
| `BORE 1 u = 4.9 m` and `V.E. 4.9:1` overlap in the 320×568 profile fixture | **Synthetic 0.62-em character widths**, not browser glyph overlap |
| Profile at 35% prints `55.12` beside a marker whose Y represents 7.31664 m TVD | Recorded string and actual mesh Y projection; the printed measured length is not the marker's vertical-axis value |
| Heading at chainage zero prints `0.00` at 38.57825 m TVD | Same axis evidence; the heading's underground depth datum makes its along-drive length distinct from TVD even at zero advance |

The fixed 1.45-world-unit footer height explains the narrow fixture's vertical
failure. It projects to 18.9428 CSS px at 320×568, while its second text row is
authored from a 13.5 px top offset with approximately 8 px type. Increasing
canvas resolution cannot create the missing physical screen height.

The baseline does **not** establish postprocessed contrast, real font loading,
glyph clipping, shader stability, performance or practical readability. Its
failure count must not be described as 227 visually reproduced defects.

### Exact log-layout correction supplied to the coordinator

The pre-change `drawLog()` used `stripLead()` as the visible offset within a
retained strip. `update()` instead keeps the strip in place between edge
recenters, so its actual offset is `topDepth - logStrip.top`. These are
different quantities. The ruler already had a separate window-movement
repaint guard; the log did not. A still drill depth does not mean a still
camera because scroll settling continues after a jump.

The supplied correction is to store `logStrip.windowTop = topDepth - nt`
before each repaint, repaint when that offset moves beyond a small declared
screen-space tolerance, and derive visible label intervals from that stored
value. The tolerance is a presentation choice, **NOT SOURCED** as a physical
dimension. Retained strip backgrounds and strata may still extend offscreen;
viewport-anchored annotations may not assume that the texture origin is the
screen origin.

Label tier selection must follow the bed's intersection with the **usable
visible interval**, not its intersection with the full texture. In order:

1. Intersect the bed with the measured visible window.
2. Remove the reserved footer/axis area and required top clearance.
3. Remove the `PROJECTED` divider's text row where it intersects the bed.
4. Choose a label block that fits one remaining interval, including its
   padding and every line; otherwise use the compact code or omit the label.
5. Clamp the chosen block within that same interval, rather than clamping it
   back into the larger geological bed afterward.

This is a concrete source defect even without a screenshot: the old two-line
name-plus-strength tier requires 32.8 CSS px including padding, yet a thick
bed could select that tier while only a few pixels of the bed remained above
the footer. That is an analytical counterexample to the old fitting rule,
not a claim about a captured shipping bed.

Tests should distinguish lithology/strength blocks from intentionally retained
axis ticks. Checking every recorded text call against the band is insufficient:
Canvas recordings can include text subsequently overpainted, and an axis tick
at a scissor edge has a different placement policy from a viewport-centered
bed label. The ore commodity title was also anchored to the texture top in
the reviewed source and needs the actual visible-window convention if kept.

### Truthful axis language and footer recommendation

The current horizontal tick calculation is `x * metresPerUnitX`. In the HDD
mode, `secXForStation(s)` first converts measured bore length through
`hddXAtStation(path, s)`; that conversion proves the horizontal tick value
is the projected horizontal distance, not the length along the curved bore.
`OFFSET m` is a truthful compact label for the present tick calculation.
Calling those tick values `MD` or treating them as measured bore length would
introduce a new error. The corresponding vertical ruler and moving cursor
should explicitly represent `TVD m` in horizontal modes.

These distinctions follow the authoritative terminology: measured depth is
the length along the wellbore; true vertical depth is the vertical distance
from a well point to the chosen surface reference; drilling displacement is
the distance from the surface location to the vertical projection of a point
in the bore. Sources: [SLB, measured depth](https://glossary.slb.com/en/terms/m/measured_depth),
[SLB, true vertical depth](https://glossary.slb.com/Terms/t/true_vertical_depth.aspx),
and [SLB, displacement, drilling definition](https://glossary.slb.com/terms/d/displacement).

The agreed implementation direction is one full-width reserved footer with
two separate rows at 11 CSS px, with height derived from the intended CSS
height divided by the actual pixels per metre. The first row declares the
axes and V.E.; the second identifies the bore diameter, nominal-to-drawn
relationship and exaggeration. The font size and row spacing are authored
design choices, **NOT SOURCED accessibility thresholds**. Measure each whole
row before drawing, use compact wording when needed, and avoid squeezing type
below the accepted design floor. Remove the duplicate miniature bore badge
from the ruler head once the footer carries the readable declaration.

The public-facing `u` in the old horizontal footer exposes a section-engine
coordinate unit rather than a driller's useful measurement. Metre-labelled
axes plus a derived V.E. statement express the displayed relationship without
that implementation detail. Any diameter claim must remain derived from the
actual mode and stage being drawn, including pilot/reamed changes and tunnel
versus bore distinctions; merely keeping a nominal contract diameter visible
does not prove the diagram's diameter declaration is truthful.

### Remaining semantic and acceptance limits

The adversarial reviewer identified a separate existing limitation: heading
`logFrontier()` reveals the vertical column to `depthAtY0` even at zero
chainage, so the apparent logged ground above a stationary drive is not
established by that drive. Also, revealing a bed's strength when its top is
entered is a gameplay reveal rule, not evidence that a core was recovered and
tested in a laboratory. A readable log must not be described as a fully
observed bore log without resolving those semantics. This review does not
change the survey/gameplay model.

The numerical HUD must remain. Final acceptance still needs all five modes,
short driven-pile and deep numerical cases, camera settling, footer clearance,
and actual-font headed captures with the shared GPU slot. A CPU pass is useful
projection/layout evidence and cannot substitute for that rendered review.
W3C's text criteria address contrast and resizing; the selected 11 px design
target is not itself a WCAG conformance claim. See
[W3C, Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
and [W3C, Resize Text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text).

### Reviewer handoff state

The report was saved and its scoped `git diff --check` passed. Committing was
blocked: `git add research/GEOLOGY_READABILITY_REVIEW.md` could not create
`C:/Users/henri/Downloads/drillity-the-game/.git/worktrees/drillity-geology-ruler/index.lock`
(`Permission denied`). A pending approval attempt was cancelled by the user;
no further Git retry or escalation is requested. The coordinator should commit
this explicit report path through its existing authorized workflow.

No `tools/checkrulerbrowser.mjs` draft was written and no browser was launched
by this reviewer. Browser-harness ownership was handed back to the coordinator
immediately on resumption after the blocked call. The coordinator has since
reported actual five-mode captures and additional source fixes; those later
results are not independently reviewed or certified by this report's baseline
measurements.
