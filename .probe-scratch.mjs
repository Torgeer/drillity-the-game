import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,140));});
p.on('pageerror',e=>errs.push('PAGEERROR '+e.message.slice(0,200)));
await p.goto('http://localhost:5241/?quality=high&shot',{waitUntil:'load'});
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:90000}).catch(()=>{});
await p.waitForTimeout(11000);
const modes = ['vertical','profile','heading','raise','pile'];
for (const m of modes) {
  const r = await p.evaluate(async (m)=>{
    const D=window.__DRILLITY,T=D.THREE,geo=D.geology;
    geo.generateProfile({regionId:'nordic',applicationId:'water-well',targetDepth:60,seed:99,difficulty:0.3,holeDiaMm:152,profileMode:m});
    D.state.drill.depth=20; Object.assign(D.state.drill,{active:true,rpm:0.7,torque:0.4});
    await new Promise(r=>setTimeout(r,900));
    const find=(n)=>{let o=null;geo.scene.traverse(x=>{if(x.name===n)o=x;});return o;};
    const pl=find('scale-plate'), xr=find('station-ruler'); const cam=geo.camera;
    const ndc=(o)=>{if(!o)return null;o.updateWorldMatrix(true,false);const bx=new T.Box3().setFromObject(o);
      const a=bx.min.clone().project(cam),z=bx.max.clone().project(cam);
      return {x0:+a.x.toFixed(2),x1:+z.x.toFixed(2),y0:+a.y.toFixed(2),y1:+z.y.toFixed(2)};};
    return {mode:D.sectionView?.profileMode, ve:+(D.sectionView?.verticalExaggeration??0).toFixed(2),
      bore:+(D.sectionView?.boreExaggeration??0).toFixed(2), plate:ndc(pl), xruler:ndc(xr)};
  }, m);
  const inF = r.plate && r.plate.x0>=-1.01 && r.plate.x1<=1.01 && r.plate.y0>=-1.01 && r.plate.y1<=1.01;
  console.log(`${(r.mode||m).padEnd(9)} V.E. ${String(r.ve).padStart(5)}  BORE ${String(r.bore).padStart(5)}  plate ${JSON.stringify(r.plate)} ${inF?'IN FRUSTUM':'** OFF SCREEN **'}  xruler ${JSON.stringify(r.xruler)}`);
}
console.log('errors', errs.filter(e=>!/gltfRig/.test(e)).length);
errs.filter(e=>!/gltfRig/.test(e)).slice(0,6).forEach(e=>console.log(' ',e));
await b.close();
