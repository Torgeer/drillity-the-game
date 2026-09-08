#!/usr/bin/env node
/** Exercise the public core purchase/offer gates from an unedited earned save. */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { getMethod, getRig } from '../src/game/data.js';

const filename=process.argv[2];
if(!filename) throw new Error('Pass the final earned-save file');
const raw=fs.readFileSync(filename,'utf8');
const values=new Map([[SAVE_KEY,raw]]);
globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
const state=createGameState(),bus=createBus();
const progression=createProgression({state,bus,rand:makeRandom(808)});
await progression.init();
try {
  assert.ok(state.player.level>=getMethod('core').unlockLevel);
  const before=JSON.stringify(progression.serialise());
  const purchase=progression.purchaseRig('core-rig');
  assert.equal(purchase.ok,false);assert.equal(purchase.reason,'Not enough money');
  assert.equal(purchase.price,getRig('core-rig').price);
  assert.equal(JSON.stringify(progression.serialise()),before,'refused purchase preserves the earned career');
  let contract=null,refreshes=0;
  for(;refreshes<50&&!contract;refreshes++) {
    contract=progression.refreshContracts().find(c=>c.methodId==='core')||null;
  }
  assert.ok(contract,'actual current-level Nordic board supplies a core offer');
  const beforeOffer=JSON.stringify(progression.serialise());
  const readiness=progression.previewContract(contract),acceptance=progression.acceptContract(contract);
  assert.equal(readiness.ok,false);assert.equal(acceptance.ok,false);
  assert.equal(JSON.stringify(progression.serialise()),beforeOffer,'blocked core offer cannot charge or start');
  const report={save:filename,saveSha256:createHash('sha256').update(raw).digest('hex'),
    earnedLevel:state.player.level,earnedXP:state.player.xp,earnedMoney:state.player.money,
    levelGate:getMethod('core').unlockLevel,rigPrice:getRig('core-rig').price,
    shortfall:getRig('core-rig').price-state.player.money,purchase,refreshes,
    contract:{id:contract.id,seed:contract.seed,targetDepth:contract.targetDepth,holes:contract.holes,
      requiredCerts:contract.requiredCerts,methodId:contract.methodId},readiness,acceptance,
    sourceHashes:Object.fromEntries(['src/game/progression.js','src/game/data.js','src/game/economy.js']
      .map(file=>[file,createHash('sha256').update(fs.readFileSync(file)).digest('hex')])),
    limits:'This starter-auger policy reached the level gate but did not earn enough capital for core. It does not prove core is unaffordable under other earlier-method/skill policies or certify a played core job.'};
  fs.writeFileSync('research/earned-core-access.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally { progression.dispose(); }
