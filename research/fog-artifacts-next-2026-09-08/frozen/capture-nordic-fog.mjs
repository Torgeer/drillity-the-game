/** Actual source A/B stills. Serial GPU lease required. No FPS/phone claim. */
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,statSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {initialize,installControls,controlledMain,assertCameras} from './nordic-fog-controls.mjs';
import {classifyPair} from './nordic-fog-pair.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),arg=process.argv.indexOf('--out');
const out=resolve(root,arg<0?'evidence/nordic-fog/captures-01':process.argv[arg+1]);
const sha=x=>createHash('sha256').update(x).digest('hex'),fileSha=p=>sha(readFileSync(p));
const baseline=resolve(root,'evidence/nordic-fog/env-before.js'),candidate=resolve(root,'src/core/env.js'),main=readFileSync(resolve(root,'src/main.js'),'utf8'),transformedMain=controlledMain(main);
const controlsFile=resolve(root,'tools/nordic-fog-controls.mjs'),pairFile=resolve(root,'tools/nordic-fog-pair.mjs');
assert.equal(readFileSync(resolve(root,'../drillity-coordination/gpu-owner.txt'),'utf8').trim(),'next-nordic-fog');
assert(!existsSync(resolve(out,'report.json')),'Refusing to overwrite evidence');mkdirSync(out,{recursive:true});
writeFileSync(resolve(out,'served-main.js'),transformedMain);writeFileSync(resolve(out,'capture-source.mjs'),readFileSync(fileURLToPath(import.meta.url)));writeFileSync(resolve(out,'controls-source.mjs'),readFileSync(controlsFile));writeFileSync(resolve(out,'pair-source.mjs'),readFileSync(pairFile));
function manifest(){const files=[];function walk(p){for(const name of readdirSync(p)){const q=resolve(p,name);if(statSync(q).isDirectory())walk(q);else files.push(q);}}for(const p of ['src','public','node_modules/three/examples/jsm'])walk(resolve(root,p));for(const p of ['index.html','vite.config.js','package.json','package-lock.json','node_modules/three/build/three.module.js'])files.push(resolve(root,p));return Object.fromEntries(files.sort().map(p=>[relative(root,p).replaceAll('\\','/'),fileSha(p)]));}
const report={valid:false,started:new Date().toISOString(),semantics:{productionDelta:'Six-line Nordic clear fog authoring only.',control:'Actual frame function is held after boot and stepped with exact fixed dt. Public QA contract/depth and real assets retained. Both source variants receive the same full observed baseline cameras before every real AO/color render call. Source injection and complete camera/scene/state evidence are preserved.',claim:'Still-image diagnostic under fixed observed cameras; no frame-rate or physical-phone acceptance.'},inputHashes:{baseline:fileSha(baseline),candidate:fileSha(candidate),main:sha(main),transformedMain:sha(transformedMain),harness:fileSha(fileURLToPath(import.meta.url)),controls:fileSha(controlsFile),pair:fileSha(pairFile)},sourceBefore:manifest(),cases:[],pairs:[],errors:[],cleanup:{}};
const save=()=>writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2));
let server,browser,activeEnv=baseline;
const allSceneCases=[...[.34,.5,.7].map(tod=>({pair:'nordic-hero-'+tod,rig:'dth-crawler',method:'dth',region:'nordic',camera:'hero',seed:3,archetype:'well-pad',tod})),{pair:'nordic-glass-orbit',rig:'dth-crawler',method:'dth',region:'nordic',camera:'orbit',seed:3,archetype:'well-pad',tod:.34},{pair:'sahara-control',rig:'oil-derrick',method:'oil-rotary',region:'sahara',camera:'hero',seed:20260908,tod:.34}];
const pairArg=process.argv.indexOf('--pairs'),requested=pairArg<0?allSceneCases.map(c=>c.pair):process.argv[pairArg+1].split(',');assert(requested.length>0&&requested.every(p=>allSceneCases.some(c=>c.pair===p)),'Unknown requested pair');const sceneCases=allSceneCases.filter(c=>requested.includes(c.pair));report.requestedPairs=requested;report.completeFivePairSeries=sceneCases.length===5;
try{
  server=await createServer({root,plugins:[{name:'recorded-nordic-fog-controls',enforce:'pre',load(id){const p=resolve(id.split('?')[0]);if(p===resolve(root,'src/core/env.js'))return readFileSync(activeEnv,'utf8');if(p===resolve(root,'src/main.js'))return transformedMain;}}],server:{host:'127.0.0.1',port:5232,strictPort:true,hmr:false}});await server.listen();
  browser=await chromium.launch({channel:'chrome',headless:false,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--window-size=600,1000']});
  for(const config of sceneCases){
    let canonical=null,commonClock=null;
    for(const variant of ['baseline','candidate']){
      activeEnv=variant==='baseline'?baseline:candidate;server.moduleGraph.invalidateAll();const id=config.pair+'-'+variant;console.log('Capture '+id);
      const row={id,config,variant,servedEnvSha256:fileSha(activeEnv),errors:[],requestFailures:[],httpFailures:[],warnings:[]};report.cases.push(row);save();
      const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});await context.addInitScript(initialize);let page;
      try{
        page=await context.newPage();page.on('pageerror',e=>row.errors.push(String(e)));page.on('requestfailed',r=>row.requestFailures.push({url:r.url(),error:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)row.httpFailures.push({url:r.url(),status:r.status()});});page.on('console',m=>{if(['error','warning'].includes(m.type()))row.warnings.push({type:m.type(),text:m.text()});});
        await page.goto('http://127.0.0.1:5232/?quality=high&glb=strict&shot&sound=0',{waitUntil:'domcontentloaded'});await page.bringToFront();await page.waitForFunction(()=>window.__DRILLITY?.__qa?.startDemoContract,null,{timeout:180000});
        // The shell needs its final public UI tick after main marks ready.
        // Keep game systems/rendering held while releaseBoot schedules menu.
        row.bootRelease=await page.evaluate(()=>{const c=window.__DRILLITY,before={screen:c.ui.currentScene,clock:{...c.clock},tSec:c.state.tSec};for(let i=0;i<12;i++)c.ui.update(1/15,c.state);return {before,after:{screen:c.ui.currentScene,clock:{...c.clock},tSec:c.state.tSec},uiOnlySteps:12,dt:1/15};});
        assert.deepEqual(row.bootRelease.after.clock,row.bootRelease.before.clock,'UI-only release advanced game clock');assert.equal(row.bootRelease.after.tSec,row.bootRelease.before.tSec);save();
        await page.waitForFunction(()=>window.__DRILLITY.ui.currentScene==='menu',null,{timeout:15000});
        row.setup=await page.evaluate(async config=>{
          const c=window.__DRILLITY,{makeRandom}=await import('/src/core/contract.js');
          // createVFX retains the original ctx.rand object. Reseed its public
          // methods in place, then preserve the existing separate QA seed.
          const retainedRandom=c.rand,visualSeed=20260908,visualMethods=makeRandom(visualSeed);Object.assign(retainedRandom,visualMethods);const retainedObjectUnchanged=c.rand===retainedRandom;c.rand=makeRandom(config.seed);
          const randomControls={visualSeed,contractSeed:config.seed,retainedObjectUnchanged,contextStreamDistinct:retainedRandom!==c.rand,methodsReseeded:Object.keys(visualMethods).every(k=>retainedRandom[k]===visualMethods[k]),methodNames:Object.keys(visualMethods)};if(!randomControls.retainedObjectUnchanged||!randomControls.contextStreamDistinct||!randomControls.methodsReseeded)throw Error('Random control identity failed');
          const frameAccumulatorReset=window.__NORDIC_RESET_FRAME_ACCUMULATOR();if(frameAccumulatorReset.after.fpsAccum!==0||frameAccumulatorReset.after.fpsFrames!==0)throw Error('Frame accumulator reset failed');Object.assign(c.clock,{t:0,dt:0,frame:0,fps:60});c.state.tSec=0;
          await c.gltfRigs.load(config.rig);c.state.garage.rigId=config.rig;c.state.garage.loadout=c.data.defaultLoadoutFor(config.method,c.data.MAX_LEVEL);if(!c.rig.setRig(config.rig))throw Error('Rig refused');c.rig.setMethod(config.method);
          const contract=await c.__qa.startDemoContract({method:config.method,region:config.region,depth:6});if(contract.__stub)throw Error('QA stub');if(config.archetype&&contract.archetype!==config.archetype)throw Error('Wrong archetype');
          if(c.sim.methodId!==config.method||c.sim.debug.state.bit.id!==c.state.garage.loadout.bit)throw Error('Actual simulation method/tool mismatch');
          c.ui.show('site');c.renderer.setCameraMode(config.camera);c.env.setWeather('clear');c.env.setTimeOfDay(config.tod);c.sim.debug.setDepth(6);c.geology.setDepth?.(6);
          const simUpdate=c.sim.update;c.sim.update=function(_dt,...args){return simUpdate.call(this,0,...args);};window.__restoreSim=()=>{c.sim.update=simUpdate;};
          const gl=c.renderer.gl.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return {contract,randomControls,frameAccumulatorReset,preview:'Generated unpaid visual preview through the real QA bridge; public depth seek; not a purchased career run.',loadout:JSON.parse(JSON.stringify(c.state.garage.loadout)),simMethod:c.sim.methodId,simBit:c.sim.debug.state.bit.id,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,browser:navigator.userAgent};
        },config);save();
        await page.waitForFunction(()=>{const c=window.__DRILLITY,a=c.assets.stats();if(a.failed)throw Error('Asset failure');return a.sets>0&&a.setsReady===a.sets&&!a.pending&&(!c.terrain.siteModel.requested||c.terrain.siteModel.model);},null,{timeout:180000});
        row.warm=await page.evaluate(()=>window.__DRILLITY.renderer.warmShaders());assert.equal(row.warm.ready,true);save();
        // Exactly 64 real manual frames advance all public systems identically.
        // The simulation receives dt=0 and remains at the real QA seek state.
        await page.evaluate(async()=>{for(let i=0;i<64;i++){window.__NORDIC_STEP(1/15);if(i%8===0)await new Promise(requestAnimationFrame);}});
        row.controls=await page.evaluate(installControls,{canonical,commonClock});canonical=row.controls.fixed;commonClock=row.controls.clock;
        await page.evaluate(()=>{for(let i=0;i<3;i++)window.__NORDIC.step();});
        row.before=await page.evaluate(()=>window.__NORDIC.snapshot());
        const expectedTable=JSON.parse(readFileSync(resolve(root,'evidence/nordic-fog/'+variant+'.json'),'utf8'));
        assert.equal(expectedTable.envSha256,row.servedEnvSha256,'CPU expectation source mismatch');
        const expected=expectedTable.cases.find(x=>x.region===config.region&&x.weather==='clear'&&Math.abs(x.tod-config.tod)<1e-8);assert(expected,'Missing actual solver expectation');
        assert.deepEqual(row.before.fog,{color:expected.fog.linear,density:expected.fog.density},'Wrong runtime fog source');
        row.expectedFog={sourceSha256:expectedTable.envSha256,region:expected.region,time:expected.tod,fog:expected.fog};
        row.png=id+'.png';await page.screenshot({path:resolve(out,row.png)});row.pngSha256=fileSha(resolve(out,row.png));row.after=await page.evaluate(()=>window.__NORDIC.snapshot());
        assert.deepEqual(row.after,row.before,'Still snapshot changed while capturing');
        for(const snap of [row.before,row.after]){
          assert.equal(snap.screen,'site');assert.equal(snap.cameraMode,config.camera);assert.equal(snap.rig.id,config.rig);assert.equal(snap.rig.source,'glb');assert.equal(snap.visible,'visible');assert.equal(snap.focused,true);assert.equal(snap.contextLost,false);assert(snap.assets.sets>0&&snap.assets.setsReady===snap.assets.sets&&!snap.assets.pending&&!snap.assets.failed);
          assertCameras(snap.cameras,canonical);
          for(const band of ['surface','section']){const observations=snap.observations.filter(o=>o.band===band);assert(observations.length>0,'Missing actual render observation');for(const o of observations)assert.deepEqual(o.camera,canonical[band],'Actual renderer camera diverged');}
        }
        assert.equal(row.errors.length+row.requestFailures.length+row.httpFailures.length,0,'Browser failures');row.valid=true;
      }catch(e){row.failure=String(e.stack||e);if(page)try{row.failureState=await page.evaluate(()=>{const c=window.__DRILLITY;return {title:document.title,body:document.body.innerText.slice(0,6000),readyState:document.readyState,qaReady:!!c?.__qa,screen:c?.ui?.currentScene,bootMarks:c?.bootMarks,bootWarm:c?.bootWarm,clock:c?.clock,state:c?.state,assets:c?.assets?.stats?.()};});row.failurePng=id+'-failure.png';await page.screenshot({path:resolve(out,row.failurePng)});row.failurePngSha256=fileSha(resolve(out,row.failurePng));}catch(detailError){row.failureDetailError=String(detailError);}throw e;}finally{if(page)try{await page.evaluate(()=>{window.__NORDIC?.cleanup();window.__restoreSim?.();});row.controlsRestored=true;}catch(e){row.cleanupError=String(e);}await context.close();row.contextClosed=true;save();}
    }
    const rows=report.cases.filter(r=>r.config.pair===config.pair),a=rows[0].before,b=rows[1].before;
    if(config.region==='nordic')assert.notDeepEqual(a.fog,b.fog,'Nordic runtime fog did not change');else assert.deepEqual(a.fog,b.fog,'Sahara runtime fog changed');
    const pair={pair:config.pair,...classifyPair(a,b,config.region)};report.pairs.push(pair);save();assert.equal(pair.unexpected.length,0,'Source-pair scene/state mismatch: '+JSON.stringify(pair.unexpected.slice(0,12)));
  }
  report.valid=true;
}catch(e){report.errors.push(String(e.stack||e));process.exitCode=1;}
finally{
  if(browser)try{await browser.close();report.cleanup.browserClosed=true;}catch(e){report.cleanup.browserError=String(e);}
  if(server)try{await server.close();report.cleanup.serverClosed=true;}catch(e){report.cleanup.serverError=String(e);}
  report.sourceAfter=manifest();report.sourceUnchanged=JSON.stringify(report.sourceBefore)===JSON.stringify(report.sourceAfter);report.inputsAfter={baseline:fileSha(baseline),candidate:fileSha(candidate),main:sha(readFileSync(resolve(root,'src/main.js'),'utf8')),transformedMain:sha(controlledMain(readFileSync(resolve(root,'src/main.js'),'utf8'))),harness:fileSha(fileURLToPath(import.meta.url)),controls:fileSha(controlsFile),pair:fileSha(pairFile)};report.inputsUnchanged=JSON.stringify(report.inputHashes)===JSON.stringify(report.inputsAfter);
  if(!report.sourceUnchanged||!report.inputsUnchanged){report.valid=false;report.errors.push('Frozen inputs changed');process.exitCode=1;}
  report.finished=new Date().toISOString();save();console.log(JSON.stringify({valid:report.valid,cases:report.cases.map(r=>({id:r.id,valid:r.valid,failure:r.failure})),pairs:report.pairs.map(p=>({pair:p.pair,valid:p.valid,unexpected:p.unexpected.length})),cleanup:report.cleanup}));
}
