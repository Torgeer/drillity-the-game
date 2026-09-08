#!/usr/bin/env node
/** CPU recovery accounting tests. Synthetic completion records are explicit
 * grade/time boundary fixtures, issued by the real progression attempt API.
 * The final case also executes an actual no-teleport fixed-step simulation.
 * Run: node tools/checkrescueviability.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createGameState, createBus, EVENTS, makeRandom } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { ECON, canonicalEmergencyContract } from '../src/game/economy.js';
import { REGIONS, MAX_LEVEL, roleForLevel } from '../src/game/data.js';

const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const rows = [];
let passed = 0;
async function fixture(money = -1, { level = 1, regionId = 'nordic', condition = 1 } = {}) {
  const entries = new Map();
  globalThis.localStorage = { getItem: k => entries.get(k) ?? null,
    setItem: (k,v) => entries.set(k,String(v)), removeItem: k => entries.delete(k) };
  const state = createGameState(), bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(123) });
  await progression.init();
  Object.assign(state.player, { money, level, roleId: roleForLevel(level).id });
  state.world.regionId = regionId;
  state.player.career.lastRegionId = regionId;
  state.unlocked.regions = [regionId];
  state.garage.condition[state.garage.rigId] = condition;
  const events = [];
  bus.on(EVENTS.MONEY_CHANGE, p => events.push(p));
  const summaries = [];
  bus.on(EVENTS.SCENE_CHANGE, p => { if (p.summary) summaries.push(p.summary); });
  return { state, bus, progression, entries, events, summaries,
    close() { progression.dispose(); } };
}
function accept(f) {
  const card = f.progression.getContracts().find(c => c.emergency === true) || f.progression.rescueContract();
  assert.equal(f.progression.acceptContract(card).ok, true);
  return f.state.contract;
}
function hole(f, contract, { ratio = 3, grade = 'D', depth = contract.targetDepth } = {}) {
  const identity = f.progression.beginHole(contract);
  assert.ok(identity);
  const payload = { contract, ...identity, depth, methodId: 'auger', grade,
    breakdown: { time: { parSec: 60, actualSec: 60 * ratio } } };
  return { payload, settlement: f.progression.completeHole(payload) };
}
function finish(f, options) {
  const contract = accept(f), start = f.state.player.money;
  const settlements = [];
  for (let i = 0; i < contract.holes; i++) {
    const { settlement } = hole(f, contract, options);
    assert.ok(settlement);
    settlements.push(settlement);
    if (i < contract.holes - 1) assert.equal(settlement.recoverySupport, undefined);
  }
  const net = f.state.player.money - start;
  const support = settlements.reduce((sum,s) => sum + (s.recoverySupport || 0), 0);
  const rawNet = settlements.reduce((sum,s) => sum + s.revenue - s.costs.total, 0);
  assert.equal(net, rawNet + support, 'wallet, unmodified cost lines and support reconcile');
  assert.equal(f.summaries.at(-1).net, net);
  assert.equal(settlements.reduce((sum,s) => sum + s.net, 0), net);
  assert.equal(f.state.contract, null);
  return { net, support, rawNet, settlements };
}
async function test(name, fn) { await fn(); passed++; console.log(`PASS ${name}`); }

try {
  await test('actual settlement matrix: all regions, representative career levels, grades, time and rig condition', async () => {
    for (const region of REGIONS) for (const level of [1, 20, MAX_LEVEL])
      for (const grade of ['D','C','S']) for (const ratio of [0.4,1,3]) for (const condition of [0,1]) {
        const f = await fixture(-2500, { regionId: region.id, level, condition });
        try {
          const result = finish(f, { grade, ratio });
          assert.ok(result.net >= ECON.brokeBelow);
          assert.equal(result.net, Math.max(ECON.brokeBelow, result.rawNet));
          rows.push({ region: region.id, level, grade, ratio, condition,
            net: result.net, rawNet: result.rawNet, support: result.support });
        } finally { f.close(); }
      }
    assert.equal(rows.length, REGIONS.length * 3 * 3 * 3 * 2);
  });
  await test('repeated worst-time grade-D jobs recover actual debt without acceptance grants', async () => {
    const f = await fixture(-2500, { condition: 0 });
    try {
      let attempts = 0;
      while (f.progression.isBroke() && attempts < 20) {
        const start = f.state.player.money;
        const { net } = finish(f, { ratio: 3, grade: 'D' });
        assert.equal(f.state.player.money, start + net);
        assert.ok(net >= ECON.brokeBelow);
        attempts++;
      }
      assert.ok(!f.progression.isBroke());
      assert.equal(attempts, 8);
    } finally { f.close(); }
  });
  await test('zero/partial/missing/nonfinite/over-depth do not consume or pay rescue attempts', async () => {
    const f = await fixture();
    try {
      const c = accept(f);
      for (const depth of [0, 4, undefined, null, NaN, Infinity, -1, 8.01, '8']) {
        const identity = f.progression.beginHole(c);
        const before = JSON.stringify(f.progression.serialise());
        assert.equal(f.progression.completeHole({ contract:c, ...identity, depth }), null);
        assert.equal(JSON.stringify(f.progression.serialise()), before);
      }
      assert.equal(f.state.player.money, -1);
      f.progression.abandonContract();
      assert.equal(f.state.player.money, -1);
    } finally { f.close(); }
  });
  await test('abandon after one or two delivered holes receives no completion support', async () => {
    for (const count of [1,2]) {
      const f = await fixture();
      try {
        const c = accept(f);
        for (let i=0;i<count;i++) assert.equal(hole(f,c).settlement.recoverySupport,undefined);
        const money=f.state.player.money;
        assert.equal(f.progression.abandonContract().ok,true);
        assert.equal(f.state.player.money,money);
        assert.equal(f.events.filter(e => /recovery support/.test(e.reason)).length,0);
      } finally {f.close();}
    }
  });
  await test('canonical nested shape accepts reordered values but blocks altered economic terms', async () => {
    const f=await fixture();
    try {
      const c=structuredClone(f.progression.rescueContract());
      c.bonus={quality:c.bonus.quality,time:c.bonus.time};
      assert.ok(canonicalEmergencyContract(c));
      c.bonus.time++;
      assert.equal(canonicalEmergencyContract(c),null);
      assert.equal(f.progression.acceptContract(c).ok,false);
    } finally {f.close();}
  });
  await test('support is present in result summary and separately labelled in the ledger UI', async () => {
    const source=fs.readFileSync(new URL('../src/ui/screens/results.js',import.meta.url),'utf8');
    assert.match(source,/recoverySupport = Number\.isFinite\(settle\.recoverySupport\)/);
    assert.match(source,/if \(sm\.recoverySupport > 0\) consumeList\.appendChild\(ledgerRow\(/);
    assert.match(source,/'Recovery support', 'All boreholes complete'/);
    const f=await fixture();
    try {
      const {support}=finish(f,{grade:'D',ratio:3});
      assert.ok(support>0);
      assert.equal(f.summaries[0].recoverySupport,support);
      assert.equal(f.events.filter(e=>/recovery support/.test(e.reason)).length,1);
    } finally {f.close();}
  });
  await test('actual fixed-step simulation completes without depth teleport or god mode', async () => {
    const f=await fixture(-1), sim=createDrillSim({state:f.state,bus:f.bus,progression:f.progression});
    try {
      const c=accept(f), completed=[];
      f.bus.on(EVENTS.HOLE_COMPLETE,p=>completed.push(p));
      for(let h=0;h<c.holes;h++) {
        assert.equal(sim.startHole(f.state.contract).active,true);
        sim.setInput('feed',0.45);sim.setInput('rotation',0.5);sim.setInput('flush',0.75);
        for(let step=0;sim.active && step<180000;step++) {
          sim.debug.stepFixed(1);
          const t=sim.getTelemetry();
          if(t.phase==='stuck') sim.pulse('jamRescue');
        }
        assert.equal(sim.active,false);
        assert.equal(completed.length,h+1);
        assert.equal(completed.at(-1).depth,c.targetDepth);
      }
      assert.ok(f.state.player.money>=-1+ECON.brokeBelow);
      console.log('Actual sim completions:',JSON.stringify(completed.map(p=>({depth:p.depth,grade:p.grade,time:p.breakdown.time}))));
    } finally {sim.dispose();f.close();}
  });
} finally {
  if(descriptor) Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;
}
console.log(`Rescue viability: PASS ${passed} groups, ${rows.length} complete-contract accounting scenarios.`);
