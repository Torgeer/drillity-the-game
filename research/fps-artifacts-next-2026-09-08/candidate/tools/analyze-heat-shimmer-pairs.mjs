/** Offline, descriptive paired-render analysis. No browser or production edits. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { assessShimmerPairs } from './live-shimmer-pairs.mjs';
import { assessLiveWindow, assessLiveDiagnosticsV2 } from './profileframes.mjs';

const directory = resolve(process.argv[2] || 'evidence/heat-shimmer/oil-orbit-pairs-02');
const read = name => JSON.parse(readFileSync(resolve(directory, name), 'utf8'));
const report = read('report.json');
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
for (const name of ['tools/profileframes.mjs', 'tools/live-shimmer-pairs.mjs']) {
  if (sha(resolve(name)) !== report.sourceBefore?.[name]?.sha256) throw Error(`Analysis source differs from captured source: ${name}`);
}
const checks = { live: assessLiveWindow(report.live, { gpu: true }),
  shimmer: assessShimmerPairs(report.live?.shimmerPairs),
  cdp: assessLiveDiagnosticsV2(read('cpu-live.cpuprofile'), read('trace-live.json').traceEvents) };
if (!report.valid || Object.values(checks).some(c => !c.valid)) throw Error('Rejected capture: no paired performance analysis accepted');

const stats = values => {
  if (!values.length || values.some(n => !Number.isFinite(n))) throw Error('Invalid descriptive sample');
  const sorted = [...values].sort((a, b) => a - b), n = sorted.length;
  return { count: n, mean: values.reduce((a, b) => a + b, 0) / n,
    median: n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2,
    min: sorted[0], max: sorted.at(-1) };
};
const queries = new Map(report.live.shimmerPairs.gpu.samples.map(q => [`${q.pair}:${q.mask}`, q.ms]));
const frames = new Map(report.live.frames.map(f => [f.frame, f]));
const pairs = report.live.shimmerPairs.pairs.map(p => {
  const identity = p.members[0].before.identity, sim = identity.simulation;
  const onMs = queries.get(`${p.index}:on`), offMs = queries.get(`${p.index}:off`);
  return { pair: p.index, frame: p.frame, order: p.members.map(m => m.mask).join(','), at: p.at,
    depth: sim.depth, rods: sim.rods, phase: sim.phase,
    clockFps: identity.clock.fps, loadScale: identity.vfx.loadScale, particles: identity.vfx.live,
    shimmerStrength: identity.shimmer.uStrength, baseRenderDraw: frames.get(p.frame)?.draw,
    onMs, offMs, onMinusOffMs: onMs - offMs, fractionOfOnRender: (onMs - offMs) / onMs,
    cpuMembers: Object.fromEntries(p.members.map(m => [m.mask, m.cpuMs])),
    witnessedSideCalls: Object.fromEntries(p.members.map(m => [m.mask, m.sidePasses.length])) };
});
const group = rows => ({ onMs: stats(rows.map(p => p.onMs)), offMs: stats(rows.map(p => p.offMs)),
  onMinusOffMs: stats(rows.map(p => p.onMinusOffMs)), fractionOfOnRender: stats(rows.map(p => p.fractionOfOnRender)),
  positiveDifferenceCount: rows.filter(p => p.onMinusOffMs > 0).length });
const output = { reportSha256: sha(resolve(directory, 'report.json')), valid: true,
  scope: 'Descriptive added-full-render GPU cost at held live states, with alternating order. Extra renders and instrumentation affect pacing; this is not normal gameplay FPS or phone acceptance. Pairs across time are dependent; no independence-based confidence interval is claimed.',
  all: group(pairs), byOrder: Object.fromEntries(['on,off', 'off,on'].map(order => [order, group(pairs.filter(p => p.order === order))])),
  queries: { ...report.live.shimmerPairs.gpu, samples: undefined },
  sourceEntries: Object.keys(report.sourceBefore).length, browserProtocol: report.browserProtocol, pairs };
writeFileSync(resolve(directory, 'paired-analysis.json'), JSON.stringify(output, null, 2));
console.log(JSON.stringify({ reportSha256: output.reportSha256, all: output.all, byOrder: output.byOrder }, null, 2));
