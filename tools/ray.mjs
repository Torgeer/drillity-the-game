import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,3500));
console.log(await p.evaluate(() => {
  const C = window.__DRILLITY, T = C.THREE;
  const rc = new T.Raycaster();
  const chain=(o)=>{const a=[];let n=o;while(n){a.unshift(n.name||n.type);n=n.parent;}return a.join('/');};
  const lines = [];
  // The surface band occupies the top 54% of the canvas; the blob sits near its
  // middle. Sample a small grid of NDC points across the blob.
  for (const [nx, ny] of [[0.26,-0.03],[0.26,0.10],[0.26,-0.16],[0.10,-0.03],[0.40,-0.03],[0.0,-0.30]]) {
    rc.setFromCamera(new T.Vector2(nx, ny), C.camera);
    const hits = rc.intersectObject(C.scene, true).slice(0, 3);
    lines.push(`NDC(${nx},${ny}) -> ` + (hits.length
      ? hits.map(h=>`${h.distance.toFixed(2)}m ${h.object.geometry?.type} [${h.object.material?.name||h.object.material?.type}] ${chain(h.object)}`).join('\n            ')
      : '(nothing)'));
  }
  return lines.join('\n');
}));
await b.close();
