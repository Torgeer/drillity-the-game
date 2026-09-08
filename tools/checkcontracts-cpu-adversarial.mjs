#!/usr/bin/env node
/**
 * Independent negative controls for checkcontracts.mjs's real-data CPU path.
 * Run: node tools/checkcontracts-cpu-adversarial.mjs
 * Copies the actual gate and its local data dependencies into a private temp
 * directory. Each fault changes only that copy, after normal board generation.
 * A rejection requires the intended assertion, not an import/runtime exception.
 * No browser, server, GPU, live save, or repository data is modified.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const sources = ['tools/checkcontracts.mjs', 'src/game/data.js',
  'src/core/contract.js', 'src/game/equipment-support.js'];
const bytes = new Map(sources.map(path => [path, readFileSync(join(root, path))]));
const dataSource = bytes.get('src/game/data.js').toString('utf8');
const baseDir = realpathSync(tmpdir());
const fixture = mkdtempSync(join(baseDir, 'drillity-contracts-cpu-critic-'));
const relativeFixture = relative(baseDir, realpathSync(fixture));
assert.ok(relativeFixture && relativeFixture !== '..' && !relativeFixture.startsWith(`..${sep}`)
  && resolve(baseDir, relativeFixture) === realpathSync(fixture), 'fixture must remain within its temp parent');

function put(path, content) {
  const target = join(fixture, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}
function run(flag = '--cpu') {
  const result = spawnSync(process.execPath, [join(fixture, 'tools/checkcontracts.mjs'), flag], {
    cwd: fixture, encoding: 'utf8', timeout: 30_000, maxBuffer: 2 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  assert.equal(result.signal, null, 'child must complete without a signal');
  return { status: result.status, text: result.stdout + result.stderr };
}
function replaceOnce(source, needle, replacement) {
  assert.equal(source.split(needle).length, 2, `expected one mutation anchor: ${needle}`);
  return source.replace(needle, replacement);
}
function boardFault(statement) {
  const start = dataSource.indexOf('export function makeContractBoard(');
  assert.ok(start >= 0, 'actual exported board generator is present');
  const tail = dataSource.slice(start);
  const end = tail.indexOf('\n}\n') >= 0 ? tail.indexOf('\n}\n') : tail.indexOf('\n}\r\n');
  assert.ok(end >= 0, 'board function end is present');
  const body = tail.slice(0, end);
  const changed = replaceOnce(body, '  return out;', `  ${statement}\n  return out;`);
  return dataSource.slice(0, start) + changed + tail.slice(end);
}
const cases = [
  ['empty board', 'out.length = 0;', /expected five real contracts/],
  ['short board', 'out.pop();', /expected five real contracts/],
  ['nonarray board', 'return { length: 5 };', /board must be an array/],
  ['blank identity', "out[0].id = '  ';", /id must not be blank/],
  ['duplicate identity', 'out[1].id = out[0].id;', /duplicate identity on board/],
  ['unresolved text', "out[0].description = 'undefined';", /description has unresolved content/],
  ['wrong region', "out[0].regionId = 'critic-nonexistent-region';", /wrong region/],
  ['unavailable method', "out[0].methodId = 'critic-nonexistent-method';", /unavailable method/],
  ['wrong required method', "out[0].requiredMethod = 'critic-nonexistent-method';", /required method disagrees/],
  ['unknown application', "out[0].applicationId = 'critic-nonexistent-application';", /unknown application/],
  ['unknown site', "out[0].archetype = 'critic-nonexistent-site';", /invalid site archetype/],
  ['wrong site plane', "out[0].sitePlane = 'critic-nonexistent-plane';", /site plane disagrees/],
  ['missing flush medium', "out[0].flushMedium = 'critic-nonexistent-medium';", /flush medium disagrees/],
  ['nonfinite depth', 'out[0].targetDepth = NaN;', /targetDepth must be finite and positive/],
  ['fractional holes', 'out[0].holes = 1.5;', /holes must be a positive integer/],
  ['negative payout', 'out[0].payout = -1;', /payout must be finite and nonnegative/],
  ['nonfinite payout', 'out[0].payout = Infinity;', /payout must be finite and nonnegative/],
  ['wrong total metres', 'out[0].metres += 1;', /total metres disagree with scope/],
  ['deadline before estimate', 'out[0].deadlineHours = out[0].estimatedHours / 2;', /deadline precedes estimated completion/],
  ['missing constraint', 'out[0].constraint = null;', /missing constraint/],
  ['nonarray certificates', "out[0].requiredCerts = 'critic-cert';", /required certificates must be an array/],
  ['unknown certificate', "out[0].requiredCerts = ['critic-nonexistent-cert'];", /unknown certificate/],
  ['duplicate certificates', 'out[0].requiredCerts = [CERTS[0].id, CERTS[0].id];', /duplicate required certificate/],
];

let rejected = 0;
try {
  for (const [path, content] of bytes) put(path, content);
  put('package.json', '{"type":"module"}\n');
  const expectedHash = createHash('sha256').update(bytes.get('src/game/data.js')).digest('hex');
  for (const flag of ['--cpu', '--self-test']) {
    const baseline = run(flag);
    assert.equal(baseline.status, 0, baseline.text);
    assert.ok(baseline.text.includes(`production data.js sha256=${expectedHash}`), baseline.text);
    const coverage = baseline.text.match(/; (\d+) boards, (\d+) contracts, (\d+) methods, (\d+) regions/);
    assert.ok(coverage && coverage.slice(1).every(value => Number(value) > 0), baseline.text);
    assert.equal(Number(coverage[2]), Number(coverage[1]) * 5, 'each board contributes five real contracts');
    assert.match(baseline.text, /headed DOM\/layout\/interaction verification was not run/);
    console.log(`PASS ${flag}: ${coverage[1]} boards, ${coverage[2]} contracts, ${coverage[3]} methods, ${coverage[4]} regions`);
  }
  function reject(name, mutated, expected) {
    put('src/game/data.js', mutated);
    const result = run();
    assert.equal(result.status, 1, `${name}: ${result.text}`);
    assert.match(result.text, /AssertionError/, `${name}: failure must be an intentional assertion`);
    assert.match(result.text, expected, `${name}: ${result.text}`);
    assert.doesNotMatch(result.text, /ERR_MODULE_NOT_FOUND|SyntaxError|TypeError|ReferenceError/,
      `${name}: incidental crashes must not count as rejection`);
    assert.doesNotMatch(result.text, /PASS: production data\.js/, `${name}: must not report content success`);
    rejected++;
  }
  for (const [name, statement, expected] of cases) reject(name, boardFault(statement), expected);
  // These exercise imported table coverage and validateData before generation.
  // Internal METHODS remains untouched; only its public export becomes empty.
  reject('empty imported methods', replaceOnce(dataSource, 'export const METHODS =', 'const METHODS =')
    + '\nconst criticEmptyMethods = []; export { criticEmptyMethods as METHODS };\n', /production contract tables must be nonempty/);
  const validationStart = dataSource.indexOf('export function validateData()');
  assert.ok(validationStart >= 0);
  reject('reported production validation fault', dataSource.slice(0, validationStart)
    + replaceOnce(dataSource.slice(validationStart), 'return problems;', "return [...problems, 'critic validation fault'];"),
  /production data\.js validation/);
  console.log(`PASS: ${rejected} independent real-data mutations rejected by their intended assertions; no browser launched.`);
} finally {
  for (const [path, before] of bytes) {
    assert.deepEqual(readFileSync(join(root, path)), before, `${path} changed during critic checks; repeat on a stable snapshot`);
  }
  // Delete only the resolved, mkdtemp-created directory checked above.
  rmSync(fixture, { recursive: true, force: true });
}
