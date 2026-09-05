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
# A DEFECT IN THE SHARED MATERIAL CONTRACT, FOUND WHILE BUILDING THIS MACHINE
# -------------------------------------------------------------------------
# `blender/lib/rig.py` declares MAT_DARK = 'paintedDark' for "chassis, frames,
# guarding". THERE IS NO `paintedDark` KIND IN src/core/assets.js. Its KINDS
# table runs paintedSteel, rawSteel, wornSteel, carbide, castIron, chrome,
# rubber, hose, plastic, glass, ... and `resolveKind()` answers an unknown kind
# by warning once and SUBSTITUTING rawSteel. The procedural rigs never hit it
# because rigFactory.js gets its dark from
#     material(ctx, 'paintedSteel', { color: 0x232A33, roughness: .62, ... })
# - paintedSteel with a colour override, not a kind of its own.
#
# So every Blender-authored machine's chassis, belly plate, mudguards, boom
# saddles and deck currently resolve to BRIGHT BARE STEEL in game. That is the
# exact contrast [R]S6 and [R]S9 W18 call the single biggest realism win on
# this machine - "a dark chassis under a bright body would do more for realism
# than any added geometry" - inverted.
#
# NOT FIXED HERE. lib/rig.py and assets.js both belong to other people, and
# this file keeps the library's declared constant rather than quietly routing
# around a bug that affects all ten machines. The fix is one of: add a
# `paintedDark` kind to assets.js KINDS, or have the glTF loader map the name
# onto paintedSteel with the 0x232A33 override rigFactory already uses.
# Reported rather than worked around.
#
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


def bolt_ring(parent, name, radius, count, r_bolt, h, mat, loc, rot=(0, 0, 0),
              plane='xy'):
    """A ring of hex bolt heads round a flange. Pure triangle spend, and
    triangles are the lane this pipeline is allowed to spend in.

    `plane` is not decoration. A wheel flange faces sideways, so its nut ring
    lies in YZ; laying it out in XY instead threw the nuts 107 mm outboard of
    the tyre and put the machine 246 mm over its published 2 115 mm width.
    Only measuring the exported mesh shows that - it is invisible in the code.
    """
    for i in range(count):
        a = TAU * i / count
        c, sn = math.cos(a) * radius, math.sin(a) * radius
        off = (0.0, c, sn) if plane == 'yz' else (c, sn, 0.0)
        cyl('%s_b%d' % (name, i), r_bolt, h, mat, parent,
            (loc[0] + off[0], loc[1] + off[1], loc[2] + off[2]), rot, sides=6)


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

    EVERY PART IS PLACED FROM THE OUTBOARD TYRE FACE AND GROWS INWARD. The
    published 2 115 mm is measured OVER THE TYRES [BS]p.7, so the outer face of
    the tyre IS the width of the machine and nothing - hub, dish, nut, sidewall
    - may cross it. Building the hub and the sidewalls outward instead put this
    machine 84 mm over its own published width, which only showed up when the
    exported mesh was measured (HANDOFF S8E).
    """
    ob = 1.0 if x > 0 else -1.0                    # +1 = outboard is +X
    x_out = x + ob * WHEEL_W / 2                   # the 2 115 mm line
    x_in = x - ob * WHEEL_W / 2
    ax_out = (0, math.pi / 2 if ob > 0 else -math.pi / 2, 0)   # +Z -> outboard
    ax_in = (0, -math.pi / 2 if ob > 0 else math.pi / 2, 0)    # +Z -> inboard

    # THE CARCASS CARRIES THE TREAD; the tread is a 32 mm block, not a tooth.
    # The first pass gave it 75 mm of relief on a 483 mm radius and rotated
    # each block by +a instead of -a, so every block leaned the wrong way and
    # its corners flew off the tyre. Rendered, the wheel read as a saw blade.
    # A rotation sign is exactly the class of error that is invisible in source
    # and obvious in one picture (REVIEW_RUBRIC axis 4).
    r_c = WHEEL_R - 0.030                       # carcass radius under the tread
    cyl(name + '_carcass', r_c, WHEEL_W, R.MAT_RUBBER, parent,
        (x_in, y, WHEEL_R), ax_out, sides=24)
    # sidewall shoulders, each growing INWARD from its own face
    cone(name + '_wallo', r_c * 0.86, r_c, WHEEL_W * 0.18,
         R.MAT_RUBBER, parent, (x_out, y, WHEEL_R), ax_in, sides=24)
    cone(name + '_walli', r_c * 0.86, r_c, WHEEL_W * 0.18,
         R.MAT_RUBBER, parent, (x_in, y, WHEEL_R), ax_out, sides=24)
    # 24 near-square blocks with wide voids [R]S4.2, tips 2 mm proud of the
    # nominal radius so the machine stands on its grousers
    n_lug = 24
    for i in range(n_lug):
        a = TAU * i / n_lug
        rr = r_c + 0.016
        cheapbox('%s_lug%d' % (name, i),
                 (WHEEL_W * 0.84, 0.082, 0.032), R.MAT_RUBBER, parent,
                 (x, y + math.sin(a) * rr, WHEEL_R + math.cos(a) * rr),
                 (-a, 0, 0))
    # rim: a shallow-dish centre with a ring of nuts [R]S4.2
    cyl(name + '_rim', RIM_R, WHEEL_W * 0.72, R.MAT_DARK, parent,
        (x - ob * WHEEL_W * 0.36, y, WHEEL_R), ax_out, sides=16)
    cone(name + '_dish', RIM_R * 0.92, RIM_R * 0.40, 0.052, R.MAT_DARK, parent,
         (x + ob * (WHEEL_W / 2 - 0.052), y, WHEEL_R), ax_out, sides=16)
    # Bare steel, not paint: [R]S4.2 wants "a visible ring of wheel nuts on a
    # shallow-dish centre", and nuts painted the same dark as the rim they sit
    # in are not visible. Wheel nuts are bare on every machine anyway.
    bolt_ring(parent, name + '_nut', RIM_R * 0.42, 8, 0.021, 0.028, R.MAT_WORN,
              (x + ob * (WHEEL_W / 2 - 0.032), y, WHEEL_R), ax_out, plane='yz')
    cyl(name + '_hub', RIM_R * 0.26, 0.070, R.MAT_DARK, parent,
        (x + ob * (WHEEL_W / 2 - 0.070), y, WHEEL_R), ax_out, sides=12)


def build_mudguard(parent, name, x, y, back, fwd):
    """A bolted arch plate hugging the tyre, plus a side skirt.

    "Rigid steel mudguards / wheel arches ... bolted to the frame" [R]S4.2, and
    on the dedicated-bolter elevation "mudguards are bolted arch plates hugging
    the tyre closely, front and rear" [R]S4.0. Dark, because everything that
    meets the ground on this machine is the second, darker paint [R]S6.
    """
    # 2 115 mm is measured OVER THE TYRES [BS]p.7, so nothing may stand proud
    # of one. The arch is exactly tyre width and the skirt closes it from
    # INBOARD - which is also right for a machine that works in a drive, where
    # anything projecting past the tyre catches the rib.
    r = WHEEL_R + 0.070
    a0, a1 = -math.radians(back), math.radians(fwd)
    n = 7
    for i in range(n):
        a = a0 + (a1 - a0) * (i + 0.5) / n
        seg = (a1 - a0) * r / n
        # rot -a, not +a. With +a every plate was mirrored about the radius
        # and the guard splayed off the tyre like a paper fan - plainly wrong
        # in the first side elevation, invisible in the code.
        cheapbox('%s_arch%d' % (name, i), (WHEEL_W, seg * 1.14, 0.026),
                 R.MAT_DARK, parent,
                 (x, y + math.sin(a) * r, WHEEL_R + math.cos(a) * r), (-a, 0, 0))
    sx = x - (WHEEL_W / 2 + 0.030) * (1 if x > 0 else -1)
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
        # bumper/skid" [R]S4.0, rising at the 22 deg front clearance angle
        # [BM]p.6. It is a CHAMFER on the belly, not a full-depth plate:
        # sizing it as FRAME_D / tan(angle) made a 1.87 m plate that swung
        # 306 mm BELOW the floor. Caught by measuring the mesh; invisible in
        # the source (HANDOFF S8E - read the figure off the mesh).
        run = 0.520
        box(name + '_noseslope', (2 * RAIL_X + RAIL_W, run, 0.030), R.MAT_DARK,
            parent, (0, y1 - run / 2, FRAME_Z0 + 0.100),
            (CLEAR_ANGLE_F, 0, 0), bevel=0.010)
        box(name + '_bumper', (W * 0.78, 0.160, 0.230), R.MAT_DARK, parent,
            (0, y1 - 0.080, FRAME_Z0 + 0.150), bevel=0.020)
        for s in (-1, 1):     # tow eyes
            cheapbox('%s_tow%d' % (name, s > 0), (0.028, 0.180, 0.130),
                     R.MAT_WORN, parent,
                     (s * 0.230, y1 - 0.060, FRAME_Z0 + 0.150))
    if tail:
        run = 0.620
        box(name + '_tailslope', (2 * RAIL_X + RAIL_W, run, 0.030), R.MAT_DARK,
            parent, (0, y0 + run / 2, FRAME_Z0 + 0.090),
            (-CLEAR_ANGLE_R, 0, 0), bevel=0.010)


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

HOOD_HALF  = 0.860   # hood half-width. Set so the cabinet, its door, its
                     # louvres and the wash kit hung off the flank all stay
                     # INSIDE the published 2 115 mm over tyres. NOT SOURCED.
HOOD_Y1    = -0.300  # hood front face, clear of the articulation [R]S4.1
CAB_STAIN  = R.MAT_STEEL   # the electrical enclosure is "stainless steel"
                           # [BS]p.5 - bare, not painted. It is the only
                           # unpainted flat panel on the machine and [R]S9 W15
                           # calls it "a free, cheap material-contrast win".


def build_hood(parent):
    """The faired rear hood, WITH AN OPEN BAY OVER THE CABLE REEL.

    [R]S5.4 makes the reel one of the six thumbnail tells - "a circle standing
    above the rear deck, with a cable running away from it along the floor. It
    says 'plugged in', i.e. underground." The first build put it inside a
    closed hood and it vanished: correct in the node graph, absent from every
    render. [R]S4.0's source is a LINE elevation, where a drum inside an
    outline is still visible; a solid model has to open the flank.

    So the hood is two volumes with a reel bay between them, spanned by the
    shoulder cap above and two frame posts each side. That is also how the
    machine really reads in photographs of this class, where the drum and the
    cable leaving it are plainly in view at the tail.
    """
    y0, y1 = Y_TAIL, HOOD_Y1
    L = y1 - y0
    yc = (y0 + y1) / 2
    BAY0, BAY1 = REEL_Y - 0.600, REEL_Y + 0.600      # the open reel bay
    # machinery bay, forward of the reel
    box('hood_bodyF', (2 * HOOD_HALF, y1 - BAY1, 1.600 - FRAME_Z1), R.MAT_PAINT,
        parent, (0, (BAY1 + y1) / 2, (FRAME_Z1 + 1.600) / 2), bevel=0.026)
    # cooler bay, behind the reel
    box('hood_bodyR', (2 * HOOD_HALF, BAY0 - y0, 1.600 - FRAME_Z1), R.MAT_PAINT,
        parent, (0, (y0 + BAY0) / 2, (FRAME_Z1 + 1.600) / 2), bevel=0.026)
    # the four corner posts that carry the cap across the open bay
    for s in (-1, 1):
        for by in (BAY0, BAY1):
            cheapbox('hood_baypost%d_%d' % (s > 0, by > REEL_Y),
                     (0.075, 0.075, 1.600 - FRAME_Z1), R.MAT_PAINT, parent,
                     (s * (HOOD_HALF - 0.038), by, (FRAME_Z1 + 1.600) / 2))
        cheapbox('hood_baysill%d' % (s > 0), (0.075, BAY1 - BAY0, 0.110),
                 R.MAT_PAINT, parent,
                 (s * (HOOD_HALF - 0.038), REEL_Y, FRAME_Z1 + 0.055))
    # the chamfered shoulder cap that runs the whole length [R]S4.0
    box('hood_cap', (2 * HOOD_HALF - 0.150, L - 0.070, HOOD_Z - 1.600),
        R.MAT_PAINT, parent, (0, yc, (1.600 + HOOD_Z) / 2), bevel=0.034)
    # a slight fall towards the tail, so the volume is sculpted not extruded
    box('hood_tailfair', (2 * HOOD_HALF - 0.220, 0.560, 0.170), R.MAT_PAINT,
        parent, (0, y0 + 0.250, HOOD_Z - 0.130),
        (math.radians(-13), 0, 0), bevel=0.026)
    # hinged service doors let into the flank [R]S4.0, clear of the reel bay
    for s in (-1, 1):
        for i, dy in enumerate((-3.020, -0.860)):
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
    x = -(HOOD_HALF + 0.045)
    box('elec_cabinet', (0.150, 0.960, 0.720), CAB_STAIN, parent,
        (x, -0.900, 1.240), bevel=0.014)
    box('elec_door', (0.026, 0.860, 0.620), CAB_STAIN, parent,
        (x - 0.086, -0.900, 1.240), bevel=0.010)
    louvres(parent, 'elec_vent', 5, x - 0.085, -1.280, -0.560, 1.360, 1.560,
            mat=CAB_STAIN, depth=0.022)
    cyl('elec_handle', 0.018, 0.180, R.MAT_WORN, parent,
        (x - 0.098, -0.520, 1.150), sides=8)
    # isolator: the one control that is always on the outside of the cabinet
    cyl('elec_isolator', 0.042, 0.042, R.MAT_HAZARD, parent,
        (x - 0.086, -1.360, 1.120), (0, -math.pi / 2, 0), sides=10)


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
    # PAINTED flanges, not dark. Built in the chassis grey they were a dark
    # disc inside a dark bay and disappeared in every render - present in the
    # node graph, absent from the picture, which is the one failure [R]S5.4
    # says this machine cannot afford: the reel is a thumbnail tell.
    for s in (-1, 1):
        cyl('reel_flange%d' % (s > 0), REEL_R, 0.028, R.MAT_PAINT, drum,
            (s * REEL_W / 2 - (0.028 if s > 0 else 0), 0, 0),
            (0, math.pi / 2, 0), sides=24)
        for i in range(6):          # spokes / stiffeners on the flange
            a = TAU * i / 6
            cheapbox('reel_spoke%d_%d' % (s > 0, i),
                     (0.022, REEL_R * 0.80, 0.050), R.MAT_PAINT, drum,
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
    # the A-frame the drum turns in, which is what makes it read as mounted
    # rather than floating in the bay
    for s in (-1, 1):
        aim_box('reel_leg%d_f' % (s > 0), 0.055, 0.150,
                (s * (REEL_W / 2 + 0.075), REEL_Y, REEL_Z),
                (s * (REEL_W / 2 + 0.075), REEL_Y - 0.330, FRAME_Z1),
                R.MAT_DARK, parent, bev=0.008)
        aim_box('reel_leg%d_r' % (s > 0), 0.055, 0.150,
                (s * (REEL_W / 2 + 0.075), REEL_Y, REEL_Z),
                (s * (REEL_W / 2 + 0.075), REEL_Y + 0.330, FRAME_Z1),
                R.MAT_DARK, parent, bev=0.008)
        cyl('reel_bearing%d' % (s > 0), 0.075, 0.090, R.MAT_CAST, parent,
            (s * (REEL_W / 2 + 0.040), REEL_Y, REEL_Z), (0, math.pi / 2, 0),
            sides=12)
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
    x, y, z = 0.560, -3.140, 0.860
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
    # Forward of the reel bay, under the closed part of the hood. They sat in
    # the open bay in the first build and stood between the camera and the
    # drum - the one object at the tail that has to be seen.
    box('compressor', (0.520, 0.640, 0.480), R.MAT_DARK, parent,
        (-0.300, -1.030, FRAME_Z1 + 0.250), bevel=0.020)
    cyl('compressor_recv', 0.140, 0.500, R.MAT_DARK, parent,
        (-0.300, -0.620, FRAME_Z1 + 0.180), (math.pi / 2, 0, 0), sides=14)
    box('waterpump', (0.360, 0.400, 0.320), R.MAT_DARK, parent,
        (0.380, -1.040, FRAME_Z1 + 0.170), bevel=0.018)
    cyl('waterpump_motor', 0.105, 0.280, R.MAT_CAST, parent,
        (0.380, -0.680, FRAME_Z1 + 0.170), (math.pi / 2, 0, 0), sides=12)
    # the wash-down hose, coiled on a hook on the rear hood section
    cyl('washhook', 0.022, 0.140, R.MAT_WORN, parent,
        (HOOD_HALF + 0.020, -3.140, 1.060), (0, math.pi / 2, 0), sides=8)
    for i in range(5):
        torus_ring('washcoil%d' % i, 0.135, 0.016, R.MAT_RUBBER, parent,
                   (HOOD_HALF + 0.095, -3.140, 1.040 - i * 0.028),
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
CAN_X0, CAN_X1 = -0.960, 0.140     # canopy footprint, on the LEFT
CAN_Y0, CAN_Y1 = 0.480, 1.760
POST_R     = 0.055   # "four heavy posts" [R]S4.6. NOT SOURCED as a figure.
ROOF_UND   = ROOF_Z_UP - ROOF_T    # 2.751 roof underside, working
ROOF_W     = (CAN_X1 - CAN_X0) + 0.180
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
    x = -(DECK_HALF - 0.230)
    y0 = DECK_Y0 - 0.560
    for i, z in enumerate((0.320, 0.520, 0.720)):
        y = y0 + 0.150 * i
        box('stair_tread%d' % i, (0.470, 0.230, 0.024), R.MAT_DARK, parent,
            (x, y, z), bevel=0.005)
        cheapbox('stair_riser%d' % i, (0.470, 0.020, 0.090), R.MAT_DARK,
                 parent, (x, y - 0.105, z - 0.050))
    # stringers
    for s in (-1, 1):
        aim_box('stair_stringer%d' % (s > 0), 0.018, 0.150,
                (x + s * 0.245, y0 - 0.130, 0.280),
                (x + s * 0.245, DECK_Y0 + 0.040, DECK_Z - 0.020),
                R.MAT_DARK, parent, bev=0.006)
    handrail(parent, 'stair_rail', [
        (x - 0.235, y0 - 0.120, 0.300),
        (x - 0.235, DECK_Y0 + 0.020, DECK_Z),
    ], h=0.940, r=0.019)
    # "illuminated stairs for platform" [BS]p.5 - a lamp in the stringer
    cheapbox('stair_lamp_housing', (0.070, 0.130, 0.080), R.MAT_DARK, parent,
             (x + 0.250, y0 + 0.120, 0.560))


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
# S6  THE BOOM
#
#     One heavy universal boom - a bolter takes one where a jumbo takes two or
#     three [R]S4.3. The boom TYPE is named on [BS]p.5, and the type's own
#     specification is published in full, so unlike almost everything else on
#     the working end these are printed numbers, not derivations:
#
#       boom extension        1 250 mm          [BS]p.7 boom table
#       feed extension        0 - 400 mm        [BS]p.7 boom table
#       feed roll-over        240 deg           [BS]p.7  (360 deg on the S10)
#       max lifting angle     +70 / -30 deg     [BS]p.7
#       max swinging angle    +/- 45 deg        [BS]p.7
#       boom weight           2 550 kg          [BS]p.7
#
#     NOTE WHAT THAT CORRECTS. "Feed extension" is 400 mm, not metres, and it
#     is a POSITIONING stroke - it presses the feed's front foot onto the rock
#     to hold the collar. It adds nothing to hole depth. The 1 250 mm figure is
#     the BOOM's telescope. Confusing the two would have put a metre of
#     imaginary drilling stroke into this machine.
#
#     BOOM LENGTH is still not published, and is derived from an equation whose
#     every other term is printed:
#
#       [BS]p.7   tramming length                     10.020 m
#       [BS]p.7   chain sums to the bare carrier       6.457 m
#       =>        boom + feed project ahead of the nose 3.563 m  FOLDED
#
#       BOOM_LEN = PROJ + (Y_NOSE - Y_FOOT) - (FEED_BODY - CRADLE_OFF + FEED_NOSE)
#                = 3.563 + 0.425 - 2.474
#                = 1.514 m
#
#     AND IT IS CROSS-CHECKED AGAINST A SECOND, INDEPENDENT PRINTED FIGURE.
#     [BS]p.7's coverage diagram says the machine reaches 2.000 m either side
#     of rig centre with 2.4 m bolts. Boom fully extended is 1.514 + 1.250 =
#     2.764 m, and at the printed +/-45 deg swing limit that is
#     2.764 x sin 45 = 1.954 m of lateral reach. Two numbers from different
#     tables on the same page agree to 46 mm. That agreement is the reason to
#     believe the derivation; without it, 1.514 would just be a number.
# =============================================================================

BOOM_TELE   = 1.250              # boom extension                  [BS]p.7
FEED_EXT    = 0.400              # feed extension, 0-400 mm        [BS]p.7
FEED_ROLL   = math.radians(240)  # feed roll-over                  [BS]p.7
LIFT_MAX    = math.radians(70)   # max lifting angle               [BS]p.7
LIFT_MIN    = math.radians(-30)  # ...                             [BS]p.7
SWING_MAX   = math.radians(45)   # max swinging angle              [BS]p.7
BOOM_MASS   = 2550               # boom only, kg                   [BS]p.7

Y_FOOT     = (Y_TICK_F + Y_NOSE) / 2   # 2.525 - the pedestal stands on the
                                       # front-frame bay bounded by the two
                                       # printed ticks [BS]p.7; the swing axis
                                       # sits at its centre. DERIVED.
Z_FOOT     = 1.240   # swing-bearing height above ground. DERIVED: the
                     # pedestal is "a tall triangular fabrication at the
                     # extreme front of the front frame" [R]S4.0, so the
                     # bearing sits 375 mm above the frame rails. NOT SOURCED.

# -- the feed, i.e. the bolting unit --------------------------------------
# [R]S8 and the web sweep agree: NO manufacturer publishes a bolting-unit feed
# length. Epiroc publishes only the feed EXTENSION and a relative claim of
# "100 mm reduced overall feed length" versus earlier units. So the length here
# comes from the one competitor that DOES publish it, on a directly comparable
# machine:
#
#   Sandvik DS411 specification sheet TS2-051:11 (2022),
#   https://www.mining.sandvik/globalassets/products/underground-drill-rigs-
#   and-bolters/pdf/ds411-specification-sheet-english.pdf
#   "Bolt head length max 4 142 mm" for the BH30 head, which takes 1.5-3.0 m
#   bolts. The BH24 head on the same table takes 1.5-2.4 m bolts.
#
# One bolting head differs from another by the bolt it has to hold, so a head
# for a 2.4 m bolt is a head for a 3.0 m bolt less 600 mm:
#     4.142 - 0.600 = 3.542  ->  FEED_BODY = 3.540 m
#
# CROSS-CHECK, and it is the reason this number is used rather than a guess:
# build the same length up from the parts instead, and it must come out the
# same. Carriage stroke has to equal the hole, which is the bolt plus the 50 mm
# the game's own sourced rule demands ([GF] spec.holeRule, "Hole smaller than
# the bolt, and at least 50 mm longer"): 2.400 + 0.050 = 2.450. Add the rock
# drill, 0.735 m PRINTED (see S7). That is 3.185, leaving 0.355 m of shank,
# chuck and dead length in a 3.540 m unit - and [BS]p.2 advertises a SHORT dead
# length as a feature of this exact unit. The two roads meet.
FEED_BODY  = 3.540   # DERIVED from Sandvik DS411 TS2-051:11 BH30 = 4 142 mm
CARR_TRAV  = 2.450   # carriage stroke = hole depth = 2.400 bolt + 0.050
                     # [BS]p.5 bolt length + [GF] spec.holeRule
HOLE_DEPTH = CARR_TRAV   # feed extension is POSITIONING, not penetration
FEED_NOSE  = 0.350   # centraliser + dust shroud + feed foot standing proud of
                     # the beam. NOT SOURCED.
FEED_W     = 0.320   # feed beam across the flats. DERIVED: it has to carry a
FEED_D     = 0.250   # drill 290 mm wide over its connectors (S7). NOT SOURCED.
CRADLE_OFF = 0.40 * FEED_BODY    # 1.416 - the cradle takes the beam BELOW its
                                 # middle, so most of the unit stands above the
                                 # boom tip. That is what lets a 1.5 m boom put
                                 # a collar 4.6 m up. DERIVED; the 0.40 is the
                                 # value that closes the folded-length equation
                                 # above AND the coverage cross-check.

BOOM_LEN   = PROJ + (Y_NOSE - Y_FOOT) - (FEED_BODY - CRADLE_OFF + FEED_NOSE)
BOOM_W     = 0.290   # boom outer section. NOT SOURCED - sized so the inner
BOOM_D     = 0.270   # section and its wear pads fit inside it.

# -- the working pose ---------------------------------------------------------
# The machine is authored DRILLING THE BACK: feed vertical, collar on the rock.
# COLLAR_Z is a POSE choice and it is declared as one. [BS]p.7's coverage
# diagram gives 4.000 m of roof coverage with 2.4 m bolts, and [BS]p.2 rates
# the same machine for heading heights up to 7.5 m; the game's own underground
# drive is 5 x 5 m (research/16-site-archetypes.md, HANDOFF S11). 4.600 m sits
# inside both envelopes and puts the plate against the back of the game's own
# drive instead of a metre below it.
COLLAR_Z   = 4.600
COV_CHECK  = (BOOM_LEN + BOOM_TELE) * math.sin(SWING_MAX)   # 1.954 vs 2.000
TIP_Z      = COLLAR_Z - (FEED_BODY - CRADLE_OFF + FEED_NOSE)     # 2.126
BOOM_LIFT  = math.asin((TIP_Z - Z_FOOT) / BOOM_LEN)              # 35.8 deg
TIP_Y      = Y_FOOT + BOOM_LEN * math.cos(BOOM_LIFT)             # 3.753


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
    for s in (-1, 1):
        for i, (ay, az, by, bz) in enumerate((
                (y0 + 0.080, FRAME_Z1 + 0.240, Y_FOOT, Z_FOOT),
                (y1 - 0.080, FRAME_Z1 + 0.240, Y_FOOT, Z_FOOT),
                (y0 + 0.080, FRAME_Z1 + 0.240, y1 - 0.080, FRAME_Z1 + 0.240))):
            aim_box('ped_leg%d_%d' % (s > 0, i), 0.032, 0.190,
                    (s * 0.300, ay, az), (s * 0.300, by, bz), R.MAT_PAINT,
                    parent, bev=0.010)
        box('ped_web%d' % (s > 0), (0.026, (y1 - y0) * 0.62, 0.340),
            R.MAT_PAINT, parent,
            (s * 0.300, (y0 + y1) / 2, FRAME_Z1 + 0.400), bevel=0.008)
    cyl('ped_bearing', 0.230, 0.230, R.MAT_CAST, parent,
        (0, Y_FOOT, Z_FOOT - 0.150), sides=18)
    bolt_ring(parent, 'ped_bearingbolt', 0.185, 12, 0.020, 0.028, R.MAT_WORN,
              (0, Y_FOOT, Z_FOOT + 0.080))
    R.empty(R.NODE_MOUNT, 'marque', parent,
            (-0.316, (y0 + y1) / 2, FRAME_Z1 + 0.400), (0, math.radians(90), 0))
    box('ped_badgeplate', (0.014, 0.520, 0.150), R.MAT_PAINT, parent,
        (-0.316, (y0 + y1) / 2, FRAME_Z1 + 0.400), bevel=0.006)
    # automatic boom lubrication on the rear part of the boom [BS]p.5
    box('ped_lubepump', (0.180, 0.200, 0.260), R.MAT_DARK, parent,
        (0.330, y0 + 0.200, FRAME_Z1 + 0.380), bevel=0.014)


def build_boom(root):
    """swing -> lift -> telescope, with the parallel-hold link.

    Every published limit rides on its node as an extra, so the game can drive
    the boom without re-deriving anything and without going outside what the
    real machine does.

    THE PARALLEL-HOLD LINKAGE is modelled and it is not trim: "a second link
    rod running the length of the boom keeps the feed at a constant attitude
    while the boom lifts. This is what lets the operator set the feed square to
    the back and then just move the boom" [R]S4.3. It is also why pivot:mast is
    authored at exactly -BOOM_LIFT: the feed's frame cancels the boom's lift,
    which is the linkage's job written as a transform.
    """
    swing = R.empty(R.NODE_PIVOT, 'boomSwing', root, (0, Y_FOOT, Z_FOOT))
    swing['axis'] = 'z'
    swing['range_deg'] = math.degrees(SWING_MAX)      # +/-45 [BS]p.7
    cyl('boom_slewhousing', 0.200, 0.260, R.MAT_CAST, swing, (0, 0, -0.130),
        sides=18)
    cyl('boom_slewcollar', 0.155, 0.120, R.MAT_PAINT, swing, (0, 0, 0.110),
        sides=14)

    lift = R.empty(R.NODE_PIVOT, 'boomLift', swing, (0, 0, 0), (BOOM_LIFT, 0, 0))
    lift['axis'] = 'x'
    lift['max_deg'] = math.degrees(LIFT_MAX)          # +70 [BS]p.7
    lift['min_deg'] = math.degrees(LIFT_MIN)          # -30 [BS]p.7
    cyl('boom_knuckle', 0.135, 0.420, R.MAT_CAST, lift, (-0.210, 0, 0),
        (0, math.pi / 2, 0), sides=14)
    L_OUT = BOOM_LEN - 0.460
    box('boom_outer', (BOOM_W, L_OUT, BOOM_D), R.MAT_PAINT, lift,
        (0, L_OUT / 2 + 0.120, 0), bevel=0.016)
    for s in (-1, 1):
        for zz in (BOOM_D / 2 - 0.020, -BOOM_D / 2 + 0.020):
            cyl('boom_pad%d_%d' % (s > 0, zz > 0), 0.026, 0.030, R.MAT_WORN,
                lift, (s * (BOOM_W / 2 - 0.030), L_OUT + 0.100, zz), sides=6)
    aim_tube('boom_parlink', 0.030, (0.185, 0.050, 0.150),
             (0.185, L_OUT + 0.050, 0.150), R.MAT_STEEL, lift, sides=8)
    cyl('boom_parbell', 0.070, 0.110, R.MAT_WORN, lift, (0.185, 0.025, 0.150),
        (0, math.pi / 2, 0), sides=10)

    tele = R.empty(R.NODE_SLIDE, 'boomTele', lift, (0, L_OUT + 0.020, 0))
    tele['travel_m'] = BOOM_TELE                       # 1.250 [BS]p.7
    tele['axis'] = 'y'
    L_IN = BOOM_LEN - (L_OUT + 0.020)
    box('boom_inner', (BOOM_W * 0.78, L_IN + 0.320, BOOM_D * 0.78), R.MAT_PAINT,
        tele, (0, L_IN / 2 - 0.160, 0), bevel=0.012)
    cyl('boom_head', 0.150, 0.340, R.MAT_CAST, tele, (-0.170, L_IN, 0),
        (0, math.pi / 2, 0), sides=14)

    # -- the lift cylinder ---------------------------------------------------
    # "one large cylinder under the boom, rod-out when the boom is up ... rods
    # are bright chrome / Ni-Cr plated" [R]S4.3, [BS]p.5. "A chrome rod
    # standing 400-800 mm proud of its barrel is the strongest single 'this
    # machine is under load right now' cue in the whole model."
    a = Vector((0, Y_FOOT - 0.480, Z_FOOT - 0.480))
    bl = Vector((0, BOOM_LEN * 0.52, -BOOM_D / 2 - 0.070))
    b = Vector((0, Y_FOOT, Z_FOOT)) + Vector((
        0,
        bl.y * math.cos(BOOM_LIFT) - bl.z * math.sin(BOOM_LIFT),
        bl.y * math.sin(BOOM_LIFT) + bl.z * math.cos(BOOM_LIFT)))
    v = b - a
    mid = a + v * 0.52
    # THE RAM HAS TO RIDE ITS OWN NODES. Built static under the root it looked
    # right in one pose and stayed behind the instant the boom moved: an
    # unparented cylinder pointing at where the boom used to be. The barrel
    # swings about its pedestal pin (pivot:boomRam) and the rod extends out of
    # it (slide:boomRamRod), which is what a cylinder actually does.
    ramp = R.empty(R.NODE_PIVOT, 'boomRam', root, tuple(a))
    ramp.rotation_euler = v.to_track_quat('Z', 'Y').to_euler()
    ramp['axis'] = 'x'
    L = v.length
    cyl('boomram_barrel', 0.082, L * 0.52, R.MAT_DARK, ramp, (0, 0, 0), sides=14)
    cyl('boomram_gland', 0.090, 0.070, R.MAT_WORN, ramp, (0, 0, L * 0.52 - 0.035),
        sides=12)
    cyl('boomram_eyeA', 0.060, 0.110, R.MAT_WORN, ramp, (-0.055, 0, 0),
        (0, math.pi / 2, 0), sides=10)
    rod = R.empty(R.NODE_SLIDE, 'boomRamRod', ramp, (0, 0, L * 0.52))
    rod['travel_m'] = L * 0.44
    rod['axis'] = 'z'
    cyl('boomram_rod', 0.044, L * 0.48, R.MAT_CHROME, rod, (0, 0, 0), sides=12)
    cyl('boomram_eyeB', 0.060, 0.110, R.MAT_WORN, rod, (-0.055, 0, L * 0.48),
        (0, math.pi / 2, 0), sides=10)

    return swing, lift, tele, L_OUT, L_IN


def build_boom_hoses(lift, L_out, L_in):
    """The hose loom, which is the machine's loudest visual feature.

    Two sources, and they describe two different runs, so both are built:
      * [R]S4.0, off the dedicated-bolter line elevation: "the hose loom runs
        OVER the top of the boom in a shallow arc, on a row of regularly spaced
        saddle clamps - roughly eight clamps along the boom. This is the single
        most characteristic service detail of the machine, and it is drawn as
        an ORDERED run, not a mess."
      * Manufacturer product photography of the same class: the bundle breaks
        into "a large free-hanging loop at the boom-to-feed transition", a
        loose almost-circular bundle of black spiral-wrap hanging clear below
        the head, mixed black hydraulic and pale water lines.
    [R]S4.7 is blunt about why the second one matters: "the loops are generous,
    not tight: they have to survive full boom articulation. Get the loop slack
    wrong and the machine reads as a toy."
    """
    # FIVE clamps, not eight, and smaller. [R]S4.0 counts "roughly eight
    # clamps along the boom" - but that is along a boom on a LARGER machine.
    # Eight on this 1.5 m boom put a clamp every 130 mm, and rendered, the run
    # read as a staircase bolted to the boom rather than as hose saddles. The
    # source's spacing matters more than its count.
    n_clamp = 5
    for i in range(n_clamp):
        y = 0.200 + (L_out - 0.280) * i / (n_clamp - 1)
        cheapbox('boom_saddle%d' % i, (0.110, 0.036, 0.038), R.MAT_DARK, lift,
                 (0, y, BOOM_D / 2 + 0.020))
        cheapbox('boom_saddlecap%d' % i, (0.118, 0.030, 0.012), R.MAT_WORN,
                 lift, (0, y, BOOM_D / 2 + 0.042))
    for j, (dx, rr) in enumerate(((-0.050, 0.024), (-0.017, 0.024),
                                  (0.017, 0.028), (0.050, 0.021))):
        pts = []
        for i in range(6):
            t = i / 5.0
            y = 0.160 + (L_out + 0.120) * t
            z = BOOM_D / 2 + 0.072 + math.sin(t * math.pi) * 0.045
            pts.append((dx, y, z))
        R.hose('boom_hose%d' % j, pts, radius=rr, parent=lift, sides=6)
    # the big free loop at the boom-to-feed transition
    for j, (dx, rr) in enumerate(((-0.030, 0.032), (0.030, 0.030))):
        R.hose('boom_loop%d' % j, [
            (dx, L_out - 0.180, BOOM_D / 2 + 0.090),
            (dx + 0.060, L_out + 0.320, BOOM_D / 2 + 0.360),
            (dx + 0.040, L_out + L_in + 0.140, BOOM_D / 2 - 0.020),
            (dx, L_out + L_in - 0.120, -BOOM_D / 2 - 0.420),
            (dx - 0.020, L_out + L_in + 0.180, -BOOM_D / 2 - 0.120),
        ], radius=rr, parent=lift, sides=6)


# =============================================================================
# S7  TOOL SYSTEM 1 OF 2 - DRILLING
#
#     "A short feed beam, not a mast ... an extruded/fabricated beam of roughly
#     square section with a machined bright top face, drilled with a regular
#     row of lightening/fixing holes along the web. The carriage runs on rails
#     machined into the beam's flanks, not on a lattice." [R]S4.4
#
#     THE ROCK DRILL IS FULLY DIMENSIONED, which almost nothing else on the
#     working end is. [BS]p.5 names it and the manufacturer publishes its own
#     brochure for it (doc 9865 0007 01, 2018-05,
#     epiroc.com/.../9865%200007%2001%20COP%20RR11%20brochure.pdf):
#
#       length without shank adapter   735 mm
#       width including connectors     290 mm
#       height                         194 mm
#       height over drill centre        77 mm   <- the axis is LOW in the body
#       weight                          81 kg
#       hole range                   33-51 mm
#       impact power, max              11 kW at 100 Hz, 210 bar
#       shank adapters      SR28H, R32, R32E, R32F
#
#     Those five dimensions size the carriage, the beam section and the whole
#     feed. The 77 mm is worth having: the drill axis sits 77 mm below the top
#     of a 194 mm body, so the drill hangs BELOW its own centreline, which is
#     why a bolting unit can be as slim as it is.
#
#     THE FEED'S LOCAL +Z POINTS AT THE ROCK - a hard requirement, not a
#     preference. src/core/gltfRig.js reads slide:carriage's authored position
#     and publishes carriageRange = [y, y + travel_m], so the carriage must be
#     authored at the START of its stroke and advance POSITIVELY; the exporter
#     maps Blender +Z to three.js +Y.
# =============================================================================

DRIFTER_L  = 0.735   # rock drill length without shank adapter    COP RR11 doc
DRIFTER_W  = 0.290   # width including connectors                 COP RR11 doc
DRIFTER_H  = 0.194   # height                                     COP RR11 doc
DRIFTER_AX = 0.077   # height over drill centre                   COP RR11 doc
SHANK_OFF  = 0.150   # chuck face above the drifter body front.   NOT SOURCED
ROD_LEN    = 3.000   # drill rod. 3 m is the stock length for this thread
                     # family (Minova EPD 140/2020 Fig. 3 "L = 3 m"; Mitsubishi
                     # Top_Hammer_Tools.pdf lists 2 800 / 3 100 mm rods). It
                     # also FALLS OUT of the geometry: with the bit at the
                     # collar and the carriage at the bottom of its stroke, the
                     # gap from chuck to collar is 3.000 m. Two independent
                     # routes to the same rod.
ROD_OD     = 0.038   # rod OD. The smallest published drill string on the
                     # sister machine drills a 38 mm hole ([BM]p.7).
BIT_OD     = 0.035   # 35 mm hole for a 39 mm friction bolt - the bolt is
                     # LARGER than its hole, which is what makes a friction
                     # bolt grip.  research/16-site-archetypes.md S B.13
CARR_Z0    = (FEED_BODY - CRADLE_OFF + FEED_NOSE) - ROD_LEN - DRIFTER_L - SHANK_OFF
             # -1.411, i.e. 5 mm off the bottom of the beam. DERIVED, and the
             # fact that it lands 5 mm inside the beam rather than 300 mm
             # outside it is the check that FEED_BODY is right.


def build_feed(mast_parent):
    """Cradle, roll-over, feed extension, beam, carriage, drill.

    Returns (mast, fx, index) where `index` is pivot:boltIndex - the node the
    bolting unit in S8 rotates about, because on this class BOTH TOOL SYSTEMS
    SHARE ONE FEED and the feeder itself indexes between them.
    """
    mast = R.empty(R.NODE_PIVOT, 'mast', mast_parent, (0, 0, 0),
                   (-BOOM_LIFT, 0, 0))
    mast['feed_body_m'] = FEED_BODY
    mast['hole_depth_m'] = HOLE_DEPTH
    mast['roll_over_deg'] = math.degrees(FEED_ROLL)     # 240 [BS]p.7

    # -- roll-over cradle ----------------------------------------------------
    box('feed_cradle', (FEED_W + 0.190, FEED_D + 0.180, 0.360), R.MAT_PAINT,
        mast, (0, 0, 0), bevel=0.016)
    for s in (-1, 1):
        cheapbox('feed_cradleear%d' % (s > 0), (0.030, FEED_D + 0.230, 0.280),
                 R.MAT_PAINT, mast, (s * (FEED_W / 2 + 0.110), 0, 0))
    # the roll-over motor: 240 deg of feed rotation is a big ring gear, and it
    # is what lets one boom bolt the back and both walls [BS]p.7
    cyl('feed_rollmotor', 0.105, 0.200, R.MAT_CAST, mast,
        (FEED_W / 2 + 0.125, 0, 0), (0, math.pi / 2, 0), sides=12)
    cyl('feed_rollring', 0.185, 0.080, R.MAT_WORN, mast,
        (-FEED_W / 2 - 0.150, 0, 0), (0, math.pi / 2, 0), sides=20)
    cyl('feed_rollpin', 0.062, 0.440, R.MAT_WORN, mast, (-0.220, 0, 0),
        (0, math.pi / 2, 0), sides=10)
    box('feed_waterkit', (0.150, 0.170, 0.150), R.MAT_DARK, mast,
        (-FEED_W / 2 - 0.140, 0.070, 0.190), bevel=0.012)
    # the 400 mm feed-extension cylinder, alongside the cradle
    aim_tube('feedext_barrel', 0.050, (-FEED_W / 2 - 0.080, 0.050, -0.320),
             (-FEED_W / 2 - 0.080, 0.050, 0.180), R.MAT_DARK, mast, sides=10)

    # -- the 400 mm positioning extension ------------------------------------
    fx = R.empty(R.NODE_SLIDE, 'feedExtend', mast, (0, 0, 0))
    fx['travel_m'] = FEED_EXT                            # 0.400 [BS]p.7
    fx['axis'] = 'z'
    fx['purpose'] = 'position'    # NOT penetration - see the S6 note
    aim_tube('feedext_rod', 0.026, (-FEED_W / 2 - 0.080, 0.050, 0.180),
             (-FEED_W / 2 - 0.080, 0.050, 0.520), R.MAT_CHROME, fx, sides=8)

    COL_Z = FEED_BODY - CRADLE_OFF + FEED_NOSE           # 2.474, the collar
    TOP_Z = FEED_BODY - CRADLE_OFF                       # 2.124, beam top
    BOT_Z = -CRADLE_OFF                                  # -1.416, beam bottom

    # The collar hardware stays on the HOLE AXIS while the feeder indexes
    # behind it, so it hangs off fx and not off pivot:boltIndex.
    box('feedx_centraliser', (0.320, 0.250, 0.100), R.MAT_DARK, fx,
        (0, 0, TOP_Z + 0.080), bevel=0.010)
    cyl('feedx_centbore', 0.052, 0.120, R.MAT_WORN, fx, (0, 0, TOP_Z + 0.060),
        sides=12)
    cone('feedx_shroud', 0.145, 0.085, 0.130, R.MAT_RUBBER, fx,
         (0, 0, TOP_Z + 0.140), sides=14)
    # the feed-front support foot, pushed onto the rock to hold the collar
    box('feedx_foot', (0.360, 0.160, 0.048), R.MAT_WORN, fx,
        (0, 0, COL_Z - 0.024), bevel=0.008)
    for s in (-1, 1):
        cyl('feedx_footleg%d' % (s > 0), 0.026, 0.220, R.MAT_WORN, fx,
            (s * 0.150, 0, TOP_Z + 0.130), sides=8)
    cyl('feedx_tiproller', 0.058, 0.170, R.MAT_RUBBER, fx,
        (-0.090, 0, COL_Z + 0.030), (0, math.pi / 2, 0), sides=12)
    cyl('feedx_flushhead', 0.060, 0.120, R.MAT_CAST, fx,
        (0.150, -0.070, TOP_Z - 0.060), (math.radians(90), 0, 0), sides=10)

    # -- THE INDEXER: the whole feeder rotates to swap drill for bolt ---------
    # See S8's header for the source. Axis A sits midway between the drill
    # centreline and the bolt centreline, so 180 degrees about it puts whichever
    # one you want onto the hole.
    index = R.empty(R.NODE_PIVOT, 'boltIndex', fx, (INDEX_X, 0, 0))
    index['axis'] = 'z'
    index['range_deg'] = 180.0
    index['drill_at_deg'] = 0.0
    index['bolt_at_deg'] = 180.0
    dx = -INDEX_X          # the drill side of the indexer, on the hole axis

    # -- the feed beam --------------------------------------------------------
    box('feed_beam', (FEED_W, FEED_D, FEED_BODY), R.MAT_PAINT, index,
        (dx, 0, (BOT_Z + TOP_Z) / 2), bevel=0.012)
    for s in (-1, 1):
        box('feed_rail%d' % (s > 0), (0.030, 0.054, FEED_BODY - 0.040),
            R.MAT_STEEL, index,
            (dx + s * (FEED_W / 2 + 0.008), -FEED_D / 2 + 0.062,
             (BOT_Z + TOP_Z) / 2), bevel=0.004)
    box('feed_topface', (FEED_W - 0.060, 0.020, FEED_BODY - 0.060),
        R.MAT_STEEL, index, (dx, FEED_D / 2 + 0.004, (BOT_Z + TOP_Z) / 2),
        bevel=0.003)
    n_hole = 15
    for i in range(n_hole):
        z = BOT_Z + 0.150 + (FEED_BODY - 0.300) * i / (n_hole - 1)
        cyl('feed_web%d' % i, 0.038, FEED_D * 0.55, R.MAT_DARK, index,
            (dx, -FEED_D * 0.275, z), (math.pi / 2, 0, 0), sides=8)
    # the chain drive that pulls the carriage - visible full length on every
    # photograph of this class of bolting head
    for s in (-1, 1):
        cyl('feed_chainsprk%d' % (s > 0), 0.062, 0.070, R.MAT_WORN, index,
            (dx + FEED_W / 2 + 0.010, 0.030,
             (TOP_Z - 0.090) if s > 0 else (BOT_Z + 0.090)),
            (0, math.pi / 2, 0), sides=12)
    for s in (-1, 1):
        cheapbox('feed_chain%d' % (s > 0),
                 (0.018, 0.026, FEED_BODY - 0.180), R.MAT_WORN, index,
                 (dx + FEED_W / 2 + 0.010 + s * 0.052, 0.030,
                  (BOT_Z + TOP_Z) / 2))

    # -- the drill carriage ---------------------------------------------------
    car = R.empty(R.NODE_SLIDE, 'carriage', index, (dx, 0, CARR_Z0))
    car['travel_m'] = CARR_TRAV                          # 2.450
    car['axis'] = 'z'
    box('carr_saddle', (FEED_W + 0.080, FEED_D * 0.82, 0.260), R.MAT_DARK, car,
        (0, 0, DRIFTER_L / 2), bevel=0.010)
    for s in (-1, 1):
        cheapbox('carr_shoe%d' % (s > 0), (0.050, 0.082, 0.230), R.MAT_WORN,
                 car, (s * (FEED_W / 2 + 0.012), -FEED_D / 2 + 0.062,
                       DRIFTER_L / 2))
    # the drill, at its published 735 x 290 x 194 with the axis 77 mm down
    # from the top of the body
    body_dz = DRIFTER_H / 2 - DRIFTER_AX
    box('drifter_body', (DRIFTER_W, DRIFTER_H, DRIFTER_L), R.MAT_DARK, car,
        (0, body_dz, DRIFTER_L / 2), bevel=0.014)
    for i in range(8):
        z = 0.086 + i * 0.076
        cheapbox('drifter_rib%d' % i,
                 (DRIFTER_W + 0.022, DRIFTER_H + 0.018, 0.020), R.MAT_DARK,
                 car, (0, body_dz, z))
    cyl('drifter_rotmotor', 0.088, 0.180, R.MAT_CAST, car,
        (DRIFTER_W / 2 - 0.010, body_dz, 0.300), (0, math.pi / 2, 0), sides=12)
    cyl('drifter_accum', 0.062, 0.150, R.MAT_DARK, car,
        (-DRIFTER_W / 2 - 0.038, body_dz, 0.190), sides=10)
    box('drifter_backhead', (DRIFTER_W - 0.020, DRIFTER_H - 0.018, 0.090),
        R.MAT_CAST, car, (0, body_dz, 0.048), bevel=0.010)
    for j, (hx, rr) in enumerate(((-0.062, 0.019), (-0.021, 0.019),
                                  (0.021, 0.022), (0.062, 0.016))):
        R.hose('drifter_hose%d' % j, [
            (hx, -0.130, -0.200), (hx * 1.5, -0.200, 0.010),
            (hx, -0.070, 0.140), (hx, body_dz - 0.060, 0.200),
        ], radius=rr, parent=car, sides=6)

    # The spindle sits exactly DRIFTER_L above the carriage datum, so that
    # CARR_Z0 + DRIFTER_L + SHANK_OFF + ROD_LEN lands the bit ON the collar.
    # That is the same arithmetic CARR_Z0 was derived from, and the two have
    # to agree or the bit floats above the rock.
    spindle = R.empty(R.NODE_PIVOT, 'spindle', car, (0, 0, DRIFTER_L))
    spindle['axis'] = 'z'
    cyl('spindle_chuck', 0.072, 0.155, R.MAT_WORN, spindle, (0, 0, -0.010),
        sides=12)
    cyl('spindle_shank', 0.045, 0.200, R.MAT_STEEL, spindle, (0, 0, 0.120),
        sides=10)
    R.empty(R.NODE_MOUNT, 'tool', spindle, (0, 0, SHANK_OFF))
    # the rod standing in the feed, bit exactly at the collar: the machine is
    # authored at the moment the hole is started.
    cyl('drill_rod', ROD_OD / 2, ROD_LEN, R.MAT_STEEL, spindle,
        (0, 0, SHANK_OFF), sides=8)
    cyl('drill_bit', BIT_OD / 2 + 0.005, 0.078, R.MAT_WORN, spindle,
        (0, 0, SHANK_OFF + ROD_LEN), sides=10)

    return mast, fx, index, car, BOT_Z, TOP_Z, COL_Z


# =============================================================================
# S8  TOOL SYSTEM 2 OF 2 - THE BOLTING UNIT
#
#     THIS IS THE PART A MODEL BUILT FROM A PHOTOGRAPH GETS WRONG, so the
#     mechanism is sourced rather than imagined. It is not "a magazine bolted
#     beside the drill". The FEEDER ITSELF ROTATES, and the two centrelines
#     trade places over the hole.
#
#     Primary source, and it is a specification of the mechanism rather than a
#     description of a picture: patent US9856733B2, "Method and rock bolting
#     rig for installation of a rock bolt", Epiroc Rock Drills AB (formerly
#     Atlas Copco Rock Drills AB), inventors Jan Olsson and Rene Deutsch,
#     priority 2012-07-09, https://patents.google.com/patent/US9856733B2/en :
#
#       * the feeder unit (104) carries the drilling machine (105), which is
#         displaced by A SLIDE (122) running along the feeder;
#       * "the feeder unit is rotatable about an axis (A)" between two end
#         positions - position one has "the drilling machine coaxial with the
#         drilling axis", position two has "the center of the bolt of said rock
#         bolt ... coaxial with said drilling axis";
#       * bolts are held by a REAR BOLT HOLDER (123) fixed to the slide and a
#         FRONT BOLT HOLDER (125);
#       * the cycle is drill -> rotate the feeder to the second end position ->
#         insert the bolt by driving the slide forward -> rotate back.
#
#     Confirmed operationally on the manufacturer's own sheets: "Automated
#     bolting tool retraction and INDEXING OVER TO DRILLING MODE at completion
#     of bolting" (Boltec M spec 9869 0097 01d p.2), and "MBU bolting unit ON A
#     SINGLE FEED SYSTEM" (Boltec 235 sheet).
#
#     So: pivot:boltIndex sits MIDWAY between the drill centreline and the bolt
#     centreline, and 180 degrees about it swaps them. That is why the drill in
#     S7 is built at index-local x = -INDEX_X and everything here at +INDEX_X.
#
#     THE MAGAZINE. Capacity 10 bolts [BS]p.5 - three separate machines in this
#     family publish the same 10. [R]S8 records the drum geometry as NOT
#     SOURCED, and it is still not published, but the FORM is now sourced from
#     manufacturer product photography of this exact unit: the bolts stand
#     PARALLEL TO THE FEED, arranged in a circle, retained by TWO PERFORATED
#     CIRCULAR GUIDE DISCS at top and bottom, rotating about an axis parallel
#     to and offset from the drill axis, with the feed beam running up the
#     middle of the assembly. The radius is then arithmetic on two printed
#     numbers rather than a guess - see MAG_R.
#
#     DUAL BOLT LENGTHS are a listed option, "shorter bolt 70 % the length of
#     the longer" [BS]p.5, so the magazine here is loaded with both.
#
#     WHAT IS DELIBERATELY ABSENT. No cement silo and no grout mixer. Those are
#     real - the larger machines carry a 1 000 kg bulk silo, and the competitor
#     mounts a 500 kg dry cement silo "above right mud guard" - but THIS
#     machine's equipment list offers only "rebar bolts - manual resin/cement
#     cartridges" plus an "extension system for injection hose for resin
#     cartridges" [BS]p.5. [R]S8 flags exactly this: the game's deck-mounted
#     grout pump and mixer "may belong to a cement-grouted variant rather than
#     this one, and I could not confirm which." So this model carries the
#     cartridge stowage and the injection hose that ARE listed, and not the
#     silo that is not. No mesh handling arm either, for the same reason: it is
#     a real class feature (research/03-mining.md S C.2.3) but it is not on
#     this machine's list, and the current small model publishes it as an
#     option that adds 500 mm of length and 430 mm of turning radius.
# =============================================================================

BOLT_OFFSET = 0.320  # drill centreline to bolt centreline. DERIVED: the drill
                     # is 290 mm wide over its connectors (printed, S7), so the
                     # bolt clears it at 145 + 100 (a 200 mm round face plate)
                     # + 35 mm. NOT SOURCED as a figure.
INDEX_X     = BOLT_OFFSET / 2        # 0.160 - axis A, midway between the two
MAG_R       = 0.280  # magazine pitch radius. DERIVED from two printed numbers:
                     # 10 bolts [BS]p.5 carrying 150 x 150 mm face plates
                     # [BS]p.5 need at least 10 x 0.165 = 1.65 m of
                     # circumference, i.e. r >= 0.263. 0.280 is that with a
                     # working clearance. [R]S8 lists the drum diameter as NOT
                     # SOURCED and it still is - this is a floor, not a figure.
MAG_DISC_T  = 0.026  # guide disc thickness                        NOT SOURCED
BOLT_STORE_Z0 = -1.116               # magazine bolts, lower ends
INJ_HOSE_R  = 0.019  # resin injection hose                        NOT SOURCED

# THE CONSUMABLES ARE GALVANISED, AND THE GAME HAS A KIND FOR IT.
# blender/lib/rig.py's MAT_ constants stop at nine and none of them is
# galvanising, but src/core/assets.js KINDS carries `galvanised` - so this file
# names that kind directly rather than settling for bare steel. It matters:
# [MIN] PDF p.6 gives hot-dip galvanizing to ASTM A123 as the standard finish,
# and [R]S6 describes the look precisely - "a dull, crystalline, blue-grey
# spangled finish, NOT chrome and NOT painted", and "galvanized items do not
# rust orange - they go dull grey and chalky". Bolts, plates and nuts are the
# only galvanised things on the machine, so this costs exactly one draw call
# and buys the material the ground support is actually made of.
MAT_GALV    = 'galvanised'


def _bolt(parent, name, x, y, z, length, plated=True):
    """One friction bolt with its face plate and domed nut.

    39 mm tube into a 35 mm hole - the bolt is LARGER than the hole, which is
    what makes a friction bolt grip (research/16-site-archetypes.md S B.13,
    Split Set 90 kN, 33/39/46 mm tube into 32/35/41 mm holes).

    The plate bore is CHAMFERED and the nut cap is DOMED, so the bar can sit up
    to 5 degrees off square to the plate ([MIN] PDF p.2 and p.7). [R]S4.5 is
    explicit: "a flat washer face on a game bolt plate is wrong."

    Galvanized consumables would ideally carry their own material; there is no
    galvanising kind in the shared list, so they use MAT_STEEL, which is the
    closest of the nine (hot-dip galv reads dull blue-grey, not orange-rust and
    not chrome - [R]S6).
    """
    cyl(name, BOLT_OD / 2, length, MAT_GALV, parent, (x, y, z), sides=8)
    # the longitudinal slot that makes it a friction bolt
    cheapbox(name + '_slot', (0.006, BOLT_OD * 0.9, length - 0.10), R.MAT_DARK,
             parent, (x + BOLT_OD / 2, y, z + length / 2))
    if plated:
        box(name + '_plate', (PLATE_SQ, PLATE_SQ, PLATE_T), MAT_GALV,
            parent, (x, y, z + 0.030), bevel=0.010)
        cone(name + '_nut', NUT_AF / 2 * 1.15, NUT_AF / 2 * 0.62, 0.030,
             MAT_GALV, parent, (x, y, z + 0.034), sides=6)


def build_bolting_unit(index, car, spindle_parent, bot_z, top_z, col_z):
    """The magazine, the two bolt holders, the pusher and the injection line.

    Everything here hangs off pivot:boltIndex at index-local x = +INDEX_X, i.e.
    on the BOLT centreline, 320 mm across the feeder from the drill.
    """
    bx = INDEX_X                       # the bolt centreline, in index-local x

    # -- the carousel ---------------------------------------------------------
    # Axis parallel to the feed and offset by MAG_R from the bolt centreline,
    # so the station at -Y sits exactly on the bolt axis and can be pushed
    # straight up into the hole without a transfer arm.
    # The drum sits on the -Y side, i.e. between the feed and the operator.
    # That is where it has to be: [BS]p.2 says the magazine "can be loaded in
    # the vertical position without power to the machine", which means the
    # unit swings back to the platform and the operator reaches it from the
    # machine side. Putting it on the +Y side would point it at the face.
    mag = R.empty(R.NODE_PIVOT, 'carousel', index, (bx, -MAG_R, 0))
    mag['axis'] = 'z'
    mag['capacity'] = MAG_BOLTS                     # 10 [BS]p.5
    mag['index_deg'] = 360.0 / MAG_BOLTS            # 36 deg per bolt
    z_lo = BOLT_STORE_Z0
    # the two perforated guide discs
    for tag, dz in (('lo', z_lo - MAG_DISC_T), ('hi', z_lo + BOLT_LEN)):
        cyl('mag_disc_' + tag, MAG_R + 0.085, MAG_DISC_T, R.MAT_DARK, mag,
            (0, 0, dz), sides=24)
        for i in range(MAG_BOLTS):     # the perforations the bolts stand in
            a = TAU * i / MAG_BOLTS + math.pi / 2
            cyl('mag_eye_%s%d' % (tag, i), BOLT_OD * 0.86, MAG_DISC_T + 0.010,
                R.MAT_WORN, mag,
                (math.cos(a) * MAG_R, math.sin(a) * MAG_R, dz - 0.005), sides=8)
    cyl('mag_hub', 0.062, BOLT_LEN + 0.120, R.MAT_DARK, mag, (0, 0, z_lo - 0.06),
        sides=10)
    for i in range(4):                 # spokes
        a = TAU * i / 4
        for dz in (z_lo - MAG_DISC_T, z_lo + BOLT_LEN):
            cheapbox('mag_spoke%d_%d' % (i, dz > 0), (0.024, MAG_R, 0.030),
                     R.MAT_DARK, mag,
                     (math.cos(a) * MAG_R / 2, math.sin(a) * MAG_R / 2, dz),
                     (0, 0, a - math.pi / 2))
    # ten bolts, loaded to the dual-length option: six at full length and four
    # at 70 %, which is exactly what [BS]p.5 permits
    for i in range(MAG_BOLTS):
        a = TAU * i / MAG_BOLTS + math.pi / 2
        L = BOLT_LEN if i < 6 else BOLT_LEN_2
        _bolt(mag, 'mag_bolt%d' % i, math.cos(a) * MAG_R,
              math.sin(a) * MAG_R, z_lo, L)
    # the index motor and its pawl
    cyl('mag_motor', 0.072, 0.150, R.MAT_CAST, index,
        (bx + MAG_R, -MAG_R - 0.090, z_lo - 0.170), sides=10)
    box('mag_guard', (MAG_R * 1.5, 0.030, BOLT_LEN * 0.55), R.MAT_PAINT, index,
        (bx + MAG_R * 0.2, -MAG_R * 2.0, z_lo + BOLT_LEN * 0.45), bevel=0.010)

    # -- the two bolt holders of the patent -----------------------------------
    # front holder (125), on the feeder near the collar
    box('bolt_holder_front', (0.170, 0.150, 0.110), R.MAT_DARK, index,
        (bx, 0, top_z - 0.120), bevel=0.010)
    cyl('bolt_holder_frontjaw', BOLT_OD * 0.95, 0.130, R.MAT_WORN, index,
        (bx, 0, top_z - 0.130), sides=10)
    # rear holder (123), FIXED TO THE SLIDE - so it rides the carriage, which
    # is what actually pushes the bolt into the hole
    box('bolt_holder_rear', (0.160, 0.140, 0.130), R.MAT_DARK, car,
        (BOLT_OFFSET, 0, 0.090), bevel=0.010)
    cyl('bolt_holder_rearjaw', BOLT_OD * 0.95, 0.150, R.MAT_WORN, car,
        (BOLT_OFFSET, 0, 0.020), sides=10)
    # the bolt adapter on the drill - the drill spins the bolt for its final
    # set once the feeder has indexed back to the drilling position
    cyl('bolt_adapter', 0.058, 0.120, R.MAT_WORN, car,
        (BOLT_OFFSET, 0, DRIFTER_L - 0.020), sides=10)

    # -- the bolt the machine is about to install -----------------------------
    # It stands in the two holders on the bolt centreline, ready for the
    # feeder to index it over the hole the drill is making. Showing this bolt
    # and the drill rod AT THE SAME TIME is the whole point: it is the one
    # frame in which both tool systems are visibly present and distinct.
    _bolt(index, 'bolt_in_holder', bx, 0, bot_z + 0.740, BOLT_LEN)

    # -- resin cartridge injection --------------------------------------------
    # [BS]p.5 lists an "extension system for injection hose for resin
    # cartridges" and nothing heavier. So: a hose guide on the feeder and a
    # line running up to the collar, not a pump skid.
    box('inject_guide', (0.130, 0.110, 0.180), R.MAT_DARK, index,
        (bx + 0.190, 0.150, bot_z + 1.180), bevel=0.010)
    R.hose('inject_hose', [
        (bx + 0.190, 0.230, bot_z + 1.180),
        (bx + 0.250, 0.330, bot_z + 1.900),
        (bx + 0.100, 0.240, top_z - 0.500),
        (bx, 0.110, top_z - 0.120),
    ], radius=INJ_HOSE_R, parent=index, sides=6)


def build_deck_stores(parent):
    """What a bolter actually carries on its deck: plates, nuts, cartridges.

    Face plates in both sourced sizes - rectangular max 150 x 150 mm and round
    max dia 200 mm [BS]p.5. [R]S9 W8d notes the game already gets both right
    and that the distinction matters: 150 is the square one, 200 the round one.

    The resin cartridge box is the ONLY grout hardware on this machine, for the
    reason set out in S8's header.
    """
    # a stack of square plates
    for i in range(5):
        box('store_plate%d' % i, (PLATE_SQ, PLATE_SQ, PLATE_T), MAT_GALV,
            parent, (0.720, 0.430, DECK_Z + 0.010 + i * (PLATE_T + 0.002)),
            (0, 0, 0.06 * i), bevel=0.008)
    # and a short stack of round ones
    for i in range(3):
        cyl('store_rplate%d' % i, PLATE_RD_D / 2, PLATE_T, MAT_GALV, parent,
            (0.720, 0.700, DECK_Z + 0.010 + i * (PLATE_T + 0.002)), sides=16)
    # a nut tray
    box('store_nuttray', (0.240, 0.180, 0.070), R.MAT_DARK, parent,
        (0.720, 0.960, DECK_Z + 0.035), bevel=0.008)
    for i in range(6):
        cone('store_nut%d' % i, NUT_AF / 2 * 1.15, NUT_AF / 2 * 0.62, 0.030,
             MAT_GALV, parent,
             (0.660 + (i % 3) * 0.058, 0.930 + (i // 3) * 0.058,
              DECK_Z + 0.070), sides=6)
    # the resin cartridge box, lid up, cartridges standing in it
    box('resin_box', (0.360, 0.300, 0.340), R.MAT_PAINT, parent,
        (0.760, 1.560, DECK_Z + 0.170), bevel=0.014)
    box('resin_lid', (0.370, 0.310, 0.026), R.MAT_DARK, parent,
        (0.760, 1.560, DECK_Z + 0.352), bevel=0.008)
    for i in range(6):
        cyl('resin_cart%d' % i, 0.016, 0.190, R.MAT_HAZARD, parent,
            (0.660 + (i % 3) * 0.100, 1.490 + (i // 3) * 0.140,
             DECK_Z + 0.250), sides=8)
    box('resin_label', (0.014, 0.220, 0.140), R.MAT_HAZARD, parent,
        (0.945, 1.560, DECK_Z + 0.200), bevel=0.006)


# =============================================================================
# S9  JACKS, LIGHTS, SERVICE HOSES
# =============================================================================

JACK_STROKE = 0.400   # NOT SOURCED. Sized to lift a 365 mm belly clear.
JACK_X      = 0.620   # jack pair half-spacing. NOT SOURCED.
JACK_Y_F    = Y_AXLE_F + CH_FRONT     # +2.100. SOURCED: the current small
                      # model's dimension table labels the printed 700 mm tick
                      # "Front axle to front jack leg", which identifies what
                      # that tick on [BS]p.7 actually marks.
JACK_Y_R    = Y_TICK_R                # -2.037. The matching rear tick.
                      # [R]S4.0 puts a jack "behind the rear wheel"; the tick
                      # is the only printed station there. DERIVED.


def build_jacks(root):
    """Front and rear hydraulic jacks [BS]p.5, authored DOWN.

    The machine is modelled working, and a bolter at the face is always on its
    jacks - it is drilling upward into rock and the reaction goes into the
    ground, not the tyres.

    Both jacks of a pair ride ONE slide node. Four separate nodes would cost
    four extra draw calls for a motion that is always symmetric.
    """
    out = []
    for tag, jy in (('front', JACK_Y_F), ('rear', JACK_Y_R)):
        nd = R.empty(R.NODE_SLIDE, 'jack-' + tag, root, (0, jy, 0))
        nd['travel_m'] = -JACK_STROKE      # negative Z = extend to the ground
        nd['axis'] = 'z'
        for s in (-1, 1):
            x = s * JACK_X
            cheapbox('jack_%s_box%d' % (tag, s > 0), (0.150, 0.170, 0.320),
                     R.MAT_DARK, nd, (x, 0, FRAME_Z0 + 0.160))
            cyl('jack_%s_rod%d' % (tag, s > 0), 0.048, FRAME_Z0 - 0.050,
                R.MAT_CHROME, nd, (x, 0, 0.050), sides=10)
            cyl('jack_%s_pad%d' % (tag, s > 0), 0.135, 0.052, R.MAT_WORN, nd,
                (x, 0, 0.000), sides=14)
            cone('jack_%s_boss%d' % (tag, s > 0), 0.085, 0.050, 0.050,
                 R.MAT_WORN, nd, (x, 0, 0.050), sides=12)
            # hazard striping on the leg guard: a jack leg is a crush point
            cheapbox('jack_%s_stripe%d' % (tag, s > 0), (0.156, 0.176, 0.070),
                     R.MAT_HAZARD, nd, (x, 0, FRAME_Z0 + 0.020))
        out.append(nd)
    return out


def build_lights(root, roof, fx):
    """Every lamp this machine is published as carrying, plus the one the game
    binds by name.

    [BS]p.5 for this machine:
        tramming   6 x 40 W LED  +  2 x 70 W halogen      = 8 lamps
        working    3 x 35 W, 24 V HID, MOUNTED ON THE ROOF
        illuminated stairs for platform
    [R]S4.9: "underground, the machine's own lamps are the only light source in
    frame ... and a lamp aimed UP THE FEED AT THE COLLAR is what a bolter
    actually needs."

    ORDER MATTERS. src/core/env.js binds the underground work light by the
    string 'feed-work-light' and falls back to ORDINAL 0 when the name misses
    (env.js ~L512). So the feed lamp is created FIRST and named exactly. Get
    this wrong and the drive goes dark, or the beam lands in empty air.

    The feed lamp is the one lamp here that is NOT on [BS]p.5's list - it is
    the game's own contract, endorsed by [R]S4.9. Everything else is the
    published fit, at the published counts and wattages.
    """
    lights = []
    # 1. the lamp the game binds. On the feeder, looking up the feed at the
    #    collar - the parallel-hold keeps the feed on the back whatever the
    #    boom does, so this lamp is always aimed at the work.
    m, _ = R.worklight('feed-work-light', fx, (0.300, -0.230, 0.850),
                       (0, -0.55, 1.0), cone_deg=58, range_m=16)
    m['watt_hint'] = 50
    m['colour_hex'] = 0xF4F0E2
    box('lamp_feed_housing', (0.130, 0.120, 0.130), R.MAT_DARK, fx,
        (0.300, -0.230, 0.850), (math.radians(28), 0, 0), bevel=0.012)
    lights.append(m)

    # 2. the three roof working lights - 3 x 35 W, 24 V HID [BS]p.5
    cx = (CAN_X0 + CAN_X1) / 2
    for i, ox in enumerate((-0.380, 0.0, 0.380)):
        m, _ = R.worklight('roof-work-%d' % (i + 1), roof,
                           (cx + ox, CAN_Y1 + 0.090, ROOF_UND - 0.070),
                           (0, 1.0, -0.42), cone_deg=62, range_m=20)
        m['watt_hint'] = 35
        m['colour_hex'] = 0xEAF2FF          # HID reads cool
        box('lamp_roof%d' % i, (0.180, 0.100, 0.150), R.MAT_DARK, roof,
            (cx + ox, CAN_Y1 + 0.090, ROOF_UND - 0.070),
            (math.radians(-22), 0, 0), bevel=0.012)
        lights.append(m)

    # 3. eight tramming lamps: 6 x 40 W LED + 2 x 70 W halogen [BS]p.5.
    #    The two halogens are the long-throw pair and go on the front.
    tram = [
        ('tram-f1', (-0.760, Y_NOSE - 0.020, FRAME_Z1 + 0.320), (0, 1, -0.30), 70, 0xFFE6BE),
        ('tram-f2', (0.760, Y_NOSE - 0.020, FRAME_Z1 + 0.320), (0, 1, -0.30), 70, 0xFFE6BE),
        ('tram-f3', (-0.520, Y_NOSE - 0.060, FRAME_Z1 + 0.560), (0, 1, -0.16), 40, 0xF2F6FF),
        ('tram-f4', (0.520, Y_NOSE - 0.060, FRAME_Z1 + 0.560), (0, 1, -0.16), 40, 0xF2F6FF),
        ('tram-r1', (-0.640, Y_TAIL + 0.020, 1.420), (0, -1, -0.28), 40, 0xF2F6FF),
        ('tram-r2', (0.640, Y_TAIL + 0.020, 1.420), (0, -1, -0.28), 40, 0xF2F6FF),
        ('tram-r3', (-0.640, Y_TAIL + 0.020, 0.980), (0, -1, -0.46), 40, 0xF2F6FF),
        ('tram-r4', (0.640, Y_TAIL + 0.020, 0.980), (0, -1, -0.46), 40, 0xF2F6FF),
    ]
    for name, loc, aim, watt, col in tram:
        m, _ = R.worklight(name, root, loc, aim, cone_deg=46, range_m=22)
        m['watt_hint'] = watt
        m['colour_hex'] = col
        cyl('lamp_%s' % name, 0.062, 0.090, R.MAT_DARK, root, loc,
            (math.radians(90) if loc[1] > 0 else math.radians(-90), 0, 0),
            sides=10)
        lights.append(m)

    # 4. "illuminated stairs for platform" [BS]p.5
    m, _ = R.worklight('stair-light', root,
                       (-(DECK_HALF - 0.230) + 0.250, DECK_Y0 - 0.440, 0.560),
                       (-0.4, -0.3, -1.0), cone_deg=90, range_m=6)
    m['watt_hint'] = 18
    m['colour_hex'] = 0xF2F6FF
    lights.append(m)
    return lights


def build_service_hoses(root):
    """The frame-to-boom bundle and the trailing cable.

    "Bundles of 4-8 hoses in black spiral-wrap protection leave the front
    frame, drop into a DEEP FREE CATENARY LOOP below the boom pedestal, and run
    up the boom in shallow S-curves" [R]S4.7.

    The trailing cable is 37 mm OD - [BS]p.7's cable table gives the 380-525 V
    cable as dia 37 mm x 110 m, and dia 28 mm x 200 m at 1 000 V. It is STATIC
    even though the reel is a pivot:, because a cable parented to the drum
    would swing with it.
    """
    for j, (dx, rr, sag) in enumerate(((-0.130, 0.026, 0.44),
                                       (-0.060, 0.026, 0.50),
                                       (0.060, 0.030, 0.47),
                                       (0.130, 0.024, 0.41))):
        R.hose('svc_hose%d' % j, [
            (dx - 0.180, 0.420, DECK_Z - 0.120),
            (dx - 0.120, 1.150, FRAME_Z1 - sag * 0.35),
            (dx, Y_TICK_F - 0.120, FRAME_Z1 - sag),
            (dx + 0.040, Y_FOOT - 0.230, Z_FOOT - 0.560),
            (dx * 0.5, Y_FOOT - 0.060, Z_FOOT - 0.140),
        ], radius=rr, parent=root, sides=6)
    # the water line to the boom, run separately as it is on the real machine
    R.hose('svc_water', [
        (0.640, -2.700, 1.240), (0.680, -1.200, 1.020),
        (0.520, 0.600, DECK_Z + 0.060), (0.300, Y_TICK_F, FRAME_Z1 - 0.240),
        (0.140, Y_FOOT - 0.100, Z_FOOT - 0.220),
    ], radius=0.022, parent=root, sides=6)
    # the trailing cable, off the reel and away down the drive
    # It leaves the drum's underside on the tail side and falls to the floor.
    # Starting it at the bay edge instead broke the one thing the reel is for:
    # a cable that visibly comes OFF the drum.
    R.hose('trailing_cable', [
        (0.120, REEL_Y + 0.140, REEL_Z - REEL_R * 0.94),
        (0.170, REEL_Y + 0.560, REEL_Z - 0.640),
        (0.240, REEL_Y - 1.150, 0.760),
        (0.120, Y_TAIL - 0.400, 0.180),
        (-0.320, Y_TAIL - 2.100, 0.045),
        (-0.880, Y_TAIL - 4.200, 0.040),
    ], radius=CABLE_R, parent=root, sides=6)


# =============================================================================
# S10  BUILD
# =============================================================================

def build(out_path):
    col = R.reset()
    for _p in (os.path.join(_HERE, 'lib'), _HERE):   # reset() rebuilds sys.path
        if _p not in sys.path:
            sys.path.insert(0, _p)

    _assert_box_is_true()

    root = R.empty('', 'rig:bolter', None, (0, 0, 0))

    build_carrier(root)
    build_rear_module(root)
    roof = build_operator_station(root)
    build_pedestal(None)
    swing, lift, tele, L_out, L_in = build_boom(root)
    build_boom_hoses(lift, L_out, L_in)

    head = R.empty(R.NODE_PIVOT, 'feedRoll', tele, (0, L_in, 0))
    head['axis'] = 'y'
    head['range_deg'] = math.degrees(FEED_ROLL)      # 240 [BS]p.7
    mast, fx, index, car, bot_z, top_z, col_z = build_feed(head)
    build_bolting_unit(index, car, None, bot_z, top_z, col_z)

    build_deck_stores(None)
    build_jacks(root)
    build_lights(root, roof, fx)
    build_service_hoses(root)

    # Everything authored loose belongs to the machine; then the whole machine
    # turns to face the fleet's forward. Authored facing +Y so every station in
    # S1 reads forwards (tail at -3.507, nose at +2.950, collar at +3.753).
    for o in list(bpy.context.scene.objects):
        if o.parent is None and o is not root:
            o.parent = root
    root.rotation_euler = (0, 0, math.pi)

    # Join every dynamic subassembly by material before finish() runs. finish()
    # deliberately will not touch anything under a pivot:/slide: node, so
    # without this each of those groups exports one draw call per BOX.
    # Collect NAMES first. join() deletes the objects it merges, so a snapshot
    # of live Object references goes stale the moment the first group is joined
    # and raises ReferenceError on the next attribute access.
    dyn_names = [o.name for o in bpy.context.scene.objects
                 if o.type == 'EMPTY' and (o.name.startswith(R.NODE_PIVOT)
                                           or o.name.startswith(R.NODE_SLIDE))]
    for nm in dyn_names:
        nd = bpy.context.scene.objects.get(nm)
        if nd is None:
            continue
        if any(k.type in ('MESH', 'CURVE') for k in nd.children):
            join_by_mat(nd, 'dyn_' + nm.split(':', 1)[1])

    bake_all()
    R.finish(out_path)

    print('BOLTER derived: BOOM_LEN=%.3f  coverage check %.3f vs 2.000 '
          'sourced  lift=%.1f deg  collar=(0, %.3f, %.3f)'
          % (BOOM_LEN, COV_CHECK, math.degrees(BOOM_LIFT), TIP_Y, COLLAR_Z))
    return out_path


# =============================================================================
# S11  NOT SOURCED - the register, in one place
#
# Sourced and used, for contrast: width 2 115 · height roof down/up 2 100 /
# 2 841 · tramming length 10 020 · ground clearance 365 · the 1 470 | 637 |
# 1 400 | 1 400 | 700 | 850 side-elevation chain · turning radii 5 200 / 2 780 ·
# weight 13 700 (9 000 / 4 700) · articulation +/-40 deg · tyres 9.00 x R20 ·
# rear clearance angle 15 deg · fuel 60 l · batteries 2 x 12 V 70 Ah ·
# magazine 10 bolts · bolt lengths 1.5-2.4 m and the 70 % dual-length rule ·
# face plates 150 x 150 rect and dia 200 round · coverage 2 m either side and
# 4 m roof · boom extension 1 250 · feed extension 0-400 · feed roll-over
# 240 deg · lift +70/-30 · swing +/-45 · boom mass 2 550 kg · rock drill
# 735 x 290 x 194 with the axis 77 mm down, 11 kW at 100 Hz, 33-51 mm holes ·
# trailing cable dia 37 mm · lamps 6 x 40 W LED + 2 x 70 W halogen tramming and
# 3 x 35 W HID on the roof · front jack 700 mm ahead of the front axle.
#
# NOT SOURCED, and marked at the constant as well as here:
#  1. FRAME_D, DECK_Z, HOOD_Z, RAIL_X, DECK_HALF - no source breaks this
#     carrier down internally. DECK_Z is derived from three printed heights
#     (S3 note) but is not itself printed.
#  2. ROOF_T, POST_R, ROOF_W, ROOF_D - only the canopy's MOUNTING heights are
#     published, never its plate size or post spacing. Confirmed still missing
#     by a fresh web sweep of five manufacturers.
#  3. REEL_R, REEL_W, WREEL_R, WREEL_W - no manufacturer publishes a cable-reel
#     drum size for any machine in this class; only cable length and gauge.
#     REEL_R is derived from the hood cavity and the requirement that the reel
#     be the largest circle on the machine [R]S4.0.
#  4. FEED_W, FEED_D, BOOM_W, BOOM_D - no bolter feed or boom SECTION is
#     published anywhere. Sized off the printed 290 mm drill width.
#  5. FEED_BODY - derived from a COMPETITOR'S published bolting-head length
#     (Sandvik DS411 TS2-051:11, BH30 = 4 142 mm for 3.0 m bolts) scaled by the
#     600 mm bolt-length difference, and cross-checked against the parts
#     build-up. Epiroc publishes no feed length for any Boltec.
#  6. CRADLE_OFF at 0.40 of the feed - the value that closes both the folded
#     tramming length and the coverage width. Not a published figure.
#  7. Z_FOOT, FEED_NOSE, SHANK_OFF, DRIFTER lubrication/accumulator detail.
#  8. BOLT_OFFSET and MAG_R - the indexer offset and the carousel radius.
#     The MECHANISM is sourced (US9856733B2) and the CAPACITY is sourced
#     (10 bolts), but no drum diameter is published. MAG_R is the arithmetic
#     floor for 10 bolts on 150 mm plates, not a measurement.
#  9. JACK_STROKE, JACK_X. JACK_Y_F is sourced; JACK_Y_R is derived from the
#     printed tick plus [R]S4.0's "one behind the rear wheel".
# 10. Colour. Deliberately absent: the palette is the game's, from
#     src/core/assets.js, and copying a manufacturer's yellow-and-graphite
#     would be copying a brand ([R]S8, DOMAIN.md S10). Only the MATERIAL
#     breakdown of [R]S6 is transferable, and that is what the material names
#     in this file carry.
#
# DELIBERATELY OMITTED, with the reason:
#  * Cement silo, grout pump, mixer, water tank. Real on other machines in the
#    family; not on this one's equipment list, which offers only manual
#    resin/cement cartridges and an injection-hose extension [BS]p.5.
#  * Mesh handling arm. A real class feature (research/03-mining.md S C.2.3)
#    but an OPTION on this size of machine, and one that changes the published
#    tramming length and turning radius when fitted - so fitting it silently
#    would make every dimension in S1 wrong.
#  * A roof jack / vertical stinger. [BS]p.5 lists front and rear jacks only.
#    [R]S4.8: "I found no source putting one on a bolter."
#  * Any glazing. This is the protective-roof variant, which has no glass at
#    all - which is also what makes it impossible for a transmission > 0
#    material to reach this machine (HANDOFF S8F).
# =============================================================================
