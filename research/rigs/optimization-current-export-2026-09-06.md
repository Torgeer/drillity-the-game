# Current-library machine exports — 2026-09-05T23:59:10.545Z

Private workspace: C:\Users\henri\Downloads\threads\drillity-optimization-current-export

Status: PASS — ready for parent review/integration. No original checkout, frozen delivery, Git index, GPU session or shared publisher was modified. Twelve fresh exports ran sequentially, with one Blender background process and two CPU threads at a time.

## Provenance and integration

The before/optimized/corrected directories are explicit separate stages. Before copied the original machine sources and current shared libraries. Optimized applies the frozen 21-path optimization patch. Corrected applies the separate 14-path repair patch. Both normalized source manifests verified in full; every stage uses byte-identical current shared libraries. source-manifest.json records the exact source bytes and verification.json rechecks the inputs after all exports. The frozen delivery directories were copied to snapshot/ and their original patches were rehashed unchanged.

Apply the original optimization patch, then the correction patch to the original checkout after review. Shared libraries are excluded from both patches and must stay current. Copy only evidence/corrected/{bolter,crawler-th,sonic-truck,tunnel-jumbo}.glb to the original public/models after those matching source changes. Source scripts remain checked-in authority; generated ignored GLBs are not automatically Git additions.

## Fresh measured exports

| Machine | Before triangles | Final triangles | Before bytes | Final bytes | Primitives | Optimization subtree delta (m) |
|---|---:|---:|---:|---:|---:|---:|
| bolter | 39708 | 36956 | 2451216 | 2323400 | 47 | 0 |
| crawler-th | 41028 | 37268 | 2468072 | 2300536 | 55 | 0.000029449316146568094 |
| sonic-truck | 20436 | 19308 | 1230900 | 1180620 | 33 | 0 |
| tunnel-jumbo | 28680 | 24280 | 1528376 | 1335616 | 53 | 0.0016793459696886615 |

Optimization verifies exact overall actual-vertex bounds, all 150 named contract transforms/ancestry/extras, material identities/membership, unchanged primitive partition, real triangle/byte savings, and zero transmission. Only the previously reviewed tunnel hose sampling has the explicit 2 mm protected-subtree allowance; other models retain 1 mm. Transform and overall-bound requirements are exact. No second dimension ruler is used: all geometry bounds come from glbinfo.measure through the existing rigopt_contracts helper.

The correction comparator checks ordered POSITION/NORMAL/index identity and narrowly expected crawler lens-transform and sonic metadata mutations. Its pre-existing UV-only floating-point allowances remain reported explicitly. Tunnel corrected export executes the actual __main__ path in an empty isolated output directory and asserts the sole output is tunnel-jumbo.glb. Bolter corrected is a separate unchanged-source control export.

## Checks

- Optimization checker adversarial self-test: {"ok":true,"checks":25}
- Correction checker adversarial self-test: {"ok":true,"checks":13}
- Twelve Blender exports: 12/12 exit zero.
- bolter: {"originalReproduction":true,"optimization":true,"exactOverallBounds":true,"exactContractTransforms":true,"exactAnimation":true,"identicalPrimitiveCount":true,"triangleReduction":true,"byteReduction":true,"correction":true,"noTransmission":true}; original→fresh baseline overall delta 0 m; correction failures [].
- crawler-th: {"originalReproduction":true,"optimization":true,"exactOverallBounds":true,"exactContractTransforms":true,"exactAnimation":true,"identicalPrimitiveCount":true,"triangleReduction":true,"byteReduction":true,"correction":true,"noTransmission":true}; original→fresh baseline overall delta 0 m; correction failures [].
- sonic-truck: {"originalReproduction":true,"optimization":true,"exactOverallBounds":true,"exactContractTransforms":true,"exactAnimation":true,"identicalPrimitiveCount":true,"triangleReduction":true,"byteReduction":true,"correction":true,"noTransmission":true}; original→fresh baseline overall delta 0 m; correction failures [].
- tunnel-jumbo: {"originalReproduction":true,"optimization":true,"exactOverallBounds":true,"exactContractTransforms":true,"exactAnimation":true,"identicalPrimitiveCount":true,"triangleReduction":true,"byteReduction":true,"correction":true,"noTransmission":true}; original→fresh baseline overall delta 0 m; correction failures [].
- Current checkmodels.mjs: exit 0; full output evidence/checkmodels.mjs.log.
- Current checkrigmetadata.mjs: exit 0; full output evidence/checkrigmetadata.mjs.log.

The current runtime was copied into the private corrected stage, with all original models plus these four final candidates, for checkmodels and checkrigmetadata. This is CPU loader/metadata coverage. It is not a rendered-phone, warm FPS, <=70 actual rig draw-call or AAA visual verdict. Original full integration must still run its normal gates and serialize headed verification via the GPU lease. Historical physical faults in the machines were not silently considered fixed by this optimization.

## Exact final source and assets

### bolter

- Source: C:\Users\henri\Downloads\threads\drillity-optimization-current-export\corrected\blender\bolter.py
- Source SHA-256: 3c13b1cfee036ef029c7c6ff5321eae12c1faafa3195fababf8c80d093769333
- Asset: C:\Users\henri\Downloads\threads\drillity-optimization-current-export\evidence\corrected\bolter.glb
- Asset SHA-256: c3a29ca8d6da32eb87f39f8e207ebd3d3aa8da1685f50cb71708d89f0e32ed23
### crawler-th

- Source: C:\Users\henri\Downloads\threads\drillity-optimization-current-export\corrected\blender\crawler_th.py
- Source SHA-256: ba66db8f880c6e5432324c02944725bf197c0e9acc1a97eb30a755569db8aba9
- Asset: C:\Users\henri\Downloads\threads\drillity-optimization-current-export\evidence\corrected\crawler-th.glb
- Asset SHA-256: 58175e8ae042856225b435f9476dca99d94a15048d609973b4cffe0c42ac721d
### sonic-truck

- Source: C:\Users\henri\Downloads\threads\drillity-optimization-current-export\corrected\blender\sonic_truck.py
- Source SHA-256: c6f076958e70c031527d17e9d65d0204727097f45e8c20c1adea07b5730adc5c
- Asset: C:\Users\henri\Downloads\threads\drillity-optimization-current-export\evidence\corrected\sonic-truck.glb
- Asset SHA-256: f9c5438581f43adbcdd04f8b04ee579c3c4353e45c6f60e289226d6407cc6763
### tunnel-jumbo

- Source: C:\Users\henri\Downloads\threads\drillity-optimization-current-export\corrected\blender\tunnel_jumbo.py
- Source SHA-256: 4f5aa23317d8fbafde1b1f5af9646881a8dc22533ceefe4d682659ae4d84b867
- Asset: C:\Users\henri\Downloads\threads\drillity-optimization-current-export\evidence\corrected\tunnel-jumbo.glb
- Asset SHA-256: 4059aaa715b389aa641b5a75256dece9ee48ab342e50b9de7484a9beaf1f6094

## Reproduction and evidence

From this private workspace: node prepare.mjs (fresh empty output workspace only), node build.mjs, node verify.mjs, node verify-runtime.mjs, node report.mjs. The retained corrected standalone fixture must be moved to a new isolated directory before replay; the empty-output assertion intentionally refuses stale assets. All scripts are private and do not write the original.

Raw files: source-manifest.json; build-status.json; verification.json; runtime-verification.json; evidence/{before,optimized,corrected}/*.glb and *.log; snapshot/.rig-optimization and snapshot/.rig-corrections preserve both reviewed deliveries. Entire GLB hashes identify retained outputs; identical source does not imply identical exporter bytes because measured UV rounding already exists.
