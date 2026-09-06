# Tool alias defaults — 2026-09-06

Baseline: `1b913e8b24011c90e42001fe1ff6dfc4660cc13b`.
Scope: only the alias/default merge in `src/rig/tools.js`.

## Reproduced defect and correction

`buildTool()` copied caller options over `TOOL_ALIASES[id].opts` with
`Object.assign`. A caller object containing an optional field whose value was
`undefined` erased the alias value. The family builder then applied its own
generic default. Missing catalogue fields can produce these caller objects.

After the existing merge, alias keys whose merged value is `undefined` now
recover their alias default. Explicit `null`, `0`, `false`, and empty strings
keep their previous behavior. Caller-only keys, direct builder calls, unknown
IDs, input objects, and alias definitions are unchanged. No physical constants,
procedural wear implementation, marque, or camera code changed.

## Actual produced geometry

Measured on CPU with real `buildTool()` calls at `lod: 'low'`, using Three.js
`Box3.setFromObject(group, true)` to transform actual vertices. A separate
SHA-256 fingerprint of every world-space POSITION vertex checked equality;
specifications and vertex counts were compared too. No new dimension CLI was
created. These extents describe the produced geometry, not manufacturer
dimensions. Nominal parameters below are existing alias inputs.

| Alias and undefined caller fields | Before: extent X / Y / Z, mm | After: extent X / Y / Z, mm | Vertices before → after |
|---|---|---|---|
| `button-bit-t51-hd`: `diameterMm`, `thread`, `buttonKind` | 88.198997 / 81.732587 / 86.203806 | 114.891529 / 106.438981 / 114.099469 | 2008 → 2596 |
| `core-bit-bq`: `size` | 96.000001 / 61.999999 / 96.192002 | 59.999999 / 61.999999 / 59.999999 | 1869 → 1557 |
| `rod-t38-face-1830`: `lengthMm` | 45.919999 / 3675.220728 / 56.000002 | 45.919999 / 1845.220804 / 56.000002 | 527 → 527 |
| `rc-pipe-114-6m`: `lengthMm` | 129.780799 / 3115.839884 / 133.118346 | 129.780799 / 6115.840122 / 133.118346 | 1861 → 1861 |
| `push-rod-reducer`: `reducer` | 70.516087 / 1050.320029 / 74.144997 | 70.516087 / 1050.320029 / 74.144997 | 950 → 1015 |

The reducer case demonstrates why overall bounds alone are insufficient: its
missing geometry does not determine the group's extremes. Conversely,
`core-bit-hq` with undefined `size`, `rod-t45` with undefined `lengthMm`, and
`pile-helmet-350` with undefined `square` masked the defect because each family
builder's default happened to agree with its alias.

## Targeted verification

Twenty original-versus-current CPU snapshot comparisons passed. The original
module was loaded from `git show HEAD:src/rig/tools.js`; its two imports were
resolved to the existing shared dependency files before a data-URL import.

- Six undefined-field cases: the five rows above and the unchanged pile helmet.
  Each fixed result equals the original alias with those fields omitted.
- Fourteen preservation cases: explicit T45 / 89 / spherical overrides on the
  T51-HD alias at wear `0`, `0.5`, and `1`; reducer `false`, `null`, and `''`;
  helmet `square: false` and `null`; sample-bag `fill: 0`; motor `bendDeg: 0`;
  core `size: null` and `''`; undefined fields on the direct button-bit builder;
  and an unknown ID using the existing billet fallback.

Every preservation result exactly matched the baseline specification, count,
vertex fingerprint and precise bounds. All allocated tool instances and both
module caches were disposed. `git diff --check -- src/rig/tools.js` passed.
Independent catalogue/alias/wear regression and adversarial testing is recorded
by the owning catalogue verification task. No GPU session was started here.
