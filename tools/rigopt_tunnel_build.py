"""Rebuild a tunnel module and audit its evaluated pre-join components.

Run in Blender with --background --threads 2 --python this_file --
  --source <module.py> --out <export.glb> --audit <components.json>
This records tessellation and attachment contracts, never machine dimensions;
tools/glbinfo.mjs remains the sole dimension ruler for actual exported vertices.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import sys

import bpy


ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / 'blender'), str(ROOT / 'blender' / 'lib')]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True)
    parser.add_argument('--out', required=True)
    parser.add_argument('--audit', required=True)
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    source = Path(args.source).resolve()
    spec = importlib.util.spec_from_file_location('tunnel_audit_source', source)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    original_bake = module.bake_all
    audit = {'source': str(source), 'components': [], 'contracts': {}}

    def inspect_then_bake():
        bpy.context.view_layer.update()
        graph = bpy.context.evaluated_depsgraph_get()
        for obj in sorted(bpy.context.scene.objects, key=lambda item: item.name):
            if obj.name.startswith(('pivot:', 'slide:', 'mount:', 'aim:')):
                audit['contracts'][obj.name] = {
                    'parent': obj.parent.name if obj.parent else None,
                    'world': [value for row in obj.matrix_world for value in row],
                    'extras': dict(obj.items()),
                }
            if obj.type not in ('MESH', 'CURVE'):
                continue
            evaluated = obj.evaluated_get(graph)
            mesh = evaluated.to_mesh()
            mesh.calc_loop_triangles()
            entry = {
                'name': obj.name, 'type': obj.type,
                'triangles': len(mesh.loop_triangles),
                'vertices': len(mesh.vertices),
                'materials': [material.name for material in obj.data.materials],
                'parent': obj.parent.name if obj.parent else None,
                'modifiers': [
                    {'type': modifier.type, 'width': modifier.width,
                     'segments': modifier.segments}
                    for modifier in obj.modifiers if modifier.type == 'BEVEL'],
            }
            if obj.type == 'CURVE':
                entry['curve'] = {
                    'radius': obj.data.bevel_depth,
                    'bevel_resolution': obj.data.bevel_resolution,
                    'resolution_u': obj.data.resolution_u,
                    'splines': [[
                        {'co': list(point.co), 'left': list(point.handle_left),
                         'right': list(point.handle_right)}
                        for point in spline.bezier_points]
                        for spline in obj.data.splines],
                }
            audit['components'].append(entry)
            evaluated.to_mesh_clear()
        original_bake()

    module.bake_all = inspect_then_bake
    output = Path(args.out).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    module.build(str(output))
    if not output.is_file() or output.stat().st_size == 0:
        raise RuntimeError('No exported GLB')
    audit['component_triangles'] = sum(item['triangles'] for item in audit['components'])
    Path(args.audit).resolve().write_text(json.dumps(audit, indent=2) + '\n', encoding='utf-8')
    print('TUNNEL_AUDIT components=%d triangles=%d contracts=%d' % (
        len(audit['components']), audit['component_triangles'], len(audit['contracts'])))


if __name__ == '__main__':
    main()
