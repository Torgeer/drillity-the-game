/**
 * Fleet sweep: for every rig, measure the harness's buckets with the
 * transmission pass live and with it off, in one browser session.
 *
 * node .perf-sweep.mjs [quality]
 */
import { chromium, devices } from 'playwright';

const Q = process.argv[2] || 'high';
const PAIRS = [
  ['crawler-lite', 'auger'], ['crawler-th', 'top-hammer'], ['dth-crawler', 'dth'],
  ['sonic-truck', 'sonic'], ['core-rig', 'core'], ['foundation-bg', 'rotary-kelly'],
  ['cfa-rig', 'cfa'], ['hdd-rig', 'hdd'], ['raisebore', 'raise-boring'],
  ['oil-derrick', 'oil-rotary'], ['rc-rig', 'rc'], ['tunnel-jumbo', 'tunnel-jumbo'],
  ['longhole-rig', 'longhole'], ['bolter', 'rockbolt'], ['piling-leader', 'driven-pile'],
  ['si-rig', 'site-investigation'], ['cable-percussion', 'cable-tool'], ['cpt-unit', 'site-investigation'],
];

const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await c.newPage();
await p.goto(`http://localhost:5178/?quality=${Q}&shot`, { waitUntil: 'load' });
await p.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 3500));

const rows = [];
for (const [rig, method] of PAIRS) {
  await p.evaluate(([r, m]) => {
    const C = window.__DRILLITY;
    try { C.state.garage.rigId = r; } catch (e) { void e; }
    C.rig.setRig(r); C.rig.setMethod(m);
  }, [rig, method]);
  await new Promise((r) => setTimeout(r, 1400));
  rows.push(await p.evaluate(() => {
    const C = window.__DRILLITY, T = C.THREE;
    const gl = C.renderer.gl, info = gl.info;
    const rt = new T.WebGLRenderTarget(32, 32);
    const prevAuto = gl.shadowMap.autoUpdate; gl.shadowMap.autoUpdate = false;
    const one = () => { info.reset(); gl.setRenderTarget(rt); try { gl.render(C.scene, C.camera); } catch (e) { void e; } gl.setRenderTarget(null); return { c: info.render.calls, t: info.render.triangles }; };
    const rg = C.rig.group;
    const measure = () => { const f = one(); const w = rg.visible; rg.visible = false; const wo = one(); rg.visible = w; return { full: f.c, without: wo.c, rig: f.c - wo.c, tris: f.t }; };

    const mats = new Map();
    C.scene.traverse((o) => { const l = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []); for (const m of l) if (m && !mats.has(m.uuid)) mats.set(m.uuid, m); });
    const tr = [...mats.values()].filter((m) => m.transmission > 0);

    // visible meshes actually in the rig group
    let vis = 0; rg.traverse((o) => { if (!(o.isMesh || o.isInstancedMesh || o.isPoints || o.isLine || o.isSprite)) return; let v = o.visible, n = o.parent; while (v && n) { if (!n.visible) v = false; n = n.parent; } if (v) vis++; });

    const before = measure();
    const saved = tr.map((m) => [m, m.transmission]);
    for (const [m] of saved) { m.transmission = 0; m.needsUpdate = true; }
    const after = measure();
    for (const [m, v] of saved) { m.transmission = v; m.needsUpdate = true; }
    gl.shadowMap.autoUpdate = prevAuto; rt.dispose();
    return { rigId: C.rig.getRigId(), methodId: C.rig.getMethodId(), visMeshes: vis,
      transMats: tr.map((m) => m.name || m.type), before, after };
  }));
  const r = rows[rows.length - 1];
  console.log(String(r.rigId).padEnd(17),
    'meshes=' + String(r.visMeshes).padStart(3),
    '| ON  surf=' + String(r.before.full).padStart(3) + ' rig=' + String(r.before.rig).padStart(3) + ' terr=' + String(r.before.without).padStart(3),
    '| OFF surf=' + String(r.after.full).padStart(3) + ' rig=' + String(r.after.rig).padStart(3),
    '| saved=' + String(r.before.full - r.after.full).padStart(3),
    '| trans=[' + r.transMats.join(',') + ']');
}
await b.close();
