"""
tunnel_jumbo - the game's two-boom face-drilling jumbo.

IN-GAME MARQUE: "Aurbach FJ-220 Faceline" (invented; DOMAIN.md section 10).
No manufacturer name, model designation or product code appears in any object
name, material, node or custom property this file EXPORTS. Provenance is cited
here, in comments, which is where it belongs. Shape is not branding.

WHAT THIS MACHINE IS
--------------------
A low, wide, centre-articulated four-wheel rubber-tyred carrier with two box-
section booms on its nose, each ending in a slender telescopic feed carrying a
hydraulic percussive rock drill. It drills the blast round in a development
heading. It TRAMS ON DIESEL AND DRILLS ON MAINS, dragging its supply cable off
an automatic reel on the back deck. Its boom lamps are the only light in the
drive, which is why they are on the booms and not on the canopy.

SOURCES
-------
[A] research/rigs/tunnel-jumbo.md - the owner's OEM catalogue reference for the
    M-class two-boom machine (dimensioned side elevations, option tables), plus
    the top-hammer tooling catalogue for the drill string.
[B] Low-profile V-layout development drill technical specification sheet,
    doc ref TS2-169:07/ENG/METRIC, 2021, fetched 2026-09-05 from
    mining.sandvik/globalassets/products/underground-drill-rigs-and-bolters/
    pdf/dd211l-v-specification-sheet-english.pdf
    Text and the vector text of the general-arrangement drawing were extracted
    with a local PDF inflate/text-matrix reader, so each printed number could be
    placed by its (x, y) on the drawing page.
[C] Narrow-vein development drill specification sheet from the same maker
    (dd212-specification-sheet-english.pdf), used ONLY to confirm that the
    nested height dimensions on the left edge of these general-arrangement
    drawings run outermost = overall, inward = successively lower features.
[D] Manufacturer product copy for two-boom low-profile rigs, read 2026-09-05:
    the canopy is raised and lowered on hydraulic cylinders, and a two-boom rig
    is offered with either a FOPS canopy or a FOPS/ROPS cabin.

THE CLASS DECISION, MADE ONCE, NOT AVERAGED
-------------------------------------------
[A] section 9.1 says: pick the M-class (23-29 t, 8.26 m carrier, ~6.8 m feeds)
or the low-profile machine, and do not average them. The brief for this model
gives 1 775 mm tramming height, which is the low-profile machine - so that is
what this is.

That decision turned out to be worth far more than a coin toss. Source [B] is
the data sheet the game's own spec block was built from: 2 260 mm transport
width, 1 775 mm tramming height, 10 375 mm transport length, 300 mm ground
clearance, +/-43 deg articulation, +/-15 deg rear-axle oscillation, 8.6 km/h,
4.3 km/h on grade, 2 132 mm hole, 2 435 mm rod, 38-51 mm holes, 74 kW diesel,
70 kW total input, 14 kW / 140 bar / 110 Hz percussion, 530 rpm, 340 Nm,
31 kN feed force, water 33 l/min at 15 bar, 380-575 V, air/oil mist shank
lubrication, FOPS/ROPS ISO 3449, 98 dB(A) to EN 16228. Every one of those is
a field in rigFactory.js's spec block, and [A] section 9.10 lists most of them
as "unsourced" or "contradicted". They are neither. They are the published
figures of a real LOW-PROFILE, SINGLE-BOOM, V-layout machine.

So the game's machine is that carrier with a second drilling boom and a basket
boom added - a deliberate game variant, not a mistake, and the carrier under it
is now fully sourced instead of guessed.

COORDINATES
-----------
Blender Z-up, metres. +Y is FORWARD, toward the face; the exporter's Y-up
conversion maps Blender +Y onto three.js -Z, which is the direction
rigFactory.js already builds this machine along. +X is the machine's right.
ORIGIN: the articulation pin at ground level. An articulated carrier has no
slew ring; the articulation IS its turning centre and the one point that does
not move when it steers, so it is this machine's "slew centre at ground level".
"""

import bpy
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import rig  # noqa: E402
from rig import (box, tube, hose, empty, worklight, finish, reset,  # noqa: E402
                 MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST,
                 MAT_RUBBER, MAT_CHROME, MAT_HAZARD,
                 NODE_PIVOT, NODE_SLIDE, NODE_MOUNT)

TAU = math.tau
D = math.radians

# ===========================================================================
# DIMENSIONS.  [S]=printed in a source.  [P]=printed, but which dimension line
# it labels is my reading of its position on the drawing.  [D]=derived, with
# the derivation given.
# ===========================================================================

# ---- carrier envelope -----------------------------------------------------
WIDTH = 2.260          # [S/B] transport width 2 260 mm. Matches the M-class
                       #       2 245 mm [A 3.1] to 15 mm, so the class is wide
                       #       regardless of how low it is.
CLEAR = 0.300          # [S/B] ground clearance 300 mm.
TRAM_LOW = 1.775       # [S/B] "Unit height in tramming, low position"
TRAM_HIGH = 1.950      # [S/B] "...high position". The roof is raised and
                       #       lowered on cylinders [D-source], which is what
                       #       the two figures are: one machine, two poses.
HOOD_TOP = 1.380       # [P/B] third of four nested heights at the rear end of
                       #       the side elevation (1 950 / 1 775 / 1 380 /
                       #       1 360). Nesting order confirmed against [C].
REEL_TOP = 1.360       # [P/B] fourth of the same four.

# ---- longitudinal chain, read off the side elevation ----------------------
# Printed along the bottom of the drawing: 1 800 and 3 650 as adjacent
# segments, 6 220 spanning, 10 375 overall. 1 800 + 3 650 + 770 = 6 220 exactly,
# so 6 220 is the CARRIER and 770 mm is the unlabelled front overhang. That
# arithmetic is why I trust the assignment.
CARRIER_LEN = 6.220    # [S/B]
WHEELBASE = 3.650      # [P/B]
OVERHANG_R = 1.800     # [P/B]
OVERHANG_F = 0.770     # [D] 6.220 - 3.650 - 1.800
TRANSPORT_LEN = 10.375  # [S/B] used at the end as a CHECK on the built model.

# Where along the wheelbase the articulation sits is not printed anywhere.
# [D] the M-class chain [A 3.2] puts it 2 000 mm behind the front axle and
# 2 170 ahead of the rear of a 4 170 wheelbase = 48 % / 52 %. Same split here.
AXLE_R = -WHEELBASE * 0.48                      # [D] -1.752
AXLE_F = +WHEELBASE * 0.52                      # [D] +1.898
REAR_END = AXLE_R - OVERHANG_R                  # [D] -3.552
FRONT_END = AXLE_F + OVERHANG_F                 # [D] +2.668

# ---- tyres ---------------------------------------------------------------
# [S/B] "Tires 315/85 x 15". [D] overall diameter = 15 in rim (381 mm)
# + 2 x (315 x 0.85) = 916.5 mm. Small tyres are HOW the machine gets under
# 1 775 mm; the M-class 12.00 R24 would stand 1.21 m and could not.
WHEEL_R = 0.4585
WHEEL_W = 0.315
HUB_X = WIDTH / 2 - WHEEL_W / 2                 # 0.9725

# ---- frame ---------------------------------------------------------------
FRAME_BOT = CLEAR
FRAME_TOP = 0.80       # [D] a 500 mm deep welded box is the shallowest that
                       #     carries a 1 800 kg boom [S/B] on a 770 mm overhang.
DECK = 0.86            # [D] frame top + 60 mm chequer plate.
FRAME_W = 1.62         # [D] WIDTH - 2 x tyre width: the wheels stand outboard
                       #     of the frame, which is what makes the machine read
                       #     as narrow-bodied and wide-tracked.
STATION_FLOOR = 0.56   # [D] the operator floor is DROPPED between the frame
                       #     rails. It has to be: 1 775 mm of roof over a 0.86 m
                       #     deck leaves 915 mm, and nobody sits in that. At
                       #     0.56 m the seated headroom is 1 215 mm, which is
                       #     also why the class exists.

# ---- boom, feed, drill, string -------------------------------------------
BOOM_X = 0.48          # [D] two booms inside a 1.62 m frame, splayed slightly:
                       #     the V-layout the maker's own copy calls out [B].
BOOM_Z = 1.00          # [D] NOT SOURCED. Set so the feed centreline clears the
                       #     tyre tops (0.917) and can still swing to the floor
                       #     for the lifter row.
BOOM_LEN = 1.70        # [D] from the coverage envelope. [S/B] the boom covers
                       #     5 700 mm of width; the pins sit at +/-480 mm, so the
                       #     head must move 2 370 mm sideways. With auto-parallel
                       #     holding the feed stays pointing at the face, so ALL of
                       #     that lateral reach comes from the arm: (L + 800 mm
                       #     telescope) x sin(slew). 1 700 + 800 = 2 500 mm reaches
                       #     it at 71 deg of slew, which is inside a jumbo boom's
                       #     swing. Cross-checked at the end of build() against the
                       #     sourced 10 375 mm transport length.
BOOM_TELE = 0.800      # [S/B] "Boom extension 800 mm"
FEED_LEN = 1.965       # [S/B] "Total length 1 965 mm" (retracted; the feed is
                       #       telescopic, which is how a 2 435 mm rod is drilled
                       #       from a machine this short)
FEED_EXT = 0.500       # [S/B] "Feed extension 500 mm" - the cradle slide
FEED_W = 0.190         # [D] scaled from the M-class feed depth:height ratio
FEED_H = 0.165         # [D] as above; [A 4.2] gives length:depth about 20:1 and
                       #     1 965 / 20 = 98 mm for the beam alone, ~165 mm over
                       #     the cradle rails.
DRIFTER_LEN = 0.571    # [S/B] "Length 571 mm"
DRIFTER_W = 0.192      # [S/B] the second figure printed with it
ROD_LEN = 2.435        # [S/B] "Rod length 2 435 / 1 830 mm"
ROD_AF = 0.025         # [S/B] "Recommended rod R32 - H25 - R32": H25 is a
                       #       HEXAGON 25 mm across flats. [A 9.5] is right that
                       #       the game draws it round; here is the exact size.
BIT_D = 0.045          # [S/B] hole size 38-51 mm; 45 mm is the middle and the
                       #       diameter the tooling catalogue [A 4.11] gives a
                       #       full button layout for: 6 x 9 mm gauge + 3 x 8 mm
                       #       face, gauge angle 30 deg.
HOLE_LEN = 2.132       # [S/B] hole length up to 2 132 mm

# ---- cable reel ----------------------------------------------------------
# [S/B] "Automatic cable reel, TCR LP II with spooling system", controls at the
# operator station AND at the rear of the unit. Drum diameter is not published
# for this machine; the M-class gives 1 600 mm [A 4.5], which cannot fit under
# a 1 380 mm hood. [D] sized so the reel top lands on REEL_TOP = 1 360 mm - the
# fourth nested height, which is exactly where a reel sitting on this deck ends.
REEL_R = 0.50
REEL_W = 0.46

BOOMS = (('l', -1), ('r', +1))


# ===========================================================================
# small helpers
# ===========================================================================
def taper(o, y_from, scale_xz):
    """Squeeze the +Y end of a mesh. A boom arm that is the same section at the
    head as at the base is a girder, not a boom."""
    for v in o.data.vertices:
        if v.co.y > y_from:
            v.co.x *= scale_xz
            v.co.z *= scale_xz
    return o


def grid(name, size, mat, parent, loc, n, bar, axis='x'):
    """A bar grid (FOPS roof, spatter screen, walkway) as one arrayed bar.
    Shares one material, so it is triangles only - never a draw call."""
    w, d, t = size
    if axis == 'x':
        b = box(name, (bar, d, t), mat, parent, loc=(loc[0] - w / 2, loc[1], loc[2]))
        step = (w / (n - 1), 0, 0)
    else:
        b = box(name, (w, bar, t), mat, parent, loc=(loc[0], loc[1] - d / 2, loc[2]))
        step = (0, d / (n - 1), 0)
    m = b.modifiers.new('arr', 'ARRAY')
    m.count = n
    m.use_relative_offset = False
    m.use_constant_offset = True
    m.constant_offset_displace = step
    return b


def cylinder(name, parent, base, tip, r_barrel, r_rod, mat_barrel=MAT_DARK):
    """A hydraulic cylinder drawn as a dark barrel with a bright chrome rod.
    [A 6]: the rods are Ni-Cr plated, and on every elevation they are drawn a
    full tone lighter than the barrel. Two objects, two materials, because that
    tonal step is most of what makes a machine read as hydraulic."""
    bx, by, bz = base
    tx, ty, tz = tip
    dx, dy, dz = tx - bx, ty - by, tz - bz
    L = math.sqrt(dx * dx + dy * dy + dz * dz)
    rot = (math.atan2(math.sqrt(dx * dx + dy * dy), dz), 0, math.atan2(dy, dx) - math.pi / 2)
    # blender: build along +Z then aim
    rot = (math.acos(max(-1.0, min(1.0, dz / L))), 0.0, math.atan2(dy, dx) + math.pi / 2)
    tube(name + '-barrel', r_barrel, L * 0.62, mat_barrel, parent, loc=base, rot=rot, sides=10)
    tube(name + '-rod', r_rod, L, MAT_CHROME, parent, loc=base, rot=rot, sides=8)
    return L


# ===========================================================================
# carrier
# ===========================================================================
def build_wheel(parent, name, x, y):
    """Tyre 315/85 x 15 [S/B]. The lugs are an ARRAY around the axis sharing the
    tyre's material: once collapsed they are triangles, not a draw call - the
    lane rig.py's docstring says to spend in."""
    piv = empty(NODE_PIVOT, name, parent, (x, y, WHEEL_R))
    side = 1 if x > 0 else -1
    tube(name + '-tyre', WHEEL_R, WHEEL_W, MAT_RUBBER, piv,
         loc=(-WHEEL_W / 2, 0, 0), rot=(0, math.pi / 2, 0), sides=20)
    # THE TREAD LUGS. An object-offset ARRAY applies
    #     inv(arrayed_object.matrix_world) @ offset_object.matrix_world
    # once per step. That is a pure rotation ONLY if the arrayed object's own
    # origin sits on the axis of rotation. This used to build the lug at
    # loc=(0, 0, WHEEL_R - 0.010) - out at the tread - so each step carried a
    # 0.45 m translation as well as the 20 deg turn, and eighteen of them
    # walked the tread off the machine. Measured off the exported .glb: every
    # tyre had a vertical extent of 7.383 m and reached 6.433 m BELOW the
    # floor, on a machine whose sourced ground clearance is 260 mm.
    #
    # It is the same failure the wheel-nut loop below describes and avoided;
    # nobody looked six lines up. It survived because a jumbo is drawn small
    # and dark, and because until now nothing in the pipeline read a dimension
    # back out of a .glb.
    #
    # Fix: keep the lug's ORIGIN on the wheel axis and bake its radius and its
    # tilt into the MESH instead. inv(lug) @ off is then exactly RotX(20 deg).
    Matrix = __import__('mathutils').Matrix
    lug = box(name + '-lug', (WHEEL_W * 0.94, 0.105, 0.05), MAT_RUBBER, piv)
    lug.data.transform(Matrix.Translation((0, 0, WHEEL_R - 0.010))
                       @ Matrix.Rotation(0.38, 4, 'X'))
    a = lug.modifiers.new('arr', 'ARRAY')
    a.count = 18
    a.use_relative_offset = False
    a.use_object_offset = True
    off = bpy.data.objects.new(name + '-lugarc', None)
    bpy.context.collection.objects.link(off)
    off.parent = piv
    off.rotation_euler = (TAU / 18, 0, 0)
    a.offset_object = off
    tube(name + '-rim', WHEEL_R * 0.58, WHEEL_W * 0.72, MAT_DARK, piv,
         loc=(-WHEEL_W * 0.36, 0, 0), rot=(0, math.pi / 2, 0), sides=16)
    tube(name + '-hub', WHEEL_R * 0.26, 0.055, MAT_DARK, piv,
         loc=(side * WHEEL_W * 0.30, 0, 0), rot=(0, side * math.pi / 2, 0), sides=12)
    # Six wheel-nut bosses on the hub face. Placed by hand rather than by a
    # radial ARRAY: an object-offset array compounds the bolt's own 90 deg
    # aiming rotation into every step, and the studs walk outboard until the
    # machine measures 2 391 mm across a sourced 2 260 mm width. Six explicit
    # tubes join into the same mesh anyway, so it costs nothing to be right.
    for i in range(6):
        a = i * TAU / 6
        tube(name + '-nut-%d' % i, 0.022, 0.04, MAT_DARK, piv,
             loc=(side * WHEEL_W * 0.26,
                  math.cos(a) * WHEEL_R * 0.30,
                  math.sin(a) * WHEEL_R * 0.30),
             rot=(0, side * math.pi / 2, 0), sides=6)
    return piv


def build_axle(parent, name, y):
    """Axle housing and differential. The differential nose is the lowest thing
    on the machine and the reason ground clearance is quoted at 300 mm."""
    tube(name + '-housing', 0.105, WIDTH - 0.34, MAT_DARK, parent,
         loc=(-(WIDTH - 0.34) / 2, y, WHEEL_R), rot=(0, math.pi / 2, 0), sides=10)
    tube(name + '-diff', 0.185, 0.30, MAT_CAST, parent,
         loc=(0, y - 0.15, WHEEL_R), rot=(-math.pi / 2, 0, 0), sides=12)
    box(name + '-guard', (0.52, 0.44, 0.05), MAT_WORN, parent,
        loc=(0, y - 0.05, CLEAR - 0.01), bevel=0.02)


def build_front_frame(art):
    """The heavy end. On a two-boom rig ~70 % of the mass is on this frame
    [A 3.1], so it is a deep welded box closed by a thick boom bulkhead, not a
    sheet-metal module. The wheels stand outboard of it."""
    g = art
    y0, y1 = 0.20, FRONT_END
    ym, yl = (y0 + y1) / 2, y1 - y0
    for s in (-1, 1):
        box('ff-rail', (0.26, yl, FRAME_TOP - FRAME_BOT), MAT_DARK, g,
            loc=(s * (FRAME_W / 2 - 0.13), ym, (FRAME_TOP + FRAME_BOT) / 2), bevel=0.022)
    box('ff-belly', (FRAME_W - 0.30, yl * 0.96, 0.09), MAT_DARK, g,
        loc=(0, ym, FRAME_BOT + 0.045), bevel=0.015)
    box('ff-deck', (FRAME_W, yl, 0.06), MAT_PAINT, g,
        loc=(0, ym, DECK - 0.03), bevel=0.02)
    # boom bulkhead: the thickest plate on the machine, both booms hang on it
    box('ff-bulkhead', (FRAME_W + 0.16, 0.14, 0.98), MAT_PAINT, g,
        loc=(0, y1 - 0.07, FRAME_BOT + 0.49), bevel=0.03)
    for _, s in BOOMS:
        box('ff-boombox', (0.40, 0.46, 0.62), MAT_PAINT, g,
            loc=(s * BOOM_X, y1 - 0.30, BOOM_Z - 0.16), bevel=0.03)
    box('ff-bumper', (WIDTH - 0.30, 0.10, 0.24), MAT_WORN, g,
        loc=(0, y1 + 0.05, FRAME_BOT + 0.14), bevel=0.03)
    # The dense crossing bundle at the boom base brackets [A 4.10 item 3]. Every
    # hydraulic line for two booms, two feeds and two rock drills leaves the
    # frame here, and a jumbo without this bundle looks like a toy from any
    # angle that shows the nose.
    for _, s in BOOMS:
        for i, dx in enumerate((-0.10, -0.03, 0.04, 0.11)):
            hose('ff-boombundle-%d%d' % (int(s), i),
                 [(s * BOOM_X + dx, y1 - 1.10, FRAME_TOP - 0.04),
                  (s * BOOM_X + dx * 1.4, y1 - 0.72, FRAME_TOP + 0.20),
                  (s * BOOM_X + dx * 1.3, y1 - 0.40, BOOM_Z - 0.02),
                  (s * BOOM_X + dx, y1 - 0.26, BOOM_Z - 0.16)],
                 radius=0.019 if i % 2 else 0.015, parent=g)
    # towing eyes
    for s in (-1, 1):
        box('ff-eye', (0.05, 0.20, 0.14), MAT_WORN, g,
            loc=(s * 0.34, y1 + 0.10, FRAME_BOT + 0.14), bevel=0.02)
    build_axle(g, 'axle-f', AXLE_F)
    return g


def build_rear_frame(root):
    """The power pack. [S/B] 74 kW diesel, 55 kW drilling powerpack, 160 l oil
    tank, oil cooler, air compressor with 2 x 60 l receivers, electric cabinet,
    automatic cable reel, 80 m of 32 mm accessory hose on a reel, 6 kg fire
    bottle with 6 nozzles, 2 wheel chocks in a holder. All of it lives under or
    on a hood whose top is 1 380 mm [P/B] and whose tail falls away hard."""
    g = empty('', 'rear-frame', root)
    y0, y1 = -0.20, REAR_END
    ym, yl = (y0 + y1) / 2, abs(y1 - y0)
    for s in (-1, 1):
        box('rf-rail', (0.26, yl, FRAME_TOP - FRAME_BOT), MAT_DARK, g,
            loc=(s * (FRAME_W / 2 - 0.13), ym, (FRAME_TOP + FRAME_BOT) / 2), bevel=0.022)
    box('rf-belly', (FRAME_W - 0.30, yl * 0.94, 0.09), MAT_DARK, g,
        loc=(0, ym, FRAME_BOT + 0.045), bevel=0.015)
    box('rf-deck', (FRAME_W, yl, 0.06), MAT_PAINT, g,
        loc=(0, ym, DECK - 0.03), bevel=0.02)

    # hood, front section
    box('rf-hood', (FRAME_W - 0.04, 1.95, HOOD_TOP - DECK), MAT_PAINT, g,
        loc=(0, -1.30, (HOOD_TOP + DECK) / 2), bevel=0.035)
    # louvred cooler face: [S/B] water-actuated oil cooler OW30 + radiator
    grid('rf-louvre', (FRAME_W - 0.30, 0.03, 0.055), MAT_DARK, g,
         (0, -0.34, (HOOD_TOP + DECK) / 2 + 0.02), 7, 0.05, axis='x')
    # the tail: sheared box, falls from the hood line to the tail lamp panel
    tail = box('rf-tail', (FRAME_W - 0.04, 1.10, HOOD_TOP - DECK), MAT_PAINT, g,
               loc=(0, -2.82, (HOOD_TOP + DECK) / 2), bevel=0.03)
    for v in tail.data.vertices:
        if v.co.y < 0:
            v.co.z -= (HOOD_TOP - DECK) * 0.62
    box('rf-tailplate', (WIDTH - 0.44, 0.09, 0.30), MAT_WORN, g,
        loc=(0, REAR_END + 0.05, FRAME_BOT + 0.22), bevel=0.02)
    box('rf-tailstripe', (WIDTH - 0.50, 0.03, 0.16), MAT_HAZARD, g,
        loc=(0, REAR_END + 0.005, FRAME_BOT + 0.22))

    # exhaust: silencer lying along the hood shoulder with a short stack
    tube('rf-silencer', 0.10, 0.66, MAT_WORN, g,
         loc=(-0.56, -0.55, HOOD_TOP - 0.02), rot=(math.pi / 2, 0, 0), sides=10)
    tube('rf-stack', 0.055, 0.22, MAT_WORN, g, loc=(-0.56, -1.10, HOOD_TOP - 0.02), sides=8)
    # air receivers, 2 x 60 l [S/B]
    for s in (-1, 1):
        tube('rf-receiver', 0.115, 0.60, MAT_PAINT, g,
             loc=(s * 0.52, -2.05, DECK + 0.14), rot=(math.pi / 2, 0, 0), sides=10)
    # stainless electrical cabinet [A 4.5] - bare steel, not painted
    box('rf-cabinet', (0.62, 0.44, 0.46), MAT_STEEL, g,
        loc=(0.44, -3.02, DECK + 0.23), bevel=0.015)
    grid('rf-cab-vent', (0.44, 0.02, 0.03), MAT_DARK, g,
         (0.44, -2.80, DECK + 0.30), 5, 0.03, axis='x')
    # fire suppression: 6 kg bottle and its distribution tubing [S/B]
    tube('rf-firebottle', 0.075, 0.42, MAT_HAZARD, g,
         loc=(-0.60, -2.95, DECK), sides=10)
    hose('rf-firetube', [(-0.60, -2.95, DECK + 0.42), (-0.40, -2.30, HOOD_TOP + 0.02),
                         (0.0, -1.40, HOOD_TOP + 0.04), (0.42, -0.60, HOOD_TOP - 0.10)],
         radius=0.010, mat=MAT_STEEL, parent=g)
    # accessory hose reel: 80 m of 32 mm hose [S/B]
    tube('rf-hosereel-h', 0.26, 0.05, MAT_PAINT, g,
         loc=(-0.30, -3.16, DECK + 0.30), rot=(0, math.pi / 2, 0), sides=16)
    tube('rf-hosereel-h2', 0.26, 0.05, MAT_PAINT, g,
         loc=(-0.62, -3.16, DECK + 0.30), rot=(0, math.pi / 2, 0), sides=16)
    tube('rf-hosereel-core', 0.19, 0.28, MAT_RUBBER, g,
         loc=(-0.60, -3.16, DECK + 0.30), rot=(0, math.pi / 2, 0), sides=14)
    # two wheel chocks in a holder [S/B] - the smallest true thing on the deck
    for i in (0, 1):
        box('rf-chock', (0.13, 0.24, 0.16), MAT_WORN, g,
            loc=(-0.70, -1.55 - i * 0.28, DECK + 0.08), rot=(0.30, 0, 0), bevel=0.012)
    # A3 document box [S/B]
    box('rf-docbox', (0.06, 0.34, 0.26), MAT_PAINT, g,
        loc=(0.78, -1.20, DECK + 0.26), bevel=0.012)
    build_axle(g, 'axle-r', AXLE_R)
    return g


def build_articulation(root, art):
    """+/-43 deg [S/B]. The elevation draws this as a dense vertical stack of
    pinned lugs with the whole hydraulic and electric harness crossing it -
    the busiest single area on the machine [A 4.6]."""
    for z in (FRAME_BOT + 0.10, FRAME_TOP - 0.28):
        tube('art-pin', 0.070, 0.26, MAT_CHROME, root, loc=(0, 0, z), sides=12)
    for s in (-1, 1):
        box('art-lug', (0.09, 0.42, 0.58), MAT_DARK, root,
            loc=(s * 0.20, -0.06, (FRAME_TOP + FRAME_BOT) / 2), bevel=0.02)
    box('art-yoke', (0.46, 0.16, 0.66), MAT_DARK, root,
        loc=(0, 0.16, (FRAME_TOP + FRAME_BOT) / 2), bevel=0.025)
    # the two steering cylinders that swing the frames
    for s in (-1, 1):
        cylinder('art-ram-%d' % s, root,
                 (s * 0.30, -0.62, FRAME_TOP - 0.16),
                 (s * 0.62, 0.52, FRAME_TOP - 0.16), 0.052, 0.032)
    # the harness crossing the joint: this is the detail that says "articulated"
    for i, dx in enumerate((-0.22, -0.10, 0.10, 0.22)):
        hose('art-hose-%d' % i,
             [(dx, -0.80, FRAME_TOP - 0.06), (dx * 1.5, -0.20, FRAME_TOP + 0.16),
              (dx * 1.5, 0.24, FRAME_TOP + 0.14), (dx, 0.86, FRAME_TOP - 0.04)],
             radius=0.022 if i % 2 else 0.017, parent=root)
    hose('art-cable', [(0.34, -0.86, FRAME_TOP - 0.02), (0.46, -0.10, FRAME_TOP + 0.22),
                       (0.46, 0.30, FRAME_TOP + 0.20), (0.34, 0.90, FRAME_TOP - 0.02)],
         radius=0.026, mat=MAT_RUBBER, parent=root)


def build_station(art):
    """The operator station. A CANOPY, not a cab: FOPS/ROPS to ISO 3449 with a
    mechanical stopper [S/B], seated operation, T-back seat, roof at 1 775 mm
    down / 1 950 mm up on cylinders [D-source]. Offset to the right of the
    front frame, behind the booms, looking straight down the feeds.

    NO GLASS ANYWHERE. That is not a shortcut: this build state has none (the
    glazed cabin is the other option), and rig.py is explicit that glass with
    transmission > 0 costs +65..81 draw calls. A jumbo canopy is an open steel
    frame with a mesh spatter screen, and that is what this is."""
    x0 = 0.50
    g = empty('', 'station', art, (x0, 1.02, 0))
    # dropped floor between the frame rails
    box('st-floor', (0.94, 1.18, 0.05), MAT_HAZARD, g, loc=(0, 0, STATION_FLOOR), bevel=0.01)
    box('st-toe', (0.94, 0.05, 0.16), MAT_HAZARD, g, loc=(0, -0.59, STATION_FLOOR + 0.10))
    # seat: T-back, on a pedestal, swung to face the face
    box('st-seat-pan', (0.44, 0.44, 0.10), MAT_DARK, g,
        loc=(0, -0.14, STATION_FLOOR + 0.44), bevel=0.03)
    box('st-seat-back', (0.42, 0.11, 0.52), MAT_DARK, g,
        loc=(0, -0.36, STATION_FLOOR + 0.72), rot=(-0.16, 0, 0), bevel=0.035)
    tube('st-seat-post', 0.06, 0.40, MAT_DARK, g, loc=(0, -0.14, STATION_FLOOR), sides=8)
    # two control panels, one each side, the joysticks between them
    for s in (-1, 1):
        box('st-panel', (0.34, 0.30, 0.10), MAT_DARK, g,
            loc=(s * 0.32, 0.22, STATION_FLOOR + 0.66), rot=(-0.35, 0, 0), bevel=0.02)
        for j in (-1, 1):
            tube('st-stick', 0.016, 0.16, MAT_DARK, g,
                 loc=(s * 0.32 + j * 0.07, 0.20, STATION_FLOOR + 0.70), rot=(-0.35, 0, 0), sides=6)
    # four posts and the roof it lifts on
    for sx in (-1, 1):
        for sy in (-1, 1):
            box('st-post', (0.075, 0.075, TRAM_LOW - STATION_FLOOR - 0.10), MAT_PAINT, g,
                loc=(sx * 0.44, sy * 0.55, (TRAM_LOW + STATION_FLOOR) / 2), bevel=0.012)
    # the spatter screen ahead of the operator - mesh, not glass
    grid('st-screen', (0.86, 0.02, 0.03), MAT_STEEL, g,
         (0, 0.58, STATION_FLOOR + 0.86), 11, 0.016, axis='x')
    grid('st-screen-h', (0.86, 0.02, 0.03), MAT_STEEL, g,
         (0, 0.58, STATION_FLOOR + 0.86), 5, 0.016, axis='x')
    # roof on a slide node: 1 775 down, 1 950 up [S/B], raised on cylinders
    roof = empty(NODE_SLIDE, 'canopy-roof', g, (0, 0, 0))
    roof['travel_m'] = TRAM_HIGH - TRAM_LOW
    box('cr-plate', (1.04, 1.26, 0.05), MAT_PAINT, roof,
        loc=(0, 0, TRAM_LOW - 0.025), bevel=0.02)
    grid('cr-fops', (0.94, 1.16, 0.04), MAT_PAINT, roof,
         (0, 0, TRAM_LOW - 0.07), 7, 0.035, axis='x')
    grid('cr-fops-y', (0.94, 1.16, 0.04), MAT_PAINT, roof,
         (0, 0, TRAM_LOW - 0.07), 8, 0.035, axis='y')
    box('cr-visor', (1.04, 0.22, 0.04), MAT_PAINT, roof,
        loc=(0, 0.70, TRAM_LOW - 0.06), rot=(0.22, 0, 0), bevel=0.015)
    # station light [S/B "Operator station light, standard"]
    worklight('station', roof, (0, 0.44, TRAM_LOW - 0.10), (0, 0.4, -1.0), 70, 12)

    # side platforms BOTH sides of the operator station, with the handrail and
    # the illuminated stair. [A 4.8]: they exist so the operator can swing a
    # feed back and load a bolt without walking in front of the machine under
    # unsupported roof. That safety story is why they are wide.
    # The handrail is 800 mm, not the 1 100 mm a surface machine gets: a rail
    # standing proud of a 1 775 mm roofline is the first thing the back of a 2 m
    # heading tears off. Real low-profile rigs fold theirs; this one is short.
    for s in (-1, 1):
        px = s * 0.92 - x0
        box('st-platform', (0.40, 1.30, 0.05), MAT_HAZARD, art,
            loc=(x0 + px, 1.02, DECK), bevel=0.008)
        for py in (-0.58, 0.0, 0.58):
            tube('st-rail-post', 0.018, 0.80, MAT_STEEL, art,
                 loc=(x0 + px + s * 0.15, 1.02 + py, DECK), sides=6)
        for rz in (0.78, 0.42):
            box('st-rail', (0.05, 1.28, 0.04), MAT_STEEL, art,
                loc=(x0 + px + s * 0.15, 1.02, DECK + rz), bevel=0.01)
        # illuminated stair, three treads
        for i in range(3):
            box('st-tread', (0.34, 0.16, 0.03), MAT_HAZARD, art,
                loc=(x0 + px, 1.02 - 0.70 - i * 0.06, DECK - 0.20 - i * 0.20), bevel=0.006)
    return g


def build_cable_reel(rear):
    """Automatic cable reel with a spooling system [S/B]. Diesel to tram, mains
    to drill: the trailing cable is not an accessory, it is the machine's power
    supply, and the reel is the object that says so at thumbnail size. Axis
    transverse, sitting on the rear deck with its top on the 1 360 mm line."""
    piv = empty(NODE_PIVOT, 'cable-reel', rear, (0, -2.20, REEL_TOP - REEL_R))
    for s in (-1, 1):
        tube('cr-flange', REEL_R, 0.035, MAT_PAINT, piv,
             loc=(s * (REEL_W / 2), 0, 0), rot=(0, s * math.pi / 2, 0), sides=22)
    tube('cr-core', REEL_R * 0.44, REEL_W - 0.08, MAT_PAINT, piv,
         loc=(-(REEL_W - 0.08) / 2, 0, 0), rot=(0, math.pi / 2, 0), sides=14)
    # the wound cable: three turns of a torus-ish coil, same rubber as the run
    for i in range(3):
        tube('cr-wrap', REEL_R * 0.44 + 0.024 * (i + 1), REEL_W - 0.12, MAT_RUBBER, piv,
             loc=(-(REEL_W - 0.12) / 2, 0, 0), rot=(0, math.pi / 2, 0), sides=16)
    # spooling arm - what makes it an AUTOMATIC reel and not a drum
    box('cr-spool-arm', (REEL_W + 0.10, 0.07, 0.07), MAT_STEEL, rear,
        loc=(0, -2.20 - REEL_R - 0.10, REEL_TOP - REEL_R + 0.02), bevel=0.012)
    return piv


def build_trailing_cable(root):
    """The cable paying off the reel and trailing on the floor behind the
    machine, back down the drive to the substation. [A 6] says it reads matte
    black and muddy underground; the brief asks for the orange cable that a
    player can actually see in a dark drive. Both are true of real machines -
    trailing cables are supplied in black AND in high-visibility orange - so it
    is drawn in the game's hazard/high-visibility material, which is the one
    that survives being seen by lamp light."""
    hose('trail-cable',
         [(0.10, -2.20 - REEL_R + 0.06, REEL_TOP - REEL_R - 0.30),
          (0.22, REEL_R - 3.10, 0.60), (0.16, -3.90, 0.16), (-0.30, -5.20, 0.07),
          (0.24, -6.80, 0.06), (-0.10, -8.60, 0.06)],
         radius=0.026, mat=MAT_HAZARD, parent=root)


def build_jacks(parent, name, spots):
    """Carrier stabilization, vertical, front and rear [S/B]. Four rams on two
    nodes - one per frame, because the front pair has to swing with the
    articulation. The rams share one node each so four jacks cost four draw
    calls, not sixteen."""
    nd = empty(NODE_SLIDE, name, parent, (0, 0, 0))
    nd['travel_m'] = 0.30
    for (x, y) in spots:
        box('jk-bracket', (0.16, 0.22, 0.30), MAT_DARK, parent,
            loc=(x, y, FRAME_BOT + 0.20), bevel=0.02)
        tube('jk-rod', 0.045, 0.30, MAT_CHROME, nd, loc=(x, y, CLEAR - 0.12), sides=10)
        # the foot shares the rod's material so the four jacks are two draw
        # calls and not four; a jack pad that grinds on rock every round is
        # scrubbed to bright steel anyway, which is what this material is
        tube('jk-foot', 0.115, 0.045, MAT_CHROME, nd, loc=(x, y, CLEAR - 0.15), sides=12)
    return nd


# ===========================================================================
# boom, feed, drill string
# ===========================================================================
def build_boom(art, side, sgn):
    """One drilling boom.

    Architecture from [A 4.1] and confirmed by [B]'s boom data (800 mm boom
    extension, 500 mm feed extension, 360 deg roll-over, automatic hydraulic
    parallelism, 1 800 kg):

        slew -> lift -> telescope -> roll-over head -> swing -> cradle ->
        feed (itself telescopic) -> carriage -> drifter -> rod -> bit

    Two things make this read as a JUMBO boom and not an excavator stick:
    a straight tapering WELDED BOX arm with no lattice anywhere, and the
    parallel-holding link running below it from the base bracket to the head
    bracket, which is what keeps the feed's attitude as the boom lifts.
    [A 9.7] flags that the game's procedural boom has no such link. This one
    does, and it is one capsule."""
    nm = 'boom-' + side
    slew = empty(NODE_PIVOT, nm + '-slew', art, (sgn * BOOM_X, FRONT_END - 0.32, BOOM_Z),
                 rot=(0, 0, -sgn * D(3)))     # the V-splay [S/B "V shape layout"]
    box(nm + '-slewbody', (0.34, 0.40, 0.42), MAT_PAINT, slew, loc=(0, 0.16, 0), bevel=0.03)
    tube(nm + '-slewpin', 0.075, 0.52, MAT_PAINT, slew, loc=(0, 0, -0.26), sides=12)

    lift = empty(NODE_PIVOT, nm + '-lift', slew, (0, 0.20, 0))
    arm = box(nm + '-arm', (0.30, BOOM_LEN, 0.34), MAT_PAINT, lift,
              loc=(0, BOOM_LEN / 2, 0), bevel=0.022)
    taper(arm, BOOM_LEN * 0.15, 0.74)
    # weld flanges along the box - the tell that it is fabricated plate
    for s in (-1, 1):
        box(nm + '-flange', (0.035, BOOM_LEN * 0.92, 0.05), MAT_PAINT, lift,
            loc=(s * 0.14, BOOM_LEN / 2, 0.14), bevel=0.006)
    # the parallel-holding link, below the arm, base bracket to head bracket
    tube(nm + '-parallink', 0.038, BOOM_LEN + BOOM_TELE * 0.5, MAT_PAINT, lift,
         loc=(0, 0, -0.24), rot=(-math.pi / 2, 0, 0), sides=8)
    box(nm + '-linklug', (0.10, 0.13, 0.22), MAT_PAINT, lift, loc=(0, 0.02, -0.20), bevel=0.015)
    # hoses clipped along the underside of the box [A 4.10 item 2]
    for i, dx in enumerate((-0.075, 0.0, 0.075)):
        hose(nm + '-boomhose-%d' % i,
             [(dx, -0.10, -0.19), (dx * 1.2, BOOM_LEN * 0.4, -0.215),
              (dx, BOOM_LEN * 0.9, -0.20), (dx, BOOM_LEN + 0.25, -0.14)],
             radius=0.017, parent=lift)

    # lift cylinder slung underneath: base lug to a lug about half way along
    lc = empty(NODE_PIVOT, nm + '-liftcyl', slew, (0, 0.06, -0.20))
    cylinder(nm + '-liftcyl', lc, (0, 0, 0), (0, BOOM_LEN * 0.52, 0.10), 0.062, 0.038)

    # telescope: a smaller box sliding out of the main arm, 800 mm [S/B]
    tele = empty(NODE_SLIDE, nm + '-tele', lift, (0, BOOM_LEN, 0))
    tele['travel_m'] = BOOM_TELE
    tb = box(nm + '-telebox', (0.21, 0.46, 0.24), MAT_PAINT, tele,
             loc=(0, 0.05, 0), bevel=0.018)
    taper(tb, 0.1, 0.88)

    # roll-over head: 360 deg [S/B]. Two short cylinders and a forked yoke.
    roll = empty(NODE_PIVOT, nm + '-roll', tele, (0, 0.10, 0))
    # the roll bearing housing belongs to the TELESCOPE, not to the part that
    # turns inside it, and hanging it there merges it with the telescope box
    tube(nm + '-rollhousing', 0.13, 0.26, MAT_PAINT, tele, loc=(0, 0.02, 0),
         rot=(-math.pi / 2, 0, 0), sides=14)
    swing = empty(NODE_PIVOT, nm + '-swing', roll, (0, 0.26, 0))
    box(nm + '-yoke', (0.34, 0.22, 0.28), MAT_PAINT, swing, loc=(0, 0.06, 0), bevel=0.025)
    for s in (-1, 1):
        box(nm + '-fork', (0.06, 0.30, 0.24), MAT_PAINT, swing,
            loc=(s * 0.15, 0.26, 0.02), bevel=0.015)
    cylinder(nm + '-swingcyl', swing, (-0.16, 0.10, -0.14), (0.16, 0.36, -0.10), 0.035, 0.022)

    # cradle: a broad flat plate saddle under the feed, about a third of the
    # feed's length, with the feed-extension cylinder under it [A 4.2, S/B
    # "feed extension 500 mm"]. This is [A 9.6]: the feed SLIDES here, it is not
    # bolted to the boom head.
    box(nm + '-cradle', (FEED_W + 0.10, FEED_LEN * 0.34, 0.07), MAT_PAINT, swing,
        loc=(0, 0.28, -0.12), bevel=0.012)
    cylinder(nm + '-feedext', swing, (0, -0.55, -0.19), (0, -0.55 + FEED_EXT + 0.28, -0.19),
             0.036, 0.022)

    feed = empty(NODE_SLIDE, nm + '-feed', swing, (0, -0.70, -0.02))
    feed['travel_m'] = FEED_EXT
    build_feed(feed, nm)
    return slew


def build_feed(feed, nm):
    """The feed beam: a long, constant-section, ribbed EXTRUSION [A 4.2], here
    telescopic because a machine 1 775 mm tall drills a 2 132 mm hole with a
    2 435 mm rod off a 1 965 mm feed [S/B] and the only way that works is if the
    beam extends. Four longitudinal ribs, the two polished stripes where the
    carriage rides, a black centraliser at the nose that is the part which
    actually touches rock, and the drifter parked at the rear stop with a fan of
    hoses off its back."""
    # outer beam
    box(nm + '-beam', (FEED_W, FEED_LEN, FEED_H), MAT_STEEL, feed,
        loc=(0, FEED_LEN / 2, 0), bevel=0.012)
    for s in (-1, 1):
        for dz in (-0.045, 0.045):
            box(nm + '-rib', (0.022, FEED_LEN * 0.98, 0.022), MAT_STEEL, feed,
                loc=(s * (FEED_W / 2 - 0.012), FEED_LEN / 2, dz), bevel=0.004)
    # inner telescopic beam, drawn part-out so the joint is visible
    box(nm + '-beam2', (FEED_W * 0.74, FEED_LEN * 0.62, FEED_H * 0.74), MAT_STEEL, feed,
        loc=(0, FEED_LEN * 0.80, 0), bevel=0.010)
    # carriage rails, polished bright by the carriage [A 6]
    for s in (-1, 1):
        box(nm + '-rail', (0.028, FEED_LEN * 1.06, 0.020), MAT_CHROME, feed,
            loc=(s * (FEED_W / 2 - 0.03), FEED_LEN * 0.53, FEED_H / 2), bevel=0.004)
    # front centraliser: the black block at the very nose, no paint left on it
    nose_y = FEED_LEN + 0.13
    box(nm + '-centraliser', (0.20, 0.16, 0.20), MAT_DARK, feed,
        loc=(0, nose_y, 0.01), bevel=0.02)
    # same material as the centraliser it sits in: two singleton meshes on a
    # moving node are two draw calls, and this block is one object in the metal
    tube(nm + '-bushing', 0.036, 0.17, MAT_DARK, feed,
         loc=(0, nose_y - 0.085, 0.01), rot=(-math.pi / 2, 0, 0), sides=10)
    # rear stop and hose gallery
    box(nm + '-rearstop', (FEED_W + 0.04, 0.09, FEED_H + 0.06), MAT_DARK, feed,
        loc=(0, 0.02, 0), bevel=0.012)
    # water/air lines running the length of the beam, clipped to the side
    for i, dx in enumerate((-1, 1)):
        hose(nm + '-feedline-%d' % i,
             [(dx * (FEED_W / 2 + 0.02), 0.05, -0.04),
              (dx * (FEED_W / 2 + 0.03), FEED_LEN * 0.5, -0.05),
              (dx * (FEED_W / 2 + 0.02), FEED_LEN * 0.95, -0.03)],
             radius=0.012, mat=MAT_STEEL, parent=feed)

    build_carriage(feed, nm)

    # boom lamp: on the FEED, looking down it at the collar. On a jumbo this is
    # not a lamp on a machine, it is THE light in the heading. [S/B] "Working
    # lights 2 x 43 W LED (24 V)" for a one-boom rig, so two booms carry four.
    for i, s in enumerate((-1, 1)):
        lx = s * (FEED_W / 2 + 0.06)
        tube(nm + '-lamp-%d' % i, 0.055, 0.09, MAT_DARK, feed,
             loc=(lx, FEED_LEN * 0.22, 0.10), rot=(-math.pi / 2 + 0.10, 0, 0), sides=10)
        tube(nm + '-lampglass-%d' % i, 0.048, 0.012, MAT_CHROME, feed,
             loc=(lx, FEED_LEN * 0.22 + 0.088, 0.10 + 0.009), rot=(-math.pi / 2 + 0.10, 0, 0),
             sides=10)
        box(nm + '-lampguard-%d' % i, (0.11, 0.02, 0.11), MAT_STEEL, feed,
            loc=(lx, FEED_LEN * 0.22 + 0.10, 0.10), bevel=0.004)
        worklight(nm + '-lamp-%d' % i, feed, (lx, FEED_LEN * 0.22 + 0.10, 0.10),
                  (0, 1.0, -0.10), 54, 26)


def build_carriage(feed, nm):
    """The rock drill and everything that turns with it.

    [S/B] the drill is 571 mm long, 192 mm across and weighs 115 kg: 14 kW at
    140 bar, 110 Hz, 530 rpm, 340 Nm. It sits at the REAR of the feed and is
    pulled forward along it, with a fan of five or six hoses curving off its
    back that must stretch and slacken as it travels [A 4.10 item 1] - a static
    hose there is an immediate tell.

    The string is drawn from the tooling catalogue [A 4.11] and from [B]'s
    "Recommended rod R32 - H25 - R32": shank adapter, then a HEXAGONAL rod
    25 mm across flats, then a button bit. [A 9.5] flags that the game draws the
    rod round. It is not round. Six flats catch a boom light completely
    differently from a cylinder, and that is most of why this reads as tooling."""
    # THE RUNTIME CONTRACT IS SINGLE-CARRIAGE, AND THIS MACHINE HAS TWO BOOMS.
    # src/core/gltfRig.js makeDyn() looks up the exact strings `slide:carriage`
    # and `mount:tool`.  Both booms carried the right number under the wrong
    # names (`slide:boom-l-carriage`, `slide:boom-r-carriage`, travel_m 2.132),
    # so `dyn.carriage` and `dyn.toolAnchor` were BOTH null: no tool could be
    # attached to this machine and no feed could be driven.
    # Until the contract grows a `carriage[]` / `tool[]` form, the LEFT boom is
    # the canonical one and carries the names the runtime knows; the right boom
    # keeps its descriptive name and its own travel_m, so nothing is lost and
    # a later multi-boom runtime can pick both up.
    CANON = nm.endswith('-l')
    car = empty(NODE_SLIDE, 'carriage' if CANON else nm + '-carriage',
                feed, (0, 0.07, 0))
    car['travel_m'] = HOLE_LEN
    car['axis'] = 'y'
    car['boom'] = nm[-1]
    # drifter body: a dark oily casting with its side bolts and accumulator
    box(nm + '-drifter', (DRIFTER_W, DRIFTER_LEN, 0.205), MAT_DARK, car,
        loc=(0, DRIFTER_LEN / 2, 0.085), bevel=0.018)
    box(nm + '-drifter-top', (DRIFTER_W * 0.72, DRIFTER_LEN * 0.62, 0.07), MAT_DARK, car,
        loc=(0, DRIFTER_LEN * 0.42, 0.205), bevel=0.014)
    tube(nm + '-accum', 0.052, 0.13, MAT_DARK, car,
         loc=(-DRIFTER_W / 2 - 0.03, DRIFTER_LEN * 0.30, 0.16), rot=(0, -math.pi / 2, 0),
         sides=10)
    tube(nm + '-rotmotor', 0.062, 0.15, MAT_DARK, car,
         loc=(DRIFTER_W / 2, DRIFTER_LEN * 0.34, 0.10), rot=(0, math.pi / 2, 0), sides=12)
    # cradle shoes that grip the feed rails
    for s in (-1, 1):
        box(nm + '-shoe', (0.045, DRIFTER_LEN * 0.8, 0.05), MAT_CHROME, car,
            loc=(s * (FEED_W / 2 - 0.03), DRIFTER_LEN / 2, FEED_H / 2), bevel=0.006)
    # the hose fan off the back of the drifter: percussion, return, rotation,
    # water, air, shank lubrication - five lines, drooping and doubling back
    for i in range(5):
        dx = (i - 2) * 0.035
        hose(nm + '-drifterhose-%d' % i,
             [(dx, 0.02, 0.10 + abs(dx)), (dx * 1.6, -0.24, -0.02 - 0.03 * i),
              (dx * 1.9, -0.46, -0.16 - 0.02 * i), (dx * 1.2, -0.30, -0.26)],
             radius=0.014 + 0.002 * (i % 2), parent=car)
    # shank adapter: the cleanest steel on the machine, it lives inside the drill
    tube(nm + '-shank', 0.028, 0.16, MAT_CHROME, car,
         loc=(0, DRIFTER_LEN - 0.02, 0.085), rot=(-math.pi / 2, 0, 0), sides=10)
    # the rod: HEX, 25 mm across flats -> 14.4 mm corner radius
    r_corner = (ROD_AF / 2) / math.cos(D(30))
    tube(nm + '-rod', r_corner, ROD_LEN, MAT_WORN, car,
         loc=(0, DRIFTER_LEN + 0.10, 0.085), rot=(-math.pi / 2, 0, 0), sides=6)
    # button bit: 45 mm, 6 gauge + 3 face buttons, 30 deg gauge angle [A 4.11]
    bit_y = DRIFTER_LEN + 0.10 + ROD_LEN
    # `mount:tool` — where the game hangs the live bit and the rest of the
    # string.  On the canonical (left) boom only, for the reason given at the
    # carriage above.  Placed at the shank end of the rod rather than at the
    # bit, because the runtime grows its own string DOWN from this node.
    if CANON:
        empty(NODE_MOUNT, 'tool', car, (0, DRIFTER_LEN + 0.10, 0.085))
    tube(nm + '-bit', BIT_D / 2, 0.062, MAT_WORN, car,
         loc=(0, bit_y, 0.085), rot=(-math.pi / 2, 0, 0), sides=12)
    for i in range(6):
        a = i * TAU / 6
        tube(nm + '-gaugebutton-%d' % i, 0.0045, 0.012, MAT_WORN, car,
             loc=(math.cos(a) * 0.018, bit_y + 0.056, 0.085 + math.sin(a) * 0.018),
             rot=(-math.pi / 2 + math.sin(a) * D(30), 0, math.cos(a) * D(30)), sides=6)
    for i in range(3):
        a = i * TAU / 3 + 0.5
        tube(nm + '-facebutton-%d' % i, 0.004, 0.010, MAT_WORN, car,
             loc=(math.cos(a) * 0.008, bit_y + 0.060, 0.085 + math.sin(a) * 0.008),
             rot=(-math.pi / 2, 0, 0), sides=6)
    return car


def build_basket_boom(art):
    """A basket boom for charging and scaling. [A 9.9] is careful about this:
    the OEM spec sheet for the two-boom face rig does NOT list one - it solves
    bolt handling with the swing-back feed and the side platforms instead - so
    this is a game variant, kept because the game's spec block asks for it and
    because a charging jumbo genuinely carries one. Modelled small and folded
    over the deck, which is where it lives while the machine drills."""
    slew = empty(NODE_PIVOT, 'basket-slew', art, (-0.72, 0.30, DECK + 0.10))
    box('bb-turret', (0.28, 0.30, 0.30), MAT_PAINT, slew, loc=(0, 0, 0.06), bevel=0.025)
    lift = empty(NODE_PIVOT, 'basket-lift', slew, (0, 0.10, 0.18), rot=(D(-16), 0, 0))
    a = box('bb-arm', (0.20, 1.60, 0.22), MAT_PAINT, lift, loc=(0, 0.80, 0), bevel=0.018)
    taper(a, 0.2, 0.82)
    cylinder('bb-cyl', lift, (0, 0.10, -0.16), (0, 0.86, 0.02), 0.040, 0.026, MAT_PAINT)
    cage = empty(NODE_PIVOT, 'basket-cage', lift, (0, 1.66, -0.04))
    box('bb-floor', (0.78, 0.62, 0.05), MAT_DARK, cage, loc=(0, 0.30, 0), bevel=0.01)
    for sx in (-1, 1):
        for sy in (0, 1):
            box('bb-cagepost', (0.035, 0.035, 0.62), MAT_DARK, cage,
                loc=(sx * 0.37, 0.02 + sy * 0.57, 0.32), bevel=0.006)
    for rz in (0.32, 0.60):
        box('bb-cagerail-x', (0.78, 0.03, 0.03), MAT_DARK, cage, loc=(0, 0.02, rz))
        box('bb-cagerail-x2', (0.78, 0.03, 0.03), MAT_DARK, cage, loc=(0, 0.59, rz))
        box('bb-cagerail-y', (0.03, 0.60, 0.03), MAT_DARK, cage, loc=(-0.37, 0.30, rz))
        box('bb-cagerail-y2', (0.03, 0.60, 0.03), MAT_DARK, cage, loc=(0.37, 0.30, rz))
    box('bb-kickplate', (0.76, 0.02, 0.16), MAT_HAZARD, cage, loc=(0, 0.60, 0.10))
    return slew


def build_tramming_lights(art, rear):
    """[S/B] "Driving lights 6 x 43 W LED (24 V)". [A 9.8] notes the game has
    none at all, and a machine that reverses a full round out of a heading after
    every blast needs them at BOTH ends. Four forward on the boom bulkhead,
    two astern on the tail panel."""
    for i, s in enumerate((-1, 1)):
        for j, dz in enumerate((0.0, 0.20)):
            x = s * (0.62 + j * 0.14)
            z = FRAME_BOT + 0.60 + dz
            tube('tl-f-%d%d' % (i, j), 0.048, 0.07, MAT_DARK, art,
                 loc=(x, FRONT_END - 0.02, z), rot=(-math.pi / 2, 0, 0), sides=10)
            tube('tl-fg-%d%d' % (i, j), 0.042, 0.010, MAT_CHROME, art,
                 loc=(x, FRONT_END + 0.05, z), rot=(-math.pi / 2, 0, 0), sides=10)
            worklight('tram-f-%d%d' % (i, j), art, (x, FRONT_END + 0.06, z),
                      (0, 1.0, -0.16), 60, 18)
    for i, s in enumerate((-1, 1)):
        x = s * 0.66
        z = FRAME_BOT + 0.34
        tube('tl-r-%d' % i, 0.045, 0.07, MAT_DARK, rear,
             loc=(x, REAR_END + 0.10, z), rot=(math.pi / 2, 0, 0), sides=10)
        tube('tl-rg-%d' % i, 0.040, 0.010, MAT_CHROME, rear,
             loc=(x, REAR_END + 0.03, z), rot=(math.pi / 2, 0, 0), sides=10)
        worklight('tram-r-%d' % i, rear, (x, REAR_END + 0.02, z), (0, -1.0, -0.20), 60, 16)


# ===========================================================================
# export plumbing
# ===========================================================================
def bake_all():
    """Apply every modifier and convert every curve to a mesh BEFORE joining.

    Two reasons, both load-bearing:
      1. join() keeps only the ACTIVE object's modifier stack, so an unapplied
         bevel would silently be applied to everything joined into it.
      2. hose() returns a CURVE, and finish() skips non-mesh objects - so every
         hose left as a curve is its own draw call. Converted, the hoses join
         with the other rubber and cost nothing. This machine has 20 of them."""
    bpy.ops.object.select_all(action='DESELECT')
    targets = [o for o in bpy.context.scene.objects if o.type in ('MESH', 'CURVE')]
    for o in targets:
        o.select_set(True)
    if targets:
        bpy.context.view_layer.objects.active = targets[0]
        bpy.ops.object.convert(target='MESH')
    bpy.ops.object.select_all(action='DESELECT')


def collapse_nodes():
    """Join meshes that share a parent AND a material.

    rig.py's finish() only joins STATIC meshes; anything under a pivot:/slide:
    node it leaves alone, because it has to move independently. Correct - but it
    means a boom built from twenty plates would be twenty draw calls. Joining
    per (parent, material) keeps every moving node independent while collapsing
    the detail inside it, so detail on a MOVING part costs triangles too. That
    is the whole reason this machine can carry two full booms, four lamps,
    twenty hoses and a nine-button bit inside 70 draw calls.

    Grouping is by NEAREST MOVING ANCESTOR, not by immediate parent: a mesh
    hung off a plain organising empty (the operator station, the rear frame)
    does not move relative to the node above it, so it can be joined with
    everything else under that node. Static meshes are left alone here and
    handed to finish(), which owns them. Getting this wrong the naive way -
    grouping by immediate parent - cost 16 draw calls on this machine."""
    def moving_ancestor(o):
        p = o.parent
        while p is not None:
            if p.name.startswith(NODE_PIVOT) or p.name.startswith(NODE_SLIDE):
                return p
            p = p.parent
        return None

    groups = {}
    for o in list(bpy.context.scene.objects):
        if o.type != 'MESH':
            continue
        anc = moving_ancestor(o)
        if anc is None:
            continue
        key = (anc.name, o.data.materials[0].name if o.data.materials else '-')
        groups.setdefault(key, []).append(o)
    for (pname, mat), objs in sorted(groups.items()):
        if len(objs) < 2:
            continue
        # join() adopts the ACTIVE object's parent, so make the active one a
        # direct child of the node itself where possible - otherwise the joined
        # mesh ends up hanging off a nested empty for no reason.
        objs.sort(key=lambda o: 0 if (o.parent and o.parent.name == pname) else 1)
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        # NAME THE JOINED MESH OUT OF THE RESERVED NAMESPACE.
        # This used to be '%s|%s' % (pname, mat) with pname the FULL node name,
        # so it produced meshes called `pivot:boom-l-swing|chrome` and
        # `slide:boom-l-feed|rawSteel`.  src/core/gltfRig.js index() keys its
        # maps on the PREFIX — `n.startsWith('pivot:')` — so 38 static meshes
        # on this machine were published as movable parts, got
        # `userData.dynamic = true`, were exempted from mergeStatic(), and
        # polluted the pivots/slides maps with keys like 'boom-l-swing|chrome'.
        # Only this machine did it; the other eight suffix the material onto a
        # name that does not start with a reserved prefix.  Match them.
        short = pname.split(':', 1)[-1] if ':' in pname else pname
        bpy.context.active_object.name = '%s:%s' % (short, mat)


def report_extent():
    """Measure the built machine and print it against the sourced figures. The
    brief says do not trust intent, read the file - this is the same rule
    applied one step earlier: do not trust the constants, measure the geometry."""
    xs, ys, zs = [], [], []
    for o in bpy.context.scene.objects:
        if o.type != 'MESH' or o.name.startswith('trail'):
            continue   # the trailing cable lies down the drive; it is not the rig
        for c in o.bound_box:
            w = o.matrix_world @ __import__('mathutils').Vector(c)
            xs.append(w.x)
            ys.append(w.y)
            zs.append(w.z)
    print('MEASURED width=%.3f length=%.3f height=%.3f (front tip y=%.3f, tail y=%.3f)'
          % (max(xs) - min(xs), max(ys) - min(ys), max(zs), max(ys), min(ys)))
    print('SOURCED  width=2.260 transport_len=10.375 tramming_height=1.775')


def build(out_path):
    reset()
    root = empty('', 'rig-root', None)
    art = empty(NODE_PIVOT, 'articulation', root, (0, 0, 0))

    build_front_frame(art)
    rear = build_rear_frame(root)
    build_articulation(root, art)
    build_station(art)
    build_cable_reel(rear)
    build_trailing_cable(root)
    build_tramming_lights(art, rear)

    for side, sgn in BOOMS:
        build_boom(art, side, sgn)
    build_basket_boom(art)

    build_wheel(art, 'wheel-fl', -HUB_X, AXLE_F)
    build_wheel(art, 'wheel-fr', +HUB_X, AXLE_F)
    build_wheel(rear, 'wheel-rl', -HUB_X, AXLE_R)
    build_wheel(rear, 'wheel-rr', +HUB_X, AXLE_R)

    build_jacks(art, 'jacks-front', [(-0.70, AXLE_F - 0.62), (0.70, AXLE_F - 0.62)])
    build_jacks(rear, 'jacks-rear', [(-0.70, AXLE_R - 0.70), (0.70, AXLE_R - 0.70)])

    bake_all()
    collapse_nodes()
    report_extent()
    return finish(out_path)


if __name__ == '__main__':
    build(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       '..', 'public', 'models', 'tunnel_jumbo.glb'))
