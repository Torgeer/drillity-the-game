/** NET draw-call cost of a site .glb: the same archetype built with the model
 *  live and with the model absent, differenced. CPU, real loader, real bytes.
 *  This is the number blender/lib/site.py's BUDGET rule is written against:
 *  "the archetype's terrain.js branch must give back at least as many calls as
 *  the .glb takes". */
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import * as THREE from 'three';
const hooks = registerHooks({ load(u,c,n){ if(u.endsWith('/src/ui/assets/logo-full.png')) return {format:'module',source:'export default ""',shortCircuit:true}; return n(u,c);} });
const imageData=(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4).fill(255)});
function canvas(){const c={width:1,height:1};const noop=()=>{};const gr=()=>({addColorStop:noop});
 const g={canvas:c,createImageData:imageData,getImageData:(_x,_y,w,h)=>imageData(w,h),createLinearGradient:gr,createRadialGradient:gr,measureText:t=>({width:String(t).length*10})};
 for(const m of ['arc','beginPath','bezierCurveTo','clearRect','clip','closePath','drawImage','ellipse','fill','fillRect','fillText','lineTo','moveTo','putImageData','quadraticCurveTo','rect','restore','rotate','roundRect','save','scale','setLineDash','setTransform','stroke','strokeRect','strokeText','transform','translate'])g[m]=noop;
 c.getContext=()=>g;return c;}
globalThis.document={baseURI:'https://probe.invalid/',createElement:()=>canvas()};
globalThis.Image=class{width=512;height=128;set src(_v){queueMicrotask(()=>this.onload?.());}};

let SERVE = true;
globalThis.fetch = async (u) => {
  const id = String(u).split('/').pop().replace('.glb','');
  if (!SERVE) return new Response('missing', { status: 404 });
  try { return new Response(readFileSync(new URL(`./public/models/sites/${id}.glb`, import.meta.url)), { status: 200 }); }
  catch { return new Response('missing', { status: 404 }); }
};
const { createTerrain } = await import('./src/world/terrain.js');

async function build(arch, region, serve) {
  SERVE = serve;
  const scene = new THREE.Scene();
  const t = createTerrain({ THREE, scene, quality:{id:'high',particles:1,anisotropy:4},
    state:{ world:{ regionId: region, weather:'clear' } } });
  await t.init();
  t.setArchetype(arch);
  for (let i = 0; i < 200 && serve && !t.siteModel.model && !t.siteModel.problem; i++) await delay(5);
  const seen = [];
  let draws = 0, siteDraws = 0;
  t.root.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    const n = Array.isArray(o.material) ? o.material.length : 1;
    draws += n;
    if (o.name.startsWith('site:') || o.parent?.name?.startsWith('site:')
        || (o.parent && o.parent.parent?.name?.startsWith('site:'))) siteDraws += n;
    seen.push(o.name || '(unnamed)');
  });
  const inst = seen.filter((_n, i) => false).length;
  const instNames = [];
  t.root.traverse((o) => { if (o.isInstancedMesh && o.visible) instNames.push(o.name); });
  const out = { draws, siteDraws, instNames, model: t.siteModel.model, problem: t.siteModel.problem,
                prims: t.siteModel.drawCalls };
  t.dispose();
  return out;
}

const CASES = [['quarry-bench','iberian-quarry'], ['quarry-bench','nordic'],
                ['urban-plot','german-site'], ['urban-plot','nordic']];
console.log('arch                region          draws(no glb)  draws(glb)  modelPrims  NET   scattersDropped');
for (const [a, r] of CASES) {
  const off = await build(a, r, false);
  const on  = await build(a, r, true);
  const dropped = off.instNames.filter((n) => !on.instNames.includes(n));
  const net = on.draws - off.draws;
  console.log(`${a.padEnd(20)}${r.padEnd(16)}${String(off.draws).padStart(9)}${String(on.draws).padStart(13)}`
    + `${String(on.prims).padStart(12)}${String(net >= 0 ? '+' + net : net).padStart(7)}   [${dropped.join(' ') || '-'}]`);
  if (!on.model) console.log(`   !! model did not load: ${on.problem}`);
}
hooks.deregister();
