import * as THREE from 'three';
import { createRigSystem } from './src/rig/rigFactory.js';
const ctx = { THREE, quality: { id: process.argv[2] || 'high' } };
const sys = createRigSystem(ctx);
const root = sys.buildPreview('oil-derrick');
const want = process.argv[3] || '';
root.traverse((o) => {
  if (!o.isMesh) return;
  const chain = []; let n = o;
  while (n && n !== root) { if (n.name) chain.unshift(n.name); n = n.parent; }
  const key = chain.slice(0, 3).join('/') || '(root)';
  if (want && !key.includes(want)) return;
  const g = o.geometry;
  const c = g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0);
  const tris = Math.round((c / 3) * (o.isInstancedMesh ? o.count : 1));
  console.log(String(tris).padStart(6), (o.isInstancedMesh ? 'INST' : '    '), (o.material.name || '?').padEnd(46), key);
});
