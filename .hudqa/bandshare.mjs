/**
 * bandshare — HOW MUCH OF THE PHONE IS THE GAME, on more than one phone.
 *
 *   node .hudqa/bandshare.mjs before 5180
 *   node .hudqa/bandshare.mjs after  5180 --json
 *   node .hudqa/bandshare.mjs --self-test        # verdict fixtures, no browser
 *
 * ── WHY A SECOND INSTRUMENT AND NOT A FLAG ON measure.mjs ──────────────────
 * `.hudqa/measure.mjs` is the full HUD gate and it is HEADED-MANDATORY by its
 * own header, for a good reason: overlaps at full quality, with the real post
 * chain, on the discrete GPU. That makes it the authority and it also makes it
 * unrunnable while another agent holds the GPU lease, which is most of the
 * time on this machine. It also measures exactly ONE viewport — iPhone 13 Pro
 * — so the number everyone quotes, "the 3D gets 66 %", is a number about one
 * phone, and the dock is a stack of FIXED-HEIGHT rows, which means its share
 * of the screen is worst on the smallest phone and nobody was looking there.
 *
 * This file asks the narrower question that CAN be answered on the CPU:
 *
 *      what fraction of the stage do the two `.siteband` spacers own,
 *      on each of six real portrait phones, on each of five methods?
 *
 * Box layout is not GPU work. Band rects, `.sitedock` height, the 44 px floor
 * and the enumerated overlap set are all correct in headless Chrome with
 * `--use-angle=swiftshader`; boot clears in ~15 s. So is `renderer.bandsRect`,
 * because `computeLayout()` is arithmetic over `ctx.hud` — which is the link
 * that matters: a dock that shrinks in the DOM while the renderer keeps its
 * old inset would hand the player letterboxing instead of 3D, and that is a
 * silent fallback of exactly the shape ASTRA §10 names. It is checked here.
 *
 * WHAT THIS FILE MAY NOT BE USED TO CLAIM: anything about frames, draw calls,
 * fps, shader correctness or what the bands actually look like. SwiftShader
 * renders; it does not render the same. Those belong to a headed run.
 *
 * ── THE 82 % ─────────────────────────────────────────────────────────────
 * `GAMEDESIGN.md` §1 draws the dock starting at ~82 % of the screen, so the
 * brief is "chrome <= 18 %". `research/CRITIQUE.md` §9 reads it as "the 3D
 * gets 82 %" and measured 66 %. Both readings put the floor above what this
 * layout has ever achieved, and neither is reachable while the dock carries a
 * gauge row, a 44 px auxiliary row, a 72 px control row and a reach reserve —
 * see the arithmetic printed under BUDGET below, which is why this file prints
 * the budget rather than only the verdict. The gate here is a RATCHET: it
 * fails if the share falls below the floor recorded in FLOOR, which is raised
 * by hand whenever a change earns it. A floor nobody can reach is a gate
 * everybody learns to ignore.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { ENUMERATE } from './enumerate.js';
import { ensureServer } from '../tools/devserver.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const TAG = positional[0] || 'run';
const PORT = positional[1] || '5180';
const AS_JSON = argv.includes('--json');

/* The five methods `.hudqa/measure.mjs` and `tools/checkreach.mjs` walk, so
   all three reports are about the same screens. Each puts a different dock on
   the site screen: `dth` and `oil-rotary` take `.sitedock--plain`, which drops
   the auxiliary row entirely and is the cheapest dock the game has. */
const CASES = ['rockbolt', 'driven-pile', 'rc', 'dth', 'oil-rotary'];

/* ── The phones ────────────────────────────────────────────────────────────
   CSS px in portrait, which is the only unit the layout reacts to. Chosen to
   straddle both of the stylesheet's viewport tiers (`max-height: 680px` and
   `min-height: 900px`) so a tier that carries a stale number is visible, and
   to include the smallest screen the game claims to support.

   deviceScaleFactor is set but does not enter the arithmetic; it is here so a
   report says what was emulated rather than leaving it to be assumed. */
const PHONES = [
  { id: 'iphone-se',      name: 'iPhone SE 2/3',       w: 375, h: 667, dpr: 2, tier: 'short' },
  { id: 'galaxy-s8',      name: 'Galaxy S8 / A-class',  w: 360, h: 740, dpr: 3, tier: 'base'  },
  { id: 'iphone-13-mini', name: 'iPhone 13 mini',       w: 375, h: 812, dpr: 3, tier: 'base'  },
  { id: 'iphone-13-pro',  name: 'iPhone 13 Pro / 14',   w: 390, h: 844, dpr: 3, tier: 'base'  },
  { id: 'pixel-7',        name: 'Pixel 7',              w: 412, h: 915, dpr: 2.6, tier: 'tall' },
  { id: 'iphone-14-pmax', name: 'iPhone 14/15 Pro Max', w: 430, h: 932, dpr: 3, tier: 'tall' },
];

/* ── The ratchet ───────────────────────────────────────────────────────────
   Per phone, the worst share across the five methods that this layout is
   known to reach. A run below its floor is a REGRESSION and exits 1. Raise a
   floor only with the report that earned it in hand.

   `null` means "no floor recorded yet" — printed as such, never as a pass. */
const FLOOR = {
  // Measured 2026-09-06 on 5180, headless Chrome / SwiftShader, five methods
  // each. Before this branch's HUD work the same six numbers were
  // 53.5 / 56.2 / 60.1 / 61.6 / 62.0 / 62.7 — see bandshare-before.json.
  'iphone-se':      55.9,
  'galaxy-s8':      60.3,
  'iphone-13-mini': 63.8,
  'iphone-13-pro':  65.2,
  'pixel-7':        67.9,
  'iphone-14-pmax': 68.5,
};

const RATCHET_TOLERANCE_PP = 0.5;

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

/* ── The verdict, separated from the browser so it can be tested ─────────── */
export function assess(rows, floors = FLOOR) {
  const failures = [];
  if (!rows.length) failures.push('measured nothing — no phone produced a sample');
  const byPhone = new Map();
  for (const r of rows) {
    if (!byPhone.has(r.phone)) byPhone.set(r.phone, []);
    byPhone.get(r.phone).push(r);
  }
  for (const r of rows) {
    /* A gate over an empty set passes for ever. Each of these is something
       the state MUST have for the share to mean anything. */
    if (r.stagePct == null) { failures.push(`${r.phone}/${r.method}: no .siteband pair — the share gate tested nothing`); continue; }
    if (!r.dockH) failures.push(`${r.phone}/${r.method}: no .sitedock`);
    if (!r.stripH) failures.push(`${r.phone}/${r.method}: no .sstrip`);
    if (r.overlaps) failures.push(`${r.phone}/${r.method}: ${r.overlaps} overlap(s): ${r.overlapList.slice(0, 2).join(' | ')}`);
    if (r.onBand3D && r.onBand3D.length) failures.push(`${r.phone}/${r.method}: ${r.onBand3D.length} element(s) on the 3D: ${r.onBand3D.slice(0, 2).join(' | ')}`);
    if (r.smallTargets && r.smallTargets.length) failures.push(`${r.phone}/${r.method}: below the 44px floor: ${r.smallTargets.join(', ')}`);
    /* Buying 3D back means shortening rows, and the first thing a shorter row
       does is cut a word in half. `research/CRITIQUE.md` §11 is an entire
       section about exactly that on another screen, so it is gated here on
       the screen this file is shrinking. */
    if (r.clipped && r.clipped.length) failures.push(`${r.phone}/${r.method}: clipped text: ${r.clipped.slice(0, 3).join(' | ')}`);
    /* The DOM reserved the space; did the renderer actually take it? A dock
       that shrinks while `computeLayout()` keeps its old inset gives the
       player letterbox, not 3D, and nothing on screen would say so. */
    if (r.rendererBandsH != null && Math.abs(r.rendererBandsH - r.bandH) > 2) {
      failures.push(`${r.phone}/${r.method}: renderer bands ${r.rendererBandsH}px vs DOM spacers ${r.bandH}px — the 3D did not follow the chrome`);
    }
  }
  for (const [phone, rs] of byPhone) {
    const worst = Math.min(...rs.map((r) => (r.stagePct == null ? -1 : r.stagePct)));
    const floor = floors[phone];
    if (floor == null) continue;                 // reported, never a silent pass
    /* TOLERANCE, and why it is not zero. The floors are the exact worst
       share measured, so a bare `<` would turn `npm run check` red on any
       sub-pixel drift — a different Chrome build, a different font fallback,
       headed against headless. 0.5pp is well under the smallest change worth
       catching (the regressions this gate exists for are 2-6pp) and well over
       rounding: one CSS pixel on the shortest phone here is 0.15pp. */
    if (worst < floor - RATCHET_TOLERANCE_PP) {
      failures.push(`${phone}: worst share ${worst}% is below the recorded floor ${floor}%`
        + ` (tolerance ${RATCHET_TOLERANCE_PP}pp)`);
    }
  }
  return { failures, byPhone };
}

if (argv.includes('--self-test')) {
  const ok = {
    phone: 'iphone-13-pro', method: 'rc', stagePct: 72.6, bandH: 613, rendererBandsH: 613,
    stripH: 40, dockH: 254, overlaps: 0, overlapList: [], onBand3D: [], smallTargets: [], clipped: [],
  };
  const F = { 'iphone-13-pro': 72.6 };
  assert.deepEqual(assess([ok], F).failures, [], 'a clean sample at the floor must pass');
  const cases = [
    ['no samples at all', [], /measured nothing/],
    ['clipped text', [{ ...ok, clipped: ['vsl__name WITHDRAW'] }], /clipped text/],
    ['no bands', [{ ...ok, stagePct: null }], /tested nothing/],
    ['no dock', [{ ...ok, dockH: 0 }], /no \.sitedock/],
    ['an overlap', [{ ...ok, overlaps: 1, overlapList: ['a x b'] }], /overlap/],
    ['something on the 3D', [{ ...ok, onBand3D: ['x'] }], /on the 3D/],
    ['an undersized target', [{ ...ok, smallTargets: ['vsl 40x40'] }], /44px floor/],
    ['a share regression', [{ ...ok, stagePct: 71.0 }], /below the recorded floor/],
    ['renderer left behind', [{ ...ok, rendererBandsH: 560 }], /did not follow the chrome/],
  ];
  for (const [name, rows, re] of cases) {
    assert.ok(assess(rows, F).failures.some((f) => re.test(f)), `${name} must fail: ${JSON.stringify(assess(rows, F).failures)}`);
  }
  console.log(`bandshare verdict fixtures PASS: 1 valid sample, ${cases.length} rejected regressions; no browser launched`);
  process.exit(0);
}

/* ── In-page ─────────────────────────────────────────────────────────────── */
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

/** What the renderer believes, alongside what the DOM says. */
const RENDER_STATE = () => {
  const r = window.__DRILLITY?.renderer;
  if (!r) return null;
  try {
    const b = r.bandsRect, c = r.chrome;
    return {
      bandsH: b ? Math.round(b.h) : null,
      chromeTop: c ? Math.round(c.top) : null,
      chromeBottom: c ? Math.round(c.bottom) : null,
    };
  } catch (e) { return null; }
};

/* ── Run ─────────────────────────────────────────────────────────────────── */
const say = (s = '') => console.log(s);
const SERVER = await ensureServer(PORT, say);
const ORIGIN = SERVER.origin;

/* Headless, with ANGLE pointed at SwiftShader: this instrument must be
   runnable while another agent holds the discrete GPU. `channel: 'chrome'`
   because playwright's own headless shell is not installed on this machine
   and the installed Chrome is. */
const browser = await chromium.launch({
  headless: true, channel: 'chrome',
  args: ['--mute-audio', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const rows = [];
const consoleErrors = [];

for (const phone of PHONES) {
  const ctx = await browser.newContext({
    viewport: { width: phone.w, height: phone.h },
    deviceScaleFactor: phone.dpr, isMobile: true, hasTouch: true,
  });
  await ctx.route('**/@vite/client', (r) => r.fulfill({
    status: 200, contentType: 'application/javascript', body: VITE_STUB,
  }));
  const p = await ctx.newPage();
  p.on('pageerror', (e) => consoleErrors.push(`${phone.id}: ${e.message.split('\n')[0]}`));

  const t0 = Date.now();
  await p.goto(`${ORIGIN}/?quality=low&shot&mute`, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await p.waitForFunction(() => window.__DRILLITY?.ui?.show && window.__DRILLITY?.sim, null, { timeout: 240000 });
  /* THE BOOT SCREEN IS A SHADER COMPILE, NOT A SPLASH. A fixed wait measures
     the boot screen and reports zero of everything, which `checkreach` once
     called a pass. Wait for boot to actually leave. */
  await p.waitForFunction(() => !!document.querySelector('.screens > *:not(.boot)'), null, { timeout: 300000 });
  say(`\n${phone.name.padEnd(22)} ${phone.w} x ${phone.h} css px @${phone.dpr}x   boot ${((Date.now() - t0) / 1000).toFixed(1)} s`);

  for (const m of CASES) {
    await p.evaluate(GOTO_SITE, m);
    /* SAMPLE, DO NOT SNAPSHOT. `.site` keeps `is-entering` indefinitely and
       the dock measures several hundred px mid-transition. Sample until the
       dock height and the share have held still for four consecutive reads,
       then grade the LAST one — including an empty one. */
    let med = null, stable = 0, last = '';
    for (let t = 0; t < 14000; t += 400) {
      await p.waitForTimeout(400);
      med = await p.evaluate(`(${ENUMERATE})({})`);
      const key = `${med?.dom?.dockH}|${med?.split?.stagePct}|${med?.targets}`;
      stable = key === last ? stable + 1 : 0;
      last = key;
      if (stable >= 4 && t > 2400) break;
    }
    const rs = await p.evaluate(RENDER_STATE);
    const bandH = (med?.bands?.surface?.h || 0) + (med?.bands?.section?.h || 0);
    rows.push({
      phone: phone.id, phoneName: phone.name, vw: phone.w, vh: phone.h, tier: phone.tier,
      method: m,
      stageW: med?.W ?? null, stageH: med?.H ?? null,
      stripH: med?.dom?.stripH ?? null, dockH: med?.dom?.dockH ?? null,
      bandH, surfH: med?.bands?.surface?.h ?? null, sectH: med?.bands?.section?.h ?? null,
      stagePct: med?.split?.stagePct ?? null,
      surfPct: med?.split?.surfPct ?? null, sectPct: med?.split?.sectPct ?? null,
      rendererBandsH: rs?.bandsH ?? null,
      rendererChrome: rs ? { top: rs.chromeTop, bottom: rs.chromeBottom } : null,
      hud: med?.dom?.hud ?? null,
      overlaps: med?.overlaps ?? null, overlapList: med?.overlapList ?? [],
      onBand3D: med?.onBand3D ?? [], targets: med?.targets ?? 0,
      smallTargets: med?.smallTargets ?? [], targetList: med?.targetList ?? [],
      clipped: med?.clipped ?? [],
    });
    const r = rows[rows.length - 1];
    say(`  ${m.padEnd(12)} strip ${String(r.stripH).padStart(3)}  dock ${String(r.dockH).padStart(3)}`
      + `  bands ${String(r.bandH).padStart(3)} (${r.surfPct}/${r.sectPct})`
      + `  3D ${String(r.stagePct).padStart(5)}%`
      + `  renderer ${String(r.rendererBandsH).padStart(3)}`
      + `  overlaps ${r.overlaps}  <44 ${r.smallTargets.length}`);
  }
  await ctx.close();
}

await browser.close();
SERVER.stop();

const { failures, byPhone } = assess(rows);

say('\n=== 3D SHARE OF THE STAGE, worst method per phone ===');
say('  phone                   viewport    tier    worst   best    floor   method (worst)');
const summary = [];
for (const [phone, rs] of byPhone) {
  const withPct = rs.filter((r) => r.stagePct != null);
  const worstRow = withPct.slice().sort((a, b) => a.stagePct - b.stagePct)[0];
  const bestRow = withPct.slice().sort((a, b) => b.stagePct - a.stagePct)[0];
  const f = FLOOR[phone];
  summary.push({ phone, worst: worstRow?.stagePct ?? null, best: bestRow?.stagePct ?? null, floor: f ?? null, worstMethod: worstRow?.method ?? null });
  say(`  ${rs[0].phoneName.padEnd(22)} ${String(rs[0].vw).padStart(3)}x${String(rs[0].vh).padEnd(4)} ${String(rs[0].tier).padEnd(6)}`
    + `  ${String(worstRow?.stagePct ?? 'NONE').padStart(5)}%  ${String(bestRow?.stagePct ?? 'NONE').padStart(5)}%`
    + `  ${f == null ? ' none' : String(f).padStart(5)}%  ${worstRow?.method ?? '-'}`);
}

/* THE BUDGET, PRINTED. A budget the instrument cannot report is not a budget.
   These are the stylesheet's own parts, so a reader can see WHERE the chrome
   goes rather than being told a total and asked to trust it. */
say('\n=== WHERE THE CHROME GOES (worst phone, from the stylesheet parts) ===');
const worstPhone = summary.slice().sort((a, b) => (a.worst ?? 999) - (b.worst ?? 999))[0];
if (worstPhone) {
  const rs = byPhone.get(worstPhone.phone).filter((r) => r.stagePct != null);
  const w = rs.slice().sort((a, b) => a.stagePct - b.stagePct)[0];
  say(`  ${w.phoneName} ${w.vw}x${w.vh}, method ${w.method}`);
  say(`    stage        ${w.stageH} px`);
  say(`    .sstrip      ${w.stripH} px   (${(100 * w.stripH / w.stageH).toFixed(1)} %)`);
  say(`    .sitedock    ${w.dockH} px   (${(100 * w.dockH / w.stageH).toFixed(1)} %)`);
  say(`    3D bands     ${w.bandH} px   (${w.stagePct} %)`);
  say(`    GAMEDESIGN §1 draws the dock starting at ~82 %, i.e. chrome <= ${(0.18 * w.stageH).toFixed(0)} px here;`);
  say(`    this layout spends ${w.stripH + w.dockH} px. The gap is ${(w.stripH + w.dockH - 0.18 * w.stageH).toFixed(0)} px.`);
}

if (consoleErrors.length) {
  say('\n=== PAGE ERRORS (build is not clean; every number above is suspect) ===');
  for (const e of [...new Set(consoleErrors)].slice(0, 10)) say(`  ${e}`);
}

if (AS_JSON) {
  const out = resolve(HERE, `bandshare-${TAG}.json`);
  writeFileSync(out, JSON.stringify({ tag: TAG, port: PORT, when: new Date().toISOString(), phones: PHONES, floor: FLOOR, summary, rows, consoleErrors, failures }, null, 2));
  say(`\n  json -> ${out}`);
}

say('\n=== GATE ===');
if (consoleErrors.length) failures.unshift(`${consoleErrors.length} page error(s) — a module that threw never built its elements`);
if (failures.length) {
  say('  3D share, overlap, 44px, renderer agreement .... FAIL');
  for (const f of failures) say(`    ${f}`);
  console.error(`\n${failures.length} requirement(s) failed.`);
  process.exit(1);
}
say('  3D share, overlap, 44px, renderer agreement .... PASS');
