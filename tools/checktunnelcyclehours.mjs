#!/usr/bin/env node
/**
 * Tunnel cycle accounting through actual settleRun and progression APIs.
 * Run: node tools/checktunnelcyclehours.mjs
 * Optional: --economy <saved economy.js> exercises direct settlement regressions
 * against that source (progression integration is skipped because its import
 * remains production); --json <path> writes measured results.
 *
 * All contracts, amounts, hardness samples, completion fractions, skill ranks
 * and timing samples below are NOT SOURCED regression fixtures. The shipped
 * nominal 0.5 m/h and heading setup 10 h are asserted as existing authored
 * definitions, not new physical calibration. No cutting fraction is assumed.
 */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getMethod, defaultLoadoutFor, itemsForMethod, estimateHours,
  estimateHoursBreakdown,
} from '../src/game/data.js';
import { createGameState, createBus, makeRandom, SCENES } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';

const options = {};
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  assert.ok(['--economy', '--json'].includes(args[i]), `Unknown argument: ${args[i]}`);
  assert.ok(args[i + 1] && !args[i + 1].startsWith('--'), `Missing value for ${args[i]}`);
  assert.equal(options[args[i]], undefined, `Repeated argument: ${args[i]}`);
  options[args[i]] = resolve(args[i + 1]);
}
const productionUrl = new URL('../src/game/economy.js', import.meta.url);
const sourcePath = options['--economy'] || fileURLToPath(productionUrl);
const source = await readFile(sourcePath, 'utf8');
// A saved source keeps its original production-relative dependencies. Only
// import specifiers are rebased; the actual accounting module is unmodified.
const E = options['--economy']
  ? await import(`data:text/javascript;base64,${Buffer.from(source.replace(
    /from (['"])(\.[^'"]+)\1/g,
    (_, quote, specifier) => `from ${quote}${new URL(specifier, productionUrl).href}${quote}`,
  )).toString('base64')}`)
  : await import(productionUrl.href);

const cases = [];
const measurements = [];
const moneyClockKeys = ['fuel', 'upkeep', 'insurance', 'depreciation', 'crew'];
const cents = value => +value.toFixed(2);
const near = (actual, expected, label, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected}`);
async function test(name, fn) { await fn(); cases.push(name); }

const jumbo = getMethod('tunnel-jumbo');
const bits = itemsForMethod(jumbo.id, { level: 100, slot: 'bit' })
  .sort((a, b) => (a.stats.ropMult || 1) - (b.stats.ropMult || 1));
assert.ok(bits.length >= 2, 'Need at least two eligible production face bits');
const stock = bits.find(bit => bit.id === 'bit-face-t38-48');
const premium = bits.find(bit => bit.id === 'bit-face-t45-64-hd');
assert.ok(stock && premium, 'Original reproduction bits must remain eligible production items');
assert.equal(stock.stats.ropMult, 1);
assert.equal(premium.stats.ropMult, 1.12);
assert.equal(jumbo.nominalRop, 0.5, 'This regression concerns the authored full-cycle 0.5 m/h definition');
assert.equal(jumbo.setupPerHole, 10, 'Retain the separate authored heading setup allowance');
const fixture = {
  id: 'tunnel-cycle-hours-fixture', methodId: jumbo.id, regionId: 'nordic',
  metres: 10, targetDepth: 10, holes: 1, hardness: 0.5, abrasivity: 0.5,
  holeDia: 48, payout: 24000, deadlineHours: 100, requiredCerts: [],
  archetype: 'underground-drive', bonus: { time: 1000, quality: 0 },
};
const loadout = bit => ({ ...defaultLoadoutFor(jumbo.id, jumbo.unlockLevel), bit: bit.id });
const params = (bit = stock, extra = {}) => ({
  loadout: loadout(bit), rigId: jumbo.rigIds[0], includeSetup: false, ...extra,
});

await test('full-cycle settlement retains 20 h cycle + 10 h heading setup for both eligible bits', () => {
  const standard = E.settleRun(fixture, params(stock));
  const faster = E.settleRun(fixture, params(premium));
  assert.equal(standard.hours, 30);
  assert.equal(faster.hours, 30);
  for (const key of moneyClockKeys) assert.equal(faster.costs[key], standard.costs[key], key);
  assert.equal(faster.standbyHours, standard.standbyHours);
  assert.ok(standard.payout.timeBonus > 0, 'The time bonus comparison must be nonzero');
  assert.equal(faster.payout.timeBonus, standard.payout.timeBonus);
  measurements.push({ name: '10m nominal cycle', stock: stock.id, premium: premium.id,
    stockHours: standard.hours, premiumHours: faster.hours,
    dataSplit: estimateHoursBreakdown(jumbo.id, 10, 0.5, 1) });
});

for (const hardness of [0, 0.5, 1]) {
  for (const completion of [0, 0.25, 1]) {
    for (const includeSetup of [false, true]) {
      await test(`cycle basis hardness=${hardness}, completion=${completion}, mobilisation=${includeSetup}`, () => {
        const contract = { ...fixture, hardness };
        const mob = includeSetup && completion > 0 ? E.mobilisationHours(jumbo.rigIds[0], jumbo.id) : 0;
        // Existing hardness adjustment retained; this is NOT a physical rate claim.
        const cycle = 10 * completion / (0.5 * (1.35 - 0.7 * hardness));
        const expected = cents(Math.max(0.5, cycle + 10 * completion + mob));
        for (const bit of bits) {
          const result = E.settleRun(contract, params(bit, { includeSetup, holesCompleted: completion }));
          assert.equal(result.hours, expected, bit.id);
          assert.equal(result.mobilisationHours, cents(mob));
          if (!completion) assert.equal(result.costs.setup, 0);
        }
      });
    }
  }
}

await test('partial chainage retains a whole heading setup and no sequential rod handling', () => {
  for (const metres of [0.1, 2.435, 4.87, 10, 24]) {
    const contract = { ...fixture, metres, targetDepth: metres };
    const result = E.settleRun(contract, params(premium));
    assert.equal(result.hours, cents(metres / 0.5 + 10));
  }
  const double = E.settleRun({ ...fixture, metres: 20, holes: 2 }, params(stock));
  assert.equal(double.hours, 60, 'Two synthetic headings retain two setup allowances');
});

await test('cutting ROP skills cannot discount the undivided nominal cycle', () => {
  const trained = params(premium, { skills: { 'op.percussion-rhythm': 5 } });
  assert.ok(E.resolveSkills(trained.skills).m('rop.mult') > 1, 'Real eligible skill must affect ROP');
  assert.equal(E.settleRun(fixture, trained).hours, 30);
  assert.equal(E.settleRun(fixture, trained).costs.crew, E.settleRun(fixture, params(stock)).costs.crew);
});

await test('mobilisation remains an additive rig-dependent term outside bit ROP', () => {
  for (const rigId of ['tunnel-jumbo', 'crawler-lite']) {
    // Alternate rig is a NOT SOURCED API isolation fixture, not a valid jumbo assignment.
    const base = E.settleRun(fixture, params(stock, { rigId }));
    const mobilised = E.settleRun(fixture, params(premium, { rigId, includeSetup: true }));
    assert.equal(base.hours, 30);
    assert.equal(mobilised.hours, cents(30 + E.mobilisationHours(rigId, jumbo.id)));
  }
});

await test('explicit measured hours overrides retain their exact existing semantics', () => {
  for (const override of [0, 0.2, 7.25, 30.143737, 80]) {
    for (const includeSetup of [false, true]) {
      const mob = includeSetup ? E.mobilisationHours(jumbo.rigIds[0], jumbo.id) : 0;
      for (const bit of bits) {
        const result = E.settleRun(fixture, params(bit, { hoursOverride: override, includeSetup,
          skills: { 'op.percussion-rhythm': 5 } }));
        assert.equal(result.hours, cents(Math.max(0.5, override + mob)));
      }
    }
  }
});

for (const methodId of ['top-hammer', 'hdd', 'rockbolt']) {
  await test(`${methodId} preserves its cutting, flat and hole-metres basis`, () => {
    const method = getMethod(methodId);
    const eligible = itemsForMethod(methodId, { level: 100, slot: 'bit' })
      .sort((a, b) => (a.stats.ropMult || 1) - (b.stats.ropMult || 1));
    assert.ok(eligible.length >= 2, `${methodId} must exercise real eligible tools`);
    const contract = { ...fixture, methodId, metres: 30, targetDepth: 30, holeDia: method.nominalDia };
    const split = estimateHoursBreakdown(methodId, 30, 0.5, 1);
    const skillRanks = { 'op.percussion-rhythm': 5 };
    const results = [eligible[0], eligible.at(-1)].map(bit => {
      const toolRop = Math.min(2.6, Math.max(0.5,
        (bit.stats.ropMult || 1) * E.resolveSkills(skillRanks).m('rop.mult')));
      const mob = E.mobilisationHours(method.rigIds[0], methodId);
      const result = E.settleRun(contract, { loadout: { ...defaultLoadoutFor(methodId, 100), bit: bit.id },
        rigId: method.rigIds[0], skills: skillRanks, includeSetup: true });
      assert.equal(result.hours, cents(Math.max(0.5,
        split.drill * E.ropBasisFactor(methodId) / toolRop + split.flat + mob)));
      return result;
    });
    assert.ok(results[1].hours < results[0].hours, 'Non-jumbo cutting bonus must remain effective');
  });
}

const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const runProgressionChecks = !options['--economy'];
try {
  for (const parRatio of runProgressionChecks ? [null, 0.8, 1.5] : []) {
    await test(`actual progression settlement and 11-hour shift clock, par ratio=${parRatio}`, async () => {
      const data = new Map();
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
        getItem: key => data.get(key) ?? null,
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: key => data.delete(key),
      } });
      const state = createGameState();
      const bus = createBus();
      const progression = createProgression({ state, bus, rand: makeRandom(20260906), SCENES });
      try {
        await progression.init();
        state.player.level = 60;
        state.player.money = 1000000;
        state.unlocked.methods = [jumbo.id];
        state.unlocked.rigs = [jumbo.rigIds[0]];
        state.garage.rigId = jumbo.rigIds[0];
        state.garage.loadout = loadout(premium);
        const contract = structuredClone(fixture);
        assert.equal(progression.acceptContract(contract).ok, true);
        const identity = progression.beginHole(contract);
        assert.ok(identity);
        const beforeHours = state.player.career.hoursWorked;
        const beforeDays = state.player.career.daysElapsed;
        const payload = { contract, ...identity, depth: 10, grade: 'C', timeSec: 60 };
        if (parRatio != null) payload.breakdown = { time: { parSec: 60, actualSec: 60 * parRatio } };
        const result = progression.completeHole(payload);
        assert.ok(result, 'The actual progression settlement must complete');
        const mob = E.mobilisationHours(jumbo.rigIds[0], jumbo.id);
        const expected = parRatio == null ? cents(30 + mob)
          : cents(20 * parRatio + 10 + mob);
        assert.equal(result.hours, expected);
        near(state.player.career.hoursWorked - beforeHours, result.hours, 'Hours worked');
        near(state.player.career.daysElapsed - beforeDays, result.hours / 11, 'Existing 11-hour shifts');
        assert.equal(progression.run, null);
        measurements.push({ name: 'actual progression completion', parRatio, hours: result.hours,
          hoursWorkedDelta: state.player.career.hoursWorked - beforeHours,
          shiftsDelta: state.player.career.daysElapsed - beforeDays,
          basis: parRatio == null ? 'corrected economy fallback'
            : 'whole-run par scales the cycle; separate heading setup and mobilisation remain fixed' });
      } finally { progression.dispose(); }
    });
  }
} finally {
  if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
  else delete globalThis.localStorage;
}

const report = { cases: cases.length, candidate: sourcePath,
  sha256: createHash('sha256').update(source).digest('hex'),
  progressionIntegration: runProgressionChecks ? 'verified against production economy'
    : 'SKIPPED in saved-source mode; direct settlement regressions only',
  fixtureProvenance: 'NOT SOURCED regression inputs; no physical cycle partition is asserted',
  measurements, passed: cases };
if (options['--json']) {
  await mkdir(dirname(options['--json']), { recursive: true });
  await writeFile(options['--json'], `${JSON.stringify(report, null, 2)}\n`);
}
console.log(`tunnel-cycle-hours: ${cases.length} settlement/clock cases passed`);
if (!runProgressionChecks) console.log('Saved-source mode: progression integration skipped; its import remains production.');
console.log('Normal progression uses the shared cycle estimate; fixed heading setup is not performance-scaled.');
