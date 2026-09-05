"""The motion-curve vocabulary — the single authority for how this game moves.

READ `research/MOTION.md` FIRST. It is the measurement that says why this file
exists. This is its answer.

WHAT THIS FILE IS
-----------------
Eleven named F-Curves, authored here as control points, built into a real
Blender action by `blender/ui_motion.py`, and exported THREE ways from that one
source:

    CSS   one `cubic-bezier()` per curve, as a custom property in styles.css
    JS    the same curves, piecewise-exact, in src/core/motion.js
    glTF  `apply()` shapes the handles of a keyframe pair baked by lib/anim.py

Blender is the authority, not this file's arithmetic. `ui_motion.py` samples
every curve with Blender's OWN `fcurve.evaluate()` and cross-checks the pure
Python evaluator below against it; a disagreement over 1e-6 is a build failure.
That is the only thing that makes "Blender owns motion" true rather than said.

CURVES ARE NAMED FOR WHAT THEY DO
---------------------------------
`press`, `release`, `enter`, `dismiss` — never `easeOutQuart`. MOTION.md:
"A name that describes the shape instead of the job is how you end up with
fifty-five `linear`s." A shape name tells the next reader nothing about whether
this is the right curve for the thing in front of them; a job name is a
question they can answer.

WHERE THE NUMBERS COME FROM — NO NUMBER HERE WAS PICKED
-------------------------------------------------------
Every curve is a DEFINING FUNCTION plus a FIT. The function is the design
decision and is stated at each entry. The keys are then found by a Chebyshev
(minimise-the-worst-case) fit of the F-Curve to that function, and the residual
is MEASURED and PRINTED, never assumed.

Two of the functions are anchored to numbers that are already in this game and
were already judged good, so the family cannot drift away from what ships:

  * `--ease-back: cubic-bezier(.34, 1.56, .64, 1)` in styles.css. MOTION.md
    calls it "the one piece of motion in this game that reads as physical".
    Its peak is measured at import time -> OVERSHOOT_REF, and `release` and
    `settle` are the damped second-order systems that overshoot by exactly
    that much.
  * `@keyframes levelup` in styles.css peaks at `scale(1.06)`, and
    `@keyframes stamp` settles through `scale(.94)`. Both are 6 % off the mark,
    so `stamp` is the system that overshoots 6 %.

The second-order step response and its three standard relations —

    y(t) = 1 - e^(-z*wn*t)/sqrt(1-z^2) * sin(wd*t + acos z),  wd = wn*sqrt(1-z^2)
    overshoot  Mp = exp(-pi*z / sqrt(1-z^2))
    peak time  tp = pi / wd

— are textbook control theory (Ogata, *Modern Control Engineering* 5e, §5-3,
"Second-Order Systems and Transient-Response Specifications"). They are used
here because a control settling under a finger IS a second-order system, and
because they let an overshoot the eye already approved be converted into a
damping ratio instead of a number somebody liked.

A CUBIC BEZIER CANNOT HOLD EVERY F-CURVE
----------------------------------------
A CSS `cubic-bezier(x1,y1,x2,y2)` is a cubic Bezier from (0,0) to (1,1) — the
same four control points as ONE Blender F-Curve segment normalised to the unit
square. So a two-key curve exports to CSS EXACTLY; there is nothing to
approximate and the measured error is the evaluator's noise floor.

A three- or four-key curve cannot. `release`, `stamp` and `settle` have an
interior stationary point — the overshoot — and one cubic Bezier has no way to
turn twice. Those three carry a real, printed, per-curve max deviation, and
`ui_motion.py` fails the build if one exceeds CSS_ERR_MAX below.

    JS does NOT inherit that loss. `src/core/motion.js` carries the F-Curve's
    own segments and evaluates them piecewise, so JS is exact for all eleven
    and only CSS approximates. Where the two must agree to the pixel — a CSS
    transition and a rAF chain driving the same thing — use a two-key curve,
    where they are the same curve by construction.
"""

import math

# ── Thresholds, declared here so the report can quote them ──────────────────

# Sample count for every reported error measurement. MOTION.md's brief asks for >= 256;
# 513 is used because it is 2^9+1, so the sample set contains both endpoints
# AND every dyadic midpoint, which is where a Bezier fit is worst.
SAMPLES = 513

# The most a CSS cubic-bezier may deviate from its F-Curve, in the curve's own
# units (1.0 = the whole travel of whatever it drives).
#
# ASSUMED, AND MARKED AS SUCH — this is a perceptual threshold and this project
# has no measurement of its own for it. The reasoning: 0.02 is one Weber
# fraction of the travel. Position/length discrimination has a Weber fraction
# around 2-5 %, so a deviation below 2 % of the travel is at or under the level
# at which a moving edge's position can be told from where it "should" be. It
# is also, on the largest travel in this UI (the sheet's translateY(100%) over
# a ~700 px stage) 14 px spread across a 400 ms transition — under 1 px per
# frame at 60 Hz.
#
# If you think this is wrong, argue with numbers and change the constant, the
# way tools/checkreach.mjs asks you to argue with its three assumed constants.
CSS_ERR_MAX = 0.02

# Samples and bisection depth used while SEARCHING for a fit. The search only
# has to find the right four numbers; the error that gets printed and gated is
# always re-measured afterwards at SAMPLES with the full bisection, so a cheap
# search cannot flatter a bad fit.
FIT_SAMPLES = 129
FIT_BISECT = 26

# The most an F-Curve may deviate from its own defining function. This one is
# not perceptual — it is a build-hygiene bound saying "the fit converged".
FIT_ERR_MAX = 0.02


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
# (Nelder & Mead 1965), 40 lines, deterministic, and it only ever has to find
# four numbers.

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
    the eye has already approved becomes a physical constant instead of a
    number somebody liked.
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
    """A damped step response scaled into t in [0,1].

    `turns` is how many stationary points are inside the window: 1 keeps the
    overshoot and stops at the first return to the mark, 2 carries on through
    the undershoot. wn is then set so that the LAST included stationary point
    plus one more half-cycle lands exactly at t=1, which is what makes the
    curve end at rest instead of being cut off mid-swing.
    """
    z = zeta_for_overshoot(mp)
    # wd chosen so that the window holds `turns` peaks plus the return leg.
    wd = math.pi * (turns + 1)
    wn = wd / math.sqrt(1.0 - z * z)
    f = step_response(z, wn)
    peaks = [(math.pi * k / wd, 1.0 + (-1.0) ** (k + 1) * mp ** k)
             for k in range(1, turns + 1)]
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
    stops is two keys and exports to CSS exactly; a curve with stops has to
    turn, and one cubic Bezier cannot, which is where the printed error
    comes from.
    """

    def __init__(self, name, job, f, stops=(), linear=False, bounded=True,
                 css_travel_px=None):
        self.name = name
        self.job = job
        self.f = f
        self.stops = list(stops)
        self.linear = linear
        # `bounded` = this curve MAY NOT leave [0,1]. It is a design constraint,
        # not a fitting detail: `count` must never display a number it is going
        # to take back, and `press` must not bounce under a held finger. Left
        # to itself a max-deviation fit will happily overshoot to buy accuracy
        # elsewhere — measured, before this constraint existed: press peaked at
        # 1.0107 and dismiss dipped to -0.0448. So the constraint goes in the
        # fit, where it is enforced, rather than in the comment, where it is
        # only stated.
        self.bounded = bounded
        # The largest travel, in CSS px, that this curve drives in styles.css.
        # None means "CSS does not consume this curve as a whole transition",
        # and it is what decides whether a token is emitted at all — see
        # css_error_px(). Measured off the rules that use it, not assumed.
        self.css_travel_px = css_travel_px
        self.segments = None      # filled by fit(): list of (x0,y0,x1,y1,x2,y2,x3,y3)
        self.css = None           # (x1, y1, x2, y2)
        self.fit_err = None       # max |F-Curve - defining function|
        self.css_err = None       # max |CSS bezier - F-Curve|   <- the brief's number

    # ── fitting ─────────────────────────────────────────────────────────────
    def fit(self):
        """Find the F-Curve's control points, then the single CSS Bezier.

        Segment k runs between consecutive knots. Each is fitted on its own by
        minimising the WORST error across the segment, not the mean: a mean fit
        hides a single bad frame, and a single bad frame is exactly what the
        eye catches in a 200 ms move.
        """
        knots = [(0.0, 0.0)] + self.stops + [(1.0, 1.0)]
        segs = []
        for k in range(len(knots) - 1):
            (ax, ay), (bx, by) = knots[k], knots[k + 1]
            dx = bx - ax

            def err(p, ax=ax, ay=ay, bx=bx, by=by, dx=dx):
                h1x, h1y, h2x, h2y = p
                # x-handles must stay inside the segment or time runs backwards.
                if not (0.0 <= h1x <= 1.0 and 0.0 <= h2x <= 1.0):
                    return 1e6
                worst = 0.0
                for i in range(FIT_SAMPLES):
                    u = i / (FIT_SAMPLES - 1.0)
                    x = ax + dx * u
                    s = _b_at_x(0.0, h1x, h2x, 1.0, u, FIT_BISECT)
                    y = _b(ay, ay + h1y, by + h2y, by, s)
                    if self.bounded and (y < -1e-9 or y > 1.0 + 1e-9):
                        return 1e6
                    d = abs(y - self.f(x))
                    if d > worst:
                        worst = d
                return worst

            if self.linear:
                p = [1.0 / 3.0, (by - ay) / 3.0, 2.0 / 3.0, -(by - ay) / 3.0]
                e = err(p)
            else:
                p, e = _nelder_mead(err, [1.0 / 3.0, (by - ay) / 3.0,
                                          2.0 / 3.0, -(by - ay) / 3.0])
                # Restart once from the other natural guess; a 4-D simplex can
                # stall, and a stalled fit that is never rechecked is exactly
                # the "silent fallback that works" pattern (ASTRA §8).
                p2, e2 = _nelder_mead(err, [0.25, 0.0, 0.75, 0.0], step=0.3)
                if e2 < e:
                    p, e = p2, e2
            h1x, h1y, h2x, h2y = p
            segs.append((ax, ay,
                         ax + dx * h1x, ay + h1y,
                         ax + dx * h2x, by + h2y,
                         bx, by))
        self.segments = segs
        self.fit_err = max(self._seg_err(s) for s in segs)
        self.css, self.css_err = self._fit_css()
        return self

    def _seg_err(self, s):
        x0, y0, h1x, h1y, h2x, h2y, x3, y3 = s
        worst = 0.0
        for i in range(SAMPLES):
            u = i / (SAMPLES - 1.0)
            x = x0 + (x3 - x0) * u
            worst = max(worst, abs(self.eval(x) - self.f(x)))
        return worst

    def _fit_css(self):
        """The best single `cubic-bezier()` for this F-Curve, and its error.

        For a two-key curve this is an identity, not a fit: the segment already
        IS a cubic Bezier from (0,0) to (1,1), so it is read off directly and
        the error that comes back is the evaluator's noise floor. For a curve
        with stops it is a genuine approximation and the number is real.
        """
        if len(self.segments) == 1:
            x0, y0, h1x, h1y, h2x, h2y, x3, y3 = self.segments[0]
            css = (h1x, h1y, h2x, h2y)   # identity, not a fit — see the docstring
        else:
            def err(p):
                x1, y1, x2, y2 = p
                if not (0.0 <= x1 <= 1.0 and 0.0 <= x2 <= 1.0):
                    return 1e6
                worst = 0.0
                for i in range(FIT_SAMPLES):
                    x = i / (FIT_SAMPLES - 1.0)
                    y = bezier_y(x1, y1, x2, y2, x)
                    if self.bounded and (y < -1e-9 or y > 1.0 + 1e-9):
                        return 1e6
                    worst = max(worst, abs(y - self._ref[i]))
                return worst
            self._ref = [self.eval(i / (FIT_SAMPLES - 1.0))
                         for i in range(FIT_SAMPLES)]
            p, _ = _nelder_mead(err, [0.34, 1.56, 0.64, 1.0], step=0.2)
            css = tuple(p)
        worst = 0.0
        for i in range(SAMPLES):
            x = i / (SAMPLES - 1.0)
            worst = max(worst, abs(bezier_y(*css, x) - self.eval(x)))
        return css, worst

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

    def css_error_px(self):
        """The CSS approximation, in device pixels, on the travel it drives.

        THIS is the gate, not the abstract fraction. A 6.4 % deviation is
        nothing on a button that scales by 3.5 % and is 1.4 px on a 22 px
        switch throw — the same number, two different answers — and gating on
        the fraction alone would either ship the second or refuse the first.
        Returns None for a curve CSS does not consume as a whole transition.
        """
        if self.css_travel_px is None:
            return None
        return self.css_err * self.css_travel_px


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
              rel_f, rel_stops),

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
              'the only one CSS cannot hold exactly.',
              set_f, set_stops),

        Curve('stamp',
              'One-off punctuation landing: the grade, a level-up, a skill '
              'point spent. Shallower overshoot than `release` because it '
              'arrives from a large scale change and does not need the bounce '
              'to say it is physical.',
              stp_f, stp_stops),

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
# research/MOTION.md: "there is no scale, just numbers picked one at a time".
# Measured in styles.css before this change: --dur-1..6 = 110 190 300 440 720
# 1100 ms, with ratios 1.73, 1.58, 1.47, 1.64, 1.53 — very nearly a geometric
# ladder already, but nowhere declared as one, and with --dur-1 used ZERO times.
#
# So the ladder is declared, and regularised to an exact ratio:
#
#   GEOMETRIC, because duration discrimination is ratio-based, not additive.
#   The Weber fraction for duration in the 100 ms - 1 s range is about 5-10 %
#   (Gibbon 1977, scalar timing theory), so steps must be well clear of ~10 %
#   or two of them are the same duration to a player. r = 3/2 is five times
#   that fraction: no two steps here can be confused.
#
#   FLOOR 80 ms, because below ~100 ms a response is perceived as instantaneous
#   (Miller 1968, "Response time in man-computer conversational transactions";
#   Nielsen 1993, "Response Times: The 3 Important Limits" — the 0.1 s limit).
#   Under that limit a transition is not read as motion at all, so 80 ms is the
#   shortest duration worth authoring, and it is where a press acknowledgement
#   belongs: felt, not watched.
#
#   CEILING 900 ms, because 1.0 s is the limit for the user's flow of thought
#   to stay uninterrupted (same two sources). Nothing in a one-handed mobile
#   game may cross it.
#
#   THE WORKING BAND IS 120-270 ms. MOTION.md's overriding constraint: "A
#   400 ms transition that is beautiful on a desktop is a transition the player
#   is fighting." So 400 ms and above is reserved for once-per-screen ceremony,
#   and everything a player meets repeatedly lives in three steps in the middle.
#
# 80 * 1.5^n gives 80, 120, 180, 270, 405, 607.5, 911.25. The last three are
# rounded to 400, 600, 900 — at most 1.2 %, which is an order of magnitude
# under the ~10 % Weber fraction above, so the rounding cannot be seen and the
# ladder gets to be readable.
DUR_BASE = 80.0
DUR_RATIO = 1.5
DURATIONS = [
    ('dur-1', 80,  'a press acknowledgement — under the 100 ms instantaneous limit'),
    ('dur-2', 120, 'a state swap: colour, opacity, a chip going active'),
    ('dur-3', 180, 'THE DEFAULT. Anything the player meets more than once'),
    ('dur-4', 270, 'an element entering or leaving its slot'),
    ('dur-5', 400, 'a whole screen changing — ceremony, not traffic'),
    ('dur-6', 600, 'a once-per-run celebration'),
    ('dur-7', 900, 'the boot lock-up. Under the 1 s flow-of-thought limit'),
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
        bag = action.layers[0].strips[0].channelbag(o.animation_data.action_slot,
                                                   ensure=True)
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

def _n(v):
    """Four decimals, no trailing zeros, no leading zero — CSS house style."""
    s = ('%.4f' % v).rstrip('0').rstrip('.')
    if s.startswith('0.'):
        s = s[1:]
    elif s.startswith('-0.'):
        s = '-' + s[2:]
    return s or '0'


def css_block(marker_open, marker_close):
    """The generated token block for styles.css."""
    L = [marker_open,
         '  /* Generated by `blender/ui_motion.py` from the F-Curves in',
         '     `blender/lib/curves.py`. DO NOT HAND-EDIT — rerun the script.',
         '     Every curve is named for its JOB. Each line carries the max',
         '     deviation of this cubic-bezier() from the Blender F-Curve it',
         '     came from, measured at %d samples; %s is the exact export of a'
         % (SAMPLES, 'e-0'),
         '     two-key curve and not a rounding. */']
    for c in build():
        x1, y1, x2, y2 = c.css
        L.append('  --curve-%-9s cubic-bezier(%s, %s, %s, %s);%s/* err %.2e  %s */'
                 % (c.name + ':', _n(x1), _n(y1), _n(x2), _n(y2),
                    ' ' * max(1, 46 - len('cubic-bezier(%s, %s, %s, %s);'
                                          % (_n(x1), _n(y1), _n(x2), _n(y2)))),
                    c.css_err, c.job.split('.')[0][:58]))
    L.append('')
    for i, (tok, ms, job) in enumerate(DURATIONS):
        L.append('  --%-9s %-8s /* %s */' % (tok + ':', '%dms;' % ms, job))
    st = next(ms for (t, ms, _) in DURATIONS if t == STAGGER_OF)
    L.append('  --stagger-step: calc(var(--%s) / %d);  /* %g ms — MOTION.md asks '
             'for 20-30 ms per item */' % (STAGGER_OF, STAGGER_DIVISOR,
                                           st / STAGGER_DIVISOR))
    L.append(marker_close)
    return '\n'.join(L)


def js_module():
    """The whole of src/core/motion.js."""
    L = []
    A = L.append
    A('/* GENERATED by `blender/ui_motion.py` from the F-Curves in')
    A(' * `blender/lib/curves.py`. DO NOT HAND-EDIT — rerun the script.')
    A(' *')
    A(' * The same eleven named curves `src/ui/styles.css` consumes as')
    A(' * `--curve-*`, for the frame-driven chains in `src/ui/` that CSS cannot')
    A(' * reach: a number counting up, a needle settling, a canvas repaint.')
    A(' *')
    A(' * JS IS EXACT AND CSS IS NOT, AND THAT IS DELIBERATE.')
    A(' * A CSS `cubic-bezier()` is one cubic Bezier and cannot turn twice, so')
    A(' * the three curves with an interior stationary point — release, settle,')
    A(' * stamp — are approximated there, with the error printed beside each')
    A(' * token in styles.css. Here they are carried as the F-Curve\'s own')
    A(' * segments and evaluated piecewise, so nothing is lost. Where a CSS')
    A(' * transition and a chain in here drive the SAME thing and must agree to')
    A(' * the pixel, use a two-key curve (press, enter, dismiss, reveal, swap,')
    A(' * count, warn, drive) — those are the same curve in both by construction.')
    A(' */')
    A('')
    A('/* [x0,y0, h1x,h1y, h2x,h2y, x3,y3] per segment, in unit-square space. */')
    A('export const CURVES = {')
    for c in build():
        A('  /* %s */' % c.job.replace('*/', ''))
        A('  %s: { segments: [' % c.name)
        for s in c.segments:
            A('    [%s],' % ', '.join('%.6f' % v for v in s))
        A('  ], css: [%s], cssErr: %.3e, tHalf: %.4f, peak: %.4f },'
          % (', '.join('%.4f' % v for v in c.css), c.css_err, c.t_half(), c.peak()))
    A('};')
    A('')
    A('const NAMES = Object.keys(CURVES);')
    A('')
    A('const bez = (p0, p1, p2, p3, s) => {')
    A('  const u = 1 - s;')
    A('  return u * u * u * p0 + 3 * u * u * s * p1 + 3 * u * s * s * p2 + s * s * s * p3;')
    A('};')
    A('')
    A('/* Invert x(s) by bisection, for the same reason curves.py does: x is')
    A('   monotone by construction, so bisection cannot fail, and a Newton step')
    A('   on a near-flat x can leave [0,1] and return a value off a curve nobody')
    A('   authored. 32 halvings is 2.3e-10 — four orders under a device pixel on')
    A('   any travel this UI has. */')
    A('const atX = (x0, h1, h2, x3, x) => {')
    A('  let a = 0, b = 1;')
    A('  for (let i = 0; i < 32; i++) {')
    A('    const m = (a + b) / 2;')
    A('    if (bez(x0, h1, h2, x3, m) < x) a = m; else b = m;')
    A('  }')
    A('  return (a + b) / 2;')
    A('};')
    A('')
    A('/**')
    A(' * Evaluate a named curve. `t` is progress 0..1; the value returned is the')
    A(' * fraction of the travel covered, and MAY EXCEED 1 — `release`, `settle`')
    A(' * and `stamp` overshoot on purpose, which is the whole point of them.')
    A(' *')
    A(' * Throws on an unknown name. A curve library that silently fell back to')
    A(' * linear would be the fifth silent fallback in this codebase (ASTRA §8)')
    A(' * and the one hardest to see: the motion would still happen.')
    A(' */')
    A('export function ease(name, t) {')
    A('  const c = CURVES[name];')
    A('  if (!c) {')
    A('    throw new Error(`motion: no curve named "${name}". The vocabulary is: `')
    A('      + NAMES.join(", "));')
    A('  }')
    A('  if (!(t > 0)) return 0;')
    A('  if (t >= 1) return 1;')
    A('  const segs = c.segments;')
    A('  let s = segs[segs.length - 1];')
    A('  for (let i = 0; i < segs.length; i++) { if (t <= segs[i][6]) { s = segs[i]; break; } }')
    A('  const u = atX(s[0], s[2], s[4], s[6], t);')
    A('  return bez(s[1], s[3], s[5], s[7], u);')
    A('}')
    A('')
    A('/** A curve as a function of one argument, for a hot loop. */')
    A('export const curve = (name) => {')
    A('  if (!CURVES[name]) {')
    A('    throw new Error(`motion: no curve named "${name}". The vocabulary is: `')
    A('      + NAMES.join(", "));')
    A('  }')
    A('  return (t) => ease(name, t);')
    A('};')
    A('')
    A('/* The duration ladder — the same numbers styles.css carries as --dur-*.')
    A('   Geometric, ratio 3/2 from 80 ms. See curves.py for the derivation and')
    A('   its two sources; the short version is that duration discrimination is')
    A('   ratio-based (Weber fraction ~5-10 %), 80 ms is under the 100 ms')
    A('   "instantaneous" limit and 900 ms is under the 1 s flow-of-thought')
    A('   limit (Miller 1968 / Nielsen 1993). SECONDS here, because every')
    A('   frame-driven chain in src/ui/ measures time in seconds. */')
    A('export const DUR = {')
    for (tok, ms, job) in DURATIONS:
        A('  %s: %.3f,%s/* %d ms — %s */' % (tok.replace('dur-', 'd'), ms / 1000.0,
                                             ' ' * 4, ms, job))
    A('};')
    A('')
    st = next(ms for (t, ms, _) in DURATIONS if t == STAGGER_OF)
    A('/** Per-item stagger, seconds. %g ms = --%s / %d; MOTION.md asks for'
      % (st / STAGGER_DIVISOR, STAGGER_OF, STAGGER_DIVISOR))
    A(' *  20-30 ms per item, because a group moving as a block reads flat. */')
    A('export const STAGGER = %.3f;' % (st / 1000.0 / STAGGER_DIVISOR))
    A('')
    A('/**')
    A(' * Reduced motion is a GATE, not a nicety (MOTION.md). Wrap any duration')
    A(' * a frame-driven chain is about to use in this: it collapses the travel')
    A(' * to one frame rather than removing the change, so the value still')
    A(' * ARRIVES and nothing downstream sees a state that never settled.')
    A(' *')
    A(' * It takes the flag rather than reading it, because `shell.js` already')
    A(' * owns the one `matchMedia(\'(prefers-reduced-motion: reduce)\')` in this')
    A(' * repo and ORs it with `state.settings.reducedMotion`. A second reader')
    A(' * here would be two tables describing one thing (ASTRA §5) — and there')
    A(' * is already a live instance of exactly that: `core/renderer.js` reads')
    A(' * `state.settings.reducedMotion` alone, so a player who sets it at the')
    A(' * OS level and not in the game keeps full camera trauma.')
    A(' */')
    A('export const dur = (seconds, reduced) => (reduced ? 1 / 60 : seconds);')
    return '\n'.join(L) + '\n'
