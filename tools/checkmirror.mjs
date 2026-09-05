#!/usr/bin/env node
/**
 * checkmirror — `state.drill` must describe THIS run and nothing else.
 *
 *   node tools/checkmirror.mjs            the gate
 *   node tools/checkmirror.mjs --verbose  print every run's key count
 *
 * WHY THIS EXISTS
 * ---------------
 * `state.drill` is one shared mutable object. `core/contract.js` builds it once
 * at boot and NOTHING ever replaces it — `sim/drilling.js` `writeState()`
 * mutates it in place every frame, for the whole session, across every hole.
 * It is what `ui/screens/site.js`, `sim/vfx.js`, `core/env.js`, `audio.js` and
 * `game/progression.js` all read.
 *
 * Nothing else in the tree exercises it. `tools/stagepace.mjs` — the only other
 * headless sim probe — constructs the sim with `createDrillSim({ bus })` and no
 * `state` at all, so `writeState()` returns on its second line and this entire
 * half of the sim runs under no measurement. Both of the defects this file was
 * written for lived exactly there:
 *
 *   - `jetBar` was published during the PRE-DRILL as well as the jetting lift.
 *     `vfx.js` keys its spoil return on the presence of that field, so a 55 s
 *     browser capture drew a jet grouting spoil column for 1,100 frames of a
 *     run that never left stage 0.
 *   - The programme block only ever GREW. A driven-pile -> rc -> jet-grouting
 *     -> auger sequence left the auger run publishing `programme: null` on top
 *     of 50 live-looking fields from three methods it was not, including that
 *     same `jetBar`/`return01` pair — so the auger's collar drew a grout
 *     column over a hole with no grout in it.
 *
 * THE INVARIANT, and it is deliberately one line of English:
 *
 *   The mirror after running method X must have the SAME KEY SET as running
 *   method X first, from a state object that has never seen another method.
 *
 * That is "the mirror has no history". It needs no list of which field belongs
 * to which programme, so it cannot drift as fields are added, and it catches a
 * new leak the day the field is introduced rather than the day somebody
 * notices the picture is wrong.
 *
 * ── AND "MEASURED NOTHING" IS A FAILURE ──────────────────────────────────
 * ASTRA §8. Every run here must reach the sim, write the mirror and move the
 * hole, or the comparison above is two empty sets agreeing with each other.
 *
 * Exits 0 clean, 1 on any violation.
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href);

const [sim, data, core] = await Promise.all([
  load('src/sim/drilling.js'),
  load('src/game/data.js'),
  load('src/core/contract.js'),
]);
const { createDrillSim, TUNING } = sim;
const { METHODS } = data;
const { GROUND } = core;

const VERBOSE = process.argv.includes('--verbose');

/* A stale field is identified by its NAME; its value is context. `blowLog` is
   24 objects and printing it whole buried the other twenty names in one line
   of JSON, which is how a readable failure becomes an unreadable one. */
const brief = (v) => {
  if (Array.isArray(v)) return `array[${v.length}]`;
  const s0 = JSON.stringify(v);
  return s0 == null ? String(v) : s0.length > 40 ? `${s0.slice(0, 37)}...` : s0;
};
const FPS = 1 / 60;
const fail = [];

/* The ground a method is actually sold into — the same derivation stagepace
   uses, and for the same reason: `startHole()`'s synthetic fallback is a
   nordic crystalline stack that several methods correctly refuse to drill, and
   a run that stops on `method-limit` measures the contract, not the mirror. */
function groundColumn(methodId, beds = 5) {
  const m = METHODS.find((x) => x.id === methodId);
  if (!m || !m.validGround || !m.validGround.length) return null;
  const sorted = m.validGround.filter((id) => GROUND[id])
    .sort((a, b) => GROUND[a].ucs - GROUND[b].ucs);
  if (!sorted.length) return null;
  return Array.from({ length: beds }, (_, i) =>
    sorted[Math.round((0.15 + 0.70 * (i / (beds - 1))) * (sorted.length - 1))]);
}

/** A competent-enough operator: the sim's own optimum, and it works a jam. */
function drive(s, tel) {
  if (tel.phase === 'rod-add') {
    const ra = tel.rodAdd;
    if (ra && !ra.hit && !ra.missed && ra.t >= ra.windowStart && ra.t <= ra.windowEnd) s.pulse('rodStab');
    return;
  }
  if (tel.phase !== 'drilling') return;
  if (tel.jam.state !== 'free') {
    s.setInput('feed', 0.08); s.setInput('rotation', 0.28); s.setInput('flush', 0.95);
    if (tel.jam.rescue.goodNow) s.pulse('jamRescue');
    return;
  }
  const o = tel.optimal;
  s.setInput('feed', o.wob); s.setInput('rotation', o.rpm); s.setInput('flush', o.flush);
}

/**
 * Run one hole through update(), so writeState() actually runs.
 *
 * `s` is a SIM INSTANCE, passed in rather than made here, because the lifecycle
 * has to be the game's: `main.js:295` loads the sim once at boot and every hole
 * after that is a `startHole()` on that same instance (`main.js:425`,
 * `ui/screens/site.js:2481`). The mirror's retire pass is per-instance state,
 * so a probe that built a fresh sim per hole would be measuring a lifecycle
 * this game does not have and reporting a leak nobody can reach.
 */
function runHole(s, state, methodId, target, maxSec = 900) {
  s.startHole({ method: methodId, methodId, targetDepth: target, difficulty: 2, seed: 4242,
                ground: groundColumn(methodId) });
  const st = s.debug.state;
  let frames = 0;
  for (let f = 0; f < Math.round(maxSec / FPS); f++) {
    if (!st.active && st.phase !== 'stuck') break;
    drive(s, s.getTelemetry());
    s.update(FPS);
    frames++;
  }
  return { frames, depth: st.depth, tel: s.getTelemetry() };
}

/* Short holes: this measures the SHAPE of the mirror, not the pacing, and a
   3,000 m well proves nothing here that 30 m does not. */
const TARGET = { 'oil-rotary': 60, hdd: 40, 'raise-boring': 25, 'tunnel-jumbo': 12,
                 longhole: 20, rc: 30, 'driven-pile': 12, rockbolt: 12 };
const ids = METHODS.map((m) => m.id);

/* ── 1. the solo key set for every method ─────────────────────────────── */
const solo = new Map();
for (const id of ids) {
  const state = { drill: {}, world: { regionId: 'nordic' }, unlocked: { methods: [] } };
  const s = createDrillSim({ bus: { on: () => () => {}, emit: () => {} }, state });
  const r = runHole(s, state, id, TARGET[id] ?? 20);
  const keys = Object.keys(state.drill).sort();
  // MEASURED NOTHING IS A FAILURE. A run that never reached the sim would make
  // every comparison below trivially true.
  if (!r.frames) fail.push(`${id}: the solo run produced no frames at all.`);
  if (!keys.length) fail.push(`${id}: the solo run wrote nothing onto state.drill.`);
  if (!(r.depth > 0)) fail.push(`${id}: the solo run made no hole (depth ${r.depth}).`);
  solo.set(id, keys);
  if (VERBOSE) console.log(`  solo ${id.padEnd(20)} ${String(keys.length).padStart(3)} fields`
    + `  ${r.depth.toFixed(1)} m in ${r.frames} frames`);
}

/* ── 2. the same methods, in sequence, on ONE mirror ──────────────────── */
/* The order deliberately puts the field-heavy programmes (a pile, an RC
   sample train, a jetting lift) in front of the sparse ones, because that is
   the direction a leak shows in. */
const chain = ['driven-pile', 'rc', 'jet-grouting', 'site-investigation', 'tunnel-jumbo',
               'rockbolt', 'longhole', 'raise-boring', 'hdd', 'auger', 'core', 'dth']
  .filter((id) => solo.has(id))
  .concat(ids.filter((id) => !['driven-pile', 'rc', 'jet-grouting', 'site-investigation',
    'tunnel-jumbo', 'rockbolt', 'longhole', 'raise-boring', 'hdd', 'auger', 'core', 'dth'].includes(id)));

const state = { drill: {}, world: { regionId: 'nordic' }, unlocked: { methods: [] } };
/* A field a CONSUMER parks on this object must survive — ui/screens/site.js
   keeps `runLog` here. If the retire logic ever widens into a blanket wipe,
   this is what says so. */
state.drill.runLog = ['a consumer owns this'];

const chainSim = createDrillSim({ bus: { on: () => () => {}, emit: () => {} }, state });
let prev = null;
for (const id of chain) {
  const r = runHole(chainSim, state, id, TARGET[id] ?? 20);
  const keys = Object.keys(state.drill).filter((k) => k !== 'runLog').sort();
  const want = solo.get(id);
  const extra = keys.filter((k) => !want.includes(k));
  const missing = want.filter((k) => !keys.includes(k));
  if (extra.length) {
    fail.push(`after ${prev ? `${prev} -> ` : ''}${id}: state.drill carries `
      + `${extra.length} field(s) no solo ${id} run publishes — `
      + `${extra.map((k) => `${k}=${brief(state.drill[k])}`).join(', ')}`);
  }
  if (missing.length) {
    fail.push(`after ${id}: state.drill is MISSING ${missing.join(', ')} — `
      + `the retire pass took a field the running method owns.`);
  }
  if (!r.frames) fail.push(`${id}: produced no frames in the chain.`);
  if (VERBOSE) console.log(`  chain ${id.padEnd(20)} ${String(keys.length).padStart(3)} fields`
    + `  ${extra.length ? `+${extra.length} STALE` : 'clean'}`);
  prev = id;
}
if (!Array.isArray(state.drill.runLog)) {
  fail.push("a consumer's own field (`runLog`) was removed from state.drill — "
    + 'the sim may only retire fields it published itself.');
}

/* ── 3. jet grouting: the jet block belongs to the jetting pass alone ──── */
/* This is the one field pair whose PRESENCE is a mode flag downstream
   (`sim/vfx.js`: `jetting = d.jetBar != null && d.return01 != null`), so it
   gets an assertion of its own rather than only the key-set one above. */
{
  const st = { drill: {}, world: { regionId: 'nordic' }, unlocked: { methods: [] } };
  const s = createDrillSim({ bus: { on: () => () => {}, emit: () => {} }, state: st });
  s.startHole({ methodId: 'jet-grouting', targetDepth: 18, difficulty: 2, seed: 4242,
                ground: groundColumn('jet-grouting') });
  const S = s.debug.state;
  let s0 = 0, s0Jet = 0, s1 = 0, s1Jet = 0, barLo = Infinity, barHi = -Infinity;
  for (let f = 0; f < Math.round(900 / FPS); f++) {
    if (!S.active && S.phase !== 'stuck') break;
    drive(s, s.getTelemetry());
    s.update(FPS);
    const d = st.drill;
    if (d.stage === 0) { s0++; if (d.jetBar != null || d.return01 != null) s0Jet++; }
    if (d.stage === 1) {
      s1++;
      if (d.jetBar != null && d.return01 != null) {
        s1Jet++; barLo = Math.min(barLo, d.jetBar); barHi = Math.max(barHi, d.jetBar);
      }
    }
  }
  const jet = TUNING.methods['jet-grouting'].stages[1].jet;
  if (!s0 || !s1) fail.push(`jet-grouting measured nothing: ${s0} pre-drill frames, ${s1} lift frames.`);
  if (s0Jet) {
    fail.push(`jet-grouting published jetBar/return01 on ${s0Jet} of ${s0} PRE-DRILL frames — `
      + 'vfx.js reads the presence of those fields as "the monitor is jetting".');
  }
  if (s1 && s1Jet !== s1) {
    fail.push(`jet-grouting published the jet block on only ${s1Jet} of ${s1} lift frames — `
      + 'the HUD reads state.drill, so the missing frames have no gauge.');
  }
  if (s1Jet && barHi > jet.maxBar) {
    fail.push(`jet-grouting reached ${barHi} bar against [KLEMM]'s ${jet.maxBar} bar pump ceiling.`);
  }
  if (VERBOSE) {
    console.log(`  jet-grouting  pre-drill ${s0}f (jet on ${s0Jet}), lift ${s1}f `
      + `(jet on ${s1Jet}), ${barLo === Infinity ? '—' : `${barLo}..${barHi}`} bar`);
  }
}

/* ── report ───────────────────────────────────────────────────────────── */
console.log(`mirror    ${ids.length} methods solo + ${chain.length} in sequence on one state.drill`);
if (fail.length) {
  console.error('');
  for (const f of fail) console.error('FAIL  ' + f);
  console.error(`\n${fail.length} violation(s). state.drill must describe THIS run and nothing else.`);
  process.exit(1);
}
console.log('\nOK    the mirror has no history, and the jet block is on the jetting pass alone.');
