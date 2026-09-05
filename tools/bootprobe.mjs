/**
 * bootprobe — WHERE THE BOOT SECONDS ACTUALLY GO.
 *
 * ── WHY THIS EXISTS ────────────────────────────────────────────────────────
 * ASTRA §8: *"a gate over an empty set passes forever"*, and three separate
 * harnesses have been fooled by the boot screen — each waited a fixed
 * 1.5–2.2 s, measured whatever was on screen, and reported confidently on
 * nothing. The boot screen is a **27.8 s stall**, and until this file the
 * project had no instrument that could say what the 27.8 s WAS. "It feels
 * faster" is not a result, so this measures, repeatably, before and after.
 *
 * ── WHAT IT MEASURES, AND HOW ──────────────────────────────────────────────
 * An init script installed BEFORE any app code runs wraps the WebGL2 entry
 * points that can block the main thread, and timestamps every call:
 *
 *   compileShader          driver-side GLSL → IR. Usually cheap and async.
 *   linkProgram            the expensive one on ANGLE/D3D: HLSL translation
 *                          plus D3DCompile. Frequently deferred by the driver
 *                          until the result is asked for, which is why the
 *                          next two matter.
 *   getProgramParameter    three.js asks LINK_STATUS here; on ANGLE this is
 *                          the call that BLOCKS until the link finished.
 *   useProgram / draw*     a program that slipped past both of the above pays
 *                          on first use instead.
 *   texImage2D/3D,
 *   texSubImage2D,
 *   compressedTexImage2D   texture upload — the other candidate for a stall
 *                          this project could plausibly have, since
 *                          core/assets.js generates ~41 procedural kinds.
 *
 * Every call over THRESHOLD_MS is kept individually; everything is summed by
 * entry point. Nothing is sampled — a stall that happens once is exactly the
 * thing being hunted, and a sampler would miss it.
 *
 * It also records the app's own timeline from `window.__DRILLITY.bootMarks`
 * (main.js writes it) so a driver cost can be attributed to the system that
 * caused it, and reads `renderer.info.programs.length` at each mark.
 *
 * ── HOW TO READ THE OUTPUT ─────────────────────────────────────────────────
 * `bootMs` is the number that matters: navigationStart → the menu screen is
 * on screen and interactive. Everything else explains it.
 *
 * A run is COLD by construction — a fresh browser profile per run, so the
 * ANGLE shader disk cache cannot carry a previous run's D3D bytecode. That is
 * the player's first launch, which is the case worth defending. `--warmcache`
 * reuses one profile across the repeats to show the second-launch figure too;
 * the two are graded separately and never averaged together.
 *
 * ── USAGE ──────────────────────────────────────────────────────────────────
 *   node tools/bootprobe.mjs                 # 3 cold runs, headed
 *   node tools/bootprobe.mjs --runs 5
 *   node tools/bootprobe.mjs --warmcache     # shared profile: 2nd+ launches
 *   node tools/bootprobe.mjs --tag before    # writes shots/boot-before.json
 *   node tools/bootprobe.mjs --port 5178
 *
 * HEADED IS NOT OPTIONAL (ASTRA §2): headless Chrome cannot bind the discrete
 * GPU on this machine and reports either nothing or garbage. There is no
 * --headless flag on purpose.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, existsSync, createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { ensureServer } from './devserver.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = resolve(ROOT, 'shots');

/* ── args ─────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const flag = (name, dflt = null) => {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) return dflt;
  const v = argv[i + 1];
  return (v == null || v.startsWith('--')) ? true : v;
};
const RUNS = Number(flag('runs', 3)) || 3;
const PORT = String(flag('port', 5178));
const TAG = flag('tag', null);
const WARM_CACHE = argv.includes('--warmcache');
const QUALITY = flag('quality', null);
/**
 * `--dist` measures the SHIPPED artefact, not the dev server.
 *
 * This distinction turned out to be the whole story. On the vite dev server
 * every one of ~200 modules is a separate request that vite transforms on
 * demand, and `game/data.js` (6.8k lines), `world/geology.js` (7k) and
 * `core/assets.js` (5k) are three of them. That cost is REAL for a developer
 * and entirely ABSENT from `dist/index.html`, which is one file. A boot figure
 * that does not say which one it measured is not a figure.
 */
const DIST = argv.includes('--dist');
/** Individual calls slower than this are listed by name. */
const THRESHOLD_MS = Number(flag('threshold', 8)) || 8;
/** Hard ceiling on one run before we call it hung and say so. */
const RUN_TIMEOUT_MS = 180_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── the page-side instrument ─────────────────────────────────────────────── */
/**
 * Installed with addInitScript, so it is in place before three.js constructs
 * the context. It must not allocate per call in the common case — the wrapper
 * runs on every draw call in the game — so the fast path is two `performance
 * .now()` reads and an accumulate.
 */
function instrument(thresholdMs) {
  const T = { calls: {}, slow: [], t0: performance.now(), frames: [], events: [] };
  window.__BOOTPROBE = T;

  /* ── the frame timeline ────────────────────────────────────────────────
     A per-phase table can only see time spent inside boot(). The segment
     AFTER boot() is wall-clock in the rAF loop, and the only way to say what
     it is made of is to time every frame. This rAF chain starts before any
     app code and is the cheapest possible sampler: one push per frame. */
  let prev = performance.now();
  const tick = (now) => {
    T.frames.push(+(now - prev).toFixed(2));
    prev = now;
    if (T.frames.length < 6000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* ── when does each visible milestone actually land? ───────────────────
     Timed off the DOM rather than off the app, so it stays true even if the
     app's own reporting is wrong — which is the failure this whole file
     exists to stop repeating. */
  const stamp = (name) => {
    if (!T.events.some((e) => e.name === name)) {
      T.events.push({ name, at: +(performance.now() - T.t0).toFixed(1), frame: T.frames.length });
    }
  };
  const watch = () => {
    if (document.body) {
      if (document.body.classList.contains('booted')) stamp('body.booted');
      if (document.querySelector('.boot')) stamp('boot screen in DOM');
      if (document.querySelector('.boot.is-out')) stamp('boot screen plays out');
      const m = document.querySelector('.menu');
      if (m && m.getBoundingClientRect().height > 10) stamp('menu in DOM');
    }
    if (T.events.length < 12) requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);

  const bucket = (name) => (T.calls[name] || (T.calls[name] = { n: 0, ms: 0, maxMs: 0 }));

  const wrap = (proto, name) => {
    const orig = proto && proto[name];
    if (typeof orig !== 'function') return;
    proto[name] = function wrapped(...args) {
      const a = performance.now();
      const r = orig.apply(this, args);
      const dt = performance.now() - a;
      const b = bucket(name);
      b.n++; b.ms += dt;
      if (dt > b.maxMs) b.maxMs = dt;
      if (dt >= thresholdMs && T.slow.length < 400) {
        T.slow.push({ name, ms: +dt.toFixed(2), at: +(a - T.t0).toFixed(1) });
      }
      return r;
    };
  };

  /* WRAP EVERY ENTRY POINT, not a shortlist.
     The shortlist version of this file reported `linkProgram` at 1 ms and
     `getProgramParameter` at 26 ms against a 17.9 s first frame — i.e. it
     proved only that the cost was somewhere it was not looking. On ANGLE the
     D3D compile is deferred and surfaces at whichever call first needs the
     finished program, and guessing which one is exactly the mistake this file
     exists to stop. Enumerating the prototype cannot guess wrong. */
  for (const P of [window.WebGL2RenderingContext?.prototype, window.WebGLRenderingContext?.prototype]) {
    if (!P) continue;
    for (const n of Object.getOwnPropertyNames(P)) {
      const d = Object.getOwnPropertyDescriptor(P, n);
      if (!d || typeof d.value !== 'function' || n === 'constructor') continue;
      wrap(P, n);
    }
  }
}

/**
 * Read the whole picture out of one page, once. Runs in the browser.
 */
function collect() {
  const ctx = window.__DRILLITY || null;
  const T = window.__BOOTPROBE || null;
  const info = ctx && ctx.renderer && ctx.renderer.info;
  const nav = performance.getEntriesByType('navigation')[0] || null;
  const paints = {};
  for (const p of performance.getEntriesByType('paint')) paints[p.name] = +p.startTime.toFixed(1);
  return {
    marks: (ctx && ctx.bootMarks) ? ctx.bootMarks : null,
    bootFrames: (ctx && ctx.bootFrames) ? ctx.bootFrames : null,
    programs: info && info.programs ? info.programs.length : null,
    calls: T ? T.calls : null,
    slow: T ? T.slow : null,
    events: T ? T.events : null,
    frames: T ? T.frames : null,
    paints,
    domContentLoaded: nav ? +nav.domContentLoadedEventEnd.toFixed(1) : null,
    quality: ctx && ctx.quality ? ctx.quality.id : null,
    scene: ctx && ctx.state ? ctx.state.scene : null,
  };
}

/* ── one run ──────────────────────────────────────────────────────────────── */
async function once(origin, profileDir, i) {
  const url = origin + (QUALITY ? `/?quality=${QUALITY}` : '/');
  const t0 = Date.now();

  /* A PERSISTENT CONTEXT WITH ITS OWN PROFILE, not launch()+newContext().
     The thing being measured is partly ANGLE's on-disk shader cache, which
     lives in the browser profile — so "cold" has to mean a profile that has
     never seen this page. A fresh temp profile per run is the only way to say
     that honestly. --warmcache passes the SAME dir to every run instead. */
  /* `channel: 'chrome'` — the SYSTEM Chrome, exactly as tools/shoot.mjs does.
     Playwright's own chromium build is not installed in this tree, and it is
     the wrong subject anyway: the discrete GPU and its ANGLE shader cache are
     what the 27.8 s is made of. */
  const browser = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,           // headless cannot bind the GPU here — ASTRA §2
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage();
  await page.addInitScript(instrument, THRESHOLD_MS);

  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
  });

  let bootMs = null;
  let why = 'ok';
  try {
    await page.goto(url, { waitUntil: 'commit', timeout: 60_000 });

    /* THE END OF BOOT IS THE MENU BEING ON SCREEN, not `booted` and not a
       fixed wait. main.js sets `booted` and then hands the shell the menu;
       ui/shell.js holds the boot screen for BOOT_MIN_SEC and cross-fades. The
       player's boot is over when the thing they can press is there. */
    await page.waitForFunction(
      () => {
        const el = document.querySelector('.screen .menu, .menu');
        if (!el) return false;
        const r = el.getBoundingClientRect();
        if (r.width < 10 || r.height < 10) return false;
        const btn = el.querySelector('.btn');
        return !!btn && btn.getBoundingClientRect().width > 10;
      },
      null,
      { timeout: RUN_TIMEOUT_MS, polling: 100 },
    );
    bootMs = Date.now() - t0;
  } catch (e) {
    why = `TIMED OUT after ${((Date.now() - t0) / 1000).toFixed(1)} s: ${e.message.split('\n')[0]}`;
  }

  // let the frame loop settle one beat so post-boot compiles are attributed
  await sleep(600);

  let data = null;
  try { data = await page.evaluate(collect); }
  catch (e) { why += ` | collect failed: ${e.message}`; }

  await browser.close().catch(() => {});

  return { run: i, bootMs, why, consoleErrors, ...(data || {}) };
}

/* ── a static server for dist/, so the shipped file can be measured ───────── */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.glb': 'model/gltf-binary',
  '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2',
};
function serveDist(port) {
  const root = resolve(ROOT, 'dist');
  if (!existsSync(join(root, 'index.html'))) {
    throw new Error(`--dist asked for, but ${join(root, 'index.html')} does not exist. `
      + 'Run `npm run build` first: this gate has no subject, so it fails rather than passes.');
  }
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = join(root, p);
    if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, {
      'content-type': MIME[extname(file)] || 'application/octet-stream',
      /* no-store: a probe measuring a cold first launch may not be handed a
         304 for the 2.7 MB file it is timing. */
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) => {
    srv.listen(port, '127.0.0.1', () => ok({
      origin: `http://127.0.0.1:${port}`,
      spawned: true,
      stop: () => srv.close(),
    }));
  });
}

/* ── reporting ────────────────────────────────────────────────────────────── */
const med = (xs) => {
  const a = xs.filter((x) => Number.isFinite(x)).slice().sort((p, q) => p - q);
  if (!a.length) return null;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const f1 = (v) => (v == null ? '—' : (v / 1000).toFixed(2) + ' s');

function report(runs) {
  const boots = runs.map((r) => r.bootMs);
  console.log('');
  console.log('═══ BOOT ═══════════════════════════════════════════════════════');
  console.log(`  SUBJECT: ${DIST ? 'dist/index.html — THE SHIPPED SINGLE FILE' : 'the VITE DEV SERVER (not what ships)'}`);
  console.log(`  ${WARM_CACHE ? 'WARM shader cache (shared profile)' : 'COLD shader cache (fresh profile per run)'}`
    + `   ·   ${runs.length} run${runs.length === 1 ? '' : 's'}   ·   390x844 @2   ·   headed`);
  console.log('');
  console.log('  run   navigationStart -> menu interactive        programs');
  for (const r of runs) {
    console.log(`   ${String(r.run).padStart(2)}   ${String(f1(r.bootMs)).padStart(10)}`
      + `                             ${String(r.programs ?? '—').padStart(4)}`
      + (r.why !== 'ok' ? `   ${r.why}` : ''));
  }
  console.log('');
  console.log(`  MEDIAN  ${f1(med(boots))}     min ${f1(Math.min(...boots.filter(Number.isFinite)))}`
    + `   max ${f1(Math.max(...boots.filter(Number.isFinite)))}`);

  /* per-system, from main.js's own marks */
  const withMarks = runs.filter((r) => Array.isArray(r.marks) && r.marks.length);

  /* ── THE FOUR SEGMENTS OF BOOT ──────────────────────────────────────────
     This is the breakdown that matters, and it is the one that was missing.
     A per-system table can only account for the time INSIDE boot(); if the
     segments do not sum to the total, the remainder is the answer. */
  if (withMarks.length) {
    const seg = (fn) => med(withMarks.map(fn));
    const beforeBoot = seg((r) => r.marks[0].at - r.marks[0].ms);
    const inBoot = seg((r) => r.marks[r.marks.length - 1].at - (r.marks[0].at - r.marks[0].ms));
    const afterBoot = seg((r) => r.bootMs - r.marks[r.marks.length - 1].at);
    console.log('');
    console.log('  ── the four segments, median (this is the breakdown that matters) ──');
    const row = (label, ms, note) => {
      const pct = med(boots) ? (ms / med(boots) * 100) : 0;
      console.log(`   ${label.padEnd(34)} ${String((ms / 1000).toFixed(2)).padStart(7)} s`
        + ` ${pct.toFixed(1).padStart(5)} %   ${note}`);
    };
    row('page load -> boot() first line', beforeBoot,
      DIST ? 'parse+execute the single file' : 'VITE: ~200 module requests, transformed on demand');
    row('inside boot(): modules + init', inBoot, 'the systems table below');
    row('boot() end -> menu interactive', afterBoot, 'shell.js BOOT_MIN_SEC hold + cross-fade');
    console.log(`   ${'TOTAL'.padEnd(34)} ${String((med(boots) / 1000).toFixed(2)).padStart(7)} s`);
  }

  if (withMarks.length) {
    console.log('');
    console.log('  ── where it went, per phase (median of runs, main.js bootMarks) ──');
    const names = [];
    for (const m of withMarks[0].marks) if (!names.includes(m.name)) names.push(m.name);
    const rows = names.map((name) => {
      const ds = withMarks.map((r) => {
        const m = r.marks.find((x) => x.name === name);
        return m ? m.ms : null;
      });
      const ps = withMarks.map((r) => {
        const m = r.marks.find((x) => x.name === name);
        return m && m.programs != null ? m.programs : null;
      });
      return { name, ms: med(ds), programs: med(ps) };
    }).sort((a, b) => (b.ms || 0) - (a.ms || 0));
    const total = rows.reduce((s, r) => s + (r.ms || 0), 0);
    for (const r of rows) {
      const pct = total > 0 ? ((r.ms || 0) / total * 100) : 0;
      const bar = '█'.repeat(Math.round(pct / 2.5));
      console.log(`   ${r.name.padEnd(16)} ${String((r.ms ?? 0).toFixed(0)).padStart(7)} ms`
        + ` ${pct.toFixed(1).padStart(5)} %  ${bar}`);
    }
    console.log(`   ${'TOTAL'.padEnd(16)} ${String(total.toFixed(0)).padStart(7)} ms`);
  } else {
    console.log('');
    console.log('  ── no `__DRILLITY.bootMarks` on the page: main.js is not instrumented,');
    console.log('     so this run can only report the total. That is a gap, not a pass.');
  }

  /* ── milestones, off the DOM ─────────────────────────────────────────── */
  const ev = runs.find((r) => r.events && r.events.length);
  if (ev) {
    console.log('');
    console.log('  ── run 1, milestones as the DOM saw them ──');
    for (const e of ev.events) {
      console.log(`   t+${String((e.at / 1000).toFixed(2)).padStart(7)} s   frame ${String(e.frame).padStart(5)}   ${e.name}`);
    }
  }

  /* ── inside the first frames ─────────────────────────────────────────── */
  const bf = runs.find((r) => Array.isArray(r.bootFrames) && r.bootFrames.length);
  if (bf) {
    console.log('');
    console.log('  ── run 1, the first frames: main-thread ms per system ──');
    const names = Object.keys(bf.bootFrames[0].systems);
    const wide = names.filter((n) => bf.bootFrames.some((f) => f.systems[n] >= 1));
    console.log('   frame  ' + wide.map((n) => n.slice(0, 8).padStart(9)).join('')
      + '     render     TOTAL  programs');
    for (const f of bf.bootFrames) {
      console.log(`   ${String(f.frame).padStart(5)}  `
        + wide.map((n) => String(f.systems[n] ?? 0).padStart(9)).join('')
        + `${String(f.renderMs).padStart(11)}${String(f.totalMs).padStart(10)}`
        + `${String(f.programs ?? '—').padStart(10)}`);
    }
  }

  /* ── frame pacing after boot() ───────────────────────────────────────── */
  const fr = runs.find((r) => Array.isArray(r.frames) && r.frames.length);
  if (fr) {
    const f = fr.frames;
    const sorted = f.slice().sort((a, b) => a - b);
    const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
    const over = (ms) => f.filter((x) => x > ms).length;
    console.log('');
    console.log('  ── run 1, frame pacing over the whole boot (ms between rAFs) ──');
    console.log(`   frames ${f.length}   median ${p(0.5).toFixed(1)}   p90 ${p(0.9).toFixed(1)}`
      + `   p99 ${p(0.99).toFixed(1)}   worst ${sorted[sorted.length - 1].toFixed(1)}`);
    console.log(`   frames over 100 ms: ${over(100)}   over 33 ms: ${over(33)}`
      + `   total stall in frames > 33 ms: ${(f.filter((x) => x > 33).reduce((s, x) => s + x, 0) / 1000).toFixed(2)} s`);
  }

  /* driver cost */
  const anyCalls = runs.find((r) => r.calls);
  if (anyCalls) {
    console.log('');
    console.log('  ── main-thread time inside the GL driver (median across runs) ──');
    const names = new Set();
    for (const r of runs) for (const k of Object.keys(r.calls || {})) names.add(k);
    const rows = [...names].map((k) => ({
      name: k,
      ms: med(runs.map((r) => r.calls?.[k]?.ms)),
      n: med(runs.map((r) => r.calls?.[k]?.n)),
      maxMs: med(runs.map((r) => r.calls?.[k]?.maxMs)),
    })).filter((r) => (r.ms || 0) >= 1).sort((a, b) => b.ms - a.ms);
    if (!rows.length) console.log('   (nothing over 1 ms — the stall is not in the driver)');
    for (const r of rows) {
      console.log(`   ${r.name.padEnd(22)} ${String(r.ms.toFixed(0)).padStart(7)} ms`
        + `   n=${String(r.n).padStart(6)}   worst ${r.maxMs.toFixed(1)} ms`);
    }
  }

  const slow = runs[0]?.slow;
  if (slow && slow.length) {
    console.log('');
    console.log(`  ── run 1: the ${Math.min(12, slow.length)} slowest single GL calls (>= ${THRESHOLD_MS} ms) ──`);
    for (const s of slow.slice().sort((a, b) => b.ms - a.ms).slice(0, 12)) {
      console.log(`   t+${String((s.at / 1000).toFixed(2)).padStart(6)} s   ${s.name.padEnd(22)} ${s.ms.toFixed(1)} ms`);
    }
  }

  const errs = runs.flatMap((r) => r.consoleErrors || []);
  if (errs.length) {
    console.log('');
    console.log('  ── console errors ──');
    for (const e of [...new Set(errs)].slice(0, 8)) console.log('   ' + e);
  }
  console.log('');
}

/* ── main ─────────────────────────────────────────────────────────────────── */
const server = DIST ? await serveDist(PORT) : await ensureServer(PORT);
if (DIST) console.log(`  serving dist/ on ${server.origin}`);
const runs = [];
const profiles = [];
const shared = resolve(tmpdir(), `drillity-bootprobe-shared-${process.pid}`);
try {
  for (let i = 1; i <= RUNS; i++) {
    const dir = WARM_CACHE ? shared : resolve(tmpdir(), `drillity-bootprobe-${process.pid}-${i}`);
    if (!profiles.includes(dir)) profiles.push(dir);
    process.stdout.write(`  run ${i}/${RUNS} … `);
    const r = await once(server.origin, dir, i);
    runs.push(r);
    console.log(`${f1(r.bootMs)}  (${r.programs ?? '—'} programs)${r.why === 'ok' ? '' : '  ' + r.why}`);
    await sleep(500);
  }
} finally {
  server.stop();
  for (const d of profiles) { try { rmSync(d, { recursive: true, force: true }); } catch { /* noop */ } }
}

report(runs);

if (TAG && TAG !== true) {
  mkdirSync(OUT, { recursive: true });
  const path = resolve(OUT, `boot-${TAG}.json`);
  writeFileSync(path, JSON.stringify({
    tag: TAG,
    when: new Date().toISOString(),
    cache: WARM_CACHE ? 'warm' : 'cold',
    viewport: '390x844@2',
    runs,
    medianBootMs: med(runs.map((r) => r.bootMs)),
  }, null, 2));
  console.log(`  written ${path}`);
}

/* A run that never reached the menu is a failure, not a slow pass. */
if (runs.some((r) => r.bootMs == null)) process.exit(1);
