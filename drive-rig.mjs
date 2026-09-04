import * as THREE from 'three';
import { createRigSystem, RIG_IDS, METHOD_RIGS } from './src/rig/rigFactory.js';

const errs = [];
const origErr = console.error, origWarn = console.warn;
console.error = (...a) => { errs.push('ERR ' + a.join(' ')); origErr(...a); };
console.warn = (...a) => { errs.push('WARN ' + a.join(' ')); origWarn(...a); };

const scene = new THREE.Scene();
const sectionScene = new THREE.Scene();
const ctx = { THREE, scene, sectionScene, quality: { id: process.argv[2] || 'high' } };
const sys = createRigSystem(ctx);
await sys.init();

function step(nFrames, state) {
  for (let i = 0; i < nFrames; i++) sys.update(1 / 60, state);
}

const probe = (label) => {
  const m = sys.group.getObjectByName('drilling-line');
  const hose = sys.group.getObjectByName('rotary-hose');
  const blk = sys.group.getObjectByName('travelling-block');
  const lens = [];
  if (m) {
    const mat = new THREE.Matrix4();
    for (let i = 0; i < m.count; i++) { m.getMatrixAt(i, mat); lens.push(+(new THREE.Vector3().setFromMatrixScale(mat).y).toFixed(2)); }
  }
  console.log(label.padEnd(22),
    'blockY=' + (blk ? blk.position.y.toFixed(2) : '?'),
    'hoseTris=' + (hose && hose.geometry.index ? hose.geometry.index.count / 3 : '?'),
    'lines=[' + lens.join(' ') + ']');
};

console.log('--- setRig oil-derrick ---');
console.log('ok:', sys.setRig('oil-derrick'), 'methods:', METHOD_RIGS['oil-rotary']);
sys.setMethod('oil-rotary');
console.log('tooling:', JSON.stringify(sys.getTooling()));
const spec = sys.getSpec('oil-derrick');
console.log('spec:', spec.name, spec.klass, 'derrick', spec.derrickM + 'm', 'hookLoad', spec.hookLoadKn + 'kN');

step(5, null);
probe('idle');

// drill: block should descend as depth grows within a stand
for (let d = 0; d < 19; d += 3) {
  step(20, { drill: { active: true, depth: d, rpm: 0.6, wob: 0.5, torque: 0.4, wear: d / 25 } });
  probe('drilling d=' + d);
}

console.log('--- connection ---');
const c = sys.playRodAdd();
for (let i = 0; i < 500 && sys.isAnimating(); i++) sys.update(1 / 60, null);
probe('after connection');
await c.then((r) => console.log('connection ->', r));

console.log('--- trip out 900 m ---');
const t1 = sys.playTripOut(900);
for (let i = 0; i < 900 && sys.isAnimating(); i++) sys.update(1 / 60, null);
await t1.then((r) => console.log('tripOut ->', r));
probe('after tripOut');

console.log('--- trip in 900 m ---');
const t2 = sys.playTripIn(900);
for (let i = 0; i < 900 && sys.isAnimating(); i++) sys.update(1 / 60, null);
await t2.then((r) => console.log('tripIn ->', r));
probe('after tripIn');

console.log('--- mobilisation ---');
const m1 = sys.playMobilisation();
for (let i = 0; i < 900 && sys.isAnimating(); i++) sys.update(1 / 60, null);
await m1.then((r) => console.log('mobilisation ->', r));

console.log('--- every other rig still drives ---');
for (const id of RIG_IDS) {
  sys.setRig(id);
  for (const meth of Object.keys(METHOD_RIGS)) {
    if (!METHOD_RIGS[meth].includes(id)) continue;
    sys.setMethod(meth);
    step(4, { drill: { active: true, depth: 7, rpm: 0.5, wob: 0.4, torque: 0.3, wear: 0.5 } });
  }
}
console.log('all rigs stepped');

sys.dispose();
console.log(errs.length ? ('CONSOLE ISSUES:\n' + errs.join('\n')) : 'no console errors/warnings');
