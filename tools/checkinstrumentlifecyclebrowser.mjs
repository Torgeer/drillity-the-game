#!/usr/bin/env node
/** Small actual headed instrument lifecycle matrix. Existing server required.
 * No FPS or automatic glyph/contrast certification. Never starts a server.
 * node tools/checkinstrumentlifecyclebrowser.mjs --port 5198 --lease <gpu-owner.txt>
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf('--' + name); return i < 0 ? fallback : args[i + 1]; };
const port = Number(flag('port', '5198'));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid --port');
const lease = resolve(flag('lease', '../threads/drillity-coordination/gpu-owner.txt'));
const out = resolve(flag('out', 'shots/instrument-lifecycle'));
const checkLease = () => { if (readFileSync(lease, 'utf8').trim() !== 'instrument-grade') throw Error('GPU lease is not instrument-grade'); };
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const paths = ['src/core/renderer.js', 'src/world/geology.js', 'tools/checkinstrumentlifecyclebrowser.mjs'];
const hashes = () => Object.fromEntries(paths.map(p => [p, sha(resolve(p))]));
const base = `http://127.0.0.1:${port}`;
async function verifyServedSource() {
  const result = {};
  for (const path of paths.slice(0, 2)) {
    const response = await fetch(`${base}/${path}?raw`);
    if (!response.ok) throw Error(`Cannot identify served ${path}: HTTP ${response.status}`);
    const module = await response.text();
    const match = module.match(/export default ("(?:[^"\\]|\\.)*")/s);
    if (!match) throw Error(`Unrecognized Vite raw source response: ${path}`);
    const served = JSON.parse(match[1]).replaceAll('\r\n', '\n');
    const local = readFileSync(resolve(path), 'utf8').replaceAll('\r\n', '\n');
    if (served !== local) throw Error(`Served source differs from local candidate: ${path}`);
    result[path] = createHash('sha256').update(served).digest('hex');
  }
  return result;
}
checkLease(); mkdirSync(out, { recursive: true });
const report = { evidence: 'Headed actual GLB, target allocation/disposal, warm-up and pixel readback',
  limitations: ['No FPS or performance certification.', 'Captures require manual readability review.',
    'Quality changes exercise post-chain teardown/rebuild; the entire WebGLRenderer is not recreated.',
    'The private page freezes system updates and automatic rendering during lifecycle measurements.'],
  sourceBefore: hashes(), cases: [], failures: [], errors: [], warnings: [], requestsFailed: [], browserClosed: false };
let browser, context, page;
try {
  report.servedSource = await verifyServedSource();
  browser = await chromium.launch({ headless: false, channel: 'chrome',
    args: ['--mute-audio', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
  context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  // HMR alone is suppressed; failed font/model/resources remain recorded errors.
  await context.route('**/@vite/client', r => r.fulfill({ contentType: 'application/javascript', body:
    `export const createHotContext=()=>({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},data:{}});export function updateStyle(id,content){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=content;}export function removeStyle(){};export function injectQuery(u){return u;}export class ErrorOverlay extends HTMLElement {}` }));
  page = await context.newPage(); page.setDefaultTimeout(180000);
  page.on('pageerror', e => report.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') report.errors.push(m.text()); if (m.type() === 'warning') report.warnings.push(m.text()); });
  page.on('requestfailed', r => report.requestsFailed.push({ url: r.url(), error: r.failure()?.errorText }));
  await page.goto(`http://127.0.0.1:${port}/?quality=high&shot&mute`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__DRILLITY?.__qa && document.querySelector('.menu') && !document.querySelector('.menu').hidden);
  await page.evaluate(async () => {
    const c = window.__DRILLITY, id = c.data.METHODS.find(m => m.id === 'dth').rigIds[0];
    c.sim.update = () => {};
    await c.__qa.loadModel(id); await c.__qa.startDemoContract({ method: 'dth', depth: 2 });
    c.state.garage.rigId = id; c.rig.setRig(id); c.state.drill.active = false;
  });
  await page.evaluate(() => new Promise(resolve => { let n = 0; const tick = () => ++n >= 70 ? resolve() : requestAnimationFrame(tick); requestAnimationFrame(tick); }));
  await page.evaluate(() => {
    const c = window.__DRILLITY, r = c.renderer, gl = r.gl;
    const probe = window.__instrumentLifecycle = { renderer: r, render: r.render,
      updates: c.systems.filter(s => typeof s.update === 'function').map(s => [s, s.update]),
      setTarget: gl.setRenderTarget, target: null, targets: [], disposed: [], bindings: [], warming: false };
    for (const [s] of probe.updates) s.update = () => {};
    r.render = () => {};
    gl.setRenderTarget = function(target, ...rest) {
      if (target?.texture?.name === 'Drillity.sectionInstruments') {
        probe.target = target;
        if (!probe.targets.includes(target)) {
          probe.targets.push(target);
          target.addEventListener('dispose', () => probe.disposed.push(target.texture.uuid));
        }
        if (probe.warming) probe.bindings.push(target.texture.uuid);
      }
      return probe.setTarget.call(this, target, ...rest);
    };
  });
  for (const [width, height, quality] of [[390,844,'high'],[390,844,'medium'],[390,844,'low'],[320,568,'low'],[320,568,'medium'],[320,568,'high']]) {
    checkLease();
    const previousViewport = page.viewportSize();
    if (previousViewport.width !== width || previousViewport.height !== height) await page.setViewportSize({ width, height });
    const result = await page.evaluate(async ({width, height, quality}) => {
      const c = window.__DRILLITY, p = window.__instrumentLifecycle, r = c.renderer, gl = r.gl, T = c.THREE;
      const oldTarget = p.target, oldQuality = c.quality.id, oldDisposed = p.disposed.length;
      const beforeOwners = c.geology.instrumentMeshes;
      r.setQuality(quality);
      // Explicit synchronous resize also handles platforms where the browser
      // resize event has not reached main.js yet. Existing owners receive it.
      const effectiveDpr = Math.min(window.devicePixelRatio || 1, c.quality.dprCap);
      c.viewport = { w: width, h: height, dpr: effectiveDpr };
      for (const s of c.systems) if (typeof s.resize === 'function') s.resize(width, height, effectiveDpr);
      for (const [s, update] of p.updates) if (s !== c.sim) update.call(s, 0, c.state);
      p.bindings = []; p.warming = true;
      let warm;
      try { warm = await r.warmShaders(); } finally { p.warming = false; }
      const target = p.target;
      if (!target) throw Error('Warm-up did not bind an instrument target');
      const programIds = () => gl.info.programs.map(program => program.id);
      const programsWarm = programIds();
      p.render.call(r, 0);
      const programsFirst = programIds();
      // Preserve the immediate post-warm result above, then settle the frozen
      // scene before a strict repeat. These draws never hide program increments.
      p.render.call(r, 0); p.render.call(r, 0);
      const hardware = gl.getContext(), w = gl.domElement.width, h = gl.domElement.height;
      const pixels = () => { const a = new Uint8Array(w*h*4); hardware.readPixels(0,0,w,h,hardware.RGBA,hardware.UNSIGNED_BYTE,a); return a; };
      const a = pixels(), png = gl.domElement.toDataURL('image/png');
      p.render.call(r, 0); const b = pixels(), programsRepeat = programIds();
      let repeatChanged = 0, varied = 0;
      for (let i=0;i<a.length;i+=4) {
        if (Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2])) > 1) repeatChanged++;
        if (a[i] !== a[0] || a[i+1] !== a[1] || a[i+2] !== a[2]) varied++;
      }
      const half = new Uint16Array(target.width*target.height*4);
      gl.readRenderTargetPixels(target,0,0,target.width,target.height,half); gl.setRenderTarget(null);
      let nonfinite = 0, covered = 0, opaque = 0, invalidAlpha = 0;
      for (let i=0;i<half.length;i+=4) {
        for(let k=0;k<4;k++) if(!Number.isFinite(T.DataUtils.fromHalfFloat(half[i+k]))) nonfinite++;
        const alpha=T.DataUtils.fromHalfFloat(half[i+3]);
        if(alpha>0)covered++; if(alpha===1)opaque++; if(alpha<0 || alpha>1)invalidAlpha++;
      }
      const owners=c.geology.instrumentMeshes.map(m=>({name:m.name,uuid:m.uuid,mask:m.layers.mask,visible:m.visible,
        sourceCanvas:[m.material.map.image.width,m.material.map.image.height]}));
      const buffer=gl.getDrawingBufferSize(new T.Vector2());
      return { width,height,quality,actualQuality:c.quality.id,source:c.rig.getSpec().source,
        viewport:{...c.viewport},browserViewport:[window.innerWidth,window.innerHeight],effectiveDpr,
        dimensions:{canvas:[w,h],drawingBuffer:buffer.toArray(),target:[target.width,target.height]},
        oldQuality,qualityChanged:oldQuality!==quality,oldTarget:oldTarget?.texture.uuid ?? null,target:target.texture.uuid,
        targetReplaced:oldTarget !== target,oldTargetDisposed:!!oldTarget && p.disposed.slice(oldDisposed).includes(oldTarget.texture.uuid),
        instrumentVisibleBefore:beforeOwners.some(m=>m.visible),owners,warm,warmTargetBindings:p.bindings,
        programsWarm,programsFirst,programsRepeat,
        newProgramsFirst:programsFirst.filter(id=>!programsWarm.includes(id)),
        newProgramDetails:gl.info.programs.filter(program=>!programsWarm.includes(program.id)).map(program=>({id:program.id,name:program.name,type:program.type,cacheKey:program.cacheKey})),
        newProgramsRepeat:programsRepeat.filter(id=>!programsFirst.includes(id)),
        covered,opaque,invalidAlpha,nonfinite,varied,repeatChanged,contextLost:hardware.isContextLost(),
        api:{instrumentLayer:c.geology.instrumentLayer,visibleMetres:c.geology.visibleMetres,pxPerMetre:c.geology.pxPerMetre},png };
    }, {width,height,quality});
    const name = `${width}x${height}-${quality}`;
    writeFileSync(resolve(out,name+'-canvas.png'), Buffer.from(result.png.split(',')[1],'base64')); delete result.png;
    await page.screenshot({ path:resolve(out,name+'-page.png') });
    report.cases.push({name,...result});
    const same = (a,b)=>JSON.stringify(a)===JSON.stringify(b);
    for(const [ok, issue] of [
      [result.actualQuality===quality && result.source==='glb','actual quality and GLB'],
      [same(result.browserViewport,[width,height]) && result.viewport.w===width && result.viewport.h===height
        && result.viewport.dpr===result.effectiveDpr,'requested logical viewport'],
      [same(result.dimensions.drawingBuffer,[Math.floor(width*result.effectiveDpr),Math.floor(height*result.effectiveDpr)]),'requested quality-scaled drawing buffer'],
      [same(result.dimensions.canvas,result.dimensions.drawingBuffer)&&same(result.dimensions.target,result.dimensions.drawingBuffer),'target tracks drawing buffer'],
      [result.warmTargetBindings.includes(result.target),'warm-up uses current real target'],
      [!result.qualityChanged || (result.targetReplaced&&result.oldTargetDisposed),'quality rebuild disposes previous target'],
      [result.instrumentVisibleBefore && result.owners.length>=4 && new Set(result.owners.map(o=>o.uuid)).size===result.owners.length,'live unique instrument API'],
      [result.owners.every(o=>o.visible&&o.mask===(1<<result.api.instrumentLayer)),'instrument layer ownership survives'],
      [Number.isFinite(result.api.visibleMetres)&&result.api.visibleMetres>0&&Number.isFinite(result.api.pxPerMetre)&&result.api.pxPerMetre>0,'finite geometry API'],
      [result.nonfinite===0&&result.invalidAlpha===0&&result.covered>0&&result.opaque>0&&result.varied>0&&!result.contextLost,'finite nonempty actual render'],
      [result.newProgramsFirst.length===0,'no new programs on immediate post-warm render'],
      [result.newProgramsRepeat.length===0,'no new programs on following unchanged renders'],
      [result.repeatChanged===0,'settled frozen repeat exact within one byte']
    ]) if(!ok)report.failures.push({name,issue});
    console.log(name+': target '+result.dimensions.target.join('x')+', new programs '+result.newProgramsFirst.length+', repeat changes '+result.repeatChanged);
  }
} catch(error) { report.failures.push({issue:error.stack||String(error)}); }
finally {
  if(page && !page.isClosed()) {
    try { await page.evaluate(()=>{ const p=window.__instrumentLifecycle;if(!p)return;
      for(const [s,update]of p.updates)s.update=update;
      p.renderer.render=p.render;p.renderer.gl.setRenderTarget=p.setTarget;
    }); } catch(error) { report.failures.push({issue:'Page cleanup: '+error.message}); }
  }
  try { if(context)await context.close(); } catch(error) { report.failures.push({issue:'Context close: '+error.message}); }
  try { if(browser)await browser.close(); report.browserClosed=true; } catch(error) { report.failures.push({issue:'Browser close: '+error.message}); }
  report.sourceAfter=hashes();
  if(JSON.stringify(report.sourceBefore)!==JSON.stringify(report.sourceAfter))report.failures.push({issue:'Source changed during capture'});
  const invalidGraphics = report.warnings.filter(text => /WebGL:.*(?:INVALID_|CONTEXT_LOST)/i.test(text));
  if(invalidGraphics.length)report.failures.push({issue:'Invalid WebGL operations reported as warnings',warnings:invalidGraphics});
  const failedWarmup = report.warnings.filter(text => /shader warm-up could not run|instrument pass unavailable|SMAA unavailable/i.test(text));
  if(failedWarmup.length)report.failures.push({issue:'Requested pipeline or warm-up unavailable',warnings:failedWarmup});
  report.passed=report.cases.length===6 && report.failures.length===0 && report.errors.length===0 && report.requestsFailed.length===0 && report.browserClosed;
  writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(`INSTRUMENT LIFECYCLE: ${report.cases.length} cases; ${report.failures.length} failed assertions; browserClosed=${report.browserClosed}.`);
process.exitCode=report.passed?0:1;
