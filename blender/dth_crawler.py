"""dth_crawler - surface down-the-hole crawler blasthole drill.

In-game marque: "Brenner DH-750 Ironvein". Real class: mid-size surface DTH
crawler, ~22-24 t, boom-carried aluminium feed, on-board two-stage screw
compressor, cyclone dust collection.

=============================================================================
SOURCES  (DOMAIN.md S10: real names live in code comments ONLY - never in an
          object name, a material name, or any string that can reach a player)
=============================================================================
[R]   research/rigs/dth-crawler.md  - the owner's engineering reference for
      this machine, itself sourced from two OEM studio renders in Downloads
      plus a manufacturer brochure. Section numbers below are that file's.
[B]   Manufacturer brochure for a 22.6-24.1 t surface DTH crawler
      (Atlas Copco / Epiroc SmartROC D65, NV5038797_A49 + the Mk2 web
      brochure, spec pages "HEIGHT AND LENGTH" / "CARRIER" / "COMPRESSOR" /
      "ALUMINIUM FEED"). Reached through [R] S3; fetched again 2026-09-05.
[E]   Epiroc DTH product catalog.pdf p.20-21, 30-33 - hammer OD/length, drill
      pipe OD/length, the 90-254 mm DTH blasthole window.
[P1]  Downloads/Surface_Drill_Rig_1000_0001.jpg   - working pose, boom out.
[P2]  Downloads/surface-drill-rig-for-quarrying-and-mining-smartroc-d65-3d-
      model-77345d1f1d.webp - detail reference, boom folded, feed erect.
[H]   Bauer-Maschinen hydraulic hose catalogue - hose bundling, bulkhead
      plates, hose sizes (NS 6-100).

SCALE DECISION - read this before changing a number
---------------------------------------------------
[R] S3.2 says the game's carrier is correctly sized (2.65 m over tracks for a
19.5 t crawler, research/11 S D.3) and that the FEED, not the carrier, is what
is proportionally wrong: real feed = 3.76 x width over tracks, game = 2.72.
Its explicit recommendation: "raise the feed rather than shrink the carrier -
to hit the real proportion at the game's existing track width the feed should
be ~9.9 m". This model follows that instruction literally. So:

    W  = 2.650 m  width over tracks           (game carrier, research/11 band)
    k  = W / 2.500 = 1.060                    (brochure machine is 2.500 m [B])

Ratios from [R] S3.2 are applied to W directly. Brochure absolutes with no
ratio are scaled by k and marked "* k". CATALOGUE sizes - drill tube OD and
length, hammer OD, suction hose bore - are NOT scaled: they are standard
stock sizes and stay at their real values [E][B].

DRAW CALLS
----------
finish() joins statics by material, but anything under a pivot:/slide: node is
left alone, so every dynamic mesh is its own draw call. This file therefore
joins each dynamic subassembly by material itself (join_by_mat) and applies
modifiers first so per-part bevel widths survive the join.
"""

import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import bpy
from mathutils import Vector, Matrix
import rig as R

TAU = math.pi * 2

# ── master dimensions ────────────────────────────────────────────────────────
W          = 2.650      # width over tracks               [R]S3.1 ratio 1.00 W
K          = W / 2.500  # brochure -> game scale factor   1.060

SHOE_W     = 0.550      # track shoe width  research/11 S D.3 (NOT SOURCED for
                        # this class specifically - [R]S8 item 3)
GAUGE      = W - SHOE_W # 2.100 m between track centres
TRK_LEN    = 3.900      # track length over sprocket/idler. DERIVED: [R]S8
                        # item 4 says it is not sourced. 1.47 x W is the
                        # excavator-carrier norm and matches the game's 3.9.
TUMBLER_R  = 0.360      # sprocket / idler pitch radius. DERIVED from shoe
                        # width and the track height in [P2].
TUMBLER_Y  = (TRK_LEN - 2 * TUMBLER_R) / 2      # 1.590
SHOE_T     = 0.070      # shoe plate thickness   DERIVED from [P2]
TRK_TOP    = TUMBLER_R * 2 + SHOE_T             # 0.790 top of track envelope

DECK_Z     = 1.000      # main frame top face. DERIVED: track top + 0.21
                        # clearance for the oscillation trunnion, read off [P2]
FRAME_Z0   = 0.560      # frame belly - ground clearance. NOT SOURCED [R]S8 #5

BODY_W     = 2.440      # superstructure width - narrower than the tracks [P2]
BODY_Y0    = -2.680     # rear cooler face (overhangs the tracks) [P1][P2]
BODY_Y1    =  1.500     # front bulkhead, boom foot pins here
CANOPY_Z   = 2.820      # engine/compressor canopy roof. Must clear the dumped
                        # feed at H1 = 1.40 W = 3.71 m [R]S3.1/S3.2.
TRANSPORT_H = 1.40 * W  # 3.710  feed dumped [R]S3.2

FEED_LEN   = 3.76 * W   # 9.964  aluminium extrusion, constant section [R]S3.2
FEED_TRAV  = 2.16 * W   # 5.724  single-pass hole depth [R]S3.1/S3.2
FEED_EXT   = 1.900 * K  # 2.014  beam slides in its cradle [R]S3.1
FEED_SEC_W = 0.470      # extrusion across the flats. NOT SOURCED [R]S8 #8 -
FEED_SEC_D = 0.380      # derived from the carriage width in [P2].

REACH_MIN  = 1.08 * W   # 2.862  boom horizontal reach at 17 deg [R]S3.1
REACH_MAX  = 1.28 * W   # 3.392  ... at 25 deg
OSC        = 0.405 * K  # 0.429  track oscillation [R]S3.1

TUBE_OD    = 0.114      # 114 mm drill tube OD - CATALOGUE, not scaled [E]p.33
TUBE_LEN   = 5.000      # 5 m tube - CATALOGUE [B]. Pairs with FEED_TRAV:
                        # 5.00 tube + 0.72 head/carriage = 5.72 travel.
SUCT_D     = 0.203      # 203 mm dust suction hose - CATALOGUE [B]/[R]S4.5

CAB_W, CAB_D, CAB_H = 1.140, 1.460, 1.980   # NOT SOURCED [R]S8 #6; derived
                                            # from a 1.9 m operator in [P2]

# where things sit along the machine (machine faces +Y; Blender Z is up)
CAB_X      =  0.640     # cab offset to the right of centreline [R]S1 "cab at
                        # the front-right". Side is NOT SOURCED - [R]S8 #6.
CAB_Y      =  0.720
BOOM_X     = -0.320     # boom foot left of centreline so the operator in the
                        # right-hand cab sees the collar past it [P1][P2]
BOOM_FOOT  = (BOOM_X, 1.380, 1.180)   # boom foot pin, on the front bulkhead
BOOM_LEN   = 3.200      # gives a collar ~3.1 m ahead of the foot, inside the
                        # 2.86-3.39 m sourced reach envelope [R]S3.1
BOOM_RISE  = math.radians(17.0)   # rest attitude; 17 deg is a quoted feed
                                  # angle in the brochure diagrams [R]S4.2

MAT = R  # shorthand for the material constants


# ═════════════════════════════════════════════════════════════════════════════
# small build helpers
# ═════════════════════════════════════════════════════════════════════════════

def bake(o):
    """Apply every modifier on o, so a later join cannot silently drop it."""
    if o.type != 'MESH' or not o.modifiers:
        return o
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            o.modifiers.remove(m)
    return o


def to_mesh(o):
    """Convert a CURVE (every hose and rope is one) to a real mesh.

    rig.finish() and join_by_mat both only look at MESH objects, so an
    unconverted hose exports as its own draw call. Fourteen hoses is fourteen
    draw calls out of a budget of seventy - converting them first lets them
    collapse into the single 'rubber' primitive they belong in.
    """
    if o.type != 'CURVE':
        return o
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.select_all(action='DESELECT')
    return o


def bake_all():
    for o in list(bpy.context.scene.objects):
        to_mesh(o)
    for o in list(bpy.context.scene.objects):
        bake(o)


def join_by_mat(parent, label):
    """Join every MESH child of `parent` by material.

    finish() refuses to touch anything under a pivot:/slide: node, so a
    dynamic subassembly would otherwise export one draw call per box. This
    collapses it to one per material, which is the floor.
    """
    for o in list(parent.children):
        to_mesh(o)
    kids = [o for o in parent.children if o.type == 'MESH']
    for o in kids:
        bake(o)
    groups = {}
    for o in kids:
        key = o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault(key, []).append(o)
    out = []
    for key, objs in groups.items():
        if len(objs) > 1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in objs:
                o.select_set(True)
            bpy.context.view_layer.objects.active = objs[0]
            bpy.ops.object.join()
            objs[0].name = '%s_%s' % (label, key)
        else:
            objs[0].name = '%s_%s' % (label, key)
        out.append(objs[0])
    bpy.ops.object.select_all(action='DESELECT')
    return out


def cyl(name, r, h, mat, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), sides=12):
    return R.tube(name, r, h, mat, parent, loc, rot, sides)


def cheapbox(name, size, mat, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), bev=0.005):
    """A box with a ONE-segment bevel. Used where a part is repeated dozens of
    times (track shoes, chain links, tube racks): a 2-segment bevel there costs
    ~130 tris a piece and buys nothing at the distance the part is ever seen."""
    o = R.box(name, size, mat, parent, loc, rot, bevel=0.0)
    if bev > 0:
        m = o.modifiers.new('bev', 'BEVEL')
        m.width = bev
        m.segments = 1
        m.limit_method = 'ANGLE'
    return o


def plate(name, size, mat, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), bev=0.006):
    return R.box(name, size, mat, parent, loc, rot, bevel=bev)


def torus_ring(name, major, minor, mat, parent=None, loc=(0, 0, 0),
               rot=(0, 0, 0), maj=16, min_=8):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=maj, minor_segments=min_)
    o = bpy.context.active_object
    return R.part(name, o, mat, parent, loc, rot)


def louvres(parent, name, count, x, y0, y1, z0, z1, mat=R.MAT_DARK, depth=0.030):
    """A run of pressed intake louvres. Costs triangles, not draw calls - the
    louvred flank is what makes the canopy read as an air package [R]S4.4."""
    n = max(2, count)
    step = (z1 - z0) / n
    out = []
    for i in range(n):
        z = z0 + step * (i + 0.5)
        o = R.box('%s_l%d' % (name, i), (depth, y1 - y0, step * 0.62), mat,
                  parent, (x, (y0 + y1) / 2, z), (math.radians(-24), 0, 0),
                  bevel=0.004)
        out.append(o)
    return out


def bolt_ring(parent, name, radius, count, r_bolt, h, mat, loc, rot=(0, 0, 0)):
    """A ring of hex-ish bolt heads round a flange. Pure triangle spend."""
    out = []
    for i in range(count):
        a = TAU * i / count
        o = cyl('%s_b%d' % (name, i), r_bolt, h, mat, parent,
                (loc[0] + radius * math.cos(a), loc[1] + radius * math.sin(a),
                 loc[2]), rot, sides=6)
        out.append(o)
    return out


# ═════════════════════════════════════════════════════════════════════════════
# 1. UNDERCARRIAGE
#    Excavator-type: drive sprocket one end, idler the other, track rollers
#    along the bottom, carrier rollers on top, deep single-grouser shoes on a
#    sealed chain [R]S4.8, both photographs. Track frames and guards are DARK,
#    shoes and chain are bare WORN steel - the paint survives almost nowhere
#    below the top of the frame [R]S6.1.
#
#    The whole undercarriage hangs off pivot:oscillation. [R]S3.1 gives 405 mm
#    of track oscillation (* k = 0.429 m): on a broken bench the frames roll
#    relative to the body, which is a real articulation and one of the reasons
#    this machine can stand on a blasted floor at all.
# ═════════════════════════════════════════════════════════════════════════════

def track_path_points(n):
    """Centreline of the chain: two straights joined by two half-wraps."""
    pts = []
    straight = TUMBLER_Y * 2
    arc = math.pi * TUMBLER_R
    total = straight * 2 + arc * 2
    for i in range(n):
        s = total * i / n
        if s < straight:                                   # bottom run, -Y->+Y
            pts.append((-TUMBLER_Y + s, TUMBLER_R, -math.pi / 2))
        elif s < straight + arc:                           # front idler wrap
            a = (s - straight) / TUMBLER_R
            pts.append((TUMBLER_Y + TUMBLER_R * math.sin(a),
                        TUMBLER_R - TUMBLER_R * (1 - math.cos(a)) + 0,
                        -math.pi / 2 + a))
        elif s < straight * 2 + arc:                       # top run, +Y->-Y
            t = s - straight - arc
            pts.append((TUMBLER_Y - t, -TUMBLER_R, math.pi / 2))
        else:                                              # rear sprocket wrap
            a = (s - straight * 2 - arc) / TUMBLER_R
            pts.append((-TUMBLER_Y - TUMBLER_R * math.sin(a),
                        -TUMBLER_R + TUMBLER_R * (1 - math.cos(a)),
                        math.pi / 2 + a))
    # y above is measured from the tumbler axis; lift to world Z
    return [(y, TUMBLER_R + z, ang) for (y, z, ang) in pts]


def build_track(parent, side):
    """One track frame: chain of grouser shoes, tumblers, rollers, guards."""
    sx = side * GAUGE / 2
    tag = 'l' if side < 0 else 'r'
    o = []

    # -- track frame box and its roller guard skirt ---------------------------
    o.append(R.box('trkframe_%s' % tag, (0.320, TRK_LEN - 0.45, 0.400),
                   R.MAT_DARK, parent, (sx, 0, TUMBLER_R + 0.055), bevel=0.022))
    o.append(R.box('trkguard_%s' % tag, (0.560, TRK_LEN * 0.52, 0.140),
                   R.MAT_DARK, parent, (sx, 0.10, TUMBLER_R + 0.335), bevel=0.014))
    # track adjuster / idler yoke housing at the front
    o.append(R.box('trkadj_%s' % tag, (0.240, 0.560, 0.230), R.MAT_DARK, parent,
                   (sx, TUMBLER_Y - 0.30, TUMBLER_R), bevel=0.014))

    # -- drive sprocket (rear) and idler (front) ------------------------------
    # Sprocket at the rear is the excavator convention with the idler leading.
    # NOT SOURCED for this class - derived from [P2].
    for end, r, nm in ((-TUMBLER_Y, TUMBLER_R, 'spr'), (TUMBLER_Y, TUMBLER_R, 'idl')):
        o.append(cyl('%s_hub_%s' % (nm, tag), r * 0.62, 0.300, R.MAT_CAST, parent,
                     (sx - 0.150, end, TUMBLER_R), (0, math.radians(90), 0),
                     sides=16))
        o.append(cyl('%s_rim_%s' % (nm, tag), r * 0.93, 0.150, R.MAT_WORN, parent,
                     (sx - 0.075, end, TUMBLER_R), (0, math.radians(90), 0),
                     sides=18))
        o += bolt_ring(parent, '%s_bolt_%s' % (nm, tag), r * 0.40, 8, 0.026,
                       0.030, R.MAT_WORN,
                       (sx + 0.152, end, TUMBLER_R), (0, math.radians(90), 0))
    # sprocket teeth - an ARRAY around the rear tumbler, radially placed
    for i in range(18):
        a = TAU * i / 18
        o.append(cheapbox('sprtooth_%s%d' % (tag, i), (0.140, 0.070, 0.090),
                       R.MAT_WORN, parent,
                       (sx, -TUMBLER_Y + (TUMBLER_R * 0.99) * math.sin(a),
                        TUMBLER_R + (TUMBLER_R * 0.99) * math.cos(a)),
                       (a, 0, 0), bev=0.008))

    # -- bottom track rollers and top carrier rollers -------------------------
    nrol = 7                       # NOT SOURCED [R]S8 #4 - derived from a
    for i in range(nrol):          # 3.9 m frame at the usual ~0.45 m pitch
        y = -TUMBLER_Y + 0.34 + (TUMBLER_Y * 2 - 0.68) * i / (nrol - 1)
        o.append(cyl('rol_%s%d' % (tag, i), 0.115, 0.230, R.MAT_CAST, parent,
                     (sx - 0.115, y, 0.150), (0, math.radians(90), 0), sides=12))
    for i, y in enumerate((-0.72, 0.86)):
        o.append(cyl('carrol_%s%d' % (tag, i), 0.085, 0.170, R.MAT_CAST, parent,
                     (sx - 0.085, y, TUMBLER_R * 2 - 0.055),
                     (0, math.radians(90), 0), sides=10))

    # -- the chain: a grouser shoe per link, placed on the real path ----------
    shoes = 48                     # pitch ~0.19 m round a 9.26 m perimeter
    for i, (y, z, ang) in enumerate(track_path_points(shoes)):
        o.append(cheapbox('shoe_%s%d' % (tag, i), (SHOE_W, 0.185, SHOE_T),
                          R.MAT_WORN, parent, (sx, y, z), (ang + math.pi / 2, 0, 0),
                          bev=0.006))
        o.append(cheapbox('grouser_%s%d' % (tag, i), (SHOE_W * 0.94, 0.045, 0.058),
                          R.MAT_WORN, parent,
                          (sx, y + math.cos(ang + math.pi / 2) * 0.055,
                           z + math.sin(ang + math.pi / 2) * 0.055),
                          (ang + math.pi / 2, 0, 0), bev=0.0))
    return o


def build_undercarriage(root):
    osc = R.empty(R.NODE_PIVOT, 'oscillation', root, (0, 0.10, TRK_TOP * 0.5))
    osc['osc_m'] = OSC                      # 405 mm * k [R]S3.1
    for side in (-1, 1):
        build_track(osc, side)
    # the oscillation trunnion itself - a longitudinal tube through the frame
    cyl('osc_trunnion', 0.130, GAUGE + 0.20, R.MAT_CAST, osc,
        (-(GAUGE + 0.20) / 2, 0.10, 0.0), (0, math.radians(90), 0), sides=14)
    join_by_mat(osc, 'under')
    return osc


# ═════════════════════════════════════════════════════════════════════════════
# 2. MAIN FRAME + SUPERSTRUCTURE
#    "The body is a long, high, closed box - much bulkier than an excavator of
#    the same track size - because the compressor and its coolers live in it.
#    Big louvred flanks and a rear cooler face. The machine looks nose-light
#    and tail-heavy." [R]S5 item 2.
#    Two-tone: PAINT above the deck line, DARK below it. The colour never
#    reaches the ground [R]S5 item 4 / S6.1.
# ═════════════════════════════════════════════════════════════════════════════

def build_frame(root):
    o = []
    # main frame between the tracks - dark, structural, sits on the oscillation
    o.append(R.box('mainframe', (GAUGE - 0.28, TRK_LEN + 0.10, DECK_Z - FRAME_Z0),
                   R.MAT_DARK, root, (0, -0.10, (DECK_Z + FRAME_Z0) / 2),
                   bevel=0.026))
    # cross members out to the track frames, and the belly guard
    for y in (-1.42, 1.30):
        o.append(R.box('xmember_%d' % int(y * 10), (W - 0.30, 0.300, 0.260),
                       R.MAT_DARK, root, (0, y, FRAME_Z0 + 0.14), bevel=0.016))
    o.append(R.box('bellyguard', (GAUGE - 0.34, 2.60, 0.055), R.MAT_DARK, root,
                   (0, -0.20, FRAME_Z0 - 0.02), bevel=0.010))
    # deck plate - the walking surface, chequer, dust-covered
    o.append(R.box('deckplate', (BODY_W, BODY_Y1 - BODY_Y0, 0.055), R.MAT_DARK,
                   root, (0, (BODY_Y0 + BODY_Y1) / 2, DECK_Z - 0.027),
                   bevel=0.008))
    return o


def build_canopy(root):
    """Engine + two-stage screw compressor canopy: 403 kW diesel, FAD 470 l/s
    at 30 bar [R]S3.1/S4.4. This is the dominant mass of the machine."""
    o = []
    cy0, cy1 = BODY_Y0, 0.320          # canopy runs from cooler face to cab
    cw = BODY_W
    # main canopy shell
    o.append(R.box('canopy', (cw, cy1 - cy0, CANOPY_Z - DECK_Z), R.MAT_PAINT,
                   root, (0, (cy0 + cy1) / 2, (DECK_Z + CANOPY_Z) / 2),
                   bevel=0.045))
    # roof cap with a slight crown and a raised lip round the edge
    o.append(R.box('canopyroof', (cw + 0.06, cy1 - cy0 + 0.06, 0.070),
                   R.MAT_PAINT, root, (0, (cy0 + cy1) / 2, CANOPY_Z + 0.020),
                   bevel=0.018))
    # service door frames on both flanks - shut lines are what stop a canopy
    # reading as one extruded box [P2]
    for side in (-1, 1):
        for i, (y0, y1) in enumerate(((-2.52, -1.46), (-1.38, -0.36))):
            o.append(R.box('doorframe%d_%d' % (i, side),
                           (0.030, y1 - y0, CANOPY_Z - DECK_Z - 0.30),
                           R.MAT_PAINT, root,
                           (side * (cw / 2 + 0.006), (y0 + y1) / 2,
                            (DECK_Z + CANOPY_Z) / 2 - 0.02), bevel=0.010))
            # latch and hinge hardware
            o.append(R.box('latch%d_%d' % (i, side), (0.045, 0.090, 0.150),
                           R.MAT_WORN, root,
                           (side * (cw / 2 + 0.028), y1 - 0.10,
                            (DECK_Z + CANOPY_Z) / 2), bevel=0.006))
        # intake louvres over the compressor bay
        o += louvres(root, 'lv%d' % side, 9, side * (cw / 2 + 0.014),
                     -2.44, -1.54, DECK_Z + 0.34, CANOPY_Z - 0.30)
        o += louvres(root, 'lw%d' % side, 6, side * (cw / 2 + 0.014),
                     -1.30, -0.44, DECK_Z + 0.52, CANOPY_Z - 0.42)

    # rear cooler face: engine radiator + oil cooler + compressor aftercooler,
    # all behind one big mesh grille [R]S4.4
    o.append(R.box('coolerframe', (cw - 0.10, 0.090, CANOPY_Z - DECK_Z - 0.22),
                   R.MAT_DARK, root, (0, cy0 - 0.048, (DECK_Z + CANOPY_Z) / 2),
                   bevel=0.014))
    for i in range(11):
        z = DECK_Z + 0.16 + (CANOPY_Z - DECK_Z - 0.38) * i / 10
        o.append(R.box('coolerbar%d' % i, (cw - 0.22, 0.030, 0.052),
                       R.MAT_STEEL, root, (0, cy0 - 0.088, z), bevel=0.006))
    for i in range(9):
        x = -(cw - 0.22) / 2 + (cw - 0.22) * i / 8
        o.append(R.box('coolerv%d' % i, (0.030, 0.026, CANOPY_Z - DECK_Z - 0.38),
                       R.MAT_STEEL, root, (x, cy0 - 0.086,
                       (DECK_Z + CANOPY_Z) / 2 - 0.01), bevel=0.005))

    # vertical exhaust stack behind the cab, with a rain cap. Heat-discoloured
    # near the top [R]S4.4 / S6.2 - a WORN, unpainted part.
    sx, sy = CAB_X - 0.10, CAB_Y - CAB_D / 2 - 0.34
    o.append(cyl('exh_lag', 0.115, 0.42, R.MAT_DARK, root, (sx, sy, CANOPY_Z - 0.30), sides=12))
    o.append(cyl('exh_stack', 0.082, 0.84, R.MAT_WORN, root, (sx, sy, CANOPY_Z + 0.10), sides=12))
    o.append(cyl('exh_cap', 0.108, 0.055, R.MAT_WORN, root, (sx, sy, CANOPY_Z + 0.93), sides=12))
    o.append(torus_ring('exh_clamp', 0.088, 0.014, R.MAT_WORN, root,
                        (sx, sy, CANOPY_Z + 0.42)))

    # heavy-duty air intake pre-cleaner cans on the roof [R]S4.4 (listed option)
    for i, x in enumerate((-0.62, -0.10)):
        o.append(cyl('precln%d' % i, 0.155, 0.400, R.MAT_PAINT, root,
                     (x, -2.06, CANOPY_Z + 0.055), sides=14))
        o.append(cyl('preclncap%d' % i, 0.170, 0.055, R.MAT_DARK, root,
                     (x, -2.06, CANOPY_Z + 0.455), sides=14))
    # air receiver lying along the roof, feeding the line forward to the head
    o.append(cyl('receiver', 0.215, 1.30, R.MAT_PAINT, root,
                 (0.86, -2.42, CANOPY_Z + 0.28), (math.radians(-90), 0, 0),
                 sides=16))
    o.append(torus_ring('recv_end', 0.215, 0.030, R.MAT_PAINT, root,
                        (0.86, -1.14, CANOPY_Z + 0.28), (math.radians(90), 0, 0)))
    return o


def build_cab(root):
    """Small, tall and glassy, set to one side so the operator sees the collar
    past the feed. ROPS/FOPS on rubber dampers; laminated front and ROOF glass
    (he watches the head climb the feed); toughened sides and rear; a steel
    FOPS mesh guard across the windscreen [R]S4.6.
    GLASS never gets transmission - see rig.py contract 2."""
    o = []
    x0, x1 = CAB_X - CAB_W / 2, CAB_X + CAB_W / 2
    y0, y1 = CAB_Y - CAB_D / 2, CAB_Y + CAB_D / 2
    z0 = DECK_Z + 0.070                      # rubber vibration dampers
    z1 = z0 + CAB_H
    # dampers
    for dx in (x0 + 0.16, x1 - 0.16):
        for dy in (y0 + 0.16, y1 - 0.16):
            o.append(cyl('cabdamp', 0.058, 0.070, R.MAT_RUBBER, root,
                         (dx, dy, DECK_Z), sides=8))
    # floor pan, roof, and the ROPS post cage. Posts are structure, not trim.
    o.append(R.box('cabfloor', (CAB_W, CAB_D, 0.075), R.MAT_PAINT, root,
                   (CAB_X, CAB_Y, z0 + 0.037), bevel=0.012))
    o.append(R.box('cabroof', (CAB_W + 0.045, CAB_D + 0.045, 0.085), R.MAT_PAINT,
                   root, (CAB_X, CAB_Y, z1 - 0.042), bevel=0.020))
    post = 0.072
    for px in (x0 + post / 2, x1 - post / 2):
        for py in (y0 + post / 2, y1 - post / 2):
            o.append(R.box('rops', (post, post, CAB_H - 0.12), R.MAT_PAINT, root,
                           (px, py, (z0 + z1) / 2), bevel=0.010))
    # rear and lower-front panels are steel; the rest is glass
    o.append(R.box('cabrear', (CAB_W - 0.10, 0.055, CAB_H * 0.42), R.MAT_PAINT,
                   root, (CAB_X, y0 + 0.030, z0 + CAB_H * 0.23), bevel=0.010))
    o.append(R.box('cabkick', (CAB_W - 0.10, 0.050, 0.330), R.MAT_PAINT, root,
                   (CAB_X, y1 - 0.026, z0 + 0.20), bevel=0.010))
    # glazing: front (laminated), two sides (toughened), rear, and the roof
    o.append(R.box('glass_front', (CAB_W - 0.13, 0.022, CAB_H - 0.60),
                   R.MAT_GLASS, root, (CAB_X, y1 - 0.016, z0 + 0.38 + (CAB_H - 0.60) / 2),
                   bevel=0.004))
    for side, px in ((-1, x0 + 0.017), (1, x1 - 0.017)):
        o.append(R.box('glass_side%d' % side, (0.022, CAB_D - 0.20, CAB_H - 0.72),
                       R.MAT_GLASS, root, (px, CAB_Y + 0.02, z0 + 0.46 + (CAB_H - 0.72) / 2),
                       bevel=0.004))
    o.append(R.box('glass_rear', (CAB_W - 0.22, 0.020, CAB_H * 0.36), R.MAT_GLASS,
                   root, (CAB_X, y0 + 0.016, z1 - 0.16 - CAB_H * 0.18), bevel=0.004))
    o.append(R.box('glass_roof', (CAB_W - 0.26, CAB_D * 0.56, 0.020), R.MAT_GLASS,
                   root, (CAB_X, CAB_Y + 0.16, z1 - 0.088), bevel=0.004))
    # FOPS mesh guard across the windscreen - a dark grid, clearly visible [P2]
    for i in range(7):
        o.append(R.box('fops_v%d' % i, (0.022, 0.022, CAB_H - 0.56), R.MAT_STEEL,
                       root, (x0 + 0.09 + (CAB_W - 0.18) * i / 6, y1 + 0.055,
                              z0 + 0.40 + (CAB_H - 0.60) / 2), bevel=0.003))
    for i in range(5):
        o.append(R.box('fops_h%d' % i, (CAB_W - 0.14, 0.020, 0.020), R.MAT_STEEL,
                       root, (CAB_X, y1 + 0.055,
                              z0 + 0.46 + (CAB_H - 0.72) * i / 4), bevel=0.003))
    for dz in (0.34, CAB_H - 0.30):
        o.append(R.box('fops_arm', (0.030, 0.075, 0.030), R.MAT_STEEL, root,
                       (x0 + 0.09, y1 + 0.020, z0 + dz), bevel=0.004))
        o.append(R.box('fops_arm', (0.030, 0.075, 0.030), R.MAT_STEEL, root,
                       (x1 - 0.09, y1 + 0.020, z0 + dz), bevel=0.004))
    # two wipers with washer [R]S4.6, and the door handle + mirror
    o.append(cyl('wiper_arm', 0.014, 0.62, R.MAT_WORN, root,
                 (CAB_X - 0.28, y1 + 0.030, z0 + 0.52),
                 (math.radians(-88), 0, math.radians(28)), sides=6))
    o.append(cyl('wiper_arm2', 0.012, 0.44, R.MAT_WORN, root,
                 (CAB_X + 0.30, y1 + 0.030, z1 - 0.26),
                 (math.radians(-92), 0, math.radians(-150)), sides=6))
    o.append(R.box('cabhandle', (0.035, 0.030, 0.230), R.MAT_WORN, root,
                   (x1 + 0.028, CAB_Y - 0.22, z0 + 0.98), bevel=0.006))
    o.append(cyl('mirror_stem', 0.016, 0.30, R.MAT_WORN, root,
                 (x1 - 0.02, y1 - 0.10, z1 - 0.06), (0, math.radians(58), 0), sides=6))
    o.append(R.box('mirror', (0.030, 0.130, 0.190), R.MAT_STEEL, root,
                   (x1 + 0.26, y1 - 0.10, z1 + 0.06), bevel=0.008))
    # amber beacon on the roof
    o.append(cyl('beacon_base', 0.045, 0.055, R.MAT_DARK, root,
                 (CAB_X - 0.34, y0 + 0.20, z1), sides=10))
    o.append(cyl('beacon', 0.052, 0.110, R.MAT_HAZARD, root,
                 (CAB_X - 0.34, y0 + 0.20, z1 + 0.052), sides=10))
    return o


def build_access(root):
    """Walkway, canopy handrails, ladder and the toe boards. [R]S4.7 -
    "Protection hand rails on top of canopy"; steps up to the cab door.
    Handrails are painted tube worn to bare metal exactly where hands go."""
    o = []
    # handrail run along the canopy roof
    rail_pts = [(-1.06, -2.50), (-1.06, 0.16), (1.06, 0.16), (1.06, -2.50)]
    for i, (rx, ry) in enumerate(rail_pts):
        o.append(cyl('rail_post%d' % i, 0.026, 1.020, R.MAT_PAINT, root,
                     (rx, ry, CANOPY_Z + 0.055), sides=8))
    def rail_run(a, b, z, r=0.026, mat=R.MAT_PAINT):
        ax, ay = a; bx, by = b
        d = math.hypot(bx - ax, by - ay)
        ang = math.atan2(by - ay, bx - ax)
        return cyl('rail', r, d, mat, root, (ax, ay, z),
                   (0, math.radians(90), ang), sides=8)
    for z in (CANOPY_Z + 1.075, CANOPY_Z + 0.60):
        for i in range(len(rail_pts) - 1):
            o.append(rail_run(rail_pts[i], rail_pts[i + 1], z))
    # toe board round the roof edge
    o.append(R.box('toeboard', (0.030, 2.66, 0.110), R.MAT_HAZARD, root,
                   (-1.09, -1.17, CANOPY_Z + 0.11), bevel=0.006))
    o.append(R.box('toeboard2', (0.030, 2.66, 0.110), R.MAT_HAZARD, root,
                   (1.09, -1.17, CANOPY_Z + 0.11), bevel=0.006))
    # walkway grating along the left flank at deck level
    for i in range(9):
        o.append(R.box('grate%d' % i, (0.46, 0.055, 0.030), R.MAT_STEEL, root,
                       (-BODY_W / 2 - 0.22, -2.30 + 0.30 * i, DECK_Z + 0.010),
                       bevel=0.004))
    o.append(R.box('gratekerb', (0.030, 2.60, 0.070), R.MAT_HAZARD, root,
                   (-BODY_W / 2 - 0.44, -1.10, DECK_Z + 0.030), bevel=0.005))
    # ladder up the right flank to the cab door
    lx = BODY_W / 2 + 0.14
    for side in (-1, 1):
        o.append(cyl('ladstile%d' % side, 0.024, 1.10, R.MAT_PAINT, root,
                     (lx, CAB_Y - 0.30 + side * 0.22, DECK_Z - 1.02), sides=8))
    for i in range(3):
        o.append(cyl('ladrung%d' % i, 0.019, 0.44, R.MAT_WORN, root,
                     (lx, CAB_Y - 0.52, DECK_Z - 0.92 + 0.31 * i),
                     (math.radians(-90), 0, 0), sides=8))
    o.append(R.box('ladstep', (0.34, 0.42, 0.035), R.MAT_STEEL, root,
                   (lx + 0.02, CAB_Y - 0.30, DECK_Z + 0.014), bevel=0.005))
    # grab handle beside the cab door
    o.append(cyl('grab', 0.020, 0.86, R.MAT_PAINT, root,
                 (CAB_X + CAB_W / 2 + 0.075, CAB_Y + 0.24, DECK_Z + 0.30), sides=8))
    return o


def aim_tube(name, r, a, b, mat, parent=None, sides=10, shrink=0.0):
    """A cylinder spanning two points. Cylinders that actually connect the lugs
    they are pinned to is most of what makes a linkage read as a mechanism
    instead of a pile of tubes."""
    a = Vector(a)
    b = Vector(b)
    d = b - a
    L = d.length - shrink
    rot = d.to_track_quat('Z', 'Y').to_euler()
    return R.tube(name, r, L, mat, parent, a, rot, sides)


def aim_box(name, w, d, a, b, mat, parent=None, bev=0.012):
    """A box section spanning two points, the box's local +Z along the span."""
    a = Vector(a)
    b = Vector(b)
    v = b - a
    L = v.length
    rot = v.to_track_quat('Z', 'Y').to_euler()
    o = R.box(name, (w, d, L), mat, parent, (0, 0, 0), rot, bevel=bev)
    o.location = a + v * 0.5
    return o


# =============================================================================
# 3. BOOM  -  the component the game is missing entirely ([R]S9.2)
#
#    "A heavy fabricated steel box-section boom, dark grey, pinned to the front
#    of the carrier body. It carries the feed cradle at its outer end through a
#    swing/dump joint... Underneath it sits a large boom lift cylinder."
#    [R]S4.2. The gap of daylight between the beam and the carrier, spanned by
#    the boom, is the single most identifying feature of the class [R]S5 #1.
#
#    Sourced envelope: horizontal reach 2,700-3,190 mm, vertical reach
#    1,040 mm up / 2,659 mm down [R]S3.1. Boom cross-section, pin diameters and
#    cylinder bores are NOT SOURCED ([R]S8 #7) - derived from [P1]/[P2].
#
#    REST POSE CONVENTION: every game-driven pivot: node on the boom sits at
#    IDENTITY rotation and the rest attitude is carried by the GEOMETRY inside
#    it. So a game that writes absolute rotations onto pivot:boomLift or
#    pivot:mast cannot accidentally fold the machine. The two ram nodes are the
#    documented exception - an aim node has to carry its aim.
# =============================================================================

BOOM_END = (0.0, BOOM_LEN * math.cos(BOOM_RISE), BOOM_LEN * math.sin(BOOM_RISE))
UY = math.cos(BOOM_RISE)               # unit step along the boom, Y component
UZ = math.sin(BOOM_RISE)               # ... and Z
FEED_X = BOOM_X                        # beam axis, in line with the boom
FEED_Y = BOOM_FOOT[1] + BOOM_END[1] + 0.320
# 3.38 m ahead of the boom foot pin - inside the sourced 2.86-3.39 m envelope,
# and 2.6 m of daylight ahead of the track front, which is the silhouette.
FEED_GRIP = 2.256                      # height up the beam at which the cradle
                                       # grips it, so the foot lands at grade
                                       # (mast pivot sits at z = 2.316)
BW, BD = 0.430, 0.470                  # boom box section across / deep


def build_boom(root):
    """Build the boom. Returns pivot:mast - what the feed assembly hangs on."""
    fx, fy, fz = BOOM_FOOT
    ex, ey, ez = BOOM_END

    # ---- foot: two cheek plates and a pin boss on the front bulkhead -------
    for s in (-1, 1):
        R.box('boomcheek%d' % s, (0.040, 0.560, 0.640), R.MAT_DARK, root,
              (fx + s * (BW / 2 + 0.055), fy - 0.14, fz), bevel=0.012)
    cyl('boompin_boss', 0.110, BW + 0.19, R.MAT_DARK, root,
        (fx - (BW + 0.19) / 2, fy, fz), (0, math.radians(90), 0), sides=14)
    for s in (-1, 1):                                  # ram foot bracket
        R.box('rambkt%d' % s, (0.035, 0.320, 0.300), R.MAT_DARK, root,
              (fx + s * 0.145, fy - 0.62, fz - 0.300), bevel=0.010)

    swing = R.empty(R.NODE_PIVOT, 'boomSwing', root, (fx, fy, fz))
    swing['range_deg'] = 30.0          # boom slew about the foot pin
    lift = R.empty(R.NODE_PIVOT, 'boomLift', swing, (0, 0, 0))
    lift['up_m'] = 1.040 * K           # vertical reach above track level
    lift['down_m'] = 2.659 * K         # ... and below [R]S3.1

    # ---- box section: heavy root, slimmer outer, with flange plates --------
    aim_box('boomroot', BW, BD, (0, 0.06, 0.02), (0, UY * 1.95, UZ * 1.95),
            R.MAT_DARK, lift, bev=0.026)
    aim_box('boomouter', BW - 0.085, BD - 0.095, (0, UY * 1.90, UZ * 1.90),
            (ex, ey, ez), R.MAT_DARK, lift, bev=0.022)
    for s in (-1, 1):                  # top / bottom flange strips
        aim_box('boomflange%d' % s, BW + 0.030, 0.028,
                (0, 0.10, 0.02 + s * BD / 2),
                (ex, ey - 0.05, ez + s * (BD - 0.10) / 2), R.MAT_DARK, lift,
                bev=0.006)
    for s in (-1, 1):                  # web gussets at the section step
        R.box('boomgus%d' % s, (0.028, 0.420, 0.230), R.MAT_DARK, lift,
              (s * BW / 2, UY * 1.92, UZ * 1.92 + 0.10), (BOOM_RISE, 0, 0),
              bevel=0.008)
    lugp = (0.0, UY * 1.85, UZ * 1.85 - BD / 2 - 0.05)
    for s in (-1, 1):                  # lug the lift ram pulls on
        R.box('boomlug%d' % s, (0.032, 0.240, 0.190), R.MAT_DARK, lift,
              (s * 0.115, lugp[1], lugp[2]), (BOOM_RISE, 0, 0), bevel=0.008)
    cyl('boomlugpin', 0.052, 0.330, R.MAT_STEEL, lift, (-0.165, lugp[1], lugp[2]),
        (0, math.radians(90), 0), sides=10)

    # ---- hose deflection shoe and tray on the boom top ---------------------
    # [H] calls it a Schlauchumlenkung: a roller that sets the bend radius
    # where the hose package leaves the carrier.
    cyl('hosedeflect', 0.085, 0.400, R.MAT_WORN, lift,
        (-0.20, UY * 0.70, UZ * 0.70 + BD / 2 + 0.06),
        (0, math.radians(90), 0), sides=12)
    R.box('hosetray', (0.360, 1.60, 0.030), R.MAT_DARK, lift,
          (0, UY * 1.35, UZ * 1.35 + BD / 2 + 0.02), (BOOM_RISE, 0, 0),
          bevel=0.006)

    # ---- central lubrication manifold and its fan of nylon lines [R]S4.7 ---
    R.box('lubeblock', (0.150, 0.190, 0.110), R.MAT_CAST, lift,
          (0.22, UY * 0.55, UZ * 0.55 + 0.10), (BOOM_RISE, 0, 0), bevel=0.008)
    for i in range(6):
        R.hose('lubeline%d' % i,
               [(0.22 + 0.018 * i, UY * 0.55, UZ * 0.55 + 0.16),
                (0.26 + 0.026 * i, UY * 1.30, UZ * 1.30 + 0.20 + 0.018 * i),
                (0.20, UY * 2.25 + 0.04 * i, UZ * 2.25 + 0.02)],
               radius=0.007, mat=R.MAT_RUBBER, parent=lift, sides=4)

    # ---- main hose package along the boom, bundled, not loose [H] ----------
    # A few fat lines (NS 32-50, 420 bar) and several thin ones - never a
    # uniform bundle of same-diameter tubes.
    for i, (r, dx) in enumerate(((0.036, -0.105), (0.036, -0.032),
                                 (0.028, 0.038), (0.020, 0.090),
                                 (0.020, 0.126))):
        R.hose('boomhose%d' % i,
               [(dx, -0.05, BD / 2 - 0.02),
                (dx, UY * 0.75, UZ * 0.75 + BD / 2 + 0.16),
                (dx, UY * 1.85, UZ * 1.85 + BD / 2 + 0.10),
                (dx, ey - 0.10, ez + 0.16)],
               radius=r, mat=R.MAT_RUBBER, parent=lift, sides=6)
    # the fat air line to the rotary head - 470 l/s at 30 bar [R]S3.1, and
    # visibly the thickest flexible on the machine after the dust hose.
    R.hose('airline',
           [(0.20, -0.10, BD / 2),
            (0.20, UY * 0.90, UZ * 0.90 + BD / 2 + 0.22),
            (0.20, UY * 2.00, UZ * 2.00 + BD / 2 + 0.12),
            (0.16, ey - 0.08, ez + 0.22)],
           radius=0.058, mat=R.MAT_RUBBER, parent=lift, sides=8)

    join_by_mat(lift, 'boom')

    # ---- boom lift cylinder ------------------------------------------------
    # Its own aim node so the barrel tracks the boom instead of shearing.
    ram_a = Vector((fx, fy - 0.62, fz - 0.300))
    ram_b = Vector((fx + lugp[0], fy + lugp[1], fz + lugp[2]))
    ram_v = ram_b - ram_a
    ramp = R.empty(R.NODE_PIVOT, 'boomRam', root, ram_a,
                   ram_v.to_track_quat('Z', 'Y').to_euler())
    L = ram_v.length
    cyl('ram_barrel', 0.105, L * 0.58, R.MAT_DARK, ramp, (0, 0, 0), sides=14)
    cyl('ram_gland', 0.088, 0.085, R.MAT_CAST, ramp, (0, 0, L * 0.58), sides=14)
    cyl('ram_eye', 0.075, 0.230, R.MAT_CAST, ramp, (-0.115, 0, 0.03),
        (0, math.radians(90), 0), sides=12)
    for i, z in enumerate((0.12, L * 0.46)):
        R.hose('ramhose%d' % i, [(0.10, 0.0, z), (0.17, 0.05, z + 0.20),
                                 (0.12, 0.0, z + 0.42)],
               radius=0.016, mat=R.MAT_RUBBER, parent=ramp, sides=4)
    join_by_mat(ramp, 'boomram')

    rod = R.empty(R.NODE_SLIDE, 'boomRamRod', ramp, (0, 0, L * 0.58))
    rod['stroke_m'] = L * 0.40
    cyl('ram_rod', 0.062, L * 0.44, R.MAT_CHROME, rod, (0, 0, 0), sides=12)
    cyl('ram_rodeye', 0.070, 0.210, R.MAT_CAST, rod, (-0.105, 0, L * 0.44),
        (0, math.radians(90), 0), sides=12)
    join_by_mat(rod, 'boomrod')

    # ---- knuckle: the swing / dump joint at the boom's outer end [R]S4.2 ---
    fswing = R.empty(R.NODE_PIVOT, 'feedSwing', lift, (ex, ey, ez))
    cyl('knuckle', 0.155, 0.480, R.MAT_CAST, fswing, (0, 0, -0.17), sides=16)
    R.box('knuckleyoke', (0.360, 0.320, 0.280), R.MAT_DARK, fswing,
          (0, 0.07, 0.20), bevel=0.014)
    bolt_ring(fswing, 'knucklebolt', 0.120, 8, 0.020, 0.026, R.MAT_WORN,
              (0, 0, 0.315))
    join_by_mat(fswing, 'knuckle')

    # pivot:mast - the hole-angle node. Identity here = a vertical hole.
    mast = R.empty(R.NODE_PIVOT, 'mast', fswing, (0, 0.320, 0.200))
    mast['tilt_min_deg'] = -25.0   # brochure quotes feed angles at 17 and 25
    mast['tilt_max_deg'] = 50.0    # deg; the class drills "well past 45" [R]S2
    return mast


def arrayed(name, size, mat, parent, start, step, count, rot=(0, 0, 0),
            bev=0.0):
    """One small part repeated by an ARRAY modifier.

    A 45 mm feed chain over 9.9 m of beam is ~220 links. As 220 objects that is
    220 join operations and a slow build; as one object with an ARRAY it is a
    single mesh, baked at export by finish(export_apply=True), and it lands in
    the same primitive as the rest of its material. Triangles, not draw calls.
    """
    o = R.box(name, size, mat, parent, start, rot, bevel=bev)
    m = o.modifiers.new('arr', 'ARRAY')
    m.use_relative_offset = False
    m.use_constant_offset = True
    m.constant_offset_displace = step
    m.count = count
    return o


# =============================================================================
# 4. FEED ASSEMBLY
#
#    Call it a FEED, never a mast [R]S4.1. It is an extruded ALUMINIUM profile
#    of constant section end to end - not a lattice, not a welded steel box,
#    and not painted the machine colour. "Getting this wrong is the fastest way
#    to make the model read as the wrong tier of machine." [R]S4.1/S6.1
#
#    MATERIAL CAVEAT: src/core/assets.js has no aluminium kind. rawSteel is the
#    nearest of the nine names rig.py exposes - satin, unpainted, bright. This
#    is recorded as wrong-but-least-wrong; the right fix is an 'aluminium' kind
#    in assets.js (see the report's stillWrong).
#
#    Beam-local frame: origin at the FEED FOOT, +Z up the beam, +Y away from
#    the machine (the side the drill string runs on), +X to the machine's right.
#
#    The drill string axis is offset STRING_Y ahead of the beam's own axis, so
#    the collar lands 3.19 m ahead of the front of the undercarriage - inside
#    the sourced 2.70-3.19 m horizontal-reach envelope [R]S3.1. ASSUMPTION,
#    recorded: the brochure does not say what that reach is measured from; this
#    model reads it as track-front to hole centre, which is the only datum that
#    makes both quoted figures land on a real machine layout.
# =============================================================================

STRING_Y  = 0.380      # drill string axis, ahead of the beam's own axis
CARR_Z0   = 0.950      # bottom of carriage travel (clears the break-out table)
CARR_Z1   = CARR_Z0 + FEED_TRAV        # 6.674 - leaves the top 3.29 m of beam
                                       # never covered, which is exactly what
                                       # [R]S4.11 describes
CARR_REST = 3.350      # rest pose: mid-pass
CAROUSEL_X = 0.640     # tube magazine, inboard side of the beam
DUST_X    = -0.790     # cyclone + filter box, OUTBOARD side [R]S4.5


def build_feed_beam(fx):
    """The aluminium extrusion itself, its ways, its chain and its furniture."""
    w, d, L = FEED_SEC_W, FEED_SEC_D, FEED_LEN

    # -- the extrusion. Constant section end to end - extrusions do not taper.
    R.box('feedprofile', (w, d, L), R.MAT_STEEL, fx, (0, 0, L / 2), bevel=0.012)
    # integral machined ways along both side faces: the carriage clamps round
    # these with slide pads, there are no separate round rails [R]S4.1
    for sx in (-1, 1):
        for sy in (-1, 1):
            R.box('feedway%d%d' % (sx, sy), (0.030, 0.078, L), R.MAT_STEEL, fx,
                  (sx * (w / 2 + 0.013), sy * (d / 2 - 0.062), L / 2), bevel=0.005)
    # longitudinal flutes on the outer face - the visual tell of an extrusion
    for i, x in enumerate((-0.150, -0.050, 0.050, 0.150)):
        R.box('feedflute%d' % i, (0.044, 0.020, L), R.MAT_STEEL, fx,
              (x, d / 2 + 0.009, L / 2), bevel=0.004)
    for i, x in enumerate((-0.120, 0.120)):
        R.box('feedrib%d' % i, (0.040, 0.018, L), R.MAT_STEEL, fx,
              (x, -d / 2 - 0.008, L / 2), bevel=0.004)
    # end castings
    for z in (0.0, L):
        R.box('feedend%d' % int(z), (w + 0.050, d + 0.050, 0.070), R.MAT_STEEL,
              fx, (0, 0, z), bevel=0.010)

    # -- 45 mm feed chain [R]S3.1, both runs, on the beam's inboard face -----
    cz0, cz1 = 0.30, L - 0.34
    n = int((cz1 - cz0) / 0.090)
    for sx, tag in ((-1, 'a'), (1, 'b')):
        arrayed('feedchain_' + tag, (0.030, 0.052, 0.046), R.MAT_WORN, fx,
                (sx * 0.062, -d / 2 - 0.052, cz0), (0, 0, 0.090), n)
    # chain guard strip over the run
    R.box('chainguard', (0.230, 0.030, L - 0.80), R.MAT_DARK, fx,
          (0, -d / 2 - 0.086, L / 2), bevel=0.005)
    # feed motor + drive sprocket at the top, idler and tensioner at the foot
    cyl('feedmotor', 0.108, 0.260, R.MAT_CAST, fx,
        (0.300, -d / 2 - 0.075, L - 0.42), (0, math.radians(-90), 0), sides=12)
    R.box('feedgearbox', (0.260, 0.230, 0.290), R.MAT_CAST, fx,
          (0.130, -d / 2 - 0.075, L - 0.42), bevel=0.012)
    cyl('feedsprocket', 0.118, 0.130, R.MAT_WORN, fx,
        (-0.065, -d / 2 - 0.075, L - 0.42), (0, math.radians(90), 0), sides=14)
    cyl('feedidler', 0.098, 0.120, R.MAT_WORN, fx,
        (-0.060, -d / 2 - 0.075, 0.30), (0, math.radians(90), 0), sides=12)
    cyl('feedtension', 0.026, 0.300, R.MAT_STEEL, fx,
        (0, -d / 2 - 0.075, 0.30), (math.radians(90), 0, 0), sides=8)

    # -- double drill tube support [R]S4.1: two centralisers that stop the
    #    tube whipping, at the two heights the brochure implies.
    for i, z in enumerate((1.320, 3.180)):
        R.box('tubesup%d' % i, (0.300, 0.360, 0.110), R.MAT_DARK, fx,
              (0, d / 2 + 0.190, z), bevel=0.010)
        torus_ring('tubering%d' % i, TUBE_OD * 1.55, 0.030, R.MAT_WORN, fx,
                   (0, STRING_Y, z))
        R.box('tubesuparm%d' % i, (0.070, 0.230, 0.090), R.MAT_DARK, fx,
              (0.150, d / 2 + 0.150, z), bevel=0.008)

    # -- hose guide: the run to the rotary head must FOLLOW the carriage, so a
    #    guided moving loop, never a straight taut line [R]S4.1/S4.10.
    R.box('hosecarrier', (0.150, 0.075, CARR_Z1 - 0.30), R.MAT_DARK, fx,
          (-w / 2 - 0.115, -0.030, (CARR_Z1 + 0.30) / 2), bevel=0.006)
    arrayed('hoseclink', (0.130, 0.062, 0.060), R.MAT_DARK, fx,
            (-w / 2 - 0.115, 0.060, 0.42), (0, 0, 0.085),
            int((CARR_REST - 0.42) / 0.085))
    for i, (r, dx) in enumerate(((0.052, 0.00), (0.030, 0.055), (0.022, -0.048))):
        R.hose('feedhose%d' % i,
               [(-w / 2 - 0.115 + dx, 0.06, 0.44),
                (-w / 2 - 0.135 + dx, 0.10, CARR_REST - 0.85),
                (-w / 2 - 0.330 + dx, 0.16, CARR_REST - 0.24),
                (-w / 2 - 0.140 + dx, 0.20, CARR_REST + 0.12)],
               radius=r, mat=R.MAT_RUBBER, parent=fx, sides=6)

    # -- break-out table for cracking joints [R]S4.1 -------------------------
    R.box('breakout', (0.760, 0.520, 0.170), R.MAT_DARK, fx,
          (0, STRING_Y, 0.610), bevel=0.014)
    for s in (-1, 1):
        R.box('bojaw%d' % s, (0.300, 0.230, 0.130), R.MAT_WORN, fx,
              (s * 0.230, STRING_Y + 0.03, 0.720), (0, 0, s * 0.24), bevel=0.010)
        cyl('boram%d' % s, 0.034, 0.330, R.MAT_CHROME, fx,
            (s * 0.100, STRING_Y - 0.180, 0.700), (0, s * math.radians(90), 0),
            sides=10)
        cyl('borambarrel%d' % s, 0.052, 0.220, R.MAT_DARK, fx,
            (s * 0.430, STRING_Y - 0.180, 0.700), (0, s * math.radians(-90), 0),
            sides=10)
    # thread lubrication spray head - the one wet, dark, shiny area [R]S6.2
    R.box('lubespray', (0.110, 0.130, 0.150), R.MAT_CAST, fx,
          (-0.290, STRING_Y + 0.16, 0.860), bevel=0.008)

    # -- feed foot: a substantial plate, not a peg ("wide feed foot" is a
    #    listed option) [R]S4.1. Takes the drilling reaction on the rock.
    R.box('feedfoot', (0.820, 0.680, 0.075), R.MAT_WORN, fx,
          (0, STRING_Y * 0.55, 0.040), bevel=0.010)
    for s in (-1, 1):
        R.box('feedfootrib%d' % s, (0.045, 0.560, 0.190), R.MAT_WORN, fx,
              (s * 0.300, STRING_Y * 0.55, 0.150), bevel=0.008)
    R.box('feedfoothaz', (0.840, 0.110, 0.045), R.MAT_HAZARD, fx,
          (0, STRING_Y * 0.55 + 0.330, 0.100), bevel=0.006)

    # -- service winch jib near the top of the beam [R]S4.1 (listed option) --
    cyl('jibmast', 0.048, 0.560, R.MAT_STEEL, fx, (0.190, 0.10, L - 0.90), sides=10)
    aim_tube('jib', 0.042, (0.190, 0.10, L - 0.36), (0.190, 0.86, L - 0.20),
             R.MAT_STEEL, fx, sides=10)
    cyl('jibsheave', 0.075, 0.045, R.MAT_CAST, fx,
        (0.168, 0.86, L - 0.20), (0, math.radians(90), 0), sides=14)
    R.hose('jibrope', [(0.190, 0.86, L - 0.24), (0.190, 0.87, L - 1.60),
                       (0.185, 0.84, L - 2.60)],
           radius=0.010, mat=R.MAT_STEEL, parent=fx, sides=4)


def build_dust_package(fx):
    """Cyclone + filter box hung on the OUTBOARD side of the feed, with the
    203 mm corrugated suction hose sweeping in a lazy S from the collar hood.

    [R]S9.4 records that the game currently has only a small skirt at the mast
    base. On a DTH rig this package is second only to the compressor in visual
    weight: 1,270 l/s of suction through an 8 in hose that is "as thick as a
    man's thigh". [R]S4.5 / S5 #3.
    """
    # brackets off the beam
    for z in (3.30, 5.05):
        R.box('dustbkt%d' % int(z * 10), (0.560, 0.170, 0.120), R.MAT_DARK, fx,
              (DUST_X / 2 - 0.12, 0.020, z), bevel=0.010)
    # cyclone can - tall, black, with a conical bottom
    cyl('cyclone', 0.320, 1.560, R.MAT_DARK, fx, (DUST_X, 0.020, 3.320), sides=18)
    bpy.ops.mesh.primitive_cone_add(radius1=0.320, radius2=0.105, depth=0.520,
                                    vertices=18)
    R.part('cyclonecone', bpy.context.active_object, R.MAT_DARK, fx,
           (DUST_X, 0.020, 3.060))
    cyl('cyclonespout', 0.105, 0.230, R.MAT_DARK, fx, (DUST_X, 0.020, 2.640), sides=12)
    torus_ring('cyclonering', 0.325, 0.024, R.MAT_DARK, fx, (DUST_X, 0.020, 3.900))
    # tangential inlet - where the 203 mm hose lands
    cyl('cycloneinlet', SUCT_D / 2 + 0.020, 0.320, R.MAT_DARK, fx,
        (DUST_X + 0.300, -0.240, 4.560), (math.radians(78), 0, math.radians(38)),
        sides=12)
    # filter box on top - house colour in both photographs [R]S4.5
    R.box('filterbox', (0.900, 0.700, 0.860), R.MAT_PAINT, fx,
          (DUST_X, 0.020, 5.310), bevel=0.026)
    R.box('filterlid', (0.940, 0.740, 0.070), R.MAT_PAINT, fx,
          (DUST_X, 0.020, 5.770), bevel=0.014)
    for i in range(3):                       # filter element access caps
        cyl('filtcap%d' % i, 0.098, 0.075, R.MAT_DARK, fx,
            (DUST_X - 0.28 + 0.28 * i, 0.020, 5.805), sides=12)
    # pulse-clean air line down to the filter box
    R.hose('pulseline', [(DUST_X + 0.42, -0.15, 3.10), (DUST_X + 0.44, -0.22, 4.40),
                         (DUST_X + 0.36, -0.28, 5.30)],
           radius=0.018, mat=R.MAT_RUBBER, parent=fx, sides=4)
    # cleaned-air return, the smaller second hose [R]S4.5
    R.hose('cleanreturn', [(DUST_X - 0.30, 0.34, 5.10), (DUST_X - 0.44, 0.50, 3.60),
                           (DUST_X - 0.28, 0.46, 2.10), (-0.14, STRING_Y + 0.34, 0.95)],
           radius=0.062, mat=R.MAT_RUBBER, parent=fx, sides=8)
    # THE hose: 203 mm corrugated, hood at the collar up to the cyclone inlet.
    # At 8 in this is unmissable at thumbnail size and nothing else in the
    # game's fleet has it [R]S5 #3.
    R.hose('suctionhose',
           [(-0.18, STRING_Y + 0.30, 0.62),
            (DUST_X + 0.55, STRING_Y + 0.55, 1.55),
            (DUST_X + 0.10, STRING_Y + 0.10, 2.90),
            (DUST_X + 0.34, -0.16, 4.30),
            (DUST_X + 0.30, -0.24, 4.52)],
           radius=SUCT_D / 2, mat=R.MAT_RUBBER, parent=fx, sides=12)
    # corrugation rings on the suction hose - triangles, not draw calls
    for i in range(14):
        t = i / 13.0
        z = 0.75 + t * 3.60
        x = -0.18 + (DUST_X + 0.30 + 0.18) * (t ** 0.65)
        y = STRING_Y + 0.30 - (STRING_Y + 0.54) * (t ** 1.3)
        torus_ring('corr%d' % i, SUCT_D / 2 + 0.014, 0.016, R.MAT_RUBBER, fx,
                   (x, y, z), (math.radians(20 * (1 - t)), 0, 0), maj=12, min_=5)


def build_carousel(fx):
    """Hydraulic tube handling: a magazine of tubes on the feed with a swing
    arm that lifts one into line with the head [R]S4.9. Tubes are visibly
    FATTER and FEWER than a top-hammer rod magazine - 114 mm OD, 5 m long."""
    cx, cy = CAROUSEL_X, 0.060
    z0, z1 = 2.100, 2.100 + TUBE_LEN
    drum = R.empty(R.NODE_PIVOT, 'carousel', fx, (cx, cy, (z0 + z1) / 2))
    drum['tubes'] = 6
    drum['tube_od_m'] = TUBE_OD
    drum['tube_len_m'] = TUBE_LEN
    for z in (-(TUBE_LEN / 2) - 0.09, (TUBE_LEN / 2) + 0.09):
        cyl('carplate', 0.360, 0.075, R.MAT_DARK, drum, (0, 0, z), sides=16)
    cyl('carshaft', 0.075, TUBE_LEN + 0.18, R.MAT_DARK, drum,
        (0, 0, -(TUBE_LEN / 2) - 0.09), sides=12)
    for i in range(6):
        a = TAU * i / 6
        px, py = 0.280 * math.cos(a), 0.280 * math.sin(a)
        cyl('tube%d' % i, TUBE_OD / 2, TUBE_LEN, R.MAT_STEEL, drum,
            (px, py, -TUBE_LEN / 2), sides=10)
        # upset thread ends, polished bright where the wrench grips [R]S6.1
        for zz in (-TUBE_LEN / 2, TUBE_LEN / 2 - 0.140):
            cyl('tubeend%d' % i, TUBE_OD / 2 + 0.011, 0.140, R.MAT_WORN, drum,
                (px, py, zz), sides=10)
    join_by_mat(drum, 'carousel')

    # magazine frame and the swing arm that presents a tube to the head
    R.box('carframe', (0.520, 0.240, 0.180), R.MAT_DARK, fx,
          (cx - 0.180, cy, z0 - 0.220), bevel=0.012)
    R.box('carframe2', (0.520, 0.240, 0.180), R.MAT_DARK, fx,
          (cx - 0.180, cy, z1 + 0.220), bevel=0.012)
    arm = R.empty(R.NODE_PIVOT, 'rodArm', fx, (cx - 0.150, cy, z1 - 0.520))
    arm['reach_m'] = 0.760
    R.box('rodarm', (0.700, 0.130, 0.110), R.MAT_DARK, arm, (-0.330, 0, 0),
          bevel=0.010)
    torus_ring('rodgrip', TUBE_OD / 2 + 0.048, 0.036, R.MAT_DARK, arm,
               (-0.680, 0, 0), (math.radians(90), 0, 0))
    cyl('rodarmpin', 0.055, 0.180, R.MAT_CAST, arm, (0, -0.090, 0),
        (math.radians(-90), 0, 0), sides=10)
    join_by_mat(arm, 'rodarm')


def build_carriage(fx):
    """slide:carriage - the rotary head and what it rides on.

    NOT a drifter. There is no percussion on the deck: the hammer is at the
    bottom of the hole. A compact gearbox with a hydraulic motor hanging off
    it, an air/water swivel above, two big hoses in from the side, and a
    threaded box output (API 2 3/8 or 3 1/2 REG) [R]S4.3. Silhouette-wise the
    carriage must read as a LUMP, not a sausage [R]S5 #5.
    """
    car = R.empty(R.NODE_SLIDE, 'carriage', fx, (0, 0, CARR_REST))
    car['travel_min_m'] = CARR_Z0
    car['travel_max_m'] = CARR_Z1
    car['travel_m'] = FEED_TRAV
    car['rate_ms'] = 0.9              # feed rate 0.9 m/s [R]S3.1
    car['force_kn'] = 40.0            # feed force 40 kN [R]S3.1

    w, d = FEED_SEC_W, FEED_SEC_D
    # the sled that clamps round the extrusion's machined ways
    R.box('sled', (w + 0.150, d + 0.090, 0.620), R.MAT_DARK, car, (0, 0, 0),
          bevel=0.016)
    for sx in (-1, 1):
        for sy in (-1, 1):
            R.box('slidepad%d%d' % (sx, sy), (0.045, 0.110, 0.560),
                  R.MAT_WORN, car, (sx * (w / 2 + 0.020), sy * (d / 2 - 0.062), 0),
                  bevel=0.005)
    R.box('chainlug', (0.120, 0.090, 0.240), R.MAT_DARK, car,
          (0.062, -d / 2 - 0.055, 0), bevel=0.008)

    # rotary head: a dark, oily, cast-and-fabricated block
    R.box('rothead', (0.420, 0.480, 0.520), R.MAT_CAST, car,
          (0, STRING_Y - 0.030, 0.020), bevel=0.020)
    cyl('rotmotor', 0.135, 0.320, R.MAT_CAST, car,
        (-0.190, STRING_Y - 0.030, 0.150), (0, math.radians(-90), 0), sides=14)
    R.box('rotmotorface', (0.075, 0.260, 0.260), R.MAT_CAST, car,
          (-0.520, STRING_Y - 0.030, 0.150), bevel=0.010)
    torus_ring('rotflange', 0.150, 0.022, R.MAT_WORN, car,
               (-0.208, STRING_Y - 0.030, 0.150), (0, math.radians(90), 0))
    # air / water swivel above the head, and the 30 bar line into it
    cyl('swivel', 0.105, 0.240, R.MAT_CAST, car, (0, STRING_Y, 0.290), sides=14)
    cyl('swivelinlet', 0.060, 0.190, R.MAT_WORN, car,
        (0, STRING_Y, 0.360), (math.radians(-90), 0, 0), sides=10)
    for i, (r, dx) in enumerate(((0.058, -0.14), (0.034, 0.10), (0.026, 0.16))):
        R.hose('carhose%d' % i,
               [(-FEED_SEC_W / 2 - 0.14, 0.20, 0.10),
                (-0.34 + dx * 0.5, STRING_Y - 0.24, 0.34 + i * 0.04),
                (dx, STRING_Y + 0.05, 0.40)],
               radius=r, mat=R.MAT_RUBBER, parent=car, sides=6)
    # threaded box output - API REG. The tool hangs from mount:tool.
    cyl('spindlebox', 0.098, 0.260, R.MAT_STEEL, car,
        (0, STRING_Y, -0.360), sides=12)
    for i in range(5):
        torus_ring('thread%d' % i, 0.099, 0.007, R.MAT_STEEL, car,
                   (0, STRING_Y, -0.330 + i * 0.020), maj=10, min_=4)
    join_by_mat(car, 'carriage')

    spindle = R.empty(R.NODE_PIVOT, 'spindle', car, (0, STRING_Y, -0.100))
    spindle['rpm_min'] = 54.0         # rotary head 54-137 rpm [R]S4.3.
    spindle['rpm_max'] = 137.0        # torque range 1,839-6,600 Nm, but the
                                      # rpm<->torque PAIRING is NOT SOURCED.
    R.empty(R.NODE_MOUNT, 'tool', spindle, (0, 0, -0.290))
    return car


def build_dust_hood(fx):
    """The movable lower guide / dust hood that seals against the ground at the
    collar [R]S4.1. slide:dustHood drops it onto the rock. The lower 1.5 m of
    the beam and the whole hood are the filthiest parts of the machine
    [R]S6.2 - caked, not filmed."""
    hood = R.empty(R.NODE_SLIDE, 'dustHood', fx, (0, STRING_Y, 0.160))
    hood['drop_m'] = 0.420
    R.box('hoodbody', (0.680, 0.640, 0.300), R.MAT_PAINT, hood, (0, 0, 0.180),
          bevel=0.016)
    R.box('hoodmouth', (0.760, 0.720, 0.070), R.MAT_PAINT, hood, (0, 0, 0.020),
          bevel=0.012)
    R.box('hoodhaz', (0.780, 0.090, 0.190), R.MAT_HAZARD, hood, (0, 0.360, 0.185),
          bevel=0.008)
    # rubber skirt that actually seals on broken rock
    for i in range(12):
        a = TAU * i / 12
        R.box('skirt%d' % i, (0.130, 0.030, 0.170), R.MAT_RUBBER, hood,
              (0.330 * math.cos(a), 0.330 * math.sin(a), -0.060), (0, 0, -a),
              bevel=0.004)
    cyl('hoodport', SUCT_D / 2 + 0.018, 0.220, R.MAT_DARK, hood,
        (-0.180, -0.060, 0.230), (math.radians(-64), 0, math.radians(-30)),
        sides=12)
    # the guide bushing the drill tube actually passes through
    torus_ring('hoodguide', TUBE_OD * 1.9, 0.034, R.MAT_WORN, hood, (0, 0, 0.330))
    join_by_mat(hood, 'dusthood')
    return hood


def build_feed(mast):
    """Assemble everything that hangs off pivot:mast."""
    # cradle: the fabricated saddle the beam slides in, painted the dark tone
    # Open-fronted U: a back plate and two cheeks. It cannot be a closed box -
    # the carriage has to pass it on the ways when the head runs low.
    R.box('cradleback', (FEED_SEC_W + 0.300, 0.110, 1.180), R.MAT_DARK, mast,
          (0, -FEED_SEC_D / 2 - 0.085, 0), bevel=0.018)
    for sx in (-1, 1):
        R.box('cradlecheek%d' % sx, (0.055, FEED_SEC_D + 0.110, 1.180),
              R.MAT_DARK, mast, (sx * (FEED_SEC_W / 2 + 0.112), -0.010, 0),
              bevel=0.012)
        R.box('cradlerib%d' % sx, (0.120, 0.090, 0.240), R.MAT_DARK, mast,
              (sx * (FEED_SEC_W / 2 + 0.112), -FEED_SEC_D / 2 - 0.140, 0.420),
              bevel=0.008)
        R.box('cradlepad%d' % sx, (0.032, FEED_SEC_D - 0.04, 1.020), R.MAT_WORN,
              mast, (sx * (FEED_SEC_W / 2 + 0.070), 0, 0), bevel=0.006)
    # feed-extension ram: the beam slides 2.01 m in the cradle to place the
    # collar without moving the boom [R]S3.1/S4.1
    cyl('extbarrel', 0.070, 1.020, R.MAT_DARK, mast,
        (-FEED_SEC_W / 2 - 0.150, -FEED_SEC_D / 2 - 0.060, -0.500), sides=12)
    R.box('cradlebkt', (0.180, 0.160, 0.130), R.MAT_DARK, mast,
          (-FEED_SEC_W / 2 - 0.150, -FEED_SEC_D / 2 - 0.060, -0.560), bevel=0.008)
    # bulkhead plate: the hose package terminates here, it does not run end to
    # end [H] "Schottplatte"
    R.box('bulkhead', (0.330, 0.032, 0.240), R.MAT_WORN, mast,
          (FEED_SEC_W / 2 + 0.180, -FEED_SEC_D / 2 - 0.150, 0.180), bevel=0.006)
    for i in range(6):
        cyl('bhcoupling%d' % i, 0.019, 0.075, R.MAT_WORN, mast,
            (FEED_SEC_W / 2 + 0.075 + 0.042 * (i % 3),
             -FEED_SEC_D / 2 - 0.190, 0.110 + 0.130 * (i // 3)),
            (math.radians(-90), 0, 0), sides=6)
    join_by_mat(mast, 'cradle')

    # slide:feedExtend - the beam and everything bolted to it
    fx = R.empty(R.NODE_SLIDE, 'feedExtend', mast, (0, 0, -FEED_GRIP))
    fx['travel_m'] = FEED_EXT

    build_feed_beam(fx)
    build_dust_package(fx)

    # feed-mounted work lights, including the one the brochure names:
    # "halogen work light pointing to feed support" [R]S4.6
    R.box('lampbox_hi', (0.200, 0.150, 0.150), R.MAT_DARK, fx,
          (0.330, 0.230, CARR_Z1 + 0.60), bevel=0.010)
    R.worklight('feedHigh', fx, (0.330, 0.300, CARR_Z1 + 0.60),
                (0.0, 0.35, -1.0), cone_deg=48, range_m=22)
    R.box('lampbox_lo', (0.180, 0.140, 0.140), R.MAT_DARK, fx,
          (0.360, 0.240, 1.560), bevel=0.010)
    R.worklight('feedCollar', fx, (0.360, 0.310, 1.560),
                (0.0, 0.45, -1.0), cone_deg=60, range_m=14)

    build_string_guard(fx)
    build_carousel(fx)
    build_carriage(fx)
    build_dust_hood(fx)
    # joined LAST, so the carousel frame and the guard fold into the same
    # primitives as the beam instead of buying draw calls of their own
    join_by_mat(fx, 'feed')
    return fx


# =============================================================================
# 5. SUPPORT LEG, GUARDING AND WORK LIGHTS
#
#    [R]S9.3: the game puts FOUR outriggers on this rig. Neither reference
#    photograph shows four jacks on a machine this size - the brochure lists
#    "a single hydraulic support leg", and levelling is done by the boom plus
#    the feed foot on the rock. One leg, therefore, and it is recorded in
#    [R]S9.3 as read from photographs rather than from a spec sheet.
#
#    Work lights matter more here than they look: src/core/env.js reads the
#    world position of every mount:/aim: pair EVERY FRAME and re-aims a
#    spotlight at it, which is why a lamp on a boom sweeps as the boom works.
#    Two of these are on the feed (built with the feed), one is on the boom so
#    it sweeps, and the rest are on the carrier.
# =============================================================================

def build_support_leg(root):
    """Single rear hydraulic support leg [R]S4.8. Not four outriggers."""
    lx, ly = 0.0, BODY_Y0 - 0.060
    R.box('leghousing', (0.420, 0.360, 0.560), R.MAT_DARK, root,
          (lx, ly, DECK_Z - 0.420), bevel=0.016)
    cyl('legbarrel', 0.115, 0.640, R.MAT_DARK, root, (lx, ly, 0.220), sides=14)
    cyl('leggland', 0.098, 0.070, R.MAT_CAST, root, (lx, ly, 0.180), sides=14)
    for i, s in enumerate((-1, 1)):
        R.hose('leghose%d' % i,
               [(lx + s * 0.14, ly + 0.10, DECK_Z - 0.30),
                (lx + s * 0.22, ly + 0.02, 0.62),
                (lx + s * 0.13, ly + 0.06, 0.30)],
               radius=0.018, mat=R.MAT_RUBBER, sides=4)
    leg = R.empty(R.NODE_SLIDE, 'supportLeg', root, (lx, ly, 0.180))
    leg['stroke_m'] = 0.560
    cyl('legrod', 0.070, 0.360, R.MAT_CHROME, leg, (0, 0, -0.360), sides=12)
    cyl('legpivot', 0.080, 0.180, R.MAT_CAST, leg, (-0.090, 0, -0.360),
        (0, math.radians(90), 0), sides=10)
    R.box('legfoot', (0.480, 0.480, 0.070), R.MAT_WORN, leg, (0, 0, -0.400),
          bevel=0.012)
    R.box('legfoothaz', (0.500, 0.090, 0.050), R.MAT_HAZARD, leg,
          (0, 0.230, -0.372), bevel=0.006)
    join_by_mat(leg, 'supportleg')
    return leg


def build_string_guard(fx):
    """EN 16228 guarding round the rotating string at the working level
    [R]S4.7 (a listed option on the brochure). Galvanised mesh, dull grey, no
    gloss - and it is the detail that says this machine was built after the
    standard existed."""
    gy = STRING_Y
    for sx in (-1, 1):
        R.box('guardpost%d' % sx, (0.045, 0.045, 1.180), R.MAT_STEEL, fx,
              (sx * 0.560, gy + 0.480, 0.700), bevel=0.005)
        R.box('guardpostb%d' % sx, (0.045, 0.045, 1.180), R.MAT_STEEL, fx,
              (sx * 0.560, gy - 0.180, 0.700), bevel=0.005)
        for i in range(6):                      # mesh infill, vertical wires
            R.box('guardw%d%d' % (sx, i), (0.016, 0.016, 1.080), R.MAT_STEEL, fx,
                  (sx * 0.560, gy - 0.180 + 0.132 * i, 0.700), bevel=0.003)
    for i in range(5):                          # horizontal wires, both sides
        z = 0.180 + 0.260 * i
        for sx in (-1, 1):
            R.box('guardh%d%d' % (sx, i), (0.016, 0.700, 0.016), R.MAT_STEEL, fx,
                  (sx * 0.560, gy + 0.150, z), bevel=0.003)
    R.box('guardhaz', (1.180, 0.030, 0.090), R.MAT_HAZARD, fx,
          (0, gy + 0.500, 1.240), bevel=0.005)


def build_lights(root, boom_lift):
    """Lamp housings plus the mount:/aim: pairs env.js drives.

    Sourced fitting list [R]S4.6: "LED / halogen work lights front, rear and on
    the feed", including a "halogen work light pointing to feed support".
    """
    x0 = CAB_X - CAB_W / 2
    z_roof = DECK_Z + 0.070 + CAB_H
    # two forward lamps on the cab roof bar
    cyl('lampbar', 0.022, CAB_W + 0.20, R.MAT_DARK, root,
        (CAB_X - (CAB_W + 0.20) / 2, CAB_Y + CAB_D / 2 - 0.02, z_roof + 0.090),
        (0, math.radians(90), 0), sides=8)
    for i, dx in enumerate((-0.34, 0.34)):
        R.box('lamphead%d' % i, (0.200, 0.130, 0.170), R.MAT_DARK, root,
              (CAB_X + dx, CAB_Y + CAB_D / 2 + 0.03, z_roof + 0.150), bevel=0.012)
        R.box('lamplens%d' % i, (0.165, 0.020, 0.135), R.MAT_GLASS, root,
              (CAB_X + dx, CAB_Y + CAB_D / 2 + 0.10, z_roof + 0.150), bevel=0.004)
        R.worklight('cab%d' % i, root,
                    (CAB_X + dx, CAB_Y + CAB_D / 2 + 0.11, z_roof + 0.150),
                    (dx * 0.35, 1.0, -0.55), cone_deg=56, range_m=30)
    # rear lamp over the cooler face, for tramming and service
    R.box('lampheadr', (0.190, 0.130, 0.160), R.MAT_DARK, root,
          (-0.70, BODY_Y0 - 0.03, CANOPY_Z - 0.22), bevel=0.012)
    R.box('lamplensr', (0.155, 0.020, 0.125), R.MAT_GLASS, root,
          (-0.70, BODY_Y0 - 0.10, CANOPY_Z - 0.22), bevel=0.004)
    R.worklight('rear', root, (-0.70, BODY_Y0 - 0.11, CANOPY_Z - 0.22),
                (0.0, -1.0, -0.60), cone_deg=64, range_m=22)
    # the boom lamp - parented to pivot:boomLift, so it SWEEPS as the boom
    # works. This is the whole reason env.js reads these nodes every frame.
    R.box('lamphead_b', (0.180, 0.150, 0.150), R.MAT_DARK, boom_lift,
          (0.290, UY * 1.05, UZ * 1.05 + BD / 2 + 0.11), bevel=0.010)
    R.worklight('boom', boom_lift,
                (0.290, UY * 1.05 + 0.09, UZ * 1.05 + BD / 2 + 0.11),
                (-0.25, 1.0, -0.42), cone_deg=44, range_m=34)
    # re-run the boom join so the lamp housing folds into the mesh that is
    # already there instead of buying a draw call of its own
    join_by_mat(boom_lift, 'boom')


# ═════════════════════════════════════════════════════════════════════════════
# 9. ASSEMBLY
# ═════════════════════════════════════════════════════════════════════════════

def build(out_path):
    col = R.reset()
    root = R.empty('', 'rig:dth-crawler', None, (0, 0, 0))

    build_undercarriage(root)
    build_frame(None)
    build_canopy(None)
    build_cab(None)
    build_access(None)
    mast = build_boom(root)
    build_feed(mast)
    build_support_leg(root)
    build_lights(root, bpy.data.objects[R.NODE_PIVOT + 'boomLift'])

    bake_all()
    return R.finish(out_path)
