# Rockbolt browser integration — 2026-09-06

Reviewed in the original repository with the root-domain headed Chrome lease.
Only the browser harness and narrowly assigned unit-card CSS were changed.
No simulation, item data, site-screen logic, renderer or other control rules
were edited by this verification task.

## Reproduced failures

The initial harness could not show a card because it called `screen.update(0)`
before and after its real simulation. The screen's existing unit observer runs
when accumulated UI time reaches 0.125 seconds; it was never called. The
corrected fixture advances screen time from real simulation telemetry and lets
the ordinary observer paint the completed installation. It never forces a card
visible or inserts fabricated installation telemetry.

Two other fixture errors were corrected: the real shell applies `.screen` and
`.screen--site` to the site element itself, and real slider controls use
`role="slider"`, not native range inputs. The previous extra wrapper collapsed
the empty 3D spacers and the old selector missed all three sliders.

With the actual site column, real Inter/Oswald fonts and real completed
installations, all 18 baseline cases failed caption containment. Inter's text
bounds were 14px tall inside an 11px line box with hidden overflow. At 320px,
`Trial range` also required 91.609375px but received 86px and visibly ellipsized.
The baseline report and 18 captures remain under
`.qa-domain-followup/browser-root-baseline/`.

## Narrow product fix

`.ucell__k` now uses line-height 1.4 so actual font bounds fit. Exactly three
visible outcome cells use content-based flex basis: the short `Bit` caption
yields space to `Trial range`. Four-cell allocation remains `flex-basis: 0px`.
Overflow protection, fonts, font size, card bounds, control sizes and motion
rules remain in force. No data value or domain wording was shortened to hide
the defect.

## Verification

```powershell
node tools/checkdomain-rockbolt-ui-browser.mjs --port 5197 --lease root-domain --lease-file C:\Users\henri\Downloads\threads\drillity-coordination\gpu-owner.txt --out .qa-domain-followup/browser-root-verified
```

Final result: **18/18 cases passed**, supported/undersized/oversized/unknown/
larger friction tube and resin, each at 320×640, 390×844 and 430×932. Resin uses
reduced motion. Actual Inter and Oswald loaded; no fallback-font pass was used.
There were zero console errors, page errors, failed HTTP responses or requests.
All six measured production input hashes are identical before and after.

The 90 measured visible controls have minimum width 61.328125px and minimum
height 44px. There are no clipped or overlapping card text fields. All 270
card/control and control/control rectangle pairs were additionally verified
against the saved measurements: zero overlaps. Those assertions now also run
inside the permanent browser gate. Mobile viewport, visual viewport and PNG
dimensions match exactly; capturing does not change the measured geometry.

Supplementary specimens use all 26 literal captions read from the actual unit
family table, at all three widths: **78 caption checks**. Their vertical text
bounds remain inside their labels, do not reach the value row, remain within
the existing card and retain four-column flex allocation. These are explicit
CSS specimens, not claimed simulation runs for the other methods.

Independent visual inspection included final 320px supported and larger-tube
outcomes and 430px resin; earlier candidate 320px unknown and 390px resin were
also inspected. Full trial-range captions are readable, fit eligibility is
distinct from pull-test capacity, and the controls occupy their reserved row.

Final report: `.qa-domain-followup/browser-root-verified/report.json`.
SHA256: `0e7a156292033598f2af0ebf756d3120068342b6a16f27c93ddb51bcf082b4a1`.
Its lifecycle record confirms browser disconnected and Vite closed. A separate
connection attempt to owned port 5197 returned ECONNREFUSED after completion.

An intermediate expanded run is intentionally retained as failed under
`.qa-domain-followup/browser-root-final/`: a concurrent data.js edit triggered
Vite reload during a screenshot, and the geometry guard caught the disappearing
HUD. Final verification disables fixture HMR and checks input hashes. That
interrupted run is not counted as valid final evidence.

## Limits and observations for the next reviewer

No WebGL scene is initialized; the empty surface/section bands in these images
are intentional fixture reservations. This verifies real HUD composition and
real simulation-derived outcomes, not whole-game visuals, FPS or touch reach
arcs. Device scale is 1 and safe-area insets are zero.

The supplementary four-column specimens still expose horizontal ellipsizing of
long existing captions: 10 at 320px, 5 at 390px and 3 at 430px. Examples include
`Half-barrel`, `Into bearing` and `Energy ratio`. Four-column widths were not
changed in this bounded repair; these findings are not claimed as fixed or as
full live simulations of those methods. A separate outcome-card layout task
should validate each real programme and its longest values before changing it.
