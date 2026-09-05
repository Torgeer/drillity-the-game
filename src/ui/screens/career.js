/**
 * CAREER — "Drillity Talent".
 *
 * The real Talent model, not a generic job board:
 *   • certifications are LIVE and expiry-tracked, and the rule that matters is
 *     `expired = cannot mobilise` — a lapsed ticket locks the contracts that
 *     require it (PLATFORM_TRUTH Part B);
 *   • compensation is a DAY RATE in EUR, never a salary;
 *   • rotation pattern, rig type, rig class and water depth are first-class
 *     matchable fields, so they are shown as fields, not flavour;
 *   • the skill tree mirrors the three Talent branches.
 *
 * Every value read out of the skill tree is read defensively: game/data.js
 * spells a node `maxRank / description / prereq / cost`, progression spells it
 * the same way, and the older UI catalogue spells it `max / effect / needs /
 * costs`. Both are accepted here, and nothing is ever printed unguarded — a
 * screen that renders the string "undefined" is a broken screen.
 */
import { EVENTS, SCENES, clamp } from '../../core/contract.js';
import { allRoles, allCerts, roleAt, regionInfo } from './catalog.js';

const TAB_CERTS = 'certs', TAB_SKILLS = 'skills', TAB_LADDER = 'ladder';

/* Session-local issue dates, so expiry is real without widening GameState. */
const issued = new Map();

const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;

export function createCareerScreen(app) {
  const { C, state, fmtMoney } = app;

  /**
   * The Talent posting — rotation pattern, rig type, rig class, water depth.
   *
   * game/data.js owns this and nothing else may keep a copy. `postingFor()`
   * resolves contract → region → default, and those four fields now live on
   * the `REGIONS` entries themselves. This screen used to carry its own
   * region → posting table, including four ids (`german`, `iberian`,
   * `northsea`, `chile`) that match no region in data.js: every one of those
   * rows fell through to a hard-coded default and printed
   * "Ad hoc / call-out · Land rig · Standard" over a real Drillity field,
   * which is an invented factual claim (PLATFORM_TRUTH Part C). A region
   * rename would have done the same silently.
   *
   * With data.js absent the honest answer is no answer: this returns null and
   * the caller omits the fields rather than guessing them.
   *
   * @param {Object|string|null} contractOrRegionId
   * @returns {{rotation:string, rigType:string, rigClass:string,
   *            waterLabel:string, waterDepth:number, source:string}|null}
   */
  function postingFor(contractOrRegionId) {
    const g = app.ctx && app.ctx.game;
    if (!g || typeof g.postingFor !== 'function') return null;
    try {
      const p = g.postingFor(contractOrRegionId);
      return p && p.rotation ? p : null;
    } catch (e) {
      console.error('[ui] postingFor', e);
      return null;
    }
  }

  let tab = TAB_CERTS;              // certificates first: they gate the work
  let branchIndex = 0;
  const graphs = [];                // { graph, svg, nodes, links, maxRow }
  const unsubs = [];
  /** Certificate ids progression has told us lapsed this session. */
  const lapsed = new Set();

  const spEl = C.h('span.sp', C.Icon('star', 13), C.h('b', { text: '0' }), C.h('span', { text: 'points' }));
  const tabs = C.h('div.tabs', { role: 'tablist', 'aria-label': 'Career sections' });
  const body = C.h('div.scroll');

  const el = C.h('div',
    C.ScreenHeader({ title: 'Career', sub: 'Drillity Talent', onBack: () => app.nav(SCENES.MENU), right: C.h('span.shead__spacer') }),
    C.h('div', { style: { display: 'flex', 'justify-content': 'center', 'padding-bottom': '12px' } }, spEl),
    tabs,
    body,
  );

  // progression emits `cert-expired` through the unlock channel when a ticket
  // runs out. That is the single strongest mechanic on this screen, so listen
  // for it even while another screen is in front.
  unsubs.push(app.bus.on(EVENTS.UNLOCK, (p) => {
    if (!p || p.kind !== 'cert-expired' || !p.id) return;
    lapsed.add(p.id);
    if (tab === TAB_CERTS) render();
  }));
  unsubs.push(app.bus.on(EVENTS.CERT_EARNED, (p) => {
    if (p && p.certId) lapsed.delete(p.certId);
  }));

  /* ── Certificate state ────────────────────────────────────────────────── */
  const certsHeld = () => state.player?.certs || [];
  const level = () => state.player?.level || 1;

  /**
   * @returns {{status:'valid'|'expiring'|'expired'|'available'|'locked',
   *            months:number, frac:number, missing:string[]}}
   */
  function certState(cert) {
    const months = Number(cert.months) || 24;
    const held = certsHeld().includes(cert.id);

    if (held) {
      const live = app.ctx.progression?.getCertExpiry?.(cert.id);
      let left;
      if (live === Infinity) return { status: 'valid', months: Infinity, frac: 1, missing: [] };
      if (typeof live === 'number' && Number.isFinite(live)) {
        left = Math.max(0, live);
      } else {
        if (!issued.has(cert.id)) issued.set(cert.id, Date.now());
        const elapsed = (Date.now() - issued.get(cert.id)) / 2.628e9;   // ms → months
        left = Math.max(0, months - elapsed);
      }
      const frac = clamp(left / months, 0, 1);
      if (left <= 0) return { status: 'expired', months: 0, frac: 0, missing: [] };
      if (left <= 3 || frac < 0.12) return { status: 'expiring', months: left, frac, missing: [] };
      return { status: 'valid', months: left, frac, missing: [] };
    }

    if (lapsed.has(cert.id)) return { status: 'expired', months: 0, frac: 0, missing: [] };

    const missing = (cert.prereq || []).filter((id) => !certsHeld().includes(id));
    const tooJunior = level() < (cert.minLevel || 1);
    if (missing.length || tooJunior) return { status: 'locked', months, frac: 0, missing };
    return { status: 'available', months, frac: 0, missing: [] };
  }

  const expiredCerts = () => allCerts().filter((c) => certState(c).status === 'expired');

  /** Board contracts that cannot be mobilised because a ticket has lapsed. */
  function blockedContracts(expiredIds) {
    if (!expiredIds.length) return [];
    let board = [];
    try { board = app.contracts() || []; } catch (e) { console.warn('[career] contract board unavailable', e); return []; }
    const out = [];
    for (const c of board) {
      const req = c.certs || c.requiredCerts || [];
      const hit = req.filter((id) => expiredIds.includes(id));
      if (hit.length) out.push({ contract: c, missing: hit });
    }
    return out;
  }

  function certCost(cert) {
    const live = app.ctx.progression?.certCost?.(cert.id);
    return (typeof live === 'number' && Number.isFinite(live)) ? live : (cert.cost || 0);
  }

  async function buyCert(cert, renewing) {
    const cost = certCost(cert);
    if (app.money() < cost) { app.toast('Training budget will not stretch', 'warn'); app.haptic('fail'); return; }

    const st = certState(cert);
    if (!renewing && st.status === 'locked') {
      const why = st.missing.length
        ? `Needs ${st.missing.map((id) => allCerts().find((c) => c.id === id)?.name || id).join(', ')}`
        : `Unlocks at level ${cert.minLevel || 1}`;
      app.toast(why, 'warn'); app.haptic('fail'); return;
    }

    const ok = await app.confirm({
      title: renewing ? 'Renew certification' : 'Book the course',
      message: `${cert.name} · ${cert.issuer || 'Approved centre'} · valid ${plural(Number(cert.months) || 24, 'month')}. ${fmtMoney(cost)}.`,
      confirmLabel: renewing ? 'Renew' : 'Book',
    });
    if (!ok) return;

    const prog = app.ctx.progression;
    const held = certsHeld().includes(cert.id);

    if (!held && typeof prog?.buyCert === 'function') {
      const done = prog.buyCert(cert.id);
      if (!done) { app.toast('The centre could not take the booking', 'warn'); app.haptic('fail'); return; }
    } else {
      // Renewal: progression has no renew entry point, so settle it here and
      // push the expiry date out on the career branch it owns.
      if (typeof prog?.addMoney === 'function') prog.addMoney(-cost, `${cert.name} renewal`);
      else if (state.player) {
        state.player.money = (state.player.money || 0) - cost;
        app.bus.emit(EVENTS.MONEY_CHANGE, { delta: -cost, balance: state.player.money, reason: cert.name });
      }
      if (state.player) {
        state.player.certs = state.player.certs || [];
        if (!state.player.certs.includes(cert.id)) state.player.certs.push(cert.id);
      }
      const career = state.player?.career;
      if (career && career.certExpiry) {
        career.certExpiry[cert.id] = (career.daysElapsed || 0) + (Number(cert.months) || 24) * 30;
      }
      issued.set(cert.id, Date.now());
      app.bus.emit(EVENTS.CERT_EARNED, { certId: cert.id });
    }

    lapsed.delete(cert.id);
    issued.set(cert.id, Date.now());
    app.haptic('success');
    render();
  }

  function monthsCopy(st) {
    if (st.months === Infinity) return 'no expiry';
    if (st.months <= 0) return 'expired';
    if (st.months < 1) return 'expires this month';
    const n = Math.round(st.months);
    return `expires in ${plural(n, 'month')}`;
  }

  function certCard(cert) {
    const st = certState(cert);
    const cost = certCost(cert);

    const icon = st.status === 'expired' ? 'alert'
      : st.status === 'expiring' ? 'alert'
        : st.status === 'valid' ? 'check'
          : st.status === 'available' ? 'cert' : 'lock';

    let sub;
    if (st.status === 'expired') sub = `${cert.issuer || 'Approved centre'} · EXPIRED — you cannot mobilise`;
    else if (st.status === 'valid' || st.status === 'expiring') sub = `${cert.issuer || 'Approved centre'} · ${monthsCopy(st)}`;
    else if (st.status === 'locked') {
      sub = st.missing.length
        ? `Needs ${st.missing.map((id) => allCerts().find((c) => c.id === id)?.name || id).join(', ')}`
        : `Unlocks at level ${cert.minLevel || 1}`;
    } else sub = `${cert.issuer || 'Approved centre'} · ${cert.note || ''}`.replace(/ · $/, '');

    let action;
    if (st.status === 'expired') action = C.Button({ label: 'Renew', kind: 'danger', size: 'sm', icon: 'alert', onTap: () => buyCert(cert, true) });
    else if (st.status === 'expiring') action = C.Button({ label: 'Renew', kind: 'warning', size: 'sm', onTap: () => buyCert(cert, true) });
    else if (st.status === 'valid') action = C.Pill('Valid', 'success');
    else if (st.status === 'locked') action = C.h('span.pill.pill--neutral', C.Icon('lock', 12), C.h('span', { text: fmtMoney(cost) }));
    else action = C.Button({ label: fmtMoney(cost), kind: 'amber', size: 'sm', onTap: () => buyCert(cert, false) });

    const bar = (st.status === 'valid' || st.status === 'expiring' || st.status === 'expired')
      ? (() => {
        const b = C.Bar({
          kind: st.status === 'expired' ? 'danger' : st.status === 'expiring' ? 'warning' : 'success',
          value: st.frac,
        });
        b.el.style.marginTop = '6px';
        return b.el;
      })()
      : null;

    const card = C.Card({ class: 'certcard' },
      C.h('span.certcard__ico', C.Icon(icon, 19)),
      C.h('div.certcard__b',
        C.h('p.certcard__t', { text: cert.name }),
        C.h('p.certcard__s', { text: sub }),
        bar,
      ),
      action,
    );
    card.classList.add('certcard');
    if (st.status === 'valid' || st.status === 'expiring') card.classList.add('is-held');
    if (st.status === 'expiring') card.classList.add('is-expiring');
    // `.certcard.is-expired` carries the danger border and tint in styles.css.
    if (st.status === 'expired') card.classList.add('is-expired');
    return card;
  }

  function renderCerts() {
    const frag = document.createDocumentFragment();
    const all = allCerts();
    if (!all.length) {
      frag.appendChild(C.Empty('Content unavailable', 'The certification list could not be loaded.'));
      return frag;
    }
    const byStatus = { expired: [], valid: [], expiring: [], available: [], locked: [] };
    for (const c of all) byStatus[certState(c).status].push(c);

    // ── Expired: the loudest thing on the screen. ──
    if (byStatus.expired.length) {
      const ids = byStatus.expired.map((c) => c.id);
      const banner = C.h('div.panel.panel--pad', {
        style: {
          'border-color': 'rgb(var(--rgb-danger) / .5)',
          background: 'linear-gradient(180deg, rgb(var(--rgb-danger) / .16), rgb(var(--rgb-danger) / .05))',
        },
      }, C.h('div.panel__body',
        C.h('div', { style: { display: 'flex', 'align-items': 'center', gap: '8px' } },
          C.Icon('alert', 18),
          C.h('p', {
            style: { 'font-size': '15px', 'font-weight': '800', 'letter-spacing': '-0.01em' },
            text: 'You cannot mobilise',
          }),
        ),
        C.h('p', {
          style: { 'font-size': '12px', 'font-weight': '600', color: 'var(--c-fg-muted)', 'margin-top': '6px', 'line-height': '1.45' },
          text: `${byStatus.expired.map((c) => c.name).join(', ')} ${byStatus.expired.length === 1 ? 'has' : 'have'} lapsed. `
            + 'In this industry an expired certificate is the same as no certificate — renew it before you take the work.',
        }),
      ));
      frag.appendChild(C.SectionTitle('Expired', C.h('span.label', { text: `${byStatus.expired.length}` })));
      frag.appendChild(banner);
      for (const c of byStatus.expired) frag.appendChild(certCard(c));

      const blocked = blockedContracts(ids);
      if (blocked.length) {
        frag.appendChild(C.SectionTitle('Locked by a lapsed ticket', C.h('span.label', { text: `${blocked.length}` })));
        const panel = C.h('div.panel.panel--pad', C.h('div.panel__body'));
        const pbody = panel.querySelector('.panel__body');
        for (const b of blocked) {
          const names = b.missing.map((id) => all.find((c) => c.id === id)?.name || id).join(', ');
          const row = C.Row({
            icon: 'lock',
            label: b.contract.title || 'Contract',
            sub: `${b.contract.client || 'Client'} · needs ${names}`,
            value: 'Locked',
          });
          row.classList.add('is-locked');
          const v = row.querySelector('.row__value');
          if (v) v.classList.add('is-danger');
          pbody.appendChild(row);
        }
        frag.appendChild(panel);
      }
    }

    // ── Held ──
    const held = [...byStatus.expiring, ...byStatus.valid];
    frag.appendChild(C.SectionTitle('Held', C.h('span.label', { text: `${held.length} / ${all.length}` })));
    if (!held.length) frag.appendChild(C.Empty('No tickets yet', 'Clients check certificates before they check your rig.'));
    for (const c of held) frag.appendChild(certCard(c));

    // ── Available / locked ──
    if (byStatus.available.length) {
      frag.appendChild(C.SectionTitle('Available'));
      for (const c of byStatus.available) frag.appendChild(certCard(c));
    }
    if (byStatus.locked.length) {
      frag.appendChild(C.SectionTitle('Not yet open to you'));
      for (const c of byStatus.locked) frag.appendChild(certCard(c));
    }
    return frag;
  }

  /* ── Role ladder + the Talent posting fields ──────────────────────────── */
  function renderLadder() {
    const lvl = level();
    const now = roleAt(lvl);
    const wrap = C.h('div');

    // The whole screen is the ladder. With no ladder there is nothing true to
    // draw — a posting card with a blank job title and a dash for the day rate
    // would look like a bug rather than a missing content module.
    if (!now) {
      wrap.appendChild(C.Empty('Content unavailable', 'The career ladder could not be loaded.'));
      return wrap;
    }

    // Current posting — the domain-native fields Drillity Talent matches on.
    // An accepted contract outranks its region: an oil-rotary well names its
    // own unit, class, water depth and hitch, and `postingFor()` knows that.
    const regionId = state.world?.regionId || 'nordic';
    const region = regionInfo(regionId);
    const live = state.contract || null;
    const posting = postingFor(live && (live.regionId || live.region) === regionId ? live : regionId);
    const dayRate = Number(now.dayRate) || 0;

    wrap.appendChild(C.SectionTitle('Current posting', C.h('span.label', { text: region?.name || '—' })));
    wrap.appendChild(C.h('div.panel.panel--pad', C.h('div.panel__body',
      C.h('div', { style: { display: 'flex', 'align-items': 'baseline', 'justify-content': 'space-between', gap: '12px' } },
        C.h('p', { style: { 'font-size': '15px', 'font-weight': '800', 'letter-spacing': '-0.01em' }, text: now.title }),
        C.h('p', {
          style: { 'font-size': '17px', 'font-weight': '850', color: 'var(--c-amber-hot)', 'font-variant-numeric': 'tabular-nums' },
          text: dayRate ? `€${dayRate.toLocaleString('en-US')}/day` : '—',
        }),
      ),
      now.talentFunction
        ? C.h('p', { style: { 'font-size': '11px', 'font-weight': '700', color: 'var(--c-steel-soft)', 'text-transform': 'uppercase', 'letter-spacing': '.08em', 'margin-top': '2px' }, text: now.talentFunction })
        : null,
      /* Water depth is a field of an offshore posting only. `waterLabel` is
         already "Land" for onshore work, so it is never faked here either. */
      C.h('dl.specs', { style: { 'margin-top': '12px' } },
        posting ? C.SpecRow('Rotation pattern', posting.rotation) : null,
        posting ? C.SpecRow('Rig type', posting.rigType) : null,
        posting ? C.SpecRow('Rig class', posting.rigClass) : null,
        posting
          ? C.SpecRow('Water depth', posting.waterDepth > 0 ? posting.waterLabel : 'Onshore — not applicable')
          : null,
        C.SpecRow('Certificates held', `${certsHeld().length}`),
      ),
    )));

    wrap.appendChild(C.SectionTitle('Role ladder', C.h('span.label', { text: now.title })));
    const ladder = C.h('div.ladder.stagger');
    for (const r of allRoles()) {
      const done = lvl >= r.level;
      const isNow = r.id === now.id;
      const rate = Number(r.dayRate) || 0;
      const sub = [rate ? `€${rate.toLocaleString('en-US')}/day` : null, r.talentFunction || r.branch || null]
        .filter(Boolean).join(' · ');
      const row = C.h(`div.lrow${done ? '.is-done' : '.is-locked'}${isNow ? '.is-now' : ''}`,
        C.h('i.lrow__dot'),
        C.h('div', { style: { flex: '1 1 auto', 'min-width': '0' } },
          C.h('p.lrow__t', { text: r.title }),
          C.h('p.lrow__b', { text: sub }),
        ),
        C.h('span.lrow__lv', { text: `LVL ${r.level}` }),
      );
      ladder.appendChild(row);
    }
    C.stagger(ladder.children);
    wrap.appendChild(ladder);

    const p = state.player || {};
    /* `p.xp / app.xpForLevel(lvl)` used to draw this bar, and it divides a
       CUMULATIVE lifetime XP total by ONE level's increment — the ratio passes
       1 during level 2 and the bar is pinned full for the rest of the game,
       while the caption read "48,210 / 640 XP". `app.xpProgress` asks the
       curve in game/data.js the question this bar is actually about. */
    const xpp = app.xpProgress(p.xp, lvl);
    const bar = C.Bar({ kind: 'amber', value: xpp.frac });
    bar.el.classList.add('bar--tall', 'bar--smooth');
    wrap.appendChild(C.SectionTitle('Progress'));
    wrap.appendChild(C.h('div.panel.panel--pad', C.h('div.panel__body',
      C.h('div.rxp__head', C.h('span.label', { text: `LVL ${lvl}` }),
        C.h('span.label', { text: `${Math.round(xpp.into)} / ${Math.round(xpp.need)} XP` })),
      bar.el,
      C.h('dl.specs', { style: { 'margin-top': '12px' } },
        C.SpecRow('Metres drilled', Math.round(p.stats?.metresDrilled || 0).toLocaleString('en-US') + ' m'),
        C.SpecRow('Holes completed', p.stats?.holesDone || 0),
        C.SpecRow('Perfect runs', p.stats?.perfectRuns || 0),
        C.SpecRow('Certificates held', (p.certs || []).length),
      ),
    )));
    return wrap;
  }

  /* ── Skill tree ───────────────────────────────────────────────────────── */
  const ROW_H = 82, TOP_PAD = 42;

  /* Field readers. game/data.js and progression say maxRank / description /
     prereq / cost; the UI catalogue says max / effect / needs / costs. Accept
     both, and never hand a template literal something that can be undefined. */
  const maxOf = (s) => {
    const v = Number(s?.max ?? s?.maxRank ?? 1);
    return Number.isFinite(v) && v > 0 ? v : 1;
  };
  const effectOf = (s) => String(s?.effect ?? s?.description ?? '');
  const needsOf = (s) => {
    const n = s?.needs ?? s?.prereq ?? s?.prereqs ?? s?.requires ?? s?.parent;
    if (!n) return [];
    return Array.isArray(n) ? n.filter(Boolean) : [n];
  };
  const costsOf = (s) => {
    if (Array.isArray(s?.costs) && s.costs.length) return s.costs;
    if (Array.isArray(s?.cost) && s.cost.length) return s.cost;
    const v = Number(s?.cost);
    return [Number.isFinite(v) && v > 0 ? v : 1];
  };
  const nameOf = (s) => String(s?.name ?? s?.id ?? 'Skill');

  function rank(id) {
    const v = (state.player?.skills || {})[id];
    return Number.isFinite(v) ? v : 0;
  }
  /** Player state wins: a captured node's own `rank` goes stale the moment a
      point is spent, and the graph must not show yesterday's number. */
  function rankOf(sk) {
    const live = (state.player?.skills || {})[sk?.id];
    if (Number.isFinite(live)) return live;
    return Number.isFinite(sk?.rank) ? sk.rank : 0;
  }
  function costOf(sk, atRank) {
    const costs = costsOf(sk);
    const v = Number(costs[Math.min(Math.max(0, atRank), costs.length - 1)]);
    return Number.isFinite(v) && v > 0 ? v : 1;
  }
  function nodeState(sk) {
    const r = rankOf(sk);
    if (r >= maxOf(sk)) return 'max';
    if (r > 0) return 'owned';
    return needsOf(sk).every((n) => rank(n) > 0) ? 'avail' : 'locked';
  }

  /**
   * Coordinates. The shell normalises the tree, but this screen must be right
   * even when that normalisation is bypassed: derive row = depth in the
   * prerequisite DAG, col = lane among same-depth siblings, and never write a
   * non-finite number into a style.
   */
  function ensureLayout(skills) {
    if (skills.every((s) => Number.isFinite(s.row) && Number.isFinite(s.col))) return skills;
    const out = skills.map((s) => ({ ...s }));
    const byId = new Map(out.map((s) => [s.id, s]));
    const depth = new Map();
    const visiting = new Set();
    const depthOf = (s) => {
      if (depth.has(s.id)) return depth.get(s.id);
      if (visiting.has(s.id)) return 0;                 // cycle — treat as a root
      visiting.add(s.id);
      const ps = needsOf(s).filter((id) => byId.has(id));
      const d = ps.length ? Math.max(...ps.map((id) => depthOf(byId.get(id)) + 1)) : 0;
      visiting.delete(s.id);
      depth.set(s.id, d);
      return d;
    };
    for (const s of out) depthOf(s);
    const lanes = new Map();
    for (const s of out) {
      const k = `${s.branch || '_'}|${depth.get(s.id)}`;
      if (!lanes.has(k)) lanes.set(k, []);
      lanes.get(k).push(s);
    }
    for (const list of lanes.values()) {
      const n = list.length;
      list.forEach((s, i) => {
        s.row = depth.get(s.id) || 0;
        s.col = n === 1 ? 1 : n === 2 ? i * 2 : i % 3;
      });
    }
    return out;
  }

  function spend(sk, nodeEl) {
    const prog = app.ctx.progression;
    const before = rankOf(sk);

    if (prog && typeof prog.spendSkill === 'function') {
      const check = prog.canSpendSkillPoint?.(sk.id);
      if (check && check.ok === false) { app.toast(check.reason || 'Not yet', 'warn'); app.haptic('fail'); return; }
      if (!prog.spendSkill(sk.id)) { app.toast(sk.reason || 'Cannot take that yet', 'warn'); app.haptic('fail'); return; }
    } else {
      const st = nodeState(sk);
      if (st === 'locked') { app.toast('Take the skill above it first', 'warn'); app.haptic('fail'); return; }
      if (st === 'max') { app.toast('Already at maximum rank', 'info'); return; }
      const cost = costOf(sk, before);
      const pts = state.player?.skillPoints || 0;
      if (pts < cost) { app.toast(`Needs ${plural(cost, 'skill point')}`, 'warn'); app.haptic('fail'); return; }
      if (sk.minLevel && level() < sk.minLevel) { app.toast(`Unlocks at level ${sk.minLevel}`, 'warn'); app.haptic('fail'); return; }
      if (state.player) {
        state.player.skills = state.player.skills || {};
        state.player.skills[sk.id] = before + 1;
        state.player.skillPoints = pts - cost;
      }
    }

    app.haptic('success');
    app.toast(`${nameOf(sk)} → rank ${rank(sk.id)}`, 'amber');
    // Re-read the tree (cost of the next rank may have changed) but keep the
    // player where they were looking.
    const y = body.scrollTop;
    render();
    body.scrollTop = y;
    if (!app.reducedMotion && nodeEl && nodeEl.isConnected) {
      void nodeEl.offsetWidth;
      nodeEl.classList.add('is-spend');
      setTimeout(() => nodeEl.classList.remove('is-spend'), 760);
    }
  }

  function renderSkills() {
    graphs.length = 0;
    let tree;
    try { tree = app.skillTree() || {}; } catch (e) { console.warn('[career] skill tree unavailable', e); tree = {}; }
    const branches = Array.isArray(tree.branches) ? tree.branches : [];
    const skills = ensureLayout((Array.isArray(tree.skills) ? tree.skills : []).filter((s) => s && s.id));

    if (!branches.length || !skills.length) {
      return C.Empty('Content unavailable', 'The skill tree could not be loaded.');
    }
    if (branchIndex >= branches.length) branchIndex = 0;

    const wrap = C.h('div');

    const picker = C.h('div.tabs', { style: { margin: '0 0 12px' } });
    branches.forEach((b, i) => {
      const btn = C.h(`button.tabs__b${i === branchIndex ? '.is-active' : ''}`, {
        type: 'button', text: String(b?.name ?? `Branch ${i + 1}`),
      });
      C.tap(btn, () => { branchIndex = i; render(); });
      picker.appendChild(btn);
    });
    wrap.appendChild(picker);

    const br = branches[branchIndex] || branches[0];
    const brBlurb = String(br?.blurb ?? br?.description ?? '');
    wrap.appendChild(C.h('div.tree__hd',
      C.h('div',
        C.h('p.tree__nm', { text: String(br?.name ?? 'Skills') }),
        brBlurb ? C.h('p.tree__bl', { text: brBlurb }) : null,
      ),
    ));

    const mine = skills.filter((s) => s.branch === br?.id);
    if (!mine.length) {
      wrap.appendChild(C.Empty('Nothing in this branch yet'));
      return wrap;
    }

    const maxRow = mine.reduce((a, s) => Math.max(a, Number.isFinite(s.row) ? s.row : 0), 0);
    const graphH = TOP_PAD * 2 + maxRow * ROW_H;

    const svg = C.s('svg', { class: 'tree__svg', preserveAspectRatio: 'none' });
    const graph = C.h('div.tree__graph', { style: { height: `${Number.isFinite(graphH) ? graphH : TOP_PAD * 2}px` } });
    // Links paint under the nodes.
    graph.appendChild(svg);

    const nodes = [];
    const links = [];
    for (const sk of mine) {
      const r = rankOf(sk), mx = maxOf(sk), cost = costOf(sk, r);
      const nEl = C.h('div.node', { role: 'button', tabindex: '0' },
        C.h('span.node__n', { text: nameOf(sk) }),
        C.h('span.node__r', { text: `${r}/${mx}` }),
      );
      const eff = effectOf(sk);
      nEl.setAttribute('aria-label',
        `${nameOf(sk)}.${eff ? ' ' + eff : ''} Rank ${r} of ${mx}. Costs ${plural(cost, 'point')}.`);
      C.tap(nEl, () => spend(sk, nEl), { pattern: 'medium' });
      nEl.addEventListener('contextmenu', (e) => { e.preventDefault(); explain(sk); });
      graph.appendChild(nEl);
      nodes.push({ el: nEl, skill: sk });
    }
    for (const sk of mine) {
      for (const dep of needsOf(sk)) {
        if (!mine.some((m) => m.id === dep)) continue;
        const line = C.s('path', { class: 'tree__link' });
        svg.appendChild(line);
        links.push({ el: line, from: dep, to: sk.id });
      }
    }

    graphs.push({ graph, svg, nodes, links, maxRow });
    wrap.appendChild(C.h('div.tree', graph));

    const legend = C.h('div.panel.panel--pad', C.h('div.panel__body',
      C.h('dl.specs', ...mine.map((sk) =>
        C.SpecRow(`${nameOf(sk)} (${rankOf(sk)}/${maxOf(sk)})`, effectOf(sk) || 'No effect listed'))),
    ));
    wrap.appendChild(C.SectionTitle('What these do'));
    wrap.appendChild(legend);
    return wrap;
  }

  function explain(sk) {
    const r = rankOf(sk);
    app.sheet({
      title: nameOf(sk),
      sub: `Rank ${r} of ${maxOf(sk)} · ${plural(costOf(sk, r), 'point')}`,
      body: C.h('div', C.h('p.cdetail__brief', { text: effectOf(sk) || 'No effect listed.' })),
    });
  }

  function layoutGraphs() {
    for (const g of graphs) {
      const W = g.graph.clientWidth || 320;
      if (!Number.isFinite(W) || W <= 0) continue;
      const pos = new Map();
      for (const n of g.nodes) {
        const col = Number.isFinite(n.skill.col) ? n.skill.col : 1;
        const row = Number.isFinite(n.skill.row) ? n.skill.row : 0;
        const x = W * (0.18 + clamp(col, 0, 2) * 0.32);
        const y = TOP_PAD + row * ROW_H;
        if (Number.isFinite(x)) n.el.style.left = `${x}px`;
        if (Number.isFinite(y)) n.el.style.top = `${y}px`;
        if (Number.isFinite(x) && Number.isFinite(y)) pos.set(n.skill.id, [x, y]);
      }
      const rows = Number.isFinite(g.maxRow) ? g.maxRow : 0;
      const measured = g.graph.clientHeight;
      const H = Math.max(1, Number.isFinite(measured) && measured > 0 ? measured : (TOP_PAD * 2 + rows * ROW_H));
      g.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      g.svg.setAttribute('width', String(W));
      g.svg.setAttribute('height', String(H));
      for (const l of g.links) {
        const a = pos.get(l.from), b = pos.get(l.to);
        if (!a || !b) continue;
        const my = (a[1] + b[1]) / 2;
        l.el.setAttribute('d', `M${a[0]} ${a[1]} C${a[0]} ${my}, ${b[0]} ${my}, ${b[0]} ${b[1]}`);
      }
    }
    updateSkillStates();
  }

  function updateSkillStates() {
    for (const g of graphs) {
      for (const n of g.nodes) {
        n.el.className = 'node node--' + nodeState(n.skill);
        const readout = n.el.querySelector('.node__r');
        if (readout) readout.textContent = `${rankOf(n.skill)}/${maxOf(n.skill)}`;
      }
      for (const l of g.links) l.el.classList.toggle('is-on', rank(l.from) > 0);
    }
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  function render() {
    spEl.querySelector('b').textContent = String(state.player?.skillPoints || 0);

    C.clear(tabs);
    const expiredCount = expiredCerts().length;
    for (const [id, label] of [[TAB_CERTS, 'Certificates'], [TAB_SKILLS, 'Skills'], [TAB_LADDER, 'Ladder']]) {
      const b = C.h(`button.tabs__b${tab === id ? '.is-active' : ''}`, {
        type: 'button', role: 'tab', 'aria-selected': tab === id ? 'true' : 'false',
      }, C.h('span', { text: label }));
      if (id === TAB_CERTS && expiredCount) {
        b.appendChild(C.h('i', {
          'aria-label': `${expiredCount} expired`,
          style: {
            width: '7px', height: '7px', 'border-radius': '50%', 'margin-left': '5px',
            background: 'var(--c-danger)', display: 'inline-block',
          },
        }));
        b.style.display = 'flex';
        b.style.alignItems = 'center';
        b.style.justifyContent = 'center';
      }
      C.tap(b, () => { tab = id; render(); });
      tabs.appendChild(b);
    }

    C.clear(body);
    body.scrollTop = 0;
    if (tab === TAB_CERTS) body.appendChild(renderCerts());
    else if (tab === TAB_LADDER) body.appendChild(renderLadder());
    else body.appendChild(renderSkills());

    if (tab === TAB_SKILLS) requestAnimationFrame(layoutGraphs);
  }

  return {
    el,
    mount() { render(); },
    update() {},
    resize() { if (tab === TAB_SKILLS) layoutGraphs(); },
    onLevelUp() { render(); },
    onCert() { render(); },
    onUnlock(p) { if (p && p.kind === 'cert-expired') render(); },
    onMoney() { if (tab === TAB_CERTS) render(); },
    unmount() {},
    destroy() {
      for (const u of unsubs) { try { u(); } catch (_) { /* already gone */ } }
      unsubs.length = 0;
    },
  };
}
