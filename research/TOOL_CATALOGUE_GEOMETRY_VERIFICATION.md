# Catalogue geometry: independent CPU verification

Verified 2026-09-06 against baseline
`1b913e8b24011c90e42001fe1ff6dfc4660cc13b`.
The bounded production patch passes the regression below. This establishes
parameter forwarding, actual generated geometry and retained procedural wear;
it does not establish visual quality or certify the whole physical catalogue.

## Reproduction and adversarial results

Run from the repository root:

```text
node tools/checktoolcataloguegeometry.mjs --compare-ref 1b913e8b24011c90e42001fe1ff6dfc4660cc13b --json research/tool-catalogue-geometry.json
node tools/checktoolcataloguegeometry.mjs --source-ref 1b913e8b24011c90e42001fe1ff6dfc4660cc13b
node tools/checktoolcataloguegeometry.mjs --mutant old-merge
node tools/checktoolcataloguegeometry.mjs --mutant missing-76
node tools/checktoolcataloguegeometry.mjs --mutant missing-89
```

Historical modules and deliberately broken variants are imported in memory.
These commands never replace production files or write a Git index. Historical
comparison concerns tools.js/data.js; the preview resolver, forwarding expression
and ruler are the current files whose hashes are recorded in the JSON report.

| Input | Passing cases | Failing cases | Process status |
|---|---:|---:|---:|
| Current patch, including original defined-input comparisons | 265 | 0 | 0 |
| Original baseline tools.js and data.js | 87 | 178 | 1 |
| Current data, restored original alias merge | 95 | 170 | 1 |
| Current code, only the 76 mm catalogue field removed | 258 | 7 | 1 |
| Current code, only the 89 mm catalogue field removed | 264 | 1 | 1 |

The last case matters: the builder happens to default to 89 mm, so geometry
alone cannot reveal that missing catalogue fact. The explicit numeric data
contract catches it. Removing the 76 mm field fails that contract and all six
catalogue geometry cases across normal/low LOD and wear 0, 0.5 and 1.

The successful run built **850 objects** and inspected **2,917,583 actual
POSITION vertices**, including a synthetic nested-instance adapter fixture.
Its full result and source fingerprints are in
[`tool-catalogue-geometry.json`](tool-catalogue-geometry.json).
The larger baseline failure JSON is preserved locally as
`research/tool-catalogue-geometry-baseline.json`; it need not enter the patch.

## What the regression measures

The test packages each actual procedural POSITION array with its world matrix
as glTF input to the existing `tools/glbinfo.mjs` `measure()` function. Instanced
meshes contribute every instance using `matrixWorld * instanceMatrix`. A
synthetic two-instance rotated-parent fixture verifies that composition. Skins,
active morphs, unsupported storage, missing vertices and incomplete measurement
fail closed. There is no new dimensional CLI or local-AABB corner approximation.

Equality checks also fingerprint POSITION bytes, index bytes, matrices, mesh
groups and draw ranges. A dropped reducer can leave overall bounds unchanged;
its missing vertices still fail. Resolved specs and wear values must agree too.
Every build checks caller property descriptors and the complete alias default
table for mutation, then disposes its generated geometry.

Coverage includes:

- Both catalogue records at normal and low LOD, each at wear 0, 0.5 and 1.
  These execute the current exported `modelIdFor()` and the actual option object
  extracted from the current preview `buildTool()` call. This is source-bound
  consumer coverage, not an invocation of the complete public preview API.
  `tools/checktoolcataloguepreview.mjs` is the parent's separate public API proof.
- Twenty representative aliases across percussion, DTH, coring, rods, RC,
  casing, rotary, CFA, CPT, piling and sampling at all three wear levels.
  Omitted and explicitly undefined alias defaults must produce identical
  actual geometry to an explicit call of the canonical builder.
- All **178 current aliases**, testing each of their **342 default keys**
  independently with an explicit undefined caller value at wear 0.5.
- Explicit diameter/thread/length/size overrides, false reducer, zero motor
  bend, zero bag fill, zero flutes, false merge, null and empty string; the
  chosen override fixtures must actually change geometry.
- A partially undefined call with a retained explicit diameter; frozen caller
  objects; excluded inherited properties; omitted/empty/undefined whole options;
  explicit wear zero; canonical builders and unknown-ID billet fallback.
- Original-versus-current equality for representative alias defaults and
  defined overrides, direct builders/fallback and the unmerged T45 wear states.

Fixture override values are synthetic **NOT SOURCED** inputs used to test API
semantics. They add no physical fields to the catalogue.

## Measured catalogue assemblies

The separate `node tools/checktoolcataloguepreview.mjs` gate passes **21 actual
public API cases**: the two catalogue bits plus five aliases, each at wear 0,
0.5 and 1. It calls `createPreview().render()` and records the actual geometry
submitted to the renderer and copied through `drawImage()`. POSITION/index data,
internal transforms and root scale must match direct builder geometry; only the
preview's external centering and rotation are excluded. Renderer and canvas are
CPU doubles, so this is consumer-path evidence rather than a rendered-pixel test.

An independent critic verified that removing diameter forwarding, restoring the
original alias handling, and doubling the preview root's X scale each make this
public API gate fail. A separate 25-case forwarding review found no production
resolver defect. The root reran the 265-case geometry gate, all three mutation
variants, the 21-case public API gate, and existing `.qa-dimensions.mjs`,
`tools/checkfacts.mjs` and `tools/checkdata.mjs`. All expected passes and failures
matched. The dimension proof built 270 tool IDs at three wear levels and retained
the existing percussive carbide sweep tolerance (worst 0.07 mm discrepancy).

Normal LOD, generated through the real preview option expression. XYZ numbers
below are full assembly axis-aligned extents from actual vertices in millimetres.
They are **not** nominal or swept cutting diameters. The nominal values are
manufacturer-supported facts documented in
[`TOOL_CATALOGUE_DIMENSIONS.md`](TOOL_CATALOGUE_DIMENSIONS.md).

| Nominal bit | Wear | X extent | Y extent | Z extent | POSITION vertices |
|---|---:|---:|---:|---:|---:|
| T45 76 mm | 0 | 75.3160 | 80.6505 | 74.7669 | 3,239 |
| T45 76 mm | 0.5 | 75.3160 | 80.2437 | 74.7669 | 3,625 |
| T45 76 mm | 1 | 75.3160 | 77.7016 | 74.7669 | 2,965 |
| T45 89 mm | 0 | 88.1990 | 81.7347 | 87.5559 | 3,096 |
| T45 89 mm | 0.5 | 88.1990 | 81.2941 | 87.5559 | 3,735 |
| T45 89 mm | 1 | 88.1990 | 78.5400 | 87.5559 | 3,163 |

The unmerged T45 89 mm assembly retains **13, 13 and 6 carbide meshes** across
wear 0, 0.5 and 1. Each state has different POSITION/index/transform data;
scrap wear changes topology. All three match the original source's explicitly
parameterized geometry exactly. The alias fix does not substitute material-only
wear or alter the procedural builders.

## Reviewed source fingerprints and limits

SHA-256 of the verified sources:

```text
src/rig/tools.js
a7d825767db8f33ba54a52d6c1b679fbba8d9504a37919c701e2bedc72a69fa6
src/game/data.js
5eb6d315ee0a33fe2fa91dbf4d45bcbba3e752d5beb115658d38951484d2626a
src/core/preview.js
190c23f5729d1a194b83edd8559122a70827e033df79f360a74d3bf25d4c0c9f
tools/glbinfo.mjs
057bb6c89e0e8d974e2182b5db758e37c10b2254c3cd18409e8a097fab17cc11
```

The test uses real CPU geometry with the library's standalone material fallback.
It does not run a browser/GPU or measure pixels, occlusion, actual draw calls,
FPS, the framing algorithm, coating appearance or the physical accuracy of
unrelated tools. The two new facts establish nominal diameter only; retrac/HD
shape claims and other catalogue gaps remain outside this patch. No conflicting
preview, loader, renderer, rig definition or rock-bolt entry was edited.
