/**
 * LOOK-AHEAD UNCERTAINTY — the measurement that has to pass.
 *
 * The feature's one hard promise is that it NEVER LIES: ground the bit has
 * already cut must be drawn exactly as it was before the feature existed, at
 * every survey confidence. This probe proves that by pixels rather than by
 * assertion.
 *
 * Method. Same seed, same region, same method, same depth; only the contract's
 * survey confidence changes. Capture the section band at conf 1.00 (nothing is
 * uncertain — the control) and at conf 0.25 (a greenfield step-out), then diff
 * them ROW BY ROW over the geology columns only, excluding the borehole itself,
 * the drill-log strip and the depth ruler. Two captures at the SAME confidence
 * give the noise floor, because the band is composited through a live post
 * chain and is not bit-identical frame to frame.
 *
 * PASS is: every row above the bit line is inside the noise floor, and the
 * first row that is not is at or below it.
 *
 * The bit line is found from the picture, not assumed: the depth readout is an
 * amber plate riding the ruler at exactly the bit, so the probe locates the
 * amber and takes its centre row.
 *
 *   node .probe-look.mjs --port 5211 --depth 12 --tag look
 */
import { chromium, devices } from 'playwright';
import { writeFileSync, readFileSync } from 'node:fs';
import { PNG } from './node_modules/playwright-core/lib/utilsBundle.js';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const PORT = arg('port', '5211');
const DEPTH = Number(arg('depth', 12));
const TAG = arg('tag', 'look');
const SEED = Number(arg('seed', 4242));
const METHOD = arg('method', 'dth');
const REGION = arg('region', 'nordic');

const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const c = await browser.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await c.newPage();
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message.slice(0, 200)));

await page.goto(`http://localhost:${PORT}/?quality=high&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 90000 }).catch(() => {});
// the harness measures nothing until the session is warm (HANDOFF §9.4)
await page.waitForTimeout(14000);
await page.addStyleTag({ content: '.screen,.sitedock,.sstrip,.hud,#model-error{opacity:0 !important}' });

async function shoot(conf, file) {
  await page.evaluate(({ conf, depth, seed, method, region }) => {
    const D = window.__DRILLITY;
    D.geology.generateProfile({
      regionId: region, applicationId: 'water-well', targetDepth: 45,
      seed, difficulty: 0.3, holeDiaMm: 152, methodId: method,
      /* NO ORE BODY. makeOreBody() also keys off oreConfidence — the ghost
         alpha and the predicted-horizon error both move with it — and that
         would confound a measurement of the look-ahead with a measurement of
         the ore reveal, ABOVE the bit as well as below. Isolate the one
         thing under test. */
      commodity: null, oreConfidence: conf,
    });
    window.__PD = depth;
    if (!window.__PIN) {
      window.__PIN = true;
      const tick = () => {
        D.state.drill.depth = window.__PD;
        Object.assign(D.state.drill, { active: true, rpm: 0.75, torque: 0.5, jam: 0, wob: 0.55 });
        requestAnimationFrame(tick);
      };
      tick();
    }
  }, { conf, depth: DEPTH, seed: SEED, method: METHOD, region: REGION });
  await page.waitForTimeout(2600);            // let smoothDepth and uWhirl settle
  await page.screenshot({ path: file });
}

await shoot(1.00, `shots/${TAG}-c100a.png`);
await shoot(1.00, `shots/${TAG}-c100b.png`);
await shoot(0.55, `shots/${TAG}-c055.png`);
await shoot(0.25, `shots/${TAG}-c025.png`);

const read = (f) => PNG.sync.read(readFileSync(f));
const A = read(`shots/${TAG}-c100a.png`);
const B = read(`shots/${TAG}-c100b.png`);
const M = read(`shots/${TAG}-c055.png`);
const W = read(`shots/${TAG}-c025.png`);

const w = A.width, h = A.height;
// the section band, in DEVICE pixels: LAYOUT.sectionHeight 0.46 of a 844 CSS px
// viewport at dpr 2. Taken from the page so the probe cannot drift from it.
const band = await page.evaluate(() => {
  const L = window.__DRILLITY.layout || {};
  const sh = (L.sectionHeight != null ? L.sectionHeight : 0.46);
  return { top: Math.round(window.innerHeight * (1 - sh) * devicePixelRatio), dpr: devicePixelRatio };
});
const y0 = band.top, y1 = h;

const px = (img, x, y) => { const i = (y * w + x) << 2; return [img.data[i], img.data[i + 1], img.data[i + 2]]; };

/* Find the bit line from the amber readout plate on the right edge. */
let bitRows = [];
for (let y = y0; y < y1; y++) {
  let n = 0;
  for (let x = w - 130; x < w - 6; x++) {
    const [r, g, b] = px(A, x, y);
    if (r > 190 && g > 120 && g < 210 && b < 110) n++;
  }
  if (n > 3) bitRows.push(y);
}
const bitY = bitRows.length ? Math.round((bitRows[0] + bitRows[bitRows.length - 1]) / 2) : -1;

/* Geology columns only: past the drill-log strip on the left, short of the
   depth ruler on the right, and outside the borehole down the middle. */
const cols = [];
for (let x = Math.round(w * 0.30); x < Math.round(w * 0.84); x++) {
  if (Math.abs(x - w / 2) < Math.round(w * 0.10)) continue;   // the bore
  cols.push(x);
}

function rowDiff(P, Q, y) {
  let s = 0;
  for (const x of cols) {
    const a = px(P, x, y), b = px(Q, x, y);
    s += Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  }
  return s / (cols.length * 3);
}

let floor = 0, floorMax = 0;
for (let y = y0; y < y1; y++) { const d = rowDiff(A, B, y); floor += d; if (d > floorMax) floorMax = d; }
floor /= (y1 - y0);
const thresh = Math.max(floorMax * 1.5, 1.0);

const rows = [];
for (let y = y0; y < y1; y++) rows.push({ y, m: rowDiff(A, M, y), w: rowDiff(A, W, y) });

const firstAboveW = rows.find((r) => r.w > thresh);
const aboveBit = rows.filter((r) => bitY > 0 && r.y < bitY - 4);
const belowBit = rows.filter((r) => bitY > 0 && r.y > bitY + 4);
const mean = (a, k) => (a.length ? a.reduce((s, r) => s + r[k], 0) / a.length : 0);

const out = {
  port: PORT, depth: DEPTH, seed: SEED, method: METHOD, region: REGION,
  bandTopPx: y0, bitLinePx: bitY,
  noiseFloorMeanPerCh: +floor.toFixed(3),
  noiseFloorMaxPerCh: +floorMax.toFixed(3),
  threshold: +thresh.toFixed(3),
  firstRowChangedByWildcat: firstAboveW ? firstAboveW.y : null,
  firstChangedIsBelowBit: firstAboveW && bitY > 0 ? firstAboveW.y > bitY : null,
  meanDiffAboveBit: { conf055: +mean(aboveBit, 'm').toFixed(3), conf025: +mean(aboveBit, 'w').toFixed(3) },
  meanDiffBelowBit: { conf055: +mean(belowBit, 'm').toFixed(3), conf025: +mean(belowBit, 'w').toFixed(3) },
  rowsAboveBitOverThreshold: aboveBit.filter((r) => r.w > thresh).map((r) => r.y),
  profile: rows.filter((r, i) => i % 12 === 0).map((r) => [r.y, +r.m.toFixed(2), +r.w.toFixed(2)]),
  consoleErrors: errs.slice(0, 8),
};
writeFileSync(`shots/${TAG}.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify({
  bitLinePx: out.bitLinePx, noiseFloorMax: out.noiseFloorMaxPerCh, threshold: out.threshold,
  firstRowChangedByWildcat: out.firstRowChangedByWildcat,
  firstChangedIsBelowBit: out.firstChangedIsBelowBit,
  rowsAboveBitOverThreshold: out.rowsAboveBitOverThreshold.length,
  meanDiffAboveBit: out.meanDiffAboveBit, meanDiffBelowBit: out.meanDiffBelowBit,
  errors: errs.length,
}, null, 2));
errs.slice(0, 6).forEach((e) => console.log('  ', e));
await browser.close();
