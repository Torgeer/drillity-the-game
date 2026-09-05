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

So: a folding TRIPOD derrick raised over the hole, towed to site on its own two
wheels.  A FREE-FALL winch drum and a hand clutch, driven by a small diesel,
working a wire rope over a sheave at the head.  Tools - claycutter, shell,
chisel - are DROPPED and lifted on that rope and cut by repeated free fall.
Nothing rotates.  Nothing circulates.  The driller hoists on the drum,
declutches, and lets the string fall; [TOM] p.501 puts the skill exactly:
"Operation of the boring tools from the winch rope gives a good indication of
the state of compaction of the soil strata."  He is reading the rope.

THE NEGATIVE SPACE IS HALF THE IDENTITY, and it is enforced here by what this
file never builds: no cab, no glazing, no tracks, no boom, no mast-mounted
rotary head, no drill rods, no hydraulic cylinder, no hose to the hole.  There
is deliberately NO `MAT_GLASS` and NO `MAT_CHROME` anywhere in this module - a
chrome cylinder rod is the signature of the machine this one is not.
`research/rigs/cable-percussion.md` section 5.1 reduces the whole read to five
words: "a tripod and a rope".

TWO MACHINES WEAR THIS NAME AND MUST NOT BE CONFLATED (reference section 2):
  (A) the British / Nordic GI tripod - free-fall winch, 1-3 m stroke, ~1.8 t,
      towed by a 4x4.  THIS FILE BUILDS FAMILY A.
  (B) the American truck spudder - walking beam, crank and pitman, three drums
      on a truck deck, 0.41-0.89 m stroke, 3.4-7.3 t.
`src/rig/rigFactory.js` `buildCablePercussion` builds family B, and `data.js`'s
description text ("a folding derrick over a walking beam") describes family B
too - while the game's own site research (`research/16-site-archetypes.md`
section B.2) puts this rig on ground-investigation plots, where the correct
machine is family A.  The reference records that as domain-truth warning 9.B.
The brief for this model asks for family A, so family A is what is here, and
THE DIVERGENCE FROM data.js IS REAL AND IS REPORTED, not papered over.

SOURCES
-------
[ST]   Southern Testing, "Technical Data - Cable Percussive Drilling Rig",
       southerntesting.co.uk/wp-content/uploads/2019/06/
       Technical_Cable-Percussive-Boreholes.pdf  [HIRE]
       THE ONLY FULL GENERAL ARRANGEMENT FOR FAMILY A in the reference: line
       pull, derrick loading, weight, working height under sheaves, and the
       travelling and operating envelopes for three machines of one range.
       Every governing dimension here is its `rig 2000` column.  Prose: "a
       winch, which is driven by a diesel engine, and a tripod derrick of about
       7m height ... folds down so that the rig can be towed by a four-wheel
       drive vehicle"; boreholes "between 150 and 450mm in diameter, to depths
       of up to 50m".  Reference section 4.2.0.
[GA]   Dimensioned general-arrangement drawing - side elevation, front
       elevation and plan, with red dimension callouts - published on a UK
       specialist contractor's cable-percussion capability sheet,
       van-elle.co.uk/wp-content/uploads/2023/06/
       Dando-Cable-Percussion-Drilling-Rig.pdf p.1  [MFR-derived]
       THE ONLY DIMENSIONED DRAWING OF THIS MACHINE FOUND ANYWHERE, and it is
       the source for the ARRANGEMENT this file builds:
         - 5622 mm ground to head sheave centre (the dimension terminates on
           the circled sheave)
         - 6830 mm overall erected height
         - 2208 mm chassis base fore/aft, 1981 mm plan width
         - THE THIRD LEG LANDS ON THE CHASSIS OVER THE AXLE, not on the ground:
           the front elevation shows two splayed legs with ground feet plus a
           central ladder-mast, and the side elevation shows where that mast
           foots.  Confirmed on eight separate photographs of working machines.
         - a LADDER up the full height of the centre leg
         - TWO sheaves at the head: the main one on the front face, a smaller
           tooling sheave below and behind it
       Table: "Mast Height 7m / Width 1.85m / Weight 1.6 to 2.10 ton /
       Max Pullback 2 - 4 ton / Operatives 2".
[BRO]  Manufacturer brochure, two-wheel towed percussive boring rig, 4 pp.
       (scanned; read as rendered page images),
       boreholesolutions.co.uk/wp-content/uploads/2020/06/Pilcon-1500.pdf [MFR]
       "Percussive Boring Rig mounted on two wheels for towing.  The rig is
       self-erecting using its own winch."  Overall 6545 x 8150 x 1790 mm.
       "CHASSIS AND SHEAR LEGS - Maximum designed working load of shear legs:
       9000kg."  Air-cooled twin-cylinder diesel; heavy-duty worm-drive gearbox;
       "Hydraulically operated clutch via hand lever.  Brake is finely adjusted
       manually and has a lock-on feature."  "Winch pull 1500kg (bare drum)."
       Road brakes on both wheels with a lock-off for reversing.  Performance
       150 mm to 100 m, 200 mm to 50 m, 250 mm to 30 m.  Optional extras include
       a steel engine cover and a Sampson post.
[MK2]  Manufacturer brochures for the 2000 / 3000 / 4000 machines of the same
       family [MFR] - boreholesolutions.co.uk/.../2000_3000.pdf and
       /Dando-4000.pdf, plus lankelma.com/.../Data-Sheet-Cable-Percussion-
       Drilling-Rig-Dando-4000.pdf.  ENGINE POWER, which the reference lists as
       NOT SOURCED: 18 HP (13 kW) at 1800 rpm on the 2000 class, 20 HP (15 kW)
       at 1600 rpm on the 3000.  "A manual clutch-operated free fall winch is
       used to drill, run casing and bail."  "Full clutch and winch guards are
       fitted as standard."  "An independent electrically operated winch with
       remote cable control is fitted on the Sampson post so that the derrick
       legs can be raised and lowered safely."  Removable mudguards; overrun
       braking with towing eye and parking brake lever.
[FLT]  Hire-fleet plant list carrying six cable percussion rigs in one table,
       phoenixdrilling.co.uk/wp-content/uploads/2020/09/
       plant-specifications-sep-2020.pdf  [HIRE] - the TRAVELLING HEIGHT, which
       no other source gives: 1.50-1.75 m.  That is the folded derrick, and it
       is what proves the legs fold FLAT along the chassis rather than merely
       tipping back.  Weights 1.8-2.25 t, working heights 6.6-7.1 m.
[DUK]  Current-production machine of the same family, manufacturer product page
       [MFR] - "90m of 16mm LH lay wireline" on the main free-fall winch and
       "38.5m of 6mm wireline" on the tooling winch.  THE ROPE DIAMETER AND ITS
       LAY, for the British machine, from the maker.
[BDA]  British Drilling Association, Technical Guide SWR/WLL/MBL, Nov 2023
       [STD] - "Cable tool percussion drilling = 5:1 ... the ratio between MBL
       and the static weight of the drilling tool when empty", and: "Rope end
       connections using wire rope clamps (Bulldog grips) are only permitted
       for free fall applications."  So bulldog grips at the rope termination
       are not a shortcut - they are the correct and characteristic fitting on
       THIS machine and on almost nothing else.
[ARC]  Archway Engineering (UK) Ltd product pages [MFR] - the only dimensioned
       British tool tables found: claycutter/shell body "approximately 6 ft",
       the 4"-24" nominal ladder against BS 879 casing, sinker bar 4.5 in x
       40 in x ~80 kg with 2.25 x 3.25 in API pin and box, coarse-pitch screw-on
       shoes, steel or leather clack valves, California chisels in 5 ft and
       1 ft 6 in only.
[TOM]  Tomlinson & Woodward, "Pile Design and Construction Practice", 566 pp.,
       held locally at C:\\Users\\henri\\Downloads\\pile-design-and-construction.pdf
       [STD].  NOT PREVIOUSLY READ BY THE REFERENCE - added by this pass.
       Section 3.3.7 "Tripod rigs" (PDF pp.133-135): the clay cutter is "a
       simple tube with a sharpened cutting edge, the tube being driven down
       under the impact of a heavy drill stem" and the plug is "prised out by
       spade"; coarse soils are worked with "a baler or 'shell' ... a simple
       tube with a cutting edge and flap valve".  Tripod rigs are used "in
       situations where low headroom or difficult access" rule out lorry- or
       track-mounted augers, and bore piles "up to 600 mm diameter 10 m deep".
       Chapter 11 (PDF pp.514-518): "Cable percussion borings give the most
       reliable information for piling work"; the caution about "loosening the
       soil by sucking or surging it through the CLACK VALVE on the baler".
[MAN]  US water-well drilling manual, ch. 3 "Cable Tool", 85 pp. scanned, held
       locally at C:\\Users\\henri\\Downloads\\212.0-79WA-526.pdf  [CAT]
       NOT PREVIOUSLY READ BY THE REFERENCE - added by this pass.  Independently
       confirms the LEFT LAY rule the reference had resting on a single web
       column: "a left lay cable of 6 x 19 or 6 x 21 construction", with line
       size mapped to hole size.  Also the bit gauge rule - "do not allow the
       bit to get more than 1/4" below gauge" - which is the hard number behind
       the wear model `tools.js` already gets right.
[AGS]  AGS, quoting the BDA's manual-handling assessment [STD] - sinker bar
       80 kg, 6" casing lead length 77 kg, U100 slide hammer 93 kg, SPT drop
       hammer assembly 115 kg, against a two-person limit of 65 kg high-risk /
       85 kg unacceptable.  NOTHING ON THIS SITE IS CARRIED; it is dragged,
       rolled, levered and swung on the rope.  Also the string's stroke of
       "1 to 3 m", corroborated by the Rural Water Supply Network.
[CON]  Consallen Group Sales Ltd, "Cable Percussion - How to Drill" [MFR] - the
       free-fall winch, the apex strong-point for a snatch block, leg braces and
       feet that must be stopped from spreading, the apple-corer claycutter, the
       swan-neck expressing tool, casing in 1.5 m lengths at ~60 kg, and depth
       set by the LENGTH OF WIRE ON THE DRUM, usually 60 m.
[R16]  `research/16-site-archetypes.md` section B.2 - tripod derrick
       "approximately 7 m in height", ~6.7 m working headroom, 2 t winch,
       towed by a 4x4, casing 150/200 mm standard, routine depth to 50 m.
[R06]  `research/06-geotech-water-geothermal.md` section E.8 - "a tripod and a
       rope"; crew of 2; "No rotation, no flush, no hydraulics at the hole".
[D]    DERIVED here by arithmetic on published numbers.  Flagged every time.
[NS]   NOT SOURCED.  A figure had to exist for the mesh to be built; nothing in
       the reference or on the web publishes it.  Flagged every time, and listed
       in `research/rigs/cable-percussion.md` section 8.1.

THE DERIVATION THIS FILE RESTS ON, AND WHY IT IS TRUSTWORTHY
-------------------------------------------------------------
[ST] publishes the erected envelope and no leg geometry at all.  [GA] shows the
arrangement and dimensions a different machine of the same range.  Put them
together with the ONE arrangement fact [GA] and eight photographs agree on -
two front legs to the ground, the third footing on the chassis over the axle -
and every number closes at once:

    apex over the hole                    H = 6.650 m       [ST] operating height
    front feet, half-spread            W/2 = 1.036 m        [ST] 2 072 between legs
    front feet ahead of the apex         a = 1.925 m        [D]
    axle behind the apex                     0.825 m        [D]
    chassis rear behind the apex             2.165 m        [D]

      FRONT LEG  = sqrt(1.036^2 + 1.925^2 + 6.650^2) = 7.0001 m
          -> [ST] and [R16] and [GA] all say "about 7 m", from three
             independent documents.
      OPERATING LENGTH = 1.925 + 2.165 = 4.090 m
          -> [ST]'s published operating length, EXACTLY.
      FRONT FEET AHEAD OF THE AXLE = 2.750 m
          -> [GA]'s side elevation scales to 2.5-3.0 m.
      REAR LEG = sqrt(0.825^2 + (6.650-0.720)^2) = 5.987 m
          -> shorter than the front pair, because it foots on the deck.  It is
             also the leg that carries the LADDER, which is why every photograph
             shows rungs up the middle of the machine.

    SHEAVE CENTRE = 5.470 m, reached two independent ways:
      - [ST] "derrick working height under sheaves 5 200" plus a 400 mm sheave
        and a thin block bottom gives 5.200 + 0.200 + 0.070 = 5.470
      - [GA] dimensions the sheave centre at 5 622 on a 6 830 machine; the same
        ratio on this 6 650 machine gives 5.474
      They agree to 4 mm, from a hire sheet and a drawing that have nothing to
      do with each other, and they jointly SOURCE the 400 mm sheave diameter
      that the reference lists as NOT SOURCED.

**AND THE DERIVATION OVERTURNS THE REFERENCE'S OWN LEG-RAKE FIGURE.**  Section
4.2.0 item 1 of `research/rigs/cable-percussion.md` reads W:H = 2.072 : 6.650
as "each leg about 8.5-9 degrees off vertical" and on that basis tells the
modeller to "build the modern GI tripod narrow and steep" and to discard the
period engraving's ~17 degrees.  That is wrong, and it is wrong in an easy way:
0.31 : 1 is the LATERAL half-spread of the front pair only, and a leg rakes in
the plane containing it and the apex, which also has the fore-aft offset in it.
The true front-leg rake here is

    atan( sqrt(1.036^2 + 1.925^2) / 6.650 ) = 18.2 degrees off vertical

- within a degree of the engraving the reference dismissed.  The correction is
written back into section 4.2.0 of the reference.

UNITS AND AXES
--------------
Metres.  Blender is Z-up; the exporter converts to three.js Y-up.
ORIGIN IS THE DRILLING AXIS AT GROUND LEVEL.  The rope hangs down +Z through
(0, 0), so the machine drops onto terrain at y=0 with the hole at the origin
and needs no fudge offset.  +Y is REARWARD - toward the chassis, the winch, the
engine and the drawbar; +X is the machine's right.  The two front legs splay
FORWARD to their ground feet, leaving the collar clear, and the driller stands
at the chassis nose with his hand on the clutch, looking down the rope.
"""
import sys
import os
import math

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
import bpy                                                        # noqa: E402
import rig as R                                                   # noqa: E402


# ═════════════════════════════════════════════════════════════════════════════
# GOVERNING DIMENSIONS - [ST] `rig 2000` column unless marked otherwise
# ═════════════════════════════════════════════════════════════════════════════
OP_HEIGHT   = 6.650   # [ST] operating height, mm 6 650
UNDER_SHEAVE = 5.200  # [ST] "derrick working height under sheaves", mm 5 200
LEG_SPREAD  = 2.072   # [ST] "operating width between legs", mm 2 072.  Identical
                      # on all three machines of the range while every other
                      # dimension changes - the leg frame is a common weldment.
OP_LENGTH   = 4.090   # [ST] operating length, mm 4 090
TRAVEL_LEN  = 7.500   # [ST] travelling length, mm 7 500
TRAVEL_HGT  = 1.550   # [FLT] "1.55m high" travelling - the FOLDED derrick.  A
                      # 7 m leg lying at 1.55 m is flat along the chassis, not
                      # tipped back at an angle.
WHEEL_BASE  = 1.810   # [ST] "operating width, wheel base", mm 1 810.  Equal to
                      # the travelling width, so folded, the tripod tucks inside
                      # the track of its own trailer.
LINE_PULL   = 2000.0  # [ST] single line pull, kgf.  Also [R16] "2 tonne winch".
                      # On this family the model number IS the line pull in kg.
DERRICK_LOAD = 6000.0 # [ST] maximum derrick loading, kg - THREE TIMES the line
                      # pull.  [BRO] say the same of its own shear legs at
                      # 9 000 kg against a 1 500 kg winch, six times over.  The
                      # frame is deliberately far stronger than the wire, which
                      # is why the legs look heavier than they need to be.
MASS_KG     = 1700.0  # [ST] total weight excluding tools or casing.  [FLT] put
                      # the class at 1.8-2.25 t.  A GI tripod is a TWO-TONNE
                      # object - a car, not a lorry.
ENGINE_KW   = 13.0    # [MK2] 18 HP at 1800 rpm on this size.  Closes a gap the
                      # reference lists as NOT SOURCED ("a diesel engine" was
                      # the entire published description).  Note `data.js`
                      # asserts 82 kW for this rig - six times the sourced
                      # figure, because it describes the American truck spudder.

# ── the derived tripod, see the docstring ────────────────────────────────────
FOOT_FWD    = 1.925   # [D] hole to the front feet, along -Y
LEG_HALF    = LEG_SPREAD / 2
AXLE_Y      = 0.825   # [D] axle behind the apex; the rear leg foots over it
CH_Y0       = 0.160   # [D] chassis nose, set back from the collar so there is
CH_Y1       = 2.165   # [D] room to work at the hole; rear end from OP_LENGTH
DECK_Z      = 0.720   # [NS] deck top; [GA] shows the frame low over the wheel
FRONT_LEG   = math.sqrt(LEG_HALF ** 2 + FOOT_FWD ** 2 + OP_HEIGHT ** 2)  # 7.0001
REAR_LEG    = math.hypot(AXLE_Y, OP_HEIGHT - DECK_Z)                     # 5.987
LEG_RAKE    = math.degrees(math.atan2(math.hypot(LEG_HALF, FOOT_FWD), OP_HEIGHT))

# Leg section.  [NS] in dimension, but the FORM is now photographic: the orange
# machines of this family carry SQUARE BOX-SECTION legs (clearly visible in a
# close-up of two operatives at the collar, with a horizontal cross-brace at
# ~2 m and a diagonal below it), while the blue machine of [BRO] uses ROUND
# TUBE.  Both are real and the difference is visible; box section is built here
# because it is the arrangement the [GA] drawing dimensions.  Reference section
# 8.1 keeps the fork open: "Tube, square section, channel and timber all appear
# across the family's history ... Do not invent a wall thickness."
LEG_W       = 0.100   # [NS] 100 mm square box section
BRACE_R     = 0.024   # [NS] removable leg braces.  [CON] require them in place
                      # under multi-part tackle, so they exist; size is not
                      # published.

# ── the head and its two sheaves ─────────────────────────────────────────────
SHEAVE_Z    = 5.470   # [D] from [ST] 5 200 under-sheave + a 400 mm sheave, and
                      # independently from [GA]'s 5 622 on a 6 830 machine
                      # (5.474).  Two unrelated documents, 4 mm apart.
SHEAVE_R    = 0.200   # [D] 400 mm - jointly sourced by the pair above; the
                      # reference lists sheave diameter as NOT SOURCED and this
                      # closes it.  (A "1.5 m / 60 in" figure circulates in
                      # drilling literature: it is an OIL-RIG CROWN BLOCK and is
                      # about ten times too large for this machine.)
SHEAVE_W    = 0.070   # [NS] across the groove cheeks
HEAD_Z0     = 5.330   # [NS] fabricated head casting, bottom
HEAD_Z1     = 6.280   # [NS] and top; the leg ends stand proud above it, which
                      # is what puts [ST]'s 6.650 operating height above the
                      # 5.200 working height under the sheaves.  [GA]: "the head
                      # casting projects ~200-300 mm above the leg apex".
SHEAVE2_Y   = 0.470   # [GA] the tooling sheave sits BELOW AND BEHIND the main
SHEAVE2_Z   = 4.980   # one; sizes [NS]
SHEAVE2_R   = 0.115

# ── the rope ─────────────────────────────────────────────────────────────────
ROPE_D      = 0.016   # [DUK] "90m of 16mm LH LAY wireline" on the main free-fall
                      # winch of a current machine in this family.  THE ONLY
                      # MANUFACTURER ROPE FIGURE FOR THE BRITISH RIG.
                      #
                      # NOTE THIS CORRECTS THE REFERENCE.  Section 4.2.0b takes
                      # 10 mm from [CON] - but that is [CON]'s own 0.5 t mini
                      # machine, the smallest rig in the family, and section 4.1
                      # then reasons from it that "on family A the rope is a
                      # thin, whippy line" against the American 19.1 mm cable.
                      # At 16 mm the working GI tripod's rope is within 16 % of
                      # the American drill line, not half it.  Both figures are
                      # real and they belong to different sizes of machine.
                      #
                      # AND THE LAY IS NOW SOURCED FOR FAMILY A.  Section 4.1
                      # warns "do NOT assume the American left-lay 6 x 19
                      # applies - British tools screw together on API tapers
                      # above a swivel, and a swivel removes the mechanical
                      # reason left lay exists."  Sound reasoning, wrong answer:
                      # the maker specifies LH lay on the British machine too.
                      # [MAN] independently confirms left lay with "6 x 19 or
                      # 6 x 21 construction".  So warning 9.Q stands and gets
                      # STRONGER: whenever a rope texture is authored, this
                      # helix runs the opposite way to every other rope in the
                      # fleet.
ROPE_R      = 0.0090  # modelled at 18 mm, +12 % over scale, the same reason
                      # core_rig.py over-scales its 4.76 mm wireline: the rope
                      # is the single most important line in this silhouette and
                      # losing it to rasterisation loses the machine.
ROPE2_R     = 0.0045  # [DUK] "38.5m of 6mm wireline" on the tooling winch, also
                      # over-scaled.  Two ropes of visibly different thickness
                      # on one machine, which is a real tell.
DRUM_CAP_M  = 90.0    # [DUK] 90 m on the main winch; [CON] "usually 60 m".  THE
                      # DRUM, NOT THE DERRICK, IS THE DEPTH LIMIT.

# ── the tool string on the rope ──────────────────────────────────────────────
# 8" nominal working size, which drills the 200 mm casing [R16] calls standard.
TOOL_OD     = 0.194   # [ARC] 7 5/8 in tool OD for the 8" nominal size, running
                      # inside 8 5/8 x 7 7/8 in casing - about 4.5 mm clearance
                      # per side at the 6" size.  The tool is a close but
                      # VISIBLY LOOSE fit and knocks on the casing all the way
                      # down; it is never a piston fit.
TOOL_LEN    = 1.830   # [ARC] claycutter / shell body "approximately 6 ft.
                      # Shorter tools can be supplied to order for low-headroom
                      # drilling."
SHOE_LEN    = 0.150   # [NS] screw-on cutting shoe.  [ARC] give the deliberately
                      # coarse thread and the plain / serrated / chisel-end /
                      # gravelling / auger-nose variants, but no shoe length.
SINKER_OD   = 0.1143  # [ARC] sinker bar 4.5 in
SINKER_LEN  = 1.000   # [ARC] "40 in effective length", ~80 kg each; [AGS] carry
                      # the same 80 kg as a manual-handling case.  [TOM] call it
                      # "a heavy drill stem" and say the cutter is "driven down
                      # under the impact" of it - the sinker bar is the mass that
                      # does the work, not the tool.
SWIVEL_LEN  = 0.260   # [NS].  [ARC]: the top bar "carries a swivel eye, secured
                      # by a tapered nut and pin".  THE BRITISH STRING HAS A
                      # SWIVEL AND NO ROPE SOCKET - a zinc-poured rope socket
                      # here would be an American tool on a British machine.
STROKE_M    = 2.000   # [AGS] the string reciprocates "through a stroke of 1 to
                      # 3 m" - a FREE WINCH DROP, three to five times the
                      # American crank throw.  2.0 m is mid-band and fits under
                      # the 5.200 m clear height with the 3.09 m string hanging.
                      # NOTE: do NOT give this machine a blows-per-minute
                      # figure.  The "15-60 strokes per minute" in circulation
                      # belongs to American WALKING-BEAM rigs; the British
                      # sources describe only "long drop" and "short stroke"
                      # technique and publish no rate.

# ── trailer, winch, stowage ──────────────────────────────────────────────────
CH_RAIL_X   = 0.480   # [NS] side rails
WHEEL_R     = 0.330   # [NS] light-trailer wheel.  [GA] gives the 1 810 mm wheel
WHEEL_W     = 0.195   # base; no source states a tyre size.
DRUM_R      = 0.150   # [NS] winch drum barrel
DRUM_W      = 0.310   # [NS]
DRUM_FL_R   = 0.235   # [NS] drum flange
DRAWBAR_Y   = 3.300   # [NS] hitch.  [MK2] specify "overrun braking mechanism
                      # incorporating towing eye and parking brake lever".
CASING_OD   = 0.219   # [ARC]/[CON] 8 5/8 in BS 879, the casing the 7 5/8 in tool
                      # runs inside.  The sourced telescoping sequence is
                      # 300 -> 250 -> 200 -> 150 mm, reducing with depth.
CASING_LEN  = 1.500   # [CON] "most useful in 1.5m (5-foot) lengths", ~60 kg
                      # each, flush butt jointed.  THIS IS THE FAMILY-A LENGTH;
                      # family B stacks 3.05 m lengths and its rack looks
                      # completely different.


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

        box((4, 2, 10))      -> (2.000, 1.000, 5.000)
        box((1, 1, 1))       -> (0.500, 0.500, 0.500)
        box((0.2, 3.0, 0.5)) -> (0.100, 1.500, 0.250)
        tube(r=0.5, l=3.0)   -> (1.000, 1.000, 3.000)   <- tube() is CORRECT

    `tube()` being right is what hid this for so long: a machine built from both
    gets correct cylinders and half-size boxes, and nothing looks broken in a
    wireframe - the proportions are just quietly wrong.

    HANDOFF.md section 10 records that it has already bitten twice, and that
    `core_rig.py`, `pd55.py` and `foundation_bg.py` each carry a PRIVATE
    corrected `box()` to work around it.  Those private copies are why the
    library was never fixed, and they are what makes the fix dangerous: the
    moment `rig.py` is corrected, any machine still compensating doubles in
    size.  That has happened twice.

    So this file compensates for NOTHING.  Every dimension above is the real
    dimension, `R.box()` is called with it directly, and if the library is still
    broken the build STOPS HERE with an error that says exactly what to fix.
    `build.py` catches it per machine, so this refusal costs nobody else a
    model.  A machine that silently exports at half size is far worse than one
    that refuses to export - HANDOFF.md section 8A is the whole catalogue of
    what silent fallbacks have cost this project.
    """
    probe = R.box('__boxprobe', (4.0, 2.0, 10.0))
    got = tuple(round(v, 4) for v in probe.dimensions)
    bpy.data.objects.remove(probe, do_unlink=True)
    if got != (4.0, 2.0, 10.0):
        raise RuntimeError(
            'cable_percussion: rig.py box() is STILL half-size - box((4,2,10)) '
            'measured %s, expected (4.0, 2.0, 10.0).  This module builds to true '
            'dimensions and deliberately does NOT compensate, so it will not '
            'export a wrong-sized machine.  Fix lib/rig.py box() to '
            '`o.scale = size` (and then strip the private box() copies in '
            'core_rig.py, pd55.py and foundation_bg.py, or those three double '
            'in size).  See HANDOFF.md section 10.' % (got,))


def _check_stow_profile():
    """MEASURE the chassis kit against the published travelling height.

    HANDOFF.md section 8E is a catalogue of dimensions that were quoted
    correctly and then contradicted by the geometry - an eccentric that could
    not come out of its own hole, a belling tool whose arms crossed the
    centreline.  Its rule is "read the figure off the mesh", and this is that
    rule applied to the one published number that constrains the whole chassis
    layout.

    [FLT] gives a travelling height of 1.50-1.75 m across six machines of this
    class.  A 7 m leg lying at 1.55 m is FLAT ALONG THE CHASSIS, not tipped back
    - so the folded legs sweep the deck, and anything bolted to it that stands
    higher than the underside of those legs makes a machine that cannot fold,
    which is the one thing this machine is FOR.  The first layout broke it four
    times over: a 2.09 m Sampson post, a 1.82 m exhaust stack, a work lamp on a
    1.64 m pillar, and the engine.

    Dynamic parts are exempt - a clutch lever is pushed over for the road and
    the hook comes off the tooling line.  Everything else is measured, and
    anything standing in the legs' way fails the build BY NAME, because that is
    the only way this stays true as the model is edited.
    """
    limit = TRAVEL_HGT - LEG_W - 0.020
    dg = bpy.context.evaluated_depsgraph_get()
    worst = []
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        n = o.name
        # Derrick furniture is not chassis kit: it folds WITH the legs, so a brace
        # lug 2.2 m up a leg is not standing in anything's way.  The geometric
        # window alone could not tell the difference - it flagged two of them on
        # the centre leg, which passes straight through the chassis footprint.
        if n.split('_')[0].rstrip('0123456789') in (
                'leg', 'brace', 'bracelug', 'splice', 'splicepin', 'foot',
                'ladder', 'head', 'headpin', 'sheave', 'strongpoint', 'rope'):
            continue
        if 'hook' in n or n.startswith('clutch') or n.startswith('brake'):
            continue
        p, dyn = o, False
        while p is not None:
            if p.name.startswith(R.NODE_PIVOT) or p.name.startswith(R.NODE_SLIDE):
                dyn = True
            p = p.parent
        if dyn:
            continue
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        if me is None or not me.vertices:
            continue
        w = [(ev.matrix_world @ v.co) for v in me.vertices]
        top = max(q.z for q in w)
        cx = sum(q.x for q in w) / len(w)
        cy = sum(q.y for q in w) / len(w)
        ev.to_mesh_clear()
        # Only things standing ON the chassis: inside its footprint, and low
        # enough to be kit rather than derrick.  The legs, braces, ladder, head,
        # sheaves and ropes all top out far above 2.4 m and drop out here.
        if DECK_Z < top < 2.4 and abs(cx) < 0.80 and CH_Y0 - 0.1 < cy < CH_Y1 + 0.3:
            if top > limit:
                worst.append((n, top))
    if worst:
        worst.sort(key=lambda t: -t[1])
        raise RuntimeError(
            'cable_percussion: %d part(s) on the chassis stand above the folded '
            'legs.  [FLT] travelling height %.2f m less a %.0f mm leg leaves '
            '%.3f m of clear stowage, and these exceed it: %s'
            % (len(worst), TRAVEL_HGT, LEG_W * 1000, limit,
               ', '.join('%s %.3f' % q for q in worst[:6])))


def bake(o):
    """Apply every modifier, and convert a curve to a mesh, so it can be joined.

    `join()` keeps only the ACTIVE object's modifier stack, and `finish()` skips
    CURVE objects entirely - so an unbaked rope lands as its own draw call, and
    an unbaked ARRAY gets applied to whatever it is joined into.  core_rig.py
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
    that is the difference between the tool string costing nine draw calls and
    costing two.
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
    """ARRAY modifier with a constant offset in the object's LOCAL frame - which
    is what lets a ladder rung march up a raking leg instead of up world Z."""
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
    `loc` rather than based on it, because every one of these is a round thing on
    an axle and the axle is what you know the position of."""
    rot = {'X': (0, math.pi / 2, 0), 'Y': (-math.pi / 2, 0, 0), 'Z': (0, 0, 0)}[axis]
    o = R.tube(name, r, t, mat, parent=parent, loc=loc, rot=rot, sides=sides)
    off = {'X': (-t / 2, 0, 0), 'Y': (0, -t / 2, 0), 'Z': (0, 0, -t / 2)}[axis]
    o.location = (loc[0] + off[0], loc[1] + off[1], loc[2] + off[2])
    return o


def _aim(a, b):
    """Length and the Euler that sends +Z from `a` to `b`.

    Euler XYZ (0, ry, rz) sends +Z to (sin ry cos rz, sin ry sin rz, cos ry) -
    no extra quarter turn.  core_rig.py records getting exactly this wrong and
    firing every handrail off at 90 degrees to the deck edge it should follow.
    """
    d = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
    L = math.sqrt(d[0] ** 2 + d[1] ** 2 + d[2] ** 2)
    if L < 1e-5:
        return 0.0, (0, 0, 0)
    return L, (0, math.acos(max(-1.0, min(1.0, d[2] / L))), math.atan2(d[1], d[0]))


def strut(name, a, b, r, mat, parent=None, sides=8):
    """A round tube from point `a` to point `b`."""
    L, rot = _aim(a, b)
    if L == 0.0:
        return None
    return R.tube(name, r, L, mat, parent=parent, loc=a, rot=rot, sides=sides)


def boxstrut(name, a, b, w, h, mat, parent=None, bevel=0.006):
    """A BOX-SECTION member from `a` to `b`.

    The legs of this machine are square box section, and a round leg reads as a
    scaffold pole rather than as a derrick, so this exists.  `R.box` centres its
    mesh on `loc`, so the member is placed at the midpoint and aimed the same
    way `strut` aims a tube.
    """
    L, rot = _aim(a, b)
    if L == 0.0:
        return None
    mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2)
    return R.box(name, (w, h, L), mat, parent=parent, loc=mid, rot=rot, bevel=bevel)


APEX = (0.0, 0.0, OP_HEIGHT)


def leg_base(i):
    """Where leg `i` foots.  0 = the CENTRE leg, which lands ON THE CHASSIS over
    the axle at deck height and carries the ladder; 1 and 2 = the front pair,
    which land on the ground 2 072 mm apart.  That asymmetry is the single most
    important arrangement fact in the whole model, it comes from [GA]'s two
    elevations, and eight photographs agree with it."""
    return [(0.0, AXLE_Y, DECK_Z),
            (-LEG_HALF, -FOOT_FWD, 0.0),
            (LEG_HALF, -FOOT_FWD, 0.0)][i]


def leg_point(i, frac):
    """A point `frac` of the way from leg `i`'s base to the apex."""
    b = leg_base(i)
    return (b[0] + (APEX[0] - b[0]) * frac,
            b[1] + (APEX[1] - b[1]) * frac,
            b[2] + (APEX[2] - b[2]) * frac)


# ═════════════════════════════════════════════════════════════════════════════
def build(out_path):
    R.reset()
    _assert_box_true()          # STOP if lib/rig.py still halves every box

    statics = []
    A = statics.append

    # ── 1. THE TRIPOD DERRICK ───────────────────────────────────────────────
    # Two 7.000 m front legs raking 18.2 degrees forward and outward to ground
    # feet 2 072 mm apart, and a 5.987 m centre leg footing on the chassis over
    # the axle.  The apex is directly over the drilling axis because the method
    # requires it absolutely: the rope hangs straight down into the hole, this
    # machine cannot drill at an angle, and there is no crowd force to make it.
    for i in range(3):
        b = leg_base(i)
        A(boxstrut('leg%d' % i, b, APEX, LEG_W, LEG_W, R.MAT_PAINT))

        # The bottom of a leg is a different object from the rest of it: mud
        # line up the feet and the lowest ~600 mm, and rust blooming upward from
        # the lower third, worst at the pin joints and weld lines - observed
        # across every working-machine photograph examined.  The front legs get
        # a worn shin; the centre leg foots on the deck and does not.
        if i:
            sh = leg_point(i, 0.085)
            A(boxstrut('leg%d_shin' % i, b, sh, LEG_W + 0.008, LEG_W + 0.008,
                       R.MAT_WORN))
            # THE FOOT: a flat steel spread plate.  [BRO]'s own photography
            # shows the leg feet standing on flat plates, which also answers
            # [CON]'s requirement that "the tripod feet [be] prevented from
            # spreading" - the plate takes the bearing, and the eye on it takes
            # the tie.  Reference section 8.1 lists the foot as NOT SOURCED;
            # this is the photograph closing it.
            A(R.box('foot%d' % i, (0.30, 0.30, 0.028), R.MAT_WORN,
                    loc=(b[0], b[1], 0.014), bevel=0.006))
            A(disc('foot%d_eye' % i, 0.036, 0.020, R.MAT_STEEL,
                   (b[0], b[1] + 0.11, 0.070), 'X', sides=8))
        else:
            # the centre leg's shoe, bolted to the chassis over the axle
            A(R.box('leg0_shoe', (0.20, 0.24, 0.070), R.MAT_DARK,
                    loc=(b[0], b[1], b[2] + 0.035), bevel=0.008))

        # THE FOLD JOINT.  [GA] shows "pin joints at the head casting and
        # mid-leg splice plates", and the legs must fold: [ST]'s travelling
        # length 7.500 m against an operating length of 4.090 m, at [FLT]'s
        # travelling height of 1.55 m, is a 7 m leg lying flat along the
        # chassis.  The splice is modelled as a plated pin joint; its exact
        # mechanism stays NOT SOURCED (reference section 8.1).
        p = leg_point(i, 0.30 if i else 0.42)
        _, prot = _aim(leg_base(i), APEX)
        A(R.box('splice%d' % i, (LEG_W + 0.05, LEG_W + 0.05, 0.26), R.MAT_DARK,
                loc=p, rot=prot, bevel=0.010))
        A(disc('splicepin%d' % i, 0.024, LEG_W + 0.12, R.MAT_STEEL, p,
               'Y' if i == 0 else 'X', sides=8))

    # LEG BRACES.  [CON], verbatim: "When using multi-part tackles, all the leg
    # braces should be in place and the tripod feet prevented from spreading."
    # They are REMOVABLE, which is why they bolt between the legs at one height
    # rather than forming a welded lattice.  A photograph of two operatives at
    # the collar shows a horizontal cross-brace at about 2 m with a diagonal
    # below it - so: one low ring plus a diagonal, and one high ring.  Sizes NS.
    for frac in (0.245, 0.615):
        for i, j in ((0, 1), (1, 2), (2, 0)):
            a, b = leg_point(i, frac), leg_point(j, frac)
            A(strut('brace%d_%d%d' % (int(frac * 1000), i, j), a, b, BRACE_R,
                    R.MAT_PAINT, sides=6))
            for k, e in enumerate((a, b)):
                A(R.box('bracelug%d_%d%d_%d' % (int(frac * 1000), i, j, k),
                        (0.072, 0.072, 0.072), R.MAT_DARK, loc=e, bevel=0.008))
    # the diagonal, front face only
    A(strut('brace_diag', leg_point(1, 0.245), leg_point(2, 0.615), BRACE_R,
            R.MAT_PAINT, sides=6))

    # THE LADDER UP THE CENTRE LEG.  [GA] shows "a ladder running the full
    # height of the centre mast (visible as rungs in both the drawing and every
    # photo)".  It is the reason the machine reads as having a mast at all from
    # the front, and it is one ARRAY - free in draw calls, ~200 triangles.
    l0, l1 = leg_point(0, 0.055), leg_point(0, 0.93)
    llen, lrot = _aim(l0, l1)
    for s in (-1, 1):
        A(boxstrut('ladder_rail%d' % s,
                   (l0[0] + s * 0.16, l0[1], l0[2]),
                   (l1[0] + s * 0.16, l1[1], l1[2]), 0.030, 0.030, R.MAT_PAINT,
                   bevel=0.004))
    # The rung's 0.32 m must span ACROSS the machine.  Under the leg's Euler
    # (0, ry, rz=-pi/2), local +X points fore-aft and local +Y points along world
    # +X - so the long dimension goes on Y.  With it on X the whole ladder came
    # out edge-on, rungs pointing down the drawbar.
    rung = R.box('ladder_rung', (0.022, 0.32, 0.022), R.MAT_PAINT, loc=l0,
                 rot=lrot)
    arr(rung, (0, 0, 0.28), int(llen / 0.28))
    A(rung)

    # THE HEAD CASTING.  The legs run through it to the apex and stand proud
    # above - [GA]: "the head casting projects ~200-300 mm above the leg apex as
    # a pinned stub" - which is what puts [ST]'s 6.650 m operating height above
    # its 5.200 m working height under the sheaves.  Form and material are NS;
    # what is certain is that it carries TWO sheaves and a strong-point.
    A(R.box('head', (0.25, 0.34, HEAD_Z1 - HEAD_Z0), R.MAT_CAST,
            loc=(0, 0.085, (HEAD_Z0 + HEAD_Z1) / 2), bevel=0.016))
    for i in range(3):
        p = leg_point(i, 1.0 - (OP_HEIGHT - HEAD_Z1 + 0.10) / OP_HEIGHT)
        A(disc('headpin%d' % i, 0.022, LEG_W + 0.14, R.MAT_STEEL, p,
               'Y' if i == 0 else 'X', sides=6))
    A(disc('head_cap', 0.17, 0.030, R.MAT_DARK, (0, 0, OP_HEIGHT - 0.015),
           'Z', sides=12))

    # THE STRONG-POINT.  [CON], verbatim: "The upper snatch block would be
    # attached to the rig frame near the apex at the strong-point provided."
    # A named, sourced part that almost nobody models: a lug on the head,
    # separate from the sheaves, that a snatch block shackles into for the
    # multi-part tackle used to pull casing.
    A(R.box('strongpoint', (0.028, 0.15, 0.20), R.MAT_STEEL,
            loc=(0, 0.315, HEAD_Z1 - 0.20), bevel=0.006))
    A(disc('strongpoint_hole', 0.028, 0.036, R.MAT_DARK,
           (0, 0.315, HEAD_Z1 - 0.25), 'X', sides=8))

    # ── 2. THE TWO SHEAVES ──────────────────────────────────────────────────
    # THE SHEAVE IS A pivot: BECAUSE THE BRIEF AND THE MACHINE BOTH REQUIRE IT.
    # Raising and dropping a tool on this rope is the machine's entire visual
    # identity; a crown sheave welded into the static join would be a rig that
    # cannot work.
    #
    # IT IS OFFSET +Y BY EXACTLY ITS OWN RADIUS.  [GA] dimensions the main
    # sheave on the FRONT FACE of the head casting, and the rope leaves its
    # front tangent and "drops vertically to the borehole".  Putting the centre
    # at y = +R therefore puts the falling rope, the tool and the hole all on
    # x=0, y=0 - the origin the game drops the machine onto.  Get this wrong by
    # one radius and the tool drills 200 mm to the side of its own hole.
    A(disc('sheave_axle', 0.026, SHEAVE_W + 0.11, R.MAT_STEEL,
           (0, SHEAVE_R, SHEAVE_Z), 'X', sides=8))
    for s in (-1, 1):
        A(R.box('sheave_cheek%d' % s, (0.014, 0.40, 0.44), R.MAT_CAST,
                loc=(s * (SHEAVE_W / 2 + 0.013), SHEAVE_R, SHEAVE_Z - 0.01),
                bevel=0.005))
    A(R.box('sheave_guard', (SHEAVE_W + 0.08, 0.10, 0.030), R.MAT_CAST,
            loc=(0, SHEAVE_R - 0.02, UNDER_SHEAVE + 0.020), bevel=0.005))

    sheave = R.empty(R.NODE_PIVOT, 'sheave', loc=(0, SHEAVE_R, SHEAVE_Z))
    sh = [disc('sheave_rim', SHEAVE_R, SHEAVE_W, R.MAT_CAST, (0, 0, 0), 'X',
               sides=20),
          disc('sheave_groove', SHEAVE_R - 0.011, SHEAVE_W + 0.006, R.MAT_WORN,
               (0, 0, 0), 'X', sides=20),
          disc('sheave_boss', SHEAVE_R * 0.40, SHEAVE_W + 0.028, R.MAT_CAST,
               (0, 0, 0), 'X', sides=12)]
    # spokes, so the sheave reads as a wheel and not a disc when it turns.  The
    # groove itself is polished to a mirror in a narrow band and nowhere else
    # (reference section 6.1 item 2) - which is why it carries wornSteel while
    # the rim is castIron.
    for k in range(4):
        sh.append(R.box('sheave_spoke%d' % k,
                        (SHEAVE_W * 0.52, SHEAVE_R * 1.5, 0.020), R.MAT_CAST,
                        loc=(0, 0, 0), rot=(k * math.pi / 4, 0, 0)))
    weld(sh, sheave, 'sheave')

    # THE TOOLING SHEAVE, below and behind [GA].  Its line is the 6 mm wireline
    # [DUK], not the 16 mm drill line - two ropes of visibly different thickness
    # on one machine.
    for s in (-1, 1):
        A(R.box('sheave2_cheek%d' % s, (0.012, 0.26, 0.28), R.MAT_CAST,
                loc=(s * 0.038, SHEAVE2_Y, SHEAVE2_Z), bevel=0.004))
    sheave2 = R.empty(R.NODE_PIVOT, 'sheave-tooling',
                      loc=(0, SHEAVE2_Y, SHEAVE2_Z))
    weld([disc('sheave2_rim', SHEAVE2_R, 0.046, R.MAT_CAST, (0, 0, 0), 'X',
               sides=14),
          disc('sheave2_gr', SHEAVE2_R - 0.010, 0.052, R.MAT_WORN, (0, 0, 0),
               'X', sides=14)], sheave2, 'sheave-tooling')

    # ── 3. THE TRAILER CHASSIS ──────────────────────────────────────────────
    # [BRO]: "Percussive Boring Rig mounted on two wheels for towing."  [R16]:
    # a light trailer, never self-propelled.  The frame is a U with an open
    # centre - the centre leg foots on it over the axle, and the collar sits
    # just off the nose so the driller can reach the hole and the clutch at the
    # same time.
    for s in (-1, 1):
        A(R.box('rail%d' % s, (0.085, CH_Y1 - CH_Y0, 0.150), R.MAT_DARK,
                loc=(s * CH_RAIL_X, (CH_Y0 + CH_Y1) / 2, DECK_Z - 0.075),
                bevel=0.010))
    for cy in (CH_Y0 + 0.07, AXLE_Y, 1.52, CH_Y1 - 0.07):
        A(R.box('xmem%d' % int(cy * 100), (2 * CH_RAIL_X, 0.085, 0.120),
                R.MAT_DARK, loc=(0, cy, DECK_Z - 0.080), bevel=0.008))
    A(R.box('deck', (2 * CH_RAIL_X + 0.08, CH_Y1 - 1.02, 0.026), R.MAT_DARK,
            loc=(0, (1.02 + CH_Y1) / 2, DECK_Z + 0.013), bevel=0.005))
    ck = R.box('deck_rib', (2 * CH_RAIL_X + 0.03, 0.020, 0.007), R.MAT_DARK,
               loc=(0, 1.10, DECK_Z + 0.029))
    arr(ck, (0, 0.100, 0), 11)
    A(ck)

    # wheels on the published 1 810 mm base
    A(disc('axle', 0.038, WHEEL_BASE - 0.12, R.MAT_STEEL,
           (0, AXLE_Y, WHEEL_R), 'X', sides=8))
    for s in (-1, 1):
        x = s * WHEEL_BASE / 2
        A(disc('tyre%d' % s, WHEEL_R, WHEEL_W, R.MAT_RUBBER,
               (x, AXLE_Y, WHEEL_R), 'X', sides=18))
        A(disc('rim%d' % s, WHEEL_R * 0.56, WHEEL_W + 0.014, R.MAT_PAINT,
               (x, AXLE_Y, WHEEL_R), 'X', sides=12))
        A(disc('hub%d' % s, 0.068, WHEEL_W + 0.050, R.MAT_WORN,
               (x, AXLE_Y, WHEEL_R), 'X', sides=8))
        # [MK2] "removable mud guards"
        A(R.box('mudguard%d' % s, (WHEEL_W + 0.050, 0.84, 0.018), R.MAT_PAINT,
                loc=(x, AXLE_Y, WHEEL_R + 0.30), bevel=0.007))
        A(R.box('mudguard%d_l' % s, (WHEEL_W + 0.050, 0.018, 0.13), R.MAT_PAINT,
                loc=(x, AXLE_Y - 0.42, WHEEL_R + 0.245), bevel=0.005))
        A(R.box('spring%d' % s, (0.052, 0.78, 0.020), R.MAT_WORN,
                loc=(x * 0.84, AXLE_Y, WHEEL_R + 0.072), bevel=0.004))

    # drawbar, hitch and the overrun brake [MK2]
    A(strut('drawbar_l', (-CH_RAIL_X, CH_Y1 - 0.08, DECK_Z - 0.10),
            (-0.052, DRAWBAR_Y - 0.26, DECK_Z - 0.12), 0.036, R.MAT_DARK, sides=6))
    A(strut('drawbar_r', (CH_RAIL_X, CH_Y1 - 0.08, DECK_Z - 0.10),
            (0.052, DRAWBAR_Y - 0.26, DECK_Z - 0.12), 0.036, R.MAT_DARK, sides=6))
    A(R.box('overrun', (0.15, 0.42, 0.15), R.MAT_DARK,
            loc=(0, DRAWBAR_Y - 0.30, DECK_Z - 0.12), bevel=0.012))
    A(disc('towing_eye', 0.055, 0.050, R.MAT_STEEL,
           (0, DRAWBAR_Y - 0.03, DECK_Z - 0.12), 'Y', sides=10))
    A(R.box('handbrake', (0.030, 0.30, 0.030), R.MAT_STEEL,
            loc=(0.10, DRAWBAR_Y - 0.44, DECK_Z + 0.06), rot=(-0.55, 0, 0)))
    A(R.box('drawbar_stripe', (0.22, 0.14, 0.018), R.MAT_HAZARD,
            loc=(0, DRAWBAR_Y - 0.52, DECK_Z - 0.03)))
    A(R.tube('jockey_tube', 0.030, 0.58, R.MAT_PAINT,
             loc=(0.14, DRAWBAR_Y - 0.62, 0.09), sides=8))
    A(disc('jockey_wheel', 0.082, 0.052, R.MAT_RUBBER,
           (0.14, DRAWBAR_Y - 0.62, 0.080), 'X', sides=10))

    # corner steadies.  SCREW JACKS, NOT RAMS - there is no hydraulic anything
    # on this machine.  [NS] as fittings, but a 1.7 t trailer carrying a 6 000 kg
    # derrick loading has to come off its springs before the derrick goes up.
    for s in (-1, 1):
        for jy in (CH_Y0 + 0.14, CH_Y1 - 0.16):
            t = '%d_%d' % (s, int(jy * 100))
            A(R.box('jack' + t, (0.065, 0.065, 0.28), R.MAT_DARK,
                    loc=(s * (CH_RAIL_X + 0.055), jy, DECK_Z - 0.21), bevel=0.006))
            A(R.tube('jackscrew' + t, 0.020, 0.29, R.MAT_STEEL,
                     loc=(s * (CH_RAIL_X + 0.055), jy, 0.050), sides=6))
            A(disc('jackpad' + t, 0.072, 0.018, R.MAT_WORN,
                   (s * (CH_RAIL_X + 0.055), jy, 0.018), 'Z', sides=8))
            A(R.box('jackhandle' + t, (0.19, 0.015, 0.015), R.MAT_STEEL,
                    loc=(s * (CH_RAIL_X + 0.15), jy, DECK_Z - 0.35)))

    # ── 4. THE ENGINE AND THE FREE-FALL WINCH ───────────────────────────────
    # [MK2]: "A manual clutch-operated free fall winch is used to drill, run
    # casing and bail."  [BRO]: an air-cooled twin-cylinder diesel through a
    # heavy-duty worm-drive gearbox, with a clutch worked by hand lever and a
    # manually adjusted brake with a lock-on feature.  There is no crank, no
    # pitman and no walking beam: a beam here would be the American spudder,
    # which is a different machine (reference warning 9.B).  Power 13 kW [MK2].
    # EVERYTHING FIXED ON THE CHASSIS IS KEPT UNDER STOW_MAX.  [FLT] publishes a
    # travelling height of 1.50-1.75 m for this class, and a 7 m leg lying at
    # 1.55 m is FLAT ALONG THE CHASSIS - so the folded legs pass over the deck
    # and nothing bolted to it may stand in their way.  That published number is
    # therefore a hard geometric check on the whole chassis packing, and it is
    # the only check available on it; the first layout failed it four times over
    # (a 2.09 m Sampson post, a 1.82 m exhaust, the lever tops and the engine).
    ENG_Y = 1.150
    ENG_Z = DECK_Z + 0.26
    A(R.box('engine_case', (0.70, 0.70, 0.52), R.MAT_PAINT,
            loc=(0, ENG_Y, ENG_Z + 0.00), bevel=0.018))
    lv = R.box('eng_louvre', (0.018, 0.50, 0.022), R.MAT_DARK,
               loc=(0.352, ENG_Y, ENG_Z + 0.16))
    arr(lv, (0, 0, -0.044), 5)
    A(lv)
    A(R.box('eng_hatch', (0.018, 0.42, 0.30), R.MAT_DARK,
            loc=(-0.352, ENG_Y, ENG_Z - 0.02), bevel=0.006))
    # a SHORT stack: a tall one is the easiest way to break the folded profile
    A(R.tube('exhaust', 0.030, 0.20, R.MAT_WORN,
             loc=(-0.22, ENG_Y + 0.24, ENG_Z + 0.22), sides=8))
    A(disc('exh_cap', 0.040, 0.026, R.MAT_WORN,
           (-0.22, ENG_Y + 0.24, ENG_Z + 0.42), 'Z', sides=8))
    A(R.box('fuel_tank', (0.26, 0.34, 0.22), R.MAT_DARK,
            loc=(0.27, 1.74, DECK_Z + 0.12), bevel=0.011))
    A(disc('fuel_cap', 0.042, 0.026, R.MAT_WORN,
           (0.27, 1.74, DECK_Z + 0.24), 'Z', sides=8))

    # The winch sits low on the frame at the chassis NOSE, ahead of the centre
    # leg's foot, with the engine in its box behind - which is what makes [GA]'s
    # "the rope leaves the drum, rises up the FRONT FACE of the derrick, over
    # the head sheave, and drops vertically to the borehole" geometrically true.
    WY = 0.470
    for s in (-1, 1):
        A(R.box('winch_side%d' % s, (0.042, 0.44, 0.40), R.MAT_DARK,
                loc=(s * (DRUM_W / 2 + 0.29), WY, DECK_Z + 0.18), bevel=0.008))
    A(R.box('winch_bed', (2 * (DRUM_W / 2 + 0.32), 0.50, 0.050), R.MAT_DARK,
            loc=(0, WY, DECK_Z + 0.008), bevel=0.006))
    # [BRO] "Heavy duty worm-drive gearbox"
    A(R.box('gearbox', (0.24, 0.26, 0.26), R.MAT_CAST,
            loc=(0.36, WY, DECK_Z + 0.19), bevel=0.012))

    # THE DRUMS.  Two: the 16 mm drill line and the 6 mm tooling line [DUK].
    drums = []
    for tag, dx, dr, rr, layers in (('tool', -0.185, DRUM_R, ROPE_R, (11, 8)),
                                    ('tooling', 0.215, DRUM_R * 0.72, ROPE2_R,
                                     (16, 12))):
        node = R.empty(R.NODE_PIVOT, 'drum-' + tag, loc=(dx, WY, DECK_Z + 0.225))
        g = [disc('drum_%s_barrel' % tag, dr, DRUM_W, R.MAT_WORN, (0, 0, 0),
                  'X', sides=14)]
        for s in (-1, 1):
            g.append(disc('drum_%s_fl%d' % (tag, s), DRUM_FL_R * (dr / DRUM_R),
                          0.016, R.MAT_CAST,
                          (s * (DRUM_W / 2 + 0.008), 0, 0), 'X', sides=14))
        # THE ROPE ON THE DRUM, AND IT IS NOT TIDY.  Reference section 4.1: this
        # is a STORAGE reel, not a level-wound working winch - the line is set to
        # depth and then worked - so it is "wound in multiple untidy layers with
        # a visible crossover", and the wear concentrates in bands rather than
        # spreading evenly.  Two rough layers of turns read that at any distance
        # the game will ever show, and cost one ARRAY each.
        for lay, n0 in enumerate(layers):
            t = disc('drum_%s_turn%d' % (tag, lay), dr + (2 * lay + 1) * rr,
                     rr * 1.9, R.MAT_WORN,
                     (-DRUM_W / 2 + 0.015 + lay * 0.014, 0, 0), 'X', sides=12)
            # disc(axis='X') rotates the object by ry=pi/2, which sends local +X
            # to world -Z and local +Z to world +X.  The ARRAY offset is in the
            # object's LOCAL frame, so marching the turns along the DRUM AXIS -
            # world X - means offsetting in local Z.  Offsetting in local X
            # stacked them downward through the winch bed instead.
            arr(t, (0, 0, rr * 2.1), n0)
            g.append(t)
        weld(g, node, 'drum-' + tag)
        drums.append(node)

    # THE CLUTCH LEVER.  "The operator works the clutch by hand and reads the
    # rope; that is the whole skill."  [BRO]: "Hydraulically operated clutch via
    # hand lever.  Brake is finely adjusted manually and has a lock-on feature."
    # It is the most-handled object on the machine, and reference section 6.1
    # item 5 says exactly where the wear is: "The paint is gone from the top
    # 150 mm of every lever and nowhere else."  So the lever is painted and its
    # grip is bare worn steel, and that split is the whole point of modelling
    # the grip as a separate piece.
    clutch = R.empty(R.NODE_PIVOT, 'clutch',
                     loc=(-0.56, WY + 0.26, DECK_Z + 0.12))
    weld([R.tube('clutch_lever', 0.019, 0.50, R.MAT_PAINT, loc=(0, 0, 0),
                 rot=(-0.20, 0, 0), sides=8),
          R.tube('clutch_grip', 0.025, 0.145, R.MAT_WORN,
                 loc=(0, 0.099, 0.490), rot=(-0.20, 0, 0), sides=8)],
         clutch, 'clutch')
    A(R.box('clutch_quad', (0.028, 0.19, 0.15), R.MAT_DARK,
            loc=(-0.56, WY + 0.26, DECK_Z + 0.08), bevel=0.006))
    A(R.box('clutch_housing', (0.21, 0.23, 0.23), R.MAT_CAST,
            loc=(-0.44, WY, DECK_Z + 0.19), bevel=0.011))
    # the band-brake lever beside it, with its lock-on catch [BRO]
    A(R.tube('brake_lever', 0.017, 0.42, R.MAT_PAINT,
             loc=(-0.42, WY + 0.30, DECK_Z + 0.12), rot=(-0.32, 0, 0), sides=8))
    A(R.tube('brake_grip', 0.023, 0.130, R.MAT_WORN,
             loc=(-0.42, WY + 0.432, DECK_Z + 0.518), rot=(-0.32, 0, 0), sides=8))
    A(R.box('brake_catch', (0.022, 0.10, 0.070), R.MAT_STEEL,
            loc=(-0.42, WY + 0.36, DECK_Z + 0.27), bevel=0.004))

    # [MK2] "Full clutch and winch guards are fitted as standard."  Open at the
    # front so the rope can leave: a closed guard on a free-fall drum would be a
    # guard on a machine that cannot work.
    # Its extent is set by two clearances that have to be CHECKED, not assumed:
    # both ropes rise off their drums' FRONT tangents at y ~ 0.31-0.36, and the
    # centre leg passes through y ~ 0.76 at guard height on its way to the apex.
    # The guard lives in the gap between them, covering the drum from above and
    # behind and open at the front where the rope leaves.  A full-width guard
    # put a plate straight through both the drilling line and the centre leg.
    A(R.box('drum_guard_top', (0.84, 0.28, 0.018), R.MAT_PAINT,
            loc=(0, WY + 0.09, DECK_Z + 0.48), bevel=0.006))
    A(R.box('drum_guard_back', (0.84, 0.018, 0.28), R.MAT_PAINT,
            loc=(0, WY + 0.225, DECK_Z + 0.35), bevel=0.006))

    # ── 5. THE SAMPSON POST AND THE DERRICK-RAISING WINCH ───────────────────
    # [MK2], verbatim: "An independent electrically operated winch with remote
    # cable control is fitted on the Sampson post so that the derrick legs can
    # be raised and lowered safely."  [BRO] list a Sampson post as an optional
    # extra and say the rig is otherwise "self-erecting using its own winch".
    # A named, sourced part, and it is the answer to reference section 8.1's
    # "Erection method ... whether the tripod is raised by hand, by its own
    # winch, or by a gin.  Unsourced."  It is neither: it is a second, electric
    # winch on a post.
    # Its height is set by the folded-leg profile, not by taste: at 1.36 m the
    # post's head stood at 2.09 m and the legs could not have come down over it.
    SP_Y = CH_Y1 - 0.30
    A(R.tube('sampson_post', 0.055, 0.68, R.MAT_PAINT,
             loc=(-0.34, SP_Y, DECK_Z + 0.02), sides=10))
    A(R.box('sampson_gusset', (0.020, 0.26, 0.26), R.MAT_PAINT,
            loc=(-0.34, SP_Y + 0.11, DECK_Z + 0.15), bevel=0.005))
    A(R.box('raise_winch', (0.22, 0.18, 0.19), R.MAT_DARK,
            loc=(-0.34, SP_Y - 0.02, DECK_Z + 0.56), bevel=0.010))
    A(disc('raise_drum', 0.058, 0.14, R.MAT_WORN,
           (-0.34, SP_Y - 0.02, DECK_Z + 0.56), 'X', sides=10))
    A(disc('sampson_cap', 0.070, 0.018, R.MAT_DARK,
           (-0.34, SP_Y, DECK_Z + 0.69), 'Z', sides=10))

    # ── 6. WHAT IS BOLTED ON AND WHAT IS LYING ON THE DECK ──────────────────
    # Photographs of working machines agree on the kit: a toolbox in an open
    # rack, jerry cans, a spare wheel bolted to the rear, and a cluster of
    # safety decals on the guard.  [AGS] explain why none of it is neat: a
    # sinker bar is 80 kg and a casing length ~60 kg against a two-person limit
    # of 65 kg, so nothing here is carried - it is rolled off a cradle and
    # dragged.
    A(R.box('toolbox', (0.32, 0.40, 0.22), R.MAT_PAINT,
            loc=(-0.24, 1.76, DECK_Z + 0.14), bevel=0.010))
    A(R.box('toolbox_lid', (0.33, 0.41, 0.018), R.MAT_DARK,
            loc=(-0.24, 1.76, DECK_Z + 0.26), bevel=0.004))
    A(R.box('jerry0', (0.150, 0.30, 0.38), R.MAT_DARK,
            loc=(0.30, 2.02, DECK_Z + 0.21), bevel=0.014))
    A(disc('spare_tyre', WHEEL_R, WHEEL_W, R.MAT_RUBBER,
           (0.0, CH_Y1 + 0.02, DECK_Z + 0.30), 'Y', sides=16))
    A(disc('spare_rim', WHEEL_R * 0.56, WHEEL_W + 0.012, R.MAT_PAINT,
           (0.0, CH_Y1 + 0.02, DECK_Z + 0.30), 'Y', sides=12))

    # CASING ON THE CHASSIS, in the 1.5 m lengths [CON] call "most useful" -
    # the family-A length.  Bare steel, rusting, with the bright ring where the
    # drive clamp grips and a battered top where the drive head has been hit
    # (reference section 6).  The sourced telescoping run is 300 -> 250 -> 200
    # -> 150 mm, so the stack is deliberately not all one size.
    # It rides on cradles OUTBOARD of the rails, because the deck itself is
    # engine.  R.tube() extends along its local +Z, and a rot of (-pi/2, 0, 0)
    # sends that to world +Y - so a length laid at y=1.90 reaches y=3.40, which
    # is out past the hitch.  The base has to be the FORWARD end.
    CAS_Y = 0.620
    for k, (cx, cz, od) in enumerate((
            (-0.600, DECK_Z + 0.160, CASING_OD),
            (-0.600, DECK_Z + 0.160 + CASING_OD * 1.02, CASING_OD),
            (0.600, DECK_Z + 0.160, 0.168))):
        A(R.tube('casing%d' % k, od / 2, CASING_LEN, R.MAT_WORN,
                 loc=(cx, CAS_Y, cz), rot=(-math.pi / 2, 0, 0), sides=12))
        # the bright ring where the drive clamp grips, and the battered top
        A(disc('casing%d_collar' % k, od / 2 + 0.007, 0.048, R.MAT_STEEL,
               (cx, CAS_Y + CASING_LEN - 0.10, cz), 'Y', sides=12))
    for s in (-1, 1):
        for cy in (CAS_Y + 0.10, CAS_Y + CASING_LEN - 0.14):
            A(R.box('cradle%d_%d' % (s, int(cy * 100)), (0.055, 0.055, 0.30),
                    R.MAT_DARK, loc=(s * 0.600, cy, DECK_Z - 0.010),
                    bevel=0.005))
            A(R.box('cradarm%d_%d' % (s, int(cy * 100)), (0.14, 0.050, 0.045),
                    R.MAT_DARK, loc=(s * 0.535, cy, DECK_Z - 0.100),
                    bevel=0.005))

    # THE SWAN-NECK EXPRESSING TOOL.  [CON]: the clay plug is shoved out of the
    # cutter with "a swan-neck expressing tool" levered through the windows,
    # usually after every fall - so it never leaves the machine's side.  [TOM]
    # p.119 describe the same operation as the plug being "prised out by spade".
    A(R.tube('swan_bar', 0.015, 1.30, R.MAT_STEEL,
             loc=(0.600, CAS_Y + 0.06, DECK_Z + 0.325), rot=(-math.pi / 2, 0, 0),
             sides=6))
    A(R.tube('swan_hook', 0.015, 0.16, R.MAT_STEEL,
             loc=(0.600, CAS_Y + 1.36, DECK_Z + 0.325), rot=(-2.10, 0, 0),
             sides=6))

    # ── 7. THE WIRE ROPE ────────────────────────────────────────────────────
    # hose() and not a cylinder, deliberately.  `rig.py`'s own docstring says a
    # straight cylinder never gives the sag, and that rope routing "is one of the
    # clearest tells that a machine was modelled from a photograph rather than
    # from memory".  Here it is more than a tell - the rope IS the machine, and
    # reference section 5.1 item 2 makes it the second of the four things that
    # identify this rig at thumbnail size: "A single line falling down the middle
    # of the triangle, into the ground."
    #
    # The hoist run from the drum up to the crown carries nothing but its own
    # weight, is oily and soft, and drapes.  The fall below the sheave carries
    # the tool string and is nearly straight - but only nearly: 16 mm of rope
    # under a couple of hundred kilos still bows.
    #
    # Both lines leave their drums on the FRONT tangent, which is what makes
    # [GA]'s description geometrically true - "the rope leaves the drum, rises
    # up the front face of the derrick, over the head sheave, and drops
    # vertically to the borehole" - and is also what keeps them clear of the
    # winch guard and of the centre leg behind them.
    DRUM_Z = DECK_Z + 0.225
    A(R.hose('rope_hoist',
             [(-0.185, WY - DRUM_R - 0.010, DRUM_Z),
              (-0.150, 0.292, 1.60),
              (-0.075, 0.258, 3.20),
              (-0.020, 0.232, 4.60),
              (0.0, SHEAVE_R + 0.045, SHEAVE_Z + SHEAVE_R * 0.80),
              (0.0, SHEAVE_R - 0.006, SHEAVE_Z + SHEAVE_R - 0.004)],
             radius=ROPE_R, mat=R.MAT_WORN, sides=6))
    # The fall runs down to the swivel eye on the string.  It has to END at the
    # eye, not somewhere above it: a rope stopping in mid-air over its own tool
    # is the first thing anybody looks at on this machine.
    A(R.hose('rope_fall',
             [(0.0, 0.004, SHEAVE_Z + SHEAVE_R - 0.006),
              (0.0, -0.004, SHEAVE_Z - 0.32),
              (0.005, -0.010, 4.30),
              (0.002, -0.002, 3.05)],
             radius=ROPE_R, mat=R.MAT_WORN, sides=6))
    # The tooling line, slack and parked: up the front, over its own sheave, and
    # hanging down the back of it with the hook swinging free above the guard.
    A(R.hose('rope_tooling',
             [(0.215, WY - DRUM_R * 0.72 - 0.008, DRUM_Z),
              (0.200, 0.360, 1.60),
              (0.110, 0.378, 3.20),
              (0.022, SHEAVE2_Y - SHEAVE2_R + 0.014, SHEAVE2_Z + 0.055),
              (0.004, SHEAVE2_Y, SHEAVE2_Z + SHEAVE2_R - 0.003),
              (0.0, SHEAVE2_Y + SHEAVE2_R + 0.002, SHEAVE2_Z - 0.030),
              (0.006, SHEAVE2_Y + SHEAVE2_R - 0.004, 2.60),
              (0.030, SHEAVE2_Y + 0.090, 1.40)],
             radius=ROPE2_R, mat=R.MAT_WORN, sides=5))
    A(disc('hook_eye', 0.030, 0.024, R.MAT_STEEL,
           (0.030, SHEAVE2_Y + 0.090, 1.34), 'X', sides=8))
    A(R.box('hook', (0.018, 0.065, 0.12), R.MAT_STEEL,
            loc=(0.030, SHEAVE2_Y + 0.090, 1.26), bevel=0.005))

    # ── 8. THE TOOL ON THE ROPE ─────────────────────────────────────────────
    # THE WHOLE POINT OF THE MACHINE, AND THE REASON IT NEEDS A slide: NODE.
    # The game raises this and drops it, and that motion is the machine's entire
    # visual identity.  It is named `carriage` because `src/core/gltfRig.js`
    # already drives `slide:carriage` and resolves the tool anchor through it -
    # a new name would need new runtime code for no gain.  `travel_m` is
    # declared because gltfRig's carriage invariant reads `carriageRange`
    # straight after the `dyn.carriage` guard and writes NaN into a world matrix
    # without it, which makes the machine silently disappear.
    #
    # `mount:tool` hangs under it as the SWAP POINT, so the claycutter modelled
    # here can be exchanged for a shell, a chisel, a stubber or an SPT assembly
    # without touching the rope, the sheave or the winch.  gltfRig prefers
    # `mounts.get('tool')` over the carriage for exactly this.  The game drills
    # `cable-tool` and `site-investigation` with this rig and they want different
    # tools on the same rope.
    #
    # THE STRING IS BRITISH, so top-down it is SWIVEL -> SINKER BAR -> TOOL.
    # There is no rope socket and no jars: those are American parts, and a
    # zinc-poured rope socket here would be the tool-string equivalent of giving
    # this machine a walking beam (reference section 4.4).
    STRING_LEN = SWIVEL_LEN + SINKER_LEN + TOOL_LEN
    carriage = R.empty(R.NODE_SLIDE, 'carriage', loc=(0, 0, STRING_LEN))
    carriage['travel_m'] = STROKE_M
    R.empty(R.NODE_MOUNT, 'tool', carriage,
            loc=(0, 0, -(SWIVEL_LEN + SINKER_LEN)))

    T = []
    # BULLDOG GRIPS.  [BDA], verbatim: "Rope end connections using wire rope
    # clamps (Bulldog grips) are only permitted for free fall applications."
    # This machine IS the free-fall application, so the grips are not a bodge -
    # they are the correct fitting here and on almost nothing else in the fleet.
    # Three of them, on the eye above the swivel.
    gr = R.box('bulldog', (0.052, 0.030, 0.030), R.MAT_STEEL, loc=(0, 0, 0.075))
    arr(gr, (0, 0, 0.075), 3)
    T.append(gr)
    T.append(disc('swivel_eye', 0.052, 0.028, R.MAT_STEEL, (0, 0, -0.028), 'X',
                  sides=10))
    T.append(R.tube('swivel_body', 0.038, SWIVEL_LEN - 0.055, R.MAT_STEEL,
                    loc=(0, 0, -(SWIVEL_LEN - 0.055)), sides=10))
    # [ARC] "secured by a tapered nut and pin"
    T.append(disc('swivel_nut', 0.050, 0.042, R.MAT_WORN,
                  (0, 0, -(SWIVEL_LEN - 0.032)), 'Z', sides=6))

    # THE SINKER BAR - 4.5 in x 40 in x 80 kg [ARC].  [TOM] call it "a heavy
    # drill stem" and describe the cutter being "driven down under the impact"
    # of it: the bar is the mass that does the work.  Every bar carries two
    # cross holes for the bail pin, and an optional surging slot used when
    # driving casing; both are published features and both cost one box.
    z0 = -SWIVEL_LEN
    T.append(R.tube('sinker', SINKER_OD / 2, SINKER_LEN, R.MAT_STEEL,
                    loc=(0, 0, z0 - SINKER_LEN), sides=12))
    for k, hz in enumerate((z0 - 0.13, z0 - SINKER_LEN + 0.13)):
        T.append(disc('sinker_hole%d' % k, 0.016, SINKER_OD + 0.010, R.MAT_DARK,
                      (0, 0, hz), 'X', sides=6))
    T.append(R.box('sinker_slot', (SINKER_OD + 0.008, 0.028, 0.19), R.MAT_DARK,
                   loc=(0, 0, z0 - SINKER_LEN * 0.52)))
    # THE UPSET BAND AT EVERY JOINT.  Reference warning 9.T: the API pin-and-box
    # joint leaves a collar visibly larger than the bar, and that is "visible and
    # certain" where the exact thread form is not.  The thread FORM is left
    # unasserted here - only the upset is modelled.
    for k, jz in enumerate((z0 - 0.018, z0 - SINKER_LEN + 0.018)):
        T.append(disc('joint_upset%d' % k, SINKER_OD / 2 + 0.010, 0.070,
                      R.MAT_WORN, (0, 0, jz), 'Z', sides=12))

    # THE CLAYCUTTER - "rather like an apple corer" [CON]; "a simple tube with a
    # sharpened cutting edge" [TOM] p.119.  Open at BOTH ends: the clay is
    # extruded up into the body on impact and levered out through the side
    # windows after every fall.  [CON] distinguish "high window" and "low
    # window" cutters, and this is a low-window one.  The shell shares this exact
    # body [ARC], so swapping cutter for shell is a shoe-and-valve change - which
    # is precisely why `mount:tool` exists.
    z1 = z0 - SINKER_LEN
    body = R.tube('cutter_body', TOOL_OD / 2, TOOL_LEN - SHOE_LEN, R.MAT_WORN,
                  loc=(0, 0, z1 - (TOOL_LEN - SHOE_LEN)), sides=16)
    bore = R.tube('cutter_bore', TOOL_OD / 2 - 0.010, TOOL_LEN + 0.20,
                  R.MAT_WORN, loc=(0, 0, z1 - TOOL_LEN - 0.10), sides=16)
    win = R.box('cutter_win', (TOOL_OD + 0.06, 0.082, 0.60), R.MAT_WORN,
                loc=(0, 0, z1 - TOOL_LEN + 0.70))
    win2 = R.box('cutter_win2', (0.082, TOOL_OD + 0.06, 0.42), R.MAT_WORN,
                 loc=(0, 0, z1 - TOOL_LEN + 1.26))
    cut(body, bore)
    cut(body, win)
    cut(body, win2)
    T.append(body)
    # the screw-on shoe on its deliberately coarse thread [ARC], and the
    # claycutter retaining ring just above it that holds the plug in [CON]
    T.append(R.tube('cutter_shoe', TOOL_OD / 2 + 0.004, SHOE_LEN, R.MAT_STEEL,
                    loc=(0, 0, z1 - TOOL_LEN), sides=16))
    thr = disc('cutter_thread', TOOL_OD / 2 + 0.007, 0.011, R.MAT_STEEL,
               (0, 0, z1 - TOOL_LEN + SHOE_LEN + 0.011), 'Z', sides=16)
    arr(thr, (0, 0, 0.019), 3)
    T.append(thr)
    T.append(disc('cutter_ring', TOOL_OD / 2 - 0.004, 0.028, R.MAT_STEEL,
                  (0, 0, z1 - TOOL_LEN + SHOE_LEN + 0.072), 'Z', sides=16))
    # THE CUTTING EDGE, and it is the one place bright steel belongs on this
    # machine.  Reference section 6: the working face is bright, peened and
    # narrower than it started; the shank is dark, scaled and oily.  [MAN] give
    # the hard rule behind it - "do not allow the bit to get more than 1/4"
    # below gauge" - and `tools.js` already models exactly that wear on the
    # chisel, which the reference calls the best domain truth in the build.
    T.append(disc('cutter_edge', TOOL_OD / 2 + 0.004, 0.020, R.MAT_STEEL,
                  (0, 0, z1 - TOOL_LEN + 0.010), 'Z', sides=16))
    for o in T:
        o.parent = carriage
    weld(T, carriage, 'tool')

    # ── 9. LAMPS AND ATTACHMENT POINTS ──────────────────────────────────────
    # A UK ground-investigation crew works winter short days, and the one place
    # a light has to reach is the collar: the driller reads the rope and the
    # hole, not a gauge.  Both housings sit on statics, so `moves: false` - which
    # is correct, because nothing on this machine slews.
    # IT HANGS ON THE LEFT FRONT LEG, not in clear air.  The first version put
    # the housing at (0.30, -0.52, 2.40), which is 2.4 m up in the open space
    # between the front legs with nothing whatever holding it - the kind of
    # thing that is invisible in a node dump and obvious the moment the model is
    # rendered.  leg_point() puts it on the steel it is bolted to.
    lc = leg_point(1, 2.40 / OP_HEIGHT)
    lc = (lc[0] + 0.075, lc[1] + 0.070, lc[2])
    R.worklight('lamp-collar', None, lc,
                aim_dir=(0.24, 0.48, -1.00), cone_deg=64, range_m=14)
    A(R.box('lamp_body_c', (0.110, 0.090, 0.100), R.MAT_DARK, loc=lc,
            bevel=0.010))
    A(disc('lamp_lens_c', 0.043, 0.015, R.MAT_WORN,
           (lc[0] + 0.020, lc[1] + 0.048, lc[2] - 0.020), 'Y', sides=10))
    A(R.box('lamp_bkt_c', (0.075, 0.070, 0.016), R.MAT_DARK,
            loc=(lc[0] - 0.055, lc[1] - 0.040, lc[2] + 0.048), bevel=0.004))
    R.worklight('lamp-winch', None, (-0.40, WY + 0.44, DECK_Z + 0.62),
                aim_dir=(0.30, -0.40, -0.60), cone_deg=76, range_m=9)
    A(R.box('lamp_body_w', (0.096, 0.082, 0.092), R.MAT_DARK,
            loc=(-0.40, WY + 0.44, DECK_Z + 0.62), bevel=0.008))
    A(R.tube('lamp_post_w', 0.020, 0.56, R.MAT_PAINT,
             loc=(-0.40, WY + 0.44, DECK_Z + 0.02), sides=6))

    # The data plate takes the rig's own invented marque at runtime (`assets.js`
    # decal 'plate', DOMAIN.md section 10) - a data plate names the
    # MANUFACTURER, and Drillity is the marketplace, not an OEM.  Nothing is
    # lettered here, and no real marque from the sources above may ever be.
    R.empty(R.NODE_MOUNT, 'marque', None, (-0.362, ENG_Y - 0.12, ENG_Z + 0.09))
    A(R.box('plate', (0.010, 0.19, 0.105), R.MAT_STEEL,
            loc=(-0.362, ENG_Y - 0.12, ENG_Z + 0.09), bevel=0.003))
    # the safety decal cluster on the guard, seen on every machine photographed
    A(R.box('decals', (0.26, 0.012, 0.13), R.MAT_HAZARD,
            loc=(0.18, WY + 0.245, DECK_Z + 0.36)))
    # Where the driller stands: on the ground beside the chassis nose, hand on
    # the clutch, looking forward down the rope into the hole.  Crew of two
    # [R06], [GA].  Clear of the wheel, which is at x -0.905 and y 0.825 - the
    # first position put him standing on his own tyre.
    R.empty(R.NODE_MOUNT, 'operator', None, (-1.02, WY - 0.12, 0.0))

    # ── 10. CHECK, BAKE AND EXPORT ──────────────────────────────────────────
    # Read the folded profile off the mesh before anything is joined, while the
    # parts still have their own names to fail with.
    _check_stow_profile()

    # The boolean cutters go FIRST.  They are parentless meshes, so if they are
    # still in the scene when finish() runs they get joined into the statics and
    # ship as three solid blocks floating where the claycutter's windows should
    # be.  weld() has already baked the booleans into the body, so they have
    # done their work and nothing references them.
    for o in (bore, win, win2):
        if o.name in bpy.data.objects:
            bpy.data.objects.remove(o, do_unlink=True)
    # Then bake every remaining static: a CURVE is not a MESH so finish() skips
    # it and each rope lands as its own draw call, and join() keeps only the
    # ACTIVE object's modifier stack, so an unbaked ARRAY gets applied to the
    # whole joined mesh.
    for o in list(bpy.context.scene.objects):
        if o.type in ('MESH', 'CURVE') and o.parent is None:
            bake(o)
    return R.finish(out_path)


if __name__ == '__main__':
    out_dir = os.path.abspath(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'models'))
    os.makedirs(out_dir, exist_ok=True)
    build(os.path.join(out_dir, 'cable-percussion.glb'))
