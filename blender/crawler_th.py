"""
`crawler_th` — surface top-hammer crawler drill.  In-game marque: the
Steinbach TH-320 Ridgeline.  Real class: a 15–16 t self-contained tracked
surface drill with a folding boom, a single-piece feed beam, a hydraulic
drifter riding the beam, a carousel rod magazine, and an on-board screw
compressor whose air goes to hole flushing only.

WHAT THIS IS MODELLED FROM
--------------------------
Local reference: `research/rigs/crawler-th.md` (rev 4) — component inventory,
material split, and an honest list of what it could NOT source (§8: there is no
rig datasheet in the owner's folder at all, only tooling catalogues).  This
build closes most of §8 from manufacturer datasheets found on the web.  Every
constant below is tagged with the source it came from:

  [S1] Sandvik "Ranger DX800 T4 - 4 - EN 16228, 2019-12-27" technical
       specification sheet (mining.sandvik / dx800-t4-specification-sheet-
       english.pdf).  The only sheet found that publishes a machine WIDTH.
       Weight 15 600 kg · Width 2.45 m · Height a/b 3.2 m / 3.6 m ·
       Total length 11.3 m / 8.4 m · hole 76–127 mm · rods 45 or 51 mm ·
       rock drill 21/23 kW · engine 168 kW · flushing air 8.1 m3/min to 10 bar.
       Standard components: chain feed with movable drill steel support,
       carousel rod handler, articulated boom, turnable superstructure,
       on-board compressor, FOPS/ROPS cab, dust collection with primary
       separator, 9 working lights, hose reel with 3660 mm drill steel,
       EN 16228 safety cage for the feed.
  [S2] Epiroc "FlexiROC T35 and T40" brochure 9868 0058 01a, 2019-04, Orebro.
       Weight 15 500 kg · transport H1 3 200 / L1 11 600 mm and H2 3 500 /
       L2 11 000 mm · engine 168 kW at 2 200 rpm · feed extension 1 400 mm,
       feed rate 0.92 m/s, feed force 20 kN, feed total length 7 140 mm,
       travel length 4 240 mm · screw compressor 10.5 bar, 127 l/s FAD ·
       carousel 1 + 7 rods · 3.6 m extension rods to a 28 m hole ·
       hole 64–115 mm / 64–127 mm · ALUMINIUM PROFILE FEED BEAM ·
       hydraulic cylinder feed · double drill rod support with movable lower
       guide/dust hood · dust collector: suction hose diam 127 mm, 11 filter
       elements, 11 m2 filter area, 560 l/s at 500 mm wg · work lights front
       4 x 70 W, rear 2 x 70 W, feed 2 x 70 W · cab laminated glass 24 mm
       front, 10 mm roof, 8 mm side, 8 mm rear · track frames with SINGLE
       grouser pads and cleaning holes, hydraulic track oscillation, two-speed
       traction · rock drill 19–25 kW, 174–195 kg, 42–71 Hz, 1 180–1 970 Nm ·
       fuel tank 370 l, hydraulic oil tank 250 l.
  [S3] Epiroc "FlexiROC T35 R and T40 R" brochure 9868 0014 01, 2018-04.
       Same dimensions; adds "hydraulic support leg that can be used during
       tramming" and "boom anchor point in center of frame".
  [S4] Manufacturer product-page photography for the same machine (quarry-bench
       hero shot, rear-left three-quarter): bright superstructure over a dark
       grey main frame and undercarriage; ONE long side door running the whole
       engine bay; cab forward and to the LEFT of the boom with a bar guard
       over the side glass; beacon on a stalk at the rear; the feed towers well
       above the machine and stands a full track-length ahead of the front
       idler.
  [R1] `research/rigs/crawler-th.md` §4 §5 §6 §9 — component inventory, the
       thumbnail silhouette, the material split, and the correction that the
       feed beam is BARE BRIGHT EXTRUSION, not body-colour paint.
  [R2] `research/12-oem-rock-tooling.md` §C.2 via [R1] §3 — the one published
       field configuration for this duty: 20 m holes at 15 degrees in granite.
       That 15 degrees is the rake this model is posed at.

NAMING.  `DOMAIN.md` §10.  Every real designation lives in this comment block
and nowhere else.  No object name, no material name, no exported string carries
a manufacturer or a model number.  Shape is not branding.

AXES.  Blender Z-up; the exporter flips to three.js Y-up, so Blender -Y is the
machine's FORWARD and lands on three.js +Z — the same forward the procedural
`buildCrawlerTH()` uses.  Origin is the undercarriage centre at ground level:
this machine's superstructure is fixed to the frame and the BOOM does the
slewing ([S3] "boom anchor point in center of frame"), so its turning centre is
the track centre rather than a slew ring, and that is what the origin sits on.
"""

import os
import sys
import math

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))

import bpy                                                    # noqa: E402
import rig as R                                               # noqa: E402

TAU = math.pi * 2
D2R = math.pi / 180.0
C = bpy.context

# ── CARRIER ───────────────────────────────────────────────────────────────────
WIDTH      = 2.45      # [S1] published machine width
SHOE_W     = 0.55      # derived: WIDTH = track gauge + one shoe width
GAUGE      = WIDTH - SHOE_W                     # 1.90 m centre to centre
TRACK_LEN  = 3.75      # DERIVED, not published.  [S4] shows the track visibly
                       # longer than the engine bay, and [R1] §3 has the feed
                       # standing "about a full track-length ahead of the front
                       # idler"; 3.75 m makes that reach agree with the ~5.5 m
                       # boom coverage figure printed on [S2]'s coverage plot.
IDLER_R    = 0.34      # DERIVED from TRACK_LEN and a six-roller bottom run
SHOE_T     = 0.055     # shoe plate thickness, derived
GROUSER_H  = 0.055     # SINGLE grouser pad [S2]
SHOE_PITCH = 0.19      # derived so the loop closes on whole shoes
DECK_Z     = 0.99      # main frame top plate.  DERIVED so the cab roof lands at
                       # 2.78 m and the enclosure roof at 2.34 m, both under the
                       # 3.2 m transport height of [S2] with the feed dumped.
BODY_W     = 2.30      # main frame width, inboard of the tracks
BODY_FRONT = -1.98     # frame nose — machine forward is -Y
BODY_REAR  = 2.16

# ── SUPERSTRUCTURE ────────────────────────────────────────────────────────────
ENC_Y0, ENC_Y1 = 0.10, 2.10      # engine + compressor enclosure, fore and aft
ENC_H      = 1.35                # roof at DECK_Z + ENC_H = 2.34 m
CAB_X      = -0.66               # cab forward and LEFT of the boom [S4]
CAB_W, CAB_D, CAB_H = 1.08, 1.34, 1.79

# ── BOOM ──────────────────────────────────────────────────────────────────────
KING_X, KING_Y, KING_Z = 0.30, -1.62, 1.14      # boom anchor, centre of frame [S3]
BOOM1_LEN  = 2.55      # DERIVED to reach the coverage envelope of [S2] / [S3]
BOOM2_LEN  = 1.85
# Sign convention: boom sections are drawn along local -Y, and Rx(t) maps
# (0,-1,0) to (0,-cos t,-sin t), so a NEGATIVE X rotation is what raises a
# boom.  BOOM_LIFT + BOOM_FOLD is therefore the boom nose's final pitch, and
# the feed-tilt angle below is solved from it rather than guessed.
BOOM_LIFT  = -30.0 * D2R         # section 1: nose 30 deg above horizontal
BOOM_FOLD  = 65.0 * D2R          # section 2, relative: nose 35 deg BELOW
BOOM_SWING = -6.0 * D2R

# ── FEED ──────────────────────────────────────────────────────────────────────
# [S2] gives feed "Total length 7 140 mm" and "Feed extension 1 400 mm".  The
# extension is the whole feed sliding on its cradle, so the BEAM itself is
# 7 140 - 1 400 = 5 740 mm.  Cross-checked against [S2] "Travel length
# 4 240 mm" — the carriage stroke, i.e. one 3.6 m rod plus shank and coupling.
# 4.24 m of stroke, a 0.95 m drifter and the rod support at the foot need about
# 5.7 m of beam, so the two published figures agree with each other.
BEAM_LEN     = 5.74
FEED_EXT     = 1.40    # [S2]
CARR_TRAVEL  = 4.24    # [S2] travel length — the carriage's stroke
BEAM_W, BEAM_D = 0.26, 0.20
FEED_RAKE    = 15.0 * D2R        # [R2] published field case: 20 m holes at 15 deg
CRADLE_UP    = 1.35    # how far up the beam the cradle grips it.  DERIVED:
                       # solved so that with the boom in the posed attitude the
                       # beam foot lands at z = 0.42 m and the rubber dust
                       # curtain hanging below it just kisses the ground —
                       # a top-hammer rig collars with the hood ON the rock.
BEAM_FWD     = -0.36   # the beam stands this far FORWARD of the boom nose, so
                       # the nose casting sits behind the beam instead of
                       # inside it
ROD_LEN      = 3.66    # [S1] drill steel 3 660 mm; [S2] 3.6 m extension rods
ROD_DIA      = 0.051   # [S1] 51 mm rods — the 89–127 mm hole class
CAROUSEL_N   = 7       # [S2] "carousel type rod handling system, 1 + 7 rods"
SUCTION_R    = 0.127 / 2         # [S2] suction hose diam 127 mm


# ══════════════════════════════════════════════════════════════════════════════
# helpers layered on lib/rig.py
# ══════════════════════════════════════════════════════════════════════════════

def _apply_mods(o, seg=None):
    """Bake an object's modifiers into its mesh NOW.

    `finish()` joins meshes by material, and Blender's join keeps only the
    ACTIVE object's modifier stack — so a bevel left unapplied on any object
    that is not the join target is silently thrown away and the machine goes
    straight back to reading as cardboard.  Applying at creation makes every
    join safe and lets `clone()` share one baked mesh across hundreds of copies.

    `seg` drops the bevel to one segment.  `rig.box()` always asks for two,
    which is right for a big painted panel and wasteful on a part cloned two
    hundred times: a two-segment bevel on a cube is ~470 triangles against ~150
    for one segment, and at the size of a track shoe nobody can tell.
    """
    if not o.modifiers:
        return o
    if seg is not None:
        for m in o.modifiers:
            if m.type == 'BEVEL':
                m.segments = seg
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    C.view_layer.objects.active = o
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    return o


def bx(name, size, mat=R.MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
       bevel=0.012, seg=None):
    """A bevelled box, in TRUE METRES, with the bevel already baked.

    !! BUG IN THE SHARED LIBRARY, COMPENSATED HERE !!
    `lib/rig.py` `box()` calls `primitive_cube_add(size=1)` — which is already a
    unit cube, vertices at +/-0.5 — and then sets `scale = size/2`.  That halves
    it a second time, so a box asked for at (2.0, 1.0, 0.5) exports at
    (1.0, 0.5, 0.25).  Measured in Blender, not assumed.

    Every dimension in this file is a real metre traceable to a datasheet, so
    the doubling happens HERE and `rig.py` is left untouched: other machines are
    being built against that file in parallel right now, and silently doubling
    every box in the fleet mid-flight would be worse than the bug.  The fix
    belongs in `rig.py` — `o.scale = (size[0] / 2, ...)` should be
    `o.scale = (size[0], ...)` — landed in ONE commit with every machine that
    has compensated for it.  `tube()` is correct: r = 0.5, len = 3.0 measures
    1.0 x 1.0 x 3.0.

    The bevel is applied AFTER the scale is baked, so it is unaffected by the
    doubling and stays in true metres.  It is small and always on: a hard
    90-degree edge is the single biggest tell of a game prop, and it costs
    triangles, not draw calls.
    """
    return _apply_mods(
        R.box(name, (size[0] * 2, size[1] * 2, size[2] * 2), mat, parent, loc, rot, bevel),
        seg)


def tb(name, radius, length, mat=R.MAT_STEEL, parent=None, loc=(0, 0, 0),
       rot=(0, 0, 0), sides=12):
    return R.tube(name, radius, length, mat, parent, loc, rot, sides)


def clone(src, loc, rot=(0, 0, 0), parent=None, name=None):
    """A linked duplicate — shares the source mesh, so 160 track shoes cost one
    mesh and are still one draw call once joined."""
    o = src.copy()
    o.name = name or (src.name + '_c')
    o.location = loc
    o.rotation_euler = rot
    o.parent = parent if parent is not None else src.parent
    C.collection.objects.link(o)
    return o


def curve_to_mesh(o):
    """Hoses are Bezier curves.  A curve exports as its own primitive, so ten
    festoon hoses would be ten draw calls; converted to mesh they fall into the
    rubber bucket and cost one."""
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    C.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    return C.active_object


def weld(objs, label, parent):
    """Join one moving subassembly's meshes by material.

    `finish()` deliberately leaves anything under a `pivot:` / `slide:` node
    alone because it has to move independently — but that means a feed built
    from ninety parts is ninety draw calls.  Everything inside ONE moving node
    moves together, so it can be joined by material exactly the way the statics
    are, and that is what keeps this machine inside the 70-call budget.
    """
    groups = {}
    for o in objs:
        if o is None or o.type != 'MESH':
            continue
        key = o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault(key, []).append(o)
    out = []
    for key, grp in groups.items():
        if len(grp) > 1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in grp:
                o.select_set(True)
            C.view_layer.objects.active = grp[0]
            bpy.ops.object.join()
        a = grp[0]
        a.name = label + ':' + key
        a.parent = parent
        out.append(a)
    return out


def hz(name, size, parent, loc, rot=(0, 0, 0)):
    """A hazard-striped plate.  Cheap, and the yellow/black decal is one of the
    things [R1] §7 photo 4 calls out as reading at distance."""
    return bx(name, size, R.MAT_HAZARD, parent, loc, rot, bevel=0.004)


def ram(name, parent, base, tip, barrel_r=0.055, rod_r=0.032, mat_b=R.MAT_DARK,
        mat_eye=R.MAT_CAST):
    """A hydraulic cylinder drawn between two points: barrel off the base, bare
    chrome rod out of the gland, a gland nut and two cast eye-ends.  Without
    those three it is just two cylinders.  Cylinder rods are the brightest and
    most specular thing on a working machine ([R1] §6) and the eye finds them
    first, so they get their own material.
    """
    bxx, byy, bzz = base
    dx, dy, dz = tip[0] - bxx, tip[1] - byy, tip[2] - bzz
    L = math.sqrt(dx * dx + dy * dy + dz * dz)
    ry = math.atan2(math.sqrt(dx * dx + dy * dy), dz)
    rz = math.atan2(dy, dx) - math.pi / 2
    rot = (0.0, ry, rz)
    bl = L * 0.58
    f = bl / L
    return [
        tb(name + '_barrel', barrel_r, bl, mat_b, parent, base, rot, 12),
        tb(name + '_rod', rod_r, L, R.MAT_CHROME, parent, base, rot, 10),
        tb(name + '_gland', barrel_r * 1.16, 0.055, R.MAT_WORN, parent,
           (bxx + dx * f, byy + dy * f, bzz + dz * f), rot, 12),
        tb(name + '_eyeA', barrel_r * 1.05, 0.075, mat_eye, parent, base,
           (rot[0], rot[1] + math.pi / 2, rot[2]), 10),
        tb(name + '_eyeB', rod_r * 1.7, 0.062, mat_eye, parent, tip,
           (rot[0], rot[1] + math.pi / 2, rot[2]), 10),
    ]


def lamp(name, parent, loc, aim, cone=54, rng=26, watt=70):
    """A work light: the visible housing, the stone guard a lamp needs when it
    lives 300 mm off a face being drilled, and the two named nodes
    `src/core/env.js` reads EVERY FRAME to re-aim its spotlight.

    [S2] itemises this machine's lamps exactly — four front, two rear, two on
    the feed, all 70 W — so the count and placement are sourced, not decorated.
    The housing is `paintedDark` / `wornSteel`, both of which every host node
    already owns, so a lamp adds triangles and no draw call; only the lens is
    glass, and it joins the glass bucket its host already has.
    """
    mount, aimnode = R.worklight(name, parent, loc, aim, cone, rng)
    mount['watt_w'] = watt
    mount['colour_hex'] = 0xFFE9C0
    m = [
        bx(name + '_stalk', (0.036, 0.036, 0.16), R.MAT_DARK, mount, (0, 0, -0.10)),
        bx(name + '_shell', (0.27, 0.13, 0.18), R.MAT_DARK, mount, (0, 0.02, 0)),
        bx(name + '_lens', (0.22, 0.012, 0.14), R.MAT_GLASS, mount, (0, -0.055, 0)),
        bx(name + '_barH', (0.28, 0.013, 0.013), R.MAT_WORN, mount, (0, -0.075, 0.086),
           bevel=0.0),
    ]
    for i in range(4):
        m.append(bx(name + '_bar%d' % i, (0.013, 0.013, 0.20), R.MAT_WORN, mount,
                    (-0.096 + i * 0.064, -0.075, 0), bevel=0.0))
    return mount, aimnode, m


# ══════════════════════════════════════════════════════════════════════════════
# 1 — UNDERCARRIAGE
# ══════════════════════════════════════════════════════════════════════════════

def build_undercarriage():
    """Excavator-type crawler.

    [S2] verbatim: "Track frames with single grouser pads and cleaning holes,
    hydraulic track oscillation and two speed traction."  So: ONE grouser bar
    per shoe, not three, and a real transverse oscillation axle between the
    frames.  [R1] §4 wants a drive sprocket at one end, an idler with a grease
    tensioner at the other, five to seven bottom rollers and carrier rollers on
    the top run — all of which are here, because at thumbnail size the
    undercarriage is a third of the silhouette.
    """
    a = (TRACK_LEN - 2 * IDLER_R) / 2.0          # half the straight run
    ax_z = IDLER_R + SHOE_T                      # axle line height

    shoe = bx('shoe_src', (SHOE_W, SHOE_PITCH * 0.94, SHOE_T), R.MAT_DARK,
              loc=(0, 0, -50), bevel=0.006, seg=1)
    grouser = bx('grouser_src', (SHOE_W * 0.92, 0.030, GROUSER_H), R.MAT_DARK,
                 loc=(0, 0, -50), bevel=0.0)
    tooth = bx('tooth_src', (SHOE_W * 0.46, 0.05, 0.10), R.MAT_WORN,
               loc=(0, 0, -50), bevel=0.008, seg=1)
    roller = tb('roller_src', 0.105, SHOE_W * 0.42, R.MAT_WORN, None, (0, 0, -50),
                (0, math.pi / 2, 0), 10)

    per = 4 * a + TAU * IDLER_R
    n = int(round(per / SHOE_PITCH))
    step = per / n

    def at(s):
        """Position and tangent angle at arc length `s` round the track loop."""
        s = s % per
        if s < 2 * a:                                    # bottom run, rear to front
            return (a - s, 0.0, 0.0)
        s -= 2 * a
        if s < math.pi * IDLER_R:                        # front wheel
            t = s / IDLER_R
            return (-a - IDLER_R * math.sin(t), IDLER_R - IDLER_R * math.cos(t), t)
        s -= math.pi * IDLER_R
        if s < 2 * a:                                    # top run, front to rear
            return (-a + s, 2 * IDLER_R, math.pi)
        s -= 2 * a
        t = s / IDLER_R
        return (a + IDLER_R * math.sin(t), IDLER_R + IDLER_R * math.cos(t),
                math.pi + t)

    for side in (-1, 1):
        cx = side * GAUGE / 2
        for i in range(n):
            y, z, ang = at(i * step)
            zc = z + SHOE_T / 2
            clone(shoe, (cx, y, zc), (-ang, 0, 0), name='shoe_%d_%d' % (side, i))
            clone(grouser, (cx, y - math.sin(ang) * 0.043, zc - math.cos(ang) * 0.043),
                  (-ang, 0, 0), name='grouser_%d_%d' % (side, i))

        # deep welded track frame, plus the skirt and the guide guard over the
        # top run that [R1] §4 asks for
        bx('trackframe_%d' % side, (SHOE_W * 0.62, TRACK_LEN * 0.80, 0.50), R.MAT_DARK,
           loc=(cx, 0, ax_z - 0.02), bevel=0.02)
        bx('frameskirt_%d' % side, (SHOE_W * 0.80, TRACK_LEN * 0.56, 0.20), R.MAT_DARK,
           loc=(cx, 0, ax_z + 0.26), bevel=0.02)
        bx('topguard_%d' % side, (SHOE_W * 1.02, TRACK_LEN * 0.40, 0.07), R.MAT_DARK,
           loc=(cx, 0.25, ax_z + 0.40), bevel=0.012)

        # drive sprocket at the REAR, idler at the front: a drill rig trams
        # nose-first onto the pattern and reverses off it
        tb('sprocket_%d' % side, IDLER_R * 0.86, SHOE_W * 0.52, R.MAT_WORN, None,
           (cx - SHOE_W * 0.26, a, ax_z), (0, math.pi / 2, 0), 14)
        tb('sprockethub_%d' % side, IDLER_R * 0.40, SHOE_W * 0.66, R.MAT_CAST, None,
           (cx - SHOE_W * 0.33, a, ax_z), (0, math.pi / 2, 0), 12)
        for i in range(18):
            t = TAU * i / 18
            clone(tooth, (cx, a + math.sin(t) * IDLER_R * 0.90,
                          ax_z + math.cos(t) * IDLER_R * 0.90),
                  (-t, 0, 0), name='tooth_%d_%d' % (side, i))
        tb('idler_%d' % side, IDLER_R * 0.88, SHOE_W * 0.46, R.MAT_WORN, None,
           (cx - SHOE_W * 0.23, -a, ax_z), (0, math.pi / 2, 0), 14)
        # the grease-cylinder track tensioner behind the idler — [R1] §4
        tb('tensioner_%d' % side, 0.075, 0.46, R.MAT_WORN, None,
           (cx, -a + 0.10, ax_z), (-math.pi / 2, 0, 0), 10)

        for i in range(6):
            y = -a * 0.86 + (a * 1.72) * i / 5.0
            clone(roller, (cx - SHOE_W * 0.21, y, 0.135), (0, math.pi / 2, 0),
                  name='broller_%d_%d' % (side, i))
        for i in range(2):
            y = -a * 0.42 + (a * 0.84) * i
            clone(roller, (cx - SHOE_W * 0.21, y, ax_z + 0.30), (0, math.pi / 2, 0),
                  name='croller_%d_%d' % (side, i))
        tb('finaldrive_%d' % side, 0.20, 0.30, R.MAT_CAST, None,
           (cx + SHOE_W * 0.10, a, ax_z), (0, side * math.pi / 2, 0), 12)

    # [S2] hydraulic track oscillation — so there is a real transverse pivot
    bx('undercarriage_beam', (GAUGE + 0.10, 0.62, 0.34), R.MAT_DARK,
       loc=(0, -0.05, ax_z + 0.06), bevel=0.02)
    tb('osc_pin', 0.09, GAUGE * 0.9, R.MAT_WORN, None,
       (-GAUGE * 0.45, -0.05, ax_z + 0.06), (0, math.pi / 2, 0), 10)

    for o in (shoe, grouser, tooth, roller):
        bpy.data.objects.remove(o, do_unlink=True)


# ══════════════════════════════════════════════════════════════════════════════
# 2 — MAIN FRAME, ENGINE / COMPRESSOR ENCLOSURE, CAB, DECK
# ══════════════════════════════════════════════════════════════════════════════

def build_superstructure():
    ax_z = IDLER_R + SHOE_T

    # dark-grey lower structure under bright upper panels — [R1] §6 says that
    # split does most of the work of reading as a machine rather than a mass
    bx('frame_plate', (BODY_W, BODY_REAR - BODY_FRONT, 0.26), R.MAT_DARK,
       loc=(0, (BODY_FRONT + BODY_REAR) / 2, DECK_Z - 0.13), bevel=0.02)
    bx('frame_belly', (BODY_W * 0.88, (BODY_REAR - BODY_FRONT) * 0.80, 0.22), R.MAT_DARK,
       loc=(0, 0.10, DECK_Z - 0.35), bevel=0.02)
    bx('rockguard', (BODY_W * 0.94, 1.30, 0.06), R.MAT_WORN,
       loc=(0, -1.10, DECK_Z - 0.40), bevel=0.01)          # [R1] §4 guarding
    bx('turret_ring', (1.30, 1.30, 0.14), R.MAT_DARK, loc=(0, 0.05, ax_z + 0.28),
       bevel=0.02)

    # ── engine + screw compressor enclosure ──────────────────────────────────
    # One package: diesel, hydraulic pumps and the screw compressor.  [S2] the
    # compressor is 10.5 bar / 127 l/s — flushing air only — so this bay is
    # normal-sized and NOT the dominant cylinder a DTH rig carries ([R1] §4).
    ey = (ENC_Y0 + ENC_Y1) / 2
    ed = ENC_Y1 - ENC_Y0
    bx('enclosure', (2.24, ed, ENC_H), R.MAT_PAINT, loc=(0, ey, DECK_Z + ENC_H / 2),
       bevel=0.035)
    bx('enc_roof', (2.30, ed + 0.06, 0.07), R.MAT_PAINT,
       loc=(0, ey, DECK_Z + ENC_H + 0.02), bevel=0.02)
    for side in (-1, 1):                                   # the one long side door [S4]
        bx('encdoor_%d' % side, (0.035, ed * 0.86, ENC_H * 0.62), R.MAT_PAINT,
           loc=(side * 1.13, ey - 0.04, DECK_Z + ENC_H * 0.48), bevel=0.014)
        bx('enchinge_%d' % side, (0.05, 0.05, ENC_H * 0.58), R.MAT_DARK,
           loc=(side * 1.14, ey - ed * 0.42, DECK_Z + ENC_H * 0.48), bevel=0.008)
        tb('enchandle_%d' % side, 0.018, 0.16, R.MAT_WORN, None,
           (side * 1.16, ey + ed * 0.38, DECK_Z + ENC_H * 0.40), (-math.pi / 2, 0, 0), 8)

    # cooling: the vertical louvre grille [R1] §4 calls a strong striped
    # texture.  One slat, cloned — triangles, not draw calls.
    # rear panel: vertical slats, twisted about Z so each blade turns its edge
    # to the viewer — that twist is what makes a grille read as a grille
    slat = bx('slat_src', (0.030, 0.022, 0.86), R.MAT_DARK, loc=(0, 0, -50), bevel=0.004, seg=1)
    for i in range(26):
        clone(slat, (-1.02 + 2.04 * i / 25.0, ENC_Y1 + 0.015, DECK_Z + ENC_H * 0.50),
              (0, 0, 0.42), name='louvre_r%d' % i)
    # side panel: HORIZONTAL slats running fore-and-aft, tilted about their own
    # long axis.  Its own source, because re-using the vertical one and turning
    # it 90 degrees about Y throws a 0.86 m blade straight out sideways.
    sslat = bx('sslat_src', (0.030, 0.86, 0.055), R.MAT_DARK, loc=(0, 0, -50),
               bevel=0.004, seg=1)
    for i in range(15):
        clone(sslat, (1.152, ey + 0.30, DECK_Z + 0.26 + 0.80 * i / 14.0),
              (0, 0.55, 0), name='louvre_s%d' % i)
    bx('louvre_frame_r', (2.16, 0.05, 0.98), R.MAT_DARK,
       loc=(0, ENC_Y1 + 0.035, DECK_Z + ENC_H * 0.50), bevel=0.012)
    # painted surround: a grille with no bezel is a black hole punched in the
    # bodywork, and the eye reads it as a missing panel rather than a radiator
    for dz, hh in ((0.55, 0.10), (-0.55, 0.10)):
        bx('grille_edge%d' % int(dz * 10), (2.24, 0.07, hh), R.MAT_PAINT,
           loc=(0, ENC_Y1 + 0.02, DECK_Z + ENC_H * 0.50 + dz), bevel=0.014)
    for sx in (-1, 1):
        bx('grille_side%d' % sx, (0.10, 0.07, 1.20), R.MAT_PAINT,
           loc=(sx * 1.07, ENC_Y1 + 0.02, DECK_Z + ENC_H * 0.50), bevel=0.014)
    bx('louvre_frame_s', (0.05, 0.92, 0.92), R.MAT_DARK,
       loc=(1.148, ey + 0.30, DECK_Z + 0.66), bevel=0.012)
    bpy.data.objects.remove(slat, do_unlink=True)
    bpy.data.objects.remove(sslat, do_unlink=True)

    # Exhaust stack.  A bare tube with a fatter tube on top is a primitive
    # standing in for a part, and REVIEW_RUBRIC axis 4 fails a visible
    # primitive outright.  What is actually up there: a stack with two clamp
    # bands, a bracket back to the roof, and a hinged rain flap sitting ajar.
    exx, exy, exz = 0.74, ENC_Y1 - 0.24, DECK_Z + ENC_H + 0.02
    tb('exhaust', 0.075, 0.60, R.MAT_WORN, None, (exx, exy, exz), (0, 0, 0), 12)
    for i in range(2):
        tb('exhaust_band%d' % i, 0.088, 0.035, R.MAT_WORN, None,
           (exx, exy, exz + 0.12 + i * 0.30), (0, 0, 0), 12)
    bx('exhaust_flap', (0.19, 0.19, 0.014), R.MAT_WORN,
       loc=(exx + 0.035, exy, exz + 0.625), rot=(0, 0.42, 0), bevel=0.006)
    tb('exhaust_hinge', 0.014, 0.16, R.MAT_WORN, None,
       (exx - 0.08, exy - 0.08, exz + 0.62), (-math.pi / 2, 0, 0), 8)
    bx('exhaust_bracket', (0.05, 0.16, 0.16), R.MAT_DARK,
       loc=(exx - 0.10, exy, exz + 0.12), bevel=0.008)

    # Air cleaner: body, both end caps, two clamp bands, the rubber dust-ejector
    # valve that hangs off the bottom of every one of these, and the intake
    # elbow turning back down into the bay.
    acx, acy, acz = -0.80, ENC_Y1 - 0.30, DECK_Z + ENC_H + 0.03
    tb('aircleaner', 0.135, 0.54, R.MAT_DARK, None, (acx, acy, acz), (0, 0, 0), 14)
    tb('ac_cap_t', 0.148, 0.07, R.MAT_DARK, None, (acx, acy, acz + 0.50), (0, 0, 0), 14)
    tb('ac_cap_b', 0.148, 0.07, R.MAT_DARK, None, (acx, acy, acz - 0.02), (0, 0, 0), 14)
    for i in range(2):
        tb('ac_band%d' % i, 0.145, 0.028, R.MAT_WORN, None,
           (acx, acy, acz + 0.14 + i * 0.22), (0, 0, 0), 14)
    tb('ac_ejector', 0.032, 0.10, R.MAT_RUBBER, None, (acx, acy - 0.10, acz - 0.10),
       (0.35, 0, 0), 8)
    tb('ac_elbow', 0.075, 0.26, R.MAT_RUBBER, None, (acx + 0.13, acy, acz + 0.16),
       (0, math.pi / 2, 0), 10)

    # ── tanks ────────────────────────────────────────────────────────────────
    # [S2] fuel 370 l, hydraulic oil 250 l.  370 l at r = 0.33 is 1.08 m long;
    # that is what is drawn, so the tank reads at its real size instead of
    # being a decorative drum.
    tb('fuel_tank', 0.33, 1.08, R.MAT_PAINT, None,
       (-0.62, BODY_REAR - 0.16, DECK_Z + 0.36), (math.pi / 2, 0, 0), 16)
    tb('fuel_cap', 0.075, 0.06, R.MAT_WORN, None,
       (-0.62, BODY_REAR - 0.70, DECK_Z + 0.68), (0, 0, 0), 10)
    for i in range(2):        # the strap bands every saddle tank is held by
        tb('fuel_strap%d' % i, 0.345, 0.035, R.MAT_DARK, None,
           (-0.62, BODY_REAR - 0.42 - i * 0.44, DECK_Z + 0.36), (-math.pi / 2, 0, 0), 16)
    bx('hyd_tank', (0.78, 0.66, 0.62), R.MAT_PAINT,
       loc=(0.70, ENC_Y0 - 0.42, DECK_Z + 0.33), bevel=0.03)
    tb('hyd_sight', 0.030, 0.30, R.MAT_WORN, None,
       (1.08, ENC_Y0 - 0.42, DECK_Z + 0.12), (0, 0, 0), 8)

    # ── cab ──────────────────────────────────────────────────────────────────
    # FOPS/ROPS, forward and offset LEFT of the boom [S4], glazed on three faces
    # plus a roof window so the operator watches up the feed and down at the
    # collar at once ([R1] §3).  Pane thicknesses are [S2]: 24 mm front, 10 mm
    # roof, 8 mm sides and rear — drawn to scale, which is why the front pane
    # reads heavier than the side.
    cy = BODY_FRONT + CAB_D / 2 + 0.10
    cz = DECK_Z + CAB_H / 2
    bx('cab_shell', (CAB_W, CAB_D, CAB_H), R.MAT_PAINT, loc=(CAB_X, cy, cz), bevel=0.035)
    bx('cab_roof', (CAB_W + 0.07, CAB_D + 0.07, 0.06), R.MAT_PAINT,
       loc=(CAB_X, cy, DECK_Z + CAB_H + 0.01), bevel=0.02)
    bx('cab_floorplate', (CAB_W + 0.10, CAB_D + 0.10, 0.06), R.MAT_DARK,
       loc=(CAB_X, cy, DECK_Z - 0.01), bevel=0.014)
    bx('glass_front', (CAB_W - 0.11, 0.024, CAB_H - 0.34), R.MAT_GLASS,
       loc=(CAB_X, cy - CAB_D / 2 - 0.004, cz + 0.06), bevel=0.006)
    bx('glass_roof', (CAB_W - 0.20, CAB_D * 0.46, 0.010), R.MAT_GLASS,
       loc=(CAB_X, cy - CAB_D * 0.20, DECK_Z + CAB_H - 0.02), bevel=0.004)
    bx('glass_left', (0.008, CAB_D - 0.20, CAB_H - 0.52), R.MAT_GLASS,
       loc=(CAB_X - CAB_W / 2 - 0.003, cy, cz + 0.10), bevel=0.004)
    bx('glass_right', (0.008, CAB_D - 0.26, CAB_H - 0.62), R.MAT_GLASS,
       loc=(CAB_X + CAB_W / 2 + 0.003, cy + 0.04, cz + 0.12), bevel=0.004)
    bx('glass_rear', (CAB_W - 0.24, 0.008, CAB_H - 0.66), R.MAT_GLASS,
       loc=(CAB_X, cy + CAB_D / 2 + 0.003, cz + 0.10), bevel=0.004)
    # the flyrock guard over front and side glass — normal on this class [R1] §4
    gbar = bx('gbar_src', (0.020, 0.020, CAB_H - 0.36), R.MAT_WORN,
              loc=(0, 0, -50), bevel=0.0)
    for i in range(7):
        clone(gbar, (CAB_X - (CAB_W - 0.16) / 2 + (CAB_W - 0.16) * i / 6.0,
                     cy - CAB_D / 2 - 0.045, cz + 0.06), name='guard_f%d' % i)
    for i in range(6):
        clone(gbar, (CAB_X - CAB_W / 2 - 0.045,
                     cy - (CAB_D - 0.22) / 2 + (CAB_D - 0.22) * i / 5.0, cz + 0.10),
              name='guard_l%d' % i)
    bpy.data.objects.remove(gbar, do_unlink=True)
    bx('cab_door_frame', (0.045, CAB_D - 0.12, CAB_H - 0.10), R.MAT_DARK,
       loc=(CAB_X - CAB_W / 2 - 0.012, cy, cz), bevel=0.010)
    bx('wiper', (0.016, 0.016, 0.52), R.MAT_DARK,
       loc=(CAB_X + 0.16, cy - CAB_D / 2 - 0.06, cz + 0.02), rot=(0.5, 0, 0), bevel=0.003)
    bx('mirror', (0.20, 0.05, 0.15), R.MAT_DARK,
       loc=(CAB_X - CAB_W / 2 - 0.16, cy - CAB_D * 0.34, cz + 0.55), bevel=0.01)
    tb('mirror_arm', 0.016, 0.20, R.MAT_DARK, None,
       (CAB_X - CAB_W / 2 - 0.02, cy - CAB_D * 0.34, cz + 0.60), (0, -math.pi / 2, 0), 8)

    # ── walkway, kick plate, handrails, ladder ───────────────────────────────
    bx('walkway', (BODY_W - 0.06, 0.92, 0.05), R.MAT_WORN,
       loc=(0, ENC_Y0 - 0.86, DECK_Z + 0.03), bevel=0.008)
    hz('kickplate_l', (0.04, 0.92, 0.13), None,
       (-BODY_W / 2 + 0.02, ENC_Y0 - 0.86, DECK_Z + 0.10))
    hz('kickplate_r', (0.04, 0.92, 0.13), None,
       (BODY_W / 2 - 0.02, ENC_Y0 - 0.86, DECK_Z + 0.10))
    post = tb('post_src', 0.024, 1.02, R.MAT_PAINT, None, (0, 0, -50), (0, 0, 0), 8)
    for i, (px, py) in enumerate([(-1.10, ENC_Y0 - 0.30), (-1.10, ENC_Y0 - 1.28),
                                  (1.10, ENC_Y0 - 1.28), (1.10, ENC_Y0 - 0.30)]):
        clone(post, (px, py, DECK_Z + 0.06), name='rpost%d' % i)
    for h in (1.02, 0.56):                      # top rail plus mid rail [R1] §4
        tb('rail_l%d' % int(h * 100), 0.021, 0.98, R.MAT_PAINT, None,
           (-1.10, ENC_Y0 - 1.28, DECK_Z + 0.06 + h), (-math.pi / 2, 0, 0), 8)
        tb('rail_r%d' % int(h * 100), 0.021, 0.98, R.MAT_PAINT, None,
           (1.10, ENC_Y0 - 1.28, DECK_Z + 0.06 + h), (-math.pi / 2, 0, 0), 8)
        tb('rail_f%d' % int(h * 100), 0.021, 2.20, R.MAT_PAINT, None,
           (-1.10, ENC_Y0 - 1.28, DECK_Z + 0.06 + h), (0, math.pi / 2, 0), 8)
    bpy.data.objects.remove(post, do_unlink=True)

    bx('ladder_stile_a', (0.04, 0.05, 1.05), R.MAT_DARK,
       loc=(BODY_W / 2 - 0.06, ENC_Y0 - 1.08, DECK_Z - 0.52), bevel=0.008)
    bx('ladder_stile_b', (0.04, 0.05, 1.05), R.MAT_DARK,
       loc=(BODY_W / 2 - 0.06, ENC_Y0 - 0.62, DECK_Z - 0.52), bevel=0.008)
    rung = bx('rung_src', (0.26, 0.42, 0.035), R.MAT_WORN, loc=(0, 0, -50), bevel=0.006, seg=1)
    for i in range(3):
        clone(rung, (BODY_W / 2 - 0.06, ENC_Y0 - 0.85, DECK_Z - 0.95 + i * 0.32),
              name='rung%d' % i)
    bpy.data.objects.remove(rung, do_unlink=True)

    # Beacon: stalk, base, amber lens, cap, and the four-bar guard any beacon
    # living this close to a swinging feed beam ends up wearing.
    bcx, bcy, bcz = 0.98, ENC_Y1 - 0.16, DECK_Z + ENC_H + 0.04
    tb('beacon_stalk', 0.020, 0.32, R.MAT_DARK, None, (bcx, bcy, bcz), (0, 0, 0), 8)
    tb('beacon_base', 0.070, 0.06, R.MAT_DARK, None, (bcx, bcy, bcz + 0.29), (0, 0, 0), 12)
    tb('beacon_lens', 0.062, 0.11, R.MAT_HAZARD, None, (bcx, bcy, bcz + 0.35), (0, 0, 0), 12)
    tb('beacon_top', 0.070, 0.03, R.MAT_DARK, None, (bcx, bcy, bcz + 0.46), (0, 0, 0), 12)
    for i in range(4):
        t = TAU * i / 4
        tb('beacon_guard%d' % i, 0.008, 0.18, R.MAT_WORN, None,
           (bcx + math.sin(t) * 0.076, bcy + math.cos(t) * 0.076, bcz + 0.32),
           (0, 0, 0), 6)

    hz('hz_rear_l', (0.44, 0.03, 0.16), None, (-0.92, ENC_Y1 + 0.05, DECK_Z + 0.12))
    hz('hz_rear_r', (0.44, 0.03, 0.16), None, (0.92, ENC_Y1 + 0.05, DECK_Z + 0.12))
    hz('hz_step', (0.26, 0.34, 0.03), None,
       (BODY_W / 2 - 0.06, ENC_Y0 - 0.85, DECK_Z + 0.06))

    # A blank data plate.  DOMAIN.md §10: geometry only — the runtime paints the
    # rig's own invented marque onto it.  Nothing is lettered here.
    bx('data_plate', (0.006, 0.26, 0.17), R.MAT_WORN,
       loc=(-1.155, ENC_Y0 + 0.30, DECK_Z + 0.86), bevel=0.003)


# ══════════════════════════════════════════════════════════════════════════════
# 3 — GROUND SUPPORTS
# ══════════════════════════════════════════════════════════════════════════════

def build_supports():
    """[S3] "hydraulic support leg that can be used during tramming" — a single
    FRONT leg under the boom anchor, not a set of four outriggers.  [S1] adds a
    "hydraulic rear ground support", which on this class is a blade rather than
    a pad.  Both sit on `slide:` nodes so the game can put the machine into the
    drilling pose with the tracks visibly unloaded ([R1] §9 W8).
    """
    leg = R.empty(R.NODE_SLIDE, 'support-leg-front', None,
                  (0.30, BODY_FRONT - 0.16, DECK_Z - 0.30))
    g = [bx('leg_bracket', (0.42, 0.34, 0.30), R.MAT_DARK, leg, (0, 0.10, 0.06), bevel=0.016)]
    g += ram('leg_ram', leg, (0, 0, 0.02), (0, 0, -0.62), 0.070, 0.045,
             mat_eye=R.MAT_WORN)
    g.append(bx('leg_pad', (0.44, 0.44, 0.06), R.MAT_WORN, leg, (0, 0, -0.66), bevel=0.012))
    g.append(tb('leg_ball', 0.075, 0.09, R.MAT_CAST, leg, (0, 0, -0.72), (0, 0, 0), 10))
    weld(g, 'support-front', leg)

    blade = R.empty(R.NODE_SLIDE, 'ground-support-rear', None,
                    (0.0, BODY_REAR + 0.06, DECK_Z - 0.34))
    g = [bx('blade', (1.55, 0.10, 0.34), R.MAT_DARK, blade, (0, 0.14, -0.36), bevel=0.016),
         hz('blade_edge', (1.55, 0.06, 0.07), blade, (0, 0.14, -0.54))]
    for s in (-1, 1):
        g.append(bx('blade_arm_%d' % s, (0.14, 0.46, 0.16), R.MAT_DARK, blade,
                    (s * 0.52, -0.06, -0.20), (0.6, 0, 0), bevel=0.012))
        g += ram('blade_ram_%d' % s, blade, (s * 0.52, -0.30, 0.10),
                 (s * 0.52, 0.10, -0.32), 0.060, 0.038, mat_eye=R.MAT_WORN)
    weld(g, 'support-rear', blade)


# ══════════════════════════════════════════════════════════════════════════════
# 4 — BOOM
# ══════════════════════════════════════════════════════════════════════════════

def build_boom():
    """A folding, articulated boom: swing at the anchor, a lift ram, a folding
    front section, and the feed cradle at the nose.  [R1] §4: the boom "is what
    puts the feed anywhere in a working envelope; it is the joint that makes
    inclined and offset holes possible."

    Node chain, every name looked up BY STRING by `rigFactory.js`:
        pivot:boom-swing -> pivot:boom-lift -> pivot:boom-fold -> pivot:feed-tilt
    """
    clip = bx('clip_src', (0.26, 0.040, 0.018), R.MAT_DARK, loc=(0, 0, -50),
              bevel=0.004, seg=1)

    swing = R.empty(R.NODE_PIVOT, 'boom-swing', None, (KING_X, KING_Y, KING_Z),
                    (0, 0, BOOM_SWING))
    sg = [bx('kingpost', (0.46, 0.46, 0.60), R.MAT_DARK, swing, (0, 0, -0.06), bevel=0.02),
          tb('kingpin', 0.085, 0.72, R.MAT_CHROME, swing, (0, 0, -0.34), (0, 0, 0), 12),
          bx('swing_yoke', (0.52, 0.36, 0.34), R.MAT_CAST, swing, (0, -0.08, 0.22),
             bevel=0.016)]
    for s in (-1, 1):     # the swing rams that put the hole off the centreline
        sg += ram('swing_ram_%d' % s, swing, (s * 0.36, 0.30, 0.02),
                  (s * 0.16, -0.30, 0.02), 0.048, 0.028)
    weld(sg, 'boom-swing', swing)

    lift = R.empty(R.NODE_PIVOT, 'boom-lift', swing, (0, -0.10, 0.24), (BOOM_LIFT, 0, 0))
    lg = [bx('boom1', (0.34, BOOM1_LEN, 0.42), R.MAT_PAINT, lift,
             (0, -BOOM1_LEN / 2, 0), bevel=0.024),
          bx('boom1_taper', (0.28, BOOM1_LEN * 0.34, 0.30), R.MAT_PAINT, lift,
             (0, -BOOM1_LEN * 0.84, 0.02), bevel=0.02),
          tb('boom1_pin', 0.075, 0.50, R.MAT_CHROME, lift, (-0.25, 0, 0),
             (0, math.pi / 2, 0), 12)]
    # top-face P-clips: carrier hoses are bundled and clipped along the boom's
    # top face ([R1] §4, hose family 1) — straight, tidy, deliberately unlike
    # the feed's festoon
    for i in range(5):
        lg.append(clone(clip, (0, -0.35 - i * 0.48, 0.278), parent=lift,
                        name='boom1_clip%d' % i))
    # ...and the bundle those clips are actually holding.  A row of clips
    # gripping nothing is worse than no clips at all: it reads as studs.  Four
    # lines, straight and tidy, which is exactly what separates hose family 1
    # from the feed's festoon.
    for i, xo in enumerate((-0.075, -0.025, 0.025, 0.075)):
        lg.append(curve_to_mesh(R.hose(
            'boom1_line%d' % i,
            [(xo, 0.06, 0.20), (xo, -0.90, 0.245), (xo, -1.90, 0.245),
             (xo, -BOOM1_LEN + 0.02, 0.20)], 0.021, R.MAT_RUBBER, lift)))
    lg += ram('lift_ram', lift, (0, -0.22, -0.40), (0, -BOOM1_LEN * 0.66, 0.26),
              0.075, 0.048)
    weld(lg, 'boom-lift', lift)

    fold = R.empty(R.NODE_PIVOT, 'boom-fold', lift, (0, -BOOM1_LEN, 0.04), (BOOM_FOLD, 0, 0))
    fg = [bx('boom2', (0.30, BOOM2_LEN, 0.34), R.MAT_PAINT, fold,
             (0, -BOOM2_LEN / 2, 0), bevel=0.022),
          bx('boom2_knuckle', (0.40, 0.34, 0.40), R.MAT_CAST, fold, (0, 0.02, 0), bevel=0.02),
          tb('boom2_pin', 0.070, 0.46, R.MAT_CHROME, fold, (-0.23, 0, 0),
             (0, math.pi / 2, 0), 12)]
    for i in range(4):
        fg.append(clone(clip, (0, -0.30 - i * 0.40, 0.238), parent=fold,
                        name='boom2_clip%d' % i))
    # the slack loop at the knuckle: hoses crossing a folding joint have to be
    # long enough for the joint's full sweep, so they bag out at the hinge.  It
    # is the detail that says the boom really folds.
    for i, xo in enumerate((-0.075, -0.025, 0.025, 0.075)):
        fg.append(curve_to_mesh(R.hose(
            'boom2_line%d' % i,
            [(xo, 0.30, 0.30), (xo * 1.7, 0.12, 0.50), (xo, -0.26, 0.24),
             (xo, -1.10, 0.205), (xo, -BOOM2_LEN + 0.06, 0.14)],
            0.021, R.MAT_RUBBER, fold)))
    fg += ram('fold_ram', fold, (0, 0.10, 0.30), (0, -BOOM2_LEN * 0.72, 0.20), 0.062, 0.040)
    weld(fg, 'boom-fold', fold)

    bpy.data.objects.remove(clip, do_unlink=True)
    return swing, lift, fold


# ══════════════════════════════════════════════════════════════════════════════
# 5 — FEED CRADLE AND DUST COLLECTOR
# ══════════════════════════════════════════════════════════════════════════════

def build_cradle(fold):
    """The rotator / tilt casting at the boom nose, and the dust collector.

    [R1] §4: the cradle is "a rotator plus a cylinder swinging the beam from
    vertical through to past horizontal".  Mounting the collector on the CRADLE
    rather than on the sliding feed is what makes the 127 mm suction hose ([S2])
    a real catenary that has to swallow the 1 400 mm of feed extension — and it
    is the fix for defect [R1] §9 W6, where the game's dust tube runs 1.5 m and
    stops in mid-air with nothing joining it to the cyclone.
    """
    # Inside `tilt`: origin is the BOOM NOSE, local +Z runs up the beam, local
    # +Y points back at the machine.  The tilt angle is SOLVED, not guessed —
    # the accumulated boom pitch is BOOM_LIFT + BOOM_FOLD, and the feed has to
    # end up raked FEED_RAKE off vertical, so the joint takes the difference.
    tilt = R.empty(R.NODE_PIVOT, 'feed-tilt', fold, (0, -BOOM2_LEN, 0),
                   (-FEED_RAKE - BOOM_LIFT - BOOM_FOLD, 0, 0))
    cg = [tb('rotator', 0.17, 0.34, R.MAT_CAST, tilt, (-0.17, 0.16, 0),
             (0, math.pi / 2, 0), 14),
          bx('cradle', (0.52, 0.46, 0.90), R.MAT_PAINT, tilt, (0, BEAM_FWD + 0.33, 0),
             bevel=0.02),
          bx('cradle_slipper_a', (0.44, 0.30, 0.11), R.MAT_CAST, tilt,
             (0, BEAM_FWD + 0.06, 0.44), bevel=0.012),
          bx('cradle_slipper_b', (0.44, 0.30, 0.11), R.MAT_CAST, tilt,
             (0, BEAM_FWD + 0.06, -0.44), bevel=0.012)]
    cg += ram('tilt_ram', tilt, (0.0, 0.62, 0.64), (0.0, BEAM_FWD + 0.20, -0.40),
              0.052, 0.032)
    # the feed-extension ram, lying along the cradle: [S2] 1 400 mm of extension
    cg += ram('extend_ram', tilt, (0.24, BEAM_FWD + 0.20, -0.44),
              (0.24, BEAM_FWD + 0.20, FEED_EXT - 0.44), 0.048, 0.030)

    # ── dust collector: cyclone pre-separator plus filter box ────────────────
    # [S2]: 11 filter elements and 11 m2 of media at 560 l/s.  Eleven elements
    # in a box means a box roughly 0.46 x 0.62 x 0.80 — which is why it is drawn
    # at that size and not as a token drum.  [S1] calls the same thing a primary
    # separator; [R1] §7 photo 2 shows a bright cyclone body with a black cone
    # under it, mounted beside the feed.
    dx, dy, dz = -0.60, 0.30, 0.30
    cg += [bx('dct_box', (0.46, 0.62, 0.80), R.MAT_PAINT, tilt, (dx, dy, dz), bevel=0.026),
           bx('dct_lid', (0.50, 0.66, 0.06), R.MAT_DARK, tilt, (dx, dy, dz + 0.42),
              bevel=0.012),
           tb('cyclone', 0.19, 0.46, R.MAT_PAINT, tilt, (dx, dy - 0.42, dz - 0.10),
              (0, 0, 0), 16),
           tb('cyclone_band', 0.203, 0.04, R.MAT_WORN, tilt, (dx, dy - 0.42, dz + 0.16),
              (0, 0, 0), 16),
           # the TANGENTIAL inlet — dusty air enters a cyclone on the tangent,
           # which is the whole reason the thing separates anything
           tb('cyclone_inlet', 0.075, 0.24, R.MAT_WORN, tilt,
              (dx + 0.17, dy - 0.54, dz + 0.04), (0, math.pi / 2, 0), 10),
           bx('cyclone_cone', (0.30, 0.30, 0.22), R.MAT_DARK, tilt,
              (dx, dy - 0.42, dz - 0.24), bevel=0.05),
           tb('dust_disc', 0.14, 0.05, R.MAT_RUBBER, tilt, (dx, dy - 0.42, dz - 0.40),
              (0, 0, 0), 12),
           tb('dct_outlet', 0.055, 0.24, R.MAT_WORN, tilt, (dx, dy + 0.34, dz + 0.30),
              (-math.pi / 2, 0, 0), 10)]
    cap = bx('cap_src', (0.075, 0.075, 0.05), R.MAT_DARK, loc=(0, 0, -50), bevel=0.008, seg=1)
    for i in range(11):                     # eleven, because that is the count [S2]
        cg.append(clone(cap, (dx - 0.14 + (i % 3) * 0.14, dy - 0.22 + (i // 3) * 0.15,
                              dz + 0.46), parent=tilt, name='dct_cap%d' % i))
    bpy.data.objects.remove(cap, do_unlink=True)

    # [S2] "Work lights, feed 2 x 70 W" — on the cradle, looking down the beam
    # at the collar.  This is the pair env.js sweeps as the boom works.
    lm = []
    for s in (-1, 1):
        _, _, m = lamp('feed-%s' % ('l' if s < 0 else 'r'), tilt,
                       (s * 0.36, BEAM_FWD + 0.10, 0.62), (0, -0.25, -0.95))
        lm += m
    weld(cg + lm, 'feed-cradle', tilt)
    return tilt


# ══════════════════════════════════════════════════════════════════════════════
# 6 — FEED BEAM, CARRIAGE, DRIFTER, ROD HANDLING, DUST HOOD
# ══════════════════════════════════════════════════════════════════════════════

def build_feed(tilt):
    """ONE single-piece beam.

    [R1] §9 W1 records the game's current builder stacking two half-length
    beams like a telescoping piling mast — "a top-hammer surface rig has a
    single one-piece feed beam" — so this is a defect being fixed, not a
    stylistic choice.  [S2] "Aluminum profile feed beam": the beam is a BARE
    BRIGHT EXTRUSION, not body-colour paint ([R1] §6 makes the same correction
    from photographs), so it is `rawSteel` against a `paintedSteel` machine and
    that contrast is half of what makes the feed read at all.
    """
    # local frame: origin at the BEAM FOOT, +Z up the beam, +Y toward the cradle
    slide = R.empty(R.NODE_SLIDE, 'feed-extend', tilt, (0, BEAM_FWD, -CRADLE_UP))
    g = [bx('beam', (BEAM_W, BEAM_D, BEAM_LEN), R.MAT_STEEL, slide,
            (0, 0, BEAM_LEN / 2), bevel=0.010)]
    # the two machined rails the carriage runs on, standing proud of the section
    for s in (-1, 1):
        g.append(bx('rail_%d' % s, (0.046, 0.062, BEAM_LEN), R.MAT_STEEL, slide,
                    (s * (BEAM_W / 2 + 0.012), -(BEAM_D / 2 + 0.026), BEAM_LEN / 2),
                    bevel=0.006))
    plate = bx('splice_src', (BEAM_W + 0.05, BEAM_D + 0.04, 0.055), R.MAT_STEEL,
               loc=(0, 0, -50), bevel=0.006, seg=1)
    for i in range(6):                      # bolted splice plates, as photo 5 shows
        g.append(clone(plate, (0, 0, 0.55 + i * 0.92), parent=slide, name='splice%d' % i))
    bpy.data.objects.remove(plate, do_unlink=True)
    # the feed-drive channel under the beam: the cylinder-and-chain run that
    # gets 4.24 m of carriage travel out of a much shorter cylinder [S2]
    g.append(bx('feed_channel', (0.15, 0.11, BEAM_LEN - 0.30), R.MAT_DARK, slide,
                (0, BEAM_D * 0.52, BEAM_LEN / 2), bevel=0.010))
    g.append(tb('feed_cyl', 0.052, BEAM_LEN * 0.52, R.MAT_CHROME, slide,
                (0.0, BEAM_D * 0.52, 0.40), (0, 0, 0), 10))

    # ── the end sheaves ──────────────────────────────────────────────────────
    # [R1] §9 W5, verbatim: "Feed rails are modelled but the feed-chain sheaves
    # are not ... it is one of the few circular shapes on the whole machine and
    # reads at distance."  One at each end, each on its own `pivot:` node so the
    # game can spin them with the feed chain.
    for tag, z in (('top', BEAM_LEN - 0.14), ('foot', 0.16)):
        p = R.empty(R.NODE_PIVOT, 'feed-sheave-' + tag, slide, (0, BEAM_D * 0.52, z))
        weld([tb('sheave_' + tag, 0.115, 0.075, R.MAT_CAST, p, (-0.037, 0, 0),
                 (0, math.pi / 2, 0), 16),
              tb('sheavehub_' + tag, 0.045, 0.11, R.MAT_CAST, p, (-0.055, 0, 0),
                 (0, math.pi / 2, 0), 10)], 'sheave-' + tag, p)
        g.append(bx('sheave_block_' + tag, (0.22, 0.20, 0.20), R.MAT_CAST, slide,
                    (0, BEAM_D * 0.52, z), bevel=0.014))

    # ── carriage and drifter ─────────────────────────────────────────────────
    # [S2] travel length 4 240 mm.  Posed part-way down the beam, mid-rod: a rig
    # frozen at the top of its stroke looks parked.
    ax = -(BEAM_D / 2 + 0.26)          # the drill string's axis: 0.26 m clear of the
                                       # beam face, which is where the drifter's nose
                                       # puts it once the carriage is on the rails
    carr = R.empty(R.NODE_SLIDE, 'carriage', slide, (0, 0, BEAM_LEN - 1.55))
    carr['travel_m'] = CARR_TRAVEL
    cg = [bx('carriage_plate', (BEAM_W + 0.14, 0.14, 0.62), R.MAT_DARK, carr,
             (0, -(BEAM_D / 2 + 0.08), 0), bevel=0.012)]
    for s in (-1, 1):
        cg.append(bx('slipper_%d' % s, (0.085, 0.12, 0.66), R.MAT_CAST, carr,
                     (s * (BEAM_W / 2 + 0.012), -(BEAM_D / 2 + 0.026), 0), bevel=0.010))
    # the drifter: a hydraulic percussion block, 174–195 kg [S2], so roughly
    # 0.86 x 0.34 x 0.32 of solid iron.  Percussion AND rotation come through it.
    cg += [bx('drifter_body', (0.34, 0.32, 0.86), R.MAT_DARK, carr, (0, ax, 0.02),
              bevel=0.020),
           bx('drifter_head', (0.30, 0.28, 0.24), R.MAT_CAST, carr, (0, ax, -0.50),
              bevel=0.018),
           tb('drifter_chuck', 0.085, 0.22, R.MAT_WORN, carr, (0, ax, -0.78), (0, 0, 0), 12),
           # rotation motor on the side, accumulator domes on top: the two lumps
           # that say "hydraulic drifter" instead of "grey box"
           tb('rot_motor', 0.105, 0.26, R.MAT_CAST, carr, (0.24, ax, -0.16),
              (0, math.pi / 2, 0), 12),
           tb('accum_hp', 0.070, 0.24, R.MAT_DARK, carr, (-0.13, ax - 0.14, 0.32),
              (0, 0, 0), 12),
           tb('accum_lp', 0.058, 0.20, R.MAT_DARK, carr, (0.13, ax - 0.14, 0.34),
              (0, 0, 0), 12),
           # shank adapter: bare bright machined splines ([R1] §6, tool materials)
           tb('shank', 0.038, 0.34, R.MAT_STEEL, carr, (0, ax, -0.98), (0, 0, 0), 10),
           # the string in the hole: painted body, bare thread ends [R1] §6
           tb('rod_in_string', ROD_DIA / 2, ROD_LEN, R.MAT_PAINT, carr,
              (0, ax, -0.98 - ROD_LEN), (0, 0, 0), 10),
           tb('coupling', ROD_DIA * 0.72, 0.15, R.MAT_STEEL, carr, (0, ax, -1.06),
              (0, 0, 0), 10)]
    # where the game hangs the live bit and the rest of the string
    R.empty(R.NODE_MOUNT, 'tool-anchor', carr, (0, ax, -0.98))
    # the drifter's own hoses, which MUST move with it
    for i, xo in enumerate((-0.11, -0.04, 0.04, 0.11)):
        cg.append(curve_to_mesh(R.hose(
            'drifter_hose%d' % i,
            [(xo, ax - 0.20, 0.36), (xo * 1.5, ax - 0.32, 0.62), (xo * 1.2, ax + 0.14, 0.80)],
            0.024, R.MAT_RUBBER, carr)))
    weld(cg, 'carriage', carr)

    # ── the hose festoon ─────────────────────────────────────────────────────
    # [R1] §1b finding 3: "roughly ten hoses looped in a hanging bundle in the
    # middle of the feed — not two thin tubes", and it is a load-bearing part of
    # the silhouette.  [S1] calls the same thing a hose reel, [S2] a hose guide.
    # This is the take-up for the carriage's 4.24 m of travel, so it belongs on
    # the FEED, not on the body — defect [R1] §9 W7.
    for i in range(10):
        o = (i - 4.5) * 0.026
        g.append(curve_to_mesh(R.hose(
            'festoon%d' % i,
            [(o, BEAM_D * 0.62, BEAM_LEN - 1.30),
             (o * 1.8, BEAM_D * 0.62 + 0.34 + abs(o) * 2.0, BEAM_LEN * 0.52),
             (o * 1.4, BEAM_D * 0.62 + 0.30, BEAM_LEN * 0.40),
             (o, BEAM_D * 0.62 + 0.06, BEAM_LEN * 0.30)],
            0.020, R.MAT_RUBBER, slide)))
    for i in range(10):     # the spring hose-guard where the bundle chafes
        g.append(tb('hose_spring%d' % i, 0.072, 0.030, R.MAT_WORN, slide,
                    (0, BEAM_D * 0.62 + 0.18, BEAM_LEN * 0.40 + i * 0.035),
                    (-math.pi / 2 + 0.3, 0, 0), 8))

    # ── rod support / centraliser at the beam foot ───────────────────────────
    # [S2] verbatim: "double drill rods support with movable lower guide/dust
    # hood".  So there are TWO supports, the lower one slides, and the dust hood
    # is part of it.  That is the mechanism the "add a rod" cycle plays against
    # ([R1] §4) — and it is why the hood is on a `slide:` node, not glued down.
    g.append(bx('rod_support_upper', (0.44, 0.40, 0.16), R.MAT_DARK, slide,
                (0, ax + 0.14, 0.92), bevel=0.014))
    for s in (-1, 1):
        g.append(bx('jaw_u_%d' % s, (0.13, 0.16, 0.10), R.MAT_WORN, slide,
                    (s * 0.13, ax, 0.92), bevel=0.010))
    g.append(tb('guide_tube', 0.055, 0.20, R.MAT_WORN, slide, (0, ax, 0.84), (0, 0, 0), 12))
    # the feed's own rear cross-brace back to the cradle slipper line
    g.append(bx('beam_brace', (0.20, 0.30, 0.10), R.MAT_STEEL, slide,
                (0, BEAM_D * 0.55, CRADLE_UP), bevel=0.010))

    lower = R.empty(R.NODE_SLIDE, 'rod-support-lower', slide, (0, 0, 0.10))
    lg = [bx('rod_support_lower', (0.46, 0.42, 0.18), R.MAT_DARK, lower,
             (0, ax + 0.14, 0.14), bevel=0.014)]
    for s in (-1, 1):
        lg.append(bx('jaw_l_%d' % s, (0.14, 0.17, 0.11), R.MAT_WORN, lower,
                     (s * 0.13, ax, 0.14), bevel=0.010))
    # the dust hood: [R1] §1b finding 4 and §7 photo 5 — a BLACK RUBBER BELL
    # clamped to the mouth of a fabricated steel duct, not a bare cone, with the
    # corrugated hose leaving the top of the duct.
    lg += [bx('hood_duct', (0.40, 0.40, 0.26), R.MAT_PAINT, lower, (0, ax, -0.05),
              bevel=0.024),
           tb('hood_clamp', 0.215, 0.045, R.MAT_WORN, lower, (0, ax, -0.20), (0, 0, 0), 16),
           tb('hood_bell', 0.235, 0.20, R.MAT_RUBBER, lower, (0, ax, -0.40), (0, 0, 0), 16),
           tb('hood_stub', SUCTION_R * 1.15, 0.18, R.MAT_PAINT, lower, (0.16, ax, 0.02),
              (0, 1.05, 0), 12)]
    skirt = bx('skirt_src', (0.10, 0.022, 0.20), R.MAT_RUBBER, loc=(0, 0, -50), bevel=0.0)
    for i in range(14):                    # the black dust curtain round the collar
        t = TAU * i / 14
        lg.append(clone(skirt, (math.sin(t) * 0.255, ax + math.cos(t) * 0.255, -0.52),
                        (0, 0, -t), parent=lower, name='curtain%d' % i))
    bpy.data.objects.remove(skirt, do_unlink=True)
    weld(lg, 'rod-support-lower', lower)

    # ── the 127 mm suction hose ──────────────────────────────────────────────
    # [S2] suction hose diam 127 mm.  It runs from the hood stub at the collar
    # ALL THE WAY to the collector inlet on the cradle — the whole of defect
    # [R1] §9 W6.  It is ribbed, because a smooth tube this fat reads as a pipe.
    # slide-local y = tilt-local y - BEAM_FWD, slide-local z = tilt-local z +
    # CRADLE_UP, so the collector inlet at tilt-local (-0.60, 0.64, 0.60) is at
    # slide-local (-0.60, 1.00, 1.95).  The hose is drawn to land exactly there.
    hp = [(0.28, ax + 0.10, 0.16), (0.60, 0.28, 0.64), (0.44, 0.84, 1.30),
          (-0.10, 1.06, 1.80), (-0.60, 1.00, 1.95)]
    g.append(curve_to_mesh(R.hose('suction_hose', hp, SUCTION_R, R.MAT_RUBBER, slide, 8)))
    rib = tb('rib_src', SUCTION_R * 1.14, 0.030, R.MAT_RUBBER, None, (0, 0, -50),
             (0, 0, 0), 8)
    for i in range(34):
        seg = (i / 33.0) * (len(hp) - 1)
        k = min(int(seg), len(hp) - 2)
        f = seg - k
        a0, b0 = hp[k], hp[k + 1]
        p = tuple(a0[j] + (b0[j] - a0[j]) * f for j in range(3))
        d = tuple(b0[j] - a0[j] for j in range(3))
        g.append(clone(rib, p,
                       (0, math.atan2(math.sqrt(d[0] ** 2 + d[1] ** 2), d[2]),
                        math.atan2(d[1], d[0]) - math.pi / 2),
                       parent=slide, name='hoserib%d' % i))
    bpy.data.objects.remove(rib, do_unlink=True)

    # ── rod carousel ─────────────────────────────────────────────────────────
    caro = R.empty(R.NODE_PIVOT, 'rod-carousel', slide, (0.62, 0.12, BEAM_LEN * 0.50))
    caro['rods'] = CAROUSEL_N
    caro['rod_len_m'] = ROD_LEN
    rg = [tb('caro_plate_t', 0.30, 0.055, R.MAT_DARK, caro, (0, 0, ROD_LEN / 2),
             (0, 0, 0), 14),
          tb('caro_plate_b', 0.30, 0.055, R.MAT_DARK, caro, (0, 0, -ROD_LEN / 2),
             (0, 0, 0), 14),
          tb('caro_shaft', 0.055, ROD_LEN + 0.10, R.MAT_WORN, caro,
             (0, 0, -ROD_LEN / 2 - 0.05), (0, 0, 0), 10)]
    # [S2] "Carousel type rod handling system, 1 + 7 rods".  Painted bodies with
    # bare bright thread ends ([R1] §6) — a two-material rod costs triangles and
    # no draw calls, and a uniformly bare-steel rod is simply wrong.
    rod = tb('rod_src', ROD_DIA / 2, ROD_LEN, R.MAT_PAINT, None, (0, 0, -50), (0, 0, 0), 8)
    thr = tb('thread_src', ROD_DIA * 0.60, 0.16, R.MAT_STEEL, None, (0, 0, -50),
             (0, 0, 0), 8)
    for i in range(CAROUSEL_N):
        t = TAU * i / CAROUSEL_N
        px, py = math.sin(t) * 0.215, math.cos(t) * 0.215
        rg.append(clone(rod, (px, py, -ROD_LEN / 2), parent=caro, name='caro_rod%d' % i))
        rg.append(clone(thr, (px, py, ROD_LEN / 2 - 0.14), parent=caro,
                        name='caro_thr_t%d' % i))
        rg.append(clone(thr, (px, py, -ROD_LEN / 2 - 0.02), parent=caro,
                        name='caro_thr_b%d' % i))
    bpy.data.objects.remove(rod, do_unlink=True)
    bpy.data.objects.remove(thr, do_unlink=True)
    weld(rg, 'rod-carousel', caro)

    # the swing arm that lifts a rod out of store onto the beam axis
    arm = R.empty(R.NODE_PIVOT, 'rod-arm', slide, (0.30, 0.06, BEAM_LEN * 0.50))
    weld([bx('arm_link', (0.44, 0.10, 0.12), R.MAT_PAINT, arm, (0.16, 0, 0), bevel=0.012),
          bx('arm_grip', (0.15, 0.17, 0.20), R.MAT_CAST, arm, (0.38, 0, 0), bevel=0.012),
          tb('arm_pin', 0.045, 0.20, R.MAT_CAST, arm, (0, 0, -0.10), (0, 0, 0), 10)],
         'rod-arm', arm)

    # ── the guard cage ───────────────────────────────────────────────────────
    # [S1] "EU-safety devices, EN16228, short safety cage"; [R1] §9 W12 calls
    # the perforated cage round the magazine a top-five identifying feature that
    # the game has none of.  A frame plus a bar grid: a big flat grey
    # semi-transparent mass in the silhouette, for triangles and no draw call.
    cz0 = BEAM_LEN * 0.50 - ROD_LEN / 2 - 0.10
    cz1 = BEAM_LEN * 0.50 + ROD_LEN / 2 + 0.10
    ch = cz1 - cz0
    g += [bx('cage_post_a', (0.05, 0.05, ch), R.MAT_DARK, slide,
             (0.98, -0.22, (cz0 + cz1) / 2), bevel=0.008),
          bx('cage_post_b', (0.05, 0.05, ch), R.MAT_DARK, slide,
             (0.98, 0.46, (cz0 + cz1) / 2), bevel=0.008),
          bx('cage_rail_t', (0.05, 0.74, 0.05), R.MAT_DARK, slide, (0.98, 0.12, cz1),
             bevel=0.008),
          bx('cage_rail_b', (0.05, 0.74, 0.05), R.MAT_DARK, slide, (0.98, 0.12, cz0),
             bevel=0.008)]
    mv = bx('mv_src', (0.014, 0.014, ch), R.MAT_DARK, loc=(0, 0, -50), bevel=0.0)
    mh = bx('mh_src', (0.014, 0.70, 0.014), R.MAT_DARK, loc=(0, 0, -50), bevel=0.0)
    for i in range(9):
        g.append(clone(mv, (0.975, -0.20 + 0.66 * i / 8.0, (cz0 + cz1) / 2),
                       parent=slide, name='cagev%d' % i))
    for i in range(16):
        g.append(clone(mh, (0.975, 0.12, cz0 + ch * i / 15.0), parent=slide,
                       name='cageh%d' % i))
    bpy.data.objects.remove(mv, do_unlink=True)
    bpy.data.objects.remove(mh, do_unlink=True)

    # hazard stripe at the beam foot, where a boot goes and where the reference
    # photograph puts a yellow-and-black decal on the carrier corner
    g.append(hz('hz_beamfoot', (BEAM_W + 0.06, 0.02, 0.14), slide,
                (0, -(BEAM_D / 2 + 0.055), 0.42)))
    weld(g, 'feed', slide)
    return slide


# ══════════════════════════════════════════════════════════════════════════════
# 7 — CARRIER SERVICES AND THE REST OF THE LAMPS
# ══════════════════════════════════════════════════════════════════════════════

def build_services():
    # carrier hoses: bundled and clamped, entering at the boom's base swivel
    # ([R1] §4, hose family 1).  Straight and tidy, deliberately unlike the
    # feed's festoon — the two families have to look different or the machine
    # reads as a CAD block.
    for i, xo in enumerate((-0.10, -0.035, 0.035, 0.10)):
        curve_to_mesh(R.hose(
            'carrier_hose%d' % i,
            [(0.26 + xo, ENC_Y0 - 0.30, DECK_Z + 0.40),
             (0.30 + xo, -0.60, DECK_Z + 0.52),
             (KING_X + xo, KING_Y + 0.34, KING_Z + 0.10)],
            0.026, R.MAT_RUBBER))
    # the coiled spiral airline, slung where [R1] §7 photo 1 actually puts it —
    # between the machine and the boom, not decorating the body
    for i in range(22):
        t = i / 21.0
        ang = t * TAU * 3.2
        tb('coil%d' % i, 0.017, 0.09, R.MAT_RUBBER, None,
           (0.62 + math.cos(ang) * 0.115, -0.35 - t * 0.85,
            DECK_Z + 0.62 + math.sin(ang) * 0.115), (-math.pi / 2, 0, 0), 6)

    # [S2] "Work lights, front 4 x 70 W" and "rear 2 x 70 W".  One front pair
    # high on the cab roof looking at the collar, one low on the frame nose, and
    # a pair on the rear of the enclosure — eight lamps in all with the two on
    # the feed, which is the machine's own statement about its lighting.
    for s in (-1, 1):
        lamp('front-roof-%s' % ('l' if s < 0 else 'r'), None,
             (CAB_X + s * 0.42, BODY_FRONT + 0.16, DECK_Z + CAB_H + 0.06),
             (s * 0.25, -0.85, -0.46))
        lamp('front-frame-%s' % ('l' if s < 0 else 'r'), None,
             (s * 0.86, BODY_FRONT + 0.02, DECK_Z + 0.30), (s * 0.20, -0.90, -0.36))
        lamp('rear-%s' % ('l' if s < 0 else 'r'), None,
             (s * 0.90, ENC_Y1 + 0.06, DECK_Z + ENC_H - 0.18), (s * 0.20, 0.90, -0.38))


# ══════════════════════════════════════════════════════════════════════════════

def build(out_path):
    R.reset()
    build_undercarriage()
    build_superstructure()
    build_supports()
    _, _, fold = build_boom()
    tilt = build_cradle(fold)
    build_feed(tilt)
    build_services()
    return R.finish(out_path)


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public',
                                       'models', 'crawler_th.glb')))
