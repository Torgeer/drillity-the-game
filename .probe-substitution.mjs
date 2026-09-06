/** Does the substitution fire, and what does it build instead? */
import { registerHooks } from 'node:module';
import * as THREE from 'three';
const hooks = registerHooks({ load(u,c,n){ if(u.endsWith('/src/ui/assets/logo-full.png')) return {format:'module',source:'export default ""',shortCircuit:true}; return n(u,c);} });
const imageData=(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4).fill(255)});
function canvas(){const c={width:1,height:1};const noop=()=>{};const gr=()=>({addColorStop:noop});
 const g={canvas:c,createImageData:imageData,getImageData:(_x,_y,w,h)=>imageData(w,h),createLinearGradient:gr,createRadialGradient:gr,measureText:t=>({width:String(t).length*10})};
 for(const m of ['arc','beginPath','bezierCurveTo','clearRect','clip','closePath','drawImage','ellipse','fill','fillRect','fillText','lineTo','moveTo','putImageData','quadraticCurveTo','rect','restore','rotate','roundRect','save','scale','setLineDash','setTransform','stroke','strokeRect','strokeText','transform','translate'])g[m]=noop;
 c.getContext=()=>g;return c;}
globalThis.document={baseURI:'https://probe.invalid/',createElement:()=>canvas()};
globalThis.Image=class{width=512;height=128;set src(_v){queueMicrotask(()=>this.onload?.());}};
globalThis.fetch=async()=>new Response('missing',{status:404});
const { createTerrain } = await import('./src/world/terrain.js');
const data = await import('./src/game/data.js');

for (const [region, method] of [['iberian-quarry','core'],['andes','core'],['alpine','core'],
                                ['iberian-quarry','tunnel-jumbo'],['nordic','cfa']]) {
  const scene = new THREE.Scene();
  const t = createTerrain({ THREE, scene, data, quality:{id:'low',particles:0.3,anisotropy:1},
    state:{ world:{ regionId: region, weather:'clear' } } });
  await t.init();
  const state = { contract: { methodId: method, archetype: 'underground-drive', applicationId: 'mineral-exploration' } };
  t.update(0.016, state);
  let draws = 0, inst = 0;
  t.root.traverse((o)=>{ if(o.isMesh&&o.visible){draws++; if(o.isInstancedMesh) inst++;} });
  const sub = t.archetypeSubstitution;
  console.log(`${region}/${method}: archetype=${t.archetype} drive=${t.drive?t.drive.id:'null'} draws=${draws} instanced=${inst}`);
  console.log(`   substitution=${sub ? `${sub.wanted} -> ${sub.used}` : 'null'}`);
  t.dispose();
}
hooks.deregister();
