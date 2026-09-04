import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,3500));
console.log(JSON.stringify(await p.evaluate(() => {
  const C = window.__DRILLITY, T = C.THREE;
  const rows = []; const box=new T.Box3(), v=new T.Vector3();
  const chain = (o)=>{ const a=[]; let n=o; while(n){ a.unshift(n.name||n.type); n=n.parent; } return a.join('/'); };
  C.scene.traverse(o => {
    const g = o.geometry; if (!g) return;
    if (!/Sphere|Icosahedron|Dodecahedron|Octahedron/.test(g.type)) return;
    box.setFromObject(o); if(!isFinite(box.min.x)) return; box.getCenter(v);
    rows.push({ geo:g.type, params:g.parameters, path:chain(o),
      worldC:[v.x,v.y,v.z].map(n=>+n.toFixed(2)),
      size:[box.max.x-box.min.x, box.max.y-box.min.y, box.max.z-box.min.z].map(n=>+n.toFixed(2)),
      scale:o.scale.toArray().map(n=>+n.toFixed(3)), vis:o.visible,
      mat:o.material?.name || o.material?.type, count:o.count });
  });
  rows.sort((a,b)=>b.size[1]-a.size[1]);
  return rows.slice(0,8);
}), null, 1));
await b.close();
