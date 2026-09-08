/** Independent atomic pile feed review. CPU only, no geometry dimensions.
 * node tools/checkpilefeed-adversarial.mjs
 * Synthetic depth/parent transforms are NOT SOURCED fixture inputs.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createGameState, createBus, EVENTS } from '../src/core/contract.js';
import { RIGS } from '../src/game/data.js';
const root = new URL('../', import.meta.url), paths = ['src/core/gltfRig.js','src/rig/rigFactory.js',
  'public/models/piling-leader.glb','blender/piling_leader.py','tools/checkpilefeed-adversarial.mjs'];
const hash = p => createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex');
const hashes = Object.fromEntries(paths.map(p=>[p,hash(p)]));
const bytes = readFileSync(new URL('public/models/piling-leader.glb',root));
const raw = JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
const carriageRaw = raw.nodes.find(n=>n.name==='slide:carriage'), rest = carriageRaw.translation[1];
const lo = rest+carriageRaw.extras.travel_lo_m, hi = rest+carriageRaw.extras.travel_hi_m;
const python = readFileSync(new URL('blender/piling_leader.py',root),'utf8');
assert.match(python,/ham\['travel_lo_m'\] = 1\.40 - HAMMER_BOT/);
assert.match(python,/ham\['travel_hi_m'\] = \(LEADER_TOP - 2\.60\) - HAMMER_L - HAMMER_BOT/);
const original = {fetch:globalThis.fetch,document:globalThis.document,info:console.info};
const mats = new Map(), assets = { material(name) { if(!mats.has(name)){const m=new THREE.MeshStandardMaterial();m.name=name;mats.set(name,m);}return mats.get(name);}};
let loader,system,servedBytes=bytes; const rows=[],mutations=[]; let checks=0;
const near=(a,b,label)=>{checks++;assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);};
try {
  globalThis.document={baseURI:'https://pile-feed-critic.invalid/'};
  globalThis.fetch=async value=>{assert.equal(new URL(value).pathname,'/models/piling-leader.glb');return new Response(servedBytes);};
  console.info=()=>{};
  const state=createGameState();state.garage.rigId='piling-leader';
  const bus=createBus(),scene=new THREE.Scene(),sectionScene=new THREE.Scene(),tip=new THREE.Object3D();sectionScene.add(tip);
  loader=createGltfRigs({THREE,assets,data:{RIGS},bus,qs:new URLSearchParams('glb=strict')});await loader.load('piling-leader');
  let built;
  system=createRigSystem({THREE,assets,data:{RIGS},state,bus,EVENTS,scene,sectionScene,quality:{id:'low'},
    qs:new URLSearchParams('glb=strict'),geology:{boreholeTip:tip,worldYForDepth:d=>-d,holeRadiusAt:()=>.15},
    gltfRigs:{...loader,builder(id){const fn=loader.builder(id);return(...a)=>{built=fn(...a);return built;};}}});
  system.setMethod('driven-pile');await system.init();assert.equal(system.getSpec().source,'glb');
  const carriage=built.root.getObjectByName('slide:carriage'),cap=built.root.getObjectByName('slide:drive-cap');
  const capRest=cap.position.clone(),rotation=carriage.quaternion.clone();
  const geometry=[];built.root.traverse(n=>{if(n.isMesh)geometry.push([n,n.geometry,n.parent]);});
  const drill={active:true,methodId:'driven-pile',programme:'driven-pile',phase:'drilling',rpm:.5,wob:.5,torque:.2,
    hammerPhase01:.5,hammerDropM:.6};
  for(const depth of [0,.12039552687581494,2.999,3,3.001,5,12,13.2,15,25]) {
    drill.depth=drill.actionDepth=depth;
    system.update(1/60,{drill});scene.updateMatrixWorld(true);
    const expected=Math.max(lo,Math.min(hi,rest-depth));
    near(carriage.position.y,expected,`continuous authored depth ${depth}`);
    near(carriage.position.x,carriageRaw.translation[0],'off-axis X');near(carriage.position.z,carriageRaw.translation[2],'off-axis Z');
    assert.ok(carriage.quaternion.equals(rotation),'carriage rest quaternion retained');
    assert.ok(cap.position.equals(capRest),'cap remains in authored local pose');
    for(const[n,g,p]of geometry){assert.equal(n.geometry,g);assert.equal(n.parent,p);}
    rows.push({depth,expected,observed:carriage.position.y,capWorldY:cap.getWorldPosition(new THREE.Vector3()).y});
  }
  drill.active=false;drill.depth=drill.actionDepth=0;system.update(1/60,{drill});
  near(carriage.position.y,rest,'inactive authored placement');
  for(const[name,patch]of [
    ['missing lower',{travel_lo_m:undefined}],['missing upper',{travel_hi_m:undefined}],
    ['string lower',{travel_lo_m:'-13.2'}],['null upper',{travel_hi_m:null}],
    ['reversed',{travel_lo_m:2,travel_hi_m:-2}],['rest below span',{travel_lo_m:1,travel_hi_m:2,travel_m:1}],
    ['rest above span',{travel_lo_m:-2,travel_hi_m:-1,travel_m:1}],['span mismatch',{travel_m:14}],
    ['wrong legacy axis',{axis:'y'}],['mixed contracts',{travel_axis:'y'}],
  ]) {
    const changed=structuredClone(raw),node=changed.nodes.find(n=>n.name==='slide:carriage');
    Object.assign(node.extras,patch);
    const data=Buffer.from(JSON.stringify(changed)),json=Buffer.alloc(Math.ceil(data.length/4)*4,0x20);data.copy(json);
    const oldSize=bytes.readUInt32LE(12),head=Buffer.from(bytes.subarray(0,20)),tail=bytes.subarray(20+oldSize);
    head.writeUInt32LE(20+json.length+tail.length,8);head.writeUInt32LE(json.length,12);servedBytes=Buffer.concat([head,json,tail]);
    const bad=createGltfRigs({THREE,assets,data:{RIGS},bus:createBus(),qs:new URLSearchParams('glb=strict')});
    try {await assert.rejects(bad.load('piling-leader'),/travel|piling/i);mutations.push(name);}finally{bad.dispose();servedBytes=bytes;}
  }
  for(const p of paths)assert.equal(hash(p),hashes[p],`source changed ${p}`);
  console.info=original.info;
  console.log(JSON.stringify({passed:true,hashes,checks,mutations,authored:{rest,lo,hi,offsets:carriageRaw.extras},rows,
    limits:'No GPU visibility or clearance approval; sibling pile penetration and ropes are not certified.'},null,2));
} finally {system?.dispose();loader?.dispose();for(const m of mats.values())m.dispose();Object.assign(globalThis,{fetch:original.fetch,document:original.document});console.info=original.info;}
