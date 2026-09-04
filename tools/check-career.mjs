import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { REGIONS, makeContract, getMethod } from '../src/game/data.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';

let checked=0;
for (const region of REGIONS) {
  for (let seed=1; seed<=3000; seed++) {
    const contract=makeContract(region.id, 80, makeRandom(seed));
    const last=contract.groundSpec.at(-1);
    assert(getMethod(contract.methodId).validGround.includes(last.id),
      `${region.id}, seed ${seed}: ${contract.methodId} ends in ${last.id}`);
    assert(Math.abs(last.bottom-contract.targetDepth)<.01);
    checked++;
  }
}
assert.deepEqual(makeContract('andes',80,makeRandom(42)),makeContract('andes',80,makeRandom(42)));
console.log(`OK ${checked} seeded contracts: drillable final bed, target depth, determinism`);

const entries=new Map();
let failWrites=false;
globalThis.localStorage={
  getItem:k=>entries.get(k)??null,
  setItem(k,v){if(failWrites && k===SAVE_KEY)throw new Error('Simulated quota failure');entries.set(k,v)},
  removeItem:k=>entries.delete(k),
};
const state=createGameState();
const career=createProgression({state,bus:createBus()});
await career.init();
state.player.money=12345;
assert(career.save());
const good=entries.get(SAVE_KEY);
for(const bad of ['{broken','[]','{}','null',JSON.stringify({...JSON.parse(good),unlocked:{methods:7}})]) {
  entries.set(SAVE_BACKUP_KEY,good);entries.set(SAVE_KEY,bad);
  state.player.money=1;
  assert(career.load());assert.equal(state.player.money,12345);
  assert(career.save());assert.equal(entries.get(SAVE_BACKUP_KEY),good);
}
failWrites=true;state.player.money=23456;assert.equal(career.save(),false);
failWrites=false;career.update(1.3);
assert.equal(JSON.parse(entries.get(SAVE_KEY)).player.money,23456);
const job=makeContract('nordic',1,makeRandom(7));
assert(career.acceptContract(job).ok);
const acceptedMoney=state.player.money;
assert(career.acceptContract(job).resumed);
assert.equal(state.player.money,acceptedMoney);
assert.equal(career.acceptContract({...job,id:'different-job'}).ok,false);
assert.equal(state.contract.id,job.id);
assert(career.save());
const restored=createGameState();
const resumed=createProgression({state:restored,bus:createBus()});
await resumed.init();
assert.equal(restored.contract.id,job.id);
assert.equal(restored.player.money,acceptedMoney);
assert(resumed.acceptContract(job).resumed);
assert.equal(restored.player.money,acceptedMoney);
assert(resumed.abandonContract().ok);
assert.equal(restored.contract,null);
assert(resumed.acceptContract({...job,id:'replacement-job'}).ok);
resumed.dispose();career.dispose();delete globalThis.localStorage;
console.log('OK save recovery: malformed primary, preserved backup, retry after write failure');
console.log('OK contract acceptance: no duplicate charge, active job protected, resume after reload');

// Exercise the actual simulation -> completion event -> settlement path.
const playState=createGameState(), playBus=createBus();
const playCareer=createProgression({state:playState,bus:playBus});
await playCareer.init();
const shortJob={...job,id:'career-smoke',holes:2,targetDepth:3,ground:['clay'],
  groundSpec:[{id:'clay',top:0,bottom:3,thickness:3}]};
assert(playCareer.acceptContract(shortJob).ok);
const sim=createDrillSim({state:playState,bus:playBus});sim.init();
for(let hole=0;hole<2;hole++) {
  sim.startHole(shortJob);
  sim.debug.simulate(300,t=>{
    if(t.rodAdd && t.rodAdd.t>=t.rodAdd.windowStart && t.rodAdd.t<=t.rodAdd.windowEnd)sim.pulse('rodStab');
    if(t.jam.state!=='free' && t.jam.rescue.goodNow)sim.pulse('jamRescue');
    return {feed:t.optimal.wob,rotation:t.optimal.rpm,flush:t.optimal.flush};
  });
  assert(!sim.active,`Hole ${hole+1} did not complete`);
  assert.equal(playState.player.career.holesThisContract,hole+1);
}
assert.equal(playState.contract,null);
assert.equal(playState.player.career.contractsDone,1);
assert(playState.player.xp>0);
assert(Number.isFinite(playState.player.money));
sim.dispose();playCareer.dispose();
console.log('OK two-hole career: real drilling, rod changes, payout, XP, contract completion');
