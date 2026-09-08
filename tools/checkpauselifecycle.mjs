#!/usr/bin/env node
/** Run real simulation updates against the shell's actual pause predicate.
 * DOM surface/visibility are boundaries; time, hazards and attempts are real.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAst } from 'vite';
import { createBus, createGameState, SCENES, EVENTS } from '../src/core/contract.js';
import { createDrillSim } from '../src/sim/drilling.js';

const shellSource = readFileSync(new URL('../src/ui/shell.js', import.meta.url), 'utf8');
function find(predicate) {
  const matches = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (predicate(node)) matches.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
    }
  }
  walk(parseAst(shellSource));
  assert.equal(matches.length, 1, 'One shipped implementation');
  return shellSource.slice(matches[0].start, matches[0].end);
}
const getter = find(n => n.type === 'Property' && n.kind === 'get' && n.key.name === 'gameplayPaused');
const makeUI = new Function('surface', 'SCENES', `
  const document = surface.document, overlayStack = surface.overlays;
  let disposed = false;
  const current = surface.current;
  return { ${getter}, dispose() { disposed = true; } };`);
const cases = [];
const test = (name, fn) => cases.push([name, fn]);
function fresh(withUI = true) {
  const ctx = { state: createGameState(), bus: createBus() };
  const surface = { document: { visibilityState: 'visible' }, overlays: [], current: { id: SCENES.SITE } };
  if (withUI) ctx.ui = makeUI(surface, SCENES);
  ctx.sim = createDrillSim(ctx); ctx.sim.init();
  const contract = { id: 'pause-fixture', methodId: 'auger', regionId: 'nordic', targetDepth: 40, seed: 821,
    ground: [{ id: 'clay', top: 0, bottom: 40 }] };
  ctx.sim.startHole(contract);
  return { ctx, sim: ctx.sim, surface, contract };
}
const snapshot = t => JSON.stringify(t.sim.debug.state);
function frames(t, count, dt = 1 / 60) { for (let i = 0; i < count; i++) t.sim.update(dt, t.ctx.state); }
function expectFrozen(t) { const before = snapshot(t); frames(t, 25, 0.25); assert.equal(snapshot(t), before); }

test('normal updates advance and off-Site navigation preserves a frozen attempt', () => {
  const t = fresh(); frames(t, 3); assert.ok(t.sim.getTelemetry().timeSec > 0);
  const identity = [t.sim.debug.state.runId, t.sim.debug.state.attemptId];
  t.surface.current.id = SCENES.CONTRACTS; expectFrozen(t);
  assert.equal(t.sim.active, true); assert.equal(t.sim.paused, true);
  assert.deepEqual([t.sim.debug.state.runId, t.sim.debug.state.attemptId], identity);
  t.surface.current.id = SCENES.SITE; const before = t.sim.getTelemetry().timeSec;
  frames(t, 1); assert.ok(t.sim.getTelemetry().timeSec > before); t.sim.dispose();
});
test('closing an inner modal does not release an outer modal or hidden page', () => {
  const t = fresh(); t.surface.overlays.push({}, {}); expectFrozen(t);
  t.surface.overlays.pop(); expectFrozen(t);
  t.surface.document.visibilityState = 'hidden'; t.surface.overlays.pop(); expectFrozen(t);
  t.surface.document.visibilityState = 'visible'; assert.equal(t.sim.paused, false); t.sim.dispose();
});
test('paused wall time and substep remainder never accrue catch-up drilling', () => {
  const t = fresh(); frames(t, 1, 1 / 240);
  t.surface.overlays.push({}); expectFrozen(t); t.surface.overlays.pop();
  const before = t.sim.getTelemetry().timeSec; frames(t, 1);
  assert.ok(t.sim.getTelemetry().timeSec - before <= 1 / 60 + 1e-12); t.sim.dispose();
});
test('hidden controls cannot change feed, phase, casing or start a bit trip', async () => {
  const t = fresh(); t.surface.overlays.push({}); const before = snapshot(t);
  assert.equal(t.sim.setInput('feed', 1), false);
  assert.equal(t.sim.pulse('kick').reason, 'paused');
  assert.equal(t.sim.setCasing(true).reason, 'paused');
  assert.equal((await t.sim.changeBit('_spare')).reason, 'paused');
  assert.equal(snapshot(t), before); t.sim.dispose();
});
test('a real in-progress bit trip freezes and keeps its pending completion', async () => {
  const t = fresh(); let settled = false;
  const changing = t.sim.changeBit('_spare').then(value => { settled = true; return value; });
  assert.equal(t.sim.debug.state.phase, 'tripping-out');
  t.surface.overlays.push({}); expectFrozen(t); await Promise.resolve(); assert.equal(settled, false);
  t.surface.overlays.pop(); const before = t.sim.debug.state.phaseT; frames(t, 1);
  assert.ok(t.sim.debug.state.phaseT > before); t.sim.abortHole('fixture-end');
  assert.equal((await changing).reason, 'fixture-end'); t.sim.dispose();
});
test('an earned geology crossing waits behind the modal and arrives once', () => {
  const t = fresh(); t.surface.overlays.push({}); const before = snapshot(t);
  t.ctx.bus.emit(EVENTS.BOULDER, { depth: 1, hardness: 0.7 });
  assert.equal(snapshot(t), before); expectFrozen(t); t.surface.overlays.pop(); frames(t, 1);
  assert.equal(t.sim.debug.state.externalGeology.boulder, true);
  assert.equal(t.sim.debug.state.hazards.filter(h => h.kind === 'boulder').length, 1);
  const seen = t.sim.debug.state.hazardsSeen; frames(t, 1); assert.equal(t.sim.debug.state.hazardsSeen, seen);
  t.sim.dispose();
});
test('a deferred event from an abandoned attempt does not enter its replacement', () => {
  const t = fresh(); t.surface.overlays.push({});
  t.ctx.bus.emit(EVENTS.BOULDER, { depth: 1, hardness: 0.7 });
  t.sim.abortHole('abandoned'); t.sim.startHole({ ...t.contract, id: 'replacement' });
  t.surface.overlays.pop(); frames(t, 1);
  assert.equal(t.sim.debug.state.externalGeology.boulder, false);
  assert.equal(t.sim.debug.state.hazards.some(h => h.kind === 'boulder'), false); t.sim.dispose();
});
test('disposing the shell suspends its live attempt without needing a DOM event', () => {
  const t = fresh(); t.ctx.ui.dispose(); expectFrozen(t); t.sim.dispose();
});
test('CPU simulation with no UI does not infer pause from default BOOT scene', () => {
  const t = fresh(false); assert.equal(t.ctx.state.scene, SCENES.BOOT);
  frames(t, 2); assert.ok(t.sim.getTelemetry().timeSec > 0); assert.equal(t.sim.paused, false); t.sim.dispose();
});
for (const [name, run] of cases) { await run(); console.log(`PASS ${name}`); }
console.log(`Pause lifecycle: ${cases.length} actual simulation cases passed.`);
