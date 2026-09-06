import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/core/renderer.js', import.meta.url), 'utf8');
// Execute the production helper, including the pre-fix nested version. This
// lets the retired-query assertion demonstrate the original regression without
// constructing a WebGLRenderer or replacing the algorithm in a test double.
const helper = source.match(/(?:export )?function programReadiness\([^]*?\n {0,2}\}/)?.[0];
assert.ok(helper, 'production readiness helper found');
const readiness = new Function('gl', `${helper.replace(/^export /, '')}; return programReadiness;`)({ info: {} });
let checks = 0;
const equal = (actual, expected, message) => { checks++; assert.deepEqual(actual, expected, message); };

let retiredQueries = 0;
const retired = { program: undefined, isReady() { retiredQueries++; throw Error('deleted GL handle queried'); } };
const r = readiness(new Set([retired]));
equal(retiredQueries, 0, 'retired program must never reach isReady / getProgramParameter');
equal(r, { done: 0, total: 1, pending: 0, retired: 1, failed: 0 }, 'retirement settles work without reporting ready');

let complete = false;
const active = { program: {}, isReady: () => complete };
const failed = { program: {}, isReady() { throw Error('driver query failed'); } };
equal(readiness([active, failed, retired]),
  { done: 0, total: 3, pending: 1, retired: 1, failed: 1 }, 'pending, retired and query failure stay distinct');
complete = true;
equal(readiness([active]), { done: 1, total: 1, pending: 0, retired: 0, failed: 0 }, 'active completion increments done');
active.program = undefined;
equal(readiness([active]), { done: 0, total: 1, pending: 0, retired: 1, failed: 0 }, 'even a previously ready program can retire');
equal(readiness([]), { done: 0, total: 0, pending: 0, retired: 0, failed: 0 }, 'empty collection remains empty');

// Exercise the actual async methods with recording collaborators and a virtual
// timer. These assertions check caller exit/progress semantics, not source text.
const extractMethod = (name, endMarker) => {
  const start = source.indexOf(`    async ${name}(`);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${name} production body found`);
  return source.slice(start, end).trim().replace(/,$/, '');
};
const warmBody = extractMethod('warmShaders', '\n    async init()');
const titleBody = extractMethod('warmTitle', '\n    /** Draw the title');
const bind = (body, deps) => new Function(...Object.keys(deps), `return ({ ${body} });`)(...Object.values(deps));

async function exercise(kind, states, { parallel = true, timeout = false } = {}) {
  let now = 0, polls = 0, queries = 0;
  const programs = states.map(state => ({ program: state === 'retired' ? undefined : {},
    isReady() { queries++; if (state === 'failed') throw Error('query failed');
      return state === 'ready' || (state === 'pending' && polls > 0 && !timeout); } }));
  const progress = [];
  const deps = { programReadiness: readiness, performance: { now: () => now },
    hasParallelCompile: () => parallel, gl: { info: { programs }, getRenderTarget: () => null, setRenderTarget() {} },
    withWarmTarget: fn => fn(), compilePrograms: (_root, _cam, set) => programs.forEach(p => set.add(p)),
    scene: {}, camera: {}, sectionScene: {}, sectionCamera: {}, titleScene: {}, titleCamera: {},
    titleGeneration: 0, warmPost: () => 0, warnOnce() { throw Error('unexpected warning'); },
    setTimeout(fn) {
      polls++; assert.ok(polls < 5, 'settled work cannot loop forever');
      states.forEach((state, i) => { if (state === 'retiring') programs[i].program = undefined; });
      now += timeout ? 61_000 : 16; fn();
    } };
  const api = bind(kind === 'warm' ? warmBody : titleBody, deps);
  const result = kind === 'warm' ? await api.warmShaders((done, total) => progress.push([done, total])) : await api.warmTitle();
  return { result, progress, polls, queries };
}

for (const kind of ['warm', 'title']) {
  for (const state of ['retired', 'failed']) {
    const { result, polls, progress, queries } = await exercise(kind, ['ready', state]);
    equal(result.ready, false, `${kind}: ${state} never produces ready`);
    equal(result.reason, state === 'retired' ? 'program-retired' : 'query-failed', `${kind}: truthful failure reason`);
    equal(polls, 0, `${kind}: ${state} batch exits without deadline delay`);
    if (state === 'retired') equal(queries, 1, `${kind}: only live program queried`);
    if (kind === 'warm') equal(progress, [[1, 2]], 'failed/retired share stays outside completed progress');
  }
  const pending = await exercise(kind, ['ready', 'pending']);
  equal(pending.result.ready, true, `${kind}: active pending then ready completes`);
  equal(pending.polls, 1, `${kind}: active pending waits for actual readiness`);
  const retiring = await exercise(kind, ['retiring']);
  equal(retiring.result.ready, false, `${kind}: retirement between timer ticks is not completion`);
  equal(retiring.queries, 1, `${kind}: retired second tick skips the captured GL handle`);
  equal(retiring.polls, 1, `${kind}: retirement settles the next timer tick`);
  equal((await exercise(kind, ['pending'], { timeout: true })).result.ready, false, `${kind}: timeout is not readiness`);
  equal((await exercise(kind, ['ready'], { parallel: false })).result.ready, false, `${kind}: unavailable nonblocking measurement is not driver-ready evidence`);
}
console.log(`PROGRAM READINESS: ${checks} assertions passed; retired handles, query failures, active progress and actual warm/title poll exits. CPU only.`);
