import { createProgression } from '../../src/game/progression.js';
import { createGameState, createBus } from '../../src/core/contract.js';
import { RIGS, METHODS, ITEMS } from '../../src/game/data.js';

const require = (condition, message) => { if (!condition) throw Error(message); };

// Only the presentation telemetry is synthetic. Contract acceptance, identity,
// reputation and saved closure all use the production progression implementation.
// The runner serves this in a fresh browser context on an owned ephemeral origin.
export function attachAcceptedCareer(ctx, contract, effects) {
  require(ctx.state.contract === null, 'Career fixture starts without an accepted contract');
  Object.assign(ctx.state.unlocked, {
    rigs: RIGS.map(r => r.id), methods: METHODS.map(m => m.id), items: ITEMS.map(i => i.id),
  });
  ctx.state.player.level = 60;
  ctx.state.player.money = 123456;
  const progression = createProgression(ctx);
  const accepted = progression.acceptContract(contract);
  require(accepted.ok, 'Real fixture contract rejected: ' + accepted.reason);
  if (typeof progression.beginHole === 'function') progression.beginHole(contract);
  require(progression.run?.runId && ctx.state.contract === contract, 'Real accepted run and contract must exist');
  const abandon = progression.abandonContract, save = progression.save;
  progression.abandonContract = () => {
    const result = abandon();
    effects.abandonments.push({ ok: result.ok, contractId: contract.id, reputation: result.reputation });
    return result;
  };
  progression.save = () => { const ok = save(); effects.saves.push({ ok }); return ok; };
  ctx.progression = progression;
  return progression;
}

export function careerSnapshot(ctx) {
  const p = ctx.progression;
  return p ? {
    contractId: ctx.state.contract?.id ?? null,
    runId: p.run?.runId ?? null,
    attemptId: p.run?.attemptId ?? null,
    money: ctx.state.player.money,
    reputation: p.reputationFor('nordic'),
    serialised: JSON.stringify(p.serialise()),
  } : null;
}

export async function checkCareerFixture() {
  // A private memory store exercises the actual serializer without touching the
  // developer's browser profile. Restored even if a production assertion fails.
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const store = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key),
  } });
  let ctx;
  try {
    ctx = { state: createGameState(), bus: createBus() };
    const effects = { abandonments: [], saves: [] };
    const contract = { id: 'fixture-rotary', methodId: 'rotary-kelly', regionId: 'nordic', targetDepth: 24, holes: 1, payout: 1000, title: 'DOM fixture' };
    const p = attachAcceptedCareer(ctx, contract, effects), before = careerSnapshot(ctx);
    require(before.runId && before.attemptId && before.contractId === contract.id, 'Accepted career identity missing');
    require(p.abandonContract().ok, 'Actual abandonment failed');
    const after = careerSnapshot(ctx);
    require(after.runId === null && after.contractId === null, 'Actual abandonment leaves career open');
    require(after.money === before.money && after.reputation < before.reputation, 'Actual abandonment accounting differs');
    require(p.save() === true && p.load() === true, 'Actual abandoned career cannot save and reload');
    require(ctx.state.contract === null && p.run === null, 'Save resurrected abandoned contract');
    require(effects.abandonments.length === 1 && effects.saves.length === 1, 'Observed progression calls missing');
    return { acceptedIdentity: true, closesCareer: true, reputationCharged: true, moneyUnchanged: true, savedClosureReloaded: true };
  } finally {
    ctx?.progression?.dispose();
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
}
