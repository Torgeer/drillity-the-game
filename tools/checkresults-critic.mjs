#!/usr/bin/env node
/** Independent scenario extension of the actual-callback identity harness.
 * Reuses its production extraction and fixture, never settlement logic.
 * CPU only. Source hashes must remain stable throughout this invocation.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
assert.equal(process.argv.length, 2);
const baseURL = new URL('./checkresults-identity.mjs', import.meta.url);
const paths = ['src/game/progression.js', 'src/ui/shell.js', 'src/ui/screens/results.js',
  'src/main.js', 'src/game/data.js', 'src/sim/drilling.js'];
const hashes = () => Object.fromEntries(paths.map(p => [p, crypto.createHash('sha256')
  .update(fs.readFileSync(new URL('../' + p, import.meta.url))).digest('hex')]));
const before = hashes();
let source = fs.readFileSync(baseURL, 'utf8').replace(/^#![^\n]*\n/, '');
const marker = "const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');";
assert.equal(source.split(marker).length, 2, 'One runner insertion point');
const probes = String.raw`
test('CRITIC three real simulation completions in one stack show only the latest paid hole', async () => {
  const t = await fresh(); const paid = [];
  for (let i = 0; i < 3; i++) { start(t); paid.push(finish(t)); }
  assert.equal(t.state.player.career.ledger.length, 3);
  await drain(); shown(t, paid[2]);
  assert.equal(t.read(paid[2]).hole, 3);
  assert.equal(t.summarize(t.shows[0].params).net, Math.round(t.read(paid[2]).net));
});
test('CRITIC synchronous tokenless object reuse authenticates only newest receipt once', async () => {
  const t = await fresh(), p = payload(t, {});
  t.bus.emit(EVENTS.HOLE_COMPLETE, p);
  t.bus.emit(EVENTS.DRILL_START, {contract:t.c});
  t.bus.emit(EVENTS.HOLE_COMPLETE, p);
  await drain(); shown(t, p); assert.equal(t.read(p).hole, 2);
});
test('CRITIC reset during completion window cancels results and old receipt', async () => {
  const t = await fresh(); start(t); const p = finish(t);
  t.progression.reset(); const after = book(t);
  await drain(); assert.equal(t.shows.length, 0); unpaid(t, p);
  assert.equal(book(t), after);
});
test('CRITIC successful load during completion window cancels results and old receipt', async () => {
  const t = await fresh(); start(t); const p = finish(t);
  assert.equal(t.progression.save(), true); assert.equal(t.progression.load(), true);
  await drain(); assert.equal(t.shows.length, 0); unpaid(t, p);
});
test('CRITIC rejected duplicate acceptance during notifications preserves legitimate results', async () => {
  const t = await fresh(), p = payload(t, start(t)); let refusals = 0;
  t.bus.on(EVENTS.MONEY_CHANGE, () => {
    const before = book(t);
    assert.equal(t.progression.acceptContract(t.c).ok, false);
    assert.equal(book(t), before); refusals++;
  });
  t.bus.emit(EVENTS.HOLE_COMPLETE, p); await drain();
  assert.ok(refusals > 0); shown(t, p);
});
test('CRITIC same-ID reaccept after final hole does not reuse old result or receipt', async () => {
  const t = await fresh(1); start(t); const old = finish(t); await drain();
  const oldReceipt = t.read(old); const oldRun = oldReceipt.runId;
  assert.equal(t.progression.acceptContract(t.c).ok, true);
  const identity = start(t); assert.notEqual(identity.runId, oldRun);
  t.shows.length = 0; t.bus.emit(EVENTS.HOLE_COMPLETE, old); await drain();
  assert.equal(t.shows.length, 0); assert.equal(t.read(old), oldReceipt);
  const p = finish(t); await drain(); shown(t, p);
  assert.notEqual(t.read(p), oldReceipt); assert.equal(t.read(p).hole, 1);
});
test('CRITIC real SCENE_CHANGE navigation wins over queued paid results', async () => {
  const t = await fresh(); start(t); const p = finish(t);
  t.bus.emit(EVENTS.SCENE_CHANGE, {scene:SCENES.CONTRACTS}); await drain();
  assert.equal(t.shows.length, 1); assert.equal(t.shows[0].scene, SCENES.CONTRACTS);
  assert.ok(t.read(p));
});
test('CRITIC fresh final completion after reset works and rejects old-career completion', async () => {
  const t = await fresh(1); start(t); const old = finish(t); await drain();
  t.progression.reset(); assert.equal(t.progression.acceptContract(t.c).ok, true);
  start(t); t.shows.length = 0;
  const before = book(t); t.bus.emit(EVENTS.HOLE_COMPLETE, old); await drain();
  assert.equal(book(t), before); assert.equal(t.shows.length, 0); unpaid(t, old);
  const p = finish(t); await drain(); shown(t, p);
});
test('CRITIC actual nonvertical simulation starts preserve length semantics above unrelated depth ratings', async () => {
  for (const [method, rig] of [['hdd','hdd-rig'], ['tunnel-jumbo','tunnel-jumbo'],
    ['rockbolt','bolter'], ['longhole','longhole-rig']]) {
    const t = await fresh(); t.progression.abandonContract();
    t.state.player.level = criticData.MAX_LEVEL; t.state.player.money = 1e8;
    t.state.player.certs = criticData.CERTS.map(c => c.id);
    t.state.unlocked.methods = criticData.METHODS.map(m => m.id);
    t.state.unlocked.regions = criticData.REGIONS.map(r => r.id);
    t.state.unlocked.rigs = [rig]; t.state.garage.rigId = rig;
    let c; const random = makeRandom(9196);
    for (const region of criticData.REGIONS) {
      for (let i = 0; i < 2000 && !c; i++) {
        const card = makeContract(region.id, criticData.MAX_LEVEL, random);
        if (card.methodId === method) c = card;
      }
      if (c) break;
    }
    assert.ok(c, method + ' generated fixture');
    c = {...c, targetDepth:criticData.rigDepthCapacity(rig, method) + 1};
    assert.equal(t.progression.acceptContract(c).ok, true); t.c = c;
    start(t);
    assert.equal(t.state.drill.target, c.targetDepth, method + ' preserves actual simulation target');
    assert.equal(t.progression.run.contract.targetDepth, c.targetDepth);
  }
});
`;
source = source.replace(marker, probes + '\n' + marker)
  .replaceAll('import.meta.url', JSON.stringify(baseURL.href))
  .replace(/from '([^']+)'/g, (whole, specifier) => {
    if (specifier.startsWith('node:')) return whole;
    const resolved = specifier.startsWith('.') ? new URL(specifier, baseURL).href : import.meta.resolve(specifier);
    return `from ${JSON.stringify(resolved)}`;
  });
source = `import * as criticData from ${JSON.stringify(new URL('../src/game/data.js', import.meta.url).href)};\n` + source;
try {
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
} catch (error) {
  // Data-URL stack entries otherwise dump the whole test source as base64.
  error.stack = error.stack?.replace(/data:text\/javascript;base64,[A-Za-z0-9+/=]+/g, 'actual-callback-critic');
  throw error;
} finally {
  assert.deepEqual(hashes(), before, 'Concurrent production edits invalidate this review run');
  console.log(JSON.stringify({reviewedFiles:before, hashStability:'unchanged'}, null, 2));
}
