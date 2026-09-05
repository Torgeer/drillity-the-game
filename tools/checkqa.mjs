import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { assessQaRun } from './qa-verdict.mjs';
import { methodShot, pageSeedMethod, selectCapturePlan, writeReport } from './shoot.mjs';

const budget = { surface: 80, section: 60, rig: 70, fps: 60, textureMB: 90, particles: 12000 };
const shot = {
  id: 'measured-rig', warm: true, failed: [], ident: { bit: { fits: true } },
  metrics: { surface: { calls: 80 }, section: { calls: 60 }, rig: { calls: 70 },
    fps: 60, texEstMB: 90, particles: { live: 12000 }, ctxLost: false, throttled: false },
};
const grade = (change = {}) => assessQaRun({ shots: [structuredClone(shot)], budget,
  headed: true, render: { ok: true }, ...change });
assert.equal(grade().exitCode, 0, 'the exact published budget limits must pass');
assert.equal(grade({ shots: [] }).status, 'INCOMPLETE', 'zero captures cannot pass');
assert.equal(grade({ shots: [{ ...shot, metrics: { error: 'probe threw' } }] }).exitCode, 2);
for (const channel of ['surface', 'section', 'rig']) {
  const r = structuredClone(shot);
  r.metrics[channel].calls = budget[channel] + 1;
  assert.equal(grade({ shots: [r] }).exitCode, 1, `${channel} budget breach must fail`);
}
for (const change of [{ ctxLost: true }, { fps: 59 }, { texEstMB: 91 }, { particles: { live: 12001 } }]) {
  assert.equal(grade({ shots: [{ ...shot, metrics: { ...shot.metrics, ...change } }] }).exitCode, 1);
}
assert.equal(grade({ shots: [{ ...shot, ident: { bit: { fits: false } } }] }).exitCode, 1);
assert.equal(grade({ shots: [{ ...shot, failed: ['wrong rig'] }] }).exitCode, 1);
assert.equal(grade({ render: { ok: false } }).exitCode, 1);
assert.equal(grade({ logs: ['[pageerror] ReferenceError'] }).exitCode, 1);
assert.equal(grade({ skipped: [{ id: 'missing-rig' }] }).exitCode, 2);
assert.equal(grade({ shots: [shot, { id: 'runtime-skip', skipped: 'builder unavailable' }] }).status, 'INCOMPLETE');
for (const change of [{ warm: false }, { metrics: { ...shot.metrics, throttled: true } }]) {
  const result = grade({ shots: [{ ...shot, ...change }] });
  assert.equal(result.status, 'INCOMPLETE');
  assert.deepEqual(result.over.fps, [], 'cold or throttled fps must not indict the game');
}
assert.equal(grade({ headed: false }).status, 'INCOMPLETE');
assert.equal(grade({ budget: {} }).status, 'FAIL', 'missing budgets must not disable all limits');
for (const change of [{ surface: { calls: 0 } }, { section: { calls: -1 } }, { rig: { calls: 0 } },
  { texEstMB: -1 }, { particles: { live: -1 } }]) {
  assert.notEqual(grade({ shots: [{ ...shot, metrics: { ...shot.metrics, ...change } }] }).status, 'PASS');
}
console.log('OK: QA verdicts reject missing evidence, wrong subjects, runtime errors and every budget breach.');

// Exercise the same planner called before shoot.mjs enters its capture loop.
const plan = [{ id: 'm01-cpu-method', group: 'methods' }, { id: 'r01-cpu-rig', group: 'rigs' }];
assert.deepEqual(selectCapturePlan(plan), plan);
assert.deepEqual(selectCapturePlan(plan, { group: 'methods', filters: ['cpu-method'] }), [plan[0]]);
assert.throws(() => selectCapturePlan(plan, { filters: ['does-not-exist'] }), /No requested capture states/);
assert.throws(() => selectCapturePlan(plan, { group: 'does-not-exist' }), /No requested capture states/);
assert.throws(() => selectCapturePlan([]), /burn-in cannot replace requested coverage/);
assert.deepEqual(selectCapturePlan(plan, { filters: ['does-not-exist'], listOnly: true }), []);
assert.deepEqual(selectCapturePlan([], { listOnly: true }), []);

// Execute the actual in-page method setup with a minimal engine fixture, then
// execute the actual shot verifier. These arbitrary ids are not content facts.
const method = { id: 'cpu-method', name: 'CPU fixture', __i: 1, regions: ['cpu-region'],
  depthRange: [1, 30], modelIds: ['cpu-rig'] };
const identity = { rigId: 'cpu-rig', rigSource: 'glb:cpu-rig', simMethodId: method.id,
  rigMethodId: method.id, simActive: true, depth: 7, liveScreen: 'site', counts: { cluster: 1 } };
const visibleMetrics = { canvas: { surface: { max: 80 } }, ctxLost: false };
const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
async function seededShot({ mode = null, buildable = ['cpu-rig'], selected = true,
  render = 'cpu-rig', preferredSource = mode === 'off' ? 'procedural:cpu-rig' : 'glb:cpu-rig',
  candidates = ['cpu-rig'] } = {}) {
  const loads = [], selections = [];
  globalThis.window = { __DRILLITY: {
    __qa: { startDemoContract: async () => ({ methodId: method.id, targetDepth: 20 }) },
    data: { rigsForMethod: () => candidates.map((id) => ({ id })), rigRenderId: () => render },
    qs: { get: () => mode }, gltfRigs: { load: async (id) => { loads.push(id); } },
    rig: { listRigs: () => buildable, getSourceKey: () => preferredSource,
      setRig: (id) => { selections.push(id); return selected; }, setMethod() {} },
    state: { garage: {} }, sim: { debug: { setDepth() {} } }, geology: { setDepth() {} },
    ui: { show() {} }, renderer: { setCameraMode() {} },
  } };
  const capture = methodShot(method);
  capture.__seed = await pageSeedMethod(method);
  return { capture, loads, selections };
}
const failedChecks = (capture, id = identity) => capture.verify(id, visibleMetrics).filter(([, ok]) => !ok).map(([label]) => label);
try {
  const loaded = await seededShot();
  assert.deepEqual(loaded.loads, ['cpu-rig']);
  assert.deepEqual(loaded.selections, ['cpu-rig']);
  assert.deepEqual(failedChecks(loaded.capture), [], 'actual loaded GLB source passes');
  assert.equal(loaded.capture.extra().expectedRigSource, 'glb:cpu-rig', 'report preserves the expected source');
  assert.ok(failedChecks(loaded.capture, { ...identity, rigSource: 'procedural:cpu-rig' })
    .includes('requested rig source is active'), 'same requested id with a procedural substitute must fail');
  assert.ok(failedChecks(loaded.capture, { ...identity, rigSource: 'glb:another-rig' })
    .includes('requested rig source is active'), 'a different loaded model must fail');
  assert.ok(failedChecks(loaded.capture, { ...identity, rigSource: undefined })
    .includes('requested rig source is active'), 'missing actual source evidence must fail');

  const explicitOff = await seededShot({ mode: 'off' });
  assert.deepEqual(explicitOff.loads, [], 'deliberate GLB-off does not load a model');
  assert.deepEqual(failedChecks(explicitOff.capture, { ...identity, rigSource: 'procedural:cpu-rig' }), []);
  const standin = await seededShot({ buildable: ['cpu-standin'], render: 'cpu-standin', preferredSource: 'procedural:cpu-standin' });
  assert.ok(failedChecks(standin.capture, { ...identity, rigId: 'cpu-standin', rigSource: 'procedural:cpu-standin' })
    .includes('requested rig source is active'), 'registered Blender rig cannot pass through its declared stand-in');
  const refused = await seededShot({ selected: false });
  assert.equal(refused.capture.__seed.ok, false);
  assert.ok(failedChecks(refused.capture).includes('a machine was selected for this method'),
    'an old active rig with the desired id/source cannot hide a refused selection');
  const missing = await seededShot({ buildable: [], candidates: [] });
  assert.equal(missing.capture.__seed.ok, false);
  assert.deepEqual(missing.selections, []);
  assert.ok(failedChecks(missing.capture).includes('a machine was selected for this method'));
  // The actual setup exits before staged driving when no rig was selected.
  let evaluations = 0;
  await missing.capture.setup({ evaluate: async (fn, arg) => { evaluations++; return fn(arg); } });
  assert.equal(evaluations, 1);
  assert.equal(grade({ shots: [{ ...shot, failed: failedChecks(missing.capture) }] }).status, 'FAIL');
} finally {
  if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
  else delete globalThis.window;
}

// Write both real report formats, including a healthy burn-in after a skipped
// requested portrait. The old report filtered out this exact failure path.
const reportDir = mkdtempSync(join(tmpdir(), 'drillity-shoot-qa-'));
const previousExitCode = process.exitCode;
const reportInput = { results: [{ ...shot, id: '13-burnin', group: 'ui' }], logs: [],
  content: { quality: 'high' }, methods: [], rigs: [], skipped: [], unlisted: [],
  bootSec: 0, hashes: new Map(), loads: 1, render: { ok: true }, warm: { warm: true } };
const reportOptions = { outputDir: reportDir, headed: true, stdout: { write() {} } };
try {
  process.exitCode = 0;
  assert.equal(writeReport(reportInput, reportOptions).status, 'PASS');
  assert.equal(process.exitCode, 0);
  process.exitCode = 0;
  const incomplete = writeReport({ ...reportInput, results: [
    { id: 'r01-runtime-skip', group: 'rigs', skipped: 'rigFactory.js cannot build requested machine' },
    ...reportInput.results,
  ] }, reportOptions);
  assert.equal(incomplete.status, 'INCOMPLETE');
  assert.equal(process.exitCode, 2, 'runtime skip must make the CLI exit nonzero even after healthy burn-in');
  const report = JSON.parse(readFileSync(join(reportDir, 'report.json'), 'utf8'));
  assert.equal(report.verdict.status, 'INCOMPLETE');
  assert.equal(report.skipped[0].id, 'r01-runtime-skip');
  assert.equal(report.skipped[0].stage, 'runtime');
  assert.equal(report.coverage.shots, 1);
  assert.match(readFileSync(join(reportDir, 'report.txt'), 'utf8'), /VERDICT: INCOMPLETE/);
  assert.match(readFileSync(join(reportDir, 'report.txt'), 'utf8'), /rigFactory.js cannot build requested machine/);
} finally {
  process.exitCode = previousExitCode;
  assert.equal(dirname(resolve(reportDir)), resolve(tmpdir()));
  assert.ok(basename(reportDir).startsWith('drillity-shoot-qa-'));
  rmSync(reportDir, { recursive: true, force: true });
}
console.log('OK: actual capture planner, method source/selection checks and JSON/text reports reject all three false-pass paths.');
