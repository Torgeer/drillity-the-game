"""A FIXED offshore production/drilling platform deck.

Exports `public/models/sites/platform-deck.glb`.
Read `research/sites/platform-deck.md` for the source scope and the open gaps.

WHAT THIS SITE IS, AND WHAT IT MUST NOT BE MISTAKEN FOR
-------------------------------------------------------
It is a steel jacket platform: **founded on the seabed and incapable of moving**.
Another archetype in this game, `marine-spread`, is a MOBILE marine unit, and
`research/16-site-archetypes.md` §A.11 says flatly that drawing one and calling
it the other is the error the class exists to prevent. So this module spends its
budget on the five things that can only be true of a fixed structure:

  1. THE JACKET CONTINUES DOWN THROUGH THE WATER AND STAYS THERE.
     research/rigs/oil-derrick.md §5.1 is the whole test, in one table row:
     a jack-up has "daylight - a 10.7 m air gap, then three or four bare legs";
     a fixed platform has "structure all the way down ... bracing battered 1:8
     in 12-15 m bays, boat landings, barge bumpers with truck tyres, anodes in
     rows, a splash-zone band and a marine-growth line. No air gap."
     (On the two senses of "air gap" - the silhouette one and the engineering
     one, which are NOT the same thing and are both real - see AIR GAP below.)

  2. THERE IS NOTHING KEEPING STATION. No mooring chain, no fairlead, no
     windlass, no thruster, no DP, no spudcan, no jacking house, no leg standing
     above the deck, no cantilever, no moonpool, no riser and no heave
     compensator. `oil-derrick.md` §5.1: "any one of them on a platform or
     jack-up is an error a driller spots instantly." Every one of those is
     absent here BY CONSTRUCTION, not by omission.

  3. THE MARINE GROWTH LINE IS AT A FIXED ELEVATION.  A structure that moves
     cannot have one. [S5 p.138] gives it as a specified thickness, not a
     decoration: "The API guideline recommends a 1.5 in. growth on members for
     depths from 0 to 150 ft below the surface."  Above it, painted steel;
     below it, furred bare brown steel with anodes ([S5] p.342).

  4. THE WELLS ARE CONDUCTORS ON A SLOT GRID, NOT A RISER.  A conductor is
     "driven to ground" like a pile [S5 p.341] and is restrained by guide frames
     built into the jacket. It is a permanent part of the structure. A mobile
     unit's well leaves through a riser it can disconnect from.

  5. THE TOPSIDES ARE PERMANENT AND THE DRILLING PACKAGE IS A TENANT.
     research/16 §A.10: "flare boom, cranes, lifeboats, helideck, and production
     plant that has nothing to do with drilling. This is the only rig type where
     the drilling package is a tenant."

THE DATUM, AND THE HISTORY THAT MAKES IT THE RISKIEST LINE IN THIS FILE
-----------------------------------------------------------------------
    z = 0 IS THE TOP OF THE MAIN DECK PLATING.

That is the same datum `blender/oil_derrick.py` uses, and it is not a free
choice. ASTRA.md §7.5 records what happened when it was ambiguous: oil-derrick
took `FLOOR_Z` from a source that reads "drill floor height above MAIN DECK" and
measured it from z = 0 (so z = 0 is the main deck), and in the same file put the
substructure base pad - "base pad on the skid beam" - also at z = 0 (so z = 0 is
the top of the skid beams). Both cannot be true. The game drops the rig on
terrain at y = 0, so the beams were buried and the machine stood 1.090 m into
the deck. It was resolved in favour of the sourced number: z = 0 is the MAIN
DECK, the skid beams stand ON it, and the substructure starts on top of them.

This file is the surface that machine stands on, so this file must not
re-open the question. Everything structural here is at z <= 0. Everything the
crew walks on or works around is at z >= 0. `oil_derrick.py`'s only remaining
sub-datum geometry is 300 mm of well conductor, and THIS module's live
conductor picks it up at z = -0.60 and carries it down through the guide frames
into the sea, which is exactly what the two files each say they are drawing.

THE DECK PLATE IS NOT IN THIS FILE, AND THAT IS THE POINT
----------------------------------------------------------
`blender/lib/site.py` forbids an opaque decorative floor over the live terrain,
and offshore that rule is subtle because the deck IS a floor. It is resolved by
ownership rather than by omission:

  * `src/world/terrain.js` `buildSpecials()` owns the deck PLATE. It is a
    `ShapeGeometry` with a rectangular hole cut over the collar, so the collar,
    the borehole and the surface/section seam all stay live through it.
  * this module owns everything the plate RESTS ON (girders, deck beams, deck
    legs, the jacket) and everything that STANDS ON it (plant, quarters,
    helideck, crane, flare, lifeboats, handrails).
  * nothing in this file has a vertex at or above z = -0.02 inside the plate's
    own opening. That is asserted over real world-space vertices in `build()`
    before export, so it cannot rot.

The well-slot coaming here frames the plate's opening from OUTSIDE it; it does
not cover it.

AIR GAP - TWO DIFFERENT THINGS WITH ONE NAME, AND THE SOURCES USE BOTH
-----------------------------------------------------------------------
This matters because the brief for this site asks for "deck elevation above mean
sea level and why (air gap over design wave)" while research/16 §A.10's own
photograph test says a fixed platform has "no air gap under the deck". Those are
not in conflict; they are two different words:

  ENGINEERING AIR GAP - the clearance between the design wave crest and the
  underside of the lowest deck steel, and the API definition names that datum
  explicitly. [AIRGAP], quoting API RP 2SIM 1st ed. (2014): "The clearance
  between the highest water surface that occurs during the extreme metocean
  conditions and THE UNDERSIDE OF THE CELLAR DECK."  ISO 19900:2013, same page:
  "...and the lowest exposed part not designed to withstand wave or ice
  impingement."  EVERY fixed platform has one and it is why the deck is where it
  is. [S5 p.311]: API RP2A GoM minimum air gap 5 ft. [S5 pp.313-314]: a worked
  case in 160 ft of water with a 62.5 ft design wave puts the deck
  bottom-of-steel at 50.2 ft calculated / 51 ft per API RP2A above MLLW.
  [ABS] §1: "A commonly referenced minimum deck clearance is 1.5 m (5 ft), see
  API RP 2FPS, in the case where the semi-submersible is subject to the 100-year
  return period environmental conditions."  [S5 p.405], written about a jack-up
  but stating the physics for both: "It is most important that the wave NEVER be
  allowed to impact on the hull ... If the wave were to hit the hull, the design
  loads could increase by more than 500 %."

  SILHOUETTE AIR GAP - daylight under the thing. A jack-up has it: the hull is
  jacked clear and you see straight under it. A fixed platform does NOT, because
  the jacket lattice, the conductors, the boat landing, the risers and the
  caissons fill that same vertical band. That is §A.10's test and §5.1's table,
  and it is a statement about what you SEE, not about wave clearance.

  This model has the engineering air gap (the lowest steel is well clear of the
  water) and deliberately has no silhouette air gap (the band between the deck
  and the sea is full of structure). Getting that pair right is most of what
  makes this read fixed rather than mobile.

  WHAT THIS MODEL'S AIR GAP MEASURES, AND AGAINST WHAT. The lowest deck steel
  here is the cellar-deck framing soffit at z = CELLAR_Z - CELLAR_D = -6.846.
  `terrain.js` `buildSpecials()` puts the sea plane at three.js y = -14 with no
  citation, so the model's air gap is 7.15 m. [AZMAN] Table 1 gives water depth
  and bottom-of-steel-above-mudline for five real jacket platforms, and the
  subtraction puts their cellar-deck soffits at +7.9, +11.2, +12.5, +14.1 and
  +16.1 m above mean sea level. 7.15 m is 0.75 m under the shallowest of them.
  THAT DEFICIT IS terrain.js's SEA ELEVATION, NOT THIS MODEL'S DECK ARRANGEMENT:
  every level here is at a sourced or source-deduced spacing, and moving the sea
  plane to y = -14.75 would put the soffit exactly on the sourced +7.9 m floor.
  `research/sites/platform-deck.md` states that as a one-line handover, because
  terrain.js is not this module's file. Do not read -14 as a sourced air gap.

MATERIALS - FOUR, AGAINST A BUDGET OF SIX
------------------------------------------
`site.finish()` costs one draw call per distinct material name once the statics
are joined, and `blender/lib/site.py` sets the ceiling at 6. This site uses
FOUR: `wornSteel`, `paintedSteel`, `galvanised`, `rubber`. Every colour
difference - the orange lifeboats, the bare brown submerged steel, the furred
growth line, the amber toe boards, the pale anodes - is a VERTEX COLOUR inside
one of those four, which costs triangles and no draw calls at all. There is no
`transmission` anywhere and no glazing material: the quarters' windows are
opaque dark `rubber`, the same trick `urban_plot.py` uses, because transmission
above zero is +65 to +81 draw calls regardless of object size and offshore
glazing is exactly where somebody reaches for it.

SOURCE KEYS used in the citations below
----------------------------------------
  [S5]         Chakrabarti (2005), *Handbook of Offshore Engineering* Vol. I,
               Ch. 6, printed page numbers, as transcribed and page-cited in
               `research/rigs/oil-derrick.md` §3.8, §4.12 and §6.
  [IADC]       the filled-in IADC Standard Format Equipment List transcribed in
               `research/rigs/oil-derrick.md` §3.10 (a jack-up's list; used here
               only for items common to both classes, and said so at each use).
  [OGP-OFFS]   drillingmanual.com offshore platform article, verified verbatim
               in `research/rigs/oil-derrick.md` §3.9 and `research/16` §A.10.
  [EP0147144]  the conductor / jacket patent cited by `research/16` §A.10.
  [A10]        `research/16-site-archetypes.md` §A.10.
  [OD5.1]      `research/rigs/oil-derrick.md` §5.1 (jack-up vs platform).
  [OD6]        `research/rigs/oil-derrick.md` §6 (coatings, anodes, growth).
  [AIRGAP]     IADC Lexicon, "Air gap", quoting API RP 2SIM 1st ed. (2014) and
               ISO 19900:2013 — <https://iadclexicon.org/air-gap/>. Fetched
               2026-09-06.
  [SPLASH]     IADC Lexicon, "Splash zone", quoting API RP 2SIM, ISO 19900 and
               DNV-OS-C101 — <https://iadclexicon.org/splash-zone/>. 2026-09-06.
  [SWING]      IADC Lexicon, "Swingrope", from API RP 54 —
               <https://iadclexicon.org/swingrope/>. Fetched 2026-09-06.
  [ABS]        ABS, *Guidance Notes on Air Gap and Wave Impact Analysis for
               Semi-Submersibles*, May 2020, §1 — <https://ww2.eagle.org/content/
               dam/eagle/rules-and-guides/current/offshore/249-gn-airgapanalysis-
               semisubmersibles-2018/air-gap-analysis-gn-may20.pdf>. 2026-09-06.
  [AZMAN]      Azman, Bhattacharya et al., "…Fixed Offshore Platform…",
               *J. Mar. Sci. Eng.* 2021, 9, 1027, Tables 1-2 and Fig. 6-7 —
               <https://www.mdpi.com/2077-1312/9/9/1027>. Five real Shell-
               operated jacket platforms offshore Sarawak/Sabah, with legs,
               piles, brace type, deck configuration and bottom-of-steel
               elevations as printed numbers. Fetched 2026-09-06. NOTE: tropical
               South-East Asia, a benign metocean climate. Its ELEVATIONS must
               not be transferred to a North Sea design; its MEMBER SIZES and
               ARRANGEMENTS are used here and are climate-independent.

NO GUESSING
-----------
ASTRA.md §1.1. Every dimension below either cites a source or is marked
`NOT SOURCED` at the point of use. Nothing here carries a structure rating, a
load capacity or an engineered clearance - those are design outputs, this is a
model, and inventing one would be the exact offence the rule exists to stop.

Build:   blender --background --python blender/sites/platform_deck.py
Inspect: append `-- --preview` to re-import the REAL export and render it.
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
    'drillity_platform_site', os.path.join(HERE, '..', 'lib', 'site.py'))
S = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = S
spec.loader.exec_module(S)

FT = 0.3048
IN = 0.0254

# ═════════════════════════════════════════════════════════════════════════════
#  THE STRUCTURAL MODULE — every number here traces to [S5] p.312 or is derived
#  from it, and the whole platform is set out on it.
# ═════════════════════════════════════════════════════════════════════════════
# [S5 p.312], verbatim: "the skid beam spacing of a standard GoM platform
# drilling rig DICTATES THE DECK LEG SPACING for a drilling platform or module
# ... Most GoM platform rigs supplied by drilling contractors would have 40 ft
# skid beam spacing. ... Therefore, 80 ft by 80 ft four legged and 120 ft by
# 80 ft eight-legged GoM deck footprints are commonly encountered."
#
# THIS IS WHY THE LEGS ARE WHERE THEY ARE, AND IT IS LOAD-PATH CORRECT.
# `blender/oil_derrick.py` puts its skid beams at SKID_SPAN = 40 ft centres
# because of the same sentence. So the derrick's skid rails land directly over
# this platform's inner deck legs, with no coordination between the two files -
# derrick -> skid beam -> deck leg -> jacket leg -> pile -> seabed, and every
# joint in that chain is at a sourced spacing.
BAY = 40 * FT                       # 12.192  [S5 p.312] the 40 ft module
CANTI = BAY / 2                     # 6.096   [S5 p.312] deck cantilevers are
                                    # "most efficient ... about one half the
                                    # lengths of the deck spans"
LEG_XS = (-1.5 * BAY, -0.5 * BAY, 0.5 * BAY, 1.5 * BAY)   # 4 legs along X
LEG_YS = (-0.5 * BAY, 0.5 * BAY)                          # 2 legs along Y
# Eight legs: [S5 p.20] "usually four to eight legs battered". Three 40 ft bays
# plus two half-span cantilevers each way gives the deck:
DECK_X = 3 * BAY + 2 * CANTI        # 48.768 m
DECK_Y = 1 * BAY + 2 * CANTI        # 24.384 m
# [S5 p.312] the eight-legged GoM footprint is printed as 120 x 80 ft
# (36.58 x 24.38 m), i.e. leg-to-leg in the long direction with no cantilever
# there. This module cantilevers BOTH ways at the sourced half-span, giving
# 160 x 80 ft. The difference is one design choice inside a sourced rule, and
# it is recorded in research/sites/platform-deck.md rather than hidden.

DECK_BEAM_PITCH = 5 * FT            # 1.524   [S5 pp.317-318] "deck beam spacing
                                    # is generally dictated by the wellhead
                                    # spacing" - 5 ft
GIRDER_D = 0.95                     # NOT SOURCED. [S5] gives deck beam SPACING
BEAM_D = 0.45                       # and deck LOADS but no member depths for
GIRDER_W = 0.42                     # the deck framing. Sized to look like a
BEAM_W = 0.20                       # plate girder over a 12.192 m span; do not
                                    # read a capacity into it.

# ── deck levels ──────────────────────────────────────────────────────────────
# [S5 p.295]: "main (upper) deck - drilling/production modules; cellar deck -
# pumps, utilities, pig traps, CHRISTMAS TREES, WELLHEAD MANIFOLDS; mezzanine if
# drilling and production run simultaneously."  So the trees belong on the
# CELLAR deck, one level down, not on the drill floor - which is also §A10's
# two-level well bay (wellheads lower, trees upper).
CELLAR_Z = -20 * FT                 # -6.096.  DEDUCED, and the source says so:
                                    # research/rigs/oil-derrick.md §3.8 records
                                    # "~20 ft = 6.1 m between cellar and main
                                    # deck framing - DEDUCED from the worked 45
                                    # degree truss diagonal (L' = L/cos45 = 340
                                    # in over L = 240 in), NOT STATED." Carried
                                    # through as a deduction, not as a fact.
CELLAR_D = 0.75                     # NOT SOURCED, as GIRDER_D.
# THE LEVELS THIS MODEL HAS ARE A REAL, PUBLISHED CONFIGURATION. [AZMAN] Table 2
# lists the deck configuration of five in-service jacket platforms: one is
# cellar deck only; three are two-level; and one is "Helideck, Main Deck, Cellar
# Deck" - which is exactly this model. In all five the CELLAR DECK IS THE
# LOWEST, which is why the air gap is measured to its soffit ([AIRGAP]).

# ── the sea, and the jacket that goes into it ────────────────────────────────
SEA_Z = -14.0                       # THE GAME'S WATERLINE, not a sourced
                                    # elevation. src/world/terrain.js
                                    # buildSpecials(): `sea.position.y = -14`,
                                    # uncited. This module cannot move it and
                                    # does not own it. See platform-deck.md for
                                    # what the sourced elevations ask for.
JACKET_TOP_Z = -8.0                 # top jacket horizontal framing level.
                                    # [S5 p.314]: top jacket horizontal bracing
                                    # sits "15-20 ft = 4.6-6.1 m" above MLLW,
                                    # "in common use in offshore practice".
                                    # Against the game's water at -14 that band
                                    # is z = -9.4 .. -7.9; -8.0 is inside it.
BAY_H = BAY                         # 12.192.  [S5 pp.45, 332] jacket bay height
                                    # 40-50 ft AND "bay height ~= bay width"
                                    # (worked example a = h = 45 ft). Bay width
                                    # here is the 40 ft module, so bay height is
                                    # too, which also lands the diagonals at
                                    # ~42 deg - inside [S5 p.331]'s usable
                                    # 27-45 deg band, optimum ~36 deg.
JACKET_BOT_Z = JACKET_TOP_Z - BAY_H  # -20.192, the next horizontal framing
                                    # level. Below the game's sea plane and so
                                    # normally hidden; modelled anyway because a
                                    # jacket that stops at the water is a lie
                                    # and because the sea elevation is not ours.
BATTER = 1.0 / 8.0                  # [S5 pp.307-308] apparent batter 1:8 in the
                                    # worked GoM example; the range used across
                                    # the book's examples is 1:8 to 1:15, with
                                    # 1:12 in the bay-geometry work. A dedicated
                                    # web search for a second source on jacket
                                    # batter on 2026-09-06 found NONE - it is a
                                    # number that lives inside paywalled
                                    # standards - so [S5] is the only source and
                                    # this constant rests entirely on it.
                                    # INFERRED detail: the two END frames batter
                                    # in X and every leg batters in Y. [S5 p.20]
                                    # says only that the legs are "battered"; it
                                    # does not say which planes on an 8-leg
                                    # jacket.

LEG_OD = 48 * IN                    # 1.2192  [S5 pp.306-332] "deck leg OD =
                                    # pile OD"; GoM piles 48 in (range 36-72).
JLEG_OD = 54 * IN                   # 1.3716  [S5 pp.306-332] "legs 54 in. OD x
                                    # 1.0 in."  The jacket leg is fatter than
                                    # the deck leg because the pile runs down
                                    # INSIDE it: "jacket leg ID = pile OD + 3-4
                                    # in."  That step at the jacket top is real
                                    # and it is modelled.
                                    # CORROBORATED INDEPENDENTLY. [AZMAN] Table 2
                                    # prints leg and pile sizes for five real
                                    # platforms: 4 x 46.5" legs on 42" through-leg
                                    # piles; 4 x 60" legs on 54" piles; 8 x 60" on
                                    # 54"; 4 x 80" on 84" skirt piles. The through-
                                    # leg pattern is exactly one size step down
                                    # from the leg it passes through, which is
                                    # what 48-in piles in 54-in legs is.
BRACE_OD = 20 * IN                  # 0.508.  DERIVED, not printed: [S5 pp.329-
                                    # 330] gives the sizing RULE - "brace:chord
                                    # OD ratio beta > 0.30" and "D/t between 19
                                    # and 90, prefer under 60". 0.508/1.3716 =
                                    # 0.37, inside the rule. The member schedule
                                    # itself is not in the source.

# ── the splash zone and the growth line: the two bands that say FIXED ────────
GROWTH_T = 1.5 * IN                 # 0.0381  [S5 p.138] "The API guideline
                                    # recommends a 1.5 in. growth on members for
                                    # depths from 0 to 150 ft below the surface."
                                    # A structural input, not a decoration - it
                                    # fattens every member below the tide line.
SPLASH_T = 0.25 * IN                # 0.00635 [S5 pp.315, 329, 330] "Increasing
                                    # leg and brace thickness at the wave splash
                                    # zone by about 1/8 to 1/4 inch ... is
                                    # commonly used as additional corrosion
                                    # allowance."  There is a visible STEP in
                                    # the steel at each end of that band.
SPLASH_HI = SEA_Z + 2.60            # NOT SOURCED, and confirmed unsourceable on
SPLASH_LO = SEA_Z - 1.40            # 2026-09-06. What a splash zone IS is well
                                    # defined - [SPLASH], API RP 2SIM: "The area
                                    # of the structure that is intermittently wet
                                    # and dry due to wave and tidal action";
                                    # DNV-OS-C101 sends you to its own Sec.10
                                    # B200 for the limits. That formula, and any
                                    # numeric North Sea or GoM extent, sits
                                    # behind paywalled standards and could not be
                                    # reached. The THICKENING and the STEP are
                                    # sourced; where the band starts and stops is
                                    # not. Do not cite these two.
ANODE = (4 * IN, 4 * IN, 4 * FT)    # [S5 p.342] sacrificial anodes "cast over
                                    # tubular steel cores, which are welded to
                                    # the structure. The sizes of these anodes
                                    # are substantial (such as 4-in. square,
                                    # 3-6 ft long)". 3 % of jacket steel weight
                                    # [S5 Table 6.2 p.368]. 4 ft is mid-band.

# ── the well bay ─────────────────────────────────────────────────────────────
SLOT = 2.4                          # [OGP-OFFS], verified verbatim: wells at
                                    # "as close as 1.8 to 3.0 metres between
                                    # well centres". 2.4 is mid-band and is the
                                    # figure terrain.js's procedural offshore
                                    # kit already uses, so the two agree.
SLOTS_X, SLOTS_Y = 5, 3             # 15 slots. [OGP-OFFS] "ten to more than
                                    # forty" on a multi-well platform. Odd in
                                    # both directions so that a slot lands
                                    # exactly on the collar - the site origin
                                    # contract in blender/lib/site.py is the
                                    # hole, and on a platform the hole IS a slot.
COND_OD = 26 * IN                   # 0.6604  [S5 p.341] "Conductors are pipes
                                    # (generally 20 in. to 30 in. OD) that are
                                    # driven to ground"; the book's worked
                                    # deepwater case is 26 in. This is the same
                                    # 0.660 m `oil_derrick.py` already draws for
                                    # its own conductor stub, arrived at
                                    # independently - the two meet at z = -0.60.
GUIDE_PITCH = 12.192                # conductor guides are "framed at various
                                    # elevations within the jacket and decks" at
                                    # "12 to 18 m (40 to 60 foot)" intervals
                                    # [EP0147144] via [A10]. The two guide frames
                                    # here are at JACKET_TOP_Z and
                                    # JACKET_BOT_Z, 12.192 m apart.

# ── deck furniture ───────────────────────────────────────────────────────────
RAIL_H = 1.10                       # NOT SOURCED. No handrail height is cited
RAIL_MID = 0.66                     # anywhere in this repo's research library,
TOE_H = 0.22                        # and none was found for this module. These
                                    # three match the values terrain.js's
                                    # procedural offshore kit already draws, so
                                    # the .glb and the fallback cannot disagree
                                    # at the seam. Both are unsourced.
RAIL_R = 0.024                      # NOT SOURCED.
POST_PITCH = 1.90                   # NOT SOURCED.
HELI_FLATS = 19.69                  # [IADC §A.10] "64.61 ft octagon = 19.69 m
                                    # across the flats", with a perimeter safety
                                    # net. That figure is from a JACK-UP's
                                    # equipment list; a helideck is common to
                                    # both classes and is used here on that
                                    # basis. The modern sizing rule quoted in
                                    # research/rigs/oil-derrick.md §3.10 -
                                    # usable diameter >= 1.0 x D, D ~= 22.6-23.7
                                    # m for common offshore types - would ask
                                    # for a LARGER deck than this one. Recorded,
                                    # not silently split.
CRANE_BOOM = 100 * FT               # 30.48  [IADC §A.9.1] the unit's two
                                    # 100 ft-boom revolving pedestal cranes (the
                                    # third is 120 ft). Again a jack-up's list;
                                    # [A10] gives platform cranes as "15-40 ton"
                                    # for smaller modular rigs and 50-100 t for
                                    # larger, but publishes no BOOM LENGTH, so
                                    # the geometry comes from the IADC list and
                                    # NO CAPACITY IS ASSERTED ANYWHERE.
LIFEBOAT_N = 2                      # [IADC §L.8.1] "2 x fully enclosed, 65
                                    # persons each, port and starboard".
LIFEBOAT_L = 8.0                    # NOT SOURCED. No length is published for a
                                    # 65-person TEMPSC in this library.
FLARE_L = 34.0                      # NOT SOURCED, and the repo already knew it:
FLARE_DEG = 30.0                    # research/rigs/oil-derrick.md's source table
                                    # records "Flare-boom length appeared only in
                                    # a patent's general wording - flagged
                                    # low-confidence". [A10] and [OD5.1] both
                                    # name the object ("a flare boom on a long
                                    # outrigger") and neither dimensions it.
                                    # The LENGTH and the ANGLE are inventions
                                    # and are marked as such. Do not cite them.

# ── keep-clear: the contracts this file must not break ───────────────────────
HOLE_X, HOLE_Y = 5.4, 4.2           # terrain.js buildSpecials(): on `deck ===
                                    # 'fixed'` the deck plate's cut opening is
                                    # hx = 5.4, hz = 4.2 about the collar. NOTHING
                                    # in this file may reach z >= -0.02 inside it.
COAMING_X, COAMING_Y = 5.62, 4.42   # the coaming frames that opening from
                                    # OUTSIDE, and clears oil_derrick.py's skid
                                    # beams (at 40 ft centres, 0.90 m wide) in
                                    # both of the two positions the rig can be
                                    # dropped in - on the collar, or on CFG.pad
                                    # 2.4 m behind it.
WELL_HANDOFF_Z = -0.60              # where this module's live conductor stops
                                    # and oil_derrick.py's begins. Its stub,
                                    # tb('conductor', 0.330, 0.55, (0,0,-0.30)),
                                    # spans -0.575 .. -0.025, so -0.60 hands the
                                    # well over with 25 mm to spare and no
                                    # overlap. Asserted, not assumed.
def rig_envelope(z):
    """Half-extents (hx, hy) of oil_derrick.py's occupied volume at height z,
    or None where it occupies nothing.

    A SINGLE PRISM IS THE WRONG SHAPE AND THE BUILD PROVED IT. The first
    version of this took the machine's widest object - its skid beams, 19.19 x
    20.87 m - and extended it to infinite height, which then refused a crane
    boom slung out over the sea 25 m up and 10 m clear of a derrick that is
    9.14 m square at its base. The machine is a wedding cake, not a box, and
    every step below is one of oil_derrick.py's own printed constants:

      z <= 1.15 m   SKID_TOP_Z = 1.10. The two skid-beam layers, `skid-beam-y`
                    at SKID_SPAN + 7.0 = 19.19 m in X and `skid-beam-x` at
                    SUB_Y + 7.0 = 20.87 m in Y.
      z <= 8.65 m   FLOOR_Z = 8.5344. The substructure, SUB_X x SUB_Y =
                    14.02 x 13.87 m, plus its stair tower, which stands off the
                    -X face at x = -8.98 .. -7.74 and runs y = -7.13 .. +6.67.
      above         DER_BASE = 30 x 30 ft = 9.144 m square, standing on the
                    drill floor and battering IN above the racking board. Plus
                    the monkey board, which sticks out one face.

    AND THE MACHINE STANDS ON THE COLLAR, NOT ON CFG.pad. rigFactory.js:9350-52
    sets `group.position` from `terrain.collarPosition` = (0,0,0); `CFG.pad` is
    the terrain's grading centre. `driveOffset` moves the machine transiently
    during the drive-in animation and is not a standing clearance.
    """
    if z <= 0.5:
        return None                  # the machine's feet; the deck is under it
    if z <= 1.15:
        return (9.65, 10.50)         # skid beams
    if z <= 8.65:
        return (9.05, 7.05)          # substructure + its stair tower
    return (5.20, 5.20)              # derrick base + monkey board


# ── colour: vertex attributes, not materials ─────────────────────────────────
# [OD6.3] is the only sourced colour guidance and it is followed: "Structure:
# one dominant colour ... typically an off-white/light grey or a mid grey ... a
# marine palette, not a plant palette: fewer colours than a land site, applied
# over more area. Safety yellow and black at every edge ... Safety equipment is
# red ... Lifeboats are orange, and they are the brightest objects on the whole
# structure."  The exact hex values are NOT SOURCED art choices.
C_TOPSIDE = 0xB9BCB8      # painted structural steel above water
C_PLANT = 0xD6D3CA        # off-white process plant [OD6.3] "one dominant colour"
C_QUARTERS = 0xE0DFD8
C_DECKSTEEL = 0x8D949A    # deck framing under the plate
C_BARE = 0x6E4E35         # [OD6.2] "The submerged portions of the steel jackets
                          # are usually left uncoated" - bare steel going brown,
                          # not painted structure going rusty.
C_GROWTH = 0x39402F       # furred marine growth below the tide line
C_SPLASH = 0x7C7266       # [OD6.1] splash zone: thickest coating, worst staining
C_ANODE = 0xACB1B3        # [S5 p.342] magnesium / aluminium / zinc, pale
C_GALV = 0xB7BEC0
C_AMBER = 0xE0A63C        # [OD6.3] safety yellow at edges and changes of level
C_ORANGE = 0xE2611B       # [OD6.3] lifeboats orange
C_RED = 0xB0271C          # [OD6.3] safety equipment red
C_TREE = 0x2E5F7A         # christmas trees; matches terrain.js's existing choice
C_DARK = 0x2B3136
C_FLARE = 0x3A3F44
C_HELI = 0x5B6A5E         # helideck surface

PAINT = 'paintedSteel'
WORN = 'wornSteel'
GALV = 'galvanised'
RUB = 'rubber'


# ═════════════════════════════════════════════════════════════════════════════
#  PRIMITIVE WRAPPERS — vertex colour on top of the site library's own boxes
# ═════════════════════════════════════════════════════════════════════════════

def colour(o, rgb):
    """Bake one flat sRGB colour into a COLOR_0 attribute and wire it to the
    material's base colour.

    This is how four materials carry a whole platform's palette. `terrain.js`
    `siteMaterial()` re-asks assets.js for the kind with `vertexColors: true`
    and a white base whenever the mesh has a `color` attribute, so the authored
    colour multiplies the procedural wear texture rather than replacing it.

    Blender 5.2 treats `use_nodes` as always-on, so the guard tests for THIS
    module's own node by name - `urban_plot.py` records that testing the legacy
    flag let the first export collapse COLOR_0 to white.
    """
    c = tuple(((rgb >> s) & 255) / 255 for s in (16, 8, 0)) + (1.0,)
    attr = o.data.color_attributes.new(name='Color', type='BYTE_COLOR', domain='CORNER')
    for item in attr.data:
        item.color_srgb = c
    o.data.color_attributes.active_color = attr
    m = o.data.materials[0]
    if not m.node_tree or not m.node_tree.nodes.get('platform-vertex-colour'):
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        vc = m.node_tree.nodes.new('ShaderNodeVertexColor')
        vc.name = 'platform-vertex-colour'
        vc.layer_name = 'Color'
        m.node_tree.links.new(vc.outputs['Color'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.68
        # THE RULE. Never above zero, on any material, at any object size.
        bsdf.inputs['Transmission Weight'].default_value = 0
        if m.name in (WORN, GALV):
            bsdf.inputs['Metallic'].default_value = 0.72
    return o


def bx(name, size, loc, kind, tint, rot=(0, 0, 0), bevel=0.0):
    return colour(S.box(name, size, kind, loc=loc, rot=rot, bevel=bevel), tint)


def tb(name, radius, length, loc, kind, tint, rot=(0, 0, 0), sides=10):
    """A cylinder standing on `loc` and running +Z, as rig.tube() defines it."""
    return colour(S.tube(name, radius, length, kind, loc=loc, rot=rot, sides=sides), tint)


def bar(name, p0, p1, radius, kind, tint, sides=8):
    """A cylinder from p0 to p1 in world space.

    `to_track_quat('Z','Y')` and not a hand-rolled euler: `core_rig.py` and
    `cable_percussion.py` both record the same bug, which is that composing the
    rotation by hand fires every diagonal off at 90 degrees to the member it is
    supposed to follow, and it is invisible until something is rendered.
    """
    a, b = Vector(p0), Vector(p1)
    d = b - a
    o = S.tube(name, radius, d.length, kind, loc=a, sides=sides)
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return colour(o, tint)


def railing(name, pts, z0=0.0, kind=GALV, tint=C_GALV, toe=True):
    """A top rail, a mid rail, posts and a toe board along a polyline.

    Handrail and grating runs are named in this site's brief as the classic
    budget killer, and they are not one here: every piece is `galvanised` except
    the toe board, which is `paintedSteel`, so the whole perimeter of both deck
    levels joins into the two draw calls those two names already cost.
    """
    made = 0
    for i in range(len(pts) - 1):
        a, b = Vector(pts[i]), Vector(pts[i + 1])
        run = (b - a).length
        if run < 1e-6:
            continue
        # EACH POINT KEEPS ITS OWN z. The first version put every rail at a
        # single flat `z0 + h`, which is right for a deck edge and wrong for a
        # stair: a stair rail came out HORIZONTAL at deck height, running six
        # metres inboard straight through where the machine's skid beams are,
        # and the keep-clear assertion in build() is what found it.
        for h in (RAIL_H, RAIL_MID):
            bar('%s-rail%d' % (name, i), (a.x, a.y, a.z + z0 + h),
                (b.x, b.y, b.z + z0 + h), RAIL_R, kind, tint, sides=6)
        n = max(2, int(round(run / POST_PITCH)) + 1)
        for k in range(n):
            t = k / (n - 1.0)
            p = a.lerp(b, t)
            tb('%s-post%d-%d' % (name, i, k), RAIL_R * 1.25, RAIL_H,
               (p.x, p.y, p.z + z0), kind, tint, sides=6)
            made += 1
        if toe:
            # [OD4.11] "High kick plates at every floor edge and every opening",
            # and [OD6.3] safety yellow at every edge and change of level.
            mid = a.lerp(b, 0.5)
            yaw = math.atan2(b.y - a.y, b.x - a.x)
            bx('%s-toe%d' % (name, i), (math.hypot(b.x - a.x, b.y - a.y), 0.035, TOE_H),
               (mid.x, mid.y, mid.z + z0 + TOE_H / 2 + 0.02), PAINT, C_AMBER,
               rot=(0, 0, yaw))
    return made


# ═════════════════════════════════════════════════════════════════════════════
#  SUBASSEMBLIES
# ═════════════════════════════════════════════════════════════════════════════

def slot_grid():
    """The well-slot centres, and which of them carries what.

    [S5 p.341], and it is the detail that makes a platform look lived-in rather
    than delivered: "NOT ALL THE CONDUCTORS MAY BE PRESENT AT ALL STAGES OF THE
    PLATFORM LIFE."  So four slots are empty guide holes, four are conductors
    capped at the casing head, six carry a christmas tree on the cellar deck,
    and one - the collar - is the well being drilled right now.
    """
    out = []
    for iy in range(SLOTS_Y):
        for ix in range(SLOTS_X):
            x = (ix - (SLOTS_X - 1) / 2.0) * SLOT
            y = (iy - (SLOTS_Y - 1) / 2.0) * SLOT
            if abs(x) < 1e-6 and abs(y) < 1e-6:
                kind = 'live'
            elif (ix + iy * 2) % 5 == 1:
                kind = 'empty'
            elif (ix + iy) % 3 == 0:
                kind = 'capped'
            else:
                kind = 'tree'
            out.append((x, y, kind))
    return out


def build_deck_framing():
    """Main deck girders and deck beams, all of it UNDER z = 0.

    The plate itself is terrain.js's. What is here is what the plate sits on,
    and it is the fascia you see when you look along the deck edge.
    """
    hx, hy = DECK_X / 2, DECK_Y / 2
    top = -0.03                                   # clear of the live deck plate
    # main girders on the leg lines - the load path down to the deck legs
    for x in LEG_XS:
        bx('deck-girder-y', (GIRDER_W, DECK_Y, GIRDER_D), (x, 0, top - GIRDER_D / 2),
           WORN, C_DECKSTEEL)
    for y in LEG_YS:
        bx('deck-girder-x', (DECK_X, GIRDER_W, GIRDER_D), (0, y, top - GIRDER_D / 2),
           WORN, C_DECKSTEEL)
    # edge girders, which are what the handrail and the fascia stand on
    for s in (-1, 1):
        bx('deck-edge-x', (DECK_X, GIRDER_W, GIRDER_D * 0.8),
           (0, s * hy, top - GIRDER_D * 0.4), WORN, C_DECKSTEEL)
        bx('deck-edge-y', (GIRDER_W, DECK_Y, GIRDER_D * 0.8),
           (s * hx, 0, top - GIRDER_D * 0.4), WORN, C_DECKSTEEL)
    # deck beams at the sourced 5 ft pitch, split around the well-slot opening
    n = int(DECK_X / DECK_BEAM_PITCH)
    for i in range(n):
        x = (i - (n - 1) / 2.0) * DECK_BEAM_PITCH
        if abs(x) < 1e-3 or any(abs(x - lx) < GIRDER_W for lx in LEG_XS):
            continue
        if abs(x) <= COAMING_X:
            for s in (-1, 1):
                y0, y1 = s * COAMING_Y, s * hy
                bx('deck-beam', (BEAM_W, abs(y1 - y0), BEAM_D),
                   (x, (y0 + y1) / 2, top - BEAM_D / 2), WORN, C_DECKSTEEL)
        else:
            bx('deck-beam', (BEAM_W, DECK_Y, BEAM_D), (x, 0, top - BEAM_D / 2),
               WORN, C_DECKSTEEL)


def build_cellar_deck():
    """The cellar deck: OPEN FRAMING, walkways and the christmas trees.

    Deliberately framing and grating rather than a plate. [S5 p.317] says deck
    flooring "may be non-existent, grated, checkered plate, timber or plain
    plate" and all four appear on one structure; open framing here means you see
    THROUGH this level to the jacket below it, which is the whole silhouette
    argument of [OD5.1] - structure all the way down, not a stack of floors.
    """
    hx = 1.5 * BAY + CANTI * 0.0                  # leg-to-leg, no cantilever
    hy = 0.5 * BAY
    z = CELLAR_Z
    for x in LEG_XS:
        bx('cellar-girder-y', (GIRDER_W * 0.85, 2 * hy, CELLAR_D),
           (x, 0, z - CELLAR_D / 2), WORN, C_DECKSTEEL)
    for y in LEG_YS:
        bx('cellar-girder-x', (2 * hx, GIRDER_W * 0.85, CELLAR_D),
           (0, y, z - CELLAR_D / 2), WORN, C_DECKSTEEL)
    n = 12
    for i in range(n + 1):
        x = -hx + i * (2 * hx / n)
        if abs(x) <= COAMING_X:
            continue
        bx('cellar-beam', (BEAM_W * 0.8, 2 * hy, BEAM_D * 0.8),
           (x, 0, z - BEAM_D * 0.4), WORN, C_DECKSTEEL)
    # grating walkways round the well bay, and the handrail on the open edge
    for s in (-1, 1):
        bx('cellar-grating-x', (2 * hx, 1.25, 0.05),
           (0, s * (COAMING_Y + 0.7), z + 0.025), GALV, C_GALV)
        bx('cellar-grating-y', (1.25, 2 * COAMING_Y, 0.05),
           (s * (COAMING_X + 0.7), 0, z + 0.025), GALV, C_GALV)
    railing('cellar-rail-out', [(-hx, -hy, 0), (hx, -hy, 0)], z0=z)
    railing('cellar-rail-in', [(-hx, hy, 0), (hx, hy, 0)], z0=z)

    # ── christmas trees, on the deck the source puts them on ─────────────────
    for x, y, kind in slot_grid():
        if kind == 'tree':
            # NOT SOURCED: no tree height, body diameter or valve arrangement is
            # published anywhere in this library. The ARRANGEMENT - a body, two
            # wing valves, a bonnet and a cap on a casing head - is the ordinary
            # surface tree; the sizes are art.
            tb('xt-body', 0.26, 1.45, (x, y, z + 0.55), PAINT, C_TREE, sides=10)
            bx('xt-wing', (0.92, 0.20, 0.20), (x, y, z + 1.72), PAINT, C_TREE)
            for s in (-1, 1):
                tb('xt-hand', 0.17, 0.11, (x + s * 0.50, y, z + 1.72), PAINT, C_RED,
                   rot=(0, math.pi / 2, 0), sides=8)
            tb('xt-bonnet', 0.21, 0.30, (x, y, z + 2.02), WORN, C_DECKSTEEL, sides=10)
            tb('xt-cap', 0.11, 0.34, (x, y, z + 2.32), WORN, C_DECKSTEEL, sides=8)
            # the flowline leaving the tree toward the process train
            bar('xt-flowline', (x, y, z + 1.25), (x, y + 1.45, z + 1.25),
                0.09, WORN, C_DECKSTEEL, sides=6)
        if kind in ('tree', 'capped'):
            tb('casing-head', 0.42, 0.46, (x, y, z + 0.06), WORN, C_DECKSTEEL, sides=10)
        if kind == 'capped':
            tb('slot-cap', 0.30, 0.16, (x, y, z + 0.52), PAINT, C_AMBER, sides=10)


def build_well_bay():
    """The coaming round the plate's opening, and the conductors below it.

    THE COAMING FRAMES THE HOLE, IT DOES NOT COVER IT. terrain.js cuts the deck
    plate over the collar so the borehole and the surface/section seam stay live
    through the floor; this rectangle stands just outside that cut.
    """
    for s in (-1, 1):
        bx('slot-coaming-x', (2 * COAMING_X + 0.34, 0.34, 0.30),
           (0, s * COAMING_Y, 0.15), WORN, C_DECKSTEEL)
        bx('slot-coaming-y', (0.34, 2 * COAMING_Y, 0.30),
           (s * COAMING_X, 0, 0.15), WORN, C_DECKSTEEL)
        # the edge marking [OD6.3]: anything you can drop something through
        bx('slot-hazard-x', (2 * COAMING_X + 0.34, 0.12, 0.10),
           (0, s * COAMING_Y, 0.35), PAINT, C_AMBER)
        bx('slot-hazard-y', (0.12, 2 * COAMING_Y, 0.10),
           (s * COAMING_X, 0, 0.35), PAINT, C_AMBER)

    # ── the conductors ───────────────────────────────────────────────────────
    # They start at z = -0.60 and run to the bottom of the modelled jacket bay.
    # -0.60 is where oil_derrick.py's own 0.660 m conductor stub ends
    # (tb('conductor', 0.330, 0.55, ... (0,0,-0.30)) spans -0.575..-0.025), so
    # the live well is continuous from the casing head under the rotary, down
    # through both guide frames, into the water.
    top = WELL_HANDOFF_Z
    r = COND_OD / 2
    for x, y, kind in slot_grid():
        if kind == 'empty':
            continue
        tb('conductor', r, top - JACKET_BOT_Z, (x, y, JACKET_BOT_Z), WORN, C_DECKSTEEL)
        # bare, then furred, below the water - the growth line at a FIXED height
        tb('conductor-growth', r + GROWTH_T, SEA_Z - JACKET_BOT_Z,
           (x, y, JACKET_BOT_Z), WORN, C_GROWTH)
        tb('conductor-splash', r + SPLASH_T * 2, SPLASH_HI - SPLASH_LO,
           (x, y, SPLASH_LO), WORN, C_SPLASH)

    # ── conductor guide frames, at the sourced 12-18 m spacing ───────────────
    # [EP0147144] via [A10]: guides are "framed at various elevations within the
    # jacket and decks". They are what makes an offshore well start inside a
    # pre-built pipe instead of in open ground, and they belong to the JACKET -
    # i.e. to the thing that cannot move.
    for zf in (JACKET_TOP_Z, JACKET_BOT_Z):
        gx = (SLOTS_X - 1) * SLOT / 2 + 0.9
        gy = (SLOTS_Y - 1) * SLOT / 2 + 0.9
        for s in (-1, 1):
            bx('guide-frame-x', (2 * gx, 0.34, 0.42), (0, s * gy, zf), WORN,
               C_BARE if zf < SEA_Z else C_DECKSTEEL)
            bx('guide-frame-y', (0.34, 2 * gy, 0.42), (s * gx, 0, zf), WORN,
               C_BARE if zf < SEA_Z else C_DECKSTEEL)
        for iy in range(SLOTS_Y):
            y = (iy - (SLOTS_Y - 1) / 2.0) * SLOT
            bx('guide-beam', (2 * gx, 0.26, 0.30), (0, y, zf), WORN,
               C_BARE if zf < SEA_Z else C_DECKSTEEL)
        for x, y, kind in slot_grid():
            # the guide ring itself, which is present whether or not a conductor
            # has been run through it - that is what an empty slot looks like
            tb('guide-ring', COND_OD / 2 + 0.11, 0.34, (x, y, zf - 0.17), WORN,
               C_BARE if zf < SEA_Z else C_DECKSTEEL, sides=10)


def leg_foot(x, y):
    """Where a leg lands at the bottom of the modelled jacket bay.

    [S5 pp.307-308]: apparent batter 1:8. INFERRED (and marked so at BATTER):
    every leg batters transversely; only the end frames batter longitudinally.
    """
    drop = JACKET_TOP_Z - JACKET_BOT_Z
    fx = x + math.copysign(drop * BATTER, x) if abs(x) > BAY else x
    fy = y + math.copysign(drop * BATTER, y)
    return fx, fy


def build_substructure():
    """Deck legs, the jacket bay, its bracing, the two marine bands and the
    anodes. This is the half of the model that carries the word FIXED.
    """
    legs = [(x, y) for x in LEG_XS for y in LEG_YS]

    # ── deck legs: vertical, from the deck down to the jacket top ────────────
    # [S5]: deck leg OD = pile OD, because the deck leg IS the pile continued
    # above the jacket. The step to the fatter jacket leg at the top of the
    # jacket is that fact made visible.
    for x, y in legs:
        tb('deck-leg', LEG_OD / 2, -JACKET_TOP_Z, (x, y, JACKET_TOP_Z), WORN,
           C_TOPSIDE, sides=12)
    # deck-leg bracing in the plane of the end frames, at the cellar deck level
    for y in LEG_YS:
        for i in range(len(LEG_XS) - 1):
            a, b = LEG_XS[i], LEG_XS[i + 1]
            bar('deckleg-brace', (a, y, -0.9), (b, y, CELLAR_Z - 0.4),
                BRACE_OD / 2 * 0.7, WORN, C_TOPSIDE)
            bar('deckleg-brace', (b, y, -0.9), (a, y, CELLAR_Z - 0.4),
                BRACE_OD / 2 * 0.7, WORN, C_TOPSIDE)

    # ── the jacket bay ───────────────────────────────────────────────────────
    for x, y in legs:
        fx, fy = leg_foot(x, y)
        bar('jacket-leg', (x, y, JACKET_TOP_Z), (fx, fy, JACKET_BOT_Z),
            JLEG_OD / 2, WORN, C_TOPSIDE, sides=12)
        # the two bands, and they are the argument. A structure that MOVES
        # cannot have either of them at a fixed elevation on its legs.
        t = (SPLASH_HI - JACKET_TOP_Z) / (JACKET_BOT_Z - JACKET_TOP_Z)
        sx, sy = x + (fx - x) * t, y + (fy - y) * t
        t2 = (SPLASH_LO - JACKET_TOP_Z) / (JACKET_BOT_Z - JACKET_TOP_Z)
        bar('leg-splash', (sx, sy, SPLASH_HI),
            (x + (fx - x) * t2, y + (fy - y) * t2, SPLASH_LO),
            JLEG_OD / 2 + SPLASH_T * 2, WORN, C_SPLASH, sides=12)
        tw = (SEA_Z - JACKET_TOP_Z) / (JACKET_BOT_Z - JACKET_TOP_Z)
        bar('leg-growth', (x + (fx - x) * tw, y + (fy - y) * tw, SEA_Z),
            (fx, fy, JACKET_BOT_Z), JLEG_OD / 2 + GROWTH_T, WORN, C_GROWTH,
            sides=12)
        # [S5 p.342] anodes "cast over tubular steel cores, which are welded to
        # the structure", in rows down every leg and brace, each on a wrap
        # plate. 3 % of the jacket's steel weight. Nobody models these.
        for k in range(3):
            az = SEA_Z - 1.6 - k * 2.4
            ta = (az - JACKET_TOP_Z) / (JACKET_BOT_Z - JACKET_TOP_Z)
            ax, ay = x + (fx - x) * ta, y + (fy - y) * ta
            off = JLEG_OD / 2 + GROWTH_T + ANODE[0] * 0.8
            bx('anode', ANODE, (ax + math.copysign(off, ax or 1.0), ay, az),
               WORN, C_ANODE)
            bx('anode-wrap', (ANODE[0] * 0.5, ANODE[1] * 1.6, 0.10),
               (ax + math.copysign(off * 0.6, ax or 1.0), ay, az), WORN, C_BARE)

    # ── horizontal framing at the top and bottom of the bay ──────────────────
    for zf, tint in ((JACKET_TOP_Z, C_TOPSIDE), (JACKET_BOT_Z, C_BARE)):
        pts = {}
        for x, y in legs:
            pts[(x, y)] = leg_foot(x, y) if zf == JACKET_BOT_Z else (x, y)
        for y in LEG_YS:
            for i in range(len(LEG_XS) - 1):
                a, b = pts[(LEG_XS[i], y)], pts[(LEG_XS[i + 1], y)]
                bar('jacket-horiz', (a[0], a[1], zf), (b[0], b[1], zf),
                    BRACE_OD / 2, WORN, tint)
        for x in LEG_XS:
            a, b = pts[(x, LEG_YS[0])], pts[(x, LEG_YS[1])]
            bar('jacket-horiz', (a[0], a[1], zf), (b[0], b[1], zf),
                BRACE_OD / 2, WORN, tint)

    # ── X-bracing, on all four faces of the bay ──────────────────────────────
    # [S5 pp.327-328, Fig 6.25]: "K-brace is popular in Gulf of Mexico"; "V + X
    # is in common use in most offshore locations"; full X for deepwater and
    # seismic. The archetype's region is `north-sea`, so X rather than K - and X
    # is also the pattern that reads unmistakably as a jacket at any distance.
    def face(a, b):
        fa, fb = leg_foot(*a), leg_foot(*b)
        bar('jacket-x', (a[0], a[1], JACKET_TOP_Z), (fb[0], fb[1], JACKET_BOT_Z),
            BRACE_OD / 2, WORN, C_TOPSIDE)
        bar('jacket-x', (b[0], b[1], JACKET_TOP_Z), (fa[0], fa[1], JACKET_BOT_Z),
            BRACE_OD / 2, WORN, C_TOPSIDE)
        # the same two members, furred, below the tide line
        for p0, p1 in (((a, fb)), ((b, fa))):
            top = Vector((p0[0], p0[1], JACKET_TOP_Z))
            bot = Vector((p1[0], p1[1], JACKET_BOT_Z))
            t = (SEA_Z - JACKET_TOP_Z) / (JACKET_BOT_Z - JACKET_TOP_Z)
            bar('jacket-x-growth', top.lerp(bot, t), bot,
                BRACE_OD / 2 + GROWTH_T, WORN, C_GROWTH, sides=6)

    for y in LEG_YS:
        for i in range(len(LEG_XS) - 1):
            face((LEG_XS[i], y), (LEG_XS[i + 1], y))
    for x in (LEG_XS[0], LEG_XS[-1]):
        face((x, LEG_YS[0]), (x, LEG_YS[1]))

    # ── boat landing and barge bumpers, at the water ─────────────────────────
    # [S5 p.341]: "Generally, two boat landings each located in opposite faces
    # of the platform are installed ... located near the mean water surface with
    # suitable depth and elevation to provide boat access at low and high tide
    # levels."  A landing AT A FIXED ELEVATION relative to the sea is something
    # only a fixed structure can have. The source's own exception is recorded in
    # research/sites/platform-deck.md: in the North Sea, "not providing boat
    # landings could be given consideration" - one is drawn, not two.
    lx, ly = leg_foot(LEG_XS[-1], LEG_YS[0])
    t = (SEA_Z - JACKET_TOP_Z) / (JACKET_BOT_Z - JACKET_TOP_Z)
    bxp = LEG_XS[-1] + (lx - LEG_XS[-1]) * t
    byp = LEG_YS[0] + (ly - LEG_YS[0]) * t
    # IT HAS THREE STACKED LANDING STAGES, and that is sourced rather than
    # styled: [AZMAN] reports of a subsided platform that "the boat landing is
    # no longer usable by 2016 as ALL THE THREE STAGES OF LANDING were submerged
    # due to subsidence" - after 5.444 m of seabed subsidence. So three stages,
    # and [I] they occupy roughly the lowest ~5 m above the original sea level,
    # which is the inference that sets the spacing below. Nothing else about a
    # boat landing's geometry is published in anything reachable.
    for i in range(3):
        z = SEA_Z + 1.1 + i * 1.75
        tint = C_SPLASH if z < SPLASH_HI else C_TOPSIDE
        bx('boat-landing-stage', (1.35, 3.2, 0.10), (bxp + 1.55, byp, z), WORN, tint)
        for k in range(4):
            bx('boat-landing-grate', (1.25, 0.09, 0.05),
               (bxp + 1.55, byp - 1.2 + k * 0.8, z + 0.07), GALV, C_GALV)
        railing('boat-landing-rail%d' % i,
                [(bxp + 2.2, byp - 1.6, 0), (bxp + 2.2, byp + 1.6, 0)],
                z0=z + 0.05, toe=False)
    for s in (-1, 1):
        bar('boat-landing-stile', (bxp + 1.5, byp + s * 1.5, SEA_Z - 0.6),
            (bxp + 1.5, byp + s * 1.5, SEA_Z + 6.2), 0.12, WORN, C_TOPSIDE)
    # THE SWINGROPE. [SWING], from API RP 54: "A vertically suspended rope with
    # knotted lower end for hand grips, positioned ABOVE THE BOAT LANDING", used
    # to transfer people between a boat and the platform. It is one thin object
    # and it is the single most specific thing on this whole structure: it exists
    # only because a fixed platform is boarded from a boat that is moving while
    # the platform is not.
    bar('swingrope-bracket', (bxp + 1.2, byp - 1.9, SEA_Z + 6.6),
        (bxp + 2.9, byp - 1.9, SEA_Z + 6.6), 0.07, WORN, C_TOPSIDE, sides=6)
    bar('swingrope', (bxp + 2.8, byp - 1.9, SEA_Z + 6.55),
        (bxp + 2.8, byp - 1.9, SEA_Z + 1.4), 0.035, RUB, C_DARK, sides=5)
    for k in range(4):
        tb('swingrope-knot', 0.075, 0.14,
           (bxp + 2.8, byp - 1.9, SEA_Z + 1.5 + k * 0.55), RUB, C_DARK, sides=6)
    # [S5 p.341] barge bumpers: "steel pipe lengths placed at a suitable
    # distance from and welded or clamped onto the jacket legs ... generally
    # fitted with TRUCK TIRES or rubber fenders".
    for s in (-1, 1):
        bar('barge-bumper', (bxp + 2.3, byp + s * 2.6, SEA_Z - 1.2),
            (bxp + 2.3, byp + s * 2.6, SEA_Z + 3.4), 0.26, WORN, C_TOPSIDE)
        for k in range(3):
            tb('bumper-tyre', 0.52, 0.24,
               (bxp + 2.3, byp + s * 2.6, SEA_Z - 0.4 + k * 1.3), RUB, C_DARK,
               rot=(math.pi / 2, 0, 0), sides=10)
    # caged ladder from the landing up to the cellar deck
    for i in range(18):
        z = SEA_Z + 6.4 + i * 0.62
        if z > CELLAR_Z:
            break
        bx('jacket-ladder-rung', (0.44, 0.05, 0.05), (bxp + 1.5, byp + 2.0, z),
           GALV, C_GALV)
    for s in (-1, 1):
        bar('jacket-ladder-stile', (bxp + 1.5 + s * 0.24, byp + 2.0, SEA_Z + 6.2),
            (bxp + 1.5 + s * 0.24, byp + 2.0, CELLAR_Z), 0.035, GALV, C_GALV, sides=6)

    # ── risers, caissons and J-tubes: the pipes that pierce the surface ──────
    # [S5 p.342], the jacket appurtenance list: "boat landings, barge bumpers,
    # conductor bracing and guides, RISERS, clamps, grout and flooding lines,
    # J-TUBES, walkways, mud-mats".  Surface-piercing pipes clamped to the legs
    # for produced-water discharge and seawater intake. Another thing that is
    # only possible because the structure never moves relative to the sea.
    for i, (dx, rad) in enumerate(((-1.10, 0.24), (-1.72, 0.19), (-2.30, 0.30))):
        px = LEG_XS[1] + dx
        bar('caisson', (px, LEG_YS[0] - 0.9, CELLAR_Z + 1.2),
            (px, LEG_YS[0] - 0.9, SEA_Z - 3.0), rad, WORN, C_TOPSIDE)
        bar('caisson-growth', (px, LEG_YS[0] - 0.9, SEA_Z),
            (px, LEG_YS[0] - 0.9, SEA_Z - 3.0), rad + GROWTH_T, WORN, C_GROWTH, sides=6)
        bar('caisson-splash', (px, LEG_YS[0] - 0.9, SPLASH_HI),
            (px, LEG_YS[0] - 0.9, SPLASH_LO), rad + SPLASH_T * 2, WORN, C_SPLASH, sides=6)
        for k in range(4):
            bx('caisson-clamp', (0.16, 0.62, 0.18),
               (px, LEG_YS[0] - 0.55, CELLAR_Z - 1.4 - k * 2.6), WORN, C_TOPSIDE)


def build_deck_edge():
    """Perimeter handrail, toe board and the stair tower between decks.

    [OD4.11]: "Handrails everywhere, broken only at the V-door and the stair
    heads", and "STAIR TOWERS rather than ladders between deck levels".
    """
    hx, hy = DECK_X / 2 - 0.25, DECK_Y / 2 - 0.25
    railing('deck-rail-n', [(-hx, hy, 0), (hx, hy, 0)])
    railing('deck-rail-e', [(hx, hy, 0), (hx, -hy, 0)])
    railing('deck-rail-s', [(hx, -hy, 0), (2.6, -hy, 0)])
    railing('deck-rail-s2', [(-2.6, -hy, 0), (-hx, -hy, 0)])   # break at the head
    railing('deck-rail-w', [(-hx, -hy, 0), (-hx, hy, 0)])

    # the stair tower down to the cellar deck, through the gap left above
    x0, y0 = 0.0, -hy + 0.4
    steps = 22
    rise = -CELLAR_Z
    for i in range(steps):
        t = i / (steps - 1.0)
        bx('stair-tread', (1.30, 0.30, 0.05), (x0, y0 + t * 5.6, -t * rise),
           GALV, C_GALV)
    for s in (-1, 1):
        bar('stair-stringer', (x0 + s * 0.68, y0 - 0.2, 0.05),
            (x0 + s * 0.68, y0 + 5.9, CELLAR_Z + 0.1), 0.09, GALV, C_GALV, sides=6)
        railing('stair-rail%d' % s,
                [(x0 + s * 0.68, y0 - 0.2, 0.05), (x0 + s * 0.68, y0 + 5.9, CELLAR_Z + 0.1)],
                toe=False)


def build_process_train():
    """The production plant the drilling package is a TENANT among.

    [A10] and [OD5.1]: separators, compressors, a quarters block, a flare boom
    on a long outrigger, a helideck. NOT SOURCED: no vessel diameter, skid size
    or arrangement is published for any of it in this library, so the SHAPES are
    the ordinary ones and the SIZES are art. No capacity, rating or duty is
    asserted anywhere.
    """
    # IT LIVES ON THE +Y STRIP, and the first pass put it inside the quarters.
    # `rig_envelope()` clears everything with |y| > 7.05 between z 1.15 and 8.65,
    # so the 5.1 m strip between the machine's substructure and the deck edge is
    # free across the whole length of the platform - and it is also the strip
    # the hero camera looks at, past the machine. Putting the separators at
    # x = -15 instead buried them in the accommodation block, which the first
    # render showed as white cylinder ends coming out of a bedroom wall.
    cy = 9.55
    for i, cx in enumerate((-2.0, 8.0)):
        bar('separator', (cx - 4.0, cy, 2.65), (cx + 4.0, cy, 2.65), 1.28, PAINT, C_PLANT)
        for s in (-1, 1):
            bx('separator-saddle', (0.95, 2.55, 2.10), (cx + s * 2.6, cy, 1.05),
               WORN, C_DECKSTEEL)
            tb('separator-head', 0.36, 0.52, (cx + s * 4.1, cy, 2.65), PAINT, C_PLANT,
               rot=(0, math.pi / 2 * s, 0), sides=10)
        bx('separator-walk', (8.4, 1.05, 0.05), (cx, cy - 1.75, 4.05), GALV, C_GALV)
        railing('separator-rail%d' % i, [(cx - 4.2, cy - 2.2, 0), (cx + 4.2, cy - 2.2, 0)],
                z0=4.05, toe=False)
    # the compressor package: a big clean painted box, and the piping off it
    bx('compressor', (5.0, 3.6, 3.4), (16.4, cy - 0.4, 1.70), PAINT, C_PLANT, bevel=0.05)
    bx('compressor-roof', (5.2, 3.8, 0.28), (16.4, cy - 0.4, 3.54), WORN, C_DECKSTEEL)
    bx('compressor-cooler', (2.2, 3.2, 0.9), (16.4, cy - 0.4, 4.15), WORN, C_DECKSTEEL)
    # the process header running the length of the strip, on its rack
    for i in range(4):
        y = cy + 1.55 - i * 0.44
        bar('process-pipe', (-11.2, y, 5.15 + i * 0.03), (19.2, y, 5.15 + i * 0.03),
            0.13, WORN, C_TOPSIDE, sides=6)
    for k in range(5):
        x = -10.0 + k * 7.2
        bx('pipe-rack', (0.30, 3.0, 5.2), (x, cy + 0.7, 2.6), WORN, C_TOPSIDE)
        bx('pipe-rack-head', (0.9, 3.2, 0.30), (x, cy + 0.7, 5.35), WORN, C_TOPSIDE)


def build_quarters_and_helideck():
    """The quarters block and the helideck cantilevered off the end of it.

    [A10] lists both among "production plant that has nothing to do with
    drilling". The helideck is the sourced object here; the quarters block's
    size and storey count are NOT SOURCED (the [IADC] list gives 100 beds in 27
    rooms, but that is a jack-up's accommodation and it publishes no external
    dimensions).
    """
    x0, x1 = -DECK_X / 2 + 0.4, -13.6
    cx = (x0 + x1) / 2
    w = x1 - x0
    h = 11.4
    bx('quarters', (w, 20.0, h), (cx, 0, h / 2), PAINT, C_QUARTERS, bevel=0.06)
    for lvl in range(3):
        z = 2.6 + lvl * 3.4
        bx('quarters-band', (w + 0.14, 20.2, 0.30), (cx, 0, z + 1.5), PAINT, C_TOPSIDE)
        for j in range(7):
            y = (j - 3) * 2.7
            for s in (-1, 1):
                # OPAQUE dark panes on `rubber`, never `glass` with transmission.
                bx('quarters-window', (0.05, 1.25, 0.95),
                   (cx + s * (w / 2 + 0.03), y, z), RUB, C_DARK)
    bx('quarters-door', (0.08, 1.20, 2.20), (x1 + 0.04, -6.0, 1.10), PAINT, C_TOPSIDE)
    # muster station marking and a life-buoy cabinet [OD6.3] safety red
    bx('lifebuoy-cabinet', (0.55, 1.40, 0.95), (x1 + 0.35, 4.6, 0.48), PAINT, C_RED)

    # ── the helideck ─────────────────────────────────────────────────────────
    # [IADC §A.10] 64.61 ft octagon = 19.69 m across the flats, with a perimeter
    # safety net. Blender's 8-sided cylinder is set out on its CIRCUMradius, so
    # across-flats / cos(22.5 deg) / 2 is the radius to ask for.
    r = HELI_FLATS / math.cos(math.pi / 8) / 2
    hz = h + 2.9
    hcx = x0 - 3.2
    tb('helideck', r, 0.36, (hcx, 0, hz), WORN, C_HELI, sides=8)
    # THE MARKING IS A PERIMETER, NOT A LID. The first version put a full amber
    # disc of radius r + 0.30 on top of the deck, which covered the landing
    # surface completely and rendered as a yellow table top. It is now eight
    # edge segments round the octagon's flats, which is what a painted perimeter
    # actually is.
    for k in range(8):
        a = (k + 0.5) / 8.0 * math.tau
        fx, fy = hcx + math.cos(a) * r * 0.94, math.sin(a) * r * 0.94
        seg = 2 * r * math.tan(math.pi / 8) * 0.97
        bx('helideck-marking', (0.55, seg, 0.05), (fx, fy, hz + 0.38), PAINT, C_AMBER,
           rot=(0, 0, a))
        # the perimeter safety net, sloping down and out on its outriggers
        nx, ny = hcx + math.cos(a) * (r + 1.05), math.sin(a) * (r + 1.05)
        bx('helideck-net', (2.0, seg, 0.05), (nx, ny, hz - 0.45), GALV, C_GALV,
           rot=(0, 0.30, a))
        bar('helideck-net-arm', (nx, ny, hz - 0.50),
            (hcx + math.cos(a) * (r - 0.6), math.sin(a) * (r - 0.6), hz + 0.05),
            0.06, GALV, C_GALV, sides=6)
    # THE SUPPORT STEEL, AND IT IS A STRUCTURE RATHER THAN FOUR WIRES. A helideck
    # this size cantilevers most of its area off the end of the platform, so the
    # first render's four thin rakers read as a floating lid. What carries it is
    # a plated ring beam on a two-way grillage, standing on four columns off the
    # quarters roof and back-stayed to the deck edge.
    tb('helideck-ring', r * 0.99, 0.55, (hcx, 0, hz - 0.55), WORN, C_TOPSIDE, sides=8)
    for k in range(4):
        a = k / 4.0 * math.tau + math.pi / 8
        bar('helideck-grillage', (hcx + math.cos(a) * r * 0.95,
            math.sin(a) * r * 0.95, hz - 0.30),
            (hcx - math.cos(a) * r * 0.95, -math.sin(a) * r * 0.95, hz - 0.30),
            0.20, WORN, C_TOPSIDE, sides=6)
    # Columns ONLY where there is a quarters roof under them. The first version
    # tested `colx > x1` and drew a column at x = -32.7, which is 8.7 m off the
    # outboard end of the block and stood on nothing at all.
    for sx in (-1, 1):
        for sy in (-1, 1):
            colx = hcx + sx * r * 0.52
            coly = sy * r * 0.52
            if not (x0 + 0.4 <= colx <= x1 - 0.4) or abs(coly) > 9.4:
                continue
            bar('helideck-column', (colx, coly, hz - 0.85), (colx, coly, h), 0.30,
                WORN, C_TOPSIDE)
    # The cantilevered outboard half is carried on rakers off the quarters' END
    # WALL, not on back-stays to the deck. The first version ran stays from the
    # outboard edge down to the deck at x = -14.2, which is 9.8 m INSIDE the
    # accommodation block - a strut through five bedrooms. The end wall is the
    # only face on the cantilever side that a strut can actually land on.
    for s in (-1, 1):
        for zt, yo in ((h * 0.62, 5.6), (h * 0.30, 8.4)):
            bar('helideck-raker', (hcx - r * 0.78, s * yo * 0.70, hz - 0.85),
                (x0 - 0.06, s * yo, zt), 0.24, WORN, C_TOPSIDE)
    bar('helideck-raker-tie', (hcx - r * 0.78, -r * 0.55, hz - 0.85),
        (hcx - r * 0.78, r * 0.55, hz - 0.85), 0.18, WORN, C_TOPSIDE, sides=6)


def build_crane():
    """A revolving pedestal crane at the deck edge. [A10]: "Access and room. By
    helicopter and by boat with a crane transfer. EVERYTHING IS LIFTED."

    Geometry from [IADC §A.9.1] (100 ft boom). NO CAPACITY IS CLAIMED: [A10]
    gives platform crane capacities as a band (15-40 t, 50-100 t) and this model
    is not a member of either.
    """
    px, py = 21.8, -9.4
    tb('crane-pedestal', 1.55, 4.6, (px, py, 0), WORN, C_TOPSIDE, sides=12)
    bx('crane-house', (3.0, 2.4, 2.8), (px, py, 6.0), PAINT, C_ORANGE, bevel=0.06)
    bx('crane-cab', (1.5, 1.4, 1.5), (px - 1.9, py - 0.5, 5.6), PAINT, C_TOPSIDE, bevel=0.05)
    bx('crane-cab-glass', (0.06, 1.15, 1.15), (px - 2.68, py - 0.5, 5.7), RUB, C_DARK)
    a = math.radians(38.0)                    # NOT SOURCED boom elevation - a pose
    tipx = px - math.cos(a) * CRANE_BOOM * 0.92
    tipy = py - 2.2
    tipz = 7.0 + math.sin(a) * CRANE_BOOM
    bar('crane-boom', (px - 0.9, py - 1.0, 6.6), (tipx, tipy, tipz), 0.26,
        WORN, C_TOPSIDE)
    bar('crane-boom-lo', (px - 0.9, py + 0.9, 6.4), (tipx, tipy + 1.0, tipz - 0.7),
        0.20, WORN, C_TOPSIDE)
    for k in range(7):
        t = (k + 0.5) / 7.0
        bar('crane-lacing',
            (px - 0.9 + (tipx - px + 0.9) * t, py - 1.0 + (tipy - py + 1.0) * t,
             6.6 + (tipz - 6.6) * t),
            (px - 0.9 + (tipx - px + 0.9) * t, py + 0.9 + (tipy + 1.0 - py - 0.9) * t,
             6.4 + (tipz - 0.7 - 6.4) * t), 0.07, WORN, C_TOPSIDE, sides=6)


def build_flare_boom():
    """The flare boom on its long outrigger, out over the water.

    [A10] and [OD5.1] both name it as an identifying object of a fixed platform
    and NEITHER DIMENSIONS IT. research/rigs/oil-derrick.md's own source table
    records the search result: "Flare-boom length appeared only in a patent's
    general wording - flagged low-confidence."  So FLARE_L and FLARE_DEG are
    NOT SOURCED inventions, marked at their constants, and nothing downstream
    may cite them. What IS sourced is that the object exists, that it is a long
    outrigger, and that it is cantilevered out over water away from everything
    else on the structure.
    """
    a = math.radians(FLARE_DEG)
    rx, ry, rz = DECK_X / 2 - 2.4, 7.4, 2.2
    tipx = rx + math.cos(a) * FLARE_L
    tipz = rz + math.sin(a) * FLARE_L
    tipy = ry + 7.0
    chords = ((-0.85, -0.85), (0.85, -0.85), (-0.85, 0.85), (0.85, 0.85))
    ends = []
    for ox, oy in chords:
        p0 = (rx, ry + oy, rz + ox)
        p1 = (tipx, tipy + oy * 0.34, tipz + ox * 0.34)
        bar('flare-chord', p0, p1, 0.15, WORN, C_TOPSIDE, sides=6)
        ends.append((Vector(p0), Vector(p1)))
    for k in range(9):
        t0 = k / 9.0
        t1 = (k + 1) / 9.0
        for i in range(4):
            j = (i + 1) % 4
            bar('flare-lacing', ends[i][0].lerp(ends[i][1], t0),
                ends[j][0].lerp(ends[j][1], t1), 0.055, WORN, C_TOPSIDE, sides=5)
    bar('flare-tip', (tipx, tipy, tipz), (tipx + 2.4, tipy, tipz + 1.4), 0.52,
        WORN, C_FLARE, sides=10)
    # the two raking legs that put the root out past the deck edge
    for s in (-1, 1):
        bar('flare-outrigger', (rx - 4.0, ry + s * 1.4, 0.1), (rx, ry + s * 0.9, rz),
            0.30, WORN, C_TOPSIDE)


def build_lifeboats():
    """Two totally enclosed lifeboats in davits, port and starboard.

    [IADC §L.8.1]: "2 x fully enclosed, 65 persons each, port and starboard."
    That is the jack-up's list; the requirement for two, on opposite sides, is
    common to both classes. LENGTH IS NOT SOURCED. [OD6.3]: "Lifeboats are
    orange, and they are the brightest objects on the whole structure."
    """
    # Placed OUTSIDE oil_derrick.py's skid-beam envelope (|x| <= 9.596): the
    # first pass put both at x = -4.6 and the build refused it, because a
    # lifeboat in its davit is 1.2 to 3.1 m above a deck the machine's skid
    # beams already occupy to 1.10 m. One goes beside the quarters, which is
    # where a muster station belongs; one goes the other side, aft of the
    # well bay - "port and starboard" [IADC §L.8.1].
    for i, (px, s) in enumerate(((-16.5, 1), (14.8, -1))):
        py = s * (DECK_Y / 2 - 1.1)
        # A HULL, NOT A TANK. The first render's horizontal cylinder read as a
        # pressure vessel painted orange, which on a deck already carrying two
        # separators is exactly the wrong thing to look like. A TEMPSC is a
        # beamy round-bilged boat under a full canopy, so it is built as heavily
        # bevelled boxes stepping in toward bow and stern instead.
        bx('lifeboat-hull', (LIFEBOAT_L * 0.72, 2.30, 1.35), (px, py, 2.05),
           PAINT, C_ORANGE, bevel=0.42)
        for d in (-1, 1):
            bx('lifeboat-end', (LIFEBOAT_L * 0.20, 1.70, 1.05),
               (px + d * LIFEBOAT_L * 0.44, py, 2.05), PAINT, C_ORANGE, bevel=0.36)
        bx('lifeboat-canopy', (LIFEBOAT_L * 0.66, 1.90, 1.15), (px, py, 3.00),
           PAINT, C_ORANGE, bevel=0.46)
        bx('lifeboat-keel', (LIFEBOAT_L * 0.60, 0.30, 0.34), (px, py, 1.30),
           PAINT, C_ORANGE, bevel=0.12)
        bx('lifeboat-hatch', (1.05, 0.85, 0.16), (px + 1.3, py, 3.56), PAINT, C_TOPSIDE)
        bx('lifeboat-window', (0.55, 0.06, 0.34), (px - 1.5, py - 0.96, 3.05),
           RUB, C_DARK)
        for d in (-1, 1):
            bar('lifeboat-davit', (px + d * LIFEBOAT_L * 0.32, py - s * 1.5, 0.05),
                (px + d * LIFEBOAT_L * 0.32, py + s * 0.6, 4.35), 0.14, WORN, C_TOPSIDE)
            bar('lifeboat-fall', (px + d * LIFEBOAT_L * 0.32, py + s * 0.5, 4.25),
                (px + d * LIFEBOAT_L * 0.32, py, 3.05), 0.035, WORN, C_TOPSIDE, sides=5)
        bx('muster-marking', (LIFEBOAT_L + 3.0, 2.4, 0.03), (px, py - s * 2.6, 0.03),
           PAINT, C_AMBER)
        # inboard of the boat, beside the muster marking rather than off the end
        # of it - the end of the davit run is the crane's pedestal at one side
        # and the quarters at the other. [OD6.3]: safety equipment is red.
        bx('lifebuoy', (0.55, 1.30, 0.90), (px, py - s * 3.2, 0.46), PAINT, C_RED)


# ═════════════════════════════════════════════════════════════════════════════
#  BUILD
# ═════════════════════════════════════════════════════════════════════════════

def _assert_contracts():
    """Measure the two keep-clear contracts over REAL world-space vertices.

    Not over bounding boxes and not over the authored `loc` arguments: a
    rotated member's local box is a strict over-estimate (ASTRA.md §5's
    `glbdims.mjs` finding) and an authored location says nothing about a
    primitive's extent. `urban_plot.py` does the same thing for the same reason.
    A check that measures nothing must fail, not pass.
    """
    bpy.context.view_layer.update()
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        for v in o.data.vertices:
            p = o.matrix_world @ v.co
            # 1. the deck plate's cut opening stays open, at and above deck
            #    level. This is what keeps the collar, the borehole and the
            #    surface/section seam live through the floor.
            if p.z >= -0.02 and abs(p.x) <= HOLE_X and abs(p.y) <= HOLE_Y:
                raise AssertionError(
                    'platform_deck: "%s" has a vertex at (%.3f, %.3f, %.3f), inside '
                    'terrain.js\'s deck opening (|x|<=%.2f, |y|<=%.2f) at or above the '
                    'deck. Nothing may cover the collar.' % (o.name, p.x, p.y, p.z,
                                                             HOLE_X, HOLE_Y))
            # 2. the machine's own occupied volume stays empty, at every height.
            env = rig_envelope(p.z)
            if env and abs(p.x) <= env[0] and abs(p.y) <= env[1]:
                raise AssertionError(
                    'platform_deck: "%s" has a vertex at (%.3f, %.3f, %.3f), inside '
                    'oil_derrick.py\'s occupied volume (|x|<=%.2f, |y|<=%.2f at that '
                    'height). The site may not stand in the machine.'
                    % (o.name, p.x, p.y, p.z, env[0], env[1]))
            # 3. THE WELL HAND-OFF. oil_derrick.py owns the live well from
            #    z = -0.575 up (its own conductor stub, casing head, BOP stack
            #    and rotary); this module owns it from WELL_HANDOFF_Z down. The
            #    two must meet at exactly one elevation and neither may cross
            #    it, or the game gets two pipes in one hole - which is the same
            #    class of fault as ASTRA.md §7.5's two datums at one z.
            if p.z > WELL_HANDOFF_Z + 1e-4 and math.hypot(p.x, p.y) < 0.60:
                raise AssertionError(
                    'platform_deck: "%s" has a vertex at (%.3f, %.3f, %.3f), above the '
                    'well hand-off at z = %.3f, where oil_derrick.py\'s own conductor '
                    'stub takes over.' % (o.name, p.x, p.y, p.z, WELL_HANDOFF_Z))


def build(out_path):
    S.reset()
    build_deck_framing()
    build_cellar_deck()
    build_well_bay()
    build_substructure()
    build_deck_edge()
    build_process_train()
    build_quarters_and_helideck()
    build_crane()
    build_flare_boom()
    build_lifeboats()
    _assert_contracts()
    # The site's origin contract (blender/lib/site.py): the origin IS the hole.
    # On a platform the hole is a WELL SLOT, and it is slot (0,0) of the grid.
    S.anchor('site-collar', (0, 0, 0))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    return S.finish(out_path, budget=6)


def preview(path, out_name='platform-deck-export.png', cam=None, look=None,
            ortho=None, samples=40, extra_glb=None, res=None, fov_v=None):
    """Re-import the REAL exported .glb and render it on the CPU.

    THIS IS AN OFFLINE BLENDER RENDER AND NOTHING ELSE. It is not a gameplay
    capture, it does not use the game's procedural material system, and its
    lighting, camera and sea plane are inspection fixtures that are NOT in the
    exported file. What it proves is the geometry that actually shipped - the
    import is the export, not the scene that made it.
    """
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    if extra_glb:
        # READ-ONLY. The machine is imported to be looked at, never written.
        bpy.ops.import_scene.gltf(filepath=extra_glb)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    # DENOISING OFF. Seven other site builds share this machine and OIDN's
    # buffers are the first thing to fail under that load - the first attempt
    # died with "OIDN error: out of memory" and wrote nothing. More samples and
    # no denoiser is slower and always finishes.
    sc.cycles.use_denoising = False
    sc.render.threads_mode = 'FIXED'
    sc.render.threads = 4
    sc.render.resolution_x = res[0] if res else 1280
    sc.render.resolution_y = res[1] if res else 820
    sc.world = bpy.data.worlds.new('inspection-world')
    sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs[0].default_value = (.55, .64, .74, 1)
    sc.world.node_tree.nodes['Background'].inputs[1].default_value = .8
    bpy.ops.object.light_add(type='SUN', location=(40, -60, 60))
    bpy.context.object.data.energy = 4.0
    bpy.context.object.rotation_euler = (Vector((0, 0, 0)) - bpy.context.object.location
                                         ).to_track_quat('-Z', 'Y').to_euler()
    def fixture(name, rgb, rough=0.5):
        """A material for an inspection prop. `diffuse_color` alone is the
        VIEWPORT colour and Cycles ignores it - the first inspection render came
        back with a white sea because of exactly that, and a white sea makes the
        waterline, the splash band and the growth line unjudgeable."""
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        b = m.node_tree.nodes['Principled BSDF']
        b.inputs['Base Color'].default_value = rgb
        b.inputs['Roughness'].default_value = rough
        b.inputs['Transmission Weight'].default_value = 0
        bpy.context.object.data.materials.append(m)

    # THE INSPECTION SEA, at the elevation the GAME draws it. A FIXTURE - it is
    # not in the .glb and this module does not own the sea.
    bpy.ops.mesh.primitive_plane_add(size=900, location=(0, 0, SEA_Z))
    fixture('FIXTURE-sea', (.010, .030, .048, 1), rough=0.12)

    # THE INSPECTION DECK PLATE, and it is the most important fixture here.
    # `src/world/terrain.js` `buildSpecials()` owns the plate and cuts a
    # rectangular hole in it over the collar; this module deliberately ships no
    # plate at all (see THE DECK PLATE IS NOT IN THIS FILE, above). Without a
    # stand-in the render cannot be judged - it looks like an unfinished frame -
    # so one is built here to terrain.js's OWN numbers: a 56 x 34 m outline with
    # a 2*5.4 x 2*4.2 m opening on the collar. It is marked FIXTURE- so nobody
    # can mistake it for exported geometry, and the fact that it overhangs this
    # model's handrail is the finding, not a modelling error.
    plate = 0.02
    for x0, x1, y0, y1 in ((-28, 28, HOLE_Y, 17), (-28, 28, -17, -HOLE_Y),
                           (-28, -HOLE_X, -HOLE_Y, HOLE_Y),
                           (HOLE_X, 28, -HOLE_Y, HOLE_Y)):
        bpy.ops.mesh.primitive_cube_add(size=1, location=((x0 + x1) / 2,
                                                          (y0 + y1) / 2, -plate / 2))
        bpy.context.object.scale = (x1 - x0, y1 - y0, plate)
        bpy.context.object.name = 'FIXTURE-deck-plate'
        fixture('FIXTURE-plate', (.055, .065, .075, 1), rough=0.62)
    cam = cam or (74, -96, 26)
    look = look or (0, 0, 2)
    bpy.ops.object.camera_add(location=cam)
    c = bpy.context.object
    c.rotation_euler = (Vector(look) - c.location).to_track_quat('-Z', 'Y').to_euler()
    if ortho:
        c.data.type = 'ORTHO'
        c.data.ortho_scale = ortho
    elif fov_v:
        # renderer.js's hero field is 34 degrees VERTICAL, and Blender fits the
        # 36 mm sensor to the LONG edge by default - which on a portrait frame
        # is the height, giving a different angle. Pin the fit explicitly.
        c.data.sensor_fit = 'VERTICAL'
        c.data.sensor_height = 24.0
        c.data.lens = 12.0 / math.tan(math.radians(fov_v) / 2.0)
    else:
        c.data.lens = 58
    sc.camera = c
    out = os.path.join(ROOT, 'shots', out_name)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('PLATFORM_PREVIEW_REAL_GLB ' + out)
    return out


def preview_hero(path, derrick_glb, out_name='platform-deck-hero.png', samples=48):
    """The datum proof: this site and the REAL `oil-derrick.glb`, in one scene,
    from the game's own hero camera. AN OFFLINE BLENDER RENDER, NOT A CAPTURE.

    This is the only picture that can show whether the deck datum is right,
    because the fault ASTRA.md §7.5 records is invisible in either file alone:
    a machine 1.090 m into its own floor looks perfectly normal until the floor
    is there too. Both files are IMPORTED FROM THEIR EXPORTS - no scene is
    rebuilt, so what is measured is what ships.

    Placement is the game's, not a pose: rigFactory.js:9350-9352 puts the rig
    group at `terrain.collarPosition` = (0,0,0), which is this site's origin.
    Camera and field are renderer.js's `CAMERA_MODES.hero` as recorded in
    blender/lib/site.py: three.js [7.60, 2.60, 9.90] looking at about y 3.40,
    34 degrees VERTICAL, over the surface band's 780 x 911 portrait aspect.
    three.js +Z is Blender -Y, so the eye is Blender (7.60, -9.90, 2.60).
    """
    out = preview(path, out_name, cam=(7.60, -9.90, 2.60), look=(0.0, 0.0, 3.40),
                  samples=samples, extra_glb=derrick_glb, res=(780, 911), fov_v=34.0)
    return out


if __name__ == '__main__':
    result = build(os.path.join(ROOT, 'public', 'models', 'sites', 'platform-deck.glb'))
    if '--preview' in sys.argv:
        preview(result)
