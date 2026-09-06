"""
SITE — `marine-spread`.  Exports to `public/models/sites/marine-spread.glb`.

A **four-legged, towed, self-elevating work barge** — a jack-up — standing on
its spud legs with its hull jacked clear of the sea, drilling seabed boreholes
through a moonpool amidships, with the containerised soil laboratory and the
seabed CPT frame of an offshore site-investigation spread on its deck.

Read `research/sites/marine-spread.md` for the sources, the gaps and the
integration findings.  Everything below is either cited beside the constant or
marked **NOT SOURCED** at the point of use.

WHY A JACK-UP, AND WHY THAT IS THE WHOLE POINT
-----------------------------------------------
The game has TWO offshore archetypes and a player must tell them apart at a
glance:

    platform-deck    a FIXED installation.  `src/world/terrain.js`, verbatim:
                     the structure "continues down into the water and stays
                     there", and there is **NO AIR GAP** under the deck.
    marine-spread    a MOBILE unit.  It was towed here and it will be towed
                     away.

The discriminator is not a matter of taste — this repository states it three
times.  `src/world/terrain.js`, `kit === 'offshore'` branch: *"the air gap is
what makes a thing a jack-up"*.  `research/01-oil-gas.md` §C.1.2: *"a hull that
floats ABOVE the sea on nothing.  **The air gap is the tell** … A jack-up with
its hull touching the water is a jack-up in transit, not a jack-up drilling."*
And §C.1.8's modeller's cheat-sheet: *"a hull standing in the air on … lattice
legs → jackup"*.  `research/16-site-archetypes.md` §A.11's photograph adds the
rest: *"legs standing high above the hull with jacking houses at their bases,
and the hull out of the water on a visible air gap, legs wet below it"*, on
*"a rectangular barge hull, blunt-ended, helideck cantilevered off a corner"*.

So the mobile identity is carried by EIGHT things, none of which a fixed
platform can have:

  1. LEGS THAT GO UP.  Four spud legs rising 37 m above the working deck and
     straight out of the top of the frame.  A jacket has nothing above its own
     topsides.
  2. SPUD WELL TOWERS at the foot of each leg, with the hydraulic climbing
     cylinders and crosshead locks that raise and lower the whole barge.
  3. PIN HOLES up the legs — the ladder the crossheads climb.
  4. AN AIR GAP.  The hull bottom stands 8.00 m clear of the sea, legs wet
     below it.
  5. A HULL — plated sides, a bilge keel, a boot topping and draft marks, all
     of them high and dry.  A hull is a thing that floated here.
  6. TOW GEAR ON THE BOW: two forward tow points, a bridle, and Panama-type
     fair-leads forward of and in line with them.  Nobody tows a platform.
  7. A MOONPOOL amidships with SKID BEAMS, so the rig reaches the next borehole
     without moving the barge.
  8. NO PROPULSION ANYWHERE.  This barge cannot move itself; a tug does it.

Everything a production platform would bring is deliberately absent.
`research/16` §A.12 states the three hard negatives flatly: **no riser, no BOP,
no flare.**

WHICH METHODS STAND HERE, AND WHY THE UNIT IS THE BIG END OF ITS CLASS
-----------------------------------------------------------------------
`src/game/data.js` — three methods list `marine-spread`:

    site-investigation  unlock 8   si-rig, cpt-unit, crawler-lite   10-35 m
    core                unlock 18  core-rig                         30-600 m
    oil-rotary          unlock 30  oil-derrick                      400-2400 m

`data.js`'s own `ARCHETYPE_RIG_TYPES` lists **`Jackup` first** for this
archetype; its north-sea site prose opens with *"a jack-up stood off with its
legs on the seabed"*; and `RIG_TYPE_WATER.Jackup` is **[25, 140] m** — a
shallow-water machine and nothing else.  So: a jack-up, not a drillship.

The SIZE is decided by what has to stand on it.  `oil-derrick.glb` measures
**19.19 x 24.80 m in plan and 67.7 m tall** (`node tools/glbinfo.mjs`), and
`terrain.js` lays **56 x 34 m** of deck for this archetype.  The purpose-built
site-investigation spud barges are far smaller than that — the two named UK SI
jack-ups are **18.30 m and 21.30 m** long and the largest catalogue unit in
their class is **36.60 x 27.45 m** (see SOURCES in the research note) — and
none of them could carry any of these machines.  This model is therefore the
LARGE end of the jack-up work-barge class, with the SI class's own sourced deck
fit-out on it.  **That tension is real and it is reported, not hidden:** see
"THE SCALE PROBLEM" in `research/sites/marine-spread.md`.

WHAT THIS MODEL DOES *NOT* BUILD, ON PURPOSE
---------------------------------------------
`src/world/terrain.js` `buildSpecials()` owns the working deck: for
`arch.deck === 'mobile'` it lays a 56 x 34 m grating plate at y = 0 **with a
6.0 x 6.0 m hole cut in it at the collar**, and puts the sea 14 m below.  That
hole is the moonpool, and it is why the player can still see the machine and
the hole.  **This module never covers it.**  It supplies the coaming round it,
the plating OUTSIDE the grating rectangle, and nothing at all inside KEEP_CLEAR
above 0.45 m.  `build()` asserts both on real vertices before export.

The sea, the horizon and the grating plate stay in `terrain.js`.  The drill mast
belongs to the MACHINE and is not built here — which is also why the procedural
`kit === 'marine'` branch has to be gated off when this model is live: it draws
an 11 m drill tower with its legs at +/-3.3 m, straight through whatever rig is
standing over the moonpool.

MATERIALS — SIX, WHICH IS THE BUDGET
-------------------------------------
`blender/lib/site.py` MAX_MATERIALS = 6, and a site .glb costs exactly one draw
call per material once `finish()` joins the statics.  Variety comes from
authored VERTEX COLOUR, which is free: white laboratory containers, an amber
crane, a grey hull, an oxide-red boot topping and cream spud well towers are all
one `paintedSteel` draw call.  `terrain.js` binds a white, vertex-coloured
instance of the kind whenever the geometry carries a COLOR attribute, so every
mesh in this file is coloured — a half-coloured material joins badly.

Build:
    "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
        --python blender/sites/marine_spread.py
Offline CPU render of the REAL export (writes shots/marine-spread-*.png):
    ...same command... -- --preview
"""
import importlib.util
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
_spec = importlib.util.spec_from_file_location(
    'drillity_marine_site', os.path.join(HERE, '..', 'lib', 'site.py'))
S = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = S
_spec.loader.exec_module(S)


# ═════════════════════════════════════════════════════════════════════════════
# WHAT THE GAME FIXES.  Not vessel facts — measurements of
# `src/world/terrain.js`, read out of the file.  This model is dimensioned to
# them; if terrain.js changes, these change with it.
# ═════════════════════════════════════════════════════════════════════════════
# buildSpecials(): `outline.moveTo(-28,-17) ... (28,17)`, laid flat by
# rotateX(-PI/2) — a grating plate spanning x +/-28 and world z +/-17.
GRATE_X, GRATE_Y = 28.0, 17.0
# buildSpecials(): `const hx = fixed ? 5.4 : 3.0, hz = fixed ? 4.2 : 3.0;`
# 6.0 x 6.0 m at the collar for `deck: 'mobile'`.  terrain.js cites research/16
# §A.12's published geotechnical moonpools of 4.0 x 4.2 m to 7.2 x 7.2 m and
# 6.0 m square is inside that band, so the coaming below is dimensioned to it
# and no second moonpool figure is introduced.
MOONPOOL = 6.0
# buildSpecials(): `sea.position.y = -14;`
SEA_Z = -14.0
# CFG.collar = (0,0,0), and attachSiteModel() does `node.position.set(0,0,0)`
# with the comment "the .glb's origin IS the collar" — so the origin of this
# file IS the hole.
#
# `CFG.pad` = (0, 0, 2.4) is NOT where the machine stands, and this file used to
# assume it was.  `blender/lib/site.py`'s header now says so in capitals:
# "THE MACHINE DOES NOT STAND AT `CFG.pad`. IT STANDS ON THE COLLAR" —
# `rigFactory.js:9049-9052` does `group.position.copy(anchor)` with
# `anchor = ctx.terrain.collarPosition`, because "the rig's local origin IS the
# drilling centreline".  `CFG.pad` shapes the terrain pad and its decal and
# nothing else, and offshore there is no pad at all.  No constant for it is
# kept here, because a constant nothing uses is the ninth
# declared-contract-with-no-consumer (ASTRA §10).


# ═════════════════════════════════════════════════════════════════════════════
# THE UNIT.  Hull, legs and jacking are taken from ONE published four-legged
# jack-up work barge so that the proportions are a real vessel's and not an
# assembly of borrowed parts.  Source, fetched 2026-09-06:
#   JB-117, https://www.jackupbarge.com/products/jb-117  ("Dimensions")
# and its sister JB-114, https://www.jackupbarge.com/products/jb-114, cited
# separately wherever a figure comes from the sister and not from JB-117.
# No marque, name or number reaches the player (DOMAIN.md §10).
# ═════════════════════════════════════════════════════════════════════════════
HULL_L = 75.90             # m, JB-117 length              [JB-117]
HULL_B = 40.00             # m, JB-117 breadth             [JB-117]
HULL_D = 6.00              # m, JB-117 depth               [JB-117]
DRAFT = 3.90               # m, JB-117 draft (5.0 m incl. spudcan)  [JB-117]
BOOT_H = 0.90              # NOT SOURCED boot-topping band height

# AIR GAP — DERIVED, and the source is a RULE, not a number.  The deck is at
# z = 0 and terrain.js puts the sea at z = -14, so the gap under the hull bottom
# is fixed at 14.0 - HULL_D = 8.00 m.  RenewableUK's jack-up guidelines define
# it — "Airgap: Vertical distance between the bottom of the rig hull and the
# water surface" — and set the minimum by formula, not by a figure: "Minimum
# (Survival) Hull Elevation = LAT + HAT + Surge + Wave crest elevation + 1.5 m",
# Appendix H.  https://iadc.org/wp-content/uploads/2015/04/ruk13-h_Guidelines-for-the-Selection-and-Operations-of-Jack-ups-in-the-Marine-Renewable-Energy-Industry.pdf
# The one published air-gap NUMBER in this repository is 35 ft (10.67 m) for a
# different, three-legged cantilever unit ([IADC-JU] §A.6, research/01 §C.1.2),
# so 8.00 m is not contradicted by anything sourced — but it IS set by
# terrain.js's sea plane and not by naval architecture.  Recorded as an
# integration item rather than fudged by thinning the hull.
AIR_GAP = -SEA_Z - HULL_D

# ── the legs ─────────────────────────────────────────────────────────────────
# TUBULAR, NOT LATTICE, and this was a correction: the work-barge class uses
# plain tubular spud legs.  JB-117 legs are 3.50 m diameter, 80.00 m long
# (optional 90.00 m)  [JB-117].  The nearshore SI class is the same idea one
# size down: 0.76 m / 30 in tubulars on the Combifloat C-5 and on the two named
# UK SI jack-ups, 1.22 m on the C-7, 1.90 m on the C-9.5.
#   https://combifloat.com/wp-content/uploads/2025/05/SpecSheet-C5-2020-07.pdf
#   https://www.lankelma.com/wp-content/uploads/2021/11/Overwater-Experience-2011-2021.pdf
# research/16 §A.11 records the class fact that legs are "lattice or tubular"
# and number "three, four, six and even eight"  [WP-JACKUP].
LEG_N = 4
LEG_DIA = 3.50             # m                             [JB-117]
LEG_TOTAL = 80.00          # m, total leg length           [JB-117]

# HOW MUCH LEG STANDS ABOVE THE DECK — DERIVED, not chosen:
#     LEG_TOTAL = above deck + (deck to sea) + water depth + penetration
#     80.00     = LEG_UP     + 14.00        + 25.00       + 4.00
# 25.00 m is the shallow end of `RIG_TYPE_WATER.Jackup` = [25, 140] in
# `src/game/data.js` — the game's own statement of where a jack-up works.
# 4.00 m of spud penetration is **NOT SOURCED** as a number; the nearshore SI
# class quotes "6 m average leg penetration" for its own much smaller legs
# (Lankelma Sandpiper / Shearwater data sheets), which is the only penetration
# figure I could source at all and belongs to a different unit.
LEG_UP = LEG_TOTAL - 14.0 - 25.0 - 4.0        # = 37.00 m
# The leg is drawn ABOVE the spud well tower and BELOW the hull bottom only.
# The ~14 m in between is inside a closed hull and a closed tower and cannot be
# seen from any camera.  LEG_DOWN stops 4 m under terrain.js's opaque sea plane
# — "legs wet below it" (research/16 §A.11).  The spud cans (JB-117: 47.6 m2
# each, removable  [JB-117]) are BELOW that plane and are not modelled, because
# nothing there can ever be seen and geometry nobody looks at is not modelling.
LEG_DOWN = SEA_Z - 4.0

# JACKING — hydraulic climbing cylinders and crosshead locks, NOT rack and
# pinion.  This was the second correction, and it is sourced verbatim for the
# class: "The jacking mechanism consists of two hydraulically operated
# crossheads per spud well, to lock and unlock the spud for vertical movement.
# Vertical movement is accomplished by four hydraulic heavy duty cylinders"
#   https://combifloat.com/wp-content/uploads/2025/05/Combifloat_C-7_specsheet-E-HPU-1.pdf
# and "Automated hydraulic with pilot console - 2 rams per spudwell"
#   https://www.lankelma.com/wp-content/uploads/2019/11/Sandpiper-Nov-2019-2.pdf
# Rack and pinion appears in the sourced material only for the big offshore
# drilling jack-ups, so the racks that an earlier draft of this file carried
# were WRONG for this unit and were removed.
JACK_STROKE = 1.70         # m, JB-114 jacking stroke (sister unit)  [JB-114]
# `[I] INFERENCE, NOT A SOURCE`: the pin-hole pitch up the leg is not published
# by anyone.  It is drawn at the jacking stroke, because a climbing cylinder
# has to reach the next hole in one stroke.  That reasoning is mine; do not
# quote 1.70 m back as a published pin pitch.
PIN_PITCH = JACK_STROKE
PIN_ROWS = 7               # only the rows a deck-level eye can see are drawn

# LEG CENTRES — **NOT SOURCED**, and the gap is explicit: no dimensioned
# general-arrangement drawing is published for any unit in this class, so no
# source anywhere gives leg spacing.  These are composition constants, solved
# against the hero camera read live from `src/core/renderer.js:160`:
#     hero: pos [8.40, 2.25, 10.94] look [-1.55, 2.60, 0.00],
# which is Blender eye (8.40, -10.94, 2.25) on a sight-line azimuth of
# **132.3 deg**.  The port-quarter leg at (-24, +15.5) sits **8.5 deg** left of
# that line at 39.7 m — beside the machine rather than behind it — and leaves
# the top of the frame at about 15 m and keeps going.
#
# WHY 8.5 AND NOT 13.  `blender/lib/site.py`'s header records an UNRESOLVED
# disagreement about the live field: `renderer.js:160` authors `fov: 34`, but
# `fovForBand()` re-solves the vertical field every frame and modules measure
# the live value near **21 deg**.  Resolving it needs one read of the live
# projection matrix, which needs the GPU lease this agent was told not to take.
# The two give horizontal half-fields of 14.67 deg and about 9.0 deg on the
# surface band's 0.856 aspect, so an object at 13 deg is in frame under one and
# off-screen under the other.  8.5 deg is inside BOTH.  An earlier draft had
# the legs at LEG_X 30, which put this leg at 13.2 deg — in frame only if the
# authored 34 is the live number.  Do not move them back out without measuring
# the field first.
LEG_X, LEG_Y = 24.0, 15.5
# Spud well tower — **NOT SOURCED**.  research/16 §A.11 requires "jacking
# houses at their bases" but dimensions none.  Sized to clothe the leg with a
# walkway round it.
WELL_H = 9.00
WELL_PAD = 1.60            # clearance from the leg skin to the tower wall

# ── the deck spread ──────────────────────────────────────────────────────────
# ISO 20 ft container.  Same manufacturer technical description that
# `blender/sites/urban_plot.py` uses — CONTAINEX v12.06.2023 p3, external frame
# envelope 6.055 x 2.435 x 2.591 m.  No marque is exported.
# https://catalog.containex.com/catalog/CONTAINEX/EN/catalogs/Technische-Beschreibung-CONTAINEX-BASICLINE/pdf/Technische-Beschreibung-CONTAINEX-BASICLINE.pdf
# The SI class's accommodation and laboratory ARE containers, which is why this
# is the right envelope and not a built deckhouse: "20' welfare container" plus
# "40' container housing 20' laboratory, 12' workshop and 8' bargemaster office"
#   https://www.lankelma.com/wp-content/uploads/2021/08/Shearwater-Data-Sheet.pdf
# and research/16 §A.12: "a large soil laboratory centrally located next to the
# drill floor", plus a reefer for samples and a geological sample store.
BOX_L, BOX_W, BOX_H = 6.055, 2.435, 2.591

# SEABED CPT FRAME.  Modelled on a published unit: 2 x 2 m footprint, 2.13 m
# high, 7.3 T ballasted / 3.6 T deballasted, 50 kN push, 20 mm/s.
#   https://www.lankelma.com/wp-content/uploads/2021/11/Roson-50kN.pdf
# research/16 §A.12(d) corroborates the class — 2.2 x 2.2 m, 4 500 kg in air,
# "providing ballast through its substantial submerged weight" [CMS-CPT] — and
# §A.12's photograph gives the three tells: "an unmanned open frame with NO
# CONTROLS ON IT, ONE fat umbilical entering the top at a bend restrictor, and
# WIDE FLAT FEET".
CPT_PLAN, CPT_H = 2.00, 2.13

# CRANE.  JB-117 carries 1 000 t at 22 m / 220 t at 76 m on a 60-98 m boom
# [JB-117]; the sister JB-114 has 300 t at 22 m / 52 t at 62 m on a 60-90 m
# boom [JB-114].  The boom here is drawn at 60 m — the SHORTEST published
# length for either — luffed up and stowed, which is where a boom sits while
# the drill floor works.  Capacity is not modelled and no rating is claimed.
BOOM_L = 60.0
BOOM_ELEV = math.radians(68.0)     # NOT SOURCED stowed luff angle
BOOM_AZ = math.radians(22.0)       # NOT SOURCED stowed slew

# HELIDECK.  19.5 m diameter, rated Super Puma / 9.3 t, on JB-114, JB-115 and
# JB-117 [JB-114], [JB-117]; research/16 §A.11's jack-up photograph puts it
# "cantilevered off a corner", which is where it is here — out over the water
# with the air gap under it, which is not how a platform carries one.
HELI_D = 19.5

# Guard rails and bulwark — **NOT SOURCED**.  This session's web-search budget
# was already spent when the file was written, so I could not reach a citable
# text of the IMO MODU Code or SOLAS guard-rail clause.  These are ordinary
# marine practice and are NOT offered as a quoted rule.  Do not print them.
RAIL_H = 1.10
BULWARK_H = 1.10
BULWARK_T = 0.22

# KEEP CLEAR — a VISUAL RESERVE, not an operational exclusion zone.  Sized to
# `oil-derrick.glb`, the largest machine that stands here: measured
# W 19.192 x L 24.798, bounds x -9.596..9.596, z -14.364..10.434
# (`node tools/glbinfo.mjs public/models/oil-derrick.glb`).
#
# WHERE THE MACHINE ACTUALLY STANDS, AND WHY THIS BAND IS A UNION.
# `blender/lib/site.py`'s header carried, and has since CORRECTED, the claim
# that the machine stands at `CFG.pad`: *"THE MACHINE DOES NOT STAND AT
# `CFG.pad`. IT STANDS ON THE COLLAR."* — `rigFactory.js:9049-9052` does
# `group.position.copy(anchor)` with `anchor = ctx.terrain.collarPosition`,
# i.e. (0, 0, 0), because "the rig's local origin IS the drilling centreline".
# The two readings put oil-derrick's Blender y extent at
#     anchored at CFG.pad   -16.76 .. + 8.03
#     anchored at the collar -10.43 .. +14.36   <- the correct one
# so this band is the UNION of both, rounded outward: an earlier draft used the
# CFG.pad band alone and would have left forward furniture standing inside the
# derrick.  Nothing in this file rises above KEEP_Z inside it AT ANY HEIGHT —
# the derrick is 67.7 m tall, so "above the machine" is not a place to put
# anything either.
KEEP_X = 10.60
KEEP_Y0, KEEP_Y1 = -17.40, 15.00
KEEP_Z = 0.45


# ═════════════════════════════════════════════════════════════════════════════
# MATERIALS — six names, every one a real kind in `src/core/assets.js`
# ═════════════════════════════════════════════════════════════════════════════
PAINT = S.MAT_PAINT        # 'paintedSteel'  hull, bulwark, towers, containers
STEEL = S.MAT_STEEL        # 'rawSteel'      legs, coaming, tubulars, boom
GALV = S.MAT_GALV          # 'galvanised'    rails, stanchions, ladders, walkway
HAZARD = S.MAT_HAZARD      # 'safetyStripe'  moonpool, spud wells, helideck
RUBBER = S.MAT_RUBBER      # 'rubber'        umbilical, fendering
WORN = S.MAT_WORN          # 'wornSteel'     tow and mooring gear, wire

# NOT SOURCED, all of it: a fictional livery.  No real operator's colours.
C_HULL = 0x55606A
C_BOOT = 0x6E2C22          # boot topping, oxide red
C_DECK = 0x46505A
C_BULWARK = 0x616C76
C_TOWER = 0xC9C6BC         # spud well towers, cream
C_LAB = 0xE7E9E4           # laboratory containers, white
C_REEFER = 0xDCDFDB
C_PLANT = 0xC0761E         # crane, jacking cylinders, lifting frames
C_LEG = 0x9AA2A9
C_DARKSTEEL = 0x5C646B
C_GALV = 0xA9B0B4
C_HAZ = 0xD8A21A
C_RUBBER = 0x23272B
C_WORN = 0x8A8378
C_MARK = 0xE3E6E2          # draft marks, deck lettering, helideck marking


def colour(o, rgb):
    """Authored linear vertex colour on a shared material.

    Straight from `blender/sites/urban_plot.py`, including the Blender 5.2 trap
    it records: `use_nodes` is deprecated/always on, so the test must be for the
    actual colour consumer node and not for that flag, or COLOR_0 exports white.
    `terrain.js` `siteMaterial()` binds a white, `vertexColors: true` instance
    of the kind whenever the geometry carries a COLOR attribute.
    """
    c = tuple(((rgb >> shift) & 255) / 255 for shift in (16, 8, 0)) + (1.0,)
    attr = o.data.color_attributes.new(name='Color', type='BYTE_COLOR', domain='CORNER')
    for item in attr.data:
        item.color_srgb = c
    o.data.color_attributes.active_color = attr
    m = o.data.materials[0]
    if not m.node_tree or not m.node_tree.nodes.get('marine-vertex-colour'):
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        vc = m.node_tree.nodes.new('ShaderNodeVertexColor')
        vc.name = 'marine-vertex-colour'
        vc.layer_name = 'Color'
        m.node_tree.links.new(vc.outputs['Color'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.66
        # NEVER above 0.  +65 to +81 draw calls, size-independent (ASTRA §1.6).
        bsdf.inputs['Transmission Weight'].default_value = 0
        if m.name in (STEEL, GALV, WORN):
            bsdf.inputs['Metallic'].default_value = 0.72
    return o


def box(name, size, loc, kind=PAINT, tint=C_HULL, bevel=0.0, rot=(0, 0, 0)):
    return colour(S.box(name, size, kind, loc=loc, rot=rot, bevel=bevel), tint)


def tube(name, radius, length, loc, kind=STEEL, tint=C_LEG, rot=(0, 0, 0), sides=8):
    return colour(S.tube(name, radius, length, kind, loc=loc, rot=rot, sides=sides), tint)


def strut(name, p0, p1, radius, kind=STEEL, tint=C_LEG, sides=6):
    """A tube between two points — bracing, stays, boom members, wire."""
    a, b = Vector(p0), Vector(p1)
    d = b - a
    o = S.tube(name, radius, d.length, kind, loc=a, sides=sides)
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return colour(o, tint)


def railing(name, p0, p1, height=RAIL_H, courses=(1.0, 0.55)):
    """Stanchions and courses along a straight run.  Height and course count
    are NOT SOURCED — see RAIL_H.  Galvanised, so the whole perimeter is one
    draw call however many metres of it there are."""
    a, b = Vector(p0), Vector(p1)
    run = (b - a).length
    posts = max(2, int(round(run / 1.80)) + 1)
    for i in range(posts):
        p = a.lerp(b, i / (posts - 1))
        tube('%s-stanchion-%d' % (name, i), 0.032, height, (p.x, p.y, p.z),
             GALV, C_GALV, sides=6)
    d = (b - a).normalized()
    yaw = math.atan2(d.y, d.x)
    mid = a.lerp(b, 0.5)
    for k, f in enumerate(courses):
        colour(S.box('%s-course-%d' % (name, k), (run, 0.048, 0.048), GALV,
                     loc=(mid.x, mid.y, mid.z + height * f), rot=(0, 0, yaw)), C_GALV)


# ═════════════════════════════════════════════════════════════════════════════
# 1.  THE HULL — plated sides, a bilge keel, a boot topping and draft marks,
#     all of it standing in the air.  "A rectangular barge hull, blunt-ended"
#     (research/16 §A.11).
# ═════════════════════════════════════════════════════════════════════════════
def build_hull():
    hx, hy = HULL_L / 2.0, HULL_B / 2.0

    # Outer deck plating, from the edge of terrain.js's grating plate out to the
    # sheer.  A FRAME of four strips, never one plate: a plate would close the
    # moonpool terrain.js cut, and that hole is the reason the player can see
    # the hole.  Top at -0.01 so it cannot z-fight the grating at exactly 0.
    for sx in (-1, 1):
        w = hx - GRATE_X
        box('deck-plate-end', (w + 0.60, HULL_B, 0.12),
            (sx * (GRATE_X + w / 2.0 - 0.30), 0, -0.07), PAINT, C_DECK)
    for sy in (-1, 1):
        w = hy - GRATE_Y
        box('deck-plate-side', (2.0 * GRATE_X + 1.2, w + 0.60, 0.12),
            (0, sy * (GRATE_Y + w / 2.0 - 0.30), -0.07), PAINT, C_DECK)

    # Side and end shell, and the bottom: one closed box.  Below deck there is
    # nothing to see but the outside of it.
    for sy in (-1, 1):
        box('hull-side', (HULL_L, 0.34, HULL_D), (0, sy * (hy - 0.17), -HULL_D / 2.0),
            PAINT, C_HULL, 0.05)
        box('hull-boot', (HULL_L + 0.02, 0.38, BOOT_H), (0, sy * (hy - 0.17), -DRAFT),
            PAINT, C_BOOT)
        box('hull-bilge-keel', (HULL_L * 0.60, 0.10, 0.55),
            (0, sy * (hy - 0.32), -HULL_D + 0.95), PAINT, C_DARKSTEEL)
        for z in (-1.30, -4.70):
            box('hull-stringer', (HULL_L - 0.6, 0.14, 0.20), (0, sy * (hy - 0.02), z),
                PAINT, C_DARKSTEEL)
    for sx in (-1, 1):
        box('hull-end', (0.34, HULL_B - 0.68, HULL_D), (sx * (hx - 0.17), 0, -HULL_D / 2.0),
            PAINT, C_HULL, 0.05)
        box('hull-end-boot', (0.38, HULL_B - 0.64, BOOT_H), (sx * (hx - 0.17), 0, -DRAFT),
            PAINT, C_BOOT)
    # THE BOTTOM, WITH THE MOONPOOL CUT THROUGH IT.  Four strips, never one
    # plate — and this is not a nicety.  The first build DID lay one plate, and
    # the offline render showed the consequence at once: a player looking down
    # terrain.js's 6 x 6 m opening saw steel instead of sea.  A moonpool is a
    # hole through a HULL (research/16 §A.10's own correction), so the hull has
    # to be open under it or the archetype's one defining feature is a
    # decoration painted on a floor.
    tk = MOONPOOL / 2.0 + 0.35            # trunk half-width, just outside the coaming
    for sx in (-1, 1):
        w = hx - tk
        box('hull-bottom-end', (w, HULL_B, 0.32), (sx * (tk + w / 2.0), 0, -HULL_D + 0.16),
            PAINT, C_DARKSTEEL)
    for sy in (-1, 1):
        w = hy - tk
        box('hull-bottom-side', (2.0 * tk, w, 0.32), (0, sy * (tk + w / 2.0), -HULL_D + 0.16),
            PAINT, C_DARKSTEEL)
    # the moonpool trunk: the watertight shaft between the deck and the bottom
    for sy in (-1, 1):
        box('moonpool-trunk', (2.0 * tk, 0.20, HULL_D), (0, sy * (tk - 0.10), -HULL_D / 2.0),
            PAINT, C_DARKSTEEL)
    for sx in (-1, 1):
        box('moonpool-trunk', (0.20, 2.0 * tk - 0.40, HULL_D),
            (sx * (tk - 0.10), 0, -HULL_D / 2.0), PAINT, C_DARKSTEEL)

    # Draft marks at the bow, port side.  A jacked-up hull shows its marks in
    # the air, which is the cheapest "this floated here" cue in the file.  The
    # mark PITCH and the glyphs are NOT SOURCED — these are blocks, not digits,
    # and no scale is claimed by them.
    for i in range(6):
        z = -0.85 - i * 0.85
        box('draft-mark', (0.34, 0.06, 0.22), (hx - 4.0, hy + 0.02, z), PAINT, C_MARK)
        box('draft-mark-tick', (0.95, 0.06, 0.07), (hx - 4.95, hy + 0.02, z), PAINT, C_MARK)

    # Bulwark, capping rail and guard rail all the way round.
    for sy in (-1, 1):
        box('bulwark-side', (HULL_L, BULWARK_T, BULWARK_H),
            (0, sy * (hy - BULWARK_T / 2.0), BULWARK_H / 2.0), PAINT, C_BULWARK)
        box('bulwark-cap', (HULL_L, 0.30, 0.10), (0, sy * (hy - 0.15), BULWARK_H + 0.05),
            PAINT, C_DARKSTEEL)
        railing('rail-side-%d' % sy, (-hx + 0.7, sy * (hy - 0.32), BULWARK_H + 0.10),
                (hx - 0.7, sy * (hy - 0.32), BULWARK_H + 0.10))
        for i in range(-11, 12):
            box('freeing-port', (1.20, BULWARK_T + 0.06, 0.24),
                (i * 3.2, sy * (hy - BULWARK_T / 2.0), 0.20), PAINT, C_DARKSTEEL)
    for sx in (-1, 1):
        box('bulwark-end', (BULWARK_T, HULL_B - 2 * BULWARK_T, BULWARK_H),
            (sx * (hx - BULWARK_T / 2.0), 0, BULWARK_H / 2.0), PAINT, C_BULWARK)
        box('bulwark-end-cap', (0.30, HULL_B - 0.30, 0.10),
            (sx * (hx - 0.15), 0, BULWARK_H + 0.05), PAINT, C_DARKSTEEL)
        railing('rail-end-%d' % sx, (sx * (hx - 0.32), -hy + 1.0, BULWARK_H + 0.10),
                (sx * (hx - 0.32), hy - 1.0, BULWARK_H + 0.10))


# ═════════════════════════════════════════════════════════════════════════════
# 2.  THE LEGS AND THEIR SPUD WELL TOWERS — the identity of the site
# ═════════════════════════════════════════════════════════════════════════════
def build_legs():
    r = LEG_DIA / 2.0
    well = (r + WELL_PAD) * 2.0
    for sx in (-1, 1):
        for sy in (-1, 1):
            cx, cy = sx * LEG_X, sy * LEG_Y
            tag = 'leg-%s%s' % ('f' if sx > 0 else 'a', 'p' if sy > 0 else 's')
            z0 = WELL_H - 0.6

            # THE LEG ABOVE THE TOWER — the part that says jack-up.  It leaves
            # the top of the hero frame at about 18 m and keeps going.
            tube('%s-column' % tag, r, LEG_UP, (cx, cy, z0), STEEL, C_LEG, sides=13)
            tube('%s-cap' % tag, r + 0.16, 0.34, (cx, cy, z0 + LEG_UP - 0.34),
                 STEEL, C_DARKSTEEL, sides=13)
            # can rings, so a 37 m column has scale on it
            for i in range(1, 7):
                tube('%s-ring' % tag, r + 0.09, 0.22, (cx, cy, z0 + i * (LEG_UP / 7.0)),
                     STEEL, C_DARKSTEEL, sides=13)
            # THE PIN HOLES the crossheads climb.  Only the rows a deck-level
            # eye can see are drawn; PIN_PITCH is an inference, see above.
            for i in range(PIN_ROWS):
                pz = z0 + 1.1 + i * PIN_PITCH
                for q in range(4):
                    a = q * math.pi / 2.0 + math.pi / 4.0
                    box('%s-pin' % tag, (0.46, 0.46, 0.34),
                        (cx + math.cos(a) * (r - 0.05), cy + math.sin(a) * (r - 0.05), pz),
                        STEEL, C_DARKSTEEL, 0.04, rot=(0, 0, a))

            # THE LEG BELOW THE HULL — "legs wet below it".
            tube('%s-lower' % tag, r, (-HULL_D + 0.20) - LEG_DOWN,
                 (cx, cy, LEG_DOWN), STEEL, C_LEG, sides=13)

            # THE SPUD WELL TOWER: the jacking gear, and the reason the barge
            # can stand up.  Four hydraulic climbing cylinders and two crosshead
            # locks per well (sourced mechanism — see JACK_STROKE); tower sizes
            # NOT SOURCED.
            box('%s-well' % tag, (well, well, WELL_H), (cx, cy, WELL_H / 2.0),
                PAINT, C_TOWER, 0.10)
            box('%s-well-cap' % tag, (well + 0.60, well + 0.60, 0.28),
                (cx, cy, WELL_H + 0.14), PAINT, C_DARKSTEEL, 0.04)
            for q in range(4):
                a = q * math.pi / 2.0
                ox, oy = math.cos(a) * (well / 2.0 + 0.42), math.sin(a) * (well / 2.0 + 0.42)
                tube('%s-jack-cyl' % tag, 0.34, 5.60, (cx + ox, cy + oy, 1.10),
                     PAINT, C_PLANT, sides=12)
                tube('%s-jack-rod' % tag, 0.18, 2.20, (cx + ox, cy + oy, 6.60),
                     STEEL, C_GALV, sides=10)
                box('%s-jack-foot' % tag, (0.90, 0.90, 0.50), (cx + ox, cy + oy, 0.55),
                    PAINT, C_DARKSTEEL, 0.05)
            for k, cz in enumerate((3.40, 7.90)):
                box('%s-crosshead' % tag, (well + 1.90, 0.62, 0.80), (cx, cy, cz),
                    PAINT, C_PLANT, 0.06)
                box('%s-crosshead' % tag, (0.62, well + 1.90, 0.80), (cx, cy, cz),
                    PAINT, C_PLANT, 0.06)
            # hazard band at the foot: this is machinery that moves the whole
            # barge, and the deck round it is a no-go while it does
            box('%s-well-hazard' % tag, (well + 0.18, well + 0.18, 0.34),
                (cx, cy, 0.34), HAZARD, C_HAZ)
            for d in (well / 2.0 + 1.70, -(well / 2.0 + 1.70)):
                box('%s-well-mark' % tag, (well + 3.4, 0.22, 0.05), (cx, cy + d, 0.03),
                    HAZARD, C_HAZ)
                box('%s-well-mark' % tag, (0.22, well + 3.4, 0.05), (cx + d, cy, 0.03),
                    HAZARD, C_HAZ)
            # walkway round the tower head and its rail
            for k in (-1, 1):
                box('%s-walk' % tag, (well + 3.0, 1.30, 0.08),
                    (cx, cy + k * (well / 2.0 + 0.70), WELL_H + 0.32), GALV, C_GALV)
                railing('%s-walk-rail-%d' % (tag, k),
                        (cx - well / 2.0 - 1.4, cy + k * (well / 2.0 + 1.28), WELL_H + 0.36),
                        (cx + well / 2.0 + 1.4, cy + k * (well / 2.0 + 1.28), WELL_H + 0.36),
                        height=1.00)
            # caged ladder deck -> walkway
            lx, ly = cx + well / 2.0 + 0.18, cy - well / 2.0 + 0.55
            for dy in (-0.24, 0.24):
                tube('%s-ladder-rail' % tag, 0.035, WELL_H + 0.9, (lx, ly + dy, 0.10),
                     GALV, C_GALV, sides=6)
            for r_ in range(int((WELL_H + 0.6) / 0.32)):
                box('%s-rung' % tag, (0.05, 0.54, 0.035), (lx, ly, 0.48 + r_ * 0.32),
                    GALV, C_GALV)


# ═════════════════════════════════════════════════════════════════════════════
# 3.  THE MOONPOOL — the coaming round terrain.js's own opening and the skid
#     beams the drill floor moves on.  ALL OF IT UNDER KEEP_Z.
# ═════════════════════════════════════════════════════════════════════════════
def build_moonpool():
    h = MOONPOOL / 2.0
    for sy in (-1, 1):
        box('moonpool-coaming', (MOONPOOL + 0.9, 0.30, 0.34), (0, sy * (h + 0.15), 0.17),
            STEEL, C_DARKSTEEL, 0.03)
        box('moonpool-stripe', (MOONPOOL + 0.9, 0.11, 0.11), (0, sy * (h + 0.15), 0.375),
            HAZARD, C_HAZ)
    for sx in (-1, 1):
        box('moonpool-coaming', (0.30, MOONPOOL + 0.9, 0.34), (sx * (h + 0.15), 0, 0.17),
            STEEL, C_DARKSTEEL, 0.03)
        box('moonpool-stripe', (0.11, MOONPOOL + 0.9, 0.11), (sx * (h + 0.15), 0, 0.375),
            HAZARD, C_HAZ)

    # THE SLIDING DRILL DECK.  research/16 §A.12(c), `[FUGRO-CODLING]`: a
    # jack-up campaign of "15 boreholes plus 15 seismic CPTs" used "a sliding
    # drill deck" so the rig reaches each location without moving the barge,
    # "saving up to 12 hours of marine operations at each location".  Beam
    # SECTION and TRAVEL are NOT SOURCED; the beams are drawn 22 m long, which
    # reaches clear of the moonpool both ways and stays inside the deck plate.
    # Centred on the COLLAR, not on CFG.pad: `rigFactory.js:9049-9052` anchors
    # the rig to `collarPosition`, so the drill floor's travel is centred on the
    # hole (see KEEP CLEAR above for the correction this follows).
    for sy in (-1, 1):
        box('skid-beam', (0.42, 22.0, 0.26), (sy * 4.30, 0.0, 0.13),
            STEEL, C_DARKSTEEL, 0.03)
        for i in range(9):
            box('skid-clamp', (0.62, 0.34, 0.30), (sy * 4.30, -9.6 + i * 2.4, 0.15),
                STEEL, C_GALV)
        for sx in (-1, 1):
            box('skid-stop', (0.60, 0.46, 0.40), (sy * 4.30, sx * 10.6, 0.20),
                HAZARD, C_HAZ)


# ═════════════════════════════════════════════════════════════════════════════
# 4.  THE WORKING SPREAD — the containerised laboratory, the seabed CPT frame,
#     the crane, the pipe rack.  research/16 §A.12's photograph, minus
#     everything it rules out: no riser, no BOP, no flare.
# ═════════════════════════════════════════════════════════════════════════════
def _container(name, cx, cy, tint, reefer=False, yaw=0.0):
    """One ISO 20 ft box.  Envelope SOURCED (see BOX_L); ribs, doors, the
    reefer's condenser and the service line are NOT SOURCED detailing."""
    z = 0.18
    ax, ay = math.cos(yaw), math.sin(yaw)
    px, py = -math.sin(yaw), math.cos(yaw)

    def at(u, v):
        return (cx + ax * u + px * v, cy + ay * u + py * v)

    for k in (-1, 1):
        bx, by = at(k * (BOX_L / 2 - 0.5), 0)
        box(name + '-bearer', (0.55, 0.55, z), (bx, by, z / 2), PAINT, C_DARKSTEEL,
            rot=(0, 0, yaw))
    box(name + '-shell', (BOX_L - 0.10, BOX_W - 0.10, BOX_H - 0.16),
        (cx, cy, z + BOX_H / 2), PAINT, tint, 0.025, rot=(0, 0, yaw))
    for h in (0.08, BOX_H - 0.08):
        box(name + '-frame', (BOX_L, BOX_W, 0.16), (cx, cy, z + h), PAINT,
            C_DARKSTEEL, 0.02, rot=(0, 0, yaw))
    for u in (-BOX_L / 2 + 0.05, BOX_L / 2 - 0.05):
        for v in (-BOX_W / 2 + 0.05, BOX_W / 2 - 0.05):
            qx, qy = at(u, v)
            box(name + '-corner', (0.10, 0.10, BOX_H), (qx, qy, z + BOX_H / 2),
                PAINT, C_DARKSTEEL, 0.012, rot=(0, 0, yaw))
    # low-relief corrugation: geometry, never a baked map (rig.py contract 2)
    for i in range(26):
        u = -BOX_L / 2 + 0.22 + i * (BOX_L - 0.44) / 25
        for k in (-1, 1):
            qx, qy = at(u, k * (BOX_W / 2 - 0.035))
            box(name + '-rib', (0.030, 0.026, BOX_H - 0.34), (qx, qy, z + BOX_H / 2),
                PAINT, tint, rot=(0, 0, yaw))
    dx, dy = at(-BOX_L / 2 - 0.01, 0)
    box(name + '-door', (0.06, BOX_W - 0.20, BOX_H - 0.34), (dx, dy, z + BOX_H / 2),
        PAINT, C_DARKSTEEL, 0.01, rot=(0, 0, yaw))
    if reefer:
        qx, qy = at(BOX_L / 2 + 0.22, 0)
        box(name + '-condenser', (0.44, 1.50, 1.50), (qx, qy, z + 1.45), PAINT,
            C_DARKSTEEL, 0.03, rot=(0, 0, yaw))
        tube(name + '-fan', 0.42, 0.18, (qx, qy, z + 1.45), STEEL, C_GALV,
             rot=(0, math.pi / 2, yaw), sides=12)
    else:
        # a bench window, OPAQUE.  `glass` is not one of this file's six
        # materials and a seventh is not worth 1/80th of the surface band.
        qx, qy = at(0.9, BOX_W / 2 + 0.01)
        box(name + '-window', (1.40, 0.05, 0.72), (qx, qy, z + 1.80), PAINT,
            C_DARKSTEEL, rot=(0, 0, yaw))
    a0 = at(BOX_L / 2, 0)
    a1 = at(BOX_L / 2 + 3.4, 0)
    strut(name + '-service', (a0[0], a0[1], z + 0.55), (a1[0], a1[1], z + 0.55),
          0.07, STEEL, C_GALV)


def build_laboratory():
    """"A large soil laboratory centrally located next to the drill floor",
    plus a reefer for samples and a geological sample store — research/16
    §A.12, `[MTN-VOYAGER]`, `[BM-ZEPHYR]`.  terrain.js calls these "the single
    most identifying object on the deck" and it is right.  On the SI class they
    are literally shipping containers, lashed to the deck, not a built
    deckhouse (Shearwater data sheet — see BOX_L).  Placed on the port quarter,
    outboard of KEEP_CLEAR.  LAYOUT NOT SOURCED."""
    for i, (cx, tint, reefer) in enumerate((
            (-18.0, C_LAB, False),
            (-24.8, C_LAB, False),
            (-31.6, C_REEFER, True))):
        _container('lab-%d' % i, cx, 8.0, tint, reefer)
    box('lab-walkway', (20.4, 1.40, 0.07), (-24.8, 10.55, 0.035), GALV, C_GALV)
    railing('lab-rail', (-35.0, 11.20, 0.0), (-14.6, 11.20, 0.0), height=1.00)
    # the sample store, one box athwartships behind the laboratory row
    _container('store', -34.0, 1.6, C_LAB, yaw=-math.pi / 2)


def build_cpt_frame():
    """THE SEABED CPT UNIT IN ITS DECK CRADLE.

    2 x 2 m footprint, 2.13 m high, 7.3 T ballasted (see CPT_PLAN), and
    research/16 §A.12's photograph: "an unmanned open frame with NO CONTROLS ON
    IT, ONE fat umbilical entering the top at a bend restrictor, and WIDE FLAT
    FEET — because its own weight is all the reaction it has."  Nothing on it is
    a control panel."""
    cx, cy = -19.0, -8.6
    box('cpt-cradle', (2.90, 2.90, 0.30), (cx, cy, 0.15), STEEL, C_DARKSTEEL, 0.03)
    h = CPT_PLAN / 2.0
    for sx in (-1, 1):
        for sy in (-1, 1):
            box('cpt-post', (0.13, 0.13, CPT_H), (cx + sx * h, cy + sy * h, 0.30 + CPT_H / 2),
                PAINT, C_PLANT, 0.02)
            box('cpt-foot', (0.88, 0.88, 0.16), (cx + sx * h, cy + sy * h, 0.38),
                STEEL, C_GALV, 0.02)
    for z in (0.85, 1.60, 2.35):
        for k in (-1, 1):
            box('cpt-rail', (CPT_PLAN + 0.13, 0.10, 0.10), (cx, cy + k * h, z), PAINT, C_PLANT)
            box('cpt-rail', (0.10, CPT_PLAN + 0.13, 0.10), (cx + k * h, cy, z), PAINT, C_PLANT)
    # the wheel-drive thruster stack down the middle; no controls anywhere
    tube('cpt-thruster', 0.22, 1.90, (cx, cy, 0.55), STEEL, C_DARKSTEEL, sides=10)
    tube('cpt-cone-store', 0.10, 1.30, (cx + 0.62, cy - 0.55, 0.55), STEEL, C_GALV, sides=8)
    # the bend restrictor and the one fat armoured umbilical off the top
    tube('cpt-restrictor', 0.24, 0.85, (cx + 0.30, cy, 2.48), RUBBER, C_RUBBER, sides=10)
    strut('cpt-umbilical', (cx + 0.30, cy, 3.28), (cx + 5.9, cy - 1.4, 1.35), 0.11,
          RUBBER, C_RUBBER, sides=8)
    box('cpt-winch-frame', (2.30, 2.70, 1.10), (cx + 7.0, cy - 1.7, 0.55), PAINT, C_PLANT, 0.04)
    tube('cpt-winch-drum', 0.80, 2.10, (cx + 7.0, cy - 2.75, 1.30), RUBBER, C_RUBBER,
         rot=(-math.pi / 2, 0, 0), sides=14)


def build_crane():
    """A pedestal crane with its lattice boom luffed up and stowed — where a
    boom sits while the drill floor works.  Boom length 60 m, the shortest
    published for this class (see BOOM_L); the luff angle and slew are NOT
    SOURCED and no capacity is modelled or claimed."""
    cx, cy = -33.0, 11.0
    tube('crane-pedestal', 1.90, 4.60, (cx, cy, 0.0), PAINT, C_TOWER, sides=16)
    box('crane-house', (4.20, 3.40, 3.00), (cx, cy, 6.20), PAINT, C_PLANT, 0.10)
    box('crane-house-roof', (4.45, 3.65, 0.22), (cx, cy, 7.80), PAINT, C_DARKSTEEL, 0.03)
    # the A-frame the boom pendants run over
    for k in (-1, 1):
        strut('crane-aframe', (cx - 1.6, cy + k * 1.3, 7.70), (cx - 0.2, cy, 13.4),
              0.16, STEEL, C_LEG)
    base = Vector((cx + 1.9, cy, 6.40))
    d = Vector((math.cos(BOOM_AZ) * math.cos(BOOM_ELEV),
                math.sin(BOOM_AZ) * math.cos(BOOM_ELEV),
                math.sin(BOOM_ELEV)))
    tip = base + d * BOOM_L
    side = Vector((-d.y, d.x, 0)).normalized()
    up = d.cross(side).normalized()
    # a four-chord lattice boom, tapering at the head
    offs = [(-0.85, -0.60), (0.85, -0.60), (-0.62, 0.72), (0.62, 0.72)]
    for k, (u, v) in enumerate(offs):
        a = base + side * u + up * v
        b = tip + side * (u * 0.42) + up * (v * 0.42)
        strut('crane-boom-chord-%d' % k, a, b, 0.11, STEEL, C_LEG)
    for i in range(16):
        t0, t1 = i / 16.0, (i + 1) / 16.0
        p0, p1 = base.lerp(tip, t0), base.lerp(tip, t1)
        s0 = 1.0 - 0.58 * t0
        s1 = 1.0 - 0.58 * t1
        for (u0, v0), (u1, v1) in (((-0.85, -0.60), (0.85, -0.60)),
                                   ((-0.62, 0.72), (0.62, 0.72)),
                                   ((-0.85, -0.60), (-0.62, 0.72))):
            strut('crane-boom-lace', p0 + side * (u0 * s0) + up * (v0 * s0),
                  p1 + side * (u1 * s1) + up * (v1 * s1), 0.055, STEEL, C_LEG)
    # the pendant, the fall, the block and the hook
    strut('crane-pendant', (cx - 0.2, cy, 13.4), tip, 0.05, WORN, C_WORN)
    strut('crane-fall', tip, tip - Vector((0, 0, 9.0)), 0.035, WORN, C_WORN)
    box('crane-block', (0.48, 0.34, 1.05), (tip.x, tip.y, tip.z - 9.6), WORN, C_WORN, 0.06)
    # the boom rest it lands on when the boom comes down
    box('crane-boom-rest', (2.20, 3.20, 2.60), (cx + 15.5, cy + 6.4, 1.30),
        PAINT, C_PLANT, 0.06)


def build_pipe_rack():
    """Drill pipe and casing on bearers forward of the drill floor, and the
    20 in conductor.  research/16 §A.12(c), `[FUGRO-AYM]`: the jack-up campaign
    ran a "bespoke 20in conductor hostile environment riser casing" that "allows
    the drill string to remain in place through inclement weather events" —
    the one large tubular this archetype genuinely has, and NOT a marine riser
    (§A.12: no riser, no BOP, no flare).  20 in = 508 mm is that quoted size.
    Rack layout, bearer sizes and joint lengths are NOT SOURCED."""
    # Inboard of the forward spud wells and forward of KEEP_CLEAR: the rack runs
    # x 11.2..20.8, which clears KEEP_X (10.60) and stops short of the well
    # towers at x 20.65..27.35.
    for cy in (10.0, -10.0):
        for i in range(4):
            box('pipe-bearer', (0.70, 3.60, 0.34), (12.0 + i * 2.9, cy, 0.17),
                PAINT, C_DARKSTEEL, 0.03)
        for row, (z, n) in enumerate(((0.50, 7), (0.75, 6))):
            for k in range(n):
                off = (k - (n - 1) / 2.0) * 0.26 + (0.13 if row else 0.0)
                tube('pipe-%d-%d' % (row, k), 0.115, 9.6, (16.0, cy + off, z),
                     STEEL, C_GALV, rot=(0, math.pi / 2, 0), sides=8)
        for cx in (12.0, 20.7):
            box('pipe-chock', (0.30, 0.24, 0.55), (cx, cy + 1.85, 0.45), HAZARD, C_HAZ)
            box('pipe-chock', (0.30, 0.24, 0.55), (cx, cy - 1.85, 0.45), HAZARD, C_HAZ)
    # the 20 in (508 mm) conductor joints, on the centreline between the two
    # forward wells, where nothing else wants the deck
    for k in range(3):
        tube('conductor-%d' % k, 0.254, 11.4, (17.2, 0.65 - k * 0.62, 0.62),
             STEEL, C_DARKSTEEL, rot=(0, math.pi / 2, 0), sides=12)
    for i in range(3):
        box('conductor-bearer', (0.80, 2.60, 0.40), (12.5 + i * 4.7, 0.0, 0.20),
            PAINT, C_DARKSTEEL, 0.03)


def build_helideck():
    """A helideck CANTILEVERED OFF A CORNER, out over the water with the air gap
    under it — research/16 §A.11's jack-up photograph, item (3).  19.5 m
    diameter and a Super Puma / 9.3 t rating are published for this family of
    barges (see HELI_D); the support truss, the perimeter net and the marking
    layout are NOT SOURCED and no landing-area standard is claimed."""
    cx, cy, cz = HULL_L / 2.0 - 3.0, HULL_B / 2.0 - 1.0, 7.40
    r = HELI_D / 2.0
    tube('helideck', r, 0.34, (cx, cy, cz), PAINT, C_DECK, sides=12)
    tube('helideck-circle', r * 0.60, 0.06, (cx, cy, cz + 0.34), PAINT, C_MARK, sides=12)
    for k in (-1, 1):
        box('helideck-bar', (5.6, 0.9, 0.06), (cx + k * 1.9, cy, cz + 0.20), PAINT, C_MARK)
    # perimeter safety net and its brackets
    for i in range(12):
        a = i * math.pi / 6.0
        px, py = cx + math.cos(a) * (r + 0.75), cy + math.sin(a) * (r + 0.75)
        box('helideck-net', (1.90, 0.10, 0.05), (px, py, cz - 0.30), GALV, C_GALV,
            rot=(0, 0.28, a))
        box('helideck-net-post', (0.10, 0.10, 0.55), (px, py, cz - 0.10), GALV, C_GALV)
    # the cantilever truss back into the hull, and the diagonal stays under it
    for k in (-1, 1):
        strut('helideck-beam', (cx - r * 0.8, cy + k * 3.2, cz - 0.30),
              (HULL_L / 2.0 - 8.0, HULL_B / 2.0 - 3.0 + k * 1.5, cz - 0.30), 0.28,
              STEEL, C_LEG)
        strut('helideck-stay', (cx - r * 0.5, cy + k * 3.0, cz - 0.34),
              (HULL_L / 2.0 - 4.0, HULL_B / 2.0 - 0.8, -3.4), 0.20, STEEL, C_LEG)
    # the stair down to the main deck
    box('helideck-stair', (1.20, 6.60, 0.20), (cx - r - 0.9, cy - 4.6, cz - 3.4),
        GALV, C_GALV, rot=(0.72, 0, 0))


# ═════════════════════════════════════════════════════════════════════════════
# 5.  TOW AND MOORING GEAR — "this was towed here, and it will be towed away"
# ═════════════════════════════════════════════════════════════════════════════
def build_mooring():
    """Two forward tow points with a bridle, Panama-type fair-leads in line
    ahead of them, bitts along both sides, and a mooring winch.

    SOURCED as an ARRANGEMENT, and it is the arrangement that carries the
    meaning.  RenewableUK's jack-up guidelines §12.9.1: "The jack-up shall be
    **towed from the forward end using a bridle** of suitable construction.  If
    two tugs are used, the bridle may be split and each tug connected to a
    single leg of the bridle."  §12.11.1: "**Capped fair-leads or Panama-type
    fair-leads** shall be fitted forward of and in line with the tow connection
    points."  §12.10.2: the tow connection is designed to "at least three times
    the static bollard pull of the tug".
    https://iadc.org/wp-content/uploads/2015/04/ruk13-h_Guidelines-for-the-Selection-and-Operations-of-Jack-ups-in-the-Marine-Renewable-Energy-Industry.pdf
    The class is not self-propelled — propulsion is an OPTIONAL extra on every
    Combifloat sheet, and the SI jack-ups state their support requirement as a
    "Tug with 6-10 T bollard pull" (Sandpiper / Shearwater data sheets).  There
    are therefore no thrusters, propellers or rudders anywhere in this file.

    EVERY DIMENSION BELOW IS **NOT SOURCED**.  No bollard, fair-lead or bridle
    catalogue was reachable in this session, so these are drawn to read at deck
    scale and none of them is a standard size.
    """
    hx, hy = HULL_L / 2.0, HULL_B / 2.0

    def bitts(name, cx, cy):
        box(name + '-base', (1.40, 0.90, 0.16), (cx, cy, 0.08), WORN, C_WORN, 0.03)
        for k in (-1, 1):
            tube(name + '-barrel', 0.14, 0.74, (cx, cy + k * 0.46, 0.14), WORN, C_WORN,
                 sides=10)
            tube(name + '-head', 0.19, 0.11, (cx, cy + k * 0.46, 0.82), WORN, C_WORN,
                 sides=10)

    for sy in (-1, 1):
        for cx in (hx - 4.2, hx - 16.0, 0.0, -hx + 16.0, -hx + 4.2):
            bitts('bitts', cx, sy * (hy - 1.60))

    # THE TWO FORWARD TOW POINTS and the bridle between them.
    for k in (-1, 1):
        box('tow-point', (1.60, 1.40, 1.15), (hx - 2.6, k * 6.0, 0.58), WORN, C_WORN, 0.08)
        box('tow-shackle', (0.24, 0.60, 0.60), (hx - 1.7, k * 6.0, 0.78), WORN, C_WORN, 0.08)
        # PANAMA-TYPE FAIR-LEAD, forward of and in line with the tow point
        box('fairlead', (1.40, 1.90, 1.00), (hx - 0.75, k * 6.0, 0.62), WORN, C_WORN, 0.14)
        box('fairlead-mouth', (1.50, 0.95, 0.52), (hx - 0.75, k * 6.0, 0.66),
            PAINT, C_DARKSTEEL, 0.16)
        # the bridle leg, out through the fair-lead to the tug that is not here
        strut('tow-bridle', (hx - 1.7, k * 6.0, 0.78), (hx + 3.2, k * 2.2, 0.42),
              0.075, WORN, C_WORN)
    box('tow-bridle-plate', (0.90, 0.90, 0.22), (hx + 3.4, 0, 0.42), WORN, C_WORN, 0.05,
        rot=(0, 0, 0.35))
    strut('tow-pennant', (hx + 3.4, 0, 0.42), (hx + 9.5, -1.6, 0.20), 0.075, WORN, C_WORN)

    # The mooring winch that heaves the barge onto its marks before it jacks.
    # Combifloat sheets list a 4-point mooring system as an option; a real SI
    # campaign used "three-point anchoring" (Lankelma overwater experience p3).
    box('winch-bed', (3.20, 4.60, 0.42), (hx - 10.5, 0.0, 0.21), PAINT, C_DARKSTEEL, 0.04)
    for k in (-1, 1):
        tube('winch-drum', 0.78, 1.30, (hx - 10.5, k * 1.35, 0.42 + 0.78), WORN, C_WORN,
             rot=(-math.pi / 2, 0, 0), sides=14)
        tube('winch-flange', 0.98, 0.14, (hx - 10.5, k * 2.05, 0.42 + 0.78), WORN, C_WORN,
             rot=(-math.pi / 2, 0, 0), sides=14)
    box('winch-motor', (1.40, 1.40, 1.10), (hx - 12.9, 0.0, 0.97), PAINT, C_PLANT, 0.05)
    for k in (-1, 1):
        strut('mooring-wire', (hx - 10.5, k * 1.35, 1.20), (hx - 1.4, k * 6.0, 0.72),
              0.055, WORN, C_WORN)

    # Fendering along the boot topping at the shoulders: a towed barge takes a
    # tug on its side, and the fenders are where it does.
    for sy in (-1, 1):
        for i in range(5):
            tube('fender', 0.36, 1.10, (hx - 6.0 - i * 4.0, sy * (hy + 0.06), -DRAFT + 0.45),
                 RUBBER, C_RUBBER, rot=(-math.pi / 2, 0, 0), sides=10)


# ═════════════════════════════════════════════════════════════════════════════
# 6.  THE NODES THE GAME READS OFF THIS SITE
# ═════════════════════════════════════════════════════════════════════════════
def build_anchors():
    """`mount:` is reused rather than a new prefix, for the reason
    `blender/lib/site.py` gives: `gltfRig.js` already indexes it and `finish()`
    already restores its world transform after the join.  None of these carries
    `cone_deg`/`range_m`, so `env.js` cannot read one as a lamp.

    `mount:site-collar` at the origin is a hard contract —
    `tools/checksiteenvironment.mjs` asserts a site collar anchor exists and
    that its world position is within 1e-5 of the origin.
    """
    S.anchor('site-collar', (0.0, 0.0, 0.0))
    S.anchor('site-moonpool', (0.0, 0.0, 0.40))
    S.anchor('site-crane', (-33.0, 11.0, 6.40))
    S.anchor('site-lab', (-21.8, 8.0, 2.80))
    S.anchor('site-tow', (HULL_L / 2.0 - 2.6, 0.0, 1.15))
    S.anchor('site-helideck', (HULL_L / 2.0 - 3.0, HULL_B / 2.0 - 1.0, 7.60))


# ═════════════════════════════════════════════════════════════════════════════
# BUILD
# ═════════════════════════════════════════════════════════════════════════════
def _assert_clearances():
    """Measured on REAL VERTICES, before the join.

    Two promises, and both are why the player can still see the machine and the
    hole:
      1. nothing in this file rises above KEEP_Z inside the machine's own
         footprint — at ANY height, because oil-derrick is 67.7 m tall;
      2. nothing at all is inside terrain.js's 6.0 x 6.0 m moonpool opening.
    This is a keep-clear assertion, not a second dimension tool: `glbinfo.mjs`
    is the only ruler (ASTRA §5) and it measures the exported file.
    """
    h = MOONPOOL / 2.0
    bpy.context.view_layer.update()
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        for v in o.data.vertices:
            p = o.matrix_world @ v.co
            if abs(p.x) < h - 1e-6 and abs(p.y) < h - 1e-6:
                raise AssertionError(
                    'marine furniture inside the moonpool opening: %s at %.3f %.3f %.3f'
                    % (o.name, p.x, p.y, p.z))
            if p.z > KEEP_Z and abs(p.x) < KEEP_X and KEEP_Y0 < p.y < KEEP_Y1:
                raise AssertionError(
                    'marine furniture inside the machine reserve: %s at %.3f %.3f %.3f'
                    % (o.name, p.x, p.y, p.z))


def build(out_path):
    S.reset()
    build_hull()
    build_legs()
    build_moonpool()
    build_laboratory()
    build_cpt_frame()
    build_crane()
    build_pipe_rack()
    build_helideck()
    build_mooring()
    _assert_clearances()
    build_anchors()
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    return S.finish(out_path)


# ═════════════════════════════════════════════════════════════════════════════
# OFFLINE INSPECTION RENDER — the REAL export, re-imported.  NOT a gameplay
# capture and it does not pretend to be one: `assets.js` generates every surface
# procedurally at runtime and no offline render can show that.  What it CAN show
# is form, scale, silhouette and whether the thing reads as a jack-up.
# ═════════════════════════════════════════════════════════════════════════════
def preview(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 18
    scene.render.threads_mode = 'AUTO'
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False

    scene.world = bpy.data.worlds.new('inspection-world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.50, .63, .76, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .90

    bpy.ops.object.light_add(type='SUN', location=(70, -90, 100))
    sun = bpy.context.object
    sun.data.energy = 4.0
    sun.data.angle = math.radians(2.0)
    sun.rotation_euler = (Vector((-12, 12, 0)) - sun.location).to_track_quat('-Z', 'Y').to_euler()

    # THE SEA, at terrain.js's own elevation.  RENDER FIXTURE ONLY — it is not
    # in the .glb and must never be; terrain.js owns the water.
    bpy.ops.mesh.primitive_plane_add(size=2200, location=(0, 0, SEA_Z))
    water = bpy.data.materials.new('inspection-sea')
    water.use_nodes = True
    wb = water.node_tree.nodes['Principled BSDF']
    wb.inputs['Base Color'].default_value = (.040, .098, .128, 1)
    wb.inputs['Roughness'].default_value = 0.15
    bpy.context.object.data.materials.append(water)

    # THE GRATING DECK terrain.js lays for this archetype, with its 6.0 x 6.0 m
    # moonpool cut at the collar.  RENDER FIXTURE ONLY — it is NOT in the .glb
    # and must never be; `buildSpecials()` owns it, and the whole point of the
    # plating in build_hull() is that it stops at this rectangle's edge.  Drawn
    # here as four strips so the render shows the composite the player sees
    # rather than a barge with a 56 x 34 m hole in the middle of it.
    grate = bpy.data.materials.new('inspection-grating')
    grate.use_nodes = True
    gb = grate.node_tree.nodes['Principled BSDF']
    gb.inputs['Base Color'].default_value = (.30, .32, .33, 1)
    gb.inputs['Roughness'].default_value = 0.55
    gb.inputs['Metallic'].default_value = 0.80
    mh = MOONPOOL / 2.0
    for sx in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * (mh + (GRATE_X - mh) / 2), 0, -0.02))
        bpy.context.object.scale = (GRATE_X - mh, 2 * GRATE_Y, 0.04)
        bpy.context.object.data.materials.append(grate)
    for sy in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, sy * (mh + (GRATE_Y - mh) / 2), -0.02))
        bpy.context.object.scale = (2 * mh, GRATE_Y - mh, 0.04)
        bpy.context.object.data.materials.append(grate)

    # A stand-in for the machine over the moonpool, so the render PROVES the
    # keep-clear volume instead of asserting it.  Sized to `si-rig.glb`, the
    # machine a player first meets here (measured 1.000 x 2.850 x 2.800 m), with
    # its mast up — not to oil-derrick, which would fill the whole frame and
    # show nothing.  RENDER FIXTURE ONLY.
    proxy = bpy.data.materials.new('inspection-machine')
    proxy.use_nodes = True
    proxy.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.58, .21, .04, 1)
    for loc, scale in (((0, 0.0, 0.75), (1.10, 2.90, 1.50)),
                       ((0, 1.0, 3.60), (0.62, 0.62, 5.30))):
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        bpy.context.object.scale = scale
        bpy.context.object.data.materials.append(proxy)

    shots = [
        ('marine-spread-offshore', (152, -178, 62), (0, 0, 10), 'PERSP', 1500, 900, 38.0),
        ('marine-spread-quarter', (74, -96, 26), (-6, 4, 12), 'PERSP', 1500, 900, 36.0),
        # The game's own hero framing — renderer.js CAMERA_MODES.hero, fov 34
        # VERTICAL on the surface band's 780x911 aspect.  Same eye, same target,
        # same field, rendered OFFLINE IN BLENDER.  Not a gameplay capture.
        ('marine-spread-deck', (8.40, -10.94, 2.25), (-1.55, 0.0, 2.60), 'PERSP', 780, 911, 34.0),
    ]
    out_dir = os.path.join(ROOT, 'shots')
    os.makedirs(out_dir, exist_ok=True)
    bpy.ops.object.camera_add(location=(0, 0, 0))
    cam = bpy.context.object
    cam.data.sensor_fit = 'VERTICAL'
    scene.camera = cam
    for name, eye, target, _kind, rx, ry, fov in shots:
        cam.location = Vector(eye)
        cam.rotation_euler = (Vector(target) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        cam.data.angle_y = math.radians(fov)
        scene.render.resolution_x = rx
        scene.render.resolution_y = ry
        scene.render.filepath = os.path.join(out_dir, name + '.png')
        bpy.ops.render.render(write_still=True)
        print('MARINE_PREVIEW_REAL_GLB ' + scene.render.filepath)


if __name__ == '__main__':
    out = os.path.abspath(os.path.join(ROOT, 'public', 'models', 'sites'))
    os.makedirs(out, exist_ok=True)
    result = build(os.path.join(out, 'marine-spread.glb'))
    if '--preview' in sys.argv:
        preview(result)
