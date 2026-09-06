# Scale-plate source sampling correction

2026-09-06. CPU implementation checkpoint; actual GPU candidate recapture is pending with the root coordinator.

The headed diagnostic at `shots/instrument-diagnostic` found a clean source scale-plate canvas but softened/ghost-like strokes in the intermediate instrument target and the isolated single-plane capture. Exactly one scale-plate mesh/map existed. This evidence rules out overlapping duplicate footer declarations in that fixture; it does not prove a final visual improvement from the present patch.

`buildScalePlate` halved `stripSuper()` when sizing its canvas. At DPR2, a488x45 source was magnified across780 device pixels. The fix removes that half factor in this function only. Mesh dimensions, declaration text, the36CSS-pixel footer, positions, caching and font-size expression remain unchanged. The existing `k` derives paint coordinates and type size from source width, preserving logical CSS sizing. Integer canvas-height rounding produces a measured maximum0.044738CSS-pixel change in minimum nominal font height across132 cases; no physical geometry or drilling semantics change.

| CPU fixture | Before canvas | After canvas | Before raw RGBA8 bytes | After raw RGBA8 bytes | Increase |
| --- | --- | --- | ---: | ---: | ---: |
| 320x568 | 400x45 | 800x90 | 72,000 | 288,000 | 216,000 |
| 390x844 | 488x45 | 975x90 | 87,840 | 351,000 | 263,160 |
| 430x932 | 537x45 | 1024x86 | 96,660 | 352,256 | 255,596 |

These are source pixel-storage calculations, not measured total GPU/Canvas memory allocation. The existing1024px width cap remains. Render-target dimensions and draw count are unchanged by source structure; no FPS or timing benefit is claimed. Other instrument canvases, including the station ruler, are outside this patch.

## Meaningful regression evidence

The existing actual-geology/Three.js CPU gate now compares the scale map's real canvas dimensions against its projected size at the fixture's DPR2. It requires at least one source pixel per device pixel, with one pixel for integer rounding, and verifies the authored36CSS-pixel height. It tests resulting geometry and source density, not the implementation formula. Canvas widths use synthetic text metrics and are not real raster/glyph evidence.

- Before production edit:132cases,10,099assertions, exactly132 `footer-source-covers-device-pixels` failures.
- After edit:132cases,10,099assertions, zero failures.
- `node tools/checkreadoutcache-shipping.mjs`:7cases,58,843assertions, zero failures; cached readout command/geometry equivalence retained.
- `git diff --check -- src/world/geology.js tools/checkruler.mjs`: pass.

Before/after full CPU evidence is saved in `C:/Users/henri/Downloads/threads/drillity-coordination/scale-plate-before.json` and `scale-plate-after.json`.

Frozen SHA256 immediately after these checks:

- `src/world/geology.js`:381dc07762aaa22707c3b343c58adf669c588dda1557920340b0ffeedb0628d9.
- `tools/checkruler.mjs`:b08a410d4c846237b1fe137fe5d7e26f38d20883c531be3ee6f9e5ad0c485b56.
- Pre-edit geology baseline:868b5c967990838b6a8751d704559e6543e489167e91f7c86f7d2419a78237e9.

The earlier frozen-render discrepancy remains separate: normal0->normal1 changed119 pixels, while normal1 onward was exact. Later fixed-shadow captures were already settled and do not establish shadow causality. Keep strict repeat/coverage thresholds and record frozen-scene warm frames honestly.
