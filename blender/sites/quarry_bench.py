"""
SITE — `quarry-bench`.  Exports to `public/models/sites/quarry-bench.glb`.

An aggregate quarry bench: a flat engineered floor cut in rock, a blasted
highwall standing over it with a catch berm part-way up and a muckpile at its
toe, a blasthole pattern pegged out along the bench, the shot-firer's danger
marking, edge protection along the crest, and the processing plant on the floor
below.

WHY THIS ONE FIRST
------------------
It was the weakest procedural site in the game by a wide margin. The entire
`if (kit === 'quarry')` branch of `src/world/terrain.js` was THIRTEEN LINES:

    six cones of rubble scattered on a ring, and one box for a haul-road berm.

Nothing in it was a quarry. There was no highwall, no bench, no pattern, no
plant, no crest, no evidence that anything had ever been drilled — the archetype
whose identity is "a bench with a face over it and a shot pegged out on it" had
none of the three. Its neighbour `open-pit-bench` is 259 lines and good. That
gap is why this module exists and why it was built end to end first: the
pipeline is proved on the archetype where the improvement is unarguable.

WHAT THIS IS MODELLED FROM
--------------------------
`research/16-site-archetypes.md` §A.4 (lines 622-771), which marks its own
claims [F] fact / [I] inference / NOT SOURCED. Source keys are that file's §G.

  [OSMRE-BLAST]   US Office of Surface Mining, blaster-training module. THE
                  blast-geometry authority here.
                    · burden  ~= 25 x charge diameter for ANFO, 30-35 x for
                      denser emulsion
                    · spacing 1.8-2.0 x burden for a row fired simultaneously;
                      1.0-1.2 x burden (near square) when firing sequentially
                    · stemming 0.5-1.3 x burden, "good first approximation
                      0.7 x burden", of sized crushed stone or drill cuttings
                    · subdrilling drilled BELOW floor level so the floor comes
                      out to grade, backfilled with cuttings, never charged;
                      "more prevalent at quarry operations"
                    · patterns square, rectangular or staggered
                    · the highwall is protected by "presplitting, smooth
                      blasting, line drilling, cushion blasting"

  [BRITANNICA-Q]  "drilling inclined, vertical or horizontal blastholes in
                  single- or multiple-row patterns to depths ranging from a few
                  meters to 30 m or more, depending on the desired bench height"

  [EPIROC-SURF]   the catalogue split, quoted in §A.4: top-hammer rigs on
  [EPIROC-D65]    roughly 1-5.5 inch holes for construction and quarry work;
  [EPIROC-BLASTHOLE]  DTH rigs on 3.5-8 inch holes "for limestone and aggregate
                  quarries, surface mining and construction".  Cited for the
                  CLASS capability band only, never as a claim about a company.

  [HSE-L118]      UK Quarries Regulations 1999 and its ACoP.  Reg 13: benches
  [SI1999-2024]   and haul roads "designed, constructed and maintained so as to
                  allow vehicles and plant to be used and moved upon them
                  safely".  Reg 12 imminent-risk triggers include LOOSE GROUND
                  OR ROCKS ABOVE A ROADWAY OR WORKPLACE and MISSING EDGE
                  PROTECTION ON ROADS, BENCHES, RAMPS AND TIPPING POINTS.
                  Part V blasting: a determined DANGER ZONE, evacuation,
                  "flags or notices, audible withdraw and all-clear signals,
                  posted sentries", and post-blast inspection for misfires.

  [MINSYS-DUST]   the plant chain and its dust control: "primary crushing
                  stations, vibrating screens, transfer points, belt conveyors
                  with full-length skirting, haul roads with speed limits around
                  15 km/h, tarped or wind-fenced stockpiles, and water trucks
                  with misting cannons, atomised fog and surface sprays" at feed
                  chutes, crusher inlets and transfer points.  §G grades this
                  one a vendor blog, moderate quality.

  §A.4 photograph, [I]: "(1) A grid of drilled holes marching along the bench
  parallel to the crest, each flagged, with a crawler drill over one of them,
  dust hood and collector at the collar, and a white ring of drill dust round
  each hole. (2) A stepped grey highwall with a catch berm part-way up and a
  muckpile at the toe... (3) The plant below — primary crusher, trestle
  conveyors, and conical stockpiles graded by product size with a misting cannon
  on a transfer point."

NOT SOURCED, and marked again at every use below rather than invented
---------------------------------------------------------------------
  · FACE HEIGHT, BENCH WIDTH AND BERM WIDTH.  This is not an oversight, it is
    the finding.  §A.4, verbatim: "there is no numeric face height or berm width
    in the regulations. The operator's own excavation rules set the maximum face
    height [HSE-L118]. So the earlier NOT SOURCED on bench width stands, and now
    it stands for a *reason*: the figure does not exist as a rule. Do not print
    one."  Every such number below is an AUTHORED COMPOSITION DECISION solved
    against the hero camera, is labelled as one, and must never be quoted back
    as a quarry fact.
  · BLASTHOLE INCLINATION.  §A.4 lists inclination as NOT SOURCED (the "10-20
    degrees" rule is not backed anywhere in the pack).  The holes here are drawn
    VERTICAL, which [BRITANNICA-Q] does list as one of the three real cases, and
    no angle is asserted.
  · SUBDRILL DEPTH.  The practice is sourced [OSMRE-BLAST]; no number is.
  · PLANT DIMENSIONS.  [MINSYS-DUST] names the plant chain and its dust control;
    it gives no dimension for any of it.  Every size in `build_plant()` is
    authored to read at 55-75 m and is marked.
  · DANGER-ZONE SIZE.  Part V requires "a determined danger zone" and says
    nothing about how far it reaches, because it is determined per shot.
  · MUCKPILE AND CATCH-BERM GEOMETRY.  §A.4's own photograph brief is [I].

NAMING
------
`DOMAIN.md` §10.  No object, material or exported string here carries a
manufacturer, a model designation or a real quarry's name.

MATERIALS — SIX, WHICH IS THE BUDGET
------------------------------------
See THE BUDGET in `blender/lib/site.py`: a site .glb costs one draw call per
material once `finish()` joins the statics, and the surface band is already over
its ceiling of 80 in eight of twenty-one states with no .glb on the site at all.
Six is what `quarry-bench` can pay for by giving back the instanced scatter this
file's authored rock replaces.

    blastedRock    highwall, drill traces, muckpile, shot rock, crest windrow
    gravel         bench floor, collar dust, stemming, haul strip, stockpiles
    paintedDark    plant frames, conveyor trestles, chutes, posts
    rawSteel       crusher shell and hopper, belt drums, handrails, pegs
    safetyStripe   danger-zone flags, notices, crest edge markers
    rubber         conveyor belting and skirting

Everything else is bought in TRIANGLES, which are free in draw calls — that is
where `rubble()` and `traces()` spend, and it is the whole reason the highwall
can have a broken silhouette at no cost.

AXES
----
`blender/lib/site.py` AXES.  Origin is the hole collar at ground level.  Blender
+Z is up; Blender +Y is AWAY from the hero camera.  The camera sits at three.js
[7.60, 2.60, 9.90] = Blender [7.60, -9.90, 2.60], so the composition here is
solved on the view axis with `on_axis()` rather than in raw world coordinates —
a 29-degree horizontal field at 30 m is only 15.6 m wide, and anything placed by
eye in world space lands outside it.
"""

import importlib.util
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'lib'))


def _load_site_lib():
    """Load `blender/lib/site.py` BY PATH, not by name.

    `site` IS A PYTHON STANDARD LIBRARY MODULE — it is what CPython runs during
    interpreter start-up to set up `sys.path` and `site-packages`. So by the
    time any of this executes `sys.modules['site']` already holds the stdlib
    one, and a plain `import site` returns THAT however `sys.path` is ordered.

    The failure is silent in the worst way: the import succeeds, `S` is a real
    module, and the first call dies with `AttributeError: module 'site' has no
    attribute 'reset'` from somewhere that looks unrelated to importing.

    Both obvious fixes are wrong. `sys.modules.pop('site')` would hand the NEXT
    importer in this Blender process our module instead of the real one.
    Renaming the library would leave the project with a `blender/lib/site.py`
    that is not the site library. So it is loaded explicitly, under a name
    nothing else can collide with.
    """
    path = os.path.normpath(os.path.join(HERE, '..', 'lib', 'site.py'))
    spec = importlib.util.spec_from_file_location('drillity_site', path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules['drillity_site'] = mod
    spec.loader.exec_module(mod)
    return mod


S = _load_site_lib()

D2R = math.pi / 180.0


# ═════════════════════════════════════════════════════════════════════════════
# THE CAMERA THE COMPOSITION IS SOLVED AGAINST — MEASURED, NOT ASSUMED
#
# The first version of this block was written from the hero-camera figures
# quoted in `src/world/terrain.js`'s open-pit comment — eye [7.60, 2.60, 9.90],
# 34-degree vertical field, 0.855 aspect — and EVERY ONE OF THEM IS WRONG for
# the live camera. The first in-game frame proved it in one look: the highwall
# filled the whole surface band, and the crest, the danger flags and the plant
# were all off screen, on the wrong sides. Reasoning about `fov` and `aspect` is
# what produced that; measuring is what fixed it.
#
# AND THEN IT WAS MEASURED AGAIN, BECAUSE THE FIRST MEASUREMENT WAS OF THE
# WRONG CAMERA. The probe waited a fixed four seconds and read `ctx.camera`
# while the BOOT SCREEN was still up — the boot screen is a ~28 second shader
# compile, not a splash (ASTRA §8) — and the boot camera is fov 34.04 / aspect
# 1.042 against the hero camera's fov 20.97 / aspect 1.724. Two wrong cameras
# in a row, from two different mistakes, on the same problem. The fix both times
# was to stop assuming and poll for the state that has to be true.
#
# THESE ARE THE LIVE HERO CAMERA, measured on the shipping layout by projecting
# probe points through `ctx.camera` and bisecting for the NDC edges, with the
# probe held until `terrain.archetype` and the ground mesh both agree the site
# is really up:
#
#     eye        three.js [8.400, 2.250, 10.940]
#     direction  three.js [-0.673, 0.024, -0.740]    pitch +1.36 deg (slightly UP)
#     fov 20.97 vertical, aspect 1.724, near 0.25, far 2500
#
# and the frame itself, solved at ten distances between 8 m and 90 m. All three
# are linear in distance to within a millimetre over that range:
#
#     half-width(d) = 0.4023 * d          the frame is 0.80*d wide
#     top(d)        = 2.25 + 0.2065 * d   NDC y = +1
#     bottom(d)     = 2.25 - 0.1638 * d   NDC y = -1
#
# THREE CONSEQUENCES, AND THEY ARE MOST OF THE COMPOSITION:
#
#   · THE HORIZON IS AT NDC y = -0.12 — just below the middle of the band. So
#     more than half of the surface band is SKY unless something stands in it.
#     A highwall is exactly the right object for this archetype and it has to be
#     tall enough to matter; six cones on a ring never had a chance.
#   · THE COLLAR IS ON THE BOTTOM EDGE, at plan distance 13.74 m and NDC
#     (0.00, -1.00). Everything above it belongs to the site.
#   · THE CAMERA LOOKS SLIGHTLY UP (+1.36 deg), so the frame opens faster
#     upward than downward — 0.2065 against 0.1638 per metre.
#
# IF THE HERO CAMERA MOVES, THESE NUMBERS ARE WRONG AND THIS SITE IS MIS-FRAMED.
# Re-measure it against the live projection matrix; do not re-derive it from
# `fov`, and do not measure it before the site is actually on screen.
# ═════════════════════════════════════════════════════════════════════════════
# three.js (x, y, z) -> Blender (x, -z, y)
EYE = (8.400, -10.940, 2.250)
AXIS = (-0.6731, 0.7401)           # plan view direction, Blender XY
RIGHT = (0.7401, 0.6731)           # screen-right in plan, Blender XY
EYE_Z = 2.250
TOP_K = 0.2065                     # metres of frame above eye level, per metre out
BOT_K = 0.1638                     # metres below
HALF_W_K = 0.4023                  # metres of half-width per metre out


def on_axis(dist, across=0.0):
    """Blender (x, y) at `dist` metres along the hero view axis, `across` metres
    across the frame (+ is screen-right). The only placement function in this
    file; raw world coordinates are not used anywhere."""
    return (EYE[0] + AXIS[0] * dist + RIGHT[0] * across,
            EYE[1] + AXIS[1] * dist + RIGHT[1] * across)


def half_width(dist):
    """Half the frame's world width at `dist`."""
    return dist * HALF_W_K


def ndc_y(dist, height):
    """Where a point at (`dist`, `height`) lands vertically: -1 is the bottom of
    the surface band, +1 the top; the measured horizon is approximately -0.12."""
    top = EYE_Z + TOP_K * dist
    bot = EYE_Z - BOT_K * dist
    return 2.0 * (height - bot) / (top - bot) - 1.0


def height_at_ndc(dist, y):
    """The inverse of `ndc_y`, and the one that is actually used.

    Every authored height in this file is chosen by saying WHERE IN THE FRAME it
    should sit and inverting — because none of them has a source to be chosen
    from, and a number solved against the frame is at least honest about what it
    is. `research/16` §A.4 is explicit that quarry face height, bench width and
    berm width do not exist as figures; this is what is done instead of printing
    one."""
    top = EYE_Z + TOP_K * dist
    bot = EYE_Z - BOT_K * dist
    return bot + (y + 1.0) * 0.5 * (top - bot)


# ═════════════════════════════════════════════════════════════════════════════
# THE BLAST GEOMETRY — the one part of this site that is fully sourced
# ═════════════════════════════════════════════════════════════════════════════

# Hole diameter. [EPIROC-BLASTHOLE] via §A.4 puts DTH rigs on 3.5-8 inch holes
# "for limestone and aggregate quarries"; [EPIROC-SURF] puts top hammer on
# 1-5.5 inch. §A.4's own [I] read of the two: "a small or medium aggregate
# quarry is top hammer on 3-4 inch holes". The rigs `data.js` sends to this
# archetype are top-hammer and DTH crawlers, so 4 inch sits in BOTH bands and is
# the honest choice for a quarry that could be drilled by either.
HOLE_D = 0.102                     # 4 in

# Burden. [OSMRE-BLAST]: "Burden ~= 25 x charge diameter for ANFO". DERIVED at
# this diameter — the RULE is sourced, the arithmetic is ours.
BURDEN = 25.0 * HOLE_D             # 2.550 m

# Spacing along the row. [OSMRE-BLAST]: "1.0-1.2 x burden (near square) when
# firing sequentially". 1.15 is inside that band; a modern quarry shot is fired
# sequentially, which is also what makes the near-square pattern right.
SPACING = 1.15 * BURDEN            # 2.933 m

# Stemming. [OSMRE-BLAST]: "0.5-1.3 x burden, good first approximation
# 0.7 x burden; must be sized crushed stone or drill cuttings. Removing it can
# cut the maximum effective burden by more than 30 %."
STEM = 0.70 * BURDEN               # 1.785 m

# Rows and holes. [OSMRE-BLAST] gives "square, rectangular, staggered" and
# [BRITANNICA-Q] "single- or multiple-row patterns"; neither gives a count,
# because it is set by the tonnage wanted. Three rows of nine is what fits the
# bench this frame can see, and the count is an AUTHORED number.
ROWS = 3
HOLES = 9

# FACE HEIGHT — **NOT SOURCED**, and this is the important one.
#
# §A.4, verbatim: "there is no numeric face height or berm width in the
# regulations... the figure does not exist as a rule. Do not print one."
# [BRITANNICA-Q] bounds only the blasthole DEPTH ("a few meters to 30 m or more,
# depending on the desired bench height"), which bounds nothing on its own.
#
# So it is SOLVED AGAINST THE FRAME and it wears no citation. The wall stands at
# 34 m along the view axis, where the frame runs from -3.32 m to +9.27 m and the
# horizon is at NDC -0.12. The crest goes at NDC +0.72:
#
#     height_at_ndc(34, +0.72) = 7.5 m
#
# which closes the sky behind the mast and still leaves the top seventh of the
# band open, so the wall is not the whole picture. Its toe at ground level lands
# at NDC -0.47, so the face occupies the middle 60 % of the band vertically —
# which is what a highwall does when you are standing on the bench under it.
#
# Two earlier values for this constant were wrong, both because the camera was
# assumed rather than measured: 14.0 m at 26 m (crest at NDC +1.43, wall from
# edge to edge) and then 8.5 m at 34 m against the boot camera.
#
# DO NOT quote 7.5 m back as a quarry face height. It is a camera solution.
FACE_DIST = 34.0                   # NOT SOURCED — composition, not fact
FACE_H = 7.5                       # NOT SOURCED — height_at_ndc(34, +0.72)

# The wall occupies the RIGHT of the frame and stops just left of centre, so the
# bench floor opens past it to the drop and the plant. §A.4: "a highwall on one
# side and a drop on the other". Half-width at 34 m is 13.68 m, so `across = -4`
# is NDC x = -0.29 and `across = +30` is NDC +2.19, well off the right edge.
FACE_FROM = -4.0                   # NOT SOURCED — composition
FACE_TO = 30.0                     # runs off the right edge; its end is never seen

# The catch berm part-way up the face is [I] in §A.4's photograph brief and has
# no sourced width or height. Half-way up, 2.4 m wide, is authored.
BERM_Z = FACE_H * 0.52             # NOT SOURCED
BERM_W = 2.4                       # NOT SOURCED

# Where the bench floor ends and the drop begins — the "other side" of §A.4's
# sentence. Bench WIDTH is the second figure §A.4 says does not exist. A line at
# constant `across` runs parallel to the view axis, so in perspective it
# converges toward the vanishing point, which is what a bench crest running away
# from you actually does. -7.0 brings it into frame at about 18 m (NDC -0.97)
# and carries it to NDC -0.58 by 30 m.
CREST_ACROSS = -7.0                # NOT SOURCED — composition, not fact


# ═════════════════════════════════════════════════════════════════════════════
# THE HIGHWALL
# ═════════════════════════════════════════════════════════════════════════════

def build_highwall():
    """The face, its catch berm, its drill traces and the muckpile at its toe.

    §A.4's photograph: "A stepped grey highwall with a catch berm part-way up
    and a muckpile at the toe."

    THE FACE IS BUILT AS ONE COLUMN PER HOLE, AND THAT IS NOT A STYLING CHOICE.

    A blasted face is not a surface with grooves cut in it. It is the set of
    rock columns left standing BETWEEN the holes of the last row, split apart by
    them — which is why the four highwall-protection methods [OSMRE-BLAST] names
    ("presplitting, smooth blasting, line drilling, cushion blasting") all leave
    the same mark, the standing half of each hole. So the wall here is a row of
    columns on the shot's own SPACING, each standing out from its neighbours by
    a different amount. Three things fall out of that for free:

      · the vertical fluting is at the CORRECT SOURCED PITCH, drawn at TRUE
        SCALE with nothing exaggerated — the rhythm reads because it is 2.93 m
        of relief, not because anything was made bigger to be seen;
      · the silhouette is broken at every scale, which no box can be;
      · it is one material, so the whole wall is ONE DRAW CALL however many
        blocks go into it. Triangles are the lane to spend in (ASTRA §3.4).

    The first version of this asked `rubble()` for one 47 m mass per lift and
    got 30 m blocks, and shots/site-quarry-lower.png came back as smooth stacked
    slabs — the cardboard-carton failure, reproduced by the code written to
    prevent it. Measured, not reasoned: the render is what said so.
    """
    # The wall runs along screen-right, so its long axis is RIGHT and its face
    # normal is -AXIS (back toward the camera).
    yaw = math.atan2(RIGHT[1], RIGHT[0])

    span = FACE_TO - FACE_FROM
    n_col = int(span / SPACING)

    # Block size in the face. NOT SOURCED — §A.4 gives fragmentation as a
    # CONSEQUENCE of burden, spacing and stemming and prints no block size, so
    # this is authored: blocks about a third of the hole spacing, which is what
    # leaves a column reading as jointed rock rather than as one casting.
    BLOCK = SPACING / 3.0

    for i in range(n_col):
        across = FACE_FROM + (i + 0.5) * SPACING
        # How far this column stands proud of its neighbours. The split between
        # two holes never runs true, and this is the whole read of the wall.
        out = S.jitter(0.55, i * 1.3, 4.0)
        bx0, by0 = on_axis(FACE_DIST, across)
        px = bx0 - AXIS[0] * out
        py = by0 - AXIS[1] * out
        cw = SPACING * 0.94                      # columns just touch

        # THE VISIBLE END OF THE WALL IS TAPERED, NOT CUT.
        # The right-hand end runs off the frame and is never seen; the LEFT end
        # is in shot, and a face that simply stops at full height reads as a
        # sliced box. A real face runs down as it comes round toward the ramp,
        # so the first three columns step down to nothing.
        taper = min(1.0, 0.42 + i * 0.22)

        # THE CREST LINE MUST WANDER.
        # With every column the same height the top of the wall came back as a
        # dead ruled line across the whole span (shots/site-quarry-lower.png,
        # first columned build) — which is the same cardboard failure one axis
        # up: a real crest is where the last row broke out, and it never breaks
        # out level. +-0.85 m is NOT SOURCED; it is what stops the skyline
        # reading as a machined edge.
        top = (FACE_H + S.jitter(0.85, i * 2.7, 6.0)) * taper

        # THE SOLID CORE IS THE GUARANTEE; THE RUBBLE IS THE PICTURE.
        #
        # Scattered blocks alone will always open a hole somewhere, and a hole
        # in a highwall is a slot of bright sky in the middle of the frame.
        # terrain.js learned this on the open pit ("chasing the individual gap
        # is the wrong fix, because the next parameter change reopens it
        # somewhere else") and solved it with one continuous unjittered ring
        # behind everything. Same trick, same reason: a plain box per column
        # closes the wall by construction, and the rubble in front of it only
        # ever has to break the FACE and the SILHOUETTE, which is what it is
        # good at. Both are the same material, so both are still one draw call.
        lo = min(BERM_Z, top)
        S.box('face-core-%d' % i, (cw, 5.2, lo), S.MAT_ROCK,
              loc=(px + AXIS[0] * 2.2, py + AXIS[1] * 2.2, lo * 0.5),
              rot=(0.0, 0.0, yaw))
        S.rubble('face-lo-%d' % i, (px, py, lo * 0.5),
                 (cw, 1.8, lo), S.MAT_ROCK,
                 block=BLOCK, n=14, seed=11.0 + i * 3.0, yaw=yaw)

        # ── the upper lift, berm to crest ──────────────────────────────────
        uh = top - BERM_Z
        if uh > 0.6:
            ux = px + AXIS[0] * BERM_W
            uy = py + AXIS[1] * BERM_W
            S.box('face-core-hi-%d' % i, (cw, 5.2, uh), S.MAT_ROCK,
                  loc=(ux + AXIS[0] * 2.2, uy + AXIS[1] * 2.2, BERM_Z + uh * 0.5),
                  rot=(0.0, 0.0, yaw))
            S.rubble('face-hi-%d' % i, (ux, uy, BERM_Z + uh * 0.5),
                     (cw, 1.8, uh), S.MAT_ROCK,
                     block=BLOCK, n=14, seed=37.0 + i * 3.0, yaw=yaw)

    # ── the catch berm: the flat that makes a face read as a BENCHED face ────
    # Reg 12 makes loose ground above a workplace an imminent-risk trigger
    # [HSE-L118]; a catch berm is what catches it before it reaches the floor.
    # Width and height NOT SOURCED (see BERM_W).
    for i in range(int(span / 3.0)):
        across = FACE_FROM + 8.0 + (i + 0.5) * 3.0
        if across > FACE_TO:
            break
        bx, by = on_axis(FACE_DIST + BERM_W * 0.5, across)
        S.rubble('berm-%d' % i, (bx, by, BERM_Z + 0.30),
                 (3.0, BERM_W, 1.0), S.MAT_ROCK,
                 block=0.9, n=8, seed=23.0 + i * 2.0, yaw=yaw)

    # ── DRILL TRACES: the standing half of each hole, in the joint ──────────
    # [OSMRE-BLAST]: the highwall is protected by "presplitting, smooth
    # blasting, line drilling, cushion blasting", and all four leave half-
    # barrels. The columns above already carry the rhythm; these are the barrel
    # itself, sitting in the joint between two columns.
    #
    # DRAWN AT TRUE SCALE. The trace radius is HALF THE SOURCED HOLE DIAMETER
    # and nothing else: at 26 m a 102 mm hole is about three pixels wide, and
    # that is what it should be. Widening it to "make it read" would be an
    # undeclared exaggeration on a sourced dimension, which is the one thing
    # this pipeline is for (ASTRA §7.2 on the bore-diameter tag).
    t0x, t0y = on_axis(FACE_DIST - 2.6, FACE_FROM + 8.0 + SPACING)
    n_tr = int((FACE_TO - FACE_FROM - 8.0) / SPACING) - 1
    S.traces('trace-lo', (t0x, t0y, 0.0),
             (RIGHT[0] * SPACING, RIGHT[1] * SPACING, 0.0),
             n_tr, BERM_Z, HOLE_D * 0.5, S.MAT_ROCK, seed=5.0)
    S.traces('trace-hi',
             (t0x + AXIS[0] * BERM_W, t0y + AXIS[1] * BERM_W, BERM_Z + 0.9),
             (RIGHT[0] * SPACING, RIGHT[1] * SPACING, 0.0),
             n_tr, FACE_H - BERM_Z - 0.9, HOLE_D * 0.5, S.MAT_ROCK, seed=9.0)

    # ── the muckpile at the toe ─────────────────────────────────────────────
    # The last shot, not yet dug out. §A.4 [I]: "a muckpile at the toe". It runs
    # along the face, tallest against the wall and running out onto the floor.
    # Block size here is the SHOT's fragmentation, not the face's joints, so it
    # is coarser — and it is NOT SOURCED: §A.4 gives fragmentation only as a
    # consequence of burden and spacing and prints no size.
    for i in range(int(span / 3.4)):
        across = FACE_FROM + 1.0 + (i + 0.5) * 3.4
        if across > FACE_TO:
            break
        h = (2.4 + S.rnd(i * 4.1, 3.0) * 1.7) * min(1.0, 0.45 + i * 0.28)
        mx, my = on_axis(FACE_DIST - (4.6 + S.rnd(i * 2.3, 7.0) * 1.6), across)
        S.rubble('muckpile-%d' % i, (mx, my, h * 0.40),
                 (3.6, 6.5, h), S.MAT_ROCK,
                 block=1.15, n=14, seed=50.0 + i * 5.0, yaw=yaw)


# ═════════════════════════════════════════════════════════════════════════════
# THE SHOT, PEGGED OUT
# ═════════════════════════════════════════════════════════════════════════════

def build_shot():
    """The pattern, its stemming, its flags and the danger marking.

    §A.4's photograph: "A grid of drilled holes marching along the bench parallel
    to the crest, each flagged... and a white ring of drill dust round each
    hole."

    The pattern is laid out so that ONE OF ITS HOLES IS THE GAME'S HOLE: the
    collar at the origin is a blasthole in the shot, which is what the machine
    standing here is actually drilling. Burden runs back from the free face at
    the crest; spacing runs along it.
    """
    yaw = math.atan2(RIGHT[1], RIGHT[0])

    # The pattern's rows march back from the crest on the sourced BURDEN, and
    # the origin collar is the front-row hole nearest the frame centre.
    def drilled(i, j):
        # The shot is being drilled, not finished: the far end of the back row
        # is still to come. That is the state the player is in, and a finished
        # pattern would say the machine has nothing to do.
        return not (j == ROWS - 1 and i > HOLES - 4)

    at, _ = S.pattern(
        'shot', HOLES, ROWS, BURDEN, SPACING, S.MAT_GRAVEL,
        origin=(0.0, 0.0, 0.0), yaw=yaw,
        collar_r=0.34, seed=3.0, drilled=drilled)

    # ── the stemming on each collared hole ──────────────────────────────────
    # [OSMRE-BLAST]: stemming is "sized crushed stone or drill cuttings", and
    # 0.7 x burden is its "good first approximation". A charged hole shows as a
    # cone of chippings pushed back over the collar; the depth is what STEM
    # names, and it is below ground, so what is visible is the surplus.
    for k, (px, py) in enumerate(at):
        if S.rnd(k * 2.7, 1.0) < 0.45:
            continue                       # not every hole is loaded yet
        r = 0.42 + S.rnd(k * 5.3, 2.0) * 0.16
        S.tube('stem-%d' % k, r, 0.16 + S.rnd(k, 4.0) * 0.10, S.MAT_GRAVEL,
               loc=(px, py, 0.0), sides=8)

    # ── the flag on each hole ───────────────────────────────────────────────
    # §A.4 photograph: "each flagged". Part V of [HSE-L118] independently
    # requires "flags or notices" for the danger zone. A pin and a marker.
    for k, (px, py) in enumerate(at):
        S.tube('flagpin-%d' % k, 0.012, 0.62, S.MAT_STEEL,
               loc=(px, py, 0.0), sides=4)
        S.box('flag-%d' % k, (0.017, 0.20, 0.13), S.MAT_HAZARD,
              loc=(px, py + 0.10, 0.58),
              rot=(0.0, 0.0, S.rnd(k * 3.1, 6.0) * 0.9))

    # ── the stemming stockpile the shot is loaded from ──────────────────────
    sx, sy = on_axis(24.0, 5.9)                    # NDC x +0.77
    S.rubble('stemming-heap', (sx, sy, 0.75), (4.6, 4.0, 1.5),
             S.MAT_GRAVEL, block=0.55, n=12, seed=71.0, yaw=yaw)
    # the bar used to rod the stemming down, stood in the heap
    S.tube('stemming-bar', 0.018, 2.3, S.MAT_STEEL,
           loc=(sx + 1.5, sy - 0.4, 0.6), rot=(0.22, 0.10, 0.0))

    # ── the danger zone, marked ─────────────────────────────────────────────
    # [HSE-L118] Part V: a determined danger zone with "flags or notices,
    # audible withdraw and all-clear signals, posted sentries". The EXTENT is
    # NOT SOURCED — it is determined per shot — so this marks a line, not an
    # area, and asserts no distance.
    for i in range(6):
        d = 11.0 + i * 3.6
        px, py = on_axis(d, -0.62 * half_width(d))   # a line down the left
        S.tube('zonepost-%d' % i, 0.045, 1.35, S.MAT_DARK, loc=(px, py, 0.0),
               sides=6)
        S.box('zoneflag-%d' % i, (0.28, 0.02, 0.22), S.MAT_HAZARD,
              loc=(px, py, 1.22), rot=(0.0, 0.0, 0.4 + S.rnd(i, 8.0) * 0.5))

    # the notice board and the sentry's post at the head of the line
    nx, ny = on_axis(12.0, -0.70 * half_width(12.0))
    S.tube('notice-leg-l', 0.05, 1.5, S.MAT_DARK, loc=(nx - 0.4, ny, 0.0), sides=6)
    S.tube('notice-leg-r', 0.05, 1.5, S.MAT_DARK, loc=(nx + 0.4, ny, 0.0), sides=6)
    S.box('notice-board', (1.15, 0.05, 0.78), S.MAT_HAZARD,
          loc=(nx, ny, 1.42), rot=(-0.12, 0.0, 0.0))

    # the audible signal: a klaxon on a mast. Part V requires "audible withdraw
    # and all-clear signals"; the mast height is authored.
    kx, ky = on_axis(15.0, 0.72 * half_width(15.0))
    S.tube('klaxon-mast', 0.055, 3.1, S.MAT_DARK, loc=(kx, ky, 0.0), sides=8)
    S.tube('klaxon', 0.16, 0.34, S.MAT_STEEL, loc=(kx, ky, 3.0),
           rot=(math.pi * 0.5, 0.0, 0.0), sides=10)


# ═════════════════════════════════════════════════════════════════════════════
# THE BENCH FLOOR, THE CREST AND THE HAUL ROAD
# ═════════════════════════════════════════════════════════════════════════════

def build_bench():
    """The worked floor, the edge protection along the crest, and the haul road.

    [HSE-L118] Reg 13 makes the bench and the haul road designed structures —
    "designed, constructed and maintained so as to allow vehicles and plant to
    be used and moved upon them safely" — and Reg 12 makes MISSING EDGE
    PROTECTION on "roads, benches, ramps and tipping points" an imminent-risk
    trigger. So the windrow along the crest is not dressing; it is the object
    the regulation is about, and it was absent.
    """
    yaw = math.atan2(RIGHT[1], RIGHT[0])

    # ── the crest windrow — the edge protection ─────────────────────────────
    # Height NOT SOURCED (no figure exists — see FACE_H). Drawn at axle height
    # for the haul fleet, which is what a windrow is for.
    for i in range(9):
        d = 4.0 + i * 6.0
        px, py = on_axis(d, CREST_ACROSS)
        S.rubble('windrow-%d' % i, (px, py, 0.62), (7.2, 2.4, 1.25),
                 S.MAT_ROCK, block=0.85, n=12, seed=110.0 + i,
                 yaw=yaw + math.pi * 0.5)

    # the edge markers along it — the visible half of "edge protection"
    for i in range(5):
        d = 6.0 + i * 10.0
        px, py = on_axis(d, CREST_ACROSS + 1.4)
        S.tube('edgepost-%d' % i, 0.05, 1.05, S.MAT_DARK, loc=(px, py, 0.0), sides=6)
        S.box('edgemark-%d' % i, (0.16, 0.16, 0.44), S.MAT_HAZARD,
              loc=(px, py, 1.10))

    # ── the haul road off the bench ─────────────────────────────────────────
    # [HSE-L118] Reg 13 and [MINSYS-DUST] ("haul roads with speed limits around
    # 15 km/h"). Graded fines, running out past the crest toward the plant. No
    # speed-limit number is lettered on anything: it would not be legible at
    # this range and an unreadable number is not a citation.
    for i in range(10):
        # KEPT OFF THE EXTREME LEFT EDGE. Geometry that reaches past about
        # NDC x -0.85 comes back with coloured speckle along the band's own
        # scissor edge — see THE EDGE ARTEFACT at the foot of this file. The
        # road still runs away and out of shot; it just does not graze the
        # boundary while it does it.
        d = 20.0 + i * 4.2
        px, py = on_axis(d, max(-0.80 * half_width(d), CREST_ACROSS - 1.5 - i * 1.15))
        S.box('haul-%d' % i, (9.5, 6.0, 0.30), S.MAT_GRAVEL,
              loc=(px, py, -0.10), rot=(0.0, 0.0, yaw + 0.30))

    # ── worked floor: drill cuttings, tracked fines, spilled shot rock ──────
    for i in range(16):
        d = 5.0 + S.rnd(i * 1.9, 12.0) * 26.0
        a = (S.rnd(i * 3.3, 13.0) - 0.5) * 20.0
        px, py = on_axis(d, a)
        S.rubble('floor-%d' % i, (px, py, 0.10), (2.4, 2.0, 0.34),
                 S.MAT_GRAVEL, block=0.34, n=6, seed=200.0 + i, yaw=yaw)
    # shot rock the loader has not swept up
    for i in range(12):
        d = 7.0 + S.rnd(i * 2.7, 21.0) * 20.0
        a = (S.rnd(i * 4.7, 22.0) - 0.5) * 18.0
        px, py = on_axis(d, a)
        S.rubble('spill-%d' % i, (px, py, 0.22), (1.5, 1.4, 0.55),
                 S.MAT_ROCK, block=0.45, n=5, seed=300.0 + i, yaw=yaw)


# ═════════════════════════════════════════════════════════════════════════════
# THE PLANT
# ═════════════════════════════════════════════════════════════════════════════

def build_plant():
    """The processing plant on the floor below, seen past the end of the bench.

    [MINSYS-DUST], the sourced chain: "primary crushing stations, vibrating
    screens, transfer points, belt conveyors with full-length skirting... tarped
    or wind-fenced stockpiles, and water trucks with misting cannons, atomised
    fog and surface sprays" at feed chutes, crusher inlets and transfer points.
    §A.4's photograph: "conical stockpiles graded by product size with a misting
    cannon on a transfer point."

    EVERY DIMENSION IN THIS FUNCTION IS NOT SOURCED. The source names the plant
    chain and its dust control and gives no size for any of it. These are
    authored to read at 55-75 m, where the plant is a silhouette and a set of
    diagonals rather than a machine, and they must not be quoted as plant sizes.
    """
    D = 62.0                                   # NOT SOURCED — composition
    yaw = math.atan2(RIGHT[1], RIGHT[0])

    # ── the primary crushing station ────────────────────────────────────────
    # `across` is set so the plant shows PAST the left end of the highwall.
    # The wall's left edge is `across = -4` at 34 m, i.e. NDC x -0.29, and that
    # ray reaches `across = -7.3` by 62 m — so anything to the right of -7.3
    # out here is behind the wall and is not drawn at all.
    cx, cy = on_axis(D, -13.0)                     # NDC x -0.52
    for sx in (-3.4, 3.4):
        for sy in (-2.6, 2.6):
            # Feet 1.6 m BELOW grade. The plant stands beyond the archetype's
            # flat bench floor, where the region's own relief is still +-1.4 m,
            # and a leg that starts exactly at z=0 hovers or sinks by that much.
            S.tube('crusher-leg-%.0f-%.0f' % (sx, sy), 0.22, 8.8, S.MAT_DARK,
                   loc=(cx + sx, cy + sy, -1.6), sides=6)
    S.box('crusher-deck', (8.0, 6.0, 0.4), S.MAT_DARK, loc=(cx, cy, 7.3))
    S.box('crusher-body', (5.2, 4.4, 4.6), S.MAT_STEEL, loc=(cx, cy, 9.8), bevel=0.08)
    # the feed hopper: the flared box a haul truck tips into
    S.box('crusher-hopper', (6.6, 5.6, 2.4), S.MAT_STEEL,
          loc=(cx, cy - 0.6, 13.2), rot=(0.10, 0.0, 0.0), bevel=0.06)
    # NO 90 mm WALKWAY PLATE. It was drawn here and it is the same sub-pixel
    # mistake as the belt skirting: at 62 m an 0.09 m edge is a fraction of a
    # pixel, and a 8.2 x 0.09 m face carries its texture at 90:1. The handrail
    # it stands for is below the resolution of this shot; the deck it sits on
    # already carries the read.
    # the tipping ramp the trucks back up — a graded bank against the hopper
    # `on_axis`, NOT `cy - 9.0`. Mixing frame placement with raw Blender-Y
    # offsets puts an object in a direction that has nothing to do with the
    # view, which is how half the plant ended up outside the picture.
    rax, ray = on_axis(D + 9.0, -13.0)
    S.rubble('crusher-ramp', (rax, ray, 3.0), (9.0, 13.0, 6.6),
             S.MAT_GRAVEL, block=2.6, n=14, seed=401.0, yaw=yaw)

    # ── two trestle conveyors, one per product ──────────────────────────────
    # "belt conveyors with full-length skirting" [MINSYS-DUST], each rising from
    # the crusher to a head pulley over its own stockpile.
    #
    # THE FIRST VERSION OF THIS RAN THEM ACROSS THE FRAME AND MOST OF IT WAS
    # NOT IN THE PICTURE. Projected against the measured frame, `belt0` ran from
    # NDC x -0.67 out to -1.90 and its head, transfer chute, misting cannon and
    # entire stockpile were off the left edge — geometry that cost triangles and
    # was never seen. The frame is only +-22.5 m wide at 56 m, so a 30 m
    # conveyor cannot lie across it at all. They run TOWARD THE CAMERA instead,
    # which is both what keeps them in shot and the stronger composition: a
    # rising diagonal against a wall made entirely of horizontals.
    #
    # It also had a real orientation bug worth recording. `rot=(0, -pitch*sign,
    # yaw)` in Blender's XYZ Euler order resolves to Rz(yaw)*Ry(-pitch*sign), so
    # the box's long axis comes out along +RIGHT WHATEVER `sign` is — while its
    # own trestles and drums were placed along RIGHT*sign. For `sign = -1` the
    # gantry therefore pointed the opposite way to the legs holding it up. A
    # 30 m plate at a wrong angle is what the coloured moire in the top-left of
    # shots/q5-quarry-bench.png was.
    #
    # So a conveyor is now defined by its two ENDS in frame coordinates and the
    # orientation is derived from the vector between them. There is no `sign`.
    def conveyor(k, d0, a0, z0, d1, a1, z1, stock_r):
        """Tail (d0, a0, z0) to head (d1, a1, z1), all in frame coordinates."""
        x0, y0 = on_axis(d0, a0)
        x1, y1 = on_axis(d1, a1)
        dx, dy, dz = x1 - x0, y1 - y0, z1 - z0
        run = math.hypot(dx, dy)
        length = math.hypot(run, dz)
        # A box's local +X lies along `v` when it is rotated (0, -pitch, yaw) in
        # Blender's XYZ order: Rz(yaw)*Ry(-pitch)*X = (cos y cos p, sin y cos p,
        # sin p). Derived, not guessed — see the note above.
        ang = math.atan2(dy, dx)
        pitch = math.atan2(dz, run)
        rot = (0.0, -pitch, ang)
        mx, my, mz = (x0 + x1) * 0.5, (y0 + y1) * 0.5, (z0 + z1) * 0.5

        # NOT SOURCED — the gantry section and footing depth are authored plant
        # geometry. Derive support tops from that section, rather than another
        # independent height: the previous tz - 0.9 left every trestle detached.
        gantry_depth = 0.55
        footing_z = -1.6
        # Vertical intersection with the underside of the pitched box at its
        # centreline; section thickness is measured normal to the run.
        underside_offset = gantry_depth * 0.5 / math.cos(pitch)
        for t in range(5):
            f = (t + 0.5) / 5.0
            tz = z0 + dz * f
            S.tube('belt%d-trestle-%d' % (k, t), 0.16,
                   tz - underside_offset - footing_z, S.MAT_DARK,
                   loc=(x0 + dx * f, y0 + dy * f, footing_z), sides=6)
        S.box('belt%d-gantry' % k, (length, 1.5, gantry_depth), S.MAT_DARK,
              loc=(mx, my, mz), rot=rot)
        # THE BELT AND ITS SKIRTING ARE ONE OBJECT, AND THAT IS A DECISION.
        # [MINSYS-DUST] specifies "full-length skirting" — the continuous rubber
        # lip down both sides that keeps the fines on the belt — and it was first
        # modelled as it is built, two strips 90 mm thick and 30 m long. That is
        # SUB-PIXEL GEOMETRY: at 56 m a 90 mm edge is a fraction of a pixel and a
        # 30 m x 0.09 m face carries its texture at 330:1. Detail below the
        # resolution of the shot does not read as detail, it reads as noise, and
        # it costs triangles to produce the noise. So the belt is drawn at the
        # width of belt-plus-skirting, which is the silhouette the two of them
        # actually make at this range.
        S.box('belt%d-belt' % k, (length, 1.30, 0.34), S.MAT_RUBBER,
              loc=(mx, my, mz + 0.44), rot=rot)
        for e, (ex, ey, ez) in enumerate(((x0, y0, z0), (x1, y1, z1))):
            drum_width = 1.4                 # NOT SOURCED — authored plant width
            # tube() starts at its base. Centre the drum across the belt by
            # offsetting that base half a width opposite its rotated +Z axis.
            S.tube('belt%d-drum-%d' % (k, e), 0.34, drum_width, S.MAT_STEEL,
                   loc=(ex - math.sin(ang) * drum_width * 0.5,
                        ey + math.cos(ang) * drum_width * 0.5, ez + 0.44),
                   rot=(math.pi * 0.5, 0.0, ang), sides=10)

        # ── the transfer point, and the misting cannon on it ────────────────
        # [MINSYS-DUST] puts sprays "at feed chutes, crusher inlets and transfer
        # points" specifically, so the cannon goes where the source says.
        S.box('belt%d-chute' % k, (1.6, 1.6, 2.8), S.MAT_DARK,
              loc=(x1, y1, z1 - 1.6), rot=(0.0, 0.0, ang))
        ccx, ccy = on_axis(d1 + 2.4, a1 + 2.4)
        S.tube('cannon%d-mast' % k, 0.13, 5.0, S.MAT_DARK, loc=(ccx, ccy, -1.6), sides=6)
        S.tube('cannon%d-barrel' % k, 0.44, 1.5, S.MAT_STEEL,
               loc=(ccx, ccy, 3.2), rot=(1.15, 0.0, ang), sides=12)

        # ── the conical stockpile under the head ────────────────────────────
        # "conical stockpiles graded by product size" [§A.4 photograph, I]. The
        # angle of repose that sets a real cone's shape is a property of the
        # material and is NOT quoted here; these are built as rubble so they
        # read as heaped stone rather than as turned cones.
        sx2, sy2 = on_axis(d1 - 2.0, a1 - 1.0)
        S.rubble('stock%d' % k, (sx2, sy2, z1 * 0.28),
                 (stock_r * 2, stock_r * 2, z1 * 0.62), S.MAT_GRAVEL,
                 block=2.2, n=18, seed=500.0 + k * 17, yaw=yaw)

    # Heads placed by NDC, not by eye. `belt0`'s first head landed at
    # (-0.91, +0.82) — jammed into the top-left corner against bright sky,
    # which is the worst place on the screen to put a high-contrast thin
    # object and is where the aliased patch in shots/qb-quarry-bench.png was.
    #        k   tail (d, across, z)      head (d, across, z)      stockpile r
    conveyor(0, D - 1.0, -13.5, 2.2,     D - 14.0, -12.5, 8.2,     6.0)
    conveyor(1, D + 1.0, -12.0, 2.2,     D + 8.0,  -18.0, 8.0,     5.0)

    # ── the vibrating screen house ──────────────────────────────────────────
    scx, scy = on_axis(D + 8.0, -20.0)
    for sx in (-2.4, 2.4):
        for sy in (-2.0, 2.0):
            S.tube('screen-leg-%.0f-%.0f' % (sx, sy), 0.17, 7.0, S.MAT_DARK,
                   loc=(scx + sx, scy + sy, -1.6), sides=6)
    S.box('screen-body', (5.6, 4.6, 3.2), S.MAT_STEEL, loc=(scx, scy, 7.0), bevel=0.06)
    S.box('screen-deck', (6.0, 5.0, 0.32), S.MAT_DARK, loc=(scx, scy, 5.5))
    # (no 80 mm rail plate here either — see the crusher)


# ═════════════════════════════════════════════════════════════════════════════
# NAMED NODES
# ═════════════════════════════════════════════════════════════════════════════

def build_anchors():
    """The nodes the game reads off this site.

    `mount:` is reused rather than a new prefix — `src/core/gltfRig.js` already
    indexes it and `finish()` already restores its world transform after the
    join, which is the contract that took the longest to get right (ASTRA §4).
    None of these carries `cone_deg`/`range_m`, so none is read as a lamp: a
    quarry bench works in daylight and `research/16` §A.4 asks for no lighting
    on one. Inventing floodlights here would be inventing a detail.
    """
    S.anchor('site-collar', (0.0, 0.0, 0.0))
    cx, cy = on_axis(24.0, CREST_ACROSS)
    S.anchor('site-crest', (cx, cy, 0.0))
    fx, fy = on_axis(FACE_DIST, 6.0)
    S.anchor('site-face', (fx, fy, 0.0), face_h=FACE_H)
    px, py = on_axis(62.0, -13.0)
    S.anchor('site-plant', (px, py, 0.0))


# ═════════════════════════════════════════════════════════════════════════════

def build(out_path):
    S.reset()
    build_highwall()
    build_shot()
    build_bench()
    build_plant()
    build_anchors()
    return S.finish(out_path)


if __name__ == '__main__':
    out = os.path.abspath(os.path.join(HERE, '..', '..', 'public', 'models', 'sites'))
    os.makedirs(out, exist_ok=True)
    build(os.path.join(out, 'quarry-bench.glb'))


# ═════════════════════════════════════════════════════════════════════════════
# THE EDGE ARTEFACT — historical captures; cause remains unverified
#
# Geometry from this model that reaches the outer ~6 % of the surface band's
# WIDTH comes back as vertical coloured speckle along that edge. Measured:
#
#   · it is present in shots/q4, q5, q6, qb and qc — every build — always at
#     the same screen position, in the outer ~40 px of a 744 px band;
#   · the SAME FRAME with only `site:quarry-bench` set invisible has none of it
#     (shots/qb-quarry-noglb.png). So it is this model's geometry that triggers
#     it;
#   · it did NOT move when the conveyors were rewritten twice and repositioned.
#     That supports a screen-position dependency, but does not establish which
#     renderer, material or geometry operation causes it.
#
# The surface band is a SCISSORED region of one shared context with a shared
# post chain (src/core/renderer.js), and the procedural site never put a
# high-contrast object against that boundary — nothing in the six-cone quarry
# reached the frame edge at all. A post-process that samples its neighbourhood
# across a scissor boundary is one SUSPICION, not a diagnosed renderer defect.
# `src/core/renderer.js` requires a live reproduction with the post chain
# isolated before its ownership of the defect can be established.
#
# What this file does about it: keeps its own geometry inboard of about
# NDC x -0.85. That is a mitigation, not a fix, and it should be removed when
# the cause is found.
# The 2026-09-05 WIP finalization corrected detached conveyor supports and
# off-centre drums, verified in isolated CPU renders. Those renders do not
# exercise the game's post chain and make no claim to resolve this artefact.
# ═════════════════════════════════════════════════════════════════════════════
