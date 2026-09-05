"""
A two-box test rig — the smallest machine that exercises EVERY clause of the
`blender/lib/rig.py` contract, so the runtime loader can be proved before any
real machine lands.

It is NOT a machine and must never be shipped as one. It exists so that
`src/core/gltfRig.js` can be tested against a real `.glb` produced by the real
exporter, rather than against an assumption about what the exporter emits.

What it deliberately covers, one clause each:

  statics in three materials   -> joins to exactly three `static:<mat>` meshes,
                                  so the draw-call floor is countable by hand
  a `glass` pane               -> proves the loader swaps glazing WITHOUT
                                  reintroducing transmission (HANDOFF §8F)
  `pivot:mast`                 -> a rotated node, correctly excluded from the join
  `slide:carriage`             -> a translated node, likewise excluded
  a lamp on a static           -> `mount:`/`aim:` survive the join (moves: false)
  a lamp on the pivot          -> the lamp env.js must re-read every frame
                                  (moves: true)
  extras on both mounts        -> cone_deg / range_m arrive as glTF `extras`

Run:
    "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
        --python blender/teststub.py -- --id teststub

`--id` names the output `public/models/<id>.glb`. Pass a real rig id to stand
the stub in for a machine that has not been modelled yet, for a loader test
only — delete it afterwards.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

import rig as R  # noqa: E402


def build(out_path):
    R.reset()

    # ── statics: three materials, several objects each, so the join is visible ──
    R.box('body', (2.4, 3.6, 1.4), R.MAT_PAINT, loc=(0, -1.6, 0.9), bevel=0.04)
    R.box('counterweight', (2.0, 0.8, 0.9), R.MAT_PAINT, loc=(0, -3.2, 1.1), bevel=0.03)
    R.box('cab-shell', (1.3, 1.5, 1.6), R.MAT_PAINT, loc=(-0.9, -0.5, 2.2), bevel=0.05)

    R.box('chassis', (2.8, 4.4, 0.5), R.MAT_DARK, loc=(0, -1.6, 0.25), bevel=0.03)
    R.box('track-l', (0.6, 4.2, 0.7), R.MAT_DARK, loc=(-1.3, -1.6, 0.35))
    R.box('track-r', (0.6, 4.2, 0.7), R.MAT_DARK, loc=(1.3, -1.6, 0.35))

    # Glazing. One pane, one material, so the loader's transmission rule has
    # something real to be checked against.
    R.box('cab-glass', (0.02, 1.2, 1.0), R.MAT_GLASS, loc=(-1.56, -0.5, 2.4))

    # ── dynamic: a mast that rotates and a carriage that slides on it ──────────
    mast_pivot = R.empty(R.NODE_PIVOT, 'mast', loc=(0, 0.2, 1.5))
    R.box('mast-section', (0.45, 0.45, 6.0), R.MAT_PAINT, parent=mast_pivot,
          loc=(0, 0, 3.0), bevel=0.02)

    carriage = R.empty(R.NODE_SLIDE, 'carriage', parent=mast_pivot, loc=(0, -0.4, 1.0))
    # A STUB THAT DEMONSTRATES THE CONTRACT HAS TO OBEY IT.
    # This node shipped bare, and `slide:carriage` without `travel_m` is the
    # one shape of broken this pipeline cannot see: src/core/gltfRig.js
    # setCarriage() evaluates `-0 * undefined`, writes NaN into a world matrix,
    # and the machine silently disappears instead of throwing.  The fleet-wide
    # audit that found it in six real machines found it here too — and a
    # reference stub carrying the very fault it is meant to guard against is
    # how the fault spreads.
    carriage['travel_m'] = 1.20
    carriage['axis'] = 'z'
    # ...and the tool anchor, so `mounts.get('tool')` resolves rather than
    # falling back to the carriage origin.
    R.empty(R.NODE_MOUNT, 'tool', parent=carriage, loc=(0, 0, -0.3))
    R.box('carriage-plate', (0.7, 0.35, 0.6), R.MAT_STEEL, parent=carriage)

    # ── lamps ─────────────────────────────────────────────────────────────────
    # One on a static (the join must not eat it), one on the mast (it must sweep).
    # The names are the ones core/env.js looks for by string (env.js ~509-535).
    # boom-1 rides the mast pivot, so it MUST sweep when the mast turns — that
    # is the whole reason the named-node contract exists. boom-2 is bolted to
    # the deck and must not move.
    R.worklight('boom-1-work-light', mast_pivot, (0, -0.35, 5.4),
                aim_dir=(0, -0.2, -1.0), cone_deg=38, range_m=34)
    R.worklight('boom-2-work-light', None, (-1.5, 0.1, 2.9),
                aim_dir=(-0.3, 1.0, -0.4), cone_deg=54, range_m=26)

    return R.finish(out_path)


def _arg(name, default):
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    if name in argv:
        return argv[argv.index(name) + 1]
    return default


if __name__ == '__main__':
    out_dir = os.path.abspath(os.path.join(HERE, '..', 'public', 'models'))
    os.makedirs(out_dir, exist_ok=True)
    build(os.path.join(out_dir, _arg('--id', 'teststub') + '.glb'))
