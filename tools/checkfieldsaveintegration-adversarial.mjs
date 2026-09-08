/** Independent save-protection/feedback integration attacks. Actual progression
 * and notice modules, adversarial in-memory Storage and minimal event DOM.
 * No browser, layout, host storage, or private simulator mutation. */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY, SAVE_VERSION } from '../src/game/progression.js';
import { createSaveNotice, saveNoticeModel, subscribeSaveFeedback } from '../src/ui/save-status.js';

const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const oldWarn = console.warn, oldError = console.error;
let diagnostics = 0;
console.warn = console.error = () => diagnostics++;
const active = new Set(), cases = [];
const install = (store) => Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
class Storage {
  data = new Map(); writes = []; removals = []; failedReads = new Set(); failedWrites = new Set(); failedRemovals = new Set();
  getItem(key) { if (this.failedReads.has(key)) throw new Error('independent read denial'); return this.data.get(key) ?? null; }
  setItem(key, value) { if (this.failedWrites.has(key)) throw new Error('independent write denial'); this.writes.push(key); this.data.set(key, String(value)); }
  removeItem(key) { this.removals.push(key); if (this.failedRemovals.has(key)) throw new Error('independent removal denial'); this.data.delete(key); }
}
function raw(store, key, value) { store.data.set(key, typeof value === 'string' ? value : JSON.stringify(value)); }
async function open(store, beforeInit) {
  install(store);
  const state = createGameState(), bus = createBus();
  const p = createProgression({ state, bus, rand: makeRandom(48117) });
  const f = { store, state, p }; active.add(f);
  beforeInit?.(f); await p.init(); return f;
}
function close(f) { install(f.store); f.p.dispose(); active.delete(f); }
function test(name, fn) { cases.push({ name, fn }); }
function protectedModel(p, reason) {
  assert.equal(p.getSaveBlockStatus()?.reason, reason);
  const model = saveNoticeModel(p.getSaveStatus());
  assert.ok(model, 'a protected save must have visible feedback');
  assert.notEqual(model.retry, true, 'a protected save must not expose the ordinary write retry');
  assert.match(`${model.title} ${model.message}`, /not saved|saving.*(?:paused|blocked)|cannot.*save|can.t.*save|unsaved/i);
  assert.doesNotMatch(`${model.title} ${model.message}`, /career saved|your latest progress is saved|career has been saved/i);
  return model;
}
function unchanged(store, before, writes) {
  assert.deepEqual(store.data, before, 'all existing save bytes must remain in their original slots');
  assert.equal(store.writes.length, writes, 'a protected path must attempt no replacement writes');
}
function observe(p) {
  const seen = [], toasts = [];
  const offStatus = p.subscribeSaveStatus(s => seen.push(s));
  const offToast = subscribeSaveFeedback(p, (...args) => toasts.push(args));
  return { seen, toasts, close() { offStatus(); offToast(); } };
}
function noFalseSuccess(o) {
  assert.equal(o.toasts.some(([text, tone]) => tone === 'success' || /career saved|your latest progress is saved/i.test(text)), false, JSON.stringify(o.toasts));
}

class Element extends EventTarget {
  constructor(props = {}) { super(); this.children = []; this.textContent = props.text ?? ''; this.hidden = false; }
  appendChild(child) { this.children.push(child); return child; }
}
const C = { h(selector, ...args) {
  const props = args[0] && !(args[0] instanceof Element) && typeof args[0] === 'object' && !Array.isArray(args[0]) ? args.shift() : {};
  const el = new Element(props); args.flat(Infinity).filter(v => v != null).forEach(v => el.appendChild(v)); return el;
} };

let seed;
try {
  const f = await open(new Storage()); f.p.addMoney(911); assert.equal(f.p.save(), true);
  seed = f.p.serialise(); close(f);
  const future = () => ({ ...structuredClone(seed), version: SAVE_VERSION + 8, futureOnly: { opaque: 'must survive' } });

  test('newer primary plus usable backup loads the backup but never claims or performs a save', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, future()); raw(s, SAVE_BACKUP_KEY, seed);
    const before = new Map(s.data); let o;
    const f = await open(s, ({ p }) => o = observe(p));
    assert.equal(f.state.player.money, seed.player.money);
    assert.equal(f.p.getSaveStatus().recovered, true);
    protectedModel(f.p, 'newer-save-version');
    assert.equal(f.p.getSaveBlockStatus().loadedFrom, SAVE_BACKUP_KEY);
    f.p.addMoney(77); f.p.requestSave(); f.p.update(2); assert.equal(f.p.save(), false);
    f.p.acknowledgeSaveRecovery(); protectedModel(f.p, 'newer-save-version');
    noFalseSuccess(o); close(f); unchanged(s, before, 0); o.close();
  });

  test('a newer recovery slot is protected even when the main career loads correctly', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, seed); raw(s, SAVE_BACKUP_KEY, future()); const before = new Map(s.data);
    const f = await open(s); const o = observe(f.p);
    assert.equal(f.state.player.money, seed.player.money); protectedModel(f.p, 'newer-save-version');
    f.p.addMoney(41); for (let i = 0; i < 20; i++) f.p.update(2);
    const count = o.seen.length; for (let i = 0; i < 20; i++) f.p.save();
    assert.equal(o.seen.length, count, 'identical protection is deduplicated across repeated checks');
    noFalseSuccess(o); unchanged(s, before, 0); o.close();
  });

  test('all-unreadable careers stay in place and fresh defaults are identified as unsaved', async () => {
    for (const broken of ['{ torn JSON', { ...structuredClone(seed), player: {} }]) {
      const s = new Storage(); raw(s, SAVE_KEY, broken); raw(s, SAVE_BACKUP_KEY, '{ also torn'); const before = new Map(s.data);
      const f = await open(s); const o = observe(f.p); protectedModel(f.p, 'unreadable-save');
      f.p.addMoney(19); f.p.update(2); assert.equal(f.p.save(), false);
      noFalseSuccess(o); close(f); unchanged(s, before, 0); o.close();
    }
  });

  test('a temporarily unreadable primary cannot be overwritten by a loaded backup when access returns', async () => {
    const newerMoney = structuredClone(seed); newerMoney.player.money += 6543;
    const s = new Storage(); raw(s, SAVE_KEY, newerMoney); raw(s, SAVE_BACKUP_KEY, seed); s.failedReads.add(SAVE_KEY);
    const before = new Map(s.data); const f = await open(s); const o = observe(f.p);
    assert.equal(f.state.player.money, seed.player.money); protectedModel(f.p, 'storage-read-failed');
    s.failedReads.clear(); f.p.addMoney(5); for (let i = 0; i < 5; i++) f.p.update(2);
    assert.equal(f.p.save(), false); unchanged(s, before, 0); noFalseSuccess(o);
    assert.equal(f.p.load(), true, 'explicit reload may select the now-readable stored career');
    assert.equal(f.state.player.money, newerMoney.player.money); assert.equal(f.p.getSaveBlockStatus(), null);
    unchanged(s, before, 0); o.close();
  });

  test('startup read failure with no usable backup cannot turn fresh defaults into a replacement career', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, seed); s.failedReads.add(SAVE_KEY); const before = new Map(s.data);
    const f = await open(s); protectedModel(f.p, 'storage-read-failed');
    f.p.addMoney(2); s.failedReads.clear(); assert.equal(f.p.save(), false);
    f.p.update(3); close(f); unchanged(s, before, 0);
  });

  test('startup localStorage getter failure remains protected after the object becomes available', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, seed); const before = new Map(s.data);
    const f = await open(s, () => Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('independent Storage getter denial'); } }));
    const o = observe(f.p); f.p.addMoney(2); install(s);
    assert.equal(f.p.save(), false, 'fresh defaults were never loaded from the newly accessible store');
    f.p.update(3); noFalseSuccess(o); unchanged(s, before, 0);
    assert.equal(f.p.load(), true); assert.equal(f.state.player.money, seed.player.money); unchanged(s, before, 0); o.close();
  });

  test('a newer save discovered by delayed autosave blocks writes before backup rotation', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, seed); const f = await open(s); const o = observe(f.p);
    f.p.addMoney(21); raw(s, SAVE_BACKUP_KEY, future()); const before = new Map(s.data);
    f.p.update(2); protectedModel(f.p, 'newer-save-version'); unchanged(s, before, 0); noFalseSuccess(o); o.close();
  });

  test('failed New Career deletion does not release protection or claim current progress is saved', async () => {
    for (const blockedKey of [SAVE_KEY, SAVE_BACKUP_KEY]) {
      const s = new Storage(); raw(s, blockedKey, future()); s.failedRemovals.add(blockedKey);
      const f = await open(s); const before = s.data.get(blockedKey); const o = observe(f.p);
      f.p.reset(); f.p.update(2); assert.equal(f.p.save(), false);
      assert.equal(s.data.get(blockedKey), before); assert.equal(s.writes.length, 0);
      assert.ok(f.p.getSaveBlockStatus()); noFalseSuccess(o); o.close();
    }
  });

  test('successful explicit New Career clears both protected slots and only its completed write signals success', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, future()); raw(s, SAVE_BACKUP_KEY, future()); const f = await open(s);
    const o = observe(f.p); f.p.reset();
    assert.equal(s.data.size, 0); assert.equal(f.p.getSaveBlockStatus(), null);
    assert.equal(f.p.getSaveStatus().pending, true); noFalseSuccess(o);
    f.p.update(2); assert.equal(f.p.getSaveStatus().pending, false);
    assert.equal(JSON.parse(s.data.get(SAVE_KEY)).version, SAVE_VERSION); o.close();
  });

  test('returned protected status and nested metadata cannot be mutated to release or disguise protection', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, future()); const f = await open(s); const b = f.p.getSaveBlockStatus();
    for (const value of [f.p.getSaveStatus(), b, b.keys, b.versions]) assert.equal(Object.isFrozen(value), true);
    assert.throws(() => b.keys.pop(), TypeError); assert.throws(() => { b.reason = null; }, TypeError);
    const before = new Map(s.data); assert.equal(f.p.save(), false); unchanged(s, before, 0);
  });

  test('recoverable corrupt primary retains honest backup feedback and keeps the good recovery copy', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, '{ broken'); raw(s, SAVE_BACKUP_KEY, seed); const backup = s.data.get(SAVE_BACKUP_KEY);
    const f = await open(s); assert.equal(f.p.getSaveBlockStatus(), null);
    assert.equal(f.p.getSaveStatus().recovered, true); assert.equal(f.p.getSaveStatus().pending, true);
    s.failedWrites.add(SAVE_KEY); const o = observe(f.p); assert.equal(f.p.save(), false);
    assert.equal(f.p.getSaveStatus().error, 'save-failed'); noFalseSuccess(o); assert.equal(s.data.get(SAVE_BACKUP_KEY), backup);
    s.failedWrites.clear(); assert.equal(f.p.save(), true); assert.equal(s.data.get(SAVE_BACKUP_KEY), backup);
    assert.equal(JSON.parse(s.data.get(SAVE_KEY)).player.money, seed.player.money); o.close();
  });

  test('ordinary requestSave retains the 1.2 second debounce and one primary/backup pair', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, seed); const f = await open(s);
    for (let i = 0; i < 200; i++) { f.state.settings.masterVolume = i / 200; f.p.requestSave(); }
    assert.equal(s.writes.length, 0); f.p.update(1); assert.equal(s.writes.length, 0);
    f.p.update(0.21); assert.deepEqual(s.writes, [SAVE_BACKUP_KEY, SAVE_KEY]);
    assert.equal(JSON.parse(s.data.get(SAVE_KEY)).settings.masterVolume, 199 / 200);
  });

  test('checking restored access does not discard session earnings or overwrite a newly readable career', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, seed); s.failedReads.add(SAVE_KEY);
    const before = new Map(s.data); const f = await open(s); f.p.addMoney(63); const sessionMoney = f.state.player.money;
    const o = observe(f.p); const notice = createSaveNotice({ C, ctx: { progression: f.p } });
    const action = notice.el.children[1]; assert.equal(action.textContent, 'Check saved data');
    action.dispatchEvent(new Event('click')); unchanged(s, before, 0);
    s.failedReads.clear(); action.dispatchEvent(new Event('click'));
    protectedModel(f.p, 'saved-career-available');
    assert.equal(action.textContent, 'Load saved career'); assert.equal(f.state.player.money, sessionMoney);
    assert.match(saveNoticeModel(f.p.getSaveStatus()).message, /unsaved changes.*lost/i);
    f.p.update(2); assert.equal(f.p.save(), false); unchanged(s, before, 0); noFalseSuccess(o);
    notice.destroy(); o.close();
  });

  test('reload action requires explicit confirmation, deduplicates double activation and never invokes save', async () => {
    const oldLocation = Object.getOwnPropertyDescriptor(globalThis, 'location'); let reloads = 0;
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { reload() { reloads++; } } });
    try {
      const s = new Storage(); raw(s, SAVE_KEY, seed); s.failedReads.add(SAVE_KEY); const f = await open(s);
      s.failedReads.clear(); f.p.checkSaveProtection(); const before = new Map(s.data);
      let resolveConfirm, prompts = 0;
      const notice = createSaveNotice({ C, ctx: { progression: f.p }, confirm(options) {
        prompts++; assert.match(options.message, /unsaved changes.*lost/i);
        return new Promise(resolve => resolveConfirm = resolve);
      } });
      const action = notice.el.children[1]; action.dispatchEvent(new Event('click')); action.dispatchEvent(new Event('click'));
      assert.equal(prompts, 1); assert.equal(reloads, 0); unchanged(s, before, 0);
      resolveConfirm(false); await Promise.resolve(); await Promise.resolve(); assert.equal(reloads, 0);
      action.dispatchEvent(new Event('click')); assert.equal(prompts, 2); resolveConfirm(true);
      await Promise.resolve(); await Promise.resolve(); assert.equal(reloads, 1); unchanged(s, before, 0); notice.destroy();
    } finally { if (oldLocation) Object.defineProperty(globalThis, 'location', oldLocation); else delete globalThis.location; }
  });

  test('destroying a notice invalidates a deferred reload confirmation', async () => {
    const oldLocation = Object.getOwnPropertyDescriptor(globalThis, 'location'); let reloads = 0;
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { reload() { reloads++; } } });
    try {
      const s = new Storage(); raw(s, SAVE_KEY, seed); s.failedReads.add(SAVE_KEY); const f = await open(s);
      s.failedReads.clear(); f.p.checkSaveProtection(); let resolveConfirm;
      const notice = createSaveNotice({ C, ctx: { progression: f.p }, confirm() { return new Promise(resolve => resolveConfirm = resolve); } });
      notice.el.children[1].dispatchEvent(new Event('click')); notice.destroy(); resolveConfirm(true);
      await Promise.resolve(); await Promise.resolve(); assert.equal(reloads, 0, 'a disposed screen must not reload a later session');
    } finally { if (oldLocation) Object.defineProperty(globalThis, 'location', oldLocation); else delete globalThis.location; }
  });

  test('recovering access to empty storage cannot announce Career saved before any actual write', async () => {
    const s = new Storage(); let o;
    const f = await open(s, ({ p }) => {
      o = observe(p);
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('startup getter denial'); } });
    });
    assert.equal(s.data.size, 0); install(s); f.p.checkSaveProtection();
    assert.equal(s.writes.length, 0); noFalseSuccess(o); o.close();
  });

  test('deferred reload confirmation rechecks a newer save arriving after the notice was shown', async () => {
    const oldLocation = Object.getOwnPropertyDescriptor(globalThis, 'location'); let reloads = 0;
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { reload() { reloads++; } } });
    try {
      const s = new Storage(); raw(s, SAVE_KEY, seed); s.failedReads.add(SAVE_KEY); const f = await open(s);
      s.failedReads.clear(); f.p.checkSaveProtection(); let resolveConfirm;
      const notice = createSaveNotice({ C, ctx: { progression: f.p }, confirm() { return new Promise(resolve => resolveConfirm = resolve); } });
      notice.el.children[1].dispatchEvent(new Event('click')); raw(s, SAVE_KEY, future()); const before = new Map(s.data);
      resolveConfirm(true); await Promise.resolve(); await Promise.resolve();
      assert.equal(reloads, 0); protectedModel(f.p, 'newer-save-version'); unchanged(s, before, 0); notice.destroy();
    } finally { if (oldLocation) Object.defineProperty(globalThis, 'location', oldLocation); else delete globalThis.location; }
  });

  test('successful explicit load cannot notify observers of a saved fresh career before applying stored data', async () => {
    const s = new Storage(); raw(s, SAVE_KEY, seed); const successMoney = [];
    const f = await open(s, () => Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('startup getter denial'); } }));
    const off = subscribeSaveFeedback(f.p, (text, tone) => { if (tone === 'success') successMoney.push(f.state.player.money); });
    install(s); assert.equal(f.p.load(), true);
    assert.ok(successMoney.every(money => money === seed.player.money), `successful-save observer saw unapplied default money ${successMoney}`);
    assert.equal(s.writes.length, 0); off();
  });

  let failed = 0;
  for (const { name, fn } of cases) {
    try { await fn(); console.log(`PASS ${name}`); }
    catch (e) { failed++; console.error = oldError; console.error(`FAIL ${name}\n${e.stack}`); console.error = () => diagnostics++; }
    finally { for (const f of [...active]) close(f); }
  }
  console.log(`Independent field/save integration: ${cases.length - failed}/${cases.length} groups passed (${diagnostics} expected diagnostics).`);
  console.log('Boundary: real browser rendering and cross-tab atomicity are not claimed.');
  if (failed) process.exitCode = 1;
} finally {
  for (const f of [...active]) close(f);
  if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage); else delete globalThis.localStorage;
  console.warn = oldWarn; console.error = oldError;
}
