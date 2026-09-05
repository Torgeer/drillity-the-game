"""
longhole_rig - the game's underground longhole / ring production drill.

IN-GAME MARQUE: "Fennholm LH-60 Fanline" (data.js `longhole-rig`; invented).
DOMAIN.md section 10 binds: no manufacturer name, model designation or product
code appears in any object name, material, node or custom property this file
EXPORTS.  Provenance lives here, in the comments, which is where it belongs.
Shape is not branding.  Where the source drawings carry a wordmark on the hood
and a model badge on the tail, this file builds the raised panel and leaves it
blank - see `badge_panel()`.

WHAT THIS MACHINE IS, AND WHY IT LOOKS LIKE NOTHING ELSE IN THE FLEET
---------------------------------------------------------------------
It parks in a drill drive - a small tunnel driven along or above the orebody -
props itself between floor and back, and drills a RING: a fan of long holes in
one plane radiating out into the ore, some down through the floor, some out
sideways, some up over its own back.  Then it trams a few metres and drills the
next ring.

Two numbers are the entire machine: the feed tilts +-114 degrees and rolls 360
degrees [S].  114 each way means the feed reaches 24 degrees PAST vertical in
both directions, which is how one set-up drills a whole fan.  `data.js` says
"the feed swings through a full circle on the slew ring"; the printed 360 is
that claim, verified.  Every other drill in this game points its feed at a face
or at the ground.

`data.js` models a longhole contract as a RING: `targetDepth` 120-400 m is the
SUM of every hole in the fan (its own comment says so) while one hole runs to
about 30 m and the rig's `depthCapacity` is 30.  So the model is built in the
fan-drilling pose - propped, feed off vertical, carousel loaded - because a
model implying one deep vertical hole contradicts the game's own content.

SOURCES
-------
[S]  research/rigs/source/longhole-rig/compact-longhole-rig-S7-technical-
     specification.pdf - the OEM technical specification for a compact
     small-drift longhole rig, 5 pp, read pp.3-4 in full.  ARCHIVED IN THIS
     REPO because a full sweep of the owner's catalogue library (515 PDFs) on
     2026-09-05 found no longhole-rig document of any kind, so it was
     web-only and nothing built from it was re-verifiable.
     p.3  Technical specifications: boom/drilling unit, rod handling, feed
          table, carrier, electrical, cabin.
     p.4  Dimensions table, a FULLY DIMENSIONED SIDE ELEVATION, and two
          coverage-area drawings (one side, one plan).
     Read with a coordinate-aware extractor so each printed number could be
     placed by its (x, y) on the drawing page; the drawing regions were
     rendered at 8-11x and read as images.
[GA] MEASURED off that side elevation, not printed.  The page scale was fixed
     from the printed longitudinal chain 2 100 / 2 800 / 960 mm: taking each
     dimension text as centred on its own span gives 25.03 and 25.30 mm/pt
     from two independent pairs, so 25.1 mm/pt +-1 %.  Every [GA] figure below
     was scaled with that and carries its own error.
[D]  DERIVED by arithmetic on published numbers.  The derivation is given.
[R]  research/rigs/longhole-rig.md - the repo's own reference for this machine,
     which this file's author extended (sections 1.9, 1.10, 3.4, 8, 9).
[R2] research/rigs/longhole-rig.md section 4.2, from the top-hammer tooling
     catalogue: rod diameters, coupling sleeves, guide tubes, and the finish
     of a working drill string.
NOT SOURCED - said plainly, every time.  A plausible invented number is worse
     than an admission (HANDOFF section 7 rule 5).

THE CLASS DECISION, MADE ONCE, NOT AVERAGED
-------------------------------------------
[R] section 3.4 argues it from `data.js`'s own numbers: the game's rig is
15.2 transport tonnes on 74 kW of diesel and 55 kW of mains, rods 915-1830 mm,
30 m of depth.  The published machines in this class are 13.5 t (this one),
22.1 t, 25.75 t and 29.5-31.5 t.  Only the first is anywhere near the game's,
and only its rod table is the exact four lengths `data.js` quotes.  So this is
the compact small-drift machine and NOT an average of the class - the same
call `blender/tunnel_jumbo.py` records making, for the same reason.

COORDINATES
-----------
Blender Z-up, metres.  +Y is FORWARD, toward the drilling end; the exporter's
Y-up conversion maps Blender +Y onto three.js -Z.  +X is the machine's right.
ORIGIN: the ARTICULATION PIN at ground level.  An articulated carrier has no
slew ring - the articulation is its turning centre and the one point that does
not move when it steers - so it is this machine's "slew centre at ground
level" in the sense `blender/lib/rig.py` means.
"""

import bpy
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import rig as R  # noqa: E402
from rig import (tube, hose, empty, worklight, reset,  # noqa: E402
                 MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST,
                 MAT_RUBBER, MAT_GLASS, MAT_CHROME, MAT_HAZARD,
                 NODE_PIVOT, NODE_SLIDE, NODE_MOUNT)

D = math.radians


# ===========================================================================
# CARRIER - every figure printed on the Dimensions table or the elevation
# ===========================================================================
WIDTH        = 2.100    # [S] p.4 Dimensions, "Width"
H_ROOF       = 2.800    # [S] p.4 "Height tramming, roof up/down 2 800/2 100"
H_ROOF_DOWN  = 2.100    # [S] the same row - one machine, two poses
CLEAR        = 0.365    # [S] p.4 "Ground clearance"
L_TRAM       = 9.600    # [S] p.4 "Length tramming (with BMHP 6 804/05/06)
                        #     9 300*/9 600*/9 900*", 6805 = the 1 525 mm rod
                        #     feed this model carries.  Used as a CHECK at the
                        #     end of build(), never as a construction figure.
TURN_OUT     = 5.000    # [S] p.4 "Turning radius outer/inner 5 000/2 850"
STEER        = D(40)    # [S] p.3 "Articulated steering +-40 degree"
OSC          = D(8)     # [S] p.3 "Rear axle DANA Spicer 123/90 +-8 oscillation"
MASS         = 13500    # [S] p.4 "Total 13 500 kg" (boom side 9 000, engine
                        #     side 4 500 - so the machine is nose-heavy 2:1,
                        #     which is why the front tyres are the buried ones)

# ---- the longitudinal chain, printed along the bottom of the elevation -----
# rear end |<- 2 100 ->| rear axle |<- 2 800 ->| front axle |<- 960 ->| nose
WHEELBASE    = 2.800    # [S] elevation, centre segment
OVERHANG_R   = 2.100    # [S] elevation, rear segment
OVERHANG_F   = 0.960    # [S] elevation, front segment
CARRIER_LEN  = OVERHANG_R + WHEELBASE + OVERHANG_F      # [D] 5.860

# WHERE THE ARTICULATION PIN SITS ALONG THE WHEELBASE IS **NOT SOURCED**.
# No sheet in hand prints it for this machine.  [R] section 3.2's chain for the
# jumbo on the same carrier family puts it 2 000 mm behind the front axle and
# 2 170 ahead of the rear of a 4 170 wheelbase = 48/52, and blender/
# tunnel_jumbo.py adopted the same split for the same reason.  Same here, and
# flagged.  If it is ever printed, this is the one line to change.
AXLE_R       = -WHEELBASE * 0.48                        # -1.344
AXLE_F       = +WHEELBASE * 0.52                        # +1.456
REAR_END     = AXLE_R - OVERHANG_R                      # -3.444
FRONT_END    = AXLE_F + OVERHANG_F                      # +2.416

# ---- jacks: printed on the elevation, both of them ------------------------
JACK_R_Y     = AXLE_R - 0.637   # [S] "637" from the rear jack to the rear axle
JACK_F_Y     = AXLE_F + 0.700   # [S] "700" from the front axle to the front jack
JACK_PAD_Z   = 0.230            # [S] "230" - the retracted pad stands this far
                                #     off the floor, at BOTH ends
DEPART       = D(15)            # [S] "15" at the tail, the departure angle

# ---- tyres: the one case in this reference where two methods AGREE --------
# [S] p.3 "Tires 9.00 x R20".  A nominal 9.00R20 is a 508 mm rim plus 2 x 229 mm
# of section = 966 mm bare, ~1 015-1 040 mm as a published rolling diameter.
# [GA] scaling the elevation gives 1 036 mm.  Two methods, 2 % apart.  ([R]
# section 3.2's jumbo case had them 12 % apart and picked neither; this one is
# settled, and section 8.7 of the reference is closed because of it.)
WHEEL_R      = 0.515
WHEEL_W      = 0.229            # [D] 9.00 in = 228.6 mm section width
HUB_X        = WIDTH / 2 - WHEEL_W / 2                  # 0.9355

# ---- frame and bodywork ---------------------------------------------------
FRAME_W      = WIDTH - 2 * WHEEL_W          # [D] 1.642 - the wheels stand
                                            # OUTBOARD of the frame, which is
                                            # what makes the machine read as
                                            # narrow-bodied and wide-tracked
FRAME_BOT    = CLEAR                        # [S] 0.365, and there is a
                                            # full-width belly plate at it
FRAME_TOP    = 0.86     # [D] a 495 mm deep welded box.  Sized from the
                        #     published weight split: 9 000 kg over the boom
                        #     end on a 960 mm overhang is what sets it.
DECK         = 0.92     # [D] frame top + 60 mm chequer plate
HOOD_TOP     = 1.690    # [GA] the rear body's top face, scaled at 25.1 mm/pt
                        #      (+-20 mm).  Gives hood : cab : max-height bands
                        #      of 1.69 : 2.80 : 7.70 = 1 : 1.66 : 4.56.
CAB_X0, CAB_X1 = -0.80, +0.10   # NOT SOURCED which SIDE the station is on: a
                                # side elevation cannot say, and no plan view
                                # in hand shows the cab.  Put on the LEFT here
                                # because the carousel is on the right of the
                                # feed and an operator watches the rod handling
                                # across the machine, not over his own shoulder.
                                # Flagged, not asserted.
CAB_Y0, CAB_Y1 = +0.16, +1.34   # [GA] scaled off the elevation, +-40 mm
CAB_IN_H     = 1.700    # cabin inside height.  NOT printed on this sheet; it
                        # IS printed on a competitor's longhole sheet in [R]
                        # section 3.3(b) ("Cabin ... inside height 1 700 mm").
                        # Cross-check, and the reason to trust it here:
                        # DECK 0.92 + 1.700 + 0.18 of roof structure = 2.80,
                        # which is the printed roof height exactly.

# ---- cable reel -----------------------------------------------------------
# [GA] The elevation draws the reel's side flange as a full circle with radial
# spokes, standing proud of the hood.  A three-point circle fit on the drawn
# arc gives R 250 pt-px -> **diameter 1 570 mm, centre 1.19 m above ground**.
# Independent confirmation: the jumbo on the same carrier family publishes a
# **1 600 mm** cable reel ([R] section 3.1), from a different drawing entirely.
# 1.57 vs 1.60 is a 2 % agreement between a scaled figure and a printed one.
REEL_R       = 0.785
REEL_CZ      = 1.190
REEL_Y       = REAR_END + 0.866   # [GA] -2.578, scaled from the tail
REEL_W       = 0.550    # [D] NOT printed.  Derived from what has to fit: the
                        # sheet specifies Buflex trailing cable at 37 mm
                        # diameter x 110 m (380-525 V) up to 28 mm x 200 m
                        # (1 000 V).  On a 0.90 m core at 0.55 m wide that is
                        # 14.9 turns/layer x 43.9 m = 2.5 layers for the worst
                        # case, finishing at 1.12 m over a 1.57 m flange.  It
                        # fits with room, which is what a reel is built for.
CABLE_D      = 0.037    # [S] p.4 cable table, "Diameter (mm) 37" at 380-525 V

# ===========================================================================
# THE WORKING END.  Feed BMHP 6805, the 1 525 mm rod machine - `data.js`
# gives `rodLength: 1.525` and the sheet's feed table has exactly that row.
# ===========================================================================
ROD_LEN      = 1.525    # [S] p.3 feed table; and `data.js` `rodLength`
FEED_LEN     = 3.340    # [S] p.3 "BMHP 6805 / 1 525 / 3 340"
FEED_EXT     = 0.900    # [S] p.4 coverage drawing, "900 Feed extension"
STING_TOP    = 0.450    # [S] p.4 coverage drawing, "450 Stinger extension"
STING_BOT    = 1.000    # [S] p.4 coverage drawing, "1 000 Stinger extension"
TILT         = D(114)   # [S] p.4 coverage drawing, "+- 114"
ROLL         = D(360)   # [S] p.4 coverage drawing, "360"
BOOM_SWING   = D(35)    # [S] p.4 plan coverage drawing, "35" (and "20")
COVERAGE_W   = 5.975    # [S] p.4 plan coverage drawing.  CHECK ONLY - see the
                        # NOT SOURCED note at build_boom().
DRILL_FWD    = 2.605    # [S] p.4 coverage drawing: the drilling axis stands
                        # this far ahead of the FRONT AXLE
STATION_2    = 1.250    # [S] p.4, the second feed station's offset
MAX_H        = 7.700    # [S] p.4, printed as the coverage drawing's overall
                        # height.  **It cannot be reconstructed from the other
                        # printed numbers** (feed 3.340 + extension 0.900 +
                        # head stinger 0.450 = 4.690 of assembly, which would
                        # need its foot at 3.01 m, impossible in the 3.9 x 3.9 m
                        # drift the same publisher recommends).  So it is a
                        # theoretical envelope, recorded and NOT built to.

DRILL_Y      = AXLE_F + DRILL_FWD                       # [D] +4.061

# The feed's height in the drilling pose is set by the drift, not by choice.
# The publisher's own recommended drift for a 1 525 mm-rod feed is 3 900 x
# 3 900 mm ([R] section 3.4, from the E7 sheet's table).  A 3.340 m feed with
# its head stinger extended 0.450 needs 3.79 m of back - so the foot sits just
# clear of the floor and the head presses the back.  Any higher and the machine
# is drilling through the roof of the drift it is standing in.
FEED_FOOT_Z  = 0.150    # [D] 3.340 + 0.450 + 0.150 = 3.94 m against a 3.90 m
                        #     recommended drift.  That is the fit, and it is
                        #     why the rods are short.
FEED_MID_Z   = FEED_FOOT_Z + FEED_LEN / 2               # [D] 1.820

FEED_W       = 0.300    # NOT SOURCED.  [R] section 8.4 is explicit that no
FEED_H       = 0.240    # feed cross-section is published anywhere in hand.
                        # Set from the length:depth ratio the reference records
                        # for this class of feed beam (~14:1 over the cradle):
                        # 3 340 / 14 = 239 mm.  Flagged, not asserted.

# ---- boom -----------------------------------------------------------------
# [GA] The base pin scales off the elevation at 345 mm ahead of the front axle
# and 1 579 mm above ground (+-40 mm), which is a turret standing on the front
# frame just ahead of the cab.  The far end is fixed by the printed drilling
# axis and the feed's mid-height, so the boom's length in this pose is
# arithmetic rather than a choice.
BOOM_PIN_Y   = AXLE_F + 0.345                           # [GA] +1.801
BOOM_PIN_Z   = 1.580                                    # [GA]
BOOM_SEG     = 1.250    # [S] p.4 coverage drawings, "1 250" on the outer arm
BOOM_R       = 0.115    # NOT SOURCED - no section is published ([R] 8.3).
                        # Sized so a 9 000 kg boom-side load is credible.

# ---- rod handling ---------------------------------------------------------
CARO_N       = 11       # [S] p.3 "Rod Handling System, RHS 10 (10+1 rods)
                        #     mechanized drilling up to 20 m".  10 in the drum
                        #     plus the one in the hole.  NOT enough rods for a
                        #     whole ring - the crew reloads inside one hole,
                        #     and a drum drawn with a ring's worth would be an
                        #     invention ([R] section 9.5).
CARO_R       = 0.280    # [GA] +-5 %.  Scaled off the PLAN coverage drawing,
CARO_OFF     = 0.490    # [GA] +-5 %.  whose scale is itself only good to 5 %
                        # (the printed 397 / 5 975 / 323 chain gives 32.9 and
                        # 36.1 mm/pt from its two half-spans).  Both figures
                        # are SCALED, not published - [R] section 8.5.
                        # Sanity: 10 rods at 46-52 mm need ~0.25 m of pitch
                        # circle, so a 0.56 m drum is generous - which is what
                        # putting the gripper arms INSIDE it costs.  The
                        # maker's own copy: "with the gripper arms placed
                        # inside the carousel, it can easily and quickly move
                        # the rods between the carousel and the drill centre".
ROD_R        = 0.023    # [R2] T45 speedrod, 46 mm OD - the middle of the three
                        # thread systems this machine is "adaptable to"
                        # (R32 / T38 / T45, [S] p.3)
ROD_BOX_R    = 0.0315   # [R2] T45 MF-rod female end, 63 mm OD - the swelling
                        # that gives a racked string its visible beat
BIT_D        = 0.089    # [S] p.3 rod/bit table, "T45 Speedrod / 70-89 mm";
                        # and `data.js` `nominalDia: 89`
DRIFTER_LEN  = 1.100    # NOT SOURCED.  No length is published for this rock
                        # drill on this sheet.  Constrained, though: the feed
                        # table's four rows are all rod length + 1 815 mm
                        # exactly, and that 1 815 is the drill plus the shank
                        # plus carriage over-run plus the two end housings.
                        # 1.100 leaves 715 mm for the rest, which is the shape
                        # of it.  Flagged.

# ---- lamps: printed counts, so they are built as printed ------------------
# [S] p.3 "Tramming lights 6x40 W LED, 2x80 W, 24 V DC" / "Working lights 4x80 W
# LED, 24 V DC" / "Manual spotlight 70 W (left and right)" / "Illuminated stairs
# for platform LED".  Underground the machine's own lamps are almost the whole
# lighting design, and src/core/env.js re-aims a spotlight at every mount:/aim:
# pair EVERY FRAME - so these nodes are load-bearing, not decoration.

MATS_ORDER = (MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST,
              MAT_RUBBER, MAT_GLASS, MAT_CHROME, MAT_HAZARD)


# ===========================================================================
# helpers
# ===========================================================================
def box(name, size, mat=MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
        bevel=0.0):
    """A box of the size asked for - a thin pass-through to rig.py's box().

    NO LOCAL WORKAROUND LIVES HERE, DELIBERATELY.  `rig.py`'s box() has been
    returning half-size boxes (`primitive_cube_add(size=1)` is a 1 m cube and
    the next line applies `scale = size/2`), and three machines compensated for
    it privately - which is exactly why fixing the library then doubles them.
    HANDOFF section 10 records that it has already bitten twice.  So this file
    calls the library straight and asserts the truth at build time instead; see
    `_assert_box_is_true()`.  When the library is right, this file is right,
    with nothing to unwind.
    """
    return R.box(name, size, mat, parent, loc, rot, bevel)


def _assert_box_is_true():
    """Refuse to build on a broken box() rather than ship a half-size machine.

    Every dimension in this file traces to a datasheet page.  A silent factor
    of two makes the whole exercise pointless, and it is invisible in a
    wireframe because tube() is correct - so a machine comes out as correct
    cylinders bolted to half-size plates and nothing looks wrong.  That is the
    silent-fallback pattern HANDOFF section 8A says has cost this tree four
    rounds.  Fail loudly instead.
    """
    probe = R.box('__boxprobe__', (4.0, 2.0, 10.0))
    bpy.context.view_layer.update()
    got = tuple(round(v, 4) for v in probe.dimensions)
    bpy.data.objects.remove(probe, do_unlink=True)
    if max(abs(got[0] - 4.0), abs(got[1] - 2.0), abs(got[2] - 10.0)) > 1e-3:
        raise RuntimeError(
            'blender/lib/rig.py box() is still wrong: box((4,2,10)) measured '
            '%s, expected (4.0, 2.0, 10.0).  This file refuses to build on it '
            'rather than compensate locally, because a private workaround left '
            'in after the library is fixed doubles the machine (HANDOFF '
            'section 10 - it has happened twice).  FIX: in blender/lib/rig.py '
            'box(), `o.scale = (size[0]/2, size[1]/2, size[2]/2)` should be '
            '`o.scale = size` - primitive_cube_add(size=1) already spans '
            '-0.5..+0.5, so the halving is applied twice.' % (got,))


def bake(o):
    """Apply every modifier (and convert a curve to a mesh) so it can be
    joined.  join() keeps only the ACTIVE object's modifier stack, so anything
    bevelled or arrayed has to be baked before it is welded."""
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    return bpy.context.active_object


def weld(objs, parent, tag):
    """Join a DYNAMIC subassembly by material and parent it to its game node.

    rig.py's finish() deliberately skips anything under a pivot:/slide: node -
    it has to move independently - which means every mesh in a moving group is
    its own draw call unless it is welded here.  This machine is mostly moving
    parts (the whole front frame hangs off pivot:articulation), so without this
    it would land at 120+ draw calls against a budget of 70.
    """
    groups = {}
    for o in objs:
        b = bake(o)
        key = b.data.materials[0].name if b.data.materials else 'none'
        groups.setdefault(key, []).append(b)
    out = []
    for key, items in groups.items():
        if len(items) > 1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in items:
                o.select_set(True)
            bpy.context.view_layer.objects.active = items[0]
            bpy.ops.object.join()
        o = items[0]
        o.name = tag + ':' + key
        o.parent = parent
        out.append(o)
    return out


def arr(o, offset, count):
    """ARRAY modifier with a constant offset in the object's local frame."""
    m = o.modifiers.new('arr', 'ARRAY')
    m.use_relative_offset = False
    m.use_constant_offset = True
    m.constant_offset_displace = offset
    m.count = count
    return o


def disc(name, r, t, mat, loc, axis='X', sides=16, parent=None):
    """A wheel / flange / pad: a short cylinder about X, Y or Z, CENTRED on
    `loc` (rig.py's tube() puts its origin at the base)."""
    rot = {'X': (0, math.pi / 2, 0), 'Y': (-math.pi / 2, 0, 0),
           'Z': (0, 0, 0)}[axis]
    o = tube(name, r, t, mat, parent=parent, loc=loc, rot=rot, sides=sides)
    off = {'X': (-t / 2, 0, 0), 'Y': (0, -t / 2, 0), 'Z': (0, 0, -t / 2)}[axis]
    o.location = (loc[0] + off[0], loc[1] + off[1], loc[2] + off[2])
    return o


def strut(name, a, b, r, mat, parent=None, sides=8):
    """A round member between two points - boom arms, rams, jack and stinger
    legs, handrails.  Anything whose ends are known and whose angle is not
    worth writing out by hand.

    THE EULER, DERIVED RATHER THAN GUESSED, because the first version carried
    a spurious -90 degrees and quietly laid every ram and every jack leg over
    on its side.  Blender's default 'XYZ' euler composes as R = Rz.Ry.Rx, so
    with rx = 0 the tube's local +Z lands on

        (sin(ry)cos(rz), sin(ry)sin(rz), cos(ry))

    Matching that to the unit direction d gives ry = acos(dz/L) and
    rz = atan2(dy, dx), with no offset.  Checked against the three axes:
    d=(0,0,1) -> identity; d=(1,0,0) -> ry=pi/2, rz=0; d=(0,1,0) -> ry=pi/2,
    rz=pi/2.
    """
    dx, dy, dz = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
    L = math.sqrt(dx * dx + dy * dy + dz * dz)
    if L < 1e-5:
        return None
    ry = math.acos(max(-1.0, min(1.0, dz / L)))
    rz = math.atan2(dy, dx)
    return tube(name, r, L, mat, parent=parent, loc=a, rot=(0, ry, rz),
                sides=sides)


def radial(o, count, axis='Z'):
    """Array `count` copies of `o` evenly round a full circle about the
    object's OWN ORIGIN, then bake it and throw the helper empty away.

    Two traps, both of which this hit on the first build:

    1. An ARRAY with `use_object_offset` applies inv(obj) @ offset each time.
       If the object's origin is not ON the rotation centre, every copy is
       rotated AND translated, so the copies SPIRAL - the wheel lugs marched
       off through the middle of the machine and took the bounding box from
       2.10 m wide to 2.47 m and 11.3 m tall.  So the geometry is displaced in
       MESH data and the object origin is left on the axis.
    2. The offset empty has to be built from the object's own world matrix
       (`o.matrix_world @ Rotation(...)`), not from a bare euler, or the
       object's own rotation leaks into the relative transform.  The studs are
       on tubes already turned 90 degrees onto the axle, and a bare euler sent
       them somewhere else entirely.

    The empty is removed after baking so it never reaches the .glb - an
    exported `*_p` node would be one more name in a contract that is read by
    string.
    """
    from mathutils import Matrix
    # matrix_world is STALE until the depsgraph is evaluated: `part()` has just
    # written .location and .rotation_euler and Blender has not folded them in
    # yet.  Reading it early gave an identity matrix, the offset came out as a
    # rotation about the WORLD origin, and the wheel lugs orbited the machine
    # at 18 m radius - a 37.6 m wide bounding box on a 2.1 m machine.  One line,
    # and it is the whole difference.
    bpy.context.view_layer.update()
    piv = bpy.data.objects.new(o.name + '_p', None)
    bpy.context.collection.objects.link(piv)
    piv.matrix_world = o.matrix_world @ Matrix.Rotation(
        2 * math.pi / count, 4, axis)
    m = o.modifiers.new('radial', 'ARRAY')
    m.use_relative_offset = False
    m.use_object_offset = True
    m.offset_object = piv
    m.count = count
    b = bake(o)
    bpy.data.objects.remove(piv, do_unlink=True)
    return b


def ram(name, a, b, barrel_r, parent=None, frac=0.55):
    """A hydraulic cylinder: a dark barrel over the first `frac` of the run and
    a bright CHROME rod over the rest.

    Two objects, two materials, and worth it.  A polished rod against a matte
    barrel is the cheapest realism cue on any machine with hydraulics, and this
    one has fourteen of them - steering, boom lift, boom telescope, feed tilt,
    feed extension, four jack/stinger legs and the rod arm.  [R] section 6.
    """
    mid = tuple(a[i] + (b[i] - a[i]) * frac for i in range(3))
    out = [strut(name + '_bar', a, mid, barrel_r, MAT_DARK, parent)]
    out.append(strut(name + '_rod', mid, b, barrel_r * 0.55, MAT_CHROME,
                     parent, sides=8))
    return [o for o in out if o]


def badge_panel(name, size, parent, loc, rot=(0, 0, 0)):
    """A raised blank plate where the source drawing carries a wordmark.

    DOMAIN.md section 10: copy the shape, never the badge.  The drawings this
    machine is built from carry a maker's wordmark mid-hood and a model
    designation on the tail panel.  Both are modelled as the raised plate they
    sit on and left EMPTY.  Not an omission - a rule.
    """
    return box(name, size, MAT_DARK, parent, loc, rot, bevel=0.006)


def grille(name, w, h, mat, parent, loc, rot=(0, 0, 0), n=7, depth=0.03):
    """A bank of louvres, built as real slats.

    The rear power module's cooling louvres are the biggest single readable
    detail on the machine's largest painted surface, and they share the frame's
    material - so under the join they cost triangles and NOT a draw call, which
    is the lane blender/lib/rig.py says to spend in.
    """
    out = []
    pitch = h / n
    s = box(name, (w, depth, pitch * 0.55), mat, parent,
            (loc[0], loc[1], loc[2] - h / 2 + pitch * 0.5), rot)
    arr(s, (0, 0, pitch), n)
    out.append(s)
    return out


def mesh_panel(name, w, h, mat, parent, loc, rot=(0, 0, 0), pitch=0.13,
               bar=0.011):
    """Expanded-metal guarding, built as real crossed bars.

    assets.js owns every texture at runtime and this .glb ships no maps at all,
    so a mesh screen has to be geometry.  It is cheap - two ARRAYs, ~25 boxes -
    and it shares the frame material, so it costs no draw call.  The bars are
    offset in MESH data rather than object location so that `rot` turns the
    panel about `loc` instead of firing the bars off down a world axis.
    """
    from mathutils import Matrix
    nx = max(2, int(round(w / pitch)) + 1)
    nz = max(2, int(round(h / pitch)) + 1)
    v = box(name + '_v', (bar, bar, h), mat, parent, loc, rot)
    v.data.transform(Matrix.Translation((-w / 2, 0, 0)))
    arr(v, (w / (nx - 1), 0, 0), nx)
    z = box(name + '_h', (w, bar, bar), mat, parent, loc, rot)
    z.data.transform(Matrix.Translation((0, 0, -h / 2)))
    arr(z, (0, 0, h / (nz - 1)), nz)
    return [v, z]


# ===========================================================================
# WHEELS
# ===========================================================================
def build_wheel(name, parent, x, y):
    """One tyre, rim and hub.

    [R] section 4.0: "the tyres are the only round, soft, black mass on an
    otherwise angular machine", and the elevation draws deep chevron lugs, a
    rim ring and a 10-stud hub.  The lugs are an ARRAY of blocks around the
    tread, which shares the tyre's rubber and so costs nothing in draws.
    """
    from mathutils import Matrix
    out = []
    sgn = 1 if x > 0 else -1
    cz = WHEEL_R
    out.append(disc(name + '_tyre', WHEEL_R, WHEEL_W, MAT_RUBBER,
                    (x, y, cz), 'X', sides=24, parent=parent))
    out.append(disc(name + '_rim', WHEEL_R * 0.62, WHEEL_W * 1.02, MAT_WORN,
                    (x, y, cz), 'X', sides=20, parent=parent))
    # The hub sits RECESSED in the rim dish, not proud of the sidewall.  On
    # the first build it stood outboard and the studs took the model's width
    # to 2.260 m against a printed 2.100 - a 7 % error introduced by a detail
    # nobody would look at twice, which is exactly the kind that survives
    # review (HANDOFF section 8E: read the figure off the mesh).
    out.append(disc(name + '_hub', WHEEL_R * 0.30, 0.09, MAT_CAST,
                    (x + sgn * (WHEEL_W / 2 - 0.075), y, cz), 'X', sides=14,
                    parent=parent))
    # 10 studs [GA] - counted on the hub drawn in the elevation.  Origin on
    # the axle, geometry pushed out to the bolt circle in MESH data, so the
    # array is a pure rotation about the tube's own local Z (which IS the
    # axle, because the tube is turned 90 degrees onto it).
    stud = tube(name + '_stud', 0.019, 0.042, MAT_STEEL, parent=parent,
                loc=(x + sgn * (WHEEL_W / 2 - 0.055), y, cz),
                rot=(0, sgn * math.pi / 2, 0), sides=6)
    stud.data.transform(Matrix.Translation((0, 0.185, 0)))
    out.append(radial(stud, 10, 'Z'))

    # chevron lugs round the tread - the tell of a mine tyre, and the only
    # soft black mass on an otherwise angular machine [R] 4.0(5).  Origin on
    # the axle, geometry out at the tread, rotation about local X (the axle).
    lug = box(name + '_lug', (WHEEL_W * 0.92, 0.10, 0.052), MAT_RUBBER, parent,
              (x, y, cz))
    lug.data.transform(Matrix.Translation((0, 0, WHEEL_R - 0.012)))
    out.append(radial(lug, 22, 'X'))

    # Mudguard.  Every one of these machines has them and the first render
    # looked bare without: a drill drive floor is broken rock under standing
    # water and the wheels throw it at the cab and at anybody walking past.
    # Built as five flat facets on an arc rather than a curved surface,
    # sharing MAT_DARK with the frame - so it merges into the same draw call
    # and costs only triangles, which is the lane rig.py says to spend in.
    # It is exactly TYRE WIDTH, not wider: a published width is the machine's
    # maximum, and a guard 45 mm proud of it took the measured model to 2.190
    # against a printed 2.100.
    for i in range(5):
        a = D(28) + i * D(31)
        out.append(box('%s_guard%d' % (name, i),
                       (WHEEL_W, 0.30, 0.028), MAT_DARK, parent,
                       (x, y + math.cos(a) * (WHEEL_R + 0.075),
                        cz + math.sin(a) * (WHEEL_R + 0.075)),
                       rot=(-(math.pi / 2 - a), 0, 0), bevel=0.006))
    return out


# ===========================================================================
# REAR BODY - the power module, the reel, the tail
# ===========================================================================
def build_rear(root):
    """The rear frame, the power module and the cable reel.

    [R] section 4.0(2): "a long low box with a sloping nose that drops almost
    to the floor at the tail", side louvre banks, and it is the biggest single
    painted surface on the machine.  It sets the hood line, and the hood line
    is one of the three horizontal bands the silhouette reads by.
    """
    out = []
    y0, y1 = REAR_END, -0.30            # the rear body stops short of the joint
    ylen = y1 - y0
    ymid = (y0 + y1) / 2

    # THE REEL WELL.  The scaled reel is 1.57 m across with its axis 1.19 m up,
    # so its bottom sits at 0.405 - barely above the 0.365 belly.  A drum that
    # size does not sit ON the chassis, it sits IN it, and the rear frame is
    # therefore TWO SIDE RAILS over the reel's length rather than one closed
    # box.  It is also the only arrangement that can pay cable out, and this
    # machine drills on a trailing cable.  The first build buried the drum in a
    # solid hood and the biggest and most characteristic object on the whole
    # machine rendered as two dark crescents.
    bay0, bay1 = y0 + 0.16, REEL_Y + 0.62
    rail_w = 0.30
    out.append(box('rear-frame', (FRAME_W, y1 - bay1, FRAME_TOP - FRAME_BOT),
                   MAT_DARK, root, (0, (bay1 + y1) / 2,
                                    (FRAME_BOT + FRAME_TOP) / 2), bevel=0.012))
    for sgn in (-1, +1):
        out.append(box('rear-rail%d' % (sgn > 0),
                       (rail_w, bay1 - bay0, FRAME_TOP - FRAME_BOT), MAT_DARK,
                       root, (sgn * (FRAME_W / 2 - rail_w / 2),
                              (bay0 + bay1) / 2,
                              (FRAME_BOT + FRAME_TOP) / 2), bevel=0.012))
    out.append(box('rear-crossmember', (FRAME_W, 0.16, FRAME_TOP - FRAME_BOT),
                   MAT_DARK, root, (0, bay0 + 0.08,
                                    (FRAME_BOT + FRAME_TOP) / 2), bevel=0.012))
    # belly plate - scraped bare on broken floor, never painted-looking
    out.append(box('rear-belly', (FRAME_W * 0.98, ylen * 0.92, 0.022),
                   MAT_WORN, root, (0, ymid, FRAME_BOT + 0.011)))
    # A guard GRID over the open well - nothing should walk into a turning
    # drum.  Two lone transverse bars (the first attempt) read as antennae in
    # three-quarter view; a grid of three cross bars and two longitudinals
    # reads as what it is.  It hugs the drum rather than standing off it, so
    # it stays under the roof-down height.
    gz = REEL_CZ + REEL_R + 0.045
    for i, yy in enumerate((REEL_Y - 0.50, REEL_Y, REEL_Y + 0.50)):
        out.append(box('reel-guard-x%d' % i, (FRAME_W - 0.06, 0.045, 0.035),
                       MAT_DARK, root, (0, yy, gz), bevel=0.006))
    for sgn in (-1, +1):
        out.append(box('reel-guard-y%d' % (sgn > 0),
                       (0.045, 1.10, 0.035), MAT_DARK, root,
                       (sgn * (FRAME_W / 2 - 0.20), REEL_Y, gz), bevel=0.006))
        out.append(strut('reel-guard-leg%d' % (sgn > 0),
                         (sgn * (FRAME_W / 2 - 0.05), REEL_Y, FRAME_TOP - 0.10),
                         (sgn * (FRAME_W / 2 - 0.05), REEL_Y, gz),
                         0.024, MAT_DARK, root))

    # the power module FORWARD of the well.  Its top face is the hood line -
    # one of the three horizontal bands the silhouette reads by [R] 3.2.
    hy0, hy1 = bay1, y1
    out.append(box('hood', (WIDTH - 0.10, hy1 - hy0, HOOD_TOP - FRAME_TOP),
                   MAT_PAINT, root,
                   (0, (hy0 + hy1) / 2, (FRAME_TOP + HOOD_TOP) / 2),
                   bevel=0.030))
    # the bulkhead the hood closes against, and a panel break down each side
    out.append(box('hood-bulkhead', (WIDTH - 0.10, 0.05, HOOD_TOP - FRAME_TOP),
                   MAT_DARK, root, (0, hy0 - 0.02,
                                    (FRAME_TOP + HOOD_TOP) / 2), bevel=0.010))
    for sgn in (-1, +1):
        out.append(box('hood-break%d' % (sgn > 0),
                       (0.016, 0.03, HOOD_TOP - FRAME_TOP - 0.10), MAT_DARK,
                       root, (sgn * ((WIDTH - 0.10) / 2 + 0.004), hy0 + 0.78,
                              (FRAME_TOP + HOOD_TOP) / 2)))
    # the tail: a sloping panel at the printed 15 degree departure angle
    tl = 0.55
    out.append(box('tail-ramp', (WIDTH - 0.30, tl, 0.035), MAT_DARK, root,
                   (0, y0 + tl / 2 * math.cos(DEPART),
                    FRAME_BOT + tl / 2 * math.sin(DEPART) - 0.01),
                   rot=(-DEPART, 0, 0), bevel=0.008))
    # tail panel - where the drawing carries the model designation.  Blank.
    out.append(badge_panel('tail-plate', (0.52, 0.02, 0.20), root,
                           (-0.42, y0 - 0.012, FRAME_TOP - 0.22)))
    # hood side wordmark plate - also blank, also deliberate
    out.append(badge_panel('hood-plate', (0.02, 0.60, 0.16), root,
                           (-(WIDTH - 0.10) / 2 - 0.012, hy0 + 1.10,
                            (FRAME_TOP + HOOD_TOP) / 2)))

    # cooling louvres, both sides.  [R] 4.0(2) "side louvre banks".
    for sgn in (-1, +1):
        out += grille('hood-louvre-%d' % (sgn > 0), 0.02, 0.44, MAT_PAINT,
                      root, (sgn * ((WIDTH - 0.10) / 2 + 0.008), hy0 + 0.34,
                             FRAME_TOP + 0.42), n=8, depth=0.56)

    # exhaust / cooling stack on the hood top, forward end [GA]
    out.append(box('stack', (0.30, 0.34, 0.20), MAT_WORN, root,
                   (0.34, y1 - 0.44, HOOD_TOP + 0.10), bevel=0.014))
    out.append(box('stack-cap', (0.38, 0.42, 0.03), MAT_WORN, root,
                   (0.34, y1 - 0.44, HOOD_TOP + 0.215)))
    # lifting eye - drawn on the elevation
    out.append(box('lift-eye', (0.03, 0.16, 0.13), MAT_STEEL, root,
                   (-0.30, y1 - 0.26, HOOD_TOP + 0.065), bevel=0.01))

    # ---- the cable reel -------------------------------------------------
    # The single clearest "this is underground" signal there is: the machine
    # TRAMS ON DIESEL AND DRILLS ON MAINS, so it is plugged in whenever it is
    # working, and the cable runs away down the drive behind it.  [R] 4.0(7),
    # and section 9.6: a longhole rig rendered without its cable is rendered
    # mid-impossibility.  On pivot: so the game can spool it.
    reel = empty(NODE_PIVOT, 'cable-reel', root, (0, REEL_Y, REEL_CZ))
    rout = []
    for sgn in (-1, +1):
        rout.append(disc('reel-flange%d' % (sgn > 0), REEL_R, 0.020, MAT_WORN,
                         (sgn * REEL_W / 2, 0, 0), 'X', sides=24))
    rout.append(disc('reel-core', REEL_R * 0.57, REEL_W, MAT_DARK,
                     (0, 0, 0), 'X', sides=20))
    # the radial spokes the elevation actually draws on the outboard flange
    from mathutils import Matrix
    sp = box('reel-spoke', (0.018, REEL_R * 0.92, 0.05), MAT_WORN, None,
             (REEL_W / 2 + 0.02, 0, 0))
    sp.data.transform(Matrix.Translation((0, REEL_R * 0.46, 0)))
    rout.append(radial(sp, 6, 'X'))
    # the wound cable itself: a fat matte-black round cable, not a flat one
    rout.append(disc('reel-cable', REEL_R * 0.74, REEL_W * 0.86, MAT_RUBBER,
                     (0, 0, 0), 'X', sides=20))
    for o in rout:
        o.location = (o.location[0], o.location[1], o.location[2])
    weld(rout, reel, 'reel')

    # the cable leaving the drum and running away down the drive.  hose()
    # DRAPES, which a straight cylinder never will, and this is the one place
    # on the machine where that matters most.
    # It is stopped a little over a metre behind the tail rather than run off
    # to the horizon: long enough to read as "this goes somewhere", short
    # enough that it does not dominate the model's bounding box and make every
    # dimension check meaningless.  Baked to a mesh so it JOINS the rubber
    # group instead of costing its own draw call - an unbaked curve is skipped
    # by finish()'s join, which is worth 1 call each and there are seven hoses
    # on this machine.
    out.append(bake(hose('cable-run',
                         [(0, REEL_Y - REEL_R * 0.80, REEL_CZ - 0.10),
                          (0.10, REEL_Y - 0.72, 0.52),
                          (0.24, REEL_Y - 1.35, 0.09),
                          (0.28, REEL_Y - 2.10, 0.045)],
                         radius=CABLE_D / 2, mat=MAT_RUBBER, parent=root,
                         sides=6)))

    # water hose reel - a second, smaller drum.  Flushing water comes off the
    # mine's service line, not a tank on board.  [S] p.3 "Water hose reel
    # including hose".
    out.append(disc('water-reel-a', 0.28, 0.02, MAT_WORN,
                    (-0.62, y1 - 0.16, FRAME_TOP + 0.30), 'X', sides=16,
                    parent=root))
    out.append(disc('water-reel-b', 0.28, 0.02, MAT_WORN,
                    (-0.30, y1 - 0.16, FRAME_TOP + 0.30), 'X', sides=16,
                    parent=root))
    out.append(disc('water-hose', 0.245, 0.30, MAT_RUBBER,
                    (-0.46, y1 - 0.16, FRAME_TOP + 0.30), 'X', sides=16,
                    parent=root))

    # fire suppression bottle.  [S] p.3 "Fire suppression system ANSUL".
    # [R] 4.0(9): a pressure bottle in a bracket with a red actuator plate -
    # "the one bright red thing on a grey machine".
    out.append(tube('ansul-bottle', 0.105, 0.52, MAT_HAZARD, parent=root,
                    loc=(0.70, y1 - 0.34, FRAME_TOP + 0.03), sides=12))
    out.append(box('ansul-pull', (0.02, 0.13, 0.13), MAT_HAZARD, root,
                   (0.80, y1 - 0.10, FRAME_TOP + 0.44), bevel=0.005))

    # wheel chocks, one each side, on their holders
    for sgn in (-1, +1):
        out.append(box('chock%d' % (sgn > 0), (0.11, 0.24, 0.16), MAT_HAZARD,
                       root, (sgn * (FRAME_W / 2 + 0.06), y0 + 0.75,
                              FRAME_TOP + 0.09), rot=(D(12), 0, 0),
                       bevel=0.008))

    # rear axle and its wheels.  The axle oscillates +-8 degrees [S], which is
    # why it is a single beam across and not two independent hubs.
    out.append(tube('rear-axle', 0.085, WIDTH - 0.30, MAT_CAST, parent=root,
                    loc=(-(WIDTH - 0.30) / 2, AXLE_R, WHEEL_R),
                    rot=(0, math.pi / 2, 0), sides=10))
    for sgn in (-1, +1):
        out += build_wheel('wheel-r%d' % (sgn > 0), root, sgn * HUB_X, AXLE_R)

    # rear jack - printed at 637 mm behind the rear axle, pad 230 mm up
    build_jack('jack-rear', root, JACK_R_Y)

    return out


# ===========================================================================
# JACKS - the carrier's own, separate from and smaller than the feed stingers
# ===========================================================================
def build_jack(name, parent, y):
    """One carrier jack on a slide: node, so the game can set it down.

    [S] p.3 "Front and rear jacks", and the elevation prints the geometry:
    637 mm behind the rear axle, 700 mm ahead of the front, pad standing
    230 mm off the floor retracted.  A longhole rig must not move a millimetre
    while a 20 m hole is drilled, so when it is working the tyres are visibly
    unloaded and the machine sits on steel ([R] 4.3).
    """
    nd = empty(NODE_SLIDE, name, parent, (0, y, 0))
    o = []
    o.append(box(name + '-house', (0.20, 0.19, FRAME_TOP - JACK_PAD_Z - 0.02),
                 MAT_DARK, None,
                 (0, 0, (FRAME_TOP + JACK_PAD_Z) / 2), bevel=0.010))
    o.append(strut(name + '-leg', (0, 0, JACK_PAD_Z + 0.22), (0, 0, JACK_PAD_Z),
                   0.055, MAT_CHROME))
    o.append(disc(name + '-pad', 0.115, 0.035, MAT_WORN,
                  (0, 0, JACK_PAD_Z + 0.017), 'Z', sides=14))
    weld([x for x in o if x], nd, name)
    return nd


# ===========================================================================
# FRONT FRAME - drilling end, operator's station, boom bulkhead
# ===========================================================================
def build_front(art):
    """Everything forward of the articulation pin.

    All of it hangs off pivot:articulation, so all of it is DYNAMIC and none of
    it is joined by finish() - it is welded by material at the end of build().
    [R] section 5(1): the articulation is the machine's strongest silhouette
    cue after the low roof.  Any render that shows this machine as one rigid
    box is wrong from the first glance.
    """
    out = []
    y0, y1 = -0.30, FRONT_END
    ymid = (y0 + y1) / 2

    out.append(box('front-frame', (FRAME_W, y1 - y0, FRAME_TOP - FRAME_BOT),
                   MAT_DARK, art, (0, ymid, (FRAME_BOT + FRAME_TOP) / 2),
                   bevel=0.012))
    out.append(box('front-belly', (FRAME_W * 0.98, (y1 - y0) * 0.94, 0.022),
                   MAT_WORN, art, (0, ymid, FRAME_BOT + 0.011)))
    out.append(box('front-deck', (WIDTH - 0.24, y1 - y0 - 0.10, 0.030),
                   MAT_WORN, art, (0, ymid, DECK), bevel=0.004))

    # ---- the articulation joint itself ----------------------------------
    # Two frames, a vertical pin pair, and two steering rams ACROSS the joint
    # at +-40 degrees.  At full lock the machine is a V and the two bodies are
    # visibly separate objects.  [R] 4.0(1), [S] p.3.
    out.append(tube('artic-pin', 0.085, 0.86, MAT_STEEL, parent=art,
                    loc=(0, y0 + 0.02, FRAME_BOT - 0.02), sides=12))
    for z in (FRAME_BOT + 0.06, FRAME_TOP - 0.06):
        out.append(box('artic-boss-%d' % int(z * 100), (0.34, 0.24, 0.14),
                       MAT_CAST, art, (0, y0 + 0.02, z), bevel=0.012))
    for sgn in (-1, +1):
        out += ram('steer-ram%d' % (sgn > 0),
                   (sgn * 0.30, y0 - 0.62, FRAME_BOT + 0.20),
                   (sgn * 0.58, y0 + 0.34, FRAME_BOT + 0.20), 0.052, art)

    # ---- operator's station ---------------------------------------------
    # An enclosed glazed ROPS+FOPS box on one side, with a SWINGABLE SEAT so
    # the operator faces the boom to drill and forward to tram ([S] p.3).
    # NOTE ON GLASS: MAT_GLASS is a NAME ONLY and must never carry
    # transmission > 0 - measured at +65..81 draw calls, independent of the
    # object's size, and it has been found in this codebase three times
    # (HANDOFF section 8F).  Nothing here sets it.
    cw = CAB_X1 - CAB_X0
    cy = CAB_Y1 - CAB_Y0
    cxm, cym = (CAB_X0 + CAB_X1) / 2, (CAB_Y0 + CAB_Y1) / 2
    post = 0.075
    for px, py in ((CAB_X0 + post / 2, CAB_Y0 + post / 2),
                   (CAB_X0 + post / 2, CAB_Y1 - post / 2),
                   (CAB_X1 - post / 2, CAB_Y0 + post / 2),
                   (CAB_X1 - post / 2, CAB_Y1 - post / 2)):
        out.append(box('cab-post-%d%d' % (px > cxm, py > cym),
                       (post, post, H_ROOF - DECK - 0.10), MAT_PAINT, art,
                       (px, py, (DECK + H_ROOF - 0.10) / 2), bevel=0.008))
    out.append(box('cab-floor', (cw, cy, 0.05), MAT_DARK, art,
                   (cxm, cym, DECK + 0.02)))
    # glazing: four lights, inset from the posts.  The front window on this
    # class is 22 mm laminated and its edge is visible ([R] section 6).
    g = 0.022
    out.append(box('cab-glass-front', (cw - post, g, H_ROOF - DECK - 0.42),
                   MAT_GLASS, art,
                   (cxm, CAB_Y1 - g, DECK + 0.20 + (H_ROOF - DECK - 0.42) / 2)))
    out.append(box('cab-glass-rear', (cw - post, g, H_ROOF - DECK - 0.52),
                   MAT_GLASS, art,
                   (cxm, CAB_Y0 + g, DECK + 0.24 + (H_ROOF - DECK - 0.52) / 2)))
    for sx, nm in ((CAB_X0, 'l'), (CAB_X1, 'r')):
        out.append(box('cab-glass-%s' % nm,
                       (g, cy - post, H_ROOF - DECK - 0.50), MAT_GLASS, art,
                       (sx + (g if sx < cxm else -g), cym,
                        DECK + 0.26 + (H_ROOF - DECK - 0.50) / 2)))
    # kick panels below the glass, and the door handle rail
    out.append(box('cab-kick', (cw, cy, 0.24), MAT_PAINT, art,
                   (cxm, cym, DECK + 0.14), bevel=0.010))
    out.append(tube('cab-handle', 0.014, 0.34, MAT_STEEL, parent=art,
                    loc=(CAB_X0 - 0.03, CAB_Y0 + 0.30, DECK + 0.55), sides=6))
    # the roof, on a slide: so the game can drop it.  [S] prints "Height
    # tramming, roof up/down 2 800/2 100" - one machine, two poses, 700 mm
    # apart, which is how it gets under a low back.  The MECHANISM is NOT
    # SOURCED; the two heights are printed, so the node is real and the
    # linkage is not modelled.
    roof = empty(NODE_SLIDE, 'cab-roof', art, (0, 0, 0))
    rf = [box('cab-roof-plate', (cw + 0.10, cy + 0.10, 0.075), MAT_PAINT, None,
              (cxm, cym, H_ROOF - 0.038), bevel=0.014)]
    rf.append(box('cab-roof-lip', (cw + 0.16, cy + 0.16, 0.020), MAT_DARK,
                  None, (cxm, cym, H_ROOF - 0.086)))
    weld(rf, roof, 'cabroof')

    # seat, console and the FOPS grizzly bar over the front window
    out.append(box('seat-base', (0.42, 0.42, 0.12), MAT_DARK, art,
                   (cxm, cym - 0.06, DECK + 0.30), bevel=0.02))
    out.append(box('seat-back', (0.42, 0.11, 0.46), MAT_DARK, art,
                   (cxm, cym - 0.26, DECK + 0.58), rot=(D(-8), 0, 0),
                   bevel=0.02))
    out.append(box('console', (0.30, 0.20, 0.14), MAT_DARK, art,
                   (cxm + 0.28, cym + 0.26, DECK + 0.62), rot=(D(-18), 0, 0),
                   bevel=0.012))
    out += mesh_panel('grizzly', cw - post, 0.44, MAT_DARK, art,
                      (cxm, CAB_Y1 + 0.035, H_ROOF - 0.34))

    # step and illuminated stair to the deck.  [S] p.3 "Illuminated stairs for
    # platform LED" - the lamp for it is built with the others.
    # These sit INSIDE the 2 100 mm envelope, which is what a published width
    # means: on the first build the step and its rail hung 60 mm outboard and
    # took the measured width to 2.166 m.  A step that sticks out past the
    # tyres is also a step that gets torn off by the first drive wall.
    for i, sz in enumerate((0.32, 0.62)):
        out.append(box('step-%d' % i, (0.26, 0.24, 0.026), MAT_HAZARD, art,
                       (CAB_X0 - 0.10, CAB_Y0 - 0.14, sz)))
    out.append(tube('stair-rail', 0.016, 0.90, MAT_STEEL, parent=art,
                    loc=(CAB_X0 - 0.19, CAB_Y0 - 0.14, 0.32), sides=6))

    # A grab rail beside the door, and NOT a run of handrail along the deck.
    # The first attempt put a two-rail run at deck + 0.98 down the left side,
    # which lands ABOVE the 1.69 m hood line: from three-quarter view it read
    # as two bars floating over the cable reel.  [R] section 8.10 says both
    # spec sheets confirm ground-level service access EXISTS and neither
    # dimensions or locates it - so the honest move is the small piece that is
    # certainly there (a handhold at the step) rather than the big piece that
    # is guessed.
    out.append(tube('door-grab', 0.017, 0.72, MAT_STEEL, parent=art,
                    loc=(CAB_X0 - 0.055, CAB_Y0 - 0.02, DECK + 0.16),
                    sides=6))
    for zz in (DECK + 0.16, DECK + 0.88):
        out.append(strut('door-grab-arm%d' % int(zz * 100),
                         (CAB_X0 + 0.01, CAB_Y0 - 0.02, zz),
                         (CAB_X0 - 0.055, CAB_Y0 - 0.02, zz), 0.015,
                         MAT_STEEL, art, sides=6))

    # ---- the right-hand side: electric cabinet, oil tank, compressor ------
    # [S] p.3: switch gear, PC4/PC5 plug socket, stainless electrical
    # enclosure, hydraulic oil tank with a level indicator and temperature
    # gauge, onboard compressor, and a hydraulic water booster pump.
    out.append(box('e-cabinet', (0.62, 0.94, H_ROOF - DECK - 0.62), MAT_PAINT,
                   art, (0.52, CAB_Y0 + 0.44, DECK + (H_ROOF - DECK - 0.62) / 2),
                   bevel=0.016))
    out.append(box('e-door', (0.02, 0.72, 0.80), MAT_STEEL, art,
                   (0.84, CAB_Y0 + 0.44, DECK + 0.52), bevel=0.006))
    out.append(box('oil-tank', (0.56, 0.66, 0.44), MAT_PAINT, art,
                   (0.50, CAB_Y1 - 0.20, DECK + 0.24), bevel=0.020))
    out.append(box('compressor', (0.60, 0.80, 0.46), MAT_DARK, art,
                   (0.48, y0 + 0.52, DECK + 0.25), bevel=0.016))
    out += grille('comp-louvre', 0.02, 0.32, MAT_DARK, art,
                  (0.79, y0 + 0.52, DECK + 0.25), n=6, depth=0.60)

    # centralised greasing block with its bundle of thin nylon lines - [R]
    # 4.0(10), and [S] p.3 "Automatic lubrication for drilling and positioning
    # unit"
    out.append(box('grease-block', (0.16, 0.20, 0.16), MAT_CAST, art,
                   (0.30, y0 + 0.20, DECK + 0.10), bevel=0.008))

    # ---- front axle, wheels, jack, bulkhead ------------------------------
    out.append(tube('front-axle', 0.085, WIDTH - 0.30, MAT_CAST, parent=art,
                    loc=(-(WIDTH - 0.30) / 2, AXLE_F, WHEEL_R),
                    rot=(0, math.pi / 2, 0), sides=10))
    for sgn in (-1, +1):
        out += build_wheel('wheel-f%d' % (sgn > 0), art, sgn * HUB_X, AXLE_F)
    build_jack('jack-front', art, JACK_F_Y)

    # the boom turret: the bulkhead the whole working end stands on
    out.append(box('turret', (0.62, 0.56, BOOM_PIN_Z - FRAME_TOP + 0.10),
                   MAT_PAINT, art,
                   (0, BOOM_PIN_Y, (FRAME_TOP + BOOM_PIN_Z + 0.10) / 2),
                   bevel=0.018))
    out.append(box('nose-plate', (WIDTH - 0.34, 0.05, 0.34), MAT_DARK, art,
                   (0, FRONT_END - 0.03, FRAME_TOP - 0.02), bevel=0.008))
    return out


# ===========================================================================
# THE BOOM - a straight two-part telescopic tube with the feed on a CROSS AXLE
# ===========================================================================
def build_boom(art):
    """pivot:boom-slew -> pivot:boom-lift -> slide:boom-tele -> the feed.

    THE ONE THING TO GET RIGHT: the boom does NOT carry the feed on its end
    like a face jumbo.  It terminates in a TRANSVERSE AXLE that passes through
    the middle of the feed, and the +-114 degree tilt is about that axle
    ([R] section 3.4, read off the coverage drawings at 9x).  Build it
    cantilevered off the feed's lower end and every pose past ~40 degrees reads
    as a jumbo pointed at the ceiling - [R] section 9.2.

    NOT SOURCED, and said plainly: the printed plan coverage is 5 975 mm at
    +-35 degrees of swing, which needs an effective reach of about 5.2 m if the
    coverage were swept by boom slew alone.  This pose's boom is 2.27 m, fixed
    by two PRINTED figures (the base pin scaled off the elevation, the drilling
    axis printed at 2 605 mm ahead of the front axle).  The drawing shows the
    feed slewing as well as the boom, and the reconciliation is not published.
    The printed swing limit is carried on the node; the geometry is not
    invented to match the coverage figure.
    """
    slew = empty(NODE_PIVOT, 'boom-slew', art, (0, BOOM_PIN_Y, BOOM_PIN_Z))
    lift = empty(NODE_PIVOT, 'boom-lift', slew, (0, 0, 0))

    dy = DRILL_Y - BOOM_PIN_Y
    dz = FEED_MID_Z - BOOM_PIN_Z
    blen = math.sqrt(dy * dy + dz * dz)          # [D] 2.273 in this pose
    ang = math.atan2(dz, dy)                     # [D] +6.1 degrees
    inner = blen - BOOM_SEG                      # [D] 1.023

    # inner arm - a box weld off the turret, tapering into the round outer arm
    a0 = (0, 0, 0)
    a1 = (0, inner * math.cos(ang), inner * math.sin(ang))
    inner_parts = [
        strut('boom-inner', a0, a1, BOOM_R, MAT_PAINT, lift, sides=10),
        box('boom-yoke', (0.34, 0.24, 0.26), MAT_CAST, lift,
            (0, 0.02, 0), bevel=0.014),
    ]
    # the lift cylinder slung underneath, base lug on the turret.  Drawn on the
    # elevation as a heavy ram below the arm.
    inner_parts += ram('boom-lift-ram', (0, -0.26, -0.30),
                       (0, inner * 0.86 * math.cos(ang) + 0.04,
                        inner * 0.86 * math.sin(ang) - 0.12), 0.070, lift)
    weld([o for o in inner_parts if o], lift, 'boominner')

    # outer arm on slide: - the telescope.  The printed 1 250 mm section.
    tele = empty(NODE_SLIDE, 'boom-tele', lift,
                 (0, inner * math.cos(ang), inner * math.sin(ang)))
    b1 = (0, BOOM_SEG * math.cos(ang), BOOM_SEG * math.sin(ang))
    tele_parts = [
        strut('boom-outer', (0, 0, 0), b1, BOOM_R * 0.80, MAT_STEEL, tele,
              sides=10),
        # the cross axle: the whole point of this machine's geometry
        tube('feed-axle', 0.072, 0.56, MAT_CAST, parent=tele,
             loc=(-0.28, b1[1], b1[2]), rot=(0, math.pi / 2, 0), sides=12),
        box('axle-yoke', (0.44, 0.22, 0.30), MAT_CAST, tele,
            (0, b1[1] - 0.06, b1[2]), bevel=0.014),
    ]
    # the hose loop from the boom knuckle to the moving feed.  Hose routing is
    # one of the clearest tells that a machine was modelled from a drawing
    # rather than from memory ([R] section 7, and rig.py's own hose() docstring).
    for i, xo in enumerate((-0.13, -0.09, 0.09, 0.13)):
        tele_parts.append(hose('boom-hose-%d' % i,
                               [(xo, -0.10, -0.10),
                                (xo * 1.5, blen * 0.22, -0.34),
                                (xo * 1.3, b1[1] - 0.10, -0.16),
                                (xo, b1[1] + 0.02, 0.02)],
                               radius=0.026, mat=MAT_RUBBER, parent=tele,
                               sides=6))
    weld([o for o in tele_parts if o], tele, 'boomouter')

    # a lamp on the boom.  env.js re-aims a spotlight at this every frame, so
    # it sweeps the drive as the boom moves - which is most of why real
    # underground footage looks the way it does.
    worklight('boom', tele, (0.26, b1[1] * 0.45, 0.16),
              (0.10, 1.0, -0.28), 54, 24)
    return tele, b1


# ===========================================================================
# THE FEED - tilt, 360 roll, extension, carriage, carousel, stingers
# ===========================================================================
def build_feed(tele, b1):
    """The chain the game swings a ring with.

    pivot:feed-tilt   +-114 deg about the boom's cross axle   [S]
    pivot:mast        360 deg roll about the feed's own axis  [S]
      (named 'mast' because src/core/gltfRig.js looks that string up to drive
       the primary drilling member on every machine in the fleet - it is a
       ROLE, not a shape.  There is no mast on this rig.)
    slide:feed-extend 900 mm of bodily feed travel            [S]
    slide:carriage    the rock drill up and down the beam
    """
    tilt = empty(NODE_PIVOT, 'feed-tilt', tele, (0, b1[1], b1[2]))
    mast = empty(NODE_PIVOT, 'mast', tilt, (0, 0, 0))
    mast['tilt_deg'] = 114.0        # printed; carried as extras for the game
    mast['roll_deg'] = 360.0
    fx = empty(NODE_SLIDE, 'feed-extend', mast, (0, 0, 0))

    # feed-local frame: +Z is UP the feed toward its head, origin at the cross
    # axle.  In the built pose the feed is vertical, so feed-local Z is world Z
    # and the foot sits at -(FEED_LEN/2).
    z0 = -FEED_LEN / 2      # foot
    z1 = +FEED_LEN / 2      # head

    parts = []
    # the beam.  A fabricated box-section rail with the carriage riding it on
    # slides - there is NO LATTICE anywhere on this machine ([R] 4.3).  Lattice
    # belongs to a raise borer's derrick or a piling mast, not here.
    parts.append(box('feed-beam', (FEED_W, FEED_H, FEED_LEN), MAT_PAINT, fx,
                     (0, -0.09, 0), bevel=0.010))
    for sgn in (-1, +1):
        parts.append(box('feed-rail%d' % (sgn > 0), (0.045, 0.075, FEED_LEN),
                         MAT_STEEL, fx, (sgn * (FEED_W / 2 - 0.02), 0.005, 0)))
    # end housings: the feed table's four rows are all rod length + 1 815 mm,
    # and these two boxes plus the carriage over-run are that constant.
    parts.append(box('feed-head', (FEED_W + 0.05, FEED_H + 0.06, 0.20),
                     MAT_DARK, fx, (0, -0.09, z1 - 0.10), bevel=0.010))
    parts.append(box('feed-foot', (FEED_W + 0.05, FEED_H + 0.10, 0.26),
                     MAT_DARK, fx, (0, -0.07, z0 + 0.13), bevel=0.010))

    # the cradle the feed slides in, and the extension ram that drives it
    parts.append(box('feed-cradle', (FEED_W + 0.13, FEED_H + 0.13, 0.52),
                     MAT_DARK, fx, (0, -0.09, 0.02), bevel=0.014))
    parts += ram('feed-ext-ram', (0.20, -0.20, -0.24), (0.20, -0.20, 0.66),
                 0.045, fx)

    # Rod guide / drill-steel support at the ROCK end of the feed - a V-jawed
    # clamp closing on the string, plus a bushing below it.  The plan coverage
    # drawing shows the V-clamp unambiguously.  It goes at the end the hole is
    # at, which in this uphole pose is the head; roll the feed 180 degrees and
    # the same end faces the floor, which is the point of a 360 degree feed.
    for sgn in (-1, +1):
        parts.append(box('guide-jaw%d' % (sgn > 0), (0.11, 0.20, 0.09),
                         MAT_WORN, fx, (sgn * 0.085, 0.20, z1 - 0.06),
                         rot=(0, 0, sgn * D(28)), bevel=0.006))
    parts.append(disc('guide-bush', 0.075, 0.06, MAT_WORN,
                      (0, 0.20, z1 - 0.42), 'Z', sides=12, parent=fx))

    # The bracket that actually carries the carousel off the beam.  Without it
    # the drum floats beside the feed with no visible connection, which is the
    # kind of thing a driller spots instantly.
    parts.append(box('caro-bracket', (CARO_OFF, 0.13, 0.16), MAT_PAINT, fx,
                     (CARO_OFF / 2, 0.02, z0 + 0.34), bevel=0.010))
    parts.append(box('caro-bracket-2', (CARO_OFF, 0.13, 0.16), MAT_PAINT, fx,
                     (CARO_OFF / 2, 0.02, z0 + 0.34 + ROD_LEN * 0.84),
                     bevel=0.010))
    # the feed's chain/cylinder cover down one side of the beam, and the two
    # slide pads the carriage runs on.  [R] section 8.4 is explicit that no
    # feed cross-section is published, so this is form, not dimension.
    parts.append(box('feed-chain-cover', (0.085, 0.10, FEED_LEN - 0.30),
                     MAT_DARK, fx, (-(FEED_W / 2 + 0.03), -0.09, 0),
                     bevel=0.008))

    # feed lamps.  These are the ones that matter: they light the collar and
    # the rod being added, and they move with the feed through 114 degrees of
    # tilt, so the light in the drive swings as the ring is drilled.
    worklight('feed-collar', fx, (0.24, 0.16, z0 + 0.42),
              (0.05, 0.55, -1.0), 50, 18)
    worklight('feed-head', fx, (-0.24, 0.16, z1 - 0.55),
              (-0.05, 0.5, -1.0), 50, 20)

    build_carriage(fx, z0, z1)
    build_carousel(fx, z0)
    build_stingers(fx, z0, z1)
    weld([o for o in parts if o], fx, 'feed')
    return fx


def build_carriage(fx, z0, z1):
    """The rock drill on slide:carriage, and the string running UP from it.

    src/core/gltfRig.js looks up `slides.get('carriage')` and `mounts.get(
    'tool')` by string; both are here.

    THE POSE IS AN UPHOLE, AND THAT IS A DELIBERATE DOMAIN CHOICE.
    A ring is drilled up, down and sideways from one set-up.  The first build
    put the drill high on the feed with the string running DOWN, which is a
    perfectly real downhole - and it buried 1.5 m of rod below z = 0.  This
    model's origin is ground level and the game drops the machine onto terrain
    at y = 0, so that rod is under the floor of the drive.  Turning the pose
    over costs nothing and buys three things:
      - no geometry below the floor plane;
      - the image [R] section 5(3) calls the machine's whole identity - "a
        machine drilling vertically upward through its own roofline is a
        longhole rig and nothing else";
      - the head stinger becomes what it actually is on an uphole, the brace
        that holds the collar against the back while the hole is collared.
    The drill therefore sits LOW on the beam and travels up, which is also
    what one rod into a hole looks like.
    """
    car = empty(NODE_SLIDE, 'carriage', fx, (0, 0, z0 + 0.60))
    p = []
    p.append(box('carriage-plate', (FEED_W + 0.02, 0.10, 0.30), MAT_STEEL, car,
                 (0, 0.04, 0), bevel=0.006))
    # the drill itself: a stepped body, not one smooth block.  Percussion end
    # at the bottom, a fatter mid housing, then the rotation head and the
    # shank at the TOP, pointing the way the hole goes.
    p.append(box('drill-body', (0.235, 0.245, DRIFTER_LEN * 0.62), MAT_DARK,
                 car, (0, 0.20, -DRIFTER_LEN * 0.14), bevel=0.012))
    p.append(box('drill-rot', (0.275, 0.285, DRIFTER_LEN * 0.30), MAT_CAST,
                 car, (0, 0.20, DRIFTER_LEN * 0.32), bevel=0.014))
    p.append(disc('drill-shank', 0.055, 0.20, MAT_STEEL,
                  (0, 0.20, DRIFTER_LEN * 0.42), 'Z', sides=10, parent=car))
    # the flushing head and its two hoses - water at 12 bar [S] and air.
    # The hoses drape back to the beam; hose routing is one of the clearest
    # tells that a machine was modelled from a drawing rather than memory.
    p.append(disc('flush-head', 0.085, 0.13, MAT_CAST,
                  (0, 0.20, DRIFTER_LEN * 0.36), 'Z', sides=12, parent=car))
    for i, xo in enumerate((-0.11, 0.11)):
        p.append(hose('drill-hose-%d' % i,
                      [(xo, 0.20, DRIFTER_LEN * 0.36),
                       (xo * 1.9, 0.02, -0.26),
                       (xo * 1.4, -0.16, -0.60)],
                      radius=0.024, mat=MAT_RUBBER, parent=car, sides=6))
    weld([o for o in p if o], car, 'carriage')

    # the string above the chuck, on its own pivot so it can turn.
    spindle = empty(NODE_PIVOT, 'spindle', car, (0, 0.20, DRIFTER_LEN * 0.60))
    # How far the string reaches: to just past the feed head and 160 mm into
    # the back, so the collar is visibly IN the rock rather than hovering in
    # the drive.  Derived from the pose, not chosen: feed head is at
    # z1 - (z0 + 0.60) - DRIFTER_LEN*0.60 above the spindle.
    reach = (z1 - (z0 + 0.60) - DRIFTER_LEN * 0.60) + STING_TOP - 0.29
    s = []
    # A rod is NOT a smooth stick.  Along a 1.525 m rod: a parallel body, then
    # a female box swelling to 63 mm where it is gripped [R2].  At thumbnail
    # size the string reads as a stack of segments with a COLLAR EVERY 1.5 m,
    # and that beat is the thing to preserve - it is what says "short rods",
    # which is this class's most reliable visual tell.
    s.append(tube('rod-1', ROD_R, min(ROD_LEN, reach), MAT_WORN,
                  parent=spindle, loc=(0, 0, 0), sides=10))
    s.append(disc('rod-1-box', ROD_BOX_R, 0.12, MAT_STEEL,
                  (0, 0, 0.06), 'Z', sides=10, parent=spindle))
    if reach > ROD_LEN + 0.05:
        s.append(disc('rod-2-box', ROD_BOX_R, 0.12, MAT_STEEL,
                      (0, 0, ROD_LEN), 'Z', sides=10, parent=spindle))
        s.append(tube('rod-2', ROD_R, reach - ROD_LEN, MAT_WORN,
                      parent=spindle, loc=(0, 0, ROD_LEN), sides=10))
    weld([o for o in s if o], spindle, 'string')
    # mount:tool - where the game hangs the bit the player actually bought.
    # It is up in the rock, which is the truth of this machine: the driller
    # never sees the bit again until the string comes back out.
    R.empty(NODE_MOUNT, 'tool', spindle, (0, 0, reach))
    return car


def build_carousel(fx, z0):
    """The rod carousel and the arm that swings a rod to the drill centre.

    This is the busiest-looking assembly on the machine and the one a player
    watches ([R] 4.3).  Sourced: the drum's axis is PARALLEL TO THE FEED, it
    sits beside the drill centreline at the lower end of the feed, and the
    gripper arms are INSIDE the drum.  Scaled and flagged: the drum's 0.56 m
    diameter and 0.49 m offset are [GA] +-5 %, not published.
    """
    drum = empty(NODE_PIVOT, 'carousel', fx,
                 (CARO_OFF, 0.02, z0 + 0.30 + ROD_LEN / 2))
    d = []
    for zs in (-1, +1):
        d.append(disc('caro-plate%d' % (zs > 0), CARO_R, 0.028, MAT_DARK,
                      (0, 0, zs * ROD_LEN * 0.42), 'Z', sides=18))
    d.append(tube('caro-shaft', 0.055, ROD_LEN * 0.94, MAT_STEEL,
                  loc=(0, 0, -ROD_LEN * 0.47), sides=10))
    # 10 rods in the drum, on a pitch circle inside the flanges [S] RHS 10.
    # The eleventh is in the hole, which is why the spec says 10+1 and why the
    # drum is not drawn with a ring's worth of steel in it ([R] section 9.5).
    from mathutils import Matrix
    rodo = CARO_R * 0.74
    rod = tube('caro-rod', ROD_R, ROD_LEN, MAT_WORN,
               loc=(0, 0, -ROD_LEN / 2), sides=8)
    rod.data.transform(Matrix.Translation((rodo, 0, 0)))
    d.append(radial(rod, CARO_N - 1, 'Z'))
    # the pocket fingers that hold them
    fing = box('caro-finger', (0.05, 0.10, 0.05), MAT_STEEL, None,
               (0, 0, ROD_LEN * 0.30))
    fing.data.transform(Matrix.Translation((rodo, 0, 0)))
    d.append(radial(fing, CARO_N - 1, 'Z'))
    weld([o for o in d if o], drum, 'carousel')

    # the gripper arm, pivoting from INSIDE the drum out to the drill centre.
    # The 0.49 m offset is exactly this arm's swing radius.
    arm = empty(NODE_PIVOT, 'rod-arm', fx,
                (CARO_OFF, 0.02, z0 + 1.05))
    a = [
        box('arm-link', (CARO_OFF * 0.92, 0.09, 0.075), MAT_PAINT, arm,
            (-CARO_OFF * 0.46, 0, 0), bevel=0.008),
        box('arm-jaw', (0.13, 0.15, 0.10), MAT_WORN, arm,
            (-CARO_OFF * 0.92, 0.02, 0), bevel=0.008),
    ]
    a += ram('arm-ram', (0.02, -0.16, 0.02), (-CARO_OFF * 0.55, -0.10, 0.02),
             0.035, arm)
    weld([o for o in a if o], arm, 'rodarm')
    return drum


def build_stingers(fx, z0, z1):
    """The two feed stingers - the load path that makes a 20 m hole straight.

    [S] p.3 "1 x rear and 1 x front stinger", and the coverage drawing prints
    their travel: 1 000 mm at the foot and 450 mm at the head.  The vendor copy
    for this class is explicit about why they exist: "front and rear stingers
    ... proper feed stabilization and accuracy in drilling through constant
    feed force".  The feed is propped floor-to-back like a strut and only then
    is the hole drilled.

    [R] section 9.3: if the render shows the machine drilling with nothing
    touching the back, it is showing the one thing the whole method is about
    NOT happening.  So both are built DEPLOYED.
    """
    out = []
    # foot stinger: down to the floor.  In the built pose the feed foot is
    # 150 mm off the floor, so it is extended 150 of its 1 000 mm of travel -
    # the rest is there for a broken floor and for a higher feed.
    foot = empty(NODE_SLIDE, 'stinger-foot', fx, (0, 0, z0))
    f = [
        box('sting-foot-house', (0.13, 0.15, 0.26), MAT_DARK, foot,
            (0, -0.20, 0.03), bevel=0.008),
        strut('sting-foot-leg', (0, -0.20, -0.02), (0, -0.20, -FEED_FOOT_Z),
              0.042, MAT_CHROME, foot),
    ]
    f.append(disc('sting-foot-pad', 0.10, 0.030, MAT_WORN,
                  (0, -0.20, -FEED_FOOT_Z + 0.015), 'Z', sides=12,
                  parent=foot))
    weld([o for o in f if o], foot, 'stingerfoot')
    out.append(foot)

    # head stinger: up against the back.  Fully extended here - the drift this
    # machine is specced for is 3.9 m and 0.150 + 3.340 + 0.450 = 3.94.
    head = empty(NODE_SLIDE, 'stinger-head', fx, (0, 0, z1))
    h = [
        box('sting-head-house', (0.13, 0.15, 0.22), MAT_DARK, head,
            (0, -0.20, 0.05), bevel=0.008),
        strut('sting-head-leg', (0, -0.20, 0.02), (0, -0.20, STING_TOP),
              0.042, MAT_CHROME, head),
    ]
    h.append(disc('sting-head-pad', 0.10, 0.030, MAT_WORN,
                  (0, -0.20, STING_TOP - 0.015), 'Z', sides=12, parent=head))
    weld([o for o in h if o], head, 'stingerhead')
    out.append(head)
    return out


# ===========================================================================
# LAMPS - printed counts, and env.js drives every one of them
# ===========================================================================
def build_lights(root, art):
    """[S] p.3: tramming 6x40 W LED + 2x80 W, working 4x80 W LED, manual
    spotlights 70 W left and right, illuminated stairs.

    Eight small lamps and not two big ones is itself a domain fact - it is what
    an underground machine looks like at night, which is all the time.  Three
    more are built on the boom and the feed by their own functions, for eleven
    in total.  `cone_deg` and `range_m` ride out as glTF extras and env.js
    reads them.
    """
    cw = CAB_X1 - CAB_X0
    cxm = (CAB_X0 + CAB_X1) / 2
    # joystick-controlled spotlights, left and right, 70 W - narrow and long
    for sgn, nm in ((-1, 'spot-l'), (+1, 'spot-r')):
        worklight(nm, art, (cxm + sgn * (cw / 2 - 0.06), CAB_Y1 - 0.10,
                            H_ROOF - 0.12), (sgn * 0.35, 1.0, -0.22), 34, 30)
    # front tramming pair, on the cab roof front edge - 40 W, wide and short
    for i, sgn in enumerate((-1, +1)):
        worklight('tram-f-%d' % i, art,
                  (cxm + sgn * (cw / 2 - 0.22), CAB_Y1 + 0.03, H_ROOF - 0.20),
                  (sgn * 0.12, 1.0, -0.34), 62, 16)
    # a second, lower pair on the nose plate, under the boom
    for i, sgn in enumerate((-1, +1)):
        worklight('tram-n-%d' % i, art,
                  (sgn * 0.62, FRONT_END - 0.01, FRAME_TOP + 0.06),
                  (sgn * 0.10, 1.0, -0.30), 62, 14)
    # rear tramming pair, on the tail
    for i, sgn in enumerate((-1, +1)):
        worklight('tram-r-%d' % i, root,
                  (sgn * 0.60, REAR_END + 0.02, FRAME_TOP + 0.10),
                  (sgn * 0.10, -1.0, -0.30), 62, 14)
    # the illuminated stair - tiny, close, and it is the one lamp that tells a
    # viewer the machine's scale
    worklight('stair', art, (CAB_X0 - 0.10, CAB_Y0 - 0.05, DECK + 0.02),
              (-0.3, -0.5, -1.0), 70, 5)


# ===========================================================================
# BUILD
# ===========================================================================
def build(out_path):
    reset()
    _assert_box_is_true()

    root = empty('', 'rig:longhole-rig', None, (0, 0, 0))

    # The articulation is the machine's turning centre and its strongest
    # silhouette cue.  Everything forward of the pin hangs off it.
    art = empty(NODE_PIVOT, 'articulation', root, (0, 0, 0))
    art['steer_deg'] = 40.0     # [S] printed, carried out as an extra

    build_rear(root)
    build_front(art)
    tele, b1 = build_boom(art)
    build_feed(tele, b1)
    build_lights(root, art)

    # ---- weld the front frame -------------------------------------------
    # Everything under pivot:articulation is excluded from finish()'s join, so
    # without this the front half of the machine is ~90 separate draw calls.
    front = [o for o in bpy.context.scene.objects
             if o.type == 'MESH' and o.parent is art]
    weld(front, art, 'front')

    R.finish(out_path)

    # ---- read the figures back off the MESH, not off the intent ----------
    # HANDOFF section 8E: an Odex eccentric that could not have come out of its
    # own hole, a ring bit advertised as cutting 0.146 mm, a belling tool whose
    # arms crossed the centreline - all of them shipped because nobody measured
    # the geometry against the number it was built from.  Read the figure off
    # the mesh.
    bpy.context.view_layer.update()
    xs, ys, zs = [], [], []
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        mw = o.matrix_world
        for c in o.bound_box:
            v = mw @ __import__('mathutils').Vector(c)
            xs.append(v.x)
            ys.append(v.y)
            zs.append(v.z)
    w, ln, h = max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs)
    print('LONGHOLE_CHECK width=%.3f (source 2.100)' % w)
    print('LONGHOLE_CHECK length=%.3f  carrier 5.860 + boom/feed forward of it'
          % ln)
    print('LONGHOLE_CHECK height=%.3f (feed vertical; roof 2.800)' % h)
    print('LONGHOLE_CHECK ground=%.3f (clearance 0.365 at the belly)'
          % min(zs))
    print('LONGHOLE_CHECK drill_axis_y=%.3f (source 2.605 ahead of front axle '
          'at %.3f)' % (DRILL_Y, AXLE_F))
    print('LONGHOLE_CHECK feed_top=%.3f vs 3.900 recommended drift'
          % (FEED_FOOT_Z + FEED_LEN + STING_TOP))
    return out_path


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    build(os.path.abspath(os.path.join(here, '..', 'public', 'models',
                                       'longhole-rig.glb')))
