/** Compare fresh sonic exports using the existing actual-vertex ruler. */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {parseGLB, measure} from './glbinfo.mjs';

const [before, after, output, beforeProfile, afterProfile] = process.argv.slice(2);
assert.ok(before && after, 'usage: node tools/rigopt_sonic_verify.mjs before.glb after.glb [report.json]');
function inspect(path) {
  const bytes = readFileSync(path);
  const {json:g, bin} = parseGLB(bytes);
  const measurement = measure(g, bin);
  assert.equal(measurement.empty, false);
  assert.deepEqual(measurement.unreadable, []);
  const parents = new Map();
  g.nodes.forEach(node => (node.children || []).forEach(i => parents.set(i, node.name)));
  const nodes = g.nodes.map((node, i) => ({
    name: node.name, parent: parents.get(i) ?? null,
    translation: node.translation ?? [0, 0, 0],
    rotation: node.rotation ?? [0, 0, 0, 1],
    scale: node.scale ?? [1, 1, 1], matrix: node.matrix ?? null,
    extras: node.extras ?? {},
  })).sort((a,b) => a.name.localeCompare(b.name));
  const partitions = g.nodes.filter(n => n.mesh !== undefined).map(n => ({
    name:n.name, materials:g.meshes[n.mesh].primitives.map(p => g.materials[p.material].name).sort(),
  })).sort((a,b) => a.name.localeCompare(b.name));
  return {g, measurement, nodes, partitions, bytes:bytes.length,
    primitives:g.meshes.reduce((s,m) => s + m.primitives.length,0),
    triangles:g.meshes.flatMap(m => m.primitives).reduce((s,p) => s +
      (g.accessors[p.indices ?? p.attributes.POSITION].count / 3),0)};
}
const a=inspect(before), b=inspect(after);
assert.deepEqual(a.nodes,b.nodes,'all node transforms, parent relationships and extras must survive');
assert.deepEqual(a.partitions,b.partitions,'moving-assembly material partitions must survive');
for (const field of ['materials','animations','skins','textures','images']) {
  assert.deepEqual(a.g[field],b.g[field], `${field} changed`);
}
assert.equal(a.primitives,b.primitives);
assert.ok(b.triangles < a.triangles);
assert.ok(b.bytes < a.bytes);
const boundsDelta = (beforeBounds, afterBounds) => Math.max(...['min','max'].flatMap(key =>
  beforeBounds[key].map((v,i) => Math.abs(v - afterBounds[key][i]))));
assert.ok(boundsDelta(a.measurement.all,b.measurement.all) <= 1e-6,'overall actual-vertex bounds changed');
const parts = a.g.nodes.flatMap((node,i) => {
  const aa=a.measurement.sub[i], bb=b.measurement.sub[b.g.nodes.findIndex(n => n.name === node.name)];
  if (!aa || !Number.isFinite(aa.min[0])) return [];
  const delta=boundsDelta(aa,bb);
  assert.ok(delta <= .001,`subtree ${node.name} bounds changed by ${delta}`);
  return [{name:node.name, maxBoundsDeltaM:delta}];
});
const report={before:{primitives:a.primitives,triangles:a.triangles,bytes:a.bytes,bounds:a.measurement.all},
  after:{primitives:b.primitives,triangles:b.triangles,bytes:b.bytes,bounds:b.measurement.all},
  nodeCount:b.nodes.length,namedContractNodes:b.nodes.filter(n => /^(pivot|slide|mount|aim):/.test(n.name)).length,
  identicalNodeTransformsHierarchyExtras:true,identicalMaterialPartitions:true,
  identicalAnimations:true,parts,
  caveat:'Primitive counts and CPU visual comparisons are not rendered draw-call or GPU performance measurements.'};
if (beforeProfile || afterProfile) {
  assert.ok(beforeProfile && afterProfile,'both profiles are required');
  const oldParts=JSON.parse(readFileSync(beforeProfile,'utf8'));
  const newParts=JSON.parse(readFileSync(afterProfile,'utf8'));
  assert.deepEqual(oldParts.map(p=>p.name).sort(),newParts.map(p=>p.name).sort());
  const changed=[];
  for (const oldPart of oldParts) {
    const newPart=newParts.find(p=>p.name===oldPart.name);
    assert.deepEqual(oldPart.materials,newPart.materials);
    if (oldPart.curve) {
      const {bevel_resolution:oldResolution,...oldCurve}=oldPart.curve;
      const {bevel_resolution:newResolution,...newCurve}=newPart.curve;
      assert.deepEqual(oldCurve,newCurve,'hose radius/control points/handles/path samples changed');
      assert.equal(newResolution,['coil_hose','air_line'].includes(oldPart.name)?1:oldResolution);
    }
    if (oldPart.triangles!==newPart.triangles) {
      changed.push({name:oldPart.name,before:oldPart.triangles,after:newPart.triangles});
    }
  }
  assert.deepEqual(changed.map(p=>p.name).sort(),
    [...Array.from({length:9},(_,i)=>`xmem${i}`),'coil_hose','air_line'].sort());
  assert.equal(changed.reduce((sum,p)=>sum+p.before-p.after,0),a.triangles-b.triangles);
  report.changedParts=changed;
  report.identicalHosePathsAndRadii=true;
}
if (output) writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
