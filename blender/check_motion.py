"""Regression checks for motion fitting; no Blender or third-party packages.
Run python -B blender/check_motion.py. Blender/export parity is checked by
blender/ui_motion.py and tools/checkmotion.mjs separately.
"""
import copy
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'lib'))
import curves


def must_reject(c, message):
    try:
        c.validate()
    except ValueError:
        return
    raise AssertionError(message)


vocabulary = curves.build()
assert len(vocabulary) == 11
assert len({c.name for c in vocabulary}) == 11
for c in vocabulary:
    c.validate()
    # Include non-fit-grid points: the WIP's bounds test missed extrema
    # between 129 fitting samples (dismiss -2.77e-6; reveal +2.88e-6).
    values = [c.eval(i / 16384) for i in range(16385)]
    assert values[0] == 0 and values[-1] == 1
    if c.bounded:
        assert min(values) >= -1e-12 and max(values) <= 1 + 1e-12, c.name
        assert all(b >= a - 1e-12 for a, b in zip(values, values[1:])), c.name
    else:
        assert max(values) > 1.01, c.name
        for x, y in c.stops:
            assert abs(c.eval(x)-y) < 1e-12, (c.name, x)
        assert abs(c.f(1-1e-8)-1) < 1e-8, 'Spring defining function jumps at end'
    print('MOTION_REGRESSION %-8s fit=%.6g css=%.6g range=%.9g..%.9g' %
          (c.name, c.fit_err, c.css_err, min(values), max(values)))

# An invalid control polygon must fail even if its reversal falls between
# fitter samples. Merely increasing a sample count would not fix the cause.
bad = copy.deepcopy(curves.by_name('dismiss'))
s = list(bad.segments[0]); s[3] = -1e-7; bad.segments[0] = tuple(s)
must_reject(bad, 'Allowed a bounded negative control handle')
bad = copy.deepcopy(curves.by_name('enter'))
s = list(bad.segments[0]); s[2] = .9; s[4] = .1; bad.segments[0] = tuple(s)
must_reject(bad, 'Allowed overlapping time handles that Blender modifies')
bad = copy.deepcopy(curves.by_name('release')); bad.bounded = True
must_reject(bad, 'Accepted an infeasible bounded spring')
bad = copy.deepcopy(curves.by_name('press')); bad.segments = []
must_reject(bad, 'Empty curve passed')
bad = copy.deepcopy(curves.by_name('press'))
s = list(bad.segments[0]); s[3] = math.nan; bad.segments[0] = tuple(s)
must_reject(bad, 'Nonfinite curve passed')
bad = copy.deepcopy(curves.by_name('press'))
bad.segments = [(0.,0.,.1,0.,.2,.8,.3,.8),
                (.3,.8,.4,.8,.5,.6,.6,.6),
                (.6,.6,.7,.6,.8,1.,1.,1.)]
must_reject(bad, 'Bounded multi-leg curve reversed while staying in [0,1]')
print('MOTION_REGRESSION_OK 11 curves; 6 invalid-curve fixtures rejected')
