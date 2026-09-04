import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,3500));
await p.evaluate(()=>{ document.getElementById('ui').style.display='none'; });
console.log(await p.evaluate(()=>{
  const C=window.__DRILLITY;
  const passes = (C.composer?.passes||[]).map((x,i)=>`${i}: ${x.constructor?.name} enabled=${x.enabled}`);
  return 'PASSES:\n' + passes.join('\n');
}));
// 1) kill VFX update
await p.evaluate(()=>{ const C=window.__DRILLITY; C.vfx.update = ()=>{}; C.vfx.stopAll?.(); });
await new Promise(r=>setTimeout(r,800)); await p.screenshot({ path:'shots/iso4-novfxupd.png' });
// 2) hide every object VFX owns in the surface scene by name hint
await p.evaluate(()=>{ const C=window.__DRILLITY; C.scene.traverse(o=>{ if(/shimmer|heat|vfx/i.test(o.name||'')) o.visible=false; }); });
await new Promise(r=>setTimeout(r,700)); await p.screenshot({ path:'shots/iso4-noheat.png' });
// 3) disable every composer pass except the first
await p.evaluate(()=>{ const C=window.__DRILLITY; (C.composer?.passes||[]).forEach((x,i)=>{ if(i>0) x.enabled=false; }); });
await new Promise(r=>setTimeout(r,700)); await p.screenshot({ path:'shots/iso4-nopost.png' });
console.log('done');
await b.close();
