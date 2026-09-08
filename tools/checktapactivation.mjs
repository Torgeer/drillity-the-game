/** CPU-only event-contract checks against the actual shared tap implementation. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const componentsURL = new URL('../src/ui/components.js', import.meta.url);
let source = await readFile(componentsURL, 'utf8');
// Node has no PNG loader. Keep production component code intact, replacing
// only its artwork imports and resolving its real contract module absolutely.
source = source
  .replace("'../core/contract.js'", JSON.stringify(new URL('../src/core/contract.js', import.meta.url).href))
  .replace(/^import LOGO_FULL from .+;$/m, "const LOGO_FULL = 'test-logo-full';")
  .replace(/^import LOGO_WORDMARK from .+;$/m, "const LOGO_WORDMARK = 'test-logo-wordmark';");
const C = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

class Control extends EventTarget {
  constructor(tagName = 'BUTTON') {
    super(); this.tagName = tagName; this.attributes = new Map();
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name), remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
}
function dispatch(node, type, props = {}) {
  const event = new Event(type, { cancelable: true });
  for (const [key, value] of Object.entries(props)) Object.defineProperty(event, key, { value });
  node.dispatchEvent(event); return event;
}
function fixture(options = {}) {
  const node = new Control(options.tagName), calls = [], haptics = [];
  C.setHapticSink((pattern) => haptics.push(pattern));
  const dispose = C.tap(node, (event) => calls.push(event), options);
  const fire = (type, props) => dispatch(node, type, props);
  const pointer = (type, props = {}) => fire(type, { pointerId: 1, clientX: 10, clientY: 10, ...props });
  return { node, calls, haptics, dispose, fire, pointer };
}
let passed = 0;
function check(name, body) { body(); passed += 1; console.log(`PASS ${name}`); }

check('assistive activation without pointer or key events reaches the callback once', () => {
  const f = fixture({ pattern: 'heavy' });
  const event = f.fire('click', { detail: 0 });
  assert.deepEqual(f.calls, [event]); assert.deepEqual(f.haptics, ['heavy']);
  assert.equal(event.defaultPrevented, false); f.dispose();
});
check('separate assistive activations are not lost to a time-based debounce', () => {
  const f = fixture();
  f.fire('click', { detail: 0 }); f.fire('click', { detail: 0 });
  assert.equal(f.calls.length, 2); assert.equal(f.haptics.length, 2); f.dispose();
});
for (const pointerType of ['mouse', 'touch', 'pen']) {
  check(`${pointerType} up followed by its native click activates exactly once`, () => {
    const f = fixture();
    f.pointer('pointerdown', { pointerType });
    assert.equal(f.calls.length, 0); assert.equal(f.node.classList.contains('is-pressed'), true);
    f.pointer('pointerup', { pointerType }); f.fire('click', { detail: 1, pointerType });
    assert.equal(f.calls.length, 1); assert.equal(f.haptics.length, 1);
    assert.equal(f.node.classList.contains('is-pressed'), false); f.dispose();
  });
}
check('movement outside tap slop remains cancelled when the native click follows', () => {
  const f = fixture();
  f.pointer('pointerdown'); f.pointer('pointermove', { clientX: 23 });
  f.pointer('pointerup'); f.fire('click', { detail: 1 });
  assert.equal(f.calls.length, 0); assert.equal(f.haptics.length, 0); f.dispose();
});
for (const cancelType of ['pointercancel', 'lostpointercapture']) {
  check(`${cancelType} remains cancelled when up and click follow`, () => {
    const f = fixture(); f.pointer('pointerdown'); f.pointer(cancelType);
    f.pointer('pointerup'); f.fire('click', { detail: 1 });
    assert.equal(f.calls.length, 0); assert.equal(f.haptics.length, 0); f.dispose();
  });
}
check('another pointer cannot complete the active gesture', () => {
  const f = fixture(); f.pointer('pointerdown'); f.pointer('pointerup', { pointerId: 2 });
  assert.equal(f.calls.length, 0); f.pointer('pointerup'); assert.equal(f.calls.length, 1); f.dispose();
});
for (const key of ['Enter', ' ']) {
  check(`${JSON.stringify(key)} activates and prevents the native keyboard default`, () => {
    const f = fixture(); const event = f.fire('keydown', { key });
    assert.equal(event.defaultPrevented, true);
    // Browsers dispatch native keyboard activation as a default action. A
    // cancelled key must not be modelled as also producing that native click.
    if (!event.defaultPrevented) f.fire('click', { detail: 0 });
    assert.deepEqual(f.calls, [event]); assert.equal(f.haptics.length, 1); f.dispose();
  });
}
for (const kind of ['attribute', 'class']) {
  check(`${kind}-disabled controls reject assistive, keyboard and pointer activation`, () => {
    const f = fixture();
    if (kind === 'attribute') f.node.setAttribute('disabled', '');
    else f.node.classList.add('is-disabled');
    f.fire('click', { detail: 0 }); f.fire('keydown', { key: 'Enter' });
    f.pointer('pointerdown'); f.pointer('pointerup'); f.fire('click', { detail: 1 });
    assert.equal(f.calls.length, 0); assert.equal(f.haptics.length, 0); f.dispose();
  });
}
check('becoming disabled during a gesture prevents its completion', () => {
  const f = fixture(); f.pointer('pointerdown'); f.node.setAttribute('disabled', '');
  f.pointer('pointerup'); assert.equal(f.calls.length, 0);
  assert.equal(f.node.classList.contains('is-pressed'), false); f.dispose();
});
check('dispose removes all activation paths and clears an active pressed state', () => {
  const f = fixture(); f.pointer('pointerdown'); f.dispose(); f.dispose();
  assert.equal(f.node.classList.contains('is-pressed'), false);
  f.pointer('pointerup'); f.fire('click', { detail: 0 }); f.fire('keydown', { key: 'Enter' });
  assert.equal(f.calls.length, 0); assert.equal(f.haptics.length, 0);
});
check('custom controls remain keyboard-focusable without overriding an explicit tabindex', () => {
  const f = fixture({ tagName: 'DIV' }); assert.equal(f.node.getAttribute('tabindex'), '0'); f.dispose();
  const node = new Control('DIV'); node.setAttribute('tabindex', '-1');
  const dispose = C.tap(node, () => {}); assert.equal(node.getAttribute('tabindex'), '-1'); dispose();
});
console.log(`Shared tap activation: ${passed} checks passed (CPU event contract; no browser/AT certification).`);
