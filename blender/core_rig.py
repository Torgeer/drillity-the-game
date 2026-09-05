"""core_rig - surface diamond core / wireline exploration drill.

In-game marque: Meridian CX-1200 Wireline.  DOMAIN.md section 10 binds: no real
manufacturer name or model designation appears in any object, material or string
that can reach a player.  Provenance for every dimension lives in the comments
below, keyed to research/rigs/core-rig.md section 11:

  [C140]  manufacturer brochure for a tracked/trailer surface core rig, 7 pp.,
          2021 - the ONLY fully dimensioned source (general-arrangement drawing
          pp.6-7, spec tables p.6, options pp.10-11).
  [XP]    Xploration Products catalogue 2024, pp.11-21 - spec tables for the
          SCX surface range (feed length, torque, RPM, power).
  [MET]   Mineral Exploration Tooling catalogue, pp.15-18 - the photographs.
  [D]     DERIVED here or in research/rigs/core-rig.md, arithmetic on published
          numbers.  Flagged every time.
  [EST]   Eyeballed off a photograph.  Flagged every time.

SKELETON - first export.  Subassemblies land in the following commits.
"""
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
import rig as R

# ── governing dimensions ─────────────────────────────────────────────────────
# Blender is Z-up and the exporter converts to three.js Y-up (blender +Y -> gl -Z).
# Origin: the drilling axis (the collar) at ground level, mast vertical, with the
# machine extending to +Y so it lands at -Z in game space like rigFactory builds it.
W_OVER_TRACKS = 2.600   # [C140] p.6 dim E
TRACK_SHOE    = 0.400   # [C140] p.6 dim G, "Crawler band width 400 mm"
GAUGE         = W_OVER_TRACKS - TRACK_SHOE       # 2.200 [D]
CLEARANCE     = 0.536   # [C140] p.6 dim H
MAST_LEN      = 10.84   # [D] from B=12155 at 90 deg and A=8979 at 45 deg
MAST_PIVOT_Z  = 1.315   # [D] same pair of equations
TRACK_LEN     = 3.00    # [D] see notes in the track section


def build(out_path):
    R.reset()
    # main frame over the tracks
    R.box('frame', (2.30, 3.60, 0.34), R.MAT_DARK, loc=(0, 1.55, CLEARANCE + 0.17), bevel=0.02)
    for s in (-1, 1):
        R.box('track_%d' % s, (TRACK_SHOE, TRACK_LEN, 0.60), R.MAT_WORN,
              loc=(s * GAUGE / 2, 1.55, 0.30), bevel=0.03)
    mast = R.empty(R.NODE_PIVOT, 'mast', loc=(0, 0.55, MAST_PIVOT_Z))
    R.box('mast_beam', (0.50, 0.55, MAST_LEN), R.MAT_PAINT, parent=mast,
          loc=(0, 0, MAST_LEN / 2), bevel=0.015)
    R.box('crown', (0.90, 0.75, 0.62), R.MAT_PAINT, parent=mast,
          loc=(0, 0, MAST_LEN + 0.16), bevel=0.02)
    return R.finish(out_path)
