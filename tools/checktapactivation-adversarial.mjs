#!/usr/bin/env node
/** Independent CPU event-sequence checks against the complete component module.
 * Only image imports and the contract import URL are adapted for Node. This is
 * not browser-default or screen-reader evidence; the native keyboard default is
 * represented explicitly below and must also be checked in a real browser.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

assert.equal(process.argv.length, 2, 'No options or silently ignored arguments');
const sourceURL = new URL('../src/ui/components.js', import.meta.url);
const original = readFileSync(sourceURL, 'utf8');
const sha = s => createHash('sha256').update(s).digest('hex');
const before = sha(original);
let moduleSource = original;
for (const [from, to] of [
  ["'../core/contract.js'", JSON.stringify(new URL('../src/core/contract.js', import.meta.url).href)],
  ["import LOGO_FULL from './assets/logo-full.png';", "const LOGO_FULL = 'fixture-image';"],
  ["import LOGO_WORDMARK from './assets/logo-wordmark.png';", "const LOGO_WORDMARK = 'fixture-image';"],
]) {
  assert.equal(moduleSource.split(from).length, 2, `Unique module adapter: ${from}`);
  moduleSource = moduleSource.replace(from, to);
}
const { tap, setHapticSink } = await import('data:text/javascript;base64,' + Buffer.from(moduleSource).toString('base64'));

class TapTarget extends EventTarget {
  constructor(tag = 'BUTTON') {
    super(); this.tagName = tag; this.attrs = new Map(); this.classes = new Set();
    this.classList = {
      add: n => this.classes.add(n), remove: n => this.classes.delete(n),
      contains: n => this.classes.has(n),
    };
  }
  hasAttribute(n) { return this.attrs.has(n); }
  setAttribute(n, v) { this.attrs.set(n, String(v)); }
  removeAttribute(n) { this.attrs.delete(n); }
}
function dispatch(node, type, fields = {}) {
  const e = new Event(type, { cancelable: true });
  Object.assign(e, fields); node.dispatchEvent(e); return e;
}
const point = (node, type, fields = {}) => dispatch(node, type,
  { pointerId: 7, pointerType: 'touch', button: 0, clientX: 30, clientY: 30, ...fields });
const click = (node, detail = 0) => dispatch(node, 'click', { detail });
function fixture(tag, opts) {
  const node = new TapTarget(tag), calls = [], haptics = [];
  setHapticSink(pattern => haptics.push(pattern));
  const dispose = tap(node, e => calls.push({ type: e.type, currentTarget: e.currentTarget }), opts);
  return { node, calls, haptics, dispose };
}
function count(f, n) {
  assert.equal(f.calls.length, n, 'Exactly one callback per accepted activation');
  assert.equal(f.haptics.length, n, 'Exactly one haptic per accepted activation');
  assert.ok(f.calls.every(e => e.currentTarget === f.node), 'Original event remains current');
}
const cases = [];
function test(name, fn) { cases.push([name, fn]); }

test('assistive native click works on native and custom controls', () => {
  for (const tag of ['BUTTON', 'DIV']) {
    const f = fixture(tag, { pattern: 'heavy' }); click(f.node); count(f, 1);
    assert.deepEqual(f.haptics, ['heavy']); assert.equal(f.calls[0].type, 'click'); f.dispose();
  }
});
test('pointer release plus browser click produces one action', () => {
  for (const pointerType of ['mouse', 'touch', 'pen']) {
    const f = fixture(); point(f.node, 'pointerdown', { pointerType });
    point(f.node, 'pointerup', { pointerType }); click(f.node, 1); count(f, 1); f.dispose();
  }
});
test('two genuine pointer activations are not swallowed by duplicate protection', () => {
  const f = fixture();
  for (const detail of [1, 2]) {
    point(f.node, 'pointerdown'); point(f.node, 'pointerup'); click(f.node, detail);
  }
  count(f, 2); f.dispose();
});
test('assistive activation directly after pointer or keyboard remains independent', () => {
  const f = fixture(); point(f.node, 'pointerdown'); point(f.node, 'pointerup'); click(f.node, 1);
  click(f.node); dispatch(f.node, 'keydown', { key: 'Enter' }); click(f.node); count(f, 4); f.dispose();
});
test('keyboard default prevention avoids native duplicate and keeps custom Enter/Space', () => {
  for (const tag of ['BUTTON', 'DIV']) for (const key of ['Enter', ' ']) {
    const f = fixture(tag), down = dispatch(f.node, 'keydown', { key, repeat: false });
    dispatch(f.node, 'keyup', { key });
    // Model the native default only if the actual listener did not cancel it.
    // Real-browser verification is still required; Node cannot synthesize it.
    if (tag === 'BUTTON' && !down.defaultPrevented) click(f.node);
    count(f, 1); f.dispose();
  }
});
test('unrelated keys do not activate or cancel their defaults', () => {
  const f = fixture();
  for (const key of ['Tab', 'Escape', 'ArrowDown', 'a']) {
    assert.equal(dispatch(f.node, 'keydown', { key }).defaultPrevented, false);
  }
  count(f, 0); f.dispose();
});
test('both existing disabled representations block pointer, keyboard and native click', () => {
  for (const disabled of ['attribute', 'class']) {
    const f = fixture();
    if (disabled === 'attribute') f.node.setAttribute('disabled', '');
    else f.node.classList.add('is-disabled');
    point(f.node, 'pointerdown'); point(f.node, 'pointerup'); click(f.node, 1);
    click(f.node); dispatch(f.node, 'keydown', { key: 'Enter' }); dispatch(f.node, 'keydown', { key: ' ' });
    count(f, 0); assert.equal(f.node.classList.contains('is-pressed'), false); f.dispose();
  }
});
test('becoming disabled during the gesture suppresses release and click', () => {
  const f = fixture(); point(f.node, 'pointerdown'); f.node.setAttribute('disabled', '');
  point(f.node, 'pointerup'); click(f.node, 1); click(f.node); count(f, 0);
  assert.equal(f.node.classList.contains('is-pressed'), false);
  f.node.removeAttribute('disabled'); click(f.node); count(f, 1); f.dispose();
});
test('movement cancellation remains cancelled through browser click', () => {
  for (const offset of [{ clientX: 43 }, { clientY: 43 }]) {
    const f = fixture(); point(f.node, 'pointerdown'); point(f.node, 'pointermove', offset);
    point(f.node, 'pointermove'); point(f.node, 'pointerup'); click(f.node, 1); count(f, 0);
    assert.equal(f.node.classList.contains('is-pressed'), false); f.dispose();
  }
});
test('pointer cancellation and capture loss are not resurrected by a trailing click', () => {
  for (const cancel of ['pointercancel', 'lostpointercapture']) {
    const f = fixture(); point(f.node, 'pointerdown'); point(f.node, cancel);
    point(f.node, 'pointerup'); click(f.node, 1); count(f, 0);
    point(f.node, 'pointerdown'); point(f.node, 'pointerup'); click(f.node, 1); count(f, 1); f.dispose();
  }
});
test('another pointer cannot release or cancel the active gesture', () => {
  const f = fixture(); point(f.node, 'pointerdown');
  for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'lostpointercapture']) {
    point(f.node, type, { pointerId: 8 });
  }
  count(f, 0); point(f.node, 'pointerup'); click(f.node, 1); count(f, 1); f.dispose();
});
test('disposing while pressed removes every activation path and clears transient state', () => {
  const f = fixture(); point(f.node, 'pointerdown'); assert.equal(f.node.classList.contains('is-pressed'), true);
  f.dispose(); f.dispose(); assert.equal(f.node.classList.contains('is-pressed'), false);
  point(f.node, 'pointerup'); click(f.node, 1); click(f.node);
  dispatch(f.node, 'keydown', { key: 'Enter' }); dispatch(f.node, 'keydown', { key: ' ' }); count(f, 0);
});
test('an existing custom tab order is preserved', () => {
  const node = new TapTarget('DIV'); node.setAttribute('tabindex', '-1');
  const dispose = tap(node, () => {}); assert.equal(node.attrs.get('tabindex'), '-1'); dispose();
});

let failures = 0;
try {
  for (const [name, fn] of cases) {
    try { fn(); console.log(`PASS ${name}`); }
    catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
  }
} finally {
  setHapticSink(null);
  assert.equal(sha(readFileSync(sourceURL, 'utf8')), before, 'Production component source did not change during checks');
}
console.log(`Native activation critic: ${cases.length - failures}/${cases.length} CPU cases passed; components SHA256 ${before}`);
if (failures) process.exitCode = 1;
