/** Settled bore-interval evidence. This is not a material recovery measurement. */
import { restoreSampleLedger, summariseSampleLedger, readSampleOperatingConditions } from './sample-ledger.js';

// Software storage limit, NOT SOURCED as a physical sampling limit. Generated
// core contracts (at most 600 m / 1.5 m) fit without truncating their interval log.
export const MAX_SAMPLE_INTERVALS = 1024;

export function sampleCapacityBasisMatches(methodId, basis) {
  return (methodId === 'core' && basis === 'inner-tube-length')
    || (methodId === 'sonic' && basis === 'gameplay-run-limit');
}

/** Shared plain-text presentation from recorded operating conditions.
 * The clock is player/simulation time while cutting, not calibrated field time.
 * Overlapping conditions are shown independently; they are never summed into
 * a material-quality or recovery score. Legacy missing records remain unknown.
 */
export function sampleOperatingRecord(interval, methodId) {
  const c = readSampleOperatingConditions(interval?.operatingConditions, methodId);
  if (!c) return null;
  const seconds = n => n > 0 && n < 0.1 ? '<0.1 s' : `${n.toFixed(1)} s`;
  const conditions = [
    ...(c.lowFlushSec === null ? [] : [['Low flush', c.lowFlushSec]]),
    ['Overheat', c.overheatSec], ['Over torque', c.overtorqueSec],
  ];
  const excursions = conditions.filter(([, elapsed]) => elapsed > 0);
  return Object.freeze({
    cuttingTime: seconds(c.cuttingSec), hasExcursion: excursions.length > 0,
    text: excursions.length ? excursions.map(([label, elapsed]) => `${label} ${seconds(elapsed)}`).join(' · ')
      : `No recorded ${methodId === 'sonic' ? 'heat or torque' : 'operating-limit'} exceedance`,
    note: 'Game operating limits, timed only while drilling. Material condition is unmeasured.',
  });
}

/** Validate a completed receipt before payment, save loading or presentation.
 * Older receipts may omit it; callers must retain that as unmeasured, not 100%.
 */
export function readSampleProduct(snapshot, expected) {
  if (!snapshot || !Array.isArray(snapshot.intervals)
      || snapshot.intervals.length < 1 || snapshot.intervals.length > MAX_SAMPLE_INTERVALS
      || !expected || snapshot.methodId !== expected.methodId
      || (expected.capacityBasis !== undefined
        && !sampleCapacityBasisMatches(expected.methodId, expected.capacityBasis))
      || snapshot.targetDepthM !== expected.depth || !(expected.depth > 0)) return null;
  try {
    const ledger = restoreSampleLedger(snapshot, {
      runId: expected.runId, attemptId: expected.attemptId,
    });
    return summariseSampleLedger(ledger).handlingComplete ? ledger : null;
  } catch { return null; }
}
