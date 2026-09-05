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
