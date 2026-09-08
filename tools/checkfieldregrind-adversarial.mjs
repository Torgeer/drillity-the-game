#!/usr/bin/env node
/** Independent public-API regression: no browser, mock completions or private
 * simulator-state writes. Senior resources and initial tool wear are fixtures.
 * Run: node tools/checkfieldregrind-adversarial.mjs
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS } from '../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY, SAVE_VERSION } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { CERTS, RIGS, METHODS, REGIONS, MAX_LEVEL, makeContract } from '../src/game/data.js';

const bit = 'bit-th-r32-45-std', grinder = 'ws-grinding-kit';
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
class MemoryStorage {
  values = new Map(); failures = new Map(); readFailures = new Set();
  getItem(k) {
    if (this.readFailures.has(k)) throw new Error('Independent per-slot read failure');
    return this.values.get(k) ?? null;
  }
  setItem(k, v) {
    if ((this.failures.get(k) ?? 0) > 0) {
      this.failures.set(k, this.failures.get(k) - 1); throw new Error('Independent quota fixture');
    }
    this.values.set(k, String(v));
  }
  removeItem(k) { this.values.delete(k); }
}
const alive = new Set();
const near = (a, b, why = '') => assert.ok(Math.abs(a - b) < 1e-9, `${why}: ${a} versus ${b}`);
async function fresh(store = new MemoryStorage(), senior = true) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus();
  const p = createProgression({ state, bus, rand: makeRandom(2909) });
  await p.init();
  const f = { state, bus, p, store }; alive.add(f);
  if (senior) {
    state.player.level = MAX_LEVEL; state.player.money = 10000000; state.player.skillPoints = 100;
    state.player.certs = CERTS.map(c => c.id);
    state.unlocked.rigs = RIGS.map(r => r.id);
    state.unlocked.methods = METHODS.map(m => m.id);
    state.unlocked.regions = REGIONS.map(r => r.id);
    assert.ok(p.selectRig('crawler-th').ok);
    for (const id of [bit, grinder]) assert.ok(p.purchase(id).ok);
    assert.ok(p.equip('bit', bit).ok); assert.ok(p.equip('workshop', grinder).ok);
    for (const id of ['ts.carbide-care', 'ts.thread-doctor', 'ts.field-regrind']) {
      assert.ok(p.spendSkillPoint(id).ok);
    }
    state.garage.condition[bit] = 0.51;
  }
  return f;
}
function close(f) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: f.store });
  f.p.dispose(); alive.delete(f);
}
function denied(f, id) {
  const before = structuredClone(f.p.serialise());
  const q = f.p.fieldRegrind(id);
  assert.equal(q.ok, false); assert.ok(q.reason);
  assert.deepEqual(f.p.serialise(), before, 'rejected action must not change persisted data');
}
function generatedTH() {
  const random = makeRandom(31415);
  for (let n = 0; n < 4000; n++) {
    const c = makeContract('nordic', 20, random);
    if (c.methodId === 'top-hammer') return c;
  }
  throw new Error('No generated top-hammer contract');
}

const cases = [];
function test(name, fn) { cases.push({ name, fn }); }

test('newer primary survives load, autosave and disposal with an older usable backup', async () => {
  const f = await fresh(); assert.ok(f.p.fieldRegrind().ok);
  const current = f.p.serialise(), future = structuredClone(current);
  future.version = SAVE_VERSION + 1; future.player.money += 424242;
  future.player.career.futureOnly = { completedJob: 'do-not-erase' };
  close(f);
  const raw = JSON.stringify(future);
  f.store.setItem(SAVE_KEY, raw); f.store.setItem(SAVE_BACKUP_KEY, JSON.stringify(current));
  const g = await fresh(f.store, false);
  g.p.addMoney(1, 'force an ordinary save'); g.p.update(2); close(g);
  assert.ok([...f.store.values.values()].includes(raw), 'newer payload must remain recoverable byte for byte');
});

test('a newer primary with no backup cannot be overwritten by a fresh-career autosave', async () => {
  const f = await fresh(); const future = f.p.serialise(); close(f);
  future.version = SAVE_VERSION + 1; future.player.name = 'Future career';
  const raw = JSON.stringify(future);
  f.store.setItem(SAVE_KEY, raw); f.store.removeItem(SAVE_BACKUP_KEY);
  const g = await fresh(f.store, false); g.p.addMoney(1); g.p.update(2); close(g);
  assert.ok([...f.store.values.values()].includes(raw), 'only copy of the newer career must survive');
});

test('a newer backup remains recoverable when a current primary is loaded and saved', async () => {
  const f = await fresh(); const current = f.p.serialise(), future = structuredClone(current); close(f);
  future.version = SAVE_VERSION + 1; future.player.money += 99;
  const raw = JSON.stringify(future);
  f.store.setItem(SAVE_KEY, JSON.stringify(current)); f.store.setItem(SAVE_BACKUP_KEY, raw);
  const g = await fresh(f.store, false); g.p.addMoney(2); g.p.update(2); close(g);
  assert.ok([...f.store.values.values()].includes(raw), 'backup rotation must preserve unsupported newer data');
});

test('v1 through v6 careers retain money, skill investment, fitted stock and worn condition', async () => {
  const f = await fresh(); const modern = f.p.serialise(); close(f);
  for (const version of [undefined, 0, 1, 2, 3, 4, 5, 6]) {
    const old = structuredClone(modern); old.version = version;
    delete old.player.career.fieldRegrinds;
    if (!version || version < 2) delete old.player.career;
    if (!version || version < 4) { delete old.contract; delete old.run; delete old.world.site; }
    if (!version || version < 5) delete old.settledContracts;
    if (!version || version < 6) delete old.identitySequence;
    const store = new MemoryStorage(); store.setItem(SAVE_KEY, JSON.stringify(old));
    const g = await fresh(store, false);
    assert.equal(g.state.player.money, modern.player.money, `v${version} money`);
    assert.deepEqual(g.state.player.skills, modern.player.skills);
    assert.deepEqual(g.state.garage, modern.garage);
    assert.deepEqual(g.state.player.career.fieldRegrinds, {});
    assert.ok(g.p.fieldRegrind().ok); near(g.state.garage.condition[bit], 0.63);
    close(g);
  }
});

test('corrupt history recovers the untouched valid backup and never backs up corrupt data', async () => {
  for (const badHistory of [null, [], false, 42, { [bit]: false }, { [bit]: 1 }]) {
    const f = await fresh(); assert.ok(f.p.fieldRegrind().ok);
    const good = f.p.serialise(), broken = structuredClone(good); close(f);
    broken.player.money += 155; broken.player.career.fieldRegrinds = badHistory;
    const rawGood = JSON.stringify(good);
    f.store.setItem(SAVE_KEY, JSON.stringify(broken)); f.store.setItem(SAVE_BACKUP_KEY, rawGood);
    const g = await fresh(f.store, false);
    assert.equal(g.state.player.money, good.player.money); denied(g);
    g.p.update(2);
    assert.equal(g.store.getItem(SAVE_BACKUP_KEY), rawGood);
    assert.equal(JSON.parse(g.store.getItem(SAVE_KEY)).player.career.fieldRegrinds[bit], true);
    close(g);
  }
});

test('newly required history corruption without a backup preserves the original career data', async () => {
  for (const change of [p => { delete p.player.career.fieldRegrinds; },
    p => { p.player.career.fieldRegrinds = null; }]) {
    const f = await fresh(); assert.ok(f.p.fieldRegrind().ok);
    const broken = f.p.serialise(); close(f); change(broken);
    const raw = JSON.stringify(broken);
    f.store.setItem(SAVE_KEY, raw); f.store.removeItem(SAVE_BACKUP_KEY);
    const g = await fresh(f.store, false); g.p.addMoney(1); g.p.update(2); close(g);
    assert.ok([...f.store.values.values()].includes(raw),
      'rejecting only the new history field must not erase the sole old career payload');
  }
});

test('malformed version objects cannot prevent a valid backup from loading', async () => {
  const f = await fresh(); assert.ok(f.p.fieldRegrind().ok);
  const good = f.p.serialise(), bad = structuredClone(good); close(f);
  bad.version = { valueOf: null, toString: null }; bad.player.money += 800;
  f.store.setItem(SAVE_KEY, JSON.stringify(bad));
  f.store.setItem(SAVE_BACKUP_KEY, JSON.stringify(good));
  const g = await fresh(f.store, false);
  assert.equal(g.state.player.money, good.player.money, 'valid backup must still load'); denied(g); close(g);
});

test('a failed primary read still loads a readable backup and preserves both slots', async () => {
  const f = await fresh(); assert.ok(f.p.fieldRegrind().ok);
  const good = f.p.serialise(), future = structuredClone(good); close(f);
  future.version = SAVE_VERSION + 1;
  const primaryRaw = JSON.stringify(future), backupRaw = JSON.stringify(good);
  f.store.setItem(SAVE_KEY, primaryRaw); f.store.setItem(SAVE_BACKUP_KEY, backupRaw);
  f.store.readFailures.add(SAVE_KEY);
  const g = await fresh(f.store, false);
  assert.equal(g.state.player.money, good.player.money, 'readable backup must remain usable');
  denied(g); assert.equal(g.p.save(), false);
  assert.equal(f.store.values.get(SAVE_KEY), primaryRaw);
  assert.equal(f.store.values.get(SAVE_BACKUP_KEY), backupRaw);
  close(g);
});

test('failed primary write retains treatment in memory and a retry reloads it once', async () => {
  const f = await fresh(); assert.ok(f.p.save());
  assert.ok(f.p.fieldRegrind().ok); f.store.failures.set(SAVE_KEY, 1);
  assert.equal(f.p.save(), false); denied(f); near(f.state.garage.condition[bit], 0.63);
  f.p.update(2); close(f);
  const g = await fresh(f.store, false); denied(g); near(g.state.garage.condition[bit], 0.63); close(g);
});

test('failed backup rotation cannot prevent the recovered condition and allowance from being saved', async () => {
  const f = await fresh(); assert.ok(f.p.save()); assert.ok(f.p.fieldRegrind().ok);
  f.store.failures.set(SAVE_BACKUP_KEY, 1); assert.equal(f.p.save(), true); close(f);
  const g = await fresh(f.store, false); denied(g); near(g.state.garage.condition[bit], 0.63); close(g);
});

test('changing rigs, unfitting, another purchase and service do not renew the used bit', async () => {
  const f = await fresh(); assert.ok(f.p.fieldRegrind().ok);
  assert.ok(f.p.selectRig('dth-crawler').ok); assert.ok(f.p.selectRig('crawler-th').ok);
  assert.ok(f.p.equip('bit', null).ok); assert.ok(f.p.equip('bit', bit).ok);
  assert.ok(f.p.purchase('ws-bit-grinder-hd').ok);
  assert.ok(f.p.equip('workshop', 'ws-bit-grinder-hd').ok);
  f.state.garage.condition['crawler-th'] = 0.5;
  assert.ok(f.p.serviceRig().ok); denied(f); close(f);
});

test('an unaffordable replacement cannot reset the allowance; a sold bit is not grindable', async () => {
  const f = await fresh(); assert.ok(f.p.fieldRegrind().ok);
  f.state.player.money = 0; assert.equal(f.p.purchase(bit).ok, false); denied(f);
  assert.ok(f.p.sell(bit).ok); denied(f, bit); close(f);
});

test('a paid replacement genuinely changes starting simulator wear and renews the one-use treatment', async () => {
  const f = await fresh(); assert.ok(f.p.fieldRegrind().ok);
  const before = f.state.player.money, quote = f.p.priceOf(bit);
  const purchase = f.p.purchase(bit); assert.ok(purchase.ok); assert.ok(quote > 0);
  near(before - f.state.player.money, quote); denied(f);
  const c = generatedTH(); assert.ok(f.p.acceptContract(c).ok);
  const sim = createDrillSim({ state: f.state, bus: f.bus, progression: f.p });
  sim.startHole(c); assert.ok(sim.active); near(sim.getTelemetry().wearTrue, 0);
  sim.abortHole('critic-finished'); sim.dispose(); f.p.abandonContract(); close(f);
});

test('actual simulator accepts restored condition, advances real wear and disallows maintenance during a job', async () => {
  const f = await fresh(); assert.ok(f.p.fieldRegrind().ok);
  const c = generatedTH(); assert.ok(f.p.acceptContract(c).ok);
  const sim = createDrillSim({ state: f.state, bus: f.bus, progression: f.p });
  sim.startHole(c); assert.ok(sim.active); near(sim.getTelemetry().wearTrue, 0.37);
  denied(f);
  const initialWear = sim.getTelemetry().wearTrue;
  for (let n = 0; n < 2400 && sim.active; n++) {
    const t = sim.getTelemetry();
    sim.setInput('feed', t.optimal.wob); sim.setInput('rotation', t.optimal.rpm);
    sim.setInput('flush', t.optimal.flush);
    sim.update(1 / 30);
    if (sim.getTelemetry().depth > 0.5) break;
  }
  const t = sim.getTelemetry();
  assert.ok(t.depth > 0.05, `actual drilling must penetrate, measured ${t.depth}`);
  assert.ok(t.wearTrue > initialWear, 'actual cutting must consume some restored condition');
  sim.abortHole('critic-finished'); sim.dispose(); f.p.abandonContract(); denied(f); close(f);
});

test('certificate-expiry and haptic reentry cannot repeat recovery or its clock charge', async () => {
  const f = await fresh(); const cert = CERTS.find(c => c.validityMonths > 0).id;
  f.state.player.career.daysElapsed = 0.999;
  f.state.player.career.certExpiry[cert] = 1;
  const h = f.state.player.career.hoursWorked, money = f.state.player.money;
  const nested = [];
  const off1 = f.bus.on(EVENTS.UNLOCK, e => {
    if (e.kind === 'cert-expired') nested.push(f.p.fieldRegrind());
  });
  const off2 = f.bus.on(EVENTS.HAPTIC, () => nested.push(f.p.fieldRegrind()));
  assert.ok(f.p.fieldRegrind().ok); off1(); off2();
  assert.equal(nested.length, 2); assert.ok(nested.every(r => !r.ok));
  near(f.state.player.career.hoursWorked - h, 1 / 3); near(f.state.garage.condition[bit], 0.63);
  assert.equal(f.state.player.money, money); assert.ok(!f.state.player.certs.includes(cert)); close(f);
});

test('exhausted or invalid bit condition never turns into recovery', async () => {
  for (const condition of [0, -0.1, NaN, Infinity, -Infinity, 1.01]) {
    const f = await fresh(); f.state.garage.condition[bit] = condition; denied(f); close(f);
  }
});

let failed = 0;
try {
  for (const { name, fn } of cases) {
    try { await fn(); console.log(`PASS ${name}`); }
    catch (e) { failed++; console.error(`FAIL ${name}\n${e.stack}`); }
    finally { for (const f of [...alive]) close(f); }
  }
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
console.log(`Independent field regrind: ${cases.length - failed}/${cases.length} groups passed`);
if (failed) process.exitCode = 1;
