/**
 * CONTRACTS — the job board.
 *
 * The screen's whole job is to make one choice feel consequential, so every
 * card has to carry the axes a driller would actually compare: method,
 * application, scope (how many holes, how deep, what diameter), what ground it
 * ends in, what it pays per metre, and how much of the deadline the estimate
 * already eats. A board of five jobs that differ only in payout is not a
 * choice; it is a list.
 *
 * Three things were fixed here after round 2:
 *
 *  - DUPLICATE TITLES. The generator picks a title from a small per-application
 *    pool and dedupes the board on `method:application` only, so two jobs can
 *    and do arrive both called "Piling works". They are told apart here by the
 *    scope that actually differs between them — never by an invented "(2)".
 *
 *  - DEAD FILTER COUNTS. Every chip read the size of the whole board, because
 *    each strip counted against the unfiltered list. Counts are now
 *    cross-filtered (methods count within the chosen region and vice versa),
 *    and a strip offering a single option is not drawn at all — at level 1
 *    there is exactly one method in the region, and a chip that filters
 *    nothing is noise. A sort strip takes its place, which is the control that
 *    is genuinely useful on a five-row board.
 *
 *  - RAGGED CARD HEIGHTS. Every block in the card body now occupies a fixed
 *    number of lines: the title reserves two whether or not it wraps, and the
 *    lock reason replaces the ground line instead of being appended as an
 *    extra row.
 */
import { SCENES, EVENTS, groundSwatch } from '../../core/contract.js';
import {
  allMethods, allRegions, methodInfo, regionInfo, certInfo, strataFromProfile,
} from './catalog.js';

/** Board orderings. `key` returns a sortable number; higher sorts first. */
const SORTS = [
  { id: 'pay', label: 'Top pay', key: (c) => c.payout || 0 },
  { id: 'rate', label: 'Best €/m', key: (c) => rateOf(c) },
  { id: 'quick', label: 'Quickest', key: (c) => -(c.estimatedHours || c.deadlineH || 0) },
  { id: 'deep', label: 'Deepest', key: (c) => c.target || 0 },
];

/** Metres of hole in the whole job, not just one hole of it. */
function metresOf(c) {
  return c.metres || (c.target || 0) * Math.max(1, c.holes || 1) || 0;
}
function rateOf(c) {
  const m = metresOf(c);
  return m > 0 ? (c.payout || 0) / m : 0;
}
/** One consistent depth format for the board. `fmtDepth` switches precision
 *  at 10 m, which makes a column of depths change shape halfway down. */
const depthStr = (m) => `${Number(m || 0).toFixed(Math.abs(m) >= 100 ? 0 : 1)} m`;

export function createContractsScreen(app) {
  const { C, state, fmtMoney, fmtDepth } = app;

  let filterMethod = 'all';
  let filterRegion = 'all';
  let sortId = 'pay';
  let cards = [];          // { el, col, contract, wrap }

  const methodStrip = C.Strip();
  const regionStrip = C.Strip();
  const sortStrip = C.Strip();
  const list = C.h('div.scroll.scroll--snap');

  const header = C.ScreenHeader({
    title: 'Contracts', sub: 'Job board',
    onBack: () => app.nav(SCENES.MENU),
    right: C.h('span.shead__spacer'),
  });
  const headerSub = header.querySelector('.shead__s');

  const el = C.h('div',
    header,
    C.h('div.cfilters', methodStrip, regionStrip, sortStrip),
    list,
  );

  /**
   * A method/region a card can render even when game/data.js does not know the
   * id — a stale save, or a renamed id. The id itself is printed rather than a
   * substituted name, so the gap is visible instead of quietly wrong.
   */
  const namedOr = (info, id) => info
    || { id, name: String(id || 'Unknown'), short: '', note: '', country: '', level: 1, tint: 'forest' };

  /* ── Availability ─────────────────────────────────────────────────────── */
  function lockReason(c) {
    const p = state.player || {};
    const un = state.unlocked || {};
    if ((p.level || 1) < (c.level || 1)) return `Reach level ${c.level}`;
    // An id data.js cannot name prints as the raw id — ugly, but true.
    if (un.methods && !un.methods.includes(c.method)) return `Unlock ${methodInfo(c.method)?.name || c.method}`;
    if (un.regions && !un.regions.includes(c.region)) return `Unlock ${regionInfo(c.region)?.name || c.region}`;
    const missing = (c.certs || []).filter((id) => !(p.certs || []).includes(id));
    if (missing.length) {
      const names = missing.map((id) => certInfo(id)?.name || id);
      return `Needs ${names.slice(0, 2).join(' + ')}${names.length > 2 ? ` +${names.length - 2}` : ''}`;
    }
    return null;
  }

  /* ── Ground ───────────────────────────────────────────────────────────── */
  /**
   * The ground line: where the hole starts, where it ends, and how hard the
   * worst of it is. UCS below 1 MPa is soil, not rock — printing "0 MPa" there
   * would be a unit-correct number that says nothing true.
   */
  function groundSummary(strata) {
    if (!strata || !strata.length) return '';
    const first = strata[0];
    const last = strata[strata.length - 1];
    const span = strata.length > 1 && first.name !== last.name
      ? `${first.name} → ${last.name}`
      : last.name;
    const ucs = Math.max(0, ...strata.map((s) => s.ucs || 0));
    return ucs >= 1 ? `${span} · ${Math.round(ucs)} MPa` : `${span} · soft ground`;
  }

  /* ── Filters, counts and ordering ─────────────────────────────────────── */
  function rowsFor(method, region) {
    return app.contracts().filter((c) =>
      (method === 'all' || c.method === method) &&
      (region === 'all' || c.region === region));
  }

  function buildFilters() {
    const all = app.contracts();
    C.clear(methodStrip); C.clear(regionStrip); C.clear(sortStrip);

    const methods = allMethods().filter((m) => all.some((c) => c.method === m.id));
    const regions = allRegions().filter((r) => all.some((c) => c.region === r.id));

    /* A strip that offers one option filters nothing, and a chip whose count
       equals the whole board tells the player nothing. Draw neither. */
    show(methodStrip, methods.length > 1);
    show(regionStrip, regions.length > 1);

    if (methods.length > 1) {
      methodStrip.appendChild(Chip('All methods', filterMethod === 'all',
        () => setMethod('all'), rowsFor('all', filterRegion).length));
      for (const m of methods) {
        methodStrip.appendChild(Chip(m.name, filterMethod === m.id,
          () => setMethod(m.id), rowsFor(m.id, filterRegion).length));
      }
    } else if (filterMethod !== 'all') {
      filterMethod = 'all';
    }

    if (regions.length > 1) {
      regionStrip.appendChild(Chip('All regions', filterRegion === 'all',
        () => setRegion('all'), rowsFor(filterMethod, 'all').length));
      for (const r of regions) {
        regionStrip.appendChild(Chip(r.name, filterRegion === r.id,
          () => setRegion(r.id), rowsFor(filterMethod, r.id).length));
      }
    } else if (filterRegion !== 'all') {
      filterRegion = 'all';
    }

    // Sorting is the control that matters when the board is short: it is what
    // turns four similar jobs into a visible trade-off.
    const sortable = rowsFor(filterMethod, filterRegion).length > 1;
    show(sortStrip, sortable);
    if (sortable) {
      sortStrip.appendChild(C.h('span.label', {
        style: { display: 'flex', 'align-items': 'center', 'padding-right': 'var(--s-1)' },
        text: 'Sort',
      }));
      for (const s of SORTS) {
        sortStrip.appendChild(C.Chip({
          label: s.label, active: sortId === s.id, onTap: () => setSort(s.id),
        }));
      }
    }

    const shown = rowsFor(filterMethod, filterRegion);
    const locked = shown.filter((c) => lockReason(c)).length;
    if (headerSub) {
      const open = shown.length - locked;
      headerSub.textContent = shown.length
        ? `${open} open${locked ? ` · ${locked} locked` : ''}`
        : 'Job board';
    }
  }

  function show(node, on) { node.style.display = on ? '' : 'none'; }
  function Chip(label, active, onTap, count) {
    return C.Chip({ label, active, count, onTap });
  }
  function setMethod(id) { filterMethod = id; buildFilters(); buildList(); }
  function setRegion(id) { filterRegion = id; buildFilters(); buildList(); }
  function setSort(id) { sortId = id; buildFilters(); buildList(); }

  /**
   * Two jobs on one board can share a title — the generator picks from a small
   * per-application pool and only dedupes on method+application. Rather than
   * numbering them, name the axis on which they differ, cheapest first: hole
   * count, then depth, then diameter.
   */
  function disambiguate(rows) {
    const groups = new Map();
    for (const c of rows) {
      const g = groups.get(c.title);
      if (g) g.push(c); else groups.set(c.title, [c]);
    }
    const out = new Map();
    for (const [title, group] of groups) {
      if (group.length < 2) { for (const c of group) out.set(c.id, title); continue; }
      const distinct = (f) => new Set(group.map(f)).size === group.length;
      let suffix = null;
      if (distinct((c) => `${c.holes || 1}×${Math.round((c.target || 0) * 10)}`)) {
        suffix = (c) => ((c.holes || 1) > 1 ? `${c.holes} × ${depthStr(c.target)}` : depthStr(c.target));
      } else if (distinct((c) => c.holeDia)) {
        suffix = (c) => `Ø${c.holeDia} mm`;
      } else if (distinct((c) => c.client)) {
        suffix = null;  // the client line above the title already separates them
      }
      for (const c of group) out.set(c.id, suffix ? `${title} · ${suffix(c)}` : title);
    }
    return out;
  }

  /* ── Cards ────────────────────────────────────────────────────────────── */
  function buildList() {
    for (const c of cards) c.col?.el.remove();
    cards = [];
    C.clear(list);

    const rows = rowsFor(filterMethod, filterRegion);

    if (!rows.length) {
      // An empty board and an over-filtered board are different failures, and
      // "clear a filter" is useless advice when there is no content at all.
      const anyAtAll = app.contracts().length > 0;
      list.appendChild(anyAtAll
        ? C.Empty('No contracts match', 'Clear a filter to see the whole board.')
        : C.Empty('Content unavailable', 'The contract board could not be loaded.'));
      return;
    }

    // Available first, then by the chosen ordering.
    const sort = SORTS.find((s) => s.id === sortId) || SORTS[0];
    rows.sort((a, b) => {
      const la = lockReason(a) ? 1 : 0, lb = lockReason(b) ? 1 : 0;
      if (la !== lb) return la - lb;
      return sort.key(b) - sort.key(a);
    });

    const titles = disambiguate(rows);
    const frag = document.createDocumentFragment();
    for (const c of rows) frag.appendChild(makeCard(c, titles.get(c.id) || c.title));
    list.appendChild(frag);
    list.classList.add('stagger');
    C.stagger(list.children);
    // Sizes are only known once the cards are in the document.
    requestAnimationFrame(sizeColumns);
  }

  /**
   * One icon + one value inside a `.ccard__meta` row. The value truncates
   * rather than wrapping, which is what keeps every card the same height —
   * `.ccard__meta` has no truncation of its own.
   */
  function metaItem(icon, text, tint) {
    return C.h('span', { style: { 'min-width': '0', overflow: 'hidden' } },
      C.Icon(icon, 13),
      C.h('b', {
        style: {
          'min-width': '0', overflow: 'hidden',
          'text-overflow': 'ellipsis', 'white-space': 'nowrap',
          color: tint || null,
        },
        text,
      }),
    );
  }

  function makeCard(c, title) {
    const locked = lockReason(c);
    const m = namedOr(methodInfo(c.method), c.method);
    const r = namedOr(regionInfo(c.region), c.region);
    const strata = app.strataFor(c);
    const rate = rateOf(c);
    const holes = Math.max(1, c.holes || 1);

    const col = C.StratumColumn({ width: 38, height: 118, strata, dpr: app.viewport.dpr });
    const colWrap = C.h('div.ccard__col', col.el);

    // Scope: what you are actually being asked to drill.
    const scope = holes > 1 ? `${holes} × ${depthStr(c.target)}` : depthStr(c.target);
    const dia = c.holeDia ? ` · Ø${c.holeDia} mm` : '';

    // Time pressure. The estimate is the honest read on a deadline: a job that
    // eats three quarters of its window before anything goes wrong is a
    // different proposition from one that eats a third.
    const est = c.estimatedHours || 0;
    const dl = c.deadlineH || 0;
    const tight = est > 0 && dl > 0 && est > dl * 0.72;
    // `C.fmtHours` writes "6h" with no space; the estimate matches it rather
    // than inventing a second hour format one line apart.
    const timeText = est > 0
      ? `${C.fmtHours(dl)} · est ${est.toFixed(est < 10 ? 1 : 0)}h`
      : C.fmtHours(dl);

    /* The ground line doubles as the lock line. A job you cannot take does not
       need its stratigraphy explained; it needs to say why. Keeping them in one
       slot is also what stops the card heights going ragged. */
    const groundText = groundSummary(strata);
    const groundEl = C.h('div.ccard__meta', locked
      ? metaItem('lock', locked, 'var(--c-warning)')
      : metaItem('layers', groundText || 'Profile not surveyed'));

    const card = C.Card({
      onTap: () => openDetail(c, title),
      locked: !!locked,
    },
      colWrap,
      C.h('div.ccard__body',
        C.h('div.ccard__top',
          C.h('div', { style: { 'min-width': '0' } },
            C.h('p.ccard__client', { text: c.client }),
            /* Two lines are reserved whether or not the title needs them, so a
               one-line title does not shrink the card out of step with its
               neighbours. The clamp in styles.css caps the other end. */
            C.h('h3.ccard__title', {
              style: { 'min-height': 'calc(2 * var(--lh-snug) * var(--t-md))' },
              text: title,
            }),
          ),
          C.Difficulty(c.difficulty || 1),
        ),
        C.h('div.ccard__tags',
          C.Pill(m.name, 'amber', 'bit'),
          C.Pill(c.application, 'steel'),
        ),
        C.h('div.ccard__meta', { style: { 'justify-content': 'space-between' } },
          metaItem('depth', scope + dia),
          metaItem('clock', timeText, tight ? 'var(--c-warning)' : null),
        ),
        groundEl,
        C.h('div.ccard__foot',
          C.h('span.ccard__pay', { text: fmtMoney(c.payout) }),
          C.h('div.ccard__meta',
            metaItem('money', rate > 0 ? `${fmtMoney(rate)} / m` : '—'),
          ),
        ),
      ),
    );
    card.classList.add('ccard');
    card.setAttribute('aria-label',
      `${title}, ${r.name}, ${m.name}, ${scope}, ${fmtMoney(c.payout)}${locked ? ', locked: ' + locked : ''}`);
    cards.push({ el: card, col, contract: c, wrap: colWrap });
    return card;
  }

  function sizeColumns() {
    for (const c of cards) {
      const hh = c.wrap.clientHeight || 118;
      c.col.resize(38, hh, app.viewport.dpr);
    }
  }

  /** Strata from geology/sim may omit colours; GROUND is the authority. */
  function swatch(st) {
    // Displayed colours, not albedos — see contract.js GROUND_DISPLAY.
    const c = groundSwatch(st.id);
    return `linear-gradient(180deg, ${c[0]}, ${c[1]})`;
  }

  /* ── Detail sheet ─────────────────────────────────────────────────────── */
  function openDetail(c, title = c.title) {
    const locked = lockReason(c);
    const m = namedOr(methodInfo(c.method), c.method);
    const r = namedOr(regionInfo(c.region), c.region);
    const strata = app.strataFor(c);
    const total = strata.length ? strata[strata.length - 1].bottom : c.target;
    const metres = metresOf(c);
    const holes = Math.max(1, c.holes || 1);
    const ucs = strata.length ? Math.max(0, ...strata.map((s) => s.ucs || 0)) : 0;

    const col = C.StratumColumn({ width: 44, height: 196, strata, dpr: app.viewport.dpr });

    const legend = C.h('div.cdetail__legend');
    for (const st of strata) {
      legend.appendChild(C.h('div.cdetail__lrow',
        C.h('i.cdetail__sw', { style: { background: swatch(st) } }),
        C.h('span.cdetail__lname', { text: st.name }),
        C.h('span.cdetail__ldepth', { text: `${st.top.toFixed(0)}–${st.bottom.toFixed(0)} m` }),
      ));
    }

    const certRows = (c.certs || []).map((id) => {
      const cert = certInfo(id);
      const held = (state.player?.certs || []).includes(id);
      return C.h('div.certcard' + (held ? '.is-held' : ''),
        C.h('span.certcard__ico', C.Icon(held ? 'check' : 'lock', 18)),
        C.h('div.certcard__b',
          C.h('p.certcard__t', { text: cert?.name || id }),
          C.h('p.certcard__s', { text: held ? 'Held' : `Not held · ${cert ? cert.issuer : 'required'}` }),
        ),
      );
    });

    const est = c.estimatedHours || 0;
    const dl = c.deadlineH || 0;
    const slack = est > 0 && dl > 0 ? dl - est : null;

    const body = C.h('div', { style: { display: 'flex', 'flex-direction': 'column', gap: '20px' } },
      C.h('p.cdetail__brief', { text: c.brief }),

      C.h('div',
        C.SectionTitle('Ground profile'),
        C.h('div.cdetail__profile', C.h('div.ccard__col', { style: { height: '196px' } }, col.el), legend),
      ),

      C.h('div',
        C.SectionTitle('Scope'),
        C.h('dl.specs',
          C.SpecRow('Client', c.client),
          C.SpecRow('Region', `${r.name}, ${r.country}`),
          C.SpecRow('Application', c.application),
          C.SpecRow('Method', m.name),
          C.SpecRow('Holes', holes > 1 ? `${holes} × ${fmtDepth(c.target)}` : `1 × ${fmtDepth(c.target)}`),
          C.SpecRow('Total metres', `${metres.toFixed(1)} m`),
          c.holeDia ? C.SpecRow('Hole diameter', `${c.holeDia} mm`) : null,
          C.SpecRow('Deepest layer', strata.length ? strata[strata.length - 1].name : '—'),
          // Below 1 MPa the column is soil. A rounded "0 MPa UCS" is a
          // unit-correct number that states something untrue about the ground.
          C.SpecRow('Hardest ground', ucs >= 1 ? `${Math.round(ucs)} MPa UCS` : 'Soil — under 1 MPa UCS'),
          C.SpecRow('Difficulty', `${c.difficulty} / 5`),
        ),
      ),

      C.h('div',
        C.SectionTitle('Time and money'),
        C.h('dl.specs',
          C.SpecRow('Deadline', C.fmtHours(dl)),
          est > 0 ? C.SpecRow('Estimated on tools', `${est.toFixed(est < 10 ? 1 : 0)}h`) : null,
          slack !== null ? C.SpecRow('Slack', slack >= 0
            ? `${slack.toFixed(slack < 10 ? 1 : 0)}h spare`
            : `${Math.abs(slack).toFixed(1)}h short`) : null,
          C.SpecRow('Payout', fmtMoney(c.payout)),
          C.SpecRow('Rate', `${fmtMoney(c.payout / Math.max(1, total))} / m of hole`),
          C.SpecRow('Rate on the job', `${fmtMoney(rateOf(c))} / m drilled`),
          c.reputationReward ? C.SpecRow('Reputation', `+${c.reputationReward} in ${r.name}`) : null,
        ),
      ),

      certRows.length ? C.h('div', C.SectionTitle('Required certifications'), ...certRows) : null,

      locked ? C.h('div.ccard__lock', C.Icon('lock', 14), C.h('span', { text: locked })) : null,
    );

    const accept = C.Button({
      label: locked ? 'Locked' : 'Accept contract',
      kind: locked ? 'quiet' : 'amber',
      disabled: !!locked,
      haptic: 'heavy',
      onTap: () => { sh.close(); acceptContract(c); },
    });

    const sh = app.sheet({
      title,
      sub: `${r.name} · ${m.name}`,
      body,
      actions: [C.Button({ label: 'Close', kind: 'quiet', onTap: () => sh.close() }), accept],
    });
    requestAnimationFrame(() => col.resize(44, 196, app.viewport.dpr));
  }

  function acceptContract(c) {
    const progression = app.ctx.progression;
    if (progression?.acceptContract) {
      const result = progression.acceptContract(c);
      if (!result.ok) { app.toast(result.reason, 'warn'); return; }
      if (result.resumed) { app.nav(SCENES.SITE, { contract: state.contract }); return; }
    }
    state.contract = c;
    if (state.drill) {
      state.drill.target = c.target;
      state.drill.depth = 0;
      state.drill.stratumIndex = 0;
    }
    if (state.world) state.world.regionId = c.region;

    // world/geology.js builds the real profile (and the 3D section with it).
    // It must run before the SITE screen hands the hole to the sim.
    const geo = app.ctx.geology;
    let strata = null;
    if (geo && typeof geo.generateProfile === 'function') {
      try { strata = geo.generateProfile(c) || geo.strata; }
      catch (e) { console.error('[ui] geology.generateProfile', e); }
    }
    if (!strata || !strata.length) strata = strataFromProfile(c.profile, c.target);
    if (state.world) {
      state.world.strata = strata;
      state.world.contractId = c.id;
    }
    if (!progression?.acceptContract) {
      app.bus.emit(EVENTS.CONTRACT_ACCEPT, { contract: c });
      app.bus.emit(EVENTS.REGION_CHANGE, { regionId: c.region });
    }
    app.toast(`Mobilising to ${regionInfo(c.region).name}`, 'amber');
    app.nav(SCENES.SITE, { contract: c });
  }

  return {
    el,
    mount() { buildFilters(); buildList(); },
    unmount() { list.classList.remove('stagger'); },
    update() {},
    resize() { sizeColumns(); },
    onUnlock() { buildFilters(); buildList(); },
    onLevelUp() { buildFilters(); buildList(); },
    onCert() { buildFilters(); buildList(); },
  };
}
