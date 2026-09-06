// Actual headed framing check. Requires an existing server and an exclusive GPU
// lease. No FPS or whole-model occlusion certification. --port/--lease/--out
// override the local defaults. Original capture body passed12cases before this
// portable wrapper was added; see research/HERO_CAMERA_FRAMING.md.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const args = process.argv.slice(2);
const flag = (k,d) => {const i=args.indexOf('--'+k);return i<0?d:args[i+1];};
const lease=resolve(flag('lease','../threads/drillity-coordination/gpu-owner.txt'));
const out=resolve(flag('out','shots/hero-framing'));
const port=Number(flag('port','5198'));
assert.ok(Number.isInteger(port)&&port>0&&port<65536,'valid --port required');
const checkLease=()=>assert.equal(readFileSync(lease,'utf8').trim(),'hero-camera','exclusive hero-camera lease required');
checkLease();mkdirSync(out,{recursive:true});
const results = [];
const report = { results, errors: [], requestsFailed: [], passed: false, browserClosed: false };
const browser = await chromium.launch({ channel: 'chrome', headless: false,
  args: ['--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
try {
  for (const [width, height] of [[390, 844], [320, 740]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2,
      isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const errors = [], warnings = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text()); });
    page.on('requestfailed', req => report.requestsFailed.push({url:req.url(),error:req.failure()?.errorText}));
    await page.goto(`http://127.0.0.1:${port}/?quality=high&shot&mute`, { waitUntil: 'domcontentloaded' });
    await page.bringToFront();
    await page.waitForFunction(() => window.__DRILLITY?.__qa?.startDemoContract && window.__DRILLITY?.ui?.show,
      null, { timeout: 240000 });
    await page.evaluate(()=>{window.__DRILLITY.sim.update=()=>{};});
    for (const [id, method, region] of [
      ['crawler-lite', 'auger', 'nordic'], ['cfa-rig', 'cfa', 'german-site'],
      ['pd55', 'driven-pile', 'nordic'], ['tunnel-jumbo', 'tunnel-jumbo', 'nordic'],
      ['hdd-rig', 'hdd', 'nordic'], ['longhole-rig', 'longhole', 'nordic'],
    ]) {
      checkLease();
      const beforeErrors = errors.length;
      const seeded = await page.evaluate(async ({ id, method, region }) => {
        const c = window.__DRILLITY;
        await c.__qa.loadModel(id);
        const contract = await c.__qa.startDemoContract({ depth: 0, method, region });
        c.state.garage.rigId = id;
        c.rig.setRig(id); c.rig.setMethod(method);
        c.state.drill.active=false;
        c.ui.show('site'); c.renderer.setCameraMode('hero');
        await c.renderer.warmShaders();
        return { contractMethod: contract.methodId, source: c.rig.getActiveSourceKey() };
      }, { id, method, region });
      assert.equal(seeded.source, `glb:${id}`);
      await page.waitForFunction(id => {
        const c = window.__DRILLITY, f = c.renderer.heroFraming;
        const d = document.querySelector('.screen--site');
        return f?.rigId === id && c.camera.position.distanceTo(new c.THREE.Vector3(...f.position)) < 0.01
          && Math.abs(c.renderer.registration.collarErrPx) < 0.1
          && Math.abs(c.renderer.registration.groundErrPx) < 0.1
          && d && !d.hidden && !d.classList.contains('is-entering');
      }, id, { timeout: 60000 });
      const metrics = await page.evaluate(id => {
        const c = window.__DRILLITY, T = c.THREE, b = c.bands.surface;
        const spec = c.rig.getSpec();
        const root = c.rig.group.children.find(n => n.visible && n.userData.spec === spec);
        root.updateWorldMatrix(true, true);
        const framing = spec.glb.feedFraming || spec.glb.framing;
        const extent = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
        for (let i = 0; i < 8; i++) {
          const p = new T.Vector3(i & 1 ? framing.max[0] : framing.min[0],
            i & 2 ? framing.max[1] : framing.min[1], i & 4 ? framing.max[2] : framing.min[2])
            .applyMatrix4(root.matrixWorld).project(c.camera);
          const x = (p.x + 1) * b.w / 2, y = (1 - p.y) * b.h / 2;
          extent.left = Math.min(extent.left, x); extent.right = Math.max(extent.right, x);
          extent.top = Math.min(extent.top, y); extent.bottom = Math.max(extent.bottom, y);
        }
        const p = new T.Vector3().project(c.camera);
        const collar = { x: b.x + (p.x + 1) * b.w / 2, y: b.y + (1 - p.y) * b.h / 2 };
        return { id, source: c.rig.getActiveSourceKey(), scope: framing.scope || 'rest-pose',
          position: c.camera.position.toArray(), fov: c.camera.fov, aspect: c.camera.aspect,
          fit: c.renderer.heroFraming, extent, collar, bands: c.bands,
          registration: { ...c.renderer.registration }, sectionMode: c.geology.profileMode,
          contextLost: c.renderer.gl.getContext().isContextLost() };
      }, id);
      assert.equal(metrics.contextLost, false);
      assert.ok(metrics.extent.left >= width * 0.04 - 1);
      assert.ok(metrics.extent.right <= width * 0.96 + 1);
      assert.ok(metrics.extent.top >= metrics.bands.surface.h * 0.06 - 1);
      assert.ok(Math.abs(metrics.collar.y - metrics.bands.section.y) < 0.1);
      await page.screenshot({ path: resolve(out,`${id}-${width}.png`) });
      results.push({ width, height, seeded, metrics, errors: errors.slice(beforeErrors), warnings: warnings.slice() });
      assert.equal(errors.length,0,'No page/console errors in actual hero capture');
      assert.equal(report.requestsFailed.length,0,'No failed runtime resources');
      console.log(JSON.stringify({ id, width, camera: metrics.position, extent: metrics.extent,
        errors: errors.length - beforeErrors, scope: metrics.scope }));
    }
    await context.close();
  }
  report.passed=results.length===12;
} catch(error) {report.errors.push(error.stack||String(error));}
finally { await browser.close();report.browserClosed=true;writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)); }
console.log('HERO GPU: '+results.length+' cases; passed='+report.passed+'; browser closed.');
process.exitCode=report.passed?0:1;
