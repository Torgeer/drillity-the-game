/** Independent sample-tool compatibility attacks. Runs real progression APIs;
 * fixture senior resources and synthetic tender values are not physical claims.
 * Optional --baseline <directory> compares the complete frozen pre-change data.
 * This does not claim a sampling gameplay or browser acceptance pass. */
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import * as gameData from '../src/game/data.js';
import { useGameData, shopListings, previewRefFor } from '../src/ui/screens/catalog.js';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { METHODS, ITEMS, CERTS, REGIONS, RIGS, defaultLoadoutFor, getItem, getMethod, unlockedUpTo } from '../src/game/data.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import * as support from '../src/game/equipment-support.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const cases = [], alive = new Set();
const test = (name, fn) => cases.push({ name, fn });
const inspect = (method, loadout, lookup = getItem) => {
  assert.equal(typeof support.checkSampleEquipment, 'function', 'explicit sample compatibility helper is required');
  return support.checkSampleEquipment(method, loadout, lookup);
};
function install(store) { Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store }); }
function contract(methodId) {
  return { id: `sample-critic-${methodId}`, methodId, regionId: 'nordic', archetype: 'exploration-pad',
    applicationId: 'mineral-exploration', targetDepth: methodId === 'core' ? 30.5 : 6.5,
    holes: 1, holeDia: methodId === 'core' ? 75.7 : 150, payout: 12000, difficulty: 1,
    requiredCerts: [], seed: 721, flushMedium: 'water' };
}
async function fixture(methodId, { level = 60, owned = [], loadout = {} } = {}) {
  const values = new Map(), writes = [];
  const store = { getItem: k => values.get(k) ?? null, setItem(k, v) { writes.push(k); values.set(k, String(v)); }, removeItem(k) { values.delete(k); } };
  install(store);
  const state = createGameState(), bus = createBus(), events = [];
  const p = createProgression({ state, bus, rand: makeRandom(451) }); await p.init();
  state.player.level = level; state.player.money = 1e7; state.player.certs = CERTS.map(c => c.id);
  state.unlocked.methods = unlockedUpTo(level).methods;
  state.unlocked.rigs = RIGS.filter(r => r.unlockLevel <= level).map(r => r.id);
  state.unlocked.regions = REGIONS.map(r => r.id);
  state.garage.rigId = methodId === 'core' ? 'core-rig' : 'sonic-truck';
  state.garage.owned = [...owned]; state.garage.loadout = { bit: null, rod: null, hammer: null, compressor: null, ...loadout };
  for (const e of new Set(Object.values(EVENTS))) bus.on(e, payload => events.push({ e, payload }));
  const f = { state, bus, p, store, values, writes, events }; alive.add(f); return f;
}
function close(f) { install(f.store); f.p.dispose(); alive.delete(f); }
function snapshot(f) { return JSON.stringify({ state: f.state, saved: f.p.serialise(), run: f.p.run, values: [...f.values], writes: f.writes, events: f.events }); }
async function purchaseDefaults(f, methodId) {
  for (const [slot, id] of Object.entries(defaultLoadoutFor(methodId, f.state.player.level))) {
    if (!id) continue;
    const money = f.state.player.money, price = f.p.priceOf(id);
    assert.equal(f.p.purchase(id).ok, true, id); assert.equal(money - f.state.player.money, price);
    assert.equal(f.p.equip(slot, id).ok, true, `${slot}: ${id}`);
  }
}

test('all 21 methods across 60 levels suggest unlocked valid slots and complete sample trains after unlock', () => {
  assert.equal(METHODS.length, 21);
  let checked = 0;
  for (const method of METHODS) for (let level = 1; level <= 60; level++) {
    const selected = defaultLoadoutFor(method.id, level); checked++;
    for (const [slot, id] of Object.entries(selected)) if (id) {
      const item = getItem(id); assert.ok(item, id); assert.equal(item.slot, slot);
      assert.ok(item.unlockLevel <= level, `${id} is locked at ${level}`);
      assert.ok(item.methods.length === 0 || item.methods.includes(method.id));
    }
    if (['core', 'sonic'].includes(method.id) && level >= method.unlockLevel) {
      const check = inspect(method.id, selected); assert.equal(check.ok, true, `${method.id}/${level}: ${check.reason}`);
    }
  }
  assert.equal(checked, 1260);
});

test('all non-sampling methods remain outside the new sample guard', () => {
  for (const method of METHODS.filter(m => !['core', 'sonic'].includes(m.id))) {
    assert.equal(inspect(method.id, {}, () => { throw new Error('unrelated method must not require sampling lookup'); }).ok, true);
  }
});

test('BQ crown with NQ barrel is refused without altering the caller selection', () => {
  const bad = Object.freeze({ ...defaultLoadoutFor('core', 60), bit: 'bit-core-bq-surf', rod: 'barrel-nq-wl' });
  const before = JSON.stringify(bad), check = inspect('core', bad);
  assert.equal(check.ok, false); assert.ok(check.reason); assert.equal(JSON.stringify(bad), before);
});

test('a sonic drive shoe cannot substitute for the protective casing pipe', () => {
  const bad = { ...defaultLoadoutFor('sonic', 60), casing: 'sonic-shoe-carbide' };
  const check = inspect('sonic', bad); assert.equal(check.ok, false); assert.match(check.reason, /casing|pipe/i);
});

test('wireline family and actual core diameter both matter, including HQ versus HQ3', () => {
  const hq = { ...defaultLoadoutFor('core', 60), bit: 'bit-core-hq-imp', rod: 'barrel-hq-wl-hd' };
  assert.equal(getItem(hq.rod).sampling.family, 'HQ3');
  assert.equal(getItem(hq.rod).sampling.coreDiameterMm, 61.1);
  assert.equal(getItem(hq.bit).sampling.coreDiameterMm, 63.5);
  assert.equal(inspect('core', hq).ok, false, 'equal nominal hole size does not make the core systems compatible');
  const normal = defaultLoadoutFor('core', 60);
  const barrel = structuredClone(getItem(normal.rod)); barrel.sampling.coreDiameterMm += 1;
  assert.equal(inspect('core', normal, id => id === barrel.id ? barrel : getItem(id)).ok, false,
    'same named family cannot override contradictory core diameter metadata');
});

test('metadata, not an item name or id prefix, determines the sampler role and family', () => {
  for (const methodId of ['core', 'sonic']) {
    const selected = defaultLoadoutFor(methodId, 60), renamed = {}, catalogue = new Map();
    for (const [slot, id] of Object.entries(selected)) if (id) {
      const item = structuredClone(getItem(id)); item.id = `critic-${slot}`; item.name = 'opaque test fixture';
      renamed[slot] = item.id; catalogue.set(item.id, item);
    }
    assert.equal(inspect(methodId, renamed, id => catalogue.get(id)).ok, true);
  }
});

test('missing roles, contradictory diameters and malformed barrel capacity never advertise readiness', () => {
  const selected = defaultLoadoutFor('core', 60);
  for (const mutate of [
    i => { delete i.sampling; },
    i => { i.sampling.role = 'sonic-barrel'; },
    i => { i.sampling.family = 'NQ3'; },
    i => { i.sampling.coreDiameterMm = '47.6'; },
    i => { i.sampling.holeDiameterMm += 1; },
    ...[0, -1, Infinity, NaN, '1.5', null].map(value => i => { i.sampling.barrelCapacityM = value; }),
  ]) {
    const barrel = structuredClone(getItem(selected.rod)); mutate(barrel);
    assert.equal(inspect('core', selected, id => id === barrel.id ? barrel : getItem(id)).ok, false);
  }
});

test('sonic roles and documented handedness cannot be interchanged merely because a slot matches', () => {
  const selected = defaultLoadoutFor('sonic', 60);
  for (const [slot, field, value] of [
    ['bit', 'role', 'sonic-rod'], ['rod', 'role', 'wireline-barrel'], ['casing', 'role', 'sonic-shoe'],
    ['bit', 'threadHand', 'LH'], ['rod', 'threadHand', 'LH'], ['casing', 'threadHand', 'RH'],
  ]) {
    const item = structuredClone(getItem(selected[slot])); item.sampling[field] = value;
    assert.equal(inspect('sonic', selected, id => id === item.id ? item : getItem(id)).ok, false, `${slot}/${field}`);
  }
});

test('a sourced inner-tube capacity stays distinct from an authored sonic run limit', () => {
  assert.equal(inspect('core', defaultLoadoutFor('core', 60)).capacityBasis, 'inner-tube-length');
  assert.equal(inspect('sonic', defaultLoadoutFor('sonic', 60)).capacityBasis, 'gameplay-run-limit');
});

test('unmatched sampling stock cannot be newly purchased or fitted and does not mutate existing legacy ownership', async () => {
  for (const id of ['bit-core-bq-surf', 'bit-core-hq-imp', 'bit-core-pq-imp-hd', 'barrel-hq-wl-hd', 'sonic-shoe-carbide']) {
    const item = getItem(id), methodId = item.methods[0], chosen = defaultLoadoutFor(methodId, 60);
    chosen[item.slot] = id;
    const f = await fixture(methodId, { owned: Object.values(chosen).filter(Boolean), loadout: chosen });
    const before = snapshot(f);
    assert.equal(gameData.sampleItemSupport(id).ok, false, id);
    assert.equal(f.p.purchase(id).ok, false, `${id} purchase`); assert.equal(f.p.equip(item.slot, id).ok, false, `${id} fit`);
    assert.equal(snapshot(f), before, 'availability refusal cannot consume money or erase an old part');
    assert.equal(f.p.equip(item.slot, null).ok, true); assert.equal(f.p.sell(id).ok, true);
  }
});

for (const methodId of ['core', 'sonic']) {
  test(`${methodId} defaults can be purchased, fitted and accepted at their real unlock level`, async () => {
    const f = await fixture(methodId, { level: getMethod(methodId).unlockLevel });
    await purchaseDefaults(f, methodId);
    const before = snapshot(f), preview = f.p.previewContract(contract(methodId));
    assert.equal(preview.ok, true, preview.reason); assert.equal(snapshot(f), before, 'readiness must be read-only');
    assert.equal(f.p.acceptContract(contract(methodId)).ok, true);
    const identity = f.p.beginHole(contract(methodId)); assert.ok(identity?.runId); assert.ok(identity?.attemptId);
  });

  test(`${methodId} rejected legacy fitted equipment survives load, preview and acceptance unchanged`, async () => {
    const chosen = defaultLoadoutFor(methodId, 60);
    if (methodId === 'core') { chosen.bit = 'bit-core-bq-surf'; chosen.rod = 'barrel-nq-wl'; }
    else chosen.casing = 'sonic-shoe-carbide';
    const f = await fixture(methodId, { owned: Object.values(chosen).filter(Boolean), loadout: chosen });
    const fitted = { ...f.state.garage.loadout }, owned = [...f.state.garage.owned];
    assert.equal(f.p.save(), true); assert.equal(f.p.load(), true); assert.deepEqual(f.state.garage.loadout, fitted);
    assert.deepEqual(f.state.garage.owned, owned);
    const before = snapshot(f), c = contract(methodId);
    assert.equal(f.p.previewContract(c).ok, false); assert.equal(f.p.acceptContract(c).ok, false);
    assert.equal(snapshot(f), before, 'refusal cannot charge, mutate inventory, issue identity or write');
    const slot = methodId === 'core' ? 'bit' : 'casing'; const oldId = chosen[slot];
    assert.equal(f.p.equip(slot, null).ok, true); assert.ok(f.state.garage.owned.includes(oldId));
    assert.equal(f.p.sell(oldId).ok, true, 'an unusable legacy part must remain sellable');
  });

  test(`${methodId} automatic loadout cannot grant or purchase missing compatible equipment`, async () => {
    const chosen = defaultLoadoutFor(methodId, 60);
    if (methodId === 'core') { chosen.bit = 'bit-core-bq-surf'; chosen.rod = 'barrel-nq-wl'; }
    else chosen.casing = 'sonic-shoe-carbide';
    const f = await fixture(methodId, { owned: Object.values(chosen).filter(Boolean), loadout: chosen });
    const money = f.state.player.money, owned = [...f.state.garage.owned], legacy = { ...f.state.garage.loadout };
    const missing = f.p.autoLoadout(methodId);
    assert.equal(f.state.player.money, money); assert.deepEqual(f.state.garage.owned, owned);
    assert.deepEqual(f.state.garage.loadout, legacy, 'manual legacy selection is not silently replaced by unavailable stock');
    assert.ok(Object.keys(missing).length, 'the UI must identify a required compatible purchase');
    assert.equal(f.p.previewContract(contract(methodId)).ok, false);
  });

  test(`${methodId} real staged purchases repair legacy selection without losing existing tools`, async () => {
    const chosen = defaultLoadoutFor(methodId, 60), valid = { ...chosen };
    const slot = methodId === 'core' ? 'bit' : 'casing';
    chosen[slot] = methodId === 'core' ? 'bit-core-bq-surf' : 'sonic-shoe-carbide';
    const f = await fixture(methodId, { owned: Object.values(chosen).filter(Boolean), loadout: chosen });
    assert.equal(f.p.previewContract(contract(methodId)).ok, false);
    const price = f.p.priceOf(valid[slot]), money = f.state.player.money;
    assert.equal(f.p.purchase(valid[slot]).ok, true); assert.equal(money - f.state.player.money, price);
    assert.equal(f.state.garage.loadout[slot], chosen[slot], 'buying a replacement is not consent to refit it');
    assert.equal(f.p.equip(slot, valid[slot]).ok, true);
    assert.ok(f.state.garage.owned.includes(chosen[slot]));
    assert.equal(f.p.previewContract(contract(methodId)).ok, true);
    assert.equal(f.p.acceptContract(contract(methodId)).ok, true); assert.ok(f.p.beginHole(contract(methodId))?.attemptId);
  });

  test(`${methodId} catalogue identifiers alone do not grant ownership or advertised readiness`, async () => {
    const chosen = defaultLoadoutFor(methodId, 60), f = await fixture(methodId, { loadout: chosen });
    const before = snapshot(f);
    assert.equal(f.p.equip('bit', chosen.bit).ok, false);
    assert.equal(f.p.previewContract(contract(methodId)).ok, false); assert.equal(f.p.acceptContract(contract(methodId)).ok, false);
    assert.equal(snapshot(f), before);
  });
}

test('owned automatic core fit chooses a complete NQ pair over individually stronger incompatible HQ stock', async () => {
  const valid = defaultLoadoutFor('core', 60);
  const owned = [...Object.values(valid).filter(Boolean), 'bit-core-hq-imp', 'barrel-hq-wl-hd', 'bit-core-bq-surf'];
  const f = await fixture('core', { owned, loadout: { ...valid, bit: 'bit-core-hq-imp', rod: 'barrel-hq-wl-hd' } });
  const money = f.state.player.money; const missing = f.p.autoLoadout('core');
  assert.equal(inspect('core', f.state.garage.loadout).ok, true); assert.equal(f.state.player.money, money);
  assert.deepEqual(f.state.garage.owned, owned); assert.deepEqual(missing, {});
});

const testStart = process.argv.includes('--start') || process.argv.includes('--start-only');
if (testStart) for (const methodId of ['core', 'sonic']) {
  test(`${methodId} actual simulator starts the purchased set and rejects a preserved incompatible legacy save without replacing its active attempt`, async () => {
    const f = await fixture(methodId); await purchaseDefaults(f, methodId); const c = contract(methodId);
    assert.equal(f.p.acceptContract(c).ok, true);
    const sim = createDrillSim({ state: f.state, bus: f.bus, progression: f.p });
    try {
      const started = sim.startHole(c); assert.ok(started); assert.equal(sim.active, true);
      assert.equal(started.programme.capacityBasis, methodId === 'core' ? 'inner-tube-length' : 'gameplay-run-limit');
      const slot = methodId === 'core' ? 'bit' : 'casing';
      const bad = methodId === 'core' ? 'bit-core-bq-surf' : 'sonic-shoe-carbide';
      // The current catalogue refuses new purchases/fits of this old stock.
      // Represent a real older saved fitting through serialized input, then
      // exercise the public load boundary. Never alter private sim state.
      assert.equal(f.p.save(), true); const legacy = JSON.parse(f.values.get(SAVE_KEY));
      legacy.garage.loadout[slot] = bad; legacy.garage.owned.push(bad);
      f.values.set(SAVE_KEY, JSON.stringify(legacy)); assert.equal(f.p.load(), true);
      assert.equal(f.state.garage.loadout[slot], bad);
      const before = snapshot(f), telemetry = JSON.stringify(sim.getTelemetry());
      assert.throws(() => sim.startHole(c), error => typeof error.code === 'string' && /core|sonic|sample/.test(error.code));
      assert.equal(snapshot(f), before, 'rejected start cannot allocate identity, discard a run or emit');
      assert.equal(JSON.stringify(sim.getTelemetry()), telemetry);
    } finally { sim.dispose(); }
  });
  test(`${methodId} mid-hole replacement refuses incompatible sample tools before beginning a trip`, async () => {
    const f = await fixture(methodId); await purchaseDefaults(f, methodId); const c = contract(methodId);
    assert.equal(f.p.acceptContract(c).ok, true);
    const sim = createDrillSim({ state: f.state, bus: f.bus, progression: f.p });
    try {
      sim.startHole(c);
      for (const id of methodId === 'core' ? ['bit-core-bq-surf', 'bit-core-hq-imp', 'does-not-exist'] : ['bit-core-nq-imp', 'sonic-shoe-carbide', 'does-not-exist']) {
        const before = snapshot(f), telemetry = JSON.stringify(sim.getTelemetry()); let result = null;
        sim.changeBit(id).then(value => { result = value; }); await Promise.resolve(); await Promise.resolve();
        assert.equal(result?.ok, false, `${id} must resolve refusal without waiting for a physical trip`);
        assert.equal(snapshot(f), before); assert.equal(JSON.stringify(sim.getTelemetry()), telemetry);
      }
    } finally { sim.dispose(); }
  });
}

const baselineFlag = process.argv.indexOf('--baseline');
if (baselineFlag >= 0) test('frozen baseline retains all unaffected defaults, item prices and operating stats', async () => {
  const before = await import(pathToFileURL(resolve(process.argv[baselineFlag + 1], 'src/game/data.js')).href);
  let comparisons = 0;
  for (const method of METHODS.filter(m => !['core', 'sonic'].includes(m.id))) for (let level = 1; level <= 60; level++) {
    assert.deepEqual(defaultLoadoutFor(method.id, level), before.defaultLoadoutFor(method.id, level), `${method.id}/${level}`); comparisons++;
  }
  assert.equal(comparisons, 1140);
  for (const item of ITEMS) {
    const old = before.getItem(item.id); if (!old) continue;
    assert.equal(item.price, old.price, `${item.id} price`); assert.deepEqual(item.stats, old.stats, `${item.id} stats`);
  }
});

if (process.argv.includes('--catalogue')) test('shop Fits your rig recommendations exclude sample parts with no compatible catalogue train', async () => {
  useGameData(gameData);
  const source = readFileSync(new URL('../src/ui/screens/shop.js', import.meta.url), 'utf8');
  const first = source.indexOf('  function frontListings('), last = source.indexOf('  /** A compact listing card', first);
  assert.ok(first >= 0 && last > first, 'extract actual front selection, not a copied recommendation algorithm');
  const scope = { shopListings, currentRig: () => gameData.getRig('core-rig'), level: () => 60,
    app: { money: () => 1e7 }, owned: () => false, equippedIn: () => null,
    price: listing => listing.basePrice, previewRefFor,
    supportFor: null };
  const supportStart = source.indexOf('  const supportFor ='), supportEnd = source.indexOf('  function refuseUnavailable', supportStart);
  assert.ok(supportStart >= 0 && supportEnd > supportStart, 'actual availability policy must be inspectable');
  scope.supportFor = new Function('checkEquipmentSupport', 'getItem', 'sampleItemSupport',
    `${source.slice(supportStart, supportEnd)}; return supportFor;`)(support.checkEquipmentSupport, getItem, gameData.sampleItemSupport);
  const front = new Function(...Object.keys(scope), `${source.slice(first, last)}; return frontListings();`)(...Object.values(scope));
  const impossible = [];
  for (const listing of front.list) {
    const item = getItem(listing.itemId); if (!['core-bit', 'wireline-barrel'].includes(item?.sampling?.role)) continue;
    const counterSlot = item.slot === 'bit' ? 'rod' : 'bit';
    const exists = ITEMS.some(other => other.slot === counterSlot && other.unlockLevel <= 60
      && inspect('core', { [item.slot]: item.id, [counterSlot]: other.id }).ok);
    if (!exists) impossible.push(item.id);
  }
  assert.deepEqual(impossible, [], `front shelf advertises parts that cannot form any stocked sample train: ${impossible}`);
});

let failed = 0;
const selectedCases = process.argv.includes('--start-only')
  ? cases.filter(({ name }) => /actual simulator|mid-hole replacement/.test(name)) : cases;
try {
  for (const { name, fn } of selectedCases) {
    try { await fn(); console.log(`PASS ${name}`); }
    catch (e) { failed++; console.error(`FAIL ${name}\n${e.stack}`); }
    finally { for (const f of [...alive]) close(f); }
  }
  console.log(`Sample loadout critic: ${selectedCases.length - failed}/${selectedCases.length} groups passed.`);
  console.log(testStart
    ? 'Boundary: actual start guards are checked; sampling lifecycle, rendered readiness and browser behavior remain separate acceptance.'
    : 'Boundary: sim.startHole/sample lifecycle is certified only after the separate consumer is assembled; this gate covers pure checks and career APIs.');
  if (failed) process.exitCode = 1;
} finally {
  for (const f of [...alive]) close(f);
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete globalThis.localStorage;
}
