# Blender UI atlas consumer

This is an isolated, integration-ready asset slice. It does not import or change
the game's controls, state, global stylesheet, existing screens, or components.
The parent task owns integration and must rerun the actual HUD overlap and
reach checks after placing these faces on game controls.

## Review and validation

From the worktree root, using existing dependencies only:

```powershell
node tools/check-ui-atlas.mjs --self-test
node tools/ui-atlas-demo/serve.mjs
node tools/ui-atlas-demo/serve.mjs --build
# After stopping the dev server, preview the build at /atlas-review/:
node tools/ui-atlas-demo/serve.mjs --preview
```

The review runs at `http://127.0.0.1:5196/`, with `strictPort: true`, disabled
dependency discovery/HMR, and a task-local `tools/ui-atlas-demo/.vite-cache`.
`serve.mjs` imports the Vite config directly with `configFile:false`; the ordinary
CLI config bundler attempted an unnecessary parent-directory read denied by the
session sandbox. No packages are installed and no broader access is requested.
Build output stays under `tools/ui-atlas-demo/dist`, contains only this demo and
the atlas exports, and uses relative URLs so it can live at a URL subpath.
`--preview` serves only that built directory through Vite's preview API, also
with `configFile:false`, port 5196 and `strictPort:true`; its explicit base is
`/atlas-review/`. It cannot run at the same time as the dev server on this port.

The static check verifies the exact sixteen sprite IDs, all 34 PNGs, both pixel
densities, dimensions, SHA-256 hashes, byte counts, transparent/partial/opaque
alpha pixels, atlas rectangle non-overlap, exact consumer safe areas and foregrounds, isolated CSS and
actual Blender motion imports. Empty/missing exports fail. Seven corrupted
fixtures plus stale-source, false-total, changed-safe-area and changed-foreground
fixtures must be rejected (eleven in total). The current normalized Blender source hash and the
manifest's total byte claim are checked against actual files. The export budget
is 400 KiB of PNGs, an authored UI
budget (`NOT SOURCED` as a physical specification).

Headed review requires the shared lease file
`C:/Users/henri/Downloads/threads/drillity-coordination/gpu-owner.txt` to name
`ui-atlas`. The harness verifies that lease before launching muted Chrome and
between viewport cases. It never writes the lease.

```powershell
node tools/check-ui-atlas.mjs --browser
# When the review server is already running, or for a built subpath:
node tools/check-ui-atlas.mjs --browser --url http://127.0.0.1:5196/ --out tools/ui-atlas-demo/evidence
# The built preview verifies deployment URLs under a real subpath:
node tools/check-ui-atlas.mjs --browser --url http://127.0.0.1:5196/atlas-review/ --out tools/ui-atlas-demo/evidence-built
```

The headed gate records 320, 390 and 430 CSS-pixel portrait widths, plus 390 at
DPR 2; all have an 844 CSS-pixel viewport height and explicit
`isMobile:true, hasTouch:true` contexts. For each it captures normal,
keyboard focus, held press, light ground, 200% control/badge text, and both OS
and in-page reduced motion. Space and Enter activate native toggles with live
Pressed/Released text cues. It measures every live control (empty sets fail), at least 44×44 px,
no target overlap, no horizontal overflow, live-text containment, an unchanged
pressed hitbox, actual pressed atlas offsets and actual generated durations.
The live meter completes at the asserted value; reduced motion completes it
immediately and removes label displacement. Console/page/asset errors fail.
This is a control-and-badge text enlargement fixture, not a claim that browser
zoom or every game screen has been certified. Screenshots and `report.json`
are generated evidence, excluded from commits by the local `.gitignore`.

All eight screenshots per case use the same capture gate: normal, focus, held
press, light ground, 200% text, 200% text with light ground and pressed keyboard
focus, in-page reduced motion, and OS reduced motion. Every PNG must encode
exactly CSS viewport width × density pixels. Before and after every screenshot,
the report records `clientWidth`, `innerWidth`, `visualViewport.width`, and all
target page rectangles. Content bounds must fit the actual `clientWidth`, and
target x/y/width/height must remain identical across capture. This catches the
measured desktop-scrollbar reflow that previously produced a 375px PNG for a
declared 390px viewport. The mobile context measures the intended portrait
subject with stable capture geometry.

The harness closes its browser and any dev server it started before writing
the final report. It records `lifecycle.browserClosed` and, for an owned server,
`lifecycle.serverClosed`; cleanup failures invalidate the pass and preserve the
failure details. A preview supplied through `--url` remains caller-owned and
needs separate shutdown evidence.

### Measured built-preview result — 2026-09-06

The corrected mobile run against `/atlas-review/` passed all four cases and
32 captures. Each case contained 11 real controls and three native badges,
with zero normal text fallbacks and no page/console/asset errors.

| CSS viewport | Density | Normal PNG width | Before/after content width |
| --- | --- | --- | --- |
| 320×844 | 1× | 320px | 320 / 320px |
| 390×844 | 1× | 390px | 390 / 390px |
| 390×844 | 2× | 780px | 390 / 390px |
| 430×844 | 1× | 430px | 430 / 430px |

All captured target rectangles remained unchanged. The final report records
`pass:true`, `captureCount:32`, and `lifecycle.browserClosed:true`.
Evidence is `tools/ui-atlas-demo/evidence-built/report.json` with the 32 PNGs
beside it. These results apply to the isolated consumer and asset review;
game placement, game thumb reach, and game performance still need integration
validation by the parent task.

## Minimal host binding

Import the existing generated `src/ui/motion.css` once, then the opt-in helper
`src/ui/blender-atlas.css`. Place `data-blender-ui` on the containing element.
The helper owns only `.bui-*` descendants under this scope. It sets no global
tokens, game selectors, asset paths, or motion defaults.

Read `public/ui/blender/manifest.json` from the deployed asset base. Construct
URLs relative to the page's deployment base, never a hardcoded domain root.
The demo's `new URL('ui/blender/', document.baseURI)` works because its entry
page sits at that deployment base. An application whose current route is nested
must supply its configured base instead of blindly copying `document.baseURI`.

After the selected-density atlas successfully decodes, bind:

```js
scope.style.setProperty('--bui-atlas-image',
  `image-set(url("${atlas1xURL}") 1x, url("${atlas2xURL}") 2x)`);
scope.style.setProperty('--bui-atlas-size',
  `${manifest.atlases['1x'].width}px ${manifest.atlases['1x'].height}px`);
for (const sprite of manifest.sprites) {
  scope.style.setProperty(`--bui-${sprite.id}`,
    `${-sprite.atlas.x}px ${-sprite.atlas.y}px`);
}
scope.dataset.atlasReady = 'true';
```

Until readiness is set, the helper supplies a plain dark fallback with readable
live text. A host must not claim readiness after a failed decode. The demo
displays a visible load failure and never marks itself ready if loading fails.
It preloads only the density selected for its display. Both sheets are still
available through `image-set` for the browser's density selection. The atlas
gallery is a review artifact; production only needs the helper and one sheet at
its selected density. Individual PNG exports are alternatives, not additional
required production requests.

```html
<button type="button" class="bui-button bui-button--accent">
  <span class="bui-button__label">Start</span>
</button>
<button type="button" class="bui-button bui-button--compact" disabled>
  <span class="bui-button__label">Locked</span>
</button>
<span class="bui-badge bui-badge--ready">
  <span aria-hidden="true">✓</span><span>Ready</span>
</span>
```

Use native DOM `disabled`; use `aria-pressed` only for actual toggle semantics.
The review exposes toggles expressly as state examples. A momentary command
already gets its pressed face from `:active`; it should not be given a false
toggle state merely for styling. Badges are noninteractive. If a product makes
a badge actionable, wrap it in a real control with its own at-least-44px target.
The text and symbol provide non-color state cues. No label, quantity, or
manufacturer branding is baked into the art.

Independent pixel review found the neutral rim deliberately quiet against the
dark HUD and the pressed face subtle. Do not rely on that rim or a face-color
change alone to signal persistent toggle state. Keep a live text/state cue such
as the demo's Pressed/Released labels, semantic ARIA, and the strong focus ring.

## Native sizing and enlarged text

| Face | Native CSS size | 2× pixels | Live safe area |
| --- | --- | --- | --- |
| Standard button | 144×44 | 288×88 | 120×24 at (12,10) |
| Compact button | 88×44 | 176×88 | 68×24 at (10,10) |
| Status badge | 88×24 | 176×48 | 68×14 at (10,5) |
| Meter backing | 160×24 | 320×48 | Fill 140×8 at (10,8) |

These are authored UI dimensions from the manifest, **NOT SOURCED machine
dimensions**. The 44px control floor is the owner's project requirement in
`ASTRA.md` §8.1 and `.hudqa/measure.mjs`; it is not presented as WCAG AA's target
size threshold. High density changes image pixels, never CSS target dimensions.
The atlas at 352×480 native becomes 704×960 pixels at 2×. The stylesheet keeps
`background-size` at native atlas dimensions and uses native negative offsets.

Do not stretch the faces into arbitrary panel sizes or shrink an existing
multi-line 72px-high game action to fit this art. Choose a compatible face or
author a new one. The demo measures live-label ranges. If a translated or
enlarged button/badge exceeds its safe region, it adds `bui-text-fit-fallback`:
text wraps on an explicitly flat surface with no stretched atlas. Disabled
and pressed styling survives this fallback. Production should retain this
measurement or an equivalent fit policy and test its actual localized labels.

The badge default is separately pinned to `Arial, sans-serif` via
`--bui-badge-font`. In headed Chrome, the actual 600-weight 11px labels had
12px DOM range heights in Arial, inside the 14px safe region; the same labels
measured 15px with Segoe UI/system-ui despite their 14px CSS line height and
correctly triggered fallback. The 11px floor and conservative range measurement
are preserved. Hosts overriding the badge font must retain the fit check. The
normal browser gate requires all three rendered badges to remain 88×24px.

## Actual motion and accessibility

Button labels alone move 1px; their hit elements and art boxes never scale.
The helper reads `--motion-d1`/`--curve-press` and
`--motion-d2`/`--curve-release` directly from the checked-in Blender CSS export.
The review meter calls `ease('count', t)` over `DUR.d4` from the actual generated
`src/core/motion.js`, authored in `blender/ui_motion.py`. No substitute easing is
labelled Blender motion. The durations/shapes are authored design choices, not
sourced perception claims.

OS reduced motion and the scoped `.reduced-motion` preference remove press
displacement. The review's JS also cancels and completes any in-flight meter
animation on preference changes. Meter text and ARIA values remain live; final
changes are announced in a separate polite status region instead of making a
screen reader announce every animation frame. Keyboard focus has a two-tone
visible ring, and forced colors replace decorative faces with system borders.
