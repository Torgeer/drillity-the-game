#!/usr/bin/env node
/**
 * checkhaptics — the haptic vocabulary, asserted.
 * ─────────────────────────────────────────────────────────────────────────────
 * A vibration cannot be photographed. `tools/shoot.mjs` drives a HEADED Chrome
 * on a desktop, which has no actuator at all, so the capture harness — the tool
 * that grades everything else in this game — is structurally incapable of
 * telling anyone whether the haptics are right, wrong, or firing at all.
 *
 * That is the entire reason `src/audio/haptics.js` is a pure module with no
 * imports and an injected clock: so this file can run the whole channel in
 * plain node and MEASURE it. ASTRA.md §8: verify by measurement, not by the
 * absence of an error.
 *
 * Seven gates:
 *
 *   1. MAPPING     every event class the game fires resolves to a shape, and
 *                  every legacy intensity name still resolves. A name that
 *                  silently falls through to a default is the failure mode this
 *                  whole file exists to prevent.
 *   2. LEGALITY    every pattern is legal under the W3C Vibration API — ≤ 10
 *                  entries (longer is TRUNCATED, not rejected, so an over-long
 *                  pattern produces a WRONG signature with no error anywhere),
 *                  no trailing pause, integers only, and no pulse below the
 *                  actuator floor.
 *   3. DISTINCT    every pair of signatures differs on at least two independent
 *                  structural features. Computed, not eyeballed.
 *   4. MIRROR      rampUp is the exact reverse of rampDown. The most important
 *                  distinction in the vocabulary is a mirror, and a mirror that
 *                  drifts stops being one silently.
 *   5. FREQUENCY   a simulated 300 m hole — 100 rod additions at 3 m — costs
 *                  less motor time than a stated budget, and the saving lands
 *                  on the repeats rather than on the first few.
 *   6. BUDGET      no burst the sim can produce leaves the motor running.
 *   7. SILENCE     the capture-harness flag suppresses the actuator, and every
 *                  script in the repo that drives the game passes --mute-audio
 *                  and a mute query flag. Seven probe scripts once lacked
 *                  --mute-audio and played the game out loud on the owner's
 *                  machine while they were working. This is the gate that
 *                  stops the eighth.
 *
 * Exits 0 clean, 1 on any failure.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const H = await import(pathToFileURL(join(ROOT, 'src/audio/haptics.js')).href);
const {
  SHAPES, EVENT_SHAPE, LEGACY, CLS, REFRACTORY,
  TICK, MAX_SPAN, MAX_ENTRIES, BUDGET_MS, BUDGET_WINDOW,
  shapeFor, onMs, spanMs, head, createHaptics,
} = H;

/**
 * The six SHAPES, as groups. A directional pair — rampUp/rampDown,
 * stepUp/stepDown — is ONE shape read in two directions, so it counts once.
 * Defined here because two sections need the same answer, and two tables
 * describing one thing will drift (HANDOFF.md §8B).
 */
function SIGNATURE_GROUPS() {
  const g = new Map();
  for (const id of Object.keys(SHAPES)) {
    if (id === 'tick' || id === 'beat') continue;
    const key = SHAPES[id].pair || id;
    if (!g.has(key)) g.set(key, []);
    g.get(key).push(id);
  }
  return g;
}

const fails = [];
const notes = [];
const fail = (m) => fails.push(m);
const note = (m) => notes.push(m);

/* ═══════════════════════════════════════════════════════════════════════════
   1. MAPPING
   ═══════════════════════════════════════════════════════════════════════════ */

/** The seven events the design brief names. Each must reach its own shape. */
const REQUIRED = {
  'rod-added':         'stutter',
  'jam':               'grind',
  'cavity':            'void_',
  'bit-change':        'twin',
  'premature-refusal': 'rampDown',
  'hole-complete':     'rampUp',
};

for (const [ev, want] of Object.entries(REQUIRED)) {
  const got = shapeFor(ev);
  if (got !== want) fail(`mapping: '${ev}' -> '${got}', expected '${want}'`);
}
// The stratum step is directional and is the one event whose shape depends on
// its payload, so it is asserted separately — including the honest degradation
// when the direction is not known.
if (shapeFor('stratum', { harder: true }) !== 'stepUp') fail(`mapping: stratum(harder) is not stepUp`);
if (shapeFor('stratum', { harder: false }) !== 'stepDown') fail(`mapping: stratum(softer) is not stepDown`);
if (shapeFor('stratum') !== 'tick') fail(`mapping: stratum with unknown direction must degrade to tick, not guess`);

for (const [ev, id] of Object.entries(EVENT_SHAPE)) {
  if (!SHAPES[id]) fail(`mapping: EVENT_SHAPE['${ev}'] -> '${id}', which is not a shape`);
}
for (const [name, id] of Object.entries(LEGACY)) {
  if (!SHAPES[id]) fail(`mapping: LEGACY['${name}'] -> '${id}', which is not a shape`);
  if (shapeFor(name) !== id) fail(`mapping: legacy name '${name}' does not resolve`);
}
if (shapeFor('no-such-event-at-all') !== null) {
  fail('mapping: an unknown name must resolve to null, not to a default. ' +
       'A silent fallback here is exactly how the old table hid nine names behind three signals.');
}

// Every hazard kind src/sim/drilling.js can fire, read out of the sim rather
// than transcribed, so this gate notices when the sim grows a new one.
const simSrc = readFileSync(join(ROOT, 'src/sim/drilling.js'), 'utf8');
const simKinds = new Set();
for (const m of simSrc.matchAll(/case '([a-z][a-z0-9-]+)':\s*(?:\/\/[^\n]*\n\s*)*[^\n]*haptic\(/g)) simKinds.add(m[1]);
for (const m of simSrc.matchAll(/queueHazard\('([a-z][a-z0-9-]+)'/g)) simKinds.add(m[1]);
const unmapped = [...simKinds].filter((k) => !EVENT_SHAPE[k]).sort();
if (simKinds.size < 20) fail(`mapping: only ${simKinds.size} hazard kinds parsed out of drilling.js — the scrape has broken, and a gate over an empty set passes forever`);
// WHETHER THE SIM FORWARDS ITS KIND IS MEASURED, NOT ASSERTED.
//
// This gate used to PRINT `drilling.js does not forward h.kind` as prose, and
// went on printing it after drilling.js grew a third `kind` parameter and ten
// `haptic('heavy', true, h.kind)` sites. A hardcoded sentence in a gate is a
// claim nothing re-derives - the same shape as the eight declared contracts
// with no consumer in ASTRA section 8 - and it inverted the meaning of the
// note under it: an unmapped kind that IS forwarded is a live gap reaching a
// player now, not a mapping held in reserve for later.
const forwarded = new Set();
for (const m of simSrc.matchAll(/case '([a-z][a-z0-9-]+)':[^\n]*haptic\([^)]*,[^)]*,[^)]*\)/g)) {
  forwarded.add(m[1]);
}
const kindArgSites =
  [...simSrc.matchAll(/\bhaptic\([^;)]{0,160}?,[^;)]{0,80}?,[^;)]{0,80}?\)\s*;/g)].length;
if (unmapped.length) {
  const live = unmapped.filter((k) => forwarded.has(k));
  const later = unmapped.filter((k) => !forwarded.has(k));
  note(`${unmapped.length} of ${simKinds.size} sim hazard kinds have no signature of their own and fall to 'ui':`);
  note(`  ${unmapped.join(', ')}`);
  note(`  drilling.js forwards h.kind at ${kindArgSites} haptic() call sites, covering ${forwarded.size} kinds.`);
  if (live.length) {
    note(`  REACHING A PLAYER NOW - forwarded, but with no signature of its own:`);
    note(`    ${live.join(', ')}`);
  }
  if (later.length) {
    note(`  Not yet forwarded, so they still arrive as legacy intensity names (see LEGACY):`);
    note(`    ${later.join(', ')}`);
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   1b. THE SHOT TABLE — every one-shot that carries a signature
   ───────────────────────────────────────────────────────────────────────────
   audio.js's SHOT_HAPTIC is the actual vocabulary as it reaches a player. This
   drives every entry through a real channel and reads back what came out, so
   the assertion is about BEHAVIOUR rather than about the table's contents.
   ═══════════════════════════════════════════════════════════════════════════ */

const audioUrl = pathToFileURL(join(ROOT, 'src/audio/audio.js')).href;
const { default: createAudio, SHOT_HAPTIC } = await import(audioUrl);

if (!SHOT_HAPTIC || !Object.keys(SHOT_HAPTIC).length) {
  fail('shots: audio.js no longer exports SHOT_HAPTIC. A gate over an empty set passes forever.');
} else {
  // Every entry must name a shot the audio system answers to. Asserted by
  // PLAYING it and reading debug.shotErrors, which now counts an unknown id
  // before the graph check — so this works with no AudioContext at all.
  const put = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  put('navigator', { vibrate: () => true });
  put('location', { search: '' });
  const probe = createAudio({ state: { settings: {} } });
  for (const id of Object.keys(SHOT_HAPTIC)) probe.play(id);
  const unknown = Object.keys(probe.debug.shotErrors).filter((k) => k[0] === '?');
  if (unknown.length) {
    fail(`shots: SHOT_HAPTIC names ${unknown.length} shot(s) that do not exist: ${unknown.join(', ')}`);
  }

  // And every entry must resolve to a real shape, with its payload applied.
  // Spaced 5 s apart so no refractory or budget masks a broken mapping.
  const reached = new Set();
  let t = 0;
  const seenPat = [];
  const ch = createHaptics({ now: () => t, vibrate: (p) => seenPat.push(p.slice()) });
  const SAMPLE = { hardness: 0.9, severity: 0.8, height: 3, harder: true, perfect: true, grade: 'A', kind: 'r32' };
  for (const [shot, fn] of Object.entries(SHOT_HAPTIC)) {
    if (typeof fn !== 'function') { fail(`shots: SHOT_HAPTIC['${shot}'] is not a function`); continue; }
    const spec = fn(SAMPLE);
    if (spec === null) continue;
    if (!Array.isArray(spec) || typeof spec[0] !== 'string') { fail(`shots: SHOT_HAPTIC['${shot}'] did not return [name, opt]`); continue; }
    const id = shapeFor(spec[0], spec[1]);
    if (!id) { fail(`shots: SHOT_HAPTIC['${shot}'] -> '${spec[0]}', which resolves to nothing`); continue; }
    reached.add(SHAPES[id].pair || id);
    t += 5;
    ch.newHole();
    if (!ch.fire(spec[0], spec[1])) fail(`shots: SHOT_HAPTIC['${shot}'] fired nothing at 5 s spacing on a fresh hole`);
  }
  // All six shapes must actually be reachable from a shot. A shape nothing can
  // fire is a design that exists only in a comment.
  const groups = new Set(SIGNATURE_GROUPS().keys());
  for (const g of groups) {
    if (!reached.has(g)) fail(`shots: no shot can produce the '${g}' signature — it exists only in the table`);
  }
  note(`${Object.keys(SHOT_HAPTIC).length} shots carry a signature; all six shapes are reachable.`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. LEGALITY — W3C Vibration API §3
   ═══════════════════════════════════════════════════════════════════════════ */

for (const [id, sh] of Object.entries(SHAPES)) {
  const p = sh.pattern;
  if (!Array.isArray(p) || !p.length) { fail(`legality: ${id} has no pattern`); continue; }
  if (p.length > MAX_ENTRIES) {
    fail(`legality: ${id} has ${p.length} entries; the spec truncates above ${MAX_ENTRIES}, ` +
         `which would issue a DIFFERENT signature with no error anywhere`);
  }
  if (p.length % 2 === 0) fail(`legality: ${id} ends on a pause, which the spec discards — end on a pulse`);
  for (let i = 0; i < p.length; i++) {
    if (!Number.isInteger(p[i]) || p[i] <= 0) { fail(`legality: ${id}[${i}] = ${p[i]} is not a positive integer`); continue; }
    if (p[i] > 10000) fail(`legality: ${id}[${i}] exceeds the spec's 10000 ms per-entry clamp`);
    // Even indices are pulses (spec §3). `beat` is texture, not a signature,
    // and is deliberately below the floor — it is the drilling rhythm, felt as
    // a continuous grain rather than as a discrete event.
    if (i % 2 === 0 && p[i] < TICK && id !== 'beat') {
      fail(`legality: ${id}[${i}] = ${p[i]} ms is below the ${TICK} ms actuator floor`);
    }
  }
  if (spanMs(p) > MAX_SPAN) fail(`legality: ${id} spans ${spanMs(p)} ms, over the ${MAX_SPAN} ms ceiling`);
  if (!sh.why) fail(`legality: ${id} has no stated reason. Every signature must say why it suits its event`);
  if (!CLS.hasOwnProperty(sh.cls)) fail(`legality: ${id} has class '${sh.cls}', which does not exist`);
}
for (const cls of Object.keys(CLS)) {
  if (typeof REFRACTORY[cls] !== 'number') fail(`legality: class '${cls}' has no refractory`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. DISTINCT — computed, not eyeballed
   ───────────────────────────────────────────────────────────────────────────
   Four independent structural features, chosen because each survives an
   actuator whose response we cannot measure:

     pulses    how many separate pulses. Lag cannot change a count.
     slope     rising / falling / neither, over the pulse lengths. Lag
               compresses the short end of an ordered series; it cannot
               reverse the order.
     gapClass  the LONGEST gap, bucketed. This is what makes VOID unmistakable.
     onClass   total motor-on time, bucketed coarsely.

   Two signatures must differ on at least TWO of the four. One feature in
   common is a family resemblance; two is a collision.
   ═══════════════════════════════════════════════════════════════════════════ */

function features(p) {
  const pulses = [];
  for (let i = 0; i < p.length; i += 2) pulses.push(p[i]);
  const gaps = [];
  for (let i = 1; i < p.length; i += 2) gaps.push(p[i]);
  let slope = 0;
  if (pulses.length > 1) {
    let up = true, down = true;
    for (let i = 1; i < pulses.length; i++) {
      if (pulses[i] <= pulses[i - 1]) up = false;
      if (pulses[i] >= pulses[i - 1]) down = false;
    }
    slope = up ? 1 : down ? -1 : 0;
  }
  const maxGap = gaps.length ? Math.max(...gaps) : 0;
  const gapClass = maxGap === 0 ? 0 : maxGap < 60 ? 1 : maxGap < 130 ? 2 : 3;
  const on = onMs(p);
  const onClass = on < 60 ? 0 : on < 130 ? 1 : on < 240 ? 2 : 3;
  return { pulses: pulses.length, slope, gapClass, onClass };
}

// `tick` and `beat` are the floor, not signatures; they are excluded on
// purpose — a decayed signature is SUPPOSED to become a tick.
const SIGNATURES = Object.keys(SHAPES).filter((k) => k !== 'tick' && k !== 'beat');

// A DIRECTIONAL PAIR IS ONE SHAPE, NOT TWO. rampUp/rampDown and stepUp/stepDown
// each differ from their partner on exactly ONE feature — slope — by
// construction, because being a mirror is the whole design. Comparing them
// against each other under the two-feature rule would report the design as a
// bug and "fixing" it would destroy the most learnable distinction in the
// vocabulary. So the pairs collapse to one entry here, and §4 asserts the
// opposite of them instead: that they really are mirrors.
//
// What this therefore asserts is the claim the design actually makes:
// SIX shapes, pairwise distinct.
const GROUPS = SIGNATURE_GROUPS();
if (GROUPS.size !== 6) {
  fail(`distinct: ${GROUPS.size} shapes, not 6. The design claims a player can learn about six; ` +
       `if that number changes the claim in haptics.js's header has to change with it.`);
}
const ids = [...GROUPS.keys()];
for (let a = 0; a < ids.length; a++) {
  for (let b = a + 1; b < ids.length; b++) {
    const ia = GROUPS.get(ids[a])[0], ib = GROUPS.get(ids[b])[0];
    const fa = features(SHAPES[ia].pattern);
    const fb = features(SHAPES[ib].pattern);
    let differ = 0;
    for (const k of ['pulses', 'slope', 'gapClass', 'onClass']) if (fa[k] !== fb[k]) differ++;
    if (differ < 2) {
      fail(`distinct: ${ia} and ${ib} differ on only ${differ} of 4 features — ` +
           `${JSON.stringify(fa)} vs ${JSON.stringify(fb)}`);
    }
  }
}
// Within a pair, the two halves must be genuine OPPOSITES: same pulse count,
// opposite slope, and neither of them flat. A pair that drifts into two
// same-direction patterns is worse than two unrelated ones, because the player
// has been taught to read the direction.
for (const [key, members] of GROUPS) {
  if (members.length === 1) continue;
  if (members.length !== 2) { fail(`distinct: pair '${key}' has ${members.length} members`); continue; }
  const [fa, fb] = members.map((m) => features(SHAPES[m].pattern));
  if (fa.pulses !== fb.pulses) fail(`distinct: pair '${key}' halves have different pulse counts`);
  if (fa.slope === 0 || fb.slope === 0 || fa.slope === fb.slope) {
    fail(`distinct: pair '${key}' is no longer two opposite directions (${fa.slope} vs ${fb.slope})`);
  }
}

// The head is the decayed form and must still be legal and still be short.
for (const id of SIGNATURES) {
  const h = head(SHAPES[id].pattern);
  if (h.length % 2 === 0) fail(`distinct: head(${id}) ends on a pause`);
  if (onMs(h) >= onMs(SHAPES[id].pattern)) fail(`distinct: head(${id}) is not cheaper than the full signature`);
}
// The step's head must still carry its direction — that is why STEP survives
// decay when nothing else does.
if (head(SHAPES.stepUp.pattern)[0] >= head(SHAPES.stepDown.pattern)[0]) {
  fail('distinct: the decayed step no longer says which way the ground went');
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. MIRROR
   ═══════════════════════════════════════════════════════════════════════════ */

const up = SHAPES.rampUp.pattern, dn = SHAPES.rampDown.pattern;
if (up.length !== dn.length || up.some((v, i) => v !== dn[dn.length - 1 - i])) {
  fail('mirror: rampUp is no longer the exact reverse of rampDown. ' +
       '"lengthening = it landed, shortening = it stopped" is the one distinction ' +
       'a player is guaranteed to learn, and it only works while the pair is a pair.');
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. FREQUENCY — the 300 m hole
   ═══════════════════════════════════════════════════════════════════════════ */

/** Drive a channel with a scripted run and report what the motor did. */
function run(events, opts) {
  let t = 0;
  const issued = [];
  const ch = createHaptics({
    now: () => t,
    vibrate: (p) => issued.push(p.slice()),
    ...(opts || {}),
  });
  for (const [dt, name, o] of events) { t += dt; ch.fire(name, o); }
  return { ch, issued, motorMs: issued.reduce((s, p) => s + onMs(p), 0) };
}

// 300 m at 3 m rods. 100 rod additions, one every 24 s of play (a plausible
// pace for a 40-minute deep hole), each with the same rod kind — which is the
// whole point: nothing about the 40th one is news.
const rods = [];
for (let i = 0; i < 100; i++) rods.push([24, 'rod-added', { qualifier: 'r32' }]);
const withDecay = run(rods);

// The same hundred events with the decay defeated, which is what the shipping
// code did before this: one identical full pattern every single time.
const naive = 100 * onMs(SHAPES.stutter.pattern);

const ROD_BUDGET_MS = 3000;
if (withDecay.motorMs > ROD_BUDGET_MS) {
  fail(`frequency: 100 rod additions cost ${withDecay.motorMs} ms of motor time, over the ${ROD_BUDGET_MS} ms budget`);
}
if (withDecay.motorMs >= naive * 0.5) {
  fail(`frequency: the novelty decay saved less than half — ${withDecay.motorMs} ms against ${naive} ms naive`);
}
// The saving must land on the REPEATS. The first two must be full signatures,
// or the decay is stealing the information instead of the noise.
if (withDecay.issued.length < 2 ||
    withDecay.issued[0].length !== SHAPES.stutter.pattern.length ||
    withDecay.issued[1].length !== SHAPES.stutter.pattern.length) {
  fail('frequency: the first rod additions of a hole are not full signatures. ' +
       'The decay must remove repetition, never the first instance.');
}
if (withDecay.issued[99] && withDecay.issued[99].length !== 1) {
  fail('frequency: the hundredth rod addition is still more than a tick');
}

// A changed qualifier must bring the full signature back — that is the whole
// mechanism, and it is what makes this a novelty budget rather than a mute.
const mixed = [];
for (let i = 0; i < 20; i++) mixed.push([24, 'rod-added', { qualifier: 'r32' }]);
mixed.push([24, 'rod-added', { qualifier: 't45' }]);          // a different rod
const mixedRun = run(mixed);
const lastMixed = mixedRun.issued[mixedRun.issued.length - 1];
if (!lastMixed || lastMixed.length !== SHAPES.stutter.pattern.length) {
  fail('frequency: a changed qualifier did not restore the full signature. ' +
       'Novelty is what the signature encodes; without this the decay is just a fade-out.');
}

// A new hole restores everything.
const ch2 = (() => {
  let t = 0; const got = [];
  const ch = createHaptics({ now: () => t, vibrate: (p) => got.push(p.slice()) });
  for (let i = 0; i < 20; i++) { t += 24; ch.fire('rod-added', { qualifier: 'r32' }); }
  ch.newHole();
  t += 24; ch.fire('rod-added', { qualifier: 'r32' });
  return got;
})();
if (ch2[ch2.length - 1].length !== SHAPES.stutter.pattern.length) {
  fail('frequency: a new hole did not reset the novelty budget');
}

// A hole ends once, so the two ramps must never decay.
const ends = [];
for (let i = 0; i < 12; i++) ends.push([60, 'hole-complete']);
const endRun = run(ends);
if (endRun.issued.some((p) => p.length !== SHAPES.rampUp.pattern.length)) {
  fail('frequency: hole-complete decayed. A hole ending is never a repeat.');
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. BUDGET — no burst leaves the motor running
   ═══════════════════════════════════════════════════════════════════════════ */

// Everything the sim could throw at once, as fast as the refractories allow,
// for a full budget window.
const storm = [];
const names = ['jam', 'cavity', 'premature-refusal', 'rod-added', 'stratum', 'boulder', 'collapse'];
for (let i = 0; i < 400; i++) storm.push([0.05, names[i % names.length], { harder: i % 2 === 0 }]);
const stormRun = run(storm);
const windowMs = BUDGET_WINDOW * 1000;
const dutyOverWindow = BUDGET_MS / windowMs;
// The run is 400 x 50 ms = 20 s, so at most two windows' worth of budget.
if (stormRun.motorMs > BUDGET_MS * 2.2) {
  fail(`budget: a 20 s storm spent ${stormRun.motorMs} ms of motor time, over 2 windows of ${BUDGET_MS} ms`);
}
if (stormRun.ch.stats.dropped === 0) {
  fail('budget: a 400-event storm dropped nothing. The refractories are not engaging, ' +
       'and a gate that measures nothing is a gate that passes forever.');
}

// Pre-emption: a hazard must get through while an info signature is in flight.
{
  let t = 0; const got = [];
  const ch = createHaptics({ now: () => t, vibrate: (p) => got.push({ t, p: p.slice() }) });
  ch.fire('stratum', { harder: true });        // info, 135 ms span
  t += 0.02;
  ch.fire('cavity', { height: 2 });            // hazard, arriving mid-flight
  if (got.length !== 2) fail('budget: a hazard did not pre-empt an info signature in flight');
  t = 0.04;
  const before = got.length;
  ch.fire('stratum', { harder: false });       // info, while the hazard plays
  if (got.length !== before) fail('budget: an info signature was not dropped under a hazard in flight');
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. SILENCE
   ═══════════════════════════════════════════════════════════════════════════ */

// 7a — the channel's own silent flag suppresses the actuator and nothing else.
{
  let fired = 0;
  const ch = createHaptics({ now: () => 0, silent: () => true, vibrate: () => { fired++; } });
  const p = ch.fire('cavity', { height: 3 });
  if (fired !== 0) fail('silence: the actuator ran under the capture-harness flag');
  if (!p) fail('silence: the silent flag suppressed RESOLUTION as well as the actuator — ' +
               'a probe must still be able to assert the mapping in-browser');
  if (!ch.stats.last) fail('silence: bookkeeping stopped under the silent flag');
}

// 7b — audio.js still derives _silent from the query string, and it now drives
// the haptic channel too. Driven through the real module rather than by reading
// the source, because "the code contains the right string" is not the same
// claim as "the code does the right thing".
{
  const cases = [
    ['?shot', true], ['?mute', true], ['?shot&sound', false],
    ['?quality=high&shot', true], ['', false],
  ];
  // node >= 21 ships a read-only `navigator` global, so it has to be defined
  // over rather than assigned to.
  const put = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  let vibrated = 0;
  put('navigator', { vibrate: () => { vibrated++; return true; } });
  for (const [search, wantSilent] of cases) {
    put('location', { search });
    vibrated = 0;
    const api = createAudio({ state: { settings: {} } });
    api.haptic('cavity', { height: 2 });
    const gotSilent = vibrated === 0;
    if (gotSilent !== wantSilent) {
      fail(`silence: location.search='${search}' -> ${gotSilent ? 'silent' : 'AUDIBLE'}, expected ${wantSilent ? 'silent' : 'audible'}`);
    }
    if (!api.debug.haptics.stats.last) {
      fail(`silence: '${search}' suppressed haptic bookkeeping as well as the actuator`);
    }
  }
  delete globalThis.location;
  delete globalThis.navigator;   // restores node's own getter
}

// 7c — every script that drives the game must mute the browser AND the game.
// Seven probes once lacked --mute-audio and played the game out loud on the
// owner's machine while they were working. This is the gate against the eighth.
{
  const scripts = [];
  const walk = (dir, depth) => {
    for (const e of readdirSync(dir)) {
      if (e === 'node_modules' || e === '.git' || e === 'dist') continue;
      const p = join(dir, e);
      if (statSync(p).isDirectory()) { if (depth > 0) walk(p, depth - 1); continue; }
      if (!/\.mjs$/.test(e)) continue;
      scripts.push(p);
    }
  };
  walk(ROOT, 1);
  let checked = 0;
  for (const p of scripts) {
    const src = readFileSync(p, 'utf8');
    if (!/chromium\.launch|puppeteer\.launch/.test(src)) continue;
    const rel = p.slice(ROOT.length).replace(/\\/g, '/');
    // Does it actually navigate to the game? A script that only rasterises a
    // local file cannot make a sound and is not this gate's business.
    // `localhost:${PORT}` is as much a navigation as `localhost:5178`, and the
    // first version of this scan missed exactly that spelling — which is how
    // .qa-toolshot.mjs sat outside this gate while relying on --mute-audio
    // alone. A scan that silently covers less than it claims is the same bug
    // as a gate over an empty set.
    const navigatesToApp = /(goto|navigate)\s*\(\s*[`'"][^`'"]*localhost:(\d|\$\{)/.test(src)
      || /goto\(\s*URL_/.test(src) || /goto\(\s*url/i.test(src);
    // ...but a navigation to a standalone probe PAGE is not a navigation to
    // the game. tools/glbcompress.mjs loads /zz-probe.html, a bare canvas
    // with no audio graph on it at all.
    const probePage = /localhost:[^`'"]*\/[a-z0-9_-]+\.html/i.test(src);
    if (!navigatesToApp || probePage) continue;
    checked++;
    if (!src.includes('--mute-audio')) {
      fail(`silence: ${rel} drives the game without --mute-audio`);
    }
    if (!/[?&](shot|mute)\b/.test(src)) {
      fail(`silence: ${rel} drives the game without ?shot or ?mute — ` +
           `it is relying on --mute-audio alone, and audio.js's own mute never engages`);
    }
  }
  if (checked < 10) {
    fail(`silence: only ${checked} game-driving scripts found. The scan has broken, ` +
         `and a gate over an empty set passes forever.`);
  }
  note(`${checked} scripts drive the game; all mute both the browser and the game.`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT
   ═══════════════════════════════════════════════════════════════════════════ */

const w = (s, n) => String(s).padEnd(n);
console.log('\n  signature   cls      pattern (ms)                       on    span  pulses');
console.log('  ' + '─'.repeat(76));
for (const id of [...SIGNATURES, 'tick', 'beat']) {
  const p = SHAPES[id].pattern;
  const f = features(p);
  console.log(`  ${w(id, 11)} ${w(SHAPES[id].cls, 8)} ${w('[' + p.join(', ') + ']', 34)} ${w(onMs(p), 5)} ${w(spanMs(p), 5)} ${f.pulses}`);
}
console.log('');
console.log(`  300 m hole, 100 rod additions`);
console.log(`    naive (one full signature every time)   ${naive} ms of motor time`);
console.log(`    with the novelty decay                  ${withDecay.motorMs} ms  (${(naive / withDecay.motorMs).toFixed(1)}x less)`);
console.log(`    full / head / tick                      ${withDecay.ch.stats.full} / ${withDecay.ch.stats.headed} / ${withDecay.ch.stats.ticked}`);
console.log(`  20 s event storm, 400 events`);
console.log(`    issued ${stormRun.ch.stats.fired}, dropped ${stormRun.ch.stats.dropped}, motor ${stormRun.motorMs} ms`);
console.log(`    duty ceiling ${(dutyOverWindow * 100).toFixed(1)}% over a ${BUDGET_WINDOW} s window`);
console.log('');

for (const n of notes) console.log('NOTE  ' + n);
if (fails.length) {
  console.log('');
  for (const f of fails) console.error('FAIL  ' + f);
  console.error(`\n${fails.length} failure${fails.length === 1 ? '' : 's'}.`);
  process.exit(1);
}
console.log('\nOK    ' + GROUPS.size + ' shapes, pairwise distinct, and silent under the harness.');
process.exit(0);
