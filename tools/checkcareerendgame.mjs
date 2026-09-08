#!/usr/bin/env node
/** CPU checks for the actual Menu/Career factories with actual progression and
 * data. Components are in-memory nodes: this proves copy, state and navigation,
 * not browser layout or assistive-technology output. No user save is touched. */
import assert from 'node:assert/strict';
import { createGameState, createBus, makeRandom, EVENTS, SCENES } from '../src/core/contract.js';
import { createProgression, SAVE_KEY, SAVE_BACKUP_KEY } from '../src/game/progression.js';
import * as data from '../src/game/data.js';
import { createMenuScreen } from '../src/ui/screens/menu.js';
import { createCareerScreen } from '../src/ui/screens/career.js';
import { useGameData } from '../src/ui/screens/catalog.js';

assert.equal(process.argv.length, 2, 'No unknown arguments');
const globals = Object.fromEntries(['localStorage', 'document', 'window'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
let passed = 0;

class Node {
  constructor(selector = 'div') {
    const [tag, ...classes] = selector.split('.');
    this.tag = tag; this.children = []; this.attrs = {}; this.listeners = {};
    this.classes = new Set(classes); this.style = { setProperty() {} };
    this.classList = {
      add: (...values) => values.forEach(v => this.classes.add(v)),
      remove: (...values) => values.forEach(v => this.classes.delete(v)),
      contains: value => this.classes.has(value),
      toggle: (value, flag) => { if (flag ?? !this.classes.has(value)) this.classes.add(value); else this.classes.delete(value); },
    };
  }
  appendChild(node) { this.children.push(node); return node; }
  get firstChild() { return this.children[0]; }
  set textContent(value) { this.children = [{ textContent: String(value) }]; }
  get textContent() { return this.children.map(c => c.textContent).join(' '); }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  removeAttribute(key) { delete this.attrs[key]; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  matches(selector) { return selector.startsWith('.') ? this.classes.has(selector.slice(1)) : this.tag === selector; }
  querySelectorAll(selector) {
    if (selector.includes(' > *')) return this.querySelector(selector.split(' > ')[0])?.children || [];
    const out = [];
    for (const child of this.children) if (child instanceof Node) {
      if (child.matches(selector)) out.push(child);
      out.push(...child.querySelectorAll(selector));
    }
    return out;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
function components() {
  function h(selector, ...parts) {
    const node = new Node(selector);
    for (const part of parts.flat(Infinity)) {
      if (part === null || part === undefined || part === false) continue;
      if (part instanceof Node) node.appendChild(part);
      else if (typeof part === 'object') {
        for (const [key, value] of Object.entries(part)) {
          if (key === 'text') node.textContent = value;
          else if (key === 'style') Object.assign(node.style, value);
          else node.setAttribute(key, value);
        }
      } else node.appendChild({ textContent: String(part) });
    }
    return node;
  }
  const C = {
    h, clear: node => { node.children = []; },
    append: (node, children) => children.filter(Boolean).forEach(c => node.appendChild(c)),
    tap: (node, handler) => node.addEventListener('click', handler),
    stagger() {}, Icon: () => h('i'), Wordmark: () => h('div.wordmark'),
    SectionTitle: (text, child) => h('h2', { text }, child),
    SpecRow: (name, value) => h('div.specrow', h('dt', { text: name }), h('dd', { text: value })),
    Pill: text => h('span.pill', { text }),
    Empty: (title, text) => h('div.empty', h('b', { text: title }), h('p', { text })),
    Card: (options, ...children) => h(`div.card.${options.class || ''}`, ...children),
    ScreenHeader: options => h('header', { text: options.title }),
    NumberRoll: () => ({ to() {}, step() {}, setInstant() {} }),
    Button(options) {
      const el = h('button.btn', { type: 'button', 'aria-label': options.label }, h('span.btn__label', { text: options.label }));
      el.addEventListener('click', options.onTap); return el;
    },
    Ring(options) {
      const el = h('div.ring', { 'aria-label': options.label }, options.center);
      return { el, setValue(value) { el.value = value; } };
    },
    Bar(options) {
      const el = h('div.bar', { role: 'progressbar', 'aria-label': options.label || 'meter' });
      el.value = options.value;
      return { el, setValue(value) { el.value = value; } };
    },
  };
  return C;
}

async function fixture(payloads = {}) {
  const stored = new Map(Object.entries(payloads));
  globalThis.localStorage = {
    getItem: k => stored.get(k) ?? null,
    setItem: (k, v) => stored.set(k, String(v)), removeItem: k => stored.delete(k),
  };
  globalThis.window = new EventTarget();
  globalThis.document = Object.assign(new EventTarget(), { visibilityState: 'visible', createDocumentFragment: () => new Node('fragment') });
  const state = createGameState(), bus = createBus();
  const progression = createProgression({ state, bus, rand: makeRandom(20260908) });
  await progression.init();
  const navigation = [];
  const app = {
    C: components(), state, bus, ctx: { progression, game: data }, fmtMoney: String,
    xpProgress: xp => data.xpProgress(Math.max(0, Number(xp) || 0)),
    nav: scene => navigation.push(scene), contracts: () => progression.getContracts(),
    toast() {}, haptic() {},
  };
  const menu = createMenuScreen(app), career = createCareerScreen(app);
  function render() {
    menu.mount(); career.mount();
    const ladder = career.el.querySelectorAll('button').find(b => b.textContent === 'Ladder');
    assert.ok(ladder, 'Actual Ladder tab exists'); ladder.listeners.click();
    return {
      menu: menu.el, career: career.el,
      caption: career.el.querySelector('.rxp__head').textContent,
      bar: career.el.querySelectorAll('.bar').find(b => b.attrs['aria-label'] === 'Career level progress'),
      ring: menu.el.querySelector('.ring'),
    };
  }
  return { state, bus, progression, stored, app, menu, career, navigation, render,
    close() { menu.destroy(); career.destroy(); progression.dispose(); } };
}
async function check(name, fn, payloads) {
  const f = await fixture(payloads);
  try { await fn(f); passed++; console.log(`PASS ${name}`); }
  finally { f.close(); }
}
function assertCapped(view) {
  assert.match(view.caption, new RegExp(`LVL ${data.MAX_LEVEL}`));
  assert.match(view.caption, /Maximum level reached/);
  assert.doesNotMatch(view.caption, /0\s*\/\s*0|NaN|Infinity/);
  assert.equal(view.bar.value, 1); assert.equal(view.ring.value, 1);
  assert.equal(view.bar.attrs['aria-valuetext'], `Level ${data.MAX_LEVEL}: maximum level reached`);
  assert.equal(view.ring.attrs['aria-label'], `Level ${data.MAX_LEVEL}: maximum level reached`);
  assert.match(view.menu.querySelector('.pcard__role').textContent, /Max level/);
  assert.match(view.career.textContent, /Contracts continue at the maximum level/);
  assert.doesNotMatch(view.career.textContent, /game complete|career complete|all skills unlocked|100% complete/i);
}

try {
  useGameData(data);
  await check('Level 59 retains the actual partial XP denominator', f => {
    f.progression.addXP(data.LEVELS.cumulative[58] + 17);
    assert.equal(f.state.player.level, 59);
    const v = f.render();
    assert.match(v.caption, new RegExp(`17 / ${data.xpToNext(59)} XP`));
    assert.ok(v.bar.value > 0 && v.bar.value < 1);
    assert.doesNotMatch(v.career.textContent, /maximum level/i);
    assert.doesNotMatch(v.menu.querySelector('.pcard__role').textContent, /Max level/);
    assert.equal(v.ring.attrs['aria-label'], 'Experience to next level');
  });
  await check('Last XP point promotes 59 to 60 and removes zero denominator', f => {
    f.progression.addXP(data.LEVELS.totalToMax - 1); f.render();
    f.progression.addXP(1); assert.equal(f.state.player.level, data.MAX_LEVEL);
    assertCapped(f.render());
  });
  await check('Mounted screens receive promotion events before stored level changes', f => {
    f.progression.addXP(data.LEVELS.totalToMax - 1); f.render();
    f.bus.on(EVENTS.XP_GAIN, () => f.menu.onXP());
    f.bus.on(EVENTS.LEVEL_UP, () => { f.menu.onLevelUp(); f.career.onLevelUp(); });
    f.progression.addXP(1);
    assert.equal(f.menu.el.querySelector('.pcard__lvl').firstChild.textContent, '60');
    assert.match(f.career.el.querySelector('.rxp__head').textContent, /LVL 60.*Maximum level reached/);
    assert.match(f.menu.el.querySelector('.pcard__role').textContent, /Contractor.*Max level/);
  });
  await check('Further XP keeps the cap without phantom levels or skill points', f => {
    f.progression.addXP(data.LEVELS.totalToMax);
    const beforePoints = f.state.player.skillPoints, events = [];
    f.bus.on(EVENTS.LEVEL_UP, p => events.push(p));
    f.progression.addXP(123456);
    assert.equal(f.state.player.xp, data.LEVELS.totalToMax + 123456);
    assert.equal(f.state.player.skillPoints, beforePoints); assert.equal(events.length, 0);
    assertCapped(f.render());
  });
  await check('Maximum level leaves real contracts, certificates and unspent skills available', f => {
    f.progression.addXP(data.LEVELS.totalToMax);
    const board = f.progression.getContracts(); assert.ok(board.length >= 5);
    assert.ok(board.every(c => data.getMethod(c.methodId)));
    const tree = f.progression.getSkillTree(); const available = tree.skills.find(s => s.canBuy);
    assert.ok(available, 'A real unpurchased skill can be bought at the cap');
    assert.equal(f.progression.spendSkillPoint(available.id).ok, true);
    assert.ok(f.state.player.certs.length < data.CERTS.length, 'Leveling did not award every certificate');
    assert.ok(f.state.unlocked.rigs.length < data.RIGS.length, 'Leveling did not buy every rig');
    assert.equal(f.state.unlocked.methods.length, data.METHODS.length);
    assert.ok(data.SKILLS.every(s => s.minLevel <= data.MAX_LEVEL));
    const view = f.render(); assertCapped(view);
    const play = view.menu.querySelectorAll('button').find(b => b.attrs['aria-label'] === 'Play');
    play.listeners.click(); assert.deepEqual(f.navigation, [SCENES.CONTRACTS]);
  });
  await check('Capped state persists and reloads with truthful UI', f => {
    f.progression.addXP(data.LEVELS.totalToMax); assert.equal(f.progression.save(), true);
    const saved = JSON.parse(f.stored.get(SAVE_KEY));
    assert.equal(saved.player.level, data.MAX_LEVEL);
    f.state.player.xp = 0; f.state.player.level = 1;
    assert.equal(f.progression.load(), true); assertCapped(f.render());
  });
  await check('Missing XP curve never announces completion', f => {
    f.app.xpProgress = () => ({ level: 60, into: 200, need: null, frac: null });
    f.state.player.level = 60;
    const v = f.render(); assert.match(v.caption, /200 XP/);
    assert.equal(v.ring.attrs['aria-label'], 'Experience progress unavailable');
    assert.equal(v.bar.value, 0); assert.equal(v.bar.attrs.role, undefined);
    assert.doesNotMatch(v.career.textContent, /maximum level/i);
  });
  await check('Stored level alone cannot falsely mark XP progression complete', f => {
    const payload = f.progression.serialise(); payload.player.level = 60; payload.player.xp = 0;
    f.stored.set(SAVE_KEY, JSON.stringify(payload)); assert.equal(f.progression.load(), true);
    const v = f.render(); assert.doesNotMatch(v.caption, /maximum level/i);
    assert.match(v.caption, /LVL 1 /);
    assert.equal(v.menu.querySelector('.pcard__lvl').firstChild.textContent, '1');
    assert.equal(v.bar.value, 0); assert.equal(v.ring.attrs['aria-label'], 'Experience to next level');
  });
  await check('Malformed primary uses valid capped backup', f => {
    f.progression.addXP(data.LEVELS.totalToMax);
    f.stored.set(SAVE_BACKUP_KEY, JSON.stringify(f.progression.serialise()));
    f.stored.set(SAVE_KEY, '{truncated');
    f.state.player.level = 1; f.state.player.xp = 0;
    assert.equal(f.progression.load(), true); assertCapped(f.render());
  });
  await check('Two malformed saves leave a playable uncapped starter', f => {
    assert.equal(f.state.player.level, 1); const v = f.render();
    assert.doesNotMatch(v.caption, /maximum level|0\s*\/\s*0|NaN|Infinity/i);
    assert.equal(v.ring.value, 0); assert.ok(f.progression.getContracts().length > 0);
  }, { [SAVE_KEY]: '{truncated', [SAVE_BACKUP_KEY]: '{also truncated' });
  console.log(`Career endgame: ${passed} groups passed. CPU only; layout and browser output unverified.`);
} finally {
  useGameData(null);
  for (const [key, descriptor] of Object.entries(globals)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
}
