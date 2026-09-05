/** Headed full-game ruler capture and actual Canvas2D glyph metrics.
 * Requires an existing server and an exact shared GPU lease. No FPS or
 * contrast certification. Fixture depth/stage changes freeze the simulation;
 * they verify instrument layout, not physical progress or game balancing.
 * node tools/checkrulerbrowser.mjs --port 5193 --out shots/ruler-browser
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const args=process.argv.slice(2);
const flag=(key,fallback)=>{const i=args.indexOf('--'+key);return i<0?fallback:args[i+1];};
const out=resolve(flag('out','shots/ruler-browser'));
const lease=resolve(flag('lease','../drillity-coordination/gpu-owner.txt'));
if(readFileSync(lease,'utf8').trim()!=='geology-ruler')throw Error('GPU lease is not geology-ruler');
mkdirSync(out,{recursive:true});
const report={evidence:'Actual full-game headed frames and actual Canvas2D glyph metrics; no FPS/contrast verdict.',cases:[],errors:[],warnings:[],requestsFailed:[],failures:[]};
const browser=await chromium.launch({headless:false,channel:'chrome',args:['--mute-audio','--enable-gpu-rasterization','--ignore-gpu-blocklist']});
try {
  const width=Number(flag('width','390')),height=Number(flag('height','844'));
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  // Freeze dev-server hot reload during a capture; the source snapshot is the
  // module loaded at navigation. A later edit must get a separate capture.
  await context.route('**/@vite/client',r=>r.fulfill({contentType:'application/javascript',body:`
    export const createHotContext=()=>({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},data:{}});
    export function updateStyle(id,content){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=content;}
    export function removeStyle(){};export function injectQuery(u){return u;}export class ErrorOverlay extends HTMLElement {}` }));
  await context.addInitScript(()=>{
    const proto=CanvasRenderingContext2D.prototype;
    const fill=proto.fillText,clear=proto.clearRect;
    proto.clearRect=function(x,y,w,h){if(x===0&&y===0&&w>=this.canvas.width&&h>=this.canvas.height)this.canvas.__glyphs=[];return clear.call(this,x,y,w,h);};
    proto.fillText=function(text,x,y,...rest){
      const m=this.measureText(text);
      (this.canvas.__glyphs ||= []).push({text:String(text),x,y,font:this.font,
        left:x-m.actualBoundingBoxLeft,right:x+m.actualBoundingBoxRight,
        top:y-m.actualBoundingBoxAscent,bottom:y+m.actualBoundingBoxDescent});
      return fill.call(this,text,x,y,...rest);
    };
  });
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());if(m.type()==='warning')report.warnings.push(m.text());});
  page.on('requestfailed',r=>report.requestsFailed.push({url:r.url(),error:r.failure()?.errorText}));
  await page.goto('http://127.0.0.1:'+flag('port','5193')+'/?quality=high&shot&mute',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__DRILLITY?.__qa&&document.querySelector('.menu')&&!document.querySelector('.menu').hidden,null,{timeout:180000});
  const frames=async(n=45)=>page.evaluate(n=>new Promise(resolve=>{let i=0;const step=()=>++i>=n?resolve():requestAnimationFrame(step);requestAnimationFrame(step);}),n);
  await page.evaluate(()=>{const c=window.__DRILLITY;c.sim.update=()=>{};});
  const modes=[['vertical','dth'],['profile','hdd'],['raise','raise-boring'],['heading','tunnel-jumbo'],['pile','driven-pile']]
    .filter(([mode])=>!flag('modes','')||flag('modes','').split(',').includes(mode));
  if(!modes.length)throw Error('No ruler cases selected');
  for(const [mode,method] of modes){
    if(readFileSync(lease,'utf8').trim()!=='geology-ruler')throw Error('GPU lease changed');
    await page.evaluate(async({method})=>{
      const c=window.__DRILLITY,m=c.data.METHODS.find(m=>m.id===method),rig=m.rigIds[0];
      await c.__qa.loadModel(rig);c.state.garage.rigId=rig;c.rig.setRig(rig);
      await c.__qa.startDemoContract({method,depth:2});c.rig.setRig(rig);
      c.state.drill.active=false;
      await c.renderer.warmShaders();
    },{method});
    const poses=['spud','scroll',...(['profile','raise'].includes(mode)?['return']:[])]
      .filter(pose=>!flag('poses','')||flag('poses','').split(',').includes(pose));
    if(!poses.length)throw Error('No poses selected for '+mode);
    for(const pose of poses){
      await page.evaluate(({pose})=>{
        const c=window.__DRILLITY,total=c.geology.modeLayout.totalLength;
        const depth=pose==='spud'?0:pose==='return'?total:Math.min(total*.35,60);
        c.state.drill.depth=depth;c.state.drill.stage=pose==='return'?1:0;
        c.state.drill.stageProgress=pose==='return'?total*.8:0;
        c.geology.setDepth(depth);c.geology.setStage(c.state.drill.stage,c.state.drill.stageProgress);
      },{pose});
      await frames(70);
      const sample=await page.evaluate(()=>{
        const c=window.__DRILLITY,T=c.THREE,b=c.bands.section,cam=c.sectionCamera;
        c.sectionScene.updateMatrixWorld(true);
        const proj=v=>{v.project(cam);return {x:b.x+(v.x+1)*b.w/2,y:b.y+(1-v.y)*b.h/2};};
        const names=['depth-ruler','drill-log','station-ruler','scale-plate','depth-readout'];
        const texts=[];
        for(const name of names){
          const mesh=c.geology.sectionRoot.getObjectByName(name),canvas=mesh?.material.map?.image;
          if(!mesh?.visible||!canvas)continue;
          const w=mesh.geometry.parameters.width,h=mesh.geometry.parameters.height;
          const at=(x,y)=>proj(mesh.localToWorld(new T.Vector3((x/canvas.width-.5)*w,(.5-y/canvas.height)*h,0)));
          for(const t of canvas.__glyphs||[]){const a=at(t.left,t.top),z=at(t.right,t.bottom);texts.push({source:name,text:t.text,font:t.font,left:a.x,right:z.x,top:a.y,bottom:z.y});}
        }
        const gl=c.renderer.gl.getContext();
        const tip=c.geology.sectionRoot.getObjectByName('boreholeTip');
        const actionTvd=c.sectionView.depthAtY0-tip.position.y;
        return {band:{x:b.x,y:b.y,w:b.w,h:b.h},mode:c.geology.profileMode,source:c.rig.getSpec().source,
          contextLost:gl.isContextLost(),drawCalls:c.renderer.info.render.calls,texts,actionTvd,
          fixture:{spec:c.geology.spec,total:c.geology.modeLayout.totalLength,depth:c.state.drill.depth,stage:c.state.drill.stage,stageProgress:c.state.drill.stageProgress},
          fontStatus:document.fonts.status,fontFaces:[...document.fonts].map(f=>({family:f.family,status:f.status})),
          fontChecks:{inter:document.fonts.check('11px Inter'),mono:document.fonts.check('11px "JetBrains Mono"'),
            meaning:'FontFaceSet.check can pass without a matching font-face; not proof of a downloaded face.'}};
      });
      const name=mode+'-'+pose;
      sample.name=name;
      const visible=sample.texts.filter(t=>t.bottom>sample.band.y&&t.top<sample.band.y+sample.band.h&&t.right>sample.band.x&&t.left<sample.band.x+sample.band.w);
      if(sample.mode!==mode||sample.source!=='glb'||sample.contextLost||!sample.drawCalls)report.failures.push({case:name,issue:'No actual mode/GLB/render evidence'});
      for(const source of ['scale-plate','depth-readout','drill-log']){
        const ts=visible.filter(t=>t.source===source);
        if(!ts.length)report.failures.push({case:name,issue:'No visible glyphs',source});
        for(const t of ts)if(t.left<sample.band.x-.5||t.right>sample.band.x+sample.band.w+.5||t.top<sample.band.y-.5||t.bottom>sample.band.y+sample.band.h+.5)report.failures.push({case:name,issue:'Actual glyph outside band',text:t});
      }
      const cursor=visible.find(t=>t.source==='depth-readout');
      if(cursor&&Math.abs(Number(cursor.text)-sample.actionTvd)>.061)report.failures.push({case:name,issue:'Readout does not show action TVD',cursor:cursor.text,actionTvd:sample.actionTvd});
      await page.screenshot({path:resolve(out,name+'.png'),timeout:60000});
      report.cases.push(sample);console.log(name+' actual glyphs='+visible.length+' failures='+report.failures.length);
    }
  }
  report.passed=report.failures.length===0&&report.errors.length===0;
}catch(e){report.failures.push({issue:e.stack||String(e)});}
finally{await browser.close();report.browserClosed=true;writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2));}
console.log('RULER BROWSER: '+report.cases.length+' cases, '+report.failures.length+' layout failures, '+report.errors.length+' runtime/resource errors; browser closed');
process.exitCode=report.passed?0:1;
