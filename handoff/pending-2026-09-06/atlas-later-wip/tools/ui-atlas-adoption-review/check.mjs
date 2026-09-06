import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const directory = new URL('./evidence/', import.meta.url);
const url = 'http://127.0.0.1:5201/menu-review/';
const ownerFile = 'C:/Users/henri/Downloads/threads/drillity-coordination/gpu-owner.txt';
assert.equal((await readFile(ownerFile, 'utf8')).trim(), 'ui-atlas-adoption', 'Exact shared GPU lease required');
await mkdir(directory, { recursive:true });
const manifest = JSON.parse(await readFile(new URL('../../public/ui/blender/manifest.json', import.meta.url), 'utf8'));
const report = { evidence:'Actual production menu and shell DOM only. No renderer, GLB, FPS, whole-game or general accessibility verdict.', cases:[], checks:[], errors:[], browserClosed:false };
report.builtInputs=JSON.parse(await readFile(new URL('./dist/source-inputs.json',import.meta.url),'utf8'));
function check(condition, name, detail) { report.checks.push({name, pass:!!condition, detail}); if (!condition) console.log('FAIL ' + name + ' ' + JSON.stringify(detail)); }
function equalRect(a, b) { return ['width','height'].every(key => Math.abs(a[key] - b[key]) < .2); }
const browser = await chromium.launch({channel:'chrome',headless:false,args:['--mute-audio']});
async function newPage(width=390,height=844,dpr=1,assetMode=null) {
  const context = await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,isMobile:true,hasTouch:true});
  const page = await context.newPage();
  const requests=[]; const localErrors=[];
  page.on('pageerror', e => { localErrors.push(e.message); report.errors.push(e.message); });
  page.on('request', r => { if (r.url().includes('/ui/blender/')) requests.push(r.url()); });
  let release, reached;
  const seen = new Promise(resolve => { reached=resolve; });
  if (assetMode) {
    const image = assetMode.includes('image');
    const target = image ? '**/ui/blender/*.png' : '**/ui/blender/manifest.json';
    await context.route(target, async route => {
      reached();
      if (assetMode.startsWith('delayed')) { await new Promise(resolve => { release=resolve; }); await route.continue(); }
      else if (assetMode.startsWith('missing')) await route.fulfill({status:404,body:'review intentional missing asset'});
      else await route.fulfill({status:200,contentType:image?'image/png':'application/json',body:image?'not a PNG':'{"schemaVersion":42,"sprites":[]}'});
    });
  }
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.review && document.querySelector('.menu:not([hidden])'));
  await page.waitForFunction(() => !document.querySelector('.menu').classList.contains('is-entering'));
  return {context,page,requests,localErrors,seen,release:()=>release?.()};
}
async function settle(page) { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(250); }
async function measurements(page, scope) {
  return page.evaluate(({manifest,scope}) => {
    const root = document.querySelector(scope);
    const rect = element => { const r=element.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}; };
    const controls=[...root.querySelectorAll('[data-bui-button]')].map(button => {
      const bounds=rect(button); const label=button.querySelector('.bui-button__label'); const labelBounds=rect(label);
      const style=getComputedStyle(button), face=getComputedStyle(button,'::before');
      const atlasRoot=button.closest('[data-blender-ui]');
      const size=button.dataset.buiSize;
      const id='button-' + (size==='compact'?'compact-':'') + button.dataset.buiButton;
      const sprite=manifest.sprites.find(s=>s.id===id);
      const fallback=button.classList.contains('bui-text-fit-fallback');
      const safe=sprite?{x:bounds.x+sprite.safeText.x,y:bounds.y+sprite.safeText.y,width:sprite.safeText.width,height:sprite.safeText.height}:null;
      const range=document.createRange(); range.selectNodeContents(label); const ink=range.getBoundingClientRect();
      return {text:button.textContent.trim(),class:button.className,rect:bounds,label:labelBounds,ink:{x:ink.x,y:ink.y,width:ink.width,height:ink.height},safe,native:sprite?.native,fallback,ready:atlasRoot?.dataset.atlasReady,density:atlasRoot?.dataset.atlasDensity,disabled:button.disabled,pressed:button.getAttribute('aria-pressed'),font:style.font,fontLoaded:document.fonts.check('600 13px Inter'),face:{display:face.display,image:face.backgroundImage,size:face.backgroundSize,position:face.backgroundPosition,width:face.width,height:face.height},outline:style.outline,transition:getComputedStyle(label).transitionDuration,transform:getComputedStyle(label).transform,labelClipped:label.scrollWidth>label.clientWidth+1,scrollWidth:button.scrollWidth,clientWidth:button.clientWidth};
    });
    const overlaps=[];
    for(let i=0;i<controls.length;i++) for(let j=i+1;j<controls.length;j++) {
      const a=controls[i].rect,b=controls[j].rect;
      if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>.5)overlaps.push([controls[i].text,controls[j].text]);
    }
    const menuSections=scope==='.menu'?[...root.querySelectorAll('.menu__hero,.pcard,.menu__nav,.menu__ver')].map(el=>({class:el.className,...rect(el)})):[];
    const sectionOverlaps=[];
    for(let i=0;i<menuSections.length;i++)for(let j=i+1;j<menuSections.length;j++) {
      const a=menuSections[i],b=menuSections[j];
      if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>.5)sectionOverlaps.push([a.class,b.class]);
    }
    return {scope,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},root:rect(root),controls,overlaps,menuSections,sectionOverlaps,documentOverflow:document.documentElement.scrollWidth>innerWidth+1};
  },{manifest,scope});
}
async function capture(page,name,scope) {
  const measurement=await measurements(page,scope);
  await page.screenshot({path:fileURLToPath(new URL(name+'.png',directory))});
  report.cases.push({name,...measurement});
  check(measurement.controls.length>0,name+' measures real adopted controls');
  check(!measurement.overlaps.length,name+' no adopted overlap',measurement.overlaps);
  check(!measurement.documentOverflow,name+' no document horizontal overflow');
  check(!measurement.sectionOverlaps.length,name+' menu sections do not overlap',measurement.sectionOverlaps);
  for(const c of measurement.controls) {
    check(c.rect.width>=43.9&&c.rect.height>=43.9,name+' native >=44 '+c.text,c.rect);
    check(!c.labelClipped&&c.scrollWidth<=c.clientWidth+1,name+' readable label '+c.text,c);
    check(c.rect.x>=measurement.root.x-.5&&c.rect.right<=measurement.root.right+.5,name+' adopted control inside scope width '+c.text,c.rect);
    if(scope==='.menu')check(c.rect.y>=measurement.root.y-.5&&c.rect.bottom<=measurement.root.bottom+.5,name+' adopted menu control in viewport '+c.text,c.rect);
    if(!c.fallback) {
      check(c.ready==='true'&&c.face.image.includes('/menu-review/ui/blender/')&&c.face.display!=='none',name+' decoded face visible '+c.text,c.face);
      check(equalRect(c.rect,c.native),name+' unstretched native face '+c.text,c.rect);
      check(c.ink.x>=c.safe.x-.3&&c.ink.y>=c.safe.y-.3&&c.ink.x+c.ink.width<=c.safe.x+c.safe.width+.3&&c.ink.y+c.ink.height<=c.safe.y+c.safe.height+.3,name+' text and icon inside authored safe area '+c.text,{ink:c.ink,lineBox:c.label,safe:c.safe});
    } else check(c.face.display==='none',name+' fallback suppresses art '+c.text,c.face);
  }
  return measurement;
}
try {
  for(const [width,height,dpr] of [[320,568,1],[390,844,1],[430,932,1],[390,844,2]]) {
    const {page,context,requests}=await newPage(width,height,dpr);
    await page.waitForFunction(()=>document.querySelector('.menu').dataset.atlasReady==='true');
    await settle(page);
    const name=`${width}x${height}-${dpr}x`;
    await capture(page,name+'-menu','.menu');
    const initialImageRequests=requests.filter(u=>u.endsWith('.png')).length;
    for(const [kind,label] of [['play','Play'],['continue','Continue'],['resume','Resume Hole']]) {
      await page.evaluate(kind=>window.review.playState(kind),kind); await settle(page);
      const play=page.locator('.menu__nav > .btn');
      check((await play.textContent()).trim()===label,name+' full dynamic '+label);
      check(await play.getAttribute('aria-label')===label,name+' accessible dynamic '+label);
    }
    await page.getByRole('button',{name:'Settings',exact:true}).click(); await settle(page);
    await page.waitForFunction(()=>document.querySelector('.menu-preferences').dataset.atlasReady==='true');
    await capture(page,name+'-settings','.menu-preferences');
    await page.evaluate(()=>window.review.textScale(2)); await settle(page);
    await capture(page,name+'-settings-200text','.menu-preferences');
    await page.keyboard.press('Escape'); await page.waitForFunction(()=>!document.querySelector('.sheet'));
    await capture(page,name+'-menu-200text','.menu');
    check(requests.filter(u=>u.endsWith('manifest.json')).length===1,name+' manifest reused across mounts',requests);
    check(initialImageRequests>0&&requests.filter(u=>u.endsWith('.png')).length===initialImageRequests,name+' image requests unchanged across later mounts',requests);
    await page.evaluate(()=>window.review.shutdown()); await context.close();
  }

  const main=await newPage(); const {page,context,requests}=main;
  await page.waitForFunction(()=>document.querySelector('.menu').dataset.atlasReady==='true'); await settle(page);
  await page.keyboard.press('Tab');
  await page.getByRole('button',{name:'Career',exact:true}).focus();
  const career=page.getByRole('button',{name:'Career',exact:true}); const before=await career.boundingBox();
  // C.tap activates on keydown. Exercise the combined CSS state separately,
  // then verify actual keyboard navigation without delaying past dismissal.
  await career.evaluate(el=>el.classList.add('is-pressed'));
  const pressed=await capture(page,'keyboard-focus-plus-pressed-class-menu','.menu');
  check(equalRect(before,await career.boundingBox()),'pressed class preserves native target');
  check(pressed.controls[0].outline.includes('2px'),'keyboard focus has visible outline',pressed.controls[0].outline);
  await career.evaluate(el=>el.classList.remove('is-pressed'));
  await page.keyboard.down('Space');
  const leaving=await page.locator('.menu').evaluate(el=>({hasAtlas:el.hasAttribute('data-blender-ui'),ready:el.dataset.atlasReady,rects:[...el.querySelectorAll('[data-bui-button]')].map(b=>({width:b.offsetWidth,height:b.offsetHeight}))}));
  check(leaving.hasAtlas&&leaving.ready==='true','menu dismissal retains painted atlas',leaving);
  await page.keyboard.up('Space'); await page.waitForFunction(()=>window.review.ui.currentScene==='career');
  await page.evaluate(()=>window.review.show('menu')); await settle(page);
  const onceObservers=await page.evaluate(()=>window.review.observerCounts());
  for(let i=0;i<5;i++) await page.evaluate(()=>window.review.show('menu'));
  await settle(page);
  check(await page.locator('.menu [data-bui-button]').count()===4,'repeated show retains exactly four controls');
  check(JSON.stringify(onceObservers)===JSON.stringify(await page.evaluate(()=>window.review.observerCounts())),'repeated show does not multiply observers',onceObservers);
  await page.getByRole('button',{name:'Career',exact:true}).evaluate(el=>{el.disabled=true;el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));});
  check(await page.evaluate(()=>window.review.ui.currentScene)==='menu','disabled production control blocks activation');
  await page.getByRole('button',{name:'Career',exact:true}).evaluate(el=>el.disabled=false);
  await page.evaluate(()=>{window.review.confirmResult=null;window.review.ui.confirm({title:'Review reset confirmation',message:'An isolated confirmation behavior check.',destructive:true,confirmLabel:'Reset'}).then(value=>window.review.confirmResult=value);});
  await page.getByRole('alertdialog',{name:'Review reset confirmation'}).waitFor();
  await page.waitForFunction(()=>document.activeElement?.textContent.trim()==='Cancel');
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.review.confirmResult===false&&!document.querySelector('.modal'));
  check(true,'shared destructive confirmation defaults to Cancel and resolves false');
  await page.getByRole('button',{name:'Settings',exact:true}).click(); await settle(page);
  const low=page.getByRole('button',{name:'Low',exact:true}); const lowBefore=await low.boundingBox();
  await page.mouse.move(lowBefore.x+lowBefore.width/2,lowBefore.y+lowBefore.height/2); await page.mouse.down();
  await capture(page,'pointer-pressed-quality','.menu-preferences');
  check(equalRect(lowBefore,await low.boundingBox()),'actual pointer press preserves native target');
  await page.mouse.up();
  check(await page.evaluate(()=>window.review.state.settings.quality)==='low','actual pointer release picks quality');
  for(const quality of ['Low','Medium','High','Auto']) {
    await page.getByRole('button',{name:quality,exact:true}).focus(); await page.keyboard.press('Space');
    check(await page.evaluate(()=>window.review.state.settings.quality)===quality.toLowerCase(),'quality keyboard writes '+quality);
    check(await page.locator('.menu-preferences [aria-pressed="true"]').count()===1,'quality exclusive pressed '+quality);
  }
  await page.getByRole('switch',{name:'Reduced motion',exact:true}).click(); await settle(page);
  check(await page.locator('.ui-root').evaluate(el=>el.classList.contains('reduced-motion')),'game reduced motion reaches shell');
  let reduced=await measurements(page,'.menu-preferences'); check(reduced.controls.every(c=>c.transition==='0s'&&c.transform==='none'),'game reduced motion stops face translation',reduced.controls);
  await page.getByRole('switch',{name:'Reduced motion',exact:true}).click(); await page.emulateMedia({reducedMotion:'reduce'}); await settle(page);
  reduced=await measurements(page,'.menu-preferences'); check(reduced.controls.every(c=>c.transition==='0s'&&c.transform==='none'),'OS reduced motion stops face translation',reduced.controls);
  await page.emulateMedia({reducedMotion:'no-preference'}); await settle(page);
  await page.getByRole('slider',{name:'Effects',exact:true}).evaluate(el=>{el.value='37';el.dispatchEvent(new Event('input',{bubbles:true}));});
  check(await page.evaluate(()=>window.review.state.settings.sfx)===.37,'Effects preference behavior retained');
  await page.getByRole('slider',{name:'Music',exact:true}).evaluate(el=>{el.value='21';el.dispatchEvent(new Event('input',{bubbles:true}));});
  check(await page.evaluate(()=>window.review.state.settings.music)===.21,'Music preference behavior retained');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  const dismiss=await page.locator('.menu-preferences').evaluate(el=>({hasAtlas:el.hasAttribute('data-blender-ui'),ready:el.dataset.atlasReady,widths:[...el.querySelectorAll('[data-bui-button]')].map(b=>b.offsetWidth)}));
  check(dismiss.hasAtlas&&dismiss.ready==='true','settings dismissal retains painted atlas',dismiss);
  await page.waitForFunction(()=>!document.querySelector('.sheet'));
  const withoutProbeObservers=await page.evaluate(()=>window.review.observerCounts());
  await page.evaluate(()=>window.review.mountProbe()); await settle(page);
  let probe=await capture(page,'probe-disabled-long-label','#review-probe');
  check(probe.controls[1].disabled&&probe.controls[1].face.position.includes('-'),'disabled native button face');
  check(probe.controls[2].fallback,'long dynamic label uses readable fallback');
  await page.locator('#review-probe button').first().evaluate(el=>el.querySelector('span').textContent='A much longer changed label that cannot fit'); await settle(page);
  probe=await measurements(page,'#review-probe'); check(probe.controls[0].fallback,'mutation remeasures dynamic label');
  await page.locator('#review-probe button').first().evaluate(el=>el.querySelector('span').textContent='Fit'); await settle(page);
  probe=await measurements(page,'#review-probe'); check(!probe.controls[0].fallback,'label shortening restores native face');
  await page.locator('#review-probe button').first().evaluate(el=>{el.style.fontSize='38px';document.fonts.dispatchEvent(new Event('loadingdone'));}); await settle(page);
  probe=await measurements(page,'#review-probe'); check(probe.controls[0].fallback,'font-size change remeasures live label');
  await page.locator('#review-probe button').first().evaluate(el=>el.style.removeProperty('font-size')); await settle(page);
  await page.locator('#review-probe').evaluate(el=>el.style.width='60px'); await settle(page);
  probe=await measurements(page,'#review-probe'); check(probe.controls.every(c=>c.fallback),'parent resize falls back');
  await page.locator('#review-probe').evaluate(el=>el.style.removeProperty('width')); await settle(page);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
  await page.evaluate(()=>window.dispatchEvent(new Event('resize')));
  await page.waitForFunction(()=>document.querySelector('#review-probe').dataset.atlasDensity==='2x');
  check(await page.evaluate(()=>devicePixelRatio)===2,'live density switch selects decoded 2x');
  check(requests.filter(u=>u.endsWith('ui-atlas@2x.png')).length===1,'2x singleflight between active roots',requests);
  await page.evaluate(()=>window.review.disposeProbe());
  check(JSON.stringify(withoutProbeObservers)===JSON.stringify(await page.evaluate(()=>window.review.observerCounts())),'probe disposal detaches observers',withoutProbeObservers);
  await page.getByRole('button',{name:'Settings',exact:true}).click(); await settle(page);
  await page.evaluate(()=>window.review.recreate()); await settle(page);
  await page.waitForFunction(()=>document.querySelector('.menu')?.dataset.atlasReady==='true');
  check(await page.locator('.ui-root').count()===1,'shell recreate has one root');
  check(await page.locator('.sheet').count()===0,'shell destroy with open settings removes sheet');
  check(JSON.stringify(onceObservers)===JSON.stringify(await page.evaluate(()=>window.review.observerCounts())),'shell destroy with open settings detaches old observers',await page.evaluate(()=>window.review.observerCounts()));
  check(requests.filter(u=>u.endsWith('manifest.json')).length===1,'shell recreate reuses manifest');
  await page.evaluate(()=>window.review.shutdown());
  check(Object.values(await page.evaluate(()=>window.review.observerCounts())).every(n=>n===0),'final shell disposal detaches all observers');
  await context.close();

  for(const mode of ['missing-manifest','corrupt-manifest','missing-image','corrupt-image','delayed-manifest','delayed-image']) {
    const test=await newPage(390,844,1,mode);
    await test.seen;
    if(!mode.startsWith('delayed')) await test.page.waitForFunction(()=>document.querySelector('.menu').dataset.atlasError);
    await settle(test.page);
    const m=await capture(test.page,mode,'.menu');
    check(m.controls.every(c=>c.fallback),'asset '+mode+' fails readably');
    check(m.controls.every(c=>c.ready!=='true'),'asset '+mode+' never falsely ready');
    if(mode.startsWith('delayed')) {
      test.release(); await test.page.waitForFunction(()=>document.querySelector('.menu').dataset.atlasReady==='true'); await settle(test.page);
      await capture(test.page,mode+'-recovered','.menu');
    } else {
      await test.context.unrouteAll({behavior:'wait'});
      await test.page.evaluate(()=>window.review.show('menu'));
      await test.page.waitForFunction(()=>document.querySelector('.menu').dataset.atlasReady==='true'); await settle(test.page);
      check((await measurements(test.page,'.menu')).controls.some(c=>!c.fallback),'asset '+mode+' explicit remount retries successfully');
    }
    await test.page.getByRole('button',{name:'Career',exact:true}).click();
    await test.page.waitForFunction(()=>window.review.ui.currentScene==='career');
    check(true,'asset '+mode+' retains navigation');
    await test.page.evaluate(()=>window.review.shutdown()); await test.context.close();
  }
  for(const mode of ['delayed-manifest','delayed-image']) {
    const test=await newPage(390,844,1,mode); await test.seen;
    await test.page.evaluate(()=>window.review.shutdown()); test.release(); await test.page.waitForTimeout(400);
    check(await test.page.locator('.ui-root').count()===0,mode+' completion after destroy does not revive DOM');
    check(Object.values(await test.page.evaluate(()=>window.review.observerCounts())).every(n=>n===0),mode+' completion after destroy leaves no active observer');
    await test.context.close();
  }
} catch(error) { report.fatal=error.stack; console.error(error); }
finally {
  await browser.close(); report.browserClosed=true;
  const paths=['src/ui/screens/menu.js','src/ui/screens/menu-atlas.css','src/ui/blender-atlas.js','src/ui/blender-atlas.css','src/ui/styles.css','src/ui/shell.js','src/ui/components.js','public/ui/blender/manifest.json','tools/ui-atlas-adoption-review/harness.js','tools/ui-atlas-adoption-review/check.mjs'];
  report.sources={}; for(const path of paths) report.sources[path]=createHash('sha256').update(await readFile(new URL('../../'+path,import.meta.url))).digest('hex');
  for(const [path,hash] of Object.entries(report.builtInputs)) {
    const current=createHash('sha256').update(await readFile(new URL('../../'+path,import.meta.url))).digest('hex');
    check(current===hash,'built source remains unchanged '+path);
  }
  report.passed=!report.fatal&&!report.errors.length&&report.checks.length>0&&report.checks.every(c=>c.pass);
  await writeFile(new URL('report.json',directory),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,failed:report.checks.filter(c=>!c.pass).map(c=>c.name),fatal:report.fatal,browserClosed:report.browserClosed}));
if(!report.passed)process.exitCode=1;
