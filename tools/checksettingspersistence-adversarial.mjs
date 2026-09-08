#!/usr/bin/env node
/** Independent settings persistence probes against actual menu/progression.
 * Components, storage, and window/document lifecycle surfaces are CPU doubles.
 * This does not measure DOM, browser lifecycle delivery, sound, or frame time.
 * Run: node tools/checksettingspersistence-adversarial.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY } from '../src/game/progression.js';
import { createMenuScreen } from '../src/ui/screens/menu.js';

assert.equal(process.argv.length, 2, 'settings critic accepts no arguments');
const keys = ['localStorage', 'window', 'document'];
const descriptors = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const urls = {
  menu: new URL('../src/ui/screens/menu.js', import.meta.url),
  progression: new URL('../src/game/progression.js', import.meta.url),
};
const sources = Object.fromEntries(Object.entries(urls).map(([key, url]) => [key, readFileSync(url, 'utf8')]));
const hash = source => createHash('sha256').update(source).digest('hex');

function controls() {
  const nodes = [];
  function h(selector, ...args) {
    const classes = new Set(selector.split('.').slice(1)), listeners = new Map();
    const node = {
      selector, attrs: {}, children: [], value: '', textContent: '',
      style: { setProperty() {} },
      classList: {
        contains: value => classes.has(value),
        add: value => classes.add(value), remove: value => classes.delete(value),
        toggle: (value, on) => on ? classes.add(value) : classes.delete(value),
      },
      appendChild(child) { this.children.push(child); return child; },
      setAttribute(key, value) { this.attrs[key] = String(value); },
      addEventListener(event, fn) { listeners.set(event, fn); },
      fire(event) { assert.ok(listeners.has(event), `${selector} has actual ${event} callback`); listeners.get(event)(); },
    };
    for (const arg of args.flat(Infinity)) {
      if (!arg) continue;
      if (typeof arg === 'object' && !arg.selector) {
        Object.assign(node.attrs, arg);
        if ('text' in arg) node.textContent = arg.text;
        if ('value' in arg) node.value = arg.value;
      } else node.children.push(arg);
    }
    nodes.push(node); return node;
  }
  return {
    nodes, h, tap: (node, fn) => node.addEventListener('tap', fn),
    append: (node, children) => children.filter(Boolean).forEach(child => node.appendChild(child)),
    Button({ label, onTap }) { const node = h('button', { text: label }); node.addEventListener('tap', onTap); return node; },
    Ring: () => ({ el: h('span'), setValue() {} }),
    NumberRoll: () => ({ to() {}, step() {}, setInstant() {} }),
    Wordmark: () => h('span'), SpecRow: () => h('div'),
  };
}

async function fixture({ menuFactory = createMenuScreen, progressionFactory = createProgression } = {}) {
  const payloads = new Map(), writes = [], attempts = [], failures = new Set();
  const storage = {
    getItem: key => payloads.get(key) ?? null,
    setItem(key, value) {
      attempts.push(key);
      if (failures.has(key)) throw new Error(`critic storage failure: ${key}`);
      payloads.set(key, String(value)); writes.push(key);
    },
    removeItem: key => payloads.delete(key),
  };
  const lifecycle = new EventTarget(), documentState = { visibilityState: 'visible' };
  for (const [key, value] of [['localStorage', storage], ['window', lifecycle], ['document', documentState]]) {
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  const state = createGameState(), bus = createBus(), C = controls();
  const progression = progressionFactory({ state, bus, rand: makeRandom(1108) });
  await progression.init();
  assert.equal(progression.save(), true, 'baseline primary exists');
  assert.equal(progression.save(), true, 'baseline backup exists');
  const app = { C, state, bus, ctx: { progression }, fmtMoney: String,
    toast() {}, haptic() {}, sheet: value => value };
  menuFactory(app);
  C.nodes.find(node => node.textContent === 'Settings').fire('tap');
  function input(key, value) {
    const label = { sfx: 'Effects', music: 'Music', haptics: 'Haptics', reducedMotion: 'Reduced motion' }[key];
    const node = key === 'quality'
      ? C.nodes.find(node => node.selector.startsWith('button.tabs__b') && node.textContent.toLowerCase() === value)
      : C.nodes.find(node => node.attrs['aria-label'] === label);
    assert.ok(node, `${key}: production creates a control`);
    if (node.attrs.type === 'range') { node.value = String(value * 100); node.fire('input'); }
    else node.fire('tap');
    assert.equal(state.settings[key], value, `${key}: input changes live settings`);
  }
  function event(type, hidden = true) {
    documentState.visibilityState = hidden ? 'hidden' : 'visible';
    lifecycle.dispatchEvent(new Event(type));
  }
  async function reload(expected) {
    const reloaded = createGameState();
    const fresh = createProgression({ state: reloaded, bus: createBus(), rand: makeRandom(1109) });
    try {
      await fresh.init();
      for (const [key, value] of Object.entries(expected)) assert.equal(reloaded.settings[key], value,
        `reloaded settings retain latest ${key}`);
    } finally { fresh.dispose(); }
  }
  return { state, progression, input, event, reload, writes, attempts, failures, payloads };
}

async function coalesced(factory = createMenuScreen) {
  const f = await fixture({ menuFactory: factory });
  try {
    const baseline = f.writes.length;
    for (let step = 0; step < 100; step++) { f.input('sfx', step / 100); f.input('music', step / 100); }
    assert.equal(f.writes.length, baseline, 'slider burst coalesces without synchronous writes');
    f.progression.update(1.19);
    assert.equal(f.writes.length, baseline, 'quiet debounce has not expired');
    // A repeated value must not restart the pending quiet period.
    f.input('music', .99); f.progression.update(.02);
    assert.deepEqual(f.writes.slice(baseline), [SAVE_BACKUP_KEY, SAVE_KEY], 'burst makes one backup and one primary');
    await f.reload({ sfx: .99, music: .99 });
    const committed = f.writes.length;
    f.progression.update(5); f.event('pagehide');
    assert.equal(f.writes.length, committed, 'clean updates and pagehide do not repeat saves');
  } finally { f.failures.clear(); f.progression.dispose(); }
}

let cases = 0, mutations = 0;
async function test(label, callback) { await callback(); cases++; console.log(`PASS ${label}`); }
function replaceOnce(source, needle, replacement) {
  assert.equal(source.split(needle).length, 2, `one negative-control anchor: ${needle}`);
  return source.replace(needle, replacement);
}
async function mutatedModule(kind, needle, replacement) {
  const source = replaceOnce(sources[kind], needle, replacement)
    .replace(/from '(\.\.?\/[^']+)'/g, (_, specifier) => `from '${new URL(specifier, urls[kind]).href}'`);
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
const quietWarning = async fn => {
  const old = console.warn, warnings = [];
  console.warn = (...values) => warnings.push(values.join(' '));
  try { await fn(warnings); } finally { console.warn = old; }
};

try {
  await test('200 slider inputs coalesce; unchanged input leaves the pending deadline intact', coalesced);
  await test('changed inputs separated by frames reset the debounce and persist final mixed preferences', async () => {
    const f = await fixture();
    try {
      const baseline = f.writes.length;
      for (const [key, value] of [['music', .31], ['sfx', .42], ['quality', 'low'], ['haptics', false], ['reducedMotion', true]]) {
        f.input(key, value); f.progression.update(1);
        assert.equal(f.writes.length, baseline, 'each changed input extends the quiet period');
      }
      f.progression.update(.21);
      assert.equal(f.writes.length, baseline + 2);
      await f.reload({ music: .31, sfx: .42, quality: 'low', haptics: false, reducedMotion: true });
    } finally { f.progression.dispose(); }
  });
  for (const type of ['pagehide', 'visibilitychange']) await test(`${type} flushes latest values before any frame`, async () => {
    const f = await fixture();
    try {
      const baseline = f.writes.length;
      f.input('music', .11); f.input('music', .72); f.input('quality', 'high');
      f.event('visibilitychange', false);
      assert.equal(f.writes.length, baseline, 'visible visibilitychange must not flush');
      f.event(type);
      assert.deepEqual(f.writes.slice(baseline), [SAVE_BACKUP_KEY, SAVE_KEY]);
      await f.reload({ music: .72, quality: 'high' });
    } finally { f.progression.dispose(); }
  });
  for (const type of ['pagehide', 'visibilitychange']) await test(`${type} retries a failed primary with the newest later input`, async () => {
    const f = await fixture();
    try {
      const previous = f.payloads.get(SAVE_KEY);
      await quietWarning(async warnings => {
        f.failures.add(SAVE_KEY); f.input('music', .23); f.event(type);
        assert.equal(f.payloads.get(SAVE_KEY), previous, 'failed primary preserves previous career');
        assert.equal(f.payloads.get(SAVE_BACKUP_KEY), previous, 'valid backup is preserved');
        assert.ok(warnings.some(value => value.includes(`critic storage failure: ${SAVE_KEY}`)));
        f.input('music', .77); f.failures.clear(); f.event(type);
        await f.reload({ music: .77 });
      });
      const committed = f.writes.length; f.progression.update(3); f.event(type);
      assert.equal(f.writes.length, committed, 'successful retry clears pending state');
    } finally { f.failures.clear(); f.progression.dispose(); }
  });
  await test('backup-only failure permits a new primary and does not queue a duplicate retry', async () => {
    const f = await fixture();
    try {
      const oldBackup = f.payloads.get(SAVE_BACKUP_KEY);
      await quietWarning(async warnings => {
        f.failures.add(SAVE_BACKUP_KEY); f.input('sfx', .37); f.event('pagehide');
        assert.equal(f.payloads.get(SAVE_BACKUP_KEY), oldBackup);
        assert.ok(warnings.some(value => value.includes(`critic storage failure: ${SAVE_BACKUP_KEY}`)));
        await f.reload({ sfx: .37 });
      });
      f.failures.clear(); const committed = f.writes.length;
      f.progression.update(3); assert.equal(f.writes.length, committed);
    } finally { f.failures.clear(); f.progression.dispose(); }
  });
  await test('autosave retries failed primary; corrupt primary recovers the previous good preference', async () => {
    const f = await fixture();
    try {
      f.input('music', .31); f.event('pagehide');
      await quietWarning(async warnings => {
        f.input('music', .62); f.failures.add(SAVE_KEY); f.progression.update(1.3);
        assert.ok(warnings.some(value => value.includes(`critic storage failure: ${SAVE_KEY}`)));
        f.failures.clear(); f.progression.update(1.3); await f.reload({ music: .62 });
        f.payloads.set(SAVE_KEY, '{corrupt primary');
        await f.reload({ music: .31 });
        assert.ok(warnings.some(value => value.includes('restored from backup')));
      });
    } finally { f.failures.clear(); f.progression.dispose(); }
  });
  const call = 'app.ctx.progression?.requestSave?.();';
  const immediate = (await mutatedModule('menu', call, 'app.ctx.progression?.save?.();')).createMenuScreen;
  await assert.rejects(() => coalesced(immediate), error => error.code === 'ERR_ASSERTION'
    && error.message.includes('slider burst coalesces without synchronous writes'));
  mutations++;
  for (const kind of ['request', 'lifecycle']) {
    const factories = kind === 'request'
      ? { menuFactory: (await mutatedModule('menu', call, '/* omitted request negative control */')).createMenuScreen }
      : { progressionFactory: (await mutatedModule('progression', 'const flush = () => { if (savePending) save(); };',
        'const flush = () => {};')).createProgression };
    const f = await fixture(factories);
    try {
      f.input('sfx', .37); f.event('pagehide');
      await assert.rejects(() => f.reload({ sfx: .37 }), error => error.code === 'ERR_ASSERTION'
        && error.message.includes('reloaded settings retain latest sfx'));
      mutations++;
    } finally { f.progression.dispose(); }
  }
  for (const [key, url] of Object.entries(urls)) assert.equal(readFileSync(url, 'utf8'), sources[key], `${key} remained unchanged`);
  console.log(`PASS: ${cases} persistence scenarios; ${mutations} negative controls rejected at intended assertions.`);
  console.log(`Sources: menu=${hash(sources.menu)} progression=${hash(sources.progression)}`);
  console.log('CPU component/event doubles only; no browser, DOM, frame-time, or actual lifecycle-delivery acceptance.');
} finally {
  for (const [key, descriptor] of descriptors) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
}
