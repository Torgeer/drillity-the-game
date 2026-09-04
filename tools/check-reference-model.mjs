import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createGameState } from '../src/core/contract.js';

const bytes=await readFile(new URL('../src/rig/models/compact-rotary-head.glb',import.meta.url));
const model=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const spindle=model.scene.getObjectByName('spindle');
const outlet=model.scene.getObjectByName('tool-out');
assert(spindle && outlet,'Blender export must preserve both animation anchors');
model.scene.updateMatrixWorld(true);
const p=outlet.getWorldPosition(new THREE.Vector3());
assert(Math.abs(p.x)<1e-5 && Math.abs(p.z)<1e-5,'Tool outlet must lie on the drill axis');
assert(Math.abs(p.y+.775)<1e-5,'Blender metres and Y-up conversion must be preserved');
let tris=0;
model.scene.traverse(o=>{if(o.isMesh){tris+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
assert([...o.geometry.attributes.position.array].every(Number.isFinite),'Mesh vertices must be finite')}});
assert(tris<10000,'Compact head triangle budget exceeded');

const mastBytes=await readFile(new URL('../src/rig/models/compact-feed-mast.glb',import.meta.url));
const mast=await new GLTFLoader().parseAsync(mastBytes.buffer.slice(mastBytes.byteOffset,mastBytes.byteOffset+mastBytes.byteLength),'');
assert(mast.scene.getObjectByName('mast-lower'));
assert(Math.abs(mast.scene.getObjectByName('mast-upper').position.y-2.1)<1e-5);
const bounds=new THREE.Box3().setFromObject(mast.scene);
assert(bounds.max.y>4.1 && bounds.max.y<4.4,'Mast must retain metre scale');
for(const quality of ['high','low']) {
  const ctx={THREE,quality:{id:quality},state:createGameState(),scene:new THREE.Scene(),rigModels:{compactRotary:model.scene.clone(true),compactMast:mast.scene.clone(true)}};
  const rig=createRigSystem(ctx);await rig.init();
  const count=()=>{let n=0;rig.group.traverse(()=>n++);return n};
  rig.setMethod('auger');const baseline=count();
  for(let i=0;i<5;i++) {
    rig.setMethod('top-hammer');rig.update(.016,ctx.state);
    const drifter=rig.group.getObjectByName('drifter');assert(drifter.visible);
    rig.setMethod('auger');rig.update(.016,ctx.state);assert(!drifter.visible);
    assert.equal(count(),baseline,'Repeated method changes must not accumulate tool nodes');
  }
  assert.equal(!!rig.group.getObjectByName('blender-mast-lower'),quality==='high');
  const blender=rig.group.getObjectByName('blender-compact-rotary');
  assert.equal(!!blender,quality==='high','LOW must use the lightweight procedural module');
  if(blender)assert(blender.getObjectByName('spindle').userData.dynamic,'Spindle must survive static merging');
  console.log(`OK ${quality}: method switching, animation anchors, node lifetime`);
  // Materials on templates are shared; do not dispose this shared test fixture mid-loop.
}
console.log(`OK GLB: ${tris} triangles, ${bytes.length} bytes, outlet ${p.toArray()}`);
