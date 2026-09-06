"""Compare actual prejoin Blender objects and export the live-collar correction.

Blender --background --threads 2 --python-exit-code 1 --python tools/verify_quarry_live_collar.py
Reads the frozen baseline from Git without changing it. Writes only this
checkout's public/models/sites/quarry-bench.glb and .bak/quarry-live-collar/.
This is a geometry equality regression/export fixture, not a dimensional CLI;
use tools/glbinfo.mjs to measure the emitted actual-vertex fixtures.
"""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import types

import bpy

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'blender/sites/quarry_bench.py'
BASELINE = '37f92a48abfd4ce3a20654359cb869dcd46ba25d'
OUT = ROOT / '.bak' / 'quarry-live-collar'
OUT.mkdir(parents=True, exist_ok=True)
CENTER_REMOVED = {'shot-collar-4-0', 'stem-4', 'flagpin-4', 'flag-4'}
REMOVED = CENTER_REMOVED | {'spill-11-4'}
PAYLOADS = {}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def load(code, name):
    module = types.ModuleType(name)
    module.__file__ = str(ROOT / SOURCE)
    exec(compile(code, module.__file__, 'exec'), module.__dict__)
    return module


def author(module):
    module.S.reset()
    module.build_highwall()
    module.build_shot()
    module.build_bench()
    module.build_plant()
    module.build_anchors()
    bpy.context.view_layer.update()


def signature(obj):
    """Exact data comparison; computes no bounds or dimensional conclusion."""
    data = {'type': obj.type, 'matrix': [list(row) for row in obj.matrix_world],
            'parent': obj.parent.name if obj.parent else None,
            'extras': {key: obj[key] for key in obj.keys()}}
    if obj.type == 'MESH':
        mesh = obj.data
        data['vertices'] = [list(v.co) for v in mesh.vertices]
        data['edges'] = [list(edge.vertices) for edge in mesh.edges]
        data['polygons'] = [(list(p.vertices), p.material_index, p.use_smooth)
                            for p in mesh.polygons]
        data['materials'] = [mat.name if mat else None for mat in mesh.materials]
        data['uv'] = {uv.name: [list(v.uv) for v in uv.data]
                      for uv in mesh.uv_layers}
        data['colors'] = {a.name: [list(v.color) for v in a.data]
                          for a in mesh.color_attributes}
        data['modifiers'] = [modifier.type for modifier in obj.modifiers]
        assert not obj.modifiers, 'Unexamined modifier in ' + obj.name
    else:
        assert obj.type == 'EMPTY', 'Unexamined object type: ' + obj.type
    digest = sha(json.dumps(data, sort_keys=True).encode())
    PAYLOADS[digest] = data
    return digest


def snapshot():
    return {obj.name: signature(obj) for obj in bpy.context.scene.objects}


def require_no_center_parts(objects):
    present = sorted(REMOVED.intersection(objects))
    if present:
        raise AssertionError('Live collar still has authored dressing: ' + ', '.join(present))


baseline_bytes = subprocess.check_output(['git', 'show', BASELINE + ':' + SOURCE], cwd=ROOT)
candidate_bytes = (ROOT / SOURCE).read_bytes()
before = load(baseline_bytes.decode('utf-8'), 'quarry_live_collar_baseline')
author(before)
before_objects = snapshot()
assert REMOVED.issubset(before_objects), 'Baseline does not reproduce all five offending objects'

# Keep the actual individual center meshes for the single approved ruler.
bpy.ops.object.select_all(action='DESELECT')
for name in CENTER_REMOVED:
    bpy.data.objects[name].select_set(True)
center_fixture = OUT / 'baseline-center-authored.glb'
bpy.ops.export_scene.gltf(filepath=str(center_fixture), export_format='GLB',
                         export_apply=True, export_yup=True, use_selection=True,
                         export_cameras=False, export_lights=False, export_extras=True)

negative_controls = []
try:
    require_no_center_parts(before_objects)
except AssertionError as failure:
    negative_controls.append({'case': 'unchanged baseline', 'rejected': True,
                              'reason': str(failure)})
else:
    raise AssertionError('Baseline negative control silently passed')

# Unchanged-source controls for Blender bevel UV arithmetic. Different reset
# histories produced one-ULP changes in crusher body/hopper UVs. Record five
# actual original-plant builds; no tolerance or geometry exception is applied.
repeat_plant = {}
for attempt in range(5):
    before.S.reset()
    before.build_plant()
    bpy.context.view_layer.update()
    for name, digest in snapshot().items():
        repeat_plant.setdefault(name, []).append(digest)

after = load(candidate_bytes.decode('utf-8'), 'quarry_live_collar_candidate')
author(after)
after_objects = snapshot()
require_no_center_parts(after_objects)
assert before_objects.keys() - after_objects.keys() == REMOVED
assert not after_objects.keys() - before_objects.keys(), 'Unexpected new objects'
changed = [name for name, value in after_objects.items() if before_objects[name] != value]
if changed:
    (OUT / 'unexpected-object-deltas.json').write_text(json.dumps({
        name: {'before': PAYLOADS[before_objects[name]], 'after': PAYLOADS[after_objects[name]]}
        for name in changed}, indent=2), encoding='utf-8')
uv_controls = {}
for name in changed:
    first, candidate = PAYLOADS[before_objects[name]], PAYLOADS[after_objects[name]]
    assert {k: v for k, v in first.items() if k != 'uv'} == {
        k: v for k, v in candidate.items() if k != 'uv'}, 'Non-UV data changed: ' + name
    assert name in repeat_plant, 'UV changed outside unchanged-source plant controls: ' + name
    controls = [first] + [PAYLOADS[digest] for digest in repeat_plant[name]]
    assert after_objects[name] in {before_objects[name], *repeat_plant[name]}, (
        'Complete UV payload differs from every actual unchanged-source control: ' + name)
    assert all({k: v for k, v in p.items() if k != 'uv'} == {
        k: v for k, v in first.items() if k != 'uv'} for p in controls)
    assert first['uv'].keys() == candidate['uv'].keys()
    deltas = []
    for layer, values in first['uv'].items():
        assert len(values) == len(candidate['uv'][layer])
        for index, pair in enumerate(values):
            for component, value in enumerate(pair):
                other = candidate['uv'][layer][index][component]
                observed = sorted({p['uv'][layer][index][component] for p in controls})
                assert other in observed, 'UV differs from every actual unchanged-source control: ' + name
                if value != other:
                    deltas.append({'layer': layer, 'loop': index, 'component': component,
                                   'before': value, 'after': other, 'delta': other - value,
                                   'observed_original_values': observed})
    uv_controls[name] = {'original_repeated_signatures': repeat_plant[name],
                         'component_deltas': deltas,
                         'max_abs_uv_delta': max((abs(d['delta']) for d in deltas), default=0)}
assert len(after_objects) > 0, 'Empty candidate'
for name in sorted(REMOVED):
    try:
        require_no_center_parts({**after_objects, name: before_objects[name]})
    except AssertionError as failure:
        negative_controls.append({'case': 'reinsert ' + name, 'rejected': True,
                                  'reason': str(failure)})
    else:
        raise AssertionError('Reinserted center object passed: ' + name)

export_path = ROOT / 'public' / 'models' / 'sites' / 'quarry-bench.glb'
export_path.parent.mkdir(parents=True, exist_ok=True)
after.S.finish(str(export_path))
assert (ROOT / SOURCE).read_bytes() == candidate_bytes, 'Source changed during export'
report = {
    'scope': 'Actual authored prejoin data equality; no rendered acceptance or dimensional clearance claim',
    'baseline_commit': BASELINE,
    'baseline_source_sha256': sha(baseline_bytes),
    'candidate_source_sha256': sha(candidate_bytes),
    'shared_source_sha256': {p: sha((ROOT / p).read_bytes()) for p in
                             ['blender/lib/site.py', 'blender/lib/rig.py', 'src/world/terrain.js']},
    'baseline_object_count': len(before_objects), 'candidate_object_count': len(after_objects),
    'removed_exactly': sorted(REMOVED), 'unchanged_objects': len(after_objects),
    'bit_exact_surviving_objects': len(after_objects) - len(changed),
    'changed_noncenter_objects': changed,
    'uv_same_source_controls': uv_controls,
    'non_uv_data_exactly_equal': True,
    'before_objects': before_objects, 'after_objects': after_objects,
    'negative_controls': negative_controls,
    'asset': str(export_path), 'asset_sha256': sha(export_path.read_bytes()),
    'center_fixture': str(center_fixture), 'center_fixture_sha256': sha(center_fixture.read_bytes()),
}
report_path = OUT / 'authoring-report.json'
report_path.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print('QUARRY_LIVE_COLLAR_PASS ' + json.dumps({key: report[key] for key in
      ['baseline_object_count', 'candidate_object_count', 'removed_exactly',
       'unchanged_objects', 'candidate_source_sha256', 'asset_sha256']}))
print('QUARRY_LIVE_COLLAR_REPORT=' + str(report_path))
