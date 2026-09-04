import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,3000));
const info = await p.evaluate(() => {
  const cs = (el) => { if(!el) return null; const s=getComputedStyle(el); const r=el.getBoundingClientRect();
    return { pos:s.position, z:s.zIndex, display:s.display, opacity:s.opacity, bg:s.backgroundColor,
             vis:s.visibility, rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)] }; };
  const gl = document.getElementById('gl'), ui = document.getElementById('ui'), app=document.getElementById('app');
  const C = window.__DRILLITY;
  const r = C?.renderer;
  return {
    gl: cs(gl), ui: cs(ui), app: cs(app),
    glSize: gl ? { w: gl.width, h: gl.height, cw: gl.clientWidth, ch: gl.clientHeight } : null,
    uiChildren: ui ? [...ui.children].map(e=>({cls:e.className, ...cs(e)})) : [],
    stage: r?.stage, bands: r?.bands, cameraMode: r?.cameraMode,
    sceneChildren: C?.scene?.children?.length, sectionChildren: C?.sectionScene?.children?.length,
    camPos: C?.camera?.position ? [C.camera.position.x, C.camera.position.y, C.camera.position.z].map(v=>+v.toFixed(2)) : null,
    clearColor: (()=>{ try{ const t=new C.THREE.Color(); C.renderer.gl.getClearColor(t); return '#'+t.getHexString()+' a='+C.renderer.gl.getClearAlpha(); }catch(e){ return 'n/a: '+e.message; } })(),
    topAt: (()=>{ const el=document.elementFromPoint(195,200); return el? el.tagName+'.'+el.className : null; })(),
  };
});
console.log(JSON.stringify(info,null,2));
await b.close();
