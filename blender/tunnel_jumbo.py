"""
tunnel_jumbo - the game's two-boom face-drilling jumbo.

IN-GAME MARQUE: "Aurbach FJ-220 Faceline" (invented; DOMAIN.md section 10).
No manufacturer name or model designation appears in any object, material,
node or custom property in this file's OUTPUT. Sources are cited HERE, in
comments, which is where provenance belongs.

WHAT THIS MACHINE IS
--------------------
A low, wide, centre-articulated four-wheel rubber-tyred carrier with two long
box-section booms on its nose, each ending in a slender feed beam carrying a
hydraulic percussive rock drill. It drills the blast round in a development
heading. It TRAMS ON DIESEL AND DRILLS ON MAINS, dragging its supply cable off
a reel on the back deck. Its boom lamps are the only light in the drive.

CLASS DECISION (made once, deliberately, not averaged)
------------------------------------------------------
research/rigs/tunnel-jumbo.md section 9.1 forces a choice: the full M-class
two-boom machine (23-29 t, 8.26 m carrier, ~6.8 m feeds, 14.3 m overall) or
the LOW-PROFILE two-boom machine the game's own spec block already describes
(16 800 kg, tramming height 1775 mm, 2260 mm wide). The brief for this model
states 1775 mm tramming height, so THIS IS THE LOW-PROFILE MACHINE. Where the
low-profile class publishes nothing, the sourced M-class chain is scaled by
0.865 - the cube root of the mass ratio 16 800 / 26 000 - and every such
number is marked DERIVED below. Nothing is averaged between the two classes.

COORDINATES
-----------
Blender Z-up, metres. +Y is FORWARD, toward the face; the exporter's Y-up
conversion maps Blender +Y to three.js -Z, which is the direction rigFactory.js
already builds this machine along. +X is the machine's right hand.
ORIGIN: the articulation pin at ground level. An articulated carrier has no
slew ring; the articulation is its turning centre, and it is the one point on
the machine that does not move when it steers.
"""

import bpy
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import rig  # noqa: E402
from rig import (box, tube, hose, empty, worklight, finish, reset,  # noqa: E402
                 MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST,
                 MAT_RUBBER, MAT_CHROME, MAT_HAZARD,
                 NODE_PIVOT, NODE_SLIDE)

TAU = math.tau
D = math.radians

# ---------------------------------------------------------------------------
# DIMENSIONS.  [S] = sourced.  [D] = derived, with the derivation stated.
# Source unless noted: the M-series technical specification, printed p.5-p.7
# (two dimensioned side elevations + dimension table), read via
# research/rigs/tunnel-jumbo.md sections 3.1-3.6.
# ---------------------------------------------------------------------------
SCALE = 0.865          # [D] cube root of 16 800 / 26 000 kg. Applied ONLY to the
                       #     longitudinal chain, never to width or clearance.

WIDTH = 2.26           # [S] over tyres. Spec table gives 2 245 mm for the
                       #     M-class; the game's own spec block gives 2 260 mm.
                       #     Width is NOT scaled: a low machine is deliberately
                       #     wide, that is the whole point of the class.
CLEAR = 0.26           # [S] ground clearance 260 mm.

# Longitudinal chain, from the dimension line along the bottom of the elevation:
#  [rear end] --3156-- [REAR AXLE] --2000-- [ARTIC] --2170-- [FRONT AXLE] --795--
#  [boom face];  front overhang 934, wheelbase 4170, carrier 8260.  All [S]:
REAR_END = -(3.156 + 2.000) * SCALE            # [D] -4.462
AXLE_R = -2.000 * SCALE                        # [D] -1.730
AXLE_F = +2.170 * SCALE                        # [D] +1.877
BOOM_FACE = AXLE_F + 0.795 * SCALE             # [D] +2.565
FRONT_END = AXLE_F + 0.934 * SCALE             # [D] +2.685
CARRIER_LEN = FRONT_END - REAR_END             # [D] 7.147 m

# Tyre. 12.00 x R24 is [S] but its overall diameter is NOT SOURCED (section 8).
# [D] a 12.00-24 stands ~1.21 m tall; under a 1 775 mm machine the low-profile
# carrier runs the next size down, 12.00-20: 508 mm rim + 2 x ~290 mm section
# = ~1.09 m. Rounded to 1.10 m, which is also the game's own wheelR.
WHEEL_R = 0.55
WHEEL_W = 0.32
HUB_X = WIDTH / 2 - WHEEL_W / 2                # 0.97, tyre wall lands on 2.26

# Heights. Tramming height 1 775 mm is the brief's hard constraint.
FRAME_BOT = CLEAR                              # 0.26
FRAME_TOP = 0.90                               # [D] 640 mm deep welded box frame
DECK = 0.95                                    # [D] walking deck over the frame
HOOD_TOP = 1.60                                # [D] M-class hood 1 947 x 0.865 =
                                               #     1 684; pulled to 1 600 so the
                                               #     canopy stays the tallest point
HOOD_TAIL = 1.04                               # [D] the tail slopes away hard
CANOPY_TOP = 1.775                             # [S-brief] tramming height


# ---------------------------------------------------------------------------
def build_wheel(parent, name, x, y):
    """A tyre with real lugs. The lugs are an ARRAY around the circumference:
    they share the tyre's material, so once collapsed they cost triangles and
    not one extra draw call - the lane rig.py's docstring says to spend in."""
    piv = empty(NODE_PIVOT, name, parent, (x, y, WHEEL_R))
    side = 1 if x > 0 else -1
    tube(name + '-tyre', WHEEL_R, WHEEL_W, MAT_RUBBER, piv,
         loc=(-WHEEL_W / 2, 0, 0), rot=(0, math.pi / 2, 0), sides=20)
    lug = box(name + '-lug', (WHEEL_W * 0.92, 0.10, 0.055), MAT_RUBBER, piv,
              loc=(0, 0, WHEEL_R - 0.012), rot=(0.35, 0, 0))
    a = lug.modifiers.new('arr', 'ARRAY')
    a.count = 20
    a.use_relative_offset = False
    a.use_object_offset = True
    off = bpy.data.objects.new(name + '-lugpivot', None)
    bpy.context.collection.objects.link(off)
    off.parent = piv
    off.rotation_euler = (TAU / 20, 0, 0)
    a.offset_object = off
    tube(name + '-rim', WHEEL_R * 0.56, WHEEL_W * 0.80, MAT_DARK, piv,
         loc=(-WHEEL_W * 0.40, 0, 0), rot=(0, math.pi / 2, 0), sides=16)
    tube(name + '-hub', WHEEL_R * 0.24, 0.10, MAT_DARK, piv,
         loc=(side * WHEEL_W * 0.42, 0, 0), rot=(0, side * math.pi / 2, 0), sides=12)
    return piv


# ---------------------------------------------------------------------------
def build_front_frame(art):
    """The heavy end. On a two-boom rig ~70 % of the mass sits on this frame
    (spec table: boom side 17 500-19 000 kg of a 23-29 t machine), so it is a
    deep welded box with a thick bumper plate, not a sheet-metal module."""
    g = art
    y0, y1 = 0.16, FRONT_END
    ymid = (y0 + y1) / 2
    ylen = y1 - y0
    for s in (-1, 1):
        box('ff-rail', (0.30, ylen, FRAME_TOP - FRAME_BOT), MAT_DARK, g,
            loc=(s * (WIDTH / 2 - 0.42), ymid, (FRAME_TOP + FRAME_BOT) / 2),
            bevel=0.02)
    box('ff-belly', (WIDTH - 0.84, ylen * 0.94, 0.10), MAT_DARK, g,
        loc=(0, ymid, FRAME_BOT + 0.05), bevel=0.015)
    box('ff-deck', (WIDTH - 0.10, ylen, 0.10), MAT_PAINT, g,
        loc=(0, ymid, DECK - 0.05), bevel=0.02)
    box('ff-bulkhead', (WIDTH - 0.16, 0.16, 0.86), MAT_PAINT, g,
        loc=(0, y1 - 0.08, FRAME_BOT + 0.43), bevel=0.03)
    box('ff-bumper', (WIDTH + 0.02, 0.12, 0.26), MAT_WORN, g,
        loc=(0, y1 + 0.04, FRAME_BOT + 0.16), bevel=0.03)
    return g


def build_rear_frame(root):
    """The power pack: a low closed hood with a strongly down-sloping tail
    (elevation, printed p.7). Nearly as tall as it is wide - a squat brick."""
    g = empty('', 'rear-frame', root)
    y0, y1 = -0.16, REAR_END
    ymid = (y0 + y1) / 2
    ylen = abs(y1 - y0)
    for s in (-1, 1):
        box('rf-rail', (0.28, ylen, FRAME_TOP - FRAME_BOT), MAT_DARK, g,
            loc=(s * (WIDTH / 2 - 0.44), ymid, (FRAME_TOP + FRAME_BOT) / 2),
            bevel=0.02)
    box('rf-belly', (WIDTH - 0.90, ylen * 0.92, 0.10), MAT_DARK, g,
        loc=(0, ymid, FRAME_BOT + 0.05), bevel=0.015)
    box('rf-deck', (WIDTH - 0.12, ylen, 0.09), MAT_PAINT, g,
        loc=(0, ymid, DECK - 0.045), bevel=0.02)
    hy0, hy1 = -0.30, -3.05
    box('rf-hood', (WIDTH - 0.30, abs(hy1 - hy0), HOOD_TOP - DECK), MAT_PAINT, g,
        loc=(0, (hy0 + hy1) / 2, (HOOD_TOP + DECK) / 2), bevel=0.035)
    tail = box('rf-tail', (WIDTH - 0.30, 1.42, HOOD_TOP - DECK), MAT_PAINT, g,
               loc=(0, -3.76, (HOOD_TOP + DECK) / 2), bevel=0.03)
    drop = HOOD_TOP - HOOD_TAIL
    for v in tail.data.vertices:
        if v.co.y < 0:                       # shear the rearward face down
            v.co.z -= drop
    box('rf-tailplate', (WIDTH - 0.34, 0.10, 0.30), MAT_WORN, g,
        loc=(0, REAR_END + 0.05, FRAME_BOT + 0.20), bevel=0.02)
    return g


def build_articulation(root):
    """The busiest area on the machine: a vertical stack of pinned lugs with
    the whole hydraulic and electric harness crossing it. Steering +/-41 [S]."""
    art = empty(NODE_PIVOT, 'articulation', root, (0, 0, 0))
    for z in (FRAME_BOT + 0.14, FRAME_TOP - 0.24):
        tube('art-pin', 0.075, 0.30, MAT_CHROME, root, loc=(0, 0, z), sides=12)
    for s in (-1, 1):
        box('art-lug', (0.10, 0.34, 0.62), MAT_DARK, root,
            loc=(s * 0.18, -0.10, (FRAME_TOP + FRAME_BOT) / 2), bevel=0.02)
    return art


def build_canopy(art):
    """A CANOPY, not a cab: an open FOPS roof on four posts over a reclined
    seat, offset to one side of the front frame so the operator looks straight
    down the feeds. NO GLASS ANYWHERE - see build()'s note on why."""
    g = empty('', 'canopy', art, (0.56, 0.98, 0))
    box('cn-floor', (1.02, 1.30, 0.06), MAT_HAZARD, g, loc=(0, 0, DECK + 0.03),
        bevel=0.01)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box('cn-post', (0.08, 0.08, CANOPY_TOP - DECK), MAT_PAINT, g,
                loc=(sx * 0.46, sy * 0.58, (CANOPY_TOP + DECK) / 2), bevel=0.012)
    box('cn-roof', (1.16, 1.40, 0.07), MAT_PAINT, g,
        loc=(0, 0, CANOPY_TOP - 0.035), bevel=0.02)
    return g


def build_cable_reel(rear):
    """1 600 mm drum [S, printed p.5] x SCALE = 1 384 -> 1.38 m. It lies on top
    of the rear hood, axis transverse, tilted - 'a disc almost as tall as the
    hood itself'. At thumbnail size it is a wheel where no wheel should be.
    Diesel to tram, mains to drill: the machine's signature object."""
    piv = empty(NODE_PIVOT, 'cable-reel', rear, (0, -2.10, HOOD_TOP + 0.22),
                rot=(D(12), 0, 0))
    R = 0.69
    for s in (-1, 1):
        tube('cr-flange', R, 0.04, MAT_PAINT, piv,
             loc=(s * 0.24, 0, 0), rot=(0, s * math.pi / 2, 0), sides=24)
    tube('cr-drum', R * 0.42, 0.44, MAT_DARK, piv,
         loc=(-0.22, 0, 0), rot=(0, math.pi / 2, 0), sides=16)
    return piv


# ---------------------------------------------------------------------------
def collapse_nodes():
    """Join meshes that share a parent AND a material.

    rig.py's finish() only joins STATIC meshes; anything under a pivot:/slide:
    node is left alone because it has to move. Correct - but it means a boom
    built from twenty plates would be twenty draw calls. Joining per
    (parent, material) keeps every moving node independent while collapsing the
    detail inside it, so detail on a moving part costs triangles too."""
    groups = {}
    for o in list(bpy.context.scene.objects):
        if o.type != 'MESH' or o.parent is None:
            continue
        key = (o.parent.name, o.data.materials[0].name if o.data.materials else '-')
        groups.setdefault(key, []).append(o)
    for (pname, mat), objs in groups.items():
        if len(objs) < 2:
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        bpy.context.active_object.name = '%s|%s' % (pname, mat)


def bake_all():
    """Apply every modifier and convert every curve to a mesh BEFORE joining.

    Two reasons, both load-bearing:
      1. join() keeps only the ACTIVE object's modifier stack, so an unapplied
         bevel would silently be applied to everything joined into it.
      2. hose() returns a CURVE, and finish() skips non-mesh objects - so every
         hose left as a curve is its own draw call. Converted, hoses join with
         the other rubber and cost nothing."""
    bpy.ops.object.select_all(action='DESELECT')
    targets = [o for o in bpy.context.scene.objects if o.type in ('MESH', 'CURVE')]
    for o in targets:
        o.select_set(True)
    if targets:
        bpy.context.view_layer.objects.active = targets[0]
        bpy.ops.object.convert(target='MESH')
    bpy.ops.object.select_all(action='DESELECT')


def build(out_path):
    reset()
    root = empty('', 'rig-root', None)

    art = build_articulation(root)
    build_front_frame(art)
    rear = build_rear_frame(root)
    build_canopy(art)
    build_cable_reel(rear)

    build_wheel(art, 'wheel-fl', -HUB_X, AXLE_F)
    build_wheel(art, 'wheel-fr', +HUB_X, AXLE_F)
    build_wheel(rear, 'wheel-rl', -HUB_X, AXLE_R)
    build_wheel(rear, 'wheel-rr', +HUB_X, AXLE_R)

    bake_all()
    collapse_nodes()
    return finish(out_path)


if __name__ == '__main__':
    build(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       '..', 'public', 'models', 'tunnel_jumbo.glb'))
