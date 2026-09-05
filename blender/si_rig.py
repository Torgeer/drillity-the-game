"""
`si_rig` — small tracked site-investigation drill with an SPT trip hammer.
In-game marque: the Rynnval SI-30 Probeline (`src/game/data.js`,
`RIGS['si-rig']`).  Real class: a ~1.3 t rubber-tracked geotechnical rig that
goes through a domestic doorway, stands on four folding stabilisers, and takes
a LOGGED, SAMPLED hole.

THIS MACHINE DRILLS, AND IT IS NOT THE CPT UNIT
-----------------------------------------------
The other site-investigation machine in this fleet (`blender/cpt_unit.py`)
pushes a cone and never turns.  This one is its opposite in almost every
respect, and the two must not read as one machine with two paint jobs:

    cpt-unit                          si-rig
    5.7 x 2.5 x 2.8 m, 20 t           2.8 x 1.0 x 2.85 m, 1.3 t
    NO mast — a stub frame inside     A MAST, at the very front, standing
      its own footprint                 entirely OUTSIDE the tracks
    no rotation, no flush, no         rotary head + water swivel + flush,
      cuttings, no sample               casing, and every sample the log needs
    an enclosed cabin                 NO cab, no seat, no glazing: the driller
                                        STANDS on the ground at a lever console
    reaction = 20 t of ballast        reaction = 1.3 t and four small feet;
                                        it never needs more, because it drills
    the rod is pushed at 20 mm/s      the rod is DRIVEN by a 63.5 kg hammer
                                        falling 760 mm, and the blows are counted

The SPT hammer is not decoration.  `src/sim/drilling.js` (~1668) models this
method in detail — 63.5 kg, 760 mm, blows per 75 mm increment, two increments
of seating drive discarded and four of test drive summed into N, refusal at 50
blows in one 150 mm increment or 100 over the 450 mm drive — so the hammer, its
guide bar and its anvil are the thing the player is actually operating.  It is
therefore posed IN the drill line, on the rod, with the rotary head parked at
the top of the feed and out of the way.  That is the machine doing its job.

WHAT THIS IS MODELLED FROM
--------------------------
Local reference: `research/rigs/si-rig.md` (which I own and have extended with
the web sources below).  §3 of that file said the Class A overall dimensions —
length, height, mast height, track gauge — were NOT SOURCED and that the
game's numbers "could not be traced to any local file".  [T1] closes that
completely, and the match is close enough that it is plainly where they came
from:

        data.js / rigFactory         [T1] published
        1,250 kg                     1,300 kg
        790 mm wide                  800 mm travelling width
        2,729 mm long                2,700 mm transport length
        1,460 mm transport height    1,500 mm transport height
        2,857 mm work height         2,850 mm working height

Sources, cited beside every constant below:

  [T1] Dando Drilling "Terrier" specification sheet, as published by Soil
       Engineering, soil-engineering.co.uk/wp-content/uploads/2024/07/
       Dando-Terrier.pdf, read 2026-09-05.  Transport 2700 x 800 x 1500 mm;
       working 2800 x 1000 x 2850 mm; 1300 kg; 19 hp 3-cylinder diesel; the
       800 mm travelling width is sold on fitting through a domestic doorway.
       Dynamic sampling to 15 m, dynamic probing to 30 m.
  [T2] Dando "Terrier Mk2" brochure, dando.co.uk/wp-content/uploads/2016/05/
       terrier-mk2.pdf.  1,100 kg; mast 2.22–2.85 m; FEED STROKE 1.3 m;
       pulldown 1,000 kgf, pullback 7,000 kgf; a 300 mm HYDRAULIC MAST DUMP so
       the rig can track hole-to-hole with the mast erect; the mast auto-locks
       into a headache post for transport; drilling depth 30 m; wide-track kit
       extends the carrier to 1,000 mm; drilling and rigging controls MOUNTED
       AT THE SIDE with an emergency stop and a system pressure gauge, the
       console moved forward for good visibility of the borehole, and tracking
       controls at the rear on a folding foot plate; folding stabiliser legs
       with ball-jointed adjustable jack feet; tilting undercarriage for work
       on slopes up to 30°; built-in workpiece clamp and rod racking.
       ROTARY HEAD: hydraulic motor plus a two-speed manual gearbox, 7:1 to
       1:1; a 3/4" integral side-inlet air/water swivel with a BW rod
       connection; a guide ring of 200 mm effective ID; motor options to
       2,240 Nm at 35 rpm.
       DRIVE HAMMER: a SPLIT weight, 63.5 kg reducing to 50 kg by removing
       eight bolts, so one hammer covers SPT and dynamic probing; runs on a
       SINGLE guide bar (the earlier Terrier ran on two); SWINGS OUT OF THE
       DRILL LINE at any height on a stainless steel guide rod; fully guarded;
       hydraulic automatic stop at the end of stroke; 0–50 blows/min; drop
       500–750 mm; single-piece drive adapter; swing-out pullback ring;
       automatically deployed stainless rod guide.  PTO 20 l/min at 152 bar.
  [A1] ASTM D1586 (full text, azmanco.com/blog/wp-content/uploads/2020/08/
       D1586.17074.pdf).  Hammer 140 ± 2 lbf = 63.5 kg; drop 30 ± 1.0 in =
       0.76 m ± 0.030; steel-on-steel onto the anvil; a fall guide permitting
       unimpeded fall; TOTAL MASS OF THE HAMMER ASSEMBLY BEARING ON THE RODS
       ≤ 250 ± 10 lbm (113 ± 5 kg).  Split-barrel sampler Fig. 2: barrel
       457–762 mm, shoe ID 34.93 ± 0.13 mm, split-barrel ID 38.1 mm, shoe wall
       2.54 ± 0.25 mm, OD 50.8 mm, shoe taper 16°–23°.  Sampling rods at least
       as stiff as parallel-wall "A" rod, 41.3 mm OD / 28.5 mm ID.  Drive in
       three 150 mm increments, the first a seating drive; refusal at 50 blows
       in one increment, 100 total, or no advance in 10 successive blows.
  [A2] BS EN ISO 22476-3 via `research/rigs/si-rig.md` §9 item 13 and
       `src/sim/drilling.js` ~1668: 63.5 ± 0.5 kg, free fall 760 ± 10 mm,
       automatic release; blows recorded per 75 mm.
  [E1] Reading, Lovell, Spires & Powell (Equipe/Geolabs), "The implications of
       the measurement of energy ratio (Er) for the Standard Penetration Test",
       Ground Engineering, May 2010.  Figure 1 names the parts — anvil, drop
       weight, outer tube/shaft/sleeve, lifting swivel, guide rod, lifting
       pawl.  The common winch-rope hammer trips when its pawls reach A RAISED
       SECTION ON THE GUIDE ROD, and the anvil-to-raised-section distance IS
       the 760 mm drop.  Table 1: whole drive-weight assembly 115 kg; drive
       head/anvil 15–20 kg (BS 1377-9); weights machined from a cylindrical
       steel mass to a pre-determined diameter and length.
  [E2] Archway Engineering SPT trip hammer product page,
       archway-engineering.com/product/spt-trip-hammer/: 63.5 kg weight,
       760 mm free fall, TOTAL 105 kg, 1.8 m unextended / 2.6 m extended, a
       lifting eye at the crown, an outer tube sliding over an inner guide
       shaft, an anvil in a BW or 1½" BSW box, and a safety cross bolt locking
       the sleeve to the guide rod for transport.
  [I2] EN ISO 22476-2 Table 1 (dynamic probing), via insitutek.com's published
       copy.  DPSH-A: hammer 63.5 ± 0.5 kg, drop 500 ± 10 mm, cone base 16 cm²
       / 45.0 ± 0.3 mm, 90° apex, anvil max mass incl. guide rod 18 kg, and
       the one hard geometric rule available for the hammer BODY:
       50 < d < 0.5 D_h, i.e. the body must be more than twice the anvil
       diameter.  Blow rate 15–30/min.  Probe rods max OD 32 mm, max 6 kg/m.
  [C1] `research/rigs/si-rig.md` §4 §5 §6 §9, from the Comacchio GEO 305
       presentation and the KLEMM product range: a BOX-SECTION mast, not a
       lattice; oval lightening slots punched down the mast web; a roller
       CHAIN feed with a tensioner at the foot and a sheave at the top; a
       bolted flat carriage plate; an energy chain down one side; a bellows
       dust boot at the spindle; a welded mesh guard cage with a diagonal
       brace and an interlock; a cluster of red mushroom E-stops in yellow
       housings; no cab, no seat, no glazing; a side-mounted steeply angled
       console of ~10 ball-topped spool levers and round gauges under a
       fabricated shroud; timber dunnage under the feet on nearly every site
       photograph; orange lifting hooks on the track frame.
  [P16] `research/16-site-archetypes.md` via si-rig.md §8 item 7: a
       low-ground-pressure window-sampler variant at ~170 g/cm².  This model's
       track figures produce 168 g/cm² — see GROUND_PRESSURE below.  That is a
       cross-check, not a coincidence: it is what the number is for.

NOT SOURCED, and marked at each use rather than invented: mast cross-section,
track pitch/roller count, cylinder bores, stabiliser stroke, jack pad
diameter, the drop weight's own outside diameter (no manufacturer publishes
it — the figure here is COMPUTED from mass and density and says so), and this
class's paint, of which the sources show three different liveries.

NAMING.  `DOMAIN.md` §10.  Every real designation lives in this comment block
and nowhere else.  No object name, no material name and no exported string
carries a manufacturer or a model number.  Several of the cited photographs
show the model name painted large on the engine hood — that panel is modelled
blank.  Shape is not branding.

AXES.  Blender Z-up; the exporter flips to three.js Y-up.  Blender -Y is the
machine's FORWARD.  Origin is the undercarriage centre at ground level.
"""

import os
import sys
import math

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import bpy                                                    # noqa: E402
import rig as R                                               # noqa: E402

TAU = math.pi * 2
D2R = math.pi / 180.0
C = bpy.context

# ══════════════════════════════════════════════════════════════════════════════
# THE SOURCED ENVELOPE — the model is posed WORKING, so it is the working one
# ══════════════════════════════════════════════════════════════════════════════
LENGTH   = 2.80    # [T1] working 2800 mm (transport 2700 with the mast down)
WIDTH    = 1.00    # [T1] working 1000 mm — the stabilisers deployed.  The
                   # TRACKS are 800 mm, which is what gets it through a
                   # domestic doorway and is the whole reason the machine
                   # exists; the extra 200 mm is feet on the ground.
HEIGHT   = 2.85    # [T1] working 2850 mm.  data.js says 2857.
TRACK_W  = 0.80    # [T1] 800 mm travelling width, over the shoes
MASS_KG  = 1300    # [T1].  data.js transportTons 1.25.

# ── UNDERCARRIAGE ─────────────────────────────────────────────────────────────
SHOE_W    = 0.25   # DERIVED, and cross-checked below — see GROUND_PRESSURE
GAUGE     = TRACK_W - SHOE_W        # 0.55 m centre-to-centre
TRACK_LEN = 1.55   # DERIVED to fit under [T1]'s 2.80 m with the mast standing
                   # entirely ahead of it
IDLER_R   = 0.155  # DERIVED from TRACK_LEN with a four-roller bottom run
SHOE_T    = 0.030
GROUSER_H = 0.022  # rubber pads: low and blunt.  This machine works on lawns,
                   # car parks and pontoons, not on rock.
SHOE_PITCH = 0.095
ROLLER_N  = 4
UC_Z      = GROUSER_H   # the whole undercarriage is lifted by one grouser
                        # height so that z = 0 is the plane the machine STANDS
                        # on and not the mid-plane of a track pad.  Without it
                        # the model's own bounding box starts 22 mm underground
                        # and every height read off it is 22 mm long.

# THE CROSS-CHECK.  `research/rigs/si-rig.md` §9 item 9 flags the shipping
# builder's 200 mm shoes as too narrow for a machine sold on low ground
# pressure, and §8 item 7 records the only sourced figure for the class:
# ~170 g/cm² [P16].  Two tracks of TRACK_LEN x SHOE_W under MASS_KG give:
GROUND_PRESSURE = MASS_KG / (2 * TRACK_LEN * SHOE_W) / 10.0   # g/cm^2
# = 167.7 g/cm^2 against [P16]'s ~170.  SHOE_W is chosen so this lands on the
# sourced figure rather than the other way round; that is what makes 250 mm a
# derived number and not a guessed one.

# ── FRAME AND DECK ────────────────────────────────────────────────────────────
DECK_Z    = 0.42   # NOT SOURCED
FRAME_Z0  = 0.13   # NOT SOURCED
BODY_W    = 0.60   # inboard of the tracks, DERIVED
BODY_Y0   = -0.62  # frame nose (machine forward is -Y)
BODY_Y1   = 1.18   # frame tail
NOSE_Y    = -LENGTH / 2         # -1.40: the guard cage's front face
TAIL_Y    = LENGTH / 2          # +1.40: the rear tracking foot plate

# ── MAST AND FEED ─────────────────────────────────────────────────────────────
GUARD_D   = 0.52   # the rotation guard's fore-aft panel depth, DERIVED
GUARD_R   = 0.014  # its frame tube radius
DRILL_Y   = NOSE_Y + GUARD_D / 2 + GUARD_R    # -1.126.  SOLVED, not placed:  [C1]: the mast foot is at station 0 of the
                   # overall length and overhangs the front of the tracks
                   # ENTIRELY, so the operator can see the collar.  Nothing
                   # else in this fleet puts its mast completely outside its
                   # own wheelbase, and it is the first thing in the
                   # silhouette test.  The guard round its foot is therefore
                   # the machine's front face, and [T1]'s 2800 mm working
                   # length is measured over it, so the drill axis follows from
                   # the guard rather than the guard being hung off a guessed
                   # drill axis.
MAST_Z0   = 0.28   # mast foot / drill table height, DERIVED
MAST_LEN  = 2.40   # data.js mastM 2.40; [T2] gives the class 2.22–2.85 m
CROWN_H   = HEIGHT - (MAST_Z0 + MAST_LEN)   # 0.17 — the mast head, SOLVED so
                                            # the top of the machine lands on
                                            # [T1]'s 2850 mm working height
MAST_W, MAST_D = 0.20, 0.16     # box section.  [C1]: A FABRICATED RECTANGULAR
                                # BOX WITH FLAT SIDE PLATES — "it is not a
                                # truss and must not be modelled as one".
                                # The section itself is NOT SOURCED.
FEED_STROKE = 1.30 # [T2] "1.3 m stroke"
CARR_Z0   = 0.62   # bottom of carriage travel, DERIVED: the head's spindle
                   # nose clears the drill table and the clamp
MAST_DUMP = 0.30   # [T2] "300 mm hydraulic mast dump" — the whole mast slides
                   # down its carrier so the rig can track hole-to-hole with
                   # the mast still up.  A real, named, animatable feature.
ROD_LEN   = 1.00   # data.js rodLenM 1.0
ROD_R     = 0.0413 / 2          # [A1] "A" rod, 41.3 mm OD — the minimum
                                # stiffness ASTM allows for SPT sampling rods
N_RODS    = 10     # [T2] "built-in workpiece clamp and rod racking".  A
                   # working store, not the whole hole: data.js says the rods
                   # are handed up by the second man, and a 1.3 t machine does
                   # not carry 40 m of steel.

# ── THE SPT HAMMER — the method, not a prop ───────────────────────────────────
SPT_KG     = 63.5           # [A1] 140 lbf; [A2] 63.5 +/- 0.5 kg
SPT_DROP   = 0.760          # [A1] 30 in +/- 1.0; [A2] 760 +/- 10 mm
# THE DROP WEIGHT'S OWN DIAMETER IS NOT PUBLISHED BY ANYONE.  Rather than
# invent one, it is COMPUTED: 63.5 kg of steel at 7850 kg/m^3 is 8.089 litres,
# and with a bore for the guide rod that fixes length once diameter is chosen.
# [I2]'s anvil rule (50 < d < 0.5 D_h) puts a hard floor of ~100 mm on the body
# and practice puts it at 150-250; 200 mm is taken and the LENGTH then follows
# from the mass instead of being chosen too.  Labelled COMPUTED, not sourced.
SPT_W_R    = 0.200 / 2
SPT_BORE_R = 0.050 / 2
SPT_W_LEN  = (SPT_KG / 7850.0) / (math.pi * (SPT_W_R ** 2 - SPT_BORE_R ** 2))
SPT_BAR_R  = 0.048 / 2      # the stainless guide bar.  [T2]: a SINGLE bar on
                            # this generation, two on the earlier one.  Its
                            # diameter is NOT SOURCED.
SPT_ANVIL_R = 0.070 / 2     # [I2] anvil d > 50 mm and < half the body; 70 mm
                            # sits inside that window.  NOT independently
                            # sourced.
SPT_BAR_LEN = SPT_DROP + SPT_W_LEN + 0.34   # drop + weight + anvil and trip
                                            # head.  [E2]'s complete hammer is
                                            # 1.8 m unextended, which this sits
                                            # comfortably inside.
SPT_Z0     = 0.42           # anvil face height, DERIVED — the hammer sits on
                            # the rod at the collar

# ── THE SPLIT-BARREL SAMPLER ──────────────────────────────────────────────────
SPOON_OD   = 0.0508         # [A1] Fig. 2 dimension F, 50.8 mm
SPOON_LEN  = 0.610          # [A1] B is 457-762 mm; the EN ISO sampler is sold
                            # at 610 mm and that is the middle of the range
SPOON_TAPER = 20.0 * D2R    # [A1] G, 16-23 degrees

# ── ROTARY HEAD ───────────────────────────────────────────────────────────────
HEAD_TORQUE_NM = 2240       # [T2] the 150 cc motor option, 2240 Nm at 35 rpm.
                            # data.js torque 2.2 (kNm) is this number.
HEAD_RPM_MAX   = 600        # [T2] 140 Nm at 600 rpm on the small motor
GUIDE_RING_ID  = 0.200      # [T2] "guide ring 200 mm effective ID"

# ── STABILISERS ───────────────────────────────────────────────────────────────
# [T2] "folding stabiliser legs with ball-jointed adjustable jack feet".  Four
# of them, deployed, and it is the deployed feet that take [T1]'s working width
# from the tracks' 800 mm to 1000 mm.
JACK_STROKE = 0.30          # NOT SOURCED
JACK_PAD_R  = 0.085         # NOT SOURCED
JACK_X      = WIDTH / 2 - JACK_PAD_R    # the OUTER EDGE OF THE DEPLOYED PAD is
                                        # [T1]'s 1000 mm working width, so the
                                        # leg position is solved from the pad
                                        # rather than the pad hung off a guessed
                                        # leg position
JACK_YF     = -0.72
JACK_YR     = 1.06


# ══════════════════════════════════════════════════════════════════════════════
# helpers layered on lib/rig.py — same contract as blender/crawler_th.py
# ══════════════════════════════════════════════════════════════════════════════

def _apply_mods(o, seg=None):
    """Bake modifiers into the mesh NOW — `finish()`'s join keeps only the
    ACTIVE object's modifier stack, so an unapplied bevel anywhere else is
    silently thrown away and the machine reads as cardboard."""
    if not o.modifiers:
        return o
    if seg is not None:
        for m in o.modifiers:
            if m.type == 'BEVEL':
                m.segments = seg
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    C.view_layer.objects.active = o
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    return o


def bx(name, size, mat=R.MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
       bevel=0.008, seg=None):
    """A bevelled box in TRUE METRES.

    `rig.box()` was probed at the start of this build (2026-09-05):
    `box((4,2,10))` exports at (4.000, 2.000, 10.000).  It is fixed, so there
    is NO local compensation here and there must never be one.  The default
    bevel is smaller than `crawler_th.py`'s because this machine is a third of
    that one's size and an 12 mm chamfer on a 200 mm mast is a bullnose.
    """
    return _apply_mods(R.box(name, size, mat, parent, loc, rot, bevel), seg)


def tb(name, radius, length, mat=R.MAT_STEEL, parent=None, loc=(0, 0, 0),
       rot=(0, 0, 0), sides=12):
    return R.tube(name, radius, length, mat, parent, loc, rot, sides)


def clone(src, loc, rot=(0, 0, 0), parent=None, name=None):
    o = src.copy()
    o.name = name or (src.name + '_c')
    o.location = loc
    o.rotation_euler = rot
    o.parent = parent if parent is not None else src.parent
    C.collection.objects.link(o)
    return o


def curve_to_mesh(o):
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    C.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    return C.active_object


def weld(objs, label, parent):
    """Join one moving subassembly's meshes by material.  `finish()` leaves
    everything under a `pivot:`/`slide:` alone because it has to move
    independently, but everything inside ONE moving node moves together and can
    be joined exactly the way the statics are."""
    groups = {}
    for o in objs:
        if o is None or o.type != 'MESH':
            continue
        key = o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault(key, []).append(o)
    out = []
    for key, grp in groups.items():
        if len(grp) > 1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in grp:
                o.select_set(True)
            C.view_layer.objects.active = grp[0]
            bpy.ops.object.join()
        a = grp[0]
        a.name = label + ':' + key
        a.parent = parent
        out.append(a)
    return out


def hz(name, size, parent, loc, rot=(0, 0, 0)):
    return bx(name, size, R.MAT_HAZARD, parent, loc, rot, bevel=0.003)


def ram(name, parent, base, tip, barrel_r=0.036, rod_r=0.020,
        mat_b=R.MAT_DARK, mat_eye=R.MAT_CAST):
    """A hydraulic cylinder drawn between two points: barrel, bare chrome rod,
    gland nut, two cast eye-ends.  Cylinder rods are the brightest thing on a
    working machine and the eye finds them first, so they get their own
    material."""
    bxx, byy, bzz = base
    dx, dy, dz = tip[0] - bxx, tip[1] - byy, tip[2] - bzz
    L = math.sqrt(dx * dx + dy * dy + dz * dz)
    ry = math.atan2(math.sqrt(dx * dx + dy * dy), dz)
    # rz is atan2(dy, dx) and NOT atan2(dy, dx) - pi/2.  The version with the
    # -pi/2 is inherited from an earlier machine in this directory and it is
    # WRONG BY 90 DEGREES IN PLAN: `tube()` builds along local +Z, and with
    # Blender's XYZ euler order (R = Rz.Ry.Rx) that axis lands at
    # (sin ry cos rz, sin ry sin rz, cos ry), so rz must be atan2(dy, dx)
    # outright.  Measured 2026-09-05: a ram asked to run from (0.13, 0.30,
    # 0.48) to (0.09, -0.72, 0.58) came out at (-0.889, 0.360, 0.580) with the
    # subtraction and (0.070, -0.719, 0.580) without it.
    rz = math.atan2(dy, dx)
    rot = (0.0, ry, rz)
    bl = L * 0.58
    f = bl / L
    return [
        tb(name + '_barrel', barrel_r, bl, mat_b, parent, base, rot, 10),
        tb(name + '_rod', rod_r, L, R.MAT_CHROME, parent, base, rot, 8),
        tb(name + '_gland', barrel_r * 1.18, 0.035, R.MAT_WORN, parent,
           (bxx + dx * f, byy + dy * f, bzz + dz * f), rot, 10),
        tb(name + '_eyeA', barrel_r * 1.06, 0.05, mat_eye, parent, base,
           (rot[0], rot[1] + math.pi / 2, rot[2]), 8),
        tb(name + '_eyeB', rod_r * 1.8, 0.042, mat_eye, parent, tip,
           (rot[0], rot[1] + math.pi / 2, rot[2]), 8),
    ]


def lamp(name, parent, loc, aim, cone=54, rng=18, watt=50):
    """A work light plus the two named nodes `src/core/env.js` reads EVERY
    FRAME to re-aim its spotlight.

    `feed-work-light` must be built FIRST and carry exactly that string:
    env.js (~512) binds its key light to that name for every machine that is
    not a jumbo or a longhole rig, and falls back to the ORDINAL when the name
    misses.  On this machine it rides `pivot:mast`, so it sweeps when the mast
    rakes — which is the whole point of the named-node contract.
    """
    mount, aimnode = R.worklight(name, parent, loc, aim, cone, rng)
    mount['watt_w'] = watt
    mount['colour_hex'] = 0xFFE9C0
    m = [
        bx(name + '_stalk', (0.026, 0.026, 0.11), R.MAT_DARK, mount,
           (0, 0, -0.070)),
        bx(name + '_shell', (0.17, 0.09, 0.12), R.MAT_DARK, mount, (0, 0.015, 0)),
        bx(name + '_lens', (0.14, 0.010, 0.09), R.MAT_GLASS, mount,
           (0, -0.040, 0)),
        bx(name + '_barH', (0.18, 0.009, 0.009), R.MAT_WORN, mount,
           (0, -0.053, 0.056), bevel=0.0),
    ]
    for i in range(3):
        m.append(bx(name + '_bar%d' % i, (0.009, 0.009, 0.13), R.MAT_WORN,
                    mount, (-0.055 + i * 0.055, -0.053, 0), bevel=0.0))
    return mount, aimnode, m


# ══════════════════════════════════════════════════════════════════════════════
# 1 — UNDERCARRIAGE.  800 mm, and that is the machine's reason to exist.
# ══════════════════════════════════════════════════════════════════════════════

def build_undercarriage():
    """Rubber tracks on a plain welded box frame.

    [T1] sells the 800 mm travelling width on going through a domestic
    doorway, so the undercarriage is not a scaled-down excavator: it is narrow,
    long and low, with wide shoes for the ~170 g/cm² this class advertises
    ([P16], and see GROUND_PRESSURE above).  [C1] adds the two details that
    make a small track frame read as real: a visible row of bottom rollers, and
    ORANGE LIFTING / TIE-DOWN HOOKS welded to the frame — small, bright, and
    the only orange on the machine.
    """
    a = (TRACK_LEN - 2 * IDLER_R) / 2.0
    parts = []
    for s in (-1, 1):
        x = s * GAUGE / 2.0
        side = 'l' if s < 0 else 'r'
        parts.append(bx('tf_%s' % side, (SHOE_W * 0.50, TRACK_LEN * 0.84, 0.16),
                        R.MAT_DARK, None, (x, 0.15, UC_Z + IDLER_R + 0.01), bevel=0.010))
        parts.append(tb('sprk_%s' % side, IDLER_R * 0.80, SHOE_W * 0.46,
                        R.MAT_WORN, None, (x, 0.15 + a, UC_Z + IDLER_R),
                        (0, math.pi / 2, 0), 12))
        parts.append(tb('idlr_%s' % side, IDLER_R * 0.74, SHOE_W * 0.44,
                        R.MAT_WORN, None, (x, 0.15 - a, UC_Z + IDLER_R),
                        (0, math.pi / 2, 0), 12))
        for t in range(9):
            ang = TAU * t / 9.0
            parts.append(bx('sprkt_%s%d' % (side, t),
                            (0.030, 0.030, SHOE_W * 0.44), R.MAT_WORN, None,
                            (x - SHOE_W * 0.22,
                             0.15 + a + math.sin(ang) * IDLER_R * 0.84,
                             UC_Z + IDLER_R + math.cos(ang) * IDLER_R * 0.84),
                            (0, math.pi / 2, ang), bevel=0.0))
        for i in range(ROLLER_N):
            f = (i + 0.5) / ROLLER_N
            y = 0.15 - a * 0.92 + f * a * 1.84
            parts.append(tb('rr_%s%d' % (side, i), 0.052, SHOE_W * 0.40,
                            R.MAT_WORN, None, (x, y, UC_Z + 0.055),
                            (0, math.pi / 2, 0), 8))
        # the orange lifting / tie-down hook [C1]
        parts.append(bx('hook_%s' % side, (0.03, 0.10, 0.06), R.MAT_HAZARD,
                        None, (x - s * SHOE_W * 0.24, 0.15 - a * 0.55,
                               UC_Z + IDLER_R + 0.10), bevel=0.006))
        parts.append(bx('hook2_%s' % side, (0.03, 0.10, 0.06), R.MAT_HAZARD,
                        None, (x - s * SHOE_W * 0.24, 0.15 + a * 0.55,
                               UC_Z + IDLER_R + 0.10), bevel=0.006))

    shoe = bx('shoe_src', (SHOE_W, SHOE_PITCH * 0.92, SHOE_T), R.MAT_RUBBER,
              None, (0, 0, -60), bevel=0.004, seg=1)
    bar = bx('bar_src', (SHOE_W * 0.88, SHOE_PITCH * 0.32, GROUSER_H),
             R.MAT_RUBBER, None, (0, 0, -60), bevel=0.003, seg=1)
    n_str = max(2, int(round(2 * a / SHOE_PITCH)))
    n_arc = 7
    for s in (-1, 1):
        x = s * GAUGE / 2.0
        side = 'l' if s < 0 else 'r'
        k = 0
        for run, zc in ((0, UC_Z + SHOE_T / 2),
                        (1, UC_Z + 2 * IDLER_R - SHOE_T / 2)):
            for i in range(n_str):
                y = 0.15 - a + (i + 0.5) * (2 * a / n_str)
                rz = 0.0 if run == 0 else math.pi
                clone(shoe, (x, y, zc), (rz, 0, 0), None, 'sh_%s%d' % (side, k))
                clone(bar, (x, y, zc + (-1 if run == 0 else 1) *
                            (SHOE_T / 2 + GROUSER_H / 2)),
                      (rz, 0, 0), None, 'bar_%s%d' % (side, k))
                k += 1
        for end, yc in ((0, 0.15 - a), (1, 0.15 + a)):
            for i in range(n_arc):
                ang = math.pi * (i + 0.5) / n_arc + (math.pi if end else 0)
                cy = yc + math.sin(ang) * (IDLER_R - SHOE_T / 2) * (-1 if end else 1)
                cz = UC_Z + IDLER_R - math.cos(ang) * (IDLER_R - SHOE_T / 2)
                rot = (ang * (-1 if end else 1) + (math.pi if end else 0), 0, 0)
                clone(shoe, (x, cy, cz), rot, None, 'sh_%s%d' % (side, k))
                k += 1
    bpy.data.objects.remove(shoe, do_unlink=True)
    bpy.data.objects.remove(bar, do_unlink=True)
    return parts


# ══════════════════════════════════════════════════════════════════════════════
# 2 — CHASSIS, DECK, ENGINE HOOD, CONSOLE
# ══════════════════════════════════════════════════════════════════════════════

def build_body():
    """The deck, the hood and — the machine's actual FACE — the lever console.

    [C1] and [T2] agree and the shipping builder does not: the primary
    interface on this class is a FIXED, SIDE-MOUNTED, STEEPLY ANGLED LEVER
    CONSOLE with about ten black ball-topped spool levers, two or three round
    pressure gauges, on a pedestal at standing height under a fabricated
    shroud.  [T2] adds that the console was moved forward for good visibility
    of the borehole and that the tracking controls live at the REAR on a
    folding foot plate — two separate control positions, which is why a driller
    walks round this machine all day.  `research/rigs/si-rig.md` §9 item 3
    records that the game replaces the console with a handheld pendant; the
    pendant is a real option ([C1] radio remote) but it is not the face.

    THERE IS NO CAB, NO SEAT AND NO GLAZING on this machine (§9 item 12 records
    that the game already gets this right).  The only `glass` in this model is
    lamp lenses and two gauge faces.
    """
    g = []
    g.append(bx('chassis', (BODY_W, BODY_Y1 - BODY_Y0, DECK_Z - FRAME_Z0),
                R.MAT_DARK, None,
                (0, (BODY_Y0 + BODY_Y1) / 2, (FRAME_Z0 + DECK_Z) / 2),
                bevel=0.012))
    g.append(bx('deck', (BODY_W + 0.06, BODY_Y1 - BODY_Y0, 0.030), R.MAT_WORN,
                None, (0, (BODY_Y0 + BODY_Y1) / 2, DECK_Z + 0.015), bevel=0.005))

    # ── engine / hydraulic hood, rear two-thirds of the deck ────────────────
    # [T1] a 19 hp three-cylinder diesel.  [C1]: a low rectangular enclosure
    # with LOUVRED side panels, hinged access doors with latches and grab
    # handles, and a flat top used as a work surface.  THE BADGE PANEL ON THE
    # REAL MACHINE'S HOOD IS LEFT BLANK HERE — see the naming note above.
    hood_y0, hood_y1 = 0.16, BODY_Y1 - 0.04
    hood_h = 0.44
    g.append(bx('hood', (BODY_W + 0.02, hood_y1 - hood_y0, hood_h), R.MAT_PAINT,
                None, (0, (hood_y0 + hood_y1) / 2, DECK_Z + hood_h / 2 + 0.03),
                bevel=0.016))
    g.append(bx('hood_lid', (BODY_W + 0.07, hood_y1 - hood_y0 + 0.04, 0.022),
                R.MAT_WORN, None,
                (0, (hood_y0 + hood_y1) / 2, DECK_Z + hood_h + 0.045),
                bevel=0.005))
    louvre = bx('lv_src', (0.010, 0.055, hood_h * 0.58), R.MAT_DARK, None,
                (0, 0, -60), bevel=0.0, seg=1)
    for s in (-1, 1):
        for i in range(7):
            clone(louvre, (s * (BODY_W / 2 + 0.014),
                           hood_y0 + 0.16 + i * 0.075,
                           DECK_Z + hood_h / 2 + 0.03),
                  parent=None, name='lv%d%d' % (s, i))
    bpy.data.objects.remove(louvre, do_unlink=True)
    # hinges, latch and grab handle on the port door
    for i in range(2):
        g.append(bx('hood_hinge%d' % i, (0.016, 0.05, 0.03), R.MAT_WORN, None,
                    (-(BODY_W / 2 + 0.02), hood_y0 + 0.14 + i * 0.52,
                     DECK_Z + hood_h - 0.02), bevel=0.004))
    g.append(tb('hood_handle', 0.012, 0.13, R.MAT_WORN, None,
                (-(BODY_W / 2 + 0.04), hood_y0 + 0.42, DECK_Z + 0.16),
                (0, 0, 0), 6))
    # vertical exhaust with a rain cap [C1]
    g.append(tb('exh', 0.028, 0.40, R.MAT_WORN, None,
                (0.20, hood_y1 - 0.10, DECK_Z + hood_h + 0.05), (0, 0, 0), 8))
    g.append(tb('exh_cap', 0.040, 0.03, R.MAT_WORN, None,
                (0.20, hood_y1 - 0.10, DECK_Z + hood_h + 0.45), (0, 0, 0), 8))

    # ── THE LEVER CONSOLE, port side, forward, facing the collar ────────────
    cy = -0.24
    cx = -(BODY_W / 2 + 0.08)   # SOLVED, not placed: the console is the widest
                                # thing above the deck and it has to stay
                                # inside [T1]'s 1000 mm working width
    g.append(tb('con_pedestal', 0.034, 0.62, R.MAT_DARK, None,
                (cx, cy, DECK_Z - 0.06), (0, 0, 0), 8))
    g.append(bx('con_panel', (0.24, 0.34, 0.045), R.MAT_PAINT, None,
                (cx, cy, DECK_Z + 0.58), (-0.62, 0, 0), bevel=0.008))
    g.append(bx('con_shroud', (0.22, 0.10, 0.18), R.MAT_PAINT, None,
                (cx, cy + 0.17, DECK_Z + 0.70), (-0.30, 0, 0), bevel=0.008))
    # ~10 black ball-topped spool levers [C1]
    for i in range(10):
        lx = cx - 0.088 + (i % 5) * 0.044
        ly = cy - 0.06 + (i // 5) * 0.13
        g.append(tb('lev%d' % i, 0.008, 0.16, R.MAT_WORN, None,
                    (lx, ly, DECK_Z + 0.60), (-0.62, 0, 0), 6))
        g.append(tb('levk%d' % i, 0.015, 0.030, R.MAT_RUBBER, None,
                    (lx, ly + 0.093, DECK_Z + 0.73), (-0.62, 0, 0), 8))
    # two round pressure gauges — the only glass on the machine besides lenses
    for i in range(2):
        g.append(tb('gauge%d' % i, 0.032, 0.030, R.MAT_DARK, None,
                    (cx - 0.07 + i * 0.14, cy + 0.16, DECK_Z + 0.70),
                    (-0.30, 0, 0), 10))
        g.append(tb('gaugef%d' % i, 0.027, 0.006, R.MAT_GLASS, None,
                    (cx - 0.07 + i * 0.14, cy + 0.168, DECK_Z + 0.715),
                    (-0.30, 0, 0), 10))
    # the red mushroom E-stop in its yellow housing [C1]
    g.append(bx('estop_box', (0.065, 0.065, 0.055), R.MAT_HAZARD, None,
                (cx + 0.14, cy - 0.20, DECK_Z + 0.60), bevel=0.006))
    g.append(tb('estop', 0.024, 0.020, R.MAT_HAZARD, None,
                (cx + 0.14, cy - 0.20, DECK_Z + 0.63), (0, 0, 0), 10))

    # ── tracking controls at the REAR, on a folding foot plate [T2] ─────────
    g.append(bx('trk_plate', (0.44, 0.24, 0.020), R.MAT_WORN, None,
                (0, BODY_Y1 + 0.10, DECK_Z - 0.14), bevel=0.004))
    g.append(bx('trk_panel', (0.26, 0.10, 0.16), R.MAT_PAINT, None,
                (0, BODY_Y1 - 0.02, DECK_Z + 0.14), (-0.4, 0, 0), bevel=0.006))
    for s in (-1, 1):
        g.append(tb('trk_lev%d' % s, 0.008, 0.14, R.MAT_WORN, None,
                    (s * 0.07, BODY_Y1 - 0.02, DECK_Z + 0.20), (-0.4, 0, 0), 6))
        g.append(tb('trk_knob%d' % s, 0.016, 0.026, R.MAT_RUBBER, None,
                    (s * 0.07, BODY_Y1 + 0.03, DECK_Z + 0.32), (-0.4, 0, 0), 8))

    # ── the flush pump on the deck ──────────────────────────────────────────
    # The class carries its water pump on the deck (GEO 205's two deck pumps;
    # Geomachine's 50 bar / 50 l/min on every model) and the swivel is integral
    # to the head ([T2] "3/4 in integral side-inlet air/water swivel").  Sized
    # from the class, not from a datasheet for THIS machine — DERIVED.
    g.append(bx('pump_body', (0.22, 0.30, 0.20), R.MAT_CAST, None,
                (0.02, -0.02, DECK_Z + 0.13), bevel=0.010))
    g.append(tb('pump_head', 0.062, 0.14, R.MAT_CAST, None,
                (0.02, -0.16, DECK_Z + 0.13), (-math.pi / 2, 0, 0), 10))
    for i in range(9):
        t = i / 8.0
        ang = t * TAU * 2.4
        tb('wcoil%d' % i, 0.015, 0.07, R.MAT_RUBBER, None,
           (0.20 + math.cos(ang) * 0.085, 0.62,
            DECK_Z + 0.20 + math.sin(ang) * 0.085), (-math.pi / 2, 0, 0), 6)

    # ── dunnage.  Not scruff — it is how the machine is levelled ────────────
    # [C1]: timber sleepers and offcuts under the feet on nearly every site
    # photograph in the reference set.
    for i, (dx, dy) in enumerate(((-JACK_X, JACK_YF), (JACK_X, JACK_YF),
                                  (-JACK_X, JACK_YR), (JACK_X, JACK_YR))):
        g.append(bx('dunnage%d' % i, (JACK_PAD_R * 2, 0.22, 0.045),
                    R.MAT_WORN, None, (dx, dy, 0.0225), bevel=0.004))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 3 — THE MAST.  Front-mounted, entirely outside the tracks.
# ══════════════════════════════════════════════════════════════════════════════

def build_mast():
    """`pivot:mast` — a box-section mast on a curved tubular boom.

    [C1] is emphatic and the shipping builder disagrees on both counts: the
    mast is a FABRICATED RECTANGULAR BOX with flat side plates, not a truss;
    and it is carried on a BENT TUBULAR BOOM that arcs up and over the front,
    with a mast-fold cylinder between the deck and the boom.  The mast foot
    stands at station 0 of the overall length, ahead of the tracks entirely.

    The feed is a ROLLER CHAIN on bolted-on guide rails, with a tensioner at
    the foot and a sheave at the top — not a rack, not a bare cylinder.  A
    visible chain is the clearest possible statement of how the head moves, and
    it costs triangles in a material the machine already owns.

    `pivot:mast` is the string `src/core/gltfRig.js` binds (makeDyn ~579), so a
    more descriptive name would leave the mast undrivable.  `slide:mast-dump`
    under it is [T2]'s 300 mm hydraulic mast dump — the whole mast drops on its
    carrier so the rig can track hole to hole without laying the mast down.

    Returns (pivot, dump, mast_group).
    """
    piv = R.empty(R.NODE_PIVOT, 'mast', None, (0, DRILL_Y, MAST_Z0))
    piv['axis'] = 'x'
    piv['angle_min_deg'] = 45      # [T2] the rotary machine's inclination
    piv['angle_max_deg'] = 90      # range is 45-90 degrees
    piv['length_m'] = MAST_LEN

    dump = R.empty(R.NODE_SLIDE, 'mast-dump', piv, (0, 0, 0))
    dump['travel_m'] = MAST_DUMP
    dump['axis'] = 'z'

    g = []
    # ── the box-section mast ────────────────────────────────────────────────
    g.append(bx('mast_web', (MAST_W, MAST_D, MAST_LEN), R.MAT_PAINT, dump,
                (0, 0, MAST_LEN / 2), bevel=0.006))
    # OVAL LIGHTENING SLOTS punched down the flat mast plate [C1] — "the
    # cheapest single detail that makes the mast read as a real fabrication
    # rather than an extruded primitive".  Cut as recesses in the same
    # material, so they are triangles and no draw call.
    # EVERY CLONE BELOW IS APPENDED TO `g`.  Anything under a `pivot:`/`slide:`
    # is excluded from `finish()`'s join by design, so a clone that is not
    # handed to `weld()` is its own draw call: the first build of this machine
    # came out at 200 primitives against a budget of 70 for exactly this
    # reason, and 162 of them were chain links, mast slots and cable-chain
    # segments hanging off `slide:mast-dump`.
    slot = bx('slot_src', (MAST_W + 0.012, 0.052, 0.15), R.MAT_DARK, None,
              (0, 0, -60), bevel=0.020, seg=1)
    for i in range(11):
        g.append(clone(slot, (0, 0, 0.30 + i * 0.185), parent=dump,
                       name='mslot%d' % i))
    bpy.data.objects.remove(slot, do_unlink=True)

    # bolted-on guide rails the carriage runs on
    for s in (-1, 1):
        g.append(bx('mast_rail%d' % s, (0.026, 0.042, MAST_LEN - 0.10),
                    R.MAT_STEEL, dump,
                    (s * (MAST_W / 2 + 0.012), -MAST_D / 2 - 0.020,
                     MAST_LEN / 2), bevel=0.003))

    # ── the feed chain, its tensioner and the mast-top sheave [C1] ──────────
    # The crown.  [T1]'s 2850 mm working height is measured to the TOP OF THE
    # MAST HEAD, not to the top of the beam, so CROWN_H is solved rather than
    # chosen: it is exactly what is left over.  The sheave and the rod-guide
    # head live in it.
    g.append(bx('mast_crown', (MAST_W + 0.05, MAST_D + 0.06, CROWN_H),
                R.MAT_PAINT, dump, (0, 0, MAST_LEN + CROWN_H / 2), bevel=0.008))
    g.append(tb('feed_sheave', 0.052, 0.030, R.MAT_CAST, dump,
                (0, -MAST_D / 2 - 0.055, MAST_LEN - 0.09),
                (0, math.pi / 2, 0), 12))
    g.append(bx('sheave_block', (0.09, 0.10, 0.12), R.MAT_CAST, dump,
                (0, -MAST_D / 2 - 0.055, MAST_LEN - 0.09), bevel=0.006))
    g.append(tb('chain_tension', 0.044, 0.026, R.MAT_CAST, dump,
                (0, -MAST_D / 2 - 0.055, 0.10), (0, math.pi / 2, 0), 12))
    link = bx('link_src', (0.020, 0.010, 0.034), R.MAT_STEEL, None,
              (0, 0, -60), bevel=0.0, seg=1)
    for run, xo in ((0, -0.011), (1, 0.011)):
        for i in range(44):
            g.append(clone(link, (xo, -MAST_D / 2 - 0.055,
                                  0.10 + i * (MAST_LEN - 0.20) / 43.0),
                           parent=dump, name='chain%d_%d' % (run, i)))
    bpy.data.objects.remove(link, do_unlink=True)

    # ── the energy chain: a black segmented drag chain down one side [C1] ───
    # "a strong vertical black stripe against the pale mast, for almost no
    # geometry" — and it is rubber, which this machine already owns.
    seg = bx('ec_src', (0.05, 0.06, 0.055), R.MAT_RUBBER, None, (0, 0, -60),
             bevel=0.006, seg=1)
    for i in range(22):
        g.append(clone(seg, (MAST_W / 2 + 0.048, MAST_D / 2 + 0.03,
                             0.16 + i * 0.075),
                       parent=dump, name='ec%d' % i))
    bpy.data.objects.remove(seg, do_unlink=True)

    # ── the drill table and the break-out / rod clamp at the foot ──────────
    # [C1]: two opposed jaws at ground level ahead of the tracks; clamp range
    # for this class is 45-220 mm, so these are small jaws, not pile-rig jaws.
    # It is the object the crew's hands are always near and it sells the scale.
    g.append(bx('table', (0.46, 0.34, 0.045), R.MAT_WORN, dump,
                (0, 0, -0.10), bevel=0.006))
    g.append(bx('clamp_body', (0.34, 0.24, 0.11), R.MAT_DARK, dump,
                (0, 0, -0.03), bevel=0.008))
    for s in (-1, 1):
        g.append(bx('clamp_jaw%d' % s, (0.07, 0.14, 0.075), R.MAT_STEEL, dump,
                    (s * 0.062, 0, -0.03), bevel=0.004))
        g.append(tb('clamp_ram%d' % s, 0.020, 0.10, R.MAT_CHROME, dump,
                    (s * 0.17, 0, -0.03), (0, -s * math.pi / 2, 0), 8))
    # the guide ring, 200 mm effective ID [T2]
    g.append(tb('guide_ring', GUIDE_RING_ID / 2 + 0.018, 0.022, R.MAT_WORN,
                dump, (0, 0, -0.13), (0, 0, 0), 14))

    # ── the curved tubular boom that carries the mast over the front [C1] ──
    # Drawn as a short arc of segments so it reads as a smooth bent tube rather
    # than a straight strut, with a flattened lifting eye at its top.
    for i in range(7):
        t = i / 6.0
        ang = -1.15 + t * 1.15
        px = 0.0
        py = DRILL_Y + 0.10 + (1.0 - math.cos(ang)) * 0.72
        pz = MAST_Z0 + 0.20 + math.sin(ang + 1.15) * 0.30
        tb('boom%d' % i, 0.045, 0.16, R.MAT_PAINT, None, (px, py, pz),
           (ang + 0.6, 0, 0), 10)
    bx('boom_eye', (0.10, 0.14, 0.03), R.MAT_CAST, None,
       (0, DRILL_Y + 0.12, MAST_Z0 + 0.42), bevel=0.008)
    # the mast-fold cylinder, deck to boom
    ram('mast_fold', None, (0.13, 0.30, DECK_Z + 0.06),
        (0.09, DRILL_Y + 0.44, MAST_Z0 + 0.30), barrel_r=0.036, rod_r=0.020)

    weld(g, 'mast', dump)
    return piv, dump


def build_carriage(dump):
    """`slide:carriage` — the ROTARY HEAD on the feed.

    [C1] item 1 in its warnings table, marked HIGH severity: the shipping
    builder gives this machine a percussive top-hammer DRIFTER, and every
    photograph of the class shows a ROTARY HEAD — a compact gear case with the
    spindle out of the bottom.  A site-investigation rig augers, rotates and
    cores; percussion at the head is an anchor / rock-drill trait and it is the
    wrong machine family.  So: a gear case, a spindle, a bellows dust boot, and
    the water swivel with its gooseneck above.

    `carriage` is the name `gltfRig.js` binds, and `travel_m` is not optional:
    without it the loader flags `carriageNoFlex` and `setCarriage()` would
    otherwise write NaN into a world matrix and the machine would silently
    vanish.

    POSED AT THE TOP OF THE FEED, out of the drill line, because this rig is
    mid-SPT and the hammer is on the rod below it.
    """
    carr = R.empty(R.NODE_SLIDE, 'carriage', dump, (0, 0, CARR_Z0 - MAST_Z0))
    carr['travel_m'] = FEED_STROKE
    carr['axis'] = 'z'
    carr['torque_nm'] = HEAD_TORQUE_NM
    carr['rpm_max'] = HEAD_RPM_MAX
    g = []
    # the flat BOLTED carriage plate that clamps the head to the feed [C1]
    g.append(bx('carr_plate', (MAST_W + 0.09, 0.030, 0.30), R.MAT_STEEL, carr,
                (0, -MAST_D / 2 - 0.036, FEED_STROKE + 0.14), bevel=0.004))
    bolt = tb('bolt_src', 0.010, 0.016, R.MAT_WORN, None, (0, 0, -60),
              (0, math.pi / 2, 0), 6)
    for i in range(6):
        g.append(clone(bolt, ((-0.055 if i % 2 else 0.055),
                              -MAST_D / 2 - 0.055,
                              FEED_STROKE + 0.04 + (i // 2) * 0.10),
                       parent=carr, name='cbolt%d' % i))
    bpy.data.objects.remove(bolt, do_unlink=True)
    # the gear case.  [C1] §6: the head is the single most saturated colour
    # object on the machine and the eye goes to it first — it is `castIron`
    # here, which is what a rotary head housing actually is, and the runtime's
    # palette carries the accent.
    g.append(bx('head_case', (0.28, 0.26, 0.34), R.MAT_CAST, carr,
                (0, -0.12, FEED_STROKE + 0.16), bevel=0.012))
    g.append(bx('head_gearbox', (0.18, 0.15, 0.18), R.MAT_CAST, carr,
                (0.19, -0.12, FEED_STROKE + 0.16), bevel=0.010))
    g.append(tb('head_motor', 0.058, 0.14, R.MAT_DARK, carr,
                (0.26, -0.12, FEED_STROKE + 0.16), (0, math.pi / 2, 0), 12))
    # spindle out of the BOTTOM, with the bellows dust boot [C1]
    g.append(tb('spindle', 0.030, 0.16, R.MAT_STEEL, carr,
                (0, -0.12, FEED_STROKE - 0.16), (0, 0, 0), 10))
    boot = tb('boot_src', 0.052, 0.022, R.MAT_RUBBER, None, (0, 0, -60),
              (0, 0, 0), 10)
    for i in range(4):
        g.append(clone(boot, (0, -0.12, FEED_STROKE - 0.02 - i * 0.026),
                       parent=carr, name='boot%d' % i))
    bpy.data.objects.remove(boot, do_unlink=True)
    # the water swivel and its gooseneck above the head [C1], [T2]
    g.append(tb('swivel', 0.046, 0.11, R.MAT_CAST, carr,
                (0, -0.12, FEED_STROKE + 0.33), (0, 0, 0), 12))
    g.append(tb('gooseneck', 0.020, 0.13, R.MAT_WORN, carr,
                (0, -0.12, FEED_STROKE + 0.39), (-1.1, 0, 0), 8))
    weld(g, 'head', carr)

    # ── the tool anchor.  `gltfRig.js` looks for `mount:tool` first and falls
    # back to the carriage; naming it explicitly is what lets `rig/tools.js`
    # hang a sampler on the spindle rather than on the head's centroid.
    R.empty(R.NODE_MOUNT, 'tool', carr, (0, -0.12, FEED_STROKE - 0.16))
    return carr


# ══════════════════════════════════════════════════════════════════════════════
# 4 — THE SPT HAMMER.  The method the player is performing.
# ══════════════════════════════════════════════════════════════════════════════

def build_spt_hammer(piv):
    """A 63.5 kg split drop weight on a single stainless guide bar.

    `src/sim/drilling.js` counts blows per 75 mm increment, discards two
    increments of seating drive, sums four of test drive into N, and calls
    refusal at 50 blows in one 150 mm increment or 100 over the 450 mm drive.
    That is what this assembly is FOR, so it is posed IN THE DRILL LINE, on the
    rod, with the weight resting on the anvil between blows.

    Sourced construction, part by part:
      * the weight is 63.5 kg [A1][A2] and SPLIT — [T2]'s hammer sheds to
        50 kg by removing eight bolts, so one hammer serves SPT and dynamic
        probing without a spacer bracket.  The split line and its bolts are
        modelled because they are the reason this machine can do both methods.
      * it runs on a SINGLE guide bar [T2]; the earlier generation used two.
      * it trips when its lifting pawls reach A RAISED SECTION ON THE GUIDE
        ROD, and the anvil-to-raised-section distance IS the 760 mm drop [E1].
        That raised section is therefore modelled at exactly SPT_DROP above the
        anvil face — it is a dimension, not a decoration.
      * the anvil is struck STEEL ON STEEL [A1] and sits in a BW / 1½" BSW box
        [E2]; [I2]'s rule 50 < d < 0.5·D_h is what bounds its diameter.
      * a lifting eye at the crown [E2], and a safety cross bolt that locks the
        sleeve to the guide rod for transport [E2].
      * the whole assembly bearing on the rods must stay under 113 ± 5 kg [A1];
        [E2] publishes 105 kg for a complete hammer of this pattern.

    The weight's own OUTSIDE DIAMETER is published by nobody.  It is COMPUTED
    from mass and density here and the comment on SPT_W_LEN says so.

    `pivot:hammer-swing` is real, not convenience: [T2]'s hammer SWINGS OUT OF
    THE DRILL LINE AT ANY HEIGHT, which is how the rotary head gets the hole
    back after a test.  `slide:spt-hammer` is the weight itself, and the game
    drives it 760 mm.
    """
    swing = R.empty(R.NODE_PIVOT, 'hammer-swing', piv,
                    (0, 0, SPT_Z0 - MAST_Z0))
    swing['axis'] = 'z'
    swing['stowed_deg'] = 78        # how far it swings clear of the drill line
    g = []

    # the guide bar, and the raised trip section at exactly the drop height
    g.append(tb('spt_bar', SPT_BAR_R, SPT_BAR_LEN, R.MAT_CHROME, swing,
                (0, 0, 0.06), (0, 0, 0), 12))
    g.append(tb('spt_trip', SPT_BAR_R * 1.7, 0.055, R.MAT_WORN, swing,
                (0, 0, 0.06 + SPT_DROP), (0, 0, 0), 12))
    # the crown: lifting eye and the top cap [E2]
    g.append(bx('spt_crown', (0.11, 0.09, 0.05), R.MAT_CAST, swing,
                (0, 0, 0.06 + SPT_BAR_LEN - 0.02), bevel=0.006))
    g.append(tb('spt_eye', 0.030, 0.020, R.MAT_WORN, swing,
                (0, -0.055, 0.06 + SPT_BAR_LEN + 0.01),
                (math.pi / 2, 0, 0), 10))
    # the anvil — struck steel on steel, in its drive-head box
    g.append(tb('spt_anvil', SPT_ANVIL_R, 0.09, R.MAT_STEEL, swing,
                (0, 0, -0.03), (0, 0, 0), 12))
    g.append(bx('spt_drivehead', (0.13, 0.13, 0.10), R.MAT_CAST, swing,
                (0, 0, -0.09), bevel=0.008))
    # the safety cross bolt [E2]
    g.append(tb('spt_xbolt', 0.008, 0.10, R.MAT_WORN, swing,
                (-0.05, 0, 0.06 + SPT_BAR_LEN - 0.14),
                (0, math.pi / 2, 0), 6))
    # the swing arm back to the mast, and its pin
    g.append(bx('spt_arm', (0.05, 0.20, 0.05), R.MAT_PAINT, swing,
                (0, 0.13, 0.06 + SPT_BAR_LEN - 0.10), bevel=0.006))
    g.append(tb('spt_pin', 0.024, 0.11, R.MAT_CAST, swing,
                (0, 0.23, 0.06 + SPT_BAR_LEN - 0.16), (0, 0, 0), 8))
    weld(g, 'hammer-swing', swing)

    # ── the falling weight itself ───────────────────────────────────────────
    fall = R.empty(R.NODE_SLIDE, 'spt-hammer', swing, (0, 0, 0.06))
    fall['travel_m'] = SPT_DROP
    fall['axis'] = 'z'
    fall['mass_kg'] = SPT_KG
    fall['drop_mm'] = int(SPT_DROP * 1000)
    fall['increment_mm'] = 75       # [A2] blows recorded per 75 mm
    w = []
    # the weight is SPLIT: two halves bolted together, the upper one removable
    # to take it from 63.5 kg to 50 kg [T2]
    w.append(tb('spt_wt_lower', SPT_W_R, SPT_W_LEN * 0.55, R.MAT_WORN, fall,
                (0, 0, 0), (0, 0, 0), 16))
    w.append(tb('spt_wt_upper', SPT_W_R, SPT_W_LEN * 0.45, R.MAT_WORN, fall,
                (0, 0, SPT_W_LEN * 0.55 + 0.004), (0, 0, 0), 16))
    for i in range(8):
        ang = TAU * i / 8.0
        w.append(tb('spt_wbolt%d' % i, 0.007, 0.026, R.MAT_STEEL, fall,
                    (math.cos(ang) * SPT_W_R * 0.82,
                     math.sin(ang) * SPT_W_R * 0.82,
                     SPT_W_LEN * 0.55 - 0.011), (0, 0, 0), 6))
    # the lifting pawls that catch the raised trip section [E1]
    for s in (-1, 1):
        w.append(bx('spt_pawl%d' % s, (0.026, 0.05, 0.08), R.MAT_STEEL, fall,
                    (s * (SPT_BAR_R + 0.020), 0, SPT_W_LEN + 0.04),
                    bevel=0.004))
    w.append(tb('spt_sleeve', SPT_BAR_R * 1.45, SPT_W_LEN + 0.09, R.MAT_STEEL,
                fall, (0, 0, -0.02), (0, 0, 0), 12))
    weld(w, 'spt-hammer', fall)
    return swing, fall


# ══════════════════════════════════════════════════════════════════════════════
# 5 — GUARDING, RODS AND SAMPLERS
# ══════════════════════════════════════════════════════════════════════════════

def build_guard():
    """The rotation guard at the mast foot.

    `research/rigs/si-rig.md` §9 item 2, HIGH severity: the game has no
    guarding at all, and the mesh guard is the most visually dominant single
    structure on the real machine.  On a 4 t Class B crawler that is a walk-in
    cage; on an 800 mm doorway machine there is no room for one, so it is what
    the small machines actually carry — two hinged mesh panels round the
    rotation zone, with an interlock switch, a latch and a grab handle.

    The materials are the point: [C1] §6 records the MESH reading bright and
    slightly bluish while its TUBE FRAME is painted body colour, and says that
    contrast "is most of why the cage looks right".  So the frame is
    `paintedSteel` and the mesh is `rawSteel`, and they are two different
    materials in one assembly on purpose.
    """
    g = []
    gy = DRILL_Y
    h = GUARD_D / 2
    for s in (-1, 1):
        x = s * 0.30
        # painted tube frame
        for zz in (0.14, 0.86):
            g.append(tb('gd_rail%d_%.2f' % (s, zz), GUARD_R, GUARD_D,
                        R.MAT_PAINT, None, (x, gy - h, zz),
                        (-math.pi / 2, 0, 0), 6))
        for yy in (gy - h, gy + h):
            g.append(tb('gd_post%d_%.2f' % (s, yy), GUARD_R, 0.72, R.MAT_PAINT,
                        None, (x, yy, 0.14), (0, 0, 0), 6))
        # the diagonal brace across the panel [C1]
        g.append(tb('gd_brace%d' % s, 0.010, 0.78, R.MAT_PAINT, None,
                    (x, gy - h, 0.14), (-0.73, 0, 0), 6))
        # galvanised mesh infill — bright against the painted frame
        mv = bx('gmv_src', (0.004, 0.004, 0.70), R.MAT_STEEL, None,
                (0, 0, -60), bevel=0.0, seg=1)
        mh = bx('gmh_src', (0.004, 0.50, 0.004), R.MAT_STEEL, None,
                (0, 0, -60), bevel=0.0, seg=1)
        for i in range(9):
            clone(mv, (x, gy - h + 0.01 + i * 0.0625, 0.49), parent=None,
                  name='gmv%d_%d' % (s, i))
        for i in range(12):
            clone(mh, (x, gy, 0.15 + i * 0.0636), parent=None,
                  name='gmh%d_%d' % (s, i))
        bpy.data.objects.remove(mv, do_unlink=True)
        bpy.data.objects.remove(mh, do_unlink=True)
        # hinges, latch, grab handle and the interlock switch
        for i in range(2):
            g.append(bx('gd_hinge%d_%d' % (s, i), (0.020, 0.026, 0.030),
                        R.MAT_WORN, None, (x, gy + h - 0.01, 0.26 + i * 0.44),
                        bevel=0.003))
        g.append(tb('gd_handle%d' % s, 0.010, 0.11, R.MAT_WORN, None,
                    (x + s * 0.020, gy - h + 0.06, 0.54),
                    (-math.pi / 2, 0, 0), 6))
    g.append(bx('gd_interlock', (0.05, 0.04, 0.07), R.MAT_HAZARD, None,
                (0.30, gy + h - 0.02, 0.72), bevel=0.005))
    return g


def build_rods():
    """The on-deck rod rack, a split-barrel sampler and a U100 tube.

    [T2] gives this class a "built-in workpiece clamp and rod racking", and
    data.js says the rods are handed up by the second man because there is no
    carousel — so this is a WORKING STORE beside the operator, not a magazine
    that holds the whole hole.  Ten 1 m rods.

    The samplers are here because they are the method.  The split barrel is
    [A1] Fig. 2: 50.8 mm OD, 610 mm long, with a hardened shoe tapered at 20°
    (the standard allows 16-23°) and the vent/ball-check head at the top.  The
    U100 beside it is the undisturbed sample the same hole also takes.
    """
    g = []
    ry = 0.30
    rx = 0.33
    g.append(bx('rack_tray', (0.30, 0.62, 0.030), R.MAT_DARK, None,
                (rx, ry, DECK_Z + 0.05), bevel=0.005))
    for s in (-1, 1):
        g.append(bx('rack_end%d' % s, (0.30, 0.026, 0.14), R.MAT_DARK, None,
                    (rx, ry + s * 0.30, DECK_Z + 0.11), bevel=0.005))
    rod = tb('rod_src', ROD_R, ROD_LEN, R.MAT_STEEL, None, (0, 0, -60),
             (-math.pi / 2, 0, 0), 10)
    thr = tb('thr_src', ROD_R * 1.20, 0.045, R.MAT_WORN, None, (0, 0, -60),
             (-math.pi / 2, 0, 0), 10)
    # The rods lie fore-and-aft and are 1.00 m long in a 0.62 m tray, so they
    # are laid CENTRED on the tray and overhang it at both ends — which is what
    # a rod on a rack actually does, and what keeps them inside the machine's
    # own 2.80 m.
    for i in range(N_RODS):
        col, row = i % 5, i // 5
        px = rx - 0.10 + col * 0.05
        pz = DECK_Z + 0.09 + row * 0.048
        clone(rod, (px, ry - ROD_LEN / 2, pz), (-math.pi / 2, 0, 0), None,
              'rack_rod%d' % i)
        clone(thr, (px, ry + ROD_LEN / 2 - 0.045, pz),
              (-math.pi / 2, 0, 0), None, 'rack_thr%d' % i)
    bpy.data.objects.remove(rod, do_unlink=True)
    bpy.data.objects.remove(thr, do_unlink=True)

    # ── the split-barrel (SPT) sampler, [A1] Fig. 2 ─────────────────────────
    sx, sy, sz = -rx - 0.02, 0.24, DECK_Z + 0.07
    g.append(tb('spoon_barrel', SPOON_OD / 2, SPOON_LEN, R.MAT_STEEL, None,
                (sx, sy + SPOON_LEN / 2, sz), (-math.pi / 2, 0, 0), 12))
    # the split line down the barrel: it is a SPLIT barrel and that is the
    # whole reason the sample can be got out of it
    for s in (-1, 1):
        g.append(bx('spoon_split%d' % s, (0.004, SPOON_LEN, 0.004),
                    R.MAT_WORN, None,
                    (sx + s * SPOON_OD / 2, sy, sz), bevel=0.0))
    # the hardened shoe, tapered 16-23 deg [A1] dimension G
    bpy.ops.mesh.primitive_cone_add(
        radius1=SPOON_OD / 2, radius2=0.0349 / 2,
        depth=(SPOON_OD / 2 - 0.0349 / 2) / math.tan(SPOON_TAPER), vertices=12)
    o = C.active_object
    R.part('spoon_shoe', o, R.MAT_STEEL, None,
           (sx, sy - SPOON_LEN / 2 - 0.02, sz), (math.pi / 2, 0, 0))
    g.append(o)
    # the vent / ball-check head [A1] requires both
    g.append(tb('spoon_head', SPOON_OD / 2 * 1.15, 0.05, R.MAT_CAST, None,
                (sx, sy + SPOON_LEN / 2, sz), (-math.pi / 2, 0, 0), 12))

    # ── a U100 undisturbed tube beside it ───────────────────────────────────
    ux = -(WIDTH / 2 - 0.108 / 2 - 0.006)   # kept inside the sourced 1.00 m
    g.append(tb('u100', 0.104 / 2, 0.45, R.MAT_WORN, None,
                (ux, sy + 0.10, sz + 0.01), (-math.pi / 2, 0, 0), 12))
    g.append(tb('u100_cap', 0.108 / 2, 0.02, R.MAT_RUBBER, None,
                (ux, sy + 0.10, sz + 0.01), (-math.pi / 2, 0, 0), 12))
    return g


def build_string():
    """The rod standing in the hole, with the split spoon under it.

    The machine is mid-SPT: one 1 m rod up out of the collar with the hammer's
    drive head on top of it, so the drill line reads as continuous from the
    weight all the way into the ground.  The rod stops at z = 0 — the world
    below belongs to `world/geology.js`, and anything hanging under the origin
    would make this machine's own bounding box lie about its height.
    """
    g = []
    g.append(tb('string_rod', ROD_R, SPT_Z0 - 0.09, R.MAT_STEEL, None,
                (0, DRILL_Y, 0.0), (0, 0, 0), 10))
    g.append(tb('string_thr', ROD_R * 1.20, 0.05, R.MAT_WORN, None,
                (0, DRILL_Y, SPT_Z0 - 0.15), (0, 0, 0), 10))
    # the churned, wet collar this machine always works in [C1] §6: the mast
    # foot and the bottom of the mast carry soil while everything above the
    # deck stays clean.  A shallow spoil ring is what says so in geometry.
    g.append(tb('collar_ring', 0.20, 0.030, R.MAT_WORN, None,
                (0, DRILL_Y, 0.0), (0, 0, 0), 14))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 6 — STABILISERS, HOSES AND LAMPS
# ══════════════════════════════════════════════════════════════════════════════

def build_jacks():
    """Four folding stabiliser legs with ball-jointed adjustable feet [T2].

    Deployed: the feet are ON the ground on their timber dunnage, and it is
    the deployed feet that take [T1]'s working width from the tracks' 800 mm
    out to 1000 mm.  The tracks stay down — a 1.3 t machine does not lift
    itself off its running gear the way the CPT unit must, because it is not
    reacting 200 kN; it is only stopping itself rocking.  That difference
    between the two machines is real and both models state it.
    """
    nodes = []
    for x, y, side in ((-JACK_X, JACK_YF, 'fl'), (JACK_X, JACK_YF, 'fr'),
                       (-JACK_X, JACK_YR, 'rl'), (JACK_X, JACK_YR, 'rr')):
        s = -1 if x < 0 else 1
        # the folding leg, out from the chassis
        bx('jack_leg_%s' % side, (abs(x) - BODY_W / 2 + 0.08, 0.07, 0.07),
           R.MAT_PAINT, None,
           (x / 2 + s * BODY_W / 4, y, FRAME_Z0 + 0.10), bevel=0.006)
        bx('jack_knee_%s' % side, (0.08, 0.09, 0.14), R.MAT_DARK, None,
           (x, y, FRAME_Z0 + 0.09), bevel=0.008)
        n = R.empty(R.NODE_SLIDE, 'jack-%s' % side, None,
                    (x, y, FRAME_Z0 + 0.04))
        n['travel_m'] = JACK_STROKE
        n['axis'] = 'z'
        drop = FRAME_Z0 + 0.04 - 0.045      # down to the top of the dunnage
        g = [
            tb('jack_rod_%s' % side, 0.020, drop, R.MAT_CHROME, n,
               (0, 0, -drop), (0, 0, 0), 10),
            tb('jack_gland_%s' % side, 0.028, 0.030, R.MAT_WORN, n,
               (0, 0, -0.03), (0, 0, 0), 10),
            # the BALL JOINT is what [T2] calls out, and it is what lets a flat
            # pad sit square on ground that is not
            # R.MAT_WORN, not R.MAT_CAST: 36 triangles of castIron inside each
            # of four jack groups is 4 draw calls for 144 triangles.  The gland
            # above it and the pad below it are both already wornSteel, so the
            # ball joint merges into its own neighbours and nothing changes on
            # screen.  What [T2] calls out is the JOINT, which is still here.
            tb('jack_ball_%s' % side, 0.026, 0.032, R.MAT_WORN, n,
               (0, 0, -drop + 0.03), (0, 0, 0), 10),
            tb('jack_pad_%s' % side, JACK_PAD_R, 0.024, R.MAT_WORN, n,
               (0, 0, -drop), (0, 0, 0), 12),
        ]
        weld(g, 'jack-%s' % side, n)
        nodes.append(n)
    return nodes


def build_services(piv):
    """Lamps and hoses.

    THE HOSE THAT MATTERS: `research/rigs/si-rig.md` §4 and §5 item 4 both
    single out "a thick black corrugated suction/cuttings hose arcing from the
    mast top down to the deck" as, on several site photographs, the boldest
    single line on the whole machine — and say plainly: do not omit it.  It is
    one Bezier with a real sag, in a material the machine already owns.

    The lamps are few on purpose.  This is a day-work machine with no cab and
    no lighting mast; `feed-work-light` rides `pivot:mast` so it sweeps when
    the mast rakes, and there is one flood over the deck for the console.
    """
    lamps = []
    mnt, _, meshes = lamp('feed-work-light', piv,
                          (0.16, -0.12, 1.62), (-0.30, -0.55, -0.78),
                          cone=46, rng=14, watt=50)
    # This lamp hangs off `pivot:mast`, so `finish()` will not join it — weld
    # it here or the housing alone is seven draw calls.  The `mount:` node
    # itself survives the weld untouched; only its meshes are merged.
    weld(meshes, 'feed-lamp', mnt)
    lamps.append(mnt)
    lamps.append(lamp('deck-work-light', None,
                      (-(BODY_W / 2 + 0.02), 0.10, DECK_Z + 0.62),
                      (-0.55, -0.62, -0.56), cone=62, rng=12, watt=50)[0])

    # THE BLACK CORRUGATED HOSE, mast top to deck
    curve_to_mesh(R.hose(
        'cuttings_hose',
        [(0.14, DRILL_Y + 0.02, MAST_Z0 + MAST_LEN - 0.30),
         (0.20, DRILL_Y + 0.55, MAST_Z0 + MAST_LEN * 0.72),
         (0.24, -0.10, DECK_Z + 0.42),
         (0.16, 0.16, DECK_Z + 0.12)],
        0.042, R.MAT_RUBBER, sides=8))
    # the hydraulic bundle to the mast, slung rather than clipped tight [C1]
    for i, xo in enumerate((-0.030, 0.0, 0.030)):
        curve_to_mesh(R.hose(
            'mast_hose%d' % i,
            [(-0.16 + xo, 0.06, DECK_Z + 0.10),
             (-0.20 + xo, -0.50, DECK_Z - 0.04),
             (-0.14 + xo, DRILL_Y + 0.16, MAST_Z0 + 0.30)],
            0.016, R.MAT_RUBBER, sides=6))
    # the water line from the deck pump up to the swivel
    curve_to_mesh(R.hose(
        'water_line',
        [(0.02, -0.24, DECK_Z + 0.16),
         (0.10, -0.70, DECK_Z + 0.30),
         (0.10, DRILL_Y + 0.14, MAST_Z0 + MAST_LEN * 0.55)],
        0.014, R.MAT_RUBBER, sides=6))
    return lamps


# ══════════════════════════════════════════════════════════════════════════════

def build(out_path):
    R.reset()
    build_undercarriage()
    build_body()
    piv, dump = build_mast()
    build_carriage(dump)
    build_spt_hammer(piv)
    build_guard()
    build_rods()
    build_string()
    build_jacks()
    build_services(piv)
    return R.finish(out_path)


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public',
                                       'models', 'si-rig.glb')))
