#!/usr/bin/env node
// Independent CPU critic: import the full production component module (only
// image imports are placeholders), then dispatch actual registered handlers.
// This proves event-boundary behavior, not browser pointer routing or layout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { parseAst } from 'vite';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const hash = (s) => createHash('sha256').update(s).digest('hex');
const components = read('src/ui/components.js'), site = read('src/ui/screens/site.js');
class DomNode extends EventTarget {
  constructor(tag) {
    super(); this.tagName = tag.toUpperCase(); this.className = ''; this.children = [];
    this.attrs = new Map(); this.captures = new Set(); this.captureCalls = []; this.dataset = {};
    this.style = { setProperty() {} };
    this.classList = {
      contains: (s) => this.className.split(/\s+/).includes(s),
      add: (s) => { if (!this.classList.contains(s)) this.className += ' ' + s; },
      remove: (s) => { this.className = this.className.split(/\s+/).filter((x) => x !== s).join(' '); },
      toggle: (s, b) => b ? this.classList.add(s) : this.classList.remove(s),
    };
  }
  setAttribute(k, v) { this.attrs.set(k, String(v)); }
  getAttribute(k) { return this.attrs.get(k) ?? null; }
  hasAttribute(k) { return this.attrs.has(k); }
  appendChild(n) { this.children.push(n); return n; }
  getBoundingClientRect() { return { top: 10, height: 200 }; }
  setPointerCapture(id) { this.captures.add(id); this.captureCalls.push(['set', id]); }
  releasePointerCapture(id) { this.captures.delete(id); this.captureCalls.push(['release', id]); }
}
globalThis.Node = DomNode;
globalThis.document = {
  createElement: (tag) => new DomNode(tag),
  createTextNode: (text) => Object.assign(new DomNode('#text'), { textContent: text }),
};
let transformed = components.replace(/import (\w+) from '(\.\/assets\/[^']+)';/g, (_, name) => `const ${name}='image-placeholder';`);
transformed = transformed.replace(/from '(\.\.\/core\/contract\.js)'/, `from '${new URL('src/core/contract.js', root).href}'`);
const C = await import('data:text/javascript;base64,' + Buffer.from(transformed).toString('base64'));
const vibration = []; C.setHapticSink((v) => vibration.push(v));
const fire = (node, type, data) => {
  const e = Object.assign(new Event(type, { cancelable: true }), data); node.dispatchEvent(e); return e;
};
const key = (sl, name, shiftKey = false) => fire(sl.el, 'keydown', { key: name, shiftKey });
const track = (sl) => sl.el.children[1];
const ptr = (sl, type, id = 9, clientY = 60) => fire(track(sl), type, { pointerId: id, clientY });
function fixture(options = {}) {
  const changes = [], commits = [];
  const sl = C.VSlider({ label: 'Rotation', value: .5, onChange: (v) => changes.push(v), onCommit: (v) => commits.push(v), ...options });
  return { sl, changes, commits };
}
function findNodes(source, predicate) {
  const found = [];
  function visit(v) {
    if (!v || typeof v !== 'object') return;
    if (predicate(v)) found.push(v);
    for (const x of Object.values(v)) Array.isArray(x) ? x.forEach(visit) : visit(x);
  }
  visit(parseAst(source)); return found;
}
function fn(source, name) {
  const n = findNodes(source, (n) => n.type === 'FunctionDeclaration' && n.id?.name === name);
  assert.equal(n.length, 1, name); return source.slice(n[0].start, n[0].end);
}
const test = (name, run) => { run(); console.log('PASS ' + name); };

test('all six disabled keyboard commands, shifted and plain, stay silent', () => {
  const f = fixture({ disabled: true, disabledReason: 'no rotation drive' }); const h = vibration.length;
  for (const shift of [true, false]) for (const name of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']) {
    assert.equal(key(f.sl, name, shift).defaultPrevented, true);
  }
  assert.equal(f.sl.value, .5); assert.deepEqual(f.changes, []); assert.deepEqual(f.commits, []);
  assert.equal(vibration.length, h); assert.equal(f.sl.el.getAttribute('aria-disabled'), 'true');
  assert.equal(f.sl.el.getAttribute('tabindex'), '0');
});
test('disabled pointer events cannot start capture or commit, including foreign pointers', () => {
  const f = fixture({ disabled: true }); const h = vibration.length;
  for (const id of [9, 10]) for (const event of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) ptr(f.sl, event, id);
  assert.deepEqual(track(f.sl).captureCalls, []); assert.equal(f.sl.value, .5);
  assert.deepEqual(f.changes, []); assert.deepEqual(f.commits, []); assert.equal(vibration.length, h);
});
test('lock/unlock kills the old gesture and permits exactly one new gesture', () => {
  const f = fixture(); ptr(f.sl, 'pointerdown'); assert.deepEqual(f.changes, [.75]);
  f.sl.setDisabled(true, 'programme active'); f.sl.setDisabled(false);
  ptr(f.sl, 'pointermove', 9, 10); ptr(f.sl, 'pointerup'); ptr(f.sl, 'pointercancel');
  assert.deepEqual(f.changes, [.75]); assert.deepEqual(f.commits, []);
  assert.deepEqual(track(f.sl).captureCalls, [['set', 9], ['release', 9]]);
  ptr(f.sl, 'pointerdown', 10, 160); ptr(f.sl, 'pointerup', 10, 160);
  assert.deepEqual(f.changes, [.75, .25]); assert.deepEqual(f.commits, [.25]);
});
test('onChange reentrant lock and immediate unlock cannot leave a commit behind', () => {
  let sl; const commits = [], changes = [];
  sl = C.VSlider({ value: .5, onChange: (v) => { changes.push(v); sl.setDisabled(true); sl.setDisabled(false); }, onCommit: (v) => commits.push(v) });
  ptr(sl, 'pointerdown'); ptr(sl, 'pointerup'); assert.deepEqual(changes, [.75]); assert.deepEqual(commits, []);
  assert.equal(track(sl).captures.size, 0); assert.equal(sl.el.classList.contains('is-active'), false);
});
test('onChange disposal removes every input listener and pending commit', () => {
  let sl; const commits = [], changes = [];
  sl = C.VSlider({ value: .5, onChange: (v) => { changes.push(v); sl.dispose(); }, onCommit: (v) => commits.push(v) });
  ptr(sl, 'pointerdown'); ptr(sl, 'pointerup'); key(sl, 'End'); ptr(sl, 'pointerdown', 10, 10);
  assert.deepEqual(changes, [.75]); assert.deepEqual(commits, []); assert.equal(track(sl).captures.size, 0);
});
test('captured pointer release failure still clears the gesture and cannot late commit', () => {
  const f = fixture(); ptr(f.sl, 'pointerdown'); track(f.sl).releasePointerCapture = () => { throw Error('capture already released'); };
  f.sl.setDisabled(true); f.sl.setDisabled(false); ptr(f.sl, 'pointerup');
  assert.deepEqual(f.commits, []); assert.equal(f.sl.el.classList.contains('is-active'), false);
});
test('authoritative disabled refresh updates value and ARIA but no player callbacks', () => {
  const f = fixture({ disabled: true }); const h = vibration.length; f.sl.set(.31); key(f.sl, 'Home');
  assert.equal(f.sl.value, .31); assert.equal(f.sl.el.getAttribute('aria-valuenow'), '31');
  assert.deepEqual(f.changes, []); assert.deepEqual(f.commits, []); assert.equal(vibration.length, h);
});
test('current label survives reason changes and an eventual unlock', () => {
  const f = fixture(); f.sl.setDisabled(true, 'old reason'); f.sl.setLabel('Push rate — cone penetration');
  f.sl.setDisabled(true, 'new reason'); assert.equal(f.sl.el.getAttribute('aria-label'), 'Push rate — cone penetration — new reason');
  f.sl.setDisabled(false, 'must be ignored'); assert.equal(f.sl.el.getAttribute('aria-label'), 'Push rate — cone penetration');
  assert.equal(f.sl.el.getAttribute('aria-disabled'), 'false');
});
test('production telemetry wiring prevents actual site pushControl dispatch for CPT and SPT locks', () => {
  const calls = [], state = { drill: { wob: .5, rpm: .5, flush: .5 } };
  const ctx = { sim: { setControl: (...args) => calls.push(args) } };
  const declarations = findNodes(site, (n) => n.type === 'VariableDeclaration' && n.declarations.some((d) => ['feedSl', 'rotSl', 'flushSl'].includes(d.id?.name)));
  assert.equal(declarations.length, 3);
  const locks = findNodes(site, (n) => n.type === 'ExpressionStatement' && n.expression.callee?.name === 'setSliderLock' && n.expression.arguments[1]?.type === 'UnaryExpression');
  assert.equal(locks.length, 3);
  const controls = new Function('C', 'ctx', 'state', `${fn(site, 'pushControl')}\n${fn(site, 'setSliderLock')}\n${declarations.map((n) => site.slice(n.start, n.end)).join('\n')}\nreturn { all:[feedSl,rotSl,flushSl], update(prog) {const lockNote='programme reason'; ${locks.map((n) => site.slice(n.start, n.end)).join('\n')}} };`)(C, ctx, state);
  controls.update({ rotationLocked: true, flushLocked: true }); controls.all.forEach((sl) => key(sl, 'End'));
  assert.deepEqual(calls, [['wob', 1]]); assert.deepEqual(state.drill, { wob: 1, rpm: .5, flush: .5 }); calls.length = 0;
  controls.update({ feedLocked: true, driving: true }); controls.all.forEach((sl) => key(sl, 'Home'));
  assert.deepEqual(calls, [['rpm', 0], ['flush', 0]]); assert.equal(state.drill.wob, 1); calls.length = 0;
  controls.update({ feedLocked: true, driving: false }); key(controls.all[0], 'Home'); assert.deepEqual(calls, [['wob', 0]]);
});
assert.equal(hash(read('src/ui/components.js')), hash(components), 'component source changed during review');
assert.equal(hash(read('src/ui/screens/site.js')), hash(site), 'site source changed during review');
console.log(JSON.stringify({ verdict: 'PASS', cases: 9, scope: 'CPU actual registered handlers and production site dispatch; no browser routing/layout claim', componentsSha256: hash(components), siteSha256: hash(site) }, null, 2));
