/** .probe-bore3.mjs — per-mesh intrusion into the bore column, plus the band's
 *  own value structure. Whitelist one mesh at a time over the backdrop and
 *  count the pixels it puts inside the drawn hole ABOVE the bit. */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const METHOD = process.argv[2] || 'dth';
const DIA = Number(process.argv[3] || 152);
const DEPTH = Number(process.argv[4] || 34);

const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await c.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil: 'load' });
await p.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 1200));
await p.evaluate(async ({ method, dia, depth }) => {
  const C = window.__DRILLITY;
  await C.__qa.startDemoContract({ depth, method });
  C.state.contract.holeDia = dia;
  C.geology.generateProfile({ regionId: C.state.contract.regionId, applicationId: C.state.contract.applicationId,
    targetDepth: C.state.contract.targetDepth, seed: 1337, difficulty: 2, methodId: method, holeDiaMm: dia });
  C.geology.setDepth(depth);
}, { method: METHOD, dia: DIA, depth: DEPTH });
await new Promise((r) => setTimeout(r, 2500));

const out = await p.evaluate(async ({ depth }) => {
  const C = window.__DRILLITY, T = C.THREE, R = C.renderer, G = C.geology;
  document.getElementById('ui').style.display = 'none';
  const band = C.bands.section, cam = C.sectionCamera, gl = R.gl.domElement;
  const bx = band.gx, bw = band.gw, bh = band.gh, bTop = gl.height - (band.gy + band.gh);
  const ppu = bh / ((cam.top - cam.bottom) / (cam.zoom || 1));
  const project = (x, y) => { const v = new T.Vector3(x, y, 0).project(cam);
    return { x: bx + (v.x * 0.5 + 0.5) * bw, y: bTop + (1 - (v.y * 0.5 + 0.5)) * bh }; };
  const grab = async () => {
    const url = R.captureFrame(); const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    return g.getImageData(0, 0, cv.width, cv.height);
  };
  const px = (im, x, y) => { const i = (y * im.width + x) * 4; return [im.data[i], im.data[i + 1], im.data[i + 2]]; };
  const diff = (a, b2) => Math.abs(a[0] - b2[0]) > 3 || Math.abs(a[1] - b2[1]) > 3 || Math.abs(a[2] - b2[2]) > 3;

  const centreX = Math.round(project(0, 0).x);
  const bitRow = Math.round(project(0, G.worldYForDepth(depth)).y);
  const rTop = bTop + 3, rBot = Math.min(bitRow - 6, bTop + bh - 4);   // drilled ground only
  const halfPx = G.holeRadius * ppu;                                   // drawn bore half-width

  const all = []; C.sectionScene.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) all.push([o, o.visible, o.name || '(anon)']); });
  const names = [...new Set(all.map((a) => a[2]))];
  const show = (pred) => all.forEach(([o, , n]) => { o.visible = pred(n); });

  show((n) => n === 'section-backdrop');
  const BASE = await grab();

  const perMesh = {};
  for (const n of names) {
    if (n === 'section-backdrop') continue;
    show((x) => x === 'section-backdrop' || x === n);
    const F = await grab();
    let inBore = 0, inCore = 0, outside = 0;
    for (let y = rTop; y <= rBot; y++) {
      for (let x = centreX - 140; x <= centreX + 140; x++) {
        if (!diff(px(F, x, y), px(BASE, x, y))) continue;
        const d = Math.abs(x - centreX);
        if (d < halfPx * 0.80) inCore++;
        else if (d < halfPx) inBore++;
        else outside++;
      }
    }
    perMesh[n] = { insideCore80pct: inCore, inOuterBore: inBore, outside };
  }
  all.forEach(([o, v]) => { o.visible = v; });
  const FULL = await grab();

  // ── value structure of the section band (sRGB -> L*) ─────────────────────
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const Lstar = (r, g, b2) => { const Y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b2);
    return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y; };
  const Ls = [];
  for (let y = bTop + 2; y < bTop + bh - 2; y += 2)
    for (let x = bx + 2; x < bx + bw - 2; x += 2) { const c0 = px(FULL, x, y); Ls.push(Lstar(c0[0], c0[1], c0[2])); }
  Ls.sort((a, b2) => a - b2);
  const q = (f) => +Ls[Math.min(Ls.length - 1, Math.floor(f * Ls.length))].toFixed(1);

  return {
    scale: { ppu: +ppu.toFixed(2), holeRUnits: +G.holeRadius.toFixed(4), boreHalfPx: +halfPx.toFixed(1),
      trueHoleHalfPx: +((G.holeDiaMm / 2000) * ppu).toFixed(2), exagg: +((2 * G.holeRadius) / (G.holeDiaMm / 1000)).toFixed(2) },
    window: { centreX, bitRow, rTop, rBot, metresOfHoleVisible: +((bitRow - rTop) / ppu).toFixed(2) },
    perMesh,
    luminance: { p1: q(0.01), p5: q(0.05), p50: q(0.50), p90: q(0.90), p95: q(0.95), p99: q(0.99), max: +Ls[Ls.length - 1].toFixed(1),
      pctAbove70: +(100 * Ls.filter((v) => v > 70).length / Ls.length).toFixed(2),
      pctBelow5: +(100 * Ls.filter((v) => v < 5).length / Ls.length).toFixed(2) },
  };
}, { depth: DEPTH });

out.consoleErrors = errs;
writeFileSync('.probe-bore3.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await b.close();
