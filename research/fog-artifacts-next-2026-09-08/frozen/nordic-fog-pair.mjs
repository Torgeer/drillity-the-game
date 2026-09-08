/** Narrow, source-owned cross-context classifications; raw snapshots stay intact. */
import assert from 'node:assert/strict';
import {assertCameras,differences} from './nordic-fog-controls.mjs';
export function classifyPair(a,b,region){
  const cameraErrors=assertCameras(a.cameras,b.cameras),allowed=[],unexpected=[];
  const telemetry=new Set(['/assets/slices/count','/assets/slices/maxMs','/assets/slices/avgMs','/assets/slices/overFrameBudget','/rig/glb/fetchMs','/rig/glb/parseMs']);
  for(let i=0;i<a.scene.objects.length;i++){
    const o=a.scene.objects[i];if(o.userData?.spec?.source==='glb')for(const field of ['fetchMs','parseMs'])if(typeof o.userData.spec.glb?.[field]==='number')telemetry.add('/scene/objects/'+i+'/userData/spec/glb/'+field);
  }
  const far=a.scene.objects.find(o=>o.name==='far-field'),farB=b.scene.objects.find(o=>o.name==='far-field');assert(far&&farB);assert.equal(far.geometry,farB.geometry);
  const intended=new Set(['/fog/density','/scene/objects/0/scene/fog/density','/scene/geometries/'+far.geometry+'/attributes/color/array/sha256']);
  for(let i=0;i<3;i++){intended.add('/fog/color/'+i);intended.add('/scene/objects/0/scene/fog/color/'+i);}
  for(let i=0;i<a.scene.materials.length;i++)if(a.scene.materials[i].uniforms.uHorizonCol)for(let k=0;k<3;k++)intended.add('/scene/materials/'+i+'/uniforms/uHorizonCol/value/'+k);
  // sim/vfx.js syncBand copies these exact surface FogExp2 inputs. No wind,
  // particle geometry, additive target color or section inputs are exempted.
  for(const name of ['vfx:surfaceSoft','vfx:surfaceAdd']){
    const aa=a.scene.objects.filter(o=>o.name===name),bb=b.scene.objects.filter(o=>o.name===name);assert.equal(aa.length,1,name+' unique baseline owner');assert.equal(bb.length,1,name+' unique candidate owner');const ao=aa[0],bo=bb[0];assert(ao.path.startsWith('surface/')&&bo.path===ao.path);assert.equal(ao.materials.length,1);assert.deepEqual(bo.materials,ao.materials);
    const id=ao.materials[0];for(const s of [a,b]){const u=s.scene.materials[id].uniforms;assert.equal(u.uFogMode,2,name+' must read FogExp2');assert.equal(u.uFogDensity,s.fog.density,name+' density must equal actual scene fog');assert.deepEqual(u.uFogTarget.value,name==='vfx:surfaceSoft'?s.fog.color:[0,0,0],name+' target must equal authored source input');}
    intended.add('/scene/materials/'+id+'/uniforms/uFogDensity');if(name==='vfx:surfaceSoft')for(let k=0;k<3;k++)intended.add('/scene/materials/'+id+'/uniforms/uFogTarget/value/'+k);
  }
  for(const d of differences(a,b)){
    const uuid=d.path.startsWith('/scene/uuidBookkeeping/')&&d.path.endsWith('/uuid');
    if(uuid)allowed.push({...d,reason:'Recorded raw UUID bookkeeping; canonical resource sharing topology is compared'});
    else if(telemetry.has(d.path)){for(const v of [d.before,d.after]){assert(typeof v==='number'&&Number.isFinite(v)&&v>=0,'Invalid telemetry value '+d.path);if(['/assets/slices/count','/assets/slices/overFrameBudget'].includes(d.path))assert(Number.isInteger(v),'Noninteger telemetry counter '+d.path);}allowed.push({...d,reason:'Exact measured loading/scheduling telemetry field; source assets.js stats or gltfRig.js fetch/parse timing; raw values retained'});}
    else if(region==='nordic'&&intended.has(d.path))allowed.push({...d,reason:'Exact intended fog output, far-field color, cloud horizon or surface VFX fog input; ownership and solver equality checked'});
    else unexpected.push(d);
  }
  return {cameraErrors,allowed,unexpected,valid:unexpected.length===0,declaredTelemetryPaths:[...telemetry].sort(),declaredFogPaths:[...intended].sort()};
}
