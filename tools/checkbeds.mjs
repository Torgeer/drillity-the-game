#!/usr/bin/env node
/**
 * checkbeds — no contract may bottom a hole in ground its own method cannot
 * drill.
 *
 *   node tools/checkbeds.mjs            # the gate: 800 cards per region
 *   node tools/checkbeds.mjs 4000       # a deep sweep, for hunting
 *   node tools/checkbeds.mjs 4000 andes # one region, verbose seeds
 *
 * WHY THIS EXISTS
 * ---------------
 * `methodsForRegion()` and the `usableSites` filter in `makeContract()` both
 * ask "can this method bottom a hole here?" against `nominalColumn()` — the
 * MEAN column, where a lens that is only there half the time counts for half of
 * itself. `makeContract()` then drills the ROLLED column from
 * `buildGroundColumn()`, where that lens is either wholly there or wholly
 * absent and every thickness is a fresh sample.
 *
 * The two disagree in the tail. When they do, `bottomableBed()` returns null
 * and the fallback takes the TOP bed of the column whether the method can drill
 * it or not — so the card advertises a hole that cannot be finished, the player
 * accepts it, drills, and stops. Not a designed challenge: a generator bug.
 *
 * A hole is legal when:
 *   1. the bed it bottoms in is in `method.validGround`;
 *   2. the ground it passes through that the method CANNOT drill is no thicker
 *      than the pre-collar allowance for that site (`preCollarFor`);
 *   3. its target depth is inside the depth window for its method, application
 *      and site.
 *
 * Exits 0 clean, 1 on any violation. Prints the failing seed for every one, so
 * a fix is verified against the same cards that failed.
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const D = await import(pathToFileURL(join(ROOT, 'src/game/data.js')).href);
const { makeRandom } = await import(pathToFileURL(join(ROOT, 'src/core/contract.js')).href);

const PER_REGION = Number(process.argv[2]) || 800;
const ONLY = process.argv[3] || null;

const methodById = new Map(D.METHODS.map((m) => [m.id, m]));

/**
 * Methods whose `targetDepth` is the vertical depth of a hole, straight from
 * data.js. An earlier version of this file DERIVED the set by asking which
 * windows sat under the fleet cap; it was accidentally right, sweeping in
 * `tunnel-jumbo` and `hdd`, whose numbers are chainage and bore length and are
 * not depths at all. A guard that reasons its way to the right answer for the
 * wrong reason is a guard that will be wrong later.
 */
const VERTICAL = new Set(D.DEPTH_IS_VERTICAL);

/** Every failure this card commits, in words. Empty means the card is legal. */
function faults(c) {
  const out = [];
  const method = methodById.get(c.methodId);
  if (!method) return ['unknown method ' + c.methodId];
  const vg = new Set(method.validGround);
  const spec = c.groundSpec || [];
  if (!spec.length) return ['empty groundSpec'];

  // 1. the bed the hole bottoms in
  const bottom = spec[spec.length - 1];
  if (!vg.has(bottom.id)) {
    out.push(`bottoms in "${bottom.id}", which is not in validGround `
      + `[${method.validGround.join(', ')}]`);
  }

  // 2. undrillable ground passed through, against the allowance for this site
  const blocked = spec.slice(0, -1)
    .filter((l) => !vg.has(l.id))
    .reduce((a, l) => a + l.thickness, 0);
  const allowance = D.preCollarFor(method, c.archetype);
  if (blocked > allowance + 0.01) {
    out.push(`passes ${blocked.toFixed(2)} m of undrillable ground on the way `
      + `down, allowance at ${c.archetype} is ${allowance} m`);
  }

  // 3. the depth window for this method AT THIS SITE
  const [lo, hi] = D.depthWindow(method, c.applicationId, c.archetype);
  if (c.targetDepth > hi + 0.05 || c.targetDepth < Math.min(lo, hi) - 0.05) {
    out.push(`targetDepth ${c.targetDepth} m is outside the window `
      + `${lo}-${hi} m for ${method.id}/${c.applicationId}/${c.archetype}`);
  }
  // 4. SOMEBODY IN THE FLEET MUST BE ABLE TO REACH IT. A card the player can
  //    accept, buy the only machine that runs the method for, and still not
  //    finish is the same defect as one that bottoms in undrillable ground.
  //    Only for methods whose targetDepth IS a vertical depth — for an HDD
  //    bore length or a jumbo's chainage, comparing it to a rig's depth rating
  //    is a category error.
  if (VERTICAL.has(c.methodId)) {
    const able = D.RIGS.filter((r) => r.methods.includes(c.methodId));
    if (!able.length) {
      out.push('no rig in the game runs this method at all');
    } else if (!able.some((r) => (r.stats.depthCapacity || 0) >= c.targetDepth)) {
      const deepest = Math.max(...able.map((r) => r.stats.depthCapacity || 0));
      out.push(`asks for ${c.targetDepth} m; the deepest rig that runs `
        + `${c.methodId} reaches ${deepest} m`);
    }
  }

  return out;
}

const regions = D.REGIONS.filter((r) => !ONLY || r.id === ONLY);
if (!regions.length) {
  console.error(`No region "${ONLY}". Known: ${D.REGIONS.map((r) => r.id).join(', ')}`);
  process.exit(1);
}

let totalBad = 0;
let totalCards = 0;
const rows = [];

for (const region of regions) {
  const bad = [];
  let n = 0;
  for (let i = 0; i < PER_REGION; i++) {
    // Sweep the whole career, not one level: the depth ceiling and the number
    // of holes both scale with mastery, so a bug that only bites a level-3
    // player is invisible at level 60.
    const level = 1 + (i % D.MAX_LEVEL);
    const seed = (region.id.length * 7919 + i * 2654435761) >>> 0;
    let c;
    try {
      c = D.makeContract(region.id, level, makeRandom(seed));
    } catch (err) {
      bad.push({ seed, level, why: [`threw: ${err.message}`] });
      n++;
      continue;
    }
    if (!c) continue;
    n++;
    const why = faults(c);
    if (why.length) bad.push({ seed, level, method: c.methodId, site: c.archetype, why });
  }
  totalCards += n;
  totalBad += bad.length;
  rows.push({ region: region.id, n, bad: bad.length });

  if (bad.length) {
    console.log(`\n${region.id}: ${bad.length}/${n} bad`);
    // Group by the shape of the fault, so 57 cards do not print as 57 stories.
    const byShape = new Map();
    for (const b of bad) {
      const key = `${b.method}/${b.site}: ${b.why.join(' | ')}`;
      if (!byShape.has(key)) byShape.set(key, []);
      byShape.get(key).push(b);
    }
    for (const [key, list] of [...byShape].sort((a, b) => b[1].length - a[1].length)) {
      const seeds = list.slice(0, 6).map((b) => `${b.seed}@L${b.level}`).join(' ');
      console.log(`  x${String(list.length).padStart(4)}  ${key}`);
      console.log(`          seeds: ${seeds}${list.length > 6 ? ' …' : ''}`);
    }
  }
}

console.log('\n── summary ──────────────────────────────────────────────');
for (const r of rows) {
  const pct = r.n ? (100 * r.bad / r.n).toFixed(2) : '0.00';
  console.log(`  ${r.region.padEnd(22)} ${String(r.bad).padStart(5)} / ${String(r.n).padEnd(6)} ${pct}%`);
}
console.log(`  ${'TOTAL'.padEnd(22)} ${String(totalBad).padStart(5)} / ${String(totalCards).padEnd(6)}`);

if (totalBad) {
  console.error(`\nFAIL: ${totalBad} contract(s) cannot be completed by the method they demand.`);
  process.exit(1);
}
console.log('\nOK: every sampled contract bottoms in ground its method can drill.');
