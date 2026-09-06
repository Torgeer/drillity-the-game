#!/usr/bin/env node
// Synthetic accounting fixtures, NOT SOURCED physical timing calibration.
// Uses real public estimator, generated cards, simulator completion payloads,
// progression settlement and persisted career clocks. No browser or GPU.
import assert from 'node:assert/strict';
import { METHODS, REGIONS, makeContract, getMethod, defaultLoadoutFor,
  estimateHours, estimateHoursBreakdown } from '../src/game/data.js';
import { createGameState, createBus, makeRandom, SCENES, EVENTS } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { mobilisationHours } from '../src/game/economy.js';
import { createDrillSim, TUNING } from '../src/sim/drilling.js';

const cents = x => +x.toFixed(2), measurements = [];
let checks = 0;
function equal(a,b,label) { assert.equal(a,b,label); checks++; }
const jumbo = getMethod('tunnel-jumbo');
for (const depth of [0,0.1,2.435,10,24]) for (const hardness of [0,0.5,1]) for (const holes of [0,0.25,1,2]) {
  const cycle = depth / Math.max(0.15, 0.5 * (1.35 - 0.7 * hardness));
  const flat = holes * 10;
  assert.deepEqual(estimateHoursBreakdown(jumbo.id,depth,hardness,holes),
    { drill:0, cycle, flat, total:cycle+flat }); checks++;
  equal(estimateHours(jumbo.id,depth,hardness,holes), cycle+flat,'Public total');
}
// Actual deterministic generated cards: estimate and deadline consume the same
// corrected generator-time hardness (rounded by the contract only afterwards).
const rand = makeRandom(20260906);
let jumboCards = 0;
for (let i=0;i<6400;i++) {
  const c = makeContract(REGIONS[i % REGIONS.length].id,60,rand);
  assert.ok(c); checks++;
  if(c.methodId !== jumbo.id) continue;
  jumboCards++;
  // Published hardness is rounded to 3 decimals; permit only that propagated
  // error plus the published hour's 0.1 h rounding, not a broad percentage.
  const raw = c.metres / (0.5 * (1.35 - 0.7*c.hardness)) + c.holes*10;
  const maxRounding = Math.max(...[-0.0005,0.0005].map(d =>
    Math.abs(c.metres / (0.5*(1.35-0.7*(c.hardness+d))) + c.holes*10 - raw))) + 0.05000001;
  assert.ok(Math.abs(c.estimatedHours-raw)<=maxRounding, `Generated ${c.id}`); checks++;
  assert.ok(c.deadlineHours >= Math.round((raw-maxRounding)*1.08), 'Deadline floor'); checks++;
}
assert.ok(jumboCards>30, `Nonempty jumbo coverage: ${jumboCards}`);
const saved = Object.getOwnPropertyDescriptor(globalThis,'localStorage');
try {
  for (const timeFraction of [0.6,1.4]) {
    const data = new Map();
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
      getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}});
    const state=createGameState(),bus=createBus();
    const progression=createProgression({state,bus,rand:makeRandom(17),SCENES});
    let sim;
    try {
      await progression.init();
      state.player.level=60; state.player.money=1000000;
      state.unlocked.methods=[jumbo.id]; state.unlocked.rigs=[jumbo.rigIds[0]];
      state.garage.rigId=jumbo.rigIds[0]; state.garage.loadout=defaultLoadoutFor(jumbo.id,60);
      const c={id:`actual-par-${timeFraction}`,methodId:jumbo.id,regionId:'nordic',
        targetDepth:10,metres:10,holes:1,hardness:0.5,abrasivity:0.5,holeDia:48,
        payout:24000,deadlineHours:100,requiredCerts:[],difficulty:1,
        archetype:'underground-drive',flushMedium:jumbo.flushMedium,seed:17};
      equal(progression.acceptContract(c).ok,true,'Actual acceptance');
      sim=createDrillSim({state,bus,progression}); sim.init();
      let payload;
      bus.on(EVENTS.HOLE_COMPLETE,p=>{payload=p;});
      equal(sim.startHole(c).active,true,'Actual simulator start');
      const actualPar=sim.getTelemetry().parSec;
      assert.ok(actualPar>0&&Number.isFinite(actualPar)); checks++;
      // Test acceleration only: run the real clock to a non-unit par ratio,
      // then teleport the endpoint through the public debug API. Never forge
      // computePar, scoreBreakdown, the completion payload or settlement time.
      sim.setInput('feed',0); sim.setInput('rotation',0);
      sim.debug.stepFixed(Math.ceil(actualPar*timeFraction*TUNING.sim.hz));
      assert.ok(sim.active,'Fixture must still be active before endpoint teleport');
      const beforeHours=state.player.career.hoursWorked, beforeDays=state.player.career.daysElapsed;
      sim.debug.setDepth(c.targetDepth); sim.debug.stepFixed(20);
      assert.ok(payload,'Actual simulation emitted HOLE_COMPLETE'); checks++;
      const {parSec,actualSec}=payload.breakdown.time;
      equal(parSec,+actualPar.toFixed(1),'Production computePar in completion');
      const ratio=Math.max(0.4,Math.min(3,actualSec/parSec));
      assert.ok(Math.abs(ratio-1)>0.1,'Non-unit real payload ratio'); checks++;
      const expected=cents(20*ratio+10+mobilisationHours(jumbo.rigIds[0],jumbo.id));
      const result=progression.settlementForCompletion(payload);
      assert.ok(result,'Actual completion identity has settlement receipt'); checks++;
      equal(result.hours,expected,'Actual completion settlement hours');
      assert.ok(Math.abs(state.player.career.hoursWorked-beforeHours-expected)<1e-9); checks++;
      assert.ok(Math.abs(state.player.career.daysElapsed-beforeDays-expected/11)<1e-9); checks++;
      measurements.push({actualPar,parSec,actualSec,ratio,hours:result.hours,
        provenance:'Real computePar and emitted scoreBreakdown; debug endpoint teleport, not a physical completed-cycle observation'});
    } finally {sim?.dispose();progression.dispose();}
  }
} finally {if(saved)Object.defineProperty(globalThis,'localStorage',saved);else delete globalThis.localStorage;}
console.log(JSON.stringify({checks,jumboCards,measurements},null,2));
