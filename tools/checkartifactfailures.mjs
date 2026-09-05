/** Exercise malformed contracts and unexpected build resources in an isolated tree. */
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
// Keep fixtures under the repository so copied Vite gates resolve the installed
// dependencies. No gate in this script reads or mutates the real dist tree.
const scratch = resolve(root, '.bak');
mkdirSync(scratch, { recursive: true });
const fixture = mkdtempSync(join(scratch, 'artifact-gate-regression-'));
const put = (path, content) => {
  const target = join(fixture, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
};
const copy = (path) => {
  mkdirSync(dirname(join(fixture, path)), { recursive: true });
  copyFileSync(join(root, path), join(fixture, path));
};
const run = (script, args = []) => {
  const result = spawnSync(process.execPath, [join(fixture, script), ...args],
    { cwd: fixture, encoding: 'utf8', timeout: 30_000 });
  if (result.error) throw result.error;
  return { status: result.status, text: result.stdout + result.stderr };
};
let rejected = 0;
const reject = (result, reason) => {
  assert.equal(result.status, 1, result.text);
  assert.match(result.text, reason);
  rejected++;
};
const pass = (result) => assert.equal(result.status, 0, result.text);

// Expressions intentionally preserve NaN/Infinity/undefined instead of JSON's
// conversion to null. This is the same JS module boundary the real gate reads.
const contractData = ({ depth = '10', spec = "[{id:'rock',thickness:10}]",
  allowance = '0', window = '[1,100]', vertical = false, capacity = '100' } = {}) => `
export const METHODS=[{id:'fixture',validGround:['rock']}];
export const RIGS=[{id:'fixture',methods:['fixture'],stats:{depthCapacity:${capacity}}}];
export const REGIONS=[{id:'fixture'}]; export const MAX_LEVEL=60;
export const DEPTH_IS_VERTICAL=${vertical ? "['fixture']" : '[]'};
export const preCollarFor=()=>${allowance};
export const depthWindow=()=>(${window});
export const makeContract=()=>({methodId:'fixture',archetype:'fixture',
  targetDepth:${depth},groundSpec:${spec}});`;
const beds = (params) => {
  put('src/game/data.js', contractData(params));
  return run('tools/checkbeds.mjs', ['1']);
};

try {
  put('package.json', '{"type":"module"}');
  for (const path of ['tools/checkbeds.mjs', 'tools/checkbuild.mjs',
    'src/core/contract.js', 'vite.config.js']) copy(path);
  pass(beds());
  pass(beds({ vertical: true }));
  pass(beds({ allowance: 'Infinity', spec: "[{id:'sand',thickness:1},{id:'rock',thickness:9}]" }));
  for (const depth of ['NaN', 'Infinity', '0', '-1', 'undefined', "'10'"]) {
    reject(beds({ depth }), /targetDepth must be finite and positive/);
  }
  for (const thickness of ['NaN', 'Infinity', '0', '-1', 'undefined', "'1'"]) {
    // An invalid undrillable layer must not disappear in NaN comparisons.
    reject(beds({ spec: `[{id:'sand',thickness:${thickness}},{id:'rock',thickness:10}]` }),
      /thickness must be finite and positive/);
  }
  for (const spec of ['[]', '{}', 'null']) reject(beds({ spec }), /invalid groundSpec/);
  reject(beds({ spec: '[null]' }), /groundSpec\[0\] has no ground id/);
  for (const allowance of ['NaN', '-Infinity', '-1', 'undefined', "'10'"]) {
    reject(beds({ allowance }), /allowance must be a nonnegative number/);
  }
  for (const window of ['[NaN,100]', '[1,Infinity]', '[100,1]', 'undefined', '[0,100]']) {
    reject(beds({ window }), /depth window must contain finite positive ordered bounds/);
  }
  reject(beds({ vertical: true, capacity: 'Infinity' }), /deepest rig/);
  for (const count of ['0', '-1', 'Infinity', '1.5', 'not-a-number']) {
    reject(run('tools/checkbeds.mjs', [count]), /cards per region must be a positive integer/);
  }

  put('src/game/data.js', "export const RIGS=[{id:'fixture'}];");
  put('dist/index.html', '<!doctype html><html><body><script>0;</script></body></html>');
  // Byte fixtures exercise artifact inventory/equality. GLB validity belongs
  // to checkmodels and its real-model fixtures, not this build inventory gate.
  for (const path of ['models/fixture.glb', 'media/texture.bin']) {
    const bytes = Buffer.from(`artifact fixture: ${path}`);
    put(`public/${path}`, bytes);
    put(`dist/${path}`, bytes);
  }
  const build = () => run('tools/checkbuild.mjs');
  pass(build());
  for (const path of ['stale-entry.js', 'models/unused-model.bin', 'nested/old/cache.bin']) {
    put(`dist/${path}`, 'unexpected output');
    reject(build(), /built output inventory must be exactly/);
    rmSync(join(fixture, 'dist', path));
  }
  put('dist/models/fixture.glb', 'stale bytes');
  reject(build(), /missing or stale in the built game/);
  rmSync(join(fixture, 'dist/media/texture.bin'));
  reject(build(), /built output inventory must be exactly/);
  // Copy the actual browser-driver scripts for checkhaptics' silence inventory.
  // They are read as text by the gate; no browser is launched by this fixture.
  const copyScripts = (dir, depth, prefix = '') => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.git', 'dist', '.bak'].includes(entry.name)) continue;
      const path = prefix + entry.name;
      if (entry.isDirectory()) {
        if (depth > 0) copyScripts(join(dir, entry.name), depth - 1, path + '/');
      } else if (entry.name.endsWith('.mjs')) copy(path);
    }
  };
  copyScripts(root, 1);
  for (const path of ['src/audio/audio.js', 'src/audio/haptics.js', 'src/sim/drilling.js']) copy(path);
  const haptics = () => run('tools/checkhaptics.mjs');
  pass(haptics());
  const hapticSource = readFileSync(join(root, 'src/audio/haptics.js'), 'utf8');
  const simSource = readFileSync(join(root, 'src/sim/drilling.js'), 'utf8');
  const missingKick = hapticSource.replace(/^\s*'kick':\s*'rampDown',\r?\n/m, '');
  assert.notEqual(missingKick, hapticSource, 'the real kick mapping must exist before removing it');
  put('src/audio/haptics.js', missingKick);
  const kickCase = simSource.match(/case 'kick':[\s\S]*?\bbreak;/)?.[0];
  assert.ok(kickCase, 'the actual kick handler must exist');
  const compactKick = kickCase.replace(/\/\/[^\n]*\n/g, ' ').replace(/\s+/g, ' ');
  const wrappedKick = kickCase.replace("case 'kick':", 'case "kick":')
    .replace("haptic('heavy', true, h.kind)", "haptic(\n 'heavy', /* pulse */\n true,\n h.kind\n)");
  for (const body of [kickCase, compactKick, wrappedKick]) {
    put('src/sim/drilling.js', simSource.replace(kickCase, body));
    reject(haptics(), /forwarded hazards have no signature: kick/);
  }
  put('src/audio/haptics.js', hapticSource);
  // A shared handler forwards the original kind through a fall-through label.
  const fallthrough = simSource.replaceAll("'gel-clock'", "'fixture-fallthrough'")
    .replace("case 'fixture-fallthrough':", "case 'fixture-fallthrough': case 'gel-clock':");
  assert.notEqual(fallthrough, simSource);
  put('src/sim/drilling.js', fallthrough);
  reject(haptics(), /forwarded hazards have no signature: fixture-fallthrough/);
  put('src/sim/drilling.js', simSource + "\n// case 'fixture-comment': haptic('heavy', true, h.kind);\n");
  pass(haptics());
  console.log(`OK: ${rejected} contract, build-artifact and haptic-mapping mutations rejected; valid controls pass.`);
} finally {
  // Verify the absolute target remains a direct child of the intended scratch
  // directory before recursive deletion, including on Windows.
  assert.equal(dirname(resolve(fixture)), scratch);
  rmSync(fixture, { recursive: true, force: true });
}
