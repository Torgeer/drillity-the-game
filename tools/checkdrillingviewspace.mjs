#!/usr/bin/env node
// CPU DOM proof only. No WebGL, renderer, models, GPU lease or FPS claim.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENUMERATE } from '../.hudqa/enumerate.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2), option=(n,d)=>args.includes(n)?args[args.indexOf(n)+1]:d;
const tag=option('--tag','current'),baseline=option('--baseline','a3fb994'),out=resolve(root,option('--out','shots/drilling-view-space'));
const input01=Number(option('--input01','0.5'));assert(Number.isFinite(input01)&&input01>=0&&input01<=1,'--input01 must be between0 and1');
const hash=b=>createHash('sha256').update(b).digest('hex');
const sourceHashes={},errors=[],requests=[],sourceCache=new Map();
const reachSource=await readFile(resolve(root,'tools/checkreach.mjs'),'utf8');
const reachStart=reachSource.indexOf('const W = 390'),reachEnd=reachSource.indexOf("if (argv.includes('--self-test'))");
assert(reachStart>=0&&reachEnd>reachStart,'Actual reach assessor missing');
const assessReach=new Function(reachSource.slice(reachStart,reachEnd)+';return assessTargets;')();
const source=async path=>{
  const rel=relative(root,path).split(sep).join('/');
  if(sourceCache.has(rel))return sourceCache.get(rel);
  const data=tag==='baseline'&&rel.startsWith('src/')?execFileSync('git',['show',baseline+':'+rel],{cwd:root,maxBuffer:16*1024*1024}):await readFile(path);
  sourceHashes[rel]=hash(data);const text=data.toString('utf8');sourceCache.set(rel,text);return text;
};
const shell=await source(resolve(root,'src/ui/shell.js'));
const extract=(name,next)=>{const a=shell.indexOf('  function '+name+'('),b=shell.indexOf(next,a);assert(a>=0&&b>a,'Missing production '+name);return shell.slice(a,b);};
const close=extract('closeOverlay','  /**');
const confirm=extract('confirm','  /* ── The app facade');
const keyboard=extract('onKey','  /* ── System interface');
const bundle=await build({absWorkingDir:root,tsconfigRaw:{},entryPoints:[resolve(root,'tools/fixtures/drilling-view-space.js')],bundle:true,format:'esm',write:false,outdir:resolve(root,'.unused-fixture-output'),loader:{'.png':'dataurl'},logLevel:'silent',plugins:[{name:'frozen-source-and-real-confirmation',setup(b){
  b.onResolve({filter:/^fixture:confirmation$/},()=>({path:'confirmation',namespace:'fixture'}));
  b.onLoad({filter:/.*/,namespace:'fixture'},()=>({loader:'js',contents:`export function makeConfirmation(C,DUR,dur,overlayEl,getReduced){let overlayStack=[],current=null;const PARENT={};const back=()=>{throw Error('Unexpected fixture back')};let reduced=getReduced();${close}${confirm}${keyboard}window.addEventListener('keydown',onKey);return{confirm(o){reduced=getReduced();return confirm(o)},dispose(){window.removeEventListener('keydown',onKey)}}}`}));
  b.onResolve({filter:/^(data:|https?:)/},a=>({path:a.path,external:true}));
  b.onResolve({filter:/^three$/},()=>({path:resolve(root,'node_modules/three/build/three.module.js'),namespace:'actual-source'}));
  b.onResolve({filter:/^three\//},a=>({path:resolve(root,'node_modules',a.path),namespace:'actual-source'}));
  b.onResolve({filter:/.*/},a=>({path:resolve(a.importer?dirname(a.importer):root,a.path),namespace:'actual-source'}));
  b.onLoad({filter:/.*/,namespace:'actual-source'},async a=>({contents:a.path.endsWith('.png')?await readFile(a.path):await source(a.path),loader:a.path.endsWith('.png')?'dataurl':a.path.endsWith('.css')?'css':'js',resolveDir:dirname(a.path)}));
}}]});
const js=bundle.outputFiles.find(f=>f.path.endsWith('.js')).contents,css=bundle.outputFiles.find(f=>f.path.endsWith('.css')).contents;
await mkdir(out,{recursive:true});
const fontLink=(await readFile(resolve(root,'index.html'),'utf8')).match(/<link[^>]+href="https:\/\/fonts.googleapis.com\/css2[^>]+>/)?.[0]||'';
const server=createServer((req,res)=>{if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}else if(req.url==='/fixture.css'){res.setHeader('Content-Type','text/css');res.end(css);}else if(req.url==='/favicon.ico'){res.writeHead(204);res.end();}else{res.setHeader('Content-Type','text/html');res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">${fontLink}<link rel="stylesheet" href="/fixture.css"><script type="module" src="/fixture.js"></script>`);}});
const report={tag,baseline,head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),evidence:'Actual production site DOM, styles, components and extracted shell confirmation; synthetic telemetry. CPU headless Chrome with GPU/WebGL disabled. DOM opportunity is not actual rendered visible3D. No FPS.',sourceHashes,fixtureHashes:{runner:hash(await readFile(fileURLToPath(import.meta.url))),fixture:hash(await readFile(resolve(root,'tools/fixtures/drilling-view-space.js'))),enumerator:hash(ENUMERATE)},cases:[],errors,requests,failures:[]};
let browser;
const snapshot=()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
 const visible=e=>{for(let p=e;p;p=p.parentElement){const cs=getComputedStyle(p);if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)<.02)return false;}return e.getBoundingClientRect().width>0;};
 const stage=document.querySelector('.ui-stage'),site=document.querySelector('.screen--site'),strip=site.querySelector('.sstrip'),dock=site.querySelector('.sitedock');
 const bands=[...site.querySelectorAll('.siteband')].map(rect),sr=rect(stage),area=bands.reduce((s,r)=>s+r.w*r.h,0);
 const controls=[...site.querySelectorAll('button,input,[role="slider"],[tabindex]')].filter(e=>visible(e)&&getComputedStyle(e).pointerEvents!=='none'&&!e.disabled).map(e=>({...rect(e),class:e.className,label:e.getAttribute('aria-label')||e.textContent.trim(),tag:e.tagName,reach:e.closest('[data-reach]')?.dataset.reach,leave:e.matches('.site__leave'),disabled:e.getAttribute('aria-disabled'),font:getComputedStyle(e).font}));
 const text=[],textClip=[];for(const e of site.querySelectorAll('*')){if(!visible(e))continue;for(const n of e.childNodes){if(n.nodeType!==3||!n.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(n);const cs=getComputedStyle(e),rects=[...r.getClientRects()].map(q=>({x:q.x,y:q.y,w:q.width,h:q.height}));text.push({class:e.className,text:n.textContent.trim(),fontFamily:cs.fontFamily,fontSize:cs.fontSize,fontWeight:cs.fontWeight,lineHeight:cs.lineHeight,rects});for(let p=e;p&&site.contains(p);p=p.parentElement){const ps=getComputedStyle(p),pr=p.getBoundingClientRect();for(const q of rects){const xClips=ps.overflowX!=='visible',yClips=ps.overflowY!=='visible';if(xClips&&(q.x<pr.left-1||q.x+q.w>pr.right+1)||yClips&&(q.y<pr.top-1||q.y+q.h>pr.bottom+1))textClip.push({class:e.className,text:n.textContent.trim(),ancestor:p.className,glyph:q,clip:{x:pr.x,y:pr.y,w:pr.width,h:pr.height}});}}}}
 const textLineOverlap=[];for(const t of text)for(let i=0;i<t.rects.length;i++)for(let j=i+1;j<t.rects.length;j++){const a=t.rects[i],b=t.rects[j];if(Math.abs(a.y-b.y)>1&&Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1)textLineOverlap.push({class:t.class,text:t.text,first:a,second:b});}
 const published={...window.fixture.app.ctx.hud},hudWrites=window.fixture.app.ctx.hudWrites,sliderTracks=[...site.querySelectorAll('.vsl__track')].filter(visible).map(rect),canvases=[...site.querySelectorAll('canvas')].filter(visible).map(c=>({class:c.parentElement.className,css:rect(c),backing:{w:c.width,h:c.height},dpr:window.fixture.app.viewport.dpr}));
 return {viewport:{w:innerWidth,h:innerHeight},stage:sr,strip:rect(strip),dock:rect(dock),bands,published,hudWrites,canvases,domOpportunityStagePct:area/(sr.w*sr.h)*100,domOpportunityViewportPct:area/(innerWidth*innerHeight)*100,controls,sliderTracks,text,textClip,textLineOverlap,cardCells:[...site.querySelectorAll('.ucell')].filter(visible).length,cardVisible:visible(site.querySelector('.unitcard')),fontFaces:[...document.fonts].map(f=>({family:f.family,status:f.status,weight:f.weight})),reduced:matchMedia('(prefers-reduced-motion:reduce)').matches,bodyScroll:{w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}};
};
const fail=(condition,message)=>{if(!condition){report.failures.push(message);console.error('FAIL '+message);}};
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--disable-webgl','--disable-software-rasterizer','--mute-audio']});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push({kind:'page',message:e.message}));page.on('console',m=>{if(m.type()==='error')errors.push({kind:'console',message:m.text()});});page.on('requestfailed',r=>requests.push({url:r.url(),failure:r.failure()}));
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;window.webglAttempts=[];HTMLCanvasElement.prototype.getContext=function(type,...rest){if(/webgl/i.test(type)){window.webglAttempts.push(type);throw Error('DOM fixture forbids WebGL');}return original.call(this,type,...rest);};});
 await page.goto(`http://127.0.0.1:${server.address().port}/?shot&mute`,{waitUntil:'networkidle',timeout:60000});await page.waitForFunction(()=>window.fixture,{timeout:30000});await page.evaluate(()=>document.fonts.ready);
 const families=(await page.evaluate(()=>window.fixture.cases.map(c=>c[0]))).filter(f=>!args.includes('--smoke')||['rotary','cable','rc','bolt','pile','cpt','oil','jet'].includes(f)).filter(f=>!args.includes('--families')||option('--families','').split(',').includes(f));
 const cards=await page.evaluate(()=>window.fixture.cardFamilies);
 const beatFamilies={rotary:['tripping-out','tripping-in','bit-swap','casing-run','rod-add'],jumbo:['boom-setup','charging','firing','mucking','misfire','trim-blast'],longhole:['ring-index','redrill'],bolt:['bolt-install','bolt-plate','bolt-torque','bolt-ream','bolt-inspect'],pile:['pitch','take-set','dolly-change','re-drive'],spt:['spt-drive','clean-out'],cpt:['dissipation'],rc:['blow-down'],cable:['bail','bailing-run'],twoStage:['cutter-change']};
 const actionFamilies={rotary:['idle','rod','jam','kick','casing','trip'],cable:['bail'],jumbo:['beat'],spt:['release']};
 if(args.includes('--supplementary')){
  const siteSource=await source(resolve(root,'src/ui/screens/site.js')),start=siteSource.indexOf('const BEAT_COPY = '),end=siteSource.indexOf('\n};',start);
  assert(start>=0&&end>start,'Production beat vocabulary missing');const actual=new Function('return ('+siteSource.slice(start+'const BEAT_COPY = '.length,end+2)+');')();
  assert.deepEqual(Object.values(beatFamilies).flat().sort(),Object.keys(actual).sort(),'Supplementary states must cover every actual BEAT_COPY key');
  const actualActions=await page.evaluate(()=>Object.keys(window.fixture.actionLabels));assert.deepEqual(Object.values(actionFamilies).flat().sort(),actualActions.sort(),'Supplementary states must cover every actual SITE_ACTIONS key');
 }
 const viewports=args.includes('--viewports')?option('--viewports','').split(',').map(s=>s.split('x').map(Number)):args.includes('--quick')||args.includes('--smoke')?[[390,844],[320,568]]:[[320,568],[390,844],[390,664],[280,653],[360,640],[393,852],[430,932],[375,667],[320,844]];
 const modesFor=family=>(args.includes('--supplementary')?[...(beatFamilies[family]||[]).map(k=>'beat:'+k),...(actionFamilies[family]||[]).map(k=>'action:'+k),...(family==='oil'?['well:gaining','well:losing']:[]),...(family==='bolt'?['beat-friction:bolt-install']:[])]:['steady',...(cards.includes(family)?['card']:[]),...(family==='bolt'?['beat']:[]),...(family==='rotary'?['beat:rod-add','beat:tripping-out','beat:tripping-in','beat:bit-swap','beat:casing-run']:[]),...(family==='cable'?['beat:bailing-run']:[]),...(family==='percussive'?['hazard']:[])]).filter(m=>!args.includes('--only-modes')||option('--only-modes','').split(',').includes(m));
 for(const [width,height] of viewports){await page.setViewportSize({width,height});for(const reduced of [false,true]){await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});for(const family of families){for(const mode of modesFor(family)){
  const name=`${width}x${height}-${reduced?'reduced':'normal'}-${family}-${mode.replaceAll(':','-')}`;
  const subject=await page.evaluate(([f,m,r,input01])=>window.fixture.mount(f,m,r,{input01}),[family,mode,reduced,input01]);
  const measurement=await page.evaluate(`(${ENUMERATE})({})`),geometry=await page.evaluate(snapshot);
  const row={name,subject,measurement,geometry};report.cases.push(row);
  if(width===390&&height===844){row.reach=assessReach(geometry.controls.map(c=>({...c,cls:c.class,isLeave:c.leave})));for(const failure of row.reach.failures)fail(false,`${name}: existing checkreach ${failure}`);}
  fail(measurement.painted>20&&measurement.targets>=3,`${name}: empty/incomplete subject`);
  fail(measurement.overlaps===0,`${name}: overlaps ${measurement.overlapList.join('; ')}`);
  fail(measurement.clipped.length===0,`${name}: clipped ${measurement.clipped.join('; ')}`);
  fail(geometry.textClip.length===0,`${name}: glyph clipping ${[...new Set(geometry.textClip.map(c=>c.class+' in '+c.ancestor+' '+c.text))].join('; ')}`);
  fail(geometry.textLineOverlap.length===0,`${name}: same-text line boxes overlap ${JSON.stringify(geometry.textLineOverlap)}`);
  fail(measurement.onBand3D.length===0,`${name}: painted UI on scene spacers ${measurement.onBand3D.join('; ')}`);
  fail(measurement.smallTargets.length===0,`${name}: inaccessible ${measurement.smallTargets.join('; ')}`);
  fail(geometry.controls.every(c=>c.w>=44&&c.h>=44),`${name}: native target below44 ${geometry.controls.filter(c=>c.w<44||c.h<44).map(c=>c.class+' '+c.w+'x'+c.h).join('; ')}`);
  fail(geometry.sliderTracks.length===3&&geometry.sliderTracks.every(t=>t.w>=44&&t.h>=44),`${name}: actual slider pointer track below44`);
  const mismatchedCanvases=geometry.canvases.filter(c=>Math.abs(c.backing.w-c.css.w*c.dpr)>1||Math.abs(c.backing.h-c.css.h*c.dpr)>1);
  fail(mismatchedCanvases.length===0,`${name}: 2D canvas backing differs from actual CSS/DPR ${JSON.stringify(mismatchedCanvases)}`);
  fail(geometry.controls.filter(c=>c.leave&&c.tag==='BUTTON'&&c.reach==='drilling').length===1,`${name}: required leave missing/disabled/exempted`);
  fail(Math.abs(geometry.published.top-geometry.strip.h)<1&&Math.abs(geometry.published.bottom-geometry.dock.h)<1,`${name}: published chrome differs`);
  if(mode==='card')fail(geometry.cardVisible&&geometry.cardCells===({rc:4,jumbo:4,longhole:4,bolt:3,pile:4,cpt:4,spt:4,twoStage:3})[family],`${name}: expected three/four-cell card missing`);
  if(mode.startsWith('action:'))fail(await page.evaluate(k=>document.querySelector('.actionbtn__l').textContent===window.fixture.actionLabels[k],mode.slice(7)),`${name}: expected primary action absent`);
  if(subject.actions&&mode!=='card')fail(geometry.controls.filter(c=>c.class.includes('railbtn')).length===subject.actions,`${name}: actions missing`);
  if((mode==='steady'||mode.startsWith('action:'))&&[320,390].includes(width)&&['rotary','bolt','oil','cpt'].includes(family)){
   row.held=[];const buttons=page.locator('.screen--site button:visible');
   for(let i=0;i<await buttons.count();i++){const button=buttons.nth(i),before=await button.boundingBox();await button.dispatchEvent('pointerdown',{pointerId:91,clientX:before.x+before.width/2,clientY:before.y+before.height/2});await page.waitForTimeout(45);const held=await button.boundingBox(),probe=await page.evaluate(`(${ENUMERATE})({})`);row.held.push({before,held,overlaps:probe.overlapList});fail(held.width>=44&&held.height>=44&&Math.abs(held.width-before.width)<.01&&Math.abs(held.height-before.height)<.01,`${name}: pressed native bounds changed`);fail(probe.overlaps===0,`${name}: pressed overlap ${probe.overlapList.join('; ')}`);await button.dispatchEvent('pointercancel',{pointerId:91});}
  }
  if([280,320,375,390].includes(width)&&!reduced&&['rotary','cable','rc','bolt','pile','oil','cpt','twoStage','longhole','jet'].includes(family))await page.screenshot({path:resolve(out,tag+'-'+name+'.png')});
 }
 }console.log(tag,width+'x'+height,reduced?'reduced':'normal','cases='+report.cases.length,'failures='+report.failures.length);}}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.fixture.mount('rotary','steady',false));
 const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const dom=await cdp.send('DOM.getDocument');
 report.resolvedFonts=[];for(const selector of ['.sstrip__v','.vsl__name','.rop__v']){const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:dom.root.nodeId,selector});report.resolvedFonts.push({selector,...await cdp.send('CSS.getPlatformFontsForNode',{nodeId})});}
 const initial=await page.evaluate(()=>structuredClone(window.fixture.effects));
 await page.locator('.site__leave').click();await page.getByRole('alertdialog',{name:'Leave the hole?'}).waitFor();await page.waitForTimeout(50);
 report.confirmation={initial,defaultFocus:await page.evaluate(()=>document.activeElement.textContent.trim()),pending:await page.evaluate(()=>structuredClone(window.fixture.effects))};
 await page.keyboard.press('Escape');await page.waitForTimeout(450);report.confirmation.escape=await page.evaluate(()=>({effects:structuredClone(window.fixture.effects),focus:document.activeElement.className,scene:window.fixture.app.state.scene}));
 await page.locator('.site__leave').click();await page.getByRole('button',{name:'Keep drilling',exact:true}).click();await page.waitForTimeout(450);report.confirmation.cancel=await page.evaluate(()=>({effects:structuredClone(window.fixture.effects),scene:window.fixture.app.state.scene}));
 await page.locator('.site__leave').click();await page.getByRole('button',{name:'Abandon',exact:true}).click();await page.waitForTimeout(450);report.confirmation.abandon=await page.evaluate(()=>({effects:structuredClone(window.fixture.effects),scene:window.fixture.app.state.scene}));
 fail(report.confirmation.defaultFocus==='Keep drilling','confirmation default focus');fail(report.confirmation.escape.effects.aborts.length===0&&report.confirmation.cancel.effects.aborts.length===0,'cancel/Escape aborted');fail(report.confirmation.abandon.effects.aborts.length===1&&report.confirmation.abandon.scene==='contracts','confirm did not abort exactly once');
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>window.fixture.mount('rotary','steady',true));
 await page.locator('.site__leave').click();await page.getByRole('alertdialog',{name:'Leave the hole?'}).waitFor();await page.waitForTimeout(50);
 report.reducedConfirmation={defaultFocus:await page.evaluate(()=>document.activeElement.textContent.trim())};await page.keyboard.press('Escape');await page.waitForTimeout(100);report.reducedConfirmation.escape=await page.evaluate(()=>({focus:document.activeElement.className,scene:window.fixture.app.state.scene,aborts:window.fixture.effects.aborts.length}));
 await page.locator('.site__leave').click();await page.getByRole('button',{name:'Keep drilling',exact:true}).click();await page.waitForTimeout(100);report.reducedConfirmation.cancel=await page.evaluate(()=>({scene:window.fixture.app.state.scene,aborts:window.fixture.effects.aborts.length}));
 await page.locator('.site__leave').click();await page.getByRole('button',{name:'Abandon',exact:true}).click();await page.waitForTimeout(100);report.reducedConfirmation.abandon=await page.evaluate(()=>({scene:window.fixture.app.state.scene,aborts:window.fixture.effects.aborts.length}));
 fail(report.reducedConfirmation.defaultFocus==='Keep drilling'&&report.reducedConfirmation.escape.scene==='site'&&report.reducedConfirmation.escape.aborts===1&&report.reducedConfirmation.cancel.aborts===1&&report.reducedConfirmation.abandon.aborts===2&&report.reducedConfirmation.abandon.scene==='contracts','Reduced confirmation behavior');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>{document.documentElement.style.setProperty('--sa-t','47px');document.documentElement.style.setProperty('--sa-b','34px');});await page.evaluate(()=>window.fixture.mount('rc','steady',false));
 report.safeArea={injected:{top:47,bottom:34},geometry:await page.evaluate(snapshot),measurement:await page.evaluate(`(${ENUMERATE})({})`)};
 report.safeArea.reach=assessReach(report.safeArea.geometry.controls.map(c=>({...c,cls:c.class,isLeave:c.leave})));
 const safeLeave=report.safeArea.geometry.controls.find(c=>c.leave);fail(safeLeave&&safeLeave.y+safeLeave.h<=844-34,'Leave overlaps safe area');fail(report.safeArea.measurement.overlaps===0&&report.safeArea.measurement.clipped.length===0&&report.safeArea.measurement.smallTargets.length===0,'Safe area layout');fail(report.safeArea.geometry.controls.every(c=>c.w>=44&&c.h>=44),'Safe area native targets');fail(report.safeArea.reach.failures.length===0,'Safe area reach');fail(Math.abs(report.safeArea.geometry.published.bottom-report.safeArea.geometry.dock.h)<1,'Safe area chrome mismatch');
 await page.evaluate(()=>{document.documentElement.style.removeProperty('--sa-t');document.documentElement.style.removeProperty('--sa-b');});
 report.delayedTelemetry=[];
 for(const family of ['rotary','twoStage'])for(const reduced of [false,true]){await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});await page.evaluate(([family,reduced])=>window.fixture.mount(family,'steady',reduced,{delayedTelemetry:true,noExplicitResize:true}),[family,reduced]);const geometry=await page.evaluate(snapshot);report.delayedTelemetry.push({family,reduced,geometry});fail(geometry.canvases.every(c=>Math.abs(c.backing.w-c.css.w*c.dpr)<=1&&Math.abs(c.backing.h-c.css.h*c.dpr)<=1),`${family}/${reduced}: delayed-telemetry canvas backing mismatch`);fail(Math.abs(geometry.published.bottom-geometry.dock.h)<1,`${family}/${reduced}: delayed-telemetry published chrome mismatch`);}
 report.webglAttempts=await page.evaluate(()=>window.webglAttempts);fail(report.webglAttempts.length===0,'WebGL attempted');fail(errors.length===0,'Browser errors');fail(families.length>0&&report.cases.length>0&&report.cases.length===viewports.length*2*families.reduce((s,f)=>s+modesFor(f).length,0),'Incomplete/empty case matrix');
 report.intendedFontsLoaded=report.resolvedFonts.some(r=>r.fonts.some(f=>f.familyName==='Inter'));
 fail(report.intendedFontsLoaded,'Intended Inter font not proved; fallback-only layout evidence');
 report.passed=report.failures.length===0;report.summary={cases:report.cases.length,failures:report.failures.length,overlaps:report.cases.reduce((s,c)=>s+c.measurement.overlaps,0),horizontalClips:report.cases.reduce((s,c)=>s+c.measurement.clipped.length,0),glyphClips:report.cases.reduce((s,c)=>s+c.geometry.textClip.length,0),smallTargets:report.cases.reduce((s,c)=>s+c.measurement.smallTargets.length,0),stageOpportunityPct:[Math.min(...report.cases.map(c=>c.geometry.domOpportunityStagePct)),Math.max(...report.cases.map(c=>c.geometry.domOpportunityStagePct))],viewportOpportunityPct:[Math.min(...report.cases.map(c=>c.geometry.domOpportunityViewportPct)),Math.max(...report.cases.map(c=>c.geometry.domOpportunityViewportPct))]};
 console.log(JSON.stringify(report.summary));
}catch(e){report.fatal=String(e.stack||e);report.passed=false;console.error(e);}finally{await browser?.close();if(server.listening)await new Promise(r=>server.close(r));await writeFile(resolve(out,tag+'.json.tmp'),JSON.stringify(report,null,2));await rename(resolve(out,tag+'.json.tmp'),resolve(out,tag+'.json'));}
if(!report.passed)process.exitCode=1;
