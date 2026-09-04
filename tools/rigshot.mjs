/**
 * Close-up machine portraits — one tight crop per rig, for judging silhouette
 * and detail density rather than composition.
 *
 * tools/shoot.mjs frames the whole site, which is right for a review round and
 * useless for asking "does this mast read as a structure": the machine is 300
 * px tall in a 780 px frame. This projects the rig's own bounding box into
 * screen space and clips the capture to it, so the reviewer sees the metal.
 *
 *   node tools/rigshot.mjs crawler-lite tunnel-jumbo      # named rigs
 *   node tools/rigshot.mjs --tag mq2 --all
 *   node tools/rigshot.mjs --angle 0.9 crawler-lite       # orbit phase, turns
 *
 * HEADED ONLY — headless Chrome cannot bind the GPU on this machine.
 */
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'shots');
mkdirSync(OUT, { recursive: true });
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const has = (n) => argv.includes('--' + n);
const TAG = flag('tag', 'rig');
const ANGLE = parseFloat(flag('angle', '0.12'));
const WAITS = (flag('waits', '1600') || '1600').split(',').map(Number);
const names = argv.filter((a) => !a.startsWith('--') && a !== TAG && a !== String(ANGLE));

const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
const page = await c.newPage();
await page.goto('http://localhost:5178/?quality=high&shot', { waitUntil: 'load' });
await page.waitForFunction(() => !!(window.__DRILLITY && window.__DRILLITY.renderer), null, { timeout: 60000 });
await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 2500));

const all = await page.evaluate(() => (window.__DRILLITY.rig.listRigs ? window.__DRILLITY.rig.listRigs() : []));
const list = names.length && !has('all') ? names : all;
console.log('rigs: ' + list.join(', '));

for (const id of list) {
  for (const wait of WAITS) {
  const info = await page.evaluate(async ([R, ang, WAIT]) => {
    const C = window.__DRILLITY, T = C.THREE, d = C.data;
    // The rig's OWN trade, from data.js — not a default. A portrait that put
    // an underground jumbo on a surface auger job photographed the machine on
    // a quarry pad with pine trees behind it, which is a domain-truth failure
    // manufactured by the harness rather than found by it.
    const row = (d.RIGS || []).find((x) => x.id === R)
      || (C.rig.rigSpec ? C.rig.rigSpec(R) : null);
    const methodId = (row && row.methods && row.methods[0]) || 'auger';
    try {
      const regions = (d.REGIONS || []).filter((rg) => d.methodsForRegion
        && d.methodsForRegion(rg.id, d.MAX_LEVEL || 60).some((m) => m.id === methodId));
      await C.__qa.startDemoContract({ method: methodId, region: regions[0] ? regions[0].id : undefined, depth: 6 });
    } catch (e) { /* portrait still works without a job */ }
    C.state.garage.rigId = R;
    C.rig.setRig(R);
    C.rig.setMethod(methodId);
    C.ui.show('site');
    C.renderer.setCameraMode('orbit');
    await new Promise((r) => setTimeout(r, WAIT));
    // project the machine's bounds into screen space
    const root = C.rig.group.getObjectByName('rig:' + R) || C.rig.group;
    const box = new T.Box3().setFromObject(root);
    const cam = C.renderer.camera;
    cam.updateMatrixWorld(true);
    const st = C.renderer.stage || { w: 390, h: 844, dpr: 1 };
    const band = (C.renderer.bands && C.renderer.bands.surface) || null;
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    const v = new T.Vector3();
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
      v.project(cam);
      const sx = (v.x * 0.5 + 0.5) * (band ? band.w : st.w);
      const sy = (1 - (v.y * 0.5 + 0.5)) * (band ? band.h : st.h) + (band ? band.y : 0);
      minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
    }
    return { minX, minY, maxX, maxY, methodId, dpr: st.dpr || 1, stage: st, band: band };
  }, [id, ANGLE, wait]);

  const pad = 14;
  let x = Math.max(0, Math.floor(info.minX - pad));
  let y = Math.max(0, Math.floor(info.minY - pad));
  let w = Math.min(390 - x, Math.ceil(info.maxX - info.minX + pad * 2));
  let h = Math.min(844 - y, Math.ceil(info.maxY - info.minY + pad * 2));
  if (!(w > 8 && h > 8)) { x = 0; y = 90; w = 390; h = 470; }
  const file = `${OUT}/${TAG}-${id}-w${wait}.png`;
  await page.screenshot({ path: file, clip: { x, y, width: w, height: h } });
  console.log(`${id.padEnd(18)} ${info.methodId.padEnd(14)} w=${wait} clip ${w}x${h} @${x},${y}`);
  }
}
await b.close();
