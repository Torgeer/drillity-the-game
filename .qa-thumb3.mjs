import { openStable } from './.qa-thumb.mjs';
const { b, p } = await openStable();
const errs=[]; p.on('pageerror', e=>errs.push('PAGEERROR '+e.message));
p.on('console', m=>{ const t=m.text(); if (/preview|thumbnail/i.test(t)) errs.push(m.type()+': '+t); });
await p.goto('http://localhost:5178/?quality=low&shot', { waitUntil:'load' });
await p.waitForFunction(()=>window.__DRILLITY?.ui?.show && window.__DRILLITY?.shopPreview, null, {timeout:60000});
await p.waitForTimeout(2500);
await p.evaluate(()=>window.__DRILLITY.ui.show('shop'));
const live = '.screens > .screen:not([hidden]):not(.is-leaving)';
await p.waitForSelector(`${live} .famcard, ${live} .lrow, ${live} .row`, { timeout: 15000 });
await p.waitForTimeout(600);
for (const sel of ['.famcard, .lrow, .row', '.chip']) {
  const el = await p.$(`${live} ${sel}`);
  if (el) { await el.click().catch(()=>{}); await p.waitForTimeout(1000); }
}
await p.waitForSelector(`${live} .icard`, { timeout: 15000 });
await p.waitForTimeout(3000);

const r = await p.evaluate(async () => {
  const c = window.__DRILLITY;
  const sp = c.shopPreview;
  const out = { icards: document.querySelectorAll('.icard').length, canvases: [], direct: [] };
  const stats = (cv) => {
    const g = cv.getContext('2d');
    if (!g) return { err:'no 2d' };
    const d = g.getImageData(0,0,cv.width,cv.height).data;
    let min=255,max=0,sum=0,n=0;
    for (let i=0;i<d.length;i+=4*7) { const l=(d[i]+d[i+1]+d[i+2])/3; min=Math.min(min,l); max=Math.max(max,l); sum+=l; n++; }
    return { w:cv.width, h:cv.height, cw:cv.clientWidth, ch:cv.clientHeight, min:+min.toFixed(1), max:+max.toFixed(1), mean:+(sum/n).toFixed(1) };
  };
  const cards = [...document.querySelectorAll('.icard')].slice(0,6);
  for (const card of cards) {
    const cv = card.querySelector('canvas');
    const name = card.querySelector('.icard__t, h3, .icard__name')?.textContent?.trim() || card.textContent.slice(0,40);
    out.canvases.push({ name, ...(cv ? stats(cv) : { err:'no canvas' }) });
  }
  return out;
});
console.log(JSON.stringify(r, null, 2));
console.log('--- console ---'); errs.slice(0,10).forEach(e=>console.log(' ', e));
await p.screenshot({ path: 'C:/Users/henri/AppData/Local/Temp/claude/C--Users-henri-Downloads-threads/58b8454d-8bd2-4e3d-8c05-92b4953f6ab5/scratchpad/shop-listings.png' });
await b.close();
