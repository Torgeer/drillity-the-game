/** Core tender fit through real generation, career save/load and simulation.
 * Short physical runs and supplied funds isolate this boundary, not career balance.
 */
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname, sep } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import * as data from '../src/game/data.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { checkSampleTender } from '../src/game/equipment-support.js';
import { createDrillSim } from '../src/sim/drilling.js';

// Keep the control reproducible after this patch is committed. An explicit
// --baseline still reproduces the original isolated candidate's frozen input.
const baselineFlag = process.argv.indexOf('--baseline');
const baselineRevision = '859fde2023e531d44e5ff334355e4d24e4c4d92c';
let temporaryBaseline = null;
function removeTemporaryBaseline() {
  if (!temporaryBaseline) return;
  const allowedRoot = resolve(tmpdir()) + sep;
  const target = resolve(temporaryBaseline);
  assert.ok(target.startsWith(allowedRoot) && target.slice(allowedRoot.length).startsWith('drillity-core-baseline-'));
  rmSync(target, { recursive: true, force: true }); temporaryBaseline = null;
}
function historicalBaseline() {
  if (baselineFlag >= 0) {
    assert.ok(process.argv[baselineFlag + 1], '--baseline needs a source directory');
    return resolve(process.argv[baselineFlag + 1]);
  }
  const cwd = fileURLToPath(new URL('../', import.meta.url));
  temporaryBaseline = mkdtempSync(join(tmpdir(), 'drillity-core-baseline-'));
  process.once('exit', removeTemporaryBaseline);
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', baselineRevision, '--', 'src', 'package.json'],
    { cwd, encoding: 'utf8' }).trim().split(/\r?\n/);
  assert.ok(paths.includes('src/game/data.js') && paths.includes('src/game/progression.js'));
  for (const path of paths) {
    assert.ok((path.startsWith('src/') || path === 'package.json') && !path.split('/').includes('..'));
    const target = join(temporaryBaseline, path); mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, execFileSync('git', ['show', `${baselineRevision}:${path}`], { cwd, maxBuffer: 8 * 1024 * 1024 }));
  }
  console.log(`Historical baseline: committed ${baselineRevision}`);
  return temporaryBaseline;
}
const baseline = historicalBaseline();
const oldData = await import(pathToFileURL(resolve(baseline, 'src/game/data.js')));
const oldProgression = await import(pathToFileURL(resolve(baseline, 'src/game/progression.js')));
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const cases = [], measurements = { generatedCore: 0, unchangedOther: 0, defaultChoices: 0 };
const test = (name, fn) => cases.push({ name, fn });
const clone = x => structuredClone(x);
function storage() {
  const values = new Map(), writes = [];
  return { values, writes, getItem: k => values.get(k) ?? null,
    setItem(k, v) { values.set(k, String(v)); writes.push(k); }, removeItem: k => values.delete(k) };
}
async function career({ store = storage(), previous = false, prepare = true } = {}) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  const state = createGameState(), bus = createBus(), ctx = { state, bus, SCENES, rand: makeRandom(181) };
  const p = ctx.progression = (previous ? oldProgression.createProgression : createProgression)(ctx);
  await p.init();
  if (prepare) {
    p.addXP(data.LEVELS.cumulative[59], 'fixture senior XP'); p.addMoney(1e8, 'fixture purchasing funds');
    assert.equal(p.purchaseRig('core-rig').ok, true); assert.equal(p.selectRig('core-rig').ok, true);
    for (const [slot, id] of Object.entries(data.defaultLoadoutFor('core', 60))) {
      if (!id) continue; assert.equal(p.purchase(id).ok, true); assert.equal(p.equip(slot, id).ok, true);
    }
    assert.equal(p.save(), true);
  }
  return { state, bus, p, ctx, store, close() { this.sim?.dispose(); p.dispose(); } };
}
function tender(holeDia = data.getItem(data.defaultLoadoutFor('core', 60).bit).sampling.holeDiameterMm) {
  return { id: 'core-tender-fit', title: 'Short boundary fixture', methodId: 'core', regionId: 'nordic',
    applicationId: 'mineral-exploration', archetype: 'exploration-pad', targetDepth: 1, holes: 1, metres: 1,
    holeDia, payout: 12345, bonus: { time: 345, quality: 456 }, deadlineHours: 24, reputationReward: 10,
    requiredCerts: [], difficulty: 1, hardness: .2, abrasivity: .2, seed: 194, flushMedium: 'water' };
}
function start(f, contract = f.state.contract) {
  f.state.scene = SCENES.SITE;
  const sim = f.sim = createDrillSim(f.ctx); sim.init(); sim.startHole(contract); return sim;
}
function finish(f) {
  let completion = null; f.bus.on(EVENTS.HOLE_COMPLETE, payload => { completion = payload; });
  for (let tick = 0; tick < 80000; tick++) {
    const t = f.sim.getTelemetry();
    if (!t.active) break;
    f.sim.setInput('feed', t.optimal.wob); f.sim.setInput('rpm', t.optimal.rpm); f.sim.setInput('flush', t.optimal.flush);
    if (t.rodAdd && !t.rodAdd.hit && t.rodAdd.t >= t.rodAdd.windowStart && t.rodAdd.t <= t.rodAdd.windowEnd) f.sim.pulse('rodStab');
    for (const action of t.actions) if (action.enabled && action.id.startsWith('sample')) assert.equal(f.sim.pulse(action.id).ok, true);
    f.sim.update(1 / 60);
  }
  assert.ok(completion, 'actual sampling run reaches handled completion');
  assert.ok(f.p.settlementForCompletion(completion)?.sampleProduct, 'real handled sample yields an accepted receipt');
  return completion;
}

test('generated core offers use stocked gauge at every unlocked level without random-stream drift', () => {
  const levelsSeen = new Set();
  for (let level = 18; level <= 60; level++) {
    const current = makeRandom(371), prior = makeRandom(371);
    for (let n = 0; n < 80; n++) {
      const c = data.makeContract('nordic', level, current), before = oldData.makeContract('nordic', level, prior);
      assert.equal(current.f(), prior.f(), 'RNG stream remains aligned after every offer');
      if (c.methodId !== 'core') { assert.deepEqual(c, before); measurements.unchangedOther++; }
      else {
        const fit = checkSampleTender(c, data.defaultLoadoutFor('core', level), data.getItem);
        assert.equal(fit.ok, true); assert.equal(c.holeDia, data.getItem('bit-core-nq-imp').sampling.holeDiameterMm);
        const a = clone(c), b = clone(before);
        // New offers keep the existing price formula, now evaluated at their real gauge.
        for (const key of ['holeDia', 'description', 'payout', 'bonus']) { delete a[key]; delete b[key]; }
        assert.deepEqual(a, b, 'identity, geology, workload and other commercial terms stay deterministic');
        measurements.generatedCore++; levelsSeen.add(level);
      }
    }
  }
  assert.equal(levelsSeen.size, 43); assert.ok(measurements.unchangedOther > 1000);
});

test('every current method/level default is unchanged, including sonic', () => {
  for (const method of data.METHODS) for (let level = 1; level <= 60; level++) {
    assert.deepEqual(data.defaultLoadoutFor(method.id, level), oldData.defaultLoadoutFor(method.id, level));
    measurements.defaultChoices++;
  }
  assert.equal(measurements.defaultChoices, 1260);
});

test('core helper refuses malformed diameter and actual mismatches without inventing sonic fit', () => {
  const loadout = data.defaultLoadoutFor('core', 60);
  for (const holeDia of [undefined, null, '75.7', 0, -1, NaN, Infinity, 106, 96]) {
    assert.equal(checkSampleTender({ methodId: 'core', holeDia }, loadout, data.getItem).ok, false);
  }
  const sonic = checkSampleTender({ methodId: 'sonic', holeDia: 116 }, data.defaultLoadoutFor('sonic', 60), data.getItem);
  assert.equal(sonic.ok, true); assert.equal(sonic.holeDiameterMm, undefined, 'no sonic dimensional claim');
});

test('preview and acceptance refuse mismatches with no costs, events, pending save or cache mutation', async () => {
  const f = await career();
  try {
    const board = f.p.getContracts(), boardBefore = clone(board), before = clone(f.p.serialise()), writes = f.store.writes.length;
    let events = 0; for (const e of Object.values(EVENTS)) f.bus.on(e, () => events++);
    assert.equal(f.p.previewContract(tender(106)).code, 'sample-tender-diameter-mismatch');
    assert.equal(f.p.acceptContract(tender(106)).ok, false); f.p.update(2);
    assert.deepEqual(f.p.serialise(), before); assert.equal(f.store.writes.length, writes); assert.equal(events, 0);
    assert.equal(f.p.getContracts(), board); assert.deepEqual(board, boardBefore);
  } finally { f.close(); }
});

test('new accepted core terms are immutable and same-ID proposals cannot replace them on start', async () => {
  const f = await career();
  try {
    const offer = tender(), expected = clone(offer);
    assert.equal(f.p.acceptContract(offer).ok, true);
    offer.holeDia = 106; offer.targetDepth = 999; offer.bonus.time = 1e9;
    assert.deepEqual(f.state.contract, expected); assert.ok(Object.isFrozen(f.state.contract.bonus));
    start(f, offer); assert.deepEqual(f.sim.debug.state.contract, expected);
    assert.equal(f.sim.debug.state.contract.targetDepth, expected.targetDepth);
    assert.throws(() => { f.p.run.contract = offer; }, TypeError, 'public run cannot replace paid core terms');
    assert.equal(f.p.serialise().run.legacySamplingTerms, false);
    finish(f);
  } finally { f.close(); }
});

test('an unpaid direct simulator mismatch refuses before any attempt exists', async () => {
  const f = await career();
  try {
    const before = clone(f.p.serialise());
    assert.throws(() => start(f, tender(106)), e => e.code === 'sample-tender-diameter-mismatch');
    assert.deepEqual(f.p.serialise(), before); assert.equal(f.p.run, null);
    f.sim.dispose();
    const fallback = { ...tender(106), method: 'core' }; delete fallback.methodId;
    assert.throws(() => start(f, fallback), e => e.code === 'sample-tender-diameter-mismatch');
    assert.deepEqual(f.p.serialise(), before); assert.equal(f.p.run, null);
  } finally { f.close(); }
});

test('actually accepted old mismatched core work survives repeated save/load and completes on its exact terms', async () => {
  const prior = await career({ previous: true }), original = tender(106);
  assert.equal(prior.p.acceptContract(original).ok, true); assert.equal(prior.p.save(), true);
  const oldMoney = prior.state.player.money, stored = prior.store;
  assert.equal(JSON.parse(stored.getItem(SAVE_KEY)).samplingFitPolicy, undefined);
  prior.close();
  let f = await career({ store: stored, prepare: false });
  try {
    assert.deepEqual(f.state.contract, original); assert.equal(f.state.player.money, oldMoney);
    assert.equal(f.p.checkSamplingStart(f.state.contract).tenderFitBasis, 'legacy-accepted-terms');
    assert.equal(f.p.checkSamplingStart({ ...original, id: 'other' }).ok, false);
    assert.equal(f.p.save(), true); assert.equal(f.p.serialise().run.legacySamplingTerms, true);
    f.close(); f = await career({ store: stored, prepare: false });
    assert.deepEqual(f.state.contract, original); assert.equal(f.state.player.money, oldMoney);
    start(f); const payload = finish(f);
    assert.deepEqual(payload.contract, original); assert.equal(f.state.contract, null);
    assert.equal(f.p.acceptContract(tender(106)).ok, false, 'closed legacy terms never authorize new work');
  } finally { f.close(); }
});

test('new saves and public run flags cannot acquire a legacy allowance', async () => {
  const f = await career();
  try {
    assert.equal(f.p.acceptContract(tender()).ok, true);
    f.p.run.legacySamplingTerms = true;
    assert.equal(f.p.serialise().run.legacySamplingTerms, false);
    const saved = clone(f.p.serialise()); saved.contract.holeDia = 106;
    f.store.setItem(SAVE_KEY, JSON.stringify(saved)); assert.equal(f.p.load(), true);
    assert.equal(f.p.checkSamplingStart(f.state.contract).ok, false);
    assert.equal(f.p.abandonContract().ok, true); assert.equal(f.p.acceptContract(tender()).ok, true);
    assert.equal(f.p.checkSamplingStart(f.state.contract).tenderFitBasis, undefined);
  } finally { f.close(); }
});

let failures = 0;
try {
  for (const { name, fn } of cases) {
    try { await fn(); console.log(`PASS ${name}`); }
    catch (e) { failures++; console.error(`FAIL ${name}\n${e.stack}`); }
  }
  console.log(JSON.stringify({ passed: cases.length - failures, cases: cases.length, measurements,
    limits: 'Core gauge policy only. Sonic physical fit, all-vendor interchange, renderer/device and unaided affordability remain unverified.' }, null, 2));
  if (failures) process.exitCode = 1;
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete globalThis.localStorage;
  removeTemporaryBaseline();
}
