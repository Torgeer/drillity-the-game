"""CPU Blender/exporter regressions; all fixture geometry is NOT SOURCED.

Run: blender --background --python-exit-code 1 --python blender/tests/check_rig_metadata.py
This checks contracts and attachment transforms, not machine dimensions; use
tools/glbinfo.mjs for every dimensional measurement of a rig.
"""
import json
import math
import os
import struct
import sys
import tempfile

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'lib'))
import rig as R
import anim


def declare(o, axis='y', lo=1.0, hi=4.0, direction='min'):
    for k, v in dict(travel_space='parent-local', travel_axis=axis,
                     travel_direction=direction, travel_min_m=lo,
                     travel_max_m=hi, travel_m=hi - lo).items():
        o[k] = v
    return o


def rejects(fn, label):
    try:
        fn()
    except ValueError:
        return
    raise AssertionError('accepted invalid metadata: ' + label)


def close(a, b, label, tol=1e-5):
    assert max(abs(x - y) for x, y in zip(a, b)) < tol, (label, tuple(a), tuple(b))


def main():
    R.reset()
    probe = declare(R.empty(R.NODE_SLIDE, 'probe', loc=(0, 0, 2)))
    for field in ('travel_min_m', 'travel_max_m', 'travel_space',
                  'travel_axis', 'travel_direction'):
        old = probe[field]
        del probe[field]
        rejects(lambda: R.travel_limits(probe), 'missing ' + field)
        probe[field] = old
    for field, values in {
        'travel_min_m': (True, '1', math.nan, math.inf, 4.0, 5.0),
        'travel_max_m': (False, '4', -math.inf, 1.0, 0.0),
        'travel_space': ('world', 'rest-relative'),
        'travel_axis': ('Y', 'w', ''),
        'travel_direction': ('down', ''),
        'travel_m': (True, '3', math.nan, 2.0),
    }.items():
        old = probe[field]
        for value in values:
            # Blender ID properties retain their assigned storage type; remove
            # before changing it so this tests the reader, not bpy's coercion.
            del probe[field]
            probe[field] = value
            rejects(lambda: R.travel_limits(probe), '%s=%r' % (field, value))
        del probe[field]
        probe[field] = old
    probe['travel_m'] = -3.0
    assert R.travel_limits(probe) == ('y', 1.0, 4.0)
    probe.name = 'unconsumed-travel'
    rejects(lambda: R.travel_limits(probe), 'travel metadata on a non-slide')
    probe.name = 'slide:probe'
    probe['travel_min_m'], probe['travel_max_m'] = -1e308, 1e308
    rejects(lambda: R.travel_limits(probe), 'finite endpoints with overflowing span')
    for k in list(probe.keys()):
        del probe[k]
    for value in (True, '3', math.inf, math.nan):
        probe['travel_m'] = value
        rejects(lambda: R.travel_limits(probe), 'invalid legacy travel_m')
        del probe['travel_m']
    probe['travel_m'] = -3.0
    anim._check_travel(probe, 'Z', -2.0, Vector((0, 0, 2)), 'legacy-negative')
    rejects(lambda: anim._check_travel(probe, 'Z', -4.0, Vector((0, 0, 2)),
                                       'legacy-negative'), 'legacy overshoot')
    probe['framing'] = 'include'
    rejects(lambda: R.framing_excluded(probe), 'unsupported framing')

    R.reset()
    parent = R.empty(R.NODE_PIVOT, 'rotated-parent', loc=(2, 3, 4),
                     rot=(0.3, 0.2, -0.4))
    slides = []
    for axis, loc, want in (
            ('x', (2, 0, 0), (2, 0, 0)),
            ('y', (0, 0, 2), (0, 2, 0)),
            ('z', (0, -2, 0), (0, 0, 2))):
        slide = declare(R.empty(R.NODE_SLIDE, axis, parent, loc), axis)
        slide['axis'] = 'authoring-extra-is-unchanged'
        R.box('moving-' + axis, (0.1, 0.1, 0.1), parent=slide)
        slides.append((slide.name, want))
        blender_axis, delta = {'x': ('X', 1), 'y': ('Z', 1), 'z': ('Y', -1)}[axis]
        anim._check_travel(slide, blender_axis, delta, Vector(loc), 'axis-' + axis)
        rejects(lambda: anim._check_travel(slide, blender_axis, delta * 3,
                                           Vector(loc), 'overshoot'), axis + ' overshoot')
    # CFA-style world-authored location plus parent inverse, no pose rewrite.
    offset = R.empty(R.NODE_PIVOT, 'offset-parent', loc=(0, 1, 0.6))
    bpy.context.view_layer.update()
    inverse = declare(R.empty(R.NODE_SLIDE, 'inverse', offset, (0, 1, 2.6)))
    inverse.matrix_parent_inverse = offset.matrix_world.inverted()
    R.box('moving-inverse', (0.1, 0.1, 0.1), parent=inverse)
    anim._check_travel(inverse, 'Z', 2, Vector(inverse.location), 'inverse-at-max')
    rejects(lambda: anim._check_travel(inverse, 'Z', 2.1, Vector(inverse.location),
                                       'inverse-over'), 'parent inverse overshoot')
    rejects(lambda: anim._check_travel(inverse, 'Y', 1, Vector(inverse.location),
                                       'wrong-axis'), 'wrong animation axis')
    slides.append((inverse.name, (0, 2, 0)))

    # An unmarked mesh host is still a coordinate frame. Joining it away may
    # preserve a descendant's rest world position while breaking its endpoints.
    # The other static must be created first, making it the active join target
    # and forcing the host to be consumed by the pre-fix implementation.
    R.box('other-static-host', (1, 1, 1), R.MAT_PAINT, loc=(-3, 2, 1))
    host = R.box('untagged-host', (1, 1, 1), R.MAT_PAINT,
                 loc=(10, -2, 5), rot=(0.3, 0.2, 0.4))
    group = R.empty('', 'unmarked-group', host, (1, 2, 3), (0.2, 0.1, -0.5))
    nested_slide = declare(R.empty(R.NODE_SLIDE, 'nested-frame', group, (0, 0, 2)))
    R.box('nested-moving-body', (0.2, 0.2, 0.2), R.MAT_PAINT, nested_slide)
    direct_slide = declare(R.empty(R.NODE_SLIDE, 'direct-frame', host, (0, 0, 2)))
    R.box('direct-moving-body', (0.2, 0.2, 0.2), R.MAT_PAINT, direct_slide)
    bpy.context.view_layer.update()
    nested_local = nested_slide.matrix_local.copy()
    direct_local = direct_slide.matrix_local.copy()
    direct_endpoints = [host.matrix_world @ Vector((0, 0, z)) for z in (1, 4)]
    nested_endpoints = [group.matrix_world @ Vector((0, 0, z)) for z in (1, 4)]
    slides.append((nested_slide.name, (0, 2, 0)))
    slides.append((direct_slide.name, (0, 2, 0)))

    # Same material, different framing, including a curve converted in finish.
    R.box('machine', (1, 1, 1), R.MAT_PAINT, loc=(0, 0, 0.5))
    site = R.empty('', 'site', loc=(20, 1, 0), rot=(0, 0, 0.4))
    site['framing'] = 'exclude'
    consumed = R.box('site-box', (1, 1, 1), R.MAT_PAINT, site, (2, 0, 0.5))
    R.hose('site-hose', [(0, 0, 0), (1, 0, 1)], mat=R.MAT_PAINT, parent=site)
    named_mesh = R.box('mount:mesh-attachment', (0.2, 0.2, 0.2), R.MAT_PAINT,
                       site, (0, 1, 2))
    named_mesh['cone_deg'] = 42.0
    custom = R.box('custom-metadata', (0.2, 0.2, 0.2), R.MAT_PAINT,
                   site, (0, 2, 2))
    custom['payload'] = {'source': 'synthetic fixture', 'value': 17}
    mount, aim = R.worklight('nested', consumed, (0, 0, 1))
    moving = R.empty(R.NODE_PIVOT, 'site-moving', consumed, (0, 1, 1))
    R.box('site-moving-body', (0.2, 0.2, 0.2), R.MAT_PAINT, moving)
    bpy.context.view_layer.update()
    names = [named_mesh.name, custom.name, mount.name, aim.name, moving.name]
    before = {n: bpy.data.objects[n].matrix_world.copy() for n in names}
    triangles = 0
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for o in bpy.context.scene.objects:
        if o.type not in ('MESH', 'CURVE'):
            continue
        evaluated = o.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        mesh.calc_loop_triangles()
        triangles += len(mesh.loop_triangles)
        evaluated.to_mesh_clear()
    with tempfile.TemporaryDirectory(prefix='drillity-rig-metadata-') as tmp:
        path = os.path.join(tmp, 'contract.glb')
        R.finish(path)
        close([v for row in direct_slide.matrix_local for v in row],
              [v for row in direct_local for v in row], 'direct local frame')
        for z, before_endpoint in zip((1, 4), direct_endpoints):
            close(direct_slide.parent.matrix_world @ Vector((0, 0, z)), before_endpoint,
                  'direct endpoint world transform')
        close([v for row in nested_slide.matrix_local for v in row],
              [v for row in nested_local for v in row], 'nested local frame')
        for z, before_endpoint in zip((1, 4), nested_endpoints):
            close(group.matrix_world @ Vector((0, 0, z)), before_endpoint,
                  'nested endpoint world transform')
        assert bpy.data.objects['untagged-host'].type == 'EMPTY'
        for n, matrix in before.items():
            live = bpy.data.objects[n]
            close([v for row in live.matrix_world for v in row],
                  [v for row in matrix for v in row], n + ' world transform')
            assert live['framing'] == 'exclude', n
        assert bpy.data.objects['mount:mesh-attachment'].type == 'EMPTY'
        assert bpy.data.objects['custom-metadata']['payload']['value'] == 17
        with open(path, 'rb') as f:
            raw = f.read()
        length = struct.unpack_from('<I', raw, 12)[0]
        gltf = json.loads(raw[20:20 + length])
        nodes = {n['name']: n for n in gltf['nodes']}
        primitives = [p for m in gltf['meshes'] for p in m['primitives']]
        assert len(primitives) == 9
        assert sum(gltf['accessors'][p['indices']]['count'] // 3
                   for p in primitives) == triangles, 'join lost visible geometry'
        for name, expected in slides:
            close(nodes[name]['translation'], expected, name + ' exported translation')
            assert nodes[name]['extras']['travel_space'] == 'parent-local'
        assert nodes['slide:nested-frame']['extras']['travel_min_m'] == 1.0
        assert nodes['slide:nested-frame']['extras']['travel_max_m'] == 4.0
        assert 'mesh' not in nodes['untagged-host']
        assert nodes['slide:z']['extras']['axis'] == 'authoring-extra-is-unchanged'
        assert nodes['mount:mesh-attachment']['extras']['cone_deg'] == 42.0
        assert nodes['custom-metadata']['extras']['payload']['value'] == 17
        included = nodes['static:paintedSteel']
        excluded = nodes['static:paintedSteel:framing-exclude']
        assert 'framing' not in included.get('extras', {})
        assert excluded['extras']['framing'] == 'exclude'
        assert included['mesh'] != excluded['mesh']
        assert all(nodes[n]['extras']['framing'] == 'exclude' for n in names)
    print('BLENDER_METADATA_OK: validation, signed legacy travel, X/Y/Z conversion, '
          'parent inverse, same-material framing, curves, named nodes and extras')


if __name__ == '__main__':
    main()
