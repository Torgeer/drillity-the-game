# Rig travel and framing verification — 2026-09-06

This continues the historical `RIG_METADATA_HANDOFF.md` checkpoint. All geometry
numbers below are measurements of authored working poses, not manufacturer
dimensions. Synthetic fixture coordinates are **NOT SOURCED**, deliberately
exaggerated contract probes. No verified machine dimensions or game facts were
changed to accommodate the loader.

## Reproduced baseline

The public `createGltfRigs()` loader was run on CPU against the actual prepared
RC and pd55 GLBs. `tools/glbinfo.mjs` supplied the independent actual-vertex
measurement; its existing functions were reused in memory for the endpoint
experiment. No second dimension CLI was created.

| Authored model | Old runtime height (m) | Actual authored-pose height (m) | Old runtime feed endpoints (m) | Declared parent endpoints (m) |
|---|---:|---:|---|---|
| RC | 9.798145134 | 7.214952 | 6.590000095 → 3.400000095 | 4.95 → 1.76 |
| pd55 | 26.218448359 | 25.789998 | 31.720000610 → 17.860000610 | 17.86 → 4 |

At its old upper endpoint, RC's actual whole-model maximum Y rose from
7.199999809 to 8.579999866 m. Both declared endpoints retained 7.199999809 m.
For pd55 the corresponding values were 25.699998110, 34.099999771, and
25.699998110 m. Every ruler result had zero unreadable primitives.

The old range already had a descending sign. The defect was adding `travel_m`
to an authored absolute rest coordinate. The framing defect independently
came from rotating local AABB corners, including corners with no actual vertex.
A synthetic 45-degree triangle measured 5.656854249 m high through that path
against an analytical actual height of 2.828427125 m.

Scanning every prepared GLB found endpoint pairs on **8 of 19** machines;
the earlier checkpoint's nine was incorrect. The eight are CFA, core, DTH,
HDD, longhole, pd55, raisebore, and RC.

## Exported metadata contract

An explicit slide declaration requires all five fields:

| Field | Meaning |
|---|---|
| `travel_space: 'parent-local'` | Endpoints belong to the exported node's parent frame. |
| `travel_axis: 'x'`, `'y'`, or `'z'` | A glTF axis, not the older Blender `axis` property. |
| `travel_min_m`, `travel_max_m` | Finite absolute coordinate endpoints with minimum less than maximum. |
| `travel_direction: 'min'` or `'max'` | The endpoint approached as feed increases from 0 to 1. |

If `travel_m` is also present, its absolute magnitude must equal the endpoint
span, within a relative tolerance of 1e-6. The span itself must remain finite.
Authored rest must lie inside the bounds with 1e-5 m tolerance for float32
exported transforms. Those tolerances are numeric validation choices, not
physical tolerances or sourced machine claims.

HDD therefore has a Z feed toward maximum after Blender Y becomes glTF −Z.
The authored uphole longhole rig feeds toward maximum on Y. Other normalized
publishers declare their direction explicitly; the loader carries no rig-id
table for either axis or direction.

Legacy `travel_m`-only declarations retain their previous finite, signed,
rest-relative Y interpretation. Complete absence yields a stationary carriage.
Malformed or partial explicit metadata fails in both normal and strict modes.
Every slide is validated, including secondary slides. Travel metadata on a node
without the `slide:` prefix fails rather than becoming a declaration with no
consumer. Only strict mode forbids the caller's normal procedural fallback;
the public GLB loader always rejects the invalid model itself.

`framing: 'exclude'` is inherited. Absence includes a subtree; no alternate
values or implicit name rules exist. Exclusion changes framing only: geometry,
lights, animation, and primitive counts remain. Inheritance is materialized
before parent cleanup. Framing without any included measurable geometry fails.

## Runtime implementation

- `gltfRig.js` measures every loaded mesh vertex in the authored world pose,
  validates finite positions, and excludes explicitly classified scenery from
  the box feeding `mastHeight`, `mastM`, and `frameRadius`.
- `gltfRigs.info(id).framing` and each built `spec.glb.framing` expose copied
  `{space: 'rig-local', min, max, center}` arrays from that same measured box.
  The coordinates precede game placement and describe the authored rest pose;
  a camera consumer applies the live rig root transform. API and instance
  isolation are tested, including mutation of a previous preview's records.
- Named pivots, slides and mounts under static meshes are lifted through a
  fixed non-mesh frame. This retains the exact authored parent transform,
  including rotation with nonuniform scale, and preserves local endpoints and
  animation keys through `mergeStatic()`.
- A pivot or slide that is itself a mesh remains a moving parent. Its children
  are not lifted away. A named mesh attachment also retains its lookup identity
  when same-material statics merge. Both cases are exercised after merging,
  including a later parent rotation.
- Each GLB carriage publishes its axis, directed endpoints, and independent
  authored rest vector. `rigFactory.js` consumes the axis in both its setter
  and getter and restores the other authored coordinates. Existing procedural
  builders retain their Y default.
- The existing Y-to-Z flex driver cannot overwrite horizontal feed. Non-Y
  slides disable that flex until another flex-axis contract is authored.
- Rejected parsed metadata disposes imported geometry, materials and textures
  before live shared materials are acquired. Invalid models do not enter the
  prepared cache or emit a ready event.

## Repeatable gate

```
node tools/checkrigmetadata.mjs
```

The default command exercises 53 synthetic cases and then every actual GLB
listed by the content authority `RIGS`. Missing models fail. Every actual rig
passes through the public loader in strict mode; its carriage is driven by the
production setter/getter at feed 0, 0.5 and 1, checking declared coordinates and
finite matrices across the entire scene graph. The private driver functions are
extracted from production source for CPU execution; the tests do not copy the
driver algorithm into a replacement implementation.

`--fixtures-only` exists for iteration while Blender is still rebuilding. It
is not the production gate. After the final Blender rebuild, the default
command passed **72/72 checks: 53 synthetic cases and all 19 actual models**.

## Final measured models

The eight explicit endpoint models were independently compared against the
existing `glbinfo.mjs` actual-vertex functions. A copy of each parsed JSON scene
had only explicitly excluded mesh references removed for the framing comparison;
the ruler still performed all transforms and vertex measurement. All minimum
and maximum coordinates agreed with the loader within 1e-5 m. All authored and
endpoint ruler measurements had zero unreadable primitives.

`RIG_METADATA_MEASUREMENTS.json` records the model SHA-256 hashes, ruler source
hash, raw bounds, declared metadata and endpoint poses from this run.

| Rig | Feed axis | Final feed start → end (m) | Exported primitives | Excluded meshes |
|---|---|---|---:|---:|
| RC | Y | 4.95 → 1.76 | 44 | 11 |
| pd55 | Y | 17.86 → 4 | 66 | 0 |
| CFA | Y | 19.999999976 → 2.999999976 | 39 | 2 |
| Core | Y | 3.335 → −0.165 | 33 | 0 |
| DTH | Y | 6.674 → 0.95 | 46 | 0 |
| HDD | Z | −2.945221467 → 1.654778533 | 51 | 0 |
| Longhole | Y | −1.07 → 0.455 | 44 | 0 |
| Raisebore | Y | 3.18 → 1.47 | 21 | 0 |

RC's final included framing is **4.081 × 7.165 × 7.572 m**, while the whole
visible model remains **7.883 × 7.215 × 7.608 m**. Excluding the pad equipment
does not delete it or alter the machine's authored vertices. Its feed endpoints
now both retain whole-model maximum Y of 7.199999809 m. The pd55 endpoints both
retain whole-model maximum Y of 25.699998110 m.

The reciprocal publisher review found a directly mesh-parented slide could
retain its world rest pose but lose its local frame in Blender's static join.
The publisher now retains an empty anchor for static mesh parents with children.
Its real exporter fixture checks both direct and unmarked-group parent chains,
world endpoints, nested excluded lights, same-material separation, and retained
triangle count. The runtime review found the converse case: a named mesh pivot
must keep its children attached. Both were fixed before the final gate run.

## Limits

This CPU gate establishes metadata validity, framing arithmetic, and local
motion behavior. It does not establish visual quality, actual GPU draw calls,
or frame rate. No browser or GPU measurement was performed for this report.
Primitives remain a draw-call floor, including excluded scenery. No transport
dimension claims are inferred from a posed model's framing box.

Framing is an authored-rest-pose box, **not a swept animation envelope**.
Measured longhole whole-model maximum Y changes from 3.940000087 m at rest to
5.174999909 m at feed end. The camera owner was informed; a fit covering all
animation needs additional posed measurements rather than an invented padding.
Runtime `mergeStatic()` can subsequently combine included and excluded statics;
camera consumers must use the immutable prepared framing API, not reconstruct
classification from the merged live mesh names or extras.
