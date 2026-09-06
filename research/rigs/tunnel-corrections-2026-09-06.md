# Tunnel jumbo standalone export correction — 2026-09-06

The standalone `blender/tunnel_jumbo.py` entry point now exports
`public/models/tunnel-jumbo.glb`, matching the registered rig ID. Previously it
exported the unreachable underscore filename `tunnel_jumbo.glb`. The only
model-source change from the frozen optimization delivery is that filename
literal in `if __name__ == '__main__'`.

This is a separate correction phase. Frozen optimization artifacts, earlier
tools/reports, public model output, shared libraries, runtime and data were
not edited. No GPU/browser session, package install, Git index action or
approval request was used.

## Actual standalone regression

Run `node tools/rigfix_tunnel_entrypoint.mjs --baseline` to reproduce the frozen
entry-point bug, and `node tools/rigfix_tunnel_entrypoint.mjs` to test the fix.
Each command creates a fresh uniquely named fixture under
`.rig-corrections/tunnel/`, copies the selected source and shared Python
libraries into `fixture/blender/`, creates an empty `fixture/public/models/`,
then invokes:

```text
blender.exe --background --threads 2 --python-exit-code 1
  --python <fixture>/blender/tunnel_jumbo.py
```

The real `__main__` runs and chooses its own output path. No wrapper calls
`build()` with a manually corrected filename. A fresh fixture and exact output
inventory prevent stale artifacts from satisfying the check. The source guard
also compares the current module to the frozen source and permits only the
one filename replacement, normalizing line endings.

The baseline invocation creates only `tunnel_jumbo.glb`, reproducing the
missing registered filename. The corrected invocation creates only
`tunnel-jumbo.glb`; the underscore artifact is absent. The expected filename
comes from the matching `RIGS` registration. The runner rejects a failed
Blender process, missing/extra/wrong output, empty/unreadable geometry, changed
counts or contracts, and any write to the protected frozen/public models or
shared source libraries during the run.

## Export comparison

Actual output GLBs are parsed and measured through the existing sole ruler,
`tools/glbinfo.mjs`. The unchanged `tools/rigopt_contracts.mjs` is imported
read-only for contract comparison. No new dimension ruler was added.

| Metric | Frozen optimized model | Corrected standalone |
| --- | ---: | ---: |
| Referenced primitives | 53 | 53 |
| Triangles | 24,280 | 24,280 |
| Bytes | 1,335,616 | 1,335,616 |
| Nodes | 113 | 113 |
| Contract nodes | 53 | 53 |
| Animation clips | 0 | 0 |

Overall and contract-subtree vertex-bound differences are exactly **0** with
zero geometry tolerance. Local/world attachment and motion-node transform
differences are exactly **0**. Materials, hierarchy, extras and assembly
membership match. These are CPU exported-geometry checks, not measured
rendered draw calls, runtime animation playback or GPU performance.

Raw GLB byte hashes vary between fresh exports, including an unchanged-source
standalone export. Independent review isolated this precisely: across all
**53 named meshes**, mesh-local transforms, material/mode, ordered POSITION,
NORMAL and index arrays match the frozen optimized export exactly. Only UV
values vary: the latest unchanged-source standalone export has 48 changed UV
scalars; the corrected export has 32. Both have maximum absolute UV difference
**5.960464477539063e-8**, in dimensionless UV coordinates. There is no changed
triangle position, topology or shading normal.

The independent reviewer computed exact geometry SHA-256
`5dfcdb999b10d0b242c5342949a6f22ace6073c24a43004817c41969bc173048`
for the frozen, unchanged-standalone and corrected-standalone exports. Its
canonical input is UTF-8 JSON with mesh names sorted by `localeCompare`, null
defaults for matrix/translation/rotation/scale, then each primitive's material,
mode and ordered decoded indices/POSITION/NORMAL. UVs are deliberately separate.

The runner now permanently checks exact mesh transforms and non-UV accessor
payloads, allowing only **1e-7** UV rounding tolerance. This tolerance is a
verification choice in UV space; geometry bounds still use zero tolerance.
Run `node tools/rigfix_tunnel_entrypoint.mjs --verify-latest` to apply those
checks to the saved real export without rerunning Blender. That mode rejects
stale current/fixture module or library hashes and changed artifact hashes.
The final saved-artifact check passed; its detailed evidence is
[geometry-proof.json](../../.rig-corrections/tunnel/geometry-proof.json).

## Hashes and retained evidence

Frozen module SHA-256:
`54726a05f4515b88bc376dab369d8c14ef0c1f32299ff4bfe75f00f40699cff1`

Corrected module SHA-256:
`660cb04bf0df7906451bd81c05efe4fd5ce27a4b33899e50db219bd550da09ca`

Frozen optimized GLB SHA-256:
`e94dc982d55a038594abc25da95255ff7e099dec9685876587d6fbd4ffef5de9`

Latest unchanged-source standalone GLB SHA-256 (`baseline-hdr55d`):
`44d12828ba827793e5d3d6ad725215621b109a664403c48b9d6ceae82dc3f276`

Latest corrected standalone GLB SHA-256 (`fixed-dqcfu2`):
`99a3405cc1478f2428a0e1c3c0e9317d048fde7cd4086e0200f9a43e9ce68b56`

Each successful fixture retains the exact copied source, libraries, actual
GLB, Blender log and `result.json`, including full source/export/library
SHA-256 values and the complete executed command. Latest successful runs are
also indexed by `.rig-corrections/tunnel/baseline-result.json` and
`.rig-corrections/tunnel/fixed-result.json`. All new build outputs remain under
`.rig-corrections/tunnel/`; integration should rebuild from the source.

The independent reviewer also confirmed all 141 frozen optimization manifest
files remained intact and exercised in-memory runner rejection cases for
missing, wrong, extra, empty and stale artifacts and changed source. This
review is bounded CPU pipeline evidence, not a GPU/performance verdict.

No geometry or appearance change was intended, so CPU image rendering was not
needed for this filename correction. It fixes the standalone build route;
the existing batch builder already uses hyphenated registered filenames.
