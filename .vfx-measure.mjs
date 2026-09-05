/**
 * vfx measurement — scratchpad harness (does NOT live in tools/, which is
 * owned by another agent). Same intent as tools/vfx-methods.mjs but fixes the
 * two things that stopped that script measuring anything useful:
 *
 *   1. it restarted the hole from `g.state.contract`, which progression.js
 *      CLEARS on settlement — so after the first hole the window sat idle
 *      (measured: 387 idle samples against 29 drilling ones). This stashes the
 *      contract at t0 and restarts from the stash.
 *   2. it never measured the COST of the particles, only their presence. This
 *      A/Bs the four `vfx:*` meshes off and on at the same sim state, which is
 *      the only honest fill-rate signal available without a GPU timer query.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const QUALITY = flag('quality', 'high');
const BASE = flag('url', 'http://localhost:5181/');
const OUT = flag('out', 'vfx-measure.txt');
const SECS = Number(flag('secs', 26));
const URL_ = `${BASE}${BASE.includes('?') ? '&' : '?'}quality=${QUALITY}&shot`;
const only = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));

const TIER_BUDGET = { high: 12000, medium: 7000, low: 3000 };

const CASES = [
  { id: 'rc', method: 'rc', depth: 40, inputs: { feed: 0.55, rotation: 0.60, flush: 0.86 },
    kinds: ['rcChipStream', 'rcCycloneDust', 'rcRejectDust', 'rcInnerTube'],
    absent: ['cuttingChip'], mirror: ['sampleBags', 'sampleWet', 'sampleHoldUp'] },
  /* UNDERGROUND: `motes` is env's medium's job, `birds` do not fly in a
     drive, and `exhaustLight` is a sun-backlit rim under 300 m of rock. The
     jumbo additionally drills on MAINS, so its diesel plume must be off. */
  { id: 'tunnel-jumbo', method: 'tunnel-jumbo', depth: 3, inputs: { feed: 0.50, rotation: 0.82, flush: 0.64 },
    kinds: ['faceSpray', 'faceMist', 'faceSlurry', 'faceWash'],
    absent: ['dustPlume', 'cuttingChip', 'motes', 'exhaustLight', 'exhaustSmoke', 'exhaustSoot'],
    mirror: ['roundHolesDone', 'roundPull', 'powerMode'] },
  { id: 'longhole', method: 'longhole', depth: 6, inputs: { feed: 0.48, rotation: 0.80, flush: 0.70 },
    kinds: ['cuttingChip'], upholeKinds: ['upholeFlush', 'upholeSludge'],
    absent: ['motes', 'exhaustLight'], mirror: ['uphole', 'ringHole'] },
  { id: 'rockbolt', method: 'rockbolt', depth: 1.2, inputs: { feed: 0.46, rotation: 0.80, flush: 0.60 },
    kinds: ['faceWash'], beatKinds: { 'bolt-install': ['resinExtrude', 'groutReturn'] },
    absent: ['cuttingChip', 'motes', 'exhaustLight'], mirror: ['boltIndex', 'boltType'] },
  { id: 'driven-pile', method: 'driven-pile', depth: 4, inputs: { feed: 0.55, rotation: 0.55, flush: 0.50 },
    kinds: ['pileBurst'],
    absent: ['cuttingChip', 'cuttingFines', 'dustPlume', 'dustBody', 'sparkStreak'],
    mirror: ['blows', 'headDamage', 'dollyCondition'] },
  /* JET GROUTING. Shallow on purpose: the spoil only exists on the SECOND
     pass, so the window has to outlast the pre-drill (about 16 s at 4 m).
     The inputs are the LIFT's own optimum — ADVANCE = withdrawal rate, WORK =
     jet pressure (0.62 -> 434 bar, clear of EN 12716's 250 bar floor),
     PROTECT = rotation — which also drills the pre-drill acceptably.
     `spoilWell` / `spoilOverflow` / `spoilRise` must be ALIVE and non-zero in
     size; the mud ROTARY's spray must not be, because a jetting collar does
     not spray — it wells up and overflows. Run with --secs 60. */
  { id: 'jet-grouting', method: 'jet-grouting', depth: 3, stratum: 'clay',
    inputs: { feed: 0.45, rotation: 0.62, flush: 0.55 },
    kinds: ['spoilWell', 'spoilOverflow', 'spoilRise'],
    /* `sprayDrops` is NOT in this list and must not be: the PRE-DRILL is an
       ordinary mud-flushed rotary hole and does spray. What must be true is
       that the spoil belongs to the LIFT — and the mirror below is what proves
       it, because drilling.js publishes `jetBar` on no other pass. `sprayGlint`
       is the water branch and never fires for a mud method. */
    absent: ['sprayGlint'],
    mirror: ['jetBar', 'return01', 'column01', 'stage', 'columnWorst01'] },
  { id: 'site-investigation', method: 'site-investigation', depth: 6, stratum: 'clay',
    inputs: { feed: 0.45, rotation: 0.55, flush: 0.60 },
    kinds: [], sptKinds: ['sptPuff'],
    // The CPT half must throw nothing. Asserted below via cptKinds.
    absent: [], mirror: ['logQuality'] },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const boot = async (logs) => {
  let browser = null;
  for (const channel of ['chrome', 'msedge']) {
    try {
      browser = await chromium.launch({ channel, headless: false,
        args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--hide-scrollbars', '--mute-audio'] });
      break;
    } catch (e) { if (channel === 'msedge') throw e; }
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  await page.goto(URL_, { waitUntil: 'load', timeout: 45_000 });
  await page.waitForFunction(() => !!window.__DRILLITY, null, { timeout: 20_000 });
  await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 120_000 })
    .catch(() => logs.push('[harness] boot never completed'));
  await sleep(1200);
  await page.keyboard.press('Space').catch(() => {});
  // Freeze three's per-frame info reset so draw calls are the real last-frame
  // number rather than whatever the reset left behind.
  await page.evaluate(() => { try { window.__DRILLITY.renderer.gl.info.autoReset = false; } catch (e) {} });
  return { browser, page };
};

/** Sample once. Also stashes the contract and restarts the hole from the stash. */
const SAMPLE = (c) => {
  const g = window.__DRILLITY;
  for (const k in c.inputs) g.sim?.setInput?.(k, c.inputs[k]);
  const hadContract = !!g.state?.contract;
  if (g.state?.contract && !window.__C) window.__C = g.state.contract;
  // Put it back. progression.js nulls state.contract at settlement and
  // env/terrain/data all poll it, so without this the whole downstream stack
  // walks back to the garage default and the measurement is of `auger`.
  if (window.__C && !g.state.contract) g.state.contract = window.__C;
  const ph = g.state?.drill?.phase;
  const idle = g.sim?.active === false || ph === 'idle' || ph === 'done';
  window.__IDLE = idle ? (window.__IDLE || 0) + 1 : 0;
  if (window.__C && window.__IDLE > 8) {
    window.__IDLE = 0;
    /* A ONE-HOLE CONTRACT SETTLES AND THE SHELL LEAVES FOR THE RESULTS
       SCREEN, at which point vfx correctly fades to nothing and the window
       measures an empty stage. Go back to the site before restarting, or the
       measurement is of a screen the effects are not on. */
    try { g.ui?.show?.('site'); } catch (e) {}
    // Restart from the STASH, never from the live field.
    try { g.sim.startHole(window.__C); } catch (e) {}
  }
  if (c.stratum) { try { g.sim?.debug?.forceStratum(c.stratum); } catch (e) {} }
  const s = g.vfx?.stats?.(true);
  const d = g.state?.drill;
  const gl = g.renderer?.gl;
  const mirror = Object.create(null);
  if (d) for (const k in d) { const v = d[k];
    if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') mirror[k] = v; }
  return {
    kinds: s ? Object.assign({}, s.kinds) : null,
    live: s ? s.live : 0, minSize: s ? s.minSize : 0, maxSize: s ? s.maxSize : 0,
    layers: s ? JSON.parse(JSON.stringify(s.layers)) : null,
    chips: s ? s.chips.live : 0,
    programme: s ? s.programme : null, sectionReturn: s ? s.sectionReturn : null,
    medium: s ? s.medium : null, loadScale: s ? s.loadScale : 1,
    calls: gl ? gl.info.render.calls : 0, tris: gl ? gl.info.render.triangles : 0,
    fps: g.clock?.fps ?? 0, phase: d ? d.phase : '',
    simMethod: g.sim?.methodId ?? null, hasContract: hadContract,
    powerMode: s ? s.powerMode : '', underground: s ? s.underground : null,
    envUg: g.env?.undergroundId ?? null,
    mirror,
  };
};

/** Turn the four particle meshes off / on. Returns how many were toggled. */
const TOGGLE = (on) => {
  const g = window.__DRILLITY;
  let n = 0;
  const walk = (sc) => sc && sc.traverse((o) => {
    if (o.name && o.name.indexOf('vfx:') === 0) { o.visible = on; n++; }
  });
  walk(g.scene); walk(g.sectionScene);
  return n;
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
        window.__C = null; window.__IDLE = 0;
        // Take the contract from the RETURN VALUE. Reading it back off
        // state.contract afterwards raced the settlement clear and lost it on
        // two of six methods, which then measured `auger` for 500 samples.
        window.__C = await g.__qa.startDemoContract({ depth: c.depth, method: c.method });
        g.ui?.show?.('site');
        for (const k in c.inputs) g.sim?.setInput?.(k, c.inputs[k]);
      }, c);

      const acc = { kinds: Object.create(null), minSize: Infinity, maxSize: 0,
        peakLive: 0, peakCalls: 0, peakTris: 0, peakChips: 0, layerPeak: {},
        drillFrames: 0, liveFrames: 0, frames: 0, fpsSum: 0, fpsMin: 1e9, fpsMax: 0,
        programme: null, sectionReturn: {}, medium: {}, phases: {},
        mirror: Object.create(null), upholeSeen: false, sptBlowsSeen: 0,
        beatKinds: Object.create(null), simMethod: {}, contractSeen: 0, contractGone: 0,
        loadScaleMin: 1, powerMode: {}, underground: {}, envUg: {} };
      const steps = Math.round(SECS / 0.05);
      for (let i = 0; i < steps; i++) {
        const s = await page.evaluate(SAMPLE, c).catch(() => null);
        if (!s) { await sleep(50); continue; }
        acc.frames++;
        if (s.phase === 'drilling') acc.drillFrames++;
        if (s.fps > 0) { acc.fpsSum += s.fps; if (s.fps < acc.fpsMin) acc.fpsMin = s.fps; if (s.fps > acc.fpsMax) acc.fpsMax = s.fps; }
        /* ONLY COUNT WHILE THE METHOD IS ACTUALLY LIVE. The peak accumulator
           otherwise spans the boot frames (a surface site, before any
           contract) and every frame after the settlement clear walks the sim
           back to `auger` — so an effect correctly suppressed underground
           still shows a peak, left over from a completely different scene.
           `sim.methodId` is the discriminator because it is the one field
           that is the running method by construction. */
        const live = s.simMethod === c.method;
        if (live) acc.liveFrames++;
        if (live && s.kinds) for (const id in s.kinds) if (s.kinds[id] > (acc.kinds[id] || 0)) acc.kinds[id] = s.kinds[id];
        if (s.live > 0) { if (s.minSize < acc.minSize) acc.minSize = s.minSize; if (s.maxSize > acc.maxSize) acc.maxSize = s.maxSize; }
        if (s.live > acc.peakLive) acc.peakLive = s.live;
        if (s.calls > acc.peakCalls) acc.peakCalls = s.calls;
        if (s.tris > acc.peakTris) acc.peakTris = s.tris;
        if (s.chips > acc.peakChips) acc.peakChips = s.chips;
        if (s.loadScale < acc.loadScaleMin) acc.loadScaleMin = s.loadScale;
        if (s.layers) for (const L in s.layers) {
          const p = acc.layerPeak[L] || (acc.layerPeak[L] = { live: 0, capacity: s.layers[L].capacity });
          if (s.layers[L].live > p.live) p.live = s.layers[L].live;
        }
        if (s.programme) acc.programme = s.programme;
        if (s.sectionReturn) acc.sectionReturn[s.sectionReturn] = (acc.sectionReturn[s.sectionReturn] || 0) + 1;
        if (s.medium) acc.medium[s.medium] = (acc.medium[s.medium] || 0) + 1;
        if (s.simMethod) acc.simMethod[s.simMethod] = (acc.simMethod[s.simMethod] || 0) + 1;
        if (s.hasContract) acc.contractSeen++; else acc.contractGone++;
        acc.powerMode[s.powerMode || '(none)'] = (acc.powerMode[s.powerMode || '(none)'] || 0) + 1;
        acc.underground[String(s.underground)] = (acc.underground[String(s.underground)] || 0) + 1;
        acc.envUg[String(s.envUg)] = (acc.envUg[String(s.envUg)] || 0) + 1;
        const ph = s.phase || '';
        acc.phases[ph] = (acc.phases[ph] || 0) + 1;
        if (live && ph && ph !== 'drilling' && s.kinds) {
          const b = acc.beatKinds[ph] || (acc.beatKinds[ph] = Object.create(null));
          for (const id in s.kinds) if (s.kinds[id] > (b[id] || 0)) b[id] = s.kinds[id];
        }
        for (const k in s.mirror) { const v = s.mirror[k];
          if (typeof v === 'number') { if (Number.isFinite(v) && (!(k in acc.mirror) || Math.abs(v) > Math.abs(acc.mirror[k]))) acc.mirror[k] = v; }
          else if (v) acc.mirror[k] = v; }
        if (s.mirror.uphole === true) acc.upholeSeen = true;
        if (typeof s.mirror.sptBlows === 'number' && s.mirror.sptBlows > acc.sptBlowsSeen) acc.sptBlowsSeen = s.mirror.sptBlows;
        await sleep(50);
      }

      /* ── A/B: what do the particles actually COST? ──────────────────────
         Same sim state, same frame, meshes off then on. 2.5 s each way, and
         the sim keeps running so the emitters stay loaded either way. */
      const ab = { onFps: 0, offFps: 0, toggled: 0, onCalls: 0, offCalls: 0, onTris: 0, offTris: 0 };
      for (const mode of ['off', 'on']) {
        ab.toggled = await page.evaluate(TOGGLE, mode === 'on').catch(() => 0);
        await sleep(900);   // let the fps window (0.5 s) refill
        let n = 0, sum = 0, calls = 0, tris = 0;
        for (let i = 0; i < 32; i++) {
          const s = await page.evaluate(SAMPLE, c).catch(() => null);
          if (s && s.fps > 0) { sum += s.fps; n++; if (s.calls > calls) calls = s.calls; if (s.tris > tris) tris = s.tris; }
          await sleep(50);
        }
        if (mode === 'on') { ab.onFps = n ? sum / n : 0; ab.onCalls = calls; ab.onTris = tris; }
        else { ab.offFps = n ? sum / n : 0; ab.offCalls = calls; ab.offTris = tris; }
      }
      acc.ab = ab;

      results.push({ c, acc });
      process.stdout.write(`ran ${c.id}\n`);
    } catch (e) {
      logs.push(`[case:${c.id}] ${e.message}`);
      results.push({ c, acc: { error: e.message, kinds: {}, phases: {}, mirror: {} } });
      process.stdout.write(`FAILED ${c.id}: ${e.message}\n`);
    } finally { if (browser) await browser.close().catch(() => {}); }
  }

  const cap = TIER_BUDGET[QUALITY] ?? 12000;
  const lines = [];
  const say = (s) => { lines.push(s); process.stdout.write(s + '\n'); };
  let fails = 0;
  say(`VFX MEASUREMENT — quality=${QUALITY}  cap=${cap}  window=${SECS}s`);
  for (const { c, acc } of results) {
    say('');
    say(`── ${c.id} ──────────────────────────────────────────`);
    if (acc.error) { fails++; say(`  FAIL did not run: ${acc.error}`); continue; }
    const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
    const hist = (o) => Object.keys(o || {}).map((x) => `${x}x${o[x]}`).join(' ') || '-';
    say(`  programme=${acc.programme}  sectionReturn: ${hist(acc.sectionReturn)}  medium: ${hist(acc.medium)}`);
    say(`  sim.methodId: ${hist(acc.simMethod)}   state.contract present ${acc.contractSeen} / CLEARED ${acc.contractGone}`);
    say(`  underground: ${hist(acc.underground)}  env.undergroundId: ${hist(acc.envUg)}  powerMode: ${hist(acc.powerMode)}`);
    say(`  samples ${acc.frames} (drilling ${acc.drillFrames}, method live ${acc.liveFrames})   phases: ${hist(acc.phases)}`);
    say(`  NOTE per-kind peaks below are counted ONLY over the ${acc.liveFrames} frames where sim.methodId === '${c.method}'.`);
    say(`  peak live ${n(acc.peakLive)} / ${cap}   chips ${n(acc.peakChips)}   size ${n(acc.minSize).toFixed(4)}..${n(acc.maxSize).toFixed(3)} m`);
    for (const L in acc.layerPeak) say(`    pool ${L.padEnd(12)} ${acc.layerPeak[L].live} / ${acc.layerPeak[L].capacity}`);
    say(`  draw calls peak ${n(acc.peakCalls)}   tris peak ${n(acc.peakTris)}   loadScale min ${n(acc.loadScaleMin).toFixed(2)}`);
    say(`  fps min ${n(acc.fpsMin) === 1e9 ? 0 : n(acc.fpsMin).toFixed(1)} / avg ${(acc.frames ? acc.fpsSum / acc.frames : 0).toFixed(1)} / max ${n(acc.fpsMax).toFixed(1)}`);
    if (acc.ab) {
      const on = acc.ab.onFps, off = acc.ab.offFps;
      const dms = on > 0 && off > 0 ? (1000 / on - 1000 / off) : 0;
      say(`  A/B particles on ${on.toFixed(1)} fps (${on ? (1000 / on).toFixed(2) : '-'} ms, ${acc.ab.onCalls} calls) ` +
          `vs off ${off.toFixed(1)} fps (${off ? (1000 / off).toFixed(2) : '-'} ms, ${acc.ab.offCalls} calls)`);
      say(`     -> particle cost ${dms.toFixed(2)} ms/frame   draw-call cost ${acc.ab.onCalls - acc.ab.offCalls}   meshes toggled ${acc.ab.toggled}`);
    }
    const want = c.kinds.slice();
    if (c.upholeKinds && acc.upholeSeen) want.push(...c.upholeKinds);
    if (c.sptKinds && acc.sptBlowsSeen > 0) want.push(...c.sptKinds);
    for (const id of want) {
      const v = acc.kinds[id] || 0;
      if (v > 0) say(`  ok   ${id.padEnd(16)} peak ${v}`); else { fails++; say(`  FAIL ${id.padEnd(16)} never alive`); }
    }
    if (c.beatKinds) for (const beat in c.beatKinds) {
      const seen = acc.beatKinds[beat];
      const any = c.beatKinds[beat].some((id) => seen && seen[id] > 0);
      say(`  ${any ? 'ok  ' : 'FAIL'} beat '${beat}' (${acc.phases[beat] || 0} frames): ` +
          c.beatKinds[beat].map((id) => `${id}=${seen ? (seen[id] || 0) : 0}`).join(' '));
      if (!any && (acc.phases[beat] || 0) > 0) fails++;
    }
    for (const id of c.absent) {
      const v = acc.kinds[id] || 0;
      if (v === 0) say(`  ok   ${id.padEnd(16)} correctly absent`);
      else { fails++; say(`  FAIL ${id.padEnd(16)} emitted ${v}`); }
    }
    if (c.upholeKinds && !acc.upholeSeen) say(`  note d.uphole never true in the window`);
    if (c.sptKinds && !acc.sptBlowsSeen) say(`  note no SPT blows in the window`);
    for (const m of c.mirror) {
      const v = acc.mirror[m];
      if (v === undefined) { fails++; say(`  FAIL state.drill.${m} never arrived`); } else say(`  ok   state.drill.${m} = ${v}`);
    }
    // Every kind that was ever alive, so nothing runs unnoticed.
    const alive = Object.keys(acc.kinds).filter((k) => acc.kinds[k] > 0)
      .sort((a, b) => acc.kinds[b] - acc.kinds[a]).map((k) => `${k}:${acc.kinds[k]}`);
    say(`  ALL LIVE KINDS: ${alive.join(' ') || '(none)'}`);
  }
  const errs = logs.filter((l) => l.startsWith('[error]') || l.startsWith('[pageerror]'));
  say('');
  say(`CONSOLE ERRORS: ${errs.length}`);
  for (const e of errs.slice(0, 25)) say('  ' + e);
  say(`FAILURES: ${fails}`);
  writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');
};

run().catch((e) => { console.error(e); process.exit(1); });
