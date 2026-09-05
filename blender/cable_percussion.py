"""cable_percussion - British shell-and-auger ground-investigation tripod.

In-game marque: the id `cable-percussion`, badged in `src/game/data.js` as
"Kilmar CP-24 Shellhand".  DOMAIN.md section 10 binds: no real manufacturer name
or model designation appears in any object name, material name, decal or any
other string that can reach a player.  Every real name below is cited ONLY as
geometry evidence and lives in these comments, which is where provenance
belongs.

WHAT THIS MACHINE IS, AND WHAT IT IS NOT
----------------------------------------
`src/game/data.js` carries a comment written specifically to stop somebody
drawing this as a small hydraulic crawler:

    "Cable percussion is a folding derrick, a winch, a clutch and a wire rope;
     a hydraulic tracked drill has no rope drum and no walking beam."

So: a folding TRIPOD derrick, raised over the hole, towed to site on its own
wheels.  A free-fall winch drum and a hand clutch, driven by a small diesel,
working a wire rope over a sheave at the apex.  Tools - claycutter, shell,
chisel - are DROPPED and lifted on that rope and cut by repeated free fall.
Nothing rotates.  Nothing circulates.

THE NEGATIVE SPACE IS HALF THE IDENTITY, and it is enforced here by what this
file never builds: no cab, no glazing, no tracks, no boom, no mast-mounted
rotary head, no drill rods, no hydraulic cylinder, no hose to the hole.  There
is deliberately NO `MAT_GLASS` and NO `MAT_CHROME` anywhere in this module -
a chrome cylinder rod is the signature of the machine this one is not.
`research/rigs/cable-percussion.md` section 5.1: the whole read is
"a tripod and a rope".

TWO MACHINES WEAR THIS NAME AND MUST NOT BE CONFLATED (reference section 2):
  (A) the British / Nordic GI tripod - free-fall winch, 1-3 m stroke, ~2 t,
      towed by a 4x4.  THIS FILE BUILDS FAMILY A.
  (B) the American truck spudder - walking beam, crank and pitman, three drums
      on a truck deck, 0.41-0.89 m stroke, 3.4-7.3 t.
`src/rig/rigFactory.js` `buildCablePercussion` builds family B, while the
game's own site research (`research/16-site-archetypes.md` section B.2) puts
this rig on ground-investigation plots, where the correct machine is family A.
The reference records that mismatch as domain-truth warning 9.B; the brief for
this model asks for family A, so family A is what is here.  The divergence from
`data.js`'s family-B description text is REAL and is reported, not papered over.

SOURCES
-------
[ST]   Southern Testing, "Technical Data - Cable Percussive Drilling Rig",
       https://www.southerntesting.co.uk/wp-content/uploads/2019/06/
       Technical_Cable-Percussive-Boreholes.pdf   [HIRE]
       THE ONLY FULL GENERAL ARRANGEMENT FOR FAMILY A anywhere in the reference:
       line pull, derrick loading, weight, working height under sheaves, and the
       travelling and operating envelopes for three machines of one range.
       Every governing dimension in this file is the `rig 2000` column.
       Transcribed in `research/rigs/cable-percussion.md` section 4.2.0.
[CON]  Consallen Group Sales Ltd, "Cable Percussion - How to Drill",
       D. V. Allen C.Eng. MICE,
       https://static.elitesecurity.org/uploads/2/0/2007583/How-to-dril.pdf [MFR]
       The FREE-FALL WINCH (there is no beam and no crank on family A), the
       10 mm wire and its ~6,500 kg breaking load, the apex strong-point for a
       snatch block, leg braces and feet that must be stopped from spreading,
       the apple-corer claycutter, casing in 1.5 m lengths at ~60 kg, and depth
       limited by the LENGTH OF WIRE ON THE DRUM (usually 60 m), not by the mast.
[ARC]  Archway Engineering (UK) Ltd product pages [MFR] - the only dimensioned
       British tool tables found: claycutter/shell body ~6 ft (1.83 m), the
       4"-24" nominal size ladder with tool OD against casing OD/ID, sinker bar
       4.5" x 40 in x ~80 kg with 2.25" x 3.25" API pin and box, coarse-pitch
       screw-on shoes.  https://archway-engineering.com/product/claycutter-shell/
       and .../sinker-bars/ ; size table mirrored at plantautomation-technology.com
[AGS]  AGS, "Manual handling operations - have you assessed your risk?",
       quoting the BDA's assessment,
       https://www.ags.org.uk/2019/09/manual-handling-operations-have-you-assessed-your-risk/
       [STD] - sinker bar 80 kg, 6" casing lead length 77 kg, U100 slide hammer
       93 kg, SPT drop hammer assembly 115 kg, and the British tool string's
       stroke of 1 to 3 m.  Two-person lifts are high-risk over 65 kg, so
       NOTHING on this site is carried; it is dragged, rolled and swung on the
       rope.  That is why the tools live on the ground and on a chassis cradle,
       not on a neat rack.
[R16]  `research/16-site-archetypes.md` section B.2, lines 1870-1885 - tripod
       derrick "approximately 7 m in height", folding for transport, ~6.7 m
       working headroom, 2 tonne winch, diesel driven, towed by a 4x4, casing
       150/200 mm standard, routine depth to 50 m.
[R06]  `research/06-geotech-water-geothermal.md` section E.8 - "a tripod and a
       rope"; the winch is "a winch on a small skid-mounted engine"; casing
       150-300 mm "driven with the same winch and a drive cap"; crew of two;
       "No rotation, no flush, no hydraulics at the hole".
[D]    DERIVED here by arithmetic on published numbers.  Flagged every time.
[NS]   NOT SOURCED.  A figure had to exist for the mesh to be built; no source
       anywhere in the reference publishes it.  Flagged every time, and listed
       in `research/rigs/cable-percussion.md` section 8.1.  These are the
       honest gaps, not inventions dressed up as facts.

THE ONE THING THIS FILE DERIVES, AND WHY IT IS TRUSTWORTHY
----------------------------------------------------------
[ST] publishes three envelope numbers for the erected machine and no leg
geometry at all.  Solve them together, assuming the obvious - three EQUAL legs
meeting at one apex over the hole:

    operating height          H = 6.650 m
    width between legs        W = 2.072 m   (front pair, across the machine)
    operating length          L = 4.090 m   (front feet to back foot)

    front feet at (+-W/2, -a), back foot at (0, +b), a + b = L
    equal legs  =>  (W/2)^2 + a^2 = b^2
        =>  b = 2.1762,  a = 1.9138,  LEG = sqrt(b^2 + H^2) = 6.9970 m

**6.997 m.**  [R16] describes the derrick, from a completely different source,
as "approximately 7 m in height".  The two agree to 3 mm.  And LEG + a ~0.5 m
drawbar is 7.50 m, which is [ST]'s published TRAVELLING LENGTH to the
millimetre - i.e. folded, the machine is its own legs plus its drawbar.  Three
independent published numbers and one outside corroboration all close on one
answer, so the leg length and the foot positions below are treated as sourced
rather than estimated.

**AND IT OVERTURNS THE REFERENCE'S OWN LEG-RAKE FIGURE.**  Section 4.2.0 item 1
of `research/rigs/cable-percussion.md` reads W:H = 2.072 : 6.650 = 0.31 : 1 as
"each leg about 8.5-9 degrees off vertical", and on that basis tells the modeller
to "build the modern GI tripod narrow and steep" and to discard the period
engraving's ~17 degrees.  That is wrong, and it is wrong in a way that is easy
to make: 0.31 : 1 is the LATERAL half-spread of the front pair only, and a
tripod leg rakes in the plane that contains it and the axis, which also has the
fore-aft offset in it.  All three feet in fact sit on ONE CIRCLE of radius
2.176 m about the drilling axis, so the true rake is

    atan(2.176 / 6.650) = 18.12 degrees off vertical, all three legs.

which is within a degree of the engraving's re-measured ~17 degrees.  The
engraving was right and the arithmetic that dismissed it was not.  The
correction is written back into section 4.2.0 of the reference.

UNITS AND AXES
--------------
Metres.  Blender is Z-up; the exporter converts to three.js Y-up.
ORIGIN IS THE DRILLING AXIS AT GROUND LEVEL - the rope hangs down the +Z axis
through (0, 0), so the machine drops onto terrain at y=0 with the hole at the
origin and needs no fudge offset.  +Y is REARWARD, toward the backstay leg, the
winch, the engine and the drawbar; +X is the machine's right.  The driller
stands at +Y beside the winch and looks forward, down the rope, into the hole.
"""
import sys
import os
import math

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
import bpy                                                        # noqa: E402
from mathutils import Matrix                                      # noqa: E402
import rig as R                                                   # noqa: E402


# ═════════════════════════════════════════════════════════════════════════════
# GOVERNING DIMENSIONS - [ST] `rig 2000` column unless marked otherwise
# ═════════════════════════════════════════════════════════════════════════════
OP_HEIGHT   = 6.650   # [ST] operating height, mm 6 650 - apex, top of the legs
UNDER_SHEAVE = 5.200  # [ST] "derrick working height under sheaves", mm 5 200
LEG_SPREAD  = 2.072   # [ST] "operating width between legs", mm 2 072.  Identical
                      # on all three machines of the range while every other
                      # dimension changes - the leg frame is a common weldment.
OP_LENGTH   = 4.090   # [ST] operating length, mm 4 090
TRAVEL_LEN  = 7.500   # [ST] travelling length, mm 7 500
TRAVEL_WID  = 1.810   # [ST] travelling width, mm 1 810 - EXACTLY the wheel base,
                      # so folded, the tripod tucks inside its own trailer track
WHEEL_BASE  = 1.810   # [ST] "operating width, wheel base", mm 1 810
LINE_PULL   = 2000.0  # [ST] single line pull, kgf.  Also [R16] "2 tonne winch".
DERRICK_LOAD = 6000.0 # [ST] maximum derrick loading, kg - THREE TIMES the line
                      # pull.  [CON] say it in words: "The tripod has a capacity
                      # exceeding that of the wire."  The frame is deliberately
                      # far stronger than the winch, which is why the legs are
                      # heavier than they look like they need to be.
MASS_KG     = 1700.0  # [ST] total weight excluding tools or casing.  A GI
                      # tripod is a TWO-TONNE object - a car, not a lorry.

# ── the derived tripod, see the docstring ────────────────────────────────────
FOOT_R      = 2.1762  # [D] radius of all three feet about the drilling axis
FOOT_FWD    = 1.9138  # [D] hole to the front feet, along -Y
FOOT_AFT    = FOOT_R  # [D] hole to the back foot, along +Y
LEG_LEN     = 6.9970  # [D] all three legs, and [R16] "approximately 7 m"
LEG_RAKE    = math.degrees(math.atan2(FOOT_R, OP_HEIGHT))   # [D] 18.12 deg

# Leg section.  [NS] - reference section 8.1: "Tube, square section, channel and
# timber all appear across the family's history ... Do not invent a wall
# thickness."  A mesh needs a number, so: round tube, because the one thing
# certain is that the legs pin and fold and a round leg is what pins cleanly
# into a clevis at both ends.  Sized so 6 000 kg of derrick loading over a 7 m
# raking strut is not absurd, and flagged as unsourced everywhere it is used.
LEG_R       = 0.052   # [NS] 104 mm outside diameter
BRACE_R     = 0.024   # [NS] removable leg braces - [CON] require them in place
                      #      under multi-part tackle, so they exist; size is not
                      #      published

# ── the crown ────────────────────────────────────────────────────────────────
# [ST] says "under sheaveS" - plural - and [CON] add a separate named
# strong-point at the apex for a snatch block.  Reference section 8.1 records
# that whether that is two sheaves in one casting, or one sheave plus a block,
# is NOT SOURCED.  Built here as ONE crown sheave on the drilling axis plus ONE
# snatch block shackled to the strong-point, because that is the arrangement
# both sources can be read to support and it keeps the working line exactly over
# the hole, which the method requires absolutely.
HEAD_Z      = 6.300   # [NS] leg pin / head casting centre; legs project above it
BLOCK_TOP   = 5.980   # [NS] top of the crown block cheek plates
SHEAVE_Z    = 5.600   # [NS] crown sheave centre
SHEAVE_R    = 0.200   # [NS] 400 mm sheave.  Reference section 8.1: "Sheave count
                      #      and diameter ... neither the count nor any diameter
                      #      is published."
SHEAVE_W    = 0.075   # [NS] sheave thickness across the groove cheeks

# ── the rope ─────────────────────────────────────────────────────────────────
ROPE_D      = 0.010   # [CON] "10 mm diameter as standard", breaking load
                      # ~6 500 kg.  THE ONLY PUBLISHED BRITISH GI ROPE DIAMETER
                      # anywhere in the reference, and it is about HALF the
                      # American drill line (19.1 mm).  On family A the rope is a
                      # thin, whippy line, not a thick sagging cable - that
                      # difference is visible at a glance and it is the point.
ROPE_R      = 0.0060  # modelled at 12 mm, +20 % over scale, for the same reason
                      # core_rig.py over-scales its 4.76 mm wireline: a 10 mm
                      # rope 6 m up is sub-pixel and vanishes.  The rope is the
                      # single most important line in this silhouette; losing it
                      # to rasterisation loses the machine.
DRUM_CAP_M  = 60.0    # [CON] "about the same as the length of wire supplied with
                      # the winch", usually 60 m max.  THE DRUM, NOT THE MAST,
                      # IS THE DEPTH LIMIT - worth knowing when sizing it.

# ── the tool string on the rope ──────────────────────────────────────────────
# 8" nominal working size, which drills the 200 mm casing [R16] calls standard.
TOOL_OD     = 0.194   # [ARC]/[MFR] 7 5/8 in tool OD for the 8" nominal size,
                      # running inside 8 5/8 x 7 7/8 in casing.  The tool is a
                      # close but VISIBLY LOOSE fit - about 4.5 mm of clearance
                      # per side at the 6" size - so it swings and knocks on the
                      # casing all the way down.  It is never a piston fit.
TOOL_LEN    = 1.830   # [ARC] claycutter / shell body "approximately 6 ft"
SHOE_LEN    = 0.150   # [NS] screw-on cutting shoe; [ARC] give the coarse thread
                      # and the plain/serrated/chisel/gravelling/auger-nose
                      # variants but no shoe length
SINKER_OD   = 0.1143  # [ARC] sinker bar 4.5 in
SINKER_LEN  = 1.000   # [ARC] "40 in effective length", ~80 kg each; [AGS] give
                      # the same 80 kg as a manual-handling case
SWIVEL_LEN  = 0.260   # [NS] the swivel and its tapered nut and pin.  [ARC] say
                      # the top bar "carries a swivel eye, secured by a tapered
                      # nut and pin" - THE BRITISH STRING HAS A SWIVEL AND NO
                      # ROPE SOCKET.  A zinc-poured rope socket here would be an
                      # American tool on a British machine.
STROKE_M    = 2.000   # [AGS] the British string reciprocates "a stroke of 1 to
                      # 3 m" - a FREE WINCH DROP, three to five times the
                      # American crank throw.  2.0 m is the middle of the
                      # sourced band and fits under the 5.20 m clear height with
                      # the 3.09 m string hanging on the line.

# ── the trailer chassis and the winch skid ───────────────────────────────────
CH_Y0, CH_Y1 = 0.55, 3.20   # [NS] chassis frame, forward and rear ends.  Only
                            # the 1 810 mm wheel base is published; the frame
                            # length is chosen to sit inside the derived 4.09 m
                            # footprint and carry the winch under the backstay.
CH_RAIL_X   = 0.550   # [NS] side rails, set so the backstay leg comes down the
                      # centreline BETWEEN them and its foot reaches the ground
DECK_Z      = 0.720   # [NS] deck top
WHEEL_R     = 0.330   # [NS] light-trailer wheel; reference section 8.1 lists
                      # "axle count, tyre size, jockey wheel, drawbar type,
                      # stabiliser jacks" as unsourced in full
WHEEL_W     = 0.185   # [NS]
AXLE_Y      = 2.050   # [NS]
DRAWBAR_Y   = 4.200   # [NS] hitch; LEG_LEN + drawbar reproduces [ST]'s 7.500 m
                      # travelling length, which is the check that keeps this
                      # number honest even though the drawbar itself is not
                      # published
DRUM_R      = 0.150   # [NS] winch drum barrel; [CON] give the 60 m capacity but
DRUM_W      = 0.300   # [NS] no drum dimension
DRUM_FL_R   = 0.235   # [NS] drum flange

# ── casing carried on the machine ────────────────────────────────────────────
CASING_OD   = 0.219   # [R16]/[R06] 150 mm or 200 mm standard, 150-300 mm range;
                      # 8 5/8 in outside diameter is the [ARC] casing that the
                      # 7 5/8 in tool runs inside
CASING_LEN  = 1.500   # [CON] "casing in 1.5 m (5 ft) lengths ... ~60 kg each",
                      # flush-butt-threaded to BS 879.  NOTE this is the family
                      # A length; family B stacks 3.05 m lengths, and the two
                      # casing stacks look completely different.


# ═════════════════════════════════════════════════════════════════════════════
# LOCAL HELPERS
# ═════════════════════════════════════════════════════════════════════════════
def _assert_box_true():
    """Refuse to build if `rig.py`'s `box()` is still returning half sizes.

    THIS IS A GUARD, NOT A WORKAROUND, AND THE DIFFERENCE MATTERS.

    `box()` in `blender/lib/rig.py` calls `primitive_cube_add(size=1)`, which
    makes a cube of EDGE 1 spanning -0.5..+0.5, and then sets `scale = size/2` -
    so the edge comes out at `size/2`.  Measured in Blender 5.2.1 on this
    machine, immediately before this file was written:

        box((4, 2, 10))     -> (2.000, 1.000, 5.000)
        box((1, 1, 1))      -> (0.500, 0.500, 0.500)
        box((0.2, 3.0, 0.5))-> (0.100, 1.500, 0.250)
        tube(r=0.5, l=3.0)  -> (1.000, 1.000, 3.000)   <- tube() is CORRECT

    `tube()` being right is what hid this for so long: a machine built from both
    gets correct cylinders and half-size boxes, and nothing looks broken in a
    wireframe - the proportions are just quietly wrong.

    HANDOFF.md section 10 records that it has already bitten twice, and that
    `core_rig.py`, `pd55.py` and `foundation_bg.py` each carry a PRIVATE
    corrected `box()` to work around it.  Those private copies are why the
    library was never fixed, and they are the reason the fix is dangerous: the
    moment `rig.py` is corrected, any machine still compensating doubles in
    size.  That has happened twice.

    So this file compensates for NOTHING.  Every dimension above is the real
    dimension, `R.box()` is called with it directly, and if the library is still
    broken the build STOPS HERE with an error that says exactly what to fix.
    A machine that silently exports at half size is far worse than one that
    refuses to export - HANDOFF.md section 8A is the whole catalogue of what
    silent fallbacks cost this project.
    """
    probe = R.box('__boxprobe', (4.0, 2.0, 10.0))
    got = tuple(round(v, 4) for v in probe.dimensions)
    bpy.data.objects.remove(probe, do_unlink=True)
    if got != (4.0, 2.0, 10.0):
        raise RuntimeError(
            'cable_percussion: rig.py box() is STILL half-size - box((4,2,10)) '
            'measured %s, expected (4.0, 2.0, 10.0).  This module builds to true '
            'dimensions and deliberately does NOT compensate, so it will not '
            'export a wrong-sized machine.  Fix lib/rig.py box() to `o.scale = '
            'size` (and then strip the private box() copies in core_rig.py, '
            'pd55.py and foundation_bg.py, or those three double in size).  '
            'See HANDOFF.md section 10.' % (got,))


def bake(o):
    """Apply every modifier, and convert a curve to a mesh, so it can be joined.

    `join()` keeps only the ACTIVE object's modifier stack, and `finish()` skips
    CURVE objects entirely - so an unbaked rope lands as its own draw call and an
    unbaked ARRAY gets applied to whatever it is joined into.  core_rig.py
    measured that second failure at 740 -> 17 856 triangles on one mesh.
    """
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    return bpy.context.active_object


def weld(objs, parent, tag):
    """Join a DYNAMIC subassembly by material and parent it to its game node.

    `rig.py`'s `finish()` deliberately skips anything under a `pivot:`/`slide:`
    node, because it has to move independently - which means every mesh in a
    moving group is its own draw call unless it is welded here.  On this machine
    that is the difference between the tool string costing 9 draw calls and
    costing 2.
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


def cut(target, cutter):
    """Boolean difference; the cutter's own modifiers are evaluated first."""
    m = target.modifiers.new('cut', 'BOOLEAN')
    m.operation = 'DIFFERENCE'
    m.object = cutter
    m.solver = 'EXACT'
    return target


def disc(name, r, t, mat, loc, axis='X', sides=16, parent=None):
    """A wheel / sheave / flange: a short cylinder about X, Y or Z, CENTRED on
    `loc` rather than based on it, because every one of these is a round thing
    on an axle and the axle is what you know the position of."""
    rot = {'X': (0, math.pi / 2, 0), 'Y': (-math.pi / 2, 0, 0), 'Z': (0, 0, 0)}[axis]
    o = R.tube(name, r, t, mat, parent=parent, loc=loc, rot=rot, sides=sides)
    off = {'X': (-t / 2, 0, 0), 'Y': (0, -t / 2, 0), 'Z': (0, 0, -t / 2)}[axis]
    o.location = (loc[0] + off[0], loc[1] + off[1], loc[2] + off[2])
    return o


def strut(name, a, b, r, mat, parent=None, sides=8, over=0.0):
    """A tube running from point `a` to point `b`.

    The whole derrick is raking struts, so this is the workhorse of the file.
    Rotating +Z onto the direction with Euler XYZ (0, ry, rz) sends +Z to
    (sin ry cos rz, sin ry sin rz, cos ry) - no extra quarter turn.  core_rig.py
    records getting exactly this wrong and firing every handrail off at 90
    degrees to the deck edge it was meant to follow.
    """
    d = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
    L = math.sqrt(d[0] ** 2 + d[1] ** 2 + d[2] ** 2)
    if L < 1e-5:
        return None
    ry = math.acos(max(-1.0, min(1.0, d[2] / L)))
    rz = math.atan2(d[1], d[0])
    return R.tube(name, r, L + over, mat, parent=parent, loc=a, rot=(0, ry, rz),
                  sides=sides)


def leg_foot(i):
    """World position of tripod foot `i`.  0 = backstay (+Y), 1 = front left,
    2 = front right.  All three sit on ONE CIRCLE of radius FOOT_R about the
    drilling axis - see the docstring; that is the finding that overturns the
    reference's 8.5-9 degree rake."""
    return [(0.0, FOOT_AFT, 0.0),
            (-LEG_SPREAD / 2, -FOOT_FWD, 0.0),
            (LEG_SPREAD / 2, -FOOT_FWD, 0.0)][i]


def leg_point(i, frac):
    """A point `frac` of the way up leg `i`, from its foot to the apex."""
    f = leg_foot(i)
    apex = (0.0, 0.0, OP_HEIGHT)
    return (f[0] + (apex[0] - f[0]) * frac,
            f[1] + (apex[1] - f[1]) * frac,
            f[2] + (apex[2] - f[2]) * frac)


# ═════════════════════════════════════════════════════════════════════════════
def build(out_path):
    R.reset()
    _assert_box_true()          # STOP if lib/rig.py still halves every box

    statics = []
    A = statics.append

    # ── 1. THE TRIPOD DERRICK ───────────────────────────────────────────────
    # Three equal 6.997 m legs raking 18.12 degrees off vertical to feet on a
    # 2.176 m circle [D].  Two forward, straddling the hole and the working
    # space; one backstay aft, over the winch, which is the leg the rope runs
    # up.  The apex is directly over the drilling axis because the method
    # requires it absolutely: the rope hangs straight down into the hole, this
    # machine cannot drill at an angle, and there is no crowd force to make it.
    apex = (0.0, 0.0, OP_HEIGHT)
    for i in range(3):
        f = leg_foot(i)
        A(strut('leg%d' % i, f, apex, LEG_R, R.MAT_PAINT, sides=10))

        # THE FOOT.  [NS] - reference section 8.1: "Spike, plate, shoe or bare
        # leg end: unknown."  What IS sourced is the failure mode: [CON] require
        # "the tripod feet prevented from spreading" whenever a multi-part
        # tackle is rigged.  So the foot is modelled as what that instruction
        # implies and no more - a flat bearing plate with a tie eye on it.  The
        # bottom 0.4 m of every leg wears wornSteel, because that is the band
        # that stands in the mud all week.
        d = (apex[0] - f[0], apex[1] - f[1], apex[2] - f[2])
        n = math.sqrt(sum(c * c for c in d))
        u = tuple(c / n for c in d)
        A(strut('leg%d_shin' % i, f, (f[0] + u[0] * 0.42, f[1] + u[1] * 0.42, 0.42),
                LEG_R + 0.004, R.MAT_WORN, sides=10))
        A(R.box('foot%d' % i, (0.26, 0.26, 0.030), R.MAT_WORN,
                loc=(f[0], f[1], 0.015), bevel=0.006))
        # tie eye - the thing a chain or a bar goes through to stop the spread
        A(disc('foot%d_eye' % i, 0.038, 0.020, R.MAT_STEEL,
               (f[0] + u[0] * 0.10, f[1] + u[1] * 0.10, 0.075),
               'Y' if i == 0 else 'X', sides=8))

        # THE FOLD JOINT.  [NS] - the reference proves the legs fold (travelling
        # length 7.50 m against an operating length of 4.09 m: folded, the
        # package is nearly twice as long, so the legs fold back and project a
        # long way to the rear) but records the joint itself as unsourced.
        # Modelled as the one thing that must be true of it: a clevis and a
        # through-pin, low on the leg, where a folding leg has to break.
        p = leg_point(i, 0.115)
        A(R.box('legpin%d' % i, (0.14, 0.14, 0.16), R.MAT_DARK,
                loc=p, bevel=0.012))
        A(disc('legpin%d_p' % i, 0.026, 0.20, R.MAT_STEEL, p,
               'Y' if i == 0 else 'X', sides=8))

    # LEG BRACES.  [CON], verbatim: "When using multi-part tackles, all the leg
    # braces should be in place and the tripod feet prevented from spreading."
    # So they exist and they are REMOVABLE - which is why they are bolted
    # between the legs at one height rather than welded in as a lattice.  Size
    # is [NS].  Two rings of them: a low one that also stops the fold, and a
    # high one under the head.
    for frac in (0.30, 0.66):
        for i, j in ((0, 1), (1, 2), (2, 0)):
            a, b = leg_point(i, frac), leg_point(j, frac)
            A(strut('brace%d_%d%d' % (int(frac * 100), i, j), a, b, BRACE_R,
                    R.MAT_PAINT, sides=6))
            for e in (a, b):
                A(R.box('bracelug%d_%d%d_%d' % (int(frac * 100), i, j,
                                                int(e[0] * 100) & 255),
                        (0.075, 0.075, 0.075), R.MAT_DARK, loc=e, bevel=0.008))

    # THE HEAD CASTING, and the legs projecting through it.  [NS] in form and
    # material - reference section 8.1: "The head casting.  Form, material,
    # whether cast or fabricated" is unsourced, and only two facts survive:
    # there are sheaves (plural), and there is a strong-point.  Built as a
    # fabricated box with the three legs pinned into it and their ends standing
    # proud above, which is what puts the published 6.650 m operating height
    # above the 5.200 m working height under the sheaves.
    # The legs already run foot-to-apex, so they pass THROUGH this casting and
    # stand 0.35 m proud above it - which is exactly what puts [ST]'s 6.650 m
    # operating height above its 5.200 m working height under the sheaves.  The
    # head is a collar on the leg bundle, not a termination of it.
    A(R.box('head', (0.34, 0.40, 0.42), R.MAT_CAST, loc=(0, 0, HEAD_Z),
            bevel=0.018))
    for i in range(3):
        p = leg_point(i, (HEAD_Z - 0.0) / OP_HEIGHT)
        A(disc('headpin%d' % i, 0.024, 0.30, R.MAT_STEEL, p,
               'Y' if i == 0 else 'X', sides=6))
    # a cap over the apex where the three leg ends meet
    A(disc('head_cap', 0.19, 0.035, R.MAT_DARK, (0, 0, OP_HEIGHT - 0.02),
           'Z', sides=12))

    # THE STRONG-POINT.  [CON], verbatim: "The upper snatch block would be
    # attached to the rig frame near the apex at the strong-point provided."
    # A named, sourced part that almost nobody models: a lug on the head,
    # separate from the sheave, that a snatch block shackles into.
    A(R.box('strongpoint', (0.030, 0.16, 0.19), R.MAT_STEEL,
            loc=(0, 0.245, HEAD_Z - 0.10), bevel=0.006))
    A(disc('strongpoint_hole', 0.030, 0.040, R.MAT_DARK,
           (0, 0.245, HEAD_Z - 0.13), 'X', sides=8))

    # ── 2. THE CROWN BLOCK AND ITS SHEAVE ───────────────────────────────────
    # THE SHEAVE IS A pivot: BECAUSE THE BRIEF AND THE MACHINE BOTH REQUIRE IT.
    # Raising and dropping a tool on this rope is the entire visual identity of
    # a cable percussion rig; a crown sheave welded into the static join would
    # be a rig that cannot work.  Diameter is [NS].
    A(R.box('block_hanger', (0.10, 0.10, 0.34), R.MAT_STEEL,
            loc=(0, 0, HEAD_Z - 0.36), bevel=0.008))
    for s in (-1, 1):
        A(R.box('block_cheek%d' % s, (0.018, 0.30, BLOCK_TOP - UNDER_SHEAVE),
                R.MAT_CAST,
                loc=(s * (SHEAVE_W / 2 + 0.016), 0,
                     (BLOCK_TOP + UNDER_SHEAVE) / 2), bevel=0.005))
    A(disc('block_axle', 0.028, SHEAVE_W + 0.10, R.MAT_STEEL,
           (0, 0, SHEAVE_Z), 'X', sides=8))
    # the becket / underside of the block - this is the 5.200 m line [ST]
    A(R.box('block_foot', (0.11, 0.24, 0.030), R.MAT_CAST,
            loc=(0, 0, UNDER_SHEAVE + 0.015), bevel=0.005))

    sheave = R.empty(R.NODE_PIVOT, 'sheave', loc=(0, 0, SHEAVE_Z))
    sh = []
    sh.append(disc('sheave_rim', SHEAVE_R, SHEAVE_W, R.MAT_CAST,
                   (0, 0, 0), 'X', sides=20))
    sh.append(disc('sheave_groove', SHEAVE_R - 0.012, SHEAVE_W + 0.006,
                   R.MAT_WORN, (0, 0, 0), 'X', sides=20))
    sh.append(disc('sheave_boss', SHEAVE_R * 0.42, SHEAVE_W + 0.030, R.MAT_CAST,
                   (0, 0, 0), 'X', sides=12))
    # spokes, so the sheave reads as a wheel and not a disc when it turns
    for k in range(4):
        th = k * math.pi / 4
        sh.append(R.box('sheave_spoke%d' % k, (SHEAVE_W * 0.55, SHEAVE_R * 1.55,
                                               0.022), R.MAT_CAST,
                        loc=(0, 0, 0), rot=(th, 0, 0)))
    weld(sh, sheave, 'sheave')

    # THE SECOND ROPE PATH.  [ST] says "under sheaveS"; [CON] give the apex
    # strong-point.  A snatch block on that lug carries the shell / casing line,
    # offset aft so the working line keeps the drilling axis to itself.
    sn_y, sn_z = 0.245, HEAD_Z - 0.42
    A(R.box('snatch_shackle', (0.022, 0.075, 0.19), R.MAT_STEEL,
            loc=(0, sn_y, HEAD_Z - 0.235), bevel=0.004))
    for s in (-1, 1):
        A(R.box('snatch_cheek%d' % s, (0.014, 0.24, 0.26), R.MAT_CAST,
                loc=(s * 0.042, sn_y, sn_z), bevel=0.004))
    sheave2 = R.empty(R.NODE_PIVOT, 'sheave-shell', loc=(0, sn_y, sn_z))
    weld([disc('sheave2_rim', 0.105, 0.050, R.MAT_CAST, (0, 0, 0), 'X', sides=14),
          disc('sheave2_gr', 0.094, 0.056, R.MAT_WORN, (0, 0, 0), 'X', sides=14)],
         sheave2, 'sheave-shell')

    # ── 3. THE TRAILER CHASSIS ──────────────────────────────────────────────
    # [R16]: "the rig is a light trailer, not a self-propelled machine", towed by
    # a 4x4.  Only the 1 810 mm wheel base and travelling width are published;
    # everything else here is [NS] and sized to sit inside the derived footprint.
    # The frame is a U with an open centre so the BACKSTAY LEG COMES DOWN
    # BETWEEN THE RAILS and its foot reaches the ground - the tripod stands on
    # the ground, not on the trailer, which is what makes it self-standing.
    for s in (-1, 1):
        A(R.box('rail%d' % s, (0.090, CH_Y1 - CH_Y0, 0.140), R.MAT_DARK,
                loc=(s * CH_RAIL_X, (CH_Y0 + CH_Y1) / 2, DECK_Z - 0.070),
                bevel=0.010))
    for cy in (CH_Y0 + 0.08, CH_Y1 - 0.08, 2.70):
        A(R.box('xmem%d' % int(cy * 100), (2 * CH_RAIL_X, 0.090, 0.110),
                R.MAT_DARK, loc=(0, cy, DECK_Z - 0.075), bevel=0.008))
    A(R.box('deck', (2 * CH_RAIL_X + 0.09, 1.55, 0.028), R.MAT_DARK,
            loc=(0, 2.42, DECK_Z + 0.014), bevel=0.006))
    # chequer-plate ribs on the deck, one ARRAY, free in draw calls
    ck = R.box('deck_rib', (2 * CH_RAIL_X + 0.04, 0.022, 0.007), R.MAT_DARK,
               loc=(0, 1.70, DECK_Z + 0.031))
    arr(ck, (0, 0.105, 0), 14)
    A(ck)

    # wheels.  Single axle on the published 1 810 mm base.
    A(disc('axle', 0.038, WHEEL_BASE - 0.10, R.MAT_STEEL,
           (0, AXLE_Y, WHEEL_R), 'X', sides=8))
    for s in (-1, 1):
        x = s * WHEEL_BASE / 2
        A(disc('tyre%d' % s, WHEEL_R, WHEEL_W, R.MAT_RUBBER,
               (x, AXLE_Y, WHEEL_R), 'X', sides=18))
        A(disc('rim%d' % s, WHEEL_R * 0.58, WHEEL_W + 0.012, R.MAT_PAINT,
               (x, AXLE_Y, WHEEL_R), 'X', sides=12))
        A(disc('hub%d' % s, 0.070, WHEEL_W + 0.055, R.MAT_WORN,
               (x, AXLE_Y, WHEEL_R), 'X', sides=8))
        A(R.box('mudguard%d' % s, (WHEEL_W + 0.055, 0.86, 0.020), R.MAT_PAINT,
                loc=(x, AXLE_Y, WHEEL_R + 0.30), bevel=0.008))
        # spring hanger
        A(R.box('spring%d' % s, (0.055, 0.80, 0.022), R.MAT_WORN,
                loc=(x * 0.86, AXLE_Y, WHEEL_R + 0.075), bevel=0.004))

    # drawbar and hitch.  LEG_LEN + this drawbar reproduces [ST]'s published
    # 7 500 mm travelling length, which is the only check available on it.
    A(strut('drawbar_l', (-CH_RAIL_X, CH_Y1 - 0.10, DECK_Z - 0.09),
            (-0.055, DRAWBAR_Y - 0.22, DECK_Z - 0.11), 0.038, R.MAT_DARK, sides=6))
    A(strut('drawbar_r', (CH_RAIL_X, CH_Y1 - 0.10, DECK_Z - 0.09),
            (0.055, DRAWBAR_Y - 0.22, DECK_Z - 0.11), 0.038, R.MAT_DARK, sides=6))
    A(R.box('hitch', (0.13, 0.30, 0.13), R.MAT_DARK,
            loc=(0, DRAWBAR_Y - 0.10, DECK_Z - 0.11), bevel=0.012))
    A(R.box('drawbar_stripe', (0.20, 0.16, 0.020), R.MAT_HAZARD,
            loc=(0, DRAWBAR_Y - 0.32, DECK_Z - 0.04)))
    # jockey wheel, wound down
    A(R.tube('jockey_tube', 0.032, 0.62, R.MAT_PAINT,
             loc=(0.13, DRAWBAR_Y - 0.42, 0.10), sides=8))
    A(disc('jockey_wheel', 0.085, 0.055, R.MAT_RUBBER,
           (0.13, DRAWBAR_Y - 0.42, 0.085), 'X', sides=10))

    # corner steadies.  [NS] - listed among the unsourced trailer fittings, but a
    # two-tonne trailer carrying a 6 000 kg derrick loading has to be got off its
    # springs before the derrick goes up, so they exist.  Screw jacks, not rams:
    # THERE IS NO HYDRAULIC ANYTHING ON THIS MACHINE.
    for s in (-1, 1):
        for jy in (CH_Y0 + 0.16, CH_Y1 - 0.20):
            A(R.box('jack%d_%d' % (s, int(jy * 100)), (0.070, 0.070, 0.30),
                    R.MAT_DARK, loc=(s * (CH_RAIL_X + 0.06), jy, DECK_Z - 0.20),
                    bevel=0.006))
            A(R.tube('jackscrew%d_%d' % (s, int(jy * 100)), 0.022, 0.30,
                     R.MAT_STEEL,
                     loc=(s * (CH_RAIL_X + 0.06), jy, 0.055), sides=6))
            A(disc('jackpad%d_%d' % (s, int(jy * 100)), 0.075, 0.020, R.MAT_WORN,
                   (s * (CH_RAIL_X + 0.06), jy, 0.020), 'Z', sides=8))
            A(R.box('jackhandle%d_%d' % (s, int(jy * 100)), (0.20, 0.016, 0.016),
                    R.MAT_STEEL,
                    loc=(s * (CH_RAIL_X + 0.16), jy, DECK_Z - 0.36)))

    # ── 4. THE ENGINE AND THE FREE-FALL WINCH ───────────────────────────────
    # [R06]: "a winch on a small skid-mounted engine".  [ST]/[R16]: 2 000 kgf
    # single line pull, diesel driven.  [CON]: it is a FREE-FALL winch - "the
    # tools are lifted, then allowed to fall freely, so they are travelling as
    # fast as possible when they strike, for maximum impact".  There is no
    # crank, no pitman and no walking beam on this machine; a beam here would be
    # the American spudder, which is a different machine (reference section 9.B).
    # Engine make, type and POWER are all [NS]: "a diesel engine" is the entire
    # published description.
    ENG_Y, ENG_Z = 2.42, DECK_Z + 0.31
    A(R.box('engine_case', (0.72, 0.86, 0.58), R.MAT_PAINT,
            loc=(0, ENG_Y, ENG_Z + 0.03), bevel=0.020))
    lv = R.box('eng_louvre', (0.020, 0.62, 0.026), R.MAT_DARK,
               loc=(0.362, ENG_Y, ENG_Z + 0.20))
    arr(lv, (0, 0, -0.048), 5)
    A(lv)
    A(R.box('eng_hatch', (0.020, 0.50, 0.34), R.MAT_DARK,
            loc=(-0.362, ENG_Y, ENG_Z + 0.02), bevel=0.006))
    A(R.tube('exhaust', 0.032, 0.52, R.MAT_WORN,
             loc=(-0.24, ENG_Y + 0.30, ENG_Z + 0.32), sides=8))
    A(disc('exh_cap', 0.042, 0.030, R.MAT_WORN,
           (-0.24, ENG_Y + 0.30, ENG_Z + 0.86), 'Z', sides=8))
    A(R.box('fuel_tank', (0.30, 0.44, 0.26), R.MAT_DARK,
            loc=(0.30, CH_Y1 - 0.34, DECK_Z + 0.14), bevel=0.012))
    A(disc('fuel_cap', 0.045, 0.030, R.MAT_WORN,
           (0.30, CH_Y1 - 0.34, DECK_Z + 0.28), 'Z', sides=8))

    # winch frame, ahead of the engine, under the backstay leg
    WY = 1.35
    for s in (-1, 1):
        A(R.box('winch_side%d' % s, (0.045, 0.46, 0.42), R.MAT_DARK,
                loc=(s * (DRUM_W / 2 + 0.30), WY, DECK_Z + 0.19), bevel=0.008))
    A(R.box('winch_bed', (2 * (DRUM_W / 2 + 0.33), 0.52, 0.055), R.MAT_DARK,
            loc=(0, WY, DECK_Z + 0.010), bevel=0.006))

    # THE DRUMS.  Two: the tool line and the shell / casing line.  Drum count is
    # [NS] - two is implied by the method (the shell goes down the same hole the
    # tool just came out of) and is never stated on a datasheet.  Both turn, so
    # both are pivot: nodes and are excluded from the static join.
    drums = []
    for tag, dx, dr in (('tool', -0.24, DRUM_R), ('shell', 0.26, DRUM_R * 0.80)):
        node = R.empty(R.NODE_PIVOT, 'drum-' + tag,
                       loc=(dx, WY, DECK_Z + 0.235))
        g = [disc('drum_%s_barrel' % tag, dr, DRUM_W, R.MAT_WORN,
                  (0, 0, 0), 'X', sides=14)]
        for s in (-1, 1):
            g.append(disc('drum_%s_fl%d' % (tag, s), DRUM_FL_R * (dr / DRUM_R),
                          0.018, R.MAT_CAST,
                          (s * (DRUM_W / 2 + 0.009), 0, 0), 'X', sides=14))
        # THE ROPE ON THE DRUM, AND IT IS NOT TIDY.  Reference section 4.1: the
        # drum is a STORAGE reel, not a level-wound working winch - the line is
        # set to depth and then worked - so it is "wound in multiple untidy
        # layers with a visible crossover", and the wear concentrates in bands
        # rather than spreading evenly.  Two rough layers of turns, modelled as
        # arrayed rings, are enough to read that at any sane distance.
        for lay, (lr, n0) in enumerate(((dr + ROPE_R, 11), (dr + 3 * ROPE_R, 7))):
            t = disc('drum_%s_turn%d' % (tag, lay), lr, ROPE_R * 1.9, R.MAT_WORN,
                     (-DRUM_W / 2 + 0.02 + lay * 0.016, 0, 0), 'X', sides=12)
            arr(t, (ROPE_R * 2.1, 0, 0), n0)
            g.append(t)
        weld(g, node, 'drum-' + tag)
        drums.append(node)

    # THE CLUTCH AND BRAKE LEVERS.  "The operator works the clutch by hand and
    # reads the rope; that is the whole skill."  [CON] describe the technique -
    # hoist on the drum, declutch, let the tool free-fall - and both the "long
    # drop" and the short surging stroke.  The clutch lever is therefore the
    # single most-handled object on the machine, and reference section 6.1 item
    # 5 says where the wear is: "The paint is gone from the top 150 mm of every
    # lever and nowhere else."  So the lever body is painted and its grip is
    # bare worn steel.  Type and count of levers are [NS].
    clutch = R.empty(R.NODE_PIVOT, 'clutch', loc=(-0.60, WY + 0.30, DECK_Z + 0.13))
    weld([R.tube('clutch_lever', 0.020, 0.62, R.MAT_PAINT, loc=(0, 0, 0),
                 rot=(-0.22, 0, 0), sides=8),
          R.tube('clutch_grip', 0.026, 0.155, R.MAT_WORN,
                 loc=(0, 0.135, 0.605), rot=(-0.22, 0, 0), sides=8)],
         clutch, 'clutch')
    A(R.box('clutch_quad', (0.030, 0.20, 0.16), R.MAT_DARK,
            loc=(-0.60, WY + 0.30, DECK_Z + 0.09), bevel=0.006))
    # the band-brake lever beside it, fixed
    A(R.tube('brake_lever', 0.018, 0.50, R.MAT_PAINT,
             loc=(-0.46, WY + 0.34, DECK_Z + 0.13), rot=(-0.34, 0, 0), sides=8))
    A(R.tube('brake_grip', 0.024, 0.14, R.MAT_WORN,
             loc=(-0.46, WY + 0.50, DECK_Z + 0.58), rot=(-0.34, 0, 0), sides=8))
    A(R.box('clutch_housing', (0.22, 0.24, 0.24), R.MAT_CAST,
            loc=(-0.46, WY, DECK_Z + 0.20), bevel=0.012))

    # drum guard.  Open at the front so the rope can leave - a closed guard on a
    # free-fall drum would be a guard on a machine that cannot work.
    A(R.box('drum_guard_top', (0.86, 0.44, 0.020), R.MAT_PAINT,
            loc=(0, WY + 0.06, DECK_Z + 0.50), bevel=0.006))
    A(R.box('drum_guard_back', (0.86, 0.020, 0.30), R.MAT_PAINT,
            loc=(0, WY + 0.27, DECK_Z + 0.36), bevel=0.006))

    # ── 5. TOOL AND CASING STOWAGE ON THE CHASSIS ───────────────────────────
    # [AGS]: a sinker bar is 80 kg, a casing lead length 77 kg, and a two-person
    # lift is unacceptable over 85 kg - so nothing here is carried.  It is rolled
    # off a cradle and dragged.  Casing is in 1.5 m lengths at ~60 kg [CON], and
    # that FAMILY-A length is one of the tells: the American machine stacks
    # 3.05 m lengths and its rack looks completely different.
    for s in (-1, 1):
        A(R.box('cradle%d' % s, (0.070, 0.070, 0.22), R.MAT_DARK,
                loc=(s * (CH_RAIL_X - 0.02), 2.05 + s * 0.42, DECK_Z + 0.11),
                bevel=0.006))
    for k, (cx, cz) in enumerate(((-0.30, DECK_Z + 0.14), (-0.06, DECK_Z + 0.14),
                                  (-0.18, DECK_Z + 0.14 + CASING_OD * 0.87))):
        A(R.tube('casing%d' % k, CASING_OD / 2, CASING_LEN, R.MAT_WORN,
                 loc=(cx, 1.62, cz), rot=(-math.pi / 2, 0, 0), sides=12))
        # the battered, bright-ringed top where the drive cap has been hit
        A(disc('casing%d_collar' % k, CASING_OD / 2 + 0.008, 0.055, R.MAT_STEEL,
               (cx, 1.66, cz), 'Y', sides=12))

    # a spare shoe and the swan-neck expressing bar - [CON]: the clay plug is
    # shoved out of the cutter with "a swan-neck expressing tool" after every
    # fall, so it never leaves the machine's side
    A(R.tube('swan_bar', 0.016, 1.40, R.MAT_STEEL,
             loc=(0.42, 1.30, DECK_Z + 0.06), rot=(-math.pi / 2, 0, 0), sides=6))
    A(R.tube('swan_hook', 0.016, 0.17, R.MAT_STEEL,
             loc=(0.42, 1.98, DECK_Z + 0.06), rot=(-2.05, 0, 0), sides=6))

    # ── 6. THE WIRE ROPE ────────────────────────────────────────────────────
    # hose() and not a cylinder, deliberately.  `rig.py`'s own docstring: a
    # straight cylinder never gives the sag, and rope routing "is one of the
    # clearest tells that a machine was modelled from a photograph rather than
    # from memory".  On this machine it is more than a tell - the rope IS the
    # machine.  Reference section 5.1 item 2: "A single line falling down the
    # middle of the triangle, into the ground."
    #
    # The run from the drum up to the crown is the part that hangs: it carries
    # nothing but its own weight, it is oily and soft (mild plow steel on a
    # hemp core, not a stiff modern IWRC rope), and it drapes.  The part below
    # the sheave carries the tool string and is nearly straight - but only
    # nearly: it is 10 mm of rope under a couple of hundred kilos, and it bows.
    A(R.hose('rope_hoist',
             [(-0.24, WY, DECK_Z + 0.235 + DRUM_R + 0.012),
              (-0.20, WY - 0.55, 1.62),
              (-0.10, 0.86, 3.60),
              (-0.028, 0.30, 5.05),
              (0.0, 0.055, SHEAVE_Z + SHEAVE_R - 0.008),
              (-SHEAVE_R * 0.30, -0.030, SHEAVE_Z + SHEAVE_R * 0.94)],
             radius=ROPE_R, mat=R.MAT_WORN, sides=6))
    A(R.hose('rope_fall',
             [(0.0, -SHEAVE_R + 0.004, SHEAVE_Z + SHEAVE_R * 0.90),
              (0.0, -SHEAVE_R - 0.004, SHEAVE_Z - 0.30),
              (0.006, -0.012, 4.60),
              (0.004, -0.004, 3.60)],
             radius=ROPE_R, mat=R.MAT_WORN, sides=6))
    # the shell line, slack and parked over the snatch block with its hook down
    A(R.hose('rope_shell',
             [(0.26, WY, DECK_Z + 0.235 + DRUM_R * 0.80 + 0.010),
              (0.24, WY - 0.40, 1.75),
              (0.10, 0.62, 3.70),
              (0.014, sn_y + 0.055, sn_z + 0.100),
              (0.0, sn_y + 0.104, sn_z - 0.020),
              (0.0, sn_y + 0.094, 2.40),
              (0.030, sn_y + 0.02, 1.05)],
             radius=ROPE_R * 0.92, mat=R.MAT_WORN, sides=6))
    A(disc('shell_hook_eye', 0.032, 0.026, R.MAT_STEEL,
           (0.030, sn_y + 0.02, 0.99), 'X', sides=8))
    A(R.box('shell_hook', (0.020, 0.070, 0.13), R.MAT_STEEL,
            loc=(0.030, sn_y + 0.02, 0.91), bevel=0.005))

    # ── 7. THE TOOL ON THE ROPE ─────────────────────────────────────────────
    # THE WHOLE POINT OF THE MACHINE, AND THE REASON IT NEEDS A slide: NODE.
    # The game raises this and drops it; that motion is the machine's entire
    # visual identity.  It is named `carriage` because `src/core/gltfRig.js`
    # already drives `slide:carriage` and resolves the tool anchor through it -
    # a new name would need new runtime code for no gain.  `travel_m` is
    # declared because gltfRig's carriage invariant reads `carriageRange`
    # immediately after the `dyn.carriage` guard and writes NaN into a world
    # matrix without it, which makes the machine silently disappear.
    #
    # `mount:tool` hangs under it as the SWAP POINT, so the claycutter modelled
    # here can be exchanged for a shell, a chisel or an SPT assembly without
    # touching the rope, the sheave or the winch.  gltfRig prefers
    # `mounts.get('tool')` over the carriage for exactly this.
    #
    # THE STRING IS BRITISH, so it reads top-down: SWIVEL -> SINKER BAR -> TOOL.
    # There is no rope socket and no jars: those are American parts, and putting
    # a zinc-poured rope socket on this machine would be the tool-string
    # equivalent of giving it a walking beam (reference section 4.4).
    STRING_LEN = SWIVEL_LEN + SINKER_LEN + TOOL_LEN
    carriage = R.empty(R.NODE_SLIDE, 'carriage', loc=(0, 0, STRING_LEN))
    carriage['travel_m'] = STROKE_M     # [AGS] 1-3 m; free winch drop, not a
                                        # crank throw
    tool_mount = R.empty(R.NODE_MOUNT, 'tool', carriage,
                         loc=(0, 0, -(SWIVEL_LEN + SINKER_LEN)))

    T = []
    # the swivel and its tapered nut and pin [ARC]
    T.append(disc('swivel_eye', 0.055, 0.030, R.MAT_STEEL,
                  (0, 0, -0.030), 'X', sides=10))
    T.append(R.tube('swivel_body', 0.040, SWIVEL_LEN - 0.06, R.MAT_STEEL,
                    loc=(0, 0, -(SWIVEL_LEN - 0.06)), sides=10))
    T.append(disc('swivel_nut', 0.052, 0.045, R.MAT_WORN,
                  (0, 0, -(SWIVEL_LEN - 0.035)), 'Z', sides=6))
    # the sinker bar - 4.5 in x 40 in x 80 kg [ARC], with the two cross holes
    # every bar carries for the bail pin, and the surging slot used for driving
    # casing.  Both are real published features and both are one box each.
    z0 = -SWIVEL_LEN
    T.append(R.tube('sinker', SINKER_OD / 2, SINKER_LEN, R.MAT_STEEL,
                    loc=(0, 0, z0 - SINKER_LEN), sides=12))
    for hz in (z0 - 0.13, z0 - SINKER_LEN + 0.13):
        T.append(disc('sinker_hole%d' % int(abs(hz * 100)), 0.017,
                      SINKER_OD + 0.012, R.MAT_DARK, (0, 0, hz), 'X', sides=6))
    T.append(R.box('sinker_slot', (SINKER_OD + 0.010, 0.030, 0.20), R.MAT_DARK,
                   loc=(0, 0, z0 - SINKER_LEN * 0.52)))
    # THE UPSET BAND AT THE JOINT.  Reference warning 9.T: the API pin-and-box
    # joint leaves a collar visibly larger than the bar, and it is "visible and
    # certain" where the exact thread form is not.  The thread FORM is left
    # unasserted - only the upset is modelled.
    for jz in (z0 - 0.02, z0 - SINKER_LEN + 0.02):
        T.append(disc('joint_upset%d' % int(abs(jz * 100)), SINKER_OD / 2 + 0.011,
                      0.075, R.MAT_WORN, (0, 0, jz), 'Z', sides=12))

    # THE CLAYCUTTER - "rather like an apple corer" [CON].  Open at BOTH ends;
    # the clay is extruded up into the body on impact and levered out through
    # the side windows with the swan-neck bar after every fall.  [CON]
    # distinguish "high window" and "low window" cutters; this is a low-window
    # one.  Body and shell share the same tube [ARC], so swapping this for a
    # shell is a shoe-and-valve change, which is exactly why `mount:tool`
    # exists.
    z1 = z0 - SINKER_LEN
    body = R.tube('cutter_body', TOOL_OD / 2, TOOL_LEN - SHOE_LEN, R.MAT_WORN,
                  loc=(0, 0, z1 - (TOOL_LEN - SHOE_LEN)), sides=16)
    bore = R.tube('cutter_bore', TOOL_OD / 2 - 0.011, TOOL_LEN + 0.20,
                  R.MAT_WORN, loc=(0, 0, z1 - TOOL_LEN - 0.10), sides=16)
    win = R.box('cutter_win', (TOOL_OD + 0.05, 0.085, 0.62), R.MAT_WORN,
                loc=(0, 0, z1 - TOOL_LEN + 0.72))
    win2 = R.box('cutter_win2', (0.085, TOOL_OD + 0.05, 0.44), R.MAT_WORN,
                 loc=(0, 0, z1 - TOOL_LEN + 1.28))
    cut(body, bore)
    cut(body, win)
    cut(body, win2)
    T.append(body)
    # the screw-on shoe, on its deliberately coarse thread [ARC], and the
    # claycutter retaining ring just above it that holds the plug in [CON]
    T.append(R.tube('cutter_shoe', TOOL_OD / 2 + 0.004, SHOE_LEN, R.MAT_STEEL,
                    loc=(0, 0, z1 - TOOL_LEN), sides=16))
    thr = disc('cutter_thread', TOOL_OD / 2 + 0.007, 0.012, R.MAT_STEEL,
               (0, 0, z1 - TOOL_LEN + SHOE_LEN + 0.012), 'Z', sides=16)
    arr(thr, (0, 0, 0.020), 3)
    T.append(thr)
    T.append(disc('cutter_ring', TOOL_OD / 2 - 0.004, 0.030, R.MAT_STEEL,
                  (0, 0, z1 - TOOL_LEN + SHOE_LEN + 0.075), 'Z', sides=16))
    # THE CUTTING EDGE, and it is the one place bright steel belongs on this
    # machine.  Reference section 6: the working face is bright and peened and
    # narrower than it started; the shank is dark, scaled and oily.  The same
    # two-material rule `tools.js` already gets right on the chisel, which the
    # reference calls the best piece of domain truth in the current build.
    T.append(disc('cutter_edge', TOOL_OD / 2 + 0.004, 0.022, R.MAT_STEEL,
                  (0, 0, z1 - TOOL_LEN + 0.011), 'Z', sides=16))
    for o in T:
        o.parent = carriage
    weld(T, carriage, 'tool')

    # ── 8. LAMPS AND ATTACHMENT POINTS ──────────────────────────────────────
    # A UK ground-investigation crew works winter short days, and the one place
    # a light has to reach is the collar - the driller reads the rope and the
    # hole, not a gauge.  Both housings are on statics, so `moves: false`, which
    # is correct: nothing on this machine slews.
    mnt, aim = R.worklight('lamp-collar', None, (0.34, -0.62, 2.55),
                           aim_dir=(-0.30, 0.55, -2.10), cone_deg=64, range_m=14)
    A(R.box('lamp_body_c', (0.115, 0.095, 0.105), R.MAT_DARK,
            loc=(0.34, -0.62, 2.55), bevel=0.010))
    A(disc('lamp_lens_c', 0.045, 0.016, R.MAT_WORN, (0.34, -0.585, 2.53),
           'Y', sides=10))
    mnt2, aim2 = R.worklight('lamp-winch', None, (-0.42, WY - 0.36, DECK_Z + 0.94),
                             aim_dir=(0.32, 0.42, -0.80), cone_deg=76, range_m=9)
    A(R.box('lamp_body_w', (0.100, 0.085, 0.095), R.MAT_DARK,
            loc=(-0.42, WY - 0.36, DECK_Z + 0.94), bevel=0.008))

    # The data plate takes the rig's own invented marque at runtime
    # (`assets.js` decal 'plate', DOMAIN.md section 10) - a plate names the
    # MANUFACTURER, and Drillity is the marketplace, not an OEM.  Nothing is
    # lettered here.
    R.empty(R.NODE_MOUNT, 'marque', None, (-0.372, ENG_Y - 0.10, ENG_Z + 0.10))
    A(R.box('plate', (0.012, 0.20, 0.11), R.MAT_STEEL,
            loc=(-0.372, ENG_Y - 0.10, ENG_Z + 0.10), bevel=0.003))
    # where the driller stands: at the winch, hand on the clutch, looking down
    # the rope into the hole.  Crew of two [R06].
    R.empty(R.NODE_MOUNT, 'operator', None, (-0.78, WY + 0.34, 0.0))

    # ── 9. BAKE AND EXPORT ──────────────────────────────────────────────────
    # Every static must be baked before finish(): a CURVE is not a MESH so the
    # join skips it and each rope lands as its own draw call, and join() keeps
    # only the ACTIVE object's modifier stack, so an unbaked ARRAY gets applied
    # to the whole joined mesh.
    # The boolean cutters go FIRST.  They are parentless meshes, so if they are
    # still in the scene when finish() runs they get joined into the statics and
    # ship as three solid blocks floating where the claycutter's windows should
    # be.  weld() has already baked the booleans into the body by this point, so
    # they have done their work and nothing references them.
    for o in (bore, win, win2):
        if o.name in bpy.data.objects:
            bpy.data.objects.remove(o, do_unlink=True)
    for o in list(bpy.context.scene.objects):
        if o.type in ('MESH', 'CURVE') and o.parent is None:
            bake(o)
    return R.finish(out_path)


if __name__ == '__main__':
    out_dir = os.path.abspath(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'models'))
    os.makedirs(out_dir, exist_ok=True)
    build(os.path.join(out_dir, 'cable_percussion.glb'))
