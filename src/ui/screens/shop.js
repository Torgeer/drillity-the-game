/**
 * SHOP — "iMarket".
 *
 * The real Drillity taxonomy, derived from the listings themselves:
 * super-group → family → subcategory → listing. Nothing here is hand-declared,
 * so the shop is always exactly the catalogue that game/data.js authors.
 *
 * PLATFORM_TRUTH Part A is the contract:
 *   • a listing sits in exactly ONE subcategory — you BROWSE by category;
 *   • the listing facets are condition, listing type, thread, size, material,
 *     duty, soil/rock class and fits-rig brand — you FILTER by those. Four of
 *     them are live here: condition, listing type, duty and thread;
 *   • condition (New / Refurbished / Used / For parts) is a real facet, and
 *     used gear is genuinely the budget path: it costs less and arrives with
 *     part of its life already spent.
 *
 * Item cards ask ctx.shopPreview for a thumbnail of the builder that
 * catalog.js's leaf → builder table resolves — it is async and may decline —
 * and fall back to an authored procedural card. Never a broken image.
 */
import { EVENTS, SCENES } from '../../core/contract.js';
import {
  shopTree, shopListings, listingsInSub, slotInfo, methodInfo, rigInfo,
  CONDITIONS, LISTING_TYPES, DUTIES, listingTypeName, dutyName,
  previewRefFor, primeBuilderIds,
} from './catalog.js';

/**
 * The comparable numbers, keyed to the REAL game/data.js stat fields.
 * `better: -1` means lower is better (wear rate).
 */
const STAT_META = [
  { key: 'ropMult',     label: 'ROP',       better:  1, fmt: (v) => `${v.toFixed(2)}×` },
  { key: 'life',        label: 'Life',      better:  1, fmt: (v) => `${Math.round(v).toLocaleString('en-US')} m`, skipZero: true },
  { key: 'maxUCS',      label: 'Max UCS',   better:  1, fmt: (v) => `${Math.round(v)} MPa`, skipZero: true },
  { key: 'abrasionRes', label: 'Abrasion',  better:  1, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: 'wearRate',    label: 'Wear rate', better: -1, fmt: (v) => `${v.toFixed(2)}×` },
  { key: 'torqueCap',   label: 'Torque',    better:  1, fmt: (v) => `${v.toFixed(1)} kNm`, skipZero: true },
  { key: 'flushRate',   label: 'Flushing',  better:  1, fmt: (v) => `${v.toFixed(2)}×`, skipZero: true },
];

/** Money on a purchase screen is exact. A bit costs €118; never write €0.1k. */
const eur = (v) => `€${Math.round(Number(v) || 0).toLocaleString('en-US')}`;

const tierLabel = (t) => (t === 'prem' ? 'Premium' : t === 'econ' ? 'Economy' : 'Standard');

/**
 * Family glyphs — the marketplace's front door.
 *
 * Drillity's own positioning is "built by people who know a shank adapter from
 * a drift bit", so the aisles are signposted with the equipment, not with
 * general-purpose UI furniture: no stock-chart arrow over HDD, no map pin over
 * Tunneling, no speedometer over Casing Attachments. Where a family has no
 * glyph of its own it borrows one that is still *about the thing* (a rod for
 * threadbar, a lightning bolt for power units) and never a pun.
 *
 * Top Hammer and DTH are different methods driven by different machines, so
 * they get different glyphs: `drifter` is the rock drill on the feed beam,
 * `dth` is the hammer at the bit.
 *
 * Order matters — the first pattern that matches wins.
 */
const FAMILY_ICONS = [
  [/top hammer tools/i,               'drifter'],
  [/\bdth\b/i,                        'dth'],
  [/bits|cutting tools/i,             'bit'],
  [/drill string|rods/i,              'rod'],
  [/casing & overburden/i,            'layers'],
  [/rotary & kelly|foundation tools/i, 'wrench'],
  [/ground-engaging|wear tools/i,     'pick'],
  [/adapters|couplings|subs/i,        'rod'],
  [/flushing|swivels/i,               'drop'],
  [/drilling rigs/i,                  'rig'],
  [/piling/i,                         'piling'],
  [/hdd|trenchless/i,                 'hdd'],
  [/tunneling|underground/i,          'tunnel'],
  [/casing & foundation attachments/i, 'rotator'],
  [/diaphragm|slurry/i,               'layers'],
  [/mud & fluid/i,                    'drop'],
  [/pneumatics|compressors/i,         'air'],
  [/hydraulic systems/i,              'settings'],
  [/power units|engines/i,            'bolt'],
  [/grouting|injection/i,             'drop'],
  [/directional/i,                    'hdd'],
  [/bop|well control/i,               'shield'],
  [/wellhead|completion/i,            'layers'],
  [/exploration|coring/i,             'depth'],
  [/site investigation|testing/i,     'gauge'],
  [/self-drilling anchors|sda/i,      'rod'],
  [/threadbar|gewi/i,                 'rod'],
  [/strand ground anchors/i,          'rod'],
  [/rock bolts|soil nails/i,          'rod'],
  [/micropiles|pile systems/i,        'piling'],
  [/mesh|surface support/i,           'layers'],
  [/anchor install|stressing/i,       'wrench'],
  [/clamping|breakout/i,              'wrench'],
  [/rotary drives|gear/i,             'settings'],
  [/bearings|bushings/i,              'settings'],
  [/hardware|fasteners/i,             'settings'],
  [/housings|covers|structural/i,     'layers'],
  [/safety|ppe/i,                     'helmet'],
  [/workshop|maintenance/i,           'wrench'],
  [/electrics|control|monitoring/i,   'gauge'],
  [/services|rentals/i,               'cart'],
  [/water supply|dewatering/i,        'drop'],
  [/transport|handling|lifting/i,     'garage'],
  [/spares|consumables/i,             'cart'],
];
function iconForFamily(name) {
  for (const [re, id] of FAMILY_ICONS) if (re.test(String(name))) return id;
  return 'cart';
}

export function createShopScreen(app) {
  const { C, state } = app;

  let groupName = null;      // super-group name, null = first
  let familyName = null;
  let subName = null;
  // The listing facets PLATFORM_TRUTH Part A names. Condition and listing type
  // are the two the platform leads with; duty and thread are the specification
  // filters a driller narrows on afterwards.
  let facetCondition = 'all';
  let facetType = 'all';
  let facetDuty = 'all';
  let facetThread = 'all';
  const clearFacets = () => { facetCondition = 'all'; facetType = 'all'; facetDuty = 'all'; facetThread = 'all'; };
  let query = '';
  let searchTimer = 0;
  const previews = [];       // { canvas, listing }

  const balanceEl = C.h('span.sstrip__v', {
    style: {
      color: 'var(--c-amber-hot)', 'font-size': '16px', 'font-weight': '850',
      'font-variant-numeric': 'tabular-nums', 'letter-spacing': '-0.01em', 'line-height': '1.1',
      'white-space': 'nowrap',
    },
    text: '€0',
  });
  const balanceRoll = C.NumberRoll(balanceEl, { value: 0, duration: 0.6, format: (v) => eur(v) });

  const searchInput = C.h('input', {
    type: 'search',
    class: 'shopsearch',
    'aria-label': 'Search listings',
    placeholder: 'Search name, thread or size',
    autocomplete: 'off',
    autocapitalize: 'none',
    spellcheck: 'false',
    /* NEEDS-CSS: `.shopsearch` — these inline styles cover the base look but
       cannot reach ::placeholder or :focus-visible. */
    style: {
      width: '100%', height: '44px', padding: '0 14px',
      'border-radius': 'var(--r-full)',
      background: 'rgb(var(--rgb-black) / .34)',
      border: '1px solid rgb(var(--rgb-border) / .9)',
      color: 'var(--c-fg)', 'font-size': '14px', 'font-weight': '600',
      'font-family': 'inherit', outline: 'none', '-webkit-appearance': 'none',
    },
    oninput: (e) => {
      query = String(e.target.value || '');
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => render(), 170);
    },
  });
  const searchWrap = C.h('div', { style: { padding: '0 var(--s-4) var(--s-3)' } }, searchInput);

  const groupStrip = C.Strip();
  const crumbs = C.h('div.crumbs', { 'aria-label': 'Category path' });
  const subStrip = C.Strip();
  const facetRow = C.h('div.cfilters');
  // Two scrolling, snapping strips rather than one row per facet: four stacked
  // rows would eat a quarter of the screen before a single listing appeared.
  const facetStripA = C.Strip();
  const facetStripB = C.Strip();
  facetRow.append(facetStripA, facetStripB);
  const body = C.h('div.scroll');

  const el = C.h('div',
    C.ScreenHeader({
      title: 'iMarket', sub: 'Drillity marketplace',
      onBack: () => {
        if (query) { query = ''; searchInput.value = ''; render(); }
        else if (subName) { subName = null; render(); }
        else if (familyName) { familyName = null; subName = null; render(); }
        else app.nav(SCENES.MENU);
      },
      right: C.h('div.shead__bal',
        C.h('span.sstrip__k', { text: 'Balance' }),
        balanceEl,
      ),
    }),
    groupStrip, crumbs, searchWrap, subStrip, facetRow, body,
  );

  /* ── Ownership ────────────────────────────────────────────────────────── */
  const owned = (id) => (state.garage?.owned || []).includes(id)
    || (state.unlocked?.rigs || []).includes(id);
  const equippedIn = (slot) => (slot === 'rig' ? state.garage?.rigId : state.garage?.loadout?.[slot]) || null;
  const isEquipped = (l) => equippedIn(l.slot) === l.itemId;
  const level = () => state.player?.level || 1;
  const isLocked = (l) => (l.unlockLevel || 1) > level();

  /** What this player pays, after markup, reputation and Toolsmith discounts. */
  function price(listing) {
    const live = app.ctx.progression?.priceFor?.(listing.itemId);
    const base = (live !== undefined && live !== null && Number.isFinite(live)) ? live : listing.basePrice;
    if (listing.condition === 'new') return Math.max(1, Math.round(base));
    return Math.max(1, Math.round(base * (listing.price / Math.max(1, listing.basePrice))));
  }

  /* ── Buy ──────────────────────────────────────────────────────────────── */
  function creditPurchase(listing, cost) {
    const prog = app.ctx.progression;
    if (typeof prog?.addMoney === 'function') {
      prog.addMoney(-cost, `Bought ${listing.name}`);
    } else if (state.player) {
      state.player.money = (state.player.money || 0) - cost;
      app.bus.emit(EVENTS.MONEY_CHANGE, { delta: -cost, balance: state.player.money, reason: listing.name });
    }
    if (listing.slot === 'rig') {
      if (typeof prog?.unlock === 'function') prog.unlock('rig', listing.itemId);
      else if (state.unlocked) {
        state.unlocked.rigs = state.unlocked.rigs || [];
        if (!state.unlocked.rigs.includes(listing.itemId)) state.unlocked.rigs.push(listing.itemId);
      }
    } else if (typeof prog?.unlock === 'function') {
      prog.unlock('tool', listing.itemId, false);
    }
    if (state.garage) {
      state.garage.owned = state.garage.owned || [];
      if (listing.slot !== 'rig' && !state.garage.owned.includes(listing.itemId)) state.garage.owned.push(listing.itemId);
      state.garage.condition = state.garage.condition || {};
      state.garage.condition[listing.itemId] = listing.startCondition;
    }
    app.bus.emit(EVENTS.PURCHASE, { itemId: listing.itemId, price: cost });
  }

  async function buy(listing) {
    const cost = price(listing);
    if (isLocked(listing)) {
      app.toast(`Unlocks at level ${listing.unlockLevel}`, 'warn'); app.haptic('fail'); return;
    }
    if (owned(listing.itemId) && !listing.consumable) {
      app.toast('Already in the yard', 'info'); return;
    }
    if (app.money() < cost) { app.toast('Not enough on the account', 'warn'); app.haptic('fail'); return; }

    const worn = listing.condition !== 'new';
    const ok = await app.confirm({
      title: worn ? `Buy ${listing.conditionName.toLowerCase()}` : 'Confirm purchase',
      message: worn
        ? `${listing.name}, ${listing.conditionName.toLowerCase()}, for ${eur(cost)}. `
          + `It arrives with ${Math.round(listing.startCondition * 100)}% of its life left. `
          + `Balance after: ${eur(app.money() - cost)}.`
        : `${listing.name} for ${eur(cost)}. Balance after: ${eur(app.money() - cost)}.`,
      confirmLabel: 'Buy',
    });
    if (!ok) return;

    const prog = app.ctx.progression;
    if (listing.condition === 'new') {
      // A new listing goes through progression so level gates, markup and the
      // unlock ledger all run. Anything else is priced by the seller, not the
      // list, so it is settled here.
      const fn = listing.slot === 'rig'
        ? (prog?.purchaseRig || (prog?.buyRig ? (id) => ({ ok: prog.buyRig(id) }) : null))
        : (prog?.purchase ? (id) => prog.purchase(id, 1) : null);
      if (fn) {
        let res;
        try { res = fn(listing.itemId); } catch (e) { console.warn('[shop] purchase failed', e); res = null; }
        if (res && res.ok === false) { app.toast(res.reason || 'Purchase refused', 'warn'); app.haptic('fail'); return; }
        if (!res) creditPurchase(listing, cost);
      } else {
        creditPurchase(listing, cost);
      }
    } else {
      creditPurchase(listing, cost);
    }

    app.haptic('success');
    app.toast(worn ? `${listing.name} delivered, ${Math.round(listing.startCondition * 100)}% life`
      : `${listing.name} delivered`, 'success');
    render();
  }

  function equip(listing) {
    const prog = app.ctx.progression;
    if (listing.slot === 'rig') {
      const res = prog?.selectRig?.(listing.itemId);
      if (res && res.ok === false) { app.toast(res.reason || 'Cannot select that rig', 'warn'); app.haptic('fail'); return; }
      if (!res && state.garage) {
        state.garage.rigId = listing.itemId;
        app.bus.emit(EVENTS.RIG_CHANGE, { rigId: listing.itemId, methodId: listing.methods?.[0] || null });
      }
    } else {
      const res = prog?.equip?.(listing.slot, listing.itemId);
      if (res && res.ok === false) { app.toast(res.reason || 'Will not fit', 'warn'); app.haptic('fail'); return; }
      if (!res && state.garage) {
        state.garage.loadout = state.garage.loadout || {};
        state.garage.loadout[listing.slot] = listing.itemId;
        app.bus.emit(EVENTS.EQUIP, { slot: listing.slot, itemId: listing.itemId });
      }
    }
    app.haptic('medium');
    app.toast(`${listing.name} fitted`, 'success');
    render();
  }

  /* ── Procedural preview — authored, never a broken image ──────────────── */
  const SHAPE = {
    bit: 'face', casing: 'face', rod: 'tube', shank: 'tube', coupling: 'tube',
    hammer: 'hammer', compressor: 'skid', power: 'skid', pump: 'pump',
    swivel: 'pump', head: 'skid', rig: 'rig', ppe: 'box', workshop: 'box', service: 'box',
  };

  function drawPlaceholder(canvas, listing) {
    if (!canvas || !canvas.isConnected) return;
    const dpr = app.viewport.dpr || 1;
    const w = canvas.clientWidth || 92, hh = canvas.clientHeight || 92;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(hh * dpr);
    const c = canvas.getContext('2d');
    if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, hh);

    const cs = getComputedStyle(el);
    const tk = (n, f) => (cs.getPropertyValue(n) || f).trim();
    const amber = tk('--rgb-amber', '223 181 82');
    const steel = tk('--rgb-steel', '63 146 166');
    const fg = tk('--rgb-fg', '250 250 250');
    const black = tk('--rgb-black', '0 0 0');
    const shape = SHAPE[listing.slot] || 'box';
    const accent = shape === 'face' ? amber : shape === 'tube' ? fg : steel;

    const cx = w / 2, cy = hh / 2;
    const grad = c.createLinearGradient(0, 0, 0, hh);
    grad.addColorStop(0, `rgb(${accent} / .18)`);
    grad.addColorStop(1, `rgb(${black} / .0)`);
    c.fillStyle = grad; c.fillRect(0, 0, w, hh);

    c.strokeStyle = `rgb(${accent} / .92)`;
    c.fillStyle = `rgb(${accent} / .22)`;
    c.lineWidth = 2.1; c.lineJoin = 'round'; c.lineCap = 'round';

    const R = Math.min(w, hh) * 0.30;
    switch (shape) {
      case 'face': {
        c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill(); c.stroke();
        c.beginPath(); c.arc(cx, cy, R * 0.34, 0, Math.PI * 2); c.stroke();
        const n = 6;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          c.beginPath(); c.arc(cx + Math.cos(a) * R * 0.68, cy + Math.sin(a) * R * 0.68, R * 0.13, 0, Math.PI * 2);
          c.fillStyle = `rgb(${accent} / .95)`; c.fill();
        }
        break;
      }
      case 'tube': {
        const bw = R * 0.72;
        c.beginPath(); c.rect(cx - bw, cy - R * 1.25, bw * 2, R * 2.5); c.fill(); c.stroke();
        for (let i = -3; i <= 3; i++) {
          c.beginPath(); c.moveTo(cx - bw, cy + i * (R * 0.34)); c.lineTo(cx + bw, cy + i * (R * 0.34) + 3); c.stroke();
        }
        break;
      }
      case 'hammer': {
        const bw = R * 0.66;
        c.beginPath(); c.rect(cx - bw, cy - R * 1.2, bw * 2, R * 2.1); c.fill(); c.stroke();
        c.beginPath(); c.rect(cx - bw * 0.45, cy + R * 0.9, bw * 0.9, R * 0.5); c.fill(); c.stroke();
        for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(cx, cy - R * 0.5 + i * R * 0.5, 2.6, 0, Math.PI * 2); c.fill(); }
        break;
      }
      case 'skid': {
        c.beginPath(); c.rect(cx - R * 1.15, cy - R * 0.7, R * 2.3, R * 1.5); c.fill(); c.stroke();
        for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(cx - R * 0.9 + i * R * 0.42, cy - R * 0.45); c.lineTo(cx - R * 0.9 + i * R * 0.42, cy + R * 0.55); c.stroke(); }
        c.beginPath(); c.arc(cx + R * 0.75, cy + R * 0.95, R * 0.28, 0, Math.PI * 2); c.stroke();
        break;
      }
      case 'pump': {
        c.beginPath(); c.rect(cx - R * 1.1, cy - R * 0.55, R * 1.5, R * 1.2); c.fill(); c.stroke();
        c.beginPath(); c.arc(cx + R * 0.65, cy, R * 0.6, 0, Math.PI * 2); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(cx - R * 1.1, cy + R * 0.9); c.lineTo(cx + R * 1.2, cy + R * 0.9); c.stroke();
        break;
      }
      case 'rig': {
        c.beginPath(); c.moveTo(cx, cy - R * 1.35); c.lineTo(cx + R * 0.75, cy + R * 0.9); c.lineTo(cx - R * 0.75, cy + R * 0.9); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(cx - R * 1.2, cy + R * 1.15); c.lineTo(cx + R * 1.2, cy + R * 1.15); c.stroke();
        c.beginPath(); c.moveTo(cx - R * 0.45, cy + R * 0.1); c.lineTo(cx + R * 0.45, cy + R * 0.1); c.stroke();
        break;
      }
      default: {
        c.beginPath(); c.rect(cx - R, cy - R * 0.8, R * 2, R * 1.6); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(cx - R, cy - R * 0.2); c.lineTo(cx + R, cy - R * 0.2); c.stroke();
      }
    }

    // Tier pips — a shape cue, so tier reads without relying on colour.
    const tier = listing.tier === 'prem' ? 3 : listing.tier === 'econ' ? 1 : 2;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.rect(6 + i * 7, hh - 10, 4, 4);
      c.fillStyle = i < tier ? `rgb(${amber} / .95)` : `rgb(${fg} / .18)`;
      c.fill();
    }
    // Second-hand listings read as second-hand even in the fallback art.
    if (listing.condition !== 'new') {
      c.fillStyle = `rgb(${black} / ${(1 - listing.startCondition) * 0.34})`;
      c.fillRect(0, 0, w, hh);
    }
  }

  /**
   * The 3D card render. `previewRefFor` decides which builder the listing
   * resolves to (catalog.js owns that table); components.paintPreview owns the
   * fit, so a wide card never crops the machine and the render never lands on
   * an unlit black rectangle.
   */
  function mountCardPreview(canvas, listing) {
    C.mountPreview({
      preview: app.ctx.shopPreview || app.ctx.preview,
      canvas,
      ref: previewRefFor(listing),
      wear: 1 - (listing.startCondition ?? 1),
      dpr: app.viewport.dpr,
      zoom: 1.18,
      fallback: () => drawPlaceholder(canvas, listing),
    });
  }

  /* ── Delta vs fitted ──────────────────────────────────────────────────── */
  function statRows(listing) {
    const out = [];
    for (const m of STAT_META) {
      const v = listing.stats?.[m.key];
      if (v === undefined || v === null) continue;
      if (m.skipZero && !v) continue;
      out.push([m.label, m.fmt(v)]);
    }
    return out;
  }

  function deltaChips(listing) {
    const wrap = C.h('div.delta');
    if (listing.condition !== 'new') {
      wrap.appendChild(C.h('span.dchip.dchip--down',
        C.Icon('minus', 11),
        C.h('span', { text: 'Life left' }),
        C.h('b', { text: `${Math.round(listing.startCondition * 100)}%` }),
      ));
    }
    const curId = equippedIn(listing.slot);
    const cur = curId && curId !== listing.itemId ? app.itemById(curId) : null;
    if (!cur) {
      for (const [label, value] of statRows(listing)) {
        wrap.appendChild(C.h('span.dchip', C.h('span', { text: label }), C.h('b', { text: value })));
      }
      return wrap;
    }
    let any = false;
    for (const m of STAT_META) {
      const a = listing.stats?.[m.key], b = cur.stats?.[m.key];
      if (a === undefined || b === undefined || a === null || b === null) continue;
      const d = a - b;
      if (Math.abs(d) < 1e-6) continue;
      const up = m.better > 0 ? d > 0 : d < 0;
      any = true;
      wrap.appendChild(C.h(`span.dchip.dchip--${up ? 'up' : 'down'}`,
        C.Icon(d > 0 ? 'plus' : 'minus', 11),
        C.h('span', { text: m.label }),
        C.h('b', { text: m.fmt(Math.abs(d)) }),
      ));
    }
    if (!any) wrap.appendChild(C.h('span.dchip', { text: 'Same performance as fitted' }));
    return wrap;
  }

  /* ── Listing card ─────────────────────────────────────────────────────── */
  function conditionPill(listing) {
    if (listing.condition === 'new') return C.Pill('New', 'steel');
    if (listing.condition === 'refurb') return C.Pill('Refurbished', 'success');
    if (listing.condition === 'parts') return C.Pill('For parts', 'danger', 'alert');
    return C.Pill('Used', 'warning');
  }

  function itemCard(listing) {
    const canvas = C.h('canvas');
    const prev = C.h('div.icard__prev', canvas, C.h('i.icard__prevfx'));
    previews.push({ canvas, listing });

    const has = owned(listing.itemId);
    const fitted = isEquipped(listing);
    const locked = isLocked(listing);
    const cost = price(listing);
    const poor = app.money() < cost;

    // Buy → Fit → Restock. A consumable you already own must still be
    // re-orderable: fresh carbide is the money sink the game runs on.
    const actions = C.h('div', { style: { display: 'flex', gap: '8px' } });
    if (locked && !has) {
      actions.appendChild(C.Button({ label: `Level ${listing.unlockLevel}`, kind: 'quiet', size: 'sm', icon: 'lock', disabled: true }));
    } else if (!has) {
      actions.appendChild(C.Button({ label: 'Buy', kind: poor ? 'quiet' : 'amber', size: 'sm', icon: 'cart', onTap: () => buy(listing) }));
    } else if (!fitted) {
      actions.appendChild(C.Button({ label: 'Fit', kind: 'steel', size: 'sm', icon: 'wrench', onTap: () => equip(listing) }));
    } else if (listing.consumable) {
      actions.appendChild(C.Button({ label: 'Restock', kind: poor ? 'quiet' : 'amber', size: 'sm', icon: 'cart', onTap: () => buy(listing) }));
    } else {
      actions.appendChild(C.Button({ label: 'Fitted', kind: 'success', size: 'sm', icon: 'check', disabled: true }));
    }
    actions.appendChild(C.Button({ label: 'Specs', kind: 'quiet', size: 'sm', onTap: () => openDetail(listing) }));

    const card = C.Card({ class: 'icard' },
      C.h('div.icard__top',
        prev,
        C.h('div.icard__b',
          C.h('h3.icard__name', { text: listing.name }),
          C.h('p.icard__blurb', { text: listing.description }),
          // A wrapping micro-chip row: `.ccard__tags` is nowrap + overflow
          // hidden, which silently clips the fourth pill.
          C.h('div', { style: { display: 'flex', 'flex-wrap': 'wrap', gap: '4px' } },
            conditionPill(listing),
            listing.thread ? C.Pill(listing.thread, 'neutral') : null,
            String(listing.duty).toUpperCase() === 'HD' ? C.Pill('HD', 'amber') : null,
            has ? C.Pill('Owned', 'success', 'check') : null,
          ),
        ),
      ),
      deltaChips(listing),
      C.h('div.icard__foot',
        C.h('span.icard__price' + (poor && !has ? '.is-poor' : ''), {
          text: has && !listing.consumable ? 'In inventory' : eur(cost),
        }),
        actions,
      ),
    );
    card.classList.add('icard');
    if (fitted) card.classList.add('is-equipped');
    if (locked) card.classList.add('is-locked');
    return card;
  }

  function openDetail(listing) {
    const canvas = C.h('canvas', { style: { width: '100%', height: '100%' } });
    // A SQUARE well. The live turntable renders square and blits cover-fit, so
    // a wide well would crop the tool's ends off — which on a 3 m rod or a
    // Kelly auger is the whole product.
    const prev = C.h('div.icard__prev', {
      style: { width: 'min(220px, 76%)', height: '220px', margin: '0 auto' },
    }, canvas, C.h('i.icard__prevfx'));

    // The specs a driller actually buys on, in the order they check them.
    const specRows = C.h('dl.specs');
    const row = (k, v) => { if (v !== null && v !== undefined && v !== '') specRows.appendChild(C.SpecRow(k, v)); };
    row('Subcategory', listing.sub);
    row('Listing type', listingTypeName(listing.listingType));
    row('Condition', listing.conditionName);
    if (listing.condition !== 'new') row('Life remaining', `${Math.round(listing.startCondition * 100)}%`);
    row('Thread / connection', listing.thread || '—');
    row('Material', listing.material || '—');
    row('Duty', dutyName(listing.duty));
    row('Grade', tierLabel(listing.tier));
    if (listing.stats?.life) row('Life', `${Math.round(listing.stats.life).toLocaleString('en-US')} m`);
    if (listing.stats?.maxUCS) row('Max UCS', `${Math.round(listing.stats.maxUCS)} MPa`);
    row('Bay', slotInfo(listing.slot).name);
    if (listing.methods?.length) {
      const names = listing.methods.map((m) => methodInfo(m)?.name).filter(Boolean).join(', ');
      if (names) row('Drilling methods', names);
    }
    row('Unlocks at', `Level ${listing.unlockLevel}`);
    row('List price', eur(listing.basePrice));
    for (const [label, value] of statRows(listing)) row(label, value);

    const bodyEl = C.h('div', { style: { display: 'flex', 'flex-direction': 'column', gap: '16px' } },
      prev,
      C.h('p.icard__blurb', { text: listing.description }),
      listing.condition !== 'new'
        ? C.h('div.ccard__lock', C.Icon('alert', 14), C.h('span', { text: listing.conditionNote }))
        : null,
      C.h('div', C.SectionTitle('Versus fitted'), deltaChips(listing)),
      C.h('div', C.SectionTitle('Specification'), specRows),
    );

    const has = owned(listing.itemId);
    const sp = app.ctx.shopPreview || app.ctx.preview;
    const sh = app.sheet({
      title: listing.name, sub: `${listing.conditionName} · ${eur(price(listing))}`,
      body: bodyEl,
      onClose: () => { try { sp?.clearLive?.(); } catch (_) { /* preview already gone */ } },
      actions: [
        C.Button({ label: 'Close', kind: 'quiet', onTap: () => sh.close() }),
        has && isEquipped(listing) && listing.consumable
          ? C.Button({ label: 'Restock', kind: 'amber', icon: 'cart', onTap: () => { sh.close(); buy(listing); } })
          : has
            ? C.Button({
              label: isEquipped(listing) ? 'Fitted' : 'Fit',
              kind: isEquipped(listing) ? 'success' : 'steel',
              disabled: isEquipped(listing),
              onTap: () => { sh.close(); equip(listing); },
            })
            : C.Button({
              label: isLocked(listing) ? `Level ${listing.unlockLevel}` : 'Buy',
              kind: isLocked(listing) ? 'quiet' : 'amber',
              disabled: isLocked(listing),
              onTap: () => { sh.close(); buy(listing); },
            }),
      ],
    });
    requestAnimationFrame(() => {
      const wear = 1 - (listing.startCondition ?? 1);
      if (sp && typeof sp.setLive === 'function' && sp.ready) {
        try { sp.setLive(previewRefFor(listing), canvas, { wear }); return; } catch (_) { /* fall through */ }
      }
      mountCardPreview(canvas, listing);
    });
  }

  /* ── Facets ───────────────────────────────────────────────────────────── */
  /** Listings for the current browse position, before facets are applied. */
  function poolFor() {
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return shopListings().filter((l) =>
        l.name.toLowerCase().includes(q)
        || l.sub.toLowerCase().includes(q)
        || l.family.toLowerCase().includes(q)
        || (l.thread && l.thread.toLowerCase().includes(q))
        || (l.material && l.material.toLowerCase().includes(q)));
    }
    if (!familyName) return [];
    if (subName) return listingsInSub(subName);
    return shopListings().filter((l) => l.group === groupName && l.family === familyName);
  }

  /**
   * One facet applied, with the option to ignore a single dimension — a facet's
   * own counts are taken over the pool narrowed by every OTHER facet, so the
   * numbers on the chips are the numbers you get if you tap them.
   */
  const passExcept = (l, skip) =>
    (skip === 'cond' || facetCondition === 'all' || l.condition === facetCondition)
    && (skip === 'type' || facetType === 'all' || l.listingType === facetType)
    && (skip === 'duty' || facetDuty === 'all' || l.dutyId === facetDuty)
    && (skip === 'thread' || facetThread === 'all' || l.thread === facetThread);

  const passFacets = (l) => passExcept(l, null);

  /** A leading uppercase label so one strip can carry two facet dimensions. */
  function facetLabel(text) {
    /* NEEDS-CSS: `.cfilters .facetlab` — reuses `.crumb` for the micro-label
       type ramp; the alignment below is the only thing it adds. */
    return C.h('span.crumb.facetlab', {
      style: { 'align-self': 'center', flex: 'none', 'padding-right': '2px' },
      text,
    });
  }

  /**
   * @param {HTMLElement} strip
   * @param {string} label     dimension name, e.g. "Listing type"
   * @param {string} anyLabel  the clear-this-dimension chip
   * @param {{id:string,name:string,count:number}[]} opts
   * @param {string} active
   * @param {(id:string)=>void} pick
   */
  function facetGroup(strip, label, anyLabel, opts, active, pick) {
    if (!opts.length) return;
    // A facet you have set must always be visible, or it cannot be cleared.
    if (active !== 'all' && !opts.some((o) => o.id === active)) {
      opts = opts.concat([{ id: active, name: active, count: 0 }]);
    }
    if (opts.length < 2 && active === 'all') {
      // One value is not a filter — but the count still tells you what the
      // aisle holds, so it is shown as a plain, already-true statement.
      strip.appendChild(facetLabel(label));
      strip.appendChild(C.Chip({ label: opts[0].name, count: opts[0].count }));
      return;
    }
    strip.appendChild(facetLabel(label));
    strip.appendChild(C.Chip({
      label: anyLabel, active: active === 'all',
      count: opts.reduce((n, o) => n + o.count, 0),
      onTap: () => pick('all'),
    }));
    for (const o of opts) {
      strip.appendChild(C.Chip({
        label: o.name, count: o.count, active: active === o.id,
        onTap: () => pick(active === o.id ? 'all' : o.id),
      }));
    }
  }

  function renderFacets(pool) {
    C.clear(facetStripA);
    C.clear(facetStripB);
    if (!pool.length) { facetRow.hidden = true; return; }
    facetRow.hidden = false;

    /** Counts for one dimension, over the pool narrowed by the other facets. */
    const countsFor = (skip, key) => {
      const m = new Map();
      for (const l of pool) {
        if (!passExcept(l, skip)) continue;
        const v = l[key];
        if (v) m.set(v, (m.get(v) || 0) + 1);
      }
      return m;
    };
    const optsFrom = (table, counts) => table
      .filter((t) => counts.get(t.id))
      .map((t) => ({ id: t.id, name: t.name, count: counts.get(t.id) }));

    facetGroup(facetStripA, 'Condition', 'Any condition',
      optsFrom(CONDITIONS, countsFor('cond', 'condition')), facetCondition,
      (v) => { facetCondition = v; render(); });

    facetGroup(facetStripA, 'Listing type', 'Any type',
      optsFrom(LISTING_TYPES, countsFor('type', 'listingType')), facetType,
      (v) => { facetType = v; render(); });

    facetGroup(facetStripB, 'Duty', 'Any duty',
      optsFrom(DUTIES, countsFor('duty', 'dutyId')), facetDuty,
      (v) => { facetDuty = v; render(); });

    // A single thread is not a filter — but a thread already picked must stay
    // on screen, or there is no way to take it off again.
    const threadCounts = countsFor('thread', 'thread');
    if (threadCounts.size > 1 || facetThread !== 'all') {
      const threads = [...threadCounts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 16)
        .map(([id, count]) => ({ id, name: id, count }));
      facetGroup(facetStripB, 'Thread', 'Any thread', threads, facetThread,
        (v) => { facetThread = v; render(); });
    }
    facetStripB.hidden = !facetStripB.childElementCount;
  }

  /* ── Front page: stock that fits the rig in the yard ──────────────────────
     A four-row family list ended two fifths of the way up the screen, and with
     29 of the 103 subcategories holding a single listing, reaching a product
     cost three taps. This strip puts real listings — and their 3D — on the
     front page.

     "Fits your rig" is a claim, so it is made honestly: a listing only appears
     here if its drilling methods intersect the methods of the rig currently in
     the yard. With no rig selected the strip drops the claim and offers what
     the player's level has actually unlocked.                                */

  /** The rig the player is running, if the garage knows of one. */
  function currentRig() {
    const id = state.garage?.rigId;
    if (!id) return null;
    try { return rigInfo(id) || null; } catch (_) { return null; }
  }

  function frontListings(limit = 6) {
    let all;
    try { all = shopListings(); } catch (_) { return { rig: null, list: [] }; }
    const rig = currentRig();
    const methods = new Set((rig && rig.methods) || []);
    const lvl = level();
    const budget = app.money();
    const scored = [];

    for (const l of all) {
      if (l.slot === 'rig') continue;                       // machines have their own aisle
      if (l.listingType === 'service') continue;            // a shelf of stock, not of crews
      if (l.condition !== 'new') continue;                  // a shop window, not the bargain bin
      if ((l.unlockLevel || 1) > lvl) continue;
      if (owned(l.itemId) && !l.consumable) continue;
      const fits = methods.size ? (l.methods || []).some((m) => methods.has(m)) : true;
      if (!fits) continue;
      let s = 0;
      if (!equippedIn(l.slot)) s += 60;                     // an empty bay first
      if (price(l) <= budget) s += 40;                      // then what is actually affordable
      // The shelf is the shop window, so stock with a real 3D model outranks
      // stock that can only be drawn as a pallet of supplies.
      if (previewRefFor(l).supply !== true) s += 30;
      s += Math.min(24, l.unlockLevel || 1);                // then the newest thing they can run
      if (l.tier === 'prem') s += 6;
      scored.push([s, l]);
    }
    scored.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name));

    // Never six button bits: at most two listings out of any one bay.
    const perSlot = new Map();
    const list = [];
    for (const [, l] of scored) {
      const n = perSlot.get(l.slot) || 0;
      if (n >= 2) continue;
      perSlot.set(l.slot, n + 1);
      list.push(l);
      if (list.length >= limit) break;
    }
    return { rig: methods.size ? rig : null, list };
  }

  /** A compact listing card for the front strip: 3D, name, subcategory, price. */
  function frontCard(listing) {
    const canvas = C.h('canvas', { style: { width: '100%', height: '100%', display: 'block' } });
    previews.push({ canvas, listing });
    /* NEEDS-CSS: `.mktcard` / `.mktcard__art` — a 168px strip card with a 124px
       preview well. Styled inline from tokens meanwhile; nothing here invents a
       colour or a size step. */
    const art = C.h('div.icard__prev.mktcard__art', {
      style: { width: '100%', height: '124px', 'border-radius': 'var(--r-sm)' },
    }, canvas, C.h('i.icard__prevfx'));

    const cost = price(listing);
    const card = C.Card({ class: 'mktcard', onTap: () => openDetail(listing) },
      art,
      C.h('p.famcard__s', {
        style: {
          'text-transform': 'uppercase', 'letter-spacing': 'var(--tr-label)',
          'font-weight': '800', 'white-space': 'nowrap', overflow: 'hidden',
          'text-overflow': 'ellipsis',
        },
        text: listing.sub,
      }),
      C.h('p.slotcard__v', { style: { 'white-space': 'normal' }, text: listing.name }),
      C.h('div', {
        style: { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', gap: 'var(--s-2)' },
      },
        C.h('span.icard__price', { style: { 'font-size': 'var(--t-md)' }, text: eur(cost) }),
        String(listing.duty).toUpperCase() === 'HD' ? C.Pill('HD', 'amber') : null,
      ),
    );
    card.classList.add('mktcard');
    card.style.setProperty('width', '168px');
    card.style.setProperty('padding', 'var(--s-3)');
    card.style.setProperty('display', 'flex');
    card.style.setProperty('flex-direction', 'column');
    card.style.setProperty('gap', 'var(--s-2)');
    return card;
  }

  function appendFrontStrip() {
    const { rig, list } = frontListings(6);
    if (list.length < 2) return;              // a strip of one is not a strip
    body.appendChild(C.SectionTitle(
      rig ? 'Fits your rig' : 'Ready for your level',
      C.h('span.label', { text: rig ? rig.name : `Level ${level()}` }),
    ));
    const strip = C.Strip();
    for (const l of list) strip.appendChild(frontCard(l));
    body.appendChild(strip);
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  function render() {
    previews.length = 0;
    balanceRoll.to(app.money());

    const tree = shopTree();
    if (!tree.length) {
      C.clear(body);
      body.appendChild(C.Empty('Content unavailable', 'The equipment catalogue could not be loaded.'));
      return;
    }
    if (!groupName || !tree.some((g) => g.name === groupName)) groupName = tree[0].name;
    const group = tree.find((g) => g.name === groupName) || tree[0];
    const family = familyName ? group.families.find((f) => f.name === familyName) : null;
    if (familyName && !family) { familyName = null; subName = null; }

    // Super-groups — full taxonomy names, never invented abbreviations.
    C.clear(groupStrip);
    for (const g of tree) {
      groupStrip.appendChild(C.Chip({
        label: g.name, count: g.count, active: g.name === groupName && !query,
        onTap: () => {
          groupName = g.name; familyName = null; subName = null;
          clearFacets();
          query = ''; searchInput.value = '';
          render();
        },
      }));
    }

    // Breadcrumb path.
    C.clear(crumbs);
    if (query.trim()) {
      crumbs.appendChild(C.h('span.crumb', { text: 'Search' }));
      crumbs.appendChild(C.h('span.crumb__sep', { text: '›' }));
      crumbs.appendChild(C.h('span.crumb', { text: `“${query.trim()}”` }));
    } else {
      const gc = C.h('span.crumb' + (family ? '.is-link' : ''), { text: `${group.code} · ${group.name}` });
      if (family) { gc.setAttribute('role', 'button'); gc.setAttribute('tabindex', '0'); C.tap(gc, () => { familyName = null; subName = null; render(); }); }
      crumbs.appendChild(gc);
      if (family) {
        crumbs.appendChild(C.h('span.crumb__sep', { text: '›' }));
        const fc = C.h('span.crumb' + (subName ? '.is-link' : ''), { text: family.name });
        if (subName) { fc.setAttribute('role', 'button'); fc.setAttribute('tabindex', '0'); C.tap(fc, () => { subName = null; render(); }); }
        crumbs.appendChild(fc);
      }
      if (subName) {
        crumbs.appendChild(C.h('span.crumb__sep', { text: '›' }));
        crumbs.appendChild(C.h('span.crumb', { text: subName }));
      }
    }

    // Subcategory chips.
    C.clear(subStrip);
    if (family && !query.trim()) {
      subStrip.hidden = false;
      subStrip.appendChild(C.Chip({
        label: 'All', count: family.count, active: !subName,
        onTap: () => { subName = null; render(); },
      }));
      for (const sub of family.subs) {
        subStrip.appendChild(C.Chip({
          label: sub.name, count: sub.count, active: subName === sub.name,
          onTap: () => { subName = sub.name; render(); },
        }));
      }
    } else {
      subStrip.hidden = true;
    }

    const pool = poolFor();
    renderFacets(pool);

    C.clear(body);
    body.scrollTop = 0;

    if (query.trim()) {
      const hits = pool.filter(passFacets);
      body.appendChild(C.SectionTitle('Search results', C.h('span.label', { text: `${hits.length}` })));
      if (!hits.length) {
        body.appendChild(C.Empty('Nothing matches that', 'Try a thread (T45), a size (115 mm) or a family name.'));
      } else {
        for (const l of hits.slice(0, 40)) body.appendChild(itemCard(l));
        if (hits.length > 40) {
          body.appendChild(C.h('p.icard__blurb', {
            style: { padding: '0 var(--s-4) var(--s-4)', 'text-align': 'center' },
            text: `${hits.length - 40} more listings match — narrow the search or use a facet.`,
          }));
        }
      }
    } else if (!family) {
      const grid = C.h('div.famgrid.stagger');
      for (const f of group.families) {
        const card = C.Card({ class: 'famcard', onTap: () => { familyName = f.name; subName = null; clearFacets(); render(); } },
          C.h('span.famcard__ico', C.Icon(iconForFamily(f.name), 20)),
          C.h('div.famcard__b',
            C.h('p.famcard__t', { text: f.name }),
            C.h('p.famcard__s', {
              text: `${f.subs.length} subcategor${f.subs.length === 1 ? 'y' : 'ies'} · ${f.count} listing${f.count === 1 ? '' : 's'}`,
            }),
          ),
          C.h('span.row__chev', C.Icon('chevron', 16)),
        );
        card.classList.add('famcard');
        grid.appendChild(card);
      }
      C.stagger(grid.children);
      body.appendChild(grid);
      appendFrontStrip();
    } else {
      const shown = pool.filter(passFacets);
      const bySub = new Map();
      for (const l of shown) {
        if (!bySub.has(l.sub)) bySub.set(l.sub, []);
        bySub.get(l.sub).push(l);
      }
      if (!bySub.size) {
        body.appendChild(C.Empty('Nothing listed on that filter', 'Clear a facet, or check back when you unlock more methods.'));
      }
      const order = family.subs.map((s) => s.name).filter((n) => bySub.has(n));
      for (const sub of order) {
        const items = bySub.get(sub);
        body.appendChild(C.SectionTitle(sub, C.h('span.label', { text: `${items.length}` })));
        for (const l of items) body.appendChild(itemCard(l));
      }
    }

    requestAnimationFrame(() => { for (const p of previews) mountCardPreview(p.canvas, p.listing); });
  }

  return {
    el,
    mount() {
      balanceRoll.setInstant(true); balanceRoll.to(app.money()); balanceRoll.setInstant(false);
      render();
      // The leaf → builder table only hands out ids rig/tools.js really has, so
      // on the very first mount it may still be reading the registry. Repaint
      // once when the answer lands; it resolves immediately after that.
      primeBuilderIds().then((firstRead) => {
        if (firstRead && el.isConnected) for (const p of previews) mountCardPreview(p.canvas, p.listing);
      }).catch(() => {});
    },
    update(dt) { balanceRoll.step(dt); },
    resize() { for (const p of previews) mountCardPreview(p.canvas, p.listing); },
    onMoney() { balanceRoll.to(app.money()); },
    onPurchase() { render(); },
    onEquip() { render(); },
    unmount() {
      clearTimeout(searchTimer);
      try { (app.ctx.shopPreview || app.ctx.preview)?.clearLive?.(); } catch (_) { /* already gone */ }
    },
  };
}
