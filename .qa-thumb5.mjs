import { chromium, devices } from 'playwright';
const VITE_STUB = `export const createHotContext = () => ({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},get data(){return{}}});
export function updateStyle(id,c){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=c;}
export function removeStyle(id){const s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(s)s.remove();}
export function injectQuery(u){return u;} export class ErrorOverlay extends HTMLElement{}`;

async function run(stub) {
  const b = await chromium.launch({ args: ['--mute-audio'], headless: false, channel: 'chrome' });
  const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
  if (stub) await c.route('**/@vite/client', r => r.fulfill({ status:200, contentType:'application/javascript', body: VITE_STUB }));
  const p = await c.newPage();
  await p.goto('http://localhost:5178/?quality=low&shot', { waitUntil:'load' });
  await p.waitForFunction(()=>window.__DRILLITY?.ui?.show && window.__DRILLITY?.shopPreview, null, {timeout:60000});
  await p.waitForTimeout(2500);
  const live = '.screens > .screen:not([hidden]):not(.is-leaving)';
  const out = {};
  const measure = async (tag) => {
    await p.waitForTimeout(2500);
    out[tag] = await p.evaluate(() => {
      const stats = (cv) => { const g=cv.getContext('2d'); if(!g) return {err:'no2d'};
        const d=g.getImageData(0,0,cv.width,cv.height).data; let mn=255,mx=0,sm=0,n=0;
        for(let i=0;i<d.length;i+=4*5){const l=(d[i]+d[i+1]+d[i+2])/3;mn=Math.min(mn,l);mx=Math.max(mx,l);sm+=l;n++;}
        return { max:+mx.toFixed(0), mean:+(sm/n).toFixed(1) }; };
      const cards=[...document.querySelectorAll('.icard, .gcard, .slotcard')];
      const rows=[];
      for (const card of cards) { const cv=card.querySelector('canvas'); if(!cv) continue;
        const nm=(card.querySelector('.icard__t,h3,.gcard__t,.slotcard__t')?.textContent||card.textContent).trim().slice(0,34);
        rows.push({ nm, ...stats(cv) }); }
      return { n: rows.length, blank: rows.filter(r=>r.max<40).length, rows: rows.slice(0,24) };
    });
  };
  // shop listings
  await p.evaluate(()=>window.__DRILLITY.ui.show('shop'));
  await p.waitForSelector(`${live} .famcard, ${live} .lrow, ${live} .row`, { timeout:15000 });
  await p.waitForTimeout(600);
  for (const sel of ['.famcard, .lrow, .row', '.chip']) { const el=await p.$(`${live} ${sel}`); if(el){await el.click().catch(()=>{}); await p.waitForTimeout(1000);} }
  await p.waitForSelector(`${live} .icard`, { timeout:15000 });
  await measure('shop-listings');
  // second category: tools
  await p.evaluate(()=>window.__DRILLITY.ui.show('shop'));
  await p.waitForTimeout(1200);
  const tabs = await p.$$(`${live} .tab, ${live} .chip`);
  if (tabs[1]) { await tabs[1].click().catch(()=>{}); await p.waitForTimeout(1200); }
  for (const sel of ['.famcard, .lrow, .row', '.chip']) { const el=await p.$(`${live} ${sel}`); if(el){await el.click().catch(()=>{}); await p.waitForTimeout(1000);} }
  await measure('shop-tools');
  // garage
  await p.evaluate(()=>window.__DRILLITY.ui.show('garage'));
  await measure('garage');
  await p.screenshot({ path: `C:/Users/henri/AppData/Local/Temp/claude/C--Users-henri-Downloads-threads/58b8454d-8bd2-4e3d-8c05-92b4953f6ab5/scratchpad/garage-${stub?'stub':'hmr'}.png` });
  await b.close();
  return out;
}
const withStub = await run(true);
console.log('=== HMR STUBBED ==='); console.log(JSON.stringify(withStub, null, 1));
