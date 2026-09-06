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
for (const arch of ['platform-deck','marine-spread'])
for (const region of ['nordic','north-sea','iberian-quarry']) {
  const scene=new THREE.Scene();
  const t=createTerrain({THREE,scene,quality:{id:'low',particles:0.3,anisotropy:1},state:{world:{regionId:region,weather:'clear'}}});
  await t.init();
  try { t.setArchetype(arch); } catch(e){ console.log(`THROW ${arch}@${region}: ${e.stack.split('\n').slice(0,6).join('\n')}`); t.dispose(); continue; }
  const s=[]; t.root.traverse(o=>{ if(o.isInstancedMesh&&o.visible) s.push(o.name+'x'+o.count); });
  console.log(`${arch}@${region}: scatter=[${s.join(' ')}] deck=${!!t.root.getObjectByName('deck')} ground=${t.ground?'yes':'null'} h00=${t.heightAt(0,0)}`);
  t.dispose();
}
hooks.deregister();
