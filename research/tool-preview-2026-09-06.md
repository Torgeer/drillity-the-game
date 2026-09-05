# Preview coverage and lifecycle — 2026-09-06

Scope: `src/core/preview.js`, dedicated preview tests and this research only. No rig factory, GLB runtime, geometry, catalogue data or shop-screen changes. Measurements use this private worktree's synchronized snapshot; parent integration must rerun against its combined geometry/runtime.

## Implementation

Still previews fit every visible transformed POSITION vertex (including instances) against four perspective camera planes, with an authored 6% margin on each edge. Depth is included in the constraint, so a near tip cannot cross the frustum just because its screen-space extent is small. Near/far planes derive from subject depth and the backdrop remains inside the camera far plane. Builder aim and roll remain honored.

Live previews use the exact analytic envelope of all yaw angles and the existing ±0.12-radian pitch range. The fixed camera is computed once on attachment/source replacement; regular 30Hz updates do not scan geometry or pump camera zoom. Square renders are contained in rectangular destinations. The margin and pitch are presentation choices, not sourced physical dimensions.

Thumbnail and live objects now have separate pivots and cameras. A thumbnail releases its owned group immediately after synchronous pixel capture; later bitmap completion cannot dispose a live group or shared material. Generation tracking rejects work from disposed/reinitialized studios. Cached source replacement, GLB-only routes and owned tool/rig disposers are retained. Cache identity includes yaw and builder parameters. PMREM render targets and repeated supply materials release once.

## CPU validation

- Full catalogue: **1,457 variants; 134,585 rendered/projected frames; 1,125,806,679 vertex checks; zero crops.** Covers all 270 accepted tools.js ids and all 260 data entries (479 distinct tool/item requests) at wear 0, 0.5 and 1, plus all 19 actual runtime-loaded GLB rig shapes and a supply fallback.
- Square 256×256, landscape 320×180 and portrait 180×320 destination canvases. Ordinary catalogue live samples cover one yaw revolution; representatives and all rigs cover five, the full wobble period.
- Final hardened representative rerun: 98 variants, 35,378 fresh frames, 658,599,014 vertex checks; zero failures. Additional assertions require exactly one visible subject, a new render and blit per sample, minimum 0.80 NDC edge fill and >1.5× representative projected bounding-area gain.
- Full report minimum thumbnail edge fill: 0.8799999999999992; minimum wear-zero projected bounding-area gain: 2.8498×. Worst sampled live edge: 0.8799993527. These are geometric quantities, not FPS.
- Public-API adversarial fixtures: 1,813 poses / 130,152 actual vertex projections. Nested rotations/translations/nonuniform scales, instancing, invisible extreme geometry, authored view, vertical/invalid aim metadata, fixed live camera and depth planes pass.
- Lifecycle: 19 cases pass, including pending bitmap rejection/disposal, concurrent/repeated initialization, shared materials, live-thumbnail interleaving, source replacement, GLB-only rigs, missing-source recovery and canvas fallback.
- Existing rig loader: 39 assertions pass. Existing resolver hints: 15/15 pass. Syntax and scoped diff-whitespace checks pass.

## Coverage measured from CPU triangle silhouettes

128×128 triangle-union masks projected through the actual preview camera. This reports geometry coverage, without shading, alpha textures, antialiasing or GPU readback. Baseline reproduces the previous sphere ×1.9 formula at the same authored roll/yaw. The full report is `tool-preview-catalogue.json`.

| Preview | Previous | Current |
|---|---:|---:|
| button-bit | 6.08% | 50.81% |
| dth-bit | 5.94% | 32.56% |
| drill-rod | 0.27% | 1.01% |
| core-barrel | 1.23% | 5.32% |
| tube-pile | 1.42% | 7.95% |
| bop-stack | 4.44% | 19.45% |
| pd55 | 2.03% | 6.85% |
| oil-derrick | 2.42% | 8.68% |
| rc-rig | 2.54% | 20.21% |

## Reproduction

`node tools/checkpreviewcatalogue.mjs --write research/tool-preview-catalogue.json`

`node tools/checkpreviewcatalogue.mjs --quick`

`node tools/checkpreviewframing.mjs`

`node tools/checkpreviewlifecycle.mjs`

`node tools/checkrigloader.mjs` and `node tools/hints.mjs`.

Headed GPU evidence runner: `node tools/checkpreviewgpu.mjs`. The final run passed all 29 previews (10 representative tools and all 19 actual runtime-loaded GLBs), with zero silhouette edge pixels, zero lost contexts and zero browser errors/warnings. It uses port 5195, a task-local Vite cache, muted Chrome, actual materials/GLB sources and a same-pose previous-frame baseline. It refuses to launch without its external GPU lease. Occupancy is an opaque, double-sided GPU silhouette; the shaded PNG comparison sheets were visually inspected. This is a private-snapshot rendering result, not a GPU/FPS/mobile performance verdict or validation of the newer parent runtime. Browser/server close were awaited, port 5195 independently returned ECONNREFUSED, and the lease was released.

## Isolated CPU setup timings

A later instrumented benchmark executes the exact old and candidate frame-function bodies, excluding builder, renderer and bitmap copy. Eight warm-up rounds and 48 measured samples per mode use rotated mode order. All 19 actual rig groups and representative tools are measured; raw samples, source hashes and instrumentation are in `tool-preview-cpu-cost-before.json` and `tool-preview-cpu-cost.json`. This is Node 22.16.0 on a shared AMD Ryzen 7 7435HS desktop, not GPU/mobile FPS.

The first exact sweep recomputed radial length for each fit plane. Sharing that calculation and using direct static camera-axis constraints reduced rig median-of-item-median setup time from 9.953 to 4.815 ms for stills and 31.497 to 7.516 ms for live attachment. PD55 live setup fell from 63.026 to 14.250 ms; RC live setup from 61.464 to 15.616 ms. Worst observed final rig p95 was 12.106 ms static and 21.401 ms live. Final tool medians across items were 0.216 ms static and 0.417 ms live.

Accurate fitting remains more expensive than the original loose bounds: original rig median-of-item medians were 0.097 ms static and 0.094 ms live. This cost is paid once per uncached thumbnail/attachment/source replacement; ordinary live updates do not scan vertices. No FPS or mobile-budget pass is claimed.

## Remaining limits

The vertex scan adds work at thumbnail creation/live attachment. No meaningful comparative whole-frame or mobile performance measurement has been made. Full live sweeps are CPU geometric evidence; future model/runtime integration needs its own rerun. The analytic sweep proof is documented separately in `tool-preview-framing-analysis.md` (its original exploratory table explicitly used 0.90; production tests use 0.88).

Existing catalogue identity gap observed but left outside scope: bit-th-t45-76-std and bit-th-t45-89-hd contain 76/89 only in their name/id, with no diameterMm/holeDia/stats.diameterMm field. They currently build identical default geometry. String-only alias calls can also pass undefined builder parameters over alias defaults. This framing work does not claim dimensional fidelity for every listing and does not change tool geometry or data to mask that gap.

## Final headed GPU evidence and provenance

Capture completed `2026-09-05T23:33:47.912Z`. Full JSON and PNGs are in the private worktree `shots/tool-preview/`; `tools-comparison.png` and `rigs-comparison.png` show previous/current shading. Sources and model binaries were hashed before capture and verified unchanged afterward. No production source changed after the completed CPU suite.

The harness initially exposed its own instrumentation issue: Three r169 installs render on each instance, which shadowed the prototype override. The harness now wraps the real instance method. A duplicate Three import warning was removed by importing the exact Vite-resolved URL used by the runtime. The final rerun is clean. Neither required a production framing change.

| Preview | Previous GPU silhouette | Current GPU silhouette | Edge pixels |
|---|---:|---:|---:|
| button-bit | 6.03% | 50.68% | 0 |
| dth-bit | 5.84% | 32.41% | 0 |
| core-bit | 5.38% | 56.48% | 0 |
| tricone-bit | 5.36% | 31.06% | 0 |
| drill-rod | 0.26% | 0.99% | 0 |
| core-barrel | 1.13% | 5.12% | 0 |
| tube-pile | 1.35% | 7.79% | 0 |
| cfa-flight | 2.62% | 7.96% | 0 |
| bop-stack | 4.38% | 19.30% | 0 |
| compressor-skid | 7.46% | 36.08% | 0 |
| crawler-lite | 3.47% | 21.13% | 0 |
| cable-percussion | 1.67% | 6.66% | 0 |
| crawler-th | 3.62% | 17.89% | 0 |
| dth-crawler | 3.51% | 15.85% | 0 |
| core-rig | 2.25% | 8.31% | 0 |
| foundation-bg | 2.60% | 8.10% | 0 |
| cfa-rig | 2.13% | 6.73% | 0 |
| oil-derrick | 2.10% | 7.66% | 0 |
| hdd-rig | 3.23% | 13.74% | 0 |
| sonic-truck | 3.75% | 18.62% | 0 |
| rc-rig | 2.47% | 19.66% | 0 |
| tunnel-jumbo | 1.01% | 3.57% | 0 |
| longhole-rig | 3.04% | 15.46% | 0 |
| bolter | 2.07% | 8.87% | 0 |
| piling-leader | 2.34% | 7.69% | 0 |
| pd55 | 2.07% | 6.53% | 0 |
| si-rig | 3.81% | 20.29% | 0 |
| cpt-unit | 5.59% | 29.79% | 0 |
| raisebore | 3.12% | 19.95% | 0 |

Exact private source SHA-256 values (the newer parent checkout is outside this rendering claim):

| Source | Bytes | SHA-256 |
|---|---:|---|
| `src/core/preview.js` | 52714 | `88830a872cc45afb42172e03c6dac5ea98159ff30135be8a31027dfefd0759f5` |
| `src/core/assets.js` | 269729 | `e48553e9a9f5333fe58dcf3786b247f071fdd222615638dd136499ed99a83ed3` |
| `src/core/contract.js` | 29794 | `a374211146b86c5dbc5ea88eb28a49e0505805fa486d585a1531e810414549b5` |
| `src/core/gltfRig.js` | 39216 | `a00d3e40c09d8995da588c6ac71da6e2358628bc84e381ee810f4539a4809507` |
| `src/rig/rigFactory.js` | 482006 | `c4c7c5f42263a761a6e07308f199f51e48d7cbd619e4e2f4736b9974932ed53b` |
| `src/rig/tools.js` | 562260 | `76de61d7688fa3043063898e3f2bc52bf4f21f0d96b88484b1af6395fd8788c2` |
| `src/game/data.js` | 470057 | `4246f300db1cac529d570eb7a0ea71cfb295481c19f716511a4bf7aa2a557eb0` |
| `tools/checkpreviewgpu.mjs` | 12364 | `ca9fa3cb0a54e76b0dcfe008dc64bc75a0a1869b0536a217aea668343711cde0` |

Exact private GLB SHA-256 values:

| Model | Bytes | SHA-256 |
|---|---:|---|
| `public/models/bolter.glb` | 2450896 | `fb44cd24f3fc326a5ddddc6671a51a117d86d3e7fbefcfd0939fcb7edbdef1c9` |
| `public/models/cable-percussion.glb` | 1010480 | `b476bfe75e4fe3910ceacf97474350e5f41c0368da8daeba2b7e3d2c9616ed31` |
| `public/models/cfa-rig.glb` | 4512560 | `9495be989cce5d8a43046eb6e23f057eea1d520aa4e63856c7957bf41cecbed0` |
| `public/models/core-rig.glb` | 1385696 | `51c6265862e2bad64eefd371e408bc427b597e5f0463cce6387d1e53d1b95c80` |
| `public/models/cpt-unit.glb` | 1895224 | `00cbba715625f396bca5468af6aa0cf537812d5e9606143c971e2d77305cbd2d` |
| `public/models/crawler-lite.glb` | 2542556 | `12e7b566dd341b50f065e7f8f18ede62efd944850f26caef9c354534508b52b0` |
| `public/models/crawler-th.glb` | 2468072 | `dde8298578d9f4c2062f945dce5c5565d6d98328e919d5c7f2be193e697bbbdb` |
| `public/models/dth-crawler.glb` | 4115460 | `d89b8c122e0483499ecc0adcd9fc9933b0a7c9e4031981934ca6d161522c446b` |
| `public/models/foundation-bg.glb` | 4491784 | `3f8b53eed7a0db39be2f29e2dc9a0bd583f8d133edd08988e72c040e63809698` |
| `public/models/hdd-rig.glb` | 2813240 | `6a695e01a9271c1cbe63f80fc782f79f4b2006dff36651adecdc0ec5920ca6ad` |
| `public/models/longhole-rig.glb` | 1258628 | `893926e2938fe5cb471f4777ae987e8fe93e60247f9c8dfecb92ff563bcba49f` |
| `public/models/oil-derrick.glb` | 3297364 | `5772fa389ce3b87f42a8412a9b51f1eca0b03ef726e6397162fe80295141031a` |
| `public/models/pd55.glb` | 4780340 | `ca521d63a334fb03040b01277c83f332f565cfc1bbec43fe59a666af94c8bf59` |
| `public/models/piling-leader.glb` | 2013892 | `6f0f6776333c2e1738e06a40255beb0a3d2af65df72a53bdceb7a176d3476e3c` |
| `public/models/raisebore.glb` | 2334328 | `2ef46e975faf72438600073dd64debe19d2ac72d89e345d81d8255675916bde1` |
| `public/models/rc-rig.glb` | 4706976 | `5deb197fc02418454f740c0cbcb61b5ec8788e1137239be4875a4f4e6c718bc0` |
| `public/models/si-rig.glb` | 1519272 | `9b3b47fac6a7f83cd53f64433743c9a6837213b98670cfe612e837c8fa2bf0cb` |
| `public/models/sonic-truck.glb` | 1230900 | `3a7ea3dfb6bff6b3afd13a6dc54dbedd18c07264a30176f8ab68a91af7da7638` |
| `public/models/tunnel-jumbo.glb` | 1528376 | `92720d3eaf7fd1cc0185e3ef35f85cf46b4ba5e13499453d378326d7a9e9b320` |

## Parent integration verification

The original integration checkout passed framing 1,813 poses / 130,152 vertex
projections and all 19 lifecycle cases after applying the final source patch.
The hardened quick catalogue then passed 98 rows, all 19 current metadata-updated
GLBs, 35,378 projected frames and 658,593,238 actual vertex checks with zero crops.
Root visually reviewed both final private shaded contact sheets. The private
29-case GPU report remains evidence for its recorded snapshot; this CPU
integration pass does not claim fresh combined-game GPU performance.
