/**
 * Read a `.glb` and print what the runtime contract cares about — WITHOUT a
 * browser, a GPU or three.js.
 *
 * The point is that the three numbers the loader is judged on are decidable
 * from the file itself, before anything renders:
 *
 *   primitives  — the DRAW-CALL FLOOR. glTF draws one primitive at a time, so
 *                 `info.render.calls` for a rig can never be below this. If the
 *                 file is over budget, no runtime cleverness saves it.
 *   triangles   — the lane the pipeline says to spend in (detail sharing a
 *                 material costs triangles, not draws).
 *   named nodes — `pivot:` / `slide:` / `mount:` / `aim:` and the `extras` on
 *                 the mounts. If a name did not survive export, the machine is
 *                 undrivable and underground lighting has nothing to aim at.
 *   materials   — must be NAMES ONLY with no texture references. A `.glb` that
 *                 ships baked maps has silently opted out of the wear system.
 *   DIMENSIONS  — the world-space bounding box, in metres, computed by
 *                 transforming EVERY vertex by its node's world matrix. This
 *                 exists because `blender/lib/rig.py` shipped a `box()` that
 *                 built at half scale for weeks and nothing caught it: the
 *                 wireframe looked right because `tube()` was correct, so a
 *                 machine came out as correct cylinders bolted to half-size
 *                 plates. A model whose dimensions are never read back is a
 *                 model whose datasheet provenance is decorative. Corners of
 *                 the local AABB would have been cheaper and wrong — a raked
 *                 mast inflates one — so the vertices are actually transformed.
 *
 * glTF is Y-UP (the Blender exporter runs with export_yup=True), so the axes
 * printed here are WIDTH = x, HEIGHT = y, LENGTH = z. Blender's Z is this Y.
 *
 * Usage:  node tools/glbinfo.mjs public/models/teststub.glb [more.glb ...]
 *         node tools/glbinfo.mjs --parts public/models/pd55.glb
 *
 * `--parts` additionally prints the bounding box of every named node's whole
 * subtree, which is how you find WHICH assembly is the wrong size rather than
 * only that the machine is.
 */
import { readFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Split a GLB container into its JSON chunk and its BIN chunk. */
export function parseGLB(buf) {
  if (buf.byteLength < 20) throw new Error('invalid GLB 2 header or declared length');
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('not a GLB (bad magic)');
  const version = dv.getUint32(4, true);
  if (version !== 2 || dv.getUint32(8, true) !== buf.byteLength) {
    throw new Error('invalid GLB 2 header or declared length');
  }
  let off = 12;
  let json = null;
  let bin = null;
  while (off < buf.byteLength) {
    if (off + 8 > buf.byteLength) throw new Error('truncated chunk header');
    const len = dv.getUint32(off, true);
    const type = dv.getUint32(off + 4, true);
    if (len % 4 || off + 8 + len > buf.byteLength) throw new Error('invalid chunk length');
    if (off === 12 && type !== 0x4e4f534a) throw new Error('first chunk is not JSON');
    const body = buf.subarray(off + 8, off + 8 + len);
    if (type === 0x4e4f534a) {
      if (json) throw new Error('duplicate JSON chunk');
      json = JSON.parse(new TextDecoder().decode(body));
    } else if (type === 0x004e4942) {
      if (bin) throw new Error('duplicate BIN chunk');
      bin = body;
    }
    off += 8 + len;
  }
  if (!json || json.asset?.version !== '2.0') throw new Error('missing glTF 2.0 JSON');
  return { version, json, bin };
}


/* -- world-space measurement -------------------------------------------------
   glTF stores matrices column-major; a node has EITHER `matrix` OR any of
   translation/rotation/scale. Both forms reach this project (Blender writes
   TRS, `gltf-transform` can bake to `matrix`), so both are handled. */
function m4identity() { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }

function m4mul(a, b) {                        // a * b, column-major
  const o = new Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4]
        + a[4 + r] * b[c * 4 + 1]
        + a[8 + r] * b[c * 4 + 2]
        + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}

function trs(node) {
  if (node.matrix) return node.matrix.slice();
  const t = node.translation || [0, 0, 0];
  const q = node.rotation || [0, 0, 0, 1];
  const s = node.scale || [1, 1, 1];
  const x = q[0], y = q[1], z = q[2], w = q[3];
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

const COMPONENT = {
  5120: [Int8Array, 1], 5121: [Uint8Array, 1], 5122: [Int16Array, 2],
  5123: [Uint16Array, 2], 5125: [Uint32Array, 4], 5126: [Float32Array, 4],
};

/** Read a VEC3 accessor as a flat array, honouring byteStride and normalisation. */
function readVec3(g, bin, accessorIndex) {
  const acc = g.accessors?.[accessorIndex];
  if (!acc || !Number.isInteger(acc.count) || acc.count <= 0) throw new Error('missing or empty POSITION accessor');
  if (acc.sparse) throw new Error('sparse POSITION accessor is not supported by this ruler');
  if (acc.type !== 'VEC3') throw new Error('accessor ' + accessorIndex + ' is ' + acc.type + ', not VEC3');
  const out = new Float64Array(acc.count * 3);
  if (acc.bufferView === undefined) return out;          // all-zero, valid glTF
  const bv = g.bufferViews[acc.bufferView];
  const buffer = g.buffers?.[bv?.buffer];
  if (!bv || bv.buffer !== 0 || !buffer || buffer.uri || !bin) throw new Error('POSITION requires a local BIN buffer');
  const spec = COMPONENT[acc.componentType];
  if (!spec) throw new Error('unknown componentType ' + acc.componentType);
  const Ctor = spec[0], size = spec[1];
  const stride = bv.byteStride || size * 3;
  const base = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const viewStart = bv.byteOffset || 0;
  const accessorOffset = acc.byteOffset || 0;
  if (![viewStart, accessorOffset, bv.byteLength, buffer.byteLength, stride].every((n) => Number.isInteger(n) && n >= 0)
    || stride < size * 3 || stride % size || base % size
    || accessorOffset + (acc.count - 1) * stride + size * 3 > bv.byteLength
    || viewStart + bv.byteLength > buffer.byteLength || buffer.byteLength > bin.byteLength) {
    throw new Error('POSITION accessor exceeds or misaligns its bufferView/BIN storage');
  }
  for (let i = 0; i < acc.count; i++) {
    /* A fresh typed array per vertex rather than one view over the whole
       range: POSITION accessors are only guaranteed to be aligned to their
       own component size, and an interleaved bufferView can start a vertex on
       any 4-byte boundary the stride lands on. */
    const v = new Ctor(bin.buffer, bin.byteOffset + base + i * stride, 3);
    out[i * 3] = v[0]; out[i * 3 + 1] = v[1]; out[i * 3 + 2] = v[2];
  }
  if (acc.normalized && acc.componentType !== 5126) {
    const d = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 }[acc.componentType];
    for (let i = 0; i < out.length; i++) out[i] = Math.max(out[i] / d, -1);
  }
  return out;
}

/** World-space AABB of the whole file, plus one per node subtree. */
export function measure(g, bin) {
  const compressed = (g.extensionsUsed || []).filter((e) => /draco|meshopt|quantiz/i.test(e));
  if (compressed.length) throw new Error(`compressed geometry (${compressed.join(', ')}); measure the uncompressed source`);
  const unreadable = [];
  // Validate every primitive, including unattached meshes. The model gate uses
  // this same reader; a named but unreadable primitive cannot pass separately.
  const positions = new Map();
  for (const mesh of g.meshes || []) {
    if (!mesh.primitives?.length) unreadable.push('empty mesh');
    for (const prim of mesh.primitives || []) {
      if (prim.attributes?.POSITION === undefined) { unreadable.push('no POSITION'); continue; }
      try {
        if (!positions.has(prim.attributes.POSITION)) positions.set(prim.attributes.POSITION, readVec3(g, bin, prim.attributes.POSITION));
      } catch (e) { unreadable.push(e.message); }
    }
  }
  const nodes = g.nodes || [];
  const sub = new Array(nodes.length);                   // node + descendants
  const sceneIndex = g.scene === undefined ? 0 : g.scene;
  const scene = (g.scenes || [])[sceneIndex] || {};
  const roots = scene.nodes || [];
  const EMPTY = () => ({ min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] });
  const real = (b) => b.min[0] <= b.max[0];
  const grow = (box, p) => {
    for (let k = 0; k < 3; k++) {
      if (p[k] < box.min[k]) box.min[k] = p[k];
      if (p[k] > box.max[k]) box.max[k] = p[k];
    }
  };
  const merge = (a, b) => { grow(a, b.min); grow(a, b.max); };

  const visiting = new Set();
  const walk = (i, parentMatrix) => {
    const n = nodes[i];
    if (!n || visiting.has(i)) throw new Error('invalid or cyclic scene node');
    visiting.add(i);
    const m = m4mul(parentMatrix, trs(n));
    if (!m.every(Number.isFinite)) throw new Error('non-finite node transform');
    const total = EMPTY();
    if (n.mesh !== undefined && !g.meshes?.[n.mesh]) throw new Error('missing node mesh');
    if (n.mesh !== undefined && g.meshes[n.mesh]) {
      for (const prim of g.meshes[n.mesh].primitives) {
        /* REFUSE TO REPORT A NUMBER THIS CANNOT MEASURE.
           A primitive with no POSITION, or an accessor that will not decode,
           used to be skipped in silence — and a skipped primitive makes the
           machine come out SMALLER, which is indistinguishable from a machine
           that is correctly small. Count them and say so on the row instead. */
        const v = positions.get(prim.attributes?.POSITION);
        if (!v) continue;
        for (let k = 0; k < v.length; k += 3) {
          const x = v[k], y = v[k + 1], z = v[k + 2];
          if (![x, y, z].every(Number.isFinite)) throw new Error('non-finite POSITION vertex');
          grow(total, [
            m[0] * x + m[4] * y + m[8] * z + m[12],
            m[1] * x + m[5] * y + m[9] * z + m[13],
            m[2] * x + m[6] * y + m[10] * z + m[14],
          ]);
        }
      }
    }
    for (const c of n.children || []) {
      const cb = walk(c, m);
      if (real(cb)) merge(total, cb);
    }
    sub[i] = total;
    visiting.delete(i);
    return total;
  };

  const all = EMPTY();
  for (const r of roots) {
    const b = walk(r, m4identity());
    if (real(b)) merge(all, b);
  }
  return { all, sub, empty: !real(all), unreadable };
}

const f3 = (n) => (Math.abs(n) < 5e-4 ? 0 : n).toFixed(3);
const dimsOf = (b) => [b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]];

function report(path) {
  const buf = readFileSync(path);
  const { version, json: g, bin } = parseGLB(buf);
  const bytes = statSync(path).size;

  const meshes = g.meshes || [];
  const nodes = g.nodes || [];

  /* COUNT PER NODE, NOT PER MESH.
     glTF lets several nodes reference ONE mesh, and `gltf-transform dedup`
     does exactly that to identical geometry — four track rollers become one
     mesh with four nodes pointing at it. The file's mesh list then shrinks
     while the number of things drawn does not. Counting meshes made a packed
     machine look like it had shed four draw calls it had not shed. The number
     that matters is what the renderer submits, which is one per primitive per
     NODE that references it. */
  const perMesh = meshes.map((m) => {
    let t = 0;
    for (const p of m.primitives) {
      if (p.attributes?.POSITION === undefined) throw new Error('DIMENSIONS INCOMPLETE: primitive has no POSITION');
      const mode = p.mode === undefined ? 4 : p.mode;
      if (mode !== 4) continue;                       // TRIANGLES only
      const count = p.indices !== undefined
        ? g.accessors[p.indices].count
        : g.accessors[p.attributes.POSITION].count;
      t += count / 3;
    }
    return { prims: m.primitives.length, tris: t };
  });

  let prims = 0;
  let tris = 0;
  for (const n of nodes) {
    if (n.mesh === undefined || !perMesh[n.mesh]) continue;
    prims += perMesh[n.mesh].prims;
    tris += perMesh[n.mesh].tris;
  }
  const named = { pivot: [], slide: [], mount: [], aim: [], static: [], other: [] };
  for (const n of nodes) {
    const nm = n.name || '(unnamed)';
    const k = nm.startsWith('pivot:') ? 'pivot'
      : nm.startsWith('slide:') ? 'slide'
        : nm.startsWith('mount:') ? 'mount'
          : nm.startsWith('aim:') ? 'aim'
            : nm.startsWith('static:') ? 'static' : 'other';
    named[k].push(n);
  }

  const mats = (g.materials || []).map((m) => {
    const pbr = m.pbrMetallicRoughness || {};
    const textured = !!(pbr.baseColorTexture || pbr.metallicRoughnessTexture
      || m.normalTexture || m.occlusionTexture || m.emissiveTexture);
    return { name: m.name, textured };
  });

  const ext = g.extensionsUsed || [];

  console.log(`\n── ${path}`);
  console.log(`   glTF v${version}  ${(bytes / 1024).toFixed(1)} kB`
    + (ext.length ? `  extensions: ${ext.join(', ')}` : '  extensions: none'));
  console.log(`   PRIMITIVES ${prims}  (= draw-call floor)   TRIANGLES ${tris}`
    + `   nodes ${nodes.length}   images ${(g.images || []).length}`);
  console.log(`   materials: ${mats.map((m) => m.name + (m.textured ? ' [TEXTURED!]' : '')).join(', ') || '(none)'}`);

  const parentOf = new Map();
  nodes.forEach((n, i) => (n.children || []).forEach((c) => parentOf.set(c, i)));
  const nameOf = (i) => (nodes[i] && nodes[i].name) || `#${i}`;
  const chain = (i) => {
    const out = [];
    for (let p = parentOf.get(i); p !== undefined; p = parentOf.get(p)) out.push(nameOf(p));
    return out.length ? ' <- ' + out.join(' <- ') : ' (scene root)';
  };

  for (const k of ['pivot', 'slide', 'mount', 'aim', 'static']) {
    for (const n of named[k]) {
      const i = nodes.indexOf(n);
      const extras = n.extras ? '  extras=' + JSON.stringify(n.extras) : '';
      const mesh = n.mesh !== undefined ? `  mesh=${meshes[n.mesh].primitives.length}prim` : '';
      console.log(`   ${n.name}${mesh}${extras}${chain(i)}`);
    }
  }
  const others = named.other.filter((n) => n.mesh !== undefined);
  if (others.length) {
    console.log(`   unprefixed meshes (${others.length}): `
      + others.map((n) => n.name).join(', '));
  }

  /* -- dimensions. Printed LAST because it is the number that gets checked
     against a datasheet page, and a number you have to scroll past is a number
     nobody reads. -- */
  let dims = null;
  const compressed = ext.filter((e) => /draco|meshopt|quantiz/i.test(e));
  if (compressed.length) {
    throw new Error(`DIMENSIONS UNMEASURABLE: geometry is compressed (${compressed.join(', ')}). `
      + 'Measure the uncompressed source.');
  } else if (!bin && (g.bufferViews || []).length) {
    throw new Error('DIMENSIONS UNMEASURABLE: no BIN chunk (external .bin not supported).');
  } else {
    const m = measure(g, bin);
    if (m.unreadable.length) throw new Error(`DIMENSIONS INCOMPLETE: ${m.unreadable.join('; ')}`);
    if (m.empty) {
      throw new Error('DIMENSIONS UNMEASURABLE: no geometry.');
    } else {
      const d = dimsOf(m.all);
      console.log(`   DIMENSIONS (m)  W ${f3(d[0])} x H ${f3(d[1])} x L ${f3(d[2])}`
        + '   [glTF Y-up: W=x H=y L=z]');
      console.log(`   BOUNDS     x ${f3(m.all.min[0])}..${f3(m.all.max[0])}`
        + `   y ${f3(m.all.min[1])}..${f3(m.all.max[1])}`
        + `   z ${f3(m.all.min[2])}..${f3(m.all.max[2])}`);
      if (PARTS) {
        for (let i = 0; i < nodes.length; i++) {
          const nm = nodes[i].name || '';
          if (!/^(pivot|slide|mount|aim|static):/.test(nm)) continue;
          const b = m.sub[i];
          if (!b || b.min[0] > b.max[0]) { console.log(`     ${nm}  (no geometry)`); continue; }
          const pd = dimsOf(b);
          console.log(`     ${nm}  ${f3(pd[0])} x ${f3(pd[1])} x ${f3(pd[2])}`
            + `   at y ${f3(b.min[1])}..${f3(b.max[1])}`);
        }
      }
      dims = d;
    }
  }
  return { prims, tris, bytes, dims };
}

const argv = process.argv.slice(2);
const PARTS = argv.includes('--parts');
let files = argv.filter((a) => !a.startsWith('--'));

/* NO ARGUMENTS: measure the whole fleet, one line each.

   This replaces `tools/glbdims.mjs`, now deleted. That file measured a machine
   by transforming the EIGHT CORNERS of each primitive's local AABB — the
   accessor min/max — through the node's world matrix. On axis-aligned geometry
   that is exact, and the two tools agreed to the millimetre. On a node carrying
   a ROTATION whose mesh does not fill its own local box — which is every joined
   static under a raked mast — it is a strict OVER-estimate. It was larger on
   four of nine machines and never smaller: the signature of a superset bound.

   It was not a harmless imprecision. It put pd55 at 26.218 m where the true
   height is 25.790 and max y is exactly 25.700 — the datasheet's 25.7 m piling
   working height to the millimetre. It reported rc-rig reaching 2.598 m BELOW
   ground and warned of "a runaway array or rotation"; the true minimum is
   -0.014 m and there was no bug to find. It put tunnel-jumbo 19 mm over the
   WIDTH constant the model is built from. Three false findings from one
   approximation, and two were passed on as real.

   `measure()` above transforms every actual VERTEX, so it is exact. ONE ruler:
   HANDOFF.md 8B — two tables describing one thing will drift, and the one that
   is wrong will be believed. */
function main() {
if (!files.length) {
  const MODELS = 'public/models';
  if (!existsSync(MODELS)) {
    console.error('usage: node tools/glbinfo.mjs <file.glb> [...]');
    process.exit(2);
  }
  files = readdirSync(MODELS).filter((f) => f.endsWith('.glb')).map((f) => join(MODELS, f));
  if (!files.length) {
    console.log(MODELS + '/ is empty — nothing exported. Models are gitignored;'
      + ' build them with `npm run blender`.');
    process.exit(1);
  }
  console.log('EXACT world-space bounds — every vertex transformed.');
  console.log('');
  console.log('model                   width     height     length     ground   draws');
  let bad = 0;
  for (const f of files) {
    try {
      const { json: g, bin } = parseGLB(readFileSync(f));
      const m = measure(g, bin);
      if (m.unreadable.length) throw new Error(`DIMENSIONS INCOMPLETE: ${m.unreadable.join('; ')}`);
      let prims = 0;
      for (const n of (g.nodes || [])) {
        if (n.mesh !== undefined && g.meshes[n.mesh]) prims += g.meshes[n.mesh].primitives.length;
      }
      if (m.empty) throw new Error('no positioned geometry');
      const d = dimsOf(m.all);
      const below = m.all.min[1] < -0.25;
      if (below) bad++;
      console.log(basename(f).padEnd(22)
        + f3(d[0]).padStart(9) + f3(d[1]).padStart(11) + f3(d[2]).padStart(11)
        + f3(m.all.min[1]).padStart(11) + String(prims).padStart(8)
        + (below ? '   <- sits below y=0' : '')
        + (m.unreadable.length ? '   INCOMPLETE (' + m.unreadable.length + ' prim)' : ''));
    } catch (e) {
      console.log(basename(f).padEnd(22) + ' FAILED: ' + e.message);
      process.exitCode = 1;
    }
  }
  if (bad) {
    console.log('');
    console.log(bad + ' model(s) sit more than 250 mm below y=0. rig.py puts the origin at'
      + ' the slew centre at ground level, so that is worth a look — but it is a question,'
      + ' not a verdict: a raise borer legitimately hangs a string below its own floor.');
  }
  console.log('');
  console.log('Compare each figure with the sourced dimension in research/rigs/<id>.md.'
    + ' This tool has no opinion about what the number should be.');
  console.log('One machine in full:  node tools/glbinfo.mjs --parts <file.glb>');
  console.log('');
  process.exit(process.exitCode || 0);
}
for (const f of files) {
  try { report(f); } catch (e) {
    console.error(`\n── ${f}\n   FAILED: ${e.message}`);
    process.exitCode = 1;
  }
}
console.log('');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
