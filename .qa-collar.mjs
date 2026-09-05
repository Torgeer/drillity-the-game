/**
 * COLLAR / BAND-REGISTRATION measurement rig.
 *
 *   node .qa-collar.mjs [--tag t] [--methods a,b,c] [--quality high]
 *
 * `.qa-seam.mjs` already reports the three continuity NUMBERS (collarOffsetPx,
 * groundAtSeamPx, scaleRatio). It does not report the thing you need in order
 * to decide whether they can be MOVED, which is what else is in the frame and
 * how much room there is either side of the machine. Shifting the surface band
 * to seat the collar on the seam is only safe if the machine does not then run
 * into the status card at the top or off the seam at the bottom, and no
 * instrument in this repo measures that.
 *
 * So this one reads, per method, off the LIVE ctx and warm:
 *
 *   collar     the three continuity numbers, recomputed with .qa-seam.mjs's
 *              own arithmetic so the two rigs are comparable
 *   rig        the rig root's world AABB, and its projection into the surface
 *              band as a CSS-px rect — crown, base, left, right
 *   room       clearance from the rig rect to every obstruction: the band top,
 *              the seam, and the live DOM rects of .sstrip / .sitedock / the
 *              status card
 *   sectionZ   the section scene's world Z extent, per named child. An
 *              orthographic camera 30 units back makes an exp2 fog density
 *              meaningless unless you know the depth range it has to work
 *              across; this is that range.
 *   lens       camera.view (setViewOffset) state, so a shifted frame can be
 *              told apart from an unshifted one in the report itself.
 *
 * Same launch recipe as .qa-seam.mjs: real Chrome, HEADED, because headless
 * cannot bind the discrete GPU on this machine, and the same programs-stable
 * warm gate, because a cold frame has not necessarily drawn everything yet.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const TAG = flag('tag', 'collar');
const QUALITY = flag('quality', 'high');
const PORT = flag('port', '5178');
const METHODS = (flag('methods', 'dth,cfa,auger')).split(',');

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
await page.routeWebSocket(/.*/, () => { /* mute HMR */ }).catch(() => {});

await page.goto(`http://localhost:${PORT}/?quality=${QUALITY}&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.__qa, { timeout: 30000 });
await page.waitForFunction(() => document.body.classList.contains('booted'), { timeout: 60000 }).catch(() => {});
await sleep(2500);

const report = { when: new Date().toISOString(), quality: QUALITY, methods: {}, errors };
const flush = () => writeFileSync(`shots/${TAG}-collar.json`, JSON.stringify(report, null, 2));

/* the same warm gate as .qa-seam.mjs — HANDOFF §9.4 */
async function warmUp({ minMs = 4000, maxMs = 120000, quietMs = 5000, label = '' } = {}) {
  const t0 = Date.now();
  let lastP = null, stableAt = t0;
  for (;;) {
    const s = await page.evaluate(() => {
      const c = window.__DRILLITY;
      const gl = c && c.renderer && c.renderer.gl;
      if (!gl) return null;
      return { programs: gl.info.programs ? gl.info.programs.length : null };
    }).catch(() => null);
    if (!s) return { warm: false, why: 'no renderer' };
    if (s.programs !== lastP) { lastP = s.programs; stableAt = Date.now(); }
    const el = Date.now() - t0;
    if (el >= minMs && Date.now() - stableAt >= quietMs) {
      console.log(`  warm ${label}: ${s.programs} programs stable`);
      return { warm: true, programs: s.programs, sec: +(el / 1000).toFixed(1) };
    }
    if (el >= maxMs) {
      console.log(`  ! NOT WARM ${label}: programs still moving (${s.programs})`);
      return { warm: false, why: 'timed out', programs: s.programs };
    }
    await sleep(400);
  }
}

await page.evaluate(async () => {
  const c = window.__DRILLITY;
  try { await c.__qa.startDemoContract({ depth: 12 }); } catch (e) { void e; }
}).catch(() => {});
await sleep(1500);
report.sessionWarm = await warmUp({ label: 'session' });

for (const mid of METHODS) {
 try {
  await page.evaluate(async (M) => {
    const c = window.__DRILLITY;
    const d = c.data;
    const regions = (d.REGIONS || []).filter((rg) => d.methodsForRegion
      && d.methodsForRegion(rg.id, d.MAX_LEVEL || 60).some((m) => m.id === M));
    const region = regions[0] ? regions[0].id : undefined;
    let k = null;
    try { k = await c.__qa.startDemoContract({ method: M, region, depth: 8 }); }
    catch (e) { k = c.state.contract; }
    try { c.sim.debug.setDepth(Math.max(0.5, ((k && k.targetDepth) || 10) * 0.35)); } catch (e) { void e; }
  }, mid);

  const live = await page.waitForFunction(() => {
    const c = window.__DRILLITY;
    return !!(c && c.state && c.state.scene === 'site' && c.hud
      && c.renderer && c.renderer.chrome && c.renderer.chrome.bottom > 0);
  }, { timeout: 20000 }).then(() => true).catch(() => false);
  await sleep(2600);
  const warm = await warmUp({ label: mid, minMs: 1500, quietMs: 2500, maxMs: 40000 });

  const m = await page.evaluate(() => {
    const c = window.__DRILLITY;
    const T = c.THREE;
    const b = c.bands, stage = c.stage, r = c.renderer;
    const v = new T.Vector3();

    const toBand = (cam, band, x, y, z) => {
      v.set(x, y, z).project(cam);
      return { x: band.x + (v.x * 0.5 + 0.5) * band.w,
               y: band.y + (1 - (v.y * 0.5 + 0.5)) * band.h };
    };

    /* ── the three continuity numbers, .qa-seam.mjs's arithmetic verbatim ── */
    const g0 = toBand(c.camera, b.surface, 0, 0, 0);
    const g1 = toBand(c.camera, b.surface, 0, 1, 0);
    const s0 = toBand(c.sectionCamera, b.section, 0, 0, 0);
    const s1 = toBand(c.sectionCamera, b.section, 0, -1, 0);
    const surfPxPerM = Math.abs(g0.y - g1.y);
    const sectPxPerM = Math.abs(s0.y - s1.y);

    /* ── the rig, as a world AABB and as a band rect ──────────────────── */
    let rigNode = null;
    c.scene.traverse((o) => { if (!rigNode && /^rig:/.test(o.name || '')) rigNode = o; });
    let rig = null;
    if (rigNode) {
      const box = new T.Box3().setFromObject(rigNode);
      if (Number.isFinite(box.min.x) && !box.isEmpty()) {
        // project all 8 corners; a perspective camera does not preserve extrema
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (let i = 0; i < 8; i++) {
          const p = toBand(c.camera, b.surface,
            (i & 1) ? box.max.x : box.min.x,
            (i & 2) ? box.max.y : box.min.y,
            (i & 4) ? box.max.z : box.min.z);
          x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
          y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
        }
        rig = {
          name: rigNode.name,
          worldMin: { x: +box.min.x.toFixed(3), y: +box.min.y.toFixed(3), z: +box.min.z.toFixed(3) },
          worldMax: { x: +box.max.x.toFixed(3), y: +box.max.y.toFixed(3), z: +box.max.z.toFixed(3) },
          bandRect: { left: +x0.toFixed(2), right: +x1.toFixed(2), top: +y0.toFixed(2), bottom: +y1.toFixed(2) },
        };
      }
    }

    /* ── what is in the way, measured off the DOM, not assumed ────────── */
    const rect = (sel) => {
      const e = document.querySelector(sel);
      if (!e) return null;
      const q = e.getBoundingClientRect();
      return { top: +q.top.toFixed(2), bottom: +q.bottom.toFixed(2), h: +q.height.toFixed(2) };
    };

    /* ── the section scene's depth range, for the fog question ────────── */
    const zs = [];
    c.sectionScene.traverse((o) => {
      if (!o.isMesh && !o.isPoints && !o.isLine) return;
      const box = new T.Box3().setFromObject(o);
      if (box.isEmpty() || !Number.isFinite(box.min.z)) return;
      zs.push({ name: o.name || o.type, z0: +box.min.z.toFixed(2), z1: +box.max.z.toFixed(2),
                visible: o.visible });
    });
    const zvis = zs.filter((q) => q.visible && Math.abs(q.z0) < 500 && Math.abs(q.z1) < 500);

    const camView = c.camera.view && c.camera.view.enabled
      ? { enabled: true, offsetX: +c.camera.view.offsetX.toFixed(3), offsetY: +c.camera.view.offsetY.toFixed(3),
          fullWidth: c.camera.view.fullWidth, fullHeight: c.camera.view.fullHeight,
          width: c.camera.view.width, height: c.camera.view.height }
      : { enabled: false };

    return {
      bands: { surface: { ...b.surface.x !== undefined ? { x: b.surface.x, y: b.surface.y, w: b.surface.w, h: b.surface.h } : {} },
               section: { x: b.section.x, y: b.section.y, w: b.section.w, h: b.section.h } },
      surfaceBand: { x: b.surface.x, y: b.surface.y, w: b.surface.w, h: b.surface.h },
      stage: { x: stage.x, y: stage.y, w: stage.w, h: stage.h },
      chrome: r.chrome ? { top: r.chrome.top, bottom: r.chrome.bottom } : null,
      collar: {
        groundCssY: +g0.y.toFixed(2),
        seamCssY: b.section.y,
        groundAtSeamPx: +(g0.y - b.section.y).toFixed(2),
        collarSurfaceX: +g0.x.toFixed(2),
        collarSectionX: +s0.x.toFixed(2),
        collarOffsetPx: +(g0.x - s0.x).toFixed(2),
        surfPxPerM: +surfPxPerM.toFixed(2),
        sectPxPerM: +sectPxPerM.toFixed(2),
        scaleRatio: sectPxPerM > 0.01 ? +(surfPxPerM / sectPxPerM).toFixed(3) : null,
      },
      camera: {
        fov: +c.camera.fov.toFixed(3),
        pos: { x: +c.camera.position.x.toFixed(3), y: +c.camera.position.y.toFixed(3), z: +c.camera.position.z.toFixed(3) },
        view: camView,
      },
      sectionCamera: {
        pos: { x: +c.sectionCamera.position.x.toFixed(3), y: +c.sectionCamera.position.y.toFixed(3), z: +c.sectionCamera.position.z.toFixed(3) },
        left: +c.sectionCamera.left.toFixed(3), right: +c.sectionCamera.right.toFixed(3),
        top: +c.sectionCamera.top.toFixed(3), bottom: +c.sectionCamera.bottom.toFixed(3),
      },
      rig,
      obstructions: {
        statusCard: rect('.sstrip') || rect('.statusbar') || rect('.sitetop'),
        sstrip: rect('.sstrip'),
        sitedock: rect('.sitedock'),
        telegraph: rect('.telegraph') || rect('.hazstrip'),
      },
      sectionZ: {
        count: zvis.length,
        min: zvis.length ? +Math.min(...zvis.map((q) => q.z0)).toFixed(2) : null,
        max: zvis.length ? +Math.max(...zvis.map((q) => q.z1)).toFixed(2) : null,
        items: zvis.slice(0, 40),
      },
      air: {
        surfaceFog: c.scene.fog ? { exp2: !!c.scene.fog.isFogExp2,
          density: c.scene.fog.density != null ? +c.scene.fog.density.toFixed(5) : null,
          near: c.scene.fog.near, far: c.scene.fog.far,
          color: '#' + c.scene.fog.color.getHexString() } : null,
        sectionFog: c.sectionScene.fog ? { exp2: !!c.sectionScene.fog.isFogExp2,
          density: c.sectionScene.fog.density != null ? +c.sectionScene.fog.density.toFixed(5) : null,
          near: c.sectionScene.fog.near, far: c.sectionScene.fog.far,
          color: '#' + c.sectionScene.fog.color.getHexString() } : null,
        surfaceEnvIntensity: +(c.scene.environmentIntensity ?? 1).toFixed(3),
        sectionEnvIntensity: +(c.sectionScene.environmentIntensity ?? 1).toFixed(3),
      },
    };
  });

  m.warm = warm.warm && report.sessionWarm.warm;
  m.chromeLive = live;
  report.methods[mid] = m;
  flush();

  const k = m.collar;
  console.log(`${mid.padEnd(10)} [${m.warm ? 'warm' : 'COLD'}${live ? '' : ', CHROME NOT LIVE'}]`);
  console.log(`  collarOffsetPx ${k.collarOffsetPx}  groundAtSeamPx ${k.groundAtSeamPx}  scaleRatio ${k.scaleRatio}`);
  console.log(`  surf ${k.surfPxPerM} px/m   sect ${k.sectPxPerM} px/m   lens ${JSON.stringify(m.camera.view)}`);
  if (m.rig) console.log(`  rig ${m.rig.name} band rect ${JSON.stringify(m.rig.bandRect)}  world y ${m.rig.worldMin.y}..${m.rig.worldMax.y}`);
  console.log(`  section z ${m.sectionZ.min}..${m.sectionZ.max} over ${m.sectionZ.count} meshes`);
 } catch (e) {
  report.methods[mid] = { failed: String((e && e.message) || e) };
  flush();
  console.log(`${mid}: FAILED — ${e && e.message}`);
 }
}

flush();
console.log(`\nwrote shots/${TAG}-collar.json`);
if (errors.length) console.log('console errors:', errors.slice(0, 8));
await browser.close();
