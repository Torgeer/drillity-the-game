#!/usr/bin/env node
/** Finite CURRENT-asset measurement. Does not start a server or edit production.
 * --prepare: copy immutable served inputs; --self-test: CPU gate adversaries.
 * Run: node tools/checkoptimizedrigruntime.mjs --port 5208 --lease ../drillity-coordination/gpu-owner.txt
 * Serve .optimized-rig-runtime/frozen with private Vite ONLY after exact lease.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const WORK=resolve(ROOT,'.optimized-rig-runtime'), FROZEN=resolve(WORK,'frozen');
const PLAN=[['bolter','rockbolt'],['crawler-th','top-hammer'],['sonic-truck','sonic'],['tunnel-jumbo','tunnel-jumbo']];
const EXPECTED={bolter:'c3a29ca8d6da32eb87f39f8e207ebd3d3aa8da1685f50cb71708d89f0e32ed23','crawler-th':'58175e8ae042856225b435f9476dca99d94a15048d609973b4cffe0c42ac721d','sonic-truck':'f9c5438581f43adbcdd04f8b04ee579c3c4353e45c6f60e289226d6407cc6763','tunnel-jumbo':'4059aaa715b389aa641b5a75256dece9ee48ab342e50b9de7484a9beaf1f6094'};
const args=process.argv.slice(2), flag=(k,d)=>{const i=args.indexOf('--'+k);return i<0?d:args[i+1];};
const sha=b=>createHash('sha256').update(b).digest('hex');
const fileSha=p=>sha(readFileSync(p));
function files(dir){return readdirSync(dir).sort().flatMap(n=>{const p=resolve(dir,n);return statSync(p).isDirectory()?files(p):[p];});}
function manifest(dir){return Object.fromEntries(files(dir).filter(p=>!p.includes('/node_modules/')&&!p.includes('\\node_modules\\')).map(p=>[relative(dir,p).replaceAll('\\','/'),fileSha(p)]));}
function json(p,v){writeFileSync(p,JSON.stringify(v,null,2)+'\n');}
const median=a=>{const s=[...a].sort((a,b)=>a-b);return s.length?s[Math.floor(s.length/2)]:null;};
export function assessIdentity(snapshots,id,method,quality){
  // env.setTimeOfDay normalizes modulo 1, but its early return can retain 0.34.
  // Accept either exact representation; never allow time to drift across stages.
  const requested=0.34, normalized=((requested % 1)+1)%1;
  const time=snapshots[0]?.timeOfDay;
  return (time===requested||time===normalized)&&snapshots.every(s=>s.id===id&&s.method===method&&s.simMethod===method&&s.quality===quality&&s.sourceKey===`glb:${id}`&&s.cameraMode==='hero'&&s.depth===2&&s.active===false&&s.timeOfDay===time);
}
export function assessWindow(w,expected){
  const errors=[];
  if(w.samples?.length!==expected)errors.push('incomplete observed frames');
  if(!Array.isArray(w.programsBefore)||!w.programsBefore.length||w.programsBefore.some(id=>!Number.isInteger(id))||new Set(w.programsBefore).size!==w.programsBefore.length)errors.push('missing or invalid shader program evidence');
  if(JSON.stringify(w.programsBefore)!==JSON.stringify(w.programsAfter))errors.push('program identities changed');
  if(w.samples?.some(s=>s.visible!=='visible'||!s.focused))errors.push('hidden or unfocused');
  if(w.samples?.some(s=>s.lost||s.title||!Number.isInteger(s.calls)||s.calls<=0||!Number.isInteger(s.frame)))errors.push('renderer inactive or lost');
  const dts=(w.samples||[]).slice(1).map(s=>s.dt);
  if(dts.length!==expected-1||dts.some(d=>!Number.isFinite(d)||d<=0))errors.push('invalid frame intervals');
  if(dts.some(d=>d>=400))errors.push('background clamp or severe stall');
  if(w.samples?.slice(1).some((s,i)=>s.frame-w.samples[i].frame!==1))errors.push('not exactly one app frame per callback');
  return {ok:!errors.length,errors,medianMs:median(dts),fpsMedian:dts.length?1000/median(dts):null,fpsAggregate:dts.length?1000*dts.length/dts.reduce((a,b)=>a+b,0):null,p95Ms:dts.length?[...dts].sort((a,b)=>a-b)[Math.floor(dts.length*.95)]:null,worstMs:dts.length?Math.max(...dts):null,intervals:dts.length};
}
if(args.includes('--help')){console.log('CPU only: --prepare | --self-test. Capture: --port 5208 --lease <gpu-owner.txt> [--out <fresh-directory>]. Exact optimized-rig-runtime lease mandatory.');process.exit(0);}
if(args.includes('--self-test')){
  const good={programsBefore:[1,2],programsAfter:[1,2],samples:Array.from({length:40},(_,i)=>({dt:16.6,frame:i,calls:50,visible:'visible',focused:true,lost:false,title:false}))};
  assert.equal(assessWindow(good,40).ok,true);
  const bad=[x=>x.samples=[],x=>x.samples.pop(),x=>x.programsAfter=[1,3],x=>{x.programsBefore=[];x.programsAfter=[];},x=>{delete x.programsBefore;delete x.programsAfter;},x=>x.samples[9].dt=1000,x=>x.samples[9].frame=7,x=>x.samples[9].calls=0,x=>x.samples[9].calls=Infinity,x=>x.samples[9].lost=true,x=>x.samples[9].title=true,x=>x.samples[9].visible='hidden',x=>x.samples[9].focused=false,x=>x.samples[9].dt=NaN];
  for(const mutate of bad){const x=structuredClone(good);mutate(x);assert.equal(assessWindow(x,40).ok,false);}
  // Exercise the real frozen environment setter, including its early return.
  const envSource=readFileSync(resolve(FROZEN,'src/core/env.js'),'utf8');
  const setterBody=envSource.match(/setTimeOfDay\(t01\) \{([\s\S]*?)\n    \},/)[1];
  const setTime=new Function('initial','t01',`let tod=initial; const writeBack=()=>{}, solve=()=>{}; (function(){${setterBody}})(); return tod;`);
  const identityGood=timeOfDay=>Array.from({length:3},()=>({id:'bolter',method:'rockbolt',simMethod:'rockbolt',quality:'high',sourceKey:'glb:bolter',cameraMode:'hero',depth:2,active:false,timeOfDay}));
  assert.equal(assessIdentity(identityGood(setTime(0.5,0.34)),'bolter','rockbolt','high'),true);
  assert.equal(assessIdentity(identityGood(setTime(0.34,0.34)),'bolter','rockbolt','high'),true);
  const changedTime=identityGood(setTime(0.5,0.34));changedTime[2].timeOfDay=setTime(0.5,0.35);
  assert.equal(assessIdentity(changedTime,'bolter','rockbolt','high'),false);
  const changedRepresentation=identityGood(setTime(0.5,0.34));changedRepresentation[2].timeOfDay=0.34;
  assert.equal(assessIdentity(changedRepresentation,'bolter','rockbolt','high'),false);
  console.log(JSON.stringify({passed:true,checks:5+bad.length}));process.exit(0);
}
if(args.includes('--prepare')){
  if(existsSync(FROZEN))throw Error('Frozen source already exists; preserve it and choose a fresh task directory for a new baseline.');
  mkdirSync(FROZEN,{recursive:true});
  const inputs=['index.html','package.json','vite.config.js',...files(resolve(ROOT,'src')).map(p=>relative(ROOT,p)),...files(resolve(ROOT,'public')).map(p=>relative(ROOT,p))];
  const before=Object.fromEntries(inputs.map(p=>[p.replaceAll('\\','/'),fileSha(resolve(ROOT,p))]));
  for(const p of inputs){const dest=resolve(FROZEN,p);mkdirSync(dirname(dest),{recursive:true});copyFileSync(resolve(ROOT,p),dest);}
  const copied=manifest(FROZEN);assert.deepEqual(copied,before,'Snapshot must match original inputs exactly');
  for(const p of inputs)assert.equal(fileSha(resolve(ROOT,p)),before[p.replaceAll('\\','/')],'Inputs changed during snapshot');
  for(const [id]of PLAN)assert.equal(copied[`public/models/${id}.glb`],EXPECTED[id],'Asset is not the reviewed current export');
  json(resolve(WORK,'freeze.json'),{created:new Date().toISOString(),baseline:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),sourceRoot:ROOT,servedRoot:FROZEN,files:copied,authoring:Object.fromEntries(['bolter','crawler_th','sonic_truck','tunnel_jumbo'].map(id=>['blender/'+id+'.py',fileSha(resolve(ROOT,'blender',id+'.py'))]))});
  console.log(`Frozen ${inputs.length} files; four exact current export hashes verified.`);process.exit(0);
}
for(let i=0;i<args.length;i++){if(!['--port','--lease','--out'].includes(args[i]))throw Error('Unknown argument '+args[i]);i++;}
const port=Number(flag('port','5208')),lease=resolve(flag('lease',resolve(ROOT,'../drillity-coordination/gpu-owner.txt'))),out=resolve(flag('out',resolve(WORK,'capture')));
if(!Number.isInteger(port)||port<1024||[5178,5198].includes(port))throw Error('Use a private explicit port');
const checkLease=()=>assert.equal(readFileSync(lease,'utf8').trim(),'optimized-rig-runtime','Exact GPU lease required');
checkLease();if(existsSync(out))throw Error('Refusing stale evidence output');mkdirSync(out,{recursive:true});
const freeze=JSON.parse(readFileSync(resolve(WORK,'freeze.json'),'utf8'));assert.deepEqual(manifest(FROZEN),freeze.files,'Frozen inputs changed');
const base=`http://127.0.0.1:${port}`;
const report={created:new Date().toISOString(),baseline:freeze.baseline,sourceRoot:ROOT,servedRoot:FROZEN,harnessSHA256:fileSha(fileURLToPath(import.meta.url)),freeze,expectedCases:8,cases:[],errors:[],warnings:[],requestsFailed:[],httpErrors:[],failures:[],browserClosed:false,limitations:['Current optimized assets only; no matched before/after asset performance comparison.','Desktop system Chrome at mobile CSS viewport; not a physical mid-range phone.','FPS uses unthrottled headed rAF wall intervals with app-frame validation; not GPU timer queries.','Parked QA depth2 state with sim.update suspended and explicit hero camera; simulation CPU cost excluded. No live drilling or all-camera certification.','Rig surface metric includes runtime fitted surface tool/string; excludes shadows, AO, section tooling and post.','Instrumented render wall duration includes actual rendering plus wrappers; wrapper-only overhead is unmeasured. Scratch extra draws and wall duration are separate diagnostics, never subtracted from FPS.']};
let browser,context,page;
async function sample(n){return page.evaluate(n=>new Promise(resolve=>{
  const c=window.__DRILLITY,g=c.renderer.gl,ids=()=>g.info.programs.map(p=>p.id).sort((a,b)=>a-b),w={programsBefore:ids(),samples:[]};let prev,raf,finished=false;
  const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);cancelAnimationFrame(raf);w.programsAfter=ids();resolve(w);};
  const timer=setTimeout(()=>{w.timedOut=true;finish();},45000);
  const tick=()=>{const now=performance.now();w.samples.push({dt:prev===undefined?null:now-prev,frame:c.clock.frame,calls:g.info.render.calls,triangles:g.info.render.triangles,visible:document.visibilityState,focused:document.hasFocus(),lost:g.getContext().isContextLost(),title:c.renderer.titleActive});prev=now;if(w.samples.length===n)finish();else raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
}),n);}
async function warm(first){
  const shader=await page.evaluate(()=>window.__DRILLITY.renderer.warmShaders());
  const start=Date.now(),min=first?25000:8000,quiet=first?10000:3000,max=first?120000:45000;
  let stableAt=start,bestAt=start,prior=null,best=Infinity;const windows=[];
  while(Date.now()-start<max){const raw=await sample(40),assessment=assessWindow(raw,40);windows.push({elapsedMs:Date.now()-start,raw,assessment});if(!assessment.ok)return {ok:false,shader,windows,reason:'invalid warm observation'};
    const ids=JSON.stringify(raw.programsAfter);if(ids!==prior){prior=ids;stableAt=Date.now();}if(assessment.medianMs<best*.92){bestAt=Date.now();}best=Math.min(best,assessment.medianMs);
    if(Date.now()-start>=min&&Date.now()-stableAt>=quiet&&Date.now()-bestAt>=quiet)return {ok:shader.ready===true&&shader.total>0&&shader.done===shader.total&&shader.pending===0&&!shader.failed&&!shader.retired,shader,windows,elapsedMs:Date.now()-start,reason:'bounded shader identity and pace quiet window'};
    await new Promise(r=>setTimeout(r,250));
  }return {ok:false,shader,windows,reason:'warm timeout'};
}
async function sourceCheck(){
  const observed={};
  for(const p of Object.keys(freeze.files).filter(p=>p.startsWith('src/')||p==='index.html')){
    const response=await fetch(`${base}/${p}?raw`,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Served source HTTP '+p+' '+response.status);
    const text=await response.text(),match=text.match(/export default ("(?:[^"\\]|\\.)*")/s);
    if(!match)throw Error('Cannot verify served raw source '+p);
    observed[p]=sha(JSON.parse(match[1]));assert.equal(observed[p],freeze.files[p],'Wrong served source '+p);
  }
  for(const [id]of PLAN){const r=await fetch(`${base}/models/${id}.glb`,{signal:AbortSignal.timeout(20000)});assert.equal(r.status,200);observed[`public/models/${id}.glb`]=sha(Buffer.from(await r.arrayBuffer()));assert.equal(observed[`public/models/${id}.glb`],EXPECTED[id]);}
  return observed;
}
try{
  report.servedSource=await sourceCheck();checkLease();
  browser=await chromium.launch({headless:false,channel:'chrome',args:['--mute-audio','--enable-gpu-rasterization','--ignore-gpu-blocklist']});
  report.browserVersion=browser.version();const browserCDP=await browser.newBrowserCDPSession();report.systemInfo=await browserCDP.send('SystemInfo.getInfo');report.processes=await browserCDP.send('SystemInfo.getProcessInfo');await browserCDP.detach();
  for(const quality of ['high','low']){
    context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await context.route('**/@vite/client',r=>r.fulfill({contentType:'application/javascript',body:`export const createHotContext=()=>({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},data:{}});export function updateStyle(id,content){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=content;}export function removeStyle(){};export function injectQuery(u){return u;}export class ErrorOverlay extends HTMLElement {}`}));
    page=await context.newPage();page.setDefaultTimeout(180000);
    page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());if(m.type()==='warning')report.warnings.push(m.text());});
    page.on('requestfailed',r=>report.requestsFailed.push({url:r.url(),error:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()});});
    await page.goto(`${base}/?quality=${quality}&shot&mute&glb=strict`,{waitUntil:'domcontentloaded'});await page.bringToFront();
    await page.waitForFunction(()=>window.__DRILLITY?.__qa&&document.querySelector('.menu')&&!document.querySelector('.menu').hidden);
    for(const [id,method]of PLAN){checkLease();const row={id,method,quality};report.cases.push(row);console.log('START '+id+' '+quality);
      row.setup=await page.evaluate(async({id,method})=>{
        const c=window.__DRILLITY,{makeRandom}=await import('/src/core/contract.js');
        c.rand=makeRandom(1337);await c.__qa.loadModel(id);c.state.garage.rigId=id;
        if(!c.rig.setRig(id))throw Error('setRig failed '+id);
        const contract=await c.__qa.startDemoContract({method,region:'german-site',depth:2}),m=c.data.METHODS.find(m=>m.id===method);
        const originalTarget=contract.targetDepth;contract.targetDepth=Math.min(contract.targetDepth,m.depthRange[1]);contract.seed=1337;
        c.geology.generateProfile({regionId:contract.regionId,applicationId:contract.applicationId,targetDepth:contract.targetDepth,seed:1337,difficulty:contract.difficulty??2,methodId:contract.methodId,archetype:contract.archetype||null});
        c.sim.startHole(contract);c.rig.setRig(id);c.rig.setMethod(method);c.sim.debug.setDepth(2);c.geology.setDepth(2);c.sim.update=()=>{};c.state.drill.active=false;
        c.state.world.timeOfDay=0.34;c.env.setTimeOfDay(0.34);
        c.renderer.setCameraMode('hero');
        return {contract:JSON.parse(JSON.stringify(contract)),originalTarget,methodRange:m.depthRange,compatible:m.rigIds.includes(id),rigSource:c.rig.getActiveSourceKey()};
      },{id,method});
      // Let public systems apply the stationary state/camera before pinning simulation only.
      await sample(90);
      row.state=await page.evaluate(()=>{
        const c=window.__DRILLITY,r=c.renderer,g=r.gl,gl=g.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');
        c.state.drill.active=false;
        return {id:c.rig.getRigId(),spec:c.rig.getSpec(),sourceKey:c.rig.getActiveSourceKey(),method:c.state.contract.methodId,sectionMode:c.geology.profileMode,depth:c.state.drill.depth,active:c.state.drill.active,quality:c.quality.id,cameraMode:r.cameraMode,roots:c.rig.group.children.filter(o=>o.visible&&o.userData.spec).map(o=>({name:o.name,id:o.userData.spec.id,source:o.userData.spec.source})),bands:JSON.parse(JSON.stringify(c.bands)),stage:JSON.parse(JSON.stringify(c.stage)),camera:{position:c.camera.position.toArray(),quaternion:c.camera.quaternion.toArray(),projection:c.camera.projectionMatrix.toArray()},dpr:g.getPixelRatio(),buffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],device:{userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,deviceMemory:navigator.deviceMemory,vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):null,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,version:gl.getParameter(gl.VERSION),contextAttributes:gl.getContextAttributes()},models:c.__qa.models()};
      });
      assert.equal(row.setup.compatible,true);assert.ok(!row.setup.contract.__stub,'Real generated contract required');
      row.warm=await warm(id===PLAN[0][0]);
      const identity=()=>page.evaluate(()=>{const c=window.__DRILLITY;return {depth:c.state.drill.depth,active:c.state.drill.active,id:c.rig.getRigId(),method:c.state.contract.methodId,simMethod:c.sim.methodId,quality:c.quality.id,sourceKey:c.rig.getActiveSourceKey(),cameraMode:c.renderer.cameraMode,timeOfDay:c.env.timeOfDay,position:c.camera.position.toArray(),quaternion:c.camera.quaternion.toArray(),projection:c.camera.projectionMatrix.toArray()};});
      row.beforeClean=await identity();
      row.clean=await sample(120);row.cleanAssessment=assessWindow(row.clean,120);
      row.afterClean=await identity();
      row.attribution=await page.evaluate(()=>new Promise((resolve,reject)=>{
        const c=window.__DRILLITY,r=c.renderer,g=r.gl,oldRender=r.render,oldDirect=g.renderBufferDirect,frames=[];let current;
        const restore=()=>{clearTimeout(timer);r.render=oldRender;g.renderBufferDirect=oldDirect;};
        const timer=setTimeout(()=>{restore();resolve(frames);},45000);
        const belongs=o=>{for(let p=o;p;p=p.parent)if(p===c.rig.group)return true;return false;};
        g.renderBufferDirect=function(camera,scene,geometry,material,object,group){const before=g.info.render.calls;const t=performance.now();const result=oldDirect.apply(this,arguments);const calls=g.info.render.calls-before;if(current&&calls){const rig=belongs(object),pass=material.isMeshDepthMaterial||material.isMeshDistanceMaterial?'shadow':material.isMeshNormalMaterial?'ao':'surface';current.draws.push({calls,rig,pass,object:object.name,material:material.name,type:material.type,geometry:geometry.id});current.directWallMs+=performance.now()-t;}return result;};
        r.render=function(dt){current={frame:c.clock.frame,draws:[],directWallMs:0};const t=performance.now();try{oldRender.call(this,dt);current.wallMs=performance.now()-t;current.calls=g.info.render.calls;current.triangles=g.info.render.triangles;frames.push(current);current=null;if(frames.length===40){restore();resolve(frames);}}catch(e){restore();reject(e);}};
      }));
      row.scratch=await page.evaluate(()=>{
        const c=window.__DRILLITY,g=c.renderer.gl,T=c.THREE,info=g.info,rt=new T.WebGLRenderTarget(32,32),old={target:g.getRenderTarget(),auto:g.shadowMap.autoUpdate,needs:g.shadowMap.needsUpdate,visible:c.rig.group.visible,viewport:g.getViewport(new T.Vector4()),scissor:g.getScissor(new T.Vector4()),scissorTest:g.getScissorTest()};
        const start=performance.now(),one=()=>{info.reset();g.setRenderTarget(rt);g.setViewport(0,0,32,32);g.setScissorTest(false);g.render(c.scene,c.camera);return {calls:info.render.calls,triangles:info.render.triangles};};
        try{g.shadowMap.autoUpdate=false;g.shadowMap.needsUpdate=false;const surface=one();c.rig.group.visible=false;const withoutRig=one();return {surface,withoutRig,rig:{calls:surface.calls-withoutRig.calls,triangles:surface.triangles-withoutRig.triangles},probeExtraCalls:surface.calls+withoutRig.calls,wallMs:performance.now()-start};}
        finally{c.rig.group.visible=old.visible;g.shadowMap.autoUpdate=old.auto;g.shadowMap.needsUpdate=old.needs;g.setRenderTarget(old.target);g.setViewport(old.viewport);g.setScissor(old.scissor);g.setScissorTest(old.scissorTest);rt.dispose();}
      });
      await sample(3);
      row.health=await page.evaluate(()=>{
        const c=window.__DRILLITY,cv=c.renderer.gl.domElement,b=c.bands.surface,s=document.createElement('canvas');s.width=64;s.height=64;const g=s.getContext('2d',{willReadFrequently:true}),dpr=c.renderer.gl.getPixelRatio();g.drawImage(cv,b.x*dpr,b.y*dpr,b.w*dpr,b.h*dpr,0,0,64,64);const p=g.getImageData(0,0,64,64).data,colours=new Set();let min=255,max=0;for(let i=0;i<p.length;i+=4){colours.add(`${p[i]},${p[i+1]},${p[i+2]}`);min=Math.min(min,p[i],p[i+1],p[i+2]);max=Math.max(max,p[i],p[i+1],p[i+2]);}return {colours:colours.size,min,max,contextLost:c.renderer.gl.getContext().isContextLost(),depth:c.state.drill.depth,active:c.state.drill.active,cameraMode:c.renderer.cameraMode,camera:{position:c.camera.position.toArray(),quaternion:c.camera.quaternion.toArray(),projection:c.camera.projectionMatrix.toArray()}};
      });
      await page.screenshot({path:resolve(out,`${id}-${quality}.png`),timeout:60000});
      row.afterCapture=await identity();
      const rigCalls=row.attribution.map(f=>f.draws.filter(d=>d.rig).reduce((s,d)=>s+d.calls,0));
      const rigSurface=row.attribution.map(f=>f.draws.filter(d=>d.rig&&d.pass==='surface').reduce((s,d)=>s+d.calls,0));
      row.summary={fps:row.cleanAssessment.fpsMedian,fpsAggregate:row.cleanAssessment.fpsAggregate,wholeFrameCalls:median(row.clean.samples.map(s=>s.calls)),surfaceCalls:row.scratch.surface.calls,rigSurfaceCalls:row.scratch.rig.calls,actualPipelineRigCalls:median(rigCalls),actualSurfaceRigCalls:median(rigSurface),rigShadowCalls:median(row.attribution.map(f=>f.draws.filter(d=>d.rig&&d.pass==='shadow').reduce((s,d)=>s+d.calls,0))),rigAOCalls:median(row.attribution.map(f=>f.draws.filter(d=>d.rig&&d.pass==='ao').reduce((s,d)=>s+d.calls,0))),instrumentedRenderWallMedianMs:median(row.attribution.map(f=>f.wallMs)),scratchWallMs:row.scratch.wallMs};
      row.identityValid=assessIdentity([row.beforeClean,row.afterClean,row.afterCapture],id,method,quality);
      row.cameraStable=['position','quaternion','projection'].every(k=>row.beforeClean[k].every((v,i)=>Math.abs(v-row.afterClean[k][i])<=1e-6&&Math.abs(v-row.afterCapture[k][i])<=1e-6));
      row.hardwareRenderer=!!row.state.device.renderer&&!/SwiftShader|llvmpipe|software|Microsoft Basic Render/i.test(row.state.device.renderer);
      row.matchingQualityContract=quality==='high'||JSON.stringify(report.cases.find(c=>c.id===id&&c.quality==='high')?.setup.contract)===JSON.stringify(row.setup.contract);
      row.valid=row.warm.ok&&row.cleanAssessment.ok&&row.identityValid&&row.cameraStable&&row.hardwareRenderer&&row.matchingQualityContract&&row.state.sourceKey===`glb:${id}`&&row.state.spec.source==='glb'&&row.state.spec.id===id&&row.state.roots.length===1&&row.state.roots[0].id===id&&row.state.roots[0].source==='glb'&&!row.setup.contract.__stub&&row.health.colours>8&&row.health.max-row.health.min>24&&!row.health.contextLost&&row.scratch.rig.calls>0&&row.attribution.length===40&&row.attribution.every(f=>f.draws.reduce((s,d)=>s+d.calls,0)===f.calls)&&row.summary.actualSurfaceRigCalls===row.scratch.rig.calls;
      row.gates={rig70:row.valid&&row.scratch.rig.calls<=70,surface80:row.valid&&row.scratch.surface.calls<=80,fps60:row.valid&&row.cleanAssessment.fpsMedian>=60};
      if(!row.valid)report.failures.push(`${id}/${quality}: invalid measurement`);
      for(const [gate,pass]of Object.entries(row.gates))if(!pass)report.failures.push(`${id}/${quality}: ${gate} failed`);
      json(resolve(out,'report.json'),report);console.log(JSON.stringify({id,quality,valid:row.valid,...row.summary,gates:row.gates}));
    }
    await context.close();context=null;
  }
}catch(e){report.failures.push(e.stack||String(e));console.error(e);}
finally{
  if(context)await context.close().catch(e=>report.failures.push('context close '+e));
  if(browser){await browser.close();report.browserClosed=!browser.isConnected();}
  report.frozenAfter=manifest(FROZEN);report.frozenUnchanged=JSON.stringify(report.frozenAfter)===JSON.stringify(freeze.files);
  if(!report.frozenUnchanged)report.failures.push('Frozen source changed');
  if(report.cases.length!==8||report.cases.some(c=>!c.summary))report.failures.push('Incomplete eight-case coverage');
  if(report.errors.length||report.requestsFailed.length||report.httpErrors.length)report.failures.push('Browser/resource errors');
  if(report.warnings.some(w=>/shader|warm-up|SMAA|fallback|stand-in|not built|VALIDATE_STATUS/i.test(w)))report.failures.push('Renderer/source warning');
  report.passed=report.failures.length===0;json(resolve(out,'report.json'),report);
}
console.log(JSON.stringify({passed:report.passed,cases:report.cases.length,failures:report.failures,browserClosed:report.browserClosed}));
process.exitCode=report.passed?0:1;
