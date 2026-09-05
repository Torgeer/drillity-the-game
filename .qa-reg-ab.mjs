/**
 * DID BAND REGISTRATION COST DRAW CALLS?
 *
 *   node .qa-reg-ab.mjs [--methods a,b,c] [--repeats 5] [--port 5178]
 *
 * `registerBands()` in core/renderer.js moves the surface camera's projection
 * window 62.4 px right and 22.8 px down. That adds no geometry and no pass —
 * but it DOES change what the frustum contains, so objects enter on one side
 * as they leave on the other, and frustum culling is a per-object decision
 * that does not have to break even. `tools/shoot.mjs` reports 15 states over
 * the 80-call surface budget; this exists to say whether any of that is mine.
 *
 * The method is the one thing that makes such a question answerable
 * (HANDOFF §9.4, §8C): ONE page load, ONE warm session, and the two
 * configurations INTERLEAVED — A B A B A B — through `__qaRegisterBands()`,
 * so a session that is still warming or a background clamp that arrives
 * halfway through lands on both arms equally instead of on whichever was
 * measured first. Draw calls are read per band off the renderer's own
 * scissored passes, which is the bucket README's budget is written in.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const PORT = flag('port', '5178');
const REPEATS = Number(flag('repeats', '5'));
const METHODS = (flag('methods', 'core,dth,auger,tunnel-jumbo')).split(',');

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
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.routeWebSocket(/.*/, () => {}).catch(() => {});

await page.goto(`http://localhost:${PORT}/?quality=high&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.__qa, { timeout: 30000 });
await page.waitForFunction(() => document.body.classList.contains('booted'), { timeout: 60000 }).catch(() => {});
await sleep(2500);

/* the programs-stable warm gate — a cold frame has not drawn everything yet */
async function warmUp({ minMs = 4000, maxMs = 120000, quietMs = 5000, label = '' } = {}) {
  const t0 = Date.now();
  let lastP = null, stableAt = t0;
  for (;;) {
    const s = await page.evaluate(() => {
      const gl = window.__DRILLITY?.renderer?.gl;
      return gl ? { programs: gl.info.programs ? gl.info.programs.length : null } : null;
    }).catch(() => null);
    if (!s) return { warm: false };
    if (s.programs !== lastP) { lastP = s.programs; stableAt = Date.now(); }
    const el = Date.now() - t0;
    if (el >= minMs && Date.now() - stableAt >= quietMs) {
      console.log(`  warm ${label}: ${s.programs} programs`);
      return { warm: true, programs: s.programs };
    }
    if (el >= maxMs) { console.log(`  ! NOT WARM ${label}`); return { warm: false }; }
    await sleep(400);
  }
}

await page.evaluate(async () => {
  try { await window.__DRILLITY.__qa.startDemoContract({ depth: 12 }); } catch (e) { void e; }
}).catch(() => {});
await sleep(1500);
const sessionWarm = await warmUp({ label: 'session' });

/** Per-band draw calls for the CURRENT registration setting. */
const sample = () => page.evaluate(() => new Promise((res) => {
  const c = window.__DRILLITY;
  const gl = c.renderer.gl;
  const surf = [], sect = [], frame = [];
  let n = 0;
  const orig = gl.render.bind(gl);
  // the renderer draws surface then section into one target; count each
  gl.render = (scene, cam) => {
    const before = gl.info.render.calls;
    orig(scene, cam);
    const d = gl.info.render.calls - before;
    if (scene === c.scene) surf.push(d);
    else if (scene === c.sectionScene) sect.push(d);
  };
  const tick = () => {
    n++;
    frame.push(gl.info.render.calls);
    if (n < 12) requestAnimationFrame(tick);
    else {
      gl.render = orig;
      const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1] ?? null; };
      res({
        surf: med(surf.slice(2)), sect: med(sect.slice(2)), frame: med(frame.slice(2)),
        reg: { ...c.renderer.registration },
      });
    }
  };
  requestAnimationFrame(tick);
}));

const setReg = (on) => page.evaluate((v) => window.__DRILLITY.renderer.__qaRegisterBands(v), on);

const report = { when: new Date().toISOString(), sessionWarm, repeats: REPEATS, methods: {}, errors };
for (const mid of METHODS) {
  await page.evaluate(async (M) => {
    const c = window.__DRILLITY;
    const d = c.data;
    const rg = (d.REGIONS || []).find((r) => d.methodsForRegion
      && d.methodsForRegion(r.id, d.MAX_LEVEL || 60).some((m) => m.id === M));
    let k = null;
    try { k = await c.__qa.startDemoContract({ method: M, region: rg && rg.id, depth: 8 }); }
    catch (e) { k = c.state.contract; }
    try { c.sim.debug.setDepth(Math.max(0.5, ((k && k.targetDepth) || 10) * 0.35)); } catch (e) { void e; }
  }, mid);
  await sleep(2600);
  await warmUp({ label: mid, minMs: 1500, quietMs: 2500, maxMs: 40000 });

  const off = [], on = [];
  for (let i = 0; i < REPEATS; i++) {          // INTERLEAVED, never blocked
    await setReg(false); await sleep(260); off.push(await sample());
    await setReg(true);  await sleep(260); on.push(await sample());
  }
  await setReg(true);

  const med = (a, k) => { const s = a.map((q) => q[k]).sort((x, y) => x - y); return s[s.length >> 1]; };
  const spread = (a, k) => Math.max(...a.map((q) => q[k])) - Math.min(...a.map((q) => q[k]));
  const row = {
    surfOff: med(off, 'surf'), surfOn: med(on, 'surf'),
    sectOff: med(off, 'sect'), sectOn: med(on, 'sect'),
    frameOff: med(off, 'frame'), frameOn: med(on, 'frame'),
    surfSpreadOff: spread(off, 'surf'), surfSpreadOn: spread(on, 'surf'),
    shift: on[on.length - 1].reg,
  };
  row.dSurf = row.surfOn - row.surfOff;
  row.dSect = row.sectOn - row.sectOff;
  report.methods[mid] = row;

  console.log(`${mid.padEnd(14)} surface ${row.surfOff} -> ${row.surfOn}  (${row.dSurf >= 0 ? '+' : ''}${row.dSurf})`
    + `   section ${row.sectOff} -> ${row.sectOn}  (${row.dSect >= 0 ? '+' : ''}${row.dSect})`
    + `   repeat spread ${row.surfSpreadOff}/${row.surfSpreadOn}`);
  writeFileSync('shots/reg-ab.json', JSON.stringify(report, null, 2));
}

const all = Object.values(report.methods);
const worst = Math.max(...all.map((r) => r.dSurf));
const noise = Math.max(...all.map((r) => Math.max(r.surfSpreadOff, r.surfSpreadOn)));
console.log(`\nworst surface delta from registration: ${worst >= 0 ? '+' : ''}${worst} calls`);
console.log(`largest repeat-to-repeat spread within one arm: ${noise} calls`);
console.log(worst > noise
  ? 'REGISTRATION IS CHARGING DRAW CALLS — the delta is outside the instrument noise.'
  : 'Registration is free at this instrument\'s resolution: every delta is inside the repeat spread.');
console.log('\nwrote shots/reg-ab.json');
if (errors.length) console.log('console errors:', errors.slice(0, 5));
await browser.close();
