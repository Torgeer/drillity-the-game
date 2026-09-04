import * as THREE from 'three';
import { buildTool, listTools, TOOL_ALIASES, TOOL_BUILDERS } from './src/rig/tools.js';

const ctx = { THREE };
const ids = process.argv.slice(2).length ? process.argv.slice(2) : listTools();
let fails = 0;
for (const id of ids) {
  for (const wear of [0, 0.5, 1]) {
    let g;
    try { g = buildTool(THREE, ctx, id, { wear, lod: 'high' }); }
    catch (e) { console.log('THREW', id, wear, e.message); fails++; continue; }
    const sp = g.userData.spec || {};
    if (sp.id === 'billet' && id !== 'billet') { console.log('FELL BACK TO BILLET:', id, sp.note); fails++; }
    let tris = 0, draws = 0;
    g.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const c = o.geometry.index ? o.geometry.index.count : (o.geometry.attributes.position ? o.geometry.attributes.position.count : 0);
      draws++; tris += (c / 3) * (o.isInstancedMesh ? o.count : 1);
    });
    if (wear === 0) {
      console.log(id.padEnd(24), 'draws=' + String(draws).padStart(3), 'tris=' + String(Math.round(tris)).padStart(6),
        'fitR=' + (g.userData.fitRadius || 0).toFixed(2), '| ' + (sp.name || '?'));
    }
    if (!isFinite(g.userData.fitRadius) || g.userData.fitRadius <= 0) { console.log('BAD fitRadius', id, wear); fails++; }
    g.userData.dispose();
  }
}
console.log(fails ? ('FAILURES: ' + fails) : 'ALL OK (' + ids.length + ' ids x 3 wear levels)');
