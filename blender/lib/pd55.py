"""Import shim for the pd55 builder.

`blender/build.py` puts only `blender/lib` on sys.path, so `import pd55` cannot
see `blender/pd55.py`, which is where the builder is required to live. build.py
is a shared file and each machine may add only its own id to MACHINES, so the
fix goes here instead of there: load the sibling module by path and re-export
`build()`.

If build.py ever gains `sys.path.insert(0, HERE)` — which it should, this is a
bug that hits every machine, not just this one — then `blender/pd55.py` wins
the import outright and this file is simply never reached.
"""

import os
import importlib.util

_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pd55.py')
_spec = importlib.util.spec_from_file_location('pd55_impl', _PATH)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

build = _mod.build
