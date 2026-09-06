/** Shared pure runtime support boundary, not a catalogue compatibility table.
 * Callers supply scalar selection and their authoritative item lookup; this
 * module imports neither simulation nor progression and writes no state.
 * Missing equipment retains the existing method default. Owned items remain
 * untouched when their explicitly selected mechanism is not implemented.
 */
export function checkEquipmentSupport(methodId, hammerId, lookupItem) {
  if (methodId === 'driven-pile') {
    const item = lookupItem(hammerId);
    if (item?.slot === 'hammer' && item.methods.includes(methodId) && !item.impactHammer) {
      return { ok: false, code: 'unsupported-piling-hammer', methodId, itemId: item.id,
        reason: `${item.name} cannot start this drive. Fit a hydraulic impact hammer.` };
    }
  }
  return { ok: true };
}
