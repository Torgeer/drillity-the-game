/**
 * THE RESULTS SCREEN — the "no false number" gate, measured.
 *
 * ── WHY THIS FILE EXISTS ───────────────────────────────────────────────────
 * The DOM harness in ./measure.mjs answers "does anything overlap". It cannot
 * answer "is what it says true", and the results screen failed review on the
 * second question, not the first: `SCORE 51 % · grade B` when B starts at 62,
 * and `SPEED 18 %` on a run that beat its own nominal rate. Both were rendered
 * perfectly. A layout harness would pass that shot for ever.
 *
 * So this reads the finished screen and checks every number on it against the
 * payload that produced it, against the settlement the game actually booked,
 * and against the sim's own tables — never against a copy kept here.
 *
 *   node .hudqa/results.mjs [port]
 *
 * HEADED, like measure.mjs — the game must reach a steady state, and headless
 * cannot bind the discrete GPU on this machine. It starts its own vite when
 * nothing answers on the port (tools/devserver.mjs), because a gate with a
 * manual prerequisite is a gate that gets skipped, and a skipped gate is the
 * empty-set problem one level up: it passes for ever by never running.
 *
 * ── WHAT THIS ROUND FIXED, AND WHY EACH ONE MATTERED ───────────────────────
 *
 * 1. IT WAS READING THE WRONG ELEMENT. The verdict was fetched with
 *    `querySelector('.results__eyebrow')` — and ui/screens/results.js gives
 *    that class to BOTH the contract sub-line and the verdict line.
 *    `querySelector` returns the FIRST match, so this harness read
 *    "Nordic Forest · Overburden / Duplex Drilling" and printed it as the
 *    verdict; the consistency check survived only through a regex that went
 *    hunting for a score anywhere on the screen. That is the same
 *    querySelector-returns-the-first-match bug that had `tools/checkreach.mjs`
 *    measuring a hidden boot screen and calling it a PASS. The verdict is now
 *    addressed STRUCTURALLY — the eyebrow that FOLLOWS `.results__title`, the
 *    sub-line being the one before it — and finding anything other than
 *    exactly one on each side is a GATE FAILURE, not a silent fall-through to
 *    a regex.
 *
 * 2. THE GRADE BANDS WERE A THIRD HAND-COPY. `[['S',0.90],['A',0.78],...]`
 *    was written out here as well as in `sim/drilling.js` (TUNING.score.grades)
 *    and in `ui/screens/results.js` (its own GRADE_BANDS). Three copies of one
 *    table, and the instrument was one of them — so it could not possibly
 *    detect the drift it exists to catch. Both other copies are now MEASURED,
 *    not trusted:
 *      · the sim's live table is read off the RUNNING page at
 *        `window.__DRILLITY.sim.debug.tuning.score.grades`, and failing to
 *        read it fails the run rather than falling back to a local copy;
 *      · the screen's private copy is read out of the screen's own rendering.
 *        It prints "B starts at 62%" from its GRADE_BANDS, and that sentence
 *        is compared with the sim's table. That is the drift detector this
 *        file could never be while it held a copy of its own.
 *    CROSS-FILE, still open: `sim/drilling.js` should publish the bands on the
 *    HOLE_COMPLETE payload so `ui/screens/results.js` can delete its table —
 *    the comment above its GRADE_BANDS asks for exactly that. Until it does,
 *    this gate is what stands in for it.
 *
 * 3. THE MONEY HALF OF THE SCREEN WAS OUTSIDE THE GATE. Gross payout, running
 *    costs, net paid, every itemised cost row, "h booked", the "grade C"
 *    caption and the XP figure were rendered and never asserted — on a screen
 *    whose deleted else-branch used to invoice the player from NINE INVENTED
 *    CONSTANTS. Every one of those figures is now compared with the settlement
 *    `game/progression.js` actually pushed onto the career ledger, formatted
 *    through the game's OWN `fmtMoney`, imported live out of the module cache
 *    at /src/core/contract.js. The comparison is therefore an exact string
 *    match, with nothing parsed, rounded or given a tolerance at this end —
 *    "€15.7k" parsed back into a number here would be an approximation inside
 *    an instrument, which is ASTRA §5 and how a false finding gets into a
 *    report.
 *
 * 4. AND THE EMPTY SET IS A FAILURE EVERYWHERE. No case, no live screen, no
 *    stamp, no criterion tile, no ledger row, no settlement where one was
 *    driven — each is a FAIL, never a clean sheet. "A gate over an empty set
 *    passes forever" is this project's most expensive recurring bug.
 *
 * ── THE THREE CASES, AND WHY THEY RUN IN THIS ORDER ────────────────────────
 *   1. THE QA BRIDGE (`__qa.showResults()`). Its breakdown is FLAT and shares
 *      no key with the real one, so NOTHING is published: every criterion must
 *      read '—'. It also settles nothing, so no figure may appear anywhere in
 *      the money block — this is the regression guard on the invented invoice.
 *   2. A REAL SIM-SHAPED PAYLOAD, hand-written. Everything published, so every
 *      criterion must carry a number: refusing to print what the sim DID
 *      publish is the same defect facing the other way, and a screen that only
 *      ever printed '—' would pass case 1 for the wrong reason. It settles, so
 *      the whole money block is asserted against the ledger.
 *   3. A CONTRACT GENERATED BY game/data.js, priced by the real economy. Case
 *      2's money is only as real as its hand-written contract literal; this
 *      one settles content the game authored itself.
 *
 *   THE ORDER IS LOAD-BEARING, both ways round.
 *   · `progression.completeHole()` resolves the hole's contract as
 *     `run?.contract || payload.contract || state.contract`, so an OPEN RUN
 *     WINS over the payload. Run case 3 first and case 2's contract is
 *     ignored, case 2 settles against the wrong job, and the screen's
 *     contract-id guard then shows it no money at all. Case 2's contract
 *     carries `holes: 1`, so it closes its own run and hands case 3 a clean
 *     slate.
 *   · Case 1 must come first for the opposite reason: its payload carries no
 *     contract, so with a settlement already on the ledger it falls straight
 *     through `lastSettlement()`'s id guard (`if (contractId && s.contractId
 *     && ...)`) and only the ±5 % depth guard is left between it and the
 *     PREVIOUS hole's money. Run it last and it can show a settlement it never
 *     had — which is the very thing case 1 exists to prove cannot happen.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureServer } from '../tools/devserver.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = process.argv[2] || '5178';

const VITE_STUB = `export const createHotContext = () => ({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},get data(){return{}}});
export function updateStyle(id,c){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=c;}
export function removeStyle(id){const s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(s)s.remove();}
export function injectQuery(u){return u;} export class ErrorOverlay extends HTMLElement{}`;

/**
 * Read the finished screen — the stamp, the verdict, the four criteria and the
 * whole money block — plus, from the SAME sample, what the game's own ledger
 * and formatter say those money figures ought to read.
 *
 * The expectations are built HERE, in the page, deliberately. `fmtMoney` is
 * imported live from /src/core/contract.js — the very function the screen used
 * to draw the figures, out of the module cache — so the check in node is an
 * exact string comparison against the game's own arithmetic and its own
 * formatting. See point 3 in the header for why parsing them back would not do.
 */
const READ = async () => {
  const live = [...document.querySelectorAll('.screens > .screen')]
    .find((n) => !n.hidden && !n.classList.contains('is-leaving'));
  if (!live) return { error: 'no live screen' };
  const txt = (el) => (el ? (el.textContent || '').trim() : null);

  /* ── THE VERDICT, ADDRESSED UNAMBIGUOUSLY ────────────────────────────────
     `.results__eyebrow` is worn by TWO nodes: the contract sub-line above the
     stamp and the verdict line below it. `querySelector` silently returns the
     first, which is how this harness spent weeks printing the region name as
     the verdict. `.results__title` sits between them, so document order is the
     discriminator — and anything other than exactly one on each side is
     REPORTED, not resolved by picking one. An instrument that guesses which of
     two identical selectors it wanted is the allowlist problem wearing a
     different coat. */
  const titleEl = live.querySelector('.results__title');
  const eyebrows = [...live.querySelectorAll('.results__eyebrow')];
  let verdict = null;
  let sub = null;
  let verdictError = null;
  if (!titleEl) {
    verdictError = 'no .results__title on the screen — the verdict line cannot be told from the contract sub-line';
  } else {
    const after = eyebrows.filter((e) => (titleEl.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
    const before = eyebrows.filter((e) => (titleEl.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING) !== 0);
    if (after.length !== 1 || before.length !== 1) {
      verdictError = `${eyebrows.length} .results__eyebrow node(s): ${before.length} before .results__title and `
        + `${after.length} after — expected exactly one of each, so the verdict cannot be addressed`;
    } else {
      sub = txt(before[0]);
      verdict = txt(after[0]);
    }
  }

  /* The four criterion tiles, found by their own label text rather than by a
     selector list — a tile renamed tomorrow is still read tomorrow. */
  const crits = {};
  for (const tile of live.querySelectorAll('.rmetric')) {
    const k = txt(tile.querySelector('.rmetric__k'));
    const v = txt(tile.querySelector('.rmetric__v'));
    if (!k) continue;
    const key = k.toLowerCase();
    if (['speed', 'straightness', 'tool care', 'safety'].includes(key)) {
      crits[key] = { value: v, unmeasured: tile.classList.contains('is-unmeasured') };
    }
  }

  /* ── THE MONEY BLOCK ─────────────────────────────────────────────────────
     Addressed structurally, never by its captions: the itemised rows carry
     `.ritem--sub`, the net row `.ritem--total`, and of the two plain rows left
     the gross payout is the one whose figure is marked `.is-pos`. A caption is
     content and content is allowed to change; the shape is the contract. */
  const rowOf = (r) => ({
    cls: r.className,
    n: txt(r.querySelector('.ritem__n')),
    q: txt(r.querySelector('.ritem__q')),
    c: txt(r.querySelector('.ritem__c')),
  });
  const allRows = [...live.querySelectorAll('.ritem')];
  const subRows = allRows.filter((r) => r.classList.contains('ritem--sub'));
  const totalRows = allRows.filter((r) => r.classList.contains('ritem--total'));
  const plain = allRows.filter((r) => !r.classList.contains('ritem--sub') && !r.classList.contains('ritem--total'));
  const grossRows = plain.filter((r) => r.querySelector('.ritem__c.is-pos'));
  const subtotalRows = plain.filter((r) => !r.querySelector('.ritem__c.is-pos'));

  const money = {
    headline: txt(live.querySelector('.rmoney__v')),
    headlineKey: txt(live.querySelector('.rmoney__k')),
    rows: allRows.length,
    subRows: subRows.map(rowOf),
    subtotal: subtotalRows.length === 1 ? rowOf(subtotalRows[0]) : null,
    gross: grossRows.length === 1 ? rowOf(grossRows[0]) : null,
    net: totalRows.length === 1 ? rowOf(totalRows[0]) : null,
    shapeError: allRows.length === 0 ? null
      : (subtotalRows.length !== 1 || grossRows.length !== 1 || totalRows.length !== 1)
        ? `ledger shape: ${subRows.length} .ritem--sub, ${subtotalRows.length} subtotal, `
          + `${grossRows.length} gross (.is-pos), ${totalRows.length} .ritem--total`
        : null,
  };

  const xpLabels = [...live.querySelectorAll('.rxp__head .label')].map((e) => e.textContent.trim());

  /* ── WHAT THE GAME ITSELF BOOKED ─────────────────────────────────────────
     ui/screens/results.js states its own rule at the top of the file: "THE
     MONEY SHOWN IS THE MONEY PAID ... This screen reads that settlement
     instead of doing its own arithmetic, so the headline number is the
     transaction and not an estimate of it." This is that rule, measured. */
  const led = window.__DRILLITY?.state?.player?.career?.ledger?.[0] ?? null;
  const ledgerLen = window.__DRILLITY?.state?.player?.career?.ledger?.length ?? null;
  let fmtErr = null;
  let expect = null;
  if (led) {
    let fmtMoney = null;
    try { ({ fmtMoney } = await import('/src/core/contract.js')); } catch (e) { fmtErr = String((e && e.message) || e); }
    if (typeof fmtMoney !== 'function') {
      fmtErr = fmtErr || 'fmtMoney is not exported from /src/core/contract.js';
    } else {
      /* The cost keys come from the SETTLEMENT, not from a table copied out of
         ui/screens/results.js. Copying its COST_LINES here would be defect A2
         all over again, one file down. `total` is the sum, not a line. */
      const costs = led.costs || {};
      const keys = Object.keys(costs).filter((k) => k !== 'total');
      const totalCost = Math.round(costs.total || 0);
      const lines = keys.map((k) => Math.round(costs[k] || 0)).filter((v) => v > 0);
      const shown = lines.reduce((a, v) => a + v, 0);
      /* Each line is rounded on its own, so the visible rows can miss the
         subtotal by a euro or two; the screen carries that remainder as one
         further row rather than leaving the reader to notice. Reproduce it
         from the settlement so the row COUNT and the row VALUES both check. */
      const rest = totalCost - shown;
      /* THE SIGN IS PART OF THE NUMBER, not a prefix on it — the screen was
         fixed to render it that way and this expectation has to agree, or the
         gate reports a defect that has been repaired. `'−' + fmtMoney(-1)`
         yields "−€-1", which is what the screen used to print and what this
         used to demand of it. The eleven cost lines are rounded
         independently, so the "Other running costs" remainder carries their
         accumulated drift and goes both ways; a negative remainder is money
         coming BACK and prints with a plus. */
      const signed = (v) => (v < 0 ? '+' + fmtMoney(-v) : '−' + fmtMoney(v));
      const subCosts = lines.map(signed);
      if (rest !== 0) subCosts.push(signed(rest));
      expect = {
        contractId: led.contractId ?? null,
        grade: led.grade ?? null,
        depth: led.depth ?? null,
        headline: fmtMoney(Math.round(led.net)),
        net: fmtMoney(Math.round(led.net)),
        gross: fmtMoney(Math.round(led.revenue)),
        subtotal: '−' + fmtMoney(totalCost),
        subCosts,
        hours: Number.isFinite(led.hours) && led.hours > 0 ? `${led.hours.toFixed(1)} h booked` : '',
        xp: `+${Math.round(led.xp || 0)} XP`,
        grossCaption: led.grade ? `grade ${led.grade}` : 'ungraded',
        rest,
      };
    }
  }

  return {
    screen: live.className,
    isResults: live.classList.contains('screen--results'),
    grade: txt(live.querySelector('.grade__l')),
    verdict, sub, verdictError,
    eyebrows: eyebrows.map((e) => e.textContent.trim()),
    critTiles: live.querySelectorAll('.rmetric').length,
    crits,
    money, xpLabels,
    ledgerLen, expect, fmtErr,
    ledgerHead: led ? {
      contractId: led.contractId, grade: led.grade, depth: led.depth,
      net: led.net, revenue: led.revenue, costsTotal: led.costs?.total ?? null,
      xp: led.xp, hours: led.hours,
    } : null,
  };
};

/** A full, real-shaped sim payload: every criterion published. */
const REAL = {
  depth: 28.5, timeSec: 12360, grade: 'C',
  methodId: 'overburden', bitId: null,
  bitWear: 0.41, bitWearBook: 0.41, bitBearing: 0.05,
  contract: {
    id: 'qa-results', title: 'QA', client: 'QA', regionId: 'nordic',
    methodId: 'overburden', applicationId: 'site-investigation',
    targetDepth: 28.5, holeDia: 152, holes: 1, payout: 9000, seed: 7,
  },
  breakdown: {
    grade: 'C', total: 0.5312,
    weights: { time: 0.24, groove: 0.26, bit: 0.14, straight: 0.14, hazard: 0.12, safety: 0.10, quality: 0 },
    quality: null,
    time: { parSec: 10600, actualSec: 12360, score: 0.668 },
    groove: { uptime01: 0.63, bestCombo: 1.74, score: 0.63 },
    bit: { consumed01: 0.41, bitsUsed: 0, endWear: 0.41, score: 0.59 },
    straightness: { deviation: 0.26, score: 0.978 },
    hazards: { seen: 3, clean: 2, log: [], score: 0.667 },
    safety: { events: 1, jams: 1, score: 0.55 },
    rods: { added: 9, perfect: 6 },
    well: null,
  },
};

/* The breakdown case 3 puts on whatever contract game/data.js generates. Its
   `total` is the only number the screen may derive the letter from, and it is
   deliberately in a DIFFERENT band from case 2's, so the two cases cannot both
   be satisfied by one hard-coded letter. */
const GENERATED_BREAKDOWN = {
  grade: 'B', total: 0.7100,
  weights: { time: 0.24, groove: 0.26, bit: 0.14, straight: 0.14, hazard: 0.12, safety: 0.10, quality: 0 },
  quality: null,
  time: { parSec: 8600, actualSec: 9000, score: 0.72 },
  groove: { uptime01: 0.71, bestCombo: 1.90, score: 0.71 },
  bit: { consumed01: 0.33, bitsUsed: 0, endWear: 0.33, score: 0.67 },
  straightness: { deviation: 0.18, score: 0.90 },
  hazards: { seen: 2, clean: 2, log: [], score: 1 },
  safety: { events: 0, jams: 0, score: 1 },
  rods: { added: 7, perfect: 6 },
  well: null,
};

const out = [];
const say = (s = '') => { out.push(s); console.log(s); };

/* Every finding lands in a named bucket and every bucket is a gate at the
   bottom. Nothing is printed with `<-- GATE FAIL` beside it and then dropped:
   that is what measure.mjs was doing to four of its nine gates, and a gate
   that is computed, printed and forgotten is enforced nowhere. */
const F = {
  nothing: [], bands: [], addressing: [], invented: [], withheld: [],
  letter: [], drift: [], phantom: [], money: [], ledger: [],
};

const srv = await ensureServer(PORT, say);

const errs = [];
const warns = [];
const b = await chromium.launch({ args: ['--mute-audio'], headless: false, channel: 'chrome' });
const c = await b.newContext({
  ...devices['iPhone 13 Pro'],
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
await c.route('**/@vite/client', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: VITE_STUB }));
const p = await c.newPage();
p.on('console', (m) => {
  const t = m.text().slice(0, 220);
  if (m.type() === 'error') errs.push(t);
  else if (m.type() === 'warning') warns.push(t);
});
p.on('pageerror', (e) => { errs.push('UNCAUGHT ' + String((e && e.message) || e).slice(0, 220)); });

/* The dev server is shared with whoever else is working, and their saves fire
   HMR page reloads that abort a navigation in flight — five modules were being
   saved a minute while this was being written.

   `waitUntil: 'commit'` rather than 'load' on purpose: this probe does not care
   when the last sub-resource arrives, it cares that the game is ready, and the
   two readiness waits below ask that question directly. Waiting for 'load' only
   added a second thing that could be interrupted. Retries cover the reloads
   that land mid-navigation. */
for (let attempt = 1; ; attempt++) {
  try {
    await p.goto(`http://127.0.0.1:${PORT}/?quality=low&shot`, { waitUntil: 'commit', timeout: 180000 });
    break;
  } catch (e) {
    if (attempt >= 6) throw e;
    console.log(`  (navigation interrupted — attempt ${attempt}, retrying)`);
    await p.waitForTimeout(2000);
  }
}
await p.waitForFunction(() => window.__DRILLITY?.ui?.show && window.__DRILLITY?.sim, null, { timeout: 240000 });
/* WAIT FOR BOOT TO LET GO, do not sleep past it.
   ui/shell.js holds every `show()` while the boot screen is up and replays the
   last one from `releaseBoot()` on a 420 ms timer — and if nothing was
   requested it replays the MENU. Driving the game during that window meant the
   results screen appeared and was then thrown back to the menu 400 ms later
   (`is-entering--back`, which is what gave it away), so the probe read an empty
   screen and scored it "no criterion carries a number" — a PASS on the
   nothing-invented check, by accident. The boot node going hidden is the real
   signal that the shell is taking instructions. */
await p.waitForFunction(() => {
  const boot = document.querySelector('.screen--boot');
  return !!boot && boot.hidden;
}, null, { timeout: 45000 });
await p.waitForTimeout(1200);

/* ═══ THE SIM'S OWN GRADE TABLE ═══════════════════════════════════════════
   Read off the RUNNING sim — `TUNING.score.grades`, reached through the live
   instance's `debug.tuning`. There is deliberately NO local copy to fall back
   to: a fallback here would put a fourth transcription of the table in the one
   place whose whole job is to catch transcription drift. If it cannot be read,
   the run fails and says why. */
say('\n=== the sim\'s own grade bands ===');
const bandRead = await p.evaluate(() => {
  const g = window.__DRILLITY?.sim?.debug?.tuning?.score?.grades;
  if (!Array.isArray(g) || !g.length) {
    return { error: 'window.__DRILLITY.sim.debug.tuning.score.grades is not a non-empty array (got ' + (typeof g) + ')' };
  }
  const bad = g.find((row) => !Array.isArray(row) || typeof row[0] !== 'string' || typeof row[1] !== 'number');
  if (bad) return { error: 'the sim\'s grades table is not [[letter, threshold], ...]: ' + JSON.stringify(bad) };
  return { grades: g.map(([l, t]) => [l, t]) };
});
let BANDS = null;
if (bandRead.error) {
  F.bands.push(`could not read the sim's own grade bands — ${bandRead.error}`);
  say(`  FAILED — ${bandRead.error}`);
  say('  Nothing below is scored against a local copy of the table. Every band-derived');
  say('  gate fails with this one, because a local copy is exactly what this gate exists');
  say('  to catch, and an instrument that keeps one can never see the drift.');
} else {
  BANDS = bandRead.grades;
  say(`  window.__DRILLITY.sim.debug.tuning.score.grades = ${JSON.stringify(BANDS)}`);
  const descending = BANDS.every((row, i) => i === 0 || row[1] <= BANDS[i - 1][1]);
  if (!descending) F.bands.push(`the sim's grade table is not ordered highest-first: ${JSON.stringify(BANDS)}`);
  if (BANDS[BANDS.length - 1][1] !== 0) {
    F.bands.push(`the sim's lowest band starts at ${BANDS[BANDS.length - 1][1]}, not 0 — some scores fall in no band at all`);
  }
}
const bandFor = (v) => (BANDS ? (BANDS.find(([, thr]) => v >= thr) || BANDS[BANDS.length - 1])[0] : null);
const thresholdOf = (letter) => { const r = BANDS && BANDS.find(([g]) => g === letter); return r ? r[1] : null; };

/**
 * Run the staged reveal to the end, then read.
 *
 * WAITS FOR THE SCREEN, does not sleep at it. A fixed 4.2 s pause read an
 * empty screen whenever the machine was busy, and an empty read scores as
 * "no criterion carries a number" — which is what a PASS looks like on the
 * nothing-invented check. A timing flake that fakes a pass is the whole
 * failure mode this project keeps paying for, so the wait is on the thing
 * itself: the results screen live, and its stamp filled in by the timeline.
 */
async function render(drive, tag) {
  await p.evaluate(() => window.__DRILLITY.ui.show('menu'));
  await p.waitForTimeout(500);
  await drive();
  await p.waitForFunction(() => {
    const live = [...document.querySelectorAll('.screens > .screen')]
      .find((n) => !n.hidden && !n.classList.contains('is-leaving'));
    if (!live || !live.classList.contains('screen--results')) return false;
    const stamp = live.querySelector('.grade__l');
    return !!(stamp && (stamp.textContent || '').trim())
      && live.querySelectorAll('.rmetric').length > 0;
  }, null, { timeout: 25000 });
  await p.waitForTimeout(3600);          // let the reveal timeline finish
  const read = await p.evaluate(READ);
  await p.screenshot({ path: resolve(HERE, `results-${tag}.png`) });
  return read;
}

const CRIT_KEYS = ['speed', 'straightness', 'tool care', 'safety'];
const cases = [];

/** Everything that must hold on ANY results screen, whatever drove it. */
function checkFrame(r, tag, expectedPct) {
  say(`  live screen ${r.screen || '(none)'}`);
  if (r.error) { F.nothing.push(`${tag}: ${r.error}`); return; }
  if (!r.isResults) F.nothing.push(`${tag}: the live screen is "${r.screen}", not the results screen`);
  say(`  stamp       ${r.grade || '(none)'}`);
  if (!r.grade) F.nothing.push(`${tag}: no grade stamp rendered`);
  say(`  eyebrows    ${JSON.stringify(r.eyebrows)}`);
  if (r.verdictError) {
    F.addressing.push(`${tag}: ${r.verdictError}`);
    say(`  verdict     UNADDRESSABLE — ${r.verdictError}`);
  } else {
    say(`  sub         ${r.sub}`);
    say(`  verdict     ${r.verdict}`);
  }
  if (r.critTiles === 0) F.nothing.push(`${tag}: no .rmetric tiles on the screen at all`);
  const missing = CRIT_KEYS.filter((k) => !r.crits[k]);
  if (missing.length) F.nothing.push(`${tag}: criterion tile(s) missing entirely: ${missing.join(', ')}`);
  for (const k of CRIT_KEYS) {
    const t = r.crits[k];
    say(`  ${k.padEnd(13)} ${t ? t.value : '(tile missing)'}${t && t.unmeasured ? '   [marked unmeasured]' : ''}`);
  }

  if (r.verdictError || !r.verdict) return;

  /* ── THE LETTER AND THE PERCENTAGE MUST AGREE, on the SIM's table ─────── */
  const m = /score\s+(\d+)\s*%/i.exec(r.verdict);
  if (!m) {
    say('  consistency the verdict quotes no score — nothing to contradict');
    if (expectedPct !== null) {
      F.nothing.push(`${tag}: the payload published a composite (${expectedPct} %) and the verdict line quotes no score at all`);
    }
    return;
  }
  if (expectedPct !== null && Number(m[1]) !== expectedPct) {
    F.letter.push(`${tag}: the payload's breakdown.total is ${expectedPct} % and the screen printed ${m[1]} %`);
  }
  if (!BANDS) { say('  consistency not checked — the sim\'s own bands could not be read'); return; }
  const pct = Number(m[1]);
  const should = bandFor(pct / 100);
  say(`  consistency score ${pct} % is band ${should} on the sim's table; stamp says ${r.grade}`);
  if (should !== r.grade) {
    F.letter.push(`${tag}: the frame refutes itself — score ${pct} % is band ${should} but the stamp reads ${r.grade}`);
  }

  /* ── THE DRIFT DETECTOR ───────────────────────────────────────────────
     "B starts at 62%" is ui/screens/results.js reading out its OWN private
     GRADE_BANDS. Comparing that sentence with the sim's live table checks the
     two copies against each other from outside both — which is the only place
     this file can stand now that it no longer keeps a third. */
  const nm = /\b([A-Z])\s+starts\s+at\s+(\d+)\s*%/.exec(r.verdict);
  if (!nm) {
    if (!/top grade/i.test(r.verdict) && r.grade !== BANDS[0][0]) {
      F.drift.push(`${tag}: the verdict quotes a score but names neither the next grade nor its threshold, `
        + `so the screen's own band table is unreadable from outside and cannot be checked: "${r.verdict}"`);
    }
    return;
  }
  const letter = nm[1];
  const printedThr = Number(nm[2]);
  const simThr = thresholdOf(letter);
  if (simThr === null) {
    F.drift.push(`${tag}: the screen names a grade "${letter}" that is not in the sim's table (${BANDS.map(([g]) => g).join(', ')})`);
  } else if (Math.round(simThr * 100) !== printedThr) {
    F.drift.push(`${tag}: the screen says ${letter} starts at ${printedThr} %; sim/drilling.js TUNING.score.grades `
      + `says ${Math.round(simThr * 100)} % — ui/screens/results.js GRADE_BANDS has drifted from the sim`);
  } else {
    say(`  bands       screen says ${letter} starts at ${printedThr} %, and the sim's table agrees   ok`);
  }
  const idx = BANDS.findIndex(([g]) => g === r.grade);
  const nextUp = idx > 0 ? BANDS[idx - 1][0] : null;
  if (nextUp && nextUp !== letter) {
    F.drift.push(`${tag}: the stamp is ${r.grade}, so the next grade up is ${nextUp} on the sim's table — the screen names ${letter}`);
  }
}

/** The money half, asserted line by line against the settlement actually booked. */
function checkMoney(r, tag, wantContractId) {
  const M = r.money;
  say(`  headline    ${M.headline}   (${M.headlineKey})`);
  say(`  ledger      ${M.rows} row(s), ${M.subRows.length} itemised`);
  if (M.shapeError) { F.ledger.push(`${tag}: ${M.shapeError}`); say(`  SHAPE       ${M.shapeError}`); }
  if (r.fmtErr) {
    F.money.push(`${tag}: the game's own fmtMoney could not be imported (${r.fmtErr}) — `
      + 'the printed figures cannot be traced back to the settlement, so nothing here is checked');
  }

  if (!r.ledgerHead) {
    F.money.push(`${tag}: NOTHING WAS SETTLED — game/progression.js pushed no entry onto the career ledger, `
      + 'so every figure in the money block was rendered from nothing and there is nothing to check it against');
    return;
  }
  if (wantContractId && r.ledgerHead.contractId !== wantContractId) {
    F.money.push(`${tag}: the ledger head is contract "${r.ledgerHead.contractId}", not "${wantContractId}" — `
      + 'the screen is showing an EARLIER hole\'s money, which is the stale-settlement bug lastSettlement() guards against');
    return;
  }
  if (!r.expect) { F.money.push(`${tag}: the expected figures could not be built from the settlement`); return; }
  const E = r.expect;
  say(`  settlement  contract ${E.contractId} · grade ${E.grade} · net ${E.net} · gross ${E.gross} · ${E.hours || '(no hours)'} · ${E.xp}`);

  const eq = (what, got, want) => {
    say(`  ${what.padEnd(11)} ${String(got)}${got === want ? '' : `   <-- the settlement says ${want}`}`);
    if (got !== want) F.money.push(`${tag}: ${what} reads "${got}"; the settlement says "${want}"`);
  };

  /* A dash or a €0 under "Net paid" is the unsettled fallback showing through
     on a hole that WAS settled — false either way round. */
  if (M.headlineKey && /not settled/i.test(M.headlineKey)) {
    F.money.push(`${tag}: the hole was settled (ledger entry ${E.contractId}) and the headline still reads "${M.headlineKey}"`);
  }
  eq('headline', M.headline, E.headline);

  if (M.net) {
    eq('net paid', M.net.c, E.net);
    eq('h booked', M.net.q, E.hours);
    if (!E.hours) F.money.push(`${tag}: the settlement booked ${r.ledgerHead.hours} h and the screen has no hours to state`);
  } else F.ledger.push(`${tag}: no .ritem--total row — the net paid line was never rendered`);

  if (M.gross) {
    eq('gross', M.gross.c, E.gross);
    eq('paid grade', M.gross.q, E.grossCaption);
    if (M.gross.q === 'ungraded') {
      F.money.push(`${tag}: the gross payout is captioned "ungraded" although the settlement priced it at grade ${E.grade}`);
    }
  } else F.ledger.push(`${tag}: no gross payout row (a plain .ritem whose .ritem__c carries .is-pos)`);

  if (M.subtotal) {
    eq('costs', M.subtotal.c, E.subtotal);
    eq('lines', M.subtotal.q, `${E.subCosts.length} line${E.subCosts.length === 1 ? '' : 's'}`);
  } else F.ledger.push(`${tag}: no running-costs subtotal row`);

  /* ── THE ITEMISED ROWS ────────────────────────────────────────────────
     Compared as a MULTISET against the settlement's own cost keys — never
     against a copy of ui/screens/results.js's COST_LINES, which would be the
     duplication this file was rewritten to stop committing. */
  if (!M.subRows.length) {
    F.ledger.push(`${tag}: the settlement itemises ${E.subCosts.length} cost line(s) and the screen rendered NONE`);
  } else {
    const got = M.subRows.map((x) => x.c).sort();
    const want = [...E.subCosts].sort();
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      F.ledger.push(`${tag}: the itemised cost rows do not match the settlement.\n`
        + `             screen:     ${got.join('  ')}\n`
        + `             settlement: ${want.join('  ')}`);
    } else {
      say(`  itemised    ${got.length} row(s), every one equal to its settled cost   ok`);
    }
    for (const row of M.subRows) {
      /* A NUMBER WITH TWO SIGNS ON IT. This caught the real thing: the screen
         printed each row as `'−' + fmtMoney(cost)`, so a negative cost came
         out as "−€-1". The screen now carries the sign inside the number, so
         what must never appear again is a minus glued to a signed figure —
         not a leading plus, which is how money coming back is stated. */
      if (/[−-]\s*€\s*-/.test(row.c || '')) {
        F.ledger.push(`${tag}: cost row "${row.n}" prints ${row.c} — two signs on one number`);
      }
      if (/^[+−]?€0$/.test((row.c || '').trim())) {
        F.ledger.push(`${tag}: cost row "${row.n}" prints ${row.c} — a line item that cost nothing is not a line item`);
      }
    }
  }

  /* THE ARITHMETIC THE PLAYER CAN DO IN THE FRAME MUST HOLD. Gross, running
     costs and net are all printed within a few pixels of each other, so a
     settlement whose own three figures do not subtract puts a self-refuting
     invoice on screen — the money-side twin of `SCORE 51 % · grade B`. */
  const gross = Math.round(r.ledgerHead.revenue);
  const costTotal = Math.round(r.ledgerHead.costsTotal || 0);
  const net = Math.round(r.ledgerHead.net);
  if (gross - costTotal !== net) {
    F.ledger.push(`${tag}: the frame does not add up — gross ${gross} less running costs ${costTotal} is `
      + `${gross - costTotal}, and the screen states a net of ${net}`);
  } else {
    say(`  arithmetic  ${gross} − ${costTotal} = ${net}   ok`);
  }

  /* XP: the settlement's figure, or nothing. */
  const gain = r.xpLabels[1] ?? null;
  say(`  xp          ${gain === '' ? '(blank)' : gain}`);
  if (gain !== E.xp) F.money.push(`${tag}: XP reads "${gain}"; the settlement booked "${E.xp}"`);
  if (gain === '+0 XP') F.money.push(`${tag}: XP reads +0 XP on a settled hole`);
}

/* ═══ CASE 1. THE QA BRIDGE — a flat breakdown, i.e. nothing published ════ */
say('\n=== case 1 — main.js __qa.showResults(), the QA bridge ===');
say('  Its breakdown is FLAT: parSec/actualSec/total at the top level, and no');
say('  .time/.straightness/.bit/.safety objects at all. Nothing is published,');
say('  so nothing may be scored — and nothing is settled, so no figure may');
say('  appear anywhere in the money block.');
const qa = await render(() => p.evaluate(() => window.__DRILLITY.__qa.showResults()), 'qabridge');
cases.push({ tag: 'case 1', read: qa });
checkFrame(qa, 'case 1', null);

const invented = Object.entries(qa.crits).filter(([, t]) => /\d/.test(t.value || ''));
if (invented.length) {
  F.invented.push('case 1: criteria carry a number the sim never published: '
    + invented.map(([k, t]) => `${k}=${t.value}`).join(', '));
}

/* ── NO SETTLEMENT, NO MONEY ──────────────────────────────────────────────
   The else-branch this guards used to invoice the player from nine invented
   constants — a grade-bonus table, `depth * 180` for a payout, rods at 3 m and
   €4 each, `depth * 12` litres of flush — itemised down a ledger under the
   heading "Net paid", in the same typeface as a settled one. It is deleted.
   This is what stops it coming back. */
say(`  headline    ${qa.money.headline}   (${qa.money.headlineKey})`);
say(`  ledger      ${qa.money.rows} row(s)`);
say(`  xp          ${qa.xpLabels[1] === '' ? '(blank)' : qa.xpLabels[1]}`);
if (qa.ledgerHead) {
  F.phantom.push(`case 1: the career ledger already held a settlement (${qa.ledgerHead.contractId}) before the `
    + 'QA bridge ran, so this case can no longer prove anything about the unsettled path — see the ordering note in the header');
}
if (/\d/.test(qa.money.headline || '')) {
  F.phantom.push(`case 1: nothing was settled and the headline prints "${qa.money.headline}" — the invented invoice is back`);
}
if (qa.money.rows > 0) {
  F.phantom.push(`case 1: nothing was settled and the screen drew ${qa.money.rows} ledger row(s): `
    + qa.money.subRows.map((x) => `${x.n} ${x.c}`).join(' | '));
}
if (/\d/.test(qa.xpLabels[1] || '')) {
  F.phantom.push(`case 1: nothing was settled and the screen printed "${qa.xpLabels[1]}"`);
}

/* ═══ CASE 2. A REAL PAYLOAD — everything published, and it settles ═══════ */
say('\n=== case 2 — a real sim-shaped payload, hand-written ===');
say(`  breakdown.total ${REAL.breakdown.total}${BANDS ? ` is band ${bandFor(REAL.breakdown.total)}` : ''}`);
const real = await render(() => p.evaluate((r) => window.__DRILLITY.bus.emit('drill:complete', r), REAL), 'realpayload');
cases.push({ tag: 'case 2', read: real });
checkFrame(real, 'case 2', Math.round(REAL.breakdown.total * 100));

const blanked = Object.entries(real.crits).filter(([, t]) => !/\d/.test(t.value || ''));
if (blanked.length) {
  F.withheld.push(`case 2: the sim published these and the screen refused to show them: ${blanked.map(([k]) => k).join(', ')}`);
}
if (BANDS && real.grade !== bandFor(REAL.breakdown.total)) {
  F.letter.push(`case 2: stamp reads ${real.grade}; breakdown.total ${REAL.breakdown.total} is band `
    + `${bandFor(REAL.breakdown.total)} on the sim's table`);
}
/* The published speed score is 0.668. If 18 % ever appears here again, the
   avgRop / 45 path is back. */
if (real.crits.speed && /\b18\s*%/.test(real.crits.speed.value || '')) {
  F.withheld.push('case 2: speed reads 18 % — the hard-coded avgRop / 45 fallback has returned');
}
checkMoney(real, 'case 2', REAL.contract.id);

/* ═══ CASE 3. A CONTRACT game/data.js GENERATED, priced by the real economy ═ */
say('\n=== case 3 — a contract generated by game/data.js, settled for real ===');
const made = await p.evaluate(() => {
  const C = window.__DRILLITY;
  const d = C.data || C.game;
  if (!d || typeof d.makeContract !== 'function') {
    return { error: 'game/data.js is not reachable as window.__DRILLITY.data.makeContract — there is no generated contract to settle' };
  }
  const regionId = d.REGIONS?.[0]?.id || null;
  if (!regionId) return { error: 'game/data.js published no REGIONS to generate a contract in' };
  for (let i = 0; i < 40; i++) {
    const x = d.makeContract(regionId, Math.max(C.state.player.level, 20), C.rand);
    if (x && x.id) return { contract: JSON.parse(JSON.stringify(x)) };
  }
  return { error: `makeContract("${regionId}") produced nothing in 40 attempts` };
});
if (made.error) {
  F.nothing.push(`case 3: ${made.error}`);
  say(`  FAILED — ${made.error}`);
} else {
  const ct = made.contract;
  const payload = {
    depth: ct.targetDepth || 30,
    timeSec: GENERATED_BREAKDOWN.time.actualSec,
    grade: GENERATED_BREAKDOWN.grade,
    methodId: ct.methodId,
    contract: ct,
    breakdown: GENERATED_BREAKDOWN,
  };
  say(`  contract    ${ct.id} · ${ct.methodId} · ${ct.regionId} · target ${ct.targetDepth} m · ${ct.holes} hole(s) · payout ${ct.payout}`);
  say(`  breakdown.total ${GENERATED_BREAKDOWN.total}${BANDS ? ` is band ${bandFor(GENERATED_BREAKDOWN.total)}` : ''}`);
  const gen = await render(() => p.evaluate((r) => window.__DRILLITY.bus.emit('drill:complete', r), payload), 'generated');
  cases.push({ tag: 'case 3', read: gen });
  checkFrame(gen, 'case 3', Math.round(GENERATED_BREAKDOWN.total * 100));
  const genBlank = Object.entries(gen.crits).filter(([, t]) => !/\d/.test(t.value || ''));
  if (genBlank.length) {
    F.withheld.push(`case 3: the sim published these and the screen refused to show them: ${genBlank.map(([k]) => k).join(', ')}`);
  }
  if (BANDS && gen.grade !== bandFor(GENERATED_BREAKDOWN.total)) {
    F.letter.push(`case 3: stamp reads ${gen.grade}; breakdown.total ${GENERATED_BREAKDOWN.total} is band `
      + `${bandFor(GENERATED_BREAKDOWN.total)}`);
  }
  checkMoney(gen, 'case 3', ct.id);
}

/* ═══ THE EMPTY SET, ONE LEVEL UP ═════════════════════════════════════════
   Three cases were asked for. If the run above produced fewer — a case that
   threw, a screen that never mounted — every bucket below is smaller than it
   should be and every gate reads PASS off work that was never done. */
const EXPECTED_CASES = 3;
if (cases.length !== EXPECTED_CASES) {
  F.nothing.push(`only ${cases.length} of ${EXPECTED_CASES} probe cases produced a measurement at all`);
}
for (const { tag, read } of cases) {
  if (!read || read.error) F.nothing.push(`${tag}: nothing was read from the screen`);
  else if (!Object.keys(read.crits).length) F.nothing.push(`${tag}: no criterion tiles found at all — the probe read nothing`);
}

/* ═══ VERDICT ═════════════════════════════════════════════════════════════
   Every gate has a line, every line feeds `failed`, and `failed` sets the exit
   code. `process.exitCode` rather than `process.exit()`: the report still has
   to be written and the browser and the server closed, and exit() here would
   truncate all three. */
const uniqErrs = [...new Set(errs)];
const failed = [];
const gate = (label, ok, detail) => {
  say(`  ${label.padEnd(31, '.')} ${ok ? 'PASS' : 'FAIL' + (detail ? ' (' + detail + ')' : '')}`);
  if (!ok) failed.push(label.trim());
};

say('\n=== GATES ===');
gate('build is clean ', uniqErrs.length === 0, String(uniqErrs.length));
gate('measured something ', F.nothing.length === 0, String(F.nothing.length));
gate("read the sim's own bands ", F.bands.length === 0);
gate('verdict addressable ', F.addressing.length === 0);
gate('no invented criterion ', F.invented.length === 0);
gate('nothing withheld ', F.withheld.length === 0);
gate('letter agrees with score ', F.letter.length === 0);
gate("screen's bands = sim's ", F.drift.length === 0);
gate('no money without settlement ', F.phantom.length === 0);
gate('money is the money paid ', F.money.length === 0);
gate('the ledger adds up ', F.ledger.length === 0);

const LABEL = {
  nothing: 'MEASURED NOTHING', bands: "THE SIM'S BANDS", addressing: 'ADDRESSING',
  invented: 'INVENTED', withheld: 'WITHHELD', letter: 'LETTER vs SCORE',
  drift: 'BAND DRIFT', phantom: 'PHANTOM MONEY', money: 'MONEY', ledger: 'LEDGER',
};
if (Object.values(F).some((v) => v.length)) {
  say('\n=== WHAT FAILED ===');
  for (const [k, list] of Object.entries(F)) for (const f of list) say(`  [${LABEL[k]}] ${f}`);
}

/* Warnings from the game are the instrument working, not a fault: the
   producer-mismatch warning is exactly what results.js is supposed to say
   about the QA bridge, and case 1 would be suspicious without it. Errors are
   not — a module that threw never built its elements, and an element that does
   not exist cannot be caught printing a wrong number. */
const relevant = [...new Set(warns)].filter((w) => /\[ui\] results|\[progression\]|\[economy\]|grade|breakdown/i.test(w));
if (relevant.length) {
  say('\nwarnings the game raised (these are the instrument working, not a fault):');
  for (const w of relevant.slice(0, 8)) say('   ' + w.replace(/\s+/g, ' ').slice(0, 190));
}
if (uniqErrs.length) {
  say('\n!!  MEASUREMENT NOT VALID  !!');
  say('    Errors were logged. A module that threw stopped where it stood, so whatever it');
  say('    was building does not exist and was not measured — a screen that never rendered');
  say('    a figure cannot be caught rendering a wrong one, and scoring that as a pass is a');
  say('    pass nobody earned. Fix these and re-run before believing anything above:');
  for (const e of uniqErrs.slice(0, 10)) say('      ' + e.replace(/\s+/g, ' ').slice(0, 170));
}

if (failed.length) {
  say(`\n${failed.length} GATE(S) FAILED: ${failed.join(', ')}`);
  process.exitCode = 1;
} else {
  say('\nall gates pass');
}

writeFileSync(resolve(HERE, 'results-report.txt'), out.join('\n'), 'utf8');
await b.close();
srv.stop();
