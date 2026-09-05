"""crawler_th - surface top-hammer crawler drill (in-game marque: Steinbach TH-320 Ridgeline).

SKELETON - first export. Real geometry lands in the following commits.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
import rig as R


def build(out_path):
    R.reset()
    R.box('hull', (2.05, 3.4, 1.0), R.MAT_PAINT, loc=(0, -1.2, 1.15), bevel=0.03)
    R.box('track_l', (0.46, 3.3, 0.62), R.MAT_DARK, loc=(-0.69, -1.2, 0.31), bevel=0.03)
    R.box('track_r', (0.46, 3.3, 0.62), R.MAT_DARK, loc=(0.69, -1.2, 0.31), bevel=0.03)
    return R.finish(out_path)
