/** Headed entrance regression. Run beside an existing dev server:
 * node tools/checkentrance.mjs --port 5178 --out shots/entrance-check
 * Serial GPU work; do not run concurrently with visual QA. No build is started.
 * Hold/late are deliberate scheduling injections, not boot-time benchmarks.
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
const args=process.argv.slice(2);
const flag=(name,fallback)=>{const i=args.indexOf('--'+name);return i<0?fallback:args[i+1];};
const dir=resolve(flag('out','shots/entrance-check'));
const origin='http://localhost:'+flag('port','5178')+'/';
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ headless: false, channel: 'chrome', args: ['--mute-audio', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const output = [];
try {
  for (const mode of ['normal', 'hold', 'late', 'off']) {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: mode === 'off' ? 'reduce' : 'no-preference' });
    await c.route('**/@vite/client', route => route.fulfill({ contentType: 'application/javascript', body: `export const createHotContext=()=>({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},data:{}});export function updateStyle(id,content){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=content;}export function removeStyle(){};export function injectQuery(u){return u;}export class ErrorOverlay extends HTMLElement {}` }));
    await c.addInitScript(({ mode }) => {
      let context;
      Object.defineProperty(window, '__DRILLITY', {
        configurable: true, get: () => context, set(value) {
          context = value;
          let renderer;
          Object.defineProperty(value, 'renderer', { configurable: true, get: () => renderer, set(r) {
            if (renderer === r) return; renderer = r;
            if (!r) return;
            if (mode === 'hold') {
              const original = r.warmShaders;
              r.warmShaders = async function (progress) {
                let last;
                const result = await original.call(this, (done, total) => { last = [done,total]; progress(Math.min(done, Math.max(0,total-1)),total); });
                await new Promise(resolve => { window.__releaseTitleHold = resolve; });
                if (last) progress(...last);
                return result;
              };
            }
            if (mode === 'late') {
              const original = r.warmTitle;
              r.warmTitle = async function (...args) {
                const result = await original.apply(this,args);
                await new Promise(resolve => { window.__releaseLateTitle = resolve; });
                return result;
              };
            }
          }});
        }
      });
    }, {mode});
    const p = await c.newPage();
    const errors = [], warnings = [], models = [];
    p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR '+e.message); });
    p.on('console', msg => { if (/boot|ERROR|unavailable/.test(msg.text())) console.log(msg.type()+': '+msg.text().slice(0,500)); if (msg.type() === 'error') errors.push(msg.text()); if (msg.type() === 'warning') warnings.push(msg.text()); });
    p.on('request', req => { if (req.url().includes('/models/')) models.push(req.url()); });
    console.log('START '+mode); await p.goto(origin+'?quality=high&shot' + (mode === 'off' ? '&glb=off' : ''), {waitUntil:'domcontentloaded'});
    if (mode === 'hold') {
      await p.waitForFunction(() => window.__DRILLITY?.renderer?.titleActive && window.__DRILLITY.bootTitle.frames > 3, null, {timeout:120000});
      await p.screenshot({path:dir + '/title-390.png'});
      const layout = await p.evaluate(() => {
        const c = window.__DRILLITY, r = c.renderer;
        const rect = s => { const q=document.querySelector(s).getBoundingClientRect(); return {x:q.x,y:q.y,width:q.width,height:q.height}; };
        const camera = r.titleCamera;
        r.titleScene.updateMatrixWorld(true);
        const bounds = {minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity,vertices:0};
        r.titleScene.traverse(o => { if(!o.isMesh || !o.geometry?.attributes?.position) return; const pos=o.geometry.attributes.position; const v=new c.THREE.Vector3(); for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld).project(camera);const x=(v.x+1)*c.stage.w/2+c.stage.x,y=(1-v.y)*c.stage.h/2+c.stage.y;bounds.minX=Math.min(bounds.minX,x);bounds.maxX=Math.max(bounds.maxX,x);bounds.minY=Math.min(bounds.minY,y);bounds.maxY=Math.max(bounds.maxY,y);bounds.vertices++;} });
        const gl=r.gl.getContext(),pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);
        gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
        let painted=0,sampled=0;
        for(let i=0;i<pixels.length;i+=16){sampled++;if(Math.abs(pixels[i]-pixels[0])+Math.abs(pixels[i+1]-pixels[1])+Math.abs(pixels[i+2]-pixels[2])>12)painted++;}
        return {title:{...c.bootTitle},wordmark:rect('.boot__wm'),rule:rect('.boot__rulewrap'),fact:rect('.boot__factwrap'),bounds,drawCalls:r.info.render.calls,paintedPixelFraction:painted/sampled};
      });
      await p.setViewportSize({width:360,height:640});
      await p.waitForFunction(() => window.__DRILLITY?.viewport?.w === 360);
      await p.screenshot({path:dir + '/title-360.png'});
      await p.waitForFunction(() => typeof window.__releaseTitleHold === 'function'); await p.evaluate(() => window.__releaseTitleHold());
      assert.ok(layout.bounds.vertices>0 && layout.drawCalls>0,'The title must draw a real mesh');
      assert.ok(layout.paintedPixelFraction>0.001,'When the title is visible, actual canvas pixels must contain the model');
      assert.ok(layout.bounds.minY>layout.rule.y+layout.rule.height && layout.bounds.maxY<layout.fact.y,'Title must not overlap loading text');
      output.push({mode:'held-title-layout',layout});
    }
    await p.waitForFunction(() => { const m=document.querySelector('.menu');return window.__DRILLITY?.__qa && m && !m.hidden && m.getBoundingClientRect().width>0 && !m.classList.contains('is-entering'); }, null, {timeout:180000});
    if (mode === 'late') {
      await p.waitForFunction(() => typeof window.__releaseLateTitle === 'function');
      await p.evaluate(() => window.__releaseLateTitle());
    }
    const state = await p.evaluate(async () => {
      const c=window.__DRILLITY;
      await new Promise(resolve => {let n=0;function tick(){if(++n>=20)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);});
      const start=c.clock.frame;
      await new Promise(resolve => {let n=0;function tick(){if(++n>=20)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);});
      return {title:c.bootTitle,bootMarks:c.bootMarks,gameFrames:c.bootFrames.length,frameDelta20Raf:c.clock.frame-start,titleActive:c.renderer.titleActive,titleChildren:c.renderer.titleScene.children.map(x=>x.name),gameRig:c.rig.getRigId(),loaded:c.gltfRigs.loaded(),reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,menuVisible:!document.querySelector('.menu').hidden};
    });
    assert.equal(errors.length,0,'No browser errors: '+errors.join(' | '));
    assert.equal(state.gameFrames,8,'First game-frame measurements must survive title playback');
    assert.equal(state.frameDelta20Raf,20,'There must be only one app frame loop');
    assert.equal(state.titleActive,false,'Title must finish before menu');
    assert.deepEqual(state.titleChildren,['titleCamera'],'Title geometry must be released');
    if(mode==='late') assert.equal(state.title.frames,0,'Late readiness must not reveal title over menu');
    if(mode==='off') assert.equal(state.title.frames,0,'Disabled Blender path must keep the DOM boot screen');
    assert.ok(models.every(url=>!url.includes('/title/')),'Entrance must not request an unbuilt title asset');
    if (mode === 'normal') await p.screenshot({path:dir+'/menu.png'});
    output.push({mode,state,models,errors,warnings});
    writeFileSync(dir+'/report.json',JSON.stringify(output,null,2));
    console.log(JSON.stringify({mode,title:state.title,gameFrames:state.gameFrames,frameDelta20Raf:state.frameDelta20Raf,titleActive:state.titleActive,titleChildren:state.titleChildren,errors,warnings:warnings.filter(w=>/title|uninitial/i.test(w))}));
    await c.close();
  }
} finally { await browser.close(); writeFileSync(dir+'/report.json',JSON.stringify(output,null,2)); }



