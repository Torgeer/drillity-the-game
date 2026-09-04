"""
Shared helpers for building game machines in Blender.

WHY A SCRIPT AND NOT A .blend
-----------------------------
Every dimension in a machine here traces to a manufacturer datasheet page. If
the model is a binary .blend, that provenance dies the moment someone nudges a
vertex. As a script it is reviewable, diffable and reproducible: change one
constant, rebuild, and the change is visible in `git diff`.

THE THREE CONTRACTS THIS FILE ENFORCES
--------------------------------------
1. NAMED NODES. `src/core/env.js` reads live nodes from `ctx.rig.getWorkLights()`
   EVERY FRAME and re-aims spotlights at them — that is why boom lamps sweep the
   drive as a machine works. A node the game needs must survive export with a
   predictable name. Hence `mount()`, `pivot()` and `slide()` below, and the
   `NODE_` prefixes. Never rename these casually; `rigFactory.js` looks them up
   by string.

2. MATERIALS BY NAME, NOT BY TEXTURE. `src/core/assets.js` generates every
   texture procedurally at runtime — 33 kinds, with wear, dirt and rust driven by
   gameplay state. If a .glb shipped its own baked maps we would lose all of
   that AND blow the texture budget (55 MB HIGH today, ~90 MB cap). So a Blender
   material here is a NAME ONLY, e.g. 'paintedSteel'. The loader swaps it for the
   live procedural material. Keep the names in sync with `assets.js` KINDS.

3. DRAW CALLS. Budget is <= 70 per rig. glTF gives one draw call per material
   per mesh, so static geometry sharing a material MUST be joined before export
   or a detailed machine lands at 200+. `finish()` does that. Detail that shares
   a material is therefore free in draw-call terms and costs only triangles —
   that is the lane to spend in.

UNITS AND AXES
--------------
Metres. Blender is Z-up; the exporter converts to three.js Y-up. Build with Z as
height and let the exporter handle it. Origin is the machine's slew centre at
ground level, so a rig drops onto terrain at y=0 without a fudge offset.
"""

import bpy
import bmesh
from mathutils import Vector

# ── node-name prefixes the game looks up by string ────────────────────────────
NODE_MOUNT = 'mount:'   # a fixed attachment point (lamp, hose end, decal plate)
NODE_AIM   = 'aim:'     # the point a mount looks at; env.js targets spotlights here
NODE_PIVOT = 'pivot:'   # a node the game ROTATES (boom slew, mast rake, sheave)
NODE_SLIDE = 'slide:'   # a node the game TRANSLATES (carriage, ram, telescope)

# ── material names — MUST match kinds in src/core/assets.js ───────────────────
MAT_PAINT   = 'paintedSteel'   # machine bodywork. Albedo is BRAND.amberPlant.
MAT_DARK    = 'paintedDark'    # chassis, frames, guarding
MAT_STEEL   = 'rawSteel'       # bright working steel: rails, rods, pins
MAT_WORN    = 'wornSteel'      # oxidised, unpainted, weathered
MAT_CAST    = 'castIron'       # cast housings, sheave blocks
MAT_RUBBER  = 'rubber'         # hoses, track pads, seals
MAT_GLASS   = 'glass'          # cab glazing. NEVER give this transmission > 0:
                               # it re-renders the whole opaque list, measured at
                               # +65..81 draw calls, and does not scale with size.
MAT_CHROME  = 'chrome'         # cylinder rods
MAT_HAZARD  = 'safetyStripe'   # hazard striping, toe boards


def reset():
    """Empty scene, metric units, nothing inherited from a previous run."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.length_unit = 'METERS'
    return bpy.context.collection


def _mat(name):
    """A stub material carrying only a name. The runtime swaps in the real one."""
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
        m.use_nodes = False
    return m


def part(name, mesh_obj, mat=MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    """Give an object its name, material, transform and parent in one call."""
    mesh_obj.name = name
    mesh_obj.data.materials.clear()
    mesh_obj.data.materials.append(_mat(mat))
    mesh_obj.location = loc
    mesh_obj.rotation_euler = rot
    if parent is not None:
        mesh_obj.parent = parent
    return mesh_obj


def box(name, size, mat=MAT_PAINT, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.0):
    """A box. `bevel` in metres — a bevelled edge is what stops steel reading as
    cardboard, and it costs triangles, not draw calls."""
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        m = o.modifiers.new('bev', 'BEVEL')
        m.width = bevel
        m.segments = 2
        m.limit_method = 'ANGLE'
    return part(name, o, mat, parent, loc, rot)


def tube(name, radius, length, mat=MAT_STEEL, parent=None, loc=(0, 0, 0),
         rot=(0, 0, 0), sides=12):
    """A cylinder along +Z, origin at its base — so a leg or a rod extends up."""
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=length, vertices=sides)
    o = bpy.context.active_object
    o.data.transform(__import__('mathutils').Matrix.Translation((0, 0, length / 2)))
    return part(name, o, mat, parent, loc, rot)


def hose(name, points, radius=0.035, mat=MAT_RUBBER, parent=None, sides=6):
    """A hose or rope that DRAPES. Takes world points; a Bezier curve with a
    bevel gives the sag that a straight cylinder never will, and hydraulic hose
    routing is one of the clearest tells that a machine was modelled from a
    photograph rather than from memory."""
    cu = bpy.data.curves.new(name + '_c', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = max(1, sides // 3)
    cu.resolution_u = 6
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(points) - 1)
    for i, p in enumerate(points):
        bp = sp.bezier_points[i]
        bp.co = Vector(p)
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(_mat(mat))
    if parent is not None:
        o.parent = parent
    return o


def empty(kind, name, parent=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    """A named node the GAME will find and drive. `kind` is one of the NODE_
    prefixes. These are the whole reason this pipeline can work at all."""
    o = bpy.data.objects.new(kind + name, None)
    o.empty_display_type = 'ARROWS'
    o.empty_display_size = 0.4
    o.location = loc
    o.rotation_euler = rot
    bpy.context.collection.objects.link(o)
    if parent is not None:
        o.parent = parent
    return o


def worklight(name, parent, loc, aim_dir=(0, 0, -1), cone_deg=54, range_m=26):
    """A lamp housing plus the two nodes env.js needs.

    Returns (mount, aim). The game reads world positions from both every frame,
    so a lamp on a boom sweeps as the boom moves — which is most of why real
    underground footage looks the way it does.
    """
    mount = empty(NODE_MOUNT, name, parent, loc)
    mount['cone_deg'] = cone_deg
    mount['range_m'] = range_m
    aim = empty(NODE_AIM, name, mount,
                (aim_dir[0], aim_dir[1], aim_dir[2]))
    return mount, aim


def finish(out_path, join_by_material=True):
    """Join static meshes by material, then export.

    The join is what keeps a detailed machine inside the draw-call budget: glTF
    emits one draw call per material per mesh, so 300 separate bolts in one
    material are 300 draw calls unjoined and 1 joined. Anything parented to a
    pivot: or slide: node is left alone — it has to move independently.
    """
    bpy.ops.object.select_all(action='DESELECT')

    def is_dynamic(o):
        p = o
        while p is not None:
            if p.name.startswith(NODE_PIVOT) or p.name.startswith(NODE_SLIDE):
                return True
            p = p.parent
        return False

    if join_by_material:
        groups = {}
        for o in list(bpy.context.scene.objects):
            if o.type != 'MESH' or is_dynamic(o):
                continue
            key = o.data.materials[0].name if o.data.materials else 'none'
            groups.setdefault(key, []).append(o)
        for key, objs in groups.items():
            if len(objs) < 2:
                continue
            bpy.ops.object.select_all(action='DESELECT')
            for o in objs:
                o.select_set(True)
            bpy.context.view_layer.objects.active = objs[0]
            bpy.ops.object.join()
            bpy.context.active_object.name = 'static:' + key

    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_apply=True,        # bake modifiers, so bevels survive
        export_yup=True,          # Blender Z-up -> three.js Y-up
        export_cameras=False,
        export_lights=False,      # env.js owns every light in the game
        export_extras=True,       # carries the cone_deg / range_m custom props
    )

    import os
    mesh_count = len([o for o in bpy.context.scene.objects if o.type == 'MESH'])
    tris = sum(len(o.data.loop_triangles) for o in bpy.context.scene.objects
               if o.type == 'MESH' and o.data.loop_triangles is not None)
    print('EXPORT_OK path=%s bytes=%d meshes=%d' % (
        out_path, os.path.getsize(out_path), mesh_count))
    return out_path
