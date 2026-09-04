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
  /** A breakdown entry is either a rich object or a bare score. */
  const scoreOf = (x, fallback = 0) => {
    if (x === null || x === undefined) return fallback;
    if (typeof x === 'number') return clamp(x, 0, 1);
    if (typeof x.score === 'number') return clamp(x.score, 0, 1);
    return fallback;
  };
  const obj = (x) => (x && typeof x === 'object' ? x : null);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  /* ── Static frame ─────────────────────────────────────────────────────── */
  const gradeLetter = C.h('span.grade__l', { text: 'B' });
  const gradeEl = C.h('div.grade', { role: 'img', 'aria-label': 'Grade B' }, C.h('i.grade__ring'), gradeLetter);
  const titleEl = C.h('h1.results__title', { text: 'Hole complete' });
  const subEl = C.h('p.results__eyebrow', { text: 'Contract closed' });
  /* The grade never stands alone: this line carries the composite it came from
     and what the next grade up would have cost. */
  const verdictEl = C.h('p.results__eyebrow', { text: '' });

  const mDepth = metric('0.0 m', 'Drilled');
  const mTime = metric('00:00', 'On tools');
  const mAvg = metric('0 m/h', 'Avg ROP');
  const metricsEl = C.h('div.rmetrics.reveal', mDepth.el, mTime.el, mAvg.el);

  const moneyNum = C.h('div.rmoney__v', { text: '€0' });
  const moneyRoll = C.NumberRoll(moneyNum, { value: 0, duration: 0.8, format: (v) => fmtMoney(v) });
  const moneyKey = C.h('p.rmoney__k', { text: 'Payout' });
  const moneyEl = C.h('div.rmoney.reveal', moneyNum, moneyKey);

  const xpBar = C.Bar({ kind: 'amber', label: 'Experience to next level' });
  xpBar.el.classList.add('bar--tall', 'bar--smooth');
  const xpFrom = C.h('span.label', { text: 'LVL 1' });
  const xpGain = C.h('span.label', { text: '+0 XP' });
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
  const wearBeforeV = C.h('span.rmetric__k', { text: '100% life' });
  const wearAfterV = C.h('span.rmetric__k', { text: '100% life' });
  const wearBitName = C.h('p.icard__blurb', { text: '—' });
  const wearNote = C.h('p.cdetail__brief', {
    style: { 'font-size': 'var(--t-2xs)', 'margin-top': 'var(--s-3)' }, text: '',
  });
  // Everything else that was fitted and got used up. progression.applyWear
  // reports one line per consumable, which is the honest answer to "what did
  // this hole eat".
  const wearList = C.h('dl.specs', { style: { 'margin-top': 'var(--s-3)' } });
  const wearEl = C.h('div.reveal', { style: FULL },
    C.SectionTitle('Tooling condition'),
    C.h('div.panel.panel--pad', C.h('div.panel__body',
      wearBitName,
      C.h('div.wearcmp', { style: { 'margin-top': '10px' } },
        C.h('div.wearcmp__col', C.h('p.wearcmp__k', { text: 'Before' }), wearBefore.el, wearBeforeV),
        C.h('span.wearcmp__arrow', C.Icon('chevron', 18)),
        C.h('div.wearcmp__col', C.h('p.wearcmp__k', { text: 'After' }), wearAfter.el, wearAfterV),
      ),
      wearNote,
      wearList,
    )),
  );

  /* The actions are NOT part of the staged reveal and are NOT sticky. There has
     to be a visible way off this screen in the first frame; the old sticky bar
     sat in the middle of the page (the content never overflowed) and stayed
     invisible for the best part of a second. */
  const againBtn = C.Button({ label: 'Next contract', kind: 'amber', icon: 'play', onTap: () => {
    const active = state.contract;
    if (active) app.nav(SCENES.SITE, { contract: active });
    else app.nav(SCENES.CONTRACTS);
  } });
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

  function at(t, fn) { timeline.push({ t, fn, done: false }); }

  /**
   * The settlement progression actually booked for this hole, or null.
   * `progression.completeHole` runs on the same HOLE_COMPLETE event and is
   * registered first (main.js loads progression before ui), so by the time this
   * screen mounts the entry is already at the head of the career ledger.
   */
  function lastSettlement(contractId, depth) {
    if (!app.ctx.progression) return null;
    const ledger = state.player?.career?.ledger;
    if (!Array.isArray(ledger) || !ledger.length) return null;
    const s = ledger[0];
    if (!s || typeof s.net !== 'number') return null;
    if (contractId && s.contractId && s.contractId !== contractId) return null;
    // A stale entry from an earlier hole would misreport this one.
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

    const depth = r.depth ?? d.depth ?? 0;
    const target = d.target || c?.target || depth || 1;

    /* HOLE_COMPLETE carries timeSec; sim/drilling.js also mirrors its run clock
       onto state.drill.timeSec, which is the fallback when the payload is thin.
       Deriving it from depth/ROP is the last resort — anything is better than
       claiming 28.1 m were drilled in 00:00. */
    let timeSec = r.timeSec ?? r.time ?? d.timeSec ?? d.elapsed ?? 0;
    if (!(timeSec > 0) && depth > 0 && (d.rop || 0) > 0) timeSec = (depth / d.rop) * 3600;

    const completion = clamp(depth / Math.max(0.001, target), 0, 1);

    /* Guard the view independently of the sim. A near-zero clock (the QA
       harness seeks depth without elapsing time; a crash could do the same)
       divides 28 m by 0.0007 h and prints 38,588.9 m/h in a hero stat.
       PLATFORM_TRUTH Part C rule 3 makes unit-correctness a requirement, not
       polish — so this is clamped to a physically possible range. */
    const avgRop = timeSec > 30
      ? clamp(depth / (timeSec / 3600), 0, 200)
      : clamp(d.rop || 0, 0, 200);

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

    const estSpeed = clamp(avgRop / 45, 0, 1);
    const estStraight = clamp(0.55 + (d.greenBandTime || 0) / 40, 0, 1);
    const estCare = clamp(1 - (d.wear || 0), 0, 1);
    const estSafety = clamp(d.stability ?? 1, 0, 1);

    const scores = {
      speed: bd ? scoreOf(bd.time, estSpeed) : estSpeed,
      straightness: bd ? scoreOf(bd.straightness, estStraight) : estStraight,
      toolCare: bd ? scoreOf(bd.bit ?? bd.bitLife, estCare) : estCare,
      safety: bd ? scoreOf(bd.safety, estSafety) : estSafety,
      groove: bd ? scoreOf(bd.groove, clamp((d.greenBandTime || 0) / Math.max(1, timeSec), 0, 1)) : null,
    };

    /* The evidence behind each score, in the units PLATFORM_TRUTH Part C
       demands. Deviation is carried by the sim in its own arbitrary units, so
       it is reported as the share of the tolerance it used up rather than as a
       fabricated angle or offset. */
    const evidence = {
      speed: bTime
        ? `${fmtSpan(bTime.actualSec)} against ${fmtSpan(bTime.parSec)} par`
        : (avgRop > 0 ? `${avgRop.toFixed(1)} m/h average` : 'no rate recorded'),
      straightness: `${pct(1 - scores.straightness)} of the drift tolerance used`,
      toolCare: bBit
        ? `${Number(bBit.consumed01 ?? 0).toFixed(2)} of a crown${bBit.bitsUsed ? ` · ${plural(bBit.bitsUsed, 'change')}` : ''}`
        : `${pct(clamp(d.wear || 0, 0, 1))} of the crown consumed`,
      safety: bSafety
        ? ((bSafety.events || bSafety.jams)
          ? `${plural(bSafety.events || 0, 'incident')} · ${plural(bSafety.jams || 0, 'stuck string')}`
          : 'no incidents, no stuck string')
        : `hole stability ${pct(scores.safety)}`,
    };

    /* The composite. The sim publishes its own weighted total; without it the
       four criteria are weighted the way GAMEDESIGN §2.4 orders them, and
       completion scales the result — half a hole is not a graded hole. */
    const compositeKnown = typeof bd?.total === 'number';
    const composite = compositeKnown
      ? clamp(bd.total, 0, 1)
      : completion * (scores.speed * 0.30 + scores.straightness * 0.28
        + scores.toolCare * 0.24 + scores.safety * 0.18);

    /* The settlement, when there is one, IS the transaction — and the grade it
       was paid at outranks anything this screen could derive. */
    const settle = lastSettlement(c?.id ?? raw?.id ?? null, depth);

    let grade = r.grade || bd?.grade || settle?.grade;
    if (!grade) {
      grade = 'D';
      for (const [g, thr] of GRADE_BANDS) { if (composite >= thr) { grade = g; break; } }
    }
    const gradeIdx = Math.max(0, GRADES.indexOf(grade));
    const nextGrade = gradeIdx < GRADES.length - 1 ? GRADES[gradeIdx + 1] : null;
    const nextBand = nextGrade ? GRADE_BANDS.find(([g]) => g === nextGrade) : null;
    const nextAt = nextBand ? nextBand[1] : null;

    /* ── Money ──────────────────────────────────────────────────────────── */
    let payout = 0;
    let costs = 0;
    let net = 0;
    let xp = 0;
    const items = [];
    let hours = timeSec / 3600;

    if (settle) {
      payout = Math.round(settle.revenue || 0);
      costs = Math.round(settle.costs?.total || 0);
      net = Math.round(settle.net ?? (payout - costs));
      xp = Math.round(settle.xp || 0);
      hours = settle.hours || hours;
      for (const [key, name, note] of COST_LINES) {
        const v = settle.costs?.[key];
        if (!v || Math.round(v) <= 0) continue;
        items.push({ name, qty: note, cost: Math.round(v) });
      }
    } else {
      // No progression system: keep the loop whole with a transparent estimate.
      const bonus = { D: 0, C: 0.05, B: 0.12, A: 0.22, S: 0.4 }[grade] ?? 0;
      const base = (c?.payout || Math.round(depth * 180)) * completion;
      payout = Math.round(base * (1 + bonus));

      const estBitId = state.garage?.loadout?.bit;
      const estBit = estBitId ? app.itemById(estBitId) : null;
      const wearDelta = clamp(d.wear || 0, 0, 1);
      if (estBit) {
        items.push({
          name: estBit.name,
          qty: `${Math.round(wearDelta * 100)}% of life`,
          cost: Math.round((estBit.price || 0) * wearDelta),
        });
      }
      items.push({ name: 'Drill rods handled', qty: `${d.rods || 1} × 3 m`, cost: Math.round((d.rods || 1) * 4) });
      items.push({ name: 'Flushing medium', qty: `${Math.round(depth * 12)} l`, cost: Math.round(depth * 1.6) });
      // A €0 fuel line for a 0.0 h run is worse than no line at all: it claims
      // the rig ran on nothing. Only bill hours that were actually elapsed.
      if (timeSec > 0) {
        items.push({ name: 'Fuel & air', qty: fmtSpan(timeSec), cost: Math.max(1, Math.round((timeSec / 3600) * 62)) });
      }
      costs = items.reduce((a, b) => a + b.cost, 0);
      net = payout - costs;
      xp = Math.round(depth * 6 + composite * 240 + (d.greenBandTime || 0) * 3);
    }

    /* ── The bit ──────────────────────────────────────────────────────────
       progression.applyWear records the real before/after condition of every
       fitted consumable; that is the truth, not a guess from state.drill.wear. */
    const bitId = state.garage?.loadout?.bit;
    const bit = bitId ? app.itemById(bitId) : null;
    const wornBit = Array.isArray(settle?.worn) ? settle.worn.find((w) => w.slot === 'bit') : null;
    const endWear = clamp(bBit && typeof bBit.endWear === 'number' ? bBit.endWear : (d.wear || 0), 0, 1);
    const consumed = clamp(bBit && typeof bBit.consumed01 === 'number' ? bBit.consumed01 : endWear, 0, 1);

    return {
      contract: c, depth, target, timeSec, avgRop, completion, hours,
      grade, composite, compositeKnown, nextGrade, nextAt,
      payout, costs, net, xp, items, settled: !!settle,
      wearBefore: wornBit ? clamp(wornBit.from, 0, 1) : clamp(1 - Math.max(0, endWear - consumed), 0, 1),
      wearAfter: wornBit ? clamp(wornBit.to, 0, 1) : clamp(1 - endWear, 0, 1),
      bitsChanged: bBit?.bitsUsed || 0,
      bitName: wornBit?.name || (bit ? bit.name : 'No bit fitted'),
      wornOther: Array.isArray(settle?.worn) ? settle.worn.filter((w) => w.slot !== 'bit') : [],
      scores, evidence,
      parKnown: !!bTime,
      groove: bGroove, hazards: bHaz, rods: bRods,
    };
  }

  function applyRewards(sm) {
    // Progression owns the economy when it exists; otherwise keep the loop whole.
    if (app.ctx.progression) return;
    const p = state.player;
    if (!p) return;
    p.money = (p.money || 0) + sm.net;
    p.xp = (p.xp || 0) + sm.xp;
    p.stats = p.stats || {};
    p.stats.metresDrilled = (p.stats.metresDrilled || 0) + sm.depth;
    p.stats.holesDone = (p.stats.holesDone || 0) + 1;
    if (sm.grade === 'S') p.stats.perfectRuns = (p.stats.perfectRuns || 0) + 1;
    let need = app.xpForLevel(p.level || 1);
    while (p.xp >= need) {
      p.xp -= need;
      p.level = (p.level || 1) + 1;
      p.skillPoints = (p.skillPoints || 0) + 1;
      sm.leveled = p.level;
      need = app.xpForLevel(p.level);
    }
  }

  return {
    el,

    mount(params) {
      const nextLabel = state.contract ? 'Next hole' : 'Next contract';
      againBtn.querySelector('.btn__label').textContent = nextLabel;
      againBtn.setAttribute('aria-label', nextLabel);
      summary = buildSummary(params);
      const sm = summary;
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
      for (const k of Object.keys(crits)) {
        crits[k].bar.setValue(0);
        crits[k].v.textContent = '—';
        crits[k].ev.textContent = '';
      }
      scroll.scrollTop = 0;

      const lvlBefore = state.player?.level || 1;
      const xpBefore = state.player?.xp || 0;
      applyRewards(sm);
      const need0 = app.xpForLevel(lvlBefore);

      timeline = [];
      clock = 0;
      const S = fast ? 0.02 : 1;

      at(0.06 * S, () => {
        gradeLetter.textContent = sm.grade;
        gradeEl.setAttribute('aria-label', `Grade ${sm.grade}`);
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
          verdictEl.textContent = 'Graded on speed, straightness, tool care and safety';
        } else if (sm.nextGrade && sm.nextAt !== null) {
          verdictEl.textContent = `Score ${pct(sm.composite)} · ${sm.nextGrade} starts at ${pct(sm.nextAt)}`;
        } else {
          verdictEl.textContent = `Score ${pct(sm.composite)} · top grade`;
        }
      });

      at(0.34 * S, () => {
        mDepth.v.textContent = `${sm.depth.toFixed(1)} m`;
        mTime.v.textContent = fmtClock(sm.timeSec);
        mAvg.v.textContent = `${sm.avgRop.toFixed(1)} m/h`;
        metricsEl.classList.add('is-in');
      });

      at(0.50 * S, () => {
        moneyKey.textContent = sm.settled ? 'Net paid' : 'Payout';
        moneyEl.classList.add('is-in');
        moneyRoll.to(sm.net);
        app.haptic('success');
      });

      at(0.68 * S, () => {
        xpEl.classList.add('is-in');
        xpFrom.textContent = roleLabel(lvlBefore, `LVL ${lvlBefore}`, ' · ');
        xpGain.textContent = `+${sm.xp} XP`;
        xpBar.setValue(need0 ? clamp((xpBefore + sm.xp) / need0, 0, 1) : 1);
      });

      // GAMEDESIGN §2.4 grades on speed, straightness, tool care and safety.
      // Those four, with the measurement behind each, sit directly under the
      // XP bar — this is the block that explains the letter.
      at(0.84 * S, () => {
        for (const key of ['speed', 'straightness', 'toolCare', 'safety']) {
          const t = crits[key];
          const v = sm.scores[key];
          t.v.textContent = pct(v);
          t.bar.setValue(v);
          t.bar.setKind(v >= 0.78 ? 'success' : v >= 0.44 ? 'amber' : 'danger');
          t.ev.textContent = sm.evidence[key];
        }

        scoreList.appendChild(C.SpecRow('Hole completed', `${pct(sm.completion)} of ${sm.target.toFixed(1)} m`));
        if (sm.groove) {
          const combo = Number(sm.groove.bestCombo || 0);
          scoreList.appendChild(C.SpecRow('Groove uptime',
            `${pct(sm.groove.uptime01 ?? sm.scores.groove ?? 0)} in the band`
            + (combo > 1 ? ` · best ×${combo.toFixed(2)}` : '')));
        } else if (typeof sm.scores.groove === 'number') {
          scoreList.appendChild(C.SpecRow('Groove uptime', `${pct(sm.scores.groove)} in the band`));
        }
        if (sm.hazards) {
          const seen = sm.hazards.seen || 0;
          scoreList.appendChild(C.SpecRow('Hazards',
            seen ? `${sm.hazards.clean || 0} of ${seen} handled clean` : 'none met'));
        }
        if (sm.rods) {
          scoreList.appendChild(C.SpecRow('Rod handling',
            `${sm.rods.added || 0} added · ${sm.rods.perfect || 0} on the beat`));
        }
        // Only worth a row when the sim did not supply par time — otherwise the
        // Speed tile already carries the clock, and so does the hero metric.
        if (!sm.parKnown) scoreList.appendChild(C.SpecRow('Time on tools', fmtSpan(sm.timeSec)));
        scoreEl.classList.add('is-in');
      });

      at(0.94 * S, () => {
        if (sm.leveled) {
          levelUpSlot.appendChild(C.h('div.rlevelup',
            C.Icon('star', 18),
            C.h('span', { text: roleLabel(sm.leveled, `Level ${sm.leveled}`) }),
          ));
          app.haptic('success');
        } else if ((state.player?.level || 1) > lvlBefore) {
          const lvl = state.player.level;
          levelUpSlot.appendChild(C.h('div.rlevelup', C.Icon('star', 18),
            C.h('span', { text: roleLabel(lvl, `Level ${lvl}`) })));
        }
      });

      at(1.02 * S, () => {
        for (const it of sm.items) {
          consumeList.appendChild(ledgerRow(it.name, it.qty, '−' + fmtMoney(it.cost), '.ritem--sub'));
        }
        // The running-costs subtotal used to arrive as a toast on top of the
        // grade medallion. It belongs here, above the payout, so the headline
        // number is unambiguously net.
        consumeList.appendChild(ledgerRow('Running costs', `${sm.items.length} items`, '−' + fmtMoney(sm.costs)));
        consumeList.appendChild(C.h('div.ritem',
          C.h('span.ritem__n', { text: 'Gross payout' }),
          C.h('span.ritem__q', { text: `grade ${sm.grade}` }),
          C.h('span.ritem__c.is-pos', { text: fmtMoney(sm.payout) }),
        ));
        consumeList.appendChild(C.h('div.ritem.ritem--total',
          C.h('span.ritem__n', { text: 'Net paid' }),
          C.h('span.ritem__q', { text: sm.hours > 0 ? `${sm.hours.toFixed(1)} h booked` : '' }),
          C.h('span.ritem__c.is-net', { text: fmtMoney(sm.net) }),
        ));
        consumeEl.classList.add('is-in');
      });

      at(1.12 * S, () => {
        wearBitName.textContent = sm.bitName;
        wearBefore.setValue(sm.wearBefore);
        wearAfter.setValue(sm.wearAfter);
        wearBeforeV.textContent = `${Math.round(sm.wearBefore * 100)}% life`;
        wearAfterV.textContent = `${Math.round(sm.wearAfter * 100)}% life`;
        const used = Math.max(0, sm.wearBefore - sm.wearAfter);
        wearNote.textContent = sm.bitsChanged
          ? `${plural(sm.bitsChanged, 'crown')} changed downhole · ${pct(used)} of this one consumed over ${sm.depth.toFixed(1)} m.`
          : `${pct(used)} of the crown consumed over ${sm.depth.toFixed(1)} m.`;
        for (const w of sm.wornOther) {
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
