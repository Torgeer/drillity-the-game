#!/usr/bin/env node
/** Independent real-geology rescue critic. Full production geology.init() and
 * CONTRACT_ACCEPT handlers run with a real CPU Canvas DOM boundary; no WebGL
 * renderer, mocked geological service, manual generation or synthetic fallback.
 * --canvas=/path/to/@napi-rs/canvas supplies the installed CPU canvas package.
 * DRILLITY_CANVAS_ROOT is the equivalent environment override; an ordinary
 * local @napi-rs/canvas installation also works. Historical geology is read
 * from pinned git859fde2, without a sibling worktree or temporary source files.
 * --report=path.json preserves source identities and outcomes.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createGeology } from '../src/world/geology.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { getMethod, archetypesFor, REGIONS } from '../src/game/data.js';
import { ECON, emergencyContract, canonicalEmergencyContract } from '../src/game/economy.js';

const require = createRequire(import.meta.url);
const canvasRequest = process.argv.find(a => a.startsWith('--canvas='))?.slice(9)
  || process.env.DRILLITY_CANVAS_ROOT || '@napi-rs/canvas';
const canvasPath = canvasRequest.startsWith('.') ? resolve(canvasRequest) : canvasRequest;
const { createCanvas } = require(canvasPath);
const canvasPackagePath = resolve(dirname(require.resolve(canvasPath)), 'package.json');
const canvasPackageInfo = JSON.parse(readFileSync(canvasPackagePath, 'utf8'));
const canvasPackage = { name: canvasPackageInfo.name, version: canvasPackageInfo.version, path: canvasPackagePath };
assert.ok(!process.argv.some(a => a.startsWith('--baseline-geology=')),
  'The baseline is pinned in git; remove the obsolete sibling --baseline-geology argument.');
const baselineRef = '859fde2023e531d44e5ff334355e4d24e4c4d92c';
const baselinePath = `${baselineRef}:src/world/geology.js`;
const root = fileURLToPath(new URL('..', import.meta.url));
const baselineSource = execFileSync('git', ['show', baselinePath], { cwd: root, maxBuffer: 4e6 });
const baselineGeologyHash = createHash('sha256').update(baselineSource).digest('hex');
// This is the actual historical module. Only import specifiers are made
// absolute so its bytes can execute from memory with this checkout's shared
// dependencies. No generator logic, service API or returned value is replaced.
const baselineImports = [];
const baselineModule = baselineSource.toString('utf8').replace(/(\bfrom\s*['"])([^'"]+)(['"])/g,
  (all, prefix, specifier, suffix) => {
    const resolved = specifier.startsWith('.')
      ? new URL(specifier, new URL('../src/world/geology.js', import.meta.url)).href
      : import.meta.resolve(specifier);
    baselineImports.push({ specifier, resolved });
    return prefix + resolved + suffix;
  });
const baselineGeology = (await import('data:text/javascript;base64,'
  + Buffer.from(baselineModule).toString('base64'))).createGeology;
const original = Object.fromEntries(['document', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const originalWarn = console.warn, warnings = [], results = [], measurements = [], tests = [];
const sourcePaths = ['src/core/contract.js', 'src/game/economy.js', 'src/game/progression.js', 'src/world/geology.js',
  'src/sim/drilling.js', 'src/game/data.js', 'src/game/equipment-support.js', 'src/sim/sample-product.js',
  'src/sim/sample-ledger.js', 'tools/checkrescuegeology-adversarial.mjs'];
const hashes = () => Object.fromEntries(sourcePaths.map(path => [path,
  createHash('sha256').update(readFileSync(new URL(`../${path}`, import.meta.url))).digest('hex')]));
const sourceHashesBefore = hashes();
console.warn = (...args) => warnings.push(args.map(String).join(' '));
const test = (name, fn) => tests.push({ name, fn });
const clone = value => structuredClone(value);
let owned = [];
Object.defineProperty(globalThis, 'document', { configurable: true, value: {
  hidden: false,
  createElement(tag) {
    assert.equal(tag, 'canvas', 'geology initialization requires only CPU canvas DOM elements');
    return createCanvas(300, 150);
  },
} });

async function fixture({ money = 0, conditions = null, values = new Map(), restore = false,
  geoFactory = createGeology } = {}) {
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key),
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  const state = createGameState(), bus = createBus(), events = [];
  const ctx = { state, bus, rand: makeRandom(945), SCENES, viewport: { w: 390, h: 844, dpr: 1 },
    quality: { anisotropy: 1 }, clock: { t: 0, dt: 0, frame: 0 } };
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  // Match production construction/initialization order: geology then simulator
  // then progression. Each gets the same mutable context object as main.js.
  ctx.geology = geoFactory(ctx); ctx.sim = createDrillSim(ctx); ctx.progression = createProgression(ctx);
  const f = { ctx, state, bus, events, values, storage, geology: ctx.geology, sim: ctx.sim, progression: ctx.progression };
  owned.push(f);
  await ctx.geology.init(); await ctx.sim.init(); await ctx.progression.init();
  if (!restore) {
    state.player.money = money;
    if (conditions) Object.assign(state.garage.condition, conditions);
  }
  state.scene = SCENES.SITE;
  return f;
}
function accept(f, card = f.progression.getContracts().find(c => c.emergency === true)) {
  assert.ok(card); const cash = f.state.player.money;
  assert.equal(f.progression.previewContract(card).ok, true);
  assert.equal(f.progression.acceptContract(card).ok, true);
  assert.equal(f.state.player.money, cash, 'acceptance grants nothing and charges the existing zero mobilisation');
  assert.equal(f.geology.spec.seed, f.state.contract.seed, 'actual acceptance handler propagates the canonical seed');
  assert.equal(f.geology.spec.regionId, f.state.contract.regionId);
  assert.equal(f.progression.run.contract, f.state.contract, 'live geology authority sees the actual accepted run contract');
  assert.equal(f.state.world.strata, f.geology.strata, 'rendered-state and live geological service share the actual generated column');
  return f.state.contract;
}
function column(f, target) {
  return f.geology.strata.filter(s => s.top < target).map(s => ({ id: s.id, top: s.top, bottom: Math.min(target, s.bottom) }));
}
function advertised(c) {
  return c.groundSpec.filter(s => s.top < c.targetDepth)
    .map(s => ({ id: s.id, top: s.top, bottom: Math.min(c.targetDepth, s.bottom) }));
}
function profile(f) { return clone({ strata: f.geology.strata, features: f.geology.features,
  waterTableDepth: f.geology.waterTableDepth, profileDepth: f.geology.profileDepth }); }
const profileHash = f => createHash('sha256').update(JSON.stringify(profile(f))).digest('hex');
function frame(f, dt = 1 / 60) {
  f.ctx.clock.t += dt; f.ctx.clock.dt = dt; f.ctx.clock.frame++; f.state.tSec += dt;
  f.geology.update(dt, f.state); f.sim.update(dt, f.state); f.progression.update(dt, f.state);
}
async function drillHole(f, { changeWornBit = false, delayedFeedSeconds = 0 } = {}) {
  const c = f.state.contract, beforeCount = f.events.filter(e => e.event === EVENTS.HOLE_COMPLETE).length;
  assert.ok(f.sim.startHole(c));
  assert.equal(f.sim.debug.state.syntheticGeology, false, 'actual geological service selected at start');
  assert.equal(f.sim.debug.godMode, false);
  const originalProfile = profileHash(f), phases = new Set(), seenGround = new Set(), actions = [], bitChanges = [];
  let requestedBitChange = false;
  for (let i = 0; i < 36000; i++) {
    const t = f.sim.getTelemetry(); phases.add(t.phase); seenGround.add(t.stratum.id);
    if (!t.active) break;
    // Fixed public slider settings, with only public telemetry deciding when
    // an operator action is available. No optimum-model or internal-state input.
    f.sim.setInput('feed', t.phase === 'stuck' || i < delayedFeedSeconds * 60 ? 0 : 0.45);
    f.sim.setInput('rotation', 0.5); f.sim.setInput('flush', t.phase === 'stuck' ? 1 : 0.75);
    if (t.phase === 'stuck' && t.jam.rescue.goodNow) {
      const result = f.sim.pulse('jamRescue'); if (result.ok) actions.push({ kind: 'jamRescue', depth: t.depth, result });
    }
    if (changeWornBit && !requestedBitChange && t.phase === 'drilling' && t.bit.life01 < 0.2) {
      // This is precisely the no-argument public call made by Site's bit-change
      // button. Observe its real trip and outcome; no inventory writes or money.
      requestedBitChange = true;
      bitChanges.push(f.sim.changeBit().then(result => { actions.push({ kind: 'changeBit', result }); return result; }));
    }
    assert.equal(f.sim.debug.state.syntheticGeology, false);
    const current = f.sim.getTelemetry().stratum;
    assert.ok(getMethod(c.methodId).validGround.includes(current.id), `unsupported actual ground ${current.id}`);
    frame(f);
  }
  const end = f.sim.getTelemetry();
  assert.equal(end.phase, 'complete', `bounded operator run ended ${end.phase} at ${end.depth} m`);
  const changes = await Promise.all(bitChanges); assert.ok(changes.every(c => c.ok), 'requested legitimate bit trips complete');
  const completeEvents = f.events.filter(e => e.event === EVENTS.HOLE_COMPLETE);
  assert.equal(completeEvents.length, beforeCount + 1);
  const payload = completeEvents.at(-1).payload, receipt = f.progression.settlementForCompletion(payload);
  assert.ok(receipt); assert.equal(payload.depth, c.targetDepth);
  assert.equal(profileHash(f), originalProfile, 'all controls and actual updates retain accepted strata/features');
  const paid = clone(f.progression.serialise()); f.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  assert.deepEqual(f.progression.serialise(), paid, 'real completed event replay cannot repeat rewards');
  return { payload, receipt, phases: [...phases], seenGround: [...seenGround], actions,
    endBit: end.bit, declaredSyntheticGeology: f.sim.debug.state.syntheticGeology };
}
function verifyGround(f, c) {
  const actual = column(f, c.targetDepth), promised = advertised(c);
  measurements.push({ name: 'ground comparison', contractId: c.id, seed: c.seed,
    actual, promised, features: clone(f.geology.features) });
  assert.deepEqual(actual, promised, 'advertised and actual contact depths/material IDs must agree');
  for (let i = 0; i <= 160; i++) {
    const depth = c.targetDepth * i / 160, sample = f.geology.getDrillabilityAt(depth);
    assert.ok(getMethod(c.methodId).validGround.includes(sample.id), `actual auger work encounters unsupported ${sample.id} at ${depth}`);
    assert.equal(sample.stratum, f.geology.getStratumAt(depth), 'sim sampler and section share the same stratum object');
    assert.ok(!sample.boulder && !sample.cavity, 'canonical soft-ground mission must not hide an unadvertised hard boulder or void');
  }
}

test('full geology acceptance wiring delivers the canonical advertised starter column at zero money', async () => {
  const f = await fixture(), starter = createGameState().garage;
  assert.deepEqual(f.state.garage.loadout, starter.loadout);
  assert.deepEqual(f.state.garage.owned, starter.owned, 'no extra owned asset is silently granted');
  assert.equal(f.state.garage.rigId, starter.rigId);
  const c = accept(f); verifyGround(f, c);
  f.sim.startHole(c);
  assert.equal(f.sim.debug.state.syntheticGeology, false, 'real geology service must be selected by simulation');
  const actual = f.sim.getTelemetry().stratum, sampled = f.geology.getDrillabilityAt(0);
  for (const key of ['id', 'ucs', 'abrasivity', 'stability', 'water', 'index']) assert.equal(actual[key], sampled[key]);
  assert.ok(archetypesFor('auger', 'nordic').includes(c.archetype), 'site is an existing valid method/region pairing');
  assert.equal(f.state.world.site.archetype, c.archetype);
  assert.equal(c.sitePlane, 'surface'); assert.equal(c.flushMedium, getMethod('auger').flushMedium);
});

test('frozen real-world acceptance reproduces the advertised-column mismatch as a negative control', async () => {
  assert.ok(baselineGeology);
  const f = await fixture({ geoFactory: baselineGeology }), c = accept(f);
  const actual = column(f, c.targetDepth), promised = advertised(c), unsupported = [];
  assert.notDeepEqual(actual, promised);
  for (let i = 0; i <= 160; i++) {
    const depth = c.targetDepth * i / 160, sample = f.geology.getDrillabilityAt(depth);
    if (!getMethod(c.methodId).validGround.includes(sample.id)) unsupported.push({ depth, id: sample.id, ucs: sample.ucs });
  }
  assert.ok(unsupported.length, 'old actual acceptance adds unsupported ground inside the promised soil work');
  measurements.push({ name: 'frozen actual acceptance negative control', actual, promised, unsupported,
    baselineGeologyHash });
});

test('slow actual D work delivers all three holes before the separately recorded recovery support', async () => {
  const f = await fixture(), c = accept(f), holes = [];
  for (let i = 0; i < c.holes; i++) {
    holes.push(await drillHole(f, { delayedFeedSeconds: 120 }));
    if (i < c.holes - 1) assert.equal(holes.at(-1).receipt.recoverySupport || 0, 0);
  }
  assert.ok(holes.every(h => h.payload.grade === 'D'));
  assert.ok(holes.at(-1).receipt.recoverySupport > 0);
  assert.equal(f.state.player.money, ECON.brokeBelow);
  measurements.push({ name: 'slow real D support', holes, finalCash: f.state.player.money });
});

for (const mode of ['starter', 'worn supported', 'existing field-spare policy']) test(`real geological service completes all three holes from zero cash with ${mode}`, async () => {
  const fieldSpare = mode === 'existing field-spare policy';
  const conditions = mode === 'starter' ? null : fieldSpare
    ? { 'crawler-lite': 0.15, 'auger-flight-std': 0.12, 'auger-flight-sec-280': 0.2 }
    : { 'crawler-lite': 0.4, 'auger-flight-std': 0.5, 'auger-flight-sec-280': 0.5 };
  const f = await fixture({ conditions }), beforeInventory = clone(f.state.garage.owned);
  const c = accept(f); verifyGround(f, c);
  const holes = [];
  for (let i = 0; i < c.holes; i++) holes.push(await drillHole(f, { changeWornBit: fieldSpare }));
  assert.deepEqual(f.state.garage.owned, beforeInventory, 'no asset purchases or grants support the play fixture');
  assert.equal(f.state.contract, null); assert.equal(f.progression.run, null);
  assert.ok(f.state.player.money >= ECON.brokeBelow, `completed work leaves €${f.state.player.money}`);
  const moneyEvents = f.events.filter(e => e.event === EVENTS.MONEY_CHANGE);
  assert.equal(moneyEvents.reduce((sum, e) => sum + e.payload.delta, 0), f.state.player.money);
  assert.ok(moneyEvents.some(e => e.payload.delta < 0 && e.payload.reason === 'Running costs'));
  if (fieldSpare) {
    assert.ok(holes.some(h => h.actions.some(a => a.kind === 'changeBit')), 'public action exercises existing operator recovery');
    // Preserve the limitation rather than silently calling an untyped spare a
    // physically verified auger replacement. The fixed supported cases above
    // must retain actual auger identity and reported fit at every completion.
  } else assert.ok(holes.every(h => h.endBit.kind === 'auger' && h.endBit.fits === true));
  measurements.push({ name: `${mode} full real play`, holes,
    finalCash: f.state.player.money, garage: clone(f.state.garage), moneyEvents });
});

test('older saved rescue descriptors rebuild the same accepted real column and finish remaining holes once', async () => {
  const first = await fixture(); const c = accept(first);
  await drillHole(first);
  const payload = clone(first.progression.serialise());
  for (const key of ['archetype', 'sitePlane', 'flushMedium']) {
    delete payload.contract[key]; if (payload.world.site) delete payload.world.site[key];
  }
  const restored = await fixture({ values: new Map([[SAVE_KEY, JSON.stringify(payload)]]), restore: true });
  assert.equal(restored.progression.run.holesDone, 1);
  assert.equal(restored.state.contract.id, c.id); assert.ok(Object.isFrozen(restored.state.contract));
  verifyGround(restored, restored.state.contract);
  const holes = [await drillHole(restored), await drillHole(restored)];
  assert.equal(restored.state.player.career.contractsDone, 1);
  assert.ok(restored.state.player.money >= ECON.brokeBelow);
  assert.equal(restored.state.player.career.ledger.length, 3);
  measurements.push({ name: 'restored legacy real play', holes, finalCash: restored.state.player.money });
});

test('an actually empty rig inventory is refused without a free asset or geological replacement', async () => {
  const f = await fixture(); f.state.unlocked.rigs = []; f.state.garage.owned = [];
  const c = f.progression.rescueContract(), before = clone(f.progression.serialise()), geoBefore = profileHash(f);
  assert.equal(f.progression.previewContract(c).ok, false); assert.equal(f.progression.acceptContract(c).ok, false);
  assert.deepEqual(f.progression.serialise(), before); assert.equal(profileHash(f), geoBefore);
});

test('canonical mission rejects forged ground/site/seed changes before zero-cash debt acceptance', async () => {
  const f = await fixture({ money: -1 });
  for (const [name, mutate] of [
    ['ground identity', c => c.groundSpec[1].id = 'topsoil'],
    ['ground contact', c => c.groundSpec[1].bottom = 4], ['seed', c => c.seed++],
    ['site', c => c.archetype = 'quarry-bench'], ['plane', c => c.sitePlane = 'underground'],
    ['flush', c => c.flushMedium = 'air'], ['diameter', c => c.holeDia++],
  ]) {
    const c = clone(f.progression.rescueContract()), before = clone(f.progression.serialise()), geoBefore = profileHash(f);
    mutate(c); assert.equal(canonicalEmergencyContract(c), null, name);
    assert.equal(f.progression.previewContract(c).ok, false, name);
    assert.equal(f.progression.acceptContract(c).ok, false, name);
    assert.deepEqual(f.progression.serialise(), before); assert.equal(profileHash(f), geoBefore);
  }
});

test('real partial drilling followed by abandon earns no completion support or settlement', async () => {
  const f = await fixture(); accept(f); f.sim.startHole(f.state.contract);
  f.sim.setInput('feed', 0.45); f.sim.setInput('rotation', 0.5); f.sim.setInput('flush', 0.75);
  for (let i = 0; i < 12000 && f.sim.getTelemetry().depth < 1; i++) frame(f);
  assert.ok(f.sim.getTelemetry().depth >= 1 && f.sim.getTelemetry().depth < 8);
  const before = f.state.player.money;
  assert.equal(f.progression.abandonContract().ok, true);
  assert.equal(f.state.player.money, before); assert.equal(f.state.player.career.ledger.length, 0);
  assert.equal(f.events.filter(e => e.event === EVENTS.HOLE_COMPLETE).length, 0);
});

test('direct unaccepted canonical hints cannot replace ordinary generated geological context', async () => {
  const f = await fixture(), c = f.progression.rescueContract();
  const spec = { regionId: c.regionId, applicationId: c.applicationId, methodId: c.methodId,
    targetDepth: c.targetDepth, seed: c.seed, difficulty: c.difficulty, holeDiaMm: c.holeDia };
  f.geology.generateProfile(spec); const ordinary = profile(f);
  f.geology.generateProfile({ ...spec, acceptedContract: c });
  assert.deepEqual(profile(f), ordinary, 'unaccepted canonical object cannot request the softer recovery mission');
  assert.equal(f.state.player.money, 0); assert.equal(f.progression.run, null);
});

test('accepted rescue profile rebuild requires current identity and matching physical context', async () => {
  const f = await fixture(), c = accept(f);
  const spec = { regionId: c.regionId, applicationId: c.applicationId, methodId: c.methodId,
    targetDepth: c.targetDepth, seed: c.seed, difficulty: c.difficulty, holeDiaMm: c.holeDia,
    profileMode: c.profileMode, commodity: c.commodity ?? null,
    oreConfidence: c.oreConfidence, acceptedContract: c };
  const acceptedProfile = profile(f);
  f.geology.generateProfile(spec);
  assert.deepEqual(profile(f), acceptedProfile, 'legitimate accepted profile reconstruction stays deterministic');
  for (const [name, delta] of [
    ['region', { regionId: 'german' }], ['application', { applicationId: 'water-well' }],
    ['method', { methodId: 'dth' }], ['target', { targetDepth: c.targetDepth + 1 }],
    ['seed', { seed: c.seed + 1 }], ['diameter', { holeDiaMm: c.holeDia + 10 }],
    // Existing normDifficulty maps both raw 1 and raw 5 to the same physical
    // value 1. Use a genuinely distinct normalized input, not that old alias.
    ['difficulty', { difficulty: 0.2 }], ['profile mode', { profileMode: 'profile' }],
    ['commodity', { commodity: 'gold' }], ['confidence', { oreConfidence: 0.01 }],
    ['copied identity', { acceptedContract: clone(c) }],
  ]) {
    f.geology.generateProfile({ ...spec, ...delta });
    assert.equal(f.geology.spec.acceptedContract, undefined, `${name} cannot borrow accepted soil context`);
    f.geology.generateProfile(spec);
    assert.deepEqual(profile(f), acceptedProfile, `${name} rejection does not consume legitimate work-order identity`);
  }
  const cash = f.state.player.money;
  assert.equal(f.progression.abandonContract().ok, true);
  f.geology.generateProfile(spec);
  assert.equal(f.geology.spec.acceptedContract, undefined, 'abandoned work-order identity cannot be reused');
  assert.notDeepEqual(column(f, c.targetDepth), advertised(c));
  assert.equal(f.state.player.money, cash);
});

test('unaccepted or copied acceptance notifications do not establish a trusted soil work order', async () => {
  const f = await fixture(), c = f.progression.rescueContract();
  const cash = f.state.player.money;
  f.bus.emit(EVENTS.CONTRACT_ACCEPT, { contract: c });
  assert.equal(f.geology.spec.acceptedContract, undefined);
  assert.notDeepEqual(column(f, c.targetDepth), advertised(c));
  assert.equal(f.progression.run, null); assert.equal(f.state.player.money, cash);
  const accepted = accept(f), acceptedColumn = advertised(accepted);
  f.bus.emit(EVENTS.CONTRACT_ACCEPT, { contract: clone(accepted) });
  assert.equal(f.geology.spec.acceptedContract, undefined);
  assert.notDeepEqual(column(f, accepted.targetDepth), acceptedColumn);
  assert.equal(f.progression.run.contract, accepted);
  // A genuine event from the still-current immutable order can restore it.
  f.bus.emit(EVENTS.CONTRACT_ACCEPT, { contract: accepted });
  assert.deepEqual(column(f, accepted.targetDepth), acceptedColumn);
  assert.equal(f.state.player.money, cash);
});

test('ordinary contract acceptance preserves frozen generator output across representative regions and seeds', async () => {
  assert.ok(baselineGeology, 'pinned historical geology must load for the unchanged-generation proof');
  const current = await fixture({ money: 100000 }), prior = await fixture({ money: 100000, geoFactory: baselineGeology });
  for (const region of REGIONS) for (const seed of [20260903, 19, 987654]) {
    // Ordinary profile generation is the intended API, separate from the two
    // real acceptance paths exercised below and the full lifecycle play above.
    const spec = { regionId: region.id, applicationId: 'site-investigation', methodId: 'auger',
      targetDepth: 8, seed, difficulty: 1, holeDiaMm: 150 };
    current.geology.generateProfile(spec); prior.geology.generateProfile(spec);
    assert.deepEqual(profile(current), profile(prior), `${region.id} seed ${seed} retains full strata/features/water table`);
  }
  // Accepted soil-only auger work intentionally gains the new authored-column
  // path too. Mixed/unsupported rock remains a negative control for that scope.
  const c = { ...emergencyContract(1, 'nordic'), id: 'ordinary-actual-acceptance', emergency: false,
    groundSpec: [{ id: 'topsoil', top: 0, bottom: 0.5, thickness: 0.5 },
      { id: 'granite', top: 0.5, bottom: 8, thickness: 7.5 }] };
  accept(current, c); accept(prior, c);
  assert.deepEqual(profile(current), profile(prior), 'actual ordinary acceptance event handler retains baseline generation');
  assert.notDeepEqual(column(current, 8), advertised(c), 'ordinary negative control is not accidentally the authored rescue column');
  measurements.push({ name: 'ordinary unchanged', count: REGIONS.length * 3 + 1,
    baselineGeologyHash });
});

try {
  const filter = process.argv.find(a => a.startsWith('--filter='))?.slice(9);
  for (const { name, fn } of tests.filter(t => !filter || t.name.includes(filter))) {
    owned = [];
    try { await fn(); results.push({ name, pass: true }); }
    catch (error) { results.push({ name, pass: false, error: error.stack }); }
    finally { for (const f of owned) {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: f.storage });
      f.sim.dispose(); f.progression.dispose(); f.geology.dispose();
    } }
  }
} finally {
  console.warn = originalWarn;
  for (const [key, descriptor] of Object.entries(original)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
}
const sourceHashes = hashes(), sourceUnchanged = JSON.stringify(sourceHashesBefore) === JSON.stringify(sourceHashes);
if (!sourceUnchanged) results.push({ name: 'source identity before/after all executed checks', pass: false,
  error: 'Source changed during execution; this report is not acceptance evidence for either source snapshot.' });
const report = { passed: results.filter(r => r.pass).length, total: results.length, results, measurements,
  sourceHashes, sourceHashesBefore, sourceUnchanged, warnings, nodeVersion: process.version, canvasPath, canvasPackage,
  baselinePath, baselineGeologyHash,
  baselineImports, browser: false, renderer: false };
const reportArg = process.argv.find(a => a.startsWith('--report='));
if (reportArg) { const out = resolve(reportArg.slice(9)); mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2) + '\n'); }
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.name}${r.pass ? '' : '\n' + r.error}`);
console.log(`Actual rescue geology critic: ${report.passed}/${report.total}`);
if (report.passed !== report.total) process.exitCode = 1;
