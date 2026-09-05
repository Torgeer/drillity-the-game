"""Build and verify Blender's UI curve authority, then export CSS and JS.

Run: blender --background --factory-startup --python-exit-code 1
     --python blender/ui_motion.py -- [--check] [--blend path.blend]
--check verifies checked-in exports without changing them. --blend optionally
saves the real graph-editor actions for visual authoring/review.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'blender/lib'))
import curves


def digest(path):
    # Git may convert line endings; source identity is text identity.
    return hashlib.sha256(path.read_text(encoding='utf-8').encode()).hexdigest()


def export(check=False, blend=None):
    authority = curves.author(bpy)
    if len(authority) != 11:
        raise AssertionError('Expected all eleven authored motion curves')
    rows = []
    for c in curves.build():
        fc = authority[c.name]
        keys = list(fc.keyframe_points)
        # Read the actual stored Blender graph back. These handles, including
        # float32 quantisation, are what both web consumers receive.
        c.segments = [tuple((a.co.x / 100, a.co.y,
                            a.handle_right.x / 100, a.handle_right.y,
                            b.handle_left.x / 100, b.handle_left.y,
                            b.co.x / 100, b.co.y))
                      for a, b in zip(keys, keys[1:])]
        c.stops = [(k.co.x / 100, k.co.y) for k in keys[1:-1]]
        c.fit_err = max(c._seg_err(s) for s in c.segments)
        c.css, c.css_err = c._fit_css()
        c.validate()
        actual = [float(fc.evaluate(100 * i / (curves.SAMPLES - 1)))
                  for i in range(curves.SAMPLES)]
        errors = [abs(v - c.eval(i / (curves.SAMPLES - 1)))
                  for i, v in enumerate(actual)]
        blender_error = max(errors)
        if blender_error > curves.BLENDER_ERR_MAX:
            raise AssertionError('%s Blender/JS evaluator mismatch %.9g' % (c.name, blender_error))
        reference = [float(fc.evaluate(100 * i / 256)) for i in range(257)]
        rows.append(dict(name=c.name, bounded=c.bounded, fitError=c.fit_err,
                         blenderError=blender_error, cssError=c.css_err,
                         cssKind='cubic-bezier' if c.css is not None else 'linear',
                         cssSamples=len(c.css_points) if c.css_points else 0,
                         minimum=min(actual), maximum=max(actual), reference=reference))
        print('MOTION %-8s fit=%.6g blender=%.6g css=%.6g range=%.6g..%.6g %s' %
              (c.name, c.fit_err, blender_error, c.css_err, min(actual), max(actual), rows[-1]['cssKind']))
    report = dict(version=1, blender=bpy.app.version_string,
                  sourceHashes={p: digest(ROOT / p) for p in
                                ('blender/lib/curves.py', 'blender/ui_motion.py')},
                  samples=curves.SAMPLES, referenceSamples=257,
                  limits=dict(fit=curves.FIT_ERR_MAX, css=curves.CSS_ERR_MAX,
                              blender=curves.BLENDER_ERR_MAX), curves=rows)
    outputs = {'src/core/motion.js': curves.js_module(),
               'src/ui/motion.css': curves.css_block(),
               'research/motion-export.json': json.dumps(report, indent=2) + '\n'}
    for name, content in outputs.items():
        path = ROOT / name
        if check:
            if not path.exists() or path.read_text(encoding='utf-8') != content:
                raise AssertionError('Stale motion export: '+name)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding='utf-8', newline='\n')
        print('MOTION_%s %s %d bytes' % ('CHECK' if check else 'WRITE', name, len(content.encode())))
    if blend:
        bpy.context.scene.frame_start = 0
        bpy.context.scene.frame_end = 100
        bpy.ops.wm.save_as_mainfile(filepath=str(Path(blend).resolve()))
    print('MOTION_OK 11 curves verified against Blender at %d samples each' % curves.SAMPLES)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--blend')
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
    export(args.check, args.blend)
