/**
 * HUD measurement harness — ENUMERATING, not allowlisted.
 *
 * ── WHY THIS FILE WAS REWRITTEN ────────────────────────────────────────────
 * The previous version measured a hand-written allowlist of ~19 class names,
 * so anything it had not been told about was invisible to it. It reported
 * "0 overlaps" on a screen that had eight. A measurement instrument that can
 * only see what it was told to look for is worse than no instrument, because
 * it produces confident false negatives and everyone stops looking.
 *
 * The instrument itself now lives in `./enumerate.js` — read the header there
 * for what counts as a painted element and what counts as an overlap. This
 * file is only the driver: it boots the game in a real headed Chromium at
 * phone size, puts it into each state, samples the instrument over time, and
 * prints.
 *
 *   node .hudqa/measure.mjs [tag] [port]
 *   node .hudqa/measure.mjs before 5178 --only nav      # just the growth test
 *   node .hudqa/measure.mjs after  5178 --json          # machine-readable too
 *
 * HEADED IS NOT OPTIONAL. Headless Chrome cannot bind the discrete GPU on this
 * machine; it falls back to SwiftShader, the scene never reaches a steady
 * state, and every number it produces is a lie.
 *
 * THE GATES, in the order they are printed:
 *   1. overlaps            must be 0, enumerated from `*`
 *   2. elements on the 3D  must be 0
 *   3. touch targets       every interactive target >= 44 x 44 css px
 *   4. navigation growth   .sitedock height and node counts must not move
 *                          across repeated ordinary visits to the site screen
 */
import { chromium, devices } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENUMERATE } from './enumerate.js';

const HERE = dirname(fileURLToPath(import.meta.url));
mkdirSync(HERE, { recursive: true });

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const flag = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const TAG = positional[0] || 'run';
const PORT = positional[1] || '5178';
const ONLY = (flag('only') || '').toLowerCase();
const AS_JSON = argv.includes('--json');

const CASES = ['rockbolt', 'driven-pile', 'rc', 'dth', 'oil-rotary'];

const VITE_STUB = `export const createHotContext = () => ({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},get data(){return{}}});
export function updateStyle(id,c){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=c;}
export function removeStyle(id){const s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(s)s.remove();}
export function injectQuery(u){return u;} export class ErrorOverlay extends HTMLElement{}`;

const measure = (p, opts = {}) => p.evaluate(`(${ENUMERATE})(${JSON.stringify(opts)})`);

/** Put the game on the site screen running `methodId`, the ordinary way. */
const GOTO_SITE = (mm) => {
  const c = window.__DRILLITY;
  try { c.sim.abortHole('qa'); } catch (e) { /* not running */ }
  c.state.player.level = 60;
  const k = {
    id: 'qa-' + mm, title: 'QA', client: 'QA', regionId: 'nordic', methodId: mm,
    applicationId: 'site-investigation', targetDepth: 100, holeDia: 152, holes: 1,
    payout: 9000, deadlineHours: 24, difficulty: 2, requiredCerts: [], seed: 7,
  };
  c.state.contract = k; c.state.world.regionId = 'nordic';
  try {
    c.geology?.generateProfile?.({
      regionId: 'nordic', applicationId: 'site-investigation',
      targetDepth: 100, seed: 1337, difficulty: 2, methodId: mm,
    });
  } catch (e) { /* geology optional */ }
  try { c.rig?.setMethod?.(mm); } catch (e) { /* rig optional */ }
  c.ui.show('site', { contract: k });
  try { c.sim.startHole?.(k); } catch (e) { /* already running */ }
  c.sim.setInput('feed', 0.55); c.sim.setInput('rotation', 0.6); c.sim.setInput('flush', 0.6);
};

const out = [];
const say = (s = '') => { out.push(s); console.log(s); };

const b = await chromium.launch({ headless: false, channel: 'chrome' });
const c = await b.newContext({
  ...devices['iPhone 13 Pro'],
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
await c.route('**/@vite/client', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: VITE_STUB }));
const p = await c.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 180)); });
p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 180)));
await p.goto(`http://localhost:${PORT}/?quality=low&shot`, { waitUntil: 'load' });
await p.waitForFunction(() => window.__DRILLITY?.ui?.show && window.__DRILLITY?.sim, null, { timeout: 60000 });
await p.waitForTimeout(2200);

const json = { tag: TAG, cases: {}, nav: null };
let grew = [];

/* ═══ 1. PER-METHOD MEASUREMENT ══════════════════════════════════════════ */
if (ONLY !== 'nav') {
  for (const m of CASES) {
    await p.evaluate(GOTO_SITE, m);
    const S = [];
    for (let t = 0; t < 12000; t += 400) { await p.waitForTimeout(400); S.push(await measure(p)); }

    const maxOv = Math.max(...S.map((s) => s.overlaps));
    const ovDetails = [...new Set(S.flatMap((s) => s.overlapList))];
    const onBand = [...new Set(S.flatMap((s) => s.onBand3D))];
    const small = [...new Set(S.flatMap((s) => s.smallTargets))];
    const clipped = [...new Set(S.flatMap((s) => s.clipped))];
    const med = S[Math.floor(S.length / 2)];

    json.cases[m] = {
      painted: { max: Math.max(...S.map((s) => s.painted)), med: med.painted },
      overlaps: maxOv, overlapList: ovDetails,
      onBand3D: onBand, smallTargets: small, clipped,
      split: med.split, bands: med.bands, dom: med.dom,
    };

    say(`\n${m}`);
    say(`  painted     max ${json.cases[m].painted.max} / med ${med.painted}   (enumerated from *, no allowlist)`);
    say(`  OVERLAPS    ${maxOv}${maxOv ? '  <-- GATE FAIL' : '  ok'}`);
    for (const d of ovDetails.slice(0, 14)) say(`                ${d}`);
    say(`  ON THE 3D   ${onBand.length}${onBand.length ? '  <-- GATE FAIL' : '  ok'}`);
    for (const d of onBand.slice(0, 8)) say(`                ${d}`);
    say(`  targets<44  ${small.length}${small.length ? '  <-- GATE FAIL' : '  ok'}  ${small.join(', ')}`);
    say(`  clipped     ${clipped.length}  ${clipped.slice(0, 4).join(' | ')}`);
    say(`  split       surface ${med.split?.surfPct} / section ${med.split?.sectPct}   (3D = ${med.split?.stagePct}% of stage)`);
    say(`  chrome      .sstrip ${med.dom.stripH}px  .sitedock ${med.dom.dockH}px  ctx.hud ${JSON.stringify(med.dom.hud)}`);
    await p.screenshot({ path: resolve(HERE, `${TAG}-${m}.png`) });
  }
}

/* ═══ 2. THE REPEAT-NAVIGATION GROWTH TEST ═══════════════════════════════
   Ordinary navigation only — `ui.show()` through screens a player can
   actually reach. Nothing here is a QA-only path. If the dock height or the
   node count moves between visit 1 and visit 5, the screen is leaking. */
say('\n\n=== REPEAT NAVIGATION: five ordinary visits to the site screen ===');
say('visit |  .sitedock |  .sstrip |  .screen nodes |  live nodes |  doc nodes |  .sitedock count |  ctx.hud');
const nav = [];
for (let visit = 1; visit <= 5; visit++) {
  await p.evaluate(GOTO_SITE, 'dth');
  await p.waitForTimeout(1500);
  const s = await measure(p);
  nav.push({ visit, ...s.dom, overlaps: s.overlaps, painted: s.painted });
  say(`  ${visit}   |   ${String(s.dom.dockH).padStart(5)} px |  ${String(s.dom.stripH).padStart(4)} px |`
    + `       ${String(s.dom.screens).padStart(3)}      |    ${String(s.dom.liveNodes).padStart(5)}   |`
    + `   ${String(s.dom.docNodes).padStart(5)}   |        ${String(s.dom.dockCount).padStart(2)}        | ${JSON.stringify(s.dom.hud)}`);
  // Leave the way a player leaves: back to the menu, out to the garage, back.
  await p.evaluate(() => window.__DRILLITY.ui.show('menu'));
  await p.waitForTimeout(700);
  await p.evaluate(() => window.__DRILLITY.ui.show('garage'));
  await p.waitForTimeout(700);
  await p.evaluate(() => window.__DRILLITY.ui.show('menu'));
  await p.waitForTimeout(700);
}
json.nav = nav;

const g0 = nav[0], g4 = nav[nav.length - 1];
grew = [];
if (g4.dockH !== g0.dockH) grew.push(`.sitedock ${g0.dockH} -> ${g4.dockH} px (+${g4.dockH - g0.dockH})`);
if (g4.stripH !== g0.stripH) grew.push(`.sstrip ${g0.stripH} -> ${g4.stripH} px`);
if (g4.dockCount !== g0.dockCount) grew.push(`.sitedock count ${g0.dockCount} -> ${g4.dockCount}`);
if (g4.liveNodes !== g0.liveNodes) grew.push(`live nodes ${g0.liveNodes} -> ${g4.liveNodes}`);
if (g4.docNodes > g0.docNodes) grew.push(`document nodes ${g0.docNodes} -> ${g4.docNodes} (+${g4.docNodes - g0.docNodes})`);
say(`\n  GROWTH      ${grew.length ? grew.join('\n              ') + '   <-- GATE FAIL' : 'none — dock, chrome and node counts are stable   ok'}`);

/* ═══ 3. VERDICT ═════════════════════════════════════════════════════════ */
const anyOv = Object.values(json.cases).reduce((a, v) => a + v.overlaps, 0);
const anyBand = Object.values(json.cases).reduce((a, v) => a + v.onBand3D.length, 0);
const anySmall = [...new Set(Object.values(json.cases).flatMap((v) => v.smallTargets))];
say('\n=== GATES ===');
say(`  overlaps (enumerated) .... ${anyOv === 0 ? 'PASS' : 'FAIL (' + anyOv + ')'}`);
say(`  nothing over the 3D ...... ${anyBand === 0 ? 'PASS' : 'FAIL (' + anyBand + ')'}`);
say(`  touch targets >= 44px .... ${anySmall.length === 0 ? 'PASS' : 'FAIL (' + anySmall.join(', ') + ')'}`);
say(`  no navigation growth ..... ${grew.length === 0 ? 'PASS' : 'FAIL'}`);
say(errs.length ? '\nconsole errors:\n' + [...new Set(errs)].slice(0, 10).join('\n') : '\nno console errors');

writeFileSync(resolve(HERE, `${TAG}-report.txt`), out.join('\n'), 'utf8');
if (AS_JSON) writeFileSync(resolve(HERE, `${TAG}-report.json`), JSON.stringify(json, null, 2), 'utf8');
await b.close();
