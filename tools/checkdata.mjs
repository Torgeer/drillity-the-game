#!/usr/bin/env node
/**
 * checkdata — assert the content tables and the renderer agree.
 *
 *   node tools/checkdata.mjs
 *
 * This project has been bitten repeatedly by two tables describing the same
 * thing and drifting apart: `catalog.js` grew a parallel region list where
 * Chile was `chile` and data.js called it `andes`; `rigFactory.js` mapped
 * cable-tool to a hydraulic crawler after data.js had corrected it to a
 * spudder. Each was invisible until something rendered wrong.
 *
 * The rule is an ASYMMETRY, not equality (see the comment on METHOD_RIGS):
 *
 *   - The renderer may know MORE than the data. A method rigFactory can draw
 *     but no contract selects is forward capability, and is fine.
 *   - The data may never know more than the renderer. A method or rig the
 *     player can select but the game cannot draw is a bug.
 *
 * `validateData()` already checks data.js against itself. This checks it
 * against the files it cannot import.
 *
 * Exits 0 clean, 1 on any violation.
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href);

const [data, rigf, sim] = await Promise.all([
  load('src/game/data.js'),
  load('src/rig/rigFactory.js'),
  load('src/sim/drilling.js'),
]);

const fail = [];
const warn = [];

const methodIds = new Set(data.METHODS.map((m) => m.id));
const rigIds = new Set(data.RIGS.map((r) => r.id));
const METHOD_RIGS = rigf.METHOD_RIGS || {};
const buildable = new Set(rigf.RIG_IDS || []);

/* 1. Every selectable method must be drawable. ------------------------------ */
for (const id of methodIds) {
  if (!METHOD_RIGS[id]) {
    fail.push(`method "${id}" is in data.js but has no METHOD_RIGS entry — the player can select a job the game cannot draw.`);
    continue;
  }
  const rigs = METHOD_RIGS[id];
  if (!rigs.length) fail.push(`method "${id}" has an empty METHOD_RIGS list.`);
  const drawable = rigs.filter((r) => buildable.has(r));
  if (!drawable.length) {
    fail.push(`method "${id}" maps only to rigs with no builder: ${rigs.join(', ')}`);
  }
}

/* 2. Every purchasable rig must have a builder (or declare its stand-in). ---- */
for (const rig of data.RIGS) {
  const target = rig.renderRigId || rig.id;
  if (buildable.has(target)) {
    // A stand-in that is no longer needed is worth removing, not tolerating.
    if (rig.renderRigId && buildable.has(rig.id)) {
      // Not a misrender: rigRenderId() prefers the rig's own builder when one
      // exists. The fallback is simply dead weight now, and a stale line that
      // says "draw this as something else" invites someone to believe it.
      warn.push(`rig "${rig.id}" still sets renderRigId:"${rig.renderRigId}" but now has its own builder — the fallback is dead (rigRenderId prefers the real one); drop the line.`);
    }
    continue;
  }
  fail.push(`rig "${rig.id}" has no builder (renders as "${target}", which does not exist).`);
}

/* 3. The permitted direction of extra knowledge. ---------------------------- */
const forward = Object.keys(METHOD_RIGS).filter((m) => !methodIds.has(m));
const forwardRigs = [...buildable].filter((r) => !rigIds.has(r));

/* 4. rigFactory must not point a method at a rig that cannot be owned. ------- */
for (const [m, rigs] of Object.entries(METHOD_RIGS)) {
  if (!methodIds.has(m)) continue; // forward capability: not yet selectable
  for (const r of rigs) {
    if (!rigIds.has(r) && buildable.has(r)) {
      warn.push(`method "${m}" lists rig "${r}", which is drawable but not in data.js RIGS — it cannot be bought, so it will never be used.`);
    }
  }
}

/* 5. The sim's private tuning table vs the content authority. ---------------
 *
 * `sim/drilling.js` imports only `core/contract.js` — deliberately, so the
 * simulation does not drag the content layer into itself. The cost of that
 * isolation is a second table of method numbers, and a second table drifts.
 *
 * Two different problems live in `rodLength`, and they must not be conflated:
 *
 *   - A SEMANTIC COLLISION. In `data.js` it is the length of the string
 *     element; in the sim it is the rod-add CADENCE, where 0 means "this
 *     method has no rod-add beat at all". So CFA at 35 (a 35 m auger string)
 *     against sim 0 (continuous, nothing to add) is not a disagreement — it is
 *     the same field meaning two things.
 *   - A REAL DIVERGENCE, where both are cadences and the numbers differ.
 *     `oil-rotary` is the clearest: data.js was corrected to 27.0 *with a
 *     comment explaining why 28.5 is physically impossible* — Range 2 is
 *     8.23–9.14 m per joint, so a triple stand cannot exceed ~27 m — and the
 *     sim still runs 28.5.
 *
 * These are WARN rather than FAIL only because the reconciliation is in
 * flight. Once the sim takes its cadence from the method row, tighten it.
 */
const simMethods = (sim.TUNING && sim.TUNING.methods) || {};
const noSim = [];
for (const m of data.METHODS) {
  const t = simMethods[m.id];
  if (!t) { noSim.push(m.id); continue; }
  const a = Number(m.rodLength);
  const b = Number(t.rodLength);
  if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
  if (a === b) continue;
  if (b === 0) continue;   // sim says "no rod-add beat" — a different claim, not a conflict
  warn.push(`method "${m.id}" rodLength: data.js ${a}, sim ${b} — two cadences for one method.`);
}
if (noSim.length) {
  warn.push(`no sim tuning at all for: ${noSim.join(', ')} — these fall back to a default model.`);
}

/* 5b. hasDrillString — the same class as rodLength, and NOT the same problem.
 *
 * This one is a BOOLEAN FACT about the method, it carries no second meaning on
 * either side, and DOMAIN.md §1a states it in prose: cable-tool and driven-pile
 * have no drill string. So there is no exemption to carry and it FAILS.
 *
 * It has already been wrong once. The sim's table carried the flag on
 * cable-tool and not on driven-pile, and `getTelemetry()` reads it as
 * `!== false` — undefined is not false — so a pile published
 * `hasDrillString: true` and `rods: 1`, and `ui/screens/site.js` keys its beat
 * caption straight off that field. Nothing looked broken, because the pile's
 * mechanics happen to be correct by a different route (`rodLength: 0`,
 * `noJam`). A fact can be wrong while the behaviour is right, and that is the
 * expensive kind.
 */
for (const m of data.METHODS) {
  const t = simMethods[m.id];
  if (!t) continue;
  const a = m.hasDrillString !== false;
  const b = t.hasDrillString !== false;
  if (a !== b) {
    fail.push(`method "${m.id}" hasDrillString: data.js ${a}, sim ${b} — `
      + `the sim publishes its own answer on telemetry and the HUD reads it.`);
  }
}

/* 5c. validGround vs the sim's rockCeilingUcs — the same class again, at the
 * other end: two tables describing WHAT GROUND THIS METHOD CAN DRILL.
 *
 * `data.js` lists the beds a contract may be written in; `sim/drilling.js`
 * carries a UCS ceiling per method, and above it `ropModel()` rolls the rock
 * efficiency down to 0.02 and `currentWarning()` raises `method-limit` —
 * "GROUND TOO HARD FOR THIS METHOD — ABANDON THE HOLE".
 *
 * MEASURED, headlessly, one bed of the method's own validGround under 3 m of
 * clay, competent inputs, 900 s:
 *
 *   auger in chalk (12 MPa, ceiling 8)              3.4 m of 20, 0.16 m/h
 *   site-investigation in sandstone (70, ceiling 60) 2.9 m of 20, 0.08 m/h
 *   site-investigation in limestone (90, ceiling 60) 2.7 m of 20, 0.06 m/h
 *   cased-cfa in boulder (140, ceiling 14)           1.5 m of 20, 0.02 m/h
 *   auger in clay (control)                         20.0 m of 20, 33.6 m/h
 *
 * WARN, not FAIL, and deliberately so — neither number can be moved from here:
 *
 *   - It is LATENT in the shipped generator today. 6,400 sampled contracts
 *     across all 8 regions produce no groundSpec that crosses a ceiling.
 *   - But groundSpec is NOT the column the player drills. `startHole()` takes
 *     ground from `ctx.geology`, and `world/geology.js` `generateProfile()`
 *     builds it from REGION RECIPES that consult neither validGround nor any
 *     sim constant. checkbeds.mjs checks data.js against itself and never asks
 *     the sim, so nothing in the tree covers this pairing.
 *   - `boulder` in a validGround list may well mean "copes with boulders in the
 *     ground" rather than "may bottom in a boulder bed" — a rodLength-shaped
 *     semantic collision, and resolving it is a content decision.
 *
 * Moving a ceiling to silence this would be inventing a drilling fact. Say it
 * every run instead, and let whoever owns validGround decide.
 */
{
  const { GROUND } = await load('src/core/contract.js');
  for (const m of data.METHODS) {
    const t = simMethods[m.id];
    if (!t || t.rockCeilingUcs == null) continue;
    const over = (m.validGround || [])
      .filter((g) => GROUND[g] && GROUND[g].ucs > t.rockCeilingUcs)
      .map((g) => `${g} ${GROUND[g].ucs} MPa`);
    if (over.length) {
      warn.push(`method "${m.id}" validGround contains ground above its own sim `
        + `rockCeilingUcs ${t.rockCeilingUcs}: ${over.join(', ')} — the sim raises `
        + `"method-limit — ABANDON THE HOLE" in ground data.js calls valid.`);
    }
  }
}

/* data.js's own self-check -------------------------------------------------
   `validateData()` is ~200 lines of invariants written alongside the tables it
   guards — the underground rule, the depth windows, the payout/cost trap, the
   method-reach floor. It had NO CALLER anywhere in the tree, so none of it had
   ever run outside a REPL. Everything it asserts is about data.js against
   itself, which is exactly the half this file said it was leaving to it. */
{
  const problems = data.validateData();
  for (const p of problems) fail.push(`validateData: ${p}`);
  console.log(`selfcheck data.js  ${problems.length} problem(s)`);
}

/* Report ------------------------------------------------------------------- */
console.log(`methods   data.js ${methodIds.size}   renderer ${Object.keys(METHOD_RIGS).length}`);
console.log(`rigs      data.js ${rigIds.size}   builders ${buildable.size}`);
if (forward.length) console.log(`\nforward capability (renderer ahead of data — allowed):\n  methods: ${forward.join(' ')}`);
if (forwardRigs.length) console.log(`  rigs:    ${forwardRigs.join(' ')}`);

if (warn.length) {
  console.log('');
  for (const w of warn) console.log('WARN  ' + w);
}
if (fail.length) {
  console.error('');
  for (const f of fail) console.error('FAIL  ' + f);
  console.error(`\n${fail.length} violation(s). The data may never know more than the renderer.`);
  process.exit(1);
}
console.log('\nOK    every selectable method and rig can be drawn.');
