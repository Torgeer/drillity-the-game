#!/usr/bin/env node
/** Independent rescue viability critic. Real public progression acceptance,
 * attempt issuance, event settlement and in-memory reload; one real fixed-step
 * simulation completion. Fixture money/time/depth are adversarial test inputs,
 * not machine dimensions, prices, or added game tuning.
 * Run: node tools/checkrescueviability-adversarial.mjs [--report=path.json]
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { parseAst } from 'vite';
import { createGameState, createBus, makeRandom, EVENTS, SCENES, clamp } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { ECON, emergencyContract } from '../src/game/economy.js';
import { GRADES } from '../src/ui/screens/catalog.js';

const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const oldWarn = console.warn, warnings = [], cases = [], results = [], measurements = [];
console.warn = (...args) => warnings.push(args.map(String).join(' '));
const clone = value => structuredClone(value);
const test = (name, fn) => cases.push({ name, fn });
let owned = [];
async function fresh({ money = -2000, values = new Map(), restore = false } = {}) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  } });
  const state = createGameState(), bus = createBus(), events = [];
  const progression = createProgression({ state, bus, rand: makeRandom(456), SCENES });
  await progression.init();
  if (!restore) state.player.money = money;
  for (const event of new Set(Object.values(EVENTS))) bus.on(event, payload => events.push({ event, payload }));
  const ctx = { state, bus, progression, events, values, sim: null };
  owned.push(ctx);
  return ctx;
}
function book(ctx) { return clone(ctx.progression.serialise()); }
function accept(ctx, card = ctx.progression.getContracts().find(c => c.emergency === true)) {
  assert.ok(card, 'actual production board supplies rescue');
  const cash = ctx.state.player.money;
  const quote = ctx.progression.previewContract(card);
  assert.equal(quote.ok, true, quote.reason);
  assert.equal(ctx.progression.acceptContract(card).ok, true);
  assert.equal(ctx.state.player.money, cash, 'no reward or debt forgiveness on acceptance');
  return ctx.state.contract;
}
function completion(ctx, { grade = 'D', ratio = 3, ...changes } = {}) {
  const contract = ctx.state.contract;
  const identity = ctx.progression.beginHole(contract);
  assert.ok(identity, 'real progression issues attempt identity');
  const payload = { contract, methodId: contract.methodId, ...identity,
    depth: contract.targetDepth, timeSec: 60 * ratio, grade,
    breakdown: { time: { parSec: 60, actualSec: 60 * ratio } }, ...changes };
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
  return { payload, receipt: ctx.progression.settlementForCompletion(payload) };
}
function summary(ctx) {
  return ctx.events.filter(e => e.event === EVENTS.SCENE_CHANGE && e.payload.scene === SCENES.RESULTS)
    .at(-1)?.payload.summary;
}
function finish(ctx, options) {
  const remaining = ctx.state.contract.holes - ctx.progression.run.holesDone;
  const receipts = [];
  for (let i = 0; i < remaining; i++) {
    const entry = completion(ctx, options);
    assert.ok(entry.receipt, 'full-depth completion has an authoritative receipt');
    receipts.push(entry);
  }
  assert.equal(ctx.progression.run, null);
  assert.equal(ctx.state.contract, null);
  assert.ok(summary(ctx), 'actual completion publishes results summary');
  return { receipts, summary: summary(ctx) };
}
const support = value => value?.recoverySupport ?? 0;
function reconcile(ctx, before, s, ledger = ctx.state.player.career.ledger.slice(0, s.holes)) {
  const totalSupport = ledger.reduce((a, e) => a + support(e), 0);
  const totalNet = ledger.reduce((a, e) => a + e.net, 0) - s.mobilisation;
  assert.equal(ctx.state.player.money - before, s.net, 'summary net equals actual cash change');
  assert.equal(totalNet, s.net, 'hole net ledger sums to contract net exactly once');
  assert.equal(totalSupport, support(s), 'support disclosed consistently in ledger and summary');
  assert.equal(s.revenue + support(s) - s.costs - s.mobilisation, s.net,
    'normal earned revenue plus separate support minus real costs reconciles');
  assert.equal(ledger.reduce((a, e) => a + e.revenue, 0), s.revenue);
  assert.equal(ledger.reduce((a, e) => a + e.costs.total, 0), s.costs);
}

test('slow grade-D canonical rescue restores at least existing brokeBelow net after all three holes', async () => {
  const ctx = await fresh(), before = ctx.state.player.money;
  accept(ctx);
  const first = completion(ctx), second = completion(ctx);
  assert.ok(first.receipt && second.receipt);
  assert.equal(support(first.receipt), 0); assert.equal(support(second.receipt), 0);
  assert.equal(summary(ctx), undefined, 'incomplete contract has no final reward summary');
  const { summary: s } = finish(ctx);
  measurements.push({ name: 'slow D rescue', before, after: ctx.state.player.money, summary: s,
    ledger: clone(ctx.state.player.career.ledger.slice(0, 3)) });
  assert.ok(s.net >= ECON.brokeBelow, `completed rescue net ${s.net} below ${ECON.brokeBelow}`);
  assert.ok(support(s) > 0, 'slow loss is covered by an explicitly disclosed support amount');
  reconcile(ctx, before, s);
});

test('normal equivalent contract retains identical running costs and earned revenue', async () => {
  const rescue = await fresh({ money: 10000 }), beforeRescue = rescue.state.player.money;
  const card = clone(rescue.progression.rescueContract()); accept(rescue, card);
  const rescued = finish(rescue).summary;
  const normal = await fresh({ money: 10000 }), beforeNormal = normal.state.player.money;
  accept(normal, { ...card, id: 'critic-normal-equivalent', emergency: false });
  const ordinary = finish(normal).summary;
  measurements.push({ name: 'ordinary control', rescue: rescued, ordinary });
  assert.equal(rescued.costs, ordinary.costs, 'support never lowers itemized actual costs');
  assert.equal(rescued.revenue, ordinary.revenue, 'support never masquerades as tender revenue');
  assert.equal(support(ordinary), 0, 'ordinary job gets no rescue subsidy');
  assert.equal(ordinary.net, ordinary.revenue - ordinary.costs - ordinary.mobilisation);
  assert.ok(ordinary.net < 0, 'the historical slow-operator loss remains reproduced by normal terms');
  reconcile(rescue, beforeRescue, rescued); reconcile(normal, beforeNormal, ordinary);
});

test('support is the minimum floor adjustment, not a bonus on profitable work', async () => {
  const ctx = await fresh({ money: 0 }), before = ctx.state.player.money;
  accept(ctx); const s = finish(ctx, { grade: 'S', ratio: 0.4 }).summary;
  const earnedNet = s.revenue - s.costs - s.mobilisation;
  assert.equal(support(s), Math.max(0, ECON.brokeBelow - earnedNet));
  reconcile(ctx, before, s);
});

for (const badDepth of [0, -1, 0.1, 7.99, 8.001, 1000, undefined, null, NaN, Infinity, '8']) {
  test(`rescue refuses incomplete or invalid delivered depth ${String(badDepth)}`, async () => {
    const ctx = await fresh(); accept(ctx);
    const identity = ctx.progression.beginHole(ctx.state.contract), before = book(ctx);
    const payload = { contract: ctx.state.contract, ...identity, depth: badDepth, grade: 'D',
      breakdown: { time: { parSec: 60, actualSec: 180 } } };
    ctx.bus.emit(EVENTS.HOLE_COMPLETE, payload);
    assert.equal(ctx.progression.settlementForCompletion(payload), null);
    assert.deepEqual(book(ctx), before, 'rejected depth cannot consume attempt, award money or advance job');
  });
}

test('abandon before work and after partial delivery never receives final support', async () => {
  for (const holes of [0, 1, 2]) {
    const ctx = await fresh(); accept(ctx);
    for (let i = 0; i < holes; i++) completion(ctx);
    const before = ctx.state.player.money;
    assert.equal(ctx.progression.abandonContract().ok, true);
    assert.equal(ctx.state.player.money, before);
    assert.equal(summary(ctx), undefined);
    assert.ok(ctx.state.player.career.ledger.every(e => support(e) === 0));
  }
});

for (const [name, mutate] of [
  ['payout', c => c.payout++], ['time bonus', c => c.bonus.time++],
  ['quality bonus', c => c.bonus.quality++], ['deadline', c => c.deadlineHours++],
  ['hardness', c => c.hardness = 0], ['abrasivity', c => c.abrasivity = 0],
  ['diameter', c => c.holeDia++], ['metres', c => c.metres++],
  ['ground', c => c.groundSpec[1].id = 'granite'], ['holes', c => c.holes++],
  ['target', c => c.targetDepth++], ['required method', c => c.requiredMethod = 'rotary'],
  ['reputation', c => c.reputationReward++], ['application', c => c.applicationId = 'water-well'],
  ['identity', c => c.id += '-forged'], ['emergency flag', c => c.emergency = 'true'],
]) {
  test(`canonical safety-net identity rejects mutated ${name}`, async () => {
    const ctx = await fresh(), card = clone(ctx.progression.rescueContract()); mutate(card);
    const before = book(ctx), quote = ctx.progression.previewContract(card);
    assert.equal(quote.ok, false, 'forged economic shape cannot invoke debt exemption');
    assert.equal(ctx.progression.acceptContract(card).ok, false);
    assert.deepEqual(book(ctx), before);
  });
}

test('accepted rescue owns an immutable deep snapshot of the canonical workload', async () => {
  const ctx = await fresh(), submitted = clone(ctx.progression.rescueContract());
  accept(ctx, submitted);
  const saved = clone(ctx.progression.run.contract);
  submitted.holes = 1; submitted.bonus.time = 1e9; submitted.groundSpec[0].id = 'granite';
  assert.deepEqual(ctx.progression.run.contract, saved, 'caller mutation cannot alter an accepted rescue');
  assert.ok(Object.isFrozen(ctx.progression.run.contract));
  assert.ok(Object.isFrozen(ctx.progression.run.contract.bonus));
  assert.ok(Object.isFrozen(ctx.progression.run.contract.groundSpec[0]));
  const before = ctx.state.player.money; const s = finish(ctx).summary;
  assert.equal(s.holes, 3); reconcile(ctx, before, s);
});

test('level gains and reload preserve accepted canonical rescue eligibility and exactly-once final settlement', async () => {
  const first = await fresh(), before = first.state.player.money;
  const card = accept(first); const oldId = card.id;
  completion(first); completion(first);
  first.progression.addXP(10000, 'critic level advancement');
  assert.notEqual(first.progression.rescueContract().id, oldId, 'current board identity changes after leveling');
  assert.equal(first.progression.save(), true);
  const resumed = await fresh({ values: new Map(first.values), restore: true });
  assert.equal(resumed.state.contract.id, oldId);
  assert.equal(resumed.progression.run.holesDone, 2);
  const { receipts, summary: s } = finish(resumed);
  assert.ok(s.net >= ECON.brokeBelow);
  reconcile(resumed, before, s);
  const after = book(resumed);
  resumed.bus.emit(EVENTS.HOLE_COMPLETE, receipts[0].payload);
  assert.deepEqual(book(resumed), after);
  assert.equal(resumed.progression.save(), true);
  const reload = await fresh({ values: new Map(resumed.values), restore: true }), reloadedBefore = book(reload);
  reload.bus.emit(EVENTS.HOLE_COMPLETE, clone(receipts[0].payload));
  assert.deepEqual(book(reload), reloadedBefore, 'replay after reload cannot repeat support');
});

test('accepted repeat cannot be paid with a previous rescue attempt token', async () => {
  const ctx = await fresh(); accept(ctx); const completed = finish(ctx);
  accept(ctx);
  const before = book(ctx);
  ctx.bus.emit(EVENTS.HOLE_COMPLETE, completed.receipts.at(-1).payload);
  assert.deepEqual(book(ctx), before);
  finish(ctx);
  assert.equal(ctx.state.player.career.contractsDone, 2, 'a new actual three-hole job remains payable');
});

for (const [name, corrupt] of [
  ['partial prior depth', p => p.player.career.ledger[0].depth = 4],
  ['zero prior depth', p => p.player.career.ledger[0].depth = 0],
  ['missing prior depth', p => { delete p.player.career.ledger[0].depth; }],
  ['foreign run identity', p => p.player.career.ledger[0].runId += 100],
  ['foreign contract identity', p => p.player.career.ledger[0].contractId += '-foreign'],
  ['duplicate hole index', p => p.player.career.ledger[0].hole = p.player.career.ledger[1].hole],
  ['missing prior receipt', p => p.player.career.ledger.pop()],
]) {
  test(`restored rescue cannot receive final support with ${name}`, async () => {
    const first = await fresh(); accept(first); completion(first); completion(first);
    const payload = clone(first.progression.serialise()); corrupt(payload);
    const restored = await fresh({ values: new Map([[SAVE_KEY, JSON.stringify(payload)]]), restore: true });
    assert.equal(restored.progression.run.holesDone, 2, 'exercise restored accumulated work');
    const final = finish(restored);
    assert.equal(support(final.summary), 0);
    assert.equal(support(final.receipts[0].receipt), 0, 'missing complete-work evidence cannot mint support');
  });
}

test('canonical rescue with an actual paid mobilisation receives no travel refund or completion support', async () => {
  const ctx = await fresh({ money: 10000 });
  ctx.state.unlocked.regions = ['german-site', 'nordic'];
  // Explicit foreign factory posting: the live provider now correctly prefers
  // Nordic home, regardless of unlocked-list ordering. Preserve
  // this negative control's real paid travel without overriding that behavior.
  const c = emergencyContract(ctx.state.player.level, 'german-site'), quote = ctx.progression.previewContract(c);
  assert.equal(quote.ok, true); assert.ok(quote.mobilisation > 0, 'real cross-region fee');
  const before = ctx.state.player.money;
  assert.equal(ctx.progression.acceptContract(c).ok, true);
  assert.equal(ctx.state.player.money, before - quote.mobilisation);
  const s = finish(ctx).summary;
  assert.equal(support(s), 0); assert.equal(s.mobilisation, quote.mobilisation);
  reconcile(ctx, before, s);
});

test('results reader and actual ledger callback show final-hole support separately without claiming contract net as hole net', async () => {
  const source = readFileSync(new URL('../src/ui/screens/results.js', import.meta.url), 'utf8');
  const ast = parseAst(source);
  function extract(predicate) {
    const matches = [];
    function walk(node) {
      if (!node || typeof node !== 'object') return;
      if (predicate(node)) matches.push(node);
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(walk);
        else if (value && typeof value === 'object') walk(value);
      }
    }
    walk(ast); assert.equal(matches.length, 1, 'uniquely identified actual source implementation');
    return source.slice(matches[0].start, matches[0].end);
  }
  const declaration = name => extract(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === name));
  const method = name => extract(n => n.type === 'FunctionDeclaration' && n.id?.name === name);
  const body = ['GRADE_BANDS', 'COST_LINES', 'pct', 'obj', 'plural'].map(declaration).join('\n')
    + '\n' + ['lastSettlement', 'buildSummary', 'fmtSpan'].map(method).join('\n');
  const reader = new Function('app', 'clamp', 'GRADES', `const state=app.ctx.state;
    let warnedUnscored=false,warnedGrade=false; ${body}; return buildSummary;`);
  const call = extract(n => n.type === 'CallExpression' && n.callee?.name === 'at'
    && n.arguments[0]?.type === 'BinaryExpression' && n.arguments[0]?.left?.value === 1.02);
  const render = new Function('sm', 'C', 'consumeList', 'consumeEl', 'fmtMoney', `
    const S=1, at=(_t,fn)=>fn(); ${declaration('plural')}; ${method('ledgerRow')}; ${call};`);
  const ctx = await fresh(); accept(ctx); const finished = finish(ctx);
  const final = finished.receipts.at(-1), card = final.payload.contract;
  const app = { ctx, normalizeContract: c => c, itemById: () => null };
  const sm = reader(app, clamp, GRADES)({ result: final.payload, contract: card });
  assert.equal(sm.settled, true); assert.equal(sm.recoverySupport, support(final.receipt));
  assert.equal(sm.net, final.receipt.net); assert.notEqual(sm.net, finished.summary.net,
    'last-hole payment and total contract profit intentionally differ');
  const rows = [], C = { h: (selector, ...children) => ({ selector, children }) };
  render(sm, C, { appendChild: value => rows.push(value) }, { classList: { add() {} } }, n => `€${n}`);
  const text = node => typeof node === 'string' ? node : node?.text ?? (node?.children || []).map(text).join('|');
  const rendered = rows.map(text), supportRows = rendered.filter(s => s.startsWith('Recovery support|'));
  assert.deepEqual(supportRows, [`Recovery support|All boreholes complete|+€${sm.recoverySupport}`]);
  assert.ok(rendered.some(s => s.startsWith('Gross payout|') && s.endsWith(`|€${final.receipt.revenue}`)));
  assert.ok(rendered.some(s => s.startsWith('Net paid|') && s.endsWith(`|€${final.receipt.net}`)));
  measurements.push({ name: 'actual results callback', contractNet: finished.summary.net,
    finalHoleNet: final.receipt.net, recoverySupport: sm.recoverySupport, rows: rendered });
});

test('finite debt exits the safety-net threshold through repeated completed slow D rescues', async () => {
  const ctx = await fresh({ money: -2000 }); let jobs = 0;
  const bound = Math.ceil((ECON.brokeBelow - ctx.state.player.money) / ECON.brokeBelow);
  while (ctx.progression.isBroke() && jobs < bound) {
    const before = ctx.state.player.money; accept(ctx); const s = finish(ctx).summary;
    assert.ok(ctx.state.player.money - before >= ECON.brokeBelow);
    reconcile(ctx, before, s); jobs++;
  }
  measurements.push({ name: 'debt exit', jobs, bound, money: ctx.state.player.money });
  assert.equal(ctx.progression.isBroke(), false, 'completed work eventually exits debt and rescue-only state');
  assert.ok(!ctx.progression.getContracts().some(c => c.emergency === true));
});

for (const policy of ['adaptive', 'fixed poor']) test(`real ${policy} auger simulation fully drills canonical rescue through public event settlement without teleport`, async () => {
  const ctx = await fresh(), before = ctx.state.player.money; accept(ctx);
  ctx.sim = createDrillSim({ state: ctx.state, bus: ctx.bus, progression: ctx.progression }); ctx.sim.init();
  const phases = new Set(), completions = [];
  for (let hole = 0; hole < 3; hole++) {
    ctx.sim.startHole(ctx.state.contract);
    for (let i = 0; i < 120000; i++) {
      const t = ctx.sim.getTelemetry(); phases.add(t.phase);
      if (t.phase === 'complete' || t.phase === 'aborted') break;
      const S = ctx.sim.debug.state;
      const optimal = policy === 'adaptive' ? ctx.sim.debug.models.optimalInputs(S.m, S.ground)
        : { wob: 0.45, rpm: 0.5, flush: 0.75 };
      ctx.sim.setInput('feed', optimal.wob); ctx.sim.setInput('rotation', optimal.rpm); ctx.sim.setInput('flush', optimal.flush);
      ctx.sim.debug.stepFixed(1);
    }
    const telemetry = ctx.sim.getTelemetry();
    assert.equal(telemetry.phase, 'complete', `real canonical auger hole ${hole + 1} ends ${telemetry.phase}`);
    const payload = ctx.events.filter(e => e.event === EVENTS.HOLE_COMPLETE).at(-1)?.payload;
    assert.ok(payload); assert.equal(payload.depth, 8);
    const receipt = ctx.progression.settlementForCompletion(payload); assert.ok(receipt);
    completions.push({ depth: payload.depth, grade: payload.grade, time: payload.breakdown.time, receipt });
  }
  const s = summary(ctx); assert.ok(s); assert.ok(s.net >= ECON.brokeBelow);
  reconcile(ctx, before, s);
  if (policy === 'fixed poor') {
    assert.ok(completions.every(c => c.grade === 'D'), 'actual simulation delivers the worst grade on this fixed input policy');
    assert.ok(support(s) > 0, 'actual physical completion exercises the new support path');
  }
  measurements.push({ name: `actual ${policy} simulation`, phases: [...phases], completions, summary: s });
});

try {
  for (const { name, fn } of cases) {
    owned = [];
    try { await fn(); results.push({ name, pass: true }); }
    catch (error) { results.push({ name, pass: false, error: error.stack }); }
    finally { for (const ctx of owned) { ctx.sim?.dispose(); ctx.progression.dispose(); } }
  }
} finally {
  console.warn = oldWarn;
  if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage); else delete globalThis.localStorage;
}
const report = { passed: results.filter(r => r.pass).length, total: results.length, results, measurements,
  sourceHashes: Object.fromEntries(['src/game/progression.js', 'src/game/economy.js', 'src/ui/screens/results.js',
    'tools/checkrescueviability-adversarial.mjs'].map(path => [path,
    createHash('sha256').update(readFileSync(new URL(`../${path}`, import.meta.url))).digest('hex')])),
  warningCount: warnings.length, warningKinds: [...new Set(warnings)].slice(0, 12) };
const reportArg = process.argv.find(a => a.startsWith('--report='));
if (reportArg) {
  const out = resolve(reportArg.slice('--report='.length)); mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
}
for (const result of results) console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.name}${result.pass ? '' : '\n' + result.error}`);
console.log(`Rescue viability adversarial: ${report.passed}/${report.total}`);
if (report.passed !== report.total) process.exitCode = 1;
