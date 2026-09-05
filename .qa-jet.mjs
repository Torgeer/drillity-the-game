/**
 * .qa-jet.mjs — headless measurement of the jet grouting two-stage model.
 *
 * sim/drilling.js imports only core/contract.js, so a whole run plays in node
 * with no GPU. Measured here:
 *   1. the clock and the stage split across the contract's depth range
 *   2. soil erodibility — the sourced ordering, cohesionless above cohesive
 *   3. the EN 12716 250 bar floor as a live threshold
 *   4. ADVANCE lifts (actionDepth counts DOWN), it does not push down
 *   5. the return gauge, and both of its failures
 *   6. frame-rate independence: 30 vs 120 fps, identical to three decimals
 *   7. that nothing unsourced is published as a number
 *
 * The score comes off HOLE_COMPLETE.breakdown — never re-derived here.
 * Run: node .qa-jet.mjs
 */
import { createDrillSim } from './src/sim/drilling.js';
import { EVENTS } from './src/core/contract.js';

function mkCtx() {
  const listeners = new Map();
  const done = [];
  const state = { drill: {}, garage: { loadout: {} }, world: {}, contract: null };
  const bus = {
    on(e, fn) {
      if (!listeners.has(e)) listeners.set(e, []);
      listeners.get(e).push(fn);
      return () => {};
    },
    emit(e, p) {
      if (e === EVENTS.HOLE_COMPLETE) done.push(p);
      (listeners.get(e) || []).forEach((f) => f(p));
    },
  };
  return { state, bus, done };
}

function run({ depth = 30, ground = null, policy, sec = 6000, dt = 1 / 120 }) {
  const ctx = mkCtx();
  const sim = createDrillSim(ctx);
  sim.startHole({
    methodId: 'jet-grouting', method: { id: 'jet-grouting', flushMedium: 'mud' },
    targetDepth: depth, seed: 4242, difficulty: 3,
    ground: ground ? [ground] : null,
  });
  let t = 0, stage0Sec = 0;
  const trace = [];
  const n = Math.round(sec / dt);
  for (let i = 0; i < n; i++) {
    const tel = sim.getTelemetry();
    if (!tel.active) break;
    if (tel.stage === 0) stage0Sec = t;
    else if (i % 3000 === 0) trace.push(+tel.actionDepth.toFixed(2));
    const p = policy ? policy(tel, t) : null;
    if (p) {
      if (p.feed != null) sim.setInput('feed', p.feed);
      if (p.rotation != null) sim.setInput('rotation', p.rotation);
      if (p.flush != null) sim.setInput('flush', p.flush);
    }
    sim.update(dt, ctx.state);
    t += dt;
  }
  const tel = sim.getTelemetry();
  const hc = ctx.done[ctx.done.length - 1] || null;
  return { tel, t, stage0Sec, trace, ctx, sim, hc, S: sim.debug.state,
           jet: (tel.programme && tel.programme.jet) || null,
           q: (hc && hc.breakdown && hc.breakdown.quality) || null,
           grade: hc && hc.breakdown ? hc.breakdown.grade : '—',
           total: hc && hc.breakdown ? hc.breakdown.total : 0 };
}

/** A competent operator: hold each stage's own optimum. */
const good = (tel) => (tel.stage === 0
  ? { feed: 0.34, rotation: 0.50, flush: 0.62 }
  : { feed: 0.45, rotation: 0.62, flush: 0.55 });
const at = (feed, rot, fl) => (tel) => (tel.stage === 0
  ? { feed: 0.34, rotation: 0.50, flush: 0.62 } : { feed, rotation: rot, flush: fl });

console.log('=== 1. CLOCK AND STAGE SPLIT (competent operator, silt) ===');
for (const d of [5, 20, 40, 60]) {
  const r = run({ depth: d, policy: good, ground: 'silt' });
  console.log(`  ${String(d).padStart(2)} m  total ${r.t.toFixed(1).padStart(6)} s `
    + `(${(r.t / 60).toFixed(1)} min)   pre-drill ${r.stage0Sec.toFixed(0).padStart(4)} s   `
    + `lift ${(r.t - r.stage0Sec).toFixed(0).padStart(4)} s   `
    + `grade ${r.grade} ${r.total.toFixed(3)}   `
    + `column ${r.q ? r.q.columnMean01.toFixed(2) : '—'} worst ${r.q ? r.q.columnWorst01.toFixed(2) : '—'}`);
}

console.log('\n=== 2. SOIL ERODIBILITY — same settings, different ground ===');
console.log('    sourced ordering only: cohesionless > cohesive [KELLER-JET]');
console.log('    NOTE: a 100 %% sand or gravel column sticks the string in the');
console.log('    PRE-DRILL on every method in the game (hdd, cfa, auger and sonic');
console.log('    all abort by 5 m) — a pre-existing property of stability 0.15/0.20');
console.log('    ground with no casing, not of this model. So the bed is forced');
console.log('    during the lift, off a clay pre-drill, to read the index itself.');
for (const g of ['sand', 'gravel', 'silt', 'clay', 'marl', 'till']) {
  const ctx = mkCtx();
  const sim = createDrillSim(ctx);
  sim.startHole({ methodId: 'jet-grouting', method: { flushMedium: 'mud' },
    targetDepth: 12, seed: 4242, difficulty: 3, ground: ['clay'] });
  let forced = false, peak = null;
  for (let i = 0; i < 400000; i++) {
    const tel = sim.getTelemetry();
    if (!tel.active) break;
    if (tel.stage === 1 && !forced) { sim.debug.forceStratum(g); forced = true; }
    const p = good(tel);
    sim.setInput('feed', p.feed); sim.setInput('rotation', p.rotation); sim.setInput('flush', p.flush);
    sim.update(1 / 120, ctx.state);
    const t2 = sim.getTelemetry();
    if (forced && t2.programme && t2.programme.jet) peak = t2.programme.jet;
  }
  console.log(`  ${g.padEnd(7)} erod ${peak ? peak.erodibility01.toFixed(2) : '—'}   `
    + `column ${peak ? peak.column01.toFixed(2) : '—'}   `
    + `return ${peak ? peak.return01.toFixed(2) : '—'}`);
}

console.log('\n=== 3. THE EN 12716 FLOOR IS A LIVE THRESHOLD ===');
for (const rot of [0.20, 0.30, 0.357, 0.40, 0.62, 0.90]) {
  const r = run({ depth: 20, ground: 'silt', policy: at(0.45, rot, 0.55) });
  const j = r.jet;
  console.log(`  WORK ${rot.toFixed(3)} -> ${String(j ? j.bar : 0).padStart(3)} bar  `
    + `${j && j.belowFloor ? 'BELOW FLOOR' : 'jetting    '}  `
    + `belowFloorM ${j ? j.belowFloorM.toFixed(1).padStart(5) : '—'}  `
    + `column ${r.q ? r.q.columnMean01.toFixed(2) : '—'}  `
    + `quality ${r.q ? r.q.score.toFixed(3) : '—'}  grade ${r.grade}`);
}

console.log('\n=== 4. ADVANCE LIFTS. IT DOES NOT PUSH DOWN. ===');
{
  const r = run({ depth: 20, ground: 'silt', policy: good });
  console.log(`  stage 1 "${r.tel.stageName}"  reverse ${r.tel.stageReverse}`);
  console.log(`  actionDepth through the lift: ${r.trace.join(' -> ')}`);
  console.log(`  monotonically decreasing: `
    + `${r.trace.every((v, i) => i === 0 || v <= r.trace[i - 1]) ? 'PASS' : 'FAIL'}`);
  console.log(`  contract depth is pinned at target through the lift: `
    + `${r.tel.depth.toFixed(3)} / ${r.tel.target.toFixed(3)}`);
}

console.log('\n=== 5. THE RETURN, AND BOTH WAYS OF LOSING IT ===');
{
  const cases = [
    ['optimum, silt',                'silt', 0.45, 0.62, 0.55],
    ['over-jetting, silt',           'silt', 0.45, 0.90, 0.55],
    ['fast lift + full pump, SAND',  'sand', 0.90, 0.90, 0.55],
    ['slow lift + full pump, SAND',  'sand', 0.20, 0.90, 0.55],
    ['slow lift + full pump, TILL',  'till', 0.20, 0.90, 0.55],
    ['slow lift + full pump, CLAY',  'clay', 0.20, 0.90, 0.55],
    ['balanced, TILL',               'till', 0.40, 0.75, 0.55],
  ];
  for (const [name, g, f, rot, fl] of cases) {
    const ctx = mkCtx();
    const sim = createDrillSim(ctx);
    sim.startHole({ methodId: 'jet-grouting', method: { flushMedium: 'mud' },
      targetDepth: 12, seed: 4242, difficulty: 3, ground: ['clay'] });
    let forced = false, j = null, lost = 0, heave = 0;
    for (let i = 0; i < 400000; i++) {
      const tel = sim.getTelemetry();
      if (!tel.active) break;
      if (tel.stage === 1 && !forced) { sim.debug.forceStratum(g); forced = true; }
      const p = tel.stage === 0 ? good(tel) : { feed: f, rotation: rot, flush: fl };
      sim.setInput('feed', p.feed); sim.setInput('rotation', p.rotation); sim.setInput('flush', p.flush);
      sim.update(1 / 120, ctx.state);
      const t2 = sim.getTelemetry();
      if (forced && t2.programme && t2.programme.jet) {
        j = t2.programme.jet; lost = j.lostM; heave = j.heaveM;
      }
    }
    console.log(`  ${name.padEnd(30)} return ${j ? j.return01.toFixed(2) : '—'}  `
      + `lostM ${lost.toFixed(1).padStart(4)}  heaveM ${heave.toFixed(1).padStart(4)}  `
      + `column ${j ? j.column01.toFixed(2) : '—'}  `
      + `${j && j.return01 <= 0.13 ? 'RETURN LOST' : j && j.return01 >= 0.88 ? 'HEAVE' : ''}`);
  }
}

console.log('\n=== 6. FRAME-RATE INDEPENDENCE (standing requirement) ===');
for (const g of ['silt', 'clay', 'till']) {
  const a = run({ depth: 30, ground: g, policy: good, dt: 1 / 30 });
  const b = run({ depth: 30, ground: g, policy: good, dt: 1 / 120 });
  const ok = a.tel.depth.toFixed(3) === b.tel.depth.toFixed(3)
    && a.S.prog.passM.toFixed(3) === b.S.prog.passM.toFixed(3)
    && a.total.toFixed(3) === b.total.toFixed(3);
  console.log(`  ${g.padEnd(5)}  30fps depth ${a.tel.depth.toFixed(3)} passM ${a.S.prog.passM.toFixed(3)} total ${a.total.toFixed(3)}`);
  console.log(`  ${''.padEnd(5)} 120fps depth ${b.tel.depth.toFixed(3)} passM ${b.S.prog.passM.toFixed(3)} total ${b.total.toFixed(3)}`);
  console.log(`  ${''.padEnd(5)} identical to 3 dp: ${ok ? 'PASS' : 'FAIL'}`);
}

console.log('\n=== 7. NOTHING UNSOURCED IS PUBLISHED AS A NUMBER ===');
{
  const r = run({ depth: 20, ground: 'silt', policy: good });
  const j = r.jet;
  console.log('  programme.jet gates:', JSON.stringify({
    columnDiaKnown: j.columnDiaKnown,
    withdrawRateKnown: j.withdrawRateKnown,
    rotationSpeedKnown: j.rotationSpeedKnown,
  }));
  console.log(`  the only unit anywhere: ${j.bar} bar  (floor ${j.floorBar}, pump max ${j.maxBar})`);
  console.log('  breakdown.quality axis:', r.q.axis, '  keys:', Object.keys(r.q).join(', '));
  console.log('  state.drill:', JSON.stringify({
    methodId: r.ctx.state.drill.methodId,
    flushMedium: r.ctx.state.drill.flushMedium,
    gaugeLabel: r.ctx.state.drill.gaugeLabel,
    gaugeAxis: r.ctx.state.drill.gaugeAxis,
    stageName: r.ctx.state.drill.stageName,
    columnDiaKnown: r.ctx.state.drill.columnDiaKnown,
  }));
}
