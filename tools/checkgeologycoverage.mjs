#!/usr/bin/env node
/** Shipping CPU coverage regression. Loads the actual geology/data modules.
 * Ordinary board contracts reproduce the 2396.3 m target shortfall; synthetic
 * 3000/5000 m stress fixtures are NOT SOURCED physical capacities. No GPU.
 * node tools/checkgeologycoverage.mjs [--json path]
 */
import * as THREE from 'three';
import { createGeology } from '../src/world/geology.js';
import { makeContract, makeContractBoard } from '../src/game/data.js';
import { makeRandom } from '../src/core/contract.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const hash = x => createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const sourceUrl=new URL('../src/world/geology.js',import.meta.url);
const beforeHash=hash(readFileSync(sourceUrl,'utf8'));
const report={evidence:'Actual CPU generator and contract-board calls; no renderer/browser evidence',
  sourceSha256:beforeHash,checks:0,failures:[],ordinaryContracts:[],stressCases:[],compatibilityCases:0};
const check=(ok,issue,detail={})=>{report.checks++;if(!ok)report.failures.push({issue,...detail});};
const make=()=>createGeology({THREE,state:{world:{regionId:'nordic'}}});
function verifyCoverage(fixture,label) {
  const geo=make();
  try {
    geo.generateProfile(fixture);
    const total=fixture.targetDepth*1.22+10;
    check(geo.strata.length>0,'nonempty-profile',{label});
    check(geo.profileDepth>=total,'complete-target-and-reserve',{label,total,actual:geo.profileDepth});
    check(geo.strata.at(-1).bottom===geo.profileDepth,'endpoint-is-real-stratigraphic-coverage',{label});
    for(let i=0;i<geo.strata.length;i++) {
      const bed=geo.strata[i];
      check(Number.isFinite(bed.bottom)&&bed.bottom>bed.top&&bed.top===(i?geo.strata[i-1].bottom:0),
        'finite-positive-contiguous-bed',{label,i});
    }
    geo.setStage(1,Number.MAX_SAFE_INTEGER);
    check(geo.stageProgress===geo.profileDepth,'vertical-station-clamp-reaches-covered-end',{label});
    check(geo.getStratumAt(fixture.targetDepth).bottom>=fixture.targetDepth,'target-query-inside-generated-ground',{label});
    const repeat=make();
    try {
      repeat.generateProfile(fixture);
      check(hash([repeat.strata,repeat.features,repeat.waterTableDepth])===hash([geo.strata,geo.features,geo.waterTableDepth]),
        'repeated-seed-is-deterministic',{label});
    } finally {repeat.dispose();}
    return {label,target:fixture.targetDepth,requestedCoverage:total,profileDepth:geo.profileDepth,strataCount:geo.strata.length};
  } finally {geo.dispose();}
}
for(const [seed,target,id] of [[226,2396.3,'ct-sahara-oil-rotary-2pnmk'],[3408,2400,'ct-sahara-oil-rotary-1uufq']]) {
  const contract=makeContract('sahara',60,makeRandom(seed));
  const board=makeContractBoard('sahara',60,makeRandom(seed),5);
  check(contract.id===id&&contract.targetDepth===target&&contract.methodId==='oil-rotary',
    'ordinary-regression-fixture-retains-shipping-identity',{seed,actual:contract.id,target:contract.targetDepth});
  check(board[0]?.id===contract.id,'ordinary-contract-reachable-on-actual-board',{seed});
  const fixture={regionId:contract.regionId,applicationId:contract.applicationId,methodId:contract.methodId,
    profileMode:'vertical',targetDepth:contract.targetDepth,seed:contract.seed,holeDiaMm:contract.holeDia,
    difficulty:contract.difficulty,commodity:contract.commodity,oreConfidence:contract.oreConfidence};
  report.ordinaryContracts.push(verifyCoverage(fixture,contract.id));
}
for(const targetDepth of [500,1500,2400,3000,5000]) for(const seed of [1,1337,20260903]) {
  report.stressCases.push(verifyCoverage({regionId:'nordic',applicationId:'water-well',profileMode:'vertical',
    targetDepth,seed,holeDiaMm:216,difficulty:0.25},`synthetic-${targetDepth}-${seed}`));
}
const baselines=JSON.parse(readFileSync(new URL('../research/geology-complete-profile-baselines.json',import.meta.url),'utf8'));
for(const {fixture,profileDepth,sha256} of baselines.cases) {
  const geo=make();
  try {
    geo.generateProfile(fixture);geo.setStage(1,Number.MAX_SAFE_INTEGER);
    const snapshot={strata:geo.strata,features:geo.features,waterTableDepth:geo.waterTableDepth,
      layout:geo.modeLayout,path:geo.borePath,heading:geo.heading,raise:geo.raise,pile:geo.pile,maxStation:geo.stageProgress};
    check(hash(snapshot)===sha256&&geo.profileDepth===profileDepth,'already-complete-profile-remains-identical',fixture);
    report.compatibilityCases++;
  } finally {geo.dispose();}
}
for(const [target,pattern] of [[Infinity,/finite and positive/],[1e100,/safe attempt budget/]]) {
  const geo=make();let caught;
  try {geo.generateProfile({regionId:'nordic',profileMode:'vertical',targetDepth:target,seed:1});}
  catch(error) {caught=error;}
  finally {geo.dispose();}
  check(caught&&pattern.test(caught.message),'unrepresentable-coverage-rejected',{target:String(target),error:caught?.message});
}
check(report.ordinaryContracts.length===2&&report.stressCases.length===15&&report.compatibilityCases===120,'nonempty-complete-matrix');
check(hash(readFileSync(sourceUrl,'utf8'))===beforeHash,'source-unchanged');
report.passed=!report.failures.length;
const args=process.argv.slice(2),jsonIndex=args.indexOf('--json');
if(jsonIndex>=0){if(!args[jsonIndex+1])throw Error('--json requires a path');writeFileSync(args[jsonIndex+1],JSON.stringify(report,null,2)+'\n');}
console.log(`GEOLOGY COVERAGE: ${report.checks} checks; ${report.compatibilityCases} unchanged profiles; ${report.failures.length} failures`);
for(const c of report.ordinaryContracts)console.log(`${c.label}: target ${c.target}, generated ${c.profileDepth}, required ${c.requestedCoverage}`);
if(!report.passed){console.error(JSON.stringify(report.failures,null,2));process.exitCode=1;}
