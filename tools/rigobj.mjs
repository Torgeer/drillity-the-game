import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,3500));
console.log(await p.evaluate(() => {
  const C = window.__DRILLITY, T = C.THREE;
  const root = C.rig?.group; if (!root) return 'no rig group';
  const box=new T.Box3(), v=new T.Vector3(); const rows=[];
  const chain=(o)=>{const a=[];let n=o;while(n&&n!==root.parent){a.unshift(n.name||n.type);n=n.parent;}return a.join('/');};
  root.traverse(o=>{ if(!o.geometry) return;
    box.setFromObject(o); if(!isFinite(box.min.x)) return; box.getCenter(v);
    const sz=[box.max.x-box.min.x,box.max.y-box.min.y,box.max.z-box.min.z];
    rows.push({p:chain(o),g:o.geometry.type,r:+(o.geometry.parameters?.radius??0).toFixed(2),
      sz:sz.map(n=>+n.toFixed(2)), wc:[v.x,v.y,v.z].map(n=>+n.toFixed(2)),
      m:o.material?.name||o.material?.type, vis:o.visible});
  });
  rows.sort((a,b)=>Math.max(...b.sz)-Math.max(...a.sz));
  return rows.slice(0,10).map(r=>`${Math.max(...r.sz).toFixed(2)}m  ${r.g}(r=${r.r})  @[${r.wc}]  ${r.m}  vis=${r.vis}\n      ${r.p}`).join('\n');
}));
await b.close();
