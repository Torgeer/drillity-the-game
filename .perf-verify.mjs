/**
 * Visual verification of the cab-glazing change.
 *
 * Reconstructs the ORIGINAL transmissive material on the live rig, captures a
 * frozen frame, restores the shipped one, captures again, and reports the
 * difference over exactly the pixels the glazing paints — around a full orbit.
 * Both captures come from composer.render(0), which advances nothing, so the
 * camera, the animation and the particles are identical between them.
 */
import { chromium, devices } from 'playwright';

const Q = process.argv[2] || 'high';
const PAIRS = [
  ['crawler-lite', 'auger'], ['crawler-th', 'top-hammer'], ['dth-crawler', 'dth'],
  ['sonic-truck', 'sonic'], ['core-rig', 'core'], ['foundation-bg', 'rotary-kelly'],
  ['cfa-rig', 'cfa'], ['hdd-rig', 'hdd'], ['oil-derrick', 'oil-rotary'],
  ['rc-rig', 'rc'], ['piling-leader', 'driven-pile'], ['cable-percussion', 'cable-tool'],
  ['cpt-unit', 'site-investigation'], ['tunnel-jumbo', 'tunnel-jumbo'], ['bolter', 'rockbolt'],
];
const OPACITY = 0.60, TINT = 0.30;

const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await c.newPage();
await p.goto(`http://localhost:5178/?quality=${Q}&shot`, { waitUntil: 'load' });
await p.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 4000));

for (const [rig, method] of PAIRS) {
  const row = await p.evaluate(([RIG, METHOD, OPACITY, TINT]) => {
    const C = window.__DRILLITY, T = C.THREE;
    try { C.state.garage.rigId = RIG; } catch (e) { void e; }
    C.rig.setRig(RIG); C.rig.setMethod(METHOD);
    C.renderer.setCameraMode && C.renderer.setCameraMode('orbit');
    for (let i = 0; i < 14; i++) C.renderer.render(0.016);
    if (C.rig.getRigId() !== RIG) return { rigId: RIG, error: 'rig did not take (got ' + C.rig.getRigId() + ')' };

    const gl = C.renderer.gl, comp = C.composer, cv = document.getElementById('gl');
    const raw = gl.getContext(); const W = cv.width, H = cv.height;
    const shot = () => {
      comp.render(0); gl.setRenderTarget(null);
      const a = new Uint8Array(W * H * 4);
      raw.bindFramebuffer(raw.FRAMEBUFFER, null);
      raw.readPixels(0, 0, W, H, raw.RGBA, raw.UNSIGNED_BYTE, a);
      return a;
    };

    // the shipped cab glazing
    const meshes = []; const mats = new Map();
    C.scene.traverse((o) => {
      if (!o.isMesh && !o.isInstancedMesh) return;
      const l = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      if (l.some((m) => m && /:cab$/.test(m.name || ''))) { meshes.push(o); for (const m of l) if (/:cab$/.test(m.name || '')) mats.set(m.uuid, m); }
    });
    if (!meshes.length) return { rigId: RIG, note: 'no cab glazing mesh live' };
    const glass = [...mats.values()];
    const now = glass.map((m) => ({ m, opacity: m.opacity, transmission: m.transmission, side: m.side, color: m.color.clone() }));
    const toOriginal = () => { for (const s of now) { const m = s.m; m.transmission = 0.92; m.opacity = 1.0; m.side = T.DoubleSide; m.color.copy(s.color).multiplyScalar(1 / TINT); m.needsUpdate = true; } };
    const toShipped = () => { for (const s of now) { const m = s.m; m.transmission = 0; m.opacity = s.opacity; m.side = s.side; m.color.copy(s.color); m.needsUpdate = true; } };

    const samples = [];
    for (let k = 0; k < 6; k++) {
      for (let s = 0; s < 5; s++) C.renderer.render(0.28);

      // mask: what the glazing paints at this angle (with the shipped material)
      toShipped(); shot(); const ref = shot();
      for (const m of meshes) m.visible = false;
      shot(); const off = shot();
      for (const m of meshes) m.visible = true;
      const mask = new Uint8Array(ref.length / 4); let maskN = 0;
      for (let i = 0, j = 0; i < ref.length; i += 4, j++) {
        const d = Math.abs(ref[i] - off[i]) + Math.abs(ref[i + 1] - off[i + 1]) + Math.abs(ref[i + 2] - off[i + 2]);
        if (d > 12) { mask[j] = 1; maskN++; }
      }
      toOriginal(); shot(); const orig = shot();
      toShipped(); shot();

      let sum = 0, worst = 0, over16 = 0, wholeOver16 = 0;
      for (let i = 0, j = 0; i < ref.length; i += 4, j++) {
        const d = (Math.abs(ref[i] - orig[i]) + Math.abs(ref[i + 1] - orig[i + 1]) + Math.abs(ref[i + 2] - orig[i + 2])) / 3;
        if (d > 16) wholeOver16++;
        if (!mask[j]) continue;
        sum += d; if (d > worst) worst = d; if (d > 16) over16++;
      }
      samples.push({ px: maskN, pct: +(100 * maskN / (W * H)).toFixed(3), mean: +(sum / Math.max(1, maskN)).toFixed(2), worst: Math.round(worst),
        pctOver16: +(100 * over16 / Math.max(1, maskN)).toFixed(1), frameOver16Pct: +(100 * wholeOver16 / (W * H)).toFixed(3) });
    }
    const pick = (f) => Math.max(...samples.map(f));
    return { rigId: C.rig.getRigId(), maxGlazingPct: pick((s) => s.pct), meanDiff: +(samples.reduce((a, s) => a + s.mean, 0) / samples.length).toFixed(2),
      worstDiff: pick((s) => s.worst), maxPctOver16: pick((s) => s.pctOver16), maxFrameOver16Pct: pick((s) => s.frameOver16Pct) };
  }, [rig, method, OPACITY, TINT]);
  console.log(row.error || row.note
    ? String(row.rigId).padEnd(17) + (row.error || row.note)
    : `${String(row.rigId).padEnd(17)} glazing<=${String(row.maxGlazingPct).padStart(6)}% of frame  meanDiff=${String(row.meanDiff).padStart(6)}  worst=${String(row.worstDiff).padStart(3)}  pxOver16(inGlazing)=${String(row.maxPctOver16).padStart(5)}%  frameOver16=${String(row.maxFrameOver16Pct).padStart(6)}%`);
}
await b.close();
