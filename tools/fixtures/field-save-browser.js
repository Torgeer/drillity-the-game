// Production persistence and UI, with isolated native browser storage and
// explicit fault injection. Senior resources and wear are scenario setup;
// purchases, skill prerequisites, regrind, saving and reload use real modules.
import { createUI } from '../../src/ui/shell.js';
import { createGameState, createBus, makeRandom, SCENES } from '../../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY, SAVE_VERSION } from '../../src/game/progression.js';
import * as game from '../../src/game/data.js';

const scenario = new URL(location.href).searchParams.get('scenario') || 'normal';
window.fieldSaveBootstrap = { scenario, phase: 'module-ready' };
const marker = 'field-save-fixture-seeded';
const faultKey = 'field-save-fixture-faults';
const logKey = 'field-save-fixture-storage-log';
const native = Object.fromEntries(['getItem', 'setItem', 'removeItem'].map(name => [name, Storage.prototype[name]]));
let faults = JSON.parse(native.getItem.call(sessionStorage, faultKey) || '{}');
let calls = JSON.parse(native.getItem.call(sessionStorage, logKey) || '[]');
const raw = (key) => native.getItem.call(localStorage, key);
const put = (key, value) => native.setItem.call(localStorage, key, value);
const record = (operation, key, failed = false) => {
  calls.push({ operation, key, failed });
  native.setItem.call(sessionStorage, logKey, JSON.stringify(calls));
};
for (const operation of ['getItem', 'setItem', 'removeItem']) {
  Storage.prototype[operation] = function(key, ...args) {
    if (this !== localStorage) return native[operation].call(this, key, ...args);
    const failed = operation === 'getItem' ? !!faults.read
      : operation === 'setItem' && (faults.quota === 'all' || faults.quota === key);
    record(operation, key, failed);
    if (failed) throw new DOMException('Injected browser storage fault', operation === 'getItem' ? 'SecurityError' : 'QuotaExceededError');
    return native[operation].call(this, key, ...args);
  };
}
const createCareer = async () => {
  const state = createGameState(), bus = createBus();
  state.settings.reducedMotion = true; state.settings.haptics = false;
  const ctx = { state, bus, rand: makeRandom(174), SCENES, game, uiRoot: document.querySelector('#ui') };
  const progression = createProgression(ctx); ctx.progression = progression;
  await progression.init();
  return { state, bus, ctx, progression };
};
if (!native.getItem.call(sessionStorage, marker)) {
  window.fieldSaveBootstrap.phase = 'creating-seed';
  const seed = await createCareer();
  seed.state.player.money = 8765;
  seed.progression.requestSave();
  if (!seed.progression.save()) throw Error('Compatible seed could not be saved');
  const good = raw(SAVE_KEY);
  seed.progression.dispose();
  native.setItem.call(sessionStorage, 'field-save-fixture-good', good);
  if (scenario === 'future') put(SAVE_KEY, JSON.stringify({ ...JSON.parse(good), version: SAVE_VERSION + 10 }));
  if (scenario === 'unreadable') put(SAVE_KEY, '{ unreadable saved career');
  if (scenario === 'recovered') { put(SAVE_BACKUP_KEY, good); put(SAVE_KEY, '{ unreadable primary'); }
  if (scenario === 'read-failed') faults.read = true;
  if (scenario === 'quota') faults.quota = SAVE_KEY;
  native.setItem.call(sessionStorage, marker, '1');
  native.setItem.call(sessionStorage, faultKey, JSON.stringify(faults));
}
window.fieldSaveBootstrap.phase = 'loading-career';
const { state, bus, ctx, progression } = await createCareer();
const BIT = 'bit-th-r32-45-std', GRINDER = 'ws-grinding-kit';
if (scenario.startsWith('grind-')) {
  state.player.level = game.MAX_LEVEL; state.player.money = 1e7; state.player.skillPoints = 100;
  state.player.certs = game.CERTS.map(c => c.id);
  state.unlocked.methods = game.METHODS.map(m => m.id);
  state.unlocked.rigs = game.RIGS.map(r => r.id);
  state.unlocked.regions = game.REGIONS.map(r => r.id);
  const requireOK = (value, label) => { if (!value.ok) throw Error(label + ': ' + value.reason); };
  requireOK(progression.selectRig('crawler-th'), 'Select top hammer');
  for (const id of [BIT, GRINDER]) requireOK(progression.purchase(id), 'Purchase ' + id);
  requireOK(progression.equip('bit', BIT), 'Fit bit');
  requireOK(progression.equip('workshop', GRINDER), 'Fit grinder');
  for (const id of ['ts.carbide-care', 'ts.thread-doctor']) requireOK(progression.spendSkillPoint(id), 'Prerequisite ' + id);
  if (scenario !== 'grind-no-skill') {
    for (let rank = 0; rank < 2; rank++) requireOK(progression.spendSkillPoint('ts.field-regrind'), 'Field Regrind purchase');
  }
  state.garage.condition[BIT] = scenario === 'grind-exhausted' ? 0 : 0.55;
  if (scenario === 'grind-no-grinder') requireOK(progression.equip('workshop', null), 'Remove grinder');
  if (scenario === 'grind-used') requireOK(progression.fieldRegrind(), 'First real treatment');
  progression.requestSave(); progression.save();
}
if (scenario === 'quota') { progression.addMoney(321, 'Browser fixture earned increment'); progression.update(2); }
const ui = createUI(ctx); ctx.ui = ui;
window.fieldSaveBootstrap.phase = 'initializing-ui';
await ui.init(); ui.resize(innerWidth, innerHeight, devicePixelRatio);
// Queue the requested scene while BOOT still holds it. releaseBoot captures
// that request for its delayed handoff; showing Garage after release would
// allow the already-scheduled default Menu handoff to overwrite the fixture.
ui.show(scenario.startsWith('grind-') ? SCENES.GARAGE : SCENES.MENU);
ui.setLoadingProgress(1); ui.update(3);
window.fieldSaveFixture = {
  ui, progression, state, bus, SCENES, SAVE_KEY, SAVE_BACKUP_KEY, BIT,
  documentId: crypto.randomUUID(), scenario,
  snapshot: () => ({ status: progression.getSaveStatus(), quote: progression.fieldRegrindQuote(),
    career: progression.serialise(), calls: structuredClone(calls), primary: raw(SAVE_KEY), backup: raw(SAVE_BACKUP_KEY) }),
  resetCalls() { calls = []; native.setItem.call(sessionStorage, logKey, '[]'); },
  setFaults(next) { faults = { ...faults, ...next }; native.setItem.call(sessionStorage, faultKey, JSON.stringify(faults)); },
  restoreCompatible() { put(SAVE_KEY, native.getItem.call(sessionStorage, 'field-save-fixture-good')); },
  pulse(count = 20) { for (let i = 0; i < count; i++) { progression.update(2); ui.update(2); } },
};
window.fieldSaveBootstrap.phase = 'ready';
