import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,3500));
await p.evaluate(()=>{ document.getElementById('ui').style.display='none'; });
console.log(await p.evaluate(()=>{
  const C=window.__DRILLITY; const out=[];
  C.scene.traverse(o=>{ if(o.isPoints||o.isSprite) out.push(`${o.type} name=${o.name||'-'} vis=${o.visible} count=${o.geometry?.attributes?.position?.count} mat=${o.material?.type} blend=${o.material?.blending} parent=${o.parent?.name||o.parent?.type}`); });
  return out.join('\n') || '(no points/sprites in surface scene)';
}));
// Hide every Points/Sprite, then the whole rig, then everything from vfx
for (const step of ['points','rig']) {
  await p.evaluate((s)=>{
    const C=window.__DRILLITY;
    if (s==='points') C.scene.traverse(o=>{ if(o.isPoints||o.isSprite) o.visible=false; });
    if (s==='rig' && C.rig?.group) C.rig.group.visible=false;
  }, step);
  await new Promise(r=>setTimeout(r,600));
  await p.screenshot({ path:`shots/iso3-${step}.png` });
  console.log('hid', step);
}
await b.close();
