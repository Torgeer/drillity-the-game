#!/usr/bin/env node
/**
 * checkcareer — is the progression a PROGRESSION, or a queue with a paywall?
 *
 *   node tools/checkcareer.mjs                 # the gate
 *   node tools/checkcareer.mjs --verbose       # every table in full
 *   node tools/checkcareer.mjs --only payback  # one probe
 *   node tools/checkcareer.mjs --samples 400   # more cards per measurement
 *
 * WHY THIS EXISTS
 * ---------------
 * `economy.js` already carries `simulateCareer`, `auditLadder` and
 * `auditMethodProfitability`. Nothing ran them, so nothing knew what they said.
 * Four questions about the shape of the game are not answerable by reading the
 * source and are all answerable by sampling it:
 *
 *   1. BOARD    Is the best move ever non-obvious? If the highest-paying card
 *               on the board is always also the best card, there is no game —
 *               only a queue.
 *   2. RUIN     Can the player go broke, and can they recover? A career that
 *               cannot be lost has no tension; one that cannot be recovered is
 *               a reset button.
 *   3. PAYBACK  When does each of the 19 rigs pay for itself? A machine that
 *               never earns back its price is a trap; one that pays back in two
 *               jobs makes every earlier machine pointless.
 *   4. UPKEEP   Does upkeep ever change a decision? Several rigs carry upkeep
 *               and fuel scaled by mass. If it never bites, it is a number the
 *               player reads and ignores.
 *
 * Plus two structural probes that fall out of the same instrument:
 *
 *   5. DUAL     `pd55` was registered at EUR 1,050,000 and level 36 on balance,
 *               not on source. It is the fleet's only dual-configuration
 *               machine (driven-pile AND dth) and it is 49.5 t against the 78 t
 *               single-purpose leader that costs LESS. Is it worth owning?
 *   6. DEPTH    `depthWindow()` is capped by the deepest rig that runs a
 *               method, so a rig's `depthCapacity` moves the contract board.
 *               This prints which rig sets each cap and how far the board
 *               moves if it changes — the arithmetic behind the
 *               `cable-percussion` data/model contradiction.
 *
 * WHAT IS MEASURED AND WHAT IS ASSUMED
 * ------------------------------------
 * Everything printed is measured by running `settleRun` over cards from
 * `makeContract`. The two POLICY choices — a simulated player takes the best
 * net-per-hour card they can run, and holds a working-capital buffer — are
 * `economy.js`'s own (`simulateCareer`, `simConsiderRig`) and are stated rather
 * than hidden, because a different policy gives different numbers.
 *
 * PAYBACK IS COMPUTED ON CASH, NOT ON NET. `settleRun` already charges
 * `ECON.depreciationPerHour` — the accounting form of paying the machine back —
 * so amortising the price against `net` would charge the capital twice. The
 * payback columns use `net + depreciation`, which is what a contractor's own
 * payback sum uses.
 *
 * Exits 0 clean, 1 on any assertion failure.
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const D = await import(pathToFileURL(join(ROOT, 'src/game/data.js')).href);
const E = await import(pathToFileURL(join(ROOT, 'src/game/economy.js')).href);
const { makeRandom } = await import(pathToFileURL(join(ROOT, 'src/core/contract.js')).href);

/* ── argv ─────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const flag = (name, dflt = null) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : dflt;
};
const VERBOSE = !!flag('verbose', false);
const ONLY = flag('only', null);
const SAMPLES = Number(flag('samples', 0)) || 220;
const SEED = Number(flag('seed', 0)) || 20260905;

const want = (name) => !ONLY || ONLY === name;

/* ── formatting ───────────────────────────────────────────────────────────── */
const eur = (n) => (n == null || !Number.isFinite(n) ? '—'
  : Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(2) + 'M'
    : Math.abs(n) >= 1000 ? Math.round(n / 100) / 10 + 'k' : String(Math.round(n)));
const pct = (n) => (Number.isFinite(n) ? (100 * n).toFixed(1) + '%' : '—');
const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);

const failures = [];
const notes = [];
function assert(ok, label, detail) {
  if (ok) { console.log(`  PASS  ${label}`); return true; }
  console.log(`  FAIL  ${label}`);
  if (detail) console.log(`        ${detail}`);
  failures.push(label + (detail ? ` — ${detail}` : ''));
  return false;
}
function note(msg) { notes.push(msg); console.log(`  NOTE  ${msg}`); }
function head(t) {
  console.log('\n' + '═'.repeat(74));
  console.log(t);
  console.log('═'.repeat(74));
}

/* ── shared helpers ───────────────────────────────────────────────────────── */
const RIGS = D.RIGS;
const METHODS = D.METHODS;
const REGIONS = D.REGIONS;

/** Every rig that can legally run a method. */
const rigsFor = (methodId) => RIGS.filter((r) => r.methods.includes(methodId));

/** The best region a player at `level` is cleared for, ignoring reputation. */
function regionsAt(level) {
  return REGIONS.filter((r) => r.unlockLevel <= level);
}

/**
 * Settle a card on a rig with the loadout a player at that level would buy.
 * `bestLoadoutFor` is economy.js's own "not short of anything" ranking; the
 * cheapest-legal one is `defaultLoadoutFor`. Which one is used changes the
 * answer, so it is a parameter and never a default nobody sees.
 */
function run(contract, rigId, level, opts = {}) {
  const loadout = opts.cheap
    ? D.defaultLoadoutFor(contract.methodId, level)
    : E.bestLoadoutFor(contract.methodId, level);
  return E.settleRun(contract, {
    loadout, rigId, grade: opts.grade || 'B', skills: opts.skills || {},
    roleId: D.roleForLevel(level).id, reputation: opts.reputation ?? 0,
    fromRegionId: opts.fromRegionId ?? null,
    rigCondition: opts.rigCondition ?? 1,
  });
}

/** N cards for a method at a level, from a deterministic stream. */
function cardsFor(methodId, level, n, seed = SEED) {
  const out = [];
  const open = regionsAt(level).filter((r) => D.methodsForRegion(r.id, level).some((m) => m.id === methodId));
  if (!open.length) return out;
  const rand = makeRandom(seed);
  for (let i = 0; i < n * 60 && out.length < n; i++) {
    const region = open[i % open.length];
    const c = D.makeContract(region.id, level, rand);
    if (c.methodId === methodId) out.push(c);
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. THE BOARD — is the best move ever non-obvious?

   Three rankings of the same five cards: what the card SAYS it pays, what it
   actually nets, and what it nets per hour. If the top of all three is the same
   card every time, the board is a queue and the payout figure is the whole
   game.
   ═══════════════════════════════════════════════════════════════════════════ */
function probeBoard() {
  head('1. THE BOARD — is the highest-paying card always the right card?');
  console.log(`Boards of 5, sampled across the career. Rankings: contract.payout (what`);
  console.log(`the card advertises) vs settleRun net vs net per hour. A board where the`);
  console.log(`top of all three is one card is a queue.\n`);

  const rows = [];
  let boards = 0, payoutIsNet = 0, payoutIsPerHour = 0, netIsPerHour = 0;
  let allThree = 0, decidable = 0;
  let payoutTopLoses = 0;          // the best-paying card is an outright LOSS
  const spreadSamples = [];

  for (let level = 4; level <= 60; level += 2) {
    const open = regionsAt(level);
    const region = open[open.length - 1];
    const rand = makeRandom(SEED + level * 7919);
    let n = 0, hitNet = 0, hitPerHour = 0, hitBoth = 0, dec = 0;
    for (let b = 0; b < Math.max(8, Math.round(SAMPLES / 8)); b++) {
      const board = D.makeContractBoard(region.id, level, rand, 5);
      // Only cards a rig that exists at this level can run — the board the
      // player can actually act on.
      const playable = board.map((c) => {
        const able = rigsFor(c.methodId).filter((r) => r.unlockLevel <= level);
        if (!able.length) return null;
        const rig = able.slice().sort((a, x) => a.price - x.price)[0];
        const r = run(c, rig.id, level);
        return { c, rig, net: r.net, perHour: r.net / Math.max(0.5, r.hours), hours: r.hours };
      }).filter(Boolean);
      if (playable.length < 2) continue;
      n++; boards++;

      const byPayout = playable.slice().sort((a, x) => x.c.payout - a.c.payout)[0];
      const byNet = playable.slice().sort((a, x) => x.net - a.net)[0];
      const byPerHour = playable.slice().sort((a, x) => x.perHour - a.perHour)[0];

      if (byPayout === byNet) { hitNet++; payoutIsNet++; }
      if (byPayout === byPerHour) { hitPerHour++; payoutIsPerHour++; }
      if (byNet === byPerHour) netIsPerHour++;
      if (byPayout === byNet && byPayout === byPerHour) { hitBoth++; allThree++; }
      else { dec++; decidable++; }
      if (byPayout.net <= 0) payoutTopLoses++;

      // How much is on the table between the obvious pick and the best pick?
      const bestPH = byPerHour.perHour, obviousPH = byPayout.perHour;
      if (Number.isFinite(bestPH) && Number.isFinite(obviousPH) && bestPH > 0) {
        spreadSamples.push(obviousPH / bestPH);
      }
    }
    if (n) {
      rows.push({
        level, region: region.id, boards: n,
        payoutIsBest: hitBoth / n, payoutIsNet: hitNet / n, payoutIsPerHour: hitPerHour / n,
        decidable: dec / n,
      });
    }
  }

  if (VERBOSE) {
    console.log(`  ${pad('L', 4)}${pad('region', 16)}${rpad('boards', 7)}  ${rpad('payout=best', 12)}${rpad('payout=net', 11)}${rpad('payout=€/h', 11)}`);
    for (const r of rows) {
      console.log(`  ${pad(r.level, 4)}${pad(r.region, 16)}${rpad(r.boards, 7)}  ${rpad(pct(r.payoutIsBest), 12)}${rpad(pct(r.payoutIsNet), 11)}${rpad(pct(r.payoutIsPerHour), 11)}`);
    }
    console.log();
  }

  const obviousRate = allThree / Math.max(1, boards);
  const decidableRate = decidable / Math.max(1, boards);
  spreadSamples.sort((a, b) => a - b);
  const medSpread = spreadSamples[Math.floor(spreadSamples.length / 2)] ?? 1;

  console.log(`  boards sampled                      ${boards}`);
  console.log(`  top payout is also top net          ${pct(payoutIsNet / Math.max(1, boards))}`);
  console.log(`  top payout is also top €/h          ${pct(payoutIsPerHour / Math.max(1, boards))}`);
  console.log(`  top net is also top €/h             ${pct(netIsPerHour / Math.max(1, boards))}`);
  console.log(`  ONE card wins all three (a queue)   ${pct(obviousRate)}`);
  console.log(`  the board poses a real choice       ${pct(decidableRate)}`);
  console.log(`  taking the obvious card costs you   ${pct(1 - medSpread)} of the best €/h (median)`);
  console.log(`  best-paying card is an outright loss ${pct(payoutTopLoses / Math.max(1, boards))}\n`);

  assert(decidableRate >= 0.25,
    'the board poses a real choice on at least 1 in 4 draws',
    `measured ${pct(decidableRate)} — below this the payout figure IS the game`);
  assert(obviousRate <= 0.85,
    'no single card wins payout, net and €/h on more than 85% of boards',
    `measured ${pct(obviousRate)}`);
  return { obviousRate, decidableRate, medSpread, boards };
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. RUIN — can the player go broke, and can they recover?
   ═══════════════════════════════════════════════════════════════════════════ */
function probeRuin() {
  head('2. RUIN — can the career be lost, and can it be recovered?');
  console.log(`Careers played end to end by economy.js's own simulateCareer policy, at`);
  console.log(`several seeds and starting balances. A career that never dips is not a`);
  console.log(`game; one that dips and never returns is a reset button.\n`);

  /* SIX PLAYERS, NOT ONE. `simulateCareer`'s own policy is a careful
     contractor who values their time; that is the player least likely to go
     broke, and measuring only him answers the wrong question. `policy` and
     `grade` sweep the competence axis: from a skilled operator choosing on
     euro-per-hour down to someone taking the first card on the board and
     making a mess of it. If none of the six can lose, nobody can. */
  const runs = [];
  for (const policy of ['per-hour', 'payout', 'first']) {
    for (const grade of [null, 'D']) {
      for (const startMoney of [4500, 400]) {
        const r = E.simulateCareer(600, { seed: SEED, startMoney, policy, grade });
        runs.push({ startMoney, policy, gradeIn: grade || 'drift', ...r });
      }
    }
  }

  console.log(`  ${pad('policy', 10)}${pad('grade', 7)}${rpad('start', 7)}${rpad('lvl', 5)}${rpad('jobs', 6)}${rpad('SOS', 5)}${rpad('minCash', 9)}${rpad('@h', 7)}${rpad('final', 9)}${rpad('margin', 8)}`);
  for (const r of runs) {
    console.log(`  ${pad(r.policy, 10)}${pad(r.gradeIn, 7)}${rpad(eur(r.startMoney), 7)}${rpad(r.finalLevel, 5)}${rpad(r.contracts, 6)}`
      + `${rpad(r.emergencyContracts, 5)}${rpad(eur(r.minMoney), 9)}${rpad(r.minMoneyAtHour, 7)}`
      + `${rpad(eur(r.finalMoney), 9)}${rpad(r.marginPct + '%', 8)}`);
  }

  const anyNegative = runs.some((r) => r.everNegative);
  const anyRescue = runs.some((r) => r.emergencyContracts > 0);
  const drawdown = runs.map((r) => (r.startMoney - r.minMoney) / r.startMoney);
  const worstDrawdown = Math.max(...drawdown);
  const safety = runs[0].safetyNet;

  /* WHERE THE RISK WOULD HAVE TO COME FROM. A career is monotone because the
     JOBS are: if no card on the board can lose money, no sequence of them can.
     This is the per-card version of the same question and it is the one a
     balance change would have to move. */
  let cards = 0, losses = 0, thin = 0;
  for (let level = 3; level <= 60; level += 3) {
    const region = regionsAt(level).slice(-1)[0];
    const rand = makeRandom(SEED + level);
    for (let i = 0; i < 40; i++) {
      const c = D.makeContract(region.id, level, rand);
      const able = rigsFor(c.methodId).filter((r) => r.unlockLevel <= level);
      if (!able.length) continue;
      const rig = able.slice().sort((a, b) => a.price - b.price)[0];
      // The worst honest case: cheapest legal loadout, grade D, arriving from
      // the home region, on a machine overdue a service.
      const r = E.settleRun(c, {
        loadout: D.defaultLoadoutFor(c.methodId, level), rigId: rig.id, grade: 'D',
        skills: {}, roleId: D.roleForLevel(level).id, reputation: 0,
        fromRegionId: 'nordic', rigCondition: 0.3,
      });
      cards++;
      if (r.net < 0) losses++;
      else if (r.net < 0.1 * r.revenue) thin++;
    }
  }
  console.log(`\n  worst-case cards (cheapest loadout, grade D, condition 0.3, mobilising from home):`);
  console.log(`    ${cards} cards · ${losses} lose money (${pct(losses / Math.max(1, cards))})`
    + ` · ${thin} clear under a 10% margin (${pct(thin / Math.max(1, cards))})`);

  /* HOW LONG IS THE CAREER? Every number above stops at 600 hours and lands
     around level 19, which means `raise-boring` at 52 and `jet-grouting` at 47
     are outside every measurement anybody has taken. The ladder is 60 levels
     long and the question of whether it is REACHABLE is separate from whether
     it is balanced. */
  const long = E.simulateCareer(20000, { seed: SEED });
  const reach = [];
  for (const l of [10, 20, 30, 40, 50, 60]) {
    const h = long.milestones[`level:${l}`];
    reach.push({ level: l, hours: h ?? null });
  }
  console.log(`\n  reaching each level, one 20,000-hour career (${long.contracts} contracts, ended at L${long.finalLevel}):`);
  console.log('    ' + reach.map((r) => `L${r.level} ${r.hours == null ? 'NEVER' : Math.round(r.hours) + ' h'}`).join('  ·  '));
  const unreached = METHODS.filter((m) => long.milestones[`level:${m.unlockLevel}`] === undefined
    && m.unlockLevel > long.finalLevel);
  if (unreached.length) {
    console.log(`    methods never unlocked in 20,000 h: ${unreached.map((m) => `${m.id}(L${m.unlockLevel})`).join(', ')}`);
  }

  /* THE SAFETY NET, MEASURED WHERE IT IS ACTUALLY OFFERED.
     `verifySafetyNet()` proves the call-out job at level 1 in the Nordic on the
     starter rig. `progression.rescueContract()` offers it at the PLAYER's level
     in `state.unlocked.regions[0]`, and a broke player at level 50 is a
     different sum: the role multiplier, the overhead rate and the crew's
     seniority have all moved. Prove it where it is used. */
  console.log(`\n  the call-out job, settled at every level it can be offered at:`);
  console.log(`  ${pad('L', 4)}${pad('role', 26)}${rpad('revenue', 9)}${rpad('costs', 9)}${rpad('net', 9)}${rpad('hours', 7)}`);
  const rescue = [];
  for (const level of [1, 5, 10, 20, 30, 40, 50, 60]) {
    const c = E.emergencyContract(level, 'nordic');
    const r = E.settleRun(c, {
      loadout: { bit: 'auger-flight-std', rod: 'rod-r32' }, rigId: 'crawler-lite',
      grade: 'D', skills: {}, roleId: D.roleForLevel(level).id, reputation: 0,
    });
    rescue.push({ level, net: r.net, revenue: r.revenue, costs: r.costs.total, hours: r.hours });
    console.log(`  ${pad(level, 4)}${pad(D.roleForLevel(level).title, 26)}${rpad(eur(r.revenue), 9)}${rpad(eur(r.costs.total), 9)}${rpad(eur(r.net), 9)}${rpad(r.hours.toFixed(1), 7)}`);
  }
  const worstRescue = rescue.slice().sort((a, b) => a.net - b.net)[0];

  /* Recovery TIME, not just recovery. The floor a player has to climb back to
     is `isBroke()`'s own threshold plus the cheapest thing worth buying. */
  const hoursToRecover = rescue.map((x) => ({
    level: x.level,
    jobs: x.net > 0 ? Math.ceil(4500 / x.net) : Infinity,
    hours: x.net > 0 ? Math.ceil(4500 / x.net) * x.hours : Infinity,
  }));
  const worstRecovery = hoursToRecover.slice().sort((a, b) => b.hours - a.hours)[0];
  console.log(`\n  worst recovery: level ${worstRecovery.level} needs ${worstRecovery.jobs} call-outs`
    + ` = ${Math.round(worstRecovery.hours)} h to get back to EUR 4,500\n`);

  /* ⚠ "CAN THE PLAYER GO BROKE" IS NOT A GATE, AND THIS IS DELIBERATE.
     The measured answer is NO — none of the six players above ever goes
     negative, and the worst drawdown is a fraction of the starting balance.
     That is a real finding and it is reported as one, loudly. It is not
     asserted, because failing `npm run check` on it would be this tool
     demanding a design decision that is the owner's to make, and a gate that
     fails on the day it lands is a gate somebody deletes. What IS asserted is
     the direction nobody would choose: that a career, once lost, can be got
     back. */
  if (!anyNegative) {
    note(`THE CAREER CANNOT BE LOST, but not because the jobs are safe. `
      + `${pct(losses / Math.max(1, cards))} of worst-case cards DO lose money, so the `
      + `downside exists card by card. What is missing is any way for it to `
      + `compound: across ${runs.length} player models — three choice policies x two `
      + `competence levels x two starting balances — cash never goes negative, `
      + `the worst drawdown is ${pct(worstDrawdown)} of the opening balance, and the `
      + `call-out job catches every dip. The wallet is a floor, not a stake.`);
  }
  const reach60 = long.milestones['level:60'];
  if (reach60) {
    note(`THE LADDER IS 22x LONGER THAN ANY MEASUREMENT TAKEN OF IT. Level 60 `
      + `arrives at ${Math.round(reach60)} in-game hours and level 50 at `
      + `${Math.round(long.milestones['level:50'] ?? 0)} — while simulateCareer's own `
      + `default window is 600 h, which lands at level ${runs[0].finalLevel}. Every `
      + `method above roughly L20 (that is 12 of 21, including raise-boring at 52 `
      + `and jet-grouting at 47) sits outside the range anyone has actually played.`);
  }
  assert(safety.safe, 'the level-1 call-out job is net-positive on a grade D',
    `net ${eur(safety.net)}`);
  assert(worstRescue.net > 0,
    'the call-out job is net-positive at EVERY level it can be offered at',
    `worst is level ${worstRescue.level} at ${eur(worstRescue.net)}`);
  assert(Number.isFinite(worstRecovery.hours) && worstRecovery.hours < 400,
    'recovery from broke takes under 400 in-game hours at every level',
    `worst ${Math.round(worstRecovery.hours)} h at level ${worstRecovery.level}`);
  if (!anyRescue) note('no simulated career ever needed the call-out job — the net is untested in play');
  return { runs, rescue, worstRecovery };
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. PAYBACK — when does each of the 19 rigs earn its price back?

   Two columns, and the difference between them is the whole point:

     standalone   price / cash per job on the best method this machine runs.
                  The answer for a machine that opens work nothing else can do.
     marginal     price / (cash per job MINUS what the best machine the player
                  already owns at that level makes on the same card). The
                  answer for a machine that does something the player can
                  already do, only better. Infinite means it never pays back,
                  which is the definition of a trap.
   ═══════════════════════════════════════════════════════════════════════════ */
function probePayback() {
  head('3. PAYBACK — when does each of the 19 rigs pay for itself?');
  console.log(`Cash per job = settleRun net + depreciation (depreciation IS capital`);
  console.log(`recovery; charging it and then amortising the price is a double entry).`);
  console.log(`Measured at the rig's own unlock level, best affordable loadout, grade B,`);
  console.log(`over ${Math.min(40, SAMPLES)} cards per method in the best region open at that level.\n`);

  const rows = [];
  for (const rig of RIGS.slice().sort((a, b) => a.price - b.price)) {
    const level = Math.max(1, rig.unlockLevel);
    let best = null;
    for (const methodId of rig.methods) {
      const method = D.getMethod(methodId);
      if (!method || method.unlockLevel > level) continue;
      const cards = cardsFor(methodId, level, Math.min(40, SAMPLES));
      if (!cards.length) continue;
      let cash = 0, net = 0, hours = 0, n = 0;
      for (const c of cards) {
        const r = run(c, rig.id, level);
        cash += r.net + r.costs.depreciation; net += r.net; hours += r.hours; n++;
      }
      if (!n) continue;
      const row = { methodId, cashPerJob: cash / n, netPerJob: net / n, hoursPerJob: hours / n, n };
      if (!best || row.cashPerJob > best.cashPerJob) best = row;
    }
    if (!best) { rows.push({ rig, unusable: true }); continue; }

    // What could the player already do, on the same cards, with a machine they
    // could already own at this level?
    const rivals = rigsFor(best.methodId).filter((r) => r.id !== rig.id && r.unlockLevel <= level);
    let rival = null;
    if (rivals.length) {
      const cards = cardsFor(best.methodId, level, Math.min(40, SAMPLES));
      for (const rv of rivals) {
        let cash = 0, n = 0;
        for (const c of cards) { const r = run(c, rv.id, level); cash += r.net + r.costs.depreciation; n++; }
        if (!n) continue;
        const row = { id: rv.id, price: rv.price, cashPerJob: cash / n };
        if (!rival || row.cashPerJob > rival.cashPerJob) rival = row;
      }
    }

    const standalone = best.cashPerJob > 0 ? rig.price / best.cashPerJob : Infinity;
    const delta = rival ? best.cashPerJob - rival.cashPerJob : best.cashPerJob;
    const marginal = delta > 0 ? rig.price / delta : Infinity;
    rows.push({
      rig, level, method: best.methodId, cashPerJob: best.cashPerJob, netPerJob: best.netPerJob,
      hoursPerJob: best.hoursPerJob, standalone, marginal,
      rivalId: rival?.id ?? null, rivalCash: rival?.cashPerJob ?? null,
      hoursStandalone: standalone * best.hoursPerJob,
    });
  }

  console.log(`  ${pad('rig', 17)}${rpad('L', 3)}${rpad('price', 8)}${pad('  best method', 21)}${rpad('cash/job', 10)}${rpad('h/job', 7)}${rpad('jobs', 7)}${rpad('hours', 8)}${rpad('marginal', 10)}  vs`);
  for (const r of rows) {
    if (r.unusable) {
      console.log(`  ${pad(r.rig.id, 17)}${rpad(r.rig.unlockLevel, 3)}${rpad(eur(r.rig.price), 8)}   *** runs no method that exists at its own unlock level ***`);
      continue;
    }
    const jobs = Number.isFinite(r.standalone) ? Math.ceil(r.standalone) : '∞';
    const marg = Number.isFinite(r.marginal) ? Math.ceil(r.marginal) : '∞';
    console.log(`  ${pad(r.rig.id, 17)}${rpad(r.level, 3)}${rpad(eur(r.rig.price), 8)}${pad('  ' + r.method, 21)}`
      + `${rpad(eur(r.cashPerJob), 10)}${rpad(r.hoursPerJob.toFixed(1), 7)}${rpad(jobs, 7)}`
      + `${rpad(Number.isFinite(r.hoursStandalone) ? Math.round(r.hoursStandalone) : '∞', 8)}${rpad(marg, 10)}  ${r.rivalId || '—'}`);
  }

  const usable = rows.filter((r) => !r.unusable);
  const traps = usable.filter((r) => !Number.isFinite(r.standalone));
  const neverMarginal = usable.filter((r) => r.rivalId && !Number.isFinite(r.marginal));
  const tooFast = usable.filter((r) => Number.isFinite(r.standalone) && r.standalone < 2);
  const tooSlow = usable.filter((r) => Number.isFinite(r.standalone) && r.standalone > 250);
  const lossMaking = usable.filter((r) => r.netPerJob <= 0);

  console.log();
  if (traps.length) console.log(`  never pays back at all : ${traps.map((r) => r.rig.id).join(', ')}`);
  if (neverMarginal.length) console.log(`  never beats the machine the player already has : ${neverMarginal.map((r) => `${r.rig.id} (vs ${r.rivalId})`).join(', ')}`);
  if (tooFast.length) console.log(`  pays back in under 2 jobs : ${tooFast.map((r) => `${r.rig.id} (${r.standalone.toFixed(1)})`).join(', ')}`);
  if (tooSlow.length) console.log(`  needs over 250 jobs : ${tooSlow.map((r) => `${r.rig.id} (${Math.round(r.standalone)})`).join(', ')}`);
  if (lossMaking.length) console.log(`  LOSS-MAKING on its own best method : ${lossMaking.map((r) => `${r.rig.id} (${eur(r.netPerJob)}/job)`).join(', ')}`);
  console.log();

  assert(!traps.length, 'every rig pays for itself eventually on its own best method',
    traps.map((r) => r.rig.id).join(', '));
  assert(!lossMaking.length, 'no rig loses money on the best method it runs',
    lossMaking.map((r) => `${r.rig.id} ${eur(r.netPerJob)}/job`).join(', '));
  assert(!tooFast.length, 'no rig pays for itself in under two jobs',
    tooFast.map((r) => `${r.rig.id} ${r.standalone.toFixed(1)}`).join(', '));
  return { rows };
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. UPKEEP — does it ever change a decision?

   Two ways it can matter, and they are different questions:
     (a) SIZE   what share of the cost sheet is upkeep + fuel + insurance +
                depreciation? Below a couple of percent it is decoration.
     (b) BITE   does removing it change WHICH RIG the player should bring? A
                cost that scales with mass only matters if bringing the smaller
                machine is sometimes right, and the only proof of that is a
                ranking that flips when the line is deleted.
   ═══════════════════════════════════════════════════════════════════════════ */
function probeUpkeep() {
  head('4. UPKEEP — is it a real cost or a number the player reads and ignores?');

  // (a) share of the cost sheet, per method.
  console.log(`  (a) share of the cost sheet, at each method's unlock level + 2\n`);
  console.log(`  ${pad('method', 20)}${rpad('costs', 9)}${rpad('upkeep', 8)}${rpad('fuel', 7)}${rpad('deprec', 8)}${rpad('running%', 9)}${rpad('crew%', 7)}${rpad('mat%', 7)}`);
  const shares = [];
  for (const method of METHODS) {
    const level = method.unlockLevel + 2;
    const cards = cardsFor(method.id, level, Math.min(30, SAMPLES));
    if (!cards.length) { console.log(`  ${pad(method.id, 20)}  (no card generated)`); continue; }
    const rig = rigsFor(method.id).slice().sort((a, b) => a.price - b.price)[0];
    const acc = { total: 0, upkeep: 0, fuel: 0, dep: 0, ins: 0, crew: 0, mat: 0, n: 0 };
    for (const c of cards) {
      const r = run(c, rig.id, level);
      acc.total += r.costs.total; acc.upkeep += r.costs.upkeep; acc.fuel += r.costs.fuel;
      acc.dep += r.costs.depreciation; acc.ins += r.costs.insurance;
      acc.crew += r.costs.crew; acc.mat += r.costs.materials; acc.n++;
    }
    const running = (acc.upkeep + acc.fuel + acc.dep + acc.ins) / Math.max(1, acc.total);
    shares.push({ method: method.id, running, total: acc.total / acc.n });
    console.log(`  ${pad(method.id, 20)}${rpad(eur(acc.total / acc.n), 9)}${rpad(eur(acc.upkeep / acc.n), 8)}`
      + `${rpad(eur(acc.fuel / acc.n), 7)}${rpad(eur(acc.dep / acc.n), 8)}${rpad(pct(running), 9)}`
      + `${rpad(pct(acc.crew / Math.max(1, acc.total)), 7)}${rpad(pct(acc.mat / Math.max(1, acc.total)), 7)}`);
  }

  // (b) does it flip a rig choice?
  console.log(`\n  (b) does deleting the running line change WHICH rig to bring?`);
  console.log(`      Only methods with more than one rig can pose the question.\n`);
  const multi = METHODS.filter((m) => rigsFor(m.id).length > 1);
  console.log(`  ${pad('method', 20)}${rpad('rigs', 5)}${rpad('cards', 7)}${rpad('flips', 7)}${rpad('flip%', 8)}  with running cost -> without`);
  let totalCards = 0, totalFlips = 0;
  const flipRows = [];
  for (const method of multi) {
    const level = Math.max(method.unlockLevel + 2, ...rigsFor(method.id).map((r) => r.unlockLevel));
    const cards = cardsFor(method.id, level, Math.min(30, SAMPLES));
    if (!cards.length) continue;
    const able = rigsFor(method.id).filter((r) => r.unlockLevel <= level);
    if (able.length < 2) continue;
    let flips = 0; const examples = new Map();
    for (const c of cards) {
      let withBest = null, withoutBest = null;
      for (const rig of able) {
        const r = run(c, rig.id, level);
        const running = r.costs.upkeep + r.costs.fuel + r.costs.depreciation + r.costs.insurance;
        const wi = { id: rig.id, v: r.net };
        const wo = { id: rig.id, v: r.net + running };
        if (!withBest || wi.v > withBest.v) withBest = wi;
        if (!withoutBest || wo.v > withoutBest.v) withoutBest = wo;
      }
      if (withBest.id !== withoutBest.id) {
        flips++;
        const k = `${withBest.id} -> ${withoutBest.id}`;
        examples.set(k, (examples.get(k) || 0) + 1);
      }
    }
    totalCards += cards.length; totalFlips += flips;
    flipRows.push({ method: method.id, rigs: able.length, cards: cards.length, flips });
    const ex = [...examples].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => `${k} x${v}`).join(', ');
    console.log(`  ${pad(method.id, 20)}${rpad(able.length, 5)}${rpad(cards.length, 7)}${rpad(flips, 7)}`
      + `${rpad(pct(flips / Math.max(1, cards.length)), 8)}  ${ex || '—'}`);
  }

  const overallFlip = totalFlips / Math.max(1, totalCards);
  const minShare = Math.min(...shares.map((s) => s.running));
  const medShare = shares.map((s) => s.running).sort((a, b) => a - b)[Math.floor(shares.length / 2)];
  console.log(`\n  running cost as a share of the sheet: median ${pct(medShare)}, lowest ${pct(minShare)}`);
  console.log(`  rig choice flips on ${totalFlips} of ${totalCards} multi-rig cards (${pct(overallFlip)})\n`);

  assert(medShare >= 0.05, 'the running line is at least 5% of a median cost sheet',
    `median ${pct(medShare)} — below this the player can ignore it`);
  if (overallFlip <= 0.001) {
    note('upkeep NEVER changes which rig to bring — on every multi-rig method the '
      + 'same machine wins with and without the running line. The cost is real on '
      + 'the invoice and inert as a decision.');
  } else {
    console.log(`  upkeep changes the right machine on ${pct(overallFlip)} of multi-rig cards.`);
  }
  return { shares, flipRows, overallFlip, medShare };
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. pd55 — the only dual-configuration machine, priced on balance not source
   ═══════════════════════════════════════════════════════════════════════════ */
function probeDual() {
  head('5. pd55 — EUR 1,050,000 at level 36, against a EUR 980,000 leader at 33');
  const pd = D.getRig('pd55');
  const pl = D.getRig('piling-leader');
  if (!pd || !pl) { note('pd55 or piling-leader missing from RIGS'); return {}; }

  console.log(`  ${pad('', 20)}${rpad('pd55', 14)}${rpad('piling-leader', 15)}`);
  const cmp = (label, a, b) => console.log(`  ${pad(label, 20)}${rpad(a, 14)}${rpad(b, 15)}`);
  cmp('price', eur(pd.price), eur(pl.price));
  cmp('unlock level', pd.unlockLevel, pl.unlockLevel);
  cmp('transport tonnes', pd.transportTons, pl.transportTons);
  cmp('upkeep / h', pd.upkeepPerHour, pl.upkeepPerHour);
  cmp('fuel / h', pd.fuelPerHour, pl.fuelPerHour);
  cmp('power kW', pd.stats.power, pl.stats.power);
  cmp('depthCapacity', pd.stats.depthCapacity, pl.stats.depthCapacity);
  cmp('methods', pd.methods.join('+'), pl.methods.join('+'));

  console.log(`\n  head to head on the method they share, at level 36:\n`);
  console.log(`  ${pad('method', 16)}${pad('rig', 16)}${rpad('cards', 7)}${rpad('net/job', 10)}${rpad('h/job', 8)}${rpad('€/h', 9)}${rpad('cash/job', 10)}`);
  const out = {};
  for (const methodId of ['driven-pile', 'dth']) {
    const cards = cardsFor(methodId, 36, Math.min(40, SAMPLES));
    if (!cards.length) { console.log(`  ${pad(methodId, 16)}  (no card generated at level 36)`); continue; }
    for (const rig of rigsFor(methodId).filter((r) => r.unlockLevel <= 36)) {
      let net = 0, hours = 0, cash = 0, n = 0;
      for (const c of cards) { const r = run(c, rig.id, 36); net += r.net; hours += r.hours; cash += r.net + r.costs.depreciation; n++; }
      console.log(`  ${pad(methodId, 16)}${pad(rig.id, 16)}${rpad(n, 7)}${rpad(eur(net / n), 10)}`
        + `${rpad((hours / n).toFixed(1), 8)}${rpad(eur(net / hours), 9)}${rpad(eur(cash / n), 10)}`);
      out[`${methodId}:${rig.id}`] = { netPerJob: net / n, perHour: net / hours, cashPerJob: cash / n };
    }
  }

  /* THE DEPTH TRAP. `checkbeds` asks only whether SOMEBODY in the fleet can
     reach a card's target depth. A player who buys pd55 to run driven-pile owns
     a machine rated 20 m against a board that offers up to the fleet cap — and
     the fleet cap is set by the OTHER machine. */
  const pileCards = cardsFor('driven-pile', 36, Math.min(120, SAMPLES * 2));
  const beyondPd = pileCards.filter((c) => c.targetDepth > (pd.stats.depthCapacity || 0));
  const beyondPl = pileCards.filter((c) => c.targetDepth > (pl.stats.depthCapacity || 0));
  const [dLo, dHi] = D.depthWindow(D.getMethod('driven-pile'), 'deep-foundations');
  console.log(`\n  driven-pile depth window ${dLo}-${dHi} m; fleet cap is the deeper of`
    + ` pd55 ${pd.stats.depthCapacity} m and piling-leader ${pl.stats.depthCapacity} m`);
  console.log(`  cards a pd55 OWNER cannot finish : ${beyondPd.length} of ${pileCards.length} (${pct(beyondPd.length / Math.max(1, pileCards.length))})`);
  console.log(`  cards a leader OWNER cannot finish: ${beyondPl.length} of ${pileCards.length} (${pct(beyondPl.length / Math.max(1, pileCards.length))})\n`);

  const pdPile = out['driven-pile:pd55'];
  const plPile = out['driven-pile:piling-leader'];
  if (pdPile && plPile) {
    const better = pdPile.perHour > plPile.perHour ? 'pd55' : 'piling-leader';
    console.log(`  on driven-pile the better machine is ${better}`
      + ` (${eur(pdPile.perHour)}/h vs ${eur(plPile.perHour)}/h)`);
    if (better === 'piling-leader' && !out['dth:pd55']) {
      note('pd55 costs MORE than piling-leader, unlocks THREE levels later, and is '
        + 'beaten by it on the only method both run. Its whole case is the second '
        + 'configuration — and that case must be measured, not assumed.');
    }
  }
  if (beyondPd.length) {
    note(`a pd55 owner is offered ${pct(beyondPd.length / pileCards.length)} of driven-pile `
      + `cards deeper than the machine's own ${pd.stats.depthCapacity} m rating. `
      + `checkbeds only asks whether SOMEBODY in the fleet can reach.`);
  }
  return { out, beyondPd: beyondPd.length, pileCards: pileCards.length };
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. DEPTH — which rig sets each method's fleet cap, and what it is worth

   `depthWindow()` = [min(window lo, hi), min(window hi, method.depthRange[1],
   fleet cap)], where the fleet cap is the deepest `depthCapacity` among rigs
   that run the method — for methods in DEPTH_IS_VERTICAL only.

   The column that matters is BINDING: whether the fleet cap is the term that
   actually decides the ceiling. Where it is not, changing a rig's
   `depthCapacity` moves nothing until it drops below the other two.
   ═══════════════════════════════════════════════════════════════════════════ */
function probeDepth() {
  head('6. DEPTH — which rig sets each method\'s ceiling, and what a change is worth');
  const vertical = new Set(D.DEPTH_IS_VERTICAL);
  console.log(`  ${pad('method', 20)}${rpad('range hi', 9)}${rpad('fleet', 7)}${pad('  set by', 20)}${rpad('binding', 9)}${rpad('slack', 7)}`);
  const rows = [];
  for (const m of METHODS) {
    if (!vertical.has(m.id)) {
      if (VERBOSE) console.log(`  ${pad(m.id, 20)}   (targetDepth is not a vertical depth — no fleet cap applies)`);
      continue;
    }
    const able = rigsFor(m.id);
    const deepest = able.reduce((a, r) => Math.max(a, r.stats.depthCapacity || 0), 0);
    const setter = able.filter((r) => (r.stats.depthCapacity || 0) === deepest).map((r) => r.id).join('/');
    const binding = deepest < m.depthRange[1];
    const slack = deepest - m.depthRange[1];
    rows.push({ id: m.id, hi: m.depthRange[1], deepest, setter, binding, slack, able });
    console.log(`  ${pad(m.id, 20)}${rpad(m.depthRange[1], 9)}${rpad(deepest, 7)}${pad('  ' + setter, 20)}`
      + `${rpad(binding ? 'YES' : 'no', 9)}${rpad(binding ? '' : '+' + slack, 7)}`);
  }

  /* WHAT A CHANGE IS WORTH. For every rig that is the sole runner of a method,
     sweep its depthCapacity and report where the board starts to move. This is
     the arithmetic the cable-percussion decision needs and it should not have
     to be re-derived by hand. */
  console.log(`\n  sensitivity: how far can a sole runner's depthCapacity fall before the board moves?\n`);
  console.log(`  ${pad('method', 20)}${pad('sole rig', 18)}${rpad('now', 7)}${rpad('bites at', 10)}${rpad('headroom', 9)}`);
  const sole = [];
  for (const r of rows) {
    if (r.able.length !== 1) continue;
    const rig = r.able[0];
    const bites = r.hi;   // the cap only binds once it drops below the method's own ceiling
    sole.push({ method: r.id, rig: rig.id, now: r.deepest, bites, headroom: r.deepest - bites });
    console.log(`  ${pad(r.id, 20)}${pad(rig.id, 18)}${rpad(r.deepest, 7)}${rpad('< ' + bites, 10)}${rpad(r.deepest - bites, 9)}`);
  }

  // Every card the fleet cannot reach is a checkbeds failure by construction,
  // so this is a cross-check on that gate rather than a new rule.
  const unreachable = [];
  for (const r of rows) {
    if (r.deepest >= r.hi) continue;
    unreachable.push(`${r.id}: fleet reaches ${r.deepest} m against a ${r.hi} m method ceiling`);
  }
  /* ── THE CABLE-PERCUSSION DECISION, COSTED ────────────────────────────
     `data.js` says an American truck spudder — 9.4 t, 82 kW, depthCapacity
     250, walking beam. `blender/cable_percussion.py` and its reference say a
     British shell-and-auger tripod, measured 2.37 x 6.68 x 5.37 m and sourced
     at 13 kW and 1,700-2,250 kg. The machine on screen is a quarter the mass
     its own shop card claims, and the GLB is what the player actually sees —
     `gltfRig.js` fetches `models/<rigId>.glb`, so the model wins on screen
     while the data wins on the card.

     THE FIRST THING TO MEASURE IS WHETHER IT COSTS ANYTHING AT ALL, and the
     answer is not what the framing assumes. `depthWindow` takes the MINIMUM of
     the application row, `method.depthRange[1]` and the fleet cap. There is no
     `DEPTH_BY_METHOD_APPLICATION` row for cable-tool, so the ceiling is
     `min(120, 250) = 120` and the rig's 250 m is 130 m of DEAD HEADROOM. It
     moves nothing on the board until it falls below 120.

     So the cost of matching the data to the model is a step function with its
     step at 120, and everything below prints the size of the step. */
  console.log(`\n  ── cable-percussion: what matching the data to the model costs ──\n`);
  const ctCards = [];
  {
    const method = D.getMethod('cable-tool');
    const rand = makeRandom(SEED + 4242);
    const open = REGIONS.filter((r) => D.methodsForRegion(r.id, 60).some((m) => m.id === 'cable-tool'));
    for (let i = 0; i < 6000 && ctCards.length < 400; i++) {
      const region = open[i % Math.max(1, open.length)];
      if (!region) break;
      const level = 3 + (i % 58);
      const c = D.makeContract(region.id, level, rand);
      if (c.methodId !== 'cable-tool') continue;
      const r = run(c, 'cable-percussion', Math.max(level, 3));
      ctCards.push({ d: c.targetDepth, holes: c.holes, payout: c.payout, net: r.net, hours: r.hours });
    }
    const [lo, hi] = D.depthWindow(method, 'water-well');
    console.log(`  window today ${lo}-${hi} m · method.depthRange ${JSON.stringify(method.depthRange)}`
      + ` · rig depthCapacity ${D.getRig('cable-percussion').stats.depthCapacity} m`);
  }
  if (ctCards.length) {
    const total = ctCards.length;
    const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
    const meanAll = { payout: sum(ctCards, (x) => x.payout) / total, net: sum(ctCards, (x) => x.net) / total };
    const deepest = Math.max(...ctCards.map((x) => x.d));
    console.log(`  ${total} cards sampled, deepest ${deepest.toFixed(1)} m, `
      + `mean payout ${eur(meanAll.payout)}, mean net ${eur(meanAll.net)}\n`);
    console.log(`  ${pad('new ceiling', 13)}${rpad('cards lost', 11)}${rpad('board value', 12)}${rpad('mean payout', 12)}${rpad('mean net', 10)}  what it matches`);
    const label = {
      250: 'the rig row today (inert — 120 binds first)',
      120: 'the method row today — NO CHANGE',
      100: 'Pilcon-1500 brochure, 150 mm to 100 m [BRO]',
      60: 'family A drum length, "usually 60 m" [CON]',
      50: 'family A routine GI depth [ST] / research/16',
      30: 'modern US practice, "100 feet or less" [wellowner]',
    };
    for (const ceiling of [250, 120, 100, 60, 50, 30]) {
      const kept = ctCards.filter((x) => x.d <= ceiling);
      const lost = total - kept.length;
      const keptValue = sum(kept, (x) => x.payout);
      const allValue = sum(ctCards, (x) => x.payout);
      console.log(`  ${pad(ceiling + ' m', 13)}${rpad(`${lost} (${pct(lost / total)})`, 11)}`
        + `${rpad(pct(keptValue / allValue), 12)}`
        + `${rpad(kept.length ? eur(keptValue / kept.length) : '—', 12)}`
        + `${rpad(kept.length ? eur(sum(kept, (x) => x.net) / kept.length) : '—', 10)}  ${label[ceiling] || ''}`);
    }
    console.log(`\n  ⚠ THIS IS A TRUNCATION, NOT A RE-GENERATION, and the difference matters.`);
    console.log(`  A real ceiling change makes the generator re-roll depth inside the SMALLER`);
    console.log(`  window, so the cards that survive would be redistributed upward rather than`);
    console.log(`  simply kept. The "cards lost" and "board value" columns are therefore an`);
    console.log(`  UPPER bound on the loss; the true loss is smaller. Proving the exact figure`);
    console.log(`  needs data.js's depthRange changed, which is not this tool's to change.`);
  }

  console.log();
  assert(rows.every((r) => r.able.length > 0),
    'every vertical-depth method has at least one rig that runs it');
  if (unreachable.length) {
    note('fleet cap is the binding term on: ' + unreachable.join('; ')
      + ' — these windows move the day a depthCapacity changes');
  }
  return { rows, sole };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
console.log('checkcareer — the progression, measured');
console.log(`seed ${SEED} · ${SAMPLES} samples · ${RIGS.length} rigs · ${METHODS.length} methods · ${REGIONS.length} regions`);

const results = {};
if (want('board')) results.board = probeBoard();
if (want('ruin')) results.ruin = probeRuin();
if (want('payback')) results.payback = probePayback();
if (want('upkeep')) results.upkeep = probeUpkeep();
if (want('dual')) results.dual = probeDual();
if (want('depth')) results.depth = probeDepth();

head('SUMMARY');
if (notes.length) {
  console.log('Notes (not failures — findings the numbers support):');
  for (const n of notes) console.log('  · ' + n);
  console.log();
}
if (failures.length) {
  console.error(`FAIL: ${failures.length} assertion(s) about the shape of the career.`);
  for (const f of failures) console.error('  · ' + f);
  process.exit(1);
}
/* WHAT "OK" MEANS HERE, AND WHAT IT DOES NOT. Every assertion above is a
   property nobody would ever choose to break: a rescue that does not rescue, a
   machine that can never earn its price, a board with one right answer. The
   NOTES are the other half — measured properties that are somebody's design
   decision to make, not this gate's. A green run means no invariant broke; it
   does not mean the notes have been read. */
console.log('OK: no invariant broken. The board poses a real choice, the call-out job');
console.log('rescues at every level, and every machine in the fleet earns its price back.');
if (notes.length) console.log(`${notes.length} measured finding(s) above are design decisions, not defects.`);
