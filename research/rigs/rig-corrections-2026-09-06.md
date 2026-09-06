# Separate rig corrections — 2026-09-06

Three narrow source corrections follow the frozen optimization delivery:

- `blender/crawler_th.py`: preserve the joined feed-lens world transform when
  changing its parent. The actual exported lenses now occupy their authored
  housing positions. Bidirectional vertex matching improves from approximately
  0.763 m error to 0.000002400 m, within the explicit 0.00001 m QA tolerance.
  This measures vertex identity, not a manufacturer-sourced dimension.
- `blender/sonic_truck.py`: publish the existing lamp brightness values under
  `watt_hint`, the key read by `gltfRig.js`. The 50/60 hints are explicitly
  **NOT SOURCED** electrical wattage; `env.js` uses them as relative brightness
  trims. Source comments clarify the already-correct oscillator capability
  constants: 222 kN maximum and a frequency adjustable up to 150 Hz.
- `blender/tunnel_jumbo.py`: the actual standalone entry point now chooses
  `tunnel-jumbo.glb`, matching the registered rig ID. An isolated baseline run
  reproduces the underscore filename and an isolated corrected run produces
  only the required hyphenated filename.

The four optimized public GLBs, first-phase patch, tools, reports and evidence
remain unchanged. A hash manifest verifies 141 protected files. The frozen
optimization patch SHA-256 is
`df4f9f4335b6822634752fc6fa4e8956c8f8ead215f4465224b46913fc908ca0`.

## Evidence and limits

The detailed proofs and reproducible commands are in
[crawler corrections](crawler-corrections-2026-09-06.md),
[sonic corrections](sonic-corrections-2026-09-06.md),
[tunnel corrections](tunnel-corrections-2026-09-06.md), and the
[independent review](rig-corrections-review-2026-09-06.md).

CPU exports retain source/binary hashes and shared-library identity. Crawler
closeups render the actual exported before/after GLBs with identical CPU
camera and lighting settings. All dimension comparisons use the existing
`tools/glbinfo.mjs` actual-vertex ruler. Primitive totals are not rendered draw
calls, and this phase makes no GPU performance claim.

Unchanged-source control rebuilds reveal tiny UV rounding differences. Exact
whole-file hash equality is consequently not an export-equivalence test.
The independent review checks geometry, hierarchy, materials and metadata,
allowing only the measured UV rounding and the specific intended changes.
Each retained file still has its own exact SHA-256 for source/artifact pairing.

## Integration

Apply `.rig-optimization/scoped.patch` first, then
`.rig-corrections/rig-corrections.patch`. The second patch is relative to the
**final optimized sources**, not the original source before optimization.
Its explicit source manifest is `.rig-corrections/scoped-paths.json`.
`.rig-corrections/package-verification.json` records forward and reverse patch
application plus normalized source-hash checks in a separate integration
fixture. No Git index operation or commit is used.

Corrected build outputs remain private under `.rig-corrections/`; the precise
source/output pairs are listed in `.rig-corrections/corrected-assets.json`.
The parent integrator can rebuild from the combined source or use those paired
artifacts. This task does not replace the frozen public models.

## Residuals for the runtime/data owners

The model source already uses the supported oscillator constants. The
out-of-scope procedural runtime `src/rig/rigFactory.js` still declares
`oscillatorKn: 180`; the supported maximum is 222 kN. The catalogue description
in `src/game/data.js` still says 90–160 Hz; the published capability is 0–150 Hz,
not a prescribed drilling setpoint. These discrepancies were researched and
reported, with no runtime/data edits in this patch. See the manufacturer's
[150CT datasheet, page 2](https://www.terrasonicinternational.com/wp-content/uploads/2025/04/150CT.pdf#page=2)
and [sonic-head specification](https://www.terrasonicinternational.com/products/tsi-sonic-heads/).

Oscillator force is distinct from 74.7 kN pullback and 50.3 kN down force.
Resolve the meaning of the catalogue's `feedForce` before changing it. The
primary sources do not establish a displacement amplitude or a
peak/RMS/peak-to-peak force convention. No unused oscillator metadata was added
to the GLB.
