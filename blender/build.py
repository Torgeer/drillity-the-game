"""Build every machine. `npm run blender`"""
import sys, os, importlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))
OUT = os.path.abspath(os.path.join(HERE, '..', 'public', 'models'))
os.makedirs(OUT, exist_ok=True)

MACHINES = ['pd55', 'crawler_th', 'core_rig', 'tunnel_jumbo', 'dth_crawler', 'cfa_rig', 'piling_leader', 'foundation_bg', 'rc_rig']          # add ids here as they are built

for mid in MACHINES:
    mod = importlib.import_module(mid)
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
    mod.build(os.path.join(OUT, mid.replace('_', '-') + '.glb'))
