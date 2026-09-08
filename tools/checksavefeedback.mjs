/** Actual career persistence + feedback boundary; controlled storage, no browser/GPU. */
import assert from 'node:assert/strict';
import { createBus, createGameState, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY } from '../src/game/progression.js';
import { emergencyContract } from '../src/game/economy.js';
import { createSaveNotice, subscribeSaveFeedback, saveNoticeModel } from '../src/ui/save-status.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWarn = console.warn;
const originalError = console.error;
let warnings = 0;
console.warn = () => { warnings++; };
console.error = () => { warnings++; };
let passed = 0;
function storage() {
  const values = new Map();
  return {
    values, writes: [], fail: null,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      this.writes.push(key);
      if (this.fail?.(key)) throw new DOMException('Fixture quota exceeded', 'QuotaExceededError');
      values.set(key, String(value));
    },
    removeItem(key) { values.delete(key); },
  };
}
async function career(store) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: store });
  const state = createGameState();
  const bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(149), SCENES });
  await progression.init();
  return { state, bus, progression };
}
// Small DOM boundary for the actual notice implementation, not a substitute
// for its still-required rendered short-viewport acceptance.
class Element extends EventTarget {
  constructor(selector, props, children) {
    super(); this.selector = selector; this.children = children; this.hidden = false;
    this.textContent = props?.text || '';
  }
}
const C = {
  h(selector, props, ...children) {
    if (props instanceof Element) { children.unshift(props); props = null; }
    return new Element(selector, props, children);
  },
};
async function test(name, fn) { await fn(); passed++; console.log(`PASS ${name}`); }

try {
  await test('failed primary stays dirty, renders once across retries, and persists on manual retry', async () => {
    const store = storage(); const { progression, state } = await career(store);
    progression.save(); const previous = store.getItem(SAVE_KEY);
    const events = []; const toasts = [];
    const unsubscribe = progression.subscribeSaveStatus((status) => events.push(status));
    const stopToast = subscribeSaveFeedback(progression, (...args) => toasts.push(args));
    const visibility = [];
    const notice = createSaveNotice({ C, ctx: { progression } }, (visible) => visibility.push(visible));
    assert.equal(notice.el.hidden, true);
    progression.addMoney(321, 'earned progression');
    store.fail = key => key === SAVE_KEY;
    progression.update(2);
    assert.equal(store.getItem(SAVE_KEY), previous);
    assert.equal(progression.getSaveStatus().pending, true);
    assert.equal(progression.getSaveStatus().error, 'save-failed');
    assert.equal(notice.el.hidden, false);
    const noticeUpdates = visibility.length; const transitionCount = events.length;
    const snapshot = progression.getSaveStatus();
    for (let i = 0; i < 20; i++) progression.update(2);
    assert.equal(progression.getSaveStatus(), snapshot, 'repeated failure reuses immutable status');
    assert.equal(events.length, transitionCount);
    assert.equal(visibility.length, noticeUpdates);
    assert.equal(toasts.length, 1, 'one notice across all failed retries');
    assert.throws(() => { snapshot.error = null; }, TypeError);
    store.fail = null;
    const expectedMoney = state.player.money;
    notice.el.children[1].dispatchEvent(new Event('click'));
    assert.equal(progression.getSaveStatus().error, null);
    assert.equal(progression.getSaveStatus().pending, false);
    assert.equal(notice.el.hidden, true);
    assert.equal(toasts.length, 2);
    assert.equal(toasts[1][0], 'Career saved.');
    const restored = await career(store);
    assert.equal(restored.state.player.money, expectedMoney);
    unsubscribe(); stopToast(); notice.destroy();
    const afterDestroy = visibility.length;
    progression.addMoney(1); store.fail = () => true; progression.save();
    assert.equal(visibility.length, afterDestroy, 'destroy unsubscribes notices');
  });

  await test('failed backup does not claim primary failure and clears only after a successful backup retry', async () => {
    const store = storage(); const { progression, state } = await career(store);
    progression.save(); progression.addMoney(25);
    store.fail = key => key === SAVE_BACKUP_KEY;
    assert.equal(progression.save(), true);
    assert.equal(JSON.parse(store.getItem(SAVE_KEY)).player.money, state.player.money);
    const status = progression.getSaveStatus();
    assert.equal(status.error, null); assert.equal(status.pending, false); assert.equal(status.backupFailed, true);
    assert.equal(saveNoticeModel(status).title, 'Career saved; backup unavailable');
    store.fail = null; progression.save();
    assert.equal(progression.getSaveStatus().backupFailed, false);
    assert.equal(saveNoticeModel(progression.getSaveStatus()), null);
  });

  await test('backup recovery is disclosed after startup, survives autosave, and keeps the good backup', async () => {
    const store = storage(); const first = await career(store);
    first.progression.addMoney(78); first.progression.save();
    const good = store.getItem(SAVE_KEY);
    store.setItem(SAVE_BACKUP_KEY, good); store.setItem(SAVE_KEY, '{ corrupt primary');
    const { progression, state } = await career(store);
    assert.equal(state.player.money, first.state.player.money);
    assert.equal(progression.getSaveStatus().recovered, true);
    assert.equal(progression.getSaveStatus().pending, true);
    const toasts = []; const off = subscribeSaveFeedback(progression, (...args) => toasts.push(args));
    assert.match(toasts[0][0], /restored from backup/i, 'late shell subscriber sees recovery');
    store.fail = key => key === SAVE_KEY; progression.update(2);
    assert.match(saveNoticeModel(progression.getSaveStatus()).message, /restored from a backup/i);
    assert.equal(store.getItem(SAVE_BACKUP_KEY), good);
    store.fail = null; progression.update(2);
    assert.equal(store.getItem(SAVE_BACKUP_KEY), good);
    assert.equal(progression.getSaveStatus().recovered, true, 'saving must not erase unacknowledged disclosure');
    const notice = createSaveNotice({ C, ctx: { progression } });
    assert.equal(notice.el.children[1].textContent, 'Understood');
    notice.el.children[1].dispatchEvent(new Event('click'));
    assert.equal(progression.getSaveStatus().recovered, false);
    assert.equal(notice.el.hidden, true);
    notice.destroy(); off();
  });

  await test('storage getter denial is visible and a later successful write clears it', async () => {
    const store = storage(); const { progression } = await career(store);
    progression.addMoney(18);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new DOMException('Denied', 'SecurityError'); } });
    assert.equal(progression.save(), false);
    assert.equal(progression.getSaveStatus().error, 'storage-unavailable');
    assert.equal(progression.getSaveStatus().pending, true);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: store });
    progression.update(2);
    assert.equal(progression.getSaveStatus().error, null);
    assert.equal(progression.getSaveStatus().pending, false);
  });

  await test('serialization failure preserves stored career, dirty state and truthful retry notice', async () => {
    const store = storage(); const { progression, state } = await career(store);
    progression.save(); const good = store.getItem(SAVE_KEY);
    const cycle = {}; cycle.self = cycle; state.settings.badFixture = cycle;
    assert.equal(progression.save(), false);
    assert.equal(store.getItem(SAVE_KEY), good);
    assert.equal(progression.getSaveStatus().error, 'serialise-failed');
    assert.equal(progression.getSaveStatus().pending, true);
    delete state.settings.badFixture; assert.equal(progression.save(), true);
    assert.equal(progression.getSaveStatus().error, null);
  });

  await test('restore observer write failure is not erased by successful load', async () => {
    const store = storage(); const first = await career(store);
    assert.equal(first.progression.acceptContract(emergencyContract()).ok, true);
    first.progression.save(); store.fail = key => key === SAVE_KEY;
    const state = createGameState(); const bus = createBus();
    const progression = createProgression({ state, bus, rand: makeRandom(149), SCENES });
    let observed = false;
    bus.on(EVENTS.CONTRACT_ACCEPT, payload => {
      if (!payload.restored) return;
      observed = true; assert.equal(progression.save(), false);
    });
    await progression.init(); assert.equal(observed, true);
    assert.equal(progression.getSaveStatus().error, 'save-failed');
    assert.equal(progression.getSaveStatus().pending, true);
    store.fail = null; progression.update(2);
    assert.equal(progression.getSaveStatus().error, null);
  });

  await test('an explicit new career clears recovery provenance without claiming the pending save succeeded', async () => {
    const store = storage(); const first = await career(store);
    first.progression.save(); store.setItem(SAVE_BACKUP_KEY, store.getItem(SAVE_KEY));
    store.setItem(SAVE_KEY, '{ corrupt primary');
    const { progression } = await career(store);
    assert.equal(progression.getSaveStatus().recovered, true);
    progression.reset();
    assert.equal(progression.getSaveStatus().recovered, false);
    assert.equal(progression.getSaveStatus().pending, true);
    store.fail = () => true; progression.update(2);
    assert.equal(progression.getSaveStatus().error, 'save-failed');
  });

  console.log(`Save feedback: ${passed} realistic cases passed (${warnings} expected injected-failure diagnostics).`);
} finally {
  console.warn = originalWarn; console.error = originalError;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
