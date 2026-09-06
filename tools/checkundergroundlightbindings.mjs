/** CPU-only actual GLB -> public rig -> public environment binding regression.
 * No renderer, browser, model mutation, or alternate dimension measurement.
 * --diagnose records JSON observations without requiring corrected bindings.
 * --json prints full poses/metadata; the normal run prints compact verdicts.
 * --baseline uses beedaaf's env source in memory, never modifying production.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createBus, EVENTS } from '../src/core/contract.js';
import * as data from '../src/game/data.js';

const diagnose = process.argv.includes('--diagnose');
const baseline = process.argv.includes('--baseline');
const envBytes = baseline
  ? execFileSync('git', ['show', 'beedaaf:src/core/env.js'], { cwd: fileURLToPath(new URL('..', import.meta.url)) })
  : readFileSync(new URL('../src/core/env.js', import.meta.url));
// Resolve the unchanged module imports so the git blob can execute as ESM in
// memory. Only import specifiers change; binding code is the actual source.
const envSource = envBytes.toString('utf8').replace(/from (['"])([^'"]+)\1/g, (_match, quote, specifier) =>
  `from ${quote}${specifier.startsWith('.') ? new URL(specifier, new URL('../src/core/env.js', import.meta.url)).href : import.meta.resolve(specifier)}${quote}`);
const { createEnvironment } = await import(`data:text/javascript;base64,${Buffer.from(envSource).toString('base64')}`);
const ids = [...new Set(data.METHODS.filter(m => ['tunnel-jumbo', 'longhole', 'rockbolt', 'raise-boring'].includes(m.id)).flatMap(m => m.rigIds))];
assert.equal(ids.length, 4, 'all four actual underground GLBs must be exercised');
const binaries = new Map(ids.map(id => [id, readFileSync(new URL(`../public/models/${id}.glb`, import.meta.url))]));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const report = { cpuOnly: true, sourceOrigin: baseline ? 'git beedaaf:src/core/env.js' : 'working tree src/core/env.js', envSha256: hash(envBytes),
  sourceSha256: Object.fromEntries(['src/core/gltfRig.js', 'src/rig/rigFactory.js', 'src/game/data.js', 'src/core/contract.js'].map(path => [path, hash(readFileSync(new URL(`../${path}`, import.meta.url)))])),
  models: Object.fromEntries([...binaries].map(([id, binary]) => [id, { bytes: binary.length, sha256: hash(binary) }])), cases: [] };
const expected = { 'tunnel-jumbo': ['boom-l-lamp-0', 'boom-r-lamp-0'], 'longhole-rig': ['feed-head'], bolter: ['feed-work-light'], raisebore: ['table-work-light', 'feed-work-light'] };
const prior = { document: globalThis.document, fetch: globalThis.fetch, warn: console.warn, info: console.info };
const diagnostics = [];
let failures = 0;
const material = new THREE.MeshStandardMaterial();
const assets = { material: () => material };
const rigs = createGltfRigs({ THREE, data, qs: new URLSearchParams('glb=strict'), assets, bus: createBus() });

function vector(node) { return node.getWorldPosition(new THREE.Vector3()).toArray(); }
function near(a, b) { return a.every((v, i) => Math.abs(v - b[i]) < 1e-7); }
function snapshot(ctx) {
  const lamps = ctx.rig.getWorkLights();
  return { underground: ctx.env.undergroundId, active: ctx.rig.getActiveSourceKey(),
    lamps: lamps.map(l => ({ name: l.name, pos: vector(l.node), aim: vector(l.aim), moves: l.moves,
      coneDeg: l.coneDeg, rangeM: l.rangeM, colourHex: l.colourHex, wattHint: l.wattHint })),
    floods: (ctx.quality.id === 'low' ? ['ugFloodL'] : ['ugFloodL', 'ugFloodR']).map(name => {
      const light = ctx.scene.getObjectByName(name);
      assert.ok(light, `${name} must exist`);
      const pos = vector(light), aim = vector(light.target);
      return { name, pos, aim, bound: lamps.filter(l => near(pos, vector(l.node)) && near(aim, vector(l.aim))).map(l => l.name),
        angle: light.angle, distance: light.distance, colourHex: light.color.getHex() };
    }) };
}
async function context(id, method, tier) {
  const ctx = { THREE, assets, gltfRigs: rigs, data, EVENTS, bus: createBus(), qs: new URLSearchParams('glb=strict'),
    scene: new THREE.Scene(), sectionScene: new THREE.Scene(), quality: { id: tier, shadowMap: 512 },
    state: { garage: { rigId: id }, settings: {}, contract: { methodId: method }, world: { site: { methodId: method } }, drill: { active: false, depth: 0, actionDepth: 0 } } };
  ctx.rig = createRigSystem(ctx);
  ctx.rig.setMethod(method);
  await ctx.rig.init();
  ctx.env = createEnvironment(ctx);
  await ctx.env.init();
  return ctx;
}
function tick(ctx) { ctx.rig.update(0, ctx.state); ctx.env.update(0, ctx.state); }
function setContract(ctx, method) {
  ctx.state.contract = { methodId: method };
  ctx.state.world.site = { methodId: method };
  ctx.rig.setMethod(method);
  ctx.bus.emit(EVENTS.CONTRACT_ACCEPT, { contract: ctx.state.contract });
}
function checkBinding(row, ctx, id) {
  const s = snapshot(ctx);
  row.snapshots.push(s);
  if (!diagnose) {
    assert.equal(s.active, `glb:${id}`);
    const names = (ctx.quality.id === 'low' || s.underground === 'rockbolt') ? expected[id].slice(0, 1) : expected[id];
    names.forEach((name, i) => assert.deepEqual(s.floods[i].bound, [name], `${row.name}/${s.floods[i].name}: expected ${name}, bound ${s.floods[i].bound}`));
    if (names.length === 1 && s.floods.length === 2) assert.deepEqual(s.floods[1].bound, [], 'the authored platform fill remains unbound');
    for (const flood of s.floods) for (const name of flood.bound) {
      const lamp = s.lamps.find(l => l.name === name);
      assert.ok(Math.abs(flood.angle - THREE.MathUtils.degToRad(lamp.coneDeg) / 2) < 1e-9);
      assert.equal(flood.distance, lamp.rangeM * 1.8);
      assert.equal(flood.colourHex, lamp.colourHex);
    }
  }
  return s;
}
async function test(name, id, method, run, tier = 'medium') {
  const row = { name, snapshots: [], warnings: [] };
  report.cases.push(row);
  diagnostics.length = 0;
  let ctx;
  try {
    ctx = await context(id, method, tier);
    await run(ctx, row);
    row.warnings = diagnostics.filter(s => s.startsWith('[env]'));
    if (!diagnose) assert.deepEqual(row.warnings, [], 'valid bindings must not warn');
    row.ok = true;
  } catch (error) {
    row.ok = false; row.error = error.stack; failures++;
    row.warnings = diagnostics.filter(s => s.startsWith('[env]'));
  } finally { ctx?.env.dispose(); ctx?.rig.dispose(); }
}

try {
  globalThis.document = { baseURI: 'https://actual-glb.invalid/' };
  globalThis.fetch = async url => {
    const match = /^https:\/\/actual-glb\.invalid\/models\/([^/]+)\.glb$/.exec(url);
    assert.ok(match && binaries.has(match[1]), `unexpected network request ${url}`);
    return new Response(binaries.get(match[1]));
  };
  console.warn = (...args) => diagnostics.push(args.join(' '));
  console.info = (...args) => diagnostics.push(args.join(' '));
  await Promise.all(ids.map(id => rigs.load(id)));
  for (const tier of ['low', 'medium', 'high']) for (const method of data.METHODS.filter(m => ['tunnel-jumbo', 'longhole', 'rockbolt', 'raise-boring'].includes(m.id))) {
    for (const id of method.rigIds) await test(`steady ${tier} ${method.id}/${id}`, id, method.id, async (ctx, row) => {
      tick(ctx); checkBinding(row, ctx, id);
      tick(ctx); checkBinding(row, ctx, id);
    }, tier);
  }
  await test('direct setRig after cached raisebore then tunnel contract', 'raisebore', 'raise-boring', async (ctx, row) => {
    tick(ctx); checkBinding(row, ctx, 'raisebore');
    setContract(ctx, 'tunnel-jumbo');
    ctx.rig.setRig('tunnel-jumbo');
    tick(ctx); checkBinding(row, ctx, 'tunnel-jumbo');
    tick(ctx); checkBinding(row, ctx, 'tunnel-jumbo');
  });
  await test('RIG_CHANGE after cached raisebore then tunnel contract', 'raisebore', 'raise-boring', async (ctx, row) => {
    tick(ctx); checkBinding(row, ctx, 'raisebore');
    setContract(ctx, 'tunnel-jumbo');
    ctx.state.garage.rigId = 'tunnel-jumbo';
    ctx.bus.emit(EVENTS.RIG_CHANGE, { rigId: 'tunnel-jumbo', methodId: 'tunnel-jumbo' });
    tick(ctx); checkBinding(row, ctx, 'tunnel-jumbo');
  });
  await test('direct setRig before contract after cached raisebore', 'raisebore', 'raise-boring', async (ctx, row) => {
    tick(ctx); checkBinding(row, ctx, 'raisebore');
    ctx.rig.setRig('tunnel-jumbo');
    setContract(ctx, 'tunnel-jumbo');
    tick(ctx); checkBinding(row, ctx, 'tunnel-jumbo');
  });
  await test('same rockbolt method switches through all legal GLBs without events', 'bolter', 'rockbolt', async (ctx, row) => {
    tick(ctx); checkBinding(row, ctx, 'bolter');
    for (const id of ['longhole-rig', 'tunnel-jumbo', 'bolter']) {
      ctx.rig.setRig(id); tick(ctx); checkBinding(row, ctx, id);
    }
  });
  await test('pose changes retain live mount and aim positions', 'raisebore', 'raise-boring', async (ctx, row) => {
    tick(ctx); const before = checkBinding(row, ctx, 'raisebore');
    // Depths here are control probes (NOT SOURCED), not new machine dimensions.
    ctx.state.drill = { active: true, depth: 0.75, actionDepth: 0.75, rpm: 0, torque: 0, wob: 0, wear: 0, phase: 'drill' };
    tick(ctx); const after = checkBinding(row, ctx, 'raisebore');
    assert.ok(!near(before.lamps.find(l => l.name === 'feed-work-light').pos, after.lamps.find(l => l.name === 'feed-work-light').pos), 'actual carriage feed must move its light');
  });
  for (const [id, method] of [['bolter', 'rockbolt'], ['longhole-rig', 'longhole'], ['tunnel-jumbo', 'tunnel-jumbo'], ['raisebore', 'raise-boring'], ['longhole-rig', 'rockbolt'], ['tunnel-jumbo', 'rockbolt']]) {
    await test(`actual node transforms remain live ${method}/${id}`, id, method, async (ctx, row) => {
      tick(ctx); const before = checkBinding(row, ctx, id);
      const lampArray = ctx.rig.getWorkLights();
      // Synthetic control transforms, NOT SOURCED geometry changes. Exercise
      // actual mount ancestry and independent aim, without recreating nodes.
      const lamp = lampArray.find(l => l.name === expected[id][0]);
      lamp.node.parent.rotation.y += 0.17;
      lamp.aim.position.x += 0.23;
      ctx.scene.updateMatrixWorld(true);
      ctx.env.update(0, ctx.state);
      const after = checkBinding(row, ctx, id);
      assert.equal(ctx.rig.getWorkLights(), lampArray, 'node motion retains publisher array identity');
      assert.ok(!near(before.floods[0].pos, after.floods[0].pos), 'live parent changes mount position');
      assert.ok(!near(before.floods[0].aim, after.floods[0].aim), 'live target changes aim position');
    });
  }
} finally {
  rigs.dispose(); material.dispose();
  globalThis.document = prior.document; globalThis.fetch = prior.fetch;
  console.warn = prior.warn; console.info = prior.info;
}
report.failed = failures;
if (diagnose || process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else {
  for (const row of report.cases) console.log(`${row.ok ? 'PASS' : 'FAIL'} ${row.name}${row.error ? `: ${row.error.split('\n')[0]}` : ''}`);
  console.log(`Underground actual GLB bindings: ${report.cases.length - failures}/${report.cases.length} passed; ${failures} failed. CPU only.`);
}
process.exitCode = failures ? 1 : 0;
