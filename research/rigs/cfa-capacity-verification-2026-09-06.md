# CFA capacity verification — 2026-09-06

The existing `cfa-rig` capacity of **32 m is not supported by the selected OEM configuration or by the authored mechanism**. This patch changes the catalogue rating to the **15 m basic CFA configuration without a Kelly extension**. It also corrects the Blender source's false length attribution and stale arithmetic. It does not certify the current model's complete operating cycle: its auger still cannot withdraw fully clear of grade.

This resolves the capacity claim in ASTRA §8.6.3. A separate geometry and motion correction remains necessary, as detailed below. `FACTS_VERIFIED.md` is unchanged. No dimensions, material parameters, meshes or exported GLBs changed in this patch.

## Primary evidence, visually checked

**S1 — Sunward, Drilling Rigs S Series, SWDM240SC, printed page 24 / physical PDF page 25.** [Manufacturer-hosted catalogue](https://sunward.eu/wp-content/uploads/2023/08/SUNWARD_DRILLING-RIGS_S-SERIES_EN.pdf).

The configuration table distinguishes the following CFA ratings:

| Kelly extension configuration | Drilling depth |
| --- | ---: |
| None | 15 m, recommended |
| 3 m | 19 m |
| 5 m | 21 m |
| 6 m | 22 m |

The same page dimensions a 17,000 mm crowd stroke and a 28,120 mm overall working height. The drawing includes the 6,000 mm extension above the rotary drive. Its maximum-depth headline is therefore not a rating for every configuration. Visual inspection confirmed **28,120**, despite one search extraction reading 23,120. The page does not source the model's 19.6 m auger.

Local source: `C:\Users\henri\Downloads\SUNWARD_DRILLING-RIGS_S-SERIES_EN.pdf`, SHA256 `f7c54aac082b938c30bb3cd046cc5dc7adeef568b9aaab667ac402fa58466502`. Rendered with Poppler at physical page 25 to `tmp/pdfs/sunward-cfa-p25.png`, then visually read.

**W1 — BAUER BG 28 H, BT 85 PremiumLine, April 2018, page 18, CFA application.** [OEM brochure hosted by its equipment distributor](https://www.ecanet.com/uploads/files/Resources/BG_28_H_BT_85_PremiumLine_EN_905_790_2.pdf).

| Configuration | Auger length | Crowd stroke | Kelly / mast extension | CFA depth with cleaner |
| --- | ---: | ---: | --- | ---: |
| Basic | 16.0 m | 14.670 m | None / none | 14.1 m |
| Upgraded | 19.0 m | 17.670 m | 8 m / 3 m | 25.1 m |

The drawing places the extension above the rotary drive. It demonstrates why visible flight length alone does not establish maximum pile depth. These dimensions describe a different machine and two distinct configurations; they cannot source the Sunward-based model's 49 turns or be mixed into a third certified configuration.

Downloaded to `tmp/pdfs/bauer-bg28h-bt85-2018.pdf`, SHA256 `aa75a59ecb5fbadaeb6e307f85dd3a9d58282c89100edd60789fa57ce9d0c7b6`. Physical page 18 rendered to `tmp/pdfs/bauer-bg28h-cfa-p18.png` and visually checked. The PDF copyright identifies the manufacturer and edition.

## What the authored machine actually contains

Source inspected: `blender/cfa_rig.py` at base commit `74a51f303783910afa7eb952108a709099a0ae52`, particularly the constants, `build_masthead()`, `build_drive()`, `build_auger()` and `build()` hierarchy.

- `CROWD = 17.00`, with absolute exported carriage endpoints in the mast's parent frame. The mast origin is 0.6 m above model grade, giving carriage local Y approximately 3.0–20.0 and world drive origins 3.6–20.6 m.
- `PITCH = 0.400` and `TURNS = 49` produce **19.6 m**, not the former comment's 18.0 m. Neither S1 nor W1 sources this exact combination for the modeled configuration; the comments now say **NOT SOURCED**.
- All four `auger:*` meshes belong to `pivot:spindle`, which is fixed beneath `slide:carriage`. The spindle provides rotation; the carriage provides the sole axial tool feed.
- The other two slide nodes are mast-support ram rods. They do not telescope the auger. The exported file contains no animation clips and no independent Kelly extension stage. The fixed top guide and static mast splice flanges do not create additional tool travel.

The source therefore depicts an auger attached directly below its drive, without the separately moving extension required for the deeper rated configurations. Its overall height is not proof of such an extension.

## Actual-vertex measurement

File: `public/models/cfa-rig.glb`, SHA256 `a10c16b3071c96926077271c1d8785637951989d082d9a3f5e1f5e2bf4bf7b35`. It is the final asset used by the preceding metadata gate, unchanged throughout this investigation.

Run the existing sole dimensions CLI:

```powershell
node tools/glbinfo.mjs --parts public/models/cfa-rig.glb
```

It reports **39 primitives, 67,468 triangles, 65 nodes, no images**. The spindle subtree is approximately 1.000 × 20.174 × 0.985 m at rest. Its height includes the starter head and picks, so it is not the source constant `AUGER_LEN`.

For endpoint measurement, reused **the same** `parseGLB()` and `measure()` functions from `tools/glbinfo.mjs` in memory; only a cloned JSON carriage translation changed. No second ruler was added. Every vertex was readable. Coordinates below are glTF Y-up metres relative to the authored model ground plane; a negative tip ordinate describes geometric penetration, not a certified operating rating.

| Pose | Carriage parent-local Y | Actual spindle minimum Y | Actual spindle maximum Y |
| --- | ---: | ---: | ---: |
| Authored rest | 19.949998856 | -0.660000741 | 19.513873696 |
| Declared upper endpoint | 19.999999976 | -0.609999621 | 19.563874817 |
| Declared lower endpoint | 2.999999976 | -17.609999621 | 2.563874817 |

The underlying whole-model endpoint measurements and asset hash are also recorded in `research/RIG_METADATA_MEASUREMENTS.json`, the `cfa-rig` record. Endpoint measurement was repeated for this report specifically on the spindle subtree.

This establishes that the modeled mechanism cannot reach 32 m under its declared feed contract. Its 17.61 m geometric lower reach also cannot justify a new 17.61 m operating rating. The chosen 15 m rating comes from S1's basic configuration table, not from rounding mesh bounds.

## Scoped correction and remaining work

`src/game/data.js`: change only the CFA entry's `depthCapacity` from 32 to 15, cite S1 beside it, and state the base depth in its invented-brand catalogue description. The current data model has one capacity per rig, so this describes the delivered CFA setup; it does not establish separate CCFA or rotary-Kelly upgrade ratings.

`blender/cfa_rig.py`: correct the auger arithmetic and attribution, replace the obsolete endpoint numbers, and remove the unsupported assertion that the withdrawal shortfall was in the manufacturer's source. All executable geometry and travel values are preserved.

The following remain measured integration gaps, not claims solved by the capacity patch:

1. **Withdrawal clearance:** the actual tip is still 0.610 m below grade at maximum carriage height. A collared rest pose can explain the initial -0.660 m position; it does not explain the lack of an available clear withdrawal pose. Reconcile the auger, drive, cleaner and any extension against one complete sourced configuration before changing physical constants. Do not blame the 17 m stroke or splice together the two OEM configurations.
2. **Method-specific capacities:** `fleetDepthFor()` takes the largest rig capacity among rigs advertising a method. `foundation-bg` also advertises CFA and has a shared 78 m rotary-Kelly rating. Consequently this patch alone does not lower all generated CFA contract depths. Separate method/configuration ratings and selected-rig eligibility need their own coordinated change.
3. **Live feed behavior:** this worktree's GLB `makeDyn()` does not publish `augerDriven`; the generic live feed branch uses cyclic rod-length progress. The procedural auger branch instead divides depth by a fixed 14 m. Neither is evidence that this GLB follows physical CFA depth. Sent to the parallel runtime attachment audit; no loader or rigFactory edits are included here.

## Validation

- `node tools/checkdata.mjs`: exit 0, data self-check 0 problems. Existing ground-strength warnings remain for auger, site-investigation and cased-CFA.
- `node tools/checkfacts.mjs`: exit 0, all 36 shipped facts still match the verified document.
- `node tools/checkcareer.mjs`: exit 0, 10 assertions across 7 probes passed. Its economic design notes are not new failures from this correction.
- Existing glbinfo CLI and its exact vertex-measurement implementation used as above; no GPU, browser or model rebuild required because executable geometry is unchanged.
