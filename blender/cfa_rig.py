"""
cfa_rig — in-game marque 'Lindhorst CF-28 Continuum'
Real class modelled: CFA / cased-CFA fixed-mast (fixed-leader) piling rig,
crawler mounted, ~73 t, box-section mast, one continuous flight auger.

NAMING (DOMAIN.md sec.10): no real manufacturer name or model designation appears
in ANY exported string — object names, material names, custom props. Provenance
lives in these comments only. Shape is not branding.

PRIMARY DIMENSIONAL SOURCE (owner's own OEM catalogue library, indexed in
research/rigs/cfa-rig.md):
  [S1] Dimensioned side-elevation general arrangement of a CFA-configured
       crawler rotary rig, 73 t class, p.25 of the S-series drilling-rig
       catalogue PDF in the owner's Downloads. Working height 28 120,
       crowd stroke 17 000, working length 9 663, track frame 5 755,
       shoe 800, over-tracks 3 000-4 500 retractable, transport 3 000 wide /
       3 615 high, auger dia 1 000, auger-cleaner height 1 100, base box
       1 630, 73 t, 252 kW, 248 kNm, main winch rope 32 mm, aux rope 20 mm,
       mast rake +5 deg forward / 90 deg back / +-5 deg lateral.
  [S2] Exploded CFA string, p.41 of the pile-drilling tooling catalogue:
       concrete head = squat flanged DRUM with a 90 deg elbow that turns
       HORIZONTAL; adapter frustum; auger sections with square drive spigots,
       O-ring per joint; starter with side/central concrete outlet + cap.
  [S3] Cased-CFA (double-rotary) system elevation, p.45 same catalogue:
       two coaxial drives, radial hydraulic motors, 300 mm lift between them;
       casing 406 / collar 435 / shoe 450, inner auger cutting head 370.
  [S4] Hydraulic-hose catalogue p.2 (folded mast on a low-loader photograph):
       base carrier -> BULKHEAD PLATE -> one flat strapped tarpaulin-wrapped
       bundle up the mast -> HOSE DEFLECTION DRUM at the head -> second
       bulkhead plate on the drive. Box-section mast with a machined rail
       band; U-shaped bright grab rails along the mast side.
  [S5] Auger tooling photographs: flights AND central pipe one uniform matt
       anthracite (~RAL 7016); square drive spigots BARE BRIGHT machined
       steel; locking pins bright zinc. Casing cutting shoe bright ochre.
  [S6] Studio render of a crawler rotary rig: handrails wrap the whole upper
       deck, sprocket REAR / idler FRONT, ~8 bottom + 2 carrier rollers,
       round lightening holes in the mast plate, drive = cylindrical drum
       with round lightening holes and a toothed lower flange.
  [W1] Web pass 2026-09-05: manufacturer PremiumLine brochure PDF for a ~84 t
       H-series rotary drilling rig, page 18 "Application - CFA Drilling".
       A fully dimensioned CFA-configured side elevation, TWO configurations.
       This is a second, independent CFA general arrangement and it settles
       several things the local library could not:
         * "1000" is dimensioned from the MAST FRONT FACE to the AUGER AXIS,
           and the options list reads "masthead for drill axis 1,000 mm
           expandable to 1,400 mm". The 1,400 option exists because the max
           2,500 mm tool needs 1,250 mm of radius plus clearance - which is
           what proves the dimension is measured from the mast face and not
           from the slewing axis.
         * R 4300 = tail swing radius, slewing axis to the back of the
           counterweight. Slewing axis sits at the CENTRE of the crawler.
         * crawler length 5,430 (basic) / 5,500 (upgraded); over-tracks
           3,000-4,400 on 800 shoes, 3,300-4,500 on 900.
         * uppercarriage top 2,960 / 3,020 above ground; crawler 1,060 / 1,130.
         * CFA crowd stroke 14,670 / 17,670; auger length 16,000 / 19,000;
           mast 18,540; overall height 22,160 basic, 25,220 + 8,000 of auger
           standing above the head = 31,910 on the extended machine.
         * max CFA diameter 900 mm basic / 1,200 mm upgraded, depth 14.1 /
           25.1 m, extraction 730 / 660 kN. The game's maxDiaMm 900 is right.
       Read off the drawing itself (scaled against the 5,500 crawler): drill
       axis about 3.3 m forward of the slewing axis, mast box about 0.76 m
       deep, mast standing ahead of the cab with the auger clear of the
       crawler nose. The concrete hose hangs from the swan neck at the top of
       the string as a long near-vertical line FORWARD of the auger, down to
       the ground - not strapped up the mast.

DERIVED, NOT SOURCED (flagged again in the report):
  - mast box cross-section (no plan or section exists in any local source)
  - drill-axis stand-off from the slew axis
  - track roller/sprocket tooth counts, grouser pitch
  - concrete hose diameter and how it is carried up the mast
"""

import bpy
import bmesh
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
if os.path.join(HERE, 'lib') not in sys.path:
    sys.path.insert(0, os.path.join(HERE, 'lib'))

from rig import (reset, tube, hose, empty, worklight, part, finish,
                 NODE_MOUNT, NODE_AIM, NODE_PIVOT, NODE_SLIDE,
                 MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST,
                 MAT_RUBBER, MAT_GLASS, MAT_CHROME, MAT_HAZARD)


# ── rig.box() IS HALF SCALE — LOCAL REPLACEMENT ───────────────────────────────
# `rig.box()` does primitive_cube_add(size=1), which in Blender is a cube of
# SIDE 1 (-0.5 .. +0.5), and then scales it by size/2. The result is a box half
# the size asked for in every axis. rig.tube() is correct, so a machine built
# with the shared helpers comes out with correct cylinders and half-size boxes —
# which is exactly what this rig looked like until it was measured: a 24.4 m
# mast exported 12.2 m tall, a 1.10 m mast box exported 0.55 m wide.
#
# rig.py is shared with every other machine being built right now, and silently
# doubling every box in every one of them mid-flight is not mine to do. So this
# is fixed HERE and reported. The real fix is `primitive_cube_add(size=2)` (or
# scaling by `size`, not `size/2`) in rig.py, once, with every machine re-tuned
# in the same pass.
def box(name, size, mat=MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
        bevel=0.0):
    """A box that is actually `size` metres. Bevel in metres — a bevelled edge
    is what stops steel reading as cardboard, and it costs triangles, not draw
    calls."""
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        m = o.modifiers.new('bev', 'BEVEL')
        m.width = bevel
        m.segments = 2
        m.limit_method = 'ANGLE'
    return part(name, o, mat, parent, loc, rot)

TAU = math.pi * 2.0

# ── DIMENSIONS ────────────────────────────────────────────────────────────────
# every constant carries its source tag. metres. Z up, +Y is machine FRONT.

# undercarriage [S1] crawler length, [W1] tail radius and stance
TRACK_LEN   = 5.755      # [S1] chassis / track-frame length. [W1] 5 430 / 5 500
SHOE_W      = 0.800      # [S1] track shoe width
GAUGE       = 3.60       # [S1] extended working stance -> 4.40 over tracks,
                         #      inside 3.000-4.500 [S1] and 3.000-4.400 [W1]
RR          = 0.500      # derived: idler / sprocket pitch radius, so the crawler
                         #      stands 1.06 high against [W1] 1 060 / 1 130
TRACK_CY    = 0.00       # [W1] the slewing axis sits at the CENTRE of the crawler

# uppercarriage
DECK_Z      = 1.30       # derived: car body + slew ring on top of the crawler
BODY_W      = 3.00       # [S1] transport width 3 000 governs the superstructure
CW_BACK     = -4.45      # [W1] tail swing radius R 4300, +0.15 for the heavier
                         #      counterweight this 73 t machine carries
HOUSE_Z     = 3.02       # [W1] uppercarriage top 2 960 / 3 020 above ground

# mast — position now comes from [W1], which is dimensioned and unambiguous
MAST_D      = 0.80       # [W1] scaled off the CFA elevation against the 5 500
                         #      crawler: mast box about 0.76 m deep
MAST_W      = 1.10       # DERIVED - no plan or section exists in any source
MAST_FOOT_Z = 0.40       # derived
MAST_TOP_Z  = 23.10      # derived: [W1] mast / overall = 18 540 / 22 160
HEAD_TOP_Z  = 26.30      # derived
ARCH_TOP_Z  = 28.12      # [S1] overall height, working state
MAST_CY     = 1.95       # [W1] mast front face 2.35 forward of the slewing axis
DRILL_Y     = 3.35       # [W1] mast front face + 1.000. The 1 000 mm is
                         #      dimensioned mast-face-to-auger-axis on the CFA
                         #      elevation and named in the options list as
                         #      "masthead for drill axis 1,000 expandable to
                         #      1,400". Was 2.25 here on a Kelly-rig figure the
                         #      local reference explicitly warned not to reuse.
CROWD       = 17.00      # [S1] crowd stroke 17 000; [W1] 14 670 / 17 670
DRIVE_LO_Z  = 3.60       # derived: the drive cannot come lower than the
                         #      concrete head, the collar and the base box
DRIVE_HI_Z  = DRIVE_LO_Z + CROWD   # 20.60 — so the drive parks just under the
                         #      masthead, as it does on both source elevations
DRIVE_Z     = 20.55      # default pose: top of stroke, auger tip at grade.
                         #      Bottom of stroke puts the tip at -17.05, so the
                         #      23.10 m mast comfortably exceeds the pile length
                         #      — the rule the game's own 21.5 m mast against a
                         #      24 m depth currently breaks.

# tool [S1]/[S2]/[W1]
AUGER_D     = 1.000      # [S1] max drilling diameter dimensioned on the drawing.
                         #      [W1] 900 basic / 1 200 upgraded — 1 000 sits
                         #      between them and matches the game's maxDiaMm 900.
AUGER_R     = AUGER_D / 2
STEM_R      = 0.2225     # [S2] central pipe 445 x 10 for the large sizes
PITCH       = 0.400      # [S2] flight pitch 250-400 mm for large diameter; the
                         #      [W1] elevation draws pitch/diameter near 0.45, so
                         #      take the top of the sourced band, not the middle
TURNS       = 49         # [W1] auger length 16 000 / 19 000 mm
AUGER_LEN   = PITCH * TURNS          # 18.0; [W1] auger length 16 000 / 19 000
FLIGHT_T    = 0.022      # [S2] flight plate thickness S
CLEANER_Z   = 1.10       # [S1] auger cleaner height above ground
BASEBOX_H   = 1.630      # [S1] base / drilling-table box height


# ── local helpers ─────────────────────────────────────────────────────────────

def _mode():
    if bpy.context.object is not None and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')


def bake(o):
    """Apply every modifier so the mesh data is final and cloneable."""
    _mode()
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            o.modifiers.remove(m)
    return o


def cut(target, cutters):
    """Boolean-difference `cutters` out of `target`, then bake and bin them."""
    for c in cutters:
        m = target.modifiers.new('cut', 'BOOLEAN')
        m.operation = 'DIFFERENCE'
        m.object = c
        try:
            m.solver = 'FAST'
        except TypeError:
            pass
    bake(target)
    for c in cutters:
        bpy.data.objects.remove(c, do_unlink=True)
    return target


def clone(tpl, name, loc=(0, 0, 0), rot=(0, 0, 0), scale=None):
    """A copy of a baked template. Cheap: no operator, no modifier stack."""
    o = bpy.data.objects.new(name, tpl.data.copy())
    o.location = loc
    o.rotation_euler = rot
    if scale:
        o.scale = scale
    bpy.context.collection.objects.link(o)
    return o


def attach(o, parent):
    """Parent while preserving the world transform, so everything above can be
    authored in world coordinates and hung off a node afterwards."""
    if parent is None or o is None:
        return o
    bpy.context.view_layer.update()
    o.parent = parent
    o.matrix_parent_inverse = parent.matrix_world.inverted()
    return o


def join_by_mat(objs, prefix, parent=None):
    """Join a moving subassembly by material.

    finish() only joins STATIC meshes, so anything under a pivot:/slide: node
    has to be collapsed here or every bolt is its own draw call.
    """
    _mode()
    groups = {}
    for o in objs:
        if o is None or o.name not in bpy.data.objects or o.type != 'MESH':
            continue
        # BAKE FIRST. bpy.ops.object.join() keeps only the ACTIVE object's
        # modifier stack and then evaluates it over the merged geometry — so an
        # unbaked SCREW helix joined behind a plain cylinder is silently thrown
        # away, and an unbaked cylinder joined behind a helix gets screwed 56
        # times. Both happened here before this line existed.
        bake(o)
        k = o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault(k, []).append(o)
    out = []
    for k, g in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in g:
            o.parent = None
            o.select_set(True)
        bpy.context.view_layer.objects.active = g[0]
        if len(g) > 1:
            bpy.ops.object.join()
        r = bpy.context.active_object
        r.name = '%s:%s' % (prefix, k)
        attach(r, parent)
        out.append(r)
    return out


def ring(n, r, cx=0.0, cy=0.0, phase=0.0):
    for i in range(n):
        a = phase + TAU * i / n
        yield i, a, cx + r * math.cos(a), cy + r * math.sin(a)


# ── subassemblies ─────────────────────────────────────────────────────────────

def build_undercarriage():
    """Crawler. Sprocket REAR, idler FRONT, 8 bottom + 2 carrier rollers [S6].
    Track frames 5 755 long on 800 shoes, 4 400 over tracks [S1]."""
    objs = []
    y0 = TRACK_CY - TRACK_LEN / 2
    y1 = TRACK_CY + TRACK_LEN / 2
    rr = RR

    # one grousered shoe, baked, then cloned round the chain path
    plate = box('shoe_tpl', (SHOE_W, 0.185, 0.030), MAT_WORN, bevel=0.008)
    grsr = []
    for k in (-1, 0, 1):
        # triple grouser. No bevel here: this template is cloned 164 times, so
        # every triangle in it is paid for 164 times over.
        # grousers on local -Z. Every shoe is placed with local +Z pointing at
        # the CENTRE of the chain, so the bars have to be on the other face or
        # they bite into the track frame instead of the ground.
        grsr.append(box('gr%d' % (k + 1), (SHOE_W * 0.94, 0.030, 0.032), MAT_WORN,
                        loc=(0, k * 0.055, -0.029)))
    bake(plate)
    for g in grsr:
        bake(g)
    bpy.ops.object.select_all(action='DESELECT')
    for g in grsr + [plate]:
        g.select_set(True)
    bpy.context.view_layer.objects.active = plate
    bpy.ops.object.join()
    tpl = bpy.context.active_object

    straight = y1 - y0
    n_str = int(straight / 0.19)
    n_arc = 13
    for side in (-1, 1):
        x = side * GAUGE / 2
        # bottom run
        for i in range(n_str):
            yy = y0 + (i + 0.5) * straight / n_str
            objs.append(clone(tpl, 'sh', (x, yy, 0.015)))
        # top run
        for i in range(n_str):
            yy = y0 + (i + 0.5) * straight / n_str
            objs.append(clone(tpl, 'sh', (x, yy, 2 * rr - 0.015), (math.pi, 0, 0)))
        # the two rounded ends: ang 0 is the bottom of the wheel and runs to
        # pi at the top, +ve wrapping FORWARD round the idler and -ve wrapping
        # REARWARD round the sprocket. Getting this sign wrong lays the arc
        # under the machine and leaves a flap of track hanging off the nose.
        for cy, sgn in ((y1, 1.0), (y0, -1.0)):
            for i in range(1, n_arc - 1):
                ang = sgn * math.pi * i / (n_arc - 1)
                objs.append(clone(tpl, 'sh',
                                  (x, cy + (rr - 0.015) * math.sin(ang),
                                   rr - (rr - 0.015) * math.cos(ang)),
                                  (ang, 0, 0)))
    bpy.data.objects.remove(tpl, do_unlink=True)

    for side in (-1, 1):
        x = side * GAUGE / 2
        # track frame beam, inboard of the chain
        objs.append(box('tframe', (SHOE_W * 0.62, TRACK_LEN * 0.90, 0.52), MAT_DARK,
                        loc=(x, TRACK_CY, rr), bevel=0.03))
        # sprocket (rear) and idler (front)
        objs.append(tube('sprk', rr * 0.80, SHOE_W * 0.52, MAT_WORN,
                         loc=(x, y0 + 0.10, rr), rot=(0, math.pi / 2, 0), sides=18))
        objs.append(tube('idlr', rr * 0.78, SHOE_W * 0.52, MAT_WORN,
                         loc=(x, y1 - 0.10, rr), rot=(0, math.pi / 2, 0), sides=18))
        # sprocket teeth
        for i, a, cy, cz in ring(17, rr * 0.86, y0 + 0.10, rr):
            objs.append(box('tooth', (SHOE_W * 0.50, 0.085, 0.085), MAT_WORN,
                            loc=(x, cy, cz), rot=(a, 0, 0)))
        # bottom rollers
        for i in range(8):
            yy = y0 + 0.55 + i * (TRACK_LEN - 1.1) / 7
            objs.append(tube('roll', 0.135, SHOE_W * 0.46, MAT_WORN,
                             loc=(x, yy, 0.135), rot=(0, math.pi / 2, 0), sides=10))
        # carrier rollers
        for yy in (TRACK_CY - 1.25, TRACK_CY + 1.25):
            objs.append(tube('crol', 0.105, SHOE_W * 0.34, MAT_WORN,
                             loc=(x, yy, 2 * rr - 0.16), rot=(0, math.pi / 2, 0), sides=10))
        # track guard / mud plate over the top run
        objs.append(box('guard', (SHOE_W * 1.05, TRACK_LEN * 0.55, 0.06), MAT_DARK,
                        loc=(x, TRACK_CY, 2 * rr + 0.10), bevel=0.02))

    # telescoping cross frame [S1] retractable width 3 000-4 500
    objs.append(box('xframe', (GAUGE * 0.55, 1.35, 0.55), MAT_DARK,
                    loc=(0, TRACK_CY, rr + 0.10), bevel=0.04))
    for side in (-1, 1):
        objs.append(box('xbeam', (GAUGE * 0.52, 0.46, 0.42), MAT_DARK,
                        loc=(side * GAUGE * 0.26, TRACK_CY + 0.95, rr + 0.06), bevel=0.03))
        objs.append(box('xbeam', (GAUGE * 0.52, 0.46, 0.42), MAT_DARK,
                        loc=(side * GAUGE * 0.26, TRACK_CY - 0.95, rr + 0.06), bevel=0.03))
    # slew ring, 1 600 single row (cross-checked on a comparable 78 t leader rig)
    objs.append(tube('slewring', 0.80, 0.20, MAT_CAST, loc=(0, 0, rr + 0.36), sides=28))
    objs.append(tube('slewtop', 0.86, 0.09, MAT_STEEL, loc=(0, 0, rr + 0.55), sides=28))
    return objs


def build_uppercarriage():
    """Deck, engine housing with hinged doors, counterweight slab, walkway and
    the handrails that wrap the whole upper deck [S6]."""
    objs = []
    objs.append(box('deck', (BODY_W, 6.90, 0.18), MAT_DARK,
                    loc=(0, -1.10, DECK_Z - 0.09), bevel=0.02))

    # engine housing, long hinged access doors down the side [S6]
    objs.append(box('house', (BODY_W - 0.06, 3.05, HOUSE_Z - DECK_Z), MAT_PAINT,
                    loc=(0, -2.75, (DECK_Z + HOUSE_Z) / 2), bevel=0.035))
    for i in range(3):
        yy = -3.95 + i * 1.0
        for side in (-1, 1):
            objs.append(box('door', (0.05, 0.92, 1.30), MAT_PAINT,
                            loc=(side * (BODY_W / 2 - 0.02), yy, DECK_Z + 0.85),
                            bevel=0.012))
            objs.append(tube('hinge', 0.026, 0.16, MAT_STEEL,
                             loc=(side * (BODY_W / 2 + 0.01), yy - 0.44, DECK_Z + 1.42),
                             rot=(math.pi / 2, 0, 0), sides=8))
    # exhaust and air cleaner
    objs.append(tube('stack', 0.085, 0.95, MAT_WORN, loc=(0.95, -4.05, HOUSE_Z), sides=12))
    objs.append(tube('aircl', 0.19, 0.62, MAT_PAINT, loc=(-0.85, -4.05, HOUSE_Z), sides=12))

    # counterweight slab across the full rear [S6]; the removable one [S1]
    objs.append(box('cwt', (BODY_W - 0.02, 0.92, 1.62), MAT_DARK,
                    loc=(0, CW_BACK + 0.46, DECK_Z + 0.86), bevel=0.05))
    objs.append(box('cwtstripe', (BODY_W - 0.10, 0.03, 0.20), MAT_HAZARD,
                    loc=(0, CW_BACK + 0.005, DECK_Z + 0.20)))
    # it is stacked elements, not one casting [W1]: 2 x 4.9 t + 1 x 2.5 t
    for zz in (0.62, 1.16):
        objs.append(box('cwtsplit', (BODY_W + 0.02, 0.98, 0.045), MAT_DARK,
                        loc=(0, CW_BACK + 0.46, DECK_Z + zz), bevel=0.012))
    for side in (-1, 1):
        objs.append(tube('cwtpin', 0.05, 0.22, MAT_STEEL,
                         loc=(side * 0.95, CW_BACK + 0.46, DECK_Z + 1.72), sides=10))

    # the housing roof is not a blank plate: cooler grille, hatches, filler
    objs.append(box('coolergrille', (1.60, 0.90, 0.06), MAT_DARK,
                    loc=(0.55, -3.40, HOUSE_Z + 0.04), bevel=0.012))
    for i in range(7):
        objs.append(box('coolerfin', (1.52, 0.055, 0.05), MAT_WORN,
                        loc=(0.55, -3.76 + i * 0.12, HOUSE_Z + 0.08)))
    objs.append(box('hatch', (0.86, 0.78, 0.07), MAT_PAINT,
                    loc=(-0.72, -2.10, HOUSE_Z + 0.05), bevel=0.015))
    for sx in (-1, 1):
        objs.append(tube('hatchlatch', 0.030, 0.06, MAT_STEEL,
                         loc=(-0.72 + sx * 0.36, -2.10, HOUSE_Z + 0.09), sides=8))
    objs.append(tube('filler', 0.105, 0.16, MAT_DARK,
                     loc=(-1.05, -1.55, HOUSE_Z + 0.02), sides=12))
    objs.append(tube('fillercap', 0.075, 0.05, MAT_STEEL,
                     loc=(-1.05, -1.55, HOUSE_Z + 0.18), sides=10))

    # walkway + toe boards along the top of the housing
    objs.append(box('walk', (BODY_W - 0.10, 3.00, 0.05), MAT_STEEL,
                    loc=(0, -2.75, HOUSE_Z + 0.03), bevel=0.01))
    for side in (-1, 1):
        objs.append(box('toe', (0.04, 3.00, 0.14), MAT_HAZARD,
                        loc=(side * (BODY_W / 2 - 0.07), -2.75, HOUSE_Z + 0.12)))

    # handrails wrapping the deck [S6] - bright galvanised tube, not machine colour
    post = bake(tube('post_tpl', 0.024, 1.05, MAT_STEEL, sides=8))
    rail_pts = []
    for i in range(7):
        rail_pts.append((-(BODY_W / 2 - 0.10), -1.30 - i * 0.52, HOUSE_Z + 0.06))
    for i in range(7):
        rail_pts.append(((BODY_W / 2 - 0.10), -1.30 - i * 0.52, HOUSE_Z + 0.06))
    for p in rail_pts:
        objs.append(clone(post, 'post', p))
    bpy.data.objects.remove(post, do_unlink=True)
    for side in (-1, 1):
        for hz in (1.02, 0.55):
            objs.append(box('rail', (0.045, 3.20, 0.045), MAT_STEEL,
                            loc=(side * (BODY_W / 2 - 0.10), -2.86, HOUSE_Z + hz),
                            bevel=0.012))
    for hz in (1.02, 0.55):
        objs.append(box('railback', (BODY_W - 0.20, 0.045, 0.045), MAT_STEEL,
                        loc=(0, -4.42, HOUSE_Z + hz), bevel=0.012))

    # access ladder, contrasting colour to the housing it is bolted to [S6]
    objs.append(box('ladstile', (0.05, 0.05, 2.05), MAT_HAZARD,
                    loc=(BODY_W / 2 + 0.14, -1.62, 1.05)))
    objs.append(box('ladstile', (0.05, 0.05, 2.05), MAT_HAZARD,
                    loc=(BODY_W / 2 + 0.14, -2.10, 1.05)))
    for i in range(7):
        objs.append(box('rung', (0.05, 0.52, 0.028), MAT_STEEL,
                        loc=(BODY_W / 2 + 0.14, -1.86, 0.28 + i * 0.30)))
    return objs


def build_cab():
    """Cab forward-left, low, glazed on three sides, slanted front screen,
    roof guard [S1]."""
    objs = []
    cx, cy = -1.04, 0.95
    w, d, h = 1.16, 1.70, 1.96
    z0 = DECK_Z
    objs.append(box('cabshell', (w, d, h), MAT_PAINT,
                    loc=(cx, cy, z0 + h / 2), bevel=0.05))
    # glazing: separate panes, so the division reads. NEVER transmission > 0.
    objs.append(box('glassL', (0.02, d - 0.20, h - 0.42), MAT_GLASS,
                    loc=(cx - w / 2 - 0.005, cy, z0 + h / 2 + 0.10)))
    objs.append(box('glassR', (0.02, d - 0.30, h - 0.55), MAT_GLASS,
                    loc=(cx + w / 2 + 0.005, cy, z0 + h / 2 + 0.14)))
    objs.append(box('glassF', (w - 0.12, 0.02, h - 0.30), MAT_GLASS,
                    loc=(cx, cy + d / 2 + 0.005, z0 + h / 2 + 0.05),
                    rot=(-0.16, 0, 0)))
    objs.append(box('glassRoof', (w - 0.22, 0.60, 0.02), MAT_GLASS,
                    loc=(cx, cy + 0.42, z0 + h + 0.005)))
    objs.append(box('glassB', (w - 0.20, 0.02, 0.72), MAT_GLASS,
                    loc=(cx, cy - d / 2 - 0.005, z0 + 1.32)))
    # mullions
    for yy in (cy - d / 2 + 0.02, cy + d / 2 - 0.02):
        objs.append(box('mull', (w + 0.02, 0.05, h), MAT_PAINT,
                        loc=(cx, yy, z0 + h / 2), bevel=0.01))
    # FOPS roof guard over the front screen
    objs.append(box('fops', (w + 0.10, 0.9, 0.05), MAT_DARK,
                    loc=(cx, cy + d / 2 - 0.15, z0 + h + 0.20), bevel=0.015))
    for side in (-1, 1):
        objs.append(box('fopsleg', (0.05, 0.05, 0.24), MAT_DARK,
                        loc=(cx + side * (w / 2 - 0.03), cy + d / 2 - 0.5, z0 + h + 0.10)))
    # wiper and step
    objs.append(tube('wiper', 0.014, 0.62, MAT_WORN,
                     loc=(cx + 0.30, cy + d / 2 + 0.03, z0 + 0.55),
                     rot=(0, -0.35, 0), sides=6))
    objs.append(box('cabstep', (w - 0.15, 0.30, 0.04), MAT_STEEL,
                    loc=(cx, cy + d / 2 + 0.16, z0 - 0.20), bevel=0.008))
    return objs


def build_mast():
    """Box-section mast with a regular pattern of round lightening holes and a
    machined rail band on the front face [S1][S4][S6]. Deliberately NOT lattice:
    every CFA machine in the source material is a plate box mast."""
    objs = []
    L = MAST_TOP_Z - MAST_FOOT_Z
    body = box('mastbox', (MAST_W, MAST_D, L), MAT_PAINT,
               loc=(0, MAST_CY, MAST_FOOT_Z + L / 2), bevel=0.025)
    # lightening holes down the side plates, punched right through
    cutters = []
    n = int((L - 2.2) / 1.15)
    for i in range(n):
        z = MAST_FOOT_Z + 1.30 + i * 1.15
        # OVAL, standing on end. [S1] calls them oval lightening/handling holes
        # and the [W1] elevation draws rounded slots taller than they are wide.
        c = tube('hole', 0.125, MAST_W + 0.4, MAT_PAINT,
                 loc=(-(MAST_W / 2 + 0.2), MAST_CY, z), rot=(0, math.pi / 2, 0), sides=16)
        c.scale = (1.75, 1.0, 1.0)      # local X becomes world Z: a standing oval
        cutters.append(c)
    cut(body, cutters)
    objs.append(body)

    # carriage rails on the front face - a machined bright band, the single
    # clearest tell that this is a box mast [S4]
    for side in (-1, 1):
        objs.append(box('rail', (0.10, 0.13, L - 0.5), MAT_STEEL,
                        loc=(side * (MAST_W / 2 - 0.13), MAST_CY + MAST_D / 2 + 0.055,
                             MAST_FOOT_Z + L / 2), bevel=0.012))
    # bolted splice flanges where the mast extension sections join
    for z in (MAST_FOOT_Z + 8.4, MAST_FOOT_Z + 16.8):
        objs.append(box('splice', (MAST_W + 0.09, MAST_D + 0.09, 0.10), MAT_DARK,
                        loc=(0, MAST_CY, z), bevel=0.012))
        bolt = bake(tube('bolt_tpl', 0.023, 0.05, MAT_STEEL, sides=6))
        for i in range(10):
            a = TAU * i / 10
            objs.append(clone(bolt, 'bolt',
                              ((MAST_W / 2 + 0.03) * math.cos(a),
                               MAST_CY + (MAST_D / 2 + 0.03) * math.sin(a), z + 0.05)))
        bpy.data.objects.remove(bolt, do_unlink=True)

    # U-shaped bright grab / guard rails projecting from the mast side [S4]
    for i in range(9):
        z = MAST_FOOT_Z + 2.2 + i * 2.4
        objs.append(box('grab', (0.05, 0.34, 0.05), MAT_STEEL,
                        loc=(-(MAST_W / 2 + 0.18), MAST_CY - 0.06, z), bevel=0.012))
        for dy in (-0.22, 0.10):
            objs.append(box('grabarm', (0.20, 0.05, 0.05), MAT_STEEL,
                            loc=(-(MAST_W / 2 + 0.09), MAST_CY + dy, z), bevel=0.012))

    # rope deflection sheave block about a third of the way up, projecting
    # sideways [S1] item 6; the [W1] elevation shows two spoked wheels here
    for i, zz in enumerate((MAST_FOOT_Z + 6.10, MAST_FOOT_Z + 7.55)):
        objs.append(box('defbracket', (0.62, 0.34, 0.46), MAT_DARK,
                        loc=(-(MAST_W / 2 + 0.20), MAST_CY + 0.10, zz), bevel=0.02))
        objs.append(tube('defsheave', 0.30, 0.11, MAT_CAST,
                         loc=(-(MAST_W / 2 + 0.46), MAST_CY + 0.10, zz),
                         rot=(0, math.pi / 2, 0), sides=18))
        objs.append(tube('defsheaverim', 0.335, 0.02, MAT_CAST,
                         loc=(-(MAST_W / 2 + 0.40), MAST_CY + 0.10, zz),
                         rot=(0, math.pi / 2, 0), sides=18))
        objs.append(tube('defhub', 0.075, 0.20, MAT_STEEL,
                         loc=(-(MAST_W / 2 + 0.50), MAST_CY + 0.10, zz),
                         rot=(0, math.pi / 2, 0), sides=10))

    # valve manifold block bolted to the mast side [S4]
    objs.append(box('manifold', (0.14, 0.36, 0.52), MAT_CAST,
                    loc=(MAST_W / 2 + 0.08, MAST_CY - 0.10, MAST_FOOT_Z + 3.1), bevel=0.015))
    # bulkhead plate: a flat steel plate with a row of couplings [S4]
    objs.append(box('bulkhead', (0.05, 0.52, 0.34), MAT_STEEL,
                    loc=(MAST_W / 2 + 0.05, MAST_CY + 0.22, MAST_FOOT_Z + 1.5), bevel=0.008))
    cpl = bake(tube('cpl_tpl', 0.030, 0.09, MAT_STEEL, sides=8))
    for i in range(6):
        objs.append(clone(cpl, 'cpl',
                          (MAST_W / 2 + 0.08, MAST_CY + 0.02 + i * 0.08,
                           MAST_FOOT_Z + 1.5),
                          (0, math.pi / 2, 0)))
    bpy.data.objects.remove(cpl, do_unlink=True)

    # THE HOSE PACKAGE: one flat, strapped, tarpaulin-wrapped ribbon up the mast,
    # not loose tubes [S4]. Flat section is the whole point.
    objs.append(box('hosepack', (0.30, 0.13, L - 3.0), MAT_RUBBER,
                    loc=(MAST_W / 2 + 0.17, MAST_CY - 0.02, MAST_FOOT_Z + 1.9 + (L - 3.0) / 2),
                    bevel=0.02))
    band = bake(box('band_tpl', (0.34, 0.16, 0.05), MAT_STEEL, bevel=0.008))
    for i in range(14):
        objs.append(clone(band, 'band',
                          (MAST_W / 2 + 0.17, MAST_CY - 0.02, MAST_FOOT_Z + 2.4 + i * 1.55)))
    bpy.data.objects.remove(band, do_unlink=True)
    return objs


def build_masthead():
    """A fabricated head that cantilevers FORWARD of the mast on two cheek
    plates, carrying two large rope sheaves side by side on a cross beam, the
    big flat hose-deflection drum on its end face, and above everything the
    slim auger top guide the string passes through [S1][S4][W1].

    [W1] shows this as an open braced structure with a diagonal back to the
    mast, wider than the mast and visibly a separate assembly — not a solid box.
    """
    objs = []
    pivots = []
    hz0, hz1 = MAST_TOP_Z, HEAD_TOP_Z
    yb = MAST_CY - MAST_D / 2
    yf = DRILL_Y + 0.55
    # the head root continues the mast section for a metre, then the cheeks go
    objs.append(box('headroot', (MAST_W + 0.12, MAST_D + 0.12, 1.10), MAT_PAINT,
                    loc=(0, MAST_CY, hz0 + 0.50), bevel=0.03))
    for side in (-1, 1):
        x = side * (MAST_W / 2 + 0.09)
        cheek = box('headcheek', (0.075, yf - yb, hz1 - hz0 - 0.15), MAT_PAINT,
                    loc=(x, (yb + yf) / 2, (hz0 + hz1) / 2 + 0.05), bevel=0.012)
        # lighten it, the way a real fabricated cheek plate is lightened
        cutters = []
        for cy, cz, cr in (((yb + yf) / 2 + 0.30, (hz0 + hz1) / 2 + 0.35, 0.44),
                           ((yb + yf) / 2 - 0.55, (hz0 + hz1) / 2 - 0.55, 0.28)):
            c = tube('hh', cr, 0.60, MAT_PAINT, loc=(0, 0, 0),
                     rot=(0, math.pi / 2, 0), sides=14)
            c.location = (x - 0.30, cy, cz)     # tube() origin is at its BASE,
            cutters.append(c)                   # so start it clear of the plate
        cut(cheek, cutters)
        objs.append(cheek)
        # top chord and the sloped nose
        objs.append(box('headchord', (0.10, yf - yb + 0.10, 0.18), MAT_PAINT,
                        loc=(x, (yb + yf) / 2, hz1 - 0.12), bevel=0.015))
        # diagonal back-brace down to the mast [W1]
        objs.append(box('headstrut', (0.11, 0.20, 2.30), MAT_PAINT,
                        loc=(x, MAST_CY + 0.30, hz0 - 0.55),
                        rot=(-0.42, 0, 0), bevel=0.018))
    # cross beams tying the cheeks
    for yy, zz in ((yf - 0.22, hz1 - 0.55), (MAST_CY + 0.35, hz1 - 0.20),
                   (yf - 0.22, hz0 + 1.15)):
        objs.append(box('headtie', (MAST_W + 0.26, 0.20, 0.20), MAT_PAINT,
                        loc=(0, yy, zz), bevel=0.018))

    # the two rope sheaves side by side on a cross beam [S1]
    objs.append(tube('sheaveaxle', 0.075, MAST_W + 0.44, MAT_STEEL,
                     loc=(-(MAST_W + 0.44) / 2, DRILL_Y - 0.18, hz1 - 0.90),
                     rot=(0, math.pi / 2, 0), sides=12))
    for i, sx in enumerate((-0.32, 0.32)):
        pv = empty(NODE_PIVOT, 'sheave%d' % (i + 1), None,
                   (sx, DRILL_Y - 0.18, hz1 - 0.90), (0, math.pi / 2, 0))
        d = tube('shv', 0.38, 0.10, MAT_CAST, sides=20)
        d.location = (sx, DRILL_Y - 0.18, hz1 - 0.95)
        d.rotation_euler = (0, math.pi / 2, 0)
        f1 = tube('shvf', 0.425, 0.024, MAT_CAST, sides=20)
        f1.location = (sx, DRILL_Y - 0.18, hz1 - 0.95)
        f1.rotation_euler = (0, math.pi / 2, 0)
        f2 = tube('shvf', 0.425, 0.024, MAT_CAST, sides=20)
        f2.location = (sx, DRILL_Y - 0.18, hz1 - 0.85)
        f2.rotation_euler = (0, math.pi / 2, 0)
        join_by_mat([d, f1, f2], 'sheave%d' % (i + 1), pv)
        pivots.append(pv)
    objs.append(box('ropeguard', (1.00, 0.60, 0.05), MAT_DARK,
                    loc=(0, DRILL_Y - 0.18, hz1 - 0.42), bevel=0.012))

    # hose-deflection drum: a big plain dark disc on the head end face [S4]
    objs.append(tube('hosedrum', 0.46, 0.16, MAT_RUBBER,
                     loc=(MAST_W / 2 + 0.28, MAST_CY + 0.10, hz0 - 0.75),
                     rot=(0, math.pi / 2, 0), sides=22))
    objs.append(tube('hosedrumhub', 0.11, 0.24, MAT_STEEL,
                     loc=(MAST_W / 2 + 0.24, MAST_CY + 0.10, hz0 - 0.75),
                     rot=(0, math.pi / 2, 0), sides=10))

    # the auger top guide: the string passes UP through it when the drive is
    # high, which is why it stands above everything else [S1] item 1, [W1]
    for side in (-1, 1):
        objs.append(box('archleg', (0.13, 0.15, ARCH_TOP_Z - hz1 + 0.55), MAT_PAINT,
                        loc=(side * 0.66, DRILL_Y, (hz1 + ARCH_TOP_Z) / 2 - 0.28),
                        bevel=0.02))
    objs.append(box('archtop', (1.45, 0.15, 0.16), MAT_PAINT,
                    loc=(0, DRILL_Y, ARCH_TOP_Z - 0.08), bevel=0.02))
    for side in (-1, 1):
        objs.append(tube('archroller', 0.075, 0.34, MAT_STEEL,
                         loc=(side * 0.52 - 0.17, DRILL_Y, ARCH_TOP_Z - 0.42),
                         rot=(0, math.pi / 2, 0), sides=10))
    objs.append(tube('lifteye', 0.09, 0.05, MAT_HAZARD,
                     loc=(0, yf - 0.10, hz0 + 0.30), rot=(math.pi / 2, 0, 0), sides=12))
    return objs, pivots


def build_drive(carriage_node):
    """Rotary drive on the crowd carriage, plus the concrete head.

    [S6] the drive is a cylindrical drum with round lightening holes in its
    casing and a toothed lower flange. [S3] hydraulic motors sit RADIALLY,
    projecting sideways off the drive body. [S2] on top sits a squat flanged
    DRUM with a 90 degree elbow that turns HORIZONTAL - the game's plain
    vertical stub is the wrong shape and the elbow is the recognisable one.
    """
    objs = []
    z = DRIVE_Z                    # default pose: near top of stroke
    # crowd carriage running on the mast rails
    objs.append(box('carriage', (MAST_W + 0.10, 0.34, 1.60), MAT_PAINT,
                    loc=(0, MAST_CY + MAST_D / 2 + 0.17, z + 0.30), bevel=0.03))
    for side in (-1, 1):
        for dz in (-0.62, 0.62):
            objs.append(box('gib', (0.19, 0.22, 0.26), MAT_CAST,
                            loc=(side * (MAST_W / 2 - 0.13),
                                 MAST_CY + MAST_D / 2 + 0.06, z + 0.30 + dz),
                            bevel=0.012))
    # yoke out to the drill axis
    objs.append(box('yoke', (0.86, DRILL_Y - MAST_CY - MAST_D / 2 - 0.20, 0.60), MAT_PAINT,
                    loc=(0, (MAST_CY + MAST_D / 2 + 0.30 + DRILL_Y) / 2, z + 0.42),
                    bevel=0.03))

    # drive drum with round lightening holes in the casing [S6]
    drum = tube('drum', 0.64, 1.20, MAT_PAINT, loc=(0, DRILL_Y, z - 0.42), sides=22)
    cutters = []
    for i, a, cx, cy in ring(8, 0.9, 0.0, DRILL_Y):
        c = tube('dh', 0.135, 1.0, MAT_PAINT, loc=(cx, cy, z + 0.22),
                 rot=(math.pi / 2, 0, -a), sides=10)
        c.location = (0.9 * math.cos(a), DRILL_Y + 0.9 * math.sin(a), z + 0.22)
        c.rotation_euler = (0, math.pi / 2, a + math.pi / 2)
        cutters.append(c)
    cut(drum, cutters)
    objs.append(drum)
    # toothed lower flange [S6]
    objs.append(tube('drumflange', 0.73, 0.12, MAT_CAST, loc=(0, DRILL_Y, z - 0.46), sides=26))
    tooth = bake(box('dtooth_tpl', (0.07, 0.07, 0.09), MAT_CAST))
    for i, a, cx, cy in ring(24, 0.75, 0.0, DRILL_Y):
        objs.append(clone(tooth, 'dtooth', (cx, cy, z - 0.50), (0, 0, a)))
    bpy.data.objects.remove(tooth, do_unlink=True)
    # gearbox top plate
    objs.append(tube('gearbox', 0.58, 0.34, MAT_DARK, loc=(0, DRILL_Y, z + 0.72), sides=20))
    # radial hydraulic motors projecting sideways [S3]
    for i, a, cx, cy in ring(4, 0.66, 0.0, DRILL_Y, phase=math.pi / 4):
        objs.append(tube('hmotor', 0.135, 0.42, MAT_CAST,
                         loc=(cx, cy, z + 0.86),
                         rot=(math.pi / 2, 0, -a - math.pi / 2), sides=12))
        objs.append(tube('hmotorcap', 0.10, 0.10, MAT_STEEL,
                         loc=(cx * 1.55, DRILL_Y + (cy - DRILL_Y) * 1.55, z + 0.86),
                         rot=(math.pi / 2, 0, -a - math.pi / 2), sides=10))
    # a rotary drive is a FABRICATED assembly, not a bare drum: side plates,
    # a top cap, lifting eyes [W1] draws it as an angular block a good deal
    # taller than it is wide
    for side in (-1, 1):
        objs.append(box('drvplate', (0.07, 1.30, 1.55), MAT_PAINT,
                        loc=(side * 0.70, DRILL_Y - 0.05, z + 0.16), bevel=0.015))
        objs.append(box('drvrib', (0.16, 0.14, 1.35), MAT_PAINT,
                        loc=(side * 0.62, DRILL_Y + 0.54, z + 0.16), bevel=0.012))
        objs.append(tube('drvlift', 0.075, 0.05, MAT_HAZARD,
                         loc=(side * 0.44, DRILL_Y - 0.05, z + 1.06),
                         rot=(math.pi / 2, 0, 0), sides=10))
    objs.append(box('drvcap', (1.52, 1.34, 0.10), MAT_PAINT,
                    loc=(0, DRILL_Y - 0.05, z + 0.95), bevel=0.015))
    # second bulkhead plate on the drive, short jumper hoses to the motors [S4]
    objs.append(box('kdkbulkhead', (0.46, 0.05, 0.32), MAT_STEEL,
                    loc=(0.0, DRILL_Y - 0.74, z + 0.55), bevel=0.008))
    jc = bake(tube('jc_tpl', 0.030, 0.10, MAT_STEEL, sides=8))
    for i in range(6):
        objs.append(clone(jc, 'jumpercpl',
                          (-0.19 + i * 0.076, DRILL_Y - 0.78, z + 0.55),
                          (math.pi / 2, 0, 0)))
    bpy.data.objects.remove(jc, do_unlink=True)
    for i in range(3):
        objs.append(hose('jumper',
                         [(-0.16 + i * 0.15, DRILL_Y - 0.80, z + 0.55),
                          (-0.30 + i * 0.34, DRILL_Y - 0.95, z + 0.74),
                          (-0.50 + i * 0.52, DRILL_Y - 0.30, z + 0.86)],
                         radius=0.026, mat=MAT_RUBBER, sides=6))

    # ── the concrete head [S2] ────────────────────────────────────────────────
    objs.append(tube('cswivel', 0.235, 0.42, MAT_CAST, loc=(0, DRILL_Y, z + 1.02), sides=18))
    objs.append(tube('cswivelflange', 0.285, 0.055, MAT_STEEL,
                     loc=(0, DRILL_Y, z + 1.44), sides=18))
    objs.append(tube('celbowup', 0.145, 0.30, MAT_STEEL,
                     loc=(0, DRILL_Y, z + 1.49), sides=14))
    # the 90 degree bend that turns HORIZONTAL - this is the recognisable shape
    # the 90 deg swan neck turns FORWARD, away from the mast and over the
    # auger, and the hose leaves it going down the front [W1]
    objs.append(tube('celbowout', 0.145, 0.66, MAT_STEEL,
                     loc=(0, DRILL_Y, z + 1.86), rot=(-math.pi / 2, 0, 0), sides=14))
    objs.append(tube('celbowknee', 0.155, 0.20, MAT_STEEL,
                     loc=(0, DRILL_Y + 0.02, z + 1.80), sides=14))
    objs.append(tube('cflange', 0.215, 0.05, MAT_STEEL,
                     loc=(0, DRILL_Y + 0.66, z + 1.86), rot=(-math.pi / 2, 0, 0), sides=16))
    for i, a, cx, cz in ring(8, 0.185, 0.0, z + 1.86):
        objs.append(tube('cflangebolt', 0.020, 0.06, MAT_STEEL,
                         loc=(cx, DRILL_Y + 0.66, cz), rot=(-math.pi / 2, 0, 0), sides=6))
    # adapter frustum stepping down to the square coupling [S2]
    objs.append(tube('cadapter', 0.30, 0.22, MAT_DARK, loc=(0, DRILL_Y, z - 0.92), sides=16))
    objs.append(box('csquare', (0.30, 0.30, 0.30), MAT_STEEL,
                    loc=(0, DRILL_Y, z - 1.05), bevel=0.015))
    return objs, z


def build_auger(z_top):
    """The continuous flight auger: ONE helix, the whole silhouette.

    Built with a SCREW modifier on a radial profile edge, not a stack of boxes.
    Flight AND central pipe are one uniform matt anthracite; the square drive
    spigots are bare bright machined steel - that contrast at every joint is the
    strongest material tell on a real auger [S5].
    """
    objs = []
    z0 = z_top - AUGER_LEN

    # central pipe [S2] 445 x 10 for the large sizes
    objs.append(tube('augerstem', STEM_R, AUGER_LEN, MAT_DARK,
                     loc=(0, DRILL_Y, z0), sides=16))

    def helix(name, r_in, r_out, thick, mat, zoff=0.0):
        me = bpy.data.meshes.new(name + '_m')
        bm = bmesh.new()
        a = bm.verts.new((r_in, 0.0, 0.0))
        b = bm.verts.new((r_out, 0.0, 0.0))
        bm.edges.new((a, b))
        bm.to_mesh(me)
        bm.free()
        o = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(o)
        sc = o.modifiers.new('screw', 'SCREW')
        sc.axis = 'Z'
        sc.angle = TAU
        sc.screw_offset = PITCH
        sc.iterations = TURNS
        sc.steps = 18
        sc.render_steps = 18
        sc.use_smooth_shade = False
        so = o.modifiers.new('sol', 'SOLIDIFY')
        so.thickness = thick
        so.offset = 0.0
        return part(name, o, mat, None, (0, DRILL_Y, z0 + zoff))

    objs.append(helix('augerflight', STEM_R * 0.94, AUGER_R - 0.045, FLIGHT_T, MAT_DARK))
    # the outer edge of a working flight polishes bright: a thin wear band that
    # wraps the sheared plate edge [S5, wear notes]
    objs.append(helix('augerwear', AUGER_R - 0.050, AUGER_R, FLIGHT_T + 0.006,
                      MAT_WORN))

    # section joints [S2]: square male spigot, socket collar, locking device
    for i in range(1, 3):
        zj = z0 + i * (AUGER_LEN / 3.0)
        objs.append(tube('jointcollar', STEM_R + 0.030, 0.20, MAT_DARK,
                         loc=(0, DRILL_Y, zj - 0.10), sides=16))
        objs.append(box('spigot', (0.30, 0.30, 0.24), MAT_STEEL,
                        loc=(0, DRILL_Y, zj + 0.10), bevel=0.014))
        for side in (-1, 1):
            objs.append(tube('lockpin', 0.026, 0.10, MAT_STEEL,
                             loc=(side * (STEM_R + 0.10), DRILL_Y, zj - 0.02),
                             rot=(0, math.pi / 2, 0), sides=8))

    # the starter / cutting head at the toe [S2] item 4
    objs.append(tube('starterbody', STEM_R + 0.02, 0.55, MAT_DARK,
                     loc=(0, DRILL_Y, z0 - 0.30), sides=16))
    objs.append(tube('headplate', AUGER_R - 0.02, 0.07, MAT_CAST,
                     loc=(0, DRILL_Y, z0 - 0.34), sides=22))
    holder = bake(box('holder_tpl', (0.075, 0.075, 0.12), MAT_CAST, bevel=0.01))
    tip = bake(tube('tip_tpl', 0.021, 0.055, MAT_STEEL, sides=8))
    for i, a, cx, cy in ring(9, AUGER_R - 0.10, 0.0, DRILL_Y):
        objs.append(clone(holder, 'pickholder', (cx, cy, z0 - 0.40), (0.42, 0, -a)))
        objs.append(clone(tip, 'picktip',
                          (cx * 1.03, DRILL_Y + (cy - DRILL_Y) * 1.03, z0 - 0.48),
                          (0.42, 0, -a)))
    bpy.data.objects.remove(holder, do_unlink=True)
    bpy.data.objects.remove(tip, do_unlink=True)
    # the sacrificial cap that plugs the stem on the way down and is blown off
    # by the concrete [S2] item 4.3 - a genuinely correct small detail
    objs.append(tube('toecap', STEM_R * 0.92, 0.10, MAT_WORN,
                     loc=(0, DRILL_Y, z0 - 0.56), sides=14))
    return objs


def build_mastfoot_and_linkage():
    """The mast is carried on a heavy parallelogram / A-frame linkage with very
    large pin joints plus two diagonal cylinders, not bolted rigidly to the
    deck [S1][S6]."""
    objs = []
    rams = []
    # front frame on the deck
    objs.append(box('frontframe', (2.40, 1.60, 0.86), MAT_PAINT,
                    loc=(0, MAST_CY - 0.85, DECK_Z + 0.45), bevel=0.04))
    for side in (-1, 1):
        # A-frame lower link, deck to mast foot, with very large pin joints
        objs.append(box('link', (0.24, 1.55, 0.34), MAT_DARK,
                        loc=(side * 0.66, MAST_CY - 0.62, DECK_Z + 0.62),
                        rot=(0.34, 0, 0), bevel=0.02))
        objs.append(tube('pin', 0.115, 0.36, MAT_STEEL,
                         loc=(side * 0.66 - 0.18, MAST_CY - 0.05, DECK_Z + 0.90),
                         rot=(0, math.pi / 2, 0), sides=12))
        objs.append(tube('pin', 0.115, 0.36, MAT_STEEL,
                         loc=(side * 0.66 - 0.18, MAST_CY - 1.30, DECK_Z + 0.34),
                         rot=(0, math.pi / 2, 0), sides=12))
        # upper parallelogram link running up to mid-mast
        objs.append(box('uplink', (0.20, 0.30, 1.90), MAT_DARK,
                        loc=(side * 0.80, MAST_CY - 0.72, DECK_Z + 1.55),
                        rot=(-0.22, 0, 0), bevel=0.02))
    # mast foot shoe
    objs.append(box('mastfoot', (MAST_W + 0.20, MAST_D + 0.24, 0.60), MAT_DARK,
                    loc=(0, MAST_CY, MAST_FOOT_Z + 0.10), bevel=0.03))
    return objs, rams


def build_mast_rams():
    """Two heavy diagonal mast cylinders running from the deck up and FORWARD to
    mid-mast, bright chrome rods [S1][W1]. Barrel on a pivot, rod on a slide, so
    the game can rake the mast — sourced kinematics are strongly asymmetric,
    5 deg forward and 90 deg back [S1]."""
    nodes = []
    ang = -0.30                      # lean toward +Y, ~17 deg off vertical
    dy, dz = -math.sin(ang), math.cos(ang)
    for side, tag in ((-1, 'L'), (1, 'R')):
        base = (side * 0.88, MAST_CY - 1.55, DECK_Z + 0.55)

        def at(t):
            return (base[0], base[1] + dy * t, base[2] + dz * t)

        pv = empty(NODE_PIVOT, 'mastRam' + tag, None, base, (ang, 0, 0))
        brl = tube('rambarrel', 0.170, 3.10, MAT_PAINT, sides=14)
        brl.location = base
        brl.rotation_euler = (ang, 0, 0)
        shoulder = tube('ramshoulder', 0.195, 0.26, MAT_CAST, sides=14)
        shoulder.location = at(2.86)
        shoulder.rotation_euler = (ang, 0, 0)
        eye = tube('rameye', 0.105, 0.32, MAT_CAST, sides=12)
        eye.location = (base[0] - 0.16, base[1], base[2])
        eye.rotation_euler = (0, math.pi / 2, 0)
        join_by_mat([brl, shoulder, eye], 'ramBarrel' + tag, pv)

        sl = empty(NODE_SLIDE, 'mastRod' + tag, pv, (0, 0, 3.05))
        rod = tube('ramrod', 0.098, 1.75, MAT_CHROME, sides=12)
        rod.location = at(3.05)
        rod.rotation_euler = (ang, 0, 0)
        tipeye = tube('rodeye', 0.098, 0.28, MAT_CAST, sides=12)
        tipeye.location = (base[0] - 0.14, at(4.80)[1], at(4.80)[2])
        tipeye.rotation_euler = (0, math.pi / 2, 0)
        join_by_mat([rod, tipeye], 'ramRod' + tag, sl)
        nodes += [pv, sl]
    return nodes


def build_cleaner():
    """The auger cleaner, 1 100 above ground [S1].

    NOTE, honestly: the sources disagree. The dimensioned elevation shows a
    multi-arm STAR silhouette; the method texts describe a hydraulic ARM
    adjustable across 400-2 000 mm. Modelled as a star rotor carried on a
    swing-out bracket so both readings are represented; neither source is
    overstated. Rotor is a pivot so it can sweep.
    """
    objs = []
    # fixed swing bracket off the mast foot
    objs.append(box('cleanerarm', (0.90, 0.20, 0.18), MAT_PAINT,
                    loc=(-0.90, DRILL_Y - 0.20, CLEANER_Z), bevel=0.02))
    objs.append(tube('cleanerram', 0.065, 0.70, MAT_CHROME,
                     loc=(-1.30, DRILL_Y - 0.55, CLEANER_Z - 0.10),
                     rot=(-0.9, 0, 0.5), sides=10))
    objs.append(box('cleanerpivotbox', (0.26, 0.26, 0.42), MAT_DARK,
                    loc=(-1.42, DRILL_Y - 0.20, CLEANER_Z), bevel=0.02))

    pv = empty(NODE_PIVOT, 'augerCleaner', None, (0, DRILL_Y, CLEANER_Z))
    rot = []
    rot.append(tube('cleanerhub', 0.16, 0.22, MAT_DARK,
                    loc=(0, DRILL_Y, CLEANER_Z - 0.11), sides=12))
    blade = bake(box('blade_tpl', (0.10, 0.44, 0.16), MAT_WORN, bevel=0.012))
    for i, a, cx, cy in ring(5, 0.36, 0.0, DRILL_Y):
        b = clone(blade, 'cleanerblade', (cx, cy, CLEANER_Z), (0, 0, a + math.pi / 2))
        rot.append(b)
    bpy.data.objects.remove(blade, do_unlink=True)
    join_by_mat(rot, 'cleaner', pv)
    return objs, [pv]


def build_basebox():
    """The drilling-table box at the mast foot, 1 630 high, sitting under the
    auger [S1] item 10. Everything within ~1.5 m of the ground here is the
    dirtiest part of the machine."""
    objs = []
    objs.append(box('basebox', (2.10, 1.60, BASEBOX_H), MAT_PAINT,
                    loc=(0, DRILL_Y + 0.05, BASEBOX_H / 2), bevel=0.04))
    # the auger passes through it: cut the bore
    bore = tube('bore', AUGER_R + 0.10, BASEBOX_H + 0.6, MAT_PAINT,
                loc=(0, DRILL_Y, -0.3), sides=20)
    cut(objs[0], [bore])
    objs.append(tube('collarring', AUGER_R + 0.16, 0.10, MAT_WORN,
                     loc=(0, DRILL_Y, BASEBOX_H), sides=22))
    # corner posts, ribs, a lifting lug and an access hatch, so a 2.1 x 1.6 x
    # 1.63 m fabrication does not read as a primitive (rubric axis 4)
    for sx in (-1, 1):
        for sy in (-1, 1):
            objs.append(box('basepost', (0.13, 0.13, BASEBOX_H + 0.03), MAT_DARK,
                            loc=(sx * 1.02, DRILL_Y + 0.05 + sy * 0.77,
                                 BASEBOX_H / 2), bevel=0.015))
    for i in range(3):
        objs.append(box('baserib', (0.09, 1.58, 0.11), MAT_PAINT,
                        loc=(-0.52 + i * 0.52, DRILL_Y + 0.05, BASEBOX_H - 0.34),
                        bevel=0.012))
    objs.append(box('basehatch', (0.62, 0.04, 0.60), MAT_DARK,
                    loc=(0.42, DRILL_Y + 0.86, 0.80), bevel=0.012))
    for hz in (0.62, 0.98):
        objs.append(tube('basehinge', 0.024, 0.10, MAT_STEEL,
                         loc=(0.12, DRILL_Y + 0.88, hz),
                         rot=(math.pi / 2, 0, 0), sides=8))
    objs.append(box('baseflange', (2.16, 1.66, 0.09), MAT_DARK,
                    loc=(0, DRILL_Y + 0.05, BASEBOX_H + 0.04), bevel=0.012))
    for sx in (-1, 1):
        objs.append(tube('baselug', 0.085, 0.045, MAT_HAZARD,
                         loc=(sx * 0.86, DRILL_Y + 0.05, BASEBOX_H + 0.20),
                         rot=(math.pi / 2, 0, 0), sides=10))
    for side in (-1, 1):
        objs.append(box('basestripe', (0.06, 1.50, 0.22), MAT_HAZARD,
                        loc=(side * 1.05, DRILL_Y + 0.05, 0.30)))
    objs.append(box('basestep', (2.10, 0.30, 0.05), MAT_STEEL,
                    loc=(0, DRILL_Y + 0.90, BASEBOX_H + 0.03), bevel=0.008))
    return objs


def build_winches():
    """Two ropes run from the uppercarriage winches over the masthead sheaves
    [S1]. Main rope 32 mm, auxiliary 20 mm [S1]."""
    objs = []
    for i, (x, r0, w) in enumerate(((-0.78, 0.36, 0.72), (0.86, 0.28, 0.52))):
        objs.append(tube('winchdrum', r0, w, MAT_DARK,
                         loc=(x - w / 2, -1.55, HOUSE_Z - 0.62),
                         rot=(0, math.pi / 2, 0), sides=16))
        for dx in (0, w):
            objs.append(tube('winchflange', r0 + 0.08, 0.05, MAT_CAST,
                             loc=(x - w / 2 + dx, -1.55, HOUSE_Z - 0.62),
                             rot=(0, math.pi / 2, 0), sides=16))
        objs.append(box('winchframe', (w + 0.24, 0.28, 0.55), MAT_PAINT,
                        loc=(x - w / 2 + w / 2, -1.55, HOUSE_Z - 0.95), bevel=0.02))
    return objs


def build_ropes():
    """Reeved rope. hose() gives the Bezier sag a straight cylinder never will.
    [W1] shows both ropes running the full mast length on the BACK face of the
    mast, not out in the open air; main rope 32 mm, auxiliary 20 mm [S1]."""
    objs = []
    back = MAST_CY - MAST_D / 2 - 0.09
    objs.append(hose('mainrope',
                     [(-0.34, -1.55, HOUSE_Z - 0.28),
                      (-0.34, back - 0.95, HOUSE_Z + 0.95),
                      (-0.34, back - 0.06, 4.60),
                      (-0.34, back, 9.50),
                      (-0.34, back, HEAD_TOP_Z - 1.60),
                      (-0.34, MAST_CY + 0.70, HEAD_TOP_Z - 0.40),
                      (-0.34, DRILL_Y - 0.30, HEAD_TOP_Z - 0.42),
                      (-0.34, DRILL_Y - 0.06, HEAD_TOP_Z - 1.15)],
                     radius=0.016, mat=MAT_WORN, sides=6))
    objs.append(hose('auxrope',
                     [(0.62, -1.55, HOUSE_Z - 0.28),
                      (0.52, back - 0.95, HOUSE_Z + 0.95),
                      (0.40, back - 0.06, 4.60),
                      (0.34, back, 9.50),
                      (0.34, back, HEAD_TOP_Z - 1.60),
                      (0.34, MAST_CY + 0.70, HEAD_TOP_Z - 0.40),
                      (0.34, DRILL_Y - 0.30, HEAD_TOP_Z - 0.42),
                      (0.34, DRILL_Y + 0.40, HEAD_TOP_Z - 3.40)],
                     radius=0.010, mat=MAT_WORN, sides=6))
    return objs


def build_concrete_line(z_head):
    """The CFA rig's signature, and no other foundation machine has it: a fat
    concrete line from a ground-standing pump, across the ground and up to the
    swan neck on top of the string [S2] item 1.

    ROUTING CORRECTED FROM [W1]: on the dimensioned CFA elevation the hose is
    the single heaviest line in the drawing and it hangs from the swan neck as
    one long, near-vertical run standing about a metre FORWARD of the auger,
    clear of the flights, down to the ground. It is not strapped up the mast —
    that is the hydraulic package, which is a different object entirely [S4].
    The game currently stops this hose in mid-air a fifth of the way up the
    mast; it has to reach the ground or the machine does not read as CFA.
    """
    objs = []
    fy = DRILL_Y + 1.05          # the hose hangs this far forward of the auger
    objs.append(hose('concreteline',
                     [(0.0, DRILL_Y + 0.66, z_head + 1.86),
                      (0.10, fy, z_head + 1.30),
                      (0.16, fy + 0.06, z_head * 0.62),
                      (0.20, fy + 0.02, z_head * 0.24),
                      (0.34, fy - 0.10, 1.55),
                      (0.95, fy + 0.55, 0.22),
                      (2.20, fy + 1.05, 0.13),
                      (3.55, fy + 0.85, 0.12),
                      (4.60, DRILL_Y + 1.60, 0.12)],
                     radius=0.085, mat=MAT_RUBBER, sides=9))
    # heavy clamped steel couplings — a concrete line is jointed, not continuous
    for i, (px, py, pz, rx, rz) in enumerate((
            (0.16, fy + 0.05, z_head * 0.62, 0.06, 0.0),
            (0.22, fy + 0.00, z_head * 0.30, 0.06, 0.0),
            (0.55, fy + 0.28, 0.60, 1.25, 0.5))):
        objs.append(tube('clinecoupling', 0.108, 0.17, MAT_STEEL,
                         loc=(px, py, pz), rot=(rx, 0, rz), sides=12))
    # a guide shoe on the mast that keeps the line off the flights
    objs.append(box('clineguide', (0.34, 0.30, 0.16), MAT_DARK,
                    loc=(0.20, MAST_CY + 1.15, 5.40), bevel=0.02))
    objs.append(tube('clineroller', 0.11, 0.26, MAT_WORN,
                     loc=(0.33, MAST_CY + 1.15, 5.40),
                     rot=(0, math.pi / 2, 0), sides=10))
    return objs


def build_lights():
    """env.js reads mount:/aim: world positions EVERY FRAME to re-aim spotlights,
    which is why a lamp on the mast sweeps as the drive works."""
    nodes = []
    # cab roof pair, looking at the hole
    for side, nm in ((-1, 'cabL'), (1, 'cabR')):
        m, a = worklight('cab' + ('L' if side < 0 else 'R'), None,
                         (-1.04 + side * 0.44, 1.82, DECK_Z + 2.22),
                         aim_dir=(0.5 * side, 2.4, -2.4), cone_deg=58, range_m=26)
        nodes += [m, a]
    # mast foot flood on the auger cleaner and the collar
    m, a = worklight('collar', None, (-1.05, MAST_CY + 0.62, 3.35),
                     aim_dir=(1.0, 1.7, -3.2), cone_deg=48, range_m=18)
    nodes += [m, a]
    # mid-mast lamp washing the flights - this is the one that sweeps
    m, a = worklight('mastMid', None, (MAST_W / 2 + 0.26, MAST_CY + 0.30, 9.20),
                     aim_dir=(-0.6, 1.4, -2.6), cone_deg=44, range_m=30)
    nodes += [m, a]
    # masthead lamp down the drill axis
    m, a = worklight('mastHead', None, (0.0, MAST_CY + 1.45, MAST_TOP_Z - 0.65),
                     aim_dir=(0.0, 0.9, -3.0), cone_deg=36, range_m=40)
    nodes += [m, a]
    # rear deck lamp for the walkway
    m, a = worklight('deckRear', None, (0.0, -4.30, HOUSE_Z + 1.15),
                     aim_dir=(0.0, -1.2, -2.0), cone_deg=62, range_m=16)
    nodes += [m, a]

    # lamp housings, static geometry, one draw call with the rest of the steel
    for n in nodes:
        if n.name.startswith(NODE_MOUNT):
            b = box('lamp', (0.24, 0.14, 0.20), MAT_DARK,
                    loc=tuple(n.matrix_world.translation), bevel=0.02)
            g = box('lampglass', (0.20, 0.02, 0.16), MAT_GLASS,
                    loc=(n.matrix_world.translation[0],
                         n.matrix_world.translation[1] + 0.08,
                         n.matrix_world.translation[2]))
    return nodes


# ── main ──────────────────────────────────────────────────────────────────────

def build(out_path):
    reset()

    statics = []
    statics += build_undercarriage()
    statics += build_uppercarriage()
    statics += build_cab()
    statics += build_basebox()
    statics += build_winches()
    statics += build_ropes()
    foot, _ = build_mastfoot_and_linkage()
    statics += foot

    # ── the mast, and everything that rakes with it ───────────────────────────
    mast_pivot = empty(NODE_PIVOT, 'mast', None, (0, MAST_CY, MAST_FOOT_Z + 0.20))
    mast_parts = build_mast()
    head_parts, sheave_pivots = build_masthead()
    join_by_mat(mast_parts + head_parts, 'mast', mast_pivot)
    for sp in sheave_pivots:
        attach(sp, mast_pivot)

    # ── the crowd carriage, the drive, and the auger hanging off it ───────────
    carriage = empty(NODE_SLIDE, 'carriage', None, (0, DRILL_Y, DRIVE_Z))
    attach(carriage, mast_pivot)
    drive_parts, z_head = build_drive(carriage)
    join_by_mat(drive_parts, 'drive', carriage)

    spindle = empty(NODE_PIVOT, 'spindle', None, (0, DRILL_Y, z_head - 1.05))
    attach(spindle, carriage)
    tool_mount = empty(NODE_MOUNT, 'tool', spindle, (0, 0, 0))
    auger_parts = build_auger(z_head - 1.05)
    join_by_mat(auger_parts, 'auger', spindle)

    # ── the rest ──────────────────────────────────────────────────────────────
    cl_static, cl_pivots = build_cleaner()
    statics += cl_static
    statics += build_concrete_line(z_head)
    build_mast_rams()
    build_lights()

    # where the ground-standing concrete pump and the spoil skip belong: the
    # rig is never alone on a CFA job, and the scene needs the anchor points
    empty(NODE_MOUNT, 'concretePump', None, (3.90, DRILL_Y + 2.55, 0.10))
    empty(NODE_MOUNT, 'spoilSkip', None, (-3.40, DRILL_Y + 1.20, 0.10))
    empty(NODE_MOUNT, 'pileAxis', None, (0.0, DRILL_Y, 0.0))

    # finish() joins the statics, and join() has the same modifier-stack trap as
    # above: bake every remaining mesh so a bevel cannot be lost or multiplied.
    for o in list(bpy.context.scene.objects):
        if o.type == 'MESH' and o.modifiers:
            bake(o)
    bpy.ops.object.select_all(action='DESELECT')

    return finish(out_path)


if __name__ == '__main__':
    build(os.path.abspath(os.path.join(HERE, '..', 'public', 'models', 'cfa_rig.glb')))
