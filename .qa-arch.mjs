/**
 * Archetype capture + budget rig, for the terrain owner.
 *
 *   node .qa-arch.mjs [--tag t] [--quality high] [--specs "m@region#arch,..."]
 *
 * Forces terrain.js into a named SITE_ARCHETYPES id (via contract.archetype,
 * which update() treats as the authority), photographs the BANDS with the HUD
 * hidden, and reports what the site costs: terrain draw calls, the whole
 * surface band's calls/triangles, and a 6x10 luminance grid so "the frame is
 * flat" is a number rather than an opinion.
 *
 * Same shape as .qa-ugmeasure.mjs deliberately — read that first.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const TAG = flag('tag', 'arch');
const QUALITY = flag('quality', 'high');
const PORT = flag('port', '5178');
const SPECS = (flag('specs',
  'hdd@german-site#infrastructure-corridor,'
  + 'dth@andes#open-pit-bench,'
  + 'top-hammer@alpine#tunnel-portal,'
  + 'site-investigation@north-sea#marine-spread,'
  + 'oil-rotary@north-sea#platform-deck')).split(',').filter(Boolean);

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
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 220)); });
page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e).slice(0, 220)));
await page.routeWebSocket(/.*/, () => {}).catch(() => {});

await page.goto(`http://localhost:${PORT}/?quality=${QUALITY}&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.__qa, { timeout: 40000 });
await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 120000 }).catch(() => {});
await sleep(3000);

const report = { when: new Date().toISOString(), quality: QUALITY, sites: {} };

for (const spec of SPECS) {
  const [mid, rest] = spec.split('@');
  const [regionOv, archOv] = (rest || '').split('#');
  const label = archOv || mid;

  const setup = async () => page.evaluate(async ([M, R, A]) => {
    const c = window.__DRILLITY;
    const d = c.data;
    let k = null;
    try { k = await c.__qa.startDemoContract({ method: M, region: R || undefined, depth: 8 }); }
    catch (e) { k = c.state.contract; void e; }
    try { c.sim.debug.setDepth(4); } catch (e) { void e; }
    const buildable = c.rig.listRigs ? c.rig.listRigs() : [];
    const cands = (d.rigsForMethod ? d.rigsForMethod(M) : []).map((r) => r.id);
    for (const id of cands) {
      const render = d.rigRenderId ? d.rigRenderId(id, buildable) : id;
      if (buildable.includes(render)) { c.state.garage.rigId = render; c.rig.setRig(render); break; }
    }
    c.rig.setMethod(M);
    try { c.ui.show('site'); } catch (e) { void e; }
    c.renderer.setCameraMode('hero');
    c.state.contract = { ...(c.state.contract || {}), methodId: M, regionId: R || 'nordic', archetype: A || undefined };
    if (c.state.world) {
      c.state.world.regionId = R || c.state.world.regionId;
      c.state.world.site = { methodId: M, regionId: R, archetype: A, sitePlane: null };
    }
    return { arch: c.terrain && c.terrain.archetype, region: c.terrain && c.terrain.regionId };
  }, [mid, regionOv || null, archOv || null]);

  let st = null;
  for (let a = 0; a < 4; a++) {
    st = await setup();
    await sleep(1100);
    st = await page.evaluate(() => ({
      arch: window.__DRILLITY.terrain.archetype,
      region: window.__DRILLITY.terrain.regionId,
      method: window.__DRILLITY.terrain.methodId,
    }));
    if (!archOv || st.arch === archOv) break;
    process.stdout.write(`  [retry ${a + 1}] wanted ${archOv}, got ${st.arch}\n`);
  }

  /* --probe "x,y,z,r[,dx,dy,dz]" frames a sphere of radius r centred on a
     world point, using renderer.focusOn(). This is a DIAGNOSTIC view, not a
     review view: it is how you find out what a kit actually built when the
     hero frame is ambiguous, without guessing from a 90 px slot. */
  const PROBE = flag('probe', null);
  if (PROBE) {
    const p = PROBE.split(',').map(Number);
    await page.evaluate((q) => {
      const c = window.__DRILLITY, T = c.THREE;
      if (window.__probeMesh) c.scene.remove(window.__probeMesh);
      const m = new T.Mesh(new T.SphereGeometry(q[3] || 20, 8, 6), new T.MeshBasicMaterial());
      m.position.set(q[0], q[1], q[2]);
      m.visible = false;
      c.scene.add(m);
      window.__probeMesh = m;
      c.renderer.focusOn(m, { padding: 1.0, dir: q.length > 4 ? [q[4], q[5], q[6]] : undefined, duration: 0 });
    }, p);
  }

  // let it live a moment so wind, dust and the machine are moving
  await sleep(1400);

  /* Hide EVERY DOM element that is not an ancestor of the canvas — not just
     #ui. Another agent's error banner (the glTF "machine model unavailable"
     card) is mounted outside #ui and covered a third of two review frames
     before this was general. A shot of the bands must contain only the bands. */
  await page.evaluate(() => {
    const cv = document.querySelector('canvas');
    window.__hidden = [];
    for (const el of document.body.querySelectorAll('body > *')) {
      if (cv && el.contains(cv)) continue;
      window.__hidden.push([el, el.style.visibility]);
      el.style.visibility = 'hidden';
    }
    const u = document.getElementById('ui');
    if (u && !window.__hidden.some((h) => h[0] === u)) { window.__hidden.push([u, u.style.visibility]); u.style.visibility = 'hidden'; }
  });
  await sleep(320);
  await page.screenshot({ path: `shots/${TAG}-${label}.png`, animations: 'allow' });
  await page.evaluate(() => { for (const [el, v] of (window.__hidden || [])) el.style.visibility = v; });

  const m = await page.evaluate(() => {
    const c = window.__DRILLITY, T = c.THREE;
    const cv = document.querySelector('canvas');
    const W = cv.width, H = cv.height;
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const g2 = off.getContext('2d', { willReadFrequently: true });
    g2.drawImage(cv, 0, 0);
    const img = g2.getImageData(0, 0, W, H).data;
    const split = (c.LAYOUT && c.LAYOUT.surfaceHeight) || 0.54;
    const bandH = Math.round(H * split);

    const grid = [];
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
      grid.push(row);
    }
    const bins = new Array(16).fill(0);
    let tot = 0, sum = 0, mx = 0;
    for (let y = 0; y < bandH; y += 2) for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4;
      const L = 0.2126 * img[i] + 0.7152 * img[i + 1] + 0.0722 * img[i + 2];
      bins[Math.min(15, Math.floor(L / 16))]++; tot++; sum += L; if (L > mx) mx = L;
    }

    // isolated surface-band cost, measured the way .perf-terrain.mjs does
    const gl = c.renderer.gl, info = gl.info;
    const prevAuto = gl.shadowMap.autoUpdate; gl.shadowMap.autoUpdate = false;
    const rt = new T.WebGLRenderTarget(32, 32);
    const one = () => {
      info.reset(); gl.setRenderTarget(rt);
      try { gl.render(c.scene, c.camera); } catch (e) { void e; }
      gl.setRenderTarget(null);
      return { calls: info.render.calls, tris: info.render.triangles };
    };
    const full = one();
    const troot = c.scene.children.find((x) => (x.name || '') === 'terrain-root');
    let terrain = null;
    if (troot) { troot.visible = false; const w = one(); troot.visible = true; terrain = { calls: full.calls - w.calls, tris: full.tris - w.tris }; }
    rt.dispose(); gl.shadowMap.autoUpdate = prevAuto;

    return {
      arch: c.terrain.archetype, region: c.terrain.regionId, method: c.terrain.methodId,
      terrainCalls: c.terrain.drawCalls,
      surface: full, terrain,
      hist: {
        mean: +(sum / tot).toFixed(1), max: Math.round(mx),
        pctBlack: +((bins[0] / tot) * 100).toFixed(1),
        pctBright: +(bins.slice(10).reduce((a, b) => a + b, 0) / tot * 100).toFixed(1),
      },
      grid,
    };
  });

  /* --ray "px,py[;px,py...]" — pixel coordinates in the SAVED PNG. Raycasts
     the scene from the live camera and names what is actually there, which is
     the only way to stop guessing at a shape in a screenshot. */
  const RAY = flag('ray', null);
  if (RAY) {
    const hits = await page.evaluate((spec) => {
      const c = window.__DRILLITY, T = c.THREE;
      const cv = document.querySelector('canvas');
      const rc = new T.Raycaster();
      const out = [];
      for (const pair of spec.split(';')) {
        const [px, py] = pair.split(',').map(Number);
        const ndc = new T.Vector2((px / cv.width) * 2 - 1, -(py / cv.height) * 2 + 1);
        rc.setFromCamera(ndc, c.camera);
        const list = rc.intersectObject(c.scene, true).slice(0, 4).map((h) => ({
          name: h.object.name || h.object.type,
          parent: (h.object.parent && h.object.parent.name) || null,
          dist: +h.distance.toFixed(1),
          mat: (h.object.material && h.object.material.name) || null,
        }));
        out.push({ px, py, list });
      }
      return out;
    }, RAY);
    process.stdout.write(`  RAY ${JSON.stringify(hits)}\n`);
  }

  report.sites[label] = m;
  process.stdout.write(
    `${label.padEnd(24)} arch=${String(m.arch).padEnd(24)} terrain ${String(m.terrainCalls).padStart(3)} calls  `
    + `surface ${m.surface.calls} calls / ${m.surface.tris} tris  (terrain ${m.terrain ? m.terrain.calls + '/' + m.terrain.tris : '?'})  `
    + `mean L${m.hist.mean}\n`);
}

report.errors = errors;
const path = `shots/${TAG}-report.json`;
writeFileSync(path, JSON.stringify(report, null, 1), 'utf8');
process.stdout.write(`\nconsole errors: ${errors.length}\n${errors.slice(0, 8).join('\n')}\n${path}\n`);
await browser.close();
