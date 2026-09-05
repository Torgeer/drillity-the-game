/**
 * DRILLITY I THE GAME — economics.
 *
 * Every export in this file is a PURE function: same inputs, same outputs, no
 * reads of global state, no writes anywhere. progression.js calls into here to
 * settle a hole; the shop UI calls in to price a shelf; `simulateCareer` calls
 * in to balance the whole game.
 *
 * The model, in one paragraph: a contract is worth metres x method rate x
 * ground hardness x diameter x region multiplier (computed once, in
 * data.makeContract). Running it costs consumables (worn by the metre, faster
 * in abrasive ground and faster still if you drill it badly), fuel and upkeep
 * (by the hour), and travel (once, by rig mass). What is left is profit, and
 * profit buys tools that move the ROP and life terms. That is the whole game.
 */

import { clamp, makeRandom } from '../core/contract.js';
import {
  METHODS, RIGS, ITEMS, REGIONS, CERTS, ROLES, SKILLS, LEVELS, MAX_LEVEL,
  getMethod, getRig, getItem, getRegion, getCert, roleForLevel,
  groundHardness, groundAbrasivity, estimateHours, estimateHoursBreakdown, makeContract,
  levelForXP, defaultLoadoutFor, MATERIAL_DIA_EXPONENT,
} from './data.js';

/* ── the one exception to "no writes anywhere" ────────────────────────────
   A diagnostic warning is not a side effect on the game: it changes no return
   value and no state, and every function below still answers the same for the
   same arguments. It exists because the alternative has already cost this
   project real rounds — `settleRun` will happily price a contract with no
   `methodId` at all, silently, using the default row of every table it
   touches, and the answer looks entirely plausible. Deduplicated by message,
   because `simulateCareer()` calls in thousands of times. */
const _warned = new Set();
function warnOnce(msg, ...rest) {
  if (_warned.has(msg)) return;
  _warned.add(msg);
  if (typeof console !== 'undefined' && console.warn) console.warn(msg, ...rest);
}
/** Test seam — forget what has already been said. */
export function _resetEconWarnings() { _warned.clear(); }

/* ── A LOOKUP THAT MISSED, ON A LINE THAT IS MONEY ────────────────────────
   The unknown-region bug fixed in `upkeepFor` below was not one bug. It is a
   SHAPE, and `research/AUDIT-FALLBACKS.md` names the whole class: every table
   in this file has a sane-looking default, and on the COST side that default is
   almost always ZERO. An unknown rig costs nothing to run. An unknown item is
   free. An unknown destination is free to mobilise to. A method with no
   materials row consumes no materials — which is exactly how `oil-rotary` and
   six others once shipped with their largest cost line at zero, and the only
   evidence was that the numbers looked good.

   The arithmetic still balances, the results screen still prints a total, and
   there is no symptom whatsoever. That is what makes it expensive.

   ⚠ NO FALLBACK VALUE BELOW CHANGES. You cannot invent a price for a thing that
   does not exist, and guessing one here would be the worse error. What was
   wrong was being SILENT about it. Every call site keeps the number it
   returned and adds a line naming what went missing, so the next person to
   find a hole in a cost sheet is handed the reason instead of a plausible
   total. `warnOnce` dedupes by message, so a bad id inside a loop says it once.
*/
function unknownRef(kind, id, consequence) {
  warnOnce(`[economy] unknown ${kind} "${id}" — ${consequence}`, id);
}

/**
 * The player's career role, or the bottom of the ladder with a note.
 *
 * ⚠ THE FIVE CALL SITES DISAGREED, WHICH IS ITS OWN BUG. `crewCostFor` and
 * `overheadFor` fell back to `ROLES[0]`; `payoutForContract`,
 * `reputationForContract` and `upkeepFor` fell back to `null` and then to a
 * bare `?? 1` / `?? 0`. Four terms of one settlement, resolving the same bad
 * id four different ways — so a settlement with an unknown role was internally
 * inconsistent as well as quiet about it.
 *
 * They are the SAME NUMBER: `ROLES[0]` is the Helper, whose perks are
 * `payoutMult 1.00`, `repGain 1.0`, `upkeepDiscount 0` — exactly the values the
 * `??` defaults were producing. So this unifies the five without moving a
 * single euro, which is what makes it safe to do in one commit.
 *
 * @param {?string} roleId
 * @param {string} where  the cost line asking, named in the warning
 */
function roleOrBase(roleId, where) {
  if (!roleId) return null;
  const role = ROLES.find((r) => r.id === roleId);
  if (!role) {
    unknownRef('roleId', roleId, 'not in data.js ROLES. Seniority is falling '
      + `back to the Helper row (${where}): no payout multiplier, no upkeep `
      + 'discount, no reputation bonus and the cheapest crew in the game');
    return ROLES[0];
  }
  return role;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Tunables. One place, so balancing is one diff.
   ═══════════════════════════════════════════════════════════════════════════ */
export const ECON = Object.freeze({
  /** iMarket margin over the notional list price. */
  markupBase: 1.0,
  /** Extra margin for buying while standing in an expensive region. */
  regionMarkupMax: 0.18,
  /** Same-day surcharge when a run has already started. */
  urgentSurcharge: 0.35,
  /** Fraction of list recovered when selling a durable in perfect condition. */
  resaleDurable: 0.45,
  /** Fraction of list recovered on a part-worn consumable. */
  resaleConsumable: 0.16,
  /** Daily rental as a fraction of list, durables. */
  rentalDurablePerDay: 0.0022,
  /** Daily rental as a fraction of list, tooling. */
  rentalToolPerDay: 0.012,
  /** Reputation needed for the full +25% loyalty bonus on payouts. */
  reputationCap: 8000,
  reputationBonusMax: 0.25,
  /** Payout lost per hour past the deadline, and the floor it stops at. */
  latePenaltyPerHour: 0.04,
  latePenaltyMax: 0.35,
  /** Fraction of a rig's list price charged per operating hour as insurance. */
  insurancePerHour: 0.000004,
  /** Straight-line depreciation: the whole machine over ~9,000 operating hours. */
  depreciationPerHour: 0.000111,
  /** Company overhead as a share of turnover — see overheadFor(). */
  overheadRateBase: 0.05,
  overheadRateGrowth: 0.25,
  /** Flat safety net: the smallest job the board will ever offer. */
  emergencyContractFloor: 1100,
});

/** Letter grade to payout multiplier. D is a real loss, S is worth chasing. */
export function gradeBonusMultiplier(grade) {
  switch (String(grade || 'C').toUpperCase()) {
    case 'S': return 1.35;
    case 'A': return 1.20;
    case 'B': return 1.08;
    case 'C': return 1.00;
    case 'D': return 0.88;
    default: return 1.00;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Skill resolution — turns `state.player.skills` into numeric modifiers.
   `m(key)` is a multiplier (1.0 when unskilled); `a(key)` is an additive term.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @param {Record<string, number>} skills  skillId -> ranks
 */
export function resolveSkills(skills = {}) {
  const mult = new Map();
  const add = new Map();
  for (const s of SKILLS) {
    const ranks = clamp(Number(skills?.[s.id]) || 0, 0, s.maxRank);
    if (ranks <= 0) continue;
    for (const e of s.effects) {
      const target = e.kind === 'mult' ? mult : add;
      target.set(e.key, (target.get(e.key) || 0) + e.perRank * ranks);
    }
  }
  return {
    /** multiplier for a 'mult' key — never allowed below 0.15 */
    m: (key) => Math.max(0.15, 1 + (mult.get(key) || 0)),
    /** additive total for an 'add' key */
    a: (key) => add.get(key) || 0,
    has: (key) => mult.has(key) || add.has(key),
    raw: { mult: Object.fromEntries(mult), add: Object.fromEntries(add) },
  };
}

/**
 * Slots holding a PRODUCT or a SUPPLY rather than a cutting tool.
 *
 * A rock bolt, a precast pile, a calico sample bag and a box of resin are not
 * worn out — they are USED UP, one per hole, one per pile, one per bag. Running
 * them through the abrasion, overload and aggression terms in `wearFromRun`,
 * which are a model of carbide meeting rock, produced 55 % more bolts on a
 * quartzite drive than the pattern contains and made a pile cost more because
 * the ground was gritty. `item.stats.life` on these is a QUANTITY — the bolt's
 * length, the pile's length, the bags in a bale — so consumption is
 * `metres / life` and nothing else.
 *
 * The `dolly` bay is deliberately NOT here. A dolly genuinely degrades under
 * driving, and how much energy it still passes to the pile head is a real
 * mechanic (research/05 §A1: "the resilience of the cushioning material changes
 * with use ... a genuine consumable with a genuine performance curve").
 */
const PRODUCT_SLOTS = new Set(['install', 'sample', 'service']);

/** Which skill key extends the life of an item in a given slot. */
function lifeKeyForSlot(slot) {
  switch (slot) {
    case 'bit': return 'bit.life';
    case 'rod': return 'rod.life';
    case 'hammer': return 'hammer.life';
    case 'coupling': return 'coupling.life';
    case 'casing': return 'bit.life';
    default: return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * Shelf price of an item, as the player sees it in iMarket.
 * @param {Object|string} itemOrId
 * @param {{regionId?:string, reputation?:number, skills?:Object, urgent?:boolean, quantity?:number}} [opts]
 */
export function priceWithMarkup(itemOrId, opts = {}) {
  const item = typeof itemOrId === 'string' ? getItem(itemOrId) : itemOrId;
  /* AN UNKNOWN ITEM IS FREE, AND FREE IS A PRICE. A mistyped id in a loadout
     costs nothing to buy here and is then skipped by `consumableCostForRun`,
     so the run is cheaper in two places at once and the shop card shows
     "EUR 0" rather than an error. */
  if (!item) {
    unknownRef('itemId', itemOrId, 'not in data.js ITEMS. It is being priced at '
      + 'EUR 0 — free to buy, and it will consume nothing on the run either');
    return 0;
  }
  const { regionId = null, reputation = 0, skills = {}, urgent = false, quantity = 1 } = opts;
  const sk = resolveSkills(skills);

  let price = item.price * ECON.markupBase;

  // Remote regions cost more to buy into — freight is real.
  const region = getRegion(regionId);
  if (region) {
    const remoteness = clamp(region.travelCost / 22000, 0, 1);
    price *= 1 + ECON.regionMarkupMax * remoteness;
  }

  // Consumables respond to the Toolsmith bulk-buying line.
  if (item.consumable) price *= sk.m('consumable.price');

  // Loyalty discount from reputation, up to 8%.
  price *= 1 - clamp(reputation / ECON.reputationCap, 0, 1) * 0.08;

  if (urgent) price *= 1 + ECON.urgentSurcharge;

  // Volume: 3% off at 5 units, 8% at 20, capped there.
  const q = Math.max(1, Math.floor(quantity));
  const volume = q >= 20 ? 0.92 : q >= 10 ? 0.95 : q >= 5 ? 0.97 : 1;

  return Math.round(price * q * volume);
}

/** What the yard pays you for something you no longer need. */
export function resaleValue(itemOrId, condition = 1, skills = {}) {
  const item = typeof itemOrId === 'string' ? getItem(itemOrId) : itemOrId;
  if (!item) return 0;
  const sk = resolveSkills(skills);
  const c = clamp(condition, 0, 1);
  const base = item.consumable ? ECON.resaleConsumable : ECON.resaleDurable;
  // Condition matters more than list price: a worn-out tool is scrap.
  return Math.round(item.price * base * Math.pow(c, 0.7) * sk.m('resale.value'));
}

/**
 * Rental rate. Renting is the answer to a one-week peak; owning is the answer
 * to a year of average. The crossover sits near 90 days by design.
 * @param {Object|string} thing  an ITEM id/object or a RIG id/object
 */
export function rentalRate(thing, days = 1, opts = {}) {
  const { skills = {}, regionId = null } = opts;
  const rig = typeof thing === 'string' ? getRig(thing) : (thing && thing.upkeepPerHour !== undefined ? thing : null);
  const item = rig ? null : (typeof thing === 'string' ? getItem(thing) : thing);
  const subject = rig || item;
  if (!subject) return 0;

  const d = Math.max(1, Math.round(days));
  const perDay = rig ? ECON.rentalDurablePerDay : ECON.rentalToolPerDay;
  let total = subject.price * perDay * d;

  // Long hires get cheaper per day; the operator still has to be paid.
  if (d >= 90) total *= 0.72;
  else if (d >= 30) total *= 0.82;
  else if (d >= 7) total *= 0.9;

  const region = getRegion(regionId);
  if (region) total *= 1 + clamp(region.travelCost / 22000, 0, 1) * 0.2;

  const sk = resolveSkills(skills);
  total *= sk.m('consumable.price');
  return Math.round(total);
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE UNIT OF WORK — what a contract metre actually IS, per method.

   `contract.metres` is `targetDepth x holes` and NOTHING ELSE. For fifteen of
   the twenty-one methods that number is also metres of hole, so the two were
   never distinguished and nothing broke. On six of them they are different
   quantities, and on two of those they differ by two orders of magnitude:

     rc                 hole metres.                                    x1
     site-investigation hole metres.                                    x1
     longhole           RING METRES — the sum of every hole in the fan,
                        which is already the metres of hole.            x1
     driven-pile        the design toe level of ONE pile. There is no
                        hole at all; the metre is a metre of pile.      x1
     rockbolt           METRES OF DRIVE SUPPORTED. The pattern is
                        `perRing / ringSpacingM` = 3.33 bolts per metre
                        of drive, and each bolt is a hole `lengthM +
                        overdrillM` long.                            x8.17
     tunnel-jumbo       CHAINAGE — metres of tunnel advanced. The face
                        carries `holesPerM2 x faceAreaM2` holes, and the
                        round only pulls `pullGood` of what was drilled,
                        so a metre of tunnel costs
                        `1.4 x faceArea / 0.90` metres of hole.     x155.6
                        at the 100 m2 reference face.

   Charging all six as "metres drilled" prices a 20 m tunnel round like a 20 m
   borehole. Verified against the simulation rather than asserted: driving
   sim/drilling.js headless through one contract of each method and integrating
   its own hole counter gives rc 1.00, site-investigation 1.00, driven-pile
   1.00 (toe metres), rockbolt 8.24 over 52 bolts on a 15.5 m drive, and
   tunnel-jumbo 135.6 on an 87 m2 face — which is `1.4 x 87 / 0.90` to three
   figures. The constants below are the sim's own, deliberately, so the bit the
   player watches wear out and the bit the invoice charges for are one bit.
   ═══════════════════════════════════════════════════════════════════════════ */

/** sim/drilling.js TUNING.methods['tunnel-jumbo'].round — mirrored, not guessed. */
const JUMBO = Object.freeze({
  holesPerM2: 1.4,      // ~140 holes on a 100 m2 section [NFF14 §7.5]
  pull: 0.90,           // advance / drilled depth on a round drilled to design [NFF14 §7.4]
  faceRefM2: 100,       // the reference face both the sim and `basePayPerMetre` are built on
});

/** sim/drilling.js TUNING.methods.rockbolt.bolt — mirrored, not guessed. */
const BOLT = Object.freeze({
  perRing: 5,           // bolts across the back and the shoulders
  ringSpacingM: 1.5,    // rings along the drive
  lengthM: 2.4,         // a 39 mm friction bolt: 0.9-3.0 m, 2.4 m the workhorse [W-ROCSCIENCE]
  overdrillM: 0.05,     // "at least two inches longer than the bolt" [W-ROCSCIENCE]
});

/** Bolts per metre of supported drive at the design pattern. */
export const BOLTS_PER_DRIVE_METRE = BOLT.perRing / BOLT.ringSpacingM;   // 3.333

/**
 * Metres of HOLE per contract metre. Anything not listed is 1, which is the
 * fifteen methods where the two are the same number.
 *
 * ⚠ `tunnel-jumbo` is deliberately pinned to the REFERENCE face and does not
 * read `contract.faceAreaM2`. data.js pays a FLAT `basePayPerMetre: 2400` per
 * metre of chainage with no face-area term at all, and `makeContract` rolls
 * the face anywhere from 14 to 120 m2. Costing the real face against a flat
 * price is precisely the cost-outruns-pay trap `validateData()` exists to
 * catch: the work scales 8.6x from a 14 m2 heading to a 120 m2 one and the
 * tender does not move at all.
 *
 * MEASURED, before pinning it: on a 7.6 m heading in the Andes the whole swing
 * from 14 m2 to 120 m2 is about EUR 1,400 of drill steel and EUR 3,900 of
 * explosive against a EUR 54,000 net — 7 %, unpleasant but not a trap. So this
 * is a discipline decision rather than a rescue: pay that does not vary must
 * not be met by cost that does, and the player does not choose the face area,
 * the board rolls it. The day `basePayPerMetre` grows a face term this becomes
 * `contract.faceAreaM2` and one comment.
 */
const HOLE_METRES_PER_CONTRACT_METRE = Object.freeze({
  rockbolt: (BOLT.perRing / BOLT.ringSpacingM) * (BOLT.lengthM + BOLT.overdrillM),  // 8.167
  'tunnel-jumbo': (JUMBO.holesPerM2 * JUMBO.faceRefM2) / JUMBO.pull,                // 155.6
});

/**
 * Metres of hole a run actually drills. This is what bits, rods, shanks and the
 * flushing medium are consumed by — never `contract.metres`.
 * @param {string} methodId
 * @param {number} contractMetres
 */
export function holeMetresFor(methodId, contractMetres) {
  return Math.max(0, contractMetres || 0) * (HOLE_METRES_PER_CONTRACT_METRE[methodId] ?? 1);
}

/**
 * The unit `method.nominalRop` is quoted in, per contract metre.
 *
 * This is NOT the same question as the one above, and conflating them would be
 * as wrong as ignoring both. `tunnel-jumbo`'s 0.5 m/h is documented in data.js
 * as the FULL CYCLE — drill, charge, fire, ventilate, muck — per metre of
 * chainage, so its ROP is already in contract metres and must not be scaled.
 * Measured: the sim runs an 11 m heading in 11.5 job hours against data.js's
 * 18.5, the same ~0.6x offset every well-behaved method shows.
 *
 * `rockbolt` is the one that is wrong. Its `nominalRop: 26` is a bolter's
 * drilling rate in metres of HOLE per hour — 2.45 m of hole in about six
 * minutes, which is right — but `estimateHours()` divides metres of DRIVE by
 * it, so data.js prices 52 bolts at 0.6 drilling hours. The sim, integrating
 * its own model over the same contract, spends 1.59 hours with the bit in rock
 * and does not count a single install; the trade would call it a shift.
 *
 * The correction lives here rather than in data.js only because data.js is
 * final. Fix `estimateHoursBreakdown` at source and this row should be deleted.
 */
const ROP_BASIS_PER_CONTRACT_METRE = Object.freeze({
  rockbolt: (BOLT.perRing / BOLT.ringSpacingM) * (BOLT.lengthM + BOLT.overdrillM),  // 8.167
});

export function ropBasisFactor(methodId) {
  return ROP_BASIS_PER_CONTRACT_METRE[methodId] ?? 1;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PER-UNIT CONTRACTS — the bolt and the pile.

   Two of the twenty-one methods are not sold by the metre, and the game must
   not settle them as though they were. A bolter is paid per bolt and a piling
   crew per pile; both are also SCORED on the unit rather than on depth
   (METHOD_IDS.md: "install quality — anchorage and torque test", "set and blow
   count to bearing"), so paying by the metre would have the money and the
   grade measuring different things.

   What this replaces: `progression.perHoleContract()` cut a contract into
   `payout / holes` and settled each slice against a DISTANCE — the depth the
   sim reported. On `driven-pile` that is survivable, because a contract is one
   pile. On `rockbolt` it is not: a drive is not a hole, and a bolter who
   installs forty of sixty-seven bolts has completed forty units of work, not
   "part of a hole". The settlement path now carries the unit, its count and
   its rate, and partial credit is paid per unit.

   THE RATE IS DERIVED, NOT INVENTED. `makeContract` already prices the tender
   (running metre + fixed item per drive/pile + mobilisation) and that total is
   what the client signed; splitting it by the unit count keeps the sum exactly
   equal to the contract while making the INCREMENT honest. Nothing about the
   ladder moves; only the granularity does.

   `rockbolt` stays priced per metre of supported drive in data.js — deliberately
   so, because `makeContract` computes `metres = targetDepth x holes` and
   `targetDepth` is already drive metres, so a literal bolt count there would
   multiply the drive by itself. The bolt is the unit of DELIVERY, not of the
   schedule of rates, and those are different things.
   ═══════════════════════════════════════════════════════════════════════════ */
export const PAY_UNITS = Object.freeze({
  rockbolt: Object.freeze({
    unit: 'bolt', plural: 'bolts',
    /** Bolts per contract metre — the design pattern, `perRing / ringSpacingM`. */
    perContractMetre: BOLT.perRing / BOLT.ringSpacingM,
  }),
  'driven-pile': Object.freeze({
    unit: 'pile', plural: 'piles',
    /** One pile per hole, and `HOLES_PER_JOB['driven-pile']` is [1, 1]. */
    perHole: 1,
  }),
});

/**
 * The unit basis of a contract, or null when the contract is genuinely sold by
 * the metre. `count` is how many units the whole contract contains and
 * `ratePerUnit` is what one of them is worth, derived from the tender.
 *
 * @param {Object} contract
 * @returns {{unit:string, plural:string, count:number, ratePerUnit:number}|null}
 */
export function contractUnits(contract) {
  const spec = contract && PAY_UNITS[contract.methodId];
  if (!spec) return null;
  const count = spec.perHole != null
    ? Math.max(1, Math.round(spec.perHole * Math.max(1, contract.holes || 1)))
    : Math.max(1, Math.round(spec.perContractMetre * Math.max(0, contract.metres || 0)));
  return {
    unit: spec.unit,
    plural: spec.plural,
    count,
    ratePerUnit: Math.round((contract.payout || 0) / count),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   WEAR
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * How much of an item's life a run consumes, as a 0..1 fraction.
 *
 * Wear is driven by four honest things: the metres you drilled, whether the
 * ground was harder than the tool is rated for, whether it was more abrasive
 * than the tool resists, and how brutally you drove it (feed, rotation and
 * whether you flushed enough to keep the face cool).
 *
 * @param {{item:Object|string, metres:number, hardness?:number, abrasivity?:number,
 *          ucs?:number, wob?:number, rpm?:number, flush?:number, flushCapacity?:number,
 *          skills?:Object}} p
 * @returns {{wear:number, effectiveLife:number, metresPerUnit:number, aggression:number}}
 */
export function wearFromRun(p) {
  const item = typeof p.item === 'string' ? getItem(p.item) : p.item;
  const metres = Math.max(0, p.metres || 0);
  if (!item || !item.stats.life || metres <= 0) {
    return { wear: 0, effectiveLife: item?.stats?.life || 0, metresPerUnit: item?.stats?.life || 0, aggression: 1 };
  }
  const sk = resolveSkills(p.skills || {});
  const hardness = clamp(p.hardness ?? 0.5, 0, 1);
  const abrasivity = clamp(p.abrasivity ?? 0.5, 0, 1);
  const ucs = p.ucs ?? hardness * 300;
  const wob = clamp(p.wob ?? 0.5, 0, 1);
  const rpm = clamp(p.rpm ?? 0.5, 0, 1);
  const flush = clamp(p.flush ?? 0.5, 0, 1);
  const flushCapacity = clamp(p.flushCapacity ?? 1, 0.2, 3);

  const lifeKey = lifeKeyForSlot(item.slot);
  const effectiveLife = item.stats.life * (lifeKey ? sk.m(lifeKey) : 1);

  // A product is counted, not worn. See PRODUCT_SLOTS.
  if (PRODUCT_SLOTS.has(item.slot)) {
    const used = (metres / Math.max(0.01, effectiveLife)) * (item.stats.wearRate || 1);
    return { wear: Math.max(0, used), effectiveLife, metresPerUnit: effectiveLife, aggression: 1 };
  }

  // Driving a tool past its UCS rating is the fastest way to destroy it.
  const rated = item.stats.maxUCS || 0;
  const overload = rated > 0 ? Math.max(0, (ucs - rated) / Math.max(60, rated)) : 0;

  // Abrasion beyond what the carbide grade resists.
  const abrasionPenalty = clamp(1 + (abrasivity - item.stats.abrasionRes) * 1.5, 0.55, 2.4);

  // Feed and rotation add heat; adequate flushing takes it away again.
  const flushAdequacy = clamp(flush * flushCapacity * sk.m('flush.efficiency'), 0, 1.4);
  const heat = clamp(0.55 * wob + 0.45 * rpm - 0.4 * flushAdequacy, -0.3, 1);
  const aggression = clamp(0.72 + heat * 1.1, 0.5, 2.0) * sk.m('heat.rate');

  const wear = (metres / Math.max(1, effectiveLife))
    * item.stats.wearRate
    * abrasionPenalty
    * (1 + overload * 1.6)
    * aggression;

  return {
    // NOT clamped to 1: a long run in hard ground genuinely burns several bits,
    // and the cost of the run has to say so. progression.js clamps when it
    // writes back a 0..1 condition.
    wear: Math.max(0, wear),
    effectiveLife,
    metresPerUnit: effectiveLife / Math.max(0.15, item.stats.wearRate * abrasionPenalty * (1 + overload * 1.6) * aggression),
    aggression,
  };
}

/**
 * Total consumable spend for a run, itemised. This is the money sink that
 * makes the progression breathe (GAMEDESIGN §5).
 *
 * @param {{loadout:Object, metres:number, hardness?:number, abrasivity?:number,
 *          ucs?:number, wob?:number, rpm?:number, flush?:number,
 *          flushCapacity?:number, skills?:Object, regionId?:string,
 *          reputation?:number}} p
 * @returns {{total:number, lines:{itemId:string,name:string,slot:string,wear:number,cost:number}[]}}
 */
export function consumableCostForRun(p) {
  const lines = [];
  let total = 0;
  const loadout = p.loadout || {};
  const skip = p.skipSlots || null;
  for (const slot of Object.keys(loadout)) {
    const id = loadout[slot];
    if (!id) continue;
    // A euro is charged once. Some slots hold a SUPPLY whose consumption is
    // already priced, in its own units, on the MATERIALS line — see
    // MATERIALS_COVERS_SLOTS. Charging them here as well is a double entry, and
    // on `tunnel-jumbo` a catastrophic one: `detonator-reel-500` carries
    // `life: 1`, which against 1,391 metres of blasthole reads as 1,391 reels.
    if (skip && skip.has(slot)) continue;
    const item = getItem(id);
    if (!item || !item.consumable) continue;
    const { wear } = wearFromRun({ ...p, item });
    if (wear <= 0) continue;
    const unitPrice = priceWithMarkup(item, {
      regionId: p.regionId, reputation: p.reputation || 0, skills: p.skills,
    });
    const cost = Math.round(unitPrice * wear);
    if (cost <= 0) continue;
    lines.push({ itemId: item.id, name: item.name, slot, wear: +wear.toFixed(4), cost });
    total += cost;
  }
  return { total, lines };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FLUSHING — the circulating medium the method actually consumes.

   This used to be `EUR per metre x (dia/150)^1.8`, which is a shape and not a
   quantity, and at the diameters the foundation methods work at it detonated:
   a 1200 mm jet-grout column was charged (1200/150)^1.8 = 39x the base rate,
   EUR 189 of "mud" for every metre — on top of the cement grout that
   `MATERIALS` was already charging for the same fluid. It was the single
   largest line on jet grouting and it was a double entry.

   The honest quantity is a VOLUME. Hole volume per metre is pi/4 x d^2, the
   medium is priced per cubic metre, and each method declares how many cubic
   metres of medium it burns per cubic metre of hole — which is where
   recirculation lives. A rotary rig running bentonite gets the same mud back
   up the annulus and tops up the losses; an HDD bore does not get its mud
   back at all, and the pack puts the mixed volume at two to three times the
   bore. Anything the method is ALREADY charged for in `MATERIALS` is zero
   here, because a euro is charged once.
   ═══════════════════════════════════════════════════════════════════════════ */

/** EUR per cubic metre of mixed medium, delivered to the pump. */
const FLUSH_RATE_PER_M3 = Object.freeze({
  none: 0,
  /* Air is free per cubic metre — you do not buy air. What it costs is DIESEL
     at the compressor, and that is charged in `rig.fuelPerHour`.
     ⚠ KNOWN GAP, stated rather than papered over: on the methods that carry a
     `compressor` bay the machine making the air is a SEPARATE trailer unit the
     player buys as an item (`comp-port-21-hd` is 21 m3/min at 24 bar, which is
     what research/02 §"The hammer and the bit" says an RC hole demands), and an
     item has no running cost in this model. So the booster's fuel — of the
     order of EUR 70-100/h for an RC-sized package — is charged to nobody. It is
     not fixed here because sizing it needs a specific-power and a diesel price,
     and neither is in any research pack; a coefficient invented to close a
     balance gap is the thing this file is least allowed to do. It affects rc,
     dth, top-hammer, overburden and longhole, and it is ~3 % of an RC job. */
  air: 0,
  // Water: supply, bowser haulage and settling out the return.
  water: 3.2,
  // Foam concentrate at roughly EUR 3.5/litre, run at ~0.5 % in the water.
  foam: 21,
  // Bentonite and polymer at EUR 40-60/tonne, mixed at ~50 kg/m3, plus the
  // losses and the cost of taking the spent mud away.
  mud: 34,
});

/**
 * Cubic metres of medium consumed per cubic metre of hole. Below 1.0 means the
 * fluid comes back and is re-used; above 1.0 means it is lost to the formation
 * and to the spoil.
 */
const FLUSH_VOLUME_RATIO = Object.freeze({
  // Bailed wet: you are lifting the water out with the cuttings, not circulating.
  'cable-tool': 0.9,
  // A wireline core rig runs a small closed loop off a settling tank.
  core: 1.2,
  // Grout through the hollow bar is the MATERIALS line; this is the water used
  // to flush the bit down before it.
  anchor: 0.5,
  // Sonic needs no flush at all — the water is for cooling and for keeping the
  // casing free. That is the method's whole selling point.
  sonic: 0.25,
  // Support fluid under a Kelly bored pile is desanded and put back in the
  // tank; you pay for the make-up and for disposing of it at the end.
  'rotary-kelly': 0.45,
  // Two to three times the bore volume of mixed mud, none of it recovered.
  // BUT the `hdd` MATERIALS row is already "drilling fluid and spoil
  // disposal", so the fluid is charged there and this line carries only the
  // make-up water and additives on the pilot.
  hdd: 0.6,
  // The fluid IS the grout, and the grout is the MATERIALS line. What is left
  // here is the water and thin slurry used to drill the monitor down to depth
  // before the jets are ever started.
  'jet-grouting': 0.3,
  // A well circulates its whole active system, treats it and pumps it back
  // down; the barite and the loss are in the oil-rotary MATERIALS row.
  'oil-rotary': 0.35,
  // A raise borer flushes the pilot with water and gets it back at the level
  // below.
  'raise-boring': 0.5,
});

/**
 * Flushing medium cost for a run — air is free (you already paid for it in
 * diesel at the compressor), water is cheap, mud and foam are not.
 */
export function flushingCostForRun(methodId, metres, holeDiaMm, skills = {}, regionId = null) {
  const method = getMethod(methodId);
  if (!method || metres <= 0) return 0;
  /* `air` and `none` are DELIBERATELY zero and must stay silent. A medium this
     table has never heard of is a different thing entirely: mud is EUR 34/m3
     and foam EUR 21/m3, and falling through to 0 makes the wrong one free. */
  const ratePerM3 = FLUSH_RATE_PER_M3[method.flushMedium] ?? 0;
  if (!(method.flushMedium in FLUSH_RATE_PER_M3)) {
    unknownRef('flushMedium', method.flushMedium, 'FLUSH_RATE_PER_M3 in '
      + `economy.js has no rate for it, so flushing on "${methodId}" is free. `
      + `Known media: ${Object.keys(FLUSH_RATE_PER_M3).join(', ')}`);
  }
  if (ratePerM3 <= 0) return 0;
  const dia = Math.max(40, holeDiaMm || method.nominalDia) / 1000;   // mm -> m
  const holeVolume = (Math.PI / 4) * dia * dia * metres;             // m3
  const ratio = FLUSH_VOLUME_RATIO[methodId] ?? 1;
  const sk = resolveSkills(skills);
  const region = getRegion(regionId);
  return Math.round(holeVolume * ratio * ratePerM3
    * (region?.costMult ?? 1) * sk.m('consumable.price'));
}

/* ═══════════════════════════════════════════════════════════════════════════
   MATERIALS — what stays in the ground, or goes to the tip.
   Concrete, rebar, grout, casing, liners, barite and spoil disposal. On a
   piling or jet-grouting job this is the single largest line, which is exactly
   why those methods pay what they pay.

   Rates are EUR per metre at the method's NOMINAL diameter, scaled by
   (dia / nominalDia) ^ MATERIAL_DIA_EXPONENT[method].

   That exponent lives in `data.js`, beside `DIA_PAY_EXPONENT`, because the two
   are only meaningful as a pair and `validateData()` now refuses any method
   whose cost scales with diameter faster than its pay. It REPLACES the old
   `vol: true|false` flag here, which only ever offered D^2 or D^0 and was wrong
   for most of this table. What a material costs follows what it physically is:

     D^2.0   a volume — concrete in a bored pile, grout in a jet column, the
             mud and spoil from a bore, the annulus of a gravel pack
     D^1.0   a tube — casing, a liner, a screen. A pipe's mass per metre is
             pi x D x wall, which is LINEAR in diameter; charging casing at D^2
             was the reason cable-tool, overburden and sonic went backwards as
             soon as the board rolled a wide hole
     D^0     a fixed quantity — core boxes, hole stemming, a well's casing
             programme (a deeper well finishes in a SMALLER hole while carrying
             MORE strings, so it does not scale with hole volume at all)

   Mixed products sit in between, weighted by what dominates: a cased CFA pile
   is mostly concrete (D^2) with a casing (D^1); a self-drilling anchor is
   mostly the bar (D^0) with a grout annulus (D^2).

   ⚠ If cost scales faster than pay, the method is profitable at the bottom of
   its diameter range and a guaranteed loss at the top, which is not a
   difficulty curve — it is a trap. `validateData()` fails on it now; that check
   is what caught `auger` (spoil D^2.0 against pay D^0.85) and `dth` (casing and
   gravel D^1.4 against pay D^0.8) after jet grouting had already been killed
   by the same mistake.

   THE `vol` AUDIT, for the six new rows. The old boolean is gone, but the
   error it caused — charging a TUBE as a volume — is still available to anyone
   adding a row, so every new exponent was checked against what the material
   physically is before it was accepted:
     rc                 0.35  bit and hammer wear, sample bags. Near-flat in
                              diameter, and the bags do not care at all. ✓
     tunnel-jumbo       0.15  the charge follows the FACE, not the blasthole; a
                              wider blasthole means proportionally fewer of
                              them at the same powder factor. Flat is right. ✓
     longhole           0.40  the load factor is genuinely D^2 (CD^2 x d x
                              0.785/1000). Held at 0.40 because that is the pay
                              exponent and cost may never outrun pay — an
                              UNDER-charge at large holes, which is the safe
                              direction. Recorded, not hidden. ⚠
     rockbolt           0.10  plates, nuts and resin are priced per BOLT. A
                              wider hole is a worse bolt, not a dearer one. ✓
     driven-pile        1.30  packing, weld and cut-off follow the section, and
                              1.30 matches the pay exponent exactly. ✓
     site-investigation 0.30  a standpipe is a small tube in a big hole and the
                              lab schedule is per sample. ✓
   None of the six is a tube charged as a volume.
   ═══════════════════════════════════════════════════════════════════════════ */
const MATERIALS = Object.freeze({
  // Casing strings, cement, barite and cuttings disposal — the largest
  // consumable line on a well, and it was being costed at ZERO because this
  // table had no oil-rotary row. Exponent 0 for the reason above: the hole gets
  // smaller as the well gets deeper.
  'oil-rotary':   { perMetre: 190,    what: 'Casing strings, cement, barite and cuttings disposal' },
  // Spoil off a flight auger IS a volume — a 600 mm auger lifts nine times what
  // a 200 mm one does — and it was flagged `vol: false`, i.e. free.
  auger:          { perMetre: 3.5,  what: 'Spoil handling' },
  // A temporary casing is a tube. D^2 charged a 600 mm cable-tool hole 5.8x
  // what the steel actually weighs.
  'cable-tool':   { perMetre: 34,  what: 'Temporary casing and liner' },
  'top-hammer':   { perMetre: 2,    what: 'Hole cleaning and stemming' },
  // Casing and screen are tubes (D^1); the gravel pack is an annulus (D^2).
  dth:            { perMetre: 34,  what: 'Well casing, screen and gravel pack' },
  // Casing left in the ground — a tube, and the whole product of the method.
  overburden:     { perMetre: 58,  what: 'Casing left in the ground' },
  core:           { perMetre: 30,  what: 'Core boxes, mud and sample logistics' },
  // Concrete is D^2, the cage is closer to D^1, and the pay exponent is 1.75.
  'rotary-kelly': { perMetre: 158, what: 'Concrete and reinforcement cage' },
  cfa:            { perMetre: 92, what: 'Concrete and reinforcement cage' },
  'cased-cfa':    { perMetre: 122,  what: 'Concrete, cage and casing' },
  // The hollow bar is a fixed section; only the grout annulus follows the hole.
  anchor:         { perMetre: 58, what: 'Grout and the bar left in the ground' },
  // Mud and spoil are both volumes, but the pay exponent is 1.25, so a big
  // crossing must not be charged at D^2 — the ream passes it pays for are in
  // estimateHours(), and the fluid make-up is in flushingCostForRun().
  hdd:            { perMetre: 44, what: 'Drilling fluid and spoil disposal' },
  // Casing, liners and sleeves are all tubes.
  sonic:          { perMetre: 42, what: 'Casing, liners and sample sleeves' },
  // Cement grout: a genuine volume, and the pay exponent is 1.85.
  'jet-grouting': { perMetre: 112,  what: 'Cement grout' },
  // Power and muck DO scale with the volume of rock you take out of a raise —
  // a 6 m shaft moves eleven times the muck a 1.8 m one does — and the base
  // grouting does not. It was flagged `vol: false`, which is why a wide raise
  // used to be free money.
  'raise-boring': { perMetre: 118, what: 'Power, muck handling and base grouting' },

  /* ══ The six methods of METHOD_IDS.md ═══════════════════════════════════
     These had NO ROW AT ALL, which meant six methods earned revenue and spent
     nothing on materials — the same hole `oil-rotary` fell through, and the
     reason `rc` came out of the baseline sweep at EUR 2,246/h at level 21,
     above every method up to level 52.

     ⚠ READ THIS BEFORE CHANGING A NUMBER. Every rate below is EUR per metre of
     THE CONTRACT'S OWN UNIT — chainage for the jumbo, supported drive for the
     bolter, pile for the piling crew, ring metres for longhole — because that
     is the number `materialsCostForRun` is handed. The hole-metre conversion
     belongs to the consumables and the flush, NOT here, and applying it twice
     would over-charge a heading by 155x.

     ⚠ WHAT IS SOURCED AND WHAT IS NOT. The QUANTITIES trace to the research
     packs and are cited line by line. The UNIT PRICES do not: no pack in
     `research/` carries a EUR figure for explosive, detonators, resin
     cartridges, bolt plates or precast concrete, and research/03 §B.5 records
     that its own EUR column is an unverified conversion. So these rates are
     game-balance judgement at a defensible order of magnitude, anchored on the
     shop prices in data.js — which that file's own header states are not
     catalogue figures either. No screen may present one as a market cost.

     ⚠ NOTHING HERE MAY DUPLICATE A TOOL SLOT. The bit, the rod, the shank, the
     bolt, the pile, the dolly and the sample bag are all shop items sitting in
     the loadout, and `consumableCostForRun` already charges them by the metre
     of hole. These rows carry only what never appears in a bay. Where a slot
     holds a supply this row prices instead, it is named in
     MATERIALS_COVERS_SLOTS below and skipped there. */

  // Sample train, and only the sample train. The bit, the dual-wall pipe and
  // the calico bags are all in bays. What is not is the plumbing: research/02
  // §"The surface train" lists alumina-ceramic cyclone wear bends, a ceramic
  // barrel lining and a polyurethane cone — "every wetted surface is a ceramic
  // wear part; RC eats its own plumbing" — plus the hose, the splitter and
  // getting the bags to the laboratory. The cyclone and splitter are DURABLES
  // in the `sample` bay, so nothing was charging for their wear at all.
  // Quantity sourced; the rate is judgement, set below `core`'s 30 because RC
  // makes four times the metres per hour for the same sample logistics.
  // ⚠ NEEDS — THE ASSAY. The one large per-metre cost of an RC programme that
  // is NOT in this row, because nothing sources it: every metre produces a bag
  // and every bag goes to a laboratory, and on a real exploration programme
  // multi-element analysis is a line item comparable to the drilling itself.
  // research/02 establishes the one-bag-per-metre cadence and the splitting;
  // it prices neither, and no other pack does. Inventing a figure here would
  // also happen to fix `rc` sitting at the top of the mid-game ladder, which is
  // exactly the reason not to. The rate stays at what can be defended and the
  // ladder problem is reported as what it is — see the balance notes.
  rc:             { perMetre: 18,  what: 'Sample train wear, hose and sample dispatch' },

  // EXPLOSIVE AND INITIATION, per metre of TUNNEL. The largest consumable on a
  // drill-and-blast heading and it was costed at zero.
  //   holes    1.4 per m2, ~140 on a 100 m2 face                 [NFF14 §7.5]
  //   pull     0.90 of drilled depth on a round drilled to design[NFF14 §7.4]
  //            -> 140 / (4.8 x 0.90) = 32 detonators per metre of chainage
  //   powder   0.8-1.6 kg/m3 at a 46.4 m2 face, falling with face area
  //            [W-REVEY heading-round table]. The table STOPS at 46.4 m2, so
  //            1.0 kg/m3 at the 100 m2 reference is an extrapolation of a
  //            sourced trend and is flagged as such — not a sourced figure.
  //            -> 100 m3 of solid rock per metre of advance x 1.0 = 100 kg/m
  // At a bulk-emulsion order of magnitude that is roughly EUR 200 of
  // explosive, EUR 260 of initiation and EUR 20 of stemming per metre of
  // tunnel: a fifth of the EUR 2,400/m tender, which is where drill-and-blast
  // explosive actually sits. Exponent 0.15 is right and is not a `vol` error:
  // the charge follows the FACE, not the blasthole, and a wider blasthole means
  // proportionally fewer of them for the same powder factor.
  'tunnel-jumbo': { perMetre: 480, what: 'Explosives, detonators and stemming' },

  // Explosive and initiation for the rings, per RING metre. Load factor from
  // research/03 §"Charge-weight arithmetic": kg/m = CD^2 x d x 0.785 / 1000,
  // and for pumped emulsion CD is the hole diameter — 89 mm at 1.12 g/cc gives
  // 6.96 kg per metre of charged hole, about 5.6 kg/m once the collar is
  // stemmed, plus a primer and a detonator per fan hole. The rate is judgement.
  // ⚠ The physics wants D^2 here and the exponent is 0.4, because
  // `DIA_PAY_EXPONENT.longhole` is 0.4 and cost may never outrun pay. Large
  // holes are therefore UNDER-charged for explosive; the defence is that a
  // wider hole breaks proportionally more tonnes per ring metre, which the
  // tender does not pay for either. Deliberate, and safe in the direction that
  // does not make a diameter band a trap.
  longhole:       { perMetre: 13,  what: 'Explosives and initiation for the rings' },

  // GROUND SUPPORT CONSUMABLES, per metre of supported drive at the design
  // pattern of `perRing / ringSpacingM` = 3.33 bolts per metre (mirrored from
  // the sim). The BOLT itself is a shop item in the `install` bay and is
  // charged there, correctly, against hole metres — 2.45 m of hole is exactly
  // one bolt. What is not in a bay, because only one `service` item can be
  // fitted at a time, is the rest of the set that every bolt needs: a plate, a
  // nut and the resin. At the shop's own EUR 9 plate, EUR 5 nut and about two
  // cartridges of resin a bolt, that is EUR 16 a bolt and EUR 53 a metre.
  // research/03 §A.4: resin cartridges, bolt plates and nuts are their own
  // taxonomy nodes and "the wrong number of cartridges ... gives you a bolt
  // that looks installed and holds nothing".
  // ⚠ Mesh and shotcrete are NOT in this row. They are surface support between
  // the bolts, a separate pay item, and the game does not price them.
  rockbolt:       { perMetre: 53,  what: 'Bolt plates, nuts and resin cartridges' },

  // ⚠ THE PILE IS NOT IN THIS ROW, AND THAT IS THE POINT. It is the dominant
  // cost of driven piling and it is a SHOP ITEM — `precast-pile-350`,
  // `steel-tube-pile-914`, `h-pile-305`, `sheet-pile-z-630` — sitting in the
  // `install` bay with its life set to its own length, so the consumable path
  // charges it by the metre of pile driven: EUR 123/m for the 350 mm precast,
  // EUR 580/m for the 914 mm tube. Choosing between them is the gameplay.
  // Pricing it here as well would be a double entry of the single biggest
  // number in the method.
  // What is left is what never reaches a bay: helmet packing (coiled rope,
  // hessian, timber sheets — research/05 §A1 "Helmet, dolly, packing"), welded
  // splices, cutting the head down to level and carting the cut-offs away, and
  // the driving records. Exponent 1.3, matching pay: a bigger section is more
  // packing, more weld and more concrete to cut off.
  'driven-pile':  { perMetre: 26,  what: 'Packing, splices, cut-off and driving records' },

  // The cheapest materials line in the game, as the brief says it should be.
  // The samplers and liners are in the `probe` and `workshop` bays and are
  // charged there. `site-investigation` has no `service` bay at all, so the
  // standpipe, the piezometer and the well screen — which exist as items —
  // can never be fitted, and this row is the only place they are paid for.
  // Plus bags and jars, bentonite and grout for the backfill, and the
  // laboratory schedule, which is what the client is actually buying
  // (research/06 §A.7 "Standpipes, piezometers, monitoring wells").
  'site-investigation': { perMetre: 14, what: 'Standpipes, backfill, sample containers and lab schedule' },
});

/**
 * Slots whose consumption is priced on the MATERIALS line above, and which
 * `consumableCostForRun` must therefore skip.
 *
 * Both entries exist because `data.js` puts several alternative supplies in ONE
 * bay — a bolter's `service` bay holds a plate, a nut, a resin box AND a roll
 * of mesh, and only one can be fitted — so the wear path charges for whichever
 * happens to be equipped and for none of the others. A bolt needs all of them.
 * Pricing the set as a set on the materials line is both cheaper to reason
 * about and the only way to get the arithmetic right.
 *
 * It also disarms a live landmine. `detonator-reel-500` carries `life: 1`,
 * which is not a length; charged against a heading's 1,391 metres of blasthole
 * it would read as 1,391 reels and EUR 626,000 on an EUR 53,000 job.
 */
const MATERIALS_COVERS_SLOTS = Object.freeze({
  'tunnel-jumbo': new Set(['service']),
  rockbolt: new Set(['service']),
});

/**
 * Consumed materials for a run. Not tooling — this is the stuff that never
 * comes back out of the hole.
 * @returns {{total:number, perMetre:number, what:string}}
 */
export function materialsCostForRun(methodId, metres, holeDiaMm, skills = {}, regionId = null) {
  const method = getMethod(methodId);
  const spec = MATERIALS[methodId];
  /* A METHOD WITH NO ROW CONSUMES NOTHING, AND THIS HAS ALREADY SHIPPED.
     `oil-rotary` and the six METHOD_IDS.md methods each ran with their single
     largest cost line at zero because this table had no row for them, and the
     symptom was `rc` topping the mid-game ladder — a balance reading, twenty
     levels away from the cause. All 21 methods have a row today. Method #22
     will not, and the day it lands this line must say so instead of quietly
     making it the most profitable work in the game. */
  if (method && !spec && metres > 0) {
    unknownRef('materials row for method', methodId, 'MATERIALS in economy.js '
      + 'has no row for it, so the run consumes NO materials at all. On every '
      + 'method that has a row this is between 1 % and 48 % of the cost sheet');
  }
  if (!method || !spec || metres <= 0) return { total: 0, perMetre: 0, what: '' };
  const ratio = clamp((holeDiaMm || method.nominalDia) / method.nominalDia, 0.4, 3.2);
  const diaExp = MATERIAL_DIA_EXPONENT[methodId] ?? 1;
  const scale = diaExp ? Math.pow(ratio, diaExp) : 1;
  const sk = resolveSkills(skills);
  const region = getRegion(regionId);
  const perMetre = spec.perMetre * scale * (region?.costMult ?? 1) * sk.m('consumable.price');
  return { total: Math.round(perMetre * metres), perMetre: +perMetre.toFixed(2), what: spec.what };
}

/**
 * Crew wages for a run. You are one pair of hands; the rest of the gang is paid
 * whether the bit is turning or not.
 *
 * WHAT THIS USED TO DO, AND WHY IT WAS THE WORST BUG IN THE ECONOMY. It read
 * `heads = 1 + role.perks.crew` and paid every one of those heads the PLAYER's
 * own Talent day rate. `perks.crew` is a career perk — the size of the outfit
 * whose name is on the invoice — not the gang standing round one mast. At
 * level 60 that is 21 heads on EUR 1,500/day each: EUR 2,864 an hour, EUR
 * 31,500 a day, to run a two-man auger rig. It made every method in the game
 * lose money with a best-in-class loadout at level 60.
 *
 * Worse, it was the mechanism behind the broken ladder. Because the role
 * follows the player's LEVEL, and a method's unlock level decides what role the
 * player is wearing when they first run it, the crew line grew with unlock
 * level all by itself: EUR 175/h on `anchor` at L31, EUR 425/h on `sonic` at
 * L42, EUR 790/h on `jet-grouting` at L47 — for the same work. The later a
 * method unlocked, the more it cost to run. No amount of `basePayPerMetre`
 * would have fixed that; it is not a pay problem.
 *
 * What decides a gang is the METHOD (a sonic truck is three people; a derrick
 * floor is eight) and the region's labour market. `role` still matters, but
 * only as seniority: a superintendent runs a better and better-paid crew than
 * a helper does, over a range you can defend rather than a 21x multiplier.
 *
 * The base rate is Eurostat's 2025 employer hourly labour cost for the EU
 * CONSTRUCTION sector, EUR 31.5/h (`research/07-hdd-trenchless.md` §C3) — the
 * fully-loaded cost of an hour of a hand to the company that employs him, which
 * is exactly the number a contractor's cost sheet carries. It is not take-home
 * pay and it is not a day rate; the same source is explicit about that.
 */
export const CREW_HOURLY_BASE = 31.5;

export function crewCostFor(hours, opts = {}) {
  const { roleId = 'helper', regionId = null, skills = {}, methodId = null } = opts;
  const h = Math.max(0, hours || 0);
  if (h <= 0) return 0;
  const role = roleOrBase(roleId, 'crew wages') || ROLES[0];
  const method = getMethod(methodId);

  // The gang for one rig on one shift, the player included. He is paid out of
  // what is left, so the wage bill is everyone else.
  const paidHeads = Math.max(0, (method?.crewSize ?? 2) - 1);
  if (paidHeads === 0) return 0;

  // Seniority: a Drilling Superintendent's gang is not an apprentice's gang.
  // EUR 31.5/h at the bottom of the ladder to EUR 48.8/h at the top — which
  // brackets Eurostat's own EU-construction-to-Sweden spread of 31.5 to 48.9.
  const seniority = 1 + clamp((role.level - 1) / (MAX_LEVEL - 1), 0, 1) * 0.55;
  const region = getRegion(regionId);
  const sk = resolveSkills(skills);

  return Math.round(h * paidHeads * CREW_HOURLY_BASE * seniority
    * (region?.costMult ?? 1) * sk.m('upkeep.cost'));
}

/**
 * Rigging up on site: crane time, base slab, water supply, welfare — and the
 * ancillary plant the method needs BEYOND the drill rig.
 *
 * That second half was missing, and it is why the capital-heavy methods looked
 * cheap to start. A jet-grouting spread is a 240–600 kW high-pressure pump at
 * 700 bar, a colloidal batching plant and suction pumps for the backflow
 * (`research/05-foundation-piling.md` §A12) — none of which is the crawler the
 * rig table charges for. A CFA job needs a concrete pump and a cage crane; an
 * HDD job needs a mixing and recycling spread and a vac truck. `method.plantMob`
 * carries that as a EUR figure per job, because it is a mobilisation and not a
 * fraction of somebody's capital.
 */
export function siteSetupCost(rigId, methodId, holes = 1, skills = {}, regionId = null) {
  const rig = getRig(rigId);
  const method = getMethod(methodId);
  /* Rigging up is free if either id misses, and on the heavy spreads this is
     the second-largest number on the sheet — `plantMob` alone is EUR 9,000 on
     a well and EUR 6,500 on a heading. */
  if ((rigId && !rig) || (methodId && !method)) {
    unknownRef(rig ? 'methodId' : 'rigId', rig ? methodId : rigId,
      'siteSetupCost cannot resolve it, so standing the spread up — crane, '
      + 'slab, water, welfare and the ancillary plant the method needs — is '
      + 'being charged at EUR 0');
  }
  if (!rig || !method) return 0;
  const sk = resolveSkills(skills);
  const region = getRegion(regionId);
  const plant = (method.plantMob || 0) * (0.7 + 0.06 * method.difficulty);
  return Math.round((rig.price * 0.0035 * method.difficulty * RIG_UP_SHARE(methodId)
      + plant + Math.max(0, holes) * 40)
    * (region?.costMult ?? 1) * sk.m('upkeep.cost'));
}

/**
 * How much of a full rig-up a method actually stands up.
 *
 * `rig.price x 0.0035 x difficulty` prices CRANING A MACHINE ONTO A SITE — low
 * loader, crane, base slab, water, welfare, a day of two fitters. That is the
 * right shape for a piling leader, a raise borer or a derrick. It is the wrong
 * shape entirely for the three underground development machines, which are a
 * mine's own mobile plant: a jumbo, a bolter and a longhole rig TRAM to the
 * next heading under their own power, on services the mine already runs, and
 * the ancillary they do need is what `method.plantMob` is for. Charging 1.05 %
 * of a EUR 460,000 bolter's capital value every time it moves to the next
 * drive made the set-up EUR 5,630 of a EUR 7,600 tender.
 *
 * 0.3 is a judgement, not a sourced figure, and it is recorded as one. What is
 * NOT a judgement is that a self-propelled machine tramming 200 m underground
 * does not cost the same to stand up as a 78-tonne leader arriving on a
 * low-loader, which is what a flat multiplier was asserting.
 */
function RIG_UP_SHARE(methodId) {
  return UNDERGROUND_MOBILE.has(methodId) ? 0.3 : 1;
}
const UNDERGROUND_MOBILE = new Set(['tunnel-jumbo', 'rockbolt', 'longhole']);

/**
 * HOURS spent standing the spread up, which the game was charging for in money
 * and not in time.
 *
 * `estimateHoursBreakdown` counts drilling, per-hole set-up and tripping. It
 * does not count rigging up, so a contract that is mostly mobilisation was
 * billed at a handful of hours and its euro-per-hour went through the roof:
 * `driven-pile` — one pile, 2.5 drilling hours, a 78-tonne leader arriving on
 * low-loaders — read as EUR 5,205/h, the best rate in the game and better than
 * raise boring twenty levels later. Nobody does four of those in a day; they
 * spend the day moving. Without this term the ladder is being ranked on a
 * denominator that omits most of the work.
 *
 * The rate comes from data.js's own description of the derrick: it "arrives in
 * twenty-two loads and takes a week to rig up" at 940 transport tonnes. A week
 * of productive hours over 940 t is 0.058 h/t, and every other machine is
 * scaled off that single anchor — 4.5 t crawler 0.3 h, 18 t sonic truck 1.0 h,
 * 78 t piling leader 4.5 h, 118 t BG 6.8 h. Underground mobile plant trams and
 * takes the same 0.3 share it takes in money.
 */
export function mobilisationHours(rigId, methodId) {
  const rig = getRig(rigId);
  if (!rig) return 0;
  return rig.transportTons * 0.058 * RIG_UP_SHARE(methodId);
}

/**
 * Company overhead: the yard, the workshop, the fitter's van, the estimator,
 * the insurances, the finance on the fleet. It is charged as a percentage of
 * turnover because that is how a specialist contractor actually carries it —
 * 5 % when you are one pair of hands with a crawler and an invoice book, 17 %
 * by the time you are a Drilling Superintendent with a fleet, a yard and a
 * payroll to meet whether the bit turns or not.
 *
 * WHY IT HAD TO EXIST. `ROLES` hands out `payoutMult` up to 1.35 and
 * `perks.crew` up to 20, and until now the game collected the revenue side of
 * growing an outfit and none of the cost side. Together with the region
 * multiplier (up to 3.1x on the payout), the grade bonus, the reputation bonus
 * and the way a premium bit shortens a lump-sum job, every one of those terms
 * multiplied income and nothing multiplied cost — which is the whole mechanism
 * behind a career finishing on tens of millions of euro. This is the line that
 * scales with exactly the thing that was running away.
 *
 * Note this is the honest home for `role.perks.crew`. It was being read as a
 * literal gang standing round the mast and charged at the player's own day
 * rate (see crewCostFor); what it really describes is the size of the business,
 * and the size of the business is an overhead.
 *
 * ⚠ IT IS CHARGED ON TURNOVER NET OF DISBURSEMENTS, not on the invoice total.
 * `makeContract` now prices mob/demob as its own lump-sum item and pays 75 % of
 * standing the spread up; that money is a pass-through, not margin, and taxing
 * it at 5-30 % punished exactly the methods whose tender is mostly
 * mobilisation. On `driven-pile` — one pile per contract against a EUR 980,000
 * leader — the mobilisation is about three quarters of the tender, and the
 * overhead line alone was EUR 4,668 of a EUR 1,020 loss. A contractor recovers
 * overhead on the value of the WORK and passes disbursements through at cost;
 * so does this. Pass `disbursements` (setup + travel) and it comes off the base.
 */
export function overheadFor(revenue, opts = {}) {
  const { roleId = null, skills = {}, disbursements = 0 } = opts;
  const r = Math.max(0, (revenue || 0) - Math.max(0, disbursements || 0));
  if (r <= 0) return 0;
  const role = roleOrBase(roleId, 'company overhead') || ROLES[0];
  const seniority = clamp((role.level - 1) / (MAX_LEVEL - 1), 0, 1);
  const rate = ECON.overheadRateBase + seniority * ECON.overheadRateGrowth;
  const sk = resolveSkills(skills);
  return Math.round(r * rate * sk.m('upkeep.cost'));
}

/**
 * Standby: hours the crew and the machine are on site, on the clock, and not
 * drilling — waiting out weather, waiting on a permit, waiting on the client.
 * Nobody pays you for them and everybody still gets paid.
 *
 * Every region already declares a weather distribution and nothing read it.
 * This is what it is for: rain stops some work, fog stops more of it, and snow
 * stops nearly all of it, so an Arctic campaign at 34 % snow loses a third of
 * its on-site hours and an Iberian quarry at 62 % clear loses almost none.
 * Standby costs crew and rig upkeep; it does not cost fuel, because the engine
 * is off, and it does not consume materials, because nothing is going in the
 * ground.
 *
 * @returns {number} unproductive hours to be paid for on top of `hours`
 */
export function standbyHoursFor(hours, regionId) {
  const region = getRegion(regionId);
  const h = Math.max(0, hours || 0);
  if (!region || h <= 0) return 0;
  const w = region.weather || {};
  const lost = (w.rain || 0) * 0.35 + (w.fog || 0) * 0.5 + (w.snow || 0) * 0.8;
  return h * clamp(lost, 0, 0.5);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RUNNING COSTS
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * Upkeep plus fuel plus insurance for `hours` on a rig.
 * @returns {{upkeep:number,fuel:number,insurance:number,total:number}}
 */
export function upkeepFor(rigId, hours, opts = {}) {
  const rig = getRig(rigId);
  const h = Math.max(0, hours || 0);
  /* AN UNKNOWN RIG RUNS FOR NOTHING. Upkeep, fuel, insurance AND depreciation
     all come out of this one row, so a bad `rigId` deletes the entire running
     line — the largest cost on `oil-rotary` at 30.7 % of the sheet — and the
     result still balances. `settleRun` defaults `rigId` to 'crawler-lite', so
     the failure arrives as a wrong machine rather than as a missing one. */
  if (rigId && !rig) {
    unknownRef('rigId', rigId, 'not in data.js RIGS. Upkeep, fuel, insurance '
      + 'and depreciation are all being charged at ZERO for this run');
  }
  if (!rig || h <= 0) return { upkeep: 0, fuel: 0, insurance: 0, depreciation: 0, total: 0 };
  const { skills = {}, roleId = null, condition = 1, regionId = null } = opts;
  const sk = resolveSkills(skills);
  const role = roleOrBase(roleId, 'the upkeep discount');
  const roleDiscount = 1 - (role?.perks.upkeepDiscount ?? 0);
  // Service, parts and diesel all arrive on the same truck as everything else,
  // so they carry the region's cost of doing business. Insurance and
  // depreciation do not: they are properties of the machine, not of the site.
  /* AN UNKNOWN REGION MUST NOT SILENTLY BILL AT BASE RATE.
     `settleRun` already warns when a contract arrives with NO regionId. It did
     not warn when the id was PRESENT and unknown, and that is the worse case:
     the number looks answered. Both `upkeep` and `fuel` below multiply by this,
     and the results screen prints the total with no sign the multiplier never
     applied — so a player in Sahara or Arctic is quietly billed Nordic
     operating costs. `?? 1` is the right VALUE to fall back to; being quiet
     about it was the defect. */
  const regionRow = getRegion(regionId);
  if (regionId && !regionRow) {
    warnOnce('[economy] unknown regionId "' + regionId + '" — not in data.js '
      + 'REGIONS. Upkeep and fuel are being billed at the base rate, with no '
      + 'region cost multiplier applied.', regionId);
  }
  const regionCost = regionRow?.costMult ?? 1;

  const upkeep = rig.upkeepPerHour * h * sk.m('upkeep.cost') * roleDiscount
    * conditionUpkeepPenalty(condition) * regionCost;
  const fuel = rig.fuelPerHour * h * sk.m('fuel.cost') * regionCost;
  const insurance = rig.price * ECON.insurancePerHour * h;
  // Depreciation. A rig is written down over roughly 9,000 operating hours,
  // and on the big foundation machines it is the largest line on the job.
  const depreciation = rig.price * ECON.depreciationPerHour * h;
  const total = upkeep + fuel + insurance + depreciation;
  return {
    upkeep: Math.round(upkeep), fuel: Math.round(fuel),
    insurance: Math.round(insurance), depreciation: Math.round(depreciation),
    total: Math.round(total),
  };
}

/**
 * A tired machine costs more to keep running: 1.0 when fresh, up to 2.6x when
 * it is overdue a major service. This is the pressure that makes the
 * Maintenance & Repair line in the shop worth buying.
 */
export function conditionUpkeepPenalty(condition = 1) {
  const c = clamp(condition, 0, 1);
  return 1 + Math.pow(1 - c, 2) * 1.6;
}

/** Rate at which operating hours consume a rig's condition. */
export function rigWearPerHour(rigId) {
  const rig = getRig(rigId);
  if (!rig) return 0;
  // Heavier, harder-working machines fall due for service sooner.
  return 1 / (7200 - clamp(rig.stats.power / 450, 0, 1) * 2400);
}

/**
 * Cost of a major service, scaled by how far the machine has been let go.
 * Restores 0.4 of condition (see progression.serviceRig).
 */
export function rigServiceCost(rigId, condition = 1, skills = {}) {
  const rig = getRig(rigId);
  /* A free major service also RESTORES 0.4 of condition in
     `progression.serviceRig`, so an unknown rig id is not merely uncharged —
     it is a repair the player is given. */
  if (rigId && !rig) {
    unknownRef('rigId', rigId, 'rigServiceCost cannot price a major service '
      + 'for it, so the service is free and still restores condition');
  }
  if (!rig) return 0;
  const sk = resolveSkills(skills);
  const neglect = 1 + Math.pow(1 - clamp(condition, 0, 1), 1.5) * 1.2;
  return Math.round(rig.price * 0.022 * neglect * sk.m('upkeep.cost'));
}

/**
 * Mobilisation cost between regions. Scales with rig mass, because that is
 * what actually decides whether it is a low-loader or three trailers and a crane.
 */
export function travelCost(fromRegionId, toRegionId, opts = {}) {
  if (fromRegionId === toRegionId) return 0;
  const to = getRegion(toRegionId);
  /* MOBILISING SOMEWHERE THAT DOES NOT EXIST IS FREE. `progression.acceptContract`
     and `travelTo` both charge the player this number and both accept 0
     happily, so a bad destination id moves a 940-tonne derrick across the world
     for nothing. */
  if (!to) {
    unknownRef('destination regionId', toRegionId, 'not in data.js REGIONS. '
      + 'Mobilisation to it is being charged at EUR 0');
    return 0;
  }
  const { rigId = 'crawler-lite', skills = {} } = opts;
  const rig = getRig(rigId);
  /* …and freight is priced on MASS, so an unknown machine travels as a 5-tonne
     one: about a fifth of what a piling leader costs to move and a two-hundredth
     of a derrick. 5 is the right stand-in and it is the quietness that is the
     defect. */
  if (rigId && !rig) {
    unknownRef('rigId', rigId, 'not in data.js RIGS. Freight is being priced as '
      + 'a 5-tonne machine, which is a fraction of what the real fleet costs to move');
  }
  const tons = rig ? rig.transportTons : 5;
  const massFactor = clamp(Math.pow(tons / 12, 0.65), 0.35, 3.4);
  const from = getRegion(fromRegionId);
  // Hopping between two expensive regions is cheaper than coming from home base.
  const continuity = from ? clamp(1 - (from.travelCost / 30000) * 0.4, 0.65, 1) : 1;
  const sk = resolveSkills(skills);
  return Math.round(to.travelCost * massFactor * continuity * sk.m('travel.cost'));
}

/** Certificate course fee after the Site Lead training-budget line. */
export function certCost(certId, skills = {}) {
  const cert = getCert(certId);
  /* A certificate gates a REGION, and the regions it gates are the ones with
     the payout multipliers. Free and instant is the wrong price for that. */
  if (certId && !cert) {
    unknownRef('certId', certId, 'not in data.js CERTS. The course is being '
      + 'priced at EUR 0 and 0 training hours');
  }
  if (!cert) return { price: 0, hours: 0 };
  const sk = resolveSkills(skills);
  return {
    price: Math.round(cert.price * sk.m('cert.price')),
    hours: Math.round(cert.trainingHours * sk.m('cert.trainingHours')),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAYOUT
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * Settle a completed contract.
 *
 * PER-UNIT CONTRACTS. When the method is sold by the bolt or by the pile (see
 * PAY_UNITS), pass `unitsCompleted` and the base becomes `rate x units` — a
 * bolter who installs forty of sixty-seven bolts is paid for forty bolts. The
 * rate is the tender divided by the unit count, so a full contract settles to
 * exactly `contract.payout` and nothing about the ladder moves. Omit it and the
 * old hole-count completion applies unchanged, which is what every other method
 * and every existing caller gets.
 *
 * @param {Object} contract               from data.makeContract
 * @param {{grade?:string, hours?:number, holesCompleted?:number, skills?:Object,
 *          roleId?:string, reputation?:number, hazardsHit?:number,
 *          safetyIncidents?:number, unitsCompleted?:number,
 *          deadlineHours?:number}} [opts]
 * @returns {{gross:number, base:number, gradeMult:number, timeBonus:number,
 *            qualityBonus:number, latePenalty:number, hazardPenalty:number,
 *            roleMult:number, skillMult:number, repMult:number,
 *            units:?Object}}
 */
export function payoutForContract(contract, opts = {}) {
  if (!contract) return { gross: 0, base: 0, gradeMult: 1, timeBonus: 0, qualityBonus: 0, latePenalty: 0, hazardPenalty: 0, roleMult: 1, skillMult: 1, repMult: 1, units: null };
  const {
    grade = 'C', hours = contract.estimatedHours || 0, holesCompleted = contract.holes,
    skills = {}, roleId = null, reputation = 0, hazardsHit = 0, safetyIncidents = 0,
    unitsCompleted = null,
  } = opts;

  const sk = resolveSkills(skills);
  const role = roleOrBase(roleId, 'the payout multiplier');

  // ── the unit of delivery ────────────────────────────────────────────────
  // A per-unit contract is settled in its own units. Everything else is
  // settled per hole, exactly as before.
  const units = contractUnits(contract);
  const unitsDone = units && unitsCompleted != null
    ? clamp(Math.round(unitsCompleted), 0, units.count) : null;
  const completion = unitsDone != null
    ? clamp(unitsDone / Math.max(1, units.count), 0, 1)
    : clamp((holesCompleted || 0) / Math.max(1, contract.holes), 0, 1);

  // A completed contract settles to the tender EXACTLY. `ratePerUnit` is a
  // rounded euro, so 52 x 240 is 12,480 against a 12,500 tender; the last unit
  // carries the remainder rather than the client keeping twenty euro.
  const base = unitsDone != null
    ? (unitsDone >= units.count ? contract.payout : units.ratePerUnit * unitsDone)
    : contract.payout * completion;
  const gradeMult = gradeBonusMultiplier(grade);

  // Time bonus decays to zero at the deadline; nothing for finishing late.
  const deadline = Math.max(1, opts.deadlineHours || contract.deadlineHours || 1);
  const early = clamp(1 - hours / deadline, 0, 1);
  const timeBonus = completion >= 1 ? (contract.bonus?.time || 0) * Math.pow(early, 0.6) : 0;

  // Quality bonus is only paid for genuinely good work.
  const g = String(grade).toUpperCase();
  const qualityFactor = g === 'S' ? 1 : g === 'A' ? 0.6 : g === 'B' ? 0.25 : 0;
  const qualityBonus = completion >= 1 ? (contract.bonus?.quality || 0) * qualityFactor : 0;

  const overHours = Math.max(0, hours - deadline);
  const latePenalty = base * clamp(overHours * ECON.latePenaltyPerHour, 0, ECON.latePenaltyMax);

  const hazardPenalty = base * clamp(
    (hazardsHit * 0.012 + safetyIncidents * 0.06) * sk.m('hazard.penalty'), 0, 0.4);

  const roleMult = role?.perks.payoutMult ?? 1;
  const skillMult = sk.m('payout.mult');
  const repMult = 1 + clamp(reputation / ECON.reputationCap, 0, 1) * ECON.reputationBonusMax;

  const gross = Math.max(0, (base * gradeMult + timeBonus + qualityBonus - latePenalty - hazardPenalty)
    * roleMult * skillMult * repMult);

  return {
    gross: Math.round(gross),
    base: Math.round(base),
    gradeMult,
    timeBonus: Math.round(timeBonus),
    qualityBonus: Math.round(qualityBonus),
    latePenalty: Math.round(latePenalty),
    hazardPenalty: Math.round(hazardPenalty),
    roleMult, skillMult, repMult: +repMult.toFixed(3),
    /** The unit basis, when there is one — `{unit, plural, count, ratePerUnit}`. */
    units: units ? { ...units, completed: unitsDone } : null,
  };
}

/** Reputation gained for a completed contract. */
export function reputationForContract(contract, opts = {}) {
  const { grade = 'C', skills = {}, roleId = null } = opts;
  const sk = resolveSkills(skills);
  const role = roleOrBase(roleId, 'the reputation multiplier');
  const gradeFactor = { S: 1.6, A: 1.3, B: 1.1, C: 1, D: 0.4 }[String(grade).toUpperCase()] ?? 1;
  const base = contract?.reputationReward ?? 20;
  return Math.round(base * gradeFactor * sk.m('reputation.gain') * (role?.perks.repGain ?? 1));
}

/** XP awarded for a completed contract. */
export function xpForContract(contract, opts = {}) {
  if (!contract) return 0;
  const method = getMethod(contract.methodId);
  if (!method) return 0;
  const { grade = 'C', holesCompleted = contract.holes, skills = {}, firstTime = false } = opts;
  const completion = clamp((holesCompleted || 0) / Math.max(1, contract.holes), 0, 1);
  const metres = contract.metres * completion;
  const groundFactor = 0.85 + 0.5 * (contract.hardness ?? 0.5);
  const perHole = (30 + 14 * (contract.difficulty || 1)) * (holesCompleted || 0);
  const gradeFactor = { S: 1.5, A: 1.25, B: 1.1, C: 1, D: 0.75 }[String(grade).toUpperCase()] ?? 1;
  const firstBonus = firstTime ? 250 + 60 * (method.difficulty || 1) : 0;
  const sk = resolveSkills(skills);
  return Math.round((metres * method.xpPerMetre * groundFactor + perHole) * gradeFactor * sk.m('reputation.gain') + firstBonus);
}

/**
 * Full profit-and-loss for one contract run. This is the single function
 * progression.js uses to settle a hole, and the one simulateCareer uses to
 * balance the game — so there is exactly one model, not two.
 *
 * @returns {{revenue:number, costs:{consumables:number,flushing:number,materials:number,
 *            fuel:number,upkeep:number,insurance:number,depreciation:number,crew:number,
 *            setup:number,travel:number,overhead:number,total:number},
 *            net:number, hours:number, standbyHours:number, xp:number,
 *            reputation:number, lines:Object[], payout:Object}}
 */
export function settleRun(contract, p = {}) {
  const {
    loadout = {}, rigId = 'crawler-lite', grade = 'C', skills = {}, roleId = null,
    reputation = 0, fromRegionId = null, wob = 0.55, rpm = 0.55, flush = 0.6,
    holesCompleted = contract?.holes ?? 1, hazardsHit = 0, safetyIncidents = 0,
    firstTime = false, hoursOverride = null, includeSetup = true,
    unitsCompleted = null,
  } = p;

  const method = getMethod(contract?.methodId);
  const methodId = contract?.methodId;

  /* ── SAY IT, DO NOT SWALLOW IT ────────────────────────────────────────
     Nine tables below key off `methodId` — hole metres, the ROP basis, the
     unit of pay, flushing, materials, rig-up share, mobilisation hours, crew
     size and the tuning model — and every one of them has a sane-looking
     default row. A settlement with no method therefore produces a complete,
     confident, entirely fictional cost sheet. It has to be audible. */
  if (!contract) {
    warnOnce('[economy] settleRun called with no contract — every term is a '
      + 'default and the result is fiction');
  } else if (!methodId) {
    warnOnce('[economy] settleRun: contract has no methodId — hole metres, ROP '
      + 'basis, flushing, materials, rig-up and crew size are all falling back '
      + 'to their default rows', contract.id);
  } else if (!method) {
    warnOnce('[economy] settleRun: unknown methodId — not in data.js METHODS',
      methodId);
  }
  if (contract && !contract.regionId) {
    warnOnce('[economy] settleRun: contract has no regionId — no region cost '
      + 'multiplier and no weather standby is being charged', contract.id);
  }

  // Completion follows the unit of delivery — bolts and piles have their own —
  // and everything downstream is scaled by it, so a half-finished drive costs
  // half the bolts as well as being paid for half of them.
  const units = contractUnits(contract);
  const unitsDone = units && unitsCompleted != null
    ? clamp(Math.round(unitsCompleted), 0, units.count) : null;
  const completion = unitsDone != null
    ? clamp(unitsDone / Math.max(1, units.count), 0, 1)
    : clamp(holesCompleted / Math.max(1, contract?.holes || 1), 0, 1);

  const metres = (contract?.metres || 0) * completion;
  /* METRES OF HOLE, which on six methods is not `metres`. Bits, rods, shanks,
     couplings and the flushing medium are consumed by this and by nothing else
     — see THE UNIT OF WORK. A 20 m tunnel round is 3,111 m of blasthole. */
  const holeMetres = holeMetresFor(methodId, metres);
  const hardness = contract?.hardness ?? 0.5;
  const abrasivity = contract?.abrasivity ?? 0.5;
  const sk = resolveSkills(skills);

  const compressor = getItem(loadout.compressor);
  const pump = getItem(loadout.pump);
  const flushCapacity = clamp(
    (compressor?.stats.flushRate || 0) + (pump?.stats.flushRate || 0) || 1, 0.4, 3);

  // Better tooling really does finish sooner — but only the part of the job
  // that is cutting ground. Rigging up, tramming to the next peg, running
  // casing and winching a product pipe back through a reamed bore take exactly
  // as long with the best crown in the shop as with the worst.
  const bit = getItem(loadout.bit);
  const toolRop = clamp((bit?.stats.ropMult || 1) * sk.m('rop.mult'), 0.5, 2.6);
  const split = estimateHoursBreakdown(contract?.methodId, metres, hardness, holesCompleted);
  /* THE ROP BASIS. `estimateHoursBreakdown` divides contract metres by
     `nominalRop`, which is correct on twenty methods and wrong on `rockbolt`,
     whose rate is quoted per metre of HOLE. Scaling the drilling half — and
     only the drilling half; moving the machine to the next set-up takes the
     same time either way — is what stops a bolter's 67 bolts being priced at
     36 minutes. See ropBasisFactor(). */
  const ropBasis = ropBasisFactor(methodId);
  // Standing the spread up is time as well as money — see mobilisationHours.
  const mobHours = (includeSetup && holesCompleted > 0) ? mobilisationHours(rigId, methodId) : 0;
  const hours = hoursOverride != null
    ? Math.max(0.5, hoursOverride + mobHours)
    : Math.max(0.5, (split.drill * ropBasis) / toolRop + split.flat + mobHours);
  /* The client's deadline came out of the same estimate, so it carries the same
     omissions: `estimateHoursBreakdown` counts no rig-up at all, and on
     `rockbolt` it divides drive metres by a hole-metre rate. Correct the
     deadline by exactly the same two terms, or the fixes above would make every
     bolting and every heavy-spread job late for reasons that are not the
     player's. */
  const deadlineHours = Math.max(1,
    (contract?.deadlineHours || 1) * (ropBasis > 1 ? ropBasis : 1) + mobHours);

  const wearArgs = {
    loadout, metres: holeMetres, hardness, abrasivity, ucs: hardness * 300,
    wob, rpm, flush, flushCapacity, skills, regionId: contract?.regionId, reputation,
    skipSlots: MATERIALS_COVERS_SLOTS[methodId] || null,
  };
  const consumables = consumableCostForRun(wearArgs);
  const dia = contract?.holeDia || (method?.nominalDia ?? 150);
  const regionId = contract?.regionId ?? null;
  // Flushing is a VOLUME of hole, so it follows hole metres too.
  const flushing = flushingCostForRun(contract?.methodId, holeMetres, dia, skills, regionId);
  // Materials are per metre of the CONTRACT's own unit — see the table.
  const materials = materialsCostForRun(contract?.methodId, metres, dia, skills, regionId);
  /* ── THE TWO CLOCKS ───────────────────────────────────────────────────
     `hours` is the whole job, and it is what the deadline and the euro-per-hour
     are measured against. But only the OPERATING part of it burns diesel,
     insurance and depreciation: `ECON.depreciationPerHour` writes a machine
     down over ~9,000 OPERATING hours, and a derrick standing in twenty-two
     pieces waiting for a crane is not operating. Charging the 54-hour rig-up of
     a EUR 4.85 M derrick at full fuel and depreciation took `oil-rotary` from a
     18.5 % margin to 5.2 %, which is an artefact of the accounting and not a
     fact about wells.

     Rig-up is therefore costed exactly the way `standbyHoursFor` costs weather:
     the crew is paid and the machine is maintained, the engine is off and
     nothing is being written down. */
  const workHours = Math.max(0, hours - mobHours);
  // Weather and waiting. Paid hours that produce nothing — see standbyHoursFor.
  const standby = standbyHoursFor(hours, regionId);
  const running = upkeepFor(rigId, workHours, { skills, roleId, condition: p.rigCondition ?? 1, regionId });
  const idleHours = standby + mobHours;
  const idleUpkeep = idleHours > 0
    ? upkeepFor(rigId, idleHours, { skills, roleId, condition: p.rigCondition ?? 1, regionId }).upkeep
    : 0;
  const standbyUpkeep = idleUpkeep;
  const crew = crewCostFor(hours + standby, { roleId, regionId, skills, methodId: contract?.methodId });
  const setup = (includeSetup && holesCompleted > 0)
    ? siteSetupCost(rigId, contract?.methodId, holesCompleted, skills, regionId) : 0;
  const travel = fromRegionId ? travelCost(fromRegionId, contract?.regionId, { rigId, skills }) : 0;

  const payout = payoutForContract(contract, {
    grade, hours, holesCompleted, skills, roleId, reputation, hazardsHit, safetyIncidents,
    unitsCompleted, deadlineHours,
  });

  const overhead = overheadFor(payout.gross, { roleId, skills, disbursements: setup + travel });

  const costsTotal = consumables.total + flushing + materials.total
    + running.total + standbyUpkeep + crew + setup + travel + overhead;
  return {
    revenue: payout.gross,
    costs: {
      consumables: consumables.total,
      flushing,
      materials: materials.total,
      fuel: running.fuel,
      upkeep: running.upkeep + standbyUpkeep,
      insurance: running.insurance,
      depreciation: running.depreciation,
      crew,
      setup,
      travel,
      overhead,
      total: costsTotal,
    },
    materialsNote: materials.what,
    standbyHours: +standby.toFixed(2),
    /** Hours standing the spread up — paid, but not operating hours. */
    mobilisationHours: +mobHours.toFixed(2),
    net: payout.gross - costsTotal,
    hours: +hours.toFixed(2),
    /** Metres of hole actually drilled — `metres` on fifteen methods, not on six. */
    holeMetres: +holeMetres.toFixed(1),
    /** The unit basis when the contract has one: bolts, or the pile. */
    units: payout.units,
    xp: xpForContract(contract, { grade, holesCompleted, skills, firstTime }),
    reputation: reputationForContract(contract, { grade, skills, roleId }),
    lines: consumables.lines,
    payout,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE SAFETY NET
   A player must never be permanently bankrupted. The board therefore always
   carries a "call-out" job: shallow, soft-ground, in the home region, runnable
   with the starter loadout, and net-positive even with an empty wallet.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * The guaranteed recovery contract. Hand-shaped rather than generated, so its
 * economics can be proven rather than hoped for. The contract board should only
 * surface it while `progression.isBroke()` is true — it is a safety net, not a
 * grind.
 * @param {number} level
 * @param {string} [regionId]
 */
export function emergencyContract(level = 1, regionId = 'nordic') {
  /* THIS IS THE SAFETY NET, SO IT IS THE WORST PLACE TO BE QUIET. A broke
     player sees this card and nothing else; `progression.rescueContract()`
     builds it from `state.unlocked.regions[0]`, which is a saved value and can
     be anything a migration left behind. Falling through to REGIONS[0] prices
     the rescue at Nordic rates and stamps the contract `regionId: 'nordic'`,
     so the card is at least self-consistent — but the player asked to be
     rescued somewhere else and was not told they were not. */
  const region = getRegion(regionId) || REGIONS[0];
  if (regionId && !getRegion(regionId)) {
    unknownRef('regionId', regionId, 'emergencyContract is falling back to '
      + `"${REGIONS[0].id}". The rescue job is priced and sited there instead`);
  }
  const method = getMethod('auger');
  const targetDepth = 8;
  const holes = 3;
  const metres = targetDepth * holes;
  const groundSpec = [
    { id: 'topsoil', top: 0, bottom: 0.5, thickness: 0.5 },
    { id: 'clay', top: 0.5, bottom: 3.5, thickness: 3 },
    { id: 'silt', top: 3.5, bottom: 8, thickness: 4.5 },
  ];
  const hardness = groundHardness(groundSpec);
  // Priced on the same two-item basis as every other contract (data.makeContract):
  // the running metre plus the fixed item per trial pit.
  const payout = Math.max(
    ECON.emergencyContractFloor,
    Math.round((metres * method.basePayPerMetre * (0.75 + 0.8 * hardness)
      + holes * (method.payPerHole || 0)) * region.payMult / 10) * 10,
  );
  const hours = estimateHours('auger', metres, hardness, holes);
  return Object.freeze({
    id: `ct-callout-${regionId}-${level}`,
    /* ⚠ IT IS NOT A TRIAL PIT, AND THAT WORD MATTERS MORE HERE THAN ANYWHERE.
       A trial pit is an EXCAVATION — dug with a machine, logged by looking down
       it or climbing into it, and the standard ALTERNATIVE to a borehole in a
       ground investigation. research/06 §A.4.2 lists "block sampling from trial
       pit" as its own technique, at sample category A / class 1, alongside the
       drilled ones. A 150 mm auger hole is a borehole and always was.

       This is the safety-net contract: every broke player sees it, so it is one
       of the first strings a real driller reads, and it was wrong in a way a
       first-year geotechnical engineer would catch. It is now what it actually
       is — hollow-stem auger boreholes, which research/06 §A.4.2 puts at
       100-300 mm (the 150 mm here is inside that) taking a sample off the
       flights at category C, class 4. The method stays `auger`, because the
       whole point of a rescue job is that it runs on the starter rig and the
       starter loadout at level 1; `site-investigation` is a better fit for the
       work and does not unlock until 8. */
    title: 'Call-out: shallow auger boreholes',
    client: region.clients[0],
    regionId: region.id,
    applicationId: 'site-investigation',
    methodId: 'auger',
    requiredMethod: 'auger',
    targetDepth, holeDia: 150, holes, metres, groundSpec,
    hardness: +hardness.toFixed(3),
    abrasivity: +groundAbrasivity(groundSpec).toFixed(3),
    payout,
    bonus: { time: Math.round(payout * 0.1), quality: Math.round(payout * 0.1) },
    estimatedHours: +hours.toFixed(1),
    deadlineHours: Math.max(6, Math.round(hours * 2.2)),
    difficulty: 1,
    requiredCerts: [],
    reputationReward: 6,
    emergency: true,
    seed: 20260903,
    description: 'Three shallow auger boreholes for the local authority — sample off the flights, log it, backfill it. It pays for a tank of diesel and a set of teeth, and it is always there.',
  });
}

/**
 * Proof that the emergency contract recovers a broke player: run it with the
 * starter loadout, a worst-case grade and zero cash.
 * @returns {{net:number, revenue:number, costs:number, safe:boolean}}
 */
export function verifySafetyNet(opts = {}) {
  const { level = 1, rigId = 'crawler-lite', loadout = { bit: 'auger-flight-std', rod: 'rod-r32' }, grade = 'D' } = opts;
  const contract = emergencyContract(level);
  const r = settleRun(contract, { loadout, rigId, grade, skills: {}, roleId: 'helper', reputation: 0 });
  return { net: r.net, revenue: r.revenue, costs: r.costs.total, safe: r.net > 0 };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAREER SIMULATION — the balancing instrument.
   Deterministic: same seed, same career. It plays the game with a plausible,
   slightly cautious player policy and reports where the curve bends.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Skill priority order the simulated player follows. */
const SIM_SKILL_ORDER = [
  'ts.carbide-care', 'op.steady-hand', 'sl.negotiator', 'op.percussion-rhythm',
  'ts.bulk-buyer', 'op.feed-finesse', 'sl.crew-boss', 'ts.thread-doctor',
  'op.rod-handler', 'sl.logistics', 'ts.flush-tuning', 'op.jam-sense',
  'sl.safety-first', 'ts.hammer-service', 'op.strata-reader', 'sl.contract-book',
  'ts.field-regrind', 'op.combo-keeper', 'sl.training-budget', 'ts.heat-management',
  'sl.reputation', 'op.deep-focus', 'ts.salvage', 'sl.fuel-account',
];

function simSpendSkillPoints(sim) {
  let guard = 0;
  while (sim.skillPoints > 0 && guard++ < 200) {
    let spent = false;
    for (const id of SIM_SKILL_ORDER) {
      const skill = SKILLS.find((s) => s.id === id);
      if (!skill) continue;
      const ranks = sim.skills[id] || 0;
      if (ranks >= skill.maxRank) continue;
      if (sim.level < skill.minLevel) continue;
      if (skill.prereq.some((p) => !(sim.skills[p] > 0))) continue;
      const cost = skill.cost[ranks];
      if (cost > sim.skillPoints) continue;
      sim.skills[id] = ranks + 1;
      sim.skillPoints -= cost;
      spent = true;
      break;
    }
    if (!spent) break;
  }
}

/** Best loadout the simulated player can afford for a method. */
function simBestLoadout(sim, methodId) {
  const method = getMethod(methodId);
  const out = {};
  if (!method) return out;
  for (const slot of method.toolSlots) {
    const options = ITEMS.filter((i) =>
      i.slot === slot && i.unlockLevel <= sim.level && i.methods.includes(methodId));
    if (!options.length) { out[slot] = null; continue; }
    // A player buys the best tool they can comfortably afford, then keeps it.
    const budget = sim.money * 0.33;
    const reachable = options.filter((i) => sim.owned.has(i.id) || i.price <= budget);
    const pool = reachable.length ? reachable : options;
    // Cutting tools on ROP-per-wear; products on cost per metre delivered.
    const chosen = pool
      .slice()
      .sort(PRODUCT_SLOTS.has(slot)
        ? (a, b) => (a.price / Math.max(1, a.stats.life || 1)) - (b.price / Math.max(1, b.stats.life || 1))
        : (a, b) => (b.stats.ropMult * (1 / Math.max(0.2, b.stats.wearRate)))
                  - (a.stats.ropMult * (1 / Math.max(0.2, a.stats.wearRate))))[0];
    out[slot] = chosen ? chosen.id : null;
  }
  return out;
}

function simBuyLoadout(sim, loadout) {
  for (const slot of Object.keys(loadout)) {
    const id = loadout[slot];
    if (!id || sim.owned.has(id)) continue;
    const price = priceWithMarkup(id, { regionId: sim.regionId, reputation: sim.reputation, skills: sim.skills });
    if (price <= sim.money * 0.5) {
      sim.money -= price;
      sim.spentOnTools += price;
      sim.owned.add(id);
    } else {
      loadout[slot] = null;
    }
  }
  // Never leave the bit slot empty — fall back to the cheapest legal option.
  return loadout;
}

/** Buy the best rig the player can comfortably afford, keeping a cash buffer. */
function simConsiderRig(sim, record) {
  const buffer = 8000 + sim.level * 400;
  const runnable = new Set();
  for (const r of RIGS) if (sim.rigs.has(r.id)) for (const mm of r.methods) runnable.add(mm);
  const affordable = RIGS.filter((r) =>
    r.unlockLevel <= sim.level && !sim.rigs.has(r.id) && r.price + buffer <= sim.money);
  // A real contractor buys the cheapest machine that lets them bid new work,
  // and only then trades up. Rank by new methods opened, then by price.
  const scored = affordable.map((r) => ({
    rig: r,
    opens: r.methods.filter((mm) => !runnable.has(mm) && (getMethod(mm)?.unlockLevel ?? 99) <= sim.level).length,
  })).sort((a, b) => (b.opens - a.opens) || (a.rig.price - b.rig.price));
  const pick = scored.length ? scored[0].rig : null;
  if (!pick) return;
  sim.money -= pick.price;
  sim.spentOnRigs += pick.price;
  sim.rigs.add(pick.id);
  sim.rigId = pick.id;
  record(`rig:${pick.id}`);
}

/** Buy any certificate that opens a region the player has out-levelled. */
function simConsiderCerts(sim, record) {
  for (const cert of CERTS) {
    if (sim.certs.has(cert.id)) continue;
    if (sim.level < cert.minLevel) continue;
    if (cert.prereq.some((p) => !sim.certs.has(p))) continue;
    const { price, hours } = certCost(cert.id, sim.skills);
    if (price > sim.money * 0.25) continue;
    sim.money -= price;
    sim.spentOnCerts += price;
    sim.hours += hours;
    sim.certs.add(cert.id);
    record(`cert:${cert.id}`);
  }
}

/** Regions the simulated player is cleared to work. */
function simOpenRegions(sim) {
  return REGIONS.filter((r) =>
    r.unlockLevel <= sim.level &&
    r.reputationReq <= sim.reputation &&
    r.requiredCerts.every((c) => sim.certs.has(c)));
}

/**
 * Play a whole career and report where the curve bends.
 *
 * @param {number} hours            in-game hours to simulate
 * @param {{seed?:number, grade?:string, verbose?:boolean, startMoney?:number}} [opts]
 * @returns {Object} balance report
 */
export function simulateCareer(hours = 600, opts = {}) {
  const { seed = 20260903, startMoney = 4500 } = opts;
  const rand = makeRandom(seed);

  const sim = {
    hours: 0, money: startMoney, xp: 0, level: 1, reputation: 0,
    skills: {}, skillPoints: 0, certs: new Set(), owned: new Set(['auger-flight-std', 'rod-r32']),
    rigs: new Set(['crawler-lite']), rigId: 'crawler-lite', regionId: 'nordic',
    methodsRun: new Set(), contracts: 0, emergencies: 0,
    spentOnTools: 0, spentOnRigs: 0, spentOnCerts: 0, grossRevenue: 0, grossCosts: 0,
    minMoney: startMoney, minMoneyAtHour: 0, wentNegative: false,
  };

  const milestones = {};
  const record = (key) => { if (milestones[key] === undefined) milestones[key] = +sim.hours.toFixed(1); };
  const history = [];
  /** level -> cash in hand the moment it was reached. Fed to auditLadder(). */
  const moneyAtLevel = { 1: Math.round(sim.money) };

  let guard = 0;
  while (sim.hours < hours && guard++ < 20000) {
    // Grade drifts upward as the player gets better at the game.
    const skillish = clamp((sim.level - 1) / 40, 0, 1);
    const roll = rand.f();
    const grade = roll < 0.08 + skillish * 0.28 ? 'S'
      : roll < 0.3 + skillish * 0.35 ? 'A'
      : roll < 0.72 ? 'B'
      : roll < 0.94 ? 'C' : 'D';

    const open = simOpenRegions(sim);
    const region = open.length
      ? open.slice().sort((a, b) => b.payMult - a.payMult)[rand.f() < 0.7 ? 0 : Math.min(1, open.length - 1)]
      : REGIONS[0];

    // Look at a small board and take the best net-per-hour job that is runnable.
    let best = null;
    for (let i = 0; i < 5; i++) {
      const c = makeContract(region.id, sim.level, rand);
      if (c.requiredCerts.some((cert) => !sim.certs.has(cert))) continue;
      const rigOk = RIGS.some((r) => sim.rigs.has(r.id) && r.methods.includes(c.methodId));
      if (!rigOk) continue;
      const rig = RIGS.find((r) => sim.rigs.has(r.id) && r.methods.includes(c.methodId));
      const loadout = simBestLoadout(sim, c.methodId);
      const probe = settleRun(c, {
        loadout, rigId: rig.id, grade, skills: sim.skills, roleId: roleForLevel(sim.level).id,
        reputation: sim.reputation, fromRegionId: sim.regionId,
        rigCondition: (sim.rigCondition || {})[rig.id] ?? 1,
      });
      const perHour = probe.net / Math.max(0.5, probe.hours);
      if (!best || perHour > best.perHour) best = { contract: c, rig, loadout, probe, perHour };
    }

    // Nothing runnable, or the wallet is empty: take the call-out job.
    if (!best || sim.money < 400) {
      const c = emergencyContract(sim.level, 'nordic');
      const loadout = { bit: 'auger-flight-std', rod: 'rod-r32' };
      best = {
        contract: c, rig: getRig('crawler-lite'), loadout,
        probe: settleRun(c, { loadout, rigId: 'crawler-lite', grade: 'C', skills: sim.skills, roleId: roleForLevel(sim.level).id, reputation: sim.reputation }),
        perHour: 0, emergency: true,
      };
      sim.emergencies++;
    }

    const { contract, rig, loadout } = best;
    simBuyLoadout(sim, loadout);

    const result = settleRun(contract, {
      loadout, rigId: rig.id, grade, skills: sim.skills,
      roleId: roleForLevel(sim.level).id, reputation: sim.reputation,
      fromRegionId: sim.regionId, firstTime: !sim.methodsRun.has(contract.methodId),
      rigCondition: (sim.rigCondition || {})[rig.id] ?? 1,
    });

    // Keep the machine serviced — the sim pays for it like a player would.
    sim.rigCondition = sim.rigCondition || {};
    const cond = sim.rigCondition[rig.id] ?? 1;
    const worn = Math.max(0, cond - rigWearPerHour(rig.id) * result.hours);
    if (worn <= 0.35) {
      const svc = rigServiceCost(rig.id, worn, sim.skills);
      if (sim.money > svc * 2) { sim.money -= svc; sim.spentOnTools += svc; sim.rigCondition[rig.id] = Math.min(1, worn + 0.4); }
      else sim.rigCondition[rig.id] = worn;
    } else sim.rigCondition[rig.id] = worn;

    sim.methodsRun.add(contract.methodId);
    sim.regionId = contract.regionId;
    sim.hours += result.hours;
    sim.money += result.net;
    sim.grossRevenue += result.revenue;
    sim.grossCosts += result.costs.total;
    sim.reputation += result.reputation;
    sim.contracts++;

    const before = sim.level;
    sim.xp += result.xp;
    sim.level = levelForXP(sim.xp);
    if (sim.level > before) {
      for (let l = before + 1; l <= sim.level; l++) {
        sim.skillPoints += (LEVELS.unlocks[l]?.skillPoints ?? 1);
        record(`level:${l}`);
        // Cash in hand the moment the level is reached. This is what
        // auditLadder's buy-in test needs, and it is a measurement rather than
        // the "80 hours a level" guess it would otherwise have to make.
        if (moneyAtLevel[l] === undefined) moneyAtLevel[l] = Math.round(sim.money);
      }
      simSpendSkillPoints(sim);
    }

    if (sim.money < sim.minMoney) { sim.minMoney = sim.money; sim.minMoneyAtHour = +sim.hours.toFixed(1); }
    if (sim.money < 0) sim.wentNegative = true;

    record(`method:${contract.methodId}`);
    simConsiderCerts(sim, record);
    simConsiderRig(sim, record);

    if (sim.contracts % 25 === 0) {
      history.push({ hours: +sim.hours.toFixed(0), level: sim.level, money: Math.round(sim.money), rep: sim.reputation, rigs: sim.rigs.size });
    }
  }

  const safety = verifySafetyNet();

  // Is any single item able to trivialise the game? Compare the best value
  // (ROP x life) per euro against the median for the same slot.
  const dominance = [];
  for (const slot of ['bit', 'rod', 'hammer', 'compressor', 'pump']) {
    const pool = ITEMS.filter((i) => i.slot === slot && i.stats.ropMult > 0);
    if (pool.length < 3) continue;
    const scored = pool.map((i) => ({
      id: i.id,
      value: (i.stats.ropMult * Math.max(1, i.stats.life || 1200)) / Math.max(1, i.price),
    })).sort((a, b) => b.value - a.value);
    const median = scored[Math.floor(scored.length / 2)].value;
    dominance.push({
      slot, best: scored[0].id,
      ratioToMedian: +(scored[0].value / median).toFixed(2),
      runnerUp: scored[1].id,
      ratioToRunnerUp: +(scored[0].value / scored[1].value).toFixed(2),
    });
  }

  return {
    simulatedHours: +sim.hours.toFixed(1),
    contracts: sim.contracts,
    emergencyContracts: sim.emergencies,
    finalLevel: sim.level,
    finalXP: Math.round(sim.xp),
    finalMoney: Math.round(sim.money),
    finalReputation: sim.reputation,
    rigsOwned: [...sim.rigs],
    certsHeld: [...sim.certs],
    methodsRun: [...sim.methodsRun],
    skillPointsUnspent: sim.skillPoints,
    grossRevenue: Math.round(sim.grossRevenue),
    grossCosts: Math.round(sim.grossCosts),
    marginPct: +(100 * (sim.grossRevenue - sim.grossCosts) / Math.max(1, sim.grossRevenue)).toFixed(1),
    spentOnTools: Math.round(sim.spentOnTools),
    spentOnRigs: Math.round(sim.spentOnRigs),
    spentOnCerts: Math.round(sim.spentOnCerts),
    minMoney: Math.round(sim.minMoney),
    minMoneyAtHour: sim.minMoneyAtHour,
    everNegative: sim.wentNegative,
    bankruptcyPossible: sim.wentNegative && !safety.safe,
    safetyNet: safety,
    milestones,
    history,
    dominance,
    /** level -> cash in hand when it was reached; the buy-in test's evidence. */
    moneyAtLevel,
  };
}

/**
 * The best loadout money can buy for a method at a given level. `simBestLoadout`
 * ranks on ROP-per-wear for a player with a budget; this one ignores price,
 * because it answers a different question: what does this method look like when
 * the player is not short of anything?
 */
export function bestLoadoutFor(methodId, level = MAX_LEVEL) {
  const method = getMethod(methodId);
  const out = {};
  if (!method) return out;
  for (const slot of method.toolSlots) {
    const pool = ITEMS.filter((i) => i.slot === slot && i.unlockLevel <= level && i.methods.includes(methodId));
    if (!pool.length) { out[slot] = null; continue; }
    // ROP x life / wear is the right question for a CUTTING tool and a
    // meaningless one for a product: on the `install` bay it reads a pile's
    // LENGTH as its life and duly buys the longest, most expensive pile in the
    // shop for every job. Nobody does that. A product is chosen on cost per
    // metre of the thing it delivers.
    const rank = PRODUCT_SLOTS.has(slot)
      ? (a, b) => (a.price / Math.max(1, a.stats.life || 1)) - (b.price / Math.max(1, b.stats.life || 1))
      : (a, b) => (b.stats.ropMult * Math.max(1, b.stats.life || 1) / Math.max(0.2, b.stats.wearRate))
                - (a.stats.ropMult * Math.max(1, a.stats.life || 1) / Math.max(0.2, a.stats.wearRate));
    out[slot] = pool.slice().sort(rank)[0].id;
  }
  return out;
}

/**
 * Fast sanity sweep used by tests: does every method, run with a sensible
 * loadout, return a profit?
 *
 * ⚠ THE SIGNATURE CHANGED, AND IT MATTERS. This used to take a bare `seed`, so
 * a caller writing the natural thing — `auditMethodProfitability({ level: 60,
 * grade: 'A' })` — silently got `makeRandom({})`, which is `{} >>> 0 || 1`,
 * seed 1. Every such audit was actually measuring the DEFAULT case: each method
 * at its own unlock level + 2, grade B, on the CHEAPEST legal loadout, from a
 * single contract. Those are useful numbers, but they are not the numbers the
 * caller asked for, and two agents in a row balanced against a reading they had
 * not taken. The options are now named, `level` and `grade` do what they say,
 * and a bare number is still accepted as a seed.
 *
 * @param {number|{level?:number, grade?:string, seed?:number, samples?:number,
 *                 loadout?:'cheapest'|'best'}} [opts]
 *        `level` omitted means "each method at its own unlock level + 2", which
 *        is the question that actually matters for progression.
 */
export function auditMethodProfitability(opts = {}) {
  const o = typeof opts === 'number' ? { seed: opts } : (opts || {});
  const {
    level = null, grade = 'B', seed = 4242, samples = 1,
    loadout: loadoutMode = level === null ? 'cheapest' : 'best',
  } = o;
  const rows = [];
  for (const method of METHODS) {
    const at = level ?? method.unlockLevel + 2;
    const region = REGIONS.find((r) => r.unlockLevel <= (level ?? method.unlockLevel)
      && methodFitsRegion(method, r)) || REGIONS[0];
    const loadout = loadoutMode === 'best'
      ? bestLoadoutFor(method.id, at)
      : defaultLoadoutFor(method.id, at);
    // THE CHEAPEST MACHINE THAT CAN LEGALLY RUN IT — which is what a contractor
    // brings and, more to the point, exactly the rig `makeContract` prices the
    // mobilisation against. `RIGS.find()` returned the first in table order,
    // so `rockbolt` was costed on the EUR 495,000 jumbo while the client was
    // paying to mobilise the EUR 460,000 bolter, and `cfa` on the EUR 1.05 M
    // BG against a EUR 720,000 CFA rig. The audit was reading a rig mismatch as
    // a method being unprofitable.
    const rig = RIGS.filter((r) => r.methods.includes(method.id))
      .sort((a, b) => a.price - b.price)[0] || RIGS[0];
    const rand = makeRandom(seed);
    const acc = { revenue: 0, costs: 0, net: 0, hours: 0, xp: 0, payout: 0, n: 0 };
    for (let i = 0; i < 400 && acc.n < Math.max(1, samples); i++) {
      const c = makeContract(region.id, at, rand);
      if (c.methodId !== method.id) continue;
      const r = settleRun(c, { loadout, rigId: rig.id, grade, skills: {}, roleId: roleForLevel(at).id });
      acc.revenue += r.revenue; acc.costs += r.costs.total; acc.net += r.net;
      acc.hours += r.hours; acc.xp += r.xp; acc.payout += c.payout; acc.n++;
    }
    if (!acc.n) { rows.push({ method: method.id, unlockLevel: method.unlockLevel, skipped: true }); continue; }
    rows.push({
      method: method.id, unlockLevel: method.unlockLevel, region: region.id,
      payout: Math.round(acc.payout / acc.n),
      revenue: Math.round(acc.revenue / acc.n), costs: Math.round(acc.costs / acc.n),
      net: Math.round(acc.net / acc.n), hours: +(acc.hours / acc.n).toFixed(2),
      netPerHour: Math.round(acc.net / Math.max(0.5, acc.hours)),
      marginPct: +(100 * acc.net / Math.max(1, acc.revenue)).toFixed(1),
      xp: Math.round(acc.xp / acc.n),
    });
  }
  return rows;
}

function methodFitsRegion(method, region) {
  const ground = new Set(region.groundProfile.map((g) => g.id));
  return method.applications.some((a) => region.applications.includes(a))
    && method.validGround.some((g) => ground.has(g));
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE LADDER — is every method worth running at the level it unlocks?

   A method that unlocks at 40 and earns less per hour than one from 12 is a
   dead branch: the player will never touch it and everything behind it is
   wasted. This is the instrument that answers that question, and it answers it
   in a way `auditMethodProfitability` could not, because that function takes
   the FIRST region a method fits — which put `rc` in Iberia at payMult 1.35
   and `dth` in the Nordic forest at 1.00 and then compared their euros.

   Two columns, deliberately:
     eurPerHour           what the player actually experiences: the best region
                          they can work at that level, which is the real answer
                          to "is it worth running".
     eurPerHourNordic     the same job in the home region, so the METHOD is
                          being compared rather than the postcode.
   An inversion is only reported when it survives BOTH.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {{grade?:string, seed?:number, samples?:number, offset?:number}} [opts]
 *        `offset` is levels past the unlock at which to test (default 2 — a
 *        player does not usually run a method the hour they unlock it).
 * @returns {{rows:Object[], inversions:Object[], unaffordable:Object[]}}
 */
export function auditLadder(opts = {}) {
  const { grade = 'B', seed = 4242, samples = 6, offset = 2 } = opts;

  const measure = (method, at, regionId) => {
    const region = getRegion(regionId);
    if (!region || !methodFitsRegion(method, region)) return null;
    const loadout = defaultLoadoutFor(method.id, at);
    const rig = RIGS.filter((r) => r.methods.includes(method.id))
      .sort((a, b) => a.price - b.price)[0] || RIGS[0];
    const rand = makeRandom(seed);
    const acc = { net: 0, hours: 0, revenue: 0, costs: 0, n: 0 };
    for (let i = 0; i < 2500 && acc.n < samples; i++) {
      const c = makeContract(region.id, at, rand);
      if (c.methodId !== method.id) continue;
      const r = settleRun(c, { loadout, rigId: rig.id, grade, skills: {}, roleId: roleForLevel(at).id });
      acc.net += r.net; acc.hours += r.hours; acc.revenue += r.revenue; acc.costs += r.costs.total; acc.n++;
    }
    if (!acc.n) return null;
    return {
      rigId: rig.id, rigPrice: rig.price, samples: acc.n,
      eurPerHour: Math.round(acc.net / Math.max(0.5, acc.hours)),
      marginPct: +(100 * acc.net / Math.max(1, acc.revenue)).toFixed(1),
      netPerJob: Math.round(acc.net / acc.n),
      hoursPerJob: +(acc.hours / acc.n).toFixed(1),
    };
  };

  const rows = [];
  for (const method of METHODS) {
    const at = method.unlockLevel + offset;
    // The best region the player is actually cleared for at that level. No
    // certificate or reputation gate is assumed away.
    const open = REGIONS.filter((r) => r.unlockLevel <= at && methodFitsRegion(method, r))
      .sort((a, b) => b.payMult - a.payMult);
    const best = open.map((r) => ({ region: r.id, ...(measure(method, at, r.id) || {}) }))
      .filter((x) => x.eurPerHour !== undefined)
      .sort((a, b) => b.eurPerHour - a.eurPerHour)[0] || null;
    const home = measure(method, at, 'nordic');

    // Can the player buy into it? The cheapest rig that runs the method AND is
    // purchasable at the level the method unlocks — the globally cheapest is
    // the wrong question, because `si-rig` runs `auger` for EUR 72,000 and does
    // not exist until level 8, seven levels after the method.
    const rigs = RIGS.filter((r) => r.methods.includes(method.id)).sort((a, b) => a.price - b.price);
    const atUnlock = rigs.filter((r) => r.unlockLevel <= method.unlockLevel);
    const cheapest = atUnlock[0] || rigs[0] || null;
    const rigGateLevels = atUnlock.length ? 0
      : (rigs[0] ? Math.max(0, rigs[0].unlockLevel - method.unlockLevel) : 0);

    rows.push({
      method: method.id, unlockLevel: method.unlockLevel, testedAt: at,
      region: best?.region ?? null,
      eurPerHour: best?.eurPerHour ?? null,
      eurPerHourNordic: home?.eurPerHour ?? null,
      marginPct: best?.marginPct ?? null,
      netPerJob: best?.netPerJob ?? null,
      hoursPerJob: best?.hoursPerJob ?? null,
      rig: cheapest?.id ?? null, rigPrice: cheapest?.price ?? null,
      rigUnlockLevel: cheapest?.unlockLevel ?? null,
      rigGateLevels,
    });
  }

  // ── inversions ───────────────────────────────────────────────────────────
  // A method is inverted when something that unlocked EARLIER pays more per
  // hour, in the best region each can reach and in the home region both.
  const inversions = [];
  for (const row of rows) {
    if (row.eurPerHour == null) continue;
    let worst = null;
    for (const other of rows) {
      if (other === row || other.eurPerHour == null) continue;
      if (other.unlockLevel >= row.unlockLevel) continue;
      if (other.eurPerHour <= row.eurPerHour) continue;
      // Survives the region normalisation too, when both have a Nordic reading.
      if (row.eurPerHourNordic != null && other.eurPerHourNordic != null
        && other.eurPerHourNordic <= row.eurPerHourNordic) continue;
      if (!worst || other.eurPerHour > worst.eurPerHour) worst = other;
    }
    if (worst) {
      inversions.push({
        method: row.method, unlockLevel: row.unlockLevel, eurPerHour: row.eurPerHour,
        beatenBy: worst.method, beatenByLevel: worst.unlockLevel, beatenByEurPerHour: worst.eurPerHour,
        levelsEarlier: row.unlockLevel - worst.unlockLevel,
        ratio: +(worst.eurPerHour / Math.max(1, row.eurPerHour)).toFixed(2),
      });
    }
  }

  /* ── can the player buy into it? ────────────────────────────────────
     "An unlock the player cannot buy into for ten levels is a worse experience
     than a later unlock." So the test is not "is the rig expensive" — it is
     "does the player have the money the day the method arrives", and the honest
     source for that is a career that was actually played. Pass `moneyAtLevel`
     from simulateCareer(); without it the test falls back to a stated
     assumption and flags every row it used one on. `crawler-lite` is never a
     buy-in problem: the player owns it from the first minute. */
  const unaffordable = [];
  const money = opts.moneyAtLevel || null;
  for (const row of rows) {
    if (!row.rigPrice || row.rig === 'crawler-lite') continue;
    let cash = null;
    if (money) {
      for (let l = row.unlockLevel; l >= 1 && cash == null; l--) {
        if (money[l] != null) cash = money[l];
      }
    }
    const assumed = cash == null;
    if (assumed) cash = 4500 + 9000 * Math.max(0, row.unlockLevel - 1);
    // A contractor keeps working capital; buying the rig with the last euro is
    // not buying into the method. Same buffer simConsiderRig() holds back.
    const buffer = 8000 + row.unlockLevel * 400;
    if (row.rigGateLevels > 0 || row.rigPrice + buffer > cash) {
      unaffordable.push({
        method: row.method, unlockLevel: row.unlockLevel,
        rig: row.rig, rigPrice: row.rigPrice, rigUnlockLevel: row.rigUnlockLevel,
        rigGateLevels: row.rigGateLevels,
        cashAtUnlock: Math.round(cash), cashIsAssumed: assumed,
        shortfall: Math.max(0, Math.round(row.rigPrice + buffer - cash)),
        reason: row.rigGateLevels > 0
          ? `rig unlocks ${row.rigGateLevels} level(s) after the method`
          : 'rig costs more than the player has when the method unlocks',
      });
    }
  }

  return { rows, inversions, unaffordable };
}
