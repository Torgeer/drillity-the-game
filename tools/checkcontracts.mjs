#!/usr/bin/env node
/**
 * Contract board DOM gate. Uses the production shell, screen, data and
 * progression in a DOM-only fixture: no renderer, audio or simulation loop.
 *
 *   node tools/checkcontracts.mjs --self-test
 *   node tools/checkcontracts.mjs 5184 --headed
 *   node tools/checkcontracts.mjs 5184 --headed --gpu-owner <coordination/gpu-owner.txt>
 *   node tools/checkcontracts.mjs 5204 --headed --gpu-lease contract-readiness
 *
 * Headed rendering requires the shared GPU slot. Ports 5176/5178 are forbidden.
 * This is a production-DOM fixture, not a WebGL, FPS or full-game boot test.
 * Every generated value comes from game/data.js; fixture overrides label
 * exceptional states, and are test cases rather than economic claims.
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import productionConfig from '../vite.config.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const port = Number(args.find((s) => /^\d+$/.test(s)) || 5184);
if ([5176, 5178].includes(port)) throw new Error('Use an independent contract gate port, never 5176 or 5178.');
const baseline = args.includes('--baseline');
const headed = args.includes('--headed');
const MIN_TARGET = 44; // Owner's project floor: ASTRA.md §8.1.
const VIEWPORTS = [{ width: 320, height: 568 }, { width: 390, height: 844 }];
const BOARD = '.screen.contracts-board:not([hidden])';
const CARD = `${BOARD} .contract-card`;
const SHEET = '.contracts-detail:not(.is-out)';
const ownerArg = args.indexOf('--gpu-owner');
if (ownerArg >= 0 && (!args[ownerArg + 1] || args[ownerArg + 1].startsWith('--'))) throw new Error('--gpu-owner requires a file path');
// The prepared task worktree has a sibling coordination directory; an
// integration checkout elsewhere supplies the same lease file explicitly.
const GPU_OWNER = resolve(ROOT, ownerArg >= 0 ? args[ownerArg + 1] : '../drillity-coordination/gpu-owner.txt');
const leaseArg = args.indexOf('--gpu-lease');
const GPU_LEASE = leaseArg >= 0 ? args[leaseArg + 1] : 'contract-board';
if (!['contract-board', 'contract-readiness'].includes(GPU_LEASE)) throw new Error('Use an exact contract-board or contract-readiness GPU lease.');

/** Verdict fixtures exercise the gate's failures without starting a browser. */
function layoutFailures(result) {
  const failures = [];
  if (!result.targets.length) failures.push('No interactive targets measured');
  if (!result.textCount) failures.push('No text measured');
  if (!result.rootBox || result.rootBox.w <= 0 || result.rootBox.h <= 0) failures.push('Empty root bounds');
  for (const field of ['clipped', 'overflow', 'overlaps', 'textOverlaps', 'externalOcclusion']) {
    if (result[field].length) failures.push(`${field}: ${result[field].length}`);
  }
  const small = result.targets.filter((r) => r.w < MIN_TARGET || r.h < MIN_TARGET);
  if (small.length) failures.push(`Below ${MIN_TARGET}×${MIN_TARGET}: ${small.length}`);
  return failures;
}

if (args.includes('--self-test')) {
  const valid = { targets: [{ w: 44, h: 44 }], textCount: 1, rootBox: { w: 320, h: 568 },
    clipped: [], overflow: [], overlaps: [], textOverlaps: [], externalOcclusion: [] };
  assert.deepEqual(layoutFailures(valid), []);
  const bad = [
    { targets: [] }, { textCount: 0 }, { rootBox: { w: 0, h: 568 } },
    { targets: [{ w: 43.99, h: 44 }] }, { targets: [{ w: 44, h: 43.99 }] },
    ...['clipped', 'overflow', 'overlaps', 'textOverlaps', 'externalOcclusion'].map((key) => ({ [key]: [{}] })),
  ];
  for (const fault of bad) assert.ok(layoutFailures({ ...valid, ...fault }).length, JSON.stringify(fault));
  console.log(`PASS: 1 valid layout and ${bad.length} rejected verdict fixtures; no browser launched`);
  process.exit(0);
}
if (!headed) throw new Error('Use --headed with a granted contract-board GPU slot; headless results are not accepted.');
const out = resolve(ROOT, '.contract-qa', baseline ? 'baseline' : 'current');
await mkdir(out, { recursive: true });
const findings = [];
const checks = [];
function check(ok, label, detail = null) {
  checks.push({ ok: !!ok, label, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${!ok && detail ? ': ' + JSON.stringify(detail) : ''}`);
}

/** Runs inside the page. The production shell owns every visible DOM node. */
async function setupFixture() {
  const [{ createUI }, D, K, { createProgression, SAVE_KEY }, CAT] = await Promise.all([
    import('/src/ui/shell.js'), import('/src/game/data.js'), import('/src/core/contract.js'),
    import('/src/game/progression.js'), import('/src/ui/screens/catalog.js'),
  ]);
  const state = K.createGameState();
  state.settings.haptics = false;
  state.settings.sfx = 0;
  state.settings.music = 0;
  state.settings.reducedMotion = true;
  const bus = K.createBus();
  const accepted = [];
  const regionEvents = [];
  bus.on(K.EVENTS.CONTRACT_ACCEPT, (p) => accepted.push(p.contract.id));
  bus.on(K.EVENTS.REGION_CHANGE, (p) => regionEvents.push(p.regionId));
  const raw = D.makeContractBoard('nordic', 1, K.makeRandom(20260905), 5);
  const ctx = { state, bus, game: { ...D, contracts: raw }, rand: K.makeRandom(20260905), uiRoot: document.querySelector('#ui') };
  ctx.progression = createProgression(ctx);
  await ctx.progression.init();
  const apiCalls = [];
  const productionAccept = ctx.progression.acceptContract;
  const productionGet = ctx.progression.getContracts;
  ctx.progression.acceptContract = (contract) => {
    const result = productionAccept(contract);
    apiCalls.push({ id: contract?.id, result: structuredClone(result) });
    return result;
  };
  let ui = createUI(ctx);
  ctx.ui = ui;
  async function remount(contracts, opts = {}) {
    ui.dispose();
    ctx.game.contracts = contracts;
    // The shell falls back to generation on [], so explicitly remove that
    // provider only in the deliberate empty-board fixture.
    ctx.game.makeContractBoard = contracts.length ? D.makeContractBoard : () => [];
    ctx.progression.getContracts = contracts.length ? productionGet : () => [];
    Object.assign(state.player, opts.player || {});
    if (opts.unlocked) Object.assign(state.unlocked, opts.unlocked);
    if (opts.garage) Object.assign(state.garage, opts.garage);
    ui = createUI(ctx);
    ctx.ui = ui;
    await ui.init();
    ui.resize(innerWidth, innerHeight, devicePixelRatio);
    ui.show(K.SCENES.CONTRACTS);
    ui.setLoadingProgress(1);
    ui.update(1, state);
    await new Promise((r) => setTimeout(r, 80));
  }
  function snap() {
    return { contract: state.contract, world: state.world, drill: state.drill,
      player: state.player, garage: state.garage, accepted: [...accepted], apiCalls: [...apiCalls],
      regionEvents: [...regionEvents], saved: localStorage.getItem(SAVE_KEY), scene: ui.currentScene };
  }
  function generated(methodId, regionId = 'nordic') {
    for (const candidate of regionId ? [regionId] : D.REGIONS.map((r) => r.id)) {
      const rng = K.makeRandom(64007);
      for (let i = 0; i < 2000; i++) {
        const c = D.makeContract(candidate, 60, rng);
        if (c.methodId === methodId) return c;
      }
    }
    throw new Error(`Fixture cannot produce real ${methodId} contract in ${regionId}`);
  }
  function isRendered(el) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    for (let ancestor = el; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      if (style.display === 'none' || style.visibility === 'hidden' || style.contentVisibility === 'hidden'
        || Number(style.opacity) === 0) return false;
      // Chromium can retain layout boxes inside a closed native <details>.
      // Only its first summary subtree is painted and keyboard-accessible.
      if (ancestor !== el && ancestor.matches('details:not([open])')) {
        const summary = [...ancestor.children].find((child) => child.tagName === 'SUMMARY');
        if (!summary?.contains(el)) return false;
      }
    }
    return true;
  }
  window.contractQA = { state, ctx, D, K, CAT, raw, accepted, apiCalls, regionEvents, remount, snap, generated,
    isRendered,
    get ui() { return ui; },
    flush() { ctx.progression.update(2); },
    async reloadSave() {
      const fresh = K.createGameState();
      const other = createProgression({ state: fresh, bus: K.createBus(), rand: K.makeRandom(1) });
      await other.init();
      const value = structuredClone({ contract: fresh.contract, world: fresh.world, garage: fresh.garage, player: fresh.player });
      other.dispose();
      return value;
    },
  };
  await ui.init();
  ui.resize(innerWidth, innerHeight, devicePixelRatio);
  ui.show(K.SCENES.CONTRACTS);
  ui.setLoadingProgress(1);
  ui.update(1, state);
  window.fixtureReady = true;
}

/** Range boxes expose actual glyph clipping; scrollHeight alone misses pills. */
function measureDOM(selector) {
  const root = document.querySelector(selector);
  if (!root) throw new Error(`No root for ${selector}`);
  const visible = window.contractQA.isRendered;
  const desc = (el) => `${el.tagName.toLowerCase()}.${String(el.className).trim().split(/\s+/).join('.')}`;
  const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
  const clipped = [];
  const overflow = [];
  const textRects = [];
  const all = [root, ...root.querySelectorAll('*')].filter(visible);
  for (const el of all) {
    const b = el.getBoundingClientRect();
    if (b.left < -1 || b.right > innerWidth + 1) overflow.push({ element: desc(el), text: el.textContent.trim().slice(0, 120), box: rect(el) });
    for (const node of el.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rs = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      // Geometric range boxes keep their offscreen coordinates while a body
      // scrolls under its fixed header. Only visible fragments can overlap it;
      // unwanted clipping is assessed independently below.
      const visibleRects = rs.map((r) => {
        let left = Math.max(0, r.left), right = Math.min(innerWidth, r.right);
        let top = Math.max(0, r.top), bottom = Math.min(innerHeight, r.bottom);
        for (let anc = el; anc && root.contains(anc); anc = anc.parentElement) {
          const cs = getComputedStyle(anc), a = anc.getBoundingClientRect();
          if (/auto|scroll|hidden|clip/.test(cs.overflowX)) { left = Math.max(left, a.left); right = Math.min(right, a.right); }
          if (/auto|scroll|hidden|clip/.test(cs.overflowY)) { top = Math.max(top, a.top); bottom = Math.min(bottom, a.bottom); }
        }
        return { left, right, top, bottom };
      }).filter((r) => r.right > r.left && r.bottom > r.top);
      textRects.push({ el, text: node.textContent.trim(), rects: visibleRects });
      let scrollableY = false;
      for (let anc = el; anc && root.contains(anc); anc = anc.parentElement) {
        const s = getComputedStyle(anc);
        const a = anc.getBoundingClientRect();
        // Scrolling is a valid vertical access route, but cannot hide the
        // board's comparison text horizontally.
        const clipX = /hidden|clip|auto|scroll/.test(s.overflowX);
        if (/auto|scroll/.test(s.overflowY) && anc.clientHeight > 0 && anc.scrollHeight > anc.clientHeight) scrollableY = true;
        const clipY = /hidden|clip/.test(s.overflowY) && !scrollableY;
        if (rs.some((r) => (clipX && (r.left < a.left - 1 || r.right > a.right + 1))
          || (clipY && (r.top < a.top - 1 || r.bottom > a.bottom + 1)))) {
          clipped.push({ element: desc(el), text: node.textContent.trim(), by: desc(anc), box: rect(el) });
          break;
        }
      }
    }
  }
  const nodes = all.filter((el) => el.matches('button, select, input, a[href], summary, [role="button"]'));
  const targets = nodes.map((el) => ({ element: desc(el), text: (el.getAttribute('aria-label') || el.textContent).trim(),
    tag: el.tagName, disabled: !!el.disabled, ...rect(el) }));
  const overlaps = [];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    if (nodes[i].contains(nodes[j]) || nodes[j].contains(nodes[i])) continue;
    const a = nodes[i].getBoundingClientRect(), b = nodes[j].getBoundingClientRect();
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (w > 1 && h > 1) overlaps.push({ a: targets[i], b: targets[j], area: w * h });
  }
  const textOverlaps = [];
  for (let i = 0; i < textRects.length; i++) for (let j = i + 1; j < textRects.length; j++) {
    const a = textRects[i], b = textRects[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const collides = a.rects.some((ar) => b.rects.some((br) =>
      Math.min(ar.right, br.right) - Math.max(ar.left, br.left) > 1
      && Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top) > 1));
    if (collides) textOverlaps.push({ a: a.text, b: b.text, elementA: desc(a.el), elementB: desc(b.el) });
  }
  const cards = [...root.querySelectorAll('.contract-card')].filter(visible).map((el) => ({ id: el.dataset.contractId, text: el.textContent, ...rect(el) }));
  // Toasts paint above sheets but deliberately ignore pointer events, so
  // elementFromPoint alone cannot detect their visual coverage.
  const externalOcclusion = [];
  for (const toast of document.querySelectorAll('.toasts .toast')) {
    if (!visible(toast) || Number(getComputedStyle(toast).opacity) === 0) continue;
    const a = toast.getBoundingClientRect();
    for (const row of textRects) if (row.rects.some((b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
      && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1)) {
      externalOcclusion.push({ overlay: toast.textContent.trim(), text: row.text });
    }
  }
  const scrolls = all.filter((el) => /auto|scroll/.test(getComputedStyle(el).overflowY))
    .map((el) => ({ element: desc(el), height: el.clientHeight, content: el.scrollHeight, top: el.scrollTop }));
  return { selector, viewport: { width: innerWidth, height: innerHeight }, rootBox: rect(root),
    textCount: textRects.length, clipped, overflow, targets, overlaps, textOverlaps, externalOcclusion, cards, scrolls };
}

/** Prove that controls can be scrolled into view and are not covered by an
 * unrelated overlay. Preserve scroll offsets so screenshots retain the state.
 * Disabled controls still need usable bounds and unobscured visible surfaces. */
async function measureTargetAccess(selector) {
  const roots = [...document.querySelectorAll(selector)];
  if (roots.length !== 1) return { targets: 0, issues: [`Expected one active root, found ${roots.length}`] };
  const root = roots[0];
  const saved = [root, ...root.querySelectorAll('*')].filter((el) => el.scrollHeight > el.clientHeight)
    .map((el) => ({ el, top: el.scrollTop, left: el.scrollLeft }));
  const controls = [...root.querySelectorAll('button, select, input, a[href], summary, [role="button"]')]
    .filter(window.contractQA.isRendered);
  const issues = [];
  for (const el of controls) {
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    await new Promise(requestAnimationFrame);
    const r = el.getBoundingClientRect();
    const left = Math.max(0, r.left), right = Math.min(innerWidth, r.right);
    const top = Math.max(0, r.top), bottom = Math.min(innerHeight, r.bottom);
    const label = el.getAttribute('aria-label') || el.textContent.trim();
    if (right - left < 44 || bottom - top < 44) { issues.push({ label, reason: 'Cannot expose a 44px target area' }); continue; }
    const points = [[(left + right) / 2, (top + bottom) / 2], [left + 8, top + 8],
      [right - 8, top + 8], [left + 8, bottom - 8], [right - 8, bottom - 8]];
    for (const [x, y] of points) {
      const hit = document.elementFromPoint(x, y);
      // Disabled buttons use pointer-events:none in the existing global CSS.
      const ownsHit = hit && (el === hit || el.contains(hit) || (el.disabled && hit.contains(el)));
      if (!ownsHit) issues.push({ label, reason: 'Covered at hit-test point', x, y,
        hit: hit ? `${hit.tagName}.${String(hit.className)}` : null });
    }
  }
  for (const { el, top, left } of saved) { el.scrollTop = top; el.scrollLeft = left; }
  await new Promise(requestAnimationFrame);
  return { targets: controls.length, issues };
}

async function sourceHashes() {
  return Object.fromEntries(await Promise.all([
    'src/game/progression.js', 'src/ui/screens/contracts.js', 'src/ui/screens/contracts.css', 'tools/checkcontracts.mjs',
  ].map(async (path) => [path, createHash('sha256').update(await readFile(resolve(ROOT, path))).digest('hex')])));
}
const verifiedSources = await sourceHashes();
let browser;
let server;
try {
  const gpuOwner = (await readFile(GPU_OWNER, 'utf8')).trim();
  if (gpuOwner !== GPU_LEASE) throw new Error(`GPU owner is ${JSON.stringify(gpuOwner)}, not ${GPU_LEASE}. No browser started.`);
  // Import the existing JS config directly. Vite's config-bundling discovery
  // otherwise probes parent directories unavailable in the task sandbox.
  server = await createServer({ ...productionConfig, configFile: false,
    root: ROOT, cacheDir: resolve(ROOT, '.contract-qa/vite-cache'),
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { port, strictPort: true, host: '127.0.0.1' }, logLevel: 'error' });
  await server.listen();
  // Recheck immediately before launch: server startup cannot reserve the slot.
  if ((await readFile(GPU_OWNER, 'utf8')).trim() !== GPU_LEASE) throw new Error('GPU grant changed during startup. No browser started.');
  browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--mute-audio'] });
  for (const size of VIEWPORTS) {
    const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()} at ${JSON.stringify(message.location())}`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`);
    });
    await page.route('**/__contracts_gate.html*', (route) => route.fulfill({ contentType: 'text/html',
      body: '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="icon" href="data:,"><title>Contract DOM gate</title><div id="ui"></div><script type="module">(' + setupFixture.toString() + ')().catch(e => { window.fixtureError = e.stack; });</script>' }));
    await page.goto(`http://127.0.0.1:${port}/__contracts_gate.html?mute`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.fixtureReady || window.fixtureError, { timeout: 20000 });
    const error = await page.evaluate(() => window.fixtureError);
    if (error) throw new Error(error);
    await page.waitForSelector(CARD);
    await page.waitForTimeout(120);

    async function waitForSettled(selector) {
      await page.waitForFunction((sel) => {
        const el = document.querySelector(sel);
        return el && !el.getAnimations({ subtree: true }).some((a) => a.playState === 'running');
      }, selector);
    }
    async function layout(label, selector = BOARD) {
      await waitForSettled(selector);
      const result = await page.evaluate(measureDOM, selector);
      result.access = await page.evaluate(measureTargetAccess, selector);
      result.label = `${size.width} ${label}`;
      findings.push(result);
      await page.screenshot({ path: resolve(out, `${size.width}-${label}.png`) });
      const failures = layoutFailures(result);
      if (!baseline) check(!failures.length, `${result.label}: nonempty, unclipped, no overlap, 44px controls`, failures);
      else check(result.targets.length > 0 && result.textCount > 0, `${result.label}: baseline measured real content`);
      if (!baseline) check(result.access.targets > 0 && !result.access.issues.length, `${result.label}: controls scroll into view and remain uncovered`, result.access.issues);
      return result;
    }
    async function scrollEnd(label, selector = BOARD) {
      // Sorting rebuilds and staggers the cards. Measure the final text only
      // after that entrance settles, using the same readiness as layout().
      await waitForSettled(selector);
      const scroll = await page.evaluate(async (sel) => {
        const root = document.querySelector(sel);
        const nodes = [root, ...root.querySelectorAll('*')].filter((el) => {
          const cs = getComputedStyle(el);
          return /auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1 && el.clientHeight > 0;
        });
        for (const el of nodes) el.scrollTop = el.scrollHeight;
        await new Promise(requestAnimationFrame);
        return nodes.map((el) => {
          const descendants = [...el.querySelectorAll('*')].filter((item) => window.contractQA.isRendered(item)
            && [...item.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()));
          const lastElement = descendants.at(-1);
          const last = lastElement?.getBoundingClientRect();
          const box = el.getBoundingClientRect();
          return { top: el.scrollTop, max: el.scrollHeight - el.clientHeight,
            lastElement: lastElement ? `${lastElement.tagName}.${String(lastElement.className)}` : null,
            lastText: lastElement?.textContent.trim(),
            lastRect: last ? { top: last.top, bottom: last.bottom, left: last.left, right: last.right } : null,
            scrollRect: { top: box.top, bottom: box.bottom, left: box.left, right: box.right },
            lastVisible: !!last && last.top >= box.top - 1 && last.bottom <= box.bottom + 1 };
        });
      }, selector);
      check(scroll.length > 0 && scroll.every((s) => Math.abs(s.top - s.max) <= 1 && s.lastVisible), `${size.width} ${label}: final content is visible at the scroll end`, scroll);
      return layout(label, selector);
    }
    async function closeSheet() {
      await page.keyboard.press('Escape');
      // is-out begins dismissal; the shared shell restores focus only when
      // the actual sheet node is removed at the end of that dismissal.
      await page.waitForSelector('.contracts-detail', { state: 'detached' });
    }
    async function contentCheck(label) {
      const result = await page.evaluate(() => {
        const q = window.contractQA;
        const errors = [];
        const rows = [...document.querySelectorAll('.contracts-board .contract-card')].filter(q.isRendered);
        const values = [];
        for (const el of rows) {
          const c = q.ctx.game.contracts.find((job) => job.id === el.dataset.contractId);
          if (!c) { errors.push(`Unknown rendered id ${el.dataset.contractId}`); continue; }
          const method = q.CAT.methodInfo(c.methodId)?.name || c.methodId;
          const metres = c.metres || c.targetDepth * Math.max(1, c.holes || 1);
          const rate = `€${(c.payout / metres).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / m`;
          const text = el.textContent;
          const readinessIcons = [...el.querySelectorAll('.contract-card__readiness svg')].filter(q.isRendered);
          if (readinessIcons.length !== 1) errors.push(`${c.id}: expected one visible readiness icon, found ${readinessIcons.length}`);
          for (const [name, expected] of [['method', method], ['title', c.title], ['pay', `€${Math.round(c.payout).toLocaleString('en-GB')}`],
            ['rate', rate], ['constraint', c.constraint?.label],
            ['estimated hours', `${Number(c.estimatedHours).toFixed(1)} h`], ['deadline', `${c.deadlineHours} h`],
            ['target length', `${Number(c.targetDepth).toFixed(1)} m`], ['total length', `${Number(metres).toFixed(1)} m`],
            ['application', q.D.APPLICATIONS.find((a) => a.id === c.applicationId)?.name]]) {
            if (expected && !text.includes(expected)) errors.push(`${c.id}: missing full ${name}: ${expected}`);
          }
          if (!/Estimated/i.test(text) || !/Deadline/i.test(text)) errors.push(`${c.id}: missing explicit time labels`);
          const count = Math.max(1, c.holes || 1), noun = c.unitNoun || 'unit';
          const scope = `${count} ${noun}${count === 1 ? '' : 's'} × ${Number(c.targetDepth).toFixed(1)} m · ${Number(metres).toFixed(1)} m total${c.holeDia ? ` · Ø${c.holeDia} mm` : ''}`;
          if (el.querySelector('.contract-card__scope')?.textContent.replace(/\u00a0/g, ' ') !== scope) errors.push(`${c.id}: scope does not match ${scope}`);
          const estimated = [...el.querySelectorAll('.contract-card__metric')].find((metric) => /Estimated/.test(metric.querySelector('.contract-card__label')?.textContent || ''));
          if (estimated?.querySelector('.contract-card__value')?.textContent !== `${Number(c.estimatedHours).toFixed(1)} h`) errors.push(`${c.id}: incorrect estimated time value`);
          if (el.querySelector('.contract-card__deadline')?.textContent !== `Deadline · ${c.deadlineHours} h`) errors.push(`${c.id}: incorrect deadline value`);
          values.push({ id: c.id, method, title: c.title, metres, payout: c.payout, rate, estimatedHours: c.estimatedHours,
            deadlineHours: c.deadlineHours, constraint: c.constraint?.label, rendered: text });
        }
        return { count: rows.length, errors, values };
      });
      check(result.count > 0 && !result.errors.length, `${size.width} ${label}: full production method, scope and quote data`, result.errors);
      return result;
    }
    async function facetCounts(label) {
      const result = await page.evaluate(() => {
        const q = window.contractQA;
        const method = document.querySelector('[aria-label="Method"] .chip[aria-pressed="true"]')?.dataset.filterId || 'all';
        const region = document.querySelector('[aria-label="Region"] .chip[aria-pressed="true"]')?.dataset.filterId || 'all';
        const mismatches = [];
        let count = 0;
        for (const axis of ['Method', 'Region']) for (const chip of document.querySelectorAll(`[aria-label="${axis}"] .chip`)) {
          const id = chip.dataset.filterId;
          const expected = q.mixed.filter((c) => axis === 'Method'
            ? (region === 'all' || c.regionId === region) && (id === 'all' || c.methodId === id)
            : (method === 'all' || c.methodId === method) && (id === 'all' || c.regionId === id)).length;
          const actual = Number(chip.querySelector('.chip__count')?.textContent);
          if (actual !== expected) mismatches.push({ axis, id, actual, expected });
          count++;
        }
        return { count, mismatches };
      });
      check(result.count > 0 && !result.mismatches.length, `${size.width} ${label}: chip counts respect the opposite filter`, result);
    }
    const initial = await layout('starter');
    console.log(`MEASURE ${size.width}: ${initial.cards.length} cards, ${initial.clipped.length} clipped text nodes, ${initial.overflow.length} overflow elements`);
    if (baseline) { await context.close(); continue; }

    check(initial.cards.length === 5, `${size.width}: all five production starter jobs render`);
    initial.content = await contentCheck('starter');
    for (const sort of ['pay', 'rate', 'quick', 'deep']) {
      await page.locator(`${BOARD} select`).selectOption(sort);
      const sorted = await page.evaluate((id) => {
        const q = window.contractQA;
        const keys = { pay: (c) => c.payout, rate: (c) => c.payout / (c.metres || c.targetDepth * c.holes),
          quick: (c) => -(c.estimatedHours || c.deadlineHours), deep: (c) => c.targetDepth };
        const expected = [...q.raw].sort((a, b) => keys[id](b) - keys[id](a)).map((c) => c.id);
        const actual = [...document.querySelectorAll('.contracts-board .contract-card')].map((el) => el.dataset.contractId);
        return { expected, actual };
      }, sort);
      check(JSON.stringify(sorted.actual) === JSON.stringify(sorted.expected), `${size.width}: ${sort} sorts by production values`, sorted);
    }
    await scrollEnd('starter-end');
    const card = page.locator(CARD).first();
    await card.scrollIntoViewIfNeeded();
    await card.focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector(SHEET);
    await layout('details', SHEET);
    check(await page.evaluate(() => !!document.activeElement?.closest('.contracts-detail')), `${size.width}: opening detail enters dialog focus`);
    const rateEvidence = await page.evaluate(() => {
      const q = window.contractQA;
      const title = document.querySelector('.contracts-detail .sheet__t').textContent;
      const c = q.raw.find((v) => title.includes(v.title));
      const rates = [...document.querySelectorAll('.contracts-detail .spec')]
        .filter((el) => /rate|total m/i.test(el.querySelector('dt')?.textContent || ''))
        .map((el) => ({ label: el.querySelector('dt').textContent, value: el.querySelector('dd').textContent }));
      return { rates, expected: `€${(c.payout / (c.metres || c.targetDepth * c.holes)).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / m` };
    });
    check(rateEvidence.rates.length === 1 && rateEvidence.rates[0].value.includes(rateEvidence.expected), `${size.width}: one detail rate uses whole-job metres`, rateEvidence);
    const focusEscapes = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press(i < 3 ? 'Tab' : 'Shift+Tab');
      if (!await page.evaluate(() => !!document.activeElement?.closest('.contracts-detail'))) focusEscapes.push(i);
    }
    check(!focusEscapes.length, `${size.width}: Tab and Shift+Tab stay in the dialog`, focusEscapes);
    await scrollEnd('details-end', SHEET);
    const beforeClose = await page.evaluate(() => JSON.stringify(window.contractQA.snap()));
    await closeSheet();
    check(await page.evaluate(() => document.activeElement?.classList.contains('contract-card')), `${size.width}: Escape returns focus to the card`);
    const afterClose = await page.evaluate(() => JSON.stringify(window.contractQA.snap()));
    check(beforeClose === afterClose, `${size.width}: closing details leaves game and save untouched`);

    await page.evaluate(async () => {
      const q = window.contractQA;
      // Method unlock level is the production rule; a decorative contract.level
      // override was only enforced by the former duplicated UI lock logic.
      await q.remount([{ ...q.generated('dth'), id: 'qa-level-lock' }]);
    });
    await layout('level-locked');
    await page.locator(CARD).focus();
    await page.keyboard.press(' ');
    await page.waitForSelector(SHEET);
    check(await page.locator(`${SHEET} button:disabled`).count() > 0, `${size.width}: level-locked action is disabled`);
    await layout('locked-details', SHEET);
    await closeSheet();

    const filterNames = await page.evaluate(async () => {
      const q = window.contractQA;
      const foreign = q.D.REGIONS.find((r) => r.id !== 'nordic' && r.applications.some((id) => q.D.getMethod('auger').applications.includes(id)));
      if (!foreign) throw new Error('No production region for multi-region fixture');
      q.mixed = [q.raw[0], q.generated('dth'), q.generated('auger', foreign.id)];
      await q.remount(q.mixed, { player: { level: 60, certs: q.D.CERTS.map((c) => c.id) },
        unlocked: { methods: q.D.METHODS.map((m) => m.id), regions: q.D.REGIONS.map((r) => r.id), rigs: q.D.RIGS.map((r) => r.id) } });
      return { method: q.CAT.methodInfo('dth').name, region: q.CAT.regionInfo(foreign.id).name };
    });
    await layout('mixed');
    await contentCheck('mixed');
    await page.locator(`${BOARD} select`).selectOption('quick');
    const summary = page.locator(`${BOARD} summary`);
    await summary.click();
    await layout('filters-expanded');
    await facetCounts('all filters');
    await page.locator(`${BOARD} .chip`).filter({ has: page.getByText(filterNames.method, { exact: true }) }).click();
    check(await page.locator(CARD).count() === 1, `${size.width}: method filter selects the one matching job`);
    await facetCounts('method filtered');
    await page.locator(`${BOARD} .chip`).filter({ has: page.getByText(filterNames.region, { exact: true }) }).click();
    check(await page.locator(CARD).count() === 0 && await page.locator(`${BOARD} .empty`).count() === 1, `${size.width}: cross filters expose an honest empty result`);
    await facetCounts('cross filtered');
    await layout('overfiltered');
    await summary.click();
    await layout('active-filters-collapsed');
    const filterText = await summary.textContent();
    check(filterText.includes(filterNames.method) && filterText.includes(filterNames.region), `${size.width}: collapsed filters name both selections`, filterText);
    await page.getByRole('button', { name: /clear filters|reset filters|clear all/i }).click();
    check(await page.locator(CARD).count() === 3, `${size.width}: reset restores every mixed-board job`);
    check(await page.locator(`${BOARD} select`).inputValue() === 'quick', `${size.width}: filter reset preserves the chosen sort`);
    await layout('filters-reset');

    await page.evaluate(async () => {
      const q = window.contractQA;
      await q.remount(q.mixed, { player: { level: 1 } });
    });
    for (const sort of ['pay', 'rate', 'quick', 'deep']) {
      await page.locator(`${BOARD} select`).selectOption(sort);
      const sorted = await page.evaluate((id) => {
        const q = window.contractQA;
        const locked = (c) => !q.ctx.progression.previewContract(c).ok;
        const keys = { pay: (c) => c.payout, rate: (c) => c.payout / (c.metres || c.targetDepth * c.holes),
          quick: (c) => -(c.estimatedHours || c.deadlineHours), deep: (c) => c.targetDepth };
        const expected = [...q.mixed].sort((a, b) => Number(locked(a)) - Number(locked(b)) || keys[id](b) - keys[id](a)).map((c) => c.id);
        const actual = [...document.querySelectorAll('.contracts-board .contract-card')].map((el) => el.dataset.contractId);
        return { expected, actual, locked: q.mixed.filter(locked).length, available: q.mixed.filter((c) => !locked(c)).length };
      }, sort);
      check(sorted.locked > 0 && sorted.available > 0 && JSON.stringify(sorted.actual) === JSON.stringify(sorted.expected),
        `${size.width}: ${sort} keeps available jobs before locked jobs`, sorted);
    }
    await layout('mixed-locked-order');
    await page.evaluate(async () => {
      const q = window.contractQA, rng = q.K.makeRandom(9035);
      const samples = q.D.REGIONS.flatMap((region) => Array.from({ length: 300 }, () => q.D.makeContract(region.id, 60, rng)));
      const longestTitle = samples.reduce((a, b) => a.title.length >= b.title.length ? a : b);
      const subtitle = (c) => `${q.CAT.regionInfo(c.regionId).name} · ${q.CAT.methodInfo(c.methodId).name}`;
      const longestSubtitle = samples.reduce((a, b) => subtitle(a).length >= subtitle(b).length ? a : b);
      q.longBoard = [...new Map([longestTitle, longestSubtitle].map((c) => [c.id, c])).values()];
      await q.remount(q.longBoard, { player: { level: 60 } });
    });
    await layout('long-real-headers');
    await contentCheck('long real headers');
    for (let i = 0; i < await page.locator(CARD).count(); i++) {
      await page.locator(CARD).nth(i).click();
      await layout(`long-details-${i}`, SHEET);
      await scrollEnd(`long-details-${i}-end`, SHEET);
      await closeSheet();
    }

    await page.evaluate(async () => {
      const q = window.contractQA;
      await q.remount([{ ...q.raw[0], id: 'qa-long-cert-lock', requiredCerts: q.D.CERTS.slice(0, 4).map((c) => c.id) }],
        { player: { certs: [] } });
    });
    await layout('certificate-locked');
    await page.locator(CARD).click();
    await layout('certificate-details', SHEET);
    await scrollEnd('certificate-details-end', SHEET);
    await closeSheet();

    // Readiness uses the real public API. Each refusal remains inspectable,
    // and merely rendering/updating the board must not attempt acceptance.
    for (const kind of ['depth', 'unknown-rating', 'funding']) {
      const readiness = await page.evaluate(async (kind) => {
        const q = window.contractQA;
        const foreign = q.D.REGIONS.find((r) => r.id !== 'nordic'
          && r.applications.some((id) => q.D.getMethod('auger').applications.includes(id)));
        let c = kind === 'funding' ? q.generated('auger', foreign.id)
          : kind === 'depth' ? q.generated('cfa', null) : q.generated('auger');
        if (kind === 'depth') c = { ...c, targetDepth: q.D.rigDepthCapacity('cfa-rig', 'cfa') + 0.01 };
        if (kind === 'unknown-rating') c = { ...c, targetDepth: 1 };
        q.readinessContract = { ...c, id: `qa-readiness-${kind}` };
        await q.remount([q.readinessContract], {
          player: { level: 60, money: kind === 'funding' ? 0 : 1e8, certs: q.D.CERTS.map((c) => c.id) },
          unlocked: { methods: q.D.METHODS.map((m) => m.id), regions: q.D.REGIONS.map((r) => r.id),
            rigs: kind === 'funding' ? q.D.RIGS.map((r) => r.id) : ['cfa-rig'] },
          garage: { rigId: kind === 'funding' ? 'crawler-lite' : 'cfa-rig' },
        });
        const before = JSON.stringify(q.snap());
        for (let i = 0; i < 25; i++) q.ui.update(0, q.state);
        const result = q.ctx.progression.previewContract(q.readinessContract);
        return { result, unchanged: before === JSON.stringify(q.snap()), calls: q.apiCalls.length,
          text: document.querySelector('.contract-card').textContent,
          header: document.querySelector('.contracts-board .shead__s').textContent,
          locked: document.querySelector('.contract-card').classList.contains('is-locked') };
      }, kind);
      check(!readiness.result.ok && readiness.unchanged && readiness.calls === 0 && readiness.locked
        && readiness.text.includes(readiness.result.reason) && readiness.header.includes('0 ready'),
      `${size.width}: ${kind} readiness shows the actual refusal without state/save/API mutation`, readiness);
      if (kind === 'funding') check(readiness.result.mobilisation > 0 && /need.*more/.test(readiness.result.reason),
        `${size.width}: mobilisation refusal includes the current shortfall`, readiness.result);
      await layout(`readiness-${kind}`);
      await page.locator(CARD).click();
      check(await page.locator(`${SHEET} button:disabled`).count() === 1
        && (await page.locator(SHEET).textContent()).includes(readiness.result.reason),
      `${size.width}: ${kind} details expose refusal and disable acceptance`);
      await layout(`readiness-${kind}-details`, SHEET);
      if (kind === 'funding') {
        const refreshed = await page.evaluate(() => {
          const q = window.contractQA, card = document.querySelector('.contract-card');
          const focused = document.activeElement;
          q.state.player.money = 1e8;
          const before = JSON.stringify(q.snap());
          q.ui.update(0, q.state);
          const result = q.ctx.progression.previewContract(q.readinessContract);
          return { result, unchanged: before === JSON.stringify(q.snap()),
            sameCard: card === document.querySelector('.contract-card'), sameFocus: focused === document.activeElement,
            text: document.querySelector('.contracts-detail').textContent,
            disabled: document.querySelectorAll('.contracts-detail button:disabled').length };
        });
        check(refreshed.result.ok && refreshed.unchanged && refreshed.sameCard && refreshed.sameFocus && refreshed.disabled === 0
          && refreshed.text.includes(`€${Math.round(refreshed.result.mobilisation).toLocaleString('en-GB')}`),
        `${size.width}: open details refresh funded readiness without replacing focus or mutating state`, refreshed);
        await layout('readiness-funded-live', SHEET);
        await page.getByRole('button', { name: 'Accept contract', exact: true }).focus();
        const blockedFocus = await page.evaluate(() => {
          const q = window.contractQA;
          q.state.player.money = 0; q.ui.update(0, q.state);
          return { inside: !!document.activeElement?.closest('.contracts-detail'),
            disabled: document.querySelectorAll('.contracts-detail button:disabled').length };
        });
        check(blockedFocus.inside && blockedFocus.disabled === 1,
          `${size.width}: losing readiness keeps keyboard focus in the dialog`, blockedFocus);
        await page.keyboard.press('Tab');
        check(await page.evaluate(() => !!document.activeElement?.closest('.contracts-detail')),
          `${size.width}: keyboard remains contained after readiness disables acceptance`);
      }
      await closeSheet();
    }

    await page.evaluate(async () => {
      const q = window.contractQA;
      await q.remount([], { player: { level: 1 } });
    });
    await layout('empty');
    check(await page.locator(`${BOARD} .empty`).count() === 1, `${size.width}: deliberate empty board has an honest empty state`);
    await page.evaluate(async () => {
      const q = window.contractQA;
      const fresh = q.K.createGameState();
      await q.remount(q.raw, { player: fresh.player, garage: fresh.garage, unlocked: fresh.unlocked });
    });
    await page.locator(CARD).first().click();
    await page.evaluate(() => {
      const q = window.contractQA;
      q.restoreGarage = structuredClone(q.state.garage);
      q.restoreUnlocked = structuredClone(q.state.unlocked);
      // State changes after opening details: the real API must refuse it.
      q.state.garage.rigId = 'qa-no-owned-rig';
      q.state.unlocked.rigs = [];
      q.failedBefore = JSON.stringify({ state: q.state, saved: q.snap().saved });
      // No frame/update between the mutation and activation: stale rendered
      // readiness cannot replace the actual acceptance API's live recheck.
      const button = [...document.querySelectorAll('.contracts-detail button')].find((el) => el.textContent === 'Accept contract');
      if (!button || button.disabled) throw new Error('No live accept action for genuine refusal probe');
      button.focus();
      button.click();
    });
    const refused = await page.evaluate(() => {
      const q = window.contractQA;
      return { calls: q.apiCalls, accepted: q.accepted,
        unchanged: q.failedBefore === JSON.stringify({ state: q.state, saved: q.snap().saved }),
        sheet: !!document.querySelector('.contracts-detail:not(.is-out)'), text: document.querySelector('.contracts-detail')?.textContent,
        focusInside: !!document.activeElement?.closest('.contracts-detail') };
    });
    check(refused.calls.length === 1 && refused.calls[0].result.ok === false && refused.accepted.length === 0
      && refused.unchanged && refused.sheet && refused.text.includes(refused.calls[0].result.reason),
    `${size.width}: real API refusal leaves state/save intact and explains the failure in detail`, refused);
    check(refused.focusInside, `${size.width}: real API refusal preserves dialog keyboard focus`);
    await layout('accept-refused', SHEET);
    const recovered = await page.evaluate(() => {
      const q = window.contractQA;
      q.state.garage = q.restoreGarage;
      q.state.unlocked = q.restoreUnlocked;
      const before = JSON.stringify(q.snap());
      q.ui.update(0, q.state);
      return { unchanged: before === JSON.stringify(q.snap()),
        status: document.querySelector('.contracts-detail__status').textContent,
        errorHidden: document.querySelector('.contracts-detail__error').hidden,
        disabled: document.querySelectorAll('.contracts-detail button:disabled').length };
    });
    check(recovered.unchanged && recovered.status.includes('Ready') && recovered.errorHidden && recovered.disabled === 0,
      `${size.width}: restored ownership clears obsolete refusal while preserving state and ready action`, recovered);
    await layout('accept-recovered', SHEET);
    await closeSheet();
    await page.locator(CARD).first().click();
    await page.evaluate(() => {
      const button = [...document.querySelectorAll('.contracts-detail button')].find((el) => el.textContent === 'Accept contract');
      if (!button) throw new Error('No accept action to exercise repeated activation');
      button.click(); button.click();
      window.contractQA.flush();
    });
    const accepted = await page.evaluate(async () => {
      const q = window.contractQA;
      return { snap: q.snap(), restored: await q.reloadSave() };
    });
    check(accepted.snap.apiCalls.length === 2 && accepted.snap.apiCalls[1].result.ok === true
      && accepted.snap.accepted.length === 1 && accepted.snap.regionEvents.length === 1,
    `${size.width}: repeated activation accepts through progression exactly once`, accepted.snap.apiCalls);
    check(accepted.snap.scene === 'site' && accepted.snap.contract?.id === accepted.snap.accepted[0]
      && accepted.restored.contract?.id === accepted.snap.contract.id,
    `${size.width}: accepted production contract navigates and survives save reload`, { scene: accepted.snap.scene, contractId: accepted.snap.contract?.id, restoredId: accepted.restored.contract?.id });
    check(!errors.length, `${size.width}: no page exceptions`, errors);
    await context.close();
  }
} catch (error) {
  check(false, 'gate completed', error.stack || String(error));
} finally {
  await browser?.close();
  await server?.close();
  const resources = { browserClosed: !!browser && !browser.isConnected(), serverClosed: !!server && !server.httpServer?.listening };
  check(resources.browserClosed && resources.serverClosed, 'owned browser and fixture server closed', resources);
  check(JSON.stringify(verifiedSources) === JSON.stringify(await sourceHashes()), 'source stayed frozen throughout browser verification');
  await writeFile(resolve(out, 'report.json'), JSON.stringify({ mode: 'headed production DOM fixture',
    limitations: ['No WebGL renderer, simulation loop or FPS measurement.', 'System fallback fonts; no remote font fetch.',
      'Desktop Chrome viewports with reduced motion; safe-area CSS values are zero.'],
    port, baseline, resources, sourceHashes: verifiedSources, checks, findings }, null, 2));
}
const fail = checks.filter((r) => !r.ok);
if (!findings.length) { console.error('FAIL: measured no layout states'); process.exitCode = 1; }
else if (fail.length) { console.error(`FAIL: ${fail.length}/${checks.length} checks`); process.exitCode = 1; }
else console.log(`${baseline ? 'BASELINE RECORDED' : 'PASS'}: ${findings.length} nonempty layout states; ${checks.length} assertions`);
