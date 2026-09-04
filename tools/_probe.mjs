import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>!!(window.__DRILLITY&&window.__DRILLITY.renderer),null,{timeout:60000});
await new Promise(r=>setTimeout(r,3000));
console.log('rkeys: '+ await p.evaluate(()=>Object.keys(window.__DRILLITY.renderer).join(' ')));
await b.close();
