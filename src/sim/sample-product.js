/** Settled bore-interval evidence. This is not a material recovery measurement. */
import { restoreSampleLedger, summariseSampleLedger } from './sample-ledger.js';

// Software storage limit, NOT SOURCED as a physical sampling limit. Generated
// core contracts (at most 600 m / 1.5 m) fit without truncating their interval log.
export const MAX_SAMPLE_INTERVALS = 1024;

export function sampleCapacityBasisMatches(methodId, basis) {
  return (methodId === 'core' && basis === 'inner-tube-length')
    || (methodId === 'sonic' && basis === 'gameplay-run-limit');
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
