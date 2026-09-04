# DRILLITY I THE GAME

A portrait-mobile 3D drilling career game, built on the real Drillity domain:
the **iMarket** equipment taxonomy and the **Talent** career model.

You start as a helper with a beaten crawler and an auger flight in the Nordic
forest. You finish running raise-bore and HDD crews across the world.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:5178
```

```bash
npm run build        # → dist/index.html, a single self-contained file
```

The build inlines **everything** — three.js, all game code, the CSS and the logo
artwork — into one HTML file with no runtime dependencies except the two font
hosts (see *Fonts* below).

### URL overrides (QA / support only)

| Param | Effect |
|---|---|
| `?quality=low\|medium\|high` | Pin a tier, bypassing the device probe. Also disables adaptive downgrade. |
| `?shot` | `preserveDrawingBuffer`, so `renderer.captureFrame()` works |
| `?region=<id>&method=<id>` | Preselect for a demo contract |

---

## Architecture

`src/main.js` owns the ctx object, the system lifecycle and the frame loop.
Every subsystem is a factory returning `{ init, update, resize, dispose }` and is
loaded through a **static** module map — see the comment there; an earlier
`import(/* @vite-ignore */ path)` version silently excluded every subsystem from
the production bundle while the dev server stayed fine.

```
src/
  core/
    contract.js   the shared contract: BRAND, QUALITY, LAYOUT, EVENTS,
                  GameState, the GROUND table, and small pure utilities.
                  Imports nothing — everything else may import it.
    renderer.js   WebGLRenderer, the two cameras/scenes, the two-band scissor
                  pass, and the post chain (ACES → AO → bloom → grade → SMAA)
    env.js        sky, sun, IBL, fog, weather, and eight per-region lighting
                  recipes; also lights the cross-section band
    assets.js     every texture and material, generated procedurally at runtime.
                  There are no image files in this game except the logo.
    preview.js    the small dedicated renderer behind shop/garage 3D thumbnails
  world/
    geology.js    the cross-section: strata, borehole, ruler, boulders,
                  fractures, karst voids, water table
    terrain.js    the surface site: ground, vegetation, props, per-region kit
  rig/
    rigFactory.js nine procedurally-built machines with working animation
    tools.js      104 tool ids — bits, crowns, hammers, rods, augers, anchors
  sim/
    drilling.js   the physics and the game. Fixed 120 Hz step, all tuning in
                  one exported TUNING table
    vfx.js        pooled GPU particles, 37 kinds, zero per-frame allocation
  game/
    data.js       160 items, 9 rigs, 14 methods, 8 regions, 14 certs, 14 roles,
                  24 skills — every category traceable to the real taxonomy
    economy.js    pure settlement functions; `simulateCareer()` balances the game
    progression.js  XP, levels, unlocks, purchases, save/load
  audio/
    audio.js      every sound synthesised at runtime with Web Audio. No files.
  ui/
    styles.css    the token system — no hex literals outside `:root`
    shell.js      screen registry, transitions, overlays, bus wiring
    screens/      one module per screen
```

### The two bands

The screen is one WebGL context rendered as two scissored viewports: the
**surface** (top 54%) and the **geological cross-section** (bottom 46%), sharing
a single post-processing chain. They are one continuous fiction — the borehole
in the section lines up with the mast above it.

`LAYOUT` in `contract.js` is the single source of truth for the split. The
section camera's frustum height lives in `renderer.js` (`sectionViewH`) and is
adopted by `geology.js`; both must agree, and geology's layout constants are
authored against it.

---

## Ground truth — read before changing content

- **`DOMAIN.md`** — the real Drillity taxonomy: methods, the 7 super-groups /
  45 families / 285 subcategories, thread systems, material grades, the career
  ladder. Plus §10, the hard rules on the logo and factual accuracy.
- **`PLATFORM_TRUTH.md`** — iMarket and Talent: what they actually are, their
  data models, and Part C, the fact-accuracy rules every user-visible string
  must satisfy.
- **`FACTS_VERIFIED.md`** — the "from the field" lines, each with a source tag.
  **Nothing enters that list without a source.** It also records two claims that
  were removed as wrong, so they do not come back.
- **`GAMEDESIGN.md`** — the loop, the groove mechanic, the quality bar.
- **`REVIEW_RUBRIC.md`** — the standard visual review is graded against.

Three rules that are easy to get wrong:

1. **The logo is a wordmark, not an icon.** Use `src/ui/assets/logo-*.png`.
   Never redraw, re-letter or recolour it. Brand amber is `#F59E0B`.
2. **Odex is eccentric; Symmetrix is concentric.** A ring bit stays in the
   ground; a wing bit retracts and is reused. The taxonomy PDF merges some of
   these for merchandising — the game must not repeat that as engineering.
3. **No Drillity internal business metrics** in the game: no listing counts, no
   subscription prices, no partner names.

---

## Visual QA harness

```bash
node tools/shoot.mjs                       # all states
node tools/shoot.mjs 06-site --tag p2      # selected, tagged
node tools/shoot.mjs --headed              # real GPU (required on this machine)
node tools/shoot.mjs --quality low
```

Drives the game into ~15 named states through the `window.__DRILLITY.__qa`
bridge, writes PNGs to `shots/`, and emits `shots/<tag>-report.txt` with fps,
draw calls, triangle count, texture/geometry counts and every console error.

**Headless Chrome cannot bind the discrete GPU on this machine** — it falls back
to SwiftShader, which is too slow to capture the full scene. Use `--headed`.
Frame-rate numbers are only meaningful in headed mode.

### The facts guard

```bash
npm run check:facts
```

`FACTS_VERIFIED.md` is the authority for every "from the field" line; the code
holds a copy, and a copy drifts. **`npm run build` runs this first and fails the
build on any divergence**, because a wrong field fact is the worst thing this
game can ship.

It has already earned its place. The shipped copy read *"the most abrasive
ground **you will meet**"* where the verified line reads *"the most abrasive
ground **in the game**"* — the second is scoped to the `GROUND` table and true
by construction; the first is an unqualified superlative about the real world
that no source supports. One word.

The direction of truth is always **from the markdown to the code**. If a line
is wrong, correct it in `FACTS_VERIFIED.md` with a source and let the code
follow — never quietly edit the copy.

Diagnostic helpers, all in `tools/`: `diag.mjs` (canvas/stacking),
`bigobj.mjs` (largest objects in the scene), `sphere.mjs`, `ray.mjs`
(raycast into a screen position), `iso*.mjs` (bisect by hiding layers).
These exist because a black sphere over the rig turned out to be a
screen-space effect, not geometry — that class of bug is worth tooling for.

---

## Performance budget

| | Target |
|---|---|
| Frame rate | 60 fps mid-range phone |
| Draw calls | ≤ 60 section · ≤ 80 surface **(the rig is inside this)** · ≤ 70 rig |
| Texture memory | ≤ 90 MB HIGH · ≤ 35 MB LOW |
| Particles | 12k HIGH · 7k MEDIUM · 3k LOW |

**The two surface numbers are not disjoint, and this line used to imply they
were.** The harness's `surface` bucket is the whole surface scene *including the
rig*, so `surface` can never be read against 80 while a 70-call rig sits inside
it. Measured, **non-rig surface content is only 25–28 calls** — the rig is
almost all of it. Read `surface` as the combined figure.

Note also that the per-band probe parks shadows, which is right for attribution,
but `frame.calls` — the number that governs frame rate — includes the shadow
pass, the AO prepass, transmission and post. **Shadows alone measure +57 calls.**

Quality is probed at boot and steps **down only**, with a 5 s grace period and a
12 s cooldown so it cannot oscillate. A pinned `?quality=` disables it entirely.

---

## Fonts

Inter and Oswald load from Google Fonts. These are the only external requests
the game makes, and they are the only external CSS/font origins the deployment
target's CSP permits. The layout must still hold if they never arrive — the
fallback stacks are tuned, and `assets.js` / `tools.js` bake decal text against a
checked fallback rather than assuming Oswald is present.
