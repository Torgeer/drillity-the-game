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

/** The sampling string's components must form one product, not independent
 * cheapest bays. This verifies catalogue family/role metadata only; it does
 * not certify a tender's hole diameter or invent unspecified wall clearance.
 */
export function checkSampleEquipment(methodId, loadout = {}, lookupItem) {
  if (!['core', 'sonic'].includes(methodId)) return { ok: true };
  const fitted = loadout && typeof loadout === 'object' ? loadout : {};
  const itemAt = (slot) => {
    const item = lookupItem(fitted[slot]);
    return item?.slot === slot && item.methods?.includes(methodId) ? item : null;
  };
  const bit = itemAt('bit'), rod = itemAt('rod');
  const reject = (code, reason, itemId = null) => ({ ok: false, code, reason, methodId, itemId });
  if (methodId === 'core') {
    if (bit?.sampling?.role !== 'core-bit') return reject('missing-core-bit', 'Fit a wireline core bit in the bit bay.');
    if (rod?.sampling?.role !== 'wireline-barrel') return reject('missing-core-barrel', 'Fit a wireline core barrel assembly in the rod bay.');
    const crown = bit.sampling, barrel = rod.sampling;
    if (!crown.family || crown.family !== barrel.family
        || !Number.isFinite(crown.coreDiameterMm) || crown.coreDiameterMm <= 0
        || crown.coreDiameterMm !== barrel.coreDiameterMm
        || !Number.isFinite(crown.holeDiameterMm) || crown.holeDiameterMm <= crown.coreDiameterMm
        || crown.holeDiameterMm !== barrel.holeDiameterMm) {
      return reject('core-train-mismatch', `${bit.name} and ${rod.name} are not a matching core system. Fit a matching bit and barrel; NQ parts are available.`, rod.id);
    }
    if (!Number.isFinite(barrel.barrelCapacityM) || barrel.barrelCapacityM <= 0
        || barrel.capacityBasis !== 'inner-tube-length') {
      return reject('unknown-core-capacity', 'This core barrel has no verified sampling capacity. Fit a supported barrel.', rod.id);
    }
    return { ok: true, sampleMode: 'core', bitId: bit.id, barrelId: rod.id,
      barrelCapacityM: barrel.barrelCapacityM, capacityBasis: barrel.capacityBasis, family: barrel.family,
      holeDiameterMm: crown.holeDiameterMm,
      requiredSlots: ['bit', 'rod'] };
  }
  const casing = itemAt('casing');
  if (bit?.sampling?.role !== 'sonic-barrel' || bit.sampling.threadHand !== 'RH') {
    return reject('missing-sonic-barrel', 'Fit a sonic core barrel in the bit bay.');
  }
  if (rod?.sampling?.role !== 'sonic-rod' || rod.sampling.threadHand !== 'RH') {
    return reject('missing-sonic-rod', 'Fit a right-hand sonic drill rod in the rod bay.');
  }
  if (casing?.sampling?.role !== 'sonic-casing' || casing.sampling.threadHand !== 'LH') {
    return reject('missing-sonic-casing', 'Fit sonic override casing pipe. A drive shoe alone cannot support the hole.', casing?.id);
  }
  if (!Number.isFinite(bit.sampling.barrelCapacityM) || bit.sampling.barrelCapacityM <= 0
      || !['inner-tube-length', 'gameplay-run-limit'].includes(bit.sampling.capacityBasis)) {
    return reject('unknown-sonic-capacity', 'This sonic barrel has no supported sampling capacity.', bit.id);
  }
  return { ok: true, sampleMode: 'sonic', bitId: bit.id, barrelId: bit.id,
    barrelCapacityM: bit.sampling.barrelCapacityM, capacityBasis: bit.sampling.capacityBasis,
    requiredSlots: ['bit', 'rod', 'casing'] };
}

/** A core tender must request the fitted system's sourced nominal bore size.
 * holeDiameterMm is a catalogue size, not a measured crown OD or clearance;
 * exact equality here compares nominal labels, not manufacturing tolerances.
 * Sonic remains a role check only: its nominal labels do not establish bore
 * diameter or casing clearance. No diameter is inferred for that method.
 */
export function checkSampleTender(contract, loadout = {}, lookupItem) {
  const support = checkSampleEquipment(contract?.methodId, loadout, lookupItem);
  if (!support.ok || contract?.methodId !== 'core') return support;
  if (!Number.isFinite(contract.holeDia) || contract.holeDia <= 0) {
    return { ok: false, code: 'invalid-core-tender-diameter', methodId: 'core',
      reason: 'This core job has no valid hole diameter. Choose another core offer.' };
  }
  if (contract.holeDia !== support.holeDiameterMm) {
    return { ok: false, code: 'sample-tender-diameter-mismatch', methodId: 'core',
      reason: `This job requires a ${contract.holeDia} mm hole; the fitted ${support.family} system has a ${support.holeDiameterMm} mm nominal bore. Choose a matching core offer.`,
      requiredDiameterMm: contract.holeDia, fittedDiameterMm: support.holeDiameterMm };
  }
  return support;
}
