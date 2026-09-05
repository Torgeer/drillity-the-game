"""Export isolated RC hose / quarry conveyor fixtures for glbinfo and visual QA.

Run with Blender, e.g. blender --background --python tools/verify_blender_wip.py
-- --before --render. --before reads the interrupted 4ddbdbf source via git;
without it, this reads the working tree. --render uses Cycles CPU, not the GPU.

This is an export fixture, NOT a second dimension ruler. Measure the resulting
GLBs with tools/glbinfo.mjs --parts. Output is ignored QA scratch in .bak/.
"""
import math
import os
import subprocess
import sys
import types

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
BEFORE = '--before' in ARGS
RENDER = '--render' in ARGS
LABEL = 'before' if BEFORE else 'after'
OUT = os.path.join(ROOT, '.bak', 'wip-finalization')
os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, os.path.join(ROOT, 'blender'))


def load_source(relative, name):
    path = os.path.join(ROOT, relative)
    if BEFORE:
        code = subprocess.check_output(
            ['git', 'show', '4ddbdbf:' + relative], cwd=ROOT).decode('utf-8')
    else:
        with open(path, encoding='utf-8') as source:
            code = source.read()
    module = types.ModuleType(name)
    module.__file__ = path
    exec(compile(code, path, 'exec'), module.__dict__)
    return module


def export(name):
    # Preserve individual parts for glbinfo's existing subtree ruler.
    for obj in bpy.context.scene.objects:
        if obj.type in {'MESH', 'CURVE'}:
            obj.name = 'static:' + obj.name
    path = os.path.join(OUT, name + '-' + LABEL + '.glb')
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB',
                             export_apply=True, export_yup=True,
                             export_cameras=False, export_lights=False,
                             export_extras=True)
    print('QA_FIXTURE=' + path)


def render(name, target, eye, ortho):
    if not RENDER:
        return
    for material in bpy.data.materials:
        material.use_nodes = True
        shader = material.node_tree.nodes.get('Principled BSDF')
        color = {'rubber': (0.04, 0.07, 0.11, 1),
                 'paintedDark': (0.24, 0.35, 0.43, 1),
                 'rawSteel': (0.55, 0.60, 0.64, 1),
                 'wornSteel': (0.52, 0.42, 0.29, 1)}.get(
                     material.name, (0.4, 0.4, 0.4, 1))
        shader.inputs['Base Color'].default_value = color
        shader.inputs['Roughness'].default_value = 0.6
        shader.inputs['Metallic'].default_value = 0.1
    target, eye = Vector(target), Vector(eye)
    camera = bpy.data.objects.new('qa-camera', bpy.data.cameras.new('qa-camera'))
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = ortho
    camera.location = eye
    camera.rotation_euler = (target - eye).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.collection.objects.link(camera)
    scene = bpy.context.scene
    scene.camera = camera
    world = bpy.data.worlds.new('qa-world')
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs[0].default_value = (0.55, 0.6, 0.7, 1)
    world.node_tree.nodes['Background'].inputs[1].default_value = 0.6
    scene.world = world
    light = bpy.data.objects.new('qa-key', bpy.data.lights.new('qa-key', 'AREA'))
    light.location = eye + Vector((0, 0, ortho * 0.5))
    light.rotation_euler = (target - light.location).to_track_quat('-Z', 'Y').to_euler()
    light.data.energy = ortho * ortho * 100
    light.data.shape = 'DISK'
    light.data.size = ortho
    bpy.context.collection.objects.link(light)
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 16
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = os.path.join(OUT, name + '-' + LABEL + '.png')
    bpy.ops.render.render(write_still=True)


rc = load_source('blender/rc_rig.py', 'qa_rc')
rc.reset()
rc.build_sample_hose()
export('rc-hose')
render('rc-hose', (1.7, -2.3, 3.3), (6.7, -8.3, 5.3), 4.5)

quarry = load_source('blender/sites/quarry_bench.py', 'qa_quarry')
quarry.S.reset()
quarry.build_plant()
for obj in list(bpy.context.scene.objects):
    if not obj.name.startswith('belt0-'):
        bpy.data.objects.remove(obj, do_unlink=True)
export('quarry-conveyor')
tx, ty = quarry.on_axis(54.5, -13.0)
# A side view of the first conveyor, based on its authored layout coordinates.
ex = tx + quarry.RIGHT[0] * 23.0
ey = ty + quarry.RIGHT[1] * 23.0
render('quarry-conveyor', (tx, ty, 3.5), (ex, ey, 9.0), 18.0)
