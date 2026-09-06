"""Export/profile the sonic module without changing shared Blender helpers.

blender --background --threads 3 --python tools/rigopt_sonic_build.py --
  --source blender/sonic_truck.py --out .rig-optimization/sonic/after.glb
Triangle profiles are pre-join diagnostics; tools/glbinfo.mjs remains the sole
exported dimension ruler. CPU renders are handled by rigopt_sonic_render.py.
"""
import argparse
import importlib.util
import json
import sys
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', default='blender/sonic_truck.py')
parser.add_argument('--out', required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
sys.path[:0] = [str(ROOT / 'blender'), str(ROOT / 'blender/lib')]
spec = importlib.util.spec_from_file_location('sonic_profile', ROOT / args.source)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
out = ROOT / args.out
out.parent.mkdir(parents=True, exist_ok=True)
original_bake = module.bake_modifiers


def profile_then_bake():
    bpy.context.view_layer.update()
    graph = bpy.context.evaluated_depsgraph_get()
    profile = []
    for obj in bpy.context.scene.objects:
        if obj.type not in ('MESH', 'CURVE'):
            continue
        evaluated = obj.evaluated_get(graph)
        mesh = evaluated.to_mesh()
        mesh.calc_loop_triangles()
        row = {'name': obj.name, 'triangles': len(mesh.loop_triangles),
               'vertices': len(mesh.vertices),
               'materials': [mat.name for mat in obj.data.materials]}
        if obj.type == 'CURVE':
            row['curve'] = {
                'radius': obj.data.bevel_depth,
                'bevel_resolution': obj.data.bevel_resolution,
                'resolution_u': obj.data.resolution_u,
                'splines': [[{'co': list(p.co), 'left': list(p.handle_left),
                             'right': list(p.handle_right)}
                            for p in spline.bezier_points]
                           for spline in obj.data.splines],
            }
        profile.append(row)
        evaluated.to_mesh_clear()
    out.with_suffix('.profile.json').write_text(json.dumps(profile, indent=2))
    original_bake()


module.bake_modifiers = profile_then_bake
module.build(str(out))
