/**
 * DRILLITY I THE GAME — bootstrap & frame loop.
 *
 * Owns: the ctx object, system lifecycle, the fixed-ish timestep loop, quality
 * probing and viewport handling. Systems are loaded tolerantly: a module that
 * is not yet written (or throws at import) is skipped with a console warning so
 * the app always boots during development.
 */
import * as THREE from 'three';
import {
  BRAND, QUALITY, SCENES, EVENTS, LAYOUT,
  createGameState, createBus, makeRandom, clamp,
} from './core/contract.js';

/* ── Device / quality probe ─────────────────────────────────────────────── */
function probeQuality() {
  const dpr = window.devicePixelRatio || 1;
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const gl = document.createElement('canvas').getContext('webgl2');
  const maxTex = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048;
  const small = Math.min(window.innerWidth, window.innerHeight) * dpr < 700;

  let score = 0;
  score += cores >= 8 ? 2 : cores >= 6 ? 1 : 0;
  score += mem >= 8 ? 2 : mem >= 4 ? 1 : 0;
  score += maxTex >= 8192 ? 1 : 0;
  score += small ? -1 : 0;
  if (score >= 4) return QUALITY.HIGH;
  if (score >= 2) return QUALITY.MEDIUM;
  return QUALITY.LOW;
}

/**
 * URL overrides, for the QA harness and for support ("open it with ?quality=low
 * and tell me if it still stutters"). Never used by the game itself.
 *   ?quality=low|medium|high   pin a tier, bypassing the device probe
 *   ?region=<id>&method=<id>   preselect for a demo contract
 *   ?shot                      preserveDrawingBuffer for frame capture
 */
const QS = new URLSearchParams(location.search);
function resolveQuality() {
  const forced = (QS.get('quality') || '').toUpperCase();
  if (QUALITY[forced]) return QUALITY[forced];
  return probeQuality();
}

/* ── Boot ───────────────────────────────────────────────────────────────── */
const ctx = {
  THREE,
  canvas: document.getElementById('gl'),
  uiRoot: document.getElementById('ui'),
  bus: createBus(),
  state: createGameState(),
  rand: makeRandom(Date.now() & 0xffff),
  quality: resolveQuality(),
  BRAND, EVENTS, SCENES, LAYOUT,
  qs: QS,
  clock: { t: 0, dt: 0, frame: 0, fps: 60 },
  systems: [],
};
window.__DRILLITY = ctx; // dev/QA handle — used by the screenshot harness

/**
 * System module map.
 *
 * These MUST be literal `import()` calls that the bundler can see. An earlier
 * version used `import(/* @vite-ignore *\/ path)` with a runtime string, which
 * silently excluded every subsystem from the production bundle — the dev server
 * was fine and the built single file was an empty shell.
 */
const MODULES = {
  renderer:    () => import('./core/renderer.js'),
  assets:      () => import('./core/assets.js'),
  env:         () => import('./core/env.js'),
  geology:     () => import('./world/geology.js'),
  terrain:     () => import('./world/terrain.js'),
  rig:         () => import('./rig/rigFactory.js'),
  sim:         () => import('./sim/drilling.js'),
  vfx:         () => import('./sim/vfx.js'),
  progression: () => import('./game/progression.js'),
  shopPreview: () => import('./core/preview.js'),
  audio:       () => import('./audio/audio.js'),
  ui:          () => import('./ui/shell.js'),
};

async function loadSystem(name, factoryName) {
  try {
    const loader = MODULES[name];
    if (!loader) throw new Error(`no module registered for "${name}"`);
    const mod = await loader();
    const factory = mod[factoryName] || mod.default;
    if (typeof factory !== 'function') throw new Error(`${name} has no ${factoryName}`);
    const sys = factory(ctx);
    sys.__name = name;
    ctx.systems.push(sys);
    ctx[name] = sys;
    return sys;
  } catch (e) {
    console.warn(`[boot] system "${name}" unavailable —`, e.message);
    return null;
  }
}

/**
 * The one failure the player must be told about in words.
 *
 * Deliberately standalone: plain DOM with inline styles, no dependency on
 * ui/shell.js, ui/components.js or styles.css, because a content failure may
 * well arrive alongside a UI that never mounted. The renderer keeps running
 * behind it — the world is still real, there is simply no work to do in it —
 * so this is a banner over a live scene, not a white page.
 *
 * @param {Error} err
 */
function showFatalContentError(err) {
  try {
    const wrap = document.createElement('div');
    wrap.id = 'content-error';
    wrap.setAttribute('role', 'alert');
    wrap.style.cssText = [
      'position:fixed', 'inset:auto 0 0 0', 'z-index:99999',
      'margin:0', 'padding:16px calc(16px + env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left))',
      'background:#1A1015', 'border-top:2px solid #EF4444',
      'color:#F4F6F8', 'font:600 13px/1.5 Inter,system-ui,-apple-system,sans-serif',
      '-webkit-font-smoothing:antialiased',
    ].join(';');

    const h = document.createElement('p');
    h.textContent = 'Content unavailable';
    h.style.cssText = 'margin:0 0 4px;font-size:15px;font-weight:800;color:#FCA5A5;letter-spacing:-0.01em';

    const p = document.createElement('p');
    p.textContent = 'The game content failed to load, so there is nothing to drill. '
      + 'This is a bug, not a network problem — please report it.';
    p.style.cssText = 'margin:0 0 6px;color:#AAB4C0;font-weight:500';

    const d = document.createElement('p');
    d.textContent = `game/data.js — ${err && err.message ? err.message : String(err)}`;
    d.style.cssText = 'margin:0;font:500 11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;'
      + 'color:#7C8794;word-break:break-word';

    wrap.append(h, p, d);
    (document.body || document.documentElement).appendChild(wrap);
  } catch (e) {
    // Never let the error reporter become the error.
    console.error('[boot] could not render the content-error banner', e);
  }
}

async function boot() {
  /**
   * game/data.js is the content authority — every method, region, rig,
   * certificate, item and contract in the game. It is a plain module, not a
   * system, and it is NOT optional.
   *
   * The production build inlines everything into one file, so this import
   * cannot fail for network reasons; it can only fail if the module throws at
   * its own top level. That is a content bug, and the game that survives it has
   * no items, no contracts and no economy. The UI now degrades honestly to
   * empty states rather than substituting a parallel set of tables, so what is
   * left is a playable-looking shell with nothing in it — which is exactly the
   * thing worth saying out loud instead of a console warning nobody reads.
   */
  try {
    ctx.data = await import('./game/data.js');
    // The UI reads the content tables as `ctx.game`; keep both names pointing
    // at the same namespace so neither side has to know about the other.
    ctx.game = ctx.data;
  } catch (e) {
    console.error('[boot] FATAL: game/data.js failed to load —', e);
    ctx.data = null;
    ctx.game = null;
    ctx.contentError = e;
    showFatalContentError(e);
  }

  // Order matters: renderer → assets → env → world → rig → sim → vfx → ui → audio
  await loadSystem('renderer', 'createRenderer');
  await loadSystem('assets', 'createAssets');
  await loadSystem('env', 'createEnvironment');
  await loadSystem('geology', 'createGeology');
  await loadSystem('terrain', 'createTerrain');
  await loadSystem('rig', 'createRigSystem');
  await loadSystem('sim', 'createDrillSim');
  await loadSystem('vfx', 'createVFX');
  await loadSystem('progression', 'createProgression');
  await loadSystem('shopPreview', 'createPreview');
  await loadSystem('audio', 'createAudio');
  await loadSystem('ui', 'createUI');

  // Initialise, driving the boot screen's progress rule as we go. The UI is
  // deliberately initialised first and separately so it can show the boot
  // screen while the heavy systems (textures, geometry) come up behind it.
  const ui = ctx.ui;
  if (ui?.init) { try { await ui.init(); } catch (e) { console.error('[init] ui', e); } }

  const rest = ctx.systems.filter((s) => s !== ui);
  for (let i = 0; i < rest.length; i++) {
    const s = rest[i];
    try { ui?.setLoadingProgress?.(i / rest.length, s.__name); } catch { /* non-fatal */ }
    if (s.init) { try { await s.init(); } catch (e) { console.error(`[init] ${s.__name}`, e); } }
    // Yield so the boot screen can actually paint between heavy systems.
    await new Promise((r) => requestAnimationFrame(() => r()));
  }
  try { ui?.setLoadingProgress?.(1, 'ready'); } catch { /* non-fatal */ }

  // Audio can only start from a user gesture.
  const unlockAudio = () => { try { ctx.audio?.unlock?.(); } catch { /* ignore */ } };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));

  installQABridge();

  document.body.classList.add('booted');
  requestAnimationFrame(frame);

  // Hand the shell the menu explicitly. Emitting SCENE_CHANGE alone is not
  // enough — the shell is the *emitter* of that event, so it does not listen to
  // its own signal, and the boot screen would sit opaque over the world forever.
  ctx.state.scene = SCENES.MENU;
  if (ctx.ui?.show) ctx.ui.show(SCENES.MENU);
  else ctx.bus.emit(EVENTS.SCENE_CHANGE, { scene: SCENES.MENU });
}

/**
 * QA bridge — used by tools/shoot.mjs to drive the game into named states for
 * visual review. Kept tiny and entirely defensive; it never affects play.
 */
function installQABridge() {
  ctx.__qa = {
    /**
     * Put the game into a live drilling state at a given depth.
     * Picks a real generated contract whose target is comfortably deeper than
     * the requested depth — otherwise the sim completes the hole the instant we
     * seek, and the harness photographs the results screen instead of the HUD.
     */
    async startDemoContract(opts = {}) {
      const { depth = 10, method = null, region = null } = opts;
      const wantTarget = depth + 30;
      let contract = null;

      const data = ctx.data;
      if (data?.makeContract) {
        const regionId = region || data.REGIONS?.[0]?.id || 'nordic';
        for (let i = 0; i < 40 && !contract; i++) {
          const c = data.makeContract(regionId, Math.max(ctx.state.player.level, 20), ctx.rand);
          if (!c) break;
          if (method && c.methodId !== method) continue;
          if ((c.targetDepth || 0) < wantTarget) continue;
          contract = c;
        }
        // Nothing generated deep enough for this method — take any contract of
        // the right method and deepen it rather than falling back to a stub.
        if (!contract) {
          for (let i = 0; i < 40 && !contract; i++) {
            const c = data.makeContract(regionId, Math.max(ctx.state.player.level, 20), ctx.rand);
            if (c && (!method || c.methodId === method)) contract = c;
          }
          if (contract) contract.targetDepth = Math.max(contract.targetDepth || 0, wantTarget);
        }
      }

      if (!contract) {
        contract = {
          id: 'qa-demo', client: 'QA Harness', regionId: region || 'nordic',
          methodId: method || 'dth', applicationId: 'water-well',
          targetDepth: wantTarget, holeDia: 152, holes: 1,
          payout: 12000, deadlineHours: 24, difficulty: 2, requiredCerts: [],
        };
      }

      ctx.state.contract = contract;
      ctx.state.world.regionId = contract.regionId;
      ctx.bus.emit(EVENTS.REGION_CHANGE, { regionId: contract.regionId });
      ctx.env?.setRegion?.(contract.regionId);
      ctx.terrain?.setRegion?.(contract.regionId);
      ctx.audio?.setRegion?.(contract.regionId);
      ctx.geology?.generateProfile?.({
        regionId: contract.regionId,
        applicationId: contract.applicationId,
        targetDepth: contract.targetDepth,
        seed: 1337,
        difficulty: contract.difficulty ?? 2,
      });
      ctx.rig?.setMethod?.(contract.methodId);
      ctx.sim?.startHole?.(contract);

      const seek = Math.min(depth, (contract.targetDepth || wantTarget) - 12);
      if (ctx.sim?.debug?.setDepth) ctx.sim.debug.setDepth(seek);
      else ctx.state.drill.depth = seek;
      ctx.geology?.setDepth?.(seek);
      ctx.ui?.show?.(SCENES.SITE);
      return contract;
    },

    /**
     * Drive the results screen for review shots.
     *
     * The old payload claimed 48.2 m in 412 s — 421 m/h, which no drilling
     * method can do, so the screen always printed its clamp ceiling of
     * 200.0 m/h. It also passed the payload FLAT while the real HOLE_COMPLETE
     * bridge wraps it as `{ result }`, so `timeSec` was never read and the
     * reference shot showed 00:02. Both fixed: a plausible 8.3 m/h run, and the
     * same shape the live bridge sends.
     */
    showResults() {
      const depth = ctx.state.drill.depth || 28.5;
      const timeSec = Math.round((depth / 8.3) * 3600);   // 8.3 m/h — a real rate
      const result = {
        depth,
        timeSec,
        grade: 'B',
        breakdown: {
          parSec: Math.round(timeSec * 0.86), actualSec: timeSec,
          grooveUptime: 0.63, bestCombo: 1.74,
          bitConsumed: 0.41, crownsChanged: 0,
          deviation: 0.26,
          hazardsSeen: 3, hazardsClean: 2,
          safetyEvents: 1, jamIncidents: 1,
          rodsAdded: 9, total: 0.51,
        },
      };
      ctx.bus.emit(EVENTS.HOLE_COMPLETE, result);
      ctx.ui?.show?.(SCENES.RESULTS, { result });
    },

    setScene(id) { ctx.ui?.show?.(id); },
    state: () => ctx.state,
  };
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, ctx.quality.dprCap);
  ctx.viewport = { w, h, dpr };
  for (const s of ctx.systems) { if (s.resize) { try { s.resize(w, h, dpr); } catch (e) { console.error(e); } } }
}

/* ── Loop ───────────────────────────────────────────────────────────────── */
let last = performance.now();
let fpsAccum = 0, fpsFrames = 0;

function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000;
  last = now;
  dt = clamp(dt, 0, 1 / 15); // never step more than a 15fps frame

  ctx.clock.dt = dt;
  ctx.clock.t += dt;
  ctx.clock.frame++;
  ctx.state.tSec += dt;

  fpsAccum += dt; fpsFrames++;
  if (fpsAccum >= 0.5) { ctx.clock.fps = fpsFrames / fpsAccum; fpsAccum = 0; fpsFrames = 0; }

  for (const s of ctx.systems) {
    if (s.update) { try { s.update(dt, ctx.state); } catch (e) { console.error(`[update] ${s.__name}`, e); } }
  }

  // Sim → audio telemetry pump (audio never reaches into the sim itself).
  if (ctx.audio?.setDrillState && ctx.sim?.getTelemetry) {
    try { ctx.audio.setDrillState(ctx.sim.getTelemetry()); } catch { /* non-fatal */ }
  }

  if (ctx.renderer && ctx.renderer.render) ctx.renderer.render(dt);
}

boot();
