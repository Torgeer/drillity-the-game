import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { warmSectionInstrumentPrograms } from '../src/core/renderer.js';

let checks = 0;
const check = (value, message) => { checks++; assert.ok(value, message); };
const source = readFileSync(new URL('../src/core/renderer.js', import.meta.url), 'utf8');
// Run the actual closure body with recording dependencies. WebGLRenderer itself
// is not constructed, so this proves queuing/state behavior, not GPU linking.
const start = source.indexOf('  function warmPost(programs) {');
const end = source.indexOf('\n  /**', start);
check(start >= 0 && end > start, 'Production warmPost body located');
const warmPostFactory = new Function('composer', 'postOK', 'gl', 'sectionScene',
  'sectionCamera', 'ctx', 'instrumentTarget', 'instrumentPass', 'warmQuadCam',
  'compilePrograms', 'warmSectionInstrumentPrograms', 'warnOnce',
  `${source.slice(start, end)}; return warmPost;`);

for (const failure of [null, 'hdr-bind', 'instrument-compile', 'screen-bind', 'composite-compile']) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(); camera.layers.mask = 5;
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const world = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial());
  const instrument = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial());
  instrument.layers.set(1); scene.add(world, instrument);
  const hidden = new THREE.Group(); hidden.visible = false;
  const hiddenInstrument = instrument.clone(); hidden.add(hiddenInstrument); scene.add(hidden);
  const background = new THREE.Color('#123456'), override = new THREE.MeshNormalMaterial();
  scene.background = background; scene.overrideMaterial = override;
  const material = new THREE.ShaderMaterial();
  const pass = new ShaderPass(material); pass.renderToScreen = false;
  const heldMaterial = new THREE.MeshBasicMaterial(); pass.fsQuad.material = heldMaterial;
  const target = { texture: { name: 'instrument-hdr' } }, previousTarget = { name: 'composer-hdr' };
  let currentTarget = previousTarget;
  const calls = [], programs = new Set();
  const renderer = { shadowMap: { enabled: true }, getRenderTarget: () => currentTarget,
    setRenderTarget(t) {
      currentTarget = t;
      if ((failure === 'hdr-bind' && t === target) || (failure === 'screen-bind' && t === null))
        throw new Error(failure);
    }
  };
  const compile = (root, cam, set, targetScene) => {
    check(set === programs, 'Shared readiness collection receives every variant');
    check(camera.layers.mask === 2 && !scene.background && !scene.overrideMaterial,
      'Instrument compile matches isolated scene state');
    check(!renderer.shadowMap.enabled, 'Instrument compile matches disabled shadows');
    if (root === instrument) {
      check(currentTarget === target && cam === camera && targetScene === scene,
        'Actual visible instrument compiles into its HDR target with real scene context');
      calls.push('instrument-hdr');
      if (failure === 'instrument-compile') throw new Error(failure);
    } else {
      check(root === pass.fsQuad._mesh && root.material === material && cam === quadCamera,
        'Actual ShaderPass material compiles on its fullscreen mesh');
      check(currentTarget === null && pass.renderToScreen, 'Composite uses actual screen variant');
      calls.push('composite-screen');
      if (failure === 'composite-compile') throw new Error(failure);
    }
    set.add({ variant: calls.at(-1) });
  };
  const warmPost = warmPostFactory({ passes: [] }, true, renderer, scene, camera,
    { geology: { instrumentLayer: 1 } }, target, pass, quadCamera, compile,
    warmSectionInstrumentPrograms, () => { throw Error('Unexpected warning'); });
  try {
    check(warmPost(programs) === 2, 'Production warmPost queues both separate destinations');
    check(failure === null, 'Injected failure must propagate');
    assert.deepEqual(calls, ['instrument-hdr', 'composite-screen']); checks++;
    check(programs.size === 2, 'Both actual variants remain in shared readiness poll');
  } catch (error) { check(error.message === failure, 'Exact injected bind/compile failure propagates'); }
  check(currentTarget === previousTarget, 'Caller framebuffer restored');
  check(camera.layers.mask === 5 && scene.background === background && scene.overrideMaterial === override,
    'Caller mask and scene restored');
  check(renderer.shadowMap.enabled && pass.fsQuad.material === heldMaterial && !pass.renderToScreen,
    'Caller shadow, quad material and renderToScreen restored');
  pass.dispose(); heldMaterial.dispose(); world.geometry.dispose(); world.material.dispose();
  instrument.geometry.dispose(); instrument.material.dispose(); override.dispose();
}

for (const args of [[], [null, null], [{}, null], [{}, { material: {} }]]) {
  const [target, pass] = args;
  check(warmSectionInstrumentPrograms(null, null, null, 1, target, pass) === 0,
    'Absent or incomplete optional instrument pass is a no-op');
}
for (const [composer, postOK] of [[null, true], [{ passes: [] }, false]]) {
  const fail = () => { throw Error('Unavailable post must not allocate or compile'); };
  const warmPost = warmPostFactory(composer, postOK, null, null, null, {}, null,
    null, null, fail, fail, fail);
  check(warmPost(new Set()) === 0, 'Production unavailable/disabled post path stays inert');
}
console.log(`INSTRUMENT WARM-UP: ${checks} assertions; production warmPost/helper execution, exact target variants and exceptional restoration. No GPU timing or linking claim.`);
