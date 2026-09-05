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
 *
 * Usage:  node tools/glbinfo.mjs public/models/teststub.glb [more.glb ...]
 */
import { readFileSync, statSync } from 'node:fs';

/** Split a GLB container into its JSON chunk and its BIN chunk. */
function parseGLB(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('not a GLB (bad magic)');
  const version = dv.getUint32(4, true);
  let off = 12;
  let json = null;
  let bin = null;
  while (off < buf.byteLength) {
    const len = dv.getUint32(off, true);
    const type = dv.getUint32(off + 4, true);
    const body = buf.subarray(off + 8, off + 8 + len);
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(body));
    else if (type === 0x004e4942) bin = body;
    off += 8 + len + ((4 - (len % 4)) % 4) * 0; // chunks are already 4-byte padded
  }
  return { version, json, bin };
}

function report(path) {
  const buf = readFileSync(path);
  const { version, json: g } = parseGLB(buf);
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
  return { prims, tris, bytes };
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node tools/glbinfo.mjs <file.glb> [...]');
  process.exit(2);
}
for (const f of files) {
  try { report(f); } catch (e) { console.error(`\n── ${f}\n   FAILED: ${e.message}`); }
}
console.log('');
