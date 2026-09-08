/** Validate an XP readout without repairing or mutating the saved career. */
export function xpDisplay(app, xp, storedLevel) {
  const level = Number.isInteger(storedLevel) && storedLevel > 0 ? storedLevel : 1;
  const total = typeof xp === 'number' || typeof xp === 'string' ? Number(xp) : NaN;
  const unavailable = {
    level, into: Number.isFinite(total) ? Math.max(0, total) : null,
    need: null, frac: null, capped: false,
  };
  // The shell clamps ordinary negative XP, but Infinity would otherwise pass
  // every threshold in the curve and falsely certify maximum-level progress.
  if (!Number.isFinite(total)) return unavailable;
  const progress = app.xpProgress(xp, level);
  const cap = app.ctx?.game?.MAX_LEVEL;
  const knownCap = Number.isInteger(cap) && cap > 0;
  if (!progress || !Number.isInteger(progress.level) || progress.level < 1
    || (knownCap && progress.level > cap)
    || !Number.isFinite(progress.into) || progress.into < 0) return unavailable;
  if (progress.need === null && progress.frac === null) return { ...progress, capped: false };
  if (!Number.isFinite(progress.need) || progress.need < 0
    || !Number.isFinite(progress.frac) || progress.frac < 0 || progress.frac > 1) return unavailable;
  if (knownCap && progress.level === cap && progress.need > 0) return unavailable;
  const capped = knownCap && progress.level === cap
    && progress.need === 0 && progress.into === 0 && progress.frac === 1;
  if (progress.need === 0 && !capped) return unavailable;
  return { ...progress, capped };
}
