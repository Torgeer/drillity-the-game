import { chromium, devices } from 'playwright';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const PORT=arg('port','5211');
const b = await chromium.launch({ channel:'chrome', headless:false, args:['--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await c.newPage();
p.on('pageerror',e=>console.log('PAGEERROR',e.message.slice(0,200)));
await p.goto(`http://localhost:${PORT}/?quality=high&shot`,{waitUntil:'load'});
await p.waitForFunction(()=>document.body.classList.contains('booted'),null,{timeout:90000}).catch(()=>{});
await p.waitForTimeout(12000);
const r = await p.evaluate(()=>{
  const D=window.__DRILLITY;
  D.geology.generateProfile({regionId:'nordic',applicationId:'water-well',targetDepth:45,seed:4242,difficulty:0.3,holeDiaMm:152,methodId:'dth',commodity:null,oreConfidence:0.25});
  D.state.drill.depth=12; Object.assign(D.state.drill,{active:true,rpm:0.75,torque:0.5,jam:0});
  const tick=()=>{D.state.drill.depth=12;Object.assign(D.state.drill,{active:true,rpm:0.75,torque:0.5,jam:0});requestAnimationFrame(tick);}; tick();
  return new Promise(res=>setTimeout(()=>{
    let face=null;
    D.sectionScene.traverse(o=>{ if(o.name==='section-face') face=o; });
    const u=face&&face.material&&face.material.uniforms;
    res({
      found: !!face,
      hasULook: !!(u&&u.uLook), hasUSurvey: !!(u&&u.uSurvey),
      uLook: u&&u.uLook? u.uLook.value.toArray():null,
      uSurvey: u&&u.uSurvey? u.uSurvey.value.toArray():null,
      uDepth: u&&u.uDepth? u.uDepth.value:null,
      surveyConfidence: D.geology.surveyConfidence,
      progLog: (face&&face.material&&face.material.program)?face.material.program.diagnostics:null,
    });
  },2500));
});
console.log(JSON.stringify(r,null,2));
await b.close();
