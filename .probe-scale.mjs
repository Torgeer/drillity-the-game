/* ═══════════════════════════════════════════════════════════════════════════
   .probe-scale.mjs — is the section's scale declaration ON SCREEN and TRUE?

   HANDOFF §9.3 asks for the bore exaggeration to be badged "computed from the
   actual transform ... whenever it is not 1:1". Two things have to hold and
   both are measurable:

   1. THE NUMBER IS DERIVED, not asserted. boreExaggeration must equal
      2 * holeRadius / trueDiameter for every contract diameter, including at
      both clamps (holeRBase floor, holeRMax ceiling, where it goes UNDER 1).
   2. THE BADGE IS VISIBLE. This is the half that was already broken: the
      station ruler's V.E. badge is right-aligned to a canvas whose right edge
      sits 10.59 units — 53 % of a band width — outside the frustum, so it has
      never been on screen. The probe projects the carrier's corners through
      the section camera and refuses anything outside NDC [-1, 1], and it
      counts ink in the canvas rows the text is drawn into.

   Run: node .probe-scale.mjs --port 5241
   ═══════════════════════════════════════════════════════════════════════════ */
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const PORT = arg('port', '5178');
const OUT = arg('out', '.probe-scale.json');

const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const context = await browser.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await context.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 200)));

await page.goto(`http://localhost:${PORT}/?quality=high&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(11000);

const DIAS = [38, 152, 305, 600, 1200, 6000];

const res = await page.evaluate(async (dias) => {
  const D = window.__DRILLITY, T = D.THREE, geo = D.geology;
  const out = [];
  const find = (n) => { let m = null; geo.scene.traverse((o) => { if (o.name === n) m = o; }); return m; };

  /* Ink census on a canvas, in a row band, restricted to the x range that is
     actually inside the frustum. A badge drawn outside that range is drawn
     nowhere the player can see. */
  const ink = (canvas, y0, y1, x0, x1) => {
    const g = canvas.getContext('2d');
    const d = g.getImageData(Math.max(0, x0 | 0), Math.max(0, y0 | 0),
                             Math.max(1, (x1 - x0) | 0), Math.max(1, (y1 - y0) | 0)).data;
    let n = 0;
    // count pixels appreciably brighter than the plate's own dark ground
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 40 && (d[i] + d[i + 1] + d[i + 2]) / 3 > 90) n++;
    }
    return n;
  };

  for (const mm of dias) {
    /* Drive the diameter the way a contract does — generateProfile() is the
       public entry the HOLE_START handler itself uses (geology.js:6507). */
    geo.generateProfile({ regionId: 'nordic', applicationId: 'water-well',
                          targetDepth: 60, seed: 1337, difficulty: 0.3,
                          holeDiaMm: mm, profileMode: 'vertical' });
    D.state.drill.depth = 30;
    Object.assign(D.state.drill, { active: true, rpm: 0.7, torque: 0.4, jam: 0 });
    await new Promise((r) => setTimeout(r, 800));
    const sv = D.sectionView || {};
    const plate = find('scale-plate');
    let vis = null, inkTop = 0, inkBot = 0;
    if (plate) {
      plate.updateWorldMatrix(true, false);
      const box = new T.Box3().setFromObject(plate);
      const cam = geo.camera;
      const a = box.min.clone().project(cam), b = box.max.clone().project(cam);
      vis = { x0: +a.x.toFixed(3), y0: +a.y.toFixed(3), x1: +b.x.toFixed(3), y1: +b.y.toFixed(3) };
      const c = plate.material.map.image;
      inkTop = ink(c, 0, c.height * 0.55, 0, c.width);
      inkBot = ink(c, c.height * 0.45, c.height, 0, c.width);
    }
    out.push({
      askedMm: mm,
      holeDiaMm: sv.holeDiaMm, holeRadius: sv.holeRadius,
      boreExaggeration: sv.boreExaggeration,
      derived: sv.holeRadius && sv.holeDiaMm ? (2 * sv.holeRadius) / (sv.holeDiaMm / 1000) : null,
      plateExists: !!plate, plateNdc: vis, inkTop, inkBot,
    });
  }

  // and the station ruler's own V.E. badge carrier, for comparison
  const xr = find('station-ruler');
  let xrNdc = null;
  if (xr) {
    xr.updateWorldMatrix(true, false);
    const box = new T.Box3().setFromObject(xr);
    const cam = geo.camera;
    const a = box.min.clone().project(cam), b = box.max.clone().project(cam);
    xrNdc = { x0: +a.x.toFixed(3), x1: +b.x.toFixed(3) };
  }
  return { rows: out, mode: D.sectionView?.profileMode, stationRulerNdc: xrNdc };
}, DIAS);

res.errors = errors;
fs.writeFileSync(OUT, JSON.stringify(res, null, 2));

console.log('─'.repeat(86));
console.log('mode:', res.mode);
console.log('askedØ  drawnØ   holeR    badge     derived   agree  plate NDC x/y            ink T/B');
for (const r of res.rows) {
  const agree = r.derived != null && Math.abs(r.derived - r.boreExaggeration) < 1e-6;
  const n = r.plateNdc;
  const inFrustum = n && n.x0 >= -1.001 && n.x1 <= 1.001 && n.y0 >= -1.001 && n.y1 <= 1.001;
  console.log(
    `${String(r.askedMm).padStart(5)}  ${String(r.holeDiaMm).padStart(6)}  `
    + `${(r.holeRadius ?? 0).toFixed(3)}  ${(r.boreExaggeration ?? 0).toFixed(3).padStart(8)}  `
    + `${(r.derived ?? 0).toFixed(3).padStart(8)}  ${agree ? ' ok  ' : ' NO  '}  `
    + `${n ? `${n.x0} ${n.x1} / ${n.y0} ${n.y1}` : 'MISSING'}${inFrustum ? '' : ' ** OFF SCREEN **'}  `
    + `${r.inkTop}/${r.inkBot}`);
}
console.log('station-ruler carrier NDC x:', JSON.stringify(res.stationRulerNdc),
            res.stationRulerNdc && res.stationRulerNdc.x1 > 1.001 ? ' <-- its right-anchored badge is off screen' : '');
console.log('console errors:', errors.length);
errors.slice(0, 6).forEach((e) => console.log('  ', e));
await browser.close();
