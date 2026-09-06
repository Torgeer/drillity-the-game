# Blender UI atlas — authoring and art direction

This is an isolated asset slice for ASTRA §8.1. It provides real Blender-rendered
control faces for DOM consumers. It does not replace or integrate the game's
existing action buttons, gauges, status labels, screen layout or event handlers.

The source is `blender/ui_atlas.py`; exports are in `public/ui/blender/`.
The palette is copied from `src/ui/styles.css` `:root` and
`src/core/contract.js` `BRAND`. The exporter checks every copied color against
the current CSS token before rendering and fails on disagreement.

## Authored treatment

One upper-left area light, one neutral ambient fill and a fixed orthographic
camera apply to every asset and state. Rounded extruded meshes form the body,
beveled rim, quiet face and inset meter trough. These are actual Cycles renders;
there is no CSS gradient substituted for the rendered geometry. A matte face
keeps the label zone quiet. The amber face has extra diffuse self-fill to retain
the existing bright CTA palette; the bevel still responds to the common key.

The normal state has a raised face. Pressed geometry lowers the face inside
the rim and darkens its coating. Disabled geometry is flatter and uses the
neutral card surface for both accent and neutral variants. Normal and pressed
remain distinct even when motion is disabled. A disabled control must also
carry the native DOM `disabled` state; an image cannot convey that semantics.

There are no baked labels, glyphs, numbers, machine names or manufacturer marks.
Status labels and icons must remain live, so color is never the sole way to
distinguish ready from warning. The meter's fill and value remain live DOM.
No material has nonzero transmission.

All mesh depths, widths, light settings, material settings, gutters and safe
regions are **NOT SOURCED authored UI design choices**, not measurements of
physical controls. The 44px target floor and 10px button radius reuse the
existing `--touch` and `--r-sm` project contracts. The compact 88px width reuses
the current `.actionbtn` width. This is provenance for a design decision, not
a claim about touch accuracy or a particular manufacturer's hardware.

## Asset contract

| Family | States/variants | Native CSS-sized image | 2x image |
|---|---|---:|---:|
| Standard button | neutral/accent × normal/pressed/disabled | 144 × 44 | 288 × 88 |
| Compact button | neutral/accent × normal/pressed/disabled | 88 × 44 | 176 × 88 |
| Status badge | neutral/ready/warning | 88 × 24 | 176 × 48 |
| Meter backing | recessed neutral trough | 160 × 24 | 320 × 48 |
| Packed atlas | all 16 faces | 352 × 480 | 704 × 960 |

The same image without a suffix is 1x; `@2x` denotes double pixel density.
The manifest gives every native rectangle, atlas position, file size and SHA256.
It also records each density's alpha coverage and the worst pixel contrast
inside each declared text-safe rectangle. It records the recommended foreground
and, for the meter, the live fill rectangle. The packed atlas contains exactly
the same RGBA pixels as the individual files. Its source has 8px exterior
gutters and at least 16px between occupied neighboring rows.

At native44px, use a real button whose layout height stays at least 44 CSS px.
The standard quiet label area is 120 × 24 at (12,10); the compact area is
68 × 24 at (10,10). Badge text fits 68 × 14 at (10,5); badges are noninteractive
24px decorations. The meter fill fits 140 × 8 at (10,8). These dimensions must
not be inferred from opaque image bounds or doubled for a high-DPI display.

Use the 2x image for a dense display while preserving these native CSS sizes.
Do not squash a 144px face into the 88px action width. Use the compact variant.
Do not enlarge a 24px badge into an interactive target. Longer labels need a
reviewed wider source variant or a larger semantic layout; shrinking text or
stretching corners is not the supported integration path.

Normal neutral and badge faces use `#FAFAFA` live text. Active accent faces use
`#231502`; disabled faces use `#96A0AE`. The exporter requires an opaque quiet
text region and at least 4.5:1 contrast against the recommended foreground at
both densities. This is an image-level check, not a complete WCAG audit of a
game screen, font rendering, focus ring, localization or interaction behavior.

## Repeatable CPU export

PowerShell, from this worktree:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python-exit-code 1 --python blender/ui_atlas.py -- --out public/ui/blender
```

The `--python-exit-code 1` flag is required in automation so an uncaught Python
exception is a failing process. `--out` accepts an absolute path or a path
relative to the source repository, regardless of the shell's working directory.
It renders with CPU Cycles, four threads, 64 samples, fixed seed17, no animated
seed, no adaptive sampling and no denoiser. The view transform is Standard with
no look, exposure0 and gamma1. Dimensions and rendering choices are recorded
in the manifest. A normalized UTF-8 source hash tolerates Git CRLF checkout
differences; the output records no timestamp or absolute workspace path.

The ray trace produces RGBA8 2x images. An alpha-weighted 2×2 box reduction
produces native faces, avoiding opaque-colored transparent corner pixels.
Packing and PNG encoding use Python's standard library; both per-row filtering
and unfiltered compression are tried and the smaller lossless stream wins.
No palette reduction, JPEG conversion, extra packages or GPU is needed.

The output budget is 400KiB across every individual PNG plus both packed
atlases. Consumers normally request a density-specific packed sheet; including
all source alternatives in the repository is not a claim that browsers must
download them all. The manifest is written only after geometry, dimensions,
safe-region checks and byte budget pass. Readers should await export completion;
individual PNGs are rewritten during a generation and are not an atomic set.

Blender's documented transparent film output preserves the background alpha
for later compositing. This slice uses that feature with opaque objects, not
transmissive control materials. See the primary
[Blender Cycles Film manual](https://docs.blender.org/manual/en/latest/render/cycles/render_settings/film.html).

## Validation and limits

The root task ran `node tools/check-ui-atlas-repeatability.mjs` on 2026-09-06:
all 35 exported files, including the manifest, were byte-identical in a separate
working directory. It compared 389,125 bytes and completed in 38.81 seconds.
The PNG set itself is 361,188 bytes. The native atlas is 32,819 bytes; the 2x
atlas is 148,221 bytes. These are measured bytes, not compressed network estimates.

Independent Sharp decoding checked all 32 face images. Every text-safe region
was fully opaque. The minimum enabled-text contrast was 8.019:1, and the minimum
disabled-text contrast was 6.173:1. Both density atlases had zero differing
pixels against their individual crops and zero stray alpha in their gutters.
Native light/dark contact-sheet review found no dark or white matte fringe.
The actual per-sprite measurements are in `public/ui/blender/manifest.json`.

The neutral rim is deliberately subdued. Independent review measured only
1.394:1 maximum outer-rim contrast against `#0D1219`, and normal-to-pressed
neutral mean pixel difference of 3.590/255. The face is therefore unsuitable
as an unlabeled standalone control indicator. Live action text, visible keyboard
focus and a persistent text or icon indication for toggle state are required.
No standalone 3:1 neutral-border claim is made. The source is optimized for a
quiet portrait HUD, not for a high-contrast frame around every readout.

A read-only consumer compatibility check found all 16 sprite variables consumed
by the new opt-in helper. The demo derives atlas size and coordinates from the
manifest, and current native sizes, text colors, compact-state precedence and
meter fill bounds agree with this source. Pixel review and the isolated browser
tests remain separate checks: matching a manifest is not proof of reach or focus.

This source has been executed with Blender5.2.1 LTS. It emits upstream warnings
about `use_nodes` becoming deprecated in Blender6.0, plus this environment's
read-only user-preference/extension-cache warning. The completed render and
asset checks do not depend on user preferences or a cache write. Compatibility
with Blender6.0 or another render device has not been measured.

The standard44px slice is intentionally separate from the current72px-tall
primary action layout. The parent integration owns any change to that layout,
the 3D allocation, thumb-reach gate and game control wiring. The isolated demo
consumes the existing Blender-authored motion tokens; it is a consumer proof,
not evidence that all game animation or controls have been integrated.
