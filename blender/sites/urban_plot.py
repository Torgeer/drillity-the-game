"""An urban construction compound; exports public/models/sites/urban-plot.glb.

Read research/sites/urban-plot.md for source scope. This is a fictional place,
not a reconstruction or a site design. The cabin and hoarding use manufacturer
dimensions; all layout, colours and small detailing are NOT SOURCED art choices.
No method-specific concrete line or pile operation is permanently implied.

Five named runtime materials, joined by the existing site library. Vertex colour
provides paint/facade variation without multiplying material or draw-call count.
The terrain remains authoritative: no slab covers the rig, collar or ground.

Build: blender --background --python blender/sites/urban_plot.py
Inspect the exported asset, CPU only: append -- --preview
"""
import importlib.util
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
spec = importlib.util.spec_from_file_location('drillity_urban_site',
                                             os.path.join(HERE, '..', 'lib', 'site.py'))
S = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = S
spec.loader.exec_module(S)

# CONTAINEX technical description v12.06.2023 p3 (external frame envelope),
# p7 (overall openings, parapet). Reference only; no marque exported.
# https://catalog.containex.com/catalog/CONTAINEX/EN/catalogs/Technische-Beschreibung-CONTAINEX-BASICLINE/pdf/Technische-Beschreibung-CONTAINEX-BASICLINE.pdf
CABIN_L, CABIN_W, CABIN_H = 6.055, 2.435, 2.591
DOOR_W, DOOR_H = 0.875, 2.125
WINDOW_W, WINDOW_H, SILL_H = 0.945, 1.200, 0.870
# Blok N Mesh Ireland guide printed pp18-19: sheet, centres, scaffold OD,
# diagonal pole length and double vehicle gate. Support arrangement is not a
# structural design: spacing/ballast must be designed for actual wind loads.
# https://www.bloknmesh.com/wp-content/uploads/2024/04/bnm-ireland-summer-22-product-guide-lr.pdf
PANEL_W, PANEL_H, PANEL_PITCH = 2.485, 2.400, 2.500
BRACE_D, BRACE_L, GATE_W = 0.0483, 2.100, 5.000

# NOT SOURCED: authored layout basis from quarry_bench.py's recorded camera.
# This is a composition aid, not a claim that every live rig has this camera.
EYE = (8.4, -10.94, 2.25)
AXIS = Vector((-0.6731, 0.7401, 0)).normalized()
RIGHT = Vector((AXIS.y, -AXIS.x, 0))
YAW = math.atan2(RIGHT.y, RIGHT.x)
CABIN_D, CABIN_A, CABIN_BASE = 28.0, -7.5, 0.18
REAR_D, SIDE_A, FRONT_D = 39.0, 20.0, 19.0
GATE_A = 10.0
CLEAR_R = 7.0  # NOT SOURCED visual reserve, not an operational exclusion zone.

# NOT SOURCED: fictional, deliberately subdued palette. Opaque dark panes use
# rubber's surface contract so no transmission pass or new glass draw is added.
BLUE, PALE, DARK = 0x415B68, 0xCBCDC5, 0x333E43
STEEL, STONE, GRAVEL = 0xA3ABA8, 0x9A968A, 0x9A9384
PAINT, METAL, CONCRETE, BLACK, FILL = 'paintedSteel', 'rawSteel', 'concrete', 'rubber', 'gravel'


def at(d, a, z=0):
    return Vector((EYE[0], EYE[1], z)) + AXIS * d + RIGHT * a


def colour(o, rgb):
    c = tuple(((rgb >> shift) & 255) / 255 for shift in (16, 8, 0)) + (1,)
    attr = o.data.color_attributes.new(name='Color', type='BYTE_COLOR', domain='CORNER')
    for item in attr.data:
        item.color_srgb = c
    o.data.color_attributes.active_color = attr
    m = o.data.materials[0]
    # Blender 5.2 treats use_nodes as deprecated/always enabled. Test for our
    # actual colour consumer, not that legacy flag: the first real export
    # collapsed COLOR_0 to white despite the authored attributes in Blender.
    if not m.node_tree or not m.node_tree.nodes.get('urban-vertex-colour'):
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        vc = m.node_tree.nodes.new('ShaderNodeVertexColor')
        vc.name = 'urban-vertex-colour'
        vc.layer_name = 'Color'
        m.node_tree.links.new(vc.outputs['Color'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.72
        bsdf.inputs['Transmission Weight'].default_value = 0
        if m.name == METAL:
            bsdf.inputs['Metallic'].default_value = 0.65
    return o


def box(name, size, d, a, z, kind, tint, bevel=0, yaw=0):
    return colour(S.box(name, size, kind, loc=at(d, a, z),
                        rot=(0, 0, YAW + yaw), bevel=bevel), tint)


def pole(name, p0, p1, radius, kind=METAL, tint=STEEL):
    delta = p1 - p0
    o = S.tube(name, radius, delta.length, kind, loc=p0, sides=8)
    o.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
    return colour(o, tint)


def cabin():
    """Single cabin, six supports (source p11); NOT SOURCED frame/trim sizes,
    footing sizes, opening positions/count, steps and local corrugation rhythm.
    The six supports and door threshold are connected, not hovering decoration.
    """
    d, a, b = CABIN_D, CABIN_A, CABIN_BASE
    for u in (-CABIN_L/2 + .16, 0, CABIN_L/2 - .16):
        for v in (-CABIN_W/2 + .12, CABIN_W/2 - .12):
            box('cabin-support', (.44, .44, b), d+v, a+u, b/2, CONCRETE, STONE, .025)
    # Frame occupies, rather than extends, the quoted external envelope.
    box('cabin-shell', (CABIN_L-.10, CABIN_W-.10, CABIN_H-.16), d, a,
        b+CABIN_H/2, PAINT, PALE, .025)
    for h in (.08, CABIN_H-.08):
        box('cabin-frame', (CABIN_L, CABIN_W, .16), d, a, b+h, PAINT, BLUE, .022)
    for u in (-CABIN_L/2+.05, CABIN_L/2-.05):
        for v in (-CABIN_W/2+.05, CABIN_W/2-.05):
            box('cabin-corner', (.10, .10, CABIN_H), d+v, a+u,
                b+CABIN_H/2, PAINT, BLUE, .012)
    # Low-relief ribs are geometry; no giant repeating painted texture baked in.
    for i in range(46):
        u = -CABIN_L/2+.16+i*(CABIN_L-.32)/45
        for sign in (-1, 1):
            box('cabin-rib', (.028, .025, CABIN_H-.32), d+sign*(CABIN_W/2-.035),
                a+u, b+CABIN_H/2, PAINT, PALE)
    front = d-CABIN_W/2-.004
    floor = b+.16  # NOT SOURCED frame-floor offset.
    for u in (-.5, 1.7):
        # Source parapet is measured to the UPPER edge of the lower profile.
        # The simplified 40mm profile itself is NOT SOURCED.
        h = floor+SILL_H-.04+WINDOW_H/2
        # Source p7 specifies white plastic frames. The shared opaque paint
        # surface approximates their finish without adding a sixth material.
        box('cabin-window-frame', (WINDOW_W, .075, WINDOW_H), front, a+u, h, PAINT, PALE, .012)
        box('cabin-pane', (WINDOW_W-.08, .02, WINDOW_H-.08), front-.042,
            a+u, h, BLACK, 0x34464B)
        box('cabin-mullion', (.035, .025, WINDOW_H-.07), front-.058,
            a+u, h, PAINT, PALE)
        box('cabin-sill', (WINDOW_W+.04, .13, .035), front-.035,
            a+u, h-WINDOW_H/2, METAL, STEEL)
    u = -2.12
    box('cabin-door-frame', (DOOR_W, .065, DOOR_H), front, a+u,
        floor+DOOR_H/2, PAINT, BLUE, .009)
    box('cabin-door', (DOOR_W-.065, .018, DOOR_H-.065), front-.04,
        a+u, floor+DOOR_H/2, PAINT, 0xADB5B4)
    box('cabin-handle', (.11, .035, .022), front-.07, a+u+.25,
        floor+.98, METAL, STEEL, .007)
    box('cabin-step', (1.08, .56, floor/2), front-.31, a+u,
        floor/4, CONCRETE, STONE, .025)


def panel(d, a, yaw=0, suffix='rear'):
    """Sourced panel envelope, NOT SOURCED relief/rails/fasteners. Support
    tube length/diameter sourced above; its two endpoints meet the post/block.
    """
    box('hoarding-'+suffix, (PANEL_W, .042, PANEL_H), d, a, PANEL_H/2, PAINT, BLUE, .006, yaw)
    across = RIGHT * math.cos(yaw) + AXIS * math.sin(yaw)
    away = AXIS * math.cos(yaw) - RIGHT * math.sin(yaw)
    base = at(d, a)
    for u in (-PANEL_PITCH/2, PANEL_PITCH/2):
        p = base + across*u
        pole('hoarding-upright', p, p+Vector((0, 0, PANEL_H)), BRACE_D/2)
    for i in range(16):
        u = (i-7.5)*PANEL_W/16
        p = base+across*u-away*.027+Vector((0, 0, PANEL_H/2))
        colour(S.box('hoarding-fold', (.018, .018, PANEL_H-.08), PAINT,
                     loc=p, rot=(0, 0, YAW+yaw)), BLUE)
    # NOT SOURCED support spacing, block and rise; brace length exactly 2.1m.
    # Attach at the panel-end upright, not into unsupported sheet at mid-span.
    high = base+across*(PANEL_PITCH/2)-away*(BRACE_D/2)+Vector((0, 0, 1.90))
    drop = 1.90-.25
    run = math.sqrt(BRACE_L**2-drop**2)
    low = high-away*run-Vector((0, 0, drop))
    colour(S.box('hoarding-ballast', (.72, .60, .40), CONCRETE,
                 loc=low-Vector((0, 0, .05)), rot=(0, 0, YAW+yaw), bevel=.025), STONE)
    pole('hoarding-brace', low, high, BRACE_D/2)


def boundary():
    """NOT SOURCED compound plan; sourced panel module and 5m gate. The
    camera-side boundary is outside this diorama crop. Gate opens onto the
    hardstanding/grid and public road, with buildings outside the rear fence.
    """
    for i in range(16):
        a = -SIDE_A+PANEL_PITCH*(i+.5)
        if GATE_A-GATE_W/2 < a < GATE_A+GATE_W/2:
            continue
        panel(REAR_D, a)
    for side in (-1, 1):
        for i in range(8):
            panel(FRONT_D+PANEL_PITCH*(i+.5), side*SIDE_A, -side*math.pi/2, 'side')
    # Both gate leaves open outward: width 2.5m each, nominal 5m opening.
    # The simplified posts reduce the clear passage; no clearance is claimed.
    # NOT SOURCED frame section and 90-degree open pose.
    for side in (-1, 1):
        a = GATE_A+side*GATE_W/2
        box('gate-open-leaf', (GATE_W/2, .06, PANEL_H), REAR_D+GATE_W/4,
            a, PANEL_H/2, PAINT, BLUE, .012, math.pi/2)
        pole('gate-post', at(REAR_D, a), at(REAR_D, a, PANEL_H+.12), .055)
    # NOT SOURCED visual information-board layout, no invented compliance text.
    box('site-notice', (1.3, .05, .75), REAR_D-.07, -1.1, 1.6, PAINT, PALE, .006)
    box('site-notice-header', (1.23, .016, .12), REAR_D-.107, -1.1, 1.88, PAINT, BLUE)
    for i in range(3):
        box('site-notice-line', (.78-i*.10, .016, .025), REAR_D-.107,
            -1.22, 1.69-i*.10, PAINT, DARK)


def access_and_storage():
    """City of London code §4.29 supports grid -> hardstanding -> road;
    all geometry dimensions here NOT SOURCED authored furniture, not a working
    wheel-wash engineering design. No water spraying or process is claimed.
    """
    box('access-hardstanding', (GATE_W, 11, .08), REAR_D-1.3, GATE_A, .02, CONCRETE, STONE)
    box('cleaning-grid-tray', (4.2, 3.6, .15), REAR_D-5, GATE_A, .095, BLACK, DARK, .03)
    for a in (-1.3, 1.3):
        for i in range(13):
            box('cleaning-grid-bar', (1.1, .075, .095), REAR_D-6.6+i*.265,
                GATE_A+a, .21, METAL, STEEL, .012)
    box('grid-sump-cover', (.65, 3.6, .10), REAR_D-5, GATE_A, .18, METAL, DARK, .015)
    box('public-road', (49, 6.4, .055), REAR_D+6, 0, .005, BLACK, 0x777874)
    for a in range(-22, 23, 5):
        box('road-dash', (2.5, .12, .012), REAR_D+6, a, .041, PAINT, PALE)
    box('pavement', (49, 1.55, .16), REAR_D+10, 0, .055, CONCRETE, STONE)
    # Platform evidence at perimeter only. No vertical offset at the collar.
    for side in (-1, 1):
        box('platform-graded-edge', (1.1, 16, .055), 27, side*16.2, .005, FILL, GRAVEL)
    # Open tapered spoil skip, under rear boundary, outside route and welfare.
    # NOT SOURCED skip sizes/sheet thickness; geometry shows actual open walls.
    d, a = 34.0, -1.5
    box('skip-floor', (3.2, 1.7, .13), d, a, .23, PAINT, BLUE, .018)
    for side in (-1, 1):
        box('skip-side', (3.2, .07, 1.1), d+side*.86, a, .80, PAINT, BLUE, .018)
        box('skip-end', (.075, 1.7, .96), d, a+side*1.60, .73, PAINT, BLUE, .018)
        box('skip-rim', (3.32, .11, .10), d+side*.87, a, 1.38, METAL, STEEL, .018)
        box('skip-foot', (.24, 1.95, .19), d, a+side*1.13, .095, METAL, DARK)
    for i in range(18):
        d0, a0 = d+S.jitter(.61, i, 5), a+S.jitter(1.25, i, 7)
        box('skip-arisings', (.48, .39, .30), d0, a0, .49+S.rnd(i, 2)*.38,
            FILL, GRAVEL, .04, S.jitter(.8, i, 3))
    # Unconnected, covered material pallets are neutral across urban methods.
    for i in range(2):
        d, a = 34.0+i*1.8, -13.0
        box('pallet-foot', (1.25, 1.05, .16), d, a, .08, METAL, DARK)
        box('wrapped-stock', (1.15, .95, .85), d, a, .58, PAINT, PALE, .06)
        for u in (-.36, .36):
            box('stock-strap', (.04, .963, .86), d, a+u, .58, BLACK, DARK)


def buildings():
    """NOT SOURCED fictional city massing, floor rhythm and facade detailing.
    Three asymmetric stepped blocks frame an open central mast silhouette.
    Recessed dark windows have individual piers/sills, not parking-garage bands.
    """
    blocks = [(57, -17, 12, 10, 16, 0xA19A8B),
              (61, 19, 13, 11, 20, 0x919995),
              (77, 0, 16, 11, 10, 0xABA797)]
    for k, (d, a, w, depth, h, tint) in enumerate(blocks):
        box('city-block-%d' % k, (w, depth, h), d, a, h/2, CONCRETE, tint, .07)
        box('city-plinth', (w+.10, depth+.10, 1.1), d, a, .55, CONCRETE, 0x777C76)
        # Roof coping stays a shallow slab with separate parapet rather than
        # a floating overhang. No inaccessible external staircase is implied.
        for side in (-1, 1):
            box('city-parapet', (w+.15, .24, .55), d+side*depth/2,
                a, h+.18, CONCRETE, 0x858A82, .035)
            box('city-parapet-end', (.24, depth, .55), d,
                a+side*w/2, h+.18, CONCRETE, 0x858A82, .035)
        for z in range(3, int(h)-1, 3):
            for j in range(int(w/2.25)):
                u = (j-(int(w/2.25)-1)/2)*2.25
                face = d-depth/2-.014
                box('city-window-reveal', (1.40, .08, 1.65), face, a+u, z, CONCRETE, 0x727B76)
                box('city-window', (1.18, .03, 1.43), face-.053, a+u, z, BLACK, 0x4D5C5F)
                box('city-window-mullion', (.045, .04, 1.43), face-.075, a+u, z, METAL, 0x929B97)
                box('city-window-sill', (1.48, .20, .07), face-.04, a+u, z-.84, CONCRETE, PALE)
        box('city-service-door', (1.5, .06, 2.25), d-depth/2-.06,
            a-w*.31, 1.125, PAINT, DARK, .02)


def build(out_path):
    S.reset()
    cabin()
    boundary()
    access_and_storage()
    buildings()
    # Verify every authored mesh, using real vertices before material joins.
    # This is a keep-clear assertion, not a competing model dimension tool.
    bpy.context.view_layer.update()
    for o in bpy.context.scene.objects:
        if o.type == 'MESH':
            for v in o.data.vertices:
                p = o.matrix_world @ v.co
                if math.hypot(p.x, p.y) < CLEAR_R:
                    raise AssertionError('urban furniture inside collar reserve: '+o.name)
    S.anchor('site-collar', (0, 0, 0))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    return S.finish(out_path, budget=5)


def preview(path):
    """Re-import the REAL export and render it with Cycles CPU. No proxy mesh.
    Lighting/camera/ground are NOT SOURCED inspection fixtures, not GLB content.
    This does not pretend to reproduce the game's procedural material renderer.
    """
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 24
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 4
    scene.render.resolution_x = 1400
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.world = bpy.data.worlds.new('inspection-world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.63, .71, .79, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .65
    bpy.ops.object.light_add(type='AREA', location=at(28, -22, 42))
    bpy.context.object.data.energy = 14000
    bpy.context.object.data.shape = 'DISK'
    bpy.context.object.data.size = 24
    bpy.context.object.rotation_euler = (at(32, 0, 0)-bpy.context.object.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.ops.mesh.primitive_plane_add(size=260)
    mat = bpy.data.materials.new('inspection-ground')
    mat.diffuse_color = (.27, .27, .23, 1)
    bpy.context.object.data.materials.append(mat)
    bpy.ops.object.camera_add(location=at(-28, 28, 42))
    camera = bpy.context.object
    camera.rotation_euler = (at(38, 0, 3)-camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 93
    scene.camera = camera
    out = os.path.join(ROOT, 'shots', 'urban-plot-export.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('URBAN_PREVIEW_REAL_GLB '+out)


if __name__ == '__main__':
    result = build(os.path.join(ROOT, 'public', 'models', 'sites', 'urban-plot.glb'))
    if '--preview' in sys.argv:
        preview(result)
