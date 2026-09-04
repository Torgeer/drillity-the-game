import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto(process.argv[2] || 'http://localhost:5179/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,4000));
console.log(JSON.stringify(await p.evaluate(() => {
  const C = window.__DRILLITY;
  const out = [];
  C.scene.traverse(o => {
    if (o.parent?.name !== 'collar') return;
    const m = o.material;
    out.push({
      type: o.type, geo: o.geometry?.type,
      geoParams: o.geometry?.parameters,
      pos: o.position.toArray().map(n=>+n.toFixed(2)),
      rot: o.rotation.toArray().slice(0,3).map(n=>+(+n).toFixed(3)),
      scale: o.scale.toArray().map(n=>+n.toFixed(2)),
      visible: o.visible,
      mat: { type: m?.type, color: m?.color ? '#'+m.color.getHexString() : null,
             transparent: m?.transparent, opacity: m?.opacity, depthWrite: m?.depthWrite,
             side: m?.side, name: m?.name },
    });
  });
  return out;
}), null, 1));
await b.close();
