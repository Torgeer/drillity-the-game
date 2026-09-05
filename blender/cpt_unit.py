"""
`cpt_unit` — tracked CPT (cone penetration test) push unit.  In-game marque:
the Rynnval CP-20 Ballastline (`src/game/data.js`, `RIGS['cpt-unit']`).
Real class: a 16–21 t low-ground-pressure tracked carrier whose entire job is
to be heavy enough to push against.

THIS MACHINE DOES NOT DRILL, AND THE MODEL HAS TO SAY SO
--------------------------------------------------------
A CPT unit jacks an instrumented 60° cone into the ground on a string of 1 m
rods at a constant 20 mm/s and reads tip resistance, sleeve friction and pore
pressure the whole way down.  Nothing turns.  Nothing is flushed.  No sample
comes up and no cuttings come out.  So this model has, deliberately and by
contract with the domain:

  * NO rotary head, NO drifter, NO spindle, NO water swivel
  * NO mast — a stub push frame that stands INSIDE the machine's own footprint
    and does not break the skyline.  If you can see a tower against the sky you
    are looking at the wrong machine.
  * NO flush pump, NO mud tank, NO cuttings, NO dust hood
  * NO rod tongs and NO carousel that rotates a rod into place

and instead has the things the class is actually about: twenty tonnes of
ballast, four levelling jacks that LIFT THE TRACKS CLEAR OF THE GROUND so the
dead weight and not the running gear carries the reaction, and an enclosed
cabin because the whole event happens on a screen.

The single most identifiable detail, and the one everybody draws backwards, is
the push frame itself — see `build_push_frame()`.

WHAT THIS IS MODELLED FROM
--------------------------
Local reference: `research/rigs/cpt-unit.md` (which I own and have extended
with the web sources below; §8 of that file listed EVERY overall dimension of
this machine as NOT SOURCED, and [V1] and [G1] now close most of that list).
Every constant below carries the source it came from:

  [V1] A.P. van den Berg, "CPT Crawler on tracks" product page,
       apvandenberg.com/onshore-cone-penetration-testing-cpt-crawler/, read
       2026-09-05.  Three weight classes with overall L × W × H:
         10–12 t  4.5 × 2.2 × 2.8 m   ("width of just 2.2 m … inner-city")
         12–16 t  4.6 × 2.5 × 2.8 m
         16–21 t  5.7 × 2.5 × 2.8 m   <-- THE GAME'S 20 t MACHINE
       HYSON pushing system; diesel, hybrid or 100 % electric; a Morooka
       low-ground-pressure 15 t rubber-tracked chassis variant.
  [V2] A.P. van den Berg, "HYSON pushing system" page, apvandenberg.com/
       hyson-cpt-penetrometer/.  Verbatim: a "double cylinder set in an
       H-shape, with the piston rods attached to the vehicle frame and the
       cylinders themselves moving".  Max 300 kN; pushing speed
       1.5–2.5 cm/sec; hardened piston rods; 5, 10 and 15 cm² cones.
  [V3] A.P. van den Berg, "CPT Truck with HYSON 200 kN static cone
       penetrometer" leaflet (downloadFile.asp?id=MzQ1TWpjeE5nPT1jZGQ).
       6 × 6, 18–22 t, 8.4 × 2.55 × 3.75 m with HYSON, pushing forces up to
       210 kN, cabin with "workbenches and storage space", "heating system and
       CPT rack".  A different body on the same penetrometer — used here for
       the CABIN and the rod-rack fitout, not for the carrier.
  [G1] Gouda Geo-Equipment, "Crawler-Truck CPT Penetrometer Rig", gouda-geo.com.
       "Robust 200 kN penetrometer pusher (pulling force 260 kN, stroke
       1350 mm)"; crawler undercarriage with 700 mm track shoes on a D3 frame;
       levelling by 4 hydraulic cylinders.
  [AGS] Association of Geotechnical and Geoenvironmental Specialists,
       "Introduction to Cone Penetration Testing", ags.org.uk, 2022-09.
       1 m rods; "standard CPT rod is only 36mm in diameter"; penetration rate
       two centimetres per second; "most rigs will push between 10-20 tonnes".
  [D5778] ASTM D5778 as transcribed in `research/06-geotech-water-geothermal.md`
       §A.2.2–A.2.4 and `research/rigs/cpt-unit.md` §3.1: 10 cm² cone,
       35.7 mm diameter, 60° apex, friction sleeve 150 cm² ± 2 %, push rod
       44.5 mm OD, 20 ± 5 mm/s held the whole stroke, reading every ≤ 50 mm,
       and §12.1.1 — the thrust machine must be anchored or ballasted so that
       it does not move relative to the ground.
  [GB] `Geoteknik-broschyr.pdf` (Ingenjörsfirman Geotech AB), read in
       `research/rigs/cpt-unit.md` §4 and §7: rubber tracks running over small
       bogie road wheels with bright red hub centres (pp. 4–7); the rod clamp
       at the collar as two black powder-coated bodies with bright orange
       operating levers and yellow warning triangles (p. 7); 150 mm clamp
       opening, clamp force adjustable 0–170 kN, floating clamp (p. 6); the
       rubber rod wiper "Avskrapargummi 42-44", art. 21190009 (p. 11);
       the cone rendered in detail (p. 8).
  [R1] `research/rigs/cpt-unit.md` — §4 component inventory, §5 the thumbnail
       silhouette, §6 the material split and where dirt does and does not
       accumulate, §9 the domain-truth warnings this build answers.

NOT SOURCED, and therefore marked at every use below rather than invented:
track length, idler radius, deck height, the cabin's own dimensions, the
ballast packaging, the rod-rack layout, and the handrail geometry.  The
OVERALL envelope they have to add up to IS sourced ([V1] 5.7 × 2.5 × 2.8), so
they are solved against a real box rather than guessed in free space, and
`tools/glbinfo.mjs` reads that box back off the exported file.

NAMING.  `DOMAIN.md` §10.  Every real designation lives in this comment block
and nowhere else.  No object name, no material name and no exported string
carries a manufacturer or a model number.  Shape is not branding.

AXES.  Blender Z-up; the exporter flips to three.js Y-up.  Blender -Y is the
machine's FORWARD.  Origin is the machine's centre in plan AT GROUND LEVEL —
and note that on this machine "ground level" is the plane the JACK PADS stand
on, not the plane the tracks stand on, because in the working pose the tracks
are off the ground.  That is the point of the machine.
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
# THE SOURCED ENVELOPE — everything else is solved to land inside this box
# ══════════════════════════════════════════════════════════════════════════════
LENGTH = 5.70      # [V1] 16-21 t CPT Crawler, overall length
WIDTH  = 2.50      # [V1] overall width
HEIGHT = 2.80      # [V1] overall height.  Checked back off the .glb.

# ── UNDERCARRIAGE ─────────────────────────────────────────────────────────────
SHOE_W    = 0.70   # [G1] 700 mm track shoes on the crawler undercarriage.
                   # This is a very wide shoe and it is the whole point: a 20 t
                   # machine that has to stand on a road verge or a soft field
                   # is sold on bearing pressure.
GAUGE     = WIDTH - SHOE_W          # 1.80 m centre-to-centre.  DERIVED: the
                                    # shoes' outer faces are what [V1]'s 2.5 m
                                    # width is measured over.
TRACK_LEN = 3.95   # NOT SOURCED.  Solved: the push well and both bogie runs
                   # have to sit inside the track footprint (a dead-weight
                   # reaction is only worth its mass if the mass is over the
                   # ground it is pushing against), and the ballast tail then
                   # fills [V1]'s 5.70 m.  ~0.69 of overall length, which is
                   # the normal ratio for a tracked carrier.
IDLER_R   = 0.36   # NOT SOURCED.  Solved from TRACK_LEN with a six-roller
                   # bottom run at a workable roller pitch.
SHOE_T    = 0.045  # rubber pad thickness, NOT SOURCED
GROUSER_H = 0.030  # rubber track bar, NOT SOURCED.  Low and blunt — these are
                   # rubber pads on a low-ground-pressure carrier [V1] Morooka
                   # variant, not steel grousers on a rock drill.
SHOE_PITCH = 0.175  # DERIVED so the loop closes on whole shoes
ROADWHEEL_N = 6     # [GB] pp.4-7: 5-6 small road wheels visible inside the loop

# THE POSE.  The machine is built WORKING: jacks down, tracks lifted clear.
# [D5778] §12.1.1 and [R1] §4.2 — the jacks lower until the machine is off its
# own running gear so the dead weight and not the suspension carries the
# reaction.  [R1] §5 item 2 calls the sliver of daylight under the tracks the
# second-strongest thing in the silhouette, and §9.7 records that the shipping
# procedural builder calls for a 0.46 m jack stroke and then never lifts the
# machine at all.  60 mm reads at thumbnail size and is honest: a jack takes
# the load off, it does not make a spectacle of it.
#
# CONSEQUENCE FOR THE MEASURED HEIGHT, stated so nobody "fixes" it later:
# [V1]'s 2.8 m is a product-page L x W x H, i.e. a TRANSPORT envelope, and in
# transport the jacks are up and the tracks are on the ground.  This model is
# posed WORKING, so it must measure 2.80 + TRACK_LIFT off the exported file.
# `tools/glbinfo.mjs` reads that back and it is checked at the bottom of this
# file's docstring trail, not assumed.
TRACK_LIFT = 0.06

# ── FRAME AND DECK ────────────────────────────────────────────────────────────
FRAME_Z0  = 0.30 + TRACK_LIFT       # main frame underside
DECK_H    = 0.94                    # NOT SOURCED — deck height over the ground
DECK_Z    = DECK_H + TRACK_LIFT     # top of the main frame
BODY_W    = 2.16   # body inboard of the shoes, DERIVED
BODY_Y0   = -2.55  # frame nose (machine forward is -Y)
BODY_Y1   = 2.43   # frame tail.  The nose bumper and the ballast tail take the
                   # overall length out to ±LENGTH/2 = ±2.85 [V1].
NOSE_Y    = -LENGTH / 2             # -2.85
TAIL_Y    = LENGTH / 2              # +2.85

# ── THE PUSH FRAME ────────────────────────────────────────────────────────────
PUSH_Y     = -1.05  # DERIVED.  The rod axis stands forward of the track centre
                    # but well inside the track footprint, so the reaction is
                    # carried by the mass that is actually over the ground being
                    # pushed against, and the cabin behind it has a downhill
                    # sightline to the collar.  [R1] §9.4 flags that no source
                    # in the owner's folder shows a TRACKED machine pushing
                    # through its own deck — [V1] and [V3] are the same
                    # penetrometer in both bodies, which is the argument for it.
STROKE     = 1.35   # [G1] "stroke 1350 mm".  Note what this number is FOR: one
                    # stroke has to swallow a whole 1.00 m rod [AGS] plus the
                    # height of the clamp that grips it.  1350 does; 1000 would
                    # not, and a model with a 1 m stroke cannot animate honestly.
PUSH_KN    = 200    # [V1] "maximum pushing force of 200 kN"; [G1] same, pull
                    # 260 kN; matches data.js feedForce 200.
COL_X      = 0.30   # DERIVED: the two fixed piston rods flank the rod axis at
                    # a spacing that clears a 150 mm clamp body [GB] plus jaws.
COL_R      = 0.048  # NOT SOURCED (piston rod diameter).  Sized from the load:
                    # 200 kN over two rods is 100 kN each; a 96 mm hard-chromed
                    # rod is a routine choice at that column length.
CYL_R      = 0.098  # cylinder body OD, NOT SOURCED — solved from COL_R
CYL_LEN    = 0.50   # cylinder body length, NOT SOURCED

# The vertical layout of the H, solved rather than placed by eye.  A fixed
# column has to be at least `STROKE + CYL_LEN` of free length or the cylinder
# body runs off the end of its own rod — that is the constraint that sets this
# frame's height, and it is why a CPT push frame is as tall as it is despite
# having no mast.
HOLD_Z0, HOLD_Z1 = 0.10, 0.34       # the fixed lower (hold) clamp, at the
                                    # collar, hung under the frame in the well
PUSH_Z0    = 0.50                   # base of the fixed columns (top of the
                                    # lower crossbeam)
OVERTRAVEL = 0.16                   # end fittings and over-travel, DERIVED
PUSH_Z1    = PUSH_Z0 + STROKE + CYL_LEN + OVERTRAVEL   # top of the columns
CARR_Z0    = PUSH_Z0 + 0.12         # bottom of the moving cylinder set at the
                                    # bottom of the stroke
WELL_X, WELL_Y = 0.86, 0.94         # the opening through the deck, DERIVED
                                    # from the clamp body plus hand clearance

# ── TOOLING — the one thing that must not be fudged ([R1] §3.1) ───────────────
ROD_LEN    = 1.00    # [AGS], [D5778], data.js rodLenM
ROD_R      = 0.0445 / 2   # [D5778] 44.5 mm push rod OD.  [AGS] gives 36 mm for
                          # the ISO/European rod; the game ships the ASTM
                          # figure and data.js says 44.5, so the model agrees
                          # with the game.  Both are real — see research §3.1.
N_RODS     = 40      # DERIVED from the sourced depth: [V1] "CPTs to depths of
                     # up to 40 metres" on 1 m rods is 40 rods.  [R1] §9.3
                     # records the shipping builder carrying 18, which is less
                     # than half the machine's own stated reach.
CONE_R     = 0.0357 / 2   # [D5778] 10 cm² cone, 35.7 mm
CONE_APEX  = 60.0 * D2R   # [D5778]
SLEEVE_LEN = 0.134        # [D5778] 150 cm² / (pi x 3.57 cm) = 134 mm
CLAMP_OPEN = 0.150        # [GB] p.6, 150 mm clamp opening
WIPER_R    = 0.044 / 2    # [GB] p.11 "Avskrapargummi 42-44" — a rubber scraper
                          # sized for 42-44 mm rods

# ── JACKS ─────────────────────────────────────────────────────────────────────
JACK_N      = 4      # [G1] "leveling accomplished via 4 hydraulic cylinders"
JACK_STROKE = 0.52   # NOT SOURCED
JACK_X      = 1.02   # DERIVED — outboard of the frame, inboard of the shoes
JACK_Y      = 2.20   # DERIVED — clear of both the tracks and the flank ballast

# ── CABIN ─────────────────────────────────────────────────────────────────────
# [V3] gives the fitout ("workbenches and storage space", "heating system and
# CPT rack") but no dimensions, and no source anywhere shows a dimensioned
# cabin on the tracked machine — [R1] §8 item 8 says so explicitly.  So the
# cabin's HEIGHT is not chosen, it is SOLVED: the beacon on its roof is the
# highest thing on the machine, and it has to land on [V1]'s sourced 2.80 m.
# Everything else about it comes from a real sightline — the operator watches a
# collar 0.6 m ahead of the glass and 1.4 m below the eye, which is why the
# front glazing runs right down to the floor line instead of stopping at a
# waist-high sill.
CAB_X, CAB_Y = -0.42, 0.38
CAB_W, CAB_D = 1.20, 1.60
CAB_Z0 = DECK_Z + 0.045             # the cab floor, sat on the deck plate
BEACON_H, BEACON_BASE_H, ROOF_T = 0.085, 0.05, 0.05
TOP_Z = HEIGHT + TRACK_LIFT         # what the model must measure, posed working
CAB_H = TOP_Z - CAB_Z0 - (ROOF_T + BEACON_BASE_H + BEACON_H)

# ── DECK PLAN ─────────────────────────────────────────────────────────────────
# The operator to PORT, the rod store to STARBOARD, and nothing between the cab
# glass and the collar.  That split is not decoration: the second man works
# rods out of the rack all day and must not cross the sightline the operator is
# holding 20 mm/s against.
RACK_X, RACK_Y = 0.76, -0.80        # rod rack centre (starboard)
RACK_COLS, RACK_ROWS = 5, 8         # 5 x 8 = 40 = N_RODS
RACK_PITCH = 0.105
ENC_X, ENC_Y = 0.63, 0.46           # engine / hydraulic enclosure (starboard)
ENC_W, ENC_D, ENC_H = 0.84, 1.28, 0.62


# ══════════════════════════════════════════════════════════════════════════════
# helpers layered on lib/rig.py — same contract as blender/crawler_th.py
# ══════════════════════════════════════════════════════════════════════════════

def _apply_mods(o, seg=None):
    """Bake modifiers into the mesh NOW.

    `finish()` joins by material and Blender's join keeps only the ACTIVE
    object's modifier stack, so an unapplied bevel on anything that is not the
    join target is silently thrown away and the machine goes back to reading as
    cardboard.  `seg` drops the bevel to one segment for parts that are cloned
    in quantity.
    """
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
       bevel=0.012, seg=None):
    """A bevelled box in TRUE METRES.

    `rig.box()` was measured at the start of this build (2026-09-05):
    `box((4,2,10))` exports at (4.000, 2.000, 10.000) and the tube probe is
    likewise true, so there is NO local compensation here and there must never
    be one — a leftover workaround is what made two machines double size.
    """
    return _apply_mods(R.box(name, size, mat, parent, loc, rot, bevel), seg)


def tb(name, radius, length, mat=R.MAT_STEEL, parent=None, loc=(0, 0, 0),
       rot=(0, 0, 0), sides=12):
    return R.tube(name, radius, length, mat, parent, loc, rot, sides)


def clone(src, loc, rot=(0, 0, 0), parent=None, name=None):
    """A linked duplicate — shares the source mesh, so a hundred track shoes
    cost one mesh and are still one draw call once joined."""
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
    """Join one moving subassembly's meshes by material.

    `finish()` leaves anything under a `pivot:`/`slide:` alone because it has
    to move independently — but everything inside ONE moving node moves
    together, so it can be joined exactly the way the statics are.  That is
    what keeps a detailed machine inside the 70-call budget.
    """
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
    """A hazard-striped plate."""
    return bx(name, size, R.MAT_HAZARD, parent, loc, rot, bevel=0.004)


def lamp(name, parent, loc, aim, cone=54, rng=24, watt=70):
    """A work light: housing, stone guard, and the two named nodes
    `src/core/env.js` reads EVERY FRAME to re-aim its spotlight.

    The FIRST lamp built must be `feed-work-light`: `env.js` binds its key by
    that exact string for every machine that is not a jumbo or a longhole rig
    (env.js ~512), and falls back to the ORDINAL when the name misses, so the
    key light lands on the collar either way.
    """
    mount, aimnode = R.worklight(name, parent, loc, aim, cone, rng)
    mount['watt_w'] = watt
    mount['colour_hex'] = 0xFFE9C0
    m = [
        bx(name + '_stalk', (0.034, 0.034, 0.15), R.MAT_DARK, mount, (0, 0, -0.095)),
        bx(name + '_shell', (0.25, 0.12, 0.17), R.MAT_DARK, mount, (0, 0.02, 0)),
        bx(name + '_lens', (0.20, 0.012, 0.13), R.MAT_GLASS, mount, (0, -0.052, 0)),
        bx(name + '_barH', (0.26, 0.012, 0.012), R.MAT_WORN, mount,
           (0, -0.070, 0.080), bevel=0.0),
    ]
    for i in range(4):
        m.append(bx(name + '_bar%d' % i, (0.012, 0.012, 0.19), R.MAT_WORN, mount,
                    (-0.090 + i * 0.060, -0.070, 0), bevel=0.0))
    return mount, aimnode, m


# ══════════════════════════════════════════════════════════════════════════════
# 1 — UNDERCARRIAGE
# ══════════════════════════════════════════════════════════════════════════════

def build_undercarriage():
    """Rubber tracks over visible bogie road wheels.

    [GB] pp.4–7 photograph exactly this on every machine in the Nordic geotech
    fleet: 5–6 small rubber-tyred road wheels with BRIGHT RED HUB CENTRES
    running inside the loop, a toothed sprocket at one end and a plain idler at
    the other.  [R1] §6 calls the red centres "a strong, cheap, high-value
    detail" and it is right — they are two clones of one mesh in a material the
    machine already owns.  [V1]'s Morooka variant is the same construction at
    this weight class.

    The whole assembly is built LIFTED: everything here sits `TRACK_LIFT` above
    z = 0, because in the working pose the jacks carry the machine.
    """
    a = (TRACK_LEN - 2 * IDLER_R) / 2.0
    parts = []
    for s in (-1, 1):
        x = s * GAUGE / 2.0
        side = 'l' if s < 0 else 'r'

        # welded box track frame
        parts.append(bx('tf_%s' % side, (SHOE_W * 0.52, TRACK_LEN * 0.86, 0.30),
                        R.MAT_DARK, None,
                        (x, 0, TRACK_LIFT + IDLER_R + 0.03), bevel=0.02))
        # sprocket (rear) and idler (front) — a sprocket is toothed, so it gets
        # a ring of teeth; an idler is smooth.  Telling them apart at a glance
        # is how a viewer knows which way the machine faces.
        parts.append(tb('sprk_%s' % side, IDLER_R * 0.80, SHOE_W * 0.46,
                        R.MAT_WORN, None, (x, a, TRACK_LIFT + IDLER_R),
                        (0, math.pi / 2, 0), 14))
        parts.append(tb('idlr_%s' % side, IDLER_R * 0.74, SHOE_W * 0.44,
                        R.MAT_WORN, None, (x, -a, TRACK_LIFT + IDLER_R),
                        (0, math.pi / 2, 0), 14))
        for t in range(11):
            ang = TAU * t / 11.0
            parts.append(bx('sprkt_%s%d' % (side, t), (0.05, 0.05, SHOE_W * 0.44),
                            R.MAT_WORN, None,
                            (x - SHOE_W * 0.22,
                             a + math.sin(ang) * IDLER_R * 0.84,
                             TRACK_LIFT + IDLER_R + math.cos(ang) * IDLER_R * 0.84),
                            (0, math.pi / 2, ang), bevel=0.0))

        # bogie road wheels, tyre + red hub centre [GB]
        for i in range(ROADWHEEL_N):
            f = (i + 0.5) / ROADWHEEL_N
            y = -a * 0.94 + f * a * 1.88
            parts.append(tb('rw_%s%d' % (side, i), 0.115, SHOE_W * 0.40,
                            R.MAT_RUBBER, None,
                            (x, y, TRACK_LIFT + 0.115),
                            (0, math.pi / 2, 0), 10))
            # the hub. paintedSteel is the body colour on this machine, so the
            # bright centre costs triangles and no draw call.
            parts.append(tb('rwh_%s%d' % (side, i), 0.052, SHOE_W * 0.44,
                            R.MAT_PAINT, None,
                            (x, y, TRACK_LIFT + 0.115),
                            (0, math.pi / 2, 0), 10))
        # carrier rollers on the top run
        for i in range(2):
            parts.append(tb('cr_%s%d' % (side, i), 0.062, SHOE_W * 0.30,
                            R.MAT_WORN, None,
                            (x, -a * 0.45 + i * a * 0.90,
                             TRACK_LIFT + IDLER_R * 1.72),
                            (0, math.pi / 2, 0), 8))

    # ── the rubber track loop ────────────────────────────────────────────────
    # One shoe mesh, cloned round the loop.  [V1]'s low-ground-pressure variant
    # and [GB] both run RUBBER pads: a low blunt bar, not the steel grouser of a
    # rock drill.  Getting that wrong is one of the ways a machine reads as the
    # wrong family from 40 m away.
    shoe = bx('shoe_src', (SHOE_W, SHOE_PITCH * 0.94, SHOE_T), R.MAT_RUBBER,
              None, (0, 0, -60), bevel=0.006, seg=1)
    bar = bx('bar_src', (SHOE_W * 0.90, SHOE_PITCH * 0.34, GROUSER_H),
             R.MAT_RUBBER, None, (0, 0, -60), bevel=0.004, seg=1)
    n_str = max(2, int(round(2 * a / SHOE_PITCH)))
    n_arc = 9
    for s in (-1, 1):
        x = s * GAUGE / 2.0
        side = 'l' if s < 0 else 'r'
        k = 0
        for run, zc in ((0, TRACK_LIFT + SHOE_T / 2),
                        (1, TRACK_LIFT + 2 * IDLER_R - SHOE_T / 2)):
            for i in range(n_str):
                y = -a + (i + 0.5) * (2 * a / n_str)
                rz = 0.0 if run == 0 else math.pi
                clone(shoe, (x, y, zc), (rz, 0, 0), None, 'sh_%s%d' % (side, k))
                clone(bar, (x, y, zc + (-1 if run == 0 else 1) *
                            (SHOE_T / 2 + GROUSER_H / 2)),
                      (rz, 0, 0), None, 'bar_%s%d' % (side, k))
                k += 1
            parts.append(None)
        for end, yc in ((0, -a), (1, a)):
            for i in range(n_arc):
                ang = math.pi * (i + 0.5) / n_arc + (math.pi if end else 0)
                cy = yc + math.sin(ang) * (IDLER_R - SHOE_T / 2) * (-1 if end else 1)
                cz = TRACK_LIFT + IDLER_R - math.cos(ang) * (IDLER_R - SHOE_T / 2)
                rot = (ang * (-1 if end else 1) + (math.pi if end else 0), 0, 0)
                clone(shoe, (x, cy, cz), rot, None, 'sh_%s%d' % (side, k))
                k += 1
    bpy.data.objects.remove(shoe, do_unlink=True)
    bpy.data.objects.remove(bar, do_unlink=True)
    return [p for p in parts if p is not None]


# ══════════════════════════════════════════════════════════════════════════════
# 2 — FRAME, DECK AND THE PUSH WELL
# ══════════════════════════════════════════════════════════════════════════════

def build_frame():
    """The main frame and the deck, with a WELL cut through it on the rod axis.

    [R1] §4.1 quotes pack 06 §E.3(a): "a hydraulic ram assembly in a hatch
    through the middle of the deck… no mast, no rotation."  §9.4 flags that the
    hatch is sourced to the TRUCK and not to a tracked machine — [V1] and [V3]
    are the same HYSON penetrometer in two bodies, which is the argument for
    carrying it across, and it is recorded as a judgement rather than a fact.

    The deck is built as four plates round the well rather than one plate with
    a hole, because a boolean here would cost more triangles than the hole is
    worth and would fight the join.
    """
    g = []
    g.append(bx('frame_main', (BODY_W, BODY_Y1 - BODY_Y0, DECK_Z - FRAME_Z0),
                R.MAT_DARK, None,
                (0, (BODY_Y0 + BODY_Y1) / 2, (FRAME_Z0 + DECK_Z) / 2), bevel=0.022))
    # the nose: a bumper / front toolbox that takes the frame out to [V1]'s
    # overall length without pretending the FRAME is that long
    g.append(bx('nose_box', (2.00, BODY_Y0 - NOSE_Y, 0.44), R.MAT_PAINT, None,
                (0, (NOSE_Y + BODY_Y0) / 2, FRAME_Z0 + 0.24), bevel=0.020))
    g.append(hz('nose_hz', (2.02, 0.014, 0.10), None,
                (0, NOSE_Y + 0.007, FRAME_Z0 + 0.10)))

    wx, wy = WELL_X, WELL_Y
    # deck plates round the well
    g.append(bx('deck_fwd', (BODY_W, abs(PUSH_Y - wy / 2 - BODY_Y0), 0.045),
                R.MAT_WORN, None,
                (0, (BODY_Y0 + PUSH_Y - wy / 2) / 2, DECK_Z + 0.022), bevel=0.006))
    g.append(bx('deck_aft', (BODY_W, abs(BODY_Y1 - (PUSH_Y + wy / 2)), 0.045),
                R.MAT_WORN, None,
                (0, (BODY_Y1 + PUSH_Y + wy / 2) / 2, DECK_Z + 0.022), bevel=0.006))
    for s in (-1, 1):
        g.append(bx('deck_side%d' % s, ((BODY_W - wx) / 2, wy, 0.045),
                    R.MAT_WORN, None,
                    (s * (wx + (BODY_W - wx) / 2) / 2, PUSH_Y, DECK_Z + 0.022),
                    bevel=0.006))

    # the well coaming — paint chipped to bright steel at every corner where a
    # rod knocks it ([R1] §6), so it is wornSteel and it is hazard-striped
    for s in (-1, 1):
        g.append(bx('coam_x%d' % s, (0.05, wy + 0.10, 0.13), R.MAT_WORN, None,
                    (s * (wx / 2 + 0.025), PUSH_Y, DECK_Z + 0.10), bevel=0.008))
        g.append(bx('coam_y%d' % s, (wx + 0.10, 0.05, 0.13), R.MAT_WORN, None,
                    (0, PUSH_Y + s * (wy / 2 + 0.025), DECK_Z + 0.10), bevel=0.008))
        g.append(hz('coam_hz%d' % s, (wx + 0.12, 0.014, 0.075), None,
                    (0, PUSH_Y + s * (wy / 2 + 0.058), DECK_Z + 0.145)))

    # ── ballast ──────────────────────────────────────────────────────────────
    # THE SUBJECT OF THE MACHINE.  [D5778] §12.1.1: the thrust machine must be
    # anchored or ballasted so it does not move relative to the ground, and
    # [V1]/[AGS] put ~20 t against ~200 kN.  HOW the 20 t is packaged is
    # NOT SOURCED ([R1] §8 item 3) — integral chassis, cast blocks or removable
    # plates.  Removable plates with burned lifting slots are how crane and
    # piling counterweights actually look, and they let the silhouette SAY
    # "counterweight" rather than "box", so that is the reading taken; it is a
    # judgement and it is labelled as one here and in the research file.
    slot = bx('bslot_src', (0.10, 0.05, 0.05), R.MAT_DARK, None, (0, 0, -60),
              bevel=0.006, seg=1)
    BALL_X = WIDTH / 2 - SHOE_W / 2 - 0.09      # outer face inboard of the shoes
    for s in (-1, 1):
        for i in range(4):
            z = DECK_Z + 0.07 + i * 0.22
            g.append(bx('ball_side_%d_%d' % (s, i), (0.16, 1.60, 0.20),
                        R.MAT_DARK, None, (s * BALL_X, 1.10, z), bevel=0.014))
            for j in range(3):
                clone(slot, (s * BALL_X, 0.50 + j * 0.60, z + 0.10),
                      parent=None, name='bslot_%d_%d_%d' % (s, i, j))
    # the tail: solid ballast across the full body, and what takes the machine
    # out to [V1]'s 5.70 m.  On this class the counterweight IS the machine
    # ([R1] §4.7 — "none as a separate item"), so it is not a bolt-on block
    # hanging off the back, it is the back.
    for i in range(5):
        g.append(bx('ball_tail%d' % i, (BODY_W - 0.10, TAIL_Y - BODY_Y1,
                                        0.21), R.MAT_DARK, None,
                    (0, (BODY_Y1 + TAIL_Y) / 2, DECK_Z + 0.075 + i * 0.225),
                    bevel=0.014))
    bpy.data.objects.remove(slot, do_unlink=True)

    # ── the engine / hydraulic enclosure ─────────────────────────────────────
    # [V1]: diesel, hybrid or 100 % electric.  data.js gives this machine 55 kW,
    # which [R1] §9.8 marks as unsourced for the class; the enclosure is sized
    # for a pack of that order and does not claim a number.  It is small on
    # purpose — on a machine that only has to push slowly, the power pack is a
    # minor tenant and the ballast is the landlord.
    g.append(bx('enc', (ENC_W, ENC_D, ENC_H), R.MAT_PAINT, None,
                (ENC_X, ENC_Y, DECK_Z + ENC_H / 2 + 0.05), bevel=0.02))
    louvre = bx('lv_src', (0.012, 0.09, ENC_H * 0.62), R.MAT_DARK, None,
                (0, 0, -60), bevel=0.0, seg=1)
    for i in range(9):
        clone(louvre, (ENC_X + ENC_W / 2 + 0.002, ENC_Y - 0.46 + i * 0.115,
                       DECK_Z + ENC_H / 2 + 0.05),
              parent=None, name='lv%d' % i)
    bpy.data.objects.remove(louvre, do_unlink=True)
    g.append(bx('enc_lid', (ENC_W + 0.05, ENC_D + 0.05, 0.035), R.MAT_WORN,
                None, (ENC_X, ENC_Y, DECK_Z + ENC_H + 0.07), bevel=0.008))
    # exhaust, with a rain cap.  Kept under the cab roof line so the machine's
    # skyline stays a single flat-topped block.
    g.append(tb('exh', 0.055, 0.86, R.MAT_WORN, None,
                (ENC_X + 0.30, ENC_Y + 0.52, DECK_Z + ENC_H + 0.06),
                (0, 0, 0), 10))
    g.append(tb('exh_cap', 0.078, 0.05, R.MAT_WORN, None,
                (ENC_X + 0.30, ENC_Y + 0.52, DECK_Z + ENC_H + 0.92),
                (0, 0, 0), 10))

    # ── deck furniture ───────────────────────────────────────────────────────
    # A grab rail at the tail and a step up the port side to the cab door.
    # NOT SOURCED for this class ([R1] §8 item 6) — a 20 t machine with a deck
    # a metre off the ground needs them under any sane reading of EU practice,
    # and they are modelled as judgement, not quoted as fact.
    rail_z0 = DECK_Z + 0.045                 # off the deck plate
    rail_h = 0.92                            # a standard guardrail height
    for s in (-1, 1):
        g.append(tb('rail_p%d' % s, 0.022, rail_h, R.MAT_WORN, None,
                    (s * (BODY_W / 2 - 0.08), BODY_Y1 - 0.10, rail_z0),
                    (0, 0, 0), 8))
    g.append(tb('rail_top', 0.022, BODY_W - 0.16, R.MAT_WORN, None,
                (-(BODY_W / 2 - 0.08), BODY_Y1 - 0.10, rail_z0 + rail_h),
                (0, math.pi / 2, 0), 8))
    for i in range(3):
        g.append(bx('step%d' % i, (0.10, 0.42, 0.025), R.MAT_WORN, None,
                    (-(BODY_W / 2 + 0.05), CAB_Y - 0.70, 0.34 + i * 0.24),
                    bevel=0.005))
        g.append(tb('step_arm%d' % i, 0.016, 0.14, R.MAT_DARK, None,
                    (-(BODY_W / 2), CAB_Y - 0.70, 0.34 + i * 0.24),
                    (0, -math.pi / 2, 0), 6))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 3 — THE PUSH FRAME.  The thing everybody draws backwards.
# ══════════════════════════════════════════════════════════════════════════════

def build_push_frame():
    """The H-form twin-cylinder penetrometer.

    [V2], verbatim from the manufacturer's own page: a "double cylinder set in
    an H-shape, with the piston rods attached to the vehicle frame and the
    cylinders themselves moving".  That is the INVERSE of every other hydraulic
    ram in this game, and it is the class's signature at close range:

      * the chrome piston rods are FULL LENGTH and PERMANENTLY EXPOSED.  They
        are two fixed polished columns from the frame to the crosshead — they
        are STRUCTURE, not stroke.
      * what travels is a pair of fat dark machined cylinder bodies sliding
        DOWN those columns, dragging the crosshead and the upper clamp with them.
      * the visible length of chrome NEVER CHANGES.  Nothing telescopes.  A
        viewer who has seen one feed ram in this game and then sees this one
        knows immediately that it is a different action.

    `research/rigs/cpt-unit.md` §9.1 records that the shipping procedural
    builder has this exactly backwards — a static fat body on the frame and a
    moving thin chrome rod on the carriage — and §9.2 records that the moving
    element is 0.34 m against a 1.24 m stroke, so the ram visually disconnects
    at the top of travel with half a metre of air in the load path.  Neither
    fault is possible here: the columns span the whole frame, and the moving
    cylinder bodies never leave them.

    Returns the `slide:carriage` node.
    """
    g = []

    # ── the fixed structure: lower crossbeam, columns, upper crosshead ───────
    g.append(bx('pf_base', (0.82, 0.46, 0.14), R.MAT_DARK, None,
                (0, PUSH_Y, PUSH_Z0 - 0.07), bevel=0.012))
    g.append(bx('pf_head', (0.82, 0.40, 0.16), R.MAT_DARK, None,
                (0, PUSH_Y, PUSH_Z1 + 0.08), bevel=0.012))
    for s in (-1, 1):
        # THE FIXED CHROME COLUMNS.  [V2] "hardened piston rods".
        g.append(tb('pf_col%d' % s, COL_R, PUSH_Z1 - PUSH_Z0, R.MAT_CHROME,
                    None, (s * COL_X, PUSH_Y, PUSH_Z0), (0, 0, 0), 14))
        # the gland/end fittings that anchor them, top and bottom
        g.append(tb('pf_colfootT%d' % s, COL_R * 1.55, 0.09, R.MAT_CAST, None,
                    (s * COL_X, PUSH_Y, PUSH_Z0 - 0.01), (0, 0, 0), 12))
        g.append(tb('pf_colfootB%d' % s, COL_R * 1.55, 0.09, R.MAT_CAST, None,
                    (s * COL_X, PUSH_Y, PUSH_Z1 - 0.08), (0, 0, 0), 12))
        # the frame legs of the H — the structural side plates that carry the
        # columns into the chassis
        g.append(bx('pf_leg%d' % s, (0.075, 0.42, PUSH_Z1 - PUSH_Z0 + 0.30),
                    R.MAT_PAINT, None,
                    (s * (COL_X + 0.16), PUSH_Y, (PUSH_Z0 + PUSH_Z1) / 2),
                    bevel=0.012))

    # ── the LOWER (hold) clamp — fixed, at the collar ────────────────────────
    # [GB] p.6: 150 mm opening, clamp force adjustable 0-170 kN, floating so the
    # joints make up squarely.  p.7 photographs the Nordic equivalent as two
    # black powder-coated bodies straddling the rod with BRIGHT ORANGE operating
    # levers and yellow warning triangles.  On this machine the same clamp lives
    # in the well rather than on the soil, and the levers stay orange.
    hz_mid = (HOLD_Z0 + HOLD_Z1) / 2
    g.append(bx('lclamp_body', (0.44, 0.34, HOLD_Z1 - HOLD_Z0), R.MAT_DARK,
                None, (0, PUSH_Y, hz_mid), bevel=0.012))
    for s in (-1, 1):
        # the jaws, polished bright by 44 mm steel passing through them ([R1] §6)
        g.append(bx('lclamp_jaw%d' % s, (0.10, 0.20, 0.16), R.MAT_STEEL, None,
                    (s * (CLAMP_OPEN / 2 + 0.05), PUSH_Y, hz_mid), bevel=0.006))
        g.append(tb('lclamp_lever%d' % s, 0.016, 0.26, R.MAT_HAZARD, None,
                    (s * 0.25, PUSH_Y - 0.16, hz_mid + 0.06),
                    (0.5, 0, s * 0.4), 8))
        # the hanger plates that carry it off the lower crossbeam
        g.append(bx('lclamp_hang%d' % s, (0.035, 0.24, PUSH_Z0 - hz_mid),
                    R.MAT_DARK, None,
                    (s * 0.26, PUSH_Y, (hz_mid + PUSH_Z0) / 2), bevel=0.006))

    # ── THE RUBBER ROD WIPER ─────────────────────────────────────────────────
    # [GB] p.11 art. 21190009 "Avskrapargummi 42-44".  [R1] §9.7 lists it as
    # missing from the game and worth having: it is what strips the clay off a
    # rod as it is pulled, and it is the reason the rods in the rack are clean
    # while the rod in the hole is smeared full length.  Three triangles of
    # rubber that explain a whole material story.
    g.append(tb('rod_wiper', WIPER_R * 2.6, 0.022, R.MAT_RUBBER, None,
                (0, PUSH_Y, HOLD_Z0 - 0.03), (0, 0, 0), 12))

    # ── the rod in the hole ──────────────────────────────────────────────────
    # Plain steel, and per [R1] §6 it goes in clean and comes out coated — it is
    # rawSteel here and the runtime's wear/dirt system does the rest.  It stops
    # AT the collar (z = 0) rather than continuing down the hole, because
    # anything below ground would inflate the model's own bounding box and
    # `tools/glbinfo.mjs` is how this machine's sourced envelope gets checked.
    # The world below z = 0 belongs to `world/geology.js`.
    g.append(tb('rod_in_hole', ROD_R, 0.60, R.MAT_STEEL, None,
                (0, PUSH_Y, 0.0), (0, 0, 0), 10))

    # ── the moving cylinder set — `slide:carriage` ───────────────────────────
    # Named `carriage` because that is the string `src/core/gltfRig.js` binds
    # (makeDyn ~584): `slides.get('carriage')` plus `travel_m` is what gives the
    # runtime `dyn.carriage` and a non-degenerate `dyn.carriageRange`.  A
    # different, more descriptive name would be undrivable, and the loader
    # writes NaN into a world matrix if `travel_m` is missing.  The node sits at
    # the BOTTOM of travel; the game slides it up by `travel_m`.
    carr = R.empty(R.NODE_SLIDE, 'carriage', None, (0, PUSH_Y, CARR_Z0))
    carr['travel_m'] = STROKE
    carr['axis'] = 'z'
    carr['push_kn'] = PUSH_KN
    carr['rate_mm_s'] = 20            # [D5778] 20 +/- 5 mm/s
    carr['rod_len_m'] = ROD_LEN
    cg = []
    for s in (-1, 1):
        # THE FAT DARK MOVING CYLINDER BODY.  This is the part that travels.
        cg.append(tb('cyl_body%d' % s, CYL_R, CYL_LEN, R.MAT_DARK, carr,
                     (s * COL_X, 0, 0), (0, 0, 0), 14))
        cg.append(tb('cyl_glandT%d' % s, CYL_R * 1.14, 0.055, R.MAT_CAST, carr,
                     (s * COL_X, 0, CYL_LEN - 0.055), (0, 0, 0), 14))
        cg.append(tb('cyl_glandB%d' % s, CYL_R * 1.14, 0.055, R.MAT_CAST, carr,
                     (s * COL_X, 0, 0), (0, 0, 0), 14))
        # the port block and its two hoses' anchor
        cg.append(bx('cyl_port%d' % s, (0.07, 0.11, 0.13), R.MAT_CAST, carr,
                     (s * (COL_X + CYL_R + 0.03), 0, CYL_LEN * 0.5), bevel=0.006))
    # the crosshead: the beam that ties the two moving cylinders together at
    # their feet and carries the upper clamp under it.  It is the horizontal
    # bar of the H, and everything on it travels the full 1.35 m.
    cg.append(bx('crosshead', (COL_X * 2 + 0.28, 0.30, 0.14), R.MAT_PAINT, carr,
                 (0, 0, 0.07), bevel=0.012))
    cg.append(bx('crosshead_web', (COL_X * 2 + 0.08, 0.14, 0.16), R.MAT_PAINT,
                 carr, (0, 0, 0.20), bevel=0.010))
    # ── the UPPER (push) clamp, hanging under the crosshead on the rod axis ──
    cg.append(bx('uclamp_body', (0.36, 0.30, 0.22), R.MAT_DARK, carr,
                 (0, 0, -0.14), bevel=0.012))
    for s in (-1, 1):
        cg.append(bx('uclamp_jaw%d' % s, (0.09, 0.18, 0.15), R.MAT_STEEL, carr,
                     (s * (CLAMP_OPEN / 2 + 0.045), 0, -0.14), bevel=0.006))
        cg.append(tb('uclamp_lever%d' % s, 0.015, 0.22, R.MAT_HAZARD, carr,
                     (s * 0.21, -0.14, -0.07), (0.5, 0, s * 0.4), 8))
        # the slipper that runs on the fixed column — it is what makes the
        # travelling mass read as GUIDED rather than floating
        cg.append(bx('slipper%d' % s, (0.10, 0.14, 0.07), R.MAT_WORN, carr,
                     (s * COL_X, 0, CYL_LEN + 0.04), bevel=0.006))
    # The automatic rod screwer on the crosshead: the operator offers a rod up
    # and a sensor engages the screw, so nothing is made up by hand at the
    # collar.  Sourced as a FUNCTION (AGS/insitutek: "the operator simply
    # inserts the new rod, and an integrated sensor automatically engages the
    # screw mechanism"), not as a shape — its geometry is NOT SOURCED and this
    # is a plain housing rather than an invented mechanism.
    cg.append(bx('rod_screwer', (0.20, 0.24, 0.17), R.MAT_CAST, carr,
                 (0.28, 0.0, -0.06), bevel=0.010))
    weld(cg, 'push-head', carr)

    # `mount:tool` — the one name src/core/gltfRig.js binds for a tool anchor.
    # It was missing, so makeDyn()'s
    #     nodes.mounts.get('tool') || nodes.slides.get('carriage')
    # fell through to the carriage ORIGIN: a cone would have hung at the bottom
    # of the moving cylinder set instead of on the rod axis under the
    # crosshead.  It worked, which is exactly why nobody saw it (ASTRA.md §8).
    # Placed on the rod axis at the underside of the crosshead, which is where
    # a CPT string physically leaves the machine.
    R.empty(R.NODE_MOUNT, 'tool', carr, (0, 0, -0.14))

    # ── the hose package ─────────────────────────────────────────────────────
    # [R1] §4.7 / §9.6, from the Bauer hose catalogue: hoses on this class of
    # machine are not loose individual snakes, they run as NAMED PACKAGES
    # between bolted BULKHEAD PLATES, six main lines at a time, with the
    # electric cable bundled INSIDE the package.  So: a bolted plate on the
    # body, a bolted plate on the push frame, and a tight parallel bundle
    # between them with a loose catenary so the moving end can travel.
    g.append(bx('bulkhead_body', (0.26, 0.05, 0.20), R.MAT_WORN, None,
                (0.42, PUSH_Y + 0.52, DECK_Z + 0.20), bevel=0.006))
    g.append(bx('bulkhead_frame', (0.05, 0.22, 0.18), R.MAT_WORN, None,
                (COL_X + 0.21, PUSH_Y + 0.10, PUSH_Z0 + 0.55), bevel=0.006))
    for i, xo in enumerate((-0.055, -0.018, 0.018, 0.055)):
        curve_to_mesh(R.hose(
            'push_hose%d' % i,
            [(0.42 + xo, PUSH_Y + 0.50, DECK_Z + 0.20),
             (0.44 + xo, PUSH_Y + 0.42, DECK_Z - 0.05),
             (COL_X + 0.22, PUSH_Y + 0.12 + xo, PUSH_Z0 + 0.55)],
            0.020, R.MAT_RUBBER))
    return carr, g


# ══════════════════════════════════════════════════════════════════════════════
# 4 — ROD MAGAZINE, CONE CASE, AND THE SMALL TRUE PROPS
# ══════════════════════════════════════════════════════════════════════════════

def build_rods():
    """Forty 1 m push rods stood upright in two banks flanking the well.

    [V1] gives this machine 40 m of depth on [AGS]'s 1 m rods, so it carries
    forty of them or it visibly reloads; `research/rigs/cpt-unit.md` §9.3
    records the shipping builder carrying eighteen, i.e. less than half its own
    stated reach.  [V3] confirms a "CPT rack" as fitout on the same
    penetrometer's truck body but does not dimension or place it — the LAYOUT
    here is NOT SOURCED and is chosen so a standing operator can lift a rod out
    one-handed at chest height beside the clamp, which is how the job is
    actually done.

    All forty share one mesh and one material, so they are forty clones and one
    draw call after the join: exactly the lane `lib/rig.py` says to spend in.
    """
    g = []
    rod = tb('rod_src', ROD_R, ROD_LEN, R.MAT_STEEL, None, (0, 0, -60),
             (0, 0, 0), 10)
    # the threaded coupling shoulder, where rust blooms first ([R1] §6)
    thr = tb('thr_src', ROD_R * 1.22, 0.05, R.MAT_WORN, None, (0, 0, -60),
             (0, 0, 0), 10)
    w = RACK_COLS * RACK_PITCH
    d = RACK_ROWS * RACK_PITCH
    g.append(bx('rack_floor', (w, d, 0.03), R.MAT_DARK, None,
                (RACK_X, RACK_Y, DECK_Z + 0.07), bevel=0.006))
    n = 0
    for c in range(RACK_COLS):
        for r in range(RACK_ROWS):
            px = RACK_X - w / 2 + (c + 0.5) * RACK_PITCH
            py = RACK_Y - d / 2 + (r + 0.5) * RACK_PITCH
            clone(rod, (px, py, DECK_Z + 0.09), parent=None,
                  name='rack_rod%d' % n)
            clone(thr, (px, py, DECK_Z + 0.09 + ROD_LEN - 0.05),
                  parent=None, name='rack_thr%d' % n)
            n += 1
    # the top guide plate the rods stand through, on four posts.  A rod that is
    # only located at its foot rattles across a site; every real rack has this.
    g.append(bx('rack_guide', (w, d, 0.03), R.MAT_WORN, None,
                (RACK_X, RACK_Y, DECK_Z + 0.80), bevel=0.006))
    for sx in (-1, 1):
        for sy in (-1, 1):
            g.append(tb('rack_post%d%d' % (sx, sy), 0.018, 0.74, R.MAT_DARK,
                        None, (RACK_X + sx * (w / 2 - 0.02),
                               RACK_Y + sy * (d / 2 - 0.02), DECK_Z + 0.08),
                        (0, 0, 0), 8))
    bpy.data.objects.remove(rod, do_unlink=True)
    bpy.data.objects.remove(thr, do_unlink=True)
    assert n == N_RODS, 'rod rack built %d rods, wanted %d' % (n, N_RODS)
    return g


def build_cone_case():
    """The cone, lying in its open padded case on the deck.

    [GB] p.8 renders it: a 60° polished tip, a ≤ 5 mm gap, the slot filter at
    the shoulder (the u2 position), the friction sleeve, then a run of
    alternating matte-anodised and polished instrument modules, and a male
    thread at the tail into the first push rod.  [R1] §4.4 reads the whole
    assembly as "a slim striped baton", which is exactly what a stack of
    screwed-together instrument modules looks like, and notes it is well over a
    metre long with adapters.  Every diameter here is [D5778].
    """
    g = []
    # On the PORT deck beside the well, which is where the cab door and the
    # steps are — the operator opens the case on the way past it.
    cx, y0 = -0.76, -0.86
    g.append(bx('cone_case', (0.30, 1.34, 0.12), R.MAT_DARK, None,
                (cx, y0, DECK_Z + 0.10), bevel=0.010))
    g.append(bx('cone_case_lid', (0.30, 1.34, 0.02), R.MAT_DARK, None,
                (cx, y0 - 0.66, DECK_Z + 0.44), (-0.62, 0, 0), bevel=0.006))
    g.append(bx('cone_case_foam', (0.26, 1.28, 0.03), R.MAT_RUBBER, None,
                (cx, y0, DECK_Z + 0.17), bevel=0.004))

    # the cone assembly itself, lying along +Y
    x, z = cx, DECK_Z + 0.20
    # 60 deg tip: at 35.7 mm diameter the cone is 35.7/2/tan(30) = 30.9 mm tall
    tip_h = (CONE_R) / math.tan(CONE_APEX / 2)
    bpy.ops.mesh.primitive_cone_add(radius1=CONE_R, radius2=0.0, depth=tip_h,
                                    vertices=14)
    o = C.active_object
    R.part('cone_tip', o, R.MAT_STEEL, None,
           (x, y0 - 0.60, z), (math.pi / 2, 0, 0))
    g.append(o)
    g.append(tb('cone_shoulder', CONE_R, 0.028, R.MAT_STEEL, None,
                (x, y0 - 0.585, z), (-math.pi / 2, 0, 0), 14))
    g.append(tb('cone_filter', CONE_R * 1.01, 0.010, R.MAT_RUBBER, None,
                (x, y0 - 0.557, z), (-math.pi / 2, 0, 0), 14))
    g.append(tb('cone_sleeve', CONE_R * 1.02, SLEEVE_LEN, R.MAT_STEEL, None,
                (x, y0 - 0.547, z), (-math.pi / 2, 0, 0), 14))
    yy = y0 - 0.547 + SLEEVE_LEN
    for i, (ln, mat) in enumerate(((0.11, R.MAT_DARK), (0.16, R.MAT_STEEL),
                                   (0.09, R.MAT_DARK), (0.21, R.MAT_STEEL),
                                   (0.07, R.MAT_DARK), (0.18, R.MAT_STEEL))):
        g.append(tb('cone_mod%d' % i, CONE_R * (0.98 if mat is R.MAT_DARK else 1.0),
                    ln, mat, None, (x, yy, z), (-math.pi / 2, 0, 0), 12))
        yy += ln
    g.append(tb('cone_tail', ROD_R * 0.92, 0.05, R.MAT_WORN, None,
                (x, yy, z), (-math.pi / 2, 0, 0), 10))

    # [GB] p.13: the saturation-oil bottle and the spare slot filters.  The
    # filter is saturated in de-aired oil before the test — a real pre-test
    # ritual ([R1] §4.4) and two primitives.
    g.append(tb('cpt_oil', 0.032, 0.11, R.MAT_RUBBER, None,
                (cx + 0.16, y0 + 0.56, DECK_Z + 0.06), (0, 0, 0), 8))
    g.append(tb('filter_tin', 0.045, 0.05, R.MAT_WORN, None,
                (cx + 0.24, y0 + 0.42, DECK_Z + 0.06), (0, 0, 0), 10))
    # [GB] p.11: the thread-grease tub ("Gängfett BioPlus 4,5 kg")
    g.append(tb('grease_tub', 0.085, 0.14, R.MAT_PAINT, None,
                (cx + 0.22, y0 + 0.20, DECK_Z + 0.06), (0, 0, 0), 10))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 5 — THE CABIN.  The operator watches a trace, not a hole.
# ══════════════════════════════════════════════════════════════════════════════

def build_cabin():
    """An enclosed cabin over the push point.

    `research/06` §E.3(a) via [R1] §4.5: on the ballasted machine the operator
    sits INSIDE, in a cabin, at a screen — not under a canopy.  [R1] §9.5
    records the shipping builder making an open hood with four posts, and §8
    item 8 records that no drawing of the cabin exists in the owner's folder;
    [V3] supplies the fitout instead — "workbenches and storage space",
    "heating system and CPT rack" — which is why there is a bench and a rack
    inside rather than only a seat.

    GLAZING: `MAT_GLASS`, and `transmission` is NEVER set.  HANDOFF §8F measured
    a transmissive material at +65 to +81 draw calls REGARDLESS OF SIZE — it
    re-renders the entire opaque list into a transmission target — and this
    cabin's windows are exactly where somebody reaches for it.  The runtime
    swaps in the procedural `glass` kind, which is opaque-list-safe.

    The front glazing runs down to the floor line on purpose: the collar is
    1.5 m ahead and 1.9 m below the eye, and a normal waist-high sill would put
    the one thing the operator is watching behind sheet steel.
    """
    g = []
    cz = CAB_Z0 + CAB_H / 2
    g.append(bx('cab_shell', (CAB_W, CAB_D, CAB_H), R.MAT_PAINT, None,
                (CAB_X, CAB_Y, cz), bevel=0.030))
    g.append(bx('cab_roof', (CAB_W + 0.06, CAB_D + 0.06, ROOF_T), R.MAT_PAINT,
                None, (CAB_X, CAB_Y, CAB_Z0 + CAB_H + ROOF_T / 2), bevel=0.014))
    # front glazing, floor to header, looking down at the collar
    g.append(bx('cab_glass_f', (CAB_W - 0.14, 0.018, CAB_H - 0.26), R.MAT_GLASS,
                None, (CAB_X, CAB_Y - CAB_D / 2 - 0.002, cz - 0.02), bevel=0.0))
    # door glass on the outboard side, and a fixed light on the inboard side
    g.append(bx('cab_glass_l', (0.018, CAB_D - 0.34, CAB_H - 0.52), R.MAT_GLASS,
                None, (CAB_X - CAB_W / 2 - 0.002, CAB_Y, cz + 0.06), bevel=0.0))
    g.append(bx('cab_glass_r', (0.018, CAB_D - 0.52, CAB_H - 0.62), R.MAT_GLASS,
                None, (CAB_X + CAB_W / 2 + 0.002, CAB_Y + 0.06, cz + 0.08),
                bevel=0.0))
    # the door: frame, handle, and a grab rail beside it
    g.append(bx('cab_door', (0.022, CAB_D - 0.26, CAB_H - 0.16), R.MAT_PAINT,
                None, (CAB_X - CAB_W / 2 - 0.012, CAB_Y, cz), bevel=0.012))
    g.append(tb('cab_handle', 0.016, 0.20, R.MAT_WORN, None,
                (CAB_X - CAB_W / 2 - 0.05, CAB_Y - 0.42, cz - 0.10),
                (0, 0, 0), 8))
    g.append(tb('cab_grab', 0.020, 0.86, R.MAT_WORN, None,
                (CAB_X - CAB_W / 2 - 0.06, CAB_Y - CAB_D / 2 - 0.01,
                 CAB_Z0 + 0.10), (0, 0, 0), 8))
    # wiper on the front glass
    g.append(tb('cab_wiper', 0.010, 0.42, R.MAT_DARK, None,
                (CAB_X + 0.16, CAB_Y - CAB_D / 2 - 0.03, cz - 0.52),
                (0.0, 1.15, 0), 6))
    # The amber beacon.  It is the top of the machine, and CAB_H was solved so
    # that the top of THIS lands on [V1]'s sourced 2.80 m over the tracks.
    g.append(tb('beacon_base', 0.048, BEACON_BASE_H, R.MAT_DARK, None,
                (CAB_X + 0.40, CAB_Y + 0.58, CAB_Z0 + CAB_H + ROOF_T),
                (0, 0, 0), 8))
    g.append(tb('beacon', 0.052, BEACON_H, R.MAT_HAZARD, None,
                (CAB_X + 0.40, CAB_Y + 0.58,
                 CAB_Z0 + CAB_H + ROOF_T + BEACON_BASE_H), (0, 0, 0), 8))

    # ── inside: the screen is the whole show ─────────────────────────────────
    # [R1] §5 item 5 and §4.5: the glow of a screen at the operator position is
    # the only thing on this machine that is DOING anything, and it must be the
    # brightest thing in the frame.  Modelled as a real panel behind real glass
    # so the runtime has something to light.
    g.append(bx('cab_bench', (CAB_W - 0.16, 0.40, 0.04), R.MAT_WORN, None,
                (CAB_X, CAB_Y - CAB_D / 2 + 0.28, CAB_Z0 + 0.74), bevel=0.006))
    g.append(bx('cab_screen', (0.50, 0.03, 0.32), R.MAT_GLASS, None,
                (CAB_X - 0.06, CAB_Y - CAB_D / 2 + 0.16, CAB_Z0 + 0.99),
                (-0.22, 0, 0), bevel=0.0))
    g.append(bx('cab_screen_bez', (0.56, 0.05, 0.38), R.MAT_DARK, None,
                (CAB_X - 0.06, CAB_Y - CAB_D / 2 + 0.19, CAB_Z0 + 0.99),
                (-0.22, 0, 0), bevel=0.008))
    g.append(bx('cab_seat', (0.42, 0.42, 0.12), R.MAT_RUBBER, None,
                (CAB_X, CAB_Y + 0.24, CAB_Z0 + 0.46), bevel=0.020))
    g.append(bx('cab_seatback', (0.42, 0.12, 0.48), R.MAT_RUBBER, None,
                (CAB_X, CAB_Y + 0.44, CAB_Z0 + 0.76), bevel=0.020))
    # [V3] "CPT rack" — spare cones and modules stowed in the cabin
    g.append(bx('cab_rack', (0.14, 0.58, 0.32), R.MAT_DARK, None,
                (CAB_X + CAB_W / 2 - 0.11, CAB_Y + 0.32, CAB_Z0 + 1.02),
                bevel=0.008))
    return g


# ══════════════════════════════════════════════════════════════════════════════
# 6 — LEVELLING JACKS.  Four, and they are why the tracks are in the air.
# ══════════════════════════════════════════════════════════════════════════════

def build_jacks():
    """Four levelling jacks, posed DOWN and carrying the machine.

    [G1]: "leveling accomplished via 4 hydraulic cylinders".  [D5778] §12.1.1
    and [R1] §4.2: they lower until the machine is lifted off its own running
    gear, so the dead weight and not the springs reacts the push.  The feet are
    large flat pads on a pin joint so they follow ground slope.

    Each is a `slide:` node so the game can raise them to tram.  The stroke is
    NOT SOURCED; it is declared in `extras` so a reader can see what the model
    claims rather than having to measure it.
    """
    nodes = []
    for sx in (-1, 1):
        for sy in (-1, 1):
            side = ('f' if sy < 0 else 'r') + ('l' if sx < 0 else 'r')
            x, y = sx * JACK_X, sy * JACK_Y
            # the fixed housing, bolted to the frame
            bx('jack_house_%s' % side, (0.20, 0.20, 0.54), R.MAT_PAINT, None,
               (x, y, FRAME_Z0 + 0.26), bevel=0.012)
            bx('jack_gusset_%s' % side, (0.30, 0.05, 0.30), R.MAT_DARK, None,
               (x, y + sy * 0.11, FRAME_Z0 + 0.44), bevel=0.008)
            n = R.empty(R.NODE_SLIDE, 'jack-%s' % side, None, (x, y, FRAME_Z0))
            n['travel_m'] = JACK_STROKE
            n['axis'] = 'z'
            PAD_T = 0.05
            drop = FRAME_Z0                     # node to ground
            g = [
                # the chrome ram, EXTENDED: the machine is standing on it, and
                # that is the whole point of this pose
                tb('jack_rod_%s' % side, 0.038, drop, R.MAT_CHROME, n,
                   (0, 0, -drop), (0, 0, 0), 12),
                tb('jack_gland_%s' % side, 0.052, 0.06, R.MAT_WORN, n,
                   (0, 0, -0.06), (0, 0, 0), 12),
                # the pin joint and the pad.  A flat pad that cannot follow the
                # ground is a pad that only ever sits on one edge.
                # R.MAT_WORN, not R.MAT_CAST.  A MATERIAL COSTS A DRAW CALL PER GROUP IT APPEARS IN.
                # glTF emits one primitive per material per mesh, and finish()/weld() join
                # by material WITHIN a dynamic group — so a material used for one small
                # object in each of four jacks is FOUR draw calls, not one.
                # This knuckle was 36 triangles of castIron inside each of four
                # jack groups: 4 draw calls for 144 triangles.  The pin joint
                # and the pad it sits in are already wornSteel and touch it, so
                # the merge is invisible and buys the calls back outright.
                tb('jack_knuckle_%s' % side, 0.052, 0.09, R.MAT_WORN, n,
                   (0, 0, -drop + PAD_T + 0.03), (0, math.pi / 2, 0), 10),
                tb('jack_pad_%s' % side, 0.185, PAD_T, R.MAT_WORN, n,
                   (0, 0, -drop), (0, 0, 0), 14),
                hz('jack_hz_%s' % side, (0.34, 0.34, 0.008), n,
                   (0, 0, -drop + PAD_T + 0.004)),
            ]
            weld(g, 'jack-%s' % side, n)
            nodes.append(n)
    return nodes


# ══════════════════════════════════════════════════════════════════════════════
# 7 — SERVICES AND LAMPS
# ══════════════════════════════════════════════════════════════════════════════

def build_services():
    """Lamps and the carrier's own hose runs.

    `feed-work-light` FIRST and by that exact name: `src/core/env.js` (~512)
    binds the underground key to that string for every machine that is not a
    jumbo or a longhole rig, and falls back to the ordinal when the name misses.
    On a CPT unit there is no feed in the drilling sense — the name is the
    game's contract, not a description, and it is pointed at the collar, which
    is what the contract is FOR.

    There is no boom to sweep on this machine, so every lamp is static.  That
    is itself a statement: the lighting on a CPT site does not move because
    nothing on a CPT machine swings.
    """
    lamps = []
    # the collar lamp, on the push frame looking straight down the rod
    lamps.append(lamp('feed-work-light', None,
                      (-(COL_X + 0.22), PUSH_Y - 0.30, PUSH_Z1 - 0.30),
                      (0.42, 0.40, -1.0), cone=48, rng=18, watt=70))
    lamps.append(lamp('collar-r', None,
                      (COL_X + 0.22, PUSH_Y - 0.30, PUSH_Z1 - 0.30),
                      (-0.42, 0.40, -1.0), cone=48, rng=18, watt=70))
    # forward lamps on the cab roof, for tramming and for the rod rack
    for s in (-1, 1):
        lamps.append(lamp('cab-front-%s' % ('l' if s < 0 else 'r'), None,
                          (CAB_X + s * 0.46, CAB_Y - CAB_D / 2 - 0.02,
                           CAB_Z0 + CAB_H + 0.02),
                          (s * 0.24, -0.88, -0.42), cone=58, rng=26, watt=70))
    # rear lamp over the ballast tail, so the machine is not a black wall from
    # behind on a winter site
    lamps.append(lamp('deck-rear', None,
                      (-0.72, BODY_Y1 - 0.06, DECK_Z + 1.02),
                      (-0.20, 0.92, -0.36), cone=58, rng=22, watt=70))

    # carrier hoses: a tidy clipped bundle from the enclosure to the frame,
    # deliberately unlike the push frame's loose catenary — two hose families
    # that look the same is one of the tells that a machine came out of a CAD
    # block rather than off a photograph ([R1] §4.7).
    for i, xo in enumerate((-0.08, -0.027, 0.027, 0.08)):
        curve_to_mesh(R.hose(
            'carrier_hose%d' % i,
            [(ENC_X + xo, ENC_Y - ENC_D / 2 + 0.05, DECK_Z + 0.14),
             (0.56 + xo, -0.20, DECK_Z + 0.06),
             (0.44 + xo, PUSH_Y + 0.52, DECK_Z + 0.16)],
            0.022, R.MAT_RUBBER))

    # the hose reel for the external power-pack line.  [GB] p.6 photographs one
    # on the rear deck of the plug-in machine — [V1] sells this class as diesel,
    # HYBRID or 100 % electric, so a shore/pack line is real equipment and not
    # decoration.
    tb('reel_drum', 0.16, 0.30, R.MAT_HAZARD, None,
       (-0.62, BODY_Y1 - 0.42, DECK_Z + 0.26), (0, math.pi / 2, 0), 14)
    for s in (-1, 1):
        tb('reel_cheek%d' % s, 0.23, 0.03, R.MAT_DARK, None,
           (-0.62 + s * 0.15, BODY_Y1 - 0.42, DECK_Z + 0.26),
           (0, math.pi / 2, 0), 14)
    return lamps


# ══════════════════════════════════════════════════════════════════════════════

def build(out_path):
    R.reset()
    build_undercarriage()
    build_frame()
    build_push_frame()
    build_rods()
    build_cone_case()
    build_cabin()
    build_jacks()
    build_services()
    return R.finish(out_path)


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public',
                                       'models', 'cpt-unit.glb')))
