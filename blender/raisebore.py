"""
raisebore - underground raise boring machine (a "raise borer" / "raise drill").

In-game marque: **Vantera RB-92 Shaftline** (game/data.js).  No real
manufacturer name or model designation appears in any object name, material
name or exported string - DOMAIN.md section 10.  Provenance lives here, in
comments, where it belongs; the shapes are used, never the badge.

WHAT THIS MACHINE IS, AND THE THING EVERYONE GETS WRONG
-------------------------------------------------------
A raise borer is the odd one out in the whole fleet: **it does not drive
anywhere.**  No tracks, no wheels, no cab, no boom.  It is carried into a small
purpose-excavated chamber on an UPPER mine level in pieces, set on a poured
concrete pad, and **bolted down** so that it can react thousands of kilonewtons
of PULL into the rock itself [L1 C.2.5][W5][W8].

It drills one hole TWICE, in OPPOSITE DIRECTIONS [L1 A.5.1]:

  1. PILOT, DOWNWARD.  A sealed-bearing roller bit on hollow 1.5 m drill pipes
     is pushed DOWN from this level until it breaks through into the level
     below.  Water flush goes down the string and up the annulus.
  2. REAM, UPWARD.  The pilot bit is unscrewed from underneath and a reaming
     head is bolted on in its place.  The machine then rotates and PULLS that
     head back UP toward itself.  There is no flush at all on this pass - the
     cuttings fall by gravity into the lower chamber and are mucked with an LHD.

Four consequences decide the whole shape of this model.  A model that does not
show them is not a raise borer:

  (a) **It is a PULLING machine.**  The larger force is UP, and the machine is
      held DOWN against it.  Confirmed across the class: 1 600 kN down against
      4 500 kN up on one 3 m machine, 2 224 kN against 3 559 kN on another
      [W8][W2].  The cylinders stand on the base with their rods UP [W4b], so
      the FULL BORE lifts (ream, the big force) and the smaller ANNULUS pushes
      down (pilot, the small one).  That single arrangement is the geometric
      reason pull > thrust; see RAM_ROD for the arithmetic, which lands within
      2 % of a real machine's published ratio.
  (b) **It is NARROW and it is not a mast.**  Real machines of this exact force
      class are 1.74-1.98 m wide and 1.90-2.00 m deep on a 4.4-5.2 m derrick
      [W1][W2].  It is a two-column PORTAL - base plate, U-shaped main frame,
      two parallel guide columns, a fixed headframe across their tops, and a
      travelling crosshead running on them [W4a][W5].  Not a lattice, not a
      leader, and not the four-post tower this file's first draft had.
  (c) **The reaming head is NOT part of this machine.**  It is a separate
      object that lives down the hole, bolted to the bottom of the string.
      `src/rig/tools.js` builds it (`raisebore-reamer`) and the game hangs it
      on `mount:tool`.  Nothing here models a reamer head, and nothing here
      should ever grow one.  The head does not come up through this frame
      either - a 1.74 m wide derrick cannot pass a 3 m head, and the larger
      machines in the class explicitly have no opening worktable [W5].
  (d) **The pack is a separate spread on the floor.**  The machine "is composed
      of five major assemblies: the derrick; the hydraulic, lubrication, and
      electrical systems; and the control console" [W5].  The derrick is ONE of
      five objects in the scene, joined to the others by 15-30 m umbilicals
      [W1].  The silhouette is a machine plus a room's worth of loose
      equipment, not one self-contained vehicle.

LOCAL SOURCES
-------------
[L1]  research/03-mining.md, cited there throughout to a manufacturer
      raise-boring method reference [W-SANDVIK-RB]:
        A.5.1 (l.454-520)   the two-pass method; reaming heads 0.6-6 m; cutter
                            counts by diameter; head weights 2.7-38 t; stems
                            dia 228-381 mm; head centre bores 340/360/390 mm;
                            **drill pipe 1.5 m, hollow, high-torque thread**;
                            water flush on the pilot pass and NONE on the ream.
        C.2.5 (l.1005-1015) "not a mobile machine - set up and grouted down
                            onto a prepared concrete floor... a short, extremely
                            stiff DERRICK over a LARGE-DIAMETER ROTARY DRIVE
                            with a THRUST CYLINDER frame; 1.5 m drill pipes
                            handled by a PIPE LOADER; a hydraulic POWER PACK
                            and a WATER PUMP alongside."
        D.5, F.1.5          tooling taxonomy; the two-stage gameplay profile.
[L2]  research/rigs/raisebore.md - this machine's reference document, which I
      also own and have rewritten this session against the web sources below.
[L3]  src/game/data.js - the CONTENT AUTHORITY.  The model agrees with the
      game, not with a machine the game does not have:
        RIGS 'raisebore'      power 448 kW, torque 310 kNm, feedForce 4200 kN,
                              depthCapacity 600 m, transportTons 64,
                              **fuelPerHour 0** -> ELECTRIC.
        METHODS               rodLength 1.5 m, nominalDia 1800 mm, holeDia
                              600-6000 mm, flushMedium 'water', 'raise' mode.
        ITEMS                 rb-stem-254 (254 mm x 1.5 m, 340 kg),
                              rb-pilot-bit-311 (311 mm), reamers 1200/1800 mm.
[L4]  src/core/env.js - UNDERGROUND{} authored drives (longhole 5.0 x 5.0 m,
      rockbolt 5.6 x 5.4 m); **no 'raise-boring' entry exists**, so the game
      has no authored raise-bore chamber yet.  Also line 512: an underground
      rig that is not the jumbo and not the longhole cradle has its key light
      follow a lamp named exactly 'feed-work-light'.
[L5]  C:/Users/henri/Downloads/catalog_rocktool_english.pdf pp.31-32 and
      .../perforator_disccutter_schneidrolle_22.pdf, both opened this session.
      **Negative results for this machine** and recorded as such in [L2]: the
      first is reverse-circulation shaft-drilling tooling, the second is
      microtunnelling disc cutters.  Neither covers raise boring and neither
      contributes a single dimension here.  The one thing carried across is a
      cross-check that a large rotary head turns SLOWLY - 13.1 rpm at 900 mm
      falling to 6.0 rpm at 2100 mm - which agrees with the raise-boring
      reaming speeds in [W1] (0-16 rpm) from an unrelated direction.

WEB SOURCES  (retrieved 2026-09-05; the previous pass at [L2] had its search
budget exhausted and reached only one page, which is why that document called
this "the worst-sourced machine in the game".  That is now fixed.)
------------------------------------------------------------------------------
[W1]  Manufacturer technical specification sheets for a raise-boring machine
      range (five models, 1.0-6.0 m raises).  The single most useful source:
      full spec tables with derrick height extended/retracted, width, depth,
      weight, reaming torque and thrust, stroke, rpm, drill pipe, pilot hole,
      drill angle, and separate power-pack dimensions and weights.
[W2]  A second manufacturer's raise-borer information sheets (seven models).
      The best FOOTPRINT data found anywhere: extended height and width x depth
      for every model, with weights, thrusts and torques.
[W3]  A third manufacturer's raise-boring equipment brochure - the only source
      that tabulates **cylinder count against thrust**, plus stroke, rod sizes
      and installed power across four models.
[W4]  Patent literature, which is where the structure is actually described:
      (a) US3802057 - "a travelling support frame is mounted for up and down
          travel by **two parallel guide columns** secured at their lower ends
          to a base frame"; the base is "a base plate 12 and a generally
          U-shaped main frame 14"; "a **fixed cross frame** rigidly
          interconnects the upper ends of the guide columns"; the travelling
          cross frame "includes vertically spaced apart **upper and lower guide
          sleeves** which surroundingly engage the columns"; motors are "bolted
          to the housing", each "an electric motor and a **planetary type
          reduction transmission**", feeding "**collector gearing** having a
          pair of inputs and a single output"; "**triangularly arranged thrust
          ram means**" with "the drilling axis located substantially at the
          center of forces within the triangle".
      (b) US4315552 - the base is "a pair of **mounting pads** which are
          anchored to the ground surface by **suitable bolts**"; the work table
          "is connected to the base through **pivot pins** which allow [it] to
          be tilted by means of **a pair of turnbuckles**"; "the drill pipe
          sections will project through a **central opening in the work
          table**"; a "**sliding fork** mounted on the work table will be moved
          against the drill pipe by means of **hydraulic cylinders** and will
          engage several depressions or flats... The fork will support the
          weight of the drill pipe and lock the pipe against rotation."
[W5]  An underground-mining-methods textbook, raise boring chapter: the machine
      "is composed of five major assemblies: the derrick; the hydraulic,
      lubrication, and electrical systems; and the control console";
      "**Baseplates, mainframe, columns and headframe** provide the mounting
      structure"; "The **gearbox mounts directly to the main drive motors,
      employing a planetary reduction for its compactness**"; "**Hydraulic
      cylinders provide the thrust** required for lowering and lifting the
      drillstring"; "The **hydraulic power unit is skid-mounted**"; "The
      electrical system assembly consists of **an enclosed cabinet**"; the
      wrench is "a hydraulically powered **fork-shaped wrench**"; and the
      larger machines in the range "do not feature an opening worktable".
[W6]  A raise-boring contractor's published fleet pages - the source for the
      base beams: extended heights are quoted "**plus 400 mm beams if
      required**" (four machines) and "plus 500 mm beams" (one), and one entry
      explains them as "**Beams to allow hole break through (if required)**".
      Weight deltas give the beam set: 7.5 t bare -> 19.5 t "including beams".
[W7]  A manufacturer product-colour manual: the official product colours are a
      yellow, a light grey, a dark grey, a white and a black, and the layering
      rule is explicit - "we always strive to use **the darker color for
      elements that support or carry elements in the lighter color**... the
      dark gray carries the yellow".  Yellow is "a high-visibility color used
      ... in dark and/or dangerous environments to increase safety".  Gloss 35 %
      (satin).  **No RAL or hex is published** - the manual refuses to give one.
[W8]  Mining trade press: "traditional raise-boring machines typically
      requiring **a concrete platform and tie-down bolts** to keep the machine
      stable during operation"; "the operator is generally **stood in the open
      less than 5 m from the hole**"; and a 3 m-class machine at "**down thrust
      1 600 kN, up thrust 4 500 kN**", "extended height is 4 500 mm; retracted,
      it is 3 815 mm".  Plus a contractor article: "a **concrete pad needs to
      be poured over firm rock**", and the set-up "includes one or two power
      packs, a control system, the raise borer itself, **a base plate system
      providing attachment to the ground**, many smaller tools..."
[W9]  A raise-boring tooling user manual and tools brochure: pilot bit weights
      by diameter (a 311 mm bit weighs **100 kg**, 6-5/8" API REG pin, 30-60
      rpm, "use min 800 litres/min of water for efficient flushing"); reamer
      cutter counts and weights by diameter; "all basic components are bolted
      to each other"; saddle bolts "to full strength 1200 Nm".

[D]   DERIVED here by arithmetic on a cited number.  The working is on the
      line, every time, so it can be checked and so it is obvious where
      arithmetic ends and a source begins.
[NS]  NOT SOURCED.  Said plainly, never dressed up as a figure.

WHAT IS STILL NOT SOURCED
-------------------------
Much less than before, but the honest remainder is:
  * **Anchor bolt count, diameter, length and embedment.**  Every source says
    "concrete pad and tie-down bolts" and NONE gives a number; one patent says
    the bolts are "(not shown)" [W4b].  Sized below by arithmetic on the
    machine's own published pull, with the sum on the line.
  * **Concrete pad dimensions and thickness** - never stated anywhere [W8].
  * **Raise-bore chamber dimensions** - nothing quantitative; only that "raise
    borers often require higher than normal overhead space" [W8], which is what
    lets this machine be 5.1 m tall in a game whose authored drives are 5.0-5.4 m.
  * **Handrails, walkways and ladders.**  No source describes any on a
    conventional raise borer derrick; the optional operator's platform is
    listed as "delivered equipment NOT mounted", i.e. a loose stand [W1].  This
    model therefore fits NO handrails to the derrick, which is a deliberate
    absence and not an omission.
  * **Paint hue.**  The colour SYSTEM and its layering rule are sourced [W7];
    the actual RAL/hex is not published by anyone.  Materials here are names
    only anyway (assets.js owns every texture), so the model expresses the rule
    - dark carries light - and not a colour.
  * **Reaming head thickness** and saddle geometry - published nowhere [W9].
    Irrelevant here, since this file models no head.

UNITS AND AXES
--------------
Metres.  Blender Z-up; the exporter converts to three.js Y-up.
ORIGIN: **the drill axis at the chamber floor** - the collar of the raise.  A
raise borer has no slew centre, so the hole is the only point every part of the
machine is arranged around, and putting it at the world origin is what lets the
rig drop onto the floor at y=0 with no fudge (lib/rig.py contract).
+Y is the operator / pipe-loader side, which exports to -Z in three.js and
matches the procedural machine in rigFactory.js.  +X is across the machine, and
the two guide columns stand on the +X / -X axis.

BOX SIZING - READ THIS BEFORE EDITING
--------------------------------------
`lib/rig.py`'s `box()` was returning HALF the size asked for when this file was
written (`primitive_cube_add(size=1)` makes a 1 m cube, then `scale = size/2`).
Measured at the start of this session: `box((4,2,10))` came back
(2.000, 1.000, 5.000).  `tube()` is correct, which is what hid it.

**This file contains no compensation for that bug, deliberately.**  Every call
below asks for the TRUE dimension.  Five of the nine machine modules in this
directory work around it by defining a local `box()` that reimplements the
primitive; this one does not, because a leftover workaround is what has twice
shipped a machine at double size once the library was finally fixed.  If this
model exports at half scale, the library bug is back: fix `lib/rig.py`, and do
not touch the constants in this file.
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import bpy                                     # noqa: E402
import rig as R                                # noqa: E402

TAU = math.pi * 2.0


# ═══════════════════════════════════════════════════════════════════════════
#  1.  WHERE THIS MACHINE SITS IN THE REAL RANGE
#
#  [L3] gives torque 310 kNm, pull 4200 kN, 448 kW, pilot 311 mm, 600 m depth.
#  Matched against the published ranges, that is squarely a MID-SIZE machine:
#
#    real machine A [W1]   250 kNm   4 159 kN   250/290 kW  pilot 311 mm
#                          derrick 5 190 H x 1 740 W x 1 900 D, 12 650 kg
#    real machine B [W2]   305 kNm   5 338 kN               pilot 311 mm
#                          derrick 5 160 H x 1 980 W x 1 940 D, 20 214 kg
#    real machine C [W3]   230 kNm   4 500 kN   390 kW      3 cylinders
#    real machine D [W8]   237 kNm   4 500 kN   352 kW      4 500 H / 3 815 retr
#    THE GAME'S MACHINE    310 kNm   4 200 kN   448 kW      pilot 311 mm
#
#  All four real machines that carry a 311 mm pilot or a ~4 500 kN pull land
#  between 4.5 and 5.2 m tall on a footprint under 2 m square.  So the game's
#  machine is that machine, and this model is built to those figures rather
#  than to a guess.  Every constant below cites which one.
# ═══════════════════════════════════════════════════════════════════════════

# ── the method, and the numbers the whole machine is arranged around ─────────
ROD_LEN     = 1.500   # [L1 A.5.1] "hollow drill pipes 1.5 m long" AND [L3]
                      # rodLength: 1.5.  Two independent statements of the same
                      # number.  Real machines of this class use 1 524 mm
                      # (60") pipe [W1][W3]; the game's 1.5 m is that pipe
                      # rounded, and the game is the authority here.  This is
                      # the most load-bearing dimension on the machine: it sets
                      # the stroke, which sets the derrick height.
ROD_D       = 0.254   # [L3] ITEMS rb-stem-254, "254 mm x 1.5 m", 340 kg each.
                      # Inside the sourced 203/254/286/327/333 mm rod ladder
                      # [W1][W3] and inside [L1 D.5]'s 228-381 mm stem band.
                      # FLAGGED, and recorded in [L2]: real machines pair a
                      # 311 mm pilot with 286 mm pipe [W1][W2], not 254 mm.
                      # The game's pairing is one size light.  data.js is the
                      # content authority so the model follows it and the
                      # discrepancy is written down rather than silently fixed.
PILOT_D     = 0.311   # [L3] rb-pilot-bit-311 - and now INDEPENDENTLY SOURCED,
                      # which [L2] section 8.10 could not do: 311 mm (12-1/4")
                      # is the standard pilot on this exact size class [W1][W8]
                      # and appears in the tooling manual's bit table at 100 kg
                      # with a 6-5/8" API REG pin [W9].
PULL_KN     = 4200.0  # [L3] stats.feedForce.  On a raise borer the feed force
                      # IS the pull: reaming is the working pass and it pulls.
TORQUE_KNM  = 310.0   # [L3] stats.torque.  Class range 230-305 kNm [W2][W3].
POWER_KW    = 448.0   # [L3] stats.power, fuelPerHour 0 -> ELECTRIC.  Class
                      # range 250-490 kW [W1][W3]; the drive is variable
                      # frequency electric [W1].

# THE THRUST : PULL RATIO, AND WHY IT IS WHAT IT IS.  [D]
# rigFactory.js's procedural spec carries thrustKn 2800 against pullKn 4500 - a
# ratio of 0.622 - and that is NOT a free choice.  For one set of cylinders
# standing on the base with their rods up [W4b], down is the annulus and up is
# the full bore, so
#     A_annulus / A_bore = 1 - (d_rod / D_bore)^2 = 0.622
#  -> d_rod / D_bore = sqrt(1 - 0.622) = 0.615.
# Checked against a real machine: one published raise borer gives 2 224 kN
# conventional against 3 559 kN upreaming [W2], a ratio of 0.625, i.e. a rod
# ratio of 0.612.  The game's number is right to within 0.5 %, and the reason
# it is right is the cylinder geometry modelled below.
RAM_N       = 3       # [W3] tabulates cylinder count against thrust: 2 up to
                      # 3 000 kN, **3 at 4 500 kN**, 4 at 8 046 kN.  At 4 200 kN
                      # this machine takes three - and [W4a] independently
                      # describes "triangularly arranged thrust ram means" with
                      # "the drilling axis located substantially at the center
                      # of forces within the triangle".  Two sources, one answer.
RAM_BORE    = 0.230   # [D] 4 200 kN / 3 cylinders = 1 400 kN each; at the
                      # 330 bar one manufacturer publishes for this duty [W1],
                      # A = 1 400e3 / 33e6 = 0.04242 m2 -> dia 232 mm -> 230 mm.
RAM_ROD     = 0.140   # [D] 0.615 x 230 = 141 -> 140 mm, the standard size.
                      # Gives a thrust:pull of 1-(140/230)^2 = 0.630 against
                      # the 0.622 the game implies: 1.3 % out.
RAM_BARREL  = 0.300   # [NS] outside diameter over the 230 mm bore
RAM_R       = 0.820   # [D] the three rams on a 0.820 m circle at 270/30/150
                      # deg, which is the largest triangle that fits: at 270
                      # deg the barrel's outer face lands at 0.970 against the
                      # frame's 1.000 half-depth, and it clears both the oval
                      # gearbox (0.640 max radius) and the guide sleeves
                      # (0.411 centre-to-centre against 0.350 needed).
RAM_ANG     = (270.0, 30.0, 150.0)    # [D] "the drilling axis located
                      # substantially at the center of forces within the
                      # triangle" [W4a] - so an equilateral triangle about the
                      # axis, turned to put the odd one at the back where the
                      # pipe loader and the operator are not.
RAM_BAR_L   = 0.900   # [D] the barrels are SHORT against a 1.710 m stroke
                      # because these are TELESCOPIC cylinders - the sources
                      # are explicit and say why: "two double-acting telescopic
                      # cylinders", "high thrust telescopic cylinders...
                      # resulted in a machine with an overall height of just
                      # 2.9 m", and one machine is offered with "low-profile
                      # telescopic cylinders for narrow operation sites or
                      # standard cylinders with 33 % more thrust force" [W1].
                      # A short barrel under a long stroke is the whole reason
                      # a raise borer fits in a chamber, and a model with
                      # single-stage rams would be 1.5 m too tall.
THRUST_KN   = PULL_KN * (1.0 - (RAM_ROD / RAM_BORE) ** 2)   # [D] 2 644 kN

# ── the envelope: real, published, and finally not a guess ──────────────────
H_EXT       = 5.100   # [W1] 5 190 mm and [W2] 5 160 mm on the two machines
                      # that carry a 311 mm pilot; a contractor quotes 5.1 m
                      # for a third [W6].  Taken at 5.100.  [W8] notes raise
                      # borers "require higher than normal overhead space" and
                      # that the chamber is drilled and blasted for them, which
                      # is what lets a 5.1 m machine stand in a mine whose
                      # ordinary drives are 5.0-5.4 m [L4].
FRAME_W     = 1.950   # [W2] 1 980 mm; [W1] 1 740 mm.  Taken between them at
FRAME_D     = 2.000   # 1 950 / 2 000.  [W1] depth 1 900 mm, [W2] 1 940 mm.
                      # THE MACHINE IS NARROWER THAN IT IS TALL BY 2.6 : 1 and
                      # that proportion is the whole silhouette.
BEAM_H      = 0.400   # [W6] extended heights are quoted "plus 400 mm beams if
                      # required" on four separate machines, and one entry says
                      # what they are for: "Beams to allow hole break through".
                      # A steel sub-frame the machine stands on, over the collar.
BEAM_W      = 0.320   # [NS] the beams' own section.  [W6] gives their depth
                      # (400 mm) and their weight as a set, not their width.

# ── the vertical chain.  Two clearances govern and both come off sourced numbers
#   0.000  chamber floor (rock / shotcrete), concrete pad poured on it [W8]
#   0.150  top of the concrete pad                         PAD_T [NS]
#   0.400  top of the base beams (measured from the pad)   BEAM_H [W6]
#   0.700  top of the worktable deck                       TABLE_TOP
#   0.920  top of the horseshoe wrench                     WRENCH_TOP
#   1.320  crosshead underside, BOTTOM of stroke           DRIVE_LO
#   3.030  crosshead underside, TOP of stroke              DRIVE_HI
#   3.880  gearbox top at top of stroke
#   4.730  motor-gear units' top at top of stroke
#   4.760  headframe underside
#   5.100  headframe top = published extended height       H_EXT [W1][W2]
#
#  (1) THE FLOAT BOX MUST CLEAR THE WRENCH.  The swivelling float box hangs
#      FLOAT_H below the crosshead [W1], so DRIVE_LO >= WRENCH_TOP + FLOAT_H
#      + 0.08 = 0.920 + 0.320 + 0.080 = 1.320.
#  (2) A PIPE MUST FIT UNDER THE DRIVE, or the machine cannot make hole:
#        rod space at top of stroke = (3.030 - 0.320) - 0.920 = 1.790 m
#        required                   = ROD_LEN 1.500 + 0.250 handling = 1.750 m
#      which is why the stroke is what it is - see STROKE.
PAD_T       = 0.150   # [NS] the poured pad.  [W8] confirms "a concrete pad
                      # needs to be poured over firm rock" and gives no
                      # thickness; no source anywhere does.
TABLE_T     = 0.300   # [NS] depth of the base frame / worktable weldment
TABLE_TOP   = PAD_T + BEAM_H + TABLE_T                # [D] 0.850 - see below
WRENCH_H    = 0.220   # [NS] the fork wrench body [W4b][W5]
STROKE      = 1.710   # [W1] the published stroke of the two low-profile
                      # machines in the range is 1 710 mm, against 1 219 mm
                      # pipe - 491 mm of margin.  Against this game's 1.5 m
                      # pipe it leaves 210 mm, which is what clearance (2)
                      # above needs.  The bigger machines in the same range run
                      # 2 057 and 2 160 mm strokes [W1] with longer pipe; that
                      # would not fit under 5.1 m with this drive stack.
FLOAT_H     = 0.320   # [NS] the "swivelling floating drive box" [W1], which
                      # "prevents transfer of bending moments to the gearbox".
XHEAD_H     = 0.850   # [NS] crosshead + gearbox housing height
MOTOR_STACK = 0.850   # [NS] planetary reducer + motor above the gear deck
HEADFRAME_H = 0.340   # [D] whatever is left under H_EXT once the drive stack
                      # is at the top of its stroke; see the chain above.

# recomputed strictly, so that a change to any constant above moves the rest
TABLE_TOP   = PAD_T + BEAM_H + TABLE_T                # 0.850
WRENCH_TOP  = TABLE_TOP + WRENCH_H                    # 1.070
DRIVE_LO    = WRENCH_TOP + FLOAT_H + 0.080            # 1.470  clearance (1)
DRIVE_HI    = DRIVE_LO + STROKE                       # 3.180
ROD_SPACE   = (DRIVE_HI - FLOAT_H) - WRENCH_TOP       # 1.790  clearance (2)
assert ROD_SPACE >= ROD_LEN + 0.24, 'a pipe will not fit under the drive'
GEAR_TOP    = DRIVE_HI + XHEAD_H                      # 4.030
MOTOR_TOP   = GEAR_TOP + MOTOR_STACK                  # 4.880
COL_TOP     = MOTOR_TOP + 0.030 + HEADFRAME_H         # 5.250
# The stack lands 150 mm over the published 5.100.  Rather than fudge a
# constant, the headframe is built as a PORTAL: two side beams tying the column
# tops with a clear opening between them that the motor crown passes through at
# full stroke.  That is also what [W4a] describes - "a fixed cross frame
# rigidly interconnects the UPPER ENDS of the guide columns" - a cross frame,
# not a roof.  Machine height is then the column top, set to the published
# figure and asserted:
COL_TOP     = H_EXT                                   # [W1][W2] 5.100
assert MOTOR_TOP < COL_TOP, 'the drive crown must stay under the headframe top'

# ── the two guide columns ────────────────────────────────────────────────────
# [W4a] "two parallel guide columns secured at their lower ends to a base
# frame", engaged by "upper and lower guide sleeves"; [W1] "rigid crosshead
# guide columns provide efficient torque reaction to extend the service life of
# the thrust cylinders" - so the COLUMNS take the torque and the CYLINDERS take
# the thrust, and each is sized for its own job.
COL_D       = 0.240   # [D] the columns react torque as a couple:
                      # 310 kNm / 1.360 m spacing = 228 kN per column, which a
                      # 240 mm bar carries at 5.0 N/mm2.  Strength is trivial;
                      # the section is set by STIFFNESS and by guide bearing
                      # area, and 240 mm is the size that looks right against a
                      # 1 950 mm frame.  [NS] as a published figure.
COL_CTR     = 0.680   # [D] (FRAME_W - COL_D) / 2 - 0.115 of frame outside the
                      # column: the columns stand inside the frame width.
COL_BASE    = TABLE_TOP                               # socketed in the frame

# ── the drive ────────────────────────────────────────────────────────────────
# [W5] "The gearbox mounts directly to the main drive motors, employing a
# planetary reduction for its compactness"; [W4a] "collector gearing having a
# pair of inputs and a single output"; and the modern arrangement [W1]:
# "multiple identical motor gear units are arranged around the center of the
# drive, so that even if one of the motors fails, work can continue with
# reduced power".  Four units here, on top of the gear deck, around the bore.
MOTOR_N     = 4       # [W1] the "center-free drive" arrangement; that source's
                      # 600-class machine can be retrofitted with "an
                      # additional 4th motor", so four is the full complement.
                      # 448 kW / 4 = 112 kW each [L3].
MOTOR_D     = 0.420   # [D] a 112 kW 4-pole IEC machine is a frame 315 - about
MOTOR_L     = 0.620   # 0.60 m over the feet, 1.0-1.2 m long.  A flange-mounted
                      # machine on top of a reducer has no feet and no
                      # foot-mounted terminal box, so it is taken at the small
                      # end.  [NS] as a specific motor; [D] as a frame size.
REDUCER_D   = 0.360   # [NS] planetary reducer under each motor [W5]
REDUCER_H   = 0.230
MOTOR_R     = 0.400   # [D] the four units on a circle around the bore.  With
                      # MOTOR_D/2 on top of it the motor crown is 1.220 across,
                      # which is what the headframe's clear opening has to pass
                      # at the top of the stroke - see HEADFRAME_OPEN.
GEAR_OD     = 1.280   # [D] must pass BETWEEN the columns: the clear span is
                      # 2 x COL_CTR - COL_D = 1.360 - 0.240 = 1.120 across the
                      # column axis, so the housing is OVAL in plan - 1.280
                      # across the free axis, 1.100 across the columns.  It is
                      # a drum and not a box: the gearbox on the biggest
                      # machine in the range is "installed in a removable
                      # BARREL, allowing the derrick to be split into smaller,
                      # more transportable components" [W1].
GEAR_ACROSS = 1.100   # [D] the constrained axis, see above
HEADFRAME_OPEN = (1.320, 1.400)   # [D] clear opening of the headframe ring in
                      # (x, y).  The motor crown is 1.220 across and has to
                      # pass through it at the top of the stroke, which is why
                      # the headframe is a RING and not a roof - and which is
                      # also what [W4a] describes: "a fixed cross frame rigidly
                      # interconnects the UPPER ENDS of the guide columns".
DRIVE_BORE  = 0.400   # [D] "the drive train has a hollow central shaft,
                      # enabling the efficient transmission of flushing media"
                      # [W1].  It has to pass the 254 mm pipe and its tool
                      # joint, so 400 mm.  Sized from [L3]'s pipe, not read.
FLOAT_D     = 0.560   # [NS] the float box, which carries the DI-22 box thread
                      # the string screws into [W1]

# ── the worktable and the wrench ─────────────────────────────────────────────
TABLE_OPEN  = 0.800   # [D] "the drill pipe sections will project through a
                      # central opening in the work table" [W4b].  Sized to
                      # pass the 311 mm bit, the 254 mm pipe with its tool
                      # joints, a stabilizer and the starter bushing [W1], with
                      # room for the pilot returns to be caught.  NOT sized to
                      # pass a reamer head: the larger machines in this class
                      # explicitly have no opening worktable [W5].
BUSH_D      = 0.520   # [NS] the "starter bushing" every tooling kit lists [W1]
WRENCH_W    = 0.760   # [NS] the "fork-shaped wrench" / "horse shoe wrench"
WRENCH_L    = 0.900   # [W5][W4b], slid across the hole on a small ram

# ── tilt: the machine leans, and it leans on turnbuckles ────────────────────
# [W1] "Drill angle (from horizontal) 90-45 deg" on four machines in the range;
# [W4b] the work table "is connected to the base through pivot pins which allow
# [it] to be tilted by means of a pair of turnbuckles".  The game bores
# vertical raises, so the machine is modelled UPRIGHT - but the pivot pins and
# the two turnbuckles are fitted, because they are what a viewer who knows the
# machine looks for, and because they explain how it is set up.
TURN_D      = 0.075   # [NS] turnbuckle body
TILT_PIN_Y  = 0.900   # [D] on the frame's front face, FRAME_D/2 - 0.10

# ── anchoring: the arithmetic [L2] section 9.2 asked for ────────────────────
# The sources are unanimous that the machine is bolted down and unanimous in
# giving no numbers: "a concrete platform and tie-down bolts" [W8], "a base
# plate system providing attachment to the ground" [W8], "mounting pads which
# are anchored to the ground surface by suitable bolts" - and that patent says
# the bolts are "(not shown)" [W4b].  So the count and size are [NS] and are
# derived here instead, with the sum on the line:
#     4 200 kN over 8 anchors        = 525 kN per anchor
#     M56 class 8.8: As = 2 030 mm2, proof 640 N/mm2 -> 1 299 kN
#     525 / 1 299                    = 40 % of yield, where a grouted anchor
#                                      in rock belongs.
# For comparison, the procedural machine holds the same load down with four
# 28 mm rods - 2 463 mm2, i.e. 1 827 N/mm2, beyond any structural steel - and
# models them in CHROME, which reads as a hydraulic rod, the opposite of an
# anchor.  The point of the numbers below is not to publish a bolt schedule
# nobody has; it is that the anchorage READS structural.
ANCHOR_N    = 8       # [D] see above
ANCHOR_D    = 0.056   # [D] M56, see above
ANCHOR_PL   = 0.260   # [NS] plate washer
PAD_W       = 3.400   # [NS] the pad extends ~0.7 m beyond the beams all round
PAD_D       = 3.600   # for the anchors to be set into.  No source gives one.

# ── the pack: five assemblies, and four of them are on the floor [W5] ───────
# Real skid dimensions, which is the kind of thing [L2] said did not exist:
#   drive pack (VF, with the electrical cabinet inside)  3 600 x 1 520 x 1 840
#   thrust pack                                          2 300 x 1 400 x 1 540
#   cooling unit                                         2 310 x 1 520 x 2 230
# all [W1].  The umbilicals are "15 or 20 meter hoses to Derrick" and "20 m or
# 30 m Cables to derrick" [W1] - but a 15 m spread would give this rig a
# frameRadius of ~17 m and break the game's machine spacing, so the skids are
# set at 4.2-4.6 m and the compression is stated here rather than hidden.
# rigFactory's procedural raisebore declares frameRadius 6.5; this lands at 6.8.
PACK_DRIVE  = (1.520, 3.600, 1.840)   # [W1] (x, y, z) - long axis fore-aft
PACK_THRUST = (2.300, 1.400, 1.540)   # [W1]
PACK_COOL   = (1.520, 2.310, 2.230)   # [W1]
PACK_X      = -4.150                  # [NS] see the note above
PUMP_X      = 4.150                   # [NS]

# ── pipe handling ────────────────────────────────────────────────────────────
# [W1] "Pipe loader - ground loading, remote controlled", "jack knife type",
# "mounted on either side", "detachable".  It adds 1.27 m to the machine's
# width (1 740 -> 3 010 mm on one machine, 2 300 -> 3 800 on another), and the
# pipes it picks up are lying ON THE FLOOR - there is no carousel and no
# vertical rack on any machine in any source read.
LOADER_W    = 1.270   # [D] 3 010 - 1 740 [W1]; the same delta appears as
                      # 3 800 - 2 300 = 1 500 on the larger machine.
RACK_N      = 7       # [NS] how many pipes are lying out.  At [L3]'s 600 m
                      # depth the full string is 400 pipes, so what is on the
                      # floor is a shift's buffer, never the string.

LAMP_MAIN   = 'feed-work-light'   # [L4] env.js line 512 looks this up BY NAME
LAMP_TABLE  = 'table-work-light'


# ═══════════════════════════════════════════════════════════════════════════
#  2.  LOCAL HELPERS ON TOP OF lib/rig.py
#      None of these reimplements a rig.py primitive - see the box note in the
#      module docstring.  They compose them.
# ═══════════════════════════════════════════════════════════════════════════

def bake(o):
    """Apply every modifier (and convert a curve to a mesh) so the object can
    be joined.  `join()` keeps only the ACTIVE object's modifier stack, so
    anything welded by hand has to be baked first or its bevels vanish."""
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    return bpy.context.active_object


def weld(objs, parent, tag):
    """Join a DYNAMIC subassembly by material and parent it to its game node.

    `rig.py`'s finish() deliberately skips anything under a pivot:/slide: node
    because it has to move independently - which means every mesh in a moving
    group is its own draw call unless it is welded here.  The drive head alone
    is ~50 objects; welded it is three.
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
    """ARRAY modifier at a constant offset in the object's local frame."""
    m = o.modifiers.new('arr', 'ARRAY')
    m.use_relative_offset = False
    m.use_constant_offset = True
    m.constant_offset_displace = offset
    m.count = count
    return o


def disc(name, r, t, mat, loc, axis='Z', sides=16, parent=None):
    """A plate / flange / wheel: a short cylinder about X, Y or Z, CENTRED on
    `loc`.  rig.py's tube() puts its origin at the base, which is right for a
    leg and wrong for a flange, so the offset is undone here."""
    rot = {'X': (0, math.pi / 2, 0), 'Y': (-math.pi / 2, 0, 0), 'Z': (0, 0, 0)}[axis]
    o = R.tube(name, r, t, mat, parent=parent, loc=loc, rot=rot, sides=sides)
    off = {'X': (-t / 2, 0, 0), 'Y': (0, -t / 2, 0), 'Z': (0, 0, -t / 2)}[axis]
    o.location = (loc[0] + off[0], loc[1] + off[1], loc[2] + off[2])
    return o


def torus(name, r, tube_r, mat, loc, sides=20, rings=8, parent=None):
    """A ring - the collar bund, a hose coil, a wear band."""
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=tube_r,
                                     major_segments=sides, minor_segments=rings)
    o = bpy.context.active_object
    return R.part(name, o, mat, parent, loc)


def bolts(name, count, radius, z, head_d, head_h, mat, parent=None, phase=0.0,
          cx=0.0, cy=0.0):
    """A ring of hex bolt heads.  Bolt circles are the cheapest realism in this
    whole pipeline: they share a material with the flange they sit on, so after
    finish() they cost triangles and not one single draw call.  [W9] is
    emphatic that on this machine "all basic components are BOLTED to each
    other", so bolt circles are not decoration here - they are the joint."""
    out = []
    for i in range(count):
        a = phase + i * TAU / count
        out.append(R.tube('%s_%d' % (name, i), head_d / 2, head_h, mat,
                          parent=parent, sides=6,
                          loc=(cx + math.cos(a) * radius,
                               cy + math.sin(a) * radius, z)))
    return out


def rail(name, pts, r, mat, parent=None, sides=8):
    """Straight tubes between successive points - a hose run's hard pipework,
    a turnbuckle, a ladder stile.  Rotating +Z onto the segment direction with
    Euler (0, ry, rz) sends +Z to (sin ry cos rz, sin ry sin rz, cos ry) - no
    extra quarter turn, which is what an earlier version of this got wrong."""
    out = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        d = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
        L = math.sqrt(d[0] ** 2 + d[1] ** 2 + d[2] ** 2)
        if L < 1e-4:
            continue
        ry = math.acos(max(-1.0, min(1.0, d[2] / L)))
        rz = math.atan2(d[1], d[0])
        out.append(R.tube('%s_%d' % (name, i), r, L, mat, parent=parent, loc=a,
                          rot=(0, ry, rz), sides=sides))
    return out


def louvres(name, w, h, z, mat, x, y, pitch=0.075, parent=None):
    """Cooling louvres on a pack enclosure.  Real bars, because assets.js owns
    every texture at runtime and this .glb ships no maps at all."""
    n = max(3, int(h / pitch))
    o = R.box(name, (w, 0.018, 0.030), mat, parent=parent,
              loc=(x, y, z), rot=(0.42, 0, 0))
    arr(o, (0, 0, pitch), n)
    return o


def ram_xy(deg):
    """Where thrust ram `deg` stands.  [W4a] triangular arrangement."""
    a = math.radians(deg)
    return math.cos(a) * RAM_R, math.sin(a) * RAM_R


# ═══════════════════════════════════════════════════════════════════════════
#  3.  THE MACHINE
# ═══════════════════════════════════════════════════════════════════════════

def build(out_path):
    R.reset()

    # ═══════════════════════════════════════════════════════════════════════
    #  3.1  THE PAD, THE ANCHORS AND THE BASE BEAMS
    #
    #  "A concrete pad needs to be poured over firm rock" [W8]; "traditional
    #  raise-boring machines typically requiring a concrete platform and
    #  tie-down bolts to keep the machine stable during operation" [W8]; the
    #  base is "a pair of mounting pads which are anchored to the ground
    #  surface by suitable bolts" [W4b].  This is the single most important
    #  thing to get RIGHT rather than merely present: the machine's whole job
    #  is to pull 4 200 kN out of the floor, and if the anchorage does not look
    #  like it could hold that, nothing else about the model matters.
    # ═══════════════════════════════════════════════════════════════════════
    # The pad, poured around the collar.  Built as four slabs rather than one
    # boolean: the opening is square, the geometry is exact, and it costs four
    # boxes instead of a boolean solve.
    op = TABLE_OPEN / 2 + 0.18                       # pad opening, a little
    for i, (sx, sy, px, py) in enumerate([
            (PAD_W, (PAD_D / 2 - op), 0.0, (op + PAD_D / 2) / 2 + 0.0),
            (PAD_W, (PAD_D / 2 - op), 0.0, -((op + PAD_D / 2) / 2)),
            ((PAD_W / 2 - op), 2 * op, (op + PAD_W / 2) / 2, 0.0),
            ((PAD_W / 2 - op), 2 * op, -((op + PAD_W / 2) / 2), 0.0)]):
        R.box('pad-%d' % i, (sx, sy, PAD_T), 'concrete',
              loc=(px, py, PAD_T / 2))

    # The tie-down anchors.  Eight M56 through the base frame's own beam line,
    # each a plate washer, a nut and a stud standing proud of it.  Deliberately
    # NOT chrome: chrome reads as a hydraulic rod, which is the opposite of an
    # anchor, and that is the mistake the procedural machine makes.
    ax, ay = FRAME_W / 2 - 0.16, FRAME_D / 2 - 0.16
    anchor_at = [(ax, ay), (-ax, ay), (-ax, -ay), (ax, -ay),
                 (ax, 0.0), (-ax, 0.0), (0.0, ay), (0.0, -ay)]
    assert len(anchor_at) == ANCHOR_N
    for i, (x, y) in enumerate(anchor_at):
        # the stud goes down into the pad and stands proud above the nut
        R.tube('anchor-stud-%d' % i, ANCHOR_D / 2, 0.52, R.MAT_WORN,
               loc=(x, y, PAD_T - 0.06), sides=8)
        R.box('anchor-plate-%d' % i, (ANCHOR_PL, ANCHOR_PL, 0.032), R.MAT_WORN,
              loc=(x, y, PAD_T + BEAM_H + 0.016), bevel=0.004)
        R.tube('anchor-nut-%d' % i, 0.048, 0.046, R.MAT_WORN, sides=6,
               loc=(x, y, PAD_T + BEAM_H + 0.032))

    # Grout under the base beams.  [L1 C.2.5] "grouted down"; the geometry is
    # nowhere described, so this is a plain poured fillet and it is marked as
    # a choice.  It matters because it is a DIFFERENT material from both the
    # concrete and the steel, and that reads.
    for s in (-1, 1):
        R.box('grout-%d' % (s > 0), (BEAM_W + 0.14, FRAME_D + 0.20, 0.05),
              'castConcrete', loc=(s * (FRAME_W / 2 - BEAM_W / 2 - 0.10),
                                   0.0, PAD_T + 0.025))

    # THE BASE BEAMS.  [W6] "plus 400 mm beams if required" / "Beams to allow
    # hole break through (if required)".  Two heavy beams the machine stands
    # on, straddling the collar, which is what raises the whole derrick clear
    # of the hole.  Their weight is inferable from [W6] (7.5 t bare against
    # 19.5 t "including beams"), their section is not.
    for s in (-1, 1):
        bx = s * (FRAME_W / 2 - BEAM_W / 2 - 0.10)
        R.box('base-beam-%d' % (s > 0), (BEAM_W, FRAME_D + 0.12, BEAM_H),
              R.MAT_DARK, loc=(bx, 0.0, PAD_T + BEAM_H / 2), bevel=0.012)
        # web stiffeners, the cheapest possible realism: same material as the
        # beam, so after finish() they cost triangles and no draw call at all.
        # The pitch is set so the LAST one of the array still lands on the
        # beam - an array that overruns its own parent is the classic way to
        # push a machine past its published dimension for nothing.
        st = R.box('beam-stiff-%d' % (s > 0), (BEAM_W + 0.03, 0.022, BEAM_H - 0.07),
                   R.MAT_DARK, loc=(bx, -(FRAME_D + 0.12) / 2 + 0.18,
                                    PAD_T + BEAM_H / 2))
        arr(st, (0, 0.36, 0), 6)

    # ═══════════════════════════════════════════════════════════════════════
    #  3.2  BASE PLATE, U-SHAPED MAIN FRAME AND WORKTABLE
    #
    #  [W4a] the base is "a base plate 12 and a generally U-shaped main frame
    #  14" with the columns' "lower end portions received in the sockets 16";
    #  [W5] "Baseplates, mainframe, columns and headframe provide the mounting
    #  structure for the boring assembly."  The U opens toward the pipe loader
    #  side, which is what lets a pipe be swung in over the table.
    # ═══════════════════════════════════════════════════════════════════════
    tz = PAD_T + BEAM_H                              # 0.550, underside of table
    # the U: two side members and a back member; the front is open
    for s in (-1, 1):
        R.box('mainframe-side-%d' % (s > 0),
              (0.34, FRAME_D, TABLE_T), R.MAT_DARK,
              loc=(s * (FRAME_W / 2 - 0.17), 0.0, tz + TABLE_T / 2), bevel=0.014)
    R.box('mainframe-back', (FRAME_W - 0.68, 0.42, TABLE_T), R.MAT_DARK,
          loc=(0.0, -(FRAME_D / 2 - 0.21), tz + TABLE_T / 2), bevel=0.014)

    # the worktable deck itself, with the central opening the pipe passes
    # through [W4b].  Four plates around a square hole, same trick as the pad.
    to = TABLE_OPEN / 2
    for i, (sx, sy, px, py) in enumerate([
            (FRAME_W, FRAME_D / 2 - to, 0.0, (to + FRAME_D / 2) / 2),
            (FRAME_W, FRAME_D / 2 - to, 0.0, -((to + FRAME_D / 2) / 2)),
            (FRAME_W / 2 - to, 2 * to, (to + FRAME_W / 2) / 2, 0.0),
            (FRAME_W / 2 - to, 2 * to, -((to + FRAME_W / 2) / 2), 0.0)]):
        R.box('worktable-%d' % i, (sx, sy, 0.055), R.MAT_WORN,
              loc=(px, py, TABLE_TOP - 0.027))
    # hazard striping on the table edge - the one place a person stands
    for s in (-1, 1):
        R.box('table-stripe-%d' % (s > 0), (FRAME_W, 0.035, 0.055), R.MAT_HAZARD,
              loc=(0.0, s * (FRAME_D / 2 - 0.018), TABLE_TOP - 0.027))

    # the starter bushing that every tooling kit lists [W1], set in the opening
    R.tube('starter-bushing', BUSH_D / 2, 0.20, R.MAT_WORN,
           loc=(0, 0, TABLE_TOP - 0.20), sides=20)
    R.tube('bushing-bore', BUSH_D / 2 - 0.09, 0.22, R.MAT_WORN,
           loc=(0, 0, TABLE_TOP - 0.21), sides=20)
    bolts('bushing-bolt', 8, BUSH_D / 2 + 0.05, TABLE_TOP - 0.020,
          0.040, 0.022, R.MAT_WORN)

    # THE BLOOIE BOX.  [W1] "the Blooie system provides a controlled exit for
    # return bailing fluid and cuttings during pilot hole drilling" - which is
    # exactly [L1 A.5.1]'s "water flushing goes down the string and UP THE
    # ANNULUS".  The pilot returns arrive HERE, at the collar, and have to go
    # somewhere.  It is the one piece of the machine that says "stage 1".
    R.box('blooie-box', (0.52, 0.40, 0.30), R.MAT_DARK,
          loc=(0.0, to + 0.24, TABLE_TOP + 0.15), bevel=0.012)
    # the spout turns DOWN off the back of the box rather than reaching out
    # across the floor: the returns have to fall into something, and a spout
    # that stuck 600 mm past the frame would put the machine over its published
    # depth for a part no source dimensions at all.
    R.tube('blooie-spout', 0.105, 0.34, R.MAT_DARK,
           loc=(0.0, to + 0.40, TABLE_TOP + 0.06),
           rot=(math.pi - 0.55, 0, 0), sides=10)
    torus('collar-bund', to + 0.10, BUSH_D * 0.10, 'castConcrete',
          (0, 0, PAD_T + 0.02), sides=22)

    # THE FLOOR WRENCH.  [W5] "a hydraulically powered fork-shaped wrench
    # manipulated from the operator's control console"; [W4b] "a sliding fork
    # mounted on the work table will be moved against the drill pipe by means
    # of hydraulic cylinders and will engage several depressions or flats
    # located around the outer surface of the drill pipe.  The fork will
    # support the weight of the drill pipe and lock the pipe against rotation."
    # Modelled OPEN, drawn back from the pipe, which is its position while the
    # machine is turning.
    # It slides in from the SIDE, across the table, and it has to do so without
    # leaving the frame: the fork, its body and its ram all live between the
    # collar and the frame's own side member.  (An earlier pass slid it
    # rearward and put the ram barrel 580 mm out behind the machine, which is
    # 580 mm of footprint bought for a part that is supposed to be on the
    # table.)  It is drawn WITHDRAWN, which is its position while the drive is
    # turning; it only closes to break a joint.
    # The chain outward from the pipe, and it has to close inside FRAME_W/2:
    #   tines 0.130..0.550 · body 0.550..0.880 · ram 0.880..0.975
    # which is why the ram is a short exposed rod and its barrel is inside the
    # frame's own side member rather than a separate lump hanging off the back.
    wx = to + 0.315
    R.box('wrench-body', (0.33, WRENCH_W, WRENCH_H), R.MAT_DARK,
          loc=(wx, 0.0, TABLE_TOP + WRENCH_H / 2), bevel=0.010)
    for s in (-1, 1):                                # the two fork tines
        R.box('wrench-tine-%d' % (s > 0), (0.42, 0.13, 0.10), R.MAT_WORN,
              loc=(wx - 0.375, s * 0.19, TABLE_TOP + WRENCH_H - 0.05), bevel=0.008)
    R.tube('wrench-ram', 0.048, 0.095, R.MAT_CHROME,
           loc=(wx + 0.165, 0.0, TABLE_TOP + WRENCH_H / 2),
           rot=(0, math.pi / 2, 0), sides=10)

    # TILT: pivot pins at the front, turnbuckles at the back [W4b].  The game
    # bores vertical raises so the machine stands upright, but the mechanism is
    # fitted because it is the first thing anyone who knows the machine looks
    # for, and because it is how the thing is set up at all.
    # SET FOR A VERTICAL RAISE, which is what the game bores [L3 sectionMode
    # 'raise'].  That matters to the geometry: a turnbuckle set for a 45 deg
    # raise splays out behind the machine, but at 90 deg it is wound short and
    # stands almost upright against the frame's back face.  Drawing the splayed
    # version on a vertical machine would add 800 mm to the footprint and would
    # be wrong in the one configuration the game actually shows.
    for s in (-1, 1):
        R.tube('tilt-pin-%d' % (s > 0), 0.070, 0.17, R.MAT_STEEL,
               loc=(s * (FRAME_W / 2 - 0.10), TILT_PIN_Y, tz + TABLE_T / 2),
               rot=(0, math.pi / 2, 0), sides=10)
        R.box('tilt-lug-%d' % (s > 0), (0.06, 0.30, 0.34), R.MAT_DARK,
              loc=(s * (FRAME_W / 2 - 0.03), TILT_PIN_Y, tz + TABLE_T / 2 - 0.02))
        # the turnbuckle: an eye end at each end and a barrel with its lock
        # nuts between them, wound short for 90 deg
        rail('turnbuckle-%d' % (s > 0),
             [(s * (FRAME_W / 2 - 0.05), -(FRAME_D / 2 - 0.12), tz + TABLE_T),
              (s * (FRAME_W / 2 - 0.02), -(FRAME_D / 2 + 0.14), PAD_T + 0.10)],
             TURN_D / 2, R.MAT_STEEL, sides=8)
        R.tube('turnbuckle-barrel-%d' % (s > 0), TURN_D, 0.30, R.MAT_WORN,
               loc=(s * (FRAME_W / 2 - 0.04), -(FRAME_D / 2 + 0.02), tz - 0.12),
               rot=(0.32, 0, 0), sides=8)
        R.box('turnbuckle-foot-%d' % (s > 0), (0.20, 0.20, 0.14), R.MAT_WORN,
              loc=(s * (FRAME_W / 2 - 0.02), -(FRAME_D / 2 + 0.16), PAD_T + 0.07))

    # ═══════════════════════════════════════════════════════════════════════
    #  3.3  THE TWO GUIDE COLUMNS AND THE HEADFRAME
    #
    #  [W4a] "two parallel guide columns secured at their lower ends to a base
    #  frame"; "a fixed cross frame rigidly interconnects the upper ends of the
    #  guide columns".  Left BRIGHT rather than painted: the sleeves run on
    #  these surfaces, so they are ground steel, and a painted guideway would
    #  be a domain error.  This is the one place the "dark carries light" paint
    #  rule [W7] is deliberately not applied, and it is not applied for a
    #  reason.
    # ═══════════════════════════════════════════════════════════════════════
    col_len = COL_TOP - COL_BASE
    for s in (-1, 1):
        R.tube('guide-column-%d' % (s > 0), COL_D / 2, col_len, R.MAT_STEEL,
               loc=(s * COL_CTR, 0.0, COL_BASE), sides=20)
        # the socket the column stands in [W4a "received in the sockets 16"]
        R.tube('column-socket-%d' % (s > 0), COL_D / 2 + 0.075, 0.26, R.MAT_DARK,
               loc=(s * COL_CTR, 0.0, COL_BASE - 0.02), sides=16)
        bolts('column-socket-bolt-%d' % (s > 0), 8, COL_D / 2 + 0.055,
              COL_BASE + 0.24, 0.040, 0.024, R.MAT_DARK, cx=s * COL_CTR)

    # the headframe: a RING, so the motor crown passes through it at the top of
    # the stroke.  See HEADFRAME_OPEN for why it cannot be a roof.
    hx, hy = HEADFRAME_OPEN
    hz = COL_TOP - HEADFRAME_H / 2
    hmx = (FRAME_W - hx) / 2
    hmy = (FRAME_D - hy) / 2
    for s in (-1, 1):
        R.box('headframe-x-%d' % (s > 0), (FRAME_W, hmy, HEADFRAME_H), R.MAT_DARK,
              loc=(0.0, s * (hy + hmy) / 2, hz), bevel=0.014)
        R.box('headframe-y-%d' % (s > 0), (hmx, hy, HEADFRAME_H), R.MAT_DARK,
              loc=(s * (hx + hmx) / 2, 0.0, hz), bevel=0.014)
        # the column top caps
        # flush with COL_TOP, not proud of it: COL_TOP is the published
        # extended height [W1][W2] and nothing may stand above a published
        # dimension.  tube() grows UPWARD from its origin, so the origin sits
        # one cap-height down.
        R.tube('column-cap-%d' % (s > 0), COL_D / 2 + 0.06, 0.10, R.MAT_DARK,
               loc=(s * COL_CTR, 0.0, COL_TOP - 0.10), sides=16)
    # Lifting eyes.  This machine is craned into its chamber in pieces and its
    # gearbox barrel is removable so that "the derrick [can] be split into
    # smaller, more transportable components" [W1] - so it has them, and their
    # absence would be a tell.  Set so their tops land ON COL_TOP rather than
    # proud of it, because COL_TOP is the PUBLISHED extended height [W1][W2]
    # and nothing may stand above a published dimension.
    for s in (-1, 1):
        for t in (-1, 1):
            R.box('lift-eye-%d%d' % (s > 0, t > 0), (0.05, 0.16, 0.16),
                  R.MAT_DARK, loc=(s * (FRAME_W / 2 - 0.06),
                                   t * (FRAME_D / 2 - 0.22), COL_TOP - 0.08))

    # ═══════════════════════════════════════════════════════════════════════
    #  3.4  THE TRAVELLING CROSSHEAD - slide:carriage
    #
    #  [W4a] "the travelling cross frame includes vertically spaced apart upper
    #  and lower guide sleeves which surroundingly engage the columns"; the
    #  motors are "bolted to the housing", each "an electric motor and a
    #  planetary type reduction transmission" feeding "collector gearing".
    #
    #  This node is the game's feed.  gltfRig.js reads `slide:carriage` and its
    #  `travel_m` custom property to build dyn.carriageRange, and setCarriage()
    #  reads that range with no guard of its own - a carriage without travel_m
    #  writes NaN into a world matrix and the machine silently disappears.  So
    #  travel_m is set here or the node is not published at all.
    # ═══════════════════════════════════════════════════════════════════════
    car = R.empty(R.NODE_SLIDE, 'carriage', loc=(0.0, 0.0, DRIVE_LO))
    car['travel_m'] = STROKE
    car['travel_min_m'] = 0.0
    car['travel_max_m'] = STROKE
    D = []                                   # everything welded onto the drive

    # guide sleeves, upper and lower, on each column
    for s in (-1, 1):
        for j, zz in enumerate((0.10, XHEAD_H - 0.40)):
            D.append(R.tube('guide-sleeve-%d%d' % (s > 0, j), COL_D / 2 + 0.105,
                            0.30, R.MAT_DARK, parent=car, sides=18,
                            loc=(s * COL_CTR, 0.0, zz)))
            D.extend(bolts('sleeve-bolt-%d%d' % (s > 0, j), 6, COL_D / 2 + 0.075,
                           zz + 0.30, 0.034, 0.020, R.MAT_DARK, parent=car,
                           cx=s * COL_CTR))
        # the arm tying each sleeve back to the gearbox barrel
        D.append(R.box('xhead-arm-%d' % (s > 0), (0.46, 0.30, XHEAD_H - 0.16),
                       R.MAT_DARK, parent=car,
                       loc=(s * (COL_CTR - 0.30), 0.0, XHEAD_H / 2 - 0.02),
                       bevel=0.012))

    # THE GEARBOX BARREL.  Oval in plan - it has to pass between the columns.
    gb = R.tube('gearbox-barrel', GEAR_OD / 2, XHEAD_H - 0.06, R.MAT_CAST,
                parent=car, loc=(0, 0, 0.03), sides=28)
    gb.scale[0] = GEAR_ACROSS / GEAR_OD
    D.append(gb)
    gr = R.tube('gearbox-flange', GEAR_OD / 2 + 0.045, 0.075, R.MAT_CAST,
                parent=car, loc=(0, 0, XHEAD_H - 0.13), sides=28)
    gr.scale[0] = GEAR_ACROSS / GEAR_OD
    D.append(gr)
    # the bolt circle that holds the barrel together - "all basic components
    # are bolted to each other" [W9]
    for i in range(20):
        a = i * TAU / 20
        D.append(R.tube('gearbox-bolt-%d' % i, 0.021, 0.024, R.MAT_CAST,
                        parent=car, sides=6,
                        loc=(math.cos(a) * (GEAR_ACROSS / 2 + 0.030),
                             math.sin(a) * (GEAR_OD / 2 + 0.030),
                             XHEAD_H - 0.058)))

    # THE FOUR MOTOR-GEAR UNITS, around the centre [W1], each a planetary
    # reducer under an electric motor [W5].  448 kW / 4 = 112 kW.
    for i in range(MOTOR_N):
        a = i * TAU / MOTOR_N + math.pi / 4
        mx, my = math.cos(a) * MOTOR_R, math.sin(a) * MOTOR_R
        D.append(R.tube('reducer-%d' % i, REDUCER_D / 2, REDUCER_H, R.MAT_CAST,
                        parent=car, loc=(mx, my, XHEAD_H - 0.06), sides=16))
        D.append(R.tube('motor-%d' % i, MOTOR_D / 2, MOTOR_L, R.MAT_CAST,
                        parent=car, loc=(mx, my, XHEAD_H - 0.06 + REDUCER_H),
                        sides=16))
        # the fan cowl and the terminal box, which is what makes an electric
        # motor read as an electric motor rather than as a drum
        D.append(R.tube('motor-cowl-%d' % i, MOTOR_D / 2 + 0.025, 0.11,
                        R.MAT_PAINT, parent=car, sides=16,
                        loc=(mx, my, XHEAD_H - 0.06 + REDUCER_H + MOTOR_L - 0.11)))
        D.append(R.box('motor-tbox-%d' % i, (0.16, 0.13, 0.11), R.MAT_PAINT,
                       parent=car, rot=(0, 0, a),
                       loc=(mx + math.cos(a) * (MOTOR_D / 2 + 0.05),
                            my + math.sin(a) * (MOTOR_D / 2 + 0.05),
                            XHEAD_H - 0.06 + REDUCER_H + MOTOR_L * 0.55)))
        # cooling fins along the motor body
        fin = R.tube('motor-fin-%d' % i, MOTOR_D / 2 + 0.012, 0.012, R.MAT_CAST,
                     parent=car, sides=16,
                     loc=(mx, my, XHEAD_H - 0.02 + REDUCER_H))
        arr(fin, (0, 0, 0.055), 9)
        D.append(fin)

    # THE WATER SWIVEL.  "The drive train has a hollow central shaft, enabling
    # the efficient transmission of flushing media" [W1], and the pilot pass
    # wants at least 800 l/min of water down the string [W9].  So there is a
    # swivel on the top of the shaft and a hose to it, and without them the
    # machine has no visible way to flush - which is half the method.
    D.append(R.tube('water-swivel', 0.170, 0.34, R.MAT_CAST, parent=car,
                    loc=(0, 0, XHEAD_H - 0.02), sides=16))
    D.append(R.tube('swivel-cap', 0.135, 0.12, R.MAT_STEEL, parent=car,
                    loc=(0, 0, XHEAD_H + 0.32), sides=14))
    D.append(R.tube('swivel-gooseneck', 0.062, 0.30, R.MAT_STEEL, parent=car,
                    loc=(0.0, 0.06, XHEAD_H + 0.20), rot=(-1.15, 0, 0), sides=10))

    # the ram brackets - one bracket carries the cylinder eye on each side
    for deg in RAM_ANG:
        rx, ry = ram_xy(deg)
        D.append(R.box('ram-bracket-%.0f' % deg, (0.26, 0.26, 0.30), R.MAT_DARK,
                       parent=car, loc=(rx, ry, 0.42), rot=(0, 0, math.radians(deg)),
                       bevel=0.010))

    # the ram rods.  They belong to the CARRIAGE, not the base: the barrels are
    # bolted down [W4b] and the rods travel with the drive, so the exposed
    # length grows by exactly the stroke as the head rises, which is the
    # physical truth and not a cheat.
    for deg in RAM_ANG:
        rx, ry = ram_xy(deg)
        D.append(R.tube('ram-rod-%.0f' % deg, RAM_ROD / 2, 1.15, R.MAT_CHROME,
                        parent=car, loc=(rx, ry, 0.42 - 1.15), sides=14))
        # the intermediate stage collar, which is what says "telescopic"
        D.append(R.tube('ram-stage-%.0f' % deg, RAM_ROD / 2 + 0.030, 0.22,
                        R.MAT_STEEL, parent=car, sides=14,
                        loc=(rx, ry, 0.42 - 1.15)))

    # the lamp that env.js drives.  On the crosshead, so it RIDES THE FEED -
    # which is the whole reason the named-node contract exists: env.js re-reads
    # this node's world position every frame and re-aims the key light at the
    # collar as the drive travels.
    R.worklight(LAMP_MAIN, car, (0.0, FRAME_D / 2 - 0.16, 0.20),
                aim_dir=(0.0, -0.55, -1.0), cone_deg=46, range_m=22)

    # ═══════════════════════════════════════════════════════════════════════
    #  3.5  THE FLOAT BOX AND THE SPINDLE - pivot:spindle
    #
    #  [W1] "swivelling floating drive box with DI-22 thread"; on one machine
    #  "a patented, two piece swivel float box prevents transfer of bending
    #  moments to the gearbox, and a replaceable threaded insert lowers
    #  maintenance costs".  This is the node the game TURNS.
    # ═══════════════════════════════════════════════════════════════════════
    spin = R.empty(R.NODE_PIVOT, 'spindle', parent=car, loc=(0.0, 0.0, 0.0))
    S = []
    S.append(R.tube('float-box', FLOAT_D / 2, FLOAT_H, R.MAT_CAST, parent=spin,
                    loc=(0, 0, -FLOAT_H), sides=20))
    S.append(R.tube('float-box-collar', FLOAT_D / 2 + 0.040, 0.085, R.MAT_CAST,
                    parent=spin, loc=(0, 0, -FLOAT_H + 0.03), sides=20))
    S.extend(bolts('float-bolt', 10, FLOAT_D / 2 - 0.020, -FLOAT_H - 0.024,
                   0.044, 0.026, R.MAT_STEEL, parent=spin))
    # the top joint of the string, hanging in the collar.  ONE pipe: the other
    # 399 are down the hole [L3 depthCapacity 600 m / ROD_LEN 1.5 m].
    S.append(R.tube('string-top-joint', ROD_D / 2, ROD_LEN, R.MAT_WORN,
                    parent=spin, loc=(0, 0, -FLOAT_H - ROD_LEN), sides=16))
    S.append(R.tube('string-tool-joint', ROD_D / 2 + 0.028, 0.20, R.MAT_STEEL,
                    parent=spin, loc=(0, 0, -FLOAT_H - 0.20), sides=16))
    # the wrench flats [W4b "several depressions or flats located around the
    # outer surface of the drill pipe"] - the wrench has to have something to
    # bite on, and a plain tube would have nothing
    for i in range(6):
        a = i * TAU / 6
        S.append(R.box('string-flat-%d' % i, (0.05, 0.05, 0.15), R.MAT_STEEL,
                       parent=spin, rot=(0, 0, a),
                       loc=(math.cos(a) * (ROD_D / 2 + 0.012),
                            math.sin(a) * (ROD_D / 2 + 0.012),
                            -FLOAT_H - 0.36)))

    # mount:tool - where the game hangs the pilot bit and the reamer head.
    # At the BOTTOM of the visible top joint, so whatever tools.js builds hangs
    # below the string this machine is holding, which is where it belongs.
    R.empty(R.NODE_MOUNT, 'tool', spin, (0.0, 0.0, -FLOAT_H - ROD_LEN))

    weld(D, car, 'drive')
    weld(S, spin, 'spindle')

    # ═══════════════════════════════════════════════════════════════════════
    #  3.6  THE THRUST CYLINDER BARRELS (static - they are bolted DOWN)
    #  [W4b] each cylinder is fixed by "a plate that is held in place by bolts
    #  on the work table"; [W5] "hydraulic cylinders provide the thrust
    #  required for lowering and lifting the drillstring".
    # ═══════════════════════════════════════════════════════════════════════
    for deg in RAM_ANG:
        rx, ry = ram_xy(deg)
        R.tube('ram-barrel-%.0f' % deg, RAM_BARREL / 2, RAM_BAR_L, R.MAT_DARK,
               loc=(rx, ry, TABLE_TOP), sides=18)
        R.tube('ram-gland-%.0f' % deg, RAM_BARREL / 2 + 0.026, 0.11, R.MAT_STEEL,
               loc=(rx, ry, TABLE_TOP + RAM_BAR_L - 0.11), sides=18)
        R.box('ram-foot-%.0f' % deg, (0.42, 0.42, 0.055), R.MAT_DARK,
              loc=(rx, ry, TABLE_TOP + 0.027), bevel=0.006)
        bolts('ram-foot-bolt-%.0f' % deg, 6, 0.235, TABLE_TOP + 0.055,
              0.038, 0.024, R.MAT_DARK, cx=rx, cy=ry)
        # the two working lines to each cylinder, which is what says
        # "double-acting" and therefore "it pulls as well as pushes"
        for j, off in enumerate((0.06, -0.06)):
            R.tube('ram-port-%.0f-%d' % (deg, j), 0.028, 0.13, R.MAT_STEEL,
                   loc=(rx + math.cos(math.radians(deg)) * (RAM_BARREL / 2),
                        ry + math.sin(math.radians(deg)) * (RAM_BARREL / 2),
                        TABLE_TOP + 0.18 + j * (RAM_BAR_L - 0.42)),
                   rot=(0, math.pi / 2, math.radians(deg)), sides=8)

    # ═══════════════════════════════════════════════════════════════════════
    #  3.7  THE PIPE LOADER
    #  [W1] "ground loading, remote controlled", "jack knife type", "mounted on
    #  either side", "detachable"; it adds ~1.27 m to the machine's width.  The
    #  pipes it picks up are lying ON THE FLOOR - no source read describes a
    #  carousel or a vertical rack on any machine in this class.
    # ═══════════════════════════════════════════════════════════════════════
    lx = -(FRAME_W / 2 + 0.10)
    R.box('loader-pedestal', (0.34, 0.60, 0.62), R.MAT_PAINT,
          loc=(lx - 0.10, 0.30, tz + 0.31), bevel=0.014)
    R.tube('loader-pivot', 0.085, 0.40, R.MAT_STEEL,
           loc=(lx - 0.28, 0.30, tz + 0.52), rot=(0, math.pi / 2, 0), sides=12)
    # the jack-knife: a lower arm out to the floor and an upper arm folded back
    rail('loader-arm-lo', [(lx - 0.10, 0.30, tz + 0.52),
                           (lx - LOADER_W + 0.20, 0.30, tz + 0.10)],
         0.075, R.MAT_PAINT, sides=10)
    rail('loader-arm-hi', [(lx - LOADER_W + 0.20, 0.30, tz + 0.10),
                           (lx - LOADER_W + 0.34, 0.30, tz + 0.86)],
         0.062, R.MAT_PAINT, sides=10)
    R.box('loader-gripper', (0.22, 0.34, 0.26), R.MAT_DARK,
          loc=(lx - LOADER_W + 0.36, 0.30, tz + 0.96), bevel=0.010)
    for s in (-1, 1):                                  # the gripper jaws
        R.box('loader-jaw-%d' % (s > 0), (0.09, 0.10, 0.30), R.MAT_STEEL,
              loc=(lx - LOADER_W + 0.36, 0.30 + s * 0.15, tz + 1.06),
              rot=(s * 0.30, 0, 0))
    R.tube('loader-ram', 0.052, 0.62, R.MAT_CHROME,
           loc=(lx - 0.16, 0.30, tz + 0.36), rot=(0, -1.05, 0), sides=10)
    R.tube('loader-ram-barrel', 0.078, 0.42, R.MAT_PAINT,
           loc=(lx - 0.06, 0.30, tz + 0.30), rot=(0, -1.05, 0), sides=10)
    # the pipe it is carrying, at the top of its swing
    R.tube('loader-pipe', ROD_D / 2, ROD_LEN, R.MAT_WORN,
           loc=(lx - LOADER_W + 0.36, 0.30, tz + 1.02), sides=14)

    # THE PIPES ON THE FLOOR.  A shift's buffer, lying where the ground-loading
    # arm can reach them [W1].  At 600 m of raise the string is 400 pipes, so
    # what is on the floor is never the string.
    for i in range(RACK_N):
        row, col = i // 4, i % 4
        R.tube('pipe-%d' % i, ROD_D / 2, ROD_LEN, R.MAT_WORN,
               loc=(-2.35 - col * (ROD_D + 0.045) - row * 0.14,
                    1.30 - ROD_LEN / 2,
                    PAD_T * 0 + ROD_D / 2 + row * (ROD_D + 0.012)),
               rot=(-math.pi / 2, 0, 0), sides=14)
    for s in (-1, 1):                                  # the timber bearers
        R.box('pipe-bearer-%d' % (s > 0), (1.35, 0.14, 0.12), 'timber',
              loc=(-2.90, 1.30 + s * (ROD_LEN / 2 - 0.22), 0.06))

    # ═══════════════════════════════════════════════════════════════════════
    #  3.8  THE PACK - four of the machine's five assemblies [W5]
    #  Real published skid sizes [W1]; see PACK_X for why they stand closer
    #  than the real 15-30 m umbilicals would put them.
    # ═══════════════════════════════════════════════════════════════════════
    def skid(tag, size, at, louvre=True, cab=False, panel=False):
        """One skid-mounted pack: "The hydraulic power unit is SKID-MOUNTED"
        [W5], and the whole set is craned or dragged into the chamber.

        These three boxes are close to half the machine's silhouette - the
        drive pack alone is 3.6 m long against a 2.0 m derrick - so they carry
        real enclosure detail rather than being three yellow bricks.  All of it
        shares a material with the box it is on, so after finish() the entire
        lot costs triangles and NOT ONE draw call.  That is the lane the
        pipeline says to spend in, and this is where it is widest.
        """
        w, d, h = size
        x, y = at
        z0 = 0.14
        R.box(tag + '-skid', (w + 0.10, d + 0.10, 0.14), R.MAT_DARK,
              loc=(x, y, 0.07), bevel=0.008)
        R.box(tag + '-body', (w, d, h), R.MAT_PAINT,
              loc=(x, y, z0 + h / 2), bevel=0.022)
        # skid runners and fork pockets - it was dragged in and it gets lifted
        for s in (-1, 1):
            R.box(tag + '-runner-%d' % (s > 0), (0.12, d + 0.30, 0.16),
                  R.MAT_WORN, loc=(x + s * (w / 2 - 0.10), y, 0.08))
            R.box(tag + '-fork-%d' % (s > 0), (w + 0.12, 0.22, 0.09), R.MAT_DARK,
                  loc=(x, y + s * d * 0.22, 0.045))
        # corner posts and a top rail: an enclosure is a FRAME with panels
        # hung on it, and that frame is what stops it reading as one extrusion
        for sx in (-1, 1):
            for sy in (-1, 1):
                R.box(tag + '-post-%d%d' % (sx > 0, sy > 0),
                      (0.075, 0.075, h), R.MAT_DARK,
                      loc=(x + sx * (w / 2 - 0.030), y + sy * (d / 2 - 0.030),
                           z0 + h / 2))
                R.box(tag + '-lug-%d%d' % (sx > 0, sy > 0), (0.05, 0.14, 0.13),
                      R.MAT_DARK, loc=(x + sx * (w / 2 - 0.03),
                                       y + sy * (d / 2 - 0.14), z0 + h + 0.055))
        for s in (-1, 1):
            R.box(tag + '-rail-x-%d' % (s > 0), (w + 0.02, 0.075, 0.075),
                  R.MAT_DARK, loc=(x, y + s * (d / 2 - 0.03), z0 + h - 0.035))
            R.box(tag + '-rail-y-%d' % (s > 0), (0.075, d + 0.02, 0.075),
                  R.MAT_DARK, loc=(x + s * (w / 2 - 0.03), y, z0 + h - 0.035))
        # roof ribs, so the top is not a flat lid seen from every high camera
        rib = R.box(tag + '-rib', (w - 0.10, 0.06, 0.05), R.MAT_DARK,
                    loc=(x, y - d / 2 + 0.24, z0 + h + 0.020))
        arr(rib, (0, (d - 0.48) / 4.0, 0), 5)
        if louvre:
            louvres(tag + '-louvre', w * 0.62, h * 0.55, z0 + h * 0.30,
                    R.MAT_DARK, x, y + d / 2 + 0.012)
        # ACCESS DOORS.  Everything on a pack is serviced from outside, so
        # every long face is doors: two leaves, hinges, handles and a latch.
        for j, dy in enumerate((-1, 1)):
            for k, off in enumerate((-0.26, 0.26)):
                R.box('%s-door-%d%d' % (tag, j, k), (w * 0.40, 0.022, h * 0.66),
                      R.MAT_DARK, loc=(x + off * w, y + dy * (d / 2 + 0.012),
                                       z0 + h * 0.48))
                R.tube('%s-handle-%d%d' % (tag, j, k), 0.017, 0.17, R.MAT_STEEL,
                       loc=(x + off * w + w * 0.16, y + dy * (d / 2 + 0.045),
                            z0 + h * 0.40), sides=8)
                for hg in (-1, 1):
                    R.tube('%s-hinge-%d%d%d' % (tag, j, k, hg > 0), 0.020, 0.09,
                           R.MAT_STEEL, sides=8,
                           loc=(x + off * w - w * 0.19,
                                y + dy * (d / 2 + 0.030),
                                z0 + h * 0.48 + hg * h * 0.24))
        if cab:
            # the enclosed electrical cabinet [W5] lives INSIDE the drive pack
            # [W1] - so it is a door and a panel on this box, not a fifth object
            R.box(tag + '-cab-door', (w * 0.46, 0.03, h * 0.72), R.MAT_PAINT,
                  loc=(x, y - d / 2 - 0.026, z0 + h * 0.50), bevel=0.008)
            R.box(tag + '-cab-vent', (w * 0.30, 0.02, 0.10), 'galvanised',
                  loc=(x, y - d / 2 - 0.042, z0 + h * 0.78))
            # the cable glands the 20-30 m umbilicals [W1] actually enter by
            for i in range(4):
                R.tube('%s-gland-%d' % (tag, i), 0.045, 0.10, R.MAT_STEEL,
                       loc=(x - w * 0.30 + i * w * 0.20, y - d / 2 - 0.05,
                            z0 + 0.16), rot=(math.pi / 2, 0, 0), sides=10)
        if panel:
            # gauges and an isolator: the pack is where the pressures are read
            R.box(tag + '-gaugeplate', (0.42, 0.03, 0.34), R.MAT_DARK,
                  loc=(x + w * 0.32, y - d / 2 - 0.026, z0 + h * 0.62))
            for i in range(3):
                R.tube('%s-gauge-%d' % (tag, i), 0.055, 0.035, R.MAT_STEEL,
                       loc=(x + w * 0.32 - 0.13 + i * 0.13, y - d / 2 - 0.045,
                            z0 + h * 0.62), rot=(math.pi / 2, 0, 0), sides=14)
                R.tube('%s-glass-%d' % (tag, i), 0.044, 0.012, R.MAT_GLASS,
                       loc=(x + w * 0.32 - 0.13 + i * 0.13, y - d / 2 - 0.062,
                            z0 + h * 0.62), rot=(math.pi / 2, 0, 0), sides=14)
            R.box(tag + '-isolator', (0.20, 0.14, 0.26), R.MAT_DARK,
                  loc=(x - w * 0.34, y - d / 2 - 0.08, z0 + h * 0.60))
            R.tube(tag + '-isolator-lever', 0.020, 0.16, R.MAT_HAZARD,
                   loc=(x - w * 0.34, y - d / 2 - 0.17, z0 + h * 0.60),
                   rot=(1.2, 0, 0), sides=8)

    skid('drive-pack', PACK_DRIVE, (PACK_X, 1.30), cab=True, panel=True)
    skid('thrust-pack', PACK_THRUST, (PACK_X + 0.30, -1.95), panel=True)
    skid('cooling-unit', PACK_COOL, (PUMP_X, 1.55))
    # the cooler's fan stack, which is the only thing that tells the cooling
    # unit apart from the other two boxes at a glance
    for i in range(2):
        R.tube('cooler-fan-%d' % i, 0.34, 0.14, R.MAT_DARK,
               loc=(PUMP_X, 1.55 - 0.55 + i * 1.10, 0.14 + PACK_COOL[2]), sides=18)
        R.tube('cooler-fan-hub-%d' % i, 0.09, 0.16, R.MAT_STEEL,
               loc=(PUMP_X, 1.55 - 0.55 + i * 1.10, 0.14 + PACK_COOL[2]), sides=10)

    # THE WATER PUMP.  [L1 C.2.5] puts "a water pump alongside" in the same
    # breath as the power pack, and the pilot pass wants 800+ l/min [W9].
    R.box('water-pump-skid', (1.30, 0.90, 0.13), R.MAT_DARK,
          loc=(PUMP_X - 0.30, -1.35, 0.065), bevel=0.006)
    R.tube('water-pump-motor', 0.24, 0.62, R.MAT_CAST,
           loc=(PUMP_X - 0.62, -1.35, 0.13), rot=(0, math.pi / 2, 0), sides=16)
    R.tube('water-pump-body', 0.21, 0.34, R.MAT_CAST,
           loc=(PUMP_X + 0.06, -1.35, 0.13), rot=(0, math.pi / 2, 0), sides=16)
    R.tube('water-pump-volute', 0.26, 0.16, R.MAT_CAST,
           loc=(PUMP_X + 0.20, -1.35, 0.30), sides=16)
    # the suction tank.  [W9] wants "min 800 litres/min of water for efficient
    # flushing" on the pilot pass, so there is a real tank here and not a
    # token: 1.05 x 1.20 x 0.90 is about 1 100 litres, i.e. well under a
    # minute and a half of flush - which is exactly why it is a TANK being fed
    # by a line and not a reservoir.
    twx, twy = PUMP_X + 0.30, -2.55
    R.box('water-tank', (1.05, 1.20, 0.90), R.MAT_PAINT,
          loc=(twx, twy, 0.45), bevel=0.02)
    for s in (-1, 1):                                # corner angles and feet
        for t in (-1, 1):
            R.box('water-tank-post-%d%d' % (s > 0, t > 0), (0.06, 0.06, 0.90),
                  R.MAT_DARK, loc=(twx + s * 0.50, twy + t * 0.57, 0.45))
            R.box('water-tank-foot-%d%d' % (s > 0, t > 0), (0.16, 0.16, 0.05),
                  R.MAT_DARK, loc=(twx + s * 0.46, twy + t * 0.53, 0.025))
    rib = R.box('water-tank-rib', (1.07, 0.05, 0.05), R.MAT_DARK,
                loc=(twx, twy - 0.40, 0.30))
    arr(rib, (0, 0.40, 0), 3)
    R.tube('water-tank-manway', 0.20, 0.09, R.MAT_DARK,
           loc=(twx - 0.24, twy, 0.90), sides=16)
    bolts('water-tank-manway-bolt', 8, 0.235, 0.965, 0.034, 0.020,
          R.MAT_DARK, cx=twx - 0.24, cy=twy)
    R.tube('water-tank-vent', 0.055, 0.22, R.MAT_STEEL,
           loc=(twx + 0.30, twy + 0.34, 0.90), sides=10)
    # a sight gauge, because a tank with no level indication is a prop
    R.tube('water-tank-gauge', 0.022, 0.62, R.MAT_GLASS,
           loc=(twx - 0.53, twy + 0.30, 0.16), sides=8)
    for j in (0, 1):
        R.tube('water-tank-gauge-cock-%d' % j, 0.035, 0.07, R.MAT_STEEL,
               loc=(twx - 0.53, twy + 0.30, 0.13 + j * 0.62), sides=8)
    # suction line, tank to pump
    R.hose('water-suction',
           [(twx - 0.50, twy + 0.10, 0.22), (PUMP_X + 0.35, -2.00, 0.16),
            (PUMP_X + 0.26, -1.60, 0.16), (PUMP_X + 0.22, -1.35, 0.20)],
           radius=0.062, sides=8)

    # THE OPERATOR.  [W1] "trolley mounted operator panel with full-colour
    # display" - a wheeled console, NOT a cab; [W8] "the operator is generally
    # stood in the open less than 5 m from the hole being drilled".  Giving
    # this machine a cab would be the same class of error as giving it tracks.
    ox, oy = 2.35, -1.55
    R.box('console-body', (0.72, 0.46, 0.62), R.MAT_PAINT,
          loc=(ox, oy, 0.86), bevel=0.020)
    R.box('console-desk', (0.76, 0.34, 0.06), R.MAT_DARK,
          loc=(ox, oy + 0.16, 1.18), rot=(-0.30, 0, 0))
    R.box('console-screen', (0.40, 0.02, 0.28), R.MAT_GLASS,
          loc=(ox, oy - 0.02, 1.34), rot=(-0.32, 0, 0))
    R.box('console-bezel', (0.46, 0.04, 0.34), R.MAT_DARK,
          loc=(ox, oy + 0.005, 1.33), rot=(-0.32, 0, 0))
    for i in range(4):
        R.tube('console-lever-%d' % i, 0.016, 0.18, R.MAT_STEEL,
               loc=(ox - 0.27 + i * 0.18, oy + 0.20, 1.20),
               rot=(-0.30, 0, 0), sides=8)
    for s in (-1, 1):
        R.tube('console-leg-%d' % (s > 0), 0.030, 0.56, R.MAT_DARK,
               loc=(ox + s * 0.28, oy, 0.00), sides=8)
        for t in (-1, 1):
            R.tube('console-wheel-%d%d' % (s > 0, t > 0), 0.075, 0.05, 'rubber',
                   loc=(ox + s * 0.28, oy + t * 0.18, 0.075),
                   rot=(0, math.pi / 2, 0), sides=12)
    R.worklight(LAMP_TABLE, None, (ox - 0.40, oy + 0.30, 1.62),
                aim_dir=(-0.85, 0.62, -0.42), cone_deg=58, range_m=18)

    # ═══════════════════════════════════════════════════════════════════════
    #  3.9  UMBILICALS - the hoses and cables that make it one machine
    #  [W1] "15 or 20 meter hoses to Derrick", "20 m or 30 m Cables to derrick".
    #  Routed as real drooping curves: hose routing is the single clearest tell
    #  that a machine was modelled from a photograph rather than from memory,
    #  and it is also literally what holds this five-part machine together.
    # ═══════════════════════════════════════════════════════════════════════
    # NOTE ON DRAW CALLS: R.hose() makes a CURVE, and finish()'s join only
    # looks at o.type == 'MESH' - so every hose left as a curve is its own
    # draw call.  Eight of them is eight draw calls for nothing, when baked to
    # meshes they all fold into `static:rubber` for one.  H is the bake list.
    H = []
    hz0 = tz + 0.18
    for i, (r, dy) in enumerate(((0.062, 0.00), (0.062, 0.17), (0.048, -0.17))):
        H.append(R.hose('drive-hose-%d' % i,
               [(PACK_X + PACK_DRIVE[0] / 2, 1.30 + dy, 0.14 + 0.55),
                (PACK_X + 1.35, 1.10 + dy, 0.16),
                (-1.85, 0.65 + dy, 0.14),
                (-FRAME_W / 2 - 0.05, 0.30 + dy, hz0)], radius=r, sides=6))
    for i, dy in enumerate((0.10, -0.10)):
        H.append(R.hose('thrust-hose-%d' % i,
                 [(PACK_X + 0.30 + PACK_THRUST[0] / 2, -1.95 + dy, 0.14 + 0.60),
                  (PACK_X + 1.90, -1.55 + dy, 0.15),
                  (-1.70, -0.95 + dy, 0.13),
                  (ram_xy(150)[0] - 0.12, ram_xy(150)[1] - 0.30, TABLE_TOP + 0.30)],
                 radius=0.055, sides=6))
    # the water line, up to the swivel on top of the drive.  It is the visible
    # proof that stage 1 flushes and stage 2 does not.
    H.append(R.hose('water-line',
             [(PUMP_X + 0.20, -1.35, 0.44),
              (2.60, -0.60, 0.30), (1.40, 0.35, 0.55),
              (0.55, 0.60, 2.30), (0.10, 0.30, DRIVE_LO + XHEAD_H + 0.30)],
             radius=0.052, sides=6))
    # the power cable, which on an electric machine is as thick as a hose and
    # is the reason fuelPerHour is 0 [L3]
    H.append(R.hose('drive-cable',
             [(PACK_X + PACK_DRIVE[0] / 2, 0.30, 0.14 + 1.20),
              (PACK_X + 1.60, -0.20, 0.14), (-1.60, -0.40, 0.12),
              (-FRAME_W / 2 - 0.02, -0.55, tz + 0.30)], radius=0.058, sides=6))
    H.append(R.hose('console-cable',
             [(ox - 0.30, oy, 0.55), (1.50, -1.20, 0.10),
              (0.70, -0.90, 0.10), (FRAME_W / 2 + 0.02, -0.70, tz + 0.22)],
             radius=0.030, sides=6))
    del H                                    # baked in one sweep below
    # a cable tray up the frame, so the runs have somewhere to land
    R.box('cable-tray', (0.16, 0.05, 0.90), 'galvanised',
          loc=(-FRAME_W / 2 - 0.06, -0.55, tz + 0.30))

    # THE HOSE TRACK.  [W1] lists a "hose chain for drive hoses" as an option,
    # and something has to carry the drive's hydraulics and its flushing water
    # up to a head that travels 1.71 m.  It also does real compositional work:
    # the bay between the parked drive and the headframe is 700 mm of bare
    # column, and in a side elevation that reads as a table on a post.  The
    # track is the only thing that belongs in that volume - it hangs off the
    # headframe's rear member at y = -0.850 +/- 0.150, which is clear of
    # everything the crosshead sweeps (the gearbox oval reaches y = 0.640 and
    # the guide sleeves y = 0.225).
    trk_y = -(FRAME_D / 2 - 0.06)
    trk_z0, trk_z1 = TABLE_TOP, COL_TOP - HEADFRAME_H
    R.box('hose-track', (0.22, 0.09, trk_z1 - trk_z0), R.MAT_DARK,
          loc=(0.0, trk_y, (trk_z0 + trk_z1) / 2), bevel=0.008)
    R.box('hose-track-back', (0.30, 0.03, trk_z1 - trk_z0), 'galvanised',
          loc=(0.0, trk_y - 0.06, (trk_z0 + trk_z1) / 2))
    clamp = R.box('hose-track-clamp', (0.28, 0.13, 0.045), R.MAT_STEEL,
                  loc=(0.0, trk_y, trk_z0 + 0.30))
    arr(clamp, (0, 0, (trk_z1 - trk_z0 - 0.60) / 7.0), 8)
    for s in (-1, 1):                       # the brackets that hold it out
        R.box('hose-track-bkt-%d' % (s > 0), (0.06, 0.20, 0.14), R.MAT_DARK,
              loc=(s * 0.14, trk_y + 0.10, trk_z1 - 0.12))
    # the drive's own hydraulic pair, riding the track up to the crosshead
    for i, dx in enumerate((-0.065, 0.065)):
        R.hose('drive-riser-%d' % i,
               [(dx, trk_y + 0.10, TABLE_TOP + 0.10),
                (dx, trk_y + 0.09, trk_z1 - 0.55),
                (dx * 1.6, trk_y + 0.34, DRIVE_LO + XHEAD_H * 0.72),
                (dx * 2.2, -0.62, DRIVE_LO + XHEAD_H * 0.55)],
               radius=0.042, sides=6)

    # ONE BAKE SWEEP over every curve in the scene, immediately before the
    # export.  R.hose() makes CURVES, and finish()'s join only looks at
    # o.type == 'MESH' - so a hose left as a curve is its own draw call, and
    # eleven of them would be eleven draw calls for nothing.  Baked, they all
    # fold into `static:rubber` for one.  Done here rather than at each call
    # site so that a hose added later cannot quietly miss it, which is exactly
    # what happened to the four routed after the first bake loop.
    for o in list(bpy.context.scene.objects):
        if o.type == 'CURVE':
            bake(o)

    return R.finish(out_path)


if __name__ == '__main__':
    HERE = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.abspath(os.path.join(HERE, '..', 'public', 'models'))
    os.makedirs(out_dir, exist_ok=True)
    build(os.path.join(out_dir, 'raisebore.glb'))
