import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--hide-scrollbars','--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200));});
p.on('pageerror',e=>errs.push('PAGEERROR '+e.message.slice(0,200)));
p.on('framenavigated', f => { if (f===p.mainFrame()) console.log('NAV ->', f.url()); });
await p.goto('http://localhost:5188/?quality=high&shot',{waitUntil:'load'});
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:90000}).catch(e=>console.log('no booted class'));
await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(()=>{
  const D=window.__DRILLITY; const g=D?.geology; const names=[];
  try{ g?.scene?.traverse(o=>names.push(o.name||o.type)); }catch(e){}
  return { scene:D?.state?.scene, hasGeo:!!g, hasScene:!!g?.scene, drill:D?.state?.drill, n:names.length, names:names.slice(0,40) };
}),null,1));
console.log('errors',errs.length); errs.slice(0,8).forEach(e=>console.log(' ',e));
await b.close();
