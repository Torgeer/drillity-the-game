/** .probe-bore2.mjs — what actually draws over the bore column, and does the
 *  face discard there at all? Whitelist-hide everything, then difference. */
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
  const C = window.__DRILLITY, T = C.THREE, R = C.renderer;
  document.getElementById('ui').style.display = 'none';
  const band = C.bands.section, cam = C.sectionCamera, gl = R.gl.domElement;
  const bx = band.gx, bw = band.gw, bh = band.gh, bTop = gl.height - (band.gy + band.gh);
  const pxPerUnit = bh / ((cam.top - cam.bottom) / (cam.zoom || 1));
  const project = (x, y) => { const v = new T.Vector3(x, y, 0).project(cam);
    return { x: bx + (v.x * 0.5 + 0.5) * bw, y: bTop + (1 - (v.y * 0.5 + 0.5)) * bh }; };

  // ── inventory ───────────────────────────────────────────────────────────
  const inv = [];
  C.sectionScene.traverse((o) => {
    if (!o.isMesh && !o.isPoints && !o.isLine) return;
    let box = null;
    try { const bb = new T.Box3().setFromObject(o);
      const a = project(bb.min.x, bb.max.y), d = project(bb.max.x, bb.min.y);
      box = { x0: +a.x.toFixed(0), x1: +d.x.toFixed(0), y0: +a.y.toFixed(0), y1: +d.y.toFixed(0) }; } catch (e) { void e; }
    inv.push({ name: o.name || '(anon)', type: o.type, visible: o.visible,
      parentVisible: o.parent ? o.parent.visible : null, renderOrder: o.renderOrder,
      transparent: !!(o.material && o.material.transparent), box });
  });

  const grab = async () => {
    const url = R.captureFrame(); const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    return g.getImageData(0, 0, cv.width, cv.height);
  };
  const px = (im, x, y) => { const i = (y * im.width + x) * 4; return [im.data[i], im.data[i + 1], im.data[i + 2]]; };
  const same = (a, b2) => Math.abs(a[0] - b2[0]) <= 2 && Math.abs(a[1] - b2[1]) <= 2 && Math.abs(a[2] - b2[2]) <= 2;

  // ── whitelist: show ONLY the face and the backdrop ───────────────────────
  const all = []; C.sectionScene.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) all.push([o, o.visible]); });
  const keep = new Set(['section-face', 'section-backdrop']);
  all.forEach(([o]) => { o.visible = keep.has(o.name); });
  const P = await grab();
  all.forEach(([o]) => { o.visible = o.name === 'section-backdrop'; });
  const Q = await grab();
  all.forEach(([o, v]) => { o.visible = v; });

  const G = window.__DRILLITY.geology;
  if (!G) return { fatal: 'ctx.geology vanished', keys: Object.keys(window.__DRILLITY) };
  const bitRow = Math.round(project(0, G.worldYForDepth(depth)).y);
  const centreX = Math.round(project(0, 0).x);
  const rows = [];
  for (const dz of [0.5, 1, 2, 3, 5]) {
    const wy = G.worldYForDepth(Math.max(depth - dz, 0.3));
    const row = Math.round(project(0, wy).y);
    if (row < bTop + 2 || row > bTop + bh - 3) { rows.push({ dz, row, off: true }); continue; }
    // scan a window +-90 px around the bore centre
    const marks = [];
    for (let x = centreX - 90; x <= centreX + 90; x++) if (same(px(P, x, row), px(Q, x, row))) marks.push(x);
    rows.push({ dz, row, discardedNear: marks.length,
      lo: marks.length ? marks[0] : null, hi: marks.length ? marks[marks.length - 1] : null,
      widthPx: marks.length ? marks[marks.length - 1] - marks[0] + 1 : 0 });
  }
  // brightness profile across the bore on the full frame, for reference
  const full = await grab();
  const profileRow = rows.find((r) => !r.off && r.dz === 2);
  let lum = null;
  if (profileRow) {
    lum = [];
    for (let x = centreX - 60; x <= centreX + 60; x += 2) {
      const c0 = px(full, x, profileRow.row);
      lum.push([x - centreX, Math.round(0.2126 * c0[0] + 0.7152 * c0[1] + 0.0722 * c0[2])]);
    }
  }

  return { bitRow, centreX, pxPerUnit: +pxPerUnit.toFixed(2), holeR: +G.holeRadius.toFixed(4),
    bandTop: bTop, bandBottom: bTop + bh, uDepth: G.viewMetres,
    rows, lum,
    inventory: inv.filter((o) => o.visible !== false || true) };
}, { depth: DEPTH });

out.consoleErrors = errs;
writeFileSync('.probe-bore2.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify({ ...out, inventory: out.inventory.length + ' items -> .probe-bore2.json' }, null, 2));
await b.close();
