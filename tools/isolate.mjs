import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,3500));
await p.evaluate(()=>{ document.getElementById('ui').style.display='none'; });
await new Promise(r=>setTimeout(r,600));
await p.screenshot({ path:'shots/iso-0-all.png' });
for (const name of ['cloudDeck','puddleHide','sky']) {
  await p.evaluate((n)=>{
    const C = window.__DRILLITY;
    C.scene.traverse(o=>{
      if (n==='cloudDeck' && o.name==='cloudDeck') o.visible=false;
      if (n==='sky' && o.material?.type==='ShaderMaterial' && !o.name) o.visible=false;
      if (n==='puddleHide' && o.geometry?.type==='CircleGeometry' && o.geometry?.parameters?.radius===2.4) o.visible=false;
    });
  }, name);
  await new Promise(r=>setTimeout(r,700));
  await p.screenshot({ path:`shots/iso-${name}.png` });
  console.log('hid', name);
}
await b.close();
