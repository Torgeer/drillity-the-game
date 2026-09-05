# Current GLB tool and attachment audit — 2026-09-06

The current fleet does **not** reproduce the broad claim in
[`CRITIQUE.md` §3](CRITIQUE.md#3-eight-of-nineteen-machines-draw-no-drill-string-and-no-bit-a--and-two-of-them-cannot-hold-a-tool-at-all).
All 19 shipped models have `mount:tool`. All 22 requested surface-tool and
36 requested downhole-tool combinations produce scene-visible geometry.
The eight absent `dyn.mastLower` fields remain, but that field neither gates
downhole-tool construction nor proves that an authored GLB contains no rod.

One confirmed tool-selection defect has been fixed: the GLB CPT used an SPT
split spoon because its piezocone override lived only in the procedural
builder. The existing override now applies in the shared `ensureBuild()`
path. Both actual builders produce `cpt-piezocone`, with six scene-visible
meshes and 1,576 triangles in the downhole attachment. No tooling dimensions
or physical model geometry were changed.

## Instrument and reproducibility

[`tools/auditrigattachments.mjs`](../tools/auditrigattachments.mjs) loads all
19 actual GLBs through `createGltfRigs` in strict mode, then builds all 42
declared rig/method pairs through the actual `createRigSystem`. It observes
the real builder, actual procedural tool builders, public `getTooling()`,
and Three scene graphs. No mocked loader or procedural fallback is accepted.

```text
node tools/auditrigattachments.mjs --json .hudqa/rig-attachments-current.json
node tools/auditrigattachments.mjs --tool-selection-only
node tools/auditrigattachments.mjs --rig cpt-unit --tool-selection-only
node tools/checkrigmetadata.mjs
```

The complete audit reports 33 pairs with a missing generated contribution or
an attachment-coordinate discrepancy and deliberately exits 1. **That is a
diagnostic count, not 33 established cases of visually missing drill steel.**
The tool-selection gate passes all 42 pairs; the dedicated CPT command was
red before the override correction and green afterward. The metadata gate
passes 80/80 checks.

Depths 0, 1.5, 2.999 and 3.001 m, hole radius, section placement and controls
are synthetic **NOT SOURCED test inputs**, not physical rig dimensions. HDD
and raise-boring also run stages 0 and 1. Three updates with explicit world
matrix refresh separate a real discrepancy from a stale-frame artifact.
Scene-visible means visible parent chain, visible nonzero-opacity material,
nonempty geometry and finite, nondegenerate world matrix. It does not mean
unoccluded rendered pixels; this audit uses no browser or GPU.

The only distances below are differences between explicit attachment
coordinates. This introduces no alternative dimension ruler;
`tools/glbinfo.mjs` remains the sole CLI machine-dimension instrument.
The JSON records all source and model SHA256 values and rejects a run if
source changes during measurement. The post-CPT-fix snapshot uses loader
SHA256 `8cd96758ed88e7f00a60c00823097bcb899683e052ea79f60175c79d783257b0`
and rigFactory SHA256
`32659c78ffe5229dcd9a839771ac8dc65d1ac3abb4803a2fc3adacd81738a0a7`.

## Fleet coverage

“Generated strings” counts method pairs whose current tooling specification
requests the runtime's generic cylinder, and how many actually receive it.
“Collar gap” is the largest distance between that cylinder's lower endpoint
and the public `rig.collar` point over the sampled states. A dash means no
generated string exists, not that the GLB has no drill string.

| GLB | Pairs | Generated strings present / requested | Collar gap m | Authoring owner |
|---|---:|---:|---:|---|
| crawler-lite | 5 | 5 / 5 | 0.512012 | `blender/crawler_lite.py` |
| cable-percussion | 1 | 0 / 0 | — | `blender/cable_percussion.py` |
| crawler-th | 4 | 0 / 4 | — | `blender/crawler_th.py` |
| dth-crawler | 2 | 2 / 2 | 2.346562 | `blender/dth_crawler.py` |
| core-rig | 3 | 3 / 3 | 1.348787 | `blender/core_rig.py` |
| foundation-bg | 3 | 0 / 0 | — | `blender/foundation_bg.py` |
| cfa-rig | 4 | 1 / 1 | 1.523154 | `blender/cfa_rig.py` |
| oil-derrick | 1 | 1 / 1 | 8.534400 | `blender/oil_derrick.py` |
| hdd-rig | 1 | 0 / 1 | — | `blender/hdd_rig.py` |
| sonic-truck | 2 | 2 / 2 | 2.319122 | `blender/sonic_truck.py` |
| rc-rig | 2 | 2 / 2 | 1.395206 | `blender/rc_rig.py` |
| tunnel-jumbo | 2 | 0 / 2 | — | `blender/tunnel_jumbo.py` |
| longhole-rig | 2 | 2 / 2 | 1.830956 | `blender/longhole_rig.py` |
| bolter | 2 | 2 / 2 | 2.126000 | `blender/bolter.py` |
| piling-leader | 1 | 0 / 0 | — | `blender/piling_leader.py` |
| pd55 | 2 | 0 / 1 | — | `blender/pd55.py` |
| si-rig | 3 | 3 / 3 | 0.304631 | `blender/si_rig.py` |
| cpt-unit | 1 | 0 / 1 | — | `blender/cpt_unit.py` |
| raisebore | 1 | 0 / 1 | — | `blender/raisebore.py` |

All rows have their tool anchor, finite rig transforms, and the surface and
downhole tools requested by the live selection table. CFA and foundation
combinations which request no separate tool are not called missing.

## Missing generated contribution versus authored drill steel

`gltfRig.makeDyn()` maps `mastLower` only from `pivot:mast-upper` or
`pivot:mast`. Consequently `applyTooling()` does not create its generic string
for crawler-th, HDD, tunnel-jumbo, pd55/DTH, CPT, or raisebore: ten pairs over
six rigs. Cable-tool and driven-pile declare zero string diameter and are
deliberate exemptions. These are runtime mapping facts, not name-based
geometry classification.

The authored counterpart must be considered before adding more cylinders:

* `crawler_th.py` constructs `rod_in_string` in the carriage at line 1076.
  Its spindle itself carries no authored mesh; treating an empty spindle as
  proof of an empty carriage would be another false positive.
* `hdd_rig.py` constructs `slide:string` and a separate string-entry segment
  at lines 1222–1264. The actual imported `slide:string` has two visible
  meshes and 88 triangles before runtime injection.
* `tunnel_jumbo.py` constructs the hex rod, button bit and buttons beneath
  each spindle at lines 858–884. Both imported spindle subtrees contain one
  visible mesh and 244 triangles before injection. A generic vertical string
  would not establish the correct face-drilling chain.
* `cpt_unit.py` constructs a fixed `rod_in_hole` at line 716. Its lack of a
  named mesh subtree does not erase that rod from merged static geometry.
* `raisebore.py` constructs `string-top-joint` below the spindle at line 1074.
  The actual spindle subtree has three visible meshes and 544 triangles.
* `pd55.py` constructs the hammer/sledge attachment and `mount:tool` at
  lines 1172–1225; the spindle has no authored meshes. DTH mode needs a
  dedicated attachment-chain review before deciding which authored assembly
  or runtime tool should supply the drill steel.

Those source and subtree observations rebut the old blanket “no string and
no bit” claim. They do not establish a complete, animated chain from every
head to every method's entry point. The static join deliberately merges
individual primitive names, so neither material names nor empty attachment
nodes can identify all physical parts by themselves.

## Reproduced endpoint discrepancies

The generic string constructor makes a unit Y cylinder translated +0.5Y.
`updateString()` converts `mount:tool` to `dyn.mastLower` local coordinates,
sets the string bottom to local Y=0, and clamps its length to at least 0.05.
The public collar is calculated separately from the mast-pivot world X/Z
and ground Y=0. Those are different contracts for the same generated chain.

All 23 pairs that receive a generic string have a lower-end/public-collar
discrepancy in the table above. At synthetic depth 2.999, four rigs also
have an upper-end/tool-anchor discrepancy:

| Rig | Affected method pairs | Generated string misses tool anchor by m |
|---|---:|---:|
| dth-crawler | 2 | 1.744092 |
| core-rig | 3 | 0.833833 |
| sonic-truck | 2 | 1.225569 |
| bolter | 2 | 0.575183 |

These distances reproduce the local-Y clamp and competing-origin behavior.
They do not authorize moving an angled/horizontal machine's real entry
point to a universal vertical ground collar. The next alignment change must
first establish which authored joint, rod and entry point a method uses,
and whether the string belongs in the surface or section scene at that feed
position. Runtime owners are `gltfRig.makeDyn()`, `rigFactory.applyTooling()`,
`updateString()` and the public-anchor update; the authoring owners above
provide the chain and physical provenance. No alignment geometry was edited
as part of this audit.

### RC explicit-axis check: the authored endpoints already disagree

The RC model supplies both `mount:hole` and `aim:hole`, so its intended line
can be tested without a universal ground-plane assumption. The actual
runtime preserves hole position `[0, 0, 2.8499999]` and aim
`[0, -1, 2.8499999]`, but the live `mount:tool` is at Z=`3.6400001` at every
sampled RC and DTH feed position. Its perpendicular distance from that
explicitly authored hole line is **0.7900002 m**.

The source is traceable: `rc_rig.py` places the hole at `HOLE_Y` in
`build()`, while `build_head()` moves the head-swing forward by `hd + 0.30`
and then its spindle by another `0.16`. `build_mast()` also places the rod
guide in the mast plane. Those are existing authored placements, not new
physical measurements. Joining the generated string directly to the current
hole marker would therefore introduce a diagonal rod rather than resolve
the machine's axis. The authoring owner must reconcile the head, guide and
hole metadata with the source geometry before a runtime attachment fix is
selected. The harness now records `authoredHole` coordinates and
`toolToHoleAxisM` whenever both explicit nodes are present.

## Additional live behavior to resolve

For the actual CFA GLB, `augerDriven` and `kellyDriven` are both false, so all
four supported method selections use the generic `dyn.rodLen || 3` modulo
feed. In the synthetic sample, the declared 17 m carriage moves from
coordinate 3.005667 at depth 2.999 to 19.994333 at depth 3.001. This repeats
a complete carriage stroke across a 0.002 input change. Simply setting
`augerDriven` would expose another fixed fallback, `depth / 14`, rather than
consume the declared carriage span. The feed-mode adapter in
`rigFactory.update()` and its machine/method configuration own this issue;
[`blender/cfa_rig.py`](../blender/cfa_rig.py) owns the authored carriage and
spindle. A geometry extension must not be invented to conceal the runtime
mode mismatch. Capacity/source research is a separate dependency.

HDD and raise-boring keep their pilot tool IDs at both stage 0 and stage 1
in the real scene. `updateStagePass()` changes parked-reamer visibility and
pipe-rack counts; it does not switch the downhole tool. This is an observed
stage-selection limitation, not evidence of a missing pilot bit. The next
stage-tool correction must use the selected item/method's sourced tool
configuration, rather than substitute a guessed reamer size.

## Completed dependency during this audit

Commit `1cb148c` publishes the actual-vertex `glb.feedFraming` envelope for
authored carriage translations while preserving rest framing. It also
preserves the authored work rake and separates a GLB flex joint from its
deployment pivot. Before that correction, Bolter's mast rake was used as a
carriage-flex angle. The independent hero-camera gate now passes 2,904
checks across 342 cases: all 19 actual rigs, two phone layouts, declared
endpoints and actual `rig.update()` feed samples at loads 0 and 1. See
[`HERO_CAMERA_MEASUREMENTS.json`](HERO_CAMERA_MEASUREMENTS.json). No GPU was
used and no physical model was changed by the dependency.
