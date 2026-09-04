import { chromium, devices } from 'playwright';
const VITE_STUB = `export const createHotContext = () => ({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},get data(){return{}}});
export function updateStyle(id,c){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=c;}
export function removeStyle(id){const s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(s)s.remove();}
export function injectQuery(u){return u;} export class ErrorOverlay extends HTMLElement{}`;
const TAG = process.argv[2] || 'before';
const CASES = [
  { id:'rockbolt', method:'rockbolt', depth:12, loadout:{ bit:'bolt-bit-33' } },
  { id:'driven-pile', method:'driven-pile', depth:16, loadout:{ dolly:'dolly-hardwood' } },
  { id:'rc', method:'rc', depth:40, loadout:{ bit:'rc-hammer-bit', probe:null } },
  { id:'dth', method:'dth', depth:40, loadout:{ bit:'dth-bit-115' } },
];
const MEASURE = () => {
  const stage = document.querySelector('.ui-stage') || document.body;
  const sr = stage.getBoundingClientRect();
  const W = Math.round(sr.width), H = Math.round(sr.height);
  const live = document.querySelector('.screens > .screen:not([hidden]):not(.is-leaving)') || document;
  // Every HUD element that sits ON the stage during drilling.
  const sel = '.sstrip, .site__pause, .progbar, .depthtag, .dlog, .blowchart, .wellpanel, .hazard, .beat, .actrail, .cluster, .unitcard, .toasts .toast';
  const nodes = [...live.querySelectorAll(sel)].filter((n) => {
    if (n.hidden) return false;
    const cs = getComputedStyle(n);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false;
    const r = n.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  });
  const grid = new Uint8Array(Math.ceil(W/2) * Math.ceil(H/2));
  const GW = Math.ceil(W/2);
  const regions = [];
  for (const n of nodes) {
    const r = n.getBoundingClientRect();
    regions.push({ cls: n.className.split(' ')[0], x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
    const x0 = Math.max(0, Math.floor((r.left - sr.left)/2)), x1 = Math.min(GW, Math.ceil((r.right - sr.left)/2));
    const y0 = Math.max(0, Math.floor((r.top - sr.top)/2)), y1 = Math.min(Math.ceil(H/2), Math.ceil((r.bottom - sr.top)/2));
    for (let y=y0;y<y1;y++) for (let x=x0;x<x1;x++) grid[y*GW+x] = 1;
  }
  let covered = 0; for (let i=0;i<grid.length;i++) covered += grid[i];
  return { W, H, regions: regions.length, list: regions,
    coveredPct: +(100*covered/grid.length).toFixed(1), uncoveredPct: +(100*(1-covered/grid.length)).toFixed(1) };
};
const b = await chromium.launch({ args: ['--mute-audio'], headless:false, channel:'chrome' });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
await c.route('**/@vite/client', r => r.fulfill({ status:200, contentType:'application/javascript', body: VITE_STUB }));
const p = await c.newPage();
await p.goto('http://localhost:5178/?quality=low&shot', { waitUntil:'load' });
await p.waitForFunction(()=>window.__DRILLITY?.ui?.show && window.__DRILLITY?.sim, null, {timeout:60000});
await p.waitForTimeout(2200);
for (const cse of CASES) {
  await p.evaluate((c0)=>{
    const c=window.__DRILLITY;
    try{c.sim.abortHole('qa');}catch(e){}
    c.state.player.level=60;
    for (const k of Object.keys(c0.loadout)) c.state.garage.loadout[k]=c0.loadout[k];
    const contract={id:'qa-'+c0.id,title:'QA',client:'QA',region:'nordic',regionId:'nordic',method:c0.method,methodId:c0.method,
      applicationId:'site-investigation',target:c0.depth,targetDepth:c0.depth,holeDia:152,holes:1,payout:9000,deadlineHours:24,difficulty:2,requiredCerts:[],seed:7};
    c.state.contract=contract; c.state.world.regionId='nordic';
    try{c.geology?.generateProfile?.({regionId:'nordic',applicationId:'site-investigation',targetDepth:c0.depth,seed:1337,difficulty:2,methodId:c0.method});}catch(e){}
    try{c.rig?.setMethod?.(c0.method);}catch(e){}
    c.ui.show('site',{contract});
    c.sim.setInput('feed',0.55); c.sim.setInput('rotation',0.6); c.sim.setInput('flush',0.6);
  }, cse);
  // Sample coverage across the run and report the WORST (most covered) frame
  // and the steady-state median, because a transient card is not the same as a
  // permanent one.
  const samples=[];
  for (let t=0;t<9000;t+=500){ await p.waitForTimeout(500); samples.push(await p.evaluate(MEASURE)); }
  samples.sort((a,b2)=>a.uncoveredPct-b2.uncoveredPct);
  const worst=samples[0], median=samples[Math.floor(samples.length/2)], best=samples[samples.length-1];
  console.log(`${cse.id}  regions worst/median ${worst.regions}/${median.regions}  3D uncovered worst ${worst.uncoveredPct}% median ${median.uncoveredPct}% best ${best.uncoveredPct}%`);
  console.log('   median regions:', median.list.map(r=>`${r.cls}(${r.w}x${r.h})`).join(' '));
  await p.screenshot({ path:`C:/Users/henri/AppData/Local/Temp/claude/C--Users-henri-Downloads-threads/58b8454d-8bd2-4e3d-8c05-92b4953f6ab5/scratchpad/cover-${TAG}-${cse.id}.png` });
}
await b.close();
