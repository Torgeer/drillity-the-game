import * as THREE from 'three';
import { createRigSystem, RIG_IDS } from './src/rig/rigFactory.js';

const ids = process.argv.slice(2).length ? process.argv.slice(2) : RIG_IDS;
const qualities = ['high', 'low'];

for (const q of qualities) {
  const ctx = { THREE, quality: { id: q } };
  const sys = createRigSystem(ctx);
  for (const id of ids) {
    const root = sys.buildPreview(id);
    if (!root) { console.log(q, id, 'FAILED'); continue; }
    let draws = 0, tris = 0, meshes = 0, inst = 0;
    root.traverse((o) => {
      if (!o.isMesh) return;
      const g = o.geometry;
      if (!g) return;
      const count = g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0);
      const n = o.isInstancedMesh ? o.count : 1;
      draws += 1;
      if (o.isInstancedMesh) inst++; else meshes++;
      tris += (count / 3) * n;
    });
    console.log(
      q.toUpperCase().padEnd(5), id.padEnd(14),
      'draws=' + String(draws).padStart(3),
      'tris=' + String(Math.round(tris)).padStart(7),
      '(merged=' + meshes + ' inst=' + inst + ')'
    );
    if (root.userData.dispose) root.userData.dispose();
  }
  sys.dispose();
}
