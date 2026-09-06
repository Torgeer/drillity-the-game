import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { createGeology } from '../src/world/geology.js';
import { renderSectionInstrumentLayer } from '../src/core/renderer.js';
let checks=0; const check=(condition,message)=>{checks++;assert.ok(condition,message);};
const source=readFileSync(new URL('../src/core/renderer.js',import.meta.url),'utf8');
check(source.indexOf('col /= instrumentAlpha;')<source.indexOf('col *= uExposure;'),'Unpremultiply before film transform');
check(source.indexOf('gl_FragColor = vec4(col, instrumentAlpha);')<source.indexOf('float vig ='),'Instrument returns before vignette/grain');
check(source.includes('uChroma * r2 * 2.0 * (1.0 - uInstrument)'),'Instrument chroma is zero');
check(source.includes("key !== 'tDiffuse' && key !== 'uInstrument'"),'All film inputs are shared live');
check(source.includes('instrumentTarget.setSize(deviceW, deviceH)'),'Target follows actual drawing size');
check(source.includes('instrumentTarget.dispose()')&&source.includes('instrumentPass.dispose()'),'Owned GPU resources disposed');
check(source.includes('sectionCamera.layers.enable(ctx.geology.instrumentLayer)'),'Direct fallback retains instruments');
// Regression fixture: nonlinear display transform + half coverage must produce
// the same colour as an opaque source, then alpha-blend. Synthetic, not a
// numerical mirror or GPU proof of the whole film shader.
const film=x=>Math.pow(x/(1+x),1/2.4);
for(const alpha of [1,0.75,0.5,0.1,1/255]) for(const colour of [0.02,0.1,0.5,1,2]){
  const recovered=colour*alpha/alpha;
  check(Math.abs(film(recovered)-film(colour))<1e-14,'Alpha edges preserve straight film colour');
  if(alpha<1)check(Math.abs(film(colour*alpha)-film(colour))>1e-4,'Missing unpremultiply mutation is caught');
}
// Execute the production render helper, with real Three scenes/layers and a
// recording renderer. Inject a render and a composite failure; all scene and
// renderer state must return intact, including the null output framebuffer.
for(const failure of [null,'scene','composite']){
  const scene=new THREE.Scene(), camera=new THREE.OrthographicCamera();
  const world=new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshBasicMaterial());
  const instrument=new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshBasicMaterial());
  instrument.layers.set(1);scene.add(world,instrument);
  const bg=new THREE.Color('#123456'),override=new THREE.MeshNormalMaterial();
  scene.background=bg;scene.overrideMaterial=override;
  const events=[];let targetNow='before';let color=new THREE.Color('#abcdef'),alpha=.72;
  const renderer={autoClear:true,shadowMap:{enabled:true},
    getClearAlpha:()=>alpha,getClearColor:c=>c.copy(color),
    setClearColor:(c,a)=>{color.set(c);alpha=a;},
    setRenderTarget:t=>{targetNow=t;events.push(['target',t]);},
    clear:(...args)=>{check(!renderer.autoClear,'No automatic colour clearing');assert.deepEqual(args,[true,false,false]);events.push(['clear']);},
    render:(s,c)=>{check(s===scene&&c===camera,'Original live camera and scene');check(!scene.background&&!scene.overrideMaterial,'No world background or override leaks');
      check(c.layers.test(instrument.layers)&&!c.layers.test(world.layers),'Only owned layer draws');events.push(['scene']);if(failure==='scene')throw Error('scene');}
  };
  const target={texture:{},width:780,height:1688};
  const pass={render:(r,w,b)=>{check(targetNow===null&&b===target&&w===null,'Composite source and framebuffer');check(!renderer.autoClear,'Composite cannot erase world');events.push(['composite']);if(failure==='composite')throw Error('composite');}};
  try {renderSectionInstrumentLayer(renderer,scene,camera,1,target,pass,t=>events.push(['band',t]),t=>events.push(['release',t]));check(failure===null,'Injected exception propagated');}
  catch(e){check(e.message===failure,'Exact injected exception propagated');}
  check(camera.layers.mask===1&&scene.background===bg&&scene.overrideMaterial===override,'Scene state restored');
  check(renderer.autoClear&&renderer.shadowMap.enabled&&targetNow===null,'Renderer state restored');
  check(color.getHexString()==='abcdef'&&alpha===.72,'Clear colour and alpha restored');
  check(events.at(-1)[0]==='release'&&events.at(-1)[1]===null,'Screen viewport restored last');
}
// Minimal Canvas2D fixture only: inspect actual geology ownership in every mode
// and after rebuild/disposal. No real font, pixel or GPU claim here.
const noop=()=>{};
globalThis.document={createElement:()=>{const canvas={width:1,height:1};const context=new Proxy({canvas,measureText:text=>({width:String(text).length*7}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),getImageData:()=>({data:new Uint8ClampedArray(canvas.width*canvas.height*4)})},{get:(o,k)=>k in o?o[k]:noop});canvas.getContext=()=>context;return canvas;}};
const camera=new THREE.OrthographicCamera(-10*390/280,10*390/280,10,-10,.1,200);camera.position.z=30;
const ctx={THREE,sectionScene:new THREE.Scene(),sectionCamera:camera,viewport:{w:390,h:844},stage:{w:390,h:844,x:0,y:0},bands:{section:{w:390,h:280,x:0,y:300}},quality:{id:'low',strataSegments:48,anisotropy:4},state:{world:{regionId:'nordic'},drill:{depth:0,stage:0,stageProgress:0}}};
const geo=createGeology(ctx);await geo.init();let old=[];
for(const mode of ['vertical','profile','raise','heading','pile','vertical']){
  geo.generateProfile({regionId:'nordic',targetDepth:60,seed:20260903,holeDiaMm:152,profileMode:mode});
  for(let frame=0;frame<3;frame++)geo.update(1/30,ctx.state);
  check(geo.profileMode===mode,'Requested mode is exercised');
  const meshes=geo.instrumentMeshes;
  check(meshes.length===(['profile','heading'].includes(mode)?5:4),'Complete mode-owned instrument set '+mode);
  check(new Set(meshes).size===meshes.length,'No duplicate handles');
  for(const mesh of meshes){check(mesh.userData.sectionInstrument&&mesh.layers.mask===(1<<geo.instrumentLayer),'Owned layer/tag '+mesh.name);check(mesh.material.map.colorSpace===THREE.SRGBColorSpace&&mesh.material.transparent,'Original sRGB alpha art retained');}
  const live=[];geo.sectionRoot.traverse(o=>{if(o.isMesh&&o.layers.mask===(1<<geo.instrumentLayer))live.push(o);});
  check(live.length===meshes.length,'No stale or world meshes on instrument layer');
  for(const mesh of old)if(!meshes.includes(mesh))check(!mesh.parent,'Rebuilt handles detached');
  old=meshes;
}
geo.dispose();
console.log('INSTRUMENT CPU: '+checks+' assertions; real ownership/helper execution + synthetic alpha math; no GPU visual claim.');
