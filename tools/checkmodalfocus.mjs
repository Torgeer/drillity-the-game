#!/usr/bin/env node
// Actual production UI in Chrome, with WebGL disabled. This checks DOM modal
// behaviour; it does not certify physical assistive technology or phone Safari.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'evidence/modal-focus/report.json');
const bundle = await build({ absWorkingDir: root, stdin: { resolveDir: root, sourcefile: 'modal-fixture.js', contents: `
import { createUI } from './src/ui/shell.js';
import { createGameState, createBus, SCENES } from './src/core/contract.js';
import * as game from './src/game/data.js';
import * as C from './src/ui/components.js';
const state = createGameState(); state.settings.reducedMotion = true; state.settings.haptics = false;
const ctx = { state, bus: createBus(), game, uiRoot: document.querySelector('#ui') };
const ui = createUI(ctx); await ui.init(); ui.resize(390, 844, 1);
ui.setLoadingProgress(1); ui.update(1); ui.show(SCENES.MENU);
window.fixture = { ui, state, C, SCENES, counts: {}, records: {}, promises: {} };
` }, bundle: true, format: 'esm', write: false, outdir: 'unused-modal-output',
  metafile: true, loader: { '.png': 'dataurl' }, logLevel: 'silent' });
const js = bundle.outputFiles.find(file => file.path.endsWith('.js')).contents;
const css = bundle.outputFiles.find(file => file.path.endsWith('.css')).contents;
const report = { startedAt: new Date().toISOString(), evidence: 'Production shell/screens/components/styles; headless Chrome with WebGL disabled. No phone/assistive-device or GPU performance claim.',
  runnerHash: createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'), sourceHashes: {}, cases: [], errors: [] };
for (const path of Object.keys(bundle.metafile.inputs).filter(path => path.startsWith('src/'))) {
  report.sourceHashes[path] = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex');
}
const server = createServer((req, res) => {
  if (req.url === '/fixture.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(js); }
  else if (req.url === '/fixture.css') { res.setHeader('Content-Type', 'text/css'); res.end(css); }
  else if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); }
  else { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><button id="outside">Outside game</button><div id="pre-inert" inert><button>Initially inert</button></div><div id="ui"></div><script type="module" src="/fixture.js"></script>'); }
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
      if (/webgl/i.test(type)) { window.webglAttempts.push(type); throw Error('Modal DOM fixture forbids WebGL'); }
      return original.call(this, type, ...args);
    };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.fixture?.ui.currentScene === 'menu');
  const test = async (name, action) => { await action(); report.cases.push(name); console.log('PASS ' + name); };
  const active = () => page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), label: document.activeElement?.getAttribute('aria-label'), id: document.activeElement?.id,
    inside: !!document.activeElement?.closest('.overlays > :not(.is-out) [role$="dialog"]') }));
  const liveCount = () => page.locator('.overlays > :not(.is-out)').count();
  const press = async locator => { await locator.focus(); await locator.press('Enter'); };
  const openSettings = async () => { await page.evaluate(() => fixture.ui.show(fixture.SCENES.MENU)); await press(page.getByRole('button', { name: 'Settings', exact: true })); };
  const wrap = async () => {
    const indices = await page.evaluate(() => {
      const box = document.querySelector('.overlays > :not(.is-out):last-child [role$="dialog"]');
      const controls = [...box.querySelectorAll('button,input,select,textarea,[href],[tabindex]')]
        .filter(el => el.tabIndex >= 0 && !el.matches(':disabled') && !el.closest('[hidden],[inert]') && getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length);
      if (!controls.length) throw Error('Expected nonempty controls');
      controls[0].dataset.testFirst = '1'; controls.at(-1).dataset.testLast = '1'; controls[0].focus();
      return controls.length;
    });
    assert(indices > 0);
    await page.keyboard.press('Shift+Tab');
    assert(await page.evaluate(() => document.activeElement.dataset.testLast === '1'));
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.activeElement.dataset.testFirst === '1'));
  };

  await test('Settings opens on Close and contains forward/reverse Tab', async () => {
    await openSettings(); assert.equal((await active()).label, 'Close'); await wrap();
  });
  await test('Background inert blocks focus and synthetic activation; preexisting inert survives', async () => {
    assert(await page.evaluate(() => {
      const outside = document.querySelector('#outside');
      outside.onclick = () => fixture.counts.outside = (fixture.counts.outside || 0) + 1;
      outside.focus(); outside.click();
      return outside.inert && document.querySelector('.screens').inert && !fixture.counts.outside
        && document.activeElement.closest('[role="dialog"]');
    }));
  });
  await test('Nested confirmation cancels only itself and returns focus to its sheet opener', async () => {
    await page.evaluate(() => {
      fixture.opener = document.activeElement;
      fixture.promises.nested = fixture.ui.confirm({ title: 'Nested confirmation' }).then(value => fixture.nestedResult = value);
    });
    assert.equal((await active()).text, 'Cancel'); assert.equal(await liveCount(), 2);
    await wrap(); await page.keyboard.press('Escape');
    assert.equal(await liveCount(), 1); assert.equal(await page.evaluate(() => fixture.nestedResult), false);
    assert(await page.evaluate(() => document.activeElement === fixture.opener));
  });
  await test('Nested sheet is above its confirmation and Escape leaves the confirmation active', async () => {
    await page.evaluate(() => {
      fixture.promises.outer = fixture.ui.confirm({ title: 'Outer confirmation' }).then(value => fixture.outerResult = value);
      fixture.records.child = fixture.ui.sheet({ title: 'Child sheet', body: fixture.C.h('button', { text: 'Child action' }) });
    });
    assert.equal(await liveCount(), 3); assert.equal((await active()).label, 'Close');
    assert(await page.evaluate(() => {
      const live = [...document.querySelectorAll('.overlays > :not(.is-out)')];
      return Number(getComputedStyle(live.at(-1)).zIndex) > Number(getComputedStyle(live.at(-2)).zIndex) && live.at(-2).inert;
    }));
    await page.keyboard.press('Escape'); assert.equal(await liveCount(), 2);
    assert.equal((await active()).text, 'Cancel'); await page.keyboard.press('Escape'); assert.equal(await liveCount(), 1);
  });
  await test('Removing or disabling the focused control recovers within the dialog', async () => {
    await page.evaluate(() => { const b = document.querySelector('.sheet:not(.is-out) .tabs__b'); b.focus(); b.disabled = true; });
    await page.waitForFunction(() => !document.activeElement.matches(':disabled') && !!document.activeElement.closest('[role="dialog"]'));
    await page.evaluate(() => document.activeElement.remove());
    await page.waitForFunction(() => !!document.activeElement.closest('[role="dialog"]'));
    await page.keyboard.press('Tab'); assert((await active()).inside);
  });
  await test('Background nodes inserted during a dialog become inert', async () => {
    await page.evaluate(() => { const button = document.createElement('button'); button.id = 'late-background'; button.textContent = 'Later'; document.body.append(button); });
    await page.waitForFunction(() => document.querySelector('#late-background').inert);
  });
  await test('Last close restores Settings opener and original inert attributes', async () => {
    await page.keyboard.press('Escape'); assert.equal(await liveCount(), 0); assert.equal((await active()).text, 'Settings');
    assert(await page.evaluate(() => document.querySelector('#pre-inert').inert && !document.querySelector('#outside').inert && !document.querySelector('#late-background').inert && !document.querySelector('.screens').inert));
  });
  await test('Garage real rig sheet has initial focus, Tab containment and opener restoration', async () => {
    await page.evaluate(() => fixture.ui.show(fixture.SCENES.GARAGE));
    const opener = page.locator('.rigcard.is-locked').first(); await press(opener);
    assert.equal(await liveCount(), 1); assert.equal((await active()).label, 'Close'); await wrap();
    await page.keyboard.press('Escape'); assert(await opener.evaluate(el => document.activeElement === el));
  });
  await test('iMarket real item sheet has initial focus, Tab containment and opener restoration', async () => {
    await page.evaluate(() => fixture.ui.show(fixture.SCENES.SHOP));
    const opener = page.locator('.mktcard').first(); await press(opener);
    assert.equal(await liveCount(), 1); assert.equal((await active()).label, 'Close'); await wrap();
    await page.keyboard.press('Escape'); assert(await opener.evaluate(el => document.activeElement === el));
  });
  await test('Empty unlabelled sheet keeps a programmatic dialog focus target', async () => {
    await page.evaluate(() => fixture.records.empty = fixture.ui.sheet({ body: 'No controls' }));
    assert(await page.evaluate(() => document.activeElement.matches('[role="dialog"]')));
    await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    assert(await page.evaluate(() => document.activeElement.matches('[role="dialog"]'))); await page.keyboard.press('Escape');
  });
  await test('Tab order skips disabled/hidden controls, honours positive tabindex and radio groups', async () => {
    await page.evaluate(() => {
      const { C, ui } = fixture;
      const body = C.h('div', C.h('button', { id: 'order-normal', text: 'Normal' }),
        C.h('button', { id: 'order-two', tabindex: '2', text: 'Second' }),
        C.h('button', { id: 'order-one', tabindex: '1', text: 'First' }),
        C.h('fieldset', { disabled: true }, C.h('button', { text: 'Disabled child' })),
        C.h('button', { hidden: true, text: 'Hidden' }),
        C.h('input', { id: 'radio-unchecked', type: 'radio', name: 'modal-choice' }),
        C.h('input', { id: 'radio-checked', type: 'radio', name: 'modal-choice', checked: true }));
      fixture.records.order = ui.sheet({ body });
    });
    assert.equal((await active()).id, 'order-one');
    for (const expected of ['order-two', 'order-normal', 'radio-checked', 'order-one']) {
      await page.keyboard.press('Tab'); assert.equal((await active()).id, expected);
    }
    await page.keyboard.press('Escape');
  });
  await test('Closing a lower sheet preserves the child return path; close callbacks run once', async () => {
    await page.evaluate(() => {
      fixture.outerOpener = document.activeElement;
      fixture.records.parent = fixture.ui.sheet({ title: 'Parent', onClose: () => fixture.counts.parent = (fixture.counts.parent || 0) + 1 });
      fixture.records.child = fixture.ui.sheet({ title: 'Child' });
      fixture.records.parent.close(); fixture.records.parent.close();
    });
    assert.equal(await liveCount(), 1); assert.equal((await active()).label, 'Close');
    await page.keyboard.press('Escape');
    assert(await page.evaluate(() => document.activeElement === fixture.outerOpener && fixture.counts.parent === 1));
  });
  await test('A removed opener falls back to the current screen', async () => {
    await page.evaluate(() => {
      const button = fixture.C.h('button', { text: 'Temporary opener' }); document.querySelector('.screen--shop').append(button); button.focus();
      fixture.ui.sheet({ title: 'Removed opener' }); button.remove();
    });
    await page.keyboard.press('Escape'); assert(await page.evaluate(() => document.activeElement.matches('.screen--shop')));
  });
  await test('Fallback screen retains focusability without becoming an extra native Tab stop', async () => {
    assert.equal(await page.evaluate(() => document.activeElement.tabIndex), -1);
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.activeElement.matches('button') && !!document.activeElement.closest('.screen--shop')));
    await page.keyboard.press('Shift+Tab');
    assert(await page.evaluate(() => !document.activeElement.matches('.screen--shop')));
  });
  await test('Navigation dismisses overlays and cancels promises without focusing a retired screen', async () => {
    await openSettings();
    await page.evaluate(() => {
      fixture.promises.navigation = fixture.ui.confirm({ title: 'Leave old screen' }).then(value => fixture.navigationResult = value);
      fixture.ui.show(fixture.SCENES.GARAGE);
    });
    assert.equal(await liveCount(), 0); assert.equal(await page.evaluate(() => fixture.navigationResult), false);
    assert(await page.evaluate(() => document.activeElement.matches('.screen--garage')));
  });
  await test('A close microtask cannot steal focus from a newly opened dialog', async () => {
    await page.evaluate(() => {
      const old = fixture.ui.sheet({ title: 'Old' }); old.close();
      fixture.promises.new = fixture.ui.confirm({ title: 'New' });
    });
    assert.equal((await active()).text, 'Cancel'); await page.keyboard.press('Escape');
  });
  await test('Disposal cancels pending confirmation, restores inert and releases listeners', async () => {
    await page.evaluate(() => {
      fixture.promises.dispose = fixture.ui.confirm({ title: 'Dispose' }).then(value => fixture.disposeResult = value);
      fixture.ui.dispose();
    });
    assert.equal(await page.evaluate(() => fixture.disposeResult), false);
    assert(await page.evaluate(() => !document.querySelector('#outside').inert && document.querySelector('#pre-inert').inert));
    await page.locator('#outside').focus(); await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.activeElement !== document.querySelector('#outside')));
  });
  assert.deepEqual(await page.evaluate(() => window.webglAttempts), []);
  assert.deepEqual(report.errors, []);
  assert.equal(report.cases.length, 17);
  for (const [path, before] of Object.entries(report.sourceHashes)) {
    assert.equal(createHash('sha256').update(await readFile(resolve(root, path))).digest('hex'), before, `Source changed during check: ${path}`);
  }
  assert.equal(createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'), report.runnerHash, 'Runner changed during check');
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
  await mkdir(dirname(output), { recursive: true }); await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`Modal focus: ${report.status}; ${report.cases.length} cases; ${output}`);
}
