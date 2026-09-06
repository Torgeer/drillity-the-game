# Blender UI atlas adversarial review

Review date: 2026-09-06. Scope: the new opt-in UI atlas source, exports, asset
helper and isolated consumer demo only. This is not a review of a game-integrated
HUD, and this document must not be presented as a WCAG conformance certificate.

## Authority and acceptance plan

Read in full: `ASTRA.md`, including its historical-results warning, and
`research/ASTRA-progress-2026-09-06.md`. Relevant existing source inspected:
`src/ui/styles.css`, `src/ui/motion.css`, `src/core/motion.js`,
`blender/ui_motion.py`, and `.hudqa/measure.mjs`.

The current HUD palette is declared in `src/ui/styles.css:14`: deep ground
`#0D1219`, foreground `#FAFAFA`, amber `#F59E0B`, hot amber `#FFBE3D`, steel
`#3F92A6`. Existing controls are live DOM. The rendered faces are decorative;
their apparent depth cannot replace accessible names, states, focus or targets.
The existing HUD reserves 44 CSS pixels with `--touch` and uses explicit
status shape changes as well as color. Its instrument row is compact, and
the four permanent meters were deliberately removed; the atlas demo must not
claim to restore those controls or add new gameplay UI.

All new artistic sizes, lighting coordinates, roughness, palette tuning,
gutter sizes, file budgets and motion amplitudes are **NOT SOURCED** authored
design choices unless a nearby comment cites an actual source. Existing project
tokens are implementation references, not external ergonomic facts.

| Attack | Required evidence and rejection condition |
|---|---|
| Actual Blender authorship | Inspect source and render log for geometry, camera, materials, fixed key light, CPU Cycles, transparent film and zero transmission. Verify exports exist and decode; a JSON label alone is insufficient. |
| Repeatable export | Explicit seeded render settings and exact source/asset hashes in a manifest; run the build twice or say repeatability is unverified. Fail stale or empty export sets. |
| Native44 and high DPI | Manifest gives logical dimensions, physical pixel dimensions and sprite rectangles. Live button hit area remains at least 44 by 44 CSS pixels at DPR 1 and 2. Image resolution, alpha silhouette and a claim of 44 pixels do not establish a target. |
| Text stays live | Buttons use real text children and semantic native buttons; no labels or units baked in the atlas. Badge/meter value stays live with appropriate name/value semantics. |
| Contrast-safe face | Measure minimum foreground/background contrast over every declared safe-region pixel, after alpha compositing on intended ground, at 1x and 2x. Normal enabled text requires at least 4.5:1; average contrast is not a pass. Document foreground limitations per variant. |
| State legibility | Inspect normal/pressed/disabled faces at actual logical size. Pressed state remains discernible without motion; persistent toggle/status state has a live textual or shape cue, not hue alone. Disabled controls must actually be disabled. |
| Focus | Tab navigation reaches every enabled control, Enter/Space activate correctly, and focus indicator remains visible and sufficiently contrasting against adjacent colors. Decorative art must not occlude it. |
| Alpha and packing | Decode RGBA. Check sprite edges/gutters for stray alpha and unintended neighbor pixels; inspect compositing on dark, light and checker grounds at 1x and 2x. No opaque matte or clipped shadow. |
| One key light | All variants share the same light/camera authority. Review small-size highlight placement rather than inferring consistency from configuration alone. |
| Real motion consumer | Existing generated `--curve-press`, `--curve-release`, `--curve-count` or equivalent tokens and `--motion-d*` values must affect actual transitions/animations. Importing the file without a consumer fails. |
| Reduced motion | OS preference and project `.reduced-motion` state suppress nonessential travel/scaling on buttons, pseudo-elements and meter updates; pressed state and actions still work. |
| No overlap/reflow | Root supplies headed evidence at 390x844 DPR 1/2, 320 CSS-pixel width, and 200% text/zoom. Reject intersecting targets, clipped labels, target shrinkage and horizontal overflow. |
| Restrained payload | Report actual asset bytes and decoded RGBA memory, including duplicate resolution and separate-frame exports. A self-selected file budget is a design choice, not a sourced mobile limit. |
| Isolation | New namespaced CSS only; no atlas imports inserted into existing game screens/global styles/components, and no edits to those files. Reading the existing motion exports is required. The demo must identify itself as an asset review, with no game integration claim. |

The 44px project requirement is stricter than WCAG 2.2 AA's target minimum.
W3C assigns 44 by 44 CSS pixels to Target Size (Enhanced), level AAA; the
AA Target Size (Minimum) criterion uses 24 by 24 CSS pixels and defined
exceptions. Passing the smaller criterion cannot waive this task's 44px gate.
Sources: [W3C 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html),
[W3C 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Normal text contrast is 4.5:1; large text has a 3:1 threshold. Do not round a
subthreshold result up. Disabled text is exempt from that criterion, but this
review still requires a readable disabled label as a project design choice.
Source: [W3C 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Non-text contrast applies at 3:1 to visual information needed to identify a
control or its state. It does not require every decorative bevel, or the
normal and hover colors compared with one another, to meet 3:1. The reviewer
must identify which graphical information conveys the state before issuing
a contrast failure. Source:
[W3C 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Interaction-triggered nonessential motion must be disableable under WCAG
2.3.3 (AAA); ASTRA independently makes reduced motion mandatory for this work.
Source: [W3C 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

## Current review status

Acceptance plan completed and sent to both implementation agents before their
first export. Final stable atlas pixels were independently inspected and measured.
The root repeat-render comparison and corrected built-demo browser gate passed.
Independent screenshot review accepts this as an integration-ready asset slice
with the usage limits below. No unresolved blocker remains in the reviewed slice.
This is not a full accessibility, game integration, thumb-reach or performance pass.

Independent baseline motion checks completed on the current worktree:

- `node tools/checkmotion.mjs`: 11 curves, 8,193 samples each; maximum
  Blender-reference error `3.374e-7`, CSS error `9.201e-5`; exit 0.
- Blender 5.2.1 LTS, `--background --factory-startup --python-exit-code 1
  --python blender/ui_motion.py -- --check`: all 11 actual F-Curves verified
  at 4,097 samples each, and exact existing JS/CSS/report export comparison
  passed; exit 0. This read-only check did not regenerate files.

These checks establish the current motion token provenance. Actual consumption
was separately confirmed by source inspection and the final browser gate below.

## Stable atlas pixel review

Reviewed source SHA-256 (normalized text):
`454d161d250f29c5a08d3d1c7084b322a722d25f0f01dacc00c5c0820975df4f`.
The source explicitly creates rounded solid meshes, an orthographic camera and
one fixed upper-left area key, then calls Cycles on the CPU. Materials set
transmission to zero. Its controls and light/material settings are correctly
identified as authored choices. Source inspection supports actual authorship;
the separate root repeat-render test also completed successfully.

Independent instrument: `node shots/ui-atlas-review/measure.mjs`, using the
existing `sharp` decoder instead of the author's PNG reader. Raw results:
`shots/ui-atlas-review/pixels.json`. All 32 face files and both atlas files decoded.
Native and 2x contact sheets were visually inspected on `#0D1219` and `#F5F5F5`.
The 2x button detail was also inspected without display downscaling.

| Measurement | Result |
|---|---|
| Native atlas | 352x480, 32,819 bytes, 675,840 decoded RGBA bytes |
| 2x atlas | 704x960, 148,221 bytes, 2,703,360 decoded RGBA bytes |
| Both atlases plus all standalone PNGs | 361,188 compressed bytes |
| Sprites | 16 authored states; 32 standalone files at 1x and 2x |
| Atlas versus corresponding standalone pixels | 0 mismatched pixels at either density |
| Alpha outside every sprite rectangle | 0 nonzero pixels at either density |
| Text-safe-region minimum alpha | 255 for every text-bearing sprite at both densities |
| Enabled normal/pressed/button/badge text contrast | Minimum 8.019035554488234:1, using each sprite's recommended foreground |
| Disabled text contrast | Minimum 6.173433708406787:1, using `#96A0AE` |
| Dark versus light composite safe-region result | Identical because every safe-region pixel is opaque |

Atlas file hashes independently matched the manifest:

- 1x: `d47d03644865648c8485c052b26ef38ee13f35bdc55709c60d4799263ba253f9`
- 2x: `ac05d0f6b6647f3d2e5017fdda7ef911b09e58d10eab07a86b3db206df8e0d9f`

The reviewer read both the root-owned `tools/check-ui-atlas-repeatability.mjs`
implementation and its generated `shots/ui-atlas/repeatability.json`. It
re-rendered with actual Blender from a separate working/output directory,
required a nonempty exact inventory, compared real bytes, and checked the
reference set did not change during measurement. Result: **35 files and
389,125 bytes identical**, including the manifest, in **38.81 seconds**.
This establishes repeatability on this installed Blender 5.2.1 CPU host only;
no cross-version, cross-device or cross-platform determinism claim is made.

The meter deliberately has no text-safe region: its label and value belong
outside the backing. The contrast result above must not be extrapolated to
arbitrary text colors, labels outside safe bounds, opacity changes, or a new
CSS filter applied by a future consumer.

The visual inspection found no opaque matte, white fringe, neighboring-sprite
bleed or visibly clipped shadow. The normal/pressed accent difference survives
native display: its mean absolute RGB difference on the dark ground is
21.286847/255. The key direction remains consistent in the shallow bevels.
These are restrained controls, not richly textured panels; additional texture
would compete with the small live labels.

### Measured usage constraint: neutral art is not a standalone state cue

The neutral normal face's outer four native pixels reach only 1.393805:1 against
the intended `#0D1219` dock ground (2x maximum 1.438711:1); zero opaque ring
pixels reach 3:1. Normal versus pressed neutral faces differ by only
3.590170/255 mean absolute RGB at native size. Compact neutral is similarly
subtle, at 3.581878/255.

This is not automatically a WCAG failure: the enabled live label itself has
at least 14.525851:1 contrast, and text and context can identify a button under
the W3C guidance above. It does mean that the neutral face cannot be the only
indication of an unlabeled control or a persistent on/off state. Required usage:
an explicit live action label, an unobscured focus indicator, and a live textual
or shape state cue for persistent toggles. The demo already uses `Pressed` and
`Released` text with `aria-pressed`; the final browser gate verified both states.

### Fix requests passed to the helper author

- Keep the DOM target fixed during press; animate the label/face only. The
  final helper and measured browser hitboxes follow this requirement.
- Preserve disabled and pressed distinctions in the text-fit fallback, where
  the decorative atlas is removed for enlarged/localized labels.
- Add a readable loading/failed-image fallback. The draft's dark accent text
  on a transparent background would be unreadable on the intended dark ground
  if its image failed to load. Re-reviewed source now supplies a dark surface
  and readable text until the host sets `data-atlas-ready` after image decode.
- Treat compact label bounds and 200% badge text as separate cases; a
  144px-button-only fit detector does not validate the compact/badge contract.

### Combined-state finding: fixed and verified

**P2: pressed text-fit fallback can erase the focus backing on light ground.**
The reviewed helper draft sets an inset-only amber `box-shadow` on pressed
text-fit fallback buttons, overriding the earlier focus rule's dark outer
backing. The remaining `#FAFAFA` focus outline contrasts only
**1.0861368763199406:1** with the demo's `#EEF1F4` light ground. Preserve the
inset pressed cue and the outer dark focus backing together, then inspect the
combined enlarged-label, pressed, focused, light-ground state. This was reported
to the helper author and root before browser verification.

Re-review: the helper now has a later, more specific
`.bui-text-fit-fallback:is(:active, [aria-pressed='true']):not(:disabled):focus-visible`
rule that layers the inset amber cue and the dark outer shadow. The browser
gate explicitly measures that shadow and captures `text200-light-focus`.
Source fix accepted. The final `320-1x-text200-light-focus.png` visibly retains
the complete focus ring, and all four browser cases report both shadow layers.

### Light-ground caption finding: fixed and verified

**P2: small demo captions retained their dark-theme accent colors on light.**
The 11px eyebrow `#F59E0B` and load-status `#6FB6C7` on the demo's `#EEF1F4`
light ground measure **1.8944305637656185:1** and **2.015264475879427:1**.
Both fall below normal-text 4.5:1. This affects the isolated demo's captions,
not the rendered-face text-safe regions. Add suitable light-mode text colors
and re-review the light screenshot. Reported before the headed capture.

Re-review: `tools/ui-atlas-demo/demo.css` now applies `#465363` to the
light-mode eyebrow and load-status text, including its error state. The updated
pair measures **6.91733746652932:1** against `#EEF1F4`. The final
`390-1x-light.png` confirms readable captions and an intact right edge.

## Browser review: initial failure and badge-font correction

The first built-demo browser run failed at 320 CSS-pixel width and DPR 1:
three normal badges used the text-fit fallback instead of their rendered
faces. The saved initial report had `pass: false` and no completed viewport
cases. The reviewer inspected its `320-1x-normal.png`; that screenshot must
not be represented as a successful final run.

The root's headed font probe, `shots/ui-atlas/badge-font-metrics.json`, measured
system-ui/Segoe UI at 11px, weight 600 and 14px line height. Every badge child
returned a 15px DOM Range height against the manifest's 14px safe region.
Actual measured ink was only 8-10px high; this was not evidence of clipped
ink. It was evidence that the chosen font triggered the deliberately
conservative fit policy and prevented the normal badge artwork from appearing.

The same probe measured Arial at the same size/weight/line height: all six
glyph/label ranges were 12px high. The largest combined badge width, including
its existing 4px gap, was 45.28125px against 68px available. Source now uses
`var(--bui-badge-font, Arial, sans-serif)`, retains the existing 14px safe bound,
and retains the automatic fallback when a host overrides the font or enlarges
text. This is a justified consumer font correction; no atlas source, pixel
dimensions, art, or acceptance bound changed. The final rebuilt browser report
confirms three normal badges at exactly 88x24 with no fallback in every case.

### Capture defect caught after the first all-case gate pass

The subsequent report completed all four viewport/density cases with zero
fallbacks at normal size, 88x24 badges, 44px minimum target height, no reported
overlaps or clipped control text, working Space/Enter toggles and both reduced
motion modes. This was useful functional evidence, but it was not sufficient
for a visual pass.

The reviewer and root independently noticed clipped right-edge content in
`390-1x-normal.png`. Independent PNG decoding measured that file at 375 pixels
wide, and its DPR 2 counterpart at 750 pixels. The DOM report had measured the
right button at x=219, width=144, while the screenshot visibly moved the layout
right before cropping it. This is consistent with full-page capture removing
the desktop scrollbar, reflowing the page, and retaining the narrower crop.
The gate compared width with `innerWidth`, which includes the desktop scrollbar;
that also failed to rule out a 320px minimum document wider than its client area.

The visual pass was withheld. Root's isolated `shots/ui-atlas/capture-probe.json`
then reproduced the cause exactly. Desktop mode changed from client width 375
and button x=219 to client width 390 and button x=234 during capture, while
encoding only 375 pixels. Mobile mode with touch enabled kept client width 390
and button x=234 before and after capture, encoding the correct 390 pixels.
The reviewer inspected the corrected probe image and confirmed a complete
right edge. The gate now enforces encoded width, client width and post-capture
target stability for every saved image. The final run passed all these checks.
No art change is indicated by this defect. The reviewed directory contained
32 PNGs (eight states per four cases), not 36.

## Final built-demo evidence and verdict

The final reviewed run exercised the built page at
`http://127.0.0.1:5196/atlas-review/`, using the parent-owned preview and headed
Chrome in mobile mode with touch enabled. Evidence is
`tools/ui-atlas-demo/evidence-built/report.json` and its **32 PNGs**. The earlier
desktop captures were rejected and replaced; they are not the final evidence.
The saved report says `pass: true`, has an empty failure list, and confirms that
the harness closed its browser. The reviewer launched no browser.

| Cases | Final evidence |
|---|---|
| 320x844 at DPR 1 | All eight captures encoded at 320px wide |
| 390x844 at DPR 1 | All eight captures encoded at 390px wide |
| 390x844 at DPR 2 | All eight captures encoded at 780px wide |
| 430x844 at DPR 1 | All eight captures encoded at 430px wide |
| Capture stability | Correct client/visual viewport width before and after all 32 captures; target geometry identical before/after |
| Live controls | Nine native face buttons plus two review controls; all measured target heights at least 44px, normal minimum width 88px |
| Native badges | All three 88x24; zero normal-size text-fit fallbacks in every case |
| Layout | Zero measured target overlaps, zero clipped control/badge text, no horizontal overflow against actual client width |
| Press behavior | Tested button remained exactly 144x44 during hold; pressed atlas offset `-8px -68px` matched the expected sprite |
| Real motion | Press 0.08s and release 0.12s from the generated tokens; sampled Blender release curve computed by CSS; live count consumer reached 84% |
| Keyboard | Space released the native toggle, Enter pressed it; visible text and `aria-pressed` changed together |
| Reduced motion | In-page preference and OS emulation both produced 0s label transitions; meter completed immediately at the asserted 36%/84% values |
| Enlarged labels | Both 200% control/badge text states used 12 explicit fit fallbacks; all text stayed contained and targets stayed at least 44px high |
| Errors | Empty console/page/asset error lists in all four cases |

The report records actual selected URLs under the built subpath:
`/atlas-review/ui/blender/ui-atlas.png` at DPR 1 and
`/atlas-review/ui/blender/ui-atlas@2x.png` at DPR 2. This confirms that the review
did not depend on Vite source URLs or a domain-root asset path.

The reviewer inspected the corrected 390px normal, 390px light, 390px reduced,
320px enlarged-text/light/focus images and the DPR 2 controls at original pixel
size. The right edge is complete, active/pressed/disabled labels remain live
and readable, badges show their native artwork, and the two-tone focus ring
survives the combined state. No additional visual blocker was found.

Final independent hashing confirms the Blender source remains
`454d161d250f29c5a08d3d1c7084b322a722d25f0f01dacc00c5c0820975df4f`, and both atlas
hashes remain exactly those in the stable pixel review above. Browser fixes
changed the consumer font and capture instrument, not the reviewed artwork.

Accepted limits:

- The parent still owns game placement, semantic action wiring, real HUD
  overlap/reach checks and the existing 72px action layout. This demo does not
  establish game integration or a larger 3D viewport share.
- Neutral rims and face differences are subtle; live action/state text and
  visible focus are required. The meter's label/value remain outside its art.
- The 200% fixture enlarges control and badge text, not every page font or the
  browser zoom factor. At 320px, `Unavailable` wraps within its safe fallback;
  production should choose a wider or single-column layout for longer labels.
- Font metrics were measured on this Windows/Chrome host. Other fonts and
  locales retain the fit fallback and need their actual labels checked.
- This is mobile browser emulation, not physical-device thumb-reach testing.
  No manual screen-reader, forced-colors capture or performance verdict is
  claimed. The 2x artwork is not a native 3x export.

**Verdict: acceptable for parent integration with the documented consumer
contract.** All measured review blockers were fixed and re-reviewed. No claim
of complete game integration, full WCAG conformance or an AAA game verdict is made.
