# Section ruler CPU regression

Measured 2026-09-06 in `drillity-geology-ruler`. The former unexecuted draft
was run before production edits. This report concerns CPU projection and
recorded drawing commands; it is **not rendered readability evidence**.

## Executed baseline

`node tools/checkruler.mjs --json .ruler-baseline.json` exited **1**:
81 cases, 3,289 assertions, 227 failures.

| Baseline assertion | Failures |
|---|---:|
| Footer nominal type below proposed 9.45 CSS px floor | 162 |
| Footer text bounds, synthetic width/nominal height | 13 |
| Footer text overlap, synthetic width/nominal height | 19 |
| Printed cursor value disagreed with its true-depth axis | 30 |
| Cursor mesh outside section band | 3 |

Camera span, published span, actual pixels per metre, stable 20 m scale anchor
and the non-heading spud datum checks all passed. The old negative-spud and
rejected-camera-scale claims were not reproduced.

The baseline's marker-axis assertion was incomplete: a raise's return pass
printed the original measured depth at the original marker depth while the
action point moved upward. Comparing the printed number with that misplaced
marker could pass. A new assertion compares the marker directly with
`boreholeTip` in world space and projects their Y separation. It reproduced
the raise error independently of text widths. Horizontal baseline examples
at 390×844 were a profile printing **55.12** at **7.316639 m TVD**, and a
heading printing **0.00** at **38.578254 m TVD**.

## Final enforced runs

Both commands ran without `--report-only` and exited **0**:

| Command | Cases | Assertions | Failures |
|---|---:|---:|---:|
| `node tools/checkruler.mjs --json .ruler-final.json` | 132 | 9,845 | 0 |
| `node tools/checkruler.mjs --width-em 0.74 --json .ruler-wide-font.json` | 132 | 9,707 | 0 |

The default width fixture is 0.62 em per character. The second run uses wider
synthetic text and consequently selects different label tiers; that explains
its different assertion count. `node --check tools/checkruler.mjs` and the
scoped `git diff --check` also passed. Generated JSON reports are local
evidence, not committed source. Re-running the commands recreates them.

The final run recorded these source SHA-256 values:

- `src/world/geology.js`:
  `6ae1593f3dc86a402899b8dd552c421e5aec13eef3f5b7fc728b5c3470c00a9b`
- `src/core/renderer.js`:
  `622c3a7e0fbf1342ad8a632c2d9665225c00ecdace5804ddd1b9f5704ce3ff2f`

After headed review, the final production pass also reserves the painted cursor
before drawing ruler numbers/datums and suppresses the heading TD label. A
heading's target is chainage, not its constant vertical depth. The two final
enforced CPU runs above include that change. Recorded painted-cursor bounds
exclude transparent mesh margins so the shortest band retains a readable tick.

## Coverage and measured results

The matrix uses 320×568, 390×844 and 430×932 synthetic stages. **All fixture
dimensions, hole lengths and input diameters are NOT SOURCED physical
dimensions and are not assertions about shipping phone layouts.**

- All five modes at spud, 35% and 95% requested progress, with profile
  pullback and raise reaming return passes.
- HUD-only band height changes, explicit resize at camera zoom 1.2, and a
  translated camera. The fixture follows the renderer's current width-anchor
  formula; measurements use actual Three.js projection and actual vertices.
- Constant raw-depth settling at 1, 9 and 80 additional frames in each
  vertical mode, exercising retained textures while the damped window moves.
- Four-digit vertical ruler text and an independently verified short driven
  pile: target 9 m with seed 1 produces an actual pile length **8.387599 m**.
- The synthetic 6,000 mm raise exercises the opposite diameter convention:
  its final displayed diameter is 3,200 mm, explicitly marked **DRAWN×0.5**.
  Other fixtures exercise diameters exaggerated above nominal size.
- A 1,200 m synthetic HDD input, diameter 382 mm and seed 1337, covers pilot
  55%/95% and return progress 80% at every stage size. Its 15 m cover exceeds
  the full visible camera height. The cursor stays inside the band and above
  the footer while remaining on the action point's true-depth axis.
- Numeric ruler anchors agree with their projected true depths. Cursor values
  agree with cursor TVD, and cursor/action-point Y separation is below
  **0.01 CSS px** in every case.
- Instrument horizontal mesh bounds stay in the band across mode transitions.
  Requiring X as well as Y intersection exposed retained horizontal offsets
  after switching from profile/heading to raise/pile during development.
- Visible log labels fit the synthetic band bounds, clear the actual footer
  mesh top, and do not overlap other recorded log text. Footer rows also fit
  and do not overlap under either width fixture.
- Footer text clears the cursor's separately recorded triangle and rounded
  plate path bounds. The recorder distinguishes these shapes from transparent
  mesh margins; a naive whole-mesh comparison produced a false collision.
- Diameter declarations match nominal diameter and the actual final-radius
  shader uniforms, with displayed rounding tolerance. Profile/raise explicitly
  qualify the final diameter; heading declares true tunnel height instead of
  asserting a circular bore diameter. Horizontal axes name TVD and offset and
  declare the measured vertical exaggeration. Heading's projected vertical
  log column does not print laboratory strength values.

At 390×844 the synthetic section is 390×262: the camera shows **13.496806 m**,
projects **19.412 CSS px/m**, and places the non-heading spud datum
**31.0592 CSS px** below the band top. The profile 35% cursor now prints
**7.32**, heading spud prints **38.58**, and the raise return-pass cursor
prints **36.00** at the 36 m action point. These are coordinate measurements,
not evidence of readable rasterized numerals.

Across the default final run the smallest recorded nominal sizes were
**9.9996 CSS px** on the depth ruler, **9.9980** in the log, **14.5667** on
the cursor, **10.9887** on the footer and **11.0526** on the station ruler.
The 9.45 px gate is an authored regression floor with rounding tolerance,
not a sourced accessibility standard.

## Follow-up from actual browser evidence

The parent's first headed report at `shots/ruler-browser/report.json` recorded
one missing cursor in `profile-return`, with action TVD **15 m**. The original
123-case CPU matrix had not exercised this deeper profile. A passing narrow
matrix therefore did not establish usable framing for every generated HDD.

The initially requested synthetic target 600 m, diameter 382 mm and seed 1337
solves to only **11.422059 m** cover. The final fixture increases its synthetic
target to 1,200 m, producing **15 m** cover and exercising an action depth beyond
the whole frustum. This reproduces the relevant depth condition; it does not
claim to reconstruct the browser contract's unrecorded target or seed.

The owner of `geology.js` then changed profile framing to shift the vertical
window only when necessary to keep the actual action point clear of the
footer. The new nine cases gate cursor/action Y alignment, printed TVD,
visible cursor mesh bounds and clearance above the actual footer mesh.
At 390×844 the final synthetic pilot and return both print **15.00** at true
15 m TVD, with the cursor's lower edge at **545.0588 CSS px**, inside the
section band. The source SHA and final enforced results above include this
fix. Follow-up rendered confirmation is owned by the parent browser task.

## Limits and distinct findings

The canvas recorder uses nominal em height and synthetic character widths.
It does not load real fonts, rasterize, execute Canvas clipping, or account
for text being painted over later. Recorded text rectangles therefore cannot
prove actual glyph clipping, final overlap, contrast, shader safety or visual
legibility. It opens no browser, requests no GPU, and verifies no GLB source.
The JSON identifies these limitations and records complete visible text calls,
actual anchor projections, mesh bounds and actual log-window offsets.
Cursor path bounds include rounded-rectangle control points and stroke width;
their boxes are conservative around rounded corners, not raster opacity masks.

The 3,000 m synthetic vertical input exposes a separate pre-existing generator
limit: `layout.totalLength` is 3,000 m but `profileDepth` stops at
**2,061.891110 m** after the bounded basement-generation loop. Requested 95%
progress clamps there. This fixture does validate four-digit text (including
1,650 m), but **does not validate a cursor near 3,000 m**. No generation code
was changed by this regression work.

Keep the numeric HUD depth until the coordinated browser capture demonstrates
the ruler's usability. The cross-band camera scale difference remains outside
this CPU ruler gate. Neither `renderer.js`, `site.js` nor `boreSDF` was edited
by this regression subtask.

## Commit checkpoint

Only `tools/checkruler.mjs` and this report were edited as owned source paths.
The ordinary command `git add tools/checkruler.mjs research/GEOLOGY_REGRESSION.md`
failed with `fatal: Unable to create
'C:/Users/henri/Downloads/drillity-the-game/.git/worktrees/drillity-geology-ruler/index.lock':
Permission denied`. Per the user's explicit no-more-approval-prompts steering,
no escalation was requested and no commit was created. The two changes remain
in the private worktree for parent integration; no original source checkout
was edited.
