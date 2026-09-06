# Sonic lamp metadata and oscillator definitions — 2026-09-06

The owned correction is five lamp-extra key renames from `watt_w` to
`watt_hint`. Existing values remain 50/60 and are explicitly **NOT SOURCED**
electrical wattage. All 100 top-level Python assignments, including sourced
dimensions, `OSC_KN = 222` and `OSC_HZ = 150`, remain AST-identical to the frozen
optimization source. Source comments now distinguish maximum oscillator
capability from feed force, displacement amplitude and a recommended drilling
setpoint; `[BR p.N]` is explicitly defined as the existing `[DT p.N]` source.

## Actual consumer result

`src/core/gltfRig.js:77,415` defaults to 70 unless the GLB lamp mount has
`watt_hint`. The old `watt_w` field therefore did not reach the lamp consumer.
`src/core/env.js:2346–2352` solves light power separately and applies
`clamp(wattHint / 70, 0.45, 1.6)` as a relative trim. These numbers are not literal
photometric or electrical watts.

`node tools/rigfix_sonic_verify.mjs` passed using the actual shipping
`createGltfRigs`, GLTFLoader, name restoration and instance builder on both local
GLBs. Its fetch stub serves only the exact fixture URL, without network, browser,
renderer or GPU. All five mount and aim world matrices, cone, range, colour and
motion classification match exactly.

| Lamp mounts | Before loader hint | After loader hint | Before trim | After trim |
|---|---:|---:|---:|---:|
| feed-work-light, crown-work-light | 70 | 60 | 1 | 0.857142857 |
| deck-work-light-l, deck-work-light-r, collar-work-light | 70 | 50 | 1 | 0.714285714 |

The hint values above were observed through the shipping loader. The trim ratios
are arithmetic from the inspected `env.js` expression; they are not a rendered
brightness measurement. No electrical lamp rating was found in the reviewed
datasheet, which lists LED work lights without wattage.

## Primary evidence and supported downstream corrections

The manufacturer's [TSi 150CT datasheet, page 2](https://www.terrasonicinternational.com/wp-content/uploads/2025/04/150CT.pdf)
lists oscillator force 222 kN, frequency adjustable from 0 to 150 Hz, pullback
74.7 kN and downforce 50.3 kN. These are separate specifications. The manufacturer's
[sonic-head page](https://www.terrasonicinternational.com/products/tsi-sonic-heads/)
describes the force as an upper capability and gives the same frequency limits.

The owner's local `C:/Users/henri/Downloads/Drilltechniques-Sonic-Brochure.pdf`
was extracted and visually inspected at pages 2 and 8. Page 8's Sonicor 50K row
explicitly labels 222 kN oscillator output force and 150 Hz frequency as maxima.
Page 2 describes variable, operator-controlled frequency depending on ground and
string conditions. The axial sinusoid sketch does not give a numeric displacement
amplitude. Page renders are saved as `.rig-corrections/sonic/drilltechniques-p2.png`
and `drilltechniques-p8.png`. The official PDF text was read; its web screenshot
request failed with a cache miss, so no official-PDF visual-render claim is made.

The reviewed evidence does not establish peak/RMS/peak-to-peak force convention,
displacement amplitude in millimetres, or a narrower recommended operating band.
No such value was invented. The brochure's other head rows are not used to revise
this rig; one historical 33K row contains inconsistent values.

The following downstream changes are supported but are **outside this agent's
ownership and remain unedited here**:

| Location | Existing disagreement | Supported correction |
|---|---|---|
| `src/rig/rigFactory.js:2586` | `oscillatorKn: 180` | Use 222 as maximum oscillator output capability; retain `oscillatorHz: 150` as maximum frequency. |
| `src/game/data.js:1230` | Description says 90–160 Hz | Describe frequency as adjustable up to 150 Hz; do not substitute a newly invented operating band. |

Do not replace the separate game `feedForce: 90` with 222 kN oscillator force.
Its gameplay meaning must first distinguish downforce (50.3 kN) from pullback
(74.7 kN). Searching runtime `oscillatorKn`, `oscillatorHz`, `force_kn` and
`freq_hz` found the procedural assignment but no consumer of the oscillator
metadata. Adding new extras would leave the disagreement unresolved. The existing
carriage extras stay `force_kn: 222` and `freq_hz: 150`. The procedural visual
oscillation at `rigFactory.js:9150` uses `sin(t * 78) * 0.004`; it is not a
source-calibrated displacement model, and no amplitude edit is justified here.

## Export and identity proof

Both fresh exports used Blender 5.2.1 LTS in background mode with two threads and
`tools/rigfix_sonic_build.py`. The producer captures source and every
`blender/lib/*.py` file before importing the source; it asserts the bytes remain
unchanged after export. Bytecode writing is disabled. The verifier checks recorded
source snapshots, the current source files, current shared libraries and GLB
hashes. Detailed records are `before-identity.json`, `after-identity.json` and
`verification.json` under `.rig-corrections/sonic/`.

| Artifact | SHA-256 |
|---|---|
| Frozen source / fresh-before input | `3865065a6b948f2b0dfa1e98513a2e7a6c09c838a3c39c2b54cb343ce7b5d06e` |
| Fresh before GLB | `50266e1d38591ded4821081c7b17726863f3f55e4a1c2b763a2c034c7009fd61` |
| Corrected source / fresh-after input | `ace6226811d7a004bee7fdd3b188de9b041fe95d03f447bc72efc54f58b2150f` |
| Fresh after GLB | `dc809b4928368a67ec5f228e74b52d94193bf73486dad671e62f2524541e7b4d` |
| Frozen optimization/public model, unchanged | `003edafe42cec1762461f85e305206ab97924e6e3b78fa9788c76184b9612d5e` |

`tools/glbinfo.mjs` remains the sole actual-vertex ruler. Both fresh GLBs have
19,308 triangles, 33 primitives and 54 nodes. Their measured working-pose bounds
are exactly equal: approximately W 2.515 × H 7.304 × L 7.630 m. Primitive counts
are not rendered draw calls. File size changes from 1,180,604 to 1,180,620 bytes
because the five new metadata keys are longer, with GLB JSON padding.

After normalizing only the five expected lamp-extra keys, the entire exported
JSON is identical: materials, all node transforms, hierarchy, animation metadata,
accessor definitions and mesh assignments. Ordered POSITION, NORMAL and index
buffer data are byte-exact. There is no positional or shape tolerance.

The BIN chunks are not byte-identical because Blender's export introduces tiny
UV rounding differences. The fresh before/after pair differs in 75 UV scalar
values across three accessors, maximum `2^-24` (5.960464477539063e-8). The frozen
optimized model versus a fresh export of its unchanged source independently
reproduces UV differences up to `2^-23` (1.1920928955078125e-7), specifically
`Cube.001` / the static painted-dark group. Both comparisons preserve all ordered
positions, normals and indices exactly. The verifier restricts tolerance to
tightly packed FLOAT VEC2 `TEXCOORD_0`, rejects non-finite values, and uses the
stricter `2^-24` limit for the fresh pair. The frozen control JSON is exact.

Actual ruler output is saved in `before-glbinfo.txt` and `after-glbinfo.txt`;
constant and frozen-file checks are in `source-frozen-verification.json`. No new
render was required to prove mesh identity; visual brightness was not assessed.
Public models and all optimization evidence remain frozen. An initial producer
iteration created a Python `__pycache__` in the frozen source folder before
bytecode writing was disabled; this was disclosed to the parent, left untouched,
and changed no frozen source or model bytes. Blender also printed an existing
extension-cache write warning; both exports completed successfully.

## Exact source deliverables

- `blender/sonic_truck.py` — lamp metadata key and source-definition comments only.
- `tools/rigfix_sonic_build.py` — fresh export with paired input hashes.
- `tools/rigfix_sonic_verify.mjs` — geometry/metadata identity and actual loader check.
- `research/rigs/sonic-corrections-2026-09-06.md` — this report.

Corrected model evidence is `.rig-corrections/sonic/after.glb`; it has not replaced
`public/models/sonic-truck.glb`. No shared library, runtime, game-data, Git index or
old optimization artifact was edited by this correction.
