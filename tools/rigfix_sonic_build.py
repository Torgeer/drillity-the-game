"""Fresh sonic export with exact source/export identity for metadata fixes.

blender --background --threads 2 --python tools/rigfix_sonic_build.py --
  --label before --source .rig-corrections/before/source/sonic_truck.py
Only .rig-corrections/sonic is written; public models stay frozen.
"""
import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import bpy

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--label', choices=['before', 'after'], required=True)
parser.add_argument('--source', default='blender/sonic_truck.py')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
source = (ROOT / args.source).resolve()
out = ROOT / '.rig-corrections/sonic'
out.mkdir(parents=True, exist_ok=True)
sys.path[:0] = [str(ROOT / 'blender'), str(ROOT / 'blender/lib')]
source_bytes = source.read_bytes()
shared_rig_bytes = (ROOT / 'blender/lib/rig.py').read_bytes()
shared_libraries = {str(path.relative_to(ROOT)): path.read_bytes()
                    for path in sorted((ROOT / 'blender/lib').glob('*.py'))}
spec = importlib.util.spec_from_file_location('sonic_metadata_source', source)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
assert source.read_bytes() == source_bytes, 'source changed during import'
glb = out / (args.label + '.glb')
module.build(str(glb))
assert source.read_bytes() == source_bytes, 'source changed during export'
assert (ROOT / 'blender/lib/rig.py').read_bytes() == shared_rig_bytes, 'shared rig changed during export'
assert {str(path.relative_to(ROOT)): path.read_bytes()
        for path in sorted((ROOT / 'blender/lib').glob('*.py'))} == shared_libraries, 'shared library input changed'
(out / (args.label + '-source.py')).write_bytes(source_bytes)
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = {
    'source': str(source), 'source_sha256': sha(source_bytes),
    'source_snapshot': str(out / (args.label + '-source.py')),
    'export': str(glb), 'export_sha256': sha(glb.read_bytes()),
    'export_bytes': glb.stat().st_size, 'blender_version': bpy.app.version_string,
    'shared_rig_sha256': sha(shared_rig_bytes),
    'shared_libraries_sha256': {path: sha(data) for path, data in shared_libraries.items()},
}
(out / (args.label + '-identity.json')).write_text(json.dumps(manifest, indent=2) + '\n')
print('SONIC_METADATA_IDENTITY ' + json.dumps(manifest))
