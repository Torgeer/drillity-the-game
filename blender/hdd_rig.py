"""
`hdd_rig` — horizontal directional drilling rig.  In-game marque: the
**Halvard HD-330 Traverse** (the name `rigFactory.js` already carries, and the
one `research/rigs/hdd-rig.md` §9-O records as correct under DOMAIN.md §10).

Real class: a ~300 kN crawler-mounted, ground-anchored HDD rig — a midi machine
by the HDD Consortium bands (small < 178 kN · midi 178-445 kN · maxi > 445 kN),
NOT a maxi one.  See [R] §9-A, which is blunt about the game calling it a
"maxi-rig" in error.

═══════════════════════════════════════════════════════════════════════════════
THE ONE THING THAT MUST BE RIGHT
═══════════════════════════════════════════════════════════════════════════════
An HDD rig does not drill down.  It is an INCLINED THRUST FRAME, anchored to the
ground, pushing and pulling a drill string along a shallow ramp into undisturbed
earth a metre or two in front of its own nose.  There is no mast, no hoist, no
crown sheave, no hole under the machine.  [R] §5: "Nothing else in the game's
line-up leans."  If this model reads as a vertical mast it is a different
machine and it is wrong.

Two consequences that this file is built around:

  * The machine is LONG AND LOW.  9.05 x 2.55 m on the plan, ~3.0 m tall in
    transport [JCS300].  Length : width is 3.5 : 1.  At the 16 deg rack angle
    the far end of the beam is only ~1.9 m above its near end.  Every proportion
    points along the ground.
  * `targetDepth` for this method is a BORE LENGTH, not a depth ([R] §9-J,
    `data.js`).  A 400 m bore may never be more than six metres down.  Nothing
    in this model implies a deep vertical hole: the string leaves the beam nose,
    crosses a visible stretch of open ground, and enters flat, undisturbed
    earth.  The setback is modelled, and it is sourced (§ SETBACK below).

═══════════════════════════════════════════════════════════════════════════════
PROVENANCE — every dimension below carries one of these tags
═══════════════════════════════════════════════════════════════════════════════
  [R]        `research/rigs/hdd-rig.md` (rev of 2026-09-05, status COMPLETE).
             The local authority for this machine; §3 proportions, §4 component
             inventory, §5 silhouette, §6 materials and wear, §8 the NOT SOURCED
             list, §9 the domain-truth warnings.  Read it before changing a
             number here.

  [JCS300]   TRACTO GRUNDODRILL JCS300 factory sheet, EN, 06/2025.  Read in full
             (text-extracted) 2026-09-05.  THE SIZE REFERENCE — a real 300 kN
             machine, the closest published analogue to this game rig:
               300 kN thrust/pullback · 13,000 Nm · 200 min-1 spindle
               HD bentonite pump 750 l/min @ 60 bar
               rod magazine 315 m · 70 rods · 4,500 mm · 104 mm · 98 kg each
               "Up to six additional rods can be reloaded simultaneously"
               min drilling radius 70 m
               L x W x H transport  8,630-8,760 x 2,550 x 3,205-2,980 mm
               L x W x H working, cabin in   9,050 x 2,550 x 4,370 mm
               L x W x H working, cabin out  9,050 x 3,220 x 4,370 mm
               23,600 kg · Cummins B6.7-C310 Stage V · 231 kW · 295 l fuel
               angle of inclination 0-29 deg · 2.3 / 3.6 km/h

  [18ACS]    TRACTO GRUNDODRILL 18ACS / 18N factory sheet, EN.  Read in full
             2026-09-05.  Carries the two things no other sheet does:

             (a) a NUMBERED COMPONENT OVERVIEW, which is where this model's
                 whole front-to-back layout comes from — see § LAYOUT;
             (b) DIMENSIONED WORKING AND TRANSPORT POSES:
                   working   7,150 long x 3,150 high, rack callout 13-19 deg
                   transport 6,700 long x 2,620 high x 2,350 wide
                 so a working machine is LONGER and TALLER than the same
                 machine folded — the rack extends forward as it comes down.
             Also verbatim: "Drive carriages with 'rack and pinion'";
             "Anchoring system with drilling fluid collecting tray";
             "The on-board crane facilitates easy handling of the rods,
             stacking boxes and additional components"; "Rotation of drill rods
             within rod box possible during normal operation"; "Drill rig with
             rubber track undercarriage, stabilisors"; 180 kN, 15,350-16,190 kg,
             123 kW, 0-30 deg inclination, 3,000 mm rods, 75 pcs, 225 m.

  [JCS130E]  TRACTO GRUNDODRILL JCS130E factory sheet, EN.  Read 2026-09-05.
             The ONLY sheet found anywhere that dimensions the same machine at
             TWO rack angles, which is what pins down how the pose changes:
               transport            7,020-7,484 x 1,910-2,577 x 2,782 mm
               working at 14 deg    8,365-8,637 x 1,910-2,577 x 3,424 mm
               working at 30 deg    7,175-7,537 x 1,910-2,577 x 4,652 mm
             i.e. going from 14 deg to 30 deg the machine gets ~1.15 m SHORTER
             and ~1.23 m TALLER.  See § RACK PIVOT for what that does and does
             not settle.  Its overview repeats "Anchor plate as drip pan for
             drilling fluid contributes to a clean jobsite" and "Stabilisers for
             perfect alignment and positioning of the bore rig".

  [VER4055]  Vermeer D40x55 S3 spec sheet, PN 296431556, 04/17.  Read in full
             2026-09-05.  178 kN class.  Transport 6.1 x 2.261 x 1.93 m (2.337 m
             with cab); 10,151-11,843 kg; carriage 57.3 m/min; spindle 227 rpm;
             7,457 Nm; min bore diameter 4 in (10.2 cm); rack angle 15.5-20.5 deg
             on a 3 m rod and 12.5-17.5 deg on a 4.6 m rod; 4.6 m x 67 mm rod,
             74.9 kg, bend radius 44.2 m, CARRYING CAPACITY 160 m (= ~35 rods);
             "Breakout system: Standard hydraulic vise"; "Stakedown system:
             Standard"; "Drilling lights: Standard".

  [MB]       Melfred Borzall catalogue Ed. 22, via [R] §3.5 — sonde-housing OD
             banded by rig thrust (222-356 kN -> 4.25 in / 108 mm on 2-7/8 IF),
             pullback-swivel diameter banded by capacity, reamer families.

  [P-ANCH]   US 6497296 B1, *Anchoring system for a directional drilling
             machine*, via [R] §4.6 — two stake-down units, each a POWER AUGER,
             on a common mount "pivotally connected to the frame at a tilt axis"
             transverse to the thrust axis, with ONE UNIT LATERALLY MOVABLE so
             the operator can maximise anchor spacing and dodge obstacles.
             Corroborated by US 11879331 B2: all HDD rigs are anchored; augers
             are "driven into the ground pushed by the cylinders and rotated by
             rotary drives"; above 100 tons-force a rig uses a thrust wall
             instead (330 kN = ~34 tf, so: augers).

  [P-MAG]    US 7467670 B2 (rod magazine) + US 20090095526 A1, via [R] §4.5 —
             rods "stored in a plurality of columns", "gravity is utilized to
             lower the drill rod within the respective columns", emptied
             "sequentially from the first column ... proximal to the drill
             string"; magazine "located generally above and to the side of the
             rack frame", rods "stored with their longitudinal axes parallel".

  [R07]      `research/07-hdd-trenchless.md` via [R] — the process pack.  Entry
             angle bands, the 0.9-6.1 m rig setback, the 305 mm pit berm, the
             Herrenknecht component list ("main beam with rack-and-pinion
             drive", "carriage (main drive)", "break-out unit", "erector unit"),
             and "The whole assembly is anchored - it has to react up to its
             full thrust and pullback into the ground."

  [DTD]      `DTD-Glossary-of-HDD-Terminology.pdf` via [R] §4.4 — the rod wiper
             / "doughnut": "a rubber or synthetic grommet placed over the drill
             rods during pullback to strip excess mud from the rods".

NAMING (DOMAIN.md §10).  Every real manufacturer name and model designation in
this project lives in THIS COMMENT BLOCK and nowhere else.  No object name, no
material name and no exported string carries one.  The references above are
cited so a proportion can be checked, not so a badge can be copied.  Shape is
free; branding is not.

═══════════════════════════════════════════════════════════════════════════════
AXES, ORIGIN, UNITS
═══════════════════════════════════════════════════════════════════════════════
Metres.  Blender Z-up; the exporter converts to three.js Y-up.  Machine FORWARD
— the drilling end — is Blender **-Y**, matching `rc_rig.py` and
`crawler_th.py`.  ORIGIN is the undercarriage centre at ground level, per the
pipeline contract, so the rig drops onto terrain at y = 0 with no fudge.

The entry point — where the string actually enters the earth — is NOT under the
machine.  It is 1.87 m in front of the beam nose and is published as the node
`mount:hole` so no other system has to guess it.

═══════════════════════════════════════════════════════════════════════════════
!!!  BUILD BLOCKER — READ BEFORE RUNNING  !!!
═══════════════════════════════════════════════════════════════════════════════
`lib/rig.py`'s `box()` RETURNS BOXES AT HALF THE REQUESTED SIZE.  It calls
`primitive_cube_add(size=1)`, which makes a cube of EDGE 1, then sets
`scale = size / 2`.  Measured in Blender 5.2.1 at the time this file was
written:

    box((4.0, 2.0, 10.0))  ->  dimensions (2.000, 1.000, 5.000)
    tube(r=0.5, len=3.0)   ->  dimensions (1.000, 1.000, 3.000)   <- correct

`tube()` is right, which is what hides it: a mixed model gets correct cylinders
and half-size boxes, so nothing looks broken and every proportion is quietly
wrong.

**THIS FILE DOES NOT COMPENSATE, DELIBERATELY.**  Every `R.box()` call below
asks for the size it means in true metres.  The other nine machine modules each
carry a private doubling wrapper, and the moment `lib/rig.py` is fixed every one
of those machines becomes DOUBLE SIZE until its wrapper is stripped
(HANDOFF.md §10 records this having already bitten twice).  Adding a tenth
wrapper would add a tenth landmine.  So: this module is correct against a FIXED
`rig.py` and only against a fixed one.

Until `lib/rig.py` is fixed, `npm run blender` will export this machine with
correct cylinders and half-size boxes.  That is a known, declared state, not a
defect in this file.
"""

import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
if os.path.join(HERE, 'lib') not in sys.path:
    sys.path.insert(0, os.path.join(HERE, 'lib'))

import rig as R                                               # noqa: E402

D2R = math.pi / 180.0

# ═════════════════════════════════════════════════════════════════════════════
# PRINCIPAL DIMENSIONS
# ═════════════════════════════════════════════════════════════════════════════
# The machine is sized to [JCS300], the one published 300 kN general
# arrangement.  The game's spec claims 330 kN / 27 t against that machine's
# 300 kN / 23.6 t — close enough that [R] §9-A names it "the game rig's
# real-world size reference".  Where the game and the source disagree the
# source wins on GEOMETRY and the game wins on NAMES.

WIDTH        = 2.55    # [JCS300] W, transport and working with cabin in.
                       # [R] §3.8: width is nearly constant across the whole
                       # class (1.66 -> 2.55 m from mini to maxi) because these
                       # machines are road-transportable.  DO NOT scale an HDD
                       # rig isotropically.
LENGTH       = 9.05    # [JCS300] L, working position.  Modelled from the beam
                       # nose to the back of the hood; the anchor assembly sits
                       # forward of it and is declared below.
HOOD_TOP     = 3.00    # [JCS300] transport H 2,980-3,205 mm.  The tallest fixed
                       # thing on the machine, and it ducks under bridges.

# ── undercarriage ────────────────────────────────────────────────────────────
# NOT SOURCED, all four.  [R] §8.1 searched for track gauge, shoe width,
# sprocket and idler diameters and roller count and found none for any HDD rig;
# the only published undercarriage figure anywhere in the class is a 147 mm
# ground clearance on a 6.7 t mini machine, which is not transferable to a
# 23.6 t one.  These are DERIVED to satisfy WIDTH and to carry the mass.
TRACK_LEN    = 4.60    # NOT SOURCED — derived: ~0.51 x LENGTH, which puts the
                       # rack overhang at the front and the hood overhang at
                       # the rear at roughly 2 m each.
SHOE_W       = 0.50    # NOT SOURCED — derived so GAUGE + SHOE_W = WIDTH.
GAUGE        = WIDTH - SHOE_W                    # 2.05 m centre to centre
TRACK_H      = 0.78    # NOT SOURCED — track frame top above ground
GROUSER_H    = 0.045   # NOT SOURCED.  [18ACS] "rubberised steel tracks", so
                       # the pads are rubber-faced and the grouser is low.
SHOE_PITCH   = 0.20    # NOT SOURCED
IDLER_R      = 0.31    # NOT SOURCED — derived from TRACK_H

DECK_Z       = 1.02    # chassis top plate.  DERIVED so the hood roof lands at
                       # HOOD_TOP and the cabin roof just under it.
BODY_W       = 2.30    # main frame width, inboard of the track outer faces
BODY_Y0      = -2.45   # chassis nose
BODY_Y1      =  2.55   # chassis tail

# ── the main beam ("rack", or "cradle" in the European sheets) ───────────────
# [R07] §D1 quoting Herrenknecht: "main beam with rack-and-pinion drive" and
# "carriage (main drive)".  A BEAM with a CARRIAGE, not a mast with a rotary
# head.  [R] §4.1 makes the rack strip the single detail that distinguishes an
# HDD beam from every other feed rail in this game.
RACK_LEN     = 6.80    # DERIVED.  [R] §3.8: "Rack length ~ 0.75-0.95 x machine
                       # length" — 0.75 x 9.05 = 6.79.  Cross-checked against
                       # the job it has to do: a 4.6 m rod + carriage + vice +
                       # clearances needs ~6.5 m, so 6.80 is the smallest length
                       # that is both in band and functional.
RACK_W       = 0.75    # NOT SOURCED.  [R] §8.1: beam section width, depth,
                       # plate thickness and whether it is a welded box, an open
                       # channel or a truss were "searched for specifically and
                       # not found in any source".  Modelled as a welded box
                       # girder; that choice is art, not evidence.
RACK_D       = 0.46    # NOT SOURCED, as above
ENTRY_DEG    = 16.0    # The rack angle, and it is RIGHT.  [R] §9-F withdrew an
                       # earlier recommendation to drop to 10-12 deg: eleven
                       # published machines give 13-21 deg for this class
                       # ([18ACS] working drawing 13-19 deg; [VER4055]
                       # 12.5-20.5 deg depending on rod length), and 16 deg sits
                       # dead in the middle.  The MACHINE's sweep is wider —
                       # [JCS300] 0-29 deg — and that is what `pivot:rack` is
                       # for.  ASCE MOP 108's 8-20 deg is a BORE design
                       # recommendation, not a machine limit.
ENTRY        = ENTRY_DEG * D2R

# ── RACK PIVOT ───────────────────────────────────────────────────────────────
# The pivot sits on the deck just inside the track nose, and the beam projects
# forward and DOWN from it — which is why an HDD rig gets longer as it comes
# down and shorter as it stands up.
#
# [JCS130E] is the only source that dimensions one machine at two angles, and
# it says the pose change is real and large: 14 deg -> 30 deg costs ~1.15 m of
# length and gains ~1.23 m of height.  HONEST LIMIT: those two numbers cannot
# both be satisfied by a single fixed pivot (they imply effective radii of
# ~11.0 m and ~4.8 m respectively), so the real machine is doing something more
# — very likely tipping on its stabilisers as well as rotating the cradle,
# which is what [18ACS] means by "Two stabilisers ... variable inclination of
# the cradle" and what [R] §3.2 rule 3 records as "the steepest angles need the
# machine jacked off its tracks".  THE EXACT LINKAGE IS NOT SOURCED and is not
# invented here: this model gives the game one honest `pivot:rack` and models
# the stabilisers as the separate `slide:` pair they are.
PIV_Y        = -2.10   # DERIVED — on the deck, just inside the track nose
PIV_Z        =  1.28   # DERIVED — a cradle bolster above the deck plate
RACK_NOSE_Y  = -4.70   # DERIVED — front of the 9.05 m envelope
RACK_FWD     = (PIV_Y - RACK_NOSE_Y) / math.cos(ENTRY)   # 2.705 m, pivot->nose
RACK_AFT     = RACK_LEN - RACK_FWD                       # 4.095 m, pivot->tail
NOSE_Z       = PIV_Z - RACK_FWD * math.sin(ENTRY)        # 0.534 m drill axis

# ── SETBACK — the negative space that identifies the method ──────────────────
# [R07] §A1: "The rig is set back 3-20 ft (0.9-6.1 m) behind the entry point."
# [R] §9-F flags the current procedural mesh at 0.28 m — a third of the minimum
# — and says closing that gap loses both the setback and the entry pit.  Here
# the geometry produces it for free: extend the drill axis from the beam nose
# down at 16 deg until it reaches z = 0.
SETBACK      = NOSE_Z / math.tan(ENTRY)                  # 1.866 m — in band
HOLE_Y       = RACK_NOSE_Y - SETBACK                     # -6.566 m

# ── the drill string ─────────────────────────────────────────────────────────
ROD_LEN      = 4.60    # [R] §9-B: the builder says 3.05 m and the shop sells
                       # 4.6 m, "pick one".  The SHOP is player-visible, so
                       # 4.6 m wins.  It is also the sourced class value —
                       # [JCS300] 4.5 m, [VER4055] 4.6 m option.
ROD_OD       = 0.104   # [JCS300] rod diameter 104 mm, 98 kg, on the 300 kN
                       # machine this model is sized to.
ROD_WALL     = 0.0063  # [R] §3.6 from an adjacent-class (DTH) rod table: 6.3 mm
                       # wall across 48-102 mm OD.  Transferable as CONSTRUCTION
                       # only — a drill rod is a THICK-walled tube, bore about
                       # three quarters of OD.  Flagged as adjacent class.
JOINT_OD     = 0.126   # NOT SOURCED for HDD.  Derived at 1.21 x ROD_OD from the
                       # one published pair in the class ([R] §3.1: 89 mm rod /
                       # 111 mm joint = 1.25; 127 mm rod / 168 mm joint = 1.32).
                       # HDD pipe is "friction-welded and integrally forged"
                       # with "optional hard banding as wear protection", so the
                       # upset ends read as a separate value from the mid-body.
ROD_COUNT    = 70      # [JCS300] "70 pcs", magazine capacity 315 m.  NOT the
                       # 220 the shop copy claims ([R] §9-B: the real class band
                       # is 28-75 rods / 85-315 m, and 220 "is not what the
                       # model shows").
MAG_COLS     = 7       # Columns ARE sourced in kind: [P-MAG] "a plurality of
MAG_ROWS     = 10      # columns", gravity-fed, emptied nearest-the-string
                       # first.  THE COUNTS ARE NOT SOURCED — [R] §8.3 is
                       # explicit that "rows per column are stated nowhere".
                       # 7 x 10 is chosen only because it makes exactly 70 and
                       # fits beside the rack inside WIDTH.
ROD_PITCH    = 0.118   # NOT SOURCED — ROD_OD + a column wall

# ── downhole tooling ─────────────────────────────────────────────────────────
SONDE_OD     = 0.108   # [MB] via [R] §3.5: a rig in the 222-356 kN band takes a
                       # 4.25 in / 108 mm sonde housing on 2-7/8 IF x 2-7/8 Reg.
                       # The game's own shop already specifies that thread.
PILOT_OD     = 0.121   # [R07] §A2 hard-rock minimum spread: a 121 mm pilot bit
                       # on 73 mm pipe.  [R] §3.8: the pilot bit is only ~1.65 x
                       # the rod OD — a small hole made by a small tool.
                       # [VER4055] independently prints "Min bore diameter 4 in
                       # (10.2 cm)".

# ── mud ──────────────────────────────────────────────────────────────────────
MUD_HOSE_R   = 0.041   # NOT SOURCED as a diameter.  Derived from duty: the
                       # source machine's pump is 750 l/min at 60 bar [JCS300],
                       # which is a 3 in class line.  [R] §6.1 requires only
                       # that the mud hose be VISIBLY the fattest line on the
                       # machine — that is the modelling instruction, and it is
                       # satisfied against HYD_HOSE_R below.
SUCTION_R    = 0.062   # NOT SOURCED — the suction leg from the external mixing
                       # unit is always fatter than the delivery leg
HYD_HOSE_R   = 0.019   # NOT SOURCED — ordinary hydraulic hose, for contrast

# ── anchors ──────────────────────────────────────────────────────────────────
# [P-ANCH] settles the KIND: two power augers, screwed in, on a mount that
# pivots about a transverse axis, one of them laterally movable.  [R] §8.2 is
# equally clear that the SIZE is not published anywhere: "auger flight diameter,
# stake length, embedded depth, holding capacity in kN" all NOT SOURCED, and
# "any evidence of vacuum-based anchoring" was searched for and NOT FOUND — do
# not model it.
AUGER_R      = 0.145   # NOT SOURCED
AUGER_LEN    = 1.35    # NOT SOURCED — exposed length above the plate
AUGER_X      = 0.86    # NOT SOURCED — the FIXED unit
AUGER_X2     = 1.16    # NOT SOURCED — the LATERALLY MOVABLE unit, deliberately
                       # NOT mirrored.  [P-ANCH]: one unit rides a "lateral
                       # extension member" so the operator can "maximize the
                       # spacing between the anchors" and dodge buried
                       # obstacles.  [R] §9-G: "that asymmetry is the sourced
                       # arrangement and it looks deliberate rather than
                       # decorative."
TRAY_Y0      = -7.10   # the anchor plate / drip tray, forward of the machine
TRAY_Y1      = -4.55   # [18ACS] "Anchoring system with drilling fluid
TRAY_W       =  1.90   # collecting tray"; [JCS130E] "Anchor plate as drip pan
                       # for drilling fluid contributes to a clean jobsite".
                       # [R] §4.6 calls this "the best single modelling detail
                       # in this whole document": the plate at the nose is both
                       # the load path AND the wettest object on the machine.
                       # It straddles HOLE_Y so the returns land in it.

# ═════════════════════════════════════════════════════════════════════════════
# LAYOUT — the front-to-back order, and where it comes from
# ═════════════════════════════════════════════════════════════════════════════
# [18ACS]'s numbered component overview, read straight off the sheet, gives the
# arrangement of a real machine of this family.  Reading its callouts in plan
# order from the drilling end:
#
#   05 Bentonite collecting tray - optionally with Bentonite suction pump
#   06 Two stabilisers - maximum stability, variable inclination of the cradle
#      for an ideal penetration angle
#   03 Anchoring system for enhanced stability while drilling
#   04 Hydraulic loading crane for self-sufficient handling of optional
#      stacking boxes, drilling rods and attachments
#   02 Large rod magazine - up to 225 m of rods on board
#   01 Comfort cabin, hydraulically adjustable, "can be positioned flexibly"
#   07 Broad undercarriage - with rubberised steel tracks
#   08 High performance bentonite pump - for rapid reaming speed
#   09 Diesel engine with the highest output of its class
#   10 Large GRP hood - easily accessible for service and maintenance
#
# That is the layout this file builds.  The cabin sits BESIDE the rack rather
# than behind it because the drill string owns the centreline for the beam's
# whole length — [R] §4.7: "the operator cannot sit behind it" — and on the
# real machines it swivels out to see down the rack ([JCS300] 2,550 mm cabin in
# vs 3,220 mm cabin out).
CAB_X0, CAB_X1 = -1.25, -0.25
CAB_Y0, CAB_Y1 =  0.20,  1.95
CAB_H          =  1.95                      # roof at 2.97, just under HOOD_TOP

MAG_X          =  0.825                     # rod magazine, RIGHT of the rack
MAG_Y0, MAG_Y1 = -2.90,  1.95               # [P-MAG] "above and to the side of
                                            # the rack frame"
MAG_Z0         =  1.16

HOOD_Y0, HOOD_Y1 = 2.10, 4.35               # engine + GRP hood, the rear
PUMP_X0, PUMP_X1 = -1.20, -0.40             # bentonite pump, its own bay beside
PUMP_Y0, PUMP_Y1 =  2.10,  3.40             # the engine, per callouts 08 / 09

CATWALK_X0, CATWALK_X1 = -1.10, -0.48       # [VER-D220x500 via R §4.1]: "The
CATWALK_Y1             =  0.05              # full-length catwalk provides
                                            # access to the entire length of the
                                            # rack for ease of wire lining and
                                            # assisting in the rod loading
                                            # process."  It rides the rack, so
                                            # it rakes with it, and it runs
                                            # forward from beside the cabin to
                                            # the vice.  It is also the only
                                            # place on this machine a human
                                            # figure could stand.


# ═════════════════════════════════════════════════════════════════════════════
# local helpers
# ═════════════════════════════════════════════════════════════════════════════
def beam(name, length, w, d, mat=R.MAT_DARK, parent=None, y0=0.0, x=0.0, z=0.0,
         bevel=0.012):
    """A box member running along local +Y, given its START y rather than its
    centre. Every member of the rack is written as `from here, this long`,
    which is how a fabrication drawing reads and how a diff stays legible."""
    return R.box(name, (w, length, d), mat, parent,
                 (x, y0 + length / 2.0, z), bevel=bevel)


def cone(name, r1, r2, length, mat=R.MAT_STEEL, parent=None, loc=(0, 0, 0),
         rot=(0, 0, 0), sides=16):
    """Truncated cone along +Z, origin at its base."""
    bpy.ops.mesh.primitive_cone_add(vertices=sides, radius1=r1, radius2=r2,
                                    depth=length)
    o = bpy.context.active_object
    o.data.transform(Matrix.Translation((0, 0, length / 2.0)))
    return R.part(name, o, mat, parent, loc, rot)


def curves_to_mesh(skip=()):
    """Convert hose curves to meshes so they fall into the material join.

    A curve exports as its own primitive — one draw call per hose. Converted,
    every hose lands in the single rubber bucket instead. Borrowed wholesale
    from `rc_rig.py`, which learned it the expensive way.
    """
    bpy.ops.object.select_all(action='DESELECT')
    for o in list(bpy.context.scene.objects):
        if o.type != 'CURVE' or o.name in skip:
            continue
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.convert(target='MESH')
        o.select_set(False)


def join_under(node):
    """Collapse one moving assembly to a single mesh per material.

    `finish()` deliberately leaves `pivot:` / `slide:` subtrees alone, because
    they have to move independently — but this rack is ~150 members and
    unjoined that is ~150 draw calls against a budget of 70. So each moving
    assembly is joined here by material, keeping the node itself and every
    child NODE intact so the game can still find and drive them.
    """
    bpy.context.view_layer.update()
    kids = []

    def walk(o):
        for c in o.children:
            if c.type == 'MESH':
                kids.append(c)
                walk(c)
            elif not (c.name.startswith(R.NODE_PIVOT)
                      or c.name.startswith(R.NODE_SLIDE)):
                walk(c)

    walk(node)
    if not kids:
        return
    groups = {}
    for o in kids:
        key = o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault(key, []).append(o)
    label = node.name.split(':', 1)[-1]
    for key, objs in groups.items():
        for o in objs:
            mw = o.matrix_world.copy()
            o.parent = node
            o.matrix_parent_inverse = Matrix.Identity(4)
            o.matrix_basis = node.matrix_world.inverted() @ mw
        bpy.context.view_layer.update()
        if len(objs) < 2:
            objs[0].name = label + ':' + key
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        bpy.context.active_object.name = label + ':' + key


def bake_modifiers():
    """Apply BEVEL modifiers before the joins, so a join cannot drop them.

    Blender's join keeps only the ACTIVE object's modifier stack, so an
    unbaked bevel on any other member of the group is silently lost. Baking
    first makes the bevels survive — and bevels are most of what stops steel
    reading as cardboard.
    """
    todo = [o for o in bpy.context.scene.objects
            if o.type == 'MESH' and o.modifiers]
    if not todo:
        return
    bpy.ops.object.select_all(action='DESELECT')
    for o in todo:
        o.select_set(True)
    bpy.context.view_layer.objects.active = todo[0]
    try:
        bpy.ops.object.convert(target='MESH')
    except Exception as exc:                                # pragma: no cover
        print('  ! bulk convert failed (%s), falling back per object' % exc)
        for o in todo:
            bpy.ops.object.select_all(action='DESELECT')
            bpy.context.view_layer.objects.active = o
            o.select_set(True)
            for m in list(o.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=m.name)
                except Exception as e2:
                    print('  ! modifier %s on %s: %s' % (m.name, o.name, e2))
    bpy.ops.object.select_all(action='DESELECT')


# ═════════════════════════════════════════════════════════════════════════════
# UNDERCARRIAGE
# ═════════════════════════════════════════════════════════════════════════════
def build_undercarriage():
    """[18ACS] callout 07: "Broad undercarriage - with rubberised steel tracks
    - extremely mobile and self-supporting"."""
    for s in (-1, 1):
        x = s * GAUGE / 2.0
        R.box('track-frame-%d' % s, (SHOE_W * 0.62, TRACK_LEN - 0.55, 0.40),
              R.MAT_DARK, None, (x, 0, TRACK_H - 0.30), bevel=0.02)

        # Sprocket (rear) and idler (front).  Their axes run ACROSS the machine,
        # so the tube's +Z must be rotated onto +X — Ry(pi/2), not Rx(pi/2).
        # Rx would lay them fore-and-aft, which reads as a pair of rollers
        # bolted the wrong way round and pushes them past the machine's width.
        for tag, yy in (('idler', -TRACK_LEN / 2 + IDLER_R),
                        ('sprocket', TRACK_LEN / 2 - IDLER_R)):
            R.tube('%s-%d' % (tag, s), IDLER_R, SHOE_W * 0.55, R.MAT_CAST, None,
                   (x - SHOE_W * 0.275, yy, IDLER_R + 0.06),
                   (0, math.pi / 2, 0), sides=16)

        # bottom rollers, same axis
        n_roll = 5
        span = TRACK_LEN - 2 * IDLER_R - 0.50
        for i in range(n_roll):
            yy = -span / 2 + span * i / (n_roll - 1.0)
            R.tube('roller-%d-%d' % (s, i), 0.115, SHOE_W * 0.50, R.MAT_CAST,
                   None, (x - SHOE_W * 0.25, yy, 0.155),
                   (0, math.pi / 2, 0), sides=12)

        # the shoe loop. Rubberised steel: a low grouser on a plate.
        n = int(round((TRACK_LEN - 2 * IDLER_R) / SHOE_PITCH))
        for i in range(n):
            yy = -TRACK_LEN / 2 + IDLER_R + SHOE_PITCH * (i + 0.5)
            for zz, mat in ((0.035, R.MAT_WORN), (TRACK_H - 0.035, R.MAT_WORN)):
                R.box('shoe-%d-%d-%d' % (s, i, int(zz * 100)),
                      (SHOE_W, SHOE_PITCH * 0.92, 0.055), mat, None,
                      (x, yy, zz))
                R.box('grouser-%d-%d-%d' % (s, i, int(zz * 100)),
                      (SHOE_W * 0.88, SHOE_PITCH * 0.34, GROUSER_H),
                      R.MAT_RUBBER, None,
                      (x, yy, zz - 0.028 - GROUSER_H / 2 if zz < 0.5
                       else zz + 0.028 + GROUSER_H / 2))
        # the wrapped ends
        for tag, yy in (('f', -TRACK_LEN / 2 + IDLER_R),
                        ('r', TRACK_LEN / 2 - IDLER_R)):
            steps = 7
            for i in range(steps):
                a = math.pi * (i + 0.5) / steps + (0 if tag == 'r' else math.pi)
                R.box('shoe-wrap-%s-%d-%d' % (tag, s, i),
                      (SHOE_W, SHOE_PITCH * 0.92, 0.055), R.MAT_WORN, None,
                      (x, yy + math.sin(a) * (IDLER_R + 0.03),
                       TRACK_H / 2 + math.cos(a) * (IDLER_R + 0.03)),
                      (-a + math.pi / 2, 0, 0))


# ═════════════════════════════════════════════════════════════════════════════
# CHASSIS AND DECK
# ═════════════════════════════════════════════════════════════════════════════
def build_chassis():
    R.box('main-frame', (BODY_W, BODY_Y1 - BODY_Y0, 0.46), R.MAT_DARK, None,
          (0, (BODY_Y0 + BODY_Y1) / 2, DECK_Z - 0.23), bevel=0.02)
    R.box('deck-plate', (BODY_W + 0.06, BODY_Y1 - BODY_Y0, 0.035),
          R.MAT_DARK, None, (0, (BODY_Y0 + BODY_Y1) / 2, DECK_Z + 0.017))

    # tread plate walkway along the deck edges, and a toe board
    for s in (-1, 1):
        R.box('deck-edge-%d' % s, (0.06, BODY_Y1 - BODY_Y0, 0.10),
              R.MAT_HAZARD, None,
              (s * (BODY_W / 2 + 0.02), (BODY_Y0 + BODY_Y1) / 2, DECK_Z + 0.07))

    # the cradle bolster the rack pivots on
    R.box('cradle-bolster', (RACK_W + 0.42, 0.62, PIV_Z - DECK_Z + 0.10),
          R.MAT_DARK, None, (0, PIV_Y, (DECK_Z + PIV_Z) / 2 + 0.02), bevel=0.02)
    for s in (-1, 1):
        R.tube('cradle-pin-%d' % s, 0.075, 0.16, R.MAT_STEEL, None,
               (s * (RACK_W / 2 + 0.14), PIV_Y, PIV_Z),
               (0, math.pi / 2, 0), sides=14)

    # Access steps up the left side to the cabin and catwalk. Tucked inside
    # the 2.55 m road width — on the real machines they fold — and the lower
    # nosings are where the boot transfer and the chipped paint live
    # ([R] §6.3 item 6).
    for i in range(3):
        R.box('step-%d' % i, (0.30, 0.24, 0.035), R.MAT_HAZARD, None,
              (-(BODY_W / 2 + 0.09), 0.10 - i * 0.28,
               DECK_Z - 0.14 - i * 0.28))


# ═════════════════════════════════════════════════════════════════════════════
# ENGINE HOOD, MUD PUMP, CABIN, CRANE
# ═════════════════════════════════════════════════════════════════════════════
def build_powerpack():
    """[18ACS] callouts 08, 09, 10 — the bentonite pump in its own bay beside
    the engine, the engine at the back, and a large GRP hood over it."""
    hy = (HOOD_Y0 + HOOD_Y1) / 2
    hl = HOOD_Y1 - HOOD_Y0
    # The hood covers the engine bay; the pump bay beside it is left open, as
    # it is on the real machines, so the pump and its manifold are visible.
    R.box('engine-hood', (BODY_W - 0.36, hl, HOOD_TOP - DECK_Z - 0.06),
          R.MAT_PAINT, None,
          (0.18, hy, (DECK_Z + HOOD_TOP) / 2 - 0.03), bevel=0.05)
    # a single long service door, the class idiom
    R.box('hood-door', (0.02, hl - 0.22, HOOD_TOP - DECK_Z - 0.42),
          R.MAT_PAINT, None,
          (0.18 + (BODY_W - 0.36) / 2 + 0.01, hy, DECK_Z + 0.72), bevel=0.01)
    for i in range(4):
        R.tube('hood-latch-%d' % i, 0.022, 0.03, R.MAT_STEEL, None,
               (0.18 + (BODY_W - 0.36) / 2 + 0.03, HOOD_Y0 + 0.35 + i * 0.52,
                DECK_Z + 0.42), (0, math.pi / 2, 0), sides=8)

    # radiator grille facing rearward
    R.box('rad-grille', (BODY_W - 0.52, 0.03, HOOD_TOP - DECK_Z - 0.50),
          R.MAT_DARK, None, (0.18, HOOD_Y1 - 0.015, DECK_Z + 0.78))
    for i in range(9):
        R.box('rad-louvre-%d' % i, (BODY_W - 0.56, 0.02, 0.035), R.MAT_WORN,
              None, (0.18, HOOD_Y1 - 0.035, DECK_Z + 0.42 + i * 0.10))

    # Exhaust — clean, because nothing throws upward ([R] §6.3).  Kept short:
    # [JCS300] transport height is 2,980-3,205 mm and this class travels under
    # bridges, so nothing on the roof may break ~3.2 m.
    R.tube('exhaust', 0.062, 0.17, R.MAT_WORN, None,
           (0.86, HOOD_Y0 + 0.30, HOOD_TOP - 0.03), sides=12)
    R.tube('exhaust-cap', 0.075, 0.04, R.MAT_WORN, None,
           (0.86, HOOD_Y0 + 0.30, HOOD_TOP + 0.14), sides=12)

    # ── the HD bentonite pump ────────────────────────────────────────────────
    # [JCS300] 750 l/min @ 60 bar.  A triplex pump block, its fluid end facing
    # outboard where the hoses land, and a pulsation bottle on top.
    px = (PUMP_X0 + PUMP_X1) / 2
    py = (PUMP_Y0 + PUMP_Y1) / 2
    R.box('mud-pump-frame', (PUMP_X1 - PUMP_X0, PUMP_Y1 - PUMP_Y0, 0.10),
          R.MAT_DARK, None, (px, py, DECK_Z + 0.08), bevel=0.015)
    R.box('mud-pump-power-end', (PUMP_X1 - PUMP_X0 - 0.06, 0.66, 0.52),
          R.MAT_PAINT, None, (px, py + 0.28, DECK_Z + 0.39), bevel=0.03)
    R.box('mud-pump-fluid-end', (PUMP_X1 - PUMP_X0 - 0.10, 0.44, 0.44),
          R.MAT_CAST, None, (px, py - 0.42, DECK_Z + 0.35), bevel=0.02)
    for i in range(3):                       # three cylinders: it is a triplex
        R.tube('mud-pump-cyl-%d' % i, 0.062, 0.20, R.MAT_CAST, None,
               (px - 0.24 + i * 0.24, py - 0.62, DECK_Z + 0.35),
               (math.pi / 2, 0, 0), sides=12)
        R.tube('mud-pump-valve-%d' % i, 0.046, 0.16, R.MAT_STEEL, None,
               (px - 0.24 + i * 0.24, py - 0.42, DECK_Z + 0.57), sides=10)
    R.tube('mud-pulsation-bottle', 0.115, 0.34, R.MAT_PAINT, None,
           (px + 0.18, py + 0.10, DECK_Z + 0.65), sides=14)
    # discharge manifold — where the mud hose to the rack starts
    R.tube('mud-manifold', 0.052, 0.34, R.MAT_STEEL, None,
           (px - 0.10, py - 0.70, DECK_Z + 0.30), (math.pi / 2, 0, 0), sides=12)


def build_cabin():
    """[18ACS] callout 01, [JCS300] "air-conditioned comfort cabin".

    Offset to the LEFT of the drill axis, because the string owns the
    centreline ([R] §4.7).  On the real machines it swivels out ~670 mm to see
    down the rack past the string; this one is modelled in the swivelled-IN
    position, which is the 2,550 mm working width [JCS300].
    """
    cx = (CAB_X0 + CAB_X1) / 2
    cy = (CAB_Y0 + CAB_Y1) / 2
    cw = CAB_X1 - CAB_X0
    cd = CAB_Y1 - CAB_Y0

    R.box('cab-shell', (cw, cd, CAB_H), R.MAT_PAINT, None,
          (cx, cy, DECK_Z + CAB_H / 2), bevel=0.05)
    R.box('cab-roof', (cw + 0.07, cd + 0.07, 0.06), R.MAT_PAINT, None,
          (cx, cy, DECK_Z + CAB_H + 0.02), bevel=0.02)

    # Glazing.  MAT_GLASS and NEVER transmission > 0 — HANDOFF §8F measured
    # +65..81 draw calls for it, on the entire opaque list, regardless of the
    # size of the pane.  The material here is a NAME only; the runtime swaps it.
    R.box('cab-glass-front', (cw - 0.13, 0.02, CAB_H - 0.60), R.MAT_GLASS, None,
          (cx, CAB_Y0 + 0.01, DECK_Z + CAB_H / 2 + 0.14))
    R.box('cab-glass-right', (0.02, cd - 0.16, CAB_H - 0.62), R.MAT_GLASS, None,
          (CAB_X1 - 0.01, cy, DECK_Z + CAB_H / 2 + 0.13))
    R.box('cab-glass-left', (0.02, cd - 0.30, CAB_H - 0.72), R.MAT_GLASS, None,
          (CAB_X0 + 0.01, cy + 0.04, DECK_Z + CAB_H / 2 + 0.16))
    R.box('cab-glass-rear', (cw - 0.20, 0.02, CAB_H - 0.86), R.MAT_GLASS, None,
          (cx, CAB_Y1 - 0.01, DECK_Z + CAB_H / 2 + 0.20))

    # the swivel ring the cabin rotates on
    R.tube('cab-swivel-ring', 0.30, 0.09, R.MAT_CAST, None,
           (cx, cy, DECK_Z - 0.04), sides=18)

    # The screen.  [DTD] via [R] §4.7: the display is the REMOTE — it repeats
    # the locator's readings, so the driller is steering on numbers relayed by
    # a person standing sixty metres away in a field.
    R.box('cab-display', (0.30, 0.03, 0.22), R.MAT_GLASS, None,
          (cx + 0.16, CAB_Y0 + 0.16, DECK_Z + 1.28), (0.22, 0, 0))
    for s in (-1, 1):
        R.tube('joystick-%d' % s, 0.022, 0.20, R.MAT_STEEL, None,
               (cx + s * 0.30, CAB_Y0 + 0.44, DECK_Z + 0.86), sides=8)
        R.box('joystick-grip-%d' % s, (0.07, 0.09, 0.13), R.MAT_RUBBER, None,
              (cx + s * 0.30, CAB_Y0 + 0.44, DECK_Z + 1.10), bevel=0.02)
    R.box('operator-seat', (0.46, 0.44, 0.12), R.MAT_RUBBER, None,
          (cx, cy + 0.12, DECK_Z + 0.46), bevel=0.03)
    R.box('operator-seat-back', (0.44, 0.10, 0.52), R.MAT_RUBBER, None,
          (cx, cy + 0.36, DECK_Z + 0.78), bevel=0.03)

    # grab rail and a mirror
    R.tube('cab-grab-rail', 0.020, 0.90, R.MAT_HAZARD, None,
           (CAB_X0 - 0.05, CAB_Y0 + 0.10, DECK_Z + 0.40), sides=8)


def build_crane():
    """[18ACS] callout 04 / [JCS130E] callout 08: "Hydraulic loading crane for
    self-sufficient handling of optional stacking boxes, drilling rods and
    attachments."  Modelled folded, which is how it travels and how it sits
    while the machine is drilling.  [R] §4.7 notes fitting one raises transport
    height, which is why it is an option — so it is kept low over the rod box.
    """
    bx, by = 0.95, 2.36
    R.tube('crane-pedestal', 0.16, 0.52, R.MAT_PAINT, None,
           (bx, by, DECK_Z + 0.02), sides=14)
    col = R.tube('crane-column', 0.13, 0.46, R.MAT_PAINT, None,
                 (bx, by, DECK_Z + 0.54), sides=14)
    # first boom, folded forward and low over the magazine
    R.box('crane-boom-1', (0.20, 1.70, 0.24), R.MAT_PAINT, None,
          (bx, by - 0.88, DECK_Z + 1.02), (0.14, 0, 0), bevel=0.02)
    # knuckle, folded back on itself — the signature of a loader crane
    R.box('crane-boom-2', (0.16, 1.30, 0.19), R.MAT_PAINT, None,
          (bx - 0.02, by - 1.20, DECK_Z + 1.32), (-0.10, 0, 0), bevel=0.02)
    R.tube('crane-knuckle-pin', 0.055, 0.26, R.MAT_STEEL, None,
           (bx - 0.13, by - 1.74, DECK_Z + 1.14), (0, math.pi / 2, 0), sides=12)
    R.tube('crane-ram', 0.048, 0.72, R.MAT_CHROME, None,
           (bx + 0.16, by - 0.40, DECK_Z + 0.86), (1.30, 0, 0), sides=10)
    R.box('crane-hook-block', (0.10, 0.12, 0.22), R.MAT_WORN, None,
          (bx - 0.02, by - 1.76, DECK_Z + 1.02), bevel=0.02)
    return col


# ═════════════════════════════════════════════════════════════════════════════
# ROD MAGAZINE — the machine's SECOND signature, and not a carousel
# ═════════════════════════════════════════════════════════════════════════════
def build_magazine():
    """[R] §5 signature 3 and §9-B, which is worth quoting because the game's
    own shop copy gets it wrong twice: "HDD pipe does not live in a carousel.
    A carousel is the rotating vertical rod magazine on a top-hammer or anchor
    rig... HDD rod lies flat in a box / magazine / rack alongside or under the
    main beam."

    So: rods HORIZONTAL, parallel to one another, in open-ended columns whose
    ends you can see.  At thumbnail size this reads as a striped rectangular
    block, and — this is the recognition cue — its stripes are HORIZONTAL while
    the beam above them is RAKED.  That mismatch of angles is itself diagnostic,
    which is why the magazine is built on the CHASSIS and not on `pivot:rack`.

    Internal arrangement from [P-MAG]: vertical columns, gravity-fed, drawn down
    nearest-the-drill-axis first.  Modelled as a full box, since a machine that
    has not started its bore is carrying its whole string.
    """
    w = MAG_COLS * ROD_PITCH + 0.06
    h = MAG_ROWS * ROD_PITCH + 0.06
    ln = MAG_Y1 - MAG_Y0
    cy = (MAG_Y0 + MAG_Y1) / 2

    # frame: floor, outer wall, and column dividers open at the ends
    R.box('mag-floor', (w, ln, 0.04), R.MAT_DARK, None,
          (MAG_X, cy, MAG_Z0 - 0.02), bevel=0.008)
    R.box('mag-outer-wall', (0.035, ln, h), R.MAT_DARK, None,
          (MAG_X + w / 2, cy, MAG_Z0 + h / 2), bevel=0.008)
    R.box('mag-inner-wall', (0.035, ln, h), R.MAT_DARK, None,
          (MAG_X - w / 2, cy, MAG_Z0 + h / 2), bevel=0.008)
    for c in range(1, MAG_COLS):
        R.box('mag-divider-%d' % c, (0.016, ln - 0.30, h - 0.05), R.MAT_WORN,
              None, (MAG_X - w / 2 + 0.03 + c * ROD_PITCH, cy,
                     MAG_Z0 + h / 2))
    # end stops — chipped, because rods drop in against them ([R] §6.3)
    for tag, yy in (('f', MAG_Y0), ('r', MAG_Y1)):
        R.box('mag-endstop-%s' % tag, (w, 0.04, h * 0.55), R.MAT_WORN, None,
              (MAG_X, yy, MAG_Z0 + h * 0.30), bevel=0.008)
    # a light external frame carrying it off the deck
    for i in range(4):
        yy = MAG_Y0 + 0.45 + i * (ln - 0.90) / 3.0
        R.box('mag-leg-%d' % i, (w + 0.05, 0.07, MAG_Z0 - DECK_Z), R.MAT_DARK,
              None, (MAG_X, yy, (DECK_Z + MAG_Z0) / 2), bevel=0.01)

    # ── the rods ─────────────────────────────────────────────────────────────
    # 70 of them [JCS300].  They share one material, so they join to a single
    # draw call and cost only triangles — which is exactly the lane the
    # pipeline says to spend in.
    n = 0
    for row in range(MAG_ROWS):
        for col in range(MAG_COLS):
            if n >= ROD_COUNT:
                break
            x = MAG_X - w / 2 + 0.03 + (col + 0.5) * ROD_PITCH
            z = MAG_Z0 + 0.03 + (row + 0.5) * ROD_PITCH
            R.tube('rod-%d' % n, ROD_OD / 2, ROD_LEN, R.MAT_WORN, None,
                   (x, cy - ROD_LEN / 2, z), (-math.pi / 2, 0, 0), sides=10)
            # the forged tool joints at each end: a separate, brighter value,
            # with the hard banding that is the shiniest part of a used rod
            for e in (0, 1):
                R.tube('rod-joint-%d-%d' % (n, e), JOINT_OD / 2, 0.19,
                       R.MAT_STEEL, None,
                       (x, cy - ROD_LEN / 2 + e * (ROD_LEN - 0.19), z),
                       (-math.pi / 2, 0, 0), sides=10)
            n += 1

    # ── the stack-up box ─────────────────────────────────────────────────────
    # [JCS300]: "Up to six additional rods can be reloaded simultaneously."
    # [18ACS]: the crane exists to handle "stacking boxes".  [R] §4.5 calls a
    # spare box "free site furniture that is both true and story-bearing".
    sx = MAG_X
    sz = MAG_Z0 + h + 0.05
    R.box('stackbox-floor', (w, ln * 0.62, 0.04), R.MAT_DARK, None,
          (sx, cy - 0.20, sz), bevel=0.008)
    for s in (-1, 1):
        R.box('stackbox-wall-%d' % s, (0.03, ln * 0.62, 0.18), R.MAT_DARK,
              None, (sx + s * w / 2, cy - 0.20, sz + 0.11), bevel=0.006)
    for i in range(6):
        R.tube('stackrod-%d' % i, ROD_OD / 2, ROD_LEN * 0.60, R.MAT_STEEL,
               None, (sx - w / 2 + 0.10 + i * ROD_PITCH,
                      cy - 0.20 - ROD_LEN * 0.30, sz + 0.08),
               (-math.pi / 2, 0, 0), sides=10)


def build_rod_loader(parent):
    """[R07] §D1's Herrenknecht term is the **erector unit**; [R] §4.5 describes
    it as "an arm that swings one rod at a time up into line with the carriage".
    A `pivot:` because that swing is the rod-change animation.
    """
    pv = R.empty(R.NODE_PIVOT, 'rod-loader', parent,
                 (MAG_X - 0.50, (MAG_Y0 + MAG_Y1) / 2, MAG_Z0 + 0.10))
    R.box('loader-arm', (0.14, 0.16, 0.62), R.MAT_PAINT, pv,
          (0, 0, 0.31), (0, -0.42, 0), bevel=0.015)
    R.box('loader-cradle', (0.30, 0.36, 0.10), R.MAT_WORN, pv,
          (-0.24, 0, 0.60), bevel=0.015)
    for s in (-1, 1):
        R.box('loader-jaw-%d' % s, (0.05, 0.30, 0.17), R.MAT_STEEL, pv,
              (-0.24 + s * 0.13, 0, 0.72), (0, -s * 0.30, 0), bevel=0.01)
    R.tube('loader-ram', 0.032, 0.44, R.MAT_CHROME, pv,
           (0.16, 0, 0.10), (0, 0.55, 0), sides=10)
    return pv


# ═════════════════════════════════════════════════════════════════════════════
# THE MAIN BEAM — everything below rides `pivot:rack`
# ═════════════════════════════════════════════════════════════════════════════
# Local frame: +Y runs REARWARD-AND-UP along the beam, origin at the pivot, so
# the nose is at local y = -RACK_FWD and the tail at +RACK_AFT. The drill axis
# is local z = 0.
def build_rack():
    pv = R.empty(R.NODE_PIVOT, 'rack', None, (0, PIV_Y, PIV_Z), (ENTRY, 0, 0))

    y0 = -RACK_FWD
    hw = RACK_W / 2

    # ── the box girder ───────────────────────────────────────────────────────
    # NOT SOURCED as a section ([R] §8.1) — declared at the constant.
    beam('rack-web-l', RACK_LEN, 0.030, RACK_D, R.MAT_DARK, pv, y0,
         x=-hw + 0.015, z=-RACK_D / 2 - 0.09)
    beam('rack-web-r', RACK_LEN, 0.030, RACK_D, R.MAT_DARK, pv, y0,
         x=hw - 0.015, z=-RACK_D / 2 - 0.09)
    beam('rack-bottom', RACK_LEN, RACK_W, 0.030, R.MAT_DARK, pv, y0,
         z=-RACK_D - 0.09)
    beam('rack-top', RACK_LEN, RACK_W, 0.030, R.MAT_DARK, pv, y0, z=-0.09)

    # transverse diaphragms — what makes it a stiff reaction member rather
    # than a mast that bows.  [R] §9-C: this beam is staked to the ground and
    # carries the machine's entire thrust and pullback into the soil; it must
    # NOT read as a two-piece flexing derrick, and there is no splice flange
    # anywhere on it.
    nd = 11
    for i in range(nd):
        yy = y0 + 0.34 + i * (RACK_LEN - 0.68) / (nd - 1.0)
        R.box('rack-diaphragm-%d' % i, (RACK_W - 0.07, 0.022, RACK_D - 0.05),
              R.MAT_DARK, pv, (0, yy, -RACK_D / 2 - 0.09))

    # ── the RACK STRIP ───────────────────────────────────────────────────────
    # [18ACS], verbatim: "Drive carriages with 'rack and pinion': Stepless
    # adjustment of torque and speed for maximum rotational power".  [R] §4.1
    # and §9-D: the toothed strip is the ONE detail that distinguishes an HDD
    # beam from every other feed rail in this game — everything else here uses
    # chain or cylinder feed — so it is free silhouette differentiation.
    #
    # NOT SOURCED: tooth module, rack width, one rack or two.  [R] §9-D warns
    # against modelling a tooth count somebody can count against a photograph;
    # the pitch below is declared arbitrary and is chosen only to read as teeth
    # at normal viewing distance.
    RACK_PITCH = 0.075                                   # NOT SOURCED
    beam('rack-strip-base', RACK_LEN - 0.20, 0.085, 0.045, R.MAT_WORN, pv,
         y0 + 0.10, x=-hw - 0.045, z=-RACK_D / 2 - 0.09)
    nt = int((RACK_LEN - 0.30) / RACK_PITCH)
    for i in range(nt):
        yy = y0 + 0.15 + (i + 0.5) * RACK_PITCH
        R.box('rack-tooth-%d' % i, (0.036, RACK_PITCH * 0.52, 0.052),
              R.MAT_WORN, pv, (-hw - 0.098, yy, -RACK_D / 2 - 0.09),
              bevel=0.004)

    # ── the slide rails ──────────────────────────────────────────────────────
    # [R] §9-D: the bolted-on, separately-replaceable hardened rails are one of
    # the things the existing procedural beam already gets RIGHT and that must
    # survive — they are consumable, the slide pads eat them.  MAT_STEEL gives
    # them the bright rubbed value; the polish stripe is the runtime's job.
    for s in (-1, 1):
        beam('rack-rail-%d' % s, RACK_LEN - 0.16, 0.055, 0.042, R.MAT_STEEL,
             pv, y0 + 0.08, x=s * (hw + 0.028), z=-0.115)
        nb = 16
        for i in range(nb):
            yy = y0 + 0.24 + i * (RACK_LEN - 0.48) / (nb - 1.0)
            R.tube('rail-bolt-%d-%d' % (s, i), 0.011, 0.022, R.MAT_STEEL, pv,
                   (s * (hw + 0.056), yy, -0.115), (0, s * math.pi / 2, 0),
                   sides=6)

    # ── the cable carrier ────────────────────────────────────────────────────
    # [R] §4.2 / §9-D: the mud hose and the hydraulics must reach a carriage
    # that travels the whole beam, so a growing and shrinking loop in a drag
    # chain is real hardware, not decoration.
    beam('cable-carrier-tray', RACK_LEN - 0.30, 0.17, 0.05, R.MAT_DARK, pv,
         y0 + 0.15, x=hw + 0.13, z=-RACK_D - 0.02)
    nlink = 26
    for i in range(nlink):
        yy = y0 + 0.30 + i * (RACK_LEN - 0.90) / (nlink - 1.0)
        R.box('carrier-link-%d' % i, (0.13, 0.055, 0.075), R.MAT_DARK, pv,
              (hw + 0.13, yy, -RACK_D + 0.04), bevel=0.006)

    # ── the catwalk ──────────────────────────────────────────────────────────
    cw_len = (CATWALK_Y1 - PIV_Y) / math.cos(ENTRY) + RACK_FWD - 0.20
    cwx = (CATWALK_X0 + CATWALK_X1) / 2
    beam('catwalk-deck', cw_len, CATWALK_X1 - CATWALK_X0, 0.035, R.MAT_HAZARD,
         pv, y0 + 0.14, x=cwx, z=-RACK_D - 0.10)
    beam('catwalk-toe', cw_len, 0.025, 0.08, R.MAT_HAZARD, pv, y0 + 0.14,
         x=CATWALK_X0, z=-RACK_D - 0.05)
    nst = 8
    for i in range(nst):
        yy = y0 + 0.30 + i * (cw_len - 0.40) / (nst - 1.0)
        R.tube('handrail-stanchion-%d' % i, 0.017, 1.02, R.MAT_HAZARD, pv,
               (CATWALK_X0 + 0.03, yy, -RACK_D - 0.09), sides=8)
    for zz in (0.52, 1.00):
        beam('handrail-%d' % int(zz * 100), cw_len - 0.30, 0.022, 0.022,
             R.MAT_HAZARD, pv, y0 + 0.30, x=CATWALK_X0 + 0.03,
             z=-RACK_D - 0.09 + zz)

    # ── the beam nose ────────────────────────────────────────────────────────
    # [R] §4.1: the nose carries the break-out unit, the rod wiper and the
    # anchor tie-in, and it is the dirtiest end of the machine ([R] §6.3).
    R.box('rack-nose-plate', (RACK_W + 0.24, 0.11, RACK_D + 0.30), R.MAT_DARK,
          pv, (0, y0 - 0.05, -RACK_D / 2 - 0.05), bevel=0.02)
    for s in (-1, 1):
        R.box('nose-gusset-%d' % s, (0.028, 0.46, RACK_D + 0.18), R.MAT_DARK,
              pv, (s * (hw + 0.10), y0 + 0.24, -RACK_D / 2 - 0.02))

    # the tilt rams, back to the chassis.  Built on the rack so they follow it;
    # they are the visible answer to "what sets the angle".
    for s in (-1, 1):
        R.tube('tilt-ram-barrel-%d' % s, 0.075, 0.86, R.MAT_PAINT, pv,
               (s * (hw + 0.20), y0 + 1.05, -RACK_D - 0.16),
               (-0.62, 0, 0), sides=12)
        R.tube('tilt-ram-rod-%d' % s, 0.046, 0.52, R.MAT_CHROME, pv,
               (s * (hw + 0.20), y0 + 1.55, -RACK_D - 0.52),
               (-0.62, 0, 0), sides=10)
    return pv


def build_vice(rack):
    """The break-out unit — [R07] §D1's Herrenknecht term; field names **vise**
    and **breakout wrench**.

    Two corrections from [R] §4.3 / §9-L over the existing procedural mesh,
    both differences in KIND and not in detail:
      * it is OPEN-TOPPED, so a rod drops in from above rather than threading
        in from the end (Vermeer publishes "Angled, open-top", "semi-open top
        vise", "Open-top, dual clamp" across three machines);
      * it SLIDES along the beam to make and break the joint — hence `slide:`.
    NOT SOURCED for a 330 kN machine: the slide travel and the jaw opening.
    The one published pair (899 mm travel, 259 mm opening) is from a 1,077 kN
    rig and [R] §4.3 says explicitly it must not be transferred.
    """
    y0 = -RACK_FWD
    sl = R.empty(R.NODE_SLIDE, 'vice', rack, (0, y0 + 0.62, 0))
    R.box('vice-frame', (RACK_W + 0.34, 0.46, 0.50), R.MAT_DARK, sl,
          (0, 0, -0.10), bevel=0.02)
    # open top: two side posts and NO top member
    for s in (-1, 1):
        R.box('vice-post-%d' % s, (0.10, 0.42, 0.44), R.MAT_DARK, sl,
              (s * (RACK_W / 2 + 0.13), 0, 0.16), bevel=0.015)
    # the two jaws — one holds, one turns
    for s in (-1, 1):
        R.box('vice-jaw-%d' % s, (0.17, 0.34, 0.26), R.MAT_STEEL, sl,
              (s * 0.20, 0, 0.02), bevel=0.012)
        for i in range(5):                    # serrations, which hold the mud
            R.box('vice-serration-%d-%d' % (s, i), (0.015, 0.30, 0.022),
                  R.MAT_STEEL, sl, (s * 0.115, 0, -0.08 + i * 0.045))
        R.tube('vice-cyl-%d' % s, 0.045, 0.26, R.MAT_PAINT, sl,
               (s * (RACK_W / 2 + 0.10), 0, 0.02), (0, -s * math.pi / 2, 0),
               sides=10)
        R.tube('vice-rod-%d' % s, 0.026, 0.14, R.MAT_CHROME, sl,
               (s * 0.34, 0, 0.02), (0, -s * math.pi / 2, 0), sides=8)
    # the breakout wrench: the jaw that rotates
    R.tube('breakout-wrench-ring', 0.20, 0.10, R.MAT_CAST, sl,
           (0, -0.28, 0.02), (math.pi / 2, 0, 0), sides=16)
    R.box('breakout-wrench-arm', (0.13, 0.40, 0.12), R.MAT_CAST, sl,
          (0.30, -0.28, 0.02), (0, 0, 0.5), bevel=0.012)

    # thread compound.  [DTD] p.8 via [R] §4.3: "an anti-seizing compound,
    # frequently a high-pressure, copper-petroleum based grease".  A filthy tub
    # with a brush in it beside the vice is, in that section's words, "one of
    # the most authentic props available" — and nothing else in this game has
    # that colour.
    R.tube('dope-bucket', 0.085, 0.17, R.MAT_WORN, sl,
           (-(RACK_W / 2 + 0.24), 0.10, -0.28), sides=12)
    R.tube('dope-brush', 0.013, 0.20, R.MAT_WORN, sl,
           (-(RACK_W / 2 + 0.24), 0.10, -0.14), (0.3, 0.2, 0), sides=6)
    return sl


def build_carriage(rack):
    """[R07] §D1's "carriage (main drive)".  It does four things at once:
    rotates the string, pushes it, pulls it, and passes drilling fluid into it.

    It is the only large moving object on the machine and its travel IS the
    drilling animation — down the beam to push a rod in, back up to collect the
    next.  Rapid-travel speed for the class is 36-73 m/min ([R] §3.8); the
    working advance is far slower, and pullback slower still at 0.3-0.6 m/min.
    """
    sl = R.empty(R.NODE_SLIDE, 'carriage', rack, (0, RACK_AFT - 1.15, 0))

    R.box('carriage-frame', (RACK_W + 0.30, 0.94, 0.40), R.MAT_DARK, sl,
          (0, 0, -0.14), bevel=0.02)
    # slide pads on the rails — the wear pair for the bolted-on rail strips
    for s in (-1, 1):
        for e in (-1, 1):
            R.box('slide-pad-%d-%d' % (s, e), (0.09, 0.20, 0.075),
                  R.MAT_STEEL, sl, (s * (RACK_W / 2 + 0.028), e * 0.34,
                                    -0.115), bevel=0.008)
    # ── the pinion gearcase ──────────────────────────────────────────────────
    # The half of "rack and pinion" that lives on the carriage.  Without a
    # visible pinion housing engaging the strip, the rack strip is decoration.
    R.box('pinion-case', (0.22, 0.40, 0.34), R.MAT_CAST, sl,
          (-(RACK_W / 2 + 0.11), 0.02, -0.22), bevel=0.018)
    R.tube('pinion', 0.072, 0.06, R.MAT_STEEL, sl,
           (-(RACK_W / 2 + 0.088), 0.02, -0.22), (0, math.pi / 2, 0), sides=14)
    R.tube('feed-motor', 0.10, 0.24, R.MAT_PAINT, sl,
           (-(RACK_W / 2 + 0.24), 0.02, -0.22), (0, -math.pi / 2, 0), sides=14)

    # ── the rotary drive ─────────────────────────────────────────────────────
    R.box('rotary-housing', (0.60, 0.72, 0.56), R.MAT_PAINT, sl,
          (0, 0.06, 0.24), bevel=0.03)
    R.box('rotary-gearcase', (0.46, 0.26, 0.44), R.MAT_CAST, sl,
          (0, -0.36, 0.20), bevel=0.02)
    R.tube('rotary-motor', 0.115, 0.30, R.MAT_PAINT, sl,
           (0.28, 0.44, 0.24), (0, math.pi / 2, 0), sides=14)

    # the spindle turns SLOWLY and visibly — ~30 rpm working, one turn every
    # two seconds ([R] §3.8, §4.2).  A blurred spindle is wrong.
    spn = R.empty(R.NODE_PIVOT, 'spindle', sl, (0, -0.50, 0))
    R.tube('spindle-shaft', 0.075, 0.34, R.MAT_STEEL, spn, (0, 0, 0),
           (math.pi / 2, 0, 0), sides=14)
    R.tube('drive-chuck', 0.098, 0.20, R.MAT_WORN, spn, (0, -0.30, 0),
           (math.pi / 2, 0, 0), sides=14)
    R.tube('saver-sub', 0.078, 0.16, R.MAT_WORN, spn, (0, -0.48, 0),
           (math.pi / 2, 0, 0), sides=12)
    for i in range(6):                        # wrench flats on the saver sub
        a = i * math.pi / 3.0
        R.box('saver-flat-%d' % i, (0.02, 0.10, 0.055), R.MAT_STEEL, spn,
              (math.sin(a) * 0.078, -0.42, math.cos(a) * 0.078), (0, a, 0))

    # ── the fluid swivel ─────────────────────────────────────────────────────
    # Where the mud hose enters the back of the spindle.  It must follow the
    # carriage over the whole beam, which is what the cable carrier is for.
    R.tube('fluid-swivel', 0.088, 0.24, R.MAT_CAST, sl, (0, 0.52, 0),
           (math.pi / 2, 0, 0), sides=14)
    R.tube('swivel-inlet', 0.052, 0.16, R.MAT_STEEL, sl, (0.10, 0.62, 0.02),
           (0, 1.0, 0), sides=10)
    return sl, spn


# ═════════════════════════════════════════════════════════════════════════════
# THE NOSE END — rod wiper, string, entry
# ═════════════════════════════════════════════════════════════════════════════
def build_string(rack):
    """The rod in the hole, and the wiper it passes through.

    [R] §4.4 / §9-I: the rubber ring at the collar is a real named part — the
    **rod wiper**, field name the **doughnut**: "a rubber or synthetic grommet
    placed over the drill rods during pullback to strip excess mud from the
    rods before they are stowed" [DTD].  The existing procedural mesh has the
    ring and made it rubber but never named it; §9-I asks for the name, so it
    is `rod-wiper` here.  It is the boundary between the wet world and the dry
    one, and the single dirtiest object on the machine.
    """
    y0 = -RACK_FWD
    R.tube('rod-wiper', 0.135, 0.17, R.MAT_RUBBER, rack, (0, y0 - 0.20, 0),
           (math.pi / 2, 0, 0), sides=16)
    R.tube('rod-wiper-retainer', 0.150, 0.035, R.MAT_STEEL, rack,
           (0, y0 - 0.12, 0), (math.pi / 2, 0, 0), sides=16)

    # The string itself, sliding down the beam and into the earth.  A `slide:`
    # because on this method the string is ALWAYS in the hole — [R07] §A4's
    # animation invariant: "A complete drill string is in the borehole at all
    # times, regardless of the position of the reamer."
    sl = R.empty(R.NODE_SLIDE, 'string', rack, (0, y0 - 0.30, 0))
    R.tube('string-rod', ROD_OD / 2, 2.60, R.MAT_WORN, sl, (0, 0, 0),
           (-math.pi / 2, 0, 0), sides=12)
    R.tube('string-joint', JOINT_OD / 2, 0.19, R.MAT_STEEL, sl,
           (0, -0.10, 0), (-math.pi / 2, 0, 0), sides=12)
    return sl


def build_entry():
    """The entry — and the negative space around it, which [R] §5 lists as the
    method's SECOND signature: "there is no hole at the rig's feet, no casing
    standing up, no spoil ring around a collar... A viewer's eye follows the
    beam and finds ordinary grass."

    So: no collar, no spoil pile, and — deliberately — NO ENTRY PIT AND NO
    BERM in this file.  The 305 mm bunded pit is real and sourced ([R07] §D5),
    but it is GROUND, not machine: [R] §9-K lists it under "what is missing
    from the SCENE, not the machine" and assigns it to staging alongside the
    reclaimer, the exit pit and the strung product pipe.  Building it into the
    rig `.glb` would double-draw against whatever `terrain.js` puts there and
    would drag the model's own bounding box two metres past its nose.

    What this function does contribute is the string itself, crossing the open
    ground and disappearing into it — which is the whole read of the method.
    """
    # The string continuing into the ground at the entry angle. Just enough
    # below z = 0 to read as entering rather than stopping at the surface.
    R.tube('string-entry', ROD_OD / 2, 0.62, R.MAT_WORN, None,
           (0, HOLE_Y + 0.62 * math.cos(ENTRY), 0.62 * math.sin(ENTRY)),
           (math.pi - ENTRY, 0, 0), sides=12)

    # `mount:hole` — published so nothing downstream has to guess where the
    # work happens.  It is 1.87 m in front of the beam nose, not under the
    # machine, and that setback is sourced ([R07] §A1: 0.9-6.1 m).
    R.empty(R.NODE_MOUNT, 'hole', None, (0, HOLE_Y, 0.0))


# ═════════════════════════════════════════════════════════════════════════════
# ANCHORS AND STABILISERS
# ═════════════════════════════════════════════════════════════════════════════
def auger(name, parent, x, y):
    """One power-auger stakedown.

    [P-ANCH] is the whole basis for this shape: the anchors are AUGERS,
    "screwed or embedded into the ground", "rotated by rotary drives" — so they
    must have MOTORS on top.  [R] §9-G's first instruction is "Make them
    augers, not spikes... Straight smooth cylinders are the one thing they are
    definitely not."

    Every dimension here is NOT SOURCED and declared as such at the constants:
    [R] §8.2 searched specifically for auger flight diameter, stake length,
    embedded depth and holding capacity and found none of them.
    """
    pv = R.empty(R.NODE_PIVOT, name, parent, (x, y, 0.10))
    R.tube(name + '-shaft', 0.052, AUGER_LEN, R.MAT_WORN, pv, (0, 0, 0),
           sides=12)
    # the helical flight, approximated by stepped vanes — reads as a screw at
    # game distance and costs triangles, not draw calls
    turns, per = 3.0, 10
    n = int(turns * per)
    for i in range(n):
        a = 2 * math.pi * i / per
        z = 0.06 + i * (AUGER_LEN * 0.62) / n
        R.box(name + '-flight-%d' % i, (AUGER_R * 2, 0.055, 0.016),
              R.MAT_WORN, pv, (0, 0, z), (0.30, 0, a))
    # the rotary drive that screws it in
    R.box(name + '-drive', (0.30, 0.30, 0.30), R.MAT_PAINT, pv,
          (0, 0, AUGER_LEN + 0.15), bevel=0.02)
    R.tube(name + '-motor', 0.085, 0.22, R.MAT_CAST, pv,
           (0.16, 0, AUGER_LEN + 0.30), sides=12)
    # the feed cylinder that pushes while the motor turns
    R.tube(name + '-cyl', 0.048, 0.70, R.MAT_PAINT, pv,
           (-0.20, 0, AUGER_LEN - 0.30), sides=10)
    R.tube(name + '-cyl-rod', 0.028, 0.30, R.MAT_CHROME, pv,
           (-0.20, 0, AUGER_LEN + 0.40), sides=8)
    return pv


def build_anchors():
    """The part that makes HDD physically possible, and the one the existing
    procedural mesh treats as a gesture.

    [R07] §D1: "The whole assembly is anchored - it has to react up to its full
    thrust and pullback into the ground."  [R] §4.6 calls this the most
    under-appreciated component on the machine and says the anchor must read as
    STRUCTURE CARRYING LOAD, not pegs in the dirt — so there is a transverse
    beam, gussets into it, a bearing foot, and a plate.

    And the plate is a TRAY.  [18ACS] "Anchoring system with drilling fluid
    collecting tray"; [JCS130E] "Anchor plate as drip pan for drilling fluid
    contributes to a clean jobsite".  [R] §4.6 calls that "the best single
    modelling detail in this whole document": the plate at the nose is the load
    path AND the dirt story in one part, and it should never be seen clean.
    """
    cy = (TRAY_Y0 + TRAY_Y1) / 2
    ln = TRAY_Y1 - TRAY_Y0

    # the tray: a shallow steel pan with a lip, sitting on the ground
    R.box('anchor-tray-floor', (TRAY_W, ln, 0.030), R.MAT_WORN, None,
          (0, cy, 0.045), bevel=0.008)
    for s in (-1, 1):
        R.box('anchor-tray-lip-x-%d' % s, (0.035, ln, 0.13), R.MAT_WORN, None,
              (s * TRAY_W / 2, cy, 0.11), bevel=0.006)
    for tag, yy in (('f', TRAY_Y0), ('r', TRAY_Y1)):
        R.box('anchor-tray-lip-y-%s' % tag, (TRAY_W, 0.035, 0.13), R.MAT_WORN,
              None, (0, yy, 0.11), bevel=0.006)
    # a sump at the low corner, and the optional bentonite suction pump that
    # sits on it — [18ACS] callout 05
    R.box('tray-sump', (0.40, 0.40, 0.09), R.MAT_WORN, None,
          (-0.55, TRAY_Y1 - 0.34, 0.075), bevel=0.01)
    R.tube('tray-suction-pump', 0.115, 0.30, R.MAT_PAINT, None,
           (-0.55, TRAY_Y1 - 0.34, 0.13), sides=14)
    R.tube('tray-suction-inlet', 0.055, 0.18, R.MAT_STEEL, None,
           (-0.55, TRAY_Y1 - 0.34, 0.10), (math.pi / 2, 0, 0), sides=10)

    # ── the load path, drawn ─────────────────────────────────────────────────
    # a transverse anchor beam across the nose, tied back into the beam foot
    R.box('anchor-beam', (TRAY_W + 0.30, 0.26, 0.30), R.MAT_DARK, None,
          (0, TRAY_Y1 - 0.10, 0.42), bevel=0.02)
    for s in (-1, 1):
        R.box('anchor-gusset-%d' % s, (0.030, 0.90, 0.34), R.MAT_DARK, None,
              (s * 0.42, TRAY_Y1 + 0.36, 0.46))
        R.box('anchor-foot-%d' % s, (0.36, 0.36, 0.05), R.MAT_WORN, None,
              (s * 0.42, TRAY_Y1 + 0.78, 0.025), bevel=0.008)
    # the tie bars back to the rack nose plate
    for s in (-1, 1):
        R.box('anchor-tie-%d' % s, (0.05, 1.10, 0.13), R.MAT_DARK, None,
              (s * 0.42, TRAY_Y1 + 0.55, 0.56), (0.22, 0, 0), bevel=0.01)

    # ── the two augers, deliberately ASYMMETRIC ──────────────────────────────
    # [P-ANCH]: one fixed, one on a "lateral extension member".  The mount is
    # "pivotally connected to the frame at a tilt axis" transverse to the
    # thrust axis, so each auger gets its own `pivot:` and the movable one
    # additionally rides a `slide:`.
    auger('anchor-l', None, -AUGER_X, TRAY_Y1 - 0.10)
    lat = R.empty(R.NODE_SLIDE, 'anchor-lateral', None, (0, 0, 0))
    R.box('anchor-lateral-arm', (0.70, 0.16, 0.14), R.MAT_DARK, lat,
          (AUGER_X + 0.20, TRAY_Y1 - 0.10, 0.44), bevel=0.012)
    auger('anchor-r', lat, AUGER_X2, TRAY_Y1 - 0.10)
    return lat


def build_stabilisers():
    """[18ACS] callout 06: "Two stabilisers - maximum stability, variable
    inclination of the cradle for an ideal penetration angle."  [JCS130E]
    callout 06 repeats it.

    [R] §3.2 rule 3 is what makes these matter: the steepest rack angles need
    the back of the machine jacked off its tracks onto pads, which is why one
    manufacturer publishes 18 deg AND 12 deg "tracks on ground" for the same
    rig.  So these are not decoration — they are half the angle mechanism, and
    the game can drive them.
    """
    out = []
    for s in (-1, 1):
        sl = R.empty(R.NODE_SLIDE, 'stabiliser-%s' % ('l' if s < 0 else 'r'),
                     None, (s * (BODY_W / 2 - 0.10), BODY_Y1 - 0.55, DECK_Z))
        # Modelled DEPLOYED AND BEARING, because that is the pose that goes
        # with a 16 deg rack — the pad soles sit ON grade, not through it.
        # `slide:` is the extension, so the game can jack the machine up or
        # stow the legs for travel.
        R.box('stab-mount-%d' % s, (0.26, 0.34, 0.42), R.MAT_DARK, sl,
              (0, 0, -0.18), bevel=0.02)
        R.tube('stab-barrel-%d' % s, 0.078, 0.70, R.MAT_PAINT, sl,
               (0, 0, -0.86), sides=12)
        R.tube('stab-rod-%d' % s, 0.048, 0.30, R.MAT_CHROME, sl,
               (0, 0, -1.00), sides=10)
        R.box('stab-pad-%d' % s, (0.42, 0.42, 0.06), R.MAT_WORN, sl,
              (0, 0, -DECK_Z + 0.03), bevel=0.01)
        out.append(sl)
    return out


# ═════════════════════════════════════════════════════════════════════════════
# HOSES — the clearest tell that a machine was modelled from a photograph
# ═════════════════════════════════════════════════════════════════════════════
def build_hoses(rack):
    """[R] §6.1's modelling instruction is simple and it is the one that has to
    land: "mud hose is fatter than hydraulic hose — model it as a visibly
    larger diameter".  `hose()` gives the sag a straight cylinder never will.

    Four runs, each doing a real job:
      1. pump discharge -> up to the rack, then along it in the cable carrier
      2. the following loop at the carriage, which is why the carrier exists
      3. the fat suction leg off to the external mixing / recycling unit
      4. the return from the tray's suction pump back to the same unit

    Runs 1 and 2 are parented to `pivot:rack` and are written in RACK-LOCAL
    coordinates, so they stay on the beam when the game changes its angle.
    """
    y0 = -RACK_FWD
    hw = RACK_W / 2
    px = (PUMP_X0 + PUMP_X1) / 2
    py = (PUMP_Y0 + PUMP_Y1) / 2

    # 1. pump -> rack foot, in world space (it spans two frames, and the pump
    #    end is what has to stay put)
    R.hose('mud-hose-pump-to-rack', [
        (px - 0.10, py - 0.86, DECK_Z + 0.30),
        (px - 0.02, py - 1.40, DECK_Z + 0.16),
        (0.34, py - 2.20, DECK_Z + 0.22),
        (hw + 0.16, PIV_Y + 1.30, PIV_Z + 0.16),
    ], radius=MUD_HOSE_R, mat=R.MAT_RUBBER)

    # 2. along the beam in the carrier, then the loop into the swivel
    carr_y = RACK_AFT - 1.15
    R.hose('mud-hose-carrier', [
        (hw + 0.13, y0 + 0.34, -RACK_D + 0.08),
        (hw + 0.13, y0 + RACK_LEN * 0.42, -RACK_D + 0.08),
        (hw + 0.13, carr_y - 0.30, -RACK_D + 0.08),
        (hw + 0.13, carr_y + 0.28, -RACK_D + 0.14),
        (hw + 0.05, carr_y + 0.62, -0.10),
        (0.12, carr_y + 0.66, 0.02),
    ], radius=MUD_HOSE_R, mat=R.MAT_RUBBER, parent=rack)

    # the hydraulic bundle rides the same carrier and is visibly thinner
    for i, dx in enumerate((0.055, -0.055)):
        R.hose('hyd-hose-%d' % i, [
            (hw + 0.13 + dx, y0 + 0.40, -RACK_D + 0.02),
            (hw + 0.13 + dx, y0 + RACK_LEN * 0.45, -RACK_D + 0.02),
            (hw + 0.13 + dx, carr_y + 0.20, -RACK_D + 0.06),
            (hw + 0.02 + dx, carr_y + 0.50, -0.16),
        ], radius=HYD_HOSE_R, mat=R.MAT_RUBBER, parent=rack)

    # 3. the suction leg off to the mixing unit — the fattest line on site, and
    #    the one that says this machine is one item in a spread ([R] §4.9).
    #    It STOPS just clear of the tracks: the plant itself is staging, and a
    #    hose that ran the real distance to it would put the model's bounding
    #    box four metres off the side of a 2.55 m machine.
    R.hose('mud-suction-to-plant', [
        (px - 0.14, py + 0.20, DECK_Z + 0.36),
        (px - 0.55, py + 0.30, DECK_Z - 0.10),
        (-1.38, py + 0.36, 0.20),
        (-1.60, py - 0.55, 0.07),
        (-1.52, py - 1.60, 0.07),
    ], radius=SUCTION_R, mat=R.MAT_RUBBER)

    # 4. the return from the tray sump — the wettest hose on the job
    R.hose('mud-return-from-tray', [
        (-0.55, TRAY_Y1 - 0.34, 0.30),
        (-1.05, TRAY_Y1 - 0.16, 0.12),
        (-1.42, TRAY_Y1 + 1.70, 0.07),
        (-1.50, TRAY_Y1 + 3.60, 0.07),
        (-1.52, py - 1.68, 0.07),
    ], radius=SUCTION_R * 0.86, mat=R.MAT_RUBBER)


# ═════════════════════════════════════════════════════════════════════════════
# WORK LIGHTS
# ═════════════════════════════════════════════════════════════════════════════
def build_lights(rack):
    """`core/env.js` reads `ctx.rig.getWorkLights()` EVERY FRAME and re-aims
    spotlights at these nodes' live world positions.  For a rig that is not the
    jumbo or the longhole machine, env.js follows the lamp named
    **`feed-work-light`** (env.js ~l.513) — so that name must exist, and on
    this machine it belongs on the rack, aimed down the beam at the vice and
    the entry, so it sweeps when the rack angle changes.

    COUNT AND POSITIONS ARE NOT SOURCED — [R] §8.5 lists work-light count and
    position as an open gap for this machine.  What IS sourced is only that
    they exist and are standard fit: [VER4055] "Drilling lights: Standard";
    [18ACS] lists "LED lighting" in the cabin equipment.  Five is a working
    choice, not a measurement.
    """
    y0 = -RACK_FWD
    # the one env.js follows.  On the rack, so it sweeps with it.
    R.worklight('feed-work-light', rack, (RACK_W / 2 + 0.20, y0 + 1.55, 0.30),
                aim_dir=(-0.18, -1.0, -0.42), cone_deg=48, range_m=26)
    R.box('feed-lamp-housing', (0.17, 0.10, 0.13), R.MAT_DARK, rack,
          (RACK_W / 2 + 0.20, y0 + 1.55, 0.30), bevel=0.012)

    # the nose lamp, on the entry itself — the one place the crew works
    R.worklight('nose-work-light', rack, (-(RACK_W / 2 + 0.20), y0 + 0.30,
                                          0.26),
                aim_dir=(0.12, -1.0, -0.55), cone_deg=56, range_m=20)
    R.box('nose-lamp-housing', (0.16, 0.10, 0.12), R.MAT_DARK, rack,
          (-(RACK_W / 2 + 0.20), y0 + 0.30, 0.26), bevel=0.012)

    # cab corners
    for s in (-1, 1):
        nm = 'cab-%s-work-light' % ('l' if s < 0 else 'r')
        loc = ((CAB_X0 + CAB_X1) / 2 + s * 0.46, CAB_Y0 - 0.04,
               DECK_Z + CAB_H + 0.06)
        R.worklight(nm, None, loc, aim_dir=(s * 0.22, -1.0, -0.45),
                    cone_deg=60, range_m=22)
        R.box('cab-lamp-housing-%d' % s, (0.15, 0.10, 0.12), R.MAT_DARK, None,
              loc, bevel=0.012)

    # rear, over the hood — for reversing and for the pump bay
    R.worklight('rear-work-light', None, (-0.30, HOOD_Y1 - 0.06, HOOD_TOP),
                aim_dir=(-0.25, 1.0, -0.55), cone_deg=64, range_m=16)
    R.box('rear-lamp-housing', (0.15, 0.10, 0.12), R.MAT_DARK, None,
          (-0.30, HOOD_Y1 - 0.06, HOOD_TOP), bevel=0.012)

    # A beacon on a stalk, the class idiom for road-going plant. Also kept
    # inside the ~3.2 m transport envelope.
    R.tube('beacon-stalk', 0.014, 0.11, R.MAT_DARK, None,
           (0.86, HOOD_Y1 - 0.24, HOOD_TOP - 0.02), sides=6)
    R.tube('beacon', 0.055, 0.09, R.MAT_HAZARD, None,
           (0.86, HOOD_Y1 - 0.24, HOOD_TOP + 0.09), sides=12)


# ═════════════════════════════════════════════════════════════════════════════
def build(out_path):
    R.reset()

    build_undercarriage()
    build_chassis()
    build_powerpack()
    build_cabin()
    build_crane()
    build_magazine()

    rack = build_rack()
    vice = build_vice(rack)
    carriage, spindle = build_carriage(rack)
    string = build_string(rack)
    loader = build_rod_loader(None)

    lateral = build_anchors()
    stabs = build_stabilisers()
    build_entry()
    build_hoses(rack)
    build_lights(rack)

    # every node the game drives, in the order they must be collapsed:
    # a parent before the children it must not swallow
    dynamic = [rack, vice, carriage, spindle, string, loader, lateral]
    dynamic += [o for o in bpy.context.scene.objects
                if o.name.startswith(R.NODE_PIVOT) and 'anchor-' in o.name]
    dynamic += stabs

    # Order matters and each step exists for a measured reason:
    #   bake first  — Blender's join keeps only the ACTIVE object's modifier
    #                 stack, so an unbaked bevel elsewhere in the group is
    #                 silently dropped;
    #   curves next — a curve is its own primitive, i.e. one draw call per
    #                 hose, until it is a mesh;
    #   join_under  — collapse every moving assembly, which finish() will not
    #                 touch, to one mesh per material;
    #   finish      — join the statics and export.
    bake_modifiers()
    curves_to_mesh()
    for node in dynamic:
        join_under(node)

    return R.finish(out_path)


if __name__ == '__main__':
    # THE FILENAME IS THE RIG ID, NOT THE MODULE NAME.  `gltfRig.js` fetches
    # `models/<rigId>.glb` and the id in `data.js` is the hyphenated `hdd-rig`;
    # a Python module cannot be, hence `hdd_rig.py`.  `build.py` does the same
    # substitution, and `tools/checkmodels.mjs` fails the build on a rig
    # carrying two model files under two spellings — so this must match.
    out_dir = os.path.abspath(os.path.join(HERE, '..', 'public', 'models'))
    os.makedirs(out_dir, exist_ok=True)
    build(os.path.join(out_dir, 'hdd-rig.glb'))
