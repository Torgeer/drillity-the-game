#!/usr/bin/env node
/** Actual geology.init/CONTRACT_ACCEPT/update + sim.update + progression.
 * Native CPU Canvas supports the real geology draw setup. No WebGL/GPU claim.
 * After npm ci, the default resolver uses the repository's pinned Canvas.
 * node tools/checkrescuegeology.mjs [--canvas-root=path] [--report=path]
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { createGameState,createBus,makeRandom,EVENTS,SCENES } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { createGeology } from '../src/world/geology.js';
import { createDrillSim } from '../src/sim/drilling.js';
const argument=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3);
const canvasRequest=argument('canvas-root')||process.env.DRILLITY_CANVAS_ROOT||'@napi-rs/canvas';
const canvasRoot=canvasRequest.startsWith('.') ? path.resolve(canvasRequest) : canvasRequest;
const sourcePaths=['src/core/contract.js','src/game/data.js','src/game/economy.js',
  'src/game/equipment-support.js','src/game/progression.js','src/sim/drilling.js',
  'src/sim/sample-product.js','src/sim/sample-ledger.js','src/world/geology.js','tools/checkrescuegeology.mjs'];
const sourceHashes=()=>Object.fromEntries(sourcePaths.map(p=>
  [p,createHash('sha256').update(fs.readFileSync(new URL('../'+p,import.meta.url))).digest('hex')]));
const report={scope:'Actual CPU geology lifecycle and simulation; real Canvas setup, no WebGL/browser image claim',
  canvasRoot,nodeVersion:process.version,sourceHashesBefore:sourceHashes(),holes:[]};
function saveReport() {
  report.sourceHashes=sourceHashes();
  report.sourceUnchanged=JSON.stringify(report.sourceHashesBefore)===JSON.stringify(report.sourceHashes);
  if(!report.sourceUnchanged) {
    report.pass=false;report.error='Source changed during execution; this run does not certify either source snapshot.';
    process.exitCode=1;console.error(report.error);
  }
  if(argument('report')) {
    const destination=path.resolve(argument('report'));
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.writeFileSync(destination,JSON.stringify(report,null,2)+'\n');
  }
}
let createCanvas;
try {
  const require=createRequire(import.meta.url);
  ({createCanvas}=require(canvasRoot));
  const packageRoot=path.dirname(require.resolve(canvasRoot));
  const packageInfo=JSON.parse(fs.readFileSync(path.join(packageRoot,'package.json'),'utf8'));
  report.canvasPackage={name:packageInfo.name,version:packageInfo.version,root:packageRoot};
} catch(error) {
  report.pass=false;
  report.error=`Native CPU Canvas is required; no mock geology or drawing fallback is used. Run npm ci with development dependencies, or provide --canvas-root=/absolute/path/to/@napi-rs/canvas.\n${error.stack}`;
  saveReport();console.error(report.error);process.exit(1);
}
const originalDoc=Object.getOwnPropertyDescriptor(globalThis,'document'),originalStore=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
const values=new Map();
globalThis.document={createElement:tag=>{assert.equal(tag,'canvas');return createCanvas(1,1);}};
globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
const state=createGameState(),bus=createBus(),ctx={state,bus,rand:makeRandom(29),viewport:{w:390,h:844,dpr:2},EVENTS,SCENES};
ctx.geology=createGeology(ctx);ctx.sim=createDrillSim(ctx);ctx.progression=createProgression(ctx);
const completions=[],moneyEvents=[];
bus.on(EVENTS.HOLE_COMPLETE,p=>completions.push(p));bus.on(EVENTS.MONEY_CHANGE,p=>moneyEvents.push(p));
try {
  // Production init order: geology, simulation, progression.
  await ctx.geology.init();await ctx.sim.init();await ctx.progression.init();
  state.player.money=0;state.scene=SCENES.SITE;
  const inventory=structuredClone(state.garage),card=ctx.progression.getContracts().find(c=>c.emergency===true);
  assert.ok(card);assert.equal(card.regionId,'nordic');
  const acceptance=ctx.progression.acceptContract(card);assert.equal(acceptance.ok,true);assert.equal(acceptance.mobilisation,0);
  assert.equal(state.player.money,0);assert.deepEqual(state.garage,inventory);
  const actualColumn=ctx.geology.strata.filter(s=>s.top<card.targetDepth).map(s=>({id:s.id,top:s.top,bottom:Math.min(s.bottom,card.targetDepth)}));
  assert.deepEqual(actualColumn,card.groundSpec.map(({id,top,bottom})=>({id,top,bottom})));
  const profileHash=()=>createHash('sha256').update(JSON.stringify([ctx.geology.strata,ctx.geology.features,ctx.geology.waterTableDepth])).digest('hex');
  const acceptedProfile=profileHash();
  for(let hole=0;hole<card.holes;hole++) {
    assert.equal(ctx.sim.startHole(state.contract).active,true);
    assert.equal(ctx.sim.debug.state.syntheticGeology,false);
    ctx.sim.setInput('feed',0.45);ctx.sim.setInput('rotation',0.5);ctx.sim.setInput('flush',0.75);
    const phases=new Set();
    for(let frame=0;frame<60000 && ctx.sim.active;frame++) {
      const telemetry=ctx.sim.getTelemetry();phases.add(telemetry.phase);
      if(telemetry.phase==='stuck')ctx.sim.pulse('jamRescue');
      // Production update order, at a fixed 60 Hz frame input. Physics uses its
      // actual accumulator; depth and completion are never injected.
      ctx.geology.update(1/60,state);ctx.sim.update(1/60,state);ctx.progression.update(1/60,state);
    }
    assert.equal(ctx.sim.getTelemetry().phase,'complete');
    assert.equal(completions.length,hole+1);
    const payload=completions.at(-1),receipt=ctx.progression.settlementForCompletion(payload);
    assert.ok(receipt);assert.equal(payload.depth,card.targetDepth);assert.equal(profileHash(),acceptedProfile);
    report.holes.push({depth:payload.depth,grade:payload.grade,time:payload.breakdown.time,phases:[...phases],receipt});
  }
  assert.equal(state.contract,null);assert.ok(state.player.money>=400);
  const paid=moneyEvents.reduce((sum,p)=>sum+p.delta,0);assert.equal(paid,state.player.money);
  assert.ok(moneyEvents.some(p=>p.reason==='Running costs'&&p.delta<0));
  const before=state.player.money;bus.emit(EVENTS.HOLE_COMPLETE,completions.at(-1));assert.equal(state.player.money,before);
  Object.assign(report,{pass:true,acceptedProfile,actualColumn,endingCash:state.player.money,moneyEvents});
} catch(error) {report.pass=false;report.error=error.stack;console.error(error);process.exitCode=1;}
finally {
  ctx.sim.dispose();ctx.progression.dispose();ctx.geology.dispose();
  if(originalDoc)Object.defineProperty(globalThis,'document',originalDoc);else delete globalThis.document;
  if(originalStore)Object.defineProperty(globalThis,'localStorage',originalStore);else delete globalThis.localStorage;
  saveReport();
  if(report.pass)console.log(JSON.stringify({pass:true,endingCash:report.endingCash,
    sourceUnchanged:report.sourceUnchanged,holes:report.holes.map(h=>({depth:h.depth,grade:h.grade,time:h.time}))}));
}
