import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,3500));
await p.evaluate(()=>{ document.getElementById('ui').style.display='none'; });
const names = ['outcrops','stones','spruce','props-metal','props-paint','props-matte'];
for (const n of names) {
  const hit = await p.evaluate((n)=>{
    let found=false; window.__DRILLITY.scene.traverse(o=>{ if(o.name===n){o.visible=false; found=true;} });
    return found;
  }, n);
  await new Promise(r=>setTimeout(r,500));
  await p.screenshot({ path:`shots/iso2-${n}.png` });
  console.log('hid', n, hit);
}
await b.close();
