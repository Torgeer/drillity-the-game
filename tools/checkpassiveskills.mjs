#!/usr/bin/env node
/** Actual CPU simulation and site forecast consumers. Synthetic fixtures
 * verify authored game effects; they are not career-balance or GPU evidence. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAst } from 'rollup/parseAst';
import { createBus, createGameState, EVENTS, GROUND } from '../src/core/contract.js';
import { getMethod, getSkill, defaultLoadoutFor } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim, TUNING } from '../src/sim/drilling.js';
import { stratumForecastReadout } from '../src/ui/screens/site.js';

let checks = 0;
function test(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
function near(a, b, label, tolerance = 1e-9) {
  assert.ok(Number.isFinite(a) && Math.abs(a - b) <= tolerance, `${label}: ${a} != ${b}`);
}
function fixture(skills = {}) {
  const state = createGameState(), bus = createBus();
  state.player.skills = { ...skills };
  state.player.level = 60; state.player.skillPoints = 100;
  state.garage.rigId = getMethod('core').rigIds[0];
  state.garage.loadout = defaultLoadoutFor('core', 60);
  state.contract = { id: 'passive-skills', methodId: 'core', regionId: 'nordic',
    targetDepth: 80, holes: 1, difficulty: 0, seed: 48, archetype: 'quarry', flushMedium: 'water' };
  const strata = [
    { ...GROUND.granite, id: 'granite', top: 0, bottom: 8, index: 0 },
    { ...GROUND.gneiss, id: 'gneiss', top: 8, bottom: 18, index: 1 },
    { ...GROUND.granite, id: 'granite', top: 18, bottom: 60, index: 2 },
    { ...GROUND.gneiss, id: 'gneiss', top: 60, bottom: 200, index: 3 },
  ];
  const ctx = { state, bus, geology: { strata,
    getDrillabilityAt: depth => strata.find(g => depth >= g.top && depth < g.bottom) || strata.at(-1),
  } };
  const sim = createDrillSim(ctx); ctx.sim = sim;
  sim.init(); sim.startHole(state.contract);
  return { state, bus, sim, ctx, close: () => sim.dispose() };
}
function measure(skills, fn) {
  const f = fixture(skills);
  try { return fn(f); } finally { f.close(); }
}
function holdGroove({ sim }) {
  // Read the real gauge and move the public controls. No god mode, raw state
  // writes, synthetic green-band time or replacement simulation functions.
  for (let i = 0; i < TUNING.sim.hz * 15; i++) {
    const t = sim.getTelemetry();
    assert.equal(t.phase, 'drilling', 'fixture must keep cutting rather than skip a programme');
    sim.setInput('feed', t.wobCmd + (t.sweetSpot.center01 - t.gauge.value) * .08);
    sim.setInput('rotation', .65); sim.setInput('flush', 1);
    sim.debug.stepFixed(1);
    if (sim.getTelemetry().greenBandTime >= TUNING.groove.comboRampSec) {
      const end = sim.getTelemetry();
      assert.ok(end.depth > 1 && end.rop > 0, 'groove was earned while actually drilling');
      return end;
    }
  }
  assert.fail('input policy never earned a full groove');
}
function oneDecay(f) {
  const earned = holdGroove(f);
  f.sim.setInput('feed', 0);
  for (let i = 0; i < TUNING.sim.hz * 2; i++) {
    const before = f.sim.getTelemetry();
    assert.equal(before.phase, 'drilling', 'decay fixture must still be cutting');
    f.sim.debug.stepFixed(1);
    const after = f.sim.getTelemetry();
    if (after.greenBandTime < before.greenBandTime) {
      assert.ok(Math.abs(after.gauge.value - after.sweetSpot.center01) > after.sweetSpot.halfWidth01,
        'public feed control actually moved the gauge outside the sweet spot');
      return { earned, before, after, lost: before.greenBandTime - after.greenBandTime };
    }
  }
  assert.fail('cutting the feed never lost the groove');
}

const forecast = f => f.sim.getForecast(100);
const confidence = f => forecast(f).find(s => s.top === 8).confidence;

test('rank zero keeps the existing forecast and groove behaviour', () => {
  const base = measure({}, f => ({ forecast: forecast(f), trip: oneDecay(f) }));
  const zero = measure({ 'op.strata-reader': 0, 'op.combo-keeper': 0, 'op.deep-focus': 0 },
    f => ({ forecast: forecast(f), trip: oneDecay(f) }));
  assert.deepEqual(zero, base);
  near(base.trip.before.combo, 2.2, 'unskilled maximum');
  near(base.trip.lost, TUNING.groove.comboDecayMul / TUNING.sim.hz, 'unskilled decay');
  near(base.forecast.find(s => s.top === 8).confidence, 1 - 8 / 12, 'existing 12 m confidence tuning');
});

test('Strata Reader improves actual upcoming-stratum confidence at every authored rank', () => {
  let previous = -Infinity;
  for (let rank = 0; rank <= getSkill('op.strata-reader').maxRank; rank++) {
    const rows = measure({ 'op.strata-reader': rank }, forecast);
    assert.equal(rows.length, 4, 'nonempty near and far forecast');
    const next = rows.find(s => s.top === 8);
    near(next.confidence, 1 - 8 / (12 + 8 * rank), `rank ${rank} uses existing horizon tuning`);
    assert.ok(next.confidence > previous, `rank ${rank} improves next contact`);
    previous = next.confidence;
    assert.equal(rows[0].confidence, 1, 'current ground remains known');
    assert.equal(rows.at(-1).confidence, .2, 'distant ground retains uncertainty floor');
    assert.equal(next.previewRanks, rank, 'consumer publishes the resolved purchased effect');
  }
  assert.deepEqual(measure({ 'op.strata-reader': 99 }, forecast), measure({ 'op.strata-reader': 2 }, forecast));
  near(measure({ 'op.feed-finesse': 4 }, confidence), measure({}, confidence), 'feed skill does not confer geology knowledge');
});

test('Combo Keeper reduces real out-of-band groove-time loss by 18 percent per rank', () => {
  const base = measure({}, oneDecay);
  for (let rank = 0; rank <= getSkill('op.combo-keeper').maxRank; rank++) {
    const row = measure({ 'op.combo-keeper': rank }, oneDecay);
    near(row.lost / base.lost, 1 - .18 * rank, `decay rank ${rank}`);
    near(row.before.combo, base.before.combo, 'decay skill does not raise the ceiling');
    assert.ok(row.after.combo > 1 && row.after.combo <= row.before.combo, 'actual multiplier decays within bounds');
  }
  near(measure({ 'op.combo-keeper': 99 }, oneDecay).lost,
    measure({ 'op.combo-keeper': 4 }, oneDecay).lost, 'saved excessive rank capped');
});

test('Deep Focus raises the earned ceiling by 0.15 per rank and actual drilling advances faster', () => {
  const base = measure({}, holdGroove);
  for (let rank = 0; rank <= getSkill('op.deep-focus').maxRank; rank++) {
    const row = measure({ 'op.deep-focus': rank }, holdGroove);
    near(row.combo, 2.2 + .15 * rank, `ceiling rank ${rank}`);
    if (rank > 0) {
      assert.ok(row.depth > base.depth, `rank ${rank} advanced farther during the earned groove`);
      assert.ok(row.rop > base.rop, `rank ${rank} changes observable drilling rate`);
    }
  }
  near(measure({ 'op.deep-focus': 99 }, holdGroove).combo,
    measure({ 'op.deep-focus': 3 }, holdGroove).combo, 'ceiling clamped to catalogue maximum');
});

test('malformed ranks and nonexistent saved aliases cannot invent passive purchases', () => {
  for (const bad of [-2, NaN, Infinity, {}, [], true, 'not a rank']) {
    const ranks = Object.fromEntries(['op.strata-reader', 'op.combo-keeper', 'op.deep-focus'].map(id => [id, bad]));
    near(measure(ranks, confidence), measure({}, confidence), 'invalid forecast rank');
    near(measure(ranks, holdGroove).combo, 2.2, 'invalid ceiling rank');
    near(measure(ranks, oneDecay).lost, measure({}, oneDecay).lost, 'invalid decay rank');
  }
  // These three had no legacy aliases. Do not silently accept new spellings.
  assert.deepEqual(measure({ 'strata-reader': 2, 'combo-keeper': 4, 'deep-focus': 3 }, forecast), measure({}, forecast));
  near(measure({ 'op.strata-reader': '1.9' }, confidence), measure({ 'op.strata-reader': 1 }, confidence), 'saved numeric string floor');
});

test('real skill purchases refresh all three consumers without restarting the current hole', () => {
  const f = fixture({ 'op.percussion-rhythm': 1, 'op.jam-sense': 1 });
  const p = createProgression(f.ctx);
  try {
    const initialConfidence = confidence(f);
    assert.equal(p.spendSkillPoint('op.strata-reader').ok, true);
    assert.ok(confidence(f) > initialConfidence, 'unlock updates active forecast');
    assert.equal(p.spendSkillPoint('op.combo-keeper').ok, true);
    assert.equal(p.spendSkillPoint('op.deep-focus').ok, true);
    const row = oneDecay(f);
    near(row.before.combo, 2.35, 'unlock updates active ceiling');
    near(row.lost, TUNING.groove.comboDecayMul / TUNING.sim.hz * .82, 'unlock updates active decay');
    assert.ok(row.before.depth > 0, 'purchases preserve a running physical hole');
  } finally { p.dispose(); f.close(); }
});

test('starting a new hole refreshes changed saved ranks even without an unlock event', () => {
  const f = fixture();
  try {
    f.sim.abortHole();
    f.state.player.skills = { 'op.strata-reader': 2, 'op.combo-keeper': 4, 'op.deep-focus': 3 };
    f.sim.startHole(f.state.contract);
    near(confidence(f), 1 - 8 / 28, 'new-hole forecast refresh');
    const row = oneDecay(f);
    near(row.before.combo, 2.65, 'new-hole ceiling refresh');
    near(row.lost, TUNING.groove.comboDecayMul / TUNING.sim.hz * .28, 'new-hole decay refresh');
  } finally { f.close(); }
});

test('actual site readout consumes purchased forecast confidence without probability wording', () => {
  assert.equal(measure({}, f => stratumForecastReadout(forecast(f))), null, 'rank zero adds no notice');
  const one = measure({ 'op.strata-reader': 1 }, f => stratumForecastReadout(forecast(f)));
  const two = measure({ 'op.strata-reader': 2 }, f => stratumForecastReadout(forecast(f)));
  assert.equal(one.title, 'Gneiss ahead');
  assert.equal(one.sub, '8.0 m · log confidence 60/100');
  assert.equal(two.sub, '8.0 m · log confidence 71/100');
  assert.notEqual(one.key, two.key, 'a new purchased rank earns an updated notice');
  assert.ok(!one.sub.includes('%'), 'index is not an accuracy percentage');
  for (const rows of [null, [], [{ current: false, previewRanks: 1, distance: NaN, top: 8, confidence: .6 }]]) {
    assert.equal(stratumForecastReadout(rows), null, 'no invented forecast from absent or invalid data');
  }
});

test('lightweight live forecast preserves confidence and skips unpurchased previews and rate estimates', () => {
  assert.deepEqual(measure({}, f => f.sim.getForecast(20, { previewOnly: true })), []);
  const f = fixture({ 'op.strata-reader': 2 });
  try {
    const live = f.sim.getForecast(20, { previewOnly: true }), full = f.sim.getForecast(20);
    assert.ok(live.length > 1, 'nonempty live forecast');
    assert.deepEqual(stratumForecastReadout(live), stratumForecastReadout(full), 'display uses the same confidence');
    for (const row of live) {
      assert.equal(row.expectedRopMh, null); assert.equal(row.optimal, null);
      assert.ok(full.find(f => f.top === row.top).expectedRopMh > 0, 'full log retains modelled rate');
    }
  } finally { f.close(); }
});

// Exercise the real closure's refresh/presentation against an actual sim, with
// only its display sinks stubbed. AST assertions bind it to the mount, reset
// and low-priority paint call sites; this is CPU integration, not visual QA.
const source = readFileSync(new URL('../src/ui/screens/site.js', import.meta.url), 'utf8');
const ast = parseAst(source), all = [];
function walk(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type) all.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(walk); else if (value && typeof value === 'object') walk(value);
  }
}
walk(ast);
function extract(predicate) {
  const matches = all.filter(predicate); assert.equal(matches.length, 1, 'one real source implementation');
  return source.slice(matches[0].start, matches[0].end);
}
const refresh = extract(n => n.type === 'FunctionDeclaration' && n.id?.name === 'refreshForecast');
const present = extract(n => n.type === 'FunctionDeclaration' && n.id?.name === 'presentForecast');
const decl = extract(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === 'forecastStamp'));
const alertDecl = ['ALERT_SEC', 'alertHold', 'alertMode'].map(name =>
  extract(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === name))).join('\n');
const say = extract(n => n.type === 'FunctionDeclaration' && n.id?.name === 'say');
const makeUI = new Function('ctx', 'stratumForecastReadout', 'notice', 'log', `
  ${alertDecl};${decl};${say};${refresh};${present};
  let rendered = null;
  const app = { haptic() {} };
  function paintAlert(title, sub, kind, mode) {
    rendered = { title, sub, kind, mode }; alertMode = mode; notice(title, sub, kind, mode);
  }
  function clearAlert() { rendered = null; alertMode = null; alertHold = 0; }
  return { refresh: refreshForecast, present: presentForecast, strike: say,
    pending: () => pendingForecast, rendered: () => rendered, hold: () => alertHold };`);

test('site refresh notices new rank/contact once, clears stale notices, and logs presented confidence', () => {
  const f = fixture(), notices = [], logs = [];
  const ui = makeUI(f.ctx, stratumForecastReadout, (...a) => notices.push(a), (...a) => logs.push(a));
  try {
    ui.refresh(); ui.present(); assert.equal(notices.length, 0);
    f.state.player.skills['op.strata-reader'] = 1;
    f.bus.emit(EVENTS.UNLOCK, { kind: 'skill', id: 'op.strata-reader', rank: 1 });
    ui.refresh(); assert.ok(ui.pending()); ui.present();
    assert.equal(notices.length, 1); assert.match(logs[0][1], /log confidence 60\/100/);
    for (let i = 0; i < 16; i++) { ui.refresh(); ui.present(); }
    assert.equal(notices.length, 1, 'steady contact does not monopolise the strip');
    f.state.player.skills['op.strata-reader'] = 2;
    f.bus.emit(EVENTS.UNLOCK, { kind: 'skill', id: 'op.strata-reader', rank: 2 });
    ui.refresh(); ui.present(); assert.equal(notices.length, 2); assert.match(notices[1][1], /71\/100/);
    f.sim.debug.setDepth(8.1); // QA placement after the contact, never raw state mutation.
    ui.refresh(); assert.ok(ui.pending()); assert.equal(ui.pending().title, 'Granite ahead');
    f.sim.abortHole(); ui.refresh(); assert.equal(ui.pending(), null, 'terminated run cannot show stale forecast');
    assert.equal(ui.rendered(), null, 'an ended run invalidates the visible forecast as well');
  } finally { f.close(); }
});

test('refresh clears a stale visible preview after contact changes but preserves a genuine hazard hold', () => {
  const f = fixture({ 'op.strata-reader': 1 });
  const ui = makeUI(f.ctx, stratumForecastReadout, () => {}, () => {});
  try {
    ui.refresh(); ui.present(); assert.equal(ui.rendered().title, 'Gneiss ahead');
    f.sim.debug.setDepth(8.1); ui.refresh();
    assert.equal(ui.rendered(), null, 'old contact no longer remains visible');
    ui.present(); assert.equal(ui.rendered().title, 'Granite ahead');
    ui.strike('Cavity', 'Ease feed', 'danger'); const hold = ui.hold();
    f.sim.abortHole(); ui.refresh();
    assert.equal(ui.rendered().title, 'Cavity'); assert.equal(ui.hold(), hold);
    assert.equal(ui.pending(), null);
  } finally { f.close(); }
});

test('site connects refresh to bounded paint cadence and mount, with hazard priority and reset', () => {
  const paint = extract(n => n.type === 'FunctionDeclaration' && n.id?.name === 'paint');
  const mount = extract(n => n.type === 'Property' && n.method && n.key?.name === 'mount');
  const reset = extract(n => n.type === 'FunctionDeclaration' && n.id?.name === 'resetProgramme');
  assert.match(paint, /if \(progAccum >= 0\.125\)\s*\{\s*progAccum = 0;\s*refreshForecast\(\)/);
  assert.match(mount, /refreshForecast\(\)/);
  assert.match(reset, /pendingForecast = null; forecastStamp = ''/);
  assert.match(paint, /if \(warn && warn\.hint\)[\s\S]*?else if \(pendingForecast\)\s*\{\s*presentForecast\(\)/,
    'forecast remains below the real warning branch');
});

console.log(`Passive skill consumers: ${checks} groups passed.`);
