/** Does a rebuild while a site fetch is in flight register another .then(rebuild)?
 *  (the mountPreview() "nineteen rAF chains" shape, checked by measurement) */
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import * as THREE from 'three';

const hooks = registerHooks({ load(url, c, next) {
  if (url.endsWith('/src/ui/assets/logo-full.png')) return { format:'module', source:`export default ""`, shortCircuit:true };
  return next(url, c); } });
const imageData=(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4).fill(255)});
function canvas(){const c={width:1,height:1};const noop=()=>{};const gr=()=>({addColorStop:noop});
 const g={canvas:c,createImageData:imageData,getImageData:(_x,_y,w,h)=>imageData(w,h),createLinearGradient:gr,createRadialGradient:gr,measureText:t=>({width:String(t).length*10})};
 for(const m of ['arc','beginPath','bezierCurveTo','clearRect','clip','closePath','drawImage','ellipse','fill','fillRect','fillText','lineTo','moveTo','putImageData','quadraticCurveTo','rect','restore','rotate','roundRect','save','scale','setLineDash','setTransform','stroke','strokeRect','strokeText','transform','translate'])g[m]=noop;
 c.getContext=()=>g;return c;}
globalThis.document={baseURI:'https://probe.invalid/',createElement:()=>canvas()};
globalThis.Image=class{width=512;height=128;set src(_v){queueMicrotask(()=>this.onload?.());}};

const bytes = readFileSync(new URL('./public/models/sites/urban-plot.glb', import.meta.url));
let release; const gate = new Promise((r)=>{release=r;});
let requests = 0;
globalThis.fetch = async (u) => { requests++; await gate; return new Response(bytes,{status:200}); };

const { createTerrain } = await import('./src/world/terrain.js');

// Count full site rebuilds by counting how many times buildGround makes a ground mesh.
let groundBuilds = 0;
const scene = new THREE.Scene();
const t = createTerrain({ THREE, scene, quality:{id:'low',particles:0.3,anisotropy:1},
  state:{ world:{ regionId:'german-site', weather:'clear' } } });
await t.init();
const origAdd = t.root.add.bind(t.root);
t.root.add = (...objs) => { for (const o of objs) if (o?.name === 'ground') groundBuilds++; return origAdd(...objs); };

t.setArchetype('urban-plot');
await delay(5);
console.log(`after first setArchetype: requests=${requests} groundBuilds=${groundBuilds}`);

// Simulate the live update() path churning while the fetch is in flight.
const CHURN = 12;
for (let i = 0; i < CHURN; i++) t.setRegion(i % 2 ? 'nordic' : 'german-site');
const beforeRelease = groundBuilds;
console.log(`after ${CHURN} region churns (fetch still in flight): groundBuilds=${groundBuilds}`);

release();
await delay(60);
const afterRelease = groundBuilds - beforeRelease;
console.log(`AFTER the single fetch resolved: extra groundBuilds=${afterRelease}  (1 = correct, ${CHURN + 1} = amplified)`);
console.log(`requests=${requests} (must be 1) siteModel=${JSON.stringify(t.siteModel)}`);
t.dispose();
hooks.deregister();
