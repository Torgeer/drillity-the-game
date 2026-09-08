#!/usr/bin/env node
// Independent offline critic. Executes the pinned DevTools conversion/sort bodies
// as its oracle; never rewrites the historical recordings or opens a browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const sourceOnly = process.argv.includes('--source-only');
const read = path => fs.readFileSync(new URL(path, root));
const sha = value => createHash('sha256').update(value).digest('hex');
const manifest = JSON.parse(read('research/cdp-primary-2026-09-08/sources.json'));
for (const file of manifest.files) assert.equal(sha(read('research/cdp-primary-2026-09-08/' + file.name)), file.sha256);
const devtools = read('research/cdp-primary-2026-09-08/CPUProfileDataModel.ts').toString();
function body(name) {
  const start = devtools.indexOf('  private ' + name + '(');
  assert(start >= 0, 'pinned primary method is present');
  const open = devtools.indexOf('{', start), end = devtools.indexOf('\n  }', open);
  assert(end > open);
  return devtools.slice(open + 1, end);
}
const convert = new Function('profile', body('convertTimeDeltas'));
const sort = new Function(body('sortSamples'));
function oracle(profile) {
  const timestamps = convert(profile);
  const ids = { timestamps: [...timestamps], samples: [...profile.samples] };
  const indices = { timestamps: [...timestamps], samples: profile.samples.map((_, i) => i) };
  sort.call(ids); sort.call(indices);
  return { rawTimestamps: timestamps, timestamps: ids.timestamps, samples: ids.samples, order: indices.samples };
}
const groups = [];
function test(name, fn) {
  try { fn(); groups.push({ name, pass: true }); }
  catch (error) { groups.push({ name, pass: false, error: error.stack }); }
}
const profile = () => ({ startTime: 100, endTime: 220,
  nodes: [{ id: 1, callFrame: { functionName: '(root)', scriptId: '0', url: '', lineNumber: -1, columnNumber: -1 }, children: [2, 3] },
    { id: 2, callFrame: { functionName: 'alpha', scriptId: '1', url: 'fixture.js', lineNumber: 0, columnNumber: 0 } },
    { id: 3, callFrame: { functionName: 'beta', scriptId: '1', url: 'fixture.js', lineNumber: 1, columnNumber: 0 } }],
  samples: [2, 3, 2, 3, 2], timeDeltas: [10, 40, -20, 0, 60] });
const trace = () => [{ name: 'drillity-live-start', cat: 'blink.user_timing', ts: 100 },
  { name: 'drillity-live-end', cat: 'blink.user_timing', ts: 200 }];
test('primary sort retains sample associations and equal-time stable order', () => {
  const p = profile(), before = structuredClone(p), o = oracle(p);
  assert.deepEqual(o, { rawTimestamps: [110, 150, 130, 130, 190], timestamps: [110, 130, 130, 150, 190],
    samples: [2, 2, 3, 3, 2], order: [0, 2, 3, 1, 4] });
  assert.deepEqual(p, before);
});
test('sorting signed intervals themselves corrupts the primary timestamps', () => {
  const p = profile(); assert.notDeepEqual(oracle({ ...p, timeDeltas: [...p.timeDeltas].sort((a, b) => a - b) }).timestamps, oracle(p).timestamps);
});
test('clamping negatives corrupts later timestamps', () => {
  const p = profile(); assert.notDeepEqual(oracle({ ...p, timeDeltas: p.timeDeltas.map(x => Math.max(0, x)) }).timestamps, oracle(p).timestamps);
});
const records = [];
for (const [name, expected] of [['oil-vfx-on-first-01', [[15292, -48], [25382, -38], [25530, -50], [28225, -32]]],
  ['oil-vfx-on-first-02', [[19490, -58], [23565, -33], [29309, -31], [29392, -34], [34586, -52]]]]) {
  const dir = new URL('../drillity-fps-investigation/evidence/fps/' + name + '/', root);
  const files = Object.fromEntries(['report.json', 'cpu-live.cpuprofile', 'trace-live.json'].map(n => [n, fs.readFileSync(new URL(n, dir))]));
  const hashes = Object.fromEntries(Object.entries(files).map(([n, v]) => [n, sha(v)]));
  const report = JSON.parse(files['report.json']), p = JSON.parse(files['cpu-live.cpuprofile']);
  const o = oracle(p), nodes = new Map(p.nodes.map(n => [n.id, n.callFrame]));
  const negatives = p.timeDeltas.flatMap((delta, index) => delta < 0 ? [{ index, delta,
    previousTimestamp: o.rawTimestamps[index - 1], timestamp: o.rawTimestamps[index],
    previousNode: p.samples[index - 1], node: p.samples[index], callFrame: nodes.get(p.samples[index]) }] : []);
  const moved = o.order.flatMap((originalIndex, sortedIndex) => originalIndex === sortedIndex ? [] : [{ originalIndex, sortedIndex }]);
  test(name + ': original rejection, complete retained pairing and bounded timestamps', () => {
    assert.equal(report.valid, false);
    assert.equal(p.samples.length, p.timeDeltas.length);
    assert(p.timeDeltas.every(Number.isSafeInteger));
    assert(o.rawTimestamps.every(t => Number.isSafeInteger(t) && t >= p.startTime && t <= p.endTime));
    assert.deepEqual(negatives.map(n => [n.index, n.delta]), expected);
    assert(negatives.every(n => n.node === n.previousNode && n.callFrame.functionName === '(program)'));
    assert.equal(moved.length, expected.length * 2);
    assert.equal(new Set(o.order).size, p.samples.length);
    assert(o.order.every((original, sorted) => o.samples[sorted] === p.samples[original] && o.timestamps[sorted] === o.rawTimestamps[original]));
    for (const [file, hash] of Object.entries(hashes)) assert.equal(sha(fs.readFileSync(new URL(file, dir))), hash);
  });
  records.push({ name, originalValid: report.valid, browserRecorded: report.setup.browser, hashes,
    samples: p.samples.length, startTime: p.startTime, endTime: p.endTime, first: o.timestamps[0], last: o.timestamps.at(-1),
    signedTotalUs: p.timeDeltas.reduce((a, b) => a + b, 0), negatives, moved,
    derivedMeaning: 'Offline paired chronology only; historical overall rejection and confounded feature comparison unchanged.' });
}
let productionHash = null;
if (!sourceOnly) {
  productionHash = sha(read('tools/profileframes.mjs'));
  const { assessLiveDiagnosticsV2: assess, assessLiveDiagnostics: legacy } = await import('./profileframes.mjs');
  assert.equal(typeof assess, 'function', 'author V2 must exist; --source-only is not its acceptance');
  test('V2 accepts signed bounded chronology without mutating raw', () => {
    const p = profile(), t = trace(), before = structuredClone({ p, t });
    const a = assess(p, t), o = oracle(p);
    assert.equal(a.valid, true);
    assert.equal(a.protocol, 'cdp-signed-cumulative-v2');
    assert.deepEqual(a.orderedSampleIndices, o.order);
    assert.deepEqual(a.reorderedSamples, o.order.flatMap((rawIndex, chronologicalIndex) => rawIndex === chronologicalIndex ? [] : [{ rawIndex, chronologicalIndex }]));
    assert.deepEqual(a.negativeDeltas, [{ index: 2, deltaUs: -20, timestampUs: 130, nodeId: 2 }]);
    assert.deepEqual({ p, t }, before);
    assert.equal(legacy(p, t).valid, false, 'historical strict gate remains unchanged');
  });
  const bad = [
    ['null profile', (p) => null], ['missing samples', p => { delete p.samples; return p; }],
    ['empty samples', p => { p.samples = []; p.timeDeltas = []; return p; }],
    ['samples object', p => { p.samples = { length: 5 }; return p; }],
    ['timeDeltas object', p => { p.timeDeltas = { length: 5 }; return p; }],
    ['mismatched lengths', p => { p.timeDeltas.pop(); return p; }],
    ['sparse deltas', p => { delete p.timeDeltas[2]; return p; }],
    ['sparse samples', p => { delete p.samples[2]; return p; }],
    ['NaN delta', p => { p.timeDeltas[2] = NaN; return p; }],
    ['Infinity delta', p => { p.timeDeltas[2] = Infinity; return p; }],
    ['fractional delta', p => { p.timeDeltas[2] = -.1; return p; }],
    ['string delta', p => { p.timeDeltas[2] = '-20'; return p; }],
    ['timestamp before start', p => { p.timeDeltas[2] = -60; return p; }],
    ['intermediate overshoot hidden by later negative', p => { p.timeDeltas = [10, 200, -180, 0, 60]; return p; }],
    ['last timestamp after end', p => { p.timeDeltas[4] = 100; return p; }],
    ['all-zero timing', p => { p.timeDeltas.fill(0); return p; }],
    ['invalid interval', p => { p.endTime = p.startTime; return p; }],
    ['unsafe start timestamp', p => { p.startTime = Number.MAX_SAFE_INTEGER + 1; return p; }],
    ['NaN end timestamp', p => { p.endTime = NaN; return p; }],
    ['negative start timestamp', p => { p.startTime = -100; return p; }],
    ['unknown sample id', p => { p.samples[2] = 999; return p; }],
    ['null sample id', p => { p.samples[2] = null; return p; }],
    ['missing nodes', p => { p.nodes = []; return p; }],
    ['null node', p => { p.nodes[1] = null; return p; }],
    ['sparse nodes', p => { delete p.nodes[1]; return p; }],
    ['duplicate node id', p => { p.nodes[2].id = 2; return p; }],
    ['fractional node id', p => { p.nodes[1].id = 2.5; return p; }],
    ['missing callFrame', p => { delete p.nodes[1].callFrame; return p; }],
  ];
  for (const [name, mutate] of bad) test('V2 rejects ' + name, () => assert.equal(assess(mutate(profile()), trace()).valid, false));
  for (const [name, t] of [['empty trace', []], ['missing end mark', trace().slice(0, 1)],
    ['duplicate start', [...trace(), trace()[0]]], ['reverse marks', trace().map((x, i) => ({ ...x, ts: i ? 100 : 200 }))],
    ['NaN mark', trace().map((x, i) => ({ ...x, ts: i ? NaN : x.ts }))], ['null trace event', [...trace(), null]]]) {
    test('V2 rejects ' + name, () => assert.equal(assess(profile(), t).valid, false));
  }
  test('V2 allows zero first delta and equal sample timestamps with elapsed coverage', () => {
    const p = profile(); p.timeDeltas = [0, 40, 0, -10, 60]; assert.equal(assess(p, trace()).valid, true);
  });
  test('V2 orders a non-adjacent final inversion without treating last raw index as latest time', () => {
    const p = profile(); p.timeDeltas = [0, 40, 10, -10, -40];
    const a = assess(p, trace());
    assert.equal(a.valid, true);
    assert.deepEqual(a.orderedSampleIndices, oracle(p).order);
  });
  for (const record of records) test(record.name + ': V2 derived order equals primary oracle; original remains rejected', () => {
    const dir = new URL('../drillity-fps-investigation/evidence/fps/' + record.name + '/', root);
    const p = JSON.parse(fs.readFileSync(new URL('cpu-live.cpuprofile', dir)));
    const rawTrace = JSON.parse(fs.readFileSync(new URL('trace-live.json', dir)));
    const events = Array.isArray(rawTrace) ? rawTrace : rawTrace.traceEvents;
    const a = assess(p, events), o = oracle(p);
    assert.equal(a.valid, true);
    assert.deepEqual(a.orderedSampleIndices, o.order);
    assert.equal(a.negativeDeltas.length, record.negatives.length);
    assert.equal(a.reorderedSamples.length, record.moved.length);
    for (const [file, expected] of Object.entries(record.hashes)) assert.equal(sha(fs.readFileSync(new URL(file, dir))), expected);
  });
  assert.equal(sha(read('tools/profileframes.mjs')), productionHash, 'author source did not change during test');
}
const result = { version: 1, mode: sourceOnly ? 'primary-source-and-raw-only' : 'primary-source-raw-and-author-V2',
  generated: new Date().toISOString(), sourceManifestHash: sha(read('research/cdp-primary-2026-09-08/sources.json')),
  toolHash: sha(fs.readFileSync(new URL(import.meta.url))), productionHash, groups, records,
  valid: groups.every(g => g.pass), limits: ['No browser or GPU executed.', 'No original capture was reclassified or rewritten.',
    'Source main revisions establish implementation semantics, not the exact unrecorded binary revision.',
    'Queue provenance and OS mechanism are not present in these artifacts.'] };
const out = process.argv.indexOf('--out');
if (out >= 0) fs.writeFileSync(new URL(process.argv[out + 1], root), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ valid: result.valid, mode: result.mode, groups: groups.length,
  failures: groups.filter(g => !g.pass), raw: records.map(r => ({ name: r.name, samples: r.samples, negatives: r.negatives.length, moved: r.moved.length })),
  productionHash, toolHash: result.toolHash }, null, 2));
if (!result.valid) process.exitCode = 1;
