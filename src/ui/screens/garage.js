/**
 * GARAGE — rig selection and loadout slots. Tap to equip; nothing is dragged.
 *
 * Two things this screen owes the player:
 *   1. A real look at the machine. The rig art is a live render from
 *      rig/rigFactory.js by way of ctx.shopPreview, with an authored
 *      procedural silhouette as the fallback — never a line icon in a box.
 *   2. An honest string check. Bit connection, rod connection and whether
 *      they mate. Percussion thread families (R25–R51 / T38–T127 / H-series)
 *      do not interchange (DOMAIN §4), and saying so before the player
 *      mobilises is the whole point of the panel.
 */
import { EVENTS, SCENES, clamp } from '../../core/contract.js';
import { allSlots, allRigs, allItems, methodInfo, rigInfo, catLeaf } from './catalog.js';

/* ── Connections ──────────────────────────────────────────────────────────
   game/data.js carries the connection as a top-level `thread` string, which
   may name two ends ("R32 box / T45 pin", "T45 / casing conical"). Parse out
   the designations rather than string-comparing the whole label.          */
const CONN_RE = new RegExp([
  'R\\d{2,3}', 'T\\d{2,3}', 'GT\\d{2,3}', 'H\\d{2,3}',
  'QL\\d{2,3}', 'DHD\\d{3}', 'COP\\s?\\d+', 'SD\\d+',
  'API\\s+(?:REG|IF|FH|NC)\\s*\\d+(?:\\s+\\d+\\/\\d+)?',
  '[ABNHP]Q', '[ABNHP]WL',
  'SW\\s+hex\\s+\\d+\\s*mm', 'Kelly-box\\s+\\d+\\s*mm', 'GEWI\\s+threadbar\\s+\\d+\\s*mm',
].join('|'), 'gi');

/** Comparison key for a connection designation; display keeps the original. */
const connKey = (c) => String(c).toUpperCase().replace(/\s+/g, ' ').trim();

function connections(raw) {
  const s = String(raw || '').trim();
  if (!s || s.toLowerCase() === 'n/a') return [];
  const out = [];
  const seen = new Set();
  let m;
  CONN_RE.lastIndex = 0;
  while ((m = CONN_RE.exec(s)) !== null) {
    const v = m[0].replace(/\s+/g, ' ').trim();
    const k = connKey(v);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}
/**
 * Which connection SYSTEM a designation belongs to. Two connections only
 * "should" mate when they are in the same system — an auger flight's hex drive
 * and a threaded percussion rod are different interfaces, not a mismatch.
 */
function systemOf(raw) {
  const c = connKey(raw);
  if (/^(?:R|T|GT|H)\d/.test(c)) return 'percussion';
  if (/^(?:QL|DHD|COP|SD)\d/.test(c)) return 'dth-shank';
  if (/^API/.test(c)) return 'api';
  if (/^[ABNHP](?:Q|WL)$/.test(c)) return 'wireline';
  if (/^SW HEX/.test(c)) return 'hex-drive';
  if (/^KELLY-BOX/.test(c)) return 'kelly';
  if (/^GEWI/.test(c)) return 'threadbar';
  return 'other';
}
const isPercussion = (c) => systemOf(c) === 'percussion';
const isCasingJoint = (raw) => /casing|cone-ring|leffer|conical|cylindrical|trapezoid/i.test(String(raw || ''));

/** The connection a listing presents, whatever shape the item came in. */
const threadOf = (item) => item?.thread ?? item?.specs?.Thread ?? item?.specs?.Shank ?? item?.specs?.Casing ?? null;
const dutyOf = (item) => {
  const d = item?.duty ?? item?.specs?.Duty ?? 'standard';
  return String(d).toUpperCase() === 'HD' || /heavy/i.test(String(d)) ? 'Heavy-duty (HD)' : 'Standard';
};

export function createGarageScreen(app) {
  const { C, state, fmtMoney } = app;

  const rigStrip = C.Strip();
  const body = C.h('div.scroll');
  const previews = [];   // { canvas, rig }

  const el = C.h('div',
    C.ScreenHeader({ title: 'Garage', sub: 'Rig & loadout', onBack: () => app.nav(SCENES.MENU), right: C.h('span.shead__spacer') }),
    body,
  );

  const ownedRig = (id) => (state.unlocked?.rigs || []).includes(id) || state.garage?.rigId === id;
  const ownedItem = (id) => (state.garage?.owned || []).includes(id);
  const condition = (id) => clamp(state.garage?.condition?.[id] ?? 1, 0, 1);

  /* ── Rig art ──────────────────────────────────────────────────────────── */
  /** Authored silhouette: tracks, carrier, mast and feed beam. Not an icon. */
  function drawRig(canvas, rig) {
    if (!canvas || !canvas.isConnected) return;
    const dpr = app.viewport.dpr || 1;
    const w = canvas.clientWidth || 212, hh = canvas.clientHeight || 92;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(hh * dpr);
    const c = canvas.getContext('2d');
    if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, hh);

    const cs = getComputedStyle(el);
    const tk = (n, f) => (cs.getPropertyValue(n) || f).trim();
    const amber = tk('--rgb-amber', '223 181 82');
    const steel = tk('--rgb-steel', '63 146 166');
    const black = tk('--rgb-black', '0 0 0');

    // Ground haze so the machine sits on something.
    const g = c.createLinearGradient(0, hh * 0.45, 0, hh);
    g.addColorStop(0, `rgb(${steel} / .05)`);
    g.addColorStop(1, `rgb(${black} / .35)`);
    c.fillStyle = g; c.fillRect(0, 0, w, hh);

    const base = hh * 0.86;
    const s = Math.min(w / 212, hh / 92);
    const cx = w * 0.5;
    const mastH = clamp((rig.mast || 6) / 24, 0.28, 1) * hh * 0.72;

    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = `rgb(${amber} / .9)`;
    c.fillStyle = `rgb(${amber} / .16)`;
    c.lineWidth = 2 * s;

    // Tracks.
    const tw = 84 * s, th = 15 * s;
    c.beginPath();
    c.moveTo(cx - tw / 2 + th * 0.5, base);
    c.lineTo(cx + tw / 2 - th * 0.5, base);
    c.arc(cx + tw / 2 - th * 0.5, base - th / 2, th / 2, Math.PI / 2, -Math.PI / 2);
    c.lineTo(cx - tw / 2 + th * 0.5, base - th);
    c.arc(cx - tw / 2 + th * 0.5, base - th / 2, th / 2, -Math.PI / 2, Math.PI / 2);
    c.closePath(); c.fill(); c.stroke();
    for (let i = 0; i < 6; i++) {
      const x = cx - tw / 2 + th * 0.7 + i * ((tw - th * 1.4) / 5);
      c.beginPath(); c.moveTo(x, base - th + 2 * s); c.lineTo(x, base - 2 * s); c.stroke();
    }

    // Carrier body.
    const bw = 58 * s, bh = 24 * s, by = base - th - bh;
    c.beginPath(); c.rect(cx - bw * 0.62, by, bw, bh); c.fill(); c.stroke();
    c.beginPath(); c.rect(cx - bw * 0.62 + 6 * s, by + 5 * s, 16 * s, 10 * s); c.stroke();   // cab glass

    // Mast + feed beam, leaning slightly for a bit of attitude.
    const mx = cx + bw * 0.42;
    c.strokeStyle = `rgb(${amber} / 1)`;
    c.lineWidth = 3 * s;
    c.beginPath(); c.moveTo(mx, by + 2 * s); c.lineTo(mx + 7 * s, by - mastH); c.stroke();
    c.lineWidth = 1.5 * s;
    c.strokeStyle = `rgb(${amber} / .55)`;
    c.beginPath(); c.moveTo(mx - 5 * s, by + 2 * s); c.lineTo(mx + 3 * s, by - mastH); c.stroke();
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      c.beginPath();
      c.moveTo(mx - 5 * s + t * 8 * s, by + 2 * s - t * (mastH + 2 * s));
      c.lineTo(mx + t * 7 * s, by + 2 * s - t * (mastH + 2 * s));
      c.stroke();
    }
    // Rod in the hole.
    c.strokeStyle = `rgb(${steel} / .8)`;
    c.lineWidth = 2 * s;
    c.beginPath(); c.moveTo(mx + 3 * s, base - 1); c.lineTo(mx + 3 * s, base + hh * 0.1); c.stroke();
  }

  /**
   * The card render.
   *
   * core/preview.js hands back a SQUARE thumbnail. Cover-fitting that into the
   * card's letterbox threw away the top and bottom of the frame — the mast and
   * the tracks, which are the only things that tell a 4.5 t geotechnical
   * crawler from a 118 t Kelly rig at card size. components.paintPreview
   * contain-fits it instead and gives the render a lit floor, so nothing is
   * cropped and nothing sits on a black rectangle.
   */
  function mountRigArt(canvas, rig) {
    C.mountPreview({
      preview: app.ctx.shopPreview || app.ctx.preview,
      canvas,
      ref: rig.id,
      wear: 1 - condition(rig.id),
      dpr: app.viewport.dpr,
      zoom: 1.12,
      ax: 0.3, ay: 0.2,
      fallback: () => drawRig(canvas, rig),
    });
  }

  /* ── Rigs ─────────────────────────────────────────────────────────────── */
  function selectRig(rig) {
    if (!ownedRig(rig.id)) {
      app.toast(`${rig.name} is not in the yard yet — buy it in iMarket`, 'warn');
      app.haptic('fail');
      return;
    }
    const res = app.ctx.progression?.selectRig?.(rig.id);
    if (res && res.ok === false) { app.toast(res.reason || 'Cannot select that rig', 'warn'); app.haptic('fail'); return; }
    if (!res) {
      if (state.garage) state.garage.rigId = rig.id;
      app.bus.emit(EVENTS.RIG_CHANGE, { rigId: rig.id, methodId: rig.methods?.[0] || null });
    }
    app.haptic('medium');
    app.toast(`${rig.name} on the low-loader`, 'success');
    render();
  }

  /**
   * Methods as a wrapping row of micro-chips, not a stack of fake buttons.
   * On a card the cap is 3: "Overburden / duplex drilling" and "Cable-tool /
   * drop hammer" wrap inside their own lozenges, and five of them took a fifth
   * of the screen to say something the detail sheet says properly.
   */
  function methodChips(methods, max = 3) {
    const wrap = C.h('div', { style: { display: 'flex', 'flex-wrap': 'wrap', gap: '4px' } });
    const list = (methods || []).slice(0, max);
    for (const m of list) {
      const name = methodInfo(m)?.name;
      if (!name) continue;
      wrap.appendChild(C.h('span.pill.pill--steel', { style: { padding: '2px 8px' } }, C.h('span', { text: name })));
    }
    if ((methods || []).length > max) {
      wrap.appendChild(C.h('span.pill', { style: { padding: '2px 8px' } }, C.h('span', { text: `+${methods.length - max}` })));
    }
    return wrap;
  }

  /**
   * The class tag that sits on the art.
   *
   * Two rig cards side by side were two yellow machines with two long names.
   * The tag states the primary method in the industry's own short form (TH,
   * DTH, KEL, CFA, HDD, RB — data.js `METHODS.short`) plus the rated depth, so
   * the cards separate at a glance and on a value a buyer actually compares.
   */
  function rigTag(rig) {
    const m = (rig.methods || [])[0];
    const short = m ? (methodInfo(m)?.short || '') : '';
    const bits = [short, rig.depth ? `${rig.depth} m` : ''].filter(Boolean);
    if (!bits.length) return null;
    /* NEEDS-CSS: `.rigcard__tag` — an overlay tag on the art well. */
    return C.h('span.rigcard__tag', {
      style: {
        position: 'absolute', left: 'var(--s-2)', top: 'var(--s-2)',
        display: 'inline-flex', 'align-items': 'center',
        padding: '3px 8px', 'border-radius': 'var(--r-full)',
        background: 'rgb(var(--rgb-black) / .55)',
        border: '1px solid rgb(var(--rgb-amber) / .34)',
        color: 'var(--c-amber-hot)',
        'font-size': 'var(--t-2xs)', 'font-weight': '800',
        // No text-transform: the method short form is already upper case and
        // the unit is metres, not "M".
        'letter-spacing': 'var(--tr-label)',
        'white-space': 'nowrap',
      },
      text: bits.join(' · '),
    });
  }

  function rigCard(rig) {
    const has = ownedRig(rig.id);
    const current = state.garage?.rigId === rig.id;
    const canvas = C.h('canvas', { style: { width: '100%', height: '100%', display: 'block' } });
    previews.push({ canvas, rig });

    // NEEDS-CSS: `.rigcard__art { height: 152px }` — 92px forced the square
    // render into a 2.4:1 letterbox. Set inline until the rule moves.
    const art = C.h('div.rigcard__art', { style: { height: '152px' } }, canvas, rigTag(rig));

    const card = C.Card({ class: 'rigcard', onTap: () => (has ? selectRig(rig) : openRig(rig)) },
      art,
      C.h('div',
        C.h('p.rigcard__cl', { text: rig.klass }),
        C.h('p.rigcard__nm', { text: rig.name }),
      ),
      C.h('div.rigstats',
        stat(rig.power, 'kW'),
        stat(rig.torque, 'kNm'),
        stat(rig.depth, 'm'),
      ),
      methodChips(rig.methods),
      current
        ? C.Pill('In service', 'amber', 'check')
        : has ? C.Button({ label: 'Select', kind: 'ghost', size: 'sm', onTap: () => selectRig(rig) })
          : C.h('div.ccard__lock', C.Icon('lock', 13), C.h('span', { text: `Level ${rig.level} · ${fmtMoney(rig.price)}` })),
    );
    card.classList.add('rigcard');
    if (current) card.classList.add('is-current');
    if (!has) card.classList.add('is-locked');
    return card;
  }
  function stat(v, k) {
    return C.h('div.rigstat', C.h('div.rigstat__v', { text: String(v ?? 0) }), C.h('div.rigstat__k', { text: k }));
  }

  function openRig(rig) {
    const canvas = C.h('canvas', { style: { width: '100%', height: '100%', display: 'block' } });
    // Square, for the same reason the card art is nearly square: the live
    // turntable renders square and blits cover-fit, so a letterbox well cuts
    // the mast off the top and the tracks off the bottom.
    const art = C.h('div.rigcard__art', {
      style: { width: 'min(240px, 82%)', height: '240px', margin: '0 auto' },
    }, canvas);
    const sp = app.ctx.shopPreview || app.ctx.preview;

    const sh = app.sheet({
      title: rig.name, sub: rig.klass,
      onClose: () => { try { sp?.clearLive?.(); } catch (_) { /* preview already gone */ } },
      body: C.h('div', { style: { display: 'flex', 'flex-direction': 'column', gap: '16px' } },
        art,
        C.h('p.cdetail__brief', { text: rig.note }),
        methodChips(rig.methods, 12),
        C.h('dl.specs',
          C.SpecRow('Class', rig.klass),
          C.SpecRow('Methods', (rig.methods || []).map((m) => methodInfo(m)?.name).filter(Boolean).join(', ') || '—'),
          C.SpecRow('Power', `${rig.power} kW`),
          C.SpecRow('Rotary torque', `${rig.torque} kNm`),
          rig.feedForce ? C.SpecRow('Feed force', `${Math.round(rig.feedForce)} kN`) : null,
          C.SpecRow('Rated depth', `${rig.depth} m`),
          rig.mast ? C.SpecRow('Mast', `${rig.mast} m`) : null,
          rig.weight ? C.SpecRow('Transport weight', `${rig.weight} t`) : null,
          C.SpecRow('Unlocks at', `Level ${rig.level}`),
          C.SpecRow('List price', rig.price ? fmtMoney(rig.price) : 'Owned'),
        ),
      ),
      actions: [
        C.Button({ label: 'Close', kind: 'quiet', onTap: () => sh.close() }),
        ownedRig(rig.id)
          ? C.Button({ label: 'Select', kind: 'amber', icon: 'check', onTap: () => { sh.close(); selectRig(rig); } })
          : C.Button({ label: 'Find in iMarket', kind: 'amber', icon: 'cart', onTap: () => { sh.close(); app.nav(SCENES.SHOP); } }),
      ],
    });

    requestAnimationFrame(() => {
      if (sp && typeof sp.setLive === 'function' && sp.ready) {
        try { sp.setLive(rig.id, canvas, { wear: 1 - condition(rig.id) }); return; } catch (_) { /* fall through */ }
      }
      mountRigArt(canvas, rig);
    });
  }

  /* ── Loadout ──────────────────────────────────────────────────────────── */
  /** The five core bays, plus any extra bay the player actually owns kit for. */
  function visibleSlots() {
    const all = allSlots();
    const owned = new Set(state.garage?.owned || []);
    const fitted = new Set(Object.keys(state.garage?.loadout || {}).filter((k) => state.garage.loadout[k]));
    const used = new Set();
    for (const it of allItems()) if (owned.has(it.id)) used.add(it.slot);
    return all.filter((s) => s.core !== false || used.has(s.id) || fitted.has(s.id));
  }

  function candidatesFor(slot) {
    return (app.items() || []).filter((i) => i && i.slot === slot && ownedItem(i.id));
  }

  function equipItem(slot, id) {
    const res = app.ctx.progression?.equip?.(slot, id);
    if (res && res.ok === false) { app.toast(res.reason || 'Will not fit', 'warn'); app.haptic('fail'); return; }
    if (!res) {
      if (state.garage) {
        state.garage.loadout = state.garage.loadout || {};
        state.garage.loadout[slot] = id;
      }
      app.bus.emit(EVENTS.EQUIP, { slot, itemId: id });
    }
    app.haptic('medium');
    render();
  }

  function openPicker(slot) {
    const list = candidatesFor(slot.id);
    const rows = C.h('div');
    const currentId = state.garage?.loadout?.[slot.id] || null;

    if (!list.length) {
      rows.appendChild(C.Empty(`Nothing owned for ${slot.name.toLowerCase()}`, 'Buy one in iMarket and it lands here.'));
    }
    for (const it of list) {
      const isCur = it.id === currentId;
      const cond = condition(it.id);
      const name = C.h('p.slotcard__v', { style: { 'white-space': 'normal' }, text: it.name });
      const row = C.Card({ class: 'slotcard', onTap: () => { sh.close(); equipItem(slot.id, it.id); } },
        C.h('span.slotcard__ico', C.Icon(slot.icon, 20)),
        C.h('div.slotcard__b',
          name,
          C.h('p.slotcard__k', { text: `${threadOf(it) || catLeaf(it.category) || '—'} · ${dutyOf(it)}` }),
          (() => { const b = C.Bar({ kind: cond > 0.4 ? 'success' : cond > 0.15 ? 'warning' : 'danger', value: cond }); b.el.classList.add('slotcard__cond'); return b.el; })(),
        ),
        isCur ? C.Pill('Fitted', 'success', 'check') : C.Icon('chevron', 16),
      );
      row.classList.add('slotcard');
      rows.appendChild(row);
    }

    const sh = app.sheet({
      title: slot.name, sub: slot.hint, body: rows,
      actions: [
        C.Button({ label: 'Close', kind: 'quiet', onTap: () => sh.close() }),
        currentId && slot.id !== 'bit' && slot.id !== 'rod'
          ? C.Button({ label: 'Remove', kind: 'danger', onTap: () => { sh.close(); equipItem(slot.id, null); } })
          : C.Button({ label: 'iMarket', kind: 'amber', icon: 'cart', onTap: () => { sh.close(); app.nav(SCENES.SHOP); } }),
      ],
    });
  }

  function slotCard(slot) {
    const id = state.garage?.loadout?.[slot.id] || null;
    const item = id ? app.itemById(id) : null;
    const cond = id ? condition(id) : 1;
    // The bay label comes from the fitted item's OWN taxonomy leaf: an auger
    // flight is an auger flight, not a "crown".
    const leaf = item ? catLeaf(item.category) : '';
    const life = item?.stats?.life || 0;

    const value = C.h('p.slotcard__v' + (item ? '' : '.is-empty'), {
      style: { 'white-space': 'normal' },
      text: item ? item.name : 'Empty',
    });
    const remaining = life
      ? C.h('span.row__value', {
        style: { 'white-space': 'nowrap', flex: 'none' },
        text: `${Math.round(cond * life).toLocaleString('en-US')} m`,
      })
      : null;

    const card = C.Card({ class: 'slotcard', onTap: () => openPicker(slot) },
      C.h('span.slotcard__ico', C.Icon(slot.icon, 21)),
      C.h('div.slotcard__b',
        C.h('p.slotcard__k', { text: leaf || slot.name }),
        value,
        life
          ? (() => {
            const b = C.Bar({ kind: cond > 0.4 ? 'success' : cond > 0.15 ? 'warning' : 'danger', value: cond });
            b.el.classList.add('slotcard__cond');
            return b.el;
          })()
          : null,
      ),
      remaining,
      C.h('span.row__chev', C.Icon('chevron', 16)),
    );
    card.classList.add('slotcard');
    return card;
  }

  /* ── String check — the honest, useful part ───────────────────────────── */
  /**
   * @returns {{level:'ok'|'note'|'bad', msg:string}|null}
   *   ok   — same system, same designation: the joint makes up.
   *   bad  — same system, different designation: it will not mate. Say so.
   *   note — different systems entirely (a hex drive against a threaded rod):
   *          worth flagging, but not a fault. Crying wolf on the starting kit
   *          would teach the player to ignore this panel.
   */
  function stringVerdict(bit, rod) {
    const bt = threadOf(bit), rt = threadOf(rod);
    if (!bt || !rt) return null;
    const a = connections(bt), b = connections(rt);

    if (!a.length || !b.length) {
      const same = String(bt).trim().toLowerCase() === String(rt).trim().toLowerCase();
      return same
        ? { level: 'ok', msg: `${bt} both ends — the string is square.` }
        : { level: 'note', msg: `${bt} against ${rt}. Check the make-up before you mobilise.` };
    }
    const bKeys = b.map(connKey);
    const shared = a.filter((x) => bKeys.includes(connKey(x)));
    if (shared.length) {
      return { level: 'ok', msg: `${shared[0]} both ends — the string is square.` };
    }
    // Same system, different size or family: the damning case.
    for (const x of a) {
      for (const y of b) {
        if (systemOf(x) !== systemOf(y) || systemOf(x) === 'other') continue;
        if (isPercussion(x)) {
          return {
            level: 'bad',
            msg: `Cutting tool ${x}, string ${y}. R-, T- and H-series percussion threads are separate families in separate sizes — they will not mate.`,
          };
        }
        return { level: 'bad', msg: `Cutting tool ${x}, string ${y} — these connections do not mate.` };
      }
    }
    return {
      level: 'note',
      msg: `${a[0]} against ${b[0]}: different connection systems. The drive head makes this up, not a threaded joint — check it before you spud.`,
    };
  }

  function methodVerdict(rig, bit) {
    if (!rig || !bit || !bit.methods || !bit.methods.length) return null;
    const rigMethods = rig.methods || [];
    if (!rigMethods.length) return null;
    if (bit.methods.some((m) => rigMethods.includes(m))) return null;
    const want = methodInfo(bit.methods[0])?.name || bit.methods[0];
    return `${bit.name} is a ${want} tool. ${rig.name} does not run that method.`;
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  function render() {
    previews.length = 0;
    C.clear(rigStrip);
    const rigs = allRigs();

    // No fleet means game/data.js is not mounted. Every block below this point
    // describes a specific machine, so there is nothing honest to draw.
    if (!rigs.length) {
      C.clear(body);
      body.appendChild(C.Empty('Content unavailable', 'The equipment catalogue could not be loaded.'));
      return;
    }

    for (const r of rigs) rigStrip.appendChild(rigCard(r));

    C.clear(body);
    const rig = rigInfo(state.garage?.rigId) || rigInfo(rigs[0].id) || rigs[0];

    body.appendChild(C.SectionTitle('Rigs', C.h('span.label', { text: `${rigs.filter((r) => ownedRig(r.id)).length} of ${rigs.length} owned` })));
    body.appendChild(rigStrip);

    body.appendChild(C.SectionTitle('Loadout', C.h('span.label', { text: rig.name })));
    const slots = C.h('div.stagger');
    for (const s of visibleSlots()) slots.appendChild(slotCard(s));
    C.stagger(slots.children);
    body.appendChild(slots);

    // Compatibility read-out.
    const bit = state.garage?.loadout?.bit ? app.itemById(state.garage.loadout.bit) : null;
    const rod = state.garage?.loadout?.rod ? app.itemById(state.garage.loadout.rod) : null;
    const bitThread = threadOf(bit);
    const rodThread = threadOf(rod);
    const verdict = stringVerdict(bit, rod);
    const methodWarn = methodVerdict(rig, bit);
    const casingNote = (isCasingJoint(bitThread) || isCasingJoint(rodThread))
      ? 'Casing joints are cut left-hand, so advancing the casing cannot unscrew them.'
      : null;

    body.appendChild(C.SectionTitle('String check'));
    body.appendChild(C.h('div.panel.panel--pad', C.h('div.panel__body',
      C.h('dl.specs',
        C.SpecRow('Rig', `${rig.name} · ${rig.klass}`),
        C.SpecRow('Cutting tool', bit ? bit.name : '—'),
        C.SpecRow('Bit connection', bitThread || '—'),
        C.SpecRow('Rod connection', rodThread || '—'),
        C.SpecRow('Duty', `${bit ? dutyOf(bit) : '—'} · ${rod ? dutyOf(rod) : '—'}`),
        C.SpecRow('Rated depth', `${rig.depth} m`),
      ),
      verdict === null
        ? C.h('div.ccard__lock', C.Icon('info', 14), C.h('span', { text: 'Fit a cutting tool and a string to check the connections.' }))
        : verdict.level === 'ok'
          ? C.h('div.ccard__lock', {
            style: {
              background: 'rgb(var(--rgb-success) / .10)',
              'border-color': 'rgb(var(--rgb-success) / .3)',
              color: 'var(--c-success-soft)',
            },
          }, C.Icon('check', 14), C.h('span', { text: verdict.msg }))
          : verdict.level === 'bad'
            ? C.h('div.ccard__lock', {
              style: {
                background: 'rgb(var(--rgb-danger) / .12)',
                'border-color': 'rgb(var(--rgb-danger) / .4)',
                color: 'var(--c-danger)',
              },
            }, C.Icon('alert', 14), C.h('span', { text: verdict.msg }))
            : C.h('div.ccard__lock', C.Icon('info', 14), C.h('span', { text: verdict.msg })),
      methodWarn ? C.h('div.ccard__lock', C.Icon('alert', 14), C.h('span', { text: methodWarn })) : null,
      casingNote ? C.h('div.ccard__lock', {
        style: {
          background: 'rgb(var(--rgb-steel) / .10)',
          'border-color': 'rgb(var(--rgb-steel) / .3)',
          color: 'var(--c-steel-soft)',
        },
      }, C.Icon('info', 14), C.h('span', { text: casingNote })) : null,
    )));

    // Inventory.
    body.appendChild(C.SectionTitle('Inventory'));
    const inv = (state.garage?.owned || []);
    if (!inv.length) body.appendChild(C.Empty('The yard is empty', 'Everything you buy in iMarket shows up here.'));
    else {
      const invPanel = C.h('div.panel.panel--pad', C.h('div.panel__body'));
      const invBody = invPanel.querySelector('.panel__body');
      for (const id of inv) {
        const it = app.itemById(id);
        if (!it) continue;
        const fitted = Object.values(state.garage?.loadout || {}).includes(id);
        const thread = threadOf(it);
        const row = C.Row({
          label: it.name,
          sub: `${thread ? thread + ' · ' : ''}${dutyOf(it)} · ${fmtMoney(it.price || 0)}`,
          value: fitted ? 'Fitted' : `${Math.round(condition(id) * 100)}%`,
          icon: slotIcon(it.slot),
        });
        // NEEDS-CSS below covers this properly; keep the value on one line now.
        const v = row.querySelector('.row__value');
        if (v) { v.style.whiteSpace = 'nowrap'; v.style.flex = 'none'; }
        invBody.appendChild(row);
      }
      body.appendChild(invPanel);
    }

    requestAnimationFrame(() => { for (const p of previews) mountRigArt(p.canvas, p.rig); });
  }

  function slotIcon(slotId) {
    const s = allSlots().find((x) => x.id === slotId);
    return s ? s.icon : 'cart';
  }

  return {
    el,
    mount() { render(); },
    update() {},
    resize() { for (const p of previews) mountRigArt(p.canvas, p.rig); },
    onEquip() { render(); },
    onPurchase() { render(); },
    onRig() { render(); },
    onUnlock() { render(); },
    unmount() {
      try { (app.ctx.shopPreview || app.ctx.preview)?.clearLive?.(); } catch (_) { /* already gone */ }
    },
  };
}
