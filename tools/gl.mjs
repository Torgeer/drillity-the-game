import { chromium, devices } from 'playwright';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
p.on('console', m => { if (m.type()==='error') console.log('[err]', m.text().slice(0,200)); });
await p.goto('http://localhost:5178/?quality=high&shot', { waitUntil:'load' });
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:60000}).catch(()=>{});
await p.mouse.click(195,700).catch(()=>{});
await new Promise(r=>setTimeout(r,2000));
await p.evaluate(async () => { await window.__DRILLITY.__qa.startDemoContract({ depth: 12 }); });
await new Promise(r=>setTimeout(r,4000));
// Hide the UI entirely, then grab the raw framebuffer.
const out = await p.evaluate(() => {
  document.getElementById('ui').style.display = 'none';
  const C = window.__DRILLITY;
  const info = {
    lights: [], meshes: 0, visibleMeshes: 0,
    camPos: [C.camera.position.x, C.camera.position.y, C.camera.position.z].map(v=>+v.toFixed(2)),
    camMode: C.renderer.cameraMode,
    fog: C.scene.fog ? { color:'#'+C.scene.fog.color.getHexString(), density: C.scene.fog.density } : null,
    envMap: !!C.scene.environment, bg: C.scene.background ? C.scene.background.type || 'color' : null,
    toneExposure: C.renderer.gl.toneMappingExposure,
  };
  C.scene.traverse(o => {
    if (o.isLight) info.lights.push({ t:o.type, i:+o.intensity.toFixed(2), vis:o.visible, pos:[o.position.x,o.position.y,o.position.z].map(v=>+v.toFixed(1)) });
    if (o.isMesh) { info.meshes++; if (o.visible) info.visibleMeshes++; }
  });
  return info;
});
console.log(JSON.stringify(out,null,2));
await new Promise(r=>setTimeout(r,600));
const png = await p.evaluate(() => window.__DRILLITY.renderer.captureFrame?.() || null);
if (png) writeFileSync('shots/raw-gl.png', Buffer.from(png.split(',')[1],'base64'));
else console.log('captureFrame unavailable');
await p.screenshot({ path:'shots/raw-noui.png' });
await b.close();
