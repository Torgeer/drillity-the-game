# Steel response visual review — 8 September 2026

The corrected four-case capture supports the narrow steel response correction.
The most visible benefit is reduced flare obscuring the Nordic hero mast.
No added loss of the main underground rig silhouette was apparent in the native
pairs. Some dark material regions get darker while other steel surfaces get
brighter; this is a finish correction, not a global brightness reduction.
Independent critic and root image review remain the integration decision.

## Authoritative artifacts

`evidence/graphics/steel-02/report.json`: four cases, four captures each,
source unchanged, no page/HTTP/request errors. All cases use real generated
contracts and supported default equipment fitted before simulation start:
DTH `bit-dth-3-econ`, longhole `bit-lh-t51-89`, oil `bit-oil-tri-8-econ`.

`validatesteel-source.mjs` beside the report is the exact capture harness.
SHA-256: `bb5f3a5408a25c1382f4c56000a5bd95ea467e4b59effce2b3ebf2d157d59be1`.
Production assets SHA-256:
`284427023106420a4b29fbbcc239204ec222d01bab43140a3d226195fa471a95`.
The report records every source, asset, served-root identity and frame state.

`rois.json` names 26 exact native-image rectangles selected after viewing the
images. `steel-pixel-analysis.json` records their baseline/candidate/repeat
metrics and input hashes. Rectangles include background and occluders; none is
presented as a segmented material mask. Compare the native PNGs first.

Reproduce the captured cases, with root's serialized GPU grant, from this tree:

```text
node tools/validatesteel.mjs --out evidence/graphics/steel-new
```

Analyse a report with the bundled Python that supplies NumPy/Pillow:

```powershell
& 'C:/Users/henri/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' tools/analysesteelimages.py evidence/graphics/steel-02 --rois evidence/graphics/steel-02/rois.json
```

The analysis intentionally refuses to overwrite its output. Existing results
are retained; use a separate evidence copy/path when reproducing analysis.

## Comparison controls and interpretation

Each case is A/B/A/B in one loaded scene: baseline factors, unchanged candidate
source factors, baseline repeat, candidate repeat. Only the rawSteel, wornSteel
and chrome base roughness/metalness values change. The approved paint, Sahara
haze and orbit-framing dependencies remain fixed. All map identities, colours,
other material properties, simulation state, geometry, camera matrices,
lighting, clock, site and visibility/focus checks are recorded and compared.

The corrected selector uses both asset material metadata and imported meshes'
authoritative `siteKinds`. Each case proves its imported rawSteel clone changes
from 0.36/1 to 1/1. Explicit procedural-site roughness/metalness overrides remain
fixed. The earlier `steel-01` missed imported site clones; its exact old harness
and scope limitation remain beside that report. Do not use it as shared-site
acceptance. Orbit azimuths differ between the two runs, so do not compare pixels
across runs. Cameras stay identical within every four-image set.

| Observed region | Baseline → candidate mean linear luminance | Interpretation |
| --- | --- | --- |
| Nordic hero upper mast | 0.26692 → 0.30326 | Local flare is replaced by a more continuous visible steel face; not blanket darkening. |
| Nordic hero lower carriage | 0.12084 → 0.11542 | Darker finish/separation; pixels below RGB32 rise 1,049 → 2,365. Review this local change explicitly. |
| Nordic orbit radiator grille | 0.21835 → 0.25529 | Grille becomes brighter and its pattern remains visible. |
| Longhole body/cab rectangle | 0.04139 → 0.04227 | Mean nearly stable, but dark pixels rise 5,336 → 6,060; mean alone is not a silhouette test. |
| Oil platform | 0.21905 → 0.21792 | Small visible response change. |

The maximum repeat mean absolute RGB difference in the chosen rectangles is
0.045/255, in the Nordic orbit grille. Hero, longhole and oil repeats have zero
difference in every measured rectangle. Major mast/grille differences are well
above repeat noise. Small control differences can include postprocessing spread
from nearby changed surfaces, and some are below repeat noise.

Whole-render dispatch totals, unchanged across each A/B/A/B set:

| Case | All renderBufferDirect dispatches | Rig-owned dispatches |
| --- | ---: | ---: |
| Nordic hero | 277 | 147 |
| Nordic orbit | 279 | 147 |
| Longhole orbit | 195 | 108 |
| Oil orbit | 174 | 51 |

These include AO normal and shadow depth passes. They are dispatch counts, not
a standalone ≤70 rig budget, GPU timing or phone certification. No frame-time
conclusion is made; root CPU verification overlapped these still captures.

## Limits and remaining work

Every case logs an unpaid QA preview, so completion/payment is not exercised.
Oil also logs a missing `FLUSH_MEDIUM` row and wrong AIR collar plume. Those
warnings are preserved and prevent oil gameplay/VFX acceptance claims; the
fixed scene still supports the scalar-only material comparison.

Pale imported cab glass, strong wet-rock glare underground, ochre terrain/fog,
and foreground prop occlusion remain. Glass, paint clearcoat, carbide and those
other material/lighting systems were unchanged. Default fresh chrome is present,
but a separately rendered fully worn chrome state was not captured; its changed
roughness behavior currently has CPU evidence only.

The browser and Vite server closed in `finally`; port 5231 has no listener. The
lease was released to idle immediately after capture. No production files in
the root integration tree, commits or pushes were changed by this task.
