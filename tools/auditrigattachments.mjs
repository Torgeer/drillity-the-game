/**
 * CPU audit of the actual GLB loader, rig API and procedural tool builders.
 * node tools/auditrigattachments.mjs --json .hudqa/rig-attachments-current.json
 * Optional --rig <id> limits an investigation; the default must cover all rigs.
 * --tool-selection-only gates real tool presence/identity without string
 * alignment claims. CPT regression: --rig cpt-unit --tool-selection-only.
 *
 * Test depth, section coordinates and hole radius are synthetic NOT SOURCED
 * control inputs. This measures attachment transforms and scene-visible mesh
 * presence, not rendered pixels, occlusion or machine dimensions. The sole
 * dimension ruler remains tools/glbinfo.mjs.
 *
 * Deliberately exits nonzero when a requested runtime contribution is absent
 * or disconnected. This audit is not wired into npm until its findings are fixed.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import * as THREE from 'three';
import { createGltfRigs } from '../src/core/gltfRig.js';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { createBus } from '../src/core/contract.js';
import { RIGS } from '../src/game/data.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const selected = args.includes('--rig') ? args[args.indexOf('--rig') + 1] : null;
const toolSelectionOnly = args.includes('--tool-selection-only');
const rows = selected ? RIGS.filter(r => r.id === selected) : RIGS;
assert.ok(rows.length, 'an empty rig audit must fail');
if (!selected) assert.equal(rows.length, 19, 'review fleet coverage if the content manifest changes');
const sha256 = data => createHash('sha256').update(data).digest('hex');
const paths = ['src/core/gltfRig.js', 'src/rig/rigFactory.js', 'src/rig/tools.js', 'src/game/data.js'];
const fingerprints = Object.fromEntries(paths.map(path => [path, sha256(readFileSync(resolve(ROOT, path)))]));

// Read the current literal from its owning source instead of maintaining a
// second expected-tool table that could agree with stale fixtures indefinitely.
const factorySource = readFileSync(resolve(ROOT, 'src/rig/rigFactory.js'), 'utf8');
const table = /const METHOD_TOOLING = (\{[\s\S]*?^\});/m.exec(factorySource);
assert.ok(table, 'METHOD_TOOLING source declaration must remain inspectable');
const methodTooling = runInNewContext(`(${table[1]})`);

function effectiveVisible(node) {
  for (let p = node; p; p = p.parent) if (!p.visible) return false;
  return true;
}
function visibleGeometry(root) {
  let meshes = 0, triangles = 0, finite = true;
  if (!root) return { meshes, triangles, finite };
  root.updateWorldMatrix(true, true);
  root.traverse(node => {
    if (!node.isMesh || !node.geometry || !effectiveVisible(node)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    if (!materials.some(m => m && m.visible && m.opacity > 0)) return;
    const count = node.geometry.index?.count || node.geometry.attributes.position?.count || 0;
    if (!count) return;
    const worldFinite = node.matrixWorld.elements.every(Number.isFinite);
    finite &&= worldFinite;
    if (!worldFinite || Math.abs(node.matrixWorld.determinant()) < 1e-15) return;
    meshes++;
    triangles += count / 3 * (node.isInstancedMesh ? node.count : 1);
  });
  return { meshes, triangles: Math.round(triangles), finite };
}
function collect(root, predicate) {
  const out = [];
  root?.traverse(node => { if (predicate(node)) out.push(node); });
  return out;
}
function worldPoint(node, local = new THREE.Vector3()) {
  node.updateWorldMatrix(true, false);
  return local.clone().applyMatrix4(node.matrixWorld);
}
function inspectContribution(node) {
  return node ? { id: node.userData.toolId, parent: node.parent?.name,
    ...visibleGeometry(node) } : null;
}

const previous = { document: globalThis.document, fetch: globalThis.fetch,
  info: console.info, warn: console.warn, error: console.error };
const diagnostics = [], materials = new Map(), modelBytes = new Map(), builds = [];
const results = [], proceduralComparisons = [];
let loader;
try {
  globalThis.document = { baseURI: 'https://attachment-audit.invalid/' };
  globalThis.fetch = async url => {
    const path = new URL(url);
    assert.equal(path.origin, 'https://attachment-audit.invalid');
    const match = /^\/models\/([^/]+)\.glb$/.exec(path.pathname);
    assert.ok(match && modelBytes.has(match[1]), 'audit must not make an external request');
    return new Response(modelBytes.get(match[1]));
  };
  console.info = (...values) => diagnostics.push(values.map(String).join(' '));
  console.warn = (...values) => diagnostics.push(values.map(String).join(' '));
  console.error = (...values) => diagnostics.push(values.map(String).join(' '));
  const assets = { material(kind) {
    if (!materials.has(kind)) {
      const material = new THREE.MeshStandardMaterial(); material.name = kind;
      materials.set(kind, material);
    }
    return materials.get(kind);
  } };
  for (const row of rows) modelBytes.set(row.id,
    readFileSync(resolve(ROOT, 'public/models', row.id + '.glb')));
  loader = createGltfRigs({ THREE, assets, data: { RIGS },
    qs: new URLSearchParams('glb=strict'), bus: createBus() });
  for (const row of rows) await loader.load(row.id);

  for (const row of rows) for (const method of row.methods) {
    let captured = null, authoredChainNodes = [];
    const scene = new THREE.Scene(), sectionScene = new THREE.Scene();
    const boreholeTip = new THREE.Object3D(); boreholeTip.name = 'boreholeTip';
    sectionScene.add(boreholeTip);
    const context = { THREE, assets, data: { RIGS }, scene, sectionScene,
      quality: { id: 'low' }, qs: new URLSearchParams('glb=strict'), bus: createBus(),
      state: { garage: { rigId: row.id }, settings: {} },
      geology: { boreholeTip, worldYForDepth: depth => -depth, holeRadiusAt: () => 0.15 },
      gltfRigs: { ...loader, builder(id) {
        const fn = loader.builder(id);
        return fn ? (...params) => {
          captured = fn(...params);
          // Capture before rigFactory can inject tools into these scopes.
          authoredChainNodes = collect(captured.root, node =>
            /^(?:slide:string|pivot:(?:spindle|.*-spindle))$/.test(node.name))
            .map(node => ({ name: node.name, ...visibleGeometry(node) }));
          return captured;
        } : fn;
      } },
    };
    const system = createRigSystem(context); builds.push(system);
    system.setMethod(method);
    await system.init();
    assert.equal(system.getRigId(), row.id, 'audit must build the requested rig');
    assert.equal(system.getSpec().source, 'glb', 'procedural fallback invalidates this audit');
    assert.ok(captured?.dyn && captured.root, 'observe the real builder without substituting a fixture');
    const dyn = captured.dyn;
    const expected = dyn.tooling?.[method] || methodTooling[method] || methodTooling.auger;
    const caseResult = { rig: row.id, method, source: system.getSpec().source,
      toolAnchor: dyn.toolAnchor?.name || null, mastLower: dyn.mastLower?.name || null,
      declaredTooling: system.getTooling(), expectedString: expected.stringDia > 0,
      importedPrimitives: loader.info(row.id).prims,
      modelSpecificTooling: !!dyn.tooling?.[method], states: [], failures: [] };
    caseResult.feed = dyn.carriage ? { axis: dyn.carriageAxis, range: dyn.carriageRange,
      augerDriven: !!dyn.augerDriven, kellyDriven: !!dyn.kellyDriven, rodLen: dyn.rodLen || null } : null;
    // Retained named authored scopes provide evidence that the GLB may already
    // contain a rod/bit. This is an inventory, not a semantic shape classifier.
    caseResult.authoredChainNodes = authoredChainNodes;
    const stages = ['hdd', 'raise-boring'].includes(method) ? [0, 1] : [0];
    for (const stage of stages) for (const depth of [0, 1.5, 2.999, 3.001]) {
      boreholeTip.position.y = -depth;
      const drill = { active: true, depth, actionDepth: depth, rpm: 0, wob: 0,
        torque: 0, wear: 0, phase: 'drill', stage, stageCount: stages.length,
        target: 3, methodId: method };
      // Update once, update matrices, then repeat: updateString reads world
      // matrices and should not be judged on the previous frame's transforms.
      for (let i = 0; i < 3; i++) {
        system.update(1 / 60, { drill });
        scene.updateMatrixWorld(true); sectionScene.updateMatrixWorld(true);
      }
      const surface = collect(captured.root, n => !!n.userData.toolId);
      const downhole = collect(boreholeTip, n => !!n.userData.toolId);
      const strings = collect(captured.root, n => n.name === 'string' && n.userData.dynamic);
      const string = strings[0];
      const surfaceTool = surface.find(n => n.userData.toolId === expected.surface?.id);
      const downholeTool = downhole.find(n => n.userData.toolId === expected.downhole?.id);
      const hole = dyn.mounts.get('hole'), holeAim = captured.root.getObjectByName('aim:hole');
      let authoredHole = null;
      if (hole && holeAim && dyn.toolAnchor) {
        const origin = worldPoint(hole), aim = worldPoint(holeAim);
        const axis = aim.clone().sub(origin);
        assert.ok(axis.lengthSq() > 0, 'an explicit hole aim must define a direction');
        axis.normalize();
        const delta = worldPoint(dyn.toolAnchor).sub(origin);
        authoredHole = { origin: origin.toArray(), aim: aim.toArray(),
          tool: worldPoint(dyn.toolAnchor).toArray(),
          toolToHoleAxisM: delta.clone().addScaledVector(axis, -delta.dot(axis)).length() };
      }
      const snapshot = { stage, depth, surface: inspectContribution(surfaceTool),
        authoredHole,
        carriageCoordinate: dyn.carriage ? dyn.carriage.position[dyn.carriageAxis || 'y'] : null,
        downhole: inspectContribution(downholeTool),
        actualSurfaceIds: surface.map(n => n.userData.toolId),
        actualDownholeIds: downhole.map(n => n.userData.toolId),
        string: string ? { parent: string.parent?.name, ...visibleGeometry(string),
          // applyTooling creates exactly a unit cylinder translated +0.5Y.
          // These are its explicit attachment endpoints, not an AABB ruler.
          headGapM: worldPoint(string, new THREE.Vector3(0, 1, 0))
            .distanceTo(worldPoint(dyn.toolAnchor)),
          collarGapM: worldPoint(string).distanceTo(worldPoint(system.collar)) } : null,
        allWorldMatricesFinite: collect(captured.root, () => true)
          .every(n => n.matrixWorld.elements.every(Number.isFinite)) };
      if (expected.surface && !(snapshot.surface?.meshes > 0))
        caseResult.failures.push(`stage${stage}/depth${depth}: missing surface ${expected.surface.id}`);
      if (expected.downhole && !(snapshot.downhole?.meshes > 0))
        caseResult.failures.push(`stage${stage}/depth${depth}: missing downhole ${expected.downhole.id}`);
      if (!toolSelectionOnly && expected.stringDia > 0 && !(snapshot.string?.meshes > 0))
        caseResult.failures.push(`stage${stage}/depth${depth}: missing runtime string`);
      if (!toolSelectionOnly && snapshot.string?.headGapM > 1e-4)
        caseResult.failures.push(`stage${stage}/depth${depth}: string misses head by ${snapshot.string.headGapM.toFixed(6)}m`);
      if (!toolSelectionOnly && snapshot.string?.collarGapM > 1e-4)
        caseResult.failures.push(`stage${stage}/depth${depth}: string misses public collar by ${snapshot.string.collarGapM.toFixed(6)}m`);
      if (!snapshot.allWorldMatricesFinite) caseResult.failures.push('nonfinite rig world matrix');
      caseResult.states.push(snapshot);
    }
    results.push(caseResult);
    system.dispose(); builds.pop();
  }

  // The procedural CPT builder declares a machine-specific tooling override.
  // Compare the public API and real downhole geometry, not a second mock table.
  if (rows.some(row => row.id === 'cpt-unit')) {
    const scene = new THREE.Scene(), sectionScene = new THREE.Scene();
    const boreholeTip = new THREE.Object3D(); boreholeTip.name = 'boreholeTip';
    sectionScene.add(boreholeTip);
    const system = createRigSystem({ THREE, assets, data: { RIGS }, scene, sectionScene,
      quality: { id: 'low' }, qs: new URLSearchParams('glb=off'), bus: createBus(),
      state: { garage: { rigId: 'cpt-unit' }, settings: {} },
      geology: { boreholeTip, worldYForDepth: depth => -depth, holeRadiusAt: () => 0.15 } });
    builds.push(system);
    system.setMethod('site-investigation');
    await system.init();
    assert.equal(system.getRigId(), 'cpt-unit');
    assert.notEqual(system.getSpec().source, 'glb', 'comparison must use the actual procedural builder');
    const comparison = { rig: 'cpt-unit', method: 'site-investigation',
      tooling: system.getTooling(),
      downhole: collect(boreholeTip, node => !!node.userData.toolId).map(inspectContribution) };
    assert.equal(comparison.tooling.downhole, 'cpt-piezocone', 'CPT machine override is a piezocone');
    assert.ok(comparison.downhole.some(tool => tool.id === 'cpt-piezocone' && tool.meshes > 0),
      'procedural comparison must build visible piezocone geometry');
    proceduralComparisons.push(comparison);
    const glbCase = results.find(row => row.rig === comparison.rig && row.method === comparison.method);
    if (glbCase.declaredTooling.downhole !== comparison.tooling.downhole)
      glbCase.failures.push(`GLB downhole ${glbCase.declaredTooling.downhole} differs from procedural machine override ${comparison.tooling.downhole}`);
    for (const snapshot of glbCase.states) if (snapshot.actualDownholeIds.length !== 1
      || snapshot.actualDownholeIds[0] !== comparison.tooling.downhole)
      glbCase.failures.push(`stage${snapshot.stage}/depth${snapshot.depth}: CPT downhole contains an unexpected or duplicate tool`);
    system.dispose(); builds.pop();
  }
} finally {
  for (const system of builds) system.dispose();
  loader?.dispose();
  for (const material of materials.values()) material.dispose();
  globalThis.document = previous.document; globalThis.fetch = previous.fetch;
  console.info = previous.info; console.warn = previous.warn; console.error = previous.error;
}

for (const path of paths) assert.equal(sha256(readFileSync(resolve(ROOT, path))), fingerprints[path],
  `source changed while audit ran: ${path}; rerun after integration settles`);
assert.equal(new Set(results.map(r => r.rig)).size, rows.length, 'every selected rig must produce evidence');
const report = { generatedAt: new Date().toISOString(), source: fingerprints,
  modelSha256: Object.fromEntries([...modelBytes].map(([id, data]) => [id, sha256(data)])),
  scope: 'CPU scene-visible geometry and attachment transforms; no GPU, occlusion or machine dimension claims',
  gate: toolSelectionOnly ? 'tool-selection-only' : 'tool-selection-and-generated-string-audit',
  rigs: rows.length, methodPairs: results.length, failedPairs: results.filter(r => r.failures.length).length,
  results, proceduralComparisons, diagnostics };
const jsonAt = args.indexOf('--json');
if (jsonAt >= 0) {
  const output = resolve(ROOT, args[jsonAt + 1]); mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
}
for (const result of results) {
  const s = result.states[0];
  console.log(`${result.rig.padEnd(17)} ${result.method.padEnd(19)} anchor=${String(result.toolAnchor).padEnd(18)} `
    + `string=${s.string?.meshes || 0}/${result.expectedString ? 'needed' : 'unused'} `
    + `surface=${s.surface?.id || '-'} downhole=${s.downhole?.id || '-'} failures=${result.failures.length}`);
}
console.log(`AUDIT: ${report.rigs} actual GLBs; ${report.methodPairs} declared rig/method pairs; ${report.failedPairs} failing pairs (${toolSelectionOnly ? 'tool selection only; string alignment not graded' : 'tool selection and generated-string diagnostics'}).`);
process.exitCode = report.failedPairs ? 1 : 0;
