/**
 * DRILLITY I THE GAME — UI shell.
 *
 *   createUI(ctx) -> { init, update, resize, dispose,
 *                      show, toast, confirm, setLoadingProgress }
 *
 * Owns the DOM root inside #ui, the screen registry and transitions, the
 * overlay layer (toasts / sheets / modals) and every bus subscription that has
 * a UI consequence. Screens are dumb: they get an `app` facade and never touch
 * ctx directly for anything the shell already normalises.
 */
import './styles.css';
import {
  SCENES, EVENTS, GROUND, fmtMoney, fmtDepth, clamp,
} from '../core/contract.js';
import * as C from './components.js';
import * as CAT from './screens/catalog.js';

import { createBootScreen }      from './screens/boot.js';
import { createMenuScreen }      from './screens/menu.js';
import { createContractsScreen } from './screens/contracts.js';
import { createSiteScreen }      from './screens/site.js';
import { createResultsScreen }   from './screens/results.js';
import { createShopScreen }      from './screens/shop.js';
import { createCareerScreen }    from './screens/career.js';
import { createGarageScreen }    from './screens/garage.js';

const SCREEN_FACTORIES = {
  [SCENES.BOOT]:      createBootScreen,
  [SCENES.MENU]:      createMenuScreen,
  [SCENES.CONTRACTS]: createContractsScreen,
  [SCENES.SITE]:      createSiteScreen,
  [SCENES.RESULTS]:   createResultsScreen,
  [SCENES.SHOP]:      createShopScreen,
  [SCENES.CAREER]:    createCareerScreen,
  [SCENES.GARAGE]:    createGarageScreen,
};

/** Screens that must not paint over the WebGL bands. */
const TRANSPARENT = new Set([SCENES.MENU, SCENES.SITE]);
/** Back-target for each screen. */
const PARENT = {
  [SCENES.CONTRACTS]: SCENES.MENU,
  [SCENES.SHOP]:      SCENES.MENU,
  [SCENES.CAREER]:    SCENES.MENU,
  [SCENES.GARAGE]:    SCENES.MENU,
  [SCENES.RESULTS]:   SCENES.MENU,
  [SCENES.SITE]:      SCENES.CONTRACTS,
};

const TRANSITION_MS = 460;
const BOOT_MIN_SEC = 1.9;

/**
 * The career screen lays skills out on a (row, col) grid. game/data.js describes
 * the tree as a prerequisite DAG and does not carry coordinates, so derive them:
 * row = depth in the DAG, col = position among the nodes sharing that depth.
 * Without this, `Math.max(a, s.row)` folds an undefined into NaN and the whole
 * SVG connector layer gets viewBox="0 0 W NaN".
 */
function normaliseSkillTree(tree) {
  const skills = (tree.skills || []).map((s) => ({ ...s }));
  if (!skills.length) return tree;
  if (skills.every((s) => Number.isFinite(s.row) && Number.isFinite(s.col))) return tree;

  const byId = new Map(skills.map((s) => [s.id, s]));
  const prereqsOf = (s) => {
    const p = s.requires ?? s.prereq ?? s.prereqs ?? s.needs ?? s.parent;
    if (!p) return [];
    return (Array.isArray(p) ? p : [p]).filter((id) => byId.has(id));
  };

  // Depth via memoised DFS, cycle-safe.
  const depth = new Map();
  const visiting = new Set();
  const depthOf = (s) => {
    if (depth.has(s.id)) return depth.get(s.id);
    if (visiting.has(s.id)) return 0;          // cycle — treat as a root
    visiting.add(s.id);
    const ps = prereqsOf(s);
    const d = ps.length ? Math.max(...ps.map((id) => depthOf(byId.get(id)) + 1)) : 0;
    visiting.delete(s.id);
    depth.set(s.id, d);
    return d;
  };
  for (const s of skills) depthOf(s);

  // Column = index among same-branch, same-depth nodes, centred over 3 columns.
  const lane = new Map();
  for (const s of skills) {
    const k = `${s.branch || '_'}|${depth.get(s.id)}`;
    const list = lane.get(k) || [];
    list.push(s);
    lane.set(k, list);
  }
  for (const list of lane.values()) {
    const n = list.length;
    list.forEach((s, i) => {
      s.row = depth.get(s.id);
      s.col = n === 1 ? 1 : n === 2 ? i * 2 : i % 3;
    });
  }
  return { ...tree, skills };
}

const updateErrSeen = new Set();

export function createUI(ctx) {
  const bus = ctx.bus;
  const state = ctx.state;

  /* ── DOM scaffold ─────────────────────────────────────────────────────── */
  const host = ctx.uiRoot || document.getElementById('ui') || document.body;
  const root = C.h('div.ui-root');
  const letterbox = C.h('div.ui-letterbox');
  const stage = C.h('div.ui-stage');
  const screensEl = C.h('div.screens');
  const toastsEl = C.h('div.toasts', { role: 'status', 'aria-live': 'polite' });
  const overlayEl = C.h('div.overlays');
  stage.append(screensEl, toastsEl, overlayEl);
  root.append(letterbox, stage);

  /* ── Runtime state ────────────────────────────────────────────────────── */
  const screens = new Map();      // sceneId -> instance
  let current = null;             // { id, inst }
  let leaving = null;             // { inst, timer }
  let pendingScene = null;        // scene requested while BOOT still holds
  let bootHeld = true;
  let bootElapsed = 0;
  let externalProgress = null;    // set by setLoadingProgress
  let disposed = false;
  const unsubs = [];
  const toasts = [];              // { el, life }
  let overlayStack = [];
  let reduced = false;
  let viewport = { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1 };
  let boardCache = null;

  /** Contracts are authored as `target`; game/data.js calls it `targetDepth`. */
  const targetOf = (c) => (c ? (c.target ?? c.targetDepth ?? c.depth ?? 0) : 0);

  const titleCase = (s) => String(s || '').replace(/[-_]/g, ' ').replace(/(^|\s)\w/g, (m) => m.toUpperCase());
  const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /**
   * Contract normaliser — the single boundary between however the data layer
   * shapes a contract and the field names every screen reads. It is a superset:
   * originals are preserved, so ctx.sim.startHole() and world/geology.js still
   * see the keys they expect.
   *
   * ── THE TWO FALLBACKS ON THE NEXT LINES ────────────────────────────────
   * A contract that carried none of the method or region spellings used to
   * come out of here as a perfectly well-formed auger job in Nordic, in
   * silence, and every screen downstream then displayed that invention as
   * fact. HANDOFF §8A: a plausible wrong answer is worse than a crash,
   * because it survives review.
   *
   * `state.world.site` is consulted first and is the RIGHT answer, not a
   * consolation: progression.js publishes it when a job is accepted and never
   * clears it — only marks `live: false` at settlement — so it still knows the
   * method and region while `state.contract` is already null (HANDOFF §12).
   * Only when even that is empty do we fall through, and then loudly.
   */
  const normCache = new Map();
  function normalizeContract(c) {
    if (!c) return null;
    if (c.__uiNorm) return c;
    if (c.id && normCache.has(c.id)) return normCache.get(c.id);

    const site = state.world?.site || null;
    const region = C.mustResolve(
      c.region ?? c.regionId ?? site?.regionId, 'contract region', 'nordic',
      'Every screen will name the wrong region, and the section will be built from the wrong ground.');
    const method = C.mustResolve(
      c.method ?? c.methodId ?? c.requiredMethod ?? site?.methodId, 'contract method', 'auger',
      'The rig, the section, the particles and the audio all follow this — the whole session plays as a surface auger.');
    const target = targetOf(c);
    const certs = c.certs ?? c.requiredCerts ?? [];
    const apps = ctx.game?.APPLICATIONS;
    const application = c.application
      ?? (apps ? (apps.find((a) => a.id === c.applicationId)?.name) : null)
      ?? titleCase(c.applicationId)
      ?? 'Drilling works';

    // Ground: `profile` [{g,to}] is the UI shape; `groundSpec` [{id,top,bottom}]
    // is game/data.js's; `ground` is a plain list of ids.
    let profile = c.profile;
    if (!profile && Array.isArray(c.groundSpec) && c.groundSpec.length) {
      profile = c.groundSpec.map((g) => ({ g: g.id, to: g.bottom }));
    }
    if (!profile && Array.isArray(c.ground) && c.ground.length) {
      const step = (target || c.ground.length) / c.ground.length;
      profile = c.ground.map((g, i) => ({
        g: typeof g === 'string' ? g : g.id,
        to: +((i + 1) * step).toFixed(2),
      }));
    }

    const out = {
      ...c,
      __uiNorm: true,
      id: c.id || `ct-${slug(c.title)}-${Math.round(target)}`,
      title: c.title || 'Drilling works',
      client: c.client || 'Private client',
      region, regionId: region,
      method, methodId: method,
      application,
      applicationId: c.applicationId || slug(application),
      target, targetDepth: target,
      payout: c.payout || 0,
      deadlineH: c.deadlineH ?? c.deadlineHours ?? 8,
      deadlineHours: c.deadlineHours ?? c.deadlineH ?? 8,
      difficulty: c.difficulty || 1,
      certs, requiredCerts: certs,
      level: c.level ?? CAT.methodInfo(method).level ?? 1,
      brief: c.brief || c.description || '',
      profile: profile || [],
      holes: c.holes || 1,
    };
    if (out.id) normCache.set(out.id, out);
    return out;
  }

  /* ── Haptics ──────────────────────────────────────────────────────────── */
  const VIBRATE = { light: 8, medium: 16, heavy: 32, success: [10, 40, 18], fail: [26, 50, 26] };
  function haptic(pattern = 'light') {
    if (!state.settings || state.settings.haptics === false) return;
    bus.emit(EVENTS.HAPTIC, { pattern });
    const v = VIBRATE[pattern];
    if (v && navigator.vibrate) { try { navigator.vibrate(v); } catch (_) { /* unsupported */ } }
  }
  C.setHapticSink(haptic);

  /* ── Reduced motion ───────────────────────────────────────────────────── */
  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function syncMotion() {
    const want = !!(state.settings && state.settings.reducedMotion) || !!(mq && mq.matches);
    if (want === reduced) return;
    reduced = want;
    root.classList.toggle('reduced-motion', reduced);
  }
  if (mq) {
    const h2 = () => syncMotion();
    mq.addEventListener ? mq.addEventListener('change', h2) : mq.addListener(h2);
    unsubs.push(() => { mq.removeEventListener ? mq.removeEventListener('change', h2) : mq.removeListener(h2); });
  }

  /* ── Overlays: toast / sheet / confirm ──────────────────────────────────
   * At most TWO live at once, stacked bottom-up from just above the cluster.
   * Every toast carries a key (its own text unless the caller supplies one);
   * a repeat of a live key rewrites that toast in place instead of stacking a
   * near-duplicate, which is how "Level 2" and "Level 3" used to be on screen
   * together while the XP bar already read LVL 3.
   */
  const TOAST_MAX = 2;
  function toastIcon(kind) {
    return kind === 'success' ? 'check'
      : (kind === 'danger' || kind === 'warn') ? 'alert' : 'info';
  }
  function toast(msg, kind = 'info', opts = {}) {
    const text = String(msg);
    const key = opts.key || text;
    const life = kind === 'danger' ? 4.2 : 2.8;

    const live = toasts.find((r) => r.key === key);
    if (live) {                       // coalesce onto the newest state
      live.label.textContent = text;
      live.life = life;
      if (live.kind !== kind) {
        live.kind = kind;
        live.el.className = `toast${kind !== 'info' ? ' toast--' + kind : ''}`;
        live.el.replaceChild(C.Icon(toastIcon(kind), 16), live.el.firstChild);
      }
      // Reorder the lifetime queue but NOT the DOM: the toast must not jump
      // to a different slot just because its text was refreshed.
      toasts.splice(toasts.indexOf(live), 1);
      toasts.push(live);
      return live;
    }

    const label = C.h('span', { text });
    const t = C.h(`div.toast${kind !== 'info' ? '.toast--' + kind : ''}`,
      C.Icon(toastIcon(kind), 16),
      label,
    );
    toastsEl.appendChild(t);
    const rec = { el: t, label, key, kind, life };
    toasts.push(rec);
    while (toasts.length > TOAST_MAX) killToast(toasts[0]);
    return rec;
  }
  function killToast(rec) {
    const i = toasts.indexOf(rec);
    if (i < 0) return;
    toasts.splice(i, 1);
    rec.el.classList.add('is-out');
    setTimeout(() => rec.el.remove(), reduced ? 10 : 320);
  }

  function closeOverlay(o) {
    const i = overlayStack.indexOf(o);
    if (i >= 0) overlayStack.splice(i, 1);
    o.el.classList.add('is-out');
    setTimeout(() => o.el.remove(), reduced ? 10 : 320);
    o.onClose && o.onClose();
  }

  /**
   * Bottom sheet.
   * @param {object} o { title, sub, body:Node|Node[], actions:Node[], onClose }
   */
  function sheet(o = {}) {
    const scrim = C.h('div.sheet__scrim');
    const body = C.h('div.sheet__body');
    C.append(body, [o.body]);
    const closeBtn = C.h('button.sheet__x', { type: 'button', 'aria-label': 'Close' }, C.Icon('close', 17));
    const box = C.h('div.sheet__box', { role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || 'Details' },
      C.h('i.sheet__grab'),
      (o.title || o.sub) ? C.h('div.sheet__head',
        C.h('div', o.sub ? C.h('p.sheet__s', { text: o.sub }) : null, C.h('h2.sheet__t', { text: o.title || '' })),
        closeBtn,
      ) : null,
      body,
      o.actions && o.actions.length ? C.h('div.sheet__actions', ...o.actions) : null,
    );
    const el = C.h('div.sheet', scrim, box);
    const rec = { el, onClose: o.onClose, close: () => closeOverlay(rec) };
    C.tap(scrim, () => closeOverlay(rec));
    C.tap(closeBtn, () => closeOverlay(rec));
    overlayEl.appendChild(el);
    overlayStack.push(rec);
    return rec;
  }

  /**
   * Confirm dialog. Resolves true/false.
   * @param {object} o { title, message, confirmLabel, cancelLabel, kind, destructive }
   */
  function confirm(o = {}) {
    return new Promise((resolve) => {
      let settled = false;
      const done = (v) => { if (settled) return; settled = true; closeOverlay(rec); resolve(v); };
      const scrim = C.h('div.modal__scrim');
      const box = C.h('div.modal__box', { role: 'alertdialog', 'aria-modal': 'true' },
        C.h('h2.modal__t', { text: o.title || 'Are you sure?' }),
        o.message ? C.h('p.modal__m', { text: o.message }) : null,
        C.h('div.modal__a',
          C.Button({ label: o.cancelLabel || 'Cancel', kind: 'quiet', onTap: () => done(false) }),
          C.Button({ label: o.confirmLabel || 'Confirm', kind: o.destructive ? 'danger' : (o.kind || 'amber'), onTap: () => done(true) }),
        ),
      );
      const el = C.h('div.modal', scrim, box);
      const rec = { el, onClose: () => { if (!settled) { settled = true; resolve(false); } } };
      C.tap(scrim, () => done(false));
      overlayEl.appendChild(el);
      overlayStack.push(rec);
      requestAnimationFrame(() => box.querySelector('.btn--amber, .btn--danger')?.focus());
    });
  }

  /* ── The app facade handed to every screen ────────────────────────────── */
  const app = {
    ctx, bus, state, C, CAT, GROUND,
    fmtMoney, fmtDepth, clamp,
    haptic, toast, sheet, confirm,
    get viewport() { return viewport; },
    get reducedMotion() { return reduced; },
    nav: (scene, params) => show(scene, params),
    back: () => back(),

    /** Player money, safe against a missing progression system. */
    money: () => (state.player ? state.player.money || 0 : 0),

    /** The 3D item preview system, whichever name it was mounted under. */
    get preview() { return ctx.shopPreview || ctx.preview || null; },

    /**
     * Contracts. Preference order:
     *   ctx.game.contracts        a ready board
     *   ctx.game.makeContractBoard(regionId, level, rand)   generated board
     *   ctx.progression.getContracts()
     *
     * There is no fourth option. game/data.js generates the board; with it
     * absent there is no work to offer, and the board shows that plainly
     * rather than a hand-written demo one.
     */
    normalizeContract,
    contracts() {
      return this._rawContracts().map(normalizeContract);
    },
    _rawContracts() {
      const g = ctx.game;
      if (g?.contracts?.length) return g.contracts;
      if (typeof g?.makeContractBoard === 'function') {
        if (!boardCache) {
          try {
            boardCache = g.makeContractBoard(
              state.world?.regionId || 'nordic',
              state.player?.level || 1,
              ctx.rand,
            );
          } catch (e) { console.warn('[ui] makeContractBoard failed', e); boardCache = null; }
        }
        if (boardCache?.length) return boardCache;
      }
      const fromProg = ctx.progression?.getContracts?.();
      if (fromProg?.length) return fromProg;
      return [];
    },
    /** Drop the generated board so the next read regenerates it. */
    invalidateBoard() { boardCache = null; },

    /** Item catalogue. Empty when game/data.js is not mounted. */
    items: () => ctx.game?.items || ctx.game?.ITEMS || ctx.shop?.getItems?.() || [],
    itemById: (id) => {
      if (!id) return null;
      if (typeof ctx.game?.getItem === 'function') { const f = ctx.game.getItem(id); if (f) return f; }
      const live = ctx.game?.items || ctx.game?.ITEMS || ctx.shop?.getItems?.();
      if (live) { const f = live.find((i) => i.id === id); if (f) return f; }
      return null;
    },

    /**
     * Strata for a contract.
     * world/geology.js owns the live profile, but generateProfile() rebuilds the
     * 3D section — so it is only trusted for the ACTIVE contract, never for a
     * board preview. Previews are drawn from the contract's own ground profile.
     */
    strataFor(contract) {
      if (!contract) return ctx.geology?.strata || state.world?.strata || [];
      const isActive = state.contract && contract.id === state.contract.id;
      if (isActive) {
        const live = ctx.geology?.strata;
        if (live?.length) return live;
        if (state.world?.strata?.length) return state.world.strata;
      }
      if (contract.profile?.length) return CAT.strataFromProfile(contract.profile, targetOf(contract));
      if (contract.strata?.length) return contract.strata;
      if (contract.ground?.length) {
        const t2 = targetOf(contract);
        const step = t2 / contract.ground.length;
        return CAT.strataFromProfile(contract.ground.map((g, i) => ({
          g: typeof g === 'string' ? g : g.id, to: +((i + 1) * step).toFixed(2),
        })), t2);
      }
      return [];
    },

    /** Skill tree — progression first, then game/data.js. Empty if neither. */
    skillTree() {
      const live = ctx.progression?.getSkillTree?.();
      if (live?.skills?.length) return normaliseSkillTree(live);
      return CAT.skillTree();
    },

    /** Certification list and lookup, read from game/data.js. */
    certs: () => CAT.allCerts(),
    certById: (id) => CAT.certInfo(id),

    /** XP needed for the next level. Progression / game data own the real curve. */
    xpForLevel: (lvl) =>
      ctx.progression?.xpForLevel?.(lvl)
      ?? ctx.game?.xpToNext?.(lvl)
      ?? Math.round(120 * Math.pow(lvl, 1.35)),

    /** Target depth, whatever the data source calls it. */
    targetOf,

    /** Register a bus subscription bound to the current screen's lifetime. */
    bind(list, evt, fn) { list.push(bus.on(evt, fn)); },
  };

  /* ── Screen management ────────────────────────────────────────────────── */
  function instantiate(id) {
    if (screens.has(id)) return screens.get(id);
    const factory = SCREEN_FACTORIES[id];
    if (!factory) return null;
    let inst = null;
    try {
      inst = factory(app);
    } catch (e) {
      console.error(`[ui] screen "${id}" failed to build`, e);
      inst = fallbackScreen(id, e);
    }
    if (!inst || !inst.el) inst = fallbackScreen(id, new Error('no element'));
    inst.el.classList.add('screen', 'screen--' + id);
    if (!TRANSPARENT.has(id)) inst.el.classList.add(id === SCENES.BOOT ? 'screen--boot' : 'screen--solid');
    inst.el.hidden = true;
    screensEl.appendChild(inst.el);
    screens.set(id, inst);
    return inst;
  }

  function fallbackScreen(id, err) {
    const el = C.h('div',
      C.ScreenHeader({ title: id, onBack: () => show(SCENES.MENU) }),
      C.h('div.scroll', C.Empty('This screen could not start', String(err && err.message || err))),
    );
    return { el, mount() {}, unmount() {}, update() {}, resize() {} };
  }

  function show(sceneId, params) {
    if (disposed) return;
    if (!SCREEN_FACTORIES[sceneId]) { console.warn('[ui] unknown scene', sceneId); return; }
    if (bootHeld && sceneId !== SCENES.BOOT) { pendingScene = { sceneId, params }; return; }
    if (current && current.id === sceneId) {
      current.inst.mount?.(params || {});
      return;
    }

    const goingBack = !!(current && PARENT[current.id] === sceneId);
    const inst = instantiate(sceneId);
    if (!inst) return;

    // Retire whatever is on screen.
    if (leaving) { finishLeave(); }
    if (current) {
      const prev = current;
      prev.inst.el.classList.remove('is-entering', 'is-entering--back');
      prev.inst.el.classList.add(goingBack ? 'is-leaving--back' : 'is-leaving');
      leaving = { inst: prev.inst, timer: setTimeout(finishLeave, reduced ? 20 : TRANSITION_MS) };
      try { prev.inst.unmount?.(); } catch (e) { console.error('[ui] unmount', e); }
    }

    stage.classList.toggle('is-site', sceneId === SCENES.SITE);
    stage.classList.toggle('is-results', sceneId === SCENES.RESULTS);
    inst.el.hidden = false;
    inst.el.classList.remove('is-leaving', 'is-leaving--back');
    // Force a reflow so the animation restarts cleanly on re-entry.
    void inst.el.offsetWidth;
    inst.el.classList.add(goingBack ? 'is-entering--back' : 'is-entering');
    current = { id: sceneId, inst };

    try { inst.mount?.(params || {}); } catch (e) { console.error(`[ui] mount ${sceneId}`, e); }
    try { inst.resize?.(viewport.w, viewport.h, viewport.dpr); } catch (e) { console.error(e); }

    if (state.scene !== sceneId) {
      state.scene = sceneId;
      bus.emit(EVENTS.SCENE_CHANGE, { scene: sceneId, params: params || null, from: 'ui' });
    }
  }

  function finishLeave() {
    if (!leaving) return;
    clearTimeout(leaving.timer);
    leaving.inst.el.hidden = true;
    leaving.inst.el.classList.remove('is-leaving', 'is-leaving--back');
    leaving = null;
  }

  function back() {
    const target = current ? PARENT[current.id] : null;
    show(target || SCENES.MENU);
  }

  /* ── Boot hand-off ────────────────────────────────────────────────────── */
  function releaseBoot() {
    if (!bootHeld) return;
    bootHeld = false;
    const next = pendingScene || { sceneId: SCENES.MENU, params: null };
    pendingScene = null;
    const bootInst = screens.get(SCENES.BOOT);
    bootInst?.playOut?.();
    setTimeout(() => show(next.sceneId, next.params), reduced ? 10 : 420);
  }

  function bootProgress() {
    if (externalProgress !== null) return clamp(externalProgress, 0, 1);
    // Self-driven: eased fill over BOOT_MIN_SEC.
    return clamp(bootElapsed / BOOT_MIN_SEC, 0, 1);
  }

  /* ── Bus wiring — every event in contract.js with a UI consequence ─────── */
  function wire() {
    const on = (evt, fn) => unsubs.push(bus.on(evt, fn));

    on(EVENTS.SCENE_CHANGE, (p) => {
      if (!p || p.from === 'ui') return;
      show(p.scene, p.params);
    });

    on(EVENTS.MONEY_CHANGE, (p) => {
      current?.inst.onMoney?.(p);
      if (!p || !p.delta) return;
      // The results screen IS the itemised statement for a settled hole — a
      // toast on top of it just occludes the grade and makes the payout look
      // ambiguous. Running costs are printed there as a ledger line instead.
      if (current && current.id === SCENES.RESULTS) return;
      if (p.reason && /running cost/i.test(p.reason)) return;
      const up = p.delta > 0;
      toast(
        `${up ? '+' : '−'}${fmtMoney(Math.abs(p.delta))}${p.reason ? ' · ' + p.reason : ''}`,
        up ? 'success' : 'warn',
        { key: 'money:' + (p.reason || '') },
      );
    });

    on(EVENTS.XP_GAIN, (p) => current?.inst.onXP?.(p));

    on(EVENTS.LEVEL_UP, (p) => {
      haptic('success');
      const lvl = p?.level ?? state.player?.level ?? 1;
      // One key for every level-up: two levels in one settlement collapse to
      // the level the player actually ended on.
      // RESULTS renders its own level-up block inside the XP bar, and a toast
      // here lands squarely on `.results__actions` — the only way off the
      // screen. Let the screen own it there.
      if (current?.id !== SCENES.RESULTS) {
        const role = CAT.roleAt(lvl);
        toast(role ? `Level ${lvl} — ${role.title}` : `Level ${lvl}`, 'amber', { key: 'levelup' });
      }
      current?.inst.onLevelUp?.(p);
    });

    on(EVENTS.UNLOCK, (p) => {
      if (!p) return;
      const label = p.kind === 'method' ? (CAT.methodInfo(p.id)?.name || p.id)
        : p.kind === 'region' ? (CAT.regionInfo(p.id)?.name || p.id)
        : p.kind === 'rig' ? (CAT.rigInfo(p.id)?.name || p.id)
        : (app.itemById(p.id)?.name || p.id);
      toast(`Unlocked: ${label}`, 'amber', { key: 'unlock:' + p.kind + ':' + p.id });
      current?.inst.onUnlock?.(p);
    });

    on(EVENTS.CERT_EARNED, (p) => {
      const c = CAT.certInfo(p?.certId);
      toast(`Certified: ${c ? c.name : p?.certId}`, 'success');
      current?.inst.onCert?.(p);
    });

    on(EVENTS.PURCHASE, (p) => current?.inst.onPurchase?.(p));
    on(EVENTS.REGION_CHANGE, () => { boardCache = null; });
    on(EVENTS.EQUIP, (p) => current?.inst.onEquip?.(p));
    on(EVENTS.CONTRACT_ACCEPT, (p) => current?.inst.onContract?.(p));

    // ── Drilling telemetry: forwarded straight to the active screen. ──
    on(EVENTS.DRILL_START,   (p) => current?.inst.onDrillStart?.(p));
    on(EVENTS.DRILL_TICK,    (p) => current?.inst.onTick?.(p));
    on(EVENTS.DRILL_STOP,    (p) => current?.inst.onDrillStop?.(p));
    on(EVENTS.STRATUM_ENTER, (p) => current?.inst.onStratum?.(p));
    on(EVENTS.ROD_ADDED,     (p) => current?.inst.onRod?.(p));
    /* A spudder has NO DRILL STRING, so there is no rod to add: its cadence is
       pulling the tool and running the bailer to lift the cuttings out. A
       screen that can tell the two apart gets its own hook and must label the
       beat as a bailing run; one that cannot still gets the generic beat on
       `onRod`, because the camera shake, the counter and the haptic are the
       same either way. Nothing on this path may call a bailing run a rod. */
    on(EVENTS.BAILER_RUN,    (p) => {
      const s = current?.inst;
      if (!s) return;
      if (typeof s.onBailer === 'function') s.onBailer(p);
      else s.onRod?.(p);
    });
    on(EVENTS.JAM,           (p) => current?.inst.onJam?.(p));
    on(EVENTS.JAM_CLEARED,   (p) => current?.inst.onJamCleared?.(p));
    on(EVENTS.WATER_STRIKE,  (p) => current?.inst.onWater?.(p));
    on(EVENTS.CAVITY,        (p) => current?.inst.onCavity?.(p));
    on(EVENTS.BOULDER,       (p) => current?.inst.onBoulder?.(p));
    on(EVENTS.BIT_WORN,      (p) => current?.inst.onBitWorn?.(p));
    on(EVENTS.BIT_BROKEN,    (p) => current?.inst.onBitBroken?.(p));

    on(EVENTS.HOLE_COMPLETE, (p) => {
      /* The payoff screen owns the summary; hand it everything we know — but
         NOT until every other listener on this event has finished.

         main.js awaits `ui.init()` (which is what calls wire(), so this
         subscription is made here) BEFORE it initialises the rest, and
         progression.js subscribes inside its own init(). This handler
         therefore runs FIRST, ahead of `progression.completeHole()`. Calling
         show() synchronously mounted the results screen before the settlement
         was booked, so `lastSettlement()` in screens/results.js read a ledger
         whose head was still the PREVIOUS hole — and its contract-id and ±5%
         depth guard cannot tell two runs of the same contract apart, so a
         repeat of the same job showed the earlier run's money and XP.

         A microtask is the whole fix: bus.emit is synchronous, so by the time
         this drains, every listener — progression included — has run to
         completion and the ledger head is this hole. Deliberately a
         microtask and not a frame: the screen must still change in the same
         turn, so nothing paints in between. */
      queueMicrotask(() => show(SCENES.RESULTS, { result: p }));
    });

    on(EVENTS.QUALITY_CHANGE, (p) => current?.inst.onQuality?.(p));
    on(EVENTS.REGION_CHANGE,  (p) => current?.inst.onRegion?.(p));
    on(EVENTS.RIG_CHANGE,     (p) => current?.inst.onRig?.(p));
  }

  /* ── Global keyboard: Escape closes the topmost overlay, else goes back ── */
  function onKey(e) {
    if (e.key !== 'Escape') return;
    if (overlayStack.length) { closeOverlay(overlayStack[overlayStack.length - 1]); e.preventDefault(); return; }
    if (current && PARENT[current.id]) { back(); e.preventDefault(); }
  }

  /* ── System interface ─────────────────────────────────────────────────── */
  return {
    async init() {
      host.appendChild(root);
      // game/data.js is the content authority when the integrator provides it.
      CAT.useGameData(ctx.game || null);
      syncMotion();
      wire();
      window.addEventListener('keydown', onKey);
      unsubs.push(() => window.removeEventListener('keydown', onKey));
      // Boot is always first; the shell holds it until systems have settled.
      const boot = instantiate(SCENES.BOOT);
      boot.el.hidden = false;
      boot.el.classList.add('is-entering');
      current = { id: SCENES.BOOT, inst: boot };
      boot.mount?.({});
      boot.resize?.(viewport.w, viewport.h, viewport.dpr);
      state.scene = SCENES.BOOT;
      document.body.classList.add('ui-ready');
    },

    update(dt, st) {
      if (disposed) return;
      syncMotion();

      // Toast lifetimes.
      for (let i = toasts.length - 1; i >= 0; i--) {
        toasts[i].life -= dt;
        if (toasts[i].life <= 0) killToast(toasts[i]);
      }

      if (bootHeld) {
        bootElapsed += dt;
        const p = bootProgress();
        screens.get(SCENES.BOOT)?.setProgress?.(p);
        if (p >= 1 && bootElapsed > (reduced ? 0.2 : 0.6)) releaseBoot();
      }

      if (current) {
        try { current.inst.update?.(dt, st || state); }
        catch (e) {
          // Log the stack, not just the message: a screen that throws every
          // frame is otherwise impossible to locate from a console transcript.
          if (!updateErrSeen.has(current.id)) {
            updateErrSeen.add(current.id);
            console.error(`[ui] update ${current.id}: ${e && e.message}
${(e && e.stack) || ''}`);
          }
        }
      }
    },

    resize(w, h, dpr) {
      viewport = { w, h, dpr: dpr || window.devicePixelRatio || 1 };
      const wide = w / h > 0.62 || w > 560;
      root.classList.toggle('is-wide', wide);
      for (const [, inst] of screens) {
        try { inst.resize?.(viewport.w, viewport.h, viewport.dpr); } catch (e) { console.error(e); }
      }
    },

    dispose() {
      disposed = true;
      for (const u of unsubs) { try { u(); } catch (_) { /* already gone */ } }
      unsubs.length = 0;
      for (const [, inst] of screens) { try { inst.destroy?.(); } catch (_) { /* ignore */ } }
      screens.clear();
      overlayStack = [];
      root.remove();
      C.setHapticSink(null);
    },

    /* ── Public API used by the integrator ──────────────────────────────── */
    show,
    back,
    toast,
    confirm,
    sheet,
    haptic,
    /** 0..1. Once called, the boot screen follows the integrator, not the clock. */
    setLoadingProgress(p) {
      externalProgress = clamp(Number(p) || 0, 0, 1);
      screens.get(SCENES.BOOT)?.setProgress?.(externalProgress);
    },
    /** Escape hatch for the integrator / QA harness. */
    get currentScene() { return current ? current.id : null; },
    get element() { return root; },
  };
}

export default createUI;
