/**
 * Compare the existing contract terms. Quoted pay is the whole tender; the
 * displayed rate divides it by the whole job's metres. Economy owns settlement.
 */
import { SCENES, groundSwatch } from '../../core/contract.js';
import { allMethods, allRegions, methodInfo, regionInfo, certInfo } from './catalog.js';
import './contracts.css';

/** Higher keys sort first. Keep the original four orderings. */
const SORTS = [
  { id: 'pay', label: 'Highest quoted pay', key: (c) => c.payout || 0 },
  { id: 'rate', label: 'Highest €/m', key: (c) => rateOf(c) },
  { id: 'quick', label: 'Shortest estimate', key: (c) => -(c.estimatedHours || c.deadlineH || 0) },
  { id: 'deep', label: 'Longest unit', key: (c) => c.target || 0 },
];
function metresOf(c) {
  return c.metres || (c.target || 0) * Math.max(1, c.holes || 1) || 0;
}
function rateOf(c) {
  const metres = metresOf(c);
  return metres > 0 ? (c.payout || 0) / metres : 0;
}
const lengthStr = (metres) => `${Number(metres || 0).toFixed(1)} m`;
const estimateStr = (hours) => hours > 0 ? `${Number(hours).toFixed(1)} h` : 'Not provided';
// Keep complete tender amounts visible; the shared HUD formatter abbreviates.
const moneyStr = (amount) => `€${Math.round(amount).toLocaleString('en-GB')}`;
const rateStr = (c) => metresOf(c) > 0
  ? `€${rateOf(c).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / m`
  : 'Not available';
function scopeOf(c) {
  const count = Math.max(1, c.holes || 1);
  // UNIT_NOUN in data.js is the authority. Legacy missing nouns stay neutral.
  const noun = c.unitNoun || 'unit';
  return `${count} ${noun}${count === 1 ? '' : 's'} × ${lengthStr(c.target)}`;
}

export function createContractsScreen(app) {
  const { C, state } = app;
  let filterMethod = 'all', filterRegion = 'all', sortId = 'pay';

  // Shared tap handles pointer/keyboard events. Also accept the native click
  // used by assistive technology; ordinary pointer clicks already ran on tap.
  function action(options) {
    const button = C.Button(options);
    button.addEventListener('click', (event) => {
      if (event.detail === 0 && !button.disabled) options.onTap?.(event);
    });
    return button;
  }
  const methodStrip = C.h('div.contracts-board__filter-group', { role: 'group', 'aria-label': 'Method' });
  const regionStrip = C.h('div.contracts-board__filter-group', { role: 'group', 'aria-label': 'Region' });
  const filterSummary = C.h('summary.contracts-board__filter-toggle', { text: 'Filters' });
  const filters = C.h('details.contracts-board__filters', filterSummary, methodStrip, regionStrip);
  const reset = action({ label: 'Clear filters', kind: 'quiet', onTap: () => {
    filterMethod = 'all'; filterRegion = 'all'; buildFilters(); buildList(); filterSummary.focus();
  } });
  reset.classList.add('contracts-board__reset');
  const sortSelect = C.h('select.contracts-board__sort', { 'aria-label': 'Sort contracts',
    onchange: (event) => { sortId = event.target.value; buildList(); },
  }, ...SORTS.map((sort) => C.h('option', { value: sort.id, text: sort.label })));
  const sortControl = C.h('label.contracts-board__sort-control',
    C.h('span.contracts-board__filter-label', { text: 'Sort contracts' }), sortSelect);
  const list = C.h('div.contracts-board__list');
  const header = C.ScreenHeader({
    title: 'Contracts', sub: 'Job board', onBack: () => app.nav(SCENES.MENU),
    right: C.h('span.shead__spacer'),
  });
  const headerSub = header.querySelector('.shead__s');
  header.querySelector('.shead__back')?.addEventListener('click', (event) => {
    if (event.detail === 0) app.nav(SCENES.MENU);
  });
  // One scroller keeps expanded filters from squeezing the job list to zero.
  const el = C.h('div.contracts-board.scroll', header,
    C.h('div.contracts-board__controls', sortControl, filters, reset), list);

  const namedOr = (info, id) => info || { id, name: String(id || 'Unknown'), country: '' };
  const methodName = (id) => namedOr(methodInfo(id), id).name;
  const regionName = (id) => namedOr(regionInfo(id), id).name;

  function lockReason(c) {
    const player = state.player || {}, unlocked = state.unlocked || {};
    if ((player.level || 1) < (c.level || 1)) return `Reach level ${c.level}`;
    if (unlocked.methods && !unlocked.methods.includes(c.method)) return `Unlock ${methodName(c.method)}`;
    if (unlocked.regions && !unlocked.regions.includes(c.region)) return `Unlock ${regionName(c.region)}`;
    const missing = (c.certs || []).filter((id) => !(player.certs || []).includes(id));
    if (missing.length) return `Needs ${missing.map((id) => certInfo(id)?.name || id).join(' + ')}`;
    return null;
  }
  function groundSummary(strata) {
    if (!strata?.length) return 'Profile not surveyed';
    const first = strata[0], last = strata[strata.length - 1];
    const span = first.name !== last.name ? `${first.name} → ${last.name}` : last.name;
    const ucs = Math.max(0, ...strata.map((stratum) => stratum.ucs || 0));
    return ucs >= 1 ? `${span} · ${Math.round(ucs)} MPa UCS` : `${span} · soft ground`;
  }
  function rowsFor(method, region) {
    return app.contracts().filter((c) => (method === 'all' || c.method === method)
      && (region === 'all' || c.region === region));
  }
  function show(node, visible) { node.hidden = !visible; }
  function filterChip(label, id, active, onTap, count) {
    const chip = C.Chip({ label, active, onTap, count });
    chip.dataset.filterId = id;
    chip.addEventListener('click', (event) => { if (event.detail === 0) onTap(); });
    return chip;
  }
  function buildFilters() {
    const all = app.contracts();
    const methods = allMethods().filter((m) => all.some((c) => c.method === m.id));
    const regions = allRegions().filter((r) => all.some((c) => c.region === r.id));
    if (methods.length < 2 || !all.some((c) => c.method === filterMethod)) filterMethod = 'all';
    if (regions.length < 2 || !all.some((c) => c.region === filterRegion)) filterRegion = 'all';
    C.clear(methodStrip); C.clear(regionStrip);
    show(methodStrip, methods.length > 1); show(regionStrip, regions.length > 1);
    show(filters, methods.length > 1 || regions.length > 1);
    if (methods.length > 1) {
      methodStrip.appendChild(C.h('span.contracts-board__filter-label', { text: 'Method' }));
      methodStrip.appendChild(filterChip('All methods', 'all', filterMethod === 'all',
        () => setFilter('method', 'all'), rowsFor('all', filterRegion).length));
      for (const method of methods) methodStrip.appendChild(filterChip(method.name, method.id, filterMethod === method.id,
        () => setFilter('method', method.id), rowsFor(method.id, filterRegion).length));
    }
    if (regions.length > 1) {
      regionStrip.appendChild(C.h('span.contracts-board__filter-label', { text: 'Region' }));
      regionStrip.appendChild(filterChip('All regions', 'all', filterRegion === 'all',
        () => setFilter('region', 'all'), rowsFor(filterMethod, 'all').length));
      for (const region of regions) regionStrip.appendChild(filterChip(region.name, region.id, filterRegion === region.id,
        () => setFilter('region', region.id), rowsFor(filterMethod, region.id).length));
    }
    const active = [];
    if (filterMethod !== 'all') active.push(methodName(filterMethod));
    if (filterRegion !== 'all') active.push(regionName(filterRegion));
    filterSummary.textContent = active.length ? `Filters · ${active.join(' · ')}` : 'Filters · All contracts';
    show(reset, active.length > 0);
    const shown = rowsFor(filterMethod, filterRegion);
    show(sortControl, shown.length > 1); sortSelect.value = sortId;
    const locked = shown.filter((c) => lockReason(c)).length;
    if (headerSub) headerSub.textContent = shown.length
      ? `${shown.length - locked} open${locked ? ` · ${locked} locked` : ''}` : 'Job board';
  }
  function setFilter(kind, id) {
    if (kind === 'method') filterMethod = id; else filterRegion = id;
    buildFilters(); buildList();
    const group = kind === 'method' ? methodStrip : regionStrip;
    [...group.querySelectorAll('[data-filter-id]')].find((chip) => chip.dataset.filterId === id)?.focus();
  }

  /** Duplicate titles retain the real scope/client that distinguishes them. */
  function disambiguate(rows) {
    const groups = new Map(), titles = new Map();
    for (const contract of rows) {
      if (!groups.has(contract.title)) groups.set(contract.title, []);
      groups.get(contract.title).push(contract);
    }
    for (const [title, group] of groups) {
      const distinct = (field) => new Set(group.map(field)).size === group.length;
      const suffix = group.length < 2 ? null : distinct(scopeOf) ? scopeOf
        : distinct((c) => c.holeDia) ? (c) => `Ø${c.holeDia} mm` : null;
      for (const c of group) titles.set(c.id, suffix ? `${title} · ${suffix(c)}` : title);
    }
    return titles;
  }
  function buildList() {
    C.clear(list);
    const rows = rowsFor(filterMethod, filterRegion);
    if (!rows.length) {
      list.appendChild(app.contracts().length
        ? C.Empty('No contracts match', 'Clear filters to see the whole board.')
        : C.Empty('Content unavailable', 'The contract board could not be loaded.'));
      return;
    }
    const sort = SORTS.find((entry) => entry.id === sortId) || SORTS[0];
    rows.sort((a, b) => Number(!!lockReason(a)) - Number(!!lockReason(b)) || sort.key(b) - sort.key(a));
    const titles = disambiguate(rows), fragment = document.createDocumentFragment();
    for (const c of rows) fragment.appendChild(makeCard(c, titles.get(c.id) || c.title));
    list.appendChild(fragment); list.classList.add('stagger'); C.stagger(list.children);
  }
  function metric(label, value, extraClass = '') {
    return C.h(`span.contract-card__metric${extraClass ? '.' + extraClass : ''}`,
      C.h('span.contract-card__label', { text: label }),
      C.h('span.contract-card__value', { text: value }));
  }
  function makeCard(c, title) {
    const locked = lockReason(c), method = methodName(c.method), region = regionName(c.region);
    const scope = `${scopeOf(c)} · ${lengthStr(metresOf(c))} total${c.holeDia ? ` · Ø${c.holeDia}\u00a0mm` : ''}`;
    const constraint = c.constraint?.label || 'Not specified';
    const deadline = c.deadlineH > 0 ? `${c.deadlineH} h` : 'Not provided';
    const card = C.h('button.contract-card', {
      type: 'button', dataset: { contractId: c.id },
      'aria-label': `${title}, ${method}, ${region}, ${scope}, quoted pay ${moneyStr(c.payout)}, estimated ${estimateStr(c.estimatedHours)}, deadline ${deadline}, ${constraint}${locked ? `, locked: ${locked}` : ''}`,
      onclick: (event) => { app.haptic?.('light'); openDetail(c, title, event.currentTarget); },
    },
    C.h('span.contract-card__method', { text: method }),
    C.h('span.contract-card__title', { text: title }),
    C.h('span.contract-card__context', { text: `${c.client} · ${region}` }),
    C.h('span.contract-card__context', { text: c.application }),
    C.h('span.contract-card__metrics',
      metric('Quoted pay · whole job', moneyStr(c.payout), 'contract-card__metric--pay'),
      metric('Estimated job time', estimateStr(c.estimatedHours)),
      metric('Quoted pay / total m', rateStr(c))),
    C.h('span.contract-card__scope', { text: scope }),
    C.h('span.contract-card__constraint', { text: `Constraint · ${constraint}` }),
    C.h('span.contract-card__deadline', { text: `Deadline · ${deadline}` }),
    C.h('span.contract-card__ground', { text: `Ground · ${groundSummary(app.strataFor(c))}` }),
    locked ? C.h('span.contract-card__lock', C.Icon('lock', 14), C.h('span', { text: locked })) : null);
    if (locked) card.classList.add('is-locked');
    return card;
  }

  /** Displayed ground colours, not material albedos: contract.js is authority. */
  function swatch(stratum) {
    const colors = groundSwatch(stratum.id);
    return `linear-gradient(180deg, ${colors[0]}, ${colors[1]})`;
  }
  function openDetail(c, title = c.title, opener = document.activeElement) {
    const locked = lockReason(c);
    const method = methodName(c.method), region = namedOr(regionInfo(c.region), c.region);
    const strata = app.strataFor(c);
    const ucs = strata.length ? Math.max(0, ...strata.map((s) => s.ucs || 0)) : null;
    const column = C.StratumColumn({ width: 44, height: 196, strata, dpr: app.viewport.dpr });
    const legend = C.h('div.cdetail__legend');
    for (const stratum of strata) legend.appendChild(C.h('div.cdetail__lrow',
      C.h('i.cdetail__sw', { style: { background: swatch(stratum) } }),
      C.h('span.cdetail__lname', { text: stratum.name }),
      C.h('span.cdetail__ldepth', { text: `${stratum.top.toFixed(1)}–${stratum.bottom.toFixed(1)} m` })));
    const certRows = (c.certs || []).map((id) => {
      const cert = certInfo(id), held = (state.player?.certs || []).includes(id);
      return C.h('div.certcard' + (held ? '.is-held' : ''),
        C.h('span.certcard__ico', C.Icon(held ? 'check' : 'lock', 18)),
        C.h('div.certcard__b', C.h('p.certcard__t', { text: cert?.name || id }),
          C.h('p.certcard__s', { text: held ? 'Held' : `Not held · ${cert?.issuer || 'required'}` })));
    });
    const failure = C.h('p.contracts-detail__error', { role: 'alert', hidden: true });
    const body = C.h('div.contracts-detail__body',
      C.h('div', C.SectionTitle('Job terms'), C.h('dl.specs',
        C.SpecRow('Quoted pay · whole job', moneyStr(c.payout)),
        C.SpecRow('Quoted pay / total m', rateStr(c)),
        C.SpecRow('Estimated job time', estimateStr(c.estimatedHours)),
        C.SpecRow('Deadline', c.deadlineH > 0 ? `${c.deadlineH} h` : 'Not provided'),
        C.SpecRow('Constraint', c.constraint?.label || 'Not specified'))),
      C.h('div', C.SectionTitle('Scope'), C.h('dl.specs',
        C.SpecRow('Method', method), C.SpecRow('Work', scopeOf(c)),
        C.SpecRow('Total job length', lengthStr(metresOf(c))),
        c.holeDia ? C.SpecRow('Diameter', `${c.holeDia} mm`) : null,
        c.faceAreaM2 ? C.SpecRow('Face area', `${c.faceAreaM2} m²`) : null,
        c.holeLengthM ? C.SpecRow('Length per ring hole', lengthStr(c.holeLengthM)) : null,
        C.SpecRow('Application', c.application), C.SpecRow('Client', c.client),
        C.SpecRow('Region', [region.name, region.country].filter(Boolean).join(', ')))),
      c.brief ? C.h('div', C.SectionTitle('Client brief'), C.h('p.cdetail__brief', { text: c.brief })) : null,
      C.h('div', C.SectionTitle('Ground profile'), strata.length
        ? C.h('div.cdetail__profile', C.h('div.contracts-detail__column', column.el), legend)
        : C.h('p.cdetail__brief', { text: 'Profile not surveyed' }),
      C.h('dl.specs',
        C.SpecRow('Hardest ground', ucs === null ? 'Not surveyed' : ucs >= 1 ? `${Math.round(ucs)} MPa UCS` : 'Soil · under 1 MPa UCS'),
        c.difficulty ? C.SpecRow('Difficulty', `${c.difficulty} / 5`) : null)),
      C.h('div', C.SectionTitle('Settlement'),
        C.h('p.cdetail__brief', { text: 'Quoted pay is the base tender for the whole job. Completion, grade, bonuses, penalties, role, skills and reputation affect final pay. Costs are deducted separately.' }),
        C.h('dl.specs',
          c.bonus?.time > 0 ? C.SpecRow('Time bonus component', `Up to ${moneyStr(c.bonus.time)}`) : null,
          c.bonus?.quality > 0 ? C.SpecRow('Quality bonus component', `Up to ${moneyStr(c.bonus.quality)}`) : null,
          c.reputationReward ? C.SpecRow('Base reputation', `+${c.reputationReward} in ${region.name}`) : null),
        c.bonus?.time > 0 ? C.h('p.cdetail__brief', { text: 'Time bonus portions depend on finishing work within its allocated time; earlier completion earns more.' }) : null,
        c.bonus?.quality > 0 ? C.h('p.cdetail__brief', { text: 'Quality bonus portions follow work grade: B earns 25%, A 60% and S 100% of the component, before payout modifiers.' }) : null,
        c.reputationReward ? C.h('p.cdetail__brief', { text: 'Grade, skills and role also affect reputation earned.' }) : null),
      certRows.length ? C.h('div', C.SectionTitle('Required certifications'), ...certRows) : null,
      locked ? C.h('div.contract-card__lock', C.Icon('lock', 14), C.h('span', { text: locked })) : null,
      failure);
    let accepting = false;
    const accept = action({ label: locked ? 'Locked' : 'Accept contract',
      kind: locked ? 'quiet' : 'amber', disabled: !!locked, haptic: 'heavy',
      onTap: () => {
        if (accepting) return;
        accepting = true; accept.disabled = true;
        const result = acceptContract(c);
        if (!result.ok) {
          failure.hidden = false; failure.textContent = result.reason;
          accepting = false; accept.disabled = !!locked; app.haptic?.('fail');
          failure.scrollIntoView({ block: 'nearest' });
          return;
        }
        sheet.close();
        const accepted = result.contract || state.contract || c;
        app.toast(`Mobilising to ${regionName(accepted.regionId || accepted.region)}`, 'amber');
        app.nav(SCENES.SITE, { contract: accepted });
      },
    });
    const sheet = app.sheet({ title, sub: `${region.name} · ${method}`, body,
      actions: [action({ label: 'Close', kind: 'quiet', onTap: () => sheet.close() }), accept] });
    sheet.el.classList.add('contracts-detail'); sheet.returnFocus = opener;
    sheet.el.querySelector('.sheet__x')?.addEventListener('click', (event) => {
      if (event.detail === 0) sheet.close();
    });
    const dialog = sheet.el.querySelector('[role="dialog"]');
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex="0"]')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    requestAnimationFrame(() => {
      if (!sheet.el.isConnected) return;
      column.resize(44, 196, app.viewport.dpr); sheet.el.querySelector('.sheet__x')?.focus();
    });
  }

  function acceptContract(contract) {
    // Progression validates ownership, charges mobilisation, publishes the run
    // and emits its events. UI failure never navigates or writes game state.
    const locked = lockReason(contract);
    if (locked) return { ok: false, reason: locked };
    const progression = app.ctx.progression;
    if (typeof progression?.acceptContract !== 'function') return { ok: false, reason: 'Contract acceptance is unavailable. Please try again.' };
    try {
      const result = progression.acceptContract(contract);
      if (result?.ok === true) return result;
      return { ok: false, reason: result?.reason || 'This contract could not be accepted.' };
    } catch (error) {
      console.error('[ui] progression.acceptContract', error);
      return { ok: false, reason: 'This contract could not be accepted. Please try again.' };
    }
  }

  return { el, mount() { buildFilters(); buildList(); },
    unmount() { list.classList.remove('stagger'); }, update() {}, resize() {},
    onUnlock() { buildFilters(); buildList(); }, onLevelUp() { buildFilters(); buildList(); },
    onCert() { buildFilters(); buildList(); } };
}
