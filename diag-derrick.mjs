import * as THREE from 'three';
import { createRigSystem } from './src/rig/rigFactory.js';

const q = process.argv[2] || 'high';
const ctx = { THREE, quality: { id: q } };
const sys = createRigSystem(ctx);
const root = sys.buildPreview('oil-derrick');
const byParent = new Map();
root.traverse((o) => {
  if (!o.isMesh) return;
  // find the nearest named ancestor chain
  const chain = [];
  let n = o;
  while (n && n !== root) { if (n.name) chain.unshift(n.name); n = n.parent; }
  const key = chain.slice(0, 3).join('/') || '(root)';
  const e = byParent.get(key) || { n: 0, inst: 0, tris: 0, mats: new Set() };
  const g = o.geometry;
  const c = g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0);
  e.n++; if (o.isInstancedMesh) e.inst++;
  e.tris += (c / 3) * (o.isInstancedMesh ? o.count : 1);
  e.mats.add(o.material.name || o.material.uuid.slice(0, 6));
  byParent.set(key, e);
});
const rows = [...byParent.entries()].sort((a, b) => b[1].n - a[1].n);
let tot = 0;
for (const [k, v] of rows) { tot += v.n; console.log(String(v.n).padStart(4), 'inst=' + String(v.inst).padStart(2), String(Math.round(v.tris)).padStart(7), ' ', k); }
console.log('TOTAL', tot);
