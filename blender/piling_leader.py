"""
piling_leader — 'Bergholt PM-78 Leaderline'
Crawler-mounted, self-erecting, TELESCOPIC-LEADER driven-piling rig with a
hydraulic impact hammer. NO BOOM: one very tall vertical leader pinned to the
front of a slewing upperstructure and braced back to it by a long slender
tie-and-cylinder backstay.

PROVENANCE — shape only. No manufacturer name or model designation appears in
any object name, material name, custom property or any other string that can
reach a player (DOMAIN.md section 10). Provenance belongs in comments, and
this is where it lives.

  [DS11]  13915_Junttan_PM25H_Datasheet.pdf (2011) p.2 technical table and the
          two DIMENSIONED general-arrangement elevations. PRINTED dimensions.
  [DS25]  https://junttan.com/wp-content/uploads/2021/04/
          Junttan_PM25H_Datasheet_2025.pdf — the CURRENT sheet. Fetched and
          read this session. Its technical table supersedes several 2011
          figures (see DISAGREEMENTS below) and its p.1 full-height side
          elevation is the drawing every geometry constant tagged [GA] was
          measured off.
  [GA]    MEASURED BY PIXEL SCAN off [DS25] p.1, rendered at 2.6x with PyMuPDF
          and scanned with numpy. Scale was fixed by the printed overall height
          26 500 mm spanning drawing rows 111..2075 => 13.493 mm per pixel,
          cross-checked against the printed 5 700 mm crawler length (measured
          5 883 mm over the belt, 1.4 % high) and the printed 1 604 mm slewing
          ring (measured 1 606 mm, 0.1 % high). Ground line = row 2075, slew
          centre = column 904. These are MY measurements, not printed
          dimensions: treat as +/-3 % and never as a specification.
  [HB]    Junttan_Hammers_brochure_EN_2025_web.pdf technical-data spread —
          HHK Classic A-series and X-series SHK: ram mass, energy, stroke,
          hammer LENGTH and WEIGHT, drive-cap face sizes.
  [GB22]  Junttan_General_Brochure_General_2022_web.pdf p.4 — rig comparison
          tables and three photographs: a rig working off a timber-mat platform
          at a quay; a leader close-up with a precast pile in the guides and a
          black hose bundle strapped down the leader; a long-range two-rig
          silhouette showing FOUR near-parallel members in the backstay.
  [PB13]  16291_Junttan_Piling_brochure_3_2013_WEB.pdf p.1 cover photograph —
          blue leader on a red carrier, hammer high, the round lightening holes
          plainly visible down the leader, a huge free hose loop, and a second
          pile standing on the auxiliary line.
  [RTG]   rtg-rammtechnik-gmbh-...-pile-driver-in-action-2023.jpg.webp — best
          available material/wear reference. CAVEAT, and it matters: this is a
          DIFFERENT manufacturer's leader rig. Its A-frame is a deep pierced
          plate box; the machine modelled here is NOT (see BACKSTAY below).
  [REF]   research/rigs/piling-leader.md — the local reference pack.

WHAT THE WEB RESEARCH CHANGED, AND IT CHANGED A LOT
---------------------------------------------------
1. THE BACKSTAY IS NOT A DEEP PIERCED PLATE BOX. [REF] s4.3/s9.3 says it is,
   and reaches ~45 % of the leader height — but that reading comes from [RTG],
   a different maker. On [DS25] p.1 the backstay of THIS machine is a pair of
   LONG SLENDER TAPERING TIES plus one LONG rake/erection cylinder per side.
   Traced by pixel scan: the tie runs from the leader's REAR FACE at
   z = 9.58 m back and down at a constant 0.80 horizontal per 1.0 vertical to a
   pin 2 753 mm behind the slew centre at z = 2.36 m — 9.05 m long, 37 deg off
   vertical, ~0.16 m deep at the leader end and ~0.55 m deep at the machine
   end. The rake cylinder shares the same apex bracket and comes down to a pin
   at y = +0.62 m, z = 2.50 m, on top of a tall portal tower behind the cab.
   It is ~7.8 m long. Four near-parallel members, exactly as [GB22] shows.
2. THE HOLES ARE ON A 600 mm PITCH AND ~260 mm DIAMETER, and they are CIRCLES.
   [REF] guessed 580-600 pitch / 230-250 dia by pixel scan. Measured properly
   here: 43 consecutive detections at 594-607 mm spacing (mean 600 mm exactly),
   19.4 px = 262 mm diameter, hole/pitch = 0.44. AND the top 2.7 m of the
   leader — above a splice at z = 23.75 m, which lands on [DS11]'s printed
   900/1800/6000/13800 chain break at 23 800 mm — carries THREE TALL OBROUND
   holes instead, ~300 wide x 350 tall. Nothing in the local pack has that.
3. THE LEADER IS 880 mm DEEP, NOT 1 000. And the pile axis is 500 mm FORWARD
   of the leader's front face, with the hammer (694 mm deep) centred on the
   pile axis, so the hammer hangs clear in front of the leader rather than
   against it.
4. THE HAMMER HAS THREE GUIDE-JAW BRACKETS, not two, at ~1.85 m pitch in its
   lower two thirds, plus a fourth at the drive cap. [REF] s9.11 assumed two.
5. THE CAB STRADDLES THE SLEW CENTRE. Measured front face 1 848 mm ahead of
   the slew centre, rear face 108 mm behind it. It is NOT tucked up against
   the leader — there is ~1.75 m of open sloping nose deck between the cab and
   the leader carrier.
6. THERE IS A COOLER PACK PROUD OF THE HOUSE ROOF, 1.40 m long, 250 mm proud,
   and a TALL PORTAL TOWER right behind the cab that carries the rake cylinder
   pins. Neither is in [REF].
7. ONE REAR SUPPORT LEG, at the extreme rear, with an 850 mm round foot pad
   that stows 660 mm above ground. Confirms [REF] s9.4: the game's current
   pair of FRONT jacks under the leader is wrong.

DISAGREEMENTS BETWEEN SOURCES — recorded, not resolved
------------------------------------------------------
  operating weight   78 000 kg [DS11]   vs  80 000 kg w/ 9 t hammer [DS25]
  engine power       280 kW    [DS11]   vs  272 kW / 365 hp        [DS25]
                                        and 286 kW / 272 kW        [GB22]
  hammer winch       15 000 kg [DS11]   vs  16 500 kg     [DS25] and [GB22]
  slewing ring       1 600 mm  [DS11]   vs  1 604 mm               [DS25]
  counterweight      6 000 + 2 000 kg [DS11] vs 6 000 + 2 000 + 2 000 kg [DS25]
  coolers            2 x T8    [DS11]   vs  2 x HPA52              [DS25]
Everything the two sheets agree on — 5 700 mm crawler, 3 380/4 880 mm gauge,
800/900/1000 shoes, D7A chain, 4 000 mm telescope, 1 000/500 foot, 1 500 mm
horizontal shift, 20 000 kg leader capacity, 25 m pile, 420 l / 670 l tanks,
320 bar, 2 x 280 + 120 l/min — is treated as solid.

AXES. Blender Z-up. Origin = SLEW CENTRE at GROUND LEVEL, so the rig drops on
terrain at y=0. -Y is FORWARD (the pile axis side); +Y is aft (counterweight);
+X is the right-hand side. The exporter maps Blender -Y to three.js +Z, which
is the direction rigFactory.js already treats as forward for this machine.
"""

import math
import os
import sys

import bmesh
import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

from rig import (  # noqa: E402
    reset, part, tube, hose, empty, worklight, finish,
    NODE_MOUNT, NODE_PIVOT, NODE_SLIDE,
    MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST, MAT_RUBBER,
    MAT_GLASS, MAT_CHROME, MAT_HAZARD,
)

DEG = math.pi / 180.0


# ═══════════════════════════════════════════════════════════════════════════
# BUG IN THE SHARED HELPER — rig.py box() BUILDS EVERY BOX AT HALF SIZE
# ═══════════════════════════════════════════════════════════════════════════
# rig.py:
#     bpy.ops.mesh.primitive_cube_add(size=1)
#     o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
#     bpy.ops.object.transform_apply(scale=True)
#
# In Blender `size` on primitive_cube_add is the EDGE LENGTH, not a radius.
# size=1 already gives a 1 m cube spanning -0.5..+0.5. Scaling that by size/2
# therefore yields an edge of size/2. Verified in Blender 5.2.1: asking for
# box(..., (0.80, 0.88, 17.80)) returns dimensions (0.40, 0.44, 8.90).
#
# Every box in every machine built on this library is half its stated
# dimension, while tube() (which takes a real radius and a real depth) and any
# hand-authored mesh are full size — so a rig mixes the two scales and the
# dimensional provenance that the whole script-not-.blend argument rests on is
# silently void. This needs fixing centrally in rig.py, ONE line:
#     o.scale = size            # a size=1 cube is already 1 m on each edge
#
# It is NOT fixed here. blender/lib/rig.py is shared with the machines other
# builders are exporting right now; some of them may already have compensated
# by doubling their constants, and changing the helper underneath them mid-run
# would break their models with no warning. So this file shadows box() locally
# and reports the bug instead. Remove this override once rig.py is corrected —
# the two are then identical.
def box(name, size, mat=MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
        bevel=0.0):
    """A box of the size you actually asked for. See the note above."""
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        m = o.modifiers.new('bev', 'BEVEL')
        m.width = bevel
        m.segments = 2
        m.limit_method = 'ANGLE'
    return part(name, o, mat, parent, loc, rot)

# ═══════════════════════════════════════════════════════════════════════════
# DIMENSIONS.  Metres.  Every line carries its source.
# ═══════════════════════════════════════════════════════════════════════════

# ── undercarriage ──────────────────────────────────────────────────────────
CRAWLER_L    = 5.70    # [DS11][DS25] crawler length. The master scale bar.
SHOE_W       = 0.90    # [DS11][DS25] 800/900/1000 offered; 900 is the default
SHOE_PITCH   = 0.216   # D7A chain [DS25 "CRAWLER TYPE: D7A"]; 19 links counted
                       # on the ground run of the [GA] elevation confirms it
GAUGE_NARROW = 3.38    # [DS11][DS25] travelling gauge over 900 mm shoes
GAUGE_WIDE   = 4.88    # [DS11][DS25] working gauge. Expands 1 500 mm.
TRACK_H      = 0.78    # [GA] belt bottom row 2075 to frame top row ~2018
WHEEL_R      = 0.31    # [GA] sprocket circle radius 20.4 px
SPR_IDLER    = 4.80    # [DS11] sprocket-to-idler centres

# ── upperstructure ─────────────────────────────────────────────────────────
SLEW_RING_D  = 1.604   # [DS25]; [GA] measured 1 606 mm — 0.1 % agreement
DECK_Z       = 1.09    # [GA] deck plate row 1994
HOUSE_Y0     = 0.05    # [GA] house front face, 4 px behind the slew centre
HOUSE_Y1     = 3.14    # [GA] house rear face => 3 089 mm long ([DS11]s 3 100)
HOUSE_TOP    = 2.39    # [GA] house roof row 1898 => 1 294 mm above the deck
HOUSE_W      = 2.90    # DERIVED — no plan or front elevation of this class
                       # exists in any source read [REF s8]
COOLER_Y0    = 0.95    # [GA] cooler package proud of the house roof,
COOLER_Y1    = 2.35    #      1 403 mm long,
COOLER_TOP   = 2.64    #      250 mm proud
TOWER_Y0     = 0.15    # [GA] the tall portal tower behind the cab that carries
TOWER_Y1     = 0.65    #      the rake-cylinder pins
TOWER_TOP    = 2.62    # [GA] row 1881
REAR_Y       = 3.79    # [GA] rear body face, 281 px behind the slew centre.
                       # [DS11] prints "slew centre -> rear extremity
                       # 4 200 ... 5 700 mm", which must include the support
                       # leg and the extended counterweight — see below.
LEG_Y        = 4.06    # [GA] rear support leg centre
LEG_PAD_D    = 0.85    # [GA] round foot pad, 63 px
LEG_STOW_Z   = 0.66    # [GA] pad stowed 661 mm above ground
CAB_Y0       = -1.85   # [GA] cab front face, 1 848 mm ahead of the slew centre
CAB_Y1       = 0.11    # [GA] cab rear face — the cab STRADDLES the slew centre
CAB_FLOOR    = 1.24    # [GA] 148 mm above the deck
CAB_H        = 1.82    # [GA] rows 1848..1983
CAB_W        = 1.32    # DERIVED — no plan view exists [REF s8]
CAB_X        = -0.95   # DERIVED. The operator must look STRAIGHT UP the leader
                       # so the cab is offset off the pile axis, but WHICH SIDE
                       # is not sourced [REF s8]. Left is a choice, not a fact.

# ── the leader ─────────────────────────────────────────────────────────────
LEADER_TOP   = 26.50   # [DS11] overall height, standard configuration.
                       # [DS25] p.1 is drawn to it: rows 111..2075.
PILE_AXIS_Y  = -4.10   # [GA] 4 101 mm ahead of the slew centre. [DS11] prints
                       # the range 5 100 ... 3 600 mm (the 1 500 mm shift), so
                       # the drawn machine is just forward of mid-travel.
LEAD_FRONT   = -3.60   # [GA] leader front face, 500 mm behind the pile axis
LEADER_D     = 0.88    # [GA] 65 px front-to-rear. [REF] guessed 1.00 +/-10 %.
LEADER_W     = 0.80    # DERIVED — no plan or front elevation exists [REF s8]
HOLE_PITCH   = 0.600   # [GA] 43 detections, 594-607 mm, mean 600 mm
HOLE_D       = 0.262   # [GA] 19.4 px
HOLE_OFF     = 0.31    # [GA] hole centres 310 mm behind the leader front face
OB_W, OB_H   = 0.30, 0.35   # [GA] the three obround holes in the top section
SPLICE_Z     = 23.75   # [GA] row 312. [DS11]'s printed 900/1800/6000/13800
                       # chain breaks at 23 800 mm — 0.2 % agreement.
TELE_BREAK   = 17.80   # [DS11] chain: 23 800 - 6 000
FOOT_BREAK   = 4.00    # [DS11] printed leader-foot region dimension
TELE_STROKE  = 4.00    # [DS11][DS25] telescope stroke
FOOT_UP      = 1.00    # [DS11][DS25] leader foot travel up
FOOT_DOWN    = 0.50    # [DS11][DS25] leader foot travel down
LEADER_SHIFT = 1.50    # [DS11][DS25] horizontal (spotting) travel
HINGE_Z      = 1.66    # [GA] leader erection hinge on the deck nose
HINGE_Y      = -2.44   # [GA] 2 442 mm ahead of the slew centre
COLLAR_Z0    = 3.10    # [GA] the leader carrier collar,
COLLAR_Z1    = 6.20    #      a fabricated guide box the leader shifts through
AF_APEX_Y    = -2.70   # [GA] backstay apex bracket, on the leader rear face
AF_APEX_Z    = 9.58    # [GA] row 1365 — 36 % of the leader height
TIE_PIN_Y    = 2.75    # [GA] tie lower pin, 2 753 mm behind the slew centre
TIE_PIN_Z    = 2.36    # [GA] row 1900
RC_PIN_Y     = 0.62    # [GA] rake cylinder lower pin, on the tower top
RC_PIN_Z     = 2.50

# ── the hammer ─────────────────────────────────────────────────────────────
# [DS25] p.1 is captioned "Standard PM25H with HHK7A hammer". [HB] HHK7A:
# 7 000 kg ram, 82 kNm, 1 200 mm stroke, 40-100 blows/min, 6 640 mm long and
# 11 000 kg EXCLUDING cap and sleeve. Measured on [GA]: body 5 971 mm, and
# 6 578 mm down to the bottom of the drive cap — 6 640 mm to within 1 %.
# The 9 t option (HHK9A 7 380 mm / 13 500 kg; SHK9 7 675 mm / 14 800 kg) is
# what the game's builder fits, and its 17 800 kg is ~25 % high [REF s9.6].
HAMMER_L     = 7.38    # [HB] HHK9A body, excluding cap and sleeve
HAMMER_D     = 0.72    # [GA] 694 mm, scaled up 4 % for the longer 9 t body
HAMMER_W     = 0.82    # DERIVED — no front elevation of the hammer exists
RAM_STROKE   = 1.20    # [HB] 1 200 mm across the Classic A and X series
JAW_PITCH    = 1.85    # [GA] three guide brackets at 1 843 / 1 875 mm
DRIVE_CAP    = 0.55    # [HB] 550 x 550 mm face for a 7-9 t ram

# ── the pile and the modelled pose ─────────────────────────────────────────
PILE_SIDE    = 0.35    # [GA] 388 mm measured; 350 mm square is the routine size
PILE_LEN     = 14.00   # [DS11][DS25] max 25 m; 14 m is a routine housing pile
PILE_TOP     = 13.60   # pose: driving, tip 400 mm into the ground
CAP_Z        = 13.60   # drive cap sits on the pile head
HAMMER_BOT   = 14.60   # hammer down on the cap, sleeve between — 53-81 % of the leader height,
                       # which is where [PB13] and [GA] both show it working

# leader-local frame: y_local = y_world - PILE_AXIS_Y
LF = -PILE_AXIS_Y      # 4.10


# ═══════════════════════════════════════════════════════════════════════════
# LOCAL HELPERS — the Blender techniques rig.py does not wrap
# ═══════════════════════════════════════════════════════════════════════════

def plate(name, poly_yz, thick, mat=MAT_DARK, parent=None, loc=(0, 0, 0),
          rot=(0, 0, 0), bevel=0.0):
    """A flat plate of arbitrary OUTLINE, extruded across X.

    `poly_yz` is a simple polygon as (y, z) pairs. The backstay ties on this
    machine are long TAPERING members — 0.16 m deep at the leader end and
    0.55 m at the machine end [GA] — and a taper cannot be built out of scaled
    cubes. Same helper does the deck nose and the leader-carrier cheeks.
    """
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new((-thick / 2.0, y, z)) for (y, z) in poly_yz]
    bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    nv = [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=nv, vec=(thick, 0.0, 0.0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if bevel > 0:
        m = o.modifiers.new('bev', 'BEVEL')
        m.width = bevel
        m.segments = 2
        m.limit_method = 'ANGLE'
    return part(name, o, mat, parent, loc, rot)


def _apply_mods(o):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    for m in list(o.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except Exception:
            o.modifiers.remove(m)


def _boolean(obj, cutters):
    bpy.ops.object.select_all(action='DESELECT')
    for c in cutters:
        c.select_set(True)
    bpy.context.view_layer.objects.active = cutters[0]
    if len(cutters) > 1:
        bpy.ops.object.join()
    cut = bpy.context.active_object
    _apply_mods(obj)
    m = obj.modifiers.new('punch', 'BOOLEAN')
    m.operation = 'DIFFERENCE'
    m.object = cut
    m.solver = 'EXACT'
    _apply_mods(obj)
    bpy.data.objects.remove(cut, do_unlink=True)
    return obj


def punch_round(obj, centres, radius, depth=3.0, sides=18):
    """Boolean a row of round holes straight through `obj` along X.

    The continuous ladder of large round lightening holes down the leader side
    plate is THE identifying feature of this class, and it is the single
    highest-value thing missing from the game's procedural builder [REF s9.1].
    Measured on [GA]: 262 mm diameter on a dead-regular 600 mm pitch, running
    the entire length of the leader. Centres are in the object's own frame.
    """
    cs = []
    for (x, y, z) in centres:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=radius, depth=depth, vertices=sides,
            location=(x, y, z), rotation=(0.0, 90 * DEG, 0.0))
        cs.append(bpy.context.active_object)
    return _boolean(obj, cs)


def punch_obround(obj, centres, w, h, depth=3.0):
    """The three TALL holes in the leader's TOP section, which [GA] draws as
    obrounds ~300 wide x 350 tall rather than as the circles used everywhere
    below. Cut as a Z-stretched cylinder: a true ellipse, not a stadium, but
    at 300 x 350 the difference is under the pixel and one solid cutter
    survives the EXACT solver where a three-part union did not."""
    cs = []
    for (x, y, z) in centres:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=w / 2.0, depth=depth, vertices=24,
            location=(x, y, z), rotation=(0.0, 90 * DEG, 0.0))
        o = bpy.context.active_object
        o.scale = (1.0, 1.0, h / w)
        bpy.ops.object.transform_apply(scale=True)
        cs.append(o)
    return _boolean(obj, cs)


def array_along(o, count, offset):
    m = o.modifiers.new('arr', 'ARRAY')
    m.count = count
    m.use_relative_offset = False
    m.use_constant_offset = True
    m.constant_offset_displace = offset
    return o


def to_mesh(o):
    """Curves are NOT meshes, so finish() will not join them and every rope and
    hose would land as its own draw call. Convert them."""
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    return bpy.context.active_object


def merge(name, objs, parent=None):
    """Join a list of meshes into one and park the result under `parent`.

    finish() only joins STATIC geometry — anything under a pivot: or slide: is
    left alone because it has to move independently. Correct, but on this
    machine the leader is 60 % of the model and ALL of it moves, so a dynamic
    subassembly built one object at a time would blow the 70-draw-call budget
    by itself. Every dynamic subassembly is therefore merged here, by hand,
    per material. Modifiers are applied first: object.join() keeps only the
    ACTIVE object's modifier stack and would silently drop every other bevel,
    array and boolean in the group.
    """
    objs = [o for o in objs if o is not None]
    if not objs:
        return None
    for o in objs:
        _apply_mods(o)
    if len(objs) == 1:
        o = objs[0]
        o.name = name
        if parent is not None:
            o.parent = parent
        return o
    loc = objs[0].location.copy()
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.active_object
    o.name = name
    o.location = loc
    if parent is not None:
        o.parent = parent
    return o


def lamp_housing(out, loc):
    """A lamp body. The mount:/aim: pair that env.js actually drives is made
    separately by worklight(); this is just the thing you can see."""
    out.append(box('lh', (0.28, 0.17, 0.24), MAT_DARK, None, loc, bevel=0.025))
    out.append(box('lhb', (0.10, 0.09, 0.14), MAT_DARK, None,
                   (loc[0], loc[1], loc[2] - 0.17)))


def rail(out, pts, z, h=1.05, r=0.024, mat=MAT_STEEL):
    """Plain tubular handrail — the kind visible along the top of the house in
    [GB22] p.4 and [RTG]."""
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        for dz in (h * 0.52, h):
            out.append(tube('hr', r, L, mat, None, (a[0], a[1], z + dz),
                            (0, 90 * DEG, ang), sides=6))
    for (px, py) in pts:
        out.append(tube('hrp', r * 1.1, h, mat, None, (px, py, z), sides=6))


# ═══════════════════════════════════════════════════════════════════════════
# SUBASSEMBLIES
# ═══════════════════════════════════════════════════════════════════════════

def build_track(side, parent):
    """One crawler frame, its belt and its running gear.

    900 mm shoes on a 5 700 mm frame is a VERY wide, short track — the plan
    aspect is nothing like an excavator [REF s4.1]. Sprocket at the REAR
    (counterweight end), smooth idler at the FRONT under the leader where it
    takes the pounding: [REF s4.1] flagged this as read off a drawing and not
    printed, and [GA] confirms it — the toothed wheel is unambiguously at the
    rear on the 2025 elevation.
    """
    half = SPR_IDLER / 2.0
    dark, worn, steel = [], [], []

    dark.append(box('tf', (0.58, CRAWLER_L - 0.55, 0.58), MAT_DARK, None,
                    (0, 0, WHEEL_R + 0.10), bevel=0.03))
    # [DS25] options list "extra toolboxes on track beams (2 pcs)" — real
    # hardware, and it breaks up an otherwise plain beam
    for yy in (-1.35, 1.05):
        dark.append(box('tbox', (0.42, 0.62, 0.36), MAT_DARK, None,
                        (side * 0.32, yy, WHEEL_R + 0.42), bevel=0.02))
        steel.append(box('tboxl', (0.05, 0.10, 0.06), MAT_STEEL, None,
                         (side * 0.54, yy - 0.24, WHEEL_R + 0.42)))

    worn.append(box('bl', (SHOE_W, SPR_IDLER, 0.10), MAT_WORN, None, (0, 0, 0.05)))
    worn.append(box('bu', (SHOE_W, SPR_IDLER, 0.10), MAT_WORN, None,
                    (0, 0, TRACK_H - 0.05)))
    for sgn in (-1, 1):
        worn.append(tube('bw', WHEEL_R + 0.06, SHOE_W, MAT_WORN, None,
                         (-SHOE_W / 2, sgn * half, WHEEL_R), (0, 90 * DEG, 0),
                         sides=22))

    def shoe(nm, loc, rot=(0, 0, 0), down=False):
        # triple-grouser shoe: [DS25] offers 3-edge / flat-edges / flat, and
        # 3-edge is the default read on a piling rig standing on soft ground.
        # `down` builds the grousers on the underside rather than rotating the
        # shoe: a pi rotation about X also flips an ARRAY modifier's LOCAL
        # offset, and the bottom run then marches backwards out of the machine.
        d = -1.0 if down else 1.0
        g = [box(nm, (SHOE_W, SHOE_PITCH * 0.93, 0.032), MAT_WORN, None, (0, 0, 0))]
        for k in (-1, 0, 1):
            g.append(box(nm + 'g', (SHOE_W * 0.95, 0.032, 0.058), MAT_WORN, None,
                         (0, k * 0.062, d * 0.045)))
        m = merge(nm, g)
        m.location = loc
        m.rotation_euler = rot
        return m

    n_run = int(SPR_IDLER / SHOE_PITCH)
    s = shoe('shoe_b', (0, -half + SHOE_PITCH / 2, -0.014), down=True)
    array_along(s, n_run, (0, SHOE_PITCH, 0))
    worn.append(s)
    s = shoe('shoe_t', (0, -half + SHOE_PITCH / 2, TRACK_H + 0.014))
    array_along(s, n_run, (0, SHOE_PITCH, 0))
    worn.append(s)
    for sgn in (-1, 1):
        for i in range(10):
            a = (i / 9.0 - 0.5) * math.pi
            rr = WHEEL_R + 0.075
            worn.append(shoe('shoe_e',
                             (0, sgn * (half + rr * math.cos(a)),
                              WHEEL_R - rr * math.sin(a) * sgn),
                             (a * sgn + (0 if sgn > 0 else math.pi), 0, 0),
                             down=(sgn < 0)))

    steel.append(tube('spr', WHEEL_R * 0.86, 0.30, MAT_STEEL, None,
                      (-0.15, half, WHEEL_R), (0, 90 * DEG, 0), sides=20))
    for i in range(21):
        a = i * 2 * math.pi / 21
        steel.append(box('sprt', (0.26, 0.09, 0.13), MAT_STEEL, None,
                         (0, half + WHEEL_R * 0.95 * math.cos(a),
                          WHEEL_R + WHEEL_R * 0.95 * math.sin(a)), (a, 0, 0)))
    steel.append(tube('idl', WHEEL_R * 0.92, 0.34, MAT_STEEL, None,
                      (-0.17, -half, WHEEL_R), (0, 90 * DEG, 0), sides=20))
    for i in range(9):        # 9 bottom rollers, counted off the GA [REF s4.1]
        steel.append(tube('rlb', 0.135, 0.34, MAT_STEEL, None,
                          (-0.17, (i - 4) * (SPR_IDLER - 1.0) / 8.0, 0.19),
                          (0, 90 * DEG, 0), sides=12))
    for yy in (-1.25, 1.25):  # 2 carrier rollers
        steel.append(tube('rlc', 0.105, 0.26, MAT_STEEL, None,
                          (-0.13, yy, TRACK_H - 0.17), (0, 90 * DEG, 0), sides=12))
    dark.append(tube('fd', 0.29, 0.24, MAT_DARK, None,
                     (side * 0.15, half, WHEEL_R), (0, side * 90 * DEG, 0), sides=18))

    merge('track_frame', dark, parent)
    merge('track_belt', worn, parent)
    merge('track_gear', steel, parent)


def leader_girder(name, z0, z1, w, d, y, holes='round', mat=MAT_DARK):
    """One leader section: a welded BOX / plate girder — NOT a lattice — with a
    continuous ladder of lightening holes down the side plate for its entire
    length [GA][PB13][REF s4.3]. `y` is the box centre in the leader frame."""
    L = z1 - z0
    g = box(name, (w, d, L), mat, None, (0, y, z0 + L / 2), bevel=0.022)
    hy = y - d / 2 + HOLE_OFF
    cs = []
    z = z0 + HOLE_PITCH * 0.5
    while z < z1 - HOLE_PITCH * 0.4:
        cs.append((0, hy, z))
        z += HOLE_PITCH
    if cs:
        if holes == 'round':
            punch_round(g, cs, HOLE_D / 2.0, depth=w * 3.0)
        else:
            punch_obround(g, cs, OB_W, OB_H, depth=w * 3.0)
    return g


def build_hammer(parent):
    """Hydraulic impact hammer, 9 000 kg ram class.

    It is not a block sliding up a mast. At 7.38 m on a 26.5 m leader it is
    28 % of the leader height and reads as a machine in its own right — the
    single proportion the game most needs to get right [REF s3]. Modelled from
    the HHK7A drawn on [GA] (measured 6 578 mm overall, against [HB]'s printed
    6 640 mm) scaled to the 9 t body [HB] gives as 7 380 mm.
    """
    dark, steel, chrome = [], [], []
    h = HAMMER_L
    for sx in (-1, 1):
        dark.append(box('hp', (0.055, HAMMER_D, h * 0.86), MAT_DARK, None,
                        (sx * HAMMER_W / 2, 0, h * 0.49), bevel=0.012))
        for sy in (-1, 1):
            dark.append(box('hc', (0.115, 0.115, h * 0.92), MAT_DARK, None,
                            (sx * (HAMMER_W / 2 - 0.05),
                             sy * (HAMMER_D / 2 - 0.05), h * 0.49), bevel=0.012))
    # bolted cross flanges: the frame is BOLTED, not one weldment [REF s4.5]
    for i in range(6):
        dark.append(box('hf', (HAMMER_W + 0.07, HAMMER_D + 0.07, 0.08), MAT_DARK,
                        None, (0, 0, 0.60 + i * 1.20), bevel=0.012))
        for sx in (-1, 1):
            for sy in (-1, 1):
                steel.append(tube('hbolt', 0.025, 0.05, MAT_STEEL, None,
                                  (sx * (HAMMER_W / 2 + 0.005),
                                   sy * (HAMMER_D / 2 - 0.02), 0.60 + i * 1.20),
                                  (0, sx * 90 * DEG, 0), sides=6))
    dark.append(box('hb', (HAMMER_W, 0.055, h * 0.86), MAT_DARK, None,
                    (0, HAMMER_D / 2, h * 0.49), bevel=0.012))
    # the cylinder housing at the top, where the ram is lifted and released
    dark.append(box('hcyl', (HAMMER_W * 0.84, HAMMER_D * 0.86, 1.45), MAT_DARK,
                    None, (0, 0, h - 0.72), bevel=0.03))
    steel.append(tube('hcap', 0.21, 0.30, MAT_STEEL, None, (0, 0, h - 0.04), sides=16))
    steel.append(box('hbek', (0.17, 0.32, 0.42), MAT_STEEL, None, (0, 0, h + 0.22),
                     bevel=0.02))
    steel.append(box('hanv', (HAMMER_W * 0.92, HAMMER_D * 0.92, 0.36), MAT_STEEL,
                     None, (0, 0, 0.18), bevel=0.02))
    # THREE guide-jaw brackets at a 1.85 m pitch in the lower two thirds [GA].
    # This is a leader-mounted hammer, not a free-hanging one: everything that
    # rides the leader is CAPTURED by it and nothing swings free [REF s4.3].
    for i in range(3):
        zz = 0.62 + i * JAW_PITCH
        for sx in (-1, 1):
            steel.append(box('hj', (0.24, 0.50, 0.50), MAT_STEEL, None,
                             (sx * (HAMMER_W / 2 + 0.09), HAMMER_D / 2 + 0.30, zz),
                             bevel=0.02))
        steel.append(box('hjb', (HAMMER_W + 0.50, 0.24, 0.36), MAT_STEEL, None,
                         (0, HAMMER_D / 2 + 0.30, zz), bevel=0.02))
    dark.append(box('hman', (0.24, 0.36, 0.64), MAT_DARK, None,
                    (HAMMER_W / 2 + 0.11, -0.10, h * 0.72), bevel=0.02))
    for i in range(4):
        chrome.append(tube('hport', 0.036, 0.15, MAT_CHROME, None,
                           (HAMMER_W / 2 + 0.23, -0.02 - i * 0.058, h * 0.72),
                           (0, 90 * DEG, 0), sides=8))
    merge('hammer_body', dark, parent)
    merge('hammer_jaws', steel, parent)
    merge('hammer_ports', chrome, parent)


# ═══════════════════════════════════════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════════════════════════════════════

def build(out_path):
    reset()

    # ══ UNDERCARRIAGE ══════════════════════════════════════════════════════
    car = []
    car.append(box('carbody', (2.10, 3.40, 0.34), MAT_DARK, None,
                   (0, 0, WHEEL_R + 0.44), bevel=0.04))
    # THE detail that says piling rig and not excavator: the expanding-gauge
    # cross-carriers are heavy dark fabricated boxes standing PROUD between the
    # upperstructure and the track frames [RTG][REF s4.1]. Real, visible,
    # greasy structure — never hidden. 1 500 mm of gauge change lives here.
    for yy in (-1.60, 1.60):
        car.append(box('xcar', (4.60, 0.66, 0.54), MAT_DARK, None,
                       (0, yy, WHEEL_R + 0.10), bevel=0.035))
        car.append(box('xcarR', (5.70, 0.36, 0.28), MAT_STEEL, None,
                       (0, yy, WHEEL_R + 0.10)))
        for sx in (-1, 1):
            car.append(tube('xspr', 0.08, 0.90, MAT_CHROME, None,
                            (sx * 1.15, yy, WHEEL_R + 0.36), (0, sx * 90 * DEG, 0),
                            sides=10))
            car.append(box('xgus', (0.30, 0.90, 0.42), MAT_DARK, None,
                           (sx * 1.05, yy, WHEEL_R + 0.10), bevel=0.02))
    # slew ring: a narrow tidy band, not a big turret. 1 604 mm [DS25];
    # measured 1 606 mm on [GA] — the best agreement anywhere in this file.
    car.append(tube('slewring', SLEW_RING_D / 2, 0.14, MAT_WORN, None,
                    (0, 0, DECK_Z - 0.19), sides=36))
    for i in range(30):
        a = i * 2 * math.pi / 30
        car.append(tube('slewbolt', 0.032, 0.05, MAT_WORN, None,
                        ((SLEW_RING_D / 2 - 0.11) * math.cos(a),
                         (SLEW_RING_D / 2 - 0.11) * math.sin(a), DECK_Z - 0.07),
                        sides=6))
    merge('undercarriage', car)

    for sgn, nm in ((-1, 'track-left'), (1, 'track-right')):
        # rest position is the WORKING gauge: the squat, nearly-square working
        # stance (4 880 : 5 700 = 0.86 : 1 in plan) IS the silhouette [REF s5.5].
        # Retracts 750 mm per side to the 3 380 mm travelling gauge.
        n = empty(NODE_SLIDE, nm, None, (sgn * GAUGE_WIDE / 2, 0, 0))
        n['travel_m'] = -(GAUGE_WIDE - GAUGE_NARROW) / 2.0
        n['axis'] = 'x'
        build_track(sgn, n)

    # ══ UPPERSTRUCTURE ═════════════════════════════════════════════════════
    # pivot:slew sits at the origin, so everything below is authored directly
    # in the [GA]-measured world frame.
    slew = empty(NODE_PIVOT, 'slew', None, (0, 0, 0))
    slew['axis'] = 'z'

    paint, dark, worn, steel, glass, haz = [], [], [], [], [], []

    dark.append(box('deck', (3.20, 7.10, 0.07), MAT_DARK, None,
                    (0, 0.55, DECK_Z - 0.035)))
    # engine house: low, long, slab-sided. 420 l fuel, 670 l oil and TWO large
    # coolers [DS11 2xT8 / DS25 2xHPA52] — a lot of radiator area, so the house
    # needs real grille panels, not a painted rectangle [REF s4.2].
    hy = (HOUSE_Y0 + HOUSE_Y1) / 2
    hl = HOUSE_Y1 - HOUSE_Y0
    hh = HOUSE_TOP - DECK_Z
    paint.append(box('house', (HOUSE_W, hl, hh), MAT_PAINT, None,
                     (0, hy, DECK_Z + hh / 2), bevel=0.045))
    for sx in (-1, 1):
        for i in range(10):
            dark.append(box('grille', (0.05, 1.40, 0.075), MAT_DARK, None,
                            (sx * (HOUSE_W / 2 + 0.012), hy + 0.72,
                             DECK_Z + 0.22 + i * 0.105), (0.42 * sx, 0, 0)))
        for i in range(2):
            dark.append(box('acc', (0.035, 0.95, 0.72), MAT_DARK, None,
                            (sx * (HOUSE_W / 2 + 0.015), hy - 0.85 + i * 0.02,
                             DECK_Z + 0.62), bevel=0.01))
        dark.append(box('accseam', (0.02, 0.06, 0.80), MAT_DARK, None,
                        (sx * (HOUSE_W / 2 + 0.02), hy - 0.30, DECK_Z + 0.62)))
    # the cooler package standing proud of the house roof [GA]
    paint.append(box('coolerbox', (HOUSE_W - 0.55, COOLER_Y1 - COOLER_Y0,
                                   COOLER_TOP - HOUSE_TOP), MAT_PAINT, None,
                     (0, (COOLER_Y0 + COOLER_Y1) / 2,
                      (HOUSE_TOP + COOLER_TOP) / 2), bevel=0.03))
    for i in range(14):
        dark.append(box('coolfin', (HOUSE_W - 0.62, 0.035, 0.16), MAT_DARK, None,
                        (0, COOLER_Y0 + 0.10 + i * 0.088, COOLER_TOP - 0.02)))
    worn.append(tube('stack', 0.085, 0.70, MAT_WORN, None,
                     (1.05, HOUSE_Y1 - 0.45, HOUSE_TOP), sides=12))
    worn.append(tube('stackcap', 0.12, 0.06, MAT_WORN, None,
                     (1.05, HOUSE_Y1 - 0.45, HOUSE_TOP + 0.70), sides=12))

    # ── the portal tower that carries the rake-cylinder pins ───────────────
    # [GA] shows a tall narrow box right behind the cab reaching z = 2.62 m,
    # and the rake cylinder's lower pin lands on top of it. Nothing in [REF]
    # has this and it is a strong secondary silhouette feature.
    for sx in (-1, 1):
        paint.append(box('twrpost', (0.26, TOWER_Y1 - TOWER_Y0, TOWER_TOP - DECK_Z),
                         MAT_PAINT, None,
                         (sx * 0.62, (TOWER_Y0 + TOWER_Y1) / 2,
                          (DECK_Z + TOWER_TOP) / 2), bevel=0.03))
    paint.append(box('twrhead', (1.62, TOWER_Y1 - TOWER_Y0 + 0.06, 0.30), MAT_PAINT,
                     None, (0, (TOWER_Y0 + TOWER_Y1) / 2, TOWER_TOP - 0.15),
                     bevel=0.03))
    for sx in (-1, 1):
        steel.append(tube('rcpin', 0.10, 0.30, MAT_STEEL, None,
                          (sx * 0.62 - 0.15, RC_PIN_Y, RC_PIN_Z), (0, 90 * DEG, 0),
                          sides=12))

    # ── cab ────────────────────────────────────────────────────────────────
    # A tall glasshouse with a full-height front screen, offset off the pile
    # axis because the operator has to look STRAIGHT UP the leader [RTG][GA].
    # It straddles the slew centre: front face 1 848 mm ahead, rear 108 mm
    # behind [GA] — NOT tucked against the leader.
    ccy = (CAB_Y0 + CAB_Y1) / 2
    ccl = CAB_Y1 - CAB_Y0
    dark.append(box('cabped', (CAB_W + 0.12, ccl + 0.08, CAB_FLOOR - DECK_Z + 0.06),
                    MAT_DARK, None, (CAB_X, ccy, (DECK_Z + CAB_FLOOR) / 2 - 0.02),
                    bevel=0.02))
    paint.append(box('cabshell', (CAB_W, ccl, CAB_H), MAT_PAINT, None,
                     (CAB_X, ccy, CAB_FLOOR + CAB_H / 2), bevel=0.05))
    glass.append(box('cabfront', (CAB_W - 0.11, 0.04, CAB_H - 0.26), MAT_GLASS,
                     None, (CAB_X, CAB_Y0 - 0.01, CAB_FLOOR + CAB_H / 2 - 0.03)))
    glass.append(box('cabroof', (CAB_W - 0.26, 0.72, 0.04), MAT_GLASS, None,
                     (CAB_X, CAB_Y0 + 0.44, CAB_FLOOR + CAB_H - 0.02)))
    for sx in (-1, 1):
        glass.append(box('cabsideU', (0.04, ccl - 0.30, 0.70), MAT_GLASS, None,
                         (CAB_X + sx * (CAB_W / 2 + 0.01), ccy - 0.06,
                          CAB_FLOOR + CAB_H - 0.52)))
    glass.append(box('cabdoor', (0.04, 0.78, 0.62), MAT_GLASS, None,
                     (CAB_X - CAB_W / 2 - 0.012, ccy - 0.30, CAB_FLOOR + 0.62)))
    # curved tubular FOPS guard standing OFF the front glass [RTG]
    for i in range(5):
        steel.append(tube('fops', 0.026, CAB_W + 0.08, MAT_STEEL, None,
                          (CAB_X - (CAB_W + 0.08) / 2, CAB_Y0 - 0.22,
                           CAB_FLOOR + 0.30 + i * 0.36), (0, 90 * DEG, 0), sides=6))
    for sx in (-1, 1):
        steel.append(tube('fopsv', 0.030, CAB_H - 0.10, MAT_STEEL, None,
                          (CAB_X + sx * (CAB_W / 2 + 0.03), CAB_Y0 - 0.22,
                           CAB_FLOOR + 0.22), sides=6))
    # roof canopy with lamp guards and grab rails, straight off [GA]
    dark.append(box('cabvisor', (CAB_W + 0.10, 0.62, 0.07), MAT_DARK, None,
                    (CAB_X, CAB_Y0 + 0.20, CAB_FLOOR + CAB_H + 0.06), bevel=0.02))
    for sx in (-1, 1):
        for i in range(6):
            a = i * math.pi / 5
            steel.append(tube('grab', 0.020, 0.30, MAT_STEEL, None,
                              (CAB_X + sx * 0.42 - 0.15,
                               CAB_Y0 + 0.24 - 0.18 * math.cos(a),
                               CAB_FLOOR + CAB_H + 0.10 + 0.16 * math.sin(a)),
                              (0, 90 * DEG, 0), sides=5))
    haz.append(box('cabstep', (CAB_W, 0.36, 0.05), MAT_HAZARD, None,
                   (CAB_X, CAB_Y0 - 0.18, DECK_Z + 0.10)))
    haz.append(box('cabstep2', (CAB_W, 0.36, 0.05), MAT_HAZARD, None,
                   (CAB_X, CAB_Y0 - 0.18, DECK_Z - 0.34)))
    dark.append(box('cabplate', (0.03, 0.32, 0.22), MAT_DARK, None,
                    (CAB_X + CAB_W / 2 + 0.012, CAB_Y1 - 0.30, CAB_FLOOR + 0.34)))

    # ── the sloping deck nose in front of the cab ──────────────────────────
    # [GA] shows a wedge from the deck front rising back to the cab base, with
    # the leader erection hinge on a round bracket at its forward end.
    for sx in (-1, 1):
        paint.append(plate('nose', [(-2.52, DECK_Z), (-1.10, DECK_Z),
                                    (-1.10, DECK_Z + 0.62), (-2.52, DECK_Z + 0.22)],
                           0.10, MAT_PAINT, None, (sx * 1.42, 0, 0), bevel=0.02))
    paint.append(box('nosetop', (2.94, 1.44, 0.06), MAT_PAINT, None,
                     (0, -1.82, DECK_Z + 0.40), (0.28, 0, 0)))
    for sx in (-1, 1):
        dark.append(box('hingebr', (0.22, 0.70, 0.90), MAT_DARK, None,
                        (sx * 0.70, HINGE_Y + 0.24, HINGE_Z - 0.20), bevel=0.03))
        steel.append(tube('hingepin', 0.13, 0.34, MAT_STEEL, None,
                          (sx * 0.70 - 0.17, HINGE_Y, HINGE_Z), (0, 90 * DEG, 0),
                          sides=14))

    # ── walkway, handrails, beacon, aerials, boarding ladder ───────────────
    # [DS25] lists "catwalk around the rig" as an option; [GB22] p.4 and [RTG]
    # both show the walkway, the amber beacon on a stalk and two whip aerials.
    dark.append(box('walk', (3.06, 1.30, 0.05), MAT_DARK, None,
                    (0, HOUSE_Y1 + 0.30, HOUSE_TOP + 0.03)))
    rail(steel, [(-1.48, HOUSE_Y1 - 0.30), (-1.48, HOUSE_Y1 + 0.92),
                 (1.48, HOUSE_Y1 + 0.92), (1.48, HOUSE_Y1 - 0.30)], HOUSE_TOP)
    steel.append(tube('beaconst', 0.020, 0.32, MAT_STEEL, None,
                      (-1.28, HOUSE_Y0 + 0.30, HOUSE_TOP)))
    haz.append(tube('beacon', 0.085, 0.17, MAT_HAZARD, None,
                    (-1.28, HOUSE_Y0 + 0.30, HOUSE_TOP + 0.32), sides=12))
    for px in (-1.32, 1.32):
        steel.append(tube('aerial', 0.010, 1.65, MAT_STEEL, None,
                          (px, HOUSE_Y0 + 0.15, HOUSE_TOP), sides=4))
    for i in range(4):
        haz.append(box('lrung', (0.44, 0.04, 0.03), MAT_HAZARD, None,
                       (1.72, HOUSE_Y1 - 0.60, DECK_Z - 0.16 - i * 0.26)))
    for sx in (-1, 1):
        steel.append(tube('lstr', 0.020, 1.20, MAT_STEEL, None,
                          (1.72 + sx * 0.22, HOUSE_Y1 - 0.60, DECK_Z - 1.10), sides=6))

    for loc in ((CAB_X - 0.52, CAB_Y0 - 0.06, CAB_FLOOR + CAB_H + 0.14),
                (CAB_X + 0.52, CAB_Y0 - 0.06, CAB_FLOOR + CAB_H + 0.14),
                (0.0, HOUSE_Y1 + 0.40, HOUSE_TOP + 0.10)):
        lamp_housing(dark, loc)

    # ── the movable counterweight ──────────────────────────────────────────
    # A FLAT SLAB at the rear, flush with the machine-house sides — not a
    # bulbous crane block and not a stack of removable plates [GA][REF s9.9].
    # 6 000 + 2 000 kg [DS11]; 6 000 + 2 000 + 2 000 kg [DS25]. It EXTENDS,
    # and [DS11]'s two 1 500 mm ranges are consistent with it extending in step
    # with the leader shift — but that linkage is NOWHERE stated, so the two
    # slide: nodes are independent and the game can drive them apart.
    cwn = empty(NODE_SLIDE, 'counterweight', slew, (0, REAR_Y - 0.62, DECK_Z))
    cwn['travel_m'] = LEADER_SHIFT
    cwn['axis'] = 'y'
    cwl = [box('cwslab', (HOUSE_W + 0.04, 1.24, HOUSE_TOP - DECK_Z), MAT_DARK, None,
               (0, 0, (HOUSE_TOP - DECK_Z) / 2), bevel=0.05)]
    for i in range(3):
        cwl.append(box('cwrib', (HOUSE_W + 0.10, 0.05, 0.06), MAT_WORN, None,
                       (0, 0, 0.34 + i * 0.34)))
    for sx in (-1, 1):
        # chip and scrape damage lives on every leading edge: this machine gets
        # reversed into things all day [REF s6]
        cwl.append(box('cwchamf', (0.16, 1.28, 0.16), MAT_HAZARD, None,
                       (sx * (HOUSE_W / 2 + 0.02), 0, HOUSE_TOP - DECK_Z - 0.02)))
    merge('counterweight', cwl, cwn)

    # ── the single rear support leg ────────────────────────────────────────
    # [DS11] lists "rear support legs" as an OPTION and [GA] draws exactly one
    # vertical jack with a big round foot pad at the extreme rear, behind the
    # counterweight. There is NOTHING under the front: in normal driving this
    # machine stands on its tracks alone. The game's current pair of jacks
    # under the leader is wrong [REF s9.4].
    legn = empty(NODE_SLIDE, 'rear-leg', slew, (0, LEG_Y, LEG_STOW_Z))
    legn['travel_m'] = -LEG_STOW_Z
    legn['axis'] = 'z'
    lg = [box('legbar', (0.34, 0.34, TOWER_TOP - LEG_STOW_Z), MAT_DARK, None,
              (0, 0, (TOWER_TOP - LEG_STOW_Z) / 2), bevel=0.03),
          tube('legrod', 0.11, 0.42, MAT_CHROME, None, (0, 0, -0.42), sides=12),
          tube('legpad', LEG_PAD_D / 2, 0.09, MAT_WORN, None, (0, 0, -0.46), sides=20),
          tube('legpadc', LEG_PAD_D / 2 - 0.16, 0.16, MAT_WORN, None,
               (0, 0, -0.42), sides=16)]
    merge('rear_leg', lg, legn)

    # ── THREE winches, not two ─────────────────────────────────────────────
    # [DS11][DS25] pile 10 000 kg, hammer 15 000 [DS11] / 16 500 kg [DS25 and
    # GB22], auxiliary 5 000 kg. The game builds only two [REF s9.7]. The
    # auxiliary is how the NEXT pile gets pitched — visible on [PB13] as a
    # separate line to a standing pile — and it earns its place in the model.
    for nm, wx, wy, wr, ww in (('winch-pile', -0.82, HOUSE_Y0 + 0.55, 0.30, 0.58),
                               ('winch-hammer', 0.82, HOUSE_Y0 + 0.55, 0.35, 0.66),
                               ('winch-aux', 0.0, HOUSE_Y0 + 1.62, 0.23, 0.44)):
        for sx in (-1, 1):
            dark.append(box('wfr', (0.10, 0.42, 0.72), MAT_DARK, None,
                            (wx + sx * (ww / 2 + 0.09), wy, DECK_Z + 0.36),
                            bevel=0.02))
        pn = empty(NODE_PIVOT, nm, slew, (wx, wy, DECK_Z + 0.36 + wr))
        pn['axis'] = 'x'
        dr = [tube('drum', wr, ww, MAT_STEEL, None, (-ww / 2, 0, 0),
                   (0, 90 * DEG, 0), sides=18)]
        for sx in (-1, 1):
            dr.append(tube('flange', wr + 0.08, 0.05, MAT_STEEL, None,
                           (sx * ww / 2, 0, 0), (0, 90 * DEG, 0), sides=18))
        rl = []
        for i in range(int(ww / 0.046)):
            # rope dressing — black tar-like grease — gets flung onto the
            # surrounding paint from here [REF s6]
            rl.append(tube('lay', wr + 0.022, 0.042, MAT_WORN, None,
                           (-ww / 2 + 0.024 + i * 0.046, 0, 0), (0, 90 * DEG, 0),
                           sides=8))
        merge(nm.replace('-', '_'), dr, pn)
        merge(nm.replace('-', '_') + '_rope', rl, pn)

    merge('upper_paint', paint, slew)
    merge('upper_dark', dark, slew)
    merge('upper_worn', worn, slew)
    merge('upper_steel', steel, slew)
    merge('upper_glass', glass, slew)
    merge('upper_hazard', haz, slew)

    # ══ THE LEADER ═════════════════════════════════════════════════════════
    # Node chain: the whole leader slides 1 500 mm fore/aft to spot the next
    # pile without tracking [DS11][DS25], then rakes fore/aft AND sideways on
    # separate capacity tables with an electronic inclinometer as standard.
    # Raked piles are normal work and the mast is often NOT vertical [REF s5].
    spot = empty(NODE_SLIDE, 'leader-spot', slew, (0, PILE_AXIS_Y, 0))
    spot['travel_m'] = LEADER_SHIFT
    spot['axis'] = 'y'
    # fore/aft rake turns about the erection hinge on the deck nose [GA];
    # side rake turns about the leader axis at ground level. The second node
    # carries the offset back out, so everything below is authored in the
    # leader frame: y_local = y_world + 4.10 and z = height above ground.
    rake = empty(NODE_PIVOT, 'leader-rake', spot, (0, HINGE_Y - PILE_AXIS_Y, HINGE_Z))
    rake['axis'] = 'x'
    root = empty(NODE_PIVOT, 'leader-rake-side', rake,
                 (0, PILE_AXIS_Y - HINGE_Y, -HINGE_Z))
    root['axis'] = 'y'
    Y0 = LEAD_FRONT + LF          # leader front face, leader-local
    YC = Y0 + LEADER_D / 2        # leader box centre

    ld, lst, lhz = [], [], []
    # OUTER (lower) section: ground to the telescope break at 17.80 m — that
    # break is [DS11]'s printed 900/1800/6000/13800 chain, 23 800 - 6 000.
    ld.append(leader_girder('leader_low', 0.0, TELE_BREAK, LEADER_W, LEADER_D, YC))
    # guide rails on the FRONT face. They get a bright polished stripe exactly
    # where the hammer jaws run, and rust above and below it — the stripe's
    # length tells you how far the hammer normally goes [REF s6].
    for sx in (-1, 1):
        lst.append(box('rail', (0.14, 0.17, TELE_BREAK - 0.20), MAT_STEEL, None,
                       (sx * 0.30, Y0 - 0.075, (TELE_BREAK - 0.20) / 2 + 0.10),
                       bevel=0.015))
    # the rear chord / service duct that runs the full length behind the holes
    ld.append(box('leader_chord', (LEADER_W - 0.16, 0.22, TELE_BREAK - 0.30),
                  MAT_DARK, None, (0, Y0 + LEADER_D + 0.09, (TELE_BREAK - 0.30) / 2),
                  bevel=0.02))
    for zz in (FOOT_BREAK, TELE_BREAK - 0.10):
        ld.append(box('lspl', (LEADER_W + 0.10, LEADER_D + 0.10, 0.12), MAT_DARK,
                      None, (0, YC, zz), bevel=0.015))

    # ── the leader foot ────────────────────────────────────────────────────
    # It reaches DOWN PAST THE TRACK LINE to the ground at the pile, and pushes
    # down to bear or lifts to clear: 1 000 up / 500 down [DS11][DS25]. The
    # bottom 1.5 m of the leader is the dirtiest single place on the machine —
    # everything the pile brings up is thrown at it [REF s6].
    foot = empty(NODE_SLIDE, 'leader-foot', root, (0, 0, 0))
    foot['travel_up_m'] = FOOT_UP
    foot['travel_down_m'] = -FOOT_DOWN
    foot['axis'] = 'z'
    ftl = [box('footbox', (LEADER_W + 0.28, LEADER_D + 0.26, 1.05), MAT_DARK, None,
               (0, YC, 0.52), bevel=0.04),
           box('footpad', (1.50, 1.34, 0.16), MAT_WORN, None, (0, YC - 0.06, 0.06))]
    for sx in (-1, 1):
        ftl.append(box('footear', (0.22, 0.60, 0.80), MAT_DARK, None,
                       (sx * 0.56, Y0 - 0.26, 0.85), bevel=0.02))
    ftl.append(box('foothz', (LEADER_W + 0.32, 0.07, 0.28), MAT_HAZARD, None,
                   (0, Y0 - 0.17, 1.16)))
    merge('leader_foot', ftl, foot)

    # ── the leader carrier / guide collar ──────────────────────────────────
    # [GA] shows a fabricated guide box gripping the leader from z = 3.10 to
    # 6.20, carried on a pair of tapering cheeks off the deck nose. This is the
    # hardware the 1 500 mm horizontal shift runs in.
    for sx in (-1, 1):
        ld.append(plate('carrcheek',
                        [(Y0 + LEADER_D + 0.10, COLLAR_Z0 - 0.10),
                         (Y0 + LEADER_D + 1.55, COLLAR_Z0 - 1.55),
                         (Y0 + LEADER_D + 1.85, COLLAR_Z0 - 1.20),
                         (Y0 + LEADER_D + 0.35, COLLAR_Z1)],
                        0.10, MAT_DARK, None, (sx * 0.62, 0, 0), bevel=0.02))
    ld.append(box('collar', (LEADER_W + 0.44, LEADER_D + 0.34, COLLAR_Z1 - COLLAR_Z0),
                  MAT_DARK, None, (0, YC + 0.04, (COLLAR_Z0 + COLLAR_Z1) / 2),
                  bevel=0.04))
    for zz in (COLLAR_Z0 + 0.14, COLLAR_Z1 - 0.14):
        ld.append(box('collarfl', (LEADER_W + 0.58, LEADER_D + 0.48, 0.14),
                      MAT_DARK, None, (0, YC + 0.04, zz), bevel=0.02))
    # the horizontal shift cylinder, lying along the carrier
    lst.append(tube('shiftrod', 0.07, 1.55, MAT_CHROME, None,
                    (-0.55, Y0 + LEADER_D + 0.30, COLLAR_Z0 - 0.55),
                    (0, 90 * DEG, 0), sides=10))

    # ── telescope: 4 000 mm of stroke ──────────────────────────────────────
    # Transport height comes down, working height goes up [DS11][DS25]. Above
    # the splice at 23.75 m [GA] the section carries THREE TALL OBROUND holes
    # instead of circles — measured, and in no other source.
    tele = empty(NODE_SLIDE, 'leader-tele', root, (0, 0, 0))
    tele['travel_m'] = -TELE_STROKE
    tele['axis'] = 'z'
    # The INNER (telescoping) section is 9.10 m long and nests inside the outer
    # one: 1.30 m of overlap fully extended, 5.30 m retracted. Its own bolted
    # splice at 23.75 m is where "extra leader sections" [DS25 options] go on,
    # and above that splice the hole pattern changes.
    UP0, UPT = TELE_BREAK - 1.30, LEADER_TOP - 0.90
    tu, tus, tuc = [], [], []
    tu.append(leader_girder('leader_up', UP0, SPLICE_Z,
                            LEADER_W - 0.03, LEADER_D - 0.03, YC))
    tu.append(leader_girder('leader_top', SPLICE_Z, UPT,
                            LEADER_W - 0.03, LEADER_D - 0.03, YC, holes='obround'))
    tu.append(box('lsplU', (LEADER_W + 0.08, LEADER_D + 0.08, 0.12), MAT_DARK, None,
                  (0, YC, SPLICE_Z), bevel=0.015))
    for sx in (-1, 1):
        tus.append(box('railU', (0.14, 0.17, UPT - UP0 - 0.10), MAT_STEEL, None,
                       (sx * 0.30, Y0 - 0.075, (UP0 + UPT) / 2), bevel=0.015))
    # ── the cathead ────────────────────────────────────────────────────────
    # [GA]: a head block 900 mm deep at the very top ([DS11]'s printed chain
    # opens with 900 mm), carrying two sheaves and an oval lightening hole,
    # PLUS one large sheave slung on a bracket that projects forward over the
    # pile axis so the pile line hangs clear of the leader. A side cathead is a
    # listed option [DS11][DS25]; the sheave count is not printed anywhere and
    # both drawings render the top too small to count [REF s8].
    HB = LEADER_TOP - 0.90
    tuc.append(box('cathead', (LEADER_W + 0.30, LEADER_D + 0.46, 0.90), MAT_CAST,
                   None, (0, YC - 0.16, HB + 0.45), bevel=0.04))
    tuc.append(plate('catnose', [(Y0 - 0.05, HB + 0.10), (Y0 - 0.05, HB + 0.78),
                                 (-0.44, HB + 0.66), (-0.44, HB + 0.26)],
                     LEADER_W + 0.24, MAT_CAST, None, (0, 0, 0), bevel=0.03))
    for sx in (-1, 1):
        tuc.append(box('catgus', (0.09, 0.94, 0.66), MAT_CAST, None,
                       (sx * (LEADER_W / 2 + 0.16), 0.02, HB + 0.50), bevel=0.02))
    merge('leader_upper', tu, tele)
    merge('leader_upper_rails', tus, tele)
    merge('cathead', tuc, tele)
    # sheaves: the forward one over the pile axis is the big one
    for nm, sx, sy, sr in (('sheave-pile', 0.0, 0.0, 0.32),
                           ('sheave-hammer', -0.26, YC - 0.20, 0.24),
                           ('sheave-aux', 0.26, YC - 0.20, 0.24)):
        pn = empty(NODE_PIVOT, nm, tele, (sx, sy, HB + 0.45))
        pn['axis'] = 'x'
        sh = [tube('sv', sr, 0.11, MAT_CAST, None, (-0.055, 0, 0), (0, 90 * DEG, 0),
                   sides=22),
              tube('svr', sr - 0.05, 0.15, MAT_CAST, None, (-0.075, 0, 0),
                   (0, 90 * DEG, 0), sides=18)]
        merge(nm.replace('-', '_'), sh, pn)

    # ── BACKSTAY: two long slender tapering ties, one per side ─────────────
    # NOT a deep pierced plate box. [REF] s4.3/s9.3 says it is and reaches 45 %
    # of the leader height, but that reading comes from [RTG] — a DIFFERENT
    # manufacturer. On [DS25] p.1 the tie runs from the leader's rear face at
    # z = 9.58 m back and down at a constant 0.80 horizontal per 1.0 vertical
    # to a pin 2 753 mm behind the slew centre at z = 2.36 m: 9.05 m long,
    # 37 deg off vertical, tapering 0.16 m -> 0.55 m. Traced by pixel scan
    # across rows 1420/1500/1600/1700/1800/1870, slope constant to within 0 %.
    ay, az = AF_APEX_Y + LF, AF_APEX_Z
    by, bz = TIE_PIN_Y + LF, TIE_PIN_Z
    dy, dz = by - ay, bz - az
    L = math.hypot(dy, dz)
    ny, nz = -dz / L, dy / L
    for sx in (-1, 1):
        poly = [(ay + ny * 0.08, az + nz * 0.08), (by + ny * 0.28, bz + nz * 0.28),
                (by - ny * 0.28, bz - nz * 0.28), (ay - ny * 0.08, az - nz * 0.08)]
        ld.append(plate('tie', poly, 0.10, MAT_DARK, None, (sx * 0.86, 0, 0),
                        bevel=0.02))
    ld.append(box('tieapex', (2.00, 0.42, 0.60), MAT_DARK, None,
                  (0, Y0 + LEADER_D + 0.16, AF_APEX_Z), bevel=0.03))
    ld.append(box('tiefoot', (2.00, 0.50, 0.42), MAT_DARK, None,
                  (0, by, bz), bevel=0.03))
    # a rope guide sheave on the leader rear at z = 10.29 m [GA]
    lst.append(tube('gsv', 0.26, 0.10, MAT_CAST, None,
                    (-0.05, Y0 + LEADER_D + 0.30, 10.29), (0, 90 * DEG, 0), sides=18))

    merge('leader_body', ld, root)
    merge('leader_rails', lst, root)
    if lhz:
        merge('leader_hazard', lhz, root)

    # ── the rake / erection cylinders ──────────────────────────────────────
    # One long heavy cylinder per side with a bright chrome rod, sharing the
    # backstay apex bracket and coming down onto the portal tower [GA]. It is
    # ~7.8 m long: this is the ram that stands a 26.5 m leader up on its own
    # hydraulics in a few minutes — self-erecting, and transported in one piece
    # WITHOUT removing the hammer [PB13]. Bore and rod diameters are printed
    # nowhere [REF s8]; proportioned off the drawing.
    cy, cz = RC_PIN_Y + LF, RC_PIN_Z
    cdy, cdz = cy - ay, cz - az
    CL = math.hypot(cdy, cdz)
    ang = math.atan2(-cdy, cdz)   # tube() +Z under rot X: +Z -> (0,-sin,cos)
    for sx in (-1, 1):
        n = empty(NODE_SLIDE, 'rake-cyl-%s' % ('l' if sx < 0 else 'r'), root,
                  (sx * 0.62, ay, az))
        n['travel_m'] = 3.40
        n['axis'] = 'z'
        rc = [tube('rcbar', 0.175, CL * 0.50, MAT_DARK, None, (0, 0, 0),
                   (ang, 0, 0), sides=16),
              tube('rcgland', 0.155, 0.22, MAT_DARK, None,
                   (0, -math.sin(ang) * CL * 0.48, math.cos(ang) * CL * 0.48),
                   (ang, 0, 0), sides=16),
              tube('rcrod', 0.105, CL * 0.56, MAT_CHROME, None,
                   (0, -math.sin(ang) * CL * 0.46, math.cos(ang) * CL * 0.46),
                   (ang, 0, 0), sides=14),
              tube('rceyeA', 0.135, 0.28, MAT_DARK, None, (-0.14, 0, 0),
                   (0, 90 * DEG, 0), sides=14)]
        merge('rake_cyl_%s' % ('l' if sx < 0 else 'r'), rc, n)

    # ══ HAMMER CARRIAGE ════════════════════════════════════════════════════
    # The hammer is centred on the PILE AXIS, 500 mm forward of the leader's
    # front face [GA] — it hangs clear in front of the leader and grips the
    # rails with its jaws, rather than lying against the leader box.
    ham = empty(NODE_SLIDE, 'hammer-carriage', root, (0, 0.0, HAMMER_BOT))
    ham['travel_lo_m'] = 1.40 - HAMMER_BOT
    ham['travel_hi_m'] = (LEADER_TOP - 2.60) - HAMMER_L - HAMMER_BOT
    ham['axis'] = 'z'
    build_hammer(ham)
    # the ram: 1 200 mm of visible travel inside the frame, 40-100 blows/min
    # (Classic) or 50-140+ (X-series) [HB]. This is the animation amplitude.
    ramn = empty(NODE_SLIDE, 'hammer-ram', ham, (0, 0, 1.10))
    ramn['stroke_m'] = RAM_STROKE
    ramn['axis'] = 'z'
    merge('hammer_ram',
          [box('ram', (HAMMER_W - 0.32, HAMMER_D - 0.26, 2.20), MAT_STEEL, None,
               (0, 0, 1.10), bevel=0.03),
           tube('ramrod', 0.115, 1.70, MAT_STEEL, None, (0, 0, 2.20), sides=12)],
          ramn)

    # DRIVE CAP / HELMET / DOLLY / PACKING.
    # 550 x 550 mm face for a 7-9 t ram [HB] on a 350 mm pile: it VISIBLY
    # OVERHANGS the pile head, and the helmet MUST NOT fit tightly so the pile
    # can rotate if it strikes an obstruction [REF s4.5 citing Tomlinson;
    # s9.10]. That loose, grubby, oversize joint — splintered hardwood dolly,
    # shredded packing hanging out, hammered and burred steel, concrete dust —
    # is where this machine's wear story actually lives.
    cap = empty(NODE_SLIDE, 'drive-cap', ham, (0, 0, -0.45))
    cap['axis'] = 'z'
    cpl = [box('helmet', (DRIVE_CAP, DRIVE_CAP, 0.32), MAT_CAST, None,
               (0, 0, 0.16), bevel=0.025),
           box('helmskirt', (DRIVE_CAP + 0.07, DRIVE_CAP + 0.07, 0.15), MAT_CAST,
               None, (0, 0, -0.045), bevel=0.02)]
    # the tapering pile sleeve above the cap, drawn clearly on [GA]
    cpl.append(plate('sleeve',
                     [(-0.30, 0.30), (0.30, 0.30), (0.46, 0.92), (-0.46, 0.92)],
                     0.84, MAT_CAST, None, (0, 0, 0), bevel=0.02))
    dol = [box('dolly', (DRIVE_CAP - 0.09, DRIVE_CAP - 0.09, 0.17), MAT_WORN, None,
               (0, 0, 0.40), bevel=0.012)]
    pk = []
    for i in range(6):
        a = i * 1.05
        pk.append(box('packing', (0.08, 0.05, 0.14), MAT_RUBBER, None,
                      (math.cos(a) * 0.27, math.sin(a) * 0.27, -0.07),
                      (0.32 * math.sin(a), 0.22, a)))
    merge('drive_cap', cpl, cap)
    merge('drive_dolly', dol, cap)
    merge('drive_packing', pk, cap)

    # ══ THE PILE ═══════════════════════════════════════════════════════════
    # Precast concrete, 350 mm square, light warm grey, matte, SHARP CHAMFERED
    # ARRISES, cast-in lifting points, plain cast face [REF s6]. It rides the
    # same leader guides as the hammer and STAYS IN THE GROUND when the hammer
    # lifts, so it is its own node and not welded into the carriage.
    pile = empty(NODE_SLIDE, 'pile', root, (0, 0, PILE_TOP))
    pile['axis'] = 'z'
    pl = [box('pile', (PILE_SIDE, PILE_SIDE, PILE_LEN), MAT_WORN, None,
              (0, 0, -PILE_LEN / 2), bevel=0.020),
          box('piletip', (PILE_SIDE * 0.5, PILE_SIDE * 0.5, 0.46), MAT_WORN, None,
              (0, 0, -PILE_LEN - 0.20), bevel=0.055)]
    for i in range(3):
        pl.append(tube('pilelift', 0.024, 0.17, MAT_WORN, None,
                       (0, PILE_SIDE / 2, -1.4 - i * 4.6), (-90 * DEG, 0, 0), sides=6))
    merge('pile', pl, pile)
    # the pile gate / clamp arm that projects sideways from the leader on both
    # GA drawings. Its shape and travel are UNRESOLVED [REF s8] — treated as a
    # plain two-jaw gate at the guide line. Do NOT read this shape as sourced.
    gate = empty(NODE_PIVOT, 'pile-gate', root, (0, Y0 - 0.12, 2.80))
    gate['axis'] = 'z'
    gl = [box('gatearm', (0.17, 0.95, 0.26), MAT_STEEL, None, (0, -0.48, 0),
              bevel=0.02)]
    for sx in (-1, 1):
        gl.append(box('gatejaw', (0.13, 0.34, 0.34), MAT_STEEL, None,
                      (sx * 0.30, -0.86, 0), bevel=0.02))
    merge('pile_gate', gl, gate)

    # ══ ROPES ══════════════════════════════════════════════════════════════
    # Two ropes run up the leader and over the head — one to the hammer, one to
    # the pile — and when the hammer is high and a pile is being pitched BOTH
    # are loaded, at different angles, and both are visible against the sky
    # [REF s4.4]. Bezier curves, not cylinders, so they hang.
    ropes = []
    ropes.append(hose('rope_hammer',
                      [(-0.26, YC - 0.20, HB + 0.75),
                       (-0.26, Y0 - 0.10, HB - 3.6),
                       (-0.24, 0.02, HAMMER_BOT + HAMMER_L + 0.34)],
                      radius=0.022, mat=MAT_WORN, parent=root, sides=6))
    ropes.append(hose('rope_pile',
                      [(0.0, -0.30, HB + 0.50),
                       (0.05, -0.34, HB - 5.0),
                       (0.04, -0.30, PILE_TOP + 1.30)],
                      radius=0.019, mat=MAT_WORN, parent=root, sides=6))
    # the auxiliary line hanging free with its hook: this is how the NEXT pile
    # gets pitched, and [PB13] shows exactly that — a second pile standing on
    # its own line beside the one being driven.
    ropes.append(hose('rope_aux',
                      [(0.26, YC - 0.20, HB + 0.75),
                       (0.32, Y0 + LEADER_D + 1.15, HB - 6.5),
                       (0.30, Y0 + LEADER_D + 0.95, 3.60)],
                      radius=0.015, mat=MAT_WORN, parent=root, sides=6))
    ropes = [to_mesh(r) for r in ropes]
    ropes.append(box('auxhook', (0.11, 0.15, 0.50), MAT_WORN, None,
                     (0.30, Y0 + LEADER_D + 0.95, 3.28), bevel=0.02))
    merge('leader_ropes', ropes, root)

    # ══ HOSES ══════════════════════════════════════════════════════════════
    # Hose routing on this machine is EXTERNAL, VISIBLE and slightly untidy.
    # The bundle is strapped down the side of the leader with a service loop
    # [GB22 p.4 close-up] and a loose loop hangs free at mid-leader [RTG]. The
    # game's hoses stop at y = 3.6 near the leader foot; on the real machine
    # they run ALL THE WAY UP TO THE HAMMER and hang in a long free catenary
    # that changes shape as the hammer travels — unmistakable on [PB13], cheap
    # to add, and it animates for free with the carriage [REF s9.5].
    hz = []
    for i in range(4):
        ox = 0.30 + i * 0.055
        hz.append(hose('hose_up%d' % i,
                       [(LEADER_W / 2 + 0.05, Y0 + LEADER_D + 0.20, DECK_Z + 0.30),
                        (LEADER_W / 2 + ox, Y0 + LEADER_D + 0.16, 5.0),
                        (LEADER_W / 2 + ox, Y0 + LEADER_D + 0.14, 9.5),
                        (LEADER_W / 2 + ox, Y0 + LEADER_D + 0.12, 12.6)],
                       radius=0.036, parent=root, sides=6))
    for i in range(2):
        hz.append(hose('hose_loop%d' % i,
                       [(LEADER_W / 2 + 0.32 + i * 0.06,
                         Y0 + LEADER_D + 0.14, 12.6),
                        (LEADER_W / 2 + 0.62, Y0 + LEADER_D + 0.75, 10.4 - i * 0.3),
                        (HAMMER_W / 2 + 0.34, Y0 + 0.20, 13.6),
                        (HAMMER_W / 2 + 0.22, 0.06, HAMMER_BOT + HAMMER_L * 0.70)],
                       radius=0.034, parent=root, sides=6))
    for zz in (2.4, 5.2, 8.0, 10.8):
        hz.append(box('pclip', (0.30, 0.17, 0.08), MAT_RUBBER, None,
                      (LEADER_W / 2 + 0.36, Y0 + LEADER_D + 0.14, zz)))
    hz = [to_mesh(h) if h.type == 'CURVE' else h for h in hz]
    merge('leader_hoses', hz, root)

    lm = []
    lamp_housing(lm, (LEADER_W / 2 + 0.18, Y0 - 0.18, 9.20))
    lamp_housing(lm, (-LEADER_W / 2 - 0.18, Y0 - 0.18, 2.60))
    merge('leader_lamps', lm, root)

    # ══ WORK LIGHTS ════════════════════════════════════════════════════════
    # env.js reads mount:/aim: world positions EVERY FRAME to re-aim spotlights,
    # which is why a lamp on a moving member sweeps as the machine works. Two of
    # these are on the leader, so they rake, shift and telescope with it — and
    # the leader-mid lamp is what lights the pile head on a night pour.
    worklight('cab-l', slew, (CAB_X - 0.52, CAB_Y0 - 0.06, CAB_FLOOR + CAB_H + 0.14),
              (-0.25, -1.0, -0.30), cone_deg=58, range_m=32)
    worklight('cab-r', slew, (CAB_X + 0.52, CAB_Y0 - 0.06, CAB_FLOOR + CAB_H + 0.14),
              (0.25, -1.0, -0.30), cone_deg=58, range_m=32)
    worklight('deck-rear', slew, (0.0, HOUSE_Y1 + 0.40, HOUSE_TOP + 0.10),
              (0, 1.0, -0.55), cone_deg=64, range_m=18)
    worklight('leader-mid', root, (LEADER_W / 2 + 0.18, Y0 - 0.18, 9.20),
              (0.12, -0.30, -1.0), cone_deg=44, range_m=28)
    worklight('leader-foot', root, (-LEADER_W / 2 - 0.18, Y0 - 0.18, 2.60),
              (-0.14, -0.55, -1.0), cone_deg=52, range_m=14)

    # ── mounts the game may want for decals, plates and hose ends ──────────
    # DOMAIN.md section 10: the data plate carries the rig's own INVENTED
    # marque, because a data plate names the manufacturer — and Drillity is the
    # marketplace, not an OEM. Nothing here carries a string of any kind.
    empty(NODE_MOUNT, 'plate', slew, (HOUSE_W / 2 + 0.02, HOUSE_Y0 + 0.45,
                                      DECK_Z + 0.95), (0, 90 * DEG, 0))
    empty(NODE_MOUNT, 'marque', slew, (0, REAR_Y + 0.02, DECK_Z + 0.70))
    empty(NODE_MOUNT, 'operator', slew, (CAB_X, (CAB_Y0 + CAB_Y1) / 2,
                                         CAB_FLOOR + 1.20))
    empty(NODE_MOUNT, 'pile-head', root, (0, 0, PILE_TOP))

    # apply everything still carrying a modifier: finish()'s join keeps only
    # the ACTIVE object's modifier stack and would silently drop the rest
    for o in list(bpy.context.scene.objects):
        if o.type == 'MESH' and o.modifiers:
            _apply_mods(o)
    bpy.ops.object.select_all(action='DESELECT')

    return finish(out_path)


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(os.path.dirname(__file__), '..',
                                       'public', 'models', 'piling_leader.glb')))
