#!/usr/bin/env node
/** CPU event-boundary gate. Runs the actual VSlider, DOM construction helpers
 * and site lock/label wiring parsed from source. The DOM double records native
 * events, pointer capture, values and accessibility attributes; this does not
 * claim browser layout, physical touch or assistive-technology acceptance.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parseAst } from 'vite';

assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--baseline'), 'Unknown arguments');
const root = new URL('../', import.meta.url);
const source = (path) => fs.readFileSync(new URL(path, root), 'utf8');
function nodes(code, predicate) {
  const found = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (predicate(node)) found.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') visit(value);
    }
  }
  visit(parseAst(code));
  return found;
}
function declaration(code, name) {
  const found = nodes(code, (node) => node.type === 'FunctionDeclaration' && node.id?.name === name);
  assert.equal(found.length, 1, `Expected one production ${name}`);
  return code.slice(found[0].start, found[0].end);
}

class Element extends EventTarget {
  constructor(tag = 'div') {
    super(); this.tagName = tag.toUpperCase(); this.children = []; this.attrs = new Map(); this.styles = new Map();
    this.className = ''; this.dataset = {}; this.captured = new Set(); this.released = [];
    this.style = { setProperty: (key, value) => this.styles.set(key, value) };
    this.classList = {
      contains: (name) => this.className.split(' ').includes(name),
      add: (name) => { if (!this.classList.contains(name)) this.className += ' ' + name; },
      remove: (name) => { this.className = this.className.split(' ').filter((x) => x !== name).join(' '); },
      toggle: (name, enabled) => enabled ? this.classList.add(name) : this.classList.remove(name),
    };
  }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  appendChild(child) { this.children.push(child); return child; }
  querySelector(selector) {
    for (const child of this.children) {
      if (child.classList?.contains(selector.slice(1))) return child;
      const match = child.querySelector?.(selector); if (match) return match;
    }
    return null;
  }
  getBoundingClientRect() { return { top: 0, height: 100 }; }
  setPointerCapture(id) { this.captured.add(id); }
  releasePointerCapture(id) { this.captured.delete(id); this.released.push(id); }
}
const document = { createElement: (tag) => new Element(tag), createTextNode: (text) => Object.assign(new Element('#text'), { textContent: text }) };
const haptics = [];
function loadSlider(code) {
  return new Function('Node', 'document', 'haptic', `
    const clamp01=(v)=>v<0?0:v>1?1:v;
    ${['h', 'append', 'VSlider'].map((name) => declaration(code, name)).join('\n')}
    return VSlider;
  `)(Element, document, (kind) => haptics.push(kind));
}
const fire = (target, type, props = {}) => {
  const event = Object.assign(new Event(type, { cancelable: true }), props);
  target.dispatchEvent(event); return event;
};
const key = (slider, name, shiftKey = false) => fire(slider.el, 'keydown', { key: name, shiftKey });
const pointer = (slider, type, y, id = 1) => fire(slider.el.querySelector('.vsl__track'), type, { clientY: y, pointerId: id });
const componentSource = source('src/ui/components.js');
const VSlider = loadSlider(componentSource);
function fixture(options = {}, make = VSlider) {
  const changes = [], commits = [];
  const slider = make({ label: 'Feed', short: 'FEED', value: .5, onChange: (v) => changes.push(v), onCommit: (v) => commits.push(v), ...options });
  return { slider, changes, commits };
}

if (process.argv.includes('--baseline')) {
  const baseline = execFileSync('git', ['show', 'HEAD:src/ui/components.js'], { cwd: root, encoding: 'utf8' });
  const { slider, changes } = fixture({}, loadSlider(baseline));
  // The shipping site applied only these two flags, leaving keyboard listeners live.
  slider.el.classList.add('is-locked'); slider.el.setAttribute('aria-disabled', 'true');
  key(slider, 'ArrowUp');
  assert.equal(changes.length, 1); assert.equal(slider.value, .55);
  console.log('REPRODUCED baseline: a visually/ARIA-locked slider emitted onChange and moved from 50 to 55.');
  process.exit(0);
}

const site = source('src/ui/screens/site.js');
const siteHelpers = ['setSliderLabel', 'setSliderLock'].map((name) => declaration(site, name)).join('\n');
const roleNodes = nodes(site, (node) => node.type === 'VariableDeclaration' && node.declarations.some((d) => d.id?.name === 'CONTROL_ROLE'));
assert.equal(roleNodes.length, 1);
const roleSource = site.slice(roleNodes[0].start, roleNodes[0].end);
const lockBlocks = nodes(site, (node) => node.type === 'BlockStatement' && node.body.some((n) => n.type === 'VariableDeclaration' && n.declarations.some((d) => d.id?.name === 'lockNote')));
assert.equal(lockBlocks.length, 1, 'One production telemetry lock block');
const lockStatements = lockBlocks[0].body.filter((n) => n.type === 'VariableDeclaration' && n.declarations.some((d) => d.id?.name === 'lockNote') || n.type === 'ExpressionStatement' && n.expression.callee?.name === 'setSliderLock');
assert.equal(lockStatements.length, 4, 'Actual note and all three slider lock calls must run');
const makeSite = new Function('feedSl', 'rotSl', 'flushSl', `${roleSource}\n${siteHelpers}
  return { setSliderLabel, setSliderLock, update: (prog) => { ${lockStatements.map((node) => site.slice(node.start, node.end)).join('\n')} } };
`);
const tests = [];
const test = (name, run) => tests.push({ name, run });

test('unlocked keyboard and pointer still emit changes and commit', () => {
  const f = fixture(); key(f.slider, 'ArrowUp'); assert.equal(f.slider.value, .55);
  pointer(f.slider, 'pointerdown', 25); pointer(f.slider, 'pointerup', 25);
  assert.deepEqual(f.changes, [.55, .75]); assert.deepEqual(f.commits, [.75]);
});
test('initially disabled sliders reject all movement keys, with and without Shift', () => {
  const f = fixture({ disabled: true, disabledReason: 'the hammer is the drive' });
  const beforeHaptics = haptics.length;
  for (const shift of [false, true]) for (const name of ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'Home', 'End']) assert.ok(key(f.slider, name, shift).defaultPrevented);
  assert.equal(f.slider.value, .5); assert.deepEqual(f.changes, []); assert.deepEqual(f.commits, []);
  assert.equal(haptics.length, beforeHaptics); assert.equal(f.slider.el.getAttribute('aria-disabled'), 'true');
  assert.match(f.slider.el.getAttribute('aria-label'), /the hammer is the drive/);
});
test('disabled pointer events cannot capture, activate, change or commit', () => {
  const f = fixture(); f.slider.setDisabled(true, 'fixed for this programme');
  const beforeHaptics = haptics.length;
  for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) pointer(f.slider, type, 0);
  assert.equal(f.slider.value, .5); assert.deepEqual(f.changes, []); assert.deepEqual(f.commits, []);
  assert.equal(f.slider.el.querySelector('.vsl__track').captured.size, 0);
  assert.equal(f.slider.el.classList.contains('is-active'), false); assert.equal(haptics.length, beforeHaptics);
});
test('locking during a captured drag cancels it without a late commit', () => {
  const f = fixture(); pointer(f.slider, 'pointerdown', 25, 7);
  const track = f.slider.el.querySelector('.vsl__track'); assert.ok(track.captured.has(7));
  f.slider.setDisabled(true, 'the hammer is the drive');
  assert.equal(track.captured.size, 0); assert.deepEqual(track.released, [7]);
  pointer(f.slider, 'pointermove', 0, 7); pointer(f.slider, 'pointerup', 0, 7);
  assert.equal(f.slider.value, .75); assert.deepEqual(f.changes, [.75]); assert.deepEqual(f.commits, []);
  assert.equal(f.slider.el.classList.contains('is-active'), false);
});
test('unlock requires a new drag and restores keyboard control', () => {
  const f = fixture(); pointer(f.slider, 'pointerdown', 25, 7);
  f.slider.setDisabled(true); f.slider.setDisabled(false);
  pointer(f.slider, 'pointermove', 0, 7); pointer(f.slider, 'pointerup', 0, 7);
  assert.equal(f.slider.value, .75); assert.deepEqual(f.commits, []);
  key(f.slider, 'Home'); pointer(f.slider, 'pointerdown', 20, 8); pointer(f.slider, 'pointerup', 20, 8);
  assert.equal(f.slider.value, .8); assert.deepEqual(f.commits, [.8]);
  assert.equal(f.slider.el.getAttribute('aria-disabled'), 'false');
});
test('authoritative value refresh remains silent while disabled', () => {
  const f = fixture({ disabled: true }); const beforeHaptics = haptics.length;
  f.slider.set(.2); assert.equal(f.slider.value, .2);
  assert.equal(f.slider.el.getAttribute('aria-valuenow'), '20');
  key(f.slider, 'End'); assert.equal(f.slider.value, .2);
  assert.deepEqual(f.changes, []); assert.equal(haptics.length, beforeHaptics);
});
test('unlock restores full current label and removes the stale reason', () => {
  const f = fixture(); const ui = makeSite(f.slider, fixture().slider, fixture().slider);
  const name = f.slider.el.querySelector('.vsl__name');
  ui.setSliderLabel(f.slider, name, ['Feed', 'FEED'], 'advance');
  const base = f.slider.el.getAttribute('aria-label');
  ui.setSliderLock(f.slider, true, 'the hammer is the drive'); assert.notEqual(f.slider.el.getAttribute('aria-label'), base);
  ui.setSliderLock(f.slider, false, ''); assert.equal(f.slider.el.getAttribute('aria-label'), base);
  ui.setSliderLock(f.slider, true, 'temporary lock');
  ui.setSliderLabel(f.slider, name, ['Push rate', 'PUSH', 'steady penetration'], 'advance');
  assert.equal(name.textContent, 'PUSH'); assert.match(f.slider.el.getAttribute('aria-label'), /Push rate.*temporary lock/);
  ui.setSliderLock(f.slider, false, ''); assert.equal(f.slider.el.getAttribute('aria-label'), 'Push rate — steady penetration');
});
test('production CPT wiring locks rotation and flush while feed stays live', () => {
  const feeds = [fixture(), fixture(), fixture()]; const ui = makeSite(...feeds.map((f) => f.slider));
  ui.update({ rotationLocked: true, flushLocked: true, lockNote: 'the cone does not turn' });
  for (const f of feeds) key(f.slider, 'End');
  assert.deepEqual(feeds.map((f) => f.slider.value), [1, .5, .5]);
  assert.deepEqual(feeds.map((f) => f.changes.length), [1, 0, 0]);
});
test('production SPT wiring locks feed only during drive and restores between tests', () => {
  const feeds = [fixture(), fixture(), fixture()]; const ui = makeSite(...feeds.map((f) => f.slider));
  ui.update({ feedLocked: true, driving: true, lockNote: 'the hammer is the drive' });
  for (const f of feeds) key(f.slider, 'End');
  assert.deepEqual(feeds.map((f) => f.slider.value), [.5, 1, 1]);
  ui.update({ feedLocked: true, driving: false, lockNote: 'the hammer is the drive' });
  key(feeds[0].slider, 'End'); assert.equal(feeds[0].slider.value, 1);
  assert.equal(feeds[0].slider.el.getAttribute('aria-label'), 'Feed');
});
test('a subsequent method with no programme releases every old lock', () => {
  const feeds = [fixture(), fixture(), fixture()]; const ui = makeSite(...feeds.map((f) => f.slider));
  ui.update({ rotationLocked: true, flushLocked: true }); ui.update(null);
  for (const f of feeds) key(f.slider, 'Home');
  assert.deepEqual(feeds.map((f) => f.slider.value), [0, 0, 0]);
  assert.deepEqual(feeds.map((f) => f.slider.disabled), [false, false, false]);
});
test('locking inside onChange also clears its active pointer immediately', () => {
  let slider; slider = VSlider({ value: .5, onChange: () => slider.setDisabled(true, 'drive started') });
  pointer(slider, 'pointerdown', 0, 2);
  assert.equal(slider.disabled, true); assert.equal(slider.el.querySelector('.vsl__track').captured.size, 0);
  pointer(slider, 'pointermove', 100, 2); assert.equal(slider.value, 1);
});
test('dispose removes key and pointer handlers and releases a live capture', () => {
  const f = fixture(); pointer(f.slider, 'pointerdown', 25, 4); f.slider.dispose();
  key(f.slider, 'Home'); pointer(f.slider, 'pointerdown', 100, 5); pointer(f.slider, 'pointerup', 100, 5);
  assert.equal(f.slider.value, .75); assert.deepEqual(f.changes, [.75]); assert.deepEqual(f.commits, []);
  assert.equal(f.slider.el.querySelector('.vsl__track').captured.size, 0);
});
for (const { name, run } of tests) { run(); console.log('PASS ' + name); }
console.log(`PASS locked controls: ${tests.length} production-handler cases; no browser or layout claim.`);
