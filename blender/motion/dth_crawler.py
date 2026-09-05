"""
Motion for `dth_crawler` — the rod change.

    "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
        --python blender/motion/dth_crawler.py -- public/models/dth-crawler.glb

WHY THIS FILE IS SEPARATE FROM blender/dth_crawler.py
-----------------------------------------------------
It IMPORTS the machine module and never edits it. `dth_crawler.build()` already
ends in `rig.finish()`, which joins the statics by material and then restores
every named node's world transform, so by the time this file runs the scene is
in exactly the state that reaches the .glb. Keying against anything earlier
would be keying against a pose the export does not have — and `finish()`'s join
has already been caught silently relocating a `mount:` six metres while its NAME
survived, which is the failure this ordering removes.

WHAT THE CLIP CLAIMS, AND WHAT IT LEAVES ALONE
----------------------------------------------
`gltfRig.js:makeDyn()` maps exactly three named nodes on a Blender machine to
things `rigFactory.js` writes every frame:

    pivot:mast        -> dyn.mastPivot   .rotation.x   (mast rake)
    pivot:mast-upper  -> dyn.mastLower/Upper .rotation.x (mast flex)
    slide:carriage    -> dyn.carriage    .position.y/.z, .rotation.x

This clip claims ONE of them — `slide:carriage` — because a rod change is a
carriage move and pretending otherwise would be authoring a rod change that
does not move the head. The other three nodes it drives (`pivot:spindle`,
`pivot:carousel`, `pivot:rodArm`) are indexed by `gltfRig.js` and driven by
nothing, so on the carriage alone do code and clip meet. `gltfAnim.js` settles
that node by blending from wherever `setCarriage()` has just put it; nothing
here needs to know, and nothing in rigFactory.js changes.

It does NOT touch `pivot:mast`. The rake is a machine-state variable the player
sets and `updateRake()` writes every frame — a clip that moved it would be
fighting a control, not choreographing a sequence.

THE SEQUENCE, AND WHERE ITS NUMBERS COME FROM
---------------------------------------------
Adding a tube on a surface DTH crawler: finish the pass, break the joint at the
head, run the head to the top of the feed, index the magazine, put the guide
ring on the string, make up onto the new tube, swing the guide clear.

Every distance and rate below is read off the machine module's own constants or
its exported custom properties — not chosen here:

    slide:carriage  travel_min_m 0.950   travel_max_m 6.674   rest z 3.350
                    rate_ms 0.900        [R]S3.1, dth_crawler.py:1052/1284-1288
    pivot:carousel  tubes 6              -> 60.000 deg per index
                    dth_crawler.py:1228
    pivot:spindle   rpm_min 54  rpm_max 137   dth_crawler.py:1330-1331

Carriage moves are timed at the declared 0.9 m/s rapid, so the clip's duration
is a consequence of the machine's own spec rather than a number picked to look
right. That is why it is 18 seconds and not 6.

NOT SOURCED
-----------
  * The number of turns to break out and to make up (3 each). A real make-up is
    to a torque, not to a turn count.
  * The dwells (0.30-0.40 s) between moves. They stand in for the foot clamp
    biting and the operator's hand moving between levers, neither of which is
    modelled.
  * The order is the ordinary one for a rig with a magazine and a guide, but no
    manufacturer sequence chart was found for this machine class.

A MEASURED FINDING ABOUT THE MACHINE MODULE (not fixed here — I do not own it)
-----------------------------------------------------------------------------
`pivot:rodArm` cannot be a magazine PICK arm as modelled, and the geometry says
so. Its grip ring sits 0.680 m from its pivot (`rodgrip` at arm-local x
-0.680); the pivot is 0.150 m from the carousel axis and the tube pitch circle
is 0.280 m, so the furthest any tube ever gets from the arm pivot is 0.430 m.
The grip circle cannot reach the magazine at any angle.

It reaches the DRILL STRING exactly, though: pivot at fx (0.490, 0.060), string
axis at (0, STRING_Y = 0.380), separation 0.5853 m against a grip radius of
0.680 m — a 0.0947 m residual inside the ring's 0.105 m inner clearance, so the
string sits in the ring with 0.010 m to spare. So the part is a rod GUIDE that
swings on and off the string, and this clip animates it as one. If it was meant
to be a pick arm, the arm needs to be longer or the magazine closer, and that
is a change to `blender/dth_crawler.py`.
"""

import math
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_BLENDER = os.path.dirname(_HERE)
for _p in (os.path.join(_BLENDER, 'lib'), _BLENDER):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import anim                              # noqa: E402  (path set above)

# IMPORTED, NEVER EDITED. By path, not by name: this file is also called
# `dth_crawler`, and a plain `import dth_crawler` resolves to whichever
# directory `sys.path` happens to reach first — which is sometimes this one, and
# then the module imports itself. See `anim.machine()`.
machine = anim.machine('dth_crawler')


# ── read off blender/dth_crawler.py, not restated ────────────────────────────
CARR_Z0 = machine.CARR_Z0          # 0.950  bottom of carriage travel
CARR_Z1 = machine.CARR_Z1          # 6.674  top of carriage travel
CARR_REST = machine.CARR_REST      # 3.350  rest pose, mid-pass
RATE = 0.900                       # m/s rapid, dth_crawler.py:1287 [R]S3.1
TUBES = 6                          # dth_crawler.py:1228 -> 60 deg per index

DOWN = CARR_Z0 - CARR_REST         # -2.400
UP = CARR_Z1 - CARR_REST           # +3.324

# The swing that puts the guide ring on the string. SOLVED from the module's own
# geometry rather than eyeballed: the grip parks along the arm's local -X (i.e.
# bearing pi), and the bearing from the arm pivot to the string axis is
# atan2(STRING_Y - carousel y, 0 - arm pivot x). The delta between the two is
# the swing, and it comes out at -33.15 deg. See the header for the clearance
# check that says the ring actually closes on the string.
GUIDE_DEG = math.degrees(
    math.atan2(machine.STRING_Y - 0.060, 0.0 - (machine.CAROUSEL_X - 0.150))
    - math.pi)

BREAK_TURNS = 3.0                  # NOT SOURCED
MAKEUP_TURNS = 3.0                 # NOT SOURCED
DWELL = 0.35                       # NOT SOURCED


def clips():
    """The rod change, as a list of clips. Timings are cumulative seconds."""
    c = anim.Clip('rod-change')

    t = 0.0
    # Everything starts at its rest pose. That is not decoration: `verify()`
    # checks the first key of every channel against the node's own rest TRS in
    # the exported node table, so a clip that did not start at rest would be a
    # clip that made the machine JUMP the instant it was played.
    c.slide('slide:carriage', t, 0.0)
    c.rotate('pivot:spindle', t, 0.0)
    c.rotate('pivot:carousel', t, 0.0)
    c.rotate('pivot:rodArm', t, 0.0)

    # ── 1. finish the pass: the head runs to the bottom of its travel ────────
    t += DWELL
    for n in ('slide:carriage', 'pivot:spindle', 'pivot:carousel', 'pivot:rodArm'):
        c.hold(n, t)
    t += abs(DOWN) / RATE                                   # 2.667 s
    c.slide('slide:carriage', t, DOWN)
    t += DWELL                                              # foot clamp bites
    c.hold('slide:carriage', t)

    # ── 2. break the joint at the head ──────────────────────────────────────
    # Reverse rotation with the string held below. The head stays where it is;
    # only the spindle turns.
    c.hold('pivot:spindle', t)
    t0 = t
    t += 0.80
    # spin(), not rotate(): three turns keyed in one step is the IDENTITY
    # quaternion and exports as a channel that stands still. See anim.Clip.spin.
    c.spin('pivot:spindle', t0, t, -360.0 * BREAK_TURNS)
    t += DWELL
    c.hold('pivot:spindle', t)
    c.hold('slide:carriage', t)

    # ── 3. retract the head to the top, clearing a 5 m tube ─────────────────
    # The full stroke: CARR_Z1 - CARR_Z0 = 5.724 m against a 5.000 m tube.
    t += (UP - DOWN) / RATE                                 # 6.360 s
    c.slide('slide:carriage', t, UP)
    t += DWELL
    c.hold('slide:carriage', t)

    # ── 4. index the magazine one pocket ────────────────────────────────────
    c.hold('pivot:carousel', t)
    t += 1.20
    c.rotate('pivot:carousel', t, 360.0 / TUBES)            # 60 deg
    t += DWELL
    c.hold('pivot:carousel', t)

    # ── 5. the guide ring swings onto the string centreline ─────────────────
    c.hold('pivot:rodArm', t)
    t += 0.90
    c.rotate('pivot:rodArm', t, GUIDE_DEG)
    t += DWELL
    c.hold('pivot:rodArm', t)

    # ── 6. make up: the head screws onto the new tube ────────────────────────
    c.hold('pivot:spindle', t)
    t0 = t
    t += 1.10
    c.spin('pivot:spindle', t0, t, 360.0 * MAKEUP_TURNS)
    t += DWELL
    c.hold('pivot:spindle', t)

    # ── 7. the guide swings clear; the sim takes the feed back ──────────────
    # The hold is what keeps the guide ON the string through the make-up above.
    # Without it the exporter's ease runs it back from the end of step 5, and
    # the ring drifts off the tube while the head is screwing into it.
    c.hold('pivot:rodArm', t)
    t += 0.90
    c.rotate('pivot:rodArm', t, 0.0)
    t += DWELL
    for n in ('slide:carriage', 'pivot:spindle', 'pivot:carousel', 'pivot:rodArm'):
        c.hold(n, t)

    return [c]


def build(out_path):
    """Build the machine, key the clips onto it, re-export, verify, report."""
    return anim.build_with_motion(machine, out_path, clips())


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    out = argv[0] if argv else os.path.join(
        os.path.dirname(_BLENDER), 'public', 'models', 'dth-crawler.glb')
    build(os.path.abspath(out))
