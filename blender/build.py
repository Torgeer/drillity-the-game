"""Build every machine. `npm run blender`"""
import sys, os, importlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))
OUT = os.path.abspath(os.path.join(HERE, '..', 'public', 'models'))
os.makedirs(OUT, exist_ok=True)

MACHINES = ['pd55', 'crawler_th', 'core_rig', 'tunnel_jumbo', 'dth_crawler', 'cfa_rig', 'piling_leader', 'foundation_bg', 'rc_rig']          # add ids here as they are built

for mid in MACHINES:
    mod = importlib.import_module(mid)
    mod.build(os.path.join(OUT, mid + '.glb'))
