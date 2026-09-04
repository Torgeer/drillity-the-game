/**
 * Honest frame cost, per tier: the post chain pass by pass, plus the
 * transmission pass the cab glazing forces.
 *
 * A/B PAIRED. An earlier version measured one baseline up front and every
 * item against it, and reported the whole post chain as FREE — the GPU was
 * still clocking up and shaders were still compiling during the baseline, so
 * every later sample looked slower. Here each item is sampled ON/OFF/ON/OFF
 * and scored on the median of the pairs, so a drifting clock cancels instead
 * of deciding the answer.
 *
 * node .perf-post.mjs <quality> [rig] [method]
 */
import { chromium, devices } from 'playwright';

const Q = process.argv[2] || 'high';
const RIG = process.argv[3] || 'dth-crawler';
const METHOD = process.argv[4] || 'dth';

const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await c.newPage();
/* Other agents are editing this tree while we measure, and every save makes
   vite full-reload the page mid-run. Stub location.reload() before any page
   script runs: HMR can still push updates, but it cannot tear the context out
   from under a measurement. */
await p.addInitScript(() => {
  try { Object.defineProperty(location, 'reload', { value: () => {}, configurable: true }); } catch (e) { void e; }
});
await p.goto(`http://localhost:5178/?quality=${Q}&shot`, { waitUntil: 'load' });
await p.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 6500));
for (let i = 0; i < 20; i++) {
  const ok = await p.evaluate(() => !!(window.__DRILLITY && window.__DRILLITY.composer)).catch(() => false);
  if (ok) { await new Promise((r) => setTimeout(r, 1000)); if (await p.evaluate(() => !!(window.__DRILLITY && window.__DRILLITY.composer)).catch(() => false)) break; }
  await new Promise((r) => setTimeout(r, 1000));
}

let out = null;
for (let attempt = 0; attempt < 5 && !out; attempt++) {
 try {
  out = await p.evaluate(async ([RIG, METHOD]) => {
  const C = window.__DRILLITY;
  const comp = C.composer;
  if (!comp) return { error: 'no composer' };
  const gl = C.renderer.gl;

  const setRig = () => {
    try { C.state.garage.rigId = RIG; } catch (e) { void e; }
    C.rig.setRig(RIG); C.rig.setMethod(METHOD);
    C.renderer.setCameraMode && C.renderer.setCameraMode('orbit');
  };
  setRig();
  for (let i = 0; i < 20; i++) C.renderer.render(0.016);

  const time = (frames) => new Promise((res) => {
    const dt = []; let n = 0;
    const tick = () => {
      const t0 = performance.now();
      C.renderer.render(0.016);
      gl.getContext().finish();          // wait for the GPU, else we time the queue
      dt.push(performance.now() - t0);
      if (++n < frames) requestAnimationFrame(tick);
      else { const s = dt.slice(6).sort((a, b) => a - b); res(s[s.length >> 1]); }
    };
    requestAnimationFrame(tick);
  });

  // long warm-up: shader compiles and GPU clocks settle before anything counts
  for (let i = 0; i < 6; i++) await time(60);

  /** ON/OFF/ON/OFF, scored on the medians — drift cancels. */
  const pairedCost = async (off, on) => {
    const A = [], B = [];
    for (let r = 0; r < 3; r++) {
      on(); setRig(); A.push(await time(70));
      off(); setRig(); B.push(await time(70));
    }
    on(); setRig();
    const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
    return { withMs: +med(A).toFixed(3), withoutMs: +med(B).toFixed(3), costMs: +(med(A) - med(B)).toFixed(3) };
  };

  const items = [];
  for (const pass of comp.passes) {
    if (pass.constructor.name === 'BandRenderPass') continue;
    const r = await pairedCost(() => { pass.enabled = false; }, () => { pass.enabled = true; });
    items.push({ item: pass.constructor.name, ...r });
  }

  const findGlass = () => {
    const mats = new Map();
    C.scene.traverse((o) => { const l = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []); for (const m of l) if (m && !mats.has(m.uuid)) mats.set(m.uuid, m); });
    return [...mats.values()].filter((m) => m.transmission > 0 || m.userData.__savedTransmission > 0);
  };
  const g0 = findGlass();
  if (g0.length) {
    for (const m of g0) m.userData.__savedTransmission = m.transmission;
    const r = await pairedCost(
      () => { for (const m of findGlass()) { m.transmission = 0; m.needsUpdate = true; } },
      () => { for (const m of findGlass()) { m.transmission = m.userData.__savedTransmission; m.needsUpdate = true; } },
    );
    items.push({ item: 'transmission pass (cab glazing)', ...r });
  }

  const baseline = await time(120);
  return {
    quality: C.quality && C.quality.id, rigId: C.rig.getRigId(),
    canvas: [gl.domElement.width, gl.domElement.height],
    composerTarget: comp.renderTarget1 ? [comp.renderTarget1.width, comp.renderTarget1.height] : null,
    passes: comp.passes.map((x) => x.constructor.name),
    frameMs: +baseline.toFixed(3), frameFps: +(1000 / baseline).toFixed(1),
    items: items.sort((a, b) => b.costMs - a.costMs),
  };
  }, [RIG, METHOD]);
 } catch (e) {
  // another agent saved a file and vite full-reloaded the page under us
  console.error('reloaded mid-measure, retrying:', String(e.message).slice(0, 70));
  await p.waitForFunction(() => !!(window.__DRILLITY && window.__DRILLITY.composer), null, { timeout: 90000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 5000));
 }
}
console.log(JSON.stringify(out, null, 1));
await b.close();
