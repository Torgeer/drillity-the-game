import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createDrillSim } from '../src/sim/drilling.js';
import { createBus, EVENTS } from '../src/core/contract.js';
import { buildTool } from '../src/rig/tools.js';

function setup(){
  const bus=createBus(), completed=[];
  bus.on(EVENTS.HOLE_COMPLETE,p=>completed.push(p));
  const sim=createDrillSim({bus});sim.init();
  sim.startHole({methodId:'jet-grouting',targetDepth:5,seed:12,ground:['clay']});
  return {sim,completed};
}
for(const stopped of ['flush','rotation']) {
  const {sim,completed}=setup();
  for(let i=0;i<6000 && sim.getTelemetry().stage===0;i++) {
    sim.setInput('feed',.45);sim.setInput('rotation',.55);sim.setInput('flush',.8);
    sim.debug.stepFixed(1);
  }
  assert.equal(sim.getTelemetry().stageId,'jet-and-lift');
  assert.equal(completed.length,0,'Reaching depth must not settle the column');
  sim.setInput('feed',.45);sim.setInput(stopped,0);
  sim.debug.simulate(8);
  const held=sim.getTelemetry().stageProgress;
  sim.debug.simulate(5);
  assert(Math.abs(sim.getTelemetry().stageProgress-held)<.001,`No treatment without ${stopped}`);
  sim.debug.simulate(600,()=>({feed:.45,rotation:.55,flush:.8}));
  assert.equal(completed.length,1,'Only the completed return pass pays');
  assert.equal(sim.getTelemetry().actionDepth,0);
  assert.equal(sim.getTelemetry().phase,'complete');
  sim.dispose();
}
const monitor=buildTool(THREE,{},'jet-monitor');
assert.equal(monitor.name,'jet-grout-monitor','Monitor builder must not fall back to billet');
const bounds=new THREE.Box3().setFromObject(monitor);
assert(bounds.max.y-bounds.min.y>.4 && bounds.max.y-bounds.min.y<.7);
monitor.traverse(o=>{if(o.isMesh)assert([...o.geometry.attributes.position.array].every(Number.isFinite))});
const snapshots=[];
for(const fps of [30,120]) {
  const {sim}=setup();
  sim.setInput('feed',.45);sim.setInput('rotation',.55);sim.setInput('flush',.8);
  for(let i=0;i<fps*30;i++)sim.update(1/fps);
  const t=sim.getTelemetry();snapshots.push([t.depth,t.stageProgress,t.wear]);sim.dispose();
}
snapshots[0].forEach((v,i)=>assert(Math.abs(v-snapshots[1][i])<.001));
console.log('OK jet grouting: two phases, flow/rotation gates, completion at surface, monitor geometry');

function treatmentRun(depth, ground, feed) {
  const sim=createDrillSim();
  sim.startHole({methodId:'jet-grouting',targetDepth:depth,seed:12,ground:[ground]});
  sim.debug.simulate(3600,t=>{
    if(t.jam.state!=='free' && t.jam.rescue.goodNow)sim.pulse('jamRescue');
    if(t.rodAdd && t.rodAdd.t>=t.rodAdd.windowStart && t.rodAdd.t<=t.rodAdd.windowEnd)sim.pulse('rodStab');
    return {feed:t.jam.state==='free'?feed:.08,rotation:.55,flush:.85};
  });
  const t=sim.getTelemetry();
  assert.equal(t.phase,'complete',`${ground} ${depth}m must finish`);
  assert.equal(t.actionDepth,0);
  assert(t.score.weights.quality>=.5,'Treatment must materially affect the grade');
  sim.dispose();return t;
}
for(const depth of [5,20,60])treatmentRun(depth,'clay',.4);
const rushed=treatmentRun(5,'clay',.65);
const careful=treatmentRun(5,'clay',.4);
const sand=treatmentRun(5,'sand',.65);
assert(careful.score.quality.score>rushed.score.quality.score,'Excessive withdrawal must lower quality');
assert(sand.score.quality.score>rushed.score.quality.score,'Same delivery must treat sand more readily than clay');
console.log('OK jet treatment: 5/20/60m completion, soil response, withdrawal penalty, quality-weighted grade');
