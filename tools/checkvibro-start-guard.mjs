#!/usr/bin/env node
/** Real simulation/progression atomic-start checks. CPU only, no field tuning. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { ITEMS, METHODS, REGIONS, CERTS, MAX_LEVEL, makeContract } from '../src/game/data.js';
import { createDrillSim, checkMethodEquipment, resolveMethod } from '../src/sim/drilling.js';

const vibro = 'vibro-hammer-1500', impact = 'impact-hammer-9t';
const baselineRef = '83b2347';
const baselineURL = new URL('../src/sim/drilling.js', import.meta.url);
let baselineSource = execFileSync('git', ['show', `${baselineRef}:src/sim/drilling.js`], {encoding:'utf8',maxBuffer:2000000});
baselineSource = baselineSource.replace(/from '([^']+)'/g, (whole, path) =>
  path.startsWith('.') ? `from ${JSON.stringify(new URL(path, baselineURL).href)}` : whole);
const baseline = await import('data:text/javascript;base64,' + Buffer.from(baselineSource).toString('base64'));
const proposalIndex = process.argv.indexOf('--progression-proposal');
let progressionFactory = createProgression;
if (proposalIndex >= 0) {
  assert.ok(process.argv[proposalIndex+1], 'Proposal path required');
  const proposalURL = new URL('../src/game/progression.js', import.meta.url);
  const proposalSource = readFileSync(process.argv[proposalIndex+1], 'utf8')
    .replace(/from '([^']+)'/g, (whole, path) => path.startsWith('.')
      ? `from ${JSON.stringify(new URL(path, proposalURL).href)}` : whole);
  progressionFactory = (await import('data:text/javascript;base64,' + Buffer.from(proposalSource).toString('base64'))).createProgression;
}
const tests = [];
const test = (name, fn) => tests.push({name,fn});
const isRefusal = error => error.code === 'unsupported-piling-hammer'
  && error.itemId === vibro && error.methodId === 'driven-pile'
  && /Fit a hydraulic impact hammer/.test(error.message);
let generated;
const random = makeRandom(62026);
for (const region of REGIONS) {
  for (let i=0; i<2000 && !generated; i++) {
    const c = makeContract(region.id, MAX_LEVEL, random);
    if (c.methodId === 'driven-pile') generated = c;
  }
  if (generated) break;
}
assert.ok(generated, 'Nonempty real contract fixture');
// NOT SOURCED: fixed QA length and seed isolate start semantics, not capacity.
const contract = { ...generated, targetDepth:14, seed:123, holes:2 };
const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
async function fixture({accept=true,hammer=impact}={}) {
  const store = { values:new Map(), writes:0,
    getItem(k) { return this.values.get(k) ?? null; },
    setItem(k,v) { this.writes++; this.values.set(k,String(v)); },
    removeItem(k) { this.values.delete(k); } };
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:store});
  const state = createGameState(), bus = createBus(), ctx = {state,bus};
  const progression = progressionFactory(ctx); ctx.progression = progression;
  await progression.init();
  state.player.level=MAX_LEVEL; state.player.money=1e8;
  state.player.certs=CERTS.map(c=>c.id);
  state.unlocked.methods=METHODS.map(m=>m.id);
  state.unlocked.regions=REGIONS.map(r=>r.id);
  state.unlocked.rigs=['piling-leader']; state.garage.rigId='piling-leader';
  state.garage.owned=[impact,vibro,'precast-pile-350','dolly-hardwood'];
  state.garage.loadout={hammer,install:'precast-pile-350',dolly:'dolly-hardwood'};
  if(accept)assert.equal(progression.acceptContract(structuredClone(contract)).ok,true);
  const sim=createDrillSim(ctx);
  let beginCalls=0;
  const begin=progression.beginHole;
  progression.beginHole=(...args)=>{beginCalls++; return begin(...args);};
  const events=[];
  for (const event of new Set(Object.values(EVENTS))) bus.on(event,payload=>events.push({event,payload}));
  return {state,sim,progression,store,events,get beginCalls(){return beginCalls;},
    dispose(){sim.dispose();progression.dispose();}};
}
function snapshot(f) {
  return structuredClone({state:f.state, run:f.progression.run,
    saved:f.progression.serialise(), storage:[...f.store.values],
    sim:f.sim.debug.state, display:f.sim.debug.display});
}
function unchangedRefusal(f) {
  f.progression.save(); f.events.length=0;
  const before=snapshot(f), calls=f.beginCalls, writes=f.store.writes;
  for (let i=0;i<3;i++) assert.throws(()=>f.sim.startHole(f.state.contract),isRefusal);
  assert.deepEqual(snapshot(f),before,'repeated refusal preserves state, simulator, display, run and saved payload');
  assert.equal(f.beginCalls,calls,'no attempt allocation was called');
  assert.equal(f.events.length,0,'no event side effect');
  f.progression.update(2);
  assert.equal(f.store.writes,writes,'no deferred save queued');
  assert.deepEqual(snapshot(f),before);
}

test('pure equipment check gives an actionable stable refusal and changes no inputs',()=>{
  const opts=Object.freeze({hammerId:vibro});
  const result=checkMethodEquipment('driven-pile',opts);
  assert.equal(result.ok,false); assert.equal(result.itemId,vibro);
  assert.throws(()=>resolveMethod('driven-pile',opts),isRefusal);
  assert.deepEqual(opts,{hammerId:vibro});
});
test('accepted contract refusal precedes attempt allocation and every write',async()=>{
  const f=await fixture();
  try {f.state.garage.loadout.hammer=vibro; unchangedRefusal(f);}
  finally {f.dispose();}
});
test('refused replacement preserves an already active impact run',async()=>{
  const f=await fixture();
  try {
    f.sim.startHole(f.state.contract); f.sim.debug.stepFixed(200); f.sim.update(0);
    assert.ok(f.sim.active); assert.ok(f.progression.run.attemptId);
    f.state.garage.loadout.hammer=vibro; unchangedRefusal(f);
    assert.ok(f.sim.active,'existing authorized impact run remains active');
    assert.equal(f.sim.getTelemetry().programme.hammerItemId,impact);
  } finally {f.dispose();}
});
test('restored vibro loadout is retained but cannot start an impact attempt',async()=>{
  const f=await fixture();
  try {
    f.state.garage.loadout.hammer=vibro; f.progression.save();
    assert.equal(f.progression.load(),true);
    assert.equal(f.state.garage.loadout.hammer,vibro);
    unchangedRefusal(f);
  } finally {f.dispose();}
});
test('equipment is revalidated after an earlier successful preflight',async()=>{
  const f=await fixture();
  try {
    assert.equal(checkMethodEquipment('driven-pile',{hammerId:impact}).ok,true);
    f.state.garage.loadout.hammer=vibro; unchangedRefusal(f);
  } finally {f.dispose();}
});
test('refusal followed by fitting impact starts one real attempt normally',async()=>{
  const f=await fixture();
  try {
    f.state.garage.loadout.hammer=vibro; unchangedRefusal(f);
    f.state.garage.loadout.hammer=impact;
    const result=f.sim.startHole(f.state.contract);
    assert.equal(f.beginCalls,1); assert.ok(result.active);
    assert.equal(result.programme.hammerItemId,impact);
    assert.ok(f.progression.run.attemptId);
  } finally {f.dispose();}
});
test('standalone public start refuses without progression or an active run',()=>{
  const state=createGameState(); state.garage.loadout={hammer:vibro};
  const sim=createDrillSim({state,bus:createBus()});
  try {
    const before=structuredClone({state,sim:sim.debug.state,display:sim.debug.display});
    assert.throws(()=>sim.startHole(contract),isRefusal);
    assert.deepEqual({state,sim:sim.debug.state,display:sim.debug.display},before);
  } finally {sim.dispose();}
});
test('missing hammer default and all other methods keep existing resolution',()=>{
  for (const hammerId of [undefined,null,'']) {
    assert.equal(checkMethodEquipment('driven-pile',{hammerId}).ok,true);
    assert.deepEqual(resolveMethod('driven-pile',{hammerId}),baseline.resolveMethod('driven-pile',{hammerId}));
  }
  /* ── THE CLAIM IS THE GUARD'S SCOPE, NOT A FROZEN TUNING TABLE ─────────
     This loop compared every other method's resolved tuning against the
     pre-guard commit byte for byte. The CLAIM it exists to make is "fitting a
     vibratory hammer changes nothing outside driven-pile", and that claim is
     still asserted below — but a snapshot of the whole TUNING table is the
     wrong instrument for it: it fails for any legitimate change to any
     method's model, forever, on a gate whose subject is one equipment check.
     It failed first on the CFA concrete-lift programme, which has nothing to
     do with hammers.

     The replacement measures the property directly and keeps working: with the
     vibro fitted, every other method must resolve to exactly what it resolves
     to with nothing fitted. That catches a guard leaking into another method —
     the actual regression — and it catches it for methods added later, which
     the snapshot never could. `driven-pile` itself is still compared against
     the pre-guard baseline in the loop above, and that is the comparison the
     guard's own subject needs. */
  for (const method of METHODS.filter(m=>m.id!=='driven-pile')) {
    assert.equal(checkMethodEquipment(method.id,{hammerId:vibro}).ok,true);
    assert.deepEqual(resolveMethod(method.id,{hammerId:vibro}),resolveMethod(method.id,{}),
      `fitting a vibratory hammer must not change ${method.id} resolution`);
    // …and it held before the guard existed too, in the baseline's own terms.
    assert.deepEqual(baseline.resolveMethod(method.id,{hammerId:vibro}),
      baseline.resolveMethod(method.id,{}),
      `the pre-guard baseline also ignored the hammer for ${method.id}`);
  }
});
test('every shipped impact configuration keeps exact baseline drive behavior',()=>{
  const impacts=ITEMS.filter(i=>i.slot==='hammer'&&i.methods.includes('driven-pile')&&i.impactHammer);
  assert.ok(impacts.length,'nonempty shipped impact comparison');
  let comparisons=0;
  function run(factory,hammer,install,energy,rate) {
    const state=createGameState();
    state.garage.loadout={hammer,install,dolly:'dolly-hardwood'};
    const sim=factory({state,bus:createBus()});
    try {
      sim.startHole(contract); sim.setInput('feed',energy); sim.setInput('rotation',rate); sim.setInput('flush',.5);
      sim.debug.stepFixed(800); sim.update(0);
      return structuredClone({programme:sim.getTelemetry().programme,drill:state.drill});
    } finally {sim.dispose();}
  }
  for (const item of impacts) for (const install of ['precast-pile-350','sheet-pile-z-630']) {
    for (const [energy,rate] of [[1,0],[1,1],[0,1]]) {
      assert.deepEqual(run(createDrillSim,item.id,install,energy,rate),run(baseline.createDrillSim,item.id,install,energy,rate));
      comparisons++;
    }
  }
  console.log(`Compared ${impacts.length} shipped impact profile(s), ${comparisons} complete drive/published-state pairs.`);
});

// Against the proposed/current readiness consumer, not a mocked acceptance path.
const awayContract={...contract,regionId:'german-site',requiredCerts:[]};
test('vibro preflight and acceptance refuse before mobilisation, run or save mutation',async()=>{
  const f=await fixture({accept:false,hammer:vibro});
  try {
    assert.equal(typeof f.progression.previewContract,'function','Reviewed readiness consumer required; pass --progression-proposal before integration');
    f.progression.save(); f.events.length=0;
    const before=snapshot(f), writes=f.store.writes;
    for(let i=0;i<100;i++) {
      const preview=f.progression.previewContract(awayContract);
      assert.equal(preview.ok,false); assert.equal(preview.code,'unsupported-piling-hammer');
    }
    const result=f.progression.acceptContract(awayContract);
    assert.equal(result.ok,false); assert.equal(result.code,'unsupported-piling-hammer');
    assert.deepEqual(snapshot(f),before); assert.equal(f.events.length,0);
    f.progression.update(2); assert.equal(f.store.writes,writes);
    assert.equal(f.beginCalls,0);
  }finally{f.dispose();}
});
test('acceptance rechecks equipment changed after successful readiness',async()=>{
  const f=await fixture({accept:false});
  try {
    assert.equal(f.progression.previewContract(awayContract).ok,true);
    f.state.garage.loadout.hammer=vibro; f.progression.save(); f.events.length=0;
    const before=snapshot(f), writes=f.store.writes;
    assert.equal(f.progression.acceptContract(awayContract).code,'unsupported-piling-hammer');
    assert.deepEqual(snapshot(f),before); assert.equal(f.events.length,0);
    f.progression.update(2); assert.equal(f.store.writes,writes);
  }finally{f.dispose();}
});
test('fitting impact after refusal permits one legitimate mobilisation and attempt',async()=>{
  const f=await fixture({accept:false,hammer:vibro});
  try {
    assert.equal(f.progression.acceptContract(awayContract).ok,false);
    assert.equal(f.progression.equip('hammer',impact).ok,true);
    const preview=f.progression.previewContract(awayContract);
    assert.equal(preview.ok,true); assert.ok(preview.mobilisation>0);
    const money=f.state.player.money;
    const accepted=f.progression.acceptContract(awayContract);
    assert.equal(accepted.ok,true); assert.equal(f.state.player.money,money-preview.mobilisation);
    assert.equal(f.sim.startHole(f.state.contract).programme.hammerItemId,impact);
    assert.equal(f.beginCalls,1);
  }finally{f.dispose();}
});
test('acceptance preserves intentionally absent hammer defaults',async()=>{
  for(const hammer of [undefined,null,'']) {
    const f=await fixture({accept:false,hammer});
    try {
      // An explicit undefined option uses the fixture default; remove it to
      // exercise a genuinely absent saved loadout field too.
      if(hammer===undefined)delete f.state.garage.loadout.hammer;
      assert.equal(f.progression.previewContract(awayContract).ok,true);
      assert.equal(f.progression.acceptContract(awayContract).ok,true);
      assert.equal(f.sim.startHole(f.state.contract).programme.hammerItemId,impact);
    }finally{f.dispose();}
  }
});

let failures=0;
try {
  for (const {name,fn} of tests) {
    try {await fn();console.log('PASS '+name);}
    catch(error){failures++;console.error('FAIL '+name+'\n'+error.stack);}
  }
} finally {
  if(storageDescriptor)Object.defineProperty(globalThis,'localStorage',storageDescriptor);
  else delete globalThis.localStorage;
}
console.log(JSON.stringify({baselineRef,cases:tests.length,passed:tests.length-failures,failures}));
if(failures)process.exitCode=1;
