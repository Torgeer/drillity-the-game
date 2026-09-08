/** Earliest-unlock purchase route using real public progression and catalogue.
 * XP/funds are explicit boundary fixtures, not a simulated profitable career.
 */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom } from '../src/core/contract.js';
import { createProgression } from '../src/game/progression.js';
import { LEVELS, defaultLoadoutFor, getMethod, getRig, getItem, getCert, makeContract } from '../src/game/data.js';
import { certCost } from '../src/game/economy.js';
import { checkSampleEquipment } from '../src/game/equipment-support.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const reports = [];
try {
  for (const methodId of ['core', 'sonic']) {
    const values = new Map();
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: key => values.delete(key),
    } });
    const state = createGameState(), bus = createBus();
    const p = createProgression({ state, bus, rand: makeRandom(907) });
    await p.init();
    try {
      const method = getMethod(methodId), rig = getRig(method.rigIds[0]);
      assert.equal(rig.unlockLevel, method.unlockLevel);
      p.addXP(LEVELS.cumulative[method.unlockLevel - 2], 'fixture: prior level boundary');
      assert.equal(state.player.level, method.unlockLevel - 1);
      p.addMoney(rig.price - 1 - state.player.money, 'fixture: one euro below rig price');
      assert.equal(p.purchaseRig(rig.id).ok, false, 'rig must remain locked before the method');
      p.addXP(LEVELS.cumulative[method.unlockLevel - 1] - state.player.xp, 'fixture: exact unlock');
      assert.equal(state.player.level, method.unlockLevel);
      assert.ok(state.unlocked.methods.includes(methodId));
      assert.ok(!state.unlocked.rigs.includes(rig.id), 'level unlock must not grant a free rig');
      const before = JSON.stringify(p.serialise());
      assert.equal(p.purchaseRig(rig.id).ok, false, 'unlocked rig still requires its actual cash price');
      assert.equal(JSON.stringify(p.serialise()), before);
      p.addMoney(1, 'fixture: reach exact rig price');
      assert.equal(p.purchaseRig(rig.id).ok, true);
      assert.equal(state.player.money, 0);
      assert.equal(p.selectRig(rig.id).ok, true);
      const loadout = defaultLoadoutFor(methodId, method.unlockLevel);
      assert.ok(checkSampleEquipment(methodId, loadout, getItem).ok);
      assert.ok(Object.values(loadout).every(id => id && getItem(id).unlockLevel <= method.unlockLevel),
        'no required bay may be silently omitted at the actual unlock');
      const price = Object.values(loadout).reduce((sum, id) => sum + p.priceOf(id), 0);
      assert.equal(p.purchase(loadout.bit).ok, false, 'defaults must not bypass an empty wallet');
      p.addMoney(price, 'fixture: exact public quotes for the whole loadout');
      for (const [slot, id] of Object.entries(loadout)) {
        assert.equal(p.purchase(id).ok, true, `${id} purchase at method unlock`);
        assert.equal(p.equip(slot, id).ok, true, `${id} fit at method unlock`);
      }
      assert.equal(state.player.money, 0, 'whole loadout charges the exact quoted amount');
      const random = makeRandom(9452);
      let c = null;
      for (let i = 0; i < 20000; i++) {
        const generated = makeContract('nordic', method.unlockLevel, random);
        if (generated.methodId === methodId) { c = generated; break; }
      }
      assert.ok(c, 'a real generated contract exists at the method unlock');
      let certificateSpend = 0;
      function train(id) {
        if (state.player.certs.includes(id)) return;
        const cert = getCert(id);
        assert.ok(cert.minLevel <= method.unlockLevel, 'generated requirements must be attainable now');
        for (const pre of cert.prereq) train(pre);
        const quote = certCost(id, state.player.skills).price;
        p.addMoney(quote, 'fixture: certificate course quote');
        assert.equal(p.purchaseCert(id).ok, true); certificateSpend += quote;
      }
      for (const cert of c.requiredCerts) train(cert);
      const preview = p.previewContract(c);
      assert.equal(preview.ok, true, preview.reason);
      assert.equal(p.acceptContract(c).ok, true);
      reports.push({ methodId, unlockLevel: method.unlockLevel, rigId: rig.id,
        rigPrice: rig.price, loadout, loadoutPrice: price, certificateSpend,
        generatedContractId: c.id, generatedDepth: c.targetDepth });
      console.log(`PASS ${methodId}: method/rig/full string available at level ${method.unlockLevel}; actual purchases, certificates and generated-job acceptance`);
    } finally { p.dispose(); }
  }
  console.log(JSON.stringify({ cases: reports.length, reports }, null, 2));
  console.log('Boundary: XP and money were boundary fixtures; this does not measure an unaided career playthrough or tender/tool diameter agreement.');
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
