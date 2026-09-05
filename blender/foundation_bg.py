"""
foundation_bg — large rotary-Kelly bored piling rig.

In-game marque: **Torvald KR-46 Kellyline**.  No real manufacturer name or model
designation appears in any object name, material name or exported string
(DOMAIN.md §10).  Provenance lives here, in comments, where it belongs.

WHAT THIS MACHINE IS
--------------------
A ~112–131 t crawler-mounted hydraulic rotary drilling rig for large-diameter
bored (replacement) piles.  Full-slewing uppercarriage, counterweight stack at
the tail, a vertical leader carried on parallel kinematics off a tall front
A-frame, a rotary drive riding a crowd sledge on the leader rails, and hanging
through that drive the machine's signature organ: a four-part telescopic Kelly
bar of concentric ROUND high-tensile tubes with six welded drive keys each.

PRIMARY SOURCE  (read in full, text-extracted from the PDF this session)
------------------------------------------------------------------------
  [S1]  Manufacturer product brochure for the 385 kNm rotary drilling rig on the
        95-class base carrier, doc no. 905.868.2, dated 12/2020, 24 pp.
        Retrieved 2026-09-05 from
        https://www.ecanet.com/uploads/files/Resources/BG_36_H_BS_95_Rotary_Drilling_Rig_EN_905_868_2.pdf
        Pages used: p.6 (highlights), p.10 "Dimensions – Basic Version"
        general-arrangement drawing, p.11 "Technical Specifications",
        p.16 "Application – Kelly Drilling" GA + Kelly tables,
        p.22–23 "Transport – Dimensions and Weights".
  [S2]  research/rigs/foundation-bg.md  (the owner's OEM-catalogue digest:
        Kelly-bar construction, drive-key count, hose-package routing, tool
        sizes, the "NOT SOURCED" list).
  [S3]  Manufacturer Kelly-bar catalogue 905.518.1_2 as transcribed in [S2] §4.1
        (Kelly pot / drive key / outer-intermediate-inner element / locking
        device / shock spring / 200 mm square drive stub; "6 drive keys on each
        section"; "2–5 telescopic TUBULAR sections").
  [S4]  Manufacturer hydraulic-hose brochure 905.213.1+2 as transcribed in
        [S2] §4.7 — six main working lines, deflection point → bulkhead plate on
        the rotary drive, electric cable inside the bundle, flat tarpaulin bag.

THE GA DIMENSION CHAIN, AND HOW IT WAS DECODED  [S1 p.10 and p.16]
------------------------------------------------------------------
The drawing carries a bare chain of numbers.  Two independent configurations are
printed side by side on p.16 and they cross-check each other exactly:

    basic version  : overall 25 600 · 19 640 · stroke 10 000 · 13 630 · 3 630
                     · 1 170 · drill axis 1 100 · reach 4 040–5 540 · R 4 640
                     · mast extension 1.5 m · crawlers 5 680
    upgraded       : overall 27 100 · 19 640 · stroke 10 000 · 13 630 · 3 630
                     · 1 170 · drill axis 1 400 · reach 4 340–5 840 · R 4 640
                     · mast extension 3 m   · crawlers 6 090

  * 19 640 is constant across every application page (Kelly, CFA, SPEX, cased)
    while "Stroke" changes → 19 640 is the LEADER LENGTH, not a stroke.
  * Solve the foot height Zf from both overall heights simultaneously:
        Zf + 19 640 + 1 500 = 25 600   and   Zf + 19 640 + 3 000 = 27 100
    → Zf = 4 460 mm in both.  The leader foot stands 4.46 m off the ground; the
    leader does not reach the deck, it is held out in front on the kinematics.
  * reach − drill-axis offset:  4 040 − 1 100 = 2 940  and  4 340 − 1 400 = 2 940.
    The mast FRONT FACE is at 2 940 mm ahead of the slew centre in both
    configurations, and the reach figure is measured from the slew centre to the
    drill axis.  That is the decode; it is not a guess.
  * 3 630 → 13 630 is the 10 000 mm crowd stroke expressed as the height of the
    rotary drive's lower face above ground (the "H" in T = B + W − H, [S2] §4.1).

This file models the UPGRADED configuration: 3 m mast extension, 1 400 mm drill
axis, upper Kelly guide fitted, 4-part Kelly, 900 mm shoes, operating weight
131 t as published [S1 p.16].  The game's spec row says 118 t / 68 m; see the
handover notes at the foot of this file.

UNITS: metres.  Blender Z-up; the exporter flips to three.js Y-up.
ORIGIN: the slew centre at ground level (rig.py contract).
FORWARD: +Y in Blender is the mast / drill-axis side of the machine, which
exports to −Z in three.js.
"""

import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import bpy                                    # noqa: E402
import bmesh                                  # noqa: E402
from mathutils import Vector, Matrix          # noqa: E402
import rig as R                               # noqa: E402


# ═══════════════════════════════════════════════════════════════════════════
#  DIMENSIONS.  Every line is either [S1]-sourced, or DERIVED with its working.
# ═══════════════════════════════════════════════════════════════════════════

# ── undercarriage ────────────────────────────────────────────────────────────
CRAWLER_LEN   = 6.090   # [S1 p.11] overall length of crawlers, upgraded UW
TRACK_H       = 1.170   # [S1 p.10] height over the crawler
SHOE_W        = 0.900   # [S1 p.11] track shoes 900 mm
FRAME_W       = 1.070   # [S1 p.23] crawler side-frame transport width
WIDTH_EXT     = 4.700   # [S1 p.23] width of crawlers extended, 900 mm shoes
WIDTH_RET     = 3.500   # [S1 p.23] width of crawlers retracted, 900 mm shoes
TRACK_CTR     = (WIDTH_EXT - SHOE_W) / 2      # DERIVED: 1.900 m each side
WHEEL_R       = TRACK_H / 2                   # DERIVED: 0.585 — sprocket/idler
                                              # radius IS half the published
                                              # track height; nothing else can
                                              # make a track 1 170 mm tall.
WHEEL_CTR     = 2.300   # DERIVED: sprocket↔idler centres.  2·2.300 + 2·0.585
                        # = 5.77 m, leaving 160 mm of frame nose at each end of
                        # the published 6.090 m frame.
SHOE_PITCH    = 0.240   # NOT SOURCED.  Derived from shoe proportion on a B7-
                        # class 900 mm shoe (roughly 3.75 : 1 width : pitch).
TAIL_R        = 4.640   # [S1 p.10] R 4 640, tail swing radius

# ── uppercarriage ────────────────────────────────────────────────────────────
SLEW_R        = 1.300   # NOT SOURCED.  Derived: a 131 t rig with a 27 m leader
                        # needs a slew bearing ≈ 2.6 m across; below that the
                        # overturning moment has nowhere to go.
DECK_Z        = 2.550   # NOT SOURCED.  Derived: track top 1.170 + car-body box
                        # 0.60 + slew bearing 0.30 + turntable frame 0.48.
HOUSE_TOP_Z   = 4.300   # DERIVED to sit under the 3 600 mm transport height
                        # [S1 p.22] once the deck is stripped for transport.
CW_FACE_Y     = -TAIL_R                       # [S1 p.10] the tail radius IS the
                                              # back of the counterweight
CW_W          = 2.900   # DERIVED from the 3 000 mm counterweight transport
CW_H          = 1.720   # width [S1 p.23] less lashing clearance; 1 720 is the
CW_D          = 0.950   # printed slab dimension on the same page.
CW_MASS_T     = 14.9    # [S1 p.23] 1 × 4.9 t + 4 × 2.5 t — a stack of five
                        # plates, bolted on, removed for every move.

# ── leader (mast) ────────────────────────────────────────────────────────────
MAST_FOOT_Z   = 4.460   # DERIVED, see the decode above.  Solved twice.
MAST_LEN      = 19.640  # [S1 p.10/p.16] constant across all applications
MAST_TOP_Z    = MAST_FOOT_Z + MAST_LEN        # 24.100
EXT_LEN       = 3.000   # [S1 p.16] 3 m mast extension, upgraded version
OVERALL_H     = 27.100  # [S1 p.16] max height, upgraded version
MAST_FACE_Y   = 2.940   # DERIVED and cross-checked, see the decode above
AXIS_OFFSET   = 1.400   # [S1 p.6/p.16] masthead for drill-axis distance 1 400
DRILL_AXIS_Y  = MAST_FACE_Y + AXIS_OFFSET     # 4.340 — matches the printed
                                              # 4 340 reach exactly
MAST_W        = 1.200   # NOT SOURCED.  Derived from the ratio in [S2] §3: the
MAST_D        = 1.050   # 470 mm Kelly is "close to half the width of the mast
                        # beside it" → mast ≈ 1.0–1.2 m.  Taken at the top of
                        # that band because this is the 385 kNm machine.
MAST_BACK_Y   = MAST_FACE_Y - MAST_D          # 1.890
RAIL_X        = 0.500   # DERIVED: sledge rails inboard of the 1.20 m mast face
SLEDGE_LO_Z   = 3.630   # [S1 p.10] bottom of the crowd stroke (drive underside)
SLEDGE_HI_Z   = 13.630  # [S1 p.10] top of the crowd stroke
CROWD_STROKE  = SLEDGE_HI_Z - SLEDGE_LO_Z     # 10.000 [S1 p.10] "Stroke 10000"
MASTHEAD_H    = 1.150   # DERIVED: the crown block has to live INSIDE the
                        # published 27 100 mm, not on top of it.
GIRDER_LEN    = MAST_LEN + EXT_LEN - MASTHEAD_H           # 21.49 m of girder
GIRDER_TOP_Z  = MAST_FOOT_Z + GIRDER_LEN                  # 25.95
# 4.460 + 19.640 + 3.000 = 27.100 exactly, which is the published max height,
# so nothing may stand proud of it.
assert abs(MAST_FOOT_Z + MAST_LEN + EXT_LEN - OVERALL_H) < 1e-9

# ── rotary drive ─────────────────────────────────────────────────────────────
KDK_H         = 2.630   # [S1 p.23] rotary-drive transport drawing
KDK_W         = 1.490   # [S1 p.23]
KDK_D         = 1.150   # NOT SOURCED.  Derived: the drive must clear the mast
                        # face inside the 1 400 mm drill-axis offset.
KDK_MASS_T    = 7.2     # [S1 p.23] 385 kNm drive, 7.2 t
TORQUE_KNM    = 385     # [S1 p.11] nominal, casing operation, 350 bar
RPM_MAX       = 53      # [S1 p.11] speed of rotation max — the game's 27 rpm
                        # derivation in tools.js is well under the real ceiling

# ── Kelly bar : 4-part, 470 mm outer pipe ────────────────────────────────────
# [S1 p.16] the 4-part table, 48 m depth row: A = 15.3 m retracted,
# B = 49.8 m extended, G = 12 600 kg.  Outer pipe Ø 470 mm from the type code.
KELLY_A       = 15.30   # [S1 p.16] retracted length
KELLY_B       = 49.80   # [S1 p.16] extended length, unlocked
KELLY_MASS_KG = 12600   # [S1 p.16]
KELLY_HEAD_L  = 0.950   # NOT SOURCED as a number.  [S3] calls the long Kelly
KELLY_STUB_A  = 1.140   # head standard, specifically so an upper Kelly guide
                        # can be run; head and stub assembly sized off the 470
                        # tube so that head + tube + stub closes on A exactly.
KELLY_ELEMS   = 4
# DERIVED element length.  A is measured over the whole retracted bar, so
#   A = head + L + stub  →  L = 15.30 − 0.95 − 1.14 = 13.21 m per element, and
#   B = A + (n−1)(L − v) →  L − v = (49.80 − 15.30)/3 = 11.50 m per stage,
#   leaving v = 1.71 m of engaged overlap between elements when fully extended.
# The 1.14 m stub figure is the modelled stack — shock spring, shoulder, then
# the 200 mm square — so the bottom of the exported stub lands on grade at 0.000
# with the drive parked at the bottom of its stroke, which is checkable.
# The overlap is the check: under ~1.5 m it would not carry the torque, over
# ~3 m the arithmetic stops closing on the published A and B.
KELLY_L       = KELLY_A - KELLY_HEAD_L - KELLY_STUB_A     # 13.21 m per element
KELLY_STAGE   = (KELLY_B - KELLY_A) / (KELLY_ELEMS - 1)   # 11.50 m per stage
KELLY_OVERLAP = KELLY_L - KELLY_STAGE                     # 1.90 m engaged
KELLY_D0      = 0.470   # [S1 p.16 type code / S2 §3] outer pipe Ø
STUB_MM       = 0.200   # [S3] 200 mm square drive stub — the SAME on every bar
                        # in the range, BK 110 through BK 500.  The only square
                        # part of the whole bar.
# DERIVED taper.  [S2 §8] forbids guessing a ratio, so this one is solved, not
# guessed: the innermost tube must swallow the 200 mm square stub, whose
# diagonal is 200·√2 = 283 mm.  Fitting 4 elements between Ø470 and Ø283 gives
# (283/470)^(1/3) = 0.845 per step → 470 · 397 · 336 · 284.  The bottom of that
# ladder lands on the stub diagonal to within 1 mm, which is the check.
KELLY_STEP    = (STUB_MM * math.sqrt(2) / KELLY_D0) ** (1.0 / (KELLY_ELEMS - 1))
KELLY_KEYS    = 6       # [S3] "a total of 6 drive keys on each section" — the
                        # current game model builds two, and a driller counts.

# ── winches and ropes ────────────────────────────────────────────────────────
MAIN_ROPE_D   = 0.032   # [S1 p.11] main winch rope Ø 32 mm
CROWD_ROPE_D  = 0.028   # [S1 p.11] crowd winch rope Ø 28 mm
AUX_ROPE_D    = 0.020   # [S1 p.11] auxiliary winch rope Ø 20 mm
SWIVEL_L      = 0.890   # [S2 §3] 40–50 t rope swivel body, 890 × 640 mm
SWIVEL_D      = 0.400   # DERIVED from the 640 mm body width of the same swivel

# ── cab ──────────────────────────────────────────────────────────────────────
CAB_W, CAB_D, CAB_H = 1.250, 1.850, 2.150     # NOT SOURCED ([S2] §8 lists cab
                                              # dimensions as a gap).  Sized off
                                              # a two-post operator cab with a
                                              # roof window, against the deck.


# ═══════════════════════════════════════════════════════════════════════════
#  BUILD PLUMBING
#
#  rig.finish() joins statics by material, but it does not apply modifiers on
#  the objects it absorbs, and it deliberately leaves everything under a pivot:
#  or slide: node alone.  Both of those matter here: this machine is mostly
#  dynamic (slew → mast → sledge → four Kelly stages), and almost every box is
#  bevelled.  So all joining is done HERE — modifiers applied first, one weld
#  per (owning node, material) — and finish() is left with exactly one object
#  per material at scene level, which its len(objs) < 2 test skips.
#
#  Consequence for the budget: draw calls = (number of owning nodes × materials
#  actually used on each), not number of parts.  Detail inside one bin is free.
# ═══════════════════════════════════════════════════════════════════════════

_bins = {}          # (owner_object_or_None, material_name) -> [objects]
_order = []

# ── A MEASURED CORRECTION, NOT A FUDGE ───────────────────────────────────────
# rig.box() does `primitive_cube_add(size=1)` — a cube of EDGE 1, spanning
# −0.5..+0.5 — and then sets `scale = size/2`, so the box it returns is HALF the
# size asked for. Verified in Blender 5.2.1: box((4, 2, 10)) measures
# (2.000, 1.000, 5.000); tube() is unaffected and correct.
#
# That is a bug in a file six machines share, so it is not fixed from here: it
# is MEASURED here, at build time, from a probe box that is then deleted. Every
# dimension in this file is therefore the real dimension in metres, and the day
# rig.box() is corrected centrally, BOX_K measures 1.0 and this model does not
# move by a millimetre. Reported for a central fix; see the notes at the foot.
BOX_K = 1.0


def _measure_box_scale():
    global BOX_K
    o = R.box('__probe__', (4.0, 2.0, 10.0), R.MAT_PAINT)
    d = o.dimensions
    k = (4.0 / d.x, 2.0 / d.y, 10.0 / d.z)
    bpy.data.objects.remove(o, do_unlink=True)
    assert abs(k[0] - k[1]) < 1e-6 and abs(k[0] - k[2]) < 1e-6, k
    BOX_K = k[0]
    print('BOX_K measured = %.3f (1.0 once rig.box() is fixed)' % BOX_K)


def B(obj, owner, mat):
    """File a freshly built object into its weld bin."""
    key = (owner.name if owner is not None else '', mat)
    if key not in _bins:
        _bins[key] = []
        _order.append(key)
    _bins[key].append(obj)
    return obj


def _apply_mods(o):
    if not o.modifiers:
        return
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            o.modifiers.remove(m)


def weld_all():
    """Collapse every bin to one mesh. This is the draw-call budget."""
    for key in _order:
        objs = [o for o in _bins[key] if o.name in bpy.data.objects]
        if not objs:
            continue
        for o in objs:
            if o.type == 'CURVE':
                bpy.ops.object.select_all(action='DESELECT')
                o.select_set(True)
                bpy.context.view_layer.objects.active = o
                bpy.ops.object.convert(target='MESH')
        objs = [o for o in _bins[key] if o.name in bpy.data.objects]
        for o in objs:
            _apply_mods(o)
        owner, mat = key
        # A welded mesh must NOT inherit its owner's prefix: gltfRig.js indexes
        # every node whose name starts with pivot:/slide:/mount: and would file
        # these meshes as game nodes. Strip the prefix; keep the owner's name so
        # the report still says which subassembly a primitive belongs to.
        base = owner.split(':', 1)[1] if ':' in owner else owner
        name = ('%s-%s' % (base, mat)) if owner else ('static:' + mat)
        if len(objs) == 1:
            objs[0].name = name
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        bpy.context.active_object.name = name


def bx(name, size, mat, owner, parent, loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.012,
       seg=2):
    size = (size[0] * BOX_K, size[1] * BOX_K, size[2] * BOX_K)
    o = R.box(name, size, mat, parent, loc, rot, bevel)
    if seg != 2 and 'bev' in o.modifiers:
        o.modifiers['bev'].segments = seg      # one segment is plenty on a part
    return B(o, owner, mat)                    # that appears a hundred times


def tb(name, r, l, mat, owner, parent, loc=(0, 0, 0), rot=(0, 0, 0), sides=12):
    return B(R.tube(name, r, l, mat, parent, loc, rot, sides), owner, mat)


def hs(name, pts, r, mat, owner, parent, taut=False):
    """A draping curve — hose, rope, cable — filed into a weld bin so it does
    not spend a draw call of its own. rig.hose() gives the sag; weld_all()
    converts it to mesh and folds it in with everything else on that material.

    `taut` swaps the AUTO handles for VECTOR ones. A hose sags and AUTO is
    exactly right for it, but a WIRE ROPE under load is straight between
    sheaves, and AUTO handles on a four-point rope overshoot into a bow metres
    wide — measured at 2.4 m in front of the drill axis before this was fixed.
    Ropes are taut; hoses are not."""
    o = R.hose(name, pts, r, mat, parent)
    if taut:
        for bp in o.data.splines[0].bezier_points:
            bp.handle_left_type = bp.handle_right_type = 'VECTOR'
    return B(o, owner, mat)


def strut(name, p0, p1, r, mat, owner, parent, sides=10, square=False):
    """A member running between two points. Links, rams, braces, ladder rails."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    L = d.length
    rot = d.to_track_quat('Z', 'Y').to_euler()
    if square:
        o = R.box(name, (r * 2 * BOX_K, r * 2 * BOX_K, L * BOX_K), mat, parent,
                  (0, 0, 0), (0, 0, 0), r * 0.25)
        o.data.transform(Matrix.Translation((0, 0, L / 2)))
        o.rotation_euler = rot
        o.location = p0
    else:
        o = R.tube(name, r, L, mat, parent, p0, rot, sides)
    return B(o, owner, mat)


def punch(plate, holes, axis='X'):
    """Boolean round lightening holes through a plate. This is what makes the
    leader read as a welded box girder rather than a closed slab — the real
    section is plate pierced with big round holes, not a lattice [S2 §9-C]."""
    cutters = []
    for (loc, r, depth) in holes:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, vertices=20)
        c = bpy.context.active_object
        if axis == 'X':
            c.rotation_euler = (0, math.pi / 2, 0)
        else:
            c.rotation_euler = (math.pi / 2, 0, 0)
        c.location = loc
        cutters.append(c)
    bpy.ops.object.select_all(action='DESELECT')
    for c in cutters:
        c.select_set(True)
    bpy.context.view_layer.objects.active = cutters[0]
    if len(cutters) > 1:
        bpy.ops.object.join()
    cut = bpy.context.active_object
    m = plate.modifiers.new('punch', 'BOOLEAN')
    m.operation = 'DIFFERENCE'
    m.object = cut
    m.solver = 'EXACT'
    bpy.ops.object.select_all(action='DESELECT')
    plate.select_set(True)
    bpy.context.view_layer.objects.active = plate
    bpy.ops.object.modifier_apply(modifier='punch')
    bpy.data.objects.remove(cut, do_unlink=True)
    return plate


# ═══════════════════════════════════════════════════════════════════════════
#  SUBASSEMBLIES
# ═══════════════════════════════════════════════════════════════════════════

def build_undercarriage(root):
    """Two crawler side frames on a telescoping cross-frame.

    The cross-frame is the point: this undercarriage EXTENDS, 3 500 → 4 700 mm
    over 900 mm shoes [S1 p.23], so the beams slide out of the car body and are
    pinned. Modelled extended, with the slide beams and their pin bosses shown.
    """
    own, par = None, None

    # car body / centre frame, with the slew bearing on top
    bx('car-body', (1.65, 3.30, 0.62), R.MAT_DARK, own, par, (0, -0.15, 1.16), bevel=0.04)
    bx('car-body-nose', (1.20, 0.90, 0.46), R.MAT_DARK, own, par, (0, 1.75, 1.10), bevel=0.04)
    tb('slew-race-lower', SLEW_R, 0.16, R.MAT_WORN, own, par, (0, 0, 1.47), sides=32)
    tb('slew-race-upper', SLEW_R * 0.97, 0.16, R.MAT_STEEL, own, par, (0, 0, 1.63), sides=32)
    # jacking pads — the crawler frames come off for transport [S2 §4.5]
    for sx in (-1, 1):
        for sy in (-1, 1):
            bx('jack-pad', (0.34, 0.30, 0.20), R.MAT_WORN, own, par,
               (sx * 0.92, sy * 1.55, 0.98), bevel=0.02)

    for side in (-1, 1):
        cx = side * TRACK_CTR
        tag = 'l' if side < 0 else 'r'

        # the two telescoping cross beams
        for by_ in (-1.35, 1.35):
            bx('uc-slide-beam-' + tag, (abs(cx) + 0.30, 0.42, 0.40), R.MAT_DARK, own, par,
               (cx / 2, by_, 1.02), bevel=0.03)
            bx('uc-slide-pin-boss-' + tag, (0.26, 0.30, 0.30), R.MAT_WORN, own, par,
               (side * 0.95, by_, 1.02), bevel=0.02)

        # crawler side frame
        bx('track-frame-' + tag, (0.62, CRAWLER_LEN - 1.30, 0.72), R.MAT_DARK, own, par,
           (cx, 0, WHEEL_R + 0.02), bevel=0.05)
        bx('track-frame-nose-' + tag, (0.58, 1.05, 0.42), R.MAT_DARK, own, par,
           (cx, WHEEL_CTR + 0.20, WHEEL_R + 0.02), bevel=0.05)
        bx('track-frame-tail-' + tag, (0.58, 1.05, 0.52), R.MAT_DARK, own, par,
           (cx, -WHEEL_CTR - 0.20, WHEEL_R + 0.02), bevel=0.05)
        # track guide guards over the top run
        for gy in (-1.15, 0.0, 1.15):
            bx('track-guard-' + tag, (FRAME_W, 0.55, 0.14), R.MAT_DARK, own, par,
               (cx, gy, TRACK_H + 0.02), bevel=0.02)

        # sprocket (rear, driven) and idler (front)
        tb('sprocket-' + tag, WHEEL_R * 0.78, 0.44, R.MAT_WORN, own, par,
           (cx - 0.22, -WHEEL_CTR, WHEEL_R), (0, math.pi / 2, 0), sides=22)
        for t in range(22):                      # sprocket teeth — cheap, reads
            a = t * math.tau / 22
            bx('sprocket-tooth-' + tag, (0.40, 0.13, 0.16), R.MAT_WORN, own, par,  # noqa
               (cx, -WHEEL_CTR + math.sin(a) * WHEEL_R * 0.86,
                WHEEL_R + math.cos(a) * WHEEL_R * 0.86),
               (a, 0, 0), bevel=0.02, seg=1)
        tb('idler-' + tag, WHEEL_R * 0.86, 0.42, R.MAT_WORN, own, par,
           (cx - 0.21, WHEEL_CTR, WHEEL_R), (0, math.pi / 2, 0), sides=20)
        # bottom track rollers and top carrier rollers
        for i in range(7):
            ry = -1.80 + i * 0.60
            tb('track-roller-' + tag, 0.185, 0.38, R.MAT_WORN, own, par,
               (cx - 0.19, ry, 0.215), (0, math.pi / 2, 0), sides=12)
        for ry in (-1.10, 1.10):
            tb('carrier-roller-' + tag, 0.135, 0.30, R.MAT_WORN, own, par,
               (cx - 0.15, ry, TRACK_H - 0.10), (0, math.pi / 2, 0), sides=10)

        # ── track shoes on a closed stadium path ─────────────────────────────
        # A real chain, not a rubber band: 900 mm shoes at 240 mm pitch round
        # sprocket and idler whose radius is fixed by the published 1 170 mm
        # track height.  ~52 shoes a side; they share one material, so the whole
        # chain is triangles and not a single extra draw call.
        rpath = WHEEL_R - 0.045
        straight = 2 * WHEEL_CTR
        arc = math.pi * rpath
        peri = 2 * straight + 2 * arc
        n = int(peri / SHOE_PITCH)
        for i in range(n):
            s = (i + 0.5) * peri / n
            if s < straight:                         # bottom run, front→rear
                py, pz, pa = WHEEL_CTR - s, WHEEL_R - rpath, 0.0
            elif s < straight + arc:                 # round the sprocket
                a = (s - straight) / rpath
                py = -WHEEL_CTR - math.sin(a) * rpath
                pz = WHEEL_R - math.cos(a) * rpath
                pa = -a
            elif s < 2 * straight + arc:             # top run, rear→front
                py = -WHEEL_CTR + (s - straight - arc)
                pz = WHEEL_R + rpath
                pa = math.pi
            else:                                    # round the idler
                a = (s - 2 * straight - arc) / rpath
                py = WHEEL_CTR + math.sin(a) * rpath
                pz = WHEEL_R + math.cos(a) * rpath
                pa = math.pi - a
            bx('shoe-' + tag, (SHOE_W, SHOE_PITCH * 0.94, 0.070), R.MAT_WORN, own, par,
               (cx, py, pz), (pa, 0, 0), bevel=0.007, seg=1)
            # grouser bar, standing proud of the shoe plate on the ground side
            bx('grouser-' + tag, (SHOE_W * 0.90, 0.055, 0.045), R.MAT_WORN, own, par,
               (cx, py, pz - math.cos(pa) * 0.052, ), (pa, 0, 0), bevel=0.005, seg=1)


def build_upper(slew):
    """Revolving frame, engine house, cab, counterweight stack, winches.

    Layout follows the machine: cab forward and to one side of the leader with a
    clear view down the drill axis, power pack behind it, counterweight slab at
    the tail on the R 4 640 swing circle, walkways with FOLDING handrails right
    round the deck ([S1 p.6] "Guardrails upper level (foldable for transport)",
    "Walking platform with handrail").
    """
    own = slew

    # turntable frame and deck plate
    bx('turntable', (2.95, 5.60, 0.42), R.MAT_DARK, own, slew, (0, -1.05, 2.28), bevel=0.04)
    bx('deck-plate', (3.30, 7.05, 0.09), R.MAT_DARK, own, slew, (0, -1.10, DECK_Z), bevel=0.02)
    bx('deck-nose', (2.10, 1.60, 0.42), R.MAT_DARK, own, slew, (0, 2.05, 2.30), bevel=0.04)

    # ── counterweight: five plates, bolted, with lifting eyes ────────────────
    # [S1 p.23] 1 × 4.9 t + 4 × 2.5 t.  Every published weight on this machine
    # is "without counterweight" (76.9 t transport vs 131 t operating) because
    # the stack comes off for every move, so it must read as removable: parting
    # lines, lifting eyes, a bolted interface — not bodywork [S2 §9-E].
    cwz = 2.30
    bx('cw-carrier', (CW_W + 0.10, CW_D + 0.10, 0.30), R.MAT_DARK, own, slew,
       (0, CW_FACE_Y + CW_D / 2, cwz + 0.15), bevel=0.03)
    for i in range(4):
        z = cwz + 0.30 + 0.03 + i * (CW_H - 0.36) / 4 + (CW_H - 0.36) / 8
        bx('cw-plate', (CW_W, CW_D, (CW_H - 0.36) / 4 - 0.02), R.MAT_DARK, own, slew,
           (0, CW_FACE_Y + CW_D / 2, z), bevel=0.02)
        for sx in (-1, 1):
            bx('cw-lift-eye', (0.10, 0.26, 0.20), R.MAT_WORN, own, slew,
               (sx * (CW_W / 2 - 0.30), CW_FACE_Y + CW_D / 2, z + 0.18), bevel=0.02)
        bx('cw-bolt-strip', (CW_W * 0.9, 0.06, 0.05), R.MAT_WORN, own, slew,
           (0, CW_FACE_Y - 0.01, z), bevel=0.01)
    bx('cw-hazard-l', (0.16, CW_D, CW_H), R.MAT_HAZARD, own, slew,
       (-CW_W / 2 - 0.05, CW_FACE_Y + CW_D / 2, cwz + CW_H / 2), bevel=0.02)
    bx('cw-hazard-r', (0.16, CW_D, CW_H), R.MAT_HAZARD, own, slew,
       (CW_W / 2 + 0.05, CW_FACE_Y + CW_D / 2, cwz + CW_H / 2), bevel=0.02)

    # ── power pack ───────────────────────────────────────────────────────────
    # The house fills the deck between the kinematics pedestals and the
    # counterweight — on a rig this size it is the mass that balances the
    # leader, not a bonnet sitting on an open frame.
    bx('engine-house', (3.20, 3.10, HOUSE_TOP_Z - DECK_Z), R.MAT_PAINT, own, slew,
       (0, -2.20, (DECK_Z + HOUSE_TOP_Z) / 2), bevel=0.05)
    bx('engine-hood', (2.95, 2.85, 0.18), R.MAT_PAINT, own, slew,
       (0, -2.20, HOUSE_TOP_Z + 0.06), bevel=0.05)
    bx('house-front-bay', (3.20, 1.10, 1.35), R.MAT_PAINT, own, slew,
       (0, -0.10, DECK_Z + 0.70), bevel=0.05)
    for sy in (-3.55, -2.05, -0.75):          # hinged service doors
        for sx in (-1, 1):
            bx('house-door-seam', (0.03, 0.05, 1.25), R.MAT_DARK, own, slew,
               (sx * 1.61, sy, DECK_Z + 0.82), bevel=0.006)
            bx('house-latch', (0.06, 0.10, 0.14), R.MAT_WORN, own, slew,
               (sx * 1.62, sy + 0.60, DECK_Z + 0.82), bevel=0.012)
    for sx in (-1, 1):                            # louvre banks, both flanks
        for i in range(5):
            bx('louvre', (0.05, 0.40, 0.85), R.MAT_DARK, own, slew,
               (sx * 1.56, -1.35 - i * 0.44, DECK_Z + 0.85), bevel=0.01)
    bx('cooler-pack', (1.60, 0.16, 1.25), R.MAT_DARK, own, slew,
       (0.68, -3.77, DECK_Z + 0.95), bevel=0.02)
    for i in range(9):                        # cooler core fins
        bx('cooler-fin', (0.14, 0.06, 1.10), R.MAT_WORN, own, slew,
           (-0.10 + i * 0.19, -3.80, DECK_Z + 0.95), bevel=0.006, seg=1)
    bx('hyd-tank', (0.90, 1.30, 1.05), R.MAT_PAINT, own, slew,
       (-1.05, -0.55, DECK_Z + 0.60), bevel=0.04)
    bx('fuel-tank', (0.85, 1.60, 0.95), R.MAT_PAINT, own, slew,
       (1.10, -0.60, DECK_Z + 0.55), bevel=0.04)
    tb('exhaust', 0.11, 1.35, R.MAT_WORN, own, slew, (-1.28, -3.30, HOUSE_TOP_Z - 0.10))
    tb('exhaust-cap', 0.145, 0.16, R.MAT_WORN, own, slew, (-1.28, -3.30, HOUSE_TOP_Z + 1.20))

    # ── cab: full-height front screen, side screen, ROOF window ──────────────
    # The roof window is not decoration; the operator has to watch the masthead
    # and the Kelly head 20 m up while the drive is at the bottom of its stroke.
    cx0, cy0, cz0 = -1.62, 1.35, DECK_Z + 0.10
    bx('cab-shell', (CAB_W, CAB_D, CAB_H), R.MAT_PAINT, own, slew,
       (cx0, cy0, cz0 + CAB_H / 2), bevel=0.05)
    bx('cab-glass-front', (CAB_W - 0.14, 0.05, CAB_H - 0.40), R.MAT_GLASS, own, slew,
       (cx0, cy0 + CAB_D / 2 - 0.01, cz0 + CAB_H / 2 - 0.02), bevel=0.0)
    bx('cab-glass-side', (0.05, CAB_D - 0.42, CAB_H - 0.60), R.MAT_GLASS, own, slew,
       (cx0 - CAB_W / 2 + 0.01, cy0, cz0 + CAB_H / 2 - 0.08), bevel=0.0)
    bx('cab-glass-side-in', (0.05, CAB_D - 0.60, CAB_H - 0.85), R.MAT_GLASS, own, slew,
       (cx0 + CAB_W / 2 - 0.01, cy0 + 0.05, cz0 + CAB_H / 2 - 0.02), bevel=0.0)
    bx('cab-glass-roof', (CAB_W - 0.34, 0.85, 0.05), R.MAT_GLASS, own, slew,
       (cx0, cy0 + 0.42, cz0 + CAB_H - 0.02), bevel=0.0)
    bx('cab-roof-cap', (CAB_W + 0.10, CAB_D + 0.08, 0.07), R.MAT_PAINT, own, slew,
       (cx0, cy0 - 0.10, cz0 + CAB_H + 0.04), bevel=0.03)
    for sy in (-1, 1):                            # cab guard bars over the glass
        strut('cab-guard', (cx0 - 0.62, cy0 + sy * 0.02 + CAB_D / 2 + 0.10, cz0 + 0.35),
              (cx0 + 0.62, cy0 + sy * 0.02 + CAB_D / 2 + 0.10, cz0 + 0.35),
              0.022, R.MAT_WORN, own, slew, sides=6)
    bx('cab-step', (0.55, 0.34, 0.06), R.MAT_HAZARD, own, slew,
       (cx0 - 0.30, cy0 - CAB_D / 2 - 0.18, DECK_Z - 0.35), bevel=0.01)

    # service platform at the leader foot — where the crew stand to change the
    # tool and to work on the drive when it is racked at the bottom
    bx('front-platform', (2.60, 1.35, 0.08), R.MAT_DARK, own, slew,
       (0, 2.15, DECK_Z + 0.02), bevel=0.015)
    for i in range(11):                       # grating bars
        bx('front-grating', (2.50, 0.05, 0.05), R.MAT_WORN, own, slew,
           (0, 1.55 + i * 0.12, DECK_Z + 0.05), bevel=0.006, seg=1)
    bx('front-platform-nose', (2.60, 0.06, 0.14), R.MAT_HAZARD, own, slew,
       (0, 2.80, DECK_Z + 0.06), bevel=0.012)

    # ── walkways, folding handrails, ladder ──────────────────────────────────
    rail = [(-1.62, 2.35), (-1.62, -4.55), (1.62, -4.55), (1.62, 2.35)]
    for i in range(len(rail) - 1):
        (x0, y0), (x1, y1) = rail[i], rail[i + 1]
        for h in (0.52, 1.05):
            strut('handrail', (x0, y0, DECK_Z + h), (x1, y1, DECK_Z + h),
                  0.021, R.MAT_PAINT, own, slew, sides=6)
    n_post = 0
    for (px, py) in [(-1.62, 2.35), (-1.62, 0.20), (-1.62, -2.10), (-1.62, -4.55),
                     (1.62, 2.35), (1.62, 0.20), (1.62, -2.10), (1.62, -4.55),
                     (0.0, -4.55)]:
        n_post += 1
        strut('rail-post', (px, py, DECK_Z), (px, py, DECK_Z + 1.05),
              0.024, R.MAT_PAINT, own, slew, sides=6)
        bx('rail-hinge', (0.09, 0.09, 0.13), R.MAT_WORN, own, slew,
           (px, py, DECK_Z + 0.14), bevel=0.01)     # folds flat for transport
    bx('toe-board-l', (0.05, 6.90, 0.13), R.MAT_HAZARD, own, slew,
       (-1.66, -1.10, DECK_Z + 0.09), bevel=0.01)
    bx('toe-board-r', (0.05, 6.90, 0.13), R.MAT_HAZARD, own, slew,
       (1.66, -1.10, DECK_Z + 0.09), bevel=0.01)
    # access ladder up the side of the car body
    for sz in range(7):
        bx('ladder-rung', (0.44, 0.05, 0.04), R.MAT_WORN, own, slew,
           (1.74, -3.30, 0.45 + sz * 0.32), bevel=0.008)
    for sx in (-0.22, 0.22):
        strut('ladder-rail', (1.74 + sx, -3.42, 0.35), (1.74 + sx, -3.28, 2.55),
              0.028, R.MAT_HAZARD, own, slew, sides=6)

    # ── winches: main, crowd, auxiliary ──────────────────────────────────────
    # Single-layer grooved drums — LONG and thin, not fat [S2 §4.3]; a 32 mm
    # main rope and a 28 mm crowd rope at the published pulls.
    def drum(name, cx, cy, cz, r, w, rope_d):
        tb(name, r, w, R.MAT_CAST, own, slew, (cx - w / 2, cy, cz),
           (0, math.pi / 2, 0), sides=20)
        for f in (-1, 1):
            tb(name + '-flange', r * 1.22, 0.06, R.MAT_CAST, own, slew,
               (cx + f * w / 2 - (0.06 if f > 0 else 0.0), cy, cz),
               (0, math.pi / 2, 0), sides=20)
        for i in range(int(w / (rope_d * 1.15))):   # the single grooved layer
            tb(name + '-wrap', r + rope_d / 2, rope_d * 0.95, R.MAT_WORN, own, slew,
               (cx - w / 2 + 0.03 + i * rope_d * 1.15, cy, cz),
               (0, math.pi / 2, 0), sides=10)
        bx(name + '-gearbox', (0.34, 0.52, 0.52), R.MAT_CAST, own, slew,
           (cx + w / 2 + 0.18, cy, cz), bevel=0.03)

    drum('winch-main', 0.10, -1.30, 3.55, 0.36, 1.15, MAIN_ROPE_D)
    drum('winch-crowd', 0.10, -0.10, 4.35, 0.31, 0.95, CROWD_ROPE_D)
    drum('winch-aux', -1.05, -2.95, 3.40, 0.25, 0.70, AUX_ROPE_D)

    # bulkhead plate on the base carrier — the fixed end of the hose package
    # ([S4]: "from bulkhead base carrier to bulkhead on the rotary drive")
    bx('hose-bulkhead-carrier', (0.62, 0.10, 0.46), R.MAT_WORN, own, slew,
       (0.95, 1.95, DECK_Z + 0.55), bevel=0.02)
    for i in range(6):                              # six main working lines
        tb('bulkhead-port', 0.036, 0.10, R.MAT_STEEL, own, slew,
           (0.72 + (i % 3) * 0.22, 1.95, DECK_Z + 0.44 + (i // 3) * 0.20),
           (-math.pi / 2, 0, 0), sides=8)


def build_aframe_and_kinematics(slew, mast):
    """The parallel kinematics: a tall front A-frame, two upper links, two lower
    links and two rams, arranged as a true parallelogram so the leader
    TRANSLATES fore/aft while staying vertical [S2 §5.4].

    Geometry: upper link runs apex (0.10, 6.50) → mast (1.90, 8.30); lower link
    runs deck (0.10, 3.40) → mast (1.90, 5.20).  Identical (1.80, 1.80) vectors,
    so the mast keeps its attitude through the whole reach range — which is what
    makes the printed 4 340 → 5 840 mm reach adjustment possible at all.
    """
    for sx in (-1, 1):
        x = sx * 1.08
        strut('aframe-leg', (x, -1.45, DECK_Z), (sx * 0.62, 0.10, 6.50),
              0.115, R.MAT_PAINT, slew, slew, square=True)
        strut('aframe-back-stay', (x * 1.12, -3.40, DECK_Z + 0.30), (sx * 0.62, 0.05, 6.35),
              0.075, R.MAT_PAINT, slew, slew, square=True)
    strut('aframe-head', (-0.62, 0.10, 6.50), (0.62, 0.10, 6.50),
          0.12, R.MAT_PAINT, slew, slew, square=True)
    strut('aframe-brace', (-1.08, -1.45, 4.20), (1.08, -1.45, 4.20),
          0.07, R.MAT_PAINT, slew, slew, square=True)
    for sx in (-1, 1):
        strut('aframe-x-brace', (sx * 1.08, -1.45, DECK_Z + 0.9), (-sx * 0.62, 0.10, 6.30),
              0.045, R.MAT_PAINT, slew, slew, square=True)

    # links — pinned to the mast, so they live under pivot:mast at the mast end.
    # Modelled on the mast side of the joint because the mast is what moves.
    for sx in (-1, 1):
        x = sx * 0.62
        strut('link-upper', (x, 0.10, 6.50), (x, MAST_BACK_Y + 0.01, 8.30),
              0.085, R.MAT_DARK, slew, slew, square=True)
        strut('link-lower', (x, 0.10, 3.40), (x, MAST_BACK_Y + 0.01, 5.20),
              0.095, R.MAT_DARK, slew, slew, square=True)
        for (py, pz) in ((0.10, 6.50), (0.10, 3.40)):
            tb('link-pin', 0.075, 0.34, R.MAT_STEEL, slew, slew,
               (x - 0.17, py, pz), (0, math.pi / 2, 0), sides=12)
        bx('link-deck-pedestal', (0.30, 0.42, 1.00), R.MAT_PAINT, slew, slew,
           (x, 0.10, 2.95), bevel=0.03)

    # the two mast rams. Barrel on the deck, chrome rod out to the mast bracket.
    for sx in (-1, 1):
        x = sx * 0.95
        p0 = Vector((x, -0.70, 3.20))
        p1 = Vector((x, MAST_BACK_Y - 0.05, 6.60))
        d = (p1 - p0)
        L = d.length
        rot = d.to_track_quat('Z', 'Y').to_euler()
        B(R.tube('ram-mast-barrel', 0.155, L * 0.62, R.MAT_PAINT, slew, p0, rot, 16),
          slew, R.MAT_PAINT)
        B(R.tube('ram-mast-rod', 0.085, L * 0.46, R.MAT_CHROME, slew,
                 p0 + d.normalized() * (L * 0.58), rot, 12), slew, R.MAT_CHROME)
        B(R.tube('ram-mast-eye', 0.10, 0.30, R.MAT_STEEL, slew,
                 (x - 0.15, -0.70, 3.20), (0, math.pi / 2, 0), 12), slew, R.MAT_STEEL)
        # the pair of feed hoses that every big ram wears
        hs('ram-hose', [(x + 0.16, -0.55, 3.35),
                        (x + 0.30, 0.35, 4.10),
                        (x + 0.22, 1.30, 5.20)], 0.026, R.MAT_RUBBER, slew, slew)


def build_mast(mast):
    """The leader: a welded plate box girder pierced with big round lightening
    holes — NOT a lattice.  [S2 §9-C] is explicit that the current game model
    gets this wrong, and it is the single biggest silhouette error to fix: at
    distance a lattice reads as an open truss, this reads as a dark solid mass
    with punched circles.  Built in three bolted segments plus the 3 m extension
    ([S1 p.16] mast extension 3 m, foldable for transport).
    """
    own = mast
    yc = (MAST_FACE_Y + MAST_BACK_Y) / 2          # mast box centre in Y
    total = GIRDER_LEN
    zc = MAST_FOOT_Z + total / 2

    # side plates, punched. 13 holes at 1.55 m pitch through the main leader.
    holes = []
    z = MAST_FOOT_Z + 1.55
    while z < GIRDER_TOP_Z - 1.0:
        holes.append(((0, yc + 0.02, z), 0.30, 2.0))
        z += 1.55
    for sx in (-1, 1):
        p = bx('mast-side-plate', (0.045, MAST_D, total), R.MAT_DARK, own, mast,
               (sx * MAST_W / 2, yc, zc), bevel=0.0)
        _apply_mods(p)
        punch(p, holes, axis='X')
    # front plate (carries the sledge rails) and back plate
    bx('mast-front-plate', (MAST_W, 0.045, total), R.MAT_DARK, own, mast,
       (0, MAST_FACE_Y, zc), bevel=0.008)
    bx('mast-back-plate', (MAST_W, 0.045, total), R.MAT_DARK, own, mast,
       (0, MAST_BACK_Y, zc), bevel=0.008)
    # internal diaphragms show through the holes and stop it reading hollow
    z = MAST_FOOT_Z + 0.80
    while z < GIRDER_TOP_Z - 0.5:
        bx('mast-diaphragm', (MAST_W - 0.12, MAST_D - 0.10, 0.035), R.MAT_DARK, own, mast,
           (0, yc, z), bevel=0.006)
        z += 1.55

    # bolted segment flanges — the mast ships in pieces
    for z in (MAST_FOOT_Z + 6.60, MAST_FOOT_Z + 13.20, MAST_TOP_Z):
        bx('mast-flange', (MAST_W + 0.13, MAST_D + 0.13, 0.075), R.MAT_WORN, own, mast,
           (0, yc, z), bevel=0.012)
        for i in range(6):
            for sx in (-1, 1):
                bx('mast-flange-bolt', (0.05, 0.05, 0.10), R.MAT_STEEL, own, mast,
                   (sx * (MAST_W / 2 + 0.045), yc - MAST_D / 2 + 0.12 + i * 0.16, z),
                   bevel=0.008, seg=1)

    # sledge rails: two heavy rails standing proud of the front face, full length
    for sx in (-1, 1):
        bx('mast-rail', (0.14, 0.19, total - 0.30), R.MAT_STEEL, own, mast,
           (sx * RAIL_X, MAST_FACE_Y + 0.11, zc), bevel=0.015)
        bx('mast-rail-web', (0.07, 0.12, total - 0.30), R.MAT_DARK, own, mast,
           (sx * RAIL_X, MAST_FACE_Y + 0.05, zc), bevel=0.01)

    # kinematics brackets on the back face
    for sx in (-1, 1):
        for z in (5.20, 8.30):
            bx('mast-link-bracket', (0.16, 0.34, 0.46), R.MAT_DARK, own, mast,
               (sx * 0.62, MAST_BACK_Y - 0.14, z), bevel=0.02)
            tb('mast-link-pin', 0.075, 0.30, R.MAT_STEEL, own, mast,
               (sx * 0.62 - 0.15, MAST_BACK_Y - 0.14, z), (0, math.pi / 2, 0), sides=12)
        bx('mast-ram-bracket', (0.20, 0.40, 0.52), R.MAT_DARK, own, mast,
           (sx * 0.95, MAST_BACK_Y - 0.16, 6.60), bevel=0.02)

    # mast foot: spoil chute and the auger/Kelly cleaner scraper [S2 §4.5]
    bx('mast-foot-box', (MAST_W + 0.24, MAST_D + 0.30, 0.70), R.MAT_DARK, own, mast,
       (0, yc + 0.10, MAST_FOOT_Z + 0.20), bevel=0.03)
    bx('spoil-chute', (1.35, 0.09, 1.05), R.MAT_WORN, own, mast,
       (0, MAST_FACE_Y + 0.55, MAST_FOOT_Z - 0.30), (0.42, 0, 0), bevel=0.02)
    strut('cleaner-arm', (0.55, MAST_FACE_Y + 0.10, MAST_FOOT_Z + 0.55),
          (0.05, DRILL_AXIS_Y - 0.35, MAST_FOOT_Z + 0.35), 0.055, R.MAT_WORN, own, mast)
    bx('cleaner-scraper', (0.70, 0.16, 0.22), R.MAT_STEEL, own, mast,
       (0, DRILL_AXIS_Y - 0.42, MAST_FOOT_Z + 0.35), bevel=0.015)
    bx('mast-foot-hazard', (MAST_W + 0.26, 0.06, 0.30), R.MAT_HAZARD, own, mast,
       (0, MAST_FACE_Y + 0.14, MAST_FOOT_Z + 0.10), bevel=0.01)

    # ── masthead.  Its top face IS the published 27 100 mm max height. ──────
    top = GIRDER_TOP_Z
    bx('masthead-box', (MAST_W + 0.20, MAST_D + 0.55, MASTHEAD_H), R.MAT_DARK, own, mast,
       (0, yc + 0.20, top + MASTHEAD_H / 2), bevel=0.04)
    # crown sheaves — main rope, auxiliary rope, crowd rope
    for (sx, r) in ((-0.30, 0.40), (0.0, 0.40), (0.30, 0.32)):
        tb('crown-sheave', r, 0.10, R.MAT_CAST, own, mast,
           (sx - 0.05, yc + 0.20, top + 0.58), (0, math.pi / 2, 0), sides=20)
        tb('crown-sheave-hub', r * 0.34, 0.14, R.MAT_STEEL, own, mast,
           (sx - 0.07, yc + 0.20, top + 0.58), (0, math.pi / 2, 0), sides=12)
    tb('crown-shaft', 0.075, 1.05, R.MAT_STEEL, own, mast,
       (-0.52, yc + 0.20, top + 0.58), (0, math.pi / 2, 0), sides=12)
    bx('crown-guard', (MAST_W, 0.10, 0.88), R.MAT_DARK, own, mast,
       (0, yc + 0.72, top + 0.58), bevel=0.02)

    # ── upper Kelly guide ────────────────────────────────────────────────────
    # [S1 p.16] the upgraded configuration is the one WITH an upper Kelly guide,
    # and [S3] says the long Kelly head is standard precisely so this guide can
    # be used without conversion.  It is also what physically sets the visible
    # 1 400 mm air gap between the leader face and the Kelly [S2 §9-H] — the gap
    # is the single detail that stops the machine reading as a crane jib.
    gz = GIRDER_TOP_Z - 1.05
    strut('kelly-guide-arm-l', (-0.45, MAST_FACE_Y, gz),
          (-0.42, DRILL_AXIS_Y - 0.05, gz), 0.075, R.MAT_DARK, own, mast, square=True)
    strut('kelly-guide-arm-r', (0.45, MAST_FACE_Y, gz),
          (0.42, DRILL_AXIS_Y - 0.05, gz), 0.075, R.MAT_DARK, own, mast, square=True)
    bx('kelly-guide-collar', (1.06, 0.34, 0.42), R.MAT_DARK, own, mast,
       (0, DRILL_AXIS_Y, gz), bevel=0.03)
    for a in range(4):                                # guide rollers, 4 round
        th = a * math.tau / 4 + math.pi / 4
        tb('kelly-guide-roller', 0.085, 0.34, R.MAT_STEEL, own, mast,
           (math.cos(th) * 0.36, DRILL_AXIS_Y + math.sin(th) * 0.36, gz - 0.17),
           (0, 0, 0), sides=10)

    # hose deflection roller: where the bundle turns up the leader [S4]
    tb('hose-deflect-roller', 0.16, 0.62, R.MAT_STEEL, own, mast,
       (-0.31, MAST_BACK_Y - 0.28, MAST_FOOT_Z + 1.15), (0, math.pi / 2, 0), sides=14)
    for z in (7.5, 11.5, 15.5, 19.5):                  # bundle guide brackets
        bx('hose-guide', (0.34, 0.30, 0.10), R.MAT_DARK, own, mast,
           (-0.68, MAST_BACK_Y - 0.16, z), bevel=0.015)

    # mast-mounted service ladder with a fall-arrest rail
    z = MAST_FOOT_Z + 0.45
    while z < GIRDER_TOP_Z - 0.5:
        bx('mast-rung', (0.40, 0.045, 0.035), R.MAT_WORN, own, mast,
           (-0.78, MAST_BACK_Y - 0.22, z), bevel=0.006, seg=1)
        z += 0.31
    for sx in (-0.19, 0.19):
        strut('mast-ladder-rail', (-0.78 + sx, MAST_BACK_Y - 0.26, MAST_FOOT_Z + 0.35),
              (-0.78 + sx, MAST_BACK_Y - 0.26, GIRDER_TOP_Z - 0.4),
              0.026, R.MAT_HAZARD, own, mast, sides=6)


def build_sledge_and_drive(sledge, spindle):
    """Crowd sledge on the mast rails, and the rotary drive pinned to it.

    The drive is a SWAPPABLE MODULE: [S1 p.11] offers two drives on the same
    machine and [S1 p.13] lists a "hydraulically operated pin connection on
    crowd sledge".  So the interface gets real pin bosses and lifting eyes
    [S2 §9-F], not a welded blend.

    Note the crowd system is a WINCH, not cylinders: [S1 p.11] "Crowd winch
    system / Crowd force push and pull 400 / 513 kN / Rope diameter 28 mm", and
    the options list carries "Distance measuring device on crowd winch" and
    "Crowd stroke monitoring".  A pair of long crowd cylinders on the leader
    would be the wrong architecture for this machine.
    """
    own = sledge

    # sledge frame wrapping the mast face, with gibs on both rails
    bx('sledge-frame', (1.45, 0.34, 1.95), R.MAT_DARK, own, sledge,
       (0, MAST_FACE_Y + 0.30, 0), bevel=0.03)
    for sx in (-1, 1):
        for sz in (-0.80, 0.80):
            bx('sledge-gib', (0.30, 0.30, 0.28), R.MAT_CAST, own, sledge,
               (sx * RAIL_X, MAST_FACE_Y + 0.11, sz), bevel=0.02)
            bx('sledge-gib-liner', (0.10, 0.22, 0.24), R.MAT_STEEL, own, sledge,
               (sx * (RAIL_X + 0.13), MAST_FACE_Y + 0.11, sz), bevel=0.01)
    bx('sledge-crossbeam', (1.55, 0.26, 0.30), R.MAT_DARK, own, sledge,
       (0, MAST_FACE_Y + 0.52, 0.85), bevel=0.025)
    # crowd rope terminations, top and bottom of the sledge
    for sz in (1.05, -1.05):
        bx('crowd-rope-anchor', (0.24, 0.22, 0.24), R.MAT_WORN, own, sledge,
           (0.34, MAST_FACE_Y + 0.42, sz), bevel=0.02)

    # arms out to the drill axis — this is the 1 400 mm stand-off, in the metal
    for sx in (-1, 1):
        strut('sledge-arm', (sx * 0.62, MAST_FACE_Y + 0.30, 0.45),
              (sx * 0.52, DRILL_AXIS_Y - 0.20, 0.45), 0.09, R.MAT_DARK, own, sledge,
              square=True)
        strut('sledge-arm-lo', (sx * 0.62, MAST_FACE_Y + 0.30, -0.72),
              (sx * 0.52, DRILL_AXIS_Y - 0.20, -0.72), 0.09, R.MAT_DARK, own, sledge,
              square=True)
        bx('sledge-pin-boss', (0.24, 0.30, 0.30), R.MAT_WORN, own, sledge,
           (sx * 0.52, DRILL_AXIS_Y - 0.28, 0.45), bevel=0.02)
        bx('sledge-pin-boss-lo', (0.24, 0.30, 0.30), R.MAT_WORN, own, sledge,
           (sx * 0.52, DRILL_AXIS_Y - 0.28, -0.72), bevel=0.02)
        tb('sledge-pin', 0.055, 0.42, R.MAT_STEEL, own, sledge,
           (sx * 0.52 - 0.21, DRILL_AXIS_Y - 0.28, 0.45), (0, math.pi / 2, 0), sides=10)

    # ── rotary drive body: 2 630 × 1 490, 7.2 t [S1 p.23] ────────────────────
    ax = DRILL_AXIS_Y
    bx('drive-housing', (KDK_W, KDK_D, KDK_H * 0.60), R.MAT_PAINT, own, sledge,
       (0, ax, 0.42), bevel=0.05)
    bx('drive-top-cap', (KDK_W - 0.12, KDK_D - 0.10, 0.16), R.MAT_DARK, own, sledge,
       (0, ax, 0.42 + KDK_H * 0.30 + 0.08), bevel=0.03)
    for sx in (-1, 1):                       # lifting eyes — it comes off
        bx('drive-lift-eye', (0.09, 0.26, 0.24), R.MAT_WORN, own, sledge,
           (sx * (KDK_W / 2 - 0.18), ax, 0.42 + KDK_H * 0.30 + 0.20), bevel=0.02)
    # radial-piston motor pods round the gear ring
    for i in range(4):
        th = math.pi / 4 + i * math.pi / 2
        tb('drive-motor', 0.155, 0.42, R.MAT_CAST, own, sledge,
           (math.cos(th) * 0.52, ax + math.sin(th) * 0.42, 0.42 + KDK_H * 0.30),
           (0, 0, 0), sides=12)
        bx('drive-motor-block', (0.28, 0.26, 0.20), R.MAT_CAST, own, sledge,
           (math.cos(th) * 0.52, ax + math.sin(th) * 0.42, 0.42 + KDK_H * 0.30 + 0.50),
           bevel=0.02)
    # gearbox belly and the hollow output housing
    tb('drive-gearcase', 0.46, 0.55, R.MAT_CAST, own, sledge,
       (0, ax, -0.36), sides=24)
    tb('drive-output-housing', 0.36, 0.34, R.MAT_CAST, own, sledge,
       (0, ax, -0.70), sides=20)

    # bulkhead plate on the drive — every hose in the package lands here [S4]
    bx('hose-bulkhead-drive', (0.66, 0.09, 0.44), R.MAT_WORN, own, sledge,
       (-0.86, ax - 0.10, 0.55), bevel=0.02)
    for i in range(6):
        tb('drive-port', 0.034, 0.09, R.MAT_STEEL, own, sledge,
           (-0.86 + ((i % 3) - 1) * 0.20, ax - 0.16, 0.44 + (i // 3) * 0.20),
           (math.pi / 2, 0, 0), sides=8)

    # ── Kelly drive adapter, below the drive, on the rotating spindle ────────
    # [S3 pp.4-5]: a separate component with a hollow stem, a cardanic joint and
    # an "Öffnerplatte" / trigger plate that releases the telescopic locks.  The
    # Kelly does NOT pass through a plain hole [S2 §9-G]; there is a stepped
    # collar, and the trigger plate is visible on it.
    # The spindle node sits ON the drive's lower face, which is the height the
    # datasheet dimensions from (3 630 mm at the bottom of the crowd stroke), so
    # the adapter hangs straight off it — no second offset.
    tb('adapter-collar', 0.375, 0.16, R.MAT_CAST, spindle, spindle, (0, 0, -0.16), sides=20)
    tb('adapter-body', 0.315, 0.54, R.MAT_CAST, spindle, spindle, (0, 0, -0.70), sides=20)
    tb('adapter-stem', 0.275, 0.46, R.MAT_CAST, spindle, spindle, (0, 0, -1.16), sides=18)
    bx('adapter-trigger-plate', (0.86, 0.10, 0.28), R.MAT_STEEL, spindle, spindle,
       (0, 0.30, -0.46), bevel=0.015)
    for i in range(6):                       # cardanic-joint bolt ring
        th = i * math.tau / 6
        bx('adapter-bolt', (0.07, 0.07, 0.11), R.MAT_STEEL, spindle, spindle,
           (math.cos(th) * 0.335, math.sin(th) * 0.335, -0.10), bevel=0.01)


def build_kelly(spindle, top0):
    """The telescopic Kelly bar — the part that makes this rig THIS rig.

    Fixed against [S2 §9-A], which lists three errors in the current game model
    at once:
      · the tubes are ROUND ([S3] "2–5 telescopic TUBULAR sections"), not square;
      · SIX drive keys per section, not two;
      · only the bottom stub is square, and it is 200 mm on every bar in the
        published range from the smallest class to the largest.

    Built retracted.  Element 1 (outer) carries the head and hangs from the
    drive; elements 2–4 telescope DOWN out of it on slide: nodes, 11.50 m per
    stage, 15.30 m retracted → 49.80 m extended [S1 p.16].
    """
    nodes = []
    host = R.empty('', 'kelly-1', spindle, (0, 0, top0))
    top = 0.0
    for i in range(KELLY_ELEMS):
        d = KELLY_D0 * (KELLY_STEP ** i)
        r = d / 2
        if i == 0:
            node = host
        else:
            node = R.empty(R.NODE_SLIDE, 'kelly-%d' % (i + 1), host, (0, 0, 0))
            node['travel_m'] = -KELLY_STAGE     # each stage drops 11.50 m
            node['overlap_m'] = KELLY_OVERLAP
        own = node
        # the tube. Origin of each element at its own top.
        tb('kelly-tube-%d' % (i + 1), r, KELLY_L, R.MAT_WORN, own, node,
           (0, 0, top - KELLY_L), sides=16 if i == 0 else 12)

        # six welded drive keys, full length, 60° apart [S3]
        kp = 0.045 if i == 0 else 0.030       # how far a key stands proud
        kw = 0.090 if i == 0 else 0.070
        for k in range(KELLY_KEYS):
            th = k * math.tau / KELLY_KEYS
            bx('kelly-key-%d' % (i + 1), (kw, kp * 2.0, KELLY_L - 0.35), R.MAT_WORN,
               own, node,
               (math.cos(th) * (r + kp * 0.55), math.sin(th) * (r + kp * 0.55),
                top - KELLY_L / 2 - 0.10),
               (0, 0, th + math.pi / 2), bevel=0.008)
            # lock recess boxes at the element foot — the mechanical locking
            # device sits between every element [S3 item 6]
            bx('kelly-lock-%d' % (i + 1), (kw * 1.25, kp * 2.4, 0.22), R.MAT_STEEL,
               own, node,
               (math.cos(th) * (r + kp * 0.55), math.sin(th) * (r + kp * 0.55),
                top - KELLY_L + 0.30),
               (0, 0, th + math.pi / 2), bevel=0.008)

        if i == 0:
            # ── Kelly pot / head, long type, with the eye the swivel hooks ──
            tb('kelly-head', r * 1.32, KELLY_HEAD_L, R.MAT_WORN, own, node,
               (0, 0, 0.0), sides=16)
            tb('kelly-head-collar', r * 1.46, 0.18, R.MAT_WORN, own, node,
               (0, 0, KELLY_HEAD_L - 0.30), sides=16)
            for sx in (-1, 1):
                bx('kelly-eye-plate', (0.06, 0.34, 0.50), R.MAT_STEEL, own, node,
                   (sx * 0.12, 0, KELLY_HEAD_L - 0.19), bevel=0.02)
            tb('kelly-eye-pin', 0.05, 0.30, R.MAT_STEEL, own, node,
               (-0.15, 0, KELLY_HEAD_L - 0.11), (0, math.pi / 2, 0), sides=10)
            # dewatering bore holes near the foot of the outer tube [S3 p.6]
            for k in range(8):
                th = k * math.tau / 8
                tb('kelly-dewater-port', 0.032, 0.05, R.MAT_STEEL, own, node,
                   (math.cos(th) * r, math.sin(th) * r, -KELLY_L + 0.95),
                   (math.pi / 2, 0, -th), sides=8)
            # split stop ring, replaceable in halves [S3 p.6]
            tb('kelly-stop-ring', r * 1.10, 0.11, R.MAT_STEEL, own, node,
               (0, 0, -KELLY_L + 0.30), sides=16)

        if i == KELLY_ELEMS - 1:
            # shock-absorbing spring, then the ONE square part of the whole bar
            tb('kelly-damper', r * 1.18, 0.36, R.MAT_STEEL, own, node,
               (0, 0, -KELLY_L - 0.36), sides=14)
            for c in range(5):
                tb('kelly-damper-coil', r * 1.24, 0.045, R.MAT_WORN, own, node,
                   (0, 0, -KELLY_L - 0.33 + c * 0.07), sides=14)
            bx('kelly-stub-shoulder', (STUB_MM * 1.55, STUB_MM * 1.55, 0.14),
               R.MAT_STEEL, own, node, (0, 0, -KELLY_L - 0.45), bevel=0.012)
            bx('kelly-drive-stub', (STUB_MM, STUB_MM, 0.62), R.MAT_STEEL, own, node,
               (0, 0, -KELLY_L - 0.83), bevel=0.010)
            tb('kelly-stub-pin', 0.030, STUB_MM * 1.4, R.MAT_STEEL, own, node,
               (0, -STUB_MM * 0.7, -KELLY_L - 1.02), (-math.pi / 2, 0, 0), sides=8)
            R.empty(R.NODE_MOUNT, 'tool', node, (0, 0, -KELLY_L - KELLY_STUB_A))

        nodes.append(node)
        host = node
    return nodes


def build_ropes_and_hoses(mast, sledge_z, head_z):
    """Main hoist rope and swivel, crowd reeving, and the hose PACKAGE.

    [S4] is the only document that says where the hoses actually run, and it is
    unambiguous: six main working lines plus an electric cable, from a deflection
    point / a bulkhead on the base carrier, to a BULKHEAD PLATE ON THE ROTARY
    DRIVE, the whole run wrapped in a flat tarpaulin hose bag.  So the correct
    object is a flat ordered bundle in a sleeve forming a moving catenary loop —
    not four loose snakes round the deck, which is what the game has today
    [S2 §9-D].
    """
    own = mast
    top = MAST_FOOT_Z + MAST_LEN + EXT_LEN
    yc = (MAST_FACE_Y + MAST_BACK_Y) / 2
    ax = DRILL_AXIS_Y

    # main hoist rope: crown sheave → down the drill axis → swivel → Kelly eye
    # main hoist rope, and the swivel it ends in.  The rope swivel is a 890 mm
    # body with Ø216 eyes and Ø80 pins at this rating [S2 §3] — a real component
    # between the rope and the Kelly eye, not a shackle [S2 §9-I].  It sits
    # directly on top of the Kelly head in the parked pose modelled here.
    sw_bot = head_z + 0.18
    hs('rope-main', [(-0.35, yc + 0.20, top + 0.92),
                     (-0.20, ax - 0.55, top + 0.28),
                     (-0.02, ax, top - 1.40),
                     (0.0, ax, sw_bot + SWIVEL_L)],
       MAIN_ROPE_D / 2, R.MAT_WORN, own, mast, taut=True)
    tb('swivel-body', SWIVEL_D / 2, SWIVEL_L * 0.62, R.MAT_CAST, own, mast,
       (0, ax, sw_bot + 0.16), sides=16)
    tb('swivel-neck', SWIVEL_D / 2 * 0.55, 0.24, R.MAT_STEEL, own, mast,
       (0, ax, sw_bot + 0.16 + SWIVEL_L * 0.62), sides=12)
    for sx in (-1, 1):
        bx('swivel-eye', (0.05, 0.26, 0.34), R.MAT_STEEL, own, mast,
           (sx * 0.10, ax, sw_bot + 0.02), bevel=0.02)
    tb('swivel-pin', 0.042, 0.28, R.MAT_STEEL, own, mast,
       (-0.14, ax, sw_bot - 0.06), (0, math.pi / 2, 0), sides=10)

    # crowd reeving: up the back, over the crown, down the face to the sledge
    hs('rope-crowd-up', [(0.34, MAST_BACK_Y - 0.30, MAST_FOOT_Z + 0.60),
                         (0.32, MAST_BACK_Y - 0.20, top * 0.55),
                         (0.31, yc + 0.30, top + 0.72),
                         (0.34, MAST_FACE_Y + 0.42, sledge_z + 1.05)],
       CROWD_ROPE_D / 2, R.MAT_WORN, own, mast, taut=True)
    hs('rope-crowd-down', [(0.34, MAST_BACK_Y - 0.34, MAST_FOOT_Z + 0.45),
                           (0.36, MAST_FACE_Y + 0.30, MAST_FOOT_Z + 0.25),
                           (0.34, MAST_FACE_Y + 0.42, sledge_z - 1.05)],
       CROWD_ROPE_D / 2, R.MAT_WORN, own, mast, taut=True)
    tb('crowd-foot-sheave', 0.30, 0.09, R.MAT_CAST, own, mast,
       (0.29, MAST_FACE_Y + 0.30, MAST_FOOT_Z + 0.10), (0, math.pi / 2, 0), sides=18)

    # auxiliary rope over the third crown sheave
    # auxiliary rope over the third crown sheave, hanging on its hook block
    hook_z = sledge_z + 7.5
    hs('rope-aux', [(0.30, yc + 0.20, top + 0.88),
                    (0.46, ax + 0.42, top - 0.60),
                    (0.48, ax + 0.62, hook_z + 0.55)],
       AUX_ROPE_D / 2, R.MAT_WORN, own, mast, taut=True)
    bx('aux-hook-block', (0.26, 0.20, 0.46), R.MAT_CAST, own, mast,
       (0.48, ax + 0.62, hook_z + 0.30), bevel=0.03)
    tb('aux-hook-shank', 0.05, 0.34, R.MAT_STEEL, own, mast,
       (0.48, ax + 0.62, hook_z - 0.26), sides=10)
    tb('aux-hook-bill', 0.055, 0.26, R.MAT_STEEL, own, mast,
       (0.48, ax + 0.62, hook_z - 0.26), (0.9, 0, 0), sides=10)

    # ── the hose package: a flat ordered bundle, six lines wide + a cable ────
    y0, y1 = MAST_BACK_Y - 0.30, MAST_FACE_Y + 0.30
    for i in range(6):
        x = -0.62 + (i - 2.5) * 0.062
        hs('hose-main-%d' % (i + 1),
           [(x, y0, MAST_FOOT_Z + 1.15),
            (x, y0 - 0.12, MAST_FOOT_Z + 5.0),
            (x, y0 - 0.16, sledge_z + 2.60),              # the catenary crest
            (x - 0.05, y0 + 0.55, sledge_z + 1.10),
            (x - 0.10, ax - 0.30, sledge_z + 0.60)],
           0.030, R.MAT_RUBBER, own, mast)
    hs('hose-electric',
           [(-0.62 + 3.5 * 0.062, y0, MAST_FOOT_Z + 1.15),
            (-0.62 + 3.5 * 0.062, y0 - 0.12, MAST_FOOT_Z + 5.0),
            (-0.62 + 3.5 * 0.062, y0 - 0.16, sledge_z + 2.60),
            (-0.67 + 3.5 * 0.062, y0 + 0.55, sledge_z + 1.10),
            (-0.72 + 3.5 * 0.062, ax - 0.30, sledge_z + 0.60)],
           0.020, R.MAT_RUBBER, own, mast)
    # the flat tarpaulin bag the bundle actually lives in — strap clamps
    for z in (MAST_FOOT_Z + 2.6, MAST_FOOT_Z + 5.4, sledge_z + 2.35):
        bx('hose-bag-strap', (0.46, 0.20, 0.07), R.MAT_RUBBER, own, mast,
           (-0.62, y0 - 0.13, z), bevel=0.012)
    _ = y1


def build_lights(slew, mast, sledge):
    """Lamps, and the mount:/aim: pairs env.js re-aims spotlights at every frame.

    Two of the four ride moving nodes on purpose: the mast lamp sweeps as the
    leader rakes and the sledge lamp travels the whole 10 m crowd stroke, so the
    pool of light walks down the hole with the drive.
    """
    R.worklight('lamp-cab', slew, (-1.62, 2.30, DECK_Z + 2.32),
                aim_dir=(0.6, 1.6, -1.0), cone_deg=58, range_m=26)
    R.worklight('lamp-deck-rear', slew, (1.55, -4.30, DECK_Z + 1.15),
                aim_dir=(-0.4, -1.0, -0.9), cone_deg=64, range_m=18)
    R.worklight('lamp-mast-head', mast,
                (-0.70, MAST_FACE_Y + 0.26, GIRDER_TOP_Z - 2.2),
                aim_dir=(0.5, 1.2, -1.6), cone_deg=46, range_m=34)
    R.worklight('lamp-drive', sledge, (-0.78, MAST_FACE_Y + 0.50, 0.95),
                aim_dir=(0.7, 1.1, -1.4), cone_deg=52, range_m=22)


def build_lamp_housings(slew, mast, sledge):
    """Physical lamp bodies under the mount nodes, so a beam leaves a housing."""
    for (own, par, loc, rot) in (
            (slew, slew, (-1.62, 2.30, DECK_Z + 2.32), (0.55, 0, 0)),
            (slew, slew, (1.55, -4.30, DECK_Z + 1.15), (-0.5, 0, 0)),
            (mast, mast, (-0.70, MAST_FACE_Y + 0.26, GIRDER_TOP_Z - 2.2), (0.7, 0, 0)),
            (sledge, sledge, (-0.78, MAST_FACE_Y + 0.50, 0.95), (0.7, 0, 0))):
        # Only the two deck lamps get a glass lens: the uppercarriage already
        # spends a glass draw call on the cab so lenses there are free, whereas
        # a 12-triangle glass primitive on the mast and another on the sledge
        # would each cost a whole draw call. Those get a steel reflector face.
        lens = R.MAT_GLASS if own is slew else R.MAT_STEEL
        bx('lamp-housing', (0.30, 0.16, 0.24), R.MAT_DARK, own, par, loc, rot, bevel=0.02)
        bx('lamp-lens', (0.24, 0.04, 0.19), lens, own, par,
           (loc[0], loc[1] + 0.09, loc[2] - 0.03), rot, bevel=0.0)
        bx('lamp-bracket', (0.06, 0.10, 0.16), R.MAT_WORN, own, par,
           (loc[0], loc[1] - 0.09, loc[2] + 0.10), (0, 0, 0), bevel=0.01)


# ═══════════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════

def build(out_path):
    _bins.clear()
    del _order[:]
    R.reset()
    _measure_box_scale()

    # ── the dynamic spine ────────────────────────────────────────────────────
    # slew → mast rake → crowd sledge → rotary spindle → three Kelly stages.
    # gltfRig.js indexes these BY STRING; they are the contract.
    slew = R.empty(R.NODE_PIVOT, 'slew', None, (0, 0, 0))

    # The rake pivot sits at the leader foot, not at the origin. Everything
    # inside the mast is authored in absolute machine coordinates, so a second,
    # unprefixed node undoes the pin offset and the leader's own numbers stay
    # readable against the datasheet.
    yc = (MAST_FACE_Y + MAST_BACK_Y) / 2
    mast = R.empty(R.NODE_PIVOT, 'mast', slew, (0, yc, MAST_FOOT_Z))
    mast['rake_fwd_deg'] = 5.0        # [S1 p.10] the leader stands vertical and
    mast['rake_back_deg'] = 5.0       # trims a few degrees; it does NOT rake
    mast['rake_side_deg'] = 5.0       # like a driven-pile leader [S2 §5]
    frame = R.empty('', 'mast-frame', mast, (0, -yc, -MAST_FOOT_Z))

    # Carriage home = the BOTTOM of the crowd stroke, because gltfRig.js reads
    # carriageRange as [y, y + travel_m]. The drive's lower face is the
    # datasheet's reference, and it sits 0.70 m below the sledge origin.
    DRIVE_FACE_OFF = 0.70
    sledge_home = SLEDGE_LO_Z + DRIVE_FACE_OFF        # 4.33
    sledge = R.empty(R.NODE_SLIDE, 'carriage', frame, (0, 0, sledge_home))
    sledge['travel_m'] = CROWD_STROKE                 # 10.000 [S1 p.10]
    spindle = R.empty(R.NODE_PIVOT, 'spindle', sledge,
                      (0, DRILL_AXIS_Y, -DRIVE_FACE_OFF))
    spindle['rpm_max'] = RPM_MAX                      # 53 rpm [S1 p.11]
    spindle['torque_knm'] = TORQUE_KNM                # 385 kNm [S1 p.11]

    # Kelly hang height. With the drive at the bottom of its stroke the bar is
    # retracted and its drive stub is AT GRADE — head high, stub on the ground,
    # which is the pose [S2 §3] describes and the one the machine parks in.
    #   stub bottom 0.000 → head top 15.300 (= A) → outer-tube top 14.350
    #   spindle sits on the drive face at 3.630 → the tube top is 10.720 above.
    kelly_top = (KELLY_A - KELLY_HEAD_L) - SLEDGE_LO_Z

    # fixed references the game can ask for
    R.empty(R.NODE_MOUNT, 'drill-axis', slew, (0, DRILL_AXIS_Y, 0))
    R.empty(R.NODE_MOUNT, 'slew-centre', None, (0, 0, 0))

    build_undercarriage(None)
    build_upper(slew)
    build_aframe_and_kinematics(slew, mast)
    build_mast(frame)
    build_sledge_and_drive(sledge, spindle)
    build_kelly(spindle, kelly_top)
    build_ropes_and_hoses(frame, sledge_home,
                          SLEDGE_LO_Z + kelly_top + KELLY_HEAD_L)
    build_lamp_housings(slew, frame, sledge)
    build_lights(slew, frame, sledge)

    weld_all()
    return R.finish(out_path)


# ═══════════════════════════════════════════════════════════════════════════
#  HANDOVER NOTES — read before changing the game's spec row for this rig
# ═══════════════════════════════════════════════════════════════════════════
# 1. The spec row says weightKg 118000 / maxDepthM 68 / torqueKNm 360.  The
#    published pair for this machine is 112 t (basic, 1.5 m extension, 3-part
#    Kelly, 1 900 mm max Ø) and 131 t (upgraded, 3 m extension, 4-part Kelly,
#    2 500 mm max Ø) [S1 p.16].  118 t is between the two.  This model is the
#    UPGRADED machine, so 131 t would be the traceable number.
# 2. 68 m depth is real, but only with the longest 4-part bar in the table
#    (A = 20.3 m retracted, B = 69.8 m, 16 480 kg) AND the 3 m mast extension.
#    That bar is 5 m longer retracted than the one modelled here, and the game's
#    own kellyM (4 × 6.4 = 25.6 m) matches neither.  Pick one: either model the
#    20.3 m bar, or set maxDepthM to 48.
# 3. torqueKNm 360 sits between the two published drives (342 and 385 kNm).
#    Either is traceable; 360 is not.
# 4. rpmMax: tools.js derives 27 rpm; the published ceiling for the drives on
#    this machine is 40 and 53 rpm [S1 p.11].
