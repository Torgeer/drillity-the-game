import * as THREE from 'three';
import { createRigSystem } from './src/rig/rigFactory.js';
const ctx = { THREE, scene: new THREE.Scene(), sectionScene: new THREE.Scene(), quality: { id: 'high' } };
const sys = createRigSystem(ctx);
await sys.init();
sys.setRig('oil-derrick'); sys.setMethod('oil-rotary');
const hose = () => sys.group.getObjectByName('rotary-hose');
const stringMesh = () => sys.group.getObjectByName('string');
for (const d of [0, 5, 10, 15, 18.5]) {
  for (let i = 0; i < 25; i++) sys.update(1 / 60, { drill: { active: true, depth: d, rpm: 0.6, wob: 0.5, torque: 0.4, wear: 0.2 } });
  const h = hose(); h.geometry.computeBoundingBox();
  const bb = h.geometry.boundingBox;
  const st = stringMesh();
  console.log('depth', String(d).padStart(5),
    'hoseBox y', bb.min.y.toFixed(2), '->', bb.max.y.toFixed(2),
    ' width', (bb.max.x - bb.min.x).toFixed(2),
    ' string len', st ? st.scale.y.toFixed(2) : '?');
}
sys.dispose();
