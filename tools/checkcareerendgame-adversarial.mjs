#!/usr/bin/env node
// Independent real Menu/Career factory and progression checks. Lightweight
// component sinks are not a browser DOM, layout, or accessibility-tree result.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAst } from 'rollup/parseAst';
import { createGameState, createBus, EVENTS, SCENES } from '../src/core/contract.js';
import { createProgression, SAVE_KEY } from '../src/game/progression.js';
import * as data from '../src/game/data.js';
import { createMenuScreen } from '../src/ui/screens/menu.js';
import { createCareerScreen } from '../src/ui/screens/career.js';
import { useGameData } from '../src/ui/screens/catalog.js';

let passed = 0, failed = 0;
const originalGlobals = Object.fromEntries(['window', 'document', 'localStorage', 'requestAnimationFrame']
  .map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
class Element {
  constructor(selector = 'div') {
    const [tag, ...classes] = selector.split('.');
    this.tag = tag; this.nodes = []; this.attrs = new Map(); this.classes = new Set(classes);
    this.handlers = new Map(); this.style = { setProperty() {} }; this.scrollTop = 0;
    this.classList = {
      add: (...v) => v.forEach(x => this.classes.add(x)),
      remove: (...v) => v.forEach(x => this.classes.delete(x)),
      contains: v => this.classes.has(v),
      toggle: (v, on = !this.classes.has(v)) => on ? this.classes.add(v) : this.classes.delete(v),
    };
  }
  set textContent(value) { this.nodes = [{ textContent: String(value) }]; }
  get textContent() { return this.nodes.map(n => n.textContent).join(''); }
  get children() { return this.nodes.filter(n => n instanceof Element); }
  get firstChild() { return this.nodes[0]; }
  appendChild(node) { if (node.tag === 'fragment') this.nodes.push(...node.nodes); else this.nodes.push(node); return node; }
  setAttribute(key, value) { this.attrs.set(key, String(value)); }
  getAttribute(key) { return this.attrs.get(key) ?? null; }
  removeAttribute(key) { this.attrs.delete(key); }
  addEventListener(key, callback) { this.handlers.set(key, [...(this.handlers.get(key) || []), callback]); }
  click() { for (const fn of this.handlers.get('click') || []) fn({ currentTarget: this, preventDefault() {} }); }
  matches(selector) {
    return selector[0] === '.' ? this.classes.has(selector.slice(1)) : this.tag === selector;
  }
  querySelectorAll(selector) {
    if (selector.endsWith(' > *')) return this.querySelector(selector.slice(0, -4))?.children || [];
    return this.children.flatMap(n => [...(n.matches(selector) ? [n] : []), ...n.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
function components() {
  function h(selector, ...children) {
    const el = new Element(selector);
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false) continue;
      if (child instanceof Element) el.appendChild(child);
      else if (typeof child === 'object') for (const [k, v] of Object.entries(child)) {
        if (k === 'text') el.textContent = v;
        else if (k === 'style') Object.assign(el.style, v);
        else el.setAttribute(k, v);
      }
      else el.appendChild({ textContent: String(child) });
    }
    return el;
  }
  return {
    h, s: h, Icon: () => h('i'), Wordmark: () => h('div'),
    clear: el => { el.nodes = []; }, append: (el, children) => children.filter(Boolean).forEach(c => el.appendChild(c)),
    tap: (el, fn) => el.addEventListener('click', fn), stagger() {},
    SectionTitle: (title, end) => h('h2', { text: title }, end),
    ScreenHeader: options => h('header', { text: options.title }),
    SpecRow: (name, value) => h('dl', h('dt', { text: name }), h('dd', { text: value })),
    Pill: label => h('span.pill', { text: label }),
    Card: (options, ...body) => h(`div.${options.class || 'card'}`, ...body),
    Empty: (title, copy) => h('p', { text: `${title} ${copy || ''}` }),
    NumberRoll: () => ({ to() {}, step() {}, setInstant() {} }),
    Button(options) { const el = h('button', { 'aria-label': options.label }, h('span.btn__label', { text: options.label }));
      el.addEventListener('click', options.onTap); return el; },
    Ring(options) { const el = h('div.ring', { 'aria-label': options.label }, options.center);
      return { el, setValue: value => { el.value = value; } }; },
    Bar(options) { const el = h('div.bar', { role: 'progressbar', 'aria-label': options.label }); el.value = options.value;
      return { el, setValue: value => { el.value = value; } }; },
  };
}

// Use the shell's actual XP bridge, including its fallback semantics, rather
// than approximating cumulative XP handling inside a test fixture.
const shellSource = readFileSync(new URL('../src/ui/shell.js', import.meta.url), 'utf8');
const nodes = [];
function walk(n) { if (!n || typeof n !== 'object') return; if (n.type) nodes.push(n);
  for (const v of Object.values(n)) if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') walk(v); }
walk(parseAst(shellSource));
function property(name) {
  const found = nodes.filter(n => n.type === 'Property' && n.key?.name === name);
  assert.equal(found.length, 1, `one actual shell ${name}`); return shellSource.slice(found[0].start, found[0].end);
}
const installBridge = new Function('ctx', 'app', `Object.assign(app, {${property('xpForLevel')},${property('xpProgress')}});`);

async function fixture() {
  const memory = new Map();
  globalThis.window = new EventTarget();
  globalThis.document = Object.assign(new EventTarget(), { visibilityState: 'visible', createDocumentFragment: () => new Element('fragment') });
  globalThis.requestAnimationFrame = () => 0;
  globalThis.localStorage = { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) };
  const state = createGameState(), bus = createBus(), ctx = { state, bus, game: data };
  const progression = createProgression(ctx); ctx.progression = progression; await progression.init();
  const navigation = [], notices = [];
  const app = { C: components(), state, bus, ctx, fmtMoney: v => String(v), reducedMotion: true,
    nav: scene => navigation.push(scene), toast: text => notices.push(text), haptic() {}, money: () => state.player.money,
    contracts: () => progression.getContracts(), skillTree: () => progression.getSkillTree(), confirm: async () => true };
  installBridge(ctx, app);
  const menu = createMenuScreen(app), career = createCareerScreen(app);
  const disconnect = [
    bus.on(EVENTS.XP_GAIN, p => { menu.onXP?.(p); career.onXP?.(p); }),
    bus.on(EVENTS.LEVEL_UP, p => { menu.onLevelUp?.(p); career.onLevelUp?.(p); }),
    bus.on(EVENTS.UNLOCK, p => { menu.onUnlock?.(p); career.onUnlock?.(p); }),
  ];
  const current = () => ({
    menu: menu.el, career: career.el,
    ring: menu.el.querySelector('.ring'), bar: career.el.querySelectorAll('.bar').find(n => n.getAttribute('aria-label') === 'Career level progress'),
    caption: career.el.querySelector('.rxp__head')?.textContent,
    level: menu.el.querySelector('.pcard__lvl')?.firstChild?.textContent,
  });
  const show = () => { menu.mount(); career.mount();
    const tab = career.el.querySelectorAll('button').find(n => n.textContent === 'Ladder'); assert.ok(tab); tab.click(); return current(); };
  return { state, bus, progression, ctx, memory, app, menu, career, navigation, notices, show, current,
    close() { disconnect.forEach(fn => fn()); menu.destroy(); career.destroy(); progression.dispose(); } };
}
async function test(name, body) {
  let f;
  try { f = await fixture(); await body(f); passed++; console.log(`PASS ${name}`); }
  catch (e) { failed++; console.error(`FAIL ${name}: ${e.stack}`); }
  finally { f?.close(); }
}
function capped(v) {
  assert.equal(v.level, String(data.MAX_LEVEL));
  assert.match(v.caption, new RegExp(`LVL ${data.MAX_LEVEL}Maximum level reached`));
  assert.equal(v.ring.value, 1); assert.equal(v.bar.value, 1);
  assert.equal(v.ring.getAttribute('aria-label'), `Level ${data.MAX_LEVEL}: maximum level reached`);
  assert.equal(v.bar.getAttribute('aria-valuetext'), `Level ${data.MAX_LEVEL}: maximum level reached`);
  assert.doesNotMatch(v.caption + v.ring.getAttribute('aria-label'), /0\s*\/\s*0|next level|NaN|Infinity/);
  assert.doesNotMatch(v.career.textContent + v.menu.textContent, /game complete|career complete|100% complete|all skills unlocked/i);
}
try {
  useGameData(data);
  await test('real final-point event delivery updates mounted level59 screens without remount', f => {
    f.progression.addXP(data.LEVELS.totalToMax - 1); f.show();
    assert.equal(f.current().level, '59'); f.progression.addXP(1);
    assert.equal(f.state.player.level, 60); capped(f.current());
  });
  await test('ordinary XP remains a partial published interval at early and final levels', f => {
    for (const level of [1, 2, 58, 59]) for (const part of [0, .5]) {
      const need = data.xpToNext(level), into = Math.floor(need * part);
      f.state.player.level = level; f.state.player.xp = data.LEVELS.cumulative[level - 1] + into;
      const v = f.show();
      assert.equal(v.level, String(level)); assert.match(v.caption, new RegExp(`${into} / ${need} XP$`));
      assert.equal(v.ring.value, into / need); assert.equal(v.bar.value, into / need);
      assert.equal(v.ring.getAttribute('aria-label'), 'Experience to next level');
    }
  });
  await test('XP beyond cap does not invent levels, points, or a next-level requirement', f => {
    f.progression.addXP(data.LEVELS.totalToMax); f.show(); const points = f.state.player.skillPoints;
    let levels = 0; f.bus.on(EVENTS.LEVEL_UP, () => levels++);
    f.progression.addXP(999999); assert.equal(f.state.player.level, 60);
    assert.equal(f.state.player.skillPoints, points); assert.equal(levels, 0); capped(f.current());
  });
  await test('stored level60 with starting XP cannot display unreachable next-level progress at60', f => {
    const payload = f.progression.serialise(); payload.player.level = 60; payload.player.xp = 0;
    f.memory.set(SAVE_KEY, JSON.stringify(payload)); assert.equal(f.progression.load(), true); const v = f.show();
    assert.equal(v.level, '1'); assert.match(v.caption, /^LVL 1/); assert.equal(v.ring.value, 0);
    assert.doesNotMatch(v.caption, /maximum level/i);
    assert.equal(f.state.player.level, 60, 'screen does not mutate saved progression');
  });
  await test('stored starting level with valid capped XP displays one consistent XP level', f => {
    const payload = f.progression.serialise(); payload.player.level = 1; payload.player.xp = data.LEVELS.totalToMax;
    f.memory.set(SAVE_KEY, JSON.stringify(payload)); assert.equal(f.progression.load(), true); capped(f.show());
    assert.equal(f.state.player.level, 1, 'readout does not award progression unlocks');
  });
  await test('unavailable curve remains explicitly unavailable and cannot claim cap completion', f => {
    f.ctx.game = {}; f.ctx.progression = null; f.state.player.level = 60; f.state.player.xp = 100;
    const v = f.show(); assert.equal(v.ring.getAttribute('aria-label'), 'Experience progress unavailable');
    assert.equal(v.bar.value, 0); assert.equal(v.bar.getAttribute('role'), null);
    assert.doesNotMatch(v.caption, /maximum level|0\s*\/\s*0|NaN|Infinity/i);
  });
  await test('missing and NaN player XP cannot manufacture a completed progression', f => {
    for (const xp of [undefined, null, NaN]) {
      f.state.player.xp = xp; f.state.player.level = 60; const v = f.show();
      assert.doesNotMatch(v.caption, /maximum level|NaN|Infinity|undefined/i);
      assert.match(v.caption, /XP unavailable/i, 'unknown XP total must not appear as earned zero XP');
      assert.ok(Number.isFinite(v.ring.value)); assert.ok(Number.isFinite(v.bar.value));
    }
  });
  await test('non-finite XP is unavailable rather than evidence of reaching the maximum', f => {
    f.state.player.xp = Infinity; f.state.player.level = 60; const v = f.show();
    assert.doesNotMatch(v.caption, /maximum level|Infinity|NaN/i);
    assert.match(v.caption, /XP unavailable/i);
    assert.notEqual(v.ring.getAttribute('aria-label'), 'Level 60: maximum level reached');
  });
  await test('malformed XP progress fields never leak NaN, Infinity, undefined or a false completion', f => {
    for (const xpp of [
      { level: NaN, into: NaN, need: NaN, frac: NaN },
      { level: undefined, into: undefined, need: undefined, frac: undefined },
      { level: Infinity, into: Infinity, need: 0, frac: 1 },
      { level: 10, into: 0, need: 0, frac: 1 },
      { level: 60, into: 1, need: 2, frac: .5 },
    ]) {
      f.app.xpProgress = () => xpp; const v = f.show();
      assert.doesNotMatch(v.caption + v.ring.getAttribute('aria-label'), /NaN|Infinity|undefined|maximum level/i);
      assert.equal(v.ring.getAttribute('aria-label'), 'Experience progress unavailable');
      assert.ok(Number.isFinite(v.ring.value)); assert.ok(Number.isFinite(v.bar.value));
    }
  });
  await test('cap retains actual skill spending and Menu access to contracts, Career and equipment', f => {
    f.progression.addXP(data.LEVELS.totalToMax); const view = f.show(); capped(view);
    for (const [label, scene] of [['Play', SCENES.CONTRACTS], ['Career', SCENES.CAREER], ['iMarket', SCENES.SHOP], ['Garage', SCENES.GARAGE]]) {
      const button = view.menu.querySelectorAll('button').find(n => n.getAttribute('aria-label') === label);
      assert.ok(button); button.click(); assert.equal(f.navigation.at(-1), scene);
    }
    f.career.el.querySelectorAll('button').find(n => n.textContent === 'Skills').click();
    const skill = f.progression.getSkillTree().skills.find(n => n.canBuy && n.branch === f.progression.getSkillTree().branches[0].id);
    assert.ok(skill, 'real first branch contains an available skill');
    const card = f.career.el.querySelectorAll('.node').find(n => n.getAttribute('aria-label')?.startsWith(`${skill.name}.`));
    assert.ok(card, `actual ${skill.name} node exists`); const before = f.state.player.skillPoints; card.click();
    assert.ok(f.state.player.skillPoints < before); assert.equal(f.state.player.skills[skill.id], 1);
    assert.ok(f.progression.getContracts().length >= 5);
    assert.ok(f.state.unlocked.rigs.length < data.RIGS.length); assert.ok(f.state.player.certs.length < data.CERTS.length);
  });
} finally {
  useGameData(null);
  for (const [key, descriptor] of Object.entries(originalGlobals)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
}
console.log(`Career endgame adversarial: ${passed} passed, ${failed} failed. CPU factory sinks only.`);
if (failed) process.exitCode = 1;
