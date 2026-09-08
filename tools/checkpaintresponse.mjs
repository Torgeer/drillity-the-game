/** CPU check of the final paint ORM response, not a rendered-image verdict.
 * Uses the shipping pixel programs, map attachment and installed Three shader
 * convention. No browser, canvas, renderer or Blender process is started.
 * node tools/checkpaintresponse.mjs [--source path] [--report path] [--measure-only]
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as THREE from 'three';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : args[at + 1];
};
const sourcePath = resolve(option('--source', 'src/core/assets.js'));
const source = readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const { createAssets } = await import(pathToFileURL(sourcePath).href);
const assets = createAssets({ quality: { id: 'low' } });
const failures = [];
const check = (label, run) => {
  try { run(); } catch (error) { failures.push(`${label}: ${error.message}`); }
};

// Fail if the installed shader convention changes. The CPU calculation below
// is the product Three actually sends into its physical lighting model.
assert.match(THREE.ShaderChunk.roughnessmap_fragment,
  /roughnessFactor\s*\*=\s*texelRoughness\.g/);
assert.match(THREE.ShaderChunk.metalnessmap_fragment,
  /metalnessFactor\s*\*=\s*texelMetalness\.b/);

// Exercise the production map attachment without constructing a DOM canvas.
// These kinds have no repeat parameter, so a new texture allocation is an error.
const applyStart = source.indexOf('function applySet(');
const applyEnd = source.indexOf('\n    }', applyStart) + 6;
assert(applyStart >= 0 && applyEnd > applyStart, 'map attachment function missing');
const applySet = new Function('THREE', 'cloneForRepeat',
  `return (${source.slice(applyStart, applyEnd)});`)(THREE, () => {
    throw new Error('paint unexpectedly clones a texture');
  });
const textureStart = source.indexOf('function newTexture(');
const textureEnd = source.indexOf('\n  }', textureStart) + 4;
assert(textureStart >= 0 && textureEnd > textureStart, 'texture constructor missing');
const newTexture = new Function('THREE', 'resolveWrap', 'anisoCap',
  'registerTex', 'texBytes', `return (${source.slice(textureStart, textureEnd)});`)(
  THREE, () => [THREE.RepeatWrapping, THREE.RepeatWrapping], 1,
  (texture) => texture, (width, height) => width * height * 4);
// The production acquisition path must use data-space textures for ORM.
assert.match(source, /orm:\s*newTexture\(ormCv,\s*\{\s*srgb:\s*false/);

const rows = [];
for (const kind of ['paintedSteel', 'paintedDark']) {
  const spec = assets._kinds[kind];
  assert(spec, `missing ${kind}`);
  for (const [state, params] of [
    ['clean', { wear: 0, dirt: 0 }], ['default', {}],
    ['worn', { wear: 1, dirt: 0 }], ['dirty', { wear: 0, dirt: 1 }],
  ]) {
    const d = spec.defaults({ ...params, seed: 7 });
    const mat = spec.base(d);
    // CanvasTexture does not access a canvas context until a renderer uploads
    // it. A size-only image lets us use the production constructor on the CPU.
    const sizeOnlyImage = { width: 1, height: 1 };
    const map = newTexture(sizeOnlyImage, { srgb: true });
    const normal = newTexture(sizeOnlyImage, { srgb: false });
    const orm = newTexture(sizeOnlyImage, { srgb: false });
    try {
      applySet(kind, spec, mat, { map, normal, orm }, d);
      check(`${kind}/${state} ORM attachment`, () => {
        assert.equal(mat.roughnessMap, orm);
        assert.equal(mat.metalnessMap, orm);
        assert.equal(orm.colorSpace, THREE.NoColorSpace);
        assert.equal(mat.map.colorSpace, THREE.SRGBColorSpace);
        assert.equal(mat.transmission, 0);
      });
      const shade = spec.shade(d), out = {}, n = 192;
      const albedoHash = createHash('sha256');
      const rgb = new Float64Array(3);
      let sumRough = 0, minRough = Infinity, maxMetal = 0;
      let minMetal = Infinity, sumMetal = 0, metalPixels = 0;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        shade(x / n, y / n, out, x, y, n);
        const rough = mat.roughness * out.ro;
        const metal = mat.metalness * out.me;
        assert([rough, metal, out.r, out.g, out.b].every(Number.isFinite));
        sumRough += rough; minRough = Math.min(minRough, rough);
        sumMetal += metal; minMetal = Math.min(minMetal, metal);
        maxMetal = Math.max(maxMetal, metal);
        if (metal > 0.5) metalPixels++;
        rgb.set([out.r, out.g, out.b]);
        albedoHash.update(new Uint8Array(rgb.buffer));
      }
      const fb = spec.fallback(d);
      const row = { kind, state, samples: n * n,
        roughnessMean: sumRough / (n * n), roughnessMin: minRough,
        metalnessMean: sumMetal / (n * n), metalnessMin: minMetal,
        metalnessMax: maxMetal, metalPixels,
        primedRoughness: mat.roughness * fb.rough,
        primedMetalness: mat.metalness * fb.metal,
        albedoSha256: albedoHash.digest('hex') };
      rows.push(row);
      check(`${kind}/${state} authored response reaches the shader`, () => {
        assert(row.primedRoughness >= 0.25, 'primed paint is mirror smooth');
        if (state === 'clean') {
          assert(row.roughnessMin >= 0.25, 'intact paint is mirror smooth');
          assert(row.metalnessMax <= 0.05, 'intact paint becomes metal');
        }
        if (state === 'worn') {
          assert(row.metalPixels > 0, 'exposed metal in wear is suppressed');
          assert(row.metalnessMin <= 0.05, 'remaining paint becomes metal');
        }
      });
    } finally { mat.dispose(); map.dispose(); normal.dispose(); orm.dispose(); }
  }
  const clean = rows.find((r) => r.kind === kind && r.state === 'clean');
  const dirty = rows.find((r) => r.kind === kind && r.state === 'dirty');
  check(`${kind} dirt increases roughness`, () =>
    assert(dirty.roughnessMean > clean.roughnessMean));
}
const report = { sourcePath,
  sourceSha256: createHash('sha256').update(source).digest('hex'),
  threeRevision: THREE.REVISION, rows, failures };
const reportPath = option('--report');
if (reportPath) writeFileSync(resolve(reportPath), JSON.stringify(report, null, 2) + '\n');
for (const row of rows) {
  console.log(`${row.kind}/${row.state}: roughness mean=${row.roughnessMean.toFixed(4)}`
    + ` metal max=${row.metalnessMax.toFixed(4)} metal pixels=${row.metalPixels}/${row.samples}`);
}
console.log(`paint response: ${rows.length} measured states; ${failures.length} failures`);
for (const failure of failures) console.error(failure);
if (failures.length && !args.includes('--measure-only')) process.exitCode = 1;
