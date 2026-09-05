/**
 * Is compressing the machines worth it, and with WHICH codec?
 *
 * Two numbers decide it and both are measured here, on the real machines:
 *
 *   SIZE    what the player downloads for the rig they own.
 *   DECODE  what it costs to turn those bytes back into geometry, in a real
 *           browser on this GPU — because a smaller file that takes longer to
 *           unpack than it saves in transfer is not a win on a LAN, and this
 *           game is played from a local build and a phone on the same wifi as
 *           often as it is played over the internet.
 *
 * The third number is not measured but is decisive: DRACO NEEDS A DECODER
 * SHIPPED. `draco_decoder.wasm` + `draco_wasm_wrapper.js` are about 250 kB of
 * extra files that cannot go in the single-file shell, against Meshopt, whose
 * decoder is a JS module that bundles into the page for nothing extra.
 *
 * Usage:
 *   node tools/glbcompress.mjs                       # sizes only, no browser
 *   node tools/glbcompress.mjs --decode --port 5392  # + browser decode timing
 *
 * `--decode` starts a Vite DEV server of its own (module resolution is needed
 * to reach DRACOLoader) and drives real Chrome. Pass a port nothing else is on.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const { readdirSync, statSync, mkdirSync, copyFileSync, rmSync, existsSync } = fs;
import { resolve, dirname, basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'public', 'models');
const CLI = resolve(ROOT, 'node_modules', '@gltf-transform', 'cli', 'bin', 'cli.js');

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const DECODE = argv.includes('--decode');
const PORT = +flag('port', '5392');
const ONLY = flag('only', '');

const run = (args) => new Promise((res, rej) => {
  const p = spawn(process.execPath, [CLI, ...args], { stdio: 'ignore' });
  p.on('exit', (c) => (c === 0 ? res() : rej(new Error('gltf-transform exit ' + c))));
  p.on('error', rej);
});

const kB = (n) => (n / 1024).toFixed(1);

if (!existsSync(CLI)) {
  console.error('@gltf-transform/cli is not installed. `npm i -D @gltf-transform/cli`');
  process.exit(2);
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.glb') && !f.startsWith('zz'))
  .filter((f) => !ONLY || f.includes(ONLY));

const WORK = fs.mkdtempSync(join(tmpdir(), 'glbcompress-'));

/* ── size ────────────────────────────────────────────────────────────────── */
const rows = [];
for (const f of files) {
  const id = basename(f, '.glb');
  const src = resolve(SRC, f);
  const out = {};
  for (const [name, compress] of [['opt', 'false'], ['draco', 'draco'], ['meshopt', 'meshopt']]) {
    const dst = resolve(WORK, `${id}.${name}.glb`);
    try {
      await run(['optimize', src, dst, '--compress', compress, '--texture-compress', 'false']);
      out[name] = statSync(dst).size;
    } catch (e) { out[name] = null; }
  }
  rows.push({ id, raw: statSync(src).size, ...out });
}

console.log('\nSIZE  (weld + dedupe + prune, then the codec)');
console.log('machine            raw kB     opt kB   draco kB       x    meshopt kB       x');
for (const r of rows) {
  console.log(
    r.id.padEnd(16)
    + kB(r.raw).padStart(10)
    + kB(r.opt).padStart(11)
    + kB(r.draco).padStart(11)
    + (r.raw / r.draco).toFixed(1).padStart(8)
    + kB(r.meshopt).padStart(14)
    + (r.raw / r.meshopt).toFixed(1).padStart(8));
}
const tot = (k) => rows.reduce((n, r) => n + (r[k] || 0), 0);
console.log('FLEET'.padEnd(16) + kB(tot('raw')).padStart(10) + kB(tot('opt')).padStart(11)
  + kB(tot('draco')).padStart(11) + (tot('raw') / tot('draco')).toFixed(1).padStart(8)
  + kB(tot('meshopt')).padStart(14) + (tot('raw') / tot('meshopt')).toFixed(1).padStart(8));

if (!DECODE) {
  console.log('\n(no --decode: sizes only)');
  process.exit(0);
}

/* ── decode ──────────────────────────────────────────────────────────────── */
// Serve the variants from public/ under zz- ids so a plain fetch reaches them.
for (const r of rows) {
  for (const v of ['opt', 'draco', 'meshopt']) {
    if (r[v]) copyFileSync(resolve(WORK, `${r.id}.${v}.glb`), resolve(SRC, `zz-${r.id}-${v}.glb`));
  }
}
// Draco needs its decoder served; Meshopt does not.
const dracoSrc = resolve(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco', 'gltf');
const dracoDst = resolve(ROOT, 'public', 'zz-draco');
mkdirSync(dracoDst, { recursive: true });
for (const f of readdirSync(dracoSrc)) copyFileSync(resolve(dracoSrc, f), resolve(dracoDst, f));

// A dev server is needed because DRACOLoader is not in the built bundle.
// --reuse: one is already listening on PORT (this project runs several).
let server = null;
if (!argv.includes('--reuse')) {
  server = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', '--port', String(PORT), '--strictPort'],
    { cwd: ROOT, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 8000));
}

let browser = null;
for (const channel of ['chrome', 'msedge']) {
  try { browser = await chromium.launch({ channel, headless: false, args: ['--mute-audio'] }); break; }
  catch (e) { /* next */ }
}
const page = await browser.newPage();
// NOT the game's index.html: adding files under public/ makes Vite full-reload
// every open page, which destroys the execution context mid-measurement. A
// bare page served out of public/ is transformed by nothing and reloads never.
const probe = resolve(ROOT, 'public', 'zz-probe.html');
fs.writeFileSync(probe, '<!doctype html><title>glb decode probe</title>');
await new Promise((r) => setTimeout(r, 1500));
await page.goto(`http://localhost:${PORT}/zz-probe.html`, { waitUntil: 'domcontentloaded' });

const results = await page.evaluate(async ({ rows, port }) => {
  const [{ GLTFLoader }, { DRACOLoader }, { MeshoptDecoder }] = await Promise.all([
    import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js'),
    import('/node_modules/three/examples/jsm/loaders/DRACOLoader.js'),
    import('/node_modules/three/examples/jsm/libs/meshopt_decoder.module.js'),
  ]);
  const draco = new DRACOLoader().setDecoderPath('/zz-draco/');
  const out = [];
  for (const r of rows) {
    for (const v of ['opt', 'draco', 'meshopt']) {
      if (!r[v]) continue;
      const url = `/models/zz-${r.id}-${v}.glb`;
      const buf = await (await fetch(url)).arrayBuffer();
      const times = [];
      for (let i = 0; i < 3; i++) {
        const L = new GLTFLoader();
        L.setMeshoptDecoder(MeshoptDecoder);
        L.setDRACOLoader(draco);
        const t0 = performance.now();
        const g = await L.parseAsync(buf.slice(0), '');
        times.push(performance.now() - t0);
        g.scene.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
      }
      times.sort((a, b) => a - b);
      out.push({ id: r.id, variant: v, bytes: buf.byteLength, ms: times[1] });
    }
  }
  return out;
}, { rows, port: PORT });

console.log('\nDECODE  (median of 3 parseAsync, real Chrome, warm cache)');
console.log('machine            variant      kB       ms');
for (const r of results) {
  console.log(r.id.padEnd(16) + r.variant.padEnd(10)
    + kB(r.bytes).padStart(8) + r.ms.toFixed(1).padStart(9));
}

await browser.close();
if (server) server.kill();
for (const r of rows) {
  for (const v of ['opt', 'draco', 'meshopt']) {
    rmSync(resolve(SRC, `zz-${r.id}-${v}.glb`), { force: true });
  }
}
rmSync(dracoDst, { recursive: true, force: true });
rmSync(resolve(ROOT, 'public', 'zz-probe.html'), { force: true });
console.log('\nDraco decoder that would have to ship alongside the page:');
for (const f of ['draco_decoder.wasm', 'draco_wasm_wrapper.js']) {
  console.log('  ' + f.padEnd(26) + kB(statSync(resolve(dracoSrc, f)).size).padStart(8) + ' kB');
}
process.exit(0);
