import { openStable } from './.qa-thumb.mjs';
const { b, p } = await openStable();
const errs=[]; p.on('pageerror', e=>errs.push('PAGEERROR '+e.message));
p.on('console', m=>{ const t=m.text(); if (/preview|thumbnail/i.test(t)) errs.push(m.type()+': '+t); });
await p.goto('http://localhost:5178/?quality=low&shot', { waitUntil:'load' });
await p.waitForFunction(()=>window.__DRILLITY?.ui?.show && window.__DRILLITY?.shopPreview, null, {timeout:60000});
await p.waitForTimeout(2500);
await p.evaluate(()=>window.__DRILLITY.ui.show('shop'));
await p.waitForTimeout(4500);

const r = await p.evaluate(async () => {
  const c = window.__DRILLITY;
  const sp = c.shopPreview;
  const out = { ready: typeof sp.ready, cards: document.querySelectorAll('.icard').length, canvases: [] };
  const stats = (cv) => {
    try {
      const g = cv.getContext('2d');
      if (!g) return { err: 'no 2d ctx (canvas already webgl?)' };
      const d = g.getImageData(0,0,cv.width,cv.height).data;
      let min=255,max=0,sum=0,n=0;
      for (let i=0;i<d.length;i+=4*7) { const l=(d[i]+d[i+1]+d[i+2])/3; min=Math.min(min,l); max=Math.max(max,l); sum+=l; n++; }
      return { w: cv.width, h: cv.height, cw: cv.clientWidth, ch: cv.clientHeight, min:+min.toFixed(1), max:+max.toFixed(1), mean:+(sum/n).toFixed(1) };
    } catch (e) { return { err: String(e) }; }
  };
  for (const cv of [...document.querySelectorAll('.icard__prev canvas')].slice(0,5)) out.canvases.push(stats(cv));

  // Render thumbnails directly from real listings the SHOP screen resolved.
  out.direct = [];
  const refs = window.__QA_REFS || [];
  for (const ref of refs.slice(0, 6)) {
    let bmp = null, err = null;
    try { bmp = await sp.thumbnail(ref, { wear: 0 }); } catch (e) { err = String(e); }
    if (!bmp) { out.direct.push({ ref: ref && (ref.id || ref), bmp: null, err }); continue; }
    const off = document.createElement('canvas');
    off.width = bmp.width; off.height = bmp.height;
    const g = off.getContext('2d');
    g.drawImage(bmp, 0, 0);
    const d = g.getImageData(0,0,off.width,off.height).data;
    let max=0,sum=0,n=0,aMax=0,aSum=0,cover=0;
    for (let i=0;i<d.length;i+=4) { const l=(d[i]+d[i+1]+d[i+2])/3; max=Math.max(max,l); sum+=l; aMax=Math.max(aMax,d[i+3]); aSum+=d[i+3]; n++; if (d[i+3]>8) cover++; }
    out.direct.push({ ref: ref && (ref.id || ref), model: ref && ref.model, w: bmp.width, h: bmp.height,
      maxLum:+max.toFixed(1), meanLum:+(sum/n).toFixed(2), maxAlpha:aMax, meanAlpha:+(aSum/n).toFixed(2), coverPct:+(100*cover/n).toFixed(2) });
  }
  out.lastFrame = sp.lastFrame || null;
  return out;
});
console.log(JSON.stringify(r, null, 2));
console.log('--- console ---'); errs.slice(0,10).forEach(e=>console.log(' ', e));
await p.screenshot({ path: 'C:/Users/henri/AppData/Local/Temp/claude/C--Users-henri-Downloads-threads/58b8454d-8bd2-4e3d-8c05-92b4953f6ab5/scratchpad/shop-before.png' });
await b.close();
