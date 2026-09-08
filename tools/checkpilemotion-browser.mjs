/** Headed-browser evidence for the bounded integrated pile ram adapter.
 * node tools/checkpilemotion-browser.mjs --prepare-only
 * node tools/checkpilemotion-browser.mjs --self-test
 * Requires root-granted pile-motion-browser lease before the live command:
 * node tools/checkpilemotion-browser.mjs --out evidence/pile-motion-browser-01
 * No fabricated simulation phase/depth. Funding and controls are explicit QA
 * inputs in a fresh context. Capture holds only an already rendered real frame.
 * Diagnostic ID rendering preserves original shader/depth/alpha operations.
 * Screenshots still require visual clearance review; this is not an FPS test.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceIdentity, SOURCE_IDENTITY_PATH } from './servedSourceIdentity.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const arg = (key, fallback) => { const i = process.argv.indexOf('--' + key); return i < 0 ? fallback : process.argv[i + 1]; };
const out = resolve(root, arg('out', 'evidence/pile-motion-browser-01'));
const port = Number(arg('port', 5250));
const lease = arg('lease', 'pile-motion-browser');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function manifest() {
  const files = [];
  const walk = at => { for (const e of readdirSync(at, { withFileTypes: true })) {
    const path = resolve(at, e.name); if (e.isDirectory()) walk(path); else if (e.isFile()) files.push(path);
  } };
  for (const path of ['src', 'public', 'node_modules/three/examples/jsm']) walk(resolve(root, path));
  for (const path of ['index.html', 'package.json', 'package-lock.json', 'vite.config.js',
    'tools/checkpilemotion-browser.mjs', 'tools/servedSourceIdentity.mjs', 'node_modules/three/build/three.module.js']) files.push(resolve(root, path));
  return Object.fromEntries(files.sort().map(path => [relative(root, path).replaceAll('\\', '/'), sha(readFileSync(path))]));
}
export function assessCapture(row) {
  const faults = [];
  if (!row.before?.held || !row.after?.held) faults.push('capture did not hold an observed live frame');
  if (JSON.stringify(row.before?.identity) !== JSON.stringify(row.after?.identity)) faults.push('capture identity/camera/pose drift');
  for (const s of [row.before, row.after]) {
    if (!s?.focused || s.visible !== 'visible' || s.contextLost || !s.assetsReady) faults.push('environment or assets invalid');
    if (s?.identity?.rig !== 'piling-leader' || s?.identity?.source !== 'glb'
      || s?.identity?.method !== 'driven-pile' || s?.identity?.screen !== 'site') faults.push('wrong actual machine/method/screen');
  }
  if (!row.visibility?.valid || !Number.isSafeInteger(row.visibility.visiblePixels)
    || row.visibility.visiblePixels <= 0) faults.push('ram has no proven visible rendered pixels');
  if (!row.visibility?.restored) faults.push('diagnostic material/render state not restored');
  return { valid: faults.length === 0, faults: [...new Set(faults)] };
}

if (process.argv.includes('--self-test')) {
  const endpoint = { held: true, focused: true, visible: 'visible', contextLost: false, assetsReady: true,
    identity: { rig: 'piling-leader', source: 'glb', method: 'driven-pile', screen: 'site', camera: [1, 2, 3] } };
  const row = { before: endpoint, after: structuredClone(endpoint), visibility: { valid: true, visiblePixels: 16, restored: true } };
  assert(assessCapture(row).valid);
  for (const edit of [r => { r.visibility.visiblePixels = 0; }, r => { r.visibility.restored = false; },
    r => { r.after.identity.camera[0] = 7; }, r => { r.before.held = false; },
    r => { r.after.assetsReady = false; }, r => { r.before.identity.source = 'procedural'; }]) {
    const bad = structuredClone(row); edit(bad); assert(!assessCapture(bad).valid);
  }
  console.log('PASS 7 capture-adjudication cases; no browser/server/GPU started.');
} else if (process.argv.includes('--prepare-only')) {
  console.log(JSON.stringify({ status: 'PREPARED_NOT_RUN', root, port, lease,
    sourceIdentity: sourceIdentity(root), inventoryFiles: Object.keys(manifest()).length,
    scenarios: ['orbit', 'hero'], viewport: { width: 390, height: 844, dpr: 2 },
    limits: ['No browser/GPU was started', 'Actual execution and visual clearance review remain required'] }));
} else {
  assert.equal(readFileSync(resolve(root, '../drillity-coordination/gpu-owner.txt'), 'utf8').trim(), lease,
    'Wait for the root coordinator to grant the graphics lease');
  assert(!existsSync(resolve(out, 'report.json')), 'Never overwrite evidence');
  assert(Number.isInteger(port) && port >= 1024 && port <= 65535 && ![5178, 5180].includes(port), 'Invalid/owned-by-others port');
  mkdirSync(out, { recursive: true });
  const report = { startedAt: new Date().toISOString(), status: 'RUNNING', sourceBefore: manifest(),
    cases: [], errors: [], cleanup: {}, semantics: {
      simulation: 'Canonical generated/accepted career contract, supported purchased loadout, actual simulator and natural phase progression. Explicit senior funding and operator controls are isolated test inputs.',
      holds: 'Phase selection occurs after an original render. Subsequent system/render dt is zero only while that already-observed frame is photographed; no state phase, depth, clock progress or physical constants are fabricated.',
      visibility: 'Diagnostic render target uses the same scene, camera, geometry and original shaders. The final fragment RGB is replaced with black or ram magenta after alpha/clipping/lighting. This proves depth-visible geometry pixels, not final beauty-pass contrast.',
      motion: 'Frame selection bands are synthetic sampling criteria, not physical timing specifications. No frame-rate/performance claim.',
      clearance: 'Normal screenshots need human review for ram/cap/casing clearance. Existing pile/carriage geometry and alignment are not changed or declared correct.' } };
  const save = () => writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2));
  let server, browser;
  const cancel = () => { report.cancelled = true; void browser?.close(); };
  process.on('SIGINT', cancel); process.on('SIGTERM', cancel);
  try {
    server = await createServer({ root, server: { host: '127.0.0.1', port, strictPort: true, hmr: false } });
    await server.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--mute-audio',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--window-size=600,1000'] });
    report.browser = browser.version();
    for (const camera of ['orbit', 'hero']) {
      const row = { camera, captures: [], actions: [], errors: [], httpFailures: [], requestFailures: [], assets: [] };
      report.cases.push(row); save();
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
        isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      let page; const assetReads = [];
      try {
        page = await context.newPage();
        page.on('pageerror', e => row.errors.push(String(e)));
        page.on('console', message => { if (message.type() === 'error') row.errors.push(message.text()); });
        page.on('requestfailed', r => row.requestFailures.push({ url: r.url(), reason: r.failure()?.errorText }));
        page.on('response', response => {
          if (response.status() >= 400) row.httpFailures.push({ url: response.url(), status: response.status() });
          const url = new URL(response.url());
          if (url.origin === `http://127.0.0.1:${port}` && /\.(?:glb|png|webp|woff2?)$/.test(url.pathname)) {
            assetReads.push(response.body().then(bytes => {
              const key = 'public' + decodeURIComponent(url.pathname);
              const digest = sha(bytes); row.assets.push({ url: response.url(), path: key, bytes: bytes.length, sha256: digest });
              if (report.sourceBefore[key] !== digest) throw Error(`Served asset differs from disk: ${key}`);
            }).catch(e => row.errors.push(String(e))));
          }
        });
        await page.goto(`http://127.0.0.1:${port}/?quality=high&glb=strict&shot&sound=0`, { waitUntil: 'domcontentloaded' });
        await page.bringToFront();
        await page.waitForFunction(() => window.__DRILLITY?.ui?.currentScene === 'menu', null, { timeout: 180000 });
        await page.waitForTimeout(350);
        row.servedSource = await (await page.request.get(`http://127.0.0.1:${port}${SOURCE_IDENTITY_PATH}`)).json();
        assert.deepEqual(row.servedSource, sourceIdentity(root), 'Wrong served source');
        row.setup = await page.evaluate(prepareScenario, { camera, seed: 20260908 });
        await page.waitForFunction(() => { const c = window.__DRILLITY, a = c.assets.stats();
          if (a.failed) throw Error('Texture failure'); return a.sets > 0 && a.setsReady === a.sets && !a.pending
            && (!c.terrain.siteModel.requested || c.terrain.siteModel.model); }, null, { timeout: 180000 });
        row.warm = await page.evaluate(() => window.__DRILLITY.renderer.warmShaders());
        assert.equal(row.warm.ready, true, 'Shader warm-up failed');
        await page.waitForTimeout(5000);
        row.harness = await page.evaluate(installHarness);
        await page.evaluate(() => window.__PILE_BROWSER.start());
        await page.waitForFunction(() => !document.querySelector('.sheet'), null, { timeout: 5000 });
        async function capture(label, request, requireVisibility = true) {
          await page.evaluate(request => window.__PILE_BROWSER.arm(request), request);
          await page.waitForFunction(() => !!window.__PILE_BROWSER.held, null, { timeout: 45000 });
          const item = { label, request, requireVisibility, before: await page.evaluate(() => window.__PILE_BROWSER.snapshot()) };
          row.captures.push(item); save();
          item.image = `${camera}-${label}.png`; await page.screenshot({ path: resolve(out, item.image) });
          item.imageSha256 = sha(readFileSync(resolve(out, item.image)));
          const diagnostic = await page.evaluate(() => window.__PILE_BROWSER.visibility());
          item.visibility = { ...diagnostic }; delete item.visibility.image;
          item.maskImage = `${camera}-${label}-visibility.png`;
          writeFileSync(resolve(out, item.maskImage), Buffer.from(diagnostic.image.split(',')[1], 'base64'));
          await page.evaluate(() => window.__PILE_BROWSER.frames(2));
          item.after = await page.evaluate(() => window.__PILE_BROWSER.snapshot());
          item.assessment = assessCapture(item);
          item.drawComparison = { before: item.before.draw.calls, after: item.after.draw.calls,
            equal: item.before.draw.calls === item.after.draw.calls,
            scope: 'Whole original beauty render before/after held-frame diagnostic; no rig-only or FPS claim' };
          if (!item.drawComparison.equal) { item.assessment.valid = false; item.assessment.faults.push('held-frame original draw count changed'); }
          // Pause sheets deliberately cover the scene. Their RAM STILLNESS is
          // checked separately; beauty-frame visibility remains mandatory.
          if (!requireVisibility) item.assessment = { valid: item.assessment.faults.every(f => f === 'ram has no proven visible rendered pixels'),
            faults: item.assessment.faults.filter(f => f !== 'ram has no proven visible rendered pixels') };
          await page.evaluate(() => window.__PILE_BROWSER.release()); save();
        }
        await capture('pitch-rest', { phase: 'pitch' });
        for (const [label, band] of [['rising', [.15, .30]], ['peak', [.47, .53]], ['falling', [.73, .86]], ['bottom', [0, .06]]]) {
          await capture(label, { phase: 'drilling', band });
        }
        row.pause = await page.evaluate(async () => {
          const h = window.__PILE_BROWSER; h.pause(); await h.frames(2);
          const before = h.snapshot(); await h.frames(45); const after = h.snapshot();
          return { before, after, sameRam: JSON.stringify(before.identity.ram) === JSON.stringify(after.identity.ram),
            sameSimulation: JSON.stringify(before.identity.sim) === JSON.stringify(after.identity.sim) };
        });
        await capture('paused', { paused: true }, false);
        assert(row.pause.sameRam && row.pause.sameSimulation && row.pause.after.paused, 'Actual pause advances ram or sim');
        await page.evaluate(() => window.__PILE_BROWSER.unpause());
        await page.waitForFunction(() => !window.__DRILLITY.ui.gameplayPaused);
        await page.waitForFunction(() => !document.querySelector('.sheet'));
        await page.waitForFunction(() => window.__DRILLITY.state.drill.phase === 'drilling');
        row.actions.push(await page.evaluate(() => window.__PILE_BROWSER.action('changeDolly')));
        await capture('dolly-rest', { phase: 'dolly-change' });
        await page.waitForFunction(() => window.__DRILLITY.state.drill.phase === 'drilling', null, { timeout: 30000 });
        row.actions.push(await page.evaluate(() => window.__PILE_BROWSER.action('takeSet')));
        await capture('take-set-rising', { phase: 'take-set', band: [.16, .30] });
        await capture('take-set-falling', { phase: 'take-set', band: [.73, .86] });
        await capture('re-drive-rest', { phase: 're-drive' });
        row.history = await page.evaluate(() => window.__PILE_BROWSER.history());
        await Promise.all(assetReads);
        assert(row.assets.some(a => a.path === 'public/models/piling-leader.glb'), 'Actual piling asset response missing');
        assert.equal(row.errors.length + row.httpFailures.length + row.requestFailures.length, 0, 'Browser/network errors');
        row.valid = row.captures.every(c => c.assessment.valid);
        row.visualReview = 'PENDING: inspect normal phase images for cap/casing collision, legibility and existing carriage/pile misalignment';
      } catch (error) { row.valid = false; row.failure = String(error.stack || error); }
      finally {
        if (page) try { row.restore = await page.evaluate(() => window.__PILE_BROWSER?.cleanup()); } catch (e) { row.restore = { error: String(e) }; }
        await context.close(); row.contextClosed = true; await Promise.all(assetReads); save();
      }
    }
    report.valid = report.cases.every(r => r.valid);
    report.status = report.valid ? 'CAPTURED_REQUIRES_VISUAL_REVIEW' : 'CAPTURE_FAILED';
  } catch (error) { report.valid = false; report.status = 'CAPTURE_FAILED'; report.errors.push(String(error.stack || error)); }
  finally {
    if (browser) try { await browser.close(); report.cleanup.browserClosed = true; } catch (e) { report.cleanup.browserError = String(e); }
    if (server) try { await server.close(); report.cleanup.serverClosed = true; } catch (e) { report.cleanup.serverError = String(e); }
    report.sourceAfter = manifest(); report.sourceUnchanged = JSON.stringify(report.sourceBefore) === JSON.stringify(report.sourceAfter);
    if (!report.sourceUnchanged) { report.valid = false; report.status = 'CAPTURE_FAILED'; report.errors.push('Source/assets changed during capture'); }
    if (report.cleanup.browserError || report.cleanup.serverError) report.valid = false;
    process.off('SIGINT', cancel); process.off('SIGTERM', cancel);
    report.finishedAt = new Date().toISOString(); save();
    console.log(JSON.stringify({ status: report.status, valid: report.valid, cases: report.cases.map(r => ({ camera: r.camera, valid: r.valid, failure: r.failure })), cleanup: report.cleanup }));
    process.exitCode = report.valid ? 0 : 1;
  }
}

async function prepareScenario({ camera, seed }) {
  const c = window.__DRILLITY, d = c.data, p = c.progression;
  if (innerWidth !== 390 || innerHeight !== 844) throw Error('Requested phone CSS viewport not active');
  const clone = v => JSON.parse(JSON.stringify(v));
  const need = (r, label) => { if (r?.ok !== true) throw Error(`${label}: ${r?.reason || 'refused'}`); return r; };
  if (c.state.contract || p.run || c.sim.active) throw Error('Fresh career required');
  const rig = 'piling-leader', method = d.getMethod('driven-pile');
  const { makeRandom } = await import('/src/core/contract.js');
  const region = d.REGIONS.find(r => d.methodsForRegion(r.id, d.MAX_LEVEL).some(m => m.id === method.id));
  if (!region) throw Error('No canonical piling region');
  const rand = makeRandom(seed); let contract, generatorDraw;
  for (generatorDraw = 0; generatorDraw < 1000; generatorDraw++) {
    const candidate = d.makeContract(region.id, d.MAX_LEVEL, rand);
    if (candidate?.methodId === method.id) { contract = candidate; break; }
  }
  if (!contract || contract.__stub) throw Error('Canonical piling contract missing');
  const grants = { xp: d.LEVELS.totalToMax, money: 100000000 };
  p.addXP(grants.xp, 'Pile browser QA'); p.addMoney(grants.money, 'Pile browser QA');
  await c.gltfRigs.load(rig);
  if (!c.state.unlocked.rigs.includes(rig)) need(p.purchaseRig(rig), 'Purchase rig');
  need(p.selectRig(rig), 'Select rig');
  for (const slot of Object.keys(c.state.garage.loadout)) need(p.equip(slot, null), 'Clear ' + slot);
  const loadout = d.defaultLoadoutFor(method.id, d.MAX_LEVEL);
  if (loadout.hammer !== 'impact-hammer-9t') throw Error('Supported impact hammer required');
  for (const [slot, id] of Object.entries(loadout)) {
    if (!c.state.garage.owned.includes(id)) need(p.purchase(id), 'Purchase ' + id);
    need(p.equip(slot, id), 'Equip ' + id); need(d.canEquip(c.state, slot, id), 'Verify ' + id);
  }
  const visiting = new Set();
  const cert = id => { if (c.state.player.certs.includes(id)) return;
    if (visiting.has(id)) throw Error('Certificate cycle'); visiting.add(id);
    const row = d.getCert(id); if (!row) throw Error('Unknown certificate');
    for (const dep of row.prereq) cert(dep); need(p.purchaseCert(id), 'Purchase certificate'); visiting.delete(id);
  };
  for (const id of contract.requiredCerts || []) cert(id);
  const preview = need(p.previewContract(contract), 'Preflight');
  if (preview.rigId !== rig) throw Error('Preflight rig substitution');
  const accepted = need(p.acceptContract(contract), 'Accept contract'); c.ui.show('site', { contract });
  c.renderer.setCameraMode(camera);
  const telemetry = c.sim.getTelemetry();
  if (!telemetry.active || telemetry.depth !== 0 || telemetry.timeSec !== 0 || telemetry.methodId !== method.id
    || telemetry.runId !== p.run?.runId || telemetry.attemptId !== p.run?.attemptId || c.sim.debug.state.syntheticGeology) throw Error('Accepted real-geology attempt did not start correctly');
  const controls = { feed: .65, rotation: .7, flush: .5 };
  for (const [key, value] of Object.entries(controls)) if (c.sim.setInput(key, value) === false) throw Error('Control refused');
  const sheet = c.ui.sheet({ title: 'Pile animation warm-up', body: document.createTextNode('The accepted attempt is paused while assets settle.') });
  if (!c.ui.gameplayPaused) throw Error('Warm-up did not pause');
  window.__PILE_SETUP = { sheet, rig, camera };
  const gl = c.renderer.gl.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
  return { grants, seed, generatorDraw, contract: clone(contract), loadout: clone(c.state.garage.loadout), preview, accepted,
    controls, telemetry: clone(telemetry), gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null };
}

function installHarness() {
  const c = window.__DRILLITY, T = c.THREE, gl = c.renderer.gl, restores = [], frameRows = [];
  const clone = v => JSON.parse(JSON.stringify(v));
  const root = c.rig.group.getObjectByName('rig:piling-leader');
  const ram = root?.getObjectByName('slide:hammer-ram'), cap = root?.getObjectByName('slide:drive-cap');
  if (!ram || !cap || ram.parent?.name !== 'slide:carriage') throw Error('Actual authored ram/cap chain missing');
  const ramMeshes = new Set(); ram.traverse(n => { if (n.isMesh) ramMeshes.add(n); });
  if (!ramMeshes.size) throw Error('Ram contains no visible geometry');
  let held = null, request = null, frame = 0, pauseSheet = null;
  const matrix = n => ({ position: n.position.toArray(), quaternion: n.quaternion.toArray(), scale: n.scale.toArray(), world: n.matrixWorld.toArray() });
  const assetsReady = () => { const s = c.assets.stats(); return s.sets > 0 && s.setsReady === s.sets && !s.pending && !s.failed; };
  const snapshot = () => ({ held: !!held, paused: c.ui.gameplayPaused, visible: document.visibilityState,
    focused: document.hasFocus(), contextLost: gl.getContext().isContextLost(), assetsReady: assetsReady(),
    identity: { rig: c.rig.getSpec().id, source: c.rig.getSpec().source, method: c.state.contract?.methodId,
      screen: c.ui.currentScene, cameraMode: c.renderer.cameraMode, contract: c.state.contract?.id,
      runId: c.progression.run?.runId, attemptId: c.progression.run?.attemptId, loadout: clone(c.state.garage.loadout),
      viewport: clone(c.viewport), band: clone(c.renderer.bands.surface), quality: clone(c.quality),
      camera: { world: c.camera.matrixWorld.toArray(), projection: c.camera.projectionMatrix.toArray() },
      ram: matrix(ram), cap: matrix(cap), carriage: matrix(ram.parent),
      sim: { active: c.state.drill.active, phase: c.state.drill.phase, timeSec: c.state.drill.timeSec,
        depth: c.state.drill.depth, phaseT: c.state.drill.phaseT, phaseDur: c.state.drill.phaseDur,
        hammerPhase01: c.state.drill.hammerPhase01, hammerDropM: c.state.drill.hammerDropM, blows: c.state.drill.blows } },
    drawingBuffer: [gl.domElement.width, gl.domElement.height], draw: clone(gl.info.render), observedFrame: held?.frame ?? frame });
  let firstUpdate = true;
  for (const s of c.systems) {
    if (typeof s.update !== 'function') continue; const old = s.update;
    const ownsClock = firstUpdate; firstUpdate = false;
    s.update = function(dt, ...rest) {
      if (held && ownsClock) { c.clock.t = held.clock.t; c.clock.dt = 0; c.clock.fps = held.clock.fps; c.state.tSec = held.clock.tSec; }
      return old.call(this, held ? 0 : dt, ...rest);
    }; restores.push(() => { s.update = old; });
  }
  const oldRender = c.renderer.render;
  c.renderer.render = function(dt, ...args) {
    const result = oldRender.call(this, held ? 0 : dt, ...args); frame++;
    if (!held) {
      const d = c.state.drill;
      frameRows.push({ frame, at: performance.now(), phase: d.phase, timeSec: d.timeSec, depth: d.depth,
        cycle: d.hammerPhase01, drop: d.hammerDropM, ram: ram.position.toArray(), draws: gl.info.render.calls });
      if (request && (!request.phase || d.phase === request.phase)
        && (request.paused === undefined || c.ui.gameplayPaused === request.paused)
        && (!request.band || (Number.isFinite(d.hammerPhase01) && d.hammerPhase01 >= request.band[0] && d.hammerPhase01 <= request.band[1]))) {
        held = { frame, clock: { t: c.clock.t, fps: c.clock.fps, tSec: c.state.tSec } }; request = null;
      }
    }
    return result;
  }; restores.push(() => { c.renderer.render = oldRender; });
  const frames = count => new Promise((resolve, reject) => { let handle; const deadline = setTimeout(() => { cancelAnimationFrame(handle); reject(Error('Frame wait timeout')); }, 30000);
    const tick = () => { if (--count <= 0) { clearTimeout(deadline); resolve(); } else handle = requestAnimationFrame(tick); }; handle = requestAnimationFrame(tick);
  });
  function visibility() {
    if (!held) throw Error('Visibility requires an observed held frame');
    const band = c.renderer.bands.surface, dpr = gl.getPixelRatio();
    const w = Math.max(1, Math.round(band.w * dpr)), h = Math.max(1, Math.round(band.h * dpr));
    const target = new T.WebGLRenderTarget(w, h, { depthBuffer: true, stencilBuffer: false });
    const old = { target: gl.getRenderTarget(), viewport: gl.getViewport(new T.Vector4()).clone(),
      scissor: gl.getScissor(new T.Vector4()).clone(), scissorTest: gl.getScissorTest(),
      clearColor: gl.getClearColor(new T.Color()).clone(), clearAlpha: gl.getClearAlpha(),
      autoClear: gl.autoClear, background: c.scene.background, shadowAuto: gl.shadowMap.autoUpdate };
    const assignments = [], clones = new Map(), materialState = new Map();
    let restored = false, image, visiblePixels = 0, minX = w, minY = h, maxX = -1, maxY = -1;
    function replaceFinalColor(shader, target) {
      const match = /void\s+main\s*\([^)]*\)\s*\{/.exec(shader);
      if (!match) throw Error('Cannot identify shader main for visibility mask');
      let depth = 1, i = match.index + match[0].length;
      for (; i < shader.length && depth; i++) {
        if (shader.slice(i, i + 2) === '//') { const end = shader.indexOf('\n', i); i = end < 0 ? shader.length : end; }
        else if (shader.slice(i, i + 2) === '/*') { const end = shader.indexOf('*/', i + 2); if (end < 0) throw Error('Unclosed shader comment'); i = end + 1; }
        else if (shader[i] === '{') depth++; else if (shader[i] === '}') depth--;
      }
      if (depth) throw Error('Unbalanced shader main');
      const at = i - 1;
      return shader.slice(0, at) + `\ngl_FragColor.rgb = vec3(${target ? '1.0, 0.0, 1.0' : '0.0'});\n` + shader.slice(at);
    }
    try {
      c.scene.traverse(node => {
        if (!node.material) return;
        const isTarget = ramMeshes.has(node), original = node.material;
        const convert = m => {
          const key = m.uuid + ':' + isTarget;
          if (!clones.has(key)) {
            if (!materialState.has(m)) materialState.set(m, { userData: m.userData, descriptors: Object.getOwnPropertyDescriptors(m.userData) });
            // Material.copy JSON-clones userData. Shader handles may be cyclic
            // and must stay live references; clone the material, then shallow
            // copy its metadata. No asynchronous work occurs in this section.
            const data = m.userData; let copy;
            try { m.userData = {}; copy = m.clone(); } finally { m.userData = data; }
            copy.userData = { ...data }; const hook = m.onBeforeCompile;
            copy.onBeforeCompile = function(shader, renderer) { hook?.call(this, shader, renderer); shader.fragmentShader = replaceFinalColor(shader.fragmentShader, isTarget); };
            copy.customProgramCacheKey = () => m.customProgramCacheKey() + ':pile-visibility:' + isTarget;
            clones.set(key, copy);
          }
          return clones.get(key);
        };
        assignments.push([node, original]); node.material = Array.isArray(original) ? original.map(convert) : convert(original);
      });
      c.scene.background = null; gl.shadowMap.autoUpdate = false; gl.autoClear = true;
      gl.setRenderTarget(target); gl.setScissorTest(false); gl.setClearColor(0x000000, 1); gl.clear(); gl.render(c.scene, c.camera);
      const data = new Uint8Array(w * h * 4); gl.readRenderTargetPixels(target, 0, 0, w, h, data);
      const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
      const context = canvas.getContext('2d'), pixels = context.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const from = (y * w + x) * 4, to = ((h - 1 - y) * w + x) * 4;
        pixels.data.set(data.subarray(from, from + 4), to);
        if (data[from] > 16 && data[from + 2] > 16 && data[from + 1] < 5 && Math.abs(data[from] - data[from + 2]) < 5) {
          visiblePixels++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, h - 1 - y); maxY = Math.max(maxY, h - 1 - y);
        }
      }
      context.putImageData(pixels, 0, 0); image = canvas.toDataURL('image/png');
    } finally {
      for (const [node, material] of assignments) node.material = material;
      for (const m of clones.values()) m.dispose(); target.dispose();
      // Existing compile hooks can close over the original material and store
      // userData.shader. Restore those references as well as mesh assignments.
      for (const [material, state] of materialState) {
        material.userData = state.userData;
        for (const key of Reflect.ownKeys(material.userData)) if (!Object.hasOwn(state.descriptors, key)) delete material.userData[key];
        Object.defineProperties(material.userData, state.descriptors);
      }
      c.scene.background = old.background; gl.shadowMap.autoUpdate = old.shadowAuto; gl.autoClear = old.autoClear;
      gl.setRenderTarget(old.target); gl.setViewport(old.viewport); gl.setScissor(old.scissor); gl.setScissorTest(old.scissorTest);
      gl.setClearColor(old.clearColor, old.clearAlpha);
      restored = assignments.every(([node, material]) => node.material === material) && gl.getRenderTarget() === old.target;
    }
    return { valid: visiblePixels > 0 && restored, visiblePixels, width: w, height: h, dpr, restored,
      cssArea: visiblePixels / (dpr * dpr), pixelBounds: visiblePixels ? { minX, minY, maxX, maxY } : null,
      surfaceBand: clone(band), ramMeshes: ramMeshes.size, image,
      limitation: 'ID pixels establish scene-depth visibility only; final lighting contrast and cap/casing clearance require the companion normal screenshot.' };
  }
  window.__PILE_BROWSER = {
    get held() { return held; }, snapshot, visibility, frames,
    start() { window.__PILE_SETUP.sheet.close(); },
    arm(next) { if (held || request) throw Error('Capture already held/armed'); request = next; },
    release() { held = null; request = null; },
    pause() { if (held) throw Error('Release frame before actual pause'); pauseSheet = c.ui.sheet({ title: 'Pause proof', body: document.createTextNode('The actual UI pause holds the simulator.') }); },
    unpause() { pauseSheet?.close(); pauseSheet = null; },
    action(name) { if (held) throw Error('Cannot act on held frame'); const result = c.sim.pulse(name); if (!result?.ok) throw Error(`${name}: ${result?.reason || 'refused'}`); return { name, result, at: performance.now(), phase: c.state.drill.phase }; },
    history() { return clone(frameRows); },
    cleanup() { held = null; request = null; pauseSheet?.close(); window.__PILE_SETUP.sheet.close();
      for (const restore of restores.reverse()) restore(); return { restored: true, frames: frameRows.length }; },
  };
  return { ram: ram.name, cap: cap.name, parent: ram.parent.name, ramMeshes: ramMeshes.size,
    authoredRest: ram.position.toArray(), stroke: ram.userData.stroke_m, source: c.rig.getSpec().source };
}
