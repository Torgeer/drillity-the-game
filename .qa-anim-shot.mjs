/**
 * .qa-anim-shot.mjs — the on-screen half of the animation proof.
 *
 *   node .qa-anim-shot.mjs --headed [--model public/models/dth-crawler.glb] [--clip rod-change]
 *
 * `.qa-anim.mjs` proves the arbitration numerically in node, which is where
 * that question actually lives. This one proves the other thing a number
 * cannot: that a real browser, on the real GPU, through the real GLTFLoader,
 * draws a machine whose parts are in different places at different times.
 *
 * `--headed` is required for the same reason `tools/shoot.mjs` requires it:
 * headless Chrome cannot bind the discrete GPU on this machine.
 *
 * It draws the machine itself rather than booting the game, because
 * `gltfAnim.js` is not wired into `gltfRig.js` yet — that hook is two lines and
 * it belongs to whoever owns that file. What this proves is everything on THIS
 * side of the hook. It also does the one thing that would otherwise be assumed:
 * it runs `restoreNames()` exactly as `gltfRig.js` does, so the clip is bound
 * under the same broken-track-name condition the real loader creates.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { ensureServer } from './tools/devserver.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => {
  const i = process.argv.indexOf('--' + k);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const HEADED = process.argv.includes('--headed');
const MODEL_URL = arg('model', 'models/dth-crawler.glb');
const CLIP = arg('clip', 'rod-change');
const PORT = Number(arg('port', 5191));
const OUT = resolve(HERE, 'shots', 'anim');
/** The moments to photograph, in clip seconds. Chosen to straddle every move. */
const TIMES = [0.0, 3.0, 4.0, 7.5, 11.0, 12.6, 14.0, 15.5, 16.7];

if (!HEADED) {
  console.error('\n.qa-anim-shot needs --headed. Headless Chrome cannot bind the '
    + 'discrete GPU here and the capture is not worth having without it.\n');
  process.exit(2);
}
mkdirSync(OUT, { recursive: true });

const PAGE = `
<link rel="icon" href="data:,">
<style>html,body{margin:0;background:#12151a;overflow:hidden}canvas{display:block}</style>
<script type="module">
// Import three through the SAME module instance vite gave GLTFLoader, found by
// reading the URL vite rewrote into it. Guessing '/node_modules/.vite/deps/
// three.js?v=<hash>' would be a second copy of the library and a hash that
// changes on every install.
const src = await (await fetch('/node_modules/three/examples/jsm/loaders/GLTFLoader.js')).text();
const threeUrl = (src.match(/from "([^"]*deps\\/three\\.js[^"]*)"/) || [])[1]
  || '/node_modules/three/build/three.module.js';
const THREE = await import(threeUrl);
const { GLTFLoader } = await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');
const { readClips, createAnimator } = await import('/src/core/gltfAnim.js');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12151a);
scene.add(new THREE.HemisphereLight(0xbcd2ff, 0x3a3128, 1.5));
const key = new THREE.DirectionalLight(0xfff0dc, 2.4);
key.position.set(6, 12, 8); key.castShadow = true; scene.add(key);
const rim = new THREE.DirectionalLight(0x88a8ff, 0.8);
rim.position.set(-8, 5, -6); scene.add(rim);

const gltf = await new GLTFLoader().loadAsync(${JSON.stringify(MODEL_URL)});

// EXACTLY what gltfRig.js:restoreNames() does. This is the condition that
// breaks a stock AnimationMixer, so binding has to happen under it or the test
// is testing something easier than the real thing.
let restored = 0;
for (const [obj, ref] of gltf.parser.associations) {
  if (!ref || ref.nodes === undefined || !obj || !obj.isObject3D) continue;
  const authored = (gltf.parser.json.nodes[ref.nodes] || {}).name;
  if (authored && obj.name !== authored) { obj.name = authored; restored++; }
}

// assets.js is not up here, so give every material a plain shaded stand-in.
// This capture is about MOTION; the material contract has its own harness.
const mats = new Map();
gltf.scene.traverse((o) => {
  if (!o.isMesh) return;
  o.castShadow = o.receiveShadow = true;
  const n = (o.material && o.material.name) || 'x';
  if (!mats.has(n)) {
    const h = [...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    mats.set(n, new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL((h % 360) / 360, 0.22, 0.42),
      roughness: 0.62, metalness: 0.35,
    }));
  }
  o.material = mats.get(n);
});

const root = gltf.scene;
scene.add(root);
const clipset = readClips(THREE, gltf, 'qa');
const anim = createAnimator(THREE, clipset, root);

const box = new THREE.Box3().setFromObject(root);
const size = box.getSize(new THREE.Vector3());
const mid = box.getCenter(new THREE.Vector3());
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 400);
const r = Math.max(size.x, size.y, size.z);
camera.position.set(mid.x + r * 1.35, mid.y + r * 0.42, mid.z + r * 1.95);
camera.lookAt(mid.x, mid.y - r * 0.05, mid.z);

const g = new THREE.Mesh(new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0x2a2f37, roughness: 1 }));
g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g);

// ── the harness surface ────────────────────────────────────────────────────
// seek() steps the animator in real 1/60 s frames from zero, exactly the way a
// frame loop would, rather than jumping the clock. A runtime that only worked
// when time was handed to it in one lump would pass a cheaper test than this.
window.__qa = {
  restored,
  bytes: gltf.parser.json ? 1 : 0,
  clips: anim.describe(),
  problems: anim.problems(),
  seek(t) {
    anim.stopAll({ fadeOut: 0 });
    anim.play(${JSON.stringify(CLIP)}, { fadeIn: 0 });
    const DT = 1 / 60;
    for (let e = 0; e < t; e += DT) anim.update(DT);
    renderer.render(scene, camera);
    return { t, weight: anim.weight(${JSON.stringify(CLIP)}), probe: anim.probe() };
  },
  ready: true,
};
renderer.render(scene, camera);
</script>`;

const say = (m) => console.log(m);
console.log(`\n.qa-anim-shot  ${MODEL_URL}  clip "${CLIP}"`);
const server = await ensureServer(PORT, () => {});
const base = `http://localhost:${PORT}`;

const browser = await chromium.launch({
  channel: 'chrome',
  headless: false,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--hide-scrollbars', '--mute-audio'],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 720 } });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));

let failures = 0;
const ok = (c, w, d) => {
  if (c) say(`  PASS  ${w}${d ? '   ' + d : ''}`);
  else { failures++; say(`  FAIL  ${w}${d ? '   ' + d : ''}`); }
};

try {
  await page.route('**/__qa-anim-shot', (r) =>
    r.fulfill({ contentType: 'text/html', body: PAGE }));
  await page.goto(`${base}/__qa-anim-shot`, { waitUntil: 'load', timeout: 45_000 });
  await page.waitForFunction(() => window.__qa && window.__qa.ready, null, { timeout: 60_000 });

  const info = await page.evaluate(() => ({
    restored: window.__qa.restored,
    clips: window.__qa.clips,
    problems: window.__qa.problems,
  }));
  say(`  restored ${info.restored} sanitised node name(s) before binding`);
  ok(info.problems.length === 0, 'no refused clips in the browser', info.problems.join('|'));
  ok(info.clips.some((c) => c.name === CLIP), `clip "${CLIP}" bound in the browser`,
    JSON.stringify(info.clips));

  const shots = [];
  for (const t of TIMES) {
    const r = await page.evaluate((tt) => window.__qa.seek(tt), t);
    const file = resolve(OUT, `${CLIP}-${String(t.toFixed(1)).padStart(5, '0')}s.png`);
    await page.screenshot({ path: file, animations: 'allow', timeout: 60_000 });
    shots.push({ t, probe: r.probe, file });
  }

  // ── the assertion the whole file exists for ────────────────────────────
  const nodes = Object.keys(shots[0].probe);
  say(`\n  node                     t=${TIMES.map((t) => String(t).padStart(6)).join(' ')}`);
  let moved = 0;
  for (const n of nodes) {
    const isPos = n.startsWith('slide:');
    const vals = shots.map((s) => (isPos ? s.probe[n].position[1] : s.probe[n].quaternion[1]));
    const span = Math.max(...vals) - Math.min(...vals);
    if (span > 1e-4) moved++;
    say(`  ${n.padEnd(24)} ${vals.map((v) => v.toFixed(3).padStart(6)).join(' ')}`
      + `   span ${span.toFixed(4)}${span > 1e-4 ? '' : '   <-- DID NOT MOVE'}`);
  }
  ok(moved === nodes.length,
    'every claimed node is in a different place at different times, on the GPU',
    `${moved}/${nodes.length}`);
  ok(logs.filter((l) => l.startsWith('[pageerror]')).length === 0,
    'no page errors', logs.filter((l) => l.startsWith('[pageerror]')).join(' | '));

  writeFileSync(resolve(OUT, 'probe.json'), JSON.stringify(shots, null, 1));
  say(`\n  ${shots.length} frames captured -> shots/anim/`);
} finally {
  await browser.close().catch(() => {});
  // ensureServer() returns a stop() that is synchronous when it did not have
  // to start anything. Promise.resolve, not await-on-the-return.
  if (server && server.stop) await Promise.resolve(server.stop()).catch(() => {});
}

if (logs.length) console.log('\n  console:\n   ' + logs.slice(0, 12).join('\n   '));
console.log(`\n${failures ? 'FAIL' : 'PASS'}  .qa-anim-shot  ${failures} failure(s)\n`);
process.exit(failures ? 1 : 0);
