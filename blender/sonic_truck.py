"""sonic_truck - truck-mounted sonic (resonant) drilling rig.

In-game marque: "Corvara SN-6 Resonant" (`src/game/data.js`).  DOMAIN.md §10
binds: no real manufacturer name and no model designation appears in any object
name, material name, decal or any other string that can reach a player.
Provenance lives in these comments and nowhere else.

WHAT THIS MACHINE IS
--------------------
Sonic drilling advances a CASED hole by high-frequency AXIAL vibration from an
oscillator head - two counter-rotating eccentric masses shaking the whole string
at up to 150 Hz - usually with slow rotation added.  It is neither percussion
nor rotary.  A thin annulus of soil liquefies, friction disappears, and the
string displaces material instead of cutting it, so the hole produces almost no
cuttings, in many soils needs no flush at all, and hands back a CONTINUOUS,
largely undisturbed core in a plastic sleeve.  That is why it is the tool for
contaminated-land and environmental work: you get the section, not chips of it.

Two consequences govern the whole model:

  * A sonic rig is a HEAD bought from a specialist and bolted to somebody
    else's carrier.  The head, the string and the two tube sizes are the only
    parts that say "sonic"; everything under them is ordinary site-investigation
    hardware.  So the head gets the modelling budget.
  * A machine that works by vibrating has to be PLANTED.  Outriggers, jacks,
    pads and cribbing are not dressing here, they are the reason the mast
    survives.

SOURCES
-------
[DT p.N]  `C:/Users/henri/Downloads/Drilltechniques-Sonic-Brochure.pdf`, 8 pp.
          Vendor guide for two sonic head makers.  p2 is a labelled render of
          the oscillator and drill string - THE geometry source for the head,
          read at 600 dpi for this model.  p3 and p7 are the only photographs
          of complete sonic rigs in the owner's library.  pp.4-6, 8 are head
          specification tables.
[GEO p.N] `C:/Users/henri/Downloads/Comacchio-GEO-305Pres_2023_FULL_WEB.pdf`,
          18 pp.  p16 and p17 are dimensioned general-arrangement drawings
          (working and transport) of the compact crawler the p3 sonic head is
          bolted to - the only hard dimensions in the local set.  p8, p11, p14
          are close photographs of the mast foot, the carriage and the deck.
[SLO]     Sporin & Vukelic, "Structural drilling using the high-frequency sonic
          drilling method", RMZ M&G 64 (2017), DOI 10.1515/rmzmag-2017-0001,
          `C:/Users/henri/Downloads/Structural_drilling_using_the_high-frequency
          _sonic-in-Slovenia.pdf`.  Peer-reviewed: resonance f = c/2l, the
          three-phase core-barrel / override-casing / extraction cycle,
          frequencies "up to 150 Hz".  Physics and process, no geometry.
[BAU]     `Bauer-Maschinen-Hydraulikschlaeuche...905-213-1+2.pdf` p2.  Different
          machine class, correct principle: a mast hose package is a WRAPPED
          BUNDLE running bulkhead plate -> deflection -> bulkhead plate, six
          main lines plus HP lines plus the electric cable, under a fabric bag.
[REF]     `research/rigs/sonic-truck.md` - this repo's own reference file, built
          from the four documents above.  §4.5 is the component inventory, §5
          the silhouette cues, §6 the paint and dirt, §8 the holes.
[R02/R11/R16] `research/02-prospecting.md` §E5, `research/11-oem-anchor-geotech-
          hdd.md` §A.13, `research/16-site-archetypes.md` §A.16.
[DATA]    `src/game/data.js` - the content authority.  The rig row, the sonic
          tooling rows (100 mm core barrel, 150 mm override casing, 3 m
          sections) and the method row are read from there, never re-derived.
[D]       DERIVED here by arithmetic on a sourced number.  Flagged every time.
[EST]     Measured off a photograph or a drawing whose absolute scale is known
          only through another dimension.  Flagged every time.
NOT SOURCED - said in as many words wherever it is true.  §8 of [REF] and the
          block at the foot of this docstring list what is still open.  A
          plausible invented number is worse than an admitted hole.

THE CARRIER DECISION, WHICH IS THE ONE THING THIS FILE DOES NOT SOURCE LOCALLY
-----------------------------------------------------------------------------
[REF] §8 item 1 and §9.1 are blunt: BOTH sonic rigs in the owner's catalogue
library are TRACKED crawlers, and no dimension, drawing or photograph of a
truck-mounted sonic rig exists in `C:/Users/henri/Downloads`.  [REF] §9.1 put
two options to the owner - rebuild as a crawler, or keep the truck and accept
that the carrier geometry is not locally sourced.

The brief settles it: this is the fleet's ONLY truck-mounted rig and must read
as road-legal.  That is also true to the trade - truck-mounted sonic is the
dominant configuration in North American environmental work, where the machine
has to drive itself between brownfield plots on a public road.  So the carrier
is a truck, and its dimensions come from published road-truck geometry cited at
each constant rather than from the local library, which has none.  Everything
from the sub-frame up - mast, head, guarding, clamp, tooling, hose architecture
- is the same whatever it is bolted to, and is sourced from [DT] and [GEO].

UNITS AND AXES
--------------
Metres.  Blender is Z-up; the exporter converts to three.js Y-up, with
three_x = bl_x, three_y = bl_z, three_z = -bl_y.

  +X  the machine's right                  -X  its left
  +Y  FORWARD, towards the cab and nose    -Y  rearward, past the tailboard
  +Z  up

Note this is the opposite hand to `rc_rig.py`, whose drilling end is at -Y with
the machine behind it.  Here the drilling end is at the TAIL and the machine
runs forward from it, which is what a truck rig is: you back it onto the plot
and drill off the back.  The +Y-is-forward sense is what makes the game's mast
fold land in the right place - see ORIGIN below.

ORIGIN
------
The DRILLING AXIS at ground level, at the rear overhang.  Two reasons, and they
agree:

  * `blender/core_rig.py` uses the same datum and states why: the machine drops
    onto terrain at y = 0 with the hole exactly under the string, so nothing
    needs a fudge offset.
  * The procedural builder this model replaces (`buildSonicTruck` in
    `src/rig/rigFactory.js`) puts its mast at three.js z = 0 and its cab at
    z = -7.6.  Since three_z = -bl_y, its cab is at Blender +Y and its hole at
    the origin - so a drop-in replacement must use the same datum or the collar
    moves the day the model loads.

THE MAST FOLD, AND WHY THE SIGN MATTERS
---------------------------------------
`rigFactory.js` lines 7598-7600: a machine that does not declare its own tilts
gets `workTilt = 0` and `transportTilt = -1.32` rad, and line 9078 lerps
`mastPivot.rotation.x` between them.  So `pivot:mast` MUST be authored VERTICAL
(that is the working pose), and a rotation of -1.32 rad about three.js X lays
the mast top over to three.js -z, which is Blender +Y - forward, over the deck,
towards the cab.  That is exactly how a truck rig travels, and it is the pose
the machine spends most of its life in.  Author it upright, let the game fold it.

THE THREE CONTRACTS (`blender/lib/rig.py`)
------------------------------------------
1. Named nodes survive export.  `core/env.js` reads `mount:`/`aim:` world
   positions EVERY FRAME to re-aim spotlights; `rigFactory.js` looks pivots and
   slides up BY STRING.  This file publishes `pivot:mast`, `slide:carriage`
   (with `travel_m`, which is the property `gltfRig.js` actually reads),
   `pivot:spindle`, `slide:jacks`, `mount:tool`, `mount:hole` and six lamps.
2. Materials are NAMES ONLY - `core/assets.js` generates every texture at
   runtime.  In particular the cab glazing is `MAT_GLASS` and stays OPAQUE:
   `transmission > 0` re-renders the whole opaque list for +65..81 draw calls
   regardless of the pane's size (HANDOFF §8F, found three times in this tree).
3. Statics join by material before export; budget <= 70 draw calls.  Detail
   sharing a material is therefore free in draw calls and costs only triangles,
   which is where this file spends.

SCALE WAS MEASURED, NOT ASSUMED
-------------------------------
`rig.box()` built at half the requested size for a week and two machines were
shipped double-size by workarounds that outlived the bug.  Before a line of this
model was written, a probe box of (4, 2, 10) was built, exported and measured
back off the .glb with `tools/glbinfo.mjs`: bounds gave x 4.000, y 10.000,
z 2.000 and the tube probe 1.000 x 1.000 x 3.000.  `rig.box()` is honest, so
there is NO local compensation anywhere in this file, and there must never be.
"""
import math
import os
import sys

import bpy
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
if os.path.join(HERE, 'lib') not in sys.path:
    sys.path.insert(0, os.path.join(HERE, 'lib'))

from rig import (reset, part, box, tube, hose, empty, worklight, finish,   # noqa: E402
                 NODE_MOUNT, NODE_AIM, NODE_PIVOT, NODE_SLIDE,
                 MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST,
                 MAT_RUBBER, MAT_GLASS, MAT_CHROME, MAT_HAZARD)

TAU = math.pi * 2


# ═════════════════════════════════════════════════════════════════════════════
# LOCAL HELPERS
#
# `lib/rig.py` is owned by another agent and deliberately holds only the
# primitives every machine needs.  Everything below is either shape sugar for
# this machine or one of the three build-order chores (`bake_modifiers`,
# `curves_to_mesh`, `join_under`) that every builder in `blender/` has to do for
# itself.  The chores are the same code as `rc_rig.py`'s, kept in step on
# purpose: each of them exists because of a specific measured failure, recorded
# in the docstring, and a machine that quietly skips one lands over budget or
# loses its bevels.
# ═════════════════════════════════════════════════════════════════════════════
def cone(name, r1, r2, length, mat=MAT_PAINT, parent=None, loc=(0, 0, 0),
         rot=(0, 0, 0), sides=20):
    """Truncated cone along +Z, origin at its base."""
    bpy.ops.mesh.primitive_cone_add(vertices=sides, radius1=r1, radius2=r2,
                                    depth=length)
    o = bpy.context.active_object
    o.data.transform(Matrix.Translation((0, 0, length / 2)))
    return part(name, o, mat, parent, loc, rot)


def torus(name, major, minor, mat=MAT_STEEL, parent=None, loc=(0, 0, 0),
          rot=(0, 0, 0), mseg=16, nseg=8):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=mseg, minor_segments=nseg)
    return part(name, bpy.context.active_object, mat, parent, loc, rot)


def arrayed(obj, count, offset, name='arr'):
    """ARRAY modifier whose `offset` is given in the object's PARENT space.

    The modifier's own `constant_offset_displace` is in the object's LOCAL
    space, so on a rotated object it marches the copies off in a direction the
    caller did not ask for.  `rc_rig.py` records what that costs: an 83-link
    chain laid horizontally across the site because the pins were cylinders
    rotated 90 deg, and a punched guard panel whose second array ran into the
    plate's own thickness.  Converting here means every caller says where it
    wants the copies and gets that, whatever the object's rotation is.
    """
    m = obj.modifiers.new(name, 'ARRAY')
    m.count = count
    m.use_relative_offset = False
    m.use_constant_offset = True
    if obj.rotation_mode == 'QUATERNION':
        rot = obj.rotation_quaternion.to_matrix()
    else:
        rot = obj.rotation_euler.to_matrix()
    m.constant_offset_displace = rot.inverted() @ Vector(offset)
    return m


def strut(name, a, b, size, mat=MAT_DARK, parent=None, bevel=0.006):
    """A square-section member spanning two points, in `parent` space."""
    a, b = Vector(a), Vector(b)
    d = b - a
    o = box(name, (size, size, d.length), mat, parent, tuple((a + b) / 2),
            bevel=bevel)
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    return o


def pipe(name, a, b, radius, mat=MAT_STEEL, parent=None, sides=10):
    """A round member spanning two points - handrails, stays, exhaust runs."""
    a, b = Vector(a), Vector(b)
    d = b - a
    o = tube(name, radius, d.length, mat, parent, tuple(a), sides=sides)
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    return o


def bake_modifiers():
    """Apply every modifier before any join.

    `bpy.ops.object.join()` KEEPS the active object's modifiers and DISCARDS
    the others'.  `finish()` joins by material, so an unbaked BEVEL or ARRAY on
    anything but the first object of a group vanishes silently - and the bevel
    is the whole reason the steel does not read as cardboard.
    """
    bpy.ops.object.select_all(action='DESELECT')
    todo = [o for o in bpy.context.scene.objects
            if o.type == 'MESH' and o.modifiers]
    if not todo:
        return
    # One convert() over the whole selection, not modifier_apply per modifier:
    # each operator call re-evaluates the depsgraph across every object in the
    # scene, which turned a rebuild into a nine-minute wait on rc_rig.
    for o in todo:
        o.select_set(True)
    bpy.context.view_layer.objects.active = todo[0]
    try:
        bpy.ops.object.convert(target='MESH')
    except Exception as exc:                                # pragma: no cover
        print('  ! bulk convert failed (%s), falling back per object' % exc)
        for o in todo:
            bpy.ops.object.select_all(action='DESELECT')
            bpy.context.view_layer.objects.active = o
            o.select_set(True)
            for m in list(o.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=m.name)
                except Exception as e2:
                    print('  ! modifier %s on %s: %s' % (m.name, o.name, e2))
    bpy.ops.object.select_all(action='DESELECT')


def curves_to_mesh(skip=()):
    """Convert hose curves to meshes so they fall into the material join.

    A curve exports as its own primitive - one draw call per hose.  On a sonic
    rig, which wears its hydraulics on the outside, that is not a rounding
    error: this machine carries eighteen of them.
    """
    bpy.ops.object.select_all(action='DESELECT')
    for o in list(bpy.context.scene.objects):
        if o.type != 'CURVE' or o.name in skip:
            continue
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.convert(target='MESH')
        o.select_set(False)


def join_under(node):
    """Collapse one moving assembly to a single mesh per material.

    `finish()` deliberately leaves `pivot:`/`slide:` subtrees alone because they
    have to move independently.  This mast alone is ~180 members; unjoined that
    is ~180 draw calls against a budget of 70.  So each moving assembly is
    joined here by material, keeping the node itself and its child nodes intact.
    """
    bpy.context.view_layer.update()
    kids = []

    def walk(o):
        for c in o.children:
            if c.type == 'MESH':
                kids.append(c)
                walk(c)
            elif not (c.name.startswith(NODE_PIVOT) or c.name.startswith(NODE_SLIDE)):
                walk(c)

    walk(node)
    if not kids:
        return
    groups = {}
    for o in kids:
        key = o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault(key, []).append(o)
    label = node.name.split(':', 1)[-1]
    for key, objs in groups.items():
        for o in objs:
            mw = o.matrix_world.copy()
            o.parent = node
            o.matrix_parent_inverse = Matrix.Identity(4)
            o.matrix_basis = node.matrix_world.inverted() @ mw
        bpy.context.view_layer.update()
        if len(objs) < 2:
            objs[0].name = label + ':' + key
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        bpy.context.active_object.name = label + ':' + key
    bpy.ops.object.select_all(action='DESELECT')
