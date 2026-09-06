"""CPU-only crawler export/profile; dimensions are measured by glbinfo.mjs.

Run from Blender: --background --threads 2 --python tools/rigopt_crawler_build.py
    -- --label before
Generated evidence lives in ignored .rig-optimization/crawler/.
"""
import argparse
import importlib.util
import json
import sys
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'blender'))
sys.path.insert(0, str(ROOT / 'blender' / 'lib'))
args = argparse.ArgumentParser()
args.add_argument('--label', required=True)
args.add_argument('--source', type=Path, default=ROOT / 'blender' / 'crawler_th.py')
opts = args.parse_args(sys.argv[sys.argv.index('--') + 1:])
source = opts.source if opts.source.is_absolute() else ROOT / opts.source
spec = importlib.util.spec_from_file_location('crawler_profile_source', source.resolve())
machine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(machine)
out = ROOT / '.rig-optimization' / 'crawler'
out.mkdir(parents=True, exist_ok=True)
created = []
reparented = []


def record(fn, original):
    def wrapped(*a, **kw):
        obj = original(*a, **kw)
        obj.data.calc_loop_triangles()
        created.append({'name': obj.name, 'helper': fn,
                        'triangles': len(obj.data.loop_triangles),
                        'vertices': len(obj.data.vertices)})
        return obj
    return wrapped


for helper in ('bx', 'tb', 'clone', 'curve_to_mesh'):
    setattr(machine, helper, record(helper, getattr(machine, helper)))

original_weld = machine.weld


def profiled_weld(objects, label, parent):
    bpy.context.view_layer.update()
    transforms = {o.as_pointer(): (o.name, o.matrix_world.copy()) for o in objects}
    result = original_weld(objects, label, parent)
    bpy.context.view_layer.update()
    for obj in result:
        old_name, matrix = transforms[obj.as_pointer()]
        delta = max(abs(matrix[r][c] - obj.matrix_world[r][c])
                    for r in range(4) for c in range(4))
        if delta > 1e-6:
            reparented.append({'assembly': label, 'source': old_name,
                               'max_world_matrix_delta': delta})
    return result


machine.weld = profiled_weld
machine.build(str(out / (opts.label + '.glb')))
bpy.context.view_layer.update()
nodes = []
for obj in sorted(bpy.data.objects, key=lambda o: o.name):
    if obj.name.startswith(('pivot:', 'slide:', 'mount:', 'aim:')):
        nodes.append({'name': obj.name,
                      'parent': obj.parent.name if obj.parent else None,
                      'world': [list(row) for row in obj.matrix_world],
                      'extras': {k: obj[k].to_list() if hasattr(obj[k], 'to_list') else obj[k]
                                 for k in obj.keys()}})
(out / (opts.label + '-profile.json')).write_text(json.dumps({
    'created': created, 'weld_matrix_changes': reparented, 'named_nodes': nodes
}, indent=2), encoding='utf-8')
bpy.ops.wm.save_as_mainfile(filepath=str(out / (opts.label + '.blend')))
print('CRAWLER_PROFILE', opts.label, 'created', len(created),
      'weld_matrix_changes', reparented)
