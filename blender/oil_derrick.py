"""
oil_derrick — offshore platform drilling package: derrick, substructure, drill floor.

In-game marque: **Havstein DR-2400 Derrickline**.  No real manufacturer name,
model designation, rig name or IADC unit identity appears in any object name,
material name or exported string (DOMAIN.md §10).  Provenance lives here, in
comments, where it belongs.

WHAT THIS MACHINE IS
--------------------
The game's rotary drilling package as it stands on a FIXED PRODUCTION PLATFORM:
a 160 ft four-legged lattice derrick on a braced box substructure, over a
surface BOP stack, with a drawworks and a top drive, and a racking board holding
20,000 ft of drill pipe as standing trebles.

It is NOT a jack-up (no legs, no spudcans, no cantilever) and NOT a drillship
(no moonpool, no riser, no heave compensation).  It skids on skid beams over a
grid of well slots.  `research/rigs/oil-derrick.md` §2.4 has the three-way table;
mixing them is the error HANDOFF §10 defect #7 is about.

THIS IS A STRUCTURE, NOT A MACHINE YOU COULD PARK, and that governs everything
below.  The two failure modes are opposite and both fatal: a derrick that reads
as a toy crane, or one so large the player cannot see the drill floor.  The
defence is that every principal dimension is printed in a source, and the two
that decide the silhouette — 160 ft on a 30 ft base, and 11 bays — now come from
TWO independent primary documents that never cite each other.

PRIMARY SOURCES
---------------
  [S1]  A filled-in IADC Standard Format Equipment List for a jack-up drilling
        unit, 66 pp., sections A-M, held at
        `C:\\Users\\henri\\Downloads\\Jack-Up-Rig-IADC-List-30-JAN-2022.pdf`.
        Cited by its own section numbers (§B.1.1 etc.).  The drilling PACKAGE on
        it — derrick, substructure, hoisting, rotating, BOP — is the same
        package a platform carries; only the thing underneath differs.  The rig
        identity is withheld in the document itself pending an NDA and is
        deliberately not recorded anywhere in this repo.
  [S2]  "Wind Loads in Drilling Structures", Stress Engineering Services Inc.,
        report PN1996301, December 2001, prepared for the US minerals regulator's
        Technical Assessment Program (TAP file 374aa).  Retrieved 2026-09-05 from
        https://www.bsee.gov/sites/bsee.gov/files/tap-technical-assessment-program//374aa.pdf
        Chapter 4 documents a worked "best practice" derrick of EXACTLY the [S1]
        class — 160 ft clear height on a 30 ft square base — and, unlike [S1],
        describes how it is BUILT.  Chapter 5 reports a survey of **575 real
        derrick/mast structures**.  Page numbers below are the printed
        chapter-page numbers.
  [S3]  Offshore drilling equipment product reference guide, 80 pp., held at
        `C:\\Users\\henri\\Downloads\\Offshore_Product_Reference_Guide.pdf`.
        "Offshore Top Drives - Sheet 1 of 2" (p.6) carries DIMENSIONED general-
        arrangement drawings of four offshore top drives.  This is the document
        that closes the top-drive envelope, which `oil-derrick.md` §8 listed as
        a gap and §8.2 hoped this file would fill.  It does.
  [S4]  Manufacturer information sheets for 13-5/8 in ram and annular
        preventers, dated 9/22/20, as transcribed in `research/rigs/oil-derrick.md`
        §3.6 — the only source anywhere in the library with real BOP body sizes.
  [S5]  Chakrabarti (2005), *Handbook of Offshore Engineering* Vol. I, held at
        `C:\\Users\\henri\\Downloads\\Chakrabarti_2005_Handbook_of_Offshore_En.pdf`.
        Printed page numbers.  Used ONLY for what the package stands on — it
        contains no derrick geometry whatsoever ([S6] §8.1).
  [S6]  `research/rigs/oil-derrick.md` — the owner's reference pack for this
        machine.  §3 proportions, §4 component inventory, §8 the honest gap
        list, §9 the domain-truth warnings this model is built to answer.

THE TWO NUMBERS THAT DECIDE WHETHER THIS READS AS A DERRICK
------------------------------------------------------------
  * **Height : base width = 5.33 : 1** (160 ft on 30 ft, [S1] §B.1.1, and again
    [S2] p.19).  [S6] §3.11 calls this "the single most important number in this
    document".  The game's procedural derrick is 4.13 : 1 and reads as a pylon.
  * **Crown : base = 0.267** (8 ft on 30 ft, [S1] §B.1.1).  The derrick loses
    THREE QUARTERS of its width going up.  The procedural one loses three fifths.

AND THE THIRD, WHICH NOBODY HAD: WHERE THE TAPER STARTS
--------------------------------------------------------
[S2] p.34, verbatim:

    "In the case of the derrick, the leg batter (taper) starts above the
     racking area (~95') to provide for the pipe handling systems preferred
     by many contractors."

So a modern derrick is a PARALLEL BOX for its bottom 95 ft and tapers only over
the top 65 ft.  It is not an Eiffel-tower taper from the base — that is the 1930s
land derrick.  This one change is most of why the silhouette reads as offshore,
and it is why the setback can be a dense block rather than a wedge.

[S6] §9.A recommends keeping the game's two-rate taper curve and moving its
endpoints.  This model goes further because [S2] supersedes it with a direct
statement about the real class.  Recorded in the handover notes at the foot.

UNITS: metres.  Blender Z-up; the exporter flips to three.js Y-up.
ORIGIN: **the well centre, at platform deck level.**  The substructure rises
from z=0 and the derrick stands on top of it, so the package drops onto the
deck at y=0 with no fudge offset (rig.py contract).
AXES:  +Y = the V-door and the driller's cabin (the face the player looks in at)
       -Y = the drawworks
       +X = the racking board, fingerboard and setback  ("off-drawworks side")
       -X = the top-drive torque track and dolly rails   ("off-drillers side")
Both of those quoted sides are [S2] p.19; putting the V-door at +Y so the game
camera looks into the floor is a LAYOUT choice and is flagged as one below.
"""

import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import bpy                                    # noqa: E402
from mathutils import Vector, Matrix, Euler   # noqa: E402
import rig as R                               # noqa: E402


FT = 0.3048
IN = 0.0254


# ═══════════════════════════════════════════════════════════════════════════
#  DIMENSIONS.  Every line is sourced, or DERIVED with its working shown, or
#  marked NOT SOURCED.  A plausible invented number is not acceptable here
#  (HANDOFF §7 rule 5).
# ═══════════════════════════════════════════════════════════════════════════

# ── the derrick ──────────────────────────────────────────────────────────────
DER_H       = 160 * FT      # 48.768  [S1 §B.1.1] derrick height; [S2 p.19]
                            # "The derrick is 160 feet clear height".  API
                            # "clear height" is floor to the UNDERSIDE of the
                            # crown beams, which is why the water table and the
                            # gin pole sit above this figure, not inside it.
DER_BASE    = 30 * FT       # 9.144   [S1 §B.1.1] "Dimensions of base 30 x 30 ft";
                            # [S2 p.19] "a 30-foot square base".  TWO sources.
DER_CROWN   = 8 * FT        # 2.4384  [S1 §B.1.1] "Dimensions of crown 8 x 8 ft"
DER_BAYS    = 11            # [S2 p.19] "has 11 bays from bottom to top that are
                            # braced with Vee bracing".  [S6] §8 listed bay count
                            # as a real gap - "bay count is highly visible".
                            # This closes it.
TAPER_Z     = 95 * FT       # 28.956  [S2 p.34] the leg batter starts above the
                            # racking area at ~95 ft.  See the docstring.
BAYS_LOWER  = 7             # DERIVED: the 11 bays must split on a bay boundary
BAYS_UPPER  = 4             # at the taper.  7 x 4.137 m = 28.96 m = 95.0 ft and
                            # 4 x 4.953 m = 19.81 m = 65.0 ft; 7 + 4 = 11 and
                            # 4.137 + 4.953 spans = 48.77 m = 160 ft.  All three
                            # sourced numbers close simultaneously on 7 + 4.
BAY_LO      = TAPER_Z / BAYS_LOWER              # 4.137
BAY_HI      = (DER_H - TAPER_Z) / BAYS_UPPER    # 4.953
GIN_TOP     = 192 * FT      # 58.522  [S2 p.19] "a gin pole frame above the crown
                            # that extends to an elevation of 192 feet above the
                            # base of the structure".  32 ft above the clear
                            # height: the crown assembly and the gin pole
                            # together.  A gin pole is how the crown block is
                            # landed at rig-up, so it is an accessory frame, and
                            # it is modelled as one - slender, obviously not
                            # more derrick.
LEG_D       = 0.46          # NOT SOURCED as a size.  The SECTION is sourced -
LEG_BF      = 0.36          # [S2 p.19] "constructed with wide flange shapes used
                            # for legs and girts.  Angles are primarily used for
                            # bracing" - so these are I-sections, not tubes and
                            # not angles.  Depth taken at 1/20 of the 9.14 m bay
                            # width, the ordinary span/depth rule for a braced
                            # frame chord.  [S2]'s member schedule is in an
                            # appendix that did not survive text extraction.
GIRT_D      = 0.34          # NOT SOURCED, same basis, one size down from the leg
GIRT_BF     = 0.26
BRACE_L     = 0.20          # NOT SOURCED.  Angle leg length; [S2 p.19] gives the
BRACE_T     = 0.022         # TYPE (angle) but not the size.
VDOOR_BAYS  = 2             # DERIVED: the V-door is the unbraced part of one
                            # face.  Two bays = 8.27 m, which clears a 27.9 m
                            # stand being swung in from the ramp.  [S6] §4.1
                            # names the feature; nobody dimensions it.

# ── substructure and drill floor ─────────────────────────────────────────────
FLOOR_Z     = 28 * FT       # 8.5344  [S1 §B.1.5] drill floor height above main deck
SUB_Y       = 45.5 * FT     # 13.8684 [S1 §B.1.5] substructure length
SUB_X       = 46 * FT       # 14.0208 [S1 §B.1.5] substructure width
CLEAR_Z     = 21 * FT       # 6.4008  [S1 §B.1.5] clear height below the rotary beams
BEAM_D      = FLOOR_Z - CLEAR_Z         # 2.134 DERIVED - and it is not slack.
                                        # The lost quarter of the floor height IS
                                        # the rotary girder depth, and those
                                        # girders are visible from below ([S6] §3.11).
SUB_COL     = 0.85          # NOT SOURCED.  Substructure corner column face.
                            # [S6] §8: "Substructure type ... and its member sizes.
                            # Only the plan and heights are sourced."
SKID_SPAN   = 40 * FT       # 12.192  [S5 p.312] "Most GoM platform rigs supplied
                            # by drilling contractors would have 40 ft skid beam
                            # spacing", with the deck legs directly beneath them.
SKID_D      = 0.90          # NOT SOURCED.  [S6] §8: the skid beam SPACING is
                            # sourced, "what is still missing is the beam depth
                            # and the travel".
ROT_OPEN    = 37.5 * IN     # 0.9525  [S1 §B.4.1] rotary table maximum opening
ROT_OD      = 1.86          # NOT SOURCED.  Derived from the opening: a 37-1/2 in
                            # table carries a 650 short ton rating on a beam
                            # spread about twice the bore.  [S6] §8 does not have
                            # a rotary table plan dimension and neither does [S3].
ROT_H       = 0.60          # NOT SOURCED, same basis.
DRIP_PAN    = 3.10          # NOT SOURCED.  [S1 §B.4.1] records the drip pan as
                            # FITTED and [S6] §9.H asks for it by name; no source
                            # gives its size.  Sized to catch the table.

# ── racking board, setback and pipe ──────────────────────────────────────────
BOARD_Z     = 80 * FT       # 24.384 above the drill floor.  DERIVED from [S2 p.19]:
                            # "the racking board walls shield from elevation 80
                            # feet to 95 feet of the derrick" - a racking board
                            # wind wall stands AT the board and screens the
                            # derrickman above it, so the board is at the bottom
                            # of that band and the taper starts at its top.
WALL_R_Z0   = 80 * FT       # 24.384  [S2 p.19] racking board wind wall, bottom
WALL_R_Z1   = 95 * FT       # 28.956  [S2 p.19] racking board wind wall, top
WALL_F_H    = 15 * FT       # 4.572   [S2 p.19] "The drill floor wind wall shields
                            # the bottom 15 feet of the derrick."  Note [S1 §B.1.6]
                            # records rig floor windbreaks FITTED and no derrick
                            # wind wall - the floor is screened, the lattice is
                            # not.  [S6] §4.1 warns that getting this the wrong
                            # way round is a common error.  Both walls here are
                            # the ones the sources actually name.
JOINT_L     = 30.5 * FT     # 9.2964  [S1 §D.1.3] DERIVED in [S6] §3.3 from the
                            # form's own 9,000 ft in 295 joints.  API Range 2.
STAND_L     = 3 * JOINT_L   # 27.889  a TREBLE.
                            # WHICH STAND LENGTH THIS RIG RACKS was the open
                            # question in [S6] §8 - the IADC form has no field
                            # for it.  The racking board height settles it: a
                            # stand stands on the setback floor and leans into
                            # the fingers near its top, so a board at 24.38 m
                            # can only be serving a stand appreciably longer
                            # than that.  A double is 18.6 m and would leave the
                            # board 5.8 m ABOVE the pipe.  A treble is 27.9 m and
                            # puts 3.5 m of pipe above the fingers, which is what
                            # a fingerboard photograph shows.  Trebles.
RACK_FT     = 20000         # [S1 §B.1.2] racking platform capacity, 5 in drill pipe
N_STANDS    = 219           # DERIVED: 20,000 ft / 91.5 ft = 218.6.
DP_OD       = 5 * IN        # 0.127   [S1 §D.1.3] 5 in OD, G-105, 19.50 lb/ft
TJ_OD       = 6.625 * IN    # 0.16828 [S1 §D.1.3] tool joint 6-5/8 in OD, 4-1/2 IF
DC_OD       = 9.5 * IN      # 0.2413  [S1 §D.1.7] 9-1/2 in spiral drill collar
DC_STANDS   = 5             # DERIVED: [S1 §B.1.2] 465 ft of 8 in DC / 91.5 ft
STAND_PITCH = 0.235         # DERIVED: the slot pitch cannot be less than the
                            # 0.168 m tool joint plus a latch; 0.235 m is that
                            # plus 40%.  [S2 p.19] gives the example derrick's
                            # racking areas as "two 6 by 6.5 foot rectangular
                            # shape areas ... 5 foot apart", which is a smaller
                            # setback than THIS rig's 20,000 ft; this board is
                            # sized to its own sourced capacity, not to that one.
ROW_PITCH   = 0.360         # DERIVED: fingers must pass between the rows.

# ── hoisting ─────────────────────────────────────────────────────────────────
SHEAVE_D    = 52 * IN       # 1.3208  [S1 §B.3.1/2] crown AND block, grooved 1-3/8.
                            # They are the SAME diameter; the blocks differ in
                            # count and frame, not in wheel size ([S6] §3.11).
CROWN_SHV   = 7             # [S1 §B.3.1] "6 + 1" - six working plus the fast line
BLOCK_SHV   = 6             # [S1 §B.3.2]
MAX_LINES   = 12            # [S1 §B.1.1].  6 block sheaves x 2 = 12.  This is
                            # arithmetic, not styling: four block sheaves would
                            # draw an 8-line rig and throw away 27% of the
                            # sourced line pull ([S6] §9.D).
LINE_D      = 1.375 * IN    # 0.034925 [S1 §B.3.5] 6x19(S) IWRC EIPS drilling line
SHV_PITCH   = 0.175         # NOT SOURCED.  Wheel-to-wheel pitch on the shaft.
                            # [S6] §8: "Crown block and travelling block frame
                            # dimensions ... overall height and width are not"
                            # sourced.  Derived from the 1-3/8 in groove plus
                            # flange and bearing spacing.
DRUM_D      = 30 * IN       # 0.762   [S1 §B.2.1] drawworks drum 30 x 58 in,
DRUM_L      = 58 * IN       # 1.4732  grooved for 1-3/8 in line
DW_L        = 5.20          # NOT SOURCED.  [S6] §8 and §8.2: "Drawworks, mud pump
DW_W        = 3.05          # and SCR house external dimensions.  Power, drum size
DW_H        = 2.55          # and flow are sourced; the boxes around them are not."
                            # [S3] prints a "Dimensions (LxWxH)" row on every
                            # drawworks sheet and leaves the VALUE blank on all
                            # six, so it is not there either.  Derived from the
                            # sourced drum: a 0.762 x 1.473 m grooved drum plus
                            # its brake discs, its two drive motors in line and a
                            # walkway makes a box about 3.5 drum-lengths long.

# ── top drive.  ALL of this is [S3 p.6], the 750-ton unit, which is the closest
#    match in the document to [S1 §B.4.4]'s 500-ton / 1,130 hp / 250 rpm machine:
#    the sheet's unit is 1,150 hp and 271 rpm.  [S3] describes it as fitting "in
#    over 95% of derricks in the world today" and as suited to jack-ups and
#    platforms.  This is the gap [S6] §8 recorded as "Top drive external
#    dimensions and weight ... the physical envelope is not" sourced. ────────
TD_STACK    = 24 * FT       # 7.3152  [S3 p.6] "Stack Up Height 24 ft"
TD_BODY_H   = 6.338         # [S3 p.6] 20'-9-1/2" [6338] on the elevation
TD_TOOLJ    = 7.286         # [S3 p.6] 23'-11" [7286] to the tool joint
TD_SETBACK  = 2.311         # [S3 p.6] 91" [SETBACK] - how far the unit stands off
                            # the track, i.e. well centre to the dolly face
TD_W        = 2.263         # [S3 p.6] 89.1" on the plan view
TRACK_SPAN  = 108 * IN      # 2.7432  [S3 p.6] 108" [SPACING REF.] on all four
                            # units on the sheet - the guide dolly rail centres,
                            # and therefore the width of the torque track that
                            # runs the full height of the derrick.  [S1 §B.3.7]
                            # confirms this rig has "track and dolly" guidance.
TD_TORQUE   = 61.7          # [S1 §B.4.4] 45,500 ft-lb max continuous
TD_RPM      = 250           # [S1 §B.4.4]

# ── rotating and the BOP ─────────────────────────────────────────────────────
ANN_H       = 1.375         # [S4] annular, 13-5/8 in 5K, 54.125 in
DBL_H       = 1.692         # [S4] double ram, 13-5/8 in 10K, 66.625 in
SGL_H       = 1.059         # [S4] single ram, 13-5/8 in 10K, 41.688 in
RAM_L       = 2.899         # [S4] 114.125 in, bonnets CLOSED.  A ram preventer is
                            # WIDER THAN IT IS TALL - model it as a block, never
                            # as a cylinder ([S6] §9.F).
RAM_W       = 1.85          # NOT SOURCED.  [S4] gives height and length only.
BOP_BORE    = 13.625 * IN   # 0.346   [S1 §E.3.1-4] 13-5/8 in stack
WELLHEAD_OD = 13.375 * IN   # 0.3397  casing head; matches the game's own
                            # buildOilDerrick call (casingOdMm 339.7)

# ── deck furniture ───────────────────────────────────────────────────────────
CAB_W, CAB_Y, CAB_H = 3.20, 2.40, 2.90    # NOT SOURCED.  [S6] §4.3 names the
                                          # driller's console/doghouse; no source
                                          # dimensions it.  Sized as a two-man
                                          # console cabin with a full-height
                                          # window wall onto the well.
TONG_L      = 1.98          # [S6] §4.3, from the rotary handling tool catalogue:
                            # a manual tong of this class is 1.84-1.98 m overall
TONG_A      = 1.53          # and 1.44-1.53 m jaw to lever end.
LINK_L      = 22 * FT       # 6.7056  [S1 §D.2.13] 3-1/2 in x 22 ft elevator links,
                            # rated 500 short ton
STANDPIPES  = 2             # [S1 §F.1.4] TWO standpipes, 3-1/16 and 5-1/8 in 10K,
SP1_OD      = 3.0625 * IN   # on an H-type manifold.  [S6] §9.H: the game runs a
SP2_OD      = 5.125 * IN    # single tube up the derrick and should run two.
AIR_RCV_L   = 3.40          # NOT SOURCED length.  [S1 §C.1.8] records a 1,060 US
AIR_RCV_R   = 0.55          # gallon air receiver ON THE RIG FLOOR.  1,060 usg =
                            # 4.013 m^3; a cylinder of r=0.55 m holding that is
                            # 4.22 m long, so 3.40 m of barrel plus dished ends
                            # is the sourced VOLUME made into a shape.
STAB_Z      = 20 * FT       # 6.096  [S1 §B.1.4] casing stabbing board, adjustable
                            # 20 ft to 43 ft above the rotary.  Parked low.

# ── walkways, rails, grating ─────────────────────────────────────────────────
RAIL_H      = 1.10          # NOT SOURCED as a figure; [S5 p.-] has zero hits for
                            # "handrail" ([S6] §8.1).  Standard offshore top rail.
KICK_H      = 0.15          # NOT SOURCED.  [S6] §4.11: "High kick plates at every
                            # floor edge and every opening."
GRATE_T     = 0.05          # NOT SOURCED.  Pressed-plank walkway thickness.


# ═══════════════════════════════════════════════════════════════════════════
#  BUILD PLUMBING
#
#  rig.finish() joins statics by material but leaves anything under a pivot: or
#  slide: node alone, and does not apply modifiers on what it absorbs.  So all
#  joining is done HERE - modifiers applied first, one weld per (owning node,
#  material) - and finish() is left with one object per bin, which its
#  len(objs) < 2 test skips.
#
#  Consequence for the budget: draw calls = (owning nodes x materials used on
#  each), NOT number of parts.  This machine is almost entirely static, so
#  detail inside a material is free.  A lattice derrick is exactly the shape
#  that blows the budget if members are left as separate objects, and exactly
#  the shape that costs nothing once they are welded.
#
#  NOTE ON rig.box(): this file assumes box() returns a box of the size asked
#  for.  It does NOT compensate for anything.  See the handover notes at the
#  foot for why, and what to check before trusting an export.
# ═══════════════════════════════════════════════════════════════════════════

_bins = {}          # (owner_name, material) -> [objects]
_order = []


def B(obj, owner, mat):
    """File a freshly built object into its weld bin."""
    key = (owner.name if owner is not None else '', mat)
    if key not in _bins:
        _bins[key] = []
        _order.append(key)
    _bins[key].append(obj)
    return obj


def _apply_mods(o):
    if not o.modifiers:
        return
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            o.modifiers.remove(m)


def weld_all():
    """Collapse every bin to one mesh. This is the draw-call budget."""
    # The templates must go FIRST. They are real mesh objects at the origin and
    # rig.finish() joins every static mesh by material, so a surviving template
    # would be silently welded into the machine as a stray plate at the well
    # centre. The stamps hold the mesh DATA, so the geometry is unaffected.
    _drop_templates()
    for key in _order:
        objs = [o for o in _bins[key] if o.name in bpy.data.objects]
        if not objs:
            continue
        for o in objs:
            if o.type == 'CURVE':
                bpy.ops.object.select_all(action='DESELECT')
                o.select_set(True)
                bpy.context.view_layer.objects.active = o
                bpy.ops.object.convert(target='MESH')
        objs = [o for o in _bins[key] if o.name in bpy.data.objects]
        for o in objs:
            _apply_mods(o)
        owner, mat = key
        # A welded mesh must NOT inherit its owner's prefix: gltfRig.js indexes
        # every node whose name starts with pivot:/slide:/mount: and would file
        # these meshes as game nodes.
        base = owner.split(':', 1)[1] if ':' in owner else owner
        name = ('%s-%s' % (base, mat)) if owner else ('static:' + mat)
        if len(objs) == 1:
            objs[0].name = name
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        bpy.context.active_object.name = name


# ── TEMPLATE AND STAMP: why this file does not call bpy.ops per part ─────────
#
# Every `bpy.ops.mesh.primitive_*_add` triggers a depsgraph update over the
# WHOLE scene, so the cost of adding the nth object grows with n.  On a lattice
# derrick with a 219-stand setback that is quadratic and it bites hard:
# MEASURED at 855 s to build this machine when every part was an ops call.
#
# So each distinct (shape, size, material) is built through rig.py's helpers
# exactly ONCE, as a hidden template, and every instance after that is a
# `bpy.data.objects.new()` sharing the template's mesh data with its own
# matrix.  bpy.data.objects.new does not touch the depsgraph, so instancing is
# flat.  The templates are deleted before the weld, and because the stamps
# reference the mesh DATA rather than the object, the geometry survives.
#
# This changes no dimension.  It is the same geometry, built a different way.
_templates = {}      # key -> mesh data
_tpl_objs = []       # the throwaway template objects


def _tpl(key, make):
    if key not in _templates:
        o = make()
        _apply_mods(o)
        _templates[key] = o.data
        _tpl_objs.append(o)
    return _templates[key]


def stamp(key, name, M, owner, mat, parent, make):
    """Instance a template into a weld bin.

    THE KEY IS SCOPED BY OWNER, and that is not tidiness. `bpy.ops.object.join()`
    appends the other objects' geometry INTO THE ACTIVE OBJECT'S MESH DATA. If
    two weld bins shared one template's data, joining the first bin would
    rewrite the second bin's mesh underneath it. The lamp housings hit this
    exactly: the same box, the same material, once on the static root and once
    on slide:carriage. Sharing inside a single bin is safe - those objects are
    all about to become one mesh anyway.
    """
    o = bpy.data.objects.new(name, _tpl(((owner.name if owner is not None else ''),) + key, make))
    bpy.context.collection.objects.link(o)
    o.matrix_basis = M
    if parent is not None:
        o.parent = parent
    return B(o, owner, mat)


def _drop_templates():
    for o in _tpl_objs:
        if o.name in bpy.data.objects:
            bpy.data.objects.remove(o, do_unlink=True)
    del _tpl_objs[:]


def _xform(loc, rot):
    return Matrix.Translation(loc) @ Euler(rot, 'XYZ').to_matrix().to_4x4()


def bx(name, size, mat, owner, parent, loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.010,
       seg=1):
    key = ('box', round(size[0], 5), round(size[1], 5), round(size[2], 5), mat,
           round(bevel, 5), seg)

    def make():
        o = R.box('__tpl', size, mat, None, (0, 0, 0), (0, 0, 0), bevel)
        if bevel > 0 and 'bev' in o.modifiers:
            o.modifiers['bev'].segments = seg
        return o
    return stamp(key, name, _xform(loc, rot), owner, mat, parent, make)


def tb(name, r, l, mat, owner, parent, loc=(0, 0, 0), rot=(0, 0, 0), sides=12):
    key = ('tube', round(r, 5), round(l, 5), mat, sides)

    def make():
        return R.tube('__tpl', r, l, mat, None, (0, 0, 0), (0, 0, 0), sides)
    return stamp(key, name, _xform(loc, rot), owner, mat, parent, make)


def hs(name, pts, r, mat, owner, parent, taut=False, sides=6):
    """A draping curve - hose, rope, drilling line, escape line.  `taut` swaps
    the AUTO handles for VECTOR ones: a hose sags and AUTO is right for it, but
    a wire rope under load is straight between sheaves and AUTO handles bow it
    metres wide."""
    o = R.hose(name, pts, r, mat, parent, sides)
    if taut:
        for bp in o.data.splines[0].bezier_points:
            bp.handle_left_type = bp.handle_right_type = 'VECTOR'
    return B(o, owner, mat)


def _frame(p0, p1, xhint):
    """An orthonormal frame with +Z along p0->p1 and +X as close to `xhint` as
    that allows.  Returns (matrix, length).  This is what lets a member be
    specified by its two END POINTS, which is how a lattice is actually
    dimensioned, instead of by a position and three Euler angles."""
    p0v, p1v = Vector(p0), Vector(p1)
    d = p1v - p0v
    L = d.length
    z = d.normalized()
    x = Vector(xhint)
    x = x - z * x.dot(z)
    if x.length < 1e-6:
        x = Vector((0, 0, 1)).cross(z)
        if x.length < 1e-6:
            x = Vector((1, 0, 0))
    x.normalize()
    y = z.cross(x)
    M = Matrix(((x.x, y.x, z.x, p0v.x),
                (x.y, y.y, z.y, p0v.y),
                (x.z, y.z, z.z, p0v.z),
                (0.0, 0.0, 0.0, 1.0)))
    return M, L


def _plate(name, size, mat, owner, parent, M, off):
    """One stamped plate, placed by a frame and a local offset.  R.box() applies
    its scale, so matrix_basis carries none and can simply be overwritten."""
    key = ('box', round(size[0], 5), round(size[1], 5), round(size[2], 5), mat,
           0.0, 1)

    def make():
        return R.box('__tpl', size, mat, None, (0, 0, 0), (0, 0, 0), 0.0)
    return stamp(key, name, M @ Matrix.Translation(off), owner, mat, parent, make)


def wf(name, p0, p1, depth, bf, mat, owner, parent, xhint=(1, 0, 0), tw=None, tf=None):
    """A WIDE FLANGE member between two points - three plates, web and two
    flanges.  [S2 p.19] is explicit that a derrick's legs and girts are wide
    flange shapes, and an I-section silhouette against the sky is a different
    thing from a tube: it catches light on two faces and goes black on the
    third.  Costs three boxes and no draw call."""
    M, L = _frame(p0, p1, xhint)
    tw = tw if tw is not None else depth * 0.075
    tf = tf if tf is not None else depth * 0.11
    for i, (sz, off) in enumerate((
            ((tw, depth - 2 * tf, L), (0, 0, L / 2)),
            ((bf, tf, L), (0,  (depth - tf) / 2, L / 2)),
            ((bf, tf, L), (0, -(depth - tf) / 2, L / 2)))):
        _plate('%s-%d' % (name, i), sz, mat, owner, parent, M, off)


def ang(name, p0, p1, leg, t, mat, owner, parent, xhint=(1, 0, 0)):
    """An ANGLE member between two points - two plates meeting at a corner.
    [S2 p.19]: "Angles are primarily used for bracing."  Two boxes."""
    M, L = _frame(p0, p1, xhint)
    for i, (sz, off) in enumerate((
            ((leg, t, L), ((leg - t) / 2, 0, L / 2)),
            ((t, leg, L), (0, (leg - t) / 2, L / 2)))):
        _plate('%s-%d' % (name, i), sz, mat, owner, parent, M, off)


def bar(name, p0, p1, r, mat, owner, parent, sides=8, square=False, xhint=(1, 0, 0)):
    """A plain round or square member between two points: rails, rods, pins,
    ladder stringers, handrail stanchions, racked pipe.

    Stamped, keyed on (radius, LENGTH, section, material) - so the 159 identical
    ladder rungs and the 219 identical stands each cost one real primitive and
    the rest are matrices."""
    M, L = _frame(p0, p1, xhint)
    if square:
        return _plate(name, (r * 2, r * 2, L), mat, owner, parent, M, (0, 0, L / 2))
    key = ('tube', round(r, 5), round(L, 5), mat, sides)

    def make():
        return R.tube('__tpl', r, L, mat, None, (0, 0, 0), (0, 0, 0), sides)
    return stamp(key, name, M, owner, mat, parent, make)


def railing(name, pts, owner, parent, h=RAIL_H, post=0.9, kick=True, mat=None):
    """A handrail run: top rail, mid rail, stanchions, and a kick plate.
    [S6] §4.11: "Handrails everywhere, broken only at the V-door and the stair
    heads", and high kick plates at every edge and opening.  On an offshore
    structure this is a small fraction of the tonnage and most of the visible
    surface, so it is worth the triangles - and it costs no draw call."""
    mat = mat or R.MAT_WORN
    for i in range(len(pts) - 1):
        a, b = Vector(pts[i]), Vector(pts[i + 1])
        seg = (b - a).length
        if seg < 1e-4:
            continue
        for dz in (h, h * 0.52):
            bar('%s-rail' % name, a + Vector((0, 0, dz)), b + Vector((0, 0, dz)),
                0.024, mat, owner, parent, sides=6)
        n = max(1, int(round(seg / post)))
        for k in range(n + (1 if i == len(pts) - 2 else 0)):
            p = a + (b - a) * (k / n)
            bar('%s-post' % name, p, p + Vector((0, 0, h)), 0.030, mat, owner,
                parent, sides=6)
        if kick:
            mid = (a + b) * 0.5 + Vector((0, 0, KICK_H / 2))
            d = (b - a)
            rz = math.atan2(d.y, d.x)
            bx('%s-kick' % name, (seg, 0.014, KICK_H), R.MAT_HAZARD, owner,
               parent, tuple(mid), (0, 0, rz), bevel=0.0)


def grate(name, x0, x1, y0, y1, z, owner, parent, mat=None, t=GRATE_T):
    """A walkway or platform panel.  Deck flooring offshore is pressed plank,
    checkered plate or bar grating ([S5 p.317], [S6] §4.11); which one it is is
    a MATERIAL question, and assets.js owns materials.  Geometry is a panel."""
    mat = mat or R.MAT_WORN
    return bx(name, (x1 - x0, y1 - y0, t), mat, owner, parent,
              ((x0 + x1) / 2, (y0 + y1) / 2, z - t / 2), bevel=0.0)


def half_at(z):
    """Half-width of the derrick at height z above the DRILL FLOOR.

    Parallel to the top of the racking area, then battered to the crown - the
    [S2 p.34] statement, which is the single change that makes this read as a
    modern offshore derrick rather than a land derrick from a postcard."""
    if z <= TAPER_Z:
        return DER_BASE / 2
    t = min(1.0, (z - TAPER_Z) / (DER_H - TAPER_Z))
    return DER_BASE / 2 + t * (DER_CROWN / 2 - DER_BASE / 2)


def bay_levels():
    """The 11 bay boundaries, as heights above the drill floor."""
    zs = [i * BAY_LO for i in range(BAYS_LOWER)]
    zs += [TAPER_Z + i * BAY_HI for i in range(BAYS_UPPER + 1)]
    return zs


def corners(z):
    h = half_at(z)
    return [(-h, -h, z), (h, -h, z), (h, h, z), (-h, h, z)]


# ═══════════════════════════════════════════════════════════════════════════
#  SUBASSEMBLIES
# ═══════════════════════════════════════════════════════════════════════════

def build_substructure(root):
    """The braced box the derrick stands on, and the skid beams under it.

    [S1 §B.1.5]: 45.5 x 46 ft in plan, 28 ft to the drill floor, 21 ft of clear
    height below the rotary beams.  The lost 7 ft is girder depth and it shows:
    the rotary is carried on two deep plate girders and you look straight at
    them from the cellar deck.
    """
    hx, hy = SUB_X / 2, SUB_Y / 2
    c = SUB_COL / 2
    beam_z = CLEAR_Z                       # underside of the rotary girders

    # ── four corner columns, plus one intermediate per face ─────────────────
    for sx in (-1, 1):
        for sy in (-1, 1):
            x, y = sx * (hx - c), sy * (hy - c)
            bx('sub-col', (SUB_COL, SUB_COL, FLOOR_Z), R.MAT_PAINT, root, None,
               (x, y, FLOOR_Z / 2), bevel=0.03)
            # base pad on the skid beam
            bx('sub-shoe', (1.30, 1.30, 0.34), R.MAT_DARK, root, None,
               (x, y, 0.17), bevel=0.02)

    # ── X-bracing on all four faces.  The cellar face at +Y is left OPEN: the
    #    BOP is skidded in and out through it and there are two hoists over it
    #    ([S1 §E.10.1], 27.5 t SWL). ──────────────────────────────────────────
    for (ax, s) in (('x', -1), ('x', 1), ('y', -1), ('y', 1)):
        if ax == 'y' and s == 1:
            continue                        # the open BOP face
        for lo, hi in ((0.35, beam_z * 0.55), (beam_z * 0.55, beam_z)):
            if ax == 'x':
                p = [(s * (hx - c), -(hy - c), lo), (s * (hx - c), (hy - c), hi)]
                q = [(s * (hx - c), (hy - c), lo), (s * (hx - c), -(hy - c), hi)]
            else:
                p = [(-(hx - c), s * (hy - c), lo), ((hx - c), s * (hy - c), hi)]
                q = [((hx - c), s * (hy - c), lo), (-(hx - c), s * (hy - c), hi)]
            for nm, seg in (('sub-brace-a', p), ('sub-brace-b', q)):
                wf(nm, seg[0], seg[1], 0.40, 0.28, R.MAT_PAINT, root, None,
                   xhint=(0, 0, 1))
        # a horizontal tie at mid height
        if ax == 'x':
            wf('sub-tie', (s * (hx - c), -(hy - c), beam_z * 0.55),
               (s * (hx - c), (hy - c), beam_z * 0.55), 0.36, 0.26,
               R.MAT_PAINT, root, None, xhint=(0, 0, 1))
        else:
            wf('sub-tie', (-(hx - c), s * (hy - c), beam_z * 0.55),
               ((hx - c), s * (hy - c), beam_z * 0.55), 0.36, 0.26,
               R.MAT_PAINT, root, None, xhint=(0, 0, 1))

    # ── the rotary girders.  Two deep plate girders spanning X under the well,
    #    plus the cross beams that make the floor frame. ─────────────────────
    for sy in (-1, 1):
        wf('rotary-girder', (-hx, sy * 1.55, beam_z + BEAM_D / 2),
           (hx, sy * 1.55, beam_z + BEAM_D / 2), BEAM_D, 0.62,
           R.MAT_PAINT, root, None, xhint=(0, 0, 1))
    for sx in (-1, 1):
        wf('floor-beam', (sx * hx * 0.72, -hy, FLOOR_Z - 0.55),
           (sx * hx * 0.72, hy, FLOOR_Z - 0.55), 1.00, 0.42,
           R.MAT_PAINT, root, None, xhint=(0, 0, 1))
    for k in (-1, 0, 1):
        y = k * hy * 0.62
        wf('floor-xbeam', (-hx, y, FLOOR_Z - 0.45), (hx, y, FLOOR_Z - 0.45),
           0.80, 0.36, R.MAT_PAINT, root, None, xhint=(0, 0, 1))

    # ── SKID BEAMS.  [S5 p.312]: 40 ft apart, deck legs directly under them,
    #    and the substructure skids over them in two perpendicular directions
    #    ([S6] §3.9, verified verbatim in two sources).  This is the geometry
    #    that says "fixed platform" instead of "moonpool" - HANDOFF §10 #7. ──
    for sx in (-1, 1):
        bx('skid-beam-x', (SKID_D, SUB_Y + 7.0, 0.62), R.MAT_WORN, root, None,
           (sx * SKID_SPAN / 2, 0, -0.31), bevel=0.02)
    for sy in (-1, 1):
        bx('skid-beam-y', (SKID_SPAN + 7.0, SKID_D, 0.48), R.MAT_WORN, root, None,
           (0, sy * SKID_SPAN / 2, -0.85), bevel=0.02)

    # ── stair tower from the cellar deck up to the drill floor.  Offshore uses
    #    stair towers between levels and caged ladders on the structure
    #    ([S6] §4.11). ────────────────────────────────────────────────────────
    sx0, sy0 = -hx - 1.35, -hy + 1.2
    steps = 26
    for i in range(steps):
        t = i / (steps - 1.0)
        bx('stair-tread', (1.20, 0.28, 0.045), R.MAT_WORN, root, None,
           (sx0, sy0 + t * 6.4, 0.20 + t * (FLOOR_Z - 0.45)), bevel=0.0)
    for sd in (-1, 1):
        bar('stair-stringer', (sx0 + sd * 0.62, sy0 - 0.2, 0.10),
            (sx0 + sd * 0.62, sy0 + 6.6, FLOOR_Z + 0.05), 0.09,
            R.MAT_WORN, root, None, square=True)
        railing('stair-rail', [(sx0 + sd * 0.62, sy0 - 0.2, 0.10),
                               (sx0 + sd * 0.62, sy0 + 6.6, FLOOR_Z + 0.05)],
                root, None, kick=False)


def build_wellhead_and_bop(root):
    """The wellhead, the BOP stack and its plumbing, in the substructure.

    [S6] §3.11: the assembled three-preventer stack is ~5 m in 6.40 m of clear
    height.  "It is not a small object tucked under the floor; it very nearly
    touches the beams, and there is barely room to work around it."  And a ram
    body is 2.9 m long and 1.7 m tall - a squat block, never a cylinder.
    """
    z = 0.0
    # conductor and casing head at the well centre
    tb('conductor', 0.330, 0.55, R.MAT_WORN, root, None, (0, 0, -0.30), sides=16)
    tb('casing-head', WELLHEAD_OD / 2 + 0.10, 0.62, R.MAT_CAST, root, None,
       (0, 0, 0.10), sides=16)
    z = 0.72
    for r, h in ((0.34, 0.16), (0.30, 0.30), (0.34, 0.16)):
        tb('wellhead-spool', r, h, R.MAT_CAST, root, None, (0, 0, z), sides=16)
        z += h

    def flange(zz):
        tb('bop-flange', 0.40, 0.10, R.MAT_CAST, root, None, (0, 0, zz), sides=16)
        for i in range(12):
            a = i * math.pi / 6
            tb('bop-stud', 0.026, 0.16, R.MAT_STEEL, root, None,
               (math.cos(a) * 0.345, math.sin(a) * 0.345, zz - 0.03), sides=5)

    def outlets(zz, n):
        """Side outlets, 4-1/16 in 10K: four on a double, two on a single
        ([S1 §E.3.1], [S4]).  The choke and kill lines run off them."""
        for i in range(n):
            sx = 1 if i % 2 == 0 else -1
            dz = 0.0 if i < 2 else -0.42
            tb('bop-outlet', 0.105, RAM_L / 2 + 0.30, R.MAT_CAST, root, None,
               (sx * (RAM_L / 2 - 0.10), 0, zz + dz),
               (0, sx * math.pi / 2, 0), sides=10)

    # single ram, then double ram, then annular - the sourced stack order
    flange(z)
    z += 0.10
    bx('bop-single', (RAM_L, RAM_W, SGL_H), R.MAT_CAST, root, None,
       (0, 0, z + SGL_H / 2), bevel=0.06, seg=2)
    outlets(z + SGL_H / 2, 2)
    for sx in (-1, 1):                       # bonnets, closed
        bx('bop-bonnet', (0.34, RAM_W * 0.78, SGL_H * 0.72), R.MAT_CAST, root,
           None, (sx * (RAM_L / 2 + 0.16), 0, z + SGL_H / 2), bevel=0.03)
    z += SGL_H
    flange(z)
    z += 0.10
    bx('bop-double', (RAM_L, RAM_W, DBL_H), R.MAT_CAST, root, None,
       (0, 0, z + DBL_H / 2), bevel=0.06, seg=2)
    outlets(z + DBL_H * 0.62, 4)
    for sx in (-1, 1):
        for dz in (-0.42, 0.42):
            bx('bop-bonnet', (0.34, RAM_W * 0.78, DBL_H * 0.34), R.MAT_CAST,
               root, None, (sx * (RAM_L / 2 + 0.16), 0, z + DBL_H / 2 + dz),
               bevel=0.03)
    z += DBL_H
    flange(z)
    z += 0.10
    tb('bop-annular', 0.86, ANN_H, R.MAT_CAST, root, None, (0, 0, z), sides=18)
    tb('bop-annular-cap', 0.70, 0.34, R.MAT_CAST, root, None,
       (0, 0, z + ANN_H), sides=18)
    z += ANN_H + 0.34

    # bell nipple and the flow line away to the shakers ([S6] §4.4)
    tb('bell-nipple', 0.40, max(0.30, CLEAR_Z - z), R.MAT_DARK, root, None,
       (0, 0, z), sides=14)
    hs('flow-line', [(0.34, 0.0, z + 0.30), (2.30, -1.20, z - 0.10),
                     (5.10, -3.40, z - 1.30), (7.60, -5.20, z - 2.60)],
       0.185, R.MAT_STEEL, root, None, taut=True, sides=8)

    # choke and kill lines, off the outlets and down the substructure
    for sx in (-1, 1):
        hs('choke-line', [(sx * (RAM_L / 2 + 0.55), 0, 1.35),
                          (sx * 2.60, -1.10, 1.60),
                          (sx * 4.20, -3.20, 2.40),
                          (sx * 5.40, -6.10, 2.10)],
           0.075, R.MAT_STEEL, root, None, taut=True, sides=6)

    # BOP handling hoists over the open face ([S1 §E.10.1] two hoists, 27.5 t)
    for sx in (-1, 1):
        bx('bop-hoist', (0.52, 0.46, 0.42), R.MAT_DARK, root, None,
           (sx * 1.9, SUB_Y / 2 - 1.0, CLEAR_Z - 0.30), bevel=0.02)
        hs('bop-hoist-rope', [(sx * 1.9, SUB_Y / 2 - 1.0, CLEAR_Z - 0.50),
                              (sx * 1.9, SUB_Y / 2 - 1.05, CLEAR_Z - 2.60)],
           0.014, R.MAT_STEEL, root, None, taut=True, sides=5)


def build_drill_floor(root, rotary):
    """The drill floor: deck, rotary table, the working furniture, and the
    driller's cabin.  This is where the player's attention is.

    The floor is 13.87 x 14.02 m ([S1 §B.1.5]) under a 9.14 m derrick base, so
    there is a walkable margin all round - about 2.4 m - and EVERY piece of
    drill-floor equipment lives in that margin.  [S6] §9.E: the game's 8.9 m
    floor is 55% of the real plan area, which is why its floor feels crowded.
    """
    hx, hy = SUB_X / 2, SUB_Y / 2
    z = FLOOR_Z
    op = 1.55                               # half the rotary opening in the deck

    # ── deck, as four panels round the rotary opening.  No boolean: the hole
    #    is where the drip pan and the table go. ─────────────────────────────
    grate('floor-deck', -hx, hx, -hy, -op, z, root, None)
    grate('floor-deck', -hx, hx, op, hy, z, root, None)
    grate('floor-deck', -hx, -op, -op, op, z, root, None)
    grate('floor-deck', op, hx, -op, op, z, root, None)

    # ── the rotary table.  pivot:rotary is a game contract node: rigFactory
    #    looks it up by string and spins it. ─────────────────────────────────
    tb('rotary-body', ROT_OD / 2, ROT_H, R.MAT_CAST, rotary, rotary,
       (0, 0, -ROT_H + 0.10), sides=24)
    tb('rotary-table', ROT_OD / 2 - 0.10, 0.16, R.MAT_STEEL, rotary, rotary,
       (0, 0, -0.06), sides=24)
    tb('master-bushing', ROT_OPEN / 2 + 0.10, 0.30, R.MAT_STEEL, rotary, rotary,
       (0, 0, -0.22), sides=20)
    # the four drive lugs on the table top - they read when it turns
    for i in range(4):
        a = i * math.pi / 2 + math.pi / 4
        bx('rotary-lug', (0.24, 0.16, 0.10), R.MAT_STEEL, rotary, rotary,
           (math.cos(a) * (ROT_OD / 2 - 0.34), math.sin(a) * (ROT_OD / 2 - 0.34),
            0.05), (0, 0, a))
    # drip pan: a shallow filthy tray the whole table sits in ([S1 §B.4.1]
    # fitted; [S6] §9.H asks for it by name).  Static - it does not rotate.
    bx('drip-pan', (DRIP_PAN, DRIP_PAN, 0.20), R.MAT_WORN, root, None,
       (0, 0, z - 0.34), bevel=0.02)
    for sx in (-1, 1):
        bx('drip-lip', (0.06, DRIP_PAN, 0.16), R.MAT_WORN, root, None,
           (sx * DRIP_PAN / 2, 0, z - 0.18), bevel=0.01)
        bx('drip-lip', (DRIP_PAN, 0.06, 0.16), R.MAT_WORN, root, None,
           (0, sx * DRIP_PAN / 2, z - 0.18), bevel=0.01)

    # ── the boxing-ring rotary handrail: two half-moon segments with high kick
    #    plates, dropped in when the bushings are out.  The hole is never left
    #    open ([S6] §4.3, from the parts catalogue). ─────────────────────────
    for s in (-1, 1):
        for i in range(7):
            a = math.pi * (i / 6.0) * s
            px, py = math.cos(a) * 1.36, math.sin(a) * 1.36
            bar('boxing-post', (px, py, z), (px, py, z + 0.92), 0.026,
                R.MAT_HAZARD, root, None, sides=5)

    # ── mousehole and rathole, sleeved through the floor ([S6] §4.3) ────────
    for nm, x, y, r in (('mousehole', 1.95, 1.35, 0.20),
                        ('rathole', 2.55, -1.10, 0.28)):
        tb(nm, r, 0.34, R.MAT_STEEL, root, None, (x, y, z - 0.05), sides=12)
        tb(nm + '-lip', r + 0.06, 0.08, R.MAT_HAZARD, root, None,
           (x, y, z + 0.22), sides=12)

    # ── the drawworks, at -Y.  Drum 30 x 58 in, grooved for 1-3/8 in line
    #    ([S1 §B.2.1]); 2,000 hp on two DC motors.  The drum axis is parallel
    #    to the crown shaft, which is what makes the fast line run true. ─────
    dwy = -hy + DW_W / 2 + 1.15
    bx('drawworks-frame', (DW_L, DW_W, DW_H), R.MAT_DARK, root, None,
       (0, dwy, z + DW_H / 2), bevel=0.03, seg=2)
    tb('drawworks-drum', DRUM_D / 2, DRUM_L, R.MAT_STEEL, root, None,
       (-DRUM_L / 2, dwy, z + DW_H * 0.62), (0, math.pi / 2, 0), sides=20)
    for sx in (-1, 1):                       # drum flanges
        tb('drum-flange', DRUM_D / 2 + 0.11, 0.07, R.MAT_CAST, root, None,
           (sx * DRUM_L / 2, dwy, z + DW_H * 0.62), (0, math.pi / 2, 0), sides=20)
        tb('brake-disc', 0.86, 0.09, R.MAT_CAST, root, None,
           (sx * (DRUM_L / 2 + 0.30), dwy, z + DW_H * 0.62),
           (0, math.pi / 2, 0), sides=22)
        # the two drive motors, in line with the drum
        tb('dw-motor', 0.44, 1.35, R.MAT_DARK, root, None,
           (sx * (DW_L / 2 - 0.10), dwy - 0.95, z + 0.62),
           (0, sx * math.pi / 2, 0), sides=14)
    bx('driller-console-dw', (0.90, 0.55, 1.15), R.MAT_DARK, root, None,
       (DW_L / 2 + 0.75, dwy, z + 0.60), bevel=0.03)

    # ── the driller's cabin, at +Y beside the V-door so he watches pipe come
    #    in.  GLASS, and NEVER transmission > 0: it re-renders the whole opaque
    #    list, +65..81 draw calls, and does not scale with the object.  Found
    #    three times in this codebase already and a glazed cabin is exactly
    #    where somebody reaches for it (HANDOFF §8F). ────────────────────────
    cx, cy = -hx + CAB_W / 2 + 0.9, hy - CAB_Y / 2 - 1.5
    bx('cabin-shell', (CAB_W, CAB_Y, CAB_H), R.MAT_PAINT, root, None,
       (cx, cy, z + CAB_H / 2), bevel=0.04, seg=2)
    bx('cabin-window', (CAB_W - 0.30, 0.06, CAB_H * 0.46), R.MAT_GLASS, root,
       None, (cx, cy - CAB_Y / 2 + 0.02, z + CAB_H * 0.62), bevel=0.0)
    bx('cabin-window-s', (0.06, CAB_Y - 0.40, CAB_H * 0.46), R.MAT_GLASS, root,
       None, (cx + CAB_W / 2 - 0.02, cy, z + CAB_H * 0.62), bevel=0.0)
    bx('cabin-roof', (CAB_W + 0.24, CAB_Y + 0.24, 0.10), R.MAT_DARK, root, None,
       (cx, cy, z + CAB_H + 0.05), bevel=0.02)
    railing('cabin-roof-rail',
            [(cx - CAB_W / 2, cy - CAB_Y / 2, z + CAB_H + 0.10),
             (cx + CAB_W / 2, cy - CAB_Y / 2, z + CAB_H + 0.10),
             (cx + CAB_W / 2, cy + CAB_Y / 2, z + CAB_H + 0.10)],
            root, None, h=0.95, kick=False)

    # ── manual rotary tongs on their counterbalance lines.  [S1 §D.2.21]
    #    records NO iron roughneck on this rig: it works with two big tongs on
    #    chains, a spinner and a hydraulic makeup machine, and the floor is far
    #    more open for it ([S6] §9.I).  Tong overall 1.84-1.98 m. ────────────
    for sx, ang_z in ((-1, 0.55), (1, -0.55)):
        px, py = sx * 2.15, ang_z
        bx('tong-body', (TONG_L, 0.38, 0.30), R.MAT_STEEL, root, None,
           (px + sx * TONG_L / 2 - sx * 0.55, py, z + 1.05),
           (0, 0, ang_z * 0.5), bevel=0.02)
        tb('tong-jaw', 0.34, 0.32, R.MAT_STEEL, root, None,
           (px - sx * 0.45, py, z + 1.05), sides=12)
        bx('tong-handle', (0.70, 0.16, 0.14), R.MAT_STEEL, root, None,
           (px + sx * (TONG_L - 0.20), py, z + 1.05), (0, 0, ang_z * 0.5),
           bevel=0.02)
        # the counterbalance line up into the derrick ([S1 §B.1.1] fitted)
        hs('tong-counterweight-line',
           [(px + sx * TONG_L * 0.5, py, z + 1.20),
            (px + sx * TONG_L * 0.35, py, z + 9.0),
            (px + sx * 0.10, py, z + 16.5)],
           0.011, R.MAT_STEEL, root, None, taut=True, sides=5)
        bx('tong-counterweight', (0.26, 0.26, 0.90), R.MAT_WORN, root, None,
           (px + sx * 0.10, py, z + 15.6), bevel=0.02)

    # pipe spinner and the hydraulic makeup machine ([S1 §D.2.15/17])
    bx('spinner', (0.62, 0.52, 0.70), R.MAT_DARK, root, None,
       (-2.60, 1.75, z + 0.90), bevel=0.03)
    bx('makeup-machine', (0.95, 0.80, 1.10), R.MAT_DARK, root, None,
       (-3.35, -1.60, z + 0.55), bevel=0.03)

    # ── two standpipes up the derrick, on an H-type manifold ([S1 §F.1.4];
    #    [S6] §9.H: the game runs one and should run two). ──────────────────
    for i, (odx, ody) in enumerate(((SP1_OD, -1.05), (SP2_OD, -1.72))):
        px = -DER_BASE / 2 + 0.55
        tb('standpipe', odx / 2 + 0.02, DER_H * 0.62, R.MAT_STEEL, root, None,
           (px, ody, z + 0.55), sides=12)
        for k in range(6):
            tb('standpipe-clamp', odx / 2 + 0.08, 0.14, R.MAT_DARK, root, None,
               (px, ody, z + 1.9 + k * (DER_H * 0.62 / 6.5)), sides=12)
    bx('standpipe-manifold', (1.05, 1.35, 0.85), R.MAT_STEEL, root, None,
       (-DER_BASE / 2 + 0.55, -1.40, z + 0.45), bevel=0.03)

    # ── the rig-floor air receiver.  1,060 US gal ON THE RIG FLOOR
    #    ([S1 §C.1.8]) - a big horizontal pressure vessel at the floor edge. ─
    tb('air-receiver', AIR_RCV_R, AIR_RCV_L, R.MAT_PAINT, root, None,
       (-hx + 0.95, -AIR_RCV_L / 2 - 2.2, z + 0.85), (0, math.pi / 2, 0)[0:3],
       sides=16)

    # ── two rig-floor air winches, port and starboard ([S1 §A.9.4.1], 11,000
    #    lb each), plus a pull-back tugger.  Air winches, their hoses and their
    #    hanging hooks are everywhere on a real floor ([S6] §4.3). ───────────
    for sx in (-1, 1):
        wx, wy = sx * (hx - 1.15), -3.6
        bx('air-winch', (0.72, 0.60, 0.55), R.MAT_DARK, root, None,
           (wx, wy, z + 0.30), bevel=0.02)
        tb('air-winch-drum', 0.20, 0.50, R.MAT_STEEL, root, None,
           (wx - sx * 0.25, wy, z + 0.34), (0, math.pi / 2, 0), sides=10)
        hs('air-winch-hose', [(wx, wy - 0.30, z + 0.20), (wx - sx * 0.5, wy - 1.3, z + 0.05),
                              (wx - sx * 0.3, wy - 2.4, z + 0.06)],
           0.028, R.MAT_RUBBER, root, None, sides=5)

    # ── the V-door: an opening at +Y with a heavy tie over it, a pipe ramp and
    #    a catwalk running away from it.  The V-door is the single feature that
    #    separates a derrick from a tower ([S6] §4.1), and in the game nothing
    #    currently arrives through it ([S6] §9.H item 7). ────────────────────
    vw = 2.10
    for sx in (-1, 1):
        bx('vdoor-jamb', (0.26, 0.26, 5.0), R.MAT_HAZARD, root, None,
           (sx * vw, hy - 0.30, z + 2.5), bevel=0.02)
    bx('vdoor-head', (vw * 2 + 0.26, 0.30, 0.46), R.MAT_HAZARD, root, None,
       (0, hy - 0.30, z + 5.05), bevel=0.02)
    # The ramp down to the pipe deck, with two joints lying on it.
    #
    # KEPT SHORT ON PURPOSE.  A land rig runs a long catwalk out to a pipe rack;
    # a platform does not - the pipe deck is right there and tubulars arrive by
    # crane ([S6] §2.1, §3.10 upper/lower pipe racks on the deck).  It also
    # matters to the camera: gltfRig.js sets frameRadius from
    # max(size.x, size.z) * 0.5 * 1.15, so every metre of catwalk pushes the
    # game camera back and shrinks the drill floor, which is the one thing the
    # player is supposed to be looking at.  A 15 m catwalk measured a 32.4 m
    # footprint and a frameRadius of 18.6; this is the same feature, read at
    # platform length.
    ramp_y1, ramp_z1 = hy + 4.6, z - 2.6
    for sx in (-1, 1):
        bar('pipe-ramp-rail', (sx * 0.95, hy - 0.1, z - 0.15),
            (sx * 0.95, ramp_y1, ramp_z1), 0.10, R.MAT_WORN, root, None,
            square=True)
        bar('catwalk-pipe', (sx * 0.45, hy + 0.4, z - 0.55),
            (sx * 0.45, ramp_y1 - 0.5, ramp_z1 + 0.45), DP_OD / 2,
            R.MAT_STEEL, root, None, sides=8)
    grate('catwalk', -1.6, 1.6, hy + 3.9, hy + 7.4, ramp_z1 + 0.28, root, None)
    railing('catwalk-rail', [(-1.6, hy + 3.9, ramp_z1 + 0.28),
                             (-1.6, hy + 7.4, ramp_z1 + 0.28)], root, None)
    railing('catwalk-rail-p', [(1.6, hy + 3.9, ramp_z1 + 0.28),
                               (1.6, hy + 7.4, ramp_z1 + 0.28)], root, None)

    # ── handrails round the floor, broken at the V-door and the stair head ──
    railing('floor-rail-x-neg', [(-hx, -hy + 0.1, z), (-hx, hy - 0.1, z)], root, None)
    railing('floor-rail-x-pos', [(hx, -hy + 0.1, z), (hx, hy - 0.1, z)], root, None)
    railing('floor-rail-y-neg', [(-hx, -hy, z), (hx, -hy, z)], root, None)
    railing('floor-rail-y-a', [(-hx, hy, z), (-vw - 0.4, hy, z)], root, None)
    railing('floor-rail-y-b', [(vw + 0.4, hy, z), (hx, hy, z)], root, None)

    # ── the rig floor wind wall: the bottom 15 ft of the derrick is screened
    #    ([S2 p.19]).  The LATTICE is not clad - the FLOOR is.  Getting this
    #    the wrong way round is the common error ([S6] §4.1 item 7), and
    #    [S1 §B.1.6] agrees from the other side: rig floor windbreaks fitted,
    #    no derrick wind wall.
    #
    #    It stands at the SUBSTRUCTURE EDGE, not at the derrick base - [S2 p.19]
    #    says so in as many words ("The floor wind wall is on the substructure")
    #    and it is also what keeps the 2.4 m working margin round the derrick
    #    legs open, which is where every piece of floor equipment lives.
    #    Two faces only: the V-door face and the drawworks face stay open, so
    #    the floor is never screened from the side the player looks in. ──────
    for sx in (-1, 1):
        bx('floor-windwall', (0.06, SUB_Y * 0.86, WALL_F_H), R.MAT_PAINT, root,
           None, (sx * (SUB_X / 2 - 0.08), 0, z + WALL_F_H / 2), bevel=0.0)
        for k in range(4):                     # stiffener posts on the panel
            yy = -SUB_Y * 0.40 + k * (SUB_Y * 0.80 / 3)
            bar('windwall-stud', (sx * (SUB_X / 2 - 0.14), yy, z),
                (sx * (SUB_X / 2 - 0.14), yy, z + WALL_F_H), 0.07,
                R.MAT_PAINT, root, None, square=True)


def build_derrick(root):
    """The lattice itself: 11 bays, Vee bracing, wide flange legs and girts,
    angle diagonals, parallel to 95 ft then battered to the crown.

    A DERRICK IS MOSTLY EMPTY LATTICE.  The tell of a bad model is solid panels
    where there should be structure and air, so everything here is a member
    between two points and nothing is a slab.  It costs triangles and, because
    it all welds into one mesh per material, no draw calls at all.
    """
    z0 = FLOOR_Z
    levels = bay_levels()

    # ── legs.  Four wide flange chords, web radial, flanges tangential, so the
    #    section catches light on the outside faces. ─────────────────────────
    for i in range(len(levels) - 1):
        za, zb = levels[i], levels[i + 1]
        ca, cb = corners(za), corners(zb)
        for k in range(4):
            ax, ay, _ = ca[k]
            bx_, by_, _ = cb[k]
            # taper the section with height: the compressive load falls off
            t = 1.0 - 0.42 * (za / DER_H)
            wf('derrick-leg', (ax, ay, z0 + za), (bx_, by_, z0 + zb),
               LEG_D * t, LEG_BF * t, R.MAT_PAINT, root, None,
               xhint=(-ay, ax, 0))

    # ── girts at every bay boundary, all four faces ─────────────────────────
    for i, z in enumerate(levels):
        c = corners(z)
        t = 1.0 - 0.35 * (z / DER_H)
        for k in range(4):
            a, b = c[k], c[(k + 1) % 4]
            wf('derrick-girt', (a[0], a[1], z0 + z), (b[0], b[1], z0 + z),
               GIRT_D * t, GIRT_BF * t, R.MAT_PAINT, root, None, xhint=(0, 0, 1))

    # ── Vee bracing, alternating apex up / apex down bay by bay.  [S2 p.19]
    #    "braced with Vee bracing"; the report's own test frame is an
    #    "inverted Vee", so both occur and alternating is what gives the
    #    silhouette its rhythm.  The V-door face is left OPEN for its bottom
    #    two bays - that opening is the whole point of the feature. ──────────
    for i in range(len(levels) - 1):
        za, zb = levels[i], levels[i + 1]
        ca, cb = corners(za), corners(zb)
        up = (i % 2 == 0)
        for k in range(4):
            a0, a1 = ca[k], ca[(k + 1) % 4]
            b0, b1 = cb[k], cb[(k + 1) % 4]
            # face k == 2 is the +Y face: the V-door
            if k == 2 and i < VDOOR_BAYS:
                continue
            if up:
                apex = ((b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2, z0 + zb)
                p, q = (a0[0], a0[1], z0 + za), (a1[0], a1[1], z0 + za)
            else:
                apex = ((a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2, z0 + za)
                p, q = (b0[0], b0[1], z0 + zb), (b1[0], b1[1], z0 + zb)
            for nm, s in (('derrick-brace-a', p), ('derrick-brace-b', q)):
                ang(nm, s, apex, BRACE_L, BRACE_T, R.MAT_PAINT, root, None,
                    xhint=(0, 0, 1))

    # ── the caged ladder up one leg, top to bottom, with rest platforms.
    #    [S1 §B.1.1]: "ladders with safety cages and rests".  The cage hoops
    #    are a strong repeating vertical detail that reads even in silhouette
    #    ([S6] §4.1 item 5). ─────────────────────────────────────────────────
    lx, ly = -DER_BASE / 2 + 0.30, -DER_BASE / 2 + 0.30
    top = DER_H - 1.0
    bar('ladder-stringer-a', (lx - 0.22, ly, z0), (lx - 0.22, ly, z0 + top),
        0.030, R.MAT_WORN, root, None, sides=6)
    bar('ladder-stringer-b', (lx + 0.22, ly, z0), (lx + 0.22, ly, z0 + top),
        0.030, R.MAT_WORN, root, None, sides=6)
    n_rung = int(top / 0.30)
    for i in range(n_rung):
        zz = z0 + 0.30 + i * 0.30
        bar('ladder-rung', (lx - 0.22, ly, zz), (lx + 0.22, ly, zz), 0.014,
            R.MAT_WORN, root, None, sides=5)
    n_hoop = int(top / 0.90)
    for i in range(n_hoop):
        zz = z0 + 1.9 + i * 0.90
        if zz > z0 + top:
            break
        for j in range(7):                    # a 210-degree hoop, open at the leg
            a = math.radians(-15 + j * 40)
            b = math.radians(-15 + (j + 1) * 40)
            bar('ladder-hoop',
                (lx + math.cos(a) * 0.38, ly + math.sin(a) * 0.38, zz),
                (lx + math.cos(b) * 0.38, ly + math.sin(b) * 0.38, zz),
                0.012, R.MAT_WORN, root, None, sides=4)
    for k in (1, 2, 3, 4):                    # rest platforms
        zz = z0 + top * k / 5.0
        grate('ladder-rest', lx - 0.55, lx + 0.55, ly - 0.10, ly + 1.05, zz,
              root, None)

    # ── the top-drive torque track: two rails 108 in apart running the full
    #    height on the -X face, with the dolly bracing back to the legs.
    #    [S1 §B.3.7] "track and dolly"; [S3 p.6] gives the 2.743 m span. ─────
    tx = -DER_BASE / 2 + 0.62
    for sy in (-1, 1):
        y = sy * TRACK_SPAN / 2
        bar('torque-track', (tx, y, z0 + 1.2), (tx, y, z0 + DER_H - 1.6),
            0.085, R.MAT_STEEL, root, None, square=True)
    for i in range(int((DER_H - 3.0) / 2.6)):
        zz = z0 + 1.6 + i * 2.6
        h = half_at(zz - z0)
        for sy in (-1, 1):
            bar('track-stay', (tx, sy * TRACK_SPAN / 2, zz), (-h, sy * h, zz),
                0.038, R.MAT_PAINT, root, None, sides=6)
        bar('track-tie', (tx, -TRACK_SPAN / 2, zz), (tx, TRACK_SPAN / 2, zz),
            0.045, R.MAT_STEEL, root, None, sides=6)


def build_racking(root):
    """The racking board, the fingerboard, and 219 stands of drill pipe.

    THIS IS THE SECOND-MOST-RECOGNISABLE THING ABOUT A DERRICK and it is almost
    always under-drawn.  [S1 §B.1.2] gives the board 20,000 ft of 5 in drill
    pipe, which is 219 trebles; the game's procedural derrick racks 18 stands,
    14% of what its own spec requires ([S6] §9.C).  data.js sizes oil holes
    from OIL_HOLE_SIZES by depth and the job runs to thousands of metres, so
    the stands are not decoration - they are the visible fact that this hole is
    deep.  At thumbnail size the setback reads as a solid dark block filling
    one quadrant of the derrick, and that is correct.
    """
    z0 = FLOOR_Z
    bz = z0 + BOARD_Z

    # ── the setback grid.  Rows run along Y, fingers along X between them. ──
    ncol = 28                                  # stands along one finger row
    nrow = 8
    x0 = 1.15
    y_span = (ncol - 1) * STAND_PITCH
    placed = 0
    for r in range(nrow):
        x = x0 + r * ROW_PITCH
        for c in range(ncol):
            if placed >= N_STANDS:
                break
            y = -y_span / 2 + c * STAND_PITCH
            # a stand leans a few degrees into the fingers; it STANDS on the
            # setback floor and does not lie at an angle ([S6] §4.2)
            lean = 0.020
            tipx = x + lean * STAND_L
            bar('stand-body', (x, y, z0 + 0.10), (tipx, y, z0 + STAND_L),
                DP_OD / 2, R.MAT_STEEL, root, None, sides=6)
            for f in (0.335, 0.665, 0.985):    # the tool joints, 3 per treble
                zz = z0 + 0.10 + f * STAND_L
                xx = x + lean * (f * STAND_L)
                bar('stand-tool-joint', (xx, y, zz - 0.24), (xx, y, zz + 0.24),
                    TJ_OD / 2, R.MAT_WORN, root, None, sides=6)
            placed += 1

    # ── drill collar stands, racked apart from the pipe.  [S1 §B.1.2] 465 ft
    #    of 8 in DC = 5 stands; [S1 §D.1.7] the collars are 9-1/2 in. ────────
    for i in range(DC_STANDS):
        x = x0 + (nrow + 0.7) * ROW_PITCH
        y = -1.0 + i * 0.34
        bar('collar-stand', (x, y, z0 + 0.10), (x + 0.02 * STAND_L, y, z0 + STAND_L),
            DC_OD / 2, R.MAT_WORN, root, None, sides=8)

    # ── the board itself, cantilevered off the +X face, with its fingers over
    #    the setback and a latch per slot. ───────────────────────────────────
    bxx = x0 - 0.45
    grate('racking-board', bxx, DER_BASE / 2 + 0.20, -y_span / 2 - 0.6,
          y_span / 2 + 0.6, bz, root, None)
    railing('racking-rail',
            [(bxx, -y_span / 2 - 0.6, bz), (bxx, y_span / 2 + 0.6, bz)],
            root, None)
    for r in range(nrow + 1):
        x = x0 - ROW_PITCH / 2 + r * ROW_PITCH
        bar('fingerboard-finger', (x, -y_span / 2 - 0.5, bz - 0.16),
            (x, y_span / 2 + 0.5, bz - 0.16), 0.055, R.MAT_STEEL, root, None,
            square=True)
    for r in range(nrow):
        x = x0 + r * ROW_PITCH
        for c in range(0, ncol, 2):            # a latch every other slot
            y = -y_span / 2 + c * STAND_PITCH
            bx('finger-latch', (0.11, 0.07, 0.09), R.MAT_DARK, root, None,
               (x, y, bz - 0.16), bevel=0.0)

    # ── the racking board wind wall, 80 to 95 ft ([S2 p.19]).  It shelters the
    #    derrickman, and it is one of the few genuinely SOLID panels that
    #    belongs anywhere on a derrick.
    #
    #    SIZED TO THE MAN, NOT TO THE FACE.  Run full width it became a 8.4 x
    #    4.6 m slab that closed off the top of the setback and read as exactly
    #    the failure the brief warns about - a solid panel where there should
    #    be structure and air.  [S2] gives the wall's ELEVATION BAND and says
    #    nothing about its width, so the width is a modelling decision: it
    #    screens the derrickman's working position and its two returns, and
    #    the rest of the bay stays open lattice.  The sourced 80-95 ft band is
    #    unchanged. ─────────────────────────────────────────────────────────
    wh = WALL_R_Z1 - WALL_R_Z0
    hb = half_at(BOARD_Z)
    ww = DER_BASE * 0.46                       # the screened width
    bx('racking-windwall', (0.06, ww, wh), R.MAT_PAINT, root, None,
       (hb - 0.10, 0, z0 + WALL_R_Z0 + wh / 2), bevel=0.0)
    for sy in (-1, 1):
        bx('racking-windwall-r', (DER_BASE * 0.22, 0.06, wh), R.MAT_PAINT, root,
           None, (hb - DER_BASE * 0.11, sy * ww / 2, z0 + WALL_R_Z0 + wh / 2),
           bevel=0.0)
    # the frame the panels hang on, so the screen reads as fitted rather than
    # as a hole in the lattice
    for sy in (-1, 1):
        bar('windwall-post', (hb - 0.10, sy * ww / 2, z0 + WALL_R_Z0),
            (hb - 0.10, sy * ww / 2, z0 + WALL_R_Z1), 0.055, R.MAT_PAINT,
            root, None, square=True)

    # ── access ladder to the board, and the derrickman's escape line down to
    #    a ground anchor ([S6] §4.2).  The escape line is a long, obvious,
    #    entirely characteristic diagonal and almost nobody models it. ───────
    bar('board-ladder-a', (bxx + 0.20, -y_span / 2 - 0.35, z0),
        (bxx + 0.20, -y_span / 2 - 0.35, bz), 0.028, R.MAT_WORN, root, None,
        sides=6)
    bar('board-ladder-b', (bxx + 0.64, -y_span / 2 - 0.35, z0),
        (bxx + 0.64, -y_span / 2 - 0.35, bz), 0.028, R.MAT_WORN, root, None,
        sides=6)
    for i in range(int(BOARD_Z / 0.30)):
        zz = z0 + 0.3 + i * 0.30
        bar('board-ladder-rung', (bxx + 0.20, -y_span / 2 - 0.35, zz),
            (bxx + 0.64, -y_span / 2 - 0.35, zz), 0.013, R.MAT_WORN, root, None,
            sides=4)
    # The escape line runs steeply to an anchor just off the substructure
    # rather than far across the deck, for the same camera reason as the
    # catwalk: it is one thin curve and it was setting the model's whole
    # bounding box.
    hs('escape-line', [(bxx + 0.4, y_span / 2 + 0.5, bz + 0.9),
                       (DER_BASE * 0.8, y_span / 2 + 3.2, bz * 0.55),
                       (SUB_X / 2 + 1.6, y_span / 2 + 6.2, 0.9)],
       0.013, R.MAT_STEEL, root, None, taut=True, sides=5)

    # ── the casing stabbing board, on the face OPPOSITE the monkey board,
    #    adjustable 20-43 ft above the rotary, parked low ([S1 §B.1.4]). ─────
    sb = half_at(STAB_Z)
    grate('stabbing-board', -sb + 0.10, -sb + 1.35, -1.5, 1.5, z0 + STAB_Z,
          root, None)
    railing('stabbing-rail', [(-sb + 1.35, -1.5, z0 + STAB_Z),
                              (-sb + 1.35, 1.5, z0 + STAB_Z)], root, None,
            h=1.0)


def build_crown(root):
    """The crown block, the water table, and the gin pole frame above it.

    [S1 §B.3.1]: 500 ton, SIX PLUS ONE sheaves, 52 in, grooved 1-3/8.  The
    extra wheel is the fast-line sheave, and 6 + 6 = the 12 lines the derrick
    is rated for.  This is arithmetic, not styling ([S6] §3.11).
    """
    z0 = FLOOR_Z
    ztop = z0 + DER_H                          # underside of the crown beams
    h = DER_CROWN / 2
    r = SHEAVE_D / 2

    # ── the crown beams the block sits on ──────────────────────────────────
    for sy in (-1, 1):
        wf('crown-beam', (-h, sy * h * 0.72, ztop + 0.55),
           (h, sy * h * 0.72, ztop + 0.55), 1.05, 0.42, R.MAT_PAINT, root, None,
           xhint=(0, 0, 1))
    for sx in (-1, 1):
        wf('crown-beam-x', (sx * h * 0.72, -h, ztop + 0.55),
           (sx * h * 0.72, h, ztop + 0.55), 0.85, 0.34, R.MAT_PAINT, root, None,
           xhint=(0, 0, 1))

    # ── the crown block: seven sheaves on a shaft across X, so the line planes
    #    are vertical and parallel to Y - which puts the fast line straight
    #    down onto a drawworks drum whose axis is also along X. ─────────────
    shz = ztop + 1.35 + r
    span = (CROWN_SHV - 1) * SHV_PITCH
    for i in range(CROWN_SHV):
        x = -span / 2 + i * SHV_PITCH
        tb('crown-sheave', r, SHV_PITCH * 0.62, R.MAT_CAST, root, None,
           (x - SHV_PITCH * 0.31, 0, shz), (0, math.pi / 2, 0), sides=20)
        tb('crown-sheave-hub', r * 0.30, SHV_PITCH * 0.80, R.MAT_STEEL, root,
           None, (x - SHV_PITCH * 0.40, 0, shz), (0, math.pi / 2, 0), sides=10)
    bar('crown-shaft', (-span / 2 - 0.35, 0, shz), (span / 2 + 0.35, 0, shz),
        0.13, R.MAT_STEEL, root, None, sides=12)
    for sx in (-1, 1):
        bx('crown-bearing', (0.34, 0.62, 0.62), R.MAT_CAST, root, None,
           (sx * (span / 2 + 0.30), 0, shz), bevel=0.03)
        bx('crown-frame', (0.22, h * 1.7, 1.85), R.MAT_PAINT, root, None,
           (sx * (span / 2 + 0.55), 0, ztop + 1.30), bevel=0.02)

    # ── the water table: a grated platform with a rail, so the crown sheaves
    #    can be reached ([S1 §B.1.1] "platform for crown sheave access").
    #    GRATED, not solid - the lines pass through it ([S6] §4.1 item 4). ──
    grate('water-table', -h - 0.45, h + 0.45, -h - 0.45, h + 0.45, ztop + 0.10,
          root, None)
    railing('water-table-rail',
            [(-h - 0.45, -h - 0.45, ztop + 0.10), (h + 0.45, -h - 0.45, ztop + 0.10),
             (h + 0.45, h + 0.45, ztop + 0.10), (-h - 0.45, h + 0.45, ztop + 0.10),
             (-h - 0.45, -h - 0.45, ztop + 0.10)], root, None)

    # ── the gin pole.  [S2 p.19]: the frame above the crown reaches 192 ft
    #    above the base of the structure - 32 ft above the 160 ft clear height.
    #
    #    IT IS TWO RAKED LEGS, NOT A SPIRE.  A gin pole is the pair of poles
    #    that lands the crown block at rig-up; built as a four-leg pyramid to a
    #    point it read as a transmission-tower finial and took over the whole
    #    silhouette, which is the opposite of an accessory.  Two legs with a
    #    head sheave and a back stay is what the thing actually is, and it
    #    keeps the sourced height without pretending to be more derrick. ─────
    #    The head is a BEAM, not a point.  Two legs converging on one vertex
    #    made a 10 m needle that read as a cathedral spire and took over the
    #    silhouette; a real gin pole carries a head beam with the sheaves
    #    hanging off it, so the top stays as wide as the equipment it lifts.
    gz = z0 + GIN_TOP
    hw = 0.82                                  # half the head beam
    gy = -h * 0.30
    foot_y = h * 0.58
    for sx in (-1, 1):
        foot = (sx * h * 0.88, foot_y, ztop + 0.95)
        head = (sx * hw, gy, gz - 0.30)
        bar('gin-pole', foot, head, 0.135, R.MAT_PAINT, root, None, sides=8)
        # a back stay to the far side of the water table
        bar('gin-stay', (sx * h * 0.62, -h * 0.88, ztop + 0.95),
            (sx * hw * 0.85, gy - 0.12, gz - 1.35), 0.062,
            R.MAT_PAINT, root, None, sides=6)
        for k in (1, 2, 3):                    # ladder-like spreaders per leg
            t = k / 4.0
            p = Vector(foot).lerp(Vector(head), t)
            q = Vector((sx * h * 0.62, -h * 0.88, ztop + 0.95)).lerp(
                Vector((sx * hw * 0.85, gy - 0.12, gz - 1.35)), t)
            bar('gin-lace', p, q, 0.040, R.MAT_PAINT, root, None, sides=5)
    # the head beam, and the two sheaves that make it a gin pole
    bar('gin-head-beam', (-hw - 0.18, gy, gz - 0.30), (hw + 0.18, gy, gz - 0.30),
        0.11, R.MAT_PAINT, root, None, square=True)
    for sx in (-1, 1):
        tb('gin-head-sheave', 0.34, 0.16, R.MAT_CAST, root, None,
           (sx * hw * 0.55, gy, gz - 0.80), (0, math.pi / 2, 0), sides=14)
    bx('gin-head-plate', (hw * 2, 0.34, 0.34), R.MAT_PAINT, root, None,
       (0, gy, gz - 0.13), bevel=0.02)

    # ── the deadline anchor, on the floor at -Y with its weight sensor
    #    ([S1 §B.3.6] "Type EB with weight sensor and deadline dampener"). ──
    bx('deadline-anchor', (0.90, 0.80, 0.95), R.MAT_DARK, root, None,
       (-span / 2 - 0.5, -SUB_Y / 2 + 1.6, z0 + 0.48), bevel=0.03)
    tb('deadline-reel', 0.42, 0.55, R.MAT_STEEL, root, None,
       (-span / 2 - 0.5, -SUB_Y / 2 + 1.6, z0 + 0.95), sides=14)


def build_block(carriage, spindle):
    """The travelling block, the hook, the links and the top drive.

    slide:carriage is a game contract node.  gltfRig.js reads travel_m off it
    and rigFactory drives it up and down the derrick; everything under it is
    excluded from the static join because it has to move independently.

    [S1 §B.3.2]: 500 ton, SIX sheaves, 52 in - the same wheel as the crown.
    [S3 p.6] supplies the top drive envelope, which no source in the library
    had before ([S6] §8).
    """
    r = SHEAVE_D / 2
    span = (BLOCK_SHV - 1) * SHV_PITCH

    # ── the block frame: two heavy side plates carrying the sheave shaft ────
    for sx in (-1, 1):
        bx('block-cheek', (0.16, r * 1.5, r * 2.4), R.MAT_CAST, carriage,
           carriage, (sx * (span / 2 + 0.24), 0, 0), bevel=0.03, seg=2)
    for i in range(BLOCK_SHV):
        x = -span / 2 + i * SHV_PITCH
        tb('block-sheave', r, SHV_PITCH * 0.62, R.MAT_CAST, carriage, carriage,
           (x - SHV_PITCH * 0.31, 0, 0), (0, math.pi / 2, 0), sides=20)
    bar('block-shaft', (-span / 2 - 0.30, 0, 0), (span / 2 + 0.30, 0, 0), 0.12,
        R.MAT_STEEL, carriage, carriage, sides=12)
    bx('block-becket', (0.30, 0.34, 0.55), R.MAT_STEEL, carriage, carriage,
       (span / 2 + 0.30, 0, -r * 0.55), bevel=0.02)

    # ── the hook below the block ───────────────────────────────────────────
    tb('hook-shank', 0.22, 1.15, R.MAT_STEEL, carriage, carriage,
       (0, 0, -r * 1.25 - 1.15), sides=14)
    bx('hook-body', (0.62, 0.62, 0.85), R.MAT_CAST, carriage, carriage,
       (0, 0, -r * 1.25 - 1.55), bevel=0.05, seg=2)

    # ── the top drive.  Hung under the hook on its bails; the guide dolly runs
    #    the torque track.  Stack-up 24 ft, body 6.338 m, 2.263 m wide, and it
    #    stands 2.311 m off the track face ([S3 p.6]). ─────────────────────
    tdz = -r * 1.25 - 2.10                     # top of the top drive body
    bx('td-frame', (TD_W, TD_W * 0.86, TD_BODY_H * 0.30), R.MAT_PAINT, carriage,
       carriage, (0, 0, tdz - TD_BODY_H * 0.15), bevel=0.04, seg=2)
    bx('td-gearcase', (TD_W * 0.82, TD_W * 0.74, TD_BODY_H * 0.26), R.MAT_CAST,
       carriage, carriage, (0, 0, tdz - TD_BODY_H * 0.43), bevel=0.05, seg=2)
    for sy in (-1, 1):                         # the two drive motors
        tb('td-motor', 0.40, TD_BODY_H * 0.34, R.MAT_DARK, carriage, carriage,
           (0, sy * TD_W * 0.30, tdz - TD_BODY_H * 0.30), sides=14)
    # washpipe and gooseneck: the mud comes in here off the rotary hose
    tb('td-washpipe', 0.13, 0.85, R.MAT_CHROME, carriage, carriage,
       (0, 0, tdz), sides=12)
    tb('td-gooseneck', 0.15, 0.70, R.MAT_STEEL, carriage, carriage,
       (0, 0.15, tdz + 0.60), (math.radians(58), 0, 0), sides=12)
    # the quill, the saver sub and the IBOP below the gear case
    tb('td-quill', 0.135, 1.10, R.MAT_CHROME, spindle, spindle,
       (0, 0, -1.10), sides=14)
    tb('td-ibop', 0.16, 0.72, R.MAT_STEEL, spindle, spindle, (0, 0, -1.78),
       sides=14)
    tb('td-saver-sub', 0.145, 0.46, R.MAT_WORN, spindle, spindle,
       (0, 0, -2.22), sides=12)
    # the pipe handler with its rotating collar and link tilt
    tb('td-pipe-handler', 0.44, 0.52, R.MAT_DARK, carriage, carriage,
       (0, 0, tdz - TD_BODY_H * 0.62), sides=16)
    for sy in (-1, 1):                         # bails / elevator links
        bar('elevator-link', (0, sy * 0.42, tdz - TD_BODY_H * 0.66),
            (0, sy * 0.30, tdz - TD_BODY_H * 0.66 - LINK_L * 0.42), 0.055,
            R.MAT_STEEL, carriage, carriage, sides=8)
    ez = tdz - TD_BODY_H * 0.66 - LINK_L * 0.42
    tb('elevator', 0.40, 0.30, R.MAT_STEEL, carriage, carriage, (0, 0, ez - 0.30),
       sides=16)
    bx('elevator-latch', (0.22, 0.44, 0.26), R.MAT_STEEL, carriage, carriage,
       (0.36, 0, ez - 0.16), bevel=0.02)

    # ── the guide dolly on the torque track ────────────────────────────────
    dx = -TD_SETBACK
    bx('td-dolly', (0.55, TRACK_SPAN + 0.30, 1.45), R.MAT_DARK, carriage,
       carriage, (dx, 0, tdz - TD_BODY_H * 0.34), bevel=0.03)
    for sy in (-1, 1):
        for dz in (-0.55, 0.55):
            tb('dolly-roller', 0.13, 0.22, R.MAT_STEEL, carriage, carriage,
               (dx - 0.10, sy * TRACK_SPAN / 2, tdz - TD_BODY_H * 0.34 + dz),
               (0, math.pi / 2, 0), sides=10)
    bar('td-torque-arm', (dx + 0.25, 0, tdz - TD_BODY_H * 0.34),
        (-TD_W * 0.42, 0, tdz - TD_BODY_H * 0.34), 0.11, R.MAT_PAINT, carriage,
        carriage, square=True)


def build_service_loop(root, block_z):
    """The rotary hose and the service loop that follow the top drive up and
    down.  Authored for the PARKED pose (block at the bottom of its travel) and
    parented to the static root, so it does not shorten as the block rises -
    the same limitation foundation_bg.py documents for its hose package, and
    the same fix: a re-pointed curve driven off slide:carriage.
    """
    px = -DER_BASE / 2 + 0.55
    hs('rotary-hose', [(px, -1.05, FLOOR_Z + DER_H * 0.60),
                       (px + 1.4, -0.60, FLOOR_Z + DER_H * 0.52),
                       (px + 2.2, -0.10, block_z + 2.2),
                       (0.30, 0.12, block_z + 0.9)],
       0.075, R.MAT_RUBBER, root, None, sides=8)
    hs('service-loop', [(px + 0.35, 0.85, FLOOR_Z + DER_H * 0.58),
                        (px + 1.6, 0.70, FLOOR_Z + DER_H * 0.46),
                        (px + 2.1, 0.35, block_z + 2.6),
                        (-0.55, 0.28, block_z + 1.1)],
       0.055, R.MAT_RUBBER, root, None, sides=6)


def build_drilling_line(root, block_z):
    """The drilling line, reeved for real: crown 6+1, block 6, twelve lines.

    Drawn in the parked pose.  A static reeving is wrong once the block moves,
    exactly as the service loop is; both are flagged in the handover notes.
    What it must NOT be is absent or reeved for eight - the sheave count is the
    rig's hoisting capacity made visible ([S6] §9.D).
    """
    z0 = FLOOR_Z
    r = SHEAVE_D / 2
    shz = z0 + DER_H + 1.35 + r
    cspan = (CROWN_SHV - 1) * SHV_PITCH
    bspan = (BLOCK_SHV - 1) * SHV_PITCH
    for i in range(BLOCK_SHV):
        cx = -cspan / 2 + i * SHV_PITCH - SHV_PITCH * 0.31
        bxx = -bspan / 2 + i * SHV_PITCH - SHV_PITCH * 0.31
        for sy in (-1, 1):
            hs('drilling-line', [(cx, sy * r, shz), (bxx, sy * r, block_z)],
               LINE_D / 2, R.MAT_WORN, root, None, taut=True, sides=4)
    # the fast line, off the seventh crown sheave down to the drawworks drum
    fx = cspan / 2 - SHV_PITCH * 0.31
    dwy = -SUB_Y / 2 + DW_W / 2 + 1.15
    hs('fast-line', [(fx, -r, shz), (fx, -r * 1.2, z0 + DER_H * 0.5),
                     (fx, dwy + 0.2, z0 + DW_H * 0.62)],
       LINE_D / 2, R.MAT_WORN, root, None, taut=True, sides=4)
    # the dead line, down to the anchor
    dx = -cspan / 2 - SHV_PITCH * 0.31
    hs('dead-line', [(dx, r, shz), (dx, r * 1.2, z0 + DER_H * 0.5),
                     (dx, -SUB_Y / 2 + 1.6, z0 + 1.10)],
       LINE_D / 2, R.MAT_WORN, root, None, taut=True, sides=4)


# ═══════════════════════════════════════════════════════════════════════════
#  LIGHTS
#
#  An offshore derrick at night is lit almost ENTIRELY by its own floodlights,
#  so on this machine the lamp nodes carry more of the look than on anything
#  else in the fleet.  env.js reads getWorkLights() every frame and re-aims
#  spotlights at the live nodes, so a lamp on the travelling block sweeps 35 m
#  of derrick as the block runs - which is the single most characteristic
#  lighting event on a drill floor and nothing in the game does it yet.
#
#  [S1 §B.1.1] records the derrick lighting as EXPLOSION-PROOF, and the
#  offshore lighting brochure ([S6] §4.10) names eleven lit areas of which the
#  derrick, the drill floor, the drawworks/top drive and the doghouse are four.
#  The obstruction light at the crown is RED ([S6] §6.3).
# ═══════════════════════════════════════════════════════════════════════════

def build_lights(root, carriage):
    z0 = FLOOR_Z
    L = []

    def lamp(name, parent, loc, aim, cone, rng, colour=None, watt=None):
        m, a = R.worklight(name, parent, loc, aim_dir=aim, cone_deg=cone,
                           range_m=rng)
        if colour is not None:
            m['colour_hex'] = colour
        if watt is not None:
            m['watt_hint'] = watt
        L.append((name, parent, loc))
        return m

    hb = DER_BASE / 2
    # four crown floods, aimed down the inside of the derrick at the well
    for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        lamp('crown-flood-%s%s' % ('p' if sx > 0 else 'n', 'p' if sy > 0 else 'n'),
             root, (sx * DER_CROWN / 2 * 0.9, sy * DER_CROWN / 2 * 0.9,
                    z0 + DER_H - 0.6),
             (-sx * 0.35, -sy * 0.35, -1.0), 62, 58, watt=400)
    # racking board floods: the derrickman's own light, aimed at the fingers
    for sy in (-1, 1):
        lamp('board-flood-%s' % ('p' if sy > 0 else 'n'), root,
             (hb - 0.55, sy * 3.4, z0 + BOARD_Z + 1.9),
             (0.55, -sy * 0.25, -0.85), 70, 26, watt=250)
    # drill floor: four, aimed at the well centre and the V-door
    lamp('floor-flood-vdoor', root, (0, SUB_Y / 2 - 0.9, z0 + 5.4),
         (0, -0.55, -1.0), 78, 22, watt=250)
    lamp('floor-flood-driller', root, (-hb + 0.4, 3.2, z0 + 5.0),
         (0.75, -0.55, -1.0), 74, 20, watt=250)
    lamp('floor-flood-dw', root, (0, -SUB_Y / 2 + 1.4, z0 + 5.4),
         (0, 0.7, -1.0), 74, 22, watt=250)
    lamp('floor-flood-setback', root, (hb - 0.4, -2.6, z0 + 5.0),
         (-0.8, 0.35, -1.0), 74, 20, watt=250)
    # under the floor: the BOP has to be visible from the cellar deck
    lamp('cellar-flood', root, (0, SUB_Y / 2 - 1.2, CLEAR_Z - 0.5),
         (0, -0.5, -0.8), 84, 14, watt=150)
    # THE ONE THAT MOVES.  On the travelling block, aimed down at the well:
    # it walks the whole 35 m of carriage travel as the block runs.
    lamp('block-flood', carriage, (0, -0.95, -0.35), (0, -0.3, -1.0), 56, 34,
         watt=250)
    # the crown obstruction light, red ([S6] §6.3)
    lamp('obstruction', root, (0, 0, z0 + GIN_TOP + 0.25), (0, 0, 1.0), 120, 6,
         colour=0xFF2A18, watt=40)
    return L


def build_lamp_housings(root, carriage, lamps):
    """A physical body under every mount, so a beam leaves a housing instead of
    empty air.  Everything here welds into its owner's bin, so eleven lamps
    cost two draw calls between them, not eleven."""
    for (name, parent, loc) in lamps:
        own = carriage if parent is carriage else root
        par = carriage if parent is carriage else None
        if name == 'obstruction':
            tb('obstruction-body', 0.16, 0.22, R.MAT_DARK, own, par,
               (loc[0], loc[1], loc[2] - 0.22), sides=10)
            tb('obstruction-lens', 0.13, 0.16, R.MAT_HAZARD, own, par,
               (loc[0], loc[1], loc[2] - 0.06), sides=10)
            continue
        bx('lamp-housing', (0.42, 0.30, 0.34), R.MAT_DARK, own, par, loc,
           bevel=0.02)
        bx('lamp-lens', (0.34, 0.05, 0.27), R.MAT_STEEL, own, par,
           (loc[0], loc[1], loc[2] - 0.05), bevel=0.0)
        bx('lamp-bracket', (0.09, 0.16, 0.20), R.MAT_WORN, own, par,
           (loc[0], loc[1], loc[2] + 0.22), bevel=0.01)


# ═══════════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════

def build(out_path):
    _bins.clear()
    del _order[:]
    R.reset()

    z0 = FLOOR_Z

    # ── the dynamic spine.  gltfRig.js indexes these BY STRING; they are the
    #    contract, and getting a name wrong loses the moving part silently. ──

    # THERE IS NO pivot:mast, AND THAT IS DELIBERATE.
    # gltfRig.js maps pivot:mast to dyn.mastPivot and rigFactory then bends it:
    #   flex = -(load*1.1 + feed*0.7) * DEG * work * flexScale
    # A leader mast bends; a 160 ft braced derrick does not.  The procedural
    # builder handles this by setting dyn.flexScale = 0.20 and
    # dyn.carriageNoFlex = true, and NEITHER can be expressed in a .glb today.
    # With flexScale defaulting to 1, a pivot:mast carrying this derrick would
    # lean about 1.8 degrees under load and swing its crown nearly 1.8 m.
    #
    # So the derrick is NOT parented to a pivot.  What IS published is
    # pivot:mast-upper as a BARE node at the well centre with no geometry under
    # it: gltfRig sets dyn.mastLower/dyn.mastUpper from it, which is what
    # updateString() needs to draw the drill string from the top drive down to
    # the collar.  The string works; the structure stays rigid.
    mast_ref = R.empty(R.NODE_PIVOT, 'mast-upper', None, (0, 0, z0))
    mast_ref['flex_scale'] = 0.20     # a forward-compatible hint. gltfRig.js
                                      # does not read it yet; see the handover
                                      # notes for the one-line change that
                                      # would let every Blender machine state
                                      # its own stiffness.

    rotary = R.empty(R.NODE_PIVOT, 'rotary', None, (0, 0, z0))
    rotary['rpm_max'] = TD_RPM                  # [S1 §B.4.4]
    rotary['torque_knm'] = TD_TORQUE            # [S1 §B.4.4]
    rotary['opening_mm'] = round(ROT_OPEN * 1000, 1)   # [S1 §B.4.1] 37-1/2 in

    # THE CARRIAGE IS THE TRAVELLING BLOCK.
    # Home is the BOTTOM of the travel, because gltfRig.js reads carriageRange
    # as [y, y + travel_m].  Low = the top drive's saver sub just clear of the
    # rotary; high = the block just under the crown sheaves.
    sh_z = z0 + DER_H + 1.35 + SHEAVE_D / 2     # crown sheave centre
    block_lo = z0 + 2.35 + TD_STACK             # block centre, parked
    block_hi = sh_z - SHEAVE_D / 2 - 0.85       # block centre, at the crown
    carriage = R.empty(R.NODE_SLIDE, 'carriage', None, (0, 0, block_lo))
    carriage['travel_m'] = round(block_hi - block_lo, 3)
    spindle = R.empty(R.NODE_PIVOT, 'spindle', carriage,
                      (0, 0, -SHEAVE_D / 2 * 1.25 - 2.10 - TD_BODY_H * 0.56))
    spindle['rpm_max'] = TD_RPM
    spindle['torque_knm'] = TD_TORQUE

    # mount:tool is where the drill string hangs from - the top drive output.
    R.empty(R.NODE_MOUNT, 'tool', spindle, (0, 0, -2.45))

    # fixed references the game can ask for
    R.empty(R.NODE_MOUNT, 'well-centre', None, (0, 0, 0))
    R.empty(R.NODE_MOUNT, 'rotary-beams', None, (0, 0, CLEAR_Z))
    R.empty(R.NODE_MOUNT, 'v-door', None, (0, SUB_Y / 2, z0 + 0.9))
    R.empty(R.NODE_MOUNT, 'marque', None, (-SUB_X / 2 - 0.05, 0, z0 * 0.55))

    # WHERE THE PLAYER SHOULD BE LOOKING, published so a camera can ask.
    #
    # The surface hero camera is a hand-solved constant table
    # (`CAMERA_MODES`, renderer.js:134) and its own comment says what it was
    # solved against: "the machine is crawler-lite, a 4.2 m mast on a 0.14 m
    # pivot, ~4.6 m overall". Measured live in the built game, it sits at
    # y = 3.04 m with a 26.6 deg vertical FOV, 15.2 m out — a 7.2 m tall
    # window centred near the collar. THIS MACHINE'S WORKING LEVEL IS THE DRILL
    # FLOOR AT 8.53 m, which is above that window, so the shot is the
    # substructure and the BOP rather than the rotary and the setback.
    #
    # That is NOT a defect this model introduced: the procedural derrick frames
    # identically (shots/m12-oil-rotary.png), because both put the well collar
    # at grade like every other rig. And no machine can currently ask for
    # anything different — `frameRadius` is computed in gltfRig.js from the
    # FOOTPRINT ONLY (`max(size.x, size.z) * 0.5`, so height does not enter it)
    # and then, measured by grep across src/, IS NEVER READ BY ANYTHING.
    #
    # So this node is the hook a fix would want: the point to look at, with the
    # distance that frames the working level, stated by the machine that knows.
    # Nothing reads it yet. See the handover notes.
    focus = R.empty(R.NODE_MOUNT, 'camera-focus', None, (0, 0, z0 + 2.6))
    focus['frame_radius_m'] = 26.0     # DERIVED: half the 48 m of derrick a
                                       # wide shot wants, plus the floor margin
    focus['look_height_m'] = z0 + 2.6  # the drill floor plus a man's height

    build_substructure(None)
    build_wellhead_and_bop(None)
    build_drill_floor(None, rotary)
    build_derrick(None)
    build_racking(None)
    build_crown(None)
    build_block(carriage, spindle)
    build_service_loop(None, block_lo)
    build_drilling_line(None, block_lo)
    lamps = build_lights(None, carriage)
    build_lamp_housings(None, carriage, lamps)

    weld_all()
    return R.finish(out_path)


# ═══════════════════════════════════════════════════════════════════════════
#  HANDOVER NOTES
# ═══════════════════════════════════════════════════════════════════════════
#
# 1. **rig.box() AND THIS FILE.**  This module contains NO compensation factor
#    for the half-size `box()` bug and must never grow one.
#
#    History, because it cost this project weeks: when this file was started
#    `box()` still returned HALF the size asked for - `primitive_cube_add(size=1)`
#    makes a cube of EDGE 1 and the next line set `scale = size/2`.  Measured
#    in Blender 5.2.1 at the time: `box((4, 2, 10))` came out
#    (2.000, 1.000, 5.000) while `tube()` was correct.  This file was written
#    against the CONTRACT rather than the defect, and verified through a
#    throwaway harness that patched `box()` to its correct behaviour.
#
#    `box()` was fixed centrally in commit b656f60 while this machine was being
#    built.  The proof that no workaround leaked in: the export produced
#    through the patched harness and the export produced against the fixed
#    rig.py are BYTE-IDENTICAL - 3,289,700 bytes, 19 meshes, 50,280 triangles,
#    19.192 x 24.798 x 68.496 m, both times.
#
#    `foundation_bg.py` carries a measured runtime correction (`BOX_K`) for the
#    same bug.  That one MUST now be removed or that machine comes out DOUBLE
#    size; it is not this file's to touch.
#
# 2. **WHAT IS SOURCED AND WHAT IS NOT.**  Every constant at the top of this
#    file carries its citation, a DERIVED note with the working, or the words
#    NOT SOURCED.  The NOT SOURCED list, gathered: derrick leg/girt/brace
#    member SIZES (the SECTION TYPES are sourced), substructure column size and
#    type, skid beam depth and travel, rotary table plan size and height, drip
#    pan size, drawworks external envelope, sheave pitch on the shaft, BOP ram
#    width, driller's cabin, handrail and grating sizes, and the V-door opening.
#    Nothing here is a plausible invented number presented as fact.
#
# 3. **TWO GAPS IN research/rigs/oil-derrick.md §8 ARE NOW CLOSED**, and that
#    file has been updated:
#    · The **bay count and bracing** - §8 called it "a real gap ... bay count is
#      highly visible".  [S2 p.19]: 11 bays, Vee bracing, wide flange legs and
#      girts, angle diagonals.
#    · The **top drive envelope** - §8: "Top drive external dimensions and
#      weight ... the physical envelope is not" sourced, and §8.2 nominated the
#      unmined catalogues as the best hope.  [S3 p.6] carries dimensioned GA
#      drawings of four offshore top drives.
#    [S2] also gives §9.A's 160 ft / 30 ft ratio its **second independent
#    primary source** - §9.A noted that it "stands alone" on one document.
#    It does not any more.
#
# 4. **AND ONE FINDING THAT CHANGES THE SHAPE.**  [S2 p.34]: "the leg batter
#    (taper) starts above the racking area (~95')".  §9.A had recommended
#    keeping the game's two-rate taper, which puts 82% of the taper in the
#    bottom three quarters - the opposite.  A modern derrick is a parallel box
#    to the top of the racking area and tapers only above it.  This model
#    follows [S2].  If anyone reverts it, revert the citation too.
#
# 5. **WHAT THIS MODEL DOES NOT DO**, so nobody discovers it twice:
#    · The drilling line, the fast line, the dead line, the rotary hose and the
#      service loop are authored for the PARKED pose (block at the bottom of its
#      travel).  They are parented to the static root, so they do not shorten as
#      the block rises.  The fix is a re-pointed curve driven off slide:carriage,
#      the same one foundation_bg.py's hose package wants.
#    · Nothing racks or unracks.  The 219 stands are static geometry.  The
#      procedural builder publishes `dyn.racking = { inst, max }` and a Blender
#      model has no equivalent; if trip animation matters, the stands want to be
#      their own slide: node per row.
#    · The BOP bonnets are modelled CLOSED (2.899 m).  [S4] gives 4.388 m open,
#      and a ram change is a free, real, visually spectacular animation that
#      nobody has ([S6] §9.F).
#    · No iron roughneck, which is CORRECT and deliberate: [S1 §D.2.21] records
#      None on this rig, and it works with two manual tongs, a spinner and a
#      hydraulic makeup machine instead ([S6] §9.I).  Do not "fix" it.
#
# 5b. **`paintedDark` — FOUND MISSING, FIXED CENTRALLY, AND THE REASON THIS FILE
#     DID NOT WORK AROUND IT.**  `rig.py` declares
#
#         MAT_DARK = 'paintedDark'    # chassis, frames, guarding
#
#     under a heading saying these names "MUST match kinds in assets.js".  While
#     this machine was being built they did not: `grep -c paintedDark
#     src/core/assets.js` returned **0**, and gltfRig.js's own guard says what
#     follows — assets.js substitutes rawSteel, so every chassis, frame and
#     guard authored as MAT_DARK renders as BRIGHT BARE STEEL.  Nineteen builder
#     modules use MAT_DARK, so it was the whole fleet.
#
#     **It is fixed.**  Another agent landed `KINDS.paintedDark` at
#     `src/core/assets.js:3951` in commit 08188f4, "Every machine in the fleet
#     had bare steel where it should be dark paint" — same defect, found
#     independently.  Verified live through the running game: `assets._kinds`
#     now carries 34 kinds including paintedDark, and
#     `assets.material('paintedDark')` comes back at roughness 0.34 /
#     metalness 0.04 (painted) rather than rawSteel's metalness 1.0.
#
#     **This is why this file kept using MAT_DARK instead of quietly
#     substituting castIron or plastic for it.**  A private substitution would
#     have made one machine look right and eighteen wrong, planted a second
#     table of material names (HANDOFF §8B), and — the moment the central fix
#     landed — left this machine the only one in the fleet still not using the
#     kind that was added for it.  Naming the shared thing and reporting the
#     defect was the cheaper move, and it cost nothing to be right about.
#
#     A note on how this was nearly got wrong, because it is HANDOFF §8C:
#     the grep that found "0" was real, but a grep aimed at the KINDS object
#     literal would have missed this kind ANYWAY — `paintedDark` is registered
#     AFTER that literal as `KINDS.paintedDark = {...}`, derived from
#     paintedSteel.  The finding was confirmed against the RUNNING GAME
#     (`assets._kinds`, and the material's actual roughness and metalness)
#     before it was believed, which is the only reason the correction is in
#     this file rather than in somebody's next round.
#
# 5c. **THE CAMERA NEVER FRAMES THE DRILL FLOOR, AND NO MACHINE CAN ASK IT TO.**
#     Measured in the built game, not reasoned about: the surface hero camera
#     sits at **y = 3.04 m**, 15.2 m out, with a **26.6 deg** vertical FOV —
#     a **7.2 m tall window** centred near the well collar.  This machine's
#     working level, the drill floor, is at **8.53 m**.  So the shot is the
#     substructure bracing and the BOP, and the rotary, the tongs, the
#     drawworks and the 219-stand setback are all above the top of frame.
#
#     Three things, in the order they matter:
#
#     a. **This model did not cause it.**  `shots/m12-oil-rotary.png` is the
#        PROCEDURAL derrick and it frames identically — the same under-floor
#        view of legs, girts and string.  Both put the well collar at grade,
#        which is right and is what every other rig does.
#     b. **The camera was solved for a different size of machine, and says so.**
#        `CAMERA_MODES` at `src/core/renderer.js:134` carries the working:
#        *"the machine is crawler-lite, a 4.2 m mast on a 0.14 m pivot, ~4.6 m
#        overall"*.  It is a constant table, re-applied every frame — this was
#        confirmed by overriding `ctx.camera` at runtime and watching the game
#        put it straight back.
#     c. **`frameRadius` is dead data.**  `gltfRig.js:623` computes it as
#        `max(1, prep.radius * 1.15)` where `prep.radius = max(size.x, size.z)
#        * 0.5` — the FOOTPRINT, so a machine's HEIGHT never enters it — and
#        `rigFactory.js:7552` copies it to `root.userData.frameRadius`.
#        Grepped across `src/`: **nothing reads either one.**  A 68 m derrick
#        and a 4.6 m crawler are framed by the same constants.
#
#     Note the trap in (c), because it caught this model once: shrinking the
#     catwalk to cut the footprint moved `frameRadius` from 18.6 to 14.3, which
#     LOOKS like better framing and changes nothing, because nothing reads it.
#     The catwalk change stands on its own merits (a platform has a pipe deck,
#     not a land rig's long catwalk); it is not a camera fix.
#
#     `mount:camera-focus` is published for whoever fixes this, at the drill
#     floor plus a man's height, carrying `frame_radius_m` and `look_height_m`.
#     Nothing reads it yet either — but when a camera does start asking, the
#     machine that knows where its working level is will have an answer.
#
# 6. **THE FLEX HINT.**  `pivot:mast-upper` carries a `flex_scale` extra that
#    nothing reads.  gltfRig.js's makeDyn() could set `dyn.flexScale` from it in
#    one line, next to where it already reads `travel_m` off the carriage; every
#    Blender machine would then state its own stiffness instead of inheriting
#    the default of 1.  That file belongs to somebody else, so the hint is
#    written and not wired.
#
# 7. **SPEC-SHEET COHERENCE IS STILL OPEN** and is a data.js question, not a
#    geometry one ([S6] §9.J).  `depthCapacity: 2400` sits against a drawworks
#    of 1,490 kW, 500-ton blocks and a board holding 20,000 ft - the sourced rig
#    with that hardware is rated 20,000 ft = 6,096 m.  This model is the derrick
#    that is drawn.  Either the depth wants to be ~6,000 m or the hardware wants
#    to come down; picking one is the content authority's call.
