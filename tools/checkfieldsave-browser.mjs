#!/usr/bin/env node
// Render the actual Menu, Settings, Garage and persistence modules in Chrome.
// No WebGL, no API permission bypass, and no replacement for location.reload.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argument = (key, fallback) => { const i = process.argv.indexOf('--' + key); return i < 0 ? fallback : process.argv[i + 1]; };
const output = resolve(root, argument('output', 'evidence/field-save-browser'));
const port = Number(argument('port', '5242'));
const leaseFile = resolve(root, '../drillity-coordination/gpu-owner.txt');
const lease = argument('lease', 'field-save-browser');
const fontMode = argument('font-mode', 'production');
assert(['production', 'fallback'].includes(fontMode), 'Unknown font mode');
const indexHTML = await readFile(resolve(root, 'index.html'), 'utf8');
const fontLinks = [...indexHTML.matchAll(/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g)].map(match => match[0]).join('\n');
if (fontMode === 'production') assert.match(fontLinks, /family=Inter.*family=Oswald/, 'Use actual production font stylesheets');
const bundle = await build({ absWorkingDir: root,
  entryPoints: ['tools/fixtures/field-save-browser.js'], bundle: true, format: 'esm', write: false,
  outdir: 'unused-field-save-output', metafile: true, loader: { '.png': 'dataurl' }, logLevel: 'silent' });
const js = bundle.outputFiles.find(file => file.path.endsWith('.js')).contents;
const css = bundle.outputFiles.find(file => file.path.endsWith('.css')).contents;
const sourcePaths = [...Object.keys(bundle.metafile.inputs), 'tools/checkfieldsave-browser.mjs', 'index.html'];
const digest = async path => createHash('sha256').update(await readFile(resolve(root, path))).digest('hex');
const hashes = Object.fromEntries(await Promise.all(sourcePaths.map(async path => [path, await digest(path)])));
if (process.argv.includes('--prepare-only')) {
  console.log(JSON.stringify({ status: 'PREPARED_NOT_RUN', inputs: sourcePaths.length, sourceHashes: hashes }));
  process.exit(0);
}
assert.equal((await readFile(leaseFile, 'utf8')).trim(), lease, 'Wait for the coordinator browser lease');
const report = { startedAt: new Date().toISOString(), status: 'RUNNING', sourceHashes: hashes,
  scope: 'Real Chrome DOM and native storage. Production progression, Menu, Settings, Garage and shell. Explicit senior resources/wear/fault injection; no naturally earned career, WebGL, phone Safari, assistive-device or performance claim.',
  fontMode, loadedFonts: [], cases: [], errors: [], warnings: [], requestFailures: [], geometry: [], navigations: [], documentsServed: 0 };
const server = createServer((req, res) => {
  if (req.url === '/fixture.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(js); }
  else if (req.url === '/fixture.css') { res.setHeader('Content-Type', 'text/css'); res.end(css); }
  else if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); }
  else if (req.url?.startsWith('/?scenario=')) {
    report.documentsServed++; res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,">'
      + (fontMode === 'production' ? fontLinks : '')
      + '<link rel="stylesheet" href="/fixture.css"><title>Field save browser acceptance</title><body><div id="ui"></div><script type="module" src="/fixture.js"></script></body></html>');
  } else { res.writeHead(404); res.end('Unknown fixture resource'); }
});
let browser, currentContext;
const snap = page => page.evaluate(() => fieldSaveFixture.snapshot());
const writes = snapshot => snapshot.calls.filter(call => call.operation !== 'getItem');
const near = (actual, expected) => assert(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
async function check(name, fn) {
  try { await fn(); report.cases.push({ name, status: 'PASS' }); console.log('PASS ' + name); }
  catch (error) {
    const page = currentContext?.pages()[0];
    const diagnostic = page && !page.isClosed() ? await page.evaluate(() => ({
      bootstrap: window.fieldSaveBootstrap || null, readyState: document.readyState,
      scene: window.fieldSaveFixture?.ui.currentScene || null, text: document.body.innerText.slice(0, 1600),
    })).catch(error => ({ failed: String(error) })) : null;
    report.cases.push({ name, status: 'FAIL', failure: error.stack, diagnostic }); console.log('FAIL ' + name + ': ' + error.message);
  }
}
async function newScenario(scenario, viewport) {
  await currentContext?.close();
  currentContext = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await currentContext.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ scenario, url: request.url(), reason: request.failure()?.errorText }));
  page.on('console', message => {
    if (message.type() === 'error') report.errors.push(message.text());
    if (message.type() === 'warning') report.warnings.push(message.text());
  });
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) report.navigations.push({ scenario, url: frame.url() }); });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    window.webglAttempts = [];
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (/webgl/i.test(type)) { window.webglAttempts.push(type); throw Error('Field-save DOM fixture forbids WebGL'); }
      return getContext.call(this, type, ...args);
    };
  });
  await page.goto(`http://127.0.0.1:${port}/?scenario=${scenario}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.fieldSaveFixture, null, { timeout: 30000 });
  if (fontMode === 'production') {
    const loaded = await page.evaluate(async () => {
      await Promise.all([document.fonts.load('700 13px Inter', 'Load saved career'), document.fonts.load('700 13px Oswald', 'GARAGE')]);
      await document.fonts.ready;
      return [...document.fonts].filter(face => face.status === 'loaded').map(face => face.family.replace(/["']/g, ''));
    });
    assert(loaded.includes('Inter') && loaded.includes('Oswald'), 'Both production font families must really load');
    report.loadedFonts.push({ scenario, viewport, families: [...new Set(loaded)] });
  }
  await page.waitForFunction(expected => fieldSaveFixture.ui.currentScene === expected,
    scenario.startsWith('grind-') ? 'garage' : 'menu');
  await page.waitForFunction(() => !document.querySelector('.screen:not([hidden]).is-entering'));
  assert.deepEqual(await page.evaluate(() => webglAttempts), []);
  return page;
}
async function viewportCollisions(page) {
  return page.evaluate(() => {
    const violations = [];
    const clip = (raw, el) => {
      const box = { left: Math.max(0, raw.left), right: Math.min(innerWidth, raw.right),
        top: Math.max(0, raw.top), bottom: Math.min(innerHeight, raw.bottom) };
      for (let node = el; node; node = node.parentElement) {
        const style = getComputedStyle(node), bound = node.getBoundingClientRect();
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return null;
        if (/(hidden|auto|scroll|clip)/.test(style.overflowX)) { box.left = Math.max(box.left, bound.left); box.right = Math.min(box.right, bound.right); }
        if (/(hidden|auto|scroll|clip)/.test(style.overflowY)) { box.top = Math.max(box.top, bound.top); box.bottom = Math.min(box.bottom, bound.bottom); }
      }
      return box.right - box.left > 1 && box.bottom - box.top > 1 ? box : null;
    };
    const intersects = (a, b) => a && b && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
      && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    const liveOverlay = [...document.querySelectorAll('.overlays > :not(.is-out)')].at(-1);
    const active = liveOverlay?.querySelector('[role$="dialog"]')
      || document.querySelector('.screen--' + fieldSaveFixture.ui.currentScene);
    if (!active) throw Error('No active content for whole-viewport collision check');
    const content = [];
    const walker = document.createTreeWalker(active, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    while (walker.nextNode()) {
      const text = walker.currentNode, el = text.parentElement;
      if (!text.textContent.trim() || el.closest('.toasts')) continue;
      range.selectNodeContents(text);
      for (const rect of range.getClientRects()) {
        const painted = clip(rect, el);
        if (painted) content.push({ label: text.textContent.trim(), box: painted });
      }
    }
    for (const el of active.querySelectorAll('button,input,[role="button"],[role="switch"]')) {
      if (el.closest('.toasts')) continue;
      const painted = clip(el.getBoundingClientRect(), el);
      if (painted) content.push({ label: el.getAttribute('aria-label') || el.textContent.trim() || el.type, box: painted });
    }
    // Pointer-events and inert do not remove painted ink. Include even a toast
    // outside the modal's accessibility tree when checking visual occlusion.
    const toastRects = [];
    for (const toast of document.querySelectorAll('.toast')) {
      const box = clip(toast.getBoundingClientRect(), toast);
      if (!box) continue;
      toastRects.push({ text: toast.textContent.trim(), box });
      for (const item of content) if (intersects(box, item.box)) violations.push(`Toast overlaps ${item.label}: ${toast.textContent.trim()}`);
    }
    const wallet = active.querySelector('.pcard__money');
    if (wallet) {
      const moneyBox = clip(wallet.getBoundingClientRect(), wallet);
      for (const el of active.querySelectorAll('.pcard__name,.pcard__role,.pcard__stats .pill')) {
        if (intersects(moneyBox, clip(el.getBoundingClientRect(), el))) violations.push('Wallet overlaps identity/chip: ' + el.textContent.trim());
      }
    }
    return { scene: fieldSaveFixture.ui.currentScene, toastRects, violations };
  });
}
async function geometry(page, selector, name) {
  const target = page.locator(selector);
  await target.scrollIntoViewIfNeeded();
  const result = await target.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const scope = el.closest('.save-notice,.panel,.modal__box') || el.parentElement;
    const scopeRect = scope.getBoundingClientRect();
    const violations = [];
    if (rect.width < 43.99 || rect.height < 43.99) violations.push('Target below 44 CSS pixels');
    if (rect.left < -0.5 || rect.right > innerWidth + 0.5 || rect.top < -0.5 || rect.bottom > innerHeight + 0.5) violations.push('Target clipped by viewport');
    if (scope.scrollWidth > scope.clientWidth + 1) violations.push('Panel overflows horizontally');
    for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor), box = ancestor.getBoundingClientRect();
      if (/(hidden|auto|scroll|clip)/.test(style.overflowY) && (rect.top < box.top - 1 || rect.bottom > box.bottom + 1)) violations.push('Target clipped by ' + ancestor.className);
    }
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    // Production deliberately removes disabled buttons from pointer hit
    // testing. Their own ancestor is the expected hit, not an occluding layer.
    const disabledPassThrough = el.matches(':disabled') && getComputedStyle(el).pointerEvents === 'none' && hit?.contains(el);
    if (!el.contains(hit) && !disabledPassThrough) violations.push('Target centre occluded by ' + hit?.className);
    const range = document.createRange();
    for (const button of scope.querySelectorAll('button')) {
      const box = button.getBoundingClientRect();
      if (box.width < 43.99 || box.height < 43.99) violations.push('Panel control below 44 CSS pixels: ' + button.textContent);
      if (box.left < scopeRect.left - 1 || box.right > scopeRect.right + 1) violations.push('Control exceeds panel width: ' + button.textContent);
      for (const label of button.querySelectorAll('.btn__label')) {
        range.selectNodeContents(label);
        for (const text of range.getClientRects()) if (text.left < box.left - 1 || text.right > box.right + 1) violations.push('Button label exceeds its target: ' + label.textContent);
      }
    }
    for (const node of scope.querySelectorAll('strong,p,dd,dt')) {
      range.selectNodeContents(node);
      for (const text of range.getClientRects()) {
        if (text.left < scopeRect.left - 1 || text.right > scopeRect.right + 1) violations.push('Text clipped: ' + node.textContent);
      }
    }
    const siblings = [...(scope.parentElement?.children || [])].filter(other => other !== scope && !other.hidden
      && !['absolute', 'fixed'].includes(getComputedStyle(other).position));
    for (const other of siblings) {
      const box = other.getBoundingClientRect();
      if (Math.min(scopeRect.right, box.right) - Math.max(scopeRect.left, box.left) > 1
        && Math.min(scopeRect.bottom, box.bottom) - Math.max(scopeRect.top, box.top) > 1) violations.push('Panel overlaps sibling ' + other.className);
    }
    return { target: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      panel: { x: scopeRect.x, y: scopeRect.y, width: scopeRect.width, height: scopeRect.height },
      text: scope.innerText, violations };
  });
  const viewport = await viewportCollisions(page);
  report.geometry.push({ name, ...result, viewport });
  await page.screenshot({ path: resolve(output, name + '.png') });
  assert.deepEqual(result.violations, [], `${name}: ${JSON.stringify(result)}`);
  assert.deepEqual(viewport.violations, [], `${name}: whole viewport ${JSON.stringify(viewport)}`);
}
async function activate(locator, mode = 'pointer') {
  if (mode === 'pointer') await locator.click();
  else { await locator.focus(); await locator.press(mode); }
}
async function settings(page) {
  await activate(page.getByRole('button', { name: 'Settings', exact: true }), 'Enter');
  await page.getByRole('dialog', { name: 'Settings' }).waitFor();
}
const menuAction = '.screen--menu .save-notice:not([hidden]) button';
const settingsAction = '.sheet:not(.is-out) .save-notice:not([hidden]) button';
try {
  await mkdir(output, { recursive: true });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  browser = await chromium.launch({ channel: 'chrome', headless: true,
    args: ['--disable-gpu', '--disable-webgl', '--disable-software-rasterizer', '--mute-audio'] });
  report.browser = browser.version(); report.port = port;
  const viewports = [{ width: 390, height: 844 }, { width: 360, height: 780 }, { width: 320, height: 568 }];
  for (const viewport of viewports) {
    const size = `${viewport.width}x${viewport.height}`;
    await check(size + ' normal clean career hides notices and idle updates write nothing', async () => {
      const page = await newScenario('normal', viewport);
      assert.equal(await page.locator('.screen--menu .save-notice:not([hidden])').count(), 0);
      await page.evaluate(() => { fieldSaveFixture.progression.save(); fieldSaveFixture.resetCalls(); fieldSaveFixture.pulse(50); });
      assert.deepEqual(writes(await snap(page)), []);
    });
    await check(size + ' quota failure remains visible in Menu and Settings and native retry saves once', async () => {
      const page = await newScenario('quota', viewport);
      assert.equal((await snap(page)).status.error, 'save-failed');
      await geometry(page, menuAction, size + '-quota-menu');
      await settings(page); await geometry(page, settingsAction, size + '-quota-settings');
      await page.evaluate(() => { fieldSaveFixture.setFaults({ quota: null }); fieldSaveFixture.resetCalls(); });
      await activate(page.locator(settingsAction), 'Space');
      const after = await snap(page);
      assert.equal(after.status.error, null); assert.equal(after.status.pending, false);
      assert.equal(JSON.parse(after.primary).player.money, after.career.player.money);
      assert.equal(writes(after).length, 2, 'one previous backup and one primary write for one activation');
      await page.evaluate(() => { fieldSaveFixture.resetCalls(); fieldSaveFixture.pulse(50); });
      assert.deepEqual(writes(await snap(page)), []);
    });
    for (const scenario of ['future', 'unreadable']) await check(size + ' ' + scenario + ' protection preserves bytes without background writes', async () => {
      const page = await newScenario(scenario, viewport), before = await snap(page);
      assert.equal(before.status.blocked.reason, scenario === 'future' ? 'newer-save-version' : 'unreadable-save');
      await geometry(page, menuAction, size + '-' + scenario + '-menu');
      await settings(page); await geometry(page, settingsAction, size + '-' + scenario + '-settings');
      await page.evaluate(() => { fieldSaveFixture.resetCalls(); fieldSaveFixture.progression.addMoney(30); fieldSaveFixture.pulse(50); });
      await activate(page.locator(settingsAction), 'Enter');
      const after = await snap(page);
      assert.equal(after.primary, before.primary); assert.equal(after.backup, before.backup);
      assert.deepEqual(writes(after), []);
    });
    await check(size + ' read failure becomes readable; cancel keeps session; confirm performs real reload', async () => {
      const page = await newScenario('read-failed', viewport), before = await snap(page);
      assert.equal(before.status.blocked.reason, 'storage-read-failed');
      await geometry(page, menuAction, size + '-read-failed-menu');
      await settings(page); await geometry(page, settingsAction, size + '-read-failed-settings');
      await page.evaluate(() => { fieldSaveFixture.setFaults({ read: false }); fieldSaveFixture.progression.addMoney(999); fieldSaveFixture.resetCalls(); });
      await activate(page.locator(settingsAction));
      assert.equal((await snap(page)).status.blocked.reason, 'saved-career-available');
      await geometry(page, settingsAction, size + '-saved-career-available');
      const oldId = await page.evaluate(() => fieldSaveFixture.documentId);
      const unsavedMoney = (await snap(page)).career.player.money;
      await activate(page.locator(settingsAction), 'Enter');
      const dialog = page.getByRole('alertdialog');
      assert.match(await dialog.innerText(), /Unsaved changes from this session will be lost/);
      await geometry(page, '.modal:not(.is-out) .btn--quiet', size + '-reload-cancel');
      await activate(dialog.getByRole('button', { name: 'Keep this session', exact: true }), 'Space');
      assert.equal(await page.evaluate(() => fieldSaveFixture.documentId), oldId);
      assert.equal((await snap(page)).career.player.money, unsavedMoney);
      assert.equal((await snap(page)).primary, before.primary);
      assert.deepEqual(writes(await snap(page)), []);
      await activate(page.locator(settingsAction));
      await geometry(page, '.modal:not(.is-out) .btn--amber', size + '-reload-confirm');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        activate(page.getByRole('alertdialog').getByRole('button', { name: 'Load saved career', exact: true }), 'Enter'),
      ]);
      await page.waitForFunction(() => !!window.fieldSaveFixture);
      assert.notEqual(await page.evaluate(() => fieldSaveFixture.documentId), oldId);
      assert.equal(await page.evaluate(() => performance.getEntriesByType('navigation')[0].type), 'reload');
      const after = await snap(page);
      assert.equal(after.career.player.money, 8765);
      assert.equal(after.status.blocked, null);
      assert.equal(after.primary, before.primary);
      assert.deepEqual(writes(after), [], 'including pagehide and visibility save hooks');
    });
    await check(size + ' recovered backup is disclosed until native acknowledgement', async () => {
      const page = await newScenario('recovered', viewport), before = await snap(page);
      assert.equal(before.status.recovered, true);
      await geometry(page, menuAction, size + '-recovered-menu');
      await settings(page); await geometry(page, settingsAction, size + '-recovered-settings');
      await activate(page.locator(settingsAction), 'Enter');
      assert.equal((await snap(page)).backup, before.backup);
      assert.equal((await snap(page)).status.pending, false);
      assert.equal(await page.locator(settingsAction).innerText(), 'Understood');
      await page.evaluate(() => fieldSaveFixture.resetCalls());
      await activate(page.locator(settingsAction));
      assert.equal((await snap(page)).status.recovered, false);
      assert.deepEqual(writes(await snap(page)), []);
    });
    for (const scenario of ['grind-eligible', 'grind-no-skill', 'grind-no-grinder', 'grind-exhausted', 'grind-used']) {
      await check(size + ' ' + scenario + ' Garage quotes and native action match real career rules', async () => {
        const page = await newScenario(scenario, viewport), before = await snap(page);
        const button = page.getByRole('button', { name: 'Regrind fitted bit', exact: true });
        await button.evaluate(el => el.dataset.fieldSaveAction = '1');
        await geometry(page, '[data-field-save-action="1"]', size + '-' + scenario);
        const panelText = await button.locator('..').innerText();
        assert.match(panelText, /20 in-game minutes/);
        assert.equal(await button.isDisabled(), !before.quote.ok);
        if (scenario === 'grind-eligible') {
          assert.match(panelText, /Condition 55% → 79%/);
          await activate(button, 'Space');
          const after = await snap(page);
          near(after.quote.condition, 0.79);
          near(after.career.player.career.hoursWorked - before.career.player.career.hoursWorked, 20 / 60);
          assert.equal(after.career.player.money, before.career.player.money);
          assert.equal(after.quote.used, true); assert.equal(after.quote.ok, false);
          const treated = page.getByRole('button', { name: 'Regrind fitted bit', exact: true });
          assert(await treated.isDisabled());
          await treated.evaluate(el => el.dataset.fieldSaveAction = '1');
          await geometry(page, '[data-field-save-action="1"]', size + '-grind-success');
          const success = page.locator('.toast').filter({ hasText: 'Bit regrind complete' });
          assert(await success.isVisible(), 'Successful treatment feedback stays visible');
          await page.evaluate(() => fieldSaveFixture.ui.update(1));
          assert(await success.isVisible(), 'Feedback retains its actual lifetime');
          await activate(page.locator('.screen--garage .shead__back'));
          await page.waitForFunction(() => fieldSaveFixture.ui.currentScene === 'menu');
          assert(await success.evaluate(el => !!el.closest('.screen--menu .menu__foot')), 'Live feedback follows navigation; no orphan in the retired screen');
          await geometry(page, '.screen--menu .menu__nav .btn--lg', size + '-grind-success-menu');
          await page.evaluate(() => fieldSaveFixture.ui.update(3));
          await success.waitFor({ state: 'hidden' });
        } else {
          assert(panelText.includes(before.quote.reason));
          await button.evaluate(el => el.click());
          assert.deepEqual((await snap(page)).career, before.career);
        }
      });
    }
  }
  assert.equal(report.cases.length, 33);
  assert.deepEqual(report.cases.filter(item => item.status === 'FAIL').map(item => item.name), [], 'All browser cases must pass');
  assert.deepEqual(report.errors, []);
  for (const [path, before] of Object.entries(hashes)) assert.equal(await digest(path), before, 'Source changed during capture: ' + path);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL'; report.failure = error.stack; throw error;
} finally {
  const cleanup = await Promise.allSettled([
    browser?.close(),
    server.listening ? new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())) : Promise.resolve(),
  ]);
  report.cleanup = { browserClosed: !browser?.isConnected(), serverClosed: !server.listening,
    errors: cleanup.filter(result => result.status === 'rejected').map(result => String(result.reason)) };
  if (report.cleanup.errors.length || !report.cleanup.browserClosed || !report.cleanup.serverClosed) { report.status = 'FAIL'; process.exitCode = 1; }
  await mkdir(output, { recursive: true }); await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Field/save browser: ${report.status}; ${report.cases.length} cases; ${output}`);
}
