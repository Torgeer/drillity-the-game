#!/usr/bin/env node
/** Independent containment critic: real simulation/progression, no GPU.
 * Synthetic contract/step counts are NOT SOURCED test inputs, not field claims.
 * A refused start must preserve the existing run and all accounting authority.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { METHODS, CERTS, RIGS, MAX_LEVEL } from '../src/game/data.js';
import * as simulation from '../src/sim/drilling.js';

// A proposal lives outside the private source tree. Resolve its imports against
// this tree's actual dependency modules, rather than silently testing old code.
const proposalAt = process.argv.indexOf('--progression-source');
const proposalPath = proposalAt < 0 ? null : resolve(process.argv[proposalAt + 1] || '');
if (proposalAt >= 0) assert.ok(process.argv[proposalAt + 1], '--progression-source requires a file');
const progressionURL = new URL('../src/game/progression.js', import.meta.url);
const proposalCode = proposalPath ? readFileSync(proposalPath, 'utf8').replace(/from '([^']+)'/g,
  (all, path) => path.startsWith('.') ? `from ${JSON.stringify(new URL(path, progressionURL).href)}` : all) : null;
const { createProgression } = await import(proposalCode
  ? 'data:text/javascript;base64,' + Buffer.from(proposalCode).toString('base64') : progressionURL.href);

const IMPACT = 'impact-hammer-9t', VIBRO = 'vibro-hammer-1500';
const contract = { id: 'critic-vibro', methodId: 'driven-pile', regionId: 'nordic', archetype: 'urban-plot',
  targetDepth: 14, holes: 1, payout: 12000, difficulty: 2, requiredCerts: [],
  flushMedium: 'none', seed: 123, holeDia: 350 };
const cases = [], measurements = [];
const test = (name, fn) => cases.push({ name, fn });
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const hash = p => createHash('sha256').update(readFileSync(new URL('../' + p, import.meta.url))).digest('hex');
const hashes = () => ({ ...Object.fromEntries(['src/sim/drilling.js',
  'src/game/data.js', 'src/game/economy.js', 'src/game/equipment-support.js',
  'src/core/contract.js'].map(p => [p, hash(p)])),
  progression: createHash('sha256').update(readFileSync(proposalPath || progressionURL)).digest('hex') });
const sourceBefore = hashes();
function memoryStorage() {
  const values = new Map();
  return { values, writes: 0, reads: 0, removes: 0,
    getItem(k) { this.reads++; return values.get(k) ?? null; },
    setItem(k,v) { this.writes++; values.set(k,String(v)); },
    removeItem(k) { this.removes++; values.delete(k); } };
}
function fresh(hammer = VIBRO, progression = undefined) {
  const state = createGameState(), bus = createBus(), events = [];
  state.contract = structuredClone(contract);
  state.garage.loadout = { hammer, dolly: 'dolly-hardwood', install: 'precast-pile-350' };
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({event,payload}));
  const sim = simulation.createDrillSim({state,bus,progression});
  return {state,bus,events,sim,progression};
}
function snapshot(f) {
  return JSON.stringify({state:f.state,sim:f.sim.debug.state,display:f.sim.debug.display,
    telemetry:f.sim.getTelemetry(),events:f.events,
    save:f.progression?.serialise(),run:f.progression?.run,
    storage:f.store && {values:[...f.store.values],reads:f.store.reads,writes:f.store.writes,removes:f.store.removes}});
}
function reject(f, c = f.state.contract) {
  const before = snapshot(f), S = f.sim.debug.state, m = S.m, prog = S.prog, cmds = S.cmd;
  assert.throws(() => f.sim.startHole(c), e => e.code === 'unsupported-piling-hammer'
    && e.itemId === VIBRO && e.methodId === 'driven-pile' && /cannot start|not supported|unsupported/i.test(e.message));
  assert.equal(snapshot(f), before, 'refusal must preserve full state, simulator, telemetry, events, run, save and storage');
  assert.equal(f.sim.debug.state,S);assert.equal(S.m,m);assert.equal(S.prog,prog);assert.equal(S.cmd,cmds);
}
async function career(store = memoryStorage(), restore = false, accept = true) {
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:store});
  const state=createGameState(),bus=createBus(),events=[];
  const progression=createProgression({state,bus,rand:makeRandom(371)});await progression.init();
  if(!restore) {
    state.player.level=MAX_LEVEL;state.player.money=1e6;state.player.certs=CERTS.map(c=>c.id);
    state.unlocked.methods=METHODS.map(m=>m.id);state.unlocked.rigs=RIGS.map(r=>r.id);
    state.garage.rigId=RIGS.find(r=>r.methods.includes('driven-pile')).id;
    state.garage.owned.push(VIBRO,IMPACT,'dolly-hardwood','precast-pile-350');
    state.garage.loadout={hammer:accept ? IMPACT : VIBRO,dolly:'dolly-hardwood',install:'precast-pile-350'};
    // Existing jobs can predate containment, or equipment can change after a
    // supported acceptance. Preserve that recovery path without evading preflight.
    if(accept)assert.equal(progression.acceptContract(structuredClone(contract)).ok,true);
    state.garage.loadout.hammer=VIBRO;
  }
  for(const event of new Set(Object.values(EVENTS)))bus.on(event,payload=>events.push({event,payload}));
  const sim=simulation.createDrillSim({state,bus,progression});
  assert.equal(progression.save(),true);
  return {state,bus,events,progression,sim,store};
}

test('pure support result is detached and cannot authorize a rejected resolver',()=>{
  assert.equal(typeof simulation.checkMethodEquipment,'function');
  const options=Object.freeze({hammerId:VIBRO});
  const check=simulation.checkMethodEquipment('driven-pile',options);
  assert.equal(check.ok,false);assert.equal(check.itemId,VIBRO);
  check.ok=true;check.itemId=IMPACT;check.reason='';
  assert.equal(simulation.checkMethodEquipment('driven-pile',options).ok,false);
  assert.throws(()=>simulation.resolveMethod('driven-pile',options),e=>e.code==='unsupported-piling-hammer');
});

test('pristine direct starts refuse repeatedly without state, global randomness or clock reads',()=>{
  const f=fresh(), now=Date.now,random=Math.random;let reads=0;
  Date.now=()=>{reads++;return 123};Math.random=()=>{reads++;return .5};
  try{for(let i=0;i<20;i++)reject(f);assert.equal(reads,0);assert.equal(f.sim.active,false);}
  finally{Date.now=now;Math.random=random;f.sim.dispose();}
});

test('refusal precedes even reading progression.beginHole and proposed run parameters',()=>{
  const f=fresh();let reads=0;
  const authority=new Proxy({}, {get(){reads++;throw Error('progression touched before refusal');}});
  const sim=simulation.createDrillSim({state:f.state,bus:f.bus,progression:authority});
  const proposed={methodId:'driven-pile',get seed(){throw Error('seed read');},get targetDepth(){throw Error('target read');}};
  try{assert.throws(()=>sim.startHole(proposed),e=>e.code==='unsupported-piling-hammer');assert.equal(reads,0);}
  finally{sim.dispose();f.sim.dispose();}
});

test('accepted career refuses before attempt issuance and remains clean after autosave debounce',async()=>{
  const f=await career();const begin=f.progression.beginHole;let calls=0;
  f.progression.beginHole=(...a)=>{calls++;return begin(...a)};
  try{
    const before=snapshot(f);for(let i=0;i<5;i++)reject(f);
    f.progression.update(2);assert.equal(snapshot(f),before);assert.equal(calls,0);
    assert.equal(f.progression.run.attemptId,null);assert.equal(f.state.garage.loadout.hammer,VIBRO);
    f.state.garage.loadout.hammer=IMPACT;
    const started=f.sim.startHole(f.state.contract);assert.ok(started);assert.equal(calls,1);
    assert.ok(f.progression.run.attemptId);assert.equal(started.programme.hammerItemId,IMPACT);
  }finally{f.sim.dispose();}
});

test('restored accepted vibro loadout is retained but cannot start a paid impact attempt',async()=>{
  const initial=await career();initial.sim.dispose();
  const f=await career(initial.store,true);
  try{assert.equal(f.state.garage.loadout.hammer,VIBRO);assert.ok(f.progression.run);
    reject(f,undefined);assert.equal(f.progression.run.attemptId,null);}
  finally{f.sim.dispose();}
});

test('aborted impact run is preserved on vibro restart refusal; valid impact can restart',()=>{
  const f=fresh(IMPACT);
  try{f.sim.startHole(f.state.contract);f.sim.debug.stepFixed(60);f.sim.abortHole('critic-pause');
    f.state.garage.loadout.hammer=VIBRO;reject(f);assert.equal(f.sim.debug.state.phase,'aborted');
    f.state.garage.loadout.hammer=IMPACT;assert.equal(f.sim.startHole(f.state.contract).programme.hammerItemId,IMPACT);}
  finally{f.sim.dispose();}
});

test('rejected replacement preserves active impact run and internal random continuation',()=>{
  const control=fresh(IMPACT), attacked=fresh(IMPACT);
  try{
    for(const f of [control,attacked]){f.sim.startHole(f.state.contract);f.sim.setInput('feed',1);f.sim.setInput('rotation',0);f.sim.setInput('flush',.5);f.sim.debug.stepFixed(220);}
    attacked.state.garage.loadout.hammer=VIBRO;
    for(let i=0;i<12;i++)reject(attacked,{...contract,id:'rejected-replacement',seed:999,targetDepth:90});
    assert.equal(attacked.sim.active,true);attacked.state.garage.loadout.hammer=IMPACT;
    for(const f of [control,attacked]){f.sim.debug.stepFixed(1000);f.sim.update(0);}
    assert.deepEqual(attacked.sim.debug.state,control.sim.debug.state);
    assert.deepEqual(attacked.sim.debug.display,control.sim.debug.display);
    assert.deepEqual(attacked.sim.getTelemetry(),control.sim.getTelemetry());
    measurements.push({case:'preserved deterministic continuation',steps:1220,blows:attacked.sim.getTelemetry().programme.blows});
  }finally{control.sim.dispose();attacked.sim.dispose();}
});

test('selected impact and explicitly retained missing-hammer default still produce the same impact programme',()=>{
  const rows=[];
  for(const hammer of [IMPACT,null,undefined]){
    const f=fresh(hammer);if(hammer===undefined)delete f.state.garage.loadout.hammer;
    try{const start=f.sim.startHole(f.state.contract);assert.ok(start);
      f.sim.setInput('feed',1);f.sim.setInput('rotation',0);f.sim.setInput('flush',.5);f.sim.debug.stepFixed(800);
      const p=f.sim.getTelemetry().programme;assert.equal(p.hammerItemId,IMPACT);assert.equal(p.ramKg,9000);
      assert.ok(p.blows>0);assert.equal(f.sim.pulse('takeSet').ok,true);rows.push(p);
    }finally{f.sim.dispose();}
  }
  assert.deepEqual(rows[1],rows[0]);assert.deepEqual(rows[2],rows[0]);
});

test('foreign unsupported preflight and acceptance preserve all money, identity and save state',async()=>{
  const f=await career(undefined,false,false);
  const c={...contract,regionId:'german-site'};
  try{
    assert.equal(typeof f.progression.previewContract,'function','test actual integrated readiness authority');
    const before=snapshot(f);let quote;
    for(let i=0;i<100;i++){quote=f.progression.previewContract(c);assert.equal(quote.ok,false);assert.equal(quote.code,'unsupported-piling-hammer');}
    assert.equal(snapshot(f),before);assert.equal(quote.itemId,VIBRO);
    assert.equal(quote.reason,simulation.checkMethodEquipment('driven-pile',{hammerId:VIBRO}).reason);
    assert.deepEqual(f.progression.acceptContract(c),quote);
    f.progression.update(2);assert.equal(snapshot(f),before);
    assert.equal(f.progression.run,null);assert.equal(f.state.garage.loadout.hammer,VIBRO);
  }finally{f.sim.dispose();}
});

test('public equip after ready quote is rechecked before mobilisation; fitting impact recovers',async()=>{
  const f=await career(undefined,false,false),c={...contract,regionId:'german-site'};
  try{
    assert.equal(f.progression.equip('hammer',IMPACT).ok,true);
    const ready=f.progression.previewContract(c);assert.equal(ready.ok,true);assert.ok(ready.mobilisation>0);
    assert.equal(f.progression.equip('hammer',VIBRO).ok,true);assert.equal(f.progression.save(),true);
    const before=snapshot(f),refused=f.progression.acceptContract(c);
    assert.equal(refused.ok,false);assert.equal(refused.code,'unsupported-piling-hammer');assert.equal(snapshot(f),before);
    assert.equal(f.progression.equip('hammer',IMPACT).ok,true);const money=f.state.player.money;
    const accepted=f.progression.acceptContract(c);assert.equal(accepted.ok,true);
    assert.equal(accepted.mobilisation,ready.mobilisation);assert.equal(f.state.player.money,money-ready.mobilisation);
    assert.equal(f.sim.startHole(c).programme.hammerItemId,IMPACT);
    measurements.push({case:'foreign charge only after support recovery',mobilisation:accepted.mobilisation});
  }finally{f.sim.dispose();}
});

let passed=0;const failures=[];
try{for(const {name,fn}of cases){try{await fn();passed++;console.log('PASS '+name)}catch(e){failures.push({name,message:e.stack});console.error('FAIL '+name+'\n'+e.stack)}}}
finally{if(originalStorage)Object.defineProperty(globalThis,'localStorage',originalStorage);else delete globalThis.localStorage;}
const sourceAfter=hashes();assert.deepEqual(sourceAfter,sourceBefore,'production source remained unchanged throughout this critic run');
console.log(JSON.stringify({passed,failed:failures.length,cases:cases.length,progressionSource:proposalPath || progressionURL.href,measurements,sourceBefore,failures},null,2));
if(failures.length)process.exitCode=1;
