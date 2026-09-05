"""bolter - underground rock bolting rig.

In-game marque: "Skarnes GB-14 Boltline" (already the invented marque carried by
`src/game/data.js` L1272 and `rigFactory.js` L5960 for rig id `bolter`; this
model does not invent a second name for the same machine). Real class: a small
centre-articulated four-wheel rubber-tyred underground bolter, ~13.7 t, one
boom, a combined drilling-and-bolting unit on a short feed, a ten-bolt magazine,
and a protective roof over the operator.

WHAT THIS MACHINE IS, AND THE ONE THING A MODEL OF IT USUALLY GETS WRONG
-----------------------------------------------------------------------
A bolter installs permanent ground support: it drills a hole into the back or
the wall, then puts a bolt in it. Those are TWO DISTINCT TOOL SYSTEMS and the
tell of a model built from a photograph is that it only has the first one.

  1. THE DRILLING SYSTEM - a rock drill on a carriage running a short feed
     beam, with a centraliser and a dust shroud at the collar end.
  2. THE BOLTING SYSTEM - a revolving magazine of bolts, a resin/grout
     injection line, and an insertion mechanism that puts the bolt in the hole.

On this class the two share ONE feed. The bolting unit indexes: the feed
carries the drill on one centreline and the bolt gripper on a second, and after
the hole is drilled the unit rotates about the feed's long axis so the bolt
centreline lands on the hole the drill just made. That indexer is modelled here
as `pivot:boltIndex` and it is the mechanism, not a detail. Getting it wrong -
bolting head bolted rigidly beside the drill, both pointing at different rock -
is the classic photograph-only mistake.

And a protective roof over the operator, because the entire point of the
machine is that nobody stands under unsupported ground.

WHAT THIS FILE IS NOT ALLOWED TO DO
-----------------------------------
* No real manufacturer name or model designation in any object name, material
  name or custom property (DOMAIN.md S10). Real names live in these comments
  only, as dimensional evidence.
* No material with transmission > 0, at any size, anywhere. Measured cost is
  +65..81 draw calls and it does not scale with the object (HANDOFF S8F). This
  machine carries the PROTECTIVE ROOF variant, which has no glazing at all
  (bolter.md S4.6), so MAT_GLASS is not used and cannot be reintroduced by
  accident.
* No invented dimensions. Anything not traceable is marked NOT SOURCED at the
  constant and again in S9 at the foot of this file.
"""

# =============================================================================
# SOURCES  (DOMAIN.md S10: real names appear in comments ONLY - never in an
#           object name, a material name, or any string that can reach a player)
# =============================================================================
# [R]     research/rigs/bolter.md - the repo's engineering reference for this
#         machine. Section numbers below (S3.1, S4.4, ...) are that file's.
#         It is itself sourced, page by page, from [BS] and [BM] below.
# [BS]    Epiroc Boltec S technical specification, doc 9869 0088 01, 2018-09,
#         Orebro. p.7 carries a fully dimensioned SIDE ELEVATION plus the
#         Weight / Dimensions / Turning-radius tables and the coverage diagram;
#         p.5 is the full equipment list; p.2-3 the feature callouts.
#         Mirror used by [R]: amt-inc.ca/wp-content/uploads/2019/08/
#         Epiroc-Boltec_S.pdf (the epiroc.com original 403s to a fetcher).
#         *** This is the primary geometry source for the whole machine. ***
# [BM]    Downloads/9869_0080_01f_Boomer_M-series_technical_specification_
#         english.pdf - the owner's own catalogue copy. A LARGER machine of the
#         same carrier family (face-drilling jumbo, not a bolter), used only
#         where [BS] is silent: cable-reel diameter, water-hose length,
#         clearance angles, roof height adjustment, and the studio photograph on
#         printed p.2-3 that is the only real image of this machine class in the
#         owner's library. Where the two disagree, [BS] wins.
# [MIN]   Downloads/Minova-SDA-Brochure-EN-USA-MEX.pdf - hollow-bar anchor
#         geometry for the consumables: bar OD/ID tables (PDF p.7-8), the
#         exploded nut / plate / bar / coupler / sacrificial bit illustration
#         (PDF p.2), and the finishes incl. hot-dip galvanizing to ASTM A123
#         (PDF p.6).
# [R03]   research/03-mining.md S A.4 and S C.2.3 - the bolting cycle, friction
#         vs resin-grouted bolt types, and mesh handling as a class feature.
# [R16]   research/16-site-archetypes.md S B.13 - the rockbolt machine class and
#         the bolt-vs-hole diameter rule.
# [GF]    src/rig/rigFactory.js buildBolter() L5729-5975 + src/game/data.js
#         L1272 - the game's own procedural bolter and its spec block. Read for
#         the CONTRACT (names, marque, bolt length, magazine) and for [R] S9's
#         list of what it gets wrong. Not a dimensional source.
#
# THE HALF-SIZE box() BUG - READ BEFORE CHANGING ANY NUMBER IN THIS FILE
# ---------------------------------------------------------------------
# lib/rig.py box() has been returning boxes at HALF the requested size:
#     primitive_cube_add(size=1)     -> a cube of EDGE 1 (-0.5 .. +0.5)
#     o.scale = (size[0] / 2, ...)   -> the edge becomes size / 2
# Measured in Blender 5.2.1 against the library as it stood when this file was
# started: box((4, 2, 10)) came back (2.000, 1.000, 5.000). tube() is correct -
# radius and depth both come out as asked - which is precisely what made the bug
# survive: correct cylinders next to half-size boxes look fine in a wireframe.
#
# EVERY OTHER MACHINE IN THIS DIRECTORY CARRIES A LOCAL x2 WRAPPER. THIS ONE
# DOES NOT, DELIBERATELY. A static x2 is correct only while the library is
# broken, and it silently doubles the machine the moment the library is fixed -
# which has already happened twice in this tree. So this file calls R.box()
# with true metres and guards instead: _assert_box_is_true() measures the
# library at build time and raises with an explicit message if it is still
# halving. A loud failure that names the cause beats a machine that is quietly
# the wrong size (HANDOFF S8A - the silent fallback is the most expensive bug
# class in this project).

import sys, os, math

_HERE = os.path.dirname(os.path.abspath(__file__))
for _p in (os.path.join(_HERE, 'lib'), _HERE):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import bpy
from mathutils import Vector, Matrix
import rig as R

TAU = math.pi * 2

# =============================================================================
# S1  MASTER DIMENSIONS
#     Every constant below carries its source. Millimetre figures from [BS] p.7
#     are written in metres, unrounded.
# =============================================================================

# -- the carrier envelope ------------------------------------------------------
W          = 2.115   # width over tyres                          [BS]p.7 2 115
H_TRAM     = 2.100   # overall height, protective roof DOWN      [BS]p.7 2 100
H_WORK     = 2.841   # overall height, protective roof UP        [BS]p.7 2 841
ROOF_TRAV  = H_WORK - H_TRAM        # 0.741 - the roof drops a quarter of the
                                    # machine's height to tram [R]S3.1. This is
                                    # a real articulation, not a detail, so it
                                    # is a slide: node.
L_TRAM     = 10.020  # tramming length, boom and feed folded     [BS]p.7 10 020
CLEAR      = 0.365   # ground clearance                          [BS]p.7 365
TURN_OUT   = 5.200   # outer turning radius                      [BS]p.7 5 200
TURN_IN    = 2.780   # inner turning radius                      [BS]p.7 2 780
ART_DEG    = 40.0    # steering / articulation, +/-              [BS]p.5

# -- the side-elevation dimension chain, rear to front ------------------------
# [BS] p.7 prints it as  1 470 | 637 | 1 400 | 1 400 | 700 | 850  mm.
# Sum = 6 457 mm = the bare carrier length. The 1 400 | 1 400 pair is the
# wheelbase with the articulation pin EXACTLY at its midpoint [R]S3.1, which is
# why the pin is this model's origin in Y.
CH_TAIL    = 1.470   # tail -> first tick                        [BS]p.7
CH_REAR    = 0.637   # that tick -> rear axle                    [BS]p.7
HALF_WB    = 1.400   # rear axle -> articulation pin -> front axle  [BS]p.7
CH_FRONT   = 0.700   # front axle -> forward tick                [BS]p.7
CH_NOSE    = 0.850   # that tick -> front of the carrier         [BS]p.7

WB         = 2 * HALF_WB            # 2.800 wheelbase            [BS]p.7
REAR_OH    = CH_TAIL + CH_REAR      # 2.107 rear axle -> tail    derived, [R]S3.1
FRONT_OH   = CH_FRONT + CH_NOSE     # 1.550 front axle -> nose   derived, [R]S3.1
L_CARRIER  = REAR_OH + WB + FRONT_OH  # 6.457 bare carrier       derived
PROJ       = L_TRAM - L_CARRIER     # 3.563 boom+feed ahead of the nose when
                                    # FOLDED. Derived arithmetic on printed
                                    # figures, [R]S3.1. It is the hard ceiling
                                    # on FEED_LEN below.

# Stations in Y. The machine is AUTHORED facing +Y, origin at the articulation
# pin on the ground, and the root is turned to face the fleet's forward at the
# end of build() - same convention as blender/dth_crawler.py.
Y_TAIL     = -(HALF_WB + REAR_OH)   # -3.507
Y_AXLE_R   = -HALF_WB               # -1.400
Y_TICK_R   = -(HALF_WB + CH_REAR)   # -2.037  the printed tick behind the rear
                                    # axle. [R]S4.0 puts the cable reel high in
                                    # the hood ABOVE the rear axle; this tick is
                                    # where the drawing marks it.
Y_PIN      = 0.0                    # articulation pin - the origin
Y_AXLE_F   = HALF_WB                # +1.400
Y_TICK_F   = HALF_WB + CH_FRONT     # +2.100  the printed tick ahead of the
                                    # front axle - the boom pedestal stands on
                                    # it (see S5)
Y_NOSE     = HALF_WB + FRONT_OH     # +2.950

HALF_W     = W / 2                  # 1.0575

# -- wheels --------------------------------------------------------------------
# [BS] p.5 lists the tyre as 9.00 x R20. That is a code, not a dimension: 20 in
# rim + 2 x 9.00 in section. [R]S3.1 derives 966 mm dia / 229 mm section from it
# and flags the derivation. [R]S9 W4 records that the GAME's procedural bolter
# runs a 440 mm wide tyre against this 229 mm - "the clearest single geometry
# error" on that machine. This model uses the sourced figure.
WHEEL_D    = 0.966   # derived from 9.00 x R20                   [BS]p.5 / [R]S3.1
WHEEL_R    = WHEEL_D / 2            # 0.483
WHEEL_W    = 0.229   # tyre section, derived from the same code  [BS]p.5 / [R]S3.1
RIM_R      = 0.254   # 20 in rim radius = 0.508 m dia / 2        [BS]p.5 tyre code
TRACK_X    = HALF_W - WHEEL_W / 2   # 0.943  wheel centre plane

# -- masses, for the record (nothing in the geometry depends on them) ---------
MASS_KG      = 13700  # total                                    [BS]p.7
MASS_BOOM_KG = 9000   # boom side                                [BS]p.7
MASS_ENG_KG  = 4700   # engine side. Nearly 2:1 toward the boom end - the
                      # OPPOSITE of the jumbo's near-50/50 [R]S3.1.

# -- frames, deck and the operator's floor ------------------------------------
# NOT SOURCED as printed dimensions: [BS] p.7 is an outline elevation and does
# not break the carrier down into frame depth or deck height. These are DERIVED
# from the three heights it does print, and the derivation is written out so it
# can be argued with.
#
#   belly at CLEAR = 0.365, and the roof-UP height is 2.841 [BS]p.7.
#   The protective roof is a plate ~0.09 thick, so its underside is at 2.751.
#   A standing operator needs ~1.83 m of headroom, which puts the floor he
#   stands on at 2.751 - 1.83 = 0.92.  Roof DOWN then leaves 2.010 - 0.92 =
#   1.09 m, i.e. seated-and-ducked - which is exactly why [BS]p.5 lists a
#   "swingable seat for drilling and tramming" and why the roof drops at all.
# The chain closes on three independently printed numbers, so it is a
# derivation rather than a guess - but it is still not a printed dimension.
FRAME_Z0   = CLEAR                  # 0.365 belly plate underside  [BS]p.7
FRAME_D    = 0.500                  # side-rail depth      DERIVED (see above)
FRAME_Z1   = FRAME_Z0 + FRAME_D     # 0.865 rail top
DECK_Z     = 0.920                  # walking floor        DERIVED (see above)
ROOF_T     = 0.090                  # protective roof plate thickness  DERIVED
                                    # from [BM]p.2-3 photo: a thick flat plate,
                                    # not a skin. NOT SOURCED as a figure.
ROOF_Z_UP  = H_WORK                 # 2.841 roof top, working      [BS]p.7
ROOF_Z_DN  = H_TRAM                 # 2.100 roof top, tramming     [BS]p.7

RAIL_X     = 0.640                  # side-rail centre     DERIVED: inboard of
RAIL_W     = 0.170                  # the tyres (0.943 +/- 0.115) with room for
                                    # the mudguard. NOT SOURCED.
DECK_HALF  = 1.020                  # deck plate half-width. Just inside the
                                    # 1.0575 machine half-width [BS]p.7, so the
                                    # handrail is the widest thing on the deck
                                    # and nothing overhangs the tyres.

HOOD_Z     = 1.720                  # rear hood top        DERIVED: it must
                                    # clear the cable reel (below) and stay well
                                    # under H_TRAM = 2.100. NOT SOURCED.

# -- the rear module's two reels ----------------------------------------------
# [BS] p.5 lists "cable reel with limiting switch" and "water hose reel
# including hose" but dimensions neither. [BM] p.6 gives the JUMBO's cable reel
# as 1 600 mm dia and its water hose as 1.5 in x 70 m. 1 600 mm cannot fit under
# this machine's hood, so the diameter here is DERIVED, not borrowed:
#   hood cavity = HOOD_Z - FRAME_Z0 = 1.355 m, less ~0.13 of structure top and
#   bottom, gives ~1.10 m of clear circle. [R]S4.0 requires the reel to be
#   "the single biggest circular object on the machine" - 1.10 m beats the
#   0.966 m wheel, so the constraint is satisfied at the largest drum that
#   fits. [R]S9 W14 records 1 100 mm as "not demonstrably wrong for a small
#   bolter". NOT SOURCED as a printed figure.
REEL_R     = 0.550                  # cable reel drum radius   DERIVED (above)
REEL_W     = 0.460                  # drum width               NOT SOURCED
REEL_Y     = Y_TICK_R               # -2.037, on the printed tick [R]S4.0
REEL_Z     = 1.100                  # drum axis, high in the hood [R]S4.0
WREEL_R    = 0.300                  # water hose reel - the second, smaller reel
WREEL_W    = 0.260                  # [BS]p.5. Both NOT SOURCED.
CABLE_R    = 0.032                  # trailing cable OD/2      NOT SOURCED

# -- the bolting consumables ---------------------------------------------------
BOLT_LEN     = 2.400   # longest bolt handled, 1.5-2.4 m range   [BS]p.5
BOLT_LEN_2   = BOLT_LEN * 0.70      # 1.680 - [BS]p.5 supports dual bolt
                                    # lengths, "shorter bolt 70 % the length of
                                    # the longer". The magazine therefore holds
                                    # two lengths, and that is modelled.
MAG_BOLTS    = 10      # magazine capacity                       [BS]p.5
                       # ([GF] builds 8; [R]S9 W8b says 10.)
BOLT_OD      = 0.039   # 39 mm friction bolt. [BS]p.5 lists Split-set SS39 and
                       # SS46; [GF] models 39 mm; [R16]S B.13 gives the
                       # bolt-vs-hole rule (the hole is SMALLER than a friction
                       # bolt). 39 mm is the sourced middle of the range.
PLATE_SQ     = 0.150   # rectangular face plate, max 150 x 150   [BS]p.5
PLATE_RD_D   = 0.200   # round face plate, max dia 200           [BS]p.5
PLATE_T      = 0.008   # plate thickness                         NOT SOURCED
NUT_AF       = 0.036   # M24 nut across flats. [GF] models bolt-nut-m24;
                       # [MIN] PDF p.2 shows the domed/spherical nut cap that
                       # lets the bar sit off-square - modelled, because a flat
                       # washer face on a bolt plate is wrong ([MIN] PDF p.7:
                       # the plate bore is chamfered for 5 deg of deviation).

# -- coverage, which is what sizes the boom -----------------------------------
COV_SIDE   = 2.000   # reach either side of rig centre on the walls, with
                     # 2.4 m bolts                                [BS]p.7 diagram
COV_UP     = 4.000   # reach up the back, same condition          [BS]p.7 diagram
                     # Grid on that diagram is 500 mm.            [BS]p.7


# =============================================================================
# S2  BUILD HELPERS
# =============================================================================

def _assert_box_is_true():
    """Refuse to build a machine at the wrong size, loudly.

    See the box() note in the file header. This measures the shared library
    rather than trusting it: it asks for a box of known, deliberately
    asymmetric size and reads the dimensions back off the object. If lib/rig.py
    is still halving, it raises with the measurement in the message instead of
    exporting a half-size machine that nothing downstream can detect.

    It does NOT compensate. A x2 wrapper is right for exactly as long as the
    library is broken and wrong forever after, and this tree has already
    shipped two double-size machines that way.
    """
    probe = R.box('_boxprobe', (4.0, 2.0, 10.0), R.MAT_DARK)
    bpy.context.view_layer.update()
    got = tuple(round(v, 4) for v in probe.dimensions)
    bpy.data.objects.remove(probe, do_unlink=True)
    if got != (4.0, 2.0, 10.0):
        raise RuntimeError(
            'blender/lib/rig.py box() is not true-size: asked (4.0, 2.0, 10.0), '
            'measured %s. primitive_cube_add(size=1) makes a cube of EDGE 1 and '
            'the next line sets scale = size/2, so every box comes out at half. '
            'blender/bolter.py is authored in TRUE METRES against a correct '
            'box() and deliberately carries no compensation, because a static '
            'x2 doubles this machine the moment the library is fixed. Fix '
            'box() (size=2, or scale=size) and rebuild.' % (got,))
    print('BOLTER box() verified true-size: %s' % (got,))


def bake(o):
    """Apply every modifier, so a later join cannot silently drop a bevel."""
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
    """Convert a CURVE - every hose and the trailing cable is one - to a mesh.

    finish() and join_by_mat only look at MESH objects, so an unconverted hose
    exports as its own draw call. This machine's hose routing is its loudest
    visual feature ([R]S4.7, S5.3) and it carries a lot of them; converted
    first, the static ones all collapse into the single 'rubber' bucket.
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

    finish() refuses to touch anything under a pivot:/slide: node, because it
    has to move independently - so a dynamic subassembly would otherwise export
    one draw call per box. This collapses each one to one call per material,
    which is the floor.
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
        out.append(objs[0])
    bpy.ops.object.select_all(action='DESELECT')
    return out


def box(name, size, mat=R.MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
        bevel=0.008, seg=2):
    """R.box() with this machine's default bevel and a bevel-segment knob.

    NO SIZE COMPENSATION - see _assert_box_is_true(). `size` is metres and
    means metres. `seg` drops to a one-segment bevel for parts repeated dozens
    of times, where a second segment costs ~130 tris apiece and buys nothing.
    """
    o = R.box(name, size, mat, parent, loc, rot, bevel)
    if seg != 2 and o.modifiers:
        o.modifiers[0].segments = seg
    return o


def cheapbox(name, size, mat, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), bev=0.005):
    return box(name, size, mat, parent, loc, rot, bevel=bev, seg=1)


def cyl(name, r, h, mat, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), sides=12):
    """tube() is correct in the shared library - measured - so it is used raw."""
    return R.tube(name, r, h, mat, parent, loc, rot, sides)


def cone(name, r1, r2, h, mat, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), sides=12):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, vertices=sides)
    o = bpy.context.active_object
    o.data.transform(Matrix.Translation((0, 0, h / 2)))
    return R.part(name, o, mat, parent, loc, rot)


def torus_ring(name, major, minor, mat, parent=None, loc=(0, 0, 0),
               rot=(0, 0, 0), maj=18, min_=8):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=maj, minor_segments=min_)
    o = bpy.context.active_object
    return R.part(name, o, mat, parent, loc, rot)


def aim_tube(name, r, a, b, mat, parent=None, sides=10, shrink=0.0):
    """A cylinder spanning two points. Every link rod, tie and stay uses it."""
    a, b = Vector(a), Vector(b)
    d = b - a
    L = d.length - shrink
    if L <= 0.001:
        return None
    q = d.to_track_quat('Z', 'Y')
    return cyl(name, r, L, mat, parent, tuple(a + d.normalized() * (shrink / 2)),
               tuple(q.to_euler()), sides)


def aim_box(name, w, d, a, b, mat, parent=None, bev=0.010):
    """A box spanning two points - a fabricated member rather than a tube."""
    a, b = Vector(a), Vector(b)
    v = b - a
    L = v.length
    if L <= 0.001:
        return None
    q = v.to_track_quat('Z', 'Y')
    return box(name, (w, d, L), mat, parent, tuple((a + b) / 2),
               tuple(q.to_euler()), bevel=bev)


def bolt_ring(parent, name, radius, count, r_bolt, h, mat, loc, rot=(0, 0, 0)):
    """A ring of hex bolt heads round a flange. Pure triangle spend, and
    triangles are the lane this pipeline is allowed to spend in."""
    for i in range(count):
        a = TAU * i / count
        cyl('%s_b%d' % (name, i), r_bolt, h, mat, parent,
            (loc[0] + radius * math.cos(a), loc[1] + radius * math.sin(a), loc[2]),
            rot, sides=6)


def louvres(parent, name, count, x, y0, y1, z0, z1, mat=R.MAT_DARK, depth=0.028):
    """Pressed intake louvres. Triangles, not draw calls."""
    n = max(2, count)
    step = (z1 - z0) / n
    for i in range(n):
        z = z0 + step * (i + 0.5)
        cheapbox('%s_l%d' % (name, i), (depth, y1 - y0, step * 0.60), mat,
                 parent, (x, (y0 + y1) / 2, z), (math.radians(-26), 0, 0))


def handrail(parent, name, pts, h=1.020, r=0.021, mat=R.MAT_PAINT, posts=True):
    """A top rail, a knee rail and posts, following a polyline at deck level.

    [R]S4.6 makes the platforms and their handrails a DEFINING feature of a
    bolter rather than trim: they are what lets the feed swing back to the
    operator so he loads bolts without walking under unsupported ground
    ([BM] printed p.3). [R]S9 W10 records their absence as the biggest missing
    feature on the game's procedural bolter.
    """
    for lvl, frac in (('top', 1.0), ('knee', 0.52)):
        for i in range(len(pts) - 1):
            a = (pts[i][0], pts[i][1], pts[i][2] + h * frac)
            b = (pts[i + 1][0], pts[i + 1][1], pts[i + 1][2] + h * frac)
            aim_tube('%s_%s%d' % (name, lvl, i), r, a, b, mat, parent, sides=8)
    if posts:
        for i, p in enumerate(pts):
            cyl('%s_post%d' % (name, i), r * 1.25, h, mat, parent, p, sides=8)


# =============================================================================
# S3  CARRIER - two frames, a vertical hinge between them, and FOUR TYRES
#
#     [R]S5 lists the two silhouette facts that decide whether this reads as an
#     underground machine at all:
#       * "The break in the middle" - a visible vertical articulation pin with
#         the steering cylinders across it. If the model has a slew ring
#         instead, it stops being an underground machine ([R]S4.1).
#       * "No tracks." Four rubber tyres, wheelbase only 28 % of the machine's
#         length (2 800 of 10 020 [BS]p.7), so the wheels bunch in the middle
#         third and both overhangs are enormous. [R]S9 closes on this: "there
#         is no sprocket, no idler, no track roller and no track shoe on this
#         machine."
#
#     DRAW-CALL DECISION - the wheels are STATIC.
#     finish() excludes anything under a pivot:/slide: node from the join, so
#     four pivot:wheel-* nodes would cost 4 x 2 materials = 8 draw calls out of
#     70. Nothing consumes them: src/core/gltfRig.js binds only `mast`,
#     `carriage`, `tool` and the mount:/aim: lamps, and this machine is seen
#     parked at the face with its jacks down, not tramming. Static, the wheels
#     cost nothing and the 8 calls go to the boom and the bolting unit, which
#     is what the player is actually looking at. Promoting them later is one
#     line each and a known +8.
# =============================================================================

CLEAR_ANGLE_R = math.radians(15.0)   # clearance outside the rear axle [BS]p.5
CLEAR_ANGLE_F = math.radians(22.0)   # front. NOT in [BS]; [BM]p.6 for the same
                                     # carrier family. The front end is cut back
                                     # much more steeply than the rear [R]S4.2.


def build_wheel(parent, name, x, y):
    """One wheel: carcass, chunky block tread, dished rim, nut ring.

    9.00 x R20 [BS]p.5 -> 966 mm dia over a 508 mm rim, 229 mm section
    ([R]S3.1, derived from the tyre code and flagged as derived there).
    Tread is "deep, chunky, near-square block with wide voids - not an
    agricultural lug pattern and not a smooth industrial tyre" ([R]S4.2, off
    the [BM] printed p.2-3 photograph).
    """
    ry = (0, math.pi / 2, 0)          # tube() builds along +Z; lay it along X
    cyl(name + '_carcass', WHEEL_R * 0.90, WHEEL_W, R.MAT_RUBBER, parent,
        (x - WHEEL_W / 2 * (1 if x > 0 else 1), y, WHEEL_R), ry, sides=20)
    # sidewall shoulders, so the tyre is not a plain drum
    for s, ox in ((1, WHEEL_W * 0.5), (-1, -WHEEL_W * 0.5)):
        cone(name + ('_wall%d' % (s > 0)), WHEEL_R * 0.90, WHEEL_R * 0.80,
             WHEEL_W * 0.16, R.MAT_RUBBER, parent,
             (x - WHEEL_W / 2 + (WHEEL_W if s > 0 else 0), y, WHEEL_R),
             (0, math.pi / 2 if s > 0 else -math.pi / 2, 0), sides=20)
    # 18 blocks with wide voids, full section width
    n_lug = 18
    for i in range(n_lug):
        a = TAU * i / n_lug
        cheapbox('%s_lug%d' % (name, i),
                 (WHEEL_W * 0.86, 0.105, 0.075), R.MAT_RUBBER, parent,
                 (x, y + math.sin(a) * (WHEEL_R - 0.036),
                  WHEEL_R + math.cos(a) * (WHEEL_R - 0.036)),
                 (a, 0, 0))
    # rim: a shallow-dish centre with a ring of nuts [R]S4.2
    cyl(name + '_rim', RIM_R, WHEEL_W * 0.72, R.MAT_DARK, parent,
        (x - WHEEL_W * 0.36, y, WHEEL_R), ry, sides=16)
    cone(name + '_dish', RIM_R * 0.92, RIM_R * 0.40, 0.052, R.MAT_DARK, parent,
         (x + WHEEL_W * 0.36, y, WHEEL_R), (0, math.pi / 2, 0), sides=16)
    bolt_ring(parent, name + '_nut', RIM_R * 0.42, 8, 0.020, 0.026, R.MAT_DARK,
              (x + WHEEL_W * 0.40, y, WHEEL_R), (0, math.pi / 2, 0))
    cyl(name + '_hub', RIM_R * 0.26, 0.070, R.MAT_DARK, parent,
        (x + WHEEL_W * 0.40, y, WHEEL_R), ry, sides=12)


def build_mudguard(parent, name, x, y, back, fwd):
    """A bolted arch plate hugging the tyre, plus a side skirt.

    "Rigid steel mudguards / wheel arches ... bolted to the frame" [R]S4.2, and
    on the dedicated-bolter elevation "mudguards are bolted arch plates hugging
    the tyre closely, front and rear" [R]S4.0. Dark, because everything that
    meets the ground on this machine is the second, darker paint [R]S6.
    """
    r = WHEEL_R + 0.070
    a0, a1 = -math.radians(back), math.radians(fwd)
    n = 7
    for i in range(n):
        a = a0 + (a1 - a0) * (i + 0.5) / n
        seg = (a1 - a0) * r / n
        cheapbox('%s_arch%d' % (name, i), (WHEEL_W + 0.100, seg * 1.10, 0.026),
                 R.MAT_DARK, parent,
                 (x, y + math.sin(a) * r, WHEEL_R + math.cos(a) * r), (a, 0, 0))
    # the outer skirt that closes the arch off from the side
    sx = x + (WHEEL_W / 2 + 0.048) * (1 if x > 0 else -1)
    cheapbox(name + '_skirt', (0.020, (a1 - a0) * r * 0.92, 0.180), R.MAT_DARK,
             parent, (sx, y, WHEEL_R + r * 0.62), (0, 0, 0))


def build_axle(parent, name, y):
    """Live axle between the wheels, with its differential housing.

    [BS]p.5 lists a proprietary short axle with automatic differential lock and
    limited slip; no dimensions are published, so the tube diameter and the
    housing are NOT SOURCED and sized to sit inside the 365 mm belly line.
    """
    cyl(name + '_tube', 0.082, 2 * TRACK_X, R.MAT_DARK, parent,
        (-TRACK_X, y, WHEEL_R), (0, math.pi / 2, 0), sides=10)
    cyl(name + '_diff', 0.185, 0.300, R.MAT_CAST, parent,
        (-0.150, y, WHEEL_R), (0, math.pi / 2, 0), sides=14)
    cyl(name + '_pinion', 0.100, 0.220, R.MAT_CAST, parent,
        (0.020, y, WHEEL_R), (math.pi / 2, 0, 0), sides=10)


def build_frame(parent, name, y0, y1, nose=False, tail=False):
    """One frame module: two heavy box-section side rails, a full-length
    sloping belly skid plate, and cross members.

    "Heavy fabricated box-section side rails in dark grey/graphite, plainly a
    different colour from the ... superstructure" and "full-length sloping
    belly skid plate ... the machine's floor-contact surface and always the
    dirtiest, most scraped part of the whole machine" [R]S4.1.
    """
    L = y1 - y0
    yc = (y0 + y1) / 2
    for s in (-1, 1):
        box('%s_rail%d' % (name, s > 0), (RAIL_W, L, FRAME_D), R.MAT_DARK,
            parent, (s * RAIL_X, yc, FRAME_Z0 + FRAME_D / 2), bevel=0.012)
    box(name + '_belly', (2 * RAIL_X + RAIL_W, L * 0.94, 0.030), R.MAT_DARK,
        parent, (0, yc, FRAME_Z0 + 0.015), bevel=0.010)
    for i in range(3):
        y = y0 + L * (0.22 + 0.28 * i)
        cheapbox('%s_xmem%d' % (name, i), (2 * RAIL_X - RAIL_W, 0.110, 0.140),
                 R.MAT_DARK, parent, (0, y, FRAME_Z1 - 0.080))
    if nose:
        # "The nose below the boom pedestal slopes down and forward into a low
        # bumper/skid" [R]S4.0, at the 22 deg front clearance angle [BM]p.6.
        run = FRAME_D / math.tan(CLEAR_ANGLE_F)
        box(name + '_noseslope', (2 * RAIL_X + RAIL_W, run, 0.030), R.MAT_DARK,
            parent, (0, y1 - run / 2 + 0.02, FRAME_Z0 + FRAME_D / 2 - 0.02),
            (CLEAR_ANGLE_F - math.pi / 2, 0, 0), bevel=0.010)
        box(name + '_bumper', (W * 0.78, 0.160, 0.230), R.MAT_DARK, parent,
            (0, y1 - 0.080, FRAME_Z0 + 0.150), bevel=0.020)
        for s in (-1, 1):     # tow eyes
            cheapbox('%s_tow%d' % (name, s > 0), (0.028, 0.180, 0.130),
                     R.MAT_WORN, parent,
                     (s * 0.230, y1 - 0.060, FRAME_Z0 + 0.150))
    if tail:
        run = FRAME_D / math.tan(CLEAR_ANGLE_R)
        box(name + '_tailslope', (2 * RAIL_X + RAIL_W, run, 0.030), R.MAT_DARK,
            parent, (0, y0 + run / 2 - 0.02, FRAME_Z0 + FRAME_D / 2 - 0.02),
            (math.pi / 2 - CLEAR_ANGLE_R, 0, 0), bevel=0.010)


def build_articulation(parent):
    """The vertical hinge and the two steering cylinders across it.

    "They meet at a vertical articulation pin ... the steering cylinders sit
    across the joint, one each side, and at full lock the two modules break
    into a visible V" [R]S4.1. Steering is +/-40 deg [BS]p.5.

    The pin is a pivot: node so the game can break the machine at the hinge,
    but NOTHING is parented to it - the two frames are modelled straight,
    because a bolter at the face is set on its jacks and square to the drive.
    A hinge that is present, named and at zero is honest; a hinge that bends
    the rear module with no driver would just be a bent machine.
    """
    art = R.empty(R.NODE_PIVOT, 'articulation', parent, (0, Y_PIN, 0.760))
    art['range_deg'] = ART_DEG          # [BS]p.5
    cyl('art_pin', 0.105, 0.560, R.MAT_CAST, parent,
        (0, Y_PIN, FRAME_Z0 + 0.130), sides=14)
    for z in (FRAME_Z0 + 0.100, FRAME_Z0 + 0.560):
        cyl('art_knuckle%d' % int(z * 100), 0.165, 0.130, R.MAT_CAST, parent,
            (0, Y_PIN, z - 0.065), sides=14)
    for s in (-1, 1):
        a = (s * 0.520, Y_PIN + 0.680, 0.760)     # anchored on the front frame
        b = (s * 0.250, Y_PIN - 0.640, 0.760)     # ... and on the rear frame
        v = Vector(b) - Vector(a)
        mid = Vector(a) + v * 0.46
        aim_tube('steer_barrel%d' % (s > 0), 0.058, a, tuple(mid), R.MAT_DARK,
                 parent, sides=12)
        aim_tube('steer_rod%d' % (s > 0), 0.032, tuple(mid), b, R.MAT_CHROME,
                 parent, sides=10)
        cyl('steer_eyeA%d' % (s > 0), 0.048, 0.090, R.MAT_WORN, parent,
            (a[0], a[1], a[2] - 0.045), sides=10)
        cyl('steer_eyeB%d' % (s > 0), 0.048, 0.090, R.MAT_WORN, parent,
            (b[0], b[1], b[2] - 0.045), sides=10)
    return art


def build_carrier(root):
    build_frame(None, 'rearframe', Y_TAIL, Y_PIN - 0.060, tail=True)
    build_frame(None, 'frontframe', Y_PIN + 0.060, Y_NOSE, nose=True)
    build_articulation(None)
    for y, tag in ((Y_AXLE_R, 'r'), (Y_AXLE_F, 'f')):
        build_axle(None, 'axle_' + tag, y)
        for s in (-1, 1):
            build_wheel(None, 'wheel_%s%d' % (tag, s > 0), s * TRACK_X, y)
            build_mudguard(None, 'guard_%s%d' % (tag, s > 0), s * TRACK_X, y,
                           58 if tag == 'r' else 52, 58)


# =============================================================================
# S4  REAR MODULE - the power pack, and the two reels
#
#     [R]S4.0, working off the dedicated-bolter side elevation: "a smooth,
#     faired, sloping hood, not a boxy engine cover. It has a shallow chamfered
#     shoulder line running its whole length, a lifting eye on top, and small
#     hinged service doors let into the flank. It reads as one sculpted volume."
#     And: "the cable reel is mounted HIGH at the rear, drawn as a large circle
#     inside the hood outline, and it is the single biggest circular object on
#     the machine. It sits ABOVE the rear axle, not behind it."
#
#     What lives in here, all from [BS]p.5: a 55-72 kW diesel for tramming,
#     the 66-80 kW electrical package that does the actual drilling, a screw
#     compressor, a hydraulic water booster pump (12 bar, 66 l/min), a 60 l
#     fuel tank, 2 x 12 V 70 Ah batteries, a STAINLESS STEEL electrical
#     enclosure, and the cable and water hose reels. An underground rig is a
#     plugged-in machine at the face, not a self-powered one ([R]S2) - which is
#     why the reel, not the exhaust, is the tell.
# =============================================================================

HOOD_HALF  = 0.900   # hood half-width. Inboard of the 1.0575 machine half so
                     # the tyres are the widest thing at the rear. NOT SOURCED.
HOOD_Y1    = -0.300  # hood front face, clear of the articulation [R]S4.1
CAB_STAIN  = R.MAT_STEEL   # the electrical enclosure is "stainless steel"
                           # [BS]p.5 - bare, not painted. It is the only
                           # unpainted flat panel on the machine and [R]S9 W15
                           # calls it "a free, cheap material-contrast win".


def build_hood(parent):
    """The faired rear hood: one sculpted volume, not a boxy engine cover."""
    y0, y1 = Y_TAIL, HOOD_Y1
    L = y1 - y0
    yc = (y0 + y1) / 2
    # main body, from the frame rails up to the shoulder
    box('hood_body', (2 * HOOD_HALF, L, 1.600 - FRAME_Z1), R.MAT_PAINT, parent,
        (0, yc, (FRAME_Z1 + 1.600) / 2), bevel=0.026)
    # the chamfered shoulder cap that runs the whole length [R]S4.0
    box('hood_cap', (2 * HOOD_HALF - 0.150, L - 0.070, HOOD_Z - 1.600),
        R.MAT_PAINT, parent, (0, yc, (1.600 + HOOD_Z) / 2), bevel=0.034)
    # a slight fall towards the tail, so the volume is sculpted not extruded
    box('hood_tailfair', (2 * HOOD_HALF - 0.220, 0.560, 0.170), R.MAT_PAINT,
        parent, (0, y0 + 0.250, HOOD_Z - 0.130),
        (math.radians(-13), 0, 0), bevel=0.026)
    # hinged service doors let into the flank [R]S4.0
    for s in (-1, 1):
        for i, dy in enumerate((-2.55, -1.55)):
            box('hood_door%d_%d' % (s > 0, i), (0.024, 0.860, 0.560),
                R.MAT_PAINT, parent, (s * (HOOD_HALF + 0.012), dy, 1.180),
                bevel=0.014)
            for hz in (1.400, 0.960):     # piano hinge stubs
                cheapbox('hood_hinge%d_%d_%d' % (s > 0, i, int(hz * 100)),
                         (0.030, 0.070, 0.036), R.MAT_WORN, parent,
                         (s * (HOOD_HALF + 0.020), dy - 0.410, hz))
            cyl('hood_latch%d_%d' % (s > 0, i), 0.026, 0.040, R.MAT_WORN,
                parent, (s * (HOOD_HALF + 0.024), dy + 0.380, 1.180),
                (0, math.pi / 2, 0), sides=8)
    # lifting eye on top [R]S4.0
    torus_ring('hood_lifteye', 0.075, 0.020, R.MAT_WORN, parent,
               (0, -1.180, HOOD_Z + 0.062), (math.pi / 2, 0, 0), maj=14, min_=6)
    cheapbox('hood_liftpad', (0.150, 0.150, 0.030), R.MAT_DARK, parent,
             (0, -1.180, HOOD_Z + 0.012))
    # cooler / radiator pack behind the tail face, breathing through louvres
    box('hood_coolerframe', (2 * HOOD_HALF - 0.120, 0.055, 0.780), R.MAT_DARK,
        parent, (0, y0 + 0.030, 1.180), bevel=0.010)
    n = 9
    for i in range(n):
        z = 0.810 + (1.550 - 0.810) * (i + 0.5) / n
        cheapbox('hood_louvre%d' % i, (2 * HOOD_HALF - 0.180, 0.026, 0.062),
                 R.MAT_DARK, parent, (0, y0 + 0.006, z),
                 (math.radians(28), 0, 0))
    # exhaust and its heat shield: a diesel that only trams still has a stack
    cyl('hood_exhaust', 0.062, 0.520, R.MAT_WORN, parent,
        (0.560, -0.700, HOOD_Z - 0.040), sides=10)
    cyl('hood_exhshield', 0.082, 0.300, R.MAT_WORN, parent,
        (0.560, -0.700, HOOD_Z + 0.060), sides=10)
    # 60 l fuel tank [BS]p.5, slung between the rails where a tank actually goes
    box('fuel_tank', (0.480, 0.560, 0.360), R.MAT_DARK, parent,
        (-0.320, -0.880, FRAME_Z1 + 0.190), bevel=0.030)
    cyl('fuel_filler', 0.052, 0.070, R.MAT_WORN, parent,
        (-0.320, -0.880, FRAME_Z1 + 0.370), sides=10)
    # 2 x 12 V 70 Ah batteries [BS]p.5, in a box on the opposite side
    box('battery_box', (0.400, 0.480, 0.300), R.MAT_DARK, parent,
        (0.360, -0.880, FRAME_Z1 + 0.160), bevel=0.020)
    # fire suppression bottle - ANSUL manual or automatic [BS]p.5
    cyl('fire_bottle', 0.088, 0.520, R.MAT_HAZARD, parent,
        (0.560, -3.000, FRAME_Z1 + 0.060), sides=12)


def build_electrical_cabinet(parent):
    """The stainless electrical enclosure - the machine's one bare panel.

    [BS]p.5 "stainless steel electrical enclosure"; 380-1 000 V, soft start,
    5 kVA transformer, total installed 66-80 kW. [R]S9 W15: modelling it is a
    free material-contrast win on an otherwise single-colour machine, and it
    shares MAT_STEEL with the feed rails and the rods, so it is free in
    draw-call terms too.
    """
    x = -(HOOD_HALF + 0.075)
    box('elec_cabinet', (0.150, 0.960, 0.720), CAB_STAIN, parent,
        (x, -0.900, 1.240), bevel=0.014)
    box('elec_door', (0.026, 0.860, 0.620), CAB_STAIN, parent,
        (x - 0.086, -0.900, 1.240), bevel=0.010)
    louvres(parent, 'elec_vent', 5, x - 0.100, -1.280, -0.560, 1.360, 1.560,
            mat=CAB_STAIN, depth=0.022)
    cyl('elec_handle', 0.018, 0.180, R.MAT_WORN, parent,
        (x - 0.104, -0.520, 1.150), sides=8)
    # isolator: the one control that is always on the outside of the cabinet
    cyl('elec_isolator', 0.048, 0.060, R.MAT_HAZARD, parent,
        (x - 0.100, -1.360, 1.120), (0, -math.pi / 2, 0), sides=10)


def build_cable_reel(parent):
    """The cable reel: high in the hood, above the rear axle, and the single
    biggest circular object on the machine.

    [BS]p.5 lists "cable reel with limiting switch" but does not dimension it.
    [BM]p.6 gives 1 600 mm for the LARGER jumbo, which will not fit under this
    machine's 1 720 mm hood - so the 1 100 mm drum here is derived from the
    hood cavity (see REEL_R) and is flagged NOT SOURCED. What IS sourced is
    where it goes and how big it is relative to everything else, and [R]S5.4
    makes it one of the six thumbnail tells: "it says 'plugged in', i.e.
    underground."

    A pivot: node, because it is the one large rotating thing on the carrier
    and the game may want to reel in. The wrap of cable rides the drum; the
    trailing run to the wall socket does NOT - it is static, parented to the
    root, or it would swing with the drum.
    """
    drum = R.empty(R.NODE_PIVOT, 'cableReel', parent, (0, REEL_Y, REEL_Z))
    drum['drum_r_m'] = REEL_R
    cyl('reel_core', REEL_R * 0.46, REEL_W, R.MAT_DARK, drum,
        (-REEL_W / 2, 0, 0), (0, math.pi / 2, 0), sides=16)
    for s in (-1, 1):
        cyl('reel_flange%d' % (s > 0), REEL_R, 0.028, R.MAT_DARK, drum,
            (s * REEL_W / 2 - (0.028 if s > 0 else 0), 0, 0),
            (0, math.pi / 2, 0), sides=24)
        for i in range(6):          # spokes / stiffeners on the flange
            a = TAU * i / 6
            cheapbox('reel_spoke%d_%d' % (s > 0, i),
                     (0.022, REEL_R * 0.80, 0.050), R.MAT_DARK, drum,
                     (s * (REEL_W / 2 + 0.020),
                      math.cos(a) * REEL_R * 0.44, math.sin(a) * REEL_R * 0.44),
                     (0, 0, a))
    # the wound cable itself, a fat rubber drum inside the flanges
    cyl('reel_wrap', REEL_R * 0.86, REEL_W - 0.070, R.MAT_RUBBER, drum,
        (-(REEL_W - 0.070) / 2, 0, 0), (0, math.pi / 2, 0), sides=20)
    # slip-ring housing and the limiting switch [BS]p.5
    cyl('reel_sliprings', 0.090, 0.140, CAB_STAIN, drum,
        (REEL_W / 2, 0, 0), (0, math.pi / 2, 0), sides=12)
    cheapbox('reel_limitsw', (0.070, 0.110, 0.090), R.MAT_DARK, parent,
             (REEL_W / 2 + 0.170, REEL_Y - 0.240, REEL_Z + 0.150))
    # the fairlead the cable pays out through - "hose/cable guiding at
    # water/cable reel" is a listed fitting [BM]p.6
    for s in (-1, 1):
        cyl('reel_fairlead%d' % (s > 0), 0.036, 0.240, R.MAT_WORN, parent,
            (s * 0.170, REEL_Y - 0.640, REEL_Z - 0.300), (math.pi / 2, 0, 0),
            sides=10)
    return drum


def build_water_reel(parent):
    """The second, smaller reel: water hose [BS]p.5, 1.5 in x 70 m on the
    larger machine [BM]p.6. Static - it is small, it is never driven, and a
    second pivot would cost draw calls this machine would rather spend on the
    bolting unit."""
    x, y, z = 0.520, -2.950, 1.240
    cyl('wreel_core', WREEL_R * 0.44, WREEL_W, R.MAT_DARK, parent,
        (x - WREEL_W / 2, y, z), (0, math.pi / 2, 0), sides=12)
    for s in (-1, 1):
        cyl('wreel_flange%d' % (s > 0), WREEL_R, 0.022, R.MAT_DARK, parent,
            (x + s * WREEL_W / 2 - (0.022 if s > 0 else 0), y, z),
            (0, math.pi / 2, 0), sides=18)
    cyl('wreel_wrap', WREEL_R * 0.84, WREEL_W - 0.050, R.MAT_RUBBER, parent,
        (x - (WREEL_W - 0.050) / 2, y, z), (0, math.pi / 2, 0), sides=16)
    cyl('wreel_swivel', 0.040, 0.120, R.MAT_WORN, parent,
        (x + WREEL_W / 2, y, z), (0, math.pi / 2, 0), sides=10)


def build_air_water_package(parent):
    """Compressor, water booster pump and the wash-down kit on the rear deck.

    [BS]p.5: screw compressor; hydraulic water booster pump 12 bar / 66 l/min;
    minimum water inlet 2 bar; rig washing kit and BOOT washing kit - a bolter
    carries a wash hose because the operator's boots are in the mud [R]S4.7.
    Sizes are NOT SOURCED; these are recognisable boxes of the right kind in
    the right place, which is what [R]S4.7 asks for.
    """
    box('compressor', (0.520, 0.700, 0.480), R.MAT_DARK, parent,
        (-0.300, -1.900, FRAME_Z1 + 0.250), bevel=0.020)
    cyl('compressor_recv', 0.150, 0.560, R.MAT_DARK, parent,
        (-0.300, -1.480, FRAME_Z1 + 0.180), (math.pi / 2, 0, 0), sides=14)
    box('waterpump', (0.360, 0.420, 0.320), R.MAT_DARK, parent,
        (0.380, -1.700, FRAME_Z1 + 0.170), bevel=0.018)
    cyl('waterpump_motor', 0.105, 0.300, R.MAT_CAST, parent,
        (0.380, -1.480, FRAME_Z1 + 0.170), (math.pi / 2, 0, 0), sides=12)
    # the wash-down hose, coiled on a hook
    cyl('washhook', 0.022, 0.180, R.MAT_WORN, parent,
        (HOOD_HALF + 0.020, -2.400, 1.060), (0, math.pi / 2, 0), sides=8)
    for i in range(5):
        torus_ring('washcoil%d' % i, 0.135, 0.016, R.MAT_RUBBER, parent,
                   (HOOD_HALF + 0.115, -2.400, 1.040 - i * 0.028),
                   (0, math.pi / 2, 0), maj=16, min_=6)


def build_rear_module(root):
    build_hood(None)
    build_electrical_cabinet(None)
    build_cable_reel(root)
    build_water_reel(None)
    build_air_water_package(None)


# =============================================================================
# S5  OPERATOR STATION - the protective roof, the platforms, and the stair
#
#     This is the half of the machine that exists for a safety reason, and
#     [R]S9 W10 records its absence as "the biggest missing feature" on the
#     game's procedural bolter. Three sourced facts drive the geometry:
#
#     1. PROTECTIVE ROOF AS STANDARD, enclosed cabin as an option [BM]p.6. The
#        canopy version is "a flat, thick steel roof plate on four heavy posts,
#        open at the sides, ROPS/FOPS certified", with "a louvred / slotted
#        front edge and a broad flat cap" [R]S4.6. This model builds the
#        CANOPY, which is also why MAT_GLASS never appears in this file - and
#        with no glazing there is no way for a transmission > 0 material to get
#        in (HANDOFF S8F).
#     2. THE ROOF GOES UP AND DOWN. 2 841 mm working, 2 100 mm tramming
#        [BS]p.7 - 741 mm, a quarter of the machine's height, every time it
#        moves. [R]S9 W14b: "a big, animatable, very characteristic movement
#        the game is missing." Here it is slide:roof.
#     3. SIDE PLATFORMS AND A LIT STAIR. The feed swings all the way back to
#        the platform so the operator loads bolts "without having to pass in
#        front of the machine into areas with an unsupported roof" ([BM]
#        printed p.3, quoted in [R]S2 and S4.6). "Illuminated stairs for
#        platform" is a listed item [BS]p.5; the elevation shows "a three- or
#        four-tread open stair with a checker-plate landing" [R]S4.0.
#
#     The machine is AUTHORED IN THE WORKING POSE: roof up, jacks down, boom
#     raised. slide:roof therefore travels NEGATIVE to tram.
# =============================================================================

DECK_Y0    = 0.150   # deck plate, rear edge (just ahead of the hinge)
DECK_Y1    = 2.050   # ... and front edge (just behind the boom pedestal)
CAN_X0, CAN_X1 = -1.000, 0.120     # canopy footprint, on the LEFT
CAN_Y0, CAN_Y1 = 0.480, 1.760
POST_R     = 0.055   # "four heavy posts" [R]S4.6. NOT SOURCED as a figure.
ROOF_UND   = ROOF_Z_UP - ROOF_T    # 2.751 roof underside, working
ROOF_W     = (CAN_X1 - CAN_X0) + 0.220
ROOF_D     = (CAN_Y1 - CAN_Y0) + 0.260


def build_deck(parent):
    """Checker-plate deck, its edge kerb, and the platform handrails.

    The deck stops 37 mm inside the machine half-width (DECK_HALF vs HALF_W)
    so the handrail, not the platform, is the widest thing above the tyres and
    nothing overhangs the 2 115 mm envelope [BS]p.7.
    """
    yc = (DECK_Y0 + DECK_Y1) / 2
    box('deck_plate', (2 * DECK_HALF, DECK_Y1 - DECK_Y0, 0.026), R.MAT_DARK,
        parent, (0, yc, DECK_Z - 0.013), bevel=0.006)
    # bearers under it, on the frame rails
    for s in (-1, 1):
        cheapbox('deck_bearer%d' % (s > 0), (0.070, DECK_Y1 - DECK_Y0, 0.048),
                 R.MAT_DARK, parent, (s * RAIL_X, yc, DECK_Z - 0.050))
    # toe boards - hazard striped, because they are the edge of a working
    # platform 920 mm above a wet floor
    for s in (-1, 1):
        box('deck_toe%d' % (s > 0), (0.022, DECK_Y1 - DECK_Y0, 0.110),
            R.MAT_HAZARD, parent, (s * DECK_HALF, yc, DECK_Z + 0.055),
            bevel=0.004)
    box('deck_toe_front', (2 * DECK_HALF, 0.022, 0.110), R.MAT_HAZARD, parent,
        (0, DECK_Y1, DECK_Z + 0.055), bevel=0.004)

    # THE BOLT-LOADING PLATFORM, right flank, full length of the deck. This is
    # the one the feed swings back to [BM]p.3.
    handrail(parent, 'rail_right', [
        (DECK_HALF - 0.030, DECK_Y0 + 0.060, DECK_Z),
        (DECK_HALF - 0.030, DECK_Y1 - 0.060, DECK_Z),
        (0.200, DECK_Y1 - 0.060, DECK_Z),
    ])
    # the second platform, on the operator's side ahead of the canopy
    handrail(parent, 'rail_left', [
        (-0.220, DECK_Y1 - 0.060, DECK_Z),
        (-DECK_HALF + 0.030, DECK_Y1 - 0.060, DECK_Z),
        (-DECK_HALF + 0.030, CAN_Y1 - 0.020, DECK_Z),
    ])
    # and the return behind the operator, at the head of the stair
    handrail(parent, 'rail_rear', [
        (-DECK_HALF + 0.030, CAN_Y0 - 0.240, DECK_Z),
        (-DECK_HALF + 0.030, DECK_Y0 + 0.060, DECK_Z),
        (0.200, DECK_Y0 + 0.060, DECK_Z),
    ])


def build_stair(parent):
    """The lit access stair and its checker-plate landing [R]S4.0, [BS]p.5.

    Four levels from a 365 mm belly line to a 920 mm floor: treads at 0.32,
    0.52 and 0.72, then the landing. The bottom tread clears the belly, which
    is the constraint that sets the pitch.
    """
    x = -(DECK_HALF - 0.140)
    y0 = DECK_Y0 - 0.560
    for i, z in enumerate((0.320, 0.520, 0.720)):
        y = y0 + 0.150 * i
        box('stair_tread%d' % i, (0.520, 0.230, 0.024), R.MAT_DARK, parent,
            (x, y, z), bevel=0.005)
        cheapbox('stair_riser%d' % i, (0.520, 0.020, 0.090), R.MAT_DARK,
                 parent, (x, y - 0.105, z - 0.050))
    # stringers
    for s in (-1, 1):
        aim_box('stair_stringer%d' % (s > 0), 0.018, 0.150,
                (x + s * 0.270, y0 - 0.130, 0.280),
                (x + s * 0.270, DECK_Y0 + 0.040, DECK_Z - 0.020),
                R.MAT_DARK, parent, bev=0.006)
    handrail(parent, 'stair_rail', [
        (x - 0.290, y0 - 0.120, 0.300),
        (x - 0.290, DECK_Y0 + 0.020, DECK_Z),
    ], h=0.940, r=0.019)
    # "illuminated stairs for platform" [BS]p.5 - a lamp in the stringer
    cheapbox('stair_lamp_housing', (0.070, 0.130, 0.080), R.MAT_DARK, parent,
             (x + 0.280, y0 + 0.120, 0.560))


def build_canopy(parent):
    """The protective roof: four posts, a thick plate, and 741 mm of travel.

    Authored ROOF UP. slide:roof carries `travel_m = -0.741`, i.e. the node
    travels NEGATIVE in its own Z to reach the 2 100 mm tramming height. The
    sign is explicit here because a roof that rises above 2 841 mm is a roof
    that hits the back.

    The posts telescope: the outer sleeves are static on the deck, the inner
    posts and the plate ride the slide. That is how the real adjustment works
    ([BM]p.6 gives the canopy -80/+310 mm of MOUNTING adjustment on top of it)
    and it means the machine still has four legs at either height.
    """
    posts = [(CAN_X0, CAN_Y0), (CAN_X1, CAN_Y0), (CAN_X0, CAN_Y1), (CAN_X1, CAN_Y1)]
    for i, (px, py) in enumerate(posts):
        cyl('canopy_sleeve%d' % i, POST_R * 1.30, 0.840, R.MAT_PAINT, parent,
            (px, py, DECK_Z), sides=10)
        # the sleeve's clamp collar - the thing that actually holds the height
        cyl('canopy_collar%d' % i, POST_R * 1.55, 0.070, R.MAT_DARK, parent,
            (px, py, DECK_Z + 0.790), sides=10)

    roof = R.empty(R.NODE_SLIDE, 'roof', parent, (0, 0, 0))
    roof['travel_m'] = -ROOF_TRAV          # negative Z = down to tram
    roof['height_up_m'] = ROOF_Z_UP        # 2.841 [BS]p.7
    roof['height_down_m'] = ROOF_Z_DN      # 2.100 [BS]p.7
    for i, (px, py) in enumerate(posts):
        cyl('canopy_post%d' % i, POST_R, ROOF_UND - (DECK_Z + 0.520), R.MAT_PAINT,
            roof, (px, py, DECK_Z + 0.520), sides=10)
    cx, cy = (CAN_X0 + CAN_X1) / 2, (CAN_Y0 + CAN_Y1) / 2
    box('canopy_plate', (ROOF_W, ROOF_D, ROOF_T), R.MAT_DARK, roof,
        (cx, cy, ROOF_UND + ROOF_T / 2), bevel=0.016)
    # "a broad flat cap" over the plate, and the "louvred / slotted front
    # edge" [R]S4.6 - the FOPS grille that lets an operator see the back
    box('canopy_cap', (ROOF_W - 0.120, ROOF_D - 0.120, 0.028), R.MAT_PAINT,
        roof, (cx, cy, ROOF_Z_UP + 0.014), bevel=0.010)
    n = 7
    for i in range(n):
        sx = cx - ROOF_W / 2 + ROOF_W * (i + 0.5) / n
        cheapbox('canopy_slot%d' % i, (ROOF_W / n * 0.62, 0.150, 0.030),
                 R.MAT_DARK, roof, (sx, cy + ROOF_D / 2 - 0.075, ROOF_UND - 0.020))
    # corner gussets, because a FOPS roof is welded not bolted at the corners
    for i, (px, py) in enumerate(posts):
        cheapbox('canopy_gusset%d' % i, (0.140, 0.140, 0.026), R.MAT_PAINT,
                 roof, (px + (0.07 if px < cx else -0.07),
                        py + (0.07 if py < cy else -0.07), ROOF_UND - 0.020))
    return roof


def build_controls(parent):
    """Two operator panels for standing operation [BM]p.6, and the swingable
    seat [BS]p.5.

    The seat swings because the operator faces the boom to drill and forwards
    to tram - "a fixed forward-facing seat is a truck, not a bolter" [R]S4.6.
    It is modelled STATIC, turned to the drilling attitude, because the machine
    is authored working; a pivot: here would cost draw calls for a 30 cm prop
    that the player never sees move.
    """
    for i, (px, py, ry) in enumerate(((-0.760, 1.480, 0.42), (-0.150, 1.480, -0.42))):
        box('panel%d_console' % i, (0.320, 0.220, 0.140), R.MAT_DARK, parent,
            (px, py, DECK_Z + 0.960), (math.radians(-22), 0, ry), bevel=0.014)
        box('panel%d_stand' % i, (0.110, 0.110, 0.960), R.MAT_PAINT, parent,
            (px, py, DECK_Z + 0.480), bevel=0.010)
        for j in range(2):      # joysticks
            cyl('panel%d_stick%d' % (i, j), 0.017, 0.140, R.MAT_DARK, parent,
                (px + (j - 0.5) * 0.150, py - 0.030, DECK_Z + 1.020),
                (math.radians(-18), 0, ry), sides=8)
            cyl('panel%d_knob%d' % (i, j), 0.028, 0.055, R.MAT_RUBBER, parent,
                (px + (j - 0.5) * 0.150, py - 0.070, DECK_Z + 1.140),
                (math.radians(-18), 0, ry), sides=10)
        for j in range(4):      # the row of buttons a real console carries
            cyl('panel%d_btn%d' % (i, j), 0.013, 0.014, R.MAT_HAZARD, parent,
                (px - 0.110 + j * 0.072, py + 0.060, DECK_Z + 1.035),
                (math.radians(-22), 0, ry), sides=6)
    # the seat, swung to the drilling attitude
    seat_x, seat_y, seat_r = -0.470, 1.080, math.radians(58)
    cyl('seat_column', 0.070, 0.400, R.MAT_DARK, parent,
        (seat_x, seat_y, DECK_Z), sides=10)
    box('seat_pan', (0.420, 0.420, 0.090), R.MAT_RUBBER, parent,
        (seat_x, seat_y, DECK_Z + 0.445), (0, 0, seat_r), bevel=0.026)
    box('seat_back', (0.420, 0.100, 0.480), R.MAT_RUBBER, parent,
        (seat_x - math.sin(seat_r) * 0.200, seat_y - math.cos(seat_r) * 0.200,
         DECK_Z + 0.730), (math.radians(-9), 0, seat_r), bevel=0.026)


def build_operator_station(root):
    build_deck(None)
    build_stair(None)
    roof = build_canopy(None)
    build_controls(None)
    return roof


# =============================================================================
# S6  THE BOOM, AND HOW ITS LENGTH IS DERIVED
#
#     One heavy universal boom - a bolter takes one where a jumbo takes two or
#     three [R]S4.3. [BS]p.5 names the boom type but publishes no length, and
#     [R]S8 is explicit that no bolter feed or boom length exists in any source
#     it could reach. So both are DERIVED, and the derivation is arithmetic on
#     printed dimensions rather than a guess:
#
#       [BS]p.7 prints tramming length            10.020 m
#       [BS]p.7 chain sums to the bare carrier      6.457 m
#       => boom + feed project ahead of the nose    3.563 m   FOLDED
#
#     Folded, the boom lies horizontal and retracted and the feed lies across
#     it cradled at its middle, so that 3.563 m is spent as
#
#       (boom foot -> nose) is NEGATIVE: the foot is behind the nose
#       BOOM_LEN + FEED_BODY/2 + FEED_NOSE  -  (Y_NOSE - Y_FOOT)  =  PROJ
#
#     which solves for BOOM_LEN. Every other term is either printed or set
#     below with its own reasoning, so the boom length is the one unknown in an
#     equation of knowns. It is still NOT a published figure and is marked so.
#
#     THE FEED IS TELESCOPIC, AND THAT IS THE POINT.
#     A 2.4 m bolt [BS]p.5 needs a hole at least 50 mm longer (the game's own
#     sourced rule, [GF] spec.holeRule) - 2.45 m - and this machine is sold for
#     drives from 3 x 3 m [R]S3.1. A single-piece feed long enough to drill
#     2.45 m could not stand up in a 3 m drive. Real bolting units solve it by
#     extending: [BS]p.2 advertises "100 mm reduced feed length" and a short
#     dead length as features, which only makes sense on a telescopic unit. So
#     the hole depth here is the SUM of two strokes,
#
#       FEED_EXT (the beam pushes its centraliser onto the rock)  1.250
#     + CARR_TRAV (the drill then runs up the beam)               1.300
#     = 2.550 m of hole  >=  2.400 m bolt + 0.050 m               [BS]p.5 + [GF]
#
#     and the retracted unit is only 2.200 m tall, which stands up in a 3 m
#     drive with room over it. That closure is why these three numbers are the
#     ones chosen out of the family that would fit the same constraints.
# =============================================================================

Y_FOOT     = (Y_TICK_F + Y_NOSE) / 2   # 2.525 - the pedestal stands on the
                                       # front-frame bay bounded by the two
                                       # printed ticks [BS]p.7; the swing axis
                                       # sits at its centre. DERIVED.
Z_FOOT     = 1.440   # swing-bearing height. DERIVED: clear above the 0.920
                     # deck by half a boom depth, so the boom can swing across
                     # the front of the machine without sweeping the platform.
                     # NOT SOURCED.

FEED_BODY  = 2.200   # outer feed beam, cradle-mounted. DERIVED (see above):
                     # it must stand in a 3 x 3 m drive [R]S3.1.
FEED_EXT   = 1.250   # beam extension stroke                DERIVED (see above)
CARR_TRAV  = 1.300   # carriage stroke on the beam          DERIVED (see above)
HOLE_DEPTH = FEED_EXT + CARR_TRAV      # 2.550 m of hole for a 2.400 m bolt
FEED_NOSE  = 0.350   # centraliser + feed foot standing proud of the beam at
                     # rest. NOT SOURCED; sized off the 39 mm bolt and the
                     # dust shroud it has to carry.
FEED_W     = 0.300   # feed beam across the flats. NOT SOURCED - [R]S8 records
FEED_D     = 0.240   # that no bolter feed section is published anywhere it
                     # could reach. Sized off the drifter that has to sit in it.
CRADLE_OFF = FEED_BODY / 2             # 1.100 - the cradle takes the beam at
                                       # its middle, which is what makes the
                                       # folded arithmetic above work.

BOOM_LEN   = PROJ + Y_NOSE - Y_FOOT - CRADLE_OFF - FEED_NOSE   # 2.538 DERIVED
BOOM_TELE  = 0.900   # telescope stroke. NOT SOURCED. [BS]p.7's coverage
                     # diagram wants 2 m either side of centre with 2.4 m
                     # bolts; swing plus this stroke reaches it.
BOOM_W     = 0.290   # boom outer section. NOT SOURCED - sized so the inner
BOOM_D     = 0.270   # section and its wear pads fit inside it.

# The working pose. The machine is authored DRILLING THE BACK: feed vertical,
# collar on the sourced 4.000 m coverage height [BS]p.7.
COLLAR_Z   = COV_UP                       # 4.000 [BS]p.7 coverage diagram
TIP_Z      = COLLAR_Z - (CRADLE_OFF + FEED_NOSE)   # 2.550 boom tip height
BOOM_LIFT  = math.asin((TIP_Z - Z_FOOT) / BOOM_LEN)          # 0.4526 rad, 25.9 deg
TIP_Y      = Y_FOOT + BOOM_LEN * math.cos(BOOM_LIFT)         # 4.807

# The collar therefore lands ~1.86 m AHEAD of the nose. That is not an
# accident of the arithmetic, it is how the machine is used: it bolts the
# ground in front of itself so that the operator under the canopy is always
# standing under back that has already been supported ([R]S2 - "it parks under
# freshly blasted, unsupported ground" is the hazard the whole machine exists
# to remove).


def build_pedestal(parent):
    """The boom pedestal: a tall triangular fabrication at the extreme front.

    [R]S4.0: "the boom pedestal is a tall triangular fabrication at the extreme
    front of the front frame, carrying the machine's name badge on its flank".
    That flank is where mount:marque goes - the game's own invented marque, not
    a copied badge (DOMAIN.md S10, [R] naming rule).
    """
    y0, y1 = Y_TICK_F - 0.060, Y_NOSE - 0.120
    box('ped_base', (0.940, y1 - y0, 0.240), R.MAT_DARK, parent,
        (0, (y0 + y1) / 2, FRAME_Z1 + 0.120), bevel=0.018)
    # the two triangular cheek plates
    for s in (-1, 1):
        for i, (ay, az, by, bz) in enumerate((
                (y0 + 0.080, FRAME_Z1 + 0.240, Y_FOOT, Z_FOOT),          # back leg
                (y1 - 0.080, FRAME_Z1 + 0.240, Y_FOOT, Z_FOOT),          # front leg
                (y0 + 0.080, FRAME_Z1 + 0.240, y1 - 0.080, FRAME_Z1 + 0.240))):
            aim_box('ped_leg%d_%d' % (s > 0, i), 0.032, 0.190,
                    (s * 0.300, ay, az), (s * 0.300, by, bz), R.MAT_PAINT,
                    parent, bev=0.010)
        box('ped_web%d' % (s > 0), (0.026, (y1 - y0) * 0.62, 0.560),
            R.MAT_PAINT, parent,
            (s * 0.300, (y0 + y1) / 2, FRAME_Z1 + 0.480), bevel=0.008)
    # the swing-bearing housing at the top, with its bolt circle
    cyl('ped_bearing', 0.230, 0.230, R.MAT_CAST, parent,
        (0, Y_FOOT, Z_FOOT - 0.150), sides=18)
    bolt_ring(parent, 'ped_bearingbolt', 0.185, 12, 0.020, 0.028, R.MAT_WORN,
              (0, Y_FOOT, Z_FOOT + 0.080))
    # the badge plate on the flank - a named attachment point, not geometry
    R.empty(R.NODE_MOUNT, 'marque', parent,
            (-0.316, (y0 + y1) / 2, FRAME_Z1 + 0.480), (0, math.radians(90), 0))
    box('ped_badgeplate', (0.014, 0.520, 0.150), R.MAT_PAINT, parent,
        (-0.316, (y0 + y1) / 2, FRAME_Z1 + 0.480), bevel=0.006)
    # automatic boom lubrication on the rear part of the boom [BS]p.5
    box('ped_lubepump', (0.180, 0.200, 0.260), R.MAT_DARK, parent,
        (0.330, y0 + 0.200, FRAME_Z1 + 0.380), bevel=0.014)


def build_boom(root):
    """swing -> lift -> telescope, with the parallel-hold link and the hose
    loom that rides over the top of it.

    Node chain, and why each one exists:
      pivot:boomSwing  vertical axis. This is a BOOM on a HINGED CARRIER, not
                       a turret: the machine aims itself down the drive by
                       breaking at the articulation pin, and the boom only
                       trims from there [R]S4.1.
      pivot:boomLift   transverse axis, the one big movement.
      slide:boomTele   "square-section outer with a smaller inner that slides
                       out; the joint line and the wear-pad adjusters are
                       visible" [R]S4.3.

    THE PARALLEL-HOLD LINKAGE is modelled and it is not trim: "a second link
    rod running the length of the boom keeps the feed at a constant attitude
    while the boom lifts. This is what lets the operator set the feed square to
    the back and then just move the boom" [R]S4.3. In this file it is why
    pivot:mast is authored at exactly -BOOM_LIFT: the feed's own frame cancels
    the boom's lift, which is the linkage's job expressed as a transform.
    """
    swing = R.empty(R.NODE_PIVOT, 'boomSwing', root, (0, Y_FOOT, Z_FOOT))
    swing['axis'] = 'z'
    cyl('boom_slewhousing', 0.200, 0.260, R.MAT_CAST, swing, (0, 0, -0.130),
        sides=18)
    cyl('boom_slewcollar', 0.155, 0.120, R.MAT_PAINT, swing, (0, 0, 0.110),
        sides=14)

    lift = R.empty(R.NODE_PIVOT, 'boomLift', swing, (0, 0, 0),
                   (BOOM_LIFT, 0, 0))
    lift['axis'] = 'x'
    # the lift knuckle
    cyl('boom_knuckle', 0.135, 0.420, R.MAT_CAST, lift, (-0.210, 0, 0),
        (0, math.pi / 2, 0), sides=14)
    # outer boom section, along the boom's own +Y
    L_OUT = BOOM_LEN - 0.620
    box('boom_outer', (BOOM_W, L_OUT, BOOM_D), R.MAT_PAINT, lift,
        (0, L_OUT / 2 + 0.140, 0), bevel=0.016)
    # wear-pad adjuster bosses at the mouth of the outer section [R]S4.3
    for s in (-1, 1):
        for zz in (BOOM_D / 2 - 0.020, -BOOM_D / 2 + 0.020):
            cyl('boom_pad%d_%d' % (s > 0, zz > 0), 0.026, 0.030, R.MAT_WORN,
                lift, (s * (BOOM_W / 2 - 0.030), L_OUT + 0.120, zz), sides=6)
    # the parallel-hold link rod, running the whole length beside the boom
    aim_tube('boom_parlink', 0.030, (0.185, 0.060, 0.150),
             (0.185, L_OUT + 0.060, 0.150), R.MAT_STEEL, lift, sides=8)
    cyl('boom_parbell', 0.070, 0.110, R.MAT_WORN, lift, (0.185, 0.030, 0.150),
        (0, math.pi / 2, 0), sides=10)

    tele = R.empty(R.NODE_SLIDE, 'boomTele', lift, (0, L_OUT + 0.020, 0))
    tele['travel_m'] = BOOM_TELE
    tele['axis'] = 'y'
    L_IN = BOOM_LEN - (L_OUT + 0.020)
    box('boom_inner', (BOOM_W * 0.78, L_IN + 0.360, BOOM_D * 0.78), R.MAT_PAINT,
        tele, (0, L_IN / 2 - 0.180, 0), bevel=0.012)
    # head casting at the tip
    cyl('boom_head', 0.150, 0.340, R.MAT_CAST, tele, (-0.170, L_IN, 0),
        (0, math.pi / 2, 0), sides=14)

    # -- the lift cylinder: barrel on the pedestal, chrome rod to the boom ----
    # "one large cylinder under the boom, rod-out when the boom is up ... rods
    # are bright chrome / Ni-Cr plated ... a chrome rod standing 400-800 mm
    # proud of its barrel is the strongest single 'this machine is under load
    # right now' cue in the whole model" [R]S4.3, [BS]p.5 Ni-Cr plated rods.
    a = Vector((0, Y_FOOT - 0.520, Z_FOOT - 0.560))            # pedestal anchor
    b_local = Vector((0, BOOM_LEN * 0.46, -BOOM_D / 2 - 0.075))  # on the boom
    b = Vector((0, Y_FOOT, Z_FOOT)) + Vector((
        0,
        b_local.y * math.cos(BOOM_LIFT) - b_local.z * math.sin(BOOM_LIFT),
        b_local.y * math.sin(BOOM_LIFT) + b_local.z * math.cos(BOOM_LIFT)))
    v = b - a
    mid = a + v * 0.54
    ramp = R.empty(R.NODE_PIVOT, 'boomRam', root, tuple(a))
    aim_tube('boomram_barrel', 0.085, tuple(a), tuple(mid), R.MAT_DARK, root,
             sides=14)
    aim_tube('boomram_rod', 0.046, tuple(mid), tuple(b), R.MAT_CHROME, root,
             sides=12)
    cyl('boomram_gland', 0.092, 0.070, R.MAT_WORN, root, tuple(mid),
        tuple((b - a).to_track_quat('Z', 'Y').to_euler()), sides=12)
    for p in (a, b):
        cyl('boomram_eye%d' % (p is b), 0.062, 0.110, R.MAT_WORN, root,
            (p.x - 0.055, p.y, p.z), (0, math.pi / 2, 0), sides=10)

    return swing, lift, tele, L_IN


def build_boom_hoses(lift, tele, L_out, L_in):
    """The hose loom over the top of the boom, on saddle clamps.

    "The hose loom runs OVER the top of the boom in a shallow arc, on a row of
    regularly spaced saddle clamps - the drawing shows roughly eight clamps
    along the boom. This is the single most characteristic service detail of
    the machine, and it is drawn as an ordered run, not a mess" [R]S4.0.
    And [R]S5.3 makes the catenary one of the six thumbnail tells: "thick
    spiral-wrapped bundles hanging in visible loops ... a fat black scribble
    across the yellow. Recognisable at 64 px."

    So: an ORDERED run over the boom, and a DEEP FREE LOOP where it leaves the
    frame. The loops are generous, not tight - they have to survive full boom
    articulation, and "get the loop slack wrong and the machine reads as a toy"
    [R]S4.7.
    """
    n_clamp = 8
    for i in range(n_clamp):
        y = 0.220 + (L_out - 0.320) * i / (n_clamp - 1)
        cheapbox('boom_saddle%d' % i, (0.150, 0.048, 0.058), R.MAT_DARK, lift,
                 (0, y, BOOM_D / 2 + 0.030))
        cheapbox('boom_saddlecap%d' % i, (0.160, 0.040, 0.018), R.MAT_WORN,
                 lift, (0, y, BOOM_D / 2 + 0.062))
    # four hoses riding those saddles in a shallow arc
    for j, (dx, rr) in enumerate(((-0.050, 0.024), (-0.017, 0.024),
                                  (0.017, 0.028), (0.050, 0.021))):
        pts = []
        for i in range(6):
            t = i / 5.0
            y = 0.180 + (L_out + 0.140) * t
            z = BOOM_D / 2 + 0.072 + math.sin(t * math.pi) * 0.045
            pts.append((dx, y, z))
        R.hose('boom_hose%d' % j, pts, radius=rr, parent=lift, sides=6)
    # the drag loop that serves the sliding inner section
    R.hose('boom_teleloop', [
        (0.075, L_out - 0.320, BOOM_D / 2 + 0.080),
        (0.135, L_out + 0.140, BOOM_D / 2 + 0.310),
        (0.100, L_out + 0.560, BOOM_D / 2 + 0.180),
        (0.060, L_out + L_in + 0.060, BOOM_D / 2 - 0.010),
    ], radius=0.026, parent=lift, sides=6)
