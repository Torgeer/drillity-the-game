import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto(process.argv[2] || 'http://localhost:5179/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,4000));
const out = await p.evaluate(() => {
  const C = window.__DRILLITY, T = C.THREE;
  const rows = [];
  const box = new T.Box3(), sph = new T.Sphere(), v = new T.Vector3();
  C.scene.traverse(o => {
    if (!o.isMesh && !o.isInstancedMesh && !o.isPoints && !o.isSprite && !o.isLine) return;
    try {
      box.setFromObject(o);
      if (!isFinite(box.min.x)) return;
      box.getBoundingSphere(sph); box.getCenter(v);
      rows.push({
        name: o.name || '(unnamed)', type: o.type,
        r: +sph.radius.toFixed(2),
        c: [v.x, v.y, v.z].map(n => +n.toFixed(1)),
        mat: o.material?.type, col: o.material?.color ? '#'+o.material.color.getHexString() : null,
        parent: o.parent?.name || o.parent?.type,
        vis: o.visible,
      });
    } catch {}
  });
  // Everything sitting near the rig, biggest first — that is where the blob is.
  const near = rows.filter(r => Math.hypot(r.c[0], r.c[2]) < 14 && r.r > 1.5 && r.r < 60);
  near.sort((a,b)=>b.r-a.r);
  return near.slice(0, 14);
});
console.log(JSON.stringify(out, null, 1));
await b.close();
