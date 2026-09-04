/** All three tiers still build, render and stay inside the rig budget. */
import { chromium, devices } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
for (const q of ['low', 'medium', 'high']) {
  const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + String(e).slice(0, 160)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  await p.addInitScript(() => { try { Object.defineProperty(location, 'reload', { value: () => {}, configurable: true }); } catch (e) { void e; } });
  await p.goto(`http://localhost:5178/?quality=${q}&shot`, { waitUntil: 'load' });
  await p.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 5000));
  const out = await p.evaluate(() => {
    const C = window.__DRILLITY, T = C.THREE;
    const gl = C.renderer.gl, info = gl.info;
    const worst = [];
    const prev = gl.shadowMap.autoUpdate; gl.shadowMap.autoUpdate = false;
    const rt = new T.WebGLRenderTarget(32, 32);
    const one = () => { info.reset(); gl.setRenderTarget(rt); try { gl.render(C.scene, C.camera); } catch (e) { void e; } gl.setRenderTarget(null); return info.render.calls; };
    for (const id of C.rig.listRigs()) {
      C.rig.setRig(id);
      for (let i = 0; i < 6; i++) C.renderer.render(0.016);
      const f = one(); const w = C.rig.group.visible; C.rig.group.visible = false; const wo = one(); C.rig.group.visible = w;
      worst.push({ id, surface: f, rig: f - wo });
    }
    rt.dispose(); gl.shadowMap.autoUpdate = prev;
    const trans = [];
    C.scene.traverse((o) => { const l = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []); for (const m of l) if (m && m.transmission > 0) trans.push(m.name || m.type); });
    const cab = [];
    C.scene.traverse((o) => { const l = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []); for (const m of l) if (m && /:cab$/.test(m.name || '')) cab.push({ name: m.name, opacity: m.opacity, transmission: m.transmission }); });
    return {
      quality: C.quality && C.quality.id, composer: !!C.composer,
      passes: C.composer ? C.composer.passes.length : 0,
      cabGlassInstances: new Set(cab.map((x) => x.name)).size, cabSample: cab[0] || null,
      transmissiveLive: [...new Set(trans)],
      rigMax: Math.max(...worst.map((w) => w.rig)), surfaceMax: Math.max(...worst.map((w) => w.surface)),
      overRig70: worst.filter((w) => w.rig > 70).map((w) => w.id + ':' + w.rig),
    };
  }).catch((e) => ({ error: String(e.message).slice(0, 120) }));
  console.log(q.toUpperCase().padEnd(7), JSON.stringify(out));
  if (errs.length) console.log('        errors:', errs.slice(0, 4));
  await c.close();
}
await b.close();
