/**
 * Underground measurement rig — luminance falloff, lit/unlit contrast and
 * per-band draw calls, sampled at the REAL band dimensions (390x844 @2).
 *
 *   node ugmeasure.mjs [--tag t] [--quality high] [--methods a,b,c]
 *
 * Not a screenshot tool. It projects env.driveProbes() into screen space and
 * reads the actual framebuffer, so "the far end goes black" is a number.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const TAG = flag('tag', 'ug');
const QUALITY = flag('quality', 'high');
const METHODS = (flag('methods', 'tunnel-jumbo,longhole,rockbolt')).split(',');
const OUT = flag('out', null);

const PHONE = {
  ...devices['iPhone 13 Pro'],
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2, isMobile: true, hasTouch: true,
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Drive the real Chrome on this machine — same reason tools/shoot.mjs does:
   the bundled Playwright chromium build is not installed here, and headless
   Chrome cannot bind the discrete GPU. */
const browser = await chromium.launch({
  channel: 'chrome', headless: false,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--hide-scrollbars', '--mute-audio'],
});
const page = await (await browser.newContext(PHONE)).newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e).slice(0, 200)));

/* MUTE HMR. Several agents edit src/ while this runs, and every save makes Vite
   push a full reload; a mid-run reload kills the WebGL context and the rest of
   the measurement is a picture of nothing. Same trick tools/shoot.mjs uses. */
await page.routeWebSocket(/.*/, () => { /* mocked: never reaches the dev server */ })
  .catch((e) => console.log('could not mute HMR -', e.message));

await page.goto(`http://localhost:5178/?quality=${QUALITY}&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.__qa, { timeout: 30000 });
await sleep(2500);

const report = { when: new Date().toISOString(), quality: QUALITY, methods: {} };

for (const spec of METHODS) {
  const [midRaw, rest] = spec.split('@');
  const [regionOv, archOv] = (rest || '').split('#');
  const mid = midRaw;
  await page.evaluate(([r, a]) => {
    window.__FORCE_REGION = r || null;
    window.__FORCE_ARCH = a || null;
  }, [regionOv || null, archOv || null]);
  const setup = async (M) => await page.evaluate(async (M2) => {
    const c = window.__DRILLITY;
    const d = c.data;
    const method = d.getMethod ? d.getMethod(M2) : null;
    const regions = (d.REGIONS || []).filter((rg) => d.methodsForRegion
      && d.methodsForRegion(rg.id, d.MAX_LEVEL || 60).some((m) => m.id === M2));
    const region = window.__FORCE_REGION || (regions[0] ? regions[0].id : undefined);
    /* ui/screens/site.js is another agent's file and is mid-edit; when it
       throws, startDemoContract's ui.show('site') takes the whole call down
       with it. The CONTRACT is what this measurement needs, so tolerate a
       broken screen rather than abandoning the run. */
    let k = null;
    try { k = await c.__qa.startDemoContract({ method: M2, region, depth: 8 }); }
    catch (e) { window.__UI_BROKE = String(e && e.message || e); k = c.state.contract; }
    const range = method && method.depthRange;
    if (k && range && k.targetDepth > range[1]) {
      k.targetDepth = +(range[0] + (range[1] - range[0]) * 0.7).toFixed(1);
      try { c.sim.startHole(k); } catch (e) { void e; }
    }
    try { c.sim.debug.setDepth(Math.max(0.5, (k.targetDepth || 10) * 0.35)); } catch (e) { void e; }
    // put the right machine under it
    const buildable = c.rig.listRigs ? c.rig.listRigs() : [];
    const cands = (d.rigsForMethod ? d.rigsForMethod(M2) : []).map((r) => r.id);
    for (const id of cands) {
      const render = d.rigRenderId ? d.rigRenderId(id, buildable) : id;
      if (buildable.includes(render)) { c.state.garage.rigId = render; c.rig.setRig(render); break; }
    }
    c.rig.setMethod(M2);
    try { c.ui.show('site'); } catch (e) { void e; }
    c.renderer.setCameraMode('hero');
    /* Belt and braces. startDemoContract() ends with ui.show(SCENES.SITE), and
       ui/screens/site.js is another agent's file and is currently throwing on
       mount; when it does, the contract can be left unapplied and the whole
       measurement quietly photographs a crawler on a forest pad. Assert the
       method actually took, and set it directly if it did not — env.js and
       terrain.js both POLL state.contract.methodId, so this is enough. */
    if (!c.state.contract || c.state.contract.methodId !== M2) {
      c.state.contract = { ...(c.state.contract || {}), methodId: M2, regionId: region || 'nordic' };
    }
    if (window.__FORCE_ARCH) c.state.contract = { ...c.state.contract, archetype: window.__FORCE_ARCH };
    return { method: c.state.contract && c.state.contract.methodId, ug: c.env.undergroundId };
  }, M);
  /* The setup is not reliably idempotent on the first try — startDemoContract
     runs through ui/shell/geology/sim/rig and any of them can leave the method
     unapplied. Retry until the world IS the world we are about to measure,
     rather than photographing a crawler on a forest pad and reporting it as a
     drive. */
  let st = null;
  for (let a = 0; a < 4; a++) {
    st = await setup(mid);
    await sleep(900);
    st = await page.evaluate(() => ({
      method: window.__DRILLITY.state.contract && window.__DRILLITY.state.contract.methodId,
      ug: window.__DRILLITY.env.undergroundId,
      rig: window.__DRILLITY.state.garage.rigId,
    }));
    if (st.method === mid) break;
    process.stdout.write(`  [setup retry ${a + 1}] wanted ${mid}, got ${st.method}
`);
  }

  // run it live so the medium and the booms are moving
  for (let i = 0; i < 18; i++) {
    await page.evaluate(() => {
      const c = window.__DRILLITY;
      const t = c.sim.getTelemetry();
      const o = (t && t.optimal) || {};
      try {
        const set = c.sim.setControls || c.sim.setControl || null;
        if (set) set.call(c.sim, { feed: o.wob ?? 0.5, rotation: o.rpm ?? 0.7, flush: o.flush ?? 0.6 });
      } catch (e) { void e; }
    }).catch(() => {});
    await sleep(120);
  }
  await sleep(400);

  /* Capture the BANDS, not the page. The HUD lives in another agent's files and
     is mid-edit; a screenshot of the composited page grades their work, not the
     3D. Hide #ui, shoot, put it back. */
  await page.evaluate(() => { document.getElementById('ui').style.visibility = 'hidden'; });
  await sleep(260);
  await page.screenshot({ path: `shots/${TAG}-${mid}-band.png`, animations: 'allow' });
  await page.evaluate(() => { document.getElementById('ui').style.visibility = ''; });
  await sleep(160);

  const m = await page.evaluate(async (M) => {
    const c = window.__DRILLITY;
    const cv = document.querySelector('canvas');
    const gl = c.gl || null;

    /* ---- pixels ------------------------------------------------------- */
    const W = cv.width, H = cv.height;
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const g2 = off.getContext('2d', { willReadFrequently: true });
    g2.drawImage(cv, 0, 0);
    const img = g2.getImageData(0, 0, W, H).data;
    const lumAt = (px, py) => {
      const x = Math.max(0, Math.min(W - 1, Math.round(px)));
      const y = Math.max(0, Math.min(H - 1, Math.round(py)));
      const i = (y * W + x) * 4;
      return 0.2126 * img[i] + 0.7152 * img[i + 1] + 0.0722 * img[i + 2];
    };
    // average a small disc so one hot particle does not become the answer
    const patch = (px, py, r = 5) => {
      let s = 0, n = 0;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        s += lumAt(px + dx, py + dy); n++;
      }
      return +(s / n).toFixed(1);
    };

    const split = (c.LAYOUT && c.LAYOUT.surfaceHeight) || 0.54;
    const bandH = Math.round(H * split);

    /* ---- probes ------------------------------------------------------- */
    const probes = c.env.driveProbes ? c.env.driveProbes() : null;
    const cam = c.camera || (c.renderer && c.renderer.camera);
    const out = { method: M, canvasW: W, canvasH: H, bandH, probes: {}, grid: [], hist: null };
    if (probes && cam) {
      const V = new (window.THREE ? window.THREE.Vector3 : Object)();
      for (const [k, p] of Object.entries(probes)) {
        const v = c.env.driveToWorld ? null : null; void v;
        const q = { x: p[0], y: p[1], z: p[2] };
        // project by hand against the camera matrices
        const mvp = cam.projectionMatrix.elements, vm = cam.matrixWorldInverse.elements;
        const ex = q.x, ey = q.y, ez = q.z;
        const vx = vm[0] * ex + vm[4] * ey + vm[8] * ez + vm[12];
        const vy = vm[1] * ex + vm[5] * ey + vm[9] * ez + vm[13];
        const vz = vm[2] * ex + vm[6] * ey + vm[10] * ez + vm[14];
        const cw = mvp[3] * vx + mvp[7] * vy + mvp[11] * vz + mvp[15];
        const cx = mvp[0] * vx + mvp[4] * vy + mvp[8] * vz + mvp[12];
        const cy = mvp[1] * vx + mvp[5] * vy + mvp[9] * vz + mvp[13];
        if (cw <= 0) { out.probes[k] = { onscreen: false, dist: +Math.hypot(vx, vy, vz).toFixed(2) }; continue; }
        const sx = (cx / cw * 0.5 + 0.5) * W;
        const sy = (1 - (cy / cw * 0.5 + 0.5)) * H;
        const onscreen = sx >= 0 && sx < W && sy >= 0 && sy < bandH;
        out.probes[k] = {
          onscreen, x: Math.round(sx), y: Math.round(sy),
          dist: +Math.hypot(vx, vy, vz).toFixed(2),
          luma: onscreen ? patch(sx, sy, 6) : null,
        };
      }
      void V;
    }

    /* ---- the surface band as a 6 x 10 luminance grid ------------------ */
    for (let r = 0; r < 10; r++) {
      const row = [];
      for (let cI = 0; cI < 6; cI++) {
        let s = 0, n = 0;
        const x0 = Math.floor(cI * W / 6), x1 = Math.floor((cI + 1) * W / 6);
        const y0 = Math.floor(r * bandH / 10), y1 = Math.floor((r + 1) * bandH / 10);
        for (let y = y0; y < y1; y += 3) for (let x = x0; x < x1; x += 3) {
          const i = (y * W + x) * 4;
          s += 0.2126 * img[i] + 0.7152 * img[i + 1] + 0.0722 * img[i + 2]; n++;
        }
        row.push(Math.round(s / n));
      }
      out.grid.push(row);
    }

    /* ---- value histogram of the surface band -------------------------- */
    const bins = new Array(16).fill(0);
    let tot = 0, sum = 0, mx = 0;
    for (let y = 0; y < bandH; y += 2) for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4;
      const L = 0.2126 * img[i] + 0.7152 * img[i + 1] + 0.0722 * img[i + 2];
      bins[Math.min(15, Math.floor(L / 16))]++; tot++; sum += L; if (L > mx) mx = L;
    }
    out.hist = { bins: bins.map((b) => +(b / tot * 100).toFixed(1)), mean: +(sum / tot).toFixed(1), max: Math.round(mx) };
    // share of the band that is genuinely black (<12) and genuinely bright (>150)
    out.hist.pctBlack = +((bins[0] / tot) * 100).toFixed(1);
    out.hist.pctBright = +(bins.slice(10).reduce((a, b) => a + b, 0) / tot * 100).toFixed(1);

    /* ---- draw calls per band ----------------------------------------- */
    const info = (c.gl && c.gl.info) || null;
    out.calls = info ? { calls: info.render.calls, tris: info.render.triangles } : null;
    out.terrainCalls = c.terrain && c.terrain.drawCalls != null ? c.terrain.drawCalls : null;
    out.rigId = c.state && c.state.garage && c.state.garage.rigId;
    out.workLights = (c.rig && c.rig.getWorkLights) ? c.rig.getWorkLights().map((l) => ({
      name: l.name, cone: l.coneDeg, range: l.rangeM, moves: l.moves, colour: l.colourHex,
    })) : null;
    const ugLightNames = [];
    c.scene.traverse((o) => { if (o.isLight) ugLightNames.push(`${o.name || o.type}:${(o.intensity || 0).toFixed(0)}`); });
    out.lights = ugLightNames;
    void gl;
    return out;
  }, mid);

  report.methods[mid] = m;
  const p = m.probes || {};
  const line = (pre) => Object.keys(p).filter((k) => k.startsWith(pre))
    .map((k) => `${k.slice(pre.length)}m:${p[k].luma != null ? p[k].luma : 'off'}`).join('  ');
  process.stdout.write(
    `\n${mid}  rig=${m.rigId}  terrainCalls=${m.terrainCalls}  workLights=${m.workLights ? m.workLights.length : 'n/a'}\n` +
    `  band mean ${m.hist.mean}  max ${m.hist.max}  black<16 ${m.hist.pctBlack}%  bright>160 ${m.hist.pctBright}%\n` +
    `  wall z  ${line('wallR')}\n` +
    `  crown z ${line('crown')}\n` +
    `  face=${p.face ? p.face.luma : '-'}   farEnd=${p.far ? p.far.luma : '-'}\n` +
    `  lights  ${(m.lights || []).join(' ')}\n` +
    `  grid:\n` + m.grid.map((r) => '    ' + r.map((v) => String(v).padStart(4)).join('')).join('\n') + '\n',
  );
}

report.errors = errors;
process.stdout.write(`\nconsole errors: ${errors.length}\n${errors.slice(0, 10).join('\n')}\n`);
if (OUT) writeFileSync(OUT, JSON.stringify(report, null, 1));
await browser.close();
