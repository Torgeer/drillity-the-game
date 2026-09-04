/**
 * VFX verification for the six new methods — src/sim/vfx.js.
 *
 *   node tools/vfx-methods.mjs --headed              (required: see below)
 *   node tools/vfx-methods.mjs --headed --quality low
 *   node tools/vfx-methods.mjs --headed rc longhole
 *
 * tools/shoot.mjs has one live-sim state (15-groove-live). This is the
 * equivalent for each new method, plus the thing screenshots cannot do:
 * it MEASURES. For every method it runs the real sim in the real renderer,
 * polls `ctx.vfx.stats(true)` — the deep variant, which walks every live
 * slot — and reports, per particle KIND:
 *
 *   peak live count      is the effect running at all?
 *   min / max world size is it SIZED? A kind emitting 118/s at size exactly
 *                        0 costs a pool slot, a draw and a vertex shader
 *                        invocation and rasterises nothing. That bug shipped
 *                        for four review rounds and no aggregate caught it,
 *                        because the totals were healthy the whole time.
 *   total live vs cap    the per-tier particle budget, which is a hard cap
 *   draw calls, frame ms
 *
 * It also asserts the sim state the effects are driven from actually arrives
 * on state.drill at runtime — the second historical bug in this file's brief
 * was a HUD meter reading 0 for four rounds because the mirror was never
 * written. Reading TUNING is not evidence; reading the live mirror is.
 *
 * HEADLESS CANNOT BIND THE GPU ON THIS MACHINE. It falls back to SwiftShader,
 * where the frame times are meaningless and the sim runs too slowly to reach
 * the later beats (a pile's take-set, a bolt's resin spin) inside the window.
 * --headed is required and the script refuses without it.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'shots');
mkdirSync(OUT, { recursive: true });

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const QUALITY = flag('quality', 'high');
const BASE = flag('url', 'http://localhost:5178/');
const TAG = flag('tag', 'vfx');
const HEADED = argv.includes('--headed');
const URL_ = `${BASE}${BASE.includes('?') ? '&' : '?'}quality=${QUALITY}&shot`;
const only = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));

if (!HEADED) {
  console.error('--headed is required: headless Chrome falls back to SwiftShader here.');
  process.exit(2);
}

const TIER_BUDGET = { high: 12000, medium: 7000, low: 3000 };

/* One case per method. `kinds` is what MUST be alive and sized before the
   case passes; `absent` is what must NOT be — the negative assertions are
   half the point, because three of these methods are defined as much by what
   they do not emit as by what they do. */
const CASES = [
  {
    id: 'rc', method: 'rc', depth: 40, secs: 22,
    inputs: { feed: 0.55, rotation: 0.60, flush: 0.86 },
    kinds: ['rcChipStream', 'rcCycloneDust', 'rcRejectDust', 'rcInnerTube'],
    absent: ['cuttingChip'],          // RC returns up the INNER tube
    mirror: ['sampleBags', 'sampleRecovery', 'sampleHoldUp', 'sampleWet'],
  },
  {
    id: 'tunnel-jumbo', method: 'tunnel-jumbo', depth: 3, secs: 20,
    inputs: { feed: 0.50, rotation: 0.82, flush: 0.64 },
    kinds: ['faceSpray', 'faceMist', 'faceSlurry', 'faceWash'],
    absent: ['dustPlume', 'cuttingChip'],
    mirror: ['roundHolesDone', 'roundLength', 'roundPull'],
  },
  {
    id: 'longhole', method: 'longhole', depth: 6, secs: 26,
    inputs: { feed: 0.48, rotation: 0.80, flush: 0.70 },
    // uphole is only ~45 % of the fan, so the uphole kinds are checked
    // conditionally on d.uphole ever having been true in the window.
    kinds: ['cuttingChip'],
    upholeKinds: ['upholeFlush', 'upholeSludge'],
    absent: [],
    mirror: ['uphole', 'ringHole', 'deviationCue'],
  },
  {
    id: 'rockbolt', method: 'rockbolt', depth: 1.2, secs: 26,
    inputs: { feed: 0.46, rotation: 0.80, flush: 0.60 },
    kinds: ['faceWash'],
    beatKinds: { 'bolt-install': ['resinExtrude'] },
    absent: ['cuttingChip'],
    mirror: ['boltIndex', 'boltType', 'boltAnchorage'],
  },
  {
    id: 'driven-pile', method: 'driven-pile', depth: 4, secs: 22,
    inputs: { feed: 0.55, rotation: 0.55, flush: 0.50 },
    kinds: ['pileBurst'],
    // NO flush, NO annulus, NO carbide sparks off a 16 t ram on concrete.
    absent: ['cuttingChip', 'cuttingFines', 'dustPlume', 'dustBody', 'sparkStreak'],
    mirror: ['blows', 'setMm', 'toeDepth', 'headDamage', 'dollyCondition'],
  },
  {
    id: 'site-investigation', method: 'site-investigation', depth: 6, secs: 26, stratum: 'clay',
    inputs: { feed: 0.45, rotation: 0.55, flush: 0.60 },
    kinds: [],
    sptKinds: ['sptPuff'],
    absent: [],
    mirror: ['logQuality'],
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ONE BROWSER PER CASE. Sharing a single page across all six methods lost the
   page context partway through the run — each startDemoContract regenerates
   the whole geological profile and its textures, and six of those in one
   context is enough to take the renderer down. A method that cannot be
   measured is worse than a slow harness, so each case gets a clean session. */
const boot = async (logs) => {
  let browser = null;
  for (const channel of ['chrome', 'msedge']) {
    try {
      browser = await chromium.launch({
        channel, headless: false,
        args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--hide-scrollbars', '--mute-audio'],
      });
      break;
    } catch (e) { if (channel === 'msedge') throw e; }
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  });
  const page = await context.newPage();
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}\n${e.stack || ''}`));
  await page.goto(URL_, { waitUntil: 'load', timeout: 45_000 });
  await page.waitForFunction(() => !!window.__DRILLITY, null, { timeout: 20_000 });
  await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 120_000 })
    .catch(() => logs.push('[harness] boot never completed'));
  await sleep(1200);
  await page.keyboard.press('Space').catch(() => {});
  return { browser, page };
};

const run = async () => {
  const logs = [];
  const wanted = only.length ? CASES.filter((c) => only.some((o) => c.id.includes(o))) : CASES;
  const results = [];

  for (const c of wanted) {
   let browser = null, page = null;
   try {
    ({ browser, page } = await boot(logs));
    await page.evaluate(async (c) => {
      const g = window.__DRILLITY;
      await g.__qa.startDemoContract({ depth: c.depth, method: c.method });
      g.ui?.show?.('site');
      for (const k in c.inputs) g.sim?.setInput?.(k, c.inputs[k]);
    }, c);

    /* SAMPLE FROM NODE, NOT FROM requestAnimationFrame. A page-side rAF
       sampler measured zero frames in every case: a headed Playwright window
       that is not the frontmost one gets its rAF throttled or stopped
       outright, so the accumulator never ran and every effect looked dead.
       Polling from the driver is immune to that, and at 20 Hz against
       particle lives of 0.45 s and up it cannot miss a live effect —
       including the per-blow bursts, whose shortest kind lives 0.5 s. */
    const acc = {
      kinds: Object.create(null), minSize: Infinity, maxSize: 0,
      peakLive: 0, peakDraw: 0, frames: 0, msSum: 0, msMax: 0, fps: 0,
      programme: null, sectionReturn: Object.create(null), medium: Object.create(null),
      phases: Object.create(null),
      mirror: Object.create(null), upholeSeen: false, sptBlowsSeen: 0,
      beatKinds: Object.create(null),
    };
    const steps = Math.round(c.secs / 0.05);
    for (let i = 0; i < steps; i++) {
      const smp = await page.evaluate((c) => {
        const g = window.__DRILLITY;
        for (const k in c.inputs) g.sim?.setInput?.(k, c.inputs[k]);
        /* KEEP IT DRILLING. The first version restarted only on
           `sim.active === false` and measured 377 idle samples against 37
           drilling ones — four fifths of every window was spent watching a
           finished hole, which is exactly the "photographs a stalled string"
           failure tools/shoot.mjs already had to fix once. The sim stays
           `active` while its phase is 'idle', so the phase is what has to be
           watched. */
        const ph = g.state?.drill?.phase;
        const idle = g.sim?.active === false || ph === 'idle' || ph === 'done';
        // DWELL BEFORE RESTARTING. Restarting the instant the phase reads
        // 'idle' restarted it every 50 ms and the sim never got past its own
        // first frames: 2 drilling samples against 265 idle ones. 'idle' is
        // a transient the sim passes through, not a terminal state, so wait
        // half a second of it before assuming the hole is really over.
        window.__IDLE = idle ? (window.__IDLE || 0) + 1 : 0;
        if (g.state?.contract && window.__IDLE > 10) {
          window.__IDLE = 0;
          try { g.sim.startHole(g.state.contract); } catch (e) { /* done */ }
        }
        // A wash boring dies in rock by design (rockCeilingUcs 60), so an SI
        // rig seeking into nordic bedrock reports rop 0 and never drives an
        // SPT. Pin the bed the method is actually specified for.
        if (c.stratum) { try { g.sim?.debug?.forceStratum(c.stratum); } catch (e) { /* optional */ } }
        const s = g.vfx?.stats?.(true);
        const d = g.state?.drill;
        const mirror = Object.create(null);
        if (d) for (const k in d) {
          const v = d[k];
          if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') mirror[k] = v;
        }
        return {
          kinds: s ? Object.assign({}, s.kinds) : null,
          live: s ? s.live : 0, draw: s ? s.drawCalls : 0,
          minSize: s ? s.minSize : 0, maxSize: s ? s.maxSize : 0,
          programme: s ? s.programme : null, sectionReturn: s ? s.sectionReturn : null,
          fps: g.clock?.fps ?? 0, phase: d ? d.phase : '', mirror,
          medium: s ? s.medium : null,
        };
      }, c).catch(() => null);
      if (smp) {
        acc.frames++;
        if (smp.fps > acc.fps) acc.fps = smp.fps;
        if (smp.kinds) {
          for (const id in smp.kinds) {
            if (smp.kinds[id] > (acc.kinds[id] || 0)) acc.kinds[id] = smp.kinds[id];
          }
          if (smp.live > 0) {
            if (smp.minSize < acc.minSize) acc.minSize = smp.minSize;
            if (smp.maxSize > acc.maxSize) acc.maxSize = smp.maxSize;
          }
        }
        if (smp.live > acc.peakLive) acc.peakLive = smp.live;
        if (smp.draw > acc.peakDraw) acc.peakDraw = smp.draw;
        if (smp.programme) acc.programme = smp.programme;
        /* Distinct values, not the last one: these are derived every frame and
           the tail of a window is not representative of the middle of it. */
        if (smp.sectionReturn) acc.sectionReturn[smp.sectionReturn] =
          (acc.sectionReturn[smp.sectionReturn] || 0) + 1;
        if (smp.medium) acc.medium[smp.medium] = (acc.medium[smp.medium] || 0) + 1;
        const ph = smp.phase || '';
        acc.phases[ph] = (acc.phases[ph] || 0) + 1;
        // Which kinds are alive DURING a named beat — the only way to show
        // that resin extrudes on the resin spin and not at some other moment.
        if (ph && ph !== 'drilling' && smp.kinds) {
          let b = acc.beatKinds[ph];
          if (!b) b = acc.beatKinds[ph] = Object.create(null);
          for (const id in smp.kinds) {
            if (smp.kinds[id] > (b[id] || 0)) b[id] = smp.kinds[id];
          }
        }
        for (const k in smp.mirror) {
          const v = smp.mirror[k];
          if (typeof v === 'number') {
            if (!Number.isFinite(v)) continue;
            if (!(k in acc.mirror) || Math.abs(v) > Math.abs(acc.mirror[k])) acc.mirror[k] = v;
          } else if (v) acc.mirror[k] = v;
        }
        if (smp.mirror.uphole === true) acc.upholeSeen = true;
        if (typeof smp.mirror.sptBlows === 'number' && smp.mirror.sptBlows > acc.sptBlowsSeen) {
          acc.sptBlowsSeen = smp.mirror.sptBlows;
        }
      }
      await sleep(50);
    }
    // Frame timing comes from the game's own clock, which is measured inside
    // the frame loop and therefore not distorted by the poll cadence.
    acc.msSum = acc.fps > 0 ? 1000 / acc.fps : 0;
    acc.msMax = acc.msSum;
    acc.frames = 1;
    await page.screenshot({ path: resolve(OUT, `${TAG}-${c.id}.png`), animations: 'allow', timeout: 120000 })
      .catch(() => {});
    results.push({ c, acc });
    process.stdout.write(`ran ${c.id}\n`);
   } catch (e) {
    // A case that cannot run is a reported failure, not a lost report: the
    // five cases that did run still have to be looked at.
    logs.push(`[case:${c.id}] ${e.message}`);
    results.push({ c, acc: { error: e.message, kinds: {}, phases: {}, mirror: {} } });
    process.stdout.write(`FAILED ${c.id}: ${e.message}\n`);
   } finally {
    if (browser) await browser.close().catch(() => {});
   }
  }

  /* ── report ─────────────────────────────────────────────────────────── */
  const cap = TIER_BUDGET[QUALITY] ?? 12000;
  const lines = [];
  let fails = 0;
  const say = (s) => { lines.push(s); process.stdout.write(s + '\n'); };

  say(`VFX METHOD VERIFICATION — quality=${QUALITY}  cap=${cap}`);

  /* ── the source guard ──────────────────────────────────────────────────
     Driven piling's lesson is that the SET GAUGE LIES while the toe is
     crushing, and it only works while nothing shows the player the honest
     number before they notice the physical tell. A particle effect keyed to
     d.toeDamage would destroy that, and it would destroy it silently: the
     screenshots would look better, not worse. So it is asserted here rather
     than left to a comment nobody reads. */
  const SRC = readFileSync(resolve(ROOT, 'src/sim/vfx.js'), 'utf8');
  const leak = SRC.split(String.fromCharCode(10))
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => /toeDamage|d\.refused|blowsPer250/.test(l) && !/^\s*[*/]/.test(l));
  if (leak.length) {
    fails++;
    say(`  FAIL vfx.js reads the HONEST pile channel on ${leak.length} line(s):`);
    for (const [n, l] of leak) say(`       ${n}: ${l.trim()}`);
  } else {
    say('  ok   vfx.js never reads d.toeDamage — the set gauge keeps its lead');
  }
  for (const { c, acc } of results) {
    const k = acc.kinds || {};
    const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
    const frames = n(acc.frames), msSum = n(acc.msSum);
    const avg = frames ? msSum / frames : 0;
    const fps = avg ? 1000 / avg : 0;
    say('');
    say(`── ${c.id} ─────────────────────────────────────────────`);
    if (acc.error) { fails++; say(`  FAIL case did not run: ${acc.error}`); continue; }
    const hist = (o) => Object.keys(o || {}).map((x) => `${x}x${o[x]}`).join(' ') || '-';
    say(`  programme=${acc.programme}  sectionReturn: ${hist(acc.sectionReturn)}  medium: ${hist(acc.medium)}`);
    say(`  peak live ${n(acc.peakLive)} / ${cap}   draw ${n(acc.peakDraw)}   ` +
        `frame avg ${avg.toFixed(2)} ms (${fps.toFixed(1)} fps)  worst ${n(acc.msMax).toFixed(1)} ms`);
    say(`  size range ${n(acc.minSize).toFixed(4)} .. ${n(acc.maxSize).toFixed(3)} m`);
    if (acc.peakLive > cap) { fails++; say(`  FAIL over particle cap`); }
    if (acc.peakLive > 0 && !(acc.minSize > 0)) { fails++; say(`  FAIL a live particle has size <= 0`); }

    const want = c.kinds.slice();
    if (c.upholeKinds && acc.upholeSeen) want.push(...c.upholeKinds);
    if (c.sptKinds && acc.sptBlowsSeen > 0) want.push(...c.sptKinds);
    for (const id of want) {
      const v = k[id] || 0;
      if (v > 0) say(`  ok   ${id.padEnd(16)} peak ${v}`);
      else { fails++; say(`  FAIL ${id.padEnd(16)} never alive`); }
    }
    if (c.beatKinds) {
      for (const beat in c.beatKinds) {
        const seen = acc.beatKinds && acc.beatKinds[beat];
        for (const id of c.beatKinds[beat]) {
          const v = seen ? (seen[id] || 0) : 0;
          if (v > 0) say(`  ok   ${id.padEnd(16)} peak ${v} during beat '${beat}'`);
          else { fails++; say(`  FAIL ${id.padEnd(16)} never alive during beat '${beat}' (beat frames ${acc.phases?.[beat] || 0})`); }
        }
      }
    }
    for (const id of c.absent) {
      const v = k[id] || 0;
      if (v === 0) say(`  ok   ${id.padEnd(16)} correctly absent`);
      else { fails++; say(`  FAIL ${id.padEnd(16)} emitted ${v} — should never run for this method`); }
    }
    if (c.upholeKinds && !acc.upholeSeen) say(`  note d.uphole never true in the window; uphole kinds not exercised`);
    if (c.sptKinds && !acc.sptBlowsSeen) say(`  note no SPT blows in the window; sptPuff not exercised`);
    for (const m of c.mirror) {
      const v = acc.mirror ? acc.mirror[m] : undefined;
      if (v === undefined) { fails++; say(`  FAIL state.drill.${m} never arrived`); }
      else say(`  ok   state.drill.${m} = ${v}`);
    }
    say(`  phases seen: ${Object.keys(acc.phases || {}).map((k) => `${k || '(none)'}x${acc.phases[k]}`).join(', ')}`);
    const m = acc.mirror || {};
    say(`  diag: active=${m.active} rop=${n(m.rop).toFixed(2)} depth=${n(m.depth).toFixed(2)} ` +
        `holeDepth=${n(m.holeDepth).toFixed(2)} flush=${n(m.flush).toFixed(2)} ` +
        `rpm=${n(m.rpm).toFixed(2)}`);
  }

  const errs = logs.filter((l) => l.startsWith('[error]') || l.startsWith('[pageerror]'));
  say('');
  say(`CONSOLE ERRORS: ${errs.length}`);
  for (const e of errs.slice(0, 20)) say('  ' + e);
  say(`FAILURES: ${fails}`);

  writeFileSync(resolve(OUT, `${TAG}-methods-report.txt`), lines.join('\n') + '\n', 'utf8');
  process.exitCode = fails || errs.length ? 1 : 0;
};

run().catch((e) => { console.error(e); process.exit(1); });
