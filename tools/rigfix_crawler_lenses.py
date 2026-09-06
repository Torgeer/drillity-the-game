"""Prove authored feed-lens vertices survive join/reparent and GLB export.

Blender CPU: --background --threads 2 --python-exit-code 1
    --python tools/rigfix_crawler_lenses.py
    -- --label before --source .rig-corrections/before/source/crawler_th.py
       --expect displaced
Use --label after --expect preserved for current source. Dimension/envelope
reports belong exclusively to tools/glbinfo.mjs; this compares vertex identity.
"""
import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'blender'))
sys.path.insert(0, str(ROOT / 'blender' / 'lib'))
parser = argparse.ArgumentParser()
parser.add_argument('--label', choices=['before', 'after'], required=True)
parser.add_argument('--source', type=Path, default=ROOT / 'blender/crawler_th.py')
parser.add_argument('--expect', choices=['displaced', 'preserved'], required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
source = args.source if args.source.is_absolute() else ROOT / args.source
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
source_sha256 = sha(source)
library_hashes = {str(p.relative_to(ROOT)): sha(p)
                  for p in sorted((ROOT / 'blender/lib').glob('*.py'))}
out = ROOT / '.rig-corrections/crawler'
out.mkdir(parents=True, exist_ok=True)
glb = out / (args.label + '.glb')
spec = importlib.util.spec_from_file_location('crawler_lens_source', source)
machine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(machine)
original_weld = machine.weld
authored = {}


def world_vertices(obj):
    return [list(obj.matrix_world @ vertex.co) for vertex in obj.data.vertices]


def observe_weld(objects, label, parent):
    if label == 'feed-cradle':
        bpy.context.view_layer.update()
        for obj in objects:
            if obj.name in ('feed-l_lens', 'feed-r_lens'):
                authored[obj.name] = {
                    'parent': obj.parent.name,
                    'world_matrix': [list(row) for row in obj.matrix_world],
                    'vertices': world_vertices(obj),
                }
    return original_weld(objects, label, parent)


machine.weld = observe_weld
machine.build(str(glb))
assert set(authored) == {'feed-l_lens', 'feed-r_lens'}, 'did not observe both authored lenses'
bpy.context.view_layer.update()
joined = world_vertices(bpy.data.objects['feed-cradle:glass'])
# Reimport the actual exported GLB. Blender restores its Z-up convention; no
# AABB approximation, independent dimension ruler or guessed axis conversion.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(glb))
bpy.context.view_layer.update()
actual_obj = bpy.data.objects.get('feed-cradle:glass')
assert actual_obj is not None and actual_obj.type == 'MESH', 'export lost the feed lens mesh'
actual = world_vertices(actual_obj)
expected = [p for obj in authored.values() for p in obj['vertices']]


def max_nearest_distance(points, candidates):
    assert points and candidates, 'refusing empty vertex comparison'
    return max(min((Vector(p) - Vector(q)).length for q in candidates) for p in points)


def compare_vertex_sets(expected_points, actual_points):
    # GLB can split one spatial vertex for face normals. Bidirectional nearest
    # matching tolerates those duplicates while rejecting missing/added points.
    forward = max_nearest_distance(expected_points, actual_points)
    reverse = max_nearest_distance(actual_points, expected_points)
    return {'authored_to_actual_max_m': forward,
            'actual_to_authored_max_m': reverse,
            'match': max(forward, reverse) <= 0.00001}


assert sha(source) == source_sha256, 'source changed during build; refusing mislabelled export'
assert all(sha(ROOT / p) == digest for p, digest in library_hashes.items()), \
    'shared library changed during build; refusing mislabelled export'
report = {
    'source': str(source), 'source_sha256': source_sha256,
    'library_sha256': library_hashes,
    'glb': str(glb), 'glb_sha256': sha(glb),
    'authored_lenses': authored,
    'authored_vertex_count': len(expected),
    'joined_vertex_count': len(joined), 'exported_vertex_count': len(actual),
    'joined_comparison': compare_vertex_sets(expected, joined),
    'exported_comparison': compare_vertex_sets(expected, actual),
    'exported_vertices': actual,
    'expectation': args.expect,
    'comparison_tolerance_m': 0.00001,
}
(out / (args.label + '-lenses.json')).write_text(json.dumps(report, indent=2), encoding='utf-8')
for stage in ('joined_comparison', 'exported_comparison'):
    assert report[stage]['match'] == (args.expect == 'preserved'), (stage, report[stage], args.expect)
print('LENS_PROOF', args.label, json.dumps({k: report[k] for k in (
    'source_sha256', 'glb_sha256', 'authored_vertex_count',
    'joined_vertex_count', 'exported_vertex_count', 'joined_comparison', 'exported_comparison')}))
