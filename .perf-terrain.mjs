/**
 * Precise attribution of the NON-RIG surface scene, for the terrain owner.
 *
 * Measures the way tools/shoot.mjs does (32 px scratch target, shadow
 * autoUpdate parked, the real camera so frustum culling applies), then hides
 * one subtree at a time. Two levels: the scene's own children, then inside
 * terrain-root.
 */
import { chromium, devices } from 'playwright';

const Q = process.argv[2] || 'high';
const REGION = process.argv[3] || null;

const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--hide-scrollbars', '--mute-audio'] });
const c = await b.newContext({ ...devices['iPhone 13 Pro'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await c.newPage();
await p.goto(`http://localhost:5178/?quality=${Q}&shot`, { waitUntil: 'load' });
await p.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 4500));

let out = null;
for (let attempt = 0; attempt < 5 && !out; attempt++) {
  try {
    out = await p.evaluate(([REGION]) => {
      const C = window.__DRILLITY, T = C.THREE;
      if (REGION && C.terrain && C.terrain.setRegion) C.terrain.setRegion(REGION);
      for (let i = 0; i < 10; i++) C.renderer.render(0.016);
      const gl = C.renderer.gl, info = gl.info;
      const prev = gl.shadowMap.autoUpdate; gl.shadowMap.autoUpdate = false;
      const rt = new T.WebGLRenderTarget(32, 32);
      const one = (scene, cam) => {
        info.reset(); gl.setRenderTarget(rt);
        try { gl.render(scene, cam); } catch (e) { void e; }
        gl.setRenderTarget(null);
        return { calls: info.render.calls, tris: info.render.triangles };
      };
      const full = one(C.scene, C.camera);
      const attribute = (parent) => {
        const rows = [];
        for (const ch of parent.children.slice()) {
          if (!ch.visible) continue;
          ch.visible = false;
          const w = one(C.scene, C.camera);
          ch.visible = true;
          const calls = full.calls - w.calls, tris = full.tris - w.tris;
          if (!calls && !tris) continue;
          rows.push({ name: ch.name || ch.type, type: ch.type, calls, tris, kids: ch.children.length });
        }
        return rows.sort((a, b2) => b2.calls - a.calls);
      };
      const scene = attribute(C.scene);
      const terrainRoot = C.scene.children.find((x) => (x.name || '') === 'terrain-root');
      const terrain = terrainRoot ? attribute(terrainRoot) : null;
      const rigGroup = C.rig && C.rig.group;
      let rigCalls = null;
      if (rigGroup) { const was = rigGroup.visible; rigGroup.visible = false; const w = one(C.scene, C.camera); rigGroup.visible = was; rigCalls = full.calls - w.calls; }
      const section = C.sectionScene && C.sectionCamera ? one(C.sectionScene, C.sectionCamera) : null;
      rt.dispose(); gl.shadowMap.autoUpdate = prev;
      return {
        quality: C.quality && C.quality.id, rigId: C.rig.getRigId(),
        region: C.terrain && C.terrain.getRegion ? C.terrain.getRegion() : (C.state && C.state.contract && C.state.contract.regionId) || null,
        surfaceTotal: full.calls, surfaceTris: full.tris, rigCalls,
        nonRigCalls: full.calls - (rigCalls || 0),
        section: section ? section.calls : null,
        scene, terrain,
      };
    }, [REGION]);
  } catch (e) {
    console.error('reloaded mid-measure, retrying:', String(e.message).slice(0, 70));
    await p.waitForFunction(() => !!(window.__DRILLITY && window.__DRILLITY.composer), null, { timeout: 90000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 5000));
  }
}
console.log(JSON.stringify(out, null, 1));
await b.close();
