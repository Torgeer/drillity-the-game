/** Harness-only deterministic stepping. The production source is not edited. */
import assert from 'node:assert/strict';
export const frameNeedle = `function frame(now) {\n  requestAnimationFrame(frame);\n  let dt = (now - last) / 1000;`;
export const frameReplacement = `window.__NORDIC_STEP = dt => frame(last + dt * 1000, dt);\nwindow.__NORDIC_RESET_FRAME_ACCUMULATOR = () => { const before = { fpsAccum, fpsFrames }; fpsAccum = 0; fpsFrames = 0; return { before, after: { fpsAccum, fpsFrames } }; };\nfunction frame(now, manual = null) {\n  if (manual === null) requestAnimationFrame(frame);\n  if (!booting && manual === null && window.__NORDIC_HOLD) return;\n  let dt = manual === null ? (now - last) / 1000 : manual;`;
export function controlledMain(source) {
  const normalized = source.replaceAll('\r\n', '\n');
  assert.equal(normalized.split(frameNeedle).length, 2, 'Expected unique real frame entry');
  return normalized.replace(frameNeedle, frameReplacement);
}
export function differences(a, b, path = '') {
  if (Object.is(a, b)) return [];
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return [{path, before:a, after:b}];
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  return keys.flatMap(k => differences(a[k], b[k], path + '/' + k));
}
export function cameraErrors(a, b) {
  const out = {};
  for (const band of ['surface','section']) {
    for (const key of ['matrix','world','inverse','projection','projectionInverse']) {
      assert.equal(a[band][key].length, 16); assert.equal(b[band][key].length,16);
      out[band + '.' + key] = Math.max(...a[band][key].map((v,i)=>Math.abs(v-b[band][key][i])));
    }
    assert.deepEqual(a[band].lens, b[band].lens, band + ' lens differs');
  }
  return out;
}
export function assertCameras(a,b) {
  const errors=cameraErrors(a,b);
  assert(Object.values(errors).every(v=>Number.isFinite(v)&&v<1e-7),'Camera matrix differs');
  return errors;
}

/** Runs before any game script. Time seed is bookkeeping, not a simulation edit. */
export function initialize() {
  window.__NORDIC_HOLD=true;
  const RealDate=Date, epoch=Date.UTC(2026,8,8,12);
  window.Date=class extends RealDate {constructor(...a){super(...(a.length?a:[epoch]));}static now(){return epoch;}};
  let seed=20260908;
  Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}

/** All modifications below are camera/clock diagnostic controls, restored at close. */
export async function installControls({canonical=null, commonClock=null}) {
  const c=window.__DRILLITY, restores=[], clone=v=>v===undefined?null:JSON.parse(JSON.stringify(v));
  const T=await import('/node_modules/three/build/three.module.js');
  const cameraSnapshot=cam=>({type:cam.type,position:cam.position.toArray(),quaternion:cam.quaternion.toArray(),scale:cam.scale.toArray(),up:cam.up.toArray(),matrix:cam.matrix.toArray(),world:cam.matrixWorld.toArray(),inverse:cam.matrixWorldInverse.toArray(),projection:cam.projectionMatrix.toArray(),projectionInverse:cam.projectionMatrixInverse.toArray(),lens:Object.fromEntries(['fov','aspect','near','far','zoom','focus','filmGauge','filmOffset','left','right','top','bottom','view','coordinateSystem'].map(k=>[k,clone(cam[k])]))});
  const observed={surface:cameraSnapshot(c.camera),section:cameraSnapshot(c.sectionCamera)};
  const fixed=canonical||clone(observed), clock=commonClock||clone(c.clock);
  function restoreCamera(cam,s){
    cam.position.fromArray(s.position);cam.quaternion.fromArray(s.quaternion);cam.scale.fromArray(s.scale);cam.up.fromArray(s.up);
    for(const [k,v] of Object.entries(s.lens))if(v!==null)cam[k]=clone(v);
    cam.view=clone(s.lens.view);
    cam.matrix.fromArray(s.matrix);cam.matrixWorld.fromArray(s.world);cam.matrixWorldInverse.fromArray(s.inverse);cam.projectionMatrix.fromArray(s.projection);cam.projectionMatrixInverse.fromArray(s.projectionInverse);cam.matrixWorldNeedsUpdate=false;
  }
  for(const [cam,s] of [[c.camera,fixed.surface],[c.sectionCamera,fixed.section]]){
    for(const method of ['updateMatrixWorld','updateWorldMatrix','updateProjectionMatrix']){
      const original=cam[method];cam[method]=function(){restoreCamera(this,s);};restores.push(()=>{cam[method]=original;});
    }
    restoreCamera(cam,s);
  }
  const observations=[];
  const originalGLRender=c.renderer.gl.render;
  c.renderer.gl.render=function(scene,cam){
    if(cam===c.camera||cam===c.sectionCamera){
      const band=cam===c.camera?'surface':'section', before=cameraSnapshot(cam);
      observations.push({band,scene:scene.name||scene.type,overrideMaterial:scene.overrideMaterial?.name||scene.overrideMaterial?.type||null,camera:before});
      if(observations.length>64)observations.shift();
    }
    return originalGLRender.apply(this,arguments);
  };restores.push(()=>{c.renderer.gl.render=originalGLRender;});
  // Automatic game frames are already held by the recorded main.js hook.
  // Manual dt=0 frames retain the real update/render pipeline and clock.
  const step=()=>{Object.assign(c.clock,clock);window.__NORDIC_STEP(0);Object.assign(c.clock,clock);};
  const sha=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
  const hashArray=async a=>{if(!a)return null;const bytes=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);return {type:a.constructor.name,length:a.length,sha256:await sha(bytes)};};
  async function sceneSnapshot(){
    const hashes=new WeakMap();
    const objects=[],geometries=[],materials=[],textures=[],resources={geometry:new Map(),material:new Map(),texture:new Map(),imageSource:new Map()},uuidBookkeeping=[],objectPaths=new Map();
    const indexObjects=(o,path)=>{objectPaths.set(o,path);o.children.forEach((child,i)=>indexObjects(child,path+'/'+i));};indexObjects(c.scene,'surface');indexObjects(c.sectionScene,'section');
    async function value(v,path='value',seen=new WeakMap()){
      if(v===undefined)return {undefined:true};if(v===null||['string','number','boolean'].includes(typeof v))return v;
      if(typeof v==='function')return {function:String(v)};
      if(v.isTexture)return {texture:await texture(v)};
      if(v.isObject3D)return {objectPath:objectPaths.get(v)||null,type:v.type,name:v.name};
      if(v.isColor||v.isVector2||v.isVector3||v.isVector4||v.isQuaternion||v.isMatrix3||v.isMatrix4)return {type:v.constructor.name,value:v.toArray()};
      if(ArrayBuffer.isView(v))return {typedArray:await hashArray(v)};
      if(seen.has(v))return {cycleReference:seen.get(v)};seen.set(v,path);
      if(Array.isArray(v))return Promise.all(v.map((x,i)=>value(x,path+'/'+i,seen)));
      const row={};for(const k of Object.keys(v).sort())row[k]=await value(v[k],path+'/'+k,seen);return row;
    }
    async function texture(t){
      if(resources.texture.has(t))return resources.texture.get(t);const id=textures.length;resources.texture.set(t,id);textures.push(null);uuidBookkeeping.push({kind:'texture',id,uuid:t.uuid});
      let image=t.image,content=null;
      if(image?.data)content=await hashArray(image.data);
      else if(Array.isArray(image))content=await Promise.all(image.map(async im=>im?.data?hashArray(im.data):{width:im?.width,height:im?.height,src:im?.src||null}));
      else if(image instanceof HTMLImageElement||image instanceof HTMLCanvasElement||typeof ImageBitmap!=='undefined'&&image instanceof ImageBitmap){
        if(!hashes.has(image)){const canvas=document.createElement('canvas');canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);hashes.set(image,await hashArray(ctx.getImageData(0,0,canvas.width,canvas.height).data));}content=hashes.get(image);
      }else content={kind:t.isRenderTargetTexture?'GPU-render-target':'image-descriptor',width:image?.width||null,height:image?.height||null,depth:image?.depth||null};
      const props={};for(const k of Object.keys(t).sort()){if(['id','uuid','image','source','mipmaps','version','_listeners'].includes(k))continue;props[k]=await value(t[k],'texture/'+id+'/'+k);}
      if(t.source&&!resources.imageSource.has(t.source)){const sourceId=resources.imageSource.size;resources.imageSource.set(t.source,sourceId);uuidBookkeeping.push({kind:'imageSource',id:sourceId,uuid:t.source.uuid});}
      textures[id]={id,imageSource:t.source?resources.imageSource.get(t.source):null,props,content,mipmaps:await Promise.all((t.mipmaps||[]).map(async m=>({width:m.width,height:m.height,data:await hashArray(m.data)})))};return id;
    }
    async function material(m){
      if(resources.material.has(m))return resources.material.get(m);const id=materials.length;resources.material.set(m,id);materials.push(null);uuidBookkeeping.push({kind:'material',id,uuid:m.uuid});
      const props={},maps={},uniforms={};
      for(const k of Object.keys(m).sort()){
        if(['id','uuid','version','_listeners','uniforms','userData'].includes(k))continue;
        if(m[k]?.isTexture){maps[k]=await texture(m[k]);continue;}
        props[k]=await value(m[k],'material/'+id+'/'+k);
      }
      for(const [k,u] of Object.entries(m.uniforms||{}))uniforms[k]=await value(u.value,'material/'+id+'/uniforms/'+k);
      materials[id]={id,props,maps,uniforms,userData:clone(m.userData)};return id;
    }
    async function geometry(g){
      if(resources.geometry.has(g))return resources.geometry.get(g);const id=geometries.length;resources.geometry.set(g,id);geometries.push(null);uuidBookkeeping.push({kind:'geometry',id,uuid:g.uuid});
      const attrs={};for(const [k,a] of Object.entries(g.attributes))attrs[k]={itemSize:a.itemSize,normalized:a.normalized,count:a.count,array:await hashArray(a.array||a.data?.array),offset:a.offset??null,stride:a.data?.stride??null};
      const morph={};for(const [k,a] of Object.entries(g.morphAttributes))morph[k]=await Promise.all(a.map(v=>hashArray(v.array)));
      geometries[id]={id,type:g.type,name:g.name,attributes:attrs,index:await hashArray(g.index?.array),morph,groups:clone(g.groups),drawRange:clone(g.drawRange),boundingBox:g.boundingBox?{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()}:null,boundingSphere:g.boundingSphere?{center:g.boundingSphere.center.toArray(),radius:g.boundingSphere.radius}:null};return id;
    }
    async function visit(o,path){
      uuidBookkeeping.push({kind:'object',path,uuid:o.uuid});
      const row={path,name:o.name,type:o.type,parent:path.includes('/')?path.slice(0,path.lastIndexOf('/')):null,visible:o.visible,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),matrix:o.matrix.toArray(),world:o.matrixWorld.toArray(),layers:o.layers.mask,castShadow:o.castShadow,receiveShadow:o.receiveShadow,frustumCulled:o.frustumCulled,renderOrder:o.renderOrder,userData:clone(o.userData),geometry:o.geometry?await geometry(o.geometry):null,materials:o.material?await Promise.all((Array.isArray(o.material)?o.material:[o.material]).map(material)):[],instanceMatrix:o.instanceMatrix?await hashArray(o.instanceMatrix.array):null,instanceColor:o.instanceColor?await hashArray(o.instanceColor.array):null,count:o.count??null,morphTargetInfluences:clone(o.morphTargetInfluences)};
      if(o.isLight)row.light={color:o.color.toArray(),intensity:o.intensity,groundColor:o.groundColor?.toArray()||null,target:o.target?.position.toArray()||null,distance:o.distance??null,decay:o.decay??null,angle:o.angle??null,penumbra:o.penumbra??null};
      if(o.isScene)row.scene={background:await value(o.background,path+'/background'),environment:await value(o.environment,path+'/environment'),environmentIntensity:o.environmentIntensity,environmentRotation:await value(o.environmentRotation),backgroundIntensity:o.backgroundIntensity,backgroundBlurriness:o.backgroundBlurriness,backgroundRotation:await value(o.backgroundRotation),fog:o.fog?{type:o.fog.isFogExp2?'FogExp2':'Fog',color:o.fog.color.toArray(),density:o.fog.density??null,near:o.fog.near??null,far:o.fog.far??null}:null,overrideMaterial:o.overrideMaterial?await material(o.overrideMaterial):null};
      objects.push(row);for(let i=0;i<o.children.length;i++)await visit(o.children[i],path+'/'+i);
    }
    await visit(c.scene,'surface');await visit(c.sectionScene,'section');
    return {objects,geometries,materials,textures,uuidBookkeeping,scope:{excludedBookkeeping:['object.uuid','geometry.uuid','material.id','material.uuid','material.version','material._listeners','texture.id','texture.uuid','texture.version','texture._listeners','texture.source.uuid'],gpuTextureContent:'GPU render-target textures carry dimensions and canonical source/sharing descriptors; their texels are not read back. Full file hashes, shader inputs, scene environment controls and matched stills supply the bounded evidence.'}};
  }
  async function snapshot(){
    const gl=c.renderer.gl.getContext();
    const glass=[];c.rig.group.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];if(!ms.some(m=>/glass/i.test(m.name)))return;const box=new T.Box3().setFromObject(o),center=box.getCenter(new T.Vector3()),ndc=center.clone().project(c.camera),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(ndc.x,ndc.y),c.camera);const hits=ray.intersectObjects(c.scene.children,true).filter(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;});glass.push({name:o.name,center:center.toArray(),box:{min:box.min.toArray(),max:box.max.toArray()},distance:center.distanceTo(c.camera.position),ndc:ndc.toArray(),centerInsideBand:Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&Math.abs(ndc.z)<=1,firstRayHit:hits[0]?{name:hits[0].object.name,distance:hits[0].distance,target:hits[0].object===o}:null,materialNames:ms.map(m=>m.name)});});
    const scene=await sceneSnapshot();
    return {cameras:{surface:cameraSnapshot(c.camera),section:cameraSnapshot(c.sectionCamera)},state:clone(c.state),simulation:clone(c.sim.debug.state),clock:clone(c.clock),vfx:{stats:clone(c.vfx.stats(true)),wind:c.vfx.getWind().toArray()},scene,glass,rig:clone(c.rig.getSpec()),cameraMode:c.renderer.cameraMode,screen:c.ui.currentScene,site:clone(c.terrain.siteModel),archetype:c.terrain.archetype,viewport:clone(c.viewport),bands:clone(c.renderer.bands),bandsRect:clone(c.renderer.bandsRect),chrome:clone(c.renderer.chrome),quality:clone(c.quality),dpr:c.renderer.gl.getPixelRatio(),buffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],assets:clone(c.assets.stats()),env:{region:c.env.regionId,weather:c.env.weather,timeOfDay:c.env.timeOfDay,underground:c.env.undergroundId,exposure:c.renderer.exposure,sun:c.env.sun.intensity,hemi:c.env.hemi.intensity},fog:{color:c.scene.fog.color.toArray(),density:c.scene.fog.density},observations:clone(observations),visible:document.visibilityState,focused:document.hasFocus(),contextLost:gl.isContextLost()};
  }
  window.__NORDIC={step,snapshot,cameras:()=>({surface:cameraSnapshot(c.camera),section:cameraSnapshot(c.sectionCamera)}),cleanup(){for(const restore of restores.reverse())restore();}};
  return {observed,fixed,clock};
}
