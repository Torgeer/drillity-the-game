/**
 * The underground methods did not improve with the cab-glazing fix. Drive the
 * game into the real contract the harness shoots, then ask the same question:
 * is anything still forcing three's transmission pass, and what does it cost?
 */
import { chromium, devices } from 'playwright';

const Q = process.argv[2] || 'high';
const CASES = [['rockbolt', 'bolter'], ['tunnel-jumbo', 'tunnel-jumbo'], ['longhole', 'longhole-rig'], ['dth', 'dth-crawler']];

const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await c.newPage();
await p.addInitScript(() => { try { Object.defineProperty(location, 'reload', { value: () => {}, configurable: true }); } catch (e) { void e; } });
await p.goto(`http://localhost:5178/?quality=${Q}&shot`, { waitUntil: 'load' });
await p.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 4000));

for (const [method, rig] of CASES) {
  try {
    await p.evaluate(async ([M]) => {
      const C = window.__DRILLITY;
      if (C.__qa && C.__qa.startDemoContract) await C.__qa.startDemoContract({ method: M, depth: 8 });
    }, [method]);
  } catch (e) { console.log(method, 'startDemoContract failed:', String(e.message).slice(0, 80)); }
  await new Promise((r) => setTimeout(r, 2600));

  const row = await p.evaluate(([M, RIG]) => {
    const C = window.__DRILLITY, T = C.THREE;
    try { C.state.garage.rigId = RIG; } catch (e) { void e; }
    C.rig.setRig(RIG); C.rig.setMethod(M);
    for (let i = 0; i < 12; i++) C.renderer.render(0.016);
    const gl = C.renderer.gl, info = gl.info;
    const prev = gl.shadowMap.autoUpdate; gl.shadowMap.autoUpdate = false;
    const rt = new T.WebGLRenderTarget(32, 32);
    const one = () => { info.reset(); gl.setRenderTarget(rt); try { gl.render(C.scene, C.camera); } catch (e) { void e; } gl.setRenderTarget(null); return info.render.calls; };
    const rg = C.rig.group;
    const buckets = () => { const f = one(); const w = rg.visible; rg.visible = false; const wo = one(); rg.visible = w; return { surface: f, rig: f - wo, nonRig: wo }; };

    // every transmissive material live in the surface scene, and who wears it
    const rows = [];
    const seen = new Set();
    C.scene.traverse((o) => {
      if (!o.isMesh && !o.isInstancedMesh) return;
      let vis = o.visible, n = o.parent; while (vis && n) { if (!n.visible) vis = false; n = n.parent; }
      const l = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      for (const m of l) {
        if (!m || !(m.transmission > 0) || seen.has(m.uuid)) continue;
        seen.add(m.uuid);
        const path = (() => { const a = []; let k = o; while (k) { a.unshift(k.name || k.type); k = k.parent; } return a.join('/'); })();
        rows.push({ mat: m.name || m.type, transmission: +m.transmission.toFixed(2), visible: vis, path });
      }
    });

    const before = buckets();
    const all = new Map();
    C.scene.traverse((o) => { const l = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []); for (const m of l) if (m && m.transmission > 0) all.set(m.uuid, m); });
    const saved = [...all.values()].map((m) => [m, m.transmission]);
    for (const [m] of saved) { m.transmission = 0; m.needsUpdate = true; }
    const after = buckets();
    for (const [m, v] of saved) { m.transmission = v; m.needsUpdate = true; }
    rt.dispose(); gl.shadowMap.autoUpdate = prev;
    return { method: C.rig.getMethodId(), rigId: C.rig.getRigId(), scene: C.state && C.state.scene, before, after, transmissive: rows };
  }, [method, rig]);

  console.log(`${String(row.method).padEnd(14)} ${String(row.rigId).padEnd(14)} surf ${String(row.before.surface).padStart(3)} (rig ${String(row.before.rig).padStart(3)}, nonRig ${String(row.before.nonRig).padStart(3)})  ->  transmission off: surf ${String(row.after.surface).padStart(3)} (rig ${String(row.after.rig).padStart(3)})   saves ${row.before.surface - row.after.surface}`);
  for (const t of row.transmissive) console.log(`     ${t.visible ? 'VISIBLE' : 'hidden '} ${t.mat} (transmission ${t.transmission})  ${t.path.slice(0, 150)}`);
  if (!row.transmissive.length) console.log('     (nothing transmissive live)');
}
await b.close();
