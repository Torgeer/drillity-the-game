#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSampleLedger, applySampleEvent, restoreSampleLedger, summariseSampleLedger } from '../src/sim/sample-ledger.js';
const identity = { runId: 12, attemptId: 34 };
const config = (methodId = 'core', targetDepthM = 6.5, barrelCapacityM = 3) => ({ methodId,
  ...identity, targetDepthM, barrelCapacityM });
const command = (sequence, type, data = {}) => ({ ...identity, sequence, type, ...data });
const shape = { core: ['wireline-inner-tube', 'box'], sonic: ['sonic-barrel-extraction', 'sleeve'] };
const tests = [];
function test(name, fn) { try { fn(); tests.push({ name, pass: true }); }
  catch (error) { tests.push({ name, pass: false, error: error.stack }); } }
function driver(method = 'core', target = 6.5, capacity = 3) {
  let ledger = createSampleLedger(config(method, target, capacity)), sequence = 0;
  return { get ledger() { return ledger; }, get sequence() { return sequence; },
    act(type, fields) { const e = command(++sequence, type, fields); const r = applySampleEvent(ledger, e);
      assert.equal(r.ok, true, JSON.stringify({ e, r })); ledger = r.ledger; return e; },
    retrieve() { if (method === 'sonic') this.act('case', { toDepthM: ledger.drilledDepthM });
      this.act('retrieve', { toDepthM: ledger.drilledDepthM, provenance: shape[method][0] }); },
    handle() { this.act('handle', { intervalIndex: ledger.intervals.length, container: shape[method][1] }); },
    restore() { ledger = restoreSampleLedger(JSON.parse(JSON.stringify(ledger)), identity); },
  };
}
test('configuration rejects coercions, unknown methods and unusable dimensions', () => {
  for (const p of [{ methodId: 'rc' }, { runId: 0 }, { attemptId: '34' }, { targetDepthM: -1 },
    { targetDepthM: NaN }, { targetDepthM: Infinity }, { barrelCapacityM: 0 }, { barrelCapacityM: '3' },
    { barrelCapacityM: Infinity }, { score: 1 }]) assert.throws(() => createSampleLedger({ ...config(), ...p }));
  assert.throws(() => createSampleLedger(config('core', 1e20, 0.1)), 'capacity must remain representable at target scale');
});
test('zero target contains no interval, no fabricated sample or recovery', () => {
  const s = summariseSampleLedger(createSampleLedger(config('core', 0)));
  assert.equal(s.handlingComplete, true); assert.equal(s.intervalCount, 0); assert.equal(s.handledIntervalM, 0);
  for (const k of ['recovery', 'recoveredM', 'TCR', 'RQD', 'score', 'quality', 'payout']) assert.equal(k in s, false);
});
test('core full runs and final partial need retrieval and handling', () => {
  const d = driver();
  for (const toDepthM of [3, 6, 6.5]) {
    d.act('advance', { toDepthM });
    const pending = summariseSampleLedger(d.ledger);
    assert.equal(pending.stage, 'retrieve'); assert.equal(pending.handlingComplete, false);
    assert.equal(pending.finalPartialPending, toDepthM === 6.5);
    d.retrieve(); assert.equal(summariseSampleLedger(d.ledger).stage, 'handle'); d.handle();
  }
  const s = summariseSampleLedger(d.ledger);
  assert.equal(s.handlingComplete, true); assert.equal(s.handledIntervalM, 6.5);
  assert.deepEqual(d.ledger.intervals.map(r => [r.fromM, r.toM]), [[0, 3], [3, 6], [6, 6.5]]);
});
test('sonic requires actual protective casing and uses its own provenance', () => {
  const d = driver('sonic'); d.act('advance', { toDepthM: 3 });
  assert.equal(summariseSampleLedger(d.ledger).stage, 'case');
  assert.equal(summariseSampleLedger(d.ledger).casingRequired, true);
  assert.equal(summariseSampleLedger(d.ledger).canRetrieve, false);
  const r = applySampleEvent(d.ledger, command(2, 'retrieve', { toDepthM: 3, provenance: shape.sonic[0] }));
  assert.equal(r.reason, 'casing-required'); assert.equal(r.ledger, d.ledger);
  d.retrieve(); d.handle(); assert.equal(d.ledger.intervals[0].handling.container, 'sleeve');
  assert.equal(d.ledger.intervals[0].retrieval.provenance, 'sonic-barrel-extraction');
});
test('short retrieval has an independent new barrel capacity', () => {
  const d = driver(); d.act('advance', { toDepthM: 1.5 }); d.retrieve(); d.handle();
  assert.equal(summariseSampleLedger(d.ledger).nextStopDepthM, 4.5);
  d.act('advance', { toDepthM: 4.5 }); d.retrieve(); d.handle();
  assert.deepEqual(d.ledger.intervals.map(r => [r.fromM, r.toM]), [[0, 1.5], [1.5, 4.5]]);
});
test('large step rejects unchanged instead of inventing barrel changes or clipping actual depth', () => {
  const s = createSampleLedger(config());
  for (const toDepthM of [3.000001, 6.5, 20]) {
    const r = applySampleEvent(s, command(1, 'advance', { toDepthM }));
    assert.equal(r.ok, false); assert.equal(r.ledger, s); assert.equal(s.drilledDepthM, 0);
  }
});
test('stale attempt cannot affect new ledger; latest replay is inert after JSON restore', () => {
  const d = driver(); const e = d.act('advance', { toDepthM: 1 }); d.restore();
  const before = d.ledger, r = applySampleEvent(before, e);
  assert.equal(r.ok, true); assert.equal(r.duplicate, true); assert.equal(r.ledger, before);
  for (const p of [{ runId: 99 }, { attemptId: 99 }]) {
    assert.equal(applySampleEvent(before, { ...e, ...p, sequence: 2 }).reason, 'wrong-attempt');
    assert.throws(() => restoreSampleLedger(JSON.parse(JSON.stringify(before)), { ...identity, ...p }));
  }
});
test('old events and reused sequence cannot overwrite factual handling', () => {
  const d = driver(); const e = d.act('advance', { toDepthM: 2 }); d.retrieve(); d.handle();
  assert.equal(applySampleEvent(d.ledger, e).reason, 'stale-event');
  assert.equal(applySampleEvent(d.ledger, command(d.sequence, 'advance', { toDepthM: 3 })).reason, 'sequence-conflict');
});
test('failed operation does not consume its event sequence', () => {
  const d = driver(); d.act('advance', { toDepthM: 1 });
  const e = command(2, 'handle', { intervalIndex: 1, container: 'box' });
  assert.equal(applySampleEvent(d.ledger, e).ok, false);
  d.retrieve(); assert.equal(d.ledger.lastEvent.sequence, 2);
});
test('handling and retrieval prove the exact current interval', () => {
  const d = driver(); d.act('advance', { toDepthM: 2 });
  assert.equal(applySampleEvent(d.ledger, command(2, 'retrieve', { toDepthM: 1, provenance: shape.core[0] })).reason, 'retrieval-depth-mismatch');
  d.retrieve();
  assert.equal(applySampleEvent(d.ledger, command(3, 'handle', { intervalIndex: 2, container: 'box' })).reason, 'wrong-interval');
  assert.equal(applySampleEvent(d.ledger, command(3, 'advance', { toDepthM: 3 })).reason, 'handling-required');
});
test('method provenance, event primitives and extra fields fail closed', () => {
  const d = driver(); d.act('advance', { toDepthM: 1 });
  for (const e of [command(2, 'retrieve', { toDepthM: 1, provenance: shape.sonic[0] }),
    command(2, 'advance', { toDepthM: '2' }), command(2, 'advance', { toDepthM: NaN }),
    command(2, 'advance', { toDepthM: 2, quality: 1 }), command('2', 'advance', { toDepthM: 2 }),
    command(2, 'handle', { intervalIndex: 1, container: 'sleeve' })]) assert.equal(applySampleEvent(d.ledger, e).reason, 'invalid-event');
});
test('ledger, rows, events, and summaries are immutable without freezing caller event', () => {
  const d = driver(); const e = d.act('advance', { toDepthM: 1 });
  assert.equal(Object.isFrozen(e), false); e.toDepthM = 100;
  assert.equal(d.ledger.lastEvent.toDepthM, 1);
  assert.throws(() => { d.ledger.intervals[0].toM = 5; });
  assert.throws(() => { d.ledger.intervals.push({}); });
  const s = summariseSampleLedger(d.ledger); assert.throws(() => { s.handledIntervalM = 5; });
});
test('raw JSON and fabricated mutable state must pass restoration before use', () => {
  const d = driver(); d.act('advance', { toDepthM: 1 });
  const raw = JSON.parse(JSON.stringify(d.ledger));
  assert.equal(applySampleEvent(raw, command(2, 'advance', { toDepthM: 2 })).reason, 'invalid-ledger');
  assert.throws(() => summariseSampleLedger(raw));
  const restored = restoreSampleLedger(raw, identity); raw.intervals[0].toM = 9;
  assert.equal(restored.intervals[0].toM, 1);
});
test('restore rejects gap, overlap, wrong identity, future version and coerced data', () => {
  const d = driver(); d.act('advance', { toDepthM: 3 }); d.retrieve(); d.handle();
  d.act('advance', { toDepthM: 4 });
  const changes = [s => s.intervals[1].fromM = 2.9, s => s.intervals[1].fromM = 3.1,
    s => s.intervals[1].index = 1, s => s.intervals[0].toM = 4,
    s => s.intervals[0].handling = null, s => s.drilledDepthM = 5,
    s => s.version = 2, s => s.lastEvent.sequence = 0,
    s => s.intervals[0].retrieval.provenance = shape.sonic[0],
    s => s.intervals[0].handling.sequence = s.intervals[0].retrieval.sequence,
    s => s.intervals[1].toM = '4', s => s.score = 1, s => s.lastEvent.toDepthM = 2];
  for (const change of changes) { const s = JSON.parse(JSON.stringify(d.ledger)); change(s);
    assert.throws(() => restoreSampleLedger(s, identity)); }
});
test('sonic casing cannot lead the bore or move backward', () => {
  const d = driver('sonic'); d.act('advance', { toDepthM: 2 });
  assert.equal(applySampleEvent(d.ledger, command(2, 'case', { toDepthM: 3 })).reason, 'casing-beyond-bore');
  d.act('case', { toDepthM: 1 });
  assert.equal(applySampleEvent(d.ledger, command(3, 'case', { toDepthM: 0.5 })).reason, 'no-new-casing-depth');
  assert.equal(applySampleEvent(d.ledger, command(3, 'retrieve', { toDepthM: 2, provenance: shape.sonic[0] })).reason, 'casing-required');
});
test('JSON round trips preserve every valid lifecycle stage', () => {
  for (const method of ['core', 'sonic']) {
    const d = driver(method); d.restore();
    for (const toDepthM of [1.25, 3.75, 6.5]) {
      d.act('advance', { toDepthM }); d.restore();
      if (method === 'sonic') { d.act('case', { toDepthM }); d.restore(); }
      d.act('retrieve', { toDepthM, provenance: shape[method][0] }); d.restore();
      d.handle(); d.restore();
    }
    assert.equal(summariseSampleLedger(d.ledger).handledIntervalM, 6.5);
  }
});
test('fractional multi-run cases conserve all accepted depth without summation drift', () => {
  let assertions = 0;
  for (const method of ['core', 'sonic']) for (const capacity of [0.1, 0.3, 1.5, 3])
    for (const target of [0.05, 0.1, 0.9, 6, 6.5, 31.125]) {
      const d = driver(method, target, capacity);
      while (!summariseSampleLedger(d.ledger).handlingComplete) {
        const endpoint = summariseSampleLedger(d.ledger).nextStopDepthM;
        d.act('advance', { toDepthM: endpoint }); d.retrieve(); d.handle();
        const s = summariseSampleLedger(d.ledger);
        assert.equal(s.handledIntervalM, endpoint); assert.equal(s.retrievedIntervalM, endpoint);
        assert.equal(d.ledger.intervals.at(-1).fromM, d.ledger.intervals.at(-2)?.toM ?? 0); assertions += 3;
      }
      d.restore(); assert.equal(summariseSampleLedger(d.ledger).handledIntervalM, target); assertions++;
    }
  assert.ok(assertions > 3000, `nontrivial coverage: ${assertions}`);
});
test('event storage is constant size through ten thousand drilling advances', () => {
  const d = driver('core', 2, 3);
  for (let i = 1; i <= 10000; i++) d.act('advance', { toDepthM: i / 10000 });
  assert.equal(d.ledger.intervals.length, 1); assert.equal(d.ledger.lastEvent.sequence, 10000);
  assert.ok(JSON.stringify(d.ledger).length < 600);
});
for (const t of tests) console.log(`${t.pass ? 'PASS' : 'FAIL'} ${t.name}${t.error ? '\n' + t.error : ''}`);
console.log(JSON.stringify({ groups: tests.length, failures: tests.filter(t => !t.pass).length,
  limitation: 'Pure ledger only. Real sim, actions, results, persistence integration, quality and payouts are outstanding.' }));
if (tests.some(t => !t.pass)) process.exitCode = 1;
