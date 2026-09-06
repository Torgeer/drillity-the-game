"""A greenfield core-drilling pad; exports public/models/sites/exploration-pad.glb.

Read `research/sites/exploration-pad.md` for the full source list with URLs, the
measured frame arithmetic, the draw-call accounting and the cross-file requests.
This is a FICTIONAL place assembled from sourced parts — not a reconstruction of
any real site, not a pad design, and no manufacturer name, marque or model
designation is exported.

WHAT THIS ARCHETYPE IS, AND WHAT THE .GLB IS ALLOWED TO BE
---------------------------------------------------------
`src/world/terrain.js` ARCHETYPES['exploration-pad'] states it: *"a small
clearing in whatever the region grows or freezes. The pad is cut OUT of the
biome, so the biome is left almost untouched around it — this is the one
surface archetype that keeps nearly all of its region."* Its `dress` keeps
0.90-0.95 of the REGION's own scatter, against 0.06-0.55 on every other built
archetype.

That sentence is the constraint on this file, and it is why THERE IS NO
VEGETATION, NO SNOW, NO SAND, NO STUMPS AND NO SLASH IN THIS EXPORT. A site
.glb is one file, cloned unchanged into all eight regions (see THE EIGHT
BIOMES), so anything biome-specific authored here would be right in one region
and wrong in seven. Everything here is pad FURNITURE — the kit a core crew
carries, which is the same in the boreal bush, the Andes and the Arctic. The
clearing, its ground, its light and everything growing at its edge stay with
`terrain.js`, which already varies all of them per region.

THE EIGHT BIOMES — WHAT THE LOADER CAN AND CANNOT EXPRESS TODAY
--------------------------------------------------------------
Read out of the code, not assumed.

  ALREADY VARIES PER REGION (terrain.js REGIONS[], eight entries):
    groundKind        dirt / gravel / rockFace / sand / snow
    colA colB rock spoil                 ground and spoil albedo
    snow dust wet                        the ground shader's uniforms
    dress{spruce birch rock stone grass scree scrub ice}
                      x0.90-0.95 here, so nordic keeps 46 spruce and 260 grass
                      while sahara keeps 46 scrub, 40 scree and no trees at all
    propTint          the merged prop pool is multiplied by it (terrain.js:2181)
    haze, far{amp near tint forest snowLine sharp}

  CANNOT VARY AT ALL:
    anything inside this .glb. `loadSiteModel(id)` keys its master by the
    ARCHETYPE ID only; `attachSiteModel()` clones that master with no region
    argument; `bindSiteMaterials(node, id)` resolves kinds with no region
    argument; and `site.finish()` joins statics BY MATERIAL, so after export
    there is not even a per-object node left for a loader to hide.

  Two fixes, both costing no draw calls, are written up in the research doc.
  Until one lands, ONE thing in this file is honestly wrong outside a temperate
  region: the sump's push-up and ramp are `dirt` at a neutral authored tint,
  where terrain.js would give the same spoil `region.spoil` (0x6a6053 nordic ..
  0xbda37a sahara .. 0x9aa6b0 arctic). That is stated again at the point of use
  and it is the ONLY such compromise here — a topsoil stockpile was authored,
  was the second offender, and was deleted rather than shipped wrong.

THE GROUND THIS STANDS ON — A REQUIRED ARCHETYPE CHANGE
-------------------------------------------------------
`terrain.js heightAt()` flattens to y = 0 only inside `CFG.padRadius` 8.5 m of
the PAD CENTRE three.js (0, 2.4), and then raises a compacted crown of up to
+0.28 m between r 6.8 and 16.8. Evaluated from that function: +0.02 m at r 7.0,
+0.09 at 8.0, +0.16 at 8.5, +0.25 at 9.3. Without an archetype change the
flat-to-3-cm ground is a crescent about 4 m wide and there is nowhere on it to
lay core out.

Both archetypes that already load a model solved this the same way, and the
same way is used here: the archetype DECLARES the built surface it stands on
(`quarry-bench` flatR 46; `urban-plot` flatR 76, padCrown 0). What is asked for
here is sourced rather than chosen:

    'exploration-pad': { ... model: 'exploration-pad',
                         flatR: 16, flatFalloff: 26, padCrown: 0, ... }

  [ONTARIO-BMP] a ground-supported diamond drill pad is 20-40 m in diameter.
  [MB-BMP11]    a pad is capped at 900 m2 (0.09 ha).
  [NT-BOXHOLE]  a real approved plan cleared 17 pads at 25 x 25 m = 625 m2.
  [BC-BOND]     BC's reclamation calculator bills an "average drill pad
                approximately 10 m x 10 m", i.e. 100 m2 — the small end.
  pi * 16^2 = 804 m2: a 32 m pad, inside ONTARIO-BMP's 20-40 m band, under
  MB-BMP11's 900 m2 cap, and above NT's real 625 m2. It is the smallest flat
  the composition below actually fits on, searched rather than chosen: the
  free, visible, unoccupied ground on this archetype is a crescent, and the
  sump is 5.1 x 3.9 m of it.

Why the 100 m2 end does not fit THIS machine, derived rather than asserted:
`node tools/glbinfo.mjs --parts public/models/core-rig.glb` measures the rig
that drills this archetype at 2.890 x 12.267 x 6.647 m, and [BLY-PAD] requires
"at least three metres (10 ft) of clearance around the drilling equipment".
2.890 + 6 by 6.647 + 6 is 8.89 x 12.65 = 112 m2 of clearance ALONE, before a
sump, a laydown or a rod rack. So 100 m2 describes a smaller skid rig than the
one the game stands here, and the 625-900 m2 band is the honest one.

Every vertex in this file is asserted to lie within 15.5 m of the collar, so it
sits on that flat with 0.5 m to spare. Footings, pegs and dunnage are set
40-160 mm INTO the ground, so if the archetype change does not land the model
degrades to slightly-sunk furniture rather than floating furniture.

WHAT IS DELIBERATELY NOT HERE
-----------------------------
`terrain.js buildProps()` already draws, on EVERY archetype: a compressor skid,
a water bowser, two rod racks with rods, a casing stack, a toolbox, a
hazard-barrier arc at r 5.4 and the site sign. None is duplicated here and
every one of their footprints is a keep-out asserted in `build()`.

There is no shelter or tarp over the mast: the machine is the subject of the
shot, a shelter would occlude it, a heated drill shack is a cold-climate object
([CORING-COLD]) and [USBR-GFM] is explicit that "directly covering boxes with a
tarp is not acceptable". There is no timber crib under the rig either, although
[MB-BMP11] makes cribbing the PREFERRED way to prepare a pad — it would have to
sit inside the machine's own footprint and fight its four `slide:jack-*` nodes.
The spare timbers cached at the pad edge are that crib's other half.

Build:
    blender --background --python blender/sites/exploration_pad.py
Inspect the exported asset, CPU only:
    ... --python blender/sites/exploration_pad.py -- --preview
"""
import importlib.util
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
spec = importlib.util.spec_from_file_location(
    'drillity_exploration_site', os.path.join(HERE, '..', 'lib', 'site.py'))
S = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = S
spec.loader.exec_module(S)


# ═════════════════════════════════════════════════════════════════════════════
# THE FRAME — READ OFF THE RENDERER, NOT COPIED FROM ANOTHER SITE MODULE
# ═════════════════════════════════════════════════════════════════════════════
# `src/core/renderer.js` CAMERA_MODES.hero, which renderer.js:2154 selects for
# the 'site' screen — the shot this place is actually seen in:
#     pos [8.40, 2.25, 10.94]   look [-1.55, 2.60, 0.00]   fov 34 VERTICAL
# three.js (x, y, z) is Blender (x, -z, y), so:
EYE = (8.40, -10.94, 2.25)
LOOK = (-1.55, 0.00, 2.60)
# renderer.js sets camera.aspect from the surface band, 780 x 911 px = 0.856,
# so the HORIZONTAL half-field is atan(tan(17 deg) * 0.856) = 14.67 deg and the
# frame is only 7.2 m wide at the collar. That number, more than any other, is
# why this pad is composed the way it is.
BAND_ASPECT = 780.0 / 911.0
TAN_H = math.tan(math.atan(math.tan(math.radians(17.0)) * BAND_ASPECT))

_d = Vector((LOOK[0] - EYE[0], LOOK[1] - EYE[1], 0.0))
AXIS = _d.normalized()                             # away from the camera
RIGHT = Vector((AXIS.y, -AXIS.x, 0.0))             # screen-right
YAW = math.atan2(RIGHT.y, RIGHT.x)                 # local +X -> screen-right


def at(d, a, z=0.0):
    """A point `d` metres down the hero camera's axis and `a` metres to
    screen-right of it. Used to COMPOSE only; every placement is then re-checked
    against the world keep-outs in `build()`, which are in terrain.js's frame."""
    return Vector((EYE[0], EYE[1], 0.0)) + AXIS * d + RIGHT * a + Vector((0, 0, z))


def screen_u(x, y):
    """(-1 .. +1 across the hero frame, depth). Outside +-1 is off camera."""
    v = Vector((x - EYE[0], y - EYE[1], 0.0))
    d = v.dot(AXIS)
    return ((v.dot(RIGHT) / (d * TAN_H)) if d > 1e-6 else 99.0), d


# ═════════════════════════════════════════════════════════════════════════════
# KEEP-OUTS — terrain.js's own geometry, in terrain.js's own frame
# ═════════════════════════════════════════════════════════════════════════════
# Blender (x, y) is three.js (x, -y). Everything below is three.js (x, z).

# The rig stands at CFG.pad = three.js (0, 0, 2.4) (terrain.js:102). The machine
# that drills this archetype is `core-rig`, measured with the ONE ruler
# (ASTRA.md §5): `node tools/glbinfo.mjs --parts public/models/core-rig.glb`
#   DIMENSIONS  W 2.890 x H 12.267 x L 6.647   x -1.440..1.450  z -4.967..1.680
# so in world coordinates it occupies x -1.440..1.450, z -2.567..4.080.
RIG_X0, RIG_X1 = -1.440, 1.450
RIG_Z0, RIG_Z1 = -2.567, 4.080
# [BLY-PAD] Boart Longyear, *Five Tips for Drill Pad Planning*: a borehole needs
# "at least three metres (10 feet) of clearance around the drilling equipment",
# and an undersized pad RAISES cost because it forces manual rod handling.
CLEAR_M = 3.00

# terrain.js heightAt() raises a spoil ring for cr < 3.0 m of the collar, up to
# +0.40 m, and buildCollar() draws a 2.4 m puddle. The live collar owns that
# ground and the section seam is under it.
COLLAR_CLEAR = 3.05

# terrain.js buildProps() draws a hazard-barrier arc on EVERY archetype: eight
# units on r = 5.4, at three.js angles -0.9 .. 2.7 rad, each 1.9 m long.
BARRIER_R, BARRIER_HALF = 5.40, 1.05
BARRIER_A0, BARRIER_A1 = -1.05, 2.85

# The rest of the universal kit, from terrain.js buildProps(): centre and
# generous half-extents in three.js (x, z), drawn on EVERY archetype.
PROPS = (
    (7.2, 6.4, 2.2, 1.6, 'compressor skid'),
    (10.4, 1.4, 1.4, 2.0, 'water bowser'),
    (-6.4, -5.4, 1.3, 2.8, 'rod rack A'),
    (-8.3, -5.4, 1.3, 2.8, 'rod rack B'),
    (-10.8, -1.2, 1.7, 2.1, 'casing stack'),
    (4.2, -6.0, 1.1, 0.7, 'toolbox'),
    (6.2, 10.6, 1.7, 0.5, 'site sign'),
)

FLAT_R = 16.0        # what the archetype must declare (see the docstring)
BUILD_R = 15.5       # what this file authors inside, so there is 0.5 m spare


# ═════════════════════════════════════════════════════════════════════════════
# SOURCED DIMENSIONS
# Every constant below either cites a source or says NOT SOURCED. Source keys
# resolve in research/sites/exploration-pad.md; those prefixed [xx-] with no
# entry there resolve in research/16-site-archetypes.md.
# ═════════════════════════════════════════════════════════════════════════════

# ── the core ────────────────────────────────────────────────────────────────
# Wireline sizes [WP-EDD] via research/16 §A.8: BQ 36.5/60 · NQ 47.6/75.7 ·
# HQ 63.5/96 · PQ 85/122.6 mm core/hole, "with NQ and HQ the workhorses".
# This pad is drilling NQ.
NQ_CORE_D = 0.0476
# RECORDED, NOT CONSUMED: the hole this rig is making is 75.7 mm across, and
# `terrain.js buildCollar()` draws its throat at r = 0.36 m — 720 mm, NINE AND A
# HALF TIMES the real bore. That is the same class of undeclared exaggeration
# ASTRA §8.7 already flags on the section band's 7.1x bore, and it is somebody
# else's file. Reported in research/sites/exploration-pad.md, not worked around.
NQ_HOLE_D = 0.0757

# ── the core tray ───────────────────────────────────────────────────────────
# THE OBJECT THIS WHOLE FILE EXISTS FOR. Injection-moulded UV-stabilised
# polypropylene trays are a de-facto standard series, 1 065-1 100 mm long and
# 385-395 mm wide, and every maker publishes the same three numbers.
#   [DISCOVERER-TRAY] Series 2 N/N2: 1065 x 385 x 67.5 mm, 5 rows, 5 m of core,
#     1.9 kg, colour beige, one-piece moulded, "Drainage holes throughout",
#     built-in handles both ends, and the trays "stack perfectly on top of each
#     other, loaded with core without touching" the tray below.
#   [GEOPRO-TRAY]     NQ 1070 x 385 x 55 mm, 5 channels, 55 mm channel.
#   [IMPALA-3]        NQ2 1085 x 390 x 67 mm, 5 rows.
# The three disagree on DEPTH by 12 mm (55 / 67 / 67.5). The two that agree are
# used; 55 mm would leave 7 mm of freeboard over a 47.6 mm core, which is less
# than [USBR-TM] requires for a lid that bears on the dividers rather than on
# the core.
TRAY_L = 1.065               # m   [DISCOVERER-TRAY]
TRAY_W = 0.385               # m   [DISCOVERER-TRAY], [GEOPRO-TRAY]
TRAY_H = 0.0675              # m   [DISCOVERER-TRAY], corroborated [IMPALA-3]
TRAY_ROWS = 5                # 5 rows x 1 m = 5 m of NQ core  [DISCOVERER-TRAY]
TRAY_CHAN_W = 0.055          # m   NQ channel                 [GEOPRO-TRAY]
TRAY_EMPTY_KG = 1.9          # kg, empty. RECORDED, NOT CONSUMED [DISCOVERER-TRAY]
TRAY_FULL_KG = 45.0          # kg, loaded. [DISCOVERER-RACK] does not state the
                             # core size; it is a 1065 x 385 tray. Not modelled
                             # as geometry — it is why the stacks are short.
# [DISCOVERER-TRAY] plastic lid, "White plastic, custom-made, 1065 x 375mm".
TRAY_LID_W = 0.375
TRAY_LID_H = 0.010           # [GVDRILL] core tray lid 1070 x 385 x 10 mm, 1.2 kg

# ── stacking, and what a regulator will actually allow on a pad ─────────────
# [MB-BMP13] Manitoba BMP 13, core storage: cross-stacked, the bottom layer
# "approximately 15-45 centimetres off the ground and supported by solid
# footings", "at least one inch between individual boxes in a layer to enhance
# ventilation", labelled with aluminium tape, kept >= 100 m from water.
STACK_LIFT = 0.30            # m, mid of the sourced 0.15-0.45 band [MB-BMP13]
STACK_GAP = 0.0254           # m, one inch                         [MB-BMP13]
# [ON-STANDARDS] Ontario Provincial Standards for Early Exploration, Part III
# §1.4, and this is a HARD LIMIT, not guidance: core left on site "must be
# cross-piled in an orderly manner to a height not exceeding 1.5 metres and not
# less than 30 metres from any water body".
PILE_MAX_H = 1.50
# NOT SOURCED: how many layers a crew actually piles. The sourced 30-high and
# 60-per-pallet figures are a lumber-strength claim and a packing claim, not a
# pad practice. Authored at 5-7 layers, which every column asserts against
# PILE_MAX_H below.

# ── the marker blocks that go in the tray ──────────────────────────────────
# [USBR-102D9] US Bureau of Reclamation drawing 102-D-9, *N-size core box*,
# reproduced as Figure 10-9 of the Geology Field Manual Vol. 1 Ch. 10.
#   Note 3: "Twelve spacer blocks shall be required for each box. Spacer blocks
#     shall be constructed of 1-inch nominal clear lumber, 2-1/4 inches square
#     ... Spacer blocks shall be painted white."
#   Note 4: "Core loss blocks shall be constructed from standard 2- by 2-inch
#     wood or styrofoam stock. The length of these blocks shall be equivalent
#     to the core loss interval ... painted fluorescent orange or tangerine."
BLOCK_SQ = 0.05715           # 2-1/4 in                          [USBR-102D9]
LOSS_SQ = 0.0508             # 2 x 2 in                          [USBR-102D9]

# ── the logging trestle ────────────────────────────────────────────────────
# [DISCOVERER-TRESTLE] Core Logging A-Frame Trestle, the field object: standing
# "Height 90cm, Width 96cm, Depth 93cm", "Weight rated to 450kg", supplied as
# "2 x A-Frame Trestles and 2 x Lengths of Pipe", the pipe "50NB 3250mm
# galvanised". Corroborated as a working height by [PALSATECH] logging tables,
# whose "table lower edge" adjusts over "74-94 cm".
# The two rails are drawn here in TIMBER at the sourced 60.3 mm (50NB) section:
# this .glb has no steel material inside its five-material budget, and a
# site-built timber-railed trestle is the honest way to draw that geometry
# rather than painting galvanised pipe as something else.
TRESTLE_H, TRESTLE_W, TRESTLE_D = 0.900, 0.960, 0.930
TRESTLE_RAIL_L = 3.250
TRESTLE_RAIL_D = 0.0603

# ── the sump ───────────────────────────────────────────────────────────────
# [STIBNITE] Midas Gold / Perpetua Resources, *Stibnite Gold Project Plan of
# Restoration and Operations* Ch.13 p.131, and it is the only source found that
# dimensions a core-drilling sump at all:
#   "Typical dimensions for a helicopter supported drill sump are approximately
#    12 feet long by 6 feet wide by 3 feet deep, while road supported drill
#    sumps are generally 16 feet long by 8 feet wide by 8 feet deep."
#   and: "At least one side of the sump is constructed at a shallow grade to
#    create a ramp for egress in the event wildlife enters the sump; other
#    sides of the sump are constructed at steeper angles".
# The helicopter-supported size is used: this is a small clearing with no road.
SUMP_L, SUMP_W, SUMP_D = 3.658, 1.829, 0.914     # 12 x 6 x 3 ft  [STIBNITE]
# 3.658 * 1.829 * 0.914 = 6.11 m3 = 6 110 L of excavation, against the 4 000 L
# of FLUID that research/02 §E6 [CORING-MAG] says a mud pit holds before it is
# emptied, "roughly every 150 m". Both are sourced and they are consistent: a
# sump is not filled to its rim.
# [NT-AA7029] fauna egress ramp is mandatory. [WORKSAFEWA] §2.3: sumps "are
# barricaded to prevent inadvertent access" — but NO source found names the
# physical barrier, so the pickets and rail below are NOT SOURCED.
# NOT LINED, and that is sourced: [YUKON-BMP] §19.4 treats geotextile as the
# PERMAFROST fallback ("if it is not possible to dig proper sumps use geotextile
# material and/or straw bales"), and [BC-HANDBOOK] §11.4.4 lists "dug sumps"
# separately from "impervious walled" settling ponds. A lined sump as the
# default would be an invented detail.
# [CME-DMIRS] the excavated material is "excavated sump push-up" beside the pit
# and counts as pad footprint.

# ── the topsoil stockpile, AUTHORED AND THEN DELETED ───────────────────────
# [BC-HANDBOOK] §11.4.2: "topsoil and overburden should be removed as required
# and saved separately, nearby in low mounds", on the upslope side; [BC-BOND]
# assumes an "average topsoil depth of 0.10 m". A windrow was built to that
# derivation and removed again, for two reasons worth keeping written down:
#   1. once the sump had grown to its own sourced size there was no legal spot
#      left for it (see WHERE EVERYTHING STANDS), and
#   2. it was the SECOND thing in this file that could not follow the biome. A
#      topsoil bank is the colour of the ground it came out of, and this .glb
#      cannot ask for `region.spoil`. One such compromise is an admitted gap;
#      two would be a pattern.
# It also is not much of an omission: [MB-BMP11] and [BC-NOW] both say the
# PREFERRED preparation is to fell the trees and crib the rig on timbers with
# "no ground disturbance necessary", so a pad like this strips very little.

# ── recorded, deliberately not modelled ────────────────────────────────────
# [BLY-RODS] Boart Longyear Coring Rods and Casing Catalog: the standard core
# rod is 3.0 m (10 ft); NQ midbody OD 69.9 mm, 7.8 kg/m, 23.4 kg per rod; a
# bundle of 19 NQ rods is 3.2 x 0.4 x 0.3 m and 453 kg. terrain.js's universal
# rod racks draw 4.4 m rods at 230 mm diameter, which is not a core rod — see
# the research doc, this file does not draw a third rack.
CORE_ROD_L, CORE_ROD_OD = 3.000, 0.0699
# [BC-NOW] a real application stores "250 litres / Barrel" of fuel on the pad,
# and [BC-HANDBOOK] requires secondary containment at 110 % of storage volume
# for containers over 454 L. Not modelled: a bunded drum pallet needs a painted
# steel surface and this file has spent its five materials.

# ── materials: five names, five draw calls, all real kinds in assets.js ─────
# `site.finish()` asserts every one of these against src/core/assets.js before
# it will export, because an unknown kind does not throw at runtime — it
# silently becomes rawSteel (ASTRA.md §4, contract 2).
TRAY = 'coreTray'    # assets.js authors this kind FOR THIS OBJECT: an
                     # injection-moulded tray with UV chalking, the polished
                     # drag track where the stick is slid in, and mud.
ROCK = 'rockFace'    # "undisturbed / sawn rock" — a core stick exactly.
TIMBER = 'timber'    # dunnage, footings, trestles, blocks, pegs, cached crib
EARTH = 'dirt'       # sump push-up, ramp and water — SEE THE EIGHT BIOMES
HOSE = 'hose'        # the return line to the sump and the suction line back

# Tray colour IS sourced, and it is sourced as a photography decision:
# [WESTERNEX] "Available in high visibility white or trays may also be ordered
# in grey or black for less glare when photographing the core", with the
# catalogue's own key — "Grey: Often preferred for photography, also reduces
# glare / White: Heightens contrast in photography / Black: Ideal for use with
# high-logger and CoreScan system" — and the warning that black trays "are made
# with recycled/regrind material". So: mostly grey, some white, no black.
C_TRAY_GREY = 0x777A7D
C_TRAY_WHITE = 0xD8D9D4
C_TRAY_BEIGE = 0xBEB49C      # [DISCOVERER-TRAY] sells N/N2 in beige
C_LID = 0xC9CBC7             # [DISCOVERER-TRAY] lids are white plastic
# NOT SOURCED: the core's own colours. Three darks -- a grey, a green-grey and
# a weathered tan -- chosen to sit under any region's light rather than to name
# a rock type, and deliberately DARKER than the tray: the first hero render came
# back with mid-grey core in a mid-grey tray and the whole laydown read as blank
# slabs. Contrast against the tray is what makes a core box a core box.
C_CORE = (0x4E5049, 0x3C443E, 0x63594A)
C_TIMBER = 0xA9835A          # assets.js KINDS.timber's own default
C_DUNNAGE = 0x8B7452         # weathered, ground-contact
C_BLOCK_WHITE = 0xE4E2D8     # [USBR-102D9] "Spacer blocks shall be painted white"
C_BLOCK_LOSS = 0xE0631A      # [USBR-102D9] "painted fluorescent orange"
C_BERM = 0x5B5245            # THE BIOME COMPROMISE — see the module docstring
C_SUMP_WATER = 0x2A2A24
C_HOSE = 0x141518            # assets.js KINDS.hose's own default
C_SUCTION = 0x23282B


# ═════════════════════════════════════════════════════════════════════════════
# PRIMITIVES
# ═════════════════════════════════════════════════════════════════════════════
_VC_NODE = 'exploration-vertex-colour'


def colour(o, rgb):
    """Bake one flat vertex colour onto an object and make its material read it.

    The mechanism is `urban_plot`'s and so is the reason for its shape: Blender
    5.2 treats `use_nodes` as always-on, so testing that flag proves nothing and
    the first export there collapsed COLOR_0 to white. Test for the actual
    consumer node instead.

    `terrain.js siteMaterial()` asks assets.js for the kind with
    `color: 0xffffff, vertexColors: true` whenever a mesh carries a colour
    attribute — the same contract the procedural prop pool uses — so the
    authored colour is the only tint and the kind's wear, dirt and ORM survive.

    EVERY mesh must go through this. `build()` asserts it, because the loader
    decides vertexColors PER JOINED MESH: one uncoloured box joined into a
    coloured group renders pure white with nothing in the log.
    """
    c = tuple(((rgb >> s) & 255) / 255 for s in (16, 8, 0)) + (1.0,)
    attr = o.data.color_attributes.new(name='Color', type='BYTE_COLOR', domain='CORNER')
    for item in attr.data:
        item.color_srgb = c
    o.data.color_attributes.active_color = attr
    m = o.data.materials[0]
    if not m.node_tree or not m.node_tree.nodes.get(_VC_NODE):
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        vc = m.node_tree.nodes.new('ShaderNodeVertexColor')
        vc.name = _VC_NODE
        vc.layer_name = 'Color'
        m.node_tree.links.new(vc.outputs['Color'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.80
        # NEVER above 0 (ASTRA.md §1.6): +65 to +81 draw calls, size-independent.
        bsdf.inputs['Transmission Weight'].default_value = 0.0
    return o


def bx(name, size, loc, kind, tint, bevel=0.0, yaw=0.0):
    return colour(S.box(name, size, kind, loc=loc, rot=(0, 0, YAW + yaw), bevel=bevel), tint)


def cyl(name, radius, length, p0, kind, tint, sides=8, rot=None):
    o = S.tube(name, radius, length, kind, loc=p0, sides=sides)
    if rot is not None:
        o.rotation_euler = rot
    return colour(o, tint)


def stick(name, radius, p0, p1, kind, tint, sides=7):
    """A cylinder from p0 to p1 — a core run, a trestle leg, a guard rail."""
    d = Vector(p1) - Vector(p0)
    o = S.tube(name, radius, d.length, kind, loc=p0, sides=sides)
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return colour(o, tint)


def draped(name, points, radius, tint, sides=6):
    """A hose that sags, converted to mesh HERE rather than in `finish()`.

    `rig.hose()` returns a CURVE, and `rig.finish()` converts curves only at
    export time — after which it is too late to give it a colour attribute.
    A curve that reached the join uncoloured would join into the `hose` group
    beside coloured geometry and render white.
    """
    o = S.hose(name, points, radius=radius, mat=HOSE, sides=sides)
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    return colour(bpy.context.view_layer.objects.active, tint)


def pushup(name, centre, size, block, seed):
    """A heap of excavated ground, coloured.

    `site.rubble()` exists because a mass of loose material has a silhouette
    that is broken at every scale and a box's is straight at every scale — the
    exact failure that made terrain.js's rock features read as "a wall of
    smooth pale cardboard cartons". It returns raw objects, so every one has to
    be given its colour attribute here or `build()` refuses the model.
    """
    return [colour(o, C_BERM) for o in S.rubble(
        name, centre, size, EARTH, block=block, n=4, seed=seed, yaw=YAW)]


# ═════════════════════════════════════════════════════════════════════════════
# THE CORE TRAY
# ═════════════════════════════════════════════════════════════════════════════

def tray(name, centre, yaw=0.0, open_tray=False, core=0.0, blocks=0, loss=False,
         seed=0.0, tint=None):
    """One NQ core tray, 1 065 x 385 x 67.5 mm.

    A CLOSED tray is one box plus its lid: that is the unit that gets piled,
    and fifty of them differing by a millimetre of moulded relief would be
    triangles spent on nothing. An OPEN tray gets its five channel walls, its
    core and its marker blocks, and those are the ones the camera can resolve.

    `core` is how full each row is, so a run being laid out reads as PARTLY
    filled — which is the state a working pad is in. [USBR-GFM]: the core
    "should be placed in the core box from left to right, with the top to the
    left, bottom to the right, starting at the top of the box so the core reads
    like a book", so a part-filled tray fills from one end and this one does.
    """
    cx, cy, cz = centre
    if tint is None:
        k = int(S.rnd(seed * 3.7, seed * 1.3) * 10)
        tint = C_TRAY_GREY if k < 6 else (C_TRAY_WHITE if k < 8 else C_TRAY_BEIGE)
    bx(name, (TRAY_L, TRAY_W, TRAY_H), (cx, cy, cz + TRAY_H / 2), TRAY, tint, 0.004, yaw)
    if not open_tray:
        # [USBR-GFM]: at the drill site boxes are "kept covered with lids".
        bx(name + '-lid', (TRAY_L - 0.010, TRAY_LID_W, TRAY_LID_H),
           (cx, cy, cz + TRAY_H + TRAY_LID_H / 2), TRAY, C_LID, 0.003, yaw)
        return

    ca, sa = math.cos(YAW + yaw), math.sin(YAW + yaw)

    def local(u, v, w):
        """tray-local (along, across, up) -> world."""
        return (cx + ca * u - sa * v, cy + sa * u + ca * v, cz + w)

    pitch = TRAY_W / TRAY_ROWS               # 77 mm centres for a 55 mm channel
    wall = pitch - TRAY_CHAN_W               # 22 mm of divider, DERIVED
    # [USBR-TM] the dividers, not the core, carry the lid: "Sample channels
    # should be rigid ... and higher than the samples to help support the lid".
    for i in range(TRAY_ROWS + 1):
        v = (i - TRAY_ROWS / 2.0) * pitch
        bx('%s-wall-%d' % (name, i), (TRAY_L - 0.008, wall * 0.55, TRAY_H * 0.92),
           local(0.0, v, TRAY_H * 0.54), TRAY, C_LID, 0.0, yaw)

    for i in range(TRAY_ROWS):
        v = (i - (TRAY_ROWS - 1) / 2.0) * pitch
        fill = min(1.0, max(0.0, core + S.jitter(0.10, i * 3.1 + seed, seed)))
        if fill < 0.06:
            continue
        # A row is not one stick. Core comes up in broken runs and the breaks
        # are what a geologist logs; three runs per row, with the gaps.
        run0 = -TRAY_L / 2 + 0.010
        span = (TRAY_L - 0.020) * fill
        for k in range(3):
            seg = span / 3.0
            gap = 0.008 + 0.014 * S.rnd(k * 5.7 + i + seed, seed * 1.7)
            u0, u1 = run0 + k * seg + gap * 0.5, run0 + (k + 1) * seg - gap * 0.5
            if u1 - u0 < 0.02:
                continue
            tint = C_CORE[int(S.rnd(k * 2.3 + i * 7.1 + seed, seed) * 3) % 3]
            stick('%s-core-%d-%d' % (name, i, k), NQ_CORE_D / 2,
                  local(u0, v, TRAY_H * 0.52), local(u1, v, TRAY_H * 0.52),
                  ROCK, tint, sides=7)

    # [USBR-102D9] a painted white spacer block at every run boundary, and a
    # fluorescent-orange block whose LENGTH IS THE CORE LOSS. Both are nailed
    # down [USBR-GFM]; both are 1-inch nominal clear lumber.
    for b in range(blocks):
        u = -TRAY_L / 2 + 0.09 + b * (TRAY_L - 0.20) / max(1, blocks - 1)
        bx('%s-block-%d' % (name, b), (BLOCK_SQ, TRAY_W - 0.018, BLOCK_SQ),
           local(u, 0.0, TRAY_H * 0.62), TIMBER, C_BLOCK_WHITE, 0.0, yaw)
    if loss:
        bx('%s-loss' % name, (0.185, LOSS_SQ, LOSS_SQ),
           local(0.24, -(TRAY_ROWS - 1) / 2.0 * pitch, TRAY_H * 0.55),
           TIMBER, C_BLOCK_LOSS, 0.0, yaw)


def dunnage(name, p0, p1, tint=C_DUNNAGE):
    """A ground-contact timber bearer.

    [USBR-GFM] is the sentence this whole laydown is built on: "At the drill
    site, core boxes should be lined up, PREFERABLY ON BOARDS OR PLANKS, in
    order from top to bottom, with labels and up side to left, in a safe area
    and kept covered with lids."

    NOT SOURCED: the plank's section. No source dimensions pad dunnage; 150 mm
    is a sawn timber a crew would actually carry. Set 40 mm INTO the ground —
    see the module docstring on why this file sinks its footings.
    """
    d = Vector(p1) - Vector(p0)
    mid = (Vector(p0) + Vector(p1)) * 0.5
    return bx(name, (d.length, 0.150, 0.150), (mid.x, mid.y, 0.035),
              TIMBER, tint, 0.010, math.atan2(d.y, d.x) - YAW)


# ═════════════════════════════════════════════════════════════════════════════
# THE COMPOSITION
# ═════════════════════════════════════════════════════════════════════════════

# ── WHERE EVERYTHING STANDS, AND WHY IT IS NOT WHERE YOU WOULD PUT IT ────────
# The free, visible, unoccupied ground on this archetype is a CRESCENT, not a
# yard. Three things eat it: the machine plus its sourced 3 m clearance owns an
# 8.89 x 12.65 m rectangle over the collar; terrain.js's universal kit owns
# seven more footprints, two of them (the rod racks) dead centre of frame at
# depth 22; and the hero camera is only 7.2 m wide at the collar and 14 m wide
# at depth 27. What was left was SEARCHED rather than composed by eye -- the
# search and its map are in research/sites/exploration-pad.md -- and these are
# its answers, in (depth along the hero axis, offset to screen-right) metres,
# with the screen fraction u each lands at (-1 .. +1 is the frame).
# OCCLUSION IS PART OF THE SEARCH, AND IT WAS FOUND BY LOOKING.
# The hero eye is 2.25 m up, so a nearer object hides a further one whenever
# h_near / d_near > h_far / d_far. The trestle is 0.90 m at depth 18.6, so
# NOTHING under 1.26 m at depth 26 clears it. The first two renders lost the
# whole core laydown behind it and put the sump behind a pile and a timber
# stack. What follows is the third arrangement, and every group either clears
# what is in front of it or is deliberately the low band behind it.
AT_TRESTLE = (18.60, -2.85)     # u -0.59   r 6.3 m from the collar
AT_LAYDOWN = (26.50, -3.30)     # u -0.48   r 13.5   the low band behind it
# Two piles. Two more were built and deleted after looking at the render: one
# solved at u -0.10, depth 27, which is directly BEHIND the 12.267 m machine
# standing at depth 12; the other at u +0.76, depth 23, which stood exactly in
# front of the sump. Both were geometry nobody would ever have seen.
#   the LEFT pile is 11 layers, 1.43 m -- above the 1.26 m that clears the
#     trestle at that depth, and under the 1.50 m [ON-STANDARDS] allows.
#   the RIGHT pile is 5 layers, 0.81 m -- deliberately LOW, because at depth
#     20.9 anything over 1.29 m hides the sump's 1.25 m bank behind it.
AT_PILE = ((25.60, -5.85, 11),  # u -0.87   r 13.5   (depth, offset, layers)
           (20.90, +3.30, 5))   # u +0.60   r 8.1
AT_SUMP = (25.90, +4.75)        # u +0.69   r 12.7 -- spills past the right edge
AT_CRIB = (21.00, +4.60)        # u +0.84   r 8.2
AT_PEGS = ((17.15, -3.30), (21.05, -3.75), (24.35, -5.05))
AT_SPARE = (20.05, -4.45)
AT_OFFCUTS = (22.90, +5.10)


def laydown():
    """THE CORE LAYDOWN — two runs of trays on planks, being filled.

    [USBR-GFM], the sentence this whole group is built on and quoted in full in
    `dunnage()`: boxes at the drill site are "lined up, preferably on boards or
    planks, in order from top to bottom ... and kept covered with lids".

    The last three trays of the near run are open and part full, so this reads
    as a pad MID-SHIFT rather than as a photograph of somebody's finished job.
    """
    pitch = TRAY_W + 0.030          # NOT SOURCED: hand-laid, not a rack pitch
    n = 6
    d_mid, a_mid = AT_LAYDOWN
    for run in range(2):
        d0 = d_mid + (run - 0.5) * 1.10
        a0 = a_mid - (n - 1) * pitch / 2.0
        p_start = at(d0, a0 - 0.25)
        p_end = at(d0, a0 + (n - 1) * pitch + 0.25)
        for side in (-0.36, 0.36):
            dunnage('laydown-plank-%d-%s' % (run, 'a' if side < 0 else 'b'),
                    p_start + AXIS * side, p_end + AXIS * side)
        for i in range(n):
            p = at(d0, a0 + i * pitch, 0.110)
            is_open = (run == 0 and i >= n - 3)
            tray('laydown-%d-%d' % (run, i), (p.x, p.y, p.z),
                 yaw=math.pi / 2 + S.jitter(0.030, i + run * 17, 3.0),
                 open_tray=is_open,
                 core=(0.96 if i == n - 3 else 0.62 if i == n - 2 else 0.0) if is_open else 0.0,
                 blocks=(3 if is_open else 0), loss=(is_open and i == n - 3),
                 seed=i + run * 17)


def piles():
    """CROSS-PILED FULL TRAYS waiting to go out, built to the rules.

    Three rules, all sourced, all geometry here rather than prose:
      [MB-BMP13] cross-stacked; the bottom layer 15-45 cm off the ground on
                 SOLID FOOTINGS; at least one inch between boxes in a layer.
      [ON-STANDARDS] Part III §1.4, a hard limit rather than guidance: core
                 left on an exploration site is cross-piled "to a height not
                 exceeding 1.5 metres".
    A layer is three trays side by side, about 1.07 x 1.23 m; the next layer is
    the same three turned 90 degrees. That is what cross-piling IS, and it is
    why a pile comes out roughly square in plan whatever the tray's aspect.

    NOT SOURCED: the number of layers. The 30-high and 60-per-pallet figures
    that do exist are a lumber-strength claim and a packing claim, not pad
    practice — so the count is an art choice, and every column asserts its own
    finished height against the sourced ceiling instead of against a guess.
    """
    step = TRAY_H + TRAY_LID_H + STACK_GAP
    for c, (d0, a0, layers) in enumerate(AT_PILE):
        top = STACK_LIFT + layers * step
        if top > PILE_MAX_H:
            raise AssertionError(
                'exploration_pad: pile %d finishes at %.2f m against the %.2f m '
                'ceiling in [ON-STANDARDS] Part III 1.4.' % (c, top, PILE_MAX_H))
        base = at(d0, a0)
        for u in (-0.42, 0.42):                  # "solid footings" [MB-BMP13]
            for v in (-0.42, 0.42):
                f = base + AXIS * u + RIGHT * v
                bx('pile-footing-%d-%d' % (c, int(u > 0) * 2 + int(v > 0)),
                   (0.22, 0.22, STACK_LIFT + 0.06),
                   (f.x, f.y, STACK_LIFT / 2 - 0.030), TIMBER, C_DUNNAGE, 0.008)
        for k in range(layers):
            z = STACK_LIFT + k * step
            across = (k % 2) == 1
            for j in range(3):
                # the three trays of a layer sit side by side ACROSS their own
                # width, so the offset axis is whichever one the tray's LENGTH
                # is not lying along.
                off = (j - 1) * (TRAY_W + STACK_GAP)
                wob = S.jitter(0.018, c * 13 + k * 3 + j, 11.0)
                p = base + (AXIS if across else RIGHT) * off + RIGHT * wob
                tray('pile-%d-%d-%d' % (c, k, j), (p.x, p.y, z),
                     yaw=(0.0 if across else math.pi / 2) + wob * 0.4,
                     open_tray=False, seed=c * 31 + k * 5 + j)


def logging():
    """THE LOGGING TRESTLE — an open tray at working height, being logged.

    [DISCOVERER-TRESTLE]: two A-frames 900 mm high, 960 wide and 930 deep
    carrying two 3.25 m rails, "Weight rated to 450kg" — which is ten loaded
    trays at the 45 kg of [DISCOVERER-RACK], so the rating and the object agree.

    This is the nearest group on the pad, at hero depth 18.6 m, because it is
    the one that has to be READABLE: a 1.065 m tray is 10.9 % of the frame
    width here against 7.8 % out at the laydown. The trestle is what tells the
    player what the trays further back ARE.
    """
    d_mid, a_mid = AT_TRESTLE
    base = at(d_mid, a_mid)
    span = (TRESTLE_RAIL_L - 1.40) / 2.0             # the two A-frames
    for u in (-span, span):
        c = base + RIGHT * u
        for w in (-1, 1):                            # the A of the A-frame
            for side in (-1, 1):
                f = c + AXIS * (w * TRESTLE_D / 2) + RIGHT * (side * TRESTLE_W / 2)
                h = c + RIGHT * (side * 0.055)
                stick('trestle-leg', 0.030, (f.x, f.y, -0.055),
                      (h.x, h.y, TRESTLE_H - 0.045), TIMBER, C_TIMBER, sides=6)
        bx('trestle-brace', (TRESTLE_W - 0.08, 0.055, 0.055),
           (c.x, c.y, TRESTLE_H * 0.40), TIMBER, C_TIMBER, 0.005, math.pi / 2)
        bx('trestle-head', (TRESTLE_W - 0.12, 0.075, 0.070),
           (c.x, c.y, TRESTLE_H - 0.030), TIMBER, C_TIMBER, 0.006, math.pi / 2)
    # the two rails, at the sourced 50NB section, drawn in timber (see above)
    for w in (-1, 1):
        r0 = base + RIGHT * (-TRESTLE_RAIL_L / 2) + AXIS * (w * 0.30)
        r1 = base + RIGHT * (TRESTLE_RAIL_L / 2) + AXIS * (w * 0.30)
        stick('trestle-rail-%d' % int(w > 0), TRESTLE_RAIL_D / 2,
              (r0.x, r0.y, TRESTLE_H), (r1.x, r1.y, TRESTLE_H), TIMBER, C_DUNNAGE, 7)

    # [DISCOVERER-TRESTLE] rates this trestle at 450 kg and [DISCOVERER-RACK]
    # puts a loaded tray at 45 kg, so it carries ten. Two is not a load; the
    # check exists so that a later edit which piles trays onto it has to notice.
    on_trestle = 2
    if on_trestle * TRAY_FULL_KG > 450.0:
        raise AssertionError(
            'exploration_pad: %d trays on the trestle is %.0f kg against the '
            '450 kg it is rated for [DISCOVERER-TRESTLE].'
            % (on_trestle, on_trestle * TRAY_FULL_KG))

    z = TRESTLE_H + TRESTLE_RAIL_D / 2
    p = base + RIGHT * (-0.62) + Vector((0, 0, z))
    tray('logging-tray', (p.x, p.y, p.z), yaw=0.0, open_tray=True,
         core=0.90, blocks=4, loss=True, seed=101, tint=C_TRAY_GREY)
    q = base + RIGHT * 0.62 + Vector((0, 0, z))
    tray('logging-next', (q.x, q.y, q.z), yaw=0.0, open_tray=True,
         core=0.24, blocks=1, seed=102, tint=C_TRAY_WHITE)


def sump():
    """THE SUMP — the feature no other archetype has, and the wettest thing here.

    12 x 6 x 3 ft, helicopter-supported [STIBNITE]; one side laid back as a
    fauna-egress ramp [STIBNITE], [NT-AA7029]; barricaded [WORKSAFEWA]; UNLINED
    [YUKON-BMP], [BC-HANDBOOK]; with the excavated material pushed up beside it
    [CME-DMIRS]. It sits 12.8 m from the collar, out of the working area:
    [BLY-PAD] wants it "near rig, hole and mud tank" with "space between
    splitter and sump and return hose", and [BC-HANDBOOK] §11.4.2 puts it "on
    the downslope side of the pad".

    WHAT IS AND IS NOT MODELLED. The EXCAVATION is terrain — `site.py` is
    explicit that a shape belonging in `heightAt()` does not belong in a site
    .glb — so this is the pit's FURNITURE: the push-up on three sides, the
    ramped fourth side, the barricade, the return line arriving and the suction
    line leaving. The water is one quad 30 mm over grade INSIDE the push-up,
    6.7 m2, which IS the sump and is not a decorative floor over the terrain.
    The research doc asks for the depression in `heightAt()`; the model reads as
    a shallow sump without it and as a real one with it.

    THE BIOME COMPROMISE LIVES HERE, and now only here: the push-up and the
    ramp are `dirt` at an authored neutral tint, where terrain.js would give
    the same spoil `region.spoil`.
    """
    d_mid, a_mid = AT_SUMP
    base = at(d_mid, a_mid)

    def loc(u, v, w=0.0):
        """(depth from the sump centre, offset to screen-right) -> world."""
        p = base + AXIS * u + RIGHT * v
        return (p.x, p.y, w)

    # the water, 3.658 x 1.829 m, lying across the frame
    bx('sump-water', (SUMP_L, SUMP_W, 0.012), loc(0, 0, 0.030), EARTH, C_SUMP_WATER)

    # THE PUSH-UP -- and ITS SIZE IS ARITHMETIC, NOT TASTE.
    #
    # The sourced excavation is 3.658 x 1.829 x 0.914 m = 6.11 m3 in situ, and
    # that material has to be somewhere: [CME-DMIRS] calls it "excavated sump
    # push-up" and counts it as part of the pad's footprint, while
    # [BC-HANDBOOK] §11.4.2 says spoil is saved "nearby in low mounds" on ONE
    # side rather than ringed evenly. So the far bank carries most of it and
    # the flanks are low:
    #     far bank   4.60 m long x 1.04 m wide, triangular  ->  2.99 m3 at 1.25 m
    #     flanks     1.83 m long x 0.66 m wide, x2          ->  0.89 m3 at 0.74 m
    #     ramp wedge (below)                                ->  about 0.7 m3
    # ~4.6 m3 of the 6.11, the rest spread and walked into the pad. Bulking is
    # IGNORED -- loose ground takes 20-30 % more room than it did in situ -- so
    # this is the low estimate rather than an invented one.
    #
    # The FIRST hero render had this berm at 0.40 m and the sump was invisible:
    # from a 2.25 m eye 26 m away a flat quad on the ground subtends nothing.
    # The bank standing BEHIND the water is what makes a pit read as a pit, and
    # it is also what the source says is there.
    BERM_H, FLANK_H = 1.25, 0.74
    for i in range(11):
        t = (i / 10.0 - 0.5) * (SUMP_L + 0.94)
        k = 0.60 + 0.44 * math.sin((i / 10.0) * math.pi)      # a heap, not a wall
        pushup('sump-pushup-far-%d' % i,
               loc(SUMP_W / 2 + 0.52, t, BERM_H * k * 0.42),
               (1.04, 0.88, BERM_H * k), 0.44, 31.0 + i * 1.9)
    for w in (-1, 1):
        for i in range(5):
            t = (i / 4.0) * SUMP_W - 0.28
            k = 0.58 + 0.40 * math.sin((i / 4.0) * math.pi)
            pushup('sump-pushup-side-%d-%d' % (int(w > 0), i),
                   loc(SUMP_W / 2 - t, w * (SUMP_L / 2 + 0.33), FLANK_H * k * 0.40),
                   (0.72, 0.66, FLANK_H * k), 0.34, 47.0 + i * 2.3 + w)
    # THE RAMP: "at least one side ... constructed at a shallow grade to create
    # a ramp for egress in the event wildlife enters the sump" [STIBNITE], and
    # [NT-AA7029] makes fauna egress mandatory. The grade itself belongs to the
    # excavation, which is terrain's; this is the graded lip above it.
    # Drawn as one wedge rather than a flight of slabs: the first render made
    # three stacked boxes read as steps, which is the opposite of a ramp.
    # It is a low graded APRON, not a bank. Measured off the second render: the
    # eye is 2.25 m up and the water is 30 mm over grade at 26 m, so anything
    # over about 0.10 m standing between them hides the sump completely. An
    # earlier version put a 0.44 m wedge there and the pit vanished behind its
    # own ramp. The grade itself belongs to the excavation, which is terrain's.
    for i in range(4):
        t = i / 3.0
        bx('sump-ramp-%d' % i, (SUMP_L * (0.52 - t * 0.11), 0.34, 0.11 - t * 0.06),
           loc(-SUMP_W / 2 - 0.18 - i * 0.30, 0.0, (0.11 - t * 0.06) * 0.40 - 0.02),
           EARTH, C_BERM, 0.04)

    # BARRICADED [WORKSAFEWA] §2.3. NOT SOURCED: no source found names the
    # physical barrier, so this is a picket-and-rail line, which is what a crew
    # builds out of what it has.
    posts = ([(1.46, v) for v in (-1.55, -0.52, 0.52, 1.55)]
             + [(u, 2.26) for u in (0.05, 1.05)]
             + [(u, -2.26) for u in (0.05, 1.05)])
    for i, (u, v) in enumerate(posts):
        # driven through the push-up, so the picket stands on the crest
        cyl('sump-picket-%d' % i, 0.030, 1.30, loc(u, v, 0.30), TIMBER,
            C_TIMBER, sides=5)
        if i and i not in (4, 6):
            pu, pv = posts[i - 1]
            stick('sump-rail-%d' % i, 0.013, loc(pu, pv, 1.30), loc(u, v, 1.30),
                  TIMBER, C_TIMBER, 5)

    # THE RETURN LINE. research/02 §E4: "the core rig site is wet", and the line
    # from the machine to the sump is what says so. It leaves the working area
    # at the nearest point outside the rig envelope + 3 m and drops over the
    # ramp — [BLY-PAD] asks for exactly that clearance for the return hose.
    draped('sump-return', [at(20.00, 2.72, 0.09), at(22.60, 4.90, 0.08),
                           Vector(loc(-SUMP_W / 2 - 0.75, -0.30, 0.52)),
                           Vector(loc(-SUMP_W / 2 + 0.35, -0.30, 0.14))],
           0.038, C_HOSE)

    # THE SUCTION LINE back out toward the pump, which lives on its own pad at
    # the water source and is off this plot entirely: [MB-BMP11] caps a pump pad
    # at 400 m2 and holds it 30 m back from the water. [MB-BMP11] and [BC-NOW]
    # both require a screened intake to the DFO end-of-pipe guideline; NOT
    # SOURCED: that screen's mesh, so the strainer is drawn as a plain body.
    draped('sump-suction', [Vector(loc(0.15, -0.85, 0.05)),
                            Vector(loc(SUMP_W / 2 + 0.20, -SUMP_L / 2 - 0.20, 0.86)),
                            Vector(loc(SUMP_W / 2 + 0.95, -SUMP_L / 2 - 0.75, 0.24)),
                            at(27.90, 1.20, 0.11)], 0.030, C_SUCTION)
    cyl('sump-strainer', 0.070, 0.32, loc(-0.20, -0.85, 0.02), HOSE, C_SUCTION,
        sides=8, rot=(0, math.pi / 2, YAW))


def markers():
    """THE HOLE PEGS, THE CACHED CRIB TIMBERS AND THE PAD'S SMALL EVIDENCE.

    Every hole is pegged and numbered before it is collared and the peg
    outlives the rig: [ON-STANDARDS] Part III §1.2 requires that "all drill hole
    locations where casings are not removed must be marked with durable
    reflective markers which are clearly visible in all seasons", and
    [MB-BMP11] has the casing cut to "15 cm or less above ground level at the
    conclusion of operations". Three pegs means this is not the crew's first
    hole on this pad. NOT SOURCED: the peg's own dimensions; drawn as a
    hand-cut picket with a tag, which is what a line crew carries.

    The cached timbers are the other half of [MB-BMP11]'s PREFERRED pad
    preparation — "clearing the trees and then cribbing the drill rig on
    timbers or lumber (no ground disturbance necessary)" — and [BC-BOND] bills
    "caching of timbers to one or two centralized locations ... 2 loads per
    pad" at decommissioning. They are why this pad has no cut earth under the
    machine.
    """
    for i, (d, a) in enumerate(AT_PEGS):
        cyl('hole-peg-%d' % i, 0.026, 1.20, at(d, a, -0.18), TIMBER, C_TIMBER, sides=5)
        q = at(d, a, 0.88)
        bx('hole-peg-tag-%d' % i, (0.022, 0.140, 0.100), (q.x, q.y, q.z),
           TIMBER, C_BLOCK_WHITE, 0.0, S.jitter(0.5, i, 3))

    # Two layers, not five. At depth 21 a five-high stack reads as a wall in
    # front of the sump; the sourced object is a CACHE of timbers waiting to be
    # flown out, and a cache is low.
    d0, a0 = AT_CRIB
    for k in range(2):
        for j in range(3):
            p = at(d0, a0) + RIGHT * ((j - 1) * 0.285)
            bx('crib-timber-%d-%d' % (k, j), (2.02, 0.19, 0.19),
               (p.x, p.y, 0.055 + k * 0.196), TIMBER, C_DUNNAGE, 0.013,
               math.pi / 2 + S.jitter(0.03, k * 3 + j, 17))

    # Two trays carried off the trestle and set down, and the offcuts a crew
    # always leaves. Free in draw calls, and they break the tidiness.
    d0, a0 = AT_SPARE
    p = at(d0, a0, 0.018)
    tray('spare-tray-0', (p.x, p.y, p.z), yaw=0.22, open_tray=False, seed=7)
    p = at(d0 + 0.06, a0 + 0.04, 0.018 + TRAY_H + TRAY_LID_H + 0.006)
    tray('spare-tray-1', (p.x, p.y, p.z), yaw=-0.09, open_tray=False, seed=8)
    d0, a0 = AT_OFFCUTS
    for i in range(5):
        p = at(d0 + S.jitter(0.30, i, 21), a0 + S.jitter(0.34, i, 22), 0.05)
        bx('offcut-%d' % i, (0.50 + 0.28 * S.rnd(i, 31), 0.10, 0.10),
           (p.x, p.y, p.z), TIMBER, C_DUNNAGE, 0.008, S.jitter(1.4, i, 23))


# ═════════════════════════════════════════════════════════════════════════════
# BUILD
# ═════════════════════════════════════════════════════════════════════════════

def violation(tx, tz):
    """Why this world point (three.js x, z) may not carry site geometry."""
    r = math.hypot(tx, tz)
    if r < COLLAR_CLEAR:
        return 'inside the live collar spoil ring and puddle (r < %.2f m)' % COLLAR_CLEAR
    if r > BUILD_R:
        return ('outside the declared flat (r %.2f > %.2f m): it would stand on '
                'un-flattened ground' % (r, BUILD_R))
    if (RIG_X0 - CLEAR_M) < tx < (RIG_X1 + CLEAR_M) \
            and (RIG_Z0 - CLEAR_M) < tz < (RIG_Z1 + CLEAR_M):
        return 'inside the rig envelope + %.1f m clearance [BLY-PAD]' % CLEAR_M
    if BARRIER_R - BARRIER_HALF < r < BARRIER_R + BARRIER_HALF \
            and BARRIER_A0 < math.atan2(tz, tx) < BARRIER_A1:
        return "inside terrain.js's hazard-barrier arc at r 5.4"
    for px, pz, hx, hz, nm in PROPS:
        if abs(tx - px) < hx and abs(tz - pz) < hz:
            return 'inside the universal site kit\'s "%s"' % nm
    return None


def build(out_path):
    S.reset()
    laydown()
    piles()
    logging()
    sump()
    markers()

    # ── VERIFY BY MEASUREMENT, NOT BY THE ABSENCE OF AN ERROR (ASTRA §10) ────
    # Every authored vertex, in world space, before any material join. This is a
    # KEEP-CLEAR assertion against terrain.js's own geometry and a colour-
    # attribute completeness check. It measures no dimensions and is not a
    # second ruler (ASTRA §5) — `tools/glbinfo.mjs` remains the only one.
    bpy.context.view_layer.update()
    worst_u = worst_r = 0.0
    checked = meshes = 0
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        meshes += 1
        if not o.data.color_attributes:
            raise AssertionError(
                'exploration_pad: "%s" has no colour attribute. terrain.js '
                'siteMaterial() decides vertexColors PER JOINED MESH, so one '
                'uncoloured object joined into a coloured group renders pure '
                'white with nothing in the log.' % o.name)
        for v in o.data.vertices:
            p = o.matrix_world @ v.co
            checked += 1
            tx, tz = p.x, -p.y
            why = violation(tx, tz)
            if why:
                raise AssertionError(
                    'exploration_pad: "%s" has a vertex at three.js (%.2f, %.2f) '
                    '%s' % (o.name, tx, tz, why))
            u, _ = screen_u(p.x, p.y)
            worst_u, worst_r = max(worst_u, abs(u)), max(worst_r, math.hypot(tx, tz))
    # A gate over an empty set passes forever (ASTRA §10). This floor is not a
    # target — it is the point below which the check has plainly stopped seeing
    # the model, e.g. because a group was commented out during editing.
    if meshes < 200 or checked < 5000:
        raise AssertionError(
            'exploration_pad: the keep-clear check saw only %d vertices across '
            '%d meshes, which cannot be right.' % (checked, meshes))
    print('PAD_CHECK meshes=%d vertices=%d max_collar_r=%.2f flat_r_required=%.1f '
          'max_screen_u=%.2f' % (meshes, checked, worst_r, FLAT_R, worst_u))

    # The origin IS the collar (site.py AXES): terrain.js drops the model at
    # (0,0,0) with no offset, so this anchor documents the contract rather than
    # moving anything.
    S.anchor('site-collar', (0, 0, 0))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    return S.finish(out_path, budget=5)


# ═════════════════════════════════════════════════════════════════════════════
# PREVIEW — re-imports the REAL export. No proxy geometry, no game renderer.
# ═════════════════════════════════════════════════════════════════════════════

def preview(path, tag='hero'):
    """Render the exported .glb with Cycles on the CPU.

    THIS IS AN OFFLINE BLENDER RENDER AND NOTHING ELSE. The sky, the key light,
    the ground plane and the exposure are inspection fixtures invented in this
    function. They do not reproduce assets.js's procedural materials, env.js's
    light rig or renderer.js's grade pass, and a frame from here must never be
    presented as a capture of the game.

    The `hero` camera stands at the REAL hero eye (renderer.js CAMERA_MODES.hero)
    with its real 34-degree vertical field and the real 780x911 band aspect, so
    what it frames is what the player's frame would contain — minus the machine,
    the terrain and the region, none of which is in this file.
    """
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 24
    sc.render.threads_mode = 'FIXED'
    sc.render.threads = 4
    sc.render.resolution_percentage = 100
    sc.world = bpy.data.worlds.new('inspection-world')
    sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs[0].default_value = (.36, .45, .58, 1)
    sc.world.node_tree.nodes['Background'].inputs[1].default_value = .45
    sc.view_settings.look = 'AgX - Medium High Contrast'

    bpy.ops.object.light_add(type='AREA', location=(17.0, 18.0, 16.0))
    sun = bpy.context.object
    sun.data.energy, sun.data.shape, sun.data.size = 5200, 'DISK', 9
    sun.data.color = (1.0, .93, .82)
    sun.rotation_euler = (Vector((-6, 6, 0)) - sun.location).to_track_quat('-Z', 'Y').to_euler()

    bpy.ops.mesh.primitive_plane_add(size=90)
    gm = bpy.data.materials.new('inspection-ground')
    gm.diffuse_color = (.115, .105, .078, 1)
    bpy.context.object.data.materials.append(gm)

    if tag == 'hero':
        sc.render.resolution_x, sc.render.resolution_y = 780, 911
        cam_loc, aim, fov = Vector(EYE), Vector(LOOK), math.radians(34.0)
    else:
        sc.render.resolution_x, sc.render.resolution_y = 1500, 1000
        cam_loc, aim, fov = Vector((6.0, 22.0, 15.0)), Vector((-7.5, 7.0, 0.5)), math.radians(42.0)
    bpy.ops.object.camera_add(location=cam_loc)
    cam = bpy.context.object
    cam.rotation_euler = (aim - cam_loc).to_track_quat('-Z', 'Y').to_euler()
    cam.data.sensor_fit = 'VERTICAL'
    cam.data.angle_y = fov
    sc.camera = cam

    # The filename carries the label, because a filename is what survives a
    # screenshot being pasted into a review. This is NOT a gameplay capture.
    out = os.path.join(ROOT, 'shots',
                       'exploration-pad-offline-blender-%s.png' % tag)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('EXPLORATION_PAD_OFFLINE_BLENDER_RENDER ' + out)
    return out


if __name__ == '__main__':
    result = build(os.path.join(ROOT, 'public', 'models', 'sites', 'exploration-pad.glb'))
    if '--preview' in sys.argv:
        preview(result, 'hero')
        preview(result, 'plan')
