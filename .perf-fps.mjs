/**
 * THE FPS MYSTERY — is a "24-27 fps state" a property of the STATE, or of the
 * MOMENT it was measured?
 *
 * Across thirty shoot reports the same state reads 143.9 in one run and
 * 21.7-28 in another, the ~25 figure is a PLATEAU (never once 30-120), and it
 * lands on whichever states were shot FIRST in a run. A fill cost is intrinsic
 * to a state and continuous; this is neither. So: drive the exact states the
 * harness shoots, in one page load, forward and then reversed, and at each
 * stop read three independent clocks —
 *
 *   live   ctx.clock.fps           what tools/shoot.mjs reports
 *   raf    our own rAF cadence     the main loop's real frame interval
 *   gpu    render()+glFinish       the frame's own cost, batched and paired
 *
 * — plus the adapter the context is on (WEBGL_debug_renderer_info), the
 * long-task time on the main thread, and seconds since boot. If `live` is low
 * while `gpu` is small, the frame is not the problem; whatever the main thread
 * is doing between frames is.
 *
 *   node .perf-fps.mjs [--methods auger,site-investigation,core,rc,rotary-kelly]
 *                      [--quality high] [--tag fps] [--bisect] [--forward-only]
 *
 * --bisect: at every stop whose live fps is under 100, hide each top-level
 * node of both scenes, each composer pass and the shadow map in turn (paired
 * ON/OFF) and report what each buys back.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const has = (n) => argv.includes(`--${n}`);
const METHODS = (flag('methods', 'auger,site-investigation,core,rc,rotary-kelly')).split(',');
const QUALITY = flag('quality', 'high');
const TAG = flag('tag', 'fps');
const BISECT = has('bisect');
const FORWARD_ONLY = has('forward-only');

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
page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
/* other agents save files while this runs; a vite full reload would reboot the
   page mid-measurement and every later stop would be "early in the session"
   again — which is the very thing under test */
await page.addInitScript(() => {
  try { Object.defineProperty(location, 'reload', { value: () => {}, configurable: true }); } catch (e) { void e; }
});
await page.routeWebSocket(/.*/, () => {}).catch(() => {});

const t0 = Date.now();
await page.goto(`http://localhost:5178/?quality=${QUALITY}&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.__qa, { timeout: 60000 });
await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
const bootMs = Date.now() - t0;

/* the harness's own policy, verbatim in spirit: drive the sim so the frame has motion */
function pageDrive() {
  const c = window.__DRILLITY; const s = c && c.sim;
  if (!s || !s.getTelemetry) return null;
  let t = null; try { t = s.getTelemetry(); } catch (e) { void e; return null; }
  if (!t) return null;
  const bound = t.jam && t.jam.state && t.jam.state !== 'free';
  if (bound) { s.setInput('feed', 0.16); s.setInput('rotation', 0.32); s.setInput('flush', 0.95); try { s.pulse('jamRescue'); } catch (e) { void e; } return { bound: true }; }
  const o = t.optimal || {};
  s.setInput('feed', o.wob != null ? o.wob : 0.6);
  s.setInput('rotation', o.rpm != null ? o.rpm : 0.7);
  s.setInput('flush', o.flush != null ? o.flush : 0.7);
  return { bound: false, depth: t.depth };
}

/* tools/shoot.mjs methodShot().setup, reproduced */
async function enterState(mid) {
  const seed = await page.evaluate(async (MID) => {
    const c = window.__DRILLITY; const d = c.data;
    const M = (d.METHODS || []).find((m) => m.id === MID);
    if (!M) return { ok: false, note: 'no such method' };
    const region = (M.regions && M.regions[0]) || undefined;
    const contract = await c.__qa.startDemoContract({ method: M.id, region, depth: 8 });
    if (!contract) return { ok: false, note: 'no contract' };
    const range = M.depthRange;
    if (range && contract.targetDepth > range[1]) {
      contract.targetDepth = +(range[0] + (range[1] - range[0]) * 0.7).toFixed(1);
      try { c.geology.generateProfile({ regionId: contract.regionId, applicationId: contract.applicationId, targetDepth: contract.targetDepth, seed: 1337, difficulty: contract.difficulty ?? 2 }); } catch (e) { void e; }
      try { c.sim.startHole(contract); } catch (e) { void e; }
    }
    const target = contract.targetDepth || 30;
    const seek = Math.max(0.5, Math.min(target - Math.max(1, target * 0.25), target * 0.35));
    try { c.sim.debug.setDepth(seek); } catch (e) { void e; }
    try { c.geology.setDepth(seek); } catch (e) { void e; }
    let rigId = null;
    const candidates = (d.rigsForMethod ? d.rigsForMethod(M.id) : []).map((r) => r.id);
    const buildable = c.rig.listRigs ? c.rig.listRigs() : [];
    for (const id of candidates) {
      const render = d.rigRenderId ? d.rigRenderId(id, buildable) : id;
      if (buildable.includes(render)) { rigId = render; break; }
    }
    if (rigId) { c.state.garage.rigId = rigId; c.rig.setRig(rigId); c.rig.setMethod(M.id); }
    c.ui.show('site');
    c.renderer.setCameraMode('hero');
    return { ok: true, rigId, region: contract.regionId, target, seek: +seek.toFixed(2) };
  }, mid);
  for (let i = 0; i < 20; i++) { await page.evaluate(pageDrive).catch(() => null); await sleep(130); }
  await sleep(700);
  return seed;
}

/* the three clocks, read off the live page */
function pageClocks() {
  return new Promise((resolve) => {
    const c = window.__DRILLITY; const gl = c.gl; const raw = gl.getContext();
    const dbg = raw.getExtension('WEBGL_debug_renderer_info');
    const adapter = dbg ? raw.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null;

    let longMs = 0, longN = 0;
    let po = null;
    try {
      po = new PerformanceObserver((l) => { for (const e of l.getEntries()) { longMs += e.duration; longN++; } });
      po.observe({ entryTypes: ['longtask'] });
    } catch (e) { void e; }

    const live = []; const ivals = []; const dts = [];
    let last = performance.now(); let n = 0;
    const T0 = performance.now();
    const tick = () => {
      const now = performance.now();
      ivals.push(now - last); last = now;
      dts.push(c.clock.dt);
      if (n % 30 === 0) live.push(c.clock.fps);
      if (++n < 150 && now - T0 < 3000) requestAnimationFrame(tick);
      else finish(now - T0);
    };
    const finish = (windowMs) => {
      if (po) po.disconnect();
      const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1] || 0; };
      const q = (a, f) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.round(f * (s.length - 1)))] || 0; };
      const info = gl.info;
      const BATCH = 8;
      const time = (samples) => new Promise((res) => {
        const dt = []; let k = 0;
        const t = () => {
          const a = performance.now();
          for (let i = 0; i < BATCH; i++) c.renderer.render(0.016);
          raw.finish();
          dt.push((performance.now() - a) / BATCH);
          if (++k < samples) requestAnimationFrame(t);
          else { const s = dt.slice(2).sort((x, y) => x - y); res(s[s.length >> 1]); }
        };
        requestAnimationFrame(t);
      });
      (async () => {
        const gpuA = await time(8); const gpuB = await time(8); const gpuC = await time(8);
        resolve({
          adapter, visible: document.visibilityState, focused: document.hasFocus(),
          sinceBootS: +((performance.now()) / 1000).toFixed(1),
          liveFpsMedian: +med(live).toFixed(1), liveFpsMin: +Math.min(...live).toFixed(1),
          rafMedianMs: +med(ivals).toFixed(2), rafP90Ms: +q(ivals, 0.9).toFixed(2), rafMaxMs: +Math.max(...ivals).toFixed(1),
          rafFps: +(1000 / med(ivals)).toFixed(1),
          dtMedian: +med(dts).toFixed(4), dtMax: +Math.max(...dts).toFixed(4),
          longTaskMs: +longMs.toFixed(0), longTasks: longN, windowMs: +windowMs.toFixed(0),
          gpuMsMedian: +med([gpuA, gpuB, gpuC]).toFixed(3), gpuMsSpread: +(Math.max(gpuA, gpuB, gpuC) - Math.min(gpuA, gpuB, gpuC)).toFixed(3),
          calls: info.render.calls, tris: info.render.triangles,
          programs: info.programs ? info.programs.length : null,
          rigId: c.rig.getRigId(), methodId: c.rig.getMethodId(), region: c.state.world.regionId,
          scene: c.state.scene, quality: c.quality.id,
          canvas: [gl.domElement.width, gl.domElement.height],
          jsHeapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(0) : null,
        });
      })();
    };
    requestAnimationFrame(tick);
  });
}

/* paired bisect on the LIVE loop: hide a thing, read the rAF cadence, restore */
function pageBisect() {
  return new Promise((resolve) => {
    const c = window.__DRILLITY; const gl = c.gl;
    const cadence = () => new Promise((res) => {
      const iv = []; let last = performance.now(); let n = 0; const T0 = last;
      const tick = () => { const now = performance.now(); iv.push(now - last); last = now;
        if (++n < 45 && now - T0 < 1400) requestAnimationFrame(tick);
        else { const s = iv.slice(3).sort((a, b) => a - b); res(s[s.length >> 1]); } };
      requestAnimationFrame(tick);
    });
    const paired = async (off, on) => {
      const d = [];
      for (let i = 0; i < 2; i++) { on(); const w = await cadence(); off(); const wo = await cadence(); on(); d.push(w - wo); }
      d.sort((a, b) => a - b);
      return +d[0].toFixed(2) === +d[1].toFixed(2) ? d[0] : (d[0] + d[1]) / 2;
    };
    (async () => {
      const rows = [];
      const base = await cadence();
      const items = [];
      for (const scn of [c.scene, c.sectionScene]) {
        for (const o of scn.children) {
          if (o.isLight || o.isCamera) continue;
          items.push({ name: `${scn.name}/${o.name || o.type}`, off: () => { o.visible = false; }, on: () => { o.visible = true; } });
        }
      }
      if (c.composer) for (const p of c.composer.passes) {
        if (p.constructor.name === 'BandRenderPass') continue;
        const name = p.material && p.material.name ? p.material.name : p.constructor.name;
        items.push({ name: `pass/${name}`, off: () => { p.enabled = false; }, on: () => { p.enabled = true; } });
      }
      items.push({ name: 'shadowMap.enabled', off: () => { gl.shadowMap.enabled = false; }, on: () => { gl.shadowMap.enabled = true; } });
      for (const it of items) {
        try { const d = await paired(it.off, it.on); rows.push({ item: it.name, savedMs: +d.toFixed(2) }); }
        catch (e) { rows.push({ item: it.name, error: String(e.message).slice(0, 80) }); it.on(); }
      }
      rows.sort((a, b) => (b.savedMs || 0) - (a.savedMs || 0));
      resolve({ baseFrameMs: +base.toFixed(2), rows });
    })();
  });
}

const report = { when: new Date().toISOString(), quality: QUALITY, bootMs, stops: [], errors };
const order = FORWARD_ONLY ? [...METHODS] : [...METHODS, ...[...METHODS].reverse()];
console.log(`booted in ${bootMs} ms — ${order.length} stops`);
for (let i = 0; i < order.length; i++) {
  const mid = order[i];
  const seed = await enterState(mid);
  const clocks = await page.evaluate(pageClocks);
  const stop = { i, method: mid, seed, ...clocks };
  if (BISECT && clocks.liveFpsMedian < 100) {
    stop.bisect = await page.evaluate(pageBisect);
  }
  report.stops.push(stop);
  console.log(`#${String(i).padStart(2)} ${mid.padEnd(19)} t+${String(clocks.sinceBootS).padStart(6)}s  live ${String(clocks.liveFpsMedian).padStart(6)} fps  raf ${String(clocks.rafMedianMs).padStart(6)} ms (p90 ${clocks.rafP90Ms}, max ${clocks.rafMaxMs})  gpu ${String(clocks.gpuMsMedian).padStart(6)} ms  long ${String(clocks.longTaskMs).padStart(5)} ms/${clocks.windowMs}  calls ${clocks.calls}  progs ${clocks.programs}  heap ${clocks.jsHeapMB} MB  ${clocks.rigId}@${clocks.region}`);
  if (stop.bisect) {
    console.log(`     bisect (base ${stop.bisect.baseFrameMs} ms/frame):`);
    for (const r of stop.bisect.rows.slice(0, 8)) console.log(`       ${String(r.savedMs).padStart(7)} ms  ${r.item}`);
  }
}
console.log('adapter:', report.stops[0] && report.stops[0].adapter);
await browser.close();
writeFileSync(`shots/${TAG}-fps.json`, JSON.stringify(report, null, 2));
console.log('wrote', `shots/${TAG}-fps.json`);
if (errors.length) console.log('errors', errors.slice(0, 6));
