#!/usr/bin/env node
/**
 * checkreach — can the player's THUMB get to the controls?
 *
 *   node tools/checkreach.mjs                 # needs `npm run dev` on 5178
 *   node tools/checkreach.mjs 5178 --json
 *
 * ── WHY SIZE IS ONLY HALF THE QUESTION ─────────────────────────────────────
 * `.hudqa/measure.mjs` already gates on 44 x 44 css px and on overlap, and
 * both pass. Neither says anything about WHERE a control is, and on a portrait
 * phone that is the other half of whether it can be used at all: a perfectly
 * sized 44 px button in the top-left corner of a 390 x 844 screen cannot be
 * pressed one-handed without shifting grip.
 *
 * This game is played standing up, one-handed, by somebody whose other hand is
 * on something else. Steven Hoober's observational study of over 1,300 people
 * in the wild found 49 % using a one-handed grip, 36 % cradling and jabbing
 * with the other hand, and 15 % two-handed — and that thumbs drive 75 % of all
 * phone interactions. Two-thirds of one-handed grips are the right hand, which
 * makes left-handed players a third of the one-handed population, not a
 * rounding error: everything here is measured for BOTH hands.
 *   Hoober, "How We Hold Our Gadgets", A List Apart, 2013.
 *   https://alistapart.com/article/how-we-hold-our-gadgets/
 *
 * ── THE MODEL, AND WHERE IT IS UNCERTAIN ───────────────────────────────────
 * The thumb sweeps an ARC about the joint at its base. It is not a horizontal
 * band across the bottom of the screen, which is the popular simplification
 * and is wrong in a way that matters here: it says the two bottom corners are
 * equally easy when in fact the corner UNDER the thumb is one of the hardest
 * places on the screen, because the thumb cannot fold that tightly. Hoober's
 * own summary is that "only a third of the screen is truly effortless
 * territory: at the bottom, ON THE SIDE OPPOSITE THE THUMB" — so the easy
 * region is an annulus sector, with an inner radius as well as an outer one.
 *
 * Bergstrom-Lehtovirta & Oulasvirta (CHI 2014, "Modeling the functional area
 * of the thumb on mobile touchscreen surfaces", doi:10.1145/2556288.2557354)
 * fit a quadratic functional area from surface size, hand size and the index
 * finger's position on the back of the device, validated against 20 people's
 * thumb trajectories. The honest reading of that is that the exact radii
 * depend on the hand and cannot be looked up. So the radii below are NOT
 * invented numbers: they are SOLVED, by bisection, so that the easy region
 * covers a third of the screen and easy-plus-stretch covers two thirds — the
 * proportions Hoober reports. Change the viewport and they re-solve.
 *
 * What is assumed rather than sourced, and is printed as such in the output:
 *   - the pivot sits outside the screen, below and beside the bottom corner,
 *     because the hand wraps the bezel. PIVOT_OUT_MM / PIVOT_DOWN_MM.
 *   - the inner radius, the fold the thumb cannot make. R_IN_MM.
 * All three are millimetres and converted, so they survive a change of device.
 * If a real measurement of this game's own players ever exists, those three
 * constants are the only things to replace.
 *
 * ── THE GATE ───────────────────────────────────────────────────────────────
 * Controls the player touches WHILE DRILLING must be reachable; controls
 * touched between jobs need not be. The site dock is the former and is gated.
 * Everything else is reported, not gated — moving the shop out of the thumb
 * arc is a legitimate design choice, leaving the feed control there is not.
 *
 * Exits 0 clean, 1 on any drilling control outside the arc for either hand.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';
import { ensureServer } from './devserver.mjs';

const argv = process.argv.slice(2);
const PORT = argv.find((a) => /^\d+$/.test(a)) || '5178';
const WANT_JSON = argv.includes('--json');

/* The same five methods `.hudqa/measure.mjs` walks, so the two reports are
   about the same screens. Each puts a different dock on the site screen. */
const CASES = ['rockbolt', 'driven-pile', 'rc', 'dth', 'oil-rotary'];

/* iPhone 13 Pro: 390 x 844 css px across a 64.0 x 138.6 mm display. Every
   millimetre constant below goes through this, so the model is about a HAND
   and a PHYSICAL SCREEN rather than about a number of pixels. */
const W = 390, H = 844;
const PX_PER_MM = W / 64.0;

const PIVOT_OUT_MM = 10;    // assumed: how far outside the screen edge the joint sits
const PIVOT_DOWN_MM = 16;   // assumed: how far below the bottom edge
const R_IN_MM = 34;         // assumed: the fold the thumb cannot make

const VITE_STUB = [
  'export const createHotContext = () => ({',
  '  on(){}, off(){}, send(){}, accept(){}, acceptExports(){}, dispose(){}, prune(){}, decline(){}, invalidate(){},',
  '  get data(){ return {}; },',
  '});',
  'export function updateStyle(id, content) {',
  '  let s = document.querySelector(\'style[data-vite-dev-id="\' + id + \'"]\');',
  '  if (!s) { s = document.createElement("style"); s.setAttribute("data-vite-dev-id", id); document.head.appendChild(s); }',
  '  s.textContent = content;',
  '}',
  'export function removeStyle(){}',
  'export function injectQuery(u){ return u; }',
  'export class ErrorOverlay extends HTMLElement {}',
].join('\n');

/* ── The arc, solved rather than asserted ─────────────────────────────────── */
const pivot = (hand) => ({
  x: hand === 'right' ? W + PIVOT_OUT_MM * PX_PER_MM : -PIVOT_OUT_MM * PX_PER_MM,
  y: H + PIVOT_DOWN_MM * PX_PER_MM,
});
const R_IN = R_IN_MM * PX_PER_MM;

/** Fraction of the screen inside the annulus [R_IN, r] about `p`, by sampling. */
function coverage(p, r) {
  let hit = 0;
  let n = 0;
  for (let y = 2; y < H; y += 4) {
    for (let x = 2; x < W; x += 4) {
      n++;
      const d = Math.hypot(x - p.x, y - p.y);
      if (d >= R_IN && d <= r) hit++;
    }
  }
  return hit / n;
}

/** The radius at which the annulus covers `frac` of the screen. */
function solveRadius(p, frac) {
  let lo = R_IN;
  let hi = Math.hypot(W + Math.abs(p.x), H + p.y);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (coverage(p, mid) < frac) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

const ARC = {};
for (const hand of ['right', 'left']) {
  const p = pivot(hand);
  ARC[hand] = { p, easy: solveRadius(p, 1 / 3), stretch: solveRadius(p, 2 / 3) };
}

/** 'easy' | 'stretch' | 'hard' for one point and one hand. */
function zoneOf(x, y, hand) {
  const a = ARC[hand];
  const d = Math.hypot(x - a.p.x, y - a.p.y);
  if (d < R_IN) return 'hard';        // folded under the thumb's own base
  if (d <= a.easy) return 'easy';
  if (d <= a.stretch) return 'stretch';
  return 'hard';
}

/* ── In-page: every interactive target, with its box ──────────────────────
   The selector and the disabled/pointer-events rules are taken verbatim from
   `.hudqa/enumerate.js`, deliberately: two harnesses that disagree about what
   an interactive target IS would be reporting two different screens. */
const COLLECT = () => {
  /* THE LIVE SCREEN, resolved the way `.hudqa/enumerate.js` resolves it.
     `document.querySelector('.screen')` — which this file used at first —
     returns the FIRST match in the document, and that is the retained, hidden
     BOOT screen at 0 x 0. Every query then ran against an empty subtree and
     found nothing, which this file first reported as a pass. */
  const screenNodes = [...document.querySelectorAll('.screens > .screen')];
  const live = screenNodes.find((n) => !n.hidden
    && !n.classList.contains('is-leaving')
    && !n.classList.contains('is-leaving--back')) || document.body;
  const TAP = 'button, a[href], input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="slider"], [onclick], [data-tap]';
  const out = [];
  for (const el of live.querySelectorAll(TAP)) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (cs.pointerEvents === 'none' || el.disabled) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const cls = (typeof el.className === 'string' && el.className.trim())
      ? el.className.trim().split(/\s+/)[0]
      : el.tagName.toLowerCase();
    out.push({
      cls,
      x: r.x, y: r.y, w: r.width, h: r.height,
      // Is it in the dock the player works from while the hole is running?
      drilling: !!el.closest('.sitedock'),
    });
  }
  return out;
};

const GOTO_SITE = (mm) => {
  const c = window.__DRILLITY;
  try { c.sim.abortHole('qa'); } catch (e) { /* not running */ }
  c.state.player.level = 60;
  const k = {
    id: 'qa-' + mm, title: 'QA', client: 'QA', regionId: 'nordic', methodId: mm,
    applicationId: 'site-investigation', targetDepth: 100, holeDia: 152, holes: 1,
    payout: 9000, deadlineHours: 24, difficulty: 2, requiredCerts: [], seed: 7,
  };
  c.state.contract = k;
  c.state.world.regionId = 'nordic';
  try {
    c.geology?.generateProfile?.({
      regionId: 'nordic', applicationId: 'site-investigation',
      targetDepth: 100, seed: 1337, difficulty: 2, methodId: mm,
    });
  } catch (e) { /* geology optional */ }
  try { c.rig?.setMethod?.(mm); } catch (e) { /* rig optional */ }
  c.ui.show('site', { contract: k });
  try { c.sim.startHole?.(k); } catch (e) { /* already running */ }
  c.sim.setInput('feed', 0.55);
  c.sim.setInput('rotation', 0.6);
  c.sim.setInput('flush', 0.6);
};

/* ── Run ──────────────────────────────────────────────────────────────────── */
const say = (s = '') => console.log(s);
/* ── THE GATE PROVIDES ITS OWN SUBJECT ──────────────────────────────────────
   This file used to exit 2 with "start the dev server first" whenever the port
   did not answer, which meant it could not be wired into `npm run check` — and
   a gate nobody runs is the empty-set problem one level up. It now measures a
   dev server that is already up, or starts one for the run and stops it after.
   See ./devserver.mjs. */
const SERVER = await ensureServer(PORT, say);
const b = await chromium.launch({ args: ['--mute-audio'], headless: false, channel: 'chrome' });
const ctx = await b.newContext({
  ...devices['iPhone 13 Pro'],
  viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
await ctx.route('**/@vite/client', (r) => r.fulfill({
  status: 200, contentType: 'application/javascript', body: VITE_STUB,
}));
const p = await ctx.newPage();
/* Reachability and readiness are separate questions, in that order. Every
   failure of the single 20 s `goto` this replaced printed "start the dev
   server first", so a running-but-loaded server was reported as absent —
   the same confident-false-negative shape this file's own header warns
   about, aimed at the operator instead of at the layout. `domcontentloaded`,
   not `load`: `load` waits on every module, font and texture, which is not
   what "the page exists" means here. */
const ORIGIN = SERVER.origin;
try {
  await p.request.fetch(ORIGIN, { method: 'HEAD', timeout: 120000 });
} catch (e) {
  SERVER.stop();
  console.error(`Cannot reach ${ORIGIN} — start the dev server first:\n\n    npm run dev\n\n  (${e.message.split('\n')[0]})`);
  await b.close();
  process.exit(2);
}
await p.goto(`${ORIGIN}/?quality=low&shot`, { waitUntil: 'domcontentloaded', timeout: 180000 });
await p.waitForFunction(() => window.__DRILLITY?.ui?.show && window.__DRILLITY?.sim, null, { timeout: 240000 });

/* THE BOOT SCREEN IS NOT A SPLASH, IT IS A SHADER COMPILE. Measured here at
   27.5 s on this machine, and the project has seen 60-100 s. A fixed
   `waitForTimeout` — which is what every other probe in this tree uses — was
   sampling the boot screen and reporting zero controls, and this file called
   that a PASS. Wait for boot to actually leave instead. */
const bootT0 = Date.now();
await p.waitForFunction(() => !!document.querySelector('.screens > *:not(.boot)'),
  null, { timeout: 240000 });
say(`  boot cleared after ${((Date.now() - bootT0) / 1000).toFixed(1)} s`);
await p.waitForTimeout(1200);

say('THUMB REACH — 390 x 844 css px, both hands');
say(`  pivot        ${PIVOT_OUT_MM} mm outside the edge, ${PIVOT_DOWN_MM} mm below it   (assumed)`);
say(`  inner radius ${R_IN_MM} mm = ${R_IN.toFixed(0)} px                       (assumed)`);
for (const hand of ['right', 'left']) {
  say(`  ${hand.padEnd(5)}        easy <= ${ARC[hand].easy.toFixed(0)} px, stretch <= ${ARC[hand].stretch.toFixed(0)} px`
    + '   (solved for 1/3 and 2/3 of the screen)');
}

const json = { model: { W, H, PX_PER_MM, PIVOT_OUT_MM, PIVOT_DOWN_MM, R_IN_MM, arc: ARC }, cases: {} };
const fails = [];

for (const m of CASES) {
  await p.evaluate(GOTO_SITE, m);

  /* SAMPLE, DO NOT SNAPSHOT. The site screen keeps the class `is-entering`
     indefinitely — it never clears, so waiting on it times out — and while the
     enter transition is running the dock measures 682 px against its settled
     227 px, with the controls not yet laid out. A single shot after a fixed
     wait therefore measures a screen mid-animation, which is how the first
     draft of this file came to report zero targets and call it a pass.
     `.hudqa/measure.mjs` dodges the same trap by sampling for 12 s; do the
     same and take the last sample that actually found something. */
  let targets = [];
  for (let t = 0; t < 12000; t += 400) {
    await p.waitForTimeout(400);
    const shot = await p.evaluate(COLLECT);
    if (shot.length) targets = shot;
  }

  const rows = targets.map((t) => {
    const cx = t.x + t.w / 2;
    const cy = t.y + t.h / 2;
    const right = zoneOf(cx, cy, 'right');
    const left = zoneOf(cx, cy, 'left');
    // A control is only as reachable as its WORSE hand. A left-handed player is
    // a third of one-handed users; designing for the right thumb alone quietly
    // makes the game harder for them and nobody ever files it as a bug.
    const worst = [right, left].includes('hard') ? 'hard'
      : [right, left].includes('stretch') ? 'stretch' : 'easy';
    return { ...t, cx: Math.round(cx), cy: Math.round(cy), right, left, worst };
  });

  const dock = rows.filter((r) => r.drilling);
  const bad = dock.filter((r) => r.worst === 'hard');
  const stretched = dock.filter((r) => r.worst === 'stretch');
  const elsewhereHard = rows.filter((r) => !r.drilling && r.worst === 'hard');

  json.cases[m] = { targets: rows.length, dock: dock.length, hard: bad.map((r) => r.cls), rows };
  if (bad.length) fails.push(...bad.map((r) => `${m}: .${r.cls} at (${r.cx},${r.cy})`));

  say(`\n${m}`);
  say(`  targets      ${rows.length}   of which in the drilling dock: ${dock.length}`);
  if (!rows.length) {
    // A harness that sees nothing and says "ok" is worse than no harness: it
    // produces a confident false negative and the project stops looking. This
    // file did exactly that on its first run, against the boot screen.
    fails.push(`${m}: the page had NO interactive targets at all — the harness measured nothing`);
    say('  NOTHING      no interactive targets on the page  <-- GATE FAIL');
  } else if (!dock.length) {
    fails.push(`${m}: no .sitedock — the drilling controls were not found`);
    say('  NO DOCK      nothing matched .sitedock  <-- GATE FAIL');
  } else {
    const easy = dock.length - bad.length - stretched.length;
    say(`  dock zones   easy ${easy}   stretch ${stretched.length}   hard ${bad.length}`
      + (bad.length ? '  <-- GATE FAIL' : '  ok'));
    for (const r of bad) say(`     HARD      .${r.cls}  centre (${r.cx},${r.cy})  right=${r.right} left=${r.left}`);
    for (const r of stretched) say(`     stretch   .${r.cls}  centre (${r.cx},${r.cy})  right=${r.right} left=${r.left}`);
  }
  if (elsewhereHard.length) {
    say('  outside the dock, hard to reach (reported, not gated): '
      + elsewhereHard.map((r) => '.' + r.cls).join(', '));
  }
}

await p.screenshot({ path: '.hudqa/reach-last.png' });
await b.close();
SERVER.stop();

if (WANT_JSON) writeFileSync('.hudqa/reach-report.json', JSON.stringify(json, null, 2));

say('\n=== GATE ===');
if (fails.length) {
  say('  drilling controls in the thumb arc .... FAIL');
  for (const f of fails) say(`    ${f}`);
  console.error(`\n${fails.length} control(s) the player uses while drilling cannot be reached one-handed.`);
  process.exit(1);
}
say('  drilling controls in the thumb arc .... PASS');
