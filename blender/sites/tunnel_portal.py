"""
SITE — `tunnel-portal`.  Exports to `public/models/sites/tunnel-portal.glb`.

A TUNNEL PORTAL SEEN FROM OUTSIDE, IN DAYLIGHT: the mouth of a drive at the
back of a supported approach cut, a sprayed collar round it, the protruding
outer ends of a pipe umbrella fanned over its crown, half-barrels scalloping
the excavated contour, and the cut's own face quilted with a nail pattern,
weldmesh, drainage strips and shotcrete.

WHY THIS FILE EXISTS AND WHAT IT MUST NOT BE MISTAKEN FOR
---------------------------------------------------------
`research/16-site-archetypes.md` §A.9, verbatim: *"This is the only surface
site where an underground machine legitimately stands in daylight."*  That
sentence is the archetype's whole reason to exist and it is also the trap: a
portal built carelessly comes out as an underground heading with a light on,
and then the game has two archetypes that are one archetype.

`blender/sites/underground_drive.py` is being authored in parallel.  If the two
models are confusable, both have failed.  SEVEN things here are TRUE ONLY
OUTSIDE, and every one is geometry in this file rather than a note:

  1. THE DARKNESS IS THE SUBJECT, NOT THE ENVIRONMENT.  Underground the dark is
     where the camera is.  Here it is a bounded object 16 m deep sitting inside
     a lit surface, and its job is to be the darkest thing in a sunlit frame:
     a ring ladder from 0x2A2E33 at the mouth to 0x040507 at the plug, against
     a sunlit collar beside it at 0xB6B2A8 — about 20:1 across a boundary the
     eye reads in one look.
  2. THERE IS AN APPROACH CUT AND IT IS SUPPORTED.  A near-vertical nailed and
     shotcreted wall with a catch ditch at its toe, weepholes along its base,
     geocomposite drain strips between the nail columns, blasted rock stepping
     back above it and a rockfall drape over the crest.  None of that exists
     inside a tunnel: a cut face is a surface that had to be made safe against
     WEATHER AND FALLING, and it is the clearest single tell.
  3. THE PIPE UMBRELLA IS SEEN FROM ITS OUTER END.  FHWA-NHI-10-034 §9.5.5.2
     describes the portal sequence exactly: pre-support pipes are installed
     around the future opening and then *"a reinforced shotcrete collar should
     be installed that is tied in with the protruding pre-support elements."*
     The word is FHWA's — PROTRUDING.  Inside a drive you are behind the array
     and it is invisible.  This is the file's signature object.
  4. THE HEAVY VARIANT OF IT IS DEFINED AS PORTAL-ONLY.  ITA-AITES WG19 §7.4:
     the pipe roof method *"can only be carried out at the tunnel portal or at
     the shaft."*  That is a published statement that this object belongs here
     and nowhere else.
  5. NOTHING IN THIS FILE EMITS OR MOUNTS LIGHT.  Not one `mount:` node carries
     `cone_deg`/`range_m`, deliberately — a portal apron works in daylight,
     §A.9 asks for no lighting on one, and inventing floodlights would be
     inventing a detail.

     THE NEIGHBOUR'S FILE WAS READ RATHER THAN ASSUMED (ASTRA §10), and it does
     not say what an earlier draft of this comment predicted.
     `blender/sites/underground_drive.py` deliberately models NO DRIVE SHELL at
     all — `src/world/terrain.js` `buildDrive()` already sweeps the horseshoe,
     the lining, the duct and the festoon, and `src/core/env.js` owns every
     lamp in the game — so it carries the crew's staged consumables, power and
     markers on FOUR materials (`rawSteel`, `paintedDark`, `rubber`,
     `safetyStripe`) and publishes one anchor and no lamps either.

     So the two files are distinct by a much wider margin than lamps: **they
     have no object and no subject in common, and four of this file's six
     materials appear in neither of theirs.**  That comparison is measurable
     off the two exports with `node tools/glbinfo.mjs` and it is recorded in
     `research/sites/tunnel-portal.md` §1.
  6. THE COLLAR AND ITS WING WALLS ARE A THRESHOLD STRUCTURE.  A wing wall
     exists to hold ground back BESIDE a mouth; there is no such thing 200 m
     in.  USACE EM 1110-2-2901 §7-4.a(2) puts the steel sets here too: *"Steel
     sets are most often used as ground support near tunnel portals and at
     intersections."*
  7. THE HALF-BARRELS ARE LIT BY THE SKY AT A GRAZING ANGLE, and only 65 % of
     them are drawn, because that is the sourced half-cast factor.  Underground
     they are lit by a lamp on the machine that made them.

READ ALONGSIDE
--------------
`blender/lib/site.py` (THE BUDGET, AXES, the material contract),
`research/16-site-archetypes.md` §A.9 and §A.3, `research/04-tunnelling.md`
§A1 and §A4, and `research/sites/tunnel-portal.md` — which carries every source
URL, what could not be sourced, the measured draws and triangles, and the
composition argument.  These citations point at that file.

SOURCES, BY KEY.  URLs in `research/sites/tunnel-portal.md`.  Everything below
was read out of the actual document, not out of a search summary; where a
number was checked against the primary text by this module's author rather than
only reported, it says READ HERE.

  [DP-RANGER]    Douglas Partners, *Ranger Uranium Decline*.  READ HERE
                 2026-09-06, and it says more than `research/16` §A.9 recorded:
                   · *"The decline was 2220m long, 6m high by 5.5m wide."*
                   · *"The box cut was excavated to a depth of 34.5m"*, with the
                     *"groundwater table at a depth of 6m"*.
                   · *"Spiling bars, 24mm diameter were installed from
                     springline to springline 200mm outside the excavated
                     profile with 6, 4-bar Pantex lattice girders encased in
                     fibrecrete."*
                   · *"the fibrecrete was replaced with mesh reinforced
                     shotcrete"*
                 The third quote gives both the ARC of a pre-support array and
                 its RADIAL OFFSET, which nothing else in reach gives.
                 "Pantex" is a maker's product name, cited only (`DOMAIN.md`
                 §10); nothing exported carries it.
  [CALTRANS-SN]  Caltrans Geotechnical Manual, *Soil Nail Walls*, Jan 2021.
                 READ HERE 2026-09-06 with PyMuPDF (ASTRA §4.6), §7 pp. 4-5,
                 verbatim: *"Drilled-hole Diameter: 6 inches"*; *"Soil Nail
                 Length: At least 15 feet and typically 0.7 to 1.0 times
                 designed excavation height"*; *"Soil Nail Inclination: 10 to
                 15 degrees from horizontal"*; *"Wall Face Batter: 1(H):12(V)"*;
                 *"1st Soil Nail Row: 2.5 feet from the top of excavated
                 face"*; *"Soil Nail Spacing: 5 feet for both horizontal and
                 vertical spacing; with columnar layout to facilitate the
                 placement of geocomposite drains"*; *"Nail Bar Diameter and
                 Grade: Use No. 8 and Grade 75 bar"*; and §9, nails set back
                 2.5 ft from the top AND the bottom of the wall.
                 THIS IS THE MOST LOAD-BEARING SOURCE IN THE FILE and it is the
                 one that was verified first-hand rather than taken on report.
  [FHWA-GEC7]    FHWA GEC No. 7, *Soil Nail Walls*, FHWA-NHI-14-007 (2015).
                 Spacing 4-6 ft, routinely 5 ft (§6.3.3b p.148); length approx
                 0.7H (§6.3.3d p.151); initial shotcrete facing 3-4 in
                 (§3.3.6a p.54); bearing plate square 8-10 in side, 0.75-1 in
                 thick (§3.2.2 pp.35-36); geocomposite strip drains min 12 in
                 wide at 1.0-2.0 S_H (§6.9.3a p.190, Fig 6.1 "0.30 M (TYP)");
                 weepholes 2-4 in dia at 8-10 ft centres (§6.9.3a p.190); and
                 the worked design in Appendix C Table C.3 pp.303-307, which is
                 the internally consistent reference wall this face follows.
  [FHWA-TUNNEL]  FHWA-NHI-10-034, *Technical Manual for Design and Construction
                 of Road Tunnels — Civil Elements* (the PDF is internally
                 labelled FHWA-NHI-09-010).  §9.5.4.1 p.9-38: canopy pipes
                 4.5-6 in (114-150 mm), *"typically spaced at 12-inch (0.30 m)
                 centers"*, lengths 15-24 m.  §9.5.5.2 pp.9-41/42: the portal
                 sequence and the shotcrete collar *"tied in with the
                 protruding pre-support elements"*, which *"shall follow the
                 tunnel perimeter extending from one sidewall to the other."*
                 §1.3 p.1-2: circular, rectangular and horseshoe are the three
                 highway-tunnel shapes, horseshoe being the drill-and-blast and
                 SEM one.
  [ITA-WG19]     ITA-AITES WG19, *Guidelines for the Design and Construction of
                 Conventional Tunnelling in Urban Setting* (2026).  §7.3 p.33
                 pipe fore-piling 110-120 mm at 12-15 m; §7.4 p.33 the pipe
                 roof method *"can only be carried out at the tunnel portal or
                 at the shaft"*; case study p.68 HEB 200 arches in a 250 mm
                 shotcrete preliminary lining AT THE PORTAL ZONE.
  [OKE-2016]     Oke, *Determination of Nomenclature and Support Design of
                 Umbrella Arch Systems*, PhD thesis, Queen's University 2016.
                 §4.3.2.2 pp.66-67 forepole 60-168.3 mm OD, 5-10 mm wall,
                 300-600 mm c/c, look-out 3-8 deg; §5.4 p.108 crown coverage
                 ~120 deg for gravity-driven and 180 deg for subsidence-driven
                 failure; §7.4 p.216 the BIRGL TUNNEL WEST PORTAL as built —
                 29-31 pipes, 114 mm OD x 6.3 mm, 2.5 deg look-out, 40-50 cm
                 centres.  That last one is the only PORTAL-SPECIFIC canopy
                 geometry found anywhere and it is what PIPE_PITCH uses.
  [USACE-EM]     USACE EM 1110-2-2901, *Tunnels and Shafts in Rock* (1997).
                 §5-2.c(3)(e) blastholes 45-51 mm; §5-2.c(3)(c) perimeter holes
                 diverge *"up to about 100 mm"* and *"successive blasts result
                 in a tunnel wall surface shaped in a zigzag"*; §5-2.d(5)
                 *"a half-cast factor of 50 to 80 percent can usually be
                 achieved"*; §7-4.a(2) steel sets near portals.
  [NFF14]        Norwegian Tunnelling Society Publication 14.  §7.4 contour
                 spacing and round length; §6.2 hot-dip galvanising as the
                 general bolt corrosion standard; §6.3.1 sprayed concrete.
  [NFF19]        NTS Publication 19.  §4.3.1 spiling; §4.3.2 pipe screens
                 Ø75-120 mm wall 5-7 mm; §5 mesh.
  [NFF23]        NTS Publication 23.  Blasthole 48-51 mm most common in Norway;
                 contour spacing set in tender at 60-90 cm; NPRA Process Code
                 32 general contour c/c 0.7 m; Norwegian standard drilling
                 length 5.3 m; collaring offset 10-15 cm and hole-bottom
                 eccentricity 30-40 cm.
  [NTNU-BD]      NTNU Project Report 2A-05, *Blast Design*.  The look-out rule.
                 `research/04`'s citation-honesty note applies: used only for
                 rules of thumb that [NFF14] §7.4 and [USACE-EM] corroborate.
  [HOEK-RMR]     Hoek, *Practical Rock Engineering* ch.3 Table 5 (Bieniawski
                 1989 RMR support).  RMR 21-40: *"Light to medium ribs spaced
                 1.5 m where required."*  NOTE: FHWA reprints this table as
                 Table 6-9 and its printing DROPS the 0.75 m in the row below,
                 so the spacing is cited to Hoek and not to FHWA.
  [FHWA-CTIP]    FHWA, *Context Sensitive Rock Slope Design Solutions* ch.3.6.
                 READ HERE 2026-09-06, verbatim: presplit hole spacing *"10 to
                 12 times the borehole diameter"*; smooth blasting *"about 14
                 to 20 times the hole diameter, which means that holes are
                 approximately 0.7 to 1.5 m (2.3 to 5 ft) apart"*; and, on the
                 rock face, *"For strong rock, it is nearly impossible to
                 completely remove these traces."*
  [SANDVIK-AT]   Pipe-umbrella systems serve *"tunnel drives, portals and
  [DSI-AT]       re-excavation of collapsed sections"* and are installed with
  [SINOROCK]     *"a conventional drill jumbo"*.  The sourced warrant for a
                 face jumbo standing in daylight beside one.
  [GEOSTAB-NAIL] A real soil-nail and rock-anchor slope job — galvanised mesh,
                 *"a regular pattern of small steel plates and nuts"*, grout
                 stains bleeding downslope, drainboards to collection points.
  [DARDA-PORTAL] Civil portal structures: collar, wing walls, movement joints,
                 slope stabilisation, drainage channels, rockfall nets.

NOT SOURCED, AND MARKED AGAIN AT EVERY USE BELOW
------------------------------------------------
  · WHERE THE PORTAL STANDS, HOW WIDE THE CUT IS AND HOW HIGH IT REACHES.
    There is no standard portal position or cut height — they are set by the
    hillside.  Every such number is solved against the measured hero camera
    with `height_at_ndc()`, is labelled a COMPOSITION DECISION, and must never
    be quoted back as a portal fact.
  · PORTAL HEADWALL THICKNESS.  Deliberately absent from this model.  Four
    standards were searched — [FHWA-TUNNEL], [ITA-WG19], [USACE-EM] and the NFF
    publications — and NONE gives a thickness, because the modern portal is a
    shotcrete COLLAR plus a canopy rather than a masonry headwall.  So this
    file builds the collar the sources describe and does not build a headwall
    it would have to invent a dimension for.
  · LATTICE GIRDER BAR SIZES.  [FHWA-TUNNEL] §9.5.3 explicitly defers the
    girder section to the contract documents and no numeric source was found,
    which is why the ribs here are drawn as STEEL SETS at a sourced section
    ([ITA-WG19]'s HEB 200 at a portal zone) rather than as lattice girders at
    an invented one.
  · COLLAR RADIAL DEPTH AND FACE THICKNESS, wing-wall rake, bore depth, ring
    pitch and tints, cut crest height, rock batter above the nailed wall, the
    rock column pitch, ditch section, muckpile size, canopy stick-out, and
    every colour in the file.

MATERIALS — SIX, WHICH IS THE BUDGET
------------------------------------
`blender/lib/site.py` THE BUDGET: a site .glb costs one draw call per material
once `finish()` joins the statics, and the surface band is already over its
ceiling of 80 in eight of twenty-one method states with no .glb on any site.

    blastedRock   cut face, crest, half-barrels, muck spill, stockpile, ditch
    shotcrete     sprayed facing, the portal collar, the wing walls
    mesh          weldmesh at the lift joints, the rockfall drape on the crest
    galvanised    nail plates and nuts, drain strips, weepholes, drape pins
    rawSteel      the canopy pipe collars, the steel-set ribs inside the mouth
    paintedDark   the bore — every ring of it, and the plug

Every surface variation inside a material is VERTEX COLOUR, never a seventh
material.  `src/world/terrain.js` `siteMaterial()` keys its live materials on
(kind, has-vertex-colour), so a site whose meshes ALL carry COLOR_0 pays
exactly one draw call per kind while a site that mixes coloured and uncoloured
meshes of one kind pays two.  Every mesh here is coloured; that is why.

AXES
----
`blender/lib/site.py` AXES.  Origin is the hole collar at ground level, Blender
+Z is up, Blender +Y is AWAY from the hero camera.  Composition is solved on
the view axis with `on_axis()`; raw world coordinates are not used anywhere.

Build:    blender --background --python blender/sites/tunnel_portal.py
Inspect:  append `-- --preview` (hero view) and/or `-- --over` (plan overview)
          to re-import the REAL export and render it offline with Cycles CPU.
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

    `site` is a CPython standard-library module — it runs during interpreter
    start-up — so `sys.modules['site']` is already taken before any of this
    executes, and a plain `import site` returns the stdlib one however
    `sys.path` is ordered.  The failure is silent in the worst way: the import
    succeeds and the first call dies with `AttributeError: module 'site' has no
    attribute 'reset'` from somewhere that looks unrelated to importing.  Same
    reasoning as `quarry_bench.py`; the private module name differs so two site
    modules in one Blender process cannot clobber each other's entry.
    """
    path = os.path.normpath(os.path.join(HERE, '..', 'lib', 'site.py'))
    spec = importlib.util.spec_from_file_location('drillity_site_portal', path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules['drillity_site_portal'] = mod
    spec.loader.exec_module(mod)
    return mod


S = _load_site_lib()

D2R = math.pi / 180.0
FT = 0.3048                      # every US figure below is converted from feet
IN = 0.0254                      # or inches, once, here

# The six, and nothing else.  Names only — `assets.js` makes the surface at
# runtime from the name with wear and dirt driven by gameplay state, and
# `site.finish()` asserts every one against `assets.js` before export.
MAT_ROCK = S.MAT_ROCK            # 'blastedRock'
MAT_CRETE = S.MAT_SHOTCRETE      # 'shotcrete'
MAT_MESH = S.MAT_MESH            # 'mesh'
MAT_GALV = S.MAT_GALV            # 'galvanised'
MAT_STEEL = S.MAT_STEEL          # 'rawSteel'
MAT_DARK = S.MAT_DARK            # 'paintedDark'


# ═════════════════════════════════════════════════════════════════════════════
# THE CAMERA THE COMPOSITION IS SOLVED AGAINST
#
# NOT re-measured here.  These are `quarry_bench.py`'s MEASURED hero camera,
# carried across unchanged and credited: eye, direction, field and the three
# linear frame fits were solved by projecting probe points through the LIVE
# `ctx.camera` and bisecting for the NDC edges, with the probe held until
# `terrain.archetype` and the ground mesh both agreed the site was really up.
# That measurement cost two wrong cameras to get right — the figures quoted in
# a terrain.js comment, then the BOOT camera, which is a ~28 s shader compile
# and not a splash.  Re-deriving them from `fov` here would throw that away and
# would be the second table ASTRA §5 says will drift.
#
#     eye        three.js [8.400, 2.250, 10.940] -> Blender [8.400, -10.940, 2.250]
#     direction  three.js [-0.673, 0.024, -0.740]   pitch +1.36 deg (slightly UP)
#     fov 20.97 vertical, aspect 1.724
#
#     half-width(d) = 0.4023 * d
#     top(d)        = 2.25 + 0.2065 * d
#     bottom(d)     = 2.25 - 0.1638 * d
#     horizon at NDC y -0.12; the collar is 13.75 m out, at NDC y -1.00
#
# IF THE HERO CAMERA MOVES, THIS SITE IS MIS-FRAMED.  Re-measure against the
# live projection matrix; do not re-derive from `fov`, and do not measure
# before the site is actually on screen.
# ═════════════════════════════════════════════════════════════════════════════
EYE = (8.400, -10.940, 2.250)
AXIS = (-0.6731, 0.7401)           # plan view direction, Blender XY
RIGHT = (0.7401, 0.6731)           # screen-right in plan, Blender XY
EYE_Z = 2.250
TOP_K = 0.2065
BOT_K = 0.1638
HALF_W_K = 0.4023
YAW = math.atan2(RIGHT[1], RIGHT[0])          # local +X -> screen-right
V_AXIS = Vector((AXIS[0], AXIS[1], 0.0))      # into the hill, away from camera
V_RIGHT = Vector((RIGHT[0], RIGHT[1], 0.0))   # across the frame, screen-right
V_UP = Vector((0.0, 0.0, 1.0))


def on_axis(dist, across=0.0):
    """Blender (x, y) at `dist` metres along the hero view axis from the eye,
    `across` metres across the frame (+ is screen-right).  The only placement
    function in this file; raw world coordinates are not used anywhere."""
    return (EYE[0] + AXIS[0] * dist + RIGHT[0] * across,
            EYE[1] + AXIS[1] * dist + RIGHT[1] * across)


def at3(dist, across, z):
    x, y = on_axis(dist, across)
    return Vector((x, y, z))


def half_width(dist):
    return dist * HALF_W_K


def ndc_y(dist, height):
    """-1 is the bottom of the surface band, +1 the top; horizon approx -0.12."""
    top = EYE_Z + TOP_K * dist
    bot = EYE_Z - BOT_K * dist
    return 2.0 * (height - bot) / (top - bot) - 1.0


def height_at_ndc(dist, y):
    """The inverse of `ndc_y`.

    Every authored height in this file is chosen by saying WHERE IN THE FRAME
    it should sit and inverting, because none of them has a source to be chosen
    from.  A number solved against the frame is at least honest about what it
    is; a number picked to look right and then given a citation is not."""
    top = EYE_Z + TOP_K * dist
    bot = EYE_Z - BOT_K * dist
    return bot + (y + 1.0) * 0.5 * (top - bot)


# ═════════════════════════════════════════════════════════════════════════════
# COLOUR — VERTEX COLOUR, BECAUSE A SEVENTH MATERIAL IS A SEVENTH DRAW CALL
# ═════════════════════════════════════════════════════════════════════════════
_VC_NODE = 'portal-vertex-colour'


def colour(o, rgb):
    """Paint one object flat, and make sure the exporter actually keeps it.

    Blender's glTF exporter defaults `export_vertex_color` to MATERIAL — it
    writes COLOR_0 only when the material CONSUMES the attribute.  Authoring
    the attribute alone is not enough: `urban_plot.py` records that its first
    real export collapsed COLOR_0 to white with the attributes visibly present
    in Blender.  So the material gets a Color Attribute node wired to Base
    Color once, and the test is for THAT NODE rather than for `use_nodes`,
    which Blender 5.2 treats as deprecated and always on.
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
        bsdf.inputs['Roughness'].default_value = 0.78
        # THE TRANSMISSION RULE (ASTRA §1.6, site.py), pinned to zero on every
        # material this file makes and not because any of them is glazing:
        # +65 to +81 draw calls, measured, independent of object size.
        bsdf.inputs['Transmission Weight'].default_value = 0
        if m.name in (MAT_STEEL, MAT_GALV):
            bsdf.inputs['Metallic'].default_value = 0.7
    return o


def _scale(rgb, f):
    """Multiply a hex tint, clamped.  Breaks up a mass without spending a
    material: the variation is per-object vertex colour, which is free."""
    out = 0
    for s in (16, 8, 0):
        v = int(round(((rgb >> s) & 255) * f))
        out |= max(0, min(255, v)) << s
    return out


def box(name, size, d, a, z, kind, tint, bevel=0.0, tilt=0.0, yaw=0.0):
    """A coloured box placed in FRAME coordinates.

    `d` runs along the view axis, `a` across the frame, `z` above the apron.
    `tilt` rotates about the view axis and `yaw` turns it in plan.  Blender's
    XYZ Euler resolves rot=(0, tilt, YAW+yaw) to Rz*Ry, which puts

        local +X  ->  cos(tilt) across  -  sin(tilt) up      (the tangent)
        local +Y  ->  along the view axis, into the hill
        local +Z  ->  sin(tilt) across  +  cos(tilt) up      (the normal)

    Derived, not guessed: `quarry_bench.py` records a 30 m conveyor gantry that
    came out pointing the opposite way to its own legs from assuming this.
    """
    x, y = on_axis(d, a)
    return colour(S.box(name, size, kind, loc=(x, y, z),
                        rot=(0.0, tilt, YAW + yaw), bevel=bevel), tint)


def rod(name, base, direction, length, radius, kind, tint, sides=8):
    """A coloured cylinder from `base` along an arbitrary world `direction`.

    `S.tube` builds along local +Z with its ORIGIN AT ITS BASE, so aiming it is
    one track-quat.  Used for the canopy pipes, the half-barrels and the nail
    stubs, none of which lies along a frame axis.  This is NOT a second copy of
    `site.traces()`: `traces()` stands its cylinders vertically on a face and
    steps them along one vector, which is the quarry-highwall case, not this
    one.
    """
    o = S.tube(name, radius, length, kind, loc=base, sides=sides)
    o.rotation_euler = Vector(direction).to_track_quat('Z', 'Y').to_euler()
    return colour(o, tint)


def rubble(name, d, a, z, size, kind, tint, block, n, seed, shade=0.12):
    """`site.rubble()` in frame coordinates, with every block coloured.

    Colouring matters for COST, not only for looks: an uncoloured block lands
    in the (kind, plain) material and splits that kind into two draw calls at
    runtime.  `size` is (across, along-axis, height) once yawed — checked
    against `site.rubble()`'s own transform, which lays `ox` along the yaw
    direction and `oy` perpendicular to it.
    """
    x, y = on_axis(d, a)
    made = S.rubble(name, (x, y, z), size, kind, block=block, n=n,
                    seed=seed, yaw=YAW)
    for i, o in enumerate(made):
        made[i] = colour(o, _scale(tint, 1.0 - shade * S.rnd(i * 1.9 + seed,
                                                             seed * 0.61)))
    return made


# ═════════════════════════════════════════════════════════════════════════════
# THE DRIVE'S CROSS-SECTION
# ═════════════════════════════════════════════════════════════════════════════

# THE THEORETICAL PROFILE.  [DP-RANGER], verbatim, read 2026-09-06: "The
# decline was 2220m long, 6m high by 5.5m wide."  `research/16` §A.9 already
# carried this and it is the only dimensioned drive section in the research
# pack.  It is a MINE DECLINE, which is what this archetype is: §A.9 describes
# mine portals as developed "within an existing open pit or in a specially
# developed box cut", and the fleet `data.js` sends here is a face jumbo, a
# bolter and an anchor rig — not a road-tunnel TBM train.
#
# CORROBORATION THAT THIS IS A REAL D&B SECTION AND NOT A SMALL ONE:
# [USACE-EM] Figure 5-17 dimensions a drill-and-blast horseshoe with a crown
# excavation-line radius of 12 ft (3.66 m); [ITA-WG19] case studies run from a
# 6.7 m metro bore to a 20.7 x 12.5 m road tunnel.  5.5 x 6.0 m sits at the
# small end, which is right for a decline driven by the machines in this game.
DRIVE_W = 5.5                      # [DP-RANGER]
DRIVE_H = 6.0                      # [DP-RANGER]

# THE EXCAVATED PROFILE IS BIGGER THAN THE THEORETICAL ONE, BY A SOURCED
# AMOUNT.  The jumbo has to set up INSIDE the hole it just made, so every round
# is drilled with a splay — the LOOK-OUT.  [NTNU-BD] via research/04 §A1: "the
# look-out should not exceed 10 cm + 3 cm per metre of hole depth"; [NFF14]
# §7.4 puts Norwegian rounds at 4.5-5.0 m off 18 ft steels.  On a 5 m round:
# 0.10 + 5 x 0.03 = 0.25 m.
#
# Two independent corroborations were found for this and both are quoted
# because a single rule of thumb is thin: [USACE-EM] §5-2.c(3)(c) — perimeter
# holes diverge from the theoretical wall line "by up to about 100 mm" at the
# collar — and [NFF23] — collaring offset 10-15 cm with hole-bottom
# eccentricity 30-40 cm.  0.25 m at the toe sits inside the Norwegian band.
LOOKOUT = 0.25                     # [NTNU-BD]; [USACE-EM]; [NFF23]
EXC_W = DRIVE_W + 2.0 * LOOKOUT    # 6.000 m  DERIVED
EXC_H = DRIVE_H + LOOKOUT          # 6.250 m  DERIVED

# THE SPRINGLINE.  Not a source and not a guess: a horseshoe whose crown is a
# semicircle of radius = half its width has its springline at height minus that
# radius, by construction.  [DP-RANGER] names a springline for this section
# without giving its level, which is what this identity supplies.
#
# SIMPLIFICATION, DECLARED: a real D&B horseshoe has CURVED SIDEWALLS on a
# larger radius than the crown — [USACE-EM] Figure 5-17 has a crown excavation
# radius of 12 ft against a sidewall radius of 21 ft.  This model draws the
# sidewalls straight.  At 33 m the difference between a 6.4 m sidewall radius
# and a straight leg is under 60 mm of bulge, which is a fifth of a pixel.
CROWN_R = EXC_W * 0.5              # 3.000 m
SPRING_Z = EXC_H - CROWN_R         # 3.250 m  GEOMETRIC

# ROUND LENGTH, AND WHY THE BORE IS NOT SMOOTH.  [NFF23]: the Norwegian
# standard drilling length is 5.3 m.  [USACE-EM] §5-2.c(3)(c): "Successive
# blasts result in a tunnel wall surface shaped in a zigzag.  Therefore,
# overbreak is generally unavoidable."  So the bore here steps: it tightens to
# the theoretical line at the start of every round and opens by the full
# look-out by the end of it.  That sawtooth is a fact about drill-and-blast
# tunnels and it is free to draw.
ROUND_LEN = 5.3                    # [NFF23]

# THE PRE-SUPPORT ARRAY'S ARC AND ITS RADIAL OFFSET.  [DP-RANGER], verbatim:
# "Spiling bars, 24mm diameter were installed from springline to springline
# 200mm outside the excavated profile".  Both halves are facts this model could
# not get anywhere else:
#   · the ARC of a pre-support array is springline to springline — the whole
#     crown and nothing below it — so the pipes run over exactly 180 degrees
#     and stop, rather than over a fraction chosen because it looked right.
#     [OKE-2016] §5.4 p.108 arrives at the same figure from the mechanics:
#     "~120 deg" for gravity-driven failure and "180 deg coverage" for
#     subsidence-driven, which is the portal case.  Two sources, one number.
#   · the RADIAL OFFSET is 200 mm outside the excavated profile.
# INFERENCE, MARKED: the Ranger offset is for a 24 mm bar array and is used
# here for a 114.3 mm pipe array.  The ARC carries across cleanly; the OFFSET
# is tighter for a 114 mm pipe than for a 24 mm bar and is used only because no
# pipe-specific offset was sourced.  Not a canopy-tube specification.
PRESUPPORT_OFF = 0.200             # [DP-RANGER], transferred — see above

# THE CANOPY PIPE.  [FHWA-TUNNEL] §9.5.4.1 p.9-38: "The steel pipes are
# typically perforated and have a diameter of between 4.5 inch and 6 inch
# (114 mm to 150 mm)."  [ITA-WG19] §7.3: 110-120 mm.  [NFF19] §4.3.2's
# Norwegian pipe screen is Ø75-120 mm with a 5-7 mm wall.  [OKE-2016]
# §4.3.2.2: 60-168.3 mm OD, 5-10 mm wall.  114.3 x 6.3 mm is a real as-built
# (Trojane, Slovenia) and sits inside all four bands.
PIPE_D = 0.1143                    # [FHWA-TUNNEL]; [OKE-2016]; as-built
PIPE_WALL = 0.0063                 # [OKE-2016] as-built; inside [NFF19] 5-7 mm
PIPE_L = 15.0                      # [FHWA-TUNNEL] "15 to 24 meters";
#                                    [ITA-WG19] 12-15 m.  Carried so the file
#                                    states the real length; only the collar is
#                                    modelled, because the other fourteen
#                                    metres are grouted into ground nobody can
#                                    see and would be triangles spent on
#                                    nothing.
PIPE_STICKOUT = 1.40               # NOT SOURCED — render length of the collar

# SPACING AROUND THE CROWN — AND THIS ONE IS PORTAL-SPECIFIC.
# [OKE-2016] §7.4 p.216 records the BIRGL TUNNEL WEST PORTAL as built: 29-31
# pipes, 114 mm OD x 6.3 mm wall, 2.5 deg look-out, 40-50 cm centres.  That is
# the only canopy geometry found anywhere that is measured AT A PORTAL, which
# is exactly the case being modelled, so it is what this uses.  It also sits
# inside [OKE-2016]'s general 300-600 mm band; [FHWA-TUNNEL] §9.5.4.1 quotes
# "typically spaced at 12-inch (0.30 m) centers" for the general case, and the
# portal figure is deliberately preferred over it.
#
# NOTE ON A SECOND-HAND FIGURE THAT IS NOT USED: `research/04` §A4 attributes
# "0.3-0.6 m spacing, installed every 8 m, minimum 4 m overlap" to a supplier
# key [UMB].  Refetching those URLs on 2026-09-06, one no longer resolves and
# the two that do give only the diameter and the length.  That band is not
# leaned on here; the primary sources above are.
PIPE_PITCH = 0.42                  # [OKE-2016] Birgl Tunnel WEST PORTAL

# LOOK-OUT OF THE PIPES.  [OKE-2016] §4.3.2.2 pp.66-67: forepole look-out is
# 3-8 degrees, with typical installation 3-7 degrees, and beyond about 15
# degrees "the pipe behaves as a rockbolt, not a forepole".  The Birgl portal
# itself was built at 2.5 degrees.  5 degrees is inside the general band and
# close to the portal case.
#
# AN EARLIER DRAFT OF THIS FILE USED 12 DEGREES, carried across from [NFF19]
# §4.3.1's REBAR SPILING band of 10-15 degrees.  That was wrong and the
# research caught it: a spile and a forepole are different elements with
# different geometry, and 12 degrees is at the edge of where a pipe stops
# working as a forepole at all.  Recorded because the mistake is the exact
# shape ASTRA §1.1 warns about — a number that was sourced, just not to the
# thing it was being used for.
PIPE_ANGLE = 5.0 * D2R             # [OKE-2016]

# THE CONTOUR HOLES, AND WHY THE HALF-BARRELS ARE AT THIS PITCH.
# [NFF14] §7.4, Norwegian specification, verbatim: "Maximum contour hole
# spacing 0.7 m", with "distance to the next helper row <= 0.9 m".  [NFF23]
# corroborates from the other side: contour spacing is set by the client in
# tender at 60-90 cm, and NPRA Process Code 32 gives general contour c/c 0.7 m.
# For a SURFACE presplit [FHWA-CTIP] gives 10-12 x hole diameter instead, which
# at 48 mm is 0.48-0.58 m — a different number for a different operation, and
# the reason the cut face here carries no drilled-hole rhythm at all.
CONTOUR_PITCH = 0.70               # [NFF14] §7.4; [NFF23]; NPRA Process Code 32
# [USACE-EM] §5-2.c(3)(e): "Blastholes are typically 45 to 51 mm (1.9-2 in.) in
# diameter."  [NFF23]: 48-51 mm is most common in Norway.  48 mm is in both.
CONTOUR_HOLE_D = 0.048             # [USACE-EM]; [NFF23]
BARREL_R = CONTOUR_HOLE_D * 0.5
# HOW MANY OF THEM SURVIVE — and this is the detail that separates a modelled
# contour from a decorated one.  [USACE-EM] §5-2.d(5): "A measure of success is
# the half-cast factor.  This is the ratio of half casts of blast holes visible
# on the blasted surface to the total length of trim holes... a half-cast
# factor of 50 to 80 percent can usually be achieved."
# So 65 % of the contour holes are drawn and the rest are not.  A ring where
# every single barrel is present would be a claim of 100 %, which the source
# says does not happen.
HALF_CAST = 0.65                   # [USACE-EM] §5-2.d(5), midpoint of 50-80 %

# ═════════════════════════════════════════════════════════════════════════════
# THE NAILED, SHOTCRETED APPROACH CUT — the most completely sourced object in
# the file.  [CALTRANS-SN] §7 was read first-hand with PyMuPDF and every number
# in this block is a quotation from it or from [FHWA-GEC7]'s worked design.
# ═════════════════════════════════════════════════════════════════════════════
NAIL_PITCH = 5.0 * FT              # 1.524 m.  [CALTRANS-SN] §7: "Soil Nail
#                                    Spacing: 5 feet for both horizontal and
#                                    vertical spacing".  [FHWA-GEC7] §6.3.3b:
#                                    4-6 ft, "routinely selected at 5 ft".
NAIL_EDGE_OFF = 2.5 * FT           # 0.762 m.  [CALTRANS-SN] §7: "1st Soil Nail
#                                    Row: 2.5 feet from the top of excavated
#                                    face", and §9: 2.5 ft from the bottom of
#                                    the wall and from the ends of the wall.
NAIL_ANGLE = 15.0 * D2R            # [CALTRANS-SN] §7: "10 to 15 degrees from
#                                    horizontal"; [FHWA-GEC7] §6.3.3c: 10-20
#                                    degrees, "most commonly at 15 degrees".
NAIL_HOLE_D = 6.0 * IN             # 0.1524 m.  [CALTRANS-SN] §7: "Drilled-hole
#                                    Diameter: 6 inches ... greater than 6
#                                    inches is rare".
NAIL_BAR_D = 1.0 * IN              # [CALTRANS-SN] §7: "Use No. 8 and Grade 75
#                                    bar" — a #8 bar is 1 inch nominal.
NAIL_PLATE = 9.0 * IN              # 0.2286 m square.  [FHWA-GEC7] §3.2.2:
NAIL_PLATE_T = 1.0 * IN            # plates are "usually square and flat, with
#                                    8- to 10-in. side dimensions and typical
#                                    thicknesses of 0.75 to 1 in."; the worked
#                                    design in Appendix C uses 9 in x 1 in.
FACING_T = 4.0 * IN                # 0.1016 m.  [FHWA-GEC7] §3.3.6a: "The
#                                    initial facing ... with a thickness most
#                                    commonly between 3 in. and 4 in."
WALL_BATTER = 1.0 / 12.0           # [CALTRANS-SN] §7: "Wall Face Batter:
#                                    1(H):12(V)".  Metres back per metre up.
DRAIN_W = 0.305                    # [FHWA-GEC7] §6.9.3a and Figure 6.1, which
#                                    labels the geocomposite strip "0.30 M
#                                    (TYP)"; minimum 12 in wide.
DRAIN_PITCH = NAIL_PITCH           # [FHWA-GEC7] §6.9.3a: strip spacing is
#                                    1.0-2.0 x S_H and "most commonly" equal to
#                                    S_H.  [CALTRANS-SN] §7 is why the nails are
#                                    in COLUMNS rather than staggered: "with
#                                    columnar layout to facilitate the placement
#                                    of geocomposite drains" — the drains run
#                                    BETWEEN the nail columns, and that is what
#                                    the half-pitch offset below is.
WEEP_D = 3.0 * IN                  # [FHWA-GEC7] §6.9.3a: weepholes 2-4 in dia
WEEP_PITCH = 9.0 * FT              # at 8-10 ft centres along the wall base.
MESH_OPENING = 6.0 * IN            # [FHWA-GEC7] Appendix C worked design: WWM
MESH_WIRE = 0.00488                # 6x6 - W2.9 x W2.9.  W2.9 = 0.029 sq in of
#                                    steel, i.e. a 4.88 mm wire (derived from
#                                    the area, which is what the W number is).
#                                    [NFF19] §5's tunnel mesh is 150 x 150 mm
#                                    with 5 mm wire — the same thing to within
#                                    2 mm, from a different continent.

# THE STEEL SETS JUST INSIDE THE MOUTH.
# [USACE-EM] §7-4.a(2): "Steel sets are most often used as ground support near
# tunnel portals and at intersections, for TBM starter tunnels, and in poor
# ground in blasted tunnels."  That sentence is why ribs belong in THIS file.
# [ITA-WG19] p.68 gives a real portal-zone section: HEB 200 arches in a 250 mm
# shotcrete preliminary lining, at the portal zone of a road tunnel.  HEB 200
# is a standard rolled section designation, not a maker's model (`DOMAIN.md`
# §10), and it is 200 x 200 mm.
# [HOEK-RMR] Table 5, RMR 21-40: "Light to medium ribs spaced 1.5 m where
# required."  FHWA reprints this table with the next row's 0.75 m dropped by a
# typesetting fault, so the spacing is cited to Hoek.
#
# STEEL SETS RATHER THAN LATTICE GIRDERS, AND THE REASON IS THE RULE.
# [DP-RANGER] used "4-bar Pantex lattice girders" and [NFF19] §4.5.3 describes
# the family — but [FHWA-TUNNEL] §9.5.3 explicitly leaves the girder section to
# the contract documents, and no bar diameter or girder height could be sourced
# from FHWA, USACE, ITA or NFF.  A lattice girder here would therefore have to
# be drawn at an invented section.  A steel set can be drawn at a section a
# published portal actually used.  So it is a steel set.
RIB_SECTION = 0.200                # [ITA-WG19] HEB 200 at a portal zone
RIB_SPACING = 1.5                  # [HOEK-RMR] Table 5, RMR 21-40
LINING_T = 0.250                   # [ITA-WG19] 250 mm preliminary lining
SHOTCRETE_MIN = 0.060              # [NFF14] §6.3.1 Norwegian road-tunnel floor


# ═════════════════════════════════════════════════════════════════════════════
# WHERE THE PORTAL STANDS — ALL COMPOSITION, ALL NOT SOURCED
#
# There is no standard portal position or cut size; they are set by the
# hillside.  Each number says which NDC it was solved for.  None is a fact.
#
# The mouth sits 33.0 m along the view axis, 3.9 m screen-RIGHT of it.
#
# IT WAS AT 28.0 m AND 4.6 m AND THE OFFLINE RENDER SAID NO, TWICE.  At 28 m
# the collar's right edge landed within a whisker of the band's right edge, and
# with the cut crest solved to close the sky there was NO SKY ANYWHERE IN THE
# FRAME — which is the one thing that would have made this read as an
# underground heading.  Both numbers moved because a picture was looked at, and
# neither was reasoned from the constants.
#
#   · at 33 m the frame runs from -3.16 m to +9.06 m, and it is either +-13.28
#     or +-10.53 m wide depending on which of two mutually inconsistent
#     horizontal fits is right (see `preview()`; the narrower is used here);
#   · the machine stands at three.js (0, ., 2.4) = 11.97 m out and 0.47 m
#     screen-LEFT — NDC x about -0.12, dead centre, tracks to about +-0.39;
#   · the mouth at across +3.9 spans across 0.9 .. 6.9 m = NDC x +0.09 .. +0.66
#     on the narrower fit, and vertically NDC -0.48 .. +0.54;
#   · the crest at 7.7 m is NDC +0.75, so the top ~12 % of the band is sky and
#     the crest jitter breaks the skyline into it.
# The machine overlaps the near jamb by about a fifth of the mouth's width and
# nothing else — a depth cue, not an occlusion — and the dark opening is clear
# of the mast.  It is off-centre for a measured reason: on the axis the machine
# covers about 40 % of the mouth, and the one thing this archetype has to show
# is the hole.
# ═════════════════════════════════════════════════════════════════════════════
D_PORTAL = 33.0                    # NOT SOURCED — composition
A_PORTAL = 3.9                     # NOT SOURCED — composition

# HOW DEEP THE BORE IS DRAWN.  NOT SOURCED — the real drive is 2 220 m long
# [DP-RANGER] and nobody sees past the first twenty metres of one.  16 m is
# solved: the sightline enters the mouth 6.7 deg off the tunnel axis
# (atan(3.9/33)), so it crosses the 3.0 m half-width after 3.0/tan(6.7) =
# 25.5 m.  At 16 m the PLUG is still in view down the bore, so the eye reaches
# BLACK rather than a lit side wall — which is the entire read.  Deeper would
# spend triangles hiding the thing they bought.
TUBE_DEPTH = 16.0                  # NOT SOURCED — solved against the sightline

# THE VALUE LADDER.  NOT SOURCED — a lighting decision, and the most important
# one in the file.  `src/world/terrain.js` learned it the hard way: a box tube
# shows the player only the BACK faces of its walls, backface culling removes
# them, and the only visible surface left is the far cap — so the opening reads
# as a grey rectangle painted on the wall.  Rings present a front face at every
# depth, so the recession is DRAWN rather than culled.
TUBE_RINGS = [
    (0.9, 0x2A2E33), (2.6, 0x1F2328), (4.6, 0x161A20), (7.0, 0x0F1318),
    (9.8, 0x0A0C11), (12.8, 0x06080B), (15.4, 0x040507),
]
TUBE_PLUG = 0x030405

# THE COLLAR.  [FHWA-TUNNEL] §9.5.5.2: "a reinforced shotcrete collar should be
# installed that is tied in with the protruding pre-support elements.  The
# collar shall follow the tunnel perimeter extending from one sidewall to the
# other."  The ARC is therefore sourced.  Its radial depth and its thickness
# along the axis are NOT.
COLLAR_T = 1.25                    # NOT SOURCED — radial depth
COLLAR_FACE = 1.00                 # NOT SOURCED — thickness along the axis
COLLAR_SEG = 1.05                  # segment length, so §A.9's MOVEMENT JOINTS
#                                    are gaps between cast segments rather than
#                                    a groove drawn on a continuous wall.
COLLAR_OUT = CROWN_R + COLLAR_T    # 4.250 m outer radius

# THE CUT.  NOT SOURCED except where noted; each says what it was solved for.
TREATED_Z = NAIL_EDGE_OFF * 2 + NAIL_PITCH * 2      # 4.572 m = 15 ft.
#   The HEIGHT is a composition decision, but it is constrained rather than
#   picked: it is the height at which [CALTRANS-SN]'s row rule closes EXACTLY —
#   2.5 ft up from the base, 5 ft between rows, 2.5 ft down from the top,
#   THREE rows, no remainder.  The wall stops well below the arch crown and
#   blasted rock takes over above it, which is what leaves room for sky over
#   the crest — see CUT_CREST_Z.
CUT_CREST_Z = 7.7      # NOT SOURCED — and it was WRONG at 11.0 m, which the
#                        first offline render caught: at 11 m the crest is off
#                        the top of the band and THERE IS NO SKY ANYWHERE IN
#                        THE FRAME.  A portal with no sky in it reads as an
#                        underground heading, which is the one failure this
#                        file exists to avoid.  ndc_y(33, 7.7) = +0.75, so the
#                        top ~12 % of the band is sky and the +-0.8 m crest
#                        jitter breaks the skyline into it.
#                        Low cover over the crown is not a compromise here: it
#                        is the portal case, and it is why a portal needs a
#                        pipe umbrella at all [SINOROCK].
CUT_FROM = -8.0        # across; NDC -0.81 at 33 m on the narrower of the two
#                        candidate aspects — inboard of the outer band edge,
#                        see THE EDGE ARTEFACT at the foot of the file.
CUT_TO = 20.0          # runs off the right edge; its end is never seen.
ROCK_BATTER = 0.42     # NOT SOURCED — metres back per metre up, ABOVE the
#                        nailed wall.  Below it the batter is [CALTRANS-SN]'s.
# (`COL_PITCH` lived here while the cut face was drawn as standing columns.
#  The face is `site.rubble()` masses now and nothing reads it, so it is gone
#  rather than left behind — a constant with no consumer is the smallest
#  version of this codebase's most persistent defect, ASTRA §9.)
DITCH_BACK = 4.6       # NOT SOURCED — the catch ditch, this far out from the
#                        toe of the wall.  [DARDA-PORTAL] via §A.9 gives portal
#                        drainage as "channels, swales, collector pipes and
#                        inspection shafts" and gives no dimension for any of
#                        them; [HSE-L118] Reg 12 makes "loose ground or rocks
#                        above a roadway or workplace" an imminent-risk
#                        trigger, which is what a catch ditch answers.
CLEAR_R = 9.2          # NOT SOURCED visual reserve around the collar, not an
#                        operational exclusion zone.  Chosen against
#                        terrain.js `pad: 10.0` and `CFG.padRadius 8.5`.

# Palette.  NOT SOURCED, all of it — a deliberately desaturated northern rock
# and grey concrete set, so the black of the bore is the strongest value in the
# frame by a wide margin.  `assets.js` makes the actual surface from the
# material NAME; these tints multiply it.
ROCK_LIT, ROCK_MID, ROCK_DARK = 0x8F8878, 0x736D62, 0x4E4B45
CRETE_LIT, CRETE_MID, CRETE_DARK = 0xB6B2A8, 0x9A968C, 0x7B7870
MESH_TINT, DRAPE_TINT = 0x8F948E, 0x7A7E78
GALV_TINT, GALV_DULL = 0xAEB3B2, 0x8C918F
STEEL_TINT = 0x9BA1A2
MUCK_TINT = 0x6B6559
GROUT_STAIN = 0xC6C1B2


# ═════════════════════════════════════════════════════════════════════════════
# THE EXCAVATED CONTOUR — one parameterisation, used by five things
# ═════════════════════════════════════════════════════════════════════════════
LEG_LEN = SPRING_Z
CROWN_LEN = math.pi * CROWN_R
CONTOUR_LEN = 2.0 * LEG_LEN + CROWN_LEN


def contour(t):
    """(across, height, tilt, normal_across, normal_up) at arc length `t`.

    `t` runs from the left floor, up the left leg, over the crown left to
    right, and down the right leg.  `tilt` is the angle to hand `box()` so the
    box's local +X lies along the contour and its local +Z along the outward
    normal — see the derivation in `box()`.

    One function rather than five: the bore rings, the collar, the half-barrels,
    the canopy array and the steel sets are the same curve at different radial
    offsets, and two descriptions of one curve is the drift ASTRA §5 is about.
    """
    if t < LEG_LEN:                                   # left leg, going up
        return (-CROWN_R, t, -math.pi * 0.5, -1.0, 0.0)
    if t < LEG_LEN + CROWN_LEN:                       # the crown, left to right
        th = (t - LEG_LEN) / CROWN_R
        return (-CROWN_R * math.cos(th), SPRING_Z + CROWN_R * math.sin(th),
                th - math.pi * 0.5, -math.cos(th), math.sin(th))
    return (CROWN_R, SPRING_Z - (t - LEG_LEN - CROWN_LEN),
            math.pi * 0.5, 1.0, 0.0)                  # right leg, going down


def contour_at(t, offset=0.0):
    """The contour point pushed `offset` metres along its outward normal, as
    (across, height, tilt)."""
    u, z, tilt, nu, nz = contour(t)
    return (u + nu * offset, z + nz * offset, tilt)


def opening_half(z):
    """Half-width of the excavated profile at height `z`, 0 above the crown.

    The facing, the mesh and the ditch are drawn as CONTINUOUS runs that stop
    at this line and start again past it, rather than as a grid of tiles.  The
    first offline render is why: tiled panels came back as "a wall of smooth
    pale cardboard cartons with ruled edges", which is `site.py`'s own name for
    the failure and which it records was FIRST DIAGNOSED ON THE ROUND-4 TUNNEL
    PORTAL.  Sprayed concrete has no joints except its lift joints, so the only
    lines on this wall are horizontal ones and they are real.
    """
    if z <= SPRING_Z:
        return CROWN_R
    dz = z - SPRING_Z
    return math.sqrt(max(0.0, CROWN_R * CROWN_R - dz * dz))


def contour_steps(pitch, t0=0.0, t1=None):
    """Arc lengths ~`pitch` apart over [t0, t1), centred in each interval so a
    step never lands exactly on the springline discontinuity."""
    t1 = CONTOUR_LEN if t1 is None else t1
    n = max(1, int(round((t1 - t0) / pitch)))
    step = (t1 - t0) / n
    return [t0 + (i + 0.5) * step for i in range(n)]


def box_clear(a, z, half_a, half_z, clearance):
    """True when an axis-aligned box in the across/height plane misses the
    excavated profile by at least `clearance`.

    A rectangular keep-out was tried first and is wrong here: a rectangle round
    a horseshoe leaves a square hole in the facing above the crown, and the
    whole read of a portal is that the support WRAPS the arch.  So the keep-out
    is the real shape — a leg rectangle below the springline, a disc above it —
    and the test is a proper box/shape overlap rather than a centre distance.
    """
    u = abs(a - A_PORTAL)
    r = CROWN_R + clearance
    # the vertical legs, from a little below the floor up to the springline
    if (u - half_a < r) and (z - half_z < SPRING_Z + clearance) \
            and (z + half_z > -1.0 - clearance):
        return False
    # the crown disc, centred on (0, SPRING_Z)
    dx = max(0.0, u - half_a)
    dy = max(0.0, (z - half_z) - SPRING_Z, SPRING_Z - (z + half_z))
    return math.hypot(dx, dy) >= r


def face_d(z):
    """Distance along the view axis of the cut's face at height `z`.

    TWO BATTERS, AND THEY ARE DIFFERENT KINDS OF THING.  Below TREATED_Z the
    face is an engineered nailed wall and its batter is [CALTRANS-SN]'s
    1(H):12(V).  Above it the face is blasted rock, laid back much further, and
    that batter is NOT SOURCED — a rock cut's slope is set by the rock.
    """
    if z <= TREATED_Z:
        return D_PORTAL + z * WALL_BATTER
    return D_PORTAL + TREATED_Z * WALL_BATTER + (z - TREATED_Z) * ROCK_BATTER


# ═════════════════════════════════════════════════════════════════════════════
# THE BORE
# ═════════════════════════════════════════════════════════════════════════════

def build_bore():
    """The hole, and the whole point of the archetype.

    Seven three-sided ring frames marching into the hill, each darker than the
    last, with a plug behind them so no sky can show through the massif.  They
    are drawn INSIDE the excavated contour, so the lit contour edge and its
    half-barrels stand in front of them and the eye reads a hard boundary
    between rock and black rather than a soft one.

    THE PROFILE SAWTOOTHS, AND THAT IS SOURCED.  [USACE-EM] §5-2.c(3)(c):
    "Successive blasts result in a tunnel wall surface shaped in a zigzag."
    Each round starts tight against the theoretical line and opens by the full
    look-out at its far end, so the bore steps in and out on the round length
    [NFF23] rather than tapering smoothly.  It costs nothing and it is what a
    drill-and-blast bore actually looks like.
    """
    ring_pitch = 1.55              # NOT SOURCED — segment length round a ring
    for k, (depth, tint) in enumerate(TUBE_RINGS):
        # Where this depth sits inside its own round: 0 at the collar of the
        # round (tight) and 1 at the toe (full look-out).
        frac = (depth % ROUND_LEN) / ROUND_LEN
        saw = -LOOKOUT * (1.0 - frac)      # inward of the excavated line
        thick = 1.05 + k * 0.09            # NOT SOURCED — the bore closes down
        for t in contour_steps(ring_pitch):
            u, z, tilt = contour_at(t, saw - thick * 0.5)
            box('bore-r%d' % k, (ring_pitch * 1.30,
                                 min(2.6, depth * 0.55 + 0.9), thick),
                D_PORTAL + depth, A_PORTAL + u, z, MAT_DARK, tint)
        # the floor of the bore at this depth — muck-covered, not a slab
        box('bore-floor-%d' % k, (EXC_W * 0.92, min(2.6, depth * 0.55 + 0.9), 0.5),
            D_PORTAL + depth, A_PORTAL, 0.18, MAT_DARK, tint)
    box('bore-plug', (EXC_W + 2.2, 0.9, EXC_H + 2.0),
        D_PORTAL + TUBE_DEPTH, A_PORTAL, EXC_H * 0.5, MAT_DARK, TUBE_PLUG)


def build_barrels():
    """HALF-BARRELS ROUND THE MOUTH — the evidence that the hole was DRILLED.

    [NFF14] §7.4: "a successful round in competent rock leaves most of the
    drill holes visible in the tunnel contour", at a maximum contour spacing of
    0.7 m.  So a ring of part-embedded 48 mm cylinders runs the excavated
    contour at that spacing, at TRUE SCALE, with nothing exaggerated.

    AND ONLY 65 % OF THEM ARE THERE.  [USACE-EM] §5-2.d(5) puts the achievable
    half-cast factor at 50-80 %.  A ring with every barrel present would be a
    claim of 100 %, which the source says does not happen; the gaps are where
    the rock broke past the hole.  `S.rnd` decides which, so a rebuild produces
    the same gaps and a screenshot stays comparable.

    They run along the TUNNEL axis, which is why `rod()` exists here and
    `site.traces()` does not: `traces()` stands its cylinders on end.
    """
    base_d = D_PORTAL - 0.25
    length = 2.4                   # NOT SOURCED — the lit depth of the collar
    kept = 0
    for i, t in enumerate(contour_steps(CONTOUR_PITCH)):
        if S.rnd(i * 7.7, 23.0) > HALF_CAST:
            continue               # this one did not survive the round
        u, z, _ = contour_at(t, BARREL_R * 0.9)
        if z < 0.35:
            continue               # below the floor it is buried muck, not rock
        rod('mouth-barrel-%d' % i, at3(base_d, A_PORTAL + u, z),
            V_AXIS, length, BARREL_R, MAT_ROCK,
            _scale(ROCK_MID, 0.86 + 0.22 * S.rnd(i * 3.7, 11.0)), sides=7)
        kept += 1
    return kept


# ═════════════════════════════════════════════════════════════════════════════
# THE COLLAR AND ITS WING WALLS
# ═════════════════════════════════════════════════════════════════════════════

def build_collar():
    """[FHWA-TUNNEL] §9.5.5.2, the portal sequence, verbatim: pre-support is
    installed round the future opening and then "a reinforced shotcrete collar
    should be installed that is tied in with the protruding pre-support
    elements.  The collar shall follow the tunnel perimeter extending from one
    sidewall to the other."  That is exactly what this builds, in that order.

    ONE MATERIAL FOR THE COLLAR AND THE CUT FACING, AND THE SOURCES ALLOW IT.
    FHWA calls the collar REINFORCED SHOTCRETE; §A.9 offers "reinforced
    concrete or reinforced shotcrete" and describes the collar as "shotcreted
    or concrete"; [DP-RANGER] records the Ranger portal's own facing being
    "replaced with mesh reinforced shotcrete".  So this file spends ONE of its
    six materials on `shotcrete` and uses it for the collar, the wing walls and
    the cut facing.  A second `concrete` kind would buy a slightly different
    surface for a whole draw call out of a band already over its ceiling in
    eight of twenty-one method states.

    NO MASSIVE CAST HEADWALL, AND THAT IS A SOURCED CHOICE RATHER THAN A
    SIMPLIFICATION.  Four standards were searched for a portal headwall
    thickness — [FHWA-TUNNEL], [ITA-WG19], [USACE-EM] and the NFF publications
    — and none gives one, because the modern portal is a collar plus a
    shotcrete canopy and not a masonry headwall.  §A.9 gives two portal cases
    and they do not look alike: a CIVIL portal is "massive reinforced concrete
    ... with wing walls" [DARDA-PORTAL], a MINE portal is developed "in a
    specially developed box cut" [ACG-DUNN] with "multi-strand anchors within a
    shotcreted face" [DP-RANGER].  The fleet `data.js` sends to this archetype
    is a face jumbo, a bolter and an anchor rig, so this is the mine case — and
    it is also the case that shows the most of what the brief asks to preserve,
    the supported approach cut, instead of hiding fourteen metres of it behind
    a slab whose thickness would have had to be invented.
    """
    for i, t in enumerate(contour_steps(COLLAR_SEG)):
        u, z, tilt = contour_at(t, COLLAR_T * 0.5)
        if z < 0.15:
            continue
        # THE TANGENTIAL LENGTH IS SCALED BY THE RADIUS RATIO.  The pitch
        # is measured on the contour at CROWN_R and each block sits at
        # CROWN_R + COLLAR_T/2, so a block cut to the pitch leaves a gap
        # that grows with the offset — the first render came back as a fan
        # of separate paddles instead of a ring.  Derived, not nudged.
        seg = COLLAR_SEG * (1.0 + COLLAR_T * 0.5 / CROWN_R) * 1.04
        box('collar-%d' % i, (seg, COLLAR_FACE, COLLAR_T),
            D_PORTAL - COLLAR_FACE * 0.5, A_PORTAL + u, z, MAT_CRETE,
            _scale(CRETE_LIT, 0.94 + 0.10 * S.rnd(i * 2.3, 5.0)),
            bevel=0.035, tilt=tilt)

    # SHORT WING WALLS.  §A.9 names them and they are what holds the cut's
    # ground back beside a mouth.  Rake, length and section NOT SOURCED.
    for s in (-1, 1):
        for w in range(3):
            h = (SPRING_Z + 0.9) * (1.0 - 0.26 * (w + 1))
            a = A_PORTAL + s * (COLLAR_OUT + 1.05 + w * 2.05)
            d = D_PORTAL - 0.9 - w * 1.25
            box('wing-%d' % w, (2.05, 1.4, h), d, a, h * 0.5,
                MAT_CRETE, _scale(CRETE_MID, 0.96 - w * 0.04), bevel=0.04)


def build_ribs():
    """STEEL SETS JUST INSIDE THE MOUTH.

    [USACE-EM] §7-4.a(2): "Steel sets are most often used as ground support
    near tunnel portals and at intersections."  That is the sourced reason ribs
    belong in a PORTAL file rather than being generic tunnel dressing.

    Section and spacing are both sourced and both are portal or poor-ground
    figures: [ITA-WG19] p.68 records HEB 200 arches in a 250 mm shotcrete
    preliminary lining AT THE PORTAL ZONE of a road tunnel, and [HOEK-RMR]
    Table 5 gives "light to medium ribs spaced 1.5 m" for RMR 21-40 — which is
    the ground a portal is in, since a portal is by definition low-cover,
    weathered and settlement-sensitive [SINOROCK].

    WHY NOT LATTICE GIRDERS, which [DP-RANGER] actually used: [FHWA-TUNNEL]
    §9.5.3 explicitly leaves the girder section to the contract documents, and
    no bar diameter or girder height could be sourced from FHWA, USACE, ITA or
    NFF.  A lattice girder would have to be drawn at an invented section; a
    steel set can be drawn at one a published portal used.  The rule decided
    the geometry, which is the point of the rule.
    """
    seg_pitch = 0.95
    for k in range(3):
        chain = 1.5 + k * RIB_SPACING
        for i, t in enumerate(contour_steps(seg_pitch)):
            u, z, tilt = contour_at(t, -LINING_T)
            if z < 0.25:
                continue
            rseg = seg_pitch * (1.0 - LINING_T / CROWN_R) * 1.06
            box('rib%d-%d' % (k, i), (rseg, RIB_SECTION, RIB_SECTION),
                D_PORTAL + chain, A_PORTAL + u, z, MAT_STEEL,
                _scale(STEEL_TINT, 0.80 - k * 0.17), tilt=tilt)


def build_umbrella():
    """THE PIPE UMBRELLA, SEEN FROM ITS OUTER END — this file's signature.

    THE WARRANT.  [SANDVIK-AT], [DSI-AT]: pipe-umbrella systems serve "tunnel
    drives, portals and re-excavation of collapsed sections" and are installed
    with "a conventional drill jumbo".  [SINOROCK]: pipe roofing suits tunnel
    portals and shallow tunnels.  [ITA-WG19] §7.4 goes further and makes the
    heavy variant portal-only: the pipe roof method "can only be carried out at
    the tunnel portal or at the shaft."  And [FHWA-TUNNEL] §9.5.5.2 says the
    ends PROTRUDE and the collar is tied into them, which is why they are
    visible here at all.

    THE GEOMETRY.  Arc: [DP-RANGER] "from springline to springline", i.e. 180
    degrees, corroborated by [OKE-2016] §5.4 which gives 180 degrees for
    subsidence-driven failure, the portal case.  Offset: [DP-RANGER] "200mm
    outside the excavated profile".  Pitch: [OKE-2016] §7.4, the Birgl Tunnel
    WEST PORTAL as built, 40-50 cm.  Look-out: [OKE-2016] 3-8 degrees.  Not one
    of those four is a number chosen here.

    AN UNDERGROUND HEADING CANNOT SHOW THIS.  Inside the drive you are behind
    the array and the collars are on the far side of the face.
    """
    off = PRESUPPORT_OFF + PIPE_D * 0.5
    n = 0
    for i, t in enumerate(contour_steps(PIPE_PITCH, LEG_LEN,
                                        LEG_LEN + CROWN_LEN)):
        u, z, _ = contour_at(t, off)
        _, _, _, nu, nz = contour(t)
        # The look-out leans each pipe away from the tunnel axis in the plane
        # of its own contour normal, so the array opens into a cone.
        direction = (-V_AXIS * math.cos(PIPE_ANGLE)
                     + (V_RIGHT * nu + V_UP * nz) * math.sin(PIPE_ANGLE))
        # Based at the FRONT face of the collar, because FHWA has the collar
        # tied in with elements that are already protruding through it.
        rod('canopy-pipe-%d' % i,
            at3(D_PORTAL - COLLAR_FACE - 0.02, A_PORTAL + u, z),
            direction, PIPE_STICKOUT, PIPE_D * 0.5, MAT_STEEL,
            _scale(STEEL_TINT, 0.88 + 0.18 * S.rnd(i * 5.1, 3.0)), sides=8)
        n += 1
    return n


# ═════════════════════════════════════════════════════════════════════════════
# THE APPROACH CUT AND ITS SUPPORT — the half of the identity that is not the
# hole.  Everything below is a SURFACE made safe against weather and falling,
# and none of it can occur inside a tunnel.
# ═════════════════════════════════════════════════════════════════════════════

def build_cut_face():
    """THE BLASTED ROCK ABOVE THE NAILED WALL, BUILT AS COLUMNS.

    Not a slab.  `site.py`'s own docstring records what a slab renders as — "a
    wall of smooth pale cardboard cartons with ruled edges" — and records that
    the diagnostic frame which proved it was the round-4 TUNNEL PORTAL.  This
    file is the direct descendant of that finding.

    A cut face is one mass with a ragged edge at every scale, so it is drawn as
    standing columns of jittered depth and height with the crest wandering.
    All one material, so the whole face is ONE DRAW CALL however many blocks go
    into it: triangles are the lane to spend in.

    Column pitch, batter, crest height and jitter are NOT SOURCED.  §A.4's
    finding about quarry faces applies verbatim here — the numbers do not exist
    as rules because they are set by the ground — so they are solved against
    the frame and labelled, never printed as portal facts.

    NO DRILLED-HOLE RHYTHM IS DRAWN ON THIS FACE.  [FHWA-CTIP] gives surface
    presplit spacing as 10-12 x hole diameter and smooth blasting as 14-20 x,
    i.e. 0.48-0.58 m and 0.7-1.5 m, which are real but are a different
    operation from the tunnel contour and would need a hole diameter this model
    has no source for on a surface cut.  The 0.7 m half-barrel ring is on the
    TUNNEL contour where [NFF14] §7.4 literally applies, and nowhere else.
    """
    span = CUT_TO - CUT_FROM
    # RUBBLE MASSES, NOT BOX COLUMNS, AND THE RENDER IS WHY.
    # The first two versions drew this face as standing columns, which is how
    # `quarry_bench.py` draws a BLASTED HIGHWALL — correctly, because a highwall
    # genuinely is the rock left standing between the last row of holes, on the
    # shot's own spacing.  A weathered rock slope above a nailed wall is not
    # that: it has no hole pitch in it, and the columned version came back from
    # the offline render as exactly the stacked cartons `site.py` warns about —
    # the failure `site.py` records was FIRST DIAGNOSED ON THE ROUND-4 TUNNEL
    # PORTAL.  Reproducing it here twice is not a coincidence; it is what a grid
    # of boxes always does.
    # `site.rubble()` exists for this case: overlapping blocks of a real
    # physical size, each yawed, tilted and scaled, reading as ONE mass with a
    # ragged edge.  `block` is the characteristic edge of one block; 1.25 m is
    # NOT SOURCED.
    n_mass = max(1, int(span / 4.2))
    mw = span / n_mass
    for i in range(n_mass):
        a = CUT_FROM + (i + 0.5) * mw
        # The crest never breaks out level.  +-0.8 m is NOT SOURCED; it is what
        # stops the skyline reading as a machined edge, and here it is also what
        # lets sky through, because CUT_CREST_Z is solved to sit just under the
        # top of the band and the jitter breaks the crest over it.
        top = CUT_CREST_Z + S.jitter(0.8, i * 2.7, 6.0)
        z0 = TREATED_Z - 0.4
        # Over the mouth the rock sits on the collar's own arc rather than being
        # cut away square, so the drive reads as driven INTO rock with thin
        # cover — which is the portal case [SINOROCK] and the reason a portal
        # needs a pipe umbrella at all.
        u = a - A_PORTAL
        keep = COLLAR_OUT + 0.55
        if abs(u) < keep:
            z0 = max(z0, SPRING_Z + math.sqrt(max(0.0, keep * keep - u * u)))
        h = top - z0
        if h < 0.9:
            continue
        mid = z0 + h * 0.5
        rubble('cutface-%d' % i, D_PORTAL + (face_d(mid) - D_PORTAL) + 1.3,
               a, mid, (mw * 1.30, 3.2, h), MAT_ROCK,
               _scale(ROCK_LIT, 0.82 + 0.30 * S.rnd(i * 3.1, 9.0)),
               block=1.25, n=14, seed=630.0 + i * 17)

    # THE ROCK THAT STANDS BESIDE AND OVER THE MOUTH, between the collar and
    # the nailed wall's top.  Without it the arch would be set in shotcrete all
    # the way round and the drive would not read as being driven INTO rock.
    for i in range(6):
        for s in (-1, 1):
            a = A_PORTAL + s * (COLLAR_OUT + 0.9 + i * 0.75)
            z = 0.8 + i * 1.05
            if not box_clear(a, z, 0.55, 0.55, 0.30) or z > CUT_CREST_Z:
                continue
            back = (face_d(z) - D_PORTAL) + 0.85
            box('mouth-rock-%d-%d' % (i, s + 1), (1.1, 1.7, 1.1),
                D_PORTAL + back, a, z, MAT_ROCK,
                _scale(ROCK_MID, 0.86 + 0.26 * S.rnd(i * 2.9 + s, 41.0)),
                bevel=0.05, yaw=S.jitter(0.12, i * 3.7, s))

    # THE SOLID HILL BEHIND THE COLUMNS.  The columns are a broken SURFACE and
    # they are not the hill; without something continuous behind them the gaps
    # show sky right through the massif.  terrain.js recorded exactly that
    # ("bright slots between the boulders", shots/p2-tunnel-portal.png) and
    # fixed it the same way.
    # DEEP, NOT A FLAT.  The first overview render showed this as a stage flat
    # standing on the plain with its ends in shot.  22 m of depth costs twelve
    # triangles and makes it ground rather than scenery.  Its TOP is held 0.7 m
    # over the crest so it closes the gaps between the columns without eating
    # the sky the crest was lowered to expose.
    box('cut-massif', (span + 14.0, 22.0, CUT_CREST_Z + 0.7),
        face_d(CUT_CREST_Z) + 12.0, (CUT_FROM + CUT_TO) * 0.5,
        (CUT_CREST_Z + 0.7) * 0.5 - 0.5, MAT_ROCK, ROCK_DARK)

    # THE SIDE SLOPE ON THE CAMERA SIDE OF THE CUT.  This is the object that
    # says "you are standing INSIDE an excavation" rather than "in front of a
    # cliff", and it is the second-strongest outdoor tell after the netting.
    # It DAYLIGHTS as it comes forward — a cut gets shallower as it opens out —
    # which is both true and what keeps large geometry inboard of the band edge
    # (see THE EDGE ARTEFACT at the foot of this file).
    for j, (d, a, h) in enumerate(((31.4, -8.2, 8.0), (28.2, -9.0, 5.4),
                                   (25.0, -9.9, 3.2))):
        rubble('cut-sideslope-%d' % j, d, a, h * 0.45, (3.2, 3.0, h),
               MAT_ROCK, _scale(ROCK_MID, 0.92 - j * 0.03),
               block=1.4, n=10, seed=120.0 + j * 13)


def build_facing():
    """THE NAILED, SHOTCRETED, DRAINED WALL — the "supported approach cut".

    This is the object the brief asks to preserve and it is the one an
    underground heading has no equivalent of.  [DARDA-PORTAL] via §A.9: the
    slopes above a portal are stabilised by "anchors, rock bolts, soil nails and
    shotcrete with rockfall protection", drained through "channels, swales,
    collector pipes and inspection shafts".  [GEOSTAB-NAIL] describes what that
    looks like on a real job: "a grid of galvanised mesh pinned by a regular
    pattern of small steel plates and nuts, grout stains bleeding downslope from
    each head, drainboard strips running to a few collection points."  Every
    clause of that sentence is an object below.

    THE PATTERN IS NOT INVENTED.  It is [CALTRANS-SN] §7's recommended starting
    configuration, unchanged: 5 ft both ways, first row 2.5 ft down from the
    top and 2.5 ft up from the base, COLUMNAR rather than staggered — Caltrans
    says why, "to facilitate the placement of geocomposite drains" — 15 degrees
    below horizontal, a 6 in drilled hole, a #8 bar, and a 1(H):12(V) face
    batter.  The wall's HEIGHT is this file's own composition decision, but it
    is constrained to the height at which that row rule closes exactly.

    An earlier draft of this function drew a STAGGERED grid "because a square
    grid on a face reads as wallpaper".  It is square, the source says so and
    says why, and the drains that go in the gaps are the reason.  Recorded
    because the instinct was aesthetic and the source was right.
    """
    span = CUT_TO - CUT_FROM
    # ── the sprayed facing: TWO CONTINUOUS RUNS PER EXCAVATION LIFT ──────────
    # [FHWA-GEC7] §2.1: the excavation lift height IS the vertical nail
    # spacing, 3-5 ft, so the wall goes up in lifts of 5 ft and the
    # construction joints between them are real.  They are the ONLY joints:
    # each lift is one box to the left of the opening and one to the right,
    # stopping at `opening_half()`.  An earlier version tiled it into 2.5 m
    # panels and the first offline render came back as stacked cartons — see
    # `opening_half()`.
    n_lift = max(1, int(math.ceil(TREATED_Z / NAIL_PITCH)))
    for lift in range(n_lift):
        z0 = lift * NAIL_PITCH
        z1 = min(TREATED_Z, (lift + 1) * NAIL_PITCH)
        if z1 - z0 < 0.15:
            continue
        mid = (z0 + z1) * 0.5
        d = face_d(mid) - FACING_T * 0.5
        keep = opening_half(z0) + 0.25       # widest point anywhere in the lift
        for s in (-1, 1):
            edge = A_PORTAL + s * keep
            far = CUT_TO if s > 0 else CUT_FROM
            w = abs(far - edge)
            if w < 0.8:
                continue
            box('facing-%d-%d' % (lift, s + 1), (w, FACING_T, z1 - z0),
                d, (edge + far) * 0.5, mid, MAT_CRETE,
                _scale(CRETE_MID, 0.90 + 0.14 * S.rnd(lift * 1.7 + s, 21.0)),
                bevel=0.025)
            # THE MESH AT THE LIFT JOINT.  [FHWA-GEC7] §3.3.6c: the mesh sits
            # mid-thickness of the facing and each panel overlaps the next by
            # at least one full cell, so the joint between lifts is where mesh
            # is visible.  Drawn as a strip carrying the `mesh` material, whose
            # alpha cutout in assets.js authors 152 mm openings procedurally —
            # NOT as modelled 4.88 mm wire, which at 33 m is a twentieth of a
            # pixel and would be the sub-pixel mistake quarry_bench records
            # making twice.
            if z1 < TREATED_Z - 0.05:
                box('facing-joint-%d-%d' % (lift, s + 1), (w, 0.05, 0.14),
                    d - 0.03, (edge + far) * 0.5, z1, MAT_MESH, MESH_TINT)

    # ── the nail heads, in COLUMNS ──────────────────────────────────────────
    n_col = int((span - 2.0 * NAIL_EDGE_OFF) / NAIL_PITCH) + 1
    n_row = int((TREATED_Z - 2.0 * NAIL_EDGE_OFF) / NAIL_PITCH) + 1
    heads = 0
    for r in range(n_row):
        z = NAIL_EDGE_OFF + r * NAIL_PITCH
        for c in range(n_col):
            a = CUT_FROM + NAIL_EDGE_OFF + c * NAIL_PITCH
            if not box_clear(a, z, NAIL_PLATE * 0.5, NAIL_PLATE * 0.5, 0.95):
                continue
            d = face_d(z) - FACING_T
            base = at3(d, a, z)
            box('nail-plate-%d-%d' % (r, c),
                (NAIL_PLATE, NAIL_PLATE_T, NAIL_PLATE), d - NAIL_PLATE_T * 0.5,
                a, z, MAT_GALV, GALV_TINT, bevel=0.010)
            rod('nail-nut-%d-%d' % (r, c), base - V_AXIS * (NAIL_PLATE_T + 0.09),
                -V_AXIS, 0.09, NAIL_BAR_D * 0.9, MAT_GALV, GALV_DULL, sides=6)
            # the bar stub, at the sourced inclination below horizontal
            rod('nail-bar-%d-%d' % (r, c), base - V_AXIS * 0.02,
                -V_AXIS * math.cos(NAIL_ANGLE) - V_UP * math.sin(NAIL_ANGLE),
                0.26, NAIL_BAR_D * 0.5, MAT_GALV, GALV_DULL, sides=6)
            # "grout stains bleeding downslope from each head" [GEOSTAB-NAIL],
            # under every third head, on the facing itself.
            if (r + c) % 3 == 0:
                box('nail-grout-%d-%d' % (r, c), (0.20, 0.03, 0.70),
                    d + 0.01, a, z - 0.50, MAT_CRETE, GROUT_STAIN)
            heads += 1

    # ── the geocomposite drain strips, BETWEEN the nail columns ─────────────
    # [FHWA-GEC7] §6.9.3a and Figure 6.1: minimum 12 in wide, spacing 1.0-2.0 x
    # S_H and most commonly = S_H, centred between the nail columns — which is
    # the whole reason [CALTRANS-SN] specifies a columnar nail layout.
    for c in range(n_col - 1):
        a = CUT_FROM + NAIL_EDGE_OFF + (c + 0.5) * DRAIN_PITCH
        mid = TREATED_Z * 0.5
        if not box_clear(a, mid, DRAIN_W * 0.5, TREATED_Z * 0.5, 0.55):
            continue
        box('drain-strip-%d' % c, (DRAIN_W, 0.035, TREATED_Z - 0.30),
            face_d(mid) - FACING_T - 0.03, a, mid + 0.15,
            MAT_GALV, GALV_DULL)

    # ── the weepholes along the base ────────────────────────────────────────
    # [FHWA-GEC7] §6.9.3a: 2-4 in diameter, spaced 8-10 ft along the wall base.
    # The manual is explicit that these are judgement values — "no specific
    # calculations are performed" — which is worth knowing and does not make
    # them less real.
    n_weep = int(span / WEEP_PITCH)
    for i in range(n_weep):
        a = CUT_FROM + (i + 0.5) * WEEP_PITCH
        if not box_clear(a, 0.35, WEEP_D, WEEP_D, 0.75):
            continue
        rod('weephole-%d' % i, at3(face_d(0.35) - FACING_T - 0.10, a, 0.35),
            -V_AXIS, 0.16, WEEP_D * 0.5, MAT_GALV, GALV_DULL, sides=8)
    return heads


def build_drape():
    """ROCKFALL PROTECTION OVER THE CREST — §A.9's "netted, bolted slopes
    above", [DARDA-PORTAL]'s "rockfall nets", [GEOSTAB-NAIL]'s "2 200 sq ft of
    high-strength galvanised mesh".  [CALTRANS-SN] §8 makes the same point from
    the design side: "For a soil nail wall with a steep slope above the wall,
    potential rock fall and mud flow issues should be addressed."

    Hung from the crest, falling over the blasted rock between the top of the
    nailed wall and the crest, pinned by plate anchors.  A drape exists because
    rock falls out of a face IN THE WEATHER.  Nothing underground is netted
    against the sky, and this is the object that makes that unmistakable.
    """
    span = CUT_TO - CUT_FROM
    # THE DRAPE MUST NOT BE THE SKYLINE.  The first version hung it from
    # CUT_CREST_Z + 0.30, standing 1.25 m proud of the rock, in panels 5 m
    # wide — and the offline render came back with three flat slabs across the
    # top of the frame, taller than the crest, eating the sky the crest had
    # just been lowered to expose.  A drape is a SKIN: it is narrower than the
    # face it covers, it hangs BELOW the crest bar it is fixed to, and the rock
    # is what makes the skyline.
    z0, z1 = TREATED_Z - 0.45, CUT_CREST_Z - 0.35
    n = max(1, int(span / 2.2))
    pw = span / n
    for i in range(n):
        a = CUT_FROM + (i + 0.5) * pw
        mid = (z0 + z1) * 0.5
        if not box_clear(a, mid, pw * 0.5, (z1 - z0) * 0.5, 0.45):
            continue
        # It still stands OFF the face and wanders, because a net lying flat on
        # rock is a painted texture — but by 0.7 m, not 1.25 m.
        d = face_d(mid) - 0.70 + S.jitter(0.14, i * 2.1, 8.0)
        box('drape-%d' % i, (pw * 0.98, 0.05, z1 - z0), d, a, mid,
            MAT_MESH, _scale(DRAPE_TINT, 0.9 + 0.2 * S.rnd(i * 3.3, 14.0)))
        for j in range(2):
            pz = z0 + (z1 - z0) * (0.28 + 0.44 * j)
            box('drape-pin-%d-%d' % (i, j), (0.20, 0.06, 0.20),
                d - 0.06, a, pz, MAT_GALV, GALV_DULL)
    box('drape-crest-bar', (span * 0.98, 0.09, 0.11), face_d(z1) - 0.70,
        (CUT_FROM + CUT_TO) * 0.5, z1, MAT_GALV, GALV_TINT)


def build_apron():
    """WHAT THE DRIVE HAS PUT ON THE GROUND, AND THE DITCH THAT CATCHES WHAT
    COMES OFF THE CUT.

    §A.9: the apron "is a working platform *and* a haulage yard", with a spoil
    heap.  [DARDA-PORTAL] gives portal drainage as "channels, swales, collector
    pipes and inspection shafts" and gives no dimension for any of them.
    [HSE-L118] Reg 12 makes "loose ground or rocks above a roadway or
    workplace" an imminent-risk trigger, which is what a catch ditch answers.

    DELIBERATELY ABSENT: the batching plant, the ventilation fan and duct, the
    muck conveyor, the settlement package and the second machine.  All five are
    §A.9 inventory and all five are ALREADY DRAWN by `terrain.js`'s
    `kit === 'portal'` branch, into a merged vertex-coloured pool that costs no
    draw calls at all.  Duplicating them here would put a second apron in a file
    with six materials to spend, and `site.py`'s budget note is explicit that a
    .glb must not be additive.  What this file carries is what the procedural
    branch CANNOT do — the arch, the collar, the pre-support and the supported
    cut — and `research/sites/tunnel-portal.md` lists exactly which procedural
    blocks must be dropped in exchange.

    Ditch section, muck volumes and stockpile size are NOT SOURCED.
    """
    span = CUT_TO - CUT_FROM
    # The ditch is drawn as a fill strip and a bund rather than as a trench:
    # the ground belongs to terrain.js `heightAt()` and a site .glb may not
    # carry terrain (site.py, WHAT DOES NOT BELONG IN A SITE GLB).  The gap in
    # the middle is the haulage line out of the mouth, which crosses it.
    d = face_d(0.0) - DITCH_BACK
    gap = CROWN_R + 5.5                # the haulage line out of the mouth
    for s in (-1, 1):
        edge = A_PORTAL + s * gap
        far = CUT_TO if s > 0 else CUT_FROM
        w = abs(far - edge)
        if w < 2.0:
            continue
        box('ditch-fill-%d' % (s + 1), (w, 2.1, 0.34), d, (edge + far) * 0.5,
            0.16, MAT_ROCK, _scale(ROCK_LIT, 1.02), bevel=0.05)
        box('ditch-bund-%d' % (s + 1), (w, 0.8, 0.5), d - 1.35,
            (edge + far) * 0.5, 0.22, MAT_ROCK, _scale(ROCK_MID, 0.98),
            bevel=0.06)
        # A ditch full of crushed drainage stone is not a paving slab, which is
        # what the flat run read as in the first overview render.
        rubble('ditch-stone-%d' % (s + 1), d, (edge + far) * 0.5, 0.26,
               (w * 0.96, 1.9, 0.62), MAT_ROCK, _scale(ROCK_LIT, 0.97),
               block=0.55, n=18, seed=840.0 + s * 31)

    # THE MUCK COMING OUT OF THE HOLE — a spill on the haulage line and a
    # stockpile off to the side.  §A.9's photograph asks for a spoil heap on
    # the apron; this is the same rock the bore is making.
    rubble('muck-spill', D_PORTAL - 2.0, A_PORTAL - 0.2, 0.44,
           (5.4, 3.4, 0.95), MAT_ROCK, MUCK_TINT, block=0.60, n=24, seed=77.0)
    rubble('muck-stock', 27.5, -6.8, 1.05, (7.0, 5.6, 2.3), MAT_ROCK,
           _scale(MUCK_TINT, 1.06), block=1.05, n=20, seed=311.0)


# ═════════════════════════════════════════════════════════════════════════════
# NAMED NODES
# ═════════════════════════════════════════════════════════════════════════════

def build_anchors():
    """The nodes the game reads off this site.

    `mount:` is reused rather than a new prefix — `src/core/gltfRig.js` already
    indexes it and `site.finish()` already restores its world transform after
    the join, which is the contract that took this pipeline longest to get
    right (ASTRA §4.1).

    NONE OF THESE CARRIES `cone_deg` OR `range_m`, AND THAT IS THE POINT.
    Those two keys are what `src/core/env.js` reads to make a node a lamp.  A
    portal apron works in daylight, §A.9 asks for no lighting on one, and
    inventing floodlights would be inventing a detail.  `underground_drive`
    must publish lamps.  This file publishes zero, and `node tools/glbinfo.mjs`
    prints the extras on every mount — so the difference between the two
    archetypes is checkable off the two files without opening either.
    """
    S.anchor('site-collar', (0.0, 0.0, 0.0))
    px, py = on_axis(D_PORTAL, A_PORTAL)
    S.anchor('site-portal', (px, py, 0.0),
             opening_w=round(EXC_W, 3), opening_h=round(EXC_H, 3),
             spring_z=round(SPRING_Z, 3), bore_m=TUBE_DEPTH)
    tx, ty = on_axis(face_d(0.0) - DITCH_BACK, CUT_FROM + 4.0)
    S.anchor('site-cut-toe', (tx, ty, 0.0), treated_h=round(TREATED_Z, 3))
    mx, my = on_axis(27.5, -6.8)
    S.anchor('site-muck', (mx, my, 0.0))


# ═════════════════════════════════════════════════════════════════════════════

def build(out_path):
    S.reset()
    build_bore()
    build_collar()
    build_ribs()
    n_pipes = build_umbrella()
    n_barrels = build_barrels()
    build_cut_face()
    n_nails = build_facing()
    build_drape()
    build_apron()

    # KEEP-CLEAR ASSERTION, ON REAL VERTICES, BEFORE ANY JOIN.
    # "Preserve the live terrain/collar and the section seam" — the player must
    # still see the machine and the hole.  This checks THIS FILE's geometry; it
    # is not a competing dimension tool.  `tools/glbinfo.mjs` stays the only
    # ruler (ASTRA §5) and it measures the exported file, not the scene.
    bpy.context.view_layer.update()
    nearest, who = 1e9, ''
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        for v in o.data.vertices:
            p = o.matrix_world @ v.co
            r = math.hypot(p.x, p.y)
            if r < nearest:
                nearest, who = r, o.name
    if nearest < CLEAR_R:
        raise AssertionError(
            'tunnel-portal geometry inside the collar reserve (%.2f m < %.2f m)'
            ': %s' % (nearest, CLEAR_R, who))
    # The nearest object is NAMED even when the check passes.  "A gate over an
    # empty set passes forever" (ASTRA §8): a bare number tells a reader the
    # margin but not what is spending it, and the thing standing closest to the
    # machine is exactly what a reviewer needs to know.
    print('PORTAL_BUILD nearest=%.3f m (%s) reserve=%.2f m pipes=%d '
          'barrels=%d nails=%d'
          % (nearest, who, CLEAR_R, n_pipes, n_barrels, n_nails))

    build_anchors()
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    return S.finish(out_path)


def preview(path, tag='hero'):
    """Re-import the REAL export and render it with Cycles on the CPU.

    No proxy mesh and no in-memory scene: the thing rendered is the .glb the
    game would fetch, so a render cannot pass while the export is broken.  The
    lighting, camera and ground are INSPECTION FIXTURES and are not in the
    .glb.  This does not pretend to reproduce the game's procedural material
    renderer, and it is an OFFLINE BLENDER RENDER, never a gameplay capture.

    `hero` sits on the measured hero eye, direction, field and aspect, which is
    the only view that grades the composition.  `over` is an orthographic
    three-quarter for reading the plan.
    """
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 20
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 4
    scene.world = bpy.data.worlds.new('inspection-world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.62, .70, .80, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .8

    # One sun, high and from screen-left, so the bore is the only dark thing in
    # the frame and the cut face carries a raking light down it.
    bpy.ops.object.light_add(type='SUN', location=(0, 0, 40))
    sun = bpy.context.object
    sun.data.energy = 4.0
    sun.data.angle = 0.04
    sun.rotation_euler = (0.74, 0.0, -1.05)

    bpy.ops.mesh.primitive_plane_add(size=300)
    ground = bpy.data.materials.new('inspection-ground')
    ground.diffuse_color = (.36, .34, .30, 1)
    bpy.context.object.data.materials.append(ground)

    if tag == 'hero':
        # THE DIRECTION IS THE MEASURED ONE, NOT A LOOK-AT.  The first version
        # of this pointed the camera AT the portal, which centred the arch and
        # graded a composition the game will never show.  A preview that aims
        # itself is a preview of nothing.
        eye = Vector(EYE)
        bpy.ops.object.camera_add(location=eye)
        cam = bpy.context.object
        look = Vector((-0.6731, 0.7401, 0.0240)).normalized()
        cam.rotation_euler = look.to_track_quat('-Z', 'Y').to_euler()
        cam.data.sensor_fit = 'VERTICAL'
        cam.data.angle_y = 20.97 * D2R          # the measured hero field
        # THE ASPECT IS AMBIGUOUS AND THIS FILE SAYS SO RATHER THAN PICKING
        # QUIETLY.  quarry_bench.py's measured block reports aspect 1.724 AND
        # half-width 0.4023 per metre; with a 20.97 deg vertical field those
        # two disagree, because 0.4023/0.18515 is an aspect of 2.173.  The
        # vertical fits are internally consistent and the horizontal one is
        # not, and this module could not re-measure the live camera.  The
        # NARROWER aspect is rendered because it is the constrained case:
        # what fits at 1.724 also fits at 2.173.
        aspect = 1.724
        scene.render.resolution_x = 1280
        scene.render.resolution_y = int(round(1280 / aspect))
    else:
        eye = at3(-14.0, -24.0, 26.0)
        target = at3(D_PORTAL - 3.0, A_PORTAL - 1.0, 3.5)
        bpy.ops.object.camera_add(location=eye)
        cam = bpy.context.object
        cam.rotation_euler = (target - eye).to_track_quat('-Z', 'Y').to_euler()
        cam.data.type = 'ORTHO'
        cam.data.ortho_scale = 58
        scene.render.resolution_x = 1100
        scene.render.resolution_y = 800
    scene.camera = cam

    out = os.path.join(ROOT, 'shots', 'blender-tunnel-portal-%s.png' % tag)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('PORTAL_PREVIEW_REAL_GLB %s' % out)
    return out


if __name__ == '__main__':
    result = build(os.path.join(ROOT, 'public', 'models', 'sites',
                                'tunnel-portal.glb'))
    if '--preview' in sys.argv:
        preview(result, 'hero')
    if '--over' in sys.argv:
        preview(result, 'over')


# ═════════════════════════════════════════════════════════════════════════════
# THE EDGE ARTEFACT — inherited caution, NOT a reproduction
#
# `quarry_bench.py` records that geometry from its model reaching the outer
# ~6 % of the surface band's WIDTH comes back as vertical coloured speckle:
# present in every one of its builds at the same screen position, absent when
# only that model is hidden, unmoved by rewriting the offending object twice.
# Its cause is explicitly recorded as UNVERIFIED and the 2026-09-06 checkpoint
# says the renderer hypothesis remains unverified.
#
# THIS FILE HAS NOT REPRODUCED IT AND CLAIMS NOTHING ABOUT IT.  It is built to
# the same mitigation as a precaution, because the mitigation costs nothing
# here: the cut's side slope daylights as it comes toward the camera — which a
# real cut does — so near geometry stays inboard of about NDC x -0.86, and the
# face's right-hand end runs off frame at a distance where it is behind the
# band edge rather than on it.
#
# If the cause is found and it is not screen position, delete this note and put
# the side slope wherever the composition wants it.
# ═════════════════════════════════════════════════════════════════════════════
