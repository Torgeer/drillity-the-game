/** Independent CPU critique of the actual pile-ram consumer.
 * node tools/checkpilemotion-adversarial.mjs [--fleet-only]
 * The pinned comparison is a one-time review, not a permanent product gate.
 * Synthetic controls are NOT SOURCED test inputs. No geometry dimensions are
 * measured here: glbinfo.mjs remains their sole authority. CPU transforms do
 * not establish rendered visibility, clearance, draw calls or motion quality.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as THREE from 'three';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createBus, createGameState, EVENTS } from '../src/core/contract.js';
import { createDrillSim } from '../src/sim/drilling.js';
import { RIGS } from '../src/game/data.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BASE = '1f2d285f54ff71b9f05dac895bee0400aa9f61f7';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const paths = ['src/core/gltfRig.js', 'src/rig/rigFactory.js', 'src/sim/drilling.js',
  'src/core/gltfAnim.js', 'src/core/contract.js', 'src/core/motion.js', 'src/game/data.js',
  'blender/piling_leader.py', 'blender/lib/rig.py',
  'tools/checkpilemotion-adversarial.mjs', ...RIGS.map(r => `public/models/${r.id}.glb`)];
const hashes = Object.fromEntries(paths.map(p => [p, sha(readFileSync(resolve(ROOT, p)))]));
const baselineHashes = {};
async function baselineModule(file) {
  let code = execFileSync('git', ['show', `${BASE}:${file}`], { cwd: ROOT, maxBuffer: 4e6 }).toString();
  baselineHashes[file] = sha(code);
  const url = pathToFileURL(resolve(ROOT, file));
  code = code.replace(/((?:from\s+|import\s*\(\s*)['"])([^'"]+)(['"])/g,
    (_, before, spec, after) => before + (spec.startsWith('.')
      ? new URL(spec, url).href : import.meta.resolve(spec)) + after);
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}
const baselineLoader = (await baselineModule('src/core/gltfRig.js')).createGltfRigs;
const baselineFactory = (await baselineModule('src/rig/rigFactory.js')).createRigSystem;
const old = { document: globalThis.document, fetch: globalThis.fetch,
  info: console.info, warn: console.warn, error: console.error };
const diagnostics = [], cases = [], systems = [], loaders = [], materials = new Map();
let mutateModel = null;
function mutatedGLB(bytes, mutation) {
  const size = bytes.readUInt32LE(12), json = JSON.parse(bytes.subarray(20, 20 + size).toString());
  mutation(json);
  const raw = Buffer.from(JSON.stringify(json)), padded = Buffer.alloc(Math.ceil(raw.length / 4) * 4, 0x20);
  raw.copy(padded);
  const header = Buffer.from(bytes.subarray(0, 20)), tail = bytes.subarray(20 + size);
  header.writeUInt32LE(20 + padded.length + tail.length, 8); header.writeUInt32LE(padded.length, 12);
  return Buffer.concat([header, padded, tail]);
}
const assets = { material(kind) {
  if (!materials.has(kind)) { const m = new THREE.MeshStandardMaterial(); m.name = kind; materials.set(kind, m); }
  return materials.get(kind);
} };
let assertions = 0, comparedNodes = 0;
function ok(value, label) { assertions++; assert.ok(value, label); }
function close(a, b, label, tolerance = 1e-9) {
  ok(Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance, `${label}: ${a} != ${b}`);
}
function local(n) { return [...n.position.toArray(), ...n.quaternion.toArray(), ...n.scale.toArray()]; }
function tree(root) {
  const rows = [];
  root.traverse(n => rows.push({ name: n.name, local: local(n), world: n.matrixWorld.elements.slice(),
    children: n.children.length, mesh: !!n.isMesh, vertices: n.geometry?.attributes?.position?.count || 0 }));
  return rows;
}
// Reconstruct the pinned scene with exactly two permitted local Y changes.
// Every descendant keeps its pinned local transform; its expected world matrix
// is recomposed through the corrected parent, never exempted from comparison.
function expectedPileTree(root, carriage, carriageY, ram, ramY) {
  const rows = [];
  function visit(node, parentWorld) {
    const position = node.position.clone();
    if (node === carriage) position.y = carriageY;
    if (node === ram) position.y = ramY;
    const matrix = new THREE.Matrix4().compose(position, node.quaternion, node.scale);
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, matrix);
    rows.push({ name: node.name, local: [...position.toArray(), ...node.quaternion.toArray(), ...node.scale.toArray()],
      world: world.elements.slice(), children: node.children.length, mesh: !!node.isMesh,
      vertices: node.geometry?.attributes?.position?.count || 0 });
    for (const child of node.children) visit(child, world);
  }
  visit(root, root.parent?.matrixWorld || new THREE.Matrix4());
  return rows;
}
function compare(a, b, label, except = null) {
  ok(a.length === b.length, `${label}: scene-node count`);
  a.forEach((row, i) => {
    const other = b[i];
    ok(row.name === other.name && row.children === other.children && row.mesh === other.mesh
      && row.vertices === other.vertices, `${label}: scene structure ${i}/${row.name}`);
    if (except?.(row.name)) return;
    row.local.forEach((v, j) => close(v, other.local[j], `${label}/${row.name} local ${j}`));
    row.world.forEach((v, j) => close(v, other.world[j], `${label}/${row.name} world ${j}`));
    comparedNodes++;
  });
}
async function build(id, method, oldVersion = false, sim = null, state = null, bus = null) {
  state ||= createGameState(); state.garage.rigId = id; bus ||= createBus();
  const scene = new THREE.Scene(), sectionScene = new THREE.Scene();
  const tip = new THREE.Object3D(); sectionScene.add(tip);
  const loader = (oldVersion ? baselineLoader : createGltfRigs)({ THREE, assets,
    data: { RIGS }, bus, qs: new URLSearchParams('glb=strict') });
  loaders.push(loader); await loader.load(id);
  let built;
  const system = (oldVersion ? baselineFactory : createRigSystem)({ THREE, assets, scene, sectionScene,
    state, bus, EVENTS, sim, data: { RIGS }, quality: { id: 'low' },
    qs: new URLSearchParams('glb=strict'),
    geology: { boreholeTip: tip, worldYForDepth: d => -d, holeRadiusAt: () => 0.15 },
    gltfRigs: { ...loader, builder(rigId) {
      const fn = loader.builder(rigId);
      return (...args) => { built = fn(...args); return built; };
    } } });
  systems.push(system); system.setMethod(method); await system.init();
  ok(system.getSpec().source === 'glb' && system.getRigId() === id, `${id}: actual strict GLB`);
  const update = (dt = 1 / 60) => { system.update(dt, state); scene.updateMatrixWorld(true); sectionScene.updateMatrixWorld(true); };
  update(0);
  return { system, state, bus, scene, built, update, close() {
    system.dispose(); systems.splice(systems.indexOf(system), 1);
    loader.dispose(); loaders.splice(loaders.indexOf(loader), 1);
  } };
}
async function run(name, fn) {
  const before = assertions;
  try { await fn(); cases.push({ name, passed: true, assertions: assertions - before }); }
  catch (error) { cases.push({ name, passed: false, error: error.stack }); }
}
try {
  globalThis.document = { baseURI: 'https://pile-motion-critic.invalid/' };
  globalThis.fetch = async value => {
    const url = new URL(value);
    assert.equal(url.origin, 'https://pile-motion-critic.invalid');
    assert.match(url.pathname, /^\/models\/[^/]+\.glb$/);
    let bytes = readFileSync(resolve(ROOT, 'public' + url.pathname));
    if (mutateModel && url.pathname === '/models/piling-leader.glb') bytes = mutatedGLB(bytes, mutateModel);
    return new Response(bytes);
  };
  console.info = (...args) => diagnostics.push(args.join(' '));
  console.warn = (...args) => diagnostics.push(args.join(' '));
  console.error = (...args) => diagnostics.push(args.join(' '));

  if (!process.argv.includes('--pile-only')) await run('Other 18 actual GLBs retain every local and world transform across drilling, rod events, trip and inactivity', async () => {
    let rigs = 0, pairs = 0;
    for (const row of RIGS.filter(r => r.id !== 'piling-leader')) {
      rigs++;
      for (const method of row.methods) {
        pairs++;
        const a = await build(row.id, method, true), b = await build(row.id, method);
        try {
          const drill = { active: true, methodId: method, programme: row.id === 'cpt-unit' ? 'cpt' : method,
            phase: 'drilling', depth: 0.2, actionDepth: 0.2, target: 12, rpm: 0.6,
            wob: 0.5, torque: 0.3, wear: 0, hammerBpm: 80, hammerDropM: 0.8,
            timeSec: 0, progress01: 0.2, sptRelease: 1, sptBpm: 30 };
          a.state.drill = { ...drill }; b.state.drill = { ...drill };
          for (let frame = 0; frame < 96; frame++) {
            for (const f of [a, b]) {
              f.state.drill.timeSec = frame / 60;
              f.state.drill.depth = f.state.drill.actionDepth = 0.2 + frame / 70;
              if (frame === 20) f.bus.emit(EVENTS.ROD_ADDED, { count: 2, depth: 1, kind: 'add' });
              if (frame === 48) { f.system.skipAnimation(); void f.system.playTripOut(2); }
              if (frame === 80) { f.system.skipAnimation(); f.state.drill.active = false; }
              f.update();
            }
            compare(tree(a.built.root), tree(b.built.root), `${row.id}/${method}/frame${frame}`);
          }
        } finally { a.close(); b.close(); }
      }
    }
    ok(rigs === 18 && pairs >= 18, 'all 18 other actual fleet rigs exercised');
    cases.push({ name: 'Fleet coverage', rigs, pairs, comparedNodes, passed: true });
  });

  if (!process.argv.includes('--fleet-only')) {
    await run('Actual GLB malformed ram stroke and parent metadata cannot produce an accepted rig', async () => {
      const mutations = [
        ...[0, -1, null, '1.2'].map(value => [`stroke ${String(value)}`, g => {
          g.nodes.find(n => n.name === 'slide:hammer-ram').extras.stroke_m = value;
        }]),
        ['missing stroke', g => { delete g.nodes.find(n => n.name === 'slide:hammer-ram').extras.stroke_m; }],
        ['wrong parent', g => {
          const child = g.nodes.findIndex(n => n.name === 'slide:hammer-ram');
          const carriage = g.nodes.find(n => n.name === 'slide:carriage');
          carriage.children = carriage.children.filter(i => i !== child);
          const parent = g.nodes.find(n => n.name === 'pivot:leader-rake-side');
          parent.children.push(child);
        }],
      ];
      for (const [name, mutation] of mutations) {
        mutateModel = mutation;
        let refused = false, f = null;
        const diagnosticStart = diagnostics.length;
        try { f = await build('piling-leader', 'driven-pile'); }
        catch (error) {
          refused = /hammer-ram|stroke_m|piling-leader/.test(error.message)
            || diagnostics.slice(diagnosticStart).some(s => /hammer-ram.*authored carriage parent.*positive stroke_m/.test(s));
        } finally { f?.close(); mutateModel = null; }
        ok(refused, `${name}: strict actual GLB rig refused`);
      }
    });
    await run('Compound parent transforms retain a strictly parent-local authored stroke and no sibling motion', async () => {
      const f = await build('piling-leader', 'driven-pile');
      try {
        const ram = f.built.root.getObjectByName('slide:hammer-ram');
        const rest = ram.position.clone(), rotation = ram.quaternion.clone(), scale = ram.scale.clone();
        // NOT SOURCED test transforms challenge nested rotations and scale;
        // these are not proposed machine settings or capability claims.
        f.built.root.rotation.set(0.17, 0.41, -0.11);
        f.built.root.getObjectByName('pivot:leader-rake').rotation.x += 0.29;
        f.built.root.getObjectByName('pivot:leader-rake-side').rotation.z -= 0.23;
        f.built.root.scale.set(1.2, 0.9, 1.1);
        f.state.drill = { active: true, methodId: 'driven-pile', programme: 'driven-pile',
          phase: 'drilling', depth: 0.2, actionDepth: 0.2, hammerDropM: ram.userData.stroke_m * 2,
          hammerBpm: 80, hammerPhase01: 0, rpm: 0.5, wob: 0.5, torque: 0.3 };
        f.update(0);
        const start = ram.getWorldPosition(new THREE.Vector3());
        const parent = ram.parent.matrixWorld.clone();
        const sibling = local(f.built.root.getObjectByName('slide:drive-cap'));
        for (const phase of [0.15, 0.25, 0.5, 0.75, 0.95, 0.999]) {
          f.state.drill.hammerPhase01 = phase; f.update(0);
          close(ram.position.x, rest.x, 'compound X unchanged'); close(ram.position.z, rest.z, 'compound Z unchanged');
          const offset = ram.position.y - rest.y;
          ok(offset >= 0 && offset <= ram.userData.stroke_m + 1e-9, 'authored stroke clamps overrange drop');
          if (phase === 0.5) close(offset, ram.userData.stroke_m, 'curve peak reaches authored stroke');
          const expected = rest.clone().add(new THREE.Vector3(0, offset, 0)).applyMatrix4(parent);
          const observed = ram.getWorldPosition(new THREE.Vector3());
          close(observed.distanceTo(expected), 0, 'compound world displacement follows transformed parent-local axis');
          ok(phase !== 0.5 || observed.distanceTo(start) > 0, 'parent rotation cannot hide genuine local peak movement');
          ok(ram.quaternion.equals(rotation) && ram.scale.equals(scale), 'ram rotation and scale unchanged');
          local(f.built.root.getObjectByName('slide:drive-cap')).forEach((v, i) => close(v, sibling[i], 'drive cap local pose untouched'));
        }
      } finally { f.close(); }
    });
    await run('Invalid programme, phase, activity and typed progress/drop telemetry cannot animate a ram', async () => {
      const f = await build('piling-leader', 'driven-pile');
      try {
        const ram = f.built.root.getObjectByName('slide:hammer-ram'), rest = local(ram);
        const good = { active: true, methodId: 'driven-pile', programme: 'driven-pile', phase: 'drilling',
          depth: 0.2, actionDepth: 0.2, hammerDropM: 0.6, hammerPhase01: 0.5, hammerBpm: 80 };
        const invalid = [
          ['inactive', { active: false }], ['missing active', { active: undefined }],
          ...['rotary-kelly', 'spt', null, ''].map(programme => [`programme ${programme}`, { programme }]),
          ...['pitch', 'dolly-change', 're-drive', 'idle', 'complete', 'rod-add', null].map(phase => [`phase ${phase}`, { phase }]),
          ...[-0.001, 1, Infinity, NaN, null, undefined, '0.5'].map(hammerPhase01 => [`progress ${String(hammerPhase01)}`, { hammerPhase01 }]),
          ...[-1, 0, NaN, Infinity, null, undefined, '0.6'].map(hammerDropM => [`drop ${String(hammerDropM)}`, { hammerDropM }]),
        ];
        for (const [label, patch] of invalid) {
          f.state.drill = { ...good }; f.update(1 / 60);
          ok(ram.position.y > rest[1], `${label}: exercise a previously raised ram`);
          f.state.drill = { ...good, ...patch }; f.update(1 / 60);
          local(ram).forEach((v, i) => close(v, rest[i], `${label}: invalid state restores rest`));
        }
        f.system.setMethod('rotary-kelly'); f.state.drill = good; f.update(1 / 60);
        local(ram).forEach((v, i) => close(v, rest[i], 'rig method mismatch restores rest'));
      } finally { f.close(); }
    });
    await run('Real take-set sample counts and re-drive/dolly preparation keep authoritative impact timing', async () => {
      const state = createGameState(), bus = createBus();
      state.garage.loadout = { hammer: 'impact-hammer-9t', dolly: 'dolly-hardwood', install: 'precast-pile-350' };
      const sim = createDrillSim({ state, bus });
      const f = await build('piling-leader', 'driven-pile', false, sim, state, bus);
      try {
        const ram = f.built.root.getObjectByName('slide:hammer-ram'), rest = local(ram);
        sim.startHole({ id: 'critic-set', methodId: 'driven-pile', targetDepth: 14, flushMedium: 'none', seed: 123 });
        sim.setInput('feed', 0.1); sim.setInput('rotation', 0.6); sim.setInput('flush', 0.5);
        sim.update(1 / 60); f.update();
        for (let n = 0; n < 900 && state.drill.phase !== 'drilling'; n++) { sim.update(1 / 60); f.update(); }
        ok(state.drill.phase === 'drilling', 'real initial pitch completed');
        ok(sim.pulse('changeDolly').ok, 'real dolly action accepted');
        sim.update(0); f.update(); let dollyFrames = 0;
        for (let n = 0; n < 1500 && state.drill.phase === 'dolly-change'; n++) {
          ok(state.drill.hammerPhase01 === null, 'dolly publishes no impact phase');
          local(ram).forEach((v, i) => close(v, rest[i], 'dolly ram at rest'));
          dollyFrames++; sim.update(1 / 60); f.update();
        }
        ok(dollyFrames > 60 && state.drill.phase === 'drilling', `whole real dolly beat tested: ${dollyFrames} frames, end ${state.drill.phase}`);
        ok(sim.pulse('takeSet').ok, 'real set action accepted');
        sim.update(0); f.update();
        let samples = 0, crossings = 0, priorPhase = 0, priorY = rest[1], moved = false, setFrames = 0;
        for (let n = 0; n < 1500 && state.drill.phase === 'take-set'; n++) {
          const s = sim.debug.state, phase = state.drill.hammerPhase01;
          close(phase, ((s.phaseT / s.phaseDur) * s.m.pile.setBlows) % 1, 'actual set clock publishes counted cycle');
          if (phase < priorPhase) crossings++;
          if (s.prog.setSamples.length > samples) {
            ok(phase < 0.1 && priorPhase > 0.8, 'real set sample lands at a cycle boundary');
            ok(ram.position.y < priorY || ram.position.y - rest[1] < 0.1, 'sample transition returns ram toward its anvil');
            samples = s.prog.setSamples.length;
          }
          moved ||= ram.position.y - rest[1] > 0.01;
          priorPhase = phase; priorY = ram.position.y; setFrames++;
          sim.update(1 / 60); f.update();
        }
        ok(moved && setFrames > 60 && crossings >= 8, 'take-set produces repeated true local strokes');
        ok(sim.debug.state.prog.setSamples.length === sim.debug.state.m.pile.setBlows, 'actual set completed exact configured count');
        ok(state.drill.phase === 're-drive', 'controlled under-founded set enters actual re-drive');
        let reDriveFrames = 0;
        for (let n = 0; n < 1500 && state.drill.phase === 're-drive'; n++) {
          ok(state.drill.hammerPhase01 === null, 're-drive preparation publishes no impact cycle');
          local(ram).forEach((v, i) => close(v, rest[i], 're-drive ram rests'));
          reDriveFrames++; sim.update(1 / 60); f.update();
        }
        ok(reDriveFrames > 60 && state.drill.phase === 'drilling', 'whole real re-drive preparation tested');
        ok(sim.pulse('takeSet').ok, 'second actual set action accepted'); sim.update(0); f.update();
        for (let n = 0; n < 1500 && state.drill.active; n++) { sim.update(1 / 60); f.update(); }
        ok(!state.drill.active, 'second actual set reaches job completion');
        local(ram).forEach((v, i) => close(v, rest[i], 'completed job ram at rest'));
        const configuredSetCount = sim.debug.state.m.pile.setBlows;
        const observedSetSamples = sim.debug.state.prog.setSamples.length;
        sim.startHole({ id: 'critic-next-job', methodId: 'driven-pile', targetDepth: 14,
          flushMedium: 'none', seed: 456 }); f.update(0);
        close(state.drill.hammerPhase01, 0, 'new job starts with zero authoritative cycle');
        local(ram).forEach((v, i) => close(v, rest[i], 'new job starts at authored ram rest'));
        cases.push({ name: 'Real action timing evidence', passed: true, dollyFrames, setFrames, reDriveFrames,
          configuredSetCount, observedSetSamples, completedSecondSet: true, restartedAtRest: true });
      } finally { sim.dispose(); f.close(); }
    });
    await run('Actual simulator drives ram local motion; renderer time cannot advance a frozen simulator', async () => {
      const state = createGameState(), bus = createBus();
      state.garage.loadout = { hammer: 'impact-hammer-9t', dolly: 'dolly-hardwood', install: 'precast-pile-350' };
      const sim = createDrillSim({ state, bus });
      const f = await build('piling-leader', 'driven-pile', process.argv.includes('--placement-counterfactual'), sim, state, bus);
      const control = await build('piling-leader', 'driven-pile', true, sim, state, bus);
      try {
        // Remove only the ram binding on the test instance. Keeping the new
        // placement active allows the negative control to reach the ram-motion
        // assertion instead of failing early on the intentionally fixed feed.
        if (process.argv.includes('--counterfactual')) delete f.built.dyn.impactRam;
        const ram = f.built.root.getObjectByName('slide:hammer-ram');
        ok(!!ram, 'actual named ram exists');
        const authored = local(ram), positions = [], states = [];
        const oldCarriage = control.built.root.getObjectByName('slide:carriage');
        const oldRam = control.built.root.getObjectByName('slide:hammer-ram');
        const carriage = f.built.root.getObjectByName('slide:carriage');
        const bytes = readFileSync(resolve(ROOT, 'public/models/piling-leader.glb'));
        const glb = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
        const sourceCarriage = glb.nodes.find(n => n.name === 'slide:carriage');
        const restY = sourceCarriage.translation[1];
        const lowerY = restY + sourceCarriage.extras.travel_lo_m;
        const upperY = restY + sourceCarriage.extras.travel_hi_m;
        ok(Number.isFinite(lowerY) && Number.isFinite(upperY) && lowerY <= restY && restY <= upperY,
          'authored piling offsets contain the exported rest');
        // Python records endpoint minus HAMMER_BOT. The independent depth
        // oracle uses that rest directly, not the runtime's range or modulo.
        const python = readFileSync(resolve(ROOT, 'blender/piling_leader.py'), 'utf8');
        assert.match(python, /ham\['travel_lo_m'\] = 1\.40 - HAMMER_BOT/);
        assert.match(python, /ham\['travel_hi_m'\] = \(LEADER_TOP - 2\.60\) - HAMMER_L - HAMMER_BOT/);
        const placementSamples = [];
        sim.startHole({ id: 'critic-pile-live', methodId: 'driven-pile', targetDepth: 14,
          flushMedium: 'none', seed: 123, holeDia: 350 });
        sim.setInput('feed', 0.65); sim.setInput('rotation', 0.7); sim.setInput('flush', 0.5);
        for (let frame = 0; frame < 540; frame++) {
          sim.update(1 / 60); f.update(); control.update();
          const along = state.drill.actionDepth ?? state.drill.depth;
          ok(Number.isFinite(along) && along >= 0, 'actual simulator supplies finite forward work depth');
          const expectedY = Math.max(lowerY, Math.min(upperY, restY - along));
          close(carriage.position.y, expectedY, 'carriage follows authored rest minus actual simulator depth');
          close(f.built.dyn.carriageRange[0], upperY, 'authored upper endpoint');
          close(f.built.dyn.carriageRange[1], lowerY, 'authored lower endpoint');
          compare(expectedPileTree(control.built.root, oldCarriage, expectedY, oldRam, ram.position.y),
            tree(f.built.root), `piling-leader/live${frame}`);
          if (frame % 90 === 0) placementSamples.push({ frame, phase: state.drill.phase,
            actionDepth: along, expectedY, actualY: carriage.position.y });
          if (state.drill.active && state.drill.phase === 'drilling') {
            positions.push(ram.position.toArray());
            close(ram.position.x, authored[0], 'ram off-axis X rest preserved');
            close(ram.position.z, authored[2], 'ram off-axis Z rest preserved');
            local(ram).slice(3).forEach((v, i) => close(v, authored[i + 3], 'ram rest orientation and scale'));
            ok(ram.position.y >= authored[1] - 1e-9
              && ram.position.y <= authored[1] + ram.userData.stroke_m + 1e-9, 'ram stays in authored stroke');
            states.push({ phase: state.drill.phase, timeSec: state.drill.timeSec, blowPhase: sim.debug.state.blowPhase,
              bpm: state.drill.hammerBpm, dropM: state.drill.hammerDropM });
          }
        }
        ok(positions.length > 60, 'real live drilling sampled for more than one second');
        const moved = positions.some(p => p.some((v, i) => Math.abs(v - positions[0][i]) > 1e-5));
        ok(moved, 'ram must change parent-local position, not only inherit carriage movement');
        const frozen = local(ram), frozenTime = state.drill.timeSec;
        for (let i = 0; i < 90; i++) f.update(1 / 60);
        local(ram).forEach((v, i) => close(v, frozen[i], 'frozen authoritative sim must freeze ram'));
        close(state.drill.timeSec, frozenTime, 'renderer must not mutate simulation clock');
        sim.abortHole('critic'); sim.update(0); f.update();
        for (let i = 0; i < 60; i++) f.update();
        local(ram).forEach((v, i) => close(v, authored[i], 'aborted job restores authored ram pose'));
        cases.push({ name: 'Real simulation sample evidence', passed: true, samples: positions.length,
          positions: positions.filter((_, i) => i % 45 === 0), states: states.filter((_, i) => i % 45 === 0),
          placement: { restY, lowerY, upperY, samples: placementSamples,
            oracle: 'Authored rest minus actual simulator work depth, clamped to authored offset endpoints; all pinned local transforms preserved except carriage Y and independently checked ram Y; every world matrix recomposed and compared.' } });
      } finally { sim.dispose(); f.close(); control.close(); }
    });
  }
} finally {
  for (const s of systems) s.dispose();
  for (const l of loaders) l.dispose();
  for (const m of materials.values()) m.dispose();
  Object.assign(globalThis, { document: old.document, fetch: old.fetch });
  console.info = old.info; console.warn = old.warn; console.error = old.error;
}
for (const p of paths) assert.equal(sha(readFileSync(resolve(ROOT, p))), hashes[p], `source changed while reviewing ${p}`);
const passed = cases.every(c => c.passed);
console.log(JSON.stringify({ passed, counterfactual: process.argv.includes('--counterfactual'),
  placementCounterfactual: process.argv.includes('--placement-counterfactual'), generatedAt: new Date().toISOString(), baselineCommit: BASE,
  baselineHashes, hashes, assertions, cases, diagnostics,
  limits: ['CPU transforms only; no rendered visibility, clearance, cadence quality or draw-call approval.',
    'Pinned comparison is valid only for this bounded adapter review; future intentional rig changes require a new review baseline.'] }, null, 2));
process.exitCode = passed ? 0 : 1;
