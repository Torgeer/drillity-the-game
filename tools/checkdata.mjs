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
