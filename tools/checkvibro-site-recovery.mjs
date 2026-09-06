#!/usr/bin/env node
/** Actual shipping shell/site/garage/menu, real progression and sim; CPU DOM only.
 * Override files are exact full-source proposals, never replacement UI logic.
 * No renderer/preview/audio subsystem is created. Chrome disables GPU and WebGL.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { createServer } from 'vite';
const own = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (key, fallback) => {const i=process.argv.indexOf('--'+key);return i<0?fallback:process.argv[i+1];};
const root = resolve(arg('source-root', own));
const out = resolve(arg('out', '.qa-vibro-recovery/current'));
const width = Number(arg('width',390)), height = Number(arg('height',844));
assert.ok(Number.isInteger(width)&&width>0&&Number.isInteger(height)&&height>0,'Viewport width and height must be positive integers');
const overrides = new Map([
 ['src/ui/screens/site.js',resolve(arg('site-source',root+'/src/ui/screens/site.js'))],
 ['src/game/progression.js',resolve(arg('progression-source',root+'/src/game/progression.js'))],
 ['src/sim/drilling.js',resolve(root,'src/sim/drilling.js')],
 ['src/game/equipment-support.js',resolve(root,'src/game/equipment-support.js')],
]);
if(arg('menu-source',null))overrides.set('src/ui/screens/menu.js',resolve(arg('menu-source')));
const used = new Map();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const source = path => {const bytes=readFileSync(path);used.set(path,hash(bytes));return bytes.toString('utf8');};
const fixture = `
import {createUI} from '/src/ui/shell.js';
import {createGameState,createBus,SCENES,EVENTS} from '/src/core/contract.js';
import * as game from '/src/game/data.js';
import {createProgression} from '/src/game/progression.js';
import {createDrillSim} from '/src/sim/drilling.js';
const impact='impact-hammer-9t',vibro='vibro-hammer-1500';
let f;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function financial(){return JSON.stringify({money:f.state.player.money,contract:f.state.contract,run:f.progression.run,owned:f.state.garage.owned});}
window.setup=async(kind,reduced)=>{
 if(f){f.ui.dispose();f.sim.dispose();f.progression.dispose();}
 localStorage.clear();
 const state=createGameState(),bus=createBus(),ctx={state,bus,game};
 const progression=createProgression(ctx);ctx.progression=progression;await progression.init();
 state.player.level=60;state.player.money=100000;state.player.certs=game.CERTS.map(c=>c.id);
 state.unlocked.methods=game.METHODS.map(m=>m.id);state.unlocked.rigs=game.RIGS.map(r=>r.id);
 state.unlocked.regions=game.REGIONS.map(r=>r.id);state.garage.rigId='piling-leader';
 state.garage.owned=[impact,vibro,'precast-pile-350','dolly-hardwood'];
 state.garage.loadout={hammer:impact,install:'precast-pile-350',dolly:'dolly-hardwood'};
 state.settings.reducedMotion=reduced;state.settings.haptics=false;
 // NOT SOURCED: fixed controlled QA contract, no physical calibration claim.
 const contract={id:'vibro-recovery-'+kind,methodId:'driven-pile',regionId:'german-site',targetDepth:14,holes:1,payout:12000,requiredCerts:[],archetype:'urban-plot',seed:123,title:'Controlled pile recovery',level:1};
 const accepted=progression.acceptContract(contract);if(!accepted.ok)throw Error(accepted.reason);
 if(kind==='drift'){if(!progression.equip('hammer',vibro).ok)throw Error('equip failed');}
 else state.garage.loadout.hammer=vibro;
 progression.save();
 if(kind==='restored'&&!progression.load())throw Error('restore failed');
 const sim=createDrillSim(ctx);ctx.sim=sim;
 let begins=0,starts=0;const begin=progression.beginHole;
 progression.beginHole=(...a)=>{begins++;return begin(...a);};
 bus.on(EVENTS.DRILL_START,()=>starts++);
 const ui=createUI(ctx);await ui.init();ui.resize(innerWidth,innerHeight,devicePixelRatio);
 f={state,bus,progression,sim,ui,get begins(){return begins;},get starts(){return starts;}};
 ui.setLoadingProgress(1);ui.update(1);await pause(650);ui.update(0);
 // Loading reconciles unlocks and can queue its own save. Settle that setup
 // before the start-refusal boundary whose additional writes are under test.
 progression.save();
 f.before=financial();f.beforeSave=JSON.stringify(progression.serialise());
 f.beforeStorage=JSON.stringify({...localStorage});
 // The public production navigation API invokes real shell show and site mount.
 ui.show(SCENES.SITE,{contract:state.contract});
 f.synchronousScene=state.scene;await pause(650);ui.update(0);
 return window.inspect();
};
window.inspect=()=>({scene:f.state.scene,shell:f.ui.currentScene,active:f.sim.active,begins:f.begins,starts:f.starts,
 synchronousScene:f.synchronousScene,financialUnchanged:financial()===f.before,
 contractId:f.state.contract?.id,attemptId:f.progression.run?.attemptId,
 hammer:f.state.garage.loadout.hammer,impactName:game.getItem(impact).name,vibroName:game.getItem(vibro).name,
 money:f.state.player.money,run:structuredClone(f.progression.run),programme:f.sim.getTelemetry()?.programme,
 snapshot:financial(),before:f.before});
window.checkSave=()=>{f.progression.update(2);return {saved:JSON.stringify(f.progression.serialise())===f.beforeSave,storage:JSON.stringify({...localStorage})===f.beforeStorage};};
window.disposeFixture=()=>{if(f){f.ui.dispose();f.sim.dispose();f.progression.dispose();f=null;}};
window.fixtureReady=true;
`;
const fonts=source(resolve(root,'index.html')).split(/\r?\n/).filter(l=>l.includes('<link')&&l.includes('fonts.')).join('\n');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,">${fonts}</head><body><div id="ui"></div><script type="module" src="/vibro-fixture.js"></script></body></html>`;
mkdirSync(out,{recursive:true});
const cases=[],errors=[],network=[];
let server,browser,failure;
const lifecycle={browserClosed:false,serverClosed:false};
try{
 server=await createServer({root,configFile:false,cacheDir:resolve(out,'vite-cache'),
  optimizeDeps:{noDiscovery:true,include:[]},server:{host:'127.0.0.1',port:0,hmr:false,watch:null,fs:{allow:[root,own]}},
  plugins:[{name:'vibro-exact-source-fixture',enforce:'pre',
   configureServer(s){s.middlewares.use((req,res,next)=>{if(req.url?.split('?')[0]==='/vibro-recovery.html'){res.setHeader('Content-Type','text/html');res.end(html);}else next();});},
   resolveId(id){if(id==='/vibro-fixture.js')return '\0vibro-fixture';
    if(id.endsWith('/equipment-support.js')||id==='./equipment-support.js')return '\0vibro-support';},
   load(id){if(id==='\0vibro-fixture')return fixture;
    if(id==='\0vibro-support')return source(overrides.get('src/game/equipment-support.js'));
    const p=id.split('?')[0].replaceAll('\\','/'),prefix=root.replaceAll('\\','/')+'/';
    if(p.startsWith(prefix)&&/\.(js|css)$/.test(p)){const relative=p.slice(prefix.length);return source(overrides.get(relative)||p);}
   },
  }]});
 await server.listen();
 const port=server.httpServer.address().port;
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--disable-webgl','--mute-audio']});
 for(const reduced of [true,false]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('requestfailed',r=>network.push({url:r.url(),error:r.failure()?.errorText}));
  page.on('response',r=>{if(r.status()>=400)network.push({url:r.url(),status:r.status()});});
  await page.goto('http://127.0.0.1:'+port+'/vibro-recovery.html?mute');
  await page.waitForFunction(()=>window.fixtureReady,{timeout:20000});
  for(const kind of ['preaccepted','restored','drift']){
   const result=await page.evaluate(({kind,reduced})=>window.setup(kind,reduced),{kind,reduced});
   const record={kind,reduced,refusal:result};cases.push(record);
   assert.equal(result.synchronousScene,'site','Real shell completes mount before queued navigation');
   assert.equal(result.scene,'garage');assert.equal(result.shell,'garage');
   assert.equal(result.active,false);assert.equal(result.begins,0);assert.equal(result.starts,0);
   assert.equal(result.financialUnchanged,true,'Accepted contract, run, money and owned inventory retained');
   assert.equal(result.hammer,'vibro-hammer-1500');
   const toast=page.locator('.toast--warn').filter({hasText:'Fit a hydraulic impact hammer'});
   await toast.waitFor({state:'visible'});
   record.warning=await toast.evaluate(el=>{const r=el.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(el);const t=range.getBoundingClientRect();return {text:el.innerText,role:el.parentElement.getAttribute('role'),live:el.parentElement.getAttribute('aria-live'),box:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},textBox:{x:t.x,y:t.y,right:t.right,bottom:t.bottom},font:getComputedStyle(el).fontFamily,fontFaces:[...document.fonts].map(f=>({family:f.family,status:f.status}))};});
   assert.equal(record.warning.role,'status');assert.equal(record.warning.live,'polite');
   assert.ok(record.warning.box.x>=0&&record.warning.box.right<=width&&record.warning.box.bottom<=height);
   assert.ok(record.warning.textBox.x>=record.warning.box.x&&record.warning.textBox.right<=record.warning.box.right&&record.warning.textBox.bottom<=record.warning.box.bottom,'Entire actionable warning fits its visible box');
   record.save=await page.evaluate(()=>window.checkSave());assert.deepEqual(record.save,{saved:true,storage:true});
   await page.screenshot({path:resolve(out,kind+'-'+reduced+'-refused.png')});
   // Use the shipping Garage picker and shipping Menu Continue handler.
   await page.locator('.screen--garage .slotcard').filter({hasText:result.vibroName}).click();
   await page.locator('.overlays .slotcard').filter({hasText:result.impactName}).click();
   await page.waitForTimeout(300);
   assert.equal((await page.evaluate(()=>window.inspect())).hammer,'impact-hammer-9t');
   await page.locator('.screen--garage .shead button').first().click();
   const continueButton=page.getByRole('button',{name:'Continue',exact:true});
   assert.equal(await continueButton.locator('.btn__label').innerText(),'Continue','Visible and accessible action agree');
   await continueButton.click();
   await page.waitForTimeout(650);
   record.recovery=await page.evaluate(()=>window.inspect());
   assert.equal(record.recovery.scene,'site','The actual Continue control must return to the retained job');
   assert.equal(record.recovery.active,true);assert.equal(record.recovery.begins,1);assert.equal(record.recovery.starts,1);
   assert.equal(record.recovery.contractId,result.contractId);assert.equal(record.recovery.money,result.money);
   assert.equal(record.recovery.programme.hammerItemId,'impact-hammer-9t');
  }
  await page.evaluate(()=>window.disposeFixture());await context.close();
 }
}catch(e){failure=e.stack||String(e);}
finally{
 if(browser){await browser.close();lifecycle.browserClosed=true;}
 if(server){await server.close();lifecycle.serverClosed=true;}
 const hashes=Object.fromEntries(used);
 for(const [path,before]of used)if(hash(readFileSync(path))!==before)errors.push('Source changed during run: '+path);
 if(errors.length&&!failure)failure='Browser errors: '+JSON.stringify(errors);
 if(network.length&&!failure)failure='Failed resources: '+JSON.stringify(network);
 if(cases.length!==6&&!failure)failure='Incomplete recovery matrix: '+cases.length+'/6';
 const report={scope:'CPU DOM navigation; GPU/WebGL disabled, no renderer or intended-font/AAA claim',viewport:{width,height},cases,hashes,overrides:Object.fromEntries(overrides),errors,network,lifecycle,failure};
 writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({cases:cases.length,failure,lifecycle,network,report:resolve(out,'report.json')},null,2));
 if(failure)process.exitCode=1;
}
