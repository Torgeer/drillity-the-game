/**
 * SEAM measurement rig — how invisible is the boundary between the two bands?
 *
 *   node .qa-seam.mjs [--tag t] [--quality high] [--methods a,b,c] [--png]
 *
 * research/18-visual-reference.md: "surface and cross-section are ONE
 * CONTINUOUS SCENE ... there is no divider, no seam, no visible split." This
 * turns that sentence into numbers. It reads the real framebuffer at the real
 * band dimensions (390x844 @2) and reports, per method:
 *
 *   layout   ctx.hud / ctx.chrome / band rects and the VISIBLE 54:46 split
 *   step     mean luma and mean R-B either side of the seam, and the jump
 *   lip      the peak luma/warmth ON the seam line (the drawn ground rule)
 *   light    surface key vs section key direction, in screen space
 *   air      fog on each side (aerial perspective continuity)
 *   expo     per-band mean/median luma and p95, i.e. exposure match
 *
 * Not a screenshot tool. Same launch recipe as .qa-ugmeasure.mjs: real Chrome,
 * headed, because headless cannot bind the discrete GPU on this machine.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const has = (n) => argv.includes(`--${n}`);
const TAG = flag('tag', 'seam');
const QUALITY = flag('quality', 'high');
const METHODS = (flag('methods', 'dth,cfa,rockbolt')).split(',');
const PNG = has('png');

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
await page.routeWebSocket(/.*/, () => { /* mute HMR */ })
  .catch((e) => console.log('could not mute HMR -', e.message));

await page.goto(`http://localhost:5178/?quality=${QUALITY}&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.__qa, { timeout: 30000 });
await page.waitForFunction(() => document.body.classList.contains('booted'), { timeout: 60000 }).catch(() => {});
await sleep(2500);

const report = { when: new Date().toISOString(), quality: QUALITY, methods: {}, errors };

/* Crash-safe: this rig lost a whole run to a GPU-process death on method 2.
   Write after every method so a crash costs one method, not the session. */
const flush = () => writeFileSync(`shots/${TAG}-seam.json`, JSON.stringify(report, null, 2));

/* Warm-up gate — the same fault tools/shoot.mjs had (HANDOFF §9.4). Luma
   measurements are not immune to it: a session that is still linking programs
   has not necessarily DRAWN everything yet, and a band mean taken while three
   materials are missing is not a measurement of the band. Poll until the
   program count holds still. */
async function warmUp(page, { minMs = 4000, maxMs = 120000, quietMs = 5000, label = '' } = {}) {
  const t0 = Date.now();
  let lastP = null, stableAt = t0, last = null;
  for (;;) {
    const s = await page.evaluate(() => {
      const c = window.__DRILLITY;
      const gl = c && c.renderer && c.renderer.gl;
      if (!gl) return null;
      return { programs: gl.info.programs ? gl.info.programs.length : null,
               sec: +(performance.now() / 1000).toFixed(1) };
    }).catch(() => null);
    if (!s) return { warm: false, why: 'no renderer', programs: null, sec: (Date.now() - t0) / 1000 };
    last = s;
    if (s.programs !== lastP) { lastP = s.programs; stableAt = Date.now(); }
    const el = Date.now() - t0;
    if (el >= minMs && Date.now() - stableAt >= quietMs) {
      console.log(`  warm${label ? ' ' + label : ''}: ${s.programs} programs, stable, t+${s.sec}s`);
      return { warm: true, why: `programs stable at ${s.programs}`, programs: s.programs, sec: +(el / 1000).toFixed(1) };
    }
    if (el >= maxMs) {
      console.log(`  ! NOT WARM${label ? ' ' + label : ''}: programs still moving at t+${s.sec}s (${s.programs})`);
      return { warm: false, why: `timed out with programs still moving (${s.programs})`, programs: s.programs, sec: +(el / 1000).toFixed(1) };
    }
    await sleep(400);
  }
}

/* the section band draws nothing until a hole is live, so the session warm-up
   has to happen INSIDE a drilling state, not on the menu */
await page.evaluate(async () => {
  const c = window.__DRILLITY;
  try { await c.__qa.startDemoContract({ depth: 12 }); } catch (e) { void e; }
}).catch(() => {});
await sleep(1500);
report.sessionWarm = await warmUp(page, { label: 'session' });

for (const mid of METHODS) {
 try {
  /* ── drive the game into a live drilling run of this method ─────────── */
  const setup = await page.evaluate(async (M) => {
    const c = window.__DRILLITY;
    const d = c.data;
    const regions = (d.REGIONS || []).filter((rg) => d.methodsForRegion
      && d.methodsForRegion(rg.id, d.MAX_LEVEL || 60).some((m) => m.id === M));
    const region = regions[0] ? regions[0].id : undefined;
    let k = null, broke = null;
    try { k = await c.__qa.startDemoContract({ method: M, region, depth: 8 }); }
    catch (e) { broke = String((e && e.message) || e); k = c.state.contract; }
    try { c.sim.debug.setDepth(Math.max(0.5, ((k && k.targetDepth) || 10) * 0.35)); } catch (e) { void e; }
    return { region: region || null, broke };
  }, mid);

  /* the shell holds every scene while the boot screen is up, and re-showing a
     scene that is already current returns without emitting — so wait for the
     site screen to be genuinely live and its chrome measured.

     This used to fail SILENTLY into a console line and then measure anyway,
     which is how a run reported "visible 54/46" off a frame whose chrome was
     zero: the visible split is 54/46 BY CONSTRUCTION whatever the chrome does,
     so it can never detect this. Say what actually failed, and record it. */
  const live = await page.waitForFunction(() => {
    const c = window.__DRILLITY;
    return !!(c && c.state && c.state.scene === 'site' && c.hud
      && c.renderer && c.renderer.chrome && c.renderer.chrome.bottom > 0);
  }, { timeout: 20000 }).then(() => true).catch(() => false);
  let liveWhy = null;
  if (!live) {
    liveWhy = await page.evaluate(() => {
      const c = window.__DRILLITY;
      return {
        scene: c && c.state ? c.state.scene : null,
        hud: (c && c.hud) || null,
        chrome: c && c.renderer ? c.renderer.chrome : null,
        usesHudChrome: !!(c && c.renderer && c.renderer.usesHudChrome),
        siteInDom: !!document.querySelector('.site'),
        sstrip: (() => { const e = document.querySelector('.sstrip'); return e ? +e.getBoundingClientRect().height.toFixed(2) : null; })(),
        sitedock: (() => { const e = document.querySelector('.sitedock'); return e ? +e.getBoundingClientRect().height.toFixed(2) : null; })(),
      };
    }).catch(() => null);
    console.log(`  ! chrome never reached the renderer — ${JSON.stringify(liveWhy)}`);
  }
  await sleep(2600);
  const methodWarm = await warmUp(page, { label: mid, minMs: 1500, quietMs: 2500, maxMs: 40000 });

  /* ── layout + light + air, straight off the live ctx ─────────────────── */
  const scene = await page.evaluate(() => {
    const c = window.__DRILLITY;
    const r = c.renderer;
    const b = c.bands;
    const stage = c.stage;
    const dpr = c.gl.getPixelRatio();

    const vec = (v) => ({ x: +v.x.toFixed(4), y: +v.y.toFixed(4), z: +v.z.toFixed(4) });
    const dirOf = (scn, name) => {
      let out = null;
      scn.traverse((o) => {
        if (out || !o.isDirectionalLight) return;
        if (name && o.name !== name) return;
        const p = o.position.clone().normalize();
        out = { name: o.name, dir: vec(p), intensity: +o.intensity.toFixed(3),
                color: '#' + o.color.getHexString() };
      });
      return out;
    };
    /* project a light direction into each band's own screen space so the two
       are comparable: where does the key come FROM, on screen? */
    const screenDir = (cam, d) => {
      const THREE = c.THREE || null; void THREE;
      const a = { x: d.x, y: d.y, z: d.z };
      // camera-space direction
      const m = cam.matrixWorldInverse.elements;
      const cx = m[0] * a.x + m[4] * a.y + m[8] * a.z;
      const cy = m[1] * a.x + m[5] * a.y + m[9] * a.z;
      const cz = m[2] * a.x + m[6] * a.y + m[10] * a.z;
      const len = Math.hypot(cx, cy, cz) || 1;
      const az = Math.atan2(cx / len, -cz / len) * 180 / Math.PI;   // + = from screen-right
      const el = Math.asin(cy / len) * 180 / Math.PI;               // + = from above
      return { screenAzDeg: +az.toFixed(1), screenElDeg: +el.toFixed(1) };
    };

    const sKey = dirOf(c.scene, 'sun') || dirOf(c.scene, null);
    const gKey = dirOf(c.sectionScene, 'sectionKey');

    const gp = c.composer && c.composer.passes
      ? c.composer.passes.find((p) => p.material && p.material.name === 'DrillityGrade')
      : null;

    return {
      hud: c.hud || null,
      chrome: r.chrome ? { top: r.chrome.top, bottom: r.chrome.bottom } : null,
      usesHudChrome: !!r.usesHudChrome,
      stage: { x: stage.x, y: stage.y, w: stage.w, h: stage.h },
      dpr,
      bands: {
        surface: { x: b.surface.x, y: b.surface.y, w: b.surface.w, h: b.surface.h },
        section: { x: b.section.x, y: b.section.y, w: b.section.w, h: b.section.h },
      },
      seamCssY: b.section.y,
      sectionViewMetres: (c.sectionCamera.top - c.sectionCamera.bottom),
      sectionPxPerMetre: +(b.section.h / (c.sectionCamera.top - c.sectionCamera.bottom)).toFixed(2),
      light: {
        surface: sKey ? { ...sKey, ...screenDir(c.camera, sKey.dir) } : null,
        section: gKey ? { ...gKey, ...screenDir(c.sectionCamera, gKey.dir) } : null,
      },
      air: {
        surfaceFog: c.scene.fog
          ? { type: c.scene.fog.isFogExp2 ? 'exp2' : 'linear',
              density: c.scene.fog.density != null ? +c.scene.fog.density.toFixed(5) : null,
              color: '#' + c.scene.fog.color.getHexString() }
          : null,
        sectionFog: c.sectionScene.fog
          ? { type: c.sectionScene.fog.isFogExp2 ? 'exp2' : 'linear',
              density: c.sectionScene.fog.density != null ? +c.sectionScene.fog.density.toFixed(5) : null,
              color: '#' + c.sectionScene.fog.color.getHexString() }
          : null,
        surfaceEnvIntensity: +(c.scene.environmentIntensity ?? 1).toFixed(3),
        sectionEnvIntensity: +(c.sectionScene.environmentIntensity ?? 1).toFixed(3),
      },
      /* ── CONTINUITY: does the cut open WHERE THE GROUND IS? ───────────
         research/18 point 1 and GAMEDESIGN §1 both ask for one continuous
         scene — "the borehole in the section lines up horizontally with the
         mast above it". That is three separate claims and each is a number:

           groundAtSeamPx  the world ground plane (y=0) at the borehole,
                           projected through the SURFACE camera, in CSS px
                           from the seam. 0 = the cut opens exactly where the
                           ground is. Positive = the ground is BELOW the seam,
                           i.e. the section starts in mid-air.
           collarOffsetPx  the borehole axis (world x=0,z=0) projected into
                           the surface band, minus the section band's own
                           borehole x. Non-zero = the hole is not under the
                           mast.
           scaleRatio      surface CSS px per metre AT THE COLLAR over the
                           section's 19.4 px/m. 1.0 = a rod crossing the seam
                           does not change size. A perspective band and an
                           ortho band can only match on one plane; the collar
                           is the plane that has to match. */
      continuity: (() => {
        const T = c.THREE;
        if (!T) return null;
        const v = new T.Vector3();
        const toBand = (cam, band, x, y, z) => {
          v.set(x, y, z).project(cam);
          return { x: band.x + (v.x * 0.5 + 0.5) * band.w,
                   y: band.y + (1 - (v.y * 0.5 + 0.5)) * band.h,
                   ndcY: +v.y.toFixed(5) };
        };
        const g0 = toBand(c.camera, b.surface, 0, 0, 0);      // collar, ground level
        const g1 = toBand(c.camera, b.surface, 0, 1, 0);      // one metre up the mast
        const s0 = toBand(c.sectionCamera, b.section, 0, 0, 0);
        const s1 = toBand(c.sectionCamera, b.section, 0, -1, 0);
        const surfPxPerM = Math.abs(g0.y - g1.y);
        const sectPxPerM = Math.abs(s0.y - s1.y);
        return {
          groundCssY: +g0.y.toFixed(2),
          seamCssY: b.section.y,
          groundAtSeamPx: +(g0.y - b.section.y).toFixed(2),
          collarSurfaceX: +g0.x.toFixed(2),
          collarSectionX: +s0.x.toFixed(2),
          collarOffsetPx: +(g0.x - s0.x).toFixed(2),
          surfPxPerM: +surfPxPerM.toFixed(2),
          sectPxPerM: +sectPxPerM.toFixed(2),
          scaleRatio: sectPxPerM > 0.01 ? +(surfPxPerM / sectPxPerM).toFixed(3) : null,
          cameraFovDeg: +c.camera.fov.toFixed(2),
          cameraPos: vec(c.camera.position),
        };
      })(),
      grade: gp ? {
        exposure: +gp.uniforms.uExposure.value.toFixed(4),
        seamY: +gp.uniforms.uSeamY.value.toFixed(5),
        seamStrength: +gp.uniforms.uSeamStrength.value.toFixed(3),
        seamCoreGain: +gp.uniforms.uSeamCoreGain.value.toFixed(3),
        seamFallPx: +(gp.uniforms.uSeamFall.value * window.innerHeight).toFixed(2),
        seamCorePx: +(gp.uniforms.uSeamCore.value * window.innerHeight).toFixed(2),
        vignette: +gp.uniforms.uVignette.value.toFixed(3),
        sectionVignette: +gp.uniforms.uSectionVignette.value.toFixed(3),
        bandVignette: +gp.uniforms.uBandVignette.value.toFixed(3),
      } : null,
    };
  });

  /* ── read the framebuffer ────────────────────────────────────────────── */
  const px = await page.evaluate(() => {
    const c = window.__DRILLITY;
    // force one fresh frame into a preserved buffer
    c.renderer.render(0.016);
    const gl = c.gl.domElement;
    const cv = document.createElement('canvas');
    cv.width = gl.width; cv.height = gl.height;
    const g2 = cv.getContext('2d', { willReadFrequently: true });
    g2.drawImage(gl, 0, 0);

    const dpr = c.gl.getPixelRatio();
    const b = c.bands;
    const st = c.stage;
    // sample the middle 70 % of the stage width — avoids the letterbox and the
    // vignette's own horizontal falloff
    const x0 = Math.round((st.x + st.w * 0.15) * dpr);
    const x1 = Math.round((st.x + st.w * 0.85) * dpr);
    const W = Math.max(1, x1 - x0);

    const rowAt = (deviceY) => {
      if (deviceY < 0 || deviceY >= cv.height) return null;
      const d = g2.getImageData(x0, deviceY, W, 1).data;
      let r = 0, gg = 0, bb = 0;
      for (let i = 0; i < W; i++) { r += d[i * 4]; gg += d[i * 4 + 1]; bb += d[i * 4 + 2]; }
      return { r: r / W, g: gg / W, b: bb / W };
    };
    const luma = (p) => 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;

    const seamDev = Math.round(b.section.y * dpr);
    const rows = [];
    for (let dy = -60; dy <= 60; dy++) {
      const p = rowAt(seamDev + dy);
      if (!p) continue;
      rows.push({ dy, cssDy: +(dy / dpr).toFixed(2),
        r: +p.r.toFixed(2), g: +p.g.toFixed(2), b: +p.b.toFixed(2),
        L: +luma(p).toFixed(2), rb: +(p.r - p.b).toFixed(2) });
    }

    /* whole-band statistics — exposure match */
    const bandStats = (band) => {
      const y0 = Math.round(band.y * dpr);
      const h = Math.round(band.h * dpr);
      const d = g2.getImageData(x0, y0, W, h).data;
      const L = new Float32Array(W * h);
      let sum = 0, rb = 0;
      for (let i = 0; i < W * h; i++) {
        const v = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
        L[i] = v; sum += v; rb += d[i * 4] - d[i * 4 + 2];
      }
      const s = Array.from(L).sort((a, z) => a - z);
      const q = (f) => +s[Math.min(s.length - 1, Math.round(f * (s.length - 1)))].toFixed(2);
      return { mean: +(sum / (W * h)).toFixed(2), rbMean: +(rb / (W * h)).toFixed(2),
        p05: q(0.05), median: q(0.5), p95: q(0.95), px: W * h };
    };

    return {
      canvas: { w: cv.width, h: cv.height },
      sampleX: [x0, x1],
      seamDeviceY: seamDev,
      rows,
      surface: bandStats(b.surface),
      section: bandStats(b.section),
    };
  });

  /* ── A/B the two grade terms that can make a seam: the vignette and the
     seam lip. Rendering the same frame with each zeroed isolates how much of
     the measured step is the shader's own doing rather than content. ────── */
  const ab = await page.evaluate(() => {
    const c = window.__DRILLITY;
    const gp = c.composer.passes.find((p) => p.material && p.material.name === 'DrillityGrade');
    const gl = c.gl.domElement;
    const cv = document.createElement('canvas');
    const g2 = cv.getContext('2d', { willReadFrequently: true });
    const dpr = c.gl.getPixelRatio();
    const b = c.bands, st = c.stage;
    const x0 = Math.round((st.x + st.w * 0.15) * dpr);
    const W = Math.max(1, Math.round((st.x + st.w * 0.85) * dpr) - x0);

    const shot = () => {
      c.renderer.render(0.016);
      cv.width = gl.width; cv.height = gl.height;
      g2.drawImage(gl, 0, 0);
      const meanOf = (band) => {
        const d = g2.getImageData(x0, Math.round(band.y * dpr), W, Math.round(band.h * dpr)).data;
        let s = 0; const n = d.length / 4;
        for (let i = 0; i < n; i++) s += 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
        return +(s / n).toFixed(2);
      };
      const rowMean = (deviceY) => {
        const d = g2.getImageData(x0, deviceY, W, 1).data;
        let s = 0; for (let i = 0; i < W; i++) s += 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
        return +(s / W).toFixed(2);
      };
      const seam = Math.round(b.section.y * dpr);
      return { surface: meanOf(b.surface), section: meanOf(b.section),
        above: rowMean(seam - Math.round(6 * dpr)), below: rowMean(seam + Math.round(6 * dpr)) };
    };

    const u = gp.uniforms;
    const keep = { vig: u.uVignette.value, sec: u.uSectionVignette.value,
      ss: u.uSeamStrength.value, cg: u.uSeamCoreGain.value };
    const base = shot();
    u.uVignette.value = 0;                       const noVig = shot();
    u.uVignette.value = keep.vig;
    u.uSeamStrength.value = 0; u.uSeamCoreGain.value = 0; const noLip = shot();
    u.uVignette.value = 0;                       const neither = shot();
    u.uVignette.value = keep.vig; u.uSectionVignette.value = keep.sec;
    u.uSeamStrength.value = keep.ss; u.uSeamCoreGain.value = keep.cg;

    const ratio = (a, z) => ({
      surface: +(a.surface / Math.max(0.01, z.surface)).toFixed(4),
      section: +(a.section / Math.max(0.01, z.section)).toFixed(4),
    });
    return { base, noVig, noLip, neither,
      vignetteMultiplier: ratio(base, noVig),   // what the vignette costs each band
      lipFreeStep: +(neither.below - neither.above).toFixed(2),
      baseStep: +(base.below - base.above).toFixed(2) };
  });

  /* ── derive the seam metrics ─────────────────────────────────────────── */
  const byDy = new Map(px.rows.map((r) => [r.dy, r]));
  const dpr = scene.dpr;
  const band = (a, z) => {
    const sel = px.rows.filter((r) => r.dy >= a && r.dy <= z);
    if (!sel.length) return null;
    const m = (k) => +(sel.reduce((s, r) => s + r[k], 0) / sel.length).toFixed(2);
    return { L: m('L'), rb: m('rb'), r: m('r'), g: m('g'), b: m('b'), n: sel.length };
  };
  // "just above" / "just below", skipping the 3 device px the lip occupies
  const above = band(-Math.round(12 * dpr), -Math.round(3 * dpr));
  const below = band(Math.round(3 * dpr), Math.round(12 * dpr));
  const far = { above: band(-Math.round(40 * dpr), -Math.round(24 * dpr)),
    below: band(Math.round(24 * dpr), Math.round(40 * dpr)) };

  const lipRows = px.rows.filter((r) => Math.abs(r.dy) <= Math.round(3 * dpr));
  const lipPeak = lipRows.reduce((best, r) => (!best || r.L > best.L ? r : best), null);
  const lipPeakRb = lipRows.reduce((best, r) => (!best || r.rb > best.rb ? r : best), null);
  const baseline = above && below ? (above.L + below.L) / 2 : 0;
  const baselineRb = above && below ? (above.rb + below.rb) / 2 : 0;

  const stepL = above && below ? +(below.L - above.L).toFixed(2) : null;
  const stepRatio = above && below && above.L > 0.01 ? +(below.L / above.L).toFixed(3) : null;

  const vis = scene.bands.surface.h + scene.bands.section.h;
  report.methods[mid] = {
    setup,
    /* EVERY NUMBER BELOW IS STAMPED WITH THE CONDITIONS IT WAS TAKEN UNDER.
       `chromeLive` false means the bands were never inset and the layout
       numbers describe a frame the player never sees; `warm` false means the
       session was still compiling and the pixels may be missing content. */
    warm: methodWarm.warm && report.sessionWarm.warm,
    warmDetail: { session: report.sessionWarm, method: methodWarm },
    chromeLive: live, chromeWhy: liveWhy,
    layout: {
      hud: scene.hud, chrome: scene.chrome, usesHudChrome: scene.usesHudChrome,
      stage: scene.stage, bands: scene.bands, seamCssY: scene.seamCssY,
      visibleSplitPct: {
        surface: +(100 * scene.bands.surface.h / vis).toFixed(1),
        section: +(100 * scene.bands.section.h / vis).toFixed(1),
      },
      stagePct: {
        surface: +(100 * scene.bands.surface.h / scene.stage.h).toFixed(1),
        section: +(100 * scene.bands.section.h / scene.stage.h).toFixed(1),
      },
      sectionViewMetres: +scene.sectionViewMetres.toFixed(2),
      sectionPxPerMetre: scene.sectionPxPerMetre,
    },
    continuity: scene.continuity,
    grade: scene.grade,
    light: scene.light,
    air: scene.air,
    seam: {
      above, below, far,
      stepL, stepRatio,
      stepRb: above && below ? +(below.rb - above.rb).toFixed(2) : null,
      lipPeakL: lipPeak ? lipPeak.L : null,
      lipPeakOverBaselineL: lipPeak ? +(lipPeak.L - baseline).toFixed(2) : null,
      lipPeakRb: lipPeakRb ? lipPeakRb.rb : null,
      lipPeakOverBaselineRb: lipPeakRb ? +(lipPeakRb.rb - baselineRb).toFixed(2) : null,
      /* how far the warm lip actually reaches: last |dy| where R-B is more
         than 4 above the far-field R-B on that side */
      warmReachAbovePx: (() => {
        if (!far.above) return null;
        let last = 0;
        for (let d = 1; d <= 60; d++) { const r = byDy.get(-d); if (r && r.rb - far.above.rb > 4) last = d; }
        return +(last / dpr).toFixed(1);
      })(),
      warmReachBelowPx: (() => {
        if (!far.below) return null;
        let last = 0;
        for (let d = 1; d <= 60; d++) { const r = byDy.get(d); if (r && r.rb - far.below.rb > 4) last = d; }
        return +(last / dpr).toFixed(1);
      })(),
    },
    ab,
    exposure: { surface: px.surface, section: px.section,
      meanStep: +(px.section.mean - px.surface.mean).toFixed(2),
      meanRatio: +(px.section.mean / Math.max(0.01, px.surface.mean)).toFixed(3) },
    profile: px.rows.filter((r) => r.dy % 2 === 0),
  };

  if (PNG) {
    await page.evaluate(() => { const u = document.getElementById('ui'); if (u) u.style.visibility = 'hidden'; });
    await sleep(220);
    await page.screenshot({ path: `shots/${TAG}-${mid}-seam.png` });
    await page.evaluate(() => { const u = document.getElementById('ui'); if (u) u.style.visibility = ''; });
  }

  const Ly = report.methods[mid].layout;
  console.log(
    `— ${mid}: seam y=${scene.seamCssY}  chrome ${scene.chrome ? scene.chrome.top + '/' + scene.chrome.bottom : 'null'}` +
    `  stage ${Ly.stagePct.surface}/${Ly.stagePct.section}  visible ${Ly.visibleSplitPct.surface}/${Ly.visibleSplitPct.section}` +
    `  stepL=${stepL}  lip+L=${report.methods[mid].seam.lipPeakOverBaselineL}  lip+RB=${report.methods[mid].seam.lipPeakOverBaselineRb}` +
    `  [${report.methods[mid].warm ? 'warm' : 'COLD'}${live ? '' : ', CHROME NOT LIVE'}]`);
  flush();
 } catch (e) {
   /* a GPU-process death used to lose the whole run here. Record it against
      the method it happened to and stop, with everything before it saved. */
   const why = String((e && e.message) || e).slice(0, 220);
   report.methods[mid] = { aborted: why };
   console.log(`— ${mid}: ABORTED — ${why}`);
   flush();
   break;
 }
}

await browser.close();
const out = `shots/${TAG}-seam.json`;
flush();
console.log('\nwrote', out);
if (errors.length) console.log('console errors:', errors.slice(0, 8));
