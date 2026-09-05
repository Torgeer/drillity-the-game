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
 *   5. clipped text        no label cut off by its own container
 *   6. the 3D's share      the two bands split 54/46 and own >= 60 % of the
 *                          stage. Rubric axis 7a, and it was measured and
 *                          PRINTED here for weeks without being gated
 *   7. chrome agreement    what the screen publishes as ctx.hud is what the
 *                          chrome actually measures
 *   8. say it once         no caption and no number-with-a-unit stated twice
 *
 * EVERY ONE OF THEM FAILS ON AN EMPTY SET. A state with no painted elements,
 * no interactive targets, no bands or no dock is a MEASUREMENT FAILURE, not a
 * clean sheet — `tools/checkreach.mjs` reported zero targets and called it a
 * pass, three times, for three different reasons.
 *
 * AND THE PROCESS EXITS NON-ZERO WHEN ANY OF THEM FAILS. It used to print
 * `<-- GATE FAIL` and exit 0, so `npm run build` never saw it. A gate that
 * cannot stop a build is a report.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENUMERATE } from './enumerate.js';
import { ensureServer } from '../tools/devserver.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
mkdirSync(HERE, { recursive: true });

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const flag = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const TAG = positional[0] || 'run';
const PORT = positional[1] || '5178';
const ONLY = (flag('only') || '').toLowerCase();
const AS_JSON = argv.includes('--json');
/* ── --remove <selector> : ISOLATION, AND IT IS NOT A PASS ────────────────
   Deletes matching nodes before every sample. It exists for one situation:
   something OUTSIDE the code under test is standing on top of it, and you
   need to know whether the thing underneath is itself correct.

   The case it was written for: main.js's `#model-error` banner is
   `position:fixed; inset:auto 0 0 0; z-index:99998` on document.body, so with
   no built .glb models it covers the entire dock and the hit test reports
   every slider, the primary action and every rail button BLOCKED — true, and
   nothing to do with the dock's own layout.

   THIS IS NOT AN EXEMPTION AND IT IS NOT DEFAULT. A run using it is stamped
   at the top of the report, in the gates block, and in the JSON, because a
   number measured with an obstacle deleted answers a different question from
   the one the gate asks. Never quote such a run as a pass. */
const REMOVE = flag('remove');

const CASES = ['rockbolt', 'driven-pile', 'rc', 'dth', 'oil-rotary'];

const VITE_STUB = `export const createHotContext = () => ({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},get data(){return{}}});
export function updateStyle(id,c){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=c;}
export function removeStyle(id){const s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(s)s.remove();}
export function injectQuery(u){return u;} export class ErrorOverlay extends HTMLElement{}`;

const measure = async (p, opts = {}) => {
  if (REMOVE) {
    await p.evaluate((sel) => {
      for (const n of document.querySelectorAll(sel)) n.remove();
    }, REMOVE).catch(() => { /* selector matched nothing this frame */ });
  }
  return p.evaluate(`(${ENUMERATE})(${JSON.stringify(opts)})`);
};

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
if (REMOVE) {
  say('###########################################################################');
  say(`##  ISOLATION RUN — "${REMOVE}" was DELETED before every sample.`);
  say('##  This measures what the code under test would do with that obstacle');
  say('##  out of the way. It does NOT measure the game as it ships, and it is');
  say('##  NOT a pass. Quote it only as "with X removed, the layout underneath');
  say('##  measures ..." — never as a gate result.');
  say('###########################################################################');
}

/* THIS HARNESS PROVIDES ITS OWN SUBJECT.
   It used to open with "needs `npm run dev` on 5178" and die on
   ERR_CONNECTION_REFUSED when it was not there — a gate with a manual
   prerequisite, which is a gate that gets skipped, which is the empty-set
   problem one level up: it passes for ever by never running. 
   was given ../tools/devserver.mjs for exactly this and the file's own header
   names this harness as the other caller. If the port already answers that
   server is used and nothing is started. */
const SERVER = await ensureServer(PORT, (s) => console.log(s));
const b = await chromium.launch({ args: ['--mute-audio'], headless: false, channel: 'chrome' });
const c = await b.newContext({
  ...devices['iPhone 13 Pro'],
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
await c.route('**/@vite/client', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: VITE_STUB }));
const p = await c.newPage();
/* Both channels are collected, and they are NOT the same finding.

   `pageerror` is an exception nobody caught: the module that threw it stopped
   where it stood, so whatever it was building does not exist and cannot be
   measured. Every count in this run is then a floor.

   A console error is what the code chose to say. In this project that is
   usually a deliberate loud failure (HANDOFF §8A asks for exactly those) and
   the caller may well have recovered — but it can equally be a caught abort,
   which is how the geology ReferenceError surfaced: main.js catches init
   failures and logs them, and the whole section band was missing behind it.

   The channel therefore cannot decide the question on its own. Both fail the
   gate; the run prints them apart and says what each one obliges the reader to
   check, rather than guessing and being confidently wrong in a new way. */
const errs = [];
const pageErrs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 180)); });
p.on('pageerror', (e) => pageErrs.push(String(e).slice(0, 180)));
/* `waitUntil: 'load'` waits on every module, font and texture, and this tree's
   dev server has answered a cold first request in 15.8 s with a dozen agents
   on the machine. Reachability and readiness are separate questions: fail fast
   and honestly on the first, then take as long as the app needs on the second.
   127.0.0.1, not localhost — `localhost` resolves to ::1 first on Windows. */
await p.goto(`${SERVER.origin}/?quality=low&shot`, { waitUntil: 'domcontentloaded', timeout: 180000 });
await p.waitForFunction(() => window.__DRILLITY?.ui?.show && window.__DRILLITY?.sim, null, { timeout: 240000 });

/* THE BOOT SCREEN IS NOT A SPLASH, IT IS A SHADER COMPILE — AND `waitForTimeout`
   HERE WAS MEASURING IT. This was `await p.waitForTimeout(2200)`, a fixed wait
   against a boot that has been measured at 10.4 s, 27.5 s and, on a loaded
   machine, 60-100 s. tools/checkreach.mjs was fixed for exactly this and this
   file kept the fault: it is the same lie in the other harness.

   It is not theoretical. `shell.js show()` stashes any scene requested while
   `bootHeld` is true into a SINGLE pendingScene slot, so a GOTO_SITE fired at
   2.2 s races the MENU that main.js asked for, and a run has already been
   caught scoring the menu screen as `rockbolt` — `wordmark` and `menu__tag`
   reported as overlaps on the site screen. The empty-set guard caught that
   one; a guard is not a reason to keep making the mistake.

   Wait for boot to actually leave, then let the first screen settle. */
const bootT0 = Date.now();
await p.waitForFunction(() => !!document.querySelector('.screens > *:not(.boot)'),
  null, { timeout: 240000 });
say(`  boot cleared after ${((Date.now() - bootT0) / 1000).toFixed(1)} s`);
await p.waitForTimeout(1200);

const json = { tag: TAG, cases: {}, nav: null };
let grew = [];

/* ═══ 1. PER-METHOD MEASUREMENT ══════════════════════════════════════════ */
if (ONLY !== 'nav') {
  for (const m of CASES) {
    await p.evaluate(GOTO_SITE, m);
    /* AND THE SCREEN IS CONFIRMED BEFORE IT IS MEASURED. `ui.show('site')` is
       a request, not an arrival: it is stashed while boot holds, and the
       enter transition takes another 440 ms after that. Every number below is
       attributed to `m` in the report, so measuring any other screen does not
       produce a gap — it produces a WRONG ROW, which is worse. Confirm, and
       say so if it never arrives rather than sampling whatever is there. */
    const arrived = await p.waitForFunction(() => {
      const live = [...document.querySelectorAll('.screens > .screen')]
        .find((n) => !n.hidden && !n.classList.contains('is-leaving')
          && !n.classList.contains('is-leaving--back'));
      return !!live && live.classList.contains('screen--site');
    }, null, { timeout: 30000 }).then(() => true, () => false);
    if (!arrived) {
      say(`
${m}`);
      say('  WRONG SCREEN  the site screen never became live  <-- GATE FAIL');
      json.cases[m] = {
        saidTwice: [], hudDrift: [], splitBad: [], clipped: [],
        nothing: [`${m}: ui.show('site') never put the site screen on screen — nothing measured`],
        painted: { max: 0, med: 0 }, overlaps: 0, overlapList: [],
        onBand3D: [], smallTargets: [], targetsSeen: [],
        split: null, bands: null, dom: {},
      };
      continue;
    }
    const S = [];
    for (let t = 0; t < 12000; t += 400) { await p.waitForTimeout(400); S.push(await measure(p)); }

    const maxOv = Math.max(...S.map((s) => s.overlaps));
    const ovDetails = [...new Set(S.flatMap((s) => s.overlapList))];
    const onBand = [...new Set(S.flatMap((s) => s.onBand3D))];
    const small = [...new Set(S.flatMap((s) => s.smallTargets))];
    const seen = [...new Set(S.flatMap((s) => s.targetList))].sort();
    const clipped = [...new Set(S.flatMap((s) => s.clipped))];
    const med = S[Math.floor(S.length / 2)];

    /* ── SAY IT ONCE, and MEASURED NOTHING ────────────────────────────────
       Taken from the MEDIAN sample, not the union of all of them: across 30
       samples a value legitimately passes through a number a neighbour is
       also showing at some other instant, and a union would report that as a
       duplicate. One settled frame is the question the rule is about. */
    const dup = (rows, keyOf) => {
      const byKey = new Map();
      for (const r of rows || []) {
        const k = keyOf(r);
        if (!byKey.has(k)) byKey.set(k, new Set());
        byKey.get(k).add(r.cls);
      }
      return [...byKey.entries()].filter(([, set]) => set.size > 1)
        .map(([k, set]) => `"${k}" on ${[...set].join(' and ')}`);
    };
    const saidTwice = [
      ...dup(med.captions, (r) => r.text),
      ...dup(med.quantities, (r) => r.key),
    ];
    /* A gate over an empty set passes for ever. Each of these is a thing the
       state MUST have for the gates above to have tested anything. */
    const nothing = [];
    if (!med.painted) nothing.push('no painted elements at all');
    if (!med.targets) nothing.push('no interactive targets — the 44px gate tested nothing');
    if (!med.split) nothing.push('no .siteband pair — the 3D share and the overlay gate tested nothing');
    if (!med.dom.dockH) nothing.push('no .sitedock');
    if (!med.dom.stripH) nothing.push('no .sstrip');
    if (!med.dom.hud) nothing.push('the screen published no ctx.hud');

    /* The published chrome against the measured chrome. `ctx.hud` is what
       core/renderer.js insets its scissored bands by, so a disagreement here
       is band drawn under opaque chrome and thrown away every frame — the
       exact defect HANDOFF §3 measured at 190-228px of the section. */
    const hudDrift = [];
    if (med.dom.hud) {
      if (Math.abs((med.dom.hud.top ?? -1) - med.dom.stripH) > 1) {
        hudDrift.push(`ctx.hud.top ${med.dom.hud.top} vs .sstrip ${med.dom.stripH}px`);
      }
      if (Math.abs((med.dom.hud.bottom ?? -1) - med.dom.dockH) > 1) {
        hudDrift.push(`ctx.hud.bottom ${med.dom.hud.bottom} vs .sitedock ${med.dom.dockH}px`);
      }
    }

    /* GAMEDESIGN §1: the bands are 54/46 of what is left after the chrome, and
       the 3D owns the stage. The floor is 60 % against the 63.0 % (67.3 % with
       no auxiliary row) this layout measures — a budget the instrument cannot
       report is not a budget (HANDOFF §9.5), so it is stated in the units this
       harness prints. The baseline that failed review had it at 26 %. */
    const SPLIT_TOL = 1.5;
    const STAGE_FLOOR = 60;
    const splitBad = [];
    if (med.split) {
      if (Math.abs(med.split.surfPct - 54) > SPLIT_TOL) splitBad.push(`surface ${med.split.surfPct}% vs 54%`);
      if (Math.abs(med.split.sectPct - 46) > SPLIT_TOL) splitBad.push(`section ${med.split.sectPct}% vs 46%`);
      if (med.split.stagePct < STAGE_FLOOR) splitBad.push(`3D is ${med.split.stagePct}% of the stage, floor ${STAGE_FLOOR}%`);
    }

    json.cases[m] = {
      saidTwice, nothing, hudDrift, splitBad,
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
    say(`  clipped     ${clipped.length}${clipped.length ? '  <-- GATE FAIL' : '  ok'}  ${clipped.slice(0, 4).join(' | ')}`);
    say(`  split       surface ${med.split?.surfPct} / section ${med.split?.sectPct}   (3D = ${med.split?.stagePct}% of stage)`
      + (splitBad.length ? '  <-- GATE FAIL' : '  ok'));
    for (const d of splitBad) say(`                ${d}`);
    say(`  chrome      .sstrip ${med.dom.stripH}px  .sitedock ${med.dom.dockH}px  ctx.hud ${JSON.stringify(med.dom.hud)}`
      + (hudDrift.length ? '  <-- GATE FAIL' : '  ok'));
    for (const d of hudDrift) say(`                ${d}`);
    say(`  said twice  ${saidTwice.length}${saidTwice.length ? '  <-- GATE FAIL' : '  ok'}`);
    for (const d of saidTwice) say(`                ${d}`);
    if (nothing.length) {
      say('  MEASURED NOTHING  <-- GATE FAIL');
      for (const d of nothing) say(`                ${d}`);
    }
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
const uniqPage = [...new Set(pageErrs)];
json.errors = uniqErrs;
json.pageErrors = uniqPage;
const nErr = uniqErrs.length + uniqPage.length;
json.removedSelector = REMOVE || null;
/* ── THE VERDICT IS NINE GATES, AND IT SETS THE EXIT CODE ─────────────────
   This block printed FIVE of the nine gates the header above promises, and
   the process exited 0 whatever any of them said.

   Four gates were therefore enforced NOWHERE: clipped text, the 3D's share,
   chrome agreement and say-it-once were computed per case, printed with
   `<-- GATE FAIL` beside them, aggregated into `json.cases[m]`, and then
   dropped. `nothing` — the empty-set guard, the one this project has paid
   three rounds for — was the fifth: collected at :212, printed at :275, and
   never once consulted by a verdict.

   And the header already claimed both fixes were in: "AND THE PROCESS EXITS
   NON-ZERO WHEN ANY OF THEM FAILS ... A gate that cannot stop a build is a
   report." It said so while the file had no `process.exit` in it at all.
   That is ASTRA §3.6 in miniature — the document and the code disagreed and
   the document was the one being believed — so the CODE changes here.

   Every gate the header names now has a line, every line feeds `failed`, and
   `failed` is the exit code. */
const anyClipped = [...new Set(Object.values(json.cases).flatMap((v) => v.clipped))];
const anySplit = [...new Set(Object.values(json.cases).flatMap((v) => v.splitBad))];
const anyHudDrift = [...new Set(Object.values(json.cases).flatMap((v) => v.hudDrift))];
const anyTwice = [...new Set(Object.values(json.cases).flatMap((v) => v.saidTwice))];
const anyNothing = [...new Set(Object.values(json.cases).flatMap((v) => v.nothing))];
/* A run that measured no CASES is the same empty set one level up: five
   methods were asked for and the loop produced nothing to score. Without this
   the `[...].reduce((a,v)=>a+v, 0)` totals above are all 0 and every gate
   below reads PASS off an empty object. */
if (!Object.keys(json.cases).length) {
  anyNothing.push(`no method case produced a measurement at all (asked for: ${CASES.join(', ')})`);
}

const failed = [];
const gate = (label, ok, detail) => {
  say(`  ${label.padEnd(25, '.')} ${ok ? 'PASS' : 'FAIL' + (detail ? ' (' + detail + ')' : '')}`);
  if (!ok) failed.push(label.trim());
};

say('\n=== GATES ===');
if (REMOVE) {
  say(`  !!  ISOLATION RUN — "${REMOVE}" was deleted before every sample.`);
  say('  !!  Nothing below is a gate result. See the banner at the top.');
}
gate('build is clean ', nErr === 0, String(nErr));
gate('overlaps (enumerated) ', anyOv === 0, String(anyOv));
gate('nothing over the 3D ', anyBand === 0, String(anyBand));
gate('touch targets >= 44px ', anySmall.length === 0, anySmall.join(', '));
gate('no navigation growth ', grew.length === 0);
gate('no clipped text ', anyClipped.length === 0, anyClipped.slice(0, 3).join(' | '));
gate("the 3D's share ", anySplit.length === 0, anySplit.slice(0, 3).join(' | '));
gate('chrome agreement ', anyHudDrift.length === 0, anyHudDrift.slice(0, 3).join(' | '));
gate('said once ', anyTwice.length === 0, anyTwice.slice(0, 3).join(' | '));
gate('measured something ', anyNothing.length === 0, anyNothing.slice(0, 3).join(' | '));

/* ── A THROWN MODULE INVALIDATES EVERY OTHER NUMBER ABOVE ─────────────────
   This used to be a footnote printed under the verdict, and that is how a run
   with `ReferenceError: boreExag is not defined` killing world/geology.js
   still printed "overlaps PASS" on all five methods: the section never built,
   so most of the dock had nothing to draw and nothing to overlap. An element
   that was never created cannot be measured, and an instrument that scores it
   as absent is reporting a pass it did not earn.

   So an error is a gate of its own, and it is stated FIRST and LAST.

   The two channels are reported apart because they oblige different checks,
   and saying "a module threw" over a recovered asset warning would be a new
   way of being confidently wrong. Neither is excused: both fail the gate. */
if (uniqPage.length) {
  say('\n!!  MEASUREMENT NOT VALID  !!');
  say('    An exception went uncaught. The module that threw it stopped where it');
  say('    stood, so whatever it was building does not exist and was not measured.');
  say('    Every count above is a floor. Fix these and re-run before believing any');
  say('    number in this report:');
  for (const e of uniqPage.slice(0, 10)) say('      ' + e.replace(/\n\s*/g, ' ').slice(0, 150));
}
if (uniqErrs.length) {
  say('\n!!  ERRORS WERE LOGGED — ACCOUNT FOR EACH ONE  !!');
  say('    These were caught and printed, so the caller MAY have recovered — a');
  say('    deliberate loud failure (HANDOFF §8A) reads exactly like this. It may');
  say('    equally be a caught abort: `[init] geology ReferenceError` was logged');
  say('    this way while the entire section band was missing behind it. The');
  say('    counts above stand only for the parts you have confirmed still built:');
  for (const e of uniqErrs.slice(0, 10)) say('      ' + e.replace(/\n\s*/g, ' ').slice(0, 150));
}
if (!uniqErrs.length && !uniqPage.length) {
  say('\nno errors on either channel — the counts above are measurements, not floors');
}

/* ── AND THE EXIT CODE ────────────────────────────────────────────────────
   An isolation run is never a pass, whatever it printed: `--remove` deletes
   the very element the gate is about, so its clean sheet was bought by taking
   the subject away. The file says so at :70 in words; it now says so in the
   exit code too, because a sentence in a banner does not stop a build.

   `process.exitCode`, not `process.exit()`: the report has to be written and
   the browser closed first, and `exit()` here would truncate both. */
if (REMOVE) {
  say(`\nISOLATION RUN — exiting 2. "${REMOVE}" was removed, so nothing above is a gate result.`);
  process.exitCode = 2;
} else if (failed.length) {
  say(`\n${failed.length} GATE(S) FAILED: ${failed.join(', ')}`);
  process.exitCode = 1;
} else {
  say('\nall gates pass');
}

json.gatesFailed = failed;
writeFileSync(resolve(HERE, `${TAG}-report.txt`), out.join('\n'), 'utf8');
if (AS_JSON) writeFileSync(resolve(HERE, `${TAG}-report.json`), JSON.stringify(json, null, 2), 'utf8');
await b.close();
SERVER.stop();
