#!/usr/bin/env node
/**
 * checkreach — can the player's THUMB get to the controls?
 *
 *   node tools/checkreach.mjs                 # uses/starts the dev server on 5178
 *   node tools/checkreach.mjs 5178 --json
 *   node tools/checkreach.mjs --self-test     # verdict fixtures, no browser
 *
 * ── WHY SIZE IS ONLY HALF THE QUESTION ─────────────────────────────────────
 * `.hudqa/measure.mjs` gates on 44 x 44 css px and on overlap. This gate also
 * enforces that touch floor and measures WHERE a control is. On a portrait
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
 * ── THE GATE, AND WHERE THE SORT COMES FROM ────────────────────────────────
 * Controls the player touches WHILE DRILLING must be reachable; controls
 * touched between jobs need not be, and some of them should not be — moving
 * the shop out of the thumb arc is a legitimate design choice, leaving the
 * feed control there is not. Leaving a hole is needed during drilling too:
 * its button must be reachable, with abandonment protected by confirmation
 * in the UI rather than by making the exit inaccessible.
 *
 * That sort is the design decision and the layout follows from it, so the
 * screen states it and this file reads it: `site.js` writes
 * `data-reach="drilling"` or `data-reach="between"` beside each control,
 * with the reason in the comment above it.
 *
 * It used to be inferred here instead, as `el.closest('.sitedock')`. A
 * container is not a statement of intent, and that proxy was blind in
 * exactly the direction that matters: a control used while drilling but
 * placed outside the dock was silently scored as not-a-drilling-control and
 * waved through. An UNDECLARED interactive target is now a failure — an
 * element nobody sorted is an element nobody thought about.
 *
 * Exits 0 clean, 1 on any drilling control outside the arc for either hand,
 * on any unknown/undeclared or undersized target, on a missing/unreachable
 * Leave hole button, and on any screen where the gate found nothing to measure.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';
import { ensureServer } from './devserver.mjs';
import assert from 'node:assert/strict';

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
const MIN_TARGET_PX = 44; // Existing project touch floor: ASTRA.md §8.1, .hudqa/measure.mjs.

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

/* ── THE CONTROL IS A RECTANGLE. THE VERDICT IS ITS CENTRE. WHY BOTH. ──────
   `research/CRITIQUE.md` §10 [A]: "checkreach scores a POINT, not a CONTROL:
   `.actionbtn` has 24.1 % of its area inside the gate's own HARD zone for the
   right hand — its centre clears the inner radius by 15.5px, its nearest
   corner is 37.3px inside it." That observation is correct and it is measured
   here now, per control, per hand, and PRINTED — a finding that lives only in
   a document is a finding the next run cannot check.

   It is NOT the pass/fail, and that is a deliberate modelling decision rather
   than an oversight:

     - People aim at the middle of a target, not at its corner. Fitts' law is
       about the distance to a target's CENTRE; the corner of a 96x68 button
       is not where a thumb goes.
     - "The whole rectangle must be reachable" penalises a control for being
       BIG, which is backwards — it would fail a generous button and pass a
       mean one placed at the same centre.
     - Any middle rule ("60 % of the area", "a 44x44 reachable patch") needs a
       threshold nobody has measured on this game's players. §1.1: a plausible
       invented number is worse than an admitted gap. The three constants at
       the top of this file are already marked `assumed`; a fourth, doing the
       actual gating, would be worse than the three.

   So: the centre decides, the area is measured, and the area is RATCHETED —
   a control may not get less reachable than it is today without somebody
   raising WORST_INSIDE_HARD on purpose. That makes the §10 [A] number a
   regression test instead of a sentence. */
const AREA_SAMPLES = 24;   // 24 x 24 = 576 samples per control per hand

/** Fraction of a control's own area that falls in the thumb's hard zone. */
function hardAreaFraction(t, hand) {
  let hard = 0;
  for (let i = 0; i < AREA_SAMPLES; i++) {
    for (let j = 0; j < AREA_SAMPLES; j++) {
      const x = t.x + t.w * ((i + 0.5) / AREA_SAMPLES);
      const y = t.y + t.h * ((j + 0.5) / AREA_SAMPLES);
      if (zoneOf(x, y, hand) === 'hard') hard++;
    }
  }
  return hard / (AREA_SAMPLES * AREA_SAMPLES);
}

/* The worst hard-area fraction any single drilling control may reach, over
   the five methods, either hand. Measured on this layout; raise it only with
   the report that earned it. It is NOT zero and cannot be: the control row
   sits above the thumb's fold, so the outermost controls always have a corner
   inside it. Zero would require controls narrower than the fold's chord. */
const WORST_INSIDE_HARD = 0.28;
/* Measured 2026-09-06 on this layout, all five methods: the worst is `.vsl`,
   the leftmost slider, at 26.0 % — 0.0 % for the right hand and 26.0 % for the
   left, which is the same shape §10 [A] reported for `.actionbtn` and the same
   reason: the control nearest a bottom corner has that corner in the fold of
   the thumb on that side. 28 % is 26.0 plus enough headroom for sub-pixel and
   font differences (one sample of the 24x24 grid is 0.17 %), not slack. */

function assessTargets(targets) {
  const rows = targets.map((t) => {
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
    const right = zoneOf(cx, cy, 'right'), left = zoneOf(cx, cy, 'left');
    const worst = [right, left].includes('hard') ? 'hard'
      : [right, left].includes('stretch') ? 'stretch' : 'easy';
    const hardR = hardAreaFraction(t, 'right'), hardL = hardAreaFraction(t, 'left');
    return {
      ...t, cx: Math.round(cx), cy: Math.round(cy), right, left, worst,
      hardAreaRight: +hardR.toFixed(3), hardAreaLeft: +hardL.toFixed(3),
      hardArea: +Math.max(hardR, hardL).toFixed(3),
    };
  });
  const drilling = rows.filter((r) => r.reach === 'drilling');
  const between = rows.filter((r) => r.reach === 'between');
  // A typo is unsorted too; any nonempty string used to escape both classes.
  const unsorted = rows.filter((r) => !['drilling', 'between'].includes(r.reach));
  const small = rows.filter((r) => r.w < MIN_TARGET_PX || r.h < MIN_TARGET_PX);
  const bad = drilling.filter((r) => r.worst === 'hard');
  const leaves = rows.filter((r) => r.isLeave);
  const failures = [];
  if (!rows.length) failures.push('the page had NO interactive targets — the harness measured nothing');
  if (!drilling.length) failures.push('no control declares data-reach="drilling" — the arc gate tested nothing');
  for (const r of unsorted) failures.push(`.${r.cls} declares invalid data-reach=${JSON.stringify(r.reach)}`);
  for (const r of small) failures.push(`.${r.cls} target ${r.w.toFixed(2)} x ${r.h.toFixed(2)} is below ${MIN_TARGET_PX} x ${MIN_TARGET_PX}px`);
  for (const r of bad) failures.push(`.${r.cls} at (${r.cx},${r.cy}) is outside the thumb arc: right=${r.right}, left=${r.left}`);
  /* The area ratchet — CRITIQUE §10 [A], measured rather than asserted. */
  const areaBad = drilling.filter((r) => r.hardArea > WORST_INSIDE_HARD);
  for (const r of areaBad) {
    failures.push(`.${r.cls} has ${(r.hardArea * 100).toFixed(1)}% of its area in the thumb's hard zone`
      + ` (right ${(r.hardAreaRight * 100).toFixed(1)}%, left ${(r.hardAreaLeft * 100).toFixed(1)}%),`
      + ` over the ${(WORST_INSIDE_HARD * 100).toFixed(0)}% this layout is allowed`);
  }
  // The exit is required even if all remaining controls are valid. It cannot
  // be removed, disabled, or classified "between" to make the gate green.
  if (leaves.length !== 1) failures.push(`expected one interactive .site__leave button, found ${leaves.length}`);
  for (const r of leaves) {
    if (r.tag !== 'BUTTON') failures.push('.site__leave must remain a DOM <button>');
    if (r.reach !== 'drilling') failures.push('.site__leave must declare data-reach="drilling"');
    if (r.x < 0 || r.y < 0 || r.x + r.w > W || r.y + r.h > H) {
      failures.push('.site__leave is not entirely inside the viewport');
    }
  }
  return { rows, drilling, between, unsorted, small, bad, areaBad, leaves, failures };
}

if (argv.includes('--self-test')) {
  const leave = { cls: 'site__leave', isLeave: true, tag: 'BUTTON', x: 131, y: 760, w: 128, h: 44, reach: 'drilling', inDock: true };
  const feed = { cls: 'feed', isLeave: false, tag: 'BUTTON', x: 173, y: 630, w: 44, h: 44, reach: 'drilling', inDock: true };
  const verdict = (targets) => assessTargets(targets).failures;
  assert.deepEqual(verdict([leave, feed]), [], 'reachable controls at the exact 44px floor must pass');
  const fixtures = [
    ['empty screen', [], /NO interactive/],
    ['missing exit', [feed], /expected one/],
    ['duplicate exit', [leave, leave, feed], /found 2/],
    ['old corner exit', [{ ...leave, x: 363, y: 24.5, w: 30, h: 30 }, feed], /outside the thumb arc/],
    ['exit width', [{ ...leave, w: 43.99 }, feed], /below 44/],
    ['exit height', [{ ...leave, h: 43.99 }, feed], /below 44/],
    ['another undersized target', [leave, { ...feed, w: 30 }], /below 44/],
    ['unsorted exit', [{ ...leave, reach: null }, feed], /invalid data-reach/],
    ['unknown sort', [leave, { ...feed, reach: 'driling' }], /invalid data-reach/],
    ['exit exempted as between', [{ ...leave, reach: 'between' }, feed], /must declare/],
    ['nonbutton exit', [{ ...leave, tag: 'DIV' }, feed], /DOM <button>/],
    ['partially offscreen exit', [{ ...leave, y: H - 20 }, feed], /inside the viewport/],
    /* CRITIQUE §10 [A]: THE CASE THE CENTRE RULE WAVES THROUGH.
       A 160x60 control at (218,770): its centre (298,800) is `easy` for BOTH
       hands, so every other rule in this file passes it — and 47.9 % of its
       body is inside the right thumb's fold. That is the whole argument for
       measuring the area, and it is the only fixture here that makes it.

       An earlier version of this fixture used a 60x54 box at (0,790), which
       is 100 % in the LEFT fold with its centre `hard` — so it failed on the
       centre rule at `:247` and proved nothing about the area rule at all. A
       regression test that the older rule already catches is a test of
       nothing; it is the empty-set problem this file's header is about,
       wearing a fixture's clothes. Verified against this file's own zoneOf
       before being written down. */
    ['centre clears the arc but half the control does not',
      [leave, { ...feed, x: 218, y: 770, w: 160, h: 60 }], /hard zone/],
  ];
  for (const [name, targets, expected] of fixtures) {
    assert.ok(verdict(targets).some((f) => expected.test(f)), `${name} must fail: ${verdict(targets).join('; ')}`);
  }
  console.log(`checkreach verdict fixtures PASS: 1 valid layout, ${fixtures.length} rejected regressions; no browser launched`);
  process.exit(0);
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
    /* THE SORT IS DECLARED BY THE SCREEN, NOT GUESSED BY THE HARNESS.
       This read `drilling: !!el.closest('.sitedock')` — a container standing
       in for an intention. That proxy has a hole in exactly the direction
       that matters: a control the player uses WHILE DRILLING, placed
       anywhere but the dock, was not gated at all and nothing would ever
       have said so. The reverse mistake is harmless, which is what makes the
       proxy feel safe. `site.js` now writes `data-reach="drilling"` or
       `"between"` beside each control together with the reason.
       `closest`, not the element's own attribute, so a composite control
       declares once at its root and its parts inherit. */
    const decl = el.closest('[data-reach]')?.dataset.reach || null;
    out.push({
      cls,
      tag: el.tagName,
      isLeave: el.matches('.site__leave'),
      x: r.x, y: r.y, w: r.width, h: r.height,
      reach: decl,
      drilling: decl === 'drilling',
      inDock: !!el.closest('.sitedock'),
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
/* ── --headless: OPT-IN, AND IT MEASURES THE SAME THING ────────────────────
   Every number this gate produces is a `getBoundingClientRect()` and a class
   name. None of it is a frame, a draw call or a pixel, so unlike
   `.hudqa/measure.mjs` — which is headed-mandatory for real reasons and says
   so in its own header — nothing here needs the discrete GPU.

   Headed stays the DEFAULT so no existing invocation changes. The flag exists
   because this machine runs many agents behind one GPU lease
   (`drillity-coordination/gpu-owner.txt`), and a gate that cannot run while
   somebody else is measuring is a gate that gets skipped — which is the
   empty-set failure this file's own header is about, one level up.

   ANGLE is pointed at SwiftShader rather than left to pick: a headless
   Chrome that quietly binds the real GPU would contend with the lease holder,
   which is the thing the flag exists to avoid. Layout is identical either
   way; if it ever is not, that difference is a finding and not a nuisance. */
const HEADLESS = argv.includes('--headless');
const b = await chromium.launch({
  headless: HEADLESS, channel: 'chrome',
  args: HEADLESS
    ? ['--mute-audio', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    : ['--mute-audio'],
});
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
     same and grade the final sample, including an empty one: retaining an
     earlier nonempty sample would hide controls that disappeared. */
  let targets = [];
  for (let t = 0; t < 12000; t += 400) {
    await p.waitForTimeout(400);
    targets = await p.evaluate(COLLECT);
  }

  const { rows, drilling, between, unsorted, small, bad, areaBad, leaves, failures } = assessTargets(targets);
  const stretched = drilling.filter((r) => r.worst === 'stretch');
  const betweenHard = between.filter((r) => r.worst === 'hard');
  /* Declared 'drilling' but not in the dock, or in the dock but not declared
     drilling: either is a layout that has drifted from its own sort, and it
     is the thing the container proxy could never see. Reported, so the sort
     and the layout are visibly one decision. */
  const misplaced = rows.filter((r) => (r.reach === 'drilling') !== r.inDock);

  json.cases[m] = {
    targets: rows.length, drilling: drilling.length, between: between.length,
    hard: bad.map((r) => r.cls), unsorted: unsorted.map((r) => r.cls),
    small: small.map((r) => r.cls), leaveButtons: leaves.length, failures, rows,
    worstHardArea: Math.max(...drilling.map((r) => r.hardArea), 0), hardAreaCeiling: WORST_INSIDE_HARD,
  };
  fails.push(...failures.map((f) => `${m}: ${f}`));

  say(`\n${m}`);
  say(`  targets      ${rows.length}   drilling ${drilling.length}   between ${between.length}   invalid sort ${unsorted.length}`);
  say(`  targets<44   ${small.length}${small.length ? '  <-- GATE FAIL' : '  ok'}`);
  say(`  leave button ${leaves.length} interactive target(s)`);
  if (!rows.length) {
    // A harness that sees nothing and says "ok" is worse than no harness: it
    // produces a confident false negative and the project stops looking. This
    // file did exactly that on its first run, against the boot screen.
    say('  NOTHING      no interactive targets on the page  <-- GATE FAIL');
  } else if (!drilling.length) {
    /* Not "no .sitedock" any more: the question is whether anything on this
       screen is declared as touched while drilling. A site screen with no
       drilling control is a screen that cannot be played, and it is also a
       gate with nothing left to test. */
    say('  NO SUBJECT   no control is declared as touched while drilling  <-- GATE FAIL');
  } else {
    const easy = drilling.length - bad.length - stretched.length;
    say(`  drilling     easy ${easy}   stretch ${stretched.length}   hard ${bad.length}`
      + (bad.length ? '  <-- GATE FAIL' : '  ok'));
    for (const r of bad) say(`     HARD      .${r.cls}  centre (${r.cx},${r.cy})  right=${r.right} left=${r.left}`);
    for (const r of stretched) say(`     stretch   .${r.cls}  centre (${r.cx},${r.cy})  right=${r.right} left=${r.left}`);
    /* Printed every run, pass or fail: the §10 [A] number. The centre decides
       the verdict; this says how much of each control the fold takes. */
    const worstArea = drilling.slice().sort((a, b) => b.hardArea - a.hardArea)[0];
    say(`  in the fold  worst .${worstArea.cls} ${(worstArea.hardArea * 100).toFixed(1)}% of its area`
      + ` (right ${(worstArea.hardAreaRight * 100).toFixed(1)}%, left ${(worstArea.hardAreaLeft * 100).toFixed(1)}%)`
      + `   ceiling ${(WORST_INSIDE_HARD * 100).toFixed(0)}%`
      + (areaBad.length ? '  <-- GATE FAIL' : '  ok'));
  }
  for (const r of unsorted) {
    say(`  INVALID SORT .${r.cls}  data-reach=${JSON.stringify(r.reach)}  — sort it in site.js  <-- GATE FAIL`);
  }
  if (betweenHard.length) {
    say('  between jobs, outside the arc (reported — for some of these that is the point): '
      + betweenHard.map((r) => '.' + r.cls).join(', '));
  }
  if (misplaced.length) {
    say('  sort vs layout disagree (reported): '
      + misplaced.map((r) => `.${r.cls} declares ${r.reach || 'nothing'}, ${r.inDock ? 'is' : 'is not'} in the dock`).join('; '));
  }
}

await p.screenshot({ path: '.hudqa/reach-last.png' });
await b.close();
SERVER.stop();

if (WANT_JSON) writeFileSync('.hudqa/reach-report.json', JSON.stringify(json, null, 2));

say('\n=== GATE ===');
if (fails.length) {
  say('  touch size, declared reach, reachable exit .... FAIL');
  for (const f of fails) say(`    ${f}`);
  console.error(`\n${fails.length} touch-target/reach requirement(s) failed.`);
  process.exit(1);
}
say('  touch size, declared reach, reachable exit .... PASS');
