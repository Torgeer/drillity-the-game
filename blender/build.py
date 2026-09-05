"""Build every machine. `npm run blender`

WHY THIS FILE PUTS TWO DIRECTORIES ON sys.path
----------------------------------------------
The builders live in `blender/`; the shared helpers live in `blender/lib/`.
Only `lib` was on the path, so `importlib.import_module('crawler_th')` raised
ModuleNotFoundError — and with no error handling in the loop, the FIRST failure
aborted the run. `pd55` built (through a shim written in `lib/` precisely to
work around this) and the other eight never executed at all. The command
reported nothing wrong. Measured 2026-09-05: one traceback, one model on disk
out of nine, exit code 0.

Adding HERE fixes the import. The try/except below fixes the silence.

WHY IT KEEPS GOING AFTER A FAILURE, AND STILL EXITS NON-ZERO
------------------------------------------------------------
Aborting on the first failure hides every machine behind it, which is how one
missing path entry passed for a working pipeline. Continuing without a non-zero
exit would be worse — that is the silent-fallback pattern this tree has been
bitten by four times. So: build all of them, print one line per machine, and
fail the process at the end if any did not export.
"""
import sys, os, importlib, traceback
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))
sys.path.insert(0, HERE)          # ...and the builders themselves
OUT = os.path.abspath(os.path.join(HERE, '..', 'public', 'models'))
os.makedirs(OUT, exist_ok=True)

MACHINES = ['pd55', 'crawler_th', 'core_rig', 'tunnel_jumbo', 'dth_crawler', 'cfa_rig', 'piling_leader', 'foundation_bg', 'rc_rig', 'cable_percussion', 'oil_derrick', 'hdd_rig']          # add ids here as they are built

failed = []
for mid in MACHINES:
    # THE FILENAME IS THE RIG ID, NOT THE MODULE NAME.
    #
    # `src/core/gltfRig.js` fetches `models/<rigId>.glb`, and rig ids in
    # data.js are hyphenated — `cfa-rig`, `core-rig`, `tunnel-jumbo`. A Python
    # module cannot be, so the modules are `cfa_rig.py` and friends. This line
    # used to join `mid` directly, which exported every machine under its
    # MODULE name and meant the game never requested it: eight machines built,
    # six of them silently replaced on screen by the procedural builder, 31 MB
    # of modelling that was never once looked at.
    #
    # It stayed invisible because the fallback works. Somebody had noticed for
    # two machines and hand-copied them to the hyphenated name, which is
    # exactly what stopped anybody noticing the other six.
    #
    # `tools/checkmodels.mjs` now fails the build on this, on a stray file in
    # public/models/, and on a rig carrying two model files under two
    # spellings — because the second one goes stale the moment the first is
    # rebuilt and which one the game gets is the loader's accident.
    path = os.path.join(OUT, mid.replace('_', '-') + '.glb')
    try:
        mod = importlib.import_module(mid)
        mod.build(path)
        if not os.path.exists(path):
            raise RuntimeError('build() returned without writing ' + path)
        print('BUILD_OK   %-14s -> %s' % (mid, os.path.basename(path)))
    except Exception:
        traceback.print_exc()
        print('BUILD_FAIL %s' % mid)
        failed.append(mid)

print('BUILD_SUMMARY built=%d failed=%d%s'
      % (len(MACHINES) - len(failed), len(failed),
         ('  [' + ', '.join(failed) + ']') if failed else ''))
if failed:
    sys.exit(1)

