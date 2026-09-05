"""core_rig - surface diamond core / wireline exploration drill.

In-game marque: Meridian CX-1200 Wireline.  DOMAIN.md section 10 binds: no real
manufacturer name or model designation appears in any object name, material name
or any other string that can reach a player.  Provenance lives here, in the
comments, which is where it belongs.

SOURCES
-------
[C140]  Manufacturer brochure, tracked/trailer surface core rig, 7 pp., 2021.
        research/rigs/core-rig.md section 11; mirror
        https://firstbreak.co.nz/wp-content/uploads/2021/02/christensen-140.pdf
        pp.6-7 carry a fully dimensioned general-arrangement drawing (side
        elevation with the mast at 90 deg and 45 deg, end elevation, transport
        side view).  MOST NUMBERS BELOW WERE MEASURED OFF THAT DRAWING, not
        guessed: the page was rendered at 260 dpi and the drawing scaled from
        the published dimension B = 12 155 mm (overall height, mast vertical),
        which gives 12.315 mm/px on the side elevation and 6.06 mm/px on the end
        elevation (checked against D = 2 895 and E = 2 600, ratio 1.112 vs
        1.113).  Anything measured that way is tagged [GA].
[CS14]  Same family, one size down, full technical specification, 4 pp., 2013.
        https://amc.com.gt/wp-content/uploads/Brochures/Atlas-Copco/CS-14.pdf
        The web source that finally pinned the numbers the local reference lists
        as NOT SOURCED: feed travel 3.5 m, rod pull length 6.09 m, rod holder
        and chuck clamping diameters, spindle bore, winch rope sizes, level
        wind, Trido 140H pump, jack pad 230 mm / 550 mm travel.
[LF]    Competitor surface coring rig data sheet, 18 pp., 2017.
        https://mitchelldrillinginternational.com/wp-content/uploads/2021/06/
        Boart-Longyear-LF160-Data-Sheet.pdf  - mast length 9 m for a 6.7 m feed
        stroke, chain-and-cylinder feed, interlocked rotation barrier, energy
        chain hose management, wireline 6 mm x 2 200 m, crawler 500 mm shoes.
        Used only to cross-check class behaviour, not for this machine's size.
[MET]   Mineral exploration tooling catalogue pp.17-18 - the photographs: the
        punched plate feed beam, the tilting mesh rod basket, the slack hose
        loop hanging from the head carriage, the canopy over the console.
[XP]    Xploration Products catalogue 2024 pp.13-21 - feed stroke 3 450 mm on
        the heavy surface class, 1 500 rpm / 3 212 Nm, raised grating deck with
        handrails and a detached collar catwalk (p.18).
[D]     DERIVED here by arithmetic on published numbers.  Flagged every time.
[EST]   Eyeballed off a photograph, no dimension published.  Flagged every time.

WHAT THIS MACHINE IS
--------------------
A sample-recovery machine, not an earthmover: 13 t, 142 kW, a thin rod string
turning at up to 1 500 rpm, flushed with water, with the core retrieved on a
4.76 mm wireline over a sheave at the mast crown.  It is wide, low and squat -
2.895 m over a 2.2 m track gauge with 536 mm of ground clearance - and the mast
is nearly four times the machine's width.  There is NO CAB and NO
COUNTERWEIGHT; both would be domain errors here.
"""
import sys, os, math

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
import bpy
import rig as R

# ── AXES ─────────────────────────────────────────────────────────────────────
# Blender Z-up; the exporter converts to three.js Y-up (blender +Y -> gltf -Z).
# Origin: the DRILLING AXIS at ground level - the core rig's equivalent of a
# slew centre, so the machine drops onto terrain at y=0 and the hole is at the
# origin.  +Y is rearward (toward the power pack), +X is the machine's right.
# The operator's console is on the LEFT, the radiator on the RIGHT [GA] end
# elevation.

# ── governing dimensions ─────────────────────────────────────────────────────
W_OVERALL     = 2.895   # [C140] p.6 dim D, crawler
W_TRACKS      = 2.600   # [C140] p.6 dim E
SHOE          = 0.400   # [C140] p.6 dim G, "crawler band width 400 mm"
GAUGE         = W_TRACKS - SHOE                 # 2.200 [D]
CLEARANCE     = 0.536   # [C140] p.6 dim H
H_TRANSPORT   = 2.558   # [C140] p.6 dim F - sets the canopy/console-frame top
L_TRANSPORT   = 6.636   # [C140] p.6 dim I - mast folded; = upper mast section
H_WORK        = 12.155  # [C140] p.6 dim B - crown top, mast vertical
MAST_PIVOT_Z  = 1.315   # [D] h from B = h+L and A = h+L*sin45 (A = 8 979)
MAST_TOP_Z    = H_WORK  # crown top
MAST_FOOT_Z   = 0.35    # [GA] lower end of the beam above ground
BEAM_DY       = 0.394   # [GA] beam depth fore-aft, constant 6-10 m up the mast
BEAM_DX       = 0.44    # [EST] across-mast width; the end elevation shows the
                        # mast folded, so this face is never dimensioned
BEAM_Y        = 0.30    # [GA] beam centre sits this far BEHIND the drill axis;
                        # the head straddles the beam's front face
HOLE_D        = 0.12    # [GA] lightening holes in the beam webs, measured on
HOLE_PITCH    = 0.26    # [GA] both the vertical and the transport elevations
HINGE_Z       = 5.80    # [GA] the "mast in two sections" joint band.  Sanity
                        # check: 12.155 - 5.80 = 6.36 m upper section, and the
                        # published transport length is 6.636 m - the folded
                        # upper section IS the transport length. [D]
FEED_STROKE   = 3.50    # [CS14] p.2 "Feed travel 3.5 m" ([XP] p.19 says 3 450
                        # mm on the other maker's heavy surface rig)
ROD_PULL      = 6.09    # [CS14] p.2 "Rod pull length 6.09 m (20 ft)"
ROD_LEN       = 3.00    # rods come in 3 m lengths
ROD_R         = 0.035   # N-size rod 70 mm OD; spindle bore 117 mm [CS14] p.3
TRACK_LEN     = 3.20    # [GA]; cross-check: 13 000 kg at 65 kPa needs 2.0 m2
TRACK_R       = 0.28    # [GA] idler/sprocket radius, flat-track, no high drive
JACK_PAD_R    = 0.115   # [CS14] p.3 pad diameter 230 mm
JACK_STROKE   = 0.55    # [CS14] p.3 "Travel length 550 mm"
ROPE_MAIN_R   = 0.008   # [C140] p.6 main hoist 16 mm x 29 m, 80 kN
ROPE_WIRE_R   = 0.003   # [C140] p.6 wireline 4.76 mm x 2 000 m.  Modelled 25 %
                        # over scale so it survives rasterisation; still 2.7x
                        # thinner than the main line, which is the point.
DECK_Z        = 0.95    # [GA] grating deck over the frame
FRAME_Y0, FRAME_Y1 = 0.55, 4.15   # [GA] main frame, drill axis to rear
ENG_Y0, ENG_Y1     = 2.22, 3.72   # [GA] power pack enclosure
ENG_TOP            = 2.30         # [GA]

MASTL_Z = lambda z: z - MAST_PIVOT_Z     # world Z -> mast-local Z
MASTL_Y = lambda y: y - BEAM_Y           # world Y -> mast-local Y


# ── local helpers on top of rig.py ───────────────────────────────────────────
# The local box() workaround that used to sit here is GONE. `rig.box()` scaled a
# unit cube by size/2 on top of a primitive that was already 1 m on an edge, so
# it built at half scale, and six of the nine machines had each independently
# discovered that and shadowed it rather than change a file the others were
# building against. Fixed centrally 2026-09-05; `rig.reset()` now measures a
# probe box every build and raises if it ever drifts again.
# What it cost here before it was measured: the first renders read as a spindly
# toy, because every plate was half size against correct cylinders.
box = R.box


def bake(o):
    """Apply every modifier (and convert curves to meshes) so the object can be
    joined.  join() keeps only the active object's modifier stack, so anything
    welded by hand has to be baked first."""
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    return bpy.context.active_object


def weld(objs, parent, tag):
    """Join a dynamic subassembly by material and parent it to its game node.

    rig.py's finish() deliberately skips anything under a pivot:/slide: node -
    it has to move independently - which means every mesh in a moving group is
    its own draw call unless it is welded here.  Grouping by material takes the
    mast from ~30 draw calls to 3.
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
    """ARRAY modifier with a constant offset in the object's local frame."""
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
    """A wheel/sheave/pad: a short cylinder about X, Y or Z."""
    rot = {'X': (0, math.pi / 2, 0), 'Y': (-math.pi / 2, 0, 0), 'Z': (0, 0, 0)}[axis]
    o = R.tube(name, r, t, mat, parent=parent, loc=loc, rot=rot, sides=sides)
    # tube() puts the origin at the base; centre it on `loc`
    off = {'X': (-t / 2, 0, 0), 'Y': (0, -t / 2, 0), 'Z': (0, 0, -t / 2)}[axis]
    o.location = (loc[0] + off[0], loc[1] + off[1], loc[2] + off[2])
    return o


def mesh_panel(name, w, h, mat, loc, rot=(0, 0, 0), pitch=0.17, bar=0.013):
    """Expanded-metal / mesh infill, built as real crossed bars.

    The reference calls for an alpha-mapped plane, but assets.js owns every
    texture at runtime and this .glb ships no maps at all - so the mesh is
    geometry.  It is cheap: one ARRAY each way, ~25 boxes, ~300 triangles, and
    it shares a material with the frame it hangs in, so it costs no draw call.

    The panel is authored in its own XZ plane and centred on its OBJECT ORIGIN
    - the offset to the first bar is baked into the mesh data, not into the
    object location - so that `rot` turns the whole panel about `loc` instead of
    firing the bars off down a world axis.  (First version got this wrong and
    the guards came out as a starburst of loose sticks.)
    """
    from mathutils import Matrix
    nx = max(2, int(round(w / pitch)) + 1)
    nz = max(2, int(round(h / pitch)) + 1)
    v = box(name + '_v', (bar, bar, h), mat, loc=loc, rot=rot)
    v.data.transform(Matrix.Translation((-w / 2, 0, 0)))
    arr(v, (w / (nx - 1), 0, 0), nx)
    z = box(name + '_h', (w, bar, bar), mat, loc=loc, rot=rot)
    z.data.transform(Matrix.Translation((0, 0, -h / 2)))
    arr(z, (0, 0, h / (nz - 1)), nz)
    return [v, z]


def rail(name, pts, r, mat, parent=None):
    """A tubular handrail run: straight tubes between successive points."""
    out = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        d = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
        L = math.sqrt(d[0] ** 2 + d[1] ** 2 + d[2] ** 2)
        if L < 1e-4:
            continue
        # rotate +Z onto d.  Euler XYZ (0, ry, rz) sends +Z to
        # (sin ry cos rz, sin ry sin rz, cos ry) - no extra quarter turn, which
        # is what the first version had, and it fired every handrail off at 90
        # degrees to the deck edge it was supposed to follow.
        ry = math.acos(max(-1.0, min(1.0, d[2] / L)))
        rz = math.atan2(d[1], d[0])
        out.append(R.tube('%s_%d' % (name, i), r, L, mat, parent=parent, loc=a,
                          rot=(0, ry, rz), sides=8))
    return out


# ═════════════════════════════════════════════════════════════════════════════
def build(out_path):
    R.reset()
    statics = []
    A = statics.append

    # ── 1. UNDERCARRIAGE ────────────────────────────────────────────────────
    # Flat, low, small-diameter crawler: sprocket and idler at the same height,
    # eight small rollers, no high drive triangle [MET] p.17.  Shoe 400 mm,
    # gauge 2 200 mm, ground clearance 536 mm [C140] p.6.
    ty0, ty1 = FRAME_Y0 + 0.10, FRAME_Y0 + 0.10 + TRACK_LEN
    tyc = (ty0 + ty1) / 2
    for s in (-1, 1):
        x = s * GAUGE / 2
        # belt: flat top and bottom runs closed by the idler/sprocket ends
        A(box('track_belt%d' % s, (SHOE, TRACK_LEN - 2 * TRACK_R, 2 * TRACK_R),
                R.MAT_WORN, loc=(x, tyc, TRACK_R + 0.02), bevel=0.01))
        for e, ey in (('f', ty0 + TRACK_R), ('r', ty1 - TRACK_R)):
            A(disc('track_end%d%s' % (s, e), TRACK_R, SHOE, R.MAT_WORN,
                   (x, ey, TRACK_R + 0.02), 'X', sides=18))
            A(disc('track_hub%d%s' % (s, e), TRACK_R - 0.10, SHOE + 0.06, R.MAT_DARK,
                   (x, ey, TRACK_R + 0.02), 'X', sides=12))
        # grousered shoes, top and bottom run - an ARRAY, so one object
        for run, z, in (('b', 0.021), ('t', 2 * TRACK_R + 0.019)):
            sh = box('shoe%d%s' % (s, run), (SHOE, 0.16, 0.045), R.MAT_WORN,
                       loc=(x, ty0 + 0.12, z))
            arr(sh, (0, 0.20, 0), int((TRACK_LEN - 0.24) / 0.20))
            A(sh)
        # track rollers under the frame
        rl = disc('roller%d' % s, 0.095, SHOE - 0.06, R.MAT_DARK,
                  (x, ty0 + 0.52, 0.155), 'X', sides=10)
        arr(rl, (0, 0.32, 0), 7)
        A(rl)
        # track frame
        A(box('track_frame%d' % s, (0.26, TRACK_LEN - 0.5, 0.30), R.MAT_DARK,
                loc=(x, tyc, 0.44), bevel=0.02))
    # crossmembers - underside sets the published 536 mm ground clearance
    for cy in (FRAME_Y0 + 0.45, FRAME_Y1 - 0.55):
        A(box('xmember_%d' % int(cy * 100), (GAUGE - 0.1, 0.34, 0.20), R.MAT_DARK,
                loc=(0, cy, CLEARANCE + 0.10), bevel=0.02))

    # ── 2. MAIN FRAME AND DECK ──────────────────────────────────────────────
    for s in (-1, 1):
        A(box('frame_beam%d' % s, (0.26, FRAME_Y1 - FRAME_Y0, 0.36), R.MAT_DARK,
                loc=(s * 0.95, (FRAME_Y0 + FRAME_Y1) / 2, DECK_Z - 0.23), bevel=0.02))
    A(box('frame_front', (2.16, 0.28, 0.34), R.MAT_DARK,
            loc=(0, FRAME_Y0 + 0.14, DECK_Z - 0.24), bevel=0.02))
    A(box('frame_rear', (2.16, 0.28, 0.34), R.MAT_DARK,
            loc=(0, FRAME_Y1 - 0.14, DECK_Z - 0.24), bevel=0.02))
    A(box('deck_plate', (2.30, FRAME_Y1 - FRAME_Y0, 0.05), R.MAT_DARK,
            loc=(0, (FRAME_Y0 + FRAME_Y1) / 2, DECK_Z - 0.025), bevel=0.008))
    # grating: bars across the open walkway strip down the left side [XP] p.18
    gr = box('grate_bar', (0.86, 0.03, 0.012), R.MAT_STEEL,
               loc=(-0.72, FRAME_Y0 + 0.20, DECK_Z + 0.008))
    arr(gr, (0, 0.085, 0), 24)
    A(gr)
    # toe boards / hazard edging on the open sides
    A(box('toe_l', (0.04, 2.1, 0.11), R.MAT_HAZARD, loc=(-1.13, 1.7, DECK_Z + 0.055)))
    A(box('toe_r', (0.04, 2.1, 0.11), R.MAT_HAZARD, loc=(1.13, 1.7, DECK_Z + 0.055)))

    # ── 3. POWER PACK ───────────────────────────────────────────────────────
    # 142 kW Tier 4 [XP] p.19 / 153-160 kW in this family [CS14] p.2, in a
    # louvred enclosure with removable side panels, a curved exhaust stack and
    # a radiator pack that overhangs the right-hand track - which is exactly
    # what makes overall width 2 895 wider than width-over-tracks 2 600 [GA].
    eyc = (ENG_Y0 + ENG_Y1) / 2
    A(box('engine_case', (1.90, ENG_Y1 - ENG_Y0, ENG_TOP - DECK_Z), R.MAT_PAINT,
            loc=(0, eyc, (DECK_Z + ENG_TOP) / 2), bevel=0.025))
    for s in (-1, 1):
        # a recessed dark panel behind the slats, so the louvres read as an
        # opening in the sheet metal rather than as bars stuck on the side
        A(box('louvre_recess%d' % s, (0.03, ENG_Y1 - ENG_Y0 - 0.26, 0.34), R.MAT_DARK,
                loc=(s * 0.935, eyc, ENG_TOP - 0.19)))
        lv = box('louvre%d' % s, (0.02, ENG_Y1 - ENG_Y0 - 0.30, 0.030), R.MAT_PAINT,
                   loc=(s * 0.955, eyc, ENG_TOP - 0.08))
        arr(lv, (0, 0, -0.055), 6)
        A(lv)
        A(box('door%d' % s, (0.015, 0.78, 0.60), R.MAT_DARK,
                loc=(s * 0.953, eyc - 0.42, 1.52), bevel=0.01))
        A(box('door%db' % s, (0.015, 0.78, 0.60), R.MAT_DARK,
                loc=(s * 0.953, eyc + 0.42, 1.52), bevel=0.01))
        for dy in (-0.42, 0.42):
            A(box('handle%d%d' % (s, int(dy * 10)), (0.03, 0.14, 0.035), R.MAT_STEEL,
                    loc=(s * 0.975, eyc + dy + 0.30, 1.52)))
    # the radiator is what makes the machine 2 895 mm wide over a 2 600 mm
    # track: its outer face lands on W_OVERALL/2 [GA] end elevation, where the
    # D and E dimension lines start together on the left and D runs 295 mm
    # further right.
    A(box('radiator', (0.28, 1.10, 1.10), R.MAT_DARK,
            loc=(W_OVERALL / 2 - 0.155, eyc + 0.14, 1.65), bevel=0.015))
    fin = box('rad_fin', (0.02, 0.03, 1.00), R.MAT_STEEL, loc=(1.44, eyc - 0.38, 1.65))
    arr(fin, (0, 0.045, 0), 24)
    A(fin)
    A(box('rad_guard', (0.05, 1.14, 0.06), R.MAT_PAINT, loc=(1.42, eyc + 0.14, 2.22)))
    # exhaust stack, curving up out of the enclosure roof [MET] p.17
    A(R.hose('exhaust', [(-0.55, 2.48, 2.22), (-0.55, 2.43, 2.52), (-0.47, 2.35, 2.66)],
             radius=0.055, mat=R.MAT_WORN, sides=9))
    A(disc('exh_cap', 0.075, 0.03, R.MAT_WORN, (-0.47, 2.33, 2.70), 'Z', sides=9))
    # air pre-cleaner on the roof
    A(disc('precleaner', 0.135, 0.20, R.MAT_DARK, (0.40, 3.36, 2.40), 'Z', sides=12))
    A(disc('precleaner_cap', 0.165, 0.05, R.MAT_STEEL, (0.40, 3.36, 2.52), 'Z', sides=12))
    # lifting eyes - every module on this class carries them [MET] p.18
    for ex, ey in ((-0.80, ENG_Y0 + 0.15), (0.80, ENG_Y0 + 0.15),
                   (-0.80, ENG_Y1 - 0.15), (0.80, ENG_Y1 - 0.15)):
        A(box('lift_eye%d%d' % (int(ex * 10), int(ey * 10)), (0.03, 0.11, 0.13),
                R.MAT_STEEL, loc=(ex, ey, ENG_TOP + 0.05)))

    # ── 4. WATER / MUD SYSTEM - a core rig is a WET machine ──────────────────
    # Trido 140H triplex, 140 l/min at 68.95 bar [C140] p.6 / 64 bar [CS14] p.3:
    # crankcase, three fluid-end cylinders in a row, suction manifold.
    A(box('tank', (1.86, 0.74, 0.58), R.MAT_DARK, loc=(0, 1.82, 1.26), bevel=0.03))
    A(disc('tank_fill', 0.10, 0.07, R.MAT_STEEL, (0.45, 1.62, 1.57), 'Z', sides=10))
    A(box('tank_sight', (0.05, 0.05, 0.42), R.MAT_STEEL, loc=(0.95, 1.72, 1.26)))
    # hydraulic mud mixer hopper (standard equipment [C140] p.6)
    A(box('mixer_hopper', (0.46, 0.46, 0.34), R.MAT_DARK, loc=(-0.58, 1.82, 1.72),
            bevel=0.02))
    A(disc('mixer_drive', 0.09, 0.16, R.MAT_DARK, (-0.58, 1.82, 1.97), 'Z', sides=10))
    # Trido 140H triplex on the rear shelf, behind the power pack: crankcase,
    # three fluid ends in a row, suction manifold, pulsation bottle.
    A(box('pump_crank', (0.46, 0.34, 0.34), R.MAT_DARK, loc=(0.42, 4.00, 1.17),
            bevel=0.02))
    for i in range(3):
        A(disc('pump_cyl%d' % i, 0.072, 0.28, R.MAT_STEEL,
               (0.42 + (i - 1) * 0.17, 3.82, 1.22), 'Y', sides=10))
        A(disc('pump_cap%d' % i, 0.055, 0.09, R.MAT_CAST,
               (0.42 + (i - 1) * 0.17, 3.70, 1.22), 'Y', sides=8))
    A(box('pump_manifold', (0.62, 0.13, 0.13), R.MAT_STEEL, loc=(0.42, 3.76, 1.00)))
    A(disc('pump_bottle', 0.085, 0.30, R.MAT_STEEL, (0.42, 3.86, 1.52), 'Z', sides=10))
    A(disc('pump_motor', 0.11, 0.24, R.MAT_CAST, (0.42, 4.20, 1.17), 'Y', sides=12))
    # hydraulic oil cooler - the system is AIR cooled [C140] p.6
    A(box('oil_cooler', (0.52, 0.16, 0.46), R.MAT_DARK, loc=(-0.60, 3.90, 1.30),
            bevel=0.015))
    cf = box('cooler_fin', (0.48, 0.02, 0.03), R.MAT_STEEL, loc=(-0.60, 3.81, 1.10))
    arr(cf, (0, 0, 0.055), 8)
    A(cf)
    # 200 l diesel and 100 l hydraulic tanks live inside the frame [C140] p.6;
    # what shows outside is the filler and the sight gauge.
    A(disc('fuel_fill', 0.075, 0.06, R.MAT_STEEL, (-1.02, 3.30, DECK_Z + 0.03), 'Z',
           sides=10))
    A(box('valve_bank', (0.40, 0.26, 0.30), R.MAT_DARK, loc=(0.62, 1.34, 1.12),
            bevel=0.012))
    for i in range(4):
        A(R.tube('valve_lever%d' % i, 0.012, 0.20, R.MAT_STEEL,
                 loc=(0.47 + i * 0.10, 1.26, 1.27), rot=(-0.4, 0, 0), sides=6))

    # ── 5. OPERATOR STATION - NO CAB, the driller stands ────────────────────
    # Pilot-controlled console with a joystick, a constant-penetration-rate
    # knob, a gear indicator and an LED screen [C140] p.6; a light canopy roof
    # on posts over the standing position [MET] p.17.  The canopy top is the
    # published transport height, 2 558 mm [C140] p.6 dim F.
    A(box('console_body', (0.92, 0.40, 0.90), R.MAT_PAINT, loc=(-0.86, 0.72, 1.40),
            bevel=0.03))
    A(box('console_face', (0.86, 0.30, 0.10), R.MAT_DARK, loc=(-0.86, 0.50, 1.90),
            rot=(-0.55, 0, 0), bevel=0.01))
    A(box('console_screen', (0.30, 0.19, 0.02), R.MAT_GLASS, loc=(-1.02, 0.425, 1.945),
            rot=(-0.55, 0, 0)))
    for i in range(5):
        A(disc('gauge%d' % i, 0.037, 0.03, R.MAT_STEEL,
               (-0.72 + i * 0.055, 0.43, 1.95), 'Y', sides=10))
    for i in range(2):
        A(R.tube('joystick%d' % i, 0.016, 0.17, R.MAT_DARK,
                 loc=(-1.05 + i * 0.38, 0.60, 1.86), rot=(-0.35, 0, 0), sides=6))
        A(disc('joyknob%d' % i, 0.032, 0.05, R.MAT_RUBBER,
               (-1.05 + i * 0.38, 0.54, 2.02), 'Z', sides=8))
    A(box('estop', (0.08, 0.08, 0.05), R.MAT_HAZARD, loc=(-0.50, 0.48, 1.92)))
    for px, py in ((-1.36, -0.10), (-0.30, -0.10), (-1.36, 0.98), (-0.30, 0.98)):
        A(R.tube('canopy_post%d%d' % (int(px * 10), int(py * 10)), 0.038,
                 H_TRANSPORT - DECK_Z - 0.06, R.MAT_PAINT, loc=(px, py, DECK_Z), sides=8))
    A(box('canopy', (1.22, 1.24, 0.06), R.MAT_PAINT,
            loc=(-0.83, 0.44, H_TRANSPORT - 0.03), bevel=0.02))

    # ── 6. DECK FURNITURE: handrails, stair, collar catwalk ─────────────────
    hr = DECK_Z + 1.05
    A(rail('rail_l', [(-1.16, 1.30, hr), (-1.16, FRAME_Y1 - 0.05, hr),
                      (1.16, FRAME_Y1 - 0.05, hr)], 0.026, R.MAT_PAINT))
    for sx, sy in ((-1.16, 1.30), (-1.16, 2.60), (-1.16, FRAME_Y1 - 0.05),
                   (0.0, FRAME_Y1 - 0.05), (1.16, FRAME_Y1 - 0.05)):
        A(R.tube('stanchion%d%d' % (int(sx * 10), int(sy * 10)), 0.024, 1.05,
                 R.MAT_PAINT, loc=(sx, sy, DECK_Z), sides=6))
        A(R.tube('midrail%d%d' % (int(sx * 10), int(sy * 10)), 0.020, 0.02,
                 R.MAT_PAINT, loc=(sx, sy, DECK_Z + 0.52), sides=6))
    A(rail('rail_mid', [(-1.16, 1.30, DECK_Z + 0.52), (-1.16, FRAME_Y1 - 0.05, DECK_Z + 0.52),
                        (1.16, FRAME_Y1 - 0.05, DECK_Z + 0.52)], 0.020, R.MAT_PAINT))
    # access stair off the rear left
    for i in range(3):
        A(box('step%d' % i, (0.62, 0.24, 0.035), R.MAT_STEEL,
                loc=(-0.72, FRAME_Y1 + 0.16 + i * 0.24, DECK_Z - 0.24 - i * 0.24)))
    A(rail('stair_rail', [(-1.04, FRAME_Y1 + 0.05, hr), (-1.04, FRAME_Y1 + 0.80, DECK_Z + 0.30)],
           0.024, R.MAT_PAINT))
    A(rail('stair_rail2', [(-0.40, FRAME_Y1 + 0.05, hr), (-0.40, FRAME_Y1 + 0.80, DECK_Z + 0.30)],
           0.024, R.MAT_PAINT))
    # detached grating catwalk on legs, out in front at the collar [XP] p.18
    A(box('catwalk', (1.46, 1.00, 0.05), R.MAT_STEEL, loc=(0, -1.18, 0.50)))
    cb = box('catwalk_bar', (1.40, 0.028, 0.028), R.MAT_STEEL, loc=(0, -1.62, 0.535))
    arr(cb, (0, 0.098, 0), 10)
    A(cb)
    for lx in (-0.66, 0.66):
        for ly in (-1.62, -0.76):
            A(R.tube('catleg%d%d' % (int(lx * 10), int(ly * 10)), 0.032, 0.48,
                     R.MAT_STEEL, loc=(lx, ly, 0), sides=6))
    A(box('catwalk_toe', (1.46, 0.04, 0.09), R.MAT_HAZARD, loc=(0, -1.66, 0.57)))

    # ── 7. LEVELLING JACKS - four, 550 mm, pad 230 mm ───────────────────────
    # NOT outriggers: short vertical rams that level the rig [C140] p.6.
    for jx, jy, tag in ((-1.05, FRAME_Y0 + 0.05, 'fl'), (1.05, FRAME_Y0 + 0.05, 'fr'),
                        (-1.05, FRAME_Y1 - 0.05, 'rl'), (1.05, FRAME_Y1 - 0.05, 'rr')):
        A(box('jack_mount_' + tag, (0.20, 0.24, 0.30), R.MAT_DARK,
                loc=(jx, jy, DECK_Z - 0.20), bevel=0.015))
        A(R.tube('jack_case_' + tag, 0.085, 0.42, R.MAT_DARK, loc=(jx, jy, 0.42), sides=10))
        node = R.empty(R.NODE_SLIDE, 'jack-' + tag, loc=(jx, jy, 0.42))
        node['travel_m'] = JACK_STROKE      # 550 mm [CS14] p.3
        node['axis'] = 'z'
        # parked with the pad exactly on the ground: the node's own travel is
        # the published 550 mm, so the game can lift the machine off its tracks.
        # R.MAT_WORN, not R.MAT_CHROME.  Same arithmetic as jpin below: 36
        # triangles in each of FOUR jack groups is four draw calls for 144
        # triangles.  A chrome rod earns a call when it is long, extended, lit
        # and moving; this one is a 420 mm stub that spends the whole game
        # parked with its pad on the ground, buried in the case above it and
        # the pad below it, both of which are already dark or worn.  The mast
        # tilt rams and the feed rod - the two chrome rods on this machine a
        # player can actually see extend - are untouched.
        parts = [R.tube('jrod', 0.062, 0.42, R.MAT_WORN, loc=(0, 0, -0.37), sides=10),
                 disc('jpad', JACK_PAD_R, 0.05, R.MAT_WORN, (0, 0, -0.395), 'Z', sides=12),
                 # R.MAT_WORN, not R.MAT_STEEL.  Twelve triangles — one
                 # unbevelled box — and because it appears in all four jack
                 # groups it was FOUR draw calls for 48 triangles, the cheapest
                 # calls in the fleet.  The pad it pins is already wornSteel.
                 box('jpin', (0.20, 0.05, 0.05), R.MAT_WORN, loc=(0, 0, -0.33))]
        weld(parts, node, 'jack-' + tag)

    # ── 8. WINCHES - two, and they are different [C140] p.6 ─────────────────
    # Main hoist: 80 kN, 16 mm x 29 m rope, 44 m/min.  Wireline: 2 000 m of
    # 4.76 mm, up to 420 m/min, with LEVEL WIND, depth indicator and parking
    # brake - the level-wind bar across the drum face is the cheap, high-value
    # detail the reference asks for.
    WY = 1.20
    for s, tag, r0, w in ((1, 'main', 0.24, 0.40), (-1, 'wire', 0.20, 0.34)):
        wx = s * 0.46
        A(box('winch_bed_' + tag, (w + 0.16, 0.34, 0.22), R.MAT_DARK,
                loc=(wx, WY, DECK_Z + 0.11), bevel=0.015))
        for e in (-1, 1):
            A(box('winch_stand_%s%d' % (tag, e), (0.06, 0.30, 0.42), R.MAT_DARK,
                    loc=(wx + e * (w / 2 + 0.05), WY, DECK_Z + 0.40), bevel=0.01))
        node = R.empty(R.NODE_PIVOT, 'winch-' + tag, loc=(wx, WY, DECK_Z + 0.52))
        node['axis'] = 'x'
        node['rope_mm'] = 16.0 if tag == 'main' else 4.76      # [C140] p.6
        node['rope_m'] = 29 if tag == 'main' else 2000
        node['drum_r_m'] = r0 * 0.62
        parts = [disc('drum', r0 * 0.62, w, R.MAT_CAST, (0, 0, 0), 'X', sides=14),
                 disc('flange_a', r0, 0.035, R.MAT_CAST, (-w / 2, 0, 0), 'X', sides=14),
                 disc('flange_b', r0, 0.035, R.MAT_CAST, (w / 2, 0, 0), 'X', sides=14)]
        # rope wound on the drum, as a helix of stacked rings
        rr = ROPE_MAIN_R if tag == 'main' else ROPE_WIRE_R
        ring = disc('rope_wrap', r0 * 0.62 + rr * 4, rr * 2, R.MAT_WORN,
                    (-w / 2 + 0.03, 0, 0), 'X', sides=14)
        arr(ring, (rr * 2.1, 0, 0), int((w - 0.06) / (rr * 2.1)))
        parts.append(ring)
        weld(parts, node, 'winch-' + tag)
        if tag == 'wire':
            # level wind: traversing guide on a screw shaft across the drum
            A(R.tube('levelwind_shaft', 0.018, w + 0.10, R.MAT_STEEL,
                     loc=(wx - (w + 0.10) / 2, WY - 0.28, DECK_Z + 0.52),
                     rot=(0, math.pi / 2, 0), sides=8))
            A(box('levelwind_guide', (0.09, 0.07, 0.10), R.MAT_STEEL,
                    loc=(wx - 0.06, WY - 0.28, DECK_Z + 0.52)))
            A(box('wireline_counter', (0.13, 0.09, 0.13), R.MAT_DARK,
                    loc=(wx - 0.24, WY - 0.20, DECK_Z + 0.62), bevel=0.01))

    # ── 9. THE MAST ─────────────────────────────────────────────────────────
    # A fabricated PLATE BOX BEAM with a row of round lightening holes down the
    # web - NOT a lattice of tubular chords.  This single feature is what says
    # "core rig" instead of "piling rig", and it is unmistakable in [MET] pp.17
    # and 18 and in the [GA] elevations.  Beam 394 mm deep [GA], holes 120 mm
    # at 260 mm pitch [GA], joint band at 5.8 m [GA].
    mast = R.empty(R.NODE_PIVOT, 'mast', loc=(0, BEAM_Y, MAST_PIVOT_Z))
    # the datasheet travels ride along in the file as glTF `extras`, so the
    # loader never has to hard-code a number this module already knows.
    mast['axis'] = 'x'
    mast['angle_min_deg'] = 45         # [C140] p.10 "drilling angles 45-90"
    mast['angle_max_deg'] = 90
    mast['length_m'] = MAST_TOP_Z - MAST_FOOT_Z
    mp = []                      # mast-local parts, welded at the end
    zf, zt = MASTL_Z(MAST_FOOT_Z), MASTL_Z(MAST_TOP_Z - 0.66)
    beam_len = zt - zf
    beam = box('mast_beam', (BEAM_DX, BEAM_DY, beam_len), R.MAT_PAINT,
                 loc=(0, 0, (zf + zt) / 2), bevel=0.012)
    n_holes = int((beam_len - 2.4) / HOLE_PITCH)
    cutter = R.tube('holecut', HOLE_D / 2, BEAM_DX + 0.3, R.MAT_STEEL,
                    loc=(-(BEAM_DX + 0.3) / 2, 0, zf + 1.5), rot=(0, math.pi / 2, 0), sides=14)
    bpy.ops.object.select_all(action='DESELECT')
    cutter.select_set(True)
    bpy.context.view_layer.objects.active = cutter
    bpy.ops.object.transform_apply(rotation=True)
    arr(cutter, (0, 0, HOLE_PITCH), n_holes)
    cut(beam, cutter)
    mp.append(beam)
    # feed rails on the front face - the carriage gibs bear on these
    for s in (-1, 1):
        mp.append(box('mast_rail%d' % s, (0.05, 0.06, beam_len - 0.3), R.MAT_STEEL,
                        loc=(s * (BEAM_DX / 2 - 0.05), -BEAM_DY / 2 - 0.03, (zf + zt) / 2)))
    # replaceable wear lines on the lower mast, where rods drag [C140] p.6
    # R.MAT_STEEL, not R.MAT_WORN.  Twelve triangles - one unbevelled box - and
    # it was the ONLY wornSteel in pivot:mast, so it cost a whole draw call on
    # its own.  It shares a face with the two mast_rails immediately beside it,
    # which are already rawSteel, and a wear strip that rods drag across all day
    # reads bright and polished rather than oxidised anyway.
    mp.append(box('wear_line', (BEAM_DX - 0.08, 0.03, 2.6), R.MAT_STEEL,
                    loc=(0, -BEAM_DY / 2 - 0.015, zf + 1.3)))
    # the two-section joint: hinge plates and pin bosses [C140] p.3, p.6
    for s in (-1, 1):
        mp.append(box('hinge_plate%d' % s, (0.022, BEAM_DY + 0.10, 0.52), R.MAT_DARK,
                        loc=(s * (BEAM_DX / 2 + 0.012), 0, MASTL_Z(HINGE_Z)), bevel=0.008))
        for hy in (-0.14, 0.14):
            mp.append(disc('hinge_boss%d%d' % (s, int(hy * 100)), 0.055, 0.05, R.MAT_CAST,
                           (s * (BEAM_DX / 2 + 0.035), hy, MASTL_Z(HINGE_Z)), 'X', sides=10))
    mp.append(box('hinge_band', (BEAM_DX + 0.03, BEAM_DY + 0.03, 0.10), R.MAT_DARK,
                    loc=(0, 0, MASTL_Z(HINGE_Z) + 0.30), bevel=0.008))
    # feed cylinder and chain: "chain and hydraulic cylinder" feed [LF] p.12
    mp.append(R.tube('feed_barrel', 0.075, 2.0, R.MAT_DARK,
                     loc=(0, BEAM_DY / 2 + 0.09, zf + 0.35), sides=10))
    mp.append(R.tube('feed_rod', 0.045, 1.5, R.MAT_CHROME,
                     loc=(0, BEAM_DY / 2 + 0.09, zf + 2.35), sides=10))
    for cz in (zf + 0.16, zt - 0.16):
        mp.append(disc('chain_sprocket%d' % int(cz * 100), 0.085, 0.05, R.MAT_CAST,
                       (0, BEAM_DY / 2 + 0.09, cz), 'X', sides=12))
    # crown block: a boxy housing WIDER than the mast, with the sheave axles
    # showing as bosses each side, grab handles on top [GA], [MET] p.18.
    CR_X, CR_Y, CR_Z = 0.70, 0.84, 0.72
    cz = MASTL_Z(MAST_TOP_Z) - CR_Z / 2
    mp.append(box('crown_box', (CR_X, CR_Y, CR_Z), R.MAT_PAINT, loc=(0, 0.02, cz),
                    bevel=0.02))
    # cheek plates: the sheaves run between them, which is what makes a crown
    # block read as a block instead of two loose wheels
    for s in (-1, 1):
        mp.append(box('crown_cheek%d' % s, (0.03, CR_Y - 0.22, CR_Z - 0.22),
                        R.MAT_DARK, loc=(s * (CR_X / 2 + 0.015), 0.02, cz)))
        mp.append(disc('crown_boss%d' % s, 0.065, 0.05, R.MAT_CAST,
                       (s * (CR_X / 2 + 0.04), 0.14, cz - 0.04), 'X', sides=10))
        # the two lifting / tie-off lugs on the crown roof [GA]
        mp.append(box('crown_lug%d' % s, (0.05, 0.15, 0.14), R.MAT_STEEL,
                        loc=(s * 0.24, -0.16, cz + CR_Z / 2 + 0.04)))
    # tapered collar down onto the beam
    mp.append(box('crown_collar', (BEAM_DX + 0.14, BEAM_DY + 0.20, 0.22), R.MAT_PAINT,
                    loc=(0, 0.02, cz - CR_Z / 2 - 0.08), bevel=0.03))
    # work lights: crown pair aimed at the collar, plus one over the deck.
    # env.js reads mount:/aim: world positions EVERY FRAME and re-aims the
    # spotlights, so these have to be nodes, not baked geometry.
    for s in (-1, 1):
        mnt, aim = R.worklight('lamp-crown-%s' % ('r' if s > 0 else 'l'), mast,
                               (s * 0.30, -0.44, cz - 0.30),
                               aim_dir=(-s * 0.30, -0.10, -(cz - 0.30) - 0.9),
                               cone_deg=46, range_m=30)
        mp.append(box('lamp_body%d' % s, (0.13, 0.10, 0.13), R.MAT_DARK,
                        loc=(s * 0.30, -0.44, cz - 0.30), bevel=0.01))
        mp.append(disc('lamp_lens%d' % s, 0.055, 0.02, R.MAT_GLASS,
                       (s * 0.30, -0.50, cz - 0.32), 'Y', sides=10))
    mnt, aim = R.worklight('lamp-collar', mast, (0.0, -0.52, MASTL_Z(2.55)),
                           aim_dir=(0, -0.35, -2.0), cone_deg=60, range_m=18)
    mp.append(box('lamp_body_c', (0.14, 0.11, 0.14), R.MAT_DARK,
                    loc=(0, -0.52, MASTL_Z(2.55)), bevel=0.01))
    mp.append(disc('lamp_lens_c', 0.058, 0.02, R.MAT_GLASS,
                   (0, -0.58, MASTL_Z(2.53)), 'Y', sides=10))

    # rod holder / foot clamp at the collar: hydraulic, P/PW bore, closes on
    # loss of pressure [C140] p.6, [CS14] p.2 (max clamping 114.7 mm).
    fz = MASTL_Z(0.62)
    mp.append(box('rodholder_body', (0.74, 0.52, 0.30), R.MAT_DARK,
                    loc=(0, MASTL_Y(0.0) + 0.02, fz), bevel=0.02))
    for s in (-1, 1):
        mp.append(box('rodholder_jaw%d' % s, (0.20, 0.22, 0.16), R.MAT_STEEL,
                        loc=(s * 0.17, MASTL_Y(0.0), fz + 0.16)))
        mp.append(disc('rodholder_cyl%d' % s, 0.055, 0.22, R.MAT_CAST,
                       (s * 0.37, MASTL_Y(0.0), fz), 'X', sides=10))
    mp.append(box('mast_foot', (BEAM_DX + 0.16, 0.62, 0.34), R.MAT_PAINT,
                    loc=(0, -0.10, MASTL_Z(MAST_FOOT_Z) + 0.17), bevel=0.02))
    # mast pivot trunnions
    for s in (-1, 1):
        mp.append(disc('pivot_boss%d' % s, 0.085, 0.09, R.MAT_CAST,
                       (s * (BEAM_DX / 2 + 0.05), 0, 0), 'X', sides=12))

    # EN 16228 rotation barrier: an interlocked guard standing between the
    # operator and the rotating chuck.  The game's current builder passes
    # guard:false, which is period-wrong for any machine sold in Europe.
    # [C140] pp.3, 6 "safety guards with inter-lock"; [LF] p.7 "Rotation
    # Barrier with Interlocks".
    gz = MASTL_Z(1.30)
    GW, GH = 1.28, 1.44
    mp += mesh_panel('barrier_l', 1.00, GH, R.MAT_PAINT,
                     (-0.62, MASTL_Y(-0.18), gz), rot=(0, 0, math.pi / 2), pitch=0.105)
    mp += mesh_panel('barrier_f', GW, GH, R.MAT_PAINT, (0, MASTL_Y(-0.68), gz),
                     pitch=0.105)
    # frames - a guard reads as a guard because of its frame, not its mesh
    for zz in (gz - GH / 2, gz + GH / 2):
        mp.append(box('barrier_fr_f%d' % int(zz * 100), (GW + 0.06, 0.05, 0.05),
                        R.MAT_PAINT, loc=(0, MASTL_Y(-0.68), zz)))
        mp.append(box('barrier_fr_l%d' % int(zz * 100), (0.05, 1.02, 0.05),
                        R.MAT_PAINT, loc=(-0.62, MASTL_Y(-0.18), zz)))
    for xx in (-GW / 2, GW / 2):
        mp.append(box('barrier_post%d' % int(xx * 100), (0.05, 0.05, GH),
                        R.MAT_PAINT, loc=(xx, MASTL_Y(-0.68), gz)))
    for yy in (MASTL_Y(-0.68), MASTL_Y(0.32)):
        mp.append(box('barrier_postl%d' % int(yy * 100), (0.05, 0.05, GH),
                        R.MAT_PAINT, loc=(-0.62, yy, gz)))
    # R.MAT_PAINT, not R.MAT_HAZARD.  Twelve triangles, and the only
    # safetyStripe under pivot:mast, so it was a draw call to itself.  It is a
    # 110 mm band on the bottom rail of a guard that is already painted frame,
    # painted posts and painted mesh: at any camera distance this game uses
    # nobody resolves it AS striping, which is the test.  The striping that
    # does pass that test - the two 2.1 m deck toe boards, the catwalk toe and
    # the spin guard at the chuck - keeps its call.
    mp.append(box('barrier_stripe', (GW + 0.06, 0.06, 0.11), R.MAT_PAINT,
                    loc=(0, MASTL_Y(-0.70), gz - GH / 2 + 0.12)))
    # interlock switch on the hinge side [C140] p.3 "safety guard with an
    # interlock function that automatically stops the rig when activated"
    mp.append(box('barrier_interlock', (0.09, 0.07, 0.13), R.MAT_DARK,
                    loc=(-0.60, MASTL_Y(-0.66), gz + 0.40)))

    # rod kicker: the arm that positions a rod off the rack onto the drill
    # centreline.  "It has a rod kicker for rod positioning" [CS14] p.2 - the
    # cheapest piece of story on the whole machine, and it is what makes the
    # rack read as a magazine rather than a bin.
    kz = MASTL_Z(2.30)
    mp.append(box('kicker_mount', (0.16, 0.20, 0.30), R.MAT_DARK,
                    loc=(BEAM_DX / 2 + 0.06, -0.06, kz), bevel=0.012))
    mp.append(box('kicker_arm', (0.62, 0.09, 0.09), R.MAT_PAINT,
                    loc=(BEAM_DX / 2 + 0.38, -0.24, kz + 0.06), rot=(0, 0, -0.35)))
    mp.append(box('kicker_fork', (0.10, 0.24, 0.16), R.MAT_STEEL,
                    loc=(BEAM_DX / 2 + 0.66, -0.34, kz + 0.06)))
    mp.append(disc('kicker_cyl', 0.045, 0.34, R.MAT_CHROME,
                   (BEAM_DX / 2 + 0.30, -0.02, kz - 0.16), 'X', sides=8))

    # ── 9b. CROWN SHEAVES (rotate) ──────────────────────────────────────────
    # "Large crown sheave wheel" and "steel sheaves and larger wireline pulleys"
    # [C140] pp.3, 6 - plural, but neither the count nor the diameter is ever
    # published.  Two here, sized off the ropes they carry (D/d ~ 21 on the
    # 16 mm hoist line, ~46 on the 4.76 mm wireline) and cross-checked against
    # the ~0.21 m circles drawn inside the crown on the [GA] elevation.
    shm = R.empty(R.NODE_PIVOT, 'sheave-main', mast, (0, 0.16, cz - 0.02))
    weld([disc('sh', 0.155, 0.050, R.MAT_CAST, (0, 0, 0), 'X', sides=18),
          disc('shr1', 0.175, 0.012, R.MAT_CAST, (-0.030, 0, 0), 'X', sides=18),
          disc('shr2', 0.175, 0.012, R.MAT_CAST, (0.030, 0, 0), 'X', sides=18)],
         shm, 'sheave-main')
    shw = R.empty(R.NODE_PIVOT, 'sheave-wire', mast, (0, -0.24, cz + 0.14))
    weld([disc('sh', 0.100, 0.028, R.MAT_CAST, (0, 0, 0), 'X', sides=16),
          disc('shr1', 0.115, 0.009, R.MAT_CAST, (-0.018, 0, 0), 'X', sides=16),
          disc('shr2', 0.115, 0.009, R.MAT_CAST, (0.018, 0, 0), 'X', sides=16)],
         shw, 'sheave-wire')

    # ── 10. FEED CARRIAGE AND ROTATION HEAD (slides) ────────────────────────
    # Two-gear rotation unit, hollow spindle, hydraulic chuck; 1 500 rpm and
    # 3 212 Nm [XP] p.19 - a FAST, LIGHT spindle, not a foundation rig's
    # 20 rpm.  Spindle bore 117 mm [CS14] p.3.  Stroke 3.5 m [CS14] p.2.
    car_z = MASTL_Z(2.35)          # parked mid-stroke
    car = R.empty(R.NODE_SLIDE, 'carriage', mast, (0, 0, car_z))
    car['axis'] = 'z'
    car['travel_m'] = FEED_STROKE      # 3.5 m [CS14] p.2
    # glTF parent-local Y is Blender parent-local Z; extras are not converted.
    car['travel_space'] = 'parent-local'
    car['travel_axis'] = 'y'
    car['travel_direction'] = 'min'
    car['travel_min_m'] = MASTL_Z(1.15)
    car['travel_max_m'] = MASTL_Z(1.15 + FEED_STROKE)
    car['rod_pull_m'] = ROD_PULL
    cp = []
    cp.append(box('sled', (BEAM_DX + 0.12, 0.16, 0.62), R.MAT_DARK,
                    loc=(0, -BEAM_DY / 2 - 0.08, 0), bevel=0.015))
    for s in (-1, 1):
        for gz2 in (-0.26, 0.26):
            cp.append(box('gib%d%d' % (s, int(gz2 * 100)), (0.09, 0.12, 0.10),
                            R.MAT_STEEL, loc=(s * (BEAM_DX / 2 - 0.05),
                                              -BEAM_DY / 2 - 0.03, gz2)))
    hy = MASTL_Y(0.0)              # spindle axis = the drilling axis
    cp.append(box('head_case', (0.62, 0.46, 0.58), R.MAT_DARK,
                    loc=(0, hy - 0.10, 0.04), bevel=0.02))
    cp.append(box('head_gearbox', (0.40, 0.30, 0.22), R.MAT_DARK,
                    loc=(0.10, hy + 0.10, 0.40), bevel=0.015))
    cp.append(disc('head_motor', 0.105, 0.24, R.MAT_CAST, (-0.42, hy + 0.02, 0.18),
                   'X', sides=12))
    cp.append(disc('head_motor_end', 0.075, 0.06, R.MAT_STEEL, (-0.56, hy + 0.02, 0.18),
                   'X', sides=10))
    # hydraulic chuck below the gearbox, jaws bare polished steel
    cp.append(disc('chuck', 0.17, 0.24, R.MAT_CAST, (0, hy, -0.38), 'Z', sides=14))
    for i in range(3):
        a = i * 2.094
        cp.append(box('chuck_jaw%d' % i, (0.09, 0.09, 0.14), R.MAT_STEEL,
                        loc=(math.sin(a) * 0.13, hy + math.cos(a) * 0.13, -0.44),
                        rot=(0, 0, -a)))
    # water swivel on the spindle top - a core rig flushes continuously
    cp.append(disc('swivel', 0.085, 0.20, R.MAT_CAST, (0, hy, 0.36), 'Z', sides=12))
    cp.append(box('swivel_port', (0.10, 0.14, 0.09), R.MAT_STEEL,
                    loc=(0, hy - 0.14, 0.40)))
    # rod-spin guard on the carriage [XP] p.14
    cp += mesh_panel('spinguard', 0.62, 0.36, R.MAT_HAZARD, (0, hy - 0.30, -0.30))
    weld(cp, car, 'carriage')
    spin = R.empty(R.NODE_PIVOT, 'spindle', car, (0, hy, -0.26))
    spin['axis'] = 'z'
    spin['rpm_max'] = 1500             # [XP] p.19 - fast and light, not a
    spin['torque_nm'] = 3212           # foundation rig's 20 rpm
    spin['bore_mm'] = 117              # [CS14] p.3 hollow spindle
    weld([R.tube('spindle_stub', 0.062, 0.34, R.MAT_STEEL, loc=(0, 0, -0.34), sides=12),
          disc('spindle_collar', 0.088, 0.06, R.MAT_STEEL, (0, 0, -0.06), 'Z', sides=12)],
         spin, 'spindle')
    R.empty(R.NODE_MOUNT, 'tool', spin, (0, 0, -0.36))

    # ── 11. TILTING ROD RACK - the second largest object in the silhouette ──
    # A big open mesh basket that tilts WITH the mast and lies parallel to it,
    # hanging off one side and past the front [MET] pp.17, 18; [GA] transport
    # view gives it as 2.9 m long x 0.9 m deep.  Capacity follows rod size:
    # B 25 / N 20 / H 15 / P 11 [C140] p.10 - twenty N-size rods here.
    rr_node = R.empty(R.NODE_PIVOT, 'rodrack', mast,
                      (0.60, MASTL_Y(-0.58), MASTL_Z(0.52)), rot=(-0.20, 0, 0))
    rr_node['axis'] = 'x'
    rr_node['rods'] = 20               # N-size; B 25 / H 15 / P 11 [C140] p.10
    rr_node['rod_len_m'] = ROD_LEN
    rp = []
    RK_L, RK_W, RK_D = 3.05, 0.94, 0.50     # [GA] transport view: 2.9 x 0.9 m
    # an OPEN basket: two mesh sides, a mesh floor, end plates, and cradle
    # cross-bars the rods actually lie on.  It has to read as a cage at 64 px,
    # because after the mast it is the largest object in the silhouette and it
    # is the one thing no other drilling machine carries [MET] pp.17, 18.
    for s in (-1, 1):
        rp += mesh_panel('rack_side%d' % s, RK_L, RK_D, R.MAT_PAINT,
                         (s * RK_W / 2, RK_D / 2 - 0.04, RK_L / 2),
                         rot=(0, math.pi / 2, math.pi / 2), pitch=0.20)
        rp.append(box('rack_top%d' % s, (0.06, 0.06, RK_L), R.MAT_PAINT,
                        loc=(s * RK_W / 2, RK_D - 0.05, RK_L / 2)))
        rp.append(box('rack_bot%d' % s, (0.06, 0.06, RK_L), R.MAT_PAINT,
                        loc=(s * RK_W / 2, 0.02, RK_L / 2)))
    # floor: authored straight in the panel's own XZ plane - width across the
    # rack, length up it.  Rotating it into place was the bug that laid a 3 m
    # fan of loose bars out across the ground beside the machine.
    rp += mesh_panel('rack_floor', RK_W, RK_L, R.MAT_PAINT, (0, 0.02, RK_L / 2),
                     pitch=0.20)
    for e in (0.05, RK_L - 0.05):
        rp.append(box('rack_end%d' % int(e * 10), (RK_W + 0.10, RK_D, 0.06),
                        R.MAT_PAINT, loc=(0, RK_D / 2 - 0.02, e), bevel=0.012))
    for cz in (0.55, 1.55, 2.55):
        rp.append(box('rack_cradle%d' % int(cz * 10), (RK_W, 0.05, 0.05),
                        R.MAT_WORN, loc=(0, 0.04, cz)))
    # mounting arms back to the mast foot
    for s in (-1, 1):
        rp.append(box('rack_arm%d' % s, (0.10, 0.62, 0.10), R.MAT_PAINT,
                        loc=(s * 0.34, -0.30, 0.30), rot=(0.42, 0, 0)))
    rp.append(box('rack_spine', (0.12, 0.12, RK_L * 0.8), R.MAT_PAINT,
                    loc=(0, -0.06, RK_L / 2)))
    # rods: bare rust-brown mild steel, NOT chrome, NOT painted [C140] p.9.
    # Wrist-thick, not thigh-thick: 70 mm OD against a 117 mm spindle bore
    # [CS14] p.3 - the single most commonly botched proportion on a core rig.
    # Twenty N-size rods; the rack capacity follows the size being run,
    # B 25 / N 20 / H 15 / P 11 [C140] p.10.
    n = 0
    for row, cols in ((0, 7), (1, 7), (2, 6)):
        for col in range(cols):
            if n >= 20:
                break
            rp.append(R.tube('rod%d' % n, ROD_R, ROD_LEN, R.MAT_WORN,
                             loc=(-RK_W / 2 + 0.11 + col * 0.12,
                                  0.08 + row * 0.076 + (0.06 if row == 2 else 0),
                                  0.03), sides=7))
            n += 1
    weld(rp, rr_node, 'rodrack')

    # ── 12. MAST TILT RAMS ──────────────────────────────────────────────────
    # Hydraulic mast raise / mast dump [C140] p.6 - and they are large.
    for s in (-1, 1):
        A(R.tube('tilt_barrel%d' % s, 0.085, 1.15, R.MAT_DARK,
                 loc=(s * 0.62, 1.60, DECK_Z + 0.18), rot=(-1.05, 0, 0), sides=12))
        A(R.tube('tilt_rod%d' % s, 0.055, 0.85, R.MAT_CHROME,
                 loc=(s * 0.62, 1.60 - 0.99, DECK_Z + 0.18 + 0.58), rot=(-1.05, 0, 0),
                 sides=10))
        A(disc('tilt_eye%d' % s, 0.075, 0.09, R.MAT_CAST,
               (s * 0.62, 1.60, DECK_Z + 0.18), 'X', sides=10))

    # ── 13. ROPES AND HOSES ─────────────────────────────────────────────────
    # Two rope systems over the crown, and they are very different sizes: main
    # hoist 16 mm, wireline 4.76 mm [C140] p.6.  The game currently draws one
    # rope at the main-hoist diameter and calls it the wireline.
    A(R.hose('rope_main', [(0.50, 1.20, DECK_Z + 0.75),
                           (0.34, 1.30, 4.20),
                           (0.16, 0.62, 8.60),
                           (0.02, 0.44, MAST_TOP_Z - 0.34),
                           (0.0, 0.10, MAST_TOP_Z - 0.30),
                           (0.0, 0.02, 6.40)], radius=ROPE_MAIN_R, mat=R.MAT_WORN, sides=6))
    A(R.hose('rope_wire', [(-0.50, 1.20, DECK_Z + 0.75),
                           (-0.30, 1.20, 4.60),
                           (-0.10, 0.34, 9.40),
                           (0.0, 0.02, MAST_TOP_Z - 0.12),
                           (0.0, -0.06, MAST_TOP_Z - 0.22),
                           (0.0, -0.02, 2.90),
                           (0.0, 0.0, 0.30)], radius=ROPE_WIRE_R, mat=R.MAT_WORN, sides=5))
    # hoist plug / water swivel hanging on the main line when tripping
    A(disc('hoist_plug', 0.075, 0.26, R.MAT_CAST, (0.0, 0.02, 6.30), 'Z', sides=10))
    # tidy clamped hose runs up the mast rear face [C140] p.3 "improved hose
    # routing ... bundled and clamped", plus the ONE loose loop that is the
    # signature of the machine: a slack catenary from the head carriage down to
    # the mast foot, long enough to follow the head over its whole stroke
    # [MET] p.18.
    mp.append(R.hose('hose_loop_a', [(-0.18, MASTL_Y(-0.28), MASTL_Z(2.30)),
                                     (-0.30, MASTL_Y(-1.05), MASTL_Z(1.15)),
                                     (-0.22, MASTL_Y(-0.55), MASTL_Z(0.70)),
                                     (-0.10, MASTL_Y(-0.10), MASTL_Z(0.62))],
                     radius=0.030, mat=R.MAT_RUBBER, sides=6))
    mp.append(R.hose('hose_loop_b', [(0.18, MASTL_Y(-0.26), MASTL_Z(2.30)),
                                     (0.30, MASTL_Y(-1.00), MASTL_Z(1.20)),
                                     (0.22, MASTL_Y(-0.52), MASTL_Z(0.74)),
                                     (0.10, MASTL_Y(-0.10), MASTL_Z(0.66))],
                     radius=0.030, mat=R.MAT_RUBBER, sides=6))
    for i, hx in enumerate((-0.10, 0.0, 0.10)):
        mp.append(R.hose('hose_bundle%d' % i,
                         [(hx, MASTL_Y(0.30) + 0.06, MASTL_Z(0.80)),
                          (hx, MASTL_Y(0.30) + 0.09, MASTL_Z(3.00)),
                          (hx, MASTL_Y(0.30) + 0.07, MASTL_Z(5.60))],
                         radius=0.022, mat=R.MAT_RUBBER, sides=5))
    for cz2 in (1.6, 3.4, 5.2):
        mp.append(box('hose_clamp%d' % int(cz2 * 10), (0.30, 0.05, 0.05), R.MAT_STEEL,
                        loc=(0, MASTL_Y(0.30) + 0.09, MASTL_Z(cz2))))
    # deck hoses: pump to mast foot, valve bank to mast
    A(R.hose('hose_water', [(0.42, 3.62, 1.05), (0.86, 2.20, 1.02),
                            (0.30, 0.90, 1.05), (0.10, 0.20, 0.80)],
             radius=0.034, mat=R.MAT_RUBBER, sides=6))
    A(R.hose('hose_deck1', [(-0.30, 1.60, 1.02), (-0.24, 1.00, 1.10), (-0.12, 0.42, 0.92)],
             radius=0.026, mat=R.MAT_RUBBER, sides=5))
    A(R.hose('hose_deck2', [(0.52, 1.30, 1.10), (0.30, 0.95, 1.12), (0.14, 0.40, 0.94)],
             radius=0.026, mat=R.MAT_RUBBER, sides=5))

    # deck work light over the console, plus one on the power pack
    mnt, aim = R.worklight('lamp-deck', None, (-1.30, 0.30, H_TRANSPORT - 0.10),
                           aim_dir=(0.6, -0.9, -1.4), cone_deg=70, range_m=14)
    A(box('lamp_body_d', (0.13, 0.10, 0.12), R.MAT_DARK,
            loc=(-1.30, 0.30, H_TRANSPORT - 0.10), bevel=0.01))
    A(disc('lamp_lens_d', 0.052, 0.02, R.MAT_GLASS, (-1.28, 0.24, H_TRANSPORT - 0.14),
           'Y', sides=10))

    # ── 14. WELD THE MAST GROUP AND EXPORT ──────────────────────────────────
    weld(mp, mast, 'mast')          # applies the boolean, so the cutter can go
    bpy.data.objects.remove(cutter, do_unlink=True)

    # Bake every remaining static before finish().  Two reasons, both measured:
    # a CURVE is not a MESH so finish() skips it and each hose lands as its own
    # draw call; and join() keeps only the ACTIVE object's modifier stack, so an
    # un-baked ARRAY on whichever member happens to be first gets applied to the
    # whole joined mesh - that alone took static:rawSteel from ~740 to 17 856
    # triangles on the first export.
    for o in list(bpy.context.scene.objects):
        if o.type in ('MESH', 'CURVE') and o.parent is None:
            bake(o)
    return R.finish(out_path)
