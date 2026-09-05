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
 *   0. build is clean      no console error and no page error, ANYWHERE. This
 *                          one comes first because it decides whether the rest
 *                          mean anything: a module that threw never built its
 *                          elements, and elements that do not exist cannot
 *                          overlap. A run that scored them as absent is
 *                          reporting a pass it did not earn.
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

const b = await chromium.launch({ args: ['--mute-audio'], headless: false, channel: 'chrome' });
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
    const seen = [...new Set(S.flatMap((s) => s.targetList))].sort();
    const clipped = [...new Set(S.flatMap((s) => s.clipped))];
    const med = S[Math.floor(S.length / 2)];

    json.cases[m] = {
      painted: { max: Math.max(...S.map((s) => s.painted)), med: med.painted },
      overlaps: maxOv, overlapList: ovDetails,
      onBand3D: onBand, smallTargets: small, targetsSeen: seen, clipped,
      split: med.split, bands: med.bands, dom: med.dom,
    };

    say(`\n${m}`);
    say(`  painted     max ${json.cases[m].painted.max} / med ${med.painted}   (enumerated from *, no allowlist)`);
    say(`  OVERLAPS    ${maxOv}${maxOv ? '  <-- GATE FAIL' : '  ok'}`);
    for (const d of ovDetails.slice(0, 14)) say(`                ${d}`);
    say(`  ON THE 3D   ${onBand.length}${onBand.length ? '  <-- GATE FAIL' : '  ok'}`);
    for (const d of onBand.slice(0, 8)) say(`                ${d}`);
    say(`  targets<44  ${small.length}${small.length ? '  <-- GATE FAIL' : '  ok'}  ${small.join(', ')}`);
    /* Named, so a pass earned by a control simply not being on screen is
       visible instead of silent. Hit boxes, from elementFromPoint. */
    say(`  targets     ${seen.length ? seen.join(', ') : 'NONE ON SCREEN — the 44px gate tested nothing'}`);
    say(`  clipped     ${clipped.length}  ${clipped.slice(0, 4).join(' | ')}`);
    say(`  split       surface ${med.split?.surfPct} / section ${med.split?.sectPct}   (3D = ${med.split?.stagePct}% of stage)`);
    say(`  chrome      .sstrip ${med.dom.stripH}px  .sitedock ${med.dom.dockH}px  ctx.hud ${JSON.stringify(med.dom.hud)}`);
    await p.screenshot({ path: resolve(HERE, `${TAG}-${m}.png`) });
  }
}

/* ═══ 2. THE REPEAT-NAVIGATION GROWTH TEST ═══════════════════════════════
   Ordinary navigation only — `ui.show()` through screens a player can
   actually reach. Nothing here is a QA-only path. If the dock height or the
   node count moves between visit 1 and visit 5, the screen is leaking.

   ── WHY THERE IS AN UNMEASURED WARM-UP LAP ──────────────────────────────
   `ui/shell.js instantiate()` builds a screen the first time it is shown and
   then KEEPS it — in the `screens` Map and as a hidden node under `.screens`.
   That cache is deliberate (it is what makes the back transition instant),
   and it is not a leak.

   Measured cold, though, visit 1 saw a document with no garage in it and
   visit 2 saw one with a garage in it, so the run reported "document nodes
   163 -> 811 (+648)" and failed a screen that was not growing at all. Left
   alone, a false positive that size is where a real leak goes to hide.

   The wrong repair is an allowance in the gate — that is how an instrument
   learns to excuse things, and this project has already paid three rounds for
   instruments that excuse things. The right repair is to make visit 1 and
   visit 5 comparable: walk the whole route ONCE without measuring, so every
   screen it touches is already built. After that lap the gate is absolute —
   any movement in any column, by one node or one pixel, is a leak. */
say('\n\n=== REPEAT NAVIGATION: five ordinary visits to the site screen ===');
say('  one unmeasured warm-up lap first, so every screen on the route is already');
say('  built; after it, ANY movement in ANY column below is a leak.');
for (const step of ['site', 'menu', 'garage', 'menu']) {
  if (step === 'site') await p.evaluate(GOTO_SITE, 'dth');
  else await p.evaluate((s) => window.__DRILLITY.ui.show(s), step);
  await p.waitForTimeout(700);
}
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

/* Every visit is compared against the first, not just the last — a counter
   that climbs and then falls back is still a leak, and last-vs-first cannot
   see it. `.screen` nodes are additionally held to a hard ceiling: the shell
   registers 8 scenes, so a 9th node means duplicates, not caching. */
const SCENE_COUNT = 8;
const g0 = nav[0];
grew = [];
const drift = (key, unit) => {
  const bad = nav.filter((n) => n[key] !== g0[key]);
  if (!bad.length) return;
  grew.push(`${key}  ${nav.map((n) => n[key]).join(' -> ')}${unit ? ' ' + unit : ''}`);
};
drift('dockH', 'px'); drift('stripH', 'px'); drift('dockCount', '');
drift('liveNodes', ''); drift('docNodes', ''); drift('screens', '');
const overScenes = nav.filter((n) => n.screens > SCENE_COUNT);
if (overScenes.length) {
  grew.push(`.screen nodes ${Math.max(...nav.map((n) => n.screens))} > ${SCENE_COUNT} registered scenes — duplicate nodes`);
}
say(`\n  DOCK HEIGHT ${nav.map((n) => n.dockH + 'px').join('  ->  ')}`);
say(`  GROWTH      ${grew.length ? grew.join('\n              ') + '   <-- GATE FAIL' : 'none — dock, chrome and node counts identical across all five visits   ok'}`);

/* ═══ 3. VERDICT ═════════════════════════════════════════════════════════ */
const anyOv = Object.values(json.cases).reduce((a, v) => a + v.overlaps, 0);
const anyBand = Object.values(json.cases).reduce((a, v) => a + v.onBand3D.length, 0);
const anySmall = [...new Set(Object.values(json.cases).flatMap((v) => v.smallTargets))];
const uniqErrs = [...new Set(errs)];
json.errors = uniqErrs;
say('\n=== GATES ===');
say(`  build is clean ........... ${uniqErrs.length === 0 ? 'PASS' : 'FAIL (' + uniqErrs.length + ')'}`);
say(`  overlaps (enumerated) .... ${anyOv === 0 ? 'PASS' : 'FAIL (' + anyOv + ')'}`);
say(`  nothing over the 3D ...... ${anyBand === 0 ? 'PASS' : 'FAIL (' + anyBand + ')'}`);
say(`  touch targets >= 44px .... ${anySmall.length === 0 ? 'PASS' : 'FAIL (' + anySmall.join(', ') + ')'}`);
say(`  no navigation growth ..... ${grew.length === 0 ? 'PASS' : 'FAIL'}`);

/* ── A THROWN MODULE INVALIDATES EVERY OTHER NUMBER ABOVE ─────────────────
   This used to be a footnote printed under the verdict, and that is how a run
   with `ReferenceError: boreExag is not defined` killing world/geology.js
   still printed "overlaps PASS" on all five methods: the section never built,
   so most of the dock had nothing to draw and nothing to overlap. An element
   that was never created cannot be measured, and an instrument that scores it
   as absent is reporting a pass it did not earn.

   So a console error is a gate of its own, and it is stated FIRST and LAST. */
if (uniqErrs.length) {
  say('\n!!  MEASUREMENT NOT VALID  !!');
  say('    A module threw during this run. Elements it owns were never built, so');
  say('    every count above is a floor, not a measurement. Fix these, then re-run:');
  for (const e of uniqErrs.slice(0, 10)) say('      ' + e.replace(/\n\s*/g, ' ').slice(0, 150));
} else {
  say('\nno console errors — the counts above are measurements, not floors');
}

writeFileSync(resolve(HERE, `${TAG}-report.txt`), out.join('\n'), 'utf8');
if (AS_JSON) writeFileSync(resolve(HERE, `${TAG}-report.json`), JSON.stringify(json, null, 2), 'utf8');
await b.close();
