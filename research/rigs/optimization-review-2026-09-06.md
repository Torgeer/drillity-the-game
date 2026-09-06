# Rig optimization adversarial review — 2026-09-06

Independent review of `blender/bolter.py`, `crawler_th.py`, `sonic_truck.py`
and `tunnel_jumbo.py` in the private `drillity-rig-optimization` worktree.
Read the complete ASTRA handover, its current progress checkpoint, the existing
optimization checkpoint, relevant historical critiques and current source diffs.
The reviewer owns only this report and `tools/rigopt_contracts.mjs`; no machine,
shared library, runtime or integration-checkout edits were made by the reviewer.

The final batch passes the bounded CPU contract and geometry review below.
This does not certify the pre-existing machines as physically correct in every
detail or establish AAA quality. There is no GPU, warm FPS or rendered draw-call
measurement in this review. Primitive counts are exported geometry counts.

## Final exported evidence

Fresh unchanged-source exports precede the edits. Evidence is under
`.rig-optimization/{bolter,crawler,sonic,tunnel}/before.glb` and `after.glb`.
Bounds come only from `tools/glbinfo.mjs`'s exported `measure()` function,
which transforms actual vertices. No second dimension ruler was introduced.

| Rig | Primitives before → after | Triangles before → after | Bytes before → after | Protected nodes |
| --- | ---: | ---: | ---: | ---: |
| Bolter | 47 → 47 | 39,708 → 36,956 | 2,450,896 → 2,323,080 | 45 |
| Crawler TH | 55 → 55 | 41,028 → 37,268 | 2,468,072 → 2,300,500 | 31 |
| Sonic truck | 33 → 33 | 20,436 → 19,308 | 1,230,900 → 1,180,604 | 21 |
| Tunnel jumbo | 53 → 53 | 28,680 → 24,280 | 1,528,376 → 1,335,616 | 53 |

Total savings: **12,040 triangles and 538,444 bytes**. All four raw overall
vertex bounds match exactly, as do all 150 protected node local/world matrices,
ancestry and extras. Material definitions and material membership within every
moving/static assembly match. Source diffs retain the sourced dimension
constants and material choices; changes are selective tessellation and removal
of the tunnel module's obsolete local-AABB reporting function.

The maximum protected-node subtree-bound changes are:

| Rig | Maximum change | Accepted comparison tolerance |
| --- | ---: | ---: |
| Bolter | 0 mm | 1 mm |
| Crawler TH | 0.029449 mm | 1 mm |
| Sonic truck | 0 mm | 1 mm |
| Tunnel jumbo | 1.679346 mm | 2 mm |

These are protected assembly bounds, not every individual material mesh bound.
For example, crawler `static:rubber` changes by 3.181353 mm as circular profiles
lose samples. The tunnel maximum is isolated by the same ruler to the carriage
rubber's max z; carriage chrome and painted-dark bounds remain exact. The 2 mm
allowance is a declared rendering trade for those sampled hose surfaces, never
an attachment-position or sourced-dimension allowance. Per-machine reports
record component attribution and narrower material-subtree measurements.

Neither before nor after contains any animation clip or channel for these four
rigs. This preserves the existing node contracts used by runtime animation;
it does not demonstrate baked animation playback or full runtime articulation.

## Findings caught and resolved during review

1. **Hose-profile descriptions were wrong.** Fresh evaluated Blender meshes
   show bevel resolution 2 → 1 gives eight → six circumference vertices here,
   not twelve → eight. The implementers corrected their comments to match
   measured mesh topology; source `sides` arguments are not literal counts.
2. **The initial sonic trial changed protected bounds too much.** The gate
   exposed a 4.266 mm mast-subtree change and 1.660 mm carriage change. Thick
   bundles/head loops retain their original profiles in the accepted export.
3. **An early bolter "overall exact" statement was false.** The reviewer
   incorrectly inferred exactness from absence of a greater-than-1-mm failure.
   The coordinator's strict raw-bound equality assertion exposed a 0.585289 mm
   overall z maximum change. The checker now reports `overallBoundsDelta`
   separately. Injection and drifter profiles were restored, then the export
   and all three after renders regenerated. Final overall and protected subtree
   deltas are both zero. The earlier 36,596-triangle trial is superseded by the
   36,956-triangle final export in the table.
4. **Two gate false passes were independently reproduced and fixed.** Child
   reviewer `/root/adversarial/checker_review` found malformed/out-of-range
   index data could pass POSITION-only measurement, and an unprefixed animated
   target could be reparented with a compensating rest transform while changing
   playback. The checker now validates index storage/schema/range plus other
   vertex-attribute storage/counts, and protects every animated target's ancestry
   and local/world matrices. The child reran both reproductions and confirmed
   rejection; equivalent reordered/interleaved accessor data still passes.

## CPU visual review

The reviewer opened all 26 final before/after PNGs: bolter whole/feed/deck;
crawler hero/tracks/feed/hoses; sonic whole/head/hoses; tunnel hero/feeds/rear.
The revised bolter's three final after PNGs were re-opened after its last export.
The renders import actual GLBs and use fixed CPU cameras/material stand-ins;
the dedicated render helpers document seed, lighting, samples and resolution.

No new component loss, broken hose route or silhouette regression was observed
in these views. Narrow chamfered tunnel rails show visibly sharper/brighter
highlights. Bolter plate edges and crawler/sonic hose profiles show small shading
changes. Those are visible tessellation effects, not pixel-identity claims.
The reviewed geometry trade is acceptable within this optimization's scope.
The stand-in materials do not reproduce the game's procedural material system,
and these fixed views do not cover every angle, pose or runtime animation.

## Gate and reproducibility

`node tools/rigopt_contracts.mjs --self-test` passes **25** meaningful positive
and injected-defect cases: missing/moved/reparented nodes, metadata/material
changes, nonzero transmission, animation targets/samples/interpolation, missing
geometry, unreadable buffers, invalid indices/attributes, bounds changes and
equivalent node/accessor reordering and interleaved animation storage.

`node tools/rigopt_verify.mjs` passes for all four final exports and verifies
private `public/models` copies by SHA-256. Besides the contract comparison, it
requires exact overall-bound/transform equality, unchanged primitive totals,
and real triangle/byte savings. `git diff --check` passes on the reviewer's
owned paths. A generic contract check can be run directly, for example:

```text
node tools/rigopt_contracts.mjs .rig-optimization/tunnel/before.glb .rig-optimization/tunnel/after.glb --bounds-tolerance=0.002
```

The generic gate is deliberately stricter than a permissive glTF loader:
unsupported sparse animation/attribute accessors, unmeasurable/compressed
geometry, unnamed/duplicate nodes or materials, and empty contract/geometry
sets reject rather than produce a partial pass. It is a before/after rig gate,
not a complete glTF conformance validator or a visual-quality oracle.

## Remaining limitations

The old severe draw-call findings mixed surface-band and rig-specific counts
and are not a fresh basis for claiming a GPU improvement. No browser was opened,
no GPU lease acquired, and no escalation or approval prompt requested by this
reviewer or its child. Checker child completed its bounded review successfully.

The crawler agent reproduced the pre-existing feed-lens world-transform change
inside `weld()` (maximum matrix element difference 0.666167); optimization leaves
it unchanged, as explicitly directed by the coordinator. Node contracts alone
cannot detect a mesh that was already misplaced before the comparison. Other
pre-existing runtime/content observations remain in the individual machine
reports and were not disguised as fixes in this batch.
