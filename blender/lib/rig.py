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

   Contract 3 fights contract 1, and contract 1 wins. Joining deletes objects,
   and a `mount:`/`aim:` empty parented to a deleted object loses its world
   position without losing its name. `finish()` therefore restores every world
   transform after the joins. Read the note in `finish()` before touching it.

MEASURE, DO NOT READ
--------------------
`box()` built every machine at half scale for a week. It was not caught by
reading the code — six builders read it and each wrote a local workaround
instead — and it could not be caught in a viewport, because `tube()` was
correct, so the machines were correct cylinders bolted to half-size plates.
`reset()` now measures both primitives on every build and raises if either
lies, and `tools/glbinfo.mjs` reports the world bounding box of an exported
file. A dimension nobody has read back is a dimension nobody knows.

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


def _selfcheck():
    """Build one box and one tube of known size, MEASURE them, and refuse to
    continue if either lies.

    This exists because `box()` was wrong by a factor of two for a week and no
    instrument in the tree would have said so. Every dimension in every machine
    here is supposed to trace to a datasheet page; a primitive that silently
    rescales makes that provenance decorative. `foundation_bg.py` had already
    invented this check locally and used it to compensate at build time — the
    idea was right and the place was wrong, so it lives here now and it raises
    instead of compensating. Cost is two primitives per build.
    """
    probe = box('__selfcheck_box__', (4.0, 2.0, 10.0), MAT_PAINT)
    d = probe.dimensions
    got = (d.x, d.y, d.z)
    bpy.data.objects.remove(probe, do_unlink=True)
    if max(abs(g - w) for g, w in zip(got, (4.0, 2.0, 10.0))) > 1e-4:
        raise AssertionError(
            'rig.box() is not building at the size it is asked for: wanted '
            '(4.000, 2.000, 10.000), measured (%.3f, %.3f, %.3f). Every machine '
            'in blender/ is dimensioned in real metres against a datasheet, so '
            'this is not cosmetic.' % got)

    probe = tube('__selfcheck_tube__', 0.5, 3.0, MAT_STEEL)
    d = probe.dimensions
    zs = [v.co.z for v in probe.data.vertices]
    got = (d.x, d.y, d.z, min(zs), max(zs))
    bpy.data.objects.remove(probe, do_unlink=True)
    if (max(abs(g - w) for g, w in zip(got[:3], (1.0, 1.0, 3.0))) > 1e-4
            or abs(got[3]) > 1e-4 or abs(got[4] - 3.0) > 1e-4):
        raise AssertionError(
            'rig.tube() is not building at the size it is asked for, or its '
            'origin is not at its base: wanted d=(1.000, 1.000, 3.000) '
            'z=0.000..3.000, measured d=(%.3f, %.3f, %.3f) z=%.3f..%.3f' % got)


def reset():
    """Empty scene, metric units, nothing inherited from a previous run.

    Also runs `_selfcheck()`: the primitives are measured at the start of every
    build, so a machine cannot be exported by a library that has quietly stopped
    building at true scale.
    """
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.length_unit = 'METERS'
    _selfcheck()
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
    """A box `size` metres on each edge. `bevel` in metres — a bevelled edge is
    what stops steel reading as cardboard, and it costs triangles, not draws.

    `size` on `primitive_cube_add` is the EDGE LENGTH, not a half-extent: with
    size=1 the cube already spans −0.5..+0.5. This function used to scale that
    by `size/2` as well, so every box it built came out at HALF the dimension
    asked for, for the whole first week of the pipeline. It survived because
    `tube()` was right, so machines rendered as correct cylinders bolted to
    half-size plates: nothing looked broken, the proportions were quietly wrong.
    Six of the nine builders had each independently discovered it and shadowed
    this function locally rather than change a file the others were building
    against, which is why it went on being true for so long.

    Do not "simplify" this back to a scale of size/2, and do not change the
    primitive's `size=` without re-running the check in `reset()`.
    """
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

    WHAT THE JOIN USED TO DO TO NAMED NODES, AND WHY IT MATTERS
    ----------------------------------------------------------
    `bpy.ops.object.join()` deletes the objects it eats, and the children of a
    deleted object do NOT keep their world transform. Measured: a
    `mount:` empty parented to a static box at x = 6 came back at x = 0 after
    the join, dragging its `aim:` child with it. `env.js` reads those two world
    positions EVERY FRAME to aim a spotlight, so a lamp silently moved six
    metres and then lit the wrong place forever.

    That was live and undetected. The export it produced still contained a node
    called `mount:...`, so any check that asked "did the name survive?" passed —
    the name is not the contract, the POSITION is. So the world matrix of every
    object is snapshotted before the joins and restored after them, parents
    before children.

    A mesh parented under a `mount:` node IS joined away — `mount:` is
    documented as a FIXED attachment point and the game only reads its
    position, never drives it. If you need geometry to move, hang it on a
    `pivot:` or a `slide:`.

    Curve objects (hoses, ropes) are converted and joined too. They were
    skipped, because the grouping loop tested `o.type != 'MESH'`, so every
    unwelded hose was an uncounted draw call in a machine measured against a
    budget of 70.
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
        # A hose is a CURVE until something converts it. Do that first, or it
        # never reaches the grouping below and spends a draw call alone.
        for o in list(bpy.context.scene.objects):
            if o.type != 'CURVE' or is_dynamic(o):
                continue
            bpy.ops.object.select_all(action='DESELECT')
            o.select_set(True)
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.convert(target='MESH')

        # Snapshot every world transform BEFORE the first join. See the note
        # above: join() is what moves named nodes, and it moves them silently.
        bpy.context.view_layer.update()
        # Keyed by NAME, not by object: join() removes the objects it eats and
        # a held Python reference to one becomes a dead StructRNA that raises
        # on any attribute access, including the `is it still here?` test.
        snapshot = [(o.name, o.matrix_world.copy())
                    for o in bpy.context.scene.objects]

        groups = {}
        for o in list(bpy.context.scene.objects):
            if o.type != 'MESH' or is_dynamic(o):
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
                target = bpy.context.active_object
            else:
                target = objs[0]
            # Name a group of one the same way as a group of many. The prefix
            # is how a reader of the .glb tells joined static geometry from a
            # mesh that escaped the join; when only some of them carried it,
            # the distinction could not be read off the file.
            target.name = 'static:' + key

        # Put the named nodes back. Parents first: `matrix_world` is resolved
        # against whatever the parent is at that moment, so restoring a child
        # before its parent would bake in the parent's wrong position.
        def _depth(o):
            d, q = 0, o.parent
            while q is not None:
                d, q = d + 1, q.parent
            return d

        # A name that no longer resolves was eaten by a join. A join TARGET
        # has been renamed to `static:<mat>` and so does not resolve either —
        # correct to skip, because join() leaves the active object's own
        # transform alone; it is only the children of the eaten objects that
        # move.
        live = [(bpy.data.objects[n], m) for n, m in snapshot
                if n in bpy.data.objects]
        for o, m in sorted(live, key=lambda kv: _depth(kv[0])):
            o.matrix_world = m
        bpy.context.view_layer.update()

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
    # Count off the EVALUATED depsgraph. The previous version summed
    # `o.data.loop_triangles`, which is empty until something calls
    # calc_loop_triangles() and in any case ignores the bevel modifiers that
    # `export_apply=True` bakes in — so it reported 0 and was never printed.
    # `tools/glbinfo.mjs` counts the same things off the exported file and is
    # the authority; this line exists so a build that has gone wrong says so
    # without anyone having to run a second command.
    dg = bpy.context.evaluated_depsgraph_get()
    meshes = 0
    draws = 0
    tris = 0
    for o in bpy.context.scene.objects:
        if o.type not in {'MESH', 'CURVE', 'SURFACE', 'FONT'}:
            continue
        meshes += 1
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        if me is None:
            continue
        me.calc_loop_triangles()
        tris += len(me.loop_triangles)
        draws += max(1, len(me.materials))
        ev.to_mesh_clear()
    print('EXPORT_OK path=%s bytes=%d meshes=%d draws~=%d tris=%d' % (
        out_path, os.path.getsize(out_path), meshes, draws, tris))
    return out_path
