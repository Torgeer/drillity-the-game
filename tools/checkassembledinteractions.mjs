#!/usr/bin/env node
/** Cross-system regression review. Runs the actual progression and simulation,
 * plus AST-extracted production tap/action/pause callbacks. EventTarget and UI
 * text sinks substitute for DOM: this does not certify browser focus or layout.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseAst } from 'vite';
import { createGameState, createBus, makeRandom, SCENES, EVENTS } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { SITE_ACTIONS } from '../src/ui/screens/catalog.js';
import { subscribeSaveFeedback, saveNoticeModel } from '../src/ui/save-status.js';

assert.equal(process.argv.length, 2, 'No ignored options');
const paths = ['src/ui/components.js', 'src/ui/screens/site.js', 'src/ui/shell.js',
  'src/game/progression.js', 'src/game/data.js', 'src/game/economy.js',
  'src/sim/drilling.js', 'src/ui/save-status.js'];
const sources = Object.fromEntries(paths.map(p => [p, readFileSync(new URL('../' + p, import.meta.url), 'utf8')]));
const hash = source => createHash('sha256').update(source).digest('hex');
const hashes = Object.fromEntries(paths.map(p => [p, hash(sources[p])]));
function select(path, predicate) {
  const found = [];
  const visit = n => {
    if (!n || typeof n !== 'object') return;
    if (predicate(n)) found.push(n);
    for (const v of Object.values(n)) Array.isArray(v) ? v.forEach(visit) : visit(v);
  };
  visit(parseAst(sources[path]));
  assert.equal(found.length, 1, `Exactly one production definition in ${path}`);
  return sources[path].slice(found[0].start, found[0].end);
}
const sitePath = 'src/ui/screens/site.js';
const fn = (path, name) => select(path, n => n.type === 'FunctionDeclaration' && n.id?.name === name);
const variable = name => select(sitePath, n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === name));
const method = name => select(sitePath, n => n.type === 'Property' && n.method && n.key?.name === name);
const pauseGetter = select('src/ui/shell.js', n => n.type === 'Property' && n.kind === 'get' && n.key?.name === 'gameplayPaused');
const tap = new Function('haptic', fn('src/ui/components.js', 'tap') + '; return tap;')(() => {});
const makePause = new Function('SCENES', `let disposed=false,current={id:SCENES.SITE},overlayStack=[];
  const document={visibilityState:'visible'};
  return {${pauseGetter}, scene(id){current={id};}, overlay(on){overlayStack=on?[{}]:[];}, hidden(on){document.visibilityState=on?'hidden':'visible';}};`);
const makeActions = new Function('ctx', 'EVENTS', 'SCENES', 'SITE_ACTIONS', `
  const state=ctx.state,notes=[],journal=[],say=(...v)=>notes.push(v),log=(...v)=>journal.push(v);
  const app={bus:ctx.bus,haptic(){}},feedSl={set(){}},pushControl=()=>{};
  let actionMode='idle',actionTimer=0;
  const setAction=v=>{actionMode=v;};
  ${['actionEpoch', 'PULSE', 'PULSE_REFUSAL'].map(variable).join('\n')}
  ${['invalidateActionOutcomes', 'actionContext', 'actionContextIsCurrent', 'actionRefused', 'startBitChange', 'settleActionOutcomes', 'doAction'].map(n => fn(sitePath, n)).join('\n')}
  return {notes,journal,act(mode){actionMode=mode;return doAction();},invalidate:invalidateActionOutcomes,
    jamCleared:({${method('onJamCleared')}}).onJamCleared};
`);

class TapTarget extends EventTarget {
  constructor() { super(); this.tagName='BUTTON'; this.attributes=new Map(); const s=new Set();
    this.classList={add:n=>s.add(n),remove:n=>s.delete(n),contains:n=>s.has(n)}; }
  hasAttribute(n) { return this.attributes.has(n); }
  setAttribute(n,v) { this.attributes.set(n,String(v)); }
}
const click = node => { const event=new Event('click'); Object.assign(event,{detail:0}); node.dispatchEvent(event); };
const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const fixtures = [], results = [], measurements = [];
const warnings = [];
const originalWarn = console.warn;
console.warn = (...args) => warnings.push(args.map(String).join(' '));
function storage() {
  return { values:new Map(), failPrimary:false, writes:[],
    getItem(k){return this.values.get(k)??null;},
    setItem(k,v){if(k===SAVE_KEY&&this.failPrimary)throw Error('Injected primary failure');this.values.set(k,String(v));this.writes.push(k);},
    removeItem(k){this.values.delete(k);} };
}
async function fixture(store=storage()) {
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:store});
  const ctx={state:createGameState(),bus:createBus(),rand:makeRandom(21),SCENES};
  ctx.progression=createProgression(ctx); await ctx.progression.init();
  ctx.state.scene=SCENES.SITE;ctx.ui=makePause(SCENES);
  ctx.sim=createDrillSim(ctx);ctx.sim.init();
  const actions=makeActions(ctx,EVENTS,SCENES,SITE_ACTIONS);
  const f={...ctx,ctx,store,actions}; fixtures.push(f);return f;
}
function start(f) {
  const contract=f.progression.getContracts().find(c=>f.progression.previewContract(c).ok);
  assert.ok(contract,'A generated starter contract is playable');
  assert.equal(f.progression.acceptContract(contract).ok,true);
  f.sim.startHole(contract);assert.equal(f.sim.active,true);return contract;
}
const physical=f=>JSON.stringify(f.sim.debug.state);
async function test(name, run) {
  try {await run();results.push({name,passed:true});console.log('PASS '+name);}
  catch(error){results.push({name,passed:false,error:error.message});console.error('FAIL '+name+': '+error.message);}
}
function advance(f, predicate, limit=20000) {
  let n=0;for(;n<limit&&!predicate(f.sim.getTelemetry());n++)f.sim.debug.stepFixed(1);
  assert.ok(predicate(f.sim.getTelemetry()),'Real simulation reached requested boundary');return n;
}

try {
  await test('native trip activation survives nested pause causes and settles once after resume',async()=>{
    const f=await fixture();start(f);f.sim.debug.setDepth(3);
    const button=new TapTarget();const pending=[];const off=tap(button,()=>pending.push(f.actions.act('trip')));
    click(button);assert.equal(f.sim.getTelemetry().phase,'tripping-out');
    f.ui.overlay(true);const before=physical(f);
    click(button);await Promise.resolve();
    for(let i=0;i<50;i++)f.sim.update(.25);
    assert.equal(physical(f),before,'Open dialog freezes the actual trip');
    f.ui.hidden(true);f.ui.overlay(false);f.sim.update(.25);
    assert.equal(physical(f),before,'Closing dialog cannot override hidden document');
    f.ui.scene(SCENES.MENU);f.ui.hidden(false);f.sim.update(.25);
    assert.equal(physical(f),before,'Hidden-document return cannot override off-site pause');
    f.ui.scene(SCENES.SITE);advance(f,t=>t.phase==='drilling');await Promise.all(pending);
    assert.equal(f.actions.notes.filter(n=>n[0]==='Changing bit').length,1);
    assert.equal(f.actions.notes.filter(n=>n[0]==='Bit change complete').length,1);
    off();
  });

  await test('pending trip cannot announce into a new accepted attempt after abandonment',async()=>{
    const f=await fixture();start(f);f.sim.debug.setDepth(3);
    const pending=f.actions.act('trip');const attempt=f.sim.getTelemetry().attemptId;
    f.ui.overlay(true);f.actions.invalidate();
    const decision=f.progression.abandonContract();assert.equal(decision.ok,true);
    f.sim.abortHole('abandoned');f.ui.overlay(false);start(f);
    assert.notEqual(f.sim.getTelemetry().attemptId,attempt);await pending;
    assert.equal(f.actions.notes.filter(n=>n[0]==='Bit change complete').length,0);
    assert.equal(f.actions.journal.filter(n=>n[1]==='Replacement bit fitted').length,0);
  });

  await test('skill cache, contract slots and settings survive a failed autosave plus retry/reload together',async()=>{
    const f=await fixture();start(f);f.state.player.level=60;f.state.player.skillPoints=100;
    f.state.player.skills={'sl.logistics':1};
    const beforeBand=f.sim.getSweetSpot().halfWidth01;
    assert.equal(f.progression.getContracts().length,5);
    f.ui.scene(SCENES.CAREER);f.state.scene=SCENES.CAREER;
    assert.equal(f.progression.spendSkillPoint('op.steady-hand').ok,true);
    const afterBand=f.sim.getSweetSpot().halfWidth01;
    assert.ok(afterBand>beforeBand,'Actual UNLOCK listener refreshed simulator cache off site');
    assert.equal(f.progression.spendSkillPoint('sl.contract-book').ok,true);
    assert.equal(f.progression.getContracts().length,6);
    f.state.settings.volume=.27;f.state.settings.reducedMotion=true;f.progression.requestSave();
    const points=f.state.player.skillPoints,toasts=[];
    const off=subscribeSaveFeedback(f.progression,text=>toasts.push(text));
    f.store.failPrimary=true;f.progression.update(1.21);
    assert.equal(f.progression.getSaveStatus().error,'save-failed');
    assert.equal(saveNoticeModel(f.progression.getSaveStatus()).title,'Progress not saved');
    assert.equal(f.state.player.skillPoints,points);assert.equal(f.progression.getContracts().length,6);
    f.store.failPrimary=false;assert.equal(f.progression.save(),true);
    assert.equal(toasts.filter(t=>t==='Career saved.').length,1);off();
    const reloaded=await fixture(f.store);
    assert.equal(reloaded.state.player.skills['op.steady-hand'],1);
    assert.equal(reloaded.state.player.skills['sl.contract-book'],1);
    assert.equal(reloaded.state.player.skillPoints,points);
    assert.equal(reloaded.progression.getContracts().length,6);
    assert.equal(reloaded.state.settings.volume,.27);assert.equal(reloaded.state.settings.reducedMotion,true);
  });

  await test('one real stuck-string recovery records exactly one career recovery with the Site observer mounted',async()=>{
    const f=await fixture();start(f);f.sim.debug.forceStratum('granite');f.sim.debug.godMode=true;
    // This is the shell's actual event route to the actual Site observer.
    const offSite=f.bus.on(EVENTS.JAM_CLEARED,p=>f.actions.jamCleared(p));let events=0;
    const offCount=f.bus.on(EVENTS.JAM_CLEARED,()=>events++);
    f.sim.setInput('feed',1);f.sim.setInput('rotation',1);f.sim.setInput('flush',0);
    const jamSteps=advance(f,t=>t.phase==='stuck');
    const before=f.state.player.stats.jamsCleared;
    f.sim.setInput('feed',0);f.sim.setInput('flush',1);f.sim.setInput('rotation',.5);
    const recoverySteps=advance(f,()=>events>0,10000);
    measurements.push({scenario:'stuck-string recovery',jamSteps,recoverySteps,events,
      counterBefore:before,counterAfter:f.state.player.stats.jamsCleared,
      uiNotices:f.actions.notes.filter(n=>n[0]==='String free').length});
    offSite();offCount();
    assert.equal(events,1,'One authoritative simulation event');
    assert.equal(f.state.player.stats.jamsCleared-before,1,'One recovery must add one career statistic');
  });
} finally {
  for(const f of fixtures){
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:f.store});
    try{f.sim.dispose();}catch{}try{f.progression.dispose();}catch{}
  }
  console.warn=originalWarn;
  if(storageDescriptor)Object.defineProperty(globalThis,'localStorage',storageDescriptor);else delete globalThis.localStorage;
}
const sourceUnchanged=paths.every(p=>hash(readFileSync(new URL('../'+p,import.meta.url),'utf8'))===hashes[p]);
console.log(JSON.stringify({review:'assembled gameplay interactions',results,measurements,hashes,sourceUnchanged,
  limitations:['CPU event/phase proof only; no DOM focus/layout acceptance','QA ground/depth seams and god mode used only to reach deterministic physical boundaries'],
  expectedFaultDiagnostics:warnings.length},null,2));
if(results.some(r=>!r.passed)||!sourceUnchanged)process.exitCode=1;
