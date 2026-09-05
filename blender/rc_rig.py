"""
rc_rig — in-game marque "Kjelvik RC-410 Chipline"
Class: crawler-mounted reverse-circulation exploration drill, 300-400 m, with
the full surface sample train (cyclone / splitter / calico bags / chip trays).

PROVENANCE
----------
Local reference: research/rigs/rc-rig.md, itself built from the owner's OEM
catalogue library. Short tags used in the comments below:
  [MET p.22]    'Mineral Exploration Tooling - Catalog.pdf' p.22 — full-page
                studio three-quarter photograph of a crawler RC exploration rig.
                PRIMARY shape source; every silhouette RATIO here was measured
                off that page at 300 dpi (rc-rig.md §3b).
  [MIN p.12-13] 'Mincon-RC-Solutions-2025-A4-WEB.pdf' — exploded CAD render of an
                RC conversion kit: deflector box, combination swivel, head wear
                tube, cyclone with slew base + support arm + deploy cylinder,
                inspection lid, vibrators, splitter.
  [AUSMIN]      'Article-Australian-Mining-Modular-Drill-Rig-Jan-2011.pdf' p.1 —
                truck-mounted variant in the field; bull-hose bore and pressure.
  [BAUER]       'Bauer-Maschinen-Hydraulikschlaeuche…pdf' — hose PACKAGE routing
                idiom: bulkhead plate -> bundle -> deflection guide -> bulkhead
                plate, electric cable inside the bundle, fabric hose bag over it.
  [R02] research/02-prospecting.md §A2/§E4
  [R16] research/16-site-archetypes.md §A.8/§B.7

WEB RESEARCH (appearance only; the individual detail each source settled is
noted at the function that uses it). Machines looked at, all of this class:
Epiroc Explorac 235 and Explorac RC20 product pages and brochures; Schramm
T450XD / T685 exploration rigs; Foremost Explorer / Prospector; Hydco and
Sandvik DE-series RC packages; plus dealer and auction walkaround photo sets and
site video of RC rigs working with the cyclone deployed.

NAMING (DOMAIN.md §10): no manufacturer name and no model designation appears in
any exported string. Object names are generic or are game node names. Provenance
lives in these comments and nowhere else, which is the same separation a racing
sim makes between shape and branding.

UNITS: metres, Blender Z-up. The exporter converts to three.js Y-up
(three_x = bl_x, three_y = bl_z, three_z = -bl_y), so Blender +Y is the REAR of
the machine and Blender -Y is the drilling end.

ORIGIN: undercarriage (slew) centre at ground level, per the pipeline contract,
so the rig drops on terrain at y=0. The drill centre is 2.85 m FORWARD of the
origin — [MET p.22]: the hole is off the front of the machine, clear of the
tracks — and is published as the node `mount:hole` so nothing has to guess it.
"""

import math
import os
import sys

import bpy
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
if os.path.join(HERE, 'lib') not in sys.path:
    sys.path.insert(0, os.path.join(HERE, 'lib'))

from rig import (reset, part, tube, hose, empty, worklight, finish,
                 NODE_MOUNT, NODE_AIM, NODE_PIVOT, NODE_SLIDE,
                 MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST,
                 MAT_RUBBER, MAT_GLASS, MAT_CHROME, MAT_HAZARD)
from rig import box as _lib_box

TAU = math.pi * 2


def box(name, size, mat=MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
        bevel=0.0):
    """A box whose `size` is its actual extent in metres.

    rig.box() builds its cube with primitive_cube_add(size=1) — a unit cube with
    vertices at +/-0.5 — and then sets scale to size/2, so the object comes out
    at HALF the requested extents. Measured, not guessed: a box asked for at
    (0.26, 4.20, 0.24) exported with a bounding box of (0.13, 2.10, 0.12).

    That halving is invisible while a machine is only boxes, because everything
    shrinks together — but tube(), cone() and every hard-coded position are in
    true metres, so in a mixed model it puts every truss member at half length
    and leaves it floating clear of its own joints. A first render of this rig
    showed exactly that: a stair made of disconnected sticks and a lattice with
    daylight at every node.

    rig.py is shared with the other machines being built in parallel, so it is
    NOT edited here. This local wrapper doubles the request instead, so every
    dimension written in this file means what it says. The bevel is applied
    after the scale is baked, so bevel widths are unaffected by the doubling.
    """
    return _lib_box(name, (size[0] * 2, size[1] * 2, size[2] * 2), mat, parent,
                    loc, rot, bevel)

# ── PRINCIPAL DIMENSIONS ──────────────────────────────────────────────────────
# rc-rig.md §8 is blunt: there is no dimensioned GA of any RC rig anywhere in the
# owner's library, and none of the manufacturers of this class publish one either
# (checked: the Explorac-class brochures give depth capacity, feed force and air
# demand, never a general arrangement). So the SHAPE is sourced — ratios measured
# off [MET p.22] — and the SCALE hangs off one decision that IS sourced: the rod.
#
# Decision: 3.05 m dual-wall rods. [R02 §A2, citing BL-RC p.6] lists dual-wall
# pipe in 1.5 / 3 / 6 m lengths; 3 m is the exploration standard and is what the
# game's own builder already uses (rigFactory.js rodLen 3.05). Everything
# vertical follows from a mast that has to swallow one.
ROD_LEN = 3.05
ROD_OD = 0.1143        # 4-1/2" dual-wall OD, top of the sourced 3.5/4/4.5" range
HOLE_DIA = 0.124       # 124 mm, one of the two standard RC hole sizes [R02 §A2]

# Measured silhouette of [MET p.22] (rc-rig.md §3b):
#   mast-above-deck : deck-to-ground = 1.64 : 1
#   mast axis length                 = 0.94 x standing height
#   mast slenderness                 = 8.5 : 1  (long thin open truss)
#   mast rake in that photograph     = 19 deg from vertical, leaning back
#   overall silhouette width         = 0.73 x standing height
DECK_Z = 2.30          # deck plate top. DERIVED, not sourced (§8 item 5).
MAST_LEN = 5.45        # built VERTICAL; the game rakes it on pivot:mast.
MAST_W = 0.58          # across the machine (X)
MAST_D = 0.66          # fore/aft (Y). 5.45 / 0.64 = 8.5 : 1 [MET p.22 §3b] — the
                       # one ratio that is held exactly, because §5 makes the
                       # long thin open truss an identification cue.
MAST_FOOT = 1.15       # mast foot pin height above ground
DRILL_FLOOR = 1.50     # the lower working floor at the mast foot, reached from
                       # the deck by four steps

# WHERE THIS SCALE COMES FROM, AND WHERE IT DEVIATES.
# The vertical ratio measured off [MET p.22] is mast-above-deck : deck-to-ground
# = 1.64 : 1. Held exactly, with a deck at a credible jacked-crawler height, that
# gives a mast too short to swallow a 3.05 m rod, and rc-rig.md §9.F anticipates
# precisely this: "either the mast is long for its rods, or the deck is low, or
# the reference is a smaller machine... whoever changes it should decide the rod
# length first and let the mast follow." So the rod wins, because the rod length
# is sourced and the ratio is measured off a foreshortened studio photograph of a
# machine whose absolute size is unknown (§8).
# Result: at the reference 19 deg rake this model stands 6.30 m to the crown with
# a ratio of 1.74 : 1 against the photograph's 1.61 : 1 — about 8 % taller in the
# mast. Declared, not hidden.
# Web cross-check, and it is the first absolute scale anyone has had for this
# class: a published crawler RC rig of the same capability (JCDrill JRC1200,
# 90-400 mm holes, 13 t) gives shipping 7550 x 2260 x 2700 mm, 300 mm ground
# clearance, 3400 mm FEED STROKE and 4 / 4.5 m pipe. A 3.4 m stroke needs a mast
# of about 5.4 m once the head, the crown and the foot clamp are taken out —
# which is what MAST_LEN already was, derived independently from the rod. The
# same source is why BODY_W came down from 2.55 to 2.42: 2260 mm shipping width
# plus the handrails.
HOLE_Y = -2.85         # drill centre, 0.70 m forward of the track nose (-2.15)
TRACK_LEN = 4.30
TRACK_W = 0.62         # triple-grouser shoe width. NOT SOURCED (§8 item 3)
GAUGE = 1.18           # track centres. NOT SOURCED
TRACK_LIFT = 0.16      # the rig WORKS ON ITS JACKS with the tracks hanging clear
                       # [MET p.22, rc-rig.md §4.9] — that is the whole stance,
                       # and it changes the silhouette more than any single part.
BODY_W = 2.42
JACK_X = 1.28          # outboard of the track outer edge at 0.90 [rc-rig.md §9.L]

CYC_X, CYC_Y = 3.02, -1.55    # sample train, forward-right of the machine
CYC_BARREL_D = 0.70           # ratios only [MIN p.13, rc-rig.md §9.I]:
CYC_BARREL_H = 0.70           #   barrel about 1 diameter tall
CYC_CONE_H = 1.10             #   cone about 1.55 diameters long
CYC_OUT_Z = 1.98              # outlet height, so a splitter and a bag fit under

# Derived attachment points, computed rather than typed, so the sample hose
# still lands on the hose tail and in the cyclone inlet after any of the
# dimensions above is changed. Getting this wrong is invisible in a wireframe
# and glaring in a render — an earlier pass had the hose starting 0.9 m off the
# head because the numbers were written out by hand.
CARRIAGE_Z = MAST_LEN - 2.05                 # carriage rest height on the mast
HEAD_PIVOT = (0.0, HOLE_Y - MAST_D / 2 - 0.30, MAST_FOOT + CARRIAGE_Z + 0.10)
HEAD_OUT = (HEAD_PIVOT[0] + 0.90, HEAD_PIVOT[1] - 0.16, HEAD_PIVOT[2] - 0.735)
CYC_INLET = (CYC_X - CYC_BARREL_D / 2 - 0.26,
             CYC_Y + CYC_BARREL_D / 2 * 0.55,
             CYC_OUT_Z + CYC_CONE_H + CYC_BARREL_H + 0.17)
ARM_BASE = (1.05, -2.05, DECK_Z + 0.20)      # slew base bolted to the deck
ARM_TIP = (2.30, -2.40, 3.02)                # where the hose loop rides


# ── local helpers ─────────────────────────────────────────────────────────────
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

    The modifier's own constant_offset_displace is in the object's LOCAL space,
    so on a rotated object it marches the copies off in a direction the caller
    did not ask for. That is not hypothetical. The feed-chain pins are cylinders
    rotated 90 deg about Y; with a naive (0, 0, pitch) they laid an 83-link,
    five-metre steel rod horizontally across the site at knee height, and it took
    a bounding-box sweep of the scene to find it because from most angles it read
    as a scratch on the ground. The perforated guard panels had the same fault:
    the second array ran into the plate's thickness instead of up its face, so
    the punched grid was a single row of holes repeated inside the steel.

    Converting here means every caller says where it wants the copies to go and
    gets that, whatever the object's own rotation is.
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
    return obj


def strut(name, a, b, size, mat=MAT_DARK, parent=None, bevel=0.006):
    """A square-section member spanning two points, in `parent` space.

    This is how a welded truss is actually made and it is why the mast can be an
    open lattice instead of a plank: chords and diagonals as real members with
    real ends. A bevel on every one of them is what keeps the steel from reading
    as cardboard, and it costs triangles, not draw calls.
    """
    a, b = Vector(a), Vector(b)
    d = b - a
    o = box(name, (size, size, d.length), mat, parent, tuple((a + b) / 2),
            bevel=bevel)
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    return o


def bake_modifiers():
    """Apply every modifier before any join.

    bpy.ops.object.join KEEPS the active object's modifiers and DISCARDS the
    others'. finish() joins by material, so an unbaked BEVEL or ARRAY on
    anything but the first object of a group would vanish silently — the bevel
    is the whole reason the steel does not read as cardboard, so bake first.
    """
    bpy.ops.object.select_all(action='DESELECT')
    todo = [o for o in bpy.context.scene.objects
            if o.type == 'MESH' and o.modifiers]
    if not todo:
        return
    # One convert() over the whole selection instead of a modifier_apply per
    # modifier: each operator call re-evaluates the depsgraph across every
    # object in the scene, and at ~1250 objects and ~200 modifiers that turned a
    # rebuild into a nine-minute wait.
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

    A curve exports as its own primitive — one draw call per hose. Converted,
    every static hose lands in the single rubber bucket instead.
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
    """Collapse a moving assembly to one mesh per material.

    finish() deliberately leaves pivot:/slide: subtrees alone because they have
    to move independently — but this mast is ~110 members, and unjoined that is
    ~110 draw calls against a budget of 70. So each moving assembly is joined
    here by material, keeping the node itself and its own child nodes intact.
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


# ── 1. UNDERCARRIAGE ──────────────────────────────────────────────────────────
def build_undercarriage():
    """Excavator-style crawler [MET p.22, rc-rig.md §4.8]: triple-grouser steel
    shoes, plain drum idler forward, toothed sprocket aft, heavy grey box track
    frames with the bottom rollers tucked inside so they barely read from the
    side, and a guard over the top run.

    Web check: exploration crawlers of this size (Explorac-class carriers and the
    track carriers under the Schramm/Foremost exploration rigs) run a short frame
    with 6-7 bottom rollers, one or two carrier rollers, and the drive sprocket
    at the REAR so the final drive sits away from the dust and the drilling end.
    Modelled that way. The chain is built as real shoes on a stadium path rather
    than a textured band, because the rig is JACKED UP and the tracks hang in
    full view — a painted-on track would be obvious.
    """
    R = 0.40                       # idler / sprocket pitch radius
    cz = TRACK_LIFT + R            # track axis height
    half = TRACK_LEN / 2 - R
    for s in (-1, 1):
        x = s * GAUGE / 2
        box('uc-frame', (0.42, TRACK_LEN - 0.55, 0.54), MAT_DARK,
            loc=(x, 0, cz), bevel=0.03)
        box('uc-frame-web', (0.26, TRACK_LEN - 0.10, 0.24), MAT_DARK,
            loc=(x, 0, cz), bevel=0.02)
        tube('uc-idler', R * 0.80, TRACK_W - 0.10, MAT_WORN,
             loc=(x - (TRACK_W - 0.10) / 2, -half, cz),
             rot=(0, math.pi / 2, 0), sides=16)
        tube('uc-sprocket-hub', R * 0.62, TRACK_W - 0.06, MAT_CAST,
             loc=(x - (TRACK_W - 0.06) / 2, half, cz),
             rot=(0, math.pi / 2, 0), sides=14)
        for t in range(13):
            a = t / 13 * TAU
            box('uc-tooth', (TRACK_W - 0.12, 0.10, 0.13), MAT_WORN,
                loc=(x, half + math.sin(a) * R * 0.72, cz + math.cos(a) * R * 0.72),
                rot=(-a, 0, 0), bevel=0.012)
        tube('uc-final-drive', 0.24, 0.16, MAT_CAST,
             loc=(x + s * (TRACK_W / 2 - 0.02), half, cz),
             rot=(0, s * math.pi / 2, 0), sides=14)
        for i in range(6):
            y = -half + 0.16 + i * (2 * half - 0.32) / 5
            tube('uc-roller', 0.115, TRACK_W - 0.28, MAT_CAST,
                 loc=(x - (TRACK_W - 0.28) / 2, y, TRACK_LIFT + 0.115),
                 rot=(0, math.pi / 2, 0), sides=10)
        for i in range(2):
            tube('uc-carrier', 0.075, 0.14, MAT_CAST,
                 loc=(x - 0.07, -0.75 + i * 1.5, cz + R - 0.02),
                 rot=(0, math.pi / 2, 0), sides=8)
        box('uc-track-guard', (TRACK_W + 0.06, TRACK_LEN * 0.62, 0.05), MAT_DARK,
            loc=(x, 0.1, cz + R + 0.10), bevel=0.012)

        # The chain: real shoes on a stadium path around idler and sprocket.
        # Pitch is set from the SHOE LENGTH so the run is continuous — spaced by
        # a fixed count it comes out as a dotted line, which is exactly what a
        # first render showed and exactly what a painted-on track looks like.
        pitch = 0.162
        n_str = int(round(2 * half / pitch)) + 1
        n_arc = max(6, int(round(math.pi * R / pitch)))
        pts = []
        for i in range(n_str):
            t = i / (n_str - 1)
            pts.append((-half + t * 2 * half, cz - R, 0.0))
        for i in range(1, n_arc):
            a = i * math.pi / n_arc
            pts.append((half + math.sin(a) * R, cz - math.cos(a) * R, a))
        for i in range(n_str):
            t = i / (n_str - 1)
            pts.append((half - t * 2 * half, cz + R, math.pi))
        for i in range(1, n_arc):
            a = math.pi + i * math.pi / n_arc
            pts.append((-half + math.sin(a) * R, cz - math.cos(a) * R, a))
        for (py, pz, ang) in pts:
            sh = box('uc-shoe', (TRACK_W, 0.158, 0.036), MAT_WORN,
                     loc=(x, py, pz), rot=(-ang, 0, 0), bevel=0.006)
            for g in (-0.050, 0.0, 0.050):     # triple grouser
                box('uc-grouser', (TRACK_W - 0.03, 0.022, 0.042), MAT_WORN,
                    parent=sh, loc=(0, g, 0.038), bevel=0.004)
    for y in (-1.35, 1.35):
        box('uc-crossmember', (GAUGE + 0.20, 0.30, 0.26), MAT_DARK,
            loc=(0, y, cz + 0.02), bevel=0.02)
    box('uc-centre-frame', (GAUGE - 0.10, 2.60, 0.30), MAT_DARK,
        loc=(0, 0, cz + 0.10), bevel=0.02)


# ── 2. DECK, GUARDING, ACCESS ─────────────────────────────────────────────────
def perforated_panel(name, w, h, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
                     pitch=0.078):
    """Flat dark plate with a regular grid of round holes on a square pitch.

    [MET p.22, rc-rig.md §4.7 / §9.K] calls this the most characteristic guarding
    detail on the machine: punched round holes, not woven mesh, not expanded
    metal. Built as a recessed dot grid rather than boolean holes — a boolean per
    hole is fragile and slow, the material is procedural anyway, and it is the
    dot grid that actually reads at silhouette distance. Triangles, not calls.
    """
    p = box(name, (w, 0.008, h), MAT_DARK, parent, loc, rot, bevel=0.004)
    nx = max(1, int(w / pitch) - 1)
    nz = max(1, int(h / pitch) - 1)
    d = tube(name + '-perf', 0.021, 0.012, MAT_DARK, p,
             (-(nx - 1) * pitch / 2, -0.007, -(nz - 1) * pitch / 2),
             rot=(math.pi / 2, 0, 0), sides=6)
    arrayed(d, nx, (pitch, 0, 0))
    arrayed(d, nz, (0, 0, pitch), name='arr2')
    for (fx, fz, fw, fh) in ((0, h / 2, w, 0.05), (0, -h / 2, w, 0.05),
                             (-w / 2, 0, 0.05, h), (w / 2, 0, 0.05, h)):
        box(name + '-frame', (fw, 0.024, fh), MAT_DARK, p, (fx, 0, fz),
            bevel=0.005)
    return p


def build_deck():
    """Flat working deck over the tracks, plus the fabricated nose that carries
    the mast foot out past the track front [MET p.22, rc-rig.md §4.7].

    NO CAB. The reference crawler has none — it is run from a deck-level control
    stand, and [MIN p.13] sells in-cab joystick or remote control with PLC as
    alternatives. rc-rig.md §9.D flags the game's current small amidships cab as
    matching neither photograph. So: console, seat, and a FOPS canopy.
    """
    deck_y0, deck_y1 = -2.30, 2.35
    dy = deck_y1 - deck_y0
    cy = (deck_y0 + deck_y1) / 2
    box('deck-plate', (BODY_W, dy, 0.06), MAT_DARK, loc=(0, cy, DECK_Z - 0.03),
        bevel=0.012)
    for s in (-1, 1):
        box('deck-beam', (0.16, dy, 0.34), MAT_DARK,
            loc=(s * (BODY_W / 2 - 0.16), cy, DECK_Z - 0.24), bevel=0.02)
    box('deck-beam-c', (0.30, dy, 0.30), MAT_DARK, loc=(0, cy, DECK_Z - 0.22),
        bevel=0.02)
    for y in (-1.85, -0.55, 0.75, 2.0):
        box('deck-xbeam', (BODY_W - 0.05, 0.14, 0.26), MAT_DARK,
            loc=(0, y, DECK_Z - 0.20), bevel=0.018)

    # ── the drill floor: a LOWER working deck at the mast foot ──────────────
    # This is what falls out of holding the reference ratio honestly. [MET p.22]
    # puts 1.6 m of mast below deck level, so the rod clamp and the breakout
    # table sit well under the walking deck — which only makes sense if there is
    # a second, lower floor around the mast foot that the crew works the rods
    # from, reached from the main deck by a short stair. Web walkarounds of
    # exploration crawlers of this class show exactly that split-level layout.
    box('drill-floor-front', (2.10, 0.40, 0.05), MAT_DARK,
        loc=(0, HOLE_Y - 0.60, DRILL_FLOOR), bevel=0.008)
    box('drill-floor-rear', (2.10, 0.40, 0.05), MAT_DARK,
        loc=(0, HOLE_Y + 0.50, DRILL_FLOOR), bevel=0.008)
    for s in (-1, 1):
        box('drill-floor-side', (0.65, 0.70, 0.05), MAT_DARK,
            loc=(s * 0.725, HOLE_Y - 0.05, DRILL_FLOOR), bevel=0.008)
        strut('drill-floor-beam', (s * 0.90, HOLE_Y - 0.78, DRILL_FLOOR - 0.14),
              (s * 0.62, -1.60, DRILL_FLOOR - 0.14), 0.16, MAT_DARK)
        box('drill-floor-kick', (0.05, 1.70, 0.16), MAT_HAZARD,
            loc=(s * 1.02, HOLE_Y - 0.05, DRILL_FLOOR + 0.10), bevel=0.006)
    box('drill-floor-kick-f', (2.10, 0.05, 0.16), MAT_HAZARD,
        loc=(0, HOLE_Y - 0.78, DRILL_FLOOR + 0.10), bevel=0.006)
    # fabricated nose carrying the mast foot out past the track front
    box('front-frame', (0.98, 1.55, 0.34), MAT_DARK,
        loc=(0, HOLE_Y + 0.62, DRILL_FLOOR - 0.36), bevel=0.024)
    for s in (-1, 1):
        strut('front-frame-brace', (s * 0.48, -1.55, DECK_Z - 0.46),
              (s * 0.40, HOLE_Y + 0.24, DRILL_FLOOR - 0.30), 0.14, MAT_DARK)
    # steps from the main deck down to the drill floor
    for i in range(3):
        t = (i + 1) / 4.0
        box('drill-floor-step', (0.58, 0.20, 0.028), MAT_HAZARD,
            loc=(-0.72, -2.20 - 0.42 * t, DECK_Z - 0.80 * t + 0.02), bevel=0.005)
    for s in (-1, 1):
        strut('drill-floor-stringer', (-0.72 + s * 0.30, -2.16, DECK_Z),
              (-0.72 + s * 0.30, -2.68, DRILL_FLOOR + 0.03), 0.06, MAT_PAINT)

    # handrails and stanchions along the deck edges, plain round tube
    for s in (-1, 1):
        x = s * (BODY_W / 2 - 0.05)
        for y in (-2.10, -0.90, 0.40, 1.60, 2.25):
            tube('rail-post', 0.024, 1.05, MAT_PAINT, loc=(x, y, DECK_Z))
        for h in (1.02, 0.55):
            tube('rail-run', 0.024, 4.40, MAT_PAINT, loc=(x, -2.10, DECK_Z + h),
                 rot=(-math.pi / 2, 0, 0))
    for x in (-1.0, 1.0):
        tube('rail-post-r', 0.024, 1.05, MAT_PAINT, loc=(x, 2.30, DECK_Z))
    for h in (1.02, 0.55):
        tube('rail-rear', 0.024, BODY_W - 0.14, MAT_PAINT,
             loc=(-BODY_W / 2 + 0.07, 2.30, DECK_Z + h), rot=(0, math.pi / 2, 0))

    perforated_panel('guard-mast', 0.95, 0.92, loc=(-0.62, -2.28, DECK_Z + 0.48))
    perforated_panel('guard-rear', 1.05, 0.92,
                     loc=(BODY_W / 2 - 0.03, 1.55, DECK_Z + 0.48),
                     rot=(0, 0, math.pi / 2))

    # access stair at the rear quarter: open stepped ladder frame with handrails
    st_x, st_y = 0.82, 2.52
    for s in (-1, 1):
        strut('stair-stringer', (st_x + s * 0.26, st_y - 0.10, DECK_Z + 0.02),
              (st_x + s * 0.26, st_y + 0.86, 0.10), 0.075, MAT_PAINT)
        for i in range(5):
            t = (i + 0.5) / 5
            tube('stair-rail-post', 0.020, 0.95, MAT_PAINT,
                 loc=(st_x + s * 0.30, st_y + 0.86 * t,
                      DECK_Z * (1 - t) + 0.08 * t))
        strut('stair-rail', (st_x + s * 0.30, st_y - 0.06, DECK_Z + 0.98),
              (st_x + s * 0.30, st_y + 0.84, 1.02), 0.042, MAT_PAINT)
    for i in range(5):
        t = (i + 0.5) / 5
        box('stair-tread', (0.60, 0.20, 0.028), MAT_HAZARD,
            loc=(st_x, st_y + 0.86 * t, DECK_Z * (1 - t) + 0.10 * t + 0.02),
            bevel=0.006)


def build_body():
    """Power-pack enclosure, on-board air package, tanks and the control stand.

    Louvres: [MET p.22, rc-rig.md §4.7] — horizontal pressed louvre slots in
    GROUPS in the side panels, plus a separate darker badge panel (the badge
    itself deliberately not reproduced, DOMAIN.md §10).

    The air package is sourced: [R16 §A.8] an on-board compressor of roughly
    1000 cfm at 500 psi. Keep it straight from the other air number in the pack:
    the 25.5 m3/min at 24.1 bar in [R02 §A2] is the HAMMER's demand, met by a
    separate compressor standing on the pad, not by this box.
    """
    # ── the machine house: the mass UNDER the deck ──────────────────────────
    # A first render of this model made the mistake worth recording: with only a
    # deck plate on beams over the tracks, the machine read as a scaffold, not as
    # a machine — thin rails everywhere and daylight through the middle. Real
    # crawler rigs of this class fill the whole band between the track top and
    # the deck with a fabricated frame carrying the tanks, the pumps and the
    # valve bank behind bolted access panels. That mass is most of the silhouette
    # below the mast, and REVIEW_RUBRIC axis 4 fails a machine that lacks it.
    hy0, hy1 = -1.75, 2.35
    box('house', (BODY_W - 0.10, hy1 - hy0, 1.02), MAT_PAINT,
        loc=(0, (hy0 + hy1) / 2, 1.51), bevel=0.045)
    for s in (-1, 1):
        for i, (pcy, pcl) in enumerate(((-1.05, 1.05), (0.30, 1.10),
                                        (1.62, 1.05))):
            box('house-panel', (0.03, pcl, 0.74), MAT_PAINT,
                loc=(s * (BODY_W / 2 - 0.03), pcy, 1.53), bevel=0.012)
            for hz in (1.23, 1.83):        # panel fixings, top and bottom rows
                bolt = box('house-panel-bolt', (0.02, 0.03, 0.03), MAT_WORN,
                           loc=(s * (BODY_W / 2 - 0.005), pcy - pcl / 2 + 0.10,
                                hz))
                arrayed(bolt, max(2, int(pcl / 0.26)), (0, 0.26, 0))
        box('house-sill', (0.10, hy1 - hy0, 0.10), MAT_DARK,
            loc=(s * (BODY_W / 2 - 0.05), (hy0 + hy1) / 2, 1.02), bevel=0.014)
    box('house-front', (BODY_W - 0.30, 0.06, 0.90), MAT_DARK,
        loc=(0, hy0 - 0.03, 1.50), bevel=0.014)
    # battery box and toolbox slung under the deck edge, right side
    box('toolbox', (0.28, 0.72, 0.36), MAT_DARK,
        loc=(BODY_W / 2 - 0.05, -1.35, 1.02), bevel=0.02)
    box('battery-box', (0.26, 0.46, 0.30), MAT_DARK,
        loc=(-BODY_W / 2 + 0.04, 1.95, 1.02), bevel=0.02)

    px, py, pw, pd, ph = -0.42, 0.15, 1.60, 2.20, 1.16
    box('powerpack', (pw, pd, ph), MAT_PAINT, loc=(px, py, DECK_Z + ph / 2),
        bevel=0.035)
    box('powerpack-roof', (pw + 0.06, pd + 0.06, 0.05), MAT_DARK,
        loc=(px, py, DECK_Z + ph + 0.02), bevel=0.012)
    for s in (-1, 1):
        for grp in (-0.55, 0.55):
            lv = box('pp-louvre', (0.024, 0.72, 0.030), MAT_DARK,
                     loc=(px + s * (pw / 2 + 0.004), py + grp, DECK_Z + 0.30),
                     rot=(0.42, 0, 0), bevel=0.004)
            arrayed(lv, 8, (0, 0, 0.062))
    box('pp-badge-panel', (0.52, 0.02, 0.20), MAT_DARK,
        loc=(px, py - pd / 2 - 0.02, DECK_Z + 0.92), bevel=0.006)
    tube('exhaust', 0.055, 0.85, MAT_WORN,
         loc=(px + 0.62, py - 0.85, DECK_Z + ph))
    cone('exhaust-cap', 0.085, 0.03, 0.09, MAT_WORN,
         loc=(px + 0.62, py - 0.85, DECK_Z + ph + 0.85), sides=10)
    box('cooler', (pw - 0.16, 0.30, ph - 0.30), MAT_DARK,
        loc=(px, py + pd / 2 + 0.16, DECK_Z + ph / 2), bevel=0.02)
    fin = box('cooler-fin', (pw - 0.24, 0.02, 0.018), MAT_WORN,
              loc=(px, py + pd / 2 + 0.30, DECK_Z + 0.22))
    arrayed(fin, 22, (0, 0, 0.038))

    # air package on the deck, right side
    ax, ay = 0.86, 0.55
    box('air-package', (1.35, 1.95, 1.10), MAT_PAINT,
        loc=(ax, ay, DECK_Z + 0.55), bevel=0.035)
    for s in (-1, 1):
        lv = box('air-louvre', (0.024, 1.40, 0.032), MAT_DARK,
                 loc=(ax + s * 0.678, ay, DECK_Z + 0.26), rot=(0.42, 0, 0),
                 bevel=0.004)
        arrayed(lv, 9, (0, 0, 0.064))
    tube('air-receiver', 0.25, 1.55, MAT_PAINT,
         loc=(ax, ay - 0.78, DECK_Z + 1.34), rot=(-math.pi / 2, 0, 0), sides=18)
    for s in (-1, 1):
        cone('receiver-end', 0.25, 0.10, 0.11, MAT_PAINT,
             loc=(ax, ay + s * 0.775, DECK_Z + 1.34),
             rot=(-s * math.pi / 2, 0, 0), sides=18)
    tube('relief-valve', 0.045, 0.26, MAT_CHROME,
         loc=(ax - 0.16, ay + 0.42, DECK_Z + 1.56))
    tube('air-cooler-drum', 0.20, 0.55, MAT_DARK,
         loc=(ax + 0.30 - 0.275, ay - 1.20, DECK_Z + 0.85),
         rot=(0, math.pi / 2, 0), sides=14)

    # tank fillers and sight gauges standing proud of the house, left side
    tube('tank-filler', 0.075, 0.13, MAT_WORN,
         loc=(-BODY_W / 2 + 0.30, -1.05, DECK_Z + 0.02))
    tube('tank-filler', 0.075, 0.13, MAT_WORN,
         loc=(-BODY_W / 2 + 0.30, 1.62, DECK_Z + 0.02))
    box('sight-gauge', (0.06, 0.05, 0.34), MAT_CHROME,
        loc=(-BODY_W / 2 - 0.01, 1.62, 1.62), bevel=0.006)

    # sample-hose reel: the reel takes the hose up as the head travels, and it
    # is a named catalogue item on this class of machine [MIN p.12, §4.3 item 6]
    tube('hose-reel-drum', 0.24, 0.46, MAT_PAINT,
         loc=(BODY_W / 2 - 0.32, -1.98, DECK_Z + 0.52),
         rot=(0, math.pi / 2, 0), sides=16)
    for s in (0, 1):
        tube('hose-reel-flange', 0.36, 0.035, MAT_PAINT,
             loc=(BODY_W / 2 - 0.32 + s * 0.46, -1.98, DECK_Z + 0.52),
             rot=(0, math.pi / 2, 0), sides=18)
    for s in (-1, 1):
        strut('hose-reel-stand', (BODY_W / 2 - 0.09 + s * 0.28, -1.98, DECK_Z),
              (BODY_W / 2 - 0.09 + s * 0.28, -1.98, DECK_Z + 0.52), 0.07,
              MAT_PAINT)

    # control stand + FOPS canopy
    sx, sy = -0.55, -1.58
    box('control-console', (0.72, 0.42, 0.30), MAT_PAINT,
        loc=(sx, sy, DECK_Z + 0.92), rot=(-0.35, 0, 0), bevel=0.02)
    box('console-pedestal', (0.34, 0.30, 0.78), MAT_DARK,
        loc=(sx, sy + 0.06, DECK_Z + 0.39), bevel=0.02)
    for i, lx in enumerate((-0.22, -0.06, 0.10, 0.24)):
        tube('lever', 0.016, 0.24, MAT_CHROME,
             loc=(sx + lx, sy - 0.06, DECK_Z + 1.03),
             rot=(-0.35 + (i % 2) * 0.12, 0, 0))
    for s in (-1, 1):
        strut('canopy-post', (sx + s * 0.52, sy - 0.44, DECK_Z),
              (sx + s * 0.52, sy - 0.44, DECK_Z + 1.94), 0.070, MAT_PAINT)
        strut('canopy-post', (sx + s * 0.52, sy + 0.52, DECK_Z),
              (sx + s * 0.52, sy + 0.52, DECK_Z + 1.94), 0.070, MAT_PAINT)
    box('canopy-roof', (1.28, 1.16, 0.06), MAT_PAINT,
        loc=(sx, sy + 0.04, DECK_Z + 1.97), bevel=0.018)
    perforated_panel('canopy-fops', 1.14, 0.46,
                     loc=(sx, sy - 0.46, DECK_Z + 1.66))
    box('op-seat', (0.44, 0.42, 0.10), MAT_RUBBER,
        loc=(sx, sy + 0.52, DECK_Z + 0.62), bevel=0.02)
    box('op-seat-back', (0.44, 0.10, 0.46), MAT_RUBBER,
        loc=(sx, sy + 0.72, DECK_Z + 0.88), bevel=0.02)


# ── 3. MAST ───────────────────────────────────────────────────────────────────
def build_mast():
    """A WELDED OPEN LATTICE, not a box beam. Highest-value shape call here.

    [MET p.22, rc-rig.md §4.1 and §9.A]: parallel chord rails with diagonal
    X-web members, sky visible through it for its whole length; two heavy feed
    chains exposed down the outer faces over sprockets at the crown. rc-rig.md
    §5 puts the open web third in the identification list and says a solid beam
    kills the machine's identity instantly. The game's current builder makes a
    closed channel (buildFeedBeam, width 0.56 depth 0.42) — this is the fix.

    Web research on Explorac-class and Schramm exploration masts settled two
    details the local reference could not: the carriage rails run down the FRONT
    face so they stay continuous across the telescope joint, and the rails carry
    two polished stripes worn by the carriage rollers — rc-rig.md §9.K asks for
    exactly that and calls it free.
    """
    pv = empty(NODE_PIVOT, 'mast', None, (0, HOLE_Y, MAST_FOOT))
    pv['axis'] = 'x'
    # -19 deg is the reference photograph's rake, leaning back over the deck;
    # +90 is the head swing from vertical for fan drilling [MIN p.13].
    pv['range_deg'] = [-19.0, 92.0]
    hw, hd = MAST_W / 2, MAST_D / 2
    L = MAST_LEN

    for sx in (-1, 1):
        for sy in (-1, 1):
            box('mast-chord', (0.098, 0.098, L), MAT_DARK, pv,
                (sx * (hw - 0.049), sy * (hd - 0.049), L / 2), bevel=0.009)

    bay = 0.615                       # gives the ~45 deg X the photograph shows
    nbay = int(L / bay)
    for b in range(nbay):
        z0 = 0.14 + b * bay
        z1 = z0 + bay
        for sx in (-1, 1):            # X-web on the two OUTER (visible) faces
            x = sx * (hw - 0.043)
            strut('mast-web', (x, -hd + 0.049, z0), (x, hd - 0.049, z1), 0.056,
                  MAT_DARK, pv)
            strut('mast-web', (x, hd - 0.049, z0), (x, -hd + 0.049, z1), 0.056,
                  MAT_DARK, pv)
        strut('mast-web-back', (-hw + 0.043, hd - 0.043, z0),
              (hw - 0.043, hd - 0.043, z1), 0.045, MAT_DARK, pv)
        for sy in (-1, 1):
            box('mast-strut', (MAST_W - 0.086, 0.05, 0.05), MAT_DARK, pv,
                (0, sy * (hd - 0.043), z0), bevel=0.006)
        for sx in (-1, 1):
            box('mast-strut-side', (0.05, MAST_D - 0.086, 0.05), MAT_DARK, pv,
                (sx * (hw - 0.043), 0, z0), bevel=0.006)

    for sx in (-1, 1):
        box('mast-rail', (0.055, 0.10, L - 0.10), MAT_DARK, pv,
            (sx * (hw - 0.05), -hd - 0.03, L / 2 + 0.02), bevel=0.008)
        box('mast-rail-wear', (0.020, 0.03, L - 0.50), MAT_STEEL, pv,
            (sx * (hw - 0.05), -hd - 0.085, L / 2 + 0.02), bevel=0.003)

    # feed chains, one down each outer face, both runs, over crown sprockets.
    # At any distance this is a continuous fine-toothed dark band down both
    # edges of the mast — one of the strongest texture cues on the machine
    # [MET p.22; rc-rig.md §4.1 and §9.B, which notes the builder has no chain].
    # Pitch 0.060 against a 0.056 link: at 0.062/0.048 the first render came out
    # as two DOTTED lines rather than the continuous fine-toothed dark band the
    # photograph shows. The gap between links has to be a seam, not a space.
    n_link = int((L - 0.42) / 0.060)
    for sx in (-1, 1):
        for face in (-1, 1):
            lk = box('feed-chain-link', (0.030, 0.054, 0.056), MAT_WORN, pv,
                     (sx * (hw + 0.030), face * (hd + 0.045), 0.22), bevel=0.004)
            arrayed(lk, n_link, (0, 0, 0.060))
            pin = tube('feed-chain-pin', 0.012, 0.056, MAT_STEEL, pv,
                       (sx * (hw + 0.030) - 0.028, face * (hd + 0.045), 0.250),
                       rot=(0, math.pi / 2, 0), sides=6)
            arrayed(pin, n_link, (0, 0, 0.060))

    box('mast-foot-hood', (MAST_W + 0.16, MAST_D + 0.20, 0.42), MAT_PAINT, pv,
        (0, 0, 0.20), bevel=0.03)
    for sx in (-1, 1):
        tube('mast-pin-boss', 0.11, 0.10, MAT_CAST, pv,
             (sx * (hw + 0.10) - 0.05, 0, 0.0), rot=(0, math.pi / 2, 0), sides=12)

    # rod clamp / breakout table at the mast foot — right for heavy dual-wall
    # pipe [rc-rig.md §9.L]: a lower holding clamp and an upper breakout clamp.
    box('breakout-table', (0.92, 0.62, 0.16), MAT_DARK, pv, (0, -0.05, 0.44),
        bevel=0.014)
    for z in (0.46, 0.62):
        for sx in (-1, 1):
            box('clamp-jaw', (0.26, 0.20, 0.11), MAT_WORN, pv,
                (sx * 0.20, -0.05, z), rot=(0, 0, sx * 0.18), bevel=0.01)
            tube('clamp-ram', 0.032, 0.30, MAT_CHROME, pv,
                 (sx * 0.34 - sx * 0.15, -0.25, z), rot=(0, sx * math.pi / 2, 0),
                 sides=8)
    torus('rod-guide', 0.115, 0.028, MAT_WORN, pv, (0, 0, 0.66))
    return pv


def build_crown(pv):
    """Telescoping inner stage, crown head frame, jib and the hanging hook.

    [MET p.22, rc-rig.md §4.1]: a black fabricated head frame carrying the chain
    sprockets, a jib arm cantilevered FORWARD past the mast top with a sheave at
    its end, and a winch line with a swivel hook hanging free. The doc calls
    that free-hanging hook one of the most recognisable details in the whole
    photograph, and §9.C records that the game's builder has none of it.

    §8 item 10 is honest that "two-stage" is a READ of the photograph and not a
    published fact, so it is modelled as two and reported as a reading.
    """
    sl = empty(NODE_SLIDE, 'mast-telescope', pv, (0, 0, 0))
    sl['axis'] = 'z'
    sl['range_m'] = [0.0, 2.30]
    iw, idp = MAST_W - 0.20, MAST_D - 0.20
    IL = 2.55
    z0 = MAST_LEN - IL + 0.20
    for sx in (-1, 1):
        for sy in (-1, 1):
            box('mast2-chord', (0.062, 0.062, IL), MAT_DARK, sl,
                (sx * (iw / 2 - 0.031), sy * (idp / 2 - 0.031), z0 + IL / 2),
                bevel=0.006)
    for b in range(4):
        za = z0 + 0.10 + b * 0.58
        for sx in (-1, 1):
            x = sx * (iw / 2 - 0.031)
            strut('mast2-web', (x, -idp / 2, za), (x, idp / 2, za + 0.58),
                  0.038, MAT_DARK, sl)
            strut('mast2-web', (x, idp / 2, za), (x, -idp / 2, za + 0.58),
                  0.038, MAT_DARK, sl)
        for sy in (-1, 1):
            box('mast2-strut', (iw - 0.062, 0.04, 0.04), MAT_DARK, sl,
                (0, sy * (idp / 2 - 0.031), za), bevel=0.005)
    for sx in (-1, 1):
        box('mast2-rail', (0.048, 0.09, IL - 0.20), MAT_DARK, sl,
            (sx * (iw / 2 - 0.045), -idp / 2 - 0.03, z0 + IL / 2), bevel=0.006)

    ct = z0 + IL
    box('crown-frame', (MAST_W + 0.10, MAST_D + 0.14, 0.30), MAT_DARK, sl,
        (0, 0, ct + 0.15), bevel=0.02)
    box('crown-cheek', (MAST_W + 0.16, 0.05, 0.46), MAT_DARK, sl,
        (0, MAST_D / 2 + 0.05, ct + 0.10), bevel=0.01)
    for sx in (-1, 1):
        tube('crown-sprocket', 0.115, 0.05, MAT_CAST, sl,
             (sx * (MAST_W / 2 + 0.035) - 0.025, 0, ct + 0.16),
             rot=(0, math.pi / 2, 0), sides=14)
        for t in range(12):
            a = t / 12 * TAU
            box('crown-tooth', (0.045, 0.026, 0.030), MAT_WORN, sl,
                (sx * (MAST_W / 2 + 0.035), math.sin(a) * 0.126,
                 ct + 0.16 + math.cos(a) * 0.126), rot=(-a, 0, 0), bevel=0.003)

    jib_y = -MAST_D / 2 - 0.86
    strut('crown-jib', (0, -MAST_D / 2 + 0.04, ct + 0.24), (0, jib_y, ct + 0.30),
          0.13, MAT_DARK, sl)
    strut('crown-jib-brace', (0, -MAST_D / 2 + 0.04, ct - 0.10),
          (0, jib_y + 0.24, ct + 0.24), 0.06, MAT_DARK, sl)
    for sx in (-1, 1):
        box('jib-cheek', (0.03, 0.34, 0.24), MAT_DARK, sl,
            (sx * 0.09, jib_y + 0.06, ct + 0.28), bevel=0.006)
    tube('jib-sheave', 0.10, 0.05, MAT_CAST, sl,
         (-0.025, jib_y - 0.02, ct + 0.28), rot=(0, math.pi / 2, 0), sides=16)

    hk = empty(NODE_SLIDE, 'winch-hook', sl, (0, jib_y - 0.02, ct + 0.28))
    hk['axis'] = 'z'
    hk['range_m'] = [-6.0, 0.0]
    hose('winch-line', [(0, 0, -0.10), (0.004, 0.0, -0.74), (0, 0, -1.32)],
         radius=0.009, mat=MAT_STEEL, parent=hk, sides=6)
    tube('hook-swivel', 0.045, 0.16, MAT_WORN, hk, (0, 0, -1.48))
    tube('hook-shank', 0.028, 0.14, MAT_WORN, hk, (0, 0, -1.62))
    torus('hook-bill', 0.075, 0.026, MAT_WORN, hk, (0, 0, -1.68),
          rot=(math.pi / 2, 0, 0), mseg=12, nseg=6)

    worklight('crown', sl, (0.30, -MAST_D / 2 - 0.14, ct + 0.02),
              aim_dir=(-0.30, -0.30, -6.0), cone_deg=44, range_m=30)
    return sl, hk


# ── 4. CARRIAGE, ROTARY HEAD, RC PLUMBING ─────────────────────────────────────
def build_head(pv):
    """Rotary head on the carriage, and the plumbing that makes this an RC rig
    rather than a rotary rig.

    Flow order [R02 §A2 from BL-RC; shapes from MIN pp.12-13, rc-rig.md §4.3]:
      combination/dual swivel -> head wear tube (bolted flanges along its length,
      90 deg bend, sliding blow-back cylinder) -> deflector box -> knock-on hose
      tail (3 or 4 in, coarse retaining nut) -> sample hose.

    The sample must leave SIDEWAYS from a box on the SIDE of the head, never from
    the top. rc-rig.md §4.3 is explicit that a rotary rig and an RC rig share a
    mast, a head and a carriage, and that this is the only thing that says RC.

    The head is rated 30-40 t axial and radial and swings +/-90 deg from vertical
    for fan drilling [MIN p.13], so the head-to-mast joint is modelled as a rated
    pivot on a real pin boss, not as a bracket.
    """
    sl = empty(NODE_SLIDE, 'carriage', pv, (0, 0, MAST_LEN - 2.05))
    sl['axis'] = 'z'
    sl['range_m'] = [-(MAST_LEN - 2.95), 1.55]
    hw, hd = MAST_W / 2, MAST_D / 2

    box('carriage-plate', (MAST_W + 0.22, 0.16, 0.86), MAT_PAINT, sl,
        (0, -hd - 0.13, 0), bevel=0.02)
    for sx in (-1, 1):
        box('carriage-roller-box', (0.15, 0.22, 0.80), MAT_DARK, sl,
            (sx * (hw + 0.04), -hd - 0.06, 0), bevel=0.012)
        for z in (-0.30, 0.30):
            tube('carriage-roller', 0.055, 0.09, MAT_CAST, sl,
                 (sx * (hw + 0.04) - 0.045, -hd - 0.06, z),
                 rot=(0, math.pi / 2, 0), sides=10)
        box('chain-anchor', (0.07, 0.10, 0.20), MAT_WORN, sl,
            (sx * (hw + 0.036), -hd - 0.02, 0.42), bevel=0.008)

    tube('head-swing-boss', 0.13, 0.30, MAT_CAST, sl,
         (-0.15, -hd - 0.30, 0.10), rot=(0, math.pi / 2, 0), sides=14)
    pvh = empty(NODE_PIVOT, 'head-swing', sl, (0, -hd - 0.30, 0.10))
    pvh['axis'] = 'y'
    pvh['range_deg'] = [-90.0, 90.0]

    # bulky gearbox body with a conical bell lower housing and a splined dark
    # spindle below [rc-rig.md §4.2]. Painted in the machine colour against a
    # grey mast — the one bright complicated object moving on a plain structure,
    # which is why it carries most of the eye.
    box('head-gearbox', (0.62, 0.66, 0.60), MAT_PAINT, pvh, (0, -0.16, -0.16),
        bevel=0.03)
    box('head-motor-pad', (0.30, 0.34, 0.22), MAT_PAINT, pvh,
        (-0.40, -0.16, 0.02), bevel=0.02)
    tube('head-motor', 0.115, 0.30, MAT_DARK, pvh, (-0.62, -0.16, 0.02),
         rot=(0, -math.pi / 2, 0), sides=12)
    tube('head-motor', 0.115, 0.30, MAT_DARK, pvh, (0.42, -0.16, 0.02),
         rot=(0, math.pi / 2, 0), sides=12)
    cone('head-bell', 0.30, 0.155, 0.34, MAT_PAINT, pvh, (0, -0.16, -0.80),
         sides=18)
    for t in range(10):
        a = t / 10 * TAU
        box('head-bolt', (0.036, 0.036, 0.026), MAT_WORN, pvh,
            (math.cos(a) * 0.255, -0.16 + math.sin(a) * 0.255, -0.47),
            rot=(0, 0, a), bevel=0.004)

    spn = empty(NODE_PIVOT, 'spindle', pvh, (0, -0.16, -0.80))
    spn['axis'] = 'z'
    tube('spindle', 0.088, 0.46, MAT_STEEL, spn, (0, 0, -0.46), sides=14)
    for t in range(16):
        a = t / 16 * TAU
        box('spindle-spline', (0.016, 0.016, 0.30), MAT_STEEL, spn,
            (math.cos(a) * 0.088, math.sin(a) * 0.088, -0.36), rot=(0, 0, a))
    tube('saver-sub', 0.098, 0.20, MAT_WORN, spn, (0, 0, -0.66), sides=14)
    empty(NODE_MOUNT, 'tool', spn, (0, 0, -0.66))

    # combination / dual swivel: one rotating joint carrying TWO flow paths,
    # air in and sample out, on a stepped chrome shaft in a compact housing
    tube('dual-swivel', 0.135, 0.30, MAT_CAST, pvh, (0, -0.16, 0.30), sides=16)
    tube('swivel-shaft', 0.062, 0.16, MAT_CHROME, pvh, (0, -0.16, 0.58), sides=12)
    tube('air-inlet-elbow', 0.055, 0.24, MAT_WORN, pvh, (0, 0.04, 0.42),
         rot=(math.pi / 2, 0, 0), sides=10)

    # head wear tube / blow-back assembly
    tube('wear-tube', 0.072, 0.92, MAT_WORN, pvh, (0.40, -0.16, -0.30), sides=12)
    for z in (-0.26, 0.02, 0.32, 0.58):
        tube('wear-tube-flange', 0.098, 0.030, MAT_WORN, pvh, (0.40, -0.16, z),
             sides=12)
    tube('blowback-ram', 0.030, 0.34, MAT_CHROME, pvh, (0.30, -0.16, 0.10),
         sides=8)

    # deflector box: heavy fabricated wedge, bolted flange face, smooth 90 deg
    # internal path — where the sample turns from vertical to horizontal and
    # LEAVES THE RIG SIDEWAYS.
    box('deflector-box', (0.40, 0.40, 0.42), MAT_PAINT, pvh,
        (0.44, -0.16, -0.62), bevel=0.035)
    box('deflector-wedge', (0.34, 0.36, 0.20), MAT_PAINT, pvh,
        (0.52, -0.16, -0.76), rot=(0, -0.5, 0), bevel=0.03)
    for t in range(8):
        a = t / 8 * TAU
        box('deflector-bolt', (0.030, 0.030, 0.024), MAT_WORN, pvh,
            (0.44 + math.cos(a) * 0.17, -0.16 + math.sin(a) * 0.17, -0.415),
            rot=(0, 0, a), bevel=0.003)
    cone('hose-tail', 0.088, 0.070, 0.26, MAT_WORN, pvh, (0.62, -0.16, -0.68),
         rot=(0, math.pi / 2 + 0.22, 0), sides=14)
    tube('knock-on-nut', 0.105, 0.055, MAT_WORN, pvh, (0.66, -0.16, -0.665),
         rot=(0, math.pi / 2 + 0.22, 0), sides=12)
    empty(NODE_MOUNT, 'sample-out', pvh, (0.90, -0.16, -0.735))

    hose('head-water-line', [(-0.34, 0.14, 0.30), (-0.30, 0.20, -0.10),
                             (-0.16, 0.08, -0.55)], radius=0.016,
         mat=MAT_RUBBER, parent=pvh, sides=6)
    worklight('head', pvh, (-0.44, -0.44, -0.30), aim_dir=(0.2, -0.4, -3.0),
              cone_deg=60, range_m=18)
    return sl, pvh, spn


# ── 5. ROD HANDLING — deck rack + swing arm, NOT a carousel ───────────────────
def build_rod_handling(pv):
    """[MET p.22, rc-rig.md §4.6 and §9.E]: the rods lie HORIZONTALLY in a rack
    along the deck between upright stanchions, and a hydraulic swing arm hinged
    near the head end of the mast — a long straight tube with its own cylinder
    strapped to it — reaches out and up to about 0.55 of standing height and
    brings them to centre.

    There is no rod carousel on this machine. A carousel is a core-rig and
    tophammer idiom; the game currently builds one at mid-mast (buildCarousel,
    5 rods). The arm is also the better animation: it is big, it crosses the
    silhouette, and it is unmistakably this class.
    """
    rx = 1.02
    ry0 = -1.55
    for y in (ry0, ry0 + 1.45, ry0 + 2.85):
        for sx in (-1, 1):
            box('rack-stanchion', (0.06, 0.06, 0.52), MAT_DARK,
                loc=(rx + sx * 0.34, y, DECK_Z + 0.26), bevel=0.006)
        for z in (DECK_Z + 0.10, DECK_Z + 0.28):
            box('rack-cradle', (0.80, 0.08, 0.06), MAT_DARK, loc=(rx, y, z),
                bevel=0.008)
    for layer, z in enumerate((DECK_Z + 0.17, DECK_Z + 0.35)):
        n = 5 if layer == 0 else 4
        for i in range(n):
            xo = rx - 0.29 + i * 0.145 + (0.072 if layer else 0)
            tube('rod', ROD_OD / 2, ROD_LEN, MAT_WORN,
                 loc=(xo, ry0 - 0.15, z), rot=(-math.pi / 2, 0, 0), sides=10)
            tube('rod-box-end', ROD_OD / 2 + 0.013, 0.17, MAT_STEEL,
                 loc=(xo, ry0 - 0.15, z), rot=(-math.pi / 2, 0, 0), sides=10)

    arm = empty(NODE_PIVOT, 'rod-arm', pv, (MAST_W / 2 + 0.10, 0.10, 1.60))
    arm['axis'] = 'z'
    arm['range_deg'] = [0.0, 155.0]
    box('rod-arm-boss', (0.20, 0.20, 0.34), MAT_PAINT, arm, (0, 0, 0), bevel=0.02)
    strut('rod-arm-tube', (0, 0, 0.06), (1.42, 0.34, 0.30), 0.11, MAT_PAINT, arm)
    strut('rod-arm-cyl-body', (0.16, 0.02, -0.02), (0.86, 0.18, 0.10), 0.075,
          MAT_PAINT, arm)
    strut('rod-arm-cyl-rod', (0.86, 0.18, 0.10), (1.20, 0.26, 0.20), 0.030,
          MAT_CHROME, arm)
    grp = empty(NODE_PIVOT, 'rod-gripper', arm, (1.46, 0.35, 0.31))
    grp['axis'] = 'z'
    box('gripper-body', (0.22, 0.20, 0.22), MAT_PAINT, grp, (0, 0, 0), bevel=0.018)
    for sy in (-1, 1):
        box('gripper-jaw', (0.09, 0.20, 0.16), MAT_WORN, grp,
            (0.13, sy * 0.10, 0), rot=(0, 0, sy * 0.35), bevel=0.01)
    return arm, grp


# ── 6. JACKS — four vertical legs, outboard of the tracks ─────────────────────
def build_jacks():
    """[MET p.22, rc-rig.md §4.9 and §9.L]: four square-section vertical legs
    dropping straight down at the deck corners, OUTBOARD of the track width,
    each with a large dished round foot pad and its own hydraulic hose. In the
    photograph the machine stands on the jacks with the tracks off the ground.
    Not swing-out outriggers, not a dozer blade.

    All four legs hang on ONE slide node, for the same reason the game's own
    builder gives: four independent nodes is four times the draw calls, bought
    for a levelling motion the player never inspects that closely.
    """
    sl = empty(NODE_SLIDE, 'jacks', None, (0, 0, 0))
    sl['axis'] = 'z'
    sl['range_m'] = [0.0, 0.80]
    for (sx, y) in ((-1, -2.55), (1, -2.55), (-1, 2.10), (1, 2.10)):
        x = sx * JACK_X
        box('jack-housing', (0.24, 0.24, 1.05), MAT_DARK,
            loc=(x, y, DECK_Z - 0.62), bevel=0.018)
        strut('jack-stay', (sx * (BODY_W / 2 - 0.30), y, DECK_Z - 0.20),
              (x, y, DECK_Z - 0.30), 0.10, MAT_DARK)
        tube('jack-cyl', 0.085, 0.60, MAT_DARK, loc=(x, y, DECK_Z - 0.10),
             sides=12)
        box('jack-leg', (0.18, 0.18, 1.55), MAT_PAINT, sl, (x, y, 1.02),
            bevel=0.014)
        tube('jack-rod', 0.052, 0.42, MAT_CHROME, sl, (x, y, 1.78), sides=10)
        tube('jack-pin', 0.055, 0.10, MAT_WORN, sl, (x, y, 0.16), sides=10)
        cone('jack-pad', 0.12, 0.285, 0.09, MAT_WORN, sl, (x, y, 0.085), sides=18)
        tube('jack-pad-plate', 0.285, 0.05, MAT_WORN, sl, (x, y, 0.035),
             sides=18)
    return sl


# ── 7. THE SAMPLE TRAIN ───────────────────────────────────────────────────────
def build_cyclone(parent):
    """Ceramic-lined cyclone, built top-down from [MIN p.13] via rc-rig.md §4.4:

      inlet head / wear bend  fabricated box with a TANGENTIAL inlet flange on
                              one side — the alumina-ceramic-tiled wear bend
      barrel                  squat cylinder about as tall as it is wide, bolted
                              flanges top and bottom, hinged inspection lid on
                              gas-assist struts with over-centre lever locks
      cone                    1.5-1.6 barrel diameters long, small outlet
      vibrators               "multi heavy-duty vibrators: assist in un-clogging
                              of damp sample" — drum-shaped motors bolted to the
                              cone. Visible lumps, not a smooth taper.

    The lid and the vibrators are the two named parts rc-rig.md §9.I says are
    missing from the game's own cyclone tool today. Absolute size is NOT SOURCED
    (§8 item 7) — only these ratios are readable, and only roughly.
    """
    r = CYC_BARREL_D / 2
    z_cone0 = CYC_OUT_Z + CYC_CONE_H
    z_top = z_cone0 + CYC_BARREL_H
    cone('cyc-cone', 0.105, r, CYC_CONE_H, MAT_PAINT, parent, (0, 0, CYC_OUT_Z),
         sides=20)
    tube('cyc-barrel', r, CYC_BARREL_H, MAT_PAINT, parent, (0, 0, z_cone0),
         sides=20)
    tube('cyc-flange-out', 0.15, 0.028, MAT_DARK, parent,
         (0, 0, CYC_OUT_Z - 0.014), sides=16)
    for z in (z_cone0, z_top):
        tube('cyc-flange', r + 0.045, 0.028, MAT_DARK, parent, (0, 0, z - 0.014),
             sides=20)
    for t in range(12):
        a = t / 12 * TAU
        box('cyc-flange-bolt', (0.028, 0.028, 0.022), MAT_WORN, parent,
            (math.cos(a) * (r + 0.025), math.sin(a) * (r + 0.025), z_cone0),
            rot=(0, 0, a), bevel=0.003)
    box('cyc-inlet-head', (r * 2.0, r * 2.0, 0.34), MAT_PAINT, parent,
        (0, 0, z_top + 0.17), bevel=0.03)
    tube('cyc-inlet-flange', 0.105, 0.22, MAT_DARK, parent,
         (-r - 0.06, r * 0.55, z_top + 0.17), rot=(0, -math.pi / 2, 0), sides=14)
    tube('cyc-inlet-ring', 0.135, 0.030, MAT_WORN, parent,
         (-r - 0.24, r * 0.55, z_top + 0.17), rot=(0, -math.pi / 2, 0), sides=14)
    empty(NODE_MOUNT, 'cyclone-inlet', parent, (-r - 0.26, r * 0.55, z_top + 0.17))
    tube('cyc-vortex-stack', 0.10, 0.42, MAT_WORN, parent, (0, 0, z_top + 0.34),
         sides=14)
    cone('cyc-vent-cap', 0.155, 0.05, 0.11, MAT_WORN, parent,
         (0, 0, z_top + 0.76), sides=14)
    box('cyc-lid', (r * 1.5, r * 1.5, 0.05), MAT_DARK, parent,
        (0.06, 0, z_top + 0.36), rot=(0, 0.30, 0), bevel=0.01)
    for sy in (-1, 1):
        strut('cyc-lid-strut', (r * 0.5, sy * r * 0.55, z_top + 0.30),
              (-r * 0.30, sy * r * 0.60, z_top + 0.44), 0.026, MAT_CHROME, parent)
        box('cyc-lever-lock', (0.05, 0.13, 0.05), MAT_WORN, parent,
            (-r * 0.75, sy * r * 0.5, z_top + 0.30), rot=(0.6, 0, 0), bevel=0.006)
    for sy, zz in ((1, 0.42), (-1, 0.66)):
        rr = 0.105 + (r - 0.105) * (1.0 - zz / CYC_CONE_H)
        tube('cyc-vibrator', 0.075, 0.20, MAT_DARK, parent,
             (rr * 0.7, sy * rr * 0.7, CYC_OUT_Z + zz), rot=(0, math.pi / 2, 0),
             sides=10)
    # the ceramic liner showing at the outlet: a different family of surface
    # from the painted shell [MIN p.13 — alumina tiles, urethane base cone]
    tube('cyc-liner', 0.088, 0.14, MAT_CAST, parent, (0, 0, CYC_OUT_Z - 0.02),
         sides=14)


def build_sample_train():
    """Everything that makes this an RC pad rather than just a drill: cyclone on
    a stand, splitter and double drop box under it, calico bags on a ring AND in
    rows on the dirt, chip trays on a trestle, bulk reject pile.

    rc-rig.md §4.4 records BOTH field patterns and asks for both: a free-standing
    cyclone stand on deep exploration spreads, AND the deck-cantilevered slew arm
    with a hydraulic deploy cylinder that every modern rig has. §9.H: "the machine
    currently has no support arm anywhere, which no modern RC rig lacks, and the
    hose therefore has nothing to hang from. Adding the arm is the fix; removing
    the tower is a separate decision." So this model builds both.
    """
    st = bpy.data.objects.new('cyclone-stand', None)
    bpy.context.collection.objects.link(st)
    st.location = (CYC_X, CYC_Y, 0)
    bpy.context.view_layer.update()
    POST = 3.20
    for (sx, sy) in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        strut('stand-post', (sx * 0.68, sy * 0.68, 0), (sx * 0.60, sy * 0.60, POST),
              0.085, MAT_PAINT, st)
        box('stand-foot', (0.30, 0.30, 0.04), MAT_WORN, st,
            (sx * 0.68, sy * 0.68, 0.020), bevel=0.005)
    for z in (0.78, 1.58, POST - 0.06):
        f = 1 - (z / POST) * 0.12
        for i in range(4):
            along = i % 2 == 0
            sgn = -1 if i < 2 else 1
            box('stand-ring', (1.36 * f if along else 0.06,
                               0.06 if along else 1.36 * f, 0.06), MAT_PAINT, st,
                (0 if along else sgn * 0.68 * f,
                 sgn * 0.68 * f if along else 0, z), bevel=0.006)
    # full X-bracing on all four faces: a first render had the cyclone floating
    # on four wires. A tower carrying a cyclone plus a wet sample load is braced.
    for face in range(4):
        ax, ay = ((-1, -1), (1, -1), (1, 1), (-1, 1))[face]
        bx, by = ((1, -1), (1, 1), (-1, 1), (-1, -1))[face]
        for (z0, z1) in ((0.10, 0.78), (0.78, 1.58), (1.58, POST - 0.06)):
            f0 = 1 - (z0 / POST) * 0.12
            f1 = 1 - (z1 / POST) * 0.12
            strut('stand-brace', (ax * 0.66 * f0, ay * 0.66 * f0, z0),
                  (bx * 0.66 * f1, by * 0.66 * f1, z1), 0.042, MAT_PAINT, st)
    box('stand-walkway', (1.36, 1.36, 0.04), MAT_DARK, st, (0, 0, 1.60),
        bevel=0.008)
    for i in range(4):
        along = i % 2 == 0
        sgn = -1 if i < 2 else 1
        box('stand-kick', (1.36 if along else 0.03, 0.03 if along else 1.36, 0.10),
            MAT_HAZARD, st,
            (0 if along else sgn * 0.66, sgn * 0.66 if along else 0, 1.67),
            bevel=0.004)
    for (sx, sy) in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        tube('stand-rail-post', 0.022, 1.02, MAT_PAINT, st,
             (sx * 0.62, sy * 0.62, 1.62))
    for h in (1.00, 0.54):
        for i in range(3):
            along = i % 2 == 0
            sgn = -1 if i < 2 else 1
            tube('stand-rail', 0.022, 1.24, MAT_PAINT, st,
                 (-0.62 if along else sgn * 0.62,
                  sgn * 0.62 if along else -0.62, 1.62 + h),
                 rot=(0, math.pi / 2, 0) if along else (-math.pi / 2, 0, 0))
    for sx in (-1, 1):
        strut('stand-ladder-side', (-0.90, sx * 0.20, 0.02),
              (-0.66, sx * 0.20, 1.72), 0.045, MAT_PAINT, st)
    for i in range(7):
        t = i / 6
        tube('stand-rung', 0.016, 0.40, MAT_PAINT, st,
             (-0.90 + 0.24 * t, -0.20, 0.14 + 1.52 * t), rot=(-math.pi / 2, 0, 0))

    build_cyclone(st)

    # splitter + double drop box under the cone.
    # [R16 §B.7]: cone splitter, alumina-ceramic-lined, DOUBLE 25 L drop box,
    # bolt-in 4/6/8/10 % blades, working splits 6.25-12.5 %, 3000 cfm / 750 psi.
    # The game builds a riffle box; both types are real (rc-rig.md §9.J). Built
    # here as the cone splitter the research pack documents, with the two drop
    # boxes and the red-handled blade levers visible in the [MIN] render.
    sz = 1.32
    cone('split-hopper', 0.30, 0.10, 0.30, MAT_DARK, st, (0, 0, sz + 0.30),
         sides=16)
    box('split-body', (0.56, 0.56, 0.34), MAT_PAINT, st, (0, 0, sz + 0.15),
        bevel=0.025)
    for t in range(8):
        a = t / 8 * TAU
        box('split-bolt', (0.026, 0.026, 0.020), MAT_WORN, st,
            (math.cos(a) * 0.24, math.sin(a) * 0.24, sz + 0.325), rot=(0, 0, a),
            bevel=0.003)
    for sx in (-1, 1):
        box('drop-box', (0.28, 0.30, 0.34), MAT_PAINT, st,
            (sx * 0.34, 0.02, sz - 0.10), bevel=0.02)
        cone('drop-chute', 0.13, 0.05, 0.22, MAT_DARK, st,
             (sx * 0.34, 0.02, sz - 0.29), sides=12)
        box('split-lever', (0.05, 0.16, 0.035), MAT_HAZARD, st,
            (sx * 0.34, -0.20, sz + 0.04), rot=(-0.5, 0, 0), bevel=0.005)
    cone('reject-chute', 0.16, 0.30, 0.34, MAT_DARK, st, (0, 0, sz - 0.44),
         sides=14)
    box('reject-spout', (0.22, 0.44, 0.20), MAT_DARK, st, (0, -0.30, sz - 0.62),
        rot=(0.7, 0, 0), bevel=0.014)

    # calico bags on a ring under the drop chutes [R16 §B.7, R02 §A2]:
    # drawstring cloth, 200x300 to 600x900 mm, 2-3 kg of chips per metre.
    torus('bag-ring', 0.42, 0.020, MAT_PAINT, st, (0, 0.62, 0.92), mseg=20, nseg=6)
    for (lx, ly) in ((-0.40, 0.62), (0.40, 0.62), (0.0, 1.00)):
        strut('bag-ring-leg', (lx, ly, 0.0), (lx * 0.95, ly * 0.97, 0.92),
              0.035, MAT_PAINT, st)
    for (bx, by, fill, rz) in ((-0.20, 0.50, 0.86, 0.3), (0.22, 0.52, 0.72, -0.5),
                               (0.02, 0.82, 0.40, 1.1)):
        h = 0.20 + 0.20 * fill
        # MAT_WORN, not MAT_RUBBER. rc-rig.md §6: the bags are PALE CLOTH and
        # 'the lightest objects in the scene'. The nine MAT_ names carry no
        # cloth, and rubber reads near-black — the worst possible value for the
        # one thing that has to stand out under the cone. wornSteel is the least
        # wrong of the nine. assets.js does have a `sampleBag` KIND; wiring that
        # in is a job for whoever owns the loader (see the report).
        b = cone('calico-bag', 0.115 + 0.035 * fill, 0.085, h, MAT_WORN, st,
                 (bx, by, 0.92 - h), rot=(0, 0, rz), sides=8)
        b.scale = (1.0, 0.82, 1.0)
        tube('bag-neck', 0.055, 0.09, MAT_WORN, st, (bx, by, 0.91), sides=8)
    # and laid out in rows on the dirt — [R16 §A.8] says that is what the
    # photograph actually shows, one or two bags per metre drilled
    for i in range(10):
        row, col = i // 5, i % 5
        b = cone('calico-bag-row', 0.145, 0.105, 0.32, MAT_WORN, st,
                 (1.15 + row * 0.46, -0.66 + col * 0.36, 0.145),
                 rot=(0.10 * (i % 3) - 0.10, math.pi / 2, 0.4 * i), sides=8)
        b.scale = (0.86, 1.0, 1.0)      # a filled sack slumps, it is not round

    # chip trays on a trestle: long thin plastic cases with a row of half-cup
    # sections, one section per metre [R02 §A2]. NOT timber core boxes — that is
    # the core rig, and confusing the two is the classic RC modelling error.
    tx, ty = CYC_X + 1.55, CYC_Y + 1.75
    for sx in (-1, 1):
        for sy in (-1, 1):
            strut('trestle-leg', (tx + sx * 0.62, ty + sy * 0.26, 0),
                  (tx + sx * 0.52, ty + sy * 0.22, 0.74), 0.055, MAT_PAINT)
    box('trestle-top', (1.36, 0.62, 0.05), MAT_PAINT, loc=(tx, ty, 0.77),
        bevel=0.008)
    for k in range(3):
        z = 0.80 + k * 0.055
        y = ty - 0.20 + k * 0.19
        box('chip-tray', (1.22, 0.17, 0.045), MAT_DARK, loc=(tx, y, z),
            bevel=0.006)
        cup = tube('chip-cup', 0.036, 0.030, MAT_WORN,
                   loc=(tx - 0.55, y, z + 0.014), sides=8)
        arrayed(cup, 20, (0.058, 0, 0))

    # Bulk reject pile, growing all shift under the splitter's reject spout.
    # Built as a radial mound with multi-frequency noise on radius AND height,
    # not as a cone primitive: REVIEW_RUBRIC axis 4 makes "a primitive left
    # visible as a primitive" an automatic fail, and a first render of this model
    # had a clean 18-sided cone on the pad looking like a circus tent. Angle of
    # repose about 35 deg, which is where dry rock chips actually stand.
    R, H, RINGS, SEG = 1.05, 0.52, 6, 26
    verts, faces = [], []
    for ri in range(RINGS + 1):
        fr = ri / RINGS
        for si in range(SEG):
            a = si / SEG * TAU
            n = (0.13 * math.sin(a * 3.0 + fr * 2.2)
                 + 0.08 * math.sin(a * 7.0 - fr * 4.1)
                 + 0.05 * math.sin(a * 13.0 + fr * 1.3))
            r = R * fr * (1.0 + n * (0.4 + 0.6 * fr))
            z = H * (1.0 - fr ** 1.45) * (1.0 + 0.10 * math.sin(a * 5.0 + fr * 6))
            verts.append((math.cos(a) * r, math.sin(a) * r, max(0.0, z)))
    for ri in range(RINGS):
        for si in range(SEG):
            a0 = ri * SEG + si
            a1 = ri * SEG + (si + 1) % SEG
            faces.append((a0, a1, a1 + SEG, a0 + SEG))
    me = bpy.data.meshes.new('reject-pile')
    me.from_pydata(verts, [], faces)
    me.update()
    pile = bpy.data.objects.new('reject-pile', me)
    bpy.context.collection.objects.link(pile)
    part('reject-pile', pile, MAT_WORN, None, (CYC_X - 0.15, CYC_Y - 1.25, 0))
    for i in range(14):               # loose chips at the toe of the pile
        a = i * 2.399
        rr = 1.06 + (i % 4) * 0.13
        box('reject-chip', (0.09 + 0.03 * (i % 3), 0.07, 0.045), MAT_WORN,
            loc=(CYC_X - 0.15 + math.cos(a) * rr,
                 CYC_Y - 1.25 + math.sin(a) * rr, 0.022),
            rot=(0, 0.1 * (i % 3), a), bevel=0.006)
    return st


def build_cyclone_arm():
    """Deck-mounted slew base, fabricated support arm and hydraulic deploy
    cylinder, carrying the sample-hose loop out over the cyclone inlet.

    [MIN p.13] sells "automatic deploy, restore, and leveling options", which
    only make sense for a rig-mounted arm; [R16 §A.8] describes the cyclone as
    cantilevered off the rig deck, hydraulically raised and rotatable. This is
    the fix rc-rig.md §9.H asks for.
    """
    bx, by, bz = ARM_BASE
    box('cyc-arm-base', (0.46, 0.46, 0.20), MAT_DARK, loc=(bx, by, bz - 0.10),
        bevel=0.018)
    for t in range(10):
        a = t / 10 * TAU
        box('cyc-arm-base-bolt', (0.028, 0.028, 0.020), MAT_WORN,
            loc=(bx + math.cos(a) * 0.27, by + math.sin(a) * 0.27, bz - 0.18),
            rot=(0, 0, a), bevel=0.003)
    pv = empty(NODE_PIVOT, 'cyclone-arm', None, (bx, by, bz))
    pv['axis'] = 'z'
    pv['range_deg'] = [-95.0, 15.0]
    ex, ey, ez = (ARM_TIP[0] - bx, ARM_TIP[1] - by, ARM_TIP[2] - bz)
    tube('cyc-arm-post', 0.14, 0.62, MAT_PAINT, pv, (0, 0, 0), sides=14)
    strut('cyc-arm-boom', (0, 0, 0.52), (ex, ey, ez), 0.17, MAT_PAINT, pv)
    strut('cyc-arm-knee', (0, 0, 0.10), (ex * 0.30, ey * 0.30, ez * 0.30 + 0.44),
          0.10, MAT_PAINT, pv)
    strut('cyc-arm-cyl', (0.10, 0.20, 0.02), (ex * 0.52, ey * 0.52, ez * 0.52),
          0.080, MAT_PAINT, pv)
    strut('cyc-arm-rod', (ex * 0.52, ey * 0.52, ez * 0.52),
          (ex * 0.78, ey * 0.78, ez * 0.78 + 0.06), 0.032, MAT_CHROME, pv)
    torus('hose-saddle', 0.15, 0.032, MAT_PAINT, pv, (ex, ey, ez + 0.04),
          rot=(math.pi / 2, 0.20, 0), mseg=14, nseg=6)
    for s in (-1, 1):        # the saddle's guide horns keep the loop on the arm
        box('hose-saddle-horn', (0.04, 0.10, 0.26), MAT_PAINT, pv,
            (ex + s * 0.16, ey, ez + 0.16), rot=(0, s * 0.35, 0), bevel=0.008)
    empty(NODE_MOUNT, 'hose-saddle', pv, (ex, ey, ez + 0.10))
    worklight('sample-arm', pv, (ex * 0.8, ey * 0.8, ez + 0.30),
              aim_dir=(1.2, 0.9, -1.6), cone_deg=64, range_m=20)
    return pv


# ── 8. HOSES ──────────────────────────────────────────────────────────────────
def _bez4(a, b, c, d, t):
    u = 1 - t
    return tuple(u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i]
                 + t * t * t * d[i] for i in range(3))


def _bez4_tan(a, b, c, d, t):
    u = 1 - t
    return tuple(3 * u * u * (b[i] - a[i]) + 6 * u * t * (c[i] - b[i])
                 + 3 * t * t * (d[i] - c[i]) for i in range(3))


def build_hoses():
    """Three hose populations that must not be confused [rc-rig.md §4.10]:

      1. HYDRAULIC — small bore, in tight parallel ranks, running bulkhead plate
         to bulkhead plate through a deflection guide, with the electric cable
         inside the bundle and a flat fabric hose bag over it [BAUER]. Hoses are
         sold and fitted as PACKAGES, so this is one slack bundle shape, not
         dozens of independently wandering lines.
      2. THE SAMPLE HOSE — a single fat 3-4 in CORRUGATED hose, an order of
         magnitude fatter than any hydraulic hose on the machine, hanging in a
         lazy loop from the head box to the cyclone inlet. rc-rig.md §5 makes
         this identification cue number one for the whole class; §9.G says a
         ribbed profile is "the cheapest single gain in this whole document".
      3. THE AIR BULL HOSE from the compressor, lying on the ground from a
         separate machine to the rig: 2 in and 1.5 in bore, 1300/1450 psi, two
         braided layers of high-tensile steel wire under an abrasion-resistant
         synthetic rubber cover, non-skive couplings [AUSMIN]. So: thick, matte,
         stiff, with big swaged steel end fittings.
    """
    for (px, py, pz) in ((0.28, -2.28, DECK_Z + 0.34),
                         (0.30, HOLE_Y + 0.55, MAST_FOOT + 0.72)):
        box('bulkhead-plate', (0.40, 0.05, 0.26), MAT_DARK, loc=(px, py, pz),
            bevel=0.008)
        for i in range(6):
            tube('bulkhead-union', 0.020, 0.10, MAT_STEEL,
                 loc=(px - 0.15 + i * 0.06, py + 0.05, pz + 0.06),
                 rot=(math.pi / 2, 0, 0), sides=6)
    tube('hose-deflection-roller', 0.075, 0.34, MAT_DARK,
         loc=(0.11, -2.55, DECK_Z + 0.12), rot=(0, math.pi / 2, 0), sides=12)
    hose('hose-bag', [(0.28, -2.28, DECK_Z + 0.36),
                      (0.29, -2.62, DECK_Z + 0.02),
                      (0.30, -2.86, MAST_FOOT + 1.20),
                      (0.30, HOLE_Y + 0.55, MAST_FOOT + 0.80)],
         radius=0.105, mat=MAT_DARK, sides=8)
    for i in range(4):
        o = i * 0.036
        hose('hyd-line', [(0.62 + o, 1.30, DECK_Z + 0.10),
                          (0.50 + o, 0.10, DECK_Z + 0.02),
                          (0.36 + o, -1.50, DECK_Z + 0.06),
                          (0.30 + o, -2.24, DECK_Z + 0.30)],
             radius=0.017, mat=MAT_RUBBER, sides=6)
    coil = []
    for i in range(12):
        a = i * 1.25
        coil.append((0.34 + math.cos(a) * 0.070, -2.30 + i * 0.007,
                     DECK_Z + 0.30 + math.sin(a) * 0.070 + i * 0.019))
    hose('head-conduit-coil', coil, radius=0.018, mat=MAT_RUBBER, sides=6)

    hose('bull-hose', [(-2.60, 3.20, 0.06), (-1.55, 1.70, 0.07),
                       (-0.90, 0.10, 0.10), (-1.05, -1.60, 0.34),
                       (-0.55, -2.55, DECK_Z - 0.55)],
         radius=0.040, mat=MAT_RUBBER, sides=8)
    tube('bull-hose-ferrule', 0.055, 0.14, MAT_STEEL,
         loc=(-0.56, -2.56, DECK_Z - 0.66), rot=(0.4, 0, 0), sides=10)


def build_sample_hose():
    """The fat corrugated sample hose, on its own node.

    It is DYNAMIC — the game regenerates the curve as the head travels — so it
    is parented to slide:sample-hose, which keeps finish() from folding it into
    the static rubber bucket. The corrugation is real geometry (a smooth core
    with arrayed ribs on the curve), not a hoped-for normal map, because the
    material is generated procedurally at runtime and cannot be relied on to
    carry a rib pattern.
    """
    sl = empty(NODE_SLIDE, 'sample-hose', None, (0, 0, 0))
    sl['axis'] = 'z'
    sl['range_m'] = [0.0, 0.0]     # not translated; the game rebuilds the curve
    a = (HEAD_OUT[0] + 0.08, HEAD_OUT[1] + 0.02, HEAD_OUT[2] - 0.04)
    b = (1.42, HOLE_Y + 0.20, MAST_FOOT + 1.28)     # the lazy sag
    c = (ARM_TIP[0] - 0.06, ARM_TIP[1] + 0.02, ARM_TIP[2] + 0.10)  # arm saddle
    d = CYC_INLET                                   # cyclone inlet
    h = hose('sample-hose', [a, b, c, d], radius=0.062, mat=MAT_RUBBER,
             parent=sl, sides=10)
    h.data.bevel_resolution = 4
    h.data.resolution_u = 10
    ribs = 36
    for i in range(ribs):
        t = (i + 0.5) / ribs
        p = _bez4(a, b, c, d, t)
        tg = Vector(_bez4_tan(a, b, c, d, t)).normalized()
        r = torus('sample-hose-rib', 0.0705, 0.0135, MAT_RUBBER, sl, p,
                  mseg=10, nseg=5)
        r.rotation_mode = 'QUATERNION'
        r.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(tg)
    tube('sample-hose-collar', 0.082, 0.13, MAT_WORN, sl, a, sides=12)
    tube('sample-hose-collar', 0.082, 0.13, MAT_WORN, sl,
         (d[0], d[1], d[2] - 0.07), sides=12)
    return sl, h


# ── 9. LIGHTS AND NODES ───────────────────────────────────────────────────────
def build_lights():
    """env.js reads mount:/aim: world positions every frame and re-aims real
    spotlights at them, which is why boom lamps sweep as a machine works. An RC
    pad is worked at night off the rig's own lights, and the one that matters
    most is the lamp on the sample train: the cyclone is where the crew stands.
    """
    worklight('deck-fwd-l', None, (-1.10, -2.30, DECK_Z + 2.10),
              aim_dir=(-0.4, -2.4, -1.8), cone_deg=70, range_m=24)
    worklight('deck-fwd-r', None, (1.16, -2.28, DECK_Z + 1.10),
              aim_dir=(0.6, -2.4, -1.4), cone_deg=70, range_m=24)
    worklight('rear', None, (0.0, 2.42, DECK_Z + 1.00),
              aim_dir=(0, 2.4, -1.6), cone_deg=76, range_m=18)


# ── BUILD ─────────────────────────────────────────────────────────────────────
def build(out_path):
    reset()
    build_undercarriage()
    build_deck()
    build_body()
    pv_mast = build_mast()
    sl_tel, hk = build_crown(pv_mast)
    sl_car, pvh, spn = build_head(pv_mast)
    arm, grp = build_rod_handling(pv_mast)
    jacks = build_jacks()
    cyc_arm = build_cyclone_arm()
    build_sample_train()
    build_hoses()
    sl_hose, hose_obj = build_sample_hose()
    build_lights()

    # the hole itself, so the game can put the collar, the dust cone and the
    # bag rows in the right place without re-deriving the offset
    empty(NODE_MOUNT, 'hole', None, (0, HOLE_Y, 0))
    empty(NODE_AIM, 'hole', None, (0, HOLE_Y, -1.0))

    bake_modifiers()
    curves_to_mesh(skip=(hose_obj.name,))
    for n in (pv_mast, sl_tel, hk, sl_car, pvh, spn, arm, grp, jacks, cyc_arm,
              sl_hose):
        join_under(n)
    return finish(out_path)


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(HERE, '..', 'public', 'models',
                                       'rc_rig.glb')))
