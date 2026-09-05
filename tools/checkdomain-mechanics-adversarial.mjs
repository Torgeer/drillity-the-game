#!/usr/bin/env node
// Independent black-box regression: public real sim, full fixed-step installs.
// Usage: node tools/checkdomain-mechanics-adversarial.mjs [module-root] [bolt|pile]
// Ground/input fixtures are controlled experiments, not claimed field rates.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = resolve(process.argv[2] || '.');
const mode = process.argv[3] || 'all';
const load = p => import(pathToFileURL(resolve(root, p)));
const { createGameState, createBus } = await load('src/core/contract.js');
const { createDrillSim, methodOf, hammerSetting } = await load('src/sim/drilling.js');
const tests = [], measurements = [];
const test = (name, run) => tests.push({ name, run });
function installed(bit, install = 'friction-bolt-39', condition = 1) {
  const state = createGameState();
  state.garage.loadout = { bit, install };
  state.garage.condition = { [bit]: condition };
  const ground = { id: 'granite', name: 'Controlled competent rock', ucs: 210,
    abrasivity: 0, stability: 1, water: 0, index: 0, top: 0, bottom: 100 };
  const sim = createDrillSim({ state, bus: createBus(), geology: {
    strata: [ground], getDrillabilityAt: () => ground,
  }});
  try {
    sim.startHole({ methodId: 'rockbolt', targetDepth: 1, seed: 123, flushMedium: 'water' });
    sim.debug.godMode = true; // Hold supplied wear fixed; use real installation steps.
    for (let i = 0; i < 24000; i++) {
      const t = sim.getTelemetry();
      const first = t.programme?.installs?.[0];
      if (first) {
        if (first.slotClosureIn == null && first.type === 'friction') {
          const before = structuredClone({ phase: t.phase, installs: t.programme.installs });
          assert.equal(sim.pulse('inspectSlot').ok, false, 'Absent slot measurement must not become a zero reading');
          const after = sim.getTelemetry();
          assert.deepEqual({ phase: after.phase, installs: after.programme.installs }, before,
            'Refused unknown slot inspection does not mark an install inspected or start an inspection beat');
        }
        measurements.push({ bit, install, condition, ...first }); return first;
      }
      sim.setInput('feed', t.optimal.wob);
      sim.setInput('rotation', t.optimal.rpm);
      sim.setInput('flush', t.optimal.flush);
      sim.debug.stepFixed(1);
    }
    assert.fail(`No real install completed for ${bit}/${install}`);
  } finally { sim.dispose(); }
}
if (mode !== 'pile') {
  test('manufacturer-supported trial bit remains eligible through a real granite pattern', () => {
    const state = createGameState(); state.garage.loadout = {
      bit: 'bolt-bit-38', install: 'friction-bolt-39',
    };
    const sim = createDrillSim({ state, bus: createBus() });
    try {
      sim.startHole({ methodId: 'rockbolt', targetDepth: 1, seed: 123, flushMedium: 'water' });
      sim.debug.godMode = true; sim.debug.forceStratum('granite');
      sim.debug.simulate(120, t => ({ feed: t.optimal.wob,
        rotation: t.optimal.rpm, flush: t.optimal.flush }));
      const installs = sim.getTelemetry().programme.installs;
      assert.equal(installs.length, 3, 'Must exercise subsequent physical installs');
      measurements.push({ granitePattern: installs });
      // The manufacturer proposes a BIT trial range, not a capacity threshold
      // for an estimated hole after the game's unsourced overbreak transform.
      assert.ok(installs.every(i => i.anchorage01 === 1), JSON.stringify(installs));
    } finally { sim.dispose(); }
  });
  test('supported 38 mm hole beats undersized 33 mm for fitted 39 mm tube', () => {
    const correct = installed('bolt-bit-38'), small = installed('bolt-bit-33');
    assert.ok(correct.anchorage01 > small.anchorage01, JSON.stringify({ correct, small }));
  });
  test('supported 38 mm hole beats oversized 39 mm hole for fitted 39 mm tube', () => {
    assert.ok(installed('bolt-bit-38').anchorage01 > installed('bolt-bit-39').anchorage01);
  });
  test('wear cannot turn already undersized 33 mm hole into a better installation', () => {
    assert.ok(installed('bolt-bit-33', 'friction-bolt-39', 0.5).anchorage01
      <= installed('bolt-bit-33').anchorage01);
  });
  test('changing tube family does not silently apply 39 mm hole approval to 46 mm tube', () => {
    assert.ok(installed('bolt-bit-38', 'friction-bolt-46').anchorage01
      < installed('bolt-bit-38', 'friction-bolt-39').anchorage01);
  });
}
if (mode !== 'bolt') {
  // Junttan HHK7/9A datasheet p2: 9t, 1.2m, rounded maximum106kNm,40–100bpm.
  // https://junttan.com/wp-content/uploads/2015/10/Junttan_HHK_7A_datasheet.pdf
  test('default pile simulation runs bought 9t hammer with rated stroke', () => {
    const m = methodOf('driven-pile');
    assert.equal(m.pile.ramKg, 9000); assert.equal(m.pile.strokeMaxM, 1.2);
    assert.equal(Math.round(hammerSetting(m, 1, 0).eRam), 106);
  });
  test('full public hammer control sweep respects sourced stroke and blow limits', () => {
    const m = methodOf('driven-pile');
    for (let e = 0; e <= 10; e++) for (let r = 0; r <= 10; r++) {
      const h = hammerSetting(m, e / 10, r / 10);
      assert.ok(h.dropM >= 0 && h.dropM <= 1.2 + 1e-12);
      assert.ok(h.bpm >= 40 && h.bpm <= 100);
      assert.ok(Number.isFinite(h.kNm) && h.kNm <= 106);
    }
  });
  test('actual pile start telemetry respects bought hammer physical envelope', () => {
    const state = createGameState(); state.garage.loadout = {
      hammer: 'impact-hammer-9t', dolly: 'dolly-plastic', install: 'precast-pile-350',
    };
    const sim = createDrillSim({ state, bus: createBus() });
    try {
      sim.startHole({ methodId: 'driven-pile', targetDepth: 14, seed: 123, flushMedium: 'none' });
      const p = sim.getTelemetry().programme;
      assert.ok(p && p.kind === 'driven-pile');
      assert.ok(p.maxDropM <= 1.2); assert.ok(p.ramCeilingKnm <= 106);
      measurements.push({ pileStart: p });
    } finally { sim.dispose(); }
  });
}
let failures = 0;
for (const { name, run } of tests) {
  try { run(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}
console.log(JSON.stringify({ root, mode, cases: tests.length, failures, measurements }));
if (failures) process.exitCode = 1;
