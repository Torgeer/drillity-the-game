/** Actual Blender selection/preview and five section shader modes in headed
 * Chrome. Requires the existing dev server; no build, no FPS claim.
 * node tools/checkrigvisual.mjs --port 5178 --out shots/rig-visual-check
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const args=process.argv.slice(2), flag=(n,d)=>{const i=args.indexOf('--'+n);return i<0?d:args[i+1];};
const out=resolve(flag('out','shots/rig-visual-check'));
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:false,channel:'chrome',args:['--mute-audio','--enable-gpu-rasterization','--ignore-gpu-blocklist']});
const c=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const VITE_STUB=`export const createHotContext=()=>({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},data:{}});export function updateStyle(id,content){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=content;}export function removeStyle(){};export function injectQuery(u){return u;}export class ErrorOverlay extends HTMLElement {}`;
await c.route('**/@vite/client',r=>r.fulfill({contentType:'application/javascript',body:VITE_STUB}));
const p=await c.newPage(), report={errors:[],warnings:[],captures:[]};
p.on('pageerror',e=>{report.errors.push(e.message);console.log('PAGE ERROR '+e.message);});
p.on('console',m=>{if(m.type()==='error'){report.errors.push(m.text());console.log('ERROR '+m.text().slice(0,200));}if(m.type()==='warning')report.warnings.push(m.text());});
const frames=async n=>p.evaluate(n=>new Promise(resolve=>{let k=0;function tick(){if(++k>=n)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);}),n);
try {
  await p.goto('http://localhost:'+flag('port','5178')+'/?quality=high&shot',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>window.__DRILLITY?.__qa && document.querySelector('.menu') && !document.querySelector('.menu').hidden,null,{timeout:180000});
  report.preview=await p.evaluate(async()=>{
    const c=window.__DRILLITY;
    const beforeKey=c.rig.getSourceKey('pd55');
    const before=await c.shopPreview.thumbnail('pd55');
    await c.__qa.loadModel('pd55');
    const after=await c.shopPreview.thumbnail('pd55');
    const preview=c.rig.buildPreview('pd55');
    let meshes=0, vertices=0, materialDisposals=0, geometryDisposals=0;
    const materials=new Set(),geometries=new Set();
    preview.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
    const onMat=()=>materialDisposals++,onGeo=()=>geometryDisposals++;
    for(const m of materials)m.addEventListener('dispose',onMat);
    for(const g of geometries)g.addEventListener('dispose',onGeo);
    const spec={...preview.userData.spec};
    preview.userData.dispose();preview.userData.dispose();
    for(const m of materials)m.removeEventListener('dispose',onMat);
    return {beforeKey,afterKey:c.rig.getSourceKey('pd55'),bitmapChanged:before!==after,retiredBitmapWidth:before.width,spec,meshes,vertices,geometryCount:geometries.size,geometryDisposals,materialDisposals};
  });
  assert.equal(report.preview.spec.id,'pd55');assert.equal(report.preview.spec.source,'glb');
  assert.equal(report.preview.bitmapChanged,true,'Cached stand-in thumbnail must be replaced');
  assert.equal(report.preview.geometryDisposals,report.preview.geometryCount,'Preview disposal must release only its own geometry once');
  assert.equal(report.preview.materialDisposals,0,'Preview disposal must preserve shared materials');
  console.log('pd55 preview '+JSON.stringify(report.preview));
  await p.evaluate(()=>window.__DRILLITY.ui.show('shop'));
  await p.getByRole('searchbox',{name:'Search listings'}).fill('Duoleader');
  await p.locator('.icard').first().waitFor({state:'visible'});
  await frames(35);
  await p.screenshot({path:resolve(out,'pd55-shop.png'),timeout:60000});
  await p.getByRole('button',{name:'Specs',exact:true}).first().click();
  await frames(40);
  await p.screenshot({path:resolve(out,'pd55-detail.png'),timeout:60000});
  await p.locator('.sheet__x').click();
  await p.evaluate(async()=>{
    const c=window.__DRILLITY;
    c.state.unlocked.rigs=Array.from(new Set([...c.state.unlocked.rigs,'pd55']));
    c.state.garage.rigId='pd55';c.rig.setRig('pd55');
    await c.__qa.startDemoContract({method:'dth',depth:2});
    c.rig.setRig('pd55');
    await c.renderer.warmShaders();
  });
  await frames(45);
  report.selection=await p.evaluate(()=>{const c=window.__DRILLITY;return {id:c.rig.getRigId(),spec:c.rig.getSpec(),roots:c.rig.group.children.filter(o=>o.visible && o.userData.spec).map(o=>({name:o.name,id:o.userData.spec.id,source:o.userData.spec.source}))};});
  assert.equal(report.selection.id,'pd55');assert.equal(report.selection.spec.source,'glb');assert.equal(report.selection.spec.id,'pd55');
  assert.equal(report.selection.roots.length,1,'Exactly one machine must be visible');
  await p.screenshot({path:resolve(out,'pd55-site.png'),timeout:60000});
  console.log('pd55 selected '+JSON.stringify(report.selection.roots));
  const modes=[['vertical','dth'],['profile','hdd'],['raise','raise-boring'],['heading','tunnel-jumbo'],['pile','driven-pile']];
  for(const [mode,method] of modes){
    await p.evaluate(async({method})=>{
      const c=window.__DRILLITY,m=c.data.METHODS.find(m=>m.id===method),rig=m.rigIds[0];
      await c.__qa.loadModel(rig);c.state.garage.rigId=rig;c.rig.setRig(rig);
      await c.__qa.startDemoContract({method,depth:2});c.rig.setRig(rig);
      await c.renderer.warmShaders();
    },{method});
    await frames(45);
    const state=await p.evaluate(()=>{
      const c=window.__DRILLITY,r=c.renderer,gl=r.gl.getContext();
      const width=gl.drawingBufferWidth,height=gl.drawingBufferHeight,pixels=new Uint8Array(width*height*4);
      gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      const colours=new Set();for(let i=0;i<pixels.length;i+=64)colours.add((pixels[i]<<16)|(pixels[i+1]<<8)|pixels[i+2]);
      return {mode:c.geology.profileMode,method:c.state.contract.methodId,rig:c.rig.getRigId(),source:c.rig.getSpec().source,contextLost:gl.isContextLost(),drawCalls:r.info.render.calls,colours:colours.size,sectionVisible:c.geology.sectionRoot.visible,stub:!!c.state.contract.__stub};
    });
    assert.equal(state.mode,mode);assert.equal(state.method,method);assert.equal(state.source,'glb');
    assert.equal(state.contextLost,false);assert.ok(state.drawCalls>0 && state.colours>8,'Real nonblank frame required');
    assert.equal(state.sectionVisible,true);
    await p.screenshot({path:resolve(out,'section-'+mode+'.png'),timeout:60000});
    report.captures.push(state);console.log(JSON.stringify(state));
  }
  report.shaderWarnings=report.warnings.filter(w=>/X4000|uninitiali[sz]ed|VALIDATE_STATUS|Shader Error/i.test(w));
  assert.equal(report.errors.length,0,'No runtime errors: '+report.errors.join(' | '));
  assert.equal(report.shaderWarnings.length,0,'Shader warning remains: '+report.shaderWarnings.join(' | '));
  report.passed=true;
} finally {
  writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2));
  await browser.close();
}

