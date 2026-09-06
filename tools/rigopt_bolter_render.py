"""Fixed-view CPU renders of exported bolter geometry, not runtime performance.

blender --background --threads 2 --python tools/rigopt_bolter_render.py -- before
Camera/light settings are authored QA choices, not sourced machine dimensions.
"""
from pathlib import Path
import sys
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
label = sys.argv[sys.argv.index('--') + 1]
out = ROOT / '.rig-optimization/bolter'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(out / (label + '.glb')))
palette = {
    'paintedSteel': ((.90, .60, .05, 1), .42, 0),
    'paintedDark': ((.15, .17, .21, 1), .50, 0),
    'rawSteel': ((.62, .64, .67, 1), .30, 1),
    'wornSteel': ((.36, .34, .32, 1), .62, 1),
    'castIron': ((.26, .26, .27, 1), .68, 1),
    'rubber': ((.07, .07, .08, 1), .85, 0),
    'chrome': ((.82, .84, .86, 1), .10, 1),
    'safetyStripe': ((.85, .72, .10, 1), .55, 0),
    'galvanised': ((.52, .56, .60, 1), .50, 1),
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
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.cycles.seed = 0
scene.render.threads_mode = 'FIXED'
scene.render.threads = 2
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world = bpy.data.worlds.new('qa-world')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.16, .19, .24, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .8
for name, position, energy, size in (
        ('key', (8, -10, 13), 2800, 8),
        ('fill', (-9, -4, 6), 1800, 9),
        ('rim', (-2, 9, 10), 2100, 7)):
    light = bpy.data.lights.new(name, 'AREA')
    light.energy, light.size = energy, size
    obj = bpy.data.objects.new(name, light)
    scene.collection.objects.link(obj)
    obj.location = position
    obj.rotation_euler = (Vector((0, 0, 2)) - obj.location).to_track_quat('-Z', 'Y').to_euler()
for name, position, target, scale, resolution in (
        ('whole', (12, -14, 10), (0, 1.2, 2.3), 12.6, (1100, 800)),
        ('feed', (6, -8, 5), (0, -3.4, 2.7), 5.2, (900, 900)),
        ('deck', (-5, 1, 6), (0, .1, 1.1), 4.4, (900, 900))):
    camera = bpy.data.cameras.new(name)
    camera.type, camera.ortho_scale = 'ORTHO', scale
    obj = bpy.data.objects.new(name, camera)
    scene.collection.objects.link(obj)
    obj.location = position
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = obj
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.filepath = str(out / (label + '-' + name + '.png'))
    bpy.ops.render.render(write_still=True)
