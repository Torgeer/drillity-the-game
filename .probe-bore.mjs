/**
 * .probe-bore.mjs — measure the borehole against the section's own ruler.
 *
 * Answers, in device pixels off the real framebuffer (headed Chrome, discrete
 * GPU — headless SwiftShader is useless here):
 *
 *   1. px per metre in the section band, from the ortho camera AND from the
 *      drawn ruler's own tick spacing, so the two must agree.
 *   2. the drawn bore opening width, measured by DIFFERENCE: render the face
 *      with the wall/rod/bit hidden, then render with the face hidden too.
 *      Pixels identical in both frames are pixels the face DISCARDED — i.e.
 *      the hole. No thresholding, no guessing.
 *   3. the bit mesh's projected screen width.
 *   4. whether the fracture (joint) meshes put any pixel inside the bore.
 *
 * Usage: node .probe-bore.mjs [methodId] [holeDiaMm] [depth]
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const METHOD = process.argv[2] || 'dth';
const DIA = Number(process.argv[3] || 152);
const DEPTH = Number(process.argv[4] || 34);

const b = await chromium.launch({ channel: 'chrome', headless: false,
  args: ['--hide-scrollbars', '--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'],
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await c.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 220)); });
p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 220)));

await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil: 'load' });
await p.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 1200));

await p.evaluate(async ({ method, dia, depth }) => {
  const C = window.__DRILLITY;
  await C.__qa.startDemoContract({ depth, method });
  C.state.contract.holeDia = dia;
  C.geology.generateProfile({
    regionId: C.state.contract.regionId,
    applicationId: C.state.contract.applicationId,
    targetDepth: C.state.contract.targetDepth,
    seed: 1337, difficulty: C.state.contract.difficulty ?? 2,
    methodId: method, holeDiaMm: dia,
  });
  C.geology.setDepth(depth);
}, { method: METHOD, dia: DIA, depth: DEPTH });
await new Promise((r) => setTimeout(r, 2500));

const out = await p.evaluate(async ({ depth }) => {
  const C = window.__DRILLITY, T = C.THREE;
  document.getElementById('ui').style.display = 'none';
  const R = C.renderer, band = C.bands.section, cam = C.sectionCamera;
  const gl = R.gl.domElement;
  const dev = { w: gl.width, h: gl.height };

  const byName = {};
  C.sectionScene.traverse((o) => { if (o.name) (byName[o.name] ||= []).push(o); });
  const set = (n, v) => (byName[n] || []).forEach((o) => { o.visible = v; });
  const wasVis = {};
  Object.keys(byName).forEach((n) => { wasVis[n] = byName[n].map((o) => o.visible); });

  const grab = async () => {
    const url = R.captureFrame();
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const cv = document.createElement('canvas');
    cv.width = img.width; cv.height = img.height;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    return { data: g.getImageData(0, 0, cv.width, cv.height), w: cv.width, h: cv.height };
  };

  // ── section band rect in IMAGE coords (top-left origin) ──────────────────
  const bx = band.gx, bw = band.gw, bh = band.gh;
  const bTop = dev.h - (band.gy + band.gh);

  // ── scale from the camera ───────────────────────────────────────────────
  const worldH = (cam.top - cam.bottom) / (cam.zoom || 1);
  const worldW = (cam.right - cam.left) / (cam.zoom || 1);
  const pxPerUnitY = bh / worldH;
  const pxPerUnitX = bw / worldW;

  const project = (x, y) => {
    const v = new T.Vector3(x, y, 0).project(cam);
    return { x: bx + (v.x * 0.5 + 0.5) * bw, y: bTop + (1 - (v.y * 0.5 + 0.5)) * bh };
  };

  // ── the bit mesh, projected ─────────────────────────────────────────────
  const bit = (byName['bit'] || [])[0];
  let bitBox = null;
  if (bit) {
    const box = new T.Box3().setFromObject(bit);
    const a = project(box.min.x, box.max.y), d = project(box.max.x, box.min.y);
    bitBox = {
      worldMinX: +box.min.x.toFixed(4), worldMaxX: +box.max.x.toFixed(4),
      worldW: +(box.max.x - box.min.x).toFixed(4),
      worldMinY: +box.min.y.toFixed(3), worldMaxY: +box.max.y.toFixed(3),
      pxW: +(d.x - a.x).toFixed(1), pxH: +(d.y - a.y).toFixed(1),
      screenX: +a.x.toFixed(1), screenYTop: +a.y.toFixed(1), screenYBot: +d.y.toFixed(1),
      visible: bit.visible, scale: bit.scale.x,
    };
  }

  // ── FRAME P: face + backdrop only ───────────────────────────────────────
  const hideList = ['borehole-wall', 'casing', 'drill-string', 'bit', 'boulders',
    'fractures', 'cavities', 'water-table', 'annotations', 'station-ruler',
    'depth-readout', 'boreholeTip'];
  hideList.forEach((n) => set(n, false));
  const P = await grab();
  // ── FRAME Q: backdrop only (face hidden) ────────────────────────────────
  set('section-face', false);
  const Q = await grab();
  set('section-face', true);
  // ── FRAME F: fractures only, over the backdrop ──────────────────────────
  set('section-face', false); set('fractures', true);
  const F = await grab();
  set('fractures', false);
  // ── FRAME R: ruler only, over backdrop ──────────────────────────────────
  set('station-ruler', true);
  const Rr = await grab();
  set('station-ruler', false);
  set('section-face', true);
  // restore
  Object.keys(byName).forEach((n) => byName[n].forEach((o, i) => { o.visible = wasVis[n][i]; }));

  const at = (im, x, y) => { const i = (y * im.w + x) * 4; return [im.data.data[i], im.data.data[i + 1], im.data.data[i + 2]]; };
  const same = (a, b2) => Math.abs(a[0] - b2[0]) <= 2 && Math.abs(a[1] - b2[1]) <= 2 && Math.abs(a[2] - b2[2]) <= 2;

  // world y of the bit == -depth in section-root space; find its screen row
  const bitScreen = project(0, C.geology.sectionRoot.position.y - 0);
  // sample rows ABOVE the bit (already drilled ground) by world depth
  const rowsFor = [];
  for (const dz of [1, 2, 4, 8, 12]) {
    const wy = C.geology.worldYForDepth(Math.max(depth - dz, 0.2));
    const s = project(0, wy);
    rowsFor.push({ aboveBitM: dz, row: Math.round(s.y) });
  }
  const bitRow = Math.round(project(0, C.geology.worldYForDepth(depth)).y);
  const centreX = Math.round(project(0, 0).x);

  // ── measure the discarded (hole) run on each row ─────────────────────────
  const holeRuns = rowsFor.map(({ aboveBitM, row }) => {
    if (row < bTop + 2 || row > bTop + bh - 2) return { aboveBitM, row, err: 'off band' };
    let lo = null, hi = null, n = 0;
    for (let x = bx + 1; x < bx + bw - 1; x++) {
      if (same(at(P, x, row), at(Q, x, row))) {
        n++;
        if (Math.abs(x - centreX) < bw * 0.35) { if (lo === null || x < lo) lo = x; if (hi === null || x > hi) hi = x; }
      }
    }
    return { aboveBitM, row, holePxLo: lo, holePxHi: hi,
      holePxWidth: lo === null ? 0 : hi - lo + 1, totalDiscardedPx: n };
  });

  // ── fracture pixels inside the bore ─────────────────────────────────────
  let fracInside = 0, fracOutside = 0;
  for (const { row } of rowsFor) {
    if (row < bTop + 2 || row > bTop + bh - 2) continue;
    for (let x = bx + 1; x < bx + bw - 1; x++) {
      if (same(at(F, x, row), at(Q, x, row))) continue;   // nothing drawn here
      const dxUnits = Math.abs(x - centreX) / pxPerUnitX;
      if (dxUnits < C.geology.holeRadius * 0.85) fracInside++; else fracOutside++;
    }
  }

  // ── ruler tick spacing from pixels: column profile of the ruler-only frame
  const rulerCols = [];
  for (let x = bx; x < bx + bw; x++) {
    let n = 0;
    for (let y = bTop + 2; y < bTop + bh - 2; y++) if (!same(at(Rr, x, y), at(Q, x, y))) n++;
    if (n > bh * 0.5) rulerCols.push(x);
  }
  // the long vertical ruler spine: find rows where a tick sticks out left of it
  let spine = rulerCols.length ? rulerCols[0] : null;
  const tickRows = [];
  if (spine !== null) {
    const probeX = spine - 8;
    for (let y = bTop + 2; y < bTop + bh - 2; y++) {
      if (!same(at(Rr, probeX, y), at(Q, probeX, y))) tickRows.push(y);
    }
  }
  const groups = [];
  for (const y of tickRows) {
    if (groups.length && y - groups[groups.length - 1][groups[groups.length - 1].length - 1] <= 2) groups[groups.length - 1].push(y);
    else groups.push([y]);
  }
  const centres = groups.map((g) => g.reduce((a, v) => a + v, 0) / g.length);
  const gaps = centres.slice(1).map((v, i) => +(v - centres[i]).toFixed(1));

  return {
    errors: errs0(),
    contract: { methodId: C.state.contract?.methodId, holeDia: C.state.contract?.holeDia,
      targetDepth: C.state.contract?.targetDepth, region: C.state.contract?.regionId },
    geology: { holeDiaMm: C.geology.holeDiaMm, holeRadiusUnits: +C.geology.holeRadius.toFixed(4),
      holeRadiusAtBit: +C.geology.holeRadiusAt(depth).toFixed(4),
      viewMetres: C.geology.viewMetres, profileMode: C.geology.profileMode,
      annulus: { innerR: +C.geology.annulus.innerR.toFixed(4), outerR: +C.geology.annulus.outerR.toFixed(4),
        casingR: +C.geology.annulus.casingR.toFixed(4) } },
    band: { gx: bx, gy: band.gy, gw: bw, gh: bh, imageTop: bTop, cssH: band.h, cssW: band.w },
    device: dev,
    camera: { top: cam.top, bottom: cam.bottom, left: +cam.left.toFixed(3), right: +cam.right.toFixed(3), zoom: cam.zoom },
    scale: { worldUnitsH: +worldH.toFixed(3), worldUnitsW: +worldW.toFixed(3),
      pxPerUnitY: +pxPerUnitY.toFixed(3), pxPerUnitX: +pxPerUnitX.toFixed(3) },
    predicted: {
      trueHolePx: +((C.geology.holeDiaMm / 1000) * pxPerUnitX).toFixed(2),
      drawnHolePx: +(2 * C.geology.holeRadius * pxPerUnitX).toFixed(2),
      drawnOverGaugePx: +(2 * C.geology.holeRadiusAt(depth) * pxPerUnitX).toFixed(2),
      exaggeration: +((2 * C.geology.holeRadius) / (C.geology.holeDiaMm / 1000)).toFixed(2),
    },
    bit: bitBox, bitRow, centreX,
    holeRuns, fracInside, fracOutside,
    ruler: { spineX: spine, colCount: rulerCols.length, tickCentres: centres.map((v) => +v.toFixed(1)), gaps },
  };
  function errs0() { return null; }
}, { depth: DEPTH });

out.consoleErrors = errs;
console.log(JSON.stringify(out, null, 2));
writeFileSync('.probe-bore.json', JSON.stringify(out, null, 2));
await b.close();
