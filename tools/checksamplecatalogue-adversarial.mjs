/** Independent actual Shop/Garage callback and copy checks. Recording component
 * adapter, real catalogue and progression. No browser or geometry claim. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import * as data from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { useGameData, shopListings, slotInfo } from '../src/ui/screens/catalog.js';

const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const oldRaf = Object.getOwnPropertyDescriptor(globalThis, 'requestAnimationFrame');
Object.defineProperty(globalThis, 'requestAnimationFrame', { configurable: true, value: () => 0 });
const live = new Set(), cases = [];
const test = (name, fn) => cases.push({ name, fn });
const unsupported = ['bit-core-bq-surf', 'bit-core-hq-imp', 'bit-core-pq-imp-hd', 'barrel-hq-wl-hd', 'sonic-shoe-carbide'];
class Node {
  constructor(tag, options = {}, children = []) {
    this.tag = tag; this.options = options; this.children = []; this.attributes = {};
    this.style = { setProperty() {} }; this.classList = { add() {}, remove() {}, toggle() {} };
    this.text = options.text ?? options.label ?? ''; this.append(...children);
  }
  append(...children) { for (const child of children.flat(Infinity)) if (child != null) this.appendChild(child); }
  appendChild(child) { this.children.push(child instanceof Node ? child : new Node('text', { text: typeof child === 'object' ? '' : String(child) })); return child; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  get textContent() { return [this.text, ...this.children.map(c => c.textContent)].join(' '); }
  querySelector(selector) { return walk(this).slice(1).find(n => n.tag.includes(selector)); }
}
const walk = n => [n, ...n.children.flatMap(walk)];
const C = new Proxy({
  h(tag, ...args) { const options = args[0] && typeof args[0] === 'object' && !(args[0] instanceof Node) ? args.shift() : {}; return new Node(tag, options, args); },
  Card: (opts, ...children) => new Node('card', opts, children),
  Button: opts => new Node('button', opts), Pill: label => new Node('pill', { text: label }),
  Row: opts => new Node('row', opts), Bar: () => ({ el: new Node('bar') }),
  clear: n => { n.children = []; }, NumberRoll: () => ({ setInstant() {}, to() {}, step() {} }),
}, { get: (target, key) => target[key] || ((...children) => new Node(String(key), {}, children)) });
async function fixture(methodId = 'core') {
  const values = new Map(), writes = [];
  const store = { getItem: k => values.get(k) ?? null, setItem(k, v) { writes.push(k); values.set(k, String(v)); }, removeItem(k) { values.delete(k); } };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus(), events = [];
  const p = createProgression({ state, bus, rand: makeRandom(451) }); await p.init();
  state.player.level = 60; state.player.money = 1e7; state.player.certs = data.CERTS.map(c => c.id);
  state.unlocked.methods = data.METHODS.map(m => m.id); state.unlocked.rigs = data.RIGS.map(r => r.id);
  state.garage.rigId = methodId === 'core' ? 'core-rig' : 'sonic-truck';
  state.garage.owned = []; state.garage.loadout = {}; state.garage.condition = {};
  for (const e of new Set(Object.values(EVENTS))) bus.on(e, payload => events.push({ e, payload }));
  const f = { state, bus, p, values, writes, store, events }; live.add(f); return f;
}
function close(f) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: f.store });
  f.p.dispose(); live.delete(f);
}
function snapshot(f) { return JSON.stringify({ state: f.state, save: f.p.serialise(), values: [...f.values], writes: f.writes, events: f.events }); }
function appFor(f, authority = f.p) {
  return { C, state: f.state, bus: f.bus, ctx: { progression: authority }, viewport: { dpr: 1 },
    money: () => f.state.player.money, itemById: data.getItem, items: () => data.ITEMS, fmtMoney: String,
    nav() {}, haptic() {}, notes: [], sheets: [], confirms: [],
    toast(message) { this.notes.push(message); },
    async confirm(options) { this.confirms.push(options); return true; },
    sheet(options) { this.sheets.push(options); return { close() {} }; },
  };
}
async function expose(path, factory, names) {
  const url = new URL('../' + path, import.meta.url); let source = readFileSync(url, 'utf8');
  const needle = /return \{\s*el,\s*mount\(\)/g;
  assert.equal([...source.matchAll(needle)].length, 1);
  source = source.replace(needle, `return { critic: { ${names.join(', ')} }, el, mount()`)
    .replace(/from '([^']+)'/g, (text, dependency) => dependency.startsWith('.') ? `from '${new URL(dependency, url).href}'` : text);
  return (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64')))[factory];
}
function action(node, label) { return walk(node).find(n => n.tag === 'button' && n.options.label === label); }
useGameData(data);
const shopFactory = await expose('src/ui/screens/shop.js', 'createShopScreen', ['itemCard', 'buy', 'equip', 'frontListings']);
const garageFactory = await expose('src/ui/screens/garage.js', 'createGarageScreen', ['openPicker', 'equipItem', 'render']);
const listings = shopListings(), listingFor = id => listings.find(l => l.itemId === id && l.condition === 'new');

test('all five unmatched sample parts show unavailable cards with informative Specs and no Buy or Fit action', async () => {
  const f = await fixture(), app = appFor(f), shop = shopFactory(app);
  try { for (const id of unsupported) {
    const card = shop.critic.itemCard(listingFor(id)); const button = action(card, 'Unavailable');
    assert.ok(button, id); assert.equal(button.options.disabled, true); assert.equal(button.options.onTap, undefined);
    assert.equal(action(card, 'Buy'), undefined); assert.equal(action(card, 'Fit'), undefined);
    const before = snapshot(f); action(card, 'Specs').options.onTap();
    const text = app.sheets.at(-1).body.textContent; assert.match(text, /Availability Unavailable/);
    assert.match(text, /matching|casing|sample/i); assert.equal(snapshot(f), before);
  } } finally { shop.unmount(); }
});

test('actual unavailable shop and garage callbacks cannot fall back to local credits when progression is absent', async () => {
  const f = await fixture(); let reads = 0;
  for (const authority of [null, new Proxy({}, { get() { reads++; throw new Error('unavailable stock must stop before authority access'); } })]) {
    const app = appFor(f, authority), shop = shopFactory(app), garage = garageFactory(app);
    try { const before = snapshot(f);
      for (const id of unsupported) {
        for (const condition of ['new', 'used', 'refurb']) {
          const listing = { ...listingFor(id), condition };
          await shop.critic.buy(listing); shop.critic.equip(listing);
        }
        garage.critic.equipItem(data.getItem(id).slot, id);
      }
      assert.equal(snapshot(f), before); assert.equal(reads, 0); assert.equal(app.confirms.length, 0);
    } finally { shop.unmount(); garage.unmount(); }
  }
});

test('a delayed valid purchase cannot become an unavailable part after confirmation', async () => {
  const f = await fixture(), app = appFor(f), shop = shopFactory(app);
  try { for (const condition of ['new', 'used', 'refurb']) {
    let answer; app.confirm = () => new Promise(resolve => answer = resolve);
    const listing = { ...listingFor('bit-core-nq-imp'), condition, conditionName: condition, startCondition: .45 };
    const before = snapshot(f), purchase = shop.critic.buy(listing); assert.equal(typeof answer, 'function');
    listing.itemId = 'bit-core-bq-surf'; answer(true); await purchase;
    assert.equal(snapshot(f), before); assert.match(app.notes.at(-1), /matching|sampling|core/i);
  } } finally { shop.unmount(); }
});

test('actual supported NQ Buy and Fit callbacks still charge and equip once', async () => {
  const f = await fixture(), app = appFor(f), shop = shopFactory(app), id = 'bit-core-nq-imp';
  try {
    const money = f.state.player.money, quote = f.p.priceOf(id);
    await action(shop.critic.itemCard(listingFor(id)), 'Buy').options.onTap();
    assert.equal(money - f.state.player.money, quote); assert.equal(app.confirms.length, 1);
    action(shop.critic.itemCard(listingFor(id)), 'Fit').options.onTap();
    assert.equal(f.state.garage.loadout.bit, id);
    assert.equal(f.events.filter(x => x.e === EVENTS.PURCHASE).length, 1);
  } finally { shop.unmount(); }
});

test('saved unavailable core bit, core barrel and sonic shoe remain visibly removable from the actual Garage picker', async () => {
  for (const id of ['bit-core-bq-surf', 'barrel-hq-wl-hd', 'sonic-shoe-carbide']) {
    const item = data.getItem(id), f = await fixture(item.methods[0]);
    f.state.garage.owned = [id]; f.state.garage.loadout = { [item.slot]: id }; f.state.garage.condition[id] = .37;
    const app = appFor(f), garage = garageFactory(app);
    try {
      garage.critic.openPicker(slotInfo(item.slot)); const sheet = app.sheets.at(-1);
      assert.match(sheet.body.textContent, /Unavailable/);
      const remove = sheet.actions.find(n => n.options.label === 'Remove'); assert.ok(remove, `${id} removal`);
      remove.options.onTap(); assert.equal(f.state.garage.loadout[item.slot], null);
      assert.deepEqual(f.state.garage.owned, [id]); assert.equal(f.state.garage.condition[id], .37);
    } finally { garage.unmount(); }
  }
});

test('actual Garage never calls an HQ crown with an HQ3 barrel a square string', async () => {
  const f = await fixture(); f.state.garage.loadout = { bit: 'bit-core-hq-imp', rod: 'barrel-hq-wl-hd' };
  f.state.garage.owned = Object.values(f.state.garage.loadout); const garage = garageFactory(appFor(f));
  try {
    garage.critic.render(); const text = garage.el.textContent;
    assert.match(text, /String check/); assert.doesNotMatch(text, /string is square|matching core and hole sizes/);
    assert.match(text, /not a matching core system/);
  } finally { garage.unmount(); }
});

test('actual Garage distinguishes matched NQ dimensions from sonic role checks without claiming measured clearance', async () => {
  for (const methodId of ['core', 'sonic']) {
    const f = await fixture(methodId); f.state.garage.loadout = data.defaultLoadoutFor(methodId, 60);
    f.state.garage.owned = Object.values(f.state.garage.loadout).filter(Boolean); const garage = garageFactory(appFor(f));
    try {
      garage.critic.render(); const text = garage.el.textContent;
      if (methodId === 'core') assert.match(text, /NQ bit and barrel have matching core and hole sizes/);
      else { assert.match(text, /right-hand drill rod and left-hand override casing/); assert.doesNotMatch(text, /string is square|matching core and hole sizes/); }
    } finally { garage.unmount(); }
  }
});

let failed = 0;
try {
  for (const { name, fn } of cases) {
    try { await fn(); console.log(`PASS ${name}`); }
    catch (e) { failed++; console.error(`FAIL ${name}\n${e.stack}`); }
    finally { for (const f of [...live]) close(f); }
  }
  console.log(`Sample catalogue critic: ${cases.length - failed}/${cases.length} groups passed.`);
  console.log('Actual callback/copy checks with a recording component adapter; no rendered layout, GPU or browser acceptance.');
  if (failed) process.exitCode = 1;
} finally {
  for (const f of [...live]) close(f);
  if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage); else delete globalThis.localStorage;
  if (oldRaf) Object.defineProperty(globalThis, 'requestAnimationFrame', oldRaf); else delete globalThis.requestAnimationFrame;
}
