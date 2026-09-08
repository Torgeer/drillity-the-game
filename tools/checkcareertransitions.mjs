#!/usr/bin/env node
/** CPU career transitions: actual screen callbacks parsed from source, real
 * progression/simulation/storage semantics. DOM button and navigation adapters
 * are boundaries only; no browser, renderer or economy reimplementation.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseAst } from 'vite';
import { createGameState, createBus, makeRandom, SCENES, EVENTS } from '../src/core/contract.js';
import { makeContract } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
const paths=['src/ui/screens/site.js','src/ui/screens/results.js','src/game/progression.js','src/sim/drilling.js'];
const source=Object.fromEntries(paths.map(p=>[p,readFileSync(new URL('../'+p,import.meta.url),'utf8')]));
const hashes=Object.fromEntries(paths.map(p=>[p,createHash('sha256').update(source[p]).digest('hex')]));
function nodes(path,predicate){const matches=[];function walk(n){if(!n||typeof n!=='object')return;if(predicate(n))matches.push(n);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}walk(parseAst(source[path]));return matches;}
function extract(path,predicate){const found=nodes(path,predicate);assert.equal(found.length,1,'One actual source implementation');return source[path].slice(found[0].start,found[0].end);}
const site='src/ui/screens/site.js',results='src/ui/screens/results.js';
const abandon=extract(site,n=>n.type==='FunctionDeclaration'&&n.id?.name==='abandonFromSite');
assert.equal(nodes(site,n=>n.type==='CallExpression'&&n.callee?.object?.name==='C'&&n.callee?.property?.name==='tap'&&n.arguments[0]?.name==='pauseBtn'&&n.arguments[1]?.name==='abandonFromSite').length,1,'Native exit binds tested handler');
const siteUnmount=extract(site,n=>n.type==='Property'&&n.method&&n.key?.name==='unmount');
const leaveState=extract(site,n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id?.name==='leavePending'));
const siteFactory=new Function('app','SCENES','EVENTS',`const ctx=app.ctx,state=ctx.state;${leaveState}
const say=(...a)=>app.notices.push(a),clearAlert=()=>{},resetWell=()=>{},resetProgramme=()=>{};
${abandon};return {leave:abandonFromSite,unmount:({${siteUnmount}}).unmount};`);
const buttonSource=extract(results,n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id?.name==='againBtn'));
const syncSource=extract(results,n=>n.type==='FunctionDeclaration'&&n.id?.name==='syncNextAction');
for(const name of ['mount','update']){
 const method=extract(results,n=>n.type==='Property'&&n.method&&n.key?.name===name);
 assert.ok(method.includes('syncNextAction()'),name+' refreshes live result action');
}
const resultsFactory=new Function('app','SCENES',`const state=app.ctx.state;let nextActionLabel='';
const label={textContent:''},attrs={};const C={Button:o=>({onTap:o.onTap,querySelector:()=>label,setAttribute:(k,v)=>attrs[k]=v})};
${buttonSource};${syncSource};return {click:againBtn.onTap,sync:syncNextAction,label,attrs};`);
const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
const contexts=[],tests=[];
const test=(name,fn)=>tests.push({name,fn});
function contract(holes=3,ordinal=0){const rand=makeRandom(20260906);let found=0;for(let i=0;i<1000;i++){const c=makeContract('nordic',1,rand);if(c.holes===holes&&found++===ordinal)return c;}throw Error('No fitting generated contract');}
async function fresh(holes=3){
 const store={values:new Map(),writes:0,getItem(k){return this.values.get(k)??null;},setItem(k,v){this.writes++;this.values.set(k,String(v));},removeItem(k){this.values.delete(k);}};
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:store});
 const ctx={state:createGameState(),bus:createBus(),rand:makeRandom(5),SCENES};
 ctx.progression=createProgression(ctx);await ctx.progression.init();ctx.sim=createDrillSim(ctx);
 const c=contract(holes);assert.equal(ctx.progression.acceptContract(c).ok,true);ctx.state.scene=SCENES.SITE;
 const app={ctx,state:ctx.state,bus:ctx.bus,notices:[],shows:[],confirm:async()=>true,toast(...args){this.notices.push(args);},nav(scene,params){this.shows.push({scene,params});ctx.state.scene=scene;}};
 const t={...ctx,app,c,store,site:siteFactory(app,SCENES,EVENTS),results:resultsFactory(app,SCENES),completions:[]};
 ctx.bus.on(EVENTS.HOLE_COMPLETE,p=>t.completions.push(p));contexts.push(t);return t;
}
const book=t=>JSON.stringify(t.progression.serialise());
function start(t){t.state.scene=SCENES.SITE;t.sim.startHole(t.state.contract);return t.progression.run.attemptId;}
function finish(t){t.sim.debug.stepFixed(60);t.sim.debug.setDepth(t.c.targetDepth);t.sim.debug.stepFixed(10);const p=t.completions.at(-1);assert.ok(p);assert.ok(t.progression.settlementForCompletion(p));t.state.scene=SCENES.RESULTS;return p;}
function label(t,want){t.results.sync();assert.equal(t.results.label.textContent,want);assert.equal(t.results.attrs['aria-label'],want);}
test('cancel leaves physical run, career and saves unchanged',async()=>{
 const t=await fresh();start(t);t.progression.save();const before=book(t),physical=structuredClone(t.sim.debug.state),writes=t.store.writes;
 t.app.confirm=async()=>false;await t.site.leave();assert.equal(book(t),before);assert.deepEqual(t.sim.debug.state,physical);assert.equal(t.store.writes,writes);assert.equal(t.app.shows.length,0);
});
test('explicit confirmed abandon closes career and persists before next acceptance',async()=>{
 const t=await fresh();start(t);const money=t.state.player.money,rep=t.state.player.career.reputation.nordic||0;
 await t.site.leave();assert.equal(t.sim.active,false);assert.equal(t.progression.run,null);assert.equal(t.state.contract,null);
 assert.equal(t.state.player.money,money);assert.ok((t.state.player.career.reputation.nordic||0)<rep);assert.equal(t.app.shows.at(-1).scene,SCENES.CONTRACTS);
 assert.equal(t.progression.load(),true);assert.equal(t.state.contract,null,'Saved abandonment must not resurrect');
 assert.equal(t.progression.acceptContract(contract(3,1)).ok,true,'Board is no longer blocked by abandoned job');
});
test('normal site unmount does not abandon or stop the run',async()=>{
 const t=await fresh();start(t);const before=book(t);t.site.unmount();assert.equal(book(t),before);assert.equal(t.sim.active,true);
});
test('failed save warns after abandonment and the existing retry persists it',async()=>{
 const t=await fresh();start(t);t.progression.save();const set=t.store.setItem;t.store.setItem=()=>{throw Error('fixture quota');};
 await t.site.leave();assert.equal(t.state.contract,null);assert.equal(t.sim.active,false);assert.equal(t.app.shows.at(-1).scene,SCENES.CONTRACTS);
 assert.ok(t.app.notices.some(n=>n[0].includes('Saving failed')),'Failed write is visible, not claimed persisted');
 t.store.setItem=set;t.progression.update(2);assert.equal(t.progression.load(),true);assert.equal(t.state.contract,null,'Pending abandonment retries through real persistence');
});
test('duplicate pending confirmations charge abandonment reputation once',async()=>{
 const t=await fresh();start(t);let resolve,confirms=0;t.app.confirm=()=>{confirms++;return new Promise(r=>resolve=r);};
 const a=t.site.leave(),b=t.site.leave();assert.equal(confirms,1);resolve(true);await Promise.all([a,b]);assert.equal(t.app.shows.length,1);assert.equal(t.state.contract,null);
});
test('late confirmation cannot abandon a replacement contract or changed attempt',async()=>{
 for(const replacement of [true,false]){const t=await fresh();start(t);let resolve;t.app.confirm=()=>new Promise(r=>resolve=r);const waiting=t.site.leave();
  if(replacement){t.sim.abortHole();assert.equal(t.progression.abandonContract().ok,true);assert.equal(t.progression.acceptContract(contract(3,1)).ok,true);}start(t);
  const before=book(t);resolve(true);await waiting;assert.equal(book(t),before);assert.equal(t.sim.active,true);assert.equal(t.app.shows.length,0);
 }
});
test('leaving and returning invalidates an old confirmation without abandonment',async()=>{
 const t=await fresh();start(t);let resolve;t.app.confirm=()=>new Promise(r=>resolve=r);const pending=t.site.leave();
 const before=book(t);t.site.unmount();t.state.scene=SCENES.MENU;t.state.scene=SCENES.SITE;resolve(true);await pending;
 assert.equal(book(t),before);assert.equal(t.sim.active,true);assert.equal(t.app.shows.length,0);
});
test('synchronous stop observer replacing the job cannot abandon its replacement',async()=>{
 const t=await fresh();start(t);let replacementRun;
 const unsub=t.bus.on(EVENTS.DRILL_STOP,()=>{unsub();assert.equal(t.progression.abandonContract().ok,true);assert.equal(t.progression.acceptContract(contract(3,1)).ok,true);start(t);replacementRun=t.progression.run.runId;});
 await t.site.leave();assert.equal(t.progression.run.runId,replacementRun);assert.equal(t.sim.active,true);assert.equal(t.app.shows.length,0);
});
test('partial results start each next hole exactly once without new mobilisation',async()=>{
 const t=await fresh(),identities=[];
 for(let i=1;i<=3;i++){
  identities.push(start(t));finish(t);assert.equal(t.state.player.stats.holesDone,i);assert.ok(t.state.player.career.ledger[0].revenue>=0);
  const before=book(t),money=t.state.player.money;
  label(t,i<3?'Next hole':'Next contract');t.results.click();assert.equal(book(t),before,'Navigation does not settle or charge');assert.equal(t.state.player.money,money);
  assert.equal(t.app.shows.at(-1).scene,i<3?SCENES.SITE:SCENES.CONTRACTS);
  if(i<3)assert.equal(t.app.shows.at(-1).params.contract,t.state.contract);
 }
 assert.equal(new Set(identities).size,3);assert.equal(t.state.contract,null);
});
test('partial payout stays paid when remaining contract is explicitly abandoned',async()=>{
 const t=await fresh();start(t);finish(t);const paid=t.state.player.money,ledger=JSON.stringify(t.state.player.career.ledger);start(t);
 await t.site.leave();assert.equal(t.state.player.money,paid);assert.equal(JSON.stringify(t.state.player.career.ledger),ledger);assert.equal(t.state.contract,null);
});
test('restored partial results continue same run; changed state updates labels and click target',async()=>{
 const t=await fresh();start(t);finish(t);const run=t.progression.run.runId;t.progression.save();assert.equal(t.progression.load(),true);
 label(t,'Next hole');t.results.click();assert.equal(t.app.shows.at(-1).scene,SCENES.SITE);start(t);assert.equal(t.progression.run.runId,run);label(t,'Resume hole');
 t.sim.abortHole();t.progression.abandonContract();label(t,'Next contract');t.results.click();assert.equal(t.app.shows.at(-1).scene,SCENES.CONTRACTS);
});
let failed=0;
try{for(const {name,fn}of tests){try{await fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}}
finally{for(const t of contexts){t.sim.dispose();t.progression.dispose();}if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;}
for(const p of paths)assert.equal(createHash('sha256').update(readFileSync(new URL('../'+p,import.meta.url),'utf8')).digest('hex'),hashes[p],p+' stable during gate');
console.log(JSON.stringify({passed:tests.length-failed,failed,sourceHashes:hashes}));if(failed)process.exitCode=1;
