# Four-rig mesh optimization results — 2026-09-06

All four unchanged-source baselines were freshly exported before editing.
Only bolter, crawler-TH, sonic truck and tunnel jumbo source modules changed,
plus dedicated tools and these research notes. Core, DTH, RC, shared Blender
libraries, runtime code, source dimensions and material identities were not
edited. Measurements use actual exported GLBs and the sole `glbinfo` ruler.

| Rig | Primitives before/after | Triangles before → after | Triangle saving | Bytes before → after |
| --- | ---: | ---: | ---: | ---: |
| bolter | 47 / 47 | 39,708 → 36,956 | 6.93% | 2,450,896 → 2,323,080 |
| crawler-th | 55 / 55 | 41,028 → 37,268 | 9.16% | 2,468,072 → 2,300,500 |
| sonic-truck | 33 / 33 | 20,436 → 19,308 | 5.52% | 1,230,900 → 1,180,604 |
| tunnel-jumbo | 53 / 53 | 28,680 → 24,280 | 15.34% | 1,528,376 → 1,335,616 |
| Total | 188 / 188 | 129,852 → 117,812 | 9.27% | 7,678,244 → 7,139,800 |

The total saving is **12,040 triangles and 538,444 bytes (7.01%)**. Primitive
counts are not rendered draw calls. These changes reduce geometry and transfer
size; they have not been shown to improve FPS or meet a rendered rig budget.

## Validation

`node tools/rigopt_verify.mjs` passes against all four private before/after
exports and their public copies. It requires every raw overall-bound coordinate
to match exactly, zero attachment-transform and animation-sample deltas,
unchanged primitive counts, and reduced triangles/bytes. All 150 named
contract nodes preserve their ancestry, transforms, extras and assembly
material membership. All four before/after files have zero animation clips;
runtime-driven animations have not been played in this pass.

Protected contract-subtree bound differences are 0 for bolter/sonic,
0.029449 mm for crawler, and 1.679346 mm for tunnel. The last uses a reviewed
explicit 2 mm sampling tolerance; attachment transforms and overall bounds
still must match exactly. Internal material-mesh extrema can move more with
radial tessellation; see each machine note for that distinction.

The contract checker reuses `parseGLB` and `measure` from `tools/glbinfo.mjs`.
Its adversarial fixtures now pass 25 checks, including malformed geometry,
index buffers, relocated attachments, missing metadata/materials, altered
animation data, nonzero transmission, and harmless accessor reordering.
An independent reviewer found and corrected two false-pass paths during its
development. `node tools/checkmodels.mjs` passes for all 19 private rig exports.

Thirteen paired fixed-camera CPU views cover all four actual exported models.
The model agents and independent reviewer inspected the geometry, including
close hose/rail views. The visible trade is small profile/chamfer highlight
changes, with no newly missing components or routing/silhouette regression
observed in these views. They use material stand-ins, not runtime game textures.

## Per-machine evidence

- [Bolter measurements and corrected envelope finding](bolter-optimization-2026-09-06.md)
- [Crawler measurements and existing lamp defect](crawler-optimization-2026-09-06.md)
- [Sonic measurements and narrowed hose change](sonic-optimization-2026-09-06.md)
- [Tunnel measurements and bounded sampling change](tunnel-optimization-2026-09-06.md)
- [Independent adversarial review](optimization-review-2026-09-06.md)

Private `.rig-optimization/verification.json` records complete comparison
results and before/after SHA-256 values; subdirectories hold GLBs, profiles,
render pairs and logs. Public GLBs are ignored reproducible output.

## Integration and limits

No GPU lease was acquired and no browser session launched. The historical
surface-band counts do not establish current per-rig draw calls; tunnel's
separate historical rig figure also remains un-reproduced on GPU. A lease is
still needed for an isolated actual-GLB render capture and warm performance.

Git metadata resolves outside the active task's writable roots to the original
checkout's `.git/worktrees/drillity-rig-optimization`. Following the parent's
no-prompt instruction, no index/commit mutation or escalation was attempted.
The task returns an explicit session-only patch and path manifest from the
private worktree for parent integration. No push, merge or original-checkout
source edit was performed. Pre-existing synchronized changes remain untouched.

Existing issues are documented separately, not silently repaired here: crawler
feed-lamp lens reparenting changes its world matrix; sonic lamp wattage metadata
and content figures disagree with current consumers; tunnel's standalone
entry point still uses an underscored filename. Mesh savings do not settle those
runtime/content findings or the fleet's broader realism review.
