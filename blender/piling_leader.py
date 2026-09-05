"""
piling_leader — 'Bergholt PM-78 Leaderline'
Crawler-mounted, self-erecting, TELESCOPIC-LEADER driven-piling rig with a
hydraulic impact hammer. There is NO BOOM on this machine: one very tall
vertical leader pinned to the front of a slewing upperstructure and braced
back to it by a deep pierced A-frame and rake cylinders.

PROVENANCE (shape only — no maker's name or model designation ships in any
string that can reach a player; DOMAIN.md section 10).

  [DS]   13915_Junttan_PM25H_Datasheet.pdf p.2 "Technical Data" + the two
         DIMENSIONED general-arrangement elevations. Every hard number below
         that is tagged [DS] is a printed dimension on that sheet.
  [DSs]  Scaled off the same GA against the printed 5 700 mm crawler bar,
         +/-5..10 %. NOT a printed dimension.
  [HB]   Junttan_Hammers_brochure_EN_2025_web.pdf, "Technical Data" spread —
         HHK Classic A-series and X-series SHK tables (ram mass, energy,
         stroke, hammer LENGTH and WEIGHT, drive-cap face sizes).
  [GB22] Junttan_General_Brochure_General_2022_web.pdf p.4 — rig comparison
         tables and three photographs (timber-mat quay job; leader close-up
         with a precast pile in the guides and the strapped hose bundle;
         long-range two-rig silhouette).
  [PB13] 16291_Junttan_Piling_brochure_3_2013_WEB.pdf p.1 cover photograph —
         blue leader on a red carrier, hammer high, the round lightening
         holes plainly visible down the leader, huge free hose loop.
  [RTG]  rtg-rammtechnik-gmbh-rg-rammgeraet-im-einsatz-pile-driver-in-action
         -2023.jpg.webp — the A-frame as a deep PIERCED PLATE BOX, the cab as
         a tall glasshouse with a tubular FOPS cage, the track cross-carrier,
         aerials + beacon, and a working machine's actual grime.
  [REF]  research/rigs/piling-leader.md — the local reference pack that
         collates all of the above.
  [WEB]  Web research on the real machine class, cited inline at the point of
         use. See the WEB RESEARCH block at the bottom of this docstring.

WEB RESEARCH — what the photographs added that the datasheet could not
---------------------------------------------------------------------
(filled in during the second pass; see inline [WEB] tags)

AXES. Blender Z-up. Origin = SLEW CENTRE at GROUND LEVEL, so the rig drops on
terrain at y=0. -Y is FORWARD (the pile axis side); +Y is aft (counterweight).
+X is the right-hand side. The exporter's yup conversion maps Blender -Y to
three.js +Z, which is the direction rigFactory.js already treats as forward
for this machine (its leader sits at z~0 and its counterweight at z=-5.55).
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

from rig import (  # noqa: E402
    reset, part, box, tube, hose, empty, worklight, finish,
    NODE_MOUNT, NODE_AIM, NODE_PIVOT, NODE_SLIDE,
    MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST, MAT_RUBBER,
    MAT_GLASS, MAT_CHROME, MAT_HAZARD,
)

# ═══════════════════════════════════════════════════════════════════════════
# DIMENSIONS.  Metres.  Tag on every line says where the number comes from.
# ═══════════════════════════════════════════════════════════════════════════

# ── undercarriage ──────────────────────────────────────────────────────────
CRAWLER_L      = 5.70    # [DS] crawler length, overall. The master scale bar.
SPROCKET_IDLER = 4.80    # [DS] sprocket-to-idler centres
SHOE_W         = 0.90    # [DS] track shoe width (800/900/1000 offered; 900 std)
GAUGE_NARROW   = 3.38    # [DS] track gauge, travelling, over 900 mm shoes
GAUGE_WIDE     = 4.88    # [DS] track gauge, working. Expands 1 500 mm.
TRACK_H        = 0.86    # [DSs] track frame height incl. grousers, 800-900 mm
WHEEL_R        = TRACK_H / 2.0
SHOE_PITCH     = 0.190   # [DSs] counted off the GA track run

# ── upperstructure ─────────────────────────────────────────────────────────
SLEW_RING_D    = 1.60    # [DS] slewing ring, single row, single drive
DECK_Z         = 1.10    # [DSs] deck plate height above ground
HOUSE_L        = 3.10    # [DSs] engine house length above the deck
HOUSE_H        = 1.50    # [DSs] engine house height above the deck
HOUSE_W        = 2.90    # [DSs] not printed anywhere; no plan view exists
CAB_L          = 1.90    # [DSs] cab, fore-aft
CAB_H          = 1.90    # [DSs] cab, height
CAB_W          = 1.30    # DERIVED — no plan view of this class exists [REF s8]

# The GA gives two ranges that always sum to 9 300 mm:
#   pile axis -> slew centre  5 100 ... 3 600 mm   [DS]
#   slew centre -> rear end   4 200 ... 5 700 mm   [DS]
# i.e. the leader shifts 1 500 mm and the counterweight extends 1 500 mm.
# Whether the two are mechanically LINKED is NOT stated. [REF s3] Modelled at
# mid-travel with independent slide: nodes so the game can drive them apart.
PILE_AXIS_Y    = -4.35   # [DS] mid of the 5 100..3 600 range
REAR_Y         = 4.95    # [DS] mid of the 4 200..5 700 range
LEADER_SHIFT   = 1.50    # [DS] horizontal (spotting) leader travel

# ── the leader.  This is the whole identity of the machine. ────────────────
LEADER_TOP     = 26.50   # [DS] overall height, standard configuration
# [DS] the GA's upper vertical chain, read top-down: 900 / 1800 / 6000 / 13800.
# Those four sum to 22 500 and land exactly on the printed 4 000 mm leader-foot
# region, which is how the section breaks below were recovered:
HEAD_BOT       = 25.60   # 26.50 - 0.900  : cathead / sheave block
UPPER_BREAK    = 23.80   # 25.60 - 1.800  : top section break
TELE_BREAK     = 17.80   # 23.80 - 6.000  : telescope region
FOOT_BREAK     = 4.00    # 17.80 - 13.800 : and 4 000 mm is the printed foot dim
TELE_STROKE    = 4.00    # [DS] leader telescope stroke
FOOT_UP        = 1.00    # [DS] leader foot travel up
FOOT_DOWN      = 0.50    # [DS] leader foot travel down
LEADER_D       = 1.00    # [DSs] fore/aft depth, +/-10 %, ~1.7x the hole pitch
LEADER_W       = 0.74    # DERIVED — no plan or front elevation exists [REF s8]
HOLE_PITCH     = 0.58    # [DSs] pixel-scanned off the p.1 elevation, +/-10 %
HOLE_D         = 0.24    # [DSs] ~0.41 x the pitch
UP_D           = 0.86    # upper (telescoping) section, sized to nest
UP_W           = 0.62

# ── the hammer.  A 9 t-ram hammer is 28 % of the leader height. ────────────
HAMMER_L       = 7.38    # [HB] HHK9A, 9 000 kg ram, EXCLUDING cap and sleeve
HAMMER_W       = 0.86    # [DSs] scaled off the hammer drawn on the GA
HAMMER_D       = 0.80    # [DSs]
RAM_STROKE     = 1.20    # [HB] 1 200 mm across the Classic A and X series
DRIVE_CAP      = 0.55    # [HB] 550 x 550 mm face for a 7-9 t ram
JAW_SPACING    = 3.80    # [REF s9.11] jaws at ~+/-1.9 m on a 7.4 m hammer

# ── the pile ───────────────────────────────────────────────────────────────
PILE_SIDE      = 0.35    # precast concrete pile, 350 mm square
PILE_LEN       = 14.00   # [DS] max 25 m; 14 m is a routine housing-plot pile
PILE_TOP       = 13.40   # modelled pose: pile pitched, tip 0.6 m into the ground
HAMMER_BOT     = 13.82   # hammer sitting on the drive cap on the pile head

DEG = math.pi / 180.0


# ═══════════════════════════════════════════════════════════════════════════
# LOCAL HELPERS — the Blender techniques rig.py does not wrap
# ═══════════════════════════════════════════════════════════════════════════

def plate(name, poly_yz, thick, mat=MAT_DARK, parent=None, loc=(0, 0, 0),
          rot=(0, 0, 0), bevel=0.0):
    """A flat plate of arbitrary OUTLINE, extruded across X.

    `poly_yz` is a simple polygon as (y, z) pairs. This is what makes a
    tapering fabricated plate structure possible at all — the A-frame on this
    machine is not two struts, it is a deep pierced plate box [RTG][REF s4.3],
    and a plate box cannot be built out of scaled cubes.
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


def punch(obj, centres, radius, depth=3.0, sides=16):
    """Boolean a row of round holes straight through `obj` along X.

    The continuous ladder of large round lightening holes down the leader side
    plate is THE identifying feature of this class [REF s4.3, s5.2] — visible
    on both GA drawings and plainly visible down the blue leader on [PB13].
    It is also the thing the game's procedural builder does not have.
    `centres` are in the object's own (pre-parent) frame.
    """
    cutters = []
    for (x, y, z) in centres:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=radius, depth=depth, vertices=sides,
            location=(x, y, z), rotation=(0.0, 90 * DEG, 0.0))
        cutters.append(bpy.context.active_object)
    bpy.ops.object.select_all(action='DESELECT')
    for c in cutters:
        c.select_set(True)
    bpy.context.view_layer.objects.active = cutters[0]
    if len(cutters) > 1:
        bpy.ops.object.join()
    cut = bpy.context.active_object
    _apply_mods(obj)                      # bake the bevel before cutting
    m = obj.modifiers.new('punch', 'BOOLEAN')
    m.operation = 'DIFFERENCE'
    m.object = cut
    m.solver = 'EXACT'
    _apply_mods(obj)
    bpy.data.objects.remove(cut, do_unlink=True)
    return obj


def array_along(o, count, offset):
    m = o.modifiers.new('arr', 'ARRAY')
    m.count = count
    m.use_relative_offset = False
    m.use_constant_offset = True
    m.constant_offset_displace = offset
    return o


def to_mesh(o):
    """Curves are NOT meshes, so finish() will not join them and each one
    would land as its own draw call. Convert every rope and hose."""
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    return bpy.context.active_object


def merge(name, objs, parent=None):
    """Join a list of meshes into one and keep the result under `parent`.

    finish() only joins STATIC geometry — anything under a pivot: or slide:
    node is left alone because it has to move independently. That is correct,
    but it means a detailed moving subassembly (this machine's leader is 60 %
    of the model and all of it moves) would blow the 70-draw-call budget one
    object at a time. So every dynamic subassembly is merged here, by hand,
    per material.
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


def bolt_ring(name, r, n, mat=MAT_WORN, parent=None, loc=(0, 0, 0), br=0.035):
    out = []
    for i in range(n):
        a = i * 2 * math.pi / n
        out.append(tube(name + str(i), br, 0.05, mat, None,
                        (loc[0] + r * math.cos(a), loc[1] + r * math.sin(a), loc[2]),
                        sides=6))
    return merge(name, out, parent)


# ═══════════════════════════════════════════════════════════════════════════
# SUBASSEMBLIES
# ═══════════════════════════════════════════════════════════════════════════

def build_track(side, parent):
    """One crawler frame, its belt and its running gear.

    900 mm shoes on a 5 700 mm frame is a VERY wide, short track — the plan
    aspect is nothing like an excavator [REF s4.1]. Sprocket at the REAR
    (counterweight end), smooth idler at the FRONT under the leader, where it
    takes the pounding. That reading is [DSs] off the GA side elevation, NOT a
    printed note, and should be verified before it is treated as certain.
    """
    half = SPROCKET_IDLER / 2.0
    dark, worn, steel = [], [], []

    # frame: a deep fabricated box, not a bar
    dark.append(box('tf', (0.56, CRAWLER_L, 0.60), MAT_DARK, None,
                    (0, 0, WHEEL_R + 0.02), bevel=0.03))
    # the belt: two straight runs and two end wraps
    worn.append(box('bl', (SHOE_W, SPROCKET_IDLER, 0.10), MAT_WORN, None,
                    (0, 0, 0.05)))
    worn.append(box('bu', (SHOE_W, SPROCKET_IDLER, 0.10), MAT_WORN, None,
                    (0, 0, TRACK_H - 0.05)))
    for sgn in (-1, 1):
        t = tube('bw', WHEEL_R + 0.05, SHOE_W, MAT_WORN, None,
                 (-SHOE_W / 2, sgn * half, WHEEL_R), (0, 90 * DEG, 0), sides=20)
        worn.append(t)

    # track shoes with TRIPLE GROUSER bars [DS lists 3-edge as an option and it
    # is the default read on a piling rig working soft ground]
    def shoe(nm, loc, rot=(0, 0, 0)):
        g = [box(nm, (SHOE_W, SHOE_PITCH * 0.92, 0.030), MAT_WORN, None, (0, 0, 0))]
        for k in (-1, 0, 1):
            g.append(box(nm + 'g', (SHOE_W * 0.94, 0.030, 0.055), MAT_WORN, None,
                         (0, k * 0.055, 0.042)))
        m = merge(nm, g)
        m.location = loc
        m.rotation_euler = rot
        return m

    n_run = int(SPROCKET_IDLER / SHOE_PITCH)
    s = shoe('shoe_b', (0, -half + SHOE_PITCH / 2, -0.012), (math.pi, 0, 0))
    array_along(s, n_run, (0, SHOE_PITCH, 0))
    worn.append(s)
    s = shoe('shoe_t', (0, -half + SHOE_PITCH / 2, TRACK_H + 0.012))
    array_along(s, n_run, (0, SHOE_PITCH, 0))
    worn.append(s)
    for sgn in (-1, 1):
        for i in range(9):
            a = (i / 8.0 - 0.5) * math.pi
            yy = sgn * (half + (WHEEL_R + 0.062) * math.cos(a))
            zz = WHEEL_R - (WHEEL_R + 0.062) * math.sin(a) * sgn
            worn.append(shoe('shoe_e', (0, yy, zz), (a * sgn + (0 if sgn > 0 else math.pi), 0, 0)))

    # sprocket at the rear: a toothed wheel, teeth as an arrayed block
    sp = tube('spr', 0.40, 0.30, MAT_STEEL, None,
              (-0.15, half, WHEEL_R), (0, 90 * DEG, 0), sides=20)
    steel.append(sp)
    for i in range(19):
        a = i * 2 * math.pi / 19
        steel.append(box('sprt', (0.26, 0.10, 0.14), MAT_STEEL, None,
                         (0, half + 0.42 * math.cos(a), WHEEL_R + 0.42 * math.sin(a)),
                         (a, 0, 0)))
    # smooth idler at the front — the one under the leader
    steel.append(tube('idl', 0.40, 0.34, MAT_STEEL, None,
                      (-0.17, -half, WHEEL_R), (0, 90 * DEG, 0), sides=20))
    # 9 bottom rollers, 2 carrier rollers [DSs] counted off the GA
    for i in range(9):
        yy = (i - 4) * (SPROCKET_IDLER - 0.9) / 8.0
        steel.append(tube('rlb', 0.145, 0.34, MAT_STEEL, None,
                          (-0.17, yy, 0.20), (0, 90 * DEG, 0), sides=12))
    for yy in (-1.20, 1.20):
        steel.append(tube('rlc', 0.115, 0.28, MAT_STEEL, None,
                          (-0.14, yy, TRACK_H - 0.18), (0, 90 * DEG, 0), sides=12))
    # final drive housing on the sprocket end
    dark.append(tube('fd', 0.30, 0.22, MAT_CAST, None,
                     (side * 0.16, half, WHEEL_R), (0, side * 90 * DEG, 0), sides=16))

    g_dark = merge('track_frame', dark, parent)
    g_worn = merge('track_belt', worn, parent)
    g_steel = merge('track_gear', steel, parent)
    return g_dark, g_worn, g_steel


def build_leader_girder(name, length, w, d, z0, holes=True, mat=MAT_DARK):
    """One leader section: a welded BOX / plate girder — NOT a lattice — with a
    continuous row of large round lightening holes down the side plate for its
    entire length [REF s4.3]. Hole pitch ~1/45 of the leader height, hole
    diameter ~0.41 x the pitch, both pixel-scanned off the GA elevation."""
    g = box(name, (w, d, length), mat, None, (0, 0, z0 + length / 2), bevel=0.025)
    if holes:
        cs = []
        z = z0 + HOLE_PITCH * 0.75
        while z < z0 + length - HOLE_PITCH * 0.75:
            cs.append((0, 0, z))
            z += HOLE_PITCH
        if cs:
            punch(g, cs, HOLE_D / 2.0, depth=w * 3.0, sides=14)
    return g


def build_hammer(parent):
    """Hydraulic impact hammer, 9 000 kg ram class.

    [HB] HHK9A: 9 000 kg ram, 106 kNm, 1 200 mm stroke, 40-100 blows/min,
    7 380 mm long and 13 500 kg EXCLUDING cap and sleeve. The X-series SHK9 is
    7 675 mm / 14 800 kg. The game's own table says 17 800 kg, which is ~25 %
    high [REF s9.6]. It is not a block sliding up a mast — at 7.38 m on a
    26.5 m leader it occupies 28 % of the leader height and reads as a machine
    in its own right.
    """
    dark, steel, chrome = [], [], []
    h = HAMMER_L
    # main frame: two side plates with bolted flanges + four corner posts
    for sx in (-1, 1):
        dark.append(box('hp', (0.055, HAMMER_D, h * 0.88), MAT_DARK, None,
                        (sx * HAMMER_W / 2, 0, h * 0.50), bevel=0.012))
    for sx in (-1, 1):
        for sy in (-1, 1):
            dark.append(box('hc', (0.11, 0.11, h * 0.92), MAT_DARK, None,
                            (sx * (HAMMER_W / 2 - 0.05), sy * (HAMMER_D / 2 - 0.05),
                             h * 0.50), bevel=0.012))
    # bolted cross flanges every ~1.2 m — the frame is bolted, not one weldment
    for i in range(6):
        dark.append(box('hf', (HAMMER_W + 0.06, HAMMER_D + 0.06, 0.075), MAT_DARK,
                        None, (0, 0, 0.55 + i * 1.22), bevel=0.012))
    # the rear face is closed; the front is open so the ram shows
    dark.append(box('hb', (HAMMER_W, 0.05, h * 0.88), MAT_DARK, None,
                    (0, HAMMER_D / 2, h * 0.50), bevel=0.012))
    # cylinder housing on top, where the ram is lifted and released
    dark.append(box('hcyl', (HAMMER_W * 0.82, HAMMER_D * 0.82, 1.35), MAT_DARK,
                    None, (0, 0, h - 0.70), bevel=0.03))
    steel.append(tube('hcap', 0.20, 0.28, MAT_CAST, None, (0, 0, h - 0.02), sides=14))
    # rope becket / lifting eye at the very top: the hammer hangs on its winch
    steel.append(box('hbek', (0.16, 0.30, 0.40), MAT_STEEL, None, (0, 0, h + 0.20)))
    # anvil / striker plate at the bottom
    steel.append(box('hanv', (HAMMER_W * 0.9, HAMMER_D * 0.9, 0.34), MAT_CAST, None,
                     (0, 0, 0.17), bevel=0.02))
    # GUIDE JAWS: this is a leader-mounted hammer, not a free-hanging one.
    # Everything that rides the leader is CAPTURED by it [REF s4.3].
    for zz in (0.55, 0.55 + JAW_SPACING):
        for sx in (-1, 1):
            steel.append(box('hj', (0.26, 0.44, 0.46), MAT_STEEL, None,
                             (sx * (HAMMER_W / 2 + 0.10), -HAMMER_D / 2 - 0.22, zz),
                             bevel=0.02))
        steel.append(box('hjb', (HAMMER_W + 0.55, 0.20, 0.34), MAT_STEEL, None,
                         (0, -HAMMER_D / 2 - 0.22, zz), bevel=0.02))
    # hydraulic manifold on the side, where the hoses land
    dark.append(box('hman', (0.22, 0.34, 0.60), MAT_DARK, None,
                    (HAMMER_W / 2 + 0.10, 0.10, h * 0.70), bevel=0.02))
    for i in range(4):
        chrome.append(tube('hport', 0.035, 0.14, MAT_CHROME, None,
                           (HAMMER_W / 2 + 0.21, 0.02 + i * 0.055, h * 0.70),
                           (0, 90 * DEG, 0), sides=8))

    body = merge('hammer_body', dark, parent)
    jaws = merge('hammer_jaws', steel, parent)
    ports = merge('hammer_ports', chrome, parent)
    return body, jaws, ports


# ═══════════════════════════════════════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════════════════════════════════════

def build(out_path):
    reset()

    # ══ UNDERCARRIAGE ══════════════════════════════════════════════════════
    # No outriggers under the front. The datasheet lists "rear support legs"
    # as an OPTION only and the GA draws a single vertical jack with a round
    # foot pad at the extreme rear, behind the counterweight [DS][REF s4.1].
    # In normal driving this machine stands on its tracks alone. The game's
    # current builder puts a pair of jacks at the FRONT under the leader,
    # which is wrong [REF s9.4].
    car = []
    car.append(box('carbody', (2.05, 3.30, 0.52), MAT_DARK, None,
                   (0, 0, WHEEL_R + 0.30), bevel=0.04))
    # THE detail that says piling rig and not excavator: the expanding-gauge
    # cross-carriers are heavy dark fabricated boxes standing proud between the
    # upperstructure and the track frames [RTG][REF s4.1]. Model them as real,
    # visible, greasy structure — never hidden.
    for yy in (-1.55, 1.55):
        car.append(box('xcar', (4.55, 0.62, 0.52), MAT_DARK, None,
                       (0, yy, WHEEL_R + 0.06), bevel=0.035))
        car.append(box('xcarR', (5.60, 0.34, 0.26), MAT_STEEL, None,
                       (0, yy, WHEEL_R + 0.06)))
        for sx in (-1, 1):
            car.append(tube('xspr', 0.075, 0.85, MAT_CHROME, None,
                            (sx * 1.10, yy, WHEEL_R + 0.30), (0, sx * 90 * DEG, 0),
                            sides=10))
    # slew ring: a narrow tidy hatched band, not a big turret [DS 1 600 mm]
    car.append(tube('slewring', SLEW_RING_D / 2, 0.16, MAT_WORN, None,
                    (0, 0, DECK_Z - 0.16), sides=32))
    bolt_ring('slewbolts', SLEW_RING_D / 2 - 0.10, 28, MAT_WORN, None,
              (0, 0, DECK_Z - 0.06))
    merge('undercarriage', car)

    for sgn, nm in ((-1, 'track-left'), (1, 'track-right')):
        # rest position is the WORKING gauge — the squat, nearly-square working
        # stance is the silhouette [DS 4 880 mm]. Retracts 750 mm per side to
        # the 3 380 mm travelling gauge.
        n = empty(NODE_SLIDE, nm, None, (sgn * GAUGE_WIDE / 2, 0, 0))
        n['travel_m'] = -(GAUGE_WIDE - GAUGE_NARROW) / 2.0
        n['axis'] = 'x'
        build_track(sgn, n)

    # ══ UPPERSTRUCTURE ═════════════════════════════════════════════════════
    slew = empty(NODE_PIVOT, 'slew', None, (0, 0, DECK_Z))
    slew['axis'] = 'z'

    paint, dark, worn, steel, glass, haz, rub = [], [], [], [], [], [], []

    dark.append(box('deck', (3.20, 7.60, 0.07), MAT_DARK, None, (0, 1.10, 0)))
    # engine house: low, long, slab-sided. 420 l fuel, 670 l oil and TWO T8
    # coolers [DS] — there is a lot of radiator area, so the house needs real
    # grille panels, not a painted rectangle [REF s4.2].
    hy = 1.85
    paint.append(box('house', (HOUSE_W, HOUSE_L, HOUSE_H), MAT_PAINT, None,
                     (0, hy, HOUSE_H / 2), bevel=0.045))
    for sx in (-1, 1):
        for i in range(9):
            dark.append(box('grille', (0.05, 1.30, 0.075), MAT_DARK, None,
                            (sx * (HOUSE_W / 2 + 0.012), hy + 0.55,
                             0.36 + i * 0.115), (0.42 * sx, 0, 0)))
        # bolted access covers with a visible seam line
        for i in range(2):
            dark.append(box('acc', (0.03, 0.90, 0.70), MAT_DARK, None,
                            (sx * (HOUSE_W / 2 + 0.014), hy - 0.90, 0.75)))
    worn.append(tube('stack', 0.085, 0.85, MAT_WORN, None, (0.95, 2.90, HOUSE_H),
                     sides=12))
    worn.append(tube('stackcap', 0.12, 0.06, MAT_WORN, None,
                     (0.95, 2.90, HOUSE_H + 0.85), sides=12))

    # cab: a tall narrow glasshouse, full-height front screen, offset to one
    # side of the pile axis because the operator has to look STRAIGHT UP the
    # leader [RTG][REF s4.2]. Which side is NOT sourced — no plan view of this
    # class exists in any local document [REF s8]; left is a choice, not a fact.
    cx, cy = -0.92, -1.45
    dark.append(box('cabped', (CAB_W + 0.10, CAB_L + 0.10, 0.34), MAT_DARK, None,
                    (cx, cy, 0.17), bevel=0.03))
    paint.append(box('cabshell', (CAB_W, CAB_L, CAB_H), MAT_PAINT, None,
                     (cx, cy, 0.34 + CAB_H / 2), bevel=0.05))
    glass.append(box('cabfront', (CAB_W - 0.10, 0.04, CAB_H - 0.30), MAT_GLASS,
                     None, (cx, cy - CAB_L / 2 - 0.01, 0.34 + CAB_H / 2 - 0.04)))
    glass.append(box('cabroof', (CAB_W - 0.24, 0.80, 0.04), MAT_GLASS, None,
                     (cx, cy - 0.42, 0.34 + CAB_H - 0.02)))
    for sx in (-1, 1):
        glass.append(box('cabside', (0.04, CAB_L - 0.34, CAB_H - 0.62), MAT_GLASS,
                         None, (cx + sx * (CAB_W / 2 + 0.01), cy, 0.34 + CAB_H / 2)))
    # tubular FOPS guard cage standing OFF the front glass [RTG]
    for i in range(5):
        zz = 0.55 + i * 0.36
        steel.append(tube('fops', 0.026, CAB_W + 0.06, MAT_STEEL, None,
                          (cx - (CAB_W + 0.06) / 2, cy - CAB_L / 2 - 0.20, zz),
                          (0, 90 * DEG, 0), sides=6))
    for sx in (-1, 1):
        steel.append(tube('fopsv', 0.030, 1.70, MAT_STEEL, None,
                          (cx + sx * (CAB_W / 2 + 0.02), cy - CAB_L / 2 - 0.20, 0.50),
                          sides=6))
    haz.append(box('cabstep', (CAB_W, 0.34, 0.05), MAT_HAZARD, None,
                   (cx, cy - CAB_L / 2 - 0.16, 0.12)))

    # walkway, plain tubular handrail, beacon on a stalk, two whip aerials
    # [GB22 p.4 marine photo][RTG]
    dark.append(box('walk', (3.10, 1.20, 0.05), MAT_DARK, None, (0, 4.05, 0.04)))
    rail_pts = [(-1.50, 3.45), (-1.50, 4.65), (1.50, 4.65), (1.50, 3.45)]
    for i in range(len(rail_pts) - 1):
        a, b = rail_pts[i], rail_pts[i + 1]
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        for zz in (0.55, 1.05):
            steel.append(tube('hr', 0.024, L, MAT_STEEL, None, (a[0], a[1], zz),
                              (0, 90 * DEG, ang), sides=6))
    for (px, py) in rail_pts:
        steel.append(tube('hrp', 0.026, 1.05, MAT_STEEL, None, (px, py, 0.05), sides=6))
    steel.append(tube('beaconst', 0.020, 0.34, MAT_STEEL, None, (-1.20, 3.30, HOUSE_H)))
    haz.append(tube('beacon', 0.085, 0.16, MAT_HAZARD, None,
                    (-1.20, 3.30, HOUSE_H + 0.34), sides=12))
    for px in (-1.30, 1.30):
        steel.append(tube('aerial', 0.010, 1.60, MAT_STEEL, None, (px, 3.15, HOUSE_H),
                          sides=4))
    # boarding ladder up the side of the deck
    for i in range(4):
        haz.append(box('lrung', (0.42, 0.04, 0.03), MAT_HAZARD, None,
                       (1.72, 2.40, -0.20 - i * 0.26)))
    for sx in (-1, 1):
        steel.append(tube('lstr', 0.020, 1.25, MAT_STEEL, None,
                          (1.72 + sx * 0.21, 2.40, -1.10), sides=6))

    # ── the movable counterweight ──────────────────────────────────────────
    # A FLAT SLAB at the very rear, roughly flush with the house sides — not a
    # bulbous crane block and not a stack of removable plates [DS][REF s4.2,
    # s9.9]. 6 000 kg + 2 000 kg extendable. It slides 1 500 mm aft.
    cwn = empty(NODE_SLIDE, 'counterweight', slew, (0, REAR_Y - 0.75, 0.05))
    cwn['travel_m'] = LEADER_SHIFT
    cwn['axis'] = 'y'
    cwl = [box('cwslab', (HOUSE_W + 0.06, 1.45, 1.55), MAT_DARK, None,
               (0, 0, 0.80), bevel=0.05)]
    for i in range(3):
        cwl.append(box('cwrib', (HOUSE_W + 0.12, 0.05, 0.06), MAT_WORN, None,
                       (0, 0, 0.42 + i * 0.42)))
    for sx in (-1, 1):
        cwl.append(box('cwchamf', (0.18, 1.50, 0.18), MAT_HAZARD, None,
                       (sx * (HOUSE_W / 2 + 0.02), 0, 1.52)))
    # the single OPTIONAL rear support leg the GA actually draws
    cwl.append(tube('rslbar', 0.13, 0.75, MAT_DARK, None, (0, 0.60, 0.05)))
    cwl.append(tube('rslrod', 0.085, 0.55, MAT_CHROME, None, (0, 0.60, -0.50)))
    cwl.append(tube('rslpad', 0.26, 0.07, MAT_WORN, None, (0, 0.60, -0.57), sides=16))
    merge('counterweight', cwl, cwn)

    # ── THREE winches, not two ─────────────────────────────────────────────
    # [DS] pile 10 000 kg, hammer 15 000 kg, auxiliary 5 000 kg. [GB22] gives
    # the hammer winch as 16 500 kg for the same machine — the two sources
    # disagree and neither is picked here [REF s4.4, s9.8]. The auxiliary is
    # how the NEXT pile gets pitched, visible on [PB13] as a separate line to a
    # standing pile, and the game's builder does not have it [REF s9.7].
    wspec = [('winch-pile', -0.86, 0.35, 0.30, 0.58),
             ('winch-hammer', 0.86, 0.35, 0.345, 0.66),
             ('winch-aux', 0.0, 1.45, 0.235, 0.44)]
    for nm, wx, wy, wr, ww in wspec:
        dark.append(box('wfr', (ww + 0.30, 0.16, 0.62), MAT_DARK, None,
                        (wx, wy - 0.34, 0.31), (0, 90 * DEG, 0)))
        pn = empty(NODE_PIVOT, nm, slew, (wx, wy, 0.34 + wr))
        pn['axis'] = 'x'
        dr = [tube('drum', wr, ww, MAT_STEEL, None, (-ww / 2, 0, 0),
                   (0, 90 * DEG, 0), sides=16)]
        for sx in (-1, 1):
            dr.append(tube('flange', wr + 0.075, 0.05, MAT_DARK, None,
                           (sx * ww / 2, 0, 0), (0, 90 * DEG, 0), sides=16))
        # laid rope on the drum — rope dressing, black tar-like grease, gets
        # flung onto the surrounding paint [REF s6]
        for i in range(int(ww / 0.046)):
            dr.append(tube('lay', wr + 0.021, 0.042, MAT_WORN, None,
                           (-ww / 2 + 0.024 + i * 0.046, 0, 0), (0, 90 * DEG, 0),
                           sides=8))
        merge(nm.replace('-', '_'), dr, pn)

    # ── A-FRAME / BACKSTAY ─────────────────────────────────────────────────
    # NOT two thin struts. A DEEP TAPERING FABRICATED PLATE STRUCTURE running
    # from the front of the machine house up to a bracket on the leader, itself
    # pierced with large lightening holes [DS][RTG][REF s4.3]. It is the second
    # strongest silhouette cue after the leader itself, and the game currently
    # builds it as a 0.30 m stick that reaches 3 m [REF s9.3].
    AF_APEX_Z = 9.60      # [DSs] ~45 % of the leader height, off the GA
    AF_APEX_Y = -3.55
    for sx in (-1, 1):
        poly = [(2.55, 0.05), (0.15, 0.05), (AF_APEX_Y + 0.55, AF_APEX_Z - 0.55),
                (AF_APEX_Y - 0.10, AF_APEX_Z), (AF_APEX_Y - 0.10, AF_APEX_Z - 1.35),
                (0.95, 0.05)]
        pl = plate('afplate', poly, 0.055, MAT_DARK, None,
                   (sx * 0.62, 0, 0), bevel=0.02)
        cs = []
        for i in range(7):
            t = 0.14 + i * 0.125
            cs.append((sx * 0.62, 0.55 + t * (AF_APEX_Y + 0.10 - 0.55),
                       0.55 + t * (AF_APEX_Z - 1.10)))
        punch(pl, cs, 0.135, depth=0.4, sides=12)
        dark.append(pl)
    # closing webs that make the two plates a BOX
    for t in (0.10, 0.45, 0.80):
        yy = 1.35 + t * (AF_APEX_Y - 1.35)
        zz = 0.30 + t * (AF_APEX_Z - 0.90)
        dark.append(box('afweb', (1.30, 0.24, 0.06), MAT_DARK, None,
                        (0, yy, zz), (math.atan2(AF_APEX_Z - 0.90, AF_APEX_Y - 1.35)
                                      + 90 * DEG, 0, 0)))
    dark.append(box('afapex', (1.45, 0.42, 0.55), MAT_DARK, None,
                    (0, AF_APEX_Y, AF_APEX_Z - 0.25), bevel=0.03))
    # slender tie rods — the second, thinner line in the [GB22] marine photo,
    # which shows FOUR near-parallel dark members going up
    for sx in (-1, 1):
        L = math.hypot(AF_APEX_Y - 2.20, AF_APEX_Z - 0.55)
        steel.append(tube('tie', 0.045, L, MAT_STEEL, None, (sx * 1.05, 2.20, 0.55),
                          (math.atan2(AF_APEX_Y - 2.20, AF_APEX_Z - 0.55) * -1
                           + 0, 0, 0), sides=8))

    merge('upper_paint', paint, slew)
    merge('upper_dark', dark, slew)
    merge('upper_worn', worn, slew)
    merge('upper_steel', steel, slew)
    merge('upper_glass', glass, slew)
    merge('upper_hazard', haz, slew)
    if rub:
        merge('upper_rubber', rub, slew)

    # ══ THE LEADER ═════════════════════════════════════════════════════════
    # spotting slide: the whole leader slides 1 500 mm fore/aft on the front of
    # the carrier so the machine can spot the next pile without tracking [DS].
    spot = empty(NODE_SLIDE, 'leader-spot', slew, (0, PILE_AXIS_Y, -DECK_Z))
    spot['travel_m'] = LEADER_SHIFT
    spot['axis'] = 'y'
    rake = empty(NODE_PIVOT, 'leader-rake', spot, (0, 0, 0))       # fore/aft
    rake['axis'] = 'x'
    rakes = empty(NODE_PIVOT, 'leader-rake-side', rake, (0, 0, 0))  # sideways
    rakes['axis'] = 'y'
    # Rake is fore/aft AND sideways, on separate capacity tables, with an
    # electronic inclinometer standard [DS]. Raked piles are normal work and
    # the mast is often NOT vertical [REF s5].

    ld, lst, lhz = [], [], []
    ld.append(build_leader_girder('leader_low', TELE_BREAK, LEADER_W, LEADER_D, 0.0))
    # guide rails on the FRONT face: the hammer and the pile carriage run on
    # these and are captured by them; nothing swings free [REF s4.3]. They get a
    # bright polished stripe exactly where the jaws run and rust above and below.
    for sx in (-1, 1):
        lst.append(box('railL', (0.13, 0.16, TELE_BREAK - 0.30), MAT_STEEL, None,
                       (sx * 0.30, -LEADER_D / 2 - 0.06, TELE_BREAK / 2), bevel=0.015))
    # splice flanges where the sections bolt
    for zz in (FOOT_BREAK, TELE_BREAK - 0.20):
        ld.append(box('lspl', (LEADER_W + 0.09, LEADER_D + 0.09, 0.11), MAT_DARK,
                      None, (0, 0, zz), bevel=0.015))
    # the LEADER FOOT reaches down PAST the track line to the ground at the
    # pile, and pushes down to bear or lifts to clear: 1 000 up / 500 down [DS].
    foot = empty(NODE_SLIDE, 'leader-foot', rakes, (0, 0, 0))
    foot['travel_up_m'] = FOOT_UP
    foot['travel_down_m'] = -FOOT_DOWN
    foot['axis'] = 'z'
    ftl = [box('footbox', (LEADER_W + 0.30, LEADER_D + 0.24, 0.95), MAT_DARK, None,
               (0, 0, 0.48), bevel=0.04)]
    ftl.append(box('footpad', (1.45, 1.30, 0.14), MAT_WORN, None, (0, 0, 0.05)))
    for sx in (-1, 1):
        ftl.append(box('footgate', (0.20, 0.55, 0.70), MAT_STEEL, None,
                       (sx * 0.52, -LEADER_D / 2 - 0.25, 0.75), bevel=0.02))
    # the bottom 1.5 m of the leader is the dirtiest single place on the
    # machine — everything the pile brings up is thrown at it [REF s6]. Hazard
    # striping on the foot is where the chip and scrape damage lives.
    ftl.append(box('foothz', (LEADER_W + 0.34, 0.06, 0.26), MAT_HAZARD, None,
                   (0, -LEADER_D / 2 - 0.14, 1.05)))
    merge('leader_foot', ftl, foot)

    # telescope: 4 000 mm of stroke. Transport height comes down, working
    # height goes up [DS]. The upper section nests inside the lower.
    tele = empty(NODE_SLIDE, 'leader-tele', rakes, (0, 0, 0))
    tele['travel_m'] = -TELE_STROKE
    tele['axis'] = 'z'
    up_len = LEADER_TOP - (TELE_BREAK - 1.30)
    tu, tus, tuc = [], [], []
    tu.append(build_leader_girder('leader_up', up_len - 0.90, UP_W, UP_D,
                                  TELE_BREAK - 1.30))
    for sx in (-1, 1):
        tus.append(box('railU', (0.13, 0.16, up_len - 1.30), MAT_STEEL, None,
                       (sx * 0.30, -UP_D / 2 - 0.06,
                        TELE_BREAK - 1.30 + (up_len - 0.90) / 2), bevel=0.015))
    tu.append(box('lsplU', (UP_W + 0.09, UP_D + 0.09, 0.11), MAT_DARK, None,
                  (0, 0, UPPER_BREAK), bevel=0.015))
    # cathead: the 900 mm block at the very top carrying the sheaves for the
    # hammer line and the pile line [DS chain 900/1800/6000/13800; a SIDE
    # cathead is a listed option]. Sheave count and arrangement are NOT
    # sourced — both drawings render the top few metres too small [REF s8].
    tuc.append(box('cathead', (UP_W + 0.34, UP_D + 0.40, 0.90), MAT_CAST, None,
                   (0, -0.10, HEAD_BOT + 0.45), bevel=0.04))
    tuc.append(box('catnose', (UP_W + 0.20, 0.60, 0.45), MAT_CAST, None,
                   (0, -UP_D / 2 - 0.42, HEAD_BOT + 0.30), bevel=0.04))
    merge('leader_upper', tu, tele)
    merge('leader_upper_rails', tus, tele)
    merge('cathead', tuc, tele)
    for nm, sx, sr in (('sheave-hammer', -0.24, 0.34), ('sheave-pile', 0.24, 0.34),
                       ('sheave-aux', 0.0, 0.24)):
        sy = -UP_D / 2 - (0.42 if nm == 'sheave-aux' else 0.24)
        pn = empty(NODE_PIVOT, nm, tele, (sx, sy, HEAD_BOT + 0.45))
        pn['axis'] = 'x'
        sh = [tube('sv', sr, 0.10, MAT_CAST, None, (-0.05, 0, 0), (0, 90 * DEG, 0),
                   sides=20),
              tube('svh', sr * 0.35, 0.14, MAT_STEEL, None, (-0.07, 0, 0),
                   (0, 90 * DEG, 0), sides=10)]
        merge(nm.replace('-', '_'), sh, pn)

    merge('leader_lower', ld, rakes)
    merge('leader_rails', lst, rakes)
    if lhz:
        merge('leader_hazard', lhz, rakes)

    # rake / erection cylinders: one heavy cylinder per side with a bright
    # chrome rod, INSIDE the A-frame triangle [DS][REF s4.3]. Bore and rod
    # diameters are NOT sourced anywhere [REF s8] — proportioned off the GA.
    for sx in (-1, 1):
        ry, rz = 2.05 - PILE_AXIS_Y, DECK_Z + 0.45
        ang = math.atan2(ry, 6.40 - rz)
        rl = math.hypot(ry, 6.40 - rz)
        cyl = empty(NODE_SLIDE, 'rake-cyl-%s' % ('l' if sx < 0 else 'r'), rakes,
                    (sx * 0.78, 0, 0))
        cyl['travel_m'] = 1.40
        cyl['axis'] = 'z'
        rc = [tube('rcbar', 0.165, rl * 0.58, MAT_DARK, None,
                   (0, ry, rz), (ang, 0, 0), sides=14),
              tube('rcrod', 0.105, rl * 0.55, MAT_CHROME, None,
                   (0, ry - math.sin(ang) * rl * 0.50,
                    rz + math.cos(ang) * rl * 0.50), (ang, 0, 0), sides=12),
              tube('rceye', 0.13, 0.26, MAT_STEEL, None,
                   (-0.13, ry, rz), (0, 90 * DEG, 0), sides=12)]
        merge('rake_cyl_%s' % ('l' if sx < 0 else 'r'), rc, cyl)

    # ══ HAMMER CARRIAGE ════════════════════════════════════════════════════
    ham = empty(NODE_SLIDE, 'hammer-carriage', rakes, (0, -LEADER_D / 2 - 0.62,
                                                       HAMMER_BOT))
    ham['travel_lo_m'] = 1.35 - HAMMER_BOT
    ham['travel_hi_m'] = (LEADER_TOP - 3.0) - HAMMER_L - HAMMER_BOT
    ham['axis'] = 'z'
    build_hammer(ham)
    # the ram: 1 200 mm of visible travel inside the frame, 40-100 blows/min
    # (Classic) or 50-140+ (X-series) [HB]. This is the animation amplitude.
    ramn = empty(NODE_SLIDE, 'hammer-ram', ham, (0, 0, 1.05))
    ramn['stroke_m'] = RAM_STROKE
    ramn['axis'] = 'z'
    rml = [box('ram', (HAMMER_W - 0.30, HAMMER_D - 0.28, 2.10), MAT_STEEL, None,
               (0, 0, 1.05), bevel=0.03),
           tube('ramrod', 0.115, 1.60, MAT_CHROME, None, (0, 0, 2.10), sides=12)]
    merge('hammer_ram', rml, ramn)

    # DRIVE CAP / HELMET. 550 x 550 mm face for a 7-9 t ram [HB] on a 350 mm
    # pile: it VISIBLY OVERHANGS the pile head, and the helmet must NOT fit
    # tightly so the pile can rotate if it strikes an obstruction [REF s4.5,
    # s9.10]. That loose, grubby, oversize joint — splintered dolly timber,
    # shredded packing, burred steel — is where the wear story lives.
    cap = empty(NODE_SLIDE, 'drive-cap', ham, (0, 0, -0.44))
    cap['axis'] = 'z'
    cpl = [box('helmet', (DRIVE_CAP, DRIVE_CAP, 0.30), MAT_CAST, None,
               (0, 0, 0.15), bevel=0.025),
           box('helmskirt', (DRIVE_CAP + 0.06, DRIVE_CAP + 0.06, 0.14), MAT_CAST,
               None, (0, 0, -0.04), bevel=0.02),
           box('dolly', (DRIVE_CAP - 0.10, DRIVE_CAP - 0.10, 0.16), MAT_WORN, None,
               (0, 0, 0.36), bevel=0.012)]
    for i in range(5):     # shredded packing hanging out of the joint
        a = i * 1.13
        cpl.append(box('packing', (0.07, 0.05, 0.13), MAT_RUBBER, None,
                       (math.cos(a) * 0.27, math.sin(a) * 0.27, -0.06),
                       (0.3 * math.sin(a), 0.25, a)))
    merge('drive_cap', cpl, cap)

    # ══ THE PILE ═══════════════════════════════════════════════════════════
    # Precast concrete, 350 mm square, light warm grey, matte, SHARP CHAMFERED
    # ARRISES, cast-in lifting points, plain cast face [REF s6]. It hangs in
    # the same leader guides as the hammer and stays in the ground when the
    # hammer lifts, so it is its own node.
    pile = empty(NODE_SLIDE, 'pile', rakes, (0, -LEADER_D / 2 - 0.62, PILE_TOP))
    pile['axis'] = 'z'
    pl = [box('pile', (PILE_SIDE, PILE_SIDE, PILE_LEN), MAT_WORN, None,
              (0, 0, -PILE_LEN / 2), bevel=0.018)]
    pl.append(box('piletip', (PILE_SIDE * 0.55, PILE_SIDE * 0.55, 0.42), MAT_WORN,
                  None, (0, 0, -PILE_LEN - 0.18), bevel=0.05))
    for i in range(2):
        pl.append(tube('piftlift', 0.022, 0.16, MAT_STEEL, None,
                       (0, PILE_SIDE / 2, -1.2 - i * 5.0), (-90 * DEG, 0, 0), sides=6))
    merge('pile', pl, pile)
    # the pile gate / clamp arm that projects sideways from the leader on the
    # GA — its shape and travel are UNRESOLVED [REF s8]. Modelled as a plain
    # two-jaw gate at the guide line; do not treat this shape as sourced.
    gate = empty(NODE_PIVOT, 'pile-gate', rakes, (0, -LEADER_D / 2 - 0.10, 2.60))
    gate['axis'] = 'z'
    gl = [box('gatearm', (0.16, 0.90, 0.24), MAT_STEEL, None, (0, -0.45, 0),
              bevel=0.02)]
    for sx in (-1, 1):
        gl.append(box('gatejaw', (0.12, 0.30, 0.30), MAT_STEEL, None,
                      (sx * 0.28, -0.78, 0), bevel=0.02))
    merge('pile_gate', gl, gate)

    # ══ ROPES ══════════════════════════════════════════════════════════════
    # Two ropes run up the leader and over the head — one to the hammer, one to
    # the pile — and when the hammer is high and a pile is being pitched BOTH
    # are loaded, at different angles, and both are visible against the sky
    # [REF s4.4]. Curves, not cylinders, so they hang.
    ropes = []
    ropes.append(hose('rope_hammer',
                      [(-0.24, -UP_D / 2 - 0.60, HEAD_BOT + 0.45),
                       (-0.24, -LEADER_D / 2 - 0.66, HEAD_BOT - 3.0),
                       (-0.20, -LEADER_D / 2 - 0.64, HAMMER_BOT + HAMMER_L + 0.35)],
                      radius=0.021, mat=MAT_WORN, parent=rakes, sides=6))
    ropes.append(hose('rope_pile',
                      [(0.24, -UP_D / 2 - 0.60, HEAD_BOT + 0.45),
                       (0.26, -LEADER_D / 2 - 1.00, HEAD_BOT - 5.0),
                       (0.24, -LEADER_D / 2 - 0.70, PILE_TOP + 0.10)],
                      radius=0.018, mat=MAT_WORN, parent=rakes, sides=6))
    # the auxiliary line, hanging free with its hook — this is how the NEXT
    # pile gets pitched [PB13 shows exactly this]
    ropes.append(hose('rope_aux',
                      [(0.0, -UP_D / 2 - 0.90, HEAD_BOT + 0.45),
                       (0.02, -UP_D / 2 - 1.45, HEAD_BOT - 6.0),
                       (0.03, -UP_D / 2 - 1.30, 3.40)],
                      radius=0.014, mat=MAT_WORN, parent=rakes, sides=6))
    ropes = [to_mesh(r) for r in ropes]
    ropes.append(box('auxhook', (0.10, 0.14, 0.46), MAT_STEEL, None,
                     (0.03, -UP_D / 2 - 1.30, 3.10), bevel=0.02))
    merge('leader_ropes', ropes, rakes)

    # ══ HOSES ══════════════════════════════════════════════════════════════
    # Hose routing on this machine is EXTERNAL, VISIBLE and slightly untidy.
    # The bundle is strapped down the side of the leader with a service loop
    # [GB22 p.4 close-up], and a loose hose/cable loop hangs free at mid-leader
    # [RTG]. The game's hoses currently stop at y=3.6 near the leader foot; on
    # the real machine they run all the way up to the hammer and hang in a long
    # free catenary that changes shape as the hammer travels [REF s9.5].
    hz = []
    for i in range(4):
        ox = 0.30 + i * 0.055
        hz.append(hose('hose_up%d' % i,
                       [(LEADER_W / 2 + 0.05, LEADER_D / 2 + 0.12, 0.90),
                        (LEADER_W / 2 + ox, LEADER_D / 2 + 0.10, 4.5),
                        (LEADER_W / 2 + ox, LEADER_D / 2 + 0.10, 9.0),
                        (LEADER_W / 2 + ox, LEADER_D / 2 + 0.08, 12.4)],
                       radius=0.036, parent=rakes, sides=6))
    # the big free catenary loop from the leader run across to the hammer
    for i in range(2):
        hz.append(hose('hose_loop%d' % i,
                       [(LEADER_W / 2 + 0.32 + i * 0.06, LEADER_D / 2 + 0.10, 12.4),
                        (LEADER_W / 2 + 0.55, LEADER_D / 2 + 0.55, 10.6 - i * 0.25),
                        (HAMMER_W / 2 + 0.30, 0.30, 12.9),
                        (HAMMER_W / 2 + 0.20, 0.10, HAMMER_BOT + HAMMER_L * 0.70)],
                       radius=0.034, parent=rakes, sides=6))
    # P-clips and abrasion sleeves at the rub points [REF s6]
    for zz in (2.2, 5.0, 7.8, 10.6):
        hz.append(box('pclip', (0.30, 0.16, 0.07), MAT_RUBBER, None,
                      (LEADER_W / 2 + 0.36, LEADER_D / 2 + 0.10, zz)))
    hz = [to_mesh(h) if h.type == 'CURVE' else h for h in hz]
    merge('leader_hoses', hz, rakes)

    # ══ WORK LIGHTS ════════════════════════════════════════════════════════
    # env.js reads mount:/aim: world positions EVERY FRAME to re-aim spotlights,
    # which is why a lamp on a moving member sweeps as the machine works. Two
    # of these sit on the leader, so they rake and telescope with it.
    worklight('cab-l', slew, (cx - 0.62, cy - CAB_L / 2 - 0.10, 0.34 + CAB_H + 0.06),
              (-0.25, -1.0, -0.35), cone_deg=58, range_m=30)
    worklight('cab-r', slew, (cx + 0.62, cy - CAB_L / 2 - 0.10, 0.34 + CAB_H + 0.06),
              (0.25, -1.0, -0.35), cone_deg=58, range_m=30)
    worklight('house', slew, (0, hy + HOUSE_L / 2 + 0.05, HOUSE_H - 0.10),
              (0, 1.0, -0.5), cone_deg=64, range_m=18)
    worklight('leader-mid', rakes, (LEADER_W / 2 + 0.16, -LEADER_D / 2 - 0.18, 8.60),
              (0.15, -0.35, -1.0), cone_deg=46, range_m=26)
    worklight('leader-foot', rakes, (-LEADER_W / 2 - 0.16, -LEADER_D / 2 - 0.18, 2.40),
              (-0.15, -0.55, -1.0), cone_deg=52, range_m=14)
    for nm, pnt, loc in (('cab-l', slew, (cx - 0.62, cy - CAB_L / 2 - 0.10,
                                          0.34 + CAB_H + 0.06)),
                         ('cab-r', slew, (cx + 0.62, cy - CAB_L / 2 - 0.10,
                                          0.34 + CAB_H + 0.06)),
                         ('house', slew, (0, hy + HOUSE_L / 2 + 0.05, HOUSE_H - 0.10)),
                         ('leader-mid', rakes, (LEADER_W / 2 + 0.16,
                                                -LEADER_D / 2 - 0.18, 8.60)),
                         ('leader-foot', rakes, (-LEADER_W / 2 - 0.16,
                                                 -LEADER_D / 2 - 0.18, 2.40))):
        h = [box('lh', (0.26, 0.16, 0.22), MAT_DARK, None, loc, bevel=0.02)]
        merge('lamp_' + nm.replace('-', '_'), h, pnt)

    # ── mounts the game may want for decals and hose ends ──────────────────
    empty(NODE_MOUNT, 'plate', slew, (1.46, 1.85, 0.95), (0, 90 * DEG, 0))
    empty(NODE_MOUNT, 'marque', slew, (0, REAR_Y - 0.02, 0.90))
    empty(NODE_MOUNT, 'operator', slew, (cx, cy, 0.34 + 1.20))

    # apply everything still carrying a modifier so finish()'s join cannot
    # silently discard it (join keeps only the ACTIVE object's modifier stack)
    for o in list(bpy.context.scene.objects):
        if o.type == 'MESH' and o.modifiers:
            _apply_mods(o)
    bpy.ops.object.select_all(action='DESELECT')

    return finish(out_path)


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(os.path.dirname(__file__), '..',
                                       'public', 'models', 'piling_leader.glb')))
