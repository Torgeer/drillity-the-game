#!/usr/bin/env node
/** Independent catalogue critic. Real progression, save format, data and screen
 * callbacks run with a recording component adapter. No renderer/browser runs;
 * the adapter proves actions/text, never layout or native accessibility.
 * Synthetic account and contract inputs are test controls, not field claims.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGameState, createBus, EVENTS, makeRandom } from '../src/core/contract.js';
import * as data from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { useGameData, shopListings, slotInfo } from '../src/ui/screens/catalog.js';

const vibro = 'vibro-hammer-1500', impact = 'impact-hammer-9t';
const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const rafDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'requestAnimationFrame');
Object.defineProperty(globalThis, 'requestAnimationFrame', { configurable: true, value: () => 0 });
const production = ['src/game/progression.js', 'src/game/data.js', 'src/game/equipment-support.js',
  'src/ui/screens/shop.js', 'src/ui/screens/garage.js'];
const fingerprint = () => Object.fromEntries(production.map(path => [path,
  createHash('sha256').update(readFileSync(new URL('../' + path, import.meta.url))).digest('hex')]));
const initialHashes = fingerprint();
const live = new Set(), passed = [];
function memory() {
  const values = new Map();
  return { values, writes: 0, getItem: key => values.get(key) ?? null,
    setItem(key, value) { values.set(key, String(value)); this.writes++; }, removeItem: key => values.delete(key) };
}
async function career(store = memory(), setup = true) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus(), events = [];
  const progression = createProgression({ state, bus, rand: makeRandom(291) });
  live.add(progression); await progression.init();
  if (setup) {
    state.player.level = data.MAX_LEVEL; state.player.money = 2e6;
    state.player.certs = data.CERTS.map(c => c.id);
    state.unlocked.rigs = data.RIGS.map(r => r.id);
    state.unlocked.methods = data.METHODS.map(m => m.id);
    state.garage.rigId = 'piling-leader';
    state.garage.owned = []; state.garage.condition = {}; state.garage.loadout = {};
  }
  progression.save();
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  return { state, bus, progression, store, events };
}
const snap = f => JSON.stringify({ state: f.state, saved: f.progression.serialise(), events: f.events,
  writes: f.store.writes, disk: [...f.store.values] });
const blocked = result => { assert.equal(result.ok, false); assert.equal(result.code, 'unsupported-piling-hammer'); };
async function test(name, run) {
  const f = await career();
  try { await run(f); passed.push(name); console.log('PASS ' + name); }
  finally { f.progression.dispose(); live.delete(f.progression); }
}

class Node {
  constructor(tag, options = {}, children = []) {
    this.tag = tag; this.options = options; this.children = []; this.attributes = {};
    this.style = { setProperty() {} }; this.classList = { add() {}, remove() {}, toggle() {} };
    this.text = options.text ?? options.label ?? '';
    this.append(...children);
  }
  append(...children) { for (const child of children.flat(Infinity)) if (child != null) this.appendChild(child); }
  appendChild(child) { this.children.push(child instanceof Node ? child : new Node('text', { text: typeof child === 'object' ? '' : String(child) })); return child; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  get textContent() { return [this.text, ...this.children.map(c => c.textContent)].join(' '); }
  querySelector(selector) { return walk(this).slice(1).find(n => n.tag.includes(selector)); }
}
const walk = node => [node, ...node.children.flatMap(walk)];
const C = new Proxy({
  h(tag, ...args) { const opts = args[0] && typeof args[0] === 'object' && !(args[0] instanceof Node) ? args.shift() : {}; return new Node(tag, opts, args); },
  Card: (opts, ...children) => new Node('card', opts, children),
  Button: opts => new Node('button', opts),
  Pill: label => new Node('pill', { text: label }),
  Row: opts => new Node('row', opts),
  Bar: () => ({ el: new Node('bar') }),
  clear: node => { node.children = []; },
  NumberRoll: () => ({ setInstant() {}, to() {}, step() {} }),
}, { get: (target, key) => target[key] || ((...children) => new Node(String(key), {}, children)) });
function appFor(f, authority = f.progression) {
  const app = { C, state: f.state, bus: f.bus, ctx: { progression: authority }, viewport: { dpr: 1 },
    money: () => f.state.player.money, itemById: data.getItem, items: () => data.ITEMS,
    fmtMoney: String, nav() {}, haptic() {}, notes: [], sheets: [], confirms: [],
    toast(message) { this.notes.push(message); },
    async confirm(options) { this.confirms.push(options); return true; },
    sheet(options) { this.sheets.push(options); return { close() {} }; },
  };
  return app;
}
async function expose(path, factory, names) {
  const url = new URL('../' + path, import.meta.url);
  let source = readFileSync(url, 'utf8');
  const needle = /return \{\s*el,\s*mount\(\)/g;
  assert.equal([...source.matchAll(needle)].length, 1, 'exactly one screen result receives test exports');
  source = source.replace(needle, `return { critic: { ${names.join(', ')} }, el, mount()`)
    .replace(/from '([^']+)'/g, (text, dependency) => dependency.startsWith('.')
      ? `from '${new URL(dependency, url).href}'` : text);
  return (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64')))[factory];
}
useGameData(data);
const shopFactory = await expose('src/ui/screens/shop.js', 'createShopScreen', ['itemCard', 'buy', 'equip']);
const garageFactory = await expose('src/ui/screens/garage.js', 'createGarageScreen', ['openPicker', 'equipItem']);
const listings = shopListings();
const vibroListing = listings.find(l => l.itemId === vibro && l.condition === 'new');
const impactListing = listings.find(l => l.itemId === impact && l.condition === 'new');
assert.ok(vibroListing && impactListing, 'real unsupported and supported catalogue controls exist');
const action = (node, label) => { const result = walk(node).find(n => n.tag === 'button' && n.options.label === label); assert.ok(result, 'action exists: ' + label); return result; };

try {
  await test('refusal is neutral at locked, rich, indebted, owned, worn and already-fitted account states', f => {
    for (const [level, money, own, fit] of [[1, 0, false, false], [60, 2e6, false, false],
      [60, -900, true, false], [60, 2e6, true, true]]) {
      f.state.player.level = level; f.state.player.money = money;
      f.state.garage.owned = own ? [vibro] : [];
      f.state.garage.condition[vibro] = .12; f.state.garage.loadout.hammer = fit ? vibro : null;
      f.progression.save(); const before = snap(f);
      for (const qty of [0, -1, 3, Infinity, NaN]) blocked(f.progression.purchase(vibro, qty));
      assert.equal(f.progression.equip('hammer', vibro).ok, false);
      f.progression.update(10); assert.equal(snap(f), before);
    }
  });
  await test('a fresh progression instance restores old owned/fitted vibro and can sell it exactly once', async f => {
    f.state.garage.owned = [vibro]; f.state.garage.condition[vibro] = .29;
    f.state.garage.loadout.hammer = vibro; f.progression.save(); f.progression.dispose(); live.delete(f.progression);
    const resumed = await career(f.store, false);
    try {
      assert.equal(resumed.state.garage.loadout.hammer, vibro);
      assert.ok(resumed.state.garage.owned.includes(vibro)); assert.equal(resumed.state.garage.condition[vibro], .29);
      const oldMoney = resumed.state.player.money, sold = resumed.progression.sell(vibro);
      assert.equal(sold.ok, true); assert.ok(sold.price > 0);
      assert.equal(resumed.state.player.money, oldMoney + sold.price);
      assert.equal(resumed.state.garage.loadout.hammer, null);
      assert.equal(resumed.progression.sell(vibro).ok, false);
      assert.equal(resumed.state.player.money, oldMoney + sold.price);
    } finally { resumed.progression.dispose(); live.delete(resumed.progression); }
  });
  await test('shop actual impact Buy and Fit callbacks still charge and equip once', async f => {
    const app = appFor(f), shop = shopFactory(app), money = f.state.player.money;
    const buy = action(shop.critic.itemCard(impactListing), 'Buy');
    const expected = f.progression.priceOf(impact);
    await buy.options.onTap();
    assert.equal(app.confirms.length, 1); assert.equal(f.state.player.money, money - expected);
    const fit = action(shop.critic.itemCard(impactListing), 'Fit'); fit.options.onTap();
    assert.equal(f.state.garage.loadout.hammer, impact);
    assert.equal(f.events.filter(e => e.event === EVENTS.PURCHASE).length, 1);
    shop.unmount();
  });
  await test('unsupported new, synthetic used and refurbished callbacks never touch absent or throwing authority', async f => {
    let reads = 0;
    for (const authority of [null, new Proxy({}, { get() { reads++; throw Error('authority should be unreachable'); } })]) {
      const app = appFor(f, authority), shop = shopFactory(app), garage = garageFactory(app);
      const before = snap(f);
      for (const condition of ['new', 'used', 'refurb']) {
        const listing = { ...vibroListing, condition };
        await shop.critic.buy(listing); shop.critic.equip(listing); garage.critic.equipItem('hammer', vibro);
      }
      assert.equal(snap(f), before); assert.equal(app.confirms.length, 0);
      assert.equal(reads, 0); shop.unmount(); garage.unmount();
    }
  });
  await test('deferred confirmation cannot turn an impact quote into unavailable local settlement', async f => {
    for (const condition of ['new', 'used', 'refurb']) {
      const app = appFor(f, null), shop = shopFactory(app);
      const quote = { ...impactListing, condition, conditionName: condition, startCondition: .45 };
      let answer;
      app.confirm = () => new Promise(resolve => { answer = resolve; });
      const before = snap(f), pending = shop.critic.buy(quote);
      assert.equal(typeof answer, 'function'); quote.itemId = vibro; answer(true); await pending;
      assert.equal(snap(f), before); assert.match(app.notes.at(-1), /cannot start this drive/); shop.unmount();
    }
  });
  await test('actual unavailable card Specs action remains informative for unowned and saved-fitted equipment', f => {
    const app = appFor(f), shop = shopFactory(app);
    for (const fitted of [false, true]) {
      f.state.garage.owned = fitted ? [vibro] : []; f.state.garage.loadout.hammer = fitted ? vibro : null;
      const before = snap(f), card = shop.critic.itemCard(vibroListing);
      assert.equal(action(card, 'Unavailable').options.disabled, true);
      assert.equal(action(card, 'Unavailable').options.onTap, undefined);
      action(card, 'Specs').options.onTap(); const detail = app.sheets.at(-1);
      assert.match(detail.body.textContent, /Availability Unavailable/);
      assert.match(detail.body.textContent, /Fit a hydraulic impact hammer/);
      assert.doesNotMatch(detail.body.textContent, /ROP|1\.35×|Versus fitted|Same performance/);
      assert.equal(detail.actions.find(n => n.options.label === 'Unavailable').options.disabled, true);
      assert.equal(snap(f), before);
    }
    shop.unmount();
  });
  await test('actual garage Remove and impact row callbacks recover a saved fitted vibro', f => {
    f.state.garage.owned = [vibro, impact]; f.state.garage.loadout.hammer = vibro;
    f.state.garage.condition[vibro] = .4;
    const app = appFor(f), garage = garageFactory(app);
    garage.critic.openPicker(slotInfo('hammer')); let picker = app.sheets.at(-1);
    const unavailable = picker.body.children.find(n => n.textContent.includes(data.getItem(vibro).name));
    assert.equal(unavailable.attributes['aria-disabled'], 'true'); assert.equal(unavailable.options.onTap, undefined);
    picker.actions.find(n => n.options.label === 'Remove').options.onTap();
    assert.equal(f.state.garage.loadout.hammer, null); assert.ok(f.state.garage.owned.includes(vibro));
    assert.equal(f.state.garage.condition[vibro], .4);
    garage.critic.openPicker(slotInfo('hammer')); picker = app.sheets.at(-1);
    picker.body.children.find(n => n.textContent.includes(data.getItem(impact).name)).options.onTap();
    assert.equal(f.state.garage.loadout.hammer, impact); assert.ok(f.state.garage.owned.includes(vibro));
    garage.unmount();
  });
  assert.deepEqual(fingerprint(), initialHashes, 'production did not move during review');
  console.log(JSON.stringify({ passed: passed.length, production: initialHashes, browser: 'not run' }, null, 2));
} catch (error) {
  console.error(String(error.stack).replace(/data:text\/javascript;base64,[^:\s)]+/g, 'actual-screen'));
  process.exitCode = 1;
} finally {
  for (const progression of live) progression.dispose();
  for (const [key, descriptor] of [['localStorage', storageDescriptor], ['requestAnimationFrame', rafDescriptor]])
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
}
