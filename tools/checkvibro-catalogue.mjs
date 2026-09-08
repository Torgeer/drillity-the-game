#!/usr/bin/env node
/** CPU containment: actual purchase/equip/save authority and actual screen
 * callbacks. The tiny component adapter records text/actions, not layout or
 * accessibility conformance; no browser, renderer or replacement UI logic runs.
 * Test-only exports expose closures from otherwise unchanged screen sources.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import * as data from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { checkEquipmentSupport } from '../src/game/equipment-support.js';
import { useGameData, shopListings, slotInfo } from '../src/ui/screens/catalog.js';

const VIBRO = 'vibro-hammer-1500', IMPACT = 'impact-hammer-9t';
const files = ['src/game/progression.js', 'src/game/equipment-support.js', 'src/game/data.js',
  'src/ui/screens/shop.js', 'src/ui/screens/garage.js'];
const hashes = () => Object.fromEntries(files.map(p => [p, createHash('sha256')
  .update(readFileSync(new URL('../' + p, import.meta.url))).digest('hex')]));
const sourceBefore = hashes();
const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const oldRAF = Object.getOwnPropertyDescriptor(globalThis, 'requestAnimationFrame');
Object.defineProperty(globalThis, 'requestAnimationFrame', { configurable: true, value: () => 0 });

function memoryStorage() {
  const values = new Map();
  return { values, writes: 0, getItem(k) { return values.get(k) ?? null; },
    setItem(k, v) { this.writes++; values.set(k, String(v)); }, removeItem(k) { values.delete(k); } };
}
async function fixture() {
  const store = memoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus(), events = [];
  const progression = createProgression({ state, bus, rand: makeRandom(123) });
  await progression.init();
  state.player.level = 60; state.player.money = 1e6;
  state.unlocked.rigs.push('piling-leader'); state.garage.rigId = 'piling-leader';
  state.garage.owned = []; state.garage.condition = {}; state.garage.loadout = {};
  progression.save();
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  return { state, bus, progression, store, events };
}
const snapshot = f => JSON.stringify({ state: f.state, save: f.progression.serialise(),
  events: f.events, writes: f.store.writes, storage: [...f.store.values] });
const reject = result => { assert.equal(result.ok, false); assert.equal(result.code, 'unsupported-piling-hammer');
  assert.equal(result.itemId, VIBRO); assert.match(result.reason, /hydraulic impact hammer/); };

class Element {
  constructor(tag, options = {}, kids = []) {
    this.tag = tag; this.options = options || {}; this.children = []; this.style = {};
    this.attrs = new Map(); this.classList = { add() {}, remove() {}, toggle() {} };
    this._text = this.options.text || this.options.label || '';
    for (const child of kids.flat(Infinity)) if (child) this.appendChild(child);
  }
  appendChild(child) {
    if (!(child instanceof Element)) child = new Element('text', { text: typeof child === 'object' ? '' : String(child) });
    this.children.push(child); return child;
  }
  append(...children) { for (const child of children) this.appendChild(child); }
  setAttribute(k, v) { this.attrs.set(k, String(v)); }
  get textContent() { return this._text + this.children.map(c => c.textContent || '').join(' '); }
  set textContent(v) { this._text = String(v); this.children = []; }
}
const C = new Proxy({
  h(tag, ...args) {
    const opts = args[0] && !(args[0] instanceof Element) && typeof args[0] === 'object' ? args.shift() : {};
    return new Element(tag, opts, args);
  },
  Card: (o, ...kids) => new Element('card', o, kids),
  Button: o => new Element('button', o),
  Pill: label => new Element('pill', { text: label }),
  Bar: () => ({ el: new Element('bar') }),
  NumberRoll: () => ({ to() {}, setInstant() {}, step() {} }),
}, { get: (target, key) => target[key] || ((...kids) => new Element(String(key), {}, kids)) });
function nodes(el) { return [el, ...el.children.flatMap(nodes)]; }
function uiApp(f) {
  const app = { ...f, C, ctx: { progression: f.progression }, sheets: [], toasts: [], confirms: 0,
    money: () => f.state.player.money, items: () => data.ITEMS, itemById: data.getItem,
    fmtMoney: String, viewport: { dpr: 1 }, nav() {}, haptic() {},
    toast(message) { this.toasts.push(message); },
    async confirm() { this.confirms++; return true; },
    sheet(options) { this.sheets.push(options); return { close() {} }; } };
  return app;
}
async function screenFactory(file, factory, closures) {
  const url = new URL('../' + file, import.meta.url);
  let source = readFileSync(url, 'utf8').replaceAll('\r\n', '\n');
  const marker = '  return {\n    el,\n    mount()';
  assert.equal(source.split(marker).length, 2, 'one screen return adapter target');
  source = source.replace(marker, `  return {\n    probe: { ${closures} },\n    el,\n    mount()`)
    .replace(/from '([^']+)'/g, (all, p) => p.startsWith('.') ? `from '${new URL(p, url).href}'` : all);
  return (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64')))[factory];
}
const createShop = await screenFactory('src/ui/screens/shop.js', 'createShopScreen', 'buy, equip, itemCard, openDetail, frontListings');
const createGarage = await screenFactory('src/ui/screens/garage.js', 'createGarageScreen', 'equipItem, openPicker, slotCard');
useGameData(data);
const listings = shopListings().filter(l => l.itemId === VIBRO);
assert.ok(listings.length > 0, 'test actual catalogue entries, never an empty set');
// The current catalogue hashes vibro to new-only. These explicitly synthetic
// variants attack the UI's separate used/refurbished settlement branch.
const purchaseFixtures = [...listings, ...['used', 'refurb'].map(condition => ({ ...listings[0],
  condition, conditionName: condition, price: 1000, startCondition: .5 }))];
const cases = [];
async function test(name, fn) {
  const f = await fixture();
  try { await fn(f); cases.push(name); console.log('PASS ' + name); }
  finally { f.progression.dispose(); }
}
try {
  await test('purchase repeatedly refuses before any charge, ownership, event or save write', f => {
    const before = snapshot(f);
    for (const quantity of [1, 20, NaN, Infinity]) { const result = f.progression.purchase(VIBRO, quantity); reject(result); assert.equal(result.price, 0); }
    f.progression.update(2); assert.equal(snapshot(f), before);
  });
  await test('supported impact purchase and fit retain normal accounting', f => {
    const expected = f.progression.priceOf(IMPACT), money = f.state.player.money;
    const result = f.progression.purchase(IMPACT); assert.equal(result.ok, true);
    assert.equal(result.price, expected); assert.equal(f.state.player.money, money - expected);
    assert.equal(f.progression.equip('hammer', IMPACT).ok, true);
    assert.equal(f.state.garage.loadout.hammer, IMPACT);
    assert.equal(f.events.filter(e => e.event === EVENTS.PURCHASE).length, 1);
  });
  await test('legacy owned/fitted save survives; unavailable fit is refused and removal recovers', f => {
    f.state.garage.owned = [VIBRO, IMPACT]; f.state.garage.condition[VIBRO] = .37;
    f.state.garage.loadout.hammer = VIBRO; f.progression.save(); assert.equal(f.progression.load(), true);
    assert.ok(f.state.garage.owned.includes(VIBRO)); assert.equal(f.state.garage.loadout.hammer, VIBRO);
    assert.equal(f.state.garage.condition[VIBRO], .37);
    assert.equal(f.progression.equip('hammer', IMPACT).ok, true); f.progression.save();
    const before = snapshot(f); reject(f.progression.equip('hammer', VIBRO));
    f.progression.update(2); assert.equal(snapshot(f), before);
    assert.equal(f.progression.equip('hammer', null).ok, true);
    assert.ok(f.state.garage.owned.includes(VIBRO));
  });
  await test('legacy owner can still sell unavailable equipment', f => {
    f.state.garage.owned = [VIBRO]; f.state.garage.condition[VIBRO] = .37;
    f.state.garage.loadout.hammer = VIBRO;
    const before = f.state.player.money, result = f.progression.sell(VIBRO);
    assert.equal(result.ok, true); assert.ok(result.price > 0);
    assert.equal(f.state.player.money, before + result.price);
    assert.equal(f.state.garage.loadout.hammer, null); assert.ok(!f.state.garage.owned.includes(VIBRO));
  });
  await test('every actual vibro listing shows unavailable with no buy/fit action or ROP comparison', async f => {
    const app = uiApp(f), screen = createShop(app);
    const recommended = screen.probe.frontListings(999).list;
    assert.ok(recommended.some(l => l.itemId === IMPACT), 'supported impact remains recommended');
    assert.ok(!recommended.some(l => l.itemId === VIBRO), 'unavailable item is not recommended');
    for (const listing of listings) {
      const card = screen.probe.itemCard(listing), all = nodes(card);
      assert.match(card.textContent, /cannot start this drive/);
      assert.ok(all.some(n => n.tag === 'button' && n.options.label === 'Unavailable' && n.options.disabled));
      assert.ok(!all.some(n => ['Buy', 'Fit', 'Restock'].includes(n.options.label)));
      assert.doesNotMatch(card.textContent, /Same performance as fitted/);
      assert.doesNotMatch(card.textContent, /ROP|1\.35×/);
      screen.probe.openDetail(listing);
      const sheet = app.sheets.at(-1); assert.match(sheet.body.textContent, /cannot start this drive/);
      assert.equal(sheet.actions[1].options.disabled, true); assert.equal(sheet.actions[1].options.label, 'Unavailable');
      const before = snapshot(f); await screen.probe.buy(listing); screen.probe.equip(listing);
      assert.equal(snapshot(f), before); assert.equal(app.confirms, 0);
    }
    screen.unmount();
  });
  await test('shop callbacks also refuse without progression fallback authority', async f => {
    const app = uiApp(f); app.ctx.progression = null;
    const screen = createShop(app), before = snapshot(f);
    for (const listing of purchaseFixtures) { await screen.probe.buy(listing); screen.probe.equip(listing); }
    assert.equal(snapshot(f), before); assert.equal(app.confirms, 0); screen.unmount();
  });
  await test('a changed listing is rechecked after confirmation before local used settlement', async f => {
    const app = uiApp(f); app.ctx.progression = null;
    const screen = createShop(app);
    const listing = { ...shopListings().find(l => l.itemId === IMPACT), condition: 'used',
      conditionName: 'Used', startCondition: .5 };
    app.confirm = async () => { app.confirms++; listing.itemId = VIBRO; return true; };
    const before = snapshot(f);
    try {
      await screen.probe.buy(listing);
      assert.equal(app.confirms, 1); assert.equal(snapshot(f), before);
      assert.match(app.toasts.at(-1), /cannot start this drive/);
    } finally { screen.unmount(); }
  });
  await test('garage warns on saved fit, keeps unavailable owned row visible, and keeps impact selectable', f => {
    f.state.garage.owned = [VIBRO, IMPACT]; f.state.garage.loadout.hammer = VIBRO;
    const app = uiApp(f), screen = createGarage(app), slot = slotInfo('hammer');
    assert.match(screen.probe.slotCard(slot).textContent, /cannot start this drive/);
    screen.probe.openPicker(slot);
    const sheet = app.sheets.at(-1), rows = sheet.body.children;
    const vibro = rows.find(row => row.textContent.includes(data.getItem(VIBRO).name));
    const impact = rows.find(row => row.textContent.includes(data.getItem(IMPACT).name));
    assert.ok(vibro); assert.match(vibro.textContent, /Unavailable/); assert.equal(vibro.options.onTap, undefined);
    assert.equal(vibro.attrs.get('aria-disabled'), 'true'); assert.equal(typeof impact.options.onTap, 'function');
    assert.ok(sheet.actions.some(b => b.options.label === 'Remove' && !b.options.disabled));
    const before = snapshot(f); screen.probe.equipItem('hammer', VIBRO); assert.equal(snapshot(f), before);
    app.ctx.progression = null; screen.probe.equipItem('hammer', VIBRO); assert.equal(snapshot(f), before);
    screen.unmount();
  });
  await test('support policy accepts every other current catalogue item', () => {
    for (const item of data.ITEMS.filter(i => i.id !== VIBRO))
      assert.equal(checkEquipmentSupport('driven-pile', item.id, data.getItem).ok, true, item.id);
  });
  assert.deepEqual(hashes(), sourceBefore, 'shipping source stayed unchanged throughout checks');
  console.log(JSON.stringify({ passed: cases.length, listings: listings.map(l => l.condition), sourceBefore }, null, 2));
} catch (error) {
  console.error(String(error.stack).replace(/data:text\/javascript;base64,[^:\s)]+/g, 'screen-source'));
  process.exitCode = 1;
} finally {
  if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage); else delete globalThis.localStorage;
  if (oldRAF) Object.defineProperty(globalThis, 'requestAnimationFrame', oldRAF); else delete globalThis.requestAnimationFrame;
}
