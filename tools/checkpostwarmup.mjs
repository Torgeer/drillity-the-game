import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// SMAA's constructor creates lookup-image holders. No decoding, DOM or GPU is
// needed to execute the installed pass's material/target selection algorithm.
globalThis.Image = class {};
const source = readFileSync(new URL('../src/core/renderer.js', import.meta.url), 'utf8');
const start = source.indexOf('  function warmPost(programs) {');
const end = source.indexOf('\n  /**', start);
assert.ok(start >= 0 && end > start);
const makeWarm = new Function('composer', 'postOK', 'gl', 'sectionScene', 'sectionCamera',
  'ctx', 'instrumentTarget', 'instrumentPass', 'warmQuadCam', 'compilePrograms',
  'warmSectionInstrumentPrograms', 'warnOnce', `${source.slice(start, end)}; return warmPost;`);
let checks = 0;
const check = (value, message) => { checks++; assert.ok(value, message); };

for (const layout of ['low', 'medium', 'high', 'offscreen', 'bloom-last']) {
  const read = new THREE.WebGLRenderTarget(16, 16), write = read.clone(), previous = read.clone();
  const shader = () => new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } } }));
  const ao = shader(), grade = shader(), disabled = shader(); disabled.enabled = false;
  const smaa = new SMAAPass(16, 16); smaa.enabled = layout !== 'low' && layout !== 'bloom-last';
  const bloom = new UnrealBloomPass(new THREE.Vector2(16, 16));
  bloom.enabled = layout !== 'medium';
  const passes = layout === 'bloom-last' ? [grade, bloom, disabled] : [ao, bloom, grade, smaa, disabled];
  // A non-quad pass must still influence last-enabled ordering and swaps.
  passes.unshift({ enabled: true, needsSwap: false, render() {}, renderToScreen: false });
  const composer = Object.create(EffectComposer.prototype);
  Object.assign(composer, { passes, readBuffer: read, writeBuffer: write, renderToScreen: layout !== 'offscreen' });
  let target = previous, trace = [];
  const gl = { autoClear: true, state: { buffers: { stencil: { setTest() {} } } },
    getRenderTarget: () => target, setRenderTarget: value => { target = value; },
    getClearColor: c => c.set(0), getClearAlpha: () => 1, setClearColor() {}, clear() {},
    render(mesh) { trace.push([mesh.material, target, mesh.material.map]); } };
  composer.renderer = gl;
  // The oracle is actual Three pass execution, not a handwritten destination map.
  composer.render(0);
  const expected = trace.slice();
  composer.readBuffer = read; composer.writeBuffer = write;
  // Fresh SMAA has no held material. Deliberately stale flags cannot determine output.
  smaa.fsQuad.material = null;
  bloom.basic.map = null;
  for (const pass of passes) pass.renderToScreen = !pass.renderToScreen;
  const snapshot = passes.map(p => [p.fsQuad?.material, p.renderToScreen]);
  const warmCamera = new THREE.OrthographicCamera(), programs = new Set();
  const compare = (calls, message) => {
    check(calls.length === expected.length, `${message}: draw count ${calls.length} vs ${expected.length}`);
    calls.forEach(([material, rt, map], i) => {
      check(material === expected[i][0], `${message}: exact material at ${i}`);
      check(rt === expected[i][1], `${message}: exact target at ${i}`);
      check(map === expected[i][2], `${message}: material map variant at ${i}`);
    });
  };
  const warm = (compile, instrument = () => 0) => makeWarm(composer, true, gl, {}, {}, {}, null, null,
    warmCamera, compile, instrument, () => { throw Error('unexpected swallowed compilation failure'); });
  target = previous; trace = [];
  const count = warm((mesh, camera, set) => {
    check(camera === warmCamera && set === programs, `${layout}: real queue inputs preserved`);
    trace.push([mesh.material, target, mesh.material.map]); set.add(mesh.material);
  })(programs);
  compare(trace, layout); check(count === expected.length, `${layout}: reported queued draw count`);
  check(target === previous && composer.readBuffer === read && composer.writeBuffer === write,
    `${layout}: caller target and composer buffers preserved`);
  check(bloom.basic.map === null, `${layout}: bloom copy map restored`);
  passes.forEach((p, i) => check(p.fsQuad?.material === snapshot[i][0] && p.renderToScreen === snapshot[i][1],
    `${layout}: material/flag restored ${i}`));
  check(!programs.has(disabled.material), `${layout}: disabled pass never queued`);
  if (!smaa.enabled) check(!programs.has(smaa.materialEdges), `${layout}: disabled SMAA never queued`);

  // Fail every actual draw's compile and framebuffer bind in turn, including
  // null final outputs. Restoration must hold on every partial traversal.
  for (const failure of ['compile', 'bind']) for (let at = 0; at < expected.length; at++) {
    let index = 0, injected = false;
    const ordinaryBind = gl.setRenderTarget;
    if (failure === 'bind') gl.setRenderTarget = value => {
      target = value;
      if (!injected && index++ === at) { injected = true; throw Error('injected bind'); }
    };
    try {
      assert.throws(() => warm(() => {
        if (failure === 'compile' && index++ === at) throw Error('injected compile');
      })(new Set()), new RegExp(`injected ${failure}`)); checks++;
    } finally { gl.setRenderTarget = ordinaryBind; }
    check(target === previous, `${layout}: ${failure} ${at} target restored`);
    check(bloom.basic.map === null, `${layout}: ${failure} ${at} bloom copy map restored`);
    passes.forEach((p, i) => check(p.fsQuad?.material === snapshot[i][0] && p.renderToScreen === snapshot[i][1],
      `${layout}: ${failure} ${at} owner ${i} restored`));
  }
  for (const p of [ao, grade, disabled, smaa, bloom]) p.dispose();
  read.dispose(); write.dispose(); previous.dispose();
}
delete globalThis.Image;
console.log(`POST WARM-UP: ${checks} assertions; actual Three composer/pass destination oracle, disabled ordering, stale flags, all bind/compile failure restoration. CPU only.`);
