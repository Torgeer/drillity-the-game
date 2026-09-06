"""Export/profile the bolter before joining; dimensions belong to glbinfo.mjs.

blender --background --threads 2 --python tools/rigopt_bolter.py -- OUTPUT [SOURCE]
SOURCE may be the saved unchanged module for a repeatable before comparison.
"""
import importlib.util
import json
from pathlib import Path
import sys

import bpy

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / 'blender'), str(ROOT / 'blender/lib')]
args = sys.argv[sys.argv.index('--') + 1:]
out = Path(args[0]).resolve()
source = Path(args[1]).resolve() if len(args) > 1 else ROOT / 'blender/bolter.py'
spec = importlib.util.spec_from_file_location('rigopt_bolter_model', source)
model = importlib.util.module_from_spec(spec)
spec.loader.exec_module(model)
original_join = model.join_by_mat
profile = []


def profile_then_join(*args, **kwargs):
    if not profile:
        bpy.context.view_layer.update()
        depsgraph = bpy.context.evaluated_depsgraph_get()
        for obj in bpy.context.scene.objects:
            if obj.type not in ('MESH', 'CURVE'):
                continue
            evaluated = obj.evaluated_get(depsgraph)
            mesh = evaluated.to_mesh()
            if mesh is None:
                raise RuntimeError('Unmeasurable geometry: ' + obj.name)
            mesh.calc_loop_triangles()
            row = {'name': obj.name, 'type': obj.type,
                   'triangles': len(mesh.loop_triangles),
                   'materials': [m.name for m in mesh.materials]}
            if obj.type == 'CURVE':
                row.update(resolution=obj.data.resolution_u,
                           bevel_resolution=obj.data.bevel_resolution)
            profile.append(row)
            evaluated.to_mesh_clear()
        profile.sort(key=lambda row: (-row['triangles'], row['name']))
    return original_join(*args, **kwargs)


model.join_by_mat = profile_then_join
out.parent.mkdir(parents=True, exist_ok=True)
model.build(str(out))
if not profile or not out.is_file():
    raise RuntimeError('Export/profile was empty')
out.with_suffix('.profile.json').write_text(json.dumps(profile, indent=2))
print('RIGOPT_PROFILE objects=%d triangles=%d' %
      (len(profile), sum(row['triangles'] for row in profile)))
