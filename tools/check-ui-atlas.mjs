#!/usr/bin/env node
/** Isolated asset contract gate; no browser without --browser and the lease.
 * node tools/check-ui-atlas.mjs [--self-test]
 * node tools/check-ui-atlas.mjs --browser [--url http://127.0.0.1:5196/]
 *   [--out tools/ui-atlas-demo/evidence]
 * This validates an asset review, not game integration or game thumb reach.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const ASSET_DIR = resolve(ROOT, 'public/ui/blender');
// NOT SOURCED: reviewed UI export budget, not a machine specification.
const BYTE_BUDGET = 400 * 1024;
const LEASE = 'C:/Users/henri/Downloads/threads/drillity-coordination/gpu-owner.txt';
const args = process.argv.slice(2);
function option(name, fallback) { const index = args.indexOf(name); return index === -1 ? fallback : args[index + 1]; }
const output = resolve(ROOT, option('--out', 'tools/ui-atlas-demo/evidence'));
function silentReviewUrl(value) {
  const url = new URL(value);
  // Caller-supplied sound overrides shot/mute in the game's audio predicate.
  // Keep this isolated review silent even if it is pointed at a game base.
  url.searchParams.delete('sound');
  url.searchParams.set('mute', '');
  return url.href;
}
const ids = [
  'button-neutral', 'button-accent', 'button-neutral-pressed', 'button-accent-pressed',
  'button-neutral-disabled', 'button-accent-disabled', 'badge-neutral', 'badge-ready',
  'badge-warning', 'meter-backing', 'button-compact-neutral', 'button-compact-accent',
  'button-compact-neutral-pressed', 'button-compact-accent-pressed',
  'button-compact-neutral-disabled', 'button-compact-accent-disabled',
];
function png(bytes, label) {
  assert.ok(bytes.length > 33, `${label}: empty/truncated PNG`);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${label}: PNG signature`);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.ok(width > 0 && height > 0 && width * height <= 2_000_000, `${label}: invalid dimensions`);
  assert.equal(bytes[24], 8, `${label}: expected 8-bit pixels`);
  assert.equal(bytes[25], 6, `${label}: expected RGBA pixels`);
  assert.equal(bytes[28], 0, `${label}: unsupported interlaced PNG`);
  const idats = []; let ended = false;
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    assert.ok(offset + 12 + length <= bytes.length, `${label}: truncated ${type} chunk`);
    if (type === 'IDAT') idats.push(bytes.subarray(offset + 8, offset + 8 + length));
    if (type === 'IEND') { ended = true; break; }
    offset += length + 12;
  }
  assert.ok(ended && idats.length, `${label}: missing IDAT/IEND`);
  const decoded = inflateSync(Buffer.concat(idats));
  const stride = width * 4;
  assert.equal(decoded.length, (stride + 1) * height, `${label}: decoded size mismatch`);
  let previous = Buffer.alloc(stride), transparent = 0, opaque = 0, partial = 0;
  const paeth = (a, b, c) => { const p = a + b - c, x = Math.abs(p - a), y = Math.abs(p - b), z = Math.abs(p - c); return x <= y && x <= z ? a : y <= z ? b : c; };
  for (let y = 0; y < height; y++) {
    const offset = y * (stride + 1), filter = decoded[offset], row = Buffer.from(decoded.subarray(offset + 1, offset + 1 + stride));
    assert.ok(filter <= 4, `${label}: invalid PNG row filter`);
    for (let x = 0; x < stride; x++) {
      const left = x < 4 ? 0 : row[x - 4], up = previous[x], upperLeft = x < 4 ? 0 : previous[x - 4];
      row[x] = (row[x] + (filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : filter === 4 ? paeth(left, up, upperLeft) : 0)) & 255;
    }
    for (let x = 3; x < stride; x += 4) { if (row[x] === 0) transparent++; else if (row[x] === 255) opaque++; else partial++; }
    previous = row;
  }
  assert.ok(transparent > 0 && opaque > 0 && partial > 0, `${label}: requires transparent, opaque, and antialiased pixels`);
  return { width, height, transparent, opaque, partial };
}
function validate(manifest, readAsset = (name) => readFileSync(resolve(ASSET_DIR, name))) {
  assert.equal(manifest.schemaVersion, 1, 'manifest version');
  assert.deepEqual(manifest.sprites?.map((s) => s.id).sort(), [...ids].sort(), 'manifest must contain the exact sixteen authored sprites');
  assert.equal(manifest.generator.engine, 'CYCLES', 'actual Cycles provenance');
  assert.equal(manifest.generator.device, 'CPU', 'CPU export provenance');
  const source = readFileSync(resolve(ROOT, 'blender/ui_atlas.py'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(createHash('sha256').update(source).digest('hex'), manifest.generator.sourceSha256, 'current normalized Blender source differs from rendered export');
  const files = new Map();
  function checkFile(record, scale, native) {
    assert.ok(record && basename(record.file) === record.file && record.file.endsWith('.png'), 'safe PNG basename');
    const bytes = readAsset(record.file);
    assert.equal(bytes.length, record.bytes, `${record.file}: bytes differ from manifest`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, `${record.file}: hash differs from manifest`);
    const info = png(bytes, record.file);
    assert.equal(info.width, record.width, `${record.file}: width differs from manifest`);
    assert.equal(info.height, record.height, `${record.file}: height differs from manifest`);
    assert.equal(info.width, native.width * scale, `${record.file}: incorrect density width`);
    assert.equal(info.height, native.height * scale, `${record.file}: incorrect density height`);
    assert.ok(!files.has(record.file), `${record.file}: duplicate file entry`);
    files.set(record.file, { ...info, bytes: bytes.length });
  }
  const atlasNative = { width: 352, height: 480 }; // Generated manifest/export contract, NOT SOURCED physical dimensions.
  checkFile(manifest.atlases['1x'], 1, atlasNative);
  checkFile(manifest.atlases['2x'], 2, atlasNative);
  for (const sprite of manifest.sprites) {
    const expected = sprite.id.startsWith('badge') ? { width: 88, height: 24 }
      : sprite.id === 'meter-backing' ? { width: 160, height: 24 }
        : { width: sprite.id.includes('compact') ? 88 : 144, height: 44 };
    assert.deepEqual(sprite.native, expected, `${sprite.id}: native contract changed`);
    assert.equal(sprite.atlas.width, expected.width); assert.equal(sprite.atlas.height, expected.height);
    for (const key of ['x', 'y', 'width', 'height']) assert.ok(Number.isInteger(sprite.atlas[key]) && sprite.atlas[key] >= 0, `${sprite.id}: invalid rect ${key}`);
    assert.ok(sprite.atlas.x + expected.width <= atlasNative.width && sprite.atlas.y + expected.height <= atlasNative.height, `${sprite.id}: outside atlas`);
    for (const [scale, key] of [[1, '1x'], [2, '2x']]) checkFile(sprite.files[key], scale, expected);
    if (sprite.id !== 'meter-backing') {
      assert.ok(sprite.safeText && sprite.safeText.width > 0 && sprite.safeText.height > 0, `${sprite.id}: empty text-safe region`);
      assert.ok(sprite.safeText.x >= 0 && sprite.safeText.y >= 0 && sprite.safeText.x + sprite.safeText.width <= expected.width && sprite.safeText.y + sprite.safeText.height <= expected.height, `${sprite.id}: unsafe text rect`);
      const expectedSafe = sprite.id.startsWith('badge') ? { x: 10, y: 5, width: 68, height: 14 }
        : sprite.id.includes('compact') ? { x: 10, y: 10, width: 68, height: 24 } : { x: 12, y: 10, width: 120, height: 24 };
      assert.deepEqual(sprite.safeText, expectedSafe, `${sprite.id}: helper text-safe contract changed`);
      const expectedForeground = sprite.id.endsWith('-disabled') ? '#96A0AE'
        : sprite.id.startsWith('button') && sprite.id.includes('accent') ? '#231502' : '#FAFAFA';
      assert.equal(sprite.recommendedForeground, expectedForeground, `${sprite.id}: helper foreground contract changed`);
    } else {
      assert.deepEqual(sprite.safeFill, { x: 10, y: 8, width: 140, height: 8 }, 'helper meter-fill contract changed');
    }
  }
  for (let i = 0; i < manifest.sprites.length; i++) for (let j = i + 1; j < manifest.sprites.length; j++) {
    const a = manifest.sprites[i].atlas, b = manifest.sprites[j].atlas;
    assert.ok(Math.min(a.x + a.width, b.x + b.width) <= Math.max(a.x, b.x) || Math.min(a.y + a.height, b.y + b.height) <= Math.max(a.y, b.y), `overlapping atlas rects ${ids[i]}/${ids[j]}`);
  }
  const bytes = [...files.values()].reduce((sum, file) => sum + file.bytes, 0);
  assert.equal(manifest.totalPngBytes, bytes, 'manifest total differs from measured PNG bytes');
  assert.ok(bytes <= BYTE_BUDGET, `${bytes} exported PNG bytes exceed ${BYTE_BUDGET}`);
  return { sprites: manifest.sprites.length, pngFiles: files.size, pngBytes: bytes, byteBudget: BYTE_BUDGET, atlases: manifest.atlases };
}
function sourceContract() {
  const css = readFileSync(resolve(ROOT, 'src/ui/blender-atlas.css'), 'utf8');
  const js = readFileSync(resolve(ROOT, 'tools/ui-atlas-demo/demo.js'), 'utf8');
  const html = readFileSync(resolve(ROOT, 'tools/ui-atlas-demo/index.html'), 'utf8');
  assert.ok(!/url\(/i.test(css), 'helper must leave deployment URL binding to consumer');
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of bare.matchAll(/([^{}]+)\{/g)) {
    const selector = match[1].trim();
    assert.ok(selector.startsWith('@') || selector.includes('[data-blender-ui]'), `unscoped CSS rule: ${selector}`);
  }
  for (const token of ['--motion-d1', '--motion-d2', '--curve-press', '--curve-release']) assert.ok(css.includes(`var(${token})`), `missing actual Blender token ${token}`);
  assert.ok(css.includes('prefers-reduced-motion') && css.includes('forced-colors'), 'accessibility modes required');
  assert.ok(js.includes("import '../../src/ui/motion.css'") && js.includes("from '../../src/core/motion.js'"), 'actual generated motion exports must be consumed');
  assert.ok(js.includes("ease('count', t)") && js.includes('DUR.d4'), 'live meter consumes Blender F-Curve');
  assert.ok(!js.includes('__DRILLITY') && !js.includes('src/main.js'), 'demo must remain isolated from game state');
  assert.equal((html.match(/class="bui-button(?:\s|"|-)/g) || []).length, 9, 'nine semantic face controls required');
  assert.ok(html.includes('role="meter"') && html.includes('aria-valuenow="62"') && html.includes('aria-live="polite"'), 'live readout semantics required');
  assert.ok(html.includes('<output id="meter-output" aria-live="off">'), 'animated output must leave announcements to final status region');
}

async function browserCheck(summary) {
  assert.equal(readFileSync(LEASE, 'utf8').trim(), 'ui-atlas', 'headed Chrome requires gpu-owner.txt = ui-atlas; no browser launched');
  const { chromium } = await import('playwright');
  let server, browser;
  const report = { assetSummary: summary, scope: 'isolated asset review; not game integration, thumb reach, or performance', cases: [], failures: [] };
  let operationError, cleanupError;
  mkdirSync(output, { recursive: true });
  try {
    let url = option('--url', null);
    if (!url) {
      const { createServer } = await import('vite');
      const { default: config } = await import('./ui-atlas-demo/vite.config.mjs');
      server = await createServer({ ...config, configFile: false });
      await server.listen(); url = 'http://127.0.0.1:5196/';
    }
    url = silentReviewUrl(url);
    report.url = url;
    assert.equal(readFileSync(LEASE, 'utf8').trim(), 'ui-atlas', 'GPU lease changed before browser launch');
    browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--mute-audio', '--disable-background-timer-throttling'] });
    for (const [width, density] of [[320, 1], [390, 1], [390, 2], [430, 1]]) {
      assert.equal(readFileSync(LEASE, 'utf8').trim(), 'ui-atlas', 'GPU lease changed during review');
      const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: density, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('response', (response) => { if (response.status() >= 400 && response.url().includes('/ui/blender/')) errors.push(`${response.status()} ${response.url()}`); });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-blender-ui][data-ready="true"]');
      const result = { width, density, isMobile: true, hasTouch: true, variants: {}, captures: {} };
      report.cases.push(result);
      async function capture(name) {
        const geometry = () => ({
          innerWidth, clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          visualViewportWidth: visualViewport?.width ?? null,
          targets: [...document.querySelectorAll('button')].map((el) => {
            const r = el.getBoundingClientRect();
            return { text: el.textContent.trim(), x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
          }),
        });
        const before = await page.evaluate(geometry);
        const path = resolve(output, `${width}-${density}x-${name}.png`);
        const bytes = await page.screenshot({ path, fullPage: true });
        assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${name}: screenshot PNG signature`);
        const encoded = { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), bytes: bytes.length };
        const after = await page.evaluate(geometry);
        result.captures[name] = { path, encoded, before, after };
        assert.equal(encoded.width, width * density, `${name}: encoded screenshot width differs from intended mobile viewport`);
        assert.ok(encoded.height >= 844 * density, `${name}: full-page screenshot shorter than viewport`);
        for (const [stage, metrics] of [['before', before], ['after', after]]) {
          assert.equal(metrics.clientWidth, width, `${name}/${stage}: content viewport differs from intended mobile width`);
          assert.equal(metrics.innerWidth, width, `${name}/${stage}: window viewport differs from intended mobile width`);
          assert.equal(metrics.visualViewportWidth, width, `${name}/${stage}: visual viewport differs from intended mobile width`);
          assert.ok(metrics.scrollWidth <= metrics.clientWidth, `${name}/${stage}: horizontal overflow`);
          assert.ok(metrics.targets.length > 0, `${name}/${stage}: empty capture geometry`);
          assert.ok(metrics.targets.every((target) => target.x >= -.5 && target.x + target.width <= metrics.clientWidth + .5), `${name}/${stage}: target clipped by content viewport`);
        }
        assert.deepEqual(after.targets, before.targets, `${name}: capture reflowed target page geometry`);
      }
      async function measure(name) {
        const metrics = await page.evaluate(() => {
          const all = [...document.querySelectorAll('button')];
          const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
          const targets = all.map((el) => ({ text: el.textContent.trim(), disabled: el.disabled, ...rect(el) }));
          const badges = [...document.querySelectorAll('.bui-badge')].map((el) => ({ text: el.textContent.trim(), fallback: el.classList.contains('bui-text-fit-fallback'), ...rect(el) }));
          const overlaps = [];
          for (let i = 0; i < targets.length; i++) for (let j = i + 1; j < targets.length; j++) {
            const a = targets[i], b = targets[j];
            if (Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > .5 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > .5) overlaps.push([i, j]);
          }
          const clipped = [];
          for (const el of document.querySelectorAll('.bui-button__label, .bui-badge')) {
            const range = document.createRange(); range.selectNodeContents(el); const r = range.getBoundingClientRect(), parent = el.closest('.bui-button, .bui-badge').getBoundingClientRect();
            if (r.left < parent.left || r.right > parent.right + .5 || r.top < parent.top || r.bottom > parent.bottom + .5) clipped.push(el.textContent.trim());
          }
          const label = document.querySelector('.bui-button__label'), labelStyle = getComputedStyle(label);
          return { targets, badges, overlaps, clipped, scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, clientWidth: document.documentElement.clientWidth, visualViewportWidth: visualViewport?.width ?? null, buttonCount: document.querySelectorAll('button.bui-button').length, fallbackCount: document.querySelectorAll('.bui-text-fit-fallback').length, duration: labelStyle.transitionDuration, easing: labelStyle.transitionTimingFunction, releaseToken: getComputedStyle(document.documentElement).getPropertyValue('--curve-release').trim(), background: getComputedStyle(document.querySelector('.bui-button'), '::before').backgroundImage, selectedAtlas: document.querySelector('#atlas-image').currentSrc, meter: document.querySelector('[role="meter"]').getAttribute('aria-valuenow') };
        });
        assert.equal(metrics.buttonCount, 9, `${name}: empty/missing face controls`);
        assert.ok(metrics.targets.every((target) => target.width >= 44 && target.height >= 44), `${name}: undersized touch target`);
        assert.ok(metrics.targets.every((target) => target.x >= -.5 && target.x + target.width <= metrics.clientWidth + .5), `${name}: target outside actual content viewport`);
        assert.deepEqual(metrics.overlaps, [], `${name}: overlapping controls`);
        assert.deepEqual(metrics.clipped, [], `${name}: clipped live text`);
        assert.ok(metrics.scrollWidth <= metrics.clientWidth, `${name}: horizontal overflow`);
        assert.ok(metrics.background.includes('ui-atlas'), `${name}: actual atlas not applied`);
        result.variants[name] = metrics;
        await capture(name);
        return metrics;
      }
      const normal = await measure('normal');
      assert.equal(normal.fallbackCount, 0, 'normal labels should fit rendered safe regions');
      assert.equal(normal.badges.length, 3, 'all three live native badge examples required');
      assert.ok(normal.badges.every((badge) => badge.width === 88 && badge.height === 24 && !badge.fallback), 'normal badges retain native 88×24 art');
      assert.equal(normal.duration, '0.12s', 'release must use generated motion-d2');
      assert.equal(normal.selectedAtlas.includes('@2x'), density === 2, 'gallery must select the actual display-density export');
      assert.ok(normal.easing.startsWith('linear('), 'release uses the actual exported sampled Blender curve');
      await page.keyboard.press('Tab');
      assert.ok(await page.evaluate(() => document.activeElement.matches('button') && document.activeElement.matches(':focus-visible') && parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2), 'keyboard focus must be visible');
      await capture('focus');
      const toggle = page.locator('[data-action="toggle"]').first();
      await toggle.focus(); await page.keyboard.press('Space');
      assert.equal(await toggle.getAttribute('aria-pressed'), 'false', 'Space must activate native toggle');
      assert.equal((await toggle.textContent()).trim(), 'Released', 'released toggle has a non-color text cue');
      await page.keyboard.press('Enter');
      assert.equal(await toggle.getAttribute('aria-pressed'), 'true', 'Enter must activate native toggle');
      assert.equal((await toggle.textContent()).trim(), 'Pressed', 'pressed toggle has a non-color text cue');
      result.keyboard = { space: 'Released', enter: 'Pressed' };
      const target = page.locator('.bui-button').first(); const before = await target.boundingBox();
      await target.hover(); await page.mouse.down(); await page.waitForTimeout(100);
      const pressed = await target.boundingBox();
      assert.equal(pressed.width, before.width, 'pressed hitbox width must not shrink');
      assert.equal(pressed.height, before.height, 'pressed hitbox height must not shrink');
      const pressedState = await target.evaluate((el) => ({ face: getComputedStyle(el, '::before').backgroundPosition, expected: getComputedStyle(el).getPropertyValue('--bui-button-neutral-pressed').trim(), duration: getComputedStyle(el.querySelector('.bui-button__label')).transitionDuration }));
      assert.equal(pressedState.face, pressedState.expected, 'pressed atlas sprite must be applied');
      assert.equal(pressedState.duration, '0.08s', 'press must use generated motion-d1');
      result.pressed = { before, after: pressed, ...pressedState };
      await capture('pressed');
      await page.mouse.up();
      await page.locator('[data-action="meter"]').click();
      await page.waitForFunction(() => document.querySelector('[role="meter"]').getAttribute('aria-valuenow') === '84'
        && document.querySelector('#interaction-status').textContent === 'Sample capacity 84 percent. Preview complete.');
      assert.equal(await page.locator('#meter-output').getAttribute('aria-live'), 'off', 'intermediate output does not announce each animation frame');
      assert.equal(await page.locator('#interaction-status').textContent(), 'Sample capacity 84 percent. Preview complete.', 'final meter value is announced in the polite status region');
      await page.locator('[data-action="ground"]').click(); await measure('light');
      await page.locator('[data-action="ground"]').click();
      await page.evaluate(() => window.__UI_ATLAS_REVIEW__.setTextZoom(true));
      const zoom = await measure('text200'); assert.ok(zoom.fallbackCount >= 9, 'text zoom must escape fixed art safely');
      await page.locator('[data-action="ground"]').click();
      await toggle.focus(); await page.keyboard.press('ArrowRight');
      const combinedFocus = await toggle.evaluate((el) => ({ focused: el.matches(':focus-visible'), shadow: getComputedStyle(el).boxShadow }));
      assert.ok(combinedFocus.focused && combinedFocus.shadow.includes('rgb(13, 18, 25)'), 'focused pressed text fallback retains dark focus backing on light ground');
      result.combinedFocus = combinedFocus;
      await measure('text200-light-focus');
      await page.locator('[data-action="ground"]').click();
      await page.evaluate(() => window.__UI_ATLAS_REVIEW__.setTextZoom(false));
      await page.locator('[data-action="reduce"]').click();
      await page.locator('[data-action="meter"]').click();
      const settingReduced = await measure('reduced-setting');
      assert.equal(settingReduced.duration, '0s', 'in-page reduced setting disables press/release displacement');
      assert.equal(settingReduced.meter, '36', 'in-page reduced setting completes live meter immediately');
      await page.locator('[data-action="reduce"]').click();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.locator('[data-action="meter"]').click();
      const reduced = await measure('reduced'); assert.equal(reduced.duration, '0s', 'reduced motion disables press/release displacement');
      assert.equal(reduced.meter, '84', 'reduced motion completes live meter immediately');
      assert.equal(await page.locator('.bui-button[aria-pressed="true"] .bui-button__label').first().evaluate((el) => getComputedStyle(el).transform), 'none', 'reduced motion removes pressed displacement');
      assert.deepEqual(errors, [], 'page/asset errors');
      result.errors = errors; await context.close();
    }
    assert.equal(report.cases.length, 4, 'no empty browser pass');
    report.captureCount = report.cases.reduce((count, entry) => count + Object.keys(entry.captures).length, 0);
    assert.equal(report.captureCount, 32, 'all eight actual captures per mobile case required');
    report.pass = true;
  } catch (error) { operationError = error; report.pass = false; report.failures.push(error.stack); }
  finally {
    report.lifecycle = { browserLaunched: Boolean(browser), browserClosed: null, ownedDevServer: Boolean(server), serverClosed: null };
    try {
      if (browser) {
        await browser.close();
        report.lifecycle.browserClosed = !browser.isConnected();
        assert.ok(report.lifecycle.browserClosed, 'owned browser remained connected after close');
      }
    } catch (error) {
      cleanupError = error; report.pass = false; report.lifecycle.browserClosed = !browser.isConnected();
      report.failures.push(`Browser shutdown: ${error.stack}`);
    }
    try {
      if (server) {
        await server.close();
        report.lifecycle.serverClosed = server.httpServer?.listening === false;
        assert.ok(report.lifecycle.serverClosed, 'owned dev server remained listening after close');
      }
    } catch (error) {
      cleanupError ??= error; report.pass = false; report.lifecycle.serverClosed = false;
      report.failures.push(`Dev server shutdown: ${error.stack}`);
    }
    writeFileSync(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
  if (operationError) throw operationError;
  if (cleanupError) throw cleanupError;
  return report;
}

try {
  const manifest = JSON.parse(readFileSync(resolve(ASSET_DIR, 'manifest.json'), 'utf8'));
  const summary = validate(manifest); sourceContract();
  if (args.includes('--self-test')) {
    for (const input of ['http://127.0.0.1:5196/', 'http://127.0.0.1:5196/subpath/?sound&quality=low#review']) {
      const before = new URL(input), after = new URL(silentReviewUrl(input));
      assert.ok(after.searchParams.has('mute') && !after.searchParams.has('sound'), 'effective review URL must engage game silence');
      assert.equal(after.pathname, before.pathname, 'retain deployed review path');
      assert.equal(after.hash, before.hash, 'retain fragment');
      assert.equal(after.searchParams.get('quality'), before.searchParams.get('quality'), 'retain unrelated query parameters');
    }
    summary.silentUrlFixtures = 2;
    const fixtures = [
      ['empty manifest', (m) => { m.sprites = []; }],
      ['missing sprite', (m) => { m.sprites.pop(); }],
      ['bad dimensions', (m) => { m.sprites[0].native.width--; }],
      ['bad hash', (m) => { m.atlases['2x'].sha256 = '0'.repeat(64); }],
      ['stale source', (m) => { m.generator.sourceSha256 = '0'.repeat(64); }],
      ['false total', (m) => { m.totalPngBytes--; }],
      ['changed safe area', (m) => { m.sprites[0].safeText.width--; }],
      ['changed foreground', (m) => { m.sprites[0].recommendedForeground = '#FF00FF'; }],
      ['overlap', (m) => { m.sprites[1].atlas.x = m.sprites[0].atlas.x; m.sprites[1].atlas.y = m.sprites[0].atlas.y; }],
    ];
    for (const [name, mutate] of fixtures) { const clone = structuredClone(manifest); mutate(clone); assert.throws(() => validate(clone), undefined, `${name} must fail`); }
    assert.throws(() => validate(manifest, () => Buffer.alloc(0)), undefined, 'empty asset must fail');
    assert.throws(() => validate(manifest, () => { throw new Error('missing asset'); }), /missing asset/, 'missing asset must fail');
    summary.rejectedFixtures = fixtures.length + 2;
  }
  console.log(`UI atlas static PASS ${JSON.stringify(summary)}`);
  if (args.includes('--browser')) { const report = await browserCheck(summary); console.log(`UI atlas browser PASS ${report.cases.length} viewport/density cases; ${resolve(output, 'report.json')}`); }
} catch (error) { console.error(`UI atlas FAIL: ${error.stack}`); process.exitCode = 1; }
