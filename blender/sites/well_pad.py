"""
SITE — `well-pad`.  Exports to `public/models/sites/well-pad.glb`.

A graded, drained, engineered working pad: the platform itself with its
battered shoulder, its perimeter drainage channel and the retention basin
outside it, the collector that carries the stores side's fall to that basin,
one gated access and the track away from it, two rod-and-casing racks at the
pad edge, the water tank, a lined containment pit with its spoil ridge and
anchor trench, cuttings skips for haul-off, the bunded fuel and oil store, a
site container and a light tower.

The sealed working area is NOT drawn and the reason is in WHAT IS DELIBERATELY
NOT MODELLED, below.  Neither are mud tanks, a shale shaker, a solids-control
stack, mud pumps or a flare — that is the next section and it is the whole
shape of this file.

WHAT THIS ARCHETYPE ACTUALLY IS, AND THE ONE DECISION THAT SHAPES THE WHOLE FILE
================================================================================
`well-pad` is NOT the oil-and-gas archetype.  It is the archetype SEVEN of the
game's twenty-one methods stand on, and they do not run the same fluid:

    method               flushMedium   rigs (src/game/data.js)
    ------------------   -----------   --------------------------------------
    auger                **none**      crawler-lite, cfa-rig, sonic-truck,
                                       core-rig, si-rig
    cable-tool           **water**     cable-percussion
    site-investigation   **water**     si-rig, cpt-unit, crawler-lite
    dth                  **air**       dth-crawler, rc-rig, pd55
    overburden           **air**       crawler-th, dth-crawler, crawler-lite
    oil-rotary           **mud**       oil-derrick
    sonic                **water**     sonic-truck

Read off `METHODS[].archetypes` and `METHODS[].flushMedium` in
`src/game/data.js` on 2026-09-06, not transcribed from memory.

**ONE method in seven circulates mud.**  `oil-rotary` is also the only one of
the seven whose `toolSlots` contains `mudplant`, `mud` or `wellcontrol`.

So a mud tank farm, a shale shaker, a desander/desilter stack, mud pumps and a
flare are **wrong on six of the seven methods that reach this site**, and they
are wrong in the way a working driller notices in one second.
`research/06-geotech-water-geothermal.md` §E.4 says it in the source's own
terms for the sonic case: *"Often little or no flush — so no mud tank, no
shaker, no spray.  A clean site."*  §E.5 says what an air DTH water well has
INSTEAD: a compressor as big as the rig, a dust collector/cyclone at the collar,
and a white dust plume — no tanks at all.

`src/world/terrain.js`'s procedural `kit === 'wellpad'` branch draws three mud
tanks with a shale shaker between them on EVERY well pad, including every
air-flush DTH and overburden contract.  That is a live defect; it is not this
file's to fix (terrain.js is another agent's) and it is written up in
`research/sites/well-pad.md` with the exact line numbers.

THE LOADER CANNOT SELECT BY METHOD, SO THIS MODEL DOES NOT PRETEND TO
---------------------------------------------------------------------
`terrain.js` `attachSiteModel()` fetches `models/<arch.model>.glb` — keyed on
the ARCHETYPE, once, and cached.  Nothing in that path knows the method.  So
there is no honest way for one `well-pad.glb` to carry method-specific fluid
plant, and the choice made here is the conservative one:

    **THIS FILE SHIPS ONLY WHAT IS TRUE OF ALL SEVEN METHODS.**
    No mud tanks.  No shale shaker.  No desander, desilter or degasser.
    No mud pumps.  No flare.  No BOP closing unit.  No generator row.

What is left is not a compromise — it is the part of a well pad that no
procedural kit in the game has ever drawn, and it is the part the archetype is
named for: **the pad as a piece of surface-water engineering.**  A graded
platform with a fall, a channel round its edge, a basin to catch what runs off
it, a sealed area under the work, one way in, and the stores and racks that
serve any hole regardless of what is pumped down it.

`research/sites/well-pad.md` carries the costed specification for the two
variants (`well-pad-mud`, `well-pad-air`) and the one-line `terrain.js` change
that would let them be selected.  They are NOT built here, because
`public/models/sites/well-pad.glb` is the only export this module owns and
"a gallery of unused models is not completion".

SOURCES
=======
Every key below is `research/16-site-archetypes.md` §G unless stated, and that
file marks its own claims [F] fact / [I] inference / NOT SOURCED.  The two
primary drawings were read out of the local PDF with PyMuPDF (ASTRA §4.6), not
quoted second-hand.

  [WITTIG]  V. Wittig, *Drilling Fundamentals I: Introduction to Drilling
            Technology*, International Geothermal Centre / Hochschule Bochum,
            08.11.2017.  Local: `Wittig_Drilling_intro-part_I.pdf`.
            · **slide 19** (PDF page index 17), verbatim, the regulated site
              requirement set: *"Minimum size approx. 3,000 m2 (up to
              10,000 m2 = 1 ha) · Access suitable for low loaders and heavy
              transport · Sealed surfaces for hazardous substances · Drill
              cellar incl. fundaments for drilling rig · Sewer connection or
              sewage pit · Water supply · Oil separator · Fixed fencing ·
              Power supply · Gas flare installation possibility"*
            · **slide 20** (index 18), *"Drill site plan + layout for land rig
              > 100 ton hook load"* — a real dimensioned general arrangement.
              Read directly: pipe racks either side of a CATWALK running to a
              PIPE RAMP at the rig; doghouse; the mud row (MUD TANK-A 20 m3,
              MUD TANK-B 43 m3, MUD TANK-C 43 m3, CUTTINGTANK I 46.5 m3,
              CUTTINGTANK II 20 m3, SOLIDSTANK 20 m3, desander, desilter,
              triple-unit tandem screen separator, mud degasser, two FB-1300
              pumps, double-acting manifold, optional baryte silo and
              4 x mud silos 37.5 m3); the power row (oil storage, 400 kVA
              emergency generator set, three diesel generator containers at
              2 500 mm each, a compressor unit at 2 438 mm, and a
              **FUEL TANK 30 m3 at 11 500 x 2 050 mm**); a 14 000 x 3 000 mm
              SCR container; and the camp along the boundary (toilet, living
              room, change room, support container, workshop, store, driller,
              toolpusher, shower and laundry, first aid / gas protection).
            · **slide 21** (index 19), *"Drill site plan e.g. Germany"* — the
              WEG/BVEG water-protection zoning plan, and the reason this file
              exists in the shape it does.  It labels, in German:
              **Rinne** (channel) running the whole pad perimeter;
              **Rueckhaltebecken** (retention basin) outside one corner;
              **Zu-/Abfahrt** (one access and egress);
              **WGK-Bereich** (the sealed water-hazard-class area under the
              rig and the fluid plant); **Zeitweiliger WGK-Bereich (z.B.
              Rohrlager)** (a TEMPORARY hazard area — the pipe store);
              **Diesel- und Oellager**; **Chemikalien**; **Zement-Silos**;
              **Waschwasser** and **Faekalien** collection points.
              It is stamped **"Zeichnung nicht massstabsgerecht"** — NOT TO
              SCALE — so **every dimension taken from slide 21 would be
              invented.  None is.  Only the arrangement is used.**

  [GOLDBOOK] US BLM / USFS, *Surface Operating Standards and Guidelines for
            Oil and Gas Exploration and Development* ("the Gold Book"),
            4th ed. rev. 2007 —
            https://www.blm.gov/sites/blm.gov/files/uploads/The%20Gold%20Book%20-%204th%20Ed%20-%20Revised%202007.pdf
            **The dimensional authority for the pad itself, and the reason
            most of the numbers below are no longer NOT SOURCED.**
            · Fig. 2, p.20 — the layer stack, named top-down:
              **surface course -> base course -> subgrade**.
            · p.25, "Design Standards" — an example standard set:
              *"a 14-foot-wide travelway, 2-foot shoulders, 2:1 cut slopes,
              3-foot curve widening, and 6 inches of crushed aggregate"*.
            · p.29 — fill placed in *"approximately horizontal layers not more
              than 8 inches in thickness"*; stones coarser than a 3-inch square
              mesh buried at least 4 inches below the finished surface.
            · Fig. 3, p.21 — crown by surface type: earth 3-5 %, **aggregate
              2-4 %**, paved 2-3 %; the "Level Ground Section" is drawn at 2 %
              crown with **3:1 side slopes**.
            · p.16, and this is the one that decides the layout, verbatim:
              *"The area of the well pad where the drilling rig substructure is
              located should be level and capable of supporting the rig...
              The area used for mud tanks, generators, mud storage, and fuel
              tanks should be at a slight slope, where possible... to provide
              surface drainage from the work area to the pit."*
              And: *"divert storm water away from the well location with
              ditches, berms, or waterbars above the cut slopes."*
            · pp.16-17, the pit rules: *"at least 2 feet of freeboard"*;
              *"at least 50 percent of the reserve pit should be constructed
              below original ground level"*; the dike keyway or core trench
              *"excavated to a minimum depth of 2 to 3 feet below the original
              ground level"*; liner permeability less than 10^-7 cm/sec and a
              synthetic liner *"minimum thickness of 12 mils"*.

  [USGS-OFR2012] Slonecker et al., *Landscape consequences of natural gas
            extraction in Bradford and Washington Counties, Pennsylvania,
            2004-2010*, USGS Open-File Report 2012-1154, Table 1 —
            https://pubs.usgs.gov/of/2012/1154/of2012-1154.pdf
            Digitised from 1 m NAIP imagery, i.e. **measured, not estimated**:
            *"The mean disturbed hectares for Marcellus sites is almost
            identical for both counties (3.0 hectares for Bradford and
            2.9 hectares for Washington)"* — pad only; 4.1-4.3 ha with roads.

  [DOE-SHALE] US DOE / NETL, *Modern Shale Gas Development in the United
            States: A Primer*, April 2009, p.47 —
            https://www.energy.gov/sites/prod/files/2013/03/f0/ShaleGasPrimer_Online_4-2009.pdf
            Shallow **vertical** well pad **2.0 acres** (4.8 acres with road
            and utility corridor); **horizontal** well pad 3.5 acres (6.9);
            **+0.5 acre per additional well** on the pad.

  [CFR-112] 40 CFR 112.9(c)(2) and 112.7(c), retrieved from the eCFR renderer
            — https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-112/subpart-A/section-112.9
            Secondary containment must hold *"the entire capacity of the
            largest single container and sufficient freeboard to contain
            precipitation"*, by *"dikes, berms, or retaining walls sufficiently
            impervious to contain oil"*.
            **NOTE, because it is a correction worth carrying:** the familiar
            "110 % of the largest tank" is an engineering convention and does
            **not** appear in 40 CFR 112.  No containment percentage and no
            bund height is asserted anywhere in this file.

  [SLB-SHAKER] SLB Energy Glossary — https://glossary.slb.com/en/terms/s/shale_shaker
            *"the primary and probably most important device on the rig for
            removing drilled solids from **the mud** ... The liquid phase of the
            mud and solids smaller than the wire mesh pass through the
            screen."*  With https://glossary.slb.com/en/terms/a/air_drilling —
            air drilling uses gases *"instead of the more conventional use of
            liquids"* — this is the primary-source form of the argument that
            opens this docstring: a shaker is a liquid-mud device and there is
            no liquid on an air job to put through one.  On air the return path
            has its own name, the **blooey line** (IADC Lexicon, citing
            API RP 64 — https://iadclexicon.org/blooey-line/).

  [NGWA-AIR] National Ground Water Association, *Air rotary drilling method* —
            https://wellowner.org/resources/basics/drilling-methods/air-rotary/
            Cuttings travel up the annulus and out *"onto the adjacent
            ground"*; *"This system usually consists of a truck mounted drill
            and separate support vehicle"*.  With
            https://wellowner.org/resources/basics/drilling-methods/mud-rotary-drilling-method/
            — on a water well *"the mud pit can be below ground as shown, or it
            can be above ground.  Either way, it's the same difference."*
            **A water-well mud pit is a 250-300 gallon tank on the rig, not a
            tank farm.**

  [KGS-PRIMER]  Kansas Geological Survey, *Petroleum: a primer for Kansas —
            Drilling the well* — https://www.kgs.ku.edu/Publications/Oil/primer12.html
            Site preparation: *"a nearly level area of sufficient size on which
            to erect the drilling rig, excavate reserve pits, and provide
            storage"*; the contractor clears and levels and constructs *"a
            large pit to contain water for drilling and to dispose of cuttings
            and waste"*; drill pipe and collars are laid on racks convenient to
            the rig floor; water and fuel tanks filled.

  [SCDT-DESERT] https://scdrilltech.com/articles/onshore-desert-drilling-waste.html
  [SCDT-CLOSED] https://scdrilltech.com/articles/closed-loop-and-zero-discharge.html
            (contractor technical articles, graded moderate in §G).  Desert
            operations centre on **lined evaporation pits**; the closed-loop
            alternative replaces the earthen pit with steel tanks, a dewatering
            unit, augers from the shakers to containment, and **cuttings boxes
            for haul-off**.  §A.13's read of the pair: *"an earthen pit site
            and a closed-loop site look different and tell you the regulatory
            regime at a glance"*, and its photograph brief is explicit that a
            site shows **one or the other, never both**.

  [HELP-BOQ] NGO borehole tender bill of quantities, South Sudan —
            https://comms.southsudanngoforum.org/uploads/default/original/2X/4/40da0057db7bdad5d54fe25cfa5712c4d923d00f.pdf
            **uPVC 5 in screens in 3 m lengths**, 18 m of screen and 62 m of
            plain casing; gravel pack 35 x 50 kg bags of 2-6 mm gravel.

  [TGS-REPORT] Village borehole completion report —
            https://ugandanwaterproject.com/wp-content/uploads/2020/06/480-Misozi-NBH-Drilling-Report-PDF.pdf
            Air rotary then DTH; **drill rods 2.5 in OD in 2 m lengths**;
            a compressor at 14 bar *"as big as the rig itself"*.

  [NB16]    Norwegian water/energy-well guidance, via
            `research/06-geotech-water-geothermal.md` §E.5: on an air DTH water
            well, **steel casing in 139.7 / 168.3 / 193.7 mm "racked
            alongside"**, plus a dust collector/cyclone at the collar.

  [LONESTAR] https://www.lonestardrills.com/drilling-water-wells/ (small-rig
            manufacturer, trade quality).  For mud rotary the operator either
            **digs the pit in the ground or uses portable tanks**.

  [OTA-NORTHSLOPE] US Congress Office of Technology Assessment, *Technologies
            for Oil and Gas Development on the North Slope of Alaska*, ch. 2 —
            https://www.princeton.edu/~ota/disk1/1989/8922/892205.PDF
            *"common North Slope practice is to build up a thick gravel pad to
            insulate the permafrost"* — **all roads and gravel pads are built
            about five feet thick** (1.524 m), with insulation and geotextile;
            reserve pits **built below grade, using the permafrost itself for
            containment**.  This is the ARCTIC case; `well-pad` is also the
            `sahara` archetype, so the figure is used as the sourced upper
            bound on pad lift and is labelled as North Slope practice, not as
            a global pad thickness.

  §A.13, §A.14, §A.15 of `research/16-site-archetypes.md` are the archetype
  pack entries and carry their own [F]/[I] marks.  §A.13's modelling
  instruction, from [WITTIG] p.26: ***"The rig is small; the site is large.
  Draw the site."***

WHAT IS DELIBERATELY NOT MODELLED, AND WHY
==========================================
  · **The cellar.**  [WITTIG] slide 19 requires one and `data.js` names it in
    the archetype's own `renders` line — and `terrain.js` ALREADY draws it,
    as a lined pit and grating edge at the collar (the `kit === 'wellpad'`
    branch).  Drawing a second one here would put authored geometry straight
    over the live collar and the section seam, which is the one thing a site
    .glb must never do.  It stays in terrain.js.
  · **The ground surface.**  `heightAt()` is a shared contract and a function,
    not a mesh (blender/lib/site.py).  Nothing here is a floor.  The pad reads
    as engineered through its EDGE — shoulder, channel, kerb — and the live
    terrain shows through everywhere inside it.
  · **Fixed fencing.**  [WITTIG] slide 19 requires it for a regulated German
    land well.  §A.14's water-well plot is the opposite: *"Unbounded.  No
    hoarding, no cabins, often no fence."*  Both are sourced and they
    contradict each other across the seven methods, so neither is shipped.
  · **The camp.**  [WITTIG] slide 20 and [FOX-DESERT] both put 35-90 person
    accommodation on the same location; [TGS-REPORT]'s village borehole has a
    crew of four and mobilises in two days.  Same contradiction, same answer.
  · **A flare.**  [WITTIG] slide 19 requires the POSSIBILITY of a gas flare
    installation, not a flare.  Only `oil-rotary` could light one.

MATERIALS — SIX, WHICH IS THE BUDGET
====================================
See THE BUDGET in `blender/lib/site.py`: a site .glb costs one draw call per
material once `finish()` joins the statics, and eight of twenty-one method
states are already over the surface band's ceiling of 80 with no .glb on the
site at all.

    gravel          pad shoulder and batter, channel invert, access track,
                    spoil ridge, gravel-pack bags, cuttings heaps
    concrete        the perimeter channel, the retention basin, the bunds and
                    kerbs of the sealed areas, tank and rack plinths
    paintedSteel    water tank, cuttings skips, the store container body
    rawSteel        rack bearers, steel casing, ladders, walkways, handrail,
                    tank fittings and valves
    paintedDark     skids, frames, stands, guarding, gate leaves
    plastic         the pit liner, uPVC casing and screen, drums, cones

Everything else is bought in TRIANGLES, which are free in draw calls.

NAMING
======
`DOMAIN.md` §10.  No object, material or exported string here carries a
manufacturer, a model designation or a real operator's name.  [WITTIG] slide 20
names two engine and two pump makes; none of them reaches this file.

AXES
====
`blender/lib/site.py` AXES.  Metres, Blender Z-up, origin is the hole collar at
ground level, Blender +Y is AWAY from the hero camera.  Every placement in this
file is solved in `(dist, across)` on the measured hero view axis with
`on_axis()`, never in raw world coordinates.

Build:
    "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
        --python blender/sites/well_pad.py
Add `-- --preview` to re-import the REAL export and render it on the CPU.
Drop `--background` to look at it in the GUI.
"""

import importlib.util
import math
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


def _load_site_lib():
    """Load `blender/lib/site.py` BY PATH.

    `site` is a CPython standard-library module that runs during interpreter
    start-up, so `sys.modules['site']` is already taken before any of this
    executes and a plain `import site` returns THAT whatever `sys.path` says.
    The failure is silent until the first attribute access.  quarry_bench.py
    carries the same loader and the same explanation; this is the second
    instance of it, not a second implementation of the library.
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
# THE HERO CAMERA — MEASURED, BUT NOT MEASURED HERE
#
# These are `blender/sites/quarry_bench.py`'s numbers verbatim, and that file
# records how they were got: by projecting probe points through the LIVE
# `ctx.camera` on the shipping layout and bisecting for the NDC edges, held
# until `terrain.archetype` and the ground mesh both agreed the site was really
# up.  Two earlier attempts at the same constants were wrong — once from
# reasoning about `fov`, once from reading the BOOT camera during its ~28 s
# shader compile.
#
# They are reused rather than re-derived because there is ONE hero camera and
# two tables describing one thing will drift (ASTRA §5).  They are NOT
# re-measured in this pass: the GPU lease is held elsewhere and a headed capture
# was not available.  **If the hero camera has moved since 2026-09-05, this site
# is mis-framed and so is quarry-bench.**  That is a shared dependency, not a
# private one, and it is recorded in research/sites/well-pad.md.
#
#     eye        three.js [8.400, 2.250, 10.940]  =  Blender [8.400, -10.940, 2.250]
#     fov 20.97 vertical, aspect 1.724
#     half-width(d) = 0.4023 * d
#     top(d)        = 2.25 + 0.2065 * d      (NDC y = +1)
#     bottom(d)     = 2.25 - 0.1638 * d      (NDC y = -1)
#     the horizon lands at NDC y = -0.12; the collar at plan distance 13.74 m
#     sits on the bottom edge of the surface band.
# ═════════════════════════════════════════════════════════════════════════════
EYE = (8.400, -10.940, 2.250)
AXIS = (-0.6731, 0.7401)           # plan view direction, Blender XY
RIGHT = (0.7401, 0.6731)           # screen-right in plan, Blender XY
EYE_Z = 2.250
TOP_K = 0.2065
BOT_K = 0.1638
HALF_W_K = 0.4023

# quarry_bench.py's EDGE ARTEFACT note: geometry reaching the outer ~6 % of the
# surface band's WIDTH came back as vertical coloured speckle in every capture,
# and the cause is not diagnosed.  Its mitigation was to keep authored geometry
# inboard of about NDC x -0.85.  The same mitigation is applied here, in both
# directions, and it is a mitigation and not a fix.
NDC_EDGE = 0.85


def on_axis(dist, across=0.0):
    """Blender (x, y) at `dist` metres along the hero view axis, `across` metres
    across the frame (+ is screen-right).  The only placement function in this
    file."""
    return (EYE[0] + AXIS[0] * dist + RIGHT[0] * across,
            EYE[1] + AXIS[1] * dist + RIGHT[1] * across)


def half_width(dist):
    """Half the frame's world width at `dist`."""
    return dist * HALF_W_K


def ndc_y(dist, height):
    """Where (`dist`, `height`) lands vertically: -1 is the bottom of the
    surface band, +1 the top, and the measured horizon is about -0.12."""
    top = EYE_Z + TOP_K * dist
    bot = EYE_Z - BOT_K * dist
    return 2.0 * (height - bot) / (top - bot) - 1.0


def height_at_ndc(dist, y):
    """The inverse of `ndc_y`."""
    top = EYE_Z + TOP_K * dist
    bot = EYE_Z - BOT_K * dist
    return bot + (y + 1.0) * 0.5 * (top - bot)


# ═════════════════════════════════════════════════════════════════════════════
# THE RIG KEEP-CLEAR — measured off the machines that actually stand here
#
# `data.js` sends nine different rigs to this archetype and they differ by an
# order of magnitude in plan.  Measured with `node tools/glbinfo.mjs` on
# 2026-09-06 (ONE ruler, ASTRA §5):
#
#     oil-derrick.glb   W 19.192 x H 67.706 x L 24.798 m
#                       bounds x -9.596..9.596  y -0.300..67.406  z -14.364..10.434
#     rc-rig.glb        W  7.883 x H  7.215 x L  7.608 m
#
# `rigFactory.js` anchors a rig to `ctx.terrain.collarPosition`, which is the
# collar at (0, 0, 0) — so the derrick's plan rectangle sits about the site
# origin.  In Blender axes (three.js z -> Blender -y) that is
# x -9.60..9.60, y -10.43..14.36.  Everything authored here clears that
# rectangle with a margin, checked by assertion in `build()`.
#
# The margin is NOT SOURCED — it is the room a crew needs to walk and a truck
# needs to turn, and no figure for it was found.
# ═════════════════════════════════════════════════════════════════════════════
RIG_X = 11.5                        # NOT SOURCED margin on a measured 9.596
RIG_Y_NEAR = -12.6                  # NOT SOURCED margin on a measured -10.434
RIG_Y_FAR = 16.6                    # NOT SOURCED margin on a measured 14.364


def clears_rig(x, y):
    return abs(x) > RIG_X or y < RIG_Y_NEAR or y > RIG_Y_FAR


# ═════════════════════════════════════════════════════════════════════════════
# THE PAD
# ═════════════════════════════════════════════════════════════════════════════

# AREA — three sourced figures, and they do not agree, because they are three
# different regimes.  All three are printed rather than averaged:
#
#   [WITTIG] slide 19   min ~3 000 m2, up to 10 000 m2 (1 ha)
#                       German regulated land well site
#   [DOE-SHALE] p.47    2.0 acres = 8 094 m2   shallow VERTICAL well pad
#                       3.5 acres = 14 164 m2  horizontal well pad
#                       +0.5 acre per additional well on the pad
#   [USGS-OFR2012] T.1  2.9 - 3.0 ha = 29 000 - 30 000 m2, MEASURED off 1 m
#                       aerial imagery across 380 Marcellus sites, pad only
#
# WHY THE SMALLEST ONE IS USED, AND IT IS NOT AN AESTHETIC CHOICE.
# `src/world/terrain.js` `CFG.groundSize` is 150, so the ground mesh is
# +/- 75 m about the collar and there is nothing beyond it.  A 3 ha pad is
# ~173 m square; its far edge would be 100 m out, off the end of the world.
# The [WITTIG] band is also the only one of the three that covers a shallow
# water or geothermal well, and six of the seven methods on this archetype are
# exactly that.  So the modelled pad sits at the [WITTIG] end and the file says
# so rather than implying it is a US oilfield pad drawn small.
PAD_AREA_MIN = 3000.0               # m2  [WITTIG] slide 19

# SHAPE AND WHERE THE COLLAR SITS IN IT — **NOT SOURCED**.
# Every source above reports AREA and none reports a length by a width;
# [WITTIG] slide 21, which shows the shape, is stamped "Zeichnung nicht
# massstabsgerecht" (not to scale).  What IS taken from slide 20 is that the
# wellhead is NOT central: the rig sits toward one side with the racks on one
# hand and the fluid and power rows strung out on the other.
#
# So the rectangle is solved against the frame, the way quarry_bench solves its
# face height, and it wears no citation.  It is laid out on the VIEW axis
# rather than on world axes because a pad is not required to be aligned with
# anything and a view-aligned rectangle is the one a player can read:
#
#     d  -8 .. 52      60 m deep, the near end behind the camera so the player
#                      is standing ON the pad rather than looking at its edge
#     a -26 .. +24     50 m across, the collar 27 m from the screen-left edge
#                      and 23 m from the screen-right edge
#
#     60 x 50 = 3 000 m2 EXACTLY, which is [WITTIG] slide 19's stated minimum
#     and about a third of [DOE-SHALE]'s 2.0-acre shallow vertical pad.
#
# It was 66 x 60 in the first build.  The offline render, looked at, showed why
# that was wrong: the furniture filled about an eighth of it and the rest was an
# empty rectangle, because the mud row, the power row and the camp that fill a
# real pad are all deliberately absent (see WHAT IS DELIBERATELY NOT MODELLED).
# A pad drawn at its sourced MINIMUM is honest about carrying less; a pad drawn
# large and left empty is not.
#
# The extents are ALSO constrained: every edge must fall outside the plan
# rectangle the largest rig on this archetype occupies (see THE RIG KEEP-CLEAR
# above), which in (d, a) spans d -3.32..33.78, a -15.85..20.83.  `PAD_A1` was
# 20.0 in the first pass and the screen-right edge ran straight through the
# derrick's substructure; the build assertion caught it.
#
# The far corner (d 58, a -34) lands at NDC y -0.32, just below the measured
# horizon, so the pad's far edge closes the middle distance without competing
# with the mast.
PAD_D0, PAD_D1 = -8.0, 52.0         # NOT SOURCED — composition, not fact
PAD_A0, PAD_A1 = -26.0, 24.0        # NOT SOURCED — composition, not fact

# PAD LIFT — the height the graded platform stands proud of the country.
# DERIVED from a sourced rule: [GOLDBOOK] p.29 places fill in "approximately
# horizontal layers not more than 8 inches in thickness", so 3 x 8 in is three
# maximum lifts.  **The RULE is sourced; the COUNT of lifts is not** — no
# source found gives a total pad thickness, only a road's surface course.
#
# The permafrost case is the sourced upper bound and is a different number:
# [OTA-NORTHSLOPE] ch.2, "all roads and gravel pads are built about five feet
# thick" (1.524 m) with insulation and geotextile, because thawed permafrost
# has no bearing capacity.  `well-pad` is also the `arctic` archetype so that
# case is real here, but 1.5 m of lift on a Saharan pad would be a lie, and one
# .glb serves both regions.
PAD_LIFT_NORTH_SLOPE = 1.524        # m, 5 ft   [OTA-NORTHSLOPE] ch.2
PAD_LIFT = 3 * 0.2032               # 0.610 m = 3 max lifts  [GOLDBOOK] p.29
PAD_SURFACE_COURSE = 0.1524         # 6 in crushed aggregate [GOLDBOOK] p.25
PAD_BATTER = 3.0                    # 3:1 side slopes    [GOLDBOOK] Fig.3 p.21
PAD_CROWN = 0.03                    # aggregate surface 2-4 % [GOLDBOOK] Fig.3

# THE ACCESS TRACK, fully sourced: [GOLDBOOK] p.25 gives "a 14-foot-wide
# travelway, 2-foot shoulders ... and 6 inches of crushed aggregate".
TRACK_TRAVELWAY = 14 * 0.3048       # 4.267 m   [GOLDBOOK] p.25
TRACK_SHOULDER = 2 * 0.3048         # 0.610 m   [GOLDBOOK] p.25
TRACK_W = TRACK_TRAVELWAY + 2 * TRACK_SHOULDER      # 5.486 m overall

# THE PERIMETER CHANNEL — "Rinne" on [WITTIG] slide 21, running the whole
# boundary, with the "Rueckhaltebecken" (retention basin) outside one corner.
# The FEATURE is sourced; the section is NOT, because slide 21 is not to scale.
CHAN_W = 0.62                       # NOT SOURCED — channel width
CHAN_D = 0.34                       # NOT SOURCED — channel depth
CHAN_WALL = 0.10                    # NOT SOURCED — channel wall thickness

# THE SEALED WORKING AREA — "WGK-Bereich" on [WITTIG] slide 21 and
# "Sealed surfaces for hazardous substances" on slide 19.  Drawn as its KERB
# only: an upstand round the area, so the live terrain and the live collar show
# through it and nothing opaque is laid over the section seam.
KERB_H = 0.14                       # NOT SOURCED — upstand height
KERB_W = 0.22                       # NOT SOURCED — upstand width


def _seg(name, p0, p1, w, h, mat, z0=0.0, sink=0.55, bevel=0.0):
    """A run of section `w` x `h` from Blender point `p0` to `p1`, sunk `sink`
    metres below grade.

    EVERYTHING THAT TOUCHES THE GROUND IN THIS FILE IS SUNK, and that is a
    decision about a dependency this model does not control.  `terrain.js` only
    flattens to `CFG.padRadius` = 8.5 m today; this pad reaches 56 m from the
    collar and needs `flatR` raised (see research/sites/well-pad.md, the
    cross-file request).  Until that lands the ground under the far edge moves,
    and a kerb that floats reads as a bug while a kerb that is buried a little
    deeper reads as nothing at all.  So the failure is made silent in the safe
    direction on purpose.
    """
    x0, y0 = p0
    x1, y1 = p1
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy)
    return S.box(name, (length, w, h + sink), mat,
                 loc=((x0 + x1) * 0.5, (y0 + y1) * 0.5, z0 + h * 0.5 - sink * 0.5),
                 rot=(0.0, 0.0, math.atan2(dy, dx)), bevel=bevel)


def build_pad():
    """The platform: shoulder, perimeter channel, retention basin, one access.

    [WITTIG] slide 21 is the arrangement — a channel round the whole boundary
    falling to a basin outside one corner, and a single Zu-/Abfahrt.  §A.13's
    photograph brief is the other half: *"A single graded track running dead
    straight to the pad across a featureless plain."*
    """
    corners = [(PAD_D0, PAD_A0), (PAD_D1, PAD_A0), (PAD_D1, PAD_A1), (PAD_D0, PAD_A1)]
    pts = [on_axis(d, a) for d, a in corners]

    # ── the shoulder: the battered edge of made ground ──────────────────────
    # Two courses per side, the outer one lower and wider, so the edge reads as
    # a slope rather than as a wall.  §A.15's photograph, [I]: "a raised gravel
    # island with visibly battered side slopes ... everything sharply
    # rectangular against organic tundra".  The silhouette is the point.
    for i in range(4):
        p0, p1 = pts[i], pts[(i + 1) % 4]
        _seg('pad-shoulder-%d' % i, p0, p1, 2.10, PAD_LIFT, S.MAT_GRAVEL, sink=1.4)
        # The outer toe, offset outward along the edge's own normal.
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]
        n = math.hypot(dx, dy)
        nx, ny = -dy / n, dx / n
        off = (PAD_LIFT * PAD_BATTER) * 0.5 + 1.05
        # Corners run clockwise in (d, a); the outward normal is the one that
        # points away from the pad centre, tested rather than assumed.
        cx, cy = on_axis((PAD_D0 + PAD_D1) * 0.5, (PAD_A0 + PAD_A1) * 0.5)
        mx, my = (p0[0] + p1[0]) * 0.5, (p0[1] + p1[1]) * 0.5
        if (mx + nx - cx) ** 2 + (my + ny - cy) ** 2 < (mx - cx) ** 2 + (my - cy) ** 2:
            nx, ny = -nx, -ny
        _seg('pad-toe-%d' % i, (p0[0] + nx * off, p0[1] + ny * off),
             (p1[0] + nx * off, p1[1] + ny * off),
             PAD_LIFT * PAD_BATTER, PAD_LIFT * 0.42, S.MAT_GRAVEL, sink=1.2)

    # ── the channel: "Rinne", the whole perimeter, inboard of the shoulder ──
    # Drawn as its two walls and its invert, so it is a real open channel with a
    # section rather than a painted line.  Cost is boxes in two materials that
    # the rest of the pad already pays for.
    for i in range(4):
        p0, p1 = pts[i], pts[(i + 1) % 4]
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]
        n = math.hypot(dx, dy)
        nx, ny = -dy / n, dx / n
        cx, cy = on_axis((PAD_D0 + PAD_D1) * 0.5, (PAD_A0 + PAD_A1) * 0.5)
        mx, my = (p0[0] + p1[0]) * 0.5, (p0[1] + p1[1]) * 0.5
        if (mx + nx - cx) ** 2 + (my + ny - cy) ** 2 > (mx - cx) ** 2 + (my - cy) ** 2:
            nx, ny = -nx, -ny            # inward
        base = 1.9
        for side, tag in ((-1, 'out'), (1, 'in')):
            o = base + side * (CHAN_W * 0.5 + CHAN_WALL * 0.5)
            _seg('pad-channel-%s-%d' % (tag, i),
                 (p0[0] + nx * o, p0[1] + ny * o), (p1[0] + nx * o, p1[1] + ny * o),
                 CHAN_WALL, 0.05, S.MAT_CONCRETE, z0=-0.02, sink=CHAN_D + 0.30)
        _seg('pad-channel-invert-%d' % i,
             (p0[0] + nx * base, p0[1] + ny * base), (p1[0] + nx * base, p1[1] + ny * base),
             CHAN_W, 0.02, S.MAT_GRAVEL, z0=-CHAN_D, sink=0.25)

    # ── the retention basin: "Rueckhaltebecken", outside the pad ────────────
    # [WITTIG] slide 21 puts it OUTSIDE the pad boundary, fed by the perimeter
    # channel.  §A.13 on the desert case: lined evaporation pits are "the
    # site's most distinctive object", read as "a geometric bright rectangle".
    #
    # PLAN SIZE **NOT SOURCED** — slide 21 is not to scale and no figure for a
    # drill-site retention basin was found anywhere in the pack or the 2026-09
    # research pass.  DEPTH AND SECTION ARE SOURCED, from the [GOLDBOOK] pit
    # rules (pp.16-17), and they are the reason this is a basin and not a
    # rectangle scratched in the dirt:
    #   · "at least 50 percent of the reserve pit should be constructed below
    #     original ground level"    -> this one is 100 % below grade
    #   · "at least 2 feet of freeboard" (0.610 m) -> the lap sits that far
    #     above the modelled fluid line, which is why the liner is visible
    #   · the dike keyway or core trench "excavated to a minimum depth of
    #     2 to 3 feet below the original ground level" -> the perimeter dike
    #     is keyed 0.610 m in, not stood on the surface
    #   · a synthetic liner has a "minimum thickness of 12 mils" = 0.305 mm.
    #     THE LINER IS DRAWN AT 50 mm AND THAT IS NOT ITS THICKNESS.  A 0.3 mm
    #     sheet at 60 m is far under a pixel and would read as noise, not as
    #     detail (the same call quarry_bench.py makes about conveyor skirting).
    #     The sourced figure is recorded here; the drawn figure is legibility.
    BASIN_FREEBOARD = 2 * 0.3048    # 0.610 m  [GOLDBOOK] p.16
    BASIN_KEYWAY = 2 * 0.3048       # 0.610 m  [GOLDBOOK] p.17, the minimum
    bd, ba = PAD_D1 + 8.0, -12.6     # outside the far boundary [WITTIG] s.21
    bw, bl, bh = 7.6, 11.4, 1.15     # NOT SOURCED plan size and depth
    bx0, by0 = on_axis(bd, ba)
    yaw = math.atan2(AXIS[1], AXIS[0])
    S.box('basin-liner-floor', (bl, bw, 0.06), S.MAT_PLASTIC,
          loc=(bx0, by0, -bh + 0.03), rot=(0, 0, yaw))
    for sgn in (-1, 1):
        S.box('basin-liner-long', (bl, 0.06, bh), S.MAT_PLASTIC,
              loc=(bx0 - math.sin(yaw) * sgn * bw * 0.5,
                   by0 + math.cos(yaw) * sgn * bw * 0.5, -bh * 0.5), rot=(0, 0, yaw))
        S.box('basin-liner-end', (0.06, bw, bh), S.MAT_PLASTIC,
              loc=(bx0 + math.cos(yaw) * sgn * bl * 0.5,
                   by0 + math.sin(yaw) * sgn * bl * 0.5, -bh * 0.5), rot=(0, 0, yaw))
        # The spoil ridge the excavation threw up, on both long sides.
        # §A.14's photograph: "a mud pit scraped straight into the dirt with a
        # spoil ridge".
        S.rubble('basin-spoil-%d' % sgn,
                 (bx0 - math.sin(yaw) * sgn * (bw * 0.5 + 1.5),
                  by0 + math.cos(yaw) * sgn * (bw * 0.5 + 1.5), 0.16),
                 (bl * 0.94, 1.9, 0.62), S.MAT_GRAVEL,
                 block=0.75, seed=311.0 + sgn * 7, yaw=yaw)
        # Kerb round the basin so nothing walks into it.
        _seg('basin-kerb-%d' % sgn,
             on_axis(bd - bl * 0.5 / 1.0, ba + sgn * (bw * 0.5 + 0.9)),
             on_axis(bd + bl * 0.5 / 1.0, ba + sgn * (bw * 0.5 + 0.9)),
             KERB_W, KERB_H, S.MAT_CONCRETE, sink=0.35)

    # ── THE COLLECTOR CHANNEL, and why it runs the way it does ─────────────
    # [GOLDBOOK] p.16 states the pad's drainage design outright, and it is an
    # ASYMMETRY, not a uniform fall: *"The area of the well pad where the
    # drilling rig substructure is located should be level and capable of
    # supporting the rig...  The area used for mud tanks, generators, mud
    # storage, and fuel tanks should be at a slight slope, where possible... to
    # provide surface drainage from the work area to the pit."*
    #
    # So the rig stands on the level and the STORES side falls away, and this
    # channel is the line that fall runs to: from the stores and containment
    # side of the pad, out through the perimeter channel, to the retention
    # basin.  [GOLDBOOK] Fig.3 gives the fall on an aggregate surface as
    # 2-4 %; PAD_CROWN is 3 %, the middle of that band, and the invert drops at
    # that rate along the run so the channel visibly falls rather than sitting
    # level in a rendering of a drainage feature.
    #
    # THE SEALED-AREA KERB IS NOT DRAWN, AND THAT IS A "CANNOT YET".
    # [WITTIG] slide 21's "WGK-Bereich" is a SURFACING distinction — hatching
    # on a plan — not an upstand, and the honest way to show it is a different
    # ground material, which a site .glb may not do over the live collar and
    # the section seam.  Drawn as a kerb instead it would have to pass under
    # the derrick's substructure: the first build put one at a = -13.5 and the
    # keep-clear assertion in build() caught it crossing the rig.  So it is
    # left out and recorded in research/sites/well-pad.md rather than faked.
    run = [(44.0, -13.8), (50.0, -13.4), (56.0, -13.0), (PAD_D1 + 8.0, -12.6)]
    for i in range(len(run) - 1):
        d0, a0 = run[i]
        d1, a1 = run[i + 1]
        z = -0.18 - (d0 - run[0][0]) * PAD_CROWN * 0.34
        for sgn in (-1, 1):
            _seg('collector-wall-%d-%d' % (i, sgn),
                 on_axis(d0, a0 + sgn * 0.42), on_axis(d1, a1 + sgn * 0.42),
                 CHAN_WALL, 0.06, S.MAT_CONCRETE, z0=z, sink=CHAN_D + 0.25)
        _seg('collector-invert-%d' % i, on_axis(d0, a0), on_axis(d1, a1),
             0.74, 0.02, S.MAT_GRAVEL, z0=z - CHAN_D, sink=0.22)

    # ── the access: one Zu-/Abfahrt, and the track running away from it ─────
    # [WITTIG] slide 21 shows a single access and egress at one boundary.
    # The TRACK is fully sourced: [GOLDBOOK] p.25's example design standard is
    # "a 14-foot-wide travelway, 2-foot shoulders ... and 6 inches of crushed
    # aggregate", so TRACK_W = 4.267 + 2 x 0.610 = 5.486 m and the surface
    # course is 152 mm.  §A.13, [I]: "a single graded track running dead
    # straight to the pad across a featureless plain".  The GATE is
    # **NOT SOURCED** — [WITTIG] slide 19 requires "fixed fencing" and slide 21
    # marks the access, but neither gives an opening width and no fence is
    # drawn here (see WHAT IS DELIBERATELY NOT MODELLED).
    gd, ga = PAD_D1 - 0.4, PAD_A1 - 9.0
    gate_half = TRACK_TRAVELWAY * 0.5        # the opening is the travelway
    for sgn in (-1, 1):
        px, py = on_axis(gd, ga + sgn * gate_half)
        S.tube('gate-post-%d' % sgn, 0.09, 2.35, S.MAT_DARK, loc=(px, py, -0.55), sides=8)
        S.box('gate-leaf-%d' % sgn, (0.07, gate_half * 0.92, 1.55), S.MAT_DARK,
              loc=(px - math.sin(yaw) * sgn * gate_half * 0.46,
                   py + math.cos(yaw) * sgn * gate_half * 0.46, 0.86),
              rot=(0, 0, yaw), bevel=0.012)
    # FIVE segments, not seven, and the count is a measured constraint rather
    # than a taste: `CFG.groundSize` is 150, so the ground mesh ends 75 m from
    # the collar.  The first pass ran seven and `glbinfo` measured the model
    # reaching z -76.761 — the track's far end was hanging off the end of the
    # world.  This ends at 66.8 m.
    for k in range(5):
        td = PAD_D1 + 2.2 + k * 5.2
        ta = ga + k * 1.35
        tx, ty = on_axis(td, ta)
        S.box('access-track-%d' % k, (5.4, TRACK_W, PAD_SURFACE_COURSE),
              loc=(tx, ty, -0.34), rot=(0, 0, yaw + 0.11 * k), bevel=0.03)


# ═════════════════════════════════════════════════════════════════════════════
# THE RACKS — "Rohrlager", the temporary hazard area on [WITTIG] slide 21
# ═════════════════════════════════════════════════════════════════════════════

# WHAT IS RACKED, AND WHY IT IS CASING RATHER THAN DRILL PIPE.
# The seven methods on this archetype run rods between 1.0 m and 27 m long
# (`data.js` `rodLength`: auger 1.5, site-investigation 1.0, overburden 3,
# dth 6, oil-rotary 27), and `cable-tool` has `hasDrillString: false`.  There is
# no rod length that is honest for all of them, so no drill string is racked.
#
# CASING is.  `research/06` §E.5, from [NB16]: on a water well, "steel casing in
# 139.7 / 168.3 / 193.7 mm racked alongside" — the source says racked, in those
# words, in those diameters.  [HELP-BOQ] gives the other product on the same
# rack: uPVC 5 in screens in 3 m lengths, 18 m of screen and 62 m of plain
# casing.  `overburden` and `sonic` both carry a `casing` tool slot in data.js,
# and every well of any kind is cased.
CASING_OD = 0.1683                  # m, 168.3 mm  [NB16] via research/06 §E.5
UPVC_OD = 0.127                     # m, 5 in      [HELP-BOQ]
UPVC_LEN = 3.0                      # m            [HELP-BOQ]

# THE RACK ITSELF — sourced, and it changed what gets built.
# [SLB-RACK] https://glossary.slb.com/en/terms/p/pipe_rack, verbatim: pipe
# racks are *"two elevated truss-like structures having triangular cross
# sections"*, positioned approximately **"20 ft [6 m] apart"**, with wooden
# tops for protection and *"wooden sills ... placed between the layers of pipe
# to prevent damage"*; onshore racks have *"few stacked layers and instead
# extends laterally"*, where offshore racks are narrow and deeply stacked.
#
# Four things follow and all four are drawn:
#   · TWO rack lines, not three.
#   · 6.0 m apart.  SOURCED.
#   · a TRIANGULAR truss section, not a plain beam.
#   · FEW TIERS, WIDE.  The first pass stacked three tiers of seven; this is
#     two tiers of nine, which is what the source describes.
# The sills are drawn in `paintedDark` and the source says WOOD.  `timber` is a
# real kind in assets.js and it would be a SEVENTH material against a budget of
# six (blender/lib/site.py), so the shape is right and the surface is not.
# That is a stated trade, not an oversight.
RACK_SPACING = 6.0                  # m, "20 ft [6 m] apart"   [SLB-RACK]
RACK_N = 2                          # "two elevated ... structures" [SLB-RACK]
RACK_TIERS = 2                      # "few stacked layers"     [SLB-RACK]
BEARER_H = 0.44                     # NOT SOURCED — "elevated", no figure given
BEARER_W = 0.26                     # NOT SOURCED — truss chord section

# STICK LENGTH — **NOT SOURCED**, and DERIVED FROM THE SOURCED SPACING rather
# than invented independently.  Nothing in the pack or the 2026-09 research
# pass gives a casing stick length for a water or geothermal well.  What is
# sourced is that the two racks stand 6.0 m apart, so a stick they carry with
# equal overhang is longer than 6.0 m; 9.0 m is that, and it happens to fall
# inside the API Range 2 band of 27-31 ft (8.23-9.45 m) which
# [DRILLMAN] https://www.drillingmanual.com/determining-drill-pipes-lengths-on/
# gives for DRILL PIPE.  **Range 2 is a drill-pipe range and this is casing:
# the coincidence is noted, not claimed as the source.**
CASING_LEN = 9.0                    # NOT SOURCED — derived from RACK_SPACING


def build_racks():
    """Two rack bays at the pad edge, screen-left: steel casing on one,
    uPVC casing and screen on the other, with the gravel-pack bags beside them.

    This is where `finish()`'s join by material earns its place (rig.py
    contract 3): the steel rack alone is 2 trusses, 6 chords, 4 stops and 17
    sticks, and unjoined that is 29 draw calls for one object.  Joined it is
    part of `rawSteel`'s single call and costs only triangles.
    """
    yaw = math.atan2(AXIS[1], AXIS[0])

    def bay(tag, d0, a0, od, stick, rows, tiers, mat, seed, spacing):
        """One rack: `RACK_N` triangular trusses `spacing` apart across the
        sticks, sticks lying along the view axis so the player reads their
        length rather than their end."""
        width = rows * od * 1.28 + 0.7
        for b in range(RACK_N):
            bd = d0 + (b - (RACK_N - 1) * 0.5) * spacing
            bx, by = on_axis(bd, a0)
            # The truss: two bottom chords apart and one top chord over them —
            # the triangular cross section the source specifies, at the cost of
            # two extra boxes in a material already paid for.
            for c, off in ((0, -0.24), (1, 0.24)):
                cx, cy = on_axis(bd + off, a0)
                S.box('%s-truss-bot-%d-%d' % (tag, b, c),
                      (BEARER_W * 0.7, width, BEARER_W * 0.7 + 0.5), S.MAT_STEEL,
                      loc=(cx, cy, BEARER_W * 0.35 - 0.25), rot=(0, 0, yaw), bevel=0.010)
            S.box('%s-truss-top-%d' % (tag, b), (BEARER_W * 0.8, width, BEARER_W * 0.8),
                  S.MAT_STEEL, loc=(bx, by, BEARER_H), rot=(0, 0, yaw), bevel=0.010)
            for w in range(5):
                wa = a0 + (w - 2) * width / 5.0
                wx, wy = on_axis(bd, wa)
                for sgn in (-1, 1):
                    S.box('%s-truss-web-%d-%d-%d' % (tag, b, w, sgn),
                          (0.09, 0.09, BEARER_H * 1.06), S.MAT_STEEL,
                          loc=(wx + math.cos(yaw) * sgn * 0.12,
                               wy + math.sin(yaw) * sgn * 0.12, BEARER_H * 0.5),
                          rot=(0.0, sgn * 0.28, yaw))
            # Founded, not floating.  Founding detail NOT SOURCED.
            S.box('%s-plinth-%d' % (tag, b), (0.62, width + 0.4, 0.30),
                  S.MAT_CONCRETE, loc=(bx, by, -0.20), rot=(0, 0, yaw))
        span = (RACK_N - 1) * spacing
        # The end stops that keep a stick from rolling off the rack.
        for sgn in (-1, 1):
            for b in range(RACK_N):
                bd = d0 + (b - (RACK_N - 1) * 0.5) * spacing
                sx, sy = on_axis(bd, a0 + sgn * (rows * od * 1.28 * 0.5 + 0.34))
                S.tube('%s-stop-%d-%d' % (tag, b, sgn), 0.05, BEARER_H + 0.75,
                       S.MAT_STEEL, loc=(sx, sy, -0.25), sides=7)
        for t in range(tiers):
            n = rows - t * 2
            # The sills between the layers, which the source calls for by name.
            if t > 0:
                for b in range(RACK_N):
                    bd = d0 + (b - (RACK_N - 1) * 0.5) * spacing
                    bx, by = on_axis(bd, a0)
                    S.box('%s-sill-%d-%d' % (tag, t, b),
                          (0.10, n * od * 1.28 + 0.2, 0.06), S.MAT_DARK,
                          loc=(bx, by, BEARER_H + od * (t * 1.02) + 0.03), rot=(0, 0, yaw))
            for r in range(n):
                a = a0 + (r - (n - 1) * 0.5) * od * 1.28
                z = BEARER_H + od * (0.5 + t * 1.02) + t * 0.06
                px, py = on_axis(d0 + S.jitter(0.10, r, t, seed), a)
                S.tube('%s-stick-%d-%d' % (tag, t, r), od * 0.5, stick, mat,
                       loc=(px + math.cos(yaw) * stick * 0.5,
                            py + math.sin(yaw) * stick * 0.5, z),
                       rot=(0.0, math.pi * 0.5, yaw + math.pi), sides=10)

    # Steel casing on the sourced 6.0 m rack spacing.  Screen-left at mid
    # depth; every vertex checked against the rig keep-clear in build().
    bay('rack-steel', 31.0, -7.4, CASING_OD, CASING_LEN, 9, RACK_TIERS,
        S.MAT_STEEL, 11.0, RACK_SPACING)
    # uPVC casing and screen in 3 m sticks [HELP-BOQ].  §A.14's photograph,
    # [I]: "casing and screen in 3 m sticks stacked flat on the sand,
    # threaded, blue-white uPVC ... a bright man-made colour block on an
    # otherwise dun site".  Its rack spacing is **NOT SOURCED** — [SLB-RACK]'s
    # 6 m is a drill-pipe pipe-rack figure and 3 m sticks cannot span it.
    bay('rack-upvc', 35.0, -10.0, UPVC_OD, UPVC_LEN, 8, RACK_TIERS,
        S.MAT_PLASTIC, 23.0, 2.0)

    # The gravel pack that goes down the annulus with the screen.
    # [HELP-BOQ]: "35 x 50 kg bags of 2-6 mm gravel".  Thirty-five bags,
    # because the tender counts them; bag size NOT SOURCED.
    for i in range(35):
        layer, k = i // 12, i % 12
        bxp, byp = on_axis(39.0 + (k % 4 - 1.5) * 0.40 + S.jitter(0.03, i, 3),
                           -11.5 + (k // 4 - 1) * 0.44 + S.jitter(0.03, i, 5))
        S.box('pack-bag-%d' % i, (0.44, 0.32, 0.14), S.MAT_PLASTIC,
              loc=(bxp, byp, 0.09 + layer * 0.13),
              rot=(0, 0, yaw + S.jitter(0.16, i, 7)), bevel=0.03)
    px, py = on_axis(39.0, -11.5)
    S.box('pack-pallet', (1.9, 1.6, 0.16), S.MAT_DARK, loc=(px, py, -0.02), rot=(0, 0, yaw))


# ═════════════════════════════════════════════════════════════════════════════
# WATER, CONTAINMENT AND STORES
# ═════════════════════════════════════════════════════════════════════════════

# THE WATER TANK.  [WITTIG] slide 19 lists "Water supply" as a requirement of
# the regulated site; [KGS-PRIMER] has "water and fuel tanks filled" as a
# rig-up step; every one of the seven methods needs water on the pad even when
# it is not the flush (`research/06` §E.5: an air DTH well injects water and
# foam for dust suppression and hole cleaning).
#
# SIZE — SOURCED, off a manufacturer's spec page for a 500 bbl rectangular
# skid tank, [TANK500]
# https://matarbinfraih.com/products/500-bbl-rectangle-storage-tank/ :
#     overall length      12 000 mm
#     overall width        2 720 mm
#     overall height       3 350 mm  (handrails folded, i.e. the road envelope)
#     internal           10 700 x 2 700 x 2 820 mm (sloped floor, average)
#     actual volume      81 469 litres = 512 bbl
#     roof hatch         1 no., 600 x 600 mm
#     piping             one 4 in fill; four 3 in circulation; one 6 in
#                        discharge manifold with three 6 in butterfly valves
# Cross-check on the class, [SLB-PIT] https://glossary.slb.com/en/terms/m/mud_pit :
# land rigs use rectangular steel tanks "with partitions, each holding
# approximately 200 barrels".  The marque is NOT exported — DOMAIN.md §10 —
# and no name, plate or decal on this tank carries one.
TANK_L = 12.00                      # m  [TANK500] overall length
TANK_W = 2.72                       # m  [TANK500] overall width
TANK_H = 3.35                       # m  [TANK500] overall height, rails folded
TANK_HATCH = 0.60                   # m  [TANK500] 600 x 600 roof hatch


def build_water():
    """The water supply: one 500 bbl rectangular steel skid tank, its hatch,
    its 6 in discharge manifold and the delivery hose off it."""
    yaw = math.atan2(AXIS[1], AXIS[0])
    d, a = 40.0, 8.8
    x, y = on_axis(d, a)
    body_h = TANK_H - 0.42          # the skid takes the rest of the envelope
    S.box('water-tank', (TANK_L, TANK_W, body_h), S.MAT_PAINT,
          loc=(x, y, 0.42 + body_h * 0.5), rot=(0, 0, yaw), bevel=0.03)
    S.box('water-skid', (TANK_L + 0.30, TANK_W + 0.34, 0.42), S.MAT_DARK,
          loc=(x, y, 0.06), rot=(0, 0, yaw), bevel=0.02)
    for k in (-1, -0.34, 0.34, 1):
        sx, sy = on_axis(d + k * TANK_L * 0.42, a)
        S.box('water-rib-%.2f' % k, (0.10, TANK_W + 0.06, body_h * 0.92),
              S.MAT_PAINT, loc=(sx, sy, 0.42 + body_h * 0.5), rot=(0, 0, yaw))
    # The roof hatch, at its sourced 600 x 600.
    hx, hy = on_axis(d + TANK_L * 0.30, a)
    S.box('water-hatch', (TANK_HATCH, TANK_HATCH, 0.12), S.MAT_STEEL,
          loc=(hx, hy, TANK_H - 0.36), rot=(0, 0, yaw), bevel=0.02)
    # Handrail round the top; the sourced height is the FOLDED envelope, so the
    # rail is drawn standing, above it.  Rail height NOT SOURCED.
    for sgn in (-1, 1):
        for k in range(4):
            rx, ry = on_axis(d + (k - 1.5) * TANK_L * 0.28, a + sgn * TANK_W * 0.5)
            S.tube('water-stanchion-%d-%d' % (sgn, k), 0.016, 1.05, S.MAT_STEEL,
                   loc=(rx, ry, TANK_H - 0.42), sides=6)
        _seg('water-rail-%d' % sgn,
             on_axis(d - TANK_L * 0.46, a + sgn * TANK_W * 0.5),
             on_axis(d + TANK_L * 0.46, a + sgn * TANK_W * 0.5),
             0.036, 0.036, S.MAT_STEEL, z0=TANK_H + 0.60, sink=0.0)
    # The 6 in discharge manifold and its three butterfly valves, on the end
    # nearest the work.  All four figures are [TANK500]'s.
    ex, ey = on_axis(d - TANK_L * 0.5 - 0.20, a)
    S.tube('water-manifold', 0.0762, TANK_W * 0.86, S.MAT_STEEL,
           loc=(ex - math.sin(yaw) * TANK_W * 0.43, ey + math.cos(yaw) * TANK_W * 0.43, 0.62),
           rot=(-math.pi * 0.5, 0.0, yaw), sides=10)
    for k in (-1, 0, 1):
        vx, vy = on_axis(d - TANK_L * 0.5 - 0.20, a + k * TANK_W * 0.30)
        S.tube('water-valve-%d' % k, 0.105, 0.16, S.MAT_STEEL,
               loc=(vx - math.cos(yaw) * 0.10, vy - math.sin(yaw) * 0.10, 0.62),
               rot=(0.0, math.pi * 0.5, yaw + math.pi), sides=10)
        S.box('water-handle-%d' % k, (0.05, 0.05, 0.34), S.MAT_STEEL,
              loc=(vx - math.cos(yaw) * 0.24, vy - math.sin(yaw) * 0.24, 0.80), rot=(0, 0, yaw))
    # The 4 in fill on the roof.
    fx, fy = on_axis(d - TANK_L * 0.34, a + TANK_W * 0.28)
    S.tube('water-fill', 0.0508, 0.34, S.MAT_STEEL, loc=(fx, fy, TANK_H - 0.42), sides=8)
    # The delivery hose off the manifold, drooping to the ground and running
    # toward the work.  It stops well clear of the rig keep-clear rectangle.
    S.hose('water-hose',
           [(ex - math.cos(yaw) * 0.34, ey - math.sin(yaw) * 0.34, 0.60),
            on_axis(d - TANK_L * 0.5 - 2.4, a - 1.6) + (0.09,),
            on_axis(34.0, 6.0) + (0.06,),
            on_axis(31.0, 3.0) + (0.06,)],
           radius=0.045, mat=S.MAT_PLASTIC, sides=6)
    # A caged ladder up the end to the hatch.
    for sgn in (-1, 1):
        px, py = on_axis(d + TANK_L * 0.5 + 0.16, a + sgn * 0.24)
        S.tube('water-ladder-%d' % sgn, 0.022, TANK_H + 0.30, S.MAT_STEEL,
               loc=(px, py, 0.0), sides=6)
    lx, ly = on_axis(d + TANK_L * 0.5 + 0.16, a)
    for r in range(11):
        S.tube('water-rung-%d' % r, 0.016, 0.48, S.MAT_STEEL,
               loc=(lx - math.sin(yaw) * 0.24, ly + math.cos(yaw) * 0.24, 0.28 + r * 0.30),
               rot=(0.0, math.pi * 0.5, yaw), sides=5)


# THE LIGHT TOWER — the one piece of plant on this pad whose every dimension is
# a manufacturer's, [ALLMAND]
# https://www.allmand.com/products/light-towers/night-lite-pro-ii-v-series/ :
#     mast height, raised            319 in = 8 108 mm
#     transport length               120 in = 3 043 mm
#     transport width                 51 in = 1 283 mm
#     transport height, mast down    100 in = 2 530 mm
#     width across deployed outriggers 101 in = 2 555 mm
#     lamps                          4 x 350 W LED
# **Its PRESENCE is an inference, not a fact.**  [WITTIG] slide 19 requires
# "Power supply" and nothing in the pack says a light tower is on every
# location.  It is included because it is method-neutral — a hole drilled into
# the dark needs light whatever is pumped down it — and because it is the only
# vertical object on this pad, which the frame needs.  It carries NO
# `cone_deg`/`range_m`, so `src/core/env.js` will never read it as a lamp;
# it is a modelled object, not a light source.
MAST_UP = 8.108                     # m  [ALLMAND]
TOWER_L, TOWER_W, TOWER_H = 3.043, 1.283, 2.530     # m  [ALLMAND]
TOWER_OUTRIGGER = 2.555             # m  [ALLMAND]


def build_lighttower():
    yaw = math.atan2(AXIS[1], AXIS[0])
    d, a = 50.0, 13.5
    x, y = on_axis(d, a)
    S.box('tower-chassis', (TOWER_L, TOWER_W, 0.46), S.MAT_DARK,
          loc=(x, y, 0.38), rot=(0, 0, yaw), bevel=0.03)
    S.box('tower-body', (TOWER_L * 0.62, TOWER_W * 0.92, 1.06), S.MAT_PAINT,
          loc=(x - math.cos(yaw) * TOWER_L * 0.16,
               y - math.sin(yaw) * TOWER_L * 0.16, 1.14), rot=(0, 0, yaw), bevel=0.03)
    for sgn in (-1, 1):
        wx, wy = on_axis(d - TOWER_L * 0.28, a + sgn * TOWER_W * 0.5)
        S.tube('tower-wheel-%d' % sgn, 0.31, 0.20, S.MAT_DARK,
               loc=(wx, wy, 0.31), rot=(0.0, math.pi * 0.5, yaw + math.pi * 0.5), sides=12)
        ox, oy = on_axis(d, a + sgn * TOWER_OUTRIGGER * 0.5)
        S.box('tower-outrigger-%d' % sgn, (0.14, TOWER_OUTRIGGER * 0.5, 0.12),
              S.MAT_STEEL, loc=((x + ox) * 0.5, (y + oy) * 0.5, 0.20), rot=(0, 0, yaw))
        S.tube('tower-foot-%d' % sgn, 0.14, 0.30, S.MAT_STEEL, loc=(ox, oy, -0.10), sides=8)
    # The mast, telescoped up to its sourced 8.108 m, drawn as three stages.
    for st, (r, z0, ln) in enumerate(((0.115, 0.60, 3.2), (0.092, 3.60, 2.6), (0.070, 6.10, 2.0))):
        S.tube('tower-mast-%d' % st, r, ln, S.MAT_DARK, loc=(x, y, z0), sides=8)
    S.box('tower-head', (1.62, 0.16, 0.10), S.MAT_DARK,
          loc=(x, y, MAST_UP - 0.18), rot=(0, 0, yaw))
    for k in (-1, 1):
        for j in (-1, 1):
            hx, hy = on_axis(d + k * 0.62, a + j * 0.30)
            S.box('tower-lamp-%d-%d' % (k, j), (0.44, 0.30, 0.16), S.MAT_STEEL,
                  loc=(hx, hy, MAST_UP - 0.34), rot=(0.0, 0.42, yaw), bevel=0.02)
    S.hose('tower-cable', [(x + math.cos(yaw) * 0.10, y + math.sin(yaw) * 0.10, MAST_UP - 0.30),
                           (x + math.cos(yaw) * 0.34, y + math.sin(yaw) * 0.34, 4.2),
                           (x + math.cos(yaw) * 0.16, y + math.sin(yaw) * 0.16, 1.5)],
           radius=0.016, mat=S.MAT_DARK, sides=5)


def build_containment():
    """The lined containment pit, the cuttings skips and the bunded fuel and
    oil store.

    ONE ANSWER, NOT BOTH.  §A.13's photograph brief is explicit that a location
    shows *"cuttings skips and an auger from the shaker house (closed loop) OR
    an earthen pit with a flare pit outboard of the mud tanks — one or the
    other, never both."*  [SCDT-CLOSED] describes the closed-loop spread as
    steel tanks and **cuttings boxes for haul-off**; [SCDT-DESERT] describes the
    open one as **lined evaporation pits**.

    This pad is drawn as the LINED, CONTAINED case throughout: a lined pit, a
    lined retention basin (build_pad) and skips for haul-off, with no earthen
    pit anywhere.  That is a single regulatory regime stated once, which is what
    the source says a real site reads as.  The pit here is small and it is the
    settling and containment pit that any flush — water, mud or the wet returns
    an air hole makes when it strikes water — has to have; it is not a mud
    system and there is no tank farm on this pad.
    """
    yaw = math.atan2(AXIS[1], AXIS[0])

    # ── the lined pit ───────────────────────────────────────────────────────
    # [LONESTAR]: for mud rotary the operator either digs the pit in the ground
    # or uses portable tanks.  PLAN SIZE **NOT SOURCED** — nothing found
    # publishes a typical pit footprint; [WITTIG] slide 20's own cutting tanks
    # run 20 - 46.5 m3, the only volume band found for anything of this
    # function, and this pit is drawn inside it at 6.4 x 3.6 x 1.05 = 24.2 m3.
    # The DIMENSIONS are authored; the VOLUME BAND is not.
    #
    # SECTION AND DETAIL ARE SOURCED, from New Mexico's pit rule
    # [NMAC-PITS] 19.15.17 NMAC — https://www.srca.nm.gov/parts/title19/19.015.0017.html
    # which is the most completely specified pit rule found:
    #   · temporary-pit freeboard "at least two feet" (0.610 m)
    #   · temporary liner "20-mil string reinforced LLDPE or equivalent"
    #     (0.508 mm — SEE THE NOTE ON LINER THICKNESS at the basin: the drawn
    #     50 mm is legibility, not the liner)
    #   · side slopes "no steeper than two horizontal feet to one vertical
    #     foot (2H:1V)"  -> the batter used here
    #   · liner anchor trench "at least 18 inches deep" (0.457 m)  -> the lap
    #     is turned into a trench, which is how a liner is actually held down
    # And its DISTANCE FROM THE RIG is sourced too, from North Dakota
    # [NDAC] 43-02-03-43(1) — https://www.ndlegis.gov/information/acdata/pdf/43-02-03.pdf
    # "all oil wells must be cleaned into a pit or tank, not less than forty
    # feet [12.19 meters] from the derrick floor".  This pit sits 21.8 m from
    # the collar, measured, which clears it.
    PIT_FREEBOARD = 2 * 0.3048          # 0.610 m   [NMAC-PITS] 19.15.17.12.B
    PIT_ANCHOR_TRENCH = 18 * 0.0254     # 0.457 m   [NMAC-PITS] 19.15.17.11.F
    PIT_BATTER = 2.0                    # 2H:1V     [NMAC-PITS] 19.15.17
    PIT_MIN_FROM_FLOOR = 40 * 0.3048    # 12.19 m   [NDAC] 43-02-03-43(1)
    pd, pa = 34.5, -2.5
    pl, pw, ph = 6.4, 3.6, 1.05
    px, py = on_axis(pd, pa)
    if math.hypot(px, py) < PIT_MIN_FROM_FLOOR:
        raise AssertionError('pit is %.2f m from the collar against a sourced '
                             'minimum of %.2f m [NDAC 43-02-03-43(1)]'
                             % (math.hypot(px, py), PIT_MIN_FROM_FLOOR))
    S.box('pit-liner-floor', (pl, pw, 0.05), S.MAT_PLASTIC,
          loc=(px, py, -ph + 0.025), rot=(0, 0, yaw))
    for sgn in (-1, 1):
        S.box('pit-liner-long-%d' % sgn, (pl, 0.05, ph), S.MAT_PLASTIC,
              loc=(px - math.sin(yaw) * sgn * pw * 0.5,
                   py + math.cos(yaw) * sgn * pw * 0.5, -ph * 0.5), rot=(0, 0, yaw))
        S.box('pit-liner-end-%d' % sgn, (0.05, pw, ph), S.MAT_PLASTIC,
              loc=(px + math.cos(yaw) * sgn * pl * 0.5,
                   py + math.sin(yaw) * sgn * pl * 0.5, -ph * 0.5), rot=(0, 0, yaw))
        # The liner turned up over the edge and down into an ANCHOR TRENCH, at
        # [NMAC-PITS]'s sourced 18 inches, which is how a liner is actually
        # held.  A liner drawn as a flat lap on the ground is the tell that
        # somebody modelled the idea of a liner rather than a liner.
        S.box('pit-liner-lap-%d' % sgn, (pl + 0.9, 0.62, 0.04), S.MAT_PLASTIC,
              loc=(px - math.sin(yaw) * sgn * (pw * 0.5 + 0.30),
                   py + math.cos(yaw) * sgn * (pw * 0.5 + 0.30), 0.06), rot=(0, 0, yaw))
        S.box('pit-liner-anchor-%d' % sgn, (pl + 0.9, 0.05, PIT_ANCHOR_TRENCH),
              S.MAT_PLASTIC,
              loc=(px - math.sin(yaw) * sgn * (pw * 0.5 + 0.60),
                   py + math.cos(yaw) * sgn * (pw * 0.5 + 0.60),
                   -PIT_ANCHOR_TRENCH * 0.5), rot=(0, 0, yaw))
        # The excavated batter at the sourced 2H:1V, backed by the kerb.
        S.box('pit-batter-%d' % sgn, (pl + 0.9, ph * PIT_BATTER * 0.42, 0.10),
              S.MAT_GRAVEL,
              loc=(px - math.sin(yaw) * sgn * (pw * 0.5 + ph * PIT_BATTER * 0.24),
                   py + math.cos(yaw) * sgn * (pw * 0.5 + ph * PIT_BATTER * 0.24),
                   -0.06), rot=(0, 0, yaw))
        _seg('pit-kerb-%d' % sgn,
             on_axis(pd - pl * 0.5 - 0.4, pa + sgn * (pw * 0.5 + 1.05)),
             on_axis(pd + pl * 0.5 + 0.4, pa + sgn * (pw * 0.5 + 1.05)),
             KERB_W, KERB_H, S.MAT_CONCRETE, sink=0.35)
    # The launder that brings returns into it, on a low stand.
    # The launder that brings returns in.  It is SHORT on purpose: it points at
    # the hole but stops clear of the rig keep-clear rectangle, because the last
    # few metres of any return line belong to the machine, not to the site.
    lx, ly = on_axis(pd - pl * 0.5 - 1.3, pa)
    S.box('pit-launder', (2.2, 0.46, 0.20), S.MAT_STEEL, loc=(lx, ly, 0.62), rot=(0, 0, yaw))
    for k in (-1, 1):
        sx, sy = on_axis(pd - pl * 0.5 - 1.3 + k * 0.8, pa)
        S.tube('pit-launder-leg-%d' % k, 0.035, 1.0, S.MAT_STEEL, loc=(sx, sy, -0.45), sides=6)

    # ── cuttings skips, for haul-off [SCDT-CLOSED] ─────────────────────────
    # Open roll-off boxes.  New Mexico defines the regime this pad is in:
    # [NMAC-PITS] 19.15.17.7.C, *"closed-loop system means a system that uses
    # above ground steel tanks for the management of drilling fluids"*, and
    # North Dakota effectively mandates it — [NDAC] 43-02-03-19.4, *"Reserve
    # and circulation of mud system through earthen pits are prohibited unless
    # a waiver is granted by the director."*
    #
    # SIZE — a general-waste 20-yard roll-off, [ROLLOFF]
    # https://www.budgetdumpster.com/budget-dumpster-sizes/twenty-yard-dumpster.php
    # *"22 feet long, 7.5 feet wide and 4.5 feet tall"* = 6.706 x 2.286 x
    # 1.372 m.  **That is a waste roll-off, not a purpose-built oilfield
    # cuttings box, and a cuttings-box spec is NOT SOURCED.**  The source page
    # itself warns dimensions "can vary based on your location and the
    # dumpster manufacturer".  Cited for what it is.
    SKIP_L, SKIP_W, SKIP_H = 22 * 0.3048, 7.5 * 0.3048, 4.5 * 0.3048
    for k in range(2):
        sd, sa = 44.0 + k * 4.0, -9.5 - k * 2.0
        sx, sy = on_axis(sd, sa)
        sl, sw, sh = SKIP_L, SKIP_W, SKIP_H
        S.box('skip%d-floor' % k, (sl, sw, 0.12), S.MAT_PAINT,
              loc=(sx, sy, 0.26), rot=(0, 0, yaw), bevel=0.02)
        for sgn in (-1, 1):
            S.box('skip%d-side-%d' % (k, sgn), (sl, 0.07, sh), S.MAT_PAINT,
                  loc=(sx - math.sin(yaw) * sgn * sw * 0.5,
                       sy + math.cos(yaw) * sgn * sw * 0.5, 0.26 + sh * 0.5),
                  rot=(0, 0, yaw), bevel=0.02)
            S.box('skip%d-end-%d' % (k, sgn), (0.08, sw, sh * 0.94),
                  S.MAT_PAINT, loc=(sx + math.cos(yaw) * sgn * sl * 0.5,
                                    sy + math.sin(yaw) * sgn * sl * 0.5, 0.26 + sh * 0.47),
                  rot=(0, 0, yaw), bevel=0.02)
            S.box('skip%d-rim-%d' % (k, sgn), (sl + 0.14, 0.11, 0.10), S.MAT_STEEL,
                  loc=(sx - math.sin(yaw) * sgn * sw * 0.5,
                       sy + math.cos(yaw) * sgn * sw * 0.5, 0.26 + sh),
                  rot=(0, 0, yaw), bevel=0.015)
            S.box('skip%d-runner-%d' % (k, sgn), (sl + 0.5, 0.30, 0.26), S.MAT_DARK,
                  loc=(sx - math.sin(yaw) * sgn * sw * 0.30,
                       sy + math.cos(yaw) * sgn * sw * 0.30, 0.13), rot=(0, 0, yaw))
        # Arisings, only in the first skip: one is filling, one is empty and
        # waiting, which is what a location actually looks like.
        if k == 0:
            S.rubble('skip%d-arisings' % k, (sx, sy, 0.78),
                     (sl * 0.86, sw * 0.78, 0.62), S.MAT_GRAVEL,
                     block=0.42, seed=97.0, yaw=yaw)

    # ── the bunded fuel and oil store: "Diesel- und Oellager" [WITTIG] s.21 ─
    # Slide 19: "Sealed surfaces for hazardous substances" and "Oil separator".
    # Slide 20 dimensions the tank on that plan: **FUEL TANK 30 m3,
    # 11 500 x 2 050 mm**.  That is the one real tank size on the drawing and
    # it is used here for the thing it actually dimensions.
    FUEL_L, FUEL_D = 11.5, 2.05         # m  [WITTIG] slide 20, "FUEL TANK 30 m3"
    fd, fa = 45.0, -4.5
    fx, fy = on_axis(fd, fa)
    S.tube('fuel-tank', FUEL_D * 0.5, FUEL_L, S.MAT_PAINT,
           loc=(fx - math.cos(yaw) * FUEL_L * 0.5, fy - math.sin(yaw) * FUEL_L * 0.5,
                FUEL_D * 0.5 + 0.48),
           rot=(0.0, math.pi * 0.5, yaw), sides=16)
    for k in (-1, 1):
        sx, sy = on_axis(fd + k * FUEL_L * 0.33, fa)
        S.box('fuel-saddle-%d' % k, (0.5, FUEL_D * 0.9, 1.0), S.MAT_DARK,
              loc=(sx, sy, -0.02), rot=(0, 0, yaw), bevel=0.02)
    # THE BUND, and the number that is deliberately absent from it.
    # [CFR-112] 112.9(c)(2) requires containment for "the entire capacity of
    # the largest single container and sufficient freeboard to contain
    # precipitation", by "dikes, berms, or retaining walls sufficiently
    # impervious to contain oil"; North Dakota [NDAC] 43-02-03-49 puts the same
    # rule in dimensional-sounding but still volumetric terms — "Dikes must be
    # of sufficient dimension to contain the total capacity of the largest tank
    # plus one day's fluid throughput."  **Neither gives a height, because the
    # requirement is a VOLUME.**  The familiar "110 % of the largest tank" is an
    # engineering convention and appears nowhere in 40 CFR 112.  So the wall is
    # drawn as a wall, its height is NOT SOURCED, and no percentage and no
    # capacity claim is made anywhere in this file.
    bl2, bw2, bhh = FUEL_L + 2.6, FUEL_D + 3.0, 0.66     # NOT SOURCED height
    for sgn in (-1, 1):
        S.box('fuel-bund-long-%d' % sgn, (bl2, 0.24, bhh + 0.5), S.MAT_CONCRETE,
              loc=(fx - math.sin(yaw) * sgn * bw2 * 0.5,
                   fy + math.cos(yaw) * sgn * bw2 * 0.5, bhh * 0.5 - 0.25),
              rot=(0, 0, yaw), bevel=0.02)
        S.box('fuel-bund-end-%d' % sgn, (0.24, bw2, bhh + 0.5), S.MAT_CONCRETE,
              loc=(fx + math.cos(yaw) * sgn * bl2 * 0.5,
                   fy + math.sin(yaw) * sgn * bl2 * 0.5, bhh * 0.5 - 0.25),
              rot=(0, 0, yaw), bevel=0.02)
    # Drums inside the bund, on a pallet, and the store container beside it.
    for i in range(6):
        dx, dy = on_axis(fd - 4.4 + (i % 3) * 0.68, fa + 1.9 + (i // 3) * 0.68)
        S.tube('oil-drum-%d' % i, 0.29, 0.88, S.MAT_PLASTIC, loc=(dx, dy, 0.10), sides=12)
    cx, cy = on_axis(44.0, 12.0)
    S.box('store-container', (6.06, 2.44, 2.59), S.MAT_PAINT,
          loc=(cx, cy, 1.42), rot=(0, 0, yaw), bevel=0.02)
    for sgn in (-1, 1):
        S.box('store-foot-%d' % sgn, (0.5, 2.44, 0.26), S.MAT_DARK,
              loc=(cx + math.cos(yaw) * sgn * 2.6, cy + math.sin(yaw) * sgn * 2.6, 0.0),
              rot=(0, 0, yaw))
    # Corrugation as geometry, not as a baked map: assets.js makes the surface
    # and a baked map would be discarded and would spend the texture budget.
    for i in range(30):
        u = -2.85 + i * 0.196
        for sgn in (-1, 1):
            S.box('store-rib-%d-%d' % (i, sgn), (0.030, 0.026, 2.24), S.MAT_PAINT,
                  loc=(cx + math.cos(yaw) * u - math.sin(yaw) * sgn * 1.235,
                       cy + math.sin(yaw) * u + math.cos(yaw) * sgn * 1.235, 1.42),
                  rot=(0, 0, yaw))

    # ── cones marking the open pit and the crossing, the one bit of kit that
    #    is on every site in the game's world and needs no source beyond being
    #    a cone.  Size NOT SOURCED.
    for i in range(6):
        t = math.pi * 0.5 + i * math.pi / 5.0      # the half away from the rig
        cd = 34.5 + math.cos(t) * 4.4
        ca = -2.5 + math.sin(t) * 2.6 - 1.6
        ccx, ccy = on_axis(cd, ca)
        S.tube('cone-%d' % i, 0.17, 0.02, S.MAT_PLASTIC, loc=(ccx, ccy, 0.0), sides=8)
        S.tube('cone-body-%d' % i, 0.085, 0.50, S.MAT_PLASTIC, loc=(ccx, ccy, 0.02), sides=8)


# ═════════════════════════════════════════════════════════════════════════════
# NAMED NODES
# ═════════════════════════════════════════════════════════════════════════════

def build_anchors():
    """The nodes the game reads off this site.

    `mount:` is reused rather than a new prefix — `terrain.js` `restoreSiteNames`
    already un-sanitises it and `finish()` already restores its world transform
    after the join.

    ONLY `site-collar` IS PUBLISHED, and that is deliberate.  ASTRA §10's
    second-most-expensive pattern is "a declared contract with no consumer" —
    eight found, one still open.  Nothing in `src/` reads a site node yet, so
    every extra anchor here would be the ninth.  `quarry_bench.py` publishes
    four; this file publishes the one that names the origin contract and no
    more.  The places a consumer would want (`site-rack`, `site-water`,
    `site-pit`, `site-gate`) are listed with their coordinates in
    research/sites/well-pad.md and are one line each the day something reads
    them.  None carries `cone_deg`/`range_m`, so none is read as a lamp.
    """
    S.anchor('site-collar', (0.0, 0.0, 0.0))


# ═════════════════════════════════════════════════════════════════════════════

def build(out_path):
    # ── THE TWO SOURCED FIGURES THE PAD MUST OBEY, CHECKED RATHER THAN QUOTED ──
    # ASTRA §10's second-most-expensive pattern is a declared contract with no
    # consumer: a constant that carries a citation, reads correct, and is never
    # read by anything. `PAD_AREA_MIN` and `PAD_LIFT_NORTH_SLOPE` are exactly
    # that shape, so they are made live here. If someone re-solves the pad
    # against the frame and drops it under [WITTIG]'s regulated minimum, or
    # raises the drawn lift past [OTA-NORTHSLOPE]'s 5 ft, the build stops.
    area = (PAD_D1 - PAD_D0) * (PAD_A1 - PAD_A0)
    if area < PAD_AREA_MIN:
        raise AssertionError(
            'the modelled pad is %.0f m2 against [WITTIG] slide 19\'s stated '
            'minimum of %.0f m2 for a regulated land well site.'
            % (area, PAD_AREA_MIN))
    if PAD_LIFT > PAD_LIFT_NORTH_SLOPE:
        raise AssertionError(
            'PAD_LIFT %.3f m exceeds [OTA-NORTHSLOPE]\'s 5 ft (%.3f m), which '
            'is North Slope PERMAFROST practice and the highest sourced pad '
            'lift there is. A Saharan pad does not stand higher than an Arctic '
            'one.' % (PAD_LIFT, PAD_LIFT_NORTH_SLOPE))
    print('WELL_PAD_AREA %.0f m2 (>= %.0f, [WITTIG] slide 19) · lift %.3f m '
          '(<= %.3f, [OTA-NORTHSLOPE])' % (area, PAD_AREA_MIN, PAD_LIFT,
                                           PAD_LIFT_NORTH_SLOPE))

    S.reset()
    build_pad()
    build_racks()
    build_water()
    build_lighttower()
    build_containment()
    build_anchors()

    # ── VERIFY BY MEASUREMENT, NOT BY THE ABSENCE OF AN ERROR (ASTRA §8) ────
    # Every authored vertex, in world space, after the transforms and before
    # the material join.  Two things are checked and both have been wrong in
    # this pipeline before:
    #   1. nothing is inside the rig keep-clear rectangle;
    #   2. nothing reaches the outer NDC band quarry_bench's edge artefact
    #      lives in.
    # This is a keep-clear assertion on geometry this file authored.  It is not
    # a second dimension tool: `node tools/glbinfo.mjs` remains the one ruler
    # and is what the exported file is measured with (ASTRA §5).
    # The furniture and the PAD BOUNDARY are graded separately, because they
    # are under different rules.  A pad's edge runs across the frame and out of
    # it — that is what an edge does — so it necessarily crosses the outer NDC
    # band.  Everything else must stay inboard of it.
    bpy.context.view_layer.update()
    boundary = ('pad-shoulder', 'pad-toe', 'pad-channel', 'access-track',
                'collector-', 'gate-')
    worst = {'furniture': (0.0, ''), 'boundary': (0.0, '')}
    lo, hi = 1e9, -1e9
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        group = 'boundary' if o.name.startswith(boundary) else 'furniture'
        for v in o.data.vertices:
            p = o.matrix_world @ v.co
            if not clears_rig(p.x, p.y):
                raise AssertionError(
                    'well-pad furniture inside the rig keep-clear rectangle: %s at '
                    '(%.2f, %.2f). The derrick measures x -9.596..9.596, '
                    'y -10.434..14.364 about the collar.' % (o.name, p.x, p.y))
            dx, dy = p.x - EYE[0], p.y - EYE[1]
            dist = dx * AXIS[0] + dy * AXIS[1]
            lo, hi = min(lo, dist), max(hi, dist)
            if dist <= 1.0:
                continue
            ndc = (dx * RIGHT[0] + dy * RIGHT[1]) / half_width(dist)
            if abs(ndc) > abs(worst[group][0]):
                worst[group] = (ndc, o.name)
    if abs(worst['furniture'][0]) > NDC_EDGE:
        raise AssertionError(
            'well-pad furniture reaches NDC x %.3f on %s, outside the %.2f the '
            'quarry-bench edge artefact is mitigated at (see NDC_EDGE).'
            % (worst['furniture'][0], worst['furniture'][1], NDC_EDGE))
    print('WELL_PAD_FRAME furniture_worst_ndc_x=%.3f on %s | boundary_worst_ndc_x'
          '=%.3f on %s | view-axis span %.1f..%.1f m'
          % (worst['furniture'][0], worst['furniture'][1],
             worst['boundary'][0], worst['boundary'][1], lo, hi))

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    return S.finish(out_path)


def preview(path, out_name='well-pad-export.png', hero=False):
    """Re-import the REAL export and render it with Cycles on the CPU.

    The exported file, not a proxy: a render of the scene still in memory would
    prove nothing about what reached the .glb, and this pipeline has already
    shipped six machines that were never once on screen while every log line
    said the build was fine (ASTRA §4.4).

    The lighting, camera and ground plane here are INSPECTION FIXTURES and are
    not in the .glb.  This does not reproduce the game's procedural material
    renderer — every material in the export is a NAME that `assets.js` fills in
    at runtime — so it proves geometry, scale and composition, and nothing about
    colour.  It is an offline Blender render.  It is not a gameplay capture.
    """
    from mathutils import Vector
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)

    # MEASURE THE IMPORTED ORIENTATION, DO NOT ASSUME IT.
    # The first version of this function placed the cameras as if the imported
    # scene were still glTF Y-up, and rendered an empty grey frame with the
    # ground plane standing on edge in the background.  Blender's glTF importer
    # converts back to Z-up, so the imported model is in the SAME frame this
    # module authored it in.  That is now asserted rather than believed: the
    # light tower's mast reaches 8.108 m, so the tallest point must be on +Z.
    hi = Vector((-1e9, -1e9, -1e9))
    lo = Vector((1e9, 1e9, 1e9))
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        for c in o.bound_box:
            p = o.matrix_world @ Vector(c)
            hi = Vector((max(hi[i], p[i]) for i in range(3)))
            lo = Vector((min(lo[i], p[i]) for i in range(3)))
    if not (7.5 < hi.z < 8.7):
        raise AssertionError(
            'preview(): the imported .glb tops out at z=%.3f, not the light '
            'tower mast at 8.108 m. The import orientation is not what this '
            'function assumes and the cameras would point at nothing.' % hi.z)
    # ORIENTATION ONLY.  These are per-object AABB corners transformed to
    # world, which is exactly the over-estimating method ASTRA §5 records as
    # having produced four false findings.  `node tools/glbinfo.mjs` is the one
    # ruler and is the only thing this model's dimensions are reported from.
    print('WELL_PAD_IMPORT_ORIENTATION (NOT a measurement, see ASTRA 5) '
          'x %.2f..%.2f  y %.2f..%.2f  z %.2f..%.2f'
          % (lo.x, hi.x, lo.y, hi.y, lo.z, hi.z))

    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 24
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 4
    scene.render.resolution_percentage = 100
    scene.world = bpy.data.worlds.new('inspection-world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.52, .60, .70, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .30

    # A SUN, not an area lamp.  Every material in the export is a NAME with no
    # colour, so the only thing separating one object from another in this
    # render is SHADING — a raking sun with hard shadows, not a flat blast.  The
    # first pass used a 30 kW area lamp overhead and returned a white page.
    bpy.ops.object.light_add(type='SUN', location=(0, 0, 40))
    sun = bpy.context.object
    sun.data.energy = 3.2
    sun.data.angle = 2.0 * D2R
    sun.rotation_euler = (Vector((0.42, -0.66, 0.62)).normalized()
                          .to_track_quat('Z', 'Y').to_euler())

    bpy.ops.mesh.primitive_plane_add(size=320)
    mat = bpy.data.materials.new('inspection-ground')
    mat.diffuse_color = (.30, .28, .24, 1)
    bpy.context.object.data.materials.append(mat)

    if hero:
        # A RIG STAND-IN, so the frame can be judged with the hole occupied.
        # `rigFactory.js` anchors a rig to `ctx.terrain.collarPosition`, which
        # is (0, 0, 0) — the same origin this site is authored about — so the
        # import lands where the machine will stand with no offset.
        # IT IS AN INSPECTION FIXTURE AND IT IS NOT IN THIS .GLB.  It is read
        # from the game checkout READ-ONLY and skipped if it is not there,
        # because `public/models/` is gitignored and a fresh clone has none.
        stand_in = os.path.join(r'C:\Users\henri\Downloads\drillity-the-game',
                                'public', 'models', 'rc-rig.glb')
        if os.path.exists(stand_in):
            bpy.ops.import_scene.gltf(filepath=stand_in)
            print('WELL_PAD_PREVIEW_RIG_STANDIN ' + stand_in + ' (fixture, not in the site .glb)')
        else:
            print('WELL_PAD_PREVIEW_RIG_STANDIN none — the frame below has an empty collar')

        # THE HERO VIEW: the game's own MEASURED frame.
        #
        # AND A DISAGREEMENT INSIDE THE SOURCE OF THOSE NUMBERS, WHICH IS
        # RESOLVED IN FAVOUR OF THE DIRECT MEASUREMENT.
        # `quarry_bench.py` records the hero camera twice in one comment block:
        # as "fov 20.97 vertical, aspect 1.724", and as the three measured
        # linear fits half-width(d) = 0.4023 d, top(d) = 2.25 + 0.2065 d,
        # bottom(d) = 2.25 - 0.1638 d.  Those are not the same camera:
        #     half-height/d = (0.2065 + 0.1638) / 2 = 0.18515
        #                   -> vertical fov 2*atan(0.18515) = 20.97 deg   AGREES
        #     half-width/d  = 0.4023  ->  aspect = 0.4023 / 0.18515 = 2.173
        #                                          against the quoted 1.724
        # A camera at aspect 1.724 would have half-width 0.3192 d, 21 % narrower
        # than the number every placement in both files is solved against.
        # This is ASTRA §5's "two tables describing one thing will drift" inside
        # a single comment block.
        #
        # The FITS are used here, because they are what was bisected off the
        # live projection and what both site modules place geometry with; the
        # aspect is the derived quantity and is the one that must be wrong. But
        # THIS PASS COULD NOT RE-MEASURE EITHER — the GPU lease is held
        # elsewhere — so this is a resolution by provenance, not by measurement,
        # and it is written up in research/sites/well-pad.md for whoever can.
        HALF_H_K = (TOP_K + BOT_K) * 0.5                 # 0.18515
        look = on_axis(30.0, 0.0)
        bpy.ops.object.camera_add(location=EYE)
        camera = bpy.context.object
        camera.rotation_euler = (Vector((look[0], look[1], 3.4)) - camera.location
                                 ).to_track_quat('-Z', 'Y').to_euler()
        camera.data.lens_unit = 'FOV'
        camera.data.sensor_fit = 'HORIZONTAL'
        camera.data.angle_x = 2.0 * math.atan(HALF_W_K)  # 43.90 deg
        scene.render.resolution_x = 1500
        scene.render.resolution_y = int(round(1500 * HALF_H_K / HALF_W_K))   # 690
    else:
        cam_at = on_axis(-26.0, 30.0)
        bpy.ops.object.camera_add(location=(cam_at[0], cam_at[1], 46.0))
        camera = bpy.context.object
        mid = on_axis(34.0, -6.0)
        camera.rotation_euler = (Vector((mid[0], mid[1], 0.0)) - camera.location
                                 ).to_track_quat('-Z', 'Y').to_euler()
        camera.data.type = 'ORTHO'
        camera.data.ortho_scale = 96
        scene.render.resolution_x = 1500
        scene.render.resolution_y = 1000
    scene.camera = camera

    out = os.path.join(ROOT, 'shots', out_name)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('WELL_PAD_PREVIEW_REAL_GLB ' + out)
    return out


if __name__ == '__main__':
    result = build(os.path.join(ROOT, 'public', 'models', 'sites', 'well-pad.glb'))
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    if '--preview' in argv:
        preview(result, 'well-pad-export.png', hero=False)
    if '--hero' in argv:
        preview(result, 'well-pad-hero.png', hero=True)
