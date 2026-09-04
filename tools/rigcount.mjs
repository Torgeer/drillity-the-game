/**
 * Headless draw-call / triangle census per rig.
 *
 * The GPU cannot be bound headlessly on this machine, so this builds every
 * machine in node with the real builders + the real mergeStatic and counts
 * what the renderer would issue: one draw per surviving Mesh/InstancedMesh
 * (shadow passes excluded — the ratio is what matters here).
 *
 *   node tools/rigcount.mjs            # table
 *   node tools/rigcount.mjs --json out.json
 *   node tools/rigcount.mjs --mat rig  # per-material breakdown for one rig
 */
import * as THREE from 'three';
import { RIG_IDS } from '../src/rig/rigFactory.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { TOOL_UTILS } from '../src/rig/tools.js';

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
const matAt = args.indexOf('--mat');

const ctx = { THREE, quality: { id: 'high' } };

function census(root) {
  let draws = 0, tris = 0, verts = 0;
  const byMat = new Map();
  root.traverse((o) => {
    if (!o.visible && o !== root) { /* rigs are built hidden; count anyway */ }
    if (!o.isMesh && !o.isInstancedMesh) return;
    if (!o.geometry) return;
    const g = o.geometry;
    const idx = g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0);
    const n = o.isInstancedMesh ? o.count : 1;
    const t = (idx / 3) * n;
    draws += 1;
    tris += t;
    verts += (g.attributes.position ? g.attributes.position.count : 0) * n;
    const name = (o.material && (o.material.name || o.material.type)) || '?';
    const b = byMat.get(name) || { draws: 0, tris: 0, nodes: [] };
    b.draws += 1; b.tris += t; b.nodes.push(o.name || o.type);
    byMat.set(name, b);
  });
  return { draws, tris: Math.round(tris), verts, byMat };
}

const rows = [];
for (const id of RIG_IDS) {
  const sys = createRigSystem(ctx);
  let r = null;
  try {
    sys.setRig(id);
    r = sys.group.getObjectByName('rig:' + id);
  } catch (e) {
    rows.push({ id, err: String(e && e.message || e) });
    continue;
  }
  if (!r) { rows.push({ id, err: 'no root' }); continue; }
  const c = census(r);
  rows.push({ id, draws: c.draws, tris: c.tris, byMat: c.byMat });
  if (matAt >= 0 && args[matAt + 1] === id) {
    console.log('── ' + id + ' per material ──');
    const list = [...c.byMat.entries()].sort((a, b) => b[1].draws - a[1].draws);
    for (const [m, b] of list) {
      console.log('  ' + String(b.draws).padStart(3) + ' draws  ' + String(b.tris).padStart(7) + ' tris  ' + m);
      if (b.draws <= 6) console.log('        ' + b.nodes.join(', '));
    }
  }
}

const pad = (s, n) => String(s).padEnd(n);
console.log('\nrig                 draws   tris');
let dSum = 0, tSum = 0, over = 0;
for (const r of rows) {
  if (r.err) { console.log(pad(r.id, 20) + 'ERR ' + r.err); continue; }
  dSum += r.draws; tSum += r.tris;
  if (r.draws > 70) over++;
  console.log(pad(r.id, 20) + String(r.draws).padStart(5) + String(r.tris).padStart(8) + (r.draws > 70 ? '   OVER' : ''));
}
const ok = rows.filter((r) => !r.err);
const meds = ok.map((r) => r.draws).sort((a, b) => a - b);
console.log('\nmedian draws ' + meds[Math.floor(meds.length / 2)] + '  max ' + Math.max(...meds) +
  '  total ' + dSum + '  tris ' + tSum + '  over-70 ' + over);

if (jsonAt >= 0) {
  const out = args[jsonAt + 1];
  const fs = await import('node:fs');
  fs.writeFileSync(out, JSON.stringify(rows.map((r) => ({
    id: r.id, draws: r.draws, tris: r.tris, err: r.err,
    mats: r.byMat ? Object.fromEntries([...r.byMat].map(([k, v]) => [k, { d: v.draws, t: v.tris }])) : null,
  })), null, 2));
  console.log('wrote ' + out);
}
