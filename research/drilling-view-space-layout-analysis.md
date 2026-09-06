# Drilling scene space: independent layout analysis

Baseline: `a3fb994`, private `codex/drilling-view-space`, 2026-09-06.
Ownership: this report only. No production files, gates, renderer, models or
assets edited. No browser or GPU session launched by this worker.

Current verdict: the final 612-case fixture passes its layout, native-target,
interaction and canvas checks at the final source hashes recorded below.
Available DOM-stage scene space is 48.24–75.32%, with paired gains of 0–70px
and no measured regression. Intended-font validation and actual rendered-scene
visibility remain unproved; 82% was not achieved. The supplementary 246 cases
and four maximum-input cases also pass their layout checks at the same hashes.

## Evidence and limits

Read ASTRA.md in full, GAMEDESIGN.md, CRITIQUE finding 9, the current ASTRA
checkpoint, shared root-coordinator.md and usage-shutdown.md, site.js, relevant
site CSS including its final overrides, and the HUD enumeration/reach tools.
This initial section is **source arithmetic, not a browser measurement**.
Actual DOM fixture/image findings are recorded below. No FPS,
rendered ruler readability, combined renderer validation or 82% success is
claimed.

The earlier 45.4–67.3% values reported by root come from ENUMERATE's
`split.stagePct`: the summed heights of two empty `.siteband` DOM spacers
divided by `.ui-stage` height. This is available scene space within the DOM
layout. It does not inspect rendered pixels or even renderer scissor bounds.

## Baseline height account

With zero safe-area insets, the source has a 52px top strip and a 56px bottom
reserve containing a 44px native Leave hole button. The dock is:

`10px border/top padding + instrument + 4px gap + controls + 56px reserve`

Programme/well methods add `44px auxiliary row + 4px gap`. No touch-size
allowance is borrowed from a neighbouring row. The source-derived results are:

| Viewport | Instrument / controls | Plain dock | Programme dock | Plain DOM opportunity | Programme DOM opportunity |
|---|---:|---:|---:|---:|---:|
| 320×568 | 72 / 68 | 210 | 258 | 53.87% | 45.42% |
| 390×844 | 82 / 72 | 224 | 272 | 67.30% | 61.61% |
| 320×844 | 82 / 72 | 224 | 272 | 67.30% | 61.61% |
| 360×740 | 82 / 72 | 224 | 272 | 62.70% | 56.22% |
| 412×915 | 94 / 84 | 248 | 296 | 67.21% | 61.97% |
| 280×640 | 72 / 68 | 210 | 258 | 59.06% | 51.56% |

Values are calculated from baseline tokens and zero insets, not observations
that text fits those layouts. Narrow/tall cases deliberately expose geometry
outside the two headline phones. A safe-area bottom inset above 4px increases
the footer beyond 56px under its existing max() expression.

## Recommended implementation direction

Keep the stacked regions, three stable control positions, bottom reserve,
native action rail and leave confirmation. Replace the tall semicircular gauge
with a horizontal scale that retains the actual numeric value, method units,
sweet-spot window, live cursor and applicable limit. Compact the neighbouring
rate/beat/drive-record slot rather than removing it. Reduce the status strip
while preserving ordinary numeric depth and target until root verifies the
actual rendered ruler. Avoid increasing instrument/control heights simply
because a phone is tall: extra height is most useful to the scene.

The source worker's initial direction is 40px status, 48px plain instrument,
64px programme instrument and 68px controls. With the retained 56px reserve
and existing padding/gaps that predicts a 186px plain dock and 250px programme
dock. These are candidates, not approved or measured final dimensions.

Two further small savings worth checking are 36px status and top padding
9→5px. Current steady-strip line boxes total 28.3px (11 + 3 + 14.3); its alert
lines total 27.5px. This suggests that a 36px strip may fit, but font glyph
bounds must decide. A 5px top padding leaves four pixels for a 2px focus outline
plus its 2px offset. Neither suggestion justifies clipping or smaller text.

The 64px programme row also protects the multi-line resin beat. A 48px
programme instrument would provide a 96px unitcard region with its auxiliary
row; the card's two-line note, title and one row of values require approximately
84px from current line boxes. It may fit, but text width can force additional
lines and the resin beat can still require more height. Any different reserve
must be stable per method, never toggle on a live card or beat.

Four equal columns are not a safe assumption on narrow phones. The production
pile card includes `3.0 mm/blow`, `0.60 / 1.10 m` and `Into bearing`; jumbo has
`Half-barrel`, SPT has `Energy ratio`, and CPT has `Inclination`. A two-by-two
grid at existing typography requires approximately 120px including title,
two 32.35px cell rows, a 4px row gap, two 4px content gaps and a 28.16px
two-line note. If measured text cannot fit four columns, the programme reserve
must accommodate this geometry. Do not preserve a nominal height by clipping
outcomes, shrinking the 11px font floor or undoing caption line-height 1.4.
The existing unequal-width three-cell rule remains necessary for the bolt
trial-fit card.

The independent fixture review identified two coverage gaps to correct before
acceptance: synthetic telemetry initially omitted `gauge`, causing pile/CPT to
exercise fallback TORQUE rather than SET / PUSH RATE; and some synthetic action
labels were shorter than production labels, with the friction bolt's third
action absent. These were sent to the measurement worker. Production gauge
units and action strings must be exercised. Dropping the gauge caption unit
also requires retaining `mm/blow` in the pile's numeric reading; `mm` alone
loses the per-blow dimension previously present in the caption. This was sent
to the source worker.

## Why larger apparent savings fail

Removing the footer while leaving sliders at the bottom changes their reach.
The source's existing derivation requires the outer control centres roughly
90px above the bottom edge. A 68px control row above 56px reserve provides
exactly 90px. Moving Leave into the instrument row does not itself replace this
reserve. The current reach gate scores centres; this does not prove every
point of each rectangle is within a thumb arc.

Moving Leave into `.dock__inst` also hides it whenever showUnit() marks that
row `is-taken`. The exit must remain accessible during cards. Moving the
instrument rows below the controls could reuse them as the reach reserve, but
then card takeover, escape placement and every action's reach need a separate
coherent layout. Putting a 128px Leave beside three rail actions in the narrow
row cannot be assumed to fit. No such rearrangement is accepted here.

An 82% clean vertical scene share allows only 102.24px of total chrome at
568px height and 151.92px at 844px. Under the retained short-phone topology,
68px controls + 56px reserve + a proposed 40px status already consume 164px,
before instruments, auxiliary actions, gaps or padding. This is a **conditional
bound for this retained layout**, not proof that every possible HUD is
incompatible with 82%. Even deleting the entire instrument row while keeping
the other programme rows and 40px status yields at most 60.21% at 320×568 and
72.75% at 390×844 using their baseline control heights. Deleting required
instrumentation is not a proposed solution.

## Renderer integration request

Use the final site-specific CSS override when comparing widths:
`.ui-stage.is-site { width: min(100vw, max(320px, calc(100vh * .5)), 520px) }`.
At 320×568 the DOM site is therefore 320px wide, **not 284px**. The latter
calculation overlooks the override and is invalid for this screen.

The source contracts still differ at other sizes: at 375×667 the DOM site is
333.5px wide while renderer `STAGE_ASPECT_MAX = 9/16` gives a 375px stage.
At 320×844, CSS retains the 844px viewport height while renderer
`STAGE_ASPECT_MIN = 9/19.5` gives a rounded 320×693 stage at y=76. Its
resolveChrome() subtracts letterbox area before reserving HUD heights. For the
baseline programme dock this predicts render bands at y=76..572, 496px high,
versus DOM spacers y=52..572, 520px high. The corresponding viewport-height
shares are 58.77% and 61.61%. These remain source forecasts requiring actual
renderer measurements. The 30% minimum-scene clamp does not activate here.

Root should verify the actual integration renderer against the final measured
HUD top/bottom, widths, safe areas and narrow/tall cases. Record renderer stage,
both scissors and their intersection with the viewport, then subtract the
union of actual opaque UI occlusion. Capture the matched renderer/HUD hashes
and actual model identities. Any stage-contract correction belongs to the
renderer/global-layout owner and is not part of this worker's scope. The
private HEAD has the older hero camera; its images cannot validate root's new
uncommitted hero/instrument renderer or rendered ruler.

## Initial actual DOM fixture visual review

The measurement worker generated `shots/drilling-view-space/baseline.json` and
an initial `current.json`. Their explicit scope is actual production DOM,
styles, components and extracted confirmation against synthetic telemetry,
with GPU/WebGL disabled. CDP resolved Segoe UI Black / Segoe UI fallback faces;
the intended Google fonts were unavailable. These images contain a blank scene
region, so no claim about actual 3D rendering follows.

This worker inspected both baseline RC-card PNGs at 320×568 and 390×844, and
the initial candidate's plain rotary and RC-card PNGs at both sizes, plus its
320×568 resin beat and pile card. Files use the names
`{baseline,current}-{width}x{height}-normal-{family}-{mode}.png` in that folder.

The horizontal instrument is coherent and the ordinary numeric depth/target,
status and Leave hole remain readable in these candidate images. However,
the initial candidate **does not pass visual review**:

- Narrow RC still displays `RECOV…`, confirmed independently of the clipping
  report. The 390px RC card displays the full caption.
- The narrow pile card ellipsises the set, design-set and into-bearing values;
  this conceals the quantities needed to interpret the result.
- The resin title truncates and the three-action rail displays fragments such
  as `TORQUE …`, `REAM …` and `READ THE…`.

The initial actual fixture reproduces source-predicted baseline clipping:
RC Recovery is 70px in a 62px cell, pile Design value is 83px in 62px and
Into bearing is 100px in 62px. The baseline run has 108 cases and 143 reported
failures; the initial candidate has 108 cases and 78 failures. The candidate's
49.65–73.70% DOM opportunity interval is an improvement in reserved geometry,
not an acceptable final result while these failures remain.

The initial instrument screenshot also pictures a transient spring pointer
well below its 57% number because the synthetic fixture waited wall-clock time
without an ordinary continuous screen.update loop. The measurement worker was
asked to advance realistic update steps before final screenshots. This does
not undermine box geometry, but those initial images cannot prove steady
instrument agreement. All findings were sent to source, measurement and root.
Final candidate results may supersede these initial capture files; consult
their recorded source/fixture hashes and final report before reusing numbers.

## Expanded source review and candidate geometry

The expanded final baseline in `shots/drilling-view-space-final/baseline.json`
contains 612 cases across nine viewports and both motion modes. Its actual
DOM-stage opportunity interval is 45.4225–67.8112%, superseding the earlier
108-case interval for that expanded matrix. It reports 1,661 failed assertions,
1,608 enumerated overlaps, 494 horizontal clipping findings and 3,528 glyph
clipping findings; the categories overlap and are not independent defect
counts. No native small-target finding was recorded. This remains baseline
DOM/fallback-font evidence, not a current renderer verdict.

Reviewed the complete production diff again after the measured fixes. The final
candidate keeps 40px status, 68px controls, the existing 56px minimum footer,
44px auxiliary targets and 5px top padding plus the 1px dock border. Instrument
height is 56px for plain methods, 72px with auxiliary actions, and 88px for
unit-card methods without an auxiliary row. At viewport widths ≤300px ordinary
plain methods reserve 72px so both beat heading and instruction can wrap.

The zero-inset height account is now `6 + instrument + 4 + 68 + 56`, plus
`4 + 44` for the auxiliary row. This gives 190px plain, 254px auxiliary, and
222px no-auxiliary unit docks; narrow plain is 206px. Derived final DOM scene
opportunity and the change from the corresponding baseline are:

| Viewport | Plain | With auxiliary row | Unit card without auxiliary row |
|---|---:|---:|---:|
| 320×568 | 59.51% (+5.63 pp) | 48.24% (+2.82 pp) | 53.87% (unchanged) |
| 390×844 | 72.75% (+5.45 pp) | 65.17% (+3.55 pp) | 68.96% (+1.66 pp) |
| 280×653 | 62.33% (+2.45 pp) | 54.98% (+2.45 pp) | 59.88% (unchanged) |
| 390×664 | 65.36% (+4.82 pp) | 55.72% (+2.41 pp) | 60.54% (unchanged) |
| 375×667 | 65.52% (+4.80 pp) | 55.92% (+2.40 pp) | 60.72% (unchanged) |
| 320×844 | 72.75% (+5.45 pp) | 65.17% (+3.55 pp) | 68.96% (+1.66 pp) |
| 430×932 | 75.32% (+7.51 pp) | 68.45% (+5.79 pp) | 71.89% (+4.08 pp) |

These source calculations agree with the corresponding matching final fixture
cases, checked independently after completion. At 390×664 the DOM site is only
332px wide, and at
375×667 it is 333.5px wide: viewport-area share is therefore smaller than the
table's DOM-stage-height share. The renderer integration limitations above
remain. Safe-area insets also consume additional space.

The final topology still cannot provide 82% on the tested phones. With even
the entire instrument row hypothetically deleted, its retained 40px status,
68px controls, 56px footer and 10px padding/gap sum already require 174px;
the auxiliary row adds another 48px. Thus the conditional no-instrument upper
bound is 69.37% plain / 60.92% auxiliary at 568px, or 79.38% / 73.70% at
844px. Required instruments cannot actually be deleted, so these deliberately
optimistic bounds exceed the candidate's real available area.

Source review found no production scope expansion: the modified unprefixed
instrument/card/action selectors have site-only consumers. Numeric depth and
target, programme progress, method control semantics, full unit outcomes and
Leave hole confirmation are retained. The narrowest tier removes only the
noninteractive balance/level decoration; it retains depth/target or programme
progress and the programme clock. The removed primary-action icon duplicated
its retained label/instruction. Gauge set units now correctly retain mm/blow;
push-rate remains mm/s. The four-cell grid uses two columns, the unequal-width
three-cell rule remains and caption line-height 1.4 is unchanged. Press motion
affects button contents rather than changing the native target rectangle.

The new no-auxiliary unit reservation exposed one lifecycle edge during this
review: changing only `sitedock--units` could change height without entering the
old `plain changed` sizing branch. The source worker fixed this by scheduling
gauge/spark/drive-record sizing and chrome publication together after both
capability decisions. This was reviewed in the actual file; the delayed-first-
telemetry path was requested as an additional fixture, without the fixture's
explicit screen.resize masking it. Oil Gaining with a negative margin at
280/320 was also requested because its label is wider than the steady state.

The 246-case supplementary pass at intermediate hashes `f256fd62…` /
`928386e2…` exposed additional long beat/alert text and recorded 34 failures
(including browser/font failures). This worker inspected 15 of its matching
320/390/280 PNGs: pile set and CPT push-rate units, oil gaining/losing with
negative margin, resin/friction beats, tripping/bailing, RC blow-down, re-drive
and the kill-feed action. The compact metric/action arrangement was readable;
the friction/RC headings and re-drive/underbalanced instructions visibly
clipped. The CPT countdown had a measured 1.25px separation from its heading:
crowded but not an overlap. These were provisional images, not accepted final
proof or a finding about actual 3D.

The source worker addressed those failures with full-meaning shorter copy,
larger alert line boxes, and explicit nonanimated layout/canvas boxes to avoid
implicit size transitions under the universal reduced-motion duration rule.
The geometric row heights above did not change. Source review of that batch
found no additional functional or ownership regression.

Reviewed copycheck SHA-256 after that batch (raw working-file bytes): site.js
`da6ac8218ff5e3ee812df8425cb5595dcb2fb8d5c5d7640c72a1b05c2ea900f3`, styles.css
`ea8b4a3827aa90ce2db4a9b79ed9b89bb4467aec330a7f7519ee6aca62086331`.
Any later source change requires matching evidence before visual acceptance.

## Matching focused copycheck

`shots/drilling-view-space-copycheck/current.json` completed 36 cases at the
copycheck hashes above: six corrected states at 280×653, 320×568 and
390×844, each in normal and reduced motion. It records zero enumerated
overlaps, horizontal clips, glyph clips or small native targets. Its only two
failed gates are browser resource errors and inability to prove intended Inter
font rendering. Thus this is accepted focused **fallback-font DOM** evidence;
the expanded 612-case matrix had not yet completed at that checkpoint.

Independent image review of the matching 280px friction-bolt, re-drive,
RC blow-down and oil-losing screenshots, plus 320px friction and 390px
oil-losing, confirms that the previously clipped titles/instructions and
underbalanced warning are now fully visible. The compact gauge value and
units, negative mud margin, pit state and separate auxiliary actions remain
readable. The narrow text is dense but the reviewed information is distinct
and complete. Ring index was measured but not in the PNG capture whitelist:
its 280px title uses two lines, its countdown remains separate, and the full
"Next hole in the ring" instruction occupies one measured line with no clip
or overlap. This last judgement is based on JSON geometry, not image review.

The ensuing expanded run exposed a separate width-breakpoint defect at
390×664: the DOM stage is 332px wide, yet the existing viewport-based 360px
rule retains slider amounts and ellipsises the label to `ROTAT… 50`. This
worker independently confirmed it in the actual PNG. The focused copycheck
did not include that aspect ratio and therefore did not cover this defect.
A site-width container query was requested to apply the already measured
narrow label treatment without changing stage width, native target geometry
or control semantics. Expanded acceptance was withheld until that correction
and a matching measurement run. The completed 612-case run at this rejected
snapshot is preserved in `shots/drilling-view-space-before-stage-fix/current.json`:
229 failed assertions, 116 horizontal clips, 120 glyph clips, zero overlaps
and zero small targets. Its measured DOM-stage opportunity is
48.2394–75.3219%; viewport-area opportunity is 47.4359–75.3219%.

That run also detects a pile chart backing-size mismatch and third-line note
clipping on 280px pile/longhole cards. This worker independently inspected the
280px pile PNG and confirmed the note ends "Only the depth into…", hiding the
outcome lesson. Shorter full-meaning pile/longhole notes were suggested to the
source worker; reducing caption line-height or retaining the ellipsis is not
accepted. The implementation worker additionally identified an unverified
maximum-input risk: label width plus `100` may exceed the slider head even
where `50` fits. A bounded measurement at actual 375/390px site widths was
requested before choosing the final container-query threshold.

## Boundary follow-up and final source identity

The 90-case boundary run at site.js `8c6d156a…` / CSS `1640450b…`
(`shots/drilling-view-space-boundary/current.json`) confirms the site-container
query fixes the 332px-stage label problem and the shortened pile/longhole notes
fit at 280px. The chart caption resize removes its backing-store mismatch.
Independent images confirm complete 280px pile note text and the full ROTATION
label at 390×664. Maximum input `100` reveals WITHDRAW at actual 375px stage
width still needs 67px in a 63px slot; the same actual 390px stage passes.
The run records four layout assertions for this single issue across both
motion modes, plus the two browser/font failures.

The pile caption was also reviewed beyond ancestor clipping. Its actual
390×844 Range rectangles are y=644,h=15 and y=655,h=15, a 4px same-element
interline overlap. The PNG appears dense; an actual ink collision was not
claimed. The source worker raised its line-height from 1 to 1.4, leaving the
instrument row unchanged and allowing the chart canvas to use the remaining
height. The first container-query breakpoint is now `width < 390px`, covering
the measured failing width and the intervening widths up to the proven
passing endpoint. The ≤300px treatment remains a site-width query. No global
stage geometry, native control geometry or numerical gauge unit changed.

The matching 30-case follow-up in
`shots/drilling-view-space-boundary-final/current.json` at site.js `8c6d156a…`
and CSS `7849f13c…` has zero overlap, clipping, interline or canvas failures;
only the browser/font gates remain failed. The 390×844 pile caption now has
15px Range boxes at y=637.21875 and y=652.609375, leaving 0.390625px between
them instead of overlapping. Maximum-input WITHDRAW fits under the corrected
width treatment.

A subsequent source-only cache correction restores the early unchanged-record
return before chart slicing/caption work and stores the final dimensions after
caption resizing. Reviewed this actual final batch and its raw SHA-256:

- site.js: `bad773d03fb8c0c9055b84c7668a2e10fd3accddd0bcc6277ea7fc1be1359a3d`
- styles.css: `7849f13c9a34d27f0beeb563f0e14e7c40055ffc2f103977c54452708a0284c5`

No additional semantic or ownership regression was found in this batch.
The source-derived height table remains unchanged. The preceding rejected
snapshots are retained as the evidence for the fixes and must not be treated
as this batch's proof.

## Final main-matrix verdict

Independently read `shots/drilling-view-space-final/current.json` after atomic
completion and verified its site.js and CSS hashes equal the final identities
above. All 612 cases have zero enumerated overlaps, horizontal clips, glyph
clips, small native targets, interline/canvas or interaction gate failures.
The two remaining failed gates are browser resource errors and unproved
intended Inter rendering. This is a bounded fallback-font DOM layout pass,
not an overall clean environment or actual-renderer pass.

The measured available DOM-stage share is 48.2394–75.3219%; available
viewport-area share is 47.4359–75.3219%. Independently paired every case with
the matching baseline by name: gains are 0–70px, or 0–7.5107 percentage points,
with no measured regression. This verifies the conditional height table,
including the honest unchanged no-auxiliary unit-card cases on short phones.

Independent inspection of refreshed final-run images covers 320px pile set
and its separated two-line chart caption, RC/longhole four-cell cards;
390px CPT push-rate and RC card; and 280px longhole/pile cards and an ordinary
tripping beat with depth/target. Full quantities, units, captions and outcome
notes are legible in these actual PNGs. Earlier focused image reviews cover
the narrow oil warning and corrected beat copy; the supplementary exact-source
verification below confirms their final geometry.

Independently read the completed 246-case
`shots/drilling-view-space-supplementary/current.json` and four-case
`shots/drilling-view-space-maximum-input-final/current.json`. Both record the
same final site.js/CSS hashes and zero layout, native-target, interline,
interaction or canvas failures. The supplementary run covers all 29 authored
beats, nine actions, two well states and the friction variant across three
widths and both motion modes. The maximum-input run confirms the long control
label at 375/390px with value 100 in both motion modes. Each report retains
the same two browser/font failures. Together with the main matrix this is
862 exact-source fixture cases, with no added claim about untested telemetry
values or real-user thumb reach.

The large blank region in these CPU-only images is scene opportunity. It is
not rendered drilling. The actual GPU/ruler/opaque-occlusion integration
request above remains open, as does intended-font proof. No 82%, FPS or
real-machine scene visibility claim follows from these fixtures.

## Baseline source identity

SHA-256 values from `git show a3fb994:<path>` bytes:

| Source | SHA-256 |
|---|---|
| site.js | fd7395f927f490b97a7c21c79c6e09c485434492f13dffb242c31ef0bb0be2cf |
| styles.css | 52e4f7d1d9f707f0065203a88404490e76cbeb4533ad693ad022b0a1d4ce6dc0 |
| renderer.js | 15ae234c0f8d6f881dc7a2a866c374991fa3c2d7098e3a5daba7e8d1854821ec |
| .hudqa/enumerate.js | 06e65c3365cbca62d6d73c971b69ed60193208d873c8932c01052f5c406bc214 |
| tools/checkreach.mjs | b2ed62799645d037fff6b16cd8576a375b7f5f24a9834890084044891a9cb7f6 |
