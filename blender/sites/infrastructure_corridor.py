"""
SITE — `infrastructure-corridor`.  Exports `public/models/sites/infrastructure-corridor.glb`.

A CLEARED ALIGNMENT CUT THROUGH COUNTRY.  Not a pit and not a pad: a linear
working corridor of a SOURCED width, laid out ACROSS that width in the sourced
order — un-stripped ground, buffer, topsoil windrow, buffer, ditch-spoil windrow,
ditch line, pipe make-up strip, equipment and travel lane, buffer, un-stripped
ground — running from the near frame to the horizon, broken only where the
machine stands, with a stone access joining it and marker posts where it crosses.

`src/game/data.js` SITE_ARCHETYPES, verbatim, is the brief:

    "A linear alignment — road, rail, pipeline or utility easement — worked
     from a strip that moves along with the job."
    renders: "A long working strip with the alignment running through it:
     embankment or cutting on one side, open country or live traffic on the
     other. The rig moves along a line, not around a point."

and `src/world/terrain.js` ARCHETYPES, also verbatim:

    "A working strip along an alignment: cleared on the line, untouched a few
     metres either side of it.  That contrast IS the archetype."

THE ONE IDEA THIS FILE IS BUILT ON
----------------------------------
A corridor does not read as a corridor because it is long.  It reads as a
corridor because it is made of PARALLEL LINES THAT CONVERGE, and because those
lines are in the right order across the width.  Six of them are drawn here and
every one of them is a real strip of a real working right-of-way, at its sourced
width: the un-stripped edge, the topsoil windrow, the ditch-spoil windrow, the
ditch line, the strung pipe, and the matted travel lane.  Projected into the
measured hero frame they land at NDC x -0.80, -0.44, -0.20, -0.04, +0.47 and
+0.66 at chainage 30 m along the line -- 41 to 46 m from the eye -- and all run
to one vanishing point at -0.39.  That is the picture, and `check_frame()`
asserts every one of those numbers on every build, so this paragraph cannot go
quietly false the way a docstring normally does.

Everything else — the access, the marker posts, the compound, the pegs — is
furniture on top of it, and none of it would save the shot on its own.

Read `research/sites/infrastructure-corridor.md` for the source list with the
sources' own words, what could NOT be sourced, the measured counts, and the
integration request for `src/world/terrain.js`.

WHAT THIS SITE MUST STAY NEUTRAL ABOUT
--------------------------------------
`terrain.js` routes FOUR applications here — `civil-infrastructure`,
`trenching`, `utility-hdd` and `anchoring` — and `data.js` hands this archetype
to twenty-odd methods, from `auger` and `cable-tool` through `hdd`, `sonic`,
`anchor`, `driven-pile`, `rockbolt` and `top-hammer`.  So everything here is
either (a) THE CORRIDOR, which is true of all of them, or (b) UNCONNECTED
material and plant standing on it.  Nothing is plumbed, coupled, aimed at or
touching the rig.  The ditch, its spoil and the pipe string all STOP SHORT of
the working position and the machine stands in the break — which is not a dodge
to duck the question, it is what a corridor looks like wherever the line has to
be crossed rather than dug through, and it is the reason the archetype has a
drilling rig on it at all.

THERE IS DELIBERATELY NO OPEN TRENCH MODELLED, for two reasons and the second is
the stronger.  (1) `terrain.js` owns the ground mesh and it is opaque, so a
trench modelled below z = 0 is geometry nobody can ever see — the ground hides
all of it and only the rim pokes through to z-fight.  (2) An open trench with a
pipe in it badges every contract on this archetype as open-cut pipe laying,
which is one method out of twenty.  What IS drawn is the EVIDENCE of the ditch:
its two windrows at their sourced widths and sourced separation, its line, and
its lip.

MATERIALS — FOUR, AGAINST A BUDGET OF SIX
-----------------------------------------
See THE BUDGET in `blender/lib/site.py`.  A site .glb costs ONE DRAW CALL PER
MATERIAL once `finish()` joins the statics, and it is spending a surface band
already over its ceiling of 80 in eight of twenty-one method states with no .glb
on any site at all.  FOUR and not six, because four is the most this archetype
can honestly give back — see THE GIVE-BACK in the research note, which is an
open measurement handed to the integration agent, not a claim made here.

    dirt           topsoil windrow, ditch spoil, un-stripped edge lips, arisings
    gravel         stone access and aprons, bedding stone, sub-base
    paintedSteel   the strung pipe and its coating, ROW stakes, marker posts,
                   cones, cabin, tank — separated by VERTEX COLOUR and not by
                   material (see `colour()`)
    timber         mat run, mat stack, pipe skids, centreline stake

Everything else is bought in TRIANGLES, which are free in draw calls.

NO BRIGHT-STEEL MATERIAL, AND THAT IS A DECISION, NOT AN OVERSIGHT.  The objects
that would want `rawSteel` here are a 51 mm marker post and the bevelled end of
a pipe joint.  At the 25–70 m this corridor is read at, a 51 mm cylinder is a
fraction of a pixel wide — the same sub-pixel argument `quarry_bench.py` makes
when it refuses to model belt skirting and an 80 mm handrail plate.  Detail
below the resolution of the shot does not read as detail; it costs a draw call
to produce noise.

NEVER `transmission`
--------------------
`blender/lib/site.py`.  Nothing here is glazed: the cabin's openings are opaque
dark faces on the shared paint material, which is what `urban_plot.py` does and
for the same measured reason (+65 to +81 draw calls, independent of size).

AXES AND ORIGIN
---------------
`blender/lib/site.py` AXES.  Metres, Blender Z-up, and THE ORIGIN IS THE HOLE
COLLAR at ground level.  `terrain.js` puts the collar at its own (0, 0, 0) and
the rig body at three.js (0, 0, 2.4) = Blender (0, -2.4, 0), between the collar
and the camera.  Blender +Y is AWAY from the hero camera.

NO OPAQUE FLOOR OVER THE LIVE GROUND
------------------------------------
`terrain.js` owns the ground mesh, the collar, the live spoil ring and the
section seam, and the player has to keep seeing the machine and the hole.  THE
WORKING STRIP HERE IS THEREFORE DEFINED BY WHAT BOUNDS IT and never by a slab
laid over the terrain.  There is no continuous floor in this file, and nothing
at all within `CLEAR_R` of the collar — asserted over every exported vertex in
`build()`, not over the placements that produced them.

NAMING
------
`DOMAIN.md` §10.  No manufacturer, model designation, marque or real scheme name
is modelled or exported, and NOTHING here carries lettering of any kind.  That
matters most on the marker posts: 49 CFR 192.707(d) requires a legend naming the
operator, so a legible marker post would mean inventing a pipeline company.  The
posts get the sourced height and the sourced "sharply contrasting color" and no
text at all.
"""

import importlib.util
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


def _load_site_lib():
    """Load `blender/lib/site.py` BY PATH.

    `site` is a CPython STANDARD LIBRARY module — it is what runs at interpreter
    start-up to set up `sys.path` — so `sys.modules['site']` is already taken by
    the time any of this executes, and a plain `import site` returns THAT one
    however `sys.path` is ordered.  The import succeeds; the failure surfaces
    later as an `AttributeError` from somewhere that looks unrelated.  Same
    reasoning, same fix and the same private module name as `quarry_bench.py`.
    """
    path = os.path.normpath(os.path.join(HERE, '..', 'lib', 'site.py'))
    spec = importlib.util.spec_from_file_location('drillity_site', path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules['drillity_site'] = mod
    spec.loader.exec_module(mod)
    return mod


S = _load_site_lib()

D2R = math.pi / 180.0
FT = 0.3048                        # exact, by definition
IN = 0.0254                        # exact, by definition


# ═════════════════════════════════════════════════════════════════════════════
# THE HERO CAMERA — MEASURED, BUT NOT MEASURED BY THIS FILE
#
# These seven numbers are taken VERBATIM from `blender/sites/quarry_bench.py`,
# which measured them off the LIVE hero camera by projecting probe points
# through `ctx.camera` and bisecting for the NDC edges, holding the probe until
# `terrain.archetype` and the ground mesh both agreed the site was really up.
# That file's own comment block records TWO earlier cameras that were wrong: the
# fov/aspect figures quoted in `terrain.js`'s open-pit comment, and then the
# BOOT camera, read while the ~28 s shader compile was still on screen.
#
# They are COPIED, not re-derived, because ASTRA §5 is explicit that two tables
# describing one thing will drift and the wrong one gets believed.  This file
# cannot re-measure them — the GPU lease is held by another track and no headed
# capture may be started from here — and it does not pretend to have.  If the
# hero camera moves, every composition number below is wrong, and it is wrong in
# the SAME DIRECTION as `quarry_bench.py`'s, which is the failure that can
# actually be found.
#
#     eye        three.js [8.400, 2.250, 10.940] = Blender [8.400, -10.940, 2.250]
#     direction  three.js [-0.673, 0.024, -0.740]     pitch +1.36 deg (slightly UP)
#     fov 20.97 vertical, aspect 1.724
#     half-width(d) = 0.4023 d   top(d) = 2.25 + 0.2065 d   bot(d) = 2.25 - 0.1638 d
#     the horizon is at NDC y = -0.12;  the collar at d = 13.75, on the bottom edge
# ═════════════════════════════════════════════════════════════════════════════
EYE = (8.400, -10.940)
EYE_Z = 2.250
AXIS = (-0.6731, 0.7401)           # plan view direction, Blender XY
RIGHT = (0.7401, 0.6731)           # screen-right in plan, Blender XY
TOP_K = 0.2065
BOT_K = 0.1638
HALF_W_K = 0.4023


def on_axis(dist, across=0.0):
    """Blender (x, y) at `dist` m along the hero view axis, `across` m across the
    frame (+ is screen-right)."""
    return (EYE[0] + AXIS[0] * dist + RIGHT[0] * across,
            EYE[1] + AXIS[1] * dist + RIGHT[1] * across)


def half_width(dist):
    return dist * HALF_W_K


def ndc_x(dist, across):
    """-1 the left edge of the surface band, +1 the right."""
    return across / max(1e-6, half_width(dist))


def ndc_y(dist, height):
    """-1 the bottom of the band, +1 the top; the measured horizon is -0.12."""
    top = EYE_Z + TOP_K * dist
    bot = EYE_Z - BOT_K * dist
    return 2.0 * (height - bot) / (top - bot) - 1.0


# ═════════════════════════════════════════════════════════════════════════════
# THE CROSS-SECTION — SOURCED, STRIP BY STRIP
#
# [INGAA-F9902]  The INGAA Foundation, report F-9902, "Temporary Right-of-Way
#                Width Requirements for Pipeline Construction", prepared by Gulf
#                Interstate Engineering, 1999.
#                https://ingaa.org/wp-content/uploads/2012/09/19105.pdf
#                An industry trade-association engineering study — NOT a
#                regulation, and it argues a case (for wider right-of-way), so
#                it is cited as what it is.  What makes it usable is that it
#                tabulates the width of EVERY strip across the right-of-way,
#                banded by pipe diameter, and its own drawings carry the same
#                figures as dimension strings.
#
# [INGAA-PRIMER] The INGAA Foundation, "Building Interstate Natural Gas
#                Transmission Pipelines: A Primer", 2013.
#                https://ingaa.org/wp-content/uploads/2023/09/2013_Building-Interstate-Natural-Gas-Transmission-Pipelines-A-Primer.pdf
#                Independent second breakdown (Tables A1-A3) and the drawing
#                STD-INGAA-1, which agrees with F-9902.
#
# [FERC-PLAN]    FERC, "Upland Erosion Control, Revegetation and Maintenance
#                Plan", May 2013 (reproduced verbatim as Appendix C of the
#                NiSource FEIS; the ferc.gov copy refuses fetches):
#                https://www.fws.gov/sites/default/files/documents/NiSourceFEISappndxC_FERCPlans.pdf
#
# [PCGP-POD]     Pacific Connector Gas Pipeline, FERC Appendix F.10 Plan of
#                Development, filed 23 Jan 2018.
#                https://www.ferc.gov/sites/default/files/2020-05/Appendix-F-10-Part-1.pdf
#
# [OSHA-P]       29 CFR 1926 Subpart P.  https://www.law.cornell.edu/cfr/text/29/1926.651
# [CFR-192]      49 CFR 192.  https://www.law.cornell.edu/cfr/text/49/192.327
# [API-5L]       API Specification 5L, 43rd ed., March 2004, Table 11.
#                http://www.entech.rs/PDF/STANDARDS%20DATA%20SHEETS/STEEL%20API/API%205L.pdf
# [API-1109]     API RP 1109, 5th ed., Oct 2017 (the copy API released publicly).
#                https://www.api.org/~/media/files/oil-and-natural-gas/pipeline/damage-prevention/811week_sec_1109_e5_2017.pdf
# [SLP-SMP]      Southampton to London Pipeline Project, CEMP Appendix F, Soil
#                Management Plan, Rev 1.0, June 2021.
#                https://www.slpproject.co.uk/wp-content/uploads/2021/08/Hounslow-CEMP-Appendix-F-Soil-Management-Plan.pdf
# [TSM8]         DfT, Traffic Signs Manual Chapter 8 (2009), Table A1.5.
#                https://en.wikisource.org/wiki/Page:UK_Traffic_Signs_Manual_-_Chapter_8_-_Part_1_(Traffic_Safety_Measures_and_Signs_for_Road)._Designs_2009.pdf/286
#
# THE PIPE SIZE THIS CORRIDOR IS SET OUT FOR.  Every width below comes out of
# [INGAA-F9902]'s NPS 18-24 band, so the diameter has to be inside it, and 24 in
# is also the diameter of the worked pullback example in the PPI Handbook of PE
# Pipe Ch.12 Appendix B (p457) that `research/07-hdd-trenchless.md` §D5 already
# leans on.  One number, chosen once, and every strip follows from it.
# ═════════════════════════════════════════════════════════════════════════════
PIPE_OD = 24.0 * IN                # 0.610 m   [F] the NPS 18-24 band's top

# [INGAA-F9902], verbatim on the ROW's three parts:
#     "The analysis divides the construction right-of-way width into three major
#      components: (1) Ditch Area, (2) Spoil Side, and (3) Working Side.  The
#      ditch area is for placement of the pipe; the spoil side is for the
#      temporary stockpiling of excavated subsoil during construction; and the
#      working side is for the construction equipment and crew."
# and, as a dimension string on its own NPS 18-24 drawing:
#     "39' - SPOIL SIDE | DITCH AREA 8' | 48' - WORKING SIDE | 95' RIGHT-OF-WAY WIDTH"
#
# CORROBORATED INDEPENDENTLY at the same width by [PCGP-POD], a filed FERC plan
# of development for a 36-inch line: "PCGP proposes to utilize a standardized
# 95-foot wide temporary construction right-of-way with a 50-foot Operational
# Right-of-Way easement."  Two unrelated documents, one number.
#
# FOR SCALE, and NOT used here: [FERC-PLAN] caps the default at "75 feet ...
# expanded by up to 25 feet without Director approval", i.e. 22.86 to 30.48 m,
# and 95 ft sits inside that band.
ROW_W = 95.0 * FT                  # 28.956 m  [F] [INGAA-F9902], [PCGP-POD]

# The strips, NPS 18-24 band, [INGAA-F9902] Figures 2 and 3.  Verbatim:
#     "A three-foot buffer zone is allowed between the edge of the right-of-way
#      and the topsoil, and between the topsoil and ditch spoil."
#     "Depending on the pipe size, the amount of topsoil stripped will require
#      from 10 to 20 feet for stockpiling."
#     "the ditch spoil is stockpiled no closer than two feet to the ditchline,
#      where it is segregated from the topsoil by a three foot buffer zone.
#      Depending on the pipe size, the ditch spoil will require from 14 to 29
#      feet for stockpiling."
#     "this area will have a width of 31 to 42 feet that includes a 5 foot
#      separation zone for passing and maneuvering of equipment."
BUFFER_W = 3.0 * FT                # 0.914 m   [F]
TOPSOIL_STRIP = 14.0 * FT          # 4.267 m   [F] NPS 18-24
SPOIL_STRIP = 19.0 * FT            # 5.791 m   [F] NPS 18-24
DITCH_STRIP = 8.0 * FT             # 2.438 m   [F] NPS 18-24
MAKEUP_STRIP = 11.0 * FT           # 3.353 m   [F] NPS 18-24 (pipe make-up/welding)
EQUIP_STRIP = 34.0 * FT            # 10.363 m  [F] NPS 18-24 (equipment + travel lane)
# 3 + 14 + 3 + 19 + 8 + 11 + 34 + 3 = 95 ft.  Asserted at import, below.

# TOPSOIL STRIPPING DEPTH.  [FERC-PLAN]: "segregate at least 12 inches of
# topsoil in deep soils (more than 12 inches of topsoil)".  [INGAA-F9902]: "This
# study considers the removal of 12 inches of topsoil from the ditch line and
# ditch spoil area."  [INGAA-PRIMER]: "Topsoil is removed to its actual depth,
# up to a maximum of 12 inches."  Three sources, one figure.
TOPSOIL_D = 12.0 * IN              # 0.305 m   [F] [FERC-PLAN], [INGAA-*]

# DEPTH OF COVER.  [INGAA-F9902] states its own design basis — "Pipe cover is 36
# inches" — so 36 in is used here, for consistency with the strip widths above
# that were computed from it.  It is also the figure 49 CFR 192.327(a) requires
# in Class 2, 3 and 4 locations and at "drainage ditches of public roads and
# railroad crossings"; Class 1 in normal soil is 30 in (762 mm).
COVER = 36.0 * IN                  # 0.914 m   [F] [INGAA-F9902] basis; [CFR-192]

# SPOIL SET BACK FROM THE DITCH.  29 CFR 1926.651(j)(2), verbatim: "Protection
# shall be provided by placing and keeping such materials or equipment at least
# 2 feet (.61 m) from the edge of excavations."  [INGAA-PRIMER] states the same
# rule in its own words and applies it to the pipe string as well: "OSHA
# regulations require that a setback of two feet be maintained between the pipe
# and the trench."
SPOIL_SETBACK = 2.0 * FT           # 0.610 m   [F] [OSHA-P] 1926.651(j)(2)

# SWELL.  [INGAA-F9902] design basis, verbatim: "Flat right-of-way (no side
# slope) with a 30 percent 'swell' factor on excavated soil."  Used to size the
# two windrows from the volume they have to hold; see build_windrows().
SWELL = 1.30                       # [F] [INGAA-F9902]

# TRENCH SECTION.  [INGAA-PRIMER] Table A3 (NPS 36, 36-in cover) gives trench
# bottom 5 ft and surface 8 / 10 / 15 ft for OSHA soil Type A / B / C.  The
# Type B case is the one its own drawing STD-INGAA-1 assumes ("DRAWING ASSUMES
# TYPE 'B' SOIL"), and 10 ft over 5 ft at that depth is a batter of 0.42 H : 1 V
# — DERIVED here from the two sourced widths, not a slope anyone states.  It is
# well inside the 1:1 maximum 29 CFR 1926.652 Appendix B allows for Type B soil.
TRENCH_BATTER = 0.42               # H:V  [I] derived from [INGAA-PRIMER] Table A3

# ANGLE OF REPOSE, used only to CHECK the derived windrow heights and never to
# set them.  [SLP-SMP] Table 3.2: loose topsoil 35-40 deg dry, 40-45 deg wet;
# loose clay/silt 20-25 deg; sandy gravel 25-30 deg.  Same document caps
# stockpiles: "Topsoil stockpiles shall not exceed 4m in height and subsoil
# stockpiles shall not exceed 5m in height."
REPOSE_TOPSOIL = (35.0, 40.0)      # [F] [SLP-SMP] Table 3.2, dry
REPOSE_SUBSOIL = (20.0, 30.0)      # [F] [SLP-SMP] Table 3.2, loose clay/silt..sandy gravel
STOCKPILE_MAX_H = 4.0              # [F] [SLP-SMP] topsoil

# THE STRUNG PIPE.  [API-5L] Table 11 footnote a, verbatim: "Nominal lengths of
# 20 ft (6 m) were formerly designated 'single random lengths' and those of
# 40 ft (12 m) 'double random lengths.'"  [INGAA-PRIMER] independently: "Pipe
# typically is manufactured in 40 to 60 foot lengths" and describes "multiple
# welding stations spaced for welding 40-foot nominal length pipe joints".
JOINT_L = 40.0 * FT                # 12.192 m  [F] [API-5L] Tbl 11, [INGAA-PRIMER]

# WHAT THE STRING SITS ON.  [INGAA-PRIMER], verbatim: "The welded pipe string
# and its temporary wooden skid pipe supports typically are ten to twelve feet
# wide."  That is the 11 ft MAKEUP_STRIP above, from the other direction.
STRING_FOOT_W = 11.0 * FT          # 3.353 m   [F] [INGAA-PRIMER]

# MARKER POSTS.  [API-1109] §5.5.3, verbatim: "Aboveground markers should be
# sufficiently elevated to allow them to be clearly viewed from a distance, and
# to allow them to remain visible above normal vegetation or snow accumulation.
# A minimum height of 4 ft above grade is recommended."  §5.2: "metal pipe posts
# should be straight, sound, and have a nominal diameter of 2 in. or larger."
# 49 CFR 192.707 puts them "at each crossing of a public road and railroad", on
# "a background of sharply contrasting color" — which is why they stand at the
# far crossing here and nowhere else, and why they carry a colour and no words.
MARKER_H = 4.0 * FT                # 1.219 m   [F] [API-1109] §5.5.3
MARKER_D = 2.0 * IN                # 0.051 m   [F] [API-1109] §5.2

# CENTRELINE STAKES.  PennEast FEIS, verbatim: "PennEast would stake the
# centerline in 200-foot intervals and at points of inflection (pipeline bends
# or PIs)."  https://www.ferc.gov/sites/default/files/2020-05/Final-Environmental-Impact-Statement_2.pdf
# At 61 m you see about one in a 70 m frame, and that is what is drawn.  The
# alignment here is straight, so there are no points of inflection to stake.
STAKE_PITCH = 200.0 * FT           # 60.960 m  [F] PennEast FEIS

# TRAFFIC CONES, at the access only, because that is where a road is.
# [TSM8] Table A1.5 Detail B: 450 mm cones on roads up to 40 mph, 750 mm at
# 50 mph and above, "Cone spacing 1.5 m" in every row of the table.  Chapter 8
# Part 2 O7.2.43: "Under no circumstances shall the size of cone be less than
# 450 mm in height."  MUTCD 2009 §6F.64 agrees to within the unit conversion
# (18 in / 28 in).  The 450 mm size is used: a temporary access off a rural road.
CONE_H = 0.450                     # [F] [TSM8] Table A1.5
CONE_PITCH = 1.500                 # [F] [TSM8] Table A1.5

# TIMBER MATS.  [VENDOR] — two US manufacturers publish the same section and the
# same length range for a 12-inch timber crane mat, 4 ft wide, 16 to 40 ft long:
#   https://totemmats.com/crane-mats-12/  ("12" mats are generally 4' wide and
#   come in standard lengths of 16', 20', 24', 28', 30', 32', 36' and 40' long")
#   https://vikingmat.com/products/12-timber/
# The shortest standard length is used.  This is a MANUFACTURER'S TABLE, not a
# standard, and it is labelled as one.  The practice is sourced separately:
# [INGAA-PRIMER] drawing STD-INGAA-36 carries the note "EQUIPMENT TO BE
# SUPPORTED ON THE GROUND SURFACE OR TIMBER MATS AS CONDITIONS DICTATE".
# (UK bog mats are a different product — 1.0 m wide, 3 to 7 m long, per
# birkettsbogmats.com and bogmats.com — and are NOT what is drawn here.)
MAT_L = 16.0 * FT                  # 4.877 m   [VENDOR] Totem, Viking
MAT_W = 4.0 * FT                   # 1.219 m   [VENDOR] Totem, Viking
MAT_T = 12.0 * IN                  # 0.305 m   [VENDOR] Totem, Viking

# WELFARE CABIN.  Manufacturer technical description v12.06.2023, pp3, 7, 11,
# already read and recorded in `research/sites/urban-plot.md` and used by
# `blender/sites/urban_plot.py`.  The same figures are used here so that two
# sites cannot disagree about the same object.  No marque is exported.
CABIN_L, CABIN_W, CABIN_H = 6.055, 2.435, 2.591     # [F] p3 §1.1 external envelope
DOOR_W, DOOR_H = 0.875, 2.125                       # [F] p7 §2.5
WINDOW_W, WINDOW_H, SILL_H = 0.945, 1.200, 0.870    # [F] p7 §2.6

assert abs((BUFFER_W + TOPSOIL_STRIP + BUFFER_W + SPOIL_STRIP + DITCH_STRIP
            + MAKEUP_STRIP + EQUIP_STRIP + BUFFER_W) - ROW_W) < 1e-9, (
    'the strips do not add up to the sourced right-of-way width. '
    '[INGAA-F9902] NPS 18-24: 3 + 14 + 3 + 19 + 8 + 11 + 34 + 3 = 95 ft.')


# ── the offsets those strips imply, w = 0 on the ROW centreline ──────────────
# DERIVED by walking the strips in order from the spoil-side edge.  Nothing here
# is a second table: change a strip above and every offset follows.
_e = -ROW_W * 0.5                                    # spoil-side edge of the ROW
W_EDGE_SPOIL = _e
_e += BUFFER_W
W_TOPSOIL = _e + TOPSOIL_STRIP * 0.5;   _e += TOPSOIL_STRIP + BUFFER_W
W_SPOIL = _e + SPOIL_STRIP * 0.5;       _e += SPOIL_STRIP
W_DITCH = _e + DITCH_STRIP * 0.5;       _e += DITCH_STRIP
W_STRING = _e + MAKEUP_STRIP * 0.5;     _e += MAKEUP_STRIP
W_EQUIP = _e + EQUIP_STRIP * 0.5
W_EDGE_WORK = ROW_W * 0.5
# The travel lane is the OUTERMOST lane of the equipment area — [INGAA-PRIMER]
# Table A1 lists, in order across: working lane, worker access, TRAVEL LANE,
# offset from adjacent property.  So the mat run goes in the outer half.
W_MATS = W_EQUIP + EQUIP_STRIP * 0.25


# ═════════════════════════════════════════════════════════════════════════════
# COMPOSITION — EVERY NUMBER BELOW IS AN ARTISTIC CHOICE AND IS LABELLED AS ONE
#
# None of these is a claim about how alignments are set out.  They decide where
# the line goes IN THE PICTURE, and they are solved against the measured frame
# above rather than picked by eye, because the frame is only 0.80 x d wide and
# anything positioned by eye in Blender's world axes lands outside it — the
# mistake `quarry_bench.py` records making with an entire conveyor.
# ═════════════════════════════════════════════════════════════════════════════

# THE BEARING OF THE ALIGNMENT relative to the view axis.  A corridor running
# EXACTLY down the view axis puts its vanishing point behind the mast; one
# crossing the frame leaves both ends off-screen, because at 40 m the frame is
# 32 m wide and a corridor is longer than that.  So it is turned by a small
# angle: a straight alignment's vanishing point sits at NDC x = tan(TURN)/0.4023,
# so -9 deg puts it at -0.39 — clear of the mast (at -0.10) and inboard of the
# -0.85 that `quarry_bench.py` keeps its geometry within.  See THE EDGE ARTEFACT
# at the foot of that file: geometry reaching the outer ~6 % of the band's width
# comes back as vertical coloured speckle in every capture it has, cause
# unverified, mitigation only.
TURN = -9.0 * D2R                  # NOT SOURCED — composition

# The machine is ON THE LINE, so the collar sits on the ditch centreline.  That
# is not a composition choice; it is the reason a drilling rig is on a corridor
# at all.  What IS a composition choice is which way the spoil side faces, and
# it faces screen-LEFT: the two windrows are low dark earth, and the left edge of
# the ROW is the side that crosses the outer 6 % of the band where the speckle
# artefact lives.  A run of thin high-contrast stakes is the worst possible
# object to put there, so the stakes are on the right.
W_COLLAR = W_DITCH

# HOW FAR THE MODELLED CORRIDOR RUNS.  `terrain.js` CFG.groundSize is 150, so
# the ground plane ends at r = 75 m and the far-field skirt rings start at 72;
# past that a corridor would run off the world.  The near end is cut where it
# passes the camera — the eye is 13.75 m in front of the collar, so anything at
# s < -13 is behind it.
S_NEAR = -12.0                     # NOT SOURCED — composition (camera limit)
S_FAR = 58.0                       # NOT SOURCED — composition (ground-plane limit)

# THE BREAK IN THE LINE.  The ditch, its spoil and the string all stop short of
# the working position, and the machine stands in the gap.  Set from the
# keep-clear below plus the lateral offset of each, not written down twice.
CLEAR_R = 7.0                      # NOT SOURCED — composition/keep-clear.
                                   # `terrain.js` owns the collar, its live
                                   # spoil ring, this archetype's `pad: 9.5`
                                   # decal and the section seam.  Same value as
                                   # `urban_plot.py`'s reserve.
GAP_MARGIN = 1.6                   # NOT SOURCED — how far outside CLEAR_R the
                                   # broken lines restart

# Where the furniture goes ALONG the line.  All composition.
ACCESS_S = 31.0                    # the temporary access track joins here
ACCESS_RUN = 15.0                  # how far out of frame it runs
CROSSING_S = 51.0                  # where the corridor crosses an existing track
COMPOUND_S, COMPOUND_W = 43.0, 20.0     # "along the length, not on the work"
                                        # (research/16 §A.2), off the ROW
MAT_STACK_S, MAT_STACK_W = 24.0, 5.85   # inside the equipment strip but
LAYDOWN_S, LAYDOWN_W = 40.0, 5.20       # INBOARD of the mat run, which
                                        # occupies w 8.53 to 13.41

# NOT SOURCED, and every one of them is a small object whose own dimensions no
# fetched document gave.  The research note lists exactly what was searched for.
# ASTRA §1.1: an admitted gap beats a plausible number.
STAKE_H = 1.05                     # NOT SOURCED — ROW limit stake
STAKE_D = 0.045                    # NOT SOURCED
ROW_STAKE_PITCH = 9.0              # NOT SOURCED — [F] gives 200 ft for the
                                   # CENTRELINE only; ROW limit stakes are a
                                   # different thing and no source gave a pitch
SKID_L, SKID_W, SKID_H = 1.40, 0.26, 0.30   # NOT SOURCED — wooden pipe skid.
                                            # [INGAA-PRIMER] sources that they
                                            # are wooden skids and that string +
                                            # skids is 10-12 ft wide; it gives
                                            # no skid size and no spacing.
SKIDS_PER_JOINT = 2                         # NOT SOURCED
JOINT_GAP = 0.55                            # NOT SOURCED — the gap between
                                            # strung joints. Explicitly recorded
                                            # as NOT SOURCED in the research.
JOINT_SKEW = 1.6 * D2R             # NOT SOURCED as an ANGLE. The PRACTICE is
                                   # sourced — [INGAA-PRIMER]: "The pipe joints
                                   # are strung at a slight angle relative to
                                   # the ditch for handling purposes during
                                   # assembly" — but no source quantifies it.
CABIN_BASE = 0.18                  # NOT SOURCED — footing height. p11 §4.3 of
                                   # the cabin source requires "at least six
                                   # support points"; six are built.
TANK_R, TANK_L = 0.95, 3.40        # NOT SOURCED — static water/fuel tank
EDGE_LIP_H = TOPSOIL_D             # DERIVED: the ground OUTSIDE the stripped
                                   # width still has its topsoil on, so it
                                   # stands one stripping depth proud of the
                                   # corridor.  That step IS the cut, and it is
                                   # the sourced 12 in (0.305 m).


def cor(s, w):
    """(s along the alignment, w across it) -> Blender (x, y).

    The whole site is placed in these two numbers, because that is how a
    corridor is actually set out — chainage and offset from the centreline — and
    because it is the only way a cross-section stays a cross-section instead of
    decaying into a list of world coordinates that drift apart.
    """
    d = COLLAR_D + s * math.cos(TURN) - (w - W_COLLAR) * math.sin(TURN)
    a = COLLAR_A + s * math.sin(TURN) + (w - W_COLLAR) * math.cos(TURN)
    return on_axis(d, a)


def cor_frame(s, w):
    """The same point as (dist, across) in FRAME coordinates."""
    return (COLLAR_D + s * math.cos(TURN) - (w - W_COLLAR) * math.sin(TURN),
            COLLAR_A + s * math.sin(TURN) + (w - W_COLLAR) * math.cos(TURN))


def gap_s(w):
    """The chainage at which a line offset `w` clears the collar reserve.

    Derived from CLEAR_R and the offset, so a windrow's break is never a number
    written down beside the number it has to agree with."""
    lat = abs(w - W_COLLAR)
    inside = (CLEAR_R + GAP_MARGIN) ** 2 - lat * lat
    return math.sqrt(inside) if inside > 0 else 0.0


# THE COLLAR IN FRAME COORDINATES.  Derived, not assumed: the site origin IS the
# collar (site.py AXES), so this is only the origin projected onto the view axis.
COLLAR_D = -EYE[0] * AXIS[0] - EYE[1] * AXIS[1]      # 13.751 m
COLLAR_A = -EYE[0] * RIGHT[0] - EYE[1] * RIGHT[1]    # +1.147 m

# The yaw that lines a box up with the alignment, DERIVED from the two frame axes
# rather than written down, so it can never drift away from `cor()`.
YAW = math.atan2(AXIS[1] * math.cos(TURN) + RIGHT[1] * math.sin(TURN),
                 AXIS[0] * math.cos(TURN) + RIGHT[0] * math.sin(TURN))


# ═════════════════════════════════════════════════════════════════════════════
# SURFACES — FOUR MATERIALS, SEPARATED BY VERTEX COLOUR
#
# `src/world/terrain.js` `bindSiteMaterials()` asks each mesh whether it carries
# a COLOR_0 attribute and, if it does, binds the live `assets.js` material with
# `vertexColors: true` over a white base — the same trick its own merged prop
# pool uses.  So authored colour is FREE: it buys variety inside ONE material
# instead of buying it with a draw call.
#
# `urban_plot.py` found the trap and it is repeated here because it is silent:
# Blender 5.2 treats `use_nodes` as always-on, so testing that flag proves
# nothing, and that file's first real export collapsed COLOR_0 to white while
# the attributes were plainly there in Blender.  Test for the ACTUAL consumer —
# our own named ShaderNodeVertexColor — and never for the legacy flag.
# ═════════════════════════════════════════════════════════════════════════════
DIRT = 'dirt'                  # topsoil windrow, ditch spoil, edge lips
STONE = 'gravel'               # stone access, aprons, bedding
PAINT = 'paintedSteel'         # string, stakes, markers, cones, cabin, tank
WOOD = 'timber'                # mat run, mat stack, skids, centreline stake
MATERIAL_BUDGET = 4

# NOT SOURCED — a deliberately muted, weather-grey palette.  Art choices, and
# none of them a claim about any real product's colour.
C_TOPSOIL, C_TOPSOIL2 = 0x4A3E2C, 0x574936
C_SUBSOIL, C_SUBSOIL2 = 0x8B7D64, 0x796B54
C_LIP, C_LIP2 = 0x4E4B33, 0x59543A
C_STONE, C_STONE2 = 0x9A968B, 0x8B8880
C_MAT, C_MAT2 = 0x6E5B41, 0x7C6A4C
C_SKID = 0x5A4B37
C_COAT, C_COAT2 = 0x2B2B2E, 0x33403A
C_CABIN, C_TRIM = 0xC9CBC4, 0x3E5A66
C_DARK = 0x33383C
C_STEEL = 0x9AA0A4
C_CONE, C_CONE_BAND = 0xD9541F, 0xE8E4DC
C_MARKER = 0xC8A21C            # the "sharply contrasting color" 192.707 asks for


def colour(o, rgb):
    """Give `o` a flat linear vertex colour and make sure its material consumes
    it.  EVERY mesh in this file is coloured, with no exception: `finish()`
    joins by material, and a group where some meshes carry COLOR_0 and some do
    not joins into a mesh whose uncoloured half is whatever Blender fills in."""
    c = tuple(((rgb >> shift) & 255) / 255 for shift in (16, 8, 0)) + (1.0,)
    attr = o.data.color_attributes.new(name='Color', type='BYTE_COLOR', domain='CORNER')
    for item in attr.data:
        item.color_srgb = c
    o.data.color_attributes.active_color = attr
    m = o.data.materials[0]
    if not m.node_tree or not m.node_tree.nodes.get('corridor-vertex-colour'):
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        vc = m.node_tree.nodes.new('ShaderNodeVertexColor')
        vc.name = 'corridor-vertex-colour'
        vc.layer_name = 'Color'
        m.node_tree.links.new(vc.outputs['Color'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.90 if m.name in (DIRT, STONE) else 0.74
        # THE RULE, PINNED AT THE ONE PLACE THIS FILE TOUCHES A MATERIAL.
        bsdf.inputs['Transmission Weight'].default_value = 0.0
    return o


def cbox(name, size, s, w, z, kind, tint, bevel=0.0, turn=0.0):
    """A box in corridor coordinates.  `size` is (along, across, up)."""
    x, y = cor(s, w)
    return colour(S.box(name, size, kind, loc=(x, y, z), rot=(0, 0, YAW + turn),
                        bevel=bevel), tint)


def cpost(name, radius, height, s, w, z, kind, tint, sides=6):
    """A vertical post.  `tube()` stands on its base, so `z` is the foot."""
    x, y = cor(s, w)
    return colour(S.tube(name, radius, height, kind, loc=(x, y, z), sides=sides), tint)


def cpipe(name, radius, length, s, w, z, kind, tint, sides=12, turn=0.0):
    """A cylinder lying ALONG the alignment, CENTRED on (s, w).

    `tube()` builds along +Z from its base, so the rotation puts +Z along the
    alignment and the base is then walked back half a length.  Doing that here,
    once, is the difference between a joint that sits on its skids and a joint
    that starts on them and ends a length away — the mistake `quarry_bench.py`
    made with its conveyor drums."""
    x, y = cor(s, w)
    yaw = YAW + turn
    return colour(S.tube(name, radius, length, kind,
                         loc=(x - math.cos(yaw) * length * 0.5,
                              y - math.sin(yaw) * length * 0.5, z),
                         rot=(0.0, math.pi * 0.5, yaw), sides=sides), tint)


def crubble(name, s, w, z, size, kind, tints, block, seed, n=None):
    """`site.rubble()` laid along the alignment, then coloured.

    `size` is (along, across, up), and `block` is the characteristic clod size:
    a property of the material, never of how big an area is being covered.

    USE THIS FOR A MASS, NOT FOR A LINE.  `rubble()` fills a roughly cubic
    envelope with overlapping blocks and that is exactly right for a heap of
    stone or a muckpile.  It is NOT right for a windrow, and this file learned
    that from its own first render rather than from the theory — see
    `windrow()`, which is what the two spoil ridges, the ditch lips and the cut
    banks are built from.  The one caller left here is the bedding-stone heap,
    which really is a heap.
    """
    x, y = cor(s, w)
    made = S.rubble(name, (x, y, z), size, kind, block=block, n=n, seed=seed, yaw=YAW)
    for i, o in enumerate(made):
        colour(o, tints[i % len(tints)])
    return made


def windrow(name, w, base, height, foot, mat, tints, seed,
            s_from=None, s_to=None, broken=True, drift=0.16, clods=False):
    """A CONTINUOUS RIDGE with a broken crest — and NOT `rubble()` on its own.

    THE FIRST RENDER OF THIS FILE PROVED THAT `rubble()` ALONE CANNOT MAKE A
    WINDROW.  Thirteen of its blocks scattered through a 6.1 x 4.3 x 2.1 m
    envelope came back as loose boxes lying on a plain with bare ground showing
    between them — the exact "wall of smooth pale cardboard cartons with ruled
    edges" failure that `rubble()`'s own docstring exists to prevent,
    reproduced by using the prevention on the wrong shape.

    `rubble()` is right for a MASS — a muckpile, a stockpile, a stone apron —
    because its blocks fill a roughly cubic envelope.  A windrow is not a mass,
    it is a LINE, and a line has to be CONTINUOUS before it is worth making
    ragged.  So the mass is authored here: heavily overlapping blocks ELONGATED
    ALONG the alignment at a pitch far shorter than their own length, in two
    passes — a wide low toe and a narrower tall crest.  That is both what a
    dozer-built windrow's section actually is and what breaks the silhouette at
    two different scales instead of one.

    `height` may be a number or a function of chainage.  Cost is boxes in one
    material, so after `finish()`'s join the whole ridge is inside a single draw
    call and costs only triangles: about 1,100 triangles buys 70 m of ridge,
    which is what the scattered version cost while saying nothing.
    """
    hf = height if callable(height) else (lambda _s: height)
    #        pitch  len   width fraction   height fraction   across drift
    passes = [(1.15, 2.10, (0.88, 1.06), (0.42, 0.60), 0.0),      # the toe
              (0.85, 1.60, (0.30, 0.56), (0.84, 1.04), drift)]    # the crest
    if clods:
        # The smallest scale, and the one that decides whether this reads as
        # SOIL or as freight.  The second render of this file had the ridge
        # continuous and still wrong: two passes of 2.5-3.4 m blocks put three
        # flat-topped boxes across the near field and they read as shipping
        # containers.  A heap of spoil is broken at every scale it is seen at,
        # so there is a third pass at half a metre.
        passes.append((0.55, 0.90, (0.10, 0.24), (0.92, 1.12), drift * 1.9))
    for pas, (pitch, lenk, wk, hk, off) in enumerate(passes):
        # half the longest block this pass can make, plus a little
        pad = lenk * 0.68 + 0.25
        for i, sm, seg in runs(w, pitch, s_from, s_to, broken, pad):
            r1 = S.rnd(i * 1.7 + seed + pas * 91.0, seed * 0.37)
            r2 = S.rnd(i * 2.9 + seed + pas * 91.0, seed * 0.71)
            r3 = S.rnd(i * 4.1 + seed + pas * 91.0, seed * 1.13)
            h = hf(sm)
            bl = lenk * (0.80 + r1 * 0.55)
            bw = base * (wk[0] + r2 * (wk[1] - wk[0]))
            # HEIGHT IS MEASURED FROM GRADE, NOT FROM THE BURIED BASE, and this
            # is the bug the second render found.  Written as
            # `bh = (h + foot) * hk` a block's top lands at `-foot + (h+foot)*hk`
            # — which for the cut lip near the working area, where h is the
            # sourced 0.305 m and `foot` is the 1.8 m burial, is MINUS 0.77 m.
            # The whole near half of both cut banks was under the ground, and
            # nothing said so: the export was valid, the budget was met and the
            # object was simply not there.
            bh = foot + h * (hk[0] + r3 * (hk[1] - hk[0]))
            cbox('%s-%d-%d' % (name, pas, i), (bl, bw, bh),
                 sm, w + (r2 - 0.5) * base * off, -foot + bh * 0.5, mat,
                 tints[(i + pas) % len(tints)], turn=(r3 - 0.5) * 0.09)


def stone_track(name, s, w_from, w_to, half_at, seed, thick=0.24, steps=10):
    """A CRUSHED-STONE TRACK RUNNING ACROSS the alignment.

    Same lesson as `windrow()`, turned ninety degrees: the first render drew the
    access as `rubble()` heaps and it read as a scatter of pale chips rather
    than as something you could drive a wagon onto.  A haul track is BUILT UP —
    stone laid and rolled — so it is authored as a continuous raised surface
    with a broken edge, not as loose stone lying about.

    `half_at(t)` gives the half-length ALONG the alignment at fraction `t` of
    the way out, which is how the bellmouth splays.
    """
    step = (w_to - w_from) / steps
    for i in range(steps):
        t = (i + 0.5) / steps
        w = w_from + (i + 0.5) * step
        half = half_at(t)
        cbox('%s-%d' % (name, i), (half * 2.0, abs(step) * 1.12, thick),
             s, w, thick * 0.42, STONE, C_STONE if (i % 2) else C_STONE2)
        # the broken edge, both sides, so the track does not end on a ruled line
        for k in (-1, 1):
            r = S.rnd(i * 3.1 + seed, k * 7.7 + seed)
            cbox('%s-%d-edge%d' % (name, i, k),
                 (abs(step) * 0.9, abs(step) * 0.85, thick * (0.55 + r * 0.5)),
                 s + k * half, w, thick * 0.30, STONE,
                 C_STONE2 if (i % 2) else C_STONE, turn=(r - 0.5) * 0.5)
        # Loose stone lying on the running surface.  Without it the alternating
        # slabs read as DECKING in plan — the second render of this file showed
        # exactly that, a run of pale boards — because a rolled stone track has
        # no joints and a row of abutting boxes has nothing else to show.
        for k in range(3):
            r = S.rnd(i * 5.3 + seed, k * 2.9 + seed)
            q = S.rnd(k * 7.0 + seed, i * 1.9 + seed)
            cbox('%s-%d-chip%d' % (name, i, k),
                 (0.45 + r * 0.55, 0.40 + q * 0.45, thick * (0.45 + r * 0.4)),
                 s + (r - 0.5) * half * 1.5, w + (q - 0.5) * abs(step) * 0.7,
                 thick * 0.95, STONE, C_STONE2 if k else C_STONE,
                 turn=(q - 0.5) * 1.3)


def runs(w, seg, s_from=None, s_to=None, broken=True, pad=0.0):
    """Yield (index, mid-chainage, length) for a line of offset `w`, broken
    around the working position if `broken`.

    One generator for every longitudinal object on the site, so a windrow, a lip
    and a stake line cannot end up breaking in different places.

    `pad` widens the break by HALF THE LENGTH OF THE THING BEING PLACED, and it
    is not optional for anything that places a long block at a chainage.  The
    break returned by `gap_s()` is where the CENTRE of an object first clears
    the collar reserve; a 4.6 m block centred exactly there still reaches 2.3 m
    back into it.  That is not theory — the first build after `windrow()` landed
    raised `corridor furniture inside the 7.0 m collar reserve: ditchspoil-0-1
    at (4.18, -4.84)`, r = 6.40 m.  The vertex assertion in `build()` caught it
    because it measures VERTICES and not the placements, which is exactly why it
    measures vertices."""
    s_from = S_NEAR if s_from is None else s_from
    s_to = S_FAR if s_to is None else s_to
    g = (gap_s(w) + pad) if broken else 0.0
    i = 0
    for lo, hi in ((s_from, -g), (g, s_to)):
        if hi - lo < seg * 0.5:
            continue
        n = max(1, int(round((hi - lo) / seg)))
        step = (hi - lo) / n
        for k in range(n):
            yield i, lo + (k + 0.5) * step, step
            i += 1


# ═════════════════════════════════════════════════════════════════════════════
# THE CUT — the edge of the stripped width, and why it is 0.305 m
#
# This is the object the archetype is named for, and it is the one `terrain.js`
# cannot draw: its own note says "cleared on the line, untouched a few metres
# either side of it — that contrast IS the archetype", but its dressing is
# scattered on a RADIUS (`scatter()` samples an annulus and rejects only a wedge
# in front of the mast), so the region's trees and scrub currently stand INSIDE
# the alignment.  See THE CORRIDOR IS NOT CORRIDOR-AWARE in the research note.
#
# The step is not invented.  The working width is stripped of its topsoil to the
# sourced 12 in; the ground either side of it is not.  So the untouched ground
# stands exactly one stripping depth proud of the corridor, and THAT LINE IS THE
# CUT.  It is a small step — 0.305 m reads as about 13 px at 45 m in a 744 px
# band — but there are two of them, they are parallel, and they converge.
#
# Sunk deep.  `terrain.js` flattens only to `CFG.padRadius` 8.5 m unless the
# archetype declares `flatR`, and this one does not declare one today; the
# request to add it is in the research note.  Until it lands, every ground form
# here starts well below z = 0 so natural relief under it cannot leave it
# hovering — a hovering object is the failure `quarry_bench.py` had with its
# conveyor trestles and it is invisible in the Blender viewport.
# ═════════════════════════════════════════════════════════════════════════════
SINK = 1.8                         # NOT SOURCED — how far below grade ground
                                   # forms are buried so relief cannot expose them


# How high the un-stripped ground stands beside the corridor, by chainage.
#
# At the working position it is EXACTLY the sourced stripping depth, 0.305 m —
# the corridor is at grade there and the step is only the topsoil that was taken
# off it.  Further along it grows, because the alignment is running into rising
# ground: that is the "cutting on one side" the archetype's own `renders` string
# asks for, and it is the difference between a corridor and a flat strip.
#
# THE TWO FAR-END HEIGHTS ARE NOT SOURCED AND CANNOT BE — a cut is as deep as
# whatever the line happens to cross.  They are SOLVED AGAINST THE MEASURED
# FRAME instead of invented, exactly as `quarry_bench.py` solves its FACE_H:
#
#     at s = 58 the spoil-side limit is 69.0 m out, where the frame runs
#     -9.05 .. +16.50 m and the measured horizon is at NDC y -0.12.
#     ndc_y(69.0, 2.60) = -0.088   -> the crest just BREAKS the skyline
#     at s = 58 the working-side limit is 73.5 m out.
#     ndc_y(73.5, 1.45) = -0.176   -> it stays just under it
#
# One side breaking the horizon and the other not is what makes the pair read as
# "a cutting on one side, open country on the other" rather than as a symmetric
# ditch.  DO NOT quote either number back as a corridor fact: they are camera
# solutions, and only the 0.305 m near-field step is sourced.
CUT_H_FAR = (2.60, 1.45)           # NOT SOURCED — spoil side, working side
CUT_FLAT_S = 12.0                  # NOT SOURCED — at grade this far along


def cut_height(s):
    """The height of the un-stripped ground beside the corridor at chainage `s`."""
    t = max(0.0, min(1.0, (abs(s) - CUT_FLAT_S) / (S_FAR - CUT_FLAT_S)))
    t = t * t * (3.0 - 2.0 * t)                      # smoothstep
    return t


def build_edges():
    """The un-stripped ground standing proud along both limits of the width.

    A `windrow()` and not `rubble()`: this is a LINE, and the pair of them
    running to one vanishing point IS the cut.  Broken where the access and the
    existing track come in — a bank that ran unbroken across its own access
    would be the giveaway that nothing on this site was thought about together.
    """
    for side, w_edge in ((0, W_EDGE_SPOIL), (1, W_EDGE_WORK)):
        sign = 1 if side else -1
        far = CUT_H_FAR[side]
        band = 8.0
        k, sm0 = 0, S_NEAR
        while sm0 < S_FAR:
            sm1 = min(S_FAR, sm0 + band)
            mid = (sm0 + sm1) * 0.5
            skip = (abs(mid - CROSSING_S) < 5.0
                    or (side == 1 and abs(mid - ACCESS_S) < 5.5))
            if not skip:
                h = EDGE_LIP_H + (far - EDGE_LIP_H) * cut_height(mid)
                # The batter lies back as the cut deepens, so the bank's
                # footprint grows with its height instead of standing as a wall.
                # 1.5 H : 1 V is the flattest slope 29 CFR 1926.652(b)(1) names
                # -- "one and one-half horizontal to one vertical (34 degrees
                # measured from the horizontal)" -- and it is used here as a
                # floor on how steep this may LOOK, not as a claim that a cut
                # face is battered to an excavation-safety rule.
                width = 2.30 + 1.5 * (h - EDGE_LIP_H)
                w = w_edge + (width * 0.5 - 0.35) * sign
                windrow('cut-lip-%d-%d' % (side, k), w, width, h, SINK, DIRT,
                        (C_LIP, C_LIP2, C_TOPSOIL),
                        101.0 + k * 3.7 + side * 617.0,
                        s_from=sm0, s_to=sm1, broken=False)
            sm0 += band
            k += 1


# ═════════════════════════════════════════════════════════════════════════════
# THE TWO SPOIL STORES — and why there are two of them
#
# This is the single most identifying thing on a working alignment, and it is
# the part a layman gets wrong: the spoil is not one heap.  Topsoil is stripped
# first and stored in its OWN windrow, separately from the subsoil that comes
# out of the ditch, so that the two go back in the right order — and the two
# windrows are separated by a stated buffer.  [INGAA-F9902], verbatim:
#
#     "the ditch spoil is stockpiled no closer than two feet to the ditchline,
#      where it is segregated from the topsoil by a three foot buffer zone."
#
# So the corridor carries TWO parallel ridges of different width, colour and
# grain running the length of the frame, and they are most of why it reads as
# worked ground rather than as a track.
#
# THE HEIGHTS ARE DERIVED, NOT CHOSEN.  Each windrow has to hold the volume that
# came out of the ground beside it, swelled by the sourced 30 %, inside its own
# sourced base width.  The resulting side slope is then CHECKED against the
# sourced angles of repose — it is not set from them.  If a future edit puts a
# windrow outside its material's repose band, or over the sourced 4 m stockpile
# limit, the build fails rather than shipping a heap that could not stand up.
# ═════════════════════════════════════════════════════════════════════════════

def _ridge(area, base):
    """Height and side-slope of a triangular ridge of section `area` on `base`."""
    h = 2.0 * area / base
    return h, math.degrees(math.atan2(2.0 * h, base))


# The topsoil taken off the stripped width.  [INGAA-F9902] states which width
# is stripped: "the removal of 12 inches of topsoil from the ditch line and
# ditch spoil area" — so the ditch strip, its buffer and the spoil strip.
STRIPPED_W = DITCH_STRIP + BUFFER_W + SPOIL_STRIP          # 9.143 m  [I]
TOPSOIL_AREA = STRIPPED_W * TOPSOIL_D * SWELL              # m^2 per m of ROW
TOPSOIL_H, TOPSOIL_SLOPE = _ridge(TOPSOIL_AREA, TOPSOIL_STRIP)

# The subsoil out of the ditch.  A trapezoid: the sourced 8 ft at the surface,
# COVER + PIPE_OD deep, battered at the ratio derived from [INGAA-PRIMER] A3.
TRENCH_D = COVER + PIPE_OD                                  # 1.524 m  [I]
TRENCH_BOT = max(0.4, DITCH_STRIP - 2.0 * TRENCH_BATTER * TRENCH_D)
SPOIL_AREA = (DITCH_STRIP + TRENCH_BOT) * 0.5 * TRENCH_D * SWELL
SPOIL_H, SPOIL_SLOPE = _ridge(SPOIL_AREA, SPOIL_STRIP)

assert REPOSE_TOPSOIL[0] <= TOPSOIL_SLOPE <= REPOSE_TOPSOIL[1], (
    'the derived topsoil windrow stands at %.1f deg, outside the sourced %s deg '
    'repose band for loose topsoil ([SLP-SMP] Table 3.2). A heap that steep '
    'would not stand up; fix the width or the stripping depth, do not widen the '
    'band.' % (TOPSOIL_SLOPE, REPOSE_TOPSOIL))
assert REPOSE_SUBSOIL[0] <= SPOIL_SLOPE <= REPOSE_SUBSOIL[1], (
    'the derived ditch-spoil windrow stands at %.1f deg, outside the sourced %s '
    'deg band for loose clay/silt to sandy gravel ([SLP-SMP] Table 3.2).'
    % (SPOIL_SLOPE, REPOSE_SUBSOIL))
assert max(TOPSOIL_H, SPOIL_H) <= STOCKPILE_MAX_H, (
    'a windrow exceeds the sourced 4 m stockpile height limit ([SLP-SMP]).')


def build_windrows():
    """The topsoil windrow and the ditch-spoil windrow.

    The topsoil windrow runs UNBROKEN the whole length — stripping happens over
    the whole width before anything else does, so it is the one line on the site
    that never stops, and it is the line the eye follows to the horizon.  The
    ditch spoil breaks around the working position, because the ditch does: this
    is a crossing, and the machine stands in the break.  Neither break is
    written down — `runs()` derives it from the offset and the collar reserve.
    """
    # The envelope runs from `-foot` (buried, so relief cannot expose the base)
    # to exactly the DERIVED height, so the crest of the heap IS the height the
    # volume calculation produced.  Getting this centre wrong is silent: the
    # first build put the envelope's MIDDLE at 0.42 of the height and the
    # windrow came out at 1.36 m against a derived 1.70 m, which would have made
    # every word of §4 of the research note untrue of the model that shipped.
    windrow('topsoil', W_TOPSOIL, TOPSOIL_STRIP, TOPSOIL_H, 0.40, DIRT,
            (C_TOPSOIL, C_TOPSOIL2), 401.0, clods=True)
    windrow('ditchspoil', W_SPOIL, SPOIL_STRIP, SPOIL_H, 0.35, DIRT,
            (C_SUBSOIL, C_SUBSOIL2), 733.0, clods=True)


def build_ditchline():
    """The ditch itself — drawn as its two lips and nothing else.

    NO HOLE IS MODELLED, and that is deliberate twice over: `terrain.js` owns an
    OPAQUE ground mesh, so anything below z = 0 is geometry nobody can see, and
    an open trench with a pipe in it would badge this archetype's twenty methods
    as open-cut pipe laying.  What survives is what a driller would actually
    read: two close parallel lines of loosened ground at the sourced 8 ft
    spacing, running to the vanishing point, stopping at the crossing.
    """
    for k, w in ((0, W_DITCH - DITCH_STRIP * 0.5), (1, W_DITCH + DITCH_STRIP * 0.5)):
        windrow('ditch-lip-%d' % k, w, 1.00, 0.40, 0.30, DIRT,
                (C_SUBSOIL2, C_LIP), 1601.0 + k * 77.0, drift=0.10)


# ═════════════════════════════════════════════════════════════════════════════
# THE TRAVEL LANE — timber mats
#
# The second unmistakable corridor object.  Plant does not drive on the stripped
# subgrade of a working width; it drives on a temporary running surface, and on
# soft ground that surface is a run of timber mats laid ACROSS the direction of
# travel.  A mat run reads as a ladder lying on the ground and it is one of the
# very few objects that says "temporary works on a linear job" on sight.
#
# It goes in the OUTER half of the equipment strip because that is where
# [INGAA-PRIMER] Table A1 puts the travel lane: working lane, worker access,
# TRAVEL LANE, offset from adjacent property, reading outward.
# ═════════════════════════════════════════════════════════════════════════════

def build_matrun():
    pitch = MAT_W + 0.05                       # NOT SOURCED — the butt gap
    n = int((S_FAR - 4.0 - S_NEAR) / pitch)
    for i in range(n):
        sm = S_NEAR + (i + 0.5) * pitch
        # The two stone tracks cross the lane at grade, so the mat run stops
        # and the stone takes over.  A mat run that ran straight through its
        # own access would say nothing on this site was thought about together.
        if abs(sm - ACCESS_S) < 5.2 or abs(sm - CROSSING_S) < 4.4:
            continue
        skew = S.jitter(0.016, i, 7.0)         # NOT SOURCED — laid by machine
        cbox('mat-%d' % i, (MAT_W, MAT_L, MAT_T), sm, W_MATS,
             MAT_T * 0.5 - 0.06, WOOD, C_MAT if (i % 2) else C_MAT2,
             bevel=0.012, turn=skew)
        # Plank relief on the near half only.  Beyond about 30 m a 45 mm gap is
        # under a pixel wide and costs triangles to render as noise — the same
        # sub-pixel rule the module docstring applies to bright steel.
        if sm < 18.0:
            for k in range(3):
                cbox('mat-%d-rib-%d' % (i, k), (0.045, MAT_L - 0.12, 0.030),
                     sm + (k - 1) * MAT_W * 0.30, W_MATS, MAT_T - 0.075,
                     WOOD, C_SKID, turn=skew)


# ═════════════════════════════════════════════════════════════════════════════
# THE STRUNG PIPE — laid out along the line, on skids, NOT connected to the rig
#
# Stringing is the operation that makes a corridor look like a corridor from the
# air: the joints are hauled out and set down end to end along the make-up strip
# so the welding crew can walk the line.  They sit on wooden skids clear of the
# ground, and they are set down at a slight skew to the ditch.  [INGAA-PRIMER],
# verbatim on both points:
#
#     "The welded pipe string and its temporary wooden skid pipe supports
#      typically are ten to twelve feet wide."
#     "The pipe joints are strung at a slight angle relative to the ditch for
#      handling purposes during assembly."
#
# The skew is therefore SOURCED AS A PRACTICE and NOT SOURCED AS AN ANGLE, which
# is exactly how it is treated: JOINT_SKEW carries the admission.
#
# The near half is strung joint by joint with a gap; the far half is welded up
# into a continuous string.  That progression along the line is the corridor's
# own tense — the work moves along the strip — and it costs nothing to draw.
# ═════════════════════════════════════════════════════════════════════════════

def build_string():
    s = gap_s(W_STRING)
    i = 0
    while s + JOINT_L < S_FAR - 2.0:
        welded = s > 34.0                       # NOT SOURCED — composition
        gap = 0.0 if welded else JOINT_GAP
        skew = 0.0 if welded else JOINT_SKEW * (1 if (i % 2) else -1)
        cpipe('string-%d' % i, PIPE_OD * 0.5, JOINT_L + (0.02 if welded else 0.0),
              s + JOINT_L * 0.5, W_STRING, PIPE_OD * 0.5 + SKID_H, PAINT,
              C_COAT if (i % 3) else C_COAT2, sides=12, turn=skew)
        for q in range(SKIDS_PER_JOINT):
            f = (q + 0.5) / SKIDS_PER_JOINT
            cbox('skid-%d-%d' % (i, q), (SKID_L, SKID_W, SKID_H),
                 s + JOINT_L * f, W_STRING, SKID_H * 0.5, WOOD, C_SKID,
                 bevel=0.01, turn=math.pi * 0.5)
        s += JOINT_L + gap
        i += 1


# ═════════════════════════════════════════════════════════════════════════════
# THE LIMIT OF THE WIDTH, STAKED
#
# `terrain.js`'s own corridor note has this right and it is worth keeping: "the
# boundary is a running fence, not an enclosure".  A plot is hoarded all the way
# round; an alignment is marked down both sides and OPEN AT BOTH ENDS, because
# the work leaves at both ends.  That difference is most of what separates this
# archetype from `urban-plot` on sight.
#
# It is STAKED, not fenced.  A rural construction right-of-way is set out with
# stakes and flagging at the limit; continuous fencing goes up at hazards and at
# stock boundaries, not for seventy metres of open country, and drawing it would
# be inventing an object.  The one sourced spacing belongs to the CENTRELINE and
# not to the limit — PennEast FEIS: "PennEast would stake the centerline in
# 200-foot intervals and at points of inflection" — so exactly one centreline
# stake falls inside this frame, and that is what is drawn.  The limit stakes
# get a NOT SOURCED pitch and say so.
#
# The stakes go on the WORKING side only.  The spoil-side limit crosses the
# outer 6 % of the band's width between about 35 and 45 m out, and a run of thin
# high-contrast verticals is the worst possible object to put in the one place
# `quarry_bench.py` has an unexplained speckle artefact.  Low dark earth goes
# there instead.
# ═════════════════════════════════════════════════════════════════════════════

def build_stakes():
    k, s = 0, S_NEAR
    while s < S_FAR:
        if abs(s) > 4.0:
            cpost('row-stake-%d' % k, STAKE_D * 0.5, STAKE_H, s,
                  W_EDGE_WORK - 0.25, -0.22, PAINT, C_STEEL, sides=5)
            cbox('row-flag-%d' % k, (0.10, 0.10, 0.24), s, W_EDGE_WORK - 0.25,
                 STAKE_H - 0.30, PAINT, C_CONE, turn=0.6)
        s += ROW_STAKE_PITCH
        k += 1
    # THE centreline stake, at the sourced 200 ft pitch.  One is what fits.
    cs = STAKE_PITCH - 20.0                     # NOT SOURCED — which chainage
    cpost('centreline-stake', 0.035, 1.20, cs, W_DITCH, -0.20, WOOD, C_SKID, sides=4)
    cbox('centreline-flag', (0.09, 0.09, 0.26), cs, W_DITCH, 0.95, PAINT, C_CONE, turn=0.5)


# ═════════════════════════════════════════════════════════════════════════════
# ACCESS, AT BOTH ENDS OF THE MODELLED LENGTH
#
# A working corridor is reached by a temporary access track off the nearest
# existing road, laid in crushed stone, and the junction is a splayed bellmouth
# wide enough to turn a wagon into.  [PCGP-POD]: "Signs ... will be placed where
# access roads intersect the construction right-of-way."
#
# The far end is the other kind of access: where the alignment CROSSES an
# existing track.  That is also the one place 49 CFR 192.707 requires a line
# marker — "at each crossing of a public road and railroad" — so the marker
# posts stand there and nowhere else on this site.
# ═════════════════════════════════════════════════════════════════════════════

def build_access():
    """The temporary access track, its bellmouth, and the cones on it."""
    def half_at(t):
        return 3.2 + (1.0 - t) * (1.0 - t) * 5.0      # NOT SOURCED -- the splay
    stone_track('access', ACCESS_S, W_EDGE_WORK - 2.0,
                W_EDGE_WORK + ACCESS_RUN, half_at, 2201.0, thick=0.26, steps=11)
    # the apron inside the limit, where the track meets the matted lane
    stone_track('access-apron', ACCESS_S, W_MATS + 3.0, W_MATS - 5.0,
                lambda t: 4.6, 2401.0, thick=0.28, steps=7)
    # Cones ALONG the track's near edge, which is where a coned lane sits.
    # [TSM8] Table A1.5: 450 mm cones up to 40 mph, "Cone spacing 1.5 m".
    # The FIRST render put these on a diagonal of their own out in the field,
    # attached to nothing -- corrected here after looking at it.
    k, w = 0, W_EDGE_WORK + 0.8
    while w < W_EDGE_WORK + ACCESS_RUN - 0.6:
        t = (w - (W_EDGE_WORK - 2.0)) / (ACCESS_RUN + 2.0)
        sc = ACCESS_S - half_at(t) - 0.55
        x, y = cor(sc, w)
        bpy.ops.mesh.primitive_cone_add(radius1=CONE_H * 0.48, radius2=0.030,
                                        depth=CONE_H, vertices=7)
        colour(S.part('cone-%d' % k, bpy.context.active_object, PAINT,
                      loc=(x, y, CONE_H * 0.5)), C_CONE)
        cbox('cone-foot-%d' % k, (CONE_H * 0.52, CONE_H * 0.52, 0.030),
             sc, w, 0.015, PAINT, C_DARK)
        # MUTCD 2009 6F.64 puts a 6 in (152 mm) white band 3-4 in below the tip.
        # At 450 mm and 45 m that band is the only part of a cone that reads.
        cbox('cone-band-%d' % k, (CONE_H * 0.26, CONE_H * 0.26, 0.152),
             sc, w, CONE_H * 0.70, PAINT, C_CONE_BAND)
        w += CONE_PITCH
        k += 1


def build_crossing():
    """Where the alignment crosses an existing track, at the far end."""
    stone_track('crossing', CROSSING_S, W_EDGE_SPOIL - 3.0,
                W_EDGE_WORK + 7.0, lambda t: 3.6, 2601.0, thick=0.26, steps=14)
    # 49 CFR 192.707: a line marker at each crossing of a public road and
    # railroad, on "a background of sharply contrasting color".  Height and post
    # diameter from API RP 1109 §5.5.3 and §5.2.  NO LETTERING — see NAMING.
    for k, w in enumerate((W_DITCH - 1.6, W_DITCH + 1.6)):
        cpost('marker-%d' % k, MARKER_D * 0.5, MARKER_H + 0.30,
              CROSSING_S + (2.6 if k else -2.6), w, -0.30, PAINT, C_MARKER, sides=8)
        cbox('marker-band-%d' % k, (0.075, 0.20, 0.26),
             CROSSING_S + (2.6 if k else -2.6), w, MARKER_H - 0.24, PAINT, C_DARK)


# ═════════════════════════════════════════════════════════════════════════════
# THE COMPOUND AND THE LAYDOWN
#
# research/16 §A.2: a corridor has "a compound somewhere along the length rather
# than on the work", because the operation moves and the compound does not.  So
# it sits OUTSIDE the working width, on separately taken ground, well down the
# line, where it reads as a different place that the corridor passes through.
# Nothing in it is connected to the machine.
# ═════════════════════════════════════════════════════════════════════════════

def build_compound():
    s, w = COMPOUND_S, COMPOUND_W
    cbox('cabin-shell', (CABIN_L - 0.10, CABIN_W - 0.10, CABIN_H - 0.16), s, w,
         CABIN_BASE + CABIN_H * 0.5, PAINT, C_CABIN, bevel=0.02)
    for h in (0.08, CABIN_H - 0.08):
        cbox('cabin-frame-%d' % int(h * 100), (CABIN_L, CABIN_W, 0.16), s, w,
             CABIN_BASE + h, PAINT, C_TRIM, bevel=0.02)
    for u in (-CABIN_L * 0.5 + 0.05, CABIN_L * 0.5 - 0.05):
        for v in (-CABIN_W * 0.5 + 0.05, CABIN_W * 0.5 - 0.05):
            cbox('cabin-corner-%.2f-%.2f' % (u, v), (0.10, 0.10, CABIN_H),
                 s + u, w + v, CABIN_BASE + CABIN_H * 0.5, PAINT, C_TRIM, bevel=0.01)
    # Openings are OPAQUE faces on the shared paint material.  No `glass`, no
    # `transmission`, no fifth material — see the module docstring.
    for u in (-1.6, 0.6):
        cbox('cabin-window-%.1f' % u, (WINDOW_W, 0.06, WINDOW_H), s + u,
             w - CABIN_W * 0.5 - 0.01, CABIN_BASE + SILL_H + WINDOW_H * 0.5,
             PAINT, C_DARK)
    cbox('cabin-door', (DOOR_W, 0.05, DOOR_H), s + 2.1, w - CABIN_W * 0.5 - 0.01,
         CABIN_BASE + DOOR_H * 0.5, PAINT, C_TRIM)
    # Six support points, meeting the ground rather than hovering (source p11).
    for v in (-CABIN_W * 0.5 + 0.12, CABIN_W * 0.5 - 0.12):
        for u in (-CABIN_L * 0.5 + 0.16, 0.0, CABIN_L * 0.5 - 0.16):
            cbox('cabin-foot-%.2f-%.2f' % (u, v), (0.44, 0.44, CABIN_BASE + 0.30),
                 s + u, w + v, CABIN_BASE * 0.5 - 0.15, WOOD, C_SKID, bevel=0.02)
    # A bunded static tank.  Every method that reaches this archetype needs
    # water or fuel and none of them is defined by it, which is exactly why this
    # is the one piece of plant here.  NOT SOURCED dimensions.
    cpipe('tank-drum', TANK_R, TANK_L, s - 7.0, w + 1.4, TANK_R + 0.45,
          PAINT, C_TRIM, sides=14)
    cbox('tank-bund', (5.0, 3.2, 0.45), s - 7.0, w + 1.4, 0.225, PAINT, C_DARK, bevel=0.02)
    for v in (-1.1, 1.1):
        cbox('tank-cradle-%.1f' % v, (0.5, 2.0, 0.45), s - 7.0 + v, w + 1.4,
             0.67, PAINT, C_DARK, bevel=0.02)


def build_laydown():
    """Mats and bedding stone waiting to be used, on the working side.

    Unconnected material, the same neutrality rule as `urban_plot.py`'s wrapped
    pallets: a mat run is extended and recovered as the work moves along, so
    there is always a stack, and it belongs to no method in particular."""
    for k in range(5):
        cbox('mat-stack-%d' % k, (MAT_L, MAT_W, MAT_T), MAT_STACK_S,
             MAT_STACK_W, MAT_T * (k + 0.5), WOOD,
             C_MAT if (k % 2) else C_MAT2, bevel=0.012,
             turn=math.pi * 0.5 + S.jitter(0.03, k, 3.0))
    # Two spare joints on bearers, waiting to be strung.  Unconnected
    # material, and the one thing that keeps the working side from reading as
    # an empty field between the string and the mat run.
    for k in range(2):
        wk = LAYDOWN_W + k * (PIPE_OD + 0.10)
        cpipe('laydown-joint-%d' % k, PIPE_OD * 0.5, JOINT_L,
              LAYDOWN_S, wk, PIPE_OD * 0.5 + SKID_H, PAINT,
              C_COAT2 if k else C_COAT, sides=10)
        for q in (0.22, 0.78):
            cbox('laydown-bearer-%d-%.0f' % (k, q * 100),
                 (SKID_L, SKID_W, SKID_H),
                 LAYDOWN_S - JOINT_L * 0.5 + JOINT_L * q, wk, SKID_H * 0.5,
                 WOOD, C_SKID, bevel=0.01, turn=math.pi * 0.5)
    crubble('bedding', 19.0, LAYDOWN_W, -0.10,
            (4.2, 3.4, 1.7), STONE, (C_STONE, C_STONE2),
            block=0.50, n=30, seed=3101.0)


# ═════════════════════════════════════════════════════════════════════════════
# ══════════════════════════════════════════════════════════════════════════════
# THE PICTURE, ASSERTED
#
# The module docstring claims that six parallel lines land at particular places
# in the measured frame and converge on one vanishing point, and that the two
# cut crests sit either side of the horizon.  That claim is the whole design of
# this site, and a claim in a docstring is exactly the kind of thing that goes
# quietly false the first time somebody changes a strip width or the bearing.
#
# ASTRA §10 calls it "a declared contract with no consumer" and lists eight
# instances found and fixed in this codebase.  So the frame helpers above are
# not decoration and are not dead code: `check_frame()` CONSUMES them and the
# build fails if the picture moves.  Change `TURN`, `W_COLLAR` or any sourced
# strip width and this raises with the number it actually got.
# ══════════════════════════════════════════════════════════════════════════════

# (label, offset, expected NDC x at chainage 30 m along the line)
FRAME_LINES = (
    ('topsoil windrow', 'W_TOPSOIL', -0.8015),
    ('ditch-spoil windrow', 'W_SPOIL', -0.4426),
    ('ditch line', 'W_DITCH', -0.2032),
    ('strung pipe', 'W_STRING', -0.0389),
    ('matted travel lane', 'W_MATS', +0.4743),
    ('working-side ROW limit', 'W_EDGE_WORK', +0.6563),
)
FRAME_TOL = 0.02


def check_frame():
    """Prove the six lines and the two crests are where the docstring says."""
    here = globals()
    for label, key, want in FRAME_LINES:
        d, a = cor_frame(30.0, here[key])
        got = ndc_x(d, a)
        if abs(got - want) > FRAME_TOL:
            raise AssertionError(
                'the %s lands at NDC x %+.4f, not the %+.4f this module\'s '
                'docstring claims (tolerance %.2f). Either the picture changed '
                'or the docstring is now a lie; fix whichever is wrong, and do '
                'not widen the tolerance.' % (label, got, want, FRAME_TOL))
    vp = math.tan(TURN) / HALF_W_K
    if abs(vp - (-0.3937)) > FRAME_TOL:
        raise AssertionError('the vanishing point moved to NDC x %+.4f' % vp)
    # The two crests either side of the measured horizon at NDC y -0.12 is what
    # makes the pair read as "a cutting on one side, open country on the other".
    d, _ = cor_frame(S_FAR, W_EDGE_SPOIL)
    hi = ndc_y(d, CUT_H_FAR[0])
    d, _ = cor_frame(S_FAR, W_EDGE_WORK)
    lo = ndc_y(d, CUT_H_FAR[1])
    if not (lo < -0.12 < hi):
        raise AssertionError(
            'the far crests no longer straddle the horizon: spoil side %+.4f, '
            'working side %+.4f, horizon -0.12. One breaking the skyline and '
            'one not is the whole reason there are two different heights.'
            % (hi, lo))
    print('CORRIDOR_FRAME_OK lines=%d vanishing=%+.4f crests=%+.4f/%+.4f '
          'frameHalfWidthAt45m=%.2fm' % (len(FRAME_LINES), vp, hi, lo,
                                         half_width(45.0)))


# ═════════════════════════════════════════════════════════════════════════════
# NAMED NODES
#
# `mount:` is reused rather than a new prefix — `src/core/gltfRig.js` already
# indexes it, `terrain.js` `restoreSiteNames()` already un-sanitises it (three.js
# DELETES `:` from node names on load, silently, and a partial restore is a hard
# error there), and `finish()` already snapshots and restores its world transform
# through the join, which is the contract that took longest to get right
# (ASTRA §4).  None of these carries `cone_deg`/`range_m`, so none is read as a
# lamp: research/16 §A.2 asks for floodlighting only in the RAIL night-possession
# case, which this site is not, and inventing lights would be inventing a detail.
# ═════════════════════════════════════════════════════════════════════════════

def build_anchors():
    S.anchor('site-collar', (0.0, 0.0, 0.0))
    ax, ay = cor(0.0, W_DITCH)
    S.anchor('site-alignment', (ax, ay, 0.0),
             bearing_deg=round(math.degrees(YAW), 2),
             row_width_m=round(ROW_W, 3))
    gx, gy = cor(ACCESS_S, W_EDGE_WORK)
    S.anchor('site-access', (gx, gy, 0.0))
    cx, cy = cor(COMPOUND_S, COMPOUND_W)
    S.anchor('site-compound', (cx, cy, 0.0))
    fx, fy = cor(CROSSING_S, W_DITCH)
    S.anchor('site-crossing', (fx, fy, 0.0))


# ═════════════════════════════════════════════════════════════════════════════

def build(out_path):
    S.reset()
    build_edges()
    build_windrows()
    build_ditchline()
    build_matrun()
    build_string()
    build_stakes()
    build_access()
    build_crossing()
    build_compound()
    build_laydown()
    check_frame()

    # THE KEEP-CLEAR IS ASSERTED OVER REAL VERTICES, NOT OVER THE PLACEMENTS.
    # `terrain.js` owns the collar, its live spoil ring, the `pad: 9.5` decal
    # and the section seam, and the player has to keep seeing the machine and
    # the hole.  Checking the loop variables would only re-prove the arithmetic
    # this file already did; checking the vertices proves what was built.  Same
    # reasoning as `urban_plot.py`'s collar reserve, and it is NOT a competing
    # dimension tool — `tools/glbinfo.mjs` remains the one ruler (ASTRA §5).
    bpy.context.view_layer.update()
    checked = 0
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        for v in o.data.vertices:
            p = o.matrix_world @ v.co
            checked += 1
            if math.hypot(p.x, p.y) < CLEAR_R:
                raise AssertionError(
                    'corridor furniture inside the %.1f m collar reserve: %s at '
                    '(%.2f, %.2f)' % (CLEAR_R, o.name, p.x, p.y))
            if math.hypot(p.x, p.y) > 74.0:
                raise AssertionError(
                    '%s reaches r = %.1f m, outside terrain.js CFG.groundSize/2 '
                    '(75 m) where there is no ground under it.'
                    % (o.name, math.hypot(p.x, p.y)))
    if checked < 5000:
        raise AssertionError(
            'the keep-clear check saw only %d vertices, which cannot be right. '
            'A gate over an empty set passes forever (ASTRA §10).' % checked)

    build_anchors()
    print('CORRIDOR_DERIVED row=%.3f topsoil h=%.3f slope=%.1fdeg '
          'ditchspoil h=%.3f slope=%.1fdeg trench d=%.3f vertices_checked=%d'
          % (ROW_W, TOPSOIL_H, TOPSOIL_SLOPE, SPOIL_H, SPOIL_SLOPE,
             TRENCH_D, checked))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    return S.finish(out_path, budget=MATERIAL_BUDGET)


# ═════════════════════════════════════════════════════════════════════════════
# INSPECTION RENDER — AN OFFLINE BLENDER RENDER.  NEVER A GAMEPLAY CAPTURE.
#
# It re-imports THE REAL EXPORTED .glb and renders that, not the scene that was
# just built, so what gets looked at is what shipped.  Cycles on the CPU: the
# GPU lease is held by another track and no headed browser or GPU capture may be
# started from here.
#
# WHAT THIS IMAGE IS NOT.  It is not the game.  `src/core/assets.js` generates
# every one of these materials procedurally at runtime with wear and dirt driven
# by gameplay state, and a .glb ships NAMES ONLY — so the surfaces below are
# Blender's own flat vertex colours under one area lamp and look nothing like
# the shipped site.  What it proves is GEOMETRY, SCALE, PLACEMENT IN THE FRAME
# and that nothing is hovering.  Judging colour or material off it would be
# judging the wrong thing.
# ═════════════════════════════════════════════════════════════════════════════

def preview(path, name, eye=None, look=None, ortho=None, samples=20):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 4
    scene.render.resolution_x = 1240
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.world = bpy.data.worlds.new('inspection-world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.60, .69, .80, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .75

    tx, ty = cor(26.0, W_DITCH)
    bpy.ops.object.light_add(type='AREA', location=(tx + 30, ty - 36, 44))
    sun = bpy.context.object
    sun.data.energy = 40000
    sun.data.shape = 'DISK'
    sun.data.size = 26
    sun.rotation_euler = (Vector((tx, ty, 0.0)) - sun.location).to_track_quat('-Z', 'Y').to_euler()

    # A neutral ground so anything hovering shows as a shadow with a gap under
    # it.  THIS PLANE IS AN INSPECTION FIXTURE AND IS NOT IN THE .glb.
    bpy.ops.mesh.primitive_plane_add(size=320)
    mat = bpy.data.materials.new('inspection-ground')
    mat.diffuse_color = (.31, .30, .26, 1)
    bpy.context.object.data.materials.append(mat)

    # ALONG THE MEASURED HERO AXIS, not at a point on the corridor.  The first
    # render of this file aimed at `cor(30, W_DITCH)`, which lies 3.55 m across
    # the frame from the view axis -- so the whole picture was yawed about
    # 4.7 deg and every NDC number in this file was being judged against a frame
    # that was not the game's.  The look-at is now ON the axis, at the height
    # the measured +1.36 deg pitch puts it.
    at = Vector(look) if look else Vector(
        on_axis(43.0, 0.0) + (EYE_Z + 43.0 * math.tan(1.36 * D2R),))
    bpy.ops.object.camera_add(location=eye or (EYE[0], EYE[1], EYE_Z))
    camera = bpy.context.object
    camera.rotation_euler = (at - camera.location).to_track_quat('-Z', 'Y').to_euler()
    if ortho:
        camera.data.type = 'ORTHO'
        camera.data.ortho_scale = ortho
    else:
        # The hero camera's own vertical field, so the framing decisions in this
        # file can actually be judged: 20.97 deg vertical at aspect 1.724.
        camera.data.sensor_fit = 'VERTICAL'
        camera.data.angle_y = 20.97 * D2R
    scene.camera = camera
    out = os.path.join(ROOT, 'shots', name + '.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('CORRIDOR_OFFLINE_BLENDER_RENDER ' + out)
    return out


if __name__ == '__main__':
    result = build(os.path.join(ROOT, 'public', 'models', 'sites',
                                'infrastructure-corridor.glb'))
    if '--preview' in sys.argv:
        # 1. the hero frame, at the measured hero eye and vertical field
        preview(result, 'corridor-hero',
                look=Vector(cor(30.0, W_DITCH) + (2.6,)))
        # 2. straight down the line, so the cross-section can be counted
        px, py = cor(24.0, W_DITCH)
        preview(result, 'corridor-plan', eye=(px + 4, py - 30, 66),
                look=(px, py, 0.0), ortho=86)
