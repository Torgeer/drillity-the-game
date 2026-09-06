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
  /**
   * THE BOOT TIMELINE, MEASURED — see `mark()`.
   *
   * Read by `tools/bootprobe.mjs`. This is not debug scaffolding: boot is a
   * ~28 s stall and until this array existed the project had no way to say
   * what the 28 s WAS. Three harnesses had already reported confidently on it
   * after a fixed 1.5–2.2 s wait (ASTRA §8).
   */
  bootMarks: [],
};
window.__DRILLITY = ctx; // dev/QA handle — used by the screenshot harness

/**
 * Stamp one phase of boot, with the GL program count at that moment.
 *
 * `renderer.info.programs.length` is the number that matters for shader
 * compilation, and taking it per phase is what lets a stall be attributed to
 * the system that caused it rather than to the phase it surfaced in.
 *
 * @param {string} name  phase id — also the key BOOT_WEIGHTS is written in
 * @param {number} t0    performance.now() when the phase started
 * @returns {number} the phase's duration in ms
 */
/**
 * HOW MUCH OF THE BAR THE SYSTEMS PHASE IS ALLOWED TO SPEND.
 *
 * Not a taste decision — a measured ratio, and it has to be re-measured
 * whenever either side moves. `node tools/bootprobe.mjs --dist`, cold profile,
 * 390x844@2, median of three runs of the shipped single file:
 *
 *   modules + every init()      1.90 s
 *   shader warm-up             ~4.4 s   (was 17.9 s on the first frame)
 *
 * 1.90 / 6.3 = 0.30. A bar that gave the systems half of its travel would sit
 * at 50 % for two thirds of the wait, which is the "90 % for twenty seconds"
 * failure with different numbers. The shader half is not eased at all: it is
 * driven by the count of programs the DRIVER reports finished.
 */
const SYSTEMS_SHARE = 0.30;

/**
 * Publish the boot phase, and drive the bar from it.
 *
 * `ui.setLoadingProgress(p)` takes only a number — ui/shell.js drops the label
 * argument main.js has always passed — so the boot screen used to INVENT its
 * own caption by indexing a hardcoded list of eleven names with the progress
 * fraction. That caption was therefore a restatement of the percentage, not a
 * report of what was happening: it read "Audio" while the GPU was compiling
 * geology's strata shader. `ctx.bootPhase` is the real thing, and
 * ui/screens/boot.js reads it.
 *
 * @param {string} name   the phase id — a system's `__name`, or 'shaders'
 * @param {number} p      0..1 overall boot progress
 * @param {number} [done] units finished within this phase, when it has any
 * @param {number} [total]
 */
function setPhase(name, p, done, total) {
  ctx.bootPhase = { name, p, done: done ?? null, total: total ?? null };
  try { ctx.ui?.setLoadingProgress?.(p, name); } catch { /* non-fatal */ }
}

function mark(name, t0) {
  const ms = performance.now() - t0;
  let programs = null;
  try { programs = ctx.renderer?.info?.programs?.length ?? null; } catch { /* pre-renderer */ }
  ctx.bootMarks.push({ name, ms: +ms.toFixed(1), at: +performance.now().toFixed(1), programs });
  return ms;
}

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
  gltfRigs:    () => import('./core/gltfRig.js'),
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
  const t0 = performance.now();
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
    mark('load:' + name, t0);
    return sys;
  } catch (e) {
    mark('load:' + name, t0);
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

/**
 * THE BLENDER MACHINES — which ones are fetched, and when.
 *
 * `src/core/gltfRig.js` streams a `.glb` per machine from `models/` rather
 * than carrying it in the single-file bundle (see vite.config.js). The rule
 * this function exists to enforce is: **only the machines the player owns**.
 * Never the fleet. Eighteen machines are never in memory at once, and a player
 * who owns one crawler fetches one crawler.
 *
 * "Owns" is `state.unlocked.rigs` — the machines they can actually select —
 * plus whatever is in the garage right now, which on a fresh save is the same
 * single machine. Typically one to three ids.
 */
function ownedRigIds() {
  const st = ctx.state || {};
  const owned = (st.unlocked && st.unlocked.rigs) || [];
  const inGarage = st.garage && st.garage.rigId;
  return inGarage ? owned.concat([inGarage]) : owned.slice();
}

/**
 * Fetch the models for the owned machines.
 *
 * At boot this is AWAITED, because rigFactory caches a build per rig id and
 * the first build wins: a model that lands after the machine has been built
 * procedurally will not be seen until the next session. Everywhere else it is
 * fire-and-forget — the machine on screen is already correct, and the fetch is
 * warming the one the player is about to be able to pick.
 *
 * The boot await is RACED against a timeout. A model is served from the same
 * origin as the page, so it should arrive in milliseconds; if something is
 * wrong with the host, the game must still boot rather than hang on a splash
 * screen. A slow model then simply misses this session, and says so.
 */
const MODEL_BOOT_TIMEOUT_MS = 4000;

/* The entrance reuses an owned Blender machine already loaded for the game.
 * There is no separate title asset in the build pipeline. Do not request one:
 * that made every boot fail models/title/title.glb and display no title.
 * Preparation runs beside shader warm-up and is cancelled at the hand-off.
 * A device without parallel shader compilation keeps the DOM loading screen.
 */
const TITLE_CLIP = 'title'; // Optional authored choreography; otherwise a still.

/**
 * Frame the composition from its OWN measured bounds.
 *
 * Not a hardcoded eye position: the title model is authored in Blender by a
 * different file and its size is that file's business, so a literal here
 * would be a second table describing one thing — ASTRA §5's most expensive
 * failure pattern. `focusOn()` is not used either; it frames by bounding
 * SPHERE, which for a machine with a tall mast is far larger than its
 * on-screen extent and would leave the subject at a third of the height.
 *
 * A 3/4 azimuth at a low elevation, distance solved so the composition fills
 * `FILL` of whichever axis binds first at 390x844 portrait.
 */
function frameTitle(root) {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return null;
  const size = box.getSize(new THREE.Vector3());
  const mid = box.getCenter(new THREE.Vector3());

  const FOV = 34;                     // matches CAMERA_MODES.hero — the same lens
  /* Sized against the aperture the boot screen leaves, not against the stage:
     ui/screens/boot.js re-lays itself 8:52:6 when a title is live, so the
     lockup and the rule own the top ~30 % and the field fact the bottom ~14 %.
     0.62 of the stage height, dropped 12 % below the frame centre, lands the
     crown just under the rule and the tracks just above the fact block. */
  const FILL = 0.62;
  const DROP = 0.12;                  // how far below frame centre the subject sits
  const AZ = THREE.MathUtils.degToRad(38);   // 3/4, from the machine's right
  const EL = THREE.MathUtils.degToRad(11);   // low: a mast reads taller from below

  const stage = ctx.stage || { w: 390, h: 844 };
  const aspect = stage.w / Math.max(1, stage.h);
  const halfV = Math.tan(THREE.MathUtils.degToRad(FOV) * 0.5);
  const halfH = halfV * aspect;

  /* The horizontal extent a 3/4 view actually presents is the diagonal of the
     footprint, not either side of it. */
  const wide = Math.hypot(size.x, size.z);
  const distV = (size.y * 0.5) / (halfV * FILL);
  const distH = (wide * 0.5) / (halfH * FILL);
  const dist = Math.max(distV, distH, 4);

  /* Look ABOVE the box centre, which pushes the subject DOWN the frame — the
     sign is easy to get backwards. Everything above the look point is drawn
     above the frame centre, so raising the look point lowers the machine into
     the gap the boot layout opens for it. */
  const look = new THREE.Vector3(mid.x, mid.y + size.y * DROP, mid.z);
  const pos = new THREE.Vector3(
    look.x + Math.sin(AZ) * Math.cos(EL) * dist,
    look.y + Math.sin(EL) * dist,
    look.z + Math.cos(AZ) * Math.cos(EL) * dist,
  );
  return { pos: pos.toArray(), look: look.toArray(), fov: FOV, size, dist };
}

/**
 * Light the title. Three lights, and they are this scene's alone.
 *
 * core/env.js owns every light in the GAME — that is its rule and this does
 * not break it, because the title stage is a separate scene that is deleted
 * before the game is on screen. It borrows env's IBL if one exists by then
 * (free: already baked) and reads perfectly well without one.
 */
function lightTitle(sc) {
  const key = new THREE.DirectionalLight(0xffe0a6, 3.1);   // BRAND-warm, as env's sun
  key.position.set(6.2, 5.4, 4.8);
  const fill = new THREE.DirectionalLight(0xbcd2e8, 0.55); // cool sky bounce
  fill.position.set(-5.0, 2.4, -3.0);
  const amb = new THREE.HemisphereLight(0x9fb6cc, 0x2a231c, 0.85);
  sc.add(key, fill, amb);
  try { if (ctx.scene && ctx.scene.environment) sc.environment = ctx.scene.environment; }
  catch { /* no IBL yet — the three lights carry it */ }
}

/** The independently disposable copy shown only while the game warms. */
let title = null;
let booting = true;
let loopRunning = false;
const titleMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');

function startFrameLoop() {
  if (loopRunning) return;
  loopRunning = true;
  last = performance.now();
  requestAnimationFrame(frame);
}

/**
 * No fetch and no awaited delay: use only a model that is ALREADY PARSED.
 *
 * TITLE_RIG is the machine the game opens on, chosen for the picture rather
 * than for what the player owns: a piling leader is the tallest, most
 * immediately readable silhouette in the fleet, and a Rookie owns a
 * `crawler-lite`, which reads as a small box at title framing.
 *
 * It is preferred, NOT required. `warmOwnedModels()` fetches it alongside the
 * owned machines, inside the await and the timeout that step already has, so
 * the title costs no extra boot phase — and if that fetch fails or times out
 * the list falls through to the garage rig exactly as before. The one rule
 * this function must keep is that it never fetches: `g.has()` is a
 * parsed-and-resident test, and a title that awaited a model would add its
 * fetch to a boot that is already a 27.8 s shader compile.
 */
let TITLE_RIG = 'piling-leader';

/**
 * A DIFFERENT MACHINE ON EVERY LOAD.
 *
 * The fleet is nineteen machines and the boot screen is the one place the
 * player reliably looks at one for several seconds, so showing the same rig
 * every time wastes the whole fleet. This picks one per boot.
 *
 * The list is READ FROM `data.js`, never restated here: a hardcoded copy is the
 * "two tables describing one thing" drift ASTRA §5 is about, and it would go
 * stale the first time a machine is added. `rigRenderId()` maps a rig to the
 * model that can actually be built, which is why `pd55` correctly shows as the
 * piling leader rather than failing to resolve.
 *
 * It avoids repeating the previous boot's pick, because two identical loads in
 * a row read as "it always shows this one" and undo the point. That memory is
 * a nicety, so every localStorage access is wrapped — a private window or
 * blocked site data must not break the title.
 */
function pickTitleRig() {
  const d = ctx.data;
  if (!d?.RIGS?.length || typeof d.rigRenderId !== 'function') return TITLE_RIG;
  const ids = [...new Set(d.RIGS.map((r) => d.rigRenderId(r.id)).filter(Boolean))];
  if (!ids.length) return TITLE_RIG;
  let last = null;
  try { last = localStorage.getItem('drillity.titleRig'); } catch (e) { /* private window */ }
  const pool = ids.length > 1 ? ids.filter((id) => id !== last) : ids;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  try { localStorage.setItem('drillity.titleRig', pick); } catch (e) { /* ignore */ }
  return pick;
}

async function startTitle() {
  const r = ctx.renderer;
  const g = ctx.gltfRigs;
  const t0 = performance.now();
  const id = [TITLE_RIG, ctx.state.garage?.rigId, ...ownedRigIds()]
    .find((rid) => rid && g?.has(rid));
  const report = ctx.bootTitle = { rigId: id || null, status: 'unavailable', frames: 0 };
  if (!r?.warmTitle || !id) return;

  try {
    const build = g.builder(id);
    if (!build) return;
    const built = build();
    if (!built?.root) return;
    // Own the copy before any step that can fail, so the failure path frees it.
    title = built;
    r.titleScene.add(built.root);
    const framing = frameTitle(built.root);
    if (!framing) { endTitle(); return; }
    lightTitle(r.titleScene);
    r.setTitleCamera(framing.pos, framing.look, framing.fov);
    report.status = 'compiling';
    const warm = await r.warmTitle();
    Object.assign(report, { programs: warm.programs, readyMs: +warm.ms.toFixed(1) });
    if (!booting || title !== built) return;
    if (!warm.ready) {
      report.status = warm.reason;
      endTitle();
      return;
    }
    // A static machine remains a complete title when there is no authored clip.
    if (!reducedTitleMotion() && built.dyn?.anim?.has(TITLE_CLIP)) {
      built.dyn.anim.play(TITLE_CLIP, { loop: true, fadeIn: 0 });
    }
    r.beginTitle();
    report.status = 'visible';
    report.visibleAt = performance.now();
  } catch (e) {
    report.status = 'failed';
    console.info('[boot] title unavailable —', e && e.message);
    endTitle();
  } finally {
    mark('title', t0);
  }
}

function reducedTitleMotion() {
  return !!ctx.state.settings?.reducedMotion
    || !!titleMotionQuery?.matches;
}

/** Cancels pending compilation too; a late title must never cover the menu. */
function endTitle() {
  const report = ctx.bootTitle;
  if (report?.status === 'visible') {
    report.shownMs = +(performance.now() - report.visibleAt).toFixed(1);
    report.status = 'complete';
  } else if (report?.status === 'compiling') {
    report.status = 'skipped-ready';
  }
  try { title?.dyn?.anim?.stopAll?.(); } catch { /* noop */ }
  try { ctx.renderer?.endTitle?.(); } catch { /* noop */ }
  title = null;
}

async function warmOwnedModels(blocking) {
  const g = ctx.gltfRigs;
  if (!g) return;
  /* TITLE_RIG rides along with the owned machines rather than getting a fetch
     of its own, so the title screen's hero costs no extra boot phase and is
     covered by the same timeout. It is deduped against the owned set because a
     player who has bought it must not fetch it twice. */
  /* Choose the boot's hero HERE, not in startTitle(), because this is the step
     that fetches it — picking later would mean asking for a model nobody
     warmed. `pickTitleRig()` needs ctx.data, which is loaded before this runs. */
  TITLE_RIG = pickTitleRig();
  const ids = [...new Set([TITLE_RIG, ...ownedRigIds()])].filter((id) => id && !g.has(id));
  if (!ids.length) return;
  const work = g.warm(ids).then((rows) => {
    /* Only report machines the player actually HAS. TITLE_RIG is fetched for
       the title picture, so a failure there costs a nicer hero and nothing
       else — startTitle() falls through to the garage rig on its own. Telling
       a Rookie their piling leader is broken would be alarming and false: they
       do not own one. It is still logged, because a silent fetch failure is
       how the six-of-eight machine bug stayed hidden (ASTRA §4 contract 4). */
    const owned = new Set(ownedRigIds());
    const allBad = rows.filter((r) => !r.ok).map((r) => r.id);
    const bad = allBad.filter((id) => owned.has(id));
    for (const id of allBad) {
      if (!owned.has(id)) console.warn('[boot] title rig "%s" did not load; using an owned machine instead', id);
    }
    if (bad.length) showModelError(bad, g.problems());
  });
  if (!blocking) return;
  let timer = null;
  await Promise.race([
    work.finally(() => clearTimeout(timer)),
    new Promise((r) => {
      timer = setTimeout(() => {
        console.warn('[boot] machine models did not arrive within '
          + MODEL_BOOT_TIMEOUT_MS + ' ms — booting without them');
        r();
      }, MODEL_BOOT_TIMEOUT_MS);
    }),
  ]);
}

/**
 * A machine did not load. Say so where it cannot be missed.
 *
 * This is deliberately loud (HANDOFF §8A). The models ship with the build, so
 * a missing one is a bug and not a network condition, and the failure it
 * replaces — quietly drawing something else and letting three review rounds
 * photograph it — is the single most expensive pattern in this project's
 * history. Standalone DOM with inline styles, for the same reason
 * `showFatalContentError` is: the UI may not have mounted.
 */
function showModelError(ids, problems) {
  try {
    let wrap = document.getElementById('model-error');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'model-error';
      wrap.setAttribute('role', 'alert');
      wrap.style.cssText = [
        'position:fixed', 'inset:auto 0 0 0', 'z-index:99998',
        'margin:0', 'padding:14px calc(14px + env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom)) calc(14px + env(safe-area-inset-left))',
        'background:#1A1610', 'border-top:2px solid #F59E0B',
        'color:#F4F6F8', 'font:600 13px/1.5 Inter,system-ui,-apple-system,sans-serif',
        '-webkit-font-smoothing:antialiased',
      ].join(';');
      (document.body || document.documentElement).appendChild(wrap);
    }
    wrap.textContent = '';

    const h = document.createElement('p');
    h.textContent = 'Machine model unavailable';
    h.style.cssText = 'margin:0 0 4px;font-size:15px;font-weight:800;color:#FCD34D;letter-spacing:-0.01em';

    const p = document.createElement('p');
    p.textContent = ids.join(', ') + ' could not be loaded. '
      + 'The machine you see is the same rig drawn the old way, not a different '
      + 'machine — but this is a bug, please report it.';
    p.style.cssText = 'margin:0 0 6px;color:#C9BFAE;font-weight:500';

    const d = document.createElement('p');
    d.textContent = (problems || []).map((x) => x.id + ' — ' + x.message).join('  ·  ');
    d.style.cssText = 'margin:0;font:500 11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;'
      + 'color:#8A8172;word-break:break-word';

    wrap.append(h, p, d);
  } catch (e) {
    console.error('[boot] could not render the model-error banner', e);
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
  const tData = performance.now();
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
  mark('data', tData);

  // Order matters: renderer → assets → env → world → rig → sim → vfx → ui → audio
  await loadSystem('renderer', 'createRenderer');
  await loadSystem('assets', 'createAssets');
  await loadSystem('gltfRigs', 'createGltfRigs');
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
  {
    const t0 = performance.now();
    if (ui?.init) { try { await ui.init(); } catch (e) { console.error('[init] ui', e); } }
    mark('init:ui', t0);
  }

  const rest = ctx.systems.filter((s) => s !== ui);
  for (let i = 0; i < rest.length; i++) {
    const s = rest[i];
    setPhase(s.__name, SYSTEMS_SHARE * (i / rest.length));
    // The Blender machines must be in memory BEFORE rigFactory runs, because
    // its build cache is keyed by rig id and the first build of an id wins.
    if (s.__name === 'rig') {
      setPhase('models', SYSTEMS_SHARE * (i / rest.length));
      const tm = performance.now();
      await warmOwnedModels(true);
      mark('models', tm);
    }
    const t0 = performance.now();
    if (s.init) { try { await s.init(); } catch (e) { console.error(`[init] ${s.__name}`, e); } }
    mark('init:' + s.__name, t0);
    // Yield so the boot screen can actually paint between heavy systems.
    await new Promise((r) => requestAnimationFrame(() => r()));
  }
  // Keep the loading UI responsive while the GPU compiles. Game systems and
  // their first-frame measurements stay paused until the warm-up completes.
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));
  startFrameLoop();
  void startTitle();

  setPhase('shaders', SYSTEMS_SHARE);

  /**
   * THE 19 SECONDS.
   *
   * Everything above is under two seconds; the first rendered frame used to
   * be seventeen, because ANGLE links a program asynchronously and three.js
   * then blocks on `getProgramInfoLog` for each one in turn — 66 programs
   * compiled one at a time. `warmShaders()` hands the driver the whole batch
   * first and polls a non-blocking completion query, which is both the fix
   * and the only source of true progress this screen has ever had.
   * See the SHADER WARM-UP note in core/renderer.js for the measurements.
   *
   * Awaited, not fired and forgotten: the point is to finish the compiles
   * while the boot screen is up rather than during the first frame the player
   * is looking at. It cannot hang the boot — `warmShaders()` carries its own
   * deadline, and anything unfinished simply costs what it always did.
   */
  {
    const tw = performance.now();
    let warm = null;
    try {
      warm = await ctx.renderer?.warmShaders?.((done, total) => {
        setPhase('shaders', SYSTEMS_SHARE + (1 - SYSTEMS_SHARE) * (total ? done / total : 1), done, total);
      });
    } catch (e) { console.warn('[boot] shader warm-up failed —', e && e.message); }
    mark('shaders', tw);
    if (warm) {
      ctx.bootWarm = warm;
      const readiness = warm.parallel
        ? `${warm.done ?? 0}/${warm.total ?? warm.programs} driver-ready, ${warm.retired ?? 0} retired, ${warm.failed ?? 0} failed`
        : 'driver readiness unavailable — this device pays on first use';
      console.info(`[boot] ${warm.programs} shader programs queued in ${Math.round(warm.ms)} ms`
        + ` (${warm.post} post-chain; ${readiness}; ${warm.reason || 'unmeasured'})`);
    }
  }
  setPhase('ready', 1);
  booting = false;
  endTitle();

  // Audio can only start from a user gesture.
  const unlockAudio = () => { try { ctx.audio?.unlock?.(); } catch { /* ignore */ } };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  /**
   * Keep the owned set warm.
   *
   * A rig change is announced SYNCHRONOUSLY on the bus and a fetch is not, so
   * warming on RIG_CHANGE alone would always be one step late. The set is
   * therefore warmed when a screen the player can change machines on opens —
   * the garage and the shop — which is minutes of wall-clock before they press
   * anything. RIG_CHANGE is still handled, for the machine they have just
   * bought and for the next time they select it.
   */
  const rewarm = () => { warmOwnedModels(false); };
  ctx.bus.on(EVENTS.RIG_CHANGE, rewarm);
  ctx.bus.on(EVENTS.SCENE_CHANGE, (p) => {
    const sc = p && p.scene;
    if (sc === SCENES.GARAGE || sc === SCENES.SHOP) rewarm();
  });

  installQABridge();

  document.body.classList.add('booted');
  startFrameLoop();

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
        /* SEARCH A REGION THAT ACTUALLY OFFERS THE METHOD.
           This used to take REGIONS[0] and try forty times. A method that is
           not offered in that one region could never be generated, so five of
           the six modes a reviewer asks for fell through to the stub below —
           and the stub was silent. */
        /* ASK AT A LEVEL WHERE THE METHOD EXISTS.
           This asked at `max(player.level, 20)`. Measured unlock levels:
           rockbolt 29, driven-pile 33, tunnel-jumbo 36, hdd 38,
           raise-boring 52. So `methodsForRegion(id, 20)` excluded all five,
           the region search found nowhere that offered them, and
           `makeContract` could never generate one — which is the whole reason
           five of six reviewed methods reached the stub. The three that DID
           work are exactly the three at or below 20: dth 10, core 18,
           cable-tool 3.

           A harness reviewing a method has to ask at a level where the method
           is playable. */
        const qaLevel = data.MAX_LEVEL || 60;
        let regionId = region || data.REGIONS?.[0]?.id || 'nordic';
        if (method && !region && data.methodsForRegion) {
          const lvl = qaLevel;
          const home = (data.REGIONS || []).find((r) => {
            try { return data.methodsForRegion(r.id, lvl).some((m) => m.id === method); }
            catch (e) { return false; }
          });
          if (home) regionId = home.id;
        }
        for (let i = 0; i < 40 && !contract; i++) {
          const c = data.makeContract(regionId, qaLevel, ctx.rand);
          if (!c) break;
          if (method && c.methodId !== method) continue;
          if ((c.targetDepth || 0) < wantTarget) continue;
          contract = c;
        }
        // Nothing generated deep enough for this method — take any contract of
        // the right method and deepen it rather than falling back to a stub.
        if (!contract) {
          /* 40 tries was not enough. `makeContract()` picks a method by weight
             from everything the region offers, so a method competing with
             twenty others needs far more draws than that to come up — which is
             why five of six reviewed methods reached the stub. Real contracts
             beat a stub every time: they carry a true application, archetype,
             ground column and difficulty. */
          for (let i = 0; i < 400 && !contract; i++) {
            const c = data.makeContract(regionId, qaLevel, ctx.rand);
            if (c && (!method || c.methodId === method)) contract = c;
          }
          if (contract) contract.targetDepth = Math.max(contract.targetDepth || 0, wantTarget);
        }
      }

      if (!contract) {
        /* THE STUB IS THE REVIEW INSTRUMENT LYING TO THE REVIEWER.
           It hardcoded `holeDia: 152` and `applicationId: 'water-well'` for
           EVERY method. Measured: that is outside the method's own
           `holeDiaRange` for raise-boring [600,6000], tunnel-jumbo [32,64],
           rockbolt [28,64] and driven-pile [200,1000] — so `holeR`, and with
           it `boreExag`, the annulus, the casing, the pilot and every boulder
           (sized as a multiple of holeR) were wrong in five of six captures.
           On a 152 mm "raise" the pilot stem clamps to 228 mm and gets drawn
           22 % WIDER than the raise it sits inside.

           It also generated a water-well stratigraphy for a tunnel heading,
           and left `archetype` null so terrain.js logged a missing archetype
           and dressed the site from a fallback.

           Every number below is now derived from the method's own row, and it
           SAYS it is a stub. ASTRA.md §8: a silent fallback that works is the
           most expensive kind of failure — and this one lived inside the
           instrument used to review everything else. */
        const mid = method || 'dth';
        const m = data?.METHODS?.find?.((x) => x.id === mid) || null;
        const dia = m
          ? Math.round(m.nominalDia
            || ((m.holeDiaRange?.[0] || 100) + (m.holeDiaRange?.[1] || 200)) / 2)
          : 152;
        const app = m?.applications?.[0] || 'water-well';
        const rid = region || 'nordic';
        let arch = null;
        try { arch = data?.archetypesFor?.(mid, rid, app)?.[0] || m?.archetypes?.[0] || null; }
        catch (e) { arch = m?.archetypes?.[0] || null; }

        if (typeof console !== 'undefined') {
          console.warn(`[qa] no generated contract for "${mid}" — using a STUB. `
            + `Derived from the method row: Ø${dia} mm, application "${app}", `
            + `archetype "${arch || 'none'}". This is not a contract the board can `
            + 'deal, so difficulty, payout and ground are not representative.'
            + (m ? '' : ` And "${mid}" is not in data.js METHODS at all.`));
        }

        contract = {
          id: 'qa-demo', client: 'QA Harness', regionId: rid,
          methodId: mid, applicationId: app, archetype: arch,
          sitePlane: arch && data?.getArchetype?.(arch)?.plane || 'surface',
          targetDepth: wantTarget, holeDia: dia, holes: 1,
          payout: 12000, deadlineHours: 24, difficulty: 2, requiredCerts: [],
          __stub: true,
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
        // The stub used to omit these, so the strata were generated for a
        // water well whatever method was being reviewed.
        methodId: contract.methodId,
        archetype: contract.archetype || null,
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
      // A review fixture is an unpaid preview, never a career completion.
      ctx.ui?.show?.(SCENES.RESULTS, { result, preview: true });
    },

    setScene(id) { ctx.ui?.show?.(id); },
    state: () => ctx.state,

    /**
     * What the Blender pipeline actually delivered this session — measured,
     * not assumed. `prims` is the draw-call floor for the rig; compare it with
     * `renderer.info.render.calls`. `problems` is every model that was asked
     * for and did not arrive.
     */
    models() {
      const g = ctx.gltfRigs;
      if (!g) return { available: false };
      return {
        available: true,
        owned: ownedRigIds(),
        loaded: g.loaded().map((id) => g.info(id)),
        problems: g.problems(),
        log: g.logLines(),
      };
    },
    async loadModel(id) {
      if (!ctx.gltfRigs) throw new Error('gltfRigs system is not up');
      await ctx.gltfRigs.load(id);
      return ctx.gltfRigs.info(id);
    },
  };
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, ctx.quality.dprCap);
  ctx.viewport = { w, h, dpr };
  for (const s of ctx.systems) { if (s.resize) { try { s.resize(w, h, dpr); } catch (e) { console.error(e); } } }
  if (title) {
    const framing = frameTitle(title.root);
    if (framing) ctx.renderer?.setTitleCamera(framing.pos, framing.look, framing.fov);
  }
}

/* ── Loop ───────────────────────────────────────────────────────────────── */
let last = performance.now();
let fpsAccum = 0, fpsFrames = 0;

/**
 * PER-SYSTEM COST OF THE FIRST FRAMES — `ctx.bootFrames`.
 *
 * The most expensive single event in this game's life is FRAME 1, and no
 * instrument in the project could see inside it. `tools/bootprobe.mjs`
 * measured the whole of boot() at 1.7–1.9 s and then one 17.7 s rAF gap
 * immediately after it, which is where the "27.8 s boot" actually lives. A
 * per-system table for the first few frames is the only thing that can name
 * the system responsible, so it is collected — for a bounded number of frames,
 * then never again.
 *
 * `performance.now()` around each system is honest about MAIN-THREAD time; it
 * cannot see GPU work that lands at the swap. `renderMs` vs `totalMs` is what
 * separates the two: a frame where they disagree paid outside JS.
 */
const BOOT_FRAMES_TRACKED = 8;
ctx.bootFrames = [];
let tracked = 0;

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

  /* Counted over the first REAL frames, not the title's. The title runs
     without the game's systems, so tracking its frames would replace the one
     measurement this array exists for — what the first frame of the actual
     game costs — with eight rows of zeroes. */
  const tracking = !booting && tracked < BOOT_FRAMES_TRACKED;
  const row = tracking ? { frame: ++tracked, at: +now.toFixed(1), systems: {} } : null;
  const fT0 = tracking ? performance.now() : 0;

  if (booting) {
    if (ctx.ui?.update) { try { ctx.ui.update(dt, ctx.state); } catch (e) { console.error('[update] ui', e); } }
    if (ctx.renderer?.titleActive) {
      if (!reducedTitleMotion()) {
        try { title?.dyn?.anim?.update?.(dt); } catch (e) { console.error('[update] title', e); }
      }
      ctx.bootTitle.frames++;
    }
  } else {
    for (const s of ctx.systems) {
      const t0 = tracking ? performance.now() : 0;
      if (s.update) { try { s.update(dt, ctx.state); } catch (e) { console.error(`[update] ${s.__name}`, e); } }
      if (tracking) row.systems[s.__name] = +(performance.now() - t0).toFixed(1);
    }
  }

  // Sim → audio telemetry pump (audio never reaches into the sim itself).
  if (!booting && ctx.audio?.setDrillState && ctx.sim?.getTelemetry) {
    try { ctx.audio.setDrillState(ctx.sim.getTelemetry()); } catch { /* non-fatal */ }
  }

  const rT0 = tracking ? performance.now() : 0;
  if ((!booting || ctx.renderer?.titleActive) && ctx.renderer?.render) ctx.renderer.render(dt);
  if (tracking && row) {
    row.renderMs = +(performance.now() - rT0).toFixed(1);
    row.totalMs = +(performance.now() - fT0).toFixed(1);
    try { row.programs = ctx.renderer?.info?.programs?.length ?? null; } catch { /* noop */ }
    ctx.bootFrames.push(row);
  }
}

boot();
