"""Named UI motion authored as Blender F-Curves; see research/MOTION.md.

The functions and duration ladder are authored design choices, NOT SOURCED
physical measurements or perceptual thresholds. The existing --ease-back in
styles.css supplies the release overshoot; stamp uses its existing 6% accent.
blender/ui_motion.py builds the real Blender actions, reads their stored
handles back, and verifies exported values against fcurve.evaluate().

Bounded curves have monotone control polygons, so they cannot overshoot or
reverse between samples. Springs explicitly opt out of [0,1] bounds; each
leg still stays within its authored extrema. Single segments export as CSS
cubic-bezier; springs use sampled CSS linear() with reported numerical error.
JS retains Blender's actual piecewise handles. No claim of perceptual
invisibility is made for these numerical budgets.
"""

import math

# Numerical verification budgets, NOT SOURCED perceptual guarantees.
SAMPLES = 4097
CSS_ERR_MAX = 0.0001
FIT_SAMPLES = 129
FIT_BISECT = 26
FIT_ERR_MAX = 0.02
BLENDER_ERR_MAX = 0.00001  # Blender handles/evaluation use float32.


# ═════════════════════════════════════════════════════════════════════════════
# Cubic Bezier arithmetic
# ═════════════════════════════════════════════════════════════════════════════

def _b(p0, p1, p2, p3, s):
    """One coordinate of a cubic Bezier at parameter s."""
    u = 1.0 - s
    return (u * u * u * p0 + 3 * u * u * s * p1 + 3 * u * s * s * p2 + s * s * s * p3)


def _b_at_x(p0, p1, p2, p3, x, steps=52):
    """Invert x(s) by bisection.

    Bisection rather than Newton on purpose: x(s) is monotone whenever the two
    x-handles lie inside the segment, which Blender enforces and CSS requires,
    so bisection cannot fail — and a Newton step CAN, on a near-flat x, land
    outside [0,1] and return a value from a curve nobody authored. The default 52
    halvings is ~2e-16, which is float64's own resolution on [0,1].
    """
    a, b = 0.0, 1.0
    for _ in range(steps):
        m = 0.5 * (a + b)
        if _b(p0, p1, p2, p3, m) < x:
            a = m
        else:
            b = m
    return 0.5 * (a + b)


def bezier_y(x1, y1, x2, y2, x):
    """Evaluate a CSS `cubic-bezier(x1,y1,x2,y2)` at progress x in [0,1]."""
    if x <= 0.0:
        return 0.0
    if x >= 1.0:
        return 1.0
    s = _b_at_x(0.0, x1, x2, 1.0, x)
    return _b(0.0, y1, y2, 1.0, s)


# ═════════════════════════════════════════════════════════════════════════════
# Nelder-Mead — the fit, in pure Python
# ═════════════════════════════════════════════════════════════════════════════
#
# Blender ships no scipy, and a curve library that needed one would be a
# curve library nobody could rebuild. This is the standard simplex method
# (Nelder & Mead 1965), deterministic. We fit two time handles per leg;
# this local search does not claim a globally optimal fit.

def _nelder_mead(f, x0, step=0.15, iters=900, tol=1e-11):
    n = len(x0)
    pts = [list(x0)]
    for i in range(n):
        p = list(x0)
        p[i] += step
        pts.append(p)
    vals = [f(p) for p in pts]
    for _ in range(iters):
        order = sorted(range(n + 1), key=lambda i: vals[i])
        pts = [pts[i] for i in order]
        vals = [vals[i] for i in order]
        if abs(vals[-1] - vals[0]) < tol:
            break
        cen = [sum(p[i] for p in pts[:-1]) / n for i in range(n)]
        ref = [cen[i] + 1.0 * (cen[i] - pts[-1][i]) for i in range(n)]
        fr = f(ref)
        if fr < vals[0]:
            exp = [cen[i] + 2.0 * (cen[i] - pts[-1][i]) for i in range(n)]
            fe = f(exp)
            pts[-1], vals[-1] = (exp, fe) if fe < fr else (ref, fr)
        elif fr < vals[-2]:
            pts[-1], vals[-1] = ref, fr
        else:
            con = [cen[i] + 0.5 * (pts[-1][i] - cen[i]) for i in range(n)]
            fc = f(con)
            if fc < vals[-1]:
                pts[-1], vals[-1] = con, fc
            else:
                for i in range(1, n + 1):
                    pts[i] = [pts[0][j] + 0.5 * (pts[i][j] - pts[0][j]) for j in range(n)]
                    vals[i] = f(pts[i])
    best = min(range(n + 1), key=lambda i: vals[i])
    return pts[best], vals[best]


# ═════════════════════════════════════════════════════════════════════════════
# The defining functions
# ═════════════════════════════════════════════════════════════════════════════

def _decay(n):
    """Travel that starts at full speed and decelerates — 1-(1-t)^n."""
    return lambda t: 1.0 - (1.0 - t) ** n


def _grow(n):
    """Travel that starts still and accelerates away — t^n."""
    return lambda t: t ** n


def _smooth(t):
    """Symmetric: 3t^2 - 2t^3. Slow at both ends, fastest in the middle."""
    return t * t * (3.0 - 2.0 * t)


def _expo(t):
    """1 - 2^(-10t), normalised so f(1) = 1 exactly.

    Steeper off the mark than any polynomial decay and flatter at the end, so a
    number that starts changing the instant it is asked to and stops without a
    visible last step.
    """
    if t <= 0.0:
        return 0.0
    if t >= 1.0:
        return 1.0
    return (1.0 - 2.0 ** (-10.0 * t)) / (1.0 - 2.0 ** -10.0)


def zeta_for_overshoot(mp):
    """Damping ratio of the second-order system that overshoots by `mp`.

    Inverts Mp = exp(-pi*z/sqrt(1-z^2)) (Ogata §5-3). This is how an overshoot
    already present in the UI becomes a damping parameter. This is an
    authored motion model, not a measurement of a real control.
    """
    L = math.log(mp)
    return -L / math.sqrt(math.pi * math.pi + L * L)


def step_response(zeta, wn):
    """Unit step response of a second-order system (Ogata §5-3, eq. 5-12)."""
    wd = wn * math.sqrt(1.0 - zeta * zeta)
    phi = math.acos(zeta)

    def f(t):
        if t <= 0.0:
            return 0.0
        return 1.0 - math.exp(-zeta * wn * t) / math.sqrt(1.0 - zeta * zeta) * \
            math.sin(wd * t + phi)
    return f


def _sprung(mp, turns):
    """Damped response with `turns` interior extrema and a smooth end correction.

    Raw second-order response has a nonzero residual at the window's end.
    The final leg removes it with smoothstep so value and velocity settle.
    """
    z = zeta_for_overshoot(mp)
    wd = math.pi * (turns + 1)
    wn = wd / math.sqrt(1.0 - z * z)
    raw = step_response(z, wn)
    peaks = [(math.pi * k / wd, 1.0 + (-1.0) ** (k + 1) * mp ** k)
             for k in range(1, turns + 1)]
    last = peaks[-1][0]
    # Authored end correction, NOT SOURCED physical behaviour: remove the
    # residual smoothly after the last peak. The raw function ends at
    # 1 +/- mp**(turns+1), not 1; clamping t=1 alone caused a terminal jump.
    residual = 1.0 - raw(1.0)
    def f(t):
        if t >= 1.0:
            return 1.0
        u = max(0.0, (t-last)/(1.0-last))
        return raw(t) + residual*_smooth(u)
    return f, peaks, z, wn


# ── The anchors, measured off styles.css rather than declared here ──────────

def peak_of(x1, y1, x2, y2, n=SAMPLES):
    """Largest value a CSS cubic-bezier reaches. Overshoot, measured."""
    return max(bezier_y(x1, y1, x2, y2, i / (n - 1.0)) for i in range(n))


# `--ease-back: cubic-bezier(.34, 1.56, .64, 1)` — styles.css :root, and the
# curve MOTION.md singles out as the one that reads as physical.
EASE_BACK = (0.34, 1.56, 0.64, 1.0)
OVERSHOOT_REF = peak_of(*EASE_BACK) - 1.0

# `@keyframes levelup` peaks at scale(1.06); `@keyframes stamp` settles through
# scale(.94). Both are 6 % off the mark, and both are once-per-screen
# punctuation, which is what `stamp` is for.
OVERSHOOT_STAMP = 0.06


# ═════════════════════════════════════════════════════════════════════════════
# The vocabulary
# ═════════════════════════════════════════════════════════════════════════════

class Curve:
    """One named curve: a job, a defining function, and the keys that hold it.

    `stops` are the interior stationary points, as (x, y). A curve with no
    stops is two keys and exports as one cubic; multi-leg springs use CSS
    linear() samples. Both paths report their emitted numerical error.
    """

    def __init__(self, name, job, f, stops=(), linear=False, bounded=True):
        self.name = name
        self.job = job
        self.f = f
        self.stops = list(stops)
        self.linear = linear
        # `bounded` = this curve MAY NOT leave [0,1]. It is a design constraint,
        # not a fitting detail: `count` must never display a number it is going
        # to take back, and `press` must not bounce under a held finger. Left
        # to itself a max-deviation fit will happily overshoot to buy accuracy
        # elsewhere. At WIP 4ddbdbf the sampled constraint still allowed
        # dismiss=-2.770e-6 and reveal=1.000002881 between samples. A monotone
        # control polygon enforces the rule across the entire curve.
        self.bounded = bounded
        self.segments = None      # filled by fit(): list of (x0,y0,x1,y1,x2,y2,x3,y3)
        self.css = None           # (x1, y1, x2, y2)
        self.fit_err = None       # max |F-Curve - defining function|
        self.css_err = None       # max |emitted CSS - F-Curve|

    # ── fitting ─────────────────────────────────────────────────────────────
    def fit(self):
        """Fit the F-Curve, then emit a cubic or sampled CSS linear() curve.

        Segment k runs between consecutive knots. Each is fitted on its own by
        minimising the sampled maximum error across the segment. The final
        fit is measured more densely; this is not proof of global optimality.
        """
        knots = [(0.0, 0.0)] + self.stops + [(1.0, 1.0)]
        segs = []
        for (ax, ay), (bx, by) in zip(knots, knots[1:]):
            dx = bx - ax
            # Monotone control polygons guarantee bounds BETWEEN samples.
            # Ordered x handles also prevent Blender shortening overlaps.
            y1, y2 = (ay, by) if self.stops else (by, by)
            target = [self.f(ax + dx*i/(FIT_SAMPLES-1)) for i in range(FIT_SAMPLES)]
            def err(p):
                if not (0 <= p[0] <= p[1] <= 1):
                    return 1e6 + sum(abs(v) for v in p)
                return max(abs(_b(ay,y1,y2,by,_b_at_x(0,p[0],p[1],1,
                           i/(FIT_SAMPLES-1),FIT_BISECT))-v)
                           for i,v in enumerate(target))
            exact = {'dismiss': (0.,0.), 'reveal': (1.,1.), 'swap': (0.,1.),
                     'warn': (2/3,1.), 'drive': (1/3,2/3)}
            if self.name in exact and not self.stops:
                y1, y2 = exact[self.name]
                p = (1/3, 2/3)
            else:
                candidates = [_nelder_mead(err, start, step=.08)
                              for start in ((.2,.65),(.33,.67))]
                p, error = min(candidates, key=lambda pair:pair[1])
                if error >= 1e6:
                    raise ValueError('No feasible fit for '+self.name)
            segs.append((ax,ay,ax+dx*p[0],y1,ax+dx*p[1],y2,bx,by))
        self.segments = segs
        self.fit_err = max(self._seg_err(s) for s in segs)
        self.css, self.css_err = self._fit_css()
        return self.validate()

    def _seg_err(self, s):
        x0, y0, h1x, h1y, h2x, h2y, x3, y3 = s
        worst = 0.0
        for i in range(SAMPLES):
            u = i / (SAMPLES - 1.0)
            x = x0 + (x3 - x0) * u
            worst = max(worst, abs(self.eval(x) - self.f(x)))
        return worst

    def _fit_css(self):
        """Measure actual emitted precision, never pre-rounding fit values."""
        if len(self.segments) == 1:
            s = self.segments[0]
            css = tuple(float('%.9g' % v) for v in (s[2],s[3],s[4],s[5]))
            self.css_points = None
            self.css_value = 'cubic-bezier(%s)' % ', '.join('%.9g' % v for v in css)
            error = max(abs(bezier_y(*css,i/(SAMPLES-1))-self.eval(i/(SAMPLES-1)))
                        for i in range(SAMPLES))
            return css,error
        # A single cubic loses 5-7% on these springs (measured against the
        # F-Curve). CSS linear() preserves all turns; increase sample density
        # until its measured error satisfies the declared numerical budget.
        for count in (129,257,513,1025,2049):
            self.css_points = [float('%.9g' % self.eval(i/(count-1))) for i in range(count)]
            self.css = None
            error = max(abs(self.css_eval(i/(SAMPLES-1))-self.eval(i/(SAMPLES-1)))
                        for i in range(SAMPLES))
            if error <= CSS_ERR_MAX:
                self.css_value = 'linear(%s)' % ', '.join('%.9g' % v for v in self.css_points)
                return None,error
        raise ValueError('CSS export did not converge: '+self.name)

    def css_eval(self,x):
        if self.css is not None:
            return bezier_y(*self.css,x)
        p = min(1.,max(0.,x))*(len(self.css_points)-1)
        i = min(len(self.css_points)-2,int(p))
        return self.css_points[i] + (self.css_points[i+1]-self.css_points[i])*(p-i)

    def validate(self):
        """Prove per-leg bounds from control polygons, not sparse samples."""
        if not self.segments:
            raise ValueError('Empty motion curve: '+self.name)
        if self.segments[0][:2] != (0.,0.) or self.segments[-1][-2:] != (1.,1.):
            raise ValueError('Motion endpoints must be (0,0),(1,1): '+self.name)
        for i,s in enumerate(self.segments):
            if not all(math.isfinite(v) for v in s):
                raise ValueError('Non-finite motion handle: '+self.name)
            x0,y0,x1,y1,x2,y2,x3,y3 = s
            if not (x0 < x3 and x0 <= x1 <= x2 <= x3):
                raise ValueError('Motion time handles must be ordered: '+self.name)
            if not (y0 <= y1 <= y2 <= y3 or y0 >= y1 >= y2 >= y3):
                raise ValueError('Motion leg must be monotone: '+self.name)
            if self.bounded and not (0 <= min(y0,y3) <= max(y0,y3) <= 1):
                raise ValueError('Bounded motion leaves [0,1]: '+self.name)
            if self.bounded and y3 < y0:
                raise ValueError('Bounded motion reverses: '+self.name)
            if i and self.segments[i-1][-2:] != s[:2]:
                raise ValueError('Discontinuous motion curve: '+self.name)
        if self.fit_err > FIT_ERR_MAX:
            raise ValueError('Function fit error exceeds budget: '+self.name)
        if self.css_err > CSS_ERR_MAX:
            raise ValueError('CSS error exceeds budget: '+self.name)
        return self

    # ── evaluation ──────────────────────────────────────────────────────────
    def eval(self, x):
        """The F-Curve's value at x. Piecewise-exact — this is what JS ships."""
        if x <= 0.0:
            return 0.0
        if x >= 1.0:
            return 1.0
        seg = self.segments[-1]
        for s_ in self.segments:
            if x <= s_[6]:
                seg = s_
                break
        x0, y0, h1x, h1y, h2x, h2y, x3, y3 = seg
        s = _b_at_x(x0, h1x, h2x, x3, x)
        return _b(y0, h1y, h2y, y3, s)

    # ── the numbers that make the design claims checkable ───────────────────
    def t_half(self):
        """Progress at which the curve has covered half its travel.

        This is the asymmetry rule made into a number: MOTION.md says things
        must LEAVE faster than they ARRIVE, and `dismiss`'s t_half against
        `enter`'s is whether that is true or only claimed.
        """
        lo, hi = 0.0, 1.0
        for _ in range(60):
            m = 0.5 * (lo + hi)
            if self.eval(m) < 0.5:
                lo = m
            else:
                hi = m
        return 0.5 * (lo + hi)

    def peak(self):
        return max(self.eval(i / (SAMPLES - 1.0)) for i in range(SAMPLES))


def _build():
    """The eleven. Every entry states its JOB first — that is the name's meaning."""
    rel_f, rel_stops, rel_z, _ = _sprung(OVERSHOOT_REF, 1)
    set_f, set_stops, set_z, _ = _sprung(OVERSHOOT_REF, 2)
    stp_f, stp_stops, stp_z, _ = _sprung(OVERSHOOT_STAMP, 1)

    return [
        Curve('press',
              'A finger goes down on a control. The surface must already be '
              'under the finger by the time the eye notices it moved, and it '
              'must not bounce — a held control that springs is a control that '
              'feels loose. Fastest attack in the set, flat landing.',
              _decay(5)),

        Curve('release',
              'The finger comes off. A sprung key does not stop at rest, it '
              'goes past and comes back, and that is the whole of why a control '
              'reads as a physical object. Overshoots by exactly as much as the '
              'one curve this game already had right.',
              rel_f, rel_stops, bounded=False),

        Curve('enter',
              'Something arrives that was not on screen. Decelerates hard so '
              'the eye catches it already slowing, and lands flat: an entering '
              'panel that overshoots reads as sloppy at 375 px, where the '
              'travel is short enough that the bounce is most of the move.',
              _decay(4)),

        Curve('dismiss',
              'Something leaves. Its only job is to be out of the way. '
              'Accelerating, and paired with a shorter duration than its '
              'entrance — this curve IS the asymmetry rule.',
              _grow(3)),

        Curve('reveal',
              'One item of a staggered group. Softer off the mark than `enter` '
              'so consecutive items overlap and the group reads as a wave '
              'rather than a volley. Only ever used with --stagger-step.',
              _decay(3)),

        Curve('swap',
              'Two things cross-fading in one fixed slot — the status strip\'s '
              'two faces, the boot fact, the readout. Symmetric on purpose: '
              'asymmetry in a cross-fade shows either a gap or a double '
              'exposure at the midpoint.',
              _smooth),

        Curve('count',
              'A number or a meter travelling to a new value while the player '
              'is already reading it. Starts changing immediately and stops '
              'without a visible last step. Never overshoots — a counter that '
              'overshoots displays a number that is not true.',
              _expo),

        Curve('settle',
              'A value that was disturbed coming to rest: a gauge needle, a '
              'slider let go, a bar finding its level. Over, back, and down. '
              'The only curve here with two stationary points, and therefore '
              'represented by several monotone curve legs.',
              set_f, set_stops, bounded=False),

        Curve('stamp',
              'One-off punctuation landing: the grade, a level-up, a skill '
              'point spent. Shallower overshoot than `release` because it '
              'arrives from a large scale change and does not need the bounce '
              'to say it is physical.',
              stp_f, stp_stops, bounded=False),

        Curve('warn',
              'The strike of a pulse on something urgent. Shallowest decay in '
              'the set, so the attack is nearly a step and the eye reads a '
              'strike rather than a sine wave. Its return leg is `release`.',
              _decay(2)),

        Curve('drive',
              'Constant rate, and the ONLY legitimate straight line here. A '
              'spinner, an indeterminate sweep, and a rule showing a rate the '
              'sim publishes: easing one of those would misreport the rate. '
              'Naming it is the point — it makes every OTHER linear a mistake '
              'rather than a default.',
              lambda t: t, linear=True),
    ]


CURVES = None


def build():
    """Fit the whole vocabulary. Idempotent."""
    global CURVES
    if CURVES is None:
        CURVES = [c.fit() for c in _build()]
    return CURVES


def by_name(name):
    for c in build():
        if c.name == name:
            return c
    raise KeyError('no curve named %r. The vocabulary is: %s'
                   % (name, ', '.join(c.name for c in build())))


# ═════════════════════════════════════════════════════════════════════════════
# The duration scale
# ═════════════════════════════════════════════════════════════════════════════
#
# Authored design scale, NOT SOURCED response-time/perception measurements.
# Regularises the existing ladder; research/MOTION.md supplies the 20-30 ms
# stagger brief. Adopt per consumer, not through global duration overrides.
DUR_BASE = 80.0
DUR_RATIO = 1.5
DURATIONS = [
    ('dur-1', 80,  'a press acknowledgement — short acknowledgement'),
    ('dur-2', 120, 'a state swap: colour, opacity, a chip going active'),
    ('dur-3', 180, 'THE DEFAULT. Anything the player meets more than once'),
    ('dur-4', 270, 'an element entering or leaving its slot'),
    ('dur-5', 400, 'a whole screen changing — ceremony, not traffic'),
    ('dur-6', 600, 'a once-per-run celebration'),
    ('dur-7', 900, 'the boot lock-up. one-off ceremony'),
]

# The stagger step is DERIVED, not picked: MOTION.md asks for 20-30 ms per item
# ("a group moving as a block reads flat"), and dur-1 / 5 = 16 ms is too tight
# while dur-2 / 5 = 24 ms sits in the middle of the brief's band. Declared as
# the division so it moves when the ladder moves.
STAGGER_DIVISOR = 5
STAGGER_OF = 'dur-2'


def durations_report():
    rows = []
    for i, (tok, ms, job) in enumerate(DURATIONS):
        ideal = DUR_BASE * DUR_RATIO ** i
        rows.append((tok, ms, ideal, 100.0 * (ms - ideal) / ideal, job))
    return rows


# ═════════════════════════════════════════════════════════════════════════════
# Consumer 3 — glTF. Shaping a baked keyframe pair with a named curve.
# ═════════════════════════════════════════════════════════════════════════════

def apply(kp_a, kp_b, name):
    """Shape the F-Curve segment between two Blender keyframe points.

    This is how `blender/lib/anim.py`'s baked clips key against the SAME named
    curves the UI uses — the third export, and the one that makes "one
    authority" true across the whole game rather than just across the two web
    consumers.

    `anim.py` sets `kp.interpolation` and leaves the handles on Blender's AUTO,
    which fits a smooth curve through the keys and is a perfectly good default
    — but it is a DIFFERENT curve on every clip, decided by the neighbouring
    keys rather than by anybody. Calling this instead makes the segment the
    named curve, exactly.

    Both keys must already be inserted. Returns the (x1,y1,x2,y2) applied, so a
    caller can print what it did rather than trust that it happened.
    """
    c = by_name(name)
    if len(c.segments) != 1:
        raise ValueError(
            'curve %r has %d segments and a single keyframe interval can hold '
            'one. Key the interior stationary points as real keys and apply the '
            'per-leg curves — that is what CSS does with @keyframes, and it is '
            'why `release` and `warn` are the pair that make a pulse.'
            % (name, len(c.segments)))
    x1, y1, x2, y2 = c.css
    ax, ay = kp_a.co[0], kp_a.co[1]
    bx, by = kp_b.co[0], kp_b.co[1]
    dx, dy = bx - ax, by - ay
    kp_a.interpolation = 'BEZIER'
    kp_a.handle_right_type = 'FREE'
    kp_b.handle_left_type = 'FREE'
    kp_a.handle_right = (ax + dx * x1, ay + dy * y1)
    kp_b.handle_left = (ax + dx * x2, ay + dy * y2)
    return (x1, y1, x2, y2)


# ═════════════════════════════════════════════════════════════════════════════
# Authoring the curves as real Blender F-Curves
# ═════════════════════════════════════════════════════════════════════════════

def author(bpy, action_name='ui-motion', frames=100.0):
    """Build every curve as a real F-Curve in a real Blender action.

    One Empty per curve, named `curve:<name>`, with its X location keyed. Open
    the .blend and every one of them is in the graph editor, side by side, on
    the same axes — which is the entire argument of MOTION.md for why Blender
    should own this: a curve is authored by LOOKING at it.

    Returns {name: fcurve}. `ui_motion.py` then measures everything off
    `fcurve.evaluate()` — Blender's evaluator, not the arithmetic above.
    """
    out = {}
    for c in build():
        o = bpy.data.objects.new('curve:%s' % c.name, None)
        bpy.context.scene.collection.objects.link(o)
        o.rotation_mode = 'QUATERNION'
        action = bpy.data.actions.new('%s:%s' % (action_name, c.name))
        o.animation_data_create()
        o.animation_data.action = action
        o.animation_data.action_slot = action.slots.new(id_type='OBJECT', name=o.name)
        layer = action.layers.new('Motion')
        strip = layer.strips.new(type='KEYFRAME')
        bag = strip.channelbag(o.animation_data.action_slot, ensure=True)
        fc = bag.fcurves.new('location', index=0)

        knots = [(0.0, 0.0)] + c.stops + [(1.0, 1.0)]
        for (kx, ky) in knots:
            kp = fc.keyframe_points.insert(kx * frames, ky)
            kp.interpolation = 'LINEAR' if c.linear else 'BEZIER'
            kp.handle_left_type = 'FREE'
            kp.handle_right_type = 'FREE'

        # Handles come from the fitted segments, so what is in the graph editor
        # is what CSS and JS ship — not a re-derivation that can drift.
        kps = list(fc.keyframe_points)
        for i, seg in enumerate(c.segments):
            x0, y0, h1x, h1y, h2x, h2y, x3, y3 = seg
            kps[i].handle_right = (h1x * frames, h1y)
            kps[i + 1].handle_left = (h2x * frames, h2y)
        # The outermost handles never shape anything inside the curve, but a
        # handle left at its insert-time default sticks out of the graph and
        # reads as an authored intention. Flatten them.
        kps[0].handle_left = (-0.1 * frames, kps[0].co[1])
        kps[-1].handle_right = (1.1 * frames, kps[-1].co[1])
        fc.update()
        out[c.name] = fc
    return out


# ═════════════════════════════════════════════════════════════════════════════
# Emission
# ═════════════════════════════════════════════════════════════════════════════

def css_block(marker_open='', marker_close=''):
    """Standalone CSS; reported errors include emitted number precision."""
    lines = ['/* GENERATED by blender/ui_motion.py; do not edit. */', ':root {']
    for c in build():
        lines.append('  --curve-%s: %s; /* max error %.3e */' % (c.name,c.css_value,c.css_err))
    for tok,ms,_ in DURATIONS:
        lines.append('  --motion-d%s: %dms;' % (tok.removeprefix('dur-'),ms))
    lines.append('  --motion-stagger: %gms;' % (dict((t,ms) for t,ms,_ in DURATIONS)[STAGGER_OF]/STAGGER_DIVISOR))
    lines.append('}')
    for selector in ('@media (prefers-reduced-motion: reduce) { :root {','.reduced-motion {'):
        lines.append(selector)
        lines.extend('  --motion-d%s: 1ms;' % tok.removeprefix('dur-') for tok,_,_ in DURATIONS)
        lines.append('  --motion-stagger: 0ms;')
        lines.append('} }' if selector.startswith('@media') else '}')
    return '\n'.join(lines)+'\n'


def js_module():
    """Runtime using Blender's actual stored piecewise handles."""
    import json
    data = {c.name: {'segments': c.segments, 'bounded': c.bounded,
                    'cssKind': 'cubic-bezier' if c.css is not None else 'linear', 'cssErr': c.css_err} for c in build()}
    head = '/* GENERATED by blender/ui_motion.py; do not edit. */\n'
    head += 'export const CURVES = '+json.dumps(data,separators=(',',':'))+';\n'
    head += 'export const DUR = '+json.dumps({t.replace('dur-','d'):ms/1000 for t,ms,_ in DURATIONS})+';\n'
    head += 'export const STAGGER = %g;\n' % (dict((t,ms) for t,ms,_ in DURATIONS)[STAGGER_OF]/1000/STAGGER_DIVISOR)
    return head+RUNTIME_JS


RUNTIME_JS = r"""
const own = (name) => {
  if (!Object.hasOwn(CURVES, name)) throw new Error(`Unknown motion curve: ${name}`);
  return CURVES[name];
};
const bez = (a,b,c,d,t) => { const u=1-t; return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d; };
export function ease(name,t) {
  const c=own(name);
  if (!Number.isFinite(t)) throw new TypeError('Motion progress must be finite');
  if (t<=0) return 0;
  if (t>=1) return 1;
  const s=c.segments.find(s=>t<=s[6]) || c.segments.at(-1);
  let a=0,b=1;
  for(let i=0;i<40;i++) { const m=(a+b)/2; if(bez(s[0],s[2],s[4],s[6],m)<t) a=m; else b=m; }
  return bez(s[1],s[3],s[5],s[7],(a+b)/2);
}
export const curve = (name) => { own(name); return t=>ease(name,t); };
/** Use shell's effective flag, which combines OS and game settings. */
export const dur = (seconds,reduced) => {
  if(!Number.isFinite(seconds)||seconds<0) throw new TypeError('Motion duration must be finite and nonnegative');
  return reduced ? Math.min(seconds,1/60) : seconds;
};
"""
