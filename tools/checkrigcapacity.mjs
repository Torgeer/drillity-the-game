#!/usr/bin/env node
/**
 * A rig's Kelly rating must not authorize CFA work. Exercise the public
 * capacity queries, real data windows and real generated contracts on CPU.
 * Source configuration expectations: research/rigs/method-capacity-verification-2026-09-06.md.
 * Run: node tools/checkrigcapacity.mjs
 */
import assert from 'node:assert/strict';
import {
  RIGS, REGIONS, MAX_LEVEL, DEPTH_IS_VERTICAL, getRig, getMethod,
  rigDepthCapacity, fleetDepthFor, depthWindow, makeContract,
} from '../src/game/data.js';
import { makeRandom } from '../src/core/contract.js';

let checks = 0;
const check = (name, fn) => {
  try { fn(); checks++; }
  catch (error) { error.message = `${name}: ${error.message}`; throw error; }
};
const foundation = getRig('foundation-bg');
const cfa = getRig('cfa-rig');
const caps = { 'rotary-kelly': 48, cfa: 15.2, 'cased-cfa': 17 };

check('source-backed configuration ratings', () => {
  for (const [method, expected] of Object.entries(caps)) {
    assert.equal(rigDepthCapacity(foundation, method), expected);
    assert.equal(rigDepthCapacity('foundation-bg', method), expected);
  }
  assert.equal(foundation.stats.depthCapacity, 48);
  assert.equal(rigDepthCapacity(cfa, 'cfa'), 15);
  for (const method of ['cased-cfa', 'auger', 'rotary-kelly']) {
    assert.equal(rigDepthCapacity(cfa, method), null);
  }
});

check('declared maps cover advertised methods and contain valid ratings', () => {
  for (const rig of RIGS) {
    if (!Object.hasOwn(rig, 'methodDepthCapacity')) continue;
    assert.deepEqual(Object.keys(rig.methodDepthCapacity).sort(), [...rig.methods].sort(), rig.id);
    for (const method of rig.methods) rigDepthCapacity(rig, method);
  }
});

check('another configuration cannot fill an unknown rating', () => {
  const conflicting = { id: 'fixture', methods: ['cfa', 'rotary-kelly'],
    stats: { depthCapacity: 999 }, methodDepthCapacity: { cfa: 12, 'rotary-kelly': 80 } };
  assert.equal(rigDepthCapacity(conflicting, 'cfa'), 12);
  assert.equal(rigDepthCapacity({ ...conflicting, methodDepthCapacity: { cfa: null } }, 'cfa'), null);
  assert.equal(rigDepthCapacity({ ...conflicting, methodDepthCapacity: {} }, 'cfa'), null);
  assert.equal(rigDepthCapacity(conflicting, 'dth'), null);
  assert.equal(rigDepthCapacity('missing-rig', 'cfa'), null);
});

check('malformed declarations fail instead of looking unknown', () => {
  for (const bad of [0, -1, NaN, Infinity, -Infinity, '15', undefined, {}, []]) {
    assert.throws(() => rigDepthCapacity({ ...cfa, methodDepthCapacity: { cfa: bad } }, 'cfa'), RangeError);
  }
  for (const bad of [null, [], '15', 15, new Map(), new Date()]) {
    assert.throws(() => rigDepthCapacity({ ...cfa, methodDepthCapacity: bad }, 'cfa'), TypeError);
  }
});

check('legacy fallback exists only when no method map is declared', () => {
  const legacy = { id: 'legacy', methods: ['top-hammer'], stats: { depthCapacity: 45 } };
  assert.equal(rigDepthCapacity(legacy, 'top-hammer'), 45);
  assert.equal(rigDepthCapacity({ ...legacy, methodDepthCapacity: {} }, 'top-hammer'), null);
  assert.equal(rigDepthCapacity({ ...legacy, stats: {} }, 'top-hammer'), null);
});

check('unknown or absent fleet capacity cannot generate unlimited or zero-depth work', () => {
  assert.throws(() => fleetDepthFor('cfa', []), /No rated rig depth capacity/);
  assert.throws(() => fleetDepthFor('cased-cfa', [cfa]), /No rated rig depth capacity/);
  const known = { ...cfa, methodDepthCapacity: { cfa: 9 } };
  const unknown = { ...cfa, stats: { depthCapacity: 999 }, methodDepthCapacity: { cfa: null } };
  assert.equal(fleetDepthFor('cfa', [known, unknown]), 9);
  assert.equal(fleetDepthFor('cfa'), 15.2, 'subset query must not poison complete-fleet cache');
  assert.equal(fleetDepthFor('cfa', [known]), 9, 'complete-fleet cache must not override subset query');
  assert.equal(fleetDepthFor('cfa'), 15.2);
});

check('CFA and Kelly depth windows use the corresponding fleet configuration', () => {
  for (const [methodId, expected] of Object.entries(caps)) {
    const method = getMethod(methodId);
    assert.equal(fleetDepthFor(methodId), expected);
    for (const application of method.applications) {
      for (const site of [null, ...method.archetypes]) {
        const [lo, hi] = depthWindow(method, application, site);
        assert.ok(lo > 0 && lo <= hi);
        assert.equal(hi, expected, `${methodId}/${application}/${site}`);
      }
    }
  }
});

check('bore length and chainage retain their existing non-vertical semantics', () => {
  for (const method of ['hdd', 'tunnel-jumbo', 'longhole', 'rockbolt']) {
    assert.ok(!DEPTH_IS_VERTICAL.includes(method));
    assert.equal(fleetDepthFor(method, []), Infinity);
  }
});

const seen = Object.fromEntries(Object.keys(caps).map((id) => [id, 0]));
const maxima = Object.fromEntries(Object.keys(caps).map((id) => [id, 0]));
const levels = [...new Set([getMethod('cfa').unlockLevel + 2, getMethod('cased-cfa').unlockLevel + 2, MAX_LEVEL])];
let contracts = 0;
check('actual generated contracts stay inside method-specific fleet depth', () => {
  for (let ri = 0; ri < REGIONS.length; ri++) {
    for (const level of levels) {
      const random = makeRandom(20260906 + ri * 1009 + level * 97);
      for (let n = 0; n < 200; n++) {
        const contract = makeContract(REGIONS[ri].id, level, random);
        contracts++;
        if (!Object.hasOwn(caps, contract.methodId)) continue;
        seen[contract.methodId]++;
        maxima[contract.methodId] = Math.max(maxima[contract.methodId], contract.targetDepth);
        assert.ok(contract.targetDepth > 0 && contract.targetDepth <= caps[contract.methodId],
          `${contract.methodId}/${REGIONS[ri].id}/level ${level}/sample ${n}: ${contract.targetDepth} m`);
      }
    }
  }
  for (const [method, count] of Object.entries(seen)) assert.ok(count >= 20, `${method}: insufficient coverage (${count})`);
});

console.log(`checkrigcapacity: ${checks} checks passed; ${contracts} actual contracts generated.`);
console.log(`Affected-method counts: ${JSON.stringify(seen)}; maximum depths (m): ${JSON.stringify(maxima)}.`);
