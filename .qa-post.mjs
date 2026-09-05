/**
 * POST-CHAIN cost, per tier — and the LOW-tier AA decision, measured.
 *
 *   node .qa-post.mjs [--tiers high,medium,low] [--method dth] [--tag t]
 *
 * Two questions, both A/B PAIRED so a GPU still clocking up cannot report the
 * post chain as free (an unpaired first attempt did exactly that):
 *
 *  1. What does each composer pass cost, per tier? Each pass is toggled off
 *     and on three times; the cost is the MEDIAN of the paired differences,
 *     never a single before/after.
 *  2. `postScale` at LOW. LOW has no SMAA and supersamples the whole chain at
 *     1.15 linear (1.32x the fragments) instead. This measures that directly
 *     — frame time at 1.15 against 1.0 — and pairs it with an edge metric so
 *     the AA it buys is a number too, not an opinion.
 *
 * Timing is CPU wall clock around render() with a glFinish(), same as
 * .perf-post.mjs: coarse, but it is the whole GPU stall and it is honest.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const TIERS = (flag('tiers', 'high,medium,low')).split(',');
const METHOD = flag('method', 'dth');
const TAG = flag('tag', 'post');
/* renderer.resize() clamps dpr to the tier's dprCap, so the fill-bound regime
   cannot be reached by asking for a bigger pixel ratio — it has to be a bigger
   VIEWPORT. --vp 1170x2532 is 3x the phone in CSS px and 11.8 Mpx at dpr 2. */
const VP = flag('vp', null);

const PHONE = {
  ...devices['iPhone 13 Pro'],
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2, isMobile: true, hasTouch: true,
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  channel: 'chrome', headless: false,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--hide-scrollbars', '--mute-audio'],
});
const ctxOpts = { ...PHONE };
if (VP) { const [w, h] = VP.split('x').map(Number); ctxOpts.viewport = { width: w, height: h }; }
const page = await (await browser.newContext(ctxOpts)).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e).slice(0, 200)));
await page.routeWebSocket(/.*/, () => {}).catch(() => {});

const report = { when: new Date().toISOString(), method: METHOD, tiers: {}, errors };

for (const tier of TIERS) {
  await page.goto(`http://localhost:5178/?quality=${tier}&shot`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.__qa, { timeout: 30000 });
  await sleep(2200);
  await page.evaluate(async (M) => {
    const c = window.__DRILLITY;
    const d = c.data;
    const regions = (d.REGIONS || []).filter((rg) => d.methodsForRegion
      && d.methodsForRegion(rg.id, d.MAX_LEVEL || 60).some((m) => m.id === M));
    try { await c.__qa.startDemoContract({ method: M, region: regions[0] && regions[0].id, depth: 8 }); }
    catch (e) { void e; }
  }, METHOD);
  await page.waitForFunction(() => {
    const c = window.__DRILLITY;
    return c && c.state && c.state.scene === 'site' && c.hud;
  }, { timeout: 20000 }).catch(() => {});
  await sleep(2600);

  const out = await page.evaluate(async () => {
    const c = window.__DRILLITY;
    const gl = c.gl;
    const comp = c.composer;

    /* ── timing core: wall clock + glFinish, median of the tail ────────
       performance.now() is clamped to 100 us in a non-isolated context, and a
       1.5 ms frame quantised to 0.1 ms cannot resolve a 0.05 ms pass — the
       first run of this probe returned pass costs of exactly 0.0 and -0.1 ms,
       which is the quantiser, not the GPU. So each SAMPLE times a batch of
       BATCH renders and divides, which divides the quantisation error by
       BATCH as well. */
    const BATCH = 12;
    const time = (samples) => new Promise((res) => {
      const dt = []; let n = 0;
      const tick = () => {
        const t0 = performance.now();
        for (let k = 0; k < BATCH; k++) c.renderer.render(0.016);
        gl.getContext().finish();       // wait for the GPU, else we time the queue
        dt.push((performance.now() - t0) / BATCH);
        if (++n < samples) requestAnimationFrame(tick);
        else { const s = dt.slice(3).sort((a, b) => a - b); res(s[s.length >> 1]); }
      };
      requestAnimationFrame(tick);
    });

    /* long warm-up: the GPU clocks up for seconds, and an unpaired first
       measurement taken during that ramp reports everything as free */
    for (let i = 0; i < 6; i++) await time(12);

    const pairedCost = async (off, on) => {
      const d = [];
      for (let i = 0; i < 5; i++) {
        on(); const withIt = await time(11);
        off(); const without = await time(11);
        on();
        d.push(withIt - without);
      }
      d.sort((a, b) => a - b);
      return { costMs: +d[2].toFixed(4), spread: +(d[4] - d[0]).toFixed(4) };
    };

    const frameMs = await time(15);

    const passes = [];
    for (const pass of comp.passes) {
      const name = pass.constructor.name === 'ShaderPass' && pass.material && pass.material.name
        ? pass.material.name : pass.constructor.name;
      if (pass.constructor.name === 'BandRenderPass') { passes.push({ name, costMs: null, note: 'head pass — the scene itself' }); continue; }
      const wasOn = pass.enabled;
      const r = await pairedCost(() => { pass.enabled = false; }, () => { pass.enabled = true; });
      pass.enabled = wasOn;
      passes.push({ name, ...r, pctOfFrame: +(100 * r.costMs / frameMs).toFixed(1) });
    }

    /* ── the AO prepass is not a composer pass; it is a whole extra render
       of both bands into a reduced target. A/B it on its own. ────────── */
    let aoPrepass = null;
    const aoPass = comp.passes.find((p) => p.material && p.material.name === 'DrillityContactAO');
    if (aoPass) {
      // disabling the pass already skips the prepass (render() guards on
      // aoPass.enabled), so the pass figure above already contains it.
      aoPrepass = 'included in DrillityContactAO';
    }

    /* ── postScale: what the supersample actually costs, and what it buys ── */
    const edgeMetric = () => {
      const cv = document.createElement('canvas');
      const src = gl.domElement;
      cv.width = src.width; cv.height = src.height;
      const g2 = cv.getContext('2d', { willReadFrequently: true });
      g2.drawImage(src, 0, 0);
      const b = c.bands, dpr = gl.getPixelRatio();
      const x0 = Math.round(b.surface.x * dpr), y0 = Math.round(b.surface.y * dpr);
      const w = Math.round(b.surface.w * dpr), h = Math.round(b.surface.h * dpr);
      const d = g2.getImageData(x0, y0, w, h).data;
      let hard = 0, soft = 0, n = 0, sumAbs = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 1; x < w; x++) {
          const i = (y * w + x) * 4, j = i - 4;
          const a = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          const bq = 0.2126 * d[j] + 0.7152 * d[j + 1] + 0.0722 * d[j + 2];
          const dl = Math.abs(a - bq);
          sumAbs += dl; n++;
          if (dl > 40) hard++; else if (dl > 12) soft++;
        }
      }
      return { hardEdgePctgOf1e4: +(1e4 * hard / n).toFixed(2),
        softEdgePctgOf1e4: +(1e4 * soft / n).toFixed(2),
        meanAbsGrad: +(sumAbs / n).toFixed(4) };
    };

    /* THE AA TRADE, 2x2, IN A FILL-BOUND REGIME.
       On this desktop GPU the frame is CPU-submit-bound (245 draw calls in
       1.9 ms) — raising the fragment count barely moves it, which is exactly
       why the supersample "measures free" here and why that number must not
       be believed for a phone. So the trade is measured at a raised device
       pixel ratio, where fragments ARE the bottleneck, and reported as a
       RATIO between the two AA strategies rather than as absolute phone ms.
       Both are then compared on what they actually buy: hard edges removed. */
    let postScaleAB = null;
    if (c.renderer.__qaPostScale) {
      const smaa = comp.passes.find((p) => p.constructor.name === 'SMAAPass');
      const baseDpr = gl.getPixelRatio();
      const W = window.innerWidth, H = window.innerHeight;
      /* PAIRED, NOT BLOCKED. This used to time each of the four cells ONCE,
         in order, after a warm-up. That is a blocked design: any drift in GPU
         clock, thermal state or background load across the ~20 s the sweep
         takes lands entirely on the later cells and is reported as their
         cost. The per-pass costs above are already paired for exactly that
         reason; the AA trade — the decision this file exists to make — was
         not, and it is the one place where being wrong is expensive.

         Now: REPEATS interleaved sweeps of the four cells, so every cell sees
         the same slice of the machine's day. Each cell's frame time is the
         MEDIAN across repeats, and the spread is reported beside it so a
         reader can see whether the gap between two cells is larger than the
         gap between two readings of the same cell. */
      const REPEATS = 5;
      const combos = [];
      for (const ss of [1.0, 1.15]) for (const aa of (smaa ? [false, true] : [false])) combos.push({ ss, aa });
      const acc = combos.map((k) => ({ ...k, ms: [], edges: null }));
      c.renderer.resize(W, H, baseDpr);
      for (let rep = 0; rep < REPEATS; rep++) {
        for (let ci = 0; ci < combos.length; ci++) {
          const { ss, aa } = combos[ci];
          c.renderer.__qaPostScale(ss);
          const s2 = comp.passes.find((p) => p.constructor.name === 'SMAAPass');
          if (s2) s2.enabled = aa;
          await time(6);                        // settle this configuration
          acc[ci].ms.push(await time(11));
          if (rep === REPEATS - 1) { c.renderer.render(0.016); acc[ci].edges = edgeMetric(); }
        }
      }
      const cells = acc.map((a) => {
        const s = a.ms.slice().sort((x, y) => x - y);
        return { dprMul: 1, canvasPx: gl.domElement.width * gl.domElement.height,
          postScale: a.ss, smaa: a.aa,
          frameMs: +s[s.length >> 1].toFixed(4),
          frameMsSpread: +(s[s.length - 1] - s[0]).toFixed(4),
          reps: s.length, edges: a.edges };
      });
      c.renderer.resize(W, H, baseDpr);
      c.renderer.__qaPostScale(null);
      if (smaa) { const s3 = comp.passes.find((p) => p.constructor.name === 'SMAAPass'); if (s3) s3.enabled = true; }

      const pick = (m, ss, aa) => cells.find((x) => x.dprMul === m && x.postScale === ss && x.smaa === aa);
      const summarise = (m) => {
        const base = pick(m, 1.0, false);
        const withSS = pick(m, 1.15, false);
        const withAA = pick(m, 1.0, true);
        if (!base || !withSS) return null;
        const dEdge = (x) => +(100 * (base.edges.hardEdgePctgOf1e4 - x.edges.hardEdgePctgOf1e4)
          / Math.max(1e-6, base.edges.hardEdgePctgOf1e4)).toFixed(1);
        const row = {
          dprMul: m, canvasPx: base.canvasPx, baselineMs: base.frameMs,
          /* the largest single-cell spread across repeats. Any difference
             below this is inside the instrument's own noise. */
          noiseMs: +Math.max(...cells.map((x) => x.frameMsSpread || 0)).toFixed(4),
          supersample: { costMs: +(withSS.frameMs - base.frameMs).toFixed(4),
            pctOfBaseline: +(100 * (withSS.frameMs - base.frameMs) / base.frameMs).toFixed(1),
            hardEdgesRemovedPct: dEdge(withSS) },
        };
        if (withAA) row.smaa = { costMs: +(withAA.frameMs - base.frameMs).toFixed(4),
          pctOfBaseline: +(100 * (withAA.frameMs - base.frameMs) / base.frameMs).toFixed(1),
          hardEdgesRemovedPct: dEdge(withAA) };
        return row;
      };
      postScaleAB = { cells, atNativeDpr: summarise(1) };
    }

    return {
      tier: c.quality.id,
      dpr: gl.getPixelRatio(),
      canvas: { w: gl.domElement.width, h: gl.domElement.height },
      frameMs: +frameMs.toFixed(3),
      frameFps: +(1000 / frameMs).toFixed(1),
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      passes, aoPrepass, postScaleAB,
    };
  });

  report.tiers[tier] = out;
  console.log(`\n== ${tier.toUpperCase()}  frame ${out.frameMs} ms (${out.frameFps} fps)  ${out.canvas.w}x${out.canvas.h}  calls ${out.drawCalls}`);
  for (const p of out.passes) {
    console.log(`   ${String(p.name).padEnd(22)} ${p.costMs === null ? '   —  ' : String(p.costMs).padStart(6)} ms  ${p.pctOfFrame != null ? p.pctOfFrame + ' %' : p.note}${p.spread != null ? '   (spread ' + p.spread + ')' : ''}`);
  }
  if (out.postScaleAB) {
    for (const key of ['atNativeDpr']) {
      const r = out.postScaleAB[key];
      if (!r) continue;
      console.log(`   ${key} (${(r.canvasPx / 1e6).toFixed(2)} Mpx, baseline ${r.baselineMs} ms, cell noise ±${r.noiseMs} ms, ${out.postScaleAB.cells[0].reps} paired reps)`);
      console.log(`      supersample 1.15  +${r.supersample.costMs} ms (${r.supersample.pctOfBaseline} %)  hard edges -${r.supersample.hardEdgesRemovedPct} %`);
      if (r.smaa) console.log(`      SMAA              +${r.smaa.costMs} ms (${r.smaa.pctOfBaseline} %)  hard edges -${r.smaa.hardEdgesRemovedPct} %`);
    }
  }
}

await browser.close();
writeFileSync(`shots/${TAG}-postchain.json`, JSON.stringify(report, null, 2));
console.log('\nwrote', `shots/${TAG}-postchain.json`);
if (errors.length) console.log('errors', errors.slice(0, 5));
