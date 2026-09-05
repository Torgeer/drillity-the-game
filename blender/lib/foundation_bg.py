"""Import shim for the foundation_bg builder.

`blender/build.py` puts only `blender/lib` on sys.path, so plain
`import foundation_bg` cannot see `blender/foundation_bg.py`, which is where the
builder is required to live. build.py is shared and each machine may add only
its own id to MACHINES, so the path cannot be widened from there — hence this
shim, matching the one `pd55` already uses.

Verified: without it, `blender/build.py` raises
`ModuleNotFoundError: No module named 'foundation_bg'`.

The single-line alternative, for whoever owns build.py: adding
`sys.path.insert(0, HERE)` next to the existing `lib` insert would let every
machine drop its shim.
"""

import importlib.util
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_SRC = os.path.join(os.path.dirname(_HERE), 'foundation_bg.py')

_spec = importlib.util.spec_from_file_location('foundation_bg_impl', _SRC)
_mod = importlib.util.module_from_spec(_spec)
sys.modules['foundation_bg_impl'] = _mod
_spec.loader.exec_module(_mod)

build = _mod.build
