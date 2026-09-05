/**
 * BEAM CONTRAST — does the participating medium draw shafts, or fog?
 *
 *   node .qa-beam.mjs [--tag t] [--quality high] [--methods a,b,c]
 *
 * The round-3 handover's own words for the open gap: "the medium reads as haze
 * with a bright core near the lamps, not as defined beams; the beam's edge
 * still sits below the surround's contrast." That is a statement about SPATIAL
 * STRUCTURE, and no single-number band statistic can settle it — a mean is the
 * same whether the light arrived as a beam or as a uniform lift.
 *
 * So this shoots the band TWICE, with env.__qaMedia(true) and (false), and
 * measures the DIFFERENCE image. That difference is the medium's contribution
 * and nothing else, isolated exactly, and its shape answers the question:
 *
 *   p95 / p50      a beam is a heavy tail — a few bright percent against a
 *                  dark surround. Uniform haze has p95/p50 -> 1. This is THE
 *                  headline number. Real footage of a drive is 4-10x.
 *   edge           the mean absolute Sobel gradient of the contribution,
 *                  normalised by its own mean. A shaft is an EDGE: lit air
 *                  beside unlit air. Haze has no edges anywhere.
 *   coverage       the share of the band the medium lifts by more than 6 L.
 *                  Beams are LOCAL. Above ~55 % it is fog by definition,
 *                  whatever the other numbers say.
 *   peak / floor   the brightest 1 % of the contribution against its median,
 *                  in raw L, so the ceiling is visible as a ceiling.
 *
 * It also reports the same numbers for the FINAL frame, because a beam that
 * is bright in the difference but sits on a surround that is brighter still
 * has not been seen by anyone.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const TAG = flag('tag', 'beam');
const QUALITY = flag('quality', 'high');
const PORT = flag('port', '5178');
const METHODS = (flag('methods', 'tunnel-jumbo,longhole,rockbolt')).split(',');

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
const page = await (await browser.newContext(PHONE)).newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e).slice(0, 200)));
await page.routeWebSocket(/.*/, () => {}).catch(() => {});

await page.goto(`http://localhost:${PORT}/?quality=${QUALITY}&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.__qa, { timeout: 40000 });
await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 120000 }).catch(() => {});
await sleep(3000);

const report = { when: new Date().toISOString(), quality: QUALITY, methods: {} };

for (const mid of METHODS) {
  const setup = async () => page.evaluate(async (M) => {
    const c = window.__DRILLITY, d = c.data;
    const regions = (d.REGIONS || []).filter((rg) => d.methodsForRegion
      && d.methodsForRegion(rg.id, d.MAX_LEVEL || 60).some((m) => m.id === M));
    const region = regions[0] ? regions[0].id : undefined;
    let k = null;
    try { k = await c.__qa.startDemoContract({ method: M, region, depth: 8 }); }
    catch (e) { k = c.state.contract; void e; }
    try { c.sim.debug.setDepth(3); } catch (e) { void e; }
    const buildable = c.rig.listRigs ? c.rig.listRigs() : [];
    const cands = (d.rigsForMethod ? d.rigsForMethod(M) : []).map((r) => r.id);
    for (const id of cands) {
      const render = d.rigRenderId ? d.rigRenderId(id, buildable) : id;
      if (buildable.includes(render)) { c.state.garage.rigId = render; c.rig.setRig(render); break; }
    }
    c.rig.setMethod(M);
    try { c.ui.show('site'); } catch (e) { void e; }
    c.renderer.setCameraMode('hero');
    if (!c.state.contract || c.state.contract.methodId !== M) {
      c.state.contract = { ...(c.state.contract || {}), methodId: M, regionId: region || 'nordic' };
    }
    if (c.state.world) c.state.world.site = { methodId: M, regionId: region, archetype: 'underground-drive', sitePlane: 'underground' };
    return { ug: c.env.undergroundId };
  }, mid);

  let st = null;
  for (let a = 0; a < 4; a++) {
    st = await setup();
    await sleep(1000);
    st = await page.evaluate(() => ({ ug: window.__DRILLITY.env.undergroundId }));
    if (st.ug === mid) break;
    process.stdout.write(`  [retry ${a + 1}] wanted ${mid}, ug=${st.ug}\n`);
  }
  if (st.ug !== mid) { process.stdout.write(`${mid}: NOT UNDERGROUND (ug=${st.ug}) — skipped\n`); continue; }

  // drive it so the booms are where they would be while working
  for (let i = 0; i < 14; i++) {
    await page.evaluate(() => {
      const c = window.__DRILLITY;
      try {
        const t = c.sim.getTelemetry(); const o = (t && t.optimal) || {};
        c.sim.setInput('feed', o.wob ?? 0.6);
        c.sim.setInput('rotation', o.rpm ?? 0.7);
        c.sim.setInput('flush', o.flush ?? 0.7);
      } catch (e) { void e; }
    }).catch(() => {});
    await sleep(110);
  }

  const grab = async () => page.evaluate(() => {
    const c = window.__DRILLITY;
    /* Force a render before reading. Headed Chrome throttles requestAnimation
       Frame when the window is occluded, so without this the canvas can still
       be holding the medium-only frame the previous call left in it — which
       measured longhole's SHIPPED frame at mean 3.6 with 98 % below L16, i.e.
       the instrument was reporting the isolated medium as the whole picture. */
    for (let i = 0; i < 2; i++) c.renderer.render(0.016);
    const cv = document.querySelector('canvas');
    const W = cv.width, H = cv.height;
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const g = off.getContext('2d', { willReadFrequently: true });
    g.drawImage(cv, 0, 0);
    const src = g.getImageData(0, 0, W, H).data;
    const split = (c.LAYOUT && c.LAYOUT.surfaceHeight) || 0.54;
    // skip the letterbox: the grade draws hard black bars, and they are not
    // part of the picture. Start 6 % into the band.
    const y0 = Math.round(H * split * 0.06), y1 = Math.round(H * split);
    const w = W, h = y1 - y0;
    const lum = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = ((y + y0) * W + x) * 4;
        lum[y * w + x] = 0.2126 * src[i] + 0.7152 * src[i + 1] + 0.0722 * src[i + 2];
      }
    }
    return { w, h, lum: Array.from(lum) };
  });

  await page.evaluate(() => {
    const cv = document.querySelector('canvas');
    window.__hidden = [];
    for (const el of document.body.querySelectorAll('body > *')) {
      if (cv && el.contains(cv)) continue;
      window.__hidden.push([el, el.style.visibility]);
      el.style.visibility = 'hidden';
    }
  });
  await sleep(220);

  /* ── DO NOT DIFFERENCE TWO FRAMES: ISOLATE THE MEDIUM IN ONE ─────────────
     The first version of this instrument grabbed the band with __qaMedia(true),
     waited, grabbed it with (false), and subtracted. In that gap the boom
     moves and the medium's own drift noise advances, so the difference
     contained the MACHINE'S MOTION as well as the medium. It was not
     repeatable: the same build measured longhole at 30.9 % coverage on one run
     and 51.2 % on the next, and the four-pair median still reported a coverage
     SPREAD of +-62 points on the jumbo. An instrument with a +-62 spread on a
     0-100 quantity cannot detect anything. HANDOFF pattern C, exactly.

     The medium does not need differencing at all. It is one additive,
     depth-test-off quad drawn over the scene, and it reads NOTHING from the
     geometry — only the light list and two analytic boxes. So hiding every
     other mesh leaves the medium drawn additively over black, which IS its
     contribution, exactly, in a single frame, with no motion to cancel.

     The lights are untouched by hiding meshes, so the medium computes the same
     integral it would have. What changes is only what it is composited over. */
  const grabMediumOnly = async () => page.evaluate(() => {
    const c = window.__DRILLITY;
    const hidden = [];
    c.scene.traverse((o) => {
      if (o.isMesh && o.name !== 'airborneDust' && o.visible) { hidden.push(o); o.visible = false; }
    });
    for (let i = 0; i < 3; i++) c.renderer.render(0.0001);
    const cv = document.querySelector('canvas');
    const W = cv.width, H = cv.height;
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const g = off.getContext('2d', { willReadFrequently: true });
    g.drawImage(cv, 0, 0);
    const src = g.getImageData(0, 0, W, H).data;
    for (const o of hidden) o.visible = true;
    const split = (c.LAYOUT && c.LAYOUT.surfaceHeight) || 0.54;
    const y0 = Math.round(H * split * 0.06), y1 = Math.round(H * split);
    const w = W, h = y1 - y0;
    const lum = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = ((y + y0) * W + x) * 4;
        lum[y * w + x] = 0.2126 * src[i] + 0.7152 * src[i + 1] + 0.0722 * src[i + 2];
      }
    }
    return { w, h, lum: Array.from(lum) };
  });

  const PAIRS = 3;
  const samples = [];
  for (let s = 0; s < PAIRS; s++) {
    const on = await grab();                       // the real frame, as shipped
    if (s === 0) await page.screenshot({ path: `shots/${TAG}-${mid}-frame.png`, animations: 'allow' });
    const off = await grabMediumOnly();            // the medium, isolated
    // grabMediumOnly leaves the canvas holding the isolated medium, so this
    // screenshot IS the medium — the most useful single image in the run.
    if (s === 0) await page.screenshot({ path: `shots/${TAG}-${mid}-medium.png`, animations: 'allow' });
    samples.push({ on, off });
    if (s < PAIRS - 1) await sleep(420);
  }
  await page.evaluate(() => { for (const [el, v] of (window.__hidden || [])) el.style.visibility = v; });

  const pct = (arr, p) => {
    const s = Float32Array.from(arr).sort();
    return s[Math.min(s.length - 1, Math.max(0, Math.floor(s.length * p)))];
  };
  const mean = (arr) => { let s = 0; for (const v of arr) s += v; return s / arr.length; };
  const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

  const per = samples.map(({ on, off }) => {
    // `off` is now the medium ISOLATED, not a frame to subtract — see above.
    const { w, h } = off;
    const n = w * h;
    const diff = Float32Array.from(off.lum);
    // Sobel on the contribution, normalised by its own mean so a dim beam and
    // a bright one are compared on shape rather than on level.
    let gsum = 0, gmax = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const a = (yy, xx) => diff[yy * w + xx];
        const gx = (a(y - 1, x + 1) + 2 * a(y, x + 1) + a(y + 1, x + 1))
                 - (a(y - 1, x - 1) + 2 * a(y, x - 1) + a(y + 1, x - 1));
        const gy = (a(y + 1, x - 1) + 2 * a(y + 1, x) + a(y + 1, x + 1))
                 - (a(y - 1, x - 1) + 2 * a(y - 1, x) + a(y - 1, x + 1));
        const g = Math.hypot(gx, gy);
        gsum += g; if (g > gmax) gmax = g;
      }
    }
    const dMean = mean(diff);
    const p50 = pct(diff, 0.50), p95 = pct(diff, 0.95), p99 = pct(diff, 0.99);
    /* COVERAGE, RELATIVE TO THE IMAGE'S OWN PEAK.
       The isolated medium is tone-mapped from black by the same grade the
       player sees, and the grade lifts, S-curves and grains it — so an
       ABSOLUTE threshold counts grain as coverage and is not comparable
       between builds. A quarter of the frame's own p99 is the honest
       question: how much of the band is within two stops of the brightest
       thing the medium draws? A beam answers "a little"; fog answers "most". */
    const p99abs = pct(diff, 0.99);
    const thr = Math.max(4, p99abs * 0.25);
    let cov = 0; for (const v of diff) if (v > thr) cov++;
    let black = 0, bright = 0;
    for (const v of on.lum) { if (v < 16) black++; if (v > 160) bright++; }
    return {
      mean: dMean, p50, p95, p99,
      p95_p50: p95 / Math.max(0.4, p50),
      p99_p50: p99 / Math.max(0.4, p50),
      edge: gsum / ((w - 2) * (h - 2)) / Math.max(0.4, dMean),
      edgeMax: gmax,
      coveragePct: (cov / n) * 100,
      fMean: mean(on.lum), fP99: pct(on.lum, 0.99),
      pctBelowL16: (black / n) * 100, pctAboveL160: (bright / n) * 100,
    };
  });
  const M = (k, d = 2) => +med(per.map((p) => p[k])).toFixed(d);
  const spread = (k) => +(Math.max(...per.map((p) => p[k])) - Math.min(...per.map((p) => p[k]))).toFixed(1);

  const row = {
    pairs: PAIRS,
    contribution: {
      mean: M('mean'), p50: M('p50'), p95: M('p95'), p99: M('p99'),
      p95_p50: M('p95_p50'), p99_p50: M('p99_p50'),
      edge: M('edge', 3), edgeMax: M('edgeMax', 1),
      coveragePct: M('coveragePct', 1),
      coverageSpread: spread('coveragePct'),   // how much the pose alone moves it
    },
    frame: {
      mean: M('fMean', 1), p99: M('fP99', 1),
      pctBelowL16: M('pctBelowL16', 1), pctAboveL160: M('pctAboveL160', 1),
    },
  };
  report.methods[mid] = row;
  const cN = row.contribution;
  process.stdout.write(
    `${mid.padEnd(14)} mean ${String(cN.mean).padStart(6)}  p95/p50 ${String(cN.p95_p50).padStart(7)}  `
    + `edge ${String(cN.edge).padStart(6)}  cover ${String(cN.coveragePct).padStart(5)}% (+-${cN.coverageSpread})   `
    + `frame ${row.frame.mean} (<16 ${row.frame.pctBelowL16}%, >160 ${row.frame.pctAboveL160}%)\n`);
}

report.errors = errors;
writeFileSync(`shots/${TAG}-report.json`, JSON.stringify(report, null, 1), 'utf8');
process.stdout.write(`\nconsole errors: ${errors.length}\n${errors.slice(0, 6).join('\n')}\nshots/${TAG}-report.json\n`);
await browser.close();
