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
WEB       The carrier hole that §8 item 1 of [REF] opened is now CLOSED by
          published sources, and they are cited in full in the block above the
          constants: [TSI-CT] the Terra Sonic TSi 150CT spec sheet (the only
          truck-mounted sonic rig anywhere that publishes both a dimensioned
          spec and its carrier), [HV607], [INT-BB], [INT-WS], [PB-BB], [MICH],
          [FHWA], [GP], [TSI-TL] and [EIJ].  Read that block before changing
          any dimension in this file.
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
   slides up BY STRING.  This file publishes, in build order:
       pivot:mast          the tilt pin - authored VERTICAL, see THE MAST FOLD
       slide:mast-dump     the 55 in of mast dump the spec sheet publishes
       slide:carriage      with `travel_m`, the one property `gltfRig.js` reads
       pivot:spindle       rotation, three.js Y = Blender Z
       mount:tool          the head's sub face, where the string hangs
       mount:hole          the drilling axis at ground level
       slide:jack-rl/-rr/-fl/-fr
       five lamps, `feed-work-light` FIRST because env.js binds its key light
       to that exact string and falls back to the ORDINAL when it misses.
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


# ═════════════════════════════════════════════════════════════════════════════
# THE CARRIER'S SOURCES.
#
# §8 item 1 of [REF] was blunt: no truck-mounted sonic rig existed anywhere in
# the owner's local library, and every number in [REF] §3 belongs to a compact
# CRAWLER.  That hole is now closed by published web sources, and the machine
# below is built from a real, named, truck-mounted sonic rig rather than from a
# crawler scaled up.  Every figure is cited at the constant.
#
# [TSI-CT] Terra Sonic International TSi 150CT, "compact truck-mounted" sonic
#          rig, spec sheet REV 11/2024,
#          terrasonicinternational.com/wp-content/uploads/2025/04/150CT.pdf.
#          THE PRIMARY SOURCE FOR THIS MODEL.  It is the only truck-mounted
#          sonic rig found anywhere that publishes a full dimensioned spec AND
#          names its carrier: "Design: From Selected Truck Base Model
#          International HV607".
#          KNOWN DEFECTS IN THIS SHEET, recorded so nobody propagates them:
#          (a) the spec table says the mast is "20 ft 1-1/2 in (6.1 m)" and the
#              feature list on the same PDF says "Standard 19 ft 1 in (5.8 m)
#              Long Mast".  The two disagree by a foot.  The spec table is used
#              and the disagreement is recorded, not hidden.
#          (b) several metric conversions on the sheet are wrong - "24 in
#              (618 mm)", "6 in (15.24 mm)", "20 in (6.1 M)".  Where imperial
#              and metric disagree the IMPERIAL figure is the internally
#              consistent one, and this file converts from imperial itself.
# [TSI-T]  Terra Sonic TSi 150T, the larger truck rig, same publisher,
#          .../2025/04/150T_vF.pdf: 8 ft 6 in x 33 ft 10 in x 12 ft 4 in,
#          42,000 lb, 24 ft 5 in stroke, 22,000 lbf pull-back, 50,000 lbf at
#          0-150 Hz.  Used only as a cross-check on the class - see the
#          DATA.JS DISAGREEMENT note at the foot of this block.
# [HV607]  International HV607 spec sheet (gibbstrucks.com/brochures/
#          hv-specsheet-607-06.pdf) and the HV series brochure: "107" BBC /
#          40.3" BA", set-back front axle; frame "11.25" x .5" thick super
#          single rail"; wheelbase options 136-340 in; GVW 68,000 lb (6x4).
# [INT-BB] International MV Series Body Builder Book (bodybuilder.navistar.com,
#          CT471/Series/MV_BB.pdf).  Publishes the INSIDE frame dimension,
#          "33.5 (851) BETWEEN FRAME RAILS", and rail thicknesses 0.312 /
#          0.375 / 0.438 in.
#          CORRECTION TO THE BRIEF THIS FILE WAS WRITTEN FROM: there is NO
#          International "Frame System Overall Width" table.  Full-text
#          searches of the MV, WorkStar and DuraStar body-builder books return
#          nothing of the kind.  The widely quoted 34.25 in is sound ARITHMETIC
#          - 33.5 + 2 x 3/8 - but it is not a published table, and 34.875 in
#          does not correspond to any rail/outsert pair International tabulates.
#          So this file works from the published INSIDE figure outwards.
#          Volvo is the one maker that does publish an overall frame width
#          (Body Builder Instructions §7: rails "1078, 1080, 1082 and 1085 mm
#          (outside edges)" at the front, "848, 850, 852 and 855 mm (inside
#          edges)" to the rear), and Mack states the same splayed shape.
# [INT-WS] International WorkStar Body Builder Book, "TANDEM AXLE FRAME AND
#          BUMP HEIGHT DATA - REAR": axle spacing options 52, 55, 60 in (IROS
#          air spring) and 55, 60 in (Hendrickson HAS).
# [PB-BB]  Peterbilt 2024 HD Body Builder Manual Rev C, Table 3-21 "Axle Width
#          Calculation", drive axles, 11R22.5 dual 4-4 offset: "Track 73.3",
#          Overall Width 97.8"".  The wide-track rows are 79.2 / 103.7 and
#          79.5 / 103.9 - i.e. a wide-track tandem on the same tyre is ALREADY
#          over [FHWA]'s 102 in before any body goes on.  The same manual is
#          the reason the frame-height convention matters: "All heights are
#          given from the bottom of the frame rail", against International's
#          Y = Df + R2 + F, which lands on the TOP.  The two conventions differ
#          by a full rail height, ~10.5 in.
# [MICH]   MICHELIN Truck Tire Data Book, 21st edition
#          (michelinb2b.com/wps/b2bcontent/PDF/Truck_DataBook.pdf), X WORKS Z
#          on/off-road line - the correct family for a drill truck.
#          11R22.5 H: overall diameter 41.8 in / 1,061 mm, LOADED RADIUS
#          19.6 in / 498 mm, overall width 11.3 in / 288 mm.
# [FHWA]   23 CFR 658.15(a): "No State shall impose a width limitation of more
#          or less than 102 inches, or its approximate metric equivalent,
#          2.6 meters (102.36 inches) on a vehicle operating on the National
#          Network".  658.16 lists what is excluded - mirrors, turn signals,
#          cab handholds, spray suppressants, tyre bulge - and says each
#          exclusion "may not be combined with other excluded devices".
# [GP]     Geoprobe sonic tooling pages (geoprobe.com/tooling/sonic-tooling):
#          conventional sonic sampling is sold as 4x6, 6x8 and 8x10 - "a 4 in.
#          core barrel overcased with a 6 in. casing".  Casing sections 120,
#          60, 24, 18, 12 and 6 in.
# [TSI-TL] Terra Sonic tooling catalogue (.../00042_TSi_Tooling_Catalog_Listing
#          _vF.pdf): core barrels 3.75-8 in OD in 5.5 ft and 10.5 ft lengths;
#          casing 4.75-12 in OD in 2, 2.5, 5 and 10 ft and 1.5 and 3 m.  The
#          half-foot offset is deliberate: the barrel leads the casing.
#          Rods and barrels right-hand thread, casing LEFT hand.
# [EIJ]    Royal Eijkelkamp RotoSonic head sheets - the only publisher anywhere
#          that gives a sonic head's MASS: LargeRotoSonic 50K, 227 kN at
#          0-150 Hz, "Mass of head 1,200 kg"; CompactRotoSonic HO, 150 kN,
#          600 kg; SmallRotoSonic, 370 kg.  Two eccentrics, "mechannically
#          synchronized", damper type "air cushion".
#
# THE DATA.JS DISAGREEMENT, MEASURED AND HANDED OVER, NOT PAPERED OVER
# --------------------------------------------------------------------
# `src/game/data.js` gives `sonic-truck` transportTons 18, feedForce 90 kN and
# rodLength 3.0 m.  Against the two published Terra Sonic trucks:
#
#   |            | mass          | pull-back        | tooling section |
#   | [TSI-CT]   | 11.6-15.0 t   | 74.7 kN          | 3 m / 10 ft     |
#   | [TSI-T]    | 19.1 t        | 97.9 kN          | up to 6 m       |
#   | data.js    | 18 t          | 90 kN            | 3.0 m           |
#
# The mass and the pull-back point at the LARGER machine; the tooling length
# points at the smaller one.  This model is built as the 150CT class, because
# that is the machine with a published carrier and a published mast, and
# because `rodLength: 3.0` is the figure the GAME actually simulates with.
# `data.js` is not mine to edit - this is reported, as ASTRA section 10 asks.
#
# THE TRANSPORT TILT IS THE GAME'S, AND IT IS SHALLOWER THAN THE TRADE'S
# ---------------------------------------------------------------------
# `rigFactory.js` line 7599 hands every .glb machine `transportTilt = -1.32`
# rad - 75.6 degrees off vertical, i.e. the mast parked 14.4 degrees above
# horizontal - and `gltfRig.js`'s `makeDyn()` never reads a machine's own
# figure, so a model CANNOT DECLARE ONE.
#
# THE TRANSPORT POSE WAS BUILT AND MEASURED rather than argued about.  Rotating
# `pivot:mast` by -1.32 rad about Blender X (which is exactly what the game does
# - a three.js X rotation and a Blender X rotation are the same rotation under
# three_y = bl_z, three_z = -bl_y) and transforming every vertex gives:
#
#     measured  2.515 W x 8.090 L x 3.912 H
#     [TSI-CT]  2.515 W x 7.010 L x 3.962 H   (8 ft 3 in, 23 ft, 13 ft)
#
# Width exact, height 50 mm under.  So for THIS machine the game's fixed tilt
# happens to land on the published pose, and an earlier draft of this comment
# claiming it could not was REASONING, not measurement - the measurement
# contradicted it and the claim is withdrawn.  The 1.08 m of extra length is the
# mast FOOT, which swings out behind the tailboard as the mast lies down; the
# published 23 ft is evidently measured over the chassis.
#
# What remains true, and is the reason the node carries the extra: a machine has
# no way to state its own transport rake, so the next one whose real pose is not
# 14.4 degrees will be silently wrong.  THE FIX IS TWO LINES in `gltfRig.js`'s
# `makeDyn()`, beside where it already reads `travel_m` off the carriage:
#     const t = mastPivot.userData.transport_tilt_rad;
#     if (typeof t === 'number') dyn.transportTilt = t;
# `pivot:mast` already publishes `transport_tilt_rad`.
# ═════════════════════════════════════════════════════════════════════════════
D2R = math.pi / 180.0
IN = 0.0254             # every imperial figure below is converted HERE, once,
FT = 0.3048             # from the publisher's own imperial - see [TSI-CT](b)


# ── THE RIG, as published [TSI-CT] ───────────────────────────────────────────
WIDTH        = 8 * FT + 3 * IN          # 2.5146 - "Width: 8 ft 3 in (2.5 m)"
LENGTH       = 23 * FT                  # 7.0104 - "Length: 23 ft (7 m)"
H_TRANSPORT  = 13 * FT                  # 3.9624 - "Height: 13 ft (4 m)".  A
                                        # CHECK, not a build constant: this
                                        # model is authored in the WORKING pose
MASS_KG      = 11612                    # "Standard Weight: 25,600 lbs
                                        # (11,612 kg), 33,000 (14,969 kg) with
                                        # options"
MAST_LEN     = 20 * FT + 1.5 * IN       # 6.1341 - "Overall Length: 20 ft
                                        # 1-1/2 in (6.1 m)".  See [TSI-CT](a):
                                        # the same PDF's feature list says
                                        # 19 ft 1 in.  Both recorded.
FEED_STROKE  = 14 * FT + 1 * IN         # 4.2926 - "Head Travel/Stroke:
                                        # 14 ft 1 in (4.3 m)"
MAST_DUMP    = 55 * IN                  # 1.3970 - "Mast Dump: 55 in (1.4 m)".
                                        # A REAL, NAMED, ANIMATABLE FEATURE and
                                        # the reason this machine's geometry
                                        # works at all: the mast slides DOWN its
                                        # tilt frame to drill and UP to travel,
                                        # so the tilt pin sits 1.4 m above the
                                        # mast foot.  See build_mast().
PULLBACK_KN  = 74.7                     # "Pull Back Force: 16,800 lbf"
PULLDOWN_KN  = 50.3                     # "Down Force: 11,300 lbf"
OSC_KN       = 222                      # "Oscillator Force: 50,000 lbf" -
                                        # and [BR] p8 and [TSI-T] agree exactly
OSC_HZ       = 150                      # "Oscillator Frequency: 0 to 150 Hz"
OSC_NM       = 6341                     # "Max Torque (high torque/low speed):
                                        # 4,677 ft-lb (6,341 Nm)"
RPM_MAX      = 62                       # "0-62 rpm"
GROUND_CLEAR = 9.5 * IN                 # 0.2413 - "Ground Clearance: 9.5 in"
JACK_BORE    = 3.5 * IN                 # 0.0889 - "Jacklegs: 3-1/2 in (89 mm)
JACK_STROKE  = 24 * IN                  # x 24 in (618 mm)".  618 mm is one of
                                        # the sheet's bad conversions; 24 in is
                                        # 609.6 mm and that is what is used.

# ── THE CARRIER: International HV607 6x4, named by [TSI-CT] ──────────────────
BBC        = 107 * IN                   # 2.7178 [HV607] "107" BBC"
BA         = 40.3 * IN                  # 1.0236 [HV607] "40.3" BA" - bumper to
                                        # the SET-BACK front axle
RAIL_H     = 11.25 * IN                 # 0.2858 [HV607] "11.25" x .5" thick
RAIL_T     = 0.5 * IN                   # 0.0127  super single rail"
RAIL_IN    = 0.851                      # [INT-BB] "33.5 (851) BETWEEN FRAME
                                        # RAILS" - the published INSIDE figure
RAIL_W_OUT = RAIL_IN + 2 * RAIL_T       # [D] 0.8764 = 34.5 in.  Arithmetic on a
                                        # published inside dimension, which is
                                        # the only honest route - see [INT-BB].
RAIL_X     = RAIL_IN / 2 + RAIL_T / 2   # [D] 0.4319, rail centreline
RAIL_BOT   = 0.800    # NOT SOURCED, and this is the one place the model has to
                      # solve rather than cite.  The only published frame height
                      # in reach ([INT-BB], loaded rear 32.02 in = 813 mm to the
                      # TOP of the rail) is a MEDIUM-duty MV figure: put the
                      # HV607's 11.25 in rail under it and the rail BOTTOM lands
                      # 30 mm above the axle centreline, which cannot be built.
                      # The MV figure belongs to a smaller-tyred truck and is
                      # recorded rather than transplanted.  800 mm is what
                      # clears a drive axle housing and its spring pack over a
                      # 498 mm loaded radius.
RAIL_TOP   = RAIL_BOT + RAIL_H          # [D] 1.0858

# ── RUNNING GEAR ─────────────────────────────────────────────────────────────
TYRE_OD    = 1.061    # [MICH] 11R22.5 X WORKS Z, "Overall Diameter 41.8 in /
                      # 1,061 mm" - the tyre's identity
LOADED_R   = 0.498    # [MICH] "Loaded Radius 19.6 in / 498 mm".  THE WHEEL
                      # CENTRE SITS AT THE LOADED RADIUS, not at half the
                      # overall diameter: the 63 mm difference is deflection
                      # under load, a cylinder cannot show it, and drawing the
                      # tyre at OD/2 about a loaded axle centre would bury
                      # 32 mm of the machine below z = 0.  So the tyre is drawn
                      # at the loaded radius and stands exactly on the ground.
TYRE_W     = 0.288    # [MICH] "Overall Width 11.3 in / 288 mm"
RIM_D      = 22.5 * IN                  # 0.5715 from the size code
TRACK      = 73.3 * IN                  # 1.8618 [PB-BB] Table 3-21, 11R22.5
                                        # dual 4-4 offset, "Track 73.3""
OVER_TYRES = 97.8 * IN                  # 2.4841 [PB-BB], same row.  Inside
                                        # [FHWA]'s 102 in AND inside [TSI-CT]'s
                                        # published 8 ft 3 in body width.
TANDEM     = 55 * IN                    # 1.3970 [INT-WS] - International's own
                                        # tandem spacing option.  PACCAR's
                                        # equivalent is 52/54 in; both are real
                                        # and the carrier here is an
                                        # International, so 55 is the one used.
DUAL_OX    = OVER_TYRES / 2 - TYRE_W / 2        # [D] 1.0981 outer tyre centre
DUAL_IX    = TRACK - DUAL_OX                    # [D] 0.7637 inner tyre centre
DUAL_SPACE = DUAL_OX - DUAL_IX                  # [D] 0.3344 - SOLVED from two
                                        # published figures (track and overall
                                        # width over the same tyre) instead of
                                        # being invented, which is what the
                                        # first draft of this file had to do.
DIFF_R     = LOADED_R - GROUND_CLEAR    # [D] 0.2567 - the drive head is the
                                        # lowest thing on the truck, so
                                        # [TSI-CT]'s published 9.5 in of ground
                                        # clearance SIZES it

# ── STATIONS ALONG THE TRUCK.  y = 0 is the drilling axis, at the tail. ──────
BUMPER_Y   = LENGTH                             # 7.0104
AXLE_F     = BUMPER_Y - BA                      # [D] 5.9868
CAB_Y0     = BUMPER_Y - BBC                     # [D] 4.2926, back of cab
AXLE_R2    = 1.600    # [D] rearmost drive axle.  SOLVED backwards from the
                      # drilling station: the rear tyre's aft face has to clear
                      # the mast box (y 0.230..0.650) and the man working at the
                      # clamp.  1.600 - 0.498 = 1.102 leaves 0.45 m.
AXLE_R1    = AXLE_R2 + TANDEM                   # [D] 2.9970
TANDEM_CTR = (AXLE_R1 + AXLE_R2) / 2            # [D] 2.2985
WHEELBASE  = AXLE_F - TANDEM_CTR                # [D] 3.688 = 145.2 in, inside
                                        # [HV607]'s published 136-340 in range
CA         = CAB_Y0 - TANDEM_CTR                # [D] 1.994 = 78.5 in
AF         = TANDEM_CTR - 0.100                 # [D] 2.199 = 86.6 in of frame
                                        # behind the tandem - a long overhang,
                                        # which is what a rig that drills off
                                        # its own tail is

# ── SUB-FRAME AND DECK ───────────────────────────────────────────────────────
SUBFR_H    = 0.150    # NOT SOURCED.  [VDB] (A.P. van den Berg's CPT truck, read
                      # into this repo by `blender/cpt_unit.py` [V3]) says in as
                      # many words that a geotechnical truck's frame is
                      # "reinforced with a subframe to take the CPT forces"; no
                      # depth is published by anyone.  A sonic head is a 150 Hz
                      # vibration source bolted to a road chassis and this box
                      # is the only thing between them.
DECK_PLATE = 0.022    # [D] chequer plate on bearers
DECK_Z     = RAIL_TOP + SUBFR_H + DECK_PLATE    # [D] 1.2578
BODY_W     = 2.500    # [D] inside [TSI-CT]'s published 2.5146 over the body,
                      # and clear of the 2.4841 over the tyres [PB-BB]
DECK_X     = BODY_W / 2                         # 1.250
DECK_Y0    = 0.950    # [D] the deck plate stops clear of the mast box and the
                      # dump frame; behind it is the drilling station
DECK_Y1    = CAB_Y0                             # 4.2926
MIRROR_X   = WIDTH / 2                  # 1.2573.  [FHWA] 658.16 excludes
                      # mirrors from the 102 in limit, so a real truck spends
                      # its mirrors OUTSIDE the body - but [TSI-CT] publishes
                      # 8 ft 3 in as this machine's width, and a model whose own
                      # bounding box exceeds the width it claims is a model
                      # somebody will file a bug against (ASTRA section 5).  The
                      # mirrors therefore land exactly ON the published width,
                      # and `tools/glbinfo.mjs` should read 2.515.
CAB_W      = 2.300    # NOT SOURCED.  No US truck maker publishes an exterior
CAB_ROOF   = 3.020    # cab width or a day-cab roof height in anything
CAB_FLOOR  = RAIL_TOP + 0.240                   # reachable; the search for one
HOOD_TOP   = 2.020    # came back empty across International, Peterbilt, Mack,
                      # Freightliner and Western Star.  Peterbilt's "95"
                      # Overall Roof Height" for a 567 UltraLow day cab is the
                      # nearest published figure and it is measured from the
                      # frame, not the ground.  All three are flagged.
CAB_Y1     = CAB_Y0 + 1.300                     # [D] firewall
HOOD_Y1    = BUMPER_Y - 0.150                   # [D] nose of the hood
HOOD_W     = 2.000    # [D] a conventional's bonnet is NARROWER than its cab and
                      # its fenders stand proud of the bonnet - that step is
                      # most of what makes a truck read as a truck rather than
                      # as a box, and the first render of this file had the two
                      # the same width and looked like a shipping container.
FENDER_X   = 1.075    # [D] over the steer tyre at DUAL_OX = 1.098, and held
                      # inside the published half-width of 1.257

# ── MAST ─────────────────────────────────────────────────────────────────────
MAST_W     = 0.700    # NOT SOURCED - [REF] section 8.5 records that no mast
MAST_D     = 0.420    # cross-section is published for this class anywhere, and
                      # nothing found since changes that.  Sized from what has
                      # to fit: the head is 0.769 wide and [REF] section 5.3
                      # requires the head to read WIDER than the mast it rides.
MAST_FOOT_Z = 0.880   # [D] the mast foot, DUMPED - i.e. the working pose.  The
                      # clamp table sits 0.30 m above it at 1.18 m, which is
                      # waist height for the man standing at the string on the
                      # ground, which is exactly what [BR] p7 photographs.
MAST_TILT_Z = MAST_FOOT_Z + MAST_DUMP           # [D] 2.277 - THE TILT PIN.
                      # This is the geometry [TSI-CT]'s published 55 in of mast
                      # dump buys: the pin can sit 1.4 m ABOVE the mast foot, so
                      # the mast folds from high up and lands over the cab roof
                      # instead of through it.  Without the dump there is no
                      # arrangement of a 6.13 m mast on a 7.01 m truck that
                      # folds at the game's -1.32 rad without hitting the cab.
MAST_Y     = 0.440    # [D] the mast BOX stands 440 mm forward of the drilling
                      # axis: the head that rides its aft face is HEAD_D/2 =
                      # 0.230 deep and the mast is MAST_D/2 = 0.210, and
                      # 0.230 + 0.210 = 0.440 exactly.  The string runs down
                      # clear behind the mast, where every photograph in [REF]
                      # section 7 puts it.
CROWN_H    = 0.300    # [D] the head block above the mast columns
WORK_H     = MAST_FOOT_Z + MAST_LEN + CROWN_H   # [D] 7.314 m, mast vertical
TRANSPORT_TILT = -1.32                          # rad, `rigFactory.js` line 7599
CARR_Z0    = MAST_FOOT_Z + 1.100                # [D] 1.980 - bottom of travel:
                      # the head's sub face clears the clamp jaws and the
                      # breakout table below it
CARR_Z1    = CARR_Z0 + FEED_STROKE              # [D] 6.273, and the mast top is
                      # at 7.014, so the carriage stops 0.74 m short of the
                      # crown - [REF] section 4.5 requires it to stop well short
                      # of BOTH ends.  Stroke/mast here is 4.293/6.134 = 0.700
                      # against [GEO]'s 3.600/6.200 = 0.581 for the compact
                      # crawler: a truck rig uses more of its mast, and that is
                      # a real published difference between the two carriers,
                      # not a liberty.
CRADLE_Y   = 5.020    # [D] where the folded mast tip comes down - worked in
                      # build_mast()'s docstring, and it lands on the cab roof,
                      # which is where a compact truck rig's mast rest is.

# ── THE HEAD.  The one part of this machine that says "sonic". ───────────────
# [REF] section 8 item 4: no source gives the oscillator housing's height, width
# or depth in millimetres, and the web search did not find one either - [EIJ] is
# the only publisher that gives a head's MASS and it publishes no dimensions.
# What [BR] p2 does give is two RATIOS off a labelled render: the housing is
# about 2.2x as wide as it is tall, and the drill pipe below it is about 0.13x
# the housing width.  So the head is not guessed - it is SOLVED from the one
# absolute this machine has: `data.js` ships a 100 mm sonic core barrel.
CORE_OD    = 0.100    # [DATA] `sonic-core-barrel-100`, 100 mm x 3 m.  [GP] and
                      # [TSI-TL] both sell the class as pairs - 4x6, 6x8, 8x10 -
                      # so a 100 mm barrel inside a 150 mm casing is a real
                      # pairing at the small end, near [GP]'s 4 in x 6 in.
CASE_OD    = 0.150    # [DATA] `sonic-casing-150`, 150 mm x 3 m
ROD_OD     = 0.0889   # [DATA] `sonic-rod-89`, 88.9 mm x 3 m
TOOL_LEN   = 3.000    # [DATA] `rodLength: 3.0`; [TSI-TL] sells casing in 10 ft
                      # and 3 m, and core barrels at 10.5 ft so the barrel LEADS
                      # the casing - the half-foot offset is deliberate.
HEAD_W     = CORE_OD / 0.13                     # [D] 0.769 from [BR] p2's ratio
HEAD_H     = HEAD_W / 2.2                       # [D] 0.350, the same render
HEAD_D     = 0.460    # [D] deep enough to carry two eccentrics side by side
ECC_R      = HEAD_W / 4.0 - 0.015               # [D] 0.177 - [BR] p2: the two
                      # bearing bosses NEARLY TOUCH at the centreline
HEAD_MASS  = 1200     # [EIJ] LargeRotoSonic 50K, "Mass of head 1,200 kg" - the
                      # same 227 kN / 0-150 Hz class as the head on this rig.
                      # [BR]'s 520 kg is the Toa Tone SP-50, a 65 kN head, and
                      # is NOT the right figure for a 222 kN machine.
AIR_MPA    = 0.7      # [BR] p5, p6 air damper; [EIJ] independently gives the
                      # damper type as "air cushion".  It is what isolates the
                      # resonance from the mast, so it is a real vessel.

# ── JACKS ────────────────────────────────────────────────────────────────────
# [REF] section 4.5: at working extension the chrome is out roughly half to
# two-thirds of stroke, because the machine is LEVELLED, not jacked clear - and
# the feet stand on timber cribbing, which is drawn.
JACK_X     = 1.040    # [D] SOLVED so the pads and their cribbing do NOT set
                      # the model's width: JACK_X + JACK_PAD_R = 1.230 against
                      # a published half-width of 1.257.  The first build of
                      # this file put the cribbing at 1.340 and the export came
                      # back 2.680 wide against a claimed 2.515 - measured, not
                      # reasoned (ASTRA section 5).
JACK_YR    = 0.560    # [D] right at the tail, behind the tandem, under the mast
JACK_YF    = 3.900    # [D] ahead of the tandem, under the front of the deck
JACK_PAD_R = 0.190    # NOT SOURCED for a sonic rig.  No sonic brochure
                      # publishes a pad.  [TSI-CT] publishes the CYLINDER
                      # (JACK_BORE x JACK_STROKE) and nothing else.
CRIB_W     = 0.520    # [D] two timber baulks under each pad, [BR] p3


def ram(name, a, b, parent=None, barrel_r=0.055, rod_r=0.032, ext=0.58,
        mat_b=MAT_DARK):
    """A hydraulic cylinder drawn between two points: barrel, bare chrome rod,
    gland nut.

    `ext` is the fraction of the span the BARREL covers, so the chrome that
    shows is the stroke that is actually out.  [REF] section 4.5: a jack sitting
    fully closed and a jack sitting fully open both read as wrong - a levelled
    machine has the rod out roughly half to two-thirds.
    """
    a, b = Vector(a), Vector(b)
    mid = a + (b - a) * ext
    return [
        pipe(name + '_rod', a, b, rod_r, MAT_CHROME, parent, sides=8),
        pipe(name + '_barrel', a, mid, barrel_r, mat_b, parent, sides=10),
        pipe(name + '_gland', mid, mid + (b - a).normalized() * 0.045,
             barrel_r * 1.14, MAT_WORN, parent, sides=10),
    ]


def wheel(name, cx, y, parent=None, sides=16):
    """One road wheel: tyre, rim face, hub.  Axis along X, centred on `cx`, and
    standing on the ground at its LOADED radius (see LOADED_R).

    `tube()` builds along +Z from its own base, so the wheel is turned a quarter
    about Y and then set BACK by half its width - a tyre placed at its own
    centre would sit a full section width outboard of where it was asked for,
    which is the class of error that put four 7.3 m wheels on the tunnel jumbo
    (`research/rigs/_model-critique.md` section 3.3).
    """
    s = 1.0 if cx >= 0 else -1.0
    x0 = cx - s * TYRE_W / 2
    rot = (0, math.pi / 2 * s, 0)
    z = LOADED_R
    return [
        tube(name + '_tyre', LOADED_R, TYRE_W, MAT_RUBBER, parent, (x0, y, z),
             rot, sides),
        tube(name + '_rim', RIM_D / 2, TYRE_W * 0.34, MAT_WORN, parent,
             (x0 + s * TYRE_W * 0.60, y, z), rot, sides),
        tube(name + '_hub', 0.110, TYRE_W * 0.22, MAT_CAST, parent,
             (x0 + s * TYRE_W * 0.80, y, z), rot, 10),
    ]


# ═════════════════════════════════════════════════════════════════════════════
# 1 - THE CHASSIS.  Two rails, crossmembers, and the sub-frame that stands
#     between a 150 Hz vibration source and a road truck.
# ═════════════════════════════════════════════════════════════════════════════
def build_chassis():
    zc = RAIL_BOT + RAIL_H / 2
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        x = s * RAIL_X
        # A C-section, drawn as a web plus two flanges rather than a solid bar:
        # a truck frame seen from outside is a flat plate with a lip top and
        # bottom, and the lip is what catches light along the whole 7 m.
        box('rail_web_%s' % side, (RAIL_T, LENGTH - 0.16, RAIL_H), MAT_DARK,
            None, (x, 0.100 + (LENGTH - 0.16) / 2, zc), bevel=0.0)
        for k, dz in ((0, RAIL_H / 2 - 0.026), (1, -RAIL_H / 2 + 0.026)):
            box('rail_fl%d_%s' % (k, side), (0.090, LENGTH - 0.16, 0.016),
                MAT_DARK, None,
                (x - s * 0.042, 0.100 + (LENGTH - 0.16) / 2, zc + dz),
                bevel=0.0)
    for i, y in enumerate((0.24, 1.05, AXLE_R2, AXLE_R1, 3.55, 4.35, 5.20,
                           AXLE_F, 6.70)):
        box('xmem%d' % i, (RAIL_IN, 0.070, RAIL_H * 0.78), MAT_DARK, None,
            (0, y, zc), bevel=0.004)
    box('bumper', (2.180, 0.085, 0.230), MAT_DARK, None,
        (0, BUMPER_Y - 0.043, RAIL_BOT - 0.150), bevel=0.012)
    box('rear_bar', (BODY_W - 0.36, 0.085, 0.170), MAT_DARK, None,
        (0, -0.140, RAIL_BOT - 0.120), bevel=0.010)

    # ── the sub-frame: two deep longitudinals outboard of the rails, closed by
    # bearers, carrying the deck, the jacks and the mast tilt frame.
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        box('sub_long_%s' % side, (0.070, DECK_Y1 + 0.55, SUBFR_H), MAT_DARK,
            None, (s * (RAIL_X + 0.11), (DECK_Y1 + 0.55) / 2 - 0.180,
                   RAIL_TOP + SUBFR_H / 2), bevel=0.006)
    n = 9
    for i in range(n):
        y = -0.100 + i * (DECK_Y1 + 0.30) / (n - 1.0)
        box('sub_bear%d' % i, (BODY_W - 0.12, 0.055, SUBFR_H * 0.60), MAT_DARK,
            None, (0, y, RAIL_TOP + SUBFR_H * 0.70), bevel=0.0)
    # the mast bolster: the one member the whole machine hangs off
    box('bolster', (BODY_W - 0.10, 0.280, SUBFR_H + 0.16), MAT_PAINT, None,
        (0, 0.290, RAIL_TOP + SUBFR_H / 2 + 0.020), bevel=0.014)


# ═════════════════════════════════════════════════════════════════════════════
# 2 - RUNNING GEAR.  6x4: set-back steer axle, tandem drive on duals.
# ═════════════════════════════════════════════════════════════════════════════
def build_running_gear():
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        wheel('w_f_%s' % side, s * DUAL_OX, AXLE_F)
        # THE DUALS ARE WHAT DECIDE WHETHER THIS MACHINE IS LEGAL, not the body
        # ([PB-BB]: the wide-track version of this very tyre is 103.7 in, over
        # [FHWA]'s 102 before anything is bolted on).
        for k, ay in ((1, AXLE_R1), (2, AXLE_R2)):
            wheel('w_r%d_o_%s' % (k, side), s * DUAL_OX, ay)
            wheel('w_r%d_i_%s' % (k, side), s * DUAL_IX, ay)
    tube('axle_f', 0.058, DUAL_OX * 2, MAT_WORN, None,
         (-DUAL_OX, AXLE_F, LOADED_R), (0, math.pi / 2, 0), 10)
    for k, ay in ((1, AXLE_R1), (2, AXLE_R2)):
        tube('axle_r%d' % k, 0.068, DUAL_OX * 2, MAT_WORN, None,
             (-DUAL_OX, ay, LOADED_R), (0, math.pi / 2, 0), 10)
        # the drive head, SIZED BY [TSI-CT]'s published 9.5 in ground clearance
        tube('diff%d' % k, DIFF_R, 0.360, MAT_CAST, None,
             (-0.180, ay, LOADED_R), (0, math.pi / 2, 0), 14)
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        box('spring_f_%s' % side, (0.090, 1.35, 0.070), MAT_WORN, None,
            (s * RAIL_X, AXLE_F, LOADED_R + 0.240), bevel=0.0)
        box('spring_r_%s' % side, (0.110, TANDEM + 0.80, 0.086), MAT_WORN,
            None, (s * RAIL_X, TANDEM_CTR, LOADED_R + 0.250), bevel=0.0)
        # NO rear mudguard: the deck itself is the guard over the tandem,
        # 260 mm clear of a tyre whose top is at 0.996.  A separate arch under
        # it would be a part that does not exist on the real vehicle.
        box('flap_%s' % side, (0.520, 0.018, 0.550), MAT_RUBBER, None,
            (s * (DUAL_OX + DUAL_IX) / 2, AXLE_R2 - 0.720, 0.575), bevel=0.0)
        # NO front wing here: `build_cab()` carries the fender, because on a
        # conventional the fender is part of the BONNET assembly and tips
        # forward with it, not part of the chassis.


# ═════════════════════════════════════════════════════════════════════════════
# 3 - CAB.  A conventional set-back-axle day cab, and the reason this rig reads
#     road-legal from 200 m when nothing else in the fleet does.
# ═════════════════════════════════════════════════════════════════════════════
def build_cab():
    cw = CAB_W
    cy = (CAB_Y0 + CAB_Y1) / 2
    ch = CAB_ROOF - CAB_FLOOR
    box('cab_shell', (cw, CAB_Y1 - CAB_Y0, ch), MAT_PAINT, None,
        (0, cy, CAB_FLOOR + ch / 2), bevel=0.045)
    # THE GLAZING IS OPAQUE.  `MAT_GLASS` and NOTHING ELSE: transmission > 0
    # re-renders the entire opaque list for +65..81 draw calls whatever the
    # pane's size, and this tree has been bitten by that three times (ASTRA
    # section 3.3).  One cab window once doubled the whole fleet's cost.
    box('cab_screen', (cw - 0.22, 0.030, 0.740), MAT_GLASS, None,
        (0, CAB_Y1 - 0.028, CAB_ROOF - 0.470), (-0.16, 0, 0), bevel=0.0)
    box('cab_rear_gl', (cw - 0.62, 0.026, 0.400), MAT_GLASS, None,
        (0, CAB_Y0 + 0.018, CAB_ROOF - 0.480), bevel=0.0)
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        box('cab_door_gl_%s' % side, (0.026, 0.760, 0.540), MAT_GLASS, None,
            (s * (cw / 2 - 0.011), cy + 0.10, CAB_ROOF - 0.430), bevel=0.0)
        box('cab_door_%s' % side, (0.012, 0.880, ch - 0.30), MAT_PAINT, None,
            (s * (cw / 2 + 0.004), cy + 0.08, CAB_FLOOR + ch / 2 - 0.10),
            bevel=0.006)
        pipe('cab_grab_%s' % side, (s * (cw / 2 + 0.030), cy - 0.36,
                                    CAB_FLOOR + 0.10),
             (s * (cw / 2 + 0.030), cy - 0.36, CAB_FLOOR + 0.72), 0.014,
             MAT_WORN, None, sides=6)
        # mirror arm and head - landing ON [TSI-CT]'s published width
        pipe('mirror_arm_%s' % side,
             (s * (cw / 2 - 0.02), CAB_Y1 - 0.10, CAB_ROOF - 0.28),
             (s * (MIRROR_X - 0.016), CAB_Y1 - 0.06, CAB_ROOF - 0.34), 0.016,
             MAT_DARK, None, sides=6)
        box('mirror_%s' % side, (0.028, 0.130, 0.420), MAT_DARK, None,
            (s * (MIRROR_X - 0.014), CAB_Y1 - 0.06, CAB_ROOF - 0.62),
            bevel=0.008)
        for k in range(2):
            box('step_%s%d' % (side, k), (0.180, 0.300, 0.020), MAT_WORN, None,
                (s * (cw / 2 - 0.05), cy + 0.02, CAB_FLOOR - 0.26 - k * 0.28),
                bevel=0.0)
    # sun visor over the screen - a cheap box, and the one detail that stops a
    # day cab reading as a packing case in a three-quarter view
    box('cab_visor', (cw - 0.06, 0.220, 0.045), MAT_PAINT, None,
        (0, CAB_Y1 + 0.060, CAB_ROOF - 0.055), (-0.20, 0, 0), bevel=0.010)

    # ── the bonnet.  NARROWER than the cab (HOOD_W), with a 70 mm cowl gap at
    # the firewall and fenders standing proud of it over the steer tyres.
    hy = (CAB_Y1 + 0.070 + HOOD_Y1) / 2
    hz0 = CAB_FLOOR - 0.190
    box('hood', (HOOD_W, HOOD_Y1 - CAB_Y1 - 0.070, HOOD_TOP - hz0), MAT_PAINT,
        None, (0, hy, (HOOD_TOP + hz0) / 2), bevel=0.070)
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        box('fender_%s' % side, (0.350, 1.180, 0.030), MAT_PAINT, None,
            (s * FENDER_X, AXLE_F, 1.060), bevel=0.010)
        box('fender_sk_%s' % side, (0.026, 1.180, 0.230), MAT_PAINT, None,
            (s * (FENDER_X + 0.162), AXLE_F, 1.170), bevel=0.008)
        # the step into the cab, hung off the fender bracket
        box('cabstep_%s' % side, (0.300, 0.320, 0.024), MAT_WORN, None,
            (s * 1.100, CAB_Y1 - 0.360, 0.780), bevel=0.0)
    box('grille', (HOOD_W - 0.36, 0.040, 0.560), MAT_WORN, None,
        (0, HOOD_Y1 - 0.010, RAIL_TOP + 0.520), bevel=0.010)
    for s in (-1, 1):
        box('lamp_f_%s' % ('l' if s < 0 else 'r'), (0.230, 0.050, 0.170),
            MAT_GLASS, None,
            (s * (HOOD_W / 2 - 0.16), HOOD_Y1 - 0.010, RAIL_TOP + 0.090),
            bevel=0.006)
    # exhaust stack and heat shield behind the cab, kerb side
    pipe('stack', (1.11, CAB_Y0 + 0.16, RAIL_TOP), (1.11, CAB_Y0 + 0.16, 3.46),
         0.056, MAT_CHROME, None, sides=10)
    box('stack_hs', (0.145, 0.145, 0.880), MAT_WORN, None,
        (1.11, CAB_Y0 + 0.16, RAIL_TOP + 0.560), bevel=0.008)
    # the orange rotating beacon - [REF] section 4.5 records it on every one of
    # these machines, and on a road-going rig it is a legal fitting.
    tube('beacon_base', 0.052, 0.070, MAT_DARK, None,
         (-0.52, CAB_Y0 + 0.28, CAB_ROOF), sides=8)
    tube('beacon', 0.060, 0.110, MAT_HAZARD, None,
         (-0.52, CAB_Y0 + 0.28, CAB_ROOF + 0.070), sides=8)
    # fuel tank and battery box under the cab step
    tube('fuel_tank', 0.235, 1.020, MAT_CHROME, None,
         (-0.98, CAB_Y0 - 0.12, RAIL_BOT - 0.020), (math.pi / 2, 0, 0), 14)
    box('batt_box', (0.340, 0.560, 0.380), MAT_DARK, None,
        (1.02, CAB_Y0 - 0.55, RAIL_BOT + 0.020), bevel=0.014)
    tube('air_tank', 0.128, 0.560, MAT_WORN, None,
         (1.02, CAB_Y0 - 1.20, RAIL_BOT - 0.060), (math.pi / 2, 0, 0), 10)

    # THE MAST REST, on the cab roof.  This is where the folded mast lands - see
    # build_mast()'s docstring for the arithmetic - and a compact truck rig
    # carries its rest exactly here, above the cab, not on the deck.
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        pipe('rest_leg_%s' % side, (s * 0.44, CRADLE_Y, CAB_ROOF - 0.02),
             (s * 0.40, CRADLE_Y, CAB_ROOF + 0.190), 0.040, MAT_PAINT, None,
             sides=8)
        box('rest_v_%s' % side, (0.065, 0.160, 0.240), MAT_PAINT, None,
            (s * 0.40, CRADLE_Y, CAB_ROOF + 0.300), (0, s * 0.40, 0),
            bevel=0.010)
    box('rest_beam', (0.900, 0.110, 0.080), MAT_PAINT, None,
        (0, CRADLE_Y, CAB_ROOF + 0.190), bevel=0.010)
    box('rest_pad', (0.760, 0.140, 0.045), MAT_RUBBER, None,
        (0, CRADLE_Y, CAB_ROOF + 0.252), bevel=0.0)


# ═════════════════════════════════════════════════════════════════════════════
# 4 - THE DECK.  3.34 m of it, between the drilling station and the cab.
#
#     [REF] section 4.5 is explicit that a perimeter walkway and a handrail are
#     WRONG on the compact crawler and belong to "a big truck rig" - which is
#     this machine.  So it gets both, and the crawler's absence of them stays
#     the crawler's.
#
#     Everything on the deck lives UNDER THE FOLDED MAST.  The folded underside
#     is z = 1.948 + 0.2562 y (worked in build_mast), so the headroom over the
#     deck runs from 0.93 m at the tail to 1.79 m at the cab.  Nothing here is
#     taller than that, and each item is checked against it where it stands.
# ═════════════════════════════════════════════════════════════════════════════
def build_deck():
    dl = DECK_Y1 - DECK_Y0
    box('deck_plate', (BODY_W, dl, DECK_PLATE), MAT_WORN, None,
        (0, (DECK_Y0 + DECK_Y1) / 2, DECK_Z - DECK_PLATE / 2), bevel=0.0)
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        box('toe_%s' % side, (0.020, dl, 0.120), MAT_HAZARD, None,
            (s * (DECK_X - 0.010), (DECK_Y0 + DECK_Y1) / 2, DECK_Z + 0.060),
            bevel=0.0)
        for i in range(4):
            y = DECK_Y0 + 0.30 + i * (dl - 0.60) / 3.0
            pipe('stanch_%s%d' % (side, i), (s * (DECK_X - 0.045), y, DECK_Z),
                 (s * (DECK_X - 0.045), y, DECK_Z + 1.020), 0.018, MAT_PAINT,
                 None, sides=6)
        for k, dz in ((0, 1.020), (1, 0.520)):
            pipe('rail_%s%d' % (side, k),
                 (s * (DECK_X - 0.045), DECK_Y0 + 0.26, DECK_Z + dz),
                 (s * (DECK_X - 0.045), DECK_Y1 - 0.26, DECK_Z + dz), 0.018,
                 MAT_PAINT, None, sides=6)
    box('headboard', (BODY_W, 0.055, 0.960), MAT_PAINT, None,
        (0, DECK_Y1 - 0.028, DECK_Z + 0.480), bevel=0.010)

    # ── TOOLING RACKS.  THE SINGLE MOST RECOGNISABLE SONIC TELL there is: a
    # sonic rig ALWAYS carries two diameters, because the cycle is core barrel
    # first and override casing driven down around it ([SLO] Phase I/II; [GP]
    # "a 4 in. core barrel overcased with a 6 in. casing"; [REF] section 9.3).
    # Drawing one diameter is the commonest way to get this machine wrong, and
    # the shipping procedural builder does exactly that - `buildRodRack` at
    # r 0.055 and `buildCarousel` at rodDia 0.089, which do not even agree with
    # each other.  Here it is 150 mm casing on the left and 100 mm barrels on
    # the right, straight off `data.js`.
    # The rack x-stations are SOLVED against the published body half-width
    # (1.257): the widest bunk reaches 1.229 and the widest tube 1.163.
    for k, (x, od, n, tag) in enumerate((
            (-0.80, CASE_OD, 4, 'case'), (0.82, CORE_OD, 5, 'core'))):
        for r in range(2):
            for c in range(n):
                cx = x + (c - (n - 1) / 2.0) * (od + 0.042)
                tube('%s_%d_%d' % (tag, r, c), od / 2, TOOL_LEN, MAT_WORN,
                     None, (cx, 0.720, DECK_Z + 0.070 + r * (od + 0.028)),
                     (-math.pi / 2, 0, 0), 10)
        for e in range(2):
            box('%s_bunk%d' % (tag, e), (n * (od + 0.042) + 0.09, 0.065,
                                         0.215), MAT_PAINT, None,
                (x, 0.840 + e * (TOOL_LEN - 0.26), DECK_Z + 0.108),
                bevel=0.008)
        # the rear bunk overhangs the deck plate onto a bracket off the
        # sub-frame: a 3.00 m section [DATA] does not fit inside 3.34 m of deck
        # with the power pack on the same floor, and every truck rig in the
        # class carries its tubes proud of the tailboard for the same reason.
        box('%s_bkt' % tag, (n * (od + 0.042) + 0.09, 0.055, 0.055),
            MAT_DARK, None, (x, 0.840, DECK_Z - 0.055), bevel=0.0)

    # ── core boxes on the centreline.  The PRODUCT of this machine is
    # continuous core in a plastic sleeve ([BR] p2; [SLO]); a sonic rig carrying
    # no core boxes is a sonic rig with nowhere to put what it came for.
    for i in range(2):
        box('corebox%d' % i, (0.330, 1.060, 0.140), MAT_PAINT, None,
            (0, 2.050, DECK_Z + 0.075 + i * 0.150), bevel=0.010)

    # ── the power pack: hydraulic tank, cooler and control cabinet, in a
    # slim full-width enclosure against the headboard.  Top lands at 2.158
    # against a folded-mast underside of 2.988 here.
    # WHETHER THIS CLASS CARRIES ITS OWN DECK ENGINE OR RUNS OFF THE TRUCK IS
    # **NOT SOURCED**.  [TSI-CT] names the truck base model and publishes no
    # engine at all; [TSI]'s crawler sister publishes 180 kW Stage V; `data.js`
    # asserts 168 kW.  So the enclosure is drawn as the hydraulics and the
    # cabinet, which are certainly there, and no engine is claimed.
    box('pack', (1.900, 0.420, 0.900), MAT_PAINT, None,
        (0, 4.060, DECK_Z + 0.450), bevel=0.024)
    for i in range(6):
        box('pack_louv%d' % i, (1.600, 0.020, 0.034), MAT_DARK, None,
            (0, 3.845, DECK_Z + 0.200 + i * 0.100), bevel=0.0)
    tube('pack_stack', 0.044, 0.400, MAT_WORN, None,
         (0.620, 4.060, DECK_Z + 0.900), sides=8)

    # ── water for the swivel, slung under the deck.  SMALL on purpose: sonic is
    # the low-flush method and in many soils uses none at all ([BR] p2; [SLO]).
    # A mud tank on this machine would be a different trade's rig.
    tube('water_tank', 0.185, 0.900, MAT_PAINT, None,
         (-1.02, 2.400, RAIL_TOP - 0.030), (-math.pi / 2, 0, 0), 12)
    box('locker_r', (0.150, 0.900, 0.440), MAT_PAINT, None,
        (DECK_X - 0.075, 2.850, RAIL_TOP - 0.040), bevel=0.012)
    box('locker_hdl', (0.028, 0.110, 0.028), MAT_WORN, None,
        (DECK_X - 0.014, 2.850, RAIL_TOP - 0.040), bevel=0.0)
    # air reel for the damper line.  [BR] p5, p6: 0.7 MPa on a minimum of
    # 8 l/min, so there is a real air line on this machine.
    tube('reel_hub', 0.070, 0.280, MAT_DARK, None,
         (-1.05, 3.500, RAIL_TOP + 0.030), (0, math.pi / 2, 0), 8)
    for i in range(2):
        tube('reel_fl%d' % i, 0.210, 0.018, MAT_PAINT, None,
             (-1.05 + i * 0.262, 3.500, RAIL_TOP + 0.030), (0, math.pi / 2, 0),
             14)


# ═════════════════════════════════════════════════════════════════════════════
# 5 - THE DRILLING STATION.  Platform, clamp, guard cage, console - everything
#     behind the tailboard, where the man and the hole are.
#
#     [BR] p7 and [GEO] p14 both show it: sonic is run FACING THE STRING, by a
#     man standing at the hole with the console beside him, not from the truck
#     cab.  [REF] section 9.5 records that the shipping builder has no guarding
#     at all, on a machine whose entire hazard is a violently vibrating string.
# ═════════════════════════════════════════════════════════════════════════════
PLAT_Z = 0.550          # [D] the fold-down rear platform, deployed
CLAMP_Z = MAST_FOOT_Z + 0.300                   # [D] 1.180 - waist height for
                        # the man standing on the platform
CAGE_TOP = 1.800        # [D] SOLVED, and it is pinned from BOTH sides.  It has
                        # to stop below the head's bottom of travel
                        # (CARR_Z0 = 1.980) - 180 mm clear - AND below the
                        # FOLDED mast, whose underside crosses this station at
                        # z = 1.948 + 0.2562 y, i.e. 1.840 at the cage's aft
                        # face.  1.800 clears both, and leaves 1.25 m of guard
                        # above the platform, which is the chest-high cage
                        # [GEO] p8 and p11 photograph.


def build_station():
    box('platform', (2.200, 0.840, 0.026), MAT_WORN, None,
        (0, -0.200, PLAT_Z), bevel=0.0)
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        pipe('plat_hang_%s' % side, (s * 1.02, -0.560, PLAT_Z),
             (s * 1.02, 0.180, RAIL_BOT + 0.040), 0.020, MAT_PAINT, None,
             sides=6)
        for i in range(2):
            pipe('plat_rail_%s%d' % (side, i),
                 (s * 1.09, -0.560 + i * 0.560, PLAT_Z),
                 (s * 1.09, -0.560 + i * 0.560, PLAT_Z + 1.000), 0.017,
                 MAT_PAINT, None, sides=6)
        pipe('plat_top_%s' % side, (s * 1.09, -0.560, PLAT_Z + 1.000),
             (s * 1.09, 0.020, PLAT_Z + 1.000), 0.017, MAT_PAINT, None,
             sides=6)
    pipe('plat_top_b', (-1.09, -0.560, PLAT_Z + 1.000),
         (1.09, -0.560, PLAT_Z + 1.000), 0.017, MAT_PAINT, None, sides=6)
    for i in range(3):
        box('plat_step%d' % i, (0.400, 0.200, 0.024), MAT_WORN, None,
            (0.70, -0.470, 0.150 + i * 0.145), bevel=0.0)

    # ── the CLAMP / BREAKOUT TABLE.  [REF] section 4.5: two hydraulic clamp
    # boxes either side of the string with jaws between them, the lower one
    # holding and the upper one breaking, plastered with yellow/black decals.
    box('clamp_table', (0.920, 0.560, 0.075), MAT_DARK, None,
        (0, 0, CLAMP_Z - 0.110), bevel=0.010)
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        box('clamp_box_%s' % side, (0.230, 0.360, 0.230), MAT_PAINT, None,
            (s * 0.310, 0, CLAMP_Z + 0.040), bevel=0.014)
        box('clamp_jaw_%s' % side, (0.170, 0.230, 0.110), MAT_WORN, None,
            (s * 0.150, 0, CLAMP_Z + 0.055), bevel=0.006)
        box('clamp_ram_%s' % side, (0.120, 0.090, 0.090), MAT_CHROME, None,
            (s * 0.235, 0, CLAMP_Z + 0.055), bevel=0.0)
    box('clamp_decal', (0.300, 0.020, 0.090), MAT_HAZARD, None,
        (0, -0.190, CLAMP_Z + 0.040), bevel=0.0)

    # ── THE GUARD CAGE.  [REF] section 5 item 4 ranks it fourth of the five
    # things that still read at distance: a welded wire-mesh cage around the
    # string with a hinged gate, an interlock switch and a bank of red mushroom
    # E-stops on a yellow/black plate.  The mesh is drawn as real bars rather
    # than as a plate, because a solid grey panel reads as sheet, not mesh.
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        for k, y in ((0, -0.420), (1, 0.180)):
            pipe('cage_post_%s%d' % (side, k), (s * 0.520, y, PLAT_Z + 0.014),
                 (s * 0.520, y, CAGE_TOP), 0.022, MAT_PAINT, None, sides=6)
        for k, z in ((0, PLAT_Z + 0.100), (1, CAGE_TOP - 0.030)):
            pipe('cage_rail_%s%d' % (side, k), (s * 0.520, -0.420, z),
                 (s * 0.520, 0.180, z), 0.018, MAT_PAINT, None, sides=6)
        bar = box('cage_mesh_%s' % side, (0.008, 0.008, CAGE_TOP - PLAT_Z -
                                          0.120), MAT_STEEL, None,
                  (s * 0.520, -0.400, (PLAT_Z + 0.100 + CAGE_TOP) / 2),
                  bevel=0.0)
        arrayed(bar, 11, (0, 0.056, 0))
    # the gate, in the aft face, with its interlock
    for i in range(2):
        pipe('gate_post%d' % i, (-0.520 + i * 1.040, -0.420, PLAT_Z + 0.014),
             (-0.520 + i * 1.040, -0.420, CAGE_TOP), 0.022, MAT_PAINT, None,
             sides=6)
    gbar = box('gate_mesh', (0.008, 0.008, CAGE_TOP - PLAT_Z - 0.120),
               MAT_STEEL, None, (-0.480, -0.420,
                                 (PLAT_Z + 0.100 + CAGE_TOP) / 2), bevel=0.0)
    arrayed(gbar, 18, (0.056, 0, 0))
    box('gate_hz', (1.040, 0.016, 0.070), MAT_HAZARD, None,
        (0, -0.428, CAGE_TOP - 0.070), bevel=0.0)
    box('gate_interlock', (0.055, 0.070, 0.100), MAT_DARK, None,
        (0.470, -0.455, CAGE_TOP - 0.330), bevel=0.006)

    # ── the console.  On the platform, FACING THE STRING, with the E-stops
    # [REF] section 9.5 says are missing today.
    # Its aft face and its E-stop buttons are held INSIDE the platform's own
    # handrail at y = -0.577, so the console does not become the thing that
    # sets the model's length (ASTRA section 5).
    box('stand', (0.460, 0.330, 1.000), MAT_PAINT, None,
        (-0.800, -0.360, PLAT_Z + 0.500), bevel=0.020)
    box('stand_desk', (0.520, 0.400, 0.050), MAT_DARK, None,
        (-0.800, -0.320, PLAT_Z + 1.020), (-0.42, 0, 0), bevel=0.008)
    box('stand_screen', (0.290, 0.028, 0.180), MAT_GLASS, None,
        (-0.800, -0.175, PLAT_Z + 1.075), (-0.42, 0, 0), bevel=0.0)
    for i in range(3):
        tube('stand_lever%d' % i, 0.013, 0.150, MAT_DARK, None,
             (-0.925 + i * 0.125, -0.420, PLAT_Z + 1.000), (0.42, 0, 0), 6)
    box('estop_plate', (0.320, 0.026, 0.125), MAT_HAZARD, None,
        (-0.800, -0.538, PLAT_Z + 0.740), bevel=0.0)
    for i in range(3):
        tube('estop%d' % i, 0.025, 0.022, MAT_HAZARD, None,
             (-0.905 + i * 0.105, -0.551, PLAT_Z + 0.740),
             (math.pi / 2, 0, 0), 8)

    # ── THE STRING IN THE HOLE, and it shows BOTH DIAMETERS at the collar,
    # which is the whole point.  [SLO]'s cycle: the core barrel goes first, the
    # override casing is driven down around it, then the barrel comes out.  So
    # at the collar you see 150 mm of casing with 100 mm of barrel standing out
    # of the top of it.
    tube('casing_shoe', CASE_OD / 2 + 0.012, 0.130, MAT_WORN, None,
         (0, 0, 0.0), sides=12)
    tube('casing', CASE_OD / 2, 1.420, MAT_WORN, None, (0, 0, 0.010), sides=12)
    tube('casing_collar', CASE_OD / 2 + 0.014, 0.090, MAT_STEEL, None,
         (0, 0, 1.340), sides=12)
    tube('barrel', CORE_OD / 2, CARR_Z0 - 1.300, MAT_STEEL, None,
         (0, 0, 1.300), sides=12)
    # timber cribbing and mud round the collar are the terrain's job, not the
    # rig's - `research/rigs/_model-critique.md` section 3.3 records what site
    # props inside a rig mesh do to `frameRadius`.
    empty(NODE_MOUNT, 'hole', None, (0, 0, 0))


# ═════════════════════════════════════════════════════════════════════════════
# 6 - THE MAST.  `pivot:mast` is the TILT PIN; `slide:mast-dump` is the 55 in
#     [TSI-CT] publishes; the mast itself hangs off the dump, authored DUMPED
#     (that is the working pose) and VERTICAL (`workTilt = 0`).
#
#     WHERE THE FOLDED MAST GOES, worked once here because every deck constant
#     above is checked against it.  three_x = bl_x, three_y = bl_z,
#     three_z = -bl_y, and the game turns `pivot:mast` about three.js X by
#     -1.32 rad, so a mast-local point (y, z) lands at
#         bl_y' =  0.9687 z + 0.2482 y
#         bl_z' =  0.2482 z - 0.9687 y
#     The mast's own +y face - the one that looks forward at work - therefore
#     ends up looking DOWN in transport, and the folded underside is the world
#     line  z = 1.948 + 0.2562 y.  Consequences, all checked:
#       * over the deck it gives 0.93 m of headroom at the tail, 1.79 m at the
#         cab.  Nothing on the deck is taller.
#       * at the back of the cab (y = 4.293) it is z = 3.048 against a roof at
#         3.020 - it clears by 28 mm and lands on the roof-mounted mast rest at
#         CRADLE_Y = 5.020, which is exactly where a compact truck rig carries
#         its rest.
#       * the pose was BUILT AND MEASURED, not predicted: 2.515 x 8.090 x
#         3.912 m against [TSI-CT]'s published 8 ft 3 in x 23 ft x 13 ft
#         (2.515 x 7.010 x 3.962).  Width exact, height 50 mm under, and the
#         extra length is the mast foot swinging out behind the tailboard.
#     WITHOUT THE MAST DUMP none of this works: a 6.13 m mast pinned at deck
#     level folds THROUGH the cab of a 7.01 m truck at this angle, whatever
#     else is done.  The 55 in is what buys the geometry.
# ═════════════════════════════════════════════════════════════════════════════
COL_W = 0.160
COL_X = MAST_W / 2 - COL_W / 2          # 0.270
MAST_Z0 = -MAST_DUMP                    # mast foot, in dump-local z
MAST_Z1 = MAST_Z0 + MAST_LEN            # mast top


def build_mast():
    piv = empty(NODE_PIVOT, 'mast', None, (0, MAST_Y, MAST_TILT_Z))
    piv['work_tilt_rad'] = 0.0
    piv['transport_tilt_rad'] = TRANSPORT_TILT
    piv['angle_max_deg'] = 45.0     # [TSI] "angle drilling 0 to 45 degrees"

    # the tilt frame: it turns with the pin but does NOT dump with the mast, so
    # it hangs on `pivot:mast` and not on the slide below it.
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        box('tilt_guide_%s' % side, (0.070, MAST_D + 0.06, 1.150), MAT_PAINT,
            piv, (s * (MAST_W / 2 + 0.045), 0, -0.330), bevel=0.010)
        tube('tilt_pin_%s' % side, 0.058, 0.130, MAT_CAST, piv,
             (s * (MAST_W / 2 + 0.030), 0, 0), (0, s * math.pi / 2, 0), 10)
    box('tilt_head', (MAST_W + 0.24, MAST_D + 0.06, 0.130), MAT_PAINT, piv,
        (0, 0, 0.130), bevel=0.010)

    # `pivot:mast-upper` EXISTS SO THE FOLD AND THE FLEX ARE NOT THE SAME NODE.
    # `gltfRig.js` makeDyn: `pivots.get('mast-upper') || mastPivot`, and the
    # update loop then writes `mastLower.rotation.x = flex` and, two lines later,
    # `mastPivot.rotation.x = lerp(transportTilt, workTilt, mastAnim)`.  A
    # machine that publishes only `pivot:mast` gets both writes on ONE node and
    # the second silently overwrites the first, so its mast never flexes under
    # load.  One empty fixes it, and `_model-critique.md` section 3.1 calls the
    # animation contract the highest-value thing in the whole review.
    upper = empty(NODE_PIVOT, 'mast-upper', piv, (0, 0, 0))
    upper['flex_only'] = True

    dump = empty(NODE_SLIDE, 'mast-dump', upper, (0, 0, 0))
    dump['travel_m'] = MAST_DUMP    # [TSI-CT] "Mast Dump: 55 in".  Authored
    dump['axis'] = 'z'              # DUMPED (working); the machine raises the
                                    # mast by this before it folds it.

    # ── the two plate columns
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        box('mast_col_%s' % side, (COL_W, MAST_D, MAST_LEN), MAT_PAINT, dump,
            (s * COL_X, 0, MAST_Z0 + MAST_LEN / 2), bevel=0.010)
    # ── the webs, front and back, built AS BANDS so the lightening holes are
    # real openings.  [REF] section 4.5 first row: fabricated plate/box section
    # with "a repeating pattern of round and rectangular lightening holes", and
    # "a lattice mast on a sonic rig is wrong".  The hole pattern is what gives
    # the mast its texture at mid distance, so it is built, not textured.
    web_w = MAST_W - 2 * COL_W          # 0.380 of clear web
    for f, fy in ((0, MAST_D / 2 - 0.007), (1, -MAST_D / 2 + 0.007)):
        box('mast_webstrip%d' % f, (0.095, 0.014, MAST_LEN - 0.09), MAT_PAINT,
            dump, (0, fy, MAST_Z0 + MAST_LEN / 2), bevel=0.0)
        i = 0
        while True:
            z = MAST_Z0 + 0.110 + i * 0.430
            if z > MAST_Z1 - 0.090:
                break
            box('mast_band%d_%d' % (f, i), (web_w, 0.014, 0.095), MAT_PAINT,
                dump, (0, fy, z), bevel=0.0)
            i += 1
    # ── the mast foot: the bolster the clamp table hangs off
    box('mast_foot', (MAST_W + 0.14, MAST_D + 0.09, 0.280), MAT_PAINT, dump,
        (0, 0, MAST_Z0 + 0.030), bevel=0.014)
    for s in (-1, 1):
        pipe('clamp_hang_%s' % ('l' if s < 0 else 'r'),
             (s * 0.300, -MAST_D / 2, MAST_Z0 + 0.060),
             (s * 0.300, -MAST_Y, CLAMP_Z - MAST_TILT_Z + 0.020), 0.030,
             MAT_PAINT, dump, sides=6)

    # ── the FEED RAILS.  [REF] section 4.5: machined gib plates BOLTED to the
    # mast face, with the roller chain running in the mast channel between
    # them - bare oiled steel, and it catches light.
    rail_len = FEED_STROKE + 1.10
    rail_z = (CARR_Z0 - MAST_TILT_Z) - 0.55 + rail_len / 2
    for s in (-1, 1):
        box('gib_%s' % ('l' if s < 0 else 'r'), (0.050, 0.026, rail_len),
            MAT_STEEL, dump, (s * 0.238, -MAST_D / 2 - 0.013, rail_z),
            bevel=0.0)
    box('feed_chain', (0.024, 0.017, rail_len + 0.10), MAT_WORN, dump,
        (0, -MAST_D / 2 - 0.010, rail_z), bevel=0.0)

    # ── THE ENERGY CHAIN.  [REF] section 5 item 2 calls it "the single most
    # reliable non-head identifier": a full-height black articulated drag chain,
    # matte plastic, about one mast column wide, present over the whole feed
    # travel.  It runs on the face that looks at the truck, because the head has
    # the face that looks at the hole.
    link = box('echain_link', (0.145, 0.085, 0.070), MAT_RUBBER, dump,
               (-0.195, MAST_D / 2 + 0.052, MAST_Z0 + 0.520), bevel=0.0)
    arrayed(link, 40, (0, 0, 0.101), 'echain')
    box('echain_ret', (0.145, 0.085, 0.068), MAT_RUBBER, dump,
        (-0.195, MAST_D / 2 + 0.128, MAST_Z0 + 0.460), bevel=0.0)
    box('echain_anchor', (0.180, 0.170, 0.090), MAT_DARK, dump,
        (-0.195, MAST_D / 2 + 0.090, MAST_Z0 + 0.360), bevel=0.008)

    # ── the crown: head block, service-winch sheave, and the mast-head handling
    # arm [GEO] p16 draws where a carousel is NOT ([REF] section 9.7).
    box('crown', (MAST_W + 0.10, MAST_D + 0.08, CROWN_H), MAT_PAINT, dump,
        (0, 0, MAST_Z1 + CROWN_H / 2 - 0.020), bevel=0.016)
    tube('sheave', 0.145, 0.058, MAT_CAST, dump,
         (-0.029, -MAST_D / 2 - 0.088, MAST_Z1 + 0.115),
         (0, math.pi / 2, 0), 14)
    box('sheave_cheek', (0.088, 0.030, 0.330), MAT_DARK, dump,
        (0, -MAST_D / 2 - 0.088, MAST_Z1 + 0.125), bevel=0.006)
    pipe('harm_a', (0.34, -0.10, MAST_Z1 - 0.12), (0.64, -0.34, MAST_Z1 - 0.34),
         0.034, MAT_PAINT, dump, sides=8)
    pipe('harm_b', (0.64, -0.34, MAST_Z1 - 0.34), (0.60, -0.60, MAST_Z1 - 0.92),
         0.028, MAT_PAINT, dump, sides=8)
    tube('harm_jaw', 0.066, 0.125, MAT_CAST, dump,
         (0.60, -0.60, MAST_Z1 - 1.04), sides=10)
    # the service winch rope and hook - [BR] p3 and p7 both show it hanging
    hose('winch_rope', [(-0.029, -MAST_D / 2 - 0.150, MAST_Z1 + 0.090),
                        (-0.029, -MAST_D / 2 - 0.225, MAST_Z1 - 1.30),
                        (-0.029, -MAST_D / 2 - 0.240, MAST_Z1 - 2.50)],
         0.010, MAT_STEEL, dump, sides=6)
    tube('winch_hook', 0.048, 0.170, MAT_WORN, dump,
         (-0.029, -MAST_D / 2 - 0.240, MAST_Z1 - 2.67), sides=8)
    box('winch_drum_h', (0.240, 0.230, 0.220), MAT_DARK, dump,
        (0.26, MAST_D / 2 + 0.130, MAST_Z0 + 0.90), bevel=0.010)
    return piv, upper, dump


def build_mast_rams():
    """The mast-raise cylinders, deck to tilt frame, AT FULL EXTENSION.

    [REF] section 4.5(b): in the working (vertical) position these rams are at
    or near full extension, so almost the whole rod is chrome and showing.

    They are STATIC on purpose, and that is a knowing compromise: they bridge
    the deck and `pivot:mast`, and whichever end they are parented to, the other
    end lets go the moment the game folds the mast.  Every machine in this
    directory with a raise ram makes the same call (`si_rig.py`'s `mast_fold` is
    built with `parent=None` for the same reason).  Recorded so nobody
    re-discovers it as a bug.
    """
    for s in (-1, 1):
        side = 'l' if s < 0 else 'r'
        ram('mast_ram_%s' % side,
            (s * 0.560, 1.900, DECK_Z + 0.130),
            (s * 0.470, MAST_Y + 0.030, MAST_TILT_Z - 0.500),
            barrel_r=0.068, rod_r=0.040, ext=0.44)
        tube('ram_trun_%s' % side, 0.048, 0.140, MAT_CAST, None,
             (s * 0.630, 1.900, DECK_Z + 0.130), (0, -s * math.pi / 2, 0), 10)
        # the static tower the tilt pin lives in
        box('tilt_tower_%s' % side, (0.070, 0.300, MAST_TILT_Z - DECK_Z +
                                     0.140), MAT_PAINT, None,
            (s * 0.560, MAST_Y + 0.070,
             (DECK_Z + MAST_TILT_Z + 0.140) / 2 - 0.070), bevel=0.010)


# ═════════════════════════════════════════════════════════════════════════════
# 7 - THE HEAD.  `slide:carriage`, and the only part of this machine that says
#     "sonic" rather than "site investigation".
#
#     [BR] p2 is a labelled render and it is the geometry source: a SINGLE
#     SYMMETRIC CASTING, not a stack of boxes - a short round boss on top, a
#     wide low housing carrying TWO large circular bosses side by side (the
#     "COUNTER ROTATING ROLLERS", nearly touching at the centreline), then the
#     housing TAPERING DOWN like a shallow trapezoid into a narrow neck, then a
#     collar flange, then a darker adapter sub, then the pipe.  The arrow
#     labelled "HIGH FREQUENCY SINUSOIDAL FORCE ALONG AXIS OF DRILL PIPE" points
#     down that taper: the taper is the load path, and it is what [REF] section
#     9.6 records as MISSING from the shipping builder, which goes straight from
#     a box to a thin spindle.
#
#     Above the oscillator sits the rest of the stack that [BR] p3 photographs -
#     rotation unit, water swivel, hose manifold - which is why the head reads
#     TALLER THAN WIDE as installed even though the oscillator alone is 2.2x as
#     wide as it is tall.
# ═════════════════════════════════════════════════════════════════════════════
def build_carriage(dump):
    z0 = CARR_Z0 - MAST_TILT_Z
    carr = empty(NODE_SLIDE, 'carriage', dump, (0, -MAST_Y, z0))
    # THE CARRIAGE INVARIANT (`gltfRig.js` makeDyn, and
    # `research/rigs/_model-critique.md` section 3.1, which found five of nine
    # machines dead on exactly this): `slide:carriage` plus `travel_m` is what
    # builds `dyn.carriageRange`, and `setCarriage()` reads that range with no
    # guard of its own - a carriage without `travel_m` writes NaN into a world
    # matrix and the machine silently VANISHES.  The node sits at the BOTTOM of
    # travel and the game slides it up by `travel_m`.
    carr['travel_m'] = FEED_STROKE
    carr['axis'] = 'z'
    carr['force_kn'] = OSC_KN
    carr['freq_hz'] = OSC_HZ
    carr['torque_nm'] = OSC_NM
    carr['rpm_max'] = RPM_MAX
    carr['head_mass_kg'] = HEAD_MASS

    # the carriage plate and its gib blocks, clamped to the mast face
    box('carr_plate', (MAST_W + 0.06, 0.034, 0.640), MAT_STEEL, carr,
        (0, MAST_Y - MAST_D / 2 - 0.030, 0.560), bevel=0.004)
    for s in (-1, 1):
        for k in range(2):
            box('carr_gib_%d%d' % (s > 0, k), (0.070, 0.044, 0.130),
                MAT_WORN, carr, (s * 0.238, MAST_Y - MAST_D / 2 - 0.050,
                                 0.310 + k * 0.500), bevel=0.0)
    box('carr_back', (0.560, 0.070, 0.520), MAT_PAINT, carr,
        (0, MAST_Y - MAST_D / 2 - 0.075, 0.560), bevel=0.010)

    # ── the OSCILLATOR, bottom up
    spin = empty(NODE_PIVOT, 'spindle', carr, (0, 0, 0))
    spin['rpm_max'] = RPM_MAX
    spin['torque_nm'] = OSC_NM
    empty(NODE_MOUNT, 'tool', spin, (0, 0, 0))
    # the darker adapter sub and the pipe stub that turn with the string
    tube('sub', 0.075, 0.230, MAT_DARK, spin, (0, 0, 0.010), sides=12)
    tube('sub_flats', 0.086, 0.070, MAT_WORN, spin, (0, 0, 0.050), sides=6)
    tube('collar', 0.105, 0.062, MAT_CAST, spin, (0, 0, 0.240), sides=14)
    # the trapezoid taper: full housing width down to the neck.  THIS is the
    # part [REF] section 9.6 says is missing today.
    cone('osc_taper', 0.098, HEAD_W / 2, 0.235, MAT_CAST, carr, (0, 0, 0.300),
         sides=18)
    box('osc_body', (HEAD_W, HEAD_D, HEAD_H), MAT_CAST, carr,
        (0, 0, 0.535 + HEAD_H / 2), bevel=0.020)
    for s in (-1, 1):
        # the two COUNTER ROTATING ROLLER bosses, nearly touching at the
        # centreline, read as bearing caps: a raised circular pad with a
        # smaller hub in the middle ([BR] p2).
        tube('ecc_boss_%d' % (s > 0), ECC_R, 0.040, MAT_CAST, carr,
             (s * (ECC_R + 0.012), -HEAD_D / 2 - 0.038,
              0.535 + HEAD_H / 2), (math.pi / 2, 0, 0), 16)
        tube('ecc_hub_%d' % (s > 0), ECC_R * 0.42, 0.036, MAT_WORN, carr,
             (s * (ECC_R + 0.012), -HEAD_D / 2 - 0.070,
              0.535 + HEAD_H / 2), (math.pi / 2, 0, 0), 12)
        for b in range(6):
            a = b * TAU / 6.0
            tube('ecc_bolt_%d%d' % (s > 0, b), 0.013, 0.020, MAT_WORN, carr,
                 (s * (ECC_R + 0.012) + math.cos(a) * ECC_R * 0.76,
                  -HEAD_D / 2 - 0.055,
                  0.535 + HEAD_H / 2 + math.sin(a) * ECC_R * 0.76),
                 (math.pi / 2, 0, 0), 6)
    # the short round boss on TOP of the oscillator - the hydraulic and air
    # damper connection ([BR] p2 puts it on the centreline, about 0.15x the
    # housing width)
    tube('osc_top_boss', HEAD_W * 0.075, 0.090, MAT_CAST, carr,
         (0, 0, 0.535 + HEAD_H), sides=12)

    # ── the rest of the stack: rotation unit, water swivel, manifold.  [BR] p3:
    # "hose manifold and gearbox box at the top, a cylindrical rotation unit
    # below it".  This is what makes the head read taller than wide as fitted.
    # THE WHOLE STACK IS ONE MATERIAL AND IT IS NOT THE CARRIER'S.  [REF]
    # section 5 item 3 and section 6: the head is a bought-in item from another
    # factory and its colour does NOT match the carrier - red on the Toa Tone
    # ([BR] p3), white on the SDC 50K ([BR] p7).  The fleet's material list has
    # exactly one machine-body paint, so the head is given the CASTING material
    # instead: it reads as a separate grey mass against an amber machine, which
    # is the read the photographs have.  It also costs nothing - `castIron` is
    # already a draw call under this carriage.
    ztop = 0.535 + HEAD_H + 0.090
    tube('rot_unit', 0.185, 0.330, MAT_CAST, carr, (0, 0, ztop), sides=16)
    box('gearbox', (0.560, 0.400, 0.300), MAT_CAST, carr,
        (0, 0.020, ztop + 0.480), bevel=0.018)
    tube('swivel', 0.090, 0.190, MAT_CAST, carr, (0, 0, ztop + 0.630),
         sides=12)
    pipe('gooseneck', (0, 0, ztop + 0.790), (0, -0.230, ztop + 0.700), 0.032,
         MAT_STEEL, carr, sides=8)
    # ── THE AIR DAMPER.  [BR] p5, p6 and [EIJ] both: the head is isolated from
    # the mast by an air cushion at 0.7 MPa on a minimum of 8 l/min.  [REF]
    # section 9.6 records it as missing today - without it the model has no
    # explanation for why the mast survives a 150 Hz source bolted to it.
    tube('damper_vessel', 0.088, 0.360, MAT_DARK, carr,
         (0.330, 0.170, ztop + 0.120), sides=12)
    tube('damper_cap', 0.094, 0.030, MAT_WORN, carr,
         (0.330, 0.170, ztop + 0.480), sides=12)
    pipe('damper_line', (0.330, 0.170, ztop + 0.140), (0.120, 0.060, 0.640),
         0.014, MAT_STEEL, carr, sides=6)
    # the rubber isolation pucks between head and carriage
    for s in (-1, 1):
        for k in range(2):
            tube('iso_puck_%d%d' % (s > 0, k), 0.048, 0.070, MAT_RUBBER, carr,
                 (s * 0.220, MAST_Y - MAST_D / 2 - 0.100, 0.360 + k * 0.420),
                 (math.pi / 2, 0, 0), 10)
    # hose bulkhead plate on the head - [BAU]: a mast hose package runs
    # bulkhead plate to bulkhead plate, not as loose lines
    box('head_bulkhead', (0.300, 0.030, 0.150), MAT_DARK, carr,
        (-0.300, 0.150, ztop + 0.180), bevel=0.006)
    return carr, spin


# ═════════════════════════════════════════════════════════════════════════════
# 8 - JACKS.  A machine that works by vibrating has to be PLANTED; the jacks are
#     not dressing, they are the reason the mast survives.
#
#     [TSI-CT] publishes the cylinder and nothing else: "Jacklegs: 3-1/2 in
#     (89 mm) x 24 in".  Position, pad and cribbing are not published by anyone.
# ═════════════════════════════════════════════════════════════════════════════
def build_jacks():
    nodes = []
    for s in (-1, 1):
        for k, y in ((0, JACK_YR), (1, JACK_YF)):
            tag = ('r' if k == 0 else 'f') + ('l' if s < 0 else 'r')
            top = RAIL_TOP + 0.040
            n = empty(NODE_SLIDE, 'jack-%s' % tag, None, (s * JACK_X, y, top))
            # Fleet vocabulary note: `travel_m` is the magnitude and `axis` the
            # line; the SENSE here is DOWN.  `_model-critique.md` section 3.1
            # found five different key names in use across nine machines for
            # this one idea, so this file adds no sixth - it follows the newest
            # file in the directory, `si_rig.py`, exactly.
            n['travel_m'] = JACK_STROKE
            n['axis'] = 'z'
            n['bore_m'] = JACK_BORE
            # posed at ~60 % of stroke: the machine is LEVELLED, not jacked
            # clear ([REF] section 4.5), so the tyres still carry it.
            pad_z = 0.100
            # THREE MATERIALS PER JACK, NOT FIVE.  `_model-critique.md` section
            # 3.2: a material here is not a texture cost, it is purely a
            # draw-call partition, and about twenty calls fleet-wide carry under
            # a hundred triangles each.  Four jacks at five materials was 20
            # draw calls for 1,300 triangles.  The barrel takes the body paint
            # it would really be sprayed in and the ball joint takes the same
            # worn steel as the gland and the pad it sits between: 12 calls, no
            # visible difference, and 8 back in the budget.
            ram('jack_%s' % tag, (0, 0, 0), (0, 0, pad_z - top + 0.055), n,
                barrel_r=JACK_BORE * 0.78, rod_r=JACK_BORE / 2, ext=0.44,
                mat_b=MAT_PAINT)
            tube('jack_ball_%s' % tag, JACK_BORE * 0.60, 0.055, MAT_WORN, n,
                 (0, 0, pad_z - top), sides=10)
            tube('jack_pad_%s' % tag, JACK_PAD_R, 0.030, MAT_WORN, n,
                 (0, 0, pad_z - top - 0.030), sides=12)
            box('jack_box_%s' % tag, (0.180, 0.180, 0.300), MAT_PAINT, n,
                (0, 0, -0.080), bevel=0.012)
            # TIMBER CRIBBING.  [BR] p3 and [GEO] p14: a sonic rig never sits
            # its feet straight on soft ground.  Two baulks, crossed.
            # Laid FORE-AND-AFT, not across: across, they reached x 1.340
            # and made the whole machine measure 2.680 wide against a published
            # 2.515.  Measured off the export, not reasoned about.
            for c in range(2):
                box('crib_%s%d' % (tag, c), (0.140, CRIB_W, 0.050), MAT_WORN,
                    n, (-0.075 + c * 0.150, 0, -top + 0.025), bevel=0.0)
            nodes.append(n)
    return nodes


# ═════════════════════════════════════════════════════════════════════════════
# 9 - SERVICES.  Hoses and lamps.
#
#     [REF] section 5 item 5: "a sonic rig looks like it is wearing the
#     hydraulics on the outside", and the rule it gives is exact - BUNDLED AND
#     DISCIPLINED ALONG THE MAST, LOOSE AND SWINGING AT THE HEAD.  [BAU] p2 has
#     the architecture: bulkhead plate -> deflection -> bulkhead plate, six main
#     lines plus HP lines plus the electric cable, wrapped.  [BR] p3 has the
#     helical hose that takes up the carriage travel; [BR] p7 has the two very
#     large hoses leaving the head in free unsupported loops.
# ═════════════════════════════════════════════════════════════════════════════
def lamp(name, parent, loc, aim, cone=54, rng=18, watt=50):
    """A work light plus the two named nodes `src/core/env.js` reads EVERY FRAME
    to re-aim its spotlight.

    `feed-work-light` must be built FIRST and carry exactly that string:
    env.js (~512) binds its key light to that name for every machine that is not
    a jumbo or a longhole rig, and falls back to the ORDINAL when the name
    misses.  On this machine it rides the mast, so it sweeps when the mast
    rakes - which is the whole point of the named-node contract.
    """
    mount, aimnode = worklight(name, parent, loc, aim, cone, rng)
    mount['watt_w'] = watt
    mount['colour_hex'] = 0xFFE9C0
    box(name + '_stalk', (0.024, 0.024, 0.100), MAT_DARK, mount,
        (0, 0, -0.065))
    box(name + '_shell', (0.165, 0.085, 0.115), MAT_DARK, mount, (0, 0.014, 0))
    box(name + '_lens', (0.135, 0.010, 0.086), MAT_GLASS, mount,
        (0, -0.038, 0))
    box(name + '_barH', (0.175, 0.009, 0.009), MAT_WORN, mount,
        (0, -0.050, 0.054), bevel=0.0)
    for i in range(3):
        box(name + '_bar%d' % i, (0.009, 0.009, 0.125), MAT_WORN, mount,
            (-0.053 + i * 0.053, -0.050, 0), bevel=0.0)
    return mount


def build_services(piv, dump, carr):
    lamps = []
    # 1. THE KEY LIGHT.  First, and named exactly, or env.js falls back to the
    #    ordinal and the beam leaves a lamp that is not the working one.
    lamps.append(lamp('feed-work-light', dump,
                      (0.315, -MAST_D / 2 - 0.075, MAST_Z0 + 2.150),
                      (-0.34, -0.42, -0.84), cone=48, rng=16, watt=60))
    lamps.append(lamp('crown-work-light', dump,
                      (-0.315, -MAST_D / 2 - 0.075, MAST_Z1 - 0.400),
                      (0.24, -0.36, -0.90), cone=56, rng=20, watt=60))
    # 3-4. deck floods on the headboard, washing the rack and the walkway
    for s in (-1, 1):
        lamps.append(lamp('deck-work-light-%s' % ('l' if s < 0 else 'r'), None,
                          (s * 0.780, DECK_Y1 - 0.090, DECK_Z + 0.930),
                          (s * -0.22, -0.86, -0.46), cone=64, rng=14, watt=50))
    # 5. the collar lamp on the platform rail, which is the light the man at the
    #    string actually works by
    lamps.append(lamp('collar-work-light', None,
                      (-1.055, -0.560, PLAT_Z + 0.980),
                      (0.70, 0.62, -0.36), cone=60, rng=10, watt=50))

    # ── THE MAST HOSE PACKAGE.  Bundled, along the +y face, deck bulkhead to
    # head bulkhead ([BAU] p2).  Six main lines are drawn as three visible
    # bundles - at game distance a wrapped package reads as one black mass, and
    # a rig that shows six separate lines reads as a diagram.
    box('deck_bulkhead', (0.280, 0.030, 0.150), MAT_DARK, None,
        (-0.300, 0.760, DECK_Z + 0.230), bevel=0.006)
    for i, xo in enumerate((-0.045, 0.0, 0.045)):
        hose('mast_bundle%d' % i,
             [(-0.300 + xo, -MAST_Y + 0.760, DECK_Z - MAST_TILT_Z + 0.230),
              (-0.300 + xo, MAST_D / 2 + 0.230, MAST_Z0 + 0.700),
              (-0.240 + xo, MAST_D / 2 + 0.075, MAST_Z0 + 2.400)],
             0.034, MAT_RUBBER, dump, sides=6)
    box('mast_bulkhead', (0.260, 0.140, 0.030), MAT_DARK, dump,
        (-0.250, MAST_D / 2 + 0.080, MAST_Z0 + 2.470), bevel=0.006)
    # ── THE HELICAL HOSE that takes up the carriage travel ([BR] p3: "a
    # coiled/helical black hose like a stretched spring").  It is the second
    # most distinctive hose on the machine after the free loops.
    pts = []
    turns, n = 7, 22
    for i in range(n):
        t = i / (n - 1.0)
        a = t * turns * TAU
        pts.append((-0.250 + math.cos(a) * 0.115,
                    MAST_D / 2 + 0.150 + math.sin(a) * 0.115,
                    MAST_Z0 + 2.520 + t * 1.150))
    hose('coil_hose', pts, 0.026, MAT_RUBBER, dump, sides=6)

    # ── THE FREE LOOPS AT THE HEAD.  [BR] p7: two very large black hoses leave
    # the head in generous UNSUPPORTED loops and drop away.  On a working
    # machine the hoses are not tidy - they hang, sag and swing.
    ztop = 0.535 + HEAD_H + 0.090
    for i, xo in enumerate((-0.055, 0.055)):
        hose('head_loop%d' % i,
             [(-0.300 + xo, 0.165, ztop + 0.180),
              (-0.430 + xo, 0.560, ztop - 0.420),
              (-0.380 + xo, 0.700, ztop - 1.150),
              (-0.250 + xo, 0.400, ztop - 1.000)],
             0.042, MAT_RUBBER, carr, sides=6)
    # the air line from the deck reel up to the damper, thin and separate
    hose('air_line',
         [(-1.010, 3.480, RAIL_TOP + 0.230),
          (-0.640, 2.100, DECK_Z + 0.560),
          (-0.420, 0.760, DECK_Z + 0.320)],
         0.013, MAT_RUBBER, None, sides=6)
    return lamps


# ═════════════════════════════════════════════════════════════════════════════
def build(out_path):
    reset()
    build_chassis()
    build_running_gear()
    build_cab()
    build_deck()
    build_station()
    piv, upper, dump = build_mast()
    build_mast_rams()
    carr, spin = build_carriage(dump)
    jacks = build_jacks()
    build_services(piv, dump, carr)

    # Bake before any join: `join()` keeps only the ACTIVE object's modifier
    # stack, so an unapplied BEVEL or ARRAY anywhere else vanishes silently.
    bake_modifiers()
    curves_to_mesh()
    # Deepest first.  `finish()` leaves every pivot:/slide: subtree alone
    # because it has to move independently, so each moving assembly is joined
    # by material HERE or the mast alone is ~110 draw calls against a 70 budget.
    for node in [spin, carr, dump, upper, piv] + jacks:
        join_under(node)

    finish(out_path)

    # ── READ THE FIGURES BACK OFF THE MESH, NOT OFF THE INTENT ──────────────
    # ASTRA section 8: "verify by measurement, not by the absence of an error".
    # These lines exist so a build that has gone wrong says so without anybody
    # having to run a second command - `tools/glbinfo.mjs` is still the ruler.
    # EVERY VERTEX, not the eight corners of each local bounding box.  ASTRA
    # section 5 records what the corner method cost: a second dimension tool
    # measured that way, was a strict OVER-estimate on any rotated mesh, and
    # produced four false findings, three of which were reported as real.  The
    # first draft of THIS block made the same mistake and printed 10.170 m for a
    # machine that measures 7.630.
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    xs, ys, zs = [], [], []
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        if me is None:
            continue
        mw = o.matrix_world
        for v in me.vertices:
            p = mw @ v.co
            xs.append(p.x)
            ys.append(p.y)
            zs.append(p.z)
        ev.to_mesh_clear()
    w = max(xs) - min(xs)
    ln = max(ys) - min(ys)
    h = max(zs) - min(zs)
    print('SONIC_CHECK width=%.3f  ([TSI-CT] 8 ft 3 in = %.3f; [FHWA] limit '
          '2.591; over the tyres %.3f [PB-BB])' % (w, WIDTH, OVER_TYRES))
    print('SONIC_CHECK length=%.3f  ([TSI-CT] 23 ft = %.3f from the drilling '
          'axis to the bumper; the excess is the FOLD-DOWN REAR PLATFORM, '
          'authored deployed because the model is posed WORKING - ASTRA '
          'section 5, use --parts before believing this number)'
          % (ln, LENGTH))
    print('SONIC_CHECK height=%.3f  (mast VERTICAL, the working pose.  '
          '[TSI-CT] publishes only the TRANSPORT height, 13 ft = 3.962; folding '
          'this model at the fixed -1.32 rad and measuring every vertex gives '
          '3.912 - see THE TRANSPORT TILT note)' % h)
    print('SONIC_CHECK ground=%.3f  (the tyre stands at its LOADED radius '
          '%.3f [MICH], so nothing is below z=0)' % (min(zs), LOADED_R))
    print('SONIC_CHECK mast_len=%.3f stroke=%.3f ratio=%.3f  ([TSI-CT] '
          '20 ft 1-1/2 in and 14 ft 1 in; [GEO]\'s crawler is 0.581)'
          % (MAST_LEN, FEED_STROKE, FEED_STROKE / MAST_LEN))
    print('SONIC_CHECK carriage bottom=%.3f top=%.3f mast_top=%.3f  (must stop '
          'short of BOTH ends - [REF] section 4.5)'
          % (CARR_Z0, CARR_Z1, MAST_TILT_Z + MAST_Z1))
    print('SONIC_CHECK tooling core=%.3f casing=%.3f  (TWO diameters, '
          '[DATA] + [GP]; one diameter is the commonest way to draw a sonic '
          'rig wrong)' % (CORE_OD, CASE_OD))
    return out_path


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(os.path.dirname(__file__), '..',
                                       'public', 'models',
                                       'sonic-truck.glb')))
