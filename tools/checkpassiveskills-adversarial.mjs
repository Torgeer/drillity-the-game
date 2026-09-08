#!/usr/bin/env node
// Independent CPU adversarial checks. The alert test runs the real selection
// statements and closure helpers with display sinks only substituted. This is
// neither a rendered-screen result nor a hardware performance measurement.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { parseAst } from 'rollup/parseAst';
import { createGameState, createBus, GROUND, EVENTS } from '../src/core/contract.js';
import { defaultLoadoutFor, getMethod, getSkill } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim, TUNING } from '../src/sim/drilling.js';
import { stratumForecastReadout } from '../src/ui/screens/site.js';

let pass = 0, fail = 0;
function test(name, run) {
  try { run(); pass++; console.log(`PASS ${name}`); }
  catch (error) { fail++; console.error(`FAIL ${name}: ${error.message}`); }
}
const near = (a, b) => assert.ok(Number.isFinite(a) && Math.abs(a - b) < 1e-8, `${a} != ${b}`);
function fixture(skills = {}, factory = createDrillSim) {
  const state = createGameState(), bus = createBus();
  state.player.skills = { ...skills }; state.player.level = 60; state.player.skillPoints = 100;
  state.garage.rigId = getMethod('core').rigIds[0];
  state.garage.loadout = defaultLoadoutFor('core', 60);
  state.contract = { id: 'independent-passives', methodId: 'core', regionId: 'nordic',
    targetDepth: 100, holes: 1, difficulty: 0, seed: 811, archetype: 'quarry', flushMedium: 'water' };
  const strata = [
    { ...GROUND.granite, id: 'granite', top: 0, bottom: 11, index: 0 },
    { ...GROUND.gneiss, id: 'gneiss', top: 11, bottom: 29, index: 1 },
    { ...GROUND.granite, id: 'granite', top: 29, bottom: 50, index: 2 },
    { ...GROUND.gneiss, id: 'gneiss', top: 50, bottom: 200, index: 3 },
  ];
  let groundQueries = 0;
  const ctx = { state, bus, geology: { strata, getDrillabilityAt(depth) {
    groundQueries++;
    return strata.find(row => depth >= row.top && depth < row.bottom) || strata.at(-1);
  } } };
  const sim = factory(ctx); ctx.sim = sim; sim.init(); sim.startHole(state.contract);
  return { state, bus, ctx, sim, queries: () => groundQueries, close: () => sim.dispose() };
}
function run(skills, body, factory) { const f = fixture(skills, factory); try { return body(f); } finally { f.close(); } }
const passiveIds = ['op.strata-reader', 'op.combo-keeper', 'op.deep-focus'];
const allRanks = value => Object.fromEntries(passiveIds.map(id => [id, value]));
function earn(f) {
  for (let step = 0; step < 2400; step++) {
    const t = f.sim.getTelemetry();
    assert.equal(t.phase, 'drilling');
    f.sim.setInput('feed', t.wobCmd + (t.sweetSpot.center01 - t.gauge.value) * .075);
    f.sim.setInput('rotation', .6); f.sim.setInput('flush', 1);
    f.sim.debug.stepFixed(1);
    const after = f.sim.getTelemetry();
    if (after.greenBandTime >= TUNING.groove.comboRampSec) return after;
  }
  assert.fail('public controls did not earn the groove');
}
function trip(f) {
  const earned = earn(f); f.sim.setInput('feed', 0);
  for (let i = 0; i < 240; i++) {
    const a = f.sim.getTelemetry(); f.sim.debug.stepFixed(1); const b = f.sim.getTelemetry();
    if (b.greenBandTime < a.greenBandTime) return { earned, loss: a.greenBandTime - b.greenBandTime };
  }
  assert.fail('feed cut did not cause out-of-band loss');
}

test('combined maximum purchases keep actual combo finite and bounded at 2.65 while slowing decay', () => {
  const baseline = run({}, trip);
  const row = run(allRanks(100), trip);
  near(row.earned.combo, 2.65); near(row.loss / baseline.loss, .28);
  assert.ok(row.earned.depth > baseline.earned.depth);
  assert.ok(row.earned.rop > 0 && row.earned.greenBandTime <= TUNING.groove.comboRampSec);
});

test('zero, malformed and fractional saved ranks cannot create or exceed authored effects', () => {
  const base = run({}, f => f.sim.getForecast(80));
  for (const value of [0, -1, null, true, [], {}, 'Infinity', NaN, Infinity, '0.9']) {
    const rows = run(allRanks(value), f => f.sim.getForecast(80));
    assert.deepEqual(rows, base, `malformed rank ${String(value)}`);
  }
  near(run({ 'op.strata-reader': '2.99' }, f => f.sim.getForecast(80)[1].confidence), 1 - 11 / 28);
  const capped = run({ 'op.combo-keeper': 1000, 'op.deep-focus': 1000 }, trip);
  near(capped.earned.combo, 2.65);
});

test('real purchases preserve active depth, charge authored costs, and refresh all consumers', () => {
  run({ 'op.percussion-rhythm': 1, 'op.jam-sense': 1 }, f => {
    const p = createProgression(f.ctx);
    try {
      f.sim.setInput('feed', .5); f.sim.debug.stepFixed(120);
      const depth = f.sim.getTelemetry().depth, points = f.state.player.skillPoints;
      let spent = 0;
      for (const id of passiveIds) {
        assert.equal(p.spendSkillPoint(id).ok, true);
        spent += getSkill(id).cost[0];
        near(f.sim.getTelemetry().depth, depth);
      }
      assert.equal(f.state.player.skillPoints, points - spent);
      near(f.sim.getForecast(80)[1].confidence, 1 - (11 - depth) / 20);
      near(earn(f).combo, 2.35);
    } finally { p.dispose(); }
  });
});

test('new-hole refresh uses reloaded ranks; unrelated unlock notifications do not invent rank changes', () => {
  run({}, f => {
    const before = f.sim.getForecast(80);
    f.state.player.skills['op.strata-reader'] = 2;
    f.bus.emit(EVENTS.UNLOCK, { kind: 'region', id: 'nordic' });
    assert.deepEqual(f.sim.getForecast(80), before);
    f.sim.abortHole(); f.sim.startHole(f.state.contract);
    near(f.sim.getForecast(80)[1].confidence, 1 - 11 / 28);
  });
});

test('lightweight forecast causes no ground point queries and preserves physical simulation state', () => {
  run(allRanks(100), f => {
    const before = structuredClone(f.sim.getTelemetry()), queries = f.queries();
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      const rows = f.sim.getForecast(20, { previewOnly: true });
      assert.equal(rows.length, 2);
      assert.ok(rows.every(r => r.expectedRopMh === null && r.optimal === null));
    }
    const milliseconds = performance.now() - start;
    assert.equal(f.queries(), queries);
    assert.deepEqual(f.sim.getTelemetry(), before);
    console.log(`INFO 10,000 two-row forecast calls: ${milliseconds.toFixed(2)} ms (CPU fixture only)`);
  });
  run({}, f => assert.deepEqual(f.sim.getForecast(20, { previewOnly: true }), []));
});

test('player notice shows a bounded game index and rejects invalid or current-only rows', () => {
  run(allRanks(100), f => {
    const rows = f.sim.getForecast(80, { previewOnly: true });
    const notice = stratumForecastReadout(rows);
    assert.equal(notice.title, 'Gneiss ahead');
    assert.match(notice.sub, /log confidence 61\/100/);
    assert.ok(!/accuracy|probability|%/i.test(notice.sub));
    assert.equal(stratumForecastReadout([rows[0]]), null);
    for (const patch of [{ distance: NaN }, { confidence: Infinity }, { top: NaN }, { distance: 0 }, { previewRanks: 0 }]) {
      assert.equal(stratumForecastReadout([{ ...rows[1], ...patch }]), null);
    }
  });
});

// Execute the exact alert selector, say(), and forecast closure rather than a
// hand-maintained model of their intended ordering. Actual DOM painting is a sink.
const source = readFileSync(new URL('../src/ui/screens/site.js', import.meta.url), 'utf8');
const ast = parseAst(source), nodes = [];
function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (n.type) nodes.push(n);
  for (const v of Object.values(n)) if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') walk(v);
}
walk(ast);
function unique(predicate) { const found = nodes.filter(predicate); assert.equal(found.length, 1); return found[0]; }
const textOf = node => source.slice(node.start, node.end);
const fn = name => textOf(unique(n => n.type === 'FunctionDeclaration' && n.id?.name === name));
const declaration = name => textOf(unique(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === name)));
const paint = unique(n => n.type === 'FunctionDeclaration' && n.id?.name === 'paint');
const first = paint.body.body.findIndex(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === 'wellAlarm'));
const last = paint.body.body.findIndex((n, i) => i > first && n.type === 'ExpressionStatement' && n.expression?.type === 'AssignmentExpression' && n.expression.left?.name === 'pendingContact');
assert.ok(first >= 0 && last > first, 'real alert selector boundaries');
const selector = source.slice(paint.body.body[first].start, paint.body.body[last].end);
const createAlert = new Function('ctx', 'stratumForecastReadout', `
  let rendered = null, logs = [], haptics = [], well = null, simTel = null, pendingContact = null;
  const app = { haptic: kind => haptics.push(kind) };
  function paintAlert(title, sub, kind, mode, progress) { rendered = { title, sub, kind, mode, progress }; alertMode = mode; }
  function paintWell() { return well; }
  function clearAlert() { rendered = null; alertMode = null; alertHold = 0; }
  function log(...args) { logs.push(args); }
  ${declaration('ALERT_SEC')}
  ${declaration('alertHold')}
  ${declaration('alertMode')}
  ${declaration('forecastStamp')}
  ${fn('say')}
  ${fn('splitHint')}
  ${fn('refreshForecast')}
  ${fn('presentForecast')}
  function frame(dt, warning = null, incomingWell = null) { simTel = { warning }; well = incomingWell; ${selector} }
  return { frame, refresh: refreshForecast, strike: say, rendered: () => rendered, logs: () => logs, hold: () => alertHold,
    contact: (title, sub) => { pendingContact = [title, sub]; } };
`);

test('pending forecasts cannot displace existing hazard or well warnings', () => {
  run({ 'op.strata-reader': 2 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout); ui.refresh();
    ui.frame(1/60, { kind: 'collapse', hint: 'COLLAPSE — ease feed', severity: 1 });
    assert.equal(ui.rendered().kind, 'danger'); assert.equal(ui.logs().length, 0);
    ui.frame(1/60, null, { title: 'Kick', sub: 'Shut in', kind: 'danger', telegraph: true, p: .5 });
    assert.equal(ui.rendered().title, 'Kick');
  });
});

test('a warning arriving one frame after a forecast immediately preempts the low-priority notice', () => {
  run({ 'op.strata-reader': 2 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout); ui.refresh(); ui.frame(1/60);
    assert.equal(ui.rendered().title, 'Gneiss ahead');
    ui.frame(1/60, { kind: 'collapse', hint: 'COLLAPSE — ease feed', severity: 1 });
    assert.equal(ui.rendered().kind, 'danger', `forecast still holds for ${ui.hold()} seconds`);
  });
});

test('a well-control alarm arriving after a forecast immediately preempts that notice', () => {
  run({ 'op.strata-reader': 2 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout); ui.refresh(); ui.frame(1/60);
    ui.frame(1/60, null, { title: 'Kick', sub: 'Shut in', kind: 'danger', telegraph: true, p: .1 });
    assert.equal(ui.rendered().title, 'Kick');
  });
});

test('a contact arriving with a new hazard cannot steal the forecast preemption frame', () => {
  run({ 'op.strata-reader': 2 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout); ui.refresh(); ui.frame(1/60);
    ui.contact('Gneiss', 'Ground contact');
    ui.frame(1/60, { kind: 'collapse', hint: 'COLLAPSE — ease feed', severity: 1 });
    assert.equal(ui.rendered().kind, 'danger');
    assert.notEqual(ui.rendered().title, 'Gneiss');
  });
});

test('both telegraph and flowing-well alarms preempt a forecast without waiting for its hold', () => {
  for (const telegraph of [true, false]) {
    run({ 'op.strata-reader': 2 }, f => {
      const ui = createAlert(f.ctx, stratumForecastReadout); ui.refresh(); ui.frame(1/60);
      ui.frame(1/120, null, { title: 'Pit gain', sub: 'Shut in', kind: 'danger', telegraph, p: .9 });
      assert.equal(ui.rendered().title, 'Pit gain');
      assert.equal(ui.rendered().mode, telegraph ? 'telegraph' : 'strike');
    });
  }
});

test('a real danger strike replaces a forecast and keeps its full authored hold', () => {
  run({ 'op.strata-reader': 2 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout); ui.refresh(); ui.frame(1/60);
    ui.strike('Cavity — return lost', 'Cut the feed now', 'danger');
    ui.frame(1/60, { kind: 'boulder', hint: 'BOULDER — ease feed', severity: .3 });
    assert.equal(ui.rendered().title, 'Cavity — return lost');
    assert.equal(ui.rendered().mode, 'strike'); near(ui.hold(), 3.4 - 1/60);
  });
});

test('ending the actual hole clears an already-visible forecast on the next refresh', () => {
  run({ 'op.strata-reader': 2 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout); ui.refresh(); ui.frame(1/60);
    assert.equal(ui.rendered().title, 'Gneiss ahead');
    f.sim.abortHole(); ui.refresh(); ui.frame(1/60);
    assert.equal(ui.rendered(), null, 'ended hole must not retain a visible forecast');
    assert.equal(ui.logs().length, 1, 'clearing does not log another notice');
  });
});

test('crossing the forecast contact cannot retain the old ahead notice on refresh', () => {
  run({ 'op.strata-reader': 2 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout); ui.refresh(); ui.frame(1/60);
    assert.equal(ui.rendered().title, 'Gneiss ahead');
    f.sim.debug.setDepth(11.1); ui.refresh(); ui.frame(1/60);
    assert.equal(ui.rendered().title, 'Granite ahead');
    assert.equal(ui.logs().length, 2);
  });
});

test('forecast invalidation never removes an actual struck-hazard notice', () => {
  run({ 'op.strata-reader': 2 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout); ui.refresh(); ui.frame(1/60);
    ui.strike('Cavity — return lost', 'Cut the feed now', 'danger');
    f.sim.abortHole(); ui.refresh(); ui.frame(1/60);
    assert.equal(ui.rendered().title, 'Cavity — return lost');
    assert.equal(ui.rendered().mode, 'strike'); near(ui.hold(), 3.4 - 1/60);
  });
});

test('stable forecasts do not produce repeated logs after the notice expires', () => {
  run({ 'op.strata-reader': 1 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout);
    for (let i = 0; i < 500; i++) { if (i % 8 === 0) ui.refresh(); ui.frame(1/60); }
    assert.equal(ui.logs().length, 1);
  });
});

test('actual struck-hazard holds remain unchanged when a lower-priority telegraph arrives', () => {
  run({ 'op.strata-reader': 1 }, f => {
    const ui = createAlert(f.ctx, stratumForecastReadout);
    ui.refresh(); ui.strike('Cavity — return lost', 'Cut the feed now', 'danger');
    ui.frame(1/60, { kind: 'boulder', hint: 'BOULDER — ease feed', severity: .3 });
    assert.equal(ui.rendered().title, 'Cavity — return lost');
    near(ui.hold(), 3.4 - 1/60);
    assert.equal(ui.logs().length, 0);
  });
});

test('the actual programme-paint branch limits live preview refresh to at most eight calls per second', () => {
  const increment = paint.body.body.find(n => n.type === 'ExpressionStatement'
    && n.expression?.type === 'AssignmentExpression' && n.expression.operator === '+='
    && n.expression.left?.name === 'progAccum');
  assert.ok(increment);
  const pos = paint.body.body.indexOf(increment), branch = paint.body.body[pos + 1];
  assert.equal(branch.type, 'IfStatement');
  const script = `${textOf(increment)};${textOf(branch)}`;
  assert.ok(script.includes('refreshForecast()'), 'real branch must call the consumer');
  const clock = new Function(`let progAccum = 0, calls = 0;
    const simTel = null, prog = null;
    function refreshForecast() { calls++; }
    function paintRail() {} function paintBlowChart() {} function checkUnit() {}
    return { step(dt) { ${script} }, calls: () => calls };`)();
  for (let i = 0; i < 1200; i++) clock.step(1 / 120);
  assert.ok(clock.calls() > 0 && clock.calls() <= 80, `10 seconds produced ${clock.calls()} preview calls`);
});

// Optional reviewer-only differential against the separately accepted shared
// resolver dependency. It is never required for the portable shipping gate.
if (process.argv.includes('--dependency-baseline')) {
  const baseRoot = resolve('../drillity-skill-effects');
  assert.ok(existsSync(resolve(baseRoot, 'src/sim/drilling.js')));
  const meta = JSON.parse(readFileSync('../drillity-coordination/passive-skills-delta.json', 'utf8'));
  for (const [path, expected] of Object.entries(meta.dependency_sha256)) {
    const actual = createHash('sha256').update(readFileSync(resolve(baseRoot, path))).digest('hex');
    assert.equal(actual, expected, `baseline dependency changed: ${path}`);
  }
  const baseline = await import(pathToFileURL(resolve(baseRoot, 'src/sim/drilling.js')));
  test('rank-zero actual drilling is byte-identical to accepted dependency telemetry', () => {
    const a = fixture({}, baseline.createDrillSim), b = fixture();
    try {
      for (let i = 0; i < 1500; i++) {
        const feed = .15 + .65 * ((i % 121) / 121);
        for (const f of [a, b]) { f.sim.setInput('feed', feed); f.sim.setInput('rotation', .58); f.sim.setInput('flush', .8); f.sim.debug.stepFixed(1); }
        assert.deepEqual(b.sim.getTelemetry(), a.sim.getTelemetry(), `fixed step ${i}`);
      }
    } finally { a.close(); b.close(); }
  });
}

console.log(`Passive skill adversarial: ${pass} passed, ${fail} failed.`);
if (fail) process.exitCode = 1;
