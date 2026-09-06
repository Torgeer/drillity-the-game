# Separate rig corrections — independent review, 2026-09-06

The three final corrections pass this bounded CPU review. The reviewer changed
only this new report and `tools/rigfix_review_exports.mjs`. Prior optimization
tools, reports, public GLBs and `.rig-optimization` evidence were not edited.
No new machine dimension or material substitution was accepted.

## Exact expected changes

The new comparator imports the frozen `rigopt_contracts` parser/measurement
workflow. It compares every named node, local/world transform, parent, child,
extra, material, scene, mesh schema and ordered attribute/index component.
Accessor identity reads do not compute dimensions; all bounds still come from
the sole actual-vertex `tools/glbinfo.mjs` ruler.

| Correction | Intended exported change | Final geometry |
| --- | --- | --- |
| Crawler TH | Restore `feed-cradle:glass` to the authored `mount:feed-l` transform lost during reparenting | 55 primitives, 37,268 triangles; ordered POSITION/NORMAL/index arrays exact |
| Sonic truck | Exactly five `watt_w` → `watt_hint` keys, preserving their values | 33 primitives, 19,308 triangles; ordered POSITION/NORMAL/index arrays exact |
| Tunnel jumbo | Standalone output becomes `tunnel-jumbo.glb` | 53 primitives, 24,280 triangles; ordered POSITION/NORMAL/index arrays exact |

All three overall bounds, protected-contract subtree bounds and protected node
transforms match their frozen baselines exactly. Crawler intentionally changes
one non-contract mesh transform; all other mesh/node transforms are exact.
There is no global geometry or bounds tolerance hiding this movement.

For crawler the independent expected transform is derived from the baseline
mount's local matrix multiplied by the lens's retained local matrix. The
corrected lens differs from this expected local matrix by at most
**4.991889e-7**, and from its expected world matrix by **6.271981e-7**, within
the declared `1e-6` matrix-composition/export precision. This is an authored
attachment identity check, not a manufacturer dimension. The author's separate
bidirectional vertex proof reduces the baseline discrepancy of **0.762627 m**
to approximately **2.399041e-6 m**, within its `1e-5 m` export tolerance.

Opened all four new crawler front/side PNGs. The corrected blue lens surfaces
sit behind the existing guard bars in both housings; the baseline views show
housing material there instead. The surrounding assembly remains visually
consistent. Render manifests identify the input GLBs, PNG hashes and identical
CPU camera/lighting settings. These are geometry views with stand-in materials,
not live game/GPU lighting captures.

## Exporter roundoff was reproduced before correction

Whole-GLB hashes differ between unchanged-source rebuilds because small UV
rounding differences are already present in the control exports. Consequently
the gate requires exact ordered POSITION, NORMAL and index arrays, exact
accessor schemas and material/node state, while reporting every differing UV
accessor and its before/after SHA-256 and numerical maximum.

The default exception is confined to `TEXCOORD_0`, FLOAT VEC2 components, at
**2^-24 = 5.960464477539063e-8**. The frozen sonic export versus its fresh
unchanged-source control reaches **2^-23 = 1.1920928955078125e-7** only in
`static:paintedDark`; the final export repeats that maximum, so only that sonic
mesh receives the larger allowance. Other sonic meshes retain the tighter
limit. The fresh sonic before/after pair remains within 2^-24 everywhere.
No POSITION, normal, index, topology or unrelated transform tolerance was added.

The final frozen-to-corrected comparisons report UV drift in 22 crawler,
10 sonic and 5 tunnel mesh accessors. The full drift reports remain available
from the comparator; whole-file SHA-256 still identifies each exact artifact.

## Sonic metadata and primary-source interpretation

The source diff changes only the lamp metadata key and explanatory comments;
oscillator constants remain 222 kN and 150 Hz. Independently opened the
manufacturer's [150CT datasheet, page 2](https://www.terrasonicinternational.com/wp-content/uploads/2025/04/150CT.pdf#page=2):
it distinguishes the 222 kN oscillator force and adjustable 0–150 Hz frequency
from 74.7 kN pullback and 50.3 kN down force. The manufacturer's
[sonic-head specification](https://www.terrasonicinternational.com/products/tsi-sonic-heads/)
describes the force as an upper capability. These support maximum capability
comments, not a mandatory drilling setpoint, displacement amplitude or a
peak/RMS/peak-to-peak convention.

The 50/60 lamp values are not sourced electrical wattages. Their new comments
correctly label them authored relative brightness hints. Inspected the shipping
`gltfRig.js` consumer, which reads `watt_hint`, and `env.js`, which uses the hint
as a relative trim. The sonic verifier exercises the real `createGltfRigs`,
GLTFLoader and instance builder without a browser: all five baseline lamps use
the 70 default; corrected feed/crown lamps produce 60, and deck-left,
deck-right and collar lamps produce 50. The coordinator independently reran
that verifier successfully. Mount/aim world matrices and other light properties
remain exact. The trim calculation is not a photometric measurement.

The integration report accurately leaves `oscillatorKn: 180` and catalogue
90–160 Hz wording for the runtime/data owners. This model correction does not
claim those out-of-scope discrepancies are fixed.

## Standalone pipeline and artifact pairing

Child reviewer `/root/adversarial/checker_review` inspected the real tunnel
standalone fixture runs and completed a bounded read-only pipeline attack.
The baseline invokes the actual `__main__` and produces the underscore name;
the fixed fixture invokes the current standalone script and produces only the
registered hyphenated filename. Seven in-memory scenarios accepted valid output
and rejected missing, wrong, extra, empty or stale output and source mutation.
No triangle reordering allowance was necessary: all 53 tunnel meshes preserve
their exact ordered geometry/normal/index data and accessor schemas.

The crawler and sonic producers capture source/shared-library hashes before
import/build and assert the inputs remain unchanged afterward. The tunnel
fixture records its copied input hashes and verifies them after execution.
Source snapshots, export hashes and actual output paths are retained in the
new phase's proof manifests. The final artifacts reviewed here are:

| Rig | Corrected GLB SHA-256 |
| --- | --- |
| Crawler TH | `15733e9d5bb44045577f21f6908857271630022ef73a0fde8dfb54a32a528500` |
| Sonic truck | `dc809b4928368a67ec5f228e74b52d94193bf73486dad671e62f2524541e7b4d` |
| Tunnel jumbo | `99a3405cc1478f2428a0e1c3c0e9317d048fde7cd4086e0200f9a43e9ce68b56` |

The child also verified all **141** frozen optimization evidence hashes and
the original optimization patch hash remained unchanged. The coordinator owns
the separate correction patch/package proof; this reviewer did not touch Git
metadata or package the prior delivery.

## Final checks and limits

`node tools/rigfix_review_exports.mjs --self-test` passes **13** cases covering
accepted intended lens/metadata changes, rejected unrelated position, normal,
winding, node, scene/extra and UV changes, and the narrow UV control tolerance.
Final crawler, sonic and tunnel comparisons against the frozen optimized GLBs
pass. The coordinator additionally ran the comparator against the fresh sonic
before/after pair. `git diff --check` is clean on the reviewer's two new paths.

No remaining finding blocks these three corrections. Neither this reviewer nor
its child launched a GPU/browser session, changed dependencies, requested an
approval/escalation, committed, or started another task wave. Primitive counts
are not rendered draw calls, and there is no GPU/FPS or overall AAA claim.
