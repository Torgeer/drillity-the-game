#!/usr/bin/env node
/** Chain only verbatim saves produced by successful public-action runs. This
 * is one declared starter-auger policy, not a shortest-time or all-career proof. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { getMethod } from '../src/game/data.js';
import { EVENTS } from '../src/core/contract.js';

const maxJobs=Number(process.argv[2]||10);
const directory=process.argv[3]||'research/earned-career-chain';
const initialSave=process.argv[4]||null;
const startOrdinal=Number(process.argv[5]||0);
if(!Number.isInteger(maxJobs)||maxJobs<1||maxJobs>250) throw new Error('Job budget must be1..250');
fs.mkdirSync(directory,{recursive:true});
const chain={initialSave,initialSaveSha256:initialSave?createHash('sha256').update(fs.readFileSync(initialSave)).digest('hex'):null,startOrdinal,policy:'Fresh factory resources or hash-identified preceding earned save. Shortest currently ready ordinary auger offer, refresh at most30 times if absent. One first-job starter bit replacement QA transaction; later replace only below35% condition. Public saved careers are loaded verbatim. No XP/money/depth/completion edits.',jobs:[],stopped:null};
let input=initialSave;
for(let job=0;job<maxJobs;job++) {
  const ordinal=startOrdinal+job+1;
  const out=path.join(directory,`job-${String(ordinal).padStart(3,'0')}.json`);
  const args=['tools/probe-career-playthrough.mjs',String(1336+ordinal),'600',out,'auto'];
  if(input) args.push(input);
  const child=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:2**20,timeout:60000});
  const result=fs.existsSync(out)?JSON.parse(fs.readFileSync(out,'utf8')):null;
  if(!result) {chain.stopped={reason:'harness-process-failed',job,status:child.status,error:child.error?.message,stderr:child.stderr};break;}
  const row={job:ordinal,report:out,command:result.command,inputSave:input,inputSaveSha256:result.inputSaveSha256,
    outputSave:result.outputSave,outputSaveSha256:result.outputSaveSha256,initial:result.initial,
    final:result.afterReload||result.afterSimulation,lastHole:result.lastHole,coreReadiness:result.coreReadiness,
    elapsedPlayerSeconds:result.events.filter(e=>e.event===EVENTS.HOLE_COMPLETE).reduce((n,e)=>n+(e.payload.timeSec||0),0)};
  chain.jobs.push(row);
  if(input) {
    const digest=createHash('sha256').update(fs.readFileSync(input)).digest('hex');
    if(result.inputSaveSha256!==digest) throw new Error('Earned input save provenance changed');
  }
  console.log(JSON.stringify({job:ordinal,status:child.status,level:row.final?.level,xp:row.final?.xp,money:row.final?.money,completed:!!result.outputSave,depth:result.lastHole?.depth,target:result.lastHole?.target}));
  if(child.status!==0||result.error||!result.outputSave) {chain.stopped={reason:'run-blocked',job:ordinal,error:result.error||null,lastHole:result.lastHole};break;}
  input=result.outputSave;
  if(row.final.level>=getMethod('core').unlockLevel) {chain.stopped={reason:'earliest-core-level-reached',job:ordinal,readiness:result.coreReadiness};break;}
  fs.writeFileSync(path.join(directory,'chain.json'),JSON.stringify(chain,null,2));
}
chain.stopped ||= {reason:'bounded-job-budget-exhausted',maxJobs};
fs.writeFileSync(path.join(directory,'chain.json'),JSON.stringify(chain,null,2));
console.log(JSON.stringify(chain.stopped));
