/** Headed root-integrated work-light smoke. Existing root server only; no build.
 * Run from root: node tools/checkundergroundlightbrowser.mjs
 * Requires exact shared GPU lease underground-light-bindings. No FPS/appearance verdict.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf('--' + name); return i < 0 ? fallback : args[i + 1]; };
const port = Number(flag('port', '5198'));
if (port !== 5198) throw Error('This root smoke is scoped to the root server on 5198');
const base = `http://127.0.0.1:${port}`;
const lease = resolve(flag('lease', '../threads/drillity-coordination/gpu-owner.txt'));
const out = resolve(flag('out', 'shots/underground-light-bindings'));
const checkLease = () => { if (readFileSync(lease, 'utf8').trim() !== 'underground-light-bindings') throw Error('GPU lease is not underground-light-bindings'); };
const sourcePaths = ['src/core/env.js', 'src/core/gltfRig.js', 'src/rig/rigFactory.js',
  'src/game/data.js', 'src/main.js', 'src/core/renderer.js', 'src/core/contract.js'];
const modelPaths = ['raisebore', 'tunnel-jumbo', 'bolter', 'longhole-rig'].map(id => `public/models/${id}.glb`);
const paths = [...sourcePaths, ...modelPaths, 'tools/checkundergroundlightbrowser.mjs'];
const hash = value => createHash('sha256').update(value).digest('hex');
const hashes = () => Object.fromEntries(paths.map(path => [path, hash(readFileSync(resolve(path)))]));
const matrix = [
  { name: 'raisebore', id: 'raisebore', method: 'raise-boring', lamps: { L: 'table-work-light', R: 'feed-work-light' } },
  { name: 'direct-raisebore-to-jumbo', id: 'tunnel-jumbo', method: 'tunnel-jumbo', lamps: { L: 'boom-l-lamp-0', R: 'boom-r-lamp-0' } },
  { name: 'rockbolt-bolter', id: 'bolter', method: 'rockbolt', lamps: { L: 'feed-work-light' } },
  { name: 'rockbolt-longhole', id: 'longhole-rig', method: 'rockbolt', lamps: { L: 'feed-head' } },
  { name: 'rockbolt-jumbo', id: 'tunnel-jumbo', method: 'rockbolt', lamps: { L: 'boom-l-lamp-0' } },
];
checkLease();
mkdirSync(out, { recursive: true });
const report = { evidence: 'Actual headed GLB work-light bindings and manual-review screenshots',
  limitations: ['No FPS, performance, pixel-derived appearance or <=70 draw-count certification.',
    'System and renderer methods are temporarily paused in this private page only; actual original methods perform settling and rendering.',
    'Production env-before-rig ordering is retained during settling. Frozen samples explicitly run rig.update(0), then env.update(0), to measure the settled boundary; this does not prove same-frame tracking in motion.',
    'Transition warnings are preserved separately; steady samples fail work-light diagnostics.'],
  sourceBefore: hashes(), cases: [], failures: [], warnings: [], errors: [], resourcesFailed: [],
  servedSourceForms: {}, browserStarted: false, browserClosed: false };
let phase = 'source-verification', caseName = null, browser, context, page;
function exactServedSource(body, local, path) {
  const normalize = text => text.replaceAll('\r\n', '\n');
  const expected = normalize(local);
  // The root server can return the source verbatim for ?raw; Vite can return
  // a JSON-string export. Either form must match the entire local source.
  if (normalize(body) === expected) return { source: expected, form: 'verbatim' };
  const match = body.match(/^\s*export default ("(?:[^"\\]|\\.)*")/s);
  if (match) {
    try {
      const decoded = JSON.parse(match[1]);
      if (normalize(decoded) === expected) return { source: expected, form: 'vite-json-export' };
    } catch { /* Invalid JSON is an identity failure, never permission to skip. */ }
  }
  throw Error(`Served source differs from root in both supported response forms: ${path}`);
}
async function verifyServed() {
  const verified = {};
  for (const path of sourcePaths) {
    const response = await fetch(`${base}/${path}?raw`);
    if (!response.ok) throw Error(`Source HTTP ${response.status}: ${path}`);
    const verifiedSource = exactServedSource(await response.text(), readFileSync(resolve(path), 'utf8'), path);
    report.servedSourceForms[path] = verifiedSource.form;
    verified[path] = hash(verifiedSource.source);
  }
  for (const path of modelPaths) {
    const response = await fetch(`${base}/${path.slice('public/'.length)}`);
    if (!response.ok) throw Error(`Model HTTP ${response.status}: ${path}`);
    const actual = hash(Buffer.from(await response.arrayBuffer()));
    if (actual !== report.sourceBefore[path]) throw Error(`Served GLB differs from root: ${path}`);
    verified[path] = actual;
  }
  return verified;
}
try {
  report.served = await verifyServed();
  checkLease(); phase = 'boot';
  browser = await chromium.launch({ channel: 'chrome', headless: false,
    args: ['--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
  report.browserStarted = true;
  context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  // Suppress HMR only: resources and source remain the actual root server.
  await context.route('**/@vite/client', r => r.fulfill({ contentType: 'application/javascript', body:
    `export const createHotContext=()=>({on(){},off(){},send(){},accept(){},acceptExports(){},dispose(){},prune(){},decline(){},invalidate(){},data:{}});export function updateStyle(id,content){let s=document.querySelector('style[data-vite-dev-id="'+id+'"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);}s.textContent=content;}export function removeStyle(){};export function injectQuery(u){return u;}export class ErrorOverlay extends HTMLElement {}` }));
  page = await context.newPage(); page.setDefaultTimeout(180000);
  const record = text => ({ case: caseName, phase, text });
  page.on('pageerror', error => report.errors.push(record(error.stack || error.message)));
  page.on('console', msg => {
    if (msg.type() === 'warning') report.warnings.push(record(msg.text()));
    if (msg.type() === 'error') report.errors.push(record(msg.text()));
  });
  page.on('requestfailed', req => report.resourcesFailed.push({ ...record(req.failure()?.errorText), url: req.url() }));
  page.on('response', response => { if (response.status() >= 400) report.resourcesFailed.push({ ...record(`HTTP ${response.status()}`), url: response.url() }); });
  await page.goto(`${base}/?quality=high&shot&mute`, { waitUntil: 'domcontentloaded' });
  await page.bringToFront();
  await page.waitForFunction(() => window.__DRILLITY?.__qa && document.querySelector('.menu') && !document.querySelector('.menu').hidden);
  await page.evaluate(() => {
    const c = window.__DRILLITY;
    const updates = [...new Set([...c.systems, c.sim, c.ui])].filter(s => typeof s?.update === 'function').map(s => [s, s.update]);
    const p = window.__undergroundLightQA = { updates, render: c.renderer.render, events: [], unsubscribe: null };
    for (const [s] of updates) s.update = () => {};
    c.renderer.render = () => {};
    p.unsubscribe = c.bus.on(c.EVENTS.RIG_CHANGE, event => p.events.push({ ...event }));
    p.step = dt => { for (const s of c.systems) { const entry = updates.find(([owner]) => owner === s); if (entry && s !== c.sim) entry[1].call(s, dt, c.state); } };
    p.update = owner => { const entry = updates.find(([s]) => s === owner); if (!entry) throw Error('Missing original system update'); entry[1].call(owner, 0, c.state); };
    p.sample = lamps => {
      // Explicitly sample AFTER the actual rig writes its pose and the actual
      // environment consumes it. Neither binding logic nor transforms are mocked.
      p.update(c.rig); p.update(c.env); c.scene.updateMatrixWorld(true);
      const pos = node => node.getWorldPosition(new c.THREE.Vector3()).toArray();
      const published = c.rig.getWorkLights();
      const bindings = Object.entries(lamps).map(([side, name]) => {
        const found = published.filter(lamp => lamp.name === name);
        if (found.length !== 1) throw Error(`Expected one actual descriptor ${name}, got ${found.length}`);
        const descriptor = found[0], light = c.scene.getObjectByName(`ugFlood${side}`);
        if (!light?.isSpotLight || !descriptor.node || !descriptor.aim) throw Error(`Missing real mount/aim/light: ${name}`);
        return { side, name, descriptorNode: descriptor.node.uuid, descriptorAim: descriptor.aim.uuid,
          mount: pos(descriptor.node), aim: pos(descriptor.aim), light: pos(light), target: pos(light.target),
          angle: light.angle, expectedAngle: c.THREE.MathUtils.degToRad(descriptor.coneDeg) / 2,
          distance: light.distance, expectedDistance: descriptor.rangeM * 1.8,
          color: light.color.getHex(), expectedColor: descriptor.colourHex };
      });
      const fill = c.scene.getObjectByName('ugFloodR');
      return { source: c.rig.getActiveSourceKey(), rigId: c.rig.getSpec()?.id, method: c.state.contract?.methodId,
        siteMethod: c.state.world?.site?.methodId, underground: c.env.undergroundId,
        published: published.map(lamp => lamp.name), bindings,
        fill: { position: pos(fill), target: pos(fill.target), angle: fill.angle, distance: fill.distance, color: fill.color.getHex() },
        contextLost: c.renderer.gl.getContext().isContextLost() };
    };
  });
  for (const entry of matrix) {
    checkLease(); caseName = entry.name; phase = 'transition';
    const warningStart = report.warnings.length;
    const setup = await page.evaluate(async ({ id, method }) => {
      const c = window.__DRILLITY, p = window.__undergroundLightQA;
      const previousSource = c.rig.getActiveSourceKey();
      await c.__qa.loadModel(id);
      const eventStart = p.events.length;
      const contract = await c.__qa.startDemoContract({ method, depth: 0 });
      c.state.garage.rigId = id;
      if (!c.rig.setRig(id)) throw Error(`Public setRig refused ${id}`);
      c.rig.setMethod(method); c.state.drill.active = false;
      c.ui.show('site'); c.renderer.setCameraMode('hero');
      for (let i = 0; i < 90; i++) p.step(1 / 60);
      p.update(c.rig); p.update(c.env);
      const warm = await c.renderer.warmShaders();
      p.render.call(c.renderer, 0); p.render.call(c.renderer, 0);
      return { previousSource, contractId: contract.id, stub: !!contract.__stub, contractMethod: contract.methodId,
        rigChangeEvents: p.events.slice(eventStart), source: c.rig.getActiveSourceKey(), warm,
        actualSystemOrder: c.systems.map(s => s.__name || Object.entries(c).find(([, value]) => value === s)?.[0] || 'unknown') };
    }, entry);
    await page.waitForFunction(() => { const el = document.querySelector('.screen--site'); return el && !el.hidden && !el.classList.contains('is-entering'); });
    await page.evaluate(() => document.fonts.ready);
    // Preserve every transition warning. Only the steady cursor is cleared;
    // do not clear production warning deduplication or silence the console.
    const steadyStart = report.warnings.length;
    phase = 'steady';
    const snapshots = await page.evaluate(lamps => {
      const c = window.__DRILLITY, p = window.__undergroundLightQA, snapshots = [];
      for (let i = 0; i < 3; i++) { snapshots.push(p.sample(lamps)); p.render.call(c.renderer, 0); }
      return snapshots;
    }, entry.lamps);
    await page.screenshot({ path: resolve(out, entry.name + '-page.png') });
    await page.locator('#gl').screenshot({ path: resolve(out, entry.name + '-canvas.png') });
    const result = { ...entry, setup, snapshots, transitionWarnings: report.warnings.slice(warningStart, steadyStart),
      steadyWarnings: report.warnings.slice(steadyStart), screenshots: [entry.name + '-page.png', entry.name + '-canvas.png'] };
    report.cases.push(result);
    const fail = issue => report.failures.push({ case: entry.name, issue });
    const near = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-6;
    const sameVec = (a, b) => a.length === b.length && a.every((value, i) => near(value, b[i]));
    if (setup.stub || setup.contractMethod !== entry.method) fail('QA must use a generated contract of the requested method');
    if (entry.name === 'direct-raisebore-to-jumbo' && (setup.previousSource !== 'glb:raisebore' || setup.rigChangeEvents.length)) fail('Required direct raisebore-to-jumbo transition was not proven without RIG_CHANGE');
    for (const snapshot of snapshots) {
      if (snapshot.source !== `glb:${entry.id}` || snapshot.rigId !== entry.id || snapshot.method !== entry.method || snapshot.underground !== entry.method || snapshot.contextLost) fail('Actual GLB/method/underground/context mismatch');
      for (const binding of snapshot.bindings) {
        if (!sameVec(binding.mount, binding.light) || !sameVec(binding.aim, binding.target)) fail(`Live mount/aim mismatch: ${binding.name}`);
        if (!near(binding.angle, binding.expectedAngle) || !near(binding.distance, binding.expectedDistance) || binding.color !== binding.expectedColor) fail(`Actual descriptor optical mismatch: ${binding.name}`);
      }
    }
    if (JSON.stringify(snapshots[0]) !== JSON.stringify(snapshots[1]) || JSON.stringify(snapshots[1]) !== JSON.stringify(snapshots[2])) fail('Frozen binding snapshots are not stable');
    if (result.steadyWarnings.some(w => /\[env\].*(?:work light|lamp|binding)/i.test(w.text))) fail('Steady binding warning');
    if (entry.method === 'rockbolt') {
      const first = report.cases.find(row => row.method === 'rockbolt').snapshots[0].fill;
      const current = snapshots[0].fill;
      if (!sameVec(first.position, current.position) || !sameVec(first.target, current.target) || !near(first.angle, current.angle) || !near(first.distance, current.distance) || first.color !== current.color) fail('Rockbolt authored platform fill changed with alternative rig');
    }
    console.log(`${entry.name}: ${snapshots.length} frozen actual-node samples; transition warnings ${result.transitionWarnings.length}; steady warnings ${result.steadyWarnings.length}`);
  }
} catch (error) { report.failures.push({ case: caseName, phase, issue: error.stack || String(error) }); }
finally {
  phase = 'cleanup';
  if (page && !page.isClosed()) {
    try { await page.evaluate(() => { const c = window.__DRILLITY, p = window.__undergroundLightQA; if (!p) return;
      for (const [s, update] of p.updates) s.update = update;
      c.renderer.render = p.render; if (typeof p.unsubscribe === 'function') p.unsubscribe(); delete window.__undergroundLightQA;
    }); } catch (error) { report.failures.push({ issue: 'Page cleanup: ' + error.message }); }
  }
  try { if (context) await context.close(); } catch (error) { report.failures.push({ issue: 'Context close: ' + error.message }); }
  try { if (browser) { await browser.close(); report.browserClosed = true; } } catch (error) { report.failures.push({ issue: 'Browser close: ' + error.message }); }
  try { report.sourceAfter = hashes(); if (JSON.stringify(report.sourceBefore) !== JSON.stringify(report.sourceAfter)) report.failures.push({ issue: 'Root source/model changed during capture' }); }
  catch (error) { report.failures.push({ issue: 'Final source hashes: ' + error.message }); }
  try { checkLease(); } catch (error) { report.failures.push({ issue: error.message }); }
  const invalidGraphics = report.warnings.filter(w => /WebGL:.*(?:INVALID_|CONTEXT_LOST)|shader warm-up could not run|instrument pass unavailable|SMAA unavailable/i.test(w.text));
  if (invalidGraphics.length) report.failures.push({ issue: 'Graphics or required pipeline warning', warnings: invalidGraphics });
  report.passed = report.cases.length === matrix.length && report.failures.length === 0 && report.errors.length === 0 && report.resourcesFailed.length === 0 && report.browserStarted && report.browserClosed;
  writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(`UNDERGROUND LIGHT SMOKE: ${report.cases.length}/${matrix.length} cases; ${report.failures.length} assertions failed; passed=${report.passed}; browserClosed=${report.browserClosed}`);
process.exitCode = report.passed ? 0 : 1;
