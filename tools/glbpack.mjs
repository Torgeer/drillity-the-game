/**
 * Compress the Blender machines — WITHOUT letting the optimiser eat the
 * contract.
 *
 * ── WHY NOT `gltf-transform optimize` ──────────────────────────────────────
 * The obvious command is the wrong one. Measured on `piling_leader.glb`:
 *
 *     source                      57 primitives   31 956 tris   81 nodes
 *     gltf-transform optimize      1 primitive    30 916 tris    1 node
 *
 * `optimize` flattens and joins the scene graph, so EVERY `pivot:`, `slide:`,
 * `mount:` and `aim:` node is gone and the machine loads as one static lump
 * with no moving parts and no work lights — and it enables `simplify` by
 * default, which quietly removed 1 040 triangles from geometry whose whole
 * point is that every dimension traces to a datasheet (HANDOFF §8E).
 *
 * So the steps are named explicitly, and `prune` is given `--keep-leaves`
 * because `mount:`, `aim:`, `pivot:` and `slide:` ARE empty leaf nodes and
 * prune's default is to delete exactly those.
 *
 *     weld    merge bitwise-identical vertices          lossless
 *     dedup   share identical meshes and accessors      lossless
 *     prune   drop what no scene references             lossless (--keep-leaves)
 *     meshopt EXT_meshopt_compression                   lossless, and the
 *                                                       decoder is already in
 *                                                       the page
 *
 * ── WHY MESHOPT AND NOT DRACO ──────────────────────────────────────────────
 * Measured on the ten machines in `public/models`, real Chrome, this GPU
 * (`node tools/glbcompress.mjs --decode`):
 *
 *     fleet          raw 34.1 MB   draco 1.42 MB (24x)   meshopt 4.70 MB (7.3x)
 *     worst decode   opt 13.2 ms   draco 133.3 ms        meshopt 9.8 ms
 *
 * Draco is three times smaller and THIRTEEN times slower to decode. Meshopt
 * decodes FASTER than the uncompressed file it replaces, because there is six
 * times less data to walk. Only the machine the player owns is ever fetched,
 * so Draco's extra saving is ~300 kB on one download — against a 133 ms
 * main-thread stall every time a rig streams in, on a desktop; a mid phone is
 * worse. And Draco needs `draco_decoder.wasm` + `draco_wasm_wrapper.js`, about
 * 245 kB of EXTRA FILES that cannot go in the single-file shell, which is the
 * one thing this whole design exists to protect.
 *
 * ── VERIFICATION IS PART OF THE STEP ───────────────────────────────────────
 * Nothing is written unless the packed file has the same draw-call count, the
 * same triangle count and the SAME SET OF NAMED NODES as the source. A pack
 * step that can silently cost a machine its boom is not a pack step.
 *
 * Usage:
 *   node tools/glbpack.mjs                 # pack public/models in place
 *   node tools/glbpack.mjs --check         # report only, write nothing
 *   node tools/glbpack.mjs --only rc_rig
 */
import { spawn } from 'node:child_process';
import {
  readdirSync, statSync, readFileSync, copyFileSync, mkdtempSync, rmSync, existsSync,
} from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = resolve(ROOT, 'public', 'models');
const CLI = resolve(ROOT, 'node_modules', '@gltf-transform', 'cli', 'bin', 'cli.js');

const argv = process.argv.slice(2);
const CHECK = argv.includes('--check');
const ONLY = (() => { const i = argv.indexOf('--only'); return i >= 0 ? argv[i + 1] : ''; })();

if (!existsSync(CLI)) {
  // Not fatal: the models are usable uncompressed, and the build must not fall
  // over on a machine that has not installed the optional tool.
  console.log('[glbpack] @gltf-transform/cli is not installed — skipping. '
    + '`npm i -D @gltf-transform/cli` to enable.');
  process.exit(0);
}

const gt = (args) => new Promise((res, rej) => {
  const p = spawn(process.execPath, [CLI, ...args], { stdio: 'ignore' });
  p.on('exit', (c) => (c === 0 ? res() : rej(new Error('gltf-transform ' + args[0] + ' exit ' + c))));
  p.on('error', rej);
});

/* ── read the facts a packed file must preserve, straight out of the file ─── */
function facts(path) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('not a GLB');
  let off = 12;
  let g = null;
  while (off < buf.byteLength) {
    const len = dv.getUint32(off, true);
    const type = dv.getUint32(off + 4, true);
    if (type === 0x4e4f534a) g = JSON.parse(new TextDecoder().decode(buf.subarray(off + 8, off + 8 + len)));
    off += 8 + len;
  }
  const meshes = g.meshes || [];
  const nodes = g.nodes || [];
  const per = meshes.map((m) => {
    let t = 0;
    for (const p of m.primitives) {
      if ((p.mode === undefined ? 4 : p.mode) !== 4) continue;
      t += (p.indices !== undefined ? g.accessors[p.indices].count
        : g.accessors[p.attributes.POSITION].count) / 3;
    }
    return { prims: m.primitives.length, tris: t };
  });
  // Per NODE, not per mesh: dedup makes several nodes share one mesh, which
  // shrinks the mesh list without changing what the renderer submits.
  let prims = 0;
  let tris = 0;
  for (const n of nodes) {
    if (n.mesh === undefined || !per[n.mesh]) continue;
    prims += per[n.mesh].prims;
    tris += per[n.mesh].tris;
  }
  const PRE = ['pivot:', 'slide:', 'mount:', 'aim:'];
  const named = nodes.map((n) => n.name).filter((n) => n && PRE.some((p) => n.startsWith(p))).sort();

  /* WHICH MESH WEARS WHICH MATERIAL NAME.
     In this pipeline a material IS its name — that is contract 2 in
     blender/lib/rig.py, and it is the only information the material carries.
     Blender exports them all with identical PBR values (grey, metallic 0,
     roughness 0.5) and only the name differing, so `dedup` considers all four
     the same material and keeps ONE. The first packed teststub came back
     reading "materials: glass" for the whole machine: bodywork, chassis and
     bright steel all collapsed into the glazing. Nothing else in the file
     changed, so a check on draw calls, triangles and node names passed it.
     Hence `--materials false` at the dedup step, and hence this signature. */
  const matName = (i) => ((g.materials || [])[i] || {}).name || '(unnamed)';
  const matSig = nodes.filter((n) => n.mesh !== undefined).map(
    (n) => (n.name || '?') + '=' + meshes[n.mesh].primitives
      .map((p) => matName(p.material)).join('+')).sort();

  return {
    bytes: statSync(path).size,
    prims,
    tris,
    nodes: nodes.length,
    named,
    matSig,
    mats: [...new Set((g.materials || []).map((m) => m.name))].sort(),
    packed: (g.extensionsUsed || []).includes('EXT_meshopt_compression'),
  };
}

const diff = (a, b) => {
  const out = [];
  if (a.prims !== b.prims) out.push(`draw calls ${a.prims} -> ${b.prims}`);
  if (a.tris !== b.tris) out.push(`triangles ${a.tris} -> ${b.tris}`);
  if (a.named.length !== b.named.length
    || a.named.some((n, i) => n !== b.named[i])) {
    const lost = a.named.filter((n) => !b.named.includes(n));
    out.push(`named nodes ${a.named.length} -> ${b.named.length}`
      + (lost.length ? ' — lost ' + lost.slice(0, 6).join(', ') : ''));
  }
  if (a.matSig.length !== b.matSig.length || a.matSig.some((n, i) => n !== b.matSig[i])) {
    const lost = a.mats.filter((m) => !b.mats.includes(m));
    out.push('material NAMES changed'
      + (lost.length ? ' — lost ' + lost.join(', ') : '')
      + ' (a material here is only its name; losing one repaints the machine)');
  }
  return out;
};

const kB = (n) => (n / 1024).toFixed(1);

const files = readdirSync(DIR).filter((f) => f.endsWith('.glb'))
  .filter((f) => !ONLY || f.includes(ONLY));

console.log(`\nmachine            before kB    after kB       x   draws   tris   named  result`);
let failed = 0;
for (const f of files) {
  const id = basename(f, '.glb');
  const src = resolve(DIR, f);
  const before = facts(src);
  if (before.packed) {
    console.log(id.padEnd(16) + kB(before.bytes).padStart(11) + '           —        —'
      + `${String(before.prims).padStart(8)}${String(before.tris).padStart(7)}`
      + `${String(before.named.length).padStart(8)}  already packed`);
    continue;
  }

  const work = mkdtempSync(join(tmpdir(), 'glbpack-'));
  try {
    const s = (n) => join(work, n + '.glb');
    await gt(['weld', src, s('1')]);
    // --materials false: see facts().matSig. Deduplicating materials that
    // differ ONLY by name is exactly wrong when the name is the payload.
    await gt(['dedup', s('1'), s('2'), '--materials', 'false']);
    await gt(['prune', s('2'), s('3'), '--keep-leaves']);
    await gt(['meshopt', s('3'), s('4'), '--level', 'medium']);
    const after = facts(s('4'));
    const problems = diff(before, after);
    const line = id.padEnd(16) + kB(before.bytes).padStart(11) + kB(after.bytes).padStart(12)
      + (before.bytes / after.bytes).toFixed(1).padStart(8)
      + String(after.prims).padStart(8) + String(after.tris).padStart(7)
      + String(after.named.length).padStart(8);
    if (problems.length) {
      failed++;
      console.log(line + '  REFUSED — ' + problems.join('; '));
    } else if (CHECK) {
      console.log(line + '  ok (--check: not written)');
    } else {
      copyFileSync(s('4'), src);
      console.log(line + '  packed');
    }
  } catch (e) {
    failed++;
    console.log(id.padEnd(16) + '  FAILED — ' + e.message);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
console.log(failed
  ? `\n${failed} machine(s) not packed. Nothing was overwritten for those.`
  : '\nall machines packed losslessly — same draw calls, triangles and named nodes.');
process.exit(failed ? 1 : 0);
