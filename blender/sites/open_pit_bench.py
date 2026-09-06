"""
SITE — `open-pit-bench`.  Exports to `public/models/sites/open-pit-bench.glb`.

A LARGE EXCAVATION WHOSE BENCHES ARE THE HORIZON.  The player stands on the
lowest working cut of a mid-size open pit: a production blast pattern pegged out
at their feet, the next lift standing 15 m over the ground to screen-right with
a shovel loading out of its toe, and — 190 m across the hole — the pit's own far
wall, eight benches of engineered batter-and-berm closing the sky, with the haul
ramp cut diagonally into it at a real gradient and a haul truck on it.

────────────────────────────────────────────────────────────────────────────
HOW THIS IS A DIFFERENT KIND OF PLACE FROM `quarry-bench`, DELIBERATELY
────────────────────────────────────────────────────────────────────────────
`blender/sites/quarry_bench.py` already exists and is a good blasted highwall.
Building a bigger one here would have produced two models of the same picture.
They are separated on SIX axes, and every one of them is a fact about the two
industries rather than a styling choice:

  1. SUBJECT.  The quarry's subject is ONE WALL on ONE SIDE at 34 m, with the
     floor opening past it to a drop.  The pit's subject is A BOWL: a ring
     closing 360 degrees around the player, seen across 190 m of floor.  In the
     quarry you stand BESIDE a face.  In the pit you stand INSIDE a hole.
  2. SCALE, AND IT IS SOURCED ON BOTH SIDES.  The quarry's face height is
     explicitly NOT SOURCED — `research/16` §A.4 found that no regulation names
     one — so it is solved against the frame at 7.5 m and says so.  A pit's
     bench geometry is the opposite case: bench height, face angle, berm width,
     inter-ramp angle, ramp width and ramp grade are ENGINEERED, PUBLISHED
     NUMBERS, and this file carries them at true scale.  15 m benches against
     7.5 m: the pit's ONE bench is twice the quarry's WHOLE wall.
  3. THE THING BEYOND.  The quarry's far object is the PLANT — crusher,
     trestle conveyors, graded stockpiles, misting cannons.  A pit has no plant
     on the bench; the far object is MORE PIT.  There is no crusher, no
     conveyor, no stockpile and no product in this file, and that absence is
     the archetype.
  4. THE HAUL ROAD.  The quarry's runs off the bench and out of shot on the
     flat.  The pit's CLIMBS THE WALL at a sourced 10 % on a sourced 33.5 m
     width, cutting the bench stack, and is the only diagonal in a frame made
     of horizontals.  It is also the reason a pit's OVERALL slope is flatter
     than its inter-ramp slope, which is a thing you can see here.
  5. THE PATTERN.  The quarry drills 102 mm on a 2.55 m burden.  This is a
     203 mm production pattern on a 6.09 m burden and a 7.92 m spacing — one
     row of this pattern is wider than the quarry's whole shot, and the grid
     reads coarser at the same range because it IS coarser.
  6. THE FLEET.  A quarry bench has no haul fleet in shot.  A pit is a
     load-and-haul machine: an excavator at a muckpile, a truck under it, and
     a second truck on the ramp are what make 120 m of wall legible as 120 m.

────────────────────────────────────────────────────────────────────────────
SOURCES — every engineered dimension below traces to one of these
────────────────────────────────────────────────────────────────────────────
  [RYAN-PRYOR]  Ryan, T.M. & Pryor, P.R. (2000), "Designing Catch Benches and
                Interramp Slopes", Ch.3 of the SME slope-design reference,
                hosted by Call & Nicholas Inc.
                https://www.cnitucson.com/publications/2000_ch3__Catch%20Bench_sme_tr_pp.pdf
                  · "most large mining operations drill and blast on 12- to
                    15-m intervals (40 to 50 ft), with 15-m intervals being the
                    most common"
                  · EQ 3.1, the Modified Ritchie Criterion:
                    bench width (m) = 0.2 x bench height + 4.5 m
                  · catch benches left "at every mining level (single benching)
                    or at every other mining level (double benching)"
                  · the interramp relation tan(psi) = H / (W + H cot(beta))
                  · design containment berm height 1.5 m on a 12 m bench,
                    2.1 m on a 24 m double bench
                  · BACKBREAK: "the horizontal distance between the planned toe
                    and the actual mined crest of the final bench slope"

  [CMM-43-101]  Copper Mountain Mine NI 43-101 Technical Report, 5 Dec 2023 —
                a REAL, PUBLISHED, INTERNALLY CONSISTENT PIT DESIGN, and the
                single source most of this file's wall is built from.
                https://s23.q4cdn.com/405985100/files/doc_downloads/tech_reports/canada/cmm-ni-43-101-technical-report-dec-5-2023.pdf
                  · 15 m single bench / 30 m double bench, batter 70 deg in
                    most zones (Table 16-1)
                  · catch benches 8.0-14.4 m single-bench, 10.5-15.9 m double
                  · interramp angles 24-55 deg across 15 geotechnical sectors
                  · "Ramp widths are designed at 33.5 m when accommodating
                    dual-lane traffic... a designed ramp width of 25 m" single
                  · "All ramp grades are designed at 10%"

  [CALL-1986]   Call, R.D. (1986) is the origin of the Modified Ritchie
  [NIOSH-MRC]   Criterion, extrapolated from Ritchie's 1963 HIGHWAY rockfall
                ditch testing.  Warren, S. et al. (NIOSH), "Revisiting Rockfall
                Catch Bench Design Criteria", gives the attribution chain and
                the imperial form W(ft) = 0.2 H(ft) + 15 ft, and states that
                NIOSH is currently REVISING the criterion because catchment
                depends on more than bench height.
                https://stacks.cdc.gov/view/cdc/215575/cdc_215575_DS1.pdf

  [SRK-BFA]     Gibson, de Bruyn & Walker (SRK), "Considerations in the
                Optimisation of Bench Face Angle and Berm Width Geometries for
                Open Pit Mines", SAIMM: analysed 65/75/85/90 deg; "a bench face
                angle in the order of 75 deg is optimal" and "angles as low as
                65 deg should be avoided if possible".
                https://www.saimm.co.za/Conferences/RockSlopes/557-578_Gibson.pdf

  [MSHA-56.3130] 30 CFR 56.3130: "When benching is necessary, the width and
                height shall be based on the type of equipment used for
                cleaning of benches or for scaling of walls, banks, and
                slopes."  A PERFORMANCE STANDARD — the regulator prescribes no
                numeric bench width at all.
                https://www.law.cornell.edu/cfr/text/30/56.3130

  [MSHA-56.9300] 30 CFR 56.9300 / 57.9300: "Berms or guardrails shall be at
                least mid-axle height of the largest self-propelled mobile
                equipment which usually travels the roadway."
                https://www.law.cornell.edu/cfr/text/30/57.9300

  [KAUFMAN-AULT] Kaufman, W.W. & Ault, J.C. (1977), "Design of Surface Mine
                Haulage Roads — A Manual", US Bureau of Mines IC 8758.
                https://archive.org/details/designofsurfacem00kauf_0
                  · lane width from the 1965 AASHO rule: each lane provides
                    clearance left and right "equivalent to one half the
                    vehicle width", i.e. a lane is ~2 x vehicle width
                  · "Many mine operators have found optimum operating
                    conditions reflected on maximum sustained grades no greater
                    than 7% to 9%"; "it is reasonable to accept 10% as maximum
                    safe sustained grade limitation"
                  · berm height: "its height must be equal to or greater than
                    the rolling radius of the vehicle's tire"

  [OSMRE-ROT]   US OSMRE, "Blast Design Rules of Thumb" (2016), imperial:
                burden B(ft) = 2-3 x d(in), typically 2.5; spacing S = 1-2 x B,
                typically 1.5; stemming T = 0.5-1.0 x B, typically 0.7.
                https://www.osmre.gov/sites/default/files/inline-files/5rulesofThumb2016_0.pdf

  [OSMRE-BLAST] US OSMRE, "Surface Blast Design", Module 3 — subdrilling
                practice, stemming material, controlled-blasting methods.
                https://www.osmre.gov/sites/default/files/inline-files/Module3_0.pdf

  [PSU-MNG230]  Penn State MNG 230 "Pit Terminology" — toe, crest, bench face,
                bench floor, catch bench, and "safety berm height should be
                greater than or equal to the tire radius of the largest truck".
                https://courses.ems.psu.edu/mng230/node/877

  [NAT-BLAST]   research/16 §G — open-pit blast design and bench geometry,
                https://www.nature.com/articles/s41598-025-90242-6
                (hole depths 3.5-10.5 m; burden 3-3.5 m; spacing 3.5-6 m;
                stemming 1.5-4.0 m — a SMALLER pit than this one; see BURDEN)

  [PQ-L4]       Pit & Quarry University Lesson 4 — stemming and the "rifle" /
                "gun-barrel" effect; "Water is injected into the air stream to
                create a water-vapor mist that helps dampen fine dust
                generation as well as assist in stabilizing the collar zone".
                https://www.pitandquarry.com/pq-university-lesson-4-drilling-and-blasting/

  [GF-STIVES]   research/16 §G — a real gold operation's mining description:
                benches 5-10 m in 2.5-3 m FLITCHES, 90-180 t trucks and
                150-350 t excavators, and "Grade control is generally expedited
                by inclined RC drilling on grids determined by the ore body
                characteristics".
                https://www.goldfields.com/reports/annual_report_2016/minerals/reg-aus-ives-mining.php

  [DMA-GC]      Grade-control drilling in open pits — RC "supports fast
                sampling cycles and adapts well to confined in-pit
                environments".  https://drillmastersafrica.com/grade-control-drilling-open-pit-mining/

  [EPIROC-BH]   research/16 §G — surface blasthole rig class band, 152-406 mm
                holes.  CITED FOR THE CLASS CAPABILITY BAND ONLY, never as a
                claim about a company.

Machine dimensions and their sources are cited at `FLEET` below.

────────────────────────────────────────────────────────────────────────────
WHAT IS **NOT SOURCED**, marked again at every use rather than invented
────────────────────────────────────────────────────────────────────────────
  · THE PIT'S PLAN SIZE AND WHERE THE PLAYER STANDS IN IT.  A pit's outline is
    the orebody's, and no source gives one.  `TOE_R`, the toe wander, the
    azimuth of the mid lift and the ramp's phase are AUTHORED COMPOSITION
    solved against the hero frame, exactly as `quarry_bench.py` does, and none
    of them may be quoted back as a mining fact.
  · THE NUMBER OF BENCHES, hence the 120 m wall height.  Real pits run from
    tens of metres to over 1 km deep ([CMM-43-101] is one of the shallower
    ones); eight is what the frame can hold.
  · BACKBREAK MAGNITUDE.  [RYAN-PRYOR] defines backbreak and shows it; it
    gives no amplitude, because it is a property of the rock and the shot.  The
    +-2.4 m crest wander here is authored.
  · CONTAINMENT BERM HEIGHT ON A 15 m BENCH.  [RYAN-PRYOR] publishes 1.5 m at
    12 m and 2.1 m at 24 m.  15 m is BETWEEN those two and this file uses
    1.5 m — the published lower figure, not an interpolation, because
    interpolating between two design values is inventing a third.
  · MUCKPILE GEOMETRY and the angle of repose of blasted rock.  No primary
    source for either could be reached; neither is asserted anywhere in this
    file.  See `build_muck()`.
  · EVERY COLOUR.  See COLOUR.

────────────────────────────────────────────────────────────────────────────
MATERIALS — FOUR, AGAINST A BUDGET OF SIX
────────────────────────────────────────────────────────────────────────────
See THE BUDGET in `blender/lib/site.py`: a site .glb costs ONE DRAW CALL PER
MATERIAL once `finish()` joins the statics, and eight of twenty-one method
states are already over the surface band's ceiling of 80 with no .glb on the
site at all.  Six is the ceiling.  This file spends FOUR:

    blastedRock    bench faces, the mid lift, muckpile, spill, road windrows
    gravel         catch benches AND THEIR CONTAINMENT LIPS, the ramp road and
                   its safety berm, the floor haul road, collar cuttings,
                   stemming, drill-pad fines
    paintedDark    haul trucks, face shovel, rotary drill, posts, tyres
    safetyStripe   road delineators, hazard bands on the plant

The two it does not spend are given back, and they are the two that matter:
a pit wall is not a place for bright steel, and there is no processing plant
here to paint.  VARIETY WITHIN a material is bought with VERTEX COLOURS, which
are free in draw calls — `src/world/terrain.js` `siteMaterial()` binds
`vertexColors: true` per mesh when COLOR_0 is present and multiplies the
procedural `assets.js` texture by it.  They are LUMINANCE MODULATIONS, not
painted colours, so `blastedRock` and `gravel` keep their own hue and their own
gameplay-driven wear.

WHAT THE VALUE CARRIES, AND WHAT IT DOES NOT.  An earlier version of this note
said the step between "a shaded batter and a sunlit catch bench" was the single
thing that made eight benches read.  IT IS NOT, and the render said so: the eye
is at 2.25 m and every bench top on this wall is 15 m or more above it, so no
catch bench top is ever in frame.  The value carries the FACE's own per-segment
and per-bench variation; the BENCH LINES are carried by the containment lips,
which are vertical.  See `build_wall()`.

TRIANGLES ARE THE LANE TO SPEND IN, BUT NOT AT ANY RANGE.
`quarry_bench.py` learned this the expensive way: 90 mm belt skirting at 56 m
is a fraction of a pixel and reads as noise, not as detail.  The same
arithmetic decides the whole allocation here, and it runs the OTHER way from
the quarry's, because this site's subject is 200-330 m away:

    range        1 m of world is        so
    -----------------------------------------------------------------
    20-45 m      88-39 px               the pattern, collars, stemming and
                                        cuttings are worth authoring
    80-130 m     25-15 px               the mid lift, the muckpile and the
                                        fleet read fully
    190-330 m    10.5-6.0 px            a 1.5 m block is 9-16 px, so the far
                                        wall is NOT limited by resolution.
                                        It is limited by FOG (68-95 % here)
                                        and by BUILD TIME, and it is built
                                        from crest lines and value rather
                                        than from `rubble()` for those two
                                        reasons.  See `build_wall()`.

(1 m of world = 740 px / (0.3703 x d), the measured frame's vertical extent
over the surface band.  An earlier draft of this table said 3.5 px at
200-330 m, which is wrong by a factor of three; it is corrected here and the
decision it was used to justify is re-argued rather than re-asserted.)

AND ONE MORE THING THE FIRST RENDER FOUND, WHICH NO ARITHMETIC WOULD HAVE:
THE EYE IS AT 2.25 m, SO EVERY HORIZONTAL SURFACE ON A 15 m BENCH IS SEEN FROM
UNDERNEATH AND ITS TOP NEVER APPEARS.  The whole composition is carried by
VERTICAL surfaces — the containment lips, the ramp's safety berm, the faces.
Written up at `build_wall()`.

AND THE GAME'S OWN FOG IS PART OF THE COMPOSITION, NOT AN ACCIDENT.
`src/core/env.js` runs FogExp2 at densities 0.0035-0.0150 by region and
weather.  FogExp2 is 1 - exp(-(d*rho)^2), so at rho = 0.0052 the far wall at
250 m is 82 % fog colour and at 330 m it is 94 %.  THE FAR WALL WILL RENDER AS
A HAZED SILHOUETTE, and that is correct — a pit wall 250 m away in dust is a
hazed silhouette.  It is also why the internal detail budget is spent near and
the far wall is carried by silhouette and by the face/bench value step, which
survive fog proportionally.  Nothing here pre-bakes haze into vertex colour:
that would double the effect the renderer already applies.

────────────────────────────────────────────────────────────────────────────
AXES
────────────────────────────────────────────────────────────────────────────
`blender/lib/site.py` AXES.  Metres, Blender Z-up, exported with
`export_yup=True`.  Origin is the hole collar at ground level.  Blender +Y is
AWAY from the hero camera; Blender -Y is toward it.

Build:      blender --background --python blender/sites/open_pit_bench.py
Inspect:    ...same, then `-- --preview` to re-import the REAL export and
            render it from the game's own hero camera on Cycles CPU.
"""

import importlib.util
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(HERE, '..', 'lib'))


def _load_site_lib():
    """Load `blender/lib/site.py` BY PATH.

    `site` is a CPython standard-library module — it is what runs during
    interpreter start-up to set up `sys.path` — so `sys.modules['site']`
    already holds the stdlib one and a plain `import site` returns THAT
    however `sys.path` is ordered.  The failure is silent in the worst way:
    the import succeeds and the first call dies with `AttributeError: module
    'site' has no attribute 'reset'` from somewhere that looks unrelated.
    `quarry_bench.py` documents the same trap; this is the same fix, under a
    name that cannot collide with it.
    """
    path = os.path.normpath(os.path.join(HERE, '..', 'lib', 'site.py'))
    spec = importlib.util.spec_from_file_location('drillity_pit_site', path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules['drillity_pit_site'] = mod
    spec.loader.exec_module(mod)
    return mod


S = _load_site_lib()

D2R = math.pi / 180.0
TAU = math.pi * 2.0


# ═════════════════════════════════════════════════════════════════════════════
# THE HERO FRAME — INHERITED MEASUREMENT, NOT RE-MEASURED HERE
#
# `blender/sites/quarry_bench.py` measured the live hero camera on 2026-09-05
# by projecting probe points through `ctx.camera` and bisecting for the NDC
# edges, holding the probe until `terrain.archetype` and the ground mesh both
# agreed the site was really up.  That measurement was expensive — two earlier
# attempts measured the WRONG CAMERA, once from `terrain.js`'s quoted figures
# and once from the boot camera during its ~28 s shader compile — and it is
# reused here rather than re-derived.
#
# IT IS NOT RE-MEASURED IN THIS PASS AND THIS FILE DOES NOT CLAIM TO HAVE
# MEASURED IT.  The GPU lease on this machine is held by another track, so no
# headed capture was available.  Two independent checks were run instead:
#
#   · the eye position is `CAMERA_MODES.hero.pos` in `src/core/renderer.js`
#     verbatim — [8.40, 2.25, 10.94] three.js — and the plan direction below
#     reproduces `hero.look` [-1.55, 2.60, 0.00] to four decimals.  The camera
#     mode is GLOBAL, not per-archetype, so a measurement taken on the quarry
#     is the same camera this site gets.
#   · the vertical half-angles are consistent with a 20.97 deg vertical field
#     pitched 1.36 deg up: atan(0.2065) - 1.36 = 10.31 deg and
#     atan(0.1638) + 1.36 = 10.66 deg, which agree to a third of a degree.
#
# WHAT IS NOT VERIFIED is the HORIZONTAL constant.  `renderer.js` `fovForBand()`
# holds the horizontal field CONSTANT across band aspects while the vertical
# field varies with how much chrome the HUD carves off, so `HALF_W_K` should be
# layout-invariant and `TOP_K`/`BOT_K` should not.  0.4023 does not reconcile
# with `tan(34/2) * refBandAspect` = 0.3185 by a factor of 1.26, and that gap is
# unexplained.  THIS SITE IS BUILT SO THAT THE GAP DOES NOT MATTER: its subject
# is a ring closing 360 degrees, so it fills the frame at any horizontal field,
# and its vertical composition was solved against BOTH the measured frame and
# the wider one implied by the declared 34 deg fov — the bench stack puts four
# crest lines in frame on the first and seven on the second, and closes the sky
# on both.  See research/sites/open-pit-bench.md.
#
# three.js (x, y, z) -> Blender (x, -z, y)
# ═════════════════════════════════════════════════════════════════════════════
EYE = (8.400, -10.940, 2.250)
AXIS = (-0.6731, 0.7401)           # plan view direction, Blender XY
RIGHT = (0.7401, 0.6731)           # screen-right in plan, Blender XY
EYE_Z = 2.250
TOP_K = 0.2065                     # metres of frame above eye level, per metre out
BOT_K = 0.1638                     # metres below
HALF_W_K = 0.4023                  # metres of half-width per metre out


def on_axis(dist, across=0.0):
    """Blender (x, y) at `dist` metres along the hero view axis, `across` metres
    across the frame (+ is screen-right)."""
    return (EYE[0] + AXIS[0] * dist + RIGHT[0] * across,
            EYE[1] + AXIS[1] * dist + RIGHT[1] * across)


def to_frame(x, y):
    """The inverse: world (x, y) -> (dist along the axis, across the frame)."""
    dx, dy = x - EYE[0], y - EYE[1]
    return dx * AXIS[0] + dy * AXIS[1], dx * RIGHT[0] + dy * RIGHT[1]


def half_width(dist):
    return dist * HALF_W_K


def ndc_y(dist, height):
    """-1 is the bottom of the surface band, +1 the top.  The measured horizon
    sits at about -0.12."""
    top = EYE_Z + TOP_K * dist
    bot = EYE_Z - BOT_K * dist
    return 2.0 * (height - bot) / (top - bot) - 1.0


def ndc_x(dist, across):
    return across / max(1e-6, HALF_W_K * dist)


# ═════════════════════════════════════════════════════════════════════════════
# VERTEX COLOUR — variety without draw calls
#
# `terrain.js siteMaterial()` binds `mat(kind, {color: 0xffffff,
# vertexColors: true})` for any mesh carrying COLOR_0, so the authored colour
# MULTIPLIES the procedural `assets.js` texture.  White therefore means "the
# material's own appearance, untouched", and everything below is a LUMINANCE
# MODULATION of a real material rather than a painted colour.  That is
# deliberate: a fixed authored hue in a .glb would stop the region's palette
# reaching the pit walls, and `blastedRock` and `gravel` already carry the
# rock's colour and its gameplay-driven wear.
#
# `urban_plot.py` found that the attribute alone is not enough — Blender's glTF
# exporter writes COLOR_0 only when the MATERIAL consumes it, and the first
# real export there "collapsed COLOR_0 to white despite the authored attributes
# in Blender".  So the node link below is load-bearing, not decoration.
# ═════════════════════════════════════════════════════════════════════════════

def colour(o, rgb):
    c = tuple(((rgb >> s) & 255) / 255.0 for s in (16, 8, 0)) + (1.0,)
    attr = o.data.color_attributes.new(name='Color', type='BYTE_COLOR',
                                       domain='CORNER')
    for item in attr.data:
        item.color_srgb = c
    o.data.color_attributes.active_color = attr
    m = o.data.materials[0]
    # Blender 5.2 treats `use_nodes` as deprecated/always-on, so test for the
    # actual consumer rather than the legacy flag.
    if not m.node_tree or not m.node_tree.nodes.get('pit-vertex-colour'):
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        vc = m.node_tree.nodes.new('ShaderNodeVertexColor')
        vc.name = 'pit-vertex-colour'
        vc.layer_name = 'Color'
        m.node_tree.links.new(vc.outputs['Color'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.86
        # NEVER above 0. site.py: +65 to +81 draw calls, size-independent.
        bsdf.inputs['Transmission Weight'].default_value = 0.0
    return o


def cbox(name, size, mat, tint, loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.0):
    return colour(S.box(name, size, mat, loc=loc, rot=rot, bevel=bevel), tint)


def ctube(name, r, h, mat, tint, loc=(0, 0, 0), rot=(0, 0, 0), sides=8):
    return colour(S.tube(name, r, h, mat, loc=loc, rot=rot, sides=sides), tint)


def crubble(name, centre, size, mat, tint, **kw):
    for o in S.rubble(name, centre, size, mat, **kw):
        colour(o, tint)


# ── THE PALETTE.  EVERY VALUE HERE IS **NOT SOURCED** ────────────────────────
# These are luminance modulations, not colours of anything real.  The one
# relationship that is not arbitrary is FACE:BENCH.  `src/world/terrain.js`
# authored the same step for its procedural pit and wrote down why: "What reads
# at 60-130 m is FORM: the value step between a vertical face standing in its
# own shade and a horizontal catch bench facing open sky.  On a real pit that
# is about 2.3:1, and it is authored here as one — face x0.58, bench top x1.30
# — instead of being left to three albedos that happen to be the same colour."
# The same 2.4:1 is carried here, for the same reason, at four times the range.
COL_FACE = 0x635F59         # a batter standing in its own shade
COL_FACE_HI = 0x928C82      # the sunlit end of the per-segment variation
COL_BENCH = 0xE9E4DA        # a dozed catch bench facing open sky  (2.4 : 1)
COL_ROAD = 0xD9D2C6         # graded running surface, tracked and damp
COL_MUCK = 0x8B857C         # freshly blasted rock, no weathered rind yet
COL_FINES = 0xCFC7B8        # drill cuttings and stemming
COL_STEEL = 0x8E9399        # unpainted structure
COL_TYRE = 0x1A1B1D
COL_BODY = 0xC98A22         # plant amber, the fleet colour
COL_BODY_2 = 0x9E6E1C
COL_HAZARD = 0xE8E2D2       # safetyStripe carries its own diagonals


# ═════════════════════════════════════════════════════════════════════════════
# THE ENGINEERED GEOMETRY — the part of this site that is fully sourced
#
# One coherent published pit design is used rather than a pick-and-mix, because
# bench height, face angle, berm width and interramp angle are FOUR NUMBERS
# THAT MUST AGREE and a mixture of four sources will not.  [CMM-43-101] is a
# real pit whose report prints all of them, and the relation from [RYAN-PRYOR]
# reproduces its published interramp angle from its own bench geometry to
# 0.01 degrees — see `_verify_geometry()`, which runs on every build.
# ═════════════════════════════════════════════════════════════════════════════

# [RYAN-PRYOR]: "most large mining operations drill and blast on 12- to 15-m
# intervals... with 15-m intervals being the most common".  [CMM-43-101]
# Table 16-1 uses 15 m single benches.
BENCH_H = 15.0

# [CMM-43-101]: batter angles by zone run 37 deg and 59.7-73.7 deg, "most
# commonly 70".  [SRK-BFA] independently: 75 deg optimal, "angles as low as
# 65 deg should be avoided if possible" — 70 sits between the two and is what
# the real design uses.
FACE_ANGLE = 70.0

# CATCH BENCH WIDTH.  [CMM-43-101] single-bench catch benches run 8.0-14.4 m;
# 8.0 is its narrowest, and the narrowest is the one that has to be defended.
# [RYAN-PRYOR] EQ 3.1, the Modified Ritchie Criterion, is the defence:
#     bench width (m) = 0.2 x bench height + 4.5  =  0.2 x 15 + 4.5  =  7.5 m
# so 8.0 clears the criterion by half a metre.  `_verify_geometry()` asserts
# that, so the pair can never silently drift apart.
#
# [MSHA-56.3130] prescribes NO number: "the width and height shall be based on
# the type of equipment used for cleaning of benches or for scaling of walls".
# [NIOSH-MRC] records that the MRC is Call's 1986 extrapolation of Ritchie's
# 1963 HIGHWAY ditch testing and that NIOSH is currently revising it.  Neither
# of those makes 8.0 m wrong; both mean it must not be printed as a rule.
BERM_W = 8.0

FACE_RUN = BENCH_H / math.tan(FACE_ANGLE * D2R)      # 5.460 m of batter run
MODULE = FACE_RUN + BERM_W                           # 13.460 m out per 15 m up

# [RYAN-PRYOR] Fig 3.1: tan(psi) = H / (W + H cot(beta)).  DERIVED, not chosen.
INTERRAMP = math.degrees(math.atan(BENCH_H / (BERM_W + FACE_RUN)))   # 48.10 deg

# CONTAINMENT BERM on the outer lip of a catch bench.  [RYAN-PRYOR]'s design
# table gives 1.5 m on a 12 m bench and 2.1 m on a 24 m double bench.  15 m is
# between them; this uses the published 1.5 m rather than interpolating, because
# an interpolation between two design values is a third value nobody published.
CATCH_LIP_H = 1.5

# THE HAUL RAMP.  [CMM-43-101]: "Ramp widths are designed at 33.5 m when
# accommodating dual-lane traffic"; "All ramp grades are designed at 10%".
# [KAUFMAN-AULT] independently: 10 % is "maximum safe sustained grade
# limitation", and the AASHO lane rule (a lane is about 2 x vehicle width) puts
# a two-lane road for a 7.7 m truck at ~31 m before the extra width the same
# manual requires for passing a disabled vehicle.  The two agree.
#
# THE COMMONLY-QUOTED "3.5 x VEHICLE WIDTH" RULE IS **NOT USED** AND SHOULD NOT
# BE.  It is attributed everywhere to [KAUFMAN-AULT] Table 9, and that table is
# a scanned GRAPHIC in the only copy of the manual available — the multiplier
# could not be read from the primary document.  A published ramp width from a
# real design is worth more than a multiplier nobody can check.
RAMP_W = 33.5
RAMP_GRADE = 0.10

# THE NUMBER OF BENCHES — **NOT SOURCED**, and the reason the pit is this deep.
# Real pits run from tens of metres to over a kilometre.  Eight 15 m benches is
# what the hero frame can hold: the fourth crest lands at the top edge of the
# measured frame and the seventh at the top edge of the wider frame implied by
# the declared 34 deg fov, so the sky is closed either way with margin.
N_BENCH = 8
PIT_DEPTH = N_BENCH * BENCH_H                        # 120 m of wall

# OVERALL SLOPE ANGLE — DERIVED, and it is the thing the ramp exists to explain.
# A stack of benches alone stands at the INTERRAMP angle.  The overall slope is
# flatter, because the haul road is cut into the same wall and takes its width
# out of the profile.  One 33.5 m ramp crossing this 120 m wall gives
#     atan(120 / (8 x 13.460 + 33.5)) = 40.4 deg
# against an interramp of 48.1.  That 7.7 degrees IS the ramp, and it is
# visible in this model as the step in the crest lines where the ramp passes.
OVERALL_SLOPE = math.degrees(
    math.atan(PIT_DEPTH / (N_BENCH * MODULE + RAMP_W)))


# ── THE PRODUCTION PATTERN ───────────────────────────────────────────────────
# HOLE DIAMETER — 203 mm (8 in), and it is the one diameter THREE independent
# constraints all admit:
#   · [EPIROC-BH] puts surface blasthole rigs on 152-406 mm.
#   · `research/03` puts tracked surface crawlers — the class `data.js` sends
#     to this archetype as the hero rig — on 27-229 mm.
#   · the production drill modelled at the far end of this same pattern is
#     published at 203-311 mm (`DRILL_HOLE_MIN`), so 203 is its smallest.
# One bench, two drill classes, one pattern both can actually drill.  Drawing a
# pattern neither machine in the frame could have drilled is exactly the kind
# of thing `research/16` §A.5 complains about.
HOLE_D = 0.203

# [OSMRE-ROT], imperial as published: B(ft) = 2 to 3 x d(in), typically 2.5.
# 2.5 x 8 in = 20 ft = 6.096 m.  The RULE is sourced; the arithmetic is ours.
BURDEN = 2.5 * (HOLE_D / 0.0254) * 0.3048            # 6.096 m

# [OSMRE-ROT]: S = 1 to 2 x B.  1.3 is inside that.  The often-quoted 1.15
# equilateral ratio is NOT used: it could not be traced to a primary source.
SPACING = 1.3 * BURDEN                               # 7.925 m

# [OSMRE-ROT]: T = 0.5 to 1.0 x B, typically 0.7.  [PQ-L4] and [OSMRE-BLAST]
# both require stemming to be sized crushed stone or drill cuttings, against
# the "rifle" or "gun-barrel" effect, and [PQ-L4] adds that front-row stemming
# is increased where the face is less than 90 degrees — which, on a 70 degree
# batter, it always is.
STEM = 0.70 * BURDEN                                 # 4.267 m

# CROSS-CHECK, AND IT DELIBERATELY FAILS ONE WAY.  [NAT-BLAST] measured a real
# open pit at burden 3-3.5 m, spacing 3.5-6 m, stemming 1.5-4.0 m — all smaller
# than the above.  That is not a contradiction: the same source records HOLE
# DEPTHS OF 3.5-10.5 m at that pit, i.e. benches roughly half the height of
# this one, and burden scales with hole diameter, which scales with bench.
# The pattern here is deliberately outside [NAT-BLAST]'s range and the reason
# is written down rather than the range being quietly quoted as cover.
#
# Powder-factor sanity, DERIVED, not sourced: a 15 m bench plus subdrill is a
# ~16.5 m hole, less 4.27 m of stemming leaves ~12.2 m of 203 mm column, i.e.
# 0.395 m3 of explosive; at ANFO's ~0.85 t/m3 that is ~336 kg against
# 6.096 x 7.925 x 15 = 725 m3 of rock, or 0.46 kg/m3.  That is inside the band
# ordinary surface production blasting runs at, which is the check that says
# the three constants above are mutually consistent rather than merely each
# individually inside a range.

# Rows and holes: **NOT SOURCED**.  Pattern extent is set by the tonnage
# wanted; this is what the near frame holds.  Seven holes at 7.925 m is 47.6 m
# of bench across, which runs off both edges of the frame at this range — and
# that is the point: a pit pattern is wider than the picture.
ROWS = 4
HOLES = 7


# ═════════════════════════════════════════════════════════════════════════════
# THE FLEET — real machines, at their published dimensions, under an invented
# marque.  DOMAIN.md §10 / ASTRA.md §1.2: model the real machine accurately,
# then badge it with a marque that is not a real maker's.  NOTHING IN THIS FILE
# CARRIES A BADGE AT ALL — no lettering, no model designation, no data plate —
# because at 90-210 m a badge is sub-pixel and an unreadable badge is not a
# citation.  The MARQUE for this site's plant is `Steinbach`, which is one of
# the invented marques `data.js` already uses, and it appears nowhere in the
# export; it is recorded here so that if a decal is ever added, it is that one.
#
# HAUL TRUCK — a 226.8 t (250 short ton) rigid-frame mine truck.
# Manufacturer specalog AEHQ6868-01 (02-2013), read directly:
#   https://www.kellytractor.com/eng/images/pdf/earthmoving/offhighway_trucks/793F.pdf
TRUCK_L = 13.702                    # overall length, 44 ft 11 in
TRUCK_W = 8.295                     # overall CANOPY width, 27 ft 3 in
TRUCK_H = 5.597                     # height to top of ROPS, 18 ft 4 in
TRUCK_WB = 5.905                    # wheelbase
TRUCK_PAYLOAD_T = 226.8
# Tyre 40.00R57.  Outside diameter from the tyre maker's own data for that
# size, republished with the rolling circumference:
#   https://otrtires.com/product/40-00r57-michelin-xdr2-e4-mb4/
TYRE_OD = 3.579                     # 140.9 in
TYRE_W = 40.0 * 0.0254              # 40.00 section width, 1.016 m

# THE SAFETY BERM HEIGHT, AND IT IS THE ONE NUMBER TWO INDEPENDENT AUTHORITIES
# HAPPEN TO AGREE ON.
#   [MSHA-56.9300], binding: "Berms or guardrails shall be at least mid-axle
#     height of the largest self-propelled mobile equipment which usually
#     travels the roadway."  Mid-axle height on this truck is the wheel centre,
#     i.e. half the tyre outside diameter = 1.790 m.
#   [KAUFMAN-AULT], engineering rule of thumb: "its height must be equal to or
#     greater than the rolling radius of the vehicle's tire."  The same tyre
#     data gives a rolling circumference of 10 711 mm, i.e. a rolling radius of
#     1.705 m.
#   [PSU-MNG230] restates the second: "greater than or equal to the tire radius
#     of the largest truck."
# 1.80 m clears both.  It is a MINIMUM in every one of the three, so rounding
# up is the only safe direction.
BERM_H = 1.80

# THE HAUL ROAD IS ONE ROAD, on the floor and up the wall alike, so the floor
# section is the same width as the ramp.
ROAD_W = RAMP_W

# HYDRAULIC FACE SHOVEL — the machine loading the muckpile.
# Manufacturer specalog AEHQ7161-01, read directly:
#   https://www.teknoxgroup.com/fileadmin/user_upload/6060_6060FS_eng.pdf
# Bucket 34.0 m3 heaped 2:1 (face-shovel, standard liner); operating weight
# 569-570 t; face-shovel boom 8.0 m, stick 5.1 m; max digging height 15.5 m,
# max digging reach 16.4 m; basic unit about 7.6 m high on 8.7-8.8 m tracks.
#
# WHY THIS CLASS AND NOT THE 150-350 t ONE `research/16` §A.5 QUOTES.  §A.5's
# figure comes from [GF-STIVES], one gold operation working 5-10 m benches.
# This pit works 15 m benches and hauls with a 226.8 t truck, and the shovel
# has to match the truck: 34.0 m3 heaped at a loose density around 1.8 t/m3 is
# ~61 t a pass, so it fills this truck in between three and four passes, which
# is the standard pairing.  A 150 t shovel on a 226.8 t truck would be seven
# passes and is the kind of mismatch a mining engineer reads instantly.
SHOVEL_H = 7.6
SHOVEL_TRACK_L = 8.75
SHOVEL_W = 8.4                      # within the 7.0-9.2 m envelope in the table
SHOVEL_BOOM = 8.0
SHOVEL_STICK = 5.1
SHOVEL_DIG_H = 15.5
SHOVEL_BUCKET_M3 = 34.0

# ROTARY BLASTHOLE DRILL — the production machine that shares this bench, and
# the object `research/16` §A.5 says the game has never drawn: "A 250 mm rotary
# rig on jacks with a 53 ft tower and a dust hood is a different animal from a
# 100 mm tracked top-hammer crawler, and the game draws one machine for both."
# The hero rig is whichever the contract fitted; this is the OTHER one.
# Manufacturer specalog AEHQ8038-03 (07-2019), read directly:
#   https://www.teknoxgroup.com/fileadmin/user_upload/md6310.pdf
DRILL_MAST = 13.7                   # the shorter of the two published masts
DRILL_H_UP = 19.93                  # overall height, mast up, with that mast
DRILL_BODY_L = 13.27                # body length, standard cab
DRILL_W_FRONT = 5.39
DRILL_W_REAR = 6.32
DRILL_HOLE_MIN = 0.203              # 8 in
DRILL_HOLE_MAX = 0.311              # 12.25 in
DRILL_TRACK_SHOE = 0.600            # triple grouser, hard rock


def _verify_geometry():
    """Assert the sourced numbers against each other, on every build.

    ASTRA.md 5: "two tables describing one thing will drift, and the one that
    is wrong will be believed."  These four constants are one table.  The
    checks below are not decoration — the second one reproduces a REAL
    PUBLISHED PIT DESIGN's interramp angle from its own bench geometry, which
    is the evidence that the relation and the numbers are being used correctly.
    """
    mrc = 0.2 * BENCH_H + 4.5                            # [RYAN-PRYOR] EQ 3.1
    assert BERM_W >= mrc - 1e-9, (
        'catch bench %.2f m is below the Modified Ritchie Criterion %.2f m '
        '(0.2H + 4.5) for a %.1f m bench [RYAN-PRYOR EQ 3.1]'
        % (BERM_W, mrc, BENCH_H))
    assert 8.0 <= BERM_W <= 14.4, (
        'catch bench %.2f m is outside the 8.0-14.4 m single-bench range '
        'published for a real 15 m-bench pit [CMM-43-101 Table 16-1]' % BERM_W)
    assert 24.0 <= INTERRAMP <= 55.0, (
        'interramp %.2f deg is outside the 24-55 deg published across 15 '
        'geotechnical sectors [CMM-43-101]' % INTERRAMP)
    # The relation, checked against a DIFFERENT published row of the same
    # report: its New Ingerbelle-10 sector is a 30 m double bench, 70 deg
    # batter, 14 m berm, and the report prints 50.3 deg interramp.
    check = math.degrees(math.atan(30.0 / (14.0 + 30.0 / math.tan(70.0 * D2R))))
    assert abs(check - 50.3) < 0.1, (
        'tan(psi) = H/(W + H cot beta) gives %.2f deg for the published '
        '30 m / 70 deg / 14 m sector, which prints 50.3 deg. The relation or '
        'the numbers are wrong; do NOT proceed.' % check)
    assert OVERALL_SLOPE < INTERRAMP, (
        'overall slope %.2f must be flatter than interramp %.2f — that is what '
        'the ramp does to the profile' % (OVERALL_SLOPE, INTERRAMP))

    # ── THE RAMP WIDTH, CHECKED AGAINST THE TRUCK THAT USES IT ──────────────
    # [KAUFMAN-AULT] via the 1965 AASHO rule: each lane of travel provides
    # clearance left and right "equivalent to one half the vehicle width", so a
    # lane is ~2 x vehicle width and a two-lane road is ~4 x.  For the 8.295 m
    # canopy width of the truck modelled here that is 33.18 m — and
    # [CMM-43-101] designs its dual-lane ramps at 33.5 m.  TWO SOURCES THAT
    # KNOW NOTHING ABOUT EACH OTHER, ONE FROM 1977 AND ONE FROM 2023, AGREE TO
    # ONE PER CENT.  That is the strongest evidence in this file that its
    # numbers are being used the way their authors meant them.
    aasho = 4.0 * TRUCK_W
    assert abs(RAMP_W - aasho) / aasho < 0.05, (
        'ramp width %.1f m and the AASHO two-lane rule for a %.3f m vehicle '
        '(%.2f m) disagree by more than 5 %%' % (RAMP_W, TRUCK_W, aasho))

    # ── THE SAFETY BERM, CHECKED AGAINST BOTH RULES ─────────────────────────
    mid_axle = TYRE_OD * 0.5                             # [MSHA-56.9300]
    rolling_r = 10.711 / (2.0 * math.pi)                 # [KAUFMAN-AULT], from
    assert BERM_H >= mid_axle - 1e-9, (                  # the tyre maker's own
        'berm %.2f m is below mid-axle height %.2f m [MSHA 56.9300]'
        % (BERM_H, mid_axle))                            # rolling circumference
    assert BERM_H >= rolling_r - 1e-9, (
        'berm %.2f m is below the tyre rolling radius %.3f m [KAUFMAN-AULT]'
        % (BERM_H, rolling_r))

    # ── THE PATTERN, CHECKED AGAINST BOTH MACHINES THAT COULD DRILL IT ──────
    assert 0.152 <= HOLE_D <= 0.406, (
        '%.3f m is outside the 152-406 mm surface blasthole class band '
        '[EPIROC-BH]' % HOLE_D)
    assert HOLE_D <= 0.229, (
        '%.3f m is above the 229 mm ceiling research/03 gives the tracked '
        'surface crawler class, which is the hero rig here' % HOLE_D)
    assert DRILL_HOLE_MIN <= HOLE_D <= DRILL_HOLE_MAX, (
        'the production drill modelled on this bench is published at %.3f-%.3f '
        'm and cannot drill the %.3f m pattern it is standing on'
        % (DRILL_HOLE_MIN, DRILL_HOLE_MAX, HOLE_D))

    print('PIT_GEOMETRY bench=%.1fm face=%.0fdeg berm=%.1fm (MRC %.1fm) '
          'module=%.3fm interramp=%.2fdeg overall=%.2fdeg depth=%.0fm'
          % (BENCH_H, FACE_ANGLE, BERM_W, mrc, MODULE, INTERRAMP,
             OVERALL_SLOPE, PIT_DEPTH))
    print('PIT_ROAD ramp_w=%.1fm (AASHO 4x%.3f=%.2fm) grade=%.0f%% '
          'berm=%.2fm (mid-axle %.3f, rolling r %.3f)'
          % (RAMP_W, TRUCK_W, aasho, RAMP_GRADE * 100.0, BERM_H,
             mid_axle, rolling_r))
    print('PIT_SHOT hole=%.0fmm burden=%.3fm spacing=%.3fm stemming=%.3fm '
          'S/B=%.2f' % (HOLE_D * 1000.0, BURDEN, SPACING, STEM,
                        SPACING / BURDEN))


# ═════════════════════════════════════════════════════════════════════════════
# COMPOSITION — **NOT SOURCED**, solved against the hero frame
#
# A pit's outline is its orebody's and no source gives one.  Everything in this
# block is an authored placement, labelled as one, and none of it may be
# quoted back as a mining fact.  What IS sourced is everything the placements
# are made of: the bench module, the ramp width and grade, the pattern.
# ═════════════════════════════════════════════════════════════════════════════

# The toe of the far wall, as a plan radius from the collar.  Solved by
# inverting `ndc_y`: at 190 m the first four crests land at NDC +0.21, +0.56,
# +0.86 and +1.13 on the measured frame, so three crest lines sit inside the
# band with the fourth on its top edge, and the eighth is at +1.98 — the sky is
# closed with a whole bench to spare.  On the wider frame implied by the
# declared 34 deg fov the same wall gives SEVEN crest lines from +0.11 to
# +1.07.  Both readings are a bench stack; that is what 190 m buys.
TOE_R = 190.0                       # NOT SOURCED — composition
TOE_WANDER = 11.0                   # NOT SOURCED — a pit outline is not a circle

# Azimuths are measured in the FRAME's own basis: psi = 0 is straight up the
# hero view axis, +psi is toward screen-right.  Placing in world bearings is
# how half of `quarry_bench.py`'s first plant ended up outside the picture.
HERO_ARC = 52.0                     # degrees either side of the axis, fine detail
# SEGMENT PITCH, SOLVED IN PIXELS RATHER THAN IN DEGREES.  At the far wall's
# ~230 m mean radius, 2.2 degrees is 8.8 m of crest, which the measured frame
# renders about 31 px wide; the +-2.4 m of backbreak on each is about 8 px of
# vertical wander.  That is a ragged skyline.  Halving the pitch would double
# the object count for wander the mip chain averages away, and the first build
# of this file did exactly that: 1.35 degrees produced ~4 200 objects and was
# still joining after ten minutes.
SEG_FINE = 2.2                      # degrees per wall segment inside HERO_ARC
SEG_COARSE = 9.0                    # and outside it, where only the orbit
#                                     camera and camera drift can ever see

# THE RAMP.  Its foot meets the pit floor just inside the LEFT edge of the
# frame and it climbs to the right, so the one diagonal in the picture runs
# with the reading direction and starts from something the eye can find.
# At 10 % on a ~200 m radius it gains 0.35 m per degree of azimuth, so across
# the ~46 degrees of visible wall it climbs about 16 m — ONE BENCH. That is
# shallow, and it is shallow because a haul ramp IS shallow; a ramp drawn steep
# enough to look dramatic is the exact mistake a mining engineer reads in two
# seconds.
RAMP_FOOT_PSI = -14.0               # NOT SOURCED — composition
RAMP_END_PSI = 150.0                # it keeps climbing out of shot, as it must

# THE MID LIFT — the next cut up, standing over the ground to screen-right.
# This is the element that puts the player UNDER a bench rather than only
# across from one, and it is at a range where geometry still reads: its face is
# 80-115 m away, where the game's own fog is only ~20 % and 1 m is ~9 px.
# Its toe arc is bounded so the pit stays open to screen-left; a full ring at
# this radius would stand across the middle of the frame and hide the far wall
# entirely, which is what a concentric solve produces and why this one is not.
MID_R = 82.0                        # NOT SOURCED — composition
MID_PSI0, MID_PSI1 = 7.0, 74.0      # NOT SOURCED — composition
MID_SEG = 2.2                       # degrees

# The floor haul road runs from the loading face across the pit floor and out
# of frame to the left, toward the ramp foot.  Kept inboard of NDC x -0.82:
# `quarry_bench.py` records coloured speckle on geometry that reaches the outer
# ~6 % of the band width, cause unverified, and mitigates it the same way.
EDGE_LIMIT = 0.82


def pit_xy(psi_deg, radius):
    """Blender (x, y) at plan `radius` from the collar, at frame azimuth `psi`
    (0 = straight up the view axis, + = toward screen-right)."""
    a = psi_deg * D2R
    d = 13.7507 + radius * math.cos(a)          # the collar's own frame distance
    across = 1.1469 + radius * math.sin(a)
    return on_axis(d, across)


def seg_yaw(psi_deg):
    """The world yaw whose local +X is TANGENTIAL at this azimuth and whose
    local +Y points radially INWARD (toward the collar).  Derived, not guessed:
    with rot = (rx, 0, yaw) Blender resolves XYZ Euler as Rz(yaw)*Rx(rx), so
    Rz(yaw)*X is the tangent and Rz(yaw)*Y is the inward radial, and a positive
    `rx` then leans the box's top OUTWARD — which is the batter."""
    # world bearing of this azimuth, then +90 deg to get the tangent
    a = psi_deg * D2R
    bx = AXIS[0] * math.cos(a) + RIGHT[0] * math.sin(a)
    by = AXIS[1] * math.cos(a) + RIGHT[1] * math.sin(a)
    return math.atan2(by, bx) + math.pi * 0.5


def radial(psi_deg):
    """Unit vector pointing radially OUTWARD from the collar at `psi`."""
    a = psi_deg * D2R
    return (AXIS[0] * math.cos(a) + RIGHT[0] * math.sin(a),
            AXIS[1] * math.cos(a) + RIGHT[1] * math.sin(a))


def toe_at(psi_deg):
    """The far wall's toe radius at this azimuth.  A pit outline is not a
    circle: `TOE_WANDER` breaks the lathe, on a wavelength long enough
    (~40 deg) to read as a plan shape rather than as a jitter."""
    a = psi_deg * D2R
    return (TOE_R
            + math.sin(a * 1.7 + 0.9) * TOE_WANDER * 0.62
            + math.sin(a * 4.3 - 2.1) * TOE_WANDER * 0.38)


def ramp_z(psi_deg):
    """Height of the haul road at this azimuth, or None where it is not there.

    The ramp is a helix on a wall that steps outward as it rises, so its radius
    depends on its height and its height depends on the arc it has run at that
    radius.  Integrated stepwise rather than approximated: at 10 % the error in
    assuming a fixed radius over 170 degrees is several metres of elevation,
    which is a third of a bench.
    """
    if psi_deg < RAMP_FOOT_PSI or psi_deg > RAMP_END_PSI:
        return None
    z = 0.0
    step = 1.0                                   # degrees
    p = RAMP_FOOT_PSI
    while p < psi_deg - 1e-9:
        dp = min(step, psi_deg - p)
        r = toe_at(p) + (z / BENCH_H) * MODULE
        z += RAMP_GRADE * r * (dp * D2R)         # rise = grade x arc length
        p += dp
    return z


# ═════════════════════════════════════════════════════════════════════════════
# THE FAR WALL
# ═════════════════════════════════════════════════════════════════════════════

def build_wall():
    """Eight benches of batter and catch bench, closing 360 degrees, with the
    haul ramp cut into them.

    ══ THE THING THE FIRST RENDER FOUND, AND IT IS NOT ABOUT MATERIALS ══
    THE HERO EYE IS AT 2.25 m AND THESE BENCHES ARE 15 m AND UP, SO EVERY
    HORIZONTAL SURFACE ON THIS WALL IS SEEN FROM UNDERNEATH.

    That sounds obvious written down.  It was not obvious while authoring, and
    the first version of this file was composed on the opposite assumption —
    that the read would come from "the value step between a vertical face
    standing in its own shade and a horizontal catch bench facing open sky",
    which is what `src/world/terrain.js` authored for its own procedural pit
    and measured at about 2.3:1.  That step is real, and from a camera ABOVE
    the benches — an aerial, or a shot from the rim looking down — it is the
    whole picture.  From the FLOOR it does not exist: a catch bench 15 m up is
    above the eye line, so its top face is never in frame at all, and the first
    render came back as one flat grey wall with no benches in it.

    So the read is carried entirely by VERTICAL surfaces, and the composition
    was moved onto them:

      · THE CONTAINMENT LIP is the crest line.  1.5 m standing up off the
        bench, in the bench's own pale graded fines, at 205 m where the frame
        is 75.9 m tall over the surface band's ~740 px — ONE METRE IS ABOUT
        9.7 PIXELS, so the lip is ~14 px.  The 8 m catch bench it stands on
        subtends 3.56 deg down to 3.43 deg across its whole depth: 4 px, and
        those 4 px are its UNDERSIDE.  The lip is three and a half times the
        read of the surface it protects, and on a real pit wall it is exactly
        why you can count the benches from across the hole.
      · THE RAMP'S SAFETY BERM, for the same reason (see the ramp below).
      · THE FACE's own per-segment and per-bench value variation.

    (An earlier draft of this comment claimed one metre was 3.5 px at this
    range.  It is 9.7 px at 205 m and 6.6 px at 300 m; the 3.5 came from
    mixing an angular figure with a per-degree one.  The corrected number is
    three times larger and it changes the argument below, so it is corrected
    here rather than quietly dropped.)

    WHY THIS IS STILL PLAIN BOXES AND NOT `rubble()`, WHICH IS THE LIBRARY'S
    OWN ANSWER FOR ROCK.  `site.rubble()` exists because "a blasted face's
    outline is broken at every scale and a box's is straight at every scale",
    and on `quarry-bench` — a wall at 34 m — it is unarguably right.  With the
    corrected arithmetic a 1.5 m block out here is 8-10 px, so the honest
    reason is no longer "it would be invisible".  It is two other reasons, and
    they are worth stating plainly rather than hiding behind a wrong number:

      · FOG.  `src/core/env.js` runs FogExp2 at 0.0035-0.0150 by region and
        weather.  At 0.0052 this wall is 68 % fog colour at its toe and 95 % at
        its crest, so per-block contrast is crushed by an order of magnitude
        while the CREST LINE — a long, continuous, high-contrast horizontal —
        survives proportionally.
      · BUILD TIME.  `rig.box()` costs two `bpy.ops` calls and each walks the
        scene, so authoring cost is quadratic in object count.  This wall is
        already ~1 500 objects and takes six minutes; rubble on every face
        would be 20 000 and would not finish.

    The broken silhouette is therefore bought in the CREST LINE, which is the
    only edge of this wall against the sky:

      · per-segment BACKBREAK.  [RYAN-PRYOR] defines backbreak as "the
        horizontal distance between the planned toe and the actual mined crest
        of the final bench slope" — a real, named, universal reason a crest is
        never where the design put it.  Its MAGNITUDE is NOT SOURCED; +-2.4 m
        of crest height and +-1.6 m of crest radius is authored, and at 250 m
        that is about 8 px of vertical wander on an 8.8 m segment (31 px),
        which is a ragged skyline rather than a machined edge.
      · per-segment TOE WANDER, so the plan outline is not a lathe.
      · the FACE / CATCH BENCH VALUE STEP at 2.4:1, which is what actually
        draws eight lines across the top of the frame through fog that is
        already 82 % saturated at this range.
    """
    made = 0
    psi = -180.0
    while psi < 180.0 - 1e-9:
        step = SEG_FINE if abs(psi) <= HERO_ARC else SEG_COARSE
        pc = psi + step * 0.5
        hero = abs(pc) <= HERO_ARC
        yaw = seg_yaw(pc)
        toe = toe_at(pc)
        zr = ramp_z(pc)

        # THE CREST OF THE BENCH BELOW, CARRIED UP.  See `prev_crest` below:
        # without it a negative backbreak opens a horizontal slot of sky.
        prev_crest = -6.0
        for b in range(N_BENCH):
            z_lo = b * BENCH_H
            z_hi = z_lo + BENCH_H
            # Backbreak on the crest.  Only the TOP bench's crest is a
            # silhouette, but every crest is a line across the wall, so all of
            # them wander — a stack whose lower crests are ruled and whose top
            # one is ragged reads as a mistake.
            bb_z = S.jitter(2.4, b * 3.1 + pc * 0.37, 17.0)
            bb_r = S.jitter(1.6, b * 5.7 + pc * 0.23, 29.0)
            crest_z = z_hi + bb_z * (0.35 + 0.65 * (b + 1) / N_BENCH)
            # THE DOZED BERM LINE IS NOT THE BLASTED ROCK LINE, AND SEPARATING
            # THEM IS WHAT MAKES THE BENCH STACK READ.
            #
            # `crest_z` above is where the rock actually broke out, and +-2.4 m
            # of backbreak is honest.  But the containment berm and the bench
            # it stands on are PUSHED UP BY A DOZER travelling along the bench,
            # which is a far more regular line — and it has to be, because the
            # berm is the only part of this wall the player can see (it is
            # 1.5 m of vertical relief, ~14 px, against a catch-bench top that
            # is 4 px of underside).  When both lines carried the same +-2.4 m,
            # the wander was more than twice the visible height of the thing
            # drawing the line and the crest came back as a scatter of dashes
            # at different heights instead of as a line.  Measured off
            # `shots/open-pit-bench-hero.png`, twice.
            berm_z = z_hi + S.jitter(0.7, b * 1.9 + pc * 0.11, 83.0)

            # Where the ramp passes through this bench, the face below the road
            # is the wall and everything above it starts 33.5 m further out.
            # EACH FACE STARTS AT THE CREST BELOW IT, NOT AT ITS OWN NOMINAL
            # TOE, AND THAT IS A BUG FIX WITH A PICTURE.
            # `crest_z` carries backbreak, so it can be up to 2.4 m BELOW the
            # nominal `z_hi`.  When it was, the bench above still started at
            # `z_hi` and left a horizontal slot up to 2.4 m tall and 8 m deep
            # at the catch-bench level, open right through the wall — plainly
            # visible as bright slots in the first `-profile.png` render.
            # Starting the face at the crest below closes it by construction:
            # the extra is the batter's own continuation down to its toe, so it
            # lands ON the catch bench, which is exactly where the rock is.
            #
            # For the lowest bench `prev_crest` is -6.0, which buries the toe
            # line.  The far field's own base sits about 2 m below grade at
            # this radius, and a wall whose lowest vertex is at -1.5 m would
            # leave a hairline of background under 120 m of rock.
            start = min(z_lo, prev_crest)
            cut = zr is not None and z_lo <= zr < z_hi
            lifts = []
            if cut:
                if zr - start > 0.8:
                    lifts.append((start, zr, 0.0))
                if crest_z - zr > 0.8:
                    lifts.append((zr, crest_z, RAMP_W))
            else:
                lifts.append((start, crest_z,
                              RAMP_W if (zr is not None and z_lo >= zr) else 0.0))
            prev_crest = crest_z

            for k, (za, zb, push) in enumerate(lifts):
                h = zb - za
                if h <= 0.05:
                    continue
                r_toe = toe + b * MODULE + bb_r + push \
                    + (za - z_lo) / math.tan(FACE_ANGLE * D2R)
                # THE BATTER.  A box of local length h/sin(beta) leaned by
                # (90 - beta) about the tangential axis has exactly `h` of
                # vertical extent and stands at `beta` to the horizontal.
                slope_len = h / math.sin(FACE_ANGLE * D2R)
                lean = (90.0 - FACE_ANGLE) * D2R
                r_mid = r_toe + (h * 0.5) / math.tan(FACE_ANGLE * D2R)
                seg_len = 2.0 * math.pi * (toe + b * MODULE) * (step / 360.0) + 1.4
                # THICKNESS IS THE GUARANTEE, NOT THE PICTURE.  A wall built of
                # separate leaning plates will open a slot of bright sky
                # somewhere, and terrain.js already learned on this exact
                # archetype that "chasing the individual gap is the wrong fix,
                # because the next parameter change reopens it somewhere else".
                # 9 m of rock behind every face closes it by construction, and
                # it is the same material, so it is still one draw call.
                cx, cy = pit_xy(pc, r_mid + 4.5)
                # Two independent terms, and both are needed: a per-SEGMENT
                # one, which is the vertical fluting a blasted face has, and a
                # per-BENCH one, so a lift does not read as one flat storey.
                # The first version used only the segment term over a 20 %
                # spread and the wall came back as ruled grey panelling.
                tint = _mix(COL_FACE, COL_FACE_HI,
                            0.62 * S.rnd(pc * 1.3 + b * 7.1, 41.0)
                            + 0.38 * S.rnd(b * 2.9, 53.0))
                cbox('wall-face-%d-%d-%d' % (int(psi * 10), b, k),
                     (seg_len, 9.0, slope_len), S.MAT_ROCK, tint,
                     loc=(cx, cy, za + h * 0.5), rot=(lean, 0.0, yaw))
                made += 1

            # ── the catch bench: the pale horizontal that IS the crest line ──
            # [PSU-MNG230]: a catch bench is "designed to collect the sliding
            # material from the benches above and stop the downward progress of
            # large rock pieces or boulders".  It is the flat between this
            # bench's crest and the next bench's toe, and it is `BERM_W` wide
            # by [CMM-43-101] / the Modified Ritchie Criterion.
            push = RAMP_W if (zr is not None and berm_z > zr) else 0.0
            r_crest = toe + b * MODULE + FACE_RUN + bb_r + push
            bx, by = pit_xy(pc, r_crest + BERM_W * 0.5)
            seg_len = 2.0 * math.pi * (toe + b * MODULE) * (step / 360.0) + 1.4
            # 4 m thick, not 1.3: the slab has to bridge down past a crest that
            # backbreak may have left up to 2.4 m below the dozed line, and its
            # underside is the only part of it in frame anyway.
            cbox('wall-bench-%d-%d' % (int(psi * 10), b),
                 (seg_len, BERM_W, 4.0), S.MAT_GRAVEL, COL_BENCH,
                 loc=(bx, by, berm_z - 2.0), rot=(0.0, 0.0, yaw))
            made += 1
            # THE CONTAINMENT LIP ON THE OUTER EDGE — [RYAN-PRYOR]'s design
            # berm, and THE THING THAT ACTUALLY DRAWS THE CREST LINE.
            #
            # At 205 m the frame is 75.9 m tall over the surface band's ~740 px,
            # so ONE METRE IS ABOUT 9.7 PIXELS.  A 1.5 m lip standing up off the
            # bench is therefore ~14 px, while the 8 m catch bench itself is
            # seen so nearly edge-on (3.56 deg down to 3.43 deg across its own
            # depth) that it is only ~4 px.  The lip is three and a half times
            # the read of the surface it stands on, and on a real pit wall it is
            # exactly why you can count the benches from across the hole.
            # It goes on every bench the frame can hold, not just the low ones.
            if hero and b < 6:
                lx, ly = pit_xy(pc, r_crest + BERM_W - 0.9)
                cbox('wall-lip-%d-%d' % (int(psi * 10), b),
                     (seg_len, 1.8, CATCH_LIP_H), S.MAT_GRAVEL, COL_BENCH,
                     loc=(lx, ly, berm_z + CATCH_LIP_H * 0.5),
                     rot=(0.0, 0.0, yaw))
                made += 1

        # ── the haul road itself ────────────────────────────────────────────
        if zr is not None:
            r_in = toe_at(pc) + int(zr // BENCH_H) * MODULE \
                + (zr - int(zr // BENCH_H) * BENCH_H) / math.tan(FACE_ANGLE * D2R)
            seg_len = 2.0 * math.pi * (toe + zr / BENCH_H * MODULE) * (step / 360.0) + 1.4
            rx2, ry2 = pit_xy(pc, r_in + RAMP_W * 0.5)
            cbox('ramp-road-%d' % int(psi * 10),
                 (seg_len, RAMP_W, 1.1), S.MAT_GRAVEL, COL_ROAD,
                 loc=(rx2, ry2, zr - 0.55), rot=(0.0, 0.0, yaw))
            made += 1
            # THE SAFETY BERM, ON THE OUTER EDGE, AND IT IS THE REGULATION.
            # [MSHA-56.9300]: "Berms or guardrails shall be at least mid-axle
            # height of the largest self-propelled mobile equipment which
            # usually travels the roadway."  [KAUFMAN-AULT] independently: "its
            # height must be equal to or greater than the rolling radius of the
            # vehicle's tire".  BERM_H below is derived from the haul truck in
            # this file and both rules are checked against it there.
            bx2, by2 = pit_xy(pc, r_in + RAMP_W - BERM_H * 1.1)
            # BRIGHT, BECAUSE IT IS THE ONLY PART OF THE ROAD THE PLAYER CAN
            # SEE.  The eye is at 2.25 m and this road is 5-13 m up, so its
            # running surface is viewed from UNDERNEATH and never appears; the
            # berm's outer face and the road slab's own 1.1 m edge are the whole
            # diagonal.  Drawn in the road's own graded fines rather than in
            # shot rock for the same reason.
            cbox('ramp-berm-%d' % int(psi * 10),
                 (seg_len, BERM_H * 2.2, BERM_H), S.MAT_GRAVEL, COL_ROAD,
                 loc=(bx2, by2, zr + BERM_H * 0.5 - 0.2), rot=(0.0, 0.0, yaw))
            made += 1
        psi += step
    return made


def _mix(a, b, t):
    out = 0
    for sh in (16, 8, 0):
        ca, cb = (a >> sh) & 255, (b >> sh) & 255
        out |= int(ca + (cb - ca) * t) << sh
    return out


# ═════════════════════════════════════════════════════════════════════════════
# THE MID LIFT — the cut standing over the ground to screen-right
# ═════════════════════════════════════════════════════════════════════════════

def build_mid_lift():
    """One 15 m bench standing on the pit floor to screen-right, with its
    catch bench on top and a shot muckpile at its toe.

    THIS IS THE ELEMENT THAT PUTS THE PLAYER UNDER A BENCH.  Everything else
    on this site is 190 m away or further, where the game's own FogExp2 is
    already 80-95 % saturated; the mid lift's face is 80-115 m out, where fog
    is about 20 % and one metre is nine pixels.  It is the only place on the
    site where authored rock detail can actually be seen, so it is the only
    place `rubble()` is spent.

    A pit bottom is not one level — the lowest bench is taken in stages, and
    the ground one cut up stands over the ground you are drilling on.  That is
    a normal thing to be standing next to and it is why this reads as being
    INSIDE the excavation rather than looking at a picture of one.
    """
    made = 0
    psi = MID_PSI0
    while psi < MID_PSI1 - 1e-9:
        step = min(MID_SEG, MID_PSI1 - psi)
        pc = psi + step * 0.5
        yaw = seg_yaw(pc)
        toe = MID_R + math.sin(pc * D2R * 2.6 + 1.4) * 4.5      # NOT SOURCED
        crest_z = BENCH_H + S.jitter(1.9, pc * 0.41, 63.0)      # backbreak
        seg_len = 2.0 * math.pi * toe * (step / 360.0) + 1.6

        slope_len = crest_z / math.sin(FACE_ANGLE * D2R)
        lean = (90.0 - FACE_ANGLE) * D2R
        r_mid = toe + (crest_z * 0.5) / math.tan(FACE_ANGLE * D2R)
        fx, fy = pit_xy(pc, r_mid + 3.0)
        cbox('mid-face-%d' % int(psi * 10), (seg_len, 7.0, slope_len),
             S.MAT_ROCK, _mix(COL_FACE, COL_FACE_HI, S.rnd(pc * 1.9, 71.0)),
             loc=(fx, fy, crest_z * 0.5), rot=(lean, 0.0, yaw))
        made += 1

        # THE PLATEAU ON TOP, running back to the far wall's toe.
        #
        # Its tangential length is the arc at the OUTER radius, not the mean.
        # A slab 107 m deep radially has to cover a chord of 7.60 m at its far
        # end and only 3.51 m at its near end, and a box cannot fan; sized on
        # the outer arc it overlaps by 2.0 m even at the widest point.
        #
        # ── AND A WRONG FINDING, RECORDED RATHER THAN QUIETLY DELETED ────────
        # `-bowl.png` came back showing this plateau as a radial fan of bright
        # strips with dark wedges between them, and the diagnosis written here
        # first was that the mean-arc sizing had left real gaps.  IT HAD NOT.
        # Measured afterwards, the old sizing gave a 7.55 m box against a 7.60 m
        # chord at the outer edge — A FIVE-CENTIMETRE GAP — and 2.00 m and
        # 4.05 m of OVERLAP at the mean and inner radii.  There was never a fan.
        #
        # What the render actually shows is HEIGHT CORRUGATION: each segment
        # takes the mid lift's own +-1.9 m crest wander, so neighbours can sit
        # 3.8 m apart in height on a slab 1.4 m thick, and the "wedges" are the
        # shaded sides of those steps seen from a camera 240 m up.  There is no
        # hole — the slabs still overlap tangentially by 4 to 6 m.
        #
        # It is left uncorrected, deliberately: EVERY GAME CAMERA IS BELOW THIS
        # SURFACE.  hero sits at 2.25 m, orbit at 2.70 m, menu at 4.20 m, mast
        # at 8.60 m, and this plateau is at 14-15 m, so its top is never in
        # frame in any of them.  Rebuilding this file costs thirteen minutes of
        # a machine seven other site builds are sharing, and spending that on a
        # surface no player can see would be the wrong trade.
        #
        # The sizing change was kept anyway because it is free and strictly
        # better, but it fixed a defect that did not exist and the record
        # should say so.
        r0 = toe + crest_z / math.tan(FACE_ANGLE * D2R)
        r1 = toe_at(pc) + 6.0
        if r1 > r0 + 4.0:
            px, py = pit_xy(pc, (r0 + r1) * 0.5)
            cbox('mid-top-%d' % int(psi * 10),
                 (2.0 * math.pi * r1 * (step / 360.0) + 2.0,
                  r1 - r0, 1.4), S.MAT_GRAVEL, COL_BENCH,
                 loc=(px, py, crest_z - 0.7), rot=(0.0, 0.0, yaw))
            made += 1

        # BROKEN SILHOUETTE, WHERE IT READS.  At 80-115 m a 1.1 m block is ten
        # pixels, so `rubble()` earns its triangles here and nowhere else.
        if pc < MID_PSI0 + 34.0:
            bx, by = pit_xy(pc, toe + 1.2)
            # SITTING ON THE BROW, NOT HOVERING OVER IT.  A 4.2 m envelope
            # centred 1.6 m below the crest puts blocks up to half a metre
            # ABOVE the crest line, and at 90 m they read as debris in mid-air
            # rather than as a broken edge.
            crubble('mid-brow-%d' % int(psi * 10), (bx, by, crest_z - 1.9),
                    (seg_len * 1.1, 4.0, 2.8), S.MAT_ROCK, COL_FACE_HI,
                    block=1.15, n=9, seed=310.0 + psi, yaw=yaw)
            made += 9
        psi += step
    return made


# ═════════════════════════════════════════════════════════════════════════════
# THE FLOOR — the shot being drilled, the grade control, the haul road
# ═════════════════════════════════════════════════════════════════════════════

def build_floor():
    """The production pattern at the player's feet, the grade-control grid
    behind it, the drill-pad fines, and the haul road out to the ramp.

    ONE OF THE PATTERN'S HOLES IS THE GAME'S HOLE.  The collar at the origin is
    a blasthole in this shot, which is what the machine standing here is
    actually drilling.  Burden runs back from the free face; spacing runs along
    it.
    """
    # THE PATTERN'S OWN FRAME.  Local +X must be SCREEN-RIGHT (spacing runs
    # along the free face) and local +Y AWAY from the camera (burden runs back
    # from it), which is `atan2(RIGHT)`.  `seg_yaw(0)` is the TANGENT of the
    # pit ring at this azimuth and points the burden rows the other way --
    # toward the camera, and through the machine.
    yaw = math.atan2(RIGHT[1], RIGHT[0])
    made = 0

    # The shot is being DRILLED, not finished — the far end of the back row is
    # still to come.  A finished pattern says the machine has nothing to do.
    def drilled(i, j):
        return not (j >= ROWS - 1 and i > HOLES - 5)

    at, collars = S.pattern(
        'shot', HOLES, ROWS, BURDEN, SPACING, S.MAT_GRAVEL,
        origin=(0.0, 0.0, 0.0), yaw=yaw, collar_r=0.52, seed=3.0,
        drilled=drilled)
    for o in collars:
        colour(o, COL_FINES)
    made += len(collars)

    # ── stemming, and the cuttings the hammer threw out ─────────────────────
    # [OSMRE-BLAST] and [PQ-L4]: stemming is sized crushed stone or drill
    # cuttings, and removing it costs more than 30 % of the effective burden.
    # STEM is how deep it goes, which is below ground; what is visible is the
    # surplus heaped back over the collar.
    for k, (px, py) in enumerate(at):
        # The origin hole is the one being drilled RIGHT NOW, with the rig
        # standing on it: it is neither stemmed nor flagged.
        if math.hypot(px, py) < CLEAR_R:
            continue
        if S.rnd(k * 2.7, 1.0) < 0.42:
            continue                        # not every hole is loaded yet
        r = 0.60 + S.rnd(k * 5.3, 2.0) * 0.22
        ctube('stem-%d' % k, r, 0.22 + S.rnd(k, 4.0) * 0.12, S.MAT_GRAVEL,
              COL_FINES, loc=(px, py, 0.0), sides=8)
        made += 1

    # ── the flag on each hole ───────────────────────────────────────────────
    for k, (px, py) in enumerate(at):
        if math.hypot(px, py) < CLEAR_R:
            continue                        # the live hole carries no flag
        ctube('flagpin-%d' % k, 0.014, 0.72, S.MAT_DARK, COL_STEEL,
              loc=(px, py, 0.0), sides=4)
        cbox('flag-%d' % k, (0.020, 0.24, 0.15), S.MAT_HAZARD, COL_HAZARD,
             loc=(px, py + 0.12, 0.66),
             rot=(0.0, 0.0, S.rnd(k * 3.1, 6.0) * 0.9))
        made += 2

    # ── THE GRADE-CONTROL GRID.  The archetype's own identity marker ─────────
    # [GF-STIVES], at a real gold operation: "Grade control is generally
    # expedited by INCLINED RC drilling on grids determined by the ore body
    # characteristics".  [DMA-GC]: RC "supports fast sampling cycles and adapts
    # well to confined in-pit environments", which matters "where bench space
    # is limited".  research/16 §A.5's whole complaint about this archetype is
    # that the game does not draw the two drill classes that share a pit bench.
    #
    # The GRID PITCH is **NOT SOURCED** — [GF-STIVES] says explicitly that it
    # is "determined by the ore body characteristics", so there is no number to
    # cite and this one is authored.  What IS sourced is that the holes are
    # INCLINED, and they are drawn inclined: a grade-control collar is an
    # ellipse with its casing stub leaning, not a circle.
    GC_PITCH = 9.0                                  # NOT SOURCED
    GC_INCL = 60.0 * D2R                            # NOT SOURCED — see above
    for i in range(-2, 4):
        for j in range(2, 6):
            lx, lz = i * GC_PITCH + 2.0, j * GC_PITCH
            px = math.cos(yaw) * lx - math.sin(yaw) * lz
            py = math.sin(yaw) * lx + math.cos(yaw) * lz
            # kept well outside the rig reserve: a grade-control grid is
            # surveyed independently of the production pattern and is not
            # drilled from where the production rig is standing.
            if math.hypot(px, py) < CLEAR_R * 1.8:
                continue
            ctube('gc-collar-%d-%d' % (i, j), 0.42, 0.07, S.MAT_GRAVEL,
                  COL_FINES, loc=(px, py, 0.01), sides=10)
            ctube('gc-stub-%d-%d' % (i, j), 0.062, 0.55, S.MAT_DARK, COL_STEEL,
                  loc=(px, py, 0.0),
                  rot=(math.pi * 0.5 - GC_INCL, 0.0, yaw + 0.4), sides=6)
            made += 2

    # ── worked floor: cuttings, tracked fines, spilled shot rock ────────────
    for i in range(18):
        d = 26.0 + S.rnd(i * 1.9, 12.0) * 40.0
        a = (S.rnd(i * 3.3, 13.0) - 0.5) * 2.0 * min(half_width(d) * 0.78, 34.0)
        px, py = on_axis(d, a)
        crubble('floor-%d' % i, (px, py, 0.10), (3.4, 3.0, 0.36),
                S.MAT_GRAVEL, COL_FINES, block=0.40, n=6, seed=200.0 + i,
                yaw=yaw)
        made += 6
    for i in range(14):
        d = 30.0 + S.rnd(i * 2.7, 21.0) * 38.0
        a = (S.rnd(i * 4.7, 22.0) - 0.5) * 2.0 * min(half_width(d) * 0.74, 30.0)
        px, py = on_axis(d, a)
        crubble('spill-%d' % i, (px, py, 0.25), (2.0, 1.8, 0.62),
                S.MAT_ROCK, COL_MUCK, block=0.52, n=5, seed=300.0 + i, yaw=yaw)
        made += 5

    # ── the floor haul road, running out to the foot of the ramp ────────────
    # THE PERSPECTIVE LINE THAT TIES THE PLAYER'S FEET TO THE WALL 190 m AWAY.
    # It is the same road as the ramp — a pit haul road does not change width
    # when it leaves the floor — so it is `ROAD_W` = `RAMP_W` = 33.5 m wide,
    # which at 70 m is most of the frame's width and at 190 m is a third of it.
    # That convergence is the whole depth cue, and it is free: it is what a
    # 33.5 m road actually does in perspective.
    #
    # It starts at d = 70, clear of the pattern.  A 33.5 m road laid across the
    # near field would have covered the shot, which is the site's subject.
    # It is bermed BOTH sides: [MSHA-56.9300] applies to a roadway wherever a
    # drop-off could overturn a vehicle, and a graded pit road is windrowed
    # whether or not there is a drop, to keep water and haulage on it.
    # THE ROAD ENDS AT THE RAMP FOOT, and the end is DERIVED from the ramp
    # rather than eyeballed near it.  Two separately-placed roads that nearly
    # meet is the kind of near-miss that reads instantly as a mistake and that
    # nobody notices while authoring, because in the Blender viewport the gap
    # is one pixel from directly above.
    R1D, R1A = to_frame(*pit_xy(RAMP_FOOT_PSI, toe_at(RAMP_FOOT_PSI)))
    R0D = 70.0
    R0A = -0.34 * half_width(R0D)
    vx = (R1D - R0D) * AXIS[0] + (R1A - R0A) * RIGHT[0]
    vy = (R1D - R0D) * AXIS[1] + (R1A - R0A) * RIGHT[1]
    ry = math.atan2(vy, vx)
    n_road = 22
    for i in range(n_road):
        t = i / float(n_road - 1)
        d = R0D + t * (R1D - R0D)
        a = R0A + t * (R1A - R0A)
        a = max(a, -EDGE_LIMIT * half_width(d))          # see EDGE_LIMIT
        px, py = on_axis(d, a)
        cbox('haulfloor-%d' % i, (10.0, ROAD_W, 0.36), S.MAT_GRAVEL, COL_ROAD,
             loc=(px, py, -0.14), rot=(0.0, 0.0, ry))
        made += 1
        for s in (-1, 1):
            ox = -math.sin(ry) * s * (ROAD_W * 0.5 - BERM_H)
            oy = math.cos(ry) * s * (ROAD_W * 0.5 - BERM_H)
            cbox('haulberm-%d-%d' % (i, s),
                 (10.0, BERM_H * 2.0, BERM_H), S.MAT_ROCK, COL_MUCK,
                 loc=(px + ox, py + oy, BERM_H * 0.42), rot=(0.0, 0.0, ry))
            made += 1
        # delineators down the outer edge.  [MSHA-56.9300]'s own exception for
        # infrequently-used roadways names "warning signs, delineators and
        # posted speed limits" as what stands in for a berm; on a working ramp
        # you get both.  No number is lettered on anything: at this range a
        # painted figure is sub-pixel, and an unreadable number is not a
        # citation.
        if i % 3 == 0:
            ox = -math.sin(ry) * (ROAD_W * 0.5 + 0.8)
            oy = math.cos(ry) * (ROAD_W * 0.5 + 0.8)
            ctube('haulpost-%d' % i, 0.07, 1.5, S.MAT_DARK, COL_STEEL,
                  loc=(px + ox, py + oy, 0.0), sides=6)
            cbox('haulmark-%d' % i, (0.22, 0.05, 0.55), S.MAT_HAZARD,
                 COL_HAZARD, loc=(px + ox, py + oy, 1.55), rot=(0.0, 0.0, ry))
            made += 2
    return made


# ═════════════════════════════════════════════════════════════════════════════
# THE MUCKPILE AND THE LOADING FACE
# ═════════════════════════════════════════════════════════════════════════════

def build_muck():
    """The last shot off the end of the mid lift, not yet dug out.

    THE ANGLE OF REPOSE OF BLASTED ROCK IS **NOT SOURCED** AND IS NOT ASSERTED
    HERE.  It is the number this file most wanted and could not get: no
    primary geotechnical or blasting-engineering source for the repose angle of
    muck, or for the swell factor of blasted hard rock, could be reached in
    this pass, and Wikipedia's own angle-of-repose article was checked and
    carries no sourced figure for broken rock.  The commonly repeated 35-45
    degrees and 1.3-1.4x swell are exactly the kind of number that gets quoted
    once and believed forever, so neither appears in this file.

    What is drawn instead is a MASS, not a cone: `site.rubble()` heaps
    overlapping blocks of a stated physical size inside an envelope, so the
    shape emerges from the blocks rather than from an asserted angle.  That is
    the same decision `quarry_bench.py` made and for the same reason — "the
    angle of repose that sets a real cone's shape is a property of the material
    and is NOT quoted here".

    Block size IS the shot's fragmentation, which [OSMRE-BLAST] gives only as a
    CONSEQUENCE of burden, spacing and stemming and prints no size for.  The
    1.4 m used here is **NOT SOURCED**; what makes it defensible is only that
    it is at the scale a 34 m3 bucket picks up rather than at the scale of the
    envelope, which is the failure `site.rubble()`'s docstring records.
    """
    made = 0
    # ALONG THE LIFT'S FACE, NOT OFF ITS NEAR END.  The first build put the
    # whole loading tableau at psi ~ 8 deg and r ~ 52-70 m, which is 65 m from
    # the hero eye — and a 13.7 m truck at 65 m is 386 px of a 1480 px frame,
    # a quarter of the picture, dead centre-right, in front of the machine the
    # player is supposed to be looking at.  Moved along the face to psi 10-32
    # and out to r 62-76, it sits at 80-95 m against the right edge, where it
    # is a working tableau rather than the subject.
    for i in range(9):
        psi = MID_PSI0 + 3.0 + i * 3.1
        r = MID_R - 6.0 - S.rnd(i * 2.3, 91.0) * 7.0
        px, py = pit_xy(psi, r)
        h = (5.4 + S.rnd(i * 4.1, 93.0) * 2.6) * min(1.0, 0.40 + i * 0.20)
        crubble('muck-%d' % i, (px, py, h * 0.38), (10.0, 13.0, h),
                S.MAT_ROCK, COL_MUCK, block=1.4, n=16, seed=520.0 + i * 7.0,
                yaw=seg_yaw(psi))
        made += 16
    # the loose the loader has not swept back, running out onto the floor
    for i in range(7):
        psi = MID_PSI0 + 2.0 + i * 3.4
        px, py = pit_xy(psi, MID_R - 16.0 - S.rnd(i, 95.0) * 9.0)
        crubble('muck-toe-%d' % i, (px, py, 0.6), (7.0, 7.0, 1.5),
                S.MAT_ROCK, COL_MUCK, block=0.9, n=8, seed=560.0 + i * 5.0,
                yaw=seg_yaw(psi))
        made += 8
    return made


# ═════════════════════════════════════════════════════════════════════════════
# THE FLEET
#
# Three machines, at the published dimensions cited beside their constants,
# under no badge at all.  They exist for one reason and it is not decoration:
# 120 m of wall at 190-330 m has NO SCALE unless something of known size is
# standing against it.  A haul truck is the ruler every viewer already owns.
#
# `at()` builds machines in a local frame — +X forward, +Y left, +Z up, origin
# on the ground under the machine's centre — and places it by FRAME azimuth and
# plan radius.  Raw world offsets are not used anywhere: mixing frame placement
# with world offsets is how half of `quarry_bench.py`'s first plant ended up
# outside the picture.
# ═════════════════════════════════════════════════════════════════════════════

def at(psi_deg, radius, heading, z=0.0):
    """Return a placer for a machine standing at (`psi`, `radius`) facing
    `heading` radians measured from the outward radial."""
    ox, oy = pit_xy(psi_deg, radius)
    rx, ry = radial(psi_deg)
    base = math.atan2(ry, rx) + heading

    def put(name, size, mat, tint, fwd, left, up):
        # `size` is (along, across, up) in the MACHINE's own frame; `rot`'s
        # yaw carries local +X onto `base`, so a length stays a length.
        wx = ox + math.cos(base) * fwd - math.sin(base) * left
        wy = oy + math.sin(base) * fwd + math.cos(base) * left
        return cbox(name, size, mat, tint, loc=(wx, wy, z + up),
                    rot=(0.0, 0.0, base))

    def wheel(name, r, w, fwd, left, up):
        wx = ox + math.cos(base) * fwd - math.sin(base) * left
        wy = oy + math.sin(base) * fwd + math.cos(base) * left
        return ctube(name, r, w, S.MAT_DARK, COL_TYRE,
                     loc=(wx - math.sin(base) * w * 0.5,
                          wy + math.cos(base) * w * 0.5, z + up),
                     rot=(math.pi * 0.5, 0.0, base), sides=12)
    return put, wheel


def haul_truck(tag, psi, radius, heading, z=0.0, loaded=True):
    """A 226.8 t rigid-frame mine truck at its published envelope.

    Every dimension is `TRUCK_*` above and traces to the specalog cited there.
    The rear duals and the wider canopy are both real and both matter: the
    8.295 m canopy is the widest point and it is the number the AASHO lane rule
    is applied to, so a truck drawn 6 m wide would quietly make the 33.5 m ramp
    look twice as generous as it is.
    """
    put, wheel = at(psi, radius, heading, z)
    tr = TYRE_OD * 0.5
    frame_z = tr + 0.55
    # frame and deck
    put('%s-frame' % tag, (TRUCK_L * 0.95, 4.6, 1.15), S.MAT_DARK, COL_BODY_2,
        0.0, 0.0, frame_z)
    # dump body: floor, two sides, and the canopy that overhangs the cab
    put('%s-body' % tag, (TRUCK_L * 0.86, 7.626, 0.55), S.MAT_DARK, COL_BODY,
        -0.9, 0.0, frame_z + 1.35)
    for s in (-1, 1):
        put('%s-bodyside-%d' % (tag, s), (TRUCK_L * 0.86, 0.42, 2.35),
            S.MAT_DARK, COL_BODY, -0.9, s * 3.60, frame_z + 2.75)
    put('%s-bodyfront' % tag, (0.45, 7.626, 2.9), S.MAT_DARK, COL_BODY_2,
        TRUCK_L * 0.86 * 0.5 - 1.1, 0.0, frame_z + 2.9)
    put('%s-canopy' % tag, (3.1, TRUCK_W, 0.55), S.MAT_DARK, COL_BODY,
        TRUCK_L * 0.5 - 2.6, 0.0, TRUCK_H - 0.28)
    if loaded:
        # and it is loaded — the one thing that says which way round the haul
        # cycle this truck is on
        put('%s-load' % tag, (TRUCK_L * 0.78, 6.9, 1.15), S.MAT_ROCK, COL_MUCK,
            -0.9, 0.0, frame_z + 2.4)
    put('%s-cab' % tag, (2.1, 1.9, 2.05), S.MAT_DARK, COL_BODY_2,
        TRUCK_L * 0.5 - 2.7, 2.35, frame_z + 1.9)
    put('%s-deck' % tag, (1.0, 7.2, 0.16), S.MAT_DARK, COL_STEEL,
        TRUCK_L * 0.5 - 1.1, 0.0, frame_z + 0.85)
    put('%s-hazard' % tag, (0.5, TRUCK_W * 0.9, 0.34), S.MAT_HAZARD,
        COL_HAZARD, TRUCK_L * 0.5 - 1.35, 0.0, frame_z + 0.35)
    # six wheels: steer axle at the front, duals on the drive axle.  Track from
    # the published 7.605 m overall tyre width, wheelbase 5.905 m.
    half_track = 7.605 * 0.5 - TYRE_W * 0.5
    xf = TRUCK_WB * 0.5
    for s in (-1, 1):
        wheel('%s-wf-%d' % (tag, s), tr, TYRE_W, xf, s * half_track, tr)
        wheel('%s-wr-%d' % (tag, s), tr, TYRE_W, -xf, s * half_track, tr)
        wheel('%s-wri-%d' % (tag, s), tr, TYRE_W, -xf,
              s * (half_track - TYRE_W - 0.06), tr)
    return 14


def face_shovel(tag, psi, radius, heading, z=0.0):
    """A ~570 t hydraulic face shovel, loading.  Dimensions `SHOVEL_*` above.

    The boom and stick are drawn at a working rake with the bucket up at the
    face rather than parked, because a parked shovel says the bench has
    stopped.  The rake itself is **NOT SOURCED** — it is a pose, not a
    dimension — but the boom and stick LENGTHS and the digging height it
    reaches to are the published ones, so the pose cannot exceed the machine.
    """
    put, _ = at(psi, radius, heading, z)
    for s in (-1, 1):
        put('%s-track-%d' % (tag, s), (SHOVEL_TRACK_L, 1.9, 1.7),
            S.MAT_DARK, COL_TYRE, 0.0, s * (SHOVEL_W * 0.5 - 0.95), 0.85)
    put('%s-carbody' % tag, (SHOVEL_TRACK_L * 0.8, SHOVEL_W - 2.2, 1.5),
        S.MAT_DARK, COL_BODY_2, 0.0, 0.0, 2.35)
    put('%s-house' % tag, (SHOVEL_TRACK_L * 0.92, SHOVEL_W - 1.4, 3.6),
        S.MAT_DARK, COL_BODY, -0.6, 0.0, 4.9)
    put('%s-roof' % tag, (SHOVEL_TRACK_L * 0.7, SHOVEL_W - 2.6, 0.7),
        S.MAT_DARK, COL_BODY_2, -0.6, 0.0, SHOVEL_H - 0.35)
    put('%s-cab' % tag, (1.9, 1.8, 2.2), S.MAT_DARK, COL_STEEL,
        SHOVEL_TRACK_L * 0.36, SHOVEL_W * 0.42, 5.2)
    # boom, up and forward; stick and bucket at the face
    bx, bz = 1.4, 5.4
    put('%s-boom' % tag, (SHOVEL_BOOM, 1.5, 1.5), S.MAT_DARK, COL_BODY,
        bx + math.cos(0.62) * SHOVEL_BOOM * 0.5, 0.0,
        bz + math.sin(0.62) * SHOVEL_BOOM * 0.5)
    tipx = bx + math.cos(0.62) * SHOVEL_BOOM
    tipz = bz + math.sin(0.62) * SHOVEL_BOOM
    put('%s-stick' % tag, (SHOVEL_STICK, 1.3, 1.3), S.MAT_DARK, COL_BODY_2,
        tipx + math.cos(-0.38) * SHOVEL_STICK * 0.5, 0.0,
        tipz + math.sin(-0.38) * SHOVEL_STICK * 0.5)
    ex = tipx + math.cos(-0.38) * SHOVEL_STICK
    ez = tipz + math.sin(-0.38) * SHOVEL_STICK
    # a 34.0 m3 heaped bucket: 3.9 x 4.1 x 3.4 is 54 m3 of box, which is about
    # what a 34 m3 heaped SAE rating occupies as a shell.
    put('%s-bucket' % tag, (3.9, 4.1, 3.4), S.MAT_DARK, COL_STEEL,
        ex + 1.5, 0.0, max(1.7, ez - 1.2))
    put('%s-teeth' % tag, (0.5, 4.1, 0.35), S.MAT_DARK, COL_TYRE,
        ex + 3.5, 0.0, max(0.2, ez - 2.7))
    return 11


def rotary_drill(tag, psi, radius, heading, z=0.0):
    """The production rotary blasthole drill working the far end of the shot.

    `research/16` §A.5's central complaint about this archetype: "A 250 mm
    rotary rig on jacks with a 53 ft tower and a dust hood is a different
    animal from a 100 mm tracked top-hammer crawler, and the game draws one
    machine for both."  The hero rig is whichever the contract fitted; this is
    the other one, and it is the single object that tells a mining engineer
    this is a production bench and not a quarry.

    THE MAST HEIGHT IS DERIVED AND THE DERIVATION MATTERS.  The specalog gives
    `DRILL_MAST` 13.7 m as a MAST CONFIGURATION and, on the same row, 13.7 m as
    the SINGLE-PASS DEPTH — that number is the drilled depth, not the steel.
    The published overall height MAST UP for the same configuration is 19.93 m,
    so the physical mast is 19.93 m less whatever the deck stands at, and it is
    built to reach the published overall height rather than to the rated depth.
    Building a 13.7 m mast would have made the machine 6 m too short against
    its own datasheet.
    """
    put, _ = at(psi, radius, heading, z)
    deck_top = 3.4                                    # NOT SOURCED
    for s in (-1, 1):
        put('%s-track-%d' % (tag, s), (DRILL_BODY_L * 0.72, 1.5, 1.6),
            S.MAT_DARK, COL_TYRE, -1.2, s * (DRILL_W_REAR * 0.5 - 0.8), 0.8)
    put('%s-deck' % tag, (DRILL_BODY_L, DRILL_W_REAR, 1.9),
        S.MAT_DARK, COL_BODY, 0.0, 0.0, deck_top - 0.95)
    put('%s-house' % tag, (DRILL_BODY_L * 0.44, DRILL_W_FRONT, 2.7),
        S.MAT_DARK, COL_BODY, -2.6, 0.0, deck_top + 1.35)
    put('%s-cab' % tag, (2.3, 2.1, 2.4), S.MAT_DARK, COL_STEEL,
        1.9, DRILL_W_FRONT * 0.42, deck_top + 1.2)
    # ON JACKS — §A.5's own word.  A rotary drill levels on four jacks and
    # takes its pulldown against them, not against its tracks.
    for sx in (-1, 1):
        for sy in (-1, 1):
            put('%s-jack-%d%d' % (tag, sx, sy), (1.5, 1.5, deck_top - 1.0),
                S.MAT_DARK, COL_STEEL, sx * DRILL_BODY_L * 0.40,
                sy * (DRILL_W_REAR * 0.5 + 0.5), (deck_top - 1.0) * 0.5)
    mast_h = DRILL_H_UP - deck_top
    put('%s-mast' % tag, (1.8, 1.9, mast_h), S.MAT_DARK, COL_BODY_2,
        DRILL_BODY_L * 0.34, 0.0, deck_top + mast_h * 0.5)
    put('%s-crown' % tag, (2.4, 2.3, 0.9), S.MAT_DARK, COL_STEEL,
        DRILL_BODY_L * 0.34, 0.0, DRILL_H_UP - 0.45)
    # THE DUST HOOD AT THE COLLAR.  [PQ-L4]: "Water is injected into the air
    # stream to create a water-vapor mist that helps dampen fine dust
    # generation as well as assist in stabilizing the collar zone."  §A.5's
    # photograph asks for "a dust hood skirting the collar" by name.
    put('%s-hood' % tag, (2.6, 2.8, 1.1), S.MAT_DARK, COL_STEEL,
        DRILL_BODY_L * 0.34, 0.0, 0.55)
    put('%s-hazard' % tag, (0.4, DRILL_W_REAR * 0.85, 0.30), S.MAT_HAZARD,
        COL_HAZARD, -DRILL_BODY_L * 0.5 + 0.3, 0.0, deck_top - 0.5)
    return 13


def build_fleet():
    """Where the three machines stand, and why each is where it is.

    All three placements are **NOT SOURCED** composition.  What they are solved
    for is legibility against the game's own fog, which at the regional
    densities in `src/core/env.js` (0.0035-0.0150) is already 80-95 % saturated
    on the far wall:

      shovel + truck at the muckpile, ~90 m   fog ~20 %, 1 m ~9 px  — the
                                              working tableau, fully legible
      rotary drill on the floor,     ~150 m   fog ~46 %, mast 20 m tall, so a
                                              175 px vertical against the wall
      truck on the ramp,             ~210 m   fog ~69 %, but it is a dark
                                              silhouette on a pale road and it
                                              is the ONLY thing that gives the
                                              wall behind it a size
    """
    made = 0
    # ── the loading tableau at the toe of the mid lift ──────────────────────
    made += face_shovel('shovel', MID_PSI0 + 9.0, MID_R - 8.0, math.pi * 0.98)
    made += haul_truck('truck-load', MID_PSI0 + 14.0, MID_R - 14.0,
                       math.pi * 0.44, loaded=False)
    # ── the production drill, on the floor, screen-left of the far wall ─────
    dd, da = 150.0, -0.42 * half_width(150.0)
    dpsi = math.degrees(math.atan2(da - 1.1469, dd - 13.7507))
    drad = math.hypot(dd - 13.7507, da - 1.1469)
    made += rotary_drill('drill', dpsi, drad, math.pi * 0.62)
    # ── the loaded truck on the ramp, climbing out ─────────────────────────
    rpsi = 5.0
    zr = ramp_z(rpsi)
    r_in = toe_at(rpsi) + int(zr // BENCH_H) * MODULE \
        + (zr - int(zr // BENCH_H) * BENCH_H) / math.tan(FACE_ANGLE * D2R)
    made += haul_truck('truck-ramp', rpsi, r_in + RAMP_W * 0.35,
                       math.pi * 0.5, z=zr, loaded=True)
    return made


# ═════════════════════════════════════════════════════════════════════════════
# NAMED NODES
# ═════════════════════════════════════════════════════════════════════════════

def build_anchors():
    """The nodes the game reads off this site.

    `mount:` is reused rather than a new prefix — `src/core/gltfRig.js` already
    indexes it and `site.finish()` already restores its world transform after
    the join.  None carries `cone_deg`/`range_m`, so none is read as a lamp: a
    production bench works in daylight and `research/16` §A.5 asks for no
    lighting on one.
    """
    S.anchor('site-collar', (0.0, 0.0, 0.0))
    wx, wy = pit_xy(0.0, toe_at(0.0))
    S.anchor('site-face', (wx, wy, 0.0),
             bench_h=BENCH_H, face_deg=FACE_ANGLE, berm_w=BERM_W,
             interramp_deg=round(INTERRAMP, 2), depth_m=PIT_DEPTH)
    mx, my = pit_xy((MID_PSI0 + MID_PSI1) * 0.5, MID_R)
    S.anchor('site-lift', (mx, my, 0.0), bench_h=BENCH_H)
    rp = RAMP_FOOT_PSI + 4.0
    rx, ry = pit_xy(rp, toe_at(rp))
    S.anchor('site-ramp', (rx, ry, 0.0),
             ramp_w=RAMP_W, grade_pct=RAMP_GRADE * 100.0)


# ═════════════════════════════════════════════════════════════════════════════
# THE KEEP-CLEAR ASSERTION
# ═════════════════════════════════════════════════════════════════════════════

CLEAR_R = 5.0                       # NOT SOURCED — a visual reserve around the
#                                     collar, NOT an operational exclusion zone.
#   5.0 m and not more, because ON THIS ARCHETYPE THE MACHINE IS STANDING IN
#   THE MIDDLE OF THIS FILE'S OWN GEOMETRY: the origin is a blasthole in the
#   pattern, and its nearest neighbours are one burden (6.10 m) back and one
#   spacing (7.93 m) along.  A larger reserve would have had to delete real
#   pattern rather than protect the rig.


def _assert_clear():
    """No authored vertex inside `CLEAR_R` of the collar, above the floor.

    The machine stands at three.js z = +2.4 with a footprint of several metres
    and the collar is the origin; a site object inside that radius is a site
    object growing through the rig.  Checked on REAL VERTICES through each
    object's world matrix, before the material joins, for the reason ASTRA.md
    §5 gives: local bounding boxes over-estimate rotated geometry and every one
    of this file's bench faces is rotated.

    Flat ground marking is exempt — the collar's own cuttings ring is
    deliberately at the origin and is 70 mm thick.
    """
    bpy.context.view_layer.update()
    worst = None
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        for v in o.data.vertices:
            p = o.matrix_world @ v.co
            if p.z < 0.35:
                continue
            r = math.hypot(p.x, p.y)
            if r < CLEAR_R and (worst is None or r < worst[0]):
                worst = (r, o.name, tuple(round(c, 2) for c in p))
    if worst is not None:
        raise AssertionError(
            'open_pit_bench: "%s" has a vertex %.2f m from the collar at %s, '
            'inside the %.1f m reserve. The rig stands there.'
            % (worst[1], worst[0], worst[2], CLEAR_R))


def _report_frame():
    """Print where the composition actually lands in the hero frame.

    "Tell agents to measure, not to reason" (ASTRA.md §12).  This is the CPU
    half of that: it cannot prove what the GPU will draw, but it can prove that
    the geometry is where this file's arithmetic says it is, which is the half
    that was wrong twice on `quarry-bench`.
    """
    rows = []
    for b in range(N_BENCH):
        cr = toe_at(0.0) + b * MODULE + FACE_RUN
        d = 13.7507 + cr
        rows.append('b%d z=%3.0f ndc_y=%+.2f' % (b + 1, (b + 1) * BENCH_H,
                                                 ndc_y(d, (b + 1) * BENCH_H)))
    print('FRAME_WALL toe_d=%.1f %s'
          % (13.7507 + toe_at(0.0), ' | '.join(rows)))
    zr5 = ramp_z(5.0)
    print('FRAME_RAMP foot_psi=%.0f z@psi0=%.1fm z@psi+5=%.1fm '
          'climb_over_visible_arc=%.1fm'
          % (RAMP_FOOT_PSI, ramp_z(0.0) or 0.0, zr5 or 0.0,
             (ramp_z(23.0) or 0.0) - (ramp_z(-20.0) or 0.0)))
    md, ma = to_frame(*pit_xy(MID_PSI0, MID_R))
    print('FRAME_MIDLIFT near end d=%.1f ndc=(%.2f, %.2f) crest ndc_y=%+.2f'
          % (md, ndc_x(md, ma), ndc_y(md, 0.0), ndc_y(md, BENCH_H)))


# ═════════════════════════════════════════════════════════════════════════════

def build(out_path):
    _verify_geometry()
    S.reset()
    n = 0
    # Staged and timed.  A site of this size is minutes of `bpy.ops` and the
    # first build of it ran for ten with no output at all, because Python's
    # stdout is block-buffered into a pipe; a stage line that flushes is the
    # difference between "it is working" and "it has hung".
    import time
    for name, fn in (('wall', build_wall), ('mid-lift', build_mid_lift),
                     ('muck', build_muck), ('floor', build_floor),
                     ('fleet', build_fleet)):
        t0 = time.time()
        k = fn()
        n += k
        print('PIT_STAGE %-9s objects=%5d  %6.1f s'
              % (name, k, time.time() - t0), flush=True)
    build_anchors()
    _assert_clear()
    _report_frame()
    print('PIT_OBJECTS authored=%d' % n, flush=True)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    return S.finish(out_path)


def preview(path, stem=None):
    """Re-import the REAL export and render it FROM THE GAME'S HERO CAMERA.

    Not a turntable.  `blender/preview.py` frames a machine from three-quarter
    views, which is the right thing for a machine and the wrong thing for a
    place: a site is only ever seen from one camera, and the only question
    worth rendering is what THAT camera sees.  So this puts a Blender camera at
    the hero eye, on the hero bearing, with a horizontal field of
    2*atan(0.4023) = 43.9 degrees and a vertical field of 20.97 degrees — the
    measured frame at the head of this file — and renders 1480 x 707, which is
    that aspect.

    THIS IS AN OFFLINE BLENDER RENDER AND IT IS NOT A GAMEPLAY CAPTURE.  It has
    none of the game's renderer: no `assets.js` procedural materials, no
    FogExp2 (which will do most of the work on the far wall), no post chain, no
    tone map, no HUD, no rig, and no terrain.  It proves POSITION, SILHOUETTE
    and PROPORTION.  It proves nothing about colour, exposure or draw calls.
    A second, wider view is rendered from outside the pit so the whole bowl and
    the ramp's spiral can be checked as geometry.
    """
    stem = stem or os.path.join(ROOT, 'shots', 'open-pit-bench')
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)

    # PIN THE SURFACE PARAMETERS THE EXPORT DELIBERATELY DOES NOT CARRY.
    #
    # A NOTE ON WHAT THIS IS *NOT* FOR, because it was added on a wrong
    # diagnosis and the wrong diagnosis is the more useful thing to record.
    # The first render of this file came back as a flat grey wall with no bench
    # structure, and the assumed cause was that COLOR_0 was not reaching Base
    # Color.  It was: Blender's glTF importer wires a Color Attribute node
    # itself whenever a primitive carries COLOR_0, and re-rendering with an
    # explicit node produced a pixel-identical frame.
    #
    # THE ACTUAL CAUSE WAS GEOMETRY, NOT MATERIAL, and it is written up at
    # `build_wall()`: the hero eye is at 2.25 m and these benches are 15 m and
    # up, so every horizontal surface on the wall is seen FROM UNDERNEATH and
    # its top never appears at all.  A render is worth more than an argument
    # exactly here — no amount of reasoning about the value step would have
    # found it, and the fix was to move the read onto the vertical surfaces.
    #
    # What this loop legitimately does is pin roughness, metallic and
    # transmission, which a name-only export does not carry, so the inspection
    # render does not invent a look the game will not produce.
    for m in bpy.data.materials:
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        if bsdf is None:
            continue
        bsdf.inputs['Roughness'].default_value = 0.88
        bsdf.inputs['Metallic'].default_value = 0.0
        bsdf.inputs['Transmission Weight'].default_value = 0.0

    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 24
    sc.render.threads_mode = 'FIXED'
    sc.render.threads = 4
    sc.render.image_settings.file_format = 'PNG'
    sc.render.film_transparent = False

    # Flat inspection lighting.  NOT the game's sun and not a claim about it.
    sc.world = bpy.data.worlds.new('inspection-world')
    sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs[0].default_value = (.60, .68, .78, 1)
    sc.world.node_tree.nodes['Background'].inputs[1].default_value = 1.1
    bpy.ops.object.light_add(type='SUN')
    sun = bpy.context.object
    sun.data.energy = 4.0
    sun.data.angle = 0.03
    sun.rotation_euler = (math.radians(58), 0.0, math.radians(-38))
    # a ground plane, because the game's terrain is not in this file
    bpy.ops.mesh.primitive_plane_add(size=900)
    g = bpy.context.object
    gm = bpy.data.materials.new('inspection-ground')
    # `diffuse_color` is the VIEWPORT colour and Cycles ignores it: the first
    # render of this file came back with a near-white floor under the whole
    # pit, which flattened every value judgement that could have been made
    # from it.  Cycles reads the node tree.
    gm.use_nodes = True
    gm.node_tree.nodes['Principled BSDF'].inputs['Base Color']         .default_value = (0.46, 0.43, 0.38, 1)
    gm.node_tree.nodes['Principled BSDF'].inputs['Roughness']         .default_value = 0.92
    g.data.materials.append(gm)
    g.location = (0, 0, -0.05)

    def shoot(name, loc, look, res, hfov_tan):
        cam_d = bpy.data.cameras.new(name)
        cam_d.sensor_fit = 'HORIZONTAL'
        cam_d.angle_x = 2.0 * math.atan(hfov_tan)
        cam = bpy.data.objects.new(name, cam_d)
        cam.location = Vector(loc)
        cam.rotation_euler = (Vector(look) - Vector(loc)) \
            .to_track_quat('-Z', 'Y').to_euler()
        bpy.context.collection.objects.link(cam)
        sc.camera = cam
        sc.render.resolution_x, sc.render.resolution_y = res
        out = '%s-%s.png' % (stem, name)
        sc.render.filepath = out
        bpy.ops.render.render(write_still=True)
        print('PIT_RENDER %s (offline Blender render, NOT a gameplay capture)'
              % out)
        bpy.data.objects.remove(cam, do_unlink=True)

    # 1. THE HERO FRAME.  The aspect is DERIVED from the two measured
    #    constants, not chosen: HALF_W_K / tan(20.97/2) = 0.4023 / 0.18506 =
    #    2.174, so 1480 x 681.  The camera axis is aimed at the frame's own
    #    centre height, (top + bot)/2 = EYE_Z + (TOP_K - BOT_K)/2 x d, which is
    #    the 1.2 degrees of upward pitch the measurement recorded.
    look = (EYE[0] + AXIS[0] * 60.0, EYE[1] + AXIS[1] * 60.0,
            EYE_Z + (TOP_K - BOT_K) * 0.5 * 60.0)
    shoot('hero', EYE, look, (1480, 681), HALF_W_K)
    # 2. THE WHOLE BOWL, from outside and above, to check the ramp's spiral,
    #    the 360-degree closure and the wander in the toe line.
    shoot('bowl', (300.0, -470.0, 240.0), (-40.0, 60.0, 20.0),
          (1400, 900), 0.42)
    # 3. A LONG SIDE ELEVATION of the wall profile, to check the batter angle
    #    and the module by eye against the numbers this file prints.
    shoot('profile', (980.0, 40.0, 150.0), (0.0, 40.0, 55.0),
          (1400, 700), 0.26)


if __name__ == '__main__':
    out = os.path.join(ROOT, 'public', 'models', 'sites', 'open-pit-bench.glb')
    result = build(out)
    if '--preview' in sys.argv:
        preview(result)
