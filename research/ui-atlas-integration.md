# Blender UI atlas integration handoff

This slice supplies actual CPU Cycles artwork, an opt-in DOM asset helper and
an isolated review demo. It does **not** change or integrate game controls.
The parent owns placement, gameplay wiring and the final reach/overlap gate.

## Owned source and outputs

- `blender/ui_atlas.py`: standalone geometry, materials, orthographic camera,
  one upper-left key light, seeded CPU Cycles render, transparent PNG export
  and lossless atlas packing. It does not import the shared rig library.
- `public/ui/blender/`: generated transparent art and `manifest.json`.
- `src/ui/blender-atlas.css`: opt-in selectors under `[data-blender-ui]`.
- `tools/ui-atlas-demo/`: independent review page and Vite configuration,
  using the existing Blender motion exports. This is not a game screen.
- `tools/check-ui-atlas.mjs`: export/consumer verification.
- `tools/check-ui-atlas-repeatability.mjs`: a second actual CPU render from
  a different working directory and byte comparison with published exports.

The atlas has standard 144×44 and compact 88×44 button faces in neutral and
amber palettes, each normal/pressed/disabled; neutral/ready/warning 88×24
badges; and a 160×24 meter backing. Compact badges are noninteractive.
The manifest is the authority for rectangles, text-safe regions, foregrounds,
pixel density, hashes and file sizes. The new artistic geometry is explicitly
**NOT SOURCED**, because it is authored UI rather than a physical-machine claim.

## Reproduce without changing shared dependencies

Run these from this worktree in PowerShell. No package installation is needed.

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --threads 4 --python-exit-code 1 --python blender/ui_atlas.py --
node tools/check-ui-atlas.mjs
node tools/check-ui-atlas-repeatability.mjs
node tools/ui-atlas-demo/serve.mjs
node tools/ui-atlas-demo/serve.mjs --build
```

The direct Vite API entry uses port **5196**, with a task-local Vite cache and
`configFile: false`, avoiding unnecessary ancestor-directory config scanning.
Headed browser
captures additionally require the coordination file `gpu-owner.txt` to name
`ui-atlas` exactly. CPU rendering does not require that lease. The repeatability
check permits `--blender /path/to/blender` or `BLENDER_BIN` on another machine;
byte identity is claimed only for the measured Blender version and CPU host.

## Adoption boundaries

Keep live labels, meter values, status meanings, native `<button>` elements,
keyboard behavior and focus indicators in DOM. Import the existing generated
motion stylesheet before the helper. Initialize atlas image/size/position
variables from the manifest; the demo supplies a concrete consumer example.
Resolve the art directory relative to the host page's deployment base.

Use native logical dimensions for both densities: a 288×88 image is a
144×44 CSS-pixel button, not a larger target. The 2× export can serve denser
displays but is not a native 3× source. Do not stretch fixed-radius atlas
rectangles or shrink hitboxes on press. Use another authored width or the
documented text-fit fallback when a translation or enlarged label does not fit.

The existing build copies public assets independently of whether a screen
requests them. Integrating the exports adds their bytes to the deployable
directory; importing the helper and adopting classes are separate parent
changes. Ship the packed atlas pair and manifest when using this consumer;
individual sprite files are useful alternatives, but their bytes are additional
payload if retained. Preserve the manifest/checker contract when pruning.

See `ui-atlas-art-direction.md`, `ui-atlas-consumer.md` and
`ui-atlas-review.md` for the detailed art, consumer and adversarial evidence.

## Measured handoff status — 2026-09-06

- CPU export: 16 faces, 34 PNGs, **361,188 PNG bytes**; 35 files and
  **389,125 bytes** including the manifest.
- Independent second render: all 35 files byte-identical, from a separate
  working directory, in 38.81 seconds on this host.
- Independent decoded-pixel review: no atlas crop mismatches or nonzero alpha
  in gutters; all text-safe pixels opaque. Minimum enabled text contrast
  **8.019:1**, disabled **6.173:1**, across both densities.
- Static export/consumer gate: passes; **11 corrupt fixtures rejected**.
- Existing motion authority: Node checks 11 curves at 8,193 samples each;
  Blender checks actual F-Curves at 4,097 samples each. Both pass.
- Isolated production build: passes. All 35 public files match the source;
  38 total demo files, no game models. HTTP checks also match every asset
  under `/atlas-review/`, with valid compiled JavaScript and CSS responses.
- Two source-review findings were fixed: focus backing on a pressed enlarged
  label over light ground, and light-ground caption contrast. Animated meter
  output explicitly disables intermediate live announcements.

Headed verification of the built `/atlas-review/` subpath passes at 320/390/430
CSS pixels at 1× and 390 pixels at 2×, using mobile emulation. All 32 screenshots
pass encoded-density dimensions and unchanged before/after target geometry.
The gate verifies native 44-pixel button targets, three native 88×24 badges,
keyboard activation, no overlap or horizontal overflow, 200% control/badge text,
light ground, combined focus/pressed states, and both reduced-motion settings.
The text fixture enlarges control and badge text; it is not a full-page zoom test.

Two measured browser findings were resolved: the badge font now defaults to
Arial at the unchanged 11-pixel floor so its DOM text bounds fit the authored
safe area; and captures use mobile contexts with explicit geometry checks.
Earlier desktop full-page captures changed layout and clipped the right edge;
those captures were rejected and superseded by the final 32-image evidence.
The current report records successful awaited browser closure. The owned
preview was stopped, port 5196 returned `ECONNREFUSED`, and the exact `ui-atlas`
GPU lease was cleared. This is not a game-integration, full accessibility,
performance or AAA visual verdict.

The private worktree's Git index resides outside the permitted workspace at
the integration repository's `.git/worktrees/drillity-ui-atlas`. Per the
parent's no-escalation instruction, no index write was attempted. There is no
scoped commit; use the exact new paths and SHA-256 inventory in
`research/ui-atlas-delivery.json`, or `shots/ui-atlas/ui-atlas-source.zip`.
The ZIP contains only 49 owned source/art/docs/test paths plus that inventory;
it excludes the pre-existing synchronized files, shared dependencies, temporary
renders, built demo and browser evidence. The 15 pre-existing tracked content
changes snapshotted at task start remain byte-unchanged.

`shots/ui-atlas/ui-atlas-evidence.zip` separately contains the final browser
report and 32 captures, independent pixel measurements, second-render proof,
font/capture diagnostics, and shutdown evidence, with its own hash inventory.
Parent integration and final game placement remain outstanding by design.
