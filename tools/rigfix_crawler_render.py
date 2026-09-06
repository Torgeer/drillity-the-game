"""Fixed CPU closeups of the actual before/after feed-lamp GLBs.

Usage: Blender --background --threads 2 --python-exit-code 1
    --python tools/rigfix_crawler_render.py -- --label before|after
Camera/light settings are authored QA choices. No geometry is hidden or moved.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--label', choices=['before', 'after'], required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
out = ROOT / '.rig-corrections/crawler'
glb = out / (args.label + '.glb')
glb_sha256 = hashlib.sha256(glb.read_bytes()).hexdigest()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(glb))
bpy.context.view_layer.update()
target = sum((bpy.data.objects['mount:feed-' + side].matrix_world.translation
              for side in ('l', 'r')), Vector()) / 2
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
sc.cycles.seed = 17
sc.render.threads_mode, sc.render.threads = 'FIXED', 2
sc.render.resolution_x, sc.render.resolution_y = 900, 700
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = 'PNG'
sc.world = bpy.data.worlds.new('qa-world')
sc.world.use_nodes = True
sc.world.node_tree.nodes['Background'].inputs[0].default_value = (.16, .19, .24, 1)
sc.world.node_tree.nodes['Background'].inputs[1].default_value = .8
for name, offset, energy, size in (
        ('key', (5, -7, 8), 1800, 7),
        ('fill', (-7, -3, 4), 1200, 8),
        ('rim', (-2, 5, 7), 1500, 6)):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy, data.shape, data.size = energy, 'DISK', size
    obj = bpy.data.objects.new(name, data)
    obj.location = target + Vector(offset)
    obj.rotation_euler = (target - obj.location).to_track_quat('-Z', 'Y').to_euler()
    sc.collection.objects.link(obj)
views = []
for view, offset in (('front', (3, -7, 2)), ('side', (-5, -4, 1.5))):
    data = bpy.data.cameras.new('qa-camera')
    data.type, data.ortho_scale = 'ORTHO', 2.45
    obj = bpy.data.objects.new('qa-camera', data)
    obj.location = target + Vector(offset)
    obj.rotation_euler = (target - obj.location).to_track_quat('-Z', 'Y').to_euler()
    sc.collection.objects.link(obj)
    sc.camera = obj
    sc.render.filepath = str(out / (args.label + '-' + view + '.png'))
    bpy.ops.render.render(write_still=True)
    views.append({'view': view, 'camera': list(obj.location), 'target': list(target),
                  'ortho_scale': data.ortho_scale, 'png': sc.render.filepath,
                  'png_sha256': hashlib.sha256(Path(sc.render.filepath).read_bytes()).hexdigest()})
    bpy.data.objects.remove(obj, do_unlink=True)
assert hashlib.sha256(glb.read_bytes()).hexdigest() == glb_sha256, 'input GLB changed while rendering'
(out / (args.label + '-render.json')).write_text(json.dumps({
    'glb_sha256': glb_sha256, 'engine': 'CYCLES', 'device': 'CPU',
    'threads': 2, 'samples': 16, 'resolution': [900, 700], 'views': views,
}, indent=2), encoding='utf-8')
