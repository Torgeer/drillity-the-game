"""
pd55 — "BamBam PD-55 Driveline"
Leader rig (Maekler rig) on a 55 t tracked base carrier: hydraulic impact
piling with a mast-guided hammer, and DTH drilling with a rotary head on a
tiltable sledge.

PROVENANCE
----------
Every load-bearing dimension below traces to the owner's OEM catalogue copy:

  [DS]  RTG Rammtechnik GmbH, "RM 20 Ramm- / Bohrgeraet | Piling Drilling Rig",
        document 905.836.1+2, 12/2019, 12 pp.
        In repo: research/rigs/source/RTG_RM20_official_905_836_1_2.pdf
        Digest:  research/rigs/rm20-leader.md
  [P4]  [DS] p. 4  — piling-configuration dimension elevation (A, A1, B, C, D, E)
  [P7]  [DS] p. 7  — DTH-configuration dimension elevation
  [P9]  [DS] p. 9  — base carrier / undercarriage side elevation + data table
  [P10] [DS] p. 10 — transport plan and elevations
  [P2]  [DS] p. 2  — numbered component diagram, piling trim
  [P5]  [DS] p. 5  — numbered component diagram, DTH trim
  [P3]  [DS] p. 3  — feature callouts + inclination silhouette (18.5/45/18.5 deg)
  [P8]  [DS] p. 8  — standard-equipment list (counterweights, ladder, 4 spotlights)
  [P1]  [DS] p. 1  — cover render, both trims, three-quarter view. This is the
                     only colour reference for panel breaks, glazing division,
                     handrail runs and where the hoses actually go.

Where [DS] gives only a silhouette I measured the drawing rasters directly:
the page rasters were extracted and scaled against a dimension the sheet
states, then read off in pixels. Scale keys used:
  [M9]  p. 9 elevation, 93.1 px/m, keyed on overall crawler length 5.20 m [P9];
        origin fixed by the stated 4.60 m swing radius [P4] landing exactly on
        the rear face of the counterweight stack.
  [M4]  p. 4 elevation, 94.4 px/m, keyed on the same 5.20 m crawler length.
Anything measured that way is tagged [M9]/[M4] and is a MEASUREMENT OF A
DRAWING, not a stated figure — good to roughly +/-0.05 m, no better.
Anything with no source at all is tagged DERIVED and says what from.

NAMING
------
DOMAIN.md sec.10 / PLATFORM_TRUTH.md Part C: no real manufacturer name or model
designation may reach a player. Shape is not branding. So the geometry is the
real machine and every *string* in this file that can be exported — object
names, material names — is generic or belongs to the invented marque. The OEM
names live only in these comments, which is where provenance belongs.

CONTRACTS (blender/lib/rig.py)
------------------------------
* Named nodes: `pivot:` rotate, `slide:` translate, `mount:`/`aim:` are read by
  src/core/env.js every frame to re-aim the spotlights. Looked up BY STRING.
* Materials are names only (MAT_* constants). No maps, no transmission.
* <= 70 draw calls. finish() joins statics by material; anything under a
  pivot:/slide: node is left alone, so every dynamic group welds itself with
  weld() below or each bolt becomes its own draw call.
* Origin = slew centre at ground level.
"""

import math
import bpy
import bmesh
from mathutils import Matrix, Vector

from rig import (
    reset, part, box, tube, hose, empty, worklight, finish,
    NODE_MOUNT, NODE_AIM, NODE_PIVOT, NODE_SLIDE,
    MAT_PAINT, MAT_DARK, MAT_STEEL, MAT_WORN, MAT_CAST,
    MAT_RUBBER, MAT_GLASS, MAT_CHROME, MAT_HAZARD,
)

# ═══════════════════════════════════════════════════════════════════════════
#  DIMENSIONS
# ═══════════════════════════════════════════════════════════════════════════

# ── undercarriage, type UW 60 F ──────────────────────────────────────────
TRACK_LEN   = 5.20    # overall crawler length, dim A                    [P9]
WHEELBASE   = 4.34    # sprocket-to-idler centres, dim B                 [P9]
SHOE_W      = 0.90    # track shoe width (800/1000 optional)             [P9]
TUMBLER_R   = 0.43    # DERIVED: (TRACK_LEN - WHEELBASE)/2 = 0.43 m, i.e.
                      # the belt wraps a 0.86 m tumbler at each end. The
                      # sheet gives no wheel diameter (rm20-leader.md sec.10).
GAUGE_WIDE  = 4.70    # extended crawler width, working stance           [P9]
GAUGE_NARROW= 3.20    # retracted crawler width, transport stance   [P9][P10]
TRACK_X     = (GAUGE_WIDE - SHOE_W) / 2.0      # = 1.90, frame centreline
TRACK_X_IN  = (GAUGE_NARROW - SHOE_W) / 2.0    # = 1.15
TRACK_Y     = 0.13    # [M9] slew centre sits 2.73 m ahead of the front tip
                      # and 2.47 m behind the rear tip, so the belt centre is
                      # 0.13 m forward of the slew axis.

# ── upper carriage ───────────────────────────────────────────────────────
UPPER_W     = 3.00    # width of upper carriage                          [P9]
SWING_R     = 4.60    # swing radius over counterweight, dim D           [P4]
DECK_Z      = 1.20    # [M9] deck plate top, 1.20 m above ground
HOUSE_TOP   = 2.96    # [M9] roof of the machinery house = the service deck
CAB_ROOF    = 3.13    # [M9] cab roof; sheet's 3.2 m transport height [P10]
                      # is this plus the folded roof furniture.
FRONT_Y     = 2.05    # [M9] front face of the upper carriage
HOUSE_Y0    = -3.47   # [M9] machinery-house rear face
HOUSE_Y1    = -1.05   # [M9] machinery-house front face
CAB_Y0      = -0.30   # [M9] cab rear
CAB_Y1      = 1.79    # [M9] cab front

# ── mast (Maekler) and the working line ──────────────────────────────────
RIG_H       = 25.70   # max rig height as drawn, dim A                   [P4]
RIG_H_MIN   = 19.50   # min rig height, dim A1                           [P4]
MAST_SLIDE  = 7.00    # max cylinder stroke, dim B; the mast is vertically
                      # displaceable by 7 m, underfloor work possible [P4][P3]
PILE_Y      = 4.20    # min working radius, dim C — this is the PILE axis [P4]
PILE_Y_MAX  = 5.70    # max working radius at min mast height, dim C     [P4]
MAST_Y      = 3.10    # [M4] mast axis, 1.10 m inboard of the pile axis
MAST_W      = 0.92    # DERIVED. [M4] gives 0.48 m in side elevation; the
MAST_D      = 0.52    # plan view [P10] shows the mast noticeably wider than
                      # deep. Section is NOT SOURCED (rm20-leader.md sec.10).
MAST_Z0     = 3.90    # [M4] mast foot in the fully-raised pose
MAST_HEAD_H = 2.24    # DERIVED. The head is a fabricated frame, not a box:
                      # its height is whatever the sheaves, the damper units
                      # and the fold cylinder need. Measured off the built
                      # geometry rather than assumed, then MAST_LEN set so the
                      # total lands on the stated A = 25.70 m.
MAST_LEN    = RIG_H - 3.90 - MAST_HEAD_H   # = 19.48 m of mast
MAX_PILE    = 18.00   # max pile length, hammer dependent, dim E         [P4]

# ── kinematics: four-bar, high pivot, mast stays plumb ───────────────────
# [M4] read off the p.4 elevation. The sheet calls it "Parallelogrammkinematik"
# with a "high mast pivot point" and "minimised change of centre of gravity"
# [P3][P8]; the drawing shows a tall rear column and a short front link both
# footed on the upper-carriage front, carrying a triangular gusset that holds
# the mast guide.
KIN_REAR_FOOT  = (0.50, 1.35)   # (y, z) rear column foot pivot     [M4]
KIN_REAR_TOP   = (1.25, 5.65)   # (y, z) rear column head pivot     [M4]
KIN_FRONT_FOOT = (1.95, 1.35)   # (y, z) front link foot pivot      [M4]
KIN_FRONT_TOP  = (2.15, 3.75)   # (y, z) front link head pivot      [M4]
GUIDE_Z0    = 3.20    # [M4] mast guide collar, lower face
GUIDE_Z1    = 6.10    # [M4] mast guide collar, upper face

# ── winches ──────────────────────────────────────────────────────────────
# Main/hammer winch 133 kN, pile winch 80 kN [P4]; "synchronised winch
# concept" [P3]. Drum sizes DERIVED from line pull ratio; not sourced.
WINCH_Y     = 1.60    # [M4] drum axis, forward end of the machinery deck
WINCH_Z     = 2.85    # [M4]

# ── counterweight ────────────────────────────────────────────────────────
# "Variably stackable counterweight elements", 2 x 1.8 t + 4.9 t [P3][P8].
CW_Y1       = -3.45   # [M9] front face of the slab stack
CW_Y0       = -SWING_R  # rear face lands exactly on the 4.60 m swing radius
CW_Z0       = 1.18    # [M9]
CW_Z1       = 2.26    # [M9] three slabs of ~0.36 m

BEV = 0.018           # default edge break. A bevelled edge is what stops
                      # steel reading as cardboard, and it costs triangles,
                      # not draw calls.


# ═══════════════════════════════════════════════════════════════════════════
#  LOCAL HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def bake(o):
    """Apply every modifier now.

    finish() joins by material and glTF export bakes modifiers — but a join
    keeps only the ACTIVE object's modifier stack, so unapplied bevels on the
    other members of the group are silently lost. Applying up front makes the
    join lossless and the triangle count predictable.
    """
    if not o.modifiers:
        return o
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    return o


def cube(name, size, mat=MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
         bevel=BEV):
    """A box of exactly `size` metres, with this machine's default edge break.

    This was a full copy of rig.box() with the scaling corrected, written when
    that helper built at half size and could not be changed under the other
    machines. rig.py was fixed centrally on 2026-09-05, so the copy is gone and
    only the BEV default is left here. Nothing about the geometry changes: the
    copy and the library now do the same thing, which is the point of deleting
    it - two implementations of one primitive is how they drift.
    """
    return box(name, size, mat, parent, loc, rot, bevel)


def bx(name, size, mat=MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
       bevel=BEV):
    return bake(cube(name, size, mat, parent, loc, rot, bevel))


def tb(name, r, ln, mat=MAT_STEEL, parent=None, loc=(0, 0, 0), rot=(0, 0, 0),
       sides=12):
    return tube(name, r, ln, mat, parent, loc, rot, sides)


def member(name, parent, a, b, x, w, t, mat=MAT_PAINT, bevel=0.022, ext=0.0):
    """A box member spanning two (y, z) points at a given x.

    Fabricated steel is triangulated. A gusset drawn as one solid rectangle
    reads as a billboard from every angle — REVIEW_RUBRIC.md axis 4 fails a
    primitive left visible as a primitive — so the carrier and the linkage are
    built from members between real pin centres instead.
    """
    dy, dz = b[0] - a[0], b[1] - a[1]
    ln = math.hypot(dy, dz) + ext
    ang = math.atan2(dz, dy) - math.pi / 2
    return bx(name, (w, t, ln), mat, parent,
              (x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2), (ang, 0, 0), bevel)


def node(kind, name, parent=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    return empty(kind, name, parent, loc, rot)


def weld(group, tag):
    """Join every DIRECT mesh child of `group` by material, one mesh each.

    finish() refuses to touch anything under a pivot:/slide: node, because it
    has to move independently — so a dynamic subassembly has to collapse
    itself or its 90 boxes become 90 draw calls. Only direct children are
    considered, which is why every mesh in this file is parented straight to
    the group it belongs to.
    """
    groups = {}
    for o in list(group.children):
        if o.type != 'MESH':
            continue
        key = o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault(key, []).append(o)
    for key, objs in groups.items():
        if len(objs) > 1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in objs:
                o.select_set(True)
            bpy.context.view_layer.objects.active = objs[0]
            bpy.ops.object.join()
        objs[0].name = tag + ':' + key
    return group


def hs(name, pts, r, mat, parent=None, sides=6):
    """hose() but converted to a mesh.

    A curve object is one draw call that weld() cannot touch — weld only sees
    MESH children — so four hose runs on the upper carriage were four draw
    calls for geometry that all shares one material. Converting on the spot
    folds them into the group's rubber mesh and costs nothing but triangles,
    which is the lane we are told to spend in.
    """
    o = hose(name, pts, r, mat, None, sides)
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    o = bpy.context.active_object
    o.name = name
    if not o.data.materials:
        o.data.materials.append(bpy.data.materials[mat])
    if parent is not None:
        o.parent = parent
    return o


def bmesh_obj(name, verts_fn, mat, parent=None, loc=(0, 0, 0)):
    """Build one mesh from bmesh ops. Used where a loop of bpy.ops primitives
    would be both slow and pointless — a 57-shoe track belt, for instance."""
    bm = bmesh.new()
    verts_fn(bm)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(bpy.data.materials.get(mat) or bpy.data.materials.new(mat))
    o.location = loc
    if parent is not None:
        o.parent = parent
    return o


def bm_box(bm, c, s, rot_x=0.0):
    m = (Matrix.Translation(Vector(c)) @ Matrix.Rotation(rot_x, 4, 'X')
         @ Matrix.Diagonal(Vector((s[0], s[1], s[2], 1.0))))
    bmesh.ops.create_cube(bm, size=1.0, matrix=m)


# ═══════════════════════════════════════════════════════════════════════════
#  UNDERCARRIAGE
# ═══════════════════════════════════════════════════════════════════════════

def belt_point(phi, wb, r):
    """Walk the track belt centreline. Returns (y, z, roll) where roll is the
    X-rotation that puts a shoe's +Z along the outward normal."""
    Ls, Lc = wb, math.pi * r
    if phi < Ls:                                   # bottom run, ground side
        n = -math.pi / 2
        return (-wb / 2 + phi, 0.0, n)
    phi -= Ls
    if phi < Lc:                                   # front tumbler
        a = phi / r
        n = -math.pi / 2 + a
        return (wb / 2 + r * math.cos(n), r + r * math.sin(n), n)
    phi -= Lc
    if phi < Ls:                                   # top run
        n = math.pi / 2
        return (wb / 2 - phi, 2 * r, n)
    phi -= Ls
    a = phi / r                                    # rear tumbler
    n = math.pi / 2 + a
    return (-wb / 2 + r * math.cos(n), r + r * math.sin(n), n)


def track_belt(name, parent, mirror):
    """A real chain of shoes, not a stadium-shaped tube. 57 plates at ~0.20 m
    pitch around an 11.38 m belt: the grouser edge is most of what a crawler
    reads as at distance, and it is the cheapest big silhouette win here."""
    N = 57
    per = 2 * WHEELBASE + 2 * math.pi * TUMBLER_R
    pitch = per / N

    def make(bm):
        for i in range(N):
            y, z, n = belt_point(i * pitch, WHEELBASE, TUMBLER_R)
            roll = n - math.pi / 2
            ny, nz = math.cos(n), math.sin(n)
            # shoe plate
            bm_box(bm, (0.0, y + ny * 0.022, z + nz * 0.022),
                   (SHOE_W, pitch * 0.94, 0.044), roll)
            # grouser bar, the ridge that actually bites
            bm_box(bm, (0.0, y + ny * 0.066, z + nz * 0.066),
                   (SHOE_W * 0.98, pitch * 0.30, 0.048), roll)
            # link plates inboard of the shoe, on the pin line
            for sx in (-0.19, 0.19):
                bm_box(bm, (sx, y - ny * 0.040, z - nz * 0.040),
                       (0.055, pitch * 0.80, 0.085), roll)
    return bmesh_obj(name, make, MAT_DARK, parent, (0, TRACK_Y, 0))


def build_undercarriage(root):
    """Type UW 60 F [P9]. The frames extend 3.20 -> 4.70 m; working and
    transport stances differ visibly, so both track frames hang off slide:
    nodes and the extension beams they ride on are modelled."""
    # carbody: the fixed centre frame the slew ring sits on
    bx('carbody', (1.55, 2.90, 0.62), MAT_DARK, root, (0, TRACK_Y, 0.72), bevel=0.03)
    bx('carbody-nose', (1.10, 0.70, 0.34), MAT_DARK, root, (0, TRACK_Y + 1.70, 0.62))
    # the two extension beams the frames slide out on — visible, and they
    # have to be, or the wide stance looks like the tracks are floating
    for yy in (TRACK_Y + 1.28, TRACK_Y - 1.28):
        bx('spread-beam', (GAUGE_WIDE - 0.30, 0.42, 0.30), MAT_DARK, root,
           (0, yy, 0.62), bevel=0.02)
        bx('spread-slide', (GAUGE_WIDE - 0.16, 0.22, 0.17), MAT_CHROME, root,
           (0, yy, 0.62), bevel=0.01)
    # slew ring
    tb('slew-ring', 0.98, 0.17, MAT_WORN, root, (0, 0, 1.03), sides=32)
    tb('slew-teeth', 1.03, 0.07, MAT_STEEL, root, (0, 0, 1.06), sides=32)

    for side, sx in (('l', -1), ('r', 1)):
        g = node(NODE_SLIDE, 'track-' + side, root, (sx * TRACK_X, 0, 0))
        track_belt('shoes-' + side, g, sx)
        # track frame box between the tumblers
        bx('frame', (0.46, WHEELBASE + 0.34, 0.44), MAT_DARK, g,
           (0, TRACK_Y, TUMBLER_R), bevel=0.03)
        bx('frame-guard', (0.62, WHEELBASE - 0.90, 0.20), MAT_DARK, g,
           (0, TRACK_Y, TUMBLER_R + 0.30), bevel=0.02)
        # lashing eyes on the frames [P8: "Verzurraugen an Raupentraegern"]
        for yy in (-1.55, 1.55):
            bx('lash-eye', (0.16, 0.26, 0.22), MAT_WORN, g,
               (sx * 0.30, TRACK_Y + yy, TUMBLER_R + 0.34), bevel=0.02)
        # drive sprocket aft, idler forward
        tb('sprocket', 0.40, 0.30, MAT_WORN, g,
           (-0.15, TRACK_Y - WHEELBASE / 2, TUMBLER_R), (0, math.pi / 2, 0), sides=20)
        for i in range(18):
            a = i * math.pi * 2 / 18
            bx('sprocket-tooth', (0.30, 0.11, 0.14), MAT_WORN, g,
               (0, TRACK_Y - WHEELBASE / 2 + math.cos(a) * 0.395,
                TUMBLER_R + math.sin(a) * 0.395), (a, 0, 0), bevel=0.012)
        tb('sprocket-hub', 0.20, 0.12, MAT_WORN, g,
           (0.15, TRACK_Y - WHEELBASE / 2, TUMBLER_R), (0, math.pi / 2, 0), sides=16)
        tb('idler', 0.40, 0.34, MAT_WORN, g,
           (-0.17, TRACK_Y + WHEELBASE / 2, TUMBLER_R), (0, math.pi / 2, 0), sides=20)
        # bottom rollers and the two carrier rollers on top
        for i in range(8):
            yy = TRACK_Y - WHEELBASE / 2 + 0.42 + i * (WHEELBASE - 0.84) / 7
            tb('roller', 0.155, 0.30, MAT_WORN, g, (-0.15, yy, 0.155),
               (0, math.pi / 2, 0), sides=12)
        for yy in (TRACK_Y - 1.10, TRACK_Y + 1.10):
            tb('carrier-roller', 0.115, 0.24, MAT_WORN, g,
               (-0.12, yy, 2 * TUMBLER_R - 0.115), (0, math.pi / 2, 0), sides=10)
        # track tensioner grease cylinder, forward of the idler
        tb('tensioner', 0.09, 0.55, MAT_WORN, g,
           (0, TRACK_Y + WHEELBASE / 2 - 0.55, TUMBLER_R + 0.02),
           (-math.pi / 2, 0, 0), sides=10)
        weld(g, 'track-' + side)


# ═══════════════════════════════════════════════════════════════════════════
#  UPPER CARRIAGE
# ═══════════════════════════════════════════════════════════════════════════

def build_cab(slew):
    """Comfort cab, FOPS roof grate, sliding door with a sliding window in it,
    wash-wipe on roof AND front glass [P8][P3]. The cover render [P1] shows
    the glazing carried right down to the floor at the front — a leader-rig
    driver spends the shift looking UP the mast and DOWN at the pile, so the
    front is one tall pane split by a single transom, and there is a separate
    footwell window below the dash."""
    w, y0, y1 = 1.08, CAB_Y0, CAB_Y1
    x0 = -UPPER_W / 2                     # cab outboard face, left side
    cx = x0 + w / 2
    z0, z1 = DECK_Z + 0.02, CAB_ROOF
    cy = (y0 + y1) / 2
    d = y1 - y0
    h = z1 - z0

    bx('cab-floor', (w, d, 0.10), MAT_DARK, slew, (cx, cy, z0 + 0.05), bevel=0.02)
    bx('cab-roof', (w + 0.06, d + 0.04, 0.10), MAT_PAINT, slew,
       (cx, cy, z1 - 0.05), bevel=0.03)
    # corner posts and the pillar between door and rear quarter
    for px, py in ((x0 + 0.05, y0 + 0.05), (x0 + 0.05, y1 - 0.05),
                   (x0 + w - 0.05, y0 + 0.05), (x0 + w - 0.05, y1 - 0.05)):
        bx('cab-post', (0.10, 0.10, h), MAT_PAINT, slew, (px, py, (z0 + z1) / 2),
           bevel=0.012)
    bx('cab-pillar', (0.09, 0.09, h), MAT_PAINT, slew,
       (x0 + 0.05, cy + 0.34, (z0 + z1) / 2), bevel=0.012)
    bx('cab-transom', (w, 0.07, 0.09), MAT_PAINT, slew,
       (cx, y1 - 0.04, z0 + 0.72), bevel=0.012)
    bx('cab-rear', (w - 0.08, 0.07, h - 0.20), MAT_PAINT, slew,
       (cx, y0 + 0.04, (z0 + z1) / 2), bevel=0.012)
    # kick plate under the door and the sill the glazing sits on
    bx('cab-kick', (0.05, d - 0.16, 0.30), MAT_PAINT, slew,
       (x0 + 0.03, cy, z0 + 0.15), bevel=0.01)
    bx('cab-sill', (w, 0.08, 0.09), MAT_PAINT, slew,
       (cx, y1 - 0.04, z0 + 0.26), bevel=0.01)
    bx('cab-inboard', (0.07, d - 0.14, h - 0.16), MAT_PAINT, slew,
       (x0 + w - 0.035, cy, (z0 + z1) / 2), bevel=0.012)
    # glazing — MAT_GLASS is a NAME. Never transmission > 0: measured at
    # +65..81 draw calls because it re-renders the whole opaque list.
    bx('glass-front-upper', (w - 0.14, 0.03, h - 0.90), MAT_GLASS, slew,
       (cx, y1 - 0.045, z0 + 0.78 + (h - 0.90) / 2), bevel=0.0)
    # The footwell pane: on a leader rig the driver looks DOWN at the pile
    # butt as often as up the mast, so the front glazing runs to the floor.
    bx('glass-front-lower', (w - 0.14, 0.03, 0.36), MAT_GLASS, slew,
       (cx, y1 - 0.045, z0 + 0.50), bevel=0.0)
    bx('glass-front-foot', (w - 0.20, 0.03, 0.30), MAT_GLASS, slew,
       (cx, y1 - 0.18, z0 + 0.18), (0.55, 0, 0), bevel=0.0)
    # cab interior — a hollow glasshouse reads as a hollow glasshouse
    bx('seat-base', (0.46, 0.44, 0.14), MAT_DARK, slew,
       (cx - 0.06, cy - 0.10, z0 + 0.52), bevel=0.02)
    bx('seat-back', (0.44, 0.13, 0.62), MAT_DARK, slew,
       (cx - 0.06, cy - 0.32, z0 + 0.88), (-0.16, 0, 0), bevel=0.02)
    bx('seat-pillar', (0.14, 0.14, 0.42), MAT_STEEL, slew,
       (cx - 0.06, cy - 0.10, z0 + 0.24), bevel=0.01)
    for sx2 in (-0.30, 0.30):
        bx('console', (0.20, 0.40, 0.26), MAT_DARK, slew,
           (cx + sx2, cy + 0.08, z0 + 0.62), bevel=0.02)
        tb('joystick', 0.028, 0.20, MAT_DARK, slew,
           (cx + sx2, cy + 0.14, z0 + 0.74), sides=6)
    bx('screen', (0.05, 0.26, 0.20), MAT_GLASS, slew,
       (cx + 0.34, cy + 0.44, z0 + 1.06), (0, 0, 0.35), bevel=0.0)
    bx('glass-door', (0.03, 0.62, h - 0.42), MAT_GLASS, slew,
       (x0 + 0.04, cy + 0.02, z0 + 0.28 + (h - 0.42) / 2), bevel=0.0)
    bx('glass-quarter', (0.03, 0.52, h - 0.55), MAT_GLASS, slew,
       (x0 + 0.04, y0 + 0.36, z0 + 0.42 + (h - 0.55) / 2), bevel=0.0)
    bx('glass-rear', (w - 0.20, 0.03, 0.70), MAT_GLASS, slew,
       (cx, y0 + 0.045, z1 - 0.52), bevel=0.0)
    bx('glass-roof', (w - 0.26, 0.68, 0.03), MAT_GLASS, slew,
       (cx, y1 - 0.42, z1 - 0.10), bevel=0.0)
    # sliding door: rail, handle, and the sliding window frame inside it
    bx('door-rail', (0.05, d - 0.20, 0.06), MAT_STEEL, slew,
       (x0 - 0.005, cy, z0 + 0.22), bevel=0.01)
    bx('door-rail-top', (0.05, d - 0.20, 0.05), MAT_STEEL, slew,
       (x0 - 0.005, cy, z1 - 0.16), bevel=0.01)
    bx('door-handle', (0.06, 0.22, 0.05), MAT_STEEL, slew,
       (x0 - 0.03, cy - 0.28, z0 + 0.98), bevel=0.01)
    bx('door-slider', (0.02, 0.30, 0.44), MAT_STEEL, slew,
       (x0 + 0.015, cy + 0.18, z0 + 1.05), bevel=0.006)
    # FOPS roof grate — bars over the roof glazing, a hard requirement on a
    # machine that works under a hammer 20 m up [P8]
    for i in range(9):
        bx('fops-bar', (w - 0.10, 0.045, 0.045), MAT_STEEL, slew,
           (cx, y1 - 0.10 - i * 0.09, z1 + 0.05), bevel=0.008)
    for sx in (-0.42, 0.42):
        bx('fops-rail', (0.05, 0.86, 0.05), MAT_STEEL, slew,
           (cx + sx * (w / 2 - 0.06) * 2 * 0.5, y1 - 0.46, z1 + 0.05), bevel=0.008)
    # wash-wipe: one arm on the front glass, one on the roof glass [P8]
    bx('wiper-front', (0.04, 0.05, 0.80), MAT_DARK, slew,
       (cx - 0.16, y1 - 0.09, z0 + 1.15), (0.18, 0, 0), bevel=0.008)
    bx('wiper-roof', (0.04, 0.62, 0.05), MAT_DARK, slew,
       (cx + 0.14, y1 - 0.42, z1 - 0.13), bevel=0.008)
    bx('mirror-arm', (0.30, 0.04, 0.04), MAT_DARK, slew,
       (x0 - 0.16, y1 - 0.16, z1 - 0.14), bevel=0.006)
    bx('mirror', (0.05, 0.14, 0.22), MAT_GLASS, slew,
       (x0 - 0.30, y1 - 0.16, z1 - 0.22), bevel=0.0)
    # amber beacon and the reversing camera [P8] — both standard kit
    tb('beacon-base', 0.055, 0.09, MAT_DARK, slew,
       (cx + 0.30, y0 + 0.30, z1 + 0.10), sides=10)
    tb('beacon', 0.055, 0.13, MAT_HAZARD, slew,
       (cx + 0.30, y0 + 0.30, z1 + 0.18), sides=10)
    # step and grab handle beside the door
    bx('cab-step', (0.34, 0.26, 0.05), MAT_STEEL, slew,
       (x0 + 0.10, y1 - 0.42, DECK_Z - 0.30), bevel=0.01)
    tb('grab-handle', 0.022, 0.90, MAT_STEEL, slew,
       (x0 - 0.02, y1 - 0.14, z0 + 0.35), sides=8)


def build_house(slew):
    """Machinery house and the service deck on its roof.

    The roof of the upper structure is a walkable level with folding safety
    rails around it [P2 item 4 "Absturzsicherung am Oberwagen"], reached by a
    ladder up the left side [P8]. The side panels are upward-folding service
    doors [P3][P8], which is why the panel breaks are horizontal and each
    panel carries a gas strut and a pair of hinges at its TOP edge.
    """
    y0, y1 = HOUSE_Y0, HOUSE_Y1
    d = y1 - y0
    cy = (y0 + y1) / 2
    z0, z1 = DECK_Z + 0.08, HOUSE_TOP

    # deck plate — runs the length of the upper carriage
    bx('deck-plate', (UPPER_W, FRONT_Y - HOUSE_Y0 + 0.20, 0.16), MAT_DARK, slew,
       (0, (FRONT_Y + HOUSE_Y0) / 2 - 0.10, DECK_Z - 0.08), bevel=0.02)
    bx('deck-front-beam', (UPPER_W, 0.40, 0.55), MAT_DARK, slew,
       (0, FRONT_Y - 0.20, DECK_Z + 0.10), bevel=0.03)
    bx('deck-front-hazard', (UPPER_W, 0.05, 0.16), MAT_HAZARD, slew,
       (0, FRONT_Y + 0.01, DECK_Z + 0.26), bevel=0.006)
    # frame ribs under the deck, where the slew ring loads spread out
    for yy in (-2.60, -1.60, -0.60, 0.40, 1.40):
        bx('deck-rib', (UPPER_W - 0.20, 0.14, 0.22), MAT_DARK, slew,
           (0, yy, DECK_Z - 0.24), bevel=0.014)
    # bolted flange rows down both frame edges
    for sx2 in (-1, 1):
        for i in range(14):
            tb('deck-bolt', 0.020, 0.04, MAT_WORN, slew,
               (sx2 * (UPPER_W / 2 - 0.03), FRONT_Y - 0.35 - i * 0.38,
                DECK_Z - 0.06), (0, math.pi / 2 * sx2, 0), sides=6)

    # house shell
    bx('house', (UPPER_W, d, z1 - z0), MAT_PAINT, slew, (0, cy, (z0 + z1) / 2),
       bevel=0.035)
    # upward-folding service doors: three per side, hinged along the top
    for sx in (-1, 1):
        for i, (yc, dy) in enumerate(((y0 + 0.62, 1.10), (y0 + 1.80, 1.10),
                                      (y0 + 2.00, 0.0))):
            if dy <= 0:
                continue
            bx('service-door', (0.05, dy, 1.16), MAT_PAINT, slew,
               (sx * (UPPER_W / 2 + 0.012), yc, z0 + 0.66), bevel=0.014)
            bx('door-hinge', (0.09, dy - 0.16, 0.07), MAT_DARK, slew,
               (sx * (UPPER_W / 2 + 0.03), yc, z0 + 1.26), bevel=0.01)
            bx('door-latch', (0.06, 0.10, 0.10), MAT_STEEL, slew,
               (sx * (UPPER_W / 2 + 0.035), yc, z0 + 0.16), bevel=0.008)
    # engine air intake and cooler grille, right side aft [P9: 85 kW oil
    # cooler, 600 l diesel / 620 l hydraulic tanks live in this box]
    bx('cooler-frame', (0.06, 1.30, 0.90), MAT_DARK, slew,
       (UPPER_W / 2 + 0.02, y0 + 0.78, z0 + 0.95), bevel=0.012)
    for i in range(11):
        bx('cooler-louvre', (0.05, 1.22, 0.045), MAT_DARK, slew,
           (UPPER_W / 2 + 0.05, y0 + 0.78, z0 + 0.56 + i * 0.075),
           (0.35, 0, 0), bevel=0.006)
    bx('exhaust-stack', (0.20, 0.20, 0.62), MAT_WORN, slew,
       (UPPER_W / 2 - 0.42, y0 + 0.55, z1 + 0.28), bevel=0.02)
    tb('exhaust-tip', 0.075, 0.30, MAT_WORN, slew,
       (UPPER_W / 2 - 0.42, y0 + 0.55, z1 + 0.56), sides=10)
    # fuel and hydraulic fillers, left side, at deck level
    for i, yy in enumerate((y0 + 0.50, y0 + 0.95)):
        tb('filler', 0.10, 0.10, MAT_STEEL, slew,
           (-UPPER_W / 2 - 0.10, yy, z0 + 0.16), (0, math.pi / 2, 0), sides=10)

    # ── service deck on the roof, with folding rails ────────────────────
    bx('roof-deck', (UPPER_W - 0.06, d - 0.06, 0.05), MAT_STEEL, slew,
       (0, cy, z1 + 0.03), bevel=0.01)
    # grating slats via ARRAY: one bar, 24 copies, applied.
    slat = cube('roof-grate', (UPPER_W - 0.16, 0.045, 0.035), MAT_STEEL, slew,
                (0, y0 + 0.14, z1 + 0.07), bevel=0.006)
    am = slat.modifiers.new('arr', 'ARRAY')
    am.count = 24
    am.use_relative_offset = False
    am.use_constant_offset = True
    am.constant_offset_displace = (0, (d - 0.28) / 23.0, 0)
    bake(slat)
    rail_pts = [(-UPPER_W / 2 + 0.10, y0 + 0.10), (-UPPER_W / 2 + 0.10, y1 - 0.10),
                (UPPER_W / 2 - 0.10, y1 - 0.10), (UPPER_W / 2 - 0.10, y0 + 0.10)]
    handrail(slew, rail_pts, z1 + 0.05, 1.05, closed=True)
    # toe boards under the rails
    for sx in (-1, 1):
        bx('toe-board', (0.04, d - 0.20, 0.15), MAT_HAZARD, slew,
           (sx * (UPPER_W / 2 - 0.10), cy, z1 + 0.13), bevel=0.008)
    bx('toe-board-rear', (UPPER_W - 0.20, 0.04, 0.15), MAT_HAZARD, slew,
       (0, y0 + 0.10, z1 + 0.13), bevel=0.008)

    # ── catwalk beside the cab [P8] ─────────────────────────────────────
    # A grated walk outboard of the cab door, which is the only way to reach
    # the door at all — the deck is 1.2 m up and the cab hangs over the frame.
    cwx = -UPPER_W / 2 - 0.30
    bx('catwalk', (0.62, 2.55, 0.05), MAT_STEEL, slew,
       (cwx, CAB_Y1 - 1.05, DECK_Z + 0.02), bevel=0.01)
    for i in range(12):
        bx('catwalk-slat', (0.56, 0.05, 0.035), MAT_STEEL, slew,
           (cwx, CAB_Y1 - 2.20 + i * 0.21, DECK_Z + 0.06), bevel=0.005)
    bx('catwalk-toe', (0.05, 2.55, 0.14), MAT_HAZARD, slew,
       (cwx - 0.30, CAB_Y1 - 1.05, DECK_Z + 0.10), bevel=0.006)
    handrail(slew, [(cwx - 0.28, CAB_Y1 - 2.28), (cwx - 0.28, CAB_Y1 + 0.18)],
             DECK_Z + 0.04, 1.05)

    # ── access ladder to the upper carriage [P8] ────────────────────────
    lz0, lz1 = 0.55, z1 + 0.10
    lx = -UPPER_W / 2 - 0.06
    ly = y1 + 0.55
    for sy in (-0.24, 0.24):
        bx('ladder-stringer', (0.06, 0.09, lz1 - lz0), MAT_PAINT, slew,
           (lx, ly + sy, (lz0 + lz1) / 2), bevel=0.01)
    rung = cube('ladder-rung', (0.05, 0.44, 0.035), MAT_PAINT, slew,
                (lx - 0.03, ly, lz0 + 0.14), bevel=0.006)
    rm = rung.modifiers.new('arr', 'ARRAY')
    rm.count = 9
    rm.use_relative_offset = False
    rm.use_constant_offset = True
    rm.constant_offset_displace = (0, 0, (lz1 - lz0 - 0.28) / 8.0)
    bake(rung)
    handrail(slew, [(lx, ly - 0.24), (lx, ly + 0.24)], z1 + 0.05, 1.05)

    # ── counterweight: separate stackable slabs, not one block ──────────
    # 2 x 1.8 t + 4.9 t, "variably stackable" [P3][P8]. The console they hang
    # on is a separate item in the weight table [P10], so it is separate here.
    bx('cw-console', (UPPER_W - 0.20, 0.34, 1.62), MAT_DARK, slew,
       (0, HOUSE_Y0 - 0.17, DECK_Z + 0.75), bevel=0.03)
    slab_d = CW_Y1 - CW_Y0
    for i, (zc, th) in enumerate(((CW_Z0 + 0.24, 0.46), (CW_Z0 + 0.62, 0.30),
                                  (CW_Z0 + 0.94, 0.30))):
        bx('cw-slab', (2.62, slab_d, th), MAT_DARK, slew,
           (0, (CW_Y0 + CW_Y1) / 2, zc), bevel=0.025)
        # lifting lugs, one pair per slab: they are lifted off individually
        for sx in (-0.85, 0.85):
            bx('cw-lug', (0.11, 0.20, 0.16), MAT_WORN, slew,
               (sx, CW_Y0 + 0.16, zc + th / 2 + 0.05), bevel=0.012)
    for zz in (CW_Z0 + 0.08, CW_Z1 - 0.06):
        bx('cw-hazard', (2.66, 0.05, 0.16), MAT_HAZARD, slew,
           (0, CW_Y0 - 0.02, zz), bevel=0.006)
    # reversing camera [P8], where it can see behind the counterweight
    bx('rev-camera', (0.14, 0.12, 0.12), MAT_DARK, slew,
       (0, CW_Y0 - 0.10, CW_Z1 + 0.16), bevel=0.012)
    bx('rev-camera-lens', (0.07, 0.03, 0.07), MAT_GLASS, slew,
       (0, CW_Y0 - 0.17, CW_Z1 + 0.16), bevel=0.0)
    # tie-down and lifting points on the console
    for sx2 in (-1.10, 1.10):
        bx('lash-eye', (0.09, 0.20, 0.24), MAT_WORN, slew,
           (sx2, HOUSE_Y0 - 0.20, DECK_Z + 0.32), bevel=0.012)

    # ── rear support unit [P2 item 3] ───────────────────────────────────
    # Both jacks on ONE slide node: they are a single hydraulic function and
    # two nodes would triple the draw calls for no visible gain.
    g = node(NODE_SLIDE, 'rear-support', slew, (0, HOUSE_Y0 - 0.55, 0))
    bx('jack-beam', (2.60, 0.34, 0.36), MAT_PAINT, g, (0, 0.12, DECK_Z + 0.10),
       bevel=0.02)
    # the arms back to the upper-carriage frame — without them the jacks read
    # as two chrome rods hanging in space behind the counterweight
    for sx in (-1.05, 1.05):
        bx('jack-arm', (0.26, 0.95, 0.30), MAT_PAINT, g,
           (sx, 0.52, DECK_Z + 0.06), bevel=0.02)
        bx('jack-knee', (0.22, 0.30, 0.62), MAT_PAINT, g,
           (sx, 0.14, DECK_Z - 0.22), bevel=0.02)
    for sx in (-1.05, 1.05):
        bx('jack-body', (0.34, 0.34, 0.78), MAT_PAINT, g,
           (sx, 0, DECK_Z - 0.34), bevel=0.02)
        tb('jack-rod', 0.075, 0.62, MAT_CHROME, g, (sx, 0, 0.18), sides=12)
        tb('jack-pad', 0.30, 0.09, MAT_WORN, g, (sx, 0, 0.06), sides=16)
        bx('jack-hazard', (0.36, 0.05, 0.14), MAT_HAZARD, g,
           (sx, -0.18, DECK_Z - 0.02), bevel=0.006)
    weld(g, 'rear-support')

    # data plate — the game stamps the marque on this, not a maker's wordmark
    node(NODE_MOUNT, 'plate', slew, (-UPPER_W / 2 - 0.02, HOUSE_Y1 - 0.35,
                                     DECK_Z + 1.55), (0, math.pi / 2, 0))


def handrail(parent, pts, z, h, closed=False, mat=MAT_STEEL):
    """Tubular rail: posts at the corners plus intermediates, a top rail and a
    knee rail. The upper deck rails are the most-seen small detail on this
    machine in the cover render [P1] and they fold down for transport."""
    n = len(pts)
    segs = list(range(n)) if closed else list(range(n - 1))
    for i in segs:
        a = pts[i]
        b = pts[(i + 1) % n]
        dx, dy = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(dx, dy)
        if ln < 1e-4:
            continue
        k = max(1, int(round(ln / 0.85)))
        for j in range(k + 1):
            t = j / k
            tb('rail-post', 0.024, h, mat, parent,
               (a[0] + dx * t, a[1] + dy * t, z), sides=8)
        ang = math.atan2(dy, dx)
        for zz in (h, h * 0.52):
            tb('rail-run', 0.022, ln, mat, parent,
               (a[0], a[1], z + zz), (0, math.pi / 2, ang), sides=8)


# ═══════════════════════════════════════════════════════════════════════════
#  WINCHES
# ═══════════════════════════════════════════════════════════════════════════

def build_winches(slew):
    """Two winches, visible on the upper carriage, working synchronised:
    main/hammer 133 kN and pile 80 kN [P4][P2 items 5,6]. Drum diameters are
    DERIVED from the line pulls (no drum data on the sheet)."""
    out = {}
    for name, sx, r, w in (('main', 0.62, 0.32, 0.72), ('pile', -0.62, 0.27, 0.60)):
        g = node(NODE_PIVOT, 'winch-' + name, slew, (sx, WINCH_Y, WINCH_Z),
                 (0, math.pi / 2, 0))
        tb('drum', r, w, MAT_CAST, g, (0, 0, -w / 2), sides=20)
        for zz in (-w / 2, w / 2 - 0.05):
            tb('flange', r + 0.09, 0.05, MAT_CAST, g, (0, 0, zz), sides=20)
        # rope already spooled on the drum: a helix of turns, one material
        for i in range(9):
            tb('lay', r + 0.021, 0.062, MAT_WORN, g,
               (0, 0, -w / 2 + 0.09 + i * 0.062), sides=14)
        weld(g, 'winch-' + name)
        # fixed housing beside the drum
        bx('winch-frame', (0.24, 0.62, 0.62), MAT_PAINT, slew,
           (sx + (0.52 if sx > 0 else -0.52), WINCH_Y, WINCH_Z - 0.06), bevel=0.02)
        tb('winch-motor', 0.16, 0.34, MAT_CAST, slew,
           (sx + (0.72 if sx > 0 else -0.72), WINCH_Y, WINCH_Z),
           (0, math.pi / 2 * (1 if sx > 0 else -1), 0), sides=12)
        out[name] = g
    # the guard hood over both drums
    bx('winch-hood', (2.10, 0.90, 0.14), MAT_PAINT, slew,
       (0, WINCH_Y, WINCH_Z + 0.46), bevel=0.02)
    return out


# ═══════════════════════════════════════════════════════════════════════════
#  KINEMATICS  (four-bar, high pivot, mast held plumb)
# ═══════════════════════════════════════════════════════════════════════════

def build_kinematics(slew):
    """[P3][P8] "Parallelogrammkinematik", high mast pivot point, minimised
    change of centre of gravity, outreach to 5.70 m piling / 6.00 m DTH.

    Read off the p.4 elevation [M4]: a tall rear column and a short front link
    both footed on the front of the upper carriage, carrying a triangular
    gusset that holds the mast guide. The pair keeps the guide bore plumb
    through the whole outreach sweep, which is the entire point of the layout.

    The links are separate pivot: nodes so the game can sweep them; the guide
    frame is its own pivot: node because the mast also rakes on it
    (18.5 fwd / 45 back / 18.5 side [P4]) and rake is a different DOF from
    outreach.
    """
    XO = 0.66                       # the linkage is a pair, one each side

    # foot brackets on the deck, static under the slew
    for sx in (-XO, XO):
        bx('kin-foot-rear', (0.30, 0.52, 0.52), MAT_PAINT, slew,
           (sx, KIN_REAR_FOOT[0], KIN_REAR_FOOT[1] - 0.10), bevel=0.02)
        bx('kin-foot-front', (0.26, 0.44, 0.46), MAT_PAINT, slew,
           (sx, KIN_FRONT_FOOT[0], KIN_FRONT_FOOT[1] - 0.10), bevel=0.02)
        tb('kin-pin-rear', 0.09, 0.42, MAT_CHROME, slew,
           (sx - 0.21, KIN_REAR_FOOT[0], KIN_REAR_FOOT[1]),
           (0, math.pi / 2, 0), sides=12)
        tb('kin-pin-front', 0.08, 0.36, MAT_CHROME, slew,
           (sx - 0.18, KIN_FRONT_FOOT[0], KIN_FRONT_FOOT[1]),
           (0, math.pi / 2, 0), sides=12)

    # ── rear column: the long link, 4.4 m ───────────────────────────────
    rear = node(NODE_PIVOT, 'kin-rear', slew,
                (0, KIN_REAR_FOOT[0], KIN_REAR_FOOT[1]))
    dy = KIN_REAR_TOP[0] - KIN_REAR_FOOT[0]
    dz = KIN_REAR_TOP[1] - KIN_REAR_FOOT[1]
    ln = math.hypot(dy, dz)
    ang = math.atan2(dz, dy) - math.pi / 2
    for sx in (-XO, XO):
        o = bx('column', (0.26, 0.40, ln), MAT_PAINT, rear, (0, 0, 0), bevel=0.03)
        o.location = (sx, dy / 2, dz / 2)
        o.rotation_euler = (ang, 0, 0)
        # boss at each end
        for f in (0.0, 1.0):
            tb('column-boss', 0.15, 0.34, MAT_PAINT, rear,
               (sx - 0.17, dy * f, dz * f), (0, math.pi / 2, 0), sides=14)
    # lateral bracing between the two columns
    for f in (0.34, 0.70):
        bx('column-brace', (XO * 2, 0.22, 0.20), MAT_PAINT, rear,
           (0, dy * f, dz * f), bevel=0.02)
    weld(rear, 'kin-rear')

    # ── front link: the short one ───────────────────────────────────────
    front = node(NODE_PIVOT, 'kin-front', slew,
                 (0, KIN_FRONT_FOOT[0], KIN_FRONT_FOOT[1]))
    dy2 = KIN_FRONT_TOP[0] - KIN_FRONT_FOOT[0]
    dz2 = KIN_FRONT_TOP[1] - KIN_FRONT_FOOT[1]
    ln2 = math.hypot(dy2, dz2)
    ang2 = math.atan2(dz2, dy2) - math.pi / 2
    for sx in (-XO, XO):
        o = bx('link', (0.22, 0.34, ln2), MAT_PAINT, front, (0, 0, 0), bevel=0.03)
        o.location = (sx, dy2 / 2, dz2 / 2)
        o.rotation_euler = (ang2, 0, 0)
        for f in (0.0, 1.0):
            tb('link-boss', 0.13, 0.30, MAT_PAINT, front,
               (sx - 0.15, dy2 * f, dz2 * f), (0, math.pi / 2, 0), sides=14)
    bx('link-brace', (XO * 2, 0.20, 0.18), MAT_PAINT, front,
       (0, dy2 * 0.55, dz2 * 0.55), bevel=0.02)
    weld(front, 'kin-front')

    # ── outreach ram, deck to gusset ────────────────────────────────────
    ram = node(NODE_PIVOT, 'kin-ram', slew, (0, 1.35, 1.65))
    ra, rb = (0.0, 0.0), (0.62, 2.55)
    for sx in (-0.30, 0.30):
        o = bx('ram-barrel', (0.20, 0.20, 1.75), MAT_PAINT, ram, bevel=0.02)
        rl = math.hypot(rb[0], rb[1])
        rang = math.atan2(rb[1], rb[0]) - math.pi / 2
        o.location = (sx, rb[0] * 0.32, rb[1] * 0.32)
        o.rotation_euler = (rang, 0, 0)
        r2 = bx('ram-rod', (0.11, 0.11, 1.30), MAT_CHROME, ram, bevel=0.012)
        r2.location = (sx, rb[0] * 0.80, rb[1] * 0.80)
        r2.rotation_euler = (rang, 0, 0)
    weld(ram, 'kin-ram')
    return rear, front


def build_guide(slew):
    """The mast guide (Maeklerfuehrung) [P2 item 12] and the gusset that
    carries it. This is the body the mast SLIDES through — 7 m of vertical
    travel, underfloor work possible [P3][P4] — and the body the mast rakes
    on. Everything above it hangs off this node."""
    g = node(NODE_PIVOT, 'mast-carrier', slew, (0, 0, 0))

    # The carrier: a triangulated frame between the two link-head pins and the
    # guide bore, not a pair of solid plates. Pin centres are the vertices, so
    # the structure is where the loads are.
    A = KIN_REAR_TOP                       # rear column head pin  (1.25, 5.65)
    B = KIN_FRONT_TOP                      # front link head pin   (2.15, 3.75)
    C = (MAST_Y - MAST_D / 2 - 0.14, GUIDE_Z1 - 0.12)     # bore top rear
    D = (MAST_Y - MAST_D / 2 - 0.14, GUIDE_Z0 + 0.14)     # bore bottom rear
    for sx in (-0.62, 0.62):
        member('carrier-top', g, A, C, sx, 0.13, 0.30, ext=0.24)
        member('carrier-diag', g, A, B, sx, 0.13, 0.34, ext=0.24)
        member('carrier-front', g, B, D, sx, 0.12, 0.28, ext=0.22)
        member('carrier-spine', g, D, C, sx, 0.14, 0.30, ext=0.24)
        member('carrier-web', g, A, D, sx, 0.09, 0.18, ext=0.10)
        # the two pin bosses the links actually turn on
        tb('carrier-boss-a', 0.17, 0.32, MAT_PAINT, g,
           (sx - 0.16, A[0], A[1]), (0, math.pi / 2, 0), sides=14)
        tb('carrier-boss-b', 0.15, 0.30, MAT_PAINT, g,
           (sx - 0.15, B[0], B[1]), (0, math.pi / 2, 0), sides=14)
        tb('carrier-pin-a', 0.085, 0.42, MAT_CHROME, g,
           (sx - 0.21, A[0], A[1]), (0, math.pi / 2, 0), sides=12)
        tb('carrier-pin-b', 0.075, 0.38, MAT_CHROME, g,
           (sx - 0.19, B[0], B[1]), (0, math.pi / 2, 0), sides=12)
    # cross ties between the two frames
    for yy, zz in ((A[0] + 0.10, A[1] - 0.05), ((B[0] + D[0]) / 2, B[1] - 0.10),
                   (C[0] + 0.06, C[1] - 0.30)):
        bx('carrier-tie', (1.34, 0.20, 0.22), MAT_PAINT, g, (0, yy, zz), bevel=0.02)

    # the guide bore itself: a yellow collar box wrapping the mast section,
    # open front and back so the mast can pass right through it
    bore_h = GUIDE_Z1 - GUIDE_Z0
    for sx in (-1, 1):
        bx('guide-cheek', (0.20, MAST_D + 0.34, bore_h), MAT_PAINT, g,
           (sx * (MAST_W / 2 + 0.12), MAST_Y, (GUIDE_Z0 + GUIDE_Z1) / 2), bevel=0.025)
    for zz in (GUIDE_Z0 + 0.14, GUIDE_Z1 - 0.14):
        bx('guide-tie', (MAST_W + 0.46, 0.22, 0.28), MAT_PAINT, g,
           (0, MAST_Y - MAST_D / 2 - 0.15, zz), bevel=0.02)
    # bronze slide pads inside the bore — the wear parts
    for sx in (-1, 1):
        for zz in (GUIDE_Z0 + 0.30, GUIDE_Z1 - 0.30):
            bx('guide-pad', (0.06, MAST_D + 0.02, 0.34), MAT_WORN, g,
               (sx * (MAST_W / 2 + 0.03), MAST_Y, zz), bevel=0.008)
    # inclination sensor box + the rake ram that sets 18.5/45 deg [P4]
    bx('rake-ram-barrel', (0.20, 1.35, 0.20), MAT_PAINT, g,
       (0, 1.85, 2.55), (0.36, 0, 0), bevel=0.02)
    bx('rake-ram-rod', (0.11, 1.05, 0.11), MAT_CHROME, g,
       (0, 2.68, 2.86), (0.36, 0, 0), bevel=0.012)
    bx('sensor-box', (0.22, 0.18, 0.26), MAT_DARK, g,
       (-0.58, 2.62, 5.55), bevel=0.012)
    # Mast slide drive: the 7 m of vertical travel [P3][P4] has to come from
    # somewhere, and on the real machine it is a drive on the guide working a
    # rack up the mast. Modelled where the rack runs, at the guide.
    bx('slide-drive', (0.34, 0.44, 0.58), MAT_PAINT, g,
       (MAST_W / 2 + 0.30, MAST_Y - 0.10, GUIDE_Z1 - 0.75), bevel=0.025)
    tb('slide-pinion', 0.16, 0.20, MAT_WORN, g,
       (MAST_W / 2 + 0.22, MAST_Y - 0.10, GUIDE_Z1 - 0.75),
       (0, -math.pi / 2, 0), sides=14)
    tb('slide-motor', 0.12, 0.26, MAT_PAINT, g,
       (MAST_W / 2 + 0.46, MAST_Y - 0.10, GUIDE_Z1 - 0.75),
       (0, math.pi / 2, 0), sides=12)
    # bolt rows on the carrier ties — free triangles, and a bolted flange is
    # most of what says 'fabricated' rather than 'extruded'
    for sx in (-0.62, 0.62):
        for i in range(5):
            tb('carrier-bolt', 0.022, 0.05, MAT_WORN, g,
               (sx + 0.075, 2.40 + i * 0.10, GUIDE_Z0 + 0.20),
               (0, math.pi / 2, 0), sides=6)
    # a step and grab rail at the guide, for hands-on work at the pile head
    # MAT_WORN, not MAT_STEEL: rawSteel is not otherwise present in this
    # group, and one more material here is one more draw call for a step.
    bx('guide-step', (0.80, 0.34, 0.05), MAT_WORN, g,
       (0, MAST_Y + 0.55, GUIDE_Z0 - 1.15), bevel=0.008)
    handrail(g, [(-0.42, MAST_Y + 0.55), (0.42, MAST_Y + 0.55)],
             GUIDE_Z0 - 1.13, 0.95, mat=MAT_WORN)

    # ── lower mast extension with hydraulic support [P2 item 13] ────────
    # It reaches from the mast foot down to a bearing plate on the ground and
    # is what lets the machine push down a pile without lifting itself.
    foot = node(NODE_SLIDE, 'mast-foot', g, (0, MAST_Y, 0))
    bx('foot-leg', (MAST_W - 0.06, MAST_D - 0.04, 3.45), MAT_PAINT, foot,
       (0, 0, 1.90), bevel=0.025)
    bx('foot-collar', (MAST_W + 0.22, MAST_D + 0.20, 0.30), MAT_PAINT, foot,
       (0, 0, 3.40), bevel=0.02)
    tb('foot-rod', 0.10, 0.55, MAT_CHROME, foot, (0, 0, 0.14), sides=12)
    tb('foot-pad', 0.46, 0.12, MAT_WORN, foot, (0, 0, 0.02), sides=20)
    bx('foot-brace', (0.14, 1.45, 0.14), MAT_PAINT, foot,
       (0, -0.80, 2.30), (0.62, 0, 0), bevel=0.012)
    weld(foot, 'mast-foot')

    # ── pile guide / prismatic guide [P2 item 11 | P5 item 11] ──────────
    # Hydraulically tiltable arms, 508-1016 mm on the prismatic guide, and
    # clamping/breaking jaws 38-508 mm in DTH trim [P6]. Two arms that open.
    for side, sx in (('l', -1), ('r', 1)):
        a = node(NODE_PIVOT, 'pile-guide-' + side, g,
                 (0, MAST_Y + MAST_D / 2 + 0.10, GUIDE_Z0 - 0.55))
        bx('guide-arm', (0.18, 0.92, 0.34), MAT_DARK, a,
           (sx * 0.30, 0.50, 0), (0, 0, sx * 0.22), bevel=0.025)
        bx('guide-arm-web', (0.07, 0.66, 0.22), MAT_DARK, a,
           (sx * 0.44, 0.44, 0.16), (0, 0, sx * 0.22), bevel=0.012)
        # prismatic V-block: two faces at 45 deg, which is how one jaw holds
        # 508-1016 mm casing and a 350 mm pile without changing parts [P6]
        for f in (-1, 1):
            bx('guide-vee', (0.22, 0.30, 0.16), MAT_WORN, a,
               (sx * 0.50, 0.96, f * 0.11), (0, f * 0.62, 0), bevel=0.014)
        bx('guide-jaw-back', (0.24, 0.14, 0.42), MAT_WORN, a,
           (sx * 0.58, 1.02, 0), bevel=0.02)
        bx('guide-cyl', (0.12, 0.56, 0.12), MAT_CHROME, a,
           (sx * 0.18, 0.32, -0.18), bevel=0.01)
        bx('guide-cyl-eye', (0.16, 0.14, 0.16), MAT_DARK, a,
           (sx * 0.30, 0.60, -0.18), bevel=0.014)
        weld(a, 'pile-guide-' + side)
    bx('guide-yoke', (MAST_W + 0.50, 0.34, 0.42), MAT_DARK, g,
       (0, MAST_Y + MAST_D / 2 + 0.12, GUIDE_Z0 - 0.55), bevel=0.025)
    return g


# ═══════════════════════════════════════════════════════════════════════════
#  MAST
# ═══════════════════════════════════════════════════════════════════════════

def build_mast(carrier):
    """The mast, on a slide: node — this machine's signature is that the mast
    travels 7 m vertically through its guide rather than only raking [P3][P4].

    Section is NOT SOURCED (rm20-leader.md sec.10); the sheet's elevations are
    silhouettes. Modelled as a welded box with lightening cut-outs down the
    inboard face, guide rails for the carriage on the outboard face, and a
    cable drag chain up one flank — the arrangement the cover render [P1]
    shows. The cut-outs are made by leaving gaps between rails and cross
    strips rather than by boolean, which reads the same at play distance and
    costs a fraction of the geometry.
    """
    m = node(NODE_SLIDE, 'mast', carrier, (0, MAST_Y, 0))
    # THE HEADLINE FEATURE, and it declared no stroke.  [P4] dim B: "Max
    # cylinder stroke 7.0 m" — the mast is vertically displaceable by 7 m
    # through its guide collar, which is why dim A (max rig height 25.7 m) and
    # dim A1 (min 19.5 m) differ by 6.2 m and why the machine can work under
    # low headroom.  It is the reason this class exists and the source document
    # leads with it.
    m['travel_m'] = MAST_SLIDE                # 7.00 m  [P4] dim B
    m['axis'] = 'z'
    z0, z1 = MAST_Z0, MAST_Z0 + MAST_LEN
    hw, hd = MAST_W / 2, MAST_D / 2

    # four corner chords — the crisp edges that make it read as fabricated
    for sx in (-1, 1):
        for sy in (-1, 1):
            bx('chord', (0.13, 0.13, MAST_LEN), MAT_DARK, m,
               (sx * (hw - 0.065), sy * (hd - 0.065), (z0 + z1) / 2), bevel=0.014)
    # outboard face: solid plate + the two guide rails the carriage rides
    bx('mast-face-out', (MAST_W - 0.14, 0.05, MAST_LEN), MAT_DARK, m,
       (0, hd - 0.025, (z0 + z1) / 2), bevel=0.01)
    for sx in (-1, 1):
        bx('mast-rail', (0.10, 0.13, MAST_LEN), MAT_STEEL, m,
           (sx * (hw - 0.13), hd + 0.06, (z0 + z1) / 2), bevel=0.012)
    # side faces
    for sx in (-1, 1):
        bx('mast-web', (0.05, MAST_D - 0.14, MAST_LEN), MAT_DARK, m,
           (sx * (hw - 0.025), 0, (z0 + z1) / 2), bevel=0.01)
    # inboard face: vertical rails plus cross strips -> the lightening holes
    for sx in (-1, 1):
        bx('mast-face-in', (0.20, 0.05, MAST_LEN), MAT_DARK, m,
           (sx * (hw - 0.10), -hd + 0.025, (z0 + z1) / 2), bevel=0.01)
    bays = 13
    for i in range(bays + 1):
        zz = z0 + 0.30 + i * (MAST_LEN - 0.60) / bays
        bx('mast-strip', (MAST_W - 0.14, 0.05, 0.24), MAT_DARK, m,
           (0, -hd + 0.025, zz), bevel=0.01)
        # ring the cut-out so the hole has a rolled edge, not a razor lip
        bx('mast-ring-top', (MAST_W - 0.30, 0.09, 0.05), MAT_DARK, m,
           (0, -hd + 0.05, zz + 0.20), bevel=0.008)
        # a diaphragm every second bay: this is a box mast, and box masts are
        # stiffened internally where the guide loads come in
        if i % 2 == 0:
            bx('mast-diaphragm', (MAST_W - 0.16, MAST_D - 0.16, 0.05), MAT_DARK,
               m, (0, 0, zz), bevel=0.008)
        for sx in (-1, 1):
            bx('mast-web-rib', (0.06, MAST_D - 0.18, 0.10), MAT_DARK, m,
               (sx * (hw - 0.06), 0, zz + 0.36), bevel=0.006)
    # bolted splices: this mast ships in sections
    for f in (0.33, 0.66):
        zz = z0 + MAST_LEN * f
        bx('splice', (MAST_W + 0.09, MAST_D + 0.09, 0.20), MAT_DARK, m,
           (0, 0, zz), bevel=0.014)
        for sx in (-1, 1):
            for j in range(4):
                tb('splice-bolt', 0.021, 0.05, MAT_STEEL, m,
                   (sx * (hw + 0.02), -hd + 0.10 + j * (MAST_D - 0.20) / 3, zz),
                   (0, math.pi / 2, 0), sides=6)
    # cable drag chain up the left flank, feeding the travelling head
    links = 46
    for i in range(links):
        bx('drag-link', (0.11, 0.17, 0.20), MAT_DARK, m,
           (-hw - 0.08, -hd - 0.13, z0 + 0.4 + i * (MAST_LEN - 1.0) / links),
           bevel=0.012)
    bx('drag-track', (0.06, 0.30, MAST_LEN - 0.6), MAT_DARK, m,
       (-hw - 0.15, -hd - 0.13, (z0 + z1) / 2), bevel=0.01)
    # rack for the mast slide cylinder anchorage, outboard-inboard face
    for i in range(int(MAST_LEN / 0.55)):
        bx('rack-tooth', (0.09, 0.10, 0.20), MAT_STEEL, m,
           (hw + 0.03, -hd + 0.16, z0 + 0.35 + i * 0.55), bevel=0.008)
    # step rungs up the inboard face, for rope work at height
    for i in range(int((MAST_LEN - 1.6) / 0.42)):
        bx('mast-rung', (0.46, 0.05, 0.045), MAT_STEEL, m,
           (0, -hd - 0.16, z0 + 1.0 + i * 0.42), bevel=0.006)
    return m, z1


def build_head(mast, mast_top):
    """Mast head [P2 item 9]. Hydraulically foldable, with a patented damping
    system that absorbs the hammer forces to cut rope wear [P3]; in DTH trim
    it gains a pivotable auxiliary rope jib [P6]. So: it folds (its own
    pivot: node), it carries sheaves, and it carries visible dampers."""
    h = node(NODE_PIVOT, 'mast-head', mast, (0, 0, mast_top))
    hw, hd = MAST_W / 2, MAST_D / 2
    # the head frame: two side plates leaning out over the working line
    for sx in (-1, 1):
        bx('head-plate', (0.10, 1.55, 1.58), MAT_PAINT, h,
           (sx * (hw - 0.05), 0.30, 0.80), (0.30, 0, 0), bevel=0.02)
        bx('head-nose', (0.10, 0.90, 0.42), MAT_PAINT, h,
           (sx * (hw - 0.05), 1.02, 1.44), (0.55, 0, 0), bevel=0.02)
    bx('head-back', (MAST_W, 0.16, 1.30), MAT_PAINT, h,
       (0, -hd + 0.05, 0.70), bevel=0.02)
    # Cap top = MAST_HEAD_H exactly, so MAST_Z0 + MAST_LEN + MAST_HEAD_H is
    # the height that lands in the .glb: A = 25.70 m [P4], measured not hoped.
    bx('head-cap', (MAST_W + 0.10, 0.90, 0.16), MAT_PAINT, h,
       (0, 0.42, MAST_HEAD_H - 0.08), bevel=0.02)
    # Sheaves: main hammer line + pile line + auxiliary, on ONE cross shaft.
    # One pivot node for the block, not one per sheave: they share a shaft so
    # they share an axis, and three nodes would spend four extra draw calls
    # animating something no player can see turn separately.
    tb('head-shaft', 0.055, MAST_W + 0.16, MAT_CHROME, h,
       (-(MAST_W + 0.16) / 2, 0.92, 1.38), (0, math.pi / 2, 0), sides=12)
    sh = node(NODE_PIVOT, 'sheaves', h, (0, 0.92, 1.38), (0, math.pi / 2, 0))
    for sx in (-0.26, 0.0, 0.26):
        tb('sheave', 0.30, 0.11, MAT_CAST, sh, (0, 0, sx - 0.055), sides=20)
        tb('sheave-groove', 0.27, 0.13, MAT_WORN, sh, (0, 0, sx - 0.065), sides=20)
        tb('sheave-hub', 0.10, 0.15, MAT_CAST, sh, (0, 0, sx - 0.075), sides=12)
        for k in range(6):                        # web lightening holes
            a = k * math.pi / 3
            tb('sheave-web', 0.055, 0.13, MAT_CAST, sh,
               (math.cos(a) * 0.19, math.sin(a) * 0.19, sx - 0.065), sides=8)
    weld(sh, 'sheaves')
    # rope guards over the sheaves
    for sx in (-0.40, 0.40):
        bx('rope-guard', (0.06, 0.72, 0.10), MAT_STEEL, h,
           (sx, 0.92, 1.72), bevel=0.008)
    # damping system: two spring/damper units taking the hammer blow back into
    # the head instead of into the rope [P3]
    for sx in (-0.30, 0.30):
        bx('damper-body', (0.20, 0.22, 0.86), MAT_CAST, h,
           (sx, 0.20, 0.62), (0.22, 0, 0), bevel=0.02)
        tb('damper-rod', 0.05, 0.42, MAT_CHROME, h,
           (sx, 0.38, 1.02), (0.22, 0, 0), sides=10)
        for j in range(6):
            tb('damper-coil', 0.10, 0.035, MAT_WORN, h,
               (sx, 0.20 + j * 0.012, 0.24 + j * 0.055), sides=10)
    # fold cylinder — the head lies down for transport
    bx('fold-barrel', (0.16, 0.86, 0.16), MAT_PAINT, h,
       (0, -0.34, 0.34), (-0.50, 0, 0), bevel=0.014)
    bx('fold-rod', (0.09, 0.60, 0.09), MAT_CHROME, h,
       (0, 0.16, 0.72), (-0.50, 0, 0), bevel=0.008)
    # Auxiliary rope jib, pivotable, DTH trim [P6]. Exported STOWED — swung
    # down against the head — because A = 25.70 m is the stated max rig height
    # and a jib sticking up past it would put the machine over its own sheet.
    j = node(NODE_PIVOT, 'aux-jib', h, (0.44, 0.30, 0.95))
    bx('jib-arm', (0.13, 0.13, 1.10), MAT_PAINT, j, (0, 0.42, 0.06),
       (1.34, 0, 0), bevel=0.014)
    tb('jib-sheave', 0.13, 0.08, MAT_CAST, j, (-0.04, 0.98, 0.32),
       (0, math.pi / 2, 0), sides=14)
    weld(j, 'aux-jib')
    weld(h, 'mast-head')
    return h


# ═══════════════════════════════════════════════════════════════════════════
#  TRAVELLING HEAD  (hammer in piling trim / rotary head on a tiltable sledge)
# ═══════════════════════════════════════════════════════════════════════════

def build_carriage(mast):
    """The sledge that travels the mast, and what it carries.

    Piling trim [P2 item 10]: a hydraulic impact hammer on the hammer line.
    DTH trim [P5 item 10]: a rotary head on a TILTABLE sledge, 150 kNm
    admissible torque, 200 kN push / 200 kN pull [P7]. Both live on the same
    slide: node; the tilt is its own pivot: node so the game can lay the head
    out of the working line to handle a rod.
    """
    hd = MAST_D / 2
    # THE CARRIAGE CONTRACT.  All 22 named nodes on this machine shipped with
    # zero extras, this one included, so src/core/gltfRig.js makeDyn() set
    # carriageRange = [y, y] and carriageNoFlex = true: the hammer could not
    # travel the mast.  Worse, a carriage published without `travel_m` does not
    # throw — setCarriage() evaluates `-0 * undefined` and writes NaN into a
    # world matrix, and the machine silently vanishes.
    #
    # The stroke is SOLVED from this file's own geometry, not picked:
    #   top    = MAST_Z0 + MAST_LEN - 5.60 = 17.78, where the sledge is exported
    #   bottom = 4.00, the point at which the drive cap sits on grade.  The tool
    #            mount hangs (0.30 - 4.30) = 4.00 m below the carriage origin,
    #            through pivot:sledge-tilt and slide:hammer.
    # 13.78 m of hammer travel on a 19.48 m leader, and the 7 m sliding mast
    # (dim B) makes up the rest of the published dim E, "max pile length
    # 18.0 m" [P4] — 13.78 + 7.00 = 20.78 of combined reach against an 18.0 m
    # pile, which is the clearance a leader rig needs and not slack.
    CARR_TOP = MAST_Z0 + MAST_LEN - 5.60      # 17.78, the exported pose
    CARR_BOT = 4.00                           # drive cap on grade
    c = node(NODE_SLIDE, 'carriage', mast, (0, 0, CARR_TOP))
    c['travel_m'] = CARR_TOP - CARR_BOT       # 13.78 m
    c['axis'] = 'z'
    c['travel_min_m'] = CARR_BOT
    c['travel_max_m'] = CARR_TOP
    # guide shoes gripping the mast rails — this is what makes it a
    # mast-guided hammer and not one hanging on a rope
    for sz in (-1, 1):
        for sx in (-1, 1):
            bx('shoe', (0.26, 0.30, 0.34), MAT_DARK, c,
               (sx * (MAST_W / 2 - 0.13), hd + 0.06, sz * 1.30), bevel=0.02)
    bx('sledge-plate', (MAST_W + 0.28, 0.20, 2.90), MAT_DARK, c,
       (0, hd + 0.20, 0), bevel=0.025)
    bx('sledge-rib', (0.16, 0.55, 2.70), MAT_DARK, c, (0, hd + 0.48, 0), bevel=0.02)
    # crowd/pull cylinders each side of the sledge
    for sx in (-1, 1):
        bx('crowd-barrel', (0.17, 0.17, 1.35), MAT_PAINT, c,
           (sx * (MAST_W / 2 + 0.10), hd + 0.30, 0.72), bevel=0.014)
        tb('crowd-rod', 0.085, 1.00, MAT_CHROME, c,
           (sx * (MAST_W / 2 + 0.10), hd + 0.30, 1.38), sides=12)

    # ── tiltable sledge front, carrying the tool ────────────────────────
    t = node(NODE_PIVOT, 'sledge-tilt', c, (0, hd + 0.60, 0.30))
    off = PILE_Y - MAST_Y - hd - 0.60      # tool axis on the working line
    bx('tilt-frame', (0.90, off + 0.30, 0.34), MAT_PAINT, t,
       (0, off / 2, -0.55), bevel=0.02)
    bx('tilt-boss', (1.00, 0.26, 0.26), MAT_PAINT, t, (0, 0.08, 0.10), bevel=0.02)

    # the impact hammer on the line. Body proportions DERIVED from the p.2/p.4
    # elevation; ram masses for the 4/5/6 t hammer classes are NOT on the
    # sheet (rm20-leader.md sec.9), so nothing here states a mass.
    ham = node(NODE_SLIDE, 'hammer', t, (0, off, 0))
    bx('hammer-body', (0.74, 0.66, 3.55), MAT_PAINT, ham, (0, 0, -1.30), bevel=0.03)
    bx('hammer-cap', (0.80, 0.72, 0.34), MAT_DARK, ham, (0, 0, 0.55), bevel=0.025)
    bx('hammer-base', (0.86, 0.78, 0.52), MAT_DARK, ham, (0, 0, -3.20), bevel=0.025)
    for sx in (-1, 1):
        bx('hammer-rib', (0.09, 0.72, 3.10), MAT_DARK, ham,
           (sx * 0.40, 0, -1.30), bevel=0.014)
    for i in range(3):
        bx('hammer-window', (0.56, 0.06, 0.46), MAT_DARK, ham,
           (0, -0.34, -0.35 - i * 0.85), bevel=0.012)
    bx('hammer-lug', (0.26, 0.26, 0.30), MAT_WORN, ham, (0, 0, 0.78), bevel=0.02)
    # helmet and dolly under the hammer — a loose fit, on purpose
    tb('helmet', 0.42, 0.55, MAT_WORN, ham, (0, 0, -4.05), sides=16)
    tb('dolly', 0.34, 0.22, MAT_WORN, ham, (0, 0, -4.22), sides=14)
    node(NODE_MOUNT, 'tool', ham, (0, 0, -4.30))
    weld(ham, 'hammer')
    weld(t, 'sledge-tilt')
    weld(c, 'carriage')
    return c, ham


# ═══════════════════════════════════════════════════════════════════════════
#  ROPES, HOSES, LIGHTS
# ═══════════════════════════════════════════════════════════════════════════

def build_ropes(root):
    """Two reeved lines, drawn in the pose the machine is exported in.

    hs() is a Bezier with a bevel, so the long unloaded lead between the head
    and the drum actually sags instead of reading as a wire — a straight
    cylinder never looks like rope. Both leads sit on one slide: node (they
    are one visual system and the game re-points them together); the working
    fall down to the tool gets its own, because it travels with the carriage.
    """
    top = MAST_Z0 + MAST_LEN + 1.52
    g = node(NODE_SLIDE, 'rope-leads', root)
    for name, sx, wx, r in (('main', 0.0, 0.62, 0.020),
                            ('pile', -0.26, -0.62, 0.016)):
        hs('rope-' + name, [
            (wx, WINCH_Y, WINCH_Z + 0.30),
            (wx * 0.7, MAST_Y + 0.30, top * 0.55),
            (sx, MAST_Y + 0.60, top - 0.40),
            (sx, MAST_Y + 0.92, top),
        ], r, MAT_WORN, g, sides=6)
    weld(g, 'rope-leads')
    f = node(NODE_SLIDE, 'rope-fall', root)
    hs('rope-fall', [
        (0.0, MAST_Y + 0.92, top),
        (0.0, PILE_Y - 0.05, top - 2.6),
        (0.0, PILE_Y, MAST_Z0 + MAST_LEN - 5.05),
    ], 0.020, MAT_WORN, f, sides=6)
    weld(f, 'rope-fall')


def build_hoses(slew, carrier, mast):
    """Hose routing is one of the clearest tells that a machine was modelled
    from a photograph rather than from memory.

    Runs read off the cover render [P1]: a fat pair out of the house front, up
    behind the rear column and into the gusset; a thinner pair down to the
    winch block; the tool bundle breaking out of the drag chain at the guide;
    and the loop that follows the mast up its inboard flank.
    """
    hs('hose-main-a', [
        (0.30, -0.80, HOUSE_TOP - 0.20), (0.36, 0.55, 2.30),
        (0.30, KIN_REAR_FOOT[0] + 0.30, 3.20), (0.26, 1.60, 5.10),
        (0.22, 2.30, 5.50),
    ], 0.045, MAT_RUBBER, slew, sides=6)
    hs('hose-main-b', [
        (0.46, -0.80, HOUSE_TOP - 0.28), (0.52, 0.55, 2.20),
        (0.46, KIN_REAR_FOOT[0] + 0.32, 3.10), (0.40, 1.60, 5.00),
        (0.34, 2.30, 5.42),
    ], 0.045, MAT_RUBBER, slew, sides=6)
    hs('hose-winch', [
        (-0.30, -1.00, HOUSE_TOP - 0.35), (-0.42, 0.40, 2.60),
        (-0.55, 1.25, 2.95), (-0.66, WINCH_Y, WINCH_Z + 0.10),
    ], 0.030, MAT_RUBBER, slew, sides=6)
    hs('hose-tank', [
        (-0.62, -2.60, HOUSE_TOP - 0.10), (-0.70, -1.40, HOUSE_TOP - 0.55),
        (-0.62, -0.60, 2.10), (-0.50, 0.30, 1.70),
    ], 0.036, MAT_RUBBER, slew, sides=6)
    hs('hose-tool-a', [
        (-0.80, 2.30, 5.30), (-0.74, MAST_Y - 0.50, 5.05),
        (-0.62, MAST_Y - 0.70, 4.40), (-0.58, MAST_Y - 0.68, 3.70),
    ], 0.036, MAT_RUBBER, carrier, sides=6)
    hs('hose-tool-b', [
        (-0.66, 2.30, 5.20), (-0.60, MAST_Y - 0.46, 4.95),
        (-0.50, MAST_Y - 0.64, 4.30), (-0.46, MAST_Y - 0.62, 3.62),
    ], 0.036, MAT_RUBBER, carrier, sides=6)
    hd = MAST_D / 2
    hs('hose-mast', [
        (-MAST_W / 2 - 0.20, -hd - 0.13, MAST_Z0 + 0.6),
        (-MAST_W / 2 - 0.27, -hd - 0.21, MAST_Z0 + 5.0),
        (-MAST_W / 2 - 0.22, -hd - 0.16, MAST_Z0 + 10.5),
        (-MAST_W / 2 - 0.18, -hd - 0.13, MAST_Z0 + MAST_LEN - 0.8),
    ], 0.030, MAT_RUBBER, mast, sides=6)


def lamp(name, group, loc, aim_dir, cone, rng):
    """A lamp housing plus the two nodes env.js needs.

    The housing is parented to the GROUP, not to the mount: empty — a mesh
    under mount: sits inside a dynamic subtree that weld() never reaches, so
    four lamps were eight extra draw calls. The mount:/aim: pair stays exactly
    where env.js expects it; only the metal moved.
    """
    m, a_ = worklight(name, group, loc, aim_dir=aim_dir, cone_deg=cone,
                      range_m=rng)
    bx('lamp-bracket', (0.09, 0.13, 0.17), MAT_DARK, group,
       (loc[0], loc[1] - 0.11, loc[2] - 0.14), bevel=0.01)
    bx('lamp-can', (0.25, 0.21, 0.25), MAT_DARK, group, loc, bevel=0.025)
    bx('lamp-lens', (0.19, 0.04, 0.19), MAT_GLASS, group,
       (loc[0], loc[1] + 0.11, loc[2]), bevel=0.0)
    return [m, a_]


def build_lights(slew, carrier, head):
    """On-board lighting set, 4 spotlights [P8]; the feature callouts on
    pp. 3 and 6 put them on the upper carriage and up the mast.

    env.js reads mount:/aim: world positions EVERY FRAME and re-aims the real
    spotlights at them, which is why a lamp on the guide sweeps as the
    kinematics work. It binds by NAME, never by index.
    """
    out = []
    for side, sx in (('l', -1), ('r', 1)):
        out += lamp('guide-work-light-' + side, carrier,
                    (sx * (MAST_W / 2 + 0.34), MAST_Y + 0.42, GUIDE_Z1 + 0.18),
                    (-sx * 0.25, 1.30, -3.20), 52, 30)
    out += lamp('cab-work-light', slew,
                (-UPPER_W / 2 + 0.30, CAB_Y1 - 0.06, CAB_ROOF + 0.16),
                (0.6, 3.20, -2.40), 58, 26)
    out += lamp('head-work-light', head, (MAST_W / 2 + 0.10, 0.40, 0.30),
                (-0.4, 0.9, -3.40), 44, 34)
    return out


# ═══════════════════════════════════════════════════════════════════════════
#  BUILD
# ═══════════════════════════════════════════════════════════════════════════

def build(out_path):
    reset()
    root = node(NODE_MOUNT, 'root')
    root.name = 'rig-root'

    build_undercarriage(root)

    # The slew empty sits AT the origin. Rotation about Z is identical at any
    # height, and every z below build_house/build_cab/build_kinematics is an
    # absolute height above ground — putting the empty at deck height would
    # silently lift the whole upper carriage by that much.
    slew = node(NODE_PIVOT, 'slew', root, (0, 0, 0))
    build_house(slew)
    build_cab(slew)
    build_winches(slew)
    build_kinematics(slew)
    carrier = build_guide(slew)
    mast, mast_top = build_mast(carrier)
    head = build_head(mast, mast_top)
    build_carriage(mast)
    build_hoses(slew, carrier, mast)
    build_lights(slew, carrier, head)
    build_ropes(root)

    # Weld LAST, and weld the head again: build_lights() adds a housing to the
    # head AFTER build_head() has already welded it, and three loose lamp boxes
    # under a pivot: node are three draw calls finish() will never reach.
    # Every dynamic child here is an empty, never a mesh, so nothing that has
    # to move independently gets swallowed by a join.
    weld(head, 'mast-head')
    weld(carrier, 'mast-carrier')
    weld(mast, 'mast')
    weld(slew, 'upper')

    return finish(out_path)


if __name__ == '__main__':
    import os
    build(os.path.abspath(os.path.join(os.path.dirname(__file__),
                                       '..', 'public', 'models', 'pd55.glb')))
