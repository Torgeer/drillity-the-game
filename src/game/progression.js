/**
 * DRILLITY I THE GAME — progression.
 *
 * The system that turns a finished hole into money, XP, wear, reputation and
 * unlocks, and that persists all of it. It is the only module that writes to
 * `state.player`, `state.unlocked` and `state.garage`.
 *
 * Design rules it holds itself to:
 *   - Deterministic. No Date.now() in any code path that affects the game; the
 *     clock advances only from `update(dt)` and from hours actually worked, so
 *     a replay of the same events produces the same save.
 *   - Nothing is computed here that economy.js already computes. This file is
 *     bookkeeping and events; the money model lives next door.
 *   - Never lose progress. Autosave is debounced, the previous good save is
 *     kept as a backup, and a corrupt primary falls back to it.
 *
 * Progression-owned state lives under `state.player.career`, created lazily so
 * the frozen GameState shape in core/contract.js is never altered in place.
 */

import { EVENTS, clamp } from '../core/contract.js';
import {
  METHODS, RIGS, REGIONS, CERTS, ROLES, SKILLS, LEVELS, MAX_LEVEL, CORE_SLOTS,
  getMethod, getRig, getItem, getRegion, getCert, getSkill,
  levelForXP, xpProgress, xpToNext, unlockedAt, roleForLevel, nextRole, canEquip,
  defaultLoadoutFor, makeContractBoard, SKILL_BRANCHES, estimateHours,
} from './data.js';
import {
  settleRun, priceWithMarkup, resaleValue, travelCost, certCost,
  resolveSkills, emergencyContract, wearFromRun, rigServiceCost, rigWearPerHour,
  PAY_UNITS, BOLTS_PER_DRIVE_METRE, ropBasisFactor, holeMetresFor,
  materialsCoveredSlots, ECON,
} from './economy.js';

/* ═══════════════════════════════════════════════════════════════════════════
   SAVE FORMAT
   ═══════════════════════════════════════════════════════════════════════════ */
export const SAVE_KEY = 'drillity.save.v1';
export const SAVE_BACKUP_KEY = 'drillity.save.v1.bak';
export const SAVE_VERSION = 4;

/**
 * Migrations run in order from the payload's version up to SAVE_VERSION. Each
 * takes the payload and returns it upgraded. Adding a field? Add a migration —
 * never assume an old save has it.
 * @type {Record<number, (p:Object)=>Object>}
 */
export const MIGRATIONS = {
  // v0/v1 -> v2 : career branch introduced (pre-release saves had none)
  1: (p) => {
    p.player = p.player || {};
    p.player.career = p.player.career || {};
    p.player.career.reputation = p.player.career.reputation || {};
    p.player.career.certExpiry = p.player.career.certExpiry || {};
    p.player.career.daysElapsed = p.player.career.daysElapsed || 0;
    p.version = 2;
    return p;
  },
  // v2 -> v3 : loadout gained the non-core slots; garage gained `condition`
  2: (p) => {
    p.garage = p.garage || {};
    p.garage.condition = p.garage.condition || {};
    p.garage.loadout = p.garage.loadout || {};
    for (const s of CORE_SLOTS) if (!(s in p.garage.loadout)) p.garage.loadout[s] = null;
    p.player = p.player || {};
    p.player.career = p.player.career || {};
    p.player.career.firstTimes = p.player.career.firstTimes || {};
    p.player.career.ledger = p.player.career.ledger || [];
    p.version = 3;
    return p;
  },
  /* v3 -> v4 : the save gained the job in hand — `contract`, the `run`
     accumulator and `world.site`. A v3 save simply had no active contract
     recorded, and null is exactly what that means, so nothing is invented
     here: the player resumes with a clean board, which is what they got
     before. What changes is that from now on a refresh no longer eats a job
     the mobilisation has already been paid for. */
  3: (p) => {
    if (!('contract' in p)) p.contract = null;
    if (!('run' in p)) p.run = null;
    p.world = p.world || {};
    if (!('site' in p.world)) p.world.site = null;
    p.version = 4;
    return p;
  },
};

/** Fresh, empty career branch. */
function makeCareer() {
  return {
    daysElapsed: 0,
    hoursWorked: 0,
    contractsDone: 0,
    holesThisContract: 0,
    reputation: {},          // regionId -> points
    reputationTotal: 0,
    certExpiry: {},          // certId -> day index it lapses (0 = never)
    firstTimes: {},          // methodId -> true once run
    ledger: [],              // last 24 settlements, newest first
    lastRegionId: 'nordic',
    lifetimeEarned: 0,
    lifetimeSpent: 0,
  };
}

/** Safe localStorage access — absent in Node, blocked in private mode. */
function storage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    localStorage.setItem('__drillity_probe', '1');
    localStorage.removeItem('__drillity_probe');
    return localStorage;
  } catch { return null; }
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOUDNESS

   Every missing-contract path in this game was silent, and silence is how a
   rockbolt job came to emit auger particles for a whole run with nobody
   noticing: `auger` is a plausible-looking wrong answer, so nothing looks
   broken — it merely looks odd. The same class of failure has already cost
   this project a HUD meter that read 0 for four rounds and six audio voices
   that received nothing at all.

   The rule this file now holds itself to: a fallback either HOLDS THE LAST
   GOOD VALUE or SAYS SO. It never quietly substitutes a default and carries
   on. Deduplicated by message, because these fire from event handlers and a
   warning that repeats once per bolt is a warning nobody reads.
   ═══════════════════════════════════════════════════════════════════════════ */
const _warned = new Set();
/** @param {string} msg @param {...any} rest */
function warnOnce(msg, ...rest) {
  if (_warned.has(msg)) return;
  _warned.add(msg);
  if (typeof console !== 'undefined' && console.warn) console.warn(msg, ...rest);
}
/** Test seam — forget what has already been said, so a test can assert on it. */
export function _resetWarnings() { _warned.clear(); }

/* ═══════════════════════════════════════════════════════════════════════════
   FACTORY
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @param {Object} ctx  the shared context from main.js
 * @returns {Object} the progression system
 */
export function createProgression(ctx) {
  const state = ctx.state;
  const bus = ctx.bus;
  const unsubs = [];

  /** Autosave debounce, driven by update(dt) so it stays deterministic. */
  let saveTimer = 0;
  let savePending = false;
  const AUTOSAVE_DELAY = 1.2;   // seconds of quiet before a write

  /** The run currently in progress (one accepted contract). */
  let run = null;

  /* ═══════════════════════════════════════════════════════════════════════
     THE SITE, WHICH OUTLIVES THE CONTRACT

     `state.contract` answers exactly one question: *is there a job with money
     still outstanding?* It is therefore nulled the moment the last hole
     settles — `finishContract()`, and also `abandonContract()` and `reset()` —
     and `ui/screens/menu.js`, `ui/screens/career.js` and `ui/shell.js` all
     depend on that, because "Continue" and a highlighted board row are wrong
     for a job that is finished and paid.

     Five other modules were reading the same field to answer a completely
     different question: *what place is on the screen, and what work is
     happening on it?* — `world/terrain.js`, `core/env.js`, `world/geology.js`,
     `sim/vfx.js` and `audio/audio.js`. That question outlives the settlement
     by the whole of the results screen and by however long the world keeps
     rendering behind it, and on every method whose contract is a single unit
     (`HOLES_PER_JOB` gives [1,1] to raise-boring, oil-rotary, tunnel-jumbo and
     driven-pile, and [1,n] to rockbolt, longhole, hdd, core and cable-tool) it
     stops being true from the FIRST `HOLE_COMPLETE` onward — which is the
     whole run.

     Every one of those consumers then fell through to a default, silently.
     `sim/vfx.js` measured an RC run resolving its flushing medium to 'none' on
     295 of 358 frames: for most of the hole it believed it was watching an
     auger.

     So the description of the site is published HERE, in the world branch,
     where a thing the world renders belongs — and it is NOT cleared by
     settlement. It is replaced when the next contract is accepted and wiped
     only by `reset()`. Nothing that draws, lights or sounds the site should
     read `state.contract` again; read `state.world.site`.

     `regionId` supplies the biome and `archetype` supplies the setting — see
     the SITE_ARCHETYPES note in game/data.js. Both are carried here because
     terrain.js needs both and neither survives on `state.contract`.
     ═══════════════════════════════════════════════════════════════════════ */
  /** The last contract accepted, kept after settlement for the results screen. */
  let lastContract = null;
  /** Identity of the contract already published as a site — see `update()`. */
  let adoptedContract = null;
  /**
   * Contract ids already settled to completion. A second `HOLE_COMPLETE` for a
   * finished job must not pay twice — until now the only thing preventing that
   * was the null itself, which is not a guard, it is a side effect.
   */
  const settledContracts = new Set();

  /**
   * Publish the site the world is to render. Called on accept and on the
   * CONTRACT_ACCEPT bridge; never called with null.
   * @param {Object} contract
   */
  function publishSite(contract) {
    if (!contract) return null;
    if (!contract.methodId) {
      warnOnce('[progression] contract has no methodId — every consumer that '
        + 'resolves a method from the site will fall back to a default', contract.id);
    }
    if (!contract.regionId) {
      warnOnce('[progression] contract has no regionId — the region recipe '
        + 'will fall back to the world default', contract.id);
    }
    if (!contract.archetype) {
      warnOnce('[progression] contract has no archetype — world/terrain.js '
        + 'cannot tell this site apart from any other in the region', contract.id);
    }
    const site = {
      contractId: contract.id ?? null,
      title: contract.title ?? null,
      client: contract.client ?? null,
      methodId: contract.methodId ?? null,
      regionId: contract.regionId ?? null,
      applicationId: contract.applicationId ?? null,
      /** SITE_ARCHETYPES id — the SETTING. terrain.js builds the scene from it. */
      archetype: contract.archetype ?? null,
      /** 'surface' | 'underground' | 'offshore'. */
      sitePlane: contract.sitePlane ?? null,
      targetDepth: contract.targetDepth ?? null,
      holeDia: contract.holeDia ?? null,
      holes: contract.holes ?? 1,
      unitNoun: contract.unitNoun ?? 'hole',
      difficulty: contract.difficulty ?? 1,
      hardness: contract.hardness ?? null,
      abrasivity: contract.abrasivity ?? null,
      commodity: contract.commodity ?? null,
      seed: contract.seed ?? null,
      /** False from the moment the job settles. The SITE is still real; the JOB is not. */
      live: true,
    };
    if (state.world) state.world.site = site;
    return site;
  }

  /**
   * The job is over. `state.contract` goes, because that field means "money
   * outstanding" — but the site stays, marked `live: false`, so whatever is
   * still on screen keeps its identity.
   * @param {'settled'|'abandoned'|'reset'} reason
   */
  function releaseContract(reason) {
    const had = state.contract;
    if (had) lastContract = had;
    state.contract = null;
    if (state.world?.site) state.world.site.live = false;
    /* Loud, once, and only when it can actually mislead: the world keeps
       rendering the site behind the results screen, so anything re-reading
       `state.contract` from here on is reading a hole where the answer used to
       be — and every one of those consumers has a plausible-looking default. */
    const showing = state.scene;
    const siteScene = ctx.SCENES?.SITE ?? 'site';
    const resultsScene = ctx.SCENES?.RESULTS ?? 'results';
    if (had && (showing === siteScene || showing === resultsScene)) {
      warnOnce(`[progression] state.contract cleared (${reason}) while the world `
        + `is still rendering the site (scene: ${showing}) — consumers that `
        + 'describe the SITE must read state.world.site, not state.contract',
      had.id);
    }
  }

  /* ── state access helpers ────────────────────────────────────────────── */
  function career() {
    if (!state.player.career) state.player.career = makeCareer();
    return state.player.career;
  }

  function skills() { return state.player.skills || {}; }

  function markDirty() { savePending = true; saveTimer = 0; }

  function emit(evt, payload) { try { bus.emit(evt, payload); } catch { /* bus is defensive already */ } }

  /* ── money & XP ──────────────────────────────────────────────────────── */
  /**
   * @param {number} delta  EUR, may be negative
   * @param {string} reason
   */
  function addMoney(delta, reason = '') {
    const d = Math.round(Number(delta) || 0);
    if (d === 0) return state.player.money;
    state.player.money = Math.round(state.player.money + d);
    const c = career();
    if (d > 0) c.lifetimeEarned += d; else c.lifetimeSpent -= d;
    emit(EVENTS.MONEY_CHANGE, { delta: d, balance: state.player.money, reason });
    markDirty();
    return state.player.money;
  }

  function canAfford(amount) {
    return state.player.money >= Math.round(Number(amount) || 0);
  }

  /**
   * Award XP and cross any level boundaries it crosses, emitting one LEVEL_UP
   * per level with the full unlock list for that level.
   */
  function addXP(amount, reason = '') {
    const a = Math.round(Number(amount) || 0);
    if (a <= 0) return state.player.xp;
    const before = state.player.level;
    state.player.xp += a;
    emit(EVENTS.XP_GAIN, { amount: a, reason });

    const after = levelForXP(state.player.xp);
    if (after > before) {
      for (let lvl = before + 1; lvl <= after; lvl++) applyLevel(lvl);
      state.player.level = after;
    }
    markDirty();
    return state.player.xp;
  }

  /** Apply everything one level grants. */
  function applyLevel(level) {
    const gained = unlockedAt(level);
    const unlocks = [];

    state.player.skillPoints += gained.skillPoints;

    for (const id of gained.methods) if (unlock('method', id, false)) unlocks.push({ kind: 'method', id, name: getMethod(id)?.name });
    for (const id of gained.rigs) {
      // Rigs unlock as *purchasable*; ownership still costs money.
      unlocks.push({ kind: 'rig', id, name: getRig(id)?.name, purchasable: true });
    }
    for (const id of gained.regions) if (unlock('region', id, false)) unlocks.push({ kind: 'region', id, name: getRegion(id)?.name });
    for (const id of gained.certs) unlocks.push({ kind: 'cert', id, name: getCert(id)?.name, purchasable: true });

    // Role promotion.
    const role = roleForLevel(level);
    if (role && role.id !== state.player.roleId) {
      state.player.roleId = role.id;
      unlocks.push({ kind: 'role', id: role.id, name: role.title, dayRate: role.dayRate });
    }

    emit(EVENTS.LEVEL_UP, { level, unlocks, skillPoints: gained.skillPoints });
    emit(EVENTS.HAPTIC, { pattern: 'success' });
  }

  /**
   * Record an unlock. Returns true if it was new.
   * @param {'method'|'rig'|'region'|'tool'} kind
   */
  function unlock(kind, id, announce = true) {
    const bucket = { method: 'methods', rig: 'rigs', region: 'regions', tool: 'tools' }[kind];
    if (!bucket) return false;
    const list = state.unlocked[bucket] || (state.unlocked[bucket] = []);
    if (list.includes(id)) return false;
    list.push(id);
    if (announce) emit(EVENTS.UNLOCK, { kind, id });
    markDirty();
    return true;
  }

  /* ── reputation ──────────────────────────────────────────────────────── */
  function addReputation(regionId, points) {
    const c = career();
    const p = Math.round(Number(points) || 0);
    if (p === 0) return 0;
    c.reputation[regionId] = (c.reputation[regionId] || 0) + p;
    c.reputationTotal += p;
    // Reputation can open a region on its own once the level requirement is met.
    for (const region of REGIONS) {
      if (state.unlocked.regions.includes(region.id)) continue;
      if (state.player.level >= region.unlockLevel && c.reputationTotal >= region.reputationReq) {
        unlock('region', region.id);
      }
    }
    markDirty();
    return c.reputation[regionId];
  }

  function reputationFor(regionId) { return career().reputation[regionId] || 0; }
  function reputationTotal() { return career().reputationTotal || 0; }

  /* ── time & certificate expiry ───────────────────────────────────────── */
  /** Advance the in-game clock by worked hours; 11 productive hours = a day. */
  function advanceTime(hours) {
    const c = career();
    const h = Math.max(0, Number(hours) || 0);
    c.hoursWorked += h;
    const before = Math.floor(c.daysElapsed);
    c.daysElapsed += h / 11;
    if (Math.floor(c.daysElapsed) > before) checkCertExpiry();
    markDirty();
  }

  /** Drop any certificate whose validity has run out. */
  function checkCertExpiry() {
    const c = career();
    const today = c.daysElapsed;
    const kept = [];
    for (const id of state.player.certs) {
      const due = c.certExpiry[id];
      if (due && today >= due) {
        delete c.certExpiry[id];
        emit(EVENTS.UNLOCK, { kind: 'cert-expired', id, name: getCert(id)?.name });
      } else kept.push(id);
    }
    if (kept.length !== state.player.certs.length) {
      state.player.certs = kept;
      markDirty();
    }
  }

  /** Days remaining on a held certificate; Infinity when it never expires. */
  function certDaysRemaining(certId) {
    const c = career();
    if (!state.player.certs.includes(certId)) return -1;
    const due = c.certExpiry[certId];
    if (!due) return Infinity;
    return Math.max(0, Math.round(due - c.daysElapsed));
  }

  function hasCerts(list) {
    return (list || []).every((id) => state.player.certs.includes(id));
  }

  /* ── shop ────────────────────────────────────────────────────────────── */
  /** Price this player pays for an item right now. */
  function priceOf(itemId, opts = {}) {
    return priceWithMarkup(itemId, {
      regionId: state.world.regionId,
      reputation: reputationTotal(),
      skills: skills(),
      ...opts,
    });
  }

  /**
   * Buy an item. Consumables can be bought in quantity; durables are one-off.
   * @returns {{ok:boolean, reason:string, price:number}}
   */
  function purchase(itemId, quantity = 1) {
    const item = getItem(itemId);
    if (!item) return { ok: false, reason: 'No such item', price: 0 };
    if (state.player.level < item.unlockLevel) {
      return { ok: false, reason: `Requires level ${item.unlockLevel}`, price: 0 };
    }
    const qty = item.consumable ? Math.max(1, Math.floor(quantity)) : 1;
    if (!item.consumable && state.garage.owned.includes(itemId)) {
      return { ok: false, reason: 'Already owned', price: 0 };
    }
    const price = priceOf(itemId, { quantity: qty });
    if (!canAfford(price)) return { ok: false, reason: 'Not enough money', price };

    addMoney(-price, `Bought ${item.name}`);
    if (!state.garage.owned.includes(itemId)) state.garage.owned.push(itemId);
    // A fresh purchase restores condition; buying spares tops it up above 1
    // is not allowed — spares simply mean the slot starts full again.
    state.garage.condition[itemId] = 1;
    unlock('tool', itemId, false);
    emit(EVENTS.PURCHASE, { itemId, price, quantity: qty });
    emit(EVENTS.HAPTIC, { pattern: 'medium' });
    markDirty();
    return { ok: true, reason: '', price };
  }

  /** Buy a rig. It becomes owned and, if nothing is selected, active. */
  function purchaseRig(rigId) {
    const rig = getRig(rigId);
    if (!rig) return { ok: false, reason: 'No such rig', price: 0 };
    if (state.player.level < rig.unlockLevel) return { ok: false, reason: `Requires level ${rig.unlockLevel}`, price: 0 };
    if (state.unlocked.rigs.includes(rigId)) return { ok: false, reason: 'Already owned', price: 0 };
    if (!canAfford(rig.price)) return { ok: false, reason: 'Not enough money', price: rig.price };

    addMoney(-rig.price, `Bought ${rig.name}`);
    unlock('rig', rigId);
    state.garage.condition[rigId] = 1;
    emit(EVENTS.PURCHASE, { itemId: rigId, price: rig.price, quantity: 1 });
    emit(EVENTS.HAPTIC, { pattern: 'heavy' });
    return { ok: true, reason: '', price: rig.price };
  }

  /** Enrol on a certification course. Costs money and in-game hours. */
  function purchaseCert(certId) {
    const cert = getCert(certId);
    if (!cert) return { ok: false, reason: 'No such certificate', price: 0 };
    if (state.player.certs.includes(certId)) return { ok: false, reason: 'Already held', price: 0 };
    if (state.player.level < cert.minLevel) return { ok: false, reason: `Requires level ${cert.minLevel}`, price: 0 };
    if (!hasCerts(cert.prereq)) {
      const missing = cert.prereq.filter((p) => !state.player.certs.includes(p)).map((p) => getCert(p)?.name || p);
      return { ok: false, reason: `Needs ${missing.join(', ')}`, price: 0 };
    }
    const { price, hours } = certCost(certId, skills());
    if (!canAfford(price)) return { ok: false, reason: 'Not enough money', price };

    addMoney(-price, `${cert.name} course`);
    state.player.certs.push(certId);
    const c = career();
    c.certExpiry[certId] = cert.validityMonths > 0
      ? c.daysElapsed + cert.validityMonths * 30
      : 0;
    advanceTime(hours);
    addXP(cert.xpBonus, `Certified: ${cert.name}`);
    for (const rid of cert.unlocksRegions) {
      const region = getRegion(rid);
      if (region && state.player.level >= region.unlockLevel && reputationTotal() >= region.reputationReq) unlock('region', rid);
    }
    emit(EVENTS.CERT_EARNED, { certId });
    emit(EVENTS.HAPTIC, { pattern: 'success' });
    return { ok: true, reason: '', price };
  }

  /** Sell an owned item back to the yard at its current condition. */
  function sell(itemId) {
    const item = getItem(itemId);
    if (!item) return { ok: false, reason: 'No such item', price: 0 };
    const idx = state.garage.owned.indexOf(itemId);
    if (idx < 0) return { ok: false, reason: 'Not owned', price: 0 };
    for (const slot of Object.keys(state.garage.loadout)) {
      if (state.garage.loadout[slot] === itemId) state.garage.loadout[slot] = null;
    }
    const price = resaleValue(item, state.garage.condition[itemId] ?? 1, skills());
    state.garage.owned.splice(idx, 1);
    delete state.garage.condition[itemId];
    addMoney(price, `Sold ${item.name}`);
    markDirty();
    return { ok: true, reason: '', price };
  }

  /* ── garage ──────────────────────────────────────────────────────────── */
  /**
   * Fit an item to a slot. Non-core slots are created on the loadout lazily,
   * which keeps the documented GameState shape intact.
   */
  function equip(slot, itemId) {
    if (itemId === null) {
      state.garage.loadout[slot] = null;
      emit(EVENTS.EQUIP, { slot, itemId: null });
      markDirty();
      return { ok: true, reason: '' };
    }
    const check = canEquip(state, slot, itemId);
    if (!check.ok) return check;
    state.garage.loadout[slot] = itemId;
    if (state.garage.condition[itemId] === undefined) state.garage.condition[itemId] = 1;
    emit(EVENTS.EQUIP, { slot, itemId });
    emit(EVENTS.HAPTIC, { pattern: 'light' });
    markDirty();
    return { ok: true, reason: '' };
  }

  /** Switch the active rig to one that is owned. */
  function selectRig(rigId) {
    if (!state.unlocked.rigs.includes(rigId)) return { ok: false, reason: 'Not owned' };
    const rig = getRig(rigId);
    if (!rig) return { ok: false, reason: 'No such rig' };
    state.garage.rigId = rigId;
    emit(EVENTS.RIG_CHANGE, { rigId, methodId: rig.methods[0] });
    markDirty();
    return { ok: true, reason: '' };
  }

  /** Fill every slot a method uses with the best owned item for it. */
  function autoLoadout(methodId) {
    const method = getMethod(methodId);
    if (!method) return {};
    const owned = new Set(state.garage.owned);
    for (const slot of method.toolSlots) {
      const candidates = state.garage.owned
        .map(getItem)
        .filter((i) => i && i.slot === slot && (i.methods.length === 0 || i.methods.includes(methodId)))
        .sort((a, b) => (b.stats.ropMult * (b.stats.life || 1)) - (a.stats.ropMult * (a.stats.life || 1)));
      if (candidates.length) equip(slot, candidates[0].id);
    }
    // Anything the player has never bought falls back to the shop default so
    // the UI can show what they are missing.
    const suggested = defaultLoadoutFor(methodId, state.player.level);
    const missing = {};
    for (const slot of Object.keys(suggested)) {
      if (!state.garage.loadout[slot] && suggested[slot] && !owned.has(suggested[slot])) {
        missing[slot] = suggested[slot];
      }
    }
    return missing;
  }

  /* ── skills ──────────────────────────────────────────────────────────── */
  function skillRank(skillId) { return (state.player.skills || {})[skillId] || 0; }

  function skillCost(skillId) {
    const skill = getSkill(skillId);
    if (!skill) return Infinity;
    const rank = skillRank(skillId);
    return rank >= skill.maxRank ? Infinity : skill.cost[rank];
  }

  function canSpendSkillPoint(skillId) {
    const skill = getSkill(skillId);
    if (!skill) return { ok: false, reason: 'No such skill' };
    const rank = skillRank(skillId);
    if (rank >= skill.maxRank) return { ok: false, reason: 'Maxed' };
    if (state.player.level < skill.minLevel) return { ok: false, reason: `Requires level ${skill.minLevel}` };
    for (const p of skill.prereq) {
      if (skillRank(p) <= 0) return { ok: false, reason: `Needs ${getSkill(p)?.name || p}` };
    }
    const cost = skill.cost[rank];
    if (state.player.skillPoints < cost) return { ok: false, reason: `Needs ${cost} points` };
    return { ok: true, reason: '', cost };
  }

  function spendSkillPoint(skillId) {
    const check = canSpendSkillPoint(skillId);
    if (!check.ok) return check;
    if (!state.player.skills) state.player.skills = {};
    state.player.skills[skillId] = skillRank(skillId) + 1;
    state.player.skillPoints -= check.cost;
    emit(EVENTS.UNLOCK, { kind: 'skill', id: skillId, rank: state.player.skills[skillId] });
    emit(EVENTS.HAPTIC, { pattern: 'medium' });
    markDirty();
    return { ok: true, reason: '', cost: check.cost };
  }

  /** Numeric skill modifiers, for sim/drilling.js and the HUD. */
  function getEffects() { return resolveSkills(skills()); }

  /* ── UI bridge ───────────────────────────────────────────────────────────
     ui/shell.js and the screens probe progression with optional calls and fall
     back to their own placeholder catalogue when a name is missing. These thin
     adapters hand them the live data in the exact shapes they read.
     ══════════════════════════════════════════════════════════════════════ */

  /** Skill tree with live ranks and affordability. Shape: { skills: [...] }. */
  function getSkillTree() {
    return {
      points: state.player.skillPoints,
      branches: SKILL_BRANCHES.map((b) => ({ ...b })),
      skills: SKILLS.map((sk) => {
        const rank = skillRank(sk.id);
        const check = canSpendSkillPoint(sk.id);
        return {
          id: sk.id, name: sk.name, branch: sk.branch,
          rank, maxRank: sk.maxRank,
          cost: rank >= sk.maxRank ? 0 : sk.cost[rank],
          minLevel: sk.minLevel, prereq: [...sk.prereq],
          effects: sk.effects.map((e) => ({ ...e })),
          description: sk.description,
          canBuy: check.ok, reason: check.reason,
        };
      }),
    };
  }

  /** Months of validity left on a held certificate (Infinity when permanent). */
  function getCertExpiry(certId) {
    const days = certDaysRemaining(certId);
    if (days < 0) return null;
    return days === Infinity ? Infinity : days / 30;
  }

  /** Course fee this player pays, as a plain number. */
  function certPrice(certId) { return certCost(certId, skills()).price; }

  /** Shelf price this player pays, as a plain number. */
  function priceFor(itemId) {
    const item = getItem(itemId);
    if (!item) { const rig = getRig(itemId); return rig ? rig.price : null; }
    return priceOf(itemId);
  }

  /**
   * The live contract board for the region the player is standing in, plus the
   * rescue job when they are broke. Cached until `refreshContracts()`.
   */
  let boardCache = null;
  let boardRegion = null;
  let boardLevel = 0;
  function getContracts(count = 5) {
    const regionId = state.world.regionId;
    if (!boardCache || boardRegion !== regionId || boardLevel !== state.player.level) {
      boardCache = makeContractBoard(regionId, state.player.level, ctx.rand, count)
        .filter((c) => hasCerts(c.requiredCerts) || true);   // locked jobs still show, greyed
      boardRegion = regionId;
      boardLevel = state.player.level;
    }
    return isBroke() ? [rescueContract(), ...boardCache] : boardCache;
  }

  function refreshContracts() { boardCache = null; return getContracts(); }

  /** XP needed to go from `lvl` to `lvl + 1`. */
  function xpForLevel(lvl) { return xpToNext(clamp(Math.floor(lvl) || 1, 1, MAX_LEVEL)); }

  /* ── contracts ───────────────────────────────────────────────────────── */
  /**
   * Accept a contract: check certificates and rig, charge mobilisation, and
   * open a run accumulator that the per-hole settlements write into.
   */
  function acceptContract(contract) {
    if (!contract) return { ok: false, reason: 'No contract' };
    const missing = (contract.requiredCerts || []).filter((c) => !state.player.certs.includes(c));
    if (missing.length) {
      return { ok: false, reason: `Needs ${missing.map((c) => getCert(c)?.name || c).join(', ')}` };
    }
    const rig = getRig(state.garage.rigId);
    if (!rig || !rig.methods.includes(contract.methodId)) {
      const able = RIGS.filter((r) => state.unlocked.rigs.includes(r.id) && r.methods.includes(contract.methodId));
      if (!able.length) return { ok: false, reason: `No owned rig runs ${getMethod(contract.methodId)?.shortName ?? contract.methodId}` };
      selectRig(able[0].id);
    }

    const c = career();
    const from = c.lastRegionId || state.world.regionId;
    const mobilisation = travelCost(from, contract.regionId, { rigId: state.garage.rigId, skills: skills() });
    if (mobilisation > 0) {
      if (!canAfford(mobilisation)) return { ok: false, reason: `Mobilisation costs ${mobilisation}` };
      addMoney(-mobilisation, `Mobilisation to ${getRegion(contract.regionId)?.name ?? contract.regionId}`);
      advanceTime(6 + mobilisation / 900);
    }

    state.contract = contract;
    lastContract = contract;
    settledContracts.delete(contract.id);   // a re-accepted job may settle again
    state.world.regionId = contract.regionId;
    // The site the world renders. Survives settlement — see THE SITE above.
    publishSite(contract);
    c.lastRegionId = contract.regionId;
    c.holesThisContract = 0;

    run = {
      contract,
      holesDone: 0,
      hours: 0,
      revenue: 0,
      costs: 0,
      xp: 0,
      reputation: 0,
      hazards: 0,
      incidents: 0,
      grades: [],
      mobilisation,
    };

    emit(EVENTS.CONTRACT_ACCEPT, { contract });
    emit(EVENTS.REGION_CHANGE, { regionId: contract.regionId });
    markDirty();
    return { ok: true, reason: '', mobilisation };
  }

  /** Abandon the active contract. The mobilisation is already spent. */
  function abandonContract() {
    if (!run) return { ok: false, reason: 'No active contract' };
    const rep = Math.round(-8 - (run.contract.difficulty || 1) * 4);
    addReputation(run.contract.regionId, rep);
    if (run.contract.id) settledContracts.add(run.contract.id);   // closed, not payable
    run = null;
    releaseContract('abandoned');
    markDirty();
    return { ok: true, reason: '', reputation: rep };
  }

  /**
   * A single-hole view of the active contract, so per-hole settlement adds up
   * exactly to the contract value and the player is paid as they go.
   *
   * On a per-unit method this slice is still the right object to build — one
   * drive, one pile — and `economy.contractUnits()` reads the unit count off
   * it. What the slice must NOT do is decide the money by itself: `unitsFor()`
   * below hands settleRun the bolts actually installed, and the base becomes
   * rate x units instead of a lump sum divided by a distance.
   */
  function perHoleContract(contract, depth) {
    const holes = Math.max(1, contract.holes || 1);
    return {
      ...contract,
      holes: 1,
      metres: depth,
      payout: Math.round(contract.payout / holes),
      bonus: {
        time: Math.round((contract.bonus?.time || 0) / holes),
        quality: Math.round((contract.bonus?.quality || 0) / holes),
      },
      deadlineHours: Math.max(1, (contract.deadlineHours || 1) / holes),
      reputationReward: Math.max(1, Math.round((contract.reputationReward || 10) / holes)),
    };
  }

  /**
   * Units of work delivered by the hole that just finished, for a method that
   * is sold by the unit — or null for the nineteen that are sold by the metre.
   *
   * The simulation publishes both of them and always has: `rockbolt` reports
   * `boltIndex` / `boltsTotal` on `state.drill` and `quality.detail.bolts` in
   * the completion breakdown, and `driven-pile` reports whether the pile was
   * `founded`. Nothing was reading either, so a bolter who left a third of the
   * pattern out was paid the same as one who did not.
   *
   * @returns {number|null} units, or null when the method is not per-unit
   */
  function unitsFor(contract, payload) {
    const spec = PAY_UNITS[contract?.methodId];
    if (!spec) return null;
    const detail = payload?.breakdown?.quality?.detail || null;
    if (contract.methodId === 'rockbolt') {
      const bolts = detail?.bolts ?? state.drill?.boltIndex;
      // No reading at all: fall back to the design pattern for the depth
      // achieved, which is what the player would have installed doing the job.
      return Number.isFinite(bolts) ? bolts
        : Math.round(BOLTS_PER_DRIVE_METRE * Math.max(0, Number(payload?.depth) || 0));
    }
    if (contract.methodId === 'driven-pile') {
      // A pile is one unit and it is delivered or it is not — and the
      // instrument that says which is NOT the set. research/05 §1.4: a toe that
      // is brooming gives a beautiful set while the pile destroys itself, so
      // the counter-check is `founded`, the depth achieved INTO the bearing
      // stratum. A hard refusal counts too: the pile will not go further, the
      // engineer accepts it or orders a re-drive, and either way the crew
      // delivered what the ground allowed. A pile that simply stopped short of
      // both is not a pile the client asked for.
      if (detail && typeof detail.founded === 'boolean') {
        return (detail.founded || detail.hardRefused) ? 1 : 0;
      }
      return 1;
    }
    return null;
  }

  /**
   * Settle one completed hole. Called from the HOLE_COMPLETE event, and
   * directly by tests.
   *
   * @param {{depth:number, timeSec:number, grade:string, hazardsHit?:number,
   *          safetyIncidents?:number, wob?:number, rpm?:number, flush?:number}} payload
   */
  function completeHole(payload = {}) {
    /* WHOSE HOLE WAS THAT? The open run is the accounting truth and comes
       first. After it, `payload.contract` — the sim's own snapshot, taken in
       `startHole()` and therefore immune to a later clear — is a better answer
       than `state.contract`, which by this point in the dispatch may already
       have been taken away. `sim/drilling.js` publishes it on every
       HOLE_COMPLETE; the QA bridge and the no-sim demo path do not. */
    const contract = run?.contract || payload.contract || state.contract;
    if (!contract) {
      warnOnce('[progression] HOLE_COMPLETE with no contract anywhere — the hole '
        + 'is not settled: no money, no XP, no wear, no reputation', payload);
      return null;
    }
    if (contract.id && settledContracts.has(contract.id)) {
      /* The job is finished and paid. Re-drilling it (the QA harness does this,
         and so does a player who re-enters the site) must not pay again. */
      warnOnce('[progression] HOLE_COMPLETE for a contract that is already '
        + 'settled — ignored rather than paid twice', contract.id);
      return null;
    }
    if (!run) run = { contract, holesDone: 0, hours: 0, revenue: 0, costs: 0, xp: 0, reputation: 0, hazards: 0, incidents: 0, grades: [], mobilisation: 0 };

    const depth = Math.max(0.1, Number(payload.depth) || contract.targetDepth || 1);
    const grade = String(payload.grade || 'C').toUpperCase();
    const firstTime = !career().firstTimes[contract.methodId];

    const slice = perHoleContract(contract, depth);

    /* ── HOW LONG DID THAT ACTUALLY TAKE? ──────────────────────────────────
       This read `payload.timeSec / 3600` and called the answer job hours. It
       is not: `timeSec` is PLAYER seconds, and sim/drilling.js runs downhole
       physics on a compressed clock — `TUNING.sim.timeCompression` is 48
       downhole seconds per player second, times the method's own `timeMul`.
       A twelve-hour water bore is a fifteen-minute phone session by design,
       and the settlement was charging fifteen minutes of crew, fuel, upkeep
       and depreciation for it, then comparing the same fifteen minutes against
       a deadline built in real hours — so every job finished absurdly early
       and collected the full time bonus. Roughly a fiftieth of the running
       cost of the game was being billed.

       The fix does not import the sim's constants, which would put a compression
       factor in two files. It uses what the completion breakdown already
       carries: `time.parSec` and `time.actualSec`, whose RATIO is the player's
       performance against a competent run, and multiplies the settlement's own
       hour model by it. Same units on both sides, no magic number, and a player
       who takes twice as long as par pays for twice as long. */
    const par = payload?.breakdown?.time || null;
    const parRatio = par && par.parSec > 0 && par.actualSec > 0
      ? clamp(par.actualSec / par.parSec, 0.4, 3) : null;
    const hours = parRatio != null
      ? Math.max(0.25, estimateHours(contract.methodId, depth, contract.hardness ?? 0.5, 1)
        * ropBasisFactor(contract.methodId) * parRatio)
      : null;
    if (parRatio == null) {
      /* This is the ~48x under-charge coming back if it is ever the normal
         path. `hoursOverride: null` sends settleRun to its own estimate, which
         is a fair number for a hole but knows nothing about how the player
         actually ran it — no time bonus is earned or lost on merit. It is the
         right behaviour for the QA bridge and the no-sim demo, and a defect
         anywhere else, so it says which one it thinks it is. */
      warnOnce('[progression] HOLE_COMPLETE carried no breakdown.time — billing '
        + 'from the estimate, not from the run. Player performance is not being '
        + 'priced. Expected only from the QA bridge and the no-sim demo path.',
      contract.methodId);
    }

    const units = unitsFor(contract, payload);
    const result = settleRun(slice, {
      loadout: state.garage.loadout,
      rigId: state.garage.rigId,
      grade,
      skills: skills(),
      roleId: state.player.roleId,
      reputation: reputationTotal(),
      fromRegionId: null,                     // mobilisation was charged on accept
      includeSetup: run.holesDone === 0,      // rig-up is paid once per contract
      rigCondition: state.garage.condition[state.garage.rigId] ?? 1,
      wob: clamp(payload.wob ?? state.drill.wob ?? 0.55, 0, 1),
      rpm: clamp(payload.rpm ?? state.drill.rpm ?? 0.55, 0, 1),
      flush: clamp(payload.flush ?? state.drill.flush ?? 0.6, 0, 1),
      holesCompleted: 1,
      unitsCompleted: units,
      hazardsHit: payload.hazardsHit || 0,
      safetyIncidents: payload.safetyIncidents || 0,
      firstTime,
      hoursOverride: hours,
    });

    // ── apply wear to every consumable actually fitted ────────────────────
    const worn = applyWear(depth, contract, payload);

    // ── money ────────────────────────────────────────────────────────────
    addMoney(result.revenue, `${contract.title || 'Contract'} — hole ${run.holesDone + 1}`);
    if (result.costs.total > 0) addMoney(-result.costs.total, 'Running costs');

    // ── xp, reputation, time ─────────────────────────────────────────────
    addXP(result.xp, firstTime ? `First ${getMethod(contract.methodId)?.shortName} hole` : 'Hole complete');
    const rep = result.reputation;
    addReputation(contract.regionId, rep);
    advanceTime(result.hours);

    career().firstTimes[contract.methodId] = true;

    // ── the machine gets tired too ───────────────────────────────────────
    wearRig(result.hours);

    // ── stats ────────────────────────────────────────────────────────────
    const st = state.player.stats;
    st.metresDrilled = +(st.metresDrilled + depth).toFixed(1);
    st.holesDone += 1;
    st.bitsBurned += worn.consumed;
    if (grade === 'S') st.perfectRuns += 1;

    run.holesDone += 1;
    run.hours += result.hours;
    run.revenue += result.revenue;
    run.costs += result.costs.total;
    run.xp += result.xp;
    run.reputation += rep;
    run.hazards += payload.hazardsHit || 0;
    run.incidents += payload.safetyIncidents || 0;
    run.grades.push(grade);
    career().holesThisContract = run.holesDone;

    const settlement = {
      contractId: contract.id,
      hole: run.holesDone,
      of: contract.holes,
      depth,
      grade,
      revenue: result.revenue,
      costs: result.costs,
      net: result.net,
      xp: result.xp,
      reputation: rep,
      hours: result.hours,
      worn: worn.lines,
      complete: run.holesDone >= (contract.holes || 1),
    };

    pushLedger(settlement);
    if (settlement.complete) finishContract(settlement);
    markDirty();
    return settlement;
  }

  /**
   * Operating hours consume the rig's condition. Below 0.35 the upkeep penalty
   * starts to bite hard, which is the game telling you to book it in.
   */
  function wearRig(hours) {
    const id = state.garage.rigId;
    if (!getRig(id)) return 1;
    const before = state.garage.condition[id] ?? 1;
    const after = clamp(before - rigWearPerHour(id) * Math.max(0, hours || 0), 0, 1);
    state.garage.condition[id] = after;
    if (before > 0.35 && after <= 0.35) {
      emit(EVENTS.UNLOCK, { kind: 'service-due', id, name: getRig(id)?.name, condition: after });
    }
    return after;
  }

  /** Book the active rig in for a major service. Restores 0.4 of condition. */
  function serviceRig(rigId = state.garage.rigId) {
    const rig = getRig(rigId);
    if (!rig) return { ok: false, reason: 'No such rig', price: 0 };
    if (!state.unlocked.rigs.includes(rigId)) return { ok: false, reason: 'Not owned', price: 0 };
    const condition = state.garage.condition[rigId] ?? 1;
    if (condition >= 0.995) return { ok: false, reason: 'Nothing to service', price: 0 };
    const price = rigServiceCost(rigId, condition, skills());
    if (!canAfford(price)) return { ok: false, reason: 'Not enough money', price };
    addMoney(-price, `Major service — ${rig.name}`);
    state.garage.condition[rigId] = clamp(condition + 0.4, 0, 1);
    advanceTime(18);
    emit(EVENTS.HAPTIC, { pattern: 'medium' });
    markDirty();
    return { ok: true, reason: '', price, condition: state.garage.condition[rigId] };
  }

  /** Condition of a rig or item, 0..1. */
  function conditionOf(id) { return state.garage.condition[id] ?? 1; }

  /**
   * Wear every fitted consumable by the metres just drilled, replacing any
   * item that is used up out of the spares the player owns.
   */
  function applyWear(metres, contract, payload = {}) {
    const lines = [];
    let consumed = 0;
    const compressor = getItem(state.garage.loadout.compressor);
    const pump = getItem(state.garage.loadout.pump);
    const flushCapacity = clamp((compressor?.stats.flushRate || 0) + (pump?.stats.flushRate || 0) || 1, 0.4, 3);
    /* METRES OF HOLE, not metres of contract. The condition written back here
       is what the garage screen shows and what `settleRun` charges for, and the
       two must agree: 15 m of supported drive is 126 m of bolt hole and 20 m of
       tunnel is 3,111 m of blasthole. Wearing a bit by the chainage would have
       the shop reporting a fresh crown after a fortnight at the face. */
    const holeMetres = holeMetresFor(contract.methodId, metres);

    /* ── THE BAY THAT IS PAID FOR SOMEWHERE ELSE ─────────────────────────
       `settleRun` skips these slots because `economy.MATERIALS` already prices
       what is in them, in its own units, on the materials line. THIS LOOP DID
       NOT SKIP THEM, so one mechanic ran on two different tables and the money
       half was the half that got fixed.

       MEASURED, on the default loadout the game itself fits:
       `defaultLoadoutFor('tunnel-jumbo')` puts `detonator-reel-500` in the
       `service` bay, and its `life: 1` is a COUNT, not a length. A 20 m heading
       is 3,111 metres of blasthole, so `wearFromRun` returns 3,111.1 and the
       `while` below spun 3,112 times and added 3,112 to `st.bitsBurned` — a
       lifetime career statistic the player reads on the profile screen. Twenty
       headings read as sixty-two thousand bits. `rockbolt` does the same with
       `bolt-plate-150` and `bolt-nut-m24`, both `life: 1`, at 123 per drive.

       economy.js names this exact item as "a live landmine" and disarms it on
       the cost side. This is the other side of it. */
    const paidAsMaterials = materialsCoveredSlots(contract.methodId);

    for (const slot of Object.keys(state.garage.loadout)) {
      if (paidAsMaterials && paidAsMaterials.has(slot)) continue;
      const id = state.garage.loadout[slot];
      const item = getItem(id);
      if (!item || !item.consumable || !item.stats.life) continue;
      const { wear } = wearFromRun({
        item, metres: holeMetres,
        hardness: contract.hardness ?? 0.5,
        abrasivity: contract.abrasivity ?? 0.5,
        ucs: (contract.hardness ?? 0.5) * 300,
        wob: clamp(payload.wob ?? state.drill.wob ?? 0.55, 0, 1),
        rpm: clamp(payload.rpm ?? state.drill.rpm ?? 0.55, 0, 1),
        flush: clamp(payload.flush ?? state.drill.flush ?? 0.6, 0, 1),
        flushCapacity,
        skills: skills(),
      });
      const before = state.garage.condition[id] ?? 1;
      let after = before - wear;
      /* THERE IS NO STOCK, AND THE OLD COMMENT HERE SAID THERE WAS.
         Nothing counts spares, nothing decrements them and nothing refuses to
         fit a bit the player does not own — the tool simply comes back fresh
         and the RUN is billed for it, by the metre, in
         `economy.consumableCostForRun`, whose `wear` is deliberately not
         clamped to 1 for exactly this reason. So the money is right and the
         inventory does not exist.

         That is a real property of the game and worth stating rather than
         implying: a player can never be stopped by not owning a bit, only by
         the bill for having worn one out. It is one of the reasons the wallet
         has a floor and not a stake (tools/checkcareer.mjs, RUIN).

         `consumed` is therefore a COUNT OF TOOLS DESTROYED, which is what
         `st.bitsBurned` wants, and nothing else reads it. */
      while (after <= 0) { consumed += 1; after += 1; }
      after = clamp(after, 0, 1);
      state.garage.condition[id] = after;
      lines.push({ itemId: id, slot, name: item.name, from: +before.toFixed(3), to: +after.toFixed(3), wear: +wear.toFixed(3) });
      if (after <= 0.12) emit(EVENTS.BIT_WORN, { wear: 1 - after, itemId: id, slot });
    }
    return { lines, consumed };
  }

  /** Contract finished: pay reputation, clear the run, announce it. */
  function finishContract(lastSettlement) {
    const c = career();
    const contract = run.contract;
    c.contractsDone += 1;

    const gradeScore = run.grades.reduce((a, g) => a + ({ S: 5, A: 4, B: 3, C: 2, D: 1 }[g] || 2), 0) / Math.max(1, run.grades.length);
    const overall = gradeScore >= 4.6 ? 'S' : gradeScore >= 3.6 ? 'A' : gradeScore >= 2.6 ? 'B' : gradeScore >= 1.6 ? 'C' : 'D';

    const summary = {
      contractId: contract.id,
      client: contract.client,
      holes: run.holesDone,
      revenue: run.revenue,
      costs: run.costs,
      mobilisation: run.mobilisation,
      net: run.revenue - run.costs - run.mobilisation,
      xp: run.xp,
      reputation: run.reputation,
      hours: +run.hours.toFixed(2),
      grade: overall,
      lastSettlement,
    };
    emit(EVENTS.SCENE_CHANGE, { scene: ctx.SCENES?.RESULTS ?? 'results', summary });
    if (contract.id) settledContracts.add(contract.id);
    run = null;
    /* The JOB is over, so `state.contract` goes — menu.js, career.js and the
       board all read it as "money outstanding" and would be wrong otherwise.
       The SITE is not over: the world is still rendering it behind the results
       screen and will keep doing so until the player leaves. `state.world.site`
       therefore stays, marked dead. See THE SITE, WHICH OUTLIVES THE CONTRACT. */
    releaseContract('settled');
    markDirty();
    return summary;
  }

  function pushLedger(entry) {
    const c = career();
    c.ledger.unshift(entry);
    if (c.ledger.length > 24) c.ledger.length = 24;
  }

  /**
   * The rescue job. Always available, always net-positive with the starter
   * loadout, so a player can never be permanently bankrupted.
   */
  function rescueContract() {
    return emergencyContract(state.player.level, state.unlocked.regions[0] || 'nordic');
  }

  /**
   * True when the board should start offering the call-out job.
   *
   * The threshold is `ECON.brokeBelow` rather than a literal, because this
   * function and `economy.simulateCareer`'s "take the rescue" branch each
   * carried their own copy of the same 400 — the simulator that BALANCES the
   * safety net and the game that OFFERS it, free to drift apart. See the
   * constant for what the number is measured to mean, and what it does not.
   */
  function isBroke() {
    return state.player.money < ECON.brokeBelow;
  }

  /* ── travel ──────────────────────────────────────────────────────────── */
  function travelTo(regionId) {
    const region = getRegion(regionId);
    if (!region) return { ok: false, reason: 'No such region' };
    if (!state.unlocked.regions.includes(regionId)) return { ok: false, reason: 'Region locked' };
    const missing = region.requiredCerts.filter((c) => !state.player.certs.includes(c));
    if (missing.length) return { ok: false, reason: `Needs ${missing.map((c) => getCert(c)?.name || c).join(', ')}` };
    const from = career().lastRegionId || state.world.regionId;
    const cost = travelCost(from, regionId, { rigId: state.garage.rigId, skills: skills() });
    if (!canAfford(cost)) return { ok: false, reason: 'Cannot afford mobilisation', price: cost };
    if (cost > 0) addMoney(-cost, `Mobilisation to ${region.name}`);
    state.world.regionId = regionId;
    career().lastRegionId = regionId;
    advanceTime(cost > 0 ? 6 + cost / 900 : 0);
    emit(EVENTS.REGION_CHANGE, { regionId });
    markDirty();
    return { ok: true, reason: '', price: cost };
  }

  /* ── persistence ─────────────────────────────────────────────────────── */
  /** Serialise only what belongs to progression — never renderer state. */
  function serialise() {
    return {
      version: SAVE_VERSION,
      savedAtDay: +career().daysElapsed.toFixed(3),
      player: {
        name: state.player.name,
        level: state.player.level,
        xp: state.player.xp,
        money: state.player.money,
        roleId: state.player.roleId,
        certs: [...state.player.certs],
        skills: { ...state.player.skills },
        skillPoints: state.player.skillPoints,
        stats: { ...state.player.stats },
        career: JSON.parse(JSON.stringify(career())),
      },
      unlocked: {
        methods: [...state.unlocked.methods],
        regions: [...state.unlocked.regions],
        rigs: [...state.unlocked.rigs],
        tools: [...state.unlocked.tools],
      },
      garage: {
        rigId: state.garage.rigId,
        loadout: { ...state.garage.loadout },
        condition: { ...state.garage.condition },
        owned: [...state.garage.owned],
      },
      world: { regionId: state.world.regionId, site: state.world.site || null },
      /* THE JOB IN HAND.
         This was missing, and the omission was silent and expensive:
         `acceptContract()` charges mobilisation — up to three quarters of the
         tender on a driven pile — and then a page refresh dropped the contract,
         the run accumulator and every hole already settled towards it. The
         player paid to move the spread and came back to an empty board with no
         job and no explanation. `state.contract` is progression's own branch,
         so it belongs in progression's own save. */
      contract: state.contract || null,
      /* The accumulator, without its contract: that object is stored once
         above and rehydrated onto the run on load, so the two can never
         disagree about which job is being settled. */
      run: run ? {
        holesDone: run.holesDone, hours: run.hours, revenue: run.revenue,
        costs: run.costs, xp: run.xp, reputation: run.reputation,
        hazards: run.hazards, incidents: run.incidents,
        grades: [...run.grades], mobilisation: run.mobilisation,
      } : null,
      settings: { ...state.settings },
    };
  }

  /**
   * Write the save. The previous good payload is copied to a backup key first,
   * so a write that fails mid-way can never destroy a career.
   * @returns {boolean} whether it was persisted
   */
  function save() {
    savePending = false;
    const store = storage();
    if (!store) return false;
    let json;
    try { json = JSON.stringify(serialise()); } catch (e) { console.error('[progression] serialise failed', e); return false; }
    try {
      const prev = store.getItem(SAVE_KEY);
      if (prev) store.setItem(SAVE_BACKUP_KEY, prev);
      store.setItem(SAVE_KEY, json);
      return true;
    } catch (e) {
      console.warn('[progression] save failed', e && e.message);
      return false;
    }
  }

  /** Run every migration between the payload version and the current one. */
  function migrate(payload) {
    let p = payload;
    let v = Number(p.version) || 1;
    let guard = 0;
    while (v < SAVE_VERSION && guard++ < 32) {
      const step = MIGRATIONS[v];
      if (!step) { p.version = SAVE_VERSION; break; }
      p = step(p);
      const next = Number(p.version) || v + 1;
      if (next <= v) { p.version = v + 1; }
      v = Number(p.version);
    }
    return p;
  }

  function readPayload(store, key) {
    try {
      const raw = store.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch { return null; }
  }

  /**
   * Load a save. Falls back to the backup if the primary is unreadable, and
   * leaves the game in a fresh, playable state if neither works.
   * @returns {boolean} whether a save was applied
   */
  function load() {
    const store = storage();
    if (!store) return false;
    let payload = readPayload(store, SAVE_KEY);
    let usedBackup = false;
    if (!payload) { payload = readPayload(store, SAVE_BACKUP_KEY); usedBackup = !!payload; }
    if (!payload) return false;
    try {
      applyPayload(migrate(payload));
      if (usedBackup) console.warn('[progression] primary save was unreadable — restored from backup');
      return true;
    } catch (e) {
      console.error('[progression] load failed', e);
      return false;
    }
  }

  /** Apply a migrated payload onto the live state, field by field. */
  function applyPayload(p) {
    const P = p.player || {};
    state.player.name = P.name ?? state.player.name;
    state.player.xp = Number(P.xp) || 0;
    state.player.level = clamp(Number(P.level) || levelForXP(state.player.xp), 1, MAX_LEVEL);
    state.player.money = Number.isFinite(P.money) ? P.money : state.player.money;
    state.player.certs = Array.isArray(P.certs) ? P.certs.filter((c) => !!getCert(c)) : [];
    state.player.skills = P.skills && typeof P.skills === 'object' ? { ...P.skills } : {};
    state.player.skillPoints = Number(P.skillPoints) || 0;
    state.player.stats = { ...state.player.stats, ...(P.stats || {}) };
    state.player.career = { ...makeCareer(), ...(P.career || {}) };
    state.player.roleId = P.roleId && ROLES.some((r) => r.id === P.roleId)
      ? P.roleId : roleForLevel(state.player.level).id;

    const U = p.unlocked || {};
    state.unlocked.methods = (U.methods || ['auger']).filter((m) => !!getMethod(m));
    state.unlocked.regions = (U.regions || ['nordic']).filter((r) => !!getRegion(r));
    state.unlocked.rigs = (U.rigs || ['crawler-lite']).filter((r) => !!getRig(r));
    state.unlocked.tools = (U.tools || []).filter((t) => !!getItem(t));
    if (!state.unlocked.methods.length) state.unlocked.methods = ['auger'];
    if (!state.unlocked.regions.length) state.unlocked.regions = ['nordic'];
    if (!state.unlocked.rigs.length) state.unlocked.rigs = ['crawler-lite'];

    const G = p.garage || {};
    state.garage.owned = (G.owned || []).filter((i) => !!getItem(i));
    state.garage.condition = { ...(G.condition || {}) };
    state.garage.rigId = getRig(G.rigId) && state.unlocked.rigs.includes(G.rigId) ? G.rigId : state.unlocked.rigs[0];
    const loadout = { ...(G.loadout || {}) };
    for (const s of CORE_SLOTS) if (!(s in loadout)) loadout[s] = null;
    // Never resurrect an item the player no longer owns.
    for (const slot of Object.keys(loadout)) {
      if (loadout[slot] && !state.garage.owned.includes(loadout[slot])) loadout[slot] = null;
    }
    state.garage.loadout = loadout;

    state.world.regionId = getRegion(p.world?.regionId) ? p.world.regionId : 'nordic';
    if (p.settings) state.settings = { ...state.settings, ...p.settings };

    /* ── the job in hand, and the site it stands on ──────────────────────
       Restored before anything else asks for either. A save written by a
       version that did not carry them leaves both null, which is the same
       state a fresh career is in — so this cannot break an old save, it can
       only stop losing a new one. */
    const saved = p.contract && typeof p.contract === 'object' ? p.contract : null;
    state.contract = saved;
    lastContract = saved;
    adoptedContract = saved;
    settledContracts.clear();
    if (saved) {
      publishSite(saved);
      const r = p.run && typeof p.run === 'object' ? p.run : null;
      run = {
        contract: saved,
        holesDone: Number(r?.holesDone) || 0,
        hours: Number(r?.hours) || 0,
        revenue: Number(r?.revenue) || 0,
        costs: Number(r?.costs) || 0,
        xp: Number(r?.xp) || 0,
        reputation: Number(r?.reputation) || 0,
        hazards: Number(r?.hazards) || 0,
        incidents: Number(r?.incidents) || 0,
        grades: Array.isArray(r?.grades) ? [...r.grades] : [],
        /* Already spent, and it must stay on the books: `finishContract`
           subtracts it from the net, so losing it would report a profit the
           player did not make. */
        mobilisation: Number(r?.mobilisation) || 0,
      };
      if (!r) {
        warnOnce('[progression] restored an active contract with no run '
          + 'accumulator — holes already settled towards it are not recoverable, '
          + 'so the contract restarts from hole 1', saved.id);
      }
    } else {
      run = null;
      // A save with no job describes no site. Do not leave a stale one standing.
      if (p.world && 'site' in p.world) state.world.site = p.world.site || null;
      else state.world.site = null;
    }

    // Re-derive anything that can be derived, so a hand-edited save is safe.
    reconcileUnlocks();
    checkCertExpiry();
    emit(EVENTS.MONEY_CHANGE, { delta: 0, balance: state.player.money, reason: 'load' });
    emit(EVENTS.RIG_CHANGE, { rigId: state.garage.rigId, methodId: getRig(state.garage.rigId)?.methods[0] });
    emit(EVENTS.REGION_CHANGE, { regionId: state.world.regionId });
  }

  /** Make sure the unlock lists match the level the player actually holds. */
  function reconcileUnlocks() {
    for (const m of METHODS) {
      if (m.unlockLevel <= state.player.level && !state.unlocked.methods.includes(m.id)) {
        state.unlocked.methods.push(m.id);
      }
    }
    for (const r of REGIONS) {
      if (r.unlockLevel <= state.player.level && reputationTotal() >= r.reputationReq
        && !state.unlocked.regions.includes(r.id)) {
        state.unlocked.regions.push(r.id);
      }
    }
    for (const id of state.garage.owned) unlock('tool', id, false);
  }

  /** Wipe the save and return to a brand-new career. */
  function reset() {
    const store = storage();
    if (store) {
      try { store.removeItem(SAVE_KEY); store.removeItem(SAVE_BACKUP_KEY); } catch { /* ignore */ }
    }
    state.player.name = 'Rookie';
    state.player.level = 1;
    state.player.xp = 0;
    state.player.money = 4500;
    state.player.roleId = 'helper';
    state.player.certs = [];
    state.player.skills = {};
    state.player.skillPoints = 0;
    state.player.stats = { metresDrilled: 0, holesDone: 0, bitsBurned: 0, perfectRuns: 0, jamsCleared: 0 };
    state.player.career = makeCareer();
    state.unlocked.methods = ['auger'];
    state.unlocked.regions = ['nordic'];
    state.unlocked.rigs = ['crawler-lite'];
    state.unlocked.tools = [];
    state.garage.rigId = 'crawler-lite';
    state.garage.owned = ['auger-flight-std', 'rod-r32'];
    state.garage.condition = { 'auger-flight-std': 1, 'rod-r32': 1 };
    state.garage.loadout = { bit: 'auger-flight-std', rod: 'rod-r32', hammer: null, compressor: null, pump: null };
    state.world.regionId = 'nordic';
    state.world.site = null;      // a new career stands on no site at all
    state.contract = null;
    lastContract = null;
    adoptedContract = null;
    settledContracts.clear();
    run = null;
    emit(EVENTS.MONEY_CHANGE, { delta: 0, balance: state.player.money, reason: 'reset' });
    markDirty();
    return true;
  }

  /* ── HUD summary ─────────────────────────────────────────────────────── */
  function getSummary() {
    const prog = xpProgress(state.player.xp);
    const role = getRole(state.player.roleId) || roleForLevel(state.player.level);
    const upcoming = nextRole(state.player.level);
    const rig = getRig(state.garage.rigId);
    const region = getRegion(state.world.regionId);
    const c = career();

    let nextUnlockLevel = null;
    for (let l = state.player.level + 1; l <= MAX_LEVEL; l++) {
      const u = unlockedAt(l);
      if (u.methods.length || u.rigs.length || u.regions.length) { nextUnlockLevel = l; break; }
    }

    return {
      name: state.player.name,
      level: prog.level,
      xp: state.player.xp,
      xpInto: prog.into,
      xpNeed: prog.need,
      xpFrac: +prog.frac.toFixed(4),
      money: state.player.money,
      skillPoints: state.player.skillPoints,
      role: role?.id,
      roleTitle: role?.title,
      dayRate: role?.dayRate,
      nextRole: upcoming ? { id: upcoming.id, title: upcoming.title, level: upcoming.level } : null,
      rigId: state.garage.rigId,
      rigName: rig?.name,
      rigCondition: +(state.garage.condition[state.garage.rigId] ?? 1).toFixed(3),
      serviceDue: (state.garage.condition[state.garage.rigId] ?? 1) <= 0.35,
      regionId: state.world.regionId,
      regionName: region?.name,
      reputation: c.reputationTotal,
      reputationHere: c.reputation[state.world.regionId] || 0,
      daysElapsed: Math.floor(c.daysElapsed),
      hoursWorked: Math.round(c.hoursWorked),
      contractsDone: c.contractsDone,
      certs: state.player.certs.map((id) => ({
        id, name: getCert(id)?.name, daysLeft: certDaysRemaining(id),
        status: certDaysRemaining(id) === Infinity ? 'ok' : certDaysRemaining(id) <= 60 ? 'soon' : 'ok',
      })),
      methods: state.unlocked.methods.map((id) => ({ id, name: getMethod(id)?.shortName })),
      regionsUnlocked: state.unlocked.regions.length,
      rigsOwned: state.unlocked.rigs.length,
      itemsOwned: state.garage.owned.length,
      nextUnlockLevel,
      nextUnlocks: nextUnlockLevel ? unlockedAt(nextUnlockLevel) : null,
      stats: { ...state.player.stats },
      contract: state.contract ? {
        id: state.contract.id, title: state.contract.title, client: state.contract.client,
        holes: state.contract.holes, done: run?.holesDone ?? 0, payout: state.contract.payout,
      } : null,
      /* The PLACE, which outlives the job — see THE SITE. A HUD that wants to
         name where the player is standing should read this, not `contract`,
         or it goes blank the moment the last hole settles. */
      site: state.world?.site || null,
      broke: isBroke(),
    };
  }

  function getRole(id) { return ROLES.find((r) => r.id === id) || null; }

  /* ── the career ladder, from the player's own chair ──────────────────────
     GAMEDESIGN §4 orders the methods auger -> cable-tool -> top-hammer -> DTH
     -> overburden -> core -> rotary-Kelly/CFA -> anchor/micropile -> HDD ->
     sonic -> jet grouting -> raise boring, and data.js interleaves the six new
     ones into it: site-investigation at 8 (between top-hammer and DTH — the
     geotechnical entry job, and the only new method a beginner meets), rc at 21
     (after core, the other exploration method), rockbolt at 29, driven-pile at
     33, tunnel-jumbo at 36 and longhole at 39 — the underground and heavy
     foundation work, all of it after the player has a real yard.

     That ordering is sound. What it does not by itself guarantee is that the
     player can BUY INTO an unlock when it arrives, and an unlock you cannot
     act on for ten levels is a worse experience than a later unlock. This is
     the answer to "why can I not run this yet", for the UI and for tests. */
  /**
   * @returns {{id:string,name:string,unlockLevel:number,unlocked:boolean,
   *            hasRig:boolean,rigId:?string,rigName:?string,rigPrice:?number,
   *            rigUnlockLevel:?number,affordable:boolean,shortfall:number,
   *            blocked:?string}[]} one row per method, in unlock order
   */
  function getMethodLadder() {
    const level = state.player.level;
    const money = state.player.money;
    return METHODS.slice()
      .sort((a, b) => a.unlockLevel - b.unlockLevel)
      .map((m) => {
        const owned = RIGS.filter((r) => state.unlocked.rigs.includes(r.id) && r.methods.includes(m.id));
        const buyable = RIGS.filter((r) => r.methods.includes(m.id) && r.unlockLevel <= level)
          .sort((a, b) => a.price - b.price);
        const later = RIGS.filter((r) => r.methods.includes(m.id))
          .sort((a, b) => a.unlockLevel - b.unlockLevel)[0];
        const target = owned[0] || buyable[0] || later || null;
        const need = owned.length ? 0 : (buyable[0]?.price ?? Infinity);
        const unlocked = level >= m.unlockLevel;
        let blocked = null;
        if (!unlocked) blocked = `Level ${m.unlockLevel}`;
        else if (owned.length) blocked = null;
        else if (!buyable.length) blocked = later ? `${later.name} unlocks at level ${later.unlockLevel}` : 'No rig runs it';
        else if (need > money) blocked = `${buyable[0].name} costs ${buyable[0].price}`;
        return {
          id: m.id, name: m.shortName || m.name,
          unlockLevel: m.unlockLevel, unlocked,
          hasRig: owned.length > 0,
          rigId: target?.id ?? null, rigName: target?.name ?? null,
          rigPrice: target?.price ?? null, rigUnlockLevel: target?.unlockLevel ?? null,
          affordable: owned.length > 0 || need <= money,
          shortfall: owned.length ? 0 : (Number.isFinite(need) ? Math.max(0, need - money) : Infinity),
          blocked,
        };
      });
  }

  /* ── system lifecycle ────────────────────────────────────────────────── */
  async function init() {
    if (!state.player.career) state.player.career = makeCareer();
    load();
    reconcileUnlocks();

    unsubs.push(bus.on(EVENTS.HOLE_COMPLETE, (payload) => { completeHole(payload || {}); }));
    unsubs.push(bus.on(EVENTS.CONTRACT_ACCEPT, (p) => {
      // A contract accepted elsewhere (the QA bridge) still needs a run object.
      if (p?.contract && (!run || run.contract?.id !== p.contract.id)) {
        run = { contract: p.contract, holesDone: 0, hours: 0, revenue: 0, costs: 0, xp: 0, reputation: 0, hazards: 0, incidents: 0, grades: [], mobilisation: 0 };
        state.contract = p.contract;
        lastContract = p.contract;
        if (p.contract.id) settledContracts.delete(p.contract.id);
        // The bridge sets up a site too, and the world has to be told about it.
        publishSite(p.contract);
      }
    }));
    unsubs.push(bus.on(EVENTS.JAM_CLEARED, () => { state.player.stats.jamsCleared += 1; markDirty(); }));
    if (typeof window !== 'undefined') {
      const flush = () => { if (savePending) save(); };
      window.addEventListener('pagehide', flush);
      window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
      unsubs.push(() => window.removeEventListener('pagehide', flush));
    }
  }

  function update(dt) {
    /* ADOPT A CONTRACT SET BEHIND OUR BACK.
       Two other modules assign `state.contract` directly: `ui/screens/
       contracts.js` (which does at least emit CONTRACT_ACCEPT, so the handler
       above catches it) and `main.js`'s QA bridge (which emits nothing). The
       harness path is precisely where the auger fallback was first measured,
       so rather than let the world go without a site description there, notice
       the change and publish it. One identity comparison per frame. */
    const c = state.contract;
    if (!c) {
      adoptedContract = null;
    } else if (c !== adoptedContract) {
      adoptedContract = c;
      lastContract = c;
      if (!state.world?.site || state.world.site.contractId !== (c.id ?? null)
          || state.world.site.live === false) {
        publishSite(c);
      }
    }

    if (!savePending) return;
    saveTimer += dt;
    if (saveTimer >= AUTOSAVE_DELAY) { saveTimer = 0; save(); }
  }

  function dispose() {
    if (savePending) save();
    for (const u of unsubs) { try { u(); } catch { /* ignore */ } }
    unsubs.length = 0;
  }

  return {
    init, update, dispose,
    resize() { /* progression has no viewport */ },

    // money & xp
    addXP, addMoney, canAfford,

    // shop
    purchase, purchaseRig, purchaseCert, sell, priceOf,

    // garage
    equip, selectRig, autoLoadout, serviceRig, conditionOf,

    // unlocks & skills
    unlock, spendSkillPoint, canSpendSkillPoint, skillRank, skillCost, getEffects,

    // contracts
    acceptContract, abandonContract, completeHole, rescueContract, isBroke,

    // world
    travelTo, addReputation, reputationFor, reputationTotal,

    // time & certs
    advanceTime, certDaysRemaining, hasCerts,

    // persistence
    save, load, reset, serialise,

    // ui bridge — the names ui/shell.js and the screens probe for
    getSummary,
    getMethodLadder,
    getSkillTree,
    getCertExpiry,
    getContracts,
    refreshContracts,
    xpForLevel,
    certCost: certPrice,
    priceFor,
    buyCert: (id) => purchaseCert(id).ok,
    spendSkill: (id) => spendSkillPoint(id).ok,
    buyRig: (id) => purchaseRig(id).ok,

    /** Test seam: the live run accumulator (null when idle). */
    get run() { return run; },

    /* ── THE SITE ──────────────────────────────────────────────────────────
       For everything that draws, lights or sounds the world. Unlike
       `state.contract` this does NOT disappear when the job settles: it is
       replaced on the next accept and wiped only by `reset()`. Read
       `site.methodId`, `site.regionId`, `site.archetype` and `site.sitePlane`
       instead of reaching into `state.contract`, which answers a different
       question and is null for the whole of the results screen.

       `site.live` is false once the job is paid — useful if a consumer wants
       to stop an animation, never a reason to stop describing the place. */
    get site() { return state.world?.site || null; },
    /** The last contract accepted, still readable after settlement. */
    get lastContract() { return lastContract; },
    /** Publish a site for a contract this module did not accept (QA bridge). */
    adoptContract(contract) {
      if (!contract) return null;
      lastContract = contract;
      adoptedContract = contract;
      return publishSite(contract);
    },
  };
}

export default createProgression;
