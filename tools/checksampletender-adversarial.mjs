#!/usr/bin/env node
/** Independent core tender/accepted-save attacks. No GPU or production writes.
 * Funding is an explicit test fixture; XP, purchases, fitting, acceptance and
 * starts use public APIs. Core 75.7 is nominal NWL bore, not crown outside OD.
 * Sonic dimensional fit remains NOT SOURCED and is not approved by this gate.
 */
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { writeFileSync, mkdirSync, readFileSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import * as data from '../src/game/data.js';
import * as support from '../src/game/equipment-support.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { createGeology } from '../src/world/geology.js';
// Committed pre-tender-policy checkpoint. A fresh clone needs this historical
// object, not a reviewer-specific sibling worktree or mutable current HEAD.
const HISTORICAL_REVISION = '859fde2023e531d44e5ff334355e4d24e4c4d92c';
const baselineArg = process.argv.indexOf('--baseline');
const baselineRevisionArg = process.argv.indexOf('--baseline-revision');
const baselineRevision = baselineArg >= 0 ? null
  : baselineRevisionArg >= 0 ? process.argv[baselineRevisionArg + 1] : HISTORICAL_REVISION;
if (baselineRevision) assert.match(baselineRevision, /^[0-9a-f]{40}$/, 'Use an explicit complete historical commit ID');
const baselinePath = baselineArg >= 0 ? resolve(process.argv[baselineArg + 1])
  : mkdtempSync(resolve(tmpdir(), 'drillity-core-tender-'));
if (baselineRevision) {
  const archive = execFileSync('git', ['archive', '--format=tar', baselineRevision, 'src', 'package.json'], { maxBuffer: 32 * 1024 * 1024 });
  execFileSync('tar', ['-xf', '-', '-C', baselinePath], { input: archive });
}
const baselineData = await import(pathToFileURL(resolve(baselinePath, 'src/game/data.js')));
const baselineProgression = await import(pathToFileURL(resolve(baselinePath, 'src/game/progression.js')));
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
const canvasPath = process.argv.find(a => a.startsWith('--canvas='))?.slice(9);
const createCanvas = canvasPath ? createRequire(import.meta.url)(canvasPath).createCanvas : null;
const trackedSources = ['src/game/data.js', 'src/game/equipment-support.js', 'src/game/progression.js', 'src/sim/drilling.js',
  'src/game/economy.js', 'src/sim/sample-product.js', 'src/sim/sample-ledger.js', 'src/world/geology.js'];
const sourceHashes = () => Object.fromEntries(trackedSources.map(p => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]));
const startingHashes = sourceHashes();
const cases = [], active = new Set(), reports = [];
const test = (name, fn) => cases.push({ name, fn });
const clone = x => JSON.parse(JSON.stringify(x));
const install = s => Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: s });
function storage(initial) {
  const values = new Map(initial || []), writes = [];
  return { values, writes, getItem: k => values.get(k) ?? null,
    setItem(k, v) { writes.push(['set', k]); values.set(k, String(v)); },
    removeItem(k) { writes.push(['remove', k]); values.delete(k); } };
}
async function fixture({ methodId = 'core', level = 18, implementation = createProgression, store = storage(), saved = false,
  realGeology = false } = {}) {
  install(store);
  const state = createGameState(), bus = createBus(), ctx = { state, bus, rand: makeRandom(451), SCENES };
  const p = ctx.progression = implementation(ctx), events = [];
  if (realGeology) {
    assert.ok(createCanvas, '--canvas must supply an installed CPU canvas package');
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { hidden: false,
      createElement(tag) { assert.equal(tag, 'canvas'); return createCanvas(300, 150); } } });
    Object.assign(ctx, { viewport: { w: 390, h: 844, dpr: 1 }, quality: { anisotropy: 1 }, clock: { t: 0, dt: 0, frame: 0 } });
    ctx.geology = createGeology(ctx); await ctx.geology.init();
    ctx.sim = createDrillSim(ctx); await ctx.sim.init();
  }
  await p.init();
  if (!saved) {
    // Test funding does not model career affordability or change item prices.
    p.addMoney(1e8, 'Independent fixture funding');
    while (state.player.level < level) p.addXP(p.xpForLevel(state.player.level));
    assert.equal(state.player.level, level);
    const method = data.getMethod(methodId);
    const rig = method.rigIds.map(data.getRig).filter(r => r && r.unlockLevel <= level).sort((a, b) => a.price - b.price)[0];
    assert.ok(rig, `rig accessible at genuine ${methodId}/${level}`);
    assert.equal(p.purchaseRig(rig.id).ok, true, rig.id); assert.equal(p.selectRig(rig.id).ok, true);
    for (const [slot, id] of Object.entries(data.defaultLoadoutFor(methodId, level))) if (id) {
      if (!state.garage.owned.includes(id)) assert.equal(p.purchase(id).ok, true, id);
      assert.equal(p.equip(slot, id).ok, true, `${slot}/${id}`);
    }
  }
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  const f = { state, bus, ctx, p, store, events, sim: ctx.sim || null }; active.add(f); return f;
}
function close(f) { install(f.store); f.sim?.dispose(); f.ctx.geology?.dispose(); f.p.dispose(); active.delete(f); }
function snapshot(f) { return JSON.stringify({ state: f.state, run: f.p.run, saved: f.p.serialise(), events: f.events,
  storage: [...f.store.values], writes: f.store.writes, telemetry: f.sim?.getTelemetry() }); }
function unchanged(f, before, message) { assert.ok(snapshot(f) === before, message); }
function certificates(f, c) { for (const id of c.requiredCerts || []) if (!f.state.player.certs.includes(id)) {
  assert.equal(f.p.purchaseCert(id).ok, true, `${id} certificate`);
} }
function sim(f) { f.state.scene = SCENES.SITE; if (!f.sim) { f.sim = createDrillSim(f.ctx); f.sim.init(); } return f.sim; }
function boundary(holeDia = 75.7) { return { id: 'critic-short-core', title: 'Boundary fixture, not tender economics',
  methodId: 'core', regionId: 'nordic', applicationId: 'mineral-exploration', archetype: 'exploration-pad',
  targetDepth: 3.25, holes: 2, metres: 6.5, holeDia, payout: 10000,
  bonus: { time: 1000, quality: 1000 }, deadlineHours: 24, reputationReward: 10, requiredCerts: [],
  difficulty: 1, hardness: .2, abrasivity: .2, seed: 194, ground: [{ id: 'limestone', top: 0, bottom: 1000 }], flushMedium: 'water' }; }
function operate(f, limit = 240000) {
  for (let i = 0; i < limit; i++) {
    const t = f.sim.getTelemetry(); if (!t.active) return;
    f.sim.setInput('feed', t.optimal.wob); f.sim.setInput('rpm', t.optimal.rpm); f.sim.setInput('flush', t.optimal.flush);
    if (t.rodAdd && !t.rodAdd.hit && t.rodAdd.t >= t.rodAdd.windowStart && t.rodAdd.t <= t.rodAdd.windowEnd) f.sim.pulse('rodStab');
    for (const a of t.actions) if (a.enabled && a.id.startsWith('sample')) assert.equal(f.sim.pulse(a.id).ok, true);
    f.sim.update(1 / 60);
  }
  assert.fail('Public sampling operator timed out');
}
async function oldAccepted({ generated = false } = {}) {
  const f = await fixture({ implementation: baselineProgression.createProgression });
  const c = generated ? baselineData.makeContract('nordic', 18, makeRandom(857)) : boundary(96);
  assert.equal(c.methodId, 'core'); assert.notEqual(c.holeDia, 75.7);
  certificates(f, c); assert.equal(f.p.acceptContract(c).ok, true);
  assert.ok(f.p.beginHole(c)?.attemptId); assert.equal(f.p.save(), true);
  const saved = clone(f.p.serialise()), terms = clone(c), values = [...f.store.values]; close(f);
  return { saved, terms, values };
}

test('seeded offer sequence preserves every non-core tender and RNG stream; only intentional core gauge-priced terms vary', () => {
  let core = 0, ordinary = 0;
  for (const region of data.REGIONS) for (const level of [18, 42, 60]) for (const seed of [7, 81, 857]) {
    const aRand = makeRandom(seed), bRand = makeRandom(seed);
    for (let i = 0; i < 12; i++) {
      const a = data.makeContract(region.id, level, aRand), b = baselineData.makeContract(region.id, level, bRand);
      assert.equal(a.methodId, b.methodId); assert.equal(a.seed, b.seed); assert.equal(a.id, b.id);
      if (a.methodId !== 'core') { assert.deepEqual(a, b); ordinary++; }
      else {
        core++; assert.equal(a.holeDia, 75.7); const sa = clone(a), sb = clone(b);
        for (const key of ['holeDia', 'payout', 'bonus', 'description', 'sampleRequirement']) { delete sa[key]; delete sb[key]; }
        assert.deepEqual(sa, sb, 'No hidden deadline, workload, geology, region or reward tuning');
      }
    }
    assert.equal(aRand.f(), bRand.f(), 'Gauge selection cannot perturb later random offers');
  }
  assert.ok(core > 20); assert.ok(ordinary > 100); reports.push({ seededCore: core, unchangedOtherOffers: ordinary });
});

test('helper distinguishes sourced nominal NWL bore from core diameter, rounded nominal and unrelated gauges', () => {
  assert.equal(typeof support.checkSampleTender, 'function');
  const loadout = data.defaultLoadoutFor('core', 18);
  const c = boundary(); assert.equal(support.checkSampleTender(c, loadout, data.getItem).ok, true);
  for (const value of [47.6, 75, 76, 96, 100, 0, -1, null, undefined, '75.7', NaN, Infinity]) {
    const before = JSON.stringify(loadout);
    assert.equal(support.checkSampleTender({ ...c, holeDia: value }, loadout, data.getItem).ok, false, String(value));
    assert.equal(JSON.stringify(loadout), before);
  }
  const barrel = clone(data.getItem(loadout.rod)); barrel.sampling.holeDiameterMm = 96;
  assert.equal(support.checkSampleTender(c, loadout, id => id === barrel.id ? barrel : data.getItem(id)).ok, false);
  assert.equal(support.checkSampleTender(c, { ...loadout, bit: 'bit-core-hq-imp', rod: 'barrel-hq-wl-hd' }, data.getItem).ok, false);
});

for (const [methodId, level] of [['core', 18], ['sonic', 42]]) test(`${methodId} genuine unlock publicly buys and fits its train, accepts canonical generated offer and starts without editing its terms`, async () => {
  const f = await fixture({ methodId, level });
  try {
    const c = data.makeContract('nordic', level, makeRandom(857)); assert.equal(c.methodId, methodId);
    certificates(f, c); const terms = clone(c), before = snapshot(f);
    assert.equal(f.p.previewContract(c).ok, true); assert.equal(snapshot(f), before);
    assert.equal(f.p.acceptContract(c).ok, true); assert.deepEqual(f.state.contract, terms);
    sim(f).startHole(c); assert.equal(f.sim.getTelemetry().active, true); assert.ok(f.p.run.attemptId);
    assert.deepEqual(f.state.contract, terms); reports.push({ realUnlock: level, methodId, holeDia: c.holeDia, targetDepth: c.targetDepth });
  } finally { close(f); }
});

test('wrong/malformed new core diameter cannot preview, charge, publish or create an attempt', async () => {
  const f = await fixture();
  try {
    for (const value of [96, 47.6, '75.7', null, undefined, NaN, Infinity]) {
      const c = boundary(value); if (value === undefined) delete c.holeDia;
      const before = snapshot(f); assert.equal(f.p.previewContract(c).ok, false);
      assert.equal(f.p.acceptContract(c).ok, false); assert.equal(snapshot(f), before);
    }
    sim(f); const before = snapshot(f);
    assert.throws(() => f.sim.startHole(boundary(96))); assert.equal(snapshot(f), before);
  } finally { close(f); }
});

test('direct method string, method row, rig, site and unlocked fallback starts cannot evade core tender sizing', async () => {
  for (const via of ['string', 'row', 'rig', 'site', 'unlocked']) {
    const f = await fixture();
    try {
      const c = boundary(96); delete c.methodId;
      if (via === 'string') c.method = 'core';
      if (via === 'row') c.method = data.getMethod('core');
      if (via === 'rig') f.ctx.rig = { methodId: 'core' };
      if (via === 'site') f.state.world.site = { methodId: 'core' };
      sim(f); const before = snapshot(f);
      assert.throws(() => f.sim.startHole(c), error => error.code === 'sample-tender-diameter-mismatch', via);
      unchanged(f, before, `${via} refusal must precede any allocation or telemetry reset`);
    } finally { close(f); }
  }
});

test('caller requirement and legacy flags never override actual new tender diameter', async () => {
  const f = await fixture();
  try {
    for (const extras of [{ legacySamplingTerms: true }, { samplingFitPolicy: 0 },
      { sampleRequirement: { family: 'NQ', holeDiameterMm: 75.7 } },
      { tenderFitBasis: 'legacy-accepted-terms' }]) {
      const c = { ...boundary(96), ...extras }, before = snapshot(f);
      assert.equal(f.p.previewContract(c).ok, false); assert.equal(f.p.acceptContract(c).ok, false); unchanged(f, before);
    }
  } finally { close(f); }
});

test('new accepted core snapshots do not alias caller tender; same-ID restarts retain canonical terms', async () => {
  const f = await fixture();
  try {
    const c = boundary(), expected = clone(c); assert.equal(f.p.acceptContract(c).ok, true);
    c.holeDia = 96; c.payout = 1e9; c.bonus.time = 1e9; c.targetDepth = 1;
    assert.deepEqual(f.state.contract, expected, 'Acceptance must detach and freeze terms before callers can alter them');
    sim(f).startHole(f.state.contract); const money = f.state.player.money, runId = f.p.run.runId;
    try { f.sim.startHole(c); } catch { /* Refusal or existing explicit retry semantics are acceptable. */ }
    assert.deepEqual(f.state.contract, expected); assert.deepEqual(f.p.run.contract, expected);
    assert.equal(f.sim.getTelemetry().target, expected.targetDepth);
    assert.equal(f.p.run.runId, runId); assert.equal(f.state.player.money, money);
    assert.deepEqual(f.events.filter(e => e.event === EVENTS.DRILL_START).at(-1).payload.contract, expected);
  } finally { close(f); }
});

test('pre-policy actually accepted save retains every term and resumes with fresh identity; allowance survives second save/load', async () => {
  const old = await oldAccepted({ generated: true }); let f = await fixture({ store: storage(old.values), saved: true });
  try {
    assert.deepEqual(f.state.contract, old.terms); const spent = f.state.player.money;
    sim(f).startHole(f.state.contract); assert.equal(f.sim.getTelemetry().active, true);
    assert.notEqual(f.p.run.attemptId, old.saved.run.attemptId); assert.equal(f.state.player.money, spent);
    assert.equal(f.p.save(), true); const values = [...f.store.values], attempt = f.p.run.attemptId; close(f);
    f = await fixture({ store: storage(values), saved: true }); assert.deepEqual(f.state.contract, old.terms);
    sim(f).startHole(f.state.contract); assert.notEqual(f.p.run.attemptId, attempt);
    assert.equal(f.state.player.money, spent); assert.deepEqual(f.state.contract, old.terms);
  } finally { close(f); }
});

test('old dimensional exception is tied to exact accepted terms and cannot authorize another same-ID proposal', async () => {
  const old = await oldAccepted(), f = await fixture({ store: storage(old.values), saved: true });
  try {
    sim(f).startHole(f.state.contract); const money = f.state.player.money;
    try { f.sim.startHole({ ...old.terms, targetDepth: 1, payout: 1e9 }); } catch { }
    assert.deepEqual(f.p.run.contract, old.terms); assert.deepEqual(f.state.contract, old.terms);
    assert.equal(f.sim.getTelemetry().target, old.terms.targetDepth); assert.equal(f.state.player.money, money);
    assert.equal(f.p.abandonContract().ok, true);
    const declined = snapshot(f); assert.equal(f.p.acceptContract(old.terms).ok, false); assert.equal(snapshot(f), declined);
  } finally { close(f); }
});

test('public run contract replacement cannot redefine a privately accepted core tender', async () => {
  const f = await fixture();
  try {
    assert.equal(f.p.acceptContract(boundary()).ok, true); sim(f).startHole(f.state.contract);
    const forged = { ...clone(f.state.contract), targetDepth: 1, payout: 1e9 };
    try { f.p.run.contract = forged; } catch { /* Immutable public reference also satisfies the boundary. */ }
    f.state.contract = forged;
    const before = snapshot(f);
    assert.equal(f.p.beginHole(forged), null);
    assert.throws(() => f.sim.startHole(forged)); unchanged(f, before, 'Refusal must precede new identity or simulation reset');
  } finally { close(f); }
});

test('saving a replaced public state.contract cannot launder different terms into the same accepted core run', async () => {
  let f = await fixture();
  try {
    const c = boundary(), expected = clone(c); assert.equal(f.p.acceptContract(c).ok, true); sim(f).startHole(f.state.contract);
    f.state.contract = { ...clone(c), payout: 1e9, targetDepth: 1 };
    const saved = f.p.save();
    if (saved) {
      const values = [...f.store.values]; close(f); f = await fixture({ store: storage(values), saved: true });
      assert.deepEqual(f.state.contract, expected, 'Persist only the privately accepted terms');
      sim(f).startHole(f.state.contract); assert.equal(f.sim.getTelemetry().target, expected.targetDepth);
    } else assert.ok(!f.store.values.has(SAVE_KEY), 'Refusal must not write altered accepted terms');
  } finally { close(f); }
});

test('board cache and refresh preserve earlier accepted core terms independently', async () => {
  const f = await fixture();
  try {
    let offer = null;
    for (let i = 0; i < 20 && !offer; i++) offer = f.p.refreshContracts().find(c => c.methodId === 'core');
    assert.ok(offer, 'Public board offers core at level18'); const terms = clone(offer);
    assert.equal(offer.holeDia, 75.7); certificates(f, offer);
    assert.equal(f.p.acceptContract(offer).ok, true);
    offer.holeDia = 96; offer.payout = 1e9; offer.bonus.quality = 1e9;
    f.p.refreshContracts(); assert.deepEqual(f.state.contract, terms); sim(f).startHole(f.state.contract);
    assert.equal(f.sim.getTelemetry().target, terms.targetDepth); assert.deepEqual(f.p.run.contract, terms);
  } finally { close(f); }
});

test('public legacy booleans and modern saved mismatches cannot opt new core work out of fit policy', async () => {
  const old = await oldAccepted();
  for (const policy of [1, 2, '1', null]) {
    const payload = clone(old.saved); payload.samplingFitPolicy = policy; payload.run.legacySamplingTerms = false;
    const store = storage([[SAVE_KEY, JSON.stringify(payload)]]), f = await fixture({ store, saved: true });
    try {
      assert.deepEqual(f.state.contract, old.terms);
      f.p.run.legacySamplingTerms = true; // No public flag grants the private exception.
      sim(f); const before = snapshot(f); assert.throws(() => f.sim.startHole(f.state.contract)); unchanged(f, before);
      assert.equal(f.p.serialise().run.legacySamplingTerms, false);
      assert.equal(f.p.abandonContract().ok, true); assert.equal(f.p.acceptContract(boundary()).ok, true);
    } finally { close(f); }
  }
});

test('an old unaccepted contract without a persisted run identity does not receive accepted-job protection', async () => {
  const old = await oldAccepted();
  for (const r of [null, {}, { ...old.saved.run, runId: null }, { ...old.saved.run, runId: '7' }]) {
    const payload = clone(old.saved); payload.run = r;
    const f = await fixture({ store: storage([[SAVE_KEY, JSON.stringify(payload)]]), saved: true });
    try {
      // Invalid identity strings can reject the whole payload before restore;
      // missing identities may retain the job but grant no legacy exception.
      if (!f.state.contract) assert.ok(f.p.getSaveBlockStatus());
      sim(f); const before = snapshot(f); assert.throws(() => f.sim.startHole(f.state.contract || old.terms)); unchanged(f, before);
    }
    finally { close(f); }
  }
});

test('unrelated start cannot abort an active accepted core attempt or overwrite its world site', async () => {
  const old = await oldAccepted(), f = await fixture({ store: storage(old.values), saved: true });
  try {
    sim(f).startHole(f.state.contract); const before = snapshot(f);
    assert.throws(() => f.sim.startHole({ ...boundary(), id: 'unaccepted-unrelated' })); unchanged(f, before);
    assert.throws(() => f.sim.startHole({ ...boundary(), methodId: 'sonic', id: 'unaccepted-unrelated' })); unchanged(f, before);
  } finally { close(f); }
});

test('legacy dimensional allowance cannot bypass component family checks or mid-hole changeBit guard', async () => {
  const old = await oldAccepted(), f = await fixture({ store: storage(old.values), saved: true });
  try {
    sim(f).startHole(f.state.contract); const before = snapshot(f);
    const result = await f.sim.changeBit('bit-core-hq-imp'); assert.equal(result.ok, false); assert.equal(snapshot(f), before);
    assert.equal(f.p.save(), true); const payload = JSON.parse(f.store.values.get(SAVE_KEY));
    payload.garage.owned.push('bit-core-bq-surf'); payload.garage.loadout.bit = 'bit-core-bq-surf';
    f.store.values.set(SAVE_KEY, JSON.stringify(payload)); assert.equal(f.p.load(), true);
    const bad = snapshot(f); assert.throws(() => f.sim.startHole(f.state.contract)); assert.equal(snapshot(f), bad);
  } finally { close(f); }
});

test('legacy two-hole job finishes through actual drilling once, keeps old money terms, and clears its exemption', async () => {
  const old = await oldAccepted(), f = await fixture({ store: storage(old.values), saved: true });
  try {
    const completed = []; f.bus.on(EVENTS.HOLE_COMPLETE, event => completed.push(event));
    for (let i = 0; i < old.terms.holes; i++) { sim(f).startHole(f.state.contract); operate(f); }
    assert.equal(completed.length, 2); assert.equal(f.p.run, null); assert.equal(f.state.contract, null);
    for (const result of completed) assert.ok(f.p.settlementForCompletion(result)?.sampleProduct);
    const before = snapshot(f); for (const result of completed) f.p.completeHole(result);
    assert.equal(snapshot(f), before, 'Captured completion replay cannot pay twice');
    assert.equal(f.p.acceptContract(old.terms).ok, false);
    assert.equal(f.p.acceptContract(boundary()).ok, true, 'A new supported job remains usable after legacy settlement');
  } finally { close(f); }
});

test('New Career clears private accepted terms and legacy protection before save and reload', async () => {
  const old = await oldAccepted();
  for (const legacy of [false, true]) {
    let f = legacy ? await fixture({ store: storage(old.values), saved: true }) : await fixture();
    try {
      if (!legacy) assert.equal(f.p.acceptContract(boundary()).ok, true);
      sim(f).startHole(f.state.contract); assert.equal(f.p.reset(), true);
      assert.equal(f.p.run, null); assert.equal(f.state.contract, null); assert.equal(f.p.serialise().contract, null);
      assert.equal(f.p.save(), true); const values = [...f.store.values]; close(f);
      f = await fixture({ store: storage(values), saved: true });
      assert.equal(f.state.contract, null); assert.equal(f.p.run, null); assert.equal(f.p.serialise().contract, null);
      assert.equal(f.state.player.level, 1);
    } finally { close(f); }
  }
});

test('documented v4/v5 pre-identity accepted jobs migrate without stranding prior terms or losing partial work', async () => {
  const old = await oldAccepted();
  for (const version of [4, 5]) {
    // Synthetic historical-schema fixture derived from the committed migration
    // definitions; this is not claimed to be an archived player's actual file.
    const payload = clone(old.saved); payload.version = version;
    delete payload.identitySequence; delete payload.run.runId; delete payload.run.attemptId;
    delete payload.run.legacySamplingTerms; delete payload.samplingFitPolicy;
    payload.run.holesDone = 1; payload.run.revenue = 5000; payload.run.costs = 400;
    payload.run.mobilisation = 1270; payload.player.money -= 1270;
    payload.player.career.holesThisContract = 1; delete payload.player.career.fieldRegrinds;
    let f = await fixture({ store: storage([[SAVE_KEY, JSON.stringify(payload)]]), saved: true });
    try {
      assert.deepEqual(f.state.contract, old.terms); assert.equal(f.p.run.holesDone, 1);
      assert.equal(f.p.run.revenue, 5000); assert.equal(f.p.run.costs, 400); assert.equal(f.p.run.mobilisation, 1270);
      const money = f.state.player.money; sim(f).startHole(f.state.contract);
      assert.equal(f.state.player.money, money); assert.ok(f.p.run.runId > 0); assert.ok(f.p.run.attemptId > 0);
      assert.equal(f.p.save(), true); const values = [...f.store.values]; close(f);
      f = await fixture({ store: storage(values), saved: true }); assert.deepEqual(f.state.contract, old.terms);
      assert.equal(f.p.run.holesDone, 1); assert.equal(f.p.run.mobilisation, 1270);
      const completions = []; f.bus.on(EVENTS.HOLE_COMPLETE, e => completions.push(e));
      sim(f).startHole(f.state.contract); operate(f);
      assert.equal(completions.length, 1); assert.equal(f.p.run, null); assert.equal(f.state.contract, null);
      assert.ok(f.p.settlementForCompletion(completions[0])?.sampleProduct);
    } finally { close(f); }
  }
});

test('older version alone cannot convert a missing or empty run into an accepted dimensional exception', async () => {
  const old = await oldAccepted();
  for (const version of [4, 5]) for (const run of [null, {}]) {
    const payload = clone(old.saved); payload.version = version; payload.run = run;
    delete payload.identitySequence; delete payload.player.career.fieldRegrinds;
    const f = await fixture({ store: storage([[SAVE_KEY, JSON.stringify(payload)]]), saved: true });
    try {
      sim(f); const before = snapshot(f); assert.throws(() => f.sim.startHole(f.state.contract || old.terms)); unchanged(f, before);
    } finally { close(f); }
  }
});

if (canvasPath) {
  test('actual geology receives the private accepted core snapshot and its public start uses real strata', async () => {
    const f = await fixture({ realGeology: true });
    try {
      const c = data.makeContract('nordic', 18, makeRandom(857)); certificates(f, c);
      assert.equal(f.p.acceptContract(c).ok, true); const accepted = f.state.contract;
      assert.notEqual(accepted, c); assert.equal(f.p.run.contract, accepted);
      assert.equal(f.events.find(e => e.event === EVENTS.CONTRACT_ACCEPT).payload.contract, accepted);
      assert.equal(f.ctx.geology.spec.seed, accepted.seed); assert.equal(f.ctx.geology.spec.methodId, 'core');
      assert.equal(f.state.world.strata, f.ctx.geology.strata); assert.ok(f.ctx.geology.strata.length);
      const profile = JSON.stringify(f.ctx.geology.strata);
      c.seed++; c.holeDia = 96; c.groundSpec[0].id = 'sand';
      assert.equal(JSON.stringify(f.ctx.geology.strata), profile); assert.equal(f.ctx.geology.spec.seed, accepted.seed);
      sim(f).startHole(c); assert.equal(f.sim.debug.state.syntheticGeology, false);
      assert.equal(f.sim.getTelemetry().target, accepted.targetDepth);
      assert.equal(f.sim.getTelemetry().stratum.id, f.ctx.geology.strata[0].id);
    } finally { close(f); }
  });
  test('actual geology restores accepted legacy core terms before sim start without borrowing the auger soil exception', async () => {
    const old = await oldAccepted({ generated: true });
    const f = await fixture({ store: storage(old.values), saved: true, realGeology: true });
    try {
      assert.deepEqual(f.state.contract, old.terms); assert.equal(f.p.run.contract, f.state.contract);
      assert.equal(f.ctx.geology.spec.seed, old.terms.seed); assert.equal(f.ctx.geology.spec.methodId, 'core');
      assert.equal(f.state.world.strata, f.ctx.geology.strata);
      sim(f).startHole(f.state.contract); assert.equal(f.sim.debug.state.syntheticGeology, false);
      assert.equal(f.sim.getTelemetry().target, old.terms.targetDepth);
    } finally { close(f); }
  });
}

let failed = 0;
try {
  for (const c of cases) { try { await c.fn(); console.log(`PASS ${c.name}`); reports.push({ name: c.name, ok: true }); }
    catch (e) { failed++; console.error(`FAIL ${c.name}\n${e.stack}`); reports.push({ name: c.name, ok: false, error: String(e.stack) }); }
    finally { for (const f of [...active]) close(f); } }
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete globalThis.localStorage;
  if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument); else delete globalThis.document;
}
const hashes = sourceHashes(), sourceStable = JSON.stringify(hashes) === JSON.stringify(startingHashes);
mkdirSync('evidence/sample-tender-critic', { recursive: true });
writeFileSync('evidence/sample-tender-critic/results.json', JSON.stringify({ passed: cases.length - failed, failed, reports, hashes, startingHashes, sourceStable,
  baselineRevision, baselinePath, actualGeology: !!canvasPath,
  limits: 'CPU public APIs and simulation only. No browser, GPU, phone or sonic dimensional clearance verification.' }, null, 2) + '\n');
console.log(JSON.stringify({ passed: cases.length - failed, failed, sourceStable, hashes }));
if (failed || !sourceStable) process.exitCode = 1;
