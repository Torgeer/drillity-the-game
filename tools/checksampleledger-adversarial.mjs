#!/usr/bin/env node
/** Independent public-API interval/custody checks. No sim, DOM or rewards proof. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import {
  createSampleLedger, applySampleEvent, restoreSampleLedger, summariseSampleLedger,
} from '../src/sim/sample-ledger.js';

const sha = path => createHash('sha256').update(readFileSync(new URL(path, import.meta.url))).digest('hex');
const initialModuleSha256 = sha('../src/sim/sample-ledger.js');
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const clone = value => JSON.parse(JSON.stringify(value));
const identity = { runId: 51, attemptId: 83 };
const spec = method => method === 'core'
  ? { provenance: 'wireline-inner-tube', container: 'box' }
  : { provenance: 'sonic-barrel-extraction', container: 'sleeve' };
function fixture(methodId = 'core', targetDepthM = 7.25, barrelCapacityM = 3) {
  let state = createSampleLedger({ methodId, ...identity, targetDepthM, barrelCapacityM });
  let seq = 0;
  return {
    get state() { return state; }, get nextSequence() { return seq + 1; },
    make(type, payload = {}, patch = {}) {
      return { type, ...identity, sequence: seq + 1, ...payload, ...patch };
    },
    step(type, payload = {}) {
      const result = applySampleEvent(state, this.make(type, payload));
      assert.equal(result.ok, true, `${type}: ${result.reason}`);
      assert.equal(result.changed, true);
      assert.notEqual(result.ledger, state);
      seq++; state = result.ledger; invariant(state);
      return state;
    },
    reject(type, payload = {}, patch = {}) {
      const before = JSON.stringify(state), old = state;
      const result = applySampleEvent(state, this.make(type, payload, patch));
      assert.equal(result.ok, false, `unexpected acceptance of ${JSON.stringify({ type, ...payload, ...patch })}`);
      assert.equal(result.changed, false); assert.equal(result.ledger, old);
      assert.equal(JSON.stringify(state), before); return result;
    },
    handle() {
      const depth = state.drilledDepthM;
      if (methodId === 'sonic') this.step('case', { toDepthM: depth });
      this.step('retrieve', { toDepthM: depth, provenance: spec(methodId).provenance });
      this.step('handle', { intervalIndex: state.intervals.length, container: spec(methodId).container });
    },
  };
}
function invariant(s) {
  let end = 0, total = 0;
  for (const [i, row] of s.intervals.entries()) {
    assert.equal(row.index, i + 1); assert.equal(row.fromM, end);
    assert.ok(row.toM > row.fromM && row.toM <= s.targetDepthM);
    assert.ok(row.toM <= Math.min(s.targetDepthM, row.fromM + s.barrelCapacityM));
    assert.equal(row.handling !== null && row.retrieval === null, false);
    if (i < s.intervals.length - 1) assert.ok(row.handling);
    total += row.toM - row.fromM; end = row.toM;
  }
  assert.equal(end, s.drilledDepthM);
  assert.ok(Math.abs(total - s.drilledDepthM) <= Number.EPSILON * Math.max(1, s.drilledDepthM) * 8);
  const summary = summariseSampleLedger(s);
  assert.ok(summary.handledIntervalM <= summary.retrievedIntervalM);
  assert.ok(summary.retrievedIntervalM <= summary.drilledIntervalM);
  assert.equal(summary.drilledIntervalM, s.drilledDepthM);
  assert.deepEqual(restoreSampleLedger(clone(s), identity), s, 'every reachable snapshot must restore exactly');
}
function ready(method = 'core', target = 7.25, capacity = 3) {
  const f = fixture(method, target, capacity);
  while (!summariseSampleLedger(f.state).handlingComplete) {
    f.step('advance', { toDepthM: summariseSampleLedger(f.state).nextStopDepthM });
    f.handle();
  }
  return f;
}
function corrupt(snapshot, edit) {
  const bad = clone(snapshot); edit(bad);
  assert.throws(() => restoreSampleLedger(bad, identity), TypeError);
}

test('exact and partial final barrels require separate completed retrieval and handling', () => {
  for (const method of ['core', 'sonic']) for (const target of [.5, 3, 3.001, 6, 6.5]) {
    const f = fixture(method, target);
    while (f.state.drilledDepthM < target) {
      f.step('advance', { toDepthM: summariseSampleLedger(f.state).nextStopDepthM });
      assert.equal(summariseSampleLedger(f.state).handlingComplete, false);
      assert.equal(summariseSampleLedger(f.state).targetReached, f.state.drilledDepthM === target);
      f.handle();
    }
    assert.equal(summariseSampleLedger(f.state).handledIntervalM, target);
    assert.equal(summariseSampleLedger(f.state).handlingComplete, true);
    f.reject('advance', { toDepthM: target + .001 });
    f.reject('retrieve', { toDepthM: target, provenance: spec(method).provenance });
  }
});
test('large steps reject atomically; caller splits conserve every accepted slice', () => {
  for (const method of ['core', 'sonic']) {
    const f = fixture(method, 10.2, 3);
    f.reject('advance', { toDepthM: 10.2 });
    f.step('advance', { toDepthM: 3 }); f.handle();
    f.reject('advance', { toDepthM: 10.2 });
    for (const end of [6, 9, 10.2]) { f.step('advance', { toDepthM: end }); f.handle(); }
    assert.deepEqual(f.state.intervals.map(x => [x.fromM, x.toM]), [[0, 3], [3, 6], [6, 9], [9, 10.2]]);
  }
});
test('increment partitioning, decimal boundaries and early retrieval preserve exact contiguity', () => {
  let seed = 817;
  const rand = () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 2 ** 32);
  for (let trial = 0; trial < 80; trial++) {
    const method = trial % 2 ? 'sonic' : 'core', target = .17 + rand() * 30, capacity = .1 + rand() * 3;
    const f = fixture(method, target, capacity);
    let turns = 0;
    while (f.state.drilledDepthM < target) {
      assert.ok(++turns < 2000);
      const next = Math.min(summariseSampleLedger(f.state).nextStopDepthM, f.state.drilledDepthM + capacity * (.1 + rand() * 1.2));
      f.step('advance', { toDepthM: next });
      if (next === summariseSampleLedger(f.state).nextStopDepthM || rand() < .2) f.handle();
    }
    if (!f.state.intervals.at(-1).handling) f.handle();
    assert.equal(summariseSampleLedger(f.state).handledIntervalM, target);
  }
});
test('drilled, retrieved and handled coverage never collapse into one claim', () => {
  const f = fixture('core'); f.step('advance', { toDepthM: 2 });
  let s = summariseSampleLedger(f.state);
  assert.deepEqual([s.drilledIntervalM, s.retrievedIntervalM, s.handledIntervalM], [2, 0, 0]);
  f.step('retrieve', { toDepthM: 2, provenance: 'wireline-inner-tube' });
  s = summariseSampleLedger(f.state);
  assert.deepEqual([s.drilledIntervalM, s.retrievedIntervalM, s.handledIntervalM], [2, 2, 0]);
  f.reject('advance', { toDepthM: 2.2 });
  f.step('handle', { intervalIndex: 1, container: 'box' });
  f.step('advance', { toDepthM: 4 }); s = summariseSampleLedger(f.state);
  assert.deepEqual([s.drilledIntervalM, s.retrievedIntervalM, s.handledIntervalM], [4, 2, 2]);
});
test('sonic extraction needs actual casing completion, while core cannot consume casing events', () => {
  const f = fixture('sonic'); f.step('advance', { toDepthM: 3 });
  f.reject('retrieve', { toDepthM: 3, provenance: 'sonic-barrel-extraction' });
  f.reject('case', { toDepthM: 3.1 }); f.step('case', { toDepthM: 2.9 });
  f.reject('retrieve', { toDepthM: 3, provenance: 'sonic-barrel-extraction' });
  f.step('case', { toDepthM: 3 });
  f.step('retrieve', { toDepthM: 3, provenance: 'sonic-barrel-extraction' });
  f.reject('case', { toDepthM: 3 });
  const c = fixture(); c.step('advance', { toDepthM: 3 }); c.reject('case', { toDepthM: 3 });
});
test('sonic summary exposes the actual casing prerequisite and next legal operation', () => {
  const f = fixture('sonic'); f.step('advance', { toDepthM: 3 });
  let s = summariseSampleLedger(f.state);
  assert.equal(s.stage, 'case'); assert.equal(s.casingRequired, true);
  assert.equal(s.casedDepthM, 0); assert.equal(s.canRetrieve, false); assert.equal(s.canHandle, false);
  f.step('case', { toDepthM: 2.9 }); s = summariseSampleLedger(f.state);
  assert.equal(s.stage, 'case'); assert.equal(s.canRetrieve, false);
  f.step('case', { toDepthM: 3 }); s = summariseSampleLedger(f.state);
  assert.equal(s.stage, 'retrieve'); assert.equal(s.casingRequired, false); assert.equal(s.canRetrieve, true);
  f.step('retrieve', { toDepthM: 3, provenance: 'sonic-barrel-extraction' }); s = summariseSampleLedger(f.state);
  assert.equal(s.stage, 'handle'); assert.equal(s.canRetrieve, false); assert.equal(s.canHandle, true);
  f.step('handle', { intervalIndex: 1, container: 'sleeve' }); s = summariseSampleLedger(f.state);
  assert.equal(s.stage, 'drill'); assert.equal(s.canRetrieve, false); assert.equal(s.canHandle, false);
  f.step('advance', { toDepthM: 3.25 }); s = summariseSampleLedger(f.state);
  assert.equal(s.casingRequired, true); assert.equal(s.canRetrieve, false);
});
test('method-specific provenance and containers cannot be crossed or coerced', () => {
  for (const method of ['core', 'sonic']) {
    const f = fixture(method); f.step('advance', { toDepthM: 1 });
    if (method === 'sonic') f.step('case', { toDepthM: 1 });
    for (const provenance of [null, false, {}, 'retrieved', spec(method === 'core' ? 'sonic' : 'core').provenance])
      f.reject('retrieve', { toDepthM: 1, provenance });
    f.step('retrieve', { toDepthM: 1, provenance: spec(method).provenance });
    f.reject('handle', { intervalIndex: 1, container: method === 'core' ? 'sleeve' : 'box' });
    f.reject('handle', { intervalIndex: '1', container: spec(method).container });
    f.reject('handle', { intervalIndex: 2, container: spec(method).container });
  }
});
test('only exact newest replay is idempotent; old/conflicting event does not consume sequence', () => {
  const f = fixture(); const first = f.make('advance', { toDepthM: 1 });
  f.step('advance', { toDepthM: 1 });
  const replay = applySampleEvent(f.state, { ...first });
  assert.equal(replay.ok, true); assert.equal(replay.changed, false); assert.equal(replay.ledger, f.state);
  f.reject('advance', { toDepthM: 2 }, { sequence: first.sequence });
  f.step('advance', { toDepthM: 2 });
  f.reject('advance', { toDepthM: 1 }, { sequence: first.sequence });
  f.reject('handle', { intervalIndex: 1, container: 'box' });
  f.step('retrieve', { toDepthM: 2, provenance: 'wireline-inner-tube' });
});
test('new integer physical identity rejects old events and cannot restore old attempt', () => {
  const old = ready(), newer = createSampleLedger({ methodId: 'core', runId: 51, attemptId: 84, targetDepthM: 7.25, barrelCapacityM: 3 });
  const event = { type: 'advance', ...identity, sequence: 99, toDepthM: 1 };
  assert.equal(applySampleEvent(newer, event).ok, false);
  assert.equal(summariseSampleLedger(newer).handledIntervalM, 0);
  for (const expected of [{ runId: 52, attemptId: 83 }, { runId: 51, attemptId: 84 }, { runId: '51', attemptId: 83 }, null])
    assert.throws(() => restoreSampleLedger(clone(old.state), expected), TypeError);
});
test('snapshots and summaries are immutable, with no aliases back into input data', () => {
  const f = ready('sonic'); const json = clone(f.state), restored = restoreSampleLedger(json, identity);
  json.intervals[0].retrieval.provenance = 'forged'; json.lastEvent.sequence = 800;
  assert.equal(restored.intervals[0].retrieval.provenance, 'sonic-barrel-extraction');
  for (const fn of [() => { restored.intervals.push({}); }, () => { restored.intervals[0].handling.container = 'box'; },
    () => { restored.lastEvent.sequence = 90; }, () => { summariseSampleLedger(restored).handledIntervalM = 900; }]) assert.throws(fn, TypeError);
  invariant(restored);
});
test('invalid numeric inputs, coercions, schema extras and empty delivery reject without mutation', () => {
  const f = fixture();
  for (const bad of [-1, NaN, Infinity, -Infinity, '2', true, null, [], {}]) f.reject('advance', { toDepthM: bad });
  for (const key of ['runId', 'attemptId', 'sequence']) for (const bad of [0, -1, 1.2, '51', NaN, Number.MAX_SAFE_INTEGER + 1])
    f.reject('advance', { toDepthM: 1 }, { [key]: bad });
  f.reject('advance', { toDepthM: 1, recoveredM: 1 });
  f.reject('retrieve', { toDepthM: 0, provenance: 'wireline-inner-tube' });
  f.reject('handle', { intervalIndex: 1, container: 'box' });
  f.step('advance', { toDepthM: 1 });
});
test('malformed persisted geometry, custody, aggregate depth and version are rejected', () => {
  for (const method of ['core', 'sonic']) {
    const original = ready(method).state;
    const edits = [
      s => { s.version++; }, s => { s.targetDepthM = '7.25'; }, s => { s.drilledDepthM++; },
      s => { s.intervals[0].fromM = .001; }, s => { s.intervals[1].fromM -= .01; },
      s => { s.intervals[1].fromM += .01; }, s => { s.intervals[1].index = 1; },
      s => { s.intervals[0].toM = 3.1; }, s => { s.intervals[0].handling = null; },
      s => { s.intervals[0].retrieval = null; }, s => { s.intervals[0].handling.container = 'bag'; },
      s => { s.intervals[0].retrieval.provenance = 'guessed'; }, s => { s.intervals[0].recoveredM = 3; },
      s => { s.lastEvent = null; }, s => { s.intervals[0].handling.sequence = s.lastEvent.sequence + 1; },
      s => { s.intervals[0].retrieval.sequence = s.intervals[0].handling.sequence; },
    ];
    for (const edit of edits) corrupt(original, edit);
  }
});
test('restore rejects an advance sharing the previous interval handling sequence', () => {
  const f = fixture(); f.step('advance', { toDepthM: 3 }); f.handle(); f.step('advance', { toDepthM: 4 });
  corrupt(f.state, s => { s.lastEvent.sequence = s.intervals[0].handling.sequence; });
});
test('restore rejects retrieval before any possible preceding advance event', () => {
  const f = ready('core', 2);
  corrupt(f.state, s => { s.intervals[0].retrieval.sequence = 1; });
});
test('restore rejects sonic extraction before any possible advance and casing sequence', () => {
  const f = ready('sonic', 2);
  corrupt(f.state, s => { s.intervals[0].retrieval.sequence = 2; });
});
test('restore rejects zero-depth casing watermark which no public operation can create', () => {
  const f = fixture('sonic'); f.step('advance', { toDepthM: 2 }); f.step('case', { toDepthM: 1 });
  corrupt(f.state, s => { s.casedDepthM = 0; s.lastEvent.toDepthM = 0; });
});
test('restore rejects casing at the new bore depth when the newest operation was an advance', () => {
  const f = fixture('sonic'); f.step('advance', { toDepthM: 1 }); f.step('case', { toDepthM: 1 });
  f.step('advance', { toDepthM: 2 });
  corrupt(f.state, s => { s.casedDepthM = s.drilledDepthM; });
});
test('restore rejects a newest casing operation that never advanced past previous handled casing', () => {
  const f = fixture('sonic'); f.step('advance', { toDepthM: 3 }); f.handle();
  f.step('advance', { toDepthM: 4 }); f.step('case', { toDepthM: 4 });
  corrupt(f.state, s => { s.casedDepthM = 3; s.lastEvent.toDepthM = 3; });
});
test('JSON property reordering does not change exact replay semantics after valid restore', () => {
  const f = fixture(); f.step('advance', { toDepthM: 1 });
  const json = clone(f.state);
  json.lastEvent = Object.fromEntries(Object.entries(json.lastEvent).reverse());
  const restored = restoreSampleLedger(json, identity);
  const replay = applySampleEvent(restored, clone(f.state.lastEvent));
  assert.equal(replay.ok, true); assert.equal(replay.changed, false); assert.equal(replay.ledger, restored);
});
test('raw or forged serialized ledgers cannot bypass restore validation at reducer boundary', () => {
  const f = fixture(); f.step('advance', { toDepthM: 1 });
  for (const raw of [clone(f.state), { ...clone(f.state), drilledDepthM: -5 }, Object.freeze(clone(f.state))]) {
    const before = JSON.stringify(raw);
    const result = applySampleEvent(raw, f.make('advance', { toDepthM: 2 }));
    assert.equal(result.ok, false); assert.equal(result.changed, false); assert.equal(JSON.stringify(raw), before);
  }
});
test('restarting or abandoning a partial attempt does not deliver its pending or handled intervals', () => {
  for (const method of ['core', 'sonic']) {
    const f = fixture(method);
    const stages = [clone(f.state)];
    f.step('advance', { toDepthM: 2 }); stages.push(clone(f.state));
    if (method === 'sonic') { f.step('case', { toDepthM: 2 }); stages.push(clone(f.state)); }
    f.step('retrieve', { toDepthM: 2, provenance: spec(method).provenance }); stages.push(clone(f.state));
    f.step('handle', { intervalIndex: 1, container: spec(method).container }); stages.push(clone(f.state));
    f.step('advance', { toDepthM: 3.5 }); stages.push(clone(f.state));
    for (const snapshot of stages) {
      assert.deepEqual(restoreSampleLedger(snapshot, identity), snapshot);
      assert.throws(() => restoreSampleLedger(snapshot, { runId: 51, attemptId: 84 }), TypeError);
    }
    const fresh = createSampleLedger({ methodId: method, runId: 51, attemptId: 84, targetDepthM: 7.25, barrelCapacityM: 3 });
    assert.deepEqual(fresh.intervals, []); assert.equal(summariseSampleLedger(fresh).handledIntervalM, 0);
  }
});
test('zero target produces no invented sample or material quality', () => {
  for (const method of ['core', 'sonic']) {
    const f = fixture(method, 0); const summary = summariseSampleLedger(f.state);
    assert.equal(summary.handlingComplete, true); assert.equal(summary.intervalCount, 0);
    f.reject('advance', { toDepthM: .1 });
    assert.doesNotMatch(JSON.stringify(summary), /recoveredM|recovery|TCR|SCR|RQD|quality|intact|undisturbed/);
  }
});

const outcomes = [];
for (const { name, fn } of tests) {
  try { await fn(); outcomes.push({ name, ok: true }); console.log(`PASS ${name}`); }
  catch (error) { outcomes.push({ name, ok: false, error: error.message }); console.error(`FAIL ${name}: ${error.stack}`); }
}
const report = { scope: 'Pure interval module only; no simulation, saved-settlement, results or DOM acceptance.',
  initialModuleSha256, moduleSha256: sha('../src/sim/sample-ledger.js'), toolSha256: sha('./checksampleledger-adversarial.mjs'),
  passed: outcomes.filter(x => x.ok).length, total: outcomes.length, outcomes };
report.sourceStable = report.moduleSha256 === initialModuleSha256;
const outIndex = process.argv.indexOf('--out');
if (outIndex !== -1) writeFileSync(process.argv[outIndex + 1], JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: report.passed, total: report.total, moduleSha256: report.moduleSha256 }));
if (report.passed !== report.total || !report.sourceStable) process.exitCode = 1;
