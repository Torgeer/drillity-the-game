#!/usr/bin/env node
/** Independent pause lifecycle attacks. Uses the actual simulation, career,
 * shell overlay/Escape callbacks and Site abandon callback. Minimal DOM doubles
 * delimit those callbacks; this is not a native browser or audio acceptance run.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseAst } from 'vite';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { makeContract } from '../src/game/data.js';
import { createProgression } from '../src/game/progression.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { createModalFocus } from '../src/ui/modal-focus.js';

const paths = ['src/ui/shell.js', 'src/ui/modal-focus.js', 'src/ui/screens/site.js', 'src/sim/drilling.js', 'src/game/progression.js'];
const sources = Object.fromEntries(paths.map(p => [p, readFileSync(new URL('../' + p, import.meta.url), 'utf8')]));
const sha = value => createHash('sha256').update(value).digest('hex');
const hashes = Object.fromEntries(paths.map(p => [p, sha(sources[p])]));
const trees = Object.fromEntries(paths.map(p => [p, parseAst(sources[p])]));
function select(path, predicate) {
  const found = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (predicate(node)) found.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
    }
  }
  walk(trees[path]); assert.equal(found.length, 1, 'Unique production callback extraction');
  return sources[path].slice(found[0].start, found[0].end);
}
const shellPath = 'src/ui/shell.js', sitePath = 'src/ui/screens/site.js';
const fn = (path, name) => select(path, n => n.type === 'FunctionDeclaration' && n.id?.name === name);
const variable = (path, name) => select(path, n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id?.name === name));
const getter = select(shellPath, n => n.type === 'Property' && n.kind === 'get' && n.key?.name === 'gameplayPaused');
const unmount = select(sitePath, n => n.type === 'Property' && n.method && n.key?.name === 'unmount');
const onBack = select(sitePath, n => n.type === 'Property' && n.key?.name === 'onBack');
assert.match(onBack, /abandonFromSite/, 'Site back delegates to authoritative abandonment');
const show = fn(shellPath, 'show');
const dismissalStart = show.indexOf('const dismissedOverlay =');
const dismissalEnd = show.indexOf('// Retire whatever is on screen.', dismissalStart);
assert.ok(dismissalStart >= 0 && dismissalEnd > dismissalStart, 'Extract actual navigation overlay dismissal');
const makeSite = new Function('app', 'SCENES', 'EVENTS', `
const ctx=app.ctx,state=ctx.state,say=(...v)=>app.notices.push(v),clearAlert=()=>{},resetWell=()=>{},resetProgramme=()=>{};
${variable(sitePath, 'leavePending')}
${variable(sitePath, 'actionEpoch')}
${fn(sitePath, 'invalidateActionOutcomes')}
${fn(sitePath, 'abandonFromSite')}
return {leave:abandonFromSite,${unmount},${onBack}};`);
const makeShell = new Function('ctx', 'SCENES', 'document', 'C', 'createModalFocus', `
let current={id:SCENES.SITE,inst:{}},overlayStack=[],disposed=false;
const root=C.h('div'),overlayEl=C.h('div'),reduced=false,DUR={d3:0};
document.body.appendChild(root);root.appendChild(overlayEl);
${variable(shellPath, 'modalFocus')}
const dur=()=>0,requestAnimationFrame=fn=>fn(),setTimeout=fn=>{fn();return 0};
${variable(shellPath, 'PARENT')}
function show(scene) {
  ${show.slice(dismissalStart, dismissalEnd)}
  current.inst.unmount?.(); current={id:scene,inst:{}}; ctx.state.scene=scene;
  if(dismissedOverlay) modalFocus.focusFallback();
}
${fn(shellPath, 'closeOverlay')}
${fn(shellPath, 'sheet')}
${fn(shellPath, 'confirm')}
${fn(shellPath, 'back')}
${fn(shellPath, 'onKey')}
return {${getter},confirm,sheet,back,onKey,show,
  mountSite(inst){current={id:SCENES.SITE,inst};ctx.state.scene=SCENES.SITE;},
  get overlays(){return overlayStack;},disposeFixture(){disposed=true;modalFocus.dispose();},
};`);

const savedStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const savedDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
const contexts = [], cases = [], diagnostics = [];
const warn = console.warn, error = console.error;
function generated(ordinal = 0) {
  const rand = makeRandom(20260906); let found = 0;
  for (let i = 0; i < 1000; i++) {
    const c = makeContract('nordic', 1, rand);
    if (c.holes === 3 && found++ === ordinal) return c;
  }
  throw Error('No real generated contract');
}
// This boundary provides tree, attribute and focus semantics to the imported
// modal manager. Native layout, mutation scheduling and keyboard dispatch remain
// the separate Chrome modal gates' responsibility; no modal method is stubbed.
function documentBoundary() {
  const listeners = new Map();
  const doc = { visibilityState: 'visible', activeElement: null,
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    defaultView: { getComputedStyle: () => ({ visibility: 'visible' }),
      MutationObserver: class { observe() { this.observing = true; } disconnect() { this.observing = false; } } },
  };
  function node(selector = 'div', ...values) {
    const attrs = new Map(), classes = new Set(selector.split('.').slice(1));
    const el = { tagName: selector.split('.')[0].toUpperCase(), children: [], parentElement: null, style: {}, hidden: false,
      get isConnected() { return this === doc.body || !!this.parentElement?.isConnected; },
      get tabIndex() { return attrs.has('tabindex') ? Number(attrs.get('tabindex')) : this.tagName === 'BUTTON' ? 0 : -1; },
      classList: { add(...v) { v.forEach(x => classes.add(x)); }, contains(v) { return classes.has(v); } },
      appendChild(child) { if (child?.children) { child.remove(); child.parentElement = this; this.children.push(child); } return child; },
      remove() { if (this.parentElement) { const siblings = this.parentElement.children; siblings.splice(siblings.indexOf(this), 1); this.parentElement = null; } },
      contains(other) { return this === other || this.children.some(child => child.contains(other)); },
      hasAttribute(name) { return attrs.has(name); }, getAttribute(name) { return attrs.get(name) ?? null; },
      setAttribute(name, value) { attrs.set(name, String(value)); }, removeAttribute(name) { attrs.delete(name); },
      matches(query) { return query.split(',').some(raw => { const q = raw.trim();
        if (q === ':disabled') return !!this.disabled || attrs.has('disabled');
        if (q.startsWith('.')) return classes.has(q.slice(1));
        if (q.startsWith('[')) { const m = q.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/); return !!m && attrs.has(m[1]) && (m[2] === undefined || attrs.get(m[1]) === m[2]); }
        return q.toUpperCase() === this.tagName;
      }); },
      closest(query) { for (let ancestor = this; ancestor; ancestor = ancestor.parentElement) if (ancestor.matches(query)) return ancestor; return null; },
      querySelectorAll(query) { return this.children.flatMap(child => [...(child.matches(query) ? [child] : []), ...child.querySelectorAll(query)]); },
      querySelector(query) { return this.querySelectorAll(query)[0] || null; },
      getClientRects() { return this.isConnected ? [{}] : []; },
      focus() { if (!this.isConnected || this.closest('[inert], [hidden]')) return; doc.activeElement = this;
        for (const fn of listeners.get('focusin') || []) fn({ target: this }); },
    };
    for (const value of values.flat(Infinity)) {
      if (value?.children) el.appendChild(value);
      else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) el.setAttribute(k, v);
    }
    return el;
  }
  doc.body = node('body'); doc.activeElement = doc.body;
  return { doc, node };
}
async function fresh() {
  const storage = { values: new Map(), getItem(k) { return this.values.get(k) ?? null; },
    setItem(k, v) { this.values.set(k, String(v)); }, removeItem(k) { this.values.delete(k); } };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  const { doc, node } = documentBoundary();
  Object.defineProperty(globalThis, 'document', { configurable: true, value: doc });
  const buttons = [], C = { h: node, append(el, children) { children.flat(Infinity).forEach(child => el.appendChild(child)); }, Icon: () => node('i'), tap(el, cb) { el.onTap = cb; },
    Button(o) { const b = Object.assign(node('button.btn--' + o.kind), o); buttons.push(b); return b; } };
  const ctx = { state: createGameState(), bus: createBus(), rand: makeRandom(87), SCENES };
  ctx.progression = createProgression(ctx); await ctx.progression.init();
  ctx.sim = createDrillSim(ctx); ctx.sim.init();
  assert.equal(ctx.progression.acceptContract(generated()).ok, true);
  ctx.state.scene = SCENES.SITE; ctx.ui = makeShell(ctx, SCENES, doc, C, createModalFocus);
  const app = { ctx, state: ctx.state, bus: ctx.bus, notices: [], navigations: [],
    confirm: ctx.ui.confirm, toast(...v) { this.notices.push(v); },
    nav(scene) { this.navigations.push(scene); ctx.ui.show(scene); } };
  const site = makeSite(app, SCENES, EVENTS); ctx.ui.mountSite(site); ctx.sim.startHole(ctx.state.contract);
  const f = { ...ctx, app, site, doc, buttons, storage }; contexts.push(f); return f;
}
function step(f, n = 5, dt = 1 / 30) { for (let i = 0; i < n; i++) f.sim.update(dt, f.state); }
const physical = f => JSON.stringify(f.sim.debug.state);
const career = f => JSON.stringify(f.progression.serialise());
const key = f => { let prevented = false; f.ui.onKey({ key: 'Escape', preventDefault() { prevented = true; } }); return prevented; };
const test = (name, body) => cases.push({ name, body });

test('Escape opens the guarded decision; cancel preserves one attempt and resumes', async () => {
  const f = await fresh(); step(f); const before = physical(f), book = career(f), attempt = f.progression.run.attemptId;
  assert.equal(key(f), true); assert.equal(f.state.scene, SCENES.SITE); assert.equal(f.ui.overlays.length, 1);
  assert.equal(f.sim.paused, true); step(f, 20, 0.25); assert.equal(physical(f), before); assert.equal(career(f), book);
  assert.equal(key(f), true); await Promise.resolve(); await Promise.resolve();
  assert.equal(f.ui.overlays.length, 0); assert.equal(f.sim.paused, false); assert.equal(f.progression.run.attemptId, attempt);
  step(f); assert.ok(f.sim.debug.state.timeSec > JSON.parse(before).timeSec);
});

test('nested sheet and confirmation close independently without premature resume', async () => {
  const f = await fresh(), sheet = f.ui.sheet({ title: 'Details' });
  const decision = f.ui.confirm({ title: 'Nested question' });
  const before = physical(f); step(f); assert.equal(physical(f), before);
  key(f); assert.equal(await decision, false); assert.equal(f.ui.overlays.length, 1);
  step(f); assert.equal(physical(f), before); sheet.close(); assert.equal(f.sim.paused, false);
  step(f); assert.notEqual(physical(f), before);
});

test('out-of-order repeated sheet closure cannot release another overlay', async () => {
  const f = await fresh(), first = f.ui.sheet({ title: 'One' }), second = f.ui.sheet({ title: 'Two' });
  first.close(); first.close(); assert.equal(f.ui.overlays.length, 1); assert.equal(f.sim.paused, true);
  const before = physical(f); step(f); assert.equal(physical(f), before);
  second.close(); assert.equal(f.sim.paused, false);
});

test('direct off-Site navigation and hidden documents compose with overlays', async () => {
  const f = await fresh(); step(f); const before = physical(f), attempt = f.progression.run.attemptId;
  f.ui.show(SCENES.CONTRACTS); step(f); assert.equal(physical(f), before); assert.equal(f.sim.active, true);
  f.doc.visibilityState = 'hidden'; f.ui.mountSite(f.site); step(f); assert.equal(physical(f), before);
  const overlay = f.ui.sheet({ title: 'While hidden' }); f.doc.visibilityState = 'visible'; step(f); assert.equal(physical(f), before);
  overlay.close(); step(f); assert.notEqual(physical(f), before); assert.equal(f.progression.run.attemptId, attempt);
});

test('background operator actions and debug stepping cannot mutate a paused hole', async () => {
  const f = await fresh(); const overlay = f.ui.sheet({ title: 'Paused' }), before = physical(f);
  f.sim.setInput('feed', 1); f.sim.setInput('flush', 0); f.sim.setInput('rotation', 0);
  assert.equal(f.sim.pulse('kick').reason, 'paused'); assert.equal((await f.sim.changeBit()).reason, 'paused');
  assert.equal(f.sim.setCasing(true).reason, 'paused'); f.sim.debug.stepFixed(5);
  assert.equal(physical(f), before); overlay.close();
});

test('long hidden wall time and the pre-pause fractional step do not become catch-up', async () => {
  const f = await fresh(); f.sim.update(1 / 240, f.state);
  assert.equal(f.sim.debug.state.timeSec, 0);
  f.doc.visibilityState = 'hidden'; f.sim.update(3600, f.state);
  assert.equal(f.sim.debug.state.timeSec, 0);
  f.doc.visibilityState = 'visible'; f.sim.update(1 / 240, f.state);
  assert.equal(f.sim.debug.state.timeSec, 0, 'Discard the pre-pause accumulator fraction');
  f.sim.update(1 / 240, f.state);
  assert.equal(f.sim.debug.state.timeSec, 1 / 120, 'Resume only from newly presented frame time');
});

test('a timed trip retains its phase and pending completion while paused', async () => {
  const f = await fresh(); let completion = null;
  const trip = f.sim.changeBit().then(result => { completion = result; });
  assert.equal(f.sim.debug.state.phase, 'tripping-out');
  step(f, 2); const overlay = f.ui.sheet({ title: 'Trip paused' }), before = physical(f);
  step(f, 20, 0.25); await Promise.resolve(); assert.equal(physical(f), before); assert.equal(completion, null);
  overlay.close(); step(f, 2); assert.notEqual(physical(f), before);
  f.sim.abortHole('critic cleanup'); await trip; assert.equal(completion.ok, false);
});

test('a queued geological hazard is preserved once through pause and resume', async () => {
  const f = await fresh(); const overlay = f.ui.sheet({ title: 'Paused' }), before = physical(f);
  f.bus.emit(EVENTS.BOULDER, { depth: 0, hardness: 0.85, size: 1 });
  step(f); assert.equal(physical(f), before, 'External event does not mutate paused physics');
  overlay.close(); f.sim.update(0, f.state);
  assert.equal(f.sim.debug.state.hazards.filter(h => h.kind === 'boulder').length, 1, 'Earned hazard cannot be escaped by opening a modal');
  f.sim.update(0, f.state); assert.equal(f.sim.debug.state.hazards.filter(h => h.kind === 'boulder').length, 1);
});

test('paused geology from an abandoned attempt cannot arrive in its replacement', async () => {
  const f = await fresh(), overlay = f.ui.sheet({ title: 'Paused old hole' });
  f.bus.emit(EVENTS.CAVITY, { depth: 0, height: 1 });
  f.bus.emit(EVENTS.WATER_STRIKE, { depth: 0, flowLpm: 200 });
  f.sim.abortHole(); assert.equal(f.progression.abandonContract().ok, true);
  assert.equal(f.progression.acceptContract(generated(1)).ok, true); f.sim.startHole(f.state.contract);
  overlay.close(); f.sim.update(0, f.state);
  assert.equal(f.sim.debug.state.hazards.length, 0);
  assert.equal(f.sim.debug.state.externalGeology.water, false);
  assert.equal(f.sim.debug.state.externalGeology.cavity, false);
});

test('old confirmation cannot abandon a replaced attempt on returning to Site', async () => {
  const f = await fresh(); const waiting = f.site.leave();
  f.ui.show(SCENES.CONTRACTS);
  assert.equal(f.ui.overlays.length, 0, 'Navigation dismisses the old screen\'s confirmation');
  await waiting;
  f.sim.abortHole(); assert.equal(f.progression.abandonContract().ok, true);
  assert.equal(f.progression.acceptContract(generated(1)).ok, true); f.ui.mountSite(f.site); f.sim.startHole(f.state.contract);
  const book = career(f); f.buttons.find(b => b.label === 'Abandon contract').onTap(); await waiting;
  assert.equal(career(f), book); assert.equal(f.sim.active, true); assert.equal(f.state.scene, SCENES.SITE);
});

test('confirmed abandonment remains authoritative and does not resurrect on resume', async () => {
  const f = await fresh(), pending = f.site.leave(), money = f.state.player.money;
  f.buttons.find(b => b.label === 'Abandon contract').onTap(); await pending;
  assert.equal(f.sim.active, false); assert.equal(f.state.contract, null); assert.equal(f.progression.run, null);
  assert.equal(f.state.scene, SCENES.CONTRACTS); assert.equal(f.state.player.money, money);
  const before = physical(f); f.ui.mountSite(f.site); step(f); assert.equal(f.sim.active, false);
  assert.equal(f.sim.debug.state.timeSec, JSON.parse(before).timeSec);
});

test('a synchronous stop observer replacing the run defeats the old abandonment answer', async () => {
  const f = await fresh(); const pending = f.site.leave(); let replacement = null;
  const off = f.bus.on(EVENTS.DRILL_STOP, () => {
    if (replacement) return;
    assert.equal(f.progression.abandonContract().ok, true);
    assert.equal(f.progression.acceptContract(generated(1)).ok, true);
    f.sim.startHole(f.state.contract); replacement = career(f);
  });
  f.buttons.find(b => b.label === 'Abandon contract').onTap(); await pending; off();
  assert.ok(replacement); assert.equal(career(f), replacement); assert.equal(f.sim.active, true);
  assert.equal(f.state.scene, SCENES.SITE); assert.equal(f.app.navigations.length, 0);
  step(f); assert.ok(f.sim.debug.state.timeSec > 0);
});

test('UI disposal holds physics while a no-UI CPU simulation remains operable', async () => {
  const f = await fresh(); f.ui.disposeFixture(); const before = physical(f); step(f); assert.equal(physical(f), before);
  delete f.app.ctx.ui; step(f); assert.notEqual(physical(f), before);
});

let failed = 0;
console.warn = (...v) => diagnostics.push(v.map(String).join(' '));
console.error = (...v) => diagnostics.push(v.map(String).join(' '));
try {
  for (const { name, body } of cases) {
    try { await body(); console.log('PASS ' + name); }
    catch (e) { failed++; console.log('FAIL ' + name + '\n' + e.stack); }
  }
} finally {
  for (const f of contexts) { f.ui.disposeFixture(); f.sim.dispose(); f.progression.dispose(); }
  console.warn = warn; console.error = error;
  for (const [name, previous] of [['localStorage', savedStorage], ['document', savedDocument]]) {
    if (previous) Object.defineProperty(globalThis, name, previous); else delete globalThis[name];
  }
}
for (const p of paths) assert.equal(sha(readFileSync(new URL('../' + p, import.meta.url), 'utf8')), hashes[p], p + ' stable during review');
console.log(JSON.stringify({ passed: cases.length - failed, failed, sourceHashes: hashes,
  limits: 'Actual CPU modules and extracted callbacks; no native DOM, focus, GPU or audio measurement.', diagnostics }));
process.exitCode = failed ? 1 : 0;
