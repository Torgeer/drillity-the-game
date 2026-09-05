import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {ENUMERATE} from '../.hudqa/enumerate.js';
// Headed layout/motion evidence only. Coordinate GPU use before running.
// node tools/checkuimotion.mjs --port 5178 --out shots/ui-motion
const args=process.argv.slice(2);
const option=(name,fallback)=>{const i=args.indexOf(name);if(i<0)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing value for '+name);return args[i+1]};
const port=Number(option('--port','5178'));
assert(Number.isInteger(port)&&port>0&&port<=65535,'Invalid port');
const tag='current';
const out=pathToFileURL(resolve(option('--out','shots/ui-motion'))+sep); await mkdir(out,{recursive:true});
const stub=`export const createHotContext=()=>({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},get data(){return {}}});export function updateStyle(id,c){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=c}export function removeStyle(){}export function injectQuery(u){return u}export class ErrorOverlay extends HTMLElement{}`;
const browser=await chromium.launch({headless:false,channel:'chrome',args:['--mute-audio']});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
await context.route('**/@vite/client',r=>r.fulfill({status:200,contentType:'application/javascript',body:stub}));
const page=await context.newPage(); const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try {
 console.log('BOOT_START');
 await page.goto(`http://127.0.0.1:${port}/?quality=low&shot`,{waitUntil:'domcontentloaded',timeout:180000});
 await page.waitForFunction(()=>window.__DRILLITY?.ui?.show&&window.__DRILLITY?.sim,null,{timeout:240000});
 await page.waitForFunction(()=>document.querySelector('.screens > .screen:not(.boot):not([hidden])'),null,{timeout:240000});
 console.log('BOOT_READY');
 const report={tag,passed:false,quality:'low',evidence:'DOM layout and authored motion; no FPS verdict',errors,cases:[]};
 for(const [width,height] of [[390,844],[320,568]]) {
  await page.setViewportSize({width,height});
  for(const [method,rig] of [['dth','dth-crawler'],['rc','rc-rig']]) {
   await page.evaluate(({method,rig})=>{
    const c=window.__DRILLITY;try{c.sim.abortHole('qa')}catch{}
    c.state.player.level=60;
    const k={id:'qa-ui-'+method,title:'Motion layout test',client:'QA',regionId:'nordic',methodId:method,applicationId:method==='dth'?'quarry-blasthole':'exploration',targetDepth:100,holeDia:152,holes:1,payout:9000,deadlineHours:24,difficulty:2,requiredCerts:[],seed:7};
    c.state.contract=k;c.state.world.regionId='nordic';c.state.garage.rigId=rig;c.rig.setRig(rig);c.rig.setMethod(method);
    c.geology.generateProfile({regionId:'nordic',applicationId:k.applicationId,targetDepth:100,seed:1337,difficulty:2,methodId:method});
    c.ui.show('site',{contract:k});c.sim.startHole(k);c.sim.setInput('feed',.55);c.sim.setInput('rotation',.6);c.sim.setInput('flush',.6);
   },{method,rig});
   await page.waitForFunction(()=>{const s=document.querySelector('.screen--site:not([hidden])');return s&&!s.classList.contains('is-entering')&&!s.classList.contains('is-entering--back')},null,{timeout:30000});
   await page.waitForTimeout(1200);
   const measurement=await page.evaluate(`(${ENUMERATE})({})`);
   const geometry=await page.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2}};
    const live=document.querySelector('.screen--site:not([hidden])');
    return {stage:rect(live),leave:rect(live.querySelector('.site__leave,.sstrip__leave')),controls:[...live.querySelectorAll('button,[role=slider],input')].filter(e=>e.getBoundingClientRect().width).map(e=>({class:e.className,text:e.getAttribute('aria-label')||e.textContent,reach:e.dataset.reach,...rect(e)})),contextLost:window.__DRILLITY.renderer.gl.getContext().isContextLost()};
   });
   const name=`${tag}-${width}x${height}-${method}`;
   await page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});
   report.cases.push({name,measurement,geometry});
   console.log(JSON.stringify({name,leave:geometry.leave,overlaps:measurement.overlaps,small:measurement.smallTargets,clipped:measurement.clipped,split:measurement.split,contextLost:geometry.contextLost}));
  }
 }
 const reference=JSON.parse(await readFile(new URL('../research/motion-export.json',import.meta.url),'utf8'));
 report.cssEngine=await page.evaluate(async report=>{
  const {ease}=await import('/src/core/motion.js');
  const el=document.createElement('div');el.style.cssText='position:absolute;left:-10000px;top:0;width:1px;height:1px';document.body.append(el);
  const results=[];
  for(const row of report.curves){
   const timing=getComputedStyle(document.documentElement).getPropertyValue('--curve-'+row.name).trim();
   if(!CSS.supports('animation-timing-function',timing))throw Error('Unsupported timing '+row.name);
   const a=el.animate([{transform:'translateX(0px)'},{transform:'translateX(1000px)'}],{duration:1000,easing:timing,fill:'both'});a.pause();let max=0;
   for(let i=0;i<513;i++){const t=(i+.37)/513;a.currentTime=1000*t;const x=new DOMMatrixReadOnly(getComputedStyle(el).transform).m41/1000;max=Math.max(max,Math.abs(x-ease(row.name,t)));}
   a.cancel();results.push({name:row.name,maxError:max});
   if(max>report.limits.css+report.limits.blender+1e-5)throw Error('CSS engine mismatch '+row.name+' '+max);
  }
  el.remove();return results;
 },reference);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelector('.ui-root').classList.contains('reduced-motion'));
 report.osReduced=await page.evaluate(()=>({duration:getComputedStyle(document.documentElement).getPropertyValue('--motion-d3').trim(),flag:document.querySelector('.ui-root').classList.contains('reduced-motion'),animations:document.querySelector('.screen--site').getAnimations().length}));
 await page.emulateMedia({reducedMotion:'no-preference'});
 if(tag!=='baseline'){
  const leave=page.locator('.site__leave');
  await leave.evaluate(el=>el.classList.add('is-pressed'));
  report.pressedLeave=await leave.boundingBox();
  report.numberRoll=await page.evaluate(async()=>{const {NumberRoll}=await import('/src/ui/components.js');const {ease,DUR}=await import('/src/core/motion.js');const n=document.createElement('span');const r=NumberRoll(n,{duration:DUR.d3,easing:t=>ease('count',t),format:String});r.to(100);r.step(DUR.d3*.4);const actual=r.value,expected=100*ease('count',.4);r.to(10,{instant:true});return {actual,expected,instant:r.value}});
  await leave.evaluate(el=>el.classList.remove('is-pressed'));
  await leave.click();
  await page.getByRole('alertdialog',{name:'Leave the hole?'}).waitFor();
  report.confirmDefaultFocus=await page.evaluate(()=>document.activeElement.textContent.trim());
  await page.getByRole('button',{name:'Keep drilling',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('.modal'));
  report.cancelledLeave=await page.evaluate(()=>({scene:window.__DRILLITY.state.scene,focus:document.activeElement.className}));
  await page.evaluate(()=>window.__DRILLITY.state.settings.reducedMotion=true);
  await page.waitForFunction(()=>document.querySelector('.ui-root').classList.contains('reduced-motion'));
  report.gameReduced=await page.evaluate(()=>getComputedStyle(document.querySelector('.site__leave')).getPropertyValue('--motion-d3').trim());
  await page.evaluate(()=>window.__DRILLITY.state.settings.reducedMotion=false);
  await page.waitForFunction(()=>!document.querySelector('.ui-root').classList.contains('reduced-motion'));
  const oldInset=await page.evaluate(()=>document.documentElement.style.getPropertyValue('--sa-b'));
  await page.evaluate(()=>document.documentElement.style.setProperty('--sa-b','34px'));
  await page.waitForTimeout(50);
  report.safeAreaLeave=await leave.boundingBox();
  await page.evaluate(v=>document.documentElement.style.setProperty('--sa-b',v),oldInset);
  report.modalRace=await page.evaluate(async()=>{
   const wait=ms=>new Promise(r=>setTimeout(r,ms));
   document.querySelector('.site__leave').focus();
   window.__DRILLITY.ui.confirm({title:'First race fixture',cancelLabel:'First cancel'});
   await wait(20);
   document.querySelector('.modal:not(.is-out) .btn--quiet').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
   window.__DRILLITY.ui.confirm({title:'Second race fixture',cancelLabel:'Second cancel'});
   await wait(240);
   const result={focus:document.activeElement.textContent,open:document.querySelectorAll('.modal:not(.is-out)').length};
   document.querySelector('.modal:not(.is-out) .btn--quiet').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await wait(240);
   return result;
  });
  report.springConsumers=await page.evaluate(async()=>{
   const {ease}=await import('/src/core/motion.js');const results=[];
   for(const [cls,name,from,to] of [['grade is-stamp','stamp',2.4,1],['rlevelup','levelup',.7,1]]){
    const el=document.createElement('div');el.className=cls;el.style.cssText='position:absolute;left:-10000px;top:0';document.body.append(el);
    const animations=el.getAnimations();if(animations.length!==2)throw Error(cls+' expected transform and opacity animations, got '+animations.length);
    for(const a of animations)a.pause();let transformError=0,opacityError=0;
    for(let i=0;i<257;i++){const t=(i+.37)/257;for(const a of animations)a.currentTime=a.effect.getTiming().duration*t;const cs=getComputedStyle(el),m=new DOMMatrixReadOnly(cs.transform);transformError=Math.max(transformError,Math.abs(Math.hypot(m.a,m.b)-(from+(to-from)*ease('stamp',t))));opacityError=Math.max(opacityError,Math.abs(Number(cs.opacity)-ease('reveal',t)));}
    results.push({name,transformError,opacityError});el.remove();
   }
   return results;
  });
 }
 console.log('CSS_ENGINE',JSON.stringify(report.cssEngine),'OS_REDUCED',JSON.stringify(report.osReduced));
 await writeFile(new URL(tag+'.json',out),JSON.stringify(report,null,2));
 if(tag!=='baseline'){
  assert.equal(report.cases.length,4);
  assert.equal(report.errors.length,0,'Page errors');
  for(const c of report.cases){assert(c.geometry.leave.w>=44&&c.geometry.leave.h>=44,'Small leave target');assert.equal(c.measurement.overlaps,0,c.name+' overlap');assert.equal(c.measurement.clipped.length,0,c.name+' clipped');assert.equal(c.measurement.onBand3D.length,0,c.name+' over3D');assert(c.measurement.targets>=5,'No target subject');assert.equal(c.geometry.contextLost,false);for(const target of c.geometry.controls)assert(target.w>=44&&target.h>=44,c.name+' undersized native target '+target.class);}
  assert.equal(report.modalRace.focus,'Second cancel');assert.equal(report.modalRace.open,1);for(const c of report.springConsumers){assert(c.transformError<.00016);assert(c.opacityError<.00001);}
  assert(report.pressedLeave.height>=44);assert.equal(report.confirmDefaultFocus,'Keep drilling');assert.equal(report.cancelledLeave.scene,'site');assert.equal(report.cancelledLeave.focus,'site__leave');assert.equal(report.osReduced.duration,'1ms');assert.equal(report.osReduced.flag,true);assert.equal(report.gameReduced,'1ms');assert(report.safeAreaLeave.y+report.safeAreaLeave.height<=568-34);assert(Math.abs(report.numberRoll.actual-report.numberRoll.expected)<1e-9);assert.equal(report.numberRoll.instant,10);console.log('UI_MOTION_AFTER_PASS');
 }
 report.passed=true;
 await writeFile(new URL(tag+'.json',out),JSON.stringify(report,null,2));
}finally{await browser.close();}
