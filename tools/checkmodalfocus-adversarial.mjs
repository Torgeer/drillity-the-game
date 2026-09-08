#!/usr/bin/env node
// Independent lifecycle tests against the production shell, not a model of its
// focus manager. This is a DOM-only Chrome check, not assistive-device evidence.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = resolve(root, 'evidence/modal-focus/adversarial-report.json');
const bundle = await build({ absWorkingDir: root, stdin: {
  resolveDir: root, sourcefile: 'independent-modal-fixture.js', contents: `
import { createUI } from './src/ui/shell.js';
import { createGameState, createBus, SCENES } from './src/core/contract.js';
import * as game from './src/game/data.js';
import * as C from './src/ui/components.js';
const state = createGameState(); state.settings.reducedMotion = true; state.settings.haptics = false;
const ui = createUI({ state, bus: createBus(), game, uiRoot: document.querySelector('#host') });
await ui.init(); ui.resize(390, 844, 1); ui.setLoadingProgress(1); ui.update(1); ui.show(SCENES.MENU);
window.fixture = { ui, C, SCENES, state, values: {}, records: {} };
` }, bundle: true, format: 'esm', write: false, outdir: 'unused-adversarial-output',
  metafile: true, loader: { '.png': 'dataurl' }, logLevel: 'silent' });
const js = bundle.outputFiles.find(file => file.path.endsWith('.js')).contents;
const css = bundle.outputFiles.find(file => file.path.endsWith('.css')).contents;
const report = { startedAt: new Date().toISOString(), status: 'RUNNING',
  evidence: 'Production shell and styles in headless Chrome, WebGL disabled. No GPU, phone or assistive-device claim.',
  sourceHashes: {}, cases: [], errors: [] };
for (const path of [...Object.keys(bundle.metafile.inputs).filter(path => path.startsWith('src/')), 'tools/checkmodalfocus-adversarial.mjs']) {
  report.sourceHashes[path] = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex');
}
const server = createServer((req, res) => {
  if (req.url === '/test.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(js); }
  else if (req.url === '/test.css') { res.setHeader('Content-Type', 'text/css'); res.end(css); }
  else if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); }
  else { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/test.css"><button id="external">External</button><div id="already-hidden" aria-hidden="true"><button>Hidden before modal</button></div><div id="explicit-visible" aria-hidden="false"></div><div id="already-inert" inert><button>Inert before modal</button></div><div id="host"></div><script type="module" src="/test.js"></script>'); }
});
let browser;
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(Number(process.env.MODAL_TEST_PORT || 0), '127.0.0.1', resolve);
  });
  report.serverPort = server.address().port;
  browser = await chromium.launch({ channel: 'chrome', headless: true,
    args: ['--disable-gpu', '--disable-webgl', '--disable-software-rasterizer', '--mute-audio'] });
  report.browserVersion = browser.version();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    window.webglAttempts = [];
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (/webgl/i.test(type)) { window.webglAttempts.push(type); throw Error('Independent modal fixture forbids WebGL'); }
      return original.call(this, type, ...args);
    };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.fixture?.ui.currentScene === 'menu');
  const test = async (name, fn) => { await fn(); report.cases.push(name); console.log(`PASS ${name}`); };
  const live = () => page.locator('.overlays > :not(.is-out)').count();

  await test('Background accessibility attributes survive nested modal close unchanged', async () => {
    await page.evaluate(() => {
      fixture.records.a = fixture.ui.sheet({ title: 'First' });
      fixture.records.b = fixture.ui.sheet({ title: 'Second' });
    });
    assert(await page.evaluate(() => ['external', 'already-hidden', 'explicit-visible', 'already-inert'].every(id => document.getElementById(id).inert)));
    await page.keyboard.press('Escape'); assert.equal(await live(), 1);
    await page.keyboard.press('Escape'); assert.equal(await live(), 0);
    assert.deepEqual(await page.evaluate(() => ({
      hidden: document.getElementById('already-hidden').getAttribute('aria-hidden'),
      visible: document.getElementById('explicit-visible').getAttribute('aria-hidden'),
      absent: document.getElementById('external').hasAttribute('aria-hidden'),
      inert: document.getElementById('already-inert').inert,
      restored: ['external', 'already-hidden', 'explicit-visible'].every(id => !document.getElementById(id).inert),
    })), { hidden: 'true', visible: 'false', absent: false, inert: true, restored: true });
  });

  await test('Lower dialog and external synthetic activation cannot run while a child is active', async () => {
    await page.evaluate(() => {
      fixture.values.activations = 0;
      const lower = fixture.C.h('button', { id: 'lower-action', text: 'Lower action' });
      lower.onclick = () => fixture.values.activations++;
      document.getElementById('external').onclick = () => fixture.values.activations++;
      fixture.records.lower = fixture.ui.sheet({ title: 'Lower', body: lower });
      fixture.records.upper = fixture.ui.sheet({ title: 'Upper' });
      lower.click(); document.getElementById('external').click(); lower.focus();
      lower.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    });
    assert.equal(await page.evaluate(() => fixture.values.activations), 0);
    assert(await page.evaluate(() => fixture.records.upper.box.contains(document.activeElement)));
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  });

  await test('Hiding a focused subtree restores a visible dialog focus target without Tab', async () => {
    await page.evaluate(() => {
      const button = fixture.C.h('button', { id: 'hide-action', text: 'Hide me' });
      const group = fixture.C.h('div', { id: 'hide-group' }, button);
      fixture.records.hidden = fixture.ui.sheet({ title: 'Hide a control', body: group });
      button.focus(); group.hidden = true;
    });
    await page.waitForFunction(() => fixture.records.hidden.box.contains(document.activeElement)
      && !document.activeElement.closest('[hidden]') && document.activeElement.id !== 'hide-action');
    await page.keyboard.press('Escape');
  });

  await test('Closing then navigating in one task never restores focus to the outgoing screen', async () => {
    await page.evaluate(() => {
      fixture.values.outgoingFocus = 0;
      const opener = document.querySelector('.screen--menu button'); opener.focus();
      const modal = fixture.ui.sheet({ title: 'Close and navigate' });
      opener.addEventListener('focus', () => fixture.values.outgoingFocus++);
      modal.close(); fixture.ui.show(fixture.SCENES.GARAGE);
    });
    await page.waitForFunction(() => document.activeElement.matches('.screen--garage'));
    assert.equal(await page.evaluate(() => fixture.values.outgoingFocus), 0);
    assert.equal(await live(), 0);
  });

  await test('Two retired parents preserve a surviving child return path to the original opener', async () => {
    await page.evaluate(() => {
      const opener = fixture.C.h('button', { id: 'chain-opener', text: 'Open chain' });
      document.querySelector('.screen--garage').append(opener); opener.focus();
      fixture.records.one = fixture.ui.sheet({ title: 'One' });
      fixture.records.two = fixture.ui.sheet({ title: 'Two' });
      fixture.records.three = fixture.ui.sheet({ title: 'Three' });
      fixture.records.one.close(); fixture.records.two.close();
    });
    assert.equal(await live(), 1);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'chain-opener');
  });

  await test('A stale close callback cannot close the next dialog', async () => {
    await page.evaluate(() => {
      fixture.records.stale = fixture.ui.sheet({ title: 'Stale' });
      fixture.records.stale.close();
      fixture.records.next = fixture.ui.sheet({ title: 'Next' });
      fixture.records.stale.close();
    });
    assert.equal(await live(), 1);
    assert(await page.evaluate(() => fixture.records.next.box.contains(document.activeElement)));
    await page.keyboard.press('Escape');
  });

  await test('Real pointer scrim closes a sheet and restores its opener', async () => {
    await page.evaluate(() => {
      document.getElementById('chain-opener').focus();
      fixture.records.scrim = fixture.ui.sheet({ title: 'Scrim pointer', body: 'Details' });
    });
    await page.locator('.sheet:not(.is-out) .sheet__scrim').click({ position: { x: 10, y: 10 } });
    assert.equal(await live(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'chain-opener');
  });

  await test('Disposing two nested confirmations settles both false once and restores external interaction', async () => {
    await page.evaluate(() => {
      fixture.values.settlements = [];
      fixture.ui.confirm({ title: 'Dispose parent' }).then(value => fixture.values.settlements.push(['parent', value]));
      fixture.ui.confirm({ title: 'Dispose child' }).then(value => fixture.values.settlements.push(['child', value]));
      fixture.ui.dispose();
    });
    assert.deepEqual(await page.evaluate(() => fixture.values.settlements), [['child', false], ['parent', false]]);
    await page.locator('#external').click();
    assert.equal(await page.evaluate(() => fixture.values.activations), 1);
    assert(await page.evaluate(() => !document.getElementById('external').inert && document.getElementById('already-inert').inert));
  });
  assert.deepEqual(await page.evaluate(() => window.webglAttempts), []);
  assert.deepEqual(report.errors, []);
  assert.equal(report.cases.length, 8);
  for (const [path, before] of Object.entries(report.sourceHashes)) {
    assert.equal(createHash('sha256').update(await readFile(resolve(root, path))).digest('hex'), before, `Source changed during check: ${path}`);
  }
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
  if (report.cleanup.errors.length || !report.cleanup.browserClosed || !report.cleanup.serverClosed) {
    report.status = 'FAIL'; process.exitCode = 1;
  }
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(`Independent modal focus: ${report.status}, ${report.cases.length} cases; ${reportPath}`);
}
