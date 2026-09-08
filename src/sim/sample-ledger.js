/** Factual sampling interval bookkeeping, independent of simulation and rewards.
 *
 * Distances are bore-interval coordinates supplied by the caller, NOT recovered
 * material lengths, TCR, SCR, RQD, or a claim of undisturbed sample quality.
 * The caller supplies its verified barrel capacity; this module invents no
 * physical dimensions, duration, damage coefficient, score, or payment rule.
 *
 * Events report completed operations. They must not be sent when an animation
 * or timed operation merely starts. Core records wireline inner-tube retrieval;
 * sonic records protective casing followed by barrel extraction. This distinction
 * follows research/02-prospecting.md §A1 and §A3; it supplies no numeric tuning.
 */
const VERSION = 1;
const METHODS = Object.freeze({
  core: Object.freeze({ provenance: 'wireline-inner-tube', container: 'box' }),
  sonic: Object.freeze({ provenance: 'sonic-barrel-extraction', container: 'sleeve' }),
});
// Only created/restored immutable values enter the reducer. A JSON copy must
// pass restore validation first. This avoids rescanning the entire history on
// every drilling tick, and keeps forged mutable objects out of the live path.
const ledgers = new WeakSet();
const positiveId = n => Number.isSafeInteger(n) && n > 0;
const distance = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v)
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
function keysExactly(value, keys) {
  return object(value) && Object.keys(value).length === keys.length
    && keys.every(k => Object.hasOwn(value, k));
}
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function publish(value) { freeze(value); ledgers.add(value); return value; }
function fail(message) { throw new TypeError(`sample-ledger: ${message}`); }
function identity(value) {
  return positiveId(value?.runId) && positiveId(value?.attemptId);
}
function configuration(value) {
  return identity(value) && Object.hasOwn(METHODS, value.methodId)
    && distance(value.targetDepthM) && distance(value.barrelCapacityM)
    && value.barrelCapacityM > 0
    // Numerical representation limit, not a physical minimum barrel length.
    && (value.targetDepthM === 0 || value.targetDepthM + value.barrelCapacityM > value.targetDepthM);
}
function eventKeys(event) {
  const extra = {
    advance: ['toDepthM'], case: ['toDepthM'],
    retrieve: ['toDepthM', 'provenance'], handle: ['intervalIndex', 'container'],
  };
  return Object.hasOwn(extra, event?.type)
    ? ['type', 'runId', 'attemptId', 'sequence', ...extra[event.type]] : null;
}
function validEvent(event, methodId) {
  const keys = eventKeys(event);
  if (!keys || !keysExactly(event, keys) || !identity(event) || !positiveId(event.sequence)) return false;
  if (event.type === 'handle') return positiveId(event.intervalIndex)
    && event.container === METHODS[methodId]?.container;
  if (!distance(event.toDepthM)) return false;
  return event.type !== 'retrieve' || event.provenance === METHODS[methodId]?.provenance;
}
function canonicalEvent(event) {
  return Object.fromEntries(eventKeys(event).map(key => [key, event[key]]));
}
function sameIdentity(left, right) {
  return left.runId === right.runId && left.attemptId === right.attemptId;
}
function stopDepth(ledger, fromM) {
  // No epsilon/rounding: the sim can use this exact endpoint to split a step.
  return Math.min(ledger.targetDepthM, fromM + ledger.barrelCapacityM);
}

/** Create one ledger for one physical attempt. A zero target creates no sample. */
export function createSampleLedger(config) {
  if (!keysExactly(config, ['methodId', 'runId', 'attemptId', 'targetDepthM', 'barrelCapacityM'])
    || !configuration(config)) fail('invalid configuration');
  return publish({ version: VERSION, ...config, drilledDepthM: 0, casedDepthM: 0,
    intervals: [], lastEvent: null });
}

/** Restore JSON data without silently repairing, coercing, or changing identity.
 * The expected identity must come from the actual resumed physical attempt.
 * Current game reloads restart attempts; their old ledgers must NOT be attached.
 */
export function restoreSampleLedger(snapshot, expectedIdentity) {
  if (!keysExactly(expectedIdentity, ['runId', 'attemptId']) || !identity(expectedIdentity)) fail('expected identity required');
  if (!keysExactly(snapshot, ['version', 'methodId', 'runId', 'attemptId', 'targetDepthM',
    'barrelCapacityM', 'drilledDepthM', 'casedDepthM', 'intervals', 'lastEvent'])
    || snapshot.version !== VERSION || !configuration(snapshot)
    || !sameIdentity(snapshot, expectedIdentity)) fail('invalid ledger identity, version or configuration');
  const s = snapshot, spec = METHODS[s.methodId];
  if (!distance(s.drilledDepthM) || s.drilledDepthM > s.targetDepthM
    || !distance(s.casedDepthM) || s.casedDepthM > s.drilledDepthM
    || (s.methodId === 'core' && s.casedDepthM !== 0) || !Array.isArray(s.intervals)) fail('invalid depth');
  if (s.lastEvent !== null && (!validEvent(s.lastEvent, s.methodId) || !sameIdentity(s, s.lastEvent))) fail('invalid event watermark');
  const sequence = s.lastEvent?.sequence ?? 0;
  let end = 0, previousHandling = 0;
  for (let i = 0; i < s.intervals.length; i++) {
    const x = s.intervals[i];
    if (!keysExactly(x, ['index', 'fromM', 'toM', 'retrieval', 'handling']) || x.index !== i + 1
      || x.fromM !== end || !distance(x.toM) || x.toM <= x.fromM || x.toM > stopDepth(s, x.fromM)) fail('invalid interval coverage');
    if (x.retrieval !== null) {
      const r = x.retrieval;
      // Each new interval required at least one advance event; sonic also
      // required a casing event after that advance and before extraction.
      const minimumEarlierEvents = s.methodId === 'sonic' ? 2 : 1;
      if (!keysExactly(r, ['provenance', 'sequence']) || r.provenance !== spec.provenance
        || !positiveId(r.sequence) || r.sequence <= previousHandling + minimumEarlierEvents || r.sequence > sequence
        || (s.methodId === 'sonic' && s.casedDepthM < x.toM)) fail('invalid retrieval');
    }
    if (x.handling !== null) {
      const h = x.handling;
      if (!x.retrieval || !keysExactly(h, ['container', 'sequence']) || h.container !== spec.container
        || !positiveId(h.sequence) || h.sequence <= x.retrieval.sequence || h.sequence > sequence) fail('invalid handling');
      previousHandling = h.sequence;
    }
    if (i < s.intervals.length - 1 && !x.handling) fail('earlier interval not handled');
    end = x.toM;
  }
  if (end !== s.drilledDepthM || (s.intervals.length > 0 && sequence === 0)
    || (s.intervals.length === 0 && s.lastEvent !== null)) fail('coverage disagrees with drilled depth');
  if (s.lastEvent) {
    const e = s.lastEvent, last = s.intervals.at(-1);
    const previousEnd = s.intervals.at(-2)?.toM ?? 0;
    const earlierCasingInThisInterval = s.methodId === 'sonic' && s.casedDepthM > previousEnd;
    if ((e.type === 'advance' && (e.toDepthM !== s.drilledDepthM || last.retrieval !== null
        || e.sequence <= previousHandling + (earlierCasingInThisInterval ? 2 : 0)
        || (s.methodId === 'sonic' && s.casedDepthM >= s.drilledDepthM)))
      || (e.type === 'case' && (s.methodId !== 'sonic' || e.toDepthM !== s.casedDepthM || last.retrieval !== null
        || e.toDepthM <= previousEnd || e.sequence <= previousHandling + 1))
      || (e.type === 'retrieve' && (e.toDepthM !== last.toM || last.retrieval?.sequence !== e.sequence || last.handling !== null))
      || (e.type === 'handle' && (e.intervalIndex !== last.index || last.handling?.sequence !== e.sequence))) fail('event disagrees with current state');
  }
  const restored = JSON.parse(JSON.stringify(s));
  // JSON objects have no semantic key order. Newest-event replay compares the
  // canonical watermark, including after another serializer reorders fields.
  if (restored.lastEvent) restored.lastEvent = canonicalEvent(restored.lastEvent);
  return publish(restored);
}

/** Apply a completed operation immutably.
 *
 * sequence: monotonically increasing positive safe integer for this attempt.
 * Exact latest replay is a successful no-op; older events are rejected as stale.
 * No per-tick event journal is saved. Invalid commands do not consume a sequence.
 *
 * An advance beyond nextStopDepthM is rejected unchanged, NOT silently clamped.
 * The physical simulation must cap/split its own step at that same endpoint.
 */
export function applySampleEvent(ledger, event) {
  const reject = reason => ({ ok: false, changed: false, reason, ledger });
  if (!ledgers.has(ledger)) return reject('invalid-ledger');
  if (!validEvent(event, ledger.methodId)) return reject('invalid-event');
  if (!sameIdentity(ledger, event)) return reject('wrong-attempt');
  const e = canonicalEvent(event), previous = ledger.lastEvent;
  if (previous && e.sequence < previous.sequence) return reject('stale-event');
  if (previous && e.sequence === previous.sequence) {
    return JSON.stringify(e) === JSON.stringify(previous)
      ? { ok: true, changed: false, duplicate: true, ledger } : reject('sequence-conflict');
  }
  const rows = ledger.intervals, last = rows.at(-1), spec = METHODS[ledger.methodId];
  let next;
  if (e.type === 'advance') {
    if (e.toDepthM <= ledger.drilledDepthM) return reject('no-new-depth');
    if (e.toDepthM > ledger.targetDepthM) return reject('beyond-target');
    if (last?.retrieval && !last.handling) return reject('handling-required');
    const fromM = !last || last.handling ? ledger.drilledDepthM : last.fromM;
    if (e.toDepthM > stopDepth(ledger, fromM)) return reject('barrel-capacity-exceeded');
    const interval = last && !last.handling ? { ...last, toM: e.toDepthM }
      : { index: rows.length + 1, fromM, toM: e.toDepthM, retrieval: null, handling: null };
    next = { ...ledger, drilledDepthM: e.toDepthM,
      intervals: last && !last.handling ? [...rows.slice(0, -1), interval] : [...rows, interval] };
  } else if (e.type === 'case') {
    if (ledger.methodId !== 'sonic') return reject('method-has-no-override-casing');
    if (!last || last.retrieval) return reject('no-open-interval');
    if (e.toDepthM <= ledger.casedDepthM) return reject('no-new-casing-depth');
    if (e.toDepthM > ledger.drilledDepthM) return reject('casing-beyond-bore');
    next = { ...ledger, casedDepthM: e.toDepthM };
  } else if (e.type === 'retrieve') {
    if (!last || last.retrieval) return reject('no-unretrieved-interval');
    if (e.toDepthM !== last.toM) return reject('retrieval-depth-mismatch');
    if (ledger.methodId === 'sonic' && ledger.casedDepthM < last.toM) return reject('casing-required');
    next = { ...ledger, intervals: [...rows.slice(0, -1), { ...last,
      retrieval: { provenance: spec.provenance, sequence: e.sequence } }] };
  } else {
    if (!last || !last.retrieval || last.handling) return reject('no-unhandled-retrieval');
    if (e.intervalIndex !== last.index) return reject('wrong-interval');
    next = { ...ledger, intervals: [...rows.slice(0, -1), { ...last,
      handling: { container: spec.container, sequence: e.sequence } }] };
  }
  next.lastEvent = e;
  return { ok: true, changed: true, duplicate: false, ledger: publish(next) };
}

/** Bore intervals whose retrieval/handling has been recorded; NOT sample yield. */
export function summariseSampleLedger(ledger) {
  if (!ledgers.has(ledger)) fail('create or restore the ledger before reading it');
  const rows = ledger.intervals, last = rows.at(-1);
  const targetReached = ledger.drilledDepthM === ledger.targetDepthM;
  const retrieved = last?.retrieval ? last.toM : (rows.at(-2)?.toM ?? 0);
  const handled = last?.handling ? last.toM : (rows.at(-2)?.toM ?? 0);
  const fromM = !last || last.handling ? ledger.drilledDepthM : last.fromM;
  const nextStopDepthM = stopDepth(ledger, fromM);
  const casingRequired = ledger.methodId === 'sonic' && !!last && !last.retrieval
    && ledger.casedDepthM < last.toM;
  return Object.freeze({
    methodId: ledger.methodId, runId: ledger.runId, attemptId: ledger.attemptId,
    drilledIntervalM: ledger.drilledDepthM, retrievedIntervalM: retrieved, handledIntervalM: handled,
    intervalCount: rows.length, targetReached,
    casedDepthM: ledger.casedDepthM, casingRequired,
    canRetrieve: !!last && !last.retrieval && !casingRequired,
    canHandle: !!last?.retrieval && !last.handling,
    handlingComplete: targetReached && (!last || !!last.handling),
    finalPartialPending: !!last && targetReached && !last.handling
      && last.toM < last.fromM + ledger.barrelCapacityM,
    stage: !last ? (targetReached ? 'complete' : 'drill')
      : last.handling ? (targetReached ? 'complete' : 'drill')
        : last.retrieval ? 'handle'
          : ledger.drilledDepthM === nextStopDepthM ? (casingRequired ? 'case' : 'retrieve') : 'drill',
    nextStopDepthM,
  });
}
