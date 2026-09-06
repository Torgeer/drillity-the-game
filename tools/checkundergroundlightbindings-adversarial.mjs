/** CPU-only adversarial work-light consumer checks. No GL, server or model writes.
 * --baseline loads env.js from beedaaf, with current read-only actual GLBs.
 * Synthetic mutations below are NOT SOURCED fixtures, never machine dimensions.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createBus, EVENTS, QUALITY } from '../src/core/contract.js';
import { RIGS, METHODS } from '../src/game/data.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const baseline = process.argv.includes('--baseline');
let source = baseline
  ? execFileSync('git', ['show', 'beedaaf:src/core/env.js'], { cwd: root, encoding: 'utf8' })
  : readFileSync(new URL('../src/core/env.js', import.meta.url), 'utf8');
const sourceHash = createHash('sha256').update(source).digest('hex');
for (const path of ['three', 'three/examples/jsm/objects/Sky.js', './contract.js']) {
  source = source.replace(`from '${path}'`, `from '${path === './contract.js'
    ? new URL('../src/core/contract.js', import.meta.url).href : import.meta.resolve(path)}'`);
}
const { createEnvironment } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const original = { document: globalThis.document, fetch: globalThis.fetch,
  warn: console.warn, error: console.error, info: console.info };
const records = [], diagnostics = [], systems = [], hashes = {};
let assertions = 0;
const check = (actual, expected, message) => { assertions++; assert.deepEqual(actual, expected, message); };
const near = (actual, expected, message) => {
  assertions++;
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) < 1e-7,
    `${message}: got ${actual}, wanted ${expected}`);
};
const position = (node) => node.getWorldPosition(new THREE.Vector3()).toArray();
const samePosition = (light, node, label) => {
  const wanted = position(node);
  position(light).forEach((x, i) => near(x, wanted[i], `${label}/${i}`));
};
const material = new THREE.MeshStandardMaterial();
material.name = 'rawSteel';
let runtime;

async function test(name, fn) {
  const start = diagnostics.length;
  try { await fn(); records.push({ name, pass: true, diagnostics: diagnostics.slice(start) }); }
  catch (error) { records.push({ name, pass: false, error: error.message, diagnostics: diagnostics.slice(start) }); }
}

async function setup(id = 'raisebore', method = 'raise-boring', quality = QUALITY.MEDIUM, loader = runtime, strict = true) {
  const ctx = { THREE, EVENTS, quality, data: { RIGS, METHODS }, qs: new URLSearchParams(strict ? 'glb=strict' : ''),
    scene: new THREE.Scene(), sectionScene: new THREE.Scene(), bus: createBus(),
    state: { garage: { rigId: id }, world: { regionId: 'nordic', site: { methodId: method } },
      contract: { methodId: method }, settings: {}, drill: { active: false, depth: 0 } },
    assets: { material: () => material }, gltfRigs: loader };
  ctx.rig = createRigSystem(ctx);
  systems.push(ctx);
  await ctx.rig.init();
  ctx.env = createEnvironment(ctx);
  await ctx.env.init();
  ctx.env.update(0, ctx.state);
  return ctx;
}
const flood = (ctx, side = 'L') => ctx.scene.getObjectByName(`ugFlood${side}`);
const lamp = (ctx, name) => {
  const found = ctx.rig.getWorkLights().find(x => x.name === name);
  assert.ok(found, `actual rig must publish ${name}`);
  return found;
};
function set(ctx, id, method) {
  check(ctx.rig.setRig(id), true, `real public selection accepts ${id}`);
  ctx.state.garage.rigId = id;
  ctx.state.contract.methodId = method;
  ctx.state.world.site.methodId = method;
  ctx.rig.setMethod(method);
}
function bound(ctx, side, name) {
  const light = flood(ctx, side), src = lamp(ctx, name);
  check(!!light, true, `flood ${side} exists`);
  samePosition(light, src.node, `${name} mount`);
  samePosition(light.target, src.aim, `${name} aim`);
}
function diagnosed(start, text) {
  check(diagnostics.slice(start).some(x => x.startsWith('[env]') && (!text || x.includes(text))), true,
    'an invalid binding must remain diagnosed');
}

try {
  globalThis.document = { baseURI: 'https://underground-adversarial.invalid/' };
  globalThis.fetch = async (url) => {
    const path = new URL(url);
    assert.equal(path.origin, 'https://underground-adversarial.invalid');
    const match = /^\/models\/(raisebore|tunnel-jumbo|longhole-rig|bolter)\.glb$/.exec(path.pathname);
    assert.ok(match, `unexpected model read ${url}`);
    const binary = readFileSync(new URL(`../public/models/${match[1]}.glb`, import.meta.url));
    hashes[match[1]] = createHash('sha256').update(binary).digest('hex');
    return new Response(binary);
  };
  console.warn = console.error = console.info = (...args) => diagnostics.push(args.join(' '));
  runtime = createGltfRigs({ THREE, data: { RIGS, METHODS }, qs: new URLSearchParams('glb=strict'), assets: { material: () => material } });
  for (const id of ['raisebore', 'tunnel-jumbo', 'longhole-rig', 'bolter']) await runtime.load(id);

  await test('actual default raisebore mount, aim and lamp characteristics', async () => {
    const ctx = await setup();
    for (const [side, name] of [['L', 'table-work-light'], ['R', 'feed-work-light']]) {
      bound(ctx, side, name);
      near(flood(ctx, side).angle, THREE.MathUtils.degToRad(lamp(ctx, name).coneDeg) / 2, 'sourced cone');
      near(flood(ctx, side).distance, lamp(ctx, name).rangeM * 1.8, 'existing range multiplier');
      check(flood(ctx, side).color.getHex(), lamp(ctx, name).colourHex, 'authored lamp colour');
    }
  });
  await test('direct public setRig refreshes cached work-light array for steady frames', async () => {
    const ctx = await setup();
    const start = diagnostics.length;
    set(ctx, 'tunnel-jumbo', 'tunnel-jumbo');
    for (let i = 0; i < 3; i++) ctx.env.update(0, ctx.state);
    bound(ctx, 'L', 'boom-l-lamp-0');
    bound(ctx, 'R', 'boom-r-lamp-0');
    check(diagnostics.slice(start).filter(x => x.startsWith('[env]')), [], 'valid direct swap produces no missing-lamp warnings');
  });
  await test('cached A to B to A switches preserve actual node ownership', async () => {
    const ctx = await setup();
    const originalNode = lamp(ctx, 'table-work-light').node;
    for (const [id, method, side, name] of [['tunnel-jumbo', 'tunnel-jumbo', 'L', 'boom-l-lamp-0'],
      ['raisebore', 'raise-boring', 'R', 'feed-work-light'], ['raisebore', 'raise-boring', 'L', 'table-work-light']]) {
      set(ctx, id, method); ctx.env.update(0, ctx.state); bound(ctx, side, name);
    }
    check(lamp(ctx, 'table-work-light').node, originalNode, 'return selection uses actual cached instance');
  });
  await test('method-first transition recovers after coherent real rig selection', async () => {
    const ctx = await setup();
    ctx.state.contract.methodId = ctx.state.world.site.methodId = 'tunnel-jumbo';
    ctx.env.update(0, ctx.state); // deliberately incoherent intermediate fixture state
    const start = diagnostics.length;
    set(ctx, 'tunnel-jumbo', 'tunnel-jumbo');
    for (let i = 0; i < 3; i++) ctx.env.update(0, ctx.state);
    bound(ctx, 'L', 'boom-l-lamp-0'); bound(ctx, 'R', 'boom-r-lamp-0');
    check(diagnostics.slice(start).filter(x => x.startsWith('[env]')), [], 'coherent final state recovers');
  });
  await test('late actual GLB ready event replaces procedural array for same requested id', async () => {
    let ready = false;
    const delayed = { has: id => ready && runtime.has(id), loaded: () => ready ? runtime.loaded() : [],
      builder: id => ready ? runtime.builder(id) : null };
    const ctx = await setup('tunnel-jumbo', 'tunnel-jumbo', QUALITY.MEDIUM, delayed, false);
    check(ctx.rig.getSpec().source, 'procedural', 'test must first display actual procedural builder');
    const before = ctx.rig.getWorkLights();
    ready = true;
    ctx.bus.emit('rig:model-ready', { rigId: 'tunnel-jumbo' });
    check(ctx.rig.getSpec().source, 'glb', 'ready event must display actual GLB builder');
    check(ctx.rig.getWorkLights() === before, false, 'model-ready truly changes the published array');
    ctx.env.update(0, ctx.state);
    bound(ctx, 'L', 'boom-l-lamp-0'); bound(ctx, 'R', 'boom-r-lamp-0');
  });
  for (const [id, name] of [['bolter', 'feed-work-light'], ['longhole-rig', 'feed-head'], ['tunnel-jumbo', 'boom-l-lamp-0']]) {
    await test(`rockbolt accepted ${id} selects work lamp rather than traversal ordinal`, async () => {
      check(METHODS.find(x => x.id === 'rockbolt').rigIds.includes(id), true, 'alternative comes from live method data');
      const start = diagnostics.length;
      const ctx = await setup(id, 'rockbolt');
      bound(ctx, 'L', name);
      check(diagnostics.slice(start).filter(x => x.startsWith('[env]')), [], 'supported contract has no missing-lamp warning');
    });
  }
  await test('same rockbolt method changes actual rig while preserving platform fill', async () => {
    const ctx = await setup('bolter', 'rockbolt');
    const platform = { pos: position(flood(ctx, 'R')), target: position(flood(ctx, 'R').target),
      colour: flood(ctx, 'R').color.getHex(), intensity: flood(ctx, 'R').intensity };
    set(ctx, 'tunnel-jumbo', 'rockbolt'); ctx.env.update(0, ctx.state);
    bound(ctx, 'L', 'boom-l-lamp-0');
    check(position(flood(ctx, 'R')), platform.pos, 'rockbolt platform position unchanged');
    check(position(flood(ctx, 'R').target), platform.target, 'rockbolt platform aim unchanged');
    check(flood(ctx, 'R').color.getHex(), platform.colour, 'rockbolt platform colour unchanged');
    near(flood(ctx, 'R').intensity, platform.intensity, 'rockbolt platform power unchanged');
  });
  await test('default longhole method uses moving feed head', async () => {
    const ctx = await setup('longhole-rig', 'longhole');
    bound(ctx, 'L', 'feed-head');
  });
  await test('live changed mount and aim parent poses are read after initial binding', async () => {
    const ctx = await setup();
    const src = lamp(ctx, 'feed-work-light');
    const before = position(src.node);
    src.node.parent.position.x += 2; // synthetic perturbation, NOT SOURCED
    src.node.parent.rotation.z += 0.3;
    ctx.rig.group.position.set(2, 3, -4);
    ctx.env.update(0, ctx.state);
    check(position(src.node).some((x, i) => Math.abs(x - before[i]) > 1e-4), true, 'pose mutation really moves lamp');
    bound(ctx, 'R', 'feed-work-light');
  });
  await test('zero world mount position is a valid coordinate', async () => {
    const ctx = await setup();
    const src = lamp(ctx, 'table-work-light');
    ctx.scene.attach(src.node);
    src.node.position.set(0, 0, 0);
    ctx.env.update(0, ctx.state);
    bound(ctx, 'L', 'table-work-light');
  });
  for (const mutation of ['missing', 'duplicate', 'missing-aim', 'nonfinite', 'coincident']) {
    await test(`${mutation} required lamp is diagnosed and never falls through to a different ordinal`, async () => {
      const ctx = await setup('tunnel-jumbo', 'tunnel-jumbo');
      const list = ctx.rig.getWorkLights();
      const src = lamp(ctx, 'boom-l-lamp-0');
      const start = diagnostics.length;
      if (mutation === 'missing') list.splice(list.indexOf(src), 1);
      if (mutation === 'duplicate') list.push({ ...src, node: src.node.clone() });
      if (mutation === 'missing-aim') src.aim = null;
      if (mutation === 'nonfinite') src.node.position.x = NaN;
      if (mutation === 'coincident') {
        ctx.scene.attach(src.aim); src.aim.position.copy(src.node.getWorldPosition(new THREE.Vector3()));
      }
      ctx.env.update(0, ctx.state);
      diagnosed(start);
      check(position(flood(ctx)).every(Number.isFinite), true, 'invalid data cannot poison spotlight transforms');
      const ordinal = list[0];
      check(position(flood(ctx)).some((x, i) => Math.abs(x - position(ordinal.node)[i]) > 1e-5), true,
        'unrelated first tramming lamp must not receive the key');
    });
  }
  await test('repaired invalid lamp resumes live binding and authored optics', async () => {
    const ctx = await setup();
    const src = lamp(ctx, 'feed-work-light');
    const aim = src.aim;
    src.aim = null; ctx.env.update(0, ctx.state);
    src.aim = aim; ctx.env.update(0, ctx.state);
    bound(ctx, 'R', 'feed-work-light');
    near(flood(ctx, 'R').angle, THREE.MathUtils.degToRad(src.coneDeg) / 2, 'recovered sourced cone');
    near(flood(ctx, 'R').distance, src.rangeM * 1.8, 'recovered range');
  });
  await test('failed source restores authored position aim cone range colour and watt scaling', async () => {
    const ctx = await setup();
    ctx.env.setUnderground(null); ctx.env.setUnderground('raise-boring');
    const snapshot = () => ({ pos: position(flood(ctx, 'R')), target: position(flood(ctx, 'R').target),
      cone: flood(ctx, 'R').angle, distance: flood(ctx, 'R').distance,
      colour: flood(ctx, 'R').color.getHex(), intensity: flood(ctx, 'R').intensity });
    const fallback = snapshot();
    const src = lamp(ctx, 'feed-work-light');
    ctx.env.update(0, ctx.state);
    check(snapshot().cone === fallback.cone, false, 'valid binding really replaces authored cone');
    src.aim = null; ctx.env.update(0, ctx.state);
    check(snapshot(), fallback, 'unbound lamp cannot retain previous source optics or transform');
  });
  for (const metadata of [undefined, [], ['raise-boring', 'rockbolt']]) {
    await test(`invalid active method metadata ${JSON.stringify(metadata)} rejects ambiguous source`, async () => {
      const ctx = await setup();
      const spec = ctx.rig.getSpec();
      ctx.rig.getSpec = () => ({ ...spec, methods: metadata });
      const start = diagnostics.length;
      ctx.env.update(0, ctx.state);
      diagnosed(start);
      const actual = position(lamp(ctx, 'table-work-light').node);
      check(position(flood(ctx)).some((x, i) => Math.abs(x - actual[i]) > 1e-5), true,
        'missing or ambiguous profile must not retain bound source');
    });
  }
  await test('partial named profile cannot hide behind a second complete profile', async () => {
    const ctx = await setup('tunnel-jumbo', 'tunnel-jumbo');
    const spec = ctx.rig.getSpec();
    ctx.rig.getSpec = () => ({ ...spec, methods: ['tunnel-jumbo', 'rockbolt'] });
    const list = ctx.rig.getWorkLights();
    list.push({ ...list[0], name: 'feed-work-light' }); // synthetic conflicting profile
    list.splice(list.findIndex(x => x.name === 'boom-r-lamp-0'), 1);
    const start = diagnostics.length;
    ctx.env.update(0, ctx.state); diagnosed(start);
    const work = position(lamp(ctx, 'boom-l-lamp-0').node);
    check(position(flood(ctx)).some((x, i) => Math.abs(x - work[i]) > 1e-5), true,
      'conflicting complete generic profile cannot choose an arbitrary source');
  });
  await test('day and underground transitions keep sky visibility and rebuild real bindings', async () => {
    const ctx = await setup();
    ctx.state.contract.methodId = ctx.state.world.site.methodId = 'top-hammer';
    ctx.env.update(0, ctx.state);
    check(ctx.env.undergroundId, null, 'day method leaves underground');
    check(ctx.env.sun.visible, true, 'day sun returns');
    check(flood(ctx), undefined, 'underground group disposed');
    set(ctx, 'tunnel-jumbo', 'tunnel-jumbo'); ctx.env.update(0, ctx.state);
    check(ctx.env.sun.visible, false, 'underground hides sun'); bound(ctx, 'L', 'boom-l-lamp-0');
  });
  await test('LOW keeps its existing four-light budget and bound key', async () => {
    const ctx = await setup('tunnel-jumbo', 'tunnel-jumbo', QUALITY.LOW);
    const group = ctx.scene.getObjectByName('undergroundRig');
    check(group.children.filter(x => x.isSpotLight || x.isPointLight).length, 4, 'unchanged LOW light count');
    bound(ctx, 'L', 'boom-l-lamp-0');
  });
} finally {
  for (const ctx of systems) { ctx.env.dispose(); ctx.rig.dispose(); }
  runtime?.dispose(); material.dispose();
  globalThis.document = original.document; globalThis.fetch = original.fetch;
  console.warn = original.warn; console.error = original.error; console.info = original.info;
}
const failed = records.filter(x => !x.pass);
const result = { baseline, sourceHash, modelHashes: hashes, assertions,
  passed: records.length - failed.length, failed: failed.length, records };
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`${failed.length ? 'FAIL' : 'OK'} underground light adversarial: ${result.passed}/${records.length} cases, ${assertions} assertions; ${baseline ? 'beedaaf baseline' : 'candidate'} env sha256 ${sourceHash}`);
  for (const row of failed) console.log(`  FAIL ${row.name}: ${row.error}`);
}
if (failed.length) process.exitCode = 1;
