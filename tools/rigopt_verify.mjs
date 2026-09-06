/** Verify this optimization batch against fresh before/after GLBs.
 * node tools/rigopt_verify.mjs [evidence-directory]
 * Uses rigopt_contracts (and its sole glbinfo actual-vertex ruler).
 * The tunnel jumbo's 2 mm local bounds allowance is for reviewed hose sampling;
 * overall bounds and attachment transforms must remain exactly equal.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGLB } from './glbinfo.mjs';
import { snapshot, compareSnapshots, selfTest } from './rigopt_contracts.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const evidence = resolve(process.argv[2] || resolve(root, '.rig-optimization'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const cases = [
  ['bolter', 'bolter', .001],
  ['crawler-th', 'crawler', .001],
  ['sonic-truck', 'sonic', .001],
  ['tunnel-jumbo', 'tunnel', .002],
];
const report = { selfTest: selfTest(), rigs: [],
  scope: 'CPU exports and contracts. Primitive counts are not rendered draw calls; no GPU/FPS verdict.' };
for (const [id, directory, tolerance] of cases) {
  const beforeBytes = readFileSync(resolve(evidence, directory, 'before.glb'));
  const afterBytes = readFileSync(resolve(evidence, directory, 'after.glb'));
  const before = snapshot(parseGLB(beforeBytes), beforeBytes.length);
  const after = snapshot(parseGLB(afterBytes), afterBytes.length);
  const result = compareSnapshots(before, after, { boundsTolerance: tolerance });
  assert.equal(result.ok, true, `${id}: ${result.failures.join('; ')}`);
  assert.deepEqual(after.bounds, before.bounds, `${id}: overall actual-vertex bounds changed`);
  assert.equal(result.maxTransformDelta, 0, `${id}: attachment transform drift`);
  assert.equal(result.maxAnimationDelta, 0, `${id}: animation sample drift`);
  assert.equal(after.totals.primitives, before.totals.primitives, `${id}: primitive partition changed`);
  assert.ok(after.totals.triangles < before.totals.triangles, `${id}: no triangle saving`);
  assert.ok(afterBytes.length < beforeBytes.length, `${id}: no exported byte saving`);
  const publicBytes = readFileSync(resolve(root, 'public/models', id + '.glb'));
  assert.equal(sha(publicBytes), sha(afterBytes), `${id}: public model is not the verified candidate`);
  report.rigs.push({ id, ...result, overallBounds: after.bounds,
    beforeSHA256: sha(beforeBytes), afterSHA256: sha(afterBytes) });
}
report.ok = true;
console.log(JSON.stringify(report, null, 2));
