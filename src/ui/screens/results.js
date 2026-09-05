/**
 * RESULTS — the payoff screen.
 *
 * Staged reveal: grade stamp → metres → money → XP → why that grade →
 * the ledger → the bit. Every stage is driven from update(dt), so it respects
 * reduced motion by collapsing the timeline rather than by disabling content.
 *
 * Two rules this screen now obeys:
 *
 * 1. NOTHING IS ASSERTED. A grade letter on its own is a verdict without a
 *    reason. `sim/drilling.js` already computes the whole case — par time
 *    against actual, groove uptime, bit consumed, deviation, hazards met and
 *    handled, safety events — and emits it on HOLE_COMPLETE as `breakdown`.
 *    That evidence is rendered under the XP bar, beside the four criteria
 *    GAMEDESIGN §2.4 grades on.
 *
 * 2. THE MONEY SHOWN IS THE MONEY PAID. When `progression` is mounted it has
 *    already settled the hole through `economy.settleRun` and pushed the real
 *    settlement — gross, itemised costs, net, XP, hours, per-item wear — onto
 *    the career ledger. This screen reads that settlement instead of doing its
 *    own arithmetic, so the headline number is the transaction and not an
 *    estimate of it. The local calculation survives only as the fallback for a
 *    build with no progression system.
 *
 * The reveal is also short. It used to run to 3.6 s, which left everything
 * below the XP bar invisible for the first two seconds the player looks at the
 * screen — the reason the review measured ~46 % void. The whole cascade now
 * finishes inside 1.2 s.
 */
import { SCENES, EVENTS, clamp } from '../../core/contract.js';
import { GRADES, roleAt, regionInfo, methodInfo } from './catalog.js';

/**
 * Grade thresholds on the weighted composite, highest first.
 * These mirror `T.score.grades` in `sim/drilling.js`; they are duplicated here
 * only so the screen can name the next grade and what it costs. The sim should
 * publish them on the HOLE_COMPLETE payload so this table can be deleted.
 */
const GRADE_BANDS = [['S', 0.90], ['A', 0.78], ['B', 0.62], ['C', 0.44], ['D', 0]];

/**
 * "Level 12 — Derrickman", or just "Level 12" when game/data.js is not mounted
 * and there is no ladder to name the rank from. The level is a real number the
 * screen owns; the title is content, and content is never invented here.
 */
const roleLabel = (lvl, prefix, sep = ' — ') => {
  const role = roleAt(lvl);
  return role ? `${prefix}${sep}${role.title}` : prefix;
};

/** "Nordic Forest · DTH", degrading to whichever half data.js can still name. */
function contractSub(c) {
  const parts = [regionInfo(c.region)?.name, methodInfo(c.method)?.name].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Content unavailable';
}

/** Cost keys from economy.settleRun, in the order a tender reads them. */
const COST_LINES = [
  ['consumables', 'Consumables', 'Bits, rods and crowns worn'],
  ['flushing', 'Flushing medium', 'Air, water or mud'],
  ['materials', 'Materials', 'Casing, grout and concrete'],
  ['fuel', 'Fuel', 'Diesel on tools'],
  ['upkeep', 'Upkeep', 'Machine hours and standby'],
  ['insurance', 'Insurance', 'Plant cover'],
  ['depreciation', 'Depreciation', 'Written down over the hours'],
  ['crew', 'Crew', 'Day rates on site'],
  ['setup', 'Site setup', 'Rig-up on the peg'],
  ['travel', 'Travel', 'Getting the spread here'],
  ['overhead', 'Overhead', 'Running the business'],
];

export function createResultsScreen(app) {
  const { C, state, fmtMoney } = app;

  /* ── Formatters ───────────────────────────────────────────────────────── */
  /** Run clock. Hours appear only once there are hours to show. */
  function fmtClock(sec) {
    const s = Math.max(0, Math.round(sec || 0));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return hh > 0 ? `${hh}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
  }
  /** The same duration in prose, for evidence lines and ledger quantities. */
  function fmtSpan(sec) {
    const s = Math.max(0, sec || 0);
    if (s < 1) return '—';
    if (s < 90) return `${Math.round(s)} s`;
    if (s < 5400) return `${Math.round(s / 60)} min`;
    return `${(s / 3600).toFixed(1)} h`;
  }
  const pct = (v) => `${Math.round(clamp(v, 0, 1) * 100)}%`;
  /* `scoreOf(x, fallback)` used to live here. It is gone deliberately: its
     whole job was to substitute a locally invented number for a missing one,
     and every one of its four call sites passed an invention. `publishedScore`
     in buildSummary() replaces it and returns null instead. Do not reintroduce
     a helper whose signature has a fallback parameter. */
  const obj = (x) => (x && typeof x === 'object' ? x : null);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  /* ── Static frame ─────────────────────────────────────────────────────── */
  /* '—', not 'B'. The frame is authored before any hole exists, so whatever
     stands here is a grade the screen is asserting on no evidence at all —
     and it is live in the DOM until the 0.06 s stamp fires. */
  const gradeLetter = C.h('span.grade__l', { text: '—' });
  const gradeEl = C.h('div.grade', { role: 'img', 'aria-label': 'Grade not recorded' }, C.h('i.grade__ring'), gradeLetter);
  const titleEl = C.h('h1.results__title', { text: 'Hole complete' });
  const subEl = C.h('p.results__eyebrow', { text: 'Contract closed' });
  /* The grade never stands alone: this line carries the composite it came from
     and what the next grade up would have cost. */
  const verdictEl = C.h('p.results__eyebrow', { text: '' });

  /* Both open on a dash. '0.0 m' and '00:00' are the two readings a hole
     that went nowhere would produce, so as placeholders they are
     indistinguishable from a measurement — and they are on screen until the
     0.34 s stage. */
  const mDepth = metric('—', 'Drilled');
  const mTime = metric('—', 'On tools');
  /* `metric('0 m/h', 'Avg ROP')` used to be the third tile here, and it was
     the last invented number left on this screen after 75e2f27.

     It read `depth / (timeSec / 3600)`. `timeSec` is the PLAYER's clock and
     the sim runs the hole at `timeCompression: 48`, so the quotient was ~48x
     the rate the player had just spent the whole run watching in the HUD —
     which meant it hit the `clamp(..., 0, 200)` written to guard it and
     printed a flat `200.0 m/h` on essentially every hole. The `/45` was taken
     out of the Speed tile and the same shape survived one row above it.

     Nothing in HOLE_COMPLETE is an average rate: `S.rop` is instantaneous and
     downhole, `timeSec` is the player's, and no downhole clock is published.
     There is therefore nothing to print, and a hero stat is the worst place
     on the screen to guess. CROSS-FILE: for this tile to come back,
     sim/drilling.js has to publish the run's own average — hole metres over
     downhole hours — on the payload. Until it does, two tiles. */
  const metricsEl = C.h('div.rmetrics.reveal', mDepth.el, mTime.el);

  /* '—', not '€0'. A zero in the payout slot is a claim about the hole. */
  const moneyNum = C.h('div.rmoney__v', { text: '—' });
  const moneyRoll = C.NumberRoll(moneyNum, { value: 0, duration: 0.8, format: (v) => fmtMoney(v) });
  const moneyKey = C.h('p.rmoney__k', { text: 'Payout' });
  const moneyEl = C.h('div.rmoney.reveal', moneyNum, moneyKey);

  const xpBar = C.Bar({ kind: 'amber', label: 'Experience to next level' });
  xpBar.el.classList.add('bar--tall', 'bar--smooth');
  // Blank, not 'LVL 1' / '+0 XP': both are real values a real player can hold.
  const xpFrom = C.h('span.label', { text: '' });
  const xpGain = C.h('span.label', { text: '' });
  const levelUpSlot = C.h('div');
  const xpEl = C.h('div.rxp.reveal',
    C.h('div.rxp__head', xpFrom, xpGain),
    xpBar.el,
    levelUpSlot,
  );

  /* ── Grade breakdown: the four criteria, with the evidence behind each ─── */
  const crits = {
    speed: critTile('Speed'),
    straightness: critTile('Straightness'),
    toolCare: critTile('Tool care'),
    safety: critTile('Safety'),
  };
  const critGrid = C.h('div.rmetrics', { style: { 'grid-template-columns': 'repeat(2, 1fr)' } },
    crits.speed.el, crits.straightness.el, crits.toolCare.el, crits.safety.el);
  const scoreList = C.h('dl.specs', { style: { 'margin-top': 'var(--s-4)' } });
  /* `.results__inner` centres its children, so a block with no width declared
     shrink-to-fits and the panel ends up narrower than the metric row above it.
     `.rmetrics` and `.rxp` carry `width: 100%` in styles.css for exactly this
     reason; these three panels were missing it. */
  const FULL = { width: '100%' };
  const scoreEl = C.h('div.reveal', { style: FULL },
    C.SectionTitle('Grade breakdown'),
    C.h('div.panel.panel--pad', C.h('div.panel__body', critGrid, scoreList)),
  );

  /* ── The ledger ───────────────────────────────────────────────────────── */
  const consumeList = C.h('div');
  const consumeEl = C.h('div.reveal', { style: FULL },
    C.SectionTitle('What the hole cost'),
    C.h('div.panel.panel--pad', C.h('div.panel__body', consumeList)),
  );

  /* ── Bit condition ────────────────────────────────────────────────────── */
  const wearBefore = C.Bar({ kind: 'steel', label: 'Bit life before' });
  const wearAfter = C.Bar({ kind: 'warning', label: 'Bit life after' });
  wearBefore.el.classList.add('bar--tall', 'bar--smooth');
  wearAfter.el.classList.add('bar--tall', 'bar--smooth');
  /* '—', not '100% life'. These are only written when a before/after was
     actually recorded, and  is the one thing keeping the
     literals off screen — one attribute away from printing a fresh crown
     over a hole that ground one out. */
  const wearBeforeV = C.h('span.rmetric__k', { text: '—' });
  const wearAfterV = C.h('span.rmetric__k', { text: '—' });
  const wearBitName = C.h('p.icard__blurb', { text: '—' });
  const wearNote = C.h('p.cdetail__brief', {
    style: { 'font-size': 'var(--t-2xs)', 'margin-top': 'var(--s-3)' }, text: '',
  });
  // Everything else that was fitted and got used up. progression.applyWear
  // reports one line per consumable, which is the honest answer to "what did
  // this hole eat".
  const wearList = C.h('dl.specs', { style: { 'margin-top': 'var(--s-3)' } });
  /* Named, because it is hidden outright when no before/after was recorded:
     two bars at zero under the words "Before" and "After" is a measurement
     claim of its own. */
  const wearCmp = C.h('div.wearcmp', { style: { 'margin-top': '10px' } },
    C.h('div.wearcmp__col', C.h('p.wearcmp__k', { text: 'Before' }), wearBefore.el, wearBeforeV),
    C.h('span.wearcmp__arrow', C.Icon('chevron', 18)),
    C.h('div.wearcmp__col', C.h('p.wearcmp__k', { text: 'After' }), wearAfter.el, wearAfterV),
  );
  const wearEl = C.h('div.reveal', { style: FULL },
    C.SectionTitle('Tooling condition'),
    C.h('div.panel.panel--pad', C.h('div.panel__body',
      wearBitName,
      wearCmp,
      wearNote,
      wearList,
    )),
  );

  /* The actions are NOT part of the staged reveal and are NOT sticky. There has
     to be a visible way off this screen in the first frame; the old sticky bar
     sat in the middle of the page (the content never overflowed) and stayed
     invisible for the best part of a second. */
  const againBtn = C.Button({ label: 'Next contract', kind: 'amber', icon: 'play', onTap: () => app.nav(SCENES.CONTRACTS) });
  const shopBtn = C.Button({ label: 'iMarket', kind: 'ghost', icon: 'cart', onTap: () => app.nav(SCENES.SHOP) });
  const actionsEl = C.h('div.results__actions', shopBtn, againBtn);

  const scroll = C.h('div.scroll',
    C.h('div.results__inner',
      subEl,
      gradeEl,
      titleEl,
      verdictEl,
      metricsEl,
      moneyEl,
      xpEl,
      scoreEl,
      consumeEl,
      wearEl,
    ),
  );
  const el = C.h('div.results', scroll, actionsEl);

  function metric(v, k) {
    const vEl = C.h('div.rmetric__v', { text: v });
    return { el: C.h('div.rmetric', vEl, C.h('div.rmetric__k', { text: k })), v: vEl };
  }

  /**
   * One grade criterion: label, score, meter, and the measurement the score
   * came from. Built entirely from the existing metric-tile and bar classes so
   * the block needs no stylesheet of its own.
   */
  function critTile(label) {
    const bar = C.Bar({ kind: 'amber', label });
    bar.el.classList.add('bar--smooth');
    const v = C.h('div.rmetric__v', { text: '—' });
    const ev = C.h('div', {
      style: {
        'font-size': 'var(--t-2xs)',
        color: 'var(--c-fg-muted)',
        'line-height': 'var(--lh-snug)',
        'margin-top': '6px',
      },
      text: '',
    });
    const tile = C.h('div.rmetric',
      C.h('div.rmetric__k', { style: { 'margin-top': '0' }, text: label }),
      v,
      C.h('div', { style: { margin: '8px 0 0' } }, bar.el),
      ev,
    );
    return { el: tile, v, ev, bar };
  }

  function ledgerRow(name, qty, cost, cls = '') {
    return C.h('div.ritem' + cls,
      C.h('span.ritem__n', { text: name }),
      C.h('span.ritem__q', { text: qty }),
      C.h('span.ritem__c', { text: cost }),
    );
  }

  /* ── Timeline ─────────────────────────────────────────────────────────── */
  let timeline = [];
  let clock = 0;
  let summary = null;
  /* One warning per screen instance, not per hole — a producer sending the
     wrong payload shape sends it every time, and forty identical lines in the
     console is how a real one gets scrolled past. */
  let warnedUnscored = false;
  let warnedGrade = false;

  function at(t, fn) { timeline.push({ t, fn, done: false }); }

  /**
   * The settlement progression actually booked for this hole, or null.
   *
   * ── WHY THE ENTRY IS ALREADY THERE ────────────────────────────────────
   * NOT because of load order. This comment used to claim progression was
   * "registered first (main.js loads progression before ui)", and that is
   * backwards: main.js awaits `ui.init()` at line 196 BEFORE it initialises
   * the rest, and both systems subscribe inside their own init() — so the
   * shell's HOLE_COMPLETE listener is registered FIRST and used to mount this
   * screen before `completeHole()` had written anything. `lastSettlement()`
   * then read a ledger whose head was the PREVIOUS hole, and neither the
   * contract-id nor the ±5 % depth guard below can tell two runs of the same
   * contract apart.
   *
   * What makes the entry present is that ui/shell.js now defers the show by
   * one microtask. bus.emit is synchronous, so every listener — progression
   * included — has run to completion before this screen mounts, whatever the
   * subscription order turns out to be. The guards below stay: they are what
   * catches it if that deferral is ever removed.
   */
  function lastSettlement(contractId, depth) {
    if (!app.ctx.progression) return null;
    const ledger = state.player?.career?.ledger;
    if (!Array.isArray(ledger) || !ledger.length) return null;
    const s = ledger[0];
    if (!s || typeof s.net !== 'number') return null;
    if (contractId && s.contractId && s.contractId !== contractId) return null;
    /* A stale entry from an earlier hole would misreport this one. With
       `depth` now null rather than 0 when nothing published one, this check
       cannot run — and a check that cannot run has not passed, so the
       settlement is refused instead of accepted unverified. That is the
       whole point of the guard: it exists for the case where the deferral in
       shell.js is removed, and that is exactly the case where the payload is
       incomplete. */
    if (depth === null) return null;
    if (depth > 0 && typeof s.depth === 'number'
      && Math.abs(s.depth - depth) > Math.max(1, depth * 0.05)) return null;
    return s;
  }

  function buildSummary(params) {
    /* The payload reaches this screen two ways: wrapped by ui/shell.js as
       `{ result }` on the HOLE_COMPLETE bridge, and flat from the QA bridge in
       main.js. Reading only the wrapped shape is why the harness screenshot
       showed 00:02 on tools — `timeSec: 412` was sitting one level up and was
       never read. */
    const r = (params && (params.result || params)) || {};
    const raw = r.contract || state.contract || null;
    const c = raw ? app.normalizeContract(raw) : null;
    const d = state.drill || {};

    /* `?? 0` USED TO CLOSE THIS CHAIN, and it survived the pass that removed
       every other fallback on the screen — because a hero tile reading
       "0.0 m" looks like a hole that made no progress rather than like a
       measurement nobody took. It also fed `applyRewards`, quietly adding
       zero metres to a career stat, and the `lastSettlement` guard below,
       where `depth > 0` then skipped the staleness check entirely and let an
       EARLIER hole's settlement validate against this one. `null` and a dash:
       same rule as `timeSec` two lines down, which was fixed and this was
       not. */
    const depth = Number.isFinite(r.depth) ? r.depth
      : Number.isFinite(d.depth) ? d.depth
        : null;

    /* HOLE_COMPLETE carries timeSec, and sim/drilling.js mirrors the same run
       clock onto state.drill.timeSec. Those are the only two places the run's
       duration exists.

       `?? r.time ?? d.elapsed` used to stand between them: NEITHER FIELD IS
       WRITTEN BY ANYTHING IN THIS REPOSITORY. And below them sat
       `timeSec = (depth / d.rop) * 3600` — a run clock synthesised from a
       LIVE, INSTANTANEOUS rate read after the run had ended, dressed as a
       measurement in `00:00` form. `null` now, and the screen prints a dash:
       a run whose clock nobody recorded did not take 00:00 either. */
    const timeSec = Number.isFinite(r.timeSec) ? Math.max(0, r.timeSec)
      : Number.isFinite(d.timeSec) ? Math.max(0, d.timeSec)
        : null;

    /* ── The four criteria ────────────────────────────────────────────────
       The sim's breakdown is the authority. Its `time`, `straightness`, `bit`
       and `safety` scores ARE the four GAMEDESIGN §2.4 axes; `groove`,
       `hazards` and `rods` are the supporting evidence. Only when no breakdown
       arrived (a build without the sim, or a QA jump) are they estimated from
       state.drill. */
    const bd = r.breakdown || null;
    const bTime = obj(bd?.time);
    const bBit = obj(bd?.bit);
    const bStraight = obj(bd?.straightness);
    const bSafety = obj(bd?.safety);
    const bGroove = obj(bd?.groove);
    const bHaz = obj(bd?.hazards);
    const bRods = obj(bd?.rods);

    /* ── THE SIM IS THE ONLY SOURCE. THERE IS NO SECOND ONE. ──────────────
       Four `est*` expressions used to sit here, manufacturing a score out of
       state.drill whenever the payload was thin and printing it in the same
       typeface as the measured numbers with nothing to mark it as invented.
       The worst was

           const estSpeed = clamp(avgRop / 45, 0, 1);

       — one hard-coded 45 m/h denominator for every method in the game. On a
       job whose nominal is 6 m/h (`nominalRop`, game/data.js — e.g.
       site-investigation and overburden) a player who made 8.3 m/h, well ABOVE
       nominal, was shown SPEED 18 %. The other three were the same shape:
       0.55 + greenBandTime/40 for straightness, 1 - wear for tool care,
       state.drill.stability for safety. Not one of them is the quantity its
       own label names, and all four survived review because they looked like
       data.

       Speed is scored on TIME AGAINST PAR — `breakdown.time.score`, with
       parSec/actualSec published beside it as the evidence — and never on ROP
       against a constant, so there was never anything here to fall back to
       even in principle.

       A criterion the sim did not publish is therefore UNMEASURED, is null,
       and the screen says so. Rubric axis 11: an absent number is honest, a
       wrong one is not, and the wrong one is the one that gets believed. */
    const publishedScore = (x) => {
      if (typeof x === 'number' && Number.isFinite(x)) return clamp(x, 0, 1);
      if (x && typeof x.score === 'number' && Number.isFinite(x.score)) return clamp(x.score, 0, 1);
      return null;
    };

    const scores = {
      speed: publishedScore(bd?.time),
      straightness: publishedScore(bd?.straightness),
      toolCare: publishedScore(bd?.bit ?? bd?.bitLife),
      safety: publishedScore(bd?.safety),
      groove: publishedScore(bd?.groove),
    };

    /* One warning naming exactly which criteria arrived unscored, so a producer
       sending the wrong payload shape is findable from the console instead of
       from a screenshot two rounds later. */
    const unscored = ['speed', 'straightness', 'toolCare', 'safety'].filter((k) => scores[k] === null);
    if (bd && unscored.length && !warnedUnscored) {
      warnedUnscored = true;
      console.warn('[ui] results: HOLE_COMPLETE carried a breakdown but no score for '
        + `${unscored.join(', ')} — those criteria are shown as unmeasured. The sim `
        + 'publishes breakdown.{time,straightness,bit,safety,groove}.score; a producer '
        + 'emitting a FLAT breakdown (main.js showResults(), the QA bridge) does not '
        + 'match that shape and will land here.');
    }

    /* The evidence behind each score, in the units PLATFORM_TRUTH Part C
       demands, and only ever from what the sim published. Deviation is carried
       by the sim in its own arbitrary units, so it is reported as the share of
       the tolerance it used up rather than as a fabricated angle or offset.
       Where there is no measurement there is no sentence — not a substitute. */
    /* `?? 0` and `|| 0` are `scoreOf`'s deleted `fallback` parameter spelled
       with an operator: they substitute a number nobody measured and print it
       in the same typeface as one that was. Every line below therefore reads
       its inputs as NUMBERS OR NOTHING — `num()` — and a missing input costs
       the sentence, not its meaning. */
    const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
    const bDev = num(bStraight?.deviation);
    const bTol = num(bStraight?.maxDeviation ?? bStraight?.tolerance);
    const bConsumed = num(bBit?.consumed01);
    const evEvents = num(bSafety?.events);
    const evJams = num(bSafety?.jams);
    const evidence = {
      speed: bTime && num(bTime.actualSec) !== null && num(bTime.parSec) !== null
        ? `${fmtSpan(bTime.actualSec)} against ${fmtSpan(bTime.parSec)} par` : null,
      /* `pct(1 - scores.straightness)` used to stand here, and it is not the
         quantity its own sentence names. The score is `clamp(1 - deviation /
         maxDev)`, so inverting it recovers the deviation ONLY while the clamp
         is inactive: a hole that used three times its tolerance clamps to a
         score of 0 and this line then said, precisely, "100 % of the drift
         tolerance used". The sim publishes `straightness.deviation` and has
         never published the tolerance it was measured against, so there is no
         honest ratio to print. CROSS-FILE: sim/drilling.js should publish the
         tolerance beside the deviation; until it does there is no sentence. */
      straightness: (bDev !== null && bTol !== null && bTol > 0)
        ? `${pct(bDev / bTol)} of the drift tolerance used` : null,
      toolCare: bConsumed === null ? null
        : `${bConsumed.toFixed(2)} of a crown${bBit.bitsUsed ? ` · ${plural(bBit.bitsUsed, 'change')}` : ''}`,
      /* "no incidents, no stuck string" is a POSITIVE CLAIM. It used to be
         printed whenever both counters were absent or zero — so a payload
         that published neither had the screen vouch for the run's safety on
         no evidence at all. Both must be present numbers to say either. */
      safety: (evEvents === null || evJams === null) ? null
        : ((evEvents || evJams)
          ? `${plural(evEvents, 'incident')} · ${plural(evJams, 'stuck string')}`
          : 'no incidents, no stuck string'),
    };

    /* The composite. Only the sim's own weighted total counts. The local
       re-derivation that used to stand here — 0.30/0.28/0.24/0.18 over the four
       criteria, scaled by completion — was a fifth invented number on a screen
       that already had four, and it is now impossible anyway: with the est*
       scores gone the operands can be null. No total published, no score shown. */
    const compositeKnown = typeof bd?.total === 'number' && Number.isFinite(bd.total);
    const composite = compositeKnown ? clamp(bd.total, 0, 1) : null;

    /* The settlement, when there is one, IS the transaction. */
    const settle = lastSettlement(c?.id ?? raw?.id ?? null, depth);

    /* ── THE LETTER AND THE SCORE MUST AGREE ──────────────────────────────
       The screenshot that failed review read `SCORE 51 % · grade B` — and B
       starts at 62 %, on the very same line. Both numbers were on screen at
       once and they contradicted each other, because the letter was taken from
       the payload at face value (`r.grade || bd.grade || settle.grade`) while
       the percentage came from `breakdown.total`. A producer that sets them
       independently — main.js showResults() hard-codes `grade: 'B'` next to
       `total: 0.51` — put a self-refuting frame on screen and nothing noticed.

       So when the composite is known, the letter is DERIVED from it through
       the same bands the screen quotes to the player ("B starts at 62 %"). The
       player can then check the arithmetic in the frame and it holds. A stated
       letter that disagrees is a producer bug, and it is said out loud rather
       than displayed. */
    const bandFor = (v) => {
      for (const [g, thr] of GRADE_BANDS) if (v >= thr) return g;
      return GRADE_BANDS[GRADE_BANDS.length - 1][0];
    };
    const statedGrade = r.grade || bd?.grade || settle?.grade || null;
    let grade;
    if (compositeKnown) {
      grade = bandFor(composite);
      if (statedGrade && statedGrade !== grade && !warnedGrade) {
        warnedGrade = true;
        console.warn(`[ui] results: payload says grade "${statedGrade}" but its own `
          + `breakdown.total ${composite.toFixed(4)} falls in band "${grade}" `
          + `(${grade} starts at ${GRADE_BANDS.find(([g]) => g === grade)[1]}). `
          + 'Showing the band the score is actually in — a letter that contradicts the '
          + 'percentage printed beside it is a frame that refutes itself. Fix the producer.');
      }
    } else {
      grade = statedGrade;   // may be null: nothing published a verdict at all
    }
    const gradeIdx = Math.max(0, GRADES.indexOf(grade));
    const nextGrade = grade && gradeIdx < GRADES.length - 1 ? GRADES[gradeIdx + 1] : null;
    const nextBand = nextGrade ? GRADE_BANDS.find(([g]) => g === nextGrade) : null;
    const nextAt = nextBand ? nextBand[1] : null;

    /* ── Money ──────────────────────────────────────────────────────────── */
    let payout = null;
    let costs = null;
    let net = null;
    let xp = null;
    const items = [];
    let hours = null;

    if (settle) {
      /* `|| 0` AND `?? (payout - costs)` STOOD IN ALL FOUR OF THESE.
         A settlement missing its revenue printed "Gross payout €0"; one
         missing its costs object printed "Running costs €0" and then a net
         that equalled the gross — a coherent, plausible, entirely invented
         ledger. That is the same defect this screen was cleaned once to
         remove, surviving in the half of it no harness renders. A zero is
         not a blank: it is the claim "this hole earned nothing", and nobody
         would ever have gone back to check it. */
      const num = (v) => (Number.isFinite(v) ? Math.round(v) : null);
      payout = num(settle.revenue);
      costs = num(settle.costs?.total);
      /* The subtraction survives, because gross and costs are both printed
         and a player can check it by eye. It is available only when BOTH
         are: a net derived from a missing half is the same invention with an
         extra step in front of it. */
      net = num(settle.net) ?? (payout !== null && costs !== null ? payout - costs : null);
      xp = num(settle.xp);
      hours = Number.isFinite(settle.hours) ? settle.hours : null;
      /* Each line is rounded on its own and any line rounding to zero is
         dropped, so the visible rows can sum to less than the subtotal under
         them. The remainder is carried as one line rather than left to the
         reader to notice.

         SIGNED, and `!== 0` rather than `> 0`. Eleven independent roundings
         drift in both directions, so `rest` can be negative — rows summing
         to MORE than the subtotal above them — and that case was silently
         dropped, which is the discrepancy the line exists to close running
         the other way. The caption no longer says "lines under €1 each"
         either: it is those lines PLUS the rounding drift, and naming only
         half of what a number contains is how a label stops being true. */
      let shown = 0;
      for (const [key, name, note] of COST_LINES) {
        const v = settle.costs?.[key];
        if (!Number.isFinite(v) || Math.round(v) <= 0) continue;
        items.push({ name, qty: note, cost: Math.round(v) });
        shown += Math.round(v);
      }
      const rest = costs === null ? 0 : costs - shown;
      if (rest !== 0) items.push({ name: 'Other running costs', qty: 'small lines and rounding', cost: rest });
    }
    /* THE ELSE BRANCH IS GONE, AND IT WAS THE LARGEST FALSEHOOD ON THIS
       SCREEN. It read, in full: a grade bonus table {D:0, C:.05, B:.12,
       A:.22, S:.4}; `depth * 180` for a payout; `rods x 3 m`, `x 4` each;
       `depth * 12` litres of flush at `depth * 1.6`; `hours * 62` of fuel;
       and `depth * 6 + composite * 240 + greenBandTime * 3` XP. Nine invented
       constants, itemised down a ledger, in the same typeface as a settled
       one, under the heading "Net paid".

       It was not confined to a build without progression either. It is what
       renders whenever `lastSettlement()` finds nothing — which is exactly
       what happens when progression DECLINED to settle the hole (no contract
       anywhere; it says so in the console). So the shipping game could pay
       the player nothing and print a full invoice for it.

       No settlement, no money: every figure stays null and the screen says
       the run was not settled. */

    /* ── The bit ──────────────────────────────────────────────────────────
       `progression.applyWear` records the real before/after condition of every
       fitted consumable, AND IT IS THE ONE THAT CHANGED THE PLAYER'S KIT — the
       garage will show exactly these numbers next time it is opened. That is
       what makes it the traceable source rather than the sim's own `S.wear`,
       which is a second wear model over the same run.

       The fallback that used to stand beside it is deleted:

           1 - Math.max(0, endWear - consumed)

       `consumed01` counts WHOLE CROWNS SPENT, so on any hole where a bit was
       changed `endWear - consumed` goes negative, `Math.max(0, ...)` pins it,
       and the screen drew a "before" bar at 100 % — claiming a fresh crown
       went into a hole that had already eaten one. The sim publishes no start
       wear at all, so there is nothing to draw. Unsettled: no bar. */
    const bitId = state.garage?.loadout?.bit;
    const bit = bitId ? app.itemById(bitId) : null;
    const wornBit = Array.isArray(settle?.worn) ? settle.worn.find((w) => w.slot === 'bit') : null;
    const wearFrom = wornBit && Number.isFinite(wornBit.from) ? clamp(wornBit.from, 0, 1) : null;
    const wearTo = wornBit && Number.isFinite(wornBit.to) ? clamp(wornBit.to, 0, 1) : null;
    /* `from - to` is NOT the consumption when spares were pulled in:
       applyWear() loops `while (after <= 0) { consumed += 1; after += 1 }`, so
       a hole that ate a whole crown ends with `to` ABOVE `from` and the old
       `Math.max(0, from - to)` printed "0 % of the crown consumed". The real
       figure is published beside them as `w.wear`. */
    const wearUsed = wornBit && Number.isFinite(wornBit.wear)
      ? Math.max(0, wornBit.wear)
      : (wearFrom !== null && wearTo !== null && wearTo <= wearFrom ? wearFrom - wearTo : null);

    return {
      contract: c, depth, timeSec, hours,
      grade, composite, compositeKnown, nextGrade, nextAt,
      /* The letter the MONEY was priced at. `settleRun` used the payload's
         own grade; the stamp above shows the band the composite falls in. A
         producer that disagrees with itself put a "grade C" caption on a
         payout that was paid at B, and this row is where that showed. */
      paidGrade: settle && settle.grade ? String(settle.grade) : null,
      payout, costs, net, xp, items, settled: !!settle,
      wearFrom, wearTo, wearUsed,
      bitsChanged: Number.isFinite(bBit?.bitsUsed) ? bBit.bitsUsed : null,
      bitName: wornBit?.name || (bit ? bit.name : null),
      wornOther: Array.isArray(settle?.worn) ? settle.worn.filter((w) => w.slot !== 'bit') : [],
      scores, evidence,
      parKnown: !!bTime,
      groove: bGroove, hazards: bHaz, rods: bRods,
    };
  }

  /**
   * Book what this screen can honestly book when progression is not mounted.
   *
   * It used to pay `sm.net` and `sm.xp` — both from the invented ledger that
   * `buildSummary` no longer builds — and level the player up on the proceeds.
   * A view is a poor place to run an economy, and it is an indefensible place
   * to run an INVENTED one. What survives is the part that is measured: the
   * hole was drilled and it is counted. Money and XP come from
   * game/progression.js or from nowhere.
   */
  function applyRewards(sm) {
    if (app.ctx.progression) return;
    const p = state.player;
    if (!p) return;
    p.stats = p.stats || {};
    // A hole whose depth nobody published adds nothing to a career total.
    if (sm.depth !== null) p.stats.metresDrilled = (p.stats.metresDrilled || 0) + sm.depth;
    p.stats.holesDone = (p.stats.holesDone || 0) + 1;
    if (sm.grade === 'S') p.stats.perfectRuns = (p.stats.perfectRuns || 0) + 1;
  }

  return {
    el,

    mount(params) {
      summary = buildSummary(params);
      const sm = summary;
      /* Handed in by ui/shell.js, which holds it across the settlement
         microtask. There is no way to recover it from state at mount time —
         see the level-up block below. */
      const levelUp = (params && params.levelUp) || null;
      const c = sm.contract;
      const fast = app.reducedMotion;

      subEl.textContent = c ? contractSub(c) : 'Contract closed';
      titleEl.textContent = c ? c.title : 'Hole complete';

      // Reset visuals to their pre-reveal state.
      for (const n of el.querySelectorAll('.reveal')) n.classList.remove('is-in');
      gradeEl.classList.remove('is-stamp');
      verdictEl.textContent = '';
      C.clear(levelUpSlot);
      C.clear(consumeList);
      C.clear(scoreList);
      C.clear(wearList);
      moneyRoll.setInstant(true); moneyRoll.to(0); moneyRoll.setInstant(false);
      xpBar.setValue(0);
      wearBefore.setValue(0); wearAfter.setValue(0);
      /* THE REST OF THE STATIC FRAME, RESET FOR THE SAME REASON AS
         `is-unmeasured` ABOVE. ui/shell.js caches this screen instance and
         re-mounts it, so anything the constructor wrote and the timeline does
         not always overwrite is the PREVIOUS hole's answer sitting on screen
         under this hole's heading — or, on the first run, the literal the
         file was authored with. The stamp opened as a hard-coded 'B'; the
         payout as '€0'; the two wear captions as '100% life', one attribute
         away from printing a fresh crown over a hole that ground one out.
         Each is now blanked here and written only from something measured. */
      gradeLetter.textContent = '—';
      gradeEl.setAttribute('aria-label', 'Grade not recorded');
      moneyNum.textContent = '—';
      moneyKey.textContent = '';
      xpFrom.textContent = '';
      xpGain.textContent = '';
      wearBitName.textContent = '—';
      wearNote.textContent = '';
      wearBeforeV.textContent = '—';
      wearAfterV.textContent = '—';
      for (const k of Object.keys(crits)) {
        crits[k].bar.setValue(0);
        crits[k].v.textContent = '—';
        crits[k].ev.textContent = '';
        /* The screen instance is cached and re-mounted, so an unmeasured
           marker left from the previous hole would dress a measured one. */
        crits[k].el.classList.remove('is-unmeasured');
      }
      scroll.scrollTop = 0;

      /* The player's level AS IT IS NOW — which is after the settlement, and
         is the only level this screen can actually observe. It used to be
         called `lvlBefore` and captioned as the level the run started at;
         progression.completeHole() had already run by then (ui/shell.js mounts
         this screen from a microtask precisely so that it has), so the caption
         named one level and printed another. `xpBefore` and `need0` went with
         it — see the XP bar. */
      /* `|| 1` used to close this, so a state with no player on it printed
         "LVL 1 · Trainee" — a rank, in the caption slot, for a player whose
         level nothing had recorded. Level 1 is a real level a real player can
         be at, which is what makes the default undetectable. */
      const lvlNow = Number.isFinite(state.player?.level) ? state.player.level : null;
      applyRewards(sm);

      timeline = [];
      clock = 0;
      const S = fast ? 0.02 : 1;

      at(0.06 * S, () => {
        /* Nothing published a verdict — neither a total nor a letter. An
           em dash is the honest stamp; 'D' would be a sentence nobody passed. */
        gradeLetter.textContent = sm.grade || '—';
        gradeEl.setAttribute('aria-label', sm.grade ? `Grade ${sm.grade}` : 'Grade not recorded');
        gradeEl.classList.add('is-stamp');
        if (!fast) { const f = C.h('i.grade__flash'); gradeEl.appendChild(f); setTimeout(() => f.remove(), 1200); }
        app.haptic('heavy');
      });

      at(0.24 * S, () => {
        /* The verdict, in one line, directly under the letter. The score is
           only quoted when the sim published the composite the grade actually
           came from — quoting a locally re-derived number next to a grade
           awarded elsewhere is how a screen ends up contradicting itself. */
        if (!sm.compositeKnown) {
          /* 'Graded on speed, straightness, tool care and safety' used to
             stand here, and it was false on every method in the game.

             The composite is SEVEN axes, not four: sim/drilling.js:725
             weights time .24, groove .26, bit .14, straight .14, hazard .12,
             safety .10, quality 0. The four this screen tiles are 0.62 of the
             letter on a plain rotary — and on the six quality-weighted
             methods it is far worse: the jumbo (:1297) weights quality at
             .62 and the four printed tiles at 0.22. A player could read four
             green tiles under a D and the frame would not reconcile.

             It was also printed in the one branch where the screen knows
             LEAST: no composite was published at all, so the letter came from
             a producer this screen cannot see into. Naming a formula for a
             number you did not receive is the confident half of a guess.
             Say what is actually true of this branch instead.

             CROSS-FILE: `breakdown.weights` and `breakdown.quality` are both
             on the payload already (drilling.js:7877-7878) and both ignored
             here. Rendering the real axes is the fix; this is the honest
             holding line until someone does it. */
          verdictEl.textContent = sm.grade
            ? 'The score behind this grade was not published'
            : 'This run was not scored';
        } else if (sm.nextGrade && sm.nextAt !== null) {
          verdictEl.textContent = `Score ${pct(sm.composite)} · ${sm.nextGrade} starts at ${pct(sm.nextAt)}`;
        } else {
          verdictEl.textContent = `Score ${pct(sm.composite)} · top grade`;
        }
      });

      at(0.34 * S, () => {
        mDepth.v.textContent = sm.depth === null ? '—' : `${sm.depth.toFixed(1)} m`;
        mTime.v.textContent = sm.timeSec === null ? '—' : fmtClock(sm.timeSec);
        metricsEl.classList.add('is-in');
      });

      at(0.50 * S, () => {
        moneyEl.classList.add('is-in');
        if (sm.settled && sm.net !== null) {
          moneyKey.textContent = 'Net paid';
          moneyRoll.to(sm.net);
          app.haptic('success');
        } else if (sm.settled) {
          /* Settled, but the settlement did not carry a net and neither half
             of the subtraction was available either. Rolling a null through
             NumberRoll would have printed €0 and called it the payout. */
          moneyNum.textContent = '—';
          moneyKey.textContent = 'The settlement recorded no payout';
        } else {
          /* Nothing was booked, so nothing was paid. The headline used to
             carry an estimate here under the word "Payout"; a dash and the
             reason are what the player can act on. */
          moneyNum.textContent = '—';
          moneyKey.textContent = 'This run was not settled';
        }
      });

      at(0.68 * S, () => {
        xpEl.classList.add('is-in');
        xpFrom.textContent = lvlNow === null ? '' : roleLabel(lvlNow, `LVL ${lvlNow}`, ' · ');
        xpGain.textContent = sm.xp === null ? '' : `+${sm.xp} XP`;
        /* `clamp((xpBefore + sm.xp) / app.xpForLevel(level))` used to stand
           here and it was wrong three ways at once: `state.player.xp` is
           CUMULATIVE lifetime XP while `xpForLevel` is one level's increment,
           so the ratio passes 1 during level 2 and the bar is pinned full for
           the rest of the game; the settlement's XP was already inside
           `state.player.xp` and was added a second time; and `xpBefore` was
           read at mount, by which point progression had already booked it, so
           it was never "before" anything. One call to the curve's own
           function, on the value the player actually holds. */
        /* No level, no curve to place the player on — the bar draws nothing
           rather than a fraction of a denominator nobody owns. */
        const prog = lvlNow === null ? null : app.xpProgress(state.player?.xp, lvlNow);
        xpBar.setValue(prog && Number.isFinite(prog.frac) ? clamp(prog.frac, 0, 1) : 0);
      });

      // GAMEDESIGN §2.4 grades on speed, straightness, tool care and safety.
      // Those four, with the measurement behind each, sit directly under the
      // XP bar — this is the block that explains the letter.
      at(0.84 * S, () => {
        for (const key of ['speed', 'straightness', 'toolCare', 'safety']) {
          const t = crits[key];
          const v = sm.scores[key];
          /* A criterion the sim did not publish reads '—' with an empty,
             neutral bar and says why. It does NOT get a percentage: this
             screen has no way to compute one, and the last thing it tried
             (avgRop / 45) is the reason the shot failed review. */
          if (v === null) {
            t.v.textContent = '—';
            t.bar.setValue(0);
            t.bar.setKind('steel');   // a declared kind; at value 0 only the track shows
            /* AND IT SAYS THE SAME THING TO A SCREEN READER.
               `C.Bar` is `role="progressbar"` and `setValue(0)` writes
               `aria-valuenow="0"` (components.js:720), so a tile reading
               "—  not measured on this run" was announcing "Speed, 0 percent".
               That is the invented number this screen deleted from the visual
               layer, still asserted on the accessibility one — to the players
               least able to cross-check it against the picture. Without the
               role it is a plain element and announces nothing, which is what
               "not measured" should sound like. */
            t.bar.el.removeAttribute('role');
            t.bar.el.removeAttribute('aria-valuenow');
            t.bar.el.setAttribute('aria-hidden', 'true');
            t.ev.textContent = 'not measured on this run';
            t.el.classList.add('is-unmeasured');
            continue;
          }
          t.el.classList.remove('is-unmeasured');
          // Restored: ui/shell.js caches and re-mounts this screen instance.
          t.bar.el.setAttribute('role', 'progressbar');
          t.bar.el.removeAttribute('aria-hidden');
          t.v.textContent = pct(v);
          t.bar.setValue(v);
          t.bar.setKind(v >= 0.78 ? 'success' : v >= 0.44 ? 'amber' : 'danger');
          t.ev.textContent = sm.evidence[key] || '';
        }

        /* `Hole completed — 100% of 72.0 m` used to head this list, and it
           was a row that could only ever read 100 %: sim/drilling.js's
           `complete()` sets `S.depth = S.target` before it emits, and the
           screen's own `target` fell back to `|| depth || 1`, which forces the
           ratio to 1 from the other side as well. A number with one possible
           value is not a measurement. CROSS-FILE: a partial hole would need
           the sim to publish the target it was aiming at beside the depth it
           reached. */
        const fin = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
        const gUp = fin(sm.groove?.uptime01);
        if (gUp !== null) {
          /* `· best ×1.74` USED TO HANG OFF THIS ROW AND IT WAS NOT A BEST.
             Its source is `groove.bestCombo`, and sim/drilling.js:7880 fills
             that from `D.combo` — the DAMPED DISPLAY value, written every
             frame by `D.combo = damp(D.combo, S.combo, f, dt)` (:7960). What
             the payload carries is therefore the smoothed instantaneous
             multiplier on the last frame of the run.

             It is not a maximum even by accident: `S.combo` is driven by
             `S.greenBandTime`, which DECAYS out of the band (:3669), is
             scaled down on a missed rod (:7370, :7394) and is zeroed outright
             in three places (:6165, :6943, :7439). A player who held a ×2.4
             for the whole hole and dropped the last rod was shown the number
             after the drop, under the word "best".

             Nothing in the sim tracks a peak, so there is nothing here to
             print and the word was the whole invention. CROSS-FILE: for the
             row to come back, sim/drilling.js needs a real
             `S.bestCombo = Math.max(S.bestCombo, S.combo)` in step() — or the
             field renaming to `comboAtFinish`, which is what it actually is. */
          scoreList.appendChild(C.SpecRow('Groove uptime', `${pct(gUp)} in the band`));
        }
        const hSeen = fin(sm.hazards?.seen);
        const hClean = fin(sm.hazards?.clean);
        if (hSeen !== null) {
          scoreList.appendChild(C.SpecRow('Hazards',
            hSeen === 0 ? 'none met'
              : hClean === null ? `${plural(hSeen, 'hazard')} met` : `${hClean} of ${hSeen} handled clean`));
        }
        const rAdd = fin(sm.rods?.added);
        const rOk = fin(sm.rods?.perfect);
        if (rAdd !== null) {
          scoreList.appendChild(C.SpecRow('Rod handling',
            `${plural(rAdd, 'rod')} added${rOk === null ? '' : ` · ${rOk} on the beat`}`));
        }
        // Only worth a row when the sim did not supply par time — otherwise the
        // Speed tile already carries the clock, and so does the hero metric.
        if (!sm.parKnown && sm.timeSec !== null) {
          scoreList.appendChild(C.SpecRow('Time on tools', fmtSpan(sm.timeSec)));
        }
        scoreEl.classList.add('is-in');
      });

      at(0.94 * S, () => {
        /* The level-up comes from the LEVEL_UP event, carried across the
           settlement microtask by ui/shell.js and handed in with the result.

           It used to be `state.player.level > lvlBefore`, with BOTH sides read
           at mount — by which point progression.completeHole() had already
           levelled the player, so the comparison was `n > n` and the block
           never rendered. shell.js was suppressing the toast on this screen
           at the same time, on the grounds that "the screen owns it", so a
           level-up was announced in neither place. */
        if (!levelUp) return;
        const lvl = levelUp.level ?? state.player?.level;
        if (!lvl) return;
        levelUpSlot.appendChild(C.h('div.rlevelup',
          C.Icon('star', 18),
          C.h('span', { text: roleLabel(lvl, `Level ${lvl}`) }),
        ));
        app.haptic('success');
      });

      at(1.02 * S, () => {
        /* No settlement, no ledger. The invoice this used to draw from nine
           invented constants is documented where it was deleted. */
        if (!sm.settled) { consumeEl.classList.add('is-in'); return; }
        for (const it of sm.items) {
          consumeList.appendChild(ledgerRow(it.name, it.qty, '−' + fmtMoney(it.cost), '.ritem--sub'));
        }
        // The running-costs subtotal used to arrive as a toast on top of the
        // grade medallion. It belongs here, above the payout, so the headline
        // number is unambiguously net.
        /* A ROW WITH NOTHING BEHIND IT IS NOT DRAWN. These three used to be
           unconditional over `|| 0`, so a settlement missing any of the three
           figures printed "€0" in the row's own typeface — indistinguishable
           from a hole that genuinely cost nothing, earned nothing or paid
           nothing. Suppressing the row states the gap; a zero hides it. */
        if (sm.costs !== null) {
          consumeList.appendChild(ledgerRow('Running costs', plural(sm.items.length, 'line'), '−' + fmtMoney(sm.costs)));
        }
        if (sm.payout !== null) consumeList.appendChild(C.h('div.ritem',
          C.h('span.ritem__n', { text: 'Gross payout' }),
          /* THE GRADE THE MONEY WAS PRICED AT, which is the settlement's, not
             the stamp's. 75e2f27 made the stamp the band the composite falls
             in — correctly, so the letter and the percentage beside it agree —
             but this caption sits on a figure `economy.settleRun()` computed
             from the payload's own letter. On a producer whose two disagree
             (main.js showResults(): grade 'B', total 0.51) the row read
             "grade C" against money paid at B. */
          C.h('span.ritem__q', { text: sm.paidGrade ? `grade ${sm.paidGrade}` : 'ungraded' }),
          C.h('span.ritem__c.is-pos', { text: fmtMoney(sm.payout) }),
        ));
        if (sm.net !== null) consumeList.appendChild(C.h('div.ritem.ritem--total',
          C.h('span.ritem__n', { text: 'Net paid' }),
          C.h('span.ritem__q', { text: sm.hours > 0 ? `${sm.hours.toFixed(1)} h booked` : '' }),
          C.h('span.ritem__c.is-net', { text: fmtMoney(sm.net) }),
        ));
        consumeEl.classList.add('is-in');
      });

      at(1.12 * S, () => {
        /* The two bars are drawn ONLY from the condition progression actually
           recorded against the fitted item. With nothing recorded they stay at
           zero and say so, rather than reconstructing a "before" out of two
           quantities that do not subtract (see buildSummary). */
        const measured = sm.wearFrom !== null && sm.wearTo !== null;
        wearBitName.textContent = sm.bitName || 'No bit fitted';
        wearCmp.hidden = !measured;
        if (measured) {
          wearBefore.setValue(sm.wearFrom);
          wearAfter.setValue(sm.wearTo);
          wearBeforeV.textContent = `${Math.round(sm.wearFrom * 100)}% life`;
          wearAfterV.textContent = `${Math.round(sm.wearTo * 100)}% life`;
        }
        /* No "over N m": the wear was computed over HOLE metres
           (`progression.holeMetresFor`), and `sm.depth` is the contract's own
           unit — bolts, piles, tunnel advance — which on a bolter differs by
           two orders of magnitude. Two quantities, one preposition. */
        const changed = sm.bitsChanged ? plural(sm.bitsChanged, 'crown') + ' changed downhole' : null;
        /* `pct()` CLAMPS TO 0..1 AND THIS QUANTITY DOES NOT.
           progression.applyWear() runs `while (after <= 0) { consumed += 1;
           after += 1; }` — that loop exists precisely because a hole can eat
           more than one crown — so `wear` above 1 is ordinary, and printing
           it through `pct` capped a 1.7-crown hole at "100 % of the crown
           consumed". A ceiling that silently swallows the interesting cases
           is the clamp inversion this screen already deleted once, in the
           straightness ratio. Over a whole crown the honest unit is crowns. */
        const used = sm.wearUsed === null ? null
          : sm.wearUsed > 1 ? `${sm.wearUsed.toFixed(2)} crowns consumed`
            : `${pct(sm.wearUsed)} of the crown consumed`;
        wearNote.textContent = [changed, used].filter(Boolean).join(' · ')
          || (measured ? '' : 'Wear on this run was not recorded.');
        for (const w of sm.wornOther) {
          if (!Number.isFinite(w.from) || !Number.isFinite(w.to)) continue;
          wearList.appendChild(C.SpecRow(w.name,
            `${Math.round(clamp(w.from, 0, 1) * 100)}% → ${Math.round(clamp(w.to, 0, 1) * 100)}%`));
        }
        wearEl.classList.add('is-in');
      });

      // Tell the world the hole is settled.
      if (state.drill) { state.drill.active = false; }
      if (!app.ctx.progression) {
        app.bus.emit(EVENTS.MONEY_CHANGE, { delta: 0, balance: state.player?.money || 0, reason: null });
      }
    },

    update(dt) {
      clock += dt;
      for (const step of timeline) {
        if (!step.done && clock >= step.t) {
          step.done = true;
          try { step.fn(); } catch (e) { console.error('[ui] results stage', e); }
        }
      }
      moneyRoll.step(dt);
    },

    unmount() { timeline = []; },
    resize() {},
  };
}
