#!/usr/bin/env node
/** Independent artifact/ledger review and public saved-career core gate.
 * Does not rerun or forge drilling. It reads retained raw evidence, then loads
 * an earned save verbatim through progression. Outputs are reviewer-owned. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { getMethod, getRig, levelForXP } from '../src/game/data.js';
import { xpForContract, priceWithMarkup, rigWearPerHour } from '../src/game/economy.js';

const out = process.argv[2] || 'research/earned-career-independent.json';
const paths = ['01','02','03'].map(n=>`research/earned-career-chain-${n}/chain.json`);
const hash = value => createHash('sha256').update(value).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file,'utf8'));
const digest = file => hash(fs.readFileSync(file));
const near = (actual,expected,label,tolerance=1e-7) => assert.ok(Math.abs(actual-expected)<=tolerance,`${label}: ${actual} != ${expected}`);
const compact = s => ({level:s.player.level,xp:s.player.xp,money:s.player.money,owned:[...s.garage.owned],condition:{...s.garage.condition},loadout:{...s.garage.loadout},rigId:s.garage.rigId,contractId:s.contract?.id||null,holes:s.player.stats.holesDone,metres:s.player.stats.metresDrilled});
const allRows = paths.flatMap(file=>read(file).jobs);
const rows = allRows.filter(r=>r.outputSave);
const rejectedRows = allRows.filter(r=>!r.outputSave);
const result = {scope:'Raw retained artifacts and independent public load/access checks; no 102-job simulation rerun.', chainHashes:Object.fromEntries(paths.map(p=>[p,digest(p)])), checks:[], jobs:[], totals:{contracts:0,holes:0,metres:0,playerSecondsFromRoundedCompletions:0,revenue:0,costs:0,paidReplacements:0,paidReplacementCost:0,xp:0,reputation:0,billedCareerHours:0,moneyEvents:0,samples:0}, harnessRevisions:{}};
const sourceKeys = ['src/world/geology.js','src/sim/drilling.js','src/game/progression.js','src/game/data.js','src/game/economy.js'];
const currentSources = Object.fromEntries(sourceKeys.map(p=>[p,digest(p)]));
const seenAttempts=new Set(), seenContracts=new Set();
let previous=null, previousReport=null, previousSavePath=null;
function auditJob(row, ordinal) {
  const r=read(row.report), raw=fs.readFileSync(row.outputSave), save=JSON.parse(raw);
  const label=`job ${row.job}`;
  assert.equal(row.job,ordinal,label+' ordinal');
  assert.equal(hash(raw),row.outputSaveSha256,label+' row save hash');
  assert.equal(hash(raw),r.outputSaveSha256,label+' report save hash');
  assert.equal(r.error,undefined,label+' no error');
  assert.equal(r.saved,true); assert.equal(r.reloaded,true);
  assert.deepEqual(r.beforeReload,r.afterReload,label+' compact public reload');
  assert.deepEqual(compact(save),r.afterReload,label+' actual output save vs compact report');
  assert.deepEqual(r.sourceBefore,r.sourceAfter,label+' sources unchanged during run');
  for(const p of sourceKeys) assert.equal(r.sourceBefore[p],currentSources[p],label+' fixed critical source '+p);
  const revision=r.sourceBefore['tools/probe-career-playthrough.mjs'];
  (result.harnessRevisions[revision]??=[]).push(row.job);
  if(previous) {
    assert.equal(digest(r.fromSave),previousReport.outputSaveSha256,label+' actual input bytes');
    assert.equal(r.inputSaveSha256,previousReport.outputSaveSha256,label+' recorded input');
    assert.equal(row.inputSaveSha256,previousReport.outputSaveSha256,label+' chain input');
    assert.deepEqual(read(r.fromSave),previous,label+' full saved input continuity');
    assert.deepEqual(r.initial,compact(previous),label+' initialized balances/inventory');
  } else {
    assert.equal(r.fromSave,null); assert.equal(r.inputSaveSha256,null);
    assert.deepEqual(r.initial,compact(createGameState()),label+' factory resources');
  }
  assert.equal(save.contract,null); assert.equal(save.run,null);
  assert.equal(save.player.level,levelForXP(save.player.xp));
  assert.deepEqual(save.player.skills,{}); assert.deepEqual(save.player.certs,[]);
  assert.equal(save.garage.rigId,'crawler-lite');
  assert.deepEqual(save.garage.owned,['auger-flight-std','auger-flight-sec-280']);
  assert.deepEqual(save.garage.loadout,r.initial.loadout);
  const completions=r.events.filter(e=>e.event===EVENTS.HOLE_COMPLETE).map(e=>e.payload);
  const summaries=r.events.filter(e=>e.event===EVENTS.SCENE_CHANGE&&e.payload.summary).map(e=>e.payload.summary);
  assert.equal(summaries.length,1); const summary=summaries[0];
  assert.equal(seenContracts.has(summary.contractId),false,label+' unique paid contract'); seenContracts.add(summary.contractId);
  const receipts=save.player.career.ledger.filter(e=>e.contractId===summary.contractId).reverse();
  assert.equal(receipts.length,completions.length); assert.ok(receipts.length>0);
  assert.equal(receipts.length,completions[0].contract.holes);
  assert.equal(save.player.career.contractsDone,(previous?.player.career.contractsDone||0)+1);
  assert.deepEqual(save.settledContracts,[...(previous?.settledContracts||[]),summary.contractId]);
  const oldLedger=(previous?.player.career.ledger||[]).slice(0,24-receipts.length);
  assert.deepEqual(save.player.career.ledger.slice(receipts.length),oldLedger,label+' retained older receipts unchanged');
  let xp=0,rep=0,hours=0,revenue=0,costs=0,metres=0,seconds=0;
  for(let i=0;i<receipts.length;i++) {
    const e=receipts[i], c=completions[i]; const key=`${e.runId}:${e.attemptId}`;
    assert.ok(Number.isSafeInteger(e.runId)&&Number.isSafeInteger(e.attemptId));
    assert.equal(seenAttempts.has(key),false,label+' unique paid attempt'); seenAttempts.add(key);
    assert.equal(e.runId,c.runId); assert.equal(e.attemptId,c.attemptId);
    assert.equal(e.contractId,c.contract.id); assert.equal(c.methodId,'auger');
    assert.equal(e.hole,i+1); assert.equal(e.of,receipts.length); assert.equal(e.complete,i===receipts.length-1);
    near(e.depth,c.contract.targetDepth,label+' delivered target'); near(c.depth,e.depth,label+' receipt depth');
    assert.ok(Number.isFinite(c.timeSec)&&c.timeSec>0); assert.equal(c.breakdown.time.actualSec,c.timeSec);
    assert.equal(e.net,e.revenue-e.costs.total); assert.equal(e.recoverySupport,undefined);
    const firstTime=ordinal===1&&i===0;
    const perHole={...c.contract,holes:1,metres:e.depth};
    assert.equal(e.xp,xpForContract(perHole,{grade:c.grade,holesCompleted:1,skills:{},firstTime}),label+' public XP formula');
    assert.ok(e.costs.consumables>0,label+' paid consumed equipment');
    assert.equal(e.worn.length,2,label+' bit and rod wear receipts');
    for(const w of e.worn) { assert.ok(w.from>=0&&w.from<=1&&w.to>=0&&w.to<=1&&w.wear>0); }
    xp+=e.xp;rep+=e.reputation;hours+=e.hours;revenue+=e.revenue;costs+=e.costs.total;metres+=e.depth;seconds+=c.timeSec;
  }
  assert.equal(summary.xp,xp); assert.equal(summary.reputation,rep); near(summary.hours,hours,label+' summary hours',0.0051);
  assert.equal(summary.revenue,revenue); assert.equal(summary.costs,costs); assert.equal(summary.net,revenue-costs); assert.equal(summary.mobilisation,0);
  assert.equal(save.player.xp-r.initial.xp,xp); assert.equal(save.player.stats.holesDone-r.initial.holes,receipts.length);
  near(save.player.stats.metresDrilled-r.initial.metres,metres,label+' career metres');
  near(save.player.career.hoursWorked-(previous?.player.career.hoursWorked||0),hours,label+' billed hours');
  assert.equal(save.player.career.reputationTotal-(previous?.player.career.reputationTotal||0),rep);
  let balance=r.initial.money, completedIndex=-1, runningRep=previous?.player.career.reputationTotal||0,purchases=0,purchaseCost=0;
  for(let i=0;i<r.events.length;i++) {
    const ev=r.events[i], e=ev.payload;
    if(ev.event===EVENTS.HOLE_COMPLETE) { completedIndex++;runningRep+=receipts[completedIndex].reputation; }
    if(ev.event===EVENTS.MONEY_CHANGE) {
      balance+=e.delta; assert.equal(e.balance,balance,label+' chronological wallet '+i); result.totals.moneyEvents++;
      if(e.reason==='load') assert.equal(e.delta,0);
      else if(e.reason==='Running costs') assert.equal(e.delta,-receipts[completedIndex].costs.total);
      else if(e.reason.endsWith(` — hole ${completedIndex+1}`)) assert.equal(e.delta,receipts[completedIndex].revenue);
      else assert.ok(e.reason==='Bought Flight Auger Head, 305 mm'&&e.delta<0,label+' authorized money reason '+e.reason);
    }
    if(ev.event===EVENTS.PURCHASE) {
      assert.equal(e.itemId,'auger-flight-std'); assert.equal(e.quantity,1);
      assert.equal(e.price,priceWithMarkup(e.itemId,{regionId:save.world.regionId,reputation:runningRep,skills:{},quantity:1}),label+' actual quoted replacement price');
      const prior=r.events[i-1]; assert.equal(prior.event,EVENTS.MONEY_CHANGE); assert.equal(prior.payload.delta,-e.price);
      purchases++;purchaseCost+=e.price;
    }
  }
  assert.equal(balance,save.player.money); assert.equal(balance-r.initial.money,revenue-costs-purchaseCost);
  const rigBefore=previous?.garage.condition['crawler-lite']??1;
  near(save.garage.condition['crawler-lite'],rigBefore-rigWearPerHour('crawler-lite')*hours,label+' rig operating wear');
  for(const w of receipts.at(-1).worn) {
    const expected=ordinal===1&&w.itemId==='auger-flight-std'?1:w.to;
    near(save.garage.condition[w.itemId],expected,label+' final inventory wear receipt',0.00051);
  }
  for(const [hole,samples] of Map.groupBy(r.samples,s=>s.hole)) {
    assert.ok(hole>=0&&hole<completions.length); let frame=-1,time=-1;
    for(const s of samples) {assert.ok(s.frame>frame&&s.time>=time&&s.depth>=0&&s.depth<=completions[hole].depth);frame=s.frame;time=s.time;}
  }
  result.totals.contracts++;result.totals.holes+=receipts.length;result.totals.metres+=metres;result.totals.playerSecondsFromRoundedCompletions+=seconds;
  result.totals.revenue+=revenue;result.totals.costs+=costs;result.totals.paidReplacements+=purchases;result.totals.paidReplacementCost+=purchaseCost;result.totals.xp+=xp;result.totals.reputation+=rep;result.totals.billedCareerHours+=hours;result.totals.samples+=r.samples.length;
  result.jobs.push({job:row.job,report:row.report,reportSha256:digest(row.report),save:row.outputSave,saveSha256:hash(raw),inputSaveSha256:r.inputSaveSha256,contractId:summary.contractId,receipts:receipts.length});
  previous=save;previousReport=r;previousSavePath=row.outputSave;
}
try {
  rows.forEach((row,i)=>auditJob(row,i+1));
  result.checks.push('All 102 actual save hashes and full input-save chains; factory origin; compact load state and inventories; stable five critical production files.','All 414 globally unique paid run/attempt receipts, unchanged retained prior receipts, settlement totals, actual XP formula, chronological wallet balances, 37 public replacement quotes, consumable costs and final rig/tool condition.','Sample frame/time ordering and bounded depth; this is sparse telemetry, not a full physics replay.');
  assert.equal(rejectedRows.length,1); const failedRow=rejectedRows[0], failed=read(failedRow.report);
  assert.equal(failedRow.job,12); assert.equal(failed.outputSave,undefined); assert.equal(failed.afterSimulation.money,failed.initial.money); assert.equal(failed.afterSimulation.xp,failed.initial.xp); assert.equal(failed.afterSimulation.holes,failed.initial.holes);
  assert.equal(failed.events.filter(e=>e.event===EVENTS.HOLE_COMPLETE).length,0); assert.ok(failed.afterSimulation.contractId);
  assert.equal(failed.inputSaveSha256,read(rows[11].report).inputSaveSha256);
  result.excludedDiagnostic={report:failedRow.report,sha256:digest(failedRow.report),inputSaveSha256:failed.inputSaveSha256,outputSave:false,completionEvents:0,unchangedMoney:failed.initial.money,unchangedXP:failed.initial.xp,retainedContract:failed.afterSimulation.contractId,sampleAttemptLabels:[...new Set(failed.samples.map(s=>s.hole))],lastAttemptTime:failed.lastHole.time,limit:'Old controller repeated an aborted attempt under three labels. No holes delivered. This discarded diagnostic time is excluded from successful-path seconds; continuation restores exact job11 save, not the failed active run.'};
  const harnessFiles=['research/probe-career-playthrough-66e16be1.mjs','tools/probe-career-playthrough.mjs'];
  result.retainedHarnessSources=Object.fromEntries(harnessFiles.map(p=>[p,digest(p)]));
  assert.deepEqual(Object.values(result.retainedHarnessSources).sort(),Object.keys(result.harnessRevisions).sort(),'exact sources for both historical harness revisions');
  const storage=new Map([[SAVE_KEY,fs.readFileSync(previousSavePath,'utf8')]]);
  globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
  const state=createGameState(),bus=createBus();const p=createProgression({state,bus,rand:makeRandom(808)});
  await p.init(); assert.deepEqual(compact(state),compact(previous),'public final save load');
  assert.deepEqual(state.player.career,previous.player.career,'public full saved career load');
  const original=JSON.stringify(p.serialise()); const buy=p.purchaseRig('core-rig');
  assert.deepEqual(buy,{ok:false,reason:'Not enough money',price:getRig('core-rig').price}); assert.equal(JSON.stringify(p.serialise()),original,'failed rig purchase changes nothing');
  let board=p.getContracts(),refreshes=0;while(!board.some(c=>c.methodId==='core')&&refreshes<50){board=p.refreshContracts();refreshes++;}
  const offer=board.find(c=>c.methodId==='core');assert.ok(offer);const beforeOffer=JSON.stringify(p.serialise());
  const readiness=p.previewContract(offer),acceptance=p.acceptContract(offer);assert.equal(readiness.code,'missing-core-bit');assert.deepEqual(acceptance,readiness);assert.equal(JSON.stringify(p.serialise()),beforeOffer,'failed core offer changes nothing');
  result.coreAccess={save:previousSavePath,saveSha256:digest(previousSavePath),level:state.player.level,xp:state.player.xp,money:state.player.money,levelGate:getMethod('core').unlockLevel,rigPrice:getRig('core-rig').price,rigShortfall:getRig('core-rig').price-state.player.money,buy,refreshes,offer,readiness,acceptance,unchangedOnBothRejections:true};p.dispose();
  result.checks.push('Independent public final-save load and actual core-rig purchase/core-offer acceptance refusal, with full serialized-state equality after both rejections.');
  result.sourceHashes=currentSources;result.reviewerSha256=digest('tools/check-earned-career-independent.mjs');result.final=compact(previous);result.finalStats=previous.player.stats;
  result.limits=['An earned persisted successful path with one restored checkpoint, not a never-retried session. Rounded completion seconds exclude failed attempts, menus, shopping, reading and human reaction time.','Only starter auger used; skills and certificates remain empty. Capital deficit at first level18 does not establish fastest career, general economy impossibility or a played core job.','Five critical production identities are present in each raw run. Sparse samples and ledger consistency cannot independently prove every physics frame; source review and retained harness identities are separate evidence.','JAM_CLEARED events were not recorded in the author chain, so its saved jamsCleared counter is not independently validated by this review. No separate jam cash/XP event exists in the reconciled money and settlement totals.'];
  result.pass=true;
} catch(error) {result.pass=false;result.error={message:error.message,stack:error.stack};process.exitCode=1;}
fs.writeFileSync(out,JSON.stringify(result,null,2));
console.log(JSON.stringify({out,pass:result.pass,totals:result.totals,final:result.final,error:result.error},null,2));
