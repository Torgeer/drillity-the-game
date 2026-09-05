import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createRigSystem, RIG_IDS } from '../src/rig/rigFactory.js';
import { RIGS } from '../src/game/data.js';
import { createBus } from '../src/core/contract.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Read the export authority, not a second list of Blender-capable ids. */
export function blenderRigIds() {
  const source = readFileSync(resolve(ROOT, 'blender/build.py'), 'utf8');
  const list = /^MACHINES\s*=\s*\[([^\]]*)\]/m.exec(source);
  assert.ok(list, 'blender/build.py must publish a readable MACHINES list');
  const ids = [...list[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1].replaceAll('_', '-'));
  assert.ok(ids.length, 'The Blender export manifest must not be empty');
  return ids;
}

/** CPU regression of the real rig API with independently disposable fixture
 * meshes. Fixture dimensions are arbitrary test geometry, never machine facts.
 * Actual GLB parsing/rendering is verified separately in headed Chrome. */
export async function checkRigLoader() {
  let checks = 0;
  const expect = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
  const systems = [];
  const shared = new THREE.MeshStandardMaterial();
  let materialDisposals = 0;
  shared.addEventListener('dispose', () => materialDisposals++);
  const messages = [];
  const originalWarn = console.warn, originalError = console.error;
  console.warn = (...args) => messages.push(args.map(String).join(' '));
  console.error = (...args) => messages.push(args.map(String).join(' '));
  try {
    function setup({start = 'pd55', loaded = ['pd55', 'future-blender-rig', 'spec-only-rig'], strict = false, broken = []} = {}) {
      const ready = new Set(loaded), bad = new Set(broken), built = [];
      const ctx = { THREE, quality: {id:'low'}, qs: new URLSearchParams(strict ? 'glb=strict' : ''),
        data: {RIGS}, state: {garage:{rigId:start},settings:{}}, scene: new THREE.Scene(), bus:createBus(),
        gltfRigs: {
          has:id => ready.has(id), loaded:() => [...ready],
          builder(id) {
            if (bad.has(id)) return () => { throw new Error('Injected model build failure: '+id); };
            if (!ready.has(id)) return strict ? () => { throw new Error('Injected unavailable model: '+id); } : null;
            return () => {
              const root = new THREE.Group(); root.name = 'fixture:'+id;
              const geo = new THREE.BoxGeometry(1,1,1);
              const record = {id,root,geo,disposals:0};
              geo.addEventListener('dispose', () => record.disposals++);
              root.add(new THREE.Mesh(geo,shared)); built.push(record);
              return {root,dyn:{outriggers:[],hoses:[],weights:[],tracks:[],tooling:{auger:{}}},spec:{id,frameRadius:1}};
            };
          },
        },
      };
      const rig = createRigSystem(ctx); systems.push(rig);
      return {ctx,rig,ready,built};
    }
    const main = setup();
    expect(RIG_IDS.includes('pd55'), false, 'pd55 must exercise the GLB-only path, not an added procedural exception');
    await main.rig.init();
    expect(main.rig.getRigId(), 'pd55', 'Saved GLB-only garage must load its own machine');
    expect(main.rig.getSpec().source, 'glb', 'Saved garage source must be Blender');
    expect(main.rig.listRigs().includes('future-blender-rig'), true, 'Runtime rig list must include new loaded GLB ids');
    expect(main.rig.setRig('future-blender-rig'), true, 'setRig must accept a GLB-only id absent from procedural table');
    expect(main.rig.getSpec('spec-only-rig').id, 'spec-only-rig', 'getSpec must build an uncached GLB-only id');
    expect(main.rig.getRigId(), 'future-blender-rig', 'Inspecting another rig must preserve the active selection');
    const n = main.built.length;
    expect(main.rig.setRig('future-blender-rig'), true, 'Repeated selection remains valid');
    expect(main.built.length, n, 'Repeated selection must reuse the cached machine');
    const preview = main.rig.buildPreview('pd55');
    expect(preview.userData.spec.source, 'glb', 'Preview and game must select the same source');
    expect(preview.userData.spec.id, 'pd55', 'Preview must keep the requested GLB-only identity');
    const previewRecord = main.built.at(-1);
    expect(previewRecord.root === main.built[0].root, false, 'Preview must be an independent model instance');
    preview.userData.dispose(); preview.userData.dispose();
    expect(previewRecord.disposals, 1, 'Preview geometry must be disposed exactly once');
    expect(main.built[0].disposals, 0, 'Closing a preview must preserve game geometry');
    expect(materialDisposals, 0, 'Closing a preview must preserve shared materials');

    for (const broken of [[], ['crawler-lite']]) {
      const strict = setup({start:'crawler-lite',loaded:broken,strict:true,broken});
      await strict.rig.init();
      expect(strict.rig.getRigId(), null, 'Strict boot must not silently substitute a procedural rig');
      expect(strict.rig.setRig('crawler-lite'), false, 'Strict selection must refuse missing/broken GLB');
      expect(strict.rig.getSpec('crawler-lite'), null, 'Strict specs must not describe a substituted rig');
      expect(strict.rig.buildPreview('crawler-lite'), null, 'Strict preview must not substitute a procedural rig');
    }

    const strictSwitch = setup({start:'pd55',loaded:['pd55'],strict:true,broken:['crawler-lite']});
    await strictSwitch.rig.init();
    expect(strictSwitch.rig.setRig('crawler-lite'), false, 'Strict broken selection must report failure');
    expect(strictSwitch.rig.getRigId(), null, 'Strict failure must not leave an unrelated machine on screen');

    const brokenNormal = setup({start:'crawler-lite',loaded:['crawler-lite'],broken:['crawler-lite']});
    await brokenNormal.rig.init();
    expect(brokenNormal.rig.getSpec().source, 'procedural', 'Normal mode may fall back to the same machine procedural builder');
    expect(brokenNormal.rig.getSourceKey('crawler-lite'), 'glb:crawler-lite', 'Cache key describes the preferred attempt');
    expect(brokenNormal.rig.getActiveSourceKey(), 'procedural:crawler-lite', 'Active source must report the successful fallback, not the failed preferred source');

    const fallback = setup({start:'pd55',loaded:[]});
    await fallback.rig.init();
    expect(fallback.rig.getRigId(), 'pd55', 'A stand-in must preserve the selected garage identity');
    expect(fallback.rig.getSpec().id, RIGS.find(r=>r.id==='pd55').renderRigId, 'Only data.js can choose a stand-in');
    expect(fallback.rig.getSpec().source, 'procedural', 'Fallback source must be explicit');
    const previous = fallback.rig.group.children.find(g=>g.userData.requestedRigId==='pd55');
    let freed = 0;
    previous.traverse(o=>o.geometry?.addEventListener('dispose',()=>freed++));
    fallback.ready.add('pd55');
    fallback.ctx.bus.emit('rig:model-ready',{rigId:'pd55'});
    expect(fallback.rig.getRigId(), 'pd55', 'Loading the real machine must retain selection');
    expect(fallback.rig.getSpec().id, 'pd55', 'A late GLB must replace its cached stand-in');
    expect(fallback.rig.getSpec().source, 'glb', 'A late GLB must become the active source');
    expect(previous.parent, null, 'Replaced model must leave the scene');
    expect(freed > 0, true, 'Replaced model geometry must be disposed');
    const after = fallback.built.length;
    fallback.ctx.bus.emit('rig:model-ready',{rigId:'pd55'});
    expect(fallback.built.length, after, 'Repeated ready events must not rebuild the machine');
    expect(materialDisposals, 0, 'Source replacement must preserve shared materials');
    expect(messages.some(m=>m.includes('Injected model build failure')), true, 'Strict failure branch must actually execute');
    return {checks,expectedDiagnostics:messages.length,registeredBlenderRigs:blenderRigIds().length};
  } finally {
    for (const rig of systems) rig.dispose();
    shared.dispose();
    console.warn = originalWarn; console.error = originalError;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkRigLoader();
  console.log(`OK rig loader: ${result.checks} runtime assertions; ${result.registeredBlenderRigs} registered Blender rigs; ${result.expectedDiagnostics} injected/missing-model diagnostics observed.`);
}
