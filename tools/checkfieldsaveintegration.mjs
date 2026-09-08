/** Real progression + notice integration; CPU only, no renderer or storage reset. */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY, SAVE_VERSION } from '../src/game/progression.js';
import { createSaveNotice, saveNoticeModel, subscribeSaveFeedback } from '../src/ui/save-status.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalLocation = Object.getOwnPropertyDescriptor(globalThis, 'location');
const originalWarn = console.warn;
console.warn = () => {};
const live = [];
class Store {
  values = new Map(); writes = []; blockedReads = new Set();
  getItem(key) { if (this.blockedReads.has(key)) throw new Error('read denied'); return this.values.get(key) ?? null; }
  setItem(key, value) { this.writes.push(key); this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
async function fresh(store, denied = false) {
  Object.defineProperty(globalThis, 'localStorage', denied
    ? { configurable: true, get() { throw new Error('Storage getter denied'); } }
    : { configurable: true, value: store });
  const state = createGameState(), bus = createBus();
  const p = createProgression({ state, bus, rand: makeRandom(902) });
  await p.init(); live.push({ p, store }); return { p, state, store };
}
class Element extends EventTarget {
  constructor(selector, props, children) { super(); this.children = children; this.hidden = false; this.textContent = props?.text || ''; }
}
const C = { h(selector, props, ...children) {
  if (props instanceof Element) { children.unshift(props); props = null; }
  return new Element(selector, props, children);
} };
let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log(`PASS ${name}`); }
try {
  await test('newer save protection overrides saved/recovered wording and deduplicates automatic retries', async () => {
    const store = new Store(), seed = await fresh(store);
    const current = seed.p.serialise(), future = structuredClone(current);
    future.version = SAVE_VERSION + 1; future.player.money = 987654;
    const raw = JSON.stringify(future), backup = JSON.stringify(current);
    store.values.set(SAVE_KEY, raw); store.values.set(SAVE_BACKUP_KEY, backup);
    const f = await fresh(store), toasts = [];
    const off = subscribeSaveFeedback(f.p, (...args) => toasts.push(args));
    const status = f.p.getSaveStatus();
    assert.equal(status.blocked.reason, 'newer-save-version');
    assert.equal(status.blocked, f.p.getSaveBlockStatus());
    assert.equal(status.recovered, true);
    assert.match(saveNoticeModel(status).message, /backup career is open/);
    assert.match(saveNoticeModel(status).message, /cannot be saved/);
    const n = store.writes.length;
    for (let i = 0; i < 20; i++) f.p.save();
    assert.equal(f.p.getSaveStatus(), status);
    assert.equal(store.writes.length, n);
    assert.equal(toasts.length, 1);
    assert.equal(store.values.get(SAVE_KEY), raw); assert.equal(store.values.get(SAVE_BACKUP_KEY), backup);
    off();
  });

  await test('native check action never writes or replaces current in-memory play', async () => {
    const store = new Store(), f = await fresh(store);
    store.values.set(SAVE_KEY, 'broken sole career');
    f.p.load(); f.p.addMoney(77);
    const notice = createSaveNotice({ C, ctx: { progression: f.p } });
    assert.equal(notice.el.children[1].textContent, 'Check saved data');
    const before = structuredClone(f.p.serialise()), writes = store.writes.length;
    notice.el.children[1].dispatchEvent(new Event('click'));
    assert.equal(store.writes.length, writes);
    assert.deepEqual(f.p.serialise(), before);
    assert.equal(store.values.get(SAVE_KEY), 'broken sole career');
    assert.match(saveNoticeModel(f.p.getSaveStatus()).message, /Existing saved data is being kept/);
    notice.destroy();
  });

  await test('readable-again save remains protected until confirmed reload; cancel and repeated click do not reload', async () => {
    const store = new Store(), seed = await fresh(store);
    const payload = seed.p.serialise(); payload.player.money = 456789;
    const raw = JSON.stringify(payload); store.values.set(SAVE_KEY, raw);
    store.blockedReads.add(SAVE_KEY);
    const f = await fresh(store); f.p.addMoney(51);
    let reloads = 0, confirmations = 0, resolve;
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { reload() { reloads++; } } });
    const notice = createSaveNotice({ C, ctx: { progression: f.p }, confirm(o) {
      confirmations++; assert.match(o.message, /Unsaved changes.*will be lost/);
      return new Promise(r => { resolve = r; });
    } });
    store.blockedReads.clear(); const before = structuredClone(f.p.serialise()), writes = store.writes.length;
    notice.el.children[1].dispatchEvent(new Event('click'));
    assert.equal(f.p.getSaveStatus().blocked.reason, 'saved-career-available');
    assert.equal(notice.el.children[1].textContent, 'Load saved career');
    assert.equal(f.p.save(), false);
    notice.el.children[1].dispatchEvent(new Event('click'));
    notice.el.children[1].dispatchEvent(new Event('click'));
    assert.equal(confirmations, 1); resolve(false); await Promise.resolve();
    assert.equal(reloads, 0);
    notice.el.children[1].dispatchEvent(new Event('click')); resolve(true); await Promise.resolve();
    assert.equal(reloads, 1);
    assert.equal(store.writes.length, writes); assert.equal(store.values.get(SAVE_KEY), raw);
    assert.deepEqual(f.p.serialise(), before);
    notice.destroy();
  });

  await test('startup storage getter denial cannot autosave over a later-readable career', async () => {
    const store = new Store(), seed = await fresh(store);
    const payload = seed.p.serialise(); payload.player.money = 345678;
    const raw = JSON.stringify(payload); store.values.set(SAVE_KEY, raw);
    const f = await fresh(store, true);
    assert.equal(f.p.getSaveStatus().blocked.reason, 'storage-read-failed');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
    const writes = store.writes.length;
    f.p.addMoney(20); f.p.update(2);
    assert.equal(f.p.getSaveStatus().blocked.reason, 'saved-career-available');
    assert.equal(store.writes.length, writes); assert.equal(store.values.get(SAVE_KEY), raw);
    assert.equal(f.p.load(), true);
    assert.equal(f.state.player.money, 345678);
    assert.equal(f.p.getSaveStatus().blocked, null);
    assert.equal(f.p.save(), true);
  });

  await test('explicit new career clears protected notice only after successful removal', async () => {
    for (const fail of [true, false]) {
      const store = new Store(), f = await fresh(store);
      const payload = f.p.serialise(); payload.version = SAVE_VERSION + 1;
      const raw = JSON.stringify(payload); store.values.set(SAVE_KEY, raw); f.p.load();
      if (fail) store.removeItem = () => { throw new Error('Deletion denied'); };
      f.p.reset();
      if (fail) {
        assert.equal(f.p.getSaveStatus().blocked.reason, 'newer-save-version');
        assert.equal(f.p.save(), false); assert.equal(store.values.get(SAVE_KEY), raw);
      } else {
        assert.equal(f.p.getSaveStatus().blocked, null);
        assert.equal(f.p.getSaveStatus().pending, true);
        assert.equal(f.p.save(), true);
        assert.equal(JSON.parse(store.values.get(SAVE_KEY)).version, SAVE_VERSION);
      }
    }
  });
  console.log(`Field/save integration: ${passed} groups passed; rendered layout remains a browser check.`);
} finally {
  for (const { p, store } of live) {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store }); p.dispose();
  }
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete globalThis.localStorage;
  if (originalLocation) Object.defineProperty(globalThis, 'location', originalLocation); else delete globalThis.location;
  console.warn = originalWarn;
}
