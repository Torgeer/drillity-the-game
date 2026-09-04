import { openStable } from './.qa-thumb.mjs';
const { b, p } = await openStable();
await p.goto('http://localhost:5178/?quality=low&shot', { waitUntil:'load' });
await p.waitForFunction(()=>window.__DRILLITY?.ui?.show && window.__DRILLITY?.shopPreview, null, {timeout:60000});
await p.waitForTimeout(2500);
await p.evaluate(()=>window.__DRILLITY.ui.show('shop'));
const live = '.screens > .screen:not([hidden]):not(.is-leaving)';
await p.waitForSelector(`${live} .famcard, ${live} .lrow, ${live} .row`, { timeout: 15000 });
await p.waitForTimeout(600);
for (const sel of ['.famcard, .lrow, .row', '.chip']) {
  const el = await p.$(`${live} ${sel}`); if (el) { await el.click().catch(()=>{}); await p.waitForTimeout(1000); }
}
await p.waitForSelector(`${live} .icard`, { timeout: 15000 });
await p.waitForTimeout(2500);

console.log(JSON.stringify(await p.evaluate(async () => {
  const sp = window.__DRILLITY.shopPreview;
  const bmp = await sp.thumbnail('foundation-bg', { wear: 0 });
  if (!bmp) return { err: 'no bmp for foundation-bg' };
  const off = document.createElement('canvas'); off.width = bmp.width; off.height = bmp.height;
  const g = off.getContext('2d'); g.drawImage(bmp, 0, 0);
  const d = g.getImageData(0,0,off.width,off.height).data;
  let min=255,max=0,sum=0,n=0,aMin=255,aMax=0;
  for (let i=0;i<d.length;i+=4) { const l=(d[i]+d[i+1]+d[i+2])/3; min=Math.min(min,l); max=Math.max(max,l); sum+=l; n++; aMin=Math.min(aMin,d[i+3]); aMax=Math.max(aMax,d[i+3]); }
  // Simulate both composites onto the card ramp at 135px.
  const sim = (mode) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 135;
    const c2 = cv.getContext('2d');
    const ramp = c2.createLinearGradient(0,0,0,135);
    ramp.addColorStop(0,'rgb(22 28 38)'); ramp.addColorStop(1,'rgb(13 18 25)');
    c2.fillStyle = ramp; c2.fillRect(0,0,135,135);
    const key = c2.createRadialGradient(0.42*135,0.24*135,0,0.42*135,0.24*135,135*0.85);
    key.addColorStop(0,'rgb(245 158 11 / .16)'); key.addColorStop(1,'rgb(245 158 11 / 0)');
    c2.fillStyle = key; c2.fillRect(0,0,135,135);
    c2.globalCompositeOperation = mode;
    const s = Math.min(135/bmp.width, 135/bmp.height)*1.18, dw=bmp.width*s, dh=bmp.height*s;
    c2.drawImage(bmp,(135-dw)/2,(135-dh)/2,dw,dh);
    const dd = c2.getImageData(0,0,135,135).data;
    let mn=255,mx=0,sm=0,k=0; for (let i=0;i<dd.length;i+=4){const l=(dd[i]+dd[i+1]+dd[i+2])/3; mn=Math.min(mn,l); mx=Math.max(mx,l); sm+=l; k++;}
    return { mode, min:+mn.toFixed(1), max:+mx.toFixed(1), mean:+(sm/k).toFixed(1), range:+(mx-mn).toFixed(1) };
  };
  return { bmp: { w:bmp.width, h:bmp.height, min:+min.toFixed(1), max:+max.toFixed(1), mean:+(sum/n).toFixed(1), alphaMin:aMin, alphaMax:aMax },
           screen: sim('screen'), sourceOver: sim('source-over') };
}), null, 2));
await b.close();
