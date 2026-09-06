/** Explicit attachment-line diagnostic; deliberately red until authoring is fixed.
 * No machine dimensions are calculated here: use glbinfo.mjs for those.
 * THREE_ROOT optionally selects the existing read-only dependency directory.
 *
 * PROVENANCE, 2026-09-06. This is Codex's fixture from the private worktree
 * `C:/Users/henri/Downloads/threads/drillity-rc-axis/tools/check_rc_axis.mjs`,
 * committed here because `blender/rc_rig.py` and `research/rigs/rc-axis-repair.md`
 * both cited it as the pass/fail gate for the working-axis repair while it did
 * not exist in this repository — a headline verification nobody could re-run.
 *
 * THE MEASUREMENT LOGIC IS UNMODIFIED. Two adaptations, both about where files
 * live and neither touching what is measured or the 1e-5 m tolerance. `diff`
 * against the original shows exactly these and this comment block:
 *   1. `dep` defaults to THIS repo's `node_modules/three` instead of
 *      `drillity-the-game`'s, so the gate runs in-tree. THREE_ROOT still wins.
 *   2. the `evidence/` output directory is created if absent (the added
 *      `mkdirSync` import and the three-line write), because that directory is
 *      part of the worktree this file came from and not of this repository.
 * Codex's own note anticipated exactly this: "integration candidates are only
 * the new diagnostic fixtures/report after adapting dependency paths".
 *
 *   node tools/check_rc_axis.mjs public/models/rc-rig.glb    # exits 0 when aligned
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {parseGLB} from './glbinfo.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dep=process.env.THREE_ROOT || resolve(root,'node_modules/three');
const THREE=await import(pathToFileURL(resolve(dep,'build/three.module.js')));
const {GLTFLoader}=await import(pathToFileURL(resolve(dep,'examples/jsm/loaders/GLTFLoader.js')));
const path=resolve(process.argv[2] || resolve(root,'evidence/baseline.glb'));
const bytes=readFileSync(path);
const {json}=parseGLB(bytes);
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const scene=gltf.scene;
// GLTFLoader sanitizes punctuation in Object3D.name. Bind original exported
// names through parser associations, as the production loader must do.
const byName={}; scene.traverse(o=>{const i=gltf.parser.associations.get(o)?.nodes; if(i!==undefined) byName[json.nodes[i].name]=o;});
for(const n of ['mount:hole','aim:hole','mount:tool','pivot:spindle','pivot:head-swing','slide:carriage','pivot:mast']) assert.ok(byName[n],`missing ${n}`);
const car=byName['slide:carriage'];
assert.equal(car.userData.travel_space,'parent-local');
assert.equal(car.userData.travel_axis,'y');
assert.equal(car.userData.travel_direction,'min');
const frames=[];
for(const value of [car.userData.travel_min_m,car.position.y,car.userData.travel_max_m]){
  car.position.y=value; scene.updateMatrixWorld(true);
  const hole=byName['mount:hole'].getWorldPosition(new THREE.Vector3());
  const aim=byName['aim:hole'].getWorldPosition(new THREE.Vector3());
  const tool=byName['mount:tool'].getWorldPosition(new THREE.Vector3());
  const axis=aim.sub(hole).normalize(), delta=tool.clone().sub(hole);
  const miss=delta.clone().addScaledVector(axis,-delta.dot(axis)).length();
  frames.push({parentY:value,hole:hole.toArray(),tool:tool.toArray(),perpendicularM:miss});
}
const primitives=json.nodes.reduce((sum,n)=>sum+(n.mesh===undefined?0:json.meshes[n.mesh].primitives.length),0);
assert.ok(primitives<=70,'primitive floor over budget');
for(const m of json.materials||[]) assert.equal(m.extensions?.KHR_materials_transmission?.transmissionFactor||0,0,'nonzero transmission');
// Ray/triangle queries establish actual intervening geometry, not dimensions.
// Start on the declared ground point but use the spindle's horizontal axis.
const low=frames[0], ray=new THREE.Raycaster(new THREE.Vector3(low.tool[0],low.hole[1],low.tool[2]),new THREE.Vector3(0,1,0),0,low.tool[1]-low.hole[1]);
const obstructingHits=ray.intersectObject(scene,true).map(h=>({mesh:h.object.name,point:h.point.toArray()}));
const result={asset:path,sha256:createHash('sha256').update(bytes).digest('hex'),primitives,frames,obstructingHitsBelowLowestTool:obstructingHits,passed:frames.every(f=>f.perpendicularM<1e-5)&&obstructingHits.length===0,toleranceM:1e-5,toleranceBasis:'NOT SOURCED numeric transform tolerance, not a physical allowance'};
const out=resolve(root,'evidence/export-axis.json');
mkdirSync(dirname(out),{recursive:true});
writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
process.exitCode=result.passed?0:1;
