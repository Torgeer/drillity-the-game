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
 * So this reads the finished screen and checks the numbers against each other
 * and against the payload that produced them. It needs no allowlist of class
 * names for the same reason ./enumerate.js does not: it starts from the text
 * that is actually on screen.
 *
 * ── THE THREE CHECKS ───────────────────────────────────────────────────────
 *   1. INTERNAL CONSISTENCY. The grade letter and the score percentage are
 *      printed within a few pixels of each other. The letter must be the band
 *      the percentage falls in. This is the check the failing shot lost.
 *   2. NOTHING INVENTED. Driven through the QA bridge — whose breakdown is a
 *      FLAT object that shares no key with the real one — every criterion is
 *      unpublished, so every criterion must read '—'. A percentage here is a
 *      number the screen made up, whatever its value.
 *   3. NOTHING INVENTED, THE OTHER WAY. Driven from a real sim payload, every
 *      criterion must read a percentage and NONE may read '—': refusing to
 *      print a number the sim did publish is the same defect facing the other
 *      way, and a screen that only ever prints '—' would pass check 2 for the
 *      wrong reason.
 *
 *   node .hudqa/results.mjs [port]
 *
 * HEADED, like measure.mjs — the game must reach a steady state, and headless
 * cannot bind the discrete GPU on this machine.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = process.argv[2] || '5178';

/** The sim's own table — sim/drilling.js `T.score.grades`, highest first. */
const GRADE_BANDS = [['S', 0.90], ['A', 0.78], ['B', 0.62], ['C', 0.44], ['D', 0]];
const bandFor = (v) => (GRADE_BANDS.find(([, thr]) => v >= thr) || ['D'])[0];

const VITE_STUB = `export const createHotContext = () => ({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},get data(){return{}}});
export function updateStyle(id,c){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=c;}
export function removeStyle(id){const s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(s)s.remove();}
export function injectQuery(u){return u;} export class ErrorOverlay extends HTMLElement{}`;

/** Read the finished screen: the stamp, the verdict line, and each criterion. */
const READ = () => {
  const live = [...document.querySelectorAll('.screens > .screen')]
    .find((n) => !n.hidden && !n.classList.contains('is-leaving'));
  if (!live) return { error: 'no live screen' };
  const txt = (el) => (el ? (el.textContent || '').trim() : null);

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
  return {
    screen: live.className,
    grade: txt(live.querySelector('.grade__l')),
    verdict: txt(live.querySelector('.results__eyebrow')),
    /* Last resort: any line naming a score, wherever it lives. */
    scoreLines: [...live.querySelectorAll('*')]
      .filter((e) => !e.children.length && /score\s+\d+\s*%/i.test(e.textContent || ''))
      .map((e) => e.textContent.trim()),
    crits,
    bodyText: (live.textContent || '').replace(/\s+/g, ' ').slice(0, 1200),
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

const out = [];
const say = (s = '') => { out.push(s); console.log(s); };
const fails = [];

const b = await chromium.launch({ args: ['--mute-audio'], headless: false, channel: 'chrome' });
const c = await b.newContext({
  ...devices['iPhone 13 Pro'],
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
await c.route('**/@vite/client', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: VITE_STUB }));
const p = await c.newPage();
const warns = [];
p.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') warns.push(m.text().slice(0, 200)); });
await p.goto(`http://localhost:${PORT}/?quality=low&shot`, { waitUntil: 'load' });
await p.waitForFunction(() => window.__DRILLITY?.ui?.show && window.__DRILLITY?.sim, null, { timeout: 60000 });
await p.waitForTimeout(2200);

/** Run the staged reveal to the end, then read. */
async function render(payload, tag) {
  await p.evaluate(() => window.__DRILLITY.ui.show('menu'));
  await p.waitForTimeout(500);
  if (payload) {
    await p.evaluate((r) => {
      window.__DRILLITY.bus.emit('drill:complete', r);
    }, payload);
  } else {
    await p.evaluate(() => window.__DRILLITY.__qa.showResults());
  }
  await p.waitForTimeout(4200);          // the reveal timeline runs ~3.4 s
  const read = await p.evaluate(READ);
  await p.screenshot({ path: resolve(HERE, `results-${tag}.png`) });
  return read;
}

/* ═══ 1 + 2. THE QA BRIDGE — a flat breakdown, i.e. nothing published ═════ */
say('=== main.js debug.showResults() — the QA bridge ===');
say('  Its breakdown is FLAT: parSec/actualSec/total at the top level, and no');
say('  .time/.straightness/.bit/.safety objects at all. Nothing is published,');
say('  so nothing may be scored — and its hard-coded grade "B" sits beside its');
say('  own total of 0.51, which is band C.');
const qa = await render(null, 'qabridge');
say(`  stamp       ${qa.grade}`);
say(`  verdict     ${qa.verdict || '(none)'}`);
for (const k of ['speed', 'straightness', 'tool care', 'safety']) {
  const t = qa.crits[k];
  say(`  ${k.padEnd(13)} ${t ? t.value : '(tile missing)'}${t && t.unmeasured ? '   [marked unmeasured]' : ''}`);
}

const invented = Object.entries(qa.crits).filter(([, t]) => /\d/.test(t.value || ''));
if (invented.length) {
  fails.push(`criteria carry a number the sim never published: ${invented.map(([k, t]) => `${k}=${t.value}`).join(', ')}`);
}
if (!Object.keys(qa.crits).length) fails.push('no criterion tiles found at all — the probe read nothing');

/* The stated letter against the printed score, wherever it is printed. */
const scoreTxt = (qa.verdict || '') + ' ' + qa.scoreLines.join(' ');
const m = /(\d+)\s*%/.exec(scoreTxt);
if (m && qa.grade && qa.grade !== '—') {
  const pctV = Number(m[1]) / 100;
  const should = bandFor(pctV);
  say(`  consistency score ${m[1]} % is band ${should}; stamp says ${qa.grade}`);
  if (should !== qa.grade) {
    fails.push(`the frame refutes itself: score ${m[1]} % is band ${should} but the stamp reads ${qa.grade}`);
  }
} else {
  say(`  consistency no score printed beside the stamp — nothing to contradict  ok`);
}

/* ═══ 3. A REAL PAYLOAD — everything published, so everything must show ═══ */
say('\n=== a real sim-shaped payload — every criterion published ===');
say(`  breakdown.total ${REAL.breakdown.total} is band ${bandFor(REAL.breakdown.total)}`);
const real = await render(REAL, 'realpayload');
say(`  stamp       ${real.grade}`);
say(`  verdict     ${real.verdict || '(none)'}`);
for (const k of ['speed', 'straightness', 'tool care', 'safety']) {
  const t = real.crits[k];
  say(`  ${k.padEnd(13)} ${t ? t.value : '(tile missing)'}${t && t.unmeasured ? '   [marked unmeasured]' : ''}`);
}
const blanked = Object.entries(real.crits).filter(([, t]) => !/\d/.test(t.value || ''));
if (blanked.length) {
  fails.push(`the sim published these and the screen refused to show them: ${blanked.map(([k]) => k).join(', ')}`);
}
const wantGrade = bandFor(REAL.breakdown.total);
if (real.grade !== wantGrade) {
  fails.push(`stamp reads ${real.grade}; breakdown.total ${REAL.breakdown.total} is band ${wantGrade}`);
}
/* The published speed score is 0.668. If 18 % ever appears here again, the
   avgRop/45 path is back. */
if (real.crits.speed && /\b18\s*%/.test(real.crits.speed.value || '')) {
  fails.push('speed reads 18 % — the hard-coded avgRop / 45 fallback has returned');
}

say('\n=== GATES ===');
say(`  no invented number ....... ${fails.length === 0 ? 'PASS' : 'FAIL'}`);
for (const f of fails) say(`     - ${f}`);
const relevant = [...new Set(warns)].filter((w) => /\[ui\] results|grade|breakdown/i.test(w));
if (relevant.length) {
  say('\n  warnings the screen raised (these are the instrument working, not a fault):');
  for (const w of relevant.slice(0, 6)) say('     ' + w.replace(/\s+/g, ' ').slice(0, 170));
}

writeFileSync(resolve(HERE, 'results-report.txt'), out.join('\n'), 'utf8');
await b.close();
process.exit(fails.length ? 1 : 0);
