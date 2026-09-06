#!/usr/bin/env node
// Actual site screen/components/styles + real simulation. No WebGL scene is
// initialized: this verifies HUD layout, not whole-game renderer performance.
// Requires the serialized headed-browser lease. Never launches while queued.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { createServer } from 'vite';
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i < 0 ? fallback : process.argv[i + 1];
};
const leasePath = resolve(arg('lease-file', '../drillity-coordination/gpu-owner.txt'));
const owner = arg('lease', 'progression-reliability');
const prepareOnly=process.argv.includes('--prepare-only');
if(!prepareOnly)assert.equal(readFileSync(leasePath, 'utf8').trim(), owner,
  'Headed browser is queued; obtain the shared lease before running');
const out = resolve(arg('out', '.qa-domain-followup/browser'));
const port = Number(arg('port', '5197'));
const inputPaths=['src/ui/screens/site.js','src/ui/styles.css','src/ui/components.js',
  'src/sim/drilling.js','src/game/data.js','src/core/contract.js'];
const inputHashes=()=>Object.fromEntries(inputPaths.map(path=>[path,createHash('sha256').update(readFileSync(resolve(path))).digest('hex')]));
const sourceBefore=inputHashes();
mkdirSync(out, { recursive: true });
const fixture = resolve('.qa-domain-followup/rockbolt-ui.html');
mkdirSync(resolve('.qa-domain-followup'), { recursive: true });
writeFileSync(fixture, `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap">
<title>Rockbolt HUD verification</title></head><body>
<div id="app"><div id="ui"><div class="ui-root"><div class="ui-stage is-site"><div class="screens" id="screen"></div></div></div></div></div>
<script type="module">
import '/src/ui/styles.css';
import * as C from '/src/ui/components.js';
import { createSiteScreen } from '/src/ui/screens/site.js';
import { createGameState,createBus } from '/src/core/contract.js';
import { createDrillSim } from '/src/sim/drilling.js';
let screen,sim;
window.renderRockbolt = (name,reduced) => {
  if(screen){screen.unmount();screen.destroy();sim.dispose();}
  const cases={supported:['bolt-bit-38','friction-bolt-39'],undersize:['bolt-bit-33','friction-bolt-39'],oversize:['bolt-bit-39','friction-bolt-39'],unknown:['bolt-bit-38','unknown-friction-bolt'],larger:['bolt-bit-38','friction-bolt-46'],resin:['bolt-bit-38','rebar-bolt-20']};
  const [bit,install]=cases[name];
  const state=createGameState(),bus=createBus();
  state.garage.loadout={bit,install};
  const ground={id:'granite',name:'Controlled rock',ucs:100,stability:1,abrasivity:0,water:0,top:0,bottom:100};
  const contract={id:'ui-bolt-'+name,methodId:'rockbolt',targetDepth:1,regionId:'nordic',seed:194,flushMedium:'water'};
  state.contract=contract; state.world.strata=[ground]; state.world.contractId=contract.id;
  sim=createDrillSim({state,bus,geology:{strata:[ground],getDrillabilityAt:()=>ground}});
  sim.startHole(contract);sim.debug.godMode=true;
  const app={C,state,bus,ctx:{state,bus,sim},fmtMoney:v=>'€'+Math.round(v),haptic(){},nav(){},confirm:async()=>false,strataFor:()=>[ground],viewport:{w:innerWidth,h:innerHeight,dpr:devicePixelRatio},reducedMotion:reduced};
  screen=createSiteScreen(app);screen.el.classList.add('screen','screen--site');
  document.querySelector('.ui-root').classList.toggle('reduced-motion',reduced);
  document.querySelector('#screen').replaceChildren(screen.el);
  screen.mount({contract});screen.resize();screen.update(0);
  let done=false;
  for(let i=0;i<24000;i++){
    const t=sim.getTelemetry(),stage=t.programme.installStage;
    sim.setInput('feed',.38);sim.setInput('rotation',stage==='gel'||stage==='hold'?0:.8);sim.setInput('flush',.66);
    const before=sim.getTelemetry().timeSec;
    sim.debug.stepFixed(1);
    // The real site observes unit boundaries at 8 Hz. Zero-dt paints never
    // reach that observer. Advance its clock from the actual simulation clock.
    screen.update(Math.max(0,sim.getTelemetry().timeSec-before));
    if(sim.getTelemetry().programme.installs.length){done=true;break;}
  }
  if(!done)throw Error('No real installation completed: '+name);
  // Keep the completed real installation frozen, but allow the ordinary UI
  // observer to cross its next scheduled paint boundary before capturing.
  for(let i=0;i<9;i++)screen.update(1/60);
  screen.resize();
  return sim.getTelemetry().programme;
};
window.fixtureReady=true;
</script></body></html>`);
const { default: config } = await import(pathToFileURL(resolve('vite.config.js')));
const server = await createServer({ ...config, configFile:false, root:process.cwd(),
  cacheDir:resolve('.qa-domain-followup/vite-cache'), optimizeDeps:{noDiscovery:true,include:[]},
  server:{host:'127.0.0.1',port,strictPort:true,hmr:false,watch:null} });
let browser,activePage,currentCase;
const cases=[];
const errors=[];
const assertionFailures=[];
const captionCoverage=[];
// Read every literal outcome label from the actual family table. These extra
// specimens check the shared caption CSS, not simulated outcomes in those jobs.
const siteSource=readFileSync(resolve('src/ui/screens/site.js'),'utf8');
const outcomeLabels=[...new Set([...siteSource.slice(siteSource.indexOf('const UNIT_VIEWS ='),
  siteSource.indexOf('const BEAT_COPY =')).matchAll(/\['([^']+)',/g)].map(m=>m[1]))];
const lifecycle={browserClosed:false,serverClosed:false};
let failure=null;
try {
  await server.listen();
  if(prepareOnly){
    for(const path of ['/src/ui/screens/site.js','/src/ui/components.js','/src/ui/styles.css','/src/sim/drilling.js']){
      const transformed=await server.transformRequest(path);
      assert.ok(transformed?.code?.length,`${path} must compile through the real Vite config`);
    }
    console.log('PASS browser fixture source preparation; no browser launched and no visual verdict');
  }else{
  browser=await chromium.launch({headless:false,channel:'chrome',args:['--mute-audio']});
  for(const [width,height] of [[320,640],[390,844],[430,932]]) {
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const page=await context.newPage();activePage=page;
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    page.on('requestfailed',r=>errors.push(`${r.failure()?.errorText} ${r.url()}`));
    await page.goto(`http://127.0.0.1:${port}/.qa-domain-followup/rockbolt-ui.html`);
    await page.waitForFunction(()=>window.fixtureReady===true);
    const fonts=await page.evaluate(async()=>{
      const inter=await document.fonts.load('500 16px Inter');
      const oswald=await document.fonts.load('600 16px Oswald');
      await document.fonts.ready;
      return {inter:inter.length,oswald:oswald.length};
    });
    assert.ok(fonts.inter>0&&fonts.oswald>0,'Actual Inter/Oswald fonts must load');
    for(const name of ['supported','undersize','oversize','unknown','larger','resin']) {
      currentCase={width,height,name};
      const reduced=name==='resin';
      await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
      const programme=await page.evaluate(({name,reduced})=>window.renderRockbolt(name,reduced),{name,reduced});
      await page.waitForTimeout(650); // let the existing authored card motion settle
      const measurement=await page.evaluate(()=>{
        const card=document.querySelector('.unitcard');
        const visible=el=>!!(el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
        const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
        const texts=[...card.querySelectorAll('*')].filter(el=>visible(el)&&!el.children.length&&el.textContent.trim());
        const clipped=texts.filter(el=>{
          if(el.scrollWidth>el.clientWidth+1&&el.clientWidth>0)return true;
          const range=document.createRange();range.selectNodeContents(el);
          const text=range.getBoundingClientRect(),b=el.getBoundingClientRect();
          return text.right>b.right+1||text.bottom>b.bottom+1||text.left<b.left-1||text.top<b.top-1;
        }).map(el=>{const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();
          return {text:el.textContent,box:rect(el),textBox:{x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height},
            scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,lineHeight:getComputedStyle(el).lineHeight};});
        const controls=[...document.querySelectorAll('.site button,.site input[type="range"],.site [role="slider"]')].filter(visible).map(el=>({tag:el.tagName,label:el.getAttribute('aria-label')||el.textContent,box:rect(el)}));
        const overlaps=[];
        for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
          const a=rect(texts[i]),b=rect(texts[j]);
          if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>.5)
            overlaps.push([texts[i].textContent,texts[j].textContent]);
        }
        return {visible:visible(card),text:card.innerText,box:rect(card),clipped,overlaps,controls,
          rowCount:card.querySelectorAll('.ucell:not([hidden])').length,
          horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1};
      });
      currentCase={...currentCase,measurement};
      try {
      assert.equal(measurement.visible,true,`${name}: unit card must actually render`);
      assert.ok(measurement.text.trim().length>0);
      assert.equal(measurement.horizontalOverflow,false);
      assert.deepEqual(measurement.clipped,[],`${width}/${name}: clipped real-font text`);
      assert.deepEqual(measurement.overlaps,[],`${width}/${name}: overlapping card text`);
      assert.equal(measurement.rowCount,name==='resin'?2:3,'Measure every rendered outcome row');
      assert.ok(measurement.box.x>=-1&&measurement.box.right<=width+1&&measurement.box.bottom<=height+1);
      assert.ok(measurement.controls.length>=4,'Real native controls must be present');
      for(const c of measurement.controls)assert.ok(c.box.width>=43.9&&c.box.height>=43.9,JSON.stringify(c));
      const occupants=[{label:'unitcard',box:measurement.box},...measurement.controls];
      for(let i=0;i<occupants.length;i++)for(let j=i+1;j<occupants.length;j++){
        const a=occupants[i].box,b=occupants[j].box;
        assert.ok(Math.min(a.right,b.right)-Math.max(a.x,b.x)<=.5||
          Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)<=.5,
        `${width}/${name}: ${occupants[i].label} overlaps ${occupants[j].label}`);
      }
      assert.ok(!/Anchorage\s*\n\s*\d+%|Hole vs ideal|full contact|statutory/i.test(measurement.text),measurement.text);
      }catch(error){assertionFailures.push({width,height,name,message:error.message,measurement});}
      cases.push({width,height,name,reduced,fonts,programme:{length:programme.boltLengthM,fit:programme.diameterFit},...measurement});
      const geometry=()=>({width:innerWidth,clientWidth:document.documentElement.clientWidth,
        visualWidth:visualViewport.width,scrollWidth:document.documentElement.scrollWidth,
        boxes:[...document.querySelectorAll('.unitcard,.site button,.site input[type="range"],.site [role="slider"]')].map(el=>{
          const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})});
      const before=await page.evaluate(geometry);
      const bytes=await page.screenshot({path:resolve(out,`${width}-${name}.png`),fullPage:true});
      const after=await page.evaluate(geometry);
      assert.equal(bytes.readUInt32BE(16),width,'PNG must retain intended mobile width');
      assert.equal(bytes.readUInt32BE(20),height,'PNG must retain intended mobile height');
      assert.deepEqual(after,before,'Screenshot must not reflow the measured layout');
      for(const m of [before,after]){
        assert.equal(m.width,width);assert.equal(m.clientWidth,width);assert.equal(m.visualWidth,width);
        assert.ok(m.scrollWidth<=width);
      }
      cases.at(-1).capture={before,after,png:{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}};
      cases.at(-1).validated=!assertionFailures.some(f=>f.width===width&&f.name===name);
    }
    const captions=await page.evaluate(labels=>{
      const rows=document.querySelector('.unitcard__rows'),card=document.querySelector('.unitcard');
      const original=[...rows.children].map(el=>el.cloneNode(true));
      const results=[];
      for(const label of labels){
        rows.replaceChildren(...original.map(el=>el.cloneNode(true)));
        const cells=[...rows.children];
        // Match the existing four-column unit card allocation. Only caption
        // vertical containment is changed globally; horizontal truncation is
        // retained as a separately reported pre-existing limitation.
        for(const cell of cells){cell.hidden=false;cell.querySelector('.ucell__k').textContent=label;cell.querySelector('.ucell__v').textContent='100%';}
        const el=cells[0].querySelector('.ucell__k'),value=cells[0].querySelector('.ucell__v');
        const range=document.createRange();range.selectNodeContents(el);
        const b=el.getBoundingClientRect(),t=range.getBoundingClientRect(),v=value.getBoundingClientRect(),c=card.getBoundingClientRect();
        results.push({label,lineHeight:b.height,textHeight:t.height,topOverrun:b.top-t.top,
          bottomOverrun:t.bottom-b.bottom,valueOverlap:t.bottom-v.top,
          horizontalTruncation:el.scrollWidth>el.clientWidth+1,cardContained:b.top>=c.top&&v.bottom<=c.bottom,
          flexBasis:getComputedStyle(cells[0]).flexBasis});
      }
      rows.replaceChildren(...original);
      return results;
    },outcomeLabels);
    captionCoverage.push({width,labels:captions});
    assert.ok(captions.length>=20,'Must cover actual labels across all unit families');
    for(const c of captions){assert.ok(c.topOverrun<=1&&c.bottomOverrun<=1&&c.valueOverlap<=0&&c.cardContained,JSON.stringify(c));assert.equal(c.flexBasis,'0px','Four-column allocation must remain unchanged');}
    assert.deepEqual(errors,[],'No actual screen runtime errors');
    await context.close();
  }
  assert.equal(assertionFailures.length,0,'Every measured case must pass; inspect report assertionFailures');
  assert.deepEqual(inputHashes(),sourceBefore,'Measured product source must remain unchanged during the gate');
  console.log(`PASS ${cases.length} actual-font rockbolt HUD cases; report ${out}`);
  }
} catch(error) {
  failure={message:error.message,stack:error.stack,currentCase};
  if(activePage&&!activePage.isClosed()){
    await activePage.screenshot({path:resolve(out,'failure.png'),fullPage:true}).catch(e=>{failure.captureError=e.message;});
    writeFileSync(resolve(out,'failure.html'),await activePage.content());
  }
  throw error;
} finally {
  try {await browser?.close();lifecycle.browserClosed=!browser||!browser.isConnected();}
  finally {
    await server.close();lifecycle.serverClosed=!server.httpServer?.listening;
    writeFileSync(resolve(out,'report.json'),JSON.stringify({passed:cases.filter(c=>c.validated).length,measured:cases.length,cases,captionCoverage,assertionFailures,errors,failure,lifecycle,sourceBefore,sourceAfter:inputHashes()},null,2));
  }
}
