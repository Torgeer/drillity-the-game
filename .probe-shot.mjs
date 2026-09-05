import { chromium, devices } from 'playwright';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const PORT=arg('port','5200'), TAG=arg('tag','whirl'), DEPTH=Number(arg('depth',30));
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,220));});
p.on('pageerror',e=>errs.push('PAGEERROR '+e.message.slice(0,220)));
await p.goto(`http://localhost:${PORT}/?quality=high&shot`,{waitUntil:'load'});
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:90000}).catch(()=>{});
await p.waitForTimeout(12000);
await p.evaluate((d)=>{ const D=window.__DRILLITY; window.__PD=d; D.state.drill.depth = d;
  Object.assign(D.state.drill,{active:true,rpm:0.75,torque:0.5,jam:0,wob:0.55});
  const tick=()=>{ D.state.drill.depth = window.__PD; Object.assign(D.state.drill,{active:true,rpm:0.75,torque:0.5,jam:0}); requestAnimationFrame(tick); }; tick(); }, DEPTH);
await p.waitForTimeout(4000);
// hide the DOM HUD so the band is clean
await p.addStyleTag({content:'.screen,.sitedock,.sstrip,.hud,#model-error{opacity:0 !important}'});
await p.waitForTimeout(600);
for (let i=0;i<4;i++){ await p.screenshot({path:`shots/${TAG}-${i}.png`}); await p.waitForTimeout(180); }
// and a jammed frame
await p.evaluate(()=>{ Object.assign(window.__DRILLITY.state.drill,{jam:1,torque:0.95}); });
await p.waitForTimeout(1500);
await p.screenshot({path:`shots/${TAG}-jam.png`});
console.log('errors',errs.length); errs.slice(0,8).forEach(e=>console.log(' ',e));
await b.close();
