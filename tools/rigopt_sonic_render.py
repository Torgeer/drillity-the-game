"""Fixed-camera Cycles CPU comparisons of actual sonic GLB exports.

blender --background --threads 3 --python tools/rigopt_sonic_render.py --
  .rig-optimization/sonic/before.glb .rig-optimization/sonic/before
These are visual mesh comparisons with material stand-ins, not game captures.
No dimension measurement is implemented here; cameras stay fixed across pairs.
"""
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
glb, stem = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT / glb))
palette = {
    'paintedSteel': ((0.90, 0.60, 0.05, 1), 0.42, 0),
    'paintedDark': ((0.15, 0.17, 0.21, 1), 0.50, 0),
    'rawSteel': ((0.62, 0.64, 0.67, 1), 0.30, 1),
    'wornSteel': ((0.36, 0.34, 0.32, 1), 0.62, 1),
    'castIron': ((0.26, 0.26, 0.27, 1), 0.68, 1),
    'rubber': ((0.07, 0.07, 0.08, 1), 0.85, 0),
    'glass': ((0.12, 0.20, 0.24, 1), 0.10, 0),
    'chrome': ((0.82, 0.84, 0.86, 1), 0.10, 1),
    'safetyStripe': ((0.85, 0.72, 0.10, 1), 0.55, 0),
}
for material in bpy.data.materials:
    material.use_nodes = True
    color, rough, metal = palette[material.name]
    node = material.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value = color
    node.inputs['Roughness'].default_value = rough
    node.inputs['Metallic'].default_value = metal
    node.inputs['Transmission Weight'].default_value = 0
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.cycles.seed = 0
scene.render.threads_mode = 'FIXED'
scene.render.threads = 3
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world = bpy.data.worlds.new('comparison-world')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.16, .19, .24, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .7
for name, location, energy, size in [
    ('key', (7, -8, 12), 2400, 7),
    ('fill', (-8, -4, 8), 2000, 8),
    ('rim', (-5, 10, 10), 3000, 6),
]:
    light = bpy.data.lights.new(name, 'AREA')
    light.energy, light.size = energy, size
    obj = bpy.data.objects.new(name, light)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector((0, 2, 3)) - obj.location).to_track_quat('-Z', 'Y').to_euler()
for name, location, target, scale, resolution in [
    ('whole', (11, -16, 10), (0, 3.0, 3.7), 10.2, (900, 1000)),
    ('head', (-4, -6, 4.1), (0, .3, 2.0), 3.5, (900, 900)),
    ('hoses', (-4, 6, 5.5), (0, .6, 3.5), 4.8, (900, 1000)),
]:
    camera = bpy.data.cameras.new(name)
    camera.type, camera.ortho_scale = 'ORTHO', scale
    obj = bpy.data.objects.new(name, camera)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = obj
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.filepath = str(ROOT / (stem + '-' + name + '.png'))
    bpy.ops.render.render(write_still=True)
