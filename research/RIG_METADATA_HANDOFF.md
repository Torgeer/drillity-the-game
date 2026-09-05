# Rig metadata checkpoint — 2026-09-06

Historical checkpoint. Continued implementation and verification are recorded
in `research/RIG_METADATA_VERIFICATION.md`; the red-test counts below describe
the earlier stopped state.

Stopped at the coordinator/user's request so this work can resume as sub-agents
inside the original conversation. This is an unfinished investigation and a
deliberately failing regression tool, not a completed loader fix.

Worktree: `C:\Users\henri\Downloads\threads\drillity-rig-metadata`.
Branch: `codex/rig-metadata`. Original coordinator task:
`01a07362-ebfb-7a10-8810-c00b57ea797d`.

## Preserved work and ownership

- New `tools/checkrigmetadata.mjs`: CPU-only public `createGltfRigs()` regression
  runner. Real Three objects pass through GLTFExporter and GLTFLoader using an
  in-memory fetch shim. All fixture geometry is synthetic **NOT SOURCED**.
- New `research/RIG_METADATA_HANDOFF.md`: this checkpoint.
- **No runtime or authoring files edited.** In particular `gltfRig.js`,
  `rigFactory.js`, `preview.js`, `renderer.js`, `geology.js`, `checkmodels.mjs`,
  `package.json`, and Blender machine modules remain unchanged by this task.
- `public/models/sites/quarry-bench.glb` was already untracked at the initial
  status inspection; it is a prepared private asset copy and was not changed.
- No browser, dev server, Blender process, GPU render or GPU measurement was
  started. No GPU slot was acquired; GPU is released. No dependency install,
  push or merge was performed.

Root read the whole ASTRA.md and research/CRITIQUE.md before implementation;
source/consumer and fixture agents received ASTRA section 1 verbatim. Relevant
loader, authoring, animation and consumer code was inspected read-only.

## Reproduced results

Root ran `node tools/glbinfo.mjs --parts public/models/rc-rig.glb
public/models/pd55.glb`. This existing tool transforms actual vertices:

| Model | Primitives | Actual authored-pose bounds W × H × L (m) | Y bounds (m) |
|---|---:|---|---|
| RC | 36 | 7.883 × 7.215 × 7.608 | −0.015…7.200 |
| pd55 | 66 | 4.700 × 25.790 × 9.405 | −0.090…25.700 |

These are exported geometry bounds, **not transport or datasheet dimensions**.
Source audit independently exercised real `createGltfRigs`/GLTFLoader on CPU:

| Model | Current runtime carriageRange | Authored absolute endpoints [high, low] | Runtime mastHeight |
|---|---|---|---:|
| RC | [6.590000095, 3.400000095] | [4.95, 1.76] | 9.798145134 |
| pd55 | [31.720000610, 17.860000610] | [17.86, 4] | 26.218448360 |

The range is already descending in current code. Do not repeat the stale audit's
direction fix. The remaining defect is placement: `rest + travel_m` ignores
declared endpoints and can put the head above its rails.

Source audit reused `glbinfo.mjs`'s existing measurement functions in memory for
an endpoint experiment (no second dimension ruler): RC current upper endpoint
raises actual whole-model max Y to 8.580 m versus 7.200 m at either declared
endpoint. pd55 current upper endpoint raises max Y to 34.100 m versus 25.700 m
at either declared endpoint. No unreadable primitives were reported.

An independent bug is confirmed by these measurements: loader
`new T.Box3().setFromObject(root)` uses rotated local bounding boxes. It repeats
the approximation explicitly rejected in ASTRA section 5. The fixture runner
also proves it with a sparse rotated triangle: runtime height 5.656854249 versus
analytical actual-vertex height 2.828427125.

## Endpoint metadata cannot be consumed uniformly yet

Audit counted paired travel_min_m/travel_max_m on **9/19 exported machines**,
not all 19 as the handover claims. Keep the metadata: RC/pd55 demonstrate real
information that a stroke length alone cannot reconstruct. Authoring coordinate
conventions must first be made explicit and consistent:

- `blender/rc_rig.py:975–999`: [1.76, 4.95] are absolute mast-parent coordinates.
- `blender/pd55.py:1136–1151`: [4, 17.86] are absolute parent coordinates.
- `blender/core_rig.py:689–694`: [-1.2, 2.3] explicitly subtract `car_z` and are
  rest-relative offsets. Export rest Y ≈1.03499985 implies parent endpoints
  ≈[-0.165, 3.335].
- `blender/raisebore.py:934–937`: [0, 1.71] are offsets from DRIVE_LO=1.47;
  parent endpoints are [1.47, 3.18].
- `blender/cfa_rig.py:1206,1232–1233`: [3.6, 20.6] are authored world coordinates
  despite the comment calling them mast coordinates. `attach()` at line 252
  preserves world position; pivot Z=.60 makes parent endpoints [3.0, 20.0].
- `blender/hdd_rig.py:1130–1131`: endpoints describe Blender Y, exported along
  glTF −Z. `rigFactory.setCarriage()` drives local Y and also overwrites Z for
  flex. Merely consuming endpoints does not repair this axis mismatch.

`blender/lib/anim.py:300–326` already reads min/max as absolute local Blender Z
and tests rest[2]+metres. It lacks pair/order/finiteness/span validation and
its negative-travel check compares abs(metres) against signed travel_m. This
is a separate owner coordination issue, not changed here.

## Scenery classification is lost before runtime

Source audit checked all 20 GLB JSON chunks and found no exported scenery
classification. `blender/lib/rig.py:309–325` merges statics solely by material.
RC's sample train is mixed with the machine across eight static material
meshes. `cyclone-stand` survives only as an empty with `mount:cyclone-inlet`.
A runtime rule cannot recover geometry classification after that join.

RC author locations: cyclone stand at line 1277, root trestles/trays 1398–1409,
root reject pile/chips 1441–1445, external bull hose around 1555. Tagging only
the cyclone stand misses root props. CFA's external concrete hose similarly
shares `static:rubber` with the machine.

Proposed (not finalized) contract: inherited `userData.framing = 'exclude'`,
absence means included, unsupported values fail. Export join buckets must
separate material **and resolved exclusion** and preserve that property.
Runtime must preserve exclusion when `liftNamedOffMeshes()` reparents named
descendants. Keep excluded geometry, lamps and animation available; exclusion
only changes framing measurement. The first coordinator message suggested a
`scenery:` prefix instead; neither choice is implemented. The property form
is what the provisional fixtures currently test.

## Regression checkpoint and next step

Root reran `node tools/checkrigmetadata.mjs` at checkpoint: **3/27 pass,
24 expected failures, exit 1**. This is baseline red regression evidence, not a
passing gate. It is intentionally not wired into npm check yet.

Coverage: positive/negative legacy strokes; successful absolute endpoint
consumption, including pd55-style high rest; clone independence; actual-vertex
rotated framing; arbitrary/nested/transformed excluded scenery; same-material
exclusion; named pivot/mount lifting; distant untagged geometry remains included;
partial/string/null/boolean/nonfinite/reversed/collapsed/span-inconsistent ranges;
secondary-slide validation in normal mode; cache, failure and ready-event
lifecycle. NaN/Infinity serialize to null in GLB JSON and are identified honestly.

Next concrete step in original conversation: coordinate Blender library and
machine ownership, agree axis/coordinate and scenery contracts, normalize
publishers and preserve exclusion through export joins, then implement
`gltfRig.js` validation and consumers against these fixtures. Do not silently
infer coordinate conventions per model. Add missing invalid-framing/empty-
included-geometry/unsupported-axis tests once the contract is decided, measure
RC/pd55 again with the existing ruler, and only then wire a passing gate.

Child agents and read-only reviewers were asked to stop/checkpoint. No further
implementation is authorized in this sidebar task after this handoff.
