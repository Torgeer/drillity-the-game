import { createSiteScreen } from '../../src/ui/screens/site.js';
import * as C from '../../src/ui/components.js';
import * as game from '../../src/game/data.js';
import { useGameData, SITE_ACTIONS } from '../../src/ui/screens/catalog.js';
import { DUR, dur } from '../../src/core/motion.js';
import { fmtMoney } from '../../src/core/contract.js';
import '../../src/ui/styles.css';
import { makeConfirmation } from 'fixture:confirmation';

// No renderer or simulation is imported. The real catalogue transitively imports
// static tool definitions; no geometry builders or asset loaders are called.
// Synthetic telemetry is passed through production screen and components.
useGameData(game);
const root = C.h('div.ui-root', C.h('div.ui-letterbox'));
const stage = C.h('div.ui-stage.is-site');
const screens = C.h('div.screens');
const overlayEl = C.h('div.overlays');
stage.append(screens, overlayEl); root.append(stage); document.body.append(root);
let reduced = false, screen = null, app = null, telemetry = null;
let ownedFrame=0,lastFrame=performance.now();
// The production main loop clamps dt to [0,1/15] (src/main.js). Run the
// actual screen every browser frame while fixtures settle or await input.
function frame(now){const dt=Math.max(0,Math.min((now-lastFrame)/1000,1/15));lastFrame=now;if(screen?.el.isConnected)screen.update(dt);ownedFrame=requestAnimationFrame(frame);}
ownedFrame=requestAnimationFrame(frame);
const effects = { aborts: [], nav: [], inputs: [], actions: [] };
const confirmation = makeConfirmation(C, DUR, dur, overlayEl, () => reduced);
const programmes = {
  rc: {kind:'rc', bagsCut:1, lastBag:{index:1,fromM:0,toM:1,massKg:15.12,recovery01:.91,contam01:.02,rating:'good'}},
  jumbo: {kind:'jumbo',roundIndex:1,holesDone:8,holesPerRound:12,roundsFired:0,pull01:.92,overbreak:.08,halfBarrel01:.74,advanceM:3.1},
  longhole: {kind:'longhole',holeIndex:2,holesTotal:12,ring:3,holeLengthM:12.5,redrills:1},
  bolt: {kind:'rockbolt',boltIndex:2,boltsTotal:40,boltType:'friction',anchorageBasis:'game-fit-score-not-pull-test',diameterFit:'supported',bitGaugeMm:35,bitTrialRangeMm:[32,37],installs:[{index:1,type:'friction',anchorageBasis:'game-fit-score-not-pull-test',diameterFit:'supported',bitGaugeMm:35}]},
  pile: {kind:'driven-pile',blows:47,blowsPer250:43,designSetMm:3,toeDepthM:12.35,bearingPenM:.6,bearingPenRequiredM:1.1,setTaken:false,founded:false,refused:false,blowLog:[{toM:12,blowsPer250:38,incrementMm:250}]},
  cpt: {kind:'cpt',pushRateMmS:20,dissipations:0,readings:420,inTolerance01:.94,inclinationDeg:1.2,coneDamage01:.05,rotationLocked:true,flushLocked:true,lockNote:'No rotation or circulating fluid on this sounding'},
  spt: {kind:'spt',testIndex:1,lastTest:{index:1,depthM:6.45,N:19,N60:17.5,energyRatio:.63,sampleQuality01:.82,areaRatio:1.1}},
  twoStage: {kind:'two-stage',stage:1,stageName:'Pilot',passM:43,passTargetM:120,reverse:false},
};
const cases = [
  ['rotary','rotary-kelly'],['auger','auger'],['percussive','dth'],['core','core'],['sonic','sonic'],['oil','oil-rotary'],['hdd','hdd'],['cfa','cfa'],['jet','jet-grouting'],['cable','cable-tool'],
  ['rc','rc'],['jumbo','tunnel-jumbo'],['longhole','longhole'],['bolt','rockbolt'],['pile','driven-pile'],['cpt','site-investigation'],['spt','site-investigation'],['twoStage','raise-boring'],
];
function step(dt=.13) { screen.update(dt); }
async function settle() { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); }
async function mount(family, mode='steady', motion=false, options={}) {
  if(screen) {screen.unmount();screen.destroy();screen.el.remove();}
  reduced=motion;root.classList.toggle('reduced-motion',reduced);
  const mid=cases.find(c=>c[0]===family)?.[1];
  const method=game.METHODS.find(m=>m.id===mid);
  if(!method) throw Error('Fixture method missing '+family+' '+mid);
  telemetry={methodId:mid,method:{kind:family==='percussive'?'hammer':family},depth:12.3,target:100,timeSec:234,torque:.57,rop:48.4,wear:.08,heat:.2,stability:.95,active:true,wob:.5,rpm:.5,flush:.5,returns:1,hasDrillString:true,phase:'drilling',progress01:.123,hazards:[],actions:[],programme:structuredClone(programmes[family]||null)};
  if(family==='oil') {telemetry.well={overbalanceSg:.12,influx01:0};telemetry.actions=[{id:'shutIn',label:'SHUT IN'},{id:'lcmPill',label:'LCM PILL'}];}
  if(family==='rc') telemetry.actions=[{id:'blowDown',label:'BLOW DOWN'}];
  if(family==='jumbo') telemetry.actions=[{id:'shortRound',label:'SHORTEN ROUND'}];
  if(family==='longhole') telemetry.actions=[{id:'redrill',label:'RE-DRILL'}];
  if(family==='bolt') telemetry.actions=[{id:'torqueTest',label:'TORQUE TEST'},{id:'reamHole',label:'REAM HOLE'},{id:'inspectSlot',label:'READ THE SLOT'}];
  if(family==='pile') telemetry.actions=[{id:'takeSet',label:'TAKE THE SET'},{id:'changeDolly',label:'CHANGE DOLLY'}];
  if(family==='cpt') telemetry.actions=[{id:'dissipation',label:'DISSIPATION TEST'},{id:'terminate',label:'TERMINATE'}];
  if(family==='spt') telemetry.actions=[{id:'strike',label:'RELEASE'},{id:'cleanOut',label:'CLEAN OUT'}];
  telemetry.gauge=family==='pile'?{axis:'set',label:'SET',unit:'mm/blow',real:3,max:30,value:.5,display:.5}:family==='cpt'?{axis:'push-rate',label:'PUSH RATE',unit:'mm/s',real:20,max:34,value:.588,display:.588}:family==='twoStage'?{axis:'pull',label:'PULL',unit:'',real:.7,max:1.25,value:.7,display:.7}:{axis:'torque',label:'TORQUE',unit:'',real:.57,max:1.25,value:.57,display:.57};
  const state={scene:'site',player:{money:123456,level:60},settings:{reducedMotion:reduced},world:{regionId:'nordic',strata:[]},drill:{active:true,depth:12.3,target:100,wob:.5,rpm:.5,flush:.5}};
  if(options.input01!==undefined)for(const key of ['wob','rpm','flush']){telemetry[key]=options.input01;state.drill[key]=options.input01;}
  const contract={id:'fixture-'+family,methodId:mid,regionId:'nordic',targetDepth:100,title:'DOM fixture'};state.contract=contract;
  const bus={emit(){},on(){return()=>{};}};
  let telemetryReady=!options.delayedTelemetry;
  const sim={active:true,getTelemetry:()=>telemetryReady?telemetry:null,getSweetSpot:()=>[.45,.65],getForecast:()=>[],abortHole:reason=>{effects.aborts.push(reason);state.drill.active=false;},setInput:(k,v)=>effects.inputs.push([k,v]),pulse:(...v)=>effects.actions.push(v)};
  const ctx={state,bus,sim,game,hudWrites:[]};let hudValue;
  Object.defineProperty(ctx,'hud',{get(){return hudValue;},set(v){hudValue=v;const d=screens.querySelector('.sitedock'),cs=d?getComputedStyle(d):null;ctx.hudWrites.push({time:performance.now(),value:{...v},class:d?.className,height:d?.offsetHeight,cssHeight:cs?.height,transitionProperty:cs?.transitionProperty,transitionDuration:cs?.transitionDuration});}});
  app={C,state,ctx,bus,fmtMoney,viewport:{w:innerWidth,h:innerHeight,dpr:1},get reducedMotion(){return reduced;},haptic(){},strataFor:()=>[],confirm:confirmation.confirm,nav:scene=>{effects.nav.push(scene);state.scene=scene;}};
  screen=createSiteScreen(app);screen.el.classList.add('screen','screen--site');screens.append(screen.el);screen.mount({contract});step();await settle();telemetryReady=true;if(!options.noExplicitResize)screen.resize();step();await settle();
  if(mode==='card') {
    const p=telemetry.programme;if(!p)throw Error('No card programme '+family);
    const stamp={rc:'bagsCut',jumbo:'roundsFired',longhole:'holeIndex',bolt:'boltIndex',cpt:'dissipations',spt:'testIndex',twoStage:'stage'}[family];
    if(family==='pile')p.setTaken=true;else p[stamp]++;
    step();await settle();
  }
  if(mode.startsWith('beat')) {const kind=mode.split(':')[1]||(family==='bolt'?'bolt-install':'rod-add'),boltType=mode.startsWith('beat-friction')?'friction':'resin';telemetry.phase=kind;telemetry.beat=['tripping-out','tripping-in','bit-swap','casing-run'].includes(kind)?null:{kind,dur:4,t:1,hasWindow:['boom-setup','ring-index','pitch','rod-add','bail','bailing-run'].includes(kind),data:{type:boltType}};telemetry.actions=telemetry.actions.map(a=>({...a,enabled:false}));if(kind==='rod-add')telemetry.rodAdd={hit:false,missed:false};if(family==='bolt'){telemetry.programme.boltType=boltType;telemetry.programme.installStage='gel';}if(family==='cable')telemetry.hasDrillString=false;step();await settle();}
  if(mode.startsWith('action:')) {
    const action=mode.slice(7);
    if(['rod','bail'].includes(action)){telemetry.phase='rod-add';telemetry.rodAdd={hit:false,missed:false};telemetry.hasDrillString=action!=='bail';}
    if(action==='beat')telemetry.beat={kind:'boom-setup',hasWindow:true,hit:false,dur:4,t:1};
    if(action==='release')telemetry.beat={kind:'spt-drive',hasWindow:false,dur:4,t:1};
    if(action==='jam')telemetry.jam={state:'bound',bind01:.6};
    if(action==='kick'){telemetry.flags={lostCirculation:true};telemetry.kickReady=true;}
    if(action==='casing'){telemetry.canCase=true;telemetry.casingOn=false;telemetry.stability=.2;}
    if(action==='trip')telemetry.wear=.95;
    step();await settle();
  }
  if(mode==='hazard') {screen.onCavity({depth:12.3,height:1.5});step();await settle();}
  if(mode==='well:gaining'){Object.assign(telemetry.well,{overbalanceSg:-.06,influx01:.1,flowing:true});step();await settle();}
  if(mode==='well:losing'){Object.assign(telemetry.well,{overbalanceSg:-.06,columnLevel01:.7});step();await settle();}
  await settle();await new Promise(r=>setTimeout(r,650));
  window.__DRILLITY=ctx;
  return {family,mode,method:mid,input01:telemetry.wob,programme:telemetry.programme?.kind||null,actions:telemetry.actions.filter(a=>a.enabled!==false).length};
}
window.fixture={cases,actionLabels:Object.fromEntries(Object.entries(SITE_ACTIONS).map(([k,v])=>[k,v.label])),cardFamilies:Object.keys(programmes),mount,effects,step,get app(){return app;},get screen(){return screen;},get telemetry(){return telemetry;},dispose(){cancelAnimationFrame(ownedFrame);screen?.destroy();confirmation.dispose();}};
