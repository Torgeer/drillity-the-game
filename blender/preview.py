"""Render an exported .glb so a human (or a model) can LOOK at it.

Reading the JSON chunk proves the node graph and the draw calls. It proves
nothing about silhouette, proportion or whether a part ended up a metre in the
air — and REVIEW_RUBRIC.md axis 4 is an automatic fail for a primitive left
visible as a primitive. So: import the glb, three-quarter and side cameras,
a key/fill/rim rig, EEVEE, out to PNG.

    blender --background --python blender/preview.py -- public/models/pd55.glb shots/pd55
"""
import math
import os
import sys

import bpy
from mathutils import Vector


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def bounds():
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for o in bpy.context.scene.objects:
        if o.type != 'MESH':
            continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                lo[i] = min(lo[i], w[i])
                hi[i] = max(hi[i], w[i])
    return lo, hi


PALETTE = {                       # stand-ins for the runtime procedural kinds
    'paintedSteel': ((0.90, 0.60, 0.05, 1), 0.42, 0.0),
    'paintedDark':  ((0.15, 0.17, 0.21, 1), 0.50, 0.0),
    'rawSteel':     ((0.62, 0.64, 0.67, 1), 0.30, 1.0),
    'wornSteel':    ((0.36, 0.34, 0.32, 1), 0.62, 1.0),
    'castIron':     ((0.26, 0.26, 0.27, 1), 0.68, 1.0),
    'rubber':       ((0.07, 0.07, 0.08, 1), 0.85, 0.0),
    'glass':        ((0.12, 0.20, 0.24, 1), 0.10, 0.0),
    'chrome':       ((0.82, 0.84, 0.86, 1), 0.10, 1.0),
    'safetyStripe': ((0.85, 0.72, 0.10, 1), 0.55, 0.0),
}


def paint():
    for m in bpy.data.materials:
        base = m.name.split('.')[0]
        col, rough, metal = PALETTE.get(base, ((0.5, 0.5, 0.5, 1), 0.5, 0.0))
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        if bsdf is None:
            continue
        bsdf.inputs['Base Color'].default_value = col
        bsdf.inputs['Roughness'].default_value = rough
        bsdf.inputs['Metallic'].default_value = metal


def light(lo, hi):
    span = (hi - lo).length
    for name, loc, energy, size in (
        ('key',  (span * 0.8, -span * 0.9, span * 1.15), 9.0, 6.0),
        ('fill', (-span * 1.0, -span * 0.5, span * 0.35), 2.4, 10.0),
        ('rim',  (-span * 0.3, span * 1.1, span * 0.75), 5.0, 6.0),
    ):
        d = bpy.data.lights.new(name, 'AREA')
        d.energy = energy * span * span * 0.55
        d.size = size
        o = bpy.data.objects.new(name, d)
        o.location = loc
        ctr = (lo + hi) / 2
        v = ctr - Vector(loc)
        o.rotation_euler = v.to_track_quat('-Z', 'Y').to_euler()
        bpy.context.collection.objects.link(o)
    w = bpy.context.scene.world or bpy.data.worlds.new('w')
    bpy.context.scene.world = w
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (0.16, 0.19, 0.24, 1)
    w.node_tree.nodes['Background'].inputs[1].default_value = 1.6
    # a ground plane so the machine is not floating in a void
    bpy.ops.mesh.primitive_plane_add(size=span * 4, location=(0, 0, 0))
    g = bpy.context.active_object
    gm = bpy.data.materials.new('ground')
    gm.use_nodes = True
    gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = \
        (0.10, 0.10, 0.11, 1)
    gm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.95
    g.data.materials.append(gm)


def shoot(lo, hi, az, el, out, res=(900, 1400), ortho=False, fit=1.06):
    """Frame the actual box, not its diagonal. Framing on the diagonal is why
    the first pass rendered a 26 m machine as a hairline down the middle."""
    ctr = (lo + hi) / 2
    dy, dz = hi.y - lo.y, hi.z - lo.z
    dx = hi.x - lo.x
    reach = max(dx, dy, dz)
    ar = res[0] / float(res[1])
    need = max(max(dx, dy) / max(ar, 1e-6), dz) * fit
    cam = bpy.data.cameras.new('cam')
    if ortho:
        cam.type = 'ORTHO'
        cam.ortho_scale = max(dx, dy, dz * ar) * fit
        d = reach * 2.2
    else:
        cam.lens = 55
        d = need * 0.9 * (36.0 / cam.lens) * 1.35
        d = max(d, reach * 0.9)
    loc = Vector((math.cos(math.radians(az)) * math.cos(math.radians(el)),
                  math.sin(math.radians(az)) * math.cos(math.radians(el)),
                  math.sin(math.radians(el)))) * d + ctr
    o = bpy.data.objects.new('cam', cam)
    o.location = loc
    o.rotation_euler = (ctr - loc).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.collection.objects.link(o)
    sc = bpy.context.scene
    sc.camera = o
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.image_settings.file_format = 'PNG'
    sc.render.filepath = out
    try:
        sc.eevee.taa_render_samples = 24
    except Exception:
        pass
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(o, do_unlink=True)


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    glb = argv[0] if argv else 'public/models/pd55.glb'
    stem = argv[1] if len(argv) > 1 else 'shots/preview'
    os.makedirs(os.path.dirname(os.path.abspath(stem)), exist_ok=True)

    clear()
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
    lo, hi = bounds()
    print('BBOX lo=%s hi=%s  size=%s' % (
        tuple(round(v, 2) for v in lo), tuple(round(v, 2) for v in hi),
        tuple(round(hi[i] - lo[i], 2) for i in range(3))))
    paint()
    light(lo, hi)
    try:
        bpy.context.scene.render.engine = 'BLENDER_EEVEE_NEXT'
    except Exception:
        bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    bpy.context.scene.render.film_transparent = False

    shoot(lo, hi, -58, 12, stem + '-hero.png', res=(900, 1400))
    shoot(lo, hi, 0, 0, stem + '-side.png', res=(760, 1400), ortho=True)
    lo2 = Vector((lo.x, lo.y, -0.2))
    hi2 = Vector((hi.x, hi.y, 8.0))
    shoot(lo2, hi2, -55, 16, stem + '-lower.png', res=(1300, 900))
    shoot(lo2, hi2, 0, 0, stem + '-lower-side.png', res=(1300, 900), ortho=True)
    shoot(lo2, hi2, 180, 0, stem + '-cabside.png', res=(1300, 900), ortho=True)
    shoot(lo2, hi2, -145, 14, stem + '-cab34.png', res=(1300, 900))
    shoot(lo2, hi2, -125, 22, stem + '-deck.png', res=(1300, 900))
    lo3 = Vector((-2.0, 0.5, 1.0))
    hi3 = Vector((2.0, 5.5, 7.5))
    shoot(lo3, hi3, -60, 10, stem + '-kin.png', res=(1200, 1000))

main()
