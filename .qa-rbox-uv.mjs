import * as THREE from 'three';
import { TOOL_UTILS } from './src/rig/tools.js';
const { G } = TOOL_UTILS;
const g = G.roundedBox(THREE, 3.2, 1.85, 5.2, 0.07, 2);
const pos = g.attributes.position, nrm = g.attributes.normal, uv = g.attributes.uv;
const stats = {};
for (let i = 0; i < pos.count; i++) {
  const nx = Math.abs(nrm.getX(i)), ny = Math.abs(nrm.getY(i)), nz = Math.abs(nrm.getZ(i));
  const ax = nx >= ny && nx >= nz ? 'x' : ny >= nz ? 'y' : 'z';
  const s = stats[ax] || (stats[ax] = { umin: 1e9, umax: -1e9, vmin: 1e9, vmax: -1e9, n: 0 });
  s.umin = Math.min(s.umin, uv.getX(i)); s.umax = Math.max(s.umax, uv.getX(i));
  s.vmin = Math.min(s.vmin, uv.getY(i)); s.vmax = Math.max(s.vmax, uv.getY(i));
  s.n++;
}
console.log('verts', pos.count, 'hasUV', !!uv);
console.log(JSON.stringify(stats, null, 1));
