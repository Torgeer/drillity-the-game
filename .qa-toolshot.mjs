/**
 * TOOL SHOOTER — look at a tool the way the shop card does, only big enough
 * to judge against a catalogue drawing.
 *
 * `measure-tools.mjs` proves a tool is *built*; `.qa-dimensions.mjs` proves its
 * quoted figures come off the mesh. Neither says whether the thing looks like
 * the product. This does: it boots `src/rig/tools.js` in a real browser, in the
 * same studio lighting `core/preview.js` uses for a shop thumbnail, and writes
 * one PNG per (id × wear) at a size you can actually read buttons on.
 *
 *   node .qa-toolshot.mjs --port 5178 dth-bit button-bit
 *   node .qa-toolshot.mjs --port 5178 --wear 0,1 --size 640 casing-shoe
 *   node .qa-toolshot.mjs --port 5178 --yaw 1.2 --pitch 0.9 auger-900
 *
 * HEADED by default — headless Chrome cannot bind the discrete GPU here and
 * the frames come back flat. Output lands in shots/tool/.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUT = resolve(ROOT, 'shots', 'tool');
mkdirSync(OUT, { recursive: true });

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const PORT = flag('port', '5187');
const SIZE = +flag('size', 512);
const TAG = flag('tag', '');
const WEARS = flag('wear', '0,0.55,1').split(',').map(Number);
const YAW = +flag('yaw', -0.6);
const PITCH = +flag('pitch', 0.42);
const ids = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));

const page = await (async () => {
  const b = await chromium.launch({ headless: false, channel: 'chrome', args: ['--mute-audio'] });
  const c = await b.newContext({ viewport: { width: SIZE + 40, height: SIZE + 40 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') console.log('  [console]', m.text().slice(0, 160)); });
  await p.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
  return p;
})();

await page.evaluate(async ({ size, port }) => {
  const THREE = await import(`http://localhost:${port}/node_modules/.vite/deps/three.js`)
    .catch(() => import(`http://localhost:${port}/node_modules/three/build/three.module.js`));
  const tools = await import(`http://localhost:${port}/src/rig/tools.js`);
  const T = THREE.default && THREE.default.Scene ? THREE.default : THREE;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  canvas.style.cssText = 'position:fixed;left:20px;top:20px;';
  document.body.innerHTML = '';
  document.body.style.background = '#0B0E12';
  document.body.appendChild(canvas);

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(2);
  renderer.setSize(size, size, false);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new T.Scene();
  scene.background = new T.Color(0x12161C);
  const key = new T.DirectionalLight(0xfff0d8, 3.1); key.position.set(3.2, 4.4, 3.0);
  const fill = new T.DirectionalLight(0x9fc6d8, 0.85); fill.position.set(-3.6, 1.2, 2.2);
  const rim = new T.DirectionalLight(0xF59E0B, 2.2); rim.position.set(-1.4, 2.0, -4.0);
  scene.add(key, fill, rim, new T.HemisphereLight(0x8FA6BF, 0x14181E, 0.9));
  const camera = new T.PerspectiveCamera(30, 1, 0.01, 100);
  const pivot = new T.Group(); scene.add(pivot);

  window.__SHOOT = async (id, wear, yaw, pitch) => {
    const g = tools.buildTool(T, { THREE: T }, id, { wear, lod: 'high' });
    pivot.clear(); pivot.add(g);
    pivot.rotation.set(0, yaw, 0);
    const box = new T.Box3().setFromObject(g);
    const c = box.getCenter(new T.Vector3());
    const r = Math.max(1e-3, box.getSize(new T.Vector3()).length() * 0.5);
    const d = r / Math.sin((camera.fov * Math.PI / 180) * 0.5) * 0.92;
    camera.position.set(c.x + d * Math.cos(pitch) * 0.62, c.y + d * Math.sin(pitch), c.z + d * Math.cos(pitch) * 0.78);
    camera.lookAt(c);
    camera.near = Math.max(0.001, d - r * 2); camera.far = d + r * 4;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    let draws = 0, tris = 0;
    g.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const n = o.geometry.index ? o.geometry.index.count : (o.geometry.attributes.position?.count || 0);
      draws++; tris += (n / 3) * (o.isInstancedMesh ? o.count : 1);
    });
    const png = canvas.toDataURL('image/png');
    g.userData.dispose(); pivot.clear();
    return { png, draws, tris: Math.round(tris), name: g.userData.spec?.name || id };
  };
}, { size: SIZE, port: PORT });

for (const id of ids) {
  for (const w of WEARS) {
    let r;
    try { r = await page.evaluate(([i, w, y, p]) => window.__SHOOT(i, w, y, p), [id, w, YAW, PITCH]); }
    catch (e) { console.log('FAIL', id, w, e.message.slice(0, 200)); continue; }
    const f = `${TAG}${id}-w${String(Math.round(w * 100)).padStart(3, '0')}.png`;
    writeFileSync(resolve(OUT, f), Buffer.from(r.png.split(',')[1], 'base64'));
    console.log(`${f.padEnd(42)} draws=${String(r.draws).padStart(3)} tris=${String(r.tris).padStart(6)}  ${r.name}`);
  }
}
await page.context().browser().close();
