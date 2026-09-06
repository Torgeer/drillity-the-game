/** Actual headed A/B: original shared optical chain versus isolated instruments.
 * Also verifies alpha-zero world preservation and opaque instrument immunity to
 * changing optical uniforms. No FPS or typographic contrast certification.
 * Requires integrated candidate served by an existing server and exact GPU lease.
 * node tools/checkinstrumentgradebrowser.mjs --port 5178 --lease <path>
 */
import {chromium} from 'playwright';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const args=process.argv.slice(2),flag=(k,d)=>{const i=args.indexOf('--'+k);return i<0?d:args[i+1];};
const lease=resolve(flag('lease','../drillity-coordination/gpu-owner.txt'));
const owner='instrument-grade';
function checkLease(){if(readFileSync(lease,'utf8').trim()!==owner)throw Error('GPU lease is not '+owner);}
checkLease();
const out=resolve(flag('out','shots/instrument-grade'));mkdirSync(out,{recursive:true});
const report={evidence:'Actual headed same-state GPU A/B and source-alpha readback. No FPS/contrast certification.',cases:[],errors:[],warnings:[],requestsFailed:[],failures:[]};
const browser=await chromium.launch({headless:false,channel:'chrome',args:['--mute-audio','--enable-gpu-rasterization','--ignore-gpu-blocklist']});
try{
  for(const [width,height] of [[390,844],[320,568]]){
    checkLease();const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    // Freeze HMR only; resource errors including font failures remain failures.
    await context.route('**/@vite/client',r=>r.fulfill({contentType:'application/javascript',body:`export const createHotContext=()=>({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},data:{}});export function updateStyle(id,content){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=content;}export function removeStyle(){};export function injectQuery(u){return u;}export class ErrorOverlay extends HTMLElement {}`}));
    const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());if(m.type()==='warning')report.warnings.push(m.text());});
    page.on('requestfailed',r=>report.requestsFailed.push({url:r.url(),error:r.failure()?.errorText}));
    await page.goto('http://127.0.0.1:'+flag('port','5178')+'/?quality=high&shot&mute',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__DRILLITY?.__qa&&document.querySelector('.menu')&&!document.querySelector('.menu').hidden,null,{timeout:180000});
    await page.evaluate(()=>{window.__DRILLITY.sim.update=()=>{};});
    for(const [mode,method] of [['vertical','dth'],['profile','hdd'],['raise','raise-boring'],['heading','tunnel-jumbo'],['pile','driven-pile']]){
      checkLease();
      await page.evaluate(async({method})=>{const c=window.__DRILLITY,m=c.data.METHODS.find(m=>m.id===method),id=m.rigIds[0];await c.__qa.loadModel(id);await c.__qa.startDemoContract({method,depth:2});c.state.garage.rigId=id;c.rig.setRig(id);c.state.drill.active=false;await c.renderer.warmShaders();},{method});
      await page.evaluate(()=>new Promise(resolve=>{let i=0;function step(){if(++i>=70)resolve();else requestAnimationFrame(step);}requestAnimationFrame(step);}));
      const result=await page.evaluate(()=>{
        const c=window.__DRILLITY,r=c.renderer,gl=r.gl,T=c.THREE,meshes=c.geology.instrumentMeshes;
        if(!meshes?.length)throw Error('No actual instrument API');
        const grade=c.composer.passes.find(p=>p.uniforms?.uChroma),u=grade.uniforms;
        const saved={chroma:u.uChroma.value,vignette:u.uVignette.value,sectionVignette:u.uSectionVignette.value,grain:u.uGrain.value};
        const owners=meshes.map(mesh=>({mesh,visible:mesh.visible,mask:mesh.layers.mask}));
        const restoreOwners=()=>owners.forEach(({mesh,visible,mask})=>{mesh.visible=visible;mesh.layers.mask=mask;});
        const originalSet=gl.setRenderTarget;let target=null;
        gl.setRenderTarget=function(t,...rest){if(t?.texture?.name==='Drillity.sectionInstruments')target=t;return originalSet.call(this,t,...rest);};
        const hardware=gl.getContext(),width=gl.domElement.width,height=gl.domElement.height;
        const capture=()=>{r.render(0);const pixels=new Uint8Array(width*height*4);hardware.readPixels(0,0,width,height,hardware.RGBA,hardware.UNSIGNED_BYTE,pixels);return {pixels,png:gl.domElement.toDataURL('image/png')};};
        const maxDelta=(a,b,i)=>Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]));
        try{
          // Establish a frozen baseline before touching ANY owner or optics.
          // The first zero-dt draw is not reliably settled in every mode.
          // Require three byte-identical RGB frames, bounded to 16 total draws.
          // Never settle/retry after an A/B toggle: all original gates remain.
          const settleChanges=[];let stable=0,previous=capture();
          for(let frame=1;frame<16&&stable<2;frame++){
            const next=capture();let count=0;
            for(let i=0;i<next.pixels.length;i+=4)if(maxDelta(previous.pixels,next.pixels,i)!==0)count++;
            settleChanges.push(count);stable=count===0?stable+1:0;previous=next;
          }
          if(stable<2)throw Error('Frozen scene did not converge within 16 renders: '+settleChanges.join(','));
          if(c.geology.instrumentMeshes.some((m,i)=>m!==meshes[i]))throw Error('Instrument owners changed during baseline settling');
          const isolated=capture(),repeat=capture();
          if(!target||target.width!==width||target.height!==height)throw Error('Actual instrument target missing/wrong size');
          const half=new Uint16Array(width*height*4);gl.readRenderTargetPixels(target,0,0,width,height,half);gl.setRenderTarget(null);
          meshes.forEach(m=>m.visible=false);const world=capture();restoreOwners();
          meshes.forEach(m=>m.layers.set(0));const baseline=capture();restoreOwners();
          r.setGrade({chroma:0,vignette:0,sectionVignette:0,grain:0});const noOptics=capture();r.setGrade(saved);
          let covered=0,opaque=0,uncovered=0,outsideChanged=0,opaqueOpticsChanged=0,changed=0,repeatChanged=0,worldOpticsChanged=0;
          let maxOutsideDelta=0,maxOpaqueOpticsDelta=0;
          for(let i=0;i<half.length;i+=4){const alpha=T.DataUtils.fromHalfFloat(half[i+3]);
            if(maxDelta(isolated.pixels,repeat.pixels,i)>1)repeatChanged++;
            if(alpha===0){uncovered++;const delta=maxDelta(isolated.pixels,world.pixels,i);maxOutsideDelta=Math.max(maxOutsideDelta,delta);if(delta>1)outsideChanged++;if(maxDelta(isolated.pixels,noOptics.pixels,i)>1)worldOpticsChanged++;}
            else{covered++;if(maxDelta(isolated.pixels,baseline.pixels,i)>1)changed++;if(alpha===1){opaque++;const delta=maxDelta(isolated.pixels,noOptics.pixels,i);maxOpaqueOpticsDelta=Math.max(maxOpaqueOpticsDelta,delta);if(delta>1)opaqueOpticsChanged++;}}
          }
          const status={width,height,mode:c.geology.profileMode,source:c.rig.getSpec().source,settleFrames:settleChanges.length+1,settleChanges,contextLost:hardware.isContextLost(),meshNames:meshes.map(m=>m.name),covered,opaque,uncovered,outsideChanged,opaqueOpticsChanged,changed,repeatChanged,worldOpticsChanged,maxOutsideDelta,maxOpaqueOpticsDelta,targetBytes:target.width*target.height*4*2,drawCalls:gl.info.render.calls,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status}))};
          return {...status,images:{isolated:isolated.png,repeat:repeat.png,baseline:baseline.png,world:world.png,noOptics:noOptics.png}};
        }finally{restoreOwners();r.setGrade(saved);gl.setRenderTarget=originalSet;gl.setRenderTarget(null);r.render(0);}
      });
      const name=width+'x'+height+'-'+mode;
      for(const [kind,data] of Object.entries(result.images))writeFileSync(resolve(out,name+'-'+kind+'.png'),Buffer.from(data.split(',')[1],'base64'));
      delete result.images;report.cases.push({name,...result});
      for(const [condition,issue] of [[result.mode===mode&&result.source==='glb'&&!result.contextLost,'Actual mode/GLB/context'],[result.covered>0&&result.opaque>0&&result.uncovered>0,'Nonempty GPU coverage'],[result.changed>0,'Causal A/B has a visible pixel difference'],[result.repeatChanged===0,'Frozen repeat is deterministic'],[result.outsideChanged===0,'Alpha-zero world pixels unchanged'],[result.opaqueOpticsChanged===0,'Opaque instrument pixels independent of optical effects'],[result.worldOpticsChanged>0,'World optical effects remain active']])if(!condition)report.failures.push({name,issue});
      console.log(name+' covered='+result.covered+' changed='+result.changed+' outsideChanged='+result.outsideChanged+' opaqueOpticsChanged='+result.opaqueOpticsChanged);
    }
    await context.close();
  }
}catch(e){report.failures.push({issue:e.stack||String(e)});}
finally{await browser.close();report.browserClosed=true;const invalid=report.warnings.filter(w=>/WebGL:.*(?:INVALID_|CONTEXT_LOST)/i.test(w));if(invalid.length)report.failures.push({issue:'Invalid WebGL operations',warnings:invalid});report.passed=report.cases.length===10&&!report.failures.length&&!report.errors.length&&!report.requestsFailed.length;writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2));}
console.log('INSTRUMENT GPU: '+report.cases.length+' cases; '+report.failures.length+' failures; '+report.errors.length+' errors; browser closed.');
process.exitCode=report.passed?0:1;
