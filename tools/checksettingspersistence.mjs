#!/usr/bin/env node
/** Exercise actual menu controls with the real progression save/load code.
 * Only component elements, localStorage and page lifecycle events are replaced.
 * No browser/renderer, live user save, layout or audio-output claim is made.
 * Run: node tools/checksettingspersistence.mjs
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createMenuScreen } from '../src/ui/screens/menu.js';

assert.equal(process.argv.length, 2, 'Unknown settings gate arguments');
const original = Object.fromEntries(['localStorage', 'window', 'document']
  .map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const sourceURL = new URL('../src/ui/screens/menu.js', import.meta.url);
const source = await readFile(sourceURL, 'utf8');
const sourceHash = createHash('sha256').update(source).digest('hex');

function components() {
  const nodes = [], buttons = new Map();
  function h(selector, ...parts) {
    const classes = new Set(selector.split('.').slice(1));
    const listeners = new Map();
    const node = {
      selector, children: [], attrs: {}, textContent: '', value: '',
      style: { setProperty() {} },
      classList: { add: (...values) => values.forEach((v) => classes.add(v)),
        remove: (...values) => values.forEach((v) => classes.delete(v)),
        contains: (v) => classes.has(v),
        toggle(v, enabled) { if (enabled) classes.add(v); else classes.delete(v); } },
      appendChild(child) { this.children.push(child); return child; },
      setAttribute(key, value) { this.attrs[key] = String(value); },
      addEventListener(type, callback) { listeners.set(type, callback); },
      fire(type) { assert.ok(listeners.has(type), `${selector}: actual ${type} handler registered`); listeners.get(type)(); },
    };
    for (const part of parts.flat(Infinity)) {
      if (!part) continue;
      if (typeof part === 'object' && !part.selector) {
        Object.assign(node.attrs, part);
        if ('text' in part) node.textContent = part.text;
        if ('value' in part) node.value = part.value;
      } else node.children.push(part);
    }
    nodes.push(node); return node;
  }
  return { nodes, buttons, h,
    append: (node, children) => children.filter(Boolean).forEach((child) => node.appendChild(child)),
    tap: (node, callback) => node.addEventListener('tap', callback),
    Button(options) { const node = h('button', { text: options.label }); node.addEventListener('tap', options.onTap); buttons.set(options.label, node); return node; },
    Ring: () => ({ el: h('span.ring'), setValue() {} }),
    NumberRoll: () => ({ to() {}, step() {}, setInstant() {} }),
    Wordmark: () => h('span.wordmark'), SpecRow: () => h('div.specrow'),
  };
}

async function fixture(factory = createMenuScreen) {
  const values = new Map();
  const store = { writes: 0, primaryWrites: 0, fail: false,
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) {
      if (this.fail) throw new Error('intentional settings storage failure');
      this.writes++; if (key === SAVE_KEY) this.primaryWrites++;
      values.set(key, String(value));
    }, removeItem: (key) => values.delete(key) };
  const lifecycle = new EventTarget();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: lifecycle });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { visibilityState: 'visible' } });
  const state = createGameState(), bus = createBus(), C = components();
  const progression = createProgression({ state, bus, rand: makeRandom(44) });
  await progression.init();
  assert.equal(progression.save(), true, 'initial career has a clean saved checkpoint');
  const events = [], haptics = [], toasts = [];
  bus.on(EVENTS.QUALITY_CHANGE, (event) => events.push(event));
  const app = { C, state, bus, ctx: { progression }, fmtMoney: String,
    haptic: (value) => haptics.push(value), toast: (...args) => toasts.push(args) };
  const menu = factory(app);
  const beforeOpen = store.writes;
  app.sheet = (sheet) => sheet;
  C.buttons.get('Settings').fire('tap');
  assert.equal(store.writes, beforeOpen, 'opening settings does not save');
  function activate(key, value) {
    if (key === 'quality') {
      const button = C.nodes.find((node) => node.selector.startsWith('button.tabs__b') && node.textContent.toLowerCase() === value);
      assert.ok(button, `actual quality ${value} button exists`); button.fire('tap');
    } else {
      const labels = { haptics: 'Haptics', reducedMotion: 'Reduced motion', sfx: 'Effects', music: 'Music' };
      const node = C.nodes.find((candidate) => candidate.attrs['aria-label'] === labels[key]);
      assert.ok(node, `actual ${key} control exists`);
      if (node.attrs.type === 'range') { node.value = String(value * 100); node.fire('input'); }
      else node.fire('tap');
    }
    assert.equal(state.settings[key], value, `${key} updates the live state immediately`);
  }
  async function reloaded(key, expected) {
    const freshState = createGameState();
    const freshProgression = createProgression({ state: freshState, bus: createBus(), rand: makeRandom(45) });
    try {
      await freshProgression.init();
      assert.equal(freshState.settings[key], expected, `setting ${key} survives reload`);
    } finally { freshProgression.dispose(); }
  }
  function idle() {
    const before = store.writes;
    for (let i = 0; i < 300; i++) { menu.update(1 / 60); progression.update(1 / 60); }
    assert.equal(store.writes, before, '300 quiet menu/progression frames do not save');
  }
  return { state, store, progression, lifecycle, activate, reloaded, idle, events, haptics, toasts };
}

let changes = 0, negativeControls = 0;
try {
  for (const [key, choices] of [
    ['quality', ['low', 'medium', 'high', 'auto']], ['haptics', [false, true]],
    ['reducedMotion', [true, false]], ['sfx', [0, 0.37, 1]], ['music', [0, 0.61, 1]],
  ]) {
    const f = await fixture();
    try {
      f.idle();
      for (const value of choices) {
        const writes = f.store.primaryWrites;
        f.activate(key, value);
        assert.equal(f.store.primaryWrites, writes, `${key}: changed input queues without synchronous storage writes`);
        // Real navigation emits pagehide. No frame or disposal is needed to
        // flush the pending setting before the next page loads it.
        f.lifecycle.dispatchEvent(new Event('pagehide'));
        assert.equal(f.store.primaryWrites, writes + 1, `${key}: pagehide flushes one save`);
        await f.reloaded(key, value);
        const beforeHide = f.store.writes;
        f.lifecycle.dispatchEvent(new Event('pagehide'));
        assert.equal(f.store.writes, beforeHide, 'clean pagehide does not duplicate the save');
        await f.reloaded(key, value);
        f.idle(); changes++;
      }
      if (key === 'quality') {
        assert.deepEqual(f.events.map((event) => event.tier), choices, 'quality events remain intact');
        assert.equal(f.toasts.length, choices.length, 'quality feedback remains intact');
      }
      if (key === 'haptics') assert.deepEqual(f.haptics, ['medium'], 'only enabling haptics plays feedback');
      if (['sfx', 'music', 'quality'].includes(key)) {
        const before = f.store.writes;
        f.activate(key, choices.at(-1));
        assert.equal(f.store.writes, before, 'repeated unchanged value does not save');
      }
    } finally { f.progression.dispose(); }
  }

  // A burst updates both mixer values immediately without writing the full
  // career/backup on every input. Existing progression owns the quiet delay.
  {
    const f = await fixture();
    try {
      const writes = f.store.writes, primaryWrites = f.store.primaryWrites;
      for (let i = 0; i < 100; i++) { f.activate('sfx', i / 100); f.activate('music', i / 100); }
      assert.equal(f.store.writes, writes, '200 slider inputs perform no synchronous storage writes');
      f.progression.update(1.19);
      assert.equal(f.store.writes, writes, 'burst remains pending before the existing 1.2-second delay');
      f.progression.update(0.02);
      assert.equal(f.store.primaryWrites, primaryWrites + 1, 'slider burst coalesces into one primary save');
      assert.equal(f.store.writes, writes + 2, 'slider burst writes exactly one backup and one primary');
      await f.reloaded('sfx', 0.99); await f.reloaded('music', 0.99); f.idle();
    } finally { f.progression.dispose(); }
  }

  // A failed deferred write remains pending in actual progression and can
  // retry through either lifecycle handler, including without a frame.
  for (const event of ['pagehide', 'visibilitychange']) {
    const f = await fixture();
    const warnings = [], warn = console.warn;
    try {
      console.warn = (...args) => warnings.push(args.join(' '));
      f.store.fail = true; f.activate('music', 0.23);
      document.visibilityState = 'hidden'; f.lifecycle.dispatchEvent(new Event(event));
      assert.ok(warnings.some((warning) => warning.includes('intentional settings storage failure')));
      f.store.fail = false; f.lifecycle.dispatchEvent(new Event(event));
      await f.reloaded('music', 0.23); f.idle();
    } finally { f.store.fail = false; console.warn = warn; f.progression.dispose(); }
  }

  // Remove only the persistence call from the actual menu source. Each real
  // control must then fail the same reload assertion; a module/import crash
  // or an assertion about callback wiring is not accepted as this control.
  const call = 'app.ctx.progression?.requestSave?.();';
  assert.equal(source.split(call).length - 1, 1, 'mutation identifies one production persistence call');
  const mutated = source.replace(call, '/* intentional negative control: no save */')
    .replace(/from '(\.\.?\/[^']+)'/g, (_, specifier) => `from '${new URL(specifier, sourceURL).href}'`);
  const { createMenuScreen: withoutSave } = await import('data:text/javascript;base64,' + Buffer.from(mutated).toString('base64'));
  for (const [key, value] of [['quality', 'low'], ['haptics', false], ['reducedMotion', true], ['sfx', 0.37], ['music', 0.61]]) {
    const f = await fixture(withoutSave);
    try {
      f.activate(key, value); f.idle(); f.lifecycle.dispatchEvent(new Event('pagehide'));
      await assert.rejects(() => f.reloaded(key, value), (error) => error.code === 'ERR_ASSERTION'
        && error.message.includes(`setting ${key} survives reload`), `${key}: missing save must be detected`);
      negativeControls++;
    } finally { f.progression.dispose(); }
  }
  assert.equal(createHash('sha256').update(await readFile(sourceURL)).digest('hex'), sourceHash, 'menu source remained unchanged');
  console.log(`PASS: ${changes} setting changes survive pagehide/reload without a frame; 200 slider inputs coalesce into one save; failed-write retry via 2 lifecycle events; ${negativeControls} omitted-save controls rejected`);
  console.log(`PASS: quiet frames and unchanged inputs do not write; quality/haptic effects retained; menu.js sha256=${sourceHash}`);
} finally {
  for (const [key, descriptor] of Object.entries(original)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
}
