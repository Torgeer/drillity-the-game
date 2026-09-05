#!/usr/bin/env node
/**
 * glbdims — how big is the machine, actually?
 *
 *   node tools/glbdims.mjs                       # every model
 *   node tools/glbdims.mjs public/models/x.glb   # one
 *
 * ── WHY THIS EXISTS ────────────────────────────────────────────────────────
 * `box()` in `blender/lib/rig.py` spent this whole session returning boxes at
 * HALF the size asked for, while `tube()` was correct. Nothing looked broken:
 * a machine of correct cylinders and half-size boxes reads as a machine. At
 * least two modules grew private doubling wrappers to compensate, and when
 * `rig.py` was fixed those wrappers became a DOUBLING bug pointing the other
 * way.
 *
 * Neither direction is visible in `glbinfo.mjs` (primitives, triangles,
 * materials, node chains) or in the exporter's own log. The only thing that
 * settles it is the world-space bounding box of the exported file, which is
 * what this prints — read off the accessor min/max of every primitive, pushed
 * through each node's full TRS chain. No opinion about what the number should
 * be: compare it with the sourced figure in `research/rigs/<id>.md` yourself.
 *
 * A machine is measured with its nodes in their EXPORTED pose. A mast modelled
 * lying down for transport is short here and that is correct.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/* ── glTF container ──────────────────────────────────────────────────────── */
function readGlb(path) {
  const buf = readFileSync(path);
  if (buf.length < 12 || buf.readUInt32LE(0) !== 0x46546c67) {
    throw new Error('not a GLB (bad magic)');
  }
  let off = 12;
  let json = null;
  let bin = null;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32LE(off);
    const type = buf.readUInt32LE(off + 4);
    const start = off + 8;
    if (type === 0x4e4f534a) json = JSON.parse(buf.slice(start, start + len).toString('utf8'));
    else if (type === 0x004e4942) bin = buf.slice(start, start + len);
    off = start + len;
  }
  if (!json) throw new Error('no JSON chunk');
  return { json, bin };
}

/* ── 4x4 column-major, the way glTF stores a matrix ──────────────────────── */
const ident = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  }
  return o;
}

/** A node's local matrix: an explicit `matrix`, or TRS composed in that order. */
function localMatrix(n) {
  if (n.matrix) return n.matrix.slice();
  const t = n.translation || [0, 0, 0];
  const q = n.rotation || [0, 0, 0, 1];
  const s = n.scale || [1, 1, 1];
  const [x, y, z, w] = q;
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;
  return [
    (1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0,
    (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0,
    (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0,
    t[0], t[1], t[2], 1,
  ];
}

const apply = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];

/* ── measure ─────────────────────────────────────────────────────────────── */
function measure(path) {
  const { json } = readGlb(path);
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  let prims = 0;
  let missing = 0;

  const visit = (idx, parent) => {
    const n = json.nodes[idx];
    if (!n) return;
    const world = mul(parent, localMatrix(n));
    if (n.mesh !== undefined && json.meshes[n.mesh]) {
      for (const p of json.meshes[n.mesh].primitives || []) {
        prims++;
        const acc = json.accessors[p.attributes && p.attributes.POSITION];
        // An accessor without min/max is legal glTF; the exporter always writes
        // them for POSITION, but say so rather than reporting a smaller machine.
        if (!acc || !acc.min || !acc.max) { missing++; continue; }
        // All eight corners, because a rotated box's extremes are not its own
        // min/max corners.
        for (let c = 0; c < 8; c++) {
          const corner = [
            (c & 1) ? acc.max[0] : acc.min[0],
            (c & 2) ? acc.max[1] : acc.min[1],
            (c & 4) ? acc.max[2] : acc.min[2],
          ];
          const w = apply(world, corner);
          for (let k = 0; k < 3; k++) {
            if (w[k] < lo[k]) lo[k] = w[k];
            if (w[k] > hi[k]) hi[k] = w[k];
          }
        }
      }
    }
    for (const c of n.children || []) visit(c, world);
  };

  const scene = json.scenes[json.scene || 0];
  for (const r of (scene && scene.nodes) || []) visit(r, ident());

  if (!Number.isFinite(lo[0])) return { prims, missing, empty: true };
  return {
    prims,
    missing,
    // glTF is Y-up: x width, y height, z length.
    w: hi[0] - lo[0], h: hi[1] - lo[1], l: hi[2] - lo[2],
    minY: lo[1], maxY: hi[1],
  };
}

/* ── run ─────────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const MODELS = join(ROOT, 'public/models');
const files = args.length
  ? args
  : (existsSync(MODELS)
    ? readdirSync(MODELS).filter((f) => f.endsWith('.glb')).map((f) => join(MODELS, f))
    : []);

if (!files.length) {
  console.log('No models. Build them with `npm run blender`.');
  process.exit(0);
}

console.log('model                  width      height     length    ground');
console.log('                         (m)        (m)        (m)      (min y)');
let suspect = 0;
for (const f of files) {
  let m;
  try { m = measure(f); } catch (e) {
    console.log(`${basename(f).padEnd(22)} ERROR  ${e.message}`);
    continue;
  }
  if (m.empty) { console.log(`${basename(f).padEnd(22)} no positioned geometry`); continue; }
  // A machine that reaches far below y=0 is almost always an array or a
  // rotation that ran away, not a design decision — the game drops a rig onto
  // terrain at y=0 and `rig.py` says the origin is the slew centre at ground
  // level. It is a flag, not a verdict: a raise borer legitimately hangs a
  // string below its own floor.
  const deep = m.minY < -1.0;
  if (deep) suspect++;
  console.log(
    basename(f).padEnd(22)
    + m.w.toFixed(3).padStart(9)
    + m.h.toFixed(3).padStart(11)
    + m.l.toFixed(3).padStart(11)
    + m.minY.toFixed(3).padStart(10)
    + (deep ? '   <- reaches below ground' : '')
    + (m.missing ? `   (${m.missing} primitive(s) without min/max, not counted)` : ''));
}
if (suspect) {
  console.log(`\n${suspect} model(s) reach more than a metre below y=0. `
    + 'That is usually a runaway array or rotation rather than a design '
    + 'decision — rig.py puts the origin at the slew centre, at ground level.');
}
console.log('\nCompare each figure with the sourced dimension in research/rigs/<id>.md. '
  + 'This tool has no opinion about what the number should be.');
