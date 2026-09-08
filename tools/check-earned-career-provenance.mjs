#!/usr/bin/env node
/** Verify the preserved public-action receipts and verbatim save chain. This
 * audits a recorded policy; it does not replay physics or prove optimal play. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createGameState, EVENTS } from '../src/core/contract.js';
import { getMethod, getRig, levelForXP } from '../src/game/data.js';

const chains=process.argv.slice(2);
if(!chains.length) throw new Error('Pass completed chain.json paths in order');
const digest=filename=>createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
const rows=chains.flatMap(filename=>JSON.parse(fs.readFileSync(filename,'utf8')).jobs)
  .filter(row=>row.outputSave);
const fresh=createGameState();
const summary={jobs:0,holes:0,metres:0,playerSeconds:0,moneyEvents:0,netWalletChange:0,
  paidReplacementCount:0,paidReplacementTotal:0,sourceHashes:[],verified:[]};
let previous=null;
for(const row of rows) {
  const r=JSON.parse(fs.readFileSync(row.report,'utf8'));
  assert.deepEqual(r.sourceAfter,r.sourceBefore,`${row.report}: sources stayed frozen`);
  assert.equal(r.saved,true);assert.equal(r.reloaded,true);
  assert.deepEqual(r.beforeReload,r.afterReload,`${row.report}: reload state matches`);
  const begin=r.initial, end=r.afterReload;
  if(previous) {
    assert.equal(r.inputSaveSha256,previous.outputSaveSha256,'unbroken predecessor save hash');
    assert.equal(digest(r.fromSave),r.inputSaveSha256,'input file still matches captured hash');
    assert.deepEqual(begin,previous.afterReload,'next process starts with actual earned state');
  } else {
    assert.equal(r.fromSave,null,'chain begins with factory state');
    assert.equal(begin.money,fresh.player.money);assert.equal(begin.xp,fresh.player.xp);
    assert.equal(begin.level,fresh.player.level);assert.equal(begin.holes,0);assert.equal(begin.metres,0);
    assert.deepEqual(begin.owned,fresh.garage.owned);assert.deepEqual(begin.loadout,fresh.garage.loadout);
  }
  assert.equal(digest(r.outputSave),r.outputSaveSha256,'persisted output is unaltered');
  const saved=JSON.parse(fs.readFileSync(r.outputSave,'utf8'));
  assert.equal(saved.player.money,end.money);assert.equal(saved.player.xp,end.xp);
  assert.equal(saved.player.level,end.level);assert.equal(levelForXP(end.xp),end.level);
  assert.deepEqual(saved.garage.owned,end.owned);assert.deepEqual(saved.garage.condition,end.condition);
  const money=r.events.filter(e=>e.event===EVENTS.MONEY_CHANGE).map(e=>e.payload);
  const completed=r.events.filter(e=>e.event===EVENTS.HOLE_COMPLETE).map(e=>e.payload);
  const results=r.events.filter(e=>e.event===EVENTS.SCENE_CHANGE&&e.payload.summary).map(e=>e.payload.summary);
  assert.equal(results.length,1,'one final contract settlement summary');
  assert.equal(money.reduce((n,e)=>n+e.delta,0),end.money-begin.money,'wallet reconciles actual money events');
  assert.equal(results[0].xp,end.xp-begin.xp,'XP reconciles actual settlement summary');
  assert.equal(completed.length,end.holes-begin.holes,'completed-hole career count reconciles');
  assert.ok(completed.length>0);
  const contract=completed[0].contract;
  assert.equal(contract.methodId,'auger','this proof is deliberately one method policy');
  assert.equal(completed.length,contract.holes,'all purchased holes delivered');
  const attempts=new Set();
  for(const c of completed) {
    assert.equal(c.contract.id,contract.id);assert.equal(c.depth,contract.targetDepth);
    assert.ok(Number.isSafeInteger(c.runId)&&Number.isSafeInteger(c.attemptId));
    assert.equal(attempts.has(c.attemptId),false);attempts.add(c.attemptId);
    assert.ok(Number.isFinite(c.timeSec)&&c.timeSec>0);
  }
  const metres=completed.reduce((n,c)=>n+c.depth,0);
  assert.ok(Math.abs((end.metres-begin.metres)-metres)<1e-7);
  const purchases=r.events.filter(e=>e.event===EVENTS.PURCHASE).map(e=>e.payload);
  summary.jobs++;summary.holes+=completed.length;summary.metres+=metres;
  summary.playerSeconds+=completed.reduce((n,c)=>n+c.timeSec,0);
  summary.moneyEvents+=money.length;summary.netWalletChange+=end.money-begin.money;
  summary.paidReplacementCount+=purchases.length;
  summary.paidReplacementTotal+=purchases.reduce((n,p)=>n+p.price,0);
  summary.verified.push({report:row.report,inputSave:r.inputSaveSha256,outputSave:r.outputSaveSha256,
    level:end.level,xp:end.xp,money:end.money});
  previous=r;
}
assert.ok(previous,'at least one complete public-action job');
summary.final=previous.afterReload;
summary.playerHours=summary.playerSeconds/3600;
summary.core={levelGate:getMethod('core').unlockLevel,levelReached:summary.final.level>=getMethod('core').unlockLevel,
  rigPrice:getRig('core-rig').price,funds:summary.final.money,shortfall:Math.max(0,getRig('core-rig').price-summary.final.money)};
summary.productionHashes=previous.sourceAfter;
const out='research/earned-career-provenance.json';
fs.writeFileSync(out,JSON.stringify(summary,null,2));
console.log(JSON.stringify({out,jobs:summary.jobs,holes:summary.holes,metres:summary.metres,
  playerHours:summary.playerHours,paidReplacements:summary.paidReplacementTotal,final:summary.final,core:summary.core},null,2));
