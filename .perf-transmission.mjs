/**
 * What ONE transmissive material costs, measured.
 *
 * The claim behind three separate fixes in this tree — rigFactory.js:128,
 * terrain.js:2197 and now assets.js `resin` / `foam` — is that a single
 * MeshPhysicalMaterial with `transmission > 0` anywhere in the visible set
 * makes three.js run renderTransmissionPass(), which re-renders the ENTIRE
 * opaque list into a transmission target before the main pass. This measures
 * that directly instead of asserting it: A/B, on the live scene, by putting
 * one 3 cm quad into the frame and toggling only its transmission.
 *
 *   node .perf-transmission.mjs [port] [rig] [method]
 *
 * Headed on purpose — headless cannot bind the GPU on this machine.
 */
import { chromium, devices } from 'playwright';

const PORT = process.argv[2] || '5178';
const PAIRS = [
  ['bolter', 'rockbolt'],
  ['dth-crawler', 'dth'],
  ['crawler-lite', 'auger'],
  ['piling-leader', 'driven-pile'],
];

const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await c.newPage();
await p.addInitScript(() => {
  try { Object.defineProperty(location, 'reload', { value: () => {}, configurable: true }); } catch (e) { void e; }
});
p.on('pageerror', (e) => console.log('  page error: ' + String(e).slice(0, 160)));
await p.goto(`http://localhost:${PORT}/?quality=high&shot`, { waitUntil: 'load' });
await p.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 6000));

console.log('\n' + 'rig / method'.padEnd(30) + 'opaque'.padStart(8) + '  +transmissive'.padStart(15) + '   delta'.padStart(9) + '   x');
console.log('-'.repeat(76));

for (const [RIG, METHOD] of PAIRS) {
  const row = await p.evaluate(async ([RIG, METHOD]) => {
    const C = window.__DRILLITY, T = C.THREE;
    if (!C || !C.renderer) return { error: 'no renderer' };
    try { C.state.garage.rigId = RIG; } catch (e) { void e; }
    try { C.rig.setRig(RIG); C.rig.setMethod(METHOD); } catch (e) { return { error: 'setRig: ' + e.message }; }
    try { C.renderer.setCameraMode && C.renderer.setCameraMode('orbit'); } catch (e) { void e; }
    for (let i = 0; i < 24; i++) C.renderer.render(0.016);

    const gl = C.renderer.gl;
    const scene = C.renderer.scene || (C.rig.root && C.rig.root.parent);
    if (!scene) return { error: 'no scene' };

    // A 30 mm quad parked on the rig — the size of a resin cartridge end,
    // deliberately too small to matter for fill, so any delta is the PASS.
    const probeMat = new T.MeshPhysicalMaterial({
      color: 0xffffff, roughness: 0.2, metalness: 0,
      transmission: 0, thickness: 0.03, ior: 1.5, transparent: true, opacity: 1,
    });
    const probe = new T.Mesh(new T.PlaneGeometry(0.03, 0.03), probeMat);
    probe.position.set(0, 1.2, 0);
    scene.add(probe);

    const sample = () => {
      let best = Infinity;
      for (let i = 0; i < 6; i++) { C.renderer.render(0.016); const n = gl.info.render.calls; if (n < best) best = n; }
      return best;
    };
    // ON/OFF/ON/OFF so a drifting scene cannot decide the answer.
    const off = [], on = [];
    for (let k = 0; k < 3; k++) {
      probeMat.transmission = 0; probeMat.needsUpdate = true; off.push(sample());
      probeMat.transmission = 0.34; probeMat.needsUpdate = true; on.push(sample());
    }
    scene.remove(probe); probe.geometry.dispose(); probeMat.dispose();
    const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
    return { off: med(off), on: med(on) };
  }, [RIG, METHOD]).catch((e) => ({ error: e.message }));

  if (row.error) { console.log((RIG + ' / ' + METHOD).padEnd(30) + '  ERROR: ' + row.error); continue; }
  const d = row.on - row.off;
  console.log((RIG + ' / ' + METHOD).padEnd(30)
    + String(row.off).padStart(8) + String(row.on).padStart(15)
    + ('+' + d).padStart(9) + '   ' + (row.off ? (row.on / row.off).toFixed(2) : '-') + 'x');
}

console.log('\nOne transmissive material re-renders the opaque list. That is the whole cost,');
console.log('and it does not care how big the transmissive object is.\n');
await b.close();
