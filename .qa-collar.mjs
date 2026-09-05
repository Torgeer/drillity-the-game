/**
 * COLLAR / BAND-REGISTRATION measurement rig.
 *
 *   node .qa-collar.mjs [--tag t] [--methods a,b,c] [--quality high]
 *                       [--region andes] [--port 5178]
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
 *   sectionZ   the section scene's world Z and X extent, per named child. An
 *              orthographic camera 30 units back makes an exp2 fog density
 *              meaningless unless you know the depth range it has to work
 *              across; this is that range. (It is 11.2 m, which is why
 *              `sectionScene.fog` is correctly null — see core/env.js.)
 *   lens       camera.view (setViewOffset) state, so a shifted frame can be
 *              told apart from an unshifted one in the report itself.
 *
 * Added 2026-09-05, because the four numbers above could not adjudicate what
 * they were being asked to:
 *
 *   collar.sectionGroundAtSeamPx   where the CUT puts depth 0, against the
 *              seam. `groundAtSeamPx` is the SURFACE band's ground line and
 *              says nothing about the cut's own datum — and a depth ruler
 *              zeroed anywhere else is a precision instrument with the wrong
 *              origin. It is depth-dependent: the cut scrolls, the surface
 *              does not.
 *   rig.groundRect  the rig's four y=0 corners on their own. The full AABB
 *              dips below grade (track pads, and the string already in the
 *              hole), so its projected bottom cannot tell you what the seam
 *              clips off the MACHINE, which is the question.
 *   lights     each band's key, in THAT BAND'S OWN screen space. Comparing a
 *              screen azimuth against a world azimuth is what put "47-71 deg
 *              apart" on the record; measured properly the gap is 53.5 deg
 *              and both are from the right. HANDOFF §8C.
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
/* `--region andes` pins the sky recipe. The two bands' key lights must agree
   on which SIDE of frame they come from, and four of the eight recipes light
   the surface from the LEFT — a default run only ever samples nordic and
   alpine, both of which are right-lit, so it cannot see the case that
   mattered. See .probe-suns.mjs. */
const REGION = flag('region', null);
/* `--depth 0.05` spuds instead of drilling 35 % in. `collar.groundAtSeamPx` is
   a SURFACE number and is depth-independent; `sectionGroundAtSeamPx` is not —
   the cut scrolls and the surface does not, so the only depth at which the two
   ground lines can be compared at all is the one where drilling starts. */
const DEPTH_FRAC = flag('depthfrac', null);

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

const report = { when: new Date().toISOString(), quality: QUALITY, region: REGION, methods: {}, errors };
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
  await page.evaluate(async ([M, PIN, DF]) => {
    const c = window.__DRILLITY;
    const d = c.data;
    const regions = (d.REGIONS || []).filter((rg) => d.methodsForRegion
      && d.methodsForRegion(rg.id, d.MAX_LEVEL || 60).some((m) => m.id === M));
    const region = PIN || (regions[0] ? regions[0].id : undefined);
    let k = null;
    try { k = await c.__qa.startDemoContract({ method: M, region, depth: 8 }); }
    catch (e) { k = c.state.contract; }
    try { c.sim.debug.setDepth(Math.max(0.5, ((k && k.targetDepth) || 10) * (DF != null ? Number(DF) : 0.35))); } catch (e) { void e; }
    /* A method/region pair the generator will not issue still has to be
       measurable: env mirrors state.world.regionId every frame, so writing it
       there is what actually moves the sky, and it survives update(). */
    if (PIN && c.state && c.state.world) c.state.world.regionId = PIN;
  }, [mid, REGION, DEPTH_FRAC]);

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

    /* ── the SECTION's own ground line ────────────────────────────────────
       The two numbers above compare the SURFACE band's ground line to the
       seam. They say nothing about where the CUT puts depth 0 — and a depth
       ruler zeroed anywhere else is a ruler with the wrong origin. geology
       scrolls `root` and maps depth through `secYForDepth(m) = depthAtY0 - m`,
       so the ground line is a live world Y, not a constant. */
    const sv = c.sectionView || {};
    let sectionGroundCssY = null, sectionGroundAtSeamPx = null;
    if (Number.isFinite(sv.depthAtY0)) {
      let rootY = 0;
      c.sectionScene.traverse((o) => {
        if (o.name === 'section-face' && o.parent) rootY = o.parent.position.y;
      });
      const p = toBand(c.sectionCamera, b.section, 0, sv.depthAtY0 + rootY, 0);
      sectionGroundCssY = +p.y.toFixed(2);
      sectionGroundAtSeamPx = +(p.y - b.section.y).toFixed(2);
    }

    /* ── each band's KEY LIGHT, in that band's OWN screen space ───────────
       World azimuth is not what the eye reads. What the eye reads is which
       SIDE of the frame the light falls from and how steep it is — i.e. the
       light's direction transformed into the camera's own basis. screenAz is
       measured clockwise from screen-up, so 90 = from the right of frame.
       towardCamera > 0 means the light is behind the viewer (frontal fill). */
    const screenLight = (cam, light) => {
      if (!light) return null;
      const d = new T.Vector3().copy(light.position);
      if (light.target) d.sub(light.target.position);
      if (d.lengthSq() < 1e-9) return null;
      d.normalize();                                   // surface -> light
      const q = d.clone().transformDirection(cam.matrixWorldInverse);
      return {
        screenAzDeg: +(((Math.atan2(q.x, q.y) * 180) / Math.PI + 360) % 360).toFixed(1),
        towardCameraDeg: +((Math.asin(Math.max(-1, Math.min(1, q.z))) * 180) / Math.PI).toFixed(1),
        worldElDeg: +((Math.asin(Math.max(-1, Math.min(1, d.y))) * 180) / Math.PI).toFixed(1),
        colour: '#' + light.color.getHexString(),
        intensity: +light.intensity.toFixed(3),
      };
    };
    const byName = (root, n) => { let f = null; root.traverse((o) => { if (!f && o.name === n) f = o; }); return f; };

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
        /* the four y=0 corners on their own. The full AABB dips below grade
           (track pads, and the string already in the hole), so its projected
           bottom says nothing about what the seam clips off the MACHINE. */
        let gx0 = Infinity, gy0 = Infinity, gx1 = -Infinity, gy1 = -Infinity;
        for (let i = 0; i < 4; i++) {
          const p = toBand(c.camera, b.surface,
            (i & 1) ? box.max.x : box.min.x, 0, (i & 2) ? box.max.z : box.min.z);
          gx0 = Math.min(gx0, p.x); gx1 = Math.max(gx1, p.x);
          gy0 = Math.min(gy0, p.y); gy1 = Math.max(gy1, p.y);
        }
        rig = {
          name: rigNode.name,
          worldMin: { x: +box.min.x.toFixed(3), y: +box.min.y.toFixed(3), z: +box.min.z.toFixed(3) },
          worldMax: { x: +box.max.x.toFixed(3), y: +box.max.y.toFixed(3), z: +box.max.z.toFixed(3) },
          bandRect: { left: +x0.toFixed(2), right: +x1.toFixed(2), top: +y0.toFixed(2), bottom: +y1.toFixed(2) },
          groundRect: { left: +gx0.toFixed(2), right: +gx1.toFixed(2), top: +gy0.toFixed(2), bottom: +gy1.toFixed(2) },
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
                x0: +box.min.x.toFixed(2), x1: +box.max.x.toFixed(2),
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
        sectionGroundCssY,
        sectionGroundAtSeamPx,
        sectionMode: sv.profileMode || null,
        depthAtY0: Number.isFinite(sv.depthAtY0) ? +sv.depthAtY0.toFixed(3) : null,
        holeX: Number.isFinite(sv.holeX) ? +sv.holeX.toFixed(3) : null,
        /* geology sizes `halfH` as viewMetres*0.5 and lays its headroom, its
           strip-recentring window and its ruler framing out against it; the
           renderer anchors the cut's WIDTH, so the frustum's true height is
           whatever a shorter band can show at 19.4 px/m. When these two
           disagree, everything geology positions from halfH is off by the
           ratio — including a depth ruler. */
        viewMetresClaimed: Number.isFinite(sv.viewMetres) ? +sv.viewMetres.toFixed(3) : null,
        viewMetresActual: +(c.sectionCamera.top - c.sectionCamera.bottom).toFixed(3),
      },
      lights: {
        surfaceKey: screenLight(c.camera, byName(c.scene, 'keySun')),
        sectionKey: screenLight(c.sectionCamera, byName(c.sectionScene, 'sectionKey')),
        sectionFill: screenLight(c.sectionCamera, byName(c.sectionScene, 'sectionFill')),
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
  console.log(`  section mode ${k.sectionMode} depthAtY0 ${k.depthAtY0} holeX ${k.holeX}  sectionGroundAtSeamPx ${k.sectionGroundAtSeamPx}`);
  console.log(`  viewMetres claimed ${k.viewMetresClaimed} vs actual frustum ${k.viewMetresActual}`);
  console.log(`  light surf ${JSON.stringify(m.lights.surfaceKey)}`);
  console.log(`  light sect ${JSON.stringify(m.lights.sectionKey)}`);
  if (m.rig) console.log(`  rig GROUND rect ${JSON.stringify(m.rig.groundRect)}`);
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
