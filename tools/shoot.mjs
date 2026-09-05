/**
 * Visual QA harness for DRILLITY I THE GAME.
 *
 * Boots the dev server build in a real Chromium at an iPhone-class viewport,
 * drives the game into a set of states via `window.__DRILLITY`, and writes PNGs
 * into ./shots/ for the review agents to look at.
 *
 * ── WHAT CHANGED, AND WHY ──────────────────────────────────────────────────
 * This used to carry a hardcoded list of ~16 named states. Content outgrew it:
 * the game has 21 methods and 18 rigs, and every one of them had to be added
 * by hand, so coverage fell behind the day anything shipped. The state list is
 * now DERIVED:
 *
 *   · one live gameplay shot per method  — enumerated from `data.METHODS`
 *   · one machine portrait per rig       — enumerated from `data.RIGS`
 *   · the named UI screens, which are not per-method, stay hand-written
 *
 * New content is therefore photographed the day it lands, with no edit here.
 *
 * A method that is EXPECTED (per METHOD_IDS.md, the cross-agent id contract)
 * but absent from data.js is skipped with a named reason and printed in the
 * report under SKIPPED — a missing method is loud, never silent.
 *
 * Every shot is VERIFIED before it counts: a site shot must prove the sim is
 * running the method it is named after, on the machine it is named after; a UI
 * shot must prove the live screen is the screen claimed and that it holds real
 * content. A previous round photographed the main menu twice while believing it
 * was photographing shop listings and nobody noticed for two rounds. Frames are
 * also hashed, so two shots that are byte-identical are reported as such.
 *
 * Usage:
 *   node tools/shoot.mjs --headed                 # everything (required flag here)
 *   node tools/shoot.mjs --headed --only ui       # ui | methods | rigs
 *   node tools/shoot.mjs --headed m-dth r-bolter  # substring filter on shot id
 *   node tools/shoot.mjs --headed --tag r4        # prefix every file
 *   node tools/shoot.mjs --list                   # print the plan, shoot nothing
 *
 * HEADLESS CHROME CANNOT BIND THE DISCRETE GPU ON THIS MACHINE. It falls back
 * to SwiftShader, which is too slow to capture the scene, and every frame-rate
 * number it produces is a lie. `--headed` is required for real numbers; the
 * report says loudly when it was not used.
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'shots');
mkdirSync(OUT, { recursive: true });

const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : dflt;
};
const has = (name) => argv.includes(`--${name}`);

const QUALITY = flag('quality', 'high');   // pin the tier so review shots are comparable
const BASE = flag('url', 'http://localhost:5178/');
const URL_ = `${BASE}${BASE.includes('?') ? '&' : '?'}quality=${QUALITY}&shot`;
const TAG = flag('tag', '');
const HEADED = has('headed');
const LIST_ONLY = has('list');
const GROUP = (flag('only', '') || '').toLowerCase();   // ui | methods | rigs
const only = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));

const PHONE = {
  ...devices['iPhone 13 Pro'],
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

const name = (id) => `${TAG ? TAG + '-' : ''}${id}.png`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad2 = (n) => String(n).padStart(2, '0');

/* ═══════════════════════════════════════════════════════════════════════════
   THE BUDGET — parsed out of README.md rather than copied into this file.
   A copy drifts (this project has already been bitten by exactly that with
   FACTS_VERIFIED.md), so the harness reads the documented table and grades
   against whatever it currently says.
   ═══════════════════════════════════════════════════════════════════════════ */
function readBudget() {
  const fallback = {
    fps: 60, section: 60, surface: 80, rig: 70, textureMB: 90, particles: 12000,
    source: 'built-in fallback (README.md could not be parsed)',
  };
  let md = '';
  try { md = readFileSync(resolve(ROOT, 'README.md'), 'utf8'); } catch { return fallback; }
  const num = (re, mul = 1) => { const m = md.match(re); return m ? Number(m[1]) * mul : null; };
  const b = {
    fps: num(/\|\s*Frame rate\s*\|[^|\n]*?(\d+)\s*fps/i),
    section: num(/[≤<=]\s*(\d+)\s*section/i),
    surface: num(/[≤<=]\s*(\d+)\s*surface/i),
    rig: num(/[≤<=]\s*(\d+)\s*rig/i),
    textureMB: num(/[≤<=]\s*(\d+)\s*MB\s*HIGH/i),
    particles: num(/(\d+)k\s*HIGH/i, 1000),
    source: 'README.md · Performance budget',
  };
  for (const k of Object.keys(fallback)) if (b[k] == null) b[k] = fallback[k];
  return b;
}
const BUDGET = readBudget();

/* ═══════════════════════════════════════════════════════════════════════════
   THE METHOD MANIFEST — METHOD_IDS.md is the contract between the agents
   adding content in parallel. Parsing it (rather than hardcoding a list here)
   is what lets this harness say "tunnel-jumbo is MISSING" instead of quietly
   photographing 15 methods and calling it full coverage.
   ═══════════════════════════════════════════════════════════════════════════ */
function readManifest() {
  const out = { methods: [], rigs: [], source: null };
  // `--manifest <path>` points the expectation list somewhere else. It exists so
  // the "method X is missing" path can be exercised on a copy without anyone
  // touching METHOD_IDS.md, which several agents are reading at once.
  const path = flag('manifest', null);
  let md = '';
  try { md = readFileSync(path ? resolve(path) : resolve(ROOT, 'METHOD_IDS.md'), 'utf8'); } catch { return out; }
  out.source = path || 'METHOD_IDS.md';
  const ids = new Set();
  // the id table: rows that open with a backticked id
  for (const m of md.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)) ids.add(m[1]);
  // the "Already in the game:" roll-call
  const already = md.match(/Already in the game:([\s\S]*?)(?:—|\n\n)/);
  if (already) for (const m of already[1].matchAll(/`([a-z0-9-]+)`/g)) ids.add(m[1]);
  out.methods = [...ids];
  const rigBlock = md.match(/Rig ids for the new methods[\s\S]*?\n\n/);
  if (rigBlock) out.rigs = [...rigBlock[0].matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1])
    .filter((id) => id !== 'rigFactory.js');
  return out;
}
const MANIFEST = readManifest();

/* Methods that happen inside rock rather than on a pad. Kept here (not derived
   from sectionMode — `longhole` is a vertical section drilled from a drift)
   because the harness needs to know which shots to interrogate for an
   underground environment. */
const UNDERGROUND = new Set(['tunnel-jumbo', 'longhole', 'rockbolt']);

/* ═══════════════════════════════════════════════════════════════════════════
   IN-PAGE HELPERS — every one of these is serialised into the browser, so it
   may not close over anything in this module.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Enumerate the content tables and the engine surface, at run time. */
function pageContent() {
  const c = window.__DRILLITY;
  const d = c && c.data;
  const rigSys = c && c.rig;
  const buildable = (rigSys && rigSys.listRigs && rigSys.listRigs()) || [];
  const MAXL = (d && d.MAX_LEVEL) || 60;

  const regionsFor = (methodId) => {
    if (!d || !d.methodsForRegion || !d.REGIONS) return [];
    return d.REGIONS
      .filter((r) => d.methodsForRegion(r.id, MAXL).some((m) => m.id === methodId))
      .map((r) => r.id);
  };

  return {
    contentError: !!(c && c.contentError),
    methods: ((d && d.METHODS) || []).map((m) => ({
      id: m.id, name: m.name, shortName: m.shortName, sectionMode: m.sectionMode || 'vertical',
      unlockLevel: m.unlockLevel, depthRange: m.depthRange, rigIds: m.rigIds || [],
      scoredOn: m.scoredOn || null, regions: regionsFor(m.id),
    })),
    rigs: ((d && d.RIGS) || []).map((r) => ({
      id: r.id, name: r.name, maker: r.maker, price: r.price, unlockLevel: r.unlockLevel,
      methods: r.methods || [],
      // rigRenderId() is data.js's own stand-in rule; ask it what the factory
      // can actually build so a portrait is never silently the wrong machine.
      renderId: d && d.rigRenderId ? d.rigRenderId(r.id, buildable) : r.id,
    })),
    regions: ((d && d.REGIONS) || []).map((r) => ({ id: r.id, name: r.name })),
    buildable,
    quality: (c && c.quality && c.quality.id) || null,
  };
}

/**
 * Turn OFF three.js' automatic info reset.
 *
 * `renderer.js` calls `gl.info.reset()` exactly once per frame, at the top of
 * its own render(). With autoReset left on, every nested WebGLRenderer.render()
 * inside the post chain resets the counters again, so the number the old report
 * printed was whatever the LAST fullscreen quad cost — which is why every
 * report in shots/ says `"calls": 0`. Off, the counters accumulate across the
 * whole frame and the number means something.
 */
function pageArmCounters() {
  const gl = window.__DRILLITY && window.__DRILLITY.renderer && window.__DRILLITY.renderer.gl;
  if (!gl) return false;
  gl.info.autoReset = false;
  return true;
}

/** Per-shot metrics: frame totals, per-band attribution, memory, particles. */
async function pageMetrics() {
  const c = window.__DRILLITY;
  const gl = c && c.renderer && c.renderer.gl;
  const THREE = c && c.THREE;
  if (!gl || !THREE) return null;
  const info = gl.info;

  /* ── frame totals: sample real frames ─────────────────────────────────────
     THE FPS NUMBER IS MEASURED HERE, NOT READ OFF THE GAME'S OWN CLOCK.

     This used to sample 8 frames for draw calls and then take fps from a
     single instantaneous `c.clock.fps`. That is the instrument that produced
     the "some states run at 24-27 fps" mystery (HANDOFF §9.4): one unaveraged
     reading, taken 1.5 s into a session whose shader warm-up runs 60-100 s.

     Now: a 40-frame rAF window, median interval. The median is deliberate —
     a mean is dragged by the single 200 ms stall a program link costs, and
     one such stall in 40 frames is the difference between 100 and 60 fps.
     The old number is kept as `fpsClock` so the two can be compared, and
     `programsDelta` records whether the GPU compiled anything WHILE this
     sample was being taken. A non-zero delta means the sample is cold by
     definition, whatever the warm gate concluded a moment earlier. */
  const FRAMES = 40;
  const programs0 = info.programs ? info.programs.length : null;
  const frames = [];
  await new Promise((res) => {
    let n = 0;
    let prev = performance.now();
    const tick = () => {
      // Our rAF is registered after main.js re-registered its own, so by the
      // time this runs the frame has already been rendered.
      const now = performance.now();
      frames.push({ calls: info.render.calls, tris: info.render.triangles, dt: now - prev });
      prev = now;
      if (++n >= FRAMES) return res();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const programs1 = info.programs ? info.programs.length : null;
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1] || 0; };
  // frames[0].dt is the gap from "evaluate started" to the first tick, not a
  // frame interval. Drop it.
  const dts = frames.slice(1).map((f) => f.dt).filter((d) => d > 0 && d < 2000);
  const rafMs = dts.length ? med(dts) : null;
  const frame = {
    calls: med(frames.map((f) => f.calls)),
    tris: med(frames.map((f) => f.tris)),
    callsMax: Math.max(...frames.map((f) => f.calls)),
    rafMs: rafMs != null ? +rafMs.toFixed(2) : null,
    rafMsWorst: dts.length ? +Math.max(...dts).toFixed(2) : null,
    samples: dts.length,
  };

  /* ── per-band attribution ──────────────────────────────────────────────
     Render each scene once into a scratch target and read the counters. Draw
     call count is a function of the camera frustum, not of the target size, so
     a 32 px target is exact and free. Shadow auto-update is parked for the
     probe so shadow passes do not inflate the scene numbers. */
  const prevShadow = gl.shadowMap.autoUpdate;
  gl.shadowMap.autoUpdate = false;
  const rt = new THREE.WebGLRenderTarget(32, 32);
  const one = (scene, cam) => {
    info.reset();
    gl.setRenderTarget(rt);
    try { gl.render(scene, cam); } catch (e) { void e; }
    gl.setRenderTarget(null);
    return { calls: info.render.calls, tris: info.render.triangles };
  };
  const surface = one(c.scene, c.camera);
  let rig = null;
  const rigGroup = c.rig && c.rig.group;
  if (rigGroup) {
    const was = rigGroup.visible;
    rigGroup.visible = false;
    const without = one(c.scene, c.camera);
    rigGroup.visible = was;
    rig = { calls: surface.calls - without.calls, tris: surface.tris - without.tris };
  }
  const section = c.sectionScene && c.sectionCamera ? one(c.sectionScene, c.sectionCamera) : null;
  rt.dispose();
  gl.shadowMap.autoUpdate = prevShadow;

  /* ── texture memory estimate ───────────────────────────────────────────
     gl.info.memory.textures is a COUNT, and the budget is in megabytes. Walk
     the live materials and size the images. RGBA8 + a mip tail; an estimate,
     and labelled as one. */
  const seen = new Set();
  let bytes = 0;
  const acc = (t) => {
    if (!t || !t.isTexture || seen.has(t.uuid)) return;
    seen.add(t.uuid);
    const img = Array.isArray(t.image) ? t.image[0] : t.image;
    const w = (img && (img.width || img.videoWidth)) || 0;
    const h = (img && (img.height || img.videoHeight)) || 0;
    if (!w || !h) return;
    let b = w * h * 4;
    if (t.generateMipmaps !== false) b *= 1.334;
    if (t.isCubeTexture || (Array.isArray(t.image) && t.image.length === 6)) b *= 6;
    bytes += b;
  };
  for (const sc of [c.scene, c.sectionScene]) {
    if (!sc) continue;
    acc(sc.environment); acc(sc.background);
    sc.traverse((o) => {
      const m = o.material;
      const list = Array.isArray(m) ? m : (m ? [m] : []);
      for (const mat of list) for (const k in mat) { const v = mat[k]; if (v && v.isTexture) acc(v); }
    });
  }

  /* ── particles ─────────────────────────────────────────────────────────── */
  let particles = null;
  try {
    const s = c.vfx && c.vfx.stats && c.vfx.stats();
    if (s) particles = { live: s.live, capacity: s.capacity, budget: s.budget, tier: s.tier };
  } catch (e) { void e; }

  /* ── what the frame actually looks like ────────────────────────────────
     A signature computed from the WebGL canvas itself (?shot gives us
     preserveDrawingBuffer). Catches the black frame and the frozen frame that
     a selector-based check never will. */
  let canvas = null;
  try {
    const cv = document.getElementById('gl');
    const L = (c.LAYOUT && c.LAYOUT.surfaceHeight) || 0.54;
    const s = document.createElement('canvas');
    s.width = 16; s.height = 16;
    const g2 = s.getContext('2d', { willReadFrequently: true });
    const band = (sy, sh) => {
      g2.clearRect(0, 0, 16, 16);
      g2.drawImage(cv, 0, sy * cv.height, cv.width, sh * cv.height, 0, 0, 16, 16);
      const px = g2.getImageData(0, 0, 16, 16).data;
      let sum = 0, min = 255, max = 0;
      const cells = [];
      for (let i = 0; i < px.length; i += 4) {
        const l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
        sum += l; if (l < min) min = l; if (l > max) max = l;
        cells.push(Math.round(l / 16));
      }
      const n = px.length / 4;
      return { mean: +(sum / n).toFixed(1), min: Math.round(min), max: Math.round(max),
               sig: cells.map((v) => v.toString(16)).join('') };
    };
    canvas = {
      surface: band(0, L),
      section: band(L, 1 - L),
      sky: band(0, L * 0.14),          // the top slice — open sky reads bright
      w: cv.width, h: cv.height,
    };
  } catch (e) { canvas = { error: String((e && e.message) || e) }; }

  let ctxLost = null;
  try { ctxLost = gl.getContext().isContextLost(); } catch (e) { void e; }

  return {
    /* MEASURED over `frame.samples` real frames, not read off c.clock. */
    fps: rafMs ? +(1000 / rafMs).toFixed(1) : null,
    fpsClock: c.clock ? +(c.clock.fps || 0).toFixed(1) : null,
    quality: c.quality && c.quality.id,
    ctxLost,
    frame, surface, section, rig,
    texEstMB: +(bytes / 1048576).toFixed(1),
    textures: info.memory.textures, geometries: info.memory.geometries,
    programs: programs1,
    /* > 0 means shaders were still compiling DURING the fps window above.
       Any fps taken with a non-zero delta is cold, full stop. */
    programsDelta: (programs0 != null && programs1 != null) ? programs1 - programs0 : null,
    sessionSec: +(performance.now() / 1000).toFixed(1),
    particles,
    jsHeapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
    canvas,
  };
}

/**
 * ═══ THE WARM GATE ═══════════════════════════════════════════════════════
 *
 * Sample the program count and a short frame window, and say whether the
 * session has stopped compiling. Called in a poll loop by `warmUp()`.
 *
 * Two independent signals, because either alone lies:
 *   • `gl.info.programs.length` — climbs 65 -> 77 over the first ~100 s as
 *     three.js links a program per material/lights/shadow permutation. Stable
 *     is necessary but NOT sufficient: the last link can still be in flight
 *     and the parallel-shader-compile extension defers the stall to first use.
 *   • the median rAF interval — the thing we actually care about. A session
 *     that is still linking spends 30+ ms per frame on the MAIN THREAD while
 *     its GPU frame is 4 ms, which is exactly the shape of the 26.5 fps
 *     reading in HANDOFF §9.4.
 */
async function pageWarmSample() {
  const c = window.__DRILLITY;
  const gl = c && c.renderer && c.renderer.gl;
  if (!gl) return null;
  const info = gl.info;
  const N = 20;
  const dts = [];
  await new Promise((res) => {
    let n = 0;
    let prev = performance.now();
    const tick = () => {
      const now = performance.now();
      if (n > 0) dts.push(now - prev);
      prev = now;
      if (++n >= N) return res();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const s = dts.slice().sort((a, b) => a - b);
  const rafMs = s.length ? s[s.length >> 1] : null;
  return {
    programs: info.programs ? info.programs.length : null,
    rafMs: rafMs != null ? +rafMs.toFixed(2) : null,
    worstMs: s.length ? +s[s.length - 1].toFixed(2) : null,
    sessionSec: +(performance.now() / 1000).toFixed(1),
  };
}

/**
 * Is the 3D actually reaching the framebuffer?
 *
 * Read the game's OWN drawing buffer, not a screenshot. On this machine the
 * headed run loses its WebGL context seconds after boot: the UI keeps working,
 * `ctx.renderer` still answers, `fps` still reads 140 — and every pixel of the
 * scene is gone. A screenshot of that looks like a styled page with a blank
 * background, which is exactly what two review rounds of `shots/` contain.
 */
function pageRenderHealth() {
  const c = window.__DRILLITY;
  const out = { ok: false, why: null, lost: null, calls: null, meanLuma: null, alpha: null };
  try {
    const gl = c.renderer.gl;
    const raw = gl.getContext();
    out.lost = raw.isContextLost();
    out.calls = gl.info.render.calls;
    if (out.lost) { out.why = 'the WebGL context is LOST'; return out; }
    const W = gl.domElement.width, H = gl.domElement.height;
    // one small strip is enough and costs nothing
    const w = Math.min(64, W), h = Math.min(64, H);
    const px = new Uint8Array(w * h * 4);
    const scissor = raw.isEnabled(raw.SCISSOR_TEST);
    raw.disable(raw.SCISSOR_TEST);
    raw.bindFramebuffer(raw.FRAMEBUFFER, null);
    raw.readPixels(Math.floor((W - w) / 2), Math.floor((H - h) / 2), w, h, raw.RGBA, raw.UNSIGNED_BYTE, px);
    if (scissor) raw.enable(raw.SCISSOR_TEST);
    let sum = 0, a = 0;
    for (let i = 0; i < px.length; i += 4) { sum += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; a += px[i + 3]; }
    out.meanLuma = +(sum / (w * h)).toFixed(1);
    out.alpha = +(a / (w * h)).toFixed(1);
    out.ok = out.meanLuma > 0.5 || out.alpha > 8;
    if (!out.ok) out.why = 'the drawing buffer is completely empty — nothing is being rasterised';
  } catch (e) { out.why = String((e && e.message) || e); }
  return out;
}

/** What the page believes it is showing — the raw material for verification. */
function pageIdentity() {
  const c = window.__DRILLITY;
  const liveEl = document.querySelector('.screens > .screen:not([hidden]):not(.is-leaving)');
  const liveCls = liveEl ? (liveEl.className || '') : '';
  const m = liveCls.match(/screen--([a-z-]+)/);
  const t = (() => { try { return c.sim && c.sim.getTelemetry && c.sim.getTelemetry(); } catch (e) { void e; return null; } })();
  const count = (sel) => (liveEl ? liveEl.querySelectorAll(sel).length : 0);
  return {
    stateScene: c && c.state && c.state.scene,
    liveScreen: m ? m[1] : null,
    liveHeading: liveEl ? ((liveEl.querySelector('h1, h2, .shead__t, .schead') || {}).textContent || '').trim().slice(0, 40) : null,
    cameraMode: c && c.renderer && c.renderer.cameraMode,
    rigId: c && c.rig && c.rig.getRigId && c.rig.getRigId(),
    rigMethodId: c && c.rig && c.rig.getMethodId && c.rig.getMethodId(),
    simMethodId: c && c.sim && c.sim.methodId,
    simActive: !!(c && c.sim && c.sim.active),
    contractMethodId: c && c.state && c.state.contract && c.state.contract.methodId,
    regionId: c && c.state && c.state.world && c.state.world.regionId,
    profileMode: c && c.geology && c.geology.profileMode,
    depth: t ? +(t.depth || 0).toFixed(2) : null,
    rop: t ? +(t.rop || 0).toFixed(3) : null,
    stage: t ? t.stage : null, stageCount: t ? t.stageCount : null, stageId: t ? t.stageId : null,
    gaugeLabel: t && t.gauge ? t.gauge.label : null,
    phase: t ? t.phase : null,
    // What is actually fitted. The rubric's domain-truth axis asks whether the
    // tooling suits the method; printing the two ids the rig system chose lets a
    // reviewer check that against DOMAIN.md without guessing from pixels.
    tooling: (() => { try { return c.rig && c.rig.getTooling ? c.rig.getTooling() : null; } catch (e) { void e; return null; } })(),
    bit: t && t.bit ? { id: t.bit.id, kind: t.bit.kind, fits: t.bit.fits } : null,
    counts: {
      icard: count('.icard'), node: count('.node'), ccard: count('.ccard__body, .ccard__top'),
      rigcard: count('.rigcard__art'), rmetric: count('.rmetric'), famcard: count('.famcard__b'),
      cluster: count('.cluster'), gaugebox: count('.gaugebox'), slotcard: count('.slotcard__b'),
      menuNav: count('.menu__nav'),
    },
  };
}

/** One competent-driller tick. Used to keep the sim genuinely working. */
function pageDrive() {
  const c = window.__DRILLITY;
  const s = c && c.sim;
  if (!s || !s.getTelemetry) return null;
  let t = null;
  try { t = s.getTelemetry(); } catch (e) { void e; return null; }
  if (!t) return null;
  const bound = t.jam && t.jam.state && t.jam.state !== 'free';
  if (bound) {
    // Ease off and flush, then tap the rescue rhythm — mashing it is not a
    // strategy and the sim charges rod fatigue for it.
    s.setInput('feed', 0.16); s.setInput('rotation', 0.32); s.setInput('flush', 0.95);
    try { s.pulse('jamRescue'); } catch (e) { void e; }
    return { bound: true, depth: t.depth, rop: t.rop };
  }
  // `telemetry.optimal` is the sim's own answer for THIS method, THIS stratum
  // and THIS bit — which is why this policy works for methods that did not
  // exist when it was written.
  const o = t.optimal || {};
  s.setInput('feed', o.wob != null ? o.wob : 0.6);
  s.setInput('rotation', o.rpm != null ? o.rpm : 0.7);
  s.setInput('flush', o.flush != null ? o.flush : 0.7);
  return { bound: false, depth: t.depth, rop: t.rop, stage: t.stage };
}

/** Underground interrogation — run for the three in-rock methods. */
function pageUndergroundProbe() {
  const c = window.__DRILLITY;
  const out = { cameraModes: [], sceneHints: [], terrainRegion: null, envRegion: null,
                sunElevation: null, hasSky: null, hasClouds: null };
  try {
    out.terrainRegion = c.terrain && c.terrain.regionId;
    out.envRegion = c.env && c.env.regionId;
    out.sunElevation = c.env && c.env.sunElevation;
    out.hasSky = !!(c.env && c.env.sky && c.env.sky.visible);
    out.hasClouds = !!(c.env && c.env.clouds && c.env.clouds.visible);
  } catch (e) { void e; }
  // Which camera modes exist? setCameraMode() silently ignores an unknown id,
  // so probe by trying and reading back.
  try {
    const r = c.renderer;
    const was = r.cameraMode;
    for (const id of ['heading', 'underground', 'face', 'drift', 'portal', 'tunnel', 'hero']) {
      r.setCameraMode(id);
      if (r.cameraMode === id) out.cameraModes.push(id);
    }
    r.setCameraMode(was);
  } catch (e) { void e; }
  try {
    const seen = new Set();
    c.scene.traverse((o) => {
      const n = (o.name || '') + ' ' + ((o.userData && o.userData.kind) || '');
      if (/tunnel|drift|heading|portal|shotcrete|arch|back\b|rib\b|muck/i.test(n)) seen.add(n.trim());
    });
    out.sceneHints = [...seen].slice(0, 12);
  } catch (e) { void e; }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE NAMED UI STATES — the screens that are not per-method. Each one carries
   its own `verify`, which is given the page identity block and must say what
   would prove this frame is what its name claims.
   ═══════════════════════════════════════════════════════════════════════════ */
const UI_SHOTS = [
  {
    id: '01-boot', group: 'ui', settle: 400,
    async setup() {},
    verify: () => [],   // whatever is up at t+0 is the honest answer
  },
  {
    id: '02-menu', group: 'ui', settle: 2200,
    async setup(page) { await page.evaluate(() => window.__DRILLITY?.ui?.show?.('menu')); },
    verify: (id) => [
      ['screen is menu', id.liveScreen === 'menu' && id.stateScene === 'menu'],
      ['menu nav present', id.counts.menuNav > 0],
    ],
  },
  {
    id: '03-contracts', group: 'ui', settle: 1600,
    async setup(page) { await page.evaluate(() => window.__DRILLITY?.ui?.show?.('contracts')); },
    verify: (id) => [
      ['screen is contracts', id.liveScreen === 'contracts' && id.stateScene === 'contracts'],
      ['board has contract cards', id.counts.ccard > 0],
    ],
  },
  {
    id: '08-results', group: 'ui', settle: 2200,
    async setup(page) { await page.evaluate(() => window.__DRILLITY?.__qa?.showResults?.()); },
    verify: (id) => [
      ['screen is results', id.liveScreen === 'results' && id.stateScene === 'results'],
      ['metrics rendered', id.counts.rmetric > 0],
    ],
  },
  {
    id: '09-shop', group: 'ui', settle: 1800,
    async setup(page) { await page.evaluate(() => window.__DRILLITY?.ui?.show?.('shop')); },
    verify: (id) => [
      ['screen is shop', id.liveScreen === 'shop' && id.stateScene === 'shop'],
      ['family directory rendered', id.counts.famcard > 0],
    ],
  },
  {
    /* The shop landing page is a directory; the item cards (and their 3D
       previews) only exist one level in. Navigate before capturing. */
    id: '09b-shop-listings', group: 'ui', settle: 2600,
    async setup(page) {
      await page.evaluate(() => window.__DRILLITY?.ui?.show?.('shop'));
      // Scope every query to the LIVE screen. Screens stay mounted in `.screens`
      // during the transition, so an unscoped `page.$` matches a row on the
      // OUTGOING menu and clicking it navigates straight back — which is how
      // this step spent two review rounds photographing the main menu.
      const live = '.screens > .screen:not([hidden]):not(.is-leaving)';
      await page.waitForSelector(`${live} .famcard, ${live} .lrow, ${live} .row`, { timeout: 8000 });
      await sleep(500);
      for (const sel of ['.famcard, .lrow, .row', '.chip']) {
        const el = await page.$(`${live} ${sel}`);
        if (el) { await el.click().catch(() => {}); await sleep(900); }
      }
      await page.waitForSelector(`${live} .icard`, { timeout: 8000 });
    },
    verify: (id) => [
      ['screen is shop', id.liveScreen === 'shop' && id.stateScene === 'shop'],
      ['item cards on screen', id.counts.icard > 0],
      ['NOT the family directory', id.counts.famcard === 0],
    ],
  },
  {
    id: '10-career', group: 'ui', settle: 1800,
    async setup(page) { await page.evaluate(() => window.__DRILLITY?.ui?.show?.('career')); },
    verify: (id) => [['screen is career', id.liveScreen === 'career' && id.stateScene === 'career']],
  },
  {
    id: '10b-career-skills', group: 'ui', settle: 2200,
    async setup(page) {
      await page.evaluate(() => window.__DRILLITY?.ui?.show?.('career'));
      await sleep(700);
      const live = '.screens > .screen:not([hidden]):not(.is-leaving)';
      const tabs = await page.$$(`${live} .tabs__b`);
      for (const t of tabs) {
        const txt = (await t.innerText().catch(() => '')) || '';
        if (/skill/i.test(txt)) { await t.click().catch(() => {}); break; }
      }
    },
    verify: (id) => [
      ['screen is career', id.liveScreen === 'career'],
      ['skill tree nodes rendered', id.counts.node > 0],
    ],
  },
  {
    id: '11-garage', group: 'ui', settle: 2000,
    async setup(page) { await page.evaluate(() => window.__DRILLITY?.ui?.show?.('garage')); },
    verify: (id) => [
      ['screen is garage', id.liveScreen === 'garage' && id.stateScene === 'garage'],
      ['rig art or loadout slots present', id.counts.rigcard > 0 || id.counts.slotcard > 0],
    ],
  },
  {
    /* The geological cross-section with the HUD hidden — the only way to judge
       the band on its own merits while the control cluster is this tall. */
    id: '14-section-clean', group: 'ui', settle: 2600,
    async setup(page) {
      await page.evaluate(async () => {
        const c = window.__DRILLITY;
        await c.__qa.startDemoContract({ depth: 34, method: 'dth' });
      });
      await drive(page, 14, 130);
      await page.evaluate(() => { document.getElementById('ui').style.visibility = 'hidden'; });
    },
    async teardown(page) {
      await page.evaluate(() => { document.getElementById('ui').style.visibility = ''; });
    },
    verify: (id, met) => [
      ['sim is live', id.simActive],
      ['section band is not black', !!met && !!met.canvas && !met.canvas.error && met.canvas.section.max > 24],
    ],
  },
  {
    /* Downhole framing — the bit and the collar, close. */
    id: '07-section-closeup', group: 'ui', settle: 2400,
    async setup(page) {
      await page.evaluate(async () => {
        const c = window.__DRILLITY;
        await c.__qa.startDemoContract({ depth: 28, method: 'dth' });
        c.renderer?.setCameraMode?.('downhole');
      });
      await drive(page, 8, 130);
    },
    verify: (id) => [
      ['downhole camera', id.cameraMode === 'downhole'],
      ['sim is live', id.simActive],
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   DERIVED STATES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Drive the sim in real time so the frame has motion in it. */
async function drive(page, ticks = 18, ms = 130) {
  let last = null;
  for (let i = 0; i < ticks; i++) {
    last = await page.evaluate(pageDrive).catch(() => null);
    await sleep(ms);
  }
  return last;
}

/**
 * ═══ WARM THE SESSION, THEN MEASURE ══════════════════════════════════════
 *
 * THE BUG THIS REPLACES. The harness waited `sleep(1500)` after boot and then
 * photographed and timed ~50 states back to back. Shader warm-up on this
 * machine takes 60-100 s, so the first dozen states were all measured on a
 * main thread that was still linking programs. Commit 90defe7 caught it with
 * the same state twice in one session (HANDOFF §9.4):
 *
 *     stop  state   t+       fps      rAF       GPU      calls  programs
 *     #0    auger    29.2 s   26.5    36.9 ms   4.10 ms   221     65
 *     #5    auger    99.3 s  102.5     8.3 ms   5.88 ms   235     77
 *
 * 26.5 -> 102.5 fps while the GPU frame got MORE expensive and the draw calls
 * went UP. The 32 ms that vanished was never on the GPU; it was program
 * linking on the main thread. A cost that evaporates as a session warms, on a
 * frame doing more work, is not a cost of that state.
 *
 * Poll until BOTH signals settle:
 *   • the program count has not moved for `quietMs`
 *   • the median rAF interval has stopped improving (within `tolerance` of
 *     the best window seen so far)
 * with a floor so a session that looks instantly quiet is still exercised,
 * and a ceiling so a genuinely slow state cannot hang the run.
 *
 * Returns `{ warm, why, sec, programs, rafMs, fps, samples }`. **`warm` is
 * carried into the report against every number taken after it.** A run that
 * times out still captures — it just says so, loudly, instead of filing a
 * cold number as a fact.
 */
async function warmUp(page, opts = {}) {
  const {
    label = 'session',
    minMs = 6_000,        // never declare warm before this much has elapsed
    maxMs = 150_000,      // hard ceiling — report cold rather than hang
    quietMs = 6_000,      // programs must hold still this long
    tolerance = 0.08,     // rAF within 8 % of the best window = stopped improving
    verbose = false,
  } = opts;

  const t0 = Date.now();
  let lastPrograms = null;
  let programsStableAt = t0;
  let bestRaf = Infinity;
  let bestRafAt = t0;
  let last = null;
  let samples = 0;

  for (;;) {
    const s = await page.evaluate(pageWarmSample).catch(() => null);
    const elapsed = Date.now() - t0;
    if (!s) {
      return { warm: false, why: 'no renderer to sample', sec: +(elapsed / 1000).toFixed(1),
               programs: null, rafMs: null, fps: null, samples };
    }
    last = s; samples++;

    if (s.programs !== lastPrograms) { lastPrograms = s.programs; programsStableAt = Date.now(); }
    if (s.rafMs != null && s.rafMs < bestRaf * (1 - tolerance)) { bestRaf = s.rafMs; bestRafAt = Date.now(); }
    else if (s.rafMs != null && s.rafMs < bestRaf) bestRaf = s.rafMs;

    if (verbose) {
      process.stdout.write(
        `  warm[${label}] t+${(elapsed / 1000).toFixed(1)}s  programs ${s.programs}  ` +
        `rAF ${s.rafMs} ms (best ${bestRaf === Infinity ? '-' : bestRaf.toFixed(2)})  ` +
        `worst ${s.worstMs} ms\n`);
    }

    const now = Date.now();
    const programsQuiet = now - programsStableAt >= quietMs;
    const paceQuiet = now - bestRafAt >= quietMs;
    if (elapsed >= minMs && programsQuiet && paceQuiet) {
      return {
        warm: true,
        why: `programs stable at ${s.programs} for ${((now - programsStableAt) / 1000).toFixed(1)}s; ` +
             `rAF stopped improving at ${bestRaf.toFixed(2)} ms`,
        sec: +(elapsed / 1000).toFixed(1),
        programs: s.programs, rafMs: s.rafMs,
        fps: s.rafMs ? +(1000 / s.rafMs).toFixed(1) : null,
        samples,
      };
    }
    if (elapsed >= maxMs) {
      return {
        warm: false,
        why: `TIMED OUT after ${(elapsed / 1000).toFixed(0)}s — programs ${s.programs} ` +
             `(last moved ${((now - programsStableAt) / 1000).toFixed(1)}s ago), ` +
             `rAF ${s.rafMs} ms vs best ${bestRaf.toFixed(2)} ms. ` +
             `EVERY fps NUMBER IN THIS RUN IS COLD.`,
        sec: +(elapsed / 1000).toFixed(1),
        programs: s.programs, rafMs: s.rafMs,
        fps: s.rafMs ? +(1000 / s.rafMs).toFixed(1) : null,
        samples,
      };
    }
    await sleep(250);
  }
}

/**
 * One live gameplay shot per method.
 *
 * "Live" is the whole point. A static frame of a tunnel jumbo is a parked
 * machine: no cuttings, no dust, no boom motion, nothing the rubric's motion
 * axis can score. So each method is seeded at a real depth in a region that
 * actually offers it, handed to a competent-driller policy, and photographed
 * while it is working.
 */
function methodShot(m) {
  const ug = UNDERGROUND.has(m.id);
  return {
    id: `m${pad2(m.__i)}-${m.id}`,
    group: 'methods',
    subject: m.id,
    label: `${m.name} — ${m.scoredOn || 'live'}`,
    settle: 700,
    async setup(page) {
      const seed = await page.evaluate(async (M) => {
        const c = window.__DRILLITY;
        const notes = [];
        const region = (M.regions && M.regions[0]) || null;
        if (!region) notes.push('no region legitimately offers this method — using the harness stub contract');
        const contract = await c.__qa.startDemoContract({ method: M.id, region: region || undefined, depth: 8 });
        if (!contract) return { ok: false, notes: ['startDemoContract returned nothing'] };
        if (contract.methodId !== M.id) notes.push(`contract came back as "${contract.methodId}"`);

        /* KEEP THE JOB INSIDE THE METHOD'S OWN RANGE.
           __qa.startDemoContract() asks for `depth + 30` and deepens whatever
           it finds to reach it, which is right for a water well and wrong for a
           tunnel round: `tunnel-jumbo` tops out at 24 m of heading advance, so
           the bridge hands back a 38 m one. Clamp it back into depthRange and
           re-cut the hole rather than photographing a job the method cannot do. */
        const range = M.depthRange;
        if (range && contract.targetDepth > range[1]) {
          const was = contract.targetDepth;
          contract.targetDepth = +(range[0] + (range[1] - range[0]) * 0.7).toFixed(1);
          notes.push(`QA bridge deepened this job to ${was} m — clamped back to ${contract.targetDepth} m (method range ${range[0]}-${range[1]})`);
          try {
            c.geology.generateProfile({
              regionId: contract.regionId, applicationId: contract.applicationId,
              targetDepth: contract.targetDepth, seed: 1337, difficulty: contract.difficulty ?? 2,
            });
          } catch (e) { void e; }
          try { c.sim.startHole(contract); } catch (e) { void e; }
        }

        /* Put the bit somewhere worth photographing: a third of the way in, so
           there is hole above the bit in the section band and programme left
           below it. startDemoContract seeks a flat 10 m, which on a 2,400 m
           oil well is the conductor and on a 4 m tunnel round is past the end. */
        const target = contract.targetDepth || 30;
        const seek = Math.max(0.5, Math.min(target - Math.max(1, target * 0.25), target * 0.35));
        try { c.sim.debug.setDepth(seek); } catch (e) { void e; }
        try { c.geology.setDepth(seek); } catch (e) { void e; }

        /* Put the RIGHT MACHINE under it. startDemoContract sets the method but
           never the rig, so without this every method shot is whatever machine
           was left standing on the pad by the previous shot. */
        const d = c.data;
        let rigId = null, substituted = null;
        const candidates = (d.rigsForMethod ? d.rigsForMethod(M.id) : []).map((r) => r.id);
        const buildable = c.rig.listRigs ? c.rig.listRigs() : [];
        for (const id of candidates) {
          const render = d.rigRenderId ? d.rigRenderId(id, buildable) : id;
          if (buildable.includes(render)) { rigId = render; if (render !== id) substituted = id; break; }
        }
        if (rigId) {
          c.state.garage.rigId = rigId;
          c.rig.setRig(rigId);
          c.rig.setMethod(M.id);
          if (substituted) notes.push(`no builder for "${substituted}" — showing stand-in "${rigId}"`);
        } else {
          notes.push(`no buildable rig for this method (data lists ${candidates.join(', ') || 'none'})`);
        }
        c.ui.show('site');
        c.renderer.setCameraMode('hero');
        return { ok: true, notes, target, seek: +seek.toFixed(2), rigId, stageCount: null };
      }, m);
      this.__seed = seed || {};

      /* Two-pass methods (raise boring: pilot down then ream up; HDD: pilot
         bore then backream and pullback) do their characteristic work on the
         SECOND pass. Fast-forward through the pilot headlessly rather than
         waiting for it in real time, then let the interesting pass run live. */
      const staged = await page.evaluate(() => {
        const c = window.__DRILLITY;
        const t = c.sim.getTelemetry();
        if (!t || (t.stageCount || 1) < 2) return { staged: false, stage: t ? t.stage : null };
        try {
          c.sim.debug.setDepth(Math.max(0, (t.target || 10) - 0.75));
          c.sim.debug.simulate(90, (tel) => {
            const bound = tel.jam && tel.jam.state && tel.jam.state !== 'free';
            if (bound) return { feed: 0.15, rotation: 0.30, flush: 0.95 };
            const o = tel.optimal || {};
            return { feed: o.wob, rotation: o.rpm, flush: o.flush };
          });
        } catch (e) { void e; }
        const t2 = c.sim.getTelemetry();
        return { staged: true, stage: t2 ? t2.stage : null, stageId: t2 ? t2.stageId : null,
                 stageCount: t2 ? t2.stageCount : null };
      }).catch(() => ({ staged: false }));
      this.__staged = staged;

      /* Interrogate the environment BEFORE the live run, not after: the probe
         cycles setCameraMode() to discover which modes exist, and the camera is
         a spring — doing that during the settle would photograph it mid-glide. */
      if (ug) this.__ug = await page.evaluate(pageUndergroundProbe).catch(() => null);

      /* Now run it live, so the particles are genuinely in flight when the
         shutter opens. */
      await drive(page, 20, 130);
    },
    verify(id, met) {
      const checks = [
        [`sim is running "${m.id}"`, id.simMethodId === m.id],
        [`rig is tooled for "${m.id}"`, id.rigMethodId === m.id],
        ['a hole is live', id.simActive === true],
        ['bit is off the collar', (id.depth || 0) > 0.05],
        ['site HUD is up', id.liveScreen === 'site' && id.counts.cluster > 0],
        ['frame is not black', !!met && !!met.canvas && !met.canvas.error && met.canvas.surface.max > 24],
        ['GL context alive', !met || met.ctxLost !== true],
      ];
      const want = this.__seed && this.__seed.rigId;
      if (want) checks.push([`machine on the pad is "${want}"`, id.rigId === want]);
      if (this.__staged && this.__staged.staged) {
        checks.push([`reached pass 2 (${this.__staged.stageId || '?'})`, (this.__staged.stage || 0) >= 1]);
      }
      return checks;
    },
    extra() {
      const e = {};
      if (this.__seed) {
        if (this.__seed.notes && this.__seed.notes.length) e.notes = this.__seed.notes;
        if (this.__seed.target) e.target = this.__seed.target;
        if (this.__seed.seek != null) e.seek = this.__seed.seek;
      }
      if (this.__ug) e.underground = this.__ug;
      return e;
    },
  };
}

/**
 * One machine portrait per rig — the shot the garage and the shop are made of,
 * and the only place the rubric's silhouette axis can be graded per machine.
 */
function rigShot(r) {
  return {
    id: `r${pad2(r.__i)}-${r.id}`,
    group: 'rigs',
    subject: r.id,
    label: `${r.name}`,
    settle: 900,
    async setup(page) {
      const seed = await page.evaluate(async (R) => {
        const c = window.__DRILLITY;
        const notes = [];
        const d = c.data;
        const buildable = c.rig.listRigs ? c.rig.listRigs() : [];
        const render = d.rigRenderId ? d.rigRenderId(R.id, buildable) : R.id;
        if (!buildable.includes(render)) return { ok: false, notes: [`rigFactory.js cannot build "${R.id}"`] };
        if (render !== R.id) notes.push(`no builder for "${R.id}" — this frame shows "${render}"`);

        // Give the machine a job, so its tooling, mast pose and section stub
        // are the ones this machine actually works in.
        const methodId = (R.methods && R.methods[0]) || 'auger';
        const method = d.getMethod ? d.getMethod(methodId) : null;
        const regions = (d.REGIONS || []).filter((rg) =>
          d.methodsForRegion && d.methodsForRegion(rg.id, d.MAX_LEVEL || 60).some((m) => m.id === methodId));
        await c.__qa.startDemoContract({
          method: methodId, region: regions[0] ? regions[0].id : undefined, depth: 6,
        });
        c.state.garage.rigId = render;
        c.rig.setRig(render);
        c.rig.setMethod(methodId);
        c.ui.show('site');
        c.renderer.setCameraMode('orbit');
        return { ok: true, notes, render, methodId, methodName: method ? method.shortName : methodId };
      }, r);
      this.__seed = seed || {};
      if (!seed || !seed.ok) { this.__skip = (seed && seed.notes && seed.notes[0]) || 'setup failed'; return; }
      /* A machine whose trade is underground gets photographed in a drive, and
         the turntable camera sits 13 m out — which in a 5 m horseshoe is inside
         the rock. Probe it so the report says so rather than the reviewer
         guessing why the portrait is a wall. */
      if (UNDERGROUND.has(seed.methodId)) {
        this.__ug = await page.evaluate(pageUndergroundProbe).catch(() => null);
      }
      // A turntable portrait still wants the machine alive — the mast head
      // moving, dust at the collar. Short: this is a form shot, not an action one.
      await drive(page, 10, 120);
    },
    verify(id, met) {
      const want = (this.__seed && this.__seed.render) || r.id;
      return [
        [`machine is "${want}"`, id.rigId === want],
        ['orbit camera', id.cameraMode === 'orbit'],
        ['frame is not black', !!met && !!met.canvas && !met.canvas.error && met.canvas.surface.max > 24],
        ['GL context alive', !met || met.ctxLost !== true],
      ];
    },
    extra() {
      const e = {};
      if (this.__seed && this.__seed.notes && this.__seed.notes.length) e.notes = this.__seed.notes;
      if (this.__seed && this.__seed.methodName) e.workingAs = this.__seed.methodName;
      if (this.__ug) e.underground = this.__ug;
      return e;
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   RUN
   ═══════════════════════════════════════════════════════════════════════════ */
let BROWSER = null;
const run = async () => {
  /* Drive the real Chrome/Edge already installed on this machine — the bundled
     Playwright chromium build does not match the local browser cache.
     Headless Chrome cannot bind the discrete NVIDIA context here, so it renders
     through ANGLE's SwiftShader backend: a complete, correct GL implementation.
     Image fidelity is identical; FRAME RATE IS NOT MEANINGFUL there. */
  const launchArgs = HEADED
    ? ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--hide-scrollbars', '--mute-audio']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
       '--disable-gpu-sandbox', '--in-process-gpu', '--hide-scrollbars', '--mute-audio'];
  let browser = null;
  for (const channel of (HEADED ? ['chrome'] : ['chrome', 'msedge', undefined])) {
    try { browser = await chromium.launch({ channel, headless: !HEADED, args: launchArgs }); break; }
    catch (e) { if (channel === undefined) throw e; }
  }
  BROWSER = browser;
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();

  const logs = [];
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}\n${e.stack || ''}`));
  let loads = 0;
  page.on('load', () => { loads++; });

  /* ── MUTE HMR ───────────────────────────────────────────────────────────
     Several agents edit src/ while this runs. Every save makes Vite push a
     full-reload down the HMR socket, and a mid-run reload is not a harmless
     refresh: the second boot competes with the first page's WebGL contexts,
     Chrome refuses one, and the renderer never comes up — after which every
     remaining frame is black and the report reads like an art regression.
     Observed three reloads inside one four-shot run.

     So the HMR socket is intercepted and left permanently, quietly open. The
     client believes it is connected and never reloads; module and CSS serving
     are untouched, so the page is exactly the page. `--hmr` opts back in. */
  if (!has('hmr')) {
    await page.routeWebSocket(/.*/, () => { /* mocked: never reaches the dev server */ })
      .catch((e) => logs.push(`[harness] could not mute HMR — ${e.message}`));
  }

  await page.goto(URL_, { waitUntil: 'load', timeout: 45_000 });
  // The boot screen dismisses as soon as init finishes, so grab it NOW —
  // otherwise every "boot" shot is really the menu.
  await sleep(650);
  await page.screenshot({ path: resolve(OUT, name('00-boot-live')), timeout: 60_000 }).catch(() => {});
  await page.waitForFunction(() => !!window.__DRILLITY, null, { timeout: 20_000 }).catch(() => {});
  const bootedAt = Date.now();
  await page
    .waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 120_000 })
    .catch(() => logs.push('[harness] boot never completed within 120s'));
  const bootSec = +((Date.now() - bootedAt) / 1000).toFixed(1);
  process.stdout.write(`booted in ${bootSec}s\n`);
  await sleep(1500);
  // Audio needs a user gesture. Use a key press, NOT a click: a click lands on
  // whatever menu button happens to be under the cursor and navigates away from
  // the screen we are about to photograph.
  await page.keyboard.press('Space').catch(() => {});
  await sleep(500);

  /* ── BOOT HEALTH ────────────────────────────────────────────────────────
     If the renderer never got a WebGL context, every frame below is black and
     every number is zero — and that looks exactly like "the art regressed".
     It is not; it is the machine. Say so, and stop, rather than filing 50 black
     PNGs as a review round. Seen in practice when several Chrome instances are
     alive at once: Chrome refuses new contexts and main.js logs
     `[boot] system "renderer" unavailable — Error creating WebGL context.` */
  const health = await page.evaluate(() => {
    const c = window.__DRILLITY;
    return {
      renderer: !!(c && c.renderer && c.renderer.gl),
      systems: (c && c.systems ? c.systems : []).map((s) => s.__name),
      data: !!(c && c.data && c.data.METHODS),
    };
  }).catch(() => ({ renderer: false, systems: [], data: false }));
  if (!health.renderer || !health.data) {
    const why = logs.filter((l) => /\[boot\]|WebGL context/i.test(l)).slice(0, 6);
    process.stderr.write(
      '\nABORTED — the game did not come up in a photographable state.\n' +
      `  renderer: ${health.renderer ? 'ok' : 'NO WEBGL CONTEXT'}\n` +
      `  data.js:  ${health.data ? 'ok' : 'NOT LOADED'}\n` +
      `  systems:  ${health.systems.join(', ') || 'none'}\n` +
      (why.length ? '  ' + why.join('\n  ') + '\n' : '') +
      '  Nothing was captured. Close stray Chrome instances (a WebGL context is\n' +
      '  refused when too many are alive) and run again.\n');
    writeFileSync(resolve(OUT, `${TAG ? TAG + '-' : ''}report.txt`),
      `ABORTED at boot — renderer:${health.renderer} data:${health.data}\n` +
      `systems: ${health.systems.join(', ')}\n\n${logs.join('\n')}\n`, 'utf8');
    await browser.close();
    process.exitCode = 2;
    return;
  }

  const armed = await page.evaluate(pageArmCounters).catch(() => false);
  if (!armed) logs.push('[harness] could not disable gl.info.autoReset — draw-call numbers are unreliable');

  /* ── RENDER HEALTH ──────────────────────────────────────────────────────
     Boot succeeding is not the same as the scene reaching the framebuffer.
     Check the drawing buffer itself before spending eight minutes filling
     shots/ with beautifully composed pictures of nothing. */
  await page.evaluate(async () => {
    const c = window.__DRILLITY;
    try { await c.__qa.startDemoContract({ depth: 12 }); } catch (e) { void e; }
  }).catch(() => {});
  await sleep(1800);
  const render = await page.evaluate(pageRenderHealth).catch((e) => ({ ok: false, why: e.message }));
  const shaderErrs = logs.filter((l) => /Shader Error|program not valid/i.test(l)).length;
  if (!render.ok && !has('force')) {
    const mats = [...new Set((logs.join('\n').match(/Material Name: (.+)/g) || [])
      .map((s) => s.replace('Material Name: ', '').trim()).filter(Boolean))];
    const msg =
      '\nABORTED — the game boots, the UI works, and NOTHING IS BEING DRAWN.\n' +
      `  ${render.why}\n` +
      `  context lost: ${render.lost}   draw calls last frame: ${render.calls}\n` +
      `  drawing buffer: mean luma ${render.meanLuma}, mean alpha ${render.alpha}\n` +
      `  shader/program errors on the console: ${shaderErrs}\n` +
      (mats.length ? `  materials that failed to link: ${mats.join(', ')}\n` : '') +
      (HEADED
        ? '\n  This is the HEADED (discrete GPU) path. On this machine the ANGLE/D3D11\n' +
          '  context is lost seconds after boot, after which every program fails to\n' +
          '  link and the canvas stays empty — while fps, ctx.renderer and the whole\n' +
          '  UI carry on as if nothing happened. Screenshots taken in that state are\n' +
          '  a styled page over a blank background, NOT a picture of the game.\n' +
          '  Headless SwiftShader renders the same build correctly. Run:\n' +
          '      node tools/shoot.mjs            (no --headed)\n' +
          '  and treat the fps column as unavailable, or pass --force to shoot anyway.\n'
        : '\n  Pass --force to capture anyway.\n');
    process.stderr.write(msg);
    writeFileSync(resolve(OUT, `${TAG ? TAG + '-' : ''}report.txt`),
      `ABORTED — nothing is being rasterised.\n${msg}\n\nCONSOLE:\n${logs.slice(0, 200).join('\n')}\n`, 'utf8');
    await browser.close();
    process.exitCode = 3;
    return;
  }
  if (!render.ok) logs.push(`[harness] FORCED past a dead renderer — ${render.why}`);
  process.stdout.write(`render health: ${render.ok ? 'ok' : 'DEAD'} (luma ${render.meanLuma}, ctxLost ${render.lost}, shader errors ${shaderErrs})\n`);

  /* ── WARM THE SESSION ────────────────────────────────────────────────────
     This is the fix for HANDOFF §9.4 and it belongs HERE, not in the settle:
     shader linking is a property of the SESSION, not of a state. The old
     `sleep(1500)` above meant the first dozen states were timed on a main
     thread still linking programs, and the last dozen on one that had
     finished — so the report ranked states by capture order and called it
     performance.

     The demo contract from the render-health check is already live, so the
     surface world, the section world, the rig, the particles and the whole
     post chain are all on screen and compiling. Drive it so nothing is
     skipped for being static, then poll until it stops compiling.

     Costs 30-100 s once. It used to cost the entire meaning of the fps
     column. `--nowarm` skips it and stamps every number cold. */
  let warm = { warm: false, why: 'skipped (--nowarm)', sec: 0, programs: null, rafMs: null, fps: null, samples: 0 };
  if (!has('nowarm')) {
    process.stdout.write('warming up (shader/program compile) ...\n');
    // real ticks first: a parked frame never touches the impact, dust or
    // cuttings materials, and those are programs too.
    await drive(page, 12, 130);
    warm = await warmUp(page, { label: 'session', verbose: true, maxMs: +flag('warmmax', 150_000) });
    process.stdout.write(
      `warm-up ${warm.warm ? 'COMPLETE' : 'INCOMPLETE'} after ${warm.sec}s — ` +
      `${warm.programs} programs, ${warm.rafMs} ms/frame (${warm.fps} fps)\n  ${warm.why}\n`);
    if (!warm.warm) logs.push(`[harness] WARM-UP INCOMPLETE — ${warm.why}`);
  } else {
    logs.push('[harness] --nowarm: every fps number in this run is COLD and comparable only to other cold runs');
    process.stdout.write('--nowarm: fps numbers will be marked COLD\n');
  }

  /* ── build the plan from the live content tables ─────────────────────── */
  const content = await page.evaluate(pageContent).catch(() => null);
  if (!content) { logs.push('[harness] FATAL: could not read window.__DRILLITY.data'); }
  const methods = (content && content.methods) || [];
  const rigs = (content && content.rigs) || [];
  methods.sort((a, b) => (a.unlockLevel || 0) - (b.unlockLevel || 0));
  rigs.sort((a, b) => (a.unlockLevel || 0) - (b.unlockLevel || 0) || (a.price || 0) - (b.price || 0));
  methods.forEach((m, i) => { m.__i = i + 1; });
  rigs.forEach((r, i) => { r.__i = i + 1; });

  /* Anything the cross-agent manifest promises but data.js does not carry is a
     SKIP with a reason, not a silent hole in coverage. */
  const present = new Set(methods.map((m) => m.id));
  const skipped = [];
  for (const id of MANIFEST.methods) {
    if (!present.has(id)) skipped.push({ kind: 'method', id, why: `not present in src/game/data.js (expected by ${MANIFEST.source})` });
  }
  const unlisted = methods.filter((m) => MANIFEST.methods.length && !MANIFEST.methods.includes(m.id)).map((m) => m.id);
  for (const r of rigs) {
    if (!content.buildable.includes(r.renderId)) {
      skipped.push({ kind: 'rig', id: r.id, why: 'rig/rigFactory.js has no builder and data.js offers no renderRigId stand-in' });
    }
  }
  const shootableRigs = rigs.filter((r) => content.buildable.includes(r.renderId));

  const plan = [
    ...UI_SHOTS,
    ...methods.map(methodShot),
    ...shootableRigs.map(rigShot),
  ];
  let wanted = plan;
  if (GROUP) wanted = wanted.filter((s) => s.group === GROUP);
  if (only.length) wanted = wanted.filter((s) => only.some((o) => s.id.includes(o)));

  process.stdout.write(
    `plan: ${methods.length} methods · ${shootableRigs.length}/${rigs.length} rigs · ` +
    `${UI_SHOTS.length} UI states  →  ${wanted.length} shots\n`);
  if (skipped.length) {
    process.stdout.write(`SKIPPED ${skipped.length}:\n` +
      skipped.map((s) => `  ${s.kind} ${s.id} — ${s.why}`).join('\n') + '\n');
  }
  if (LIST_ONLY) {
    for (const s of wanted) process.stdout.write(`  ${s.id}${s.label ? '  ' + s.label : ''}\n`);
    await browser.close();
    return;
  }

  /* ── capture ─────────────────────────────────────────────────────────── */
  const results = [];
  const hashes = new Map();
  await page.evaluate(() => { window.__SHOOT_SESSION = 1; }).catch(() => {});
  for (const shot of wanted) {
    const logMark = logs.length;
    const t0 = Date.now();
    let setupError = null;
    /* Did the page reload out from under us? A reloaded page is a different
       ctx, a different renderer and — often — no WebGL context at all. Say so
       against the shot it happened to, so a black frame is never mistaken for
       a regression in the art. */
    const alive = await page.evaluate(() => !!window.__SHOOT_SESSION && !!(window.__DRILLITY && window.__DRILLITY.renderer))
      .catch(() => false);
    if (!alive) {
      logs.push(`[harness] page reloaded before ${shot.id} — waiting for it to come back`);
      await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60_000 }).catch(() => {});
      await sleep(1500);
      const back = await page.evaluate(() => {
        const ok = !!(window.__DRILLITY && window.__DRILLITY.renderer && window.__DRILLITY.renderer.gl);
        if (ok) { window.__SHOOT_SESSION = 1; window.__DRILLITY.renderer.gl.info.autoReset = false; }
        return ok;
      }).catch(() => false);
      if (!back) logs.push(`[harness] RENDERER DID NOT RECOVER — ${shot.id} and everything after it is unusable`);
    }
    try { await shot.setup(page); }
    catch (e) { setupError = e.message; logs.push(`[setup:${shot.id}] ${e.message}`); }
    if (shot.__skip) {
      results.push({ id: shot.id, group: shot.group, skipped: shot.__skip });
      process.stdout.write(`SKIP  ${shot.id}: ${shot.__skip}\n`);
      continue;
    }
    await sleep(shot.settle);

    /* ── PER-STOP WARM GATE ──────────────────────────────────────────────
       The session warm-up above handles the bulk, but a state can still be
       the FIRST to show a material: a new rig, a method's own tooling, a
       hazard effect. Those link on their first drawn frame, on the main
       thread, and the fps window is about to start.

       So: a short, cheap re-check that the program count is holding still.
       Warm session, no new material -> two polls, ~1 s. New material ->
       waits for it. Never longer than `stopWarmMax`, and the result is
       recorded per stop rather than assumed. */
    const stopWarm = has('nowarm')
      ? { warm: false, why: 'skipped (--nowarm)', sec: 0, programs: null, rafMs: null, fps: null, samples: 0 }
      : await warmUp(page, { label: shot.id, minMs: 0, quietMs: 1_500, maxMs: 15_000, tolerance: 0.12 });
    if (!stopWarm.warm) logs.push(`[warm:${shot.id}] ${stopWarm.why}`);

    const metrics = await page.evaluate(pageMetrics).catch((e) => ({ error: e.message }));
    const ident = await page.evaluate(pageIdentity).catch(() => ({ counts: {} }));

    const buf = await page.screenshot({ animations: 'allow', timeout: 180_000 });
    const file = name(shot.id);
    writeFileSync(resolve(OUT, file), buf);
    const md5 = createHash('md5').update(buf).digest('hex');
    if (hashes.has(md5)) logs.push(`[harness] ${shot.id} is byte-identical to ${hashes.get(md5)}`);
    else hashes.set(md5, shot.id);

    if (shot.teardown) await shot.teardown(page).catch(() => {});

    let checks = [];
    try { checks = shot.verify ? shot.verify.call(shot, ident, metrics) || [] : []; }
    catch (e) { checks = [[`verify threw: ${e.message}`, false]]; }
    const failed = checks.filter(([, ok]) => !ok).map(([what]) => what);

    const errs = logs.slice(logMark).filter((l) => l.startsWith('[error]') || l.startsWith('[pageerror]'));
    results.push({
      id: shot.id, group: shot.group, file, md5, label: shot.label || null,
      subject: shot.subject || null, setupError,
      metrics, ident, checks, failed, errors: errs.length, errorLines: errs.slice(0, 6),
      extra: shot.extra ? shot.extra.call(shot) : null,
      tookSec: +((Date.now() - t0) / 1000).toFixed(1),
      /* WAS THIS NUMBER TAKEN WARM? Both gates have to agree, and the metrics
         sampler gets a veto: if `programsDelta` is non-zero the GPU was
         compiling during the fps window itself. Nothing downstream may print
         an fps without printing this beside it. */
      warm: !!(warm.warm && stopWarm.warm && metrics && metrics.programsDelta === 0),
      warmDetail: {
        session: warm.warm, stop: stopWarm.warm,
        stopSec: stopWarm.sec, stopWhy: stopWarm.warm ? null : stopWarm.why,
        programsDelta: metrics ? (metrics.programsDelta ?? null) : null,
      },
    });
    const mk = failed.length ? `VERIFY FAIL (${failed.join('; ')})` : 'ok';
    const isWarm = !!(warm.warm && stopWarm.warm && metrics && metrics.programsDelta === 0);
    const fm = metrics && metrics.frame
      ? `${metrics.frame.calls} calls / ${(metrics.frame.tris / 1000).toFixed(0)}k tris / ` +
        `${metrics.fps} fps ${isWarm ? 'warm' : 'COLD'}`
      : 'no metrics';
    process.stdout.write(`shot ${shot.id.padEnd(26)} ${fm.padEnd(40)} ${mk}\n`);
  }

  /* ── burn-in: a short interaction sweep to surface runtime errors the
        static states miss ─────────────────────────────────────────────── */
  const burnMark = logs.length;
  await page.evaluate(async () => {
    const c = window.__DRILLITY;
    await c?.__qa?.startDemoContract?.({ depth: 5 });
    c?.ui?.show?.('site');
  }).catch(() => {});
  for (let i = 0; i < 40; i++) {
    await page.evaluate((k) => {
      const s = window.__DRILLITY?.sim;
      s?.setInput?.('feed', 0.3 + 0.5 * Math.abs(Math.sin(k / 5)));
      s?.setInput?.('rotation', 0.4 + 0.4 * Math.abs(Math.cos(k / 7)));
      s?.setInput?.('flush', 0.5 + 0.3 * Math.sin(k / 3));
    }, i).catch(() => {});
    await sleep(60);
  }
  const burnMetrics = await page.evaluate(pageMetrics).catch(() => null);
  await sleep(400);
  const burnBuf = await page.screenshot({ timeout: 180_000 });
  writeFileSync(resolve(OUT, name('13-burnin')), burnBuf);
  results.push({
    id: '13-burnin', group: 'ui', file: name('13-burnin'),
    md5: createHash('md5').update(burnBuf).digest('hex'),
    metrics: burnMetrics, ident: {}, checks: [], failed: [],
    errors: logs.slice(burnMark).filter((l) => l.startsWith('[error]') || l.startsWith('[pageerror]')).length,
    errorLines: [],
  });

  writeReport({ results, logs, content, methods, rigs, skipped, unlisted, bootSec, hashes, loads, render });
  await browser.close();
};

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT — the thing a reviewer reads before looking at a single PNG. It has
   to make a regression ATTRIBUTABLE: which state, which band, which number.
   ═══════════════════════════════════════════════════════════════════════════ */
function writeReport({ results, logs, content, methods, rigs, skipped, unlisted, bootSec, hashes, loads, render }) {
  const L = [];
  const shot = results.filter((r) => !r.skipped);
  const num = (v, w) => String(v == null ? '-' : v).padStart(w);
  const b = BUDGET;

  L.push(`DRILLITY — visual QA harness`);
  L.push(`when      ${new Date().toISOString()}`);
  L.push(`url       ${URL_}`);
  L.push(`mode      ${HEADED ? 'HEADED (real GPU — fps is meaningful)' : 'HEADLESS / SwiftShader — FPS NUMBERS BELOW ARE NOT MEANINGFUL'}`);
  L.push(`quality   ${(content && content.quality) || QUALITY}`);
  L.push(`filter    ${GROUP || only.length ? [GROUP && '--only ' + GROUP, ...only].filter(Boolean).join(' ') : 'none — full coverage run'}`);
  L.push(`boot      ${bootSec}s`);
  L.push(`page loads ${loads}${loads > 1 ? '  ← THE PAGE RELOADED MID-RUN (a src/ save reached the browser). Frames after a reload may be from a second, weaker boot.' : '  (no mid-run reload — HMR muted)'}`);
  L.push('');

  /* ── render health ──────────────────────────────────────────────────── */
  const lostIn = shot.filter((r) => r.metrics && r.metrics.ctxLost);
  L.push('── RENDER HEALTH ───────────────────────────────────────────────────────');
  if (render && render.ok && !lostIn.length) {
    L.push(`  ok — the drawing buffer holds pixels (mean luma ${render.meanLuma}) and the GL`);
    L.push('  context stayed alive for every shot. The frames below are pictures of the game.');
  } else {
    L.push('  *** THE FRAMES BELOW MAY NOT CONTAIN THE GAME ***');
    if (render) L.push(`  boot check: ${render.ok ? 'passed' : 'FAILED — ' + render.why} (ctxLost ${render.lost}, luma ${render.meanLuma})`);
    if (lostIn.length) L.push(`  the WebGL context was LOST during: ${lostIn.map((r) => r.id).join(', ')}`);
    L.push('  A lost context is invisible from the outside: the UI keeps rendering, fps keeps');
    L.push('  reading normally, and the scene is simply gone. Grade nothing from these.');
  }
  const shaderErrs = logs.filter((l) => /Shader Error|program not valid/i.test(l)).length;
  if (shaderErrs) L.push(`  shader/program errors on the console: ${shaderErrs}`);
  L.push('');

  /* ── coverage ───────────────────────────────────────────────────────── */
  const mShots = shot.filter((r) => r.group === 'methods');
  const rShots = shot.filter((r) => r.group === 'rigs');
  const uShots = shot.filter((r) => r.group === 'ui');
  L.push('── COVERAGE ────────────────────────────────────────────────────────────');
  L.push(`methods    ${mShots.length}/${methods.length} photographed` +
         (skipped.filter((s) => s.kind === 'method').length ? `  ·  ${skipped.filter((s) => s.kind === 'method').length} MISSING FROM data.js` : ''));
  L.push(`rigs       ${rShots.length}/${rigs.length} photographed` +
         (skipped.filter((s) => s.kind === 'rig').length ? `  ·  ${skipped.filter((s) => s.kind === 'rig').length} unbuildable` : ''));
  L.push(`UI states  ${uShots.length}`);
  L.push(`manifest   ${MANIFEST.source || 'none found'} lists ${MANIFEST.methods.length} method ids`);
  if (unlisted.length) L.push(`           in data.js but NOT in the manifest (photographed anyway): ${unlisted.join(', ')}`);
  L.push('');
  if (skipped.length) {
    L.push(`── COULD NOT PHOTOGRAPH (${skipped.length}) ─────────────────────────────────────`);
    for (const s of skipped) L.push(`  ${s.kind.toUpperCase().padEnd(7)} ${s.id.padEnd(22)} ${s.why}`);
    L.push('');
  } else if (GROUP || only.length) {
    L.push('── COULD NOT PHOTOGRAPH: nothing was missing from the content tables, but this');
    L.push(`   run was FILTERED (${GROUP ? '--only ' + GROUP : ''}${only.length ? ' ' + only.join(' ') : ''}) — it is not a coverage round.`);
    L.push('');
  } else {
    L.push('── COULD NOT PHOTOGRAPH: nothing. Every id in the manifest and every rig');
    L.push('   in data.js has a frame in this run.');
    L.push('');
  }

  /* ── budget ─────────────────────────────────────────────────────────── */
  L.push('── BUDGET ──────────────────────────────────────────────────────────────');
  L.push(`source: ${b.source}`);
  L.push(`  draw calls   surface ≤ ${b.surface}   section ≤ ${b.section}   rig ≤ ${b.rig}`);
  L.push(`  frame rate   ≥ ${b.fps} fps${HEADED ? '' : '   (NOT ASSESSED — headless)'}`);
  L.push(`  texture mem  ≤ ${b.textureMB} MB (HIGH)      particles ≤ ${b.particles}`);
  const over = { surface: [], section: [], rig: [], fps: [], tex: [], particles: [] };
  for (const r of shot) {
    const m = r.metrics; if (!m || m.error) continue;
    if (m.surface && m.surface.calls > b.surface) over.surface.push(`${r.id}=${m.surface.calls}`);
    if (m.section && m.section.calls > b.section) over.section.push(`${r.id}=${m.section.calls}`);
    if (m.rig && m.rig.calls > b.rig) over.rig.push(`${r.id}=${m.rig.calls}`);
    if (HEADED && m.fps != null && m.fps < b.fps) over.fps.push(`${r.id}=${m.fps}`);
    if (m.texEstMB > b.textureMB) over.tex.push(`${r.id}=${m.texEstMB}MB`);
    if (m.particles && m.particles.live > b.particles) over.particles.push(`${r.id}=${m.particles.live}`);
  }
  const budgetFails = Object.entries(over).filter(([, v]) => v.length);
  if (!budgetFails.length) {
    L.push('  VERDICT: PASS — every captured state is inside every documented ceiling.');
  } else {
    L.push('  VERDICT: FAIL');
    for (const [k, v] of budgetFails) L.push(`    ${k.padEnd(10)} over budget in ${v.length} state(s): ${v.slice(0, 8).join(' ')}${v.length > 8 ? ' …' : ''}`);
  }
  L.push('  (texture MB is an estimate from live material maps, RGBA8 + mip tail.');
  L.push('   per-band calls exclude shadow passes; frame totals include them.)');
  L.push('');

  /* ── verification ───────────────────────────────────────────────────── */
  const vfail = shot.filter((r) => r.failed && r.failed.length);
  L.push('── DOES EACH SHOT CONTAIN WHAT ITS NAME CLAIMS ─────────────────────────');
  if (!vfail.length) L.push(`  PASS — all ${shot.length} frames verified against the live game state.`);
  else {
    L.push(`  FAIL — ${vfail.length} of ${shot.length} frames did not prove their own subject:`);
    for (const r of vfail) L.push(`    ${r.id.padEnd(26)} ${r.failed.join(' · ')}`);
  }
  /* Byte equality is a weak test once particles are moving: two frames of the
     same wrong machine differ in a few dust motes and pass. Compare the coarse
     luminance signature of the surface band instead — if two DIFFERENT rigs or
     methods paint nearly the same picture, either the subject never changed or
     the machines are indistinguishable at this framing, and both are worth
     knowing before a reviewer grades eighteen "different" portraits. */
  const sigOf = (r) => (r.metrics && r.metrics.canvas && !r.metrics.canvas.error
    ? r.metrics.canvas.surface.sig : null);
  const near = [];
  for (const grp of ['rigs', 'methods']) {
    const g = shot.filter((r) => r.group === grp && sigOf(r));
    for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
      const a = sigOf(g[i]), b = sigOf(g[j]);
      if (a.length !== b.length) continue;
      let d = 0;
      for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) d++;
      if (d <= Math.max(2, Math.round(a.length * 0.04))) near.push(`${g[i].id} ≈ ${g[j].id} (${d}/${a.length} cells differ)`);
    }
  }
  if (near.length) {
    L.push(`  NEARLY IDENTICAL FRAMES (${near.length}) — same picture under two names?`);
    for (const n of near.slice(0, 20)) L.push(`    ${n}`);
  }
  const dupes = [...logs].filter((l) => l.includes('byte-identical'));
  if (dupes.length) { L.push('  DUPLICATE FRAMES:'); for (const d of dupes) L.push(`    ${d.replace('[harness] ', '')}`); }
  else L.push(`  no two frames are byte-identical (${hashes.size} distinct images).`);
  L.push('');

  /* ── per-shot table ─────────────────────────────────────────────────── */
  L.push('── PER-SHOT ────────────────────────────────────────────────────────────');
  L.push('  id                          fps   frame  surf  sect   rig     tris  part   err   sec  verify');
  for (const r of results) {
    if (r.skipped) { L.push(`  ${r.id.padEnd(26)} SKIPPED — ${r.skipped}`); continue; }
    const m = r.metrics || {};
    L.push('  ' + r.id.padEnd(26) +
      num(m.fps, 6) + ' ' + num(m.frame && m.frame.calls, 6) + ' ' +
      num(m.surface && m.surface.calls, 5) + ' ' + num(m.section && m.section.calls, 5) + ' ' +
      num(m.rig && m.rig.calls, 5) + ' ' +
      num(m.frame ? Math.round(m.frame.tris / 1000) + 'k' : null, 8) + ' ' +
      num(m.particles ? m.particles.live : null, 5) + ' ' +
      num(r.errors, 5) + ' ' + num(r.tookSec, 5) + '  ' + (r.failed && r.failed.length ? 'FAIL' : 'ok'));
  }
  L.push('');

  /* ── per-shot detail ────────────────────────────────────────────────── */
  L.push('── PER-SHOT DETAIL ─────────────────────────────────────────────────────');
  for (const r of results) {
    if (r.skipped) continue;
    const m = r.metrics || {}; const id = r.ident || {};
    const bits = [];
    if (r.label) bits.push(r.label);
    if (id.simMethodId) bits.push(`method=${id.simMethodId}`);
    if (id.rigId) bits.push(`rig=${id.rigId}`);
    if (id.regionId) bits.push(`region=${id.regionId}`);
    if (id.profileMode) bits.push(`section=${id.profileMode}`);
    if (id.cameraMode) bits.push(`cam=${id.cameraMode}`);
    if (id.stageCount > 1) bits.push(`stage=${id.stage}/${id.stageCount} (${id.stageId})`);
    if (id.gaugeLabel) bits.push(`gauge=${id.gaugeLabel}`);
    if (id.depth != null) bits.push(`depth=${id.depth}m rop=${id.rop}`);
    if (id.tooling && (id.tooling.surface || id.tooling.downhole)) {
      bits.push(`tooling=${id.tooling.surface || '-'}/${id.tooling.downhole || '-'}`);
    }
    if (id.bit && id.bit.id) bits.push(`bit=${id.bit.id}${id.bit.fits === false ? ' (DOES NOT FIT THIS METHOD)' : ''}`);
    L.push(`  ${r.id}`);
    if (bits.length) L.push(`      ${bits.join(' · ')}`);
    if (m.canvas && !m.canvas.error) {
      L.push(`      luma surface ${m.canvas.surface.mean} (${m.canvas.surface.min}-${m.canvas.surface.max})` +
             ` · section ${m.canvas.section.mean} (${m.canvas.section.min}-${m.canvas.section.max})` +
             ` · tex≈${m.texEstMB}MB · heap ${m.jsHeapMB}MB`);
    }
    if (r.extra && r.extra.notes) for (const n of r.extra.notes) L.push(`      NOTE ${n}`);
    if (r.extra && r.extra.underground) {
      const u = r.extra.underground;
      L.push(`      UNDERGROUND PROBE  terrain=${u.terrainRegion} env=${u.envRegion} sunElev=${u.sunElevation}` +
             ` sky=${u.hasSky} clouds=${u.hasClouds}`);
      L.push(`                         camera modes available: ${u.cameraModes.join(', ') || 'none'}`);
      L.push(`                         in-rock geometry named in the surface scene: ${u.sceneHints.length ? u.sceneHints.join(', ') : 'NONE'}`);
      if (m.canvas && !m.canvas.error) L.push(`                         top-of-frame luma ${m.canvas.sky.mean} (open sky reads bright)`);
    }
    if (r.setupError) L.push(`      SETUP ERROR ${r.setupError}`);
    if (r.failed && r.failed.length) for (const f of r.failed) L.push(`      VERIFY FAIL  ${f}`);
    if (r.errorLines && r.errorLines.length) for (const e of r.errorLines) L.push(`      CONSOLE ${e.split('\n')[0]}`);
  }
  L.push('');

  /* ── console ────────────────────────────────────────────────────────── */
  const errs = logs.filter((l) => l.startsWith('[error]') || l.startsWith('[pageerror]'));
  const warns = logs.filter((l) => l.startsWith('[warning]'));
  L.push(`── CONSOLE ─────────────────────────────────────────────────────────────`);
  L.push(`errors ${errs.length} · warnings ${warns.length} · total ${logs.length}`);
  L.push('');
  L.push(errs.slice(0, 120).join('\n'));
  L.push('');
  L.push('── ALL CONSOLE OUTPUT (first 400) ──────────────────────────────────────');
  L.push(logs.slice(0, 400).join('\n'));

  const text = L.join('\n') + '\n';
  writeFileSync(resolve(OUT, `${TAG ? TAG + '-' : ''}report.txt`), text, 'utf8');

  /* Machine-readable twin, so a later round can diff two runs numerically
     instead of a reviewer eyeballing two text files. */
  writeFileSync(
    resolve(OUT, `${TAG ? TAG + '-' : ''}report.json`),
    JSON.stringify({
      when: new Date().toISOString(), url: URL_, headed: HEADED, quality: QUALITY,
      budget: BUDGET, renderHealth: render || null,
      coverage: { methods: methods.length, rigs: rigs.length, shots: shot.length },
      skipped, unlisted,
      shots: results.map((r) => ({
        id: r.id, group: r.group, file: r.file, md5: r.md5, skipped: r.skipped || null, tookSec: r.tookSec || null,
        failed: r.failed || [], errors: r.errors || 0,
        metrics: r.metrics ? {
          fps: r.metrics.fps, ctxLost: r.metrics.ctxLost, frame: r.metrics.frame, surface: r.metrics.surface,
          section: r.metrics.section, rig: r.metrics.rig, texEstMB: r.metrics.texEstMB,
          particles: r.metrics.particles, canvas: r.metrics.canvas,
        } : null,
        ident: r.ident || null, extra: r.extra || null,
      })),
    }, null, 1), 'utf8');

  /* ── stdout summary ─────────────────────────────────────────────────── */
  const cut = L.findIndex((l) => l.startsWith('── PER-SHOT DETAIL'));
  process.stdout.write('\n' + L.slice(0, cut > 0 ? cut : L.length).join('\n') + '\n');
  process.stdout.write(`\nreport → shots/${TAG ? TAG + '-' : ''}report.txt (+ .json)\n`);
}

/* A crash used to leave a headed Chrome running with the GPU still claimed,
   and the NEXT run then failed to get a WebGL context at all. Always close. */
run()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { try { if (BROWSER) await BROWSER.close(); } catch { /* already gone */ } });
