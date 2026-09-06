/** Headed quarry collar evidence; exact GPU lease required.
 * node tools/checkquarrylivecollarbrowser.mjs --port 5207
 * Baseline/root assets are read-only. Candidate quarry is served from this checkout.
 * Native game screenshots and isolated diagnostic renders are labelled separately.
 * No FPS, clearance, or whole-game visual-quality certification.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i=args.indexOf('--'+name); return i<0?fallback:args[i+1]; };
const root = resolve(flag('root', '../../drillity-the-game'));
const out = resolve(flag('out', 'shots/quarry-live-collar'));
const lease = resolve(flag('lease', '../drillity-coordination/gpu-owner.txt'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const checkLease = () => assert.equal(readFileSync(lease,'utf8').trim(), 'quarry-live-collar', 'Exact GPU grant required');
const sourceFiles = ['blender/sites/quarry_bench.py','blender/lib/site.py','blender/lib/rig.py','src/world/terrain.js','src/core/renderer.js','src/core/assets.js'];
const baseline = readFileSync(resolve(root, 'public/models/sites/quarry-bench.glb'));
const candidate = readFileSync(resolve(flag('candidate-asset','public/models/sites/quarry-bench.glb')));
assert.notEqual(hash(baseline),hash(candidate),'Candidate must differ from original negative control');
checkLease();
mkdirSync(out,{recursive:true});
const report = { evidence:'Headed actual gameplay plus isolated actual site/live-collar geometry with diagnostic camera and lighting. No FPS or engineering clearance claim.',
  baselineSHA256:hash(baseline),candidateSHA256:hash(candidate),
  sources:Object.fromEntries(sourceFiles.map(p=>[p,hash(readFileSync(p))])),cases:[],errors:[],requestsFailed:[],warnings:[],failures:[] };
let browser;
try {
  browser = await chromium.launch({headless:false,channel:'chrome',args:['--mute-audio','--enable-gpu-rasterization','--ignore-gpu-blocklist']});
  for (const variant of ['baseline','candidate']) {
    checkLease();
    const context = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    // Serve read-only generated inputs without exporting/copying unrelated models.
    await context.route('**/models/**/*.glb', async route => {
      const path = new URL(route.request().url()).pathname;
      assert.match(path,/^\/models\/(?:sites\/)?[a-z0-9-]+\.glb$/);
      const quarry = path === '/models/sites/quarry-bench.glb';
      const bytes = quarry ? (variant==='baseline'?baseline:candidate) : readFileSync(resolve(root,'public'+path));
      await route.fulfill({status:200,contentType:'model/gltf-binary',body:bytes});
    });
    const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push({variant,message:e.message}));
    page.on('console',m=>{if(m.type()==='error')report.errors.push({variant,message:m.text()});if(m.type()==='warning')report.warnings.push({variant,message:m.text()});});
    page.on('requestfailed',r=>report.requestsFailed.push({variant,url:r.url(),error:r.failure()?.errorText}));
    page.on('response',r=>{if(r.status()>=400)report.errors.push({variant,status:r.status(),url:r.url()});});
    await page.goto('http://127.0.0.1:'+flag('port','5207')+'/?quality=high&shot&mute',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__DRILLITY?.__qa&&document.querySelector('.menu')&&!document.querySelector('.menu').hidden,null,{timeout:180000});
    await page.evaluate(async()=>{
      const c=window.__DRILLITY,{makeRandom}=await import('/src/core/contract.js');
      c.rand=makeRandom(1904); c.sim.update=()=>{};
      await c.__qa.loadModel('dth-crawler');
      await c.__qa.startDemoContract({method:'dth',depth:0});
      // Controlled quarry fixture: actual public terrain state, not a new app contract.
      c.state.contract.archetype='quarry-bench'; c.terrain.setArchetype('quarry-bench');
      c.state.drill.active=false;c.state.garage.rigId='dth-crawler';c.rig.setRig('dth-crawler');
    });
    await page.waitForFunction(()=>window.__DRILLITY.terrain.siteModel.model==='quarry-bench',null,{timeout:60000});
    await page.evaluate(async()=>{await window.__DRILLITY.renderer.warmShaders();await new Promise(r=>{let n=0;const f=()=>++n>=80?r():requestAnimationFrame(f);requestAnimationFrame(f);});});
    for(const cased of [false,true]) {
      checkLease();
      await page.evaluate(cased=>{const c=window.__DRILLITY;c.geology.setCasingDepth(cased?1:0);c.terrain.update(0,c.state);},cased);
      const name=variant+'-'+(cased?'cased':'uncased');
      const result=await page.evaluate(async({cased})=>{
        const c=window.__DRILLITY,T=c.THREE,site=c.terrain.root.getObjectByName('site:quarry-bench'),collar=c.terrain.root.getObjectByName('collar');
        if(!site||!collar)throw Error('Missing actual loaded site or live collar');
        // Set via the actual public casing API; verify the actual live node.
        const stub=collar.children.find(o=>o.geometry?.parameters?.radiusTop===0.34&&o.geometry?.parameters?.height===0.75);
        if(!stub||stub.visible!==cased)throw Error('Actual casing visibility did not follow geology API');
        const source=c.rig.getSpec().source;
        if(source!=='glb')throw Error('Rig fallback, not requested actual asset');
        const native=c.renderer.captureFrame();
        const scene=new T.Scene();scene.background=new T.Color(0x353b41);
        scene.add(site.clone(true),collar.clone(true));
        scene.add(new T.HemisphereLight(0xffffff,0x59616b,2.0));
        const key=new T.DirectionalLight(0xffffff,3.0);key.position.set(3,5,4);scene.add(key);
        // Authored diagnostic view only; these are not site clearance dimensions.
        const camera=new T.PerspectiveCamera(40,c.renderer.gl.domElement.width/c.renderer.gl.domElement.height,0.05,100);
        camera.position.set(1.6,1.5,2.1);camera.lookAt(0,0.25,0);
        const gl=c.renderer.gl,size=gl.getSize(new T.Vector2()),viewport=gl.getViewport(new T.Vector4()),scissor=gl.getScissor(new T.Vector4()),scissorTest=gl.getScissorTest(),target=gl.getRenderTarget();
        let diagnostic;
        try{gl.setRenderTarget(null);gl.setScissorTest(false);gl.setViewport(0,0,size.x,size.y);gl.clear();gl.render(scene,camera);diagnostic=gl.domElement.toDataURL('image/png');}
        finally{gl.setRenderTarget(target);gl.setViewport(viewport);gl.setScissor(scissor);gl.setScissorTest(scissorTest);c.renderer.render(0);}
        return {native,diagnostic,siteModel:c.terrain.siteModel,collarPosition:c.terrain.collarPosition.toArray(),cased,stubVisible:stub.visible,rigSource:source,registration:c.renderer.registration,
          fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),contextLost:gl.getContext().isContextLost()};
      },{cased});
      for(const kind of ['native','diagnostic']) { assert.match(result[kind],/^data:image\/png;base64,/);writeFileSync(resolve(out,name+'-'+kind+'.png'),Buffer.from(result[kind].split(',')[1],'base64'));delete result[kind]; }
      report.cases.push({name,...result});
      await page.screenshot({path:resolve(out,name+'-phone.png')});
      console.log(name+' actualModel='+result.siteModel.model+' stubVisible='+result.stubVisible);
    }
    await context.close();
  }
}catch(error){report.failures.push(error.stack||String(error));}
finally{
  if(browser){await browser.close();report.browserClosed=true;}
  report.passed=report.cases.length===4&&!report.errors.length&&!report.requestsFailed.length&&!report.failures.length&&report.cases.every(c=>!c.contextLost);
  report.visualAcceptance='Pending human/agent image inspection; successful capture alone is not visual acceptance.';
  writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2));
}
console.log(JSON.stringify({cases:report.cases.length,passed:report.passed,errors:report.errors.length,requestsFailed:report.requestsFailed.length,failures:report.failures,browserClosed:report.browserClosed}));
process.exitCode=report.passed?0:1;
