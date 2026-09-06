"""CPU Cycles comparison of actual tunnel GLBs with identical authored cameras.

blender --background --threads 2 --python tools/rigopt_tunnel_render.py --
  <input.glb> <output-stem>
These fixed framing choices are visual QA settings, not dimension measurements.
"""
from pathlib import Path
import sys

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
PALETTE = {
    'paintedSteel': ((0.90, 0.60, 0.05, 1), 0.42, 0.0),
    'paintedDark': ((0.15, 0.17, 0.21, 1), 0.50, 0.0),
    'rawSteel': ((0.62, 0.64, 0.67, 1), 0.30, 1.0),
    'wornSteel': ((0.36, 0.34, 0.32, 1), 0.62, 1.0),
    'rubber': ((0.07, 0.07, 0.08, 1), 0.85, 0.0),
    'chrome': ((0.82, 0.84, 0.86, 1), 0.10, 1.0),
    'safetyStripe': ((0.85, 0.72, 0.10, 1), 0.55, 0.0),
}


def main():
    glb, stem = sys.argv[sys.argv.index('--') + 1:]
    glb, stem = ROOT / glb, ROOT / stem
    stem.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(glb))
    for material in bpy.data.materials:
        if material.name not in PALETTE:
            raise RuntimeError('Unrecognized material: ' + material.name)
        color, roughness, metallic = PALETTE[material.name]
        material.use_nodes = True
        shader = material.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Base Color'].default_value = color
        shader.inputs['Roughness'].default_value = roughness
        shader.inputs['Metallic'].default_value = metallic
        shader.inputs['Transmission Weight'].default_value = 0
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 20
    scene.cycles.use_denoising = True
    scene.cycles.seed = 17
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 2
    scene.render.resolution_x = 1100
    scene.render.resolution_y = 700
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.world = bpy.data.worlds.new('comparison-world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (0.16, 0.19, 0.24, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = 0.8
    for name, position, energy, size in (
        ('key', (5, 3, 10), 2200, 5),
        ('fill', (-5, -4, 6), 1400, 6),
        ('rim', (1, -7, 8), 1800, 5),
    ):
        data = bpy.data.lights.new(name, 'AREA')
        data.energy, data.size = energy, size
        obj = bpy.data.objects.new(name, data)
        obj.location = position
        obj.rotation_euler = (Vector((0, 1, 0.5)) - obj.location).to_track_quat('-Z', 'Y').to_euler()
        scene.collection.objects.link(obj)
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, -0.04))
    ground = bpy.context.active_object
    material = bpy.data.materials.new('qa-ground')
    material.diffuse_color = (0.09, 0.10, 0.11, 1)
    ground.data.materials.append(material)
    for name, position, target, scale in (
        ('hero', (12, -13, 9), (0, 1.8, 0.8), 12.5),
        ('feeds', (5.0, 6.6, 3.3), (0, 4.55, 0.95), 5.8),
        ('rear', (5, -7, 4.5), (0, -0.9, 0.85), 6.6),
    ):
        data = bpy.data.cameras.new('camera-' + name)
        data.type, data.ortho_scale = 'ORTHO', scale
        obj = bpy.data.objects.new('camera-' + name, data)
        obj.location = position
        obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()
        scene.collection.objects.link(obj)
        scene.camera = obj
        scene.render.filepath = str(stem) + '-' + name + '.png'
        bpy.ops.render.render(write_still=True)
        bpy.data.objects.remove(obj, do_unlink=True)


if __name__ == '__main__':
    main()
