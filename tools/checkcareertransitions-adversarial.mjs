#!/usr/bin/env node
/** Independent CPU attacks on exact screen callbacks and actual career/sim.
 * Native DOM interaction/rendering is not exercised. Navigation/confirmation
 * adapters deliberately expose asynchronous and event reentrancy boundaries.
 * No browser, server, renderer, exports, calibrated fixture dimensions or money
 * implementation. Contracts come from the production deterministic generator.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseAst } from 'vite';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { makeContract } from '../src/game/data.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';

const root = new URL('../', import.meta.url);
const sourcePaths = ['src/ui/screens/site.js', 'src/ui/screens/results.js', 'src/ui/shell.js', 'src/game/progression.js', 'src/sim/drilling.js'];
const sources = Object.fromEntries(sourcePaths.map(p => [p, readFileSync(new URL(p, root), 'utf8')]));
const hash = s => createHash('sha256').update(s).digest('hex');
const hashes = Object.fromEntries(sourcePaths.map(p => [p, hash(sources[p])]));
function extract(path, predicate) {
  const found = [];
  function walk(n) { if (!n || typeof n !== 'object') return; if (predicate(n)) found.push(n);
    for (const v of Object.values(n)) if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') walk(v); }
  walk(parseAst(sources[path])); assert.equal(found.length, 1, 'Unique live source extraction');
  return sources[path].slice(found[0].start, found[0].end);
}
const site = 'src/ui/screens/site.js', results = 'src/ui/screens/results.js';
const declaration = (path, name) => extract(path, n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === name));
const method = (path, name) => extract(path, n => n.type === 'FunctionDeclaration' && n.id?.name === name);
const unmount = extract(site, n => n.type === 'Property' && n.method && n.key?.name === 'unmount');
const makeSite = new Function('app', 'SCENES', 'EVENTS', `const ctx=app.ctx,state=ctx.state;
const say=(...args)=>app.notices.push(args),clearAlert=()=>{},resetWell=()=>{},resetProgramme=()=>{};
${declaration(site, 'leavePending')}
${declaration(site, 'actionEpoch')}
${method(site, 'invalidateActionOutcomes')}
${method(site, 'abandonFromSite')}
return {leave:abandonFromSite,unmount:({${unmount}}).unmount};`);
const makeResults = new Function('app', 'SCENES', `const state=app.ctx.state,labels={textContent:''},attrs={};
const C={Button:args=>({onTap:args.onTap,querySelector:()=>labels,setAttribute:(k,v)=>attrs[k]=v})};
${declaration(results, 'againBtn')}
${declaration(results, 'nextActionLabel')}
${method(results, 'syncNextAction')}
return {click:againBtn.onTap,sync:syncNextAction,labels,attrs};`);
// Execute the production Site mount start block with real sim/progression, not
// a stand-in that issues attempt identities. Remaining UI mounting is omitted.
const siteMount = extract(site, n => n.type === 'Property' && n.method && n.key?.name === 'mount');
const startAt = siteMount.indexOf('const sim = ctx.sim;');
const stopAt = siteMount.indexOf("if (typeof d.wob !== 'number')", startAt);
assert.ok(startAt >= 0 && stopAt > startAt, 'Exact production mount start block is present');
const actualMountStart = new Function('app', 'params', 'SCENES', 'EVENTS', `const ctx=app.ctx,state=ctx.state,
c=params?.contract,d=state.drill,site=state.world.site,el={isConnected:true};
const C={mustResolve:(value)=>{if(value==null)throw Error('Unexpected fallback mount');return value;}};
${siteMount.slice(startAt, stopAt)}`);

const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const realWarn = console.warn, realError = console.error;
const diagnostics = [], all = [], cases = [];
function generated(holes = 3, ordinal = 0) { const rand = makeRandom(20260906); let matched = 0;
  for (let i = 0; i < 1000; i++) { const c = makeContract('nordic', 1, rand); if (c.holes === holes && matched++ === ordinal) return c; }
  throw Error('Production generator did not provide required contract'); }
async function fresh(holes = 3) {
  const storage = { values: new Map(), fail: false, writes: 0,
    getItem(k) { return this.values.get(k) ?? null; }, removeItem(k) { this.values.delete(k); },
    setItem(k, v) { if (this.fail) throw Error('controlled quota failure'); this.writes++; this.values.set(k, String(v)); } };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  const ctx = { state: createGameState(), bus: createBus(), rand: makeRandom(51), SCENES };
  ctx.progression = createProgression(ctx); await ctx.progression.init(); ctx.sim = createDrillSim(ctx);
  assert.equal(ctx.progression.acceptContract(generated(holes)).ok, true);
  ctx.state.scene = SCENES.SITE;
  const app = { ctx, bus: ctx.bus, notices: [], navigations: [], confirms: 0, resolutions: [], mountOnNav: false,
    confirm() { this.confirms++; return new Promise(resolve => this.resolutions.push(resolve)); },
    toast(...args) { this.notices.push(args); },
    nav(scene, params) { this.navigations.push({ scene, contractId: params?.contract?.id }); ctx.state.scene = scene;
      if (this.mountOnNav && scene === SCENES.SITE) actualMountStart(app, params, SCENES, EVENTS); } };
  const f = { ...ctx, app, storage, site: makeSite(app, SCENES, EVENTS), results: makeResults(app, SCENES), completions: [] };
  ctx.bus.on(EVENTS.HOLE_COMPLETE, payload => f.completions.push(payload));
  all.push(f); return f;
}
function start(f) { f.state.scene = SCENES.SITE; actualMountStart(f.app, { contract: f.state.contract }, SCENES, EVENTS); assert.equal(f.sim.active, true); }
function complete(f) { f.sim.debug.stepFixed(60); f.sim.debug.setDepth(f.state.contract.targetDepth); f.sim.debug.stepFixed(10);
  const p = f.completions.at(-1); assert.ok(p && f.progression.settlementForCompletion(p)); f.state.scene = SCENES.RESULTS; return p; }
const career = f => structuredClone(f.progression.serialise());
const balance = f => JSON.stringify({ money: f.state.player.money, career: f.state.player.career, stats: f.state.player.stats });
function actionLabel(f, expected) { f.results.sync(); assert.equal(f.results.labels.textContent, expected); assert.equal(f.results.attrs['aria-label'], expected); }
const test = (name, fn) => cases.push({ name, fn });

test('three concurrent exit taps share one decision; cancellation releases the latch', async () => {
  const f = await fresh(); start(f); f.progression.save(); const before = career(f), physical = structuredClone(f.sim.debug.state), writes = f.storage.writes;
  const pending = [f.site.leave(), f.site.leave(), f.site.leave()]; assert.equal(f.app.confirms, 1);
  f.app.resolutions.shift()(false); await Promise.all(pending);
  assert.deepEqual(career(f), before); assert.deepEqual(f.sim.debug.state, physical); assert.equal(f.storage.writes, writes);
  const second = f.site.leave(); assert.equal(f.app.confirms, 2); f.app.resolutions.shift()(false); await second;
});

test('confirmation rejection releases latch without career or navigation effects', async () => {
  const f = await fresh(); start(f); const before = career(f);
  f.app.confirm = () => Promise.reject(Error('controlled dialog failure')); await f.site.leave();
  assert.deepEqual(career(f), before); assert.equal(f.app.navigations.length, 0); assert.ok(f.app.notices.length);
  f.app.confirm = async () => false; await f.site.leave(); assert.deepEqual(career(f), before);
});

test('unmount and return to the SAME active attempt invalidates old confirmation', async () => {
  const f = await fresh(); start(f); const pending = f.site.leave(); const before = career(f);
  f.site.unmount(); f.state.scene = SCENES.CONTRACTS; f.state.scene = SCENES.SITE;
  f.app.resolutions.shift()(true); await pending;
  assert.deepEqual(career(f), before); assert.equal(f.sim.active, true); assert.equal(f.app.navigations.length, 0);
});

test('late answer after external abandonment and fresh acceptance cannot close the new run', async () => {
  const f = await fresh(); start(f); const pending = f.site.leave();
  f.sim.abortHole(); f.progression.abandonContract(); assert.equal(f.progression.acceptContract(generated(3, 1)).ok, true); start(f);
  const before = career(f); f.app.resolutions.shift()(true); await pending;
  assert.deepEqual(career(f), before); assert.equal(f.sim.active, true);
});

test('reentrant DRILL_STOP replacement during abort cannot abandon the replacement', async () => {
  const f = await fresh(); start(f); const pending = f.site.leave(); let replaced = false, before;
  f.bus.on(EVENTS.DRILL_STOP, () => {
    if (replaced) return; replaced = true;
    assert.equal(f.progression.abandonContract().ok, true);
    assert.equal(f.progression.acceptContract(generated(3, 1)).ok, true); start(f); before = career(f);
  });
  f.app.resolutions.shift()(true); await pending;
  assert.equal(replaced, true); assert.deepEqual(career(f), before); assert.equal(f.sim.active, true); assert.equal(f.app.navigations.length, 0);
});

test('primary save failure is visible and pending retry eventually persists abandonment', async () => {
  const f = await fresh(); start(f); assert.equal(f.progression.save(), true);
  const oldSave = f.storage.values.get(SAVE_KEY); f.storage.fail = true;
  const pending = f.site.leave(); f.app.resolutions.shift()(true); await pending;
  assert.equal(f.state.contract, null); assert.equal(f.sim.active, false);
  assert.equal(f.storage.values.get(SAVE_KEY), oldSave, 'Failed storage must remain visibly unsaved');
  assert.ok(f.app.notices.some(args => /sav|stor|persist/i.test(args.join(' '))), 'A user-visible unsaved warning is required');
  assert.equal(f.app.navigations.at(-1)?.scene, SCENES.CONTRACTS);
  f.storage.fail = false; f.progression.update(10);
  assert.notEqual(f.storage.values.get(SAVE_KEY), oldSave); assert.equal(f.progression.load(), true); assert.equal(f.state.contract, null);
});

test('abort failure does not abandon the accepted career', async () => {
  const f = await fresh(); start(f); const before = career(f), abort = f.sim.abortHole;
  f.sim.abortHole = () => { throw Error('controlled stop boundary failure'); };
  const pending = f.site.leave(); f.app.resolutions.shift()(true); await pending; f.sim.abortHole = abort;
  assert.deepEqual(career(f), before); assert.equal(f.sim.active, true); assert.equal(f.app.navigations.length, 0); assert.ok(f.app.notices.length);
});

test('partial-result double tap starts ONE actual attempt with no repayment or mobilisation', async () => {
  const f = await fresh(); start(f); const firstAttempt = f.progression.run.attemptId; const payload = complete(f), paid = balance(f);
  actionLabel(f, 'Next hole'); f.app.mountOnNav = true;
  f.results.click(); const nextAttempt = f.progression.run.attemptId; f.results.click();
  assert.notEqual(nextAttempt, firstAttempt); assert.equal(f.progression.run.attemptId, nextAttempt);
  assert.equal(f.progression.run.holesDone, 1); assert.equal(balance(f), paid); assert.equal(f.sim.active, true); actionLabel(f, 'Resume hole');
  f.bus.emit(EVENTS.HOLE_COMPLETE, structuredClone(payload)); assert.equal(balance(f), paid); assert.equal(f.progression.run.holesDone, 1);
});

test('reloaded partial settlement resumes run identity then final result targets board', async () => {
  const f = await fresh(); start(f); complete(f); const runId = f.progression.run.runId, paid = balance(f);
  f.progression.save(); assert.equal(f.progression.load(), true); actionLabel(f, 'Next hole'); f.app.mountOnNav = true;
  f.results.click(); assert.equal(f.progression.run.runId, runId); assert.equal(balance(f), paid);
  complete(f); f.results.click(); const finalPayload = complete(f), finalPaid = balance(f);
  actionLabel(f, 'Next contract'); f.results.click(); f.results.click();
  assert.equal(f.app.navigations.at(-1).scene, SCENES.CONTRACTS); assert.equal(f.state.contract, null);
  f.bus.emit(EVENTS.HOLE_COMPLETE, structuredClone(finalPayload)); assert.equal(balance(f), finalPaid);
});

test('after partial pay, double confirmed abandonment preserves ledger and penalizes only once', async () => {
  const f = await fresh(); start(f); complete(f); const paid = f.state.player.money, ledger = JSON.stringify(f.state.player.career.ledger); start(f);
  const pending = [f.site.leave(), f.site.leave()]; f.app.resolutions.shift()(true); await Promise.all(pending);
  assert.equal(f.state.player.money, paid); assert.equal(JSON.stringify(f.state.player.career.ledger), ledger);
  const after = career(f), stale = f.site.leave(); // scene is board: no valid Site answer
  f.app.resolutions.shift()(true); await stale;
  // The adapter can still invoke a stale DOM handler; resolve it, without a job.
  assert.equal(f.state.contract, null); assert.equal(f.app.navigations.length, 1); assert.deepEqual(career(f), after);
});

test('Escape invokes the actual guarded Site action instead of navigating directly', async () => {
  const f = await fresh(); start(f); const shell = 'src/ui/shell.js';
  const onBack = extract(site, n => n.type === 'Property' && n.key?.name === 'onBack');
  let pending;
  const key = new Function('SCENES', 'show', 'abandonFromSite', `${declaration(shell, 'PARENT')}
const current={id:SCENES.SITE,inst:{${onBack}}},overlayStack=[];
${method(shell, 'back')}
${method(shell, 'onKey')}
return onKey;`)(SCENES, () => { throw Error('Escape bypassed the Site decision'); }, () => { pending = f.site.leave(); });
  let prevented = false; key({ key: 'Escape', preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(f.app.confirms, 1);
  assert.equal(f.state.scene, SCENES.SITE); assert.equal(f.sim.active, true);
  f.app.resolutions.shift()(false); await pending;
  assert.equal(f.state.scene, SCENES.SITE); assert.equal(f.app.navigations.length, 0);
});

let failures = 0;
console.warn = (...args) => diagnostics.push(args.map(String).join(' '));
console.error = (...args) => diagnostics.push(args.map(String).join(' '));
try {
  for (const c of cases) {
    const startDiagnostic = diagnostics.length;
    try { await c.fn(); console.log('PASS ' + c.name); }
    catch (error) { failures++; console.log('FAIL ' + c.name + '\n' + error.stack); }
    c.diagnostics = diagnostics.slice(startDiagnostic);
  }
} finally {
  for (const f of all) { f.sim.dispose(); f.progression.dispose(); }
  console.warn = realWarn; console.error = realError;
  if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage); else delete globalThis.localStorage;
}
for (const p of sourcePaths) assert.equal(hash(readFileSync(new URL(p, root), 'utf8')), hashes[p], 'Source stayed frozen: ' + p);
console.log(JSON.stringify({ passed: cases.length - failures, failed: failures, sourceHashes: hashes,
  limits: 'Exact callback CPU execution; no shell DOM/browser/GPU or offscreen-pause acceptance.',
  cases: cases.map(c => ({ name: c.name, diagnostics: c.diagnostics })) }));
process.exitCode = failures ? 1 : 0;
