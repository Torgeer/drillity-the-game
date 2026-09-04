# Critique — UI screens and the cross-section band

Reviewer round, 2026-09-04. Instrument: `REVIEW_RUBRIC.md`. Target: the visual bar of a
flagship App Store game. **Anything below 8 is a FAIL.**

Scope, as briefed: the UI screens and the bottom cross-section band only. The surface 3D
band is excluded and is **not scored** anywhere below.

## Evidence I captured myself

- `node tools/shoot.mjs --headed --tag rv1 --only ui` → `shots/rv1-*.png`, `shots/rv1-report.txt`
- 10 clean section-band frames across 10 methods, DOM HUD hidden → `shots/sx-*.png`
- An **independent** HUD/geometry harness that does **not** reuse `.hudqa/measure.mjs`.
  That one measures a hand-written allowlist of ~19 class names, so any element it does
  not know about is invisible to it. Mine enumerates every painted element in the live
  screen. It also samples the renderer's own `ctx.bands` and the real `getBoundingClientRect()`
  of `.sstrip` / `.sitedock`.
- Pixel forensics on the PNGs: CIE L\*a\*b\* row profiles, horizontal variogram, robust
  contact tracing, vertical straight-edge census, edge-transition width, clipping census.

Everything below that is stated as a number was measured. Where I could not measure, I say so.

---

## THE TWO HARD GATES, MEASURED

### Axis 7a — HUD restraint: **FAIL**, on three separate counts

**(a) The band split is wrong, and I reproduce the known failure independently.**

Renderer's own `ctx.bands` plus the real occlusion mask, HIGH quality, 390×844@2×,
10 samples per method:

| method | visible surface | visible section | split | 3D share of stage |
|---|---|---|---|---|
| `dth` | 404 px | 198 px | **67.1 / 32.9** | 71.3 % |
| `core` | 404 px | 198 px | **67.1 / 32.9** | 71.3 % |
| `cfa` | 404 px | 198 px | **67.1 / 32.9** | 71.3 % |
| `rc` | 404 px | 160 px | **71.6 / 28.4** | 66.8 % |
| `rockbolt` | 404 px | 160 px | **71.6 / 28.4** | 66.8–70.0 % |

Spec is 54 / 46. The section band is running at **71.5 %** (dth/core/cfa) or **61.8 %**
(rc/rockbolt) of its specified height. The "3D at 66.8–71.3 %" claim is confirmed as a
number, but it is the wrong number — the gate is the *split*, and the split fails.

Cause, confirmed in source: `src/core/renderer.js:681-712` `computeLayout()` still does
`surfH = round(stage.h * LAYOUT.surfaceHeight)` and splits the **whole** stage. The chrome
carve-off documented at `src/core/contract.js:112-145` is not applied on this path.
Consequence: **190–228 px of the rendered section band — 49–59 % of it — is rasterised
underneath the opaque dock every frame and thrown away.**

**(b) The instrument dock grows 44 px every time the player returns to the site screen.**

Driven through ordinary navigation (`ui.show('site')` ↔ menu / garage / contracts), not a
QA-only path. Measured `.sitedock` height inside the live `.screen` node:

| site visit | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| `.sitedock` height | 427 px | 471 px | 515 px | 559 px | **603 px** |
| `.screen` nodes in DOM | 3 | 3 | 4 | 5 | 5 |

`ctx.hud.bottom` tracks it exactly. By the fifth visit the instrument dock is **71 % of an
844 px screen** and the two 3D bands are under 30 % between them — the rubric's own
baseline-failure marker is 26 %. Old `.screen` nodes are never removed. Separately,
`.sstrip` measures **135 px** live against `LAYOUT.chromeTop = 0.062` (52 px) — the
declared constant is 2.6× understated.

`shots/drift-5-auger.png` is what that looks like: a 275 px letterbox of surface, a small
window of section, and 900 px of empty navy.

**(c) Elements DO overlay the 3D — the DOM harness cannot see them because they are meshes.**

The "0 overlaps" result is real for the DOM, and I reproduce it for `dth`/`core`/`cfa`/`rc`.
It is measuring the wrong surface. Inside the section scene, drawn as geometry:

- the **drill-log strip** (`src/world/geology.js:5370`, `CFG.logWidth`) — device x 133–197,
  full height, **8.2 % of the band width**, and the strongest edge in the whole frame at
  **11.3 sd** above the mean column gradient. `REVIEW_RUBRIC.md:70-73` names "a drill-log
  entry" specifically as an outcome that belongs in the post-unit log card, not the HUD.
- the depth ruler, its numeric labels, the amber depth callout, the stratum name and UCS
  labels.

**Also: `rockbolt` has 8 real DOM overlaps** that the in-repo harness's allowlist misses,
all inside the status strip: `sstrip__k × sstrip__at` (133×11, 70×11, 37×11 px),
`sstrip__v × sstrip__as` (133×13, 70×13, 37×13 px), `sstrip__lvl × svg` (20×20 px).
One overlapping element fails the shot outright. This one has eight.

**(d) Values stated more than once.** In the dock (`shots/rv1-07-section-closeup.png`):
torque is stated **four** ways in one 250×160 px block — the coloured arc, the tick ring,
the numeral `100 %`, and a *separate* horizontal slider with its own knob. That is the
exact failure `REVIEW_RUBRIC.md:73-74` gives as its worked example. Each of FEED / HAMMER /
AIR is stated three ways (fill area, white line, numeral pill). The jam is stated three
times (banner, `WORK FREE` button, pegged torque). Plus a `1.00×` chip and an unlabelled
sparkline that is clipped mid-curve by the dock's right edge.

**(e) Hit targets below 44 px:** `.sstrip__leave` = **30×30**; `.railbtn` = **110×12**,
**119×12**, **103×12**. A 12 px-tall touch target on a phone.

### Axis 11 — domain truth, weighted double: **FAIL**

Four things stated in frames I captured are false, and one machine is impossible.

1. **The tool is 9–17× oversize against the depth ruler in the same image.**
   `rv1-14-section-clean.png`: the ruler reads 30 / 35 / 40 / 45 m at 181–190 px per 5 m →
   **36.7 px/m**. The DTH bit body measures 50–97 px across four scanlines → **1.36–2.64 m
   diameter**. The contract is Ø152 mm, which is 5.6 px. Same in `sx-overburden-16.png`
   (52 px at 27.6 px/m = **1.88 m**) and `sx-auger-6.png` (37 px at 27.8 px/m = **1.33 m**).
   A frame that states two mutually contradictory scales is wrong, and wrong beats ugly.

2. **There is no borehole.** In every section frame the string is embedded in intact rock.
   The joint network runs unbroken through the hole's position; there is no annulus, no
   cuttings column, no casing, and no disturbed material. A working driller does not
   believe this frame for one second.

3. **The auger has no flight** (`sx-auger-6.png`). The tool is a smooth khaki cylinder with
   a button bit, on an `auger` job, while the garage loadout has "Flight Auger Head, 305 mm"
   and "Flight Auger Section, 279 mm × 1.5 m" fitted. An auger is defined by its helix.

4. **Ø262 mm "Window sample traverse"** (`rv1-03-contracts.png`). `src/game/data.js:5651-5657`
   rolls `holeDia = round(clamp(nominal * rand.range(0.7, 1.35), lo, hi))` at 1 mm
   granularity, with no catalogue snap for any method except `oil-rotary`. The repo already
   contains the catalogue it ignores: `research/13-string-elements.md:123-141` reproduces
   CME's flight-auger table, and `:137-140` states that a 279 mm flight cuts a 305 mm hole.
   Ø262 / Ø159 / Ø157 mm are not sizes anything in the shop cuts. For window sampling
   specifically, `research/06:632` gives 40–80 mm, `research/06:588,591` 30–150 mm,
   `research/16:1887-1891` 86–116 mm, and the game's own item is `window-sampler-60` at
   **60 mm**. Ø262 mm is 2.3–4.4× the top of the widest sourced range.

5. **The results screen contradicts itself and libels the player** (`rv1-08-results.png`).
   It prints `SCORE 51 % · A STARTS AT 78 %` and awards **B**. The bands at
   `src/sim/drilling.js:710-712` and `src/ui/screens/results.js:39` are S ≥ 0.90, A ≥ 0.78,
   **B ≥ 0.62, C ≥ 0.44**. 51 % is a C. Two numbers on one screen that cannot both be true.
   Separately `SPEED 18 %` (red) comes from `results.js:327`
   `estSpeed = clamp(avgRop / 45, 0, 1)` — a hard-coded, method-independent, unsourced
   divisor. The job was `overburden`, whose own `nominalRop` is **6 m/h**
   (`data.js:691`). The player achieved **8.3 m/h**, beat the method's nominal by 38 %,
   and was told they were in the bottom fifth. `PLATFORM_TRUTH.md:156` rule 7 binds that
   number and it has no source.

6. **Units destroyed by a stylesheet** (`rv1-11-garage.png`): `KW`, `KNM`, `M`.
   `src/ui/screens/garage.js:273-275` correctly emits `kW`, `kNm`, `m`;
   `src/ui/styles.css:1528` `.rigstat__k { text-transform: uppercase; }` destroys them.
   `PLATFORM_TRUTH.md:149-150` names `kNm` in that exact casing. The same file already got
   this right 30 lines earlier — `garage.js:247-248` carries the comment
   *"No text-transform: … the unit is metres, not 'M'"*.

7. **"FLOORHAND / ROUGHNECK" at level 4** on a Nordic geotechnical anchor job
   (`rv1-08-results.png`). `data.js:3477-3530` flattens every ladder into one;
   `DOMAIN.md:321-322` scopes that title explicitly to the **Oil & Gas** ladder, and
   `research/01:161-162` files it under "rig floor". `floorhand`'s own copy is
   *"Tongs, slips and mud"*.

---

## PER-SHOT

### `shots/rv1-02-menu.png` — main menu (and `rv1-01-boot.png`, visually the same screen)

| axis | score |
|---|---|
| 1 first-frame impact | 4 |
| 5 detail density & hierarchy | 5 |
| 6 colour & grade | 6 |
| 7 UI craft | 4 |
| 7a HUD restraint | **GATE FAIL** |
| 10 cohesion | 6 |
| 11 domain truth | 5 |

1. **A stratum label from the section band leaks onto the menu.** "BOULDERS" is rendered at
   device y ≈ 927, left edge, half-occluded by the menu card — the section scene's in-world
   text is still drawing while the menu is up. In `src/ui/screens/menu.js`, hide the section
   scene's label layer on `menu` mount (or gate `geology.js`'s label group on
   `ctx.state.scene === 'site'`), rather than relying on the card to cover it.
2. **A scrim is being used to rescue a contrast failure over the 3D.** `menu.js:56-67`
   inserts `heroScrim`, a radial-gradient `<i>` at `z-index:-1`, sized 342×76 over the
   wordmark and 84×17 over "THE GAME", because "THE GAME" measured 3.08:1 against a lit tree
   trunk. Rubric 7a forbids scrims over the band. Delete `heroScrim` and fix it
   compositionally: in `menu.js`, raise the menu camera's pitch so the wordmark sits on sky,
   or move `.menu__tag` into the card. A darkening patch is not a design.
3. **Three chip languages in one card.** `NORDIC FOREST` is a teal outlined pill,
   `AUGER DRILLING` an amber outlined pill, `1 METHOD` a grey filled pill with no icon.
   In `src/ui/styles.css`, collapse these to one chip class with a single `--chip-accent`
   custom property, and give `1 METHOD` the same treatment or delete it — it restates the
   `AUGER DRILLING` chip directly above it.

**VERDICT: FAIL**

### `shots/rv1-03-contracts.png` — contract board

| axis | score |
|---|---|
| 1 | 4 |
| 5 | 4 |
| 6 | 6 |
| 7 | 3 |
| 7a | 5 |
| 10 | 5 |
| 11 | **3 — GATE FAIL** |

1. **Every method chip on every card is truncated.** Ten chips read `AUGER DRIL…`,
   `SITE INVESTIGA…`, `FOUNDATION / P…`. The method is the single most important fact on a
   contract card and it is unreadable on all five. In `src/ui/styles.css`, drop the fixed
   `max-width` / `flex-basis` on `.ccard` chips and let the row wrap to two lines; or use
   `METHODS[].shortName` (already in `data.js`) instead of `name` in
   `src/ui/screens/contracts.js`.
2. **The card art contradicts the card.** All five contracts are `AUGER DRILLING` and all
   five carry the same core-barrel thumbnail with a hexagonal dot pattern — a *core tube*,
   which auger drilling does not produce. In `src/ui/screens/contracts.js`, key the thumbnail
   off `contract.methodId`, not a single shared asset, and give auger jobs a flight.
3. **The board has no variety and no domain truth.** All five rows read
   `Topsoil → Glacial Till · 2 MPa`, all five are auger, and the diameters are Ø262 / Ø159 /
   Ø157 mm. In `src/game/data.js:5651-5657`, snap `holeDia` to a real size table — the CME
   flight-auger list is already in `research/13:123-141` — instead of
   `round(clamp(nominal * rand.range(0.7, 1.35), lo, hi))`. Ø262 mm on a window-sample
   traverse is 2.3–4.4× every sourced range in the repo.

Also: the sort rail is clipped hard at both screen edges (`SORT` cut at left, `Deepes` at
right) with no mask or fade.

**VERDICT: FAIL**

### `shots/rv1-09-shop.png` — iMarket directory

| axis | score |
|---|---|
| 1 | 5 | 
| 5 | 5 |
| 6 | 6 |
| 7 | 4 |
| 7a | 6 |
| 10 | 5 |
| 11 | 5 |

1. **The tab rail is flush against both screen edges and clipped mid-element.** The
   `Machines & Rigs 63` pill starts at x = 0 with no margin and `Drilling Tools &
   Consumables 212` is sliced at x = 780. Add the page gutter to the scroller's
   `scroll-padding-inline` in `src/ui/styles.css` and a `mask-image` fade on both ends.
2. **`A · MACHINES & RIGS`** — a stray index letter prefixed to the section label. Remove
   the `A ·` prefix in `src/ui/screens/shop.js`, or label it properly.
3. **The two auger thumbnails are the same object and neither reads as an auger.** "Flight
   Auger Head, 305 mm" and "Flight Auger Section, 279 mm × 1.5 m" render as the same
   detached helical ribbon at two scales, with no central shaft, no carbide, and no
   connection. In `src/rig/tools.js`, give the head a pilot and cutting teeth and the
   section a box/pin at both ends, and weld the helix to a visible stem.

**VERDICT: FAIL**

### `shots/rv1-09b-shop-listings.png` — shop listings

| axis | score |
|---|---|
| 1 | 3 |
| 5 | 4 |
| 6 | 5 |
| 7 | **2** |
| 7a | 4 |
| 10 | 4 |
| 11 | 4 |

1. **Two filter rails are sliced in half by the sticky header, in one screen.** At device
   y ≈ 130–160 a half-height amber pill and grey pill are cut off by the breadcrumb; at
   y ≈ 330–360 the same again above the `CONDITION` row. This is the single ugliest thing in
   the UI set. In `src/ui/styles.css`, give the sticky breadcrumb an opaque background and
   correct `top` offset, and add `scroll-margin-top` to the filter rails so they park below
   it instead of behind it.
2. **The same rig is listed twice with identical copy and identical art**, differing only by
   a `NEW` / `USED` chip. Merge condition into one listing with a condition selector in
   `src/ui/screens/shop.js`, or the marketplace reads as a rendering bug.
3. **Debug values are shipped as UI copy.** `ROP 1.00×`, `Abrasion 50%`, `Wear rate 1.00×`
   are raw multipliers with no referent, and `Torque 178.0 kNm` restates the description's
   "178 kNm at the drive head" verbatim — a value stated twice. In
   `src/ui/screens/shop.js`, print deltas against the currently owned rig ("+12 % ROP") and
   delete the chip that duplicates the prose.

**VERDICT: FAIL**

### `shots/rv1-11-garage.png` — garage

| axis | score |
|---|---|
| 1 | 5 |
| 4 silhouette (thumbnails) | 3 |
| 5 | 5 |
| 6 | 6 |
| 7 | 3 |
| 7a | 5 |
| 10 | 5 |
| 11 | **4 — GATE FAIL** |

1. **`.rigstat__k` uppercases the units into nonsense: `KW`, `KNM`, `M`.** Delete
   `text-transform: uppercase` from `src/ui/styles.css:1528`. The strings arrive correct
   from `garage.js:273-275`; the same file already documents this exact fix 30 lines
   earlier at `garage.js:247-248`.
2. **A chip overflows its card by 32 px.** `OVERBURDEN / DUPLEX DRILLING` runs from x = 61
   to x = 549 while the card ends at x = 517. And the rig tag truncates mid-word to
   `AUGE ·` / `CABL ·` with no ellipsis. In `src/ui/styles.css`, set `min-width: 0` and
   `overflow: hidden` on the chip row's flex container and use `shortName` for the tag.
3. **The rig portraits are illegible at card size.** The machine occupies roughly a quarter
   of a 430×290 tile and its mast is a plain rectangular prism — you cannot tell a
   geotechnical crawler from a cable-tool rig at this size. In `src/ui/components.js`
   `paintPreview`, frame the rig to ~80 % of the tile height with a three-quarter hero
   angle and a rim light, the way the shop's tool previews are framed.

Also: the two loadout rows are both labelled `AUGER FLIGHTS`, and `778 m` / `2,483 m` are
unlabelled and duplicated by the bar beside them.

**VERDICT: FAIL**

### `shots/rv1-10-career.png` and `shots/rv1-10b-career-skills.png` — career

| axis | score |
|---|---|
| 1 | 3 |
| 5 | 3 |
| 6 | 6 |
| 7 | 4 |
| 7a | 5 |
| 10 | 5 |
| 11 | 6 |

1. **The skill tree is a wireframe of a data structure.** Nine identical grey rounded
   rectangles reading `0/4`, joined by 1 px grey lines that pass *behind* nodes — the
   `Feed Finesse → Jam Sense` and `Strata Reader → Combo Keeper` edges both cross the
   `Rod Handler` / `Jam Sense` column. In `src/ui/screens/career.js`, route edges around
   node boxes (or lay the tree out on a proper grid with reserved lanes), and give each node
   an icon and a filled/available/locked visual state.
2. **Two identical segmented tab bars are stacked directly on top of each other**
   (Certificates/Skills/Ladder, then Operator/Toolsmith/Site Lead), so the player cannot
   tell which level they are operating at. Make the second row a different control in
   `src/ui/styles.css` — underlined text tabs, or a chip row — not a clone of the first.
3. **Each locked certificate states its lock three times**: a padlock in the left tile, a
   padlock inside the price chip, and `Unlocks at level 5`. Keep the sentence, delete both
   padlocks in `src/ui/screens/career.js`. And the `HELD 0 / 14` empty state occupies 370 px
   — 22 % of the screen — for zero content; collapse it to a single line.

**VERDICT: FAIL**

### `shots/rv1-08-results.png` — results

| axis | score |
|---|---|
| 1 | 5 |
| 5 | 5 |
| 6 | 7 |
| 7 | 4 |
| 7a | 3 |
| 10 | 5 |
| 11 | **2 — GATE FAIL** |

1. **The screen states a score and a grade that contradict each other.** `SCORE 51 %` with
   grade `B`, against bands where B starts at 62 % and C at 44 % (`drilling.js:710-712`).
   In `src/ui/screens/results.js:368-378`, stop taking `r.grade || bd?.grade ||
   settle?.grade` ahead of the local derivation without checking that the composite being
   printed is the one the grade came from — `results.js:523-531` already says that is the
   rule and the guard is not holding.
2. **`SPEED 18 %` is computed from a hard-coded 45 m/h.** `results.js:327`:
   `estSpeed = clamp(avgRop / 45, 0, 1)`. Replace the constant with
   `METHODS[methodId].nominalRop` (already present — `overburden` is 6 m/h at
   `data.js:691`), so that beating the method's nominal rate cannot score red.
3. **Every metric is stated twice and the footer sits on the content.** Each of the four
   grade tiles carries a percentage, a bar and a caption; the `iMarket` / `Next contract`
   bar overlays the `TOOL CARE` / `SAFETY` cards with no fade or reserved space. In
   `src/ui/screens/results.js`, drop the bars (keep the number), and give the footer
   reserved height with `padding-block-end` on the scroller.

Also: the grade medallion — the money shot of this screen — is a webfont capital in two
thin rings with a soft glow. No bevel, no material, no weight.

**VERDICT: FAIL**

---

## THE CROSS-SECTION BAND

Frames: `shots/rv1-14-section-clean.png` (HUD-free, `dth` @ 34.17 m),
`shots/rv1-07-section-closeup.png`, and ten `shots/sx-*.png` across ten methods.
Scale taken from the in-frame ruler: **36.7 px/m** in `rv1-14`, 27.6–27.8 px/m in the `sx-*`
frames.

| axis | score |
|---|---|
| 1 first-frame impact | 4 |
| 2 lighting & value structure | **3** |
| 3 material believability | **3** |
| 4 silhouette & form | **2** |
| 5 detail density & hierarchy | 4 |
| 6 colour & grade | 5 |
| 9 motion evidence | **1** |
| 11 domain truth | **2 — GATE FAIL** |

### Checking the claims against the pixels

| claim | what I measure | verdict |
|---|---|---|
| feature size 0.567 → 1.392 m | horizontal variogram half-sill: gneiss **1.14 m**, mid **0.57 m**, granite **0.34 m** | **partly true, not uniform.** The granite bed, which is 55 % of the band, is still at 0.34 m and carries 3.7× less tonal variance (sill 42 vs 154 L\*²) |
| adjacent ΔL\* 10.6 → 24.0 | **21.7** and **13.0** at the two real contacts; the other four gradient peaks are noise (ΔL\* 0.9–4.2) | true for the two contacts that exist |
| crushed pixels 9.5 % → 4.5 % | **3.08 %** at RGB ≤ 6 | better than claimed |
| 6 beds and 5 contacts in 20 m | **2 lithologies + one 1.0 m marker** in 20.1 m: GNEISS, FRACTURED, GRANITE | **false** |
| contact deviation sd 0.16–0.35 m | **0.184 m** and **0.178 m** (25 px horizontal pre-smooth, 490 columns) | true but at the floor of its own range — and both contacts move *together*, so the FRACTURED band is a constant-thickness ribbon, not a geological contact |

Two further measurements nobody has quoted:

- **Value structure.** p1 L\* = 0.3, p5 = 1.6, p50 = 27.9, p95 = 44.7, p99 = 47.2. The whole
  band lives in **L\* 0–47**. There is no highlight anywhere in the cross-section, and 5 % of
  it is crushed to black. Rubric axis 2 asks for a full range with held highlights.
- **Texture resolution.** Median 10–90 % transition width of a crack ridge: **8.0 px**
  (gneiss), **8.5 px** (granite), against **5.0 px** for the surface band in the same frame.
  At 36.7 px/m every joint trace is a **22 cm-wide soft gradient**. The rock texture is being
  magnified well past its own resolution.

### The three most damaging problems

1. **The tool is 9–17× oversize against the ruler drawn beside it, and there is no
   borehole.** Measured bit width 50–97 px at 36.7 px/m = 1.36–2.64 m; the contract is
   Ø152 mm (5.6 px). The string is embedded in intact rock — the joint network runs
   unbroken through the hole's position, with no annulus, no cuttings and no casing. In
   `src/world/geology.js`, drive the tool mesh's world radius from
   `contract.holeDia` × `secScale` instead of a fixed art scale, and cut the hole: carve an
   annulus into the face shader along the string path, above the bit, with a cuttings column
   in it. Until both land, this frame is wrong, and wrong beats ugly.
2. **The drill-log strip is a 2D diagram pasted into the middle of the 3D cut, and it is the
   strongest edge in the frame.** Columns 133–136 sit at **8.7–11.3 sd** above the mean
   column gradient and columns 194–197 at 3.1–3.9 sd — two ruler-straight, full-height
   vertical edges bracketing a 61 px beige panel of graph-paper "+" glyphs and lithology
   hatch. `research/18-visual-reference.md:28` calls this exact thing "a diagram with a
   picture stuck on top". In `src/world/geology.js:5370`, delete `logStrip` from the section
   scene and move the drill log to the post-unit card, per `REVIEW_RUBRIC.md:70-73`. There
   is a third straight vertical edge at x ≈ 690–776 (3.8–5.0 sd) where the vignette has a
   hard boundary — soften that to a radial falloff at the same time.
3. **Two lithologies in 20 m, and they are the same texture with a hue shift.** GNEISS and
   GRANITE share crack topology, cell size, line weight and softness; only the tint differs.
   Gneiss is *defined* by foliation and there is none. In `src/world/geology.js`'s face
   shader, give each `STRATA` entry its own generator parameters — foliation banding for
   gneiss at a shallow dip, equigranular crystal mottle for granite — and drive octave count
   and warp amplitude from the bed's grain size rather than sharing one `oreGrade`-style
   pattern. Then raise the bed count: `sx-overburden-16.png` shows **one** lithology for the
   entire 20 m band.

### Additional section findings, per frame

- `sx-auger-6.png` — the best frame in the set: four horizons, cobbles individually
  legible. But **the auger has no flight** (a smooth cylinder with a button bit), the
  `BOULDERS` and `FRACTURED` bands both have ruler-straight top edges, and every large
  boulder carries the same 5–6 spoke radial rosette — they read as stamped decals, not
  stones. That is the self-reported "faint concentric target"; it is not faint, it is the
  most legible feature on each clast. Fix in `src/core/assets.js`: rotate the clast decal
  UV by a per-instance random angle and drop its contrast by ~60 %.
- `sx-overburden-16.png` — **the tool is a bare rectangular prism**. Rubric axis 4: any
  primitive left visible as a primitive is an automatic fail. It also has cyan dashes
  protruding sideways at the shoe that read as a glitch.
- **The FRACTURED band's clasts are glossy dark-brown spheres with specular highlights** —
  they read as wet chocolate, not as a weathered/fractured zone. Drop `roughness` to
  0.85–0.95 and break the spheres into angular fragments in `src/world/geology.js`.
- **The depth ruler uses two visual languages for one class of label.** `30` and `40` are
  near-white with an amber leader; `35` and `45` are blue-grey at roughly 35 % opacity over
  a dark ground, effectively illegible. There is also an orphan amber tick at a depth with
  no label. And the stratum labels (`GRANITE`, `210 MPa`) show heavy chromatic fringing —
  the text is going through the bloom/post chain and smearing.
- **Axis 9 scores 1 because the section is frozen.** Across ten method frames there is not
  one cutting in flight, not one bubble, no water, no spoil, no dust. The cross-section is
  where the work happens and nothing in it moves.

**VERDICT: FAIL**

---

## THE FIVE HIGHEST-VALUE FIXES

1. **Make `computeLayout()` carve the chrome off before it splits, and stop the dock
   growing.** Two bugs, one gate. (a) `src/core/renderer.js:681-712` — subtract
   `ctx.hud.top` / `ctx.hud.bottom` from `stage.h`, split the remainder 54/46, and offset
   both `setBand` calls and `seamUv`; that alone takes the split from 67/33 to spec and
   stops 190–228 px of section being rendered under the dock every frame. (b) The site
   screen is not tearing down: `.screen` nodes accumulate 3 → 5 and `.sitedock` grows 427 →
   603 px over five ordinary visits, so by visit five the 3D is under 30 % of the stage.
   Nothing else on this list matters until the section band is the size it is supposed to be.

2. **Cut the borehole and size the tool from the contract diameter.** The section band's
   two worst domain failures are the same fix in `src/world/geology.js`: drive tool radius
   from `contract.holeDia × secScale`, and carve an annulus with a cuttings column along the
   string path. A 1.4–2.6 m bit beside a ruler that says 36.7 px/m, in rock that has no hole
   in it, fails axis 11 on its own and no amount of texture work rescues it.

3. **Give every stratum its own generator, and delete the drill-log strip from the scene.**
   One "cracked rock" material tinted twice is why the band reads as a diagram. Per-bed
   foliation / crystal / clast generators, plus removing the 11-sd vertical edge that the
   log strip puts through the middle of the cut, is the difference between
   `research/18`'s target and what is on screen.

4. **Fix the numbers the screens state.** Four are provably wrong and all are cheap:
   `results.js:327` `avgRop / 45` → `METHODS[id].nominalRop`; the grade/score contradiction
   at `results.js:368-378`; `styles.css:1528` `text-transform: uppercase` on `.rigstat__k`;
   and `data.js:5651-5657` snapping `holeDia` to the catalogue that is already sitting in
   `research/13:123-141`. Each is a one-line change and each currently puts a false claim in
   front of a driller.

5. **Impose one type scale, one radius and one chip.** Measured across the five UI screens:
   **seven** distinct corner radii (1, 2, 7, 10, 14, 24, 999 px), five type sizes across
   eight weights, with 11 px appearing at weights 400/600/650/700/800 on the garage screen
   alone, and three different chip treatments in a single menu card. Then fix the truncation
   that comes with it — ten ellipsised method chips on the contract board, `AUGE ·` in the
   garage, and two filter rails sliced in half by the sticky header in the shop listings.
   This is what separates "premium is restraint" from a screen that looks assembled.
