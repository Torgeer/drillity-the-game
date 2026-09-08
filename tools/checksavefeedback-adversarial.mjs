/** Independent persistence feedback attacks. Actual progression/notice/menu modules;
 * fake Storage and minimal event-bearing DOM only. No browser or visual claim. */
import assert from 'node:assert/strict';
import { createBus, createGameState, makeRandom, SCENES } from '../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY } from '../src/game/progression.js';
import { createSaveNotice, saveNoticeModel, subscribeSaveFeedback } from '../src/ui/save-status.js';
import { createMenuScreen } from '../src/ui/screens/menu.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWarn = console.warn;
const originalError = console.error;
let diagnostics = 0;
console.warn = console.error = () => { diagnostics++; };
const instances = [];
const failures = [];
let passed = 0;
const install = store => Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: store });
function makeStorage() {
  const data = new Map();
  return {
    data, writes: [], denyRead: false, denyPrimary: false, denyBackup: false,
    getItem(key) { if (this.denyRead) throw new Error('Injected read denial'); return data.get(key) ?? null; },
    setItem(key, value) {
      if ((key === SAVE_KEY && this.denyPrimary) || (key === SAVE_BACKUP_KEY && this.denyBackup)) throw new Error('Injected write denial');
      this.writes.push(key); data.set(key, String(value));
    },
    removeItem(key) { data.delete(key); },
  };
}
async function createCareer(store) {
  install(store);
  const state = createGameState();
  const progression = createProgression({ state, bus: createBus(), rand: makeRandom(417), SCENES });
  instances.push(progression);
  await progression.init();
  return { state, progression };
}
async function seeded() {
  const store = makeStorage();
  const ctx = await createCareer(store);
  ctx.progression.addMoney(73); assert.equal(ctx.progression.save(), true);
  ctx.progression.addMoney(121); assert.equal(ctx.progression.save(), true);
  return { store, ...ctx };
}
async function test(name, fn) {
  try { await fn(); passed++; console.log(`PASS ${name}`); }
  catch (error) { failures.push({ name, error }); console.log(`FAIL ${name}: ${error.message}`); }
}
const falseSavedClaim = (text) => /^(?:career saved|your latest progress is saved)/i.test(text);

class Element extends EventTarget {
  constructor(selector, props = {}) {
    super(); this.selector = selector; this.children = []; this.hidden = false;
    this.textContent = props.text ?? ''; this.value = props.value;
    this.attributes = new Map(Object.entries(props)); this.style = { setProperty() {} };
    const classes = new Set(selector.split('.').slice(1));
    this.classList = {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
      toggle(name, force = !classes.has(name)) { if (force) classes.add(name); else classes.delete(name); return force; },
    };
  }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attributes.set(name, value); }
}
const C = {
  buttons: [],
  h(selector, ...args) {
    const props = args[0] && !(args[0] instanceof Element) && typeof args[0] === 'object' && !Array.isArray(args[0]) ? args.shift() : {};
    const el = new Element(selector, props); args.flat(Infinity).filter(value => value != null).forEach(child => el.appendChild(child)); return el;
  },
  append(el, children) { children.filter(Boolean).forEach(child => el.appendChild(child)); },
  tap(el, fn) { el.addEventListener('click', fn); },
  Button(options) { const el = this.h('button', { text: options.label }); this.tap(el, options.onTap); this.buttons.push(el); return el; },
  Ring() { return { el: this.h('div.ring'), setValue() {} }; },
  NumberRoll() { return { to() {}, step() {}, setInstant() {} }; },
  Wordmark() { return this.h('div.wordmark'); },
  SpecRow() { return this.h('div.specrow'); },
};
function noticeAction(notice) { return notice.el.children[1]; }
function menuHarness() {
  const subscribers = new Set();
  let status = { pending: true, error: 'save-failed', backupFailed: false, recovered: false };
  const progression = {
    subscribeSaveStatus(listener) { subscribers.add(listener); listener(status); return () => subscribers.delete(listener); },
    getSaveStatus() { return status; },
    save() {}, acknowledgeSaveRecovery() {},
  };
  const sheets = [];
  const app = { C, ctx: { progression }, state: createGameState(), fmtMoney: String,
    sheet(options) { sheets.push(options); return options; }, bus: createBus(), toast() {}, haptic() {}, nav() {} };
  C.buttons.length = 0;
  const menu = createMenuScreen(app);
  const settings = C.buttons.find(button => button.textContent === 'Settings');
  return { menu, settings, subscribers, sheets, setStatus(next) { status = next; for (const listener of subscribers) listener(status); } };
}

try {
  await test('failed primary cannot overwrite the stored primary or corrupt its good backup', async () => {
    const { store, state, progression } = await seeded();
    const before = store.data.get(SAVE_KEY);
    progression.addMoney(654); store.denyPrimary = true;
    const seen = []; const off = progression.subscribeSaveStatus(status => seen.push(status));
    assert.equal(progression.save(), false);
    assert.equal(store.data.get(SAVE_KEY), before);
    assert.equal(store.data.get(SAVE_BACKUP_KEY), before);
    const count = seen.length;
    for (let attempt = 0; attempt < 12; attempt++) progression.update(2);
    assert.equal(seen.length, count, 'unchanged failures should not republish status');
    assert.equal(progression.getSaveStatus().pending, true);
    store.denyPrimary = false;
    assert.equal(progression.save(), true);
    assert.equal((await createCareer(store)).state.player.money, state.player.money);
    off();
  });

  await test('new backup failure during an already-failed primary retry never announces career saved', async () => {
    const { store, progression } = await seeded();
    const toasts = []; const off = subscribeSaveFeedback(progression, text => toasts.push(text));
    progression.addMoney(2); store.denyPrimary = true; assert.equal(progression.save(), false);
    const before = toasts.length;
    store.denyBackup = true; assert.equal(progression.save(), false);
    assert.equal(progression.getSaveStatus().error, 'save-failed');
    assert.equal(progression.getSaveStatus().pending, true);
    assert.equal(toasts.slice(before).some(falseSavedClaim), false, JSON.stringify(toasts));
    assert.equal(saveNoticeModel(progression.getSaveStatus()).title, 'Progress not saved');
    off();
  });

  await test('late subscription with pending changes and a backup error does not announce current durability', async () => {
    const { store, progression } = await seeded();
    store.denyBackup = true; progression.addMoney(9); assert.equal(progression.save(), true);
    progression.addMoney(10);
    const toasts = []; const off = subscribeSaveFeedback(progression, text => toasts.push(text));
    assert.equal(progression.getSaveStatus().pending, true);
    assert.equal(toasts.some(falseSavedClaim), false, JSON.stringify(toasts));
    assert.match(saveNoticeModel(progression.getSaveStatus()).message, /waiting to save/i);
    off();
  });

  await test('backup-only failure retains a valid primary, clears through native retry, and does not lose earnings', async () => {
    const { store, state, progression } = await seeded();
    const oldBackup = store.data.get(SAVE_BACKUP_KEY);
    store.denyBackup = true; progression.addMoney(350); assert.equal(progression.save(), true);
    assert.equal(store.data.get(SAVE_BACKUP_KEY), oldBackup);
    assert.equal(progression.getSaveStatus().error, null);
    const notice = createSaveNotice({ C, ctx: { progression } });
    assert.equal(notice.el.hidden, false); assert.equal(noticeAction(notice).textContent, 'Retry save');
    store.denyBackup = false; const writesBefore = store.writes.length;
    noticeAction(notice).dispatchEvent(new Event('click'));
    assert.equal(store.writes.length - writesBefore, 2, 'one activation performs one backup and one primary write');
    assert.equal(notice.el.hidden, true); assert.equal(progression.getSaveStatus().backupFailed, false);
    assert.equal(JSON.parse(store.data.get(SAVE_KEY)).player.money, state.player.money); notice.destroy();
  });

  await test('storage object getter denial preserves live and stored careers until retry works', async () => {
    const { store, state, progression } = await seeded(); const before = new Map(store.data);
    progression.addMoney(17); const money = state.player.money;
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage getter denied'); } });
    assert.equal(progression.save(), false);
    assert.equal(progression.getSaveStatus().error, 'storage-unavailable');
    assert.equal(state.player.money, money); assert.deepEqual(store.data, before);
    install(store); progression.update(2);
    assert.equal(progression.getSaveStatus().error, null); assert.equal(progression.getSaveStatus().pending, false);
    assert.equal(JSON.parse(store.data.get(SAVE_KEY)).player.money, money);
  });

  await test('getItem denial during save produces a persistent failure without attempting replacement writes', async () => {
    const { store, progression } = await seeded(); const before = new Map(store.data); const writes = store.writes.length;
    progression.addMoney(1); store.denyRead = true;
    assert.equal(progression.save(), false); assert.equal(progression.getSaveStatus().blocked.reason, 'storage-read-failed');
    assert.equal(store.writes.length, writes); assert.deepEqual(store.data, before);
    store.denyRead = false; assert.equal(progression.save(), false);
    progression.checkSaveProtection();
    assert.equal(progression.getSaveStatus().blocked.reason, 'saved-career-available');
    assert.equal(store.writes.length, writes); assert.deepEqual(store.data, before);
    assert.equal(progression.load(), true); assert.equal(progression.getSaveStatus().blocked, null);
    progression.addMoney(1); assert.equal(progression.save(), true);
  });

  await test('throwing serialized property cannot replace either persisted copy and reports preparation failure', async () => {
    const { store, state, progression } = await seeded(); const before = new Map(store.data);
    Object.defineProperty(state.settings, 'failureFixture', { configurable: true, enumerable: true, get() { throw new Error('Property getter failed'); } });
    assert.equal(progression.save(), false); assert.equal(progression.getSaveStatus().error, 'serialise-failed');
    assert.match(saveNoticeModel(progression.getSaveStatus()).message, /prepared for saving/i);
    assert.deepEqual(store.data, before); assert.equal(progression.getSaveStatus().pending, true);
    delete state.settings.failureFixture; assert.equal(progression.save(), true);
  });

  await test('recovery acknowledgement does not conceal an active write failure or overwrite the good recovery copy', async () => {
    const seed = await seeded(); const { store } = seed; const backup = store.data.get(SAVE_BACKUP_KEY);
    store.data.set(SAVE_KEY, '{ invalid fixture');
    const { progression, state } = await createCareer(store);
    assert.equal(state.player.money, JSON.parse(backup).player.money);
    const toasts = []; const off = subscribeSaveFeedback(progression, text => toasts.push(text));
    assert.match(toasts[0], /restored from backup/i);
    store.denyPrimary = true; assert.equal(progression.save(), false);
    progression.acknowledgeSaveRecovery();
    assert.equal(progression.getSaveStatus().recovered, false);
    assert.equal(progression.getSaveStatus().error, 'save-failed'); assert.equal(progression.getSaveStatus().pending, true);
    assert.equal(store.data.get(SAVE_BACKUP_KEY), backup);
    store.denyPrimary = false; assert.equal(progression.save(), true);
    assert.equal(store.data.get(SAVE_BACKUP_KEY), backup); off();
  });

  await test('failed status reaches late subscribers, is immutable, and a throwing observer cannot stop others', async () => {
    const { store, progression } = await seeded(); progression.addMoney(1); store.denyPrimary = true; progression.save();
    const offThrow = progression.subscribeSaveStatus(() => { throw new Error('Injected observer failure'); });
    const seen = []; const off = progression.subscribeSaveStatus(status => seen.push(status));
    assert.equal(seen[0].error, 'save-failed'); assert.equal(Object.isFrozen(seen[0]), true);
    store.denyPrimary = false; assert.equal(progression.save(), true);
    assert.equal(seen.at(-1).error, null); offThrow(); off();
    const count = seen.length; progression.addMoney(1); assert.equal(seen.length, count);
  });

  await test('notice teardown stops subscriptions and progression disposal clears remaining observers', async () => {
    const { store, progression } = await seeded(); let visibleCalls = 0;
    const notice = createSaveNotice({ C, ctx: { progression } }, () => visibleCalls++);
    notice.destroy(); const before = visibleCalls;
    progression.addMoney(1); store.denyPrimary = true; progression.save(); assert.equal(visibleCalls, before);
    let observations = 0; progression.subscribeSaveStatus(() => observations++);
    store.denyPrimary = false; progression.dispose(); const disposed = observations;
    progression.addMoney(1); progression.save(); assert.equal(observations, disposed);
  });

  await test('Settings sheet close releases only its own notice subscription', async () => {
    const harness = menuHarness(); assert.equal(harness.subscribers.size, 1);
    harness.settings.dispatchEvent(new Event('click')); assert.equal(harness.subscribers.size, 2);
    harness.sheets[0].onClose(); assert.equal(harness.subscribers.size, 1);
    harness.sheets[0].onClose(); assert.equal(harness.subscribers.size, 1);
    harness.menu.destroy(); assert.equal(harness.subscribers.size, 0);
  });

  await test('menu teardown releases notices from still-open Settings sheets', async () => {
    const harness = menuHarness(); harness.settings.dispatchEvent(new Event('click'));
    assert.equal(harness.subscribers.size, 2);
    harness.menu.destroy(); assert.equal(harness.subscribers.size, 0, 'an open Settings notice must not outlive its screen owner');
  });

  console.log(`Save feedback adversarial: ${passed} passed, ${failures.length} failed (${diagnostics} expected failure diagnostics).`);
  console.log('Boundary: rendered short-viewport layout and startup read-failure recovery policy are not certified by this CPU gate.');
  if (failures.length) process.exitCode = 1;
} finally {
  // Clearing listeners also exercises lifecycle cleanup; retain fixture storage
  // during cleanup so no host/browser storage can accidentally be addressed.
  install(makeStorage()); for (const instance of instances) instance.dispose();
  console.warn = originalWarn; console.error = originalError;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
