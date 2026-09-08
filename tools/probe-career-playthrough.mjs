#!/usr/bin/env node
/** Actual fresh-state career probe. Fixed wall-time simulation runs faster than
 * real time in Node, but receives only public slider/action commands. No wealth,
 * XP, depth, condition, completion or contract terms are injected. No renderer. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { createGeology } from '../src/world/geology.js';
import * as data from '../src/game/data.js';

const seed = Number(process.argv[2] || 1337);
const limitSec = Number(process.argv[3] || 480);
const outPath = process.argv[4] || `research/career-playthrough-seed-${seed}.json`;
const cardIndex = process.argv[5] === undefined || process.argv[5] === 'auto' ? null : Number(process.argv[5]);
const fromSave = process.argv[6] || null;
const storage = new Map();
if(fromSave) storage.set(SAVE_KEY,fs.readFileSync(fromSave,'utf8'));
globalThis.localStorage = { getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k) };
// Drawing sink only; geology generation and world-event logic remain actual.
// Synthetic widths cannot establish UI legibility or visual acceptance.
globalThis.document = { createElement(tag) {
  if(tag!=='canvas') throw new Error(`Unexpected DOM ${tag}`);
  const canvas={width:1,height:1};
  canvas.getContext=type=>{
    if(type!=='2d') throw new Error(`No GPU context allowed: ${type}`);
    return new Proxy({canvas,font:'12px sans-serif',measureText:text=>({width:String(text).length*7}),
      createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
      getImageData:()=>({data:new Uint8ClampedArray(canvas.width*canvas.height*4)})},
      {get:(o,p)=>p in o?o[p]:(()=>{})});
  }; return canvas;
} };
const state = createGameState(), bus = createBus();
const ctx = { THREE, state, bus, game:data, rand:makeRandom(seed) };
ctx.progression = createProgression(ctx);
ctx.geology = createGeology(ctx);
ctx.sim = createDrillSim(ctx);
const sourceFiles=['src/world/geology.js','src/sim/drilling.js','src/game/progression.js','src/game/data.js','src/game/economy.js','tools/probe-career-playthrough.mjs'];
const hashFiles=()=>Object.fromEntries(sourceFiles.map(file=>[file,createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const report = { seed, limitSec, cardIndex, fromSave, inputSaveSha256:fromSave?createHash('sha256').update(fs.readFileSync(fromSave)).digest('hex'):null, command:['node',...process.argv.slice(1)].join(' '), sourceBefore:hashFiles(), evidence:'Real public progression + fixed-time sim + actual geology, CPU only. Fresh money/XP or chained verbatim public save identified by hash. Controller reads public optimal telemetry; not manual play or phone timing.', events:[], samples:[] };
const compact = () => ({ level:state.player.level,xp:state.player.xp,money:state.player.money,owned:[...state.garage.owned],condition:{...state.garage.condition},loadout:{...state.garage.loadout},rigId:state.garage.rigId,contractId:state.contract?.id||null,holes:state.player.stats.holesDone,metres:state.player.stats.metresDrilled });
for (const e of [EVENTS.MONEY_CHANGE,EVENTS.HOLE_COMPLETE,EVENTS.LEVEL_UP,EVENTS.PURCHASE,EVENTS.SCENE_CHANGE]) bus.on(e,p=>report.events.push({event:e,payload:p}));
try {
  await ctx.progression.init();
  await ctx.geology.init();
  ctx.sim.init();
  report.initial=compact();
  let board=ctx.progression.getContracts();
  if(fromSave) {
    let refreshes=0;
    while(!board.some(c=>c.methodId==='auger'&&ctx.progression.previewContract(c).ok)&&refreshes<30) {
      board=ctx.progression.refreshContracts();refreshes++;
    }
    report.boardRefreshes=refreshes;
    const bit=state.garage.loadout.bit;
    if(state.garage.condition[bit]<0.35) report.maintenance={bit,result:ctx.progression.purchase(bit)};
  }
  report.board=board.map(c=>({contract:c,readiness:ctx.progression.previewContract(c)}));
  const contract=cardIndex === null
    ? board.filter(c=>c.methodId==='auger'&&ctx.progression.previewContract(c).ok).sort((a,b)=>a.targetDepth-b.targetDepth)[0]
    : board[cardIndex];
  if(!contract) throw new Error('No ready initial board offer');
  report.accepted=ctx.progression.acceptContract(contract);
  report.afterAccept=compact(); report.geology=ctx.geology.strata.map(({id,top,bottom})=>({id,top,bottom}));
  for(let hole=0;hole<contract.holes;hole++) {
    const started=ctx.sim.startHole(state.contract);
    if(!started?.active) throw new Error('Accepted job did not start');
    let lastWarning=null;
    for(let frame=0;ctx.sim.active&&frame<limitSec*60;frame++) {
      const t=ctx.sim.getTelemetry();
      if(frame%6===0) {
        const o=t.optimal;
        const ease=t.jam.state!=='free'||t.warning?.kind==='collapse'||t.warning?.kind==='binding';
        ctx.sim.setInput('feed',ease?0.12:(o.wob ?? o.feed ?? 0.45));
        ctx.sim.setInput('rotation',ease?0.55:(o.rpm ?? o.rotation ?? 0.5));
        ctx.sim.setInput('flush',o.flush ?? 0.75);
      }
      if(t.jam.state!=='free'&&t.jam.rescue.goodNow) ctx.sim.pulse('jamRescue');
      if(t.phase==='rod-add'&&t.rodAdd&&!t.rodAdd.hit&&!t.rodAdd.missed&&t.rodAdd.t>=t.rodAdd.windowStart&&t.rodAdd.t<=t.rodAdd.windowEnd) ctx.sim.pulse('rodStab');
      ctx.sim.update(1/60,state);
      ctx.geology.update(1/60,state);
      ctx.progression.update(1/60);
      const n=ctx.sim.getTelemetry();
      if(frame%600===0||n.warning?.kind!==lastWarning) {
        report.samples.push({hole,frame,time:n.timeSec,depth:n.depth,phase:n.phase,rop:n.rop,wear:n.wear,ground:n.stratum,warning:n.warning,optimal:n.optimal,inputs:{feed:n.wobCmd,rotation:n.rpmCmd,flush:n.flushCmd}});
        lastWarning=n.warning?.kind;
      }
    }
    const end=ctx.sim.getTelemetry();
    report.lastHole={hole,active:end.active,time:end.timeSec,depth:end.depth,target:end.target,phase:end.phase,reason:end.reason,warning:end.warning,wear:end.wear};
    if(ctx.sim.active||end.reason!=='complete') break;
  }
  report.afterSimulation=compact();
  if(!state.contract) {
    // Exercise an actual replacement transaction after the first job. It is
    // a QA purchase of the worn starter consumable, not an optimal upgrade claim.
    if(!fromSave) {
      const bit=state.garage.loadout.bit;
      report.purchase={id:bit,conditionBefore:state.garage.condition[bit],result:ctx.progression.purchase(bit)};
      report.purchase.conditionAfter=state.garage.condition[bit]; report.afterPurchase=compact();
    }
    report.saved=ctx.progression.save(); report.beforeReload=compact();
    report.reloaded=ctx.progression.load(); report.afterReload=compact();
    assert.deepEqual(report.afterReload,report.beforeReload,'real public reload preserves earned money/XP, equipment, condition and completed stats');
    if(report.saved&&report.reloaded) {
      report.outputSave=outPath.replace(/\.json$/,'.save.json');
      const saved=storage.get(SAVE_KEY);
      fs.mkdirSync(path.dirname(report.outputSave),{recursive:true});fs.writeFileSync(report.outputSave,saved);
      report.outputSaveSha256=createHash('sha256').update(saved).digest('hex');
    }
    report.coreReadiness={unlockLevel:data.getMethod('core').unlockLevel,earnedLevel:state.player.level,
      xpRemaining:Math.max(0,data.LEVELS.cumulative[data.getMethod('core').unlockLevel-1]-state.player.xp),
      rigPrice:data.getRig('core-rig').price,actualFunds:state.player.money,
      rigShortfall:Math.max(0,data.getRig('core-rig').price-state.player.money)};
  }
} catch(error) { report.error={message:error.message,stack:error.stack}; process.exitCode=1; }
finally {
  ctx.sim.dispose();ctx.geology.dispose();ctx.progression.dispose();
  report.sourceAfter=hashFiles();
  fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(report,null,2));
  console.log(JSON.stringify({outPath,initial:report.initial,accepted:report.accepted,lastHole:report.lastHole,afterSimulation:report.afterSimulation,purchase:report.purchase,error:report.error},null,2));
}
