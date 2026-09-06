"""Render actual crawler GLBs with fixed cameras and Cycles CPU only.

These neutral material stand-ins assess geometry, not game appearance or FPS.
Camera coordinates and light levels are authored QA choices, not rig dimensions.
"""
import argparse
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
args = argparse.ArgumentParser()
args.add_argument('--label', required=True)
args.add_argument('--views', nargs='+', default=['hero', 'tracks', 'feed', 'hoses'])
opts = args.parse_args(sys.argv[sys.argv.index('--') + 1:])
out = ROOT / '.rig-optimization' / 'crawler'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(out / (opts.label + '.glb')))
palette = {
    'paintedSteel': ((.90, .60, .05, 1), .42, 0),
    'paintedDark': ((.15, .17, .21, 1), .50, 0),
    'rawSteel': ((.62, .64, .67, 1), .30, 1),
    'wornSteel': ((.36, .34, .32, 1), .62, 1),
    'castIron': ((.26, .26, .27, 1), .68, 1),
    'rubber': ((.07, .07, .08, 1), .85, 0),
    'glass': ((.12, .20, .24, 1), .10, 0),
    'chrome': ((.82, .84, .86, 1), .10, 1),
    'safetyStripe': ((.85, .72, .10, 1), .55, 0),
}
for mat in bpy.data.materials:
    col, rough, metal = palette[mat.name.split('.')[0]]
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = col
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    bsdf.inputs['Transmission Weight'].default_value = 0
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 16
sc.cycles.use_denoising = True
sc.cycles.seed = 11
sc.render.threads_mode = 'FIXED'
sc.render.threads = 2
sc.render.resolution_x, sc.render.resolution_y = 1100, 800
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = 'PNG'
sc.world = bpy.data.worlds.new('qa-world')
sc.world.use_nodes = True
sc.world.node_tree.nodes['Background'].inputs[0].default_value = (.16, .19, .24, 1)
sc.world.node_tree.nodes['Background'].inputs[1].default_value = .8
for name, pos, energy, size in (
        ('key', (8, -10, 13), 2800, 8),
        ('fill', (-9, -4, 6), 1800, 9),
        ('rim', (-2, 9, 10), 2100, 7)):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy, data.shape, data.size = energy, 'DISK', size
    obj = bpy.data.objects.new(name, data)
    obj.location = pos
    obj.rotation_euler = (Vector((0, -2, 2)) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    sc.collection.objects.link(obj)
views = {
    'hero': ((13, -17, 10), (0, -2.3, 2.8), 11.9),
    'tracks': ((5, -4, 3), (0, 0, .65), 5.7),
    'feed': ((6, -11, 6), (-.5, -5, 3.6), 5.5),
    'hoses': ((-7, -2, 6), (-.5, -5, 3.6), 5.5),
}
for view in opts.views:
    pos, target, scale = views[view]
    data = bpy.data.cameras.new('qa-camera')
    data.type, data.ortho_scale = 'ORTHO', scale
    obj = bpy.data.objects.new('qa-camera', data)
    obj.location = pos
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    sc.collection.objects.link(obj)
    sc.camera = obj
    sc.render.filepath = str(out / (opts.label + '-' + view + '.png'))
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(obj, do_unlink=True)
