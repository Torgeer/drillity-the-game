/** Metadata-only sonic correction: actual exports + real CPU loader consumer.
 * No browser, renderer, GPU, network, public-model writes or second ruler.
 */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import * as THREE from 'three';
import {createGltfRigs} from '../src/core/gltfRig.js';
import {parseGLB, measure} from './glbinfo.mjs';

const base=resolve('.rig-corrections/sonic');
const expected={
  'feed-work-light':60,'crown-work-light':60,
  'deck-work-light-l':50,'deck-work-light-r':50,'collar-work-light':50,
};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function read(label) {
  const bytes=readFileSync(resolve(base,label+'.glb'));
  const identity=JSON.parse(readFileSync(resolve(base,label+'-identity.json')));
  assert.equal(sha(bytes),identity.export_sha256);
  assert.equal(sha(readFileSync(resolve(base,label+'-source.py'))),identity.source_sha256);
  const {json:g,bin}=parseGLB(bytes);
  const bounds=measure(g,bin);
  assert.equal(bounds.empty,false);
  assert.deepEqual(bounds.unreadable,[]);
  return {bytes,g,bin,bounds,identity};
}
const before=read('before'),after=read('after');
assert.equal(before.identity.shared_rig_sha256,after.identity.shared_rig_sha256);
assert.deepEqual(before.identity.shared_libraries_sha256,after.identity.shared_libraries_sha256);
for (const data of [before,after]) {
  assert.equal(sha(readFileSync(data.identity.source)),data.identity.source_sha256,
    'current input source no longer matches export');
  for (const [path,hash] of Object.entries(data.identity.shared_libraries_sha256)) {
    assert.equal(sha(readFileSync(resolve(path))),hash,'shared input no longer matches export');
  }
}
assert.deepEqual(before.bounds,after.bounds,'all actual-vertex bounds changed');
function compareAttributes(before,after,uvLimit) {
const drift=[];
for (let mi=0;mi<before.g.meshes.length;mi++) {
  for (let pi=0;pi<before.g.meshes[mi].primitives.length;pi++) {
    const oldPrimitive=before.g.meshes[mi].primitives[pi];
    const newPrimitive=after.g.meshes[mi].primitives[pi];
    for (const [semantic,accessorIndex] of Object.entries({...oldPrimitive.attributes,INDICES:oldPrimitive.indices})) {
      const aa=before.g.accessors[accessorIndex];
      const ba=after.g.accessors[semantic==='INDICES'?newPrimitive.indices:newPrimitive.attributes[semantic]];
      const av=before.g.bufferViews[aa.bufferView],bv=after.g.bufferViews[ba.bufferView];
      assert.deepEqual(aa,ba);assert.deepEqual(av,bv);
      const oldBytes=before.bin.subarray(av.byteOffset??0,(av.byteOffset??0)+av.byteLength);
      const newBytes=after.bin.subarray(bv.byteOffset??0,(bv.byteOffset??0)+bv.byteLength);
      if (oldBytes.equals(newBytes)) continue;
      assert.equal(semantic,'TEXCOORD_0','POSITION/NORMAL/topology/other attributes must match exactly');
      assert.equal(aa.componentType,5126,'integer topology changed');
      assert.equal(aa.type,'VEC2');
      assert.equal(av.byteStride,undefined,'UV tolerance cannot cover interleaved shape data');
      assert.equal(av.byteLength,aa.count*8,'UV tolerance only covers the tight UV accessor');
      let count=0,max=0;
      for(let i=0;i<oldBytes.length;i+=4) {
        const oldValue=oldBytes.readFloatLE(i),newValue=newBytes.readFloatLE(i);
        assert.ok(Number.isFinite(oldValue)&&Number.isFinite(newValue),'UV values must be finite');
        const d=Math.abs(oldValue-newValue);
        if(d){count++;max=Math.max(max,d);}
      }
      drift.push({mesh:before.g.meshes[mi].name,semantic,count,max});
      assert.ok(max<=uvLimit,'UV drift exceeds the measured unchanged-source export variation');
    }
  }
}
return drift;
}
const uvDrift=compareAttributes(before,after,2**-24);
// The frozen optimized model and the freshly rebuilt frozen source provide
// an unchanged-source control for Blender's tiny UV export variation.
const controlBytes=readFileSync(resolve('.rig-corrections/before/models/sonic-truck.glb'));
const controlParsed=parseGLB(controlBytes);
const control={g:controlParsed.json,bin:controlParsed.bin};
assert.deepEqual(control.g,before.g,'unchanged-source control JSON changed');
// Measured unchanged input: Cube.001 alone reaches 2^-23; the fresh pair
// reaches only 2^-24. Keep POSITION/NORMAL/indices byte-exact in both gates.
const controlUvDrift=compareAttributes(control,before,2**-23);
assert.equal(sha(readFileSync(after.identity.source)),after.identity.source_sha256,'current source no longer matches final export');
const normalized=structuredClone(after.g);
const changed=[];
for (const node of normalized.nodes) {
  const name=node.name?.replace(/^mount:/,'');
  if (!node.name?.startsWith('mount:') || !(name in expected)) continue;
  assert.equal(node.extras.watt_hint,expected[name]);
  assert.equal(Object.hasOwn(node.extras,'watt_w'),false);
  node.extras.watt_w=node.extras.watt_hint;
  delete node.extras.watt_hint;
  changed.push(name);
}
assert.deepEqual(changed.sort(),Object.keys(expected).sort());
assert.deepEqual(before.g,normalized,'unexpected JSON/attachment/material/animation change');

// Exercise the shipping GLTFLoader, name restoration, node index and instance
// builder. Fetch is replaced only for this exact local fixture URL; no network.
const originalFetch=globalThis.fetch, originalDocument=globalThis.document;
globalThis.document={baseURI:'http://rigfix.invalid/'};
async function runtime(data) {
  const materials=new Map();
  const ctx={THREE,qs:new URLSearchParams('glb=strict'),assets:{
    material(name) {
      if (!materials.has(name)) materials.set(name,new THREE.MeshStandardMaterial({name}));
      return materials.get(name);
    },
  }};
  globalThis.fetch=async url=>{
    assert.equal(String(url),'http://rigfix.invalid/models/sonic-truck.glb');
    return new Response(data.bytes,{status:200});
  };
  const api=createGltfRigs(ctx);
  try {
    assert.equal(await api.load('sonic-truck'),true);
    assert.equal(api.has('sonic-truck'),true);
    const builder=api.builder('sonic-truck');
    assert.equal(typeof builder,'function');
    const instance=builder();
    instance.root.updateMatrixWorld(true);
    assert.equal(instance.dyn.workLights.length,5);
    return Object.fromEntries(instance.dyn.workLights.map(light=>[light.name,{
      wattHint:light.wattHint,
      mount:light.node.matrixWorld.elements.slice(),aim:light.aim.matrixWorld.elements.slice(),
      coneDeg:light.coneDeg,rangeM:light.rangeM,colourHex:light.colourHex,moves:light.moves,
    }]));
  } finally {
    api.dispose();
    for (const material of materials.values()) material.dispose();
  }
}
let oldLights,newLights;
try {oldLights=await runtime(before);newLights=await runtime(after);}
finally {globalThis.fetch=originalFetch;globalThis.document=originalDocument;}
const trims={};
for (const [name,hint] of Object.entries(expected)) {
  assert.equal(oldLights[name].wattHint,70,'baseline must reproduce the default-key failure');
  assert.equal(newLights[name].wattHint,hint,'shipping loader must read authored hint');
  const {wattHint:oldHint,...oldContract}=oldLights[name];
  const {wattHint:newHint,...newContract}=newLights[name];
  assert.deepEqual(oldContract,newContract,'runtime attachment/light contract changed');
  trims[name]={beforeHint:oldHint,afterHint:newHint,
    beforeTrim:THREE.MathUtils.clamp(oldHint/70,.45,1.6),
    afterTrim:THREE.MathUtils.clamp(newHint/70,.45,1.6)};
}
const report={ok:true,before:before.identity,after:after.identity,
  exactPositionNormalTopology:true,uvDrift,controlUvDrift,controlExportSha256:sha(controlBytes),
  exactAllBounds:true,onlyFiveLampExtraKeysChanged:true,
  actualShippingLoaderVerified:true,exactRuntimeLightTransformsAndOtherProperties:true,
  primitives:after.g.meshes.reduce((s,m)=>s+m.primitives.length,0),
  triangles:after.g.meshes.flatMap(m=>m.primitives).reduce((s,p)=>s+after.g.accessors[p.indices].count/3,0),
  nodes:after.g.nodes.length,trims,
  limits:'CPU loader/GLB proof. env.js trim ratios are arithmetic from its inspected expression, not a renderer test or sourced photometric wattage.'};
writeFileSync(resolve(base,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
