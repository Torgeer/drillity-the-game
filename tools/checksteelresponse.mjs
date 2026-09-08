/** CPU material-response evidence, not a rendered appearance/FPS verdict.
 * node tools/checksteelresponse.mjs [--source path] [--report path] [--measure-only]
 * Samples the shipping pixel programs, real texture attachment and installed
 * Three shader factors. No browser, canvas context or GPU is started.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as THREE from 'three';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name); return at < 0 ? fallback : args[at + 1];
};
const sourcePath = resolve(option('--source', 'src/core/assets.js'));
const source = readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const { createAssets } = await import(pathToFileURL(sourcePath).href);
const assets = createAssets({ quality: { id: 'low' } });
const failures = [];
const check = (label, run) => {
  try { run(); } catch (error) { failures.push(`${label}: ${error.message}`); }
};
assert.match(THREE.ShaderChunk.roughnessmap_fragment,
  /roughnessFactor\s*\*=\s*texelRoughness\.g/);
assert.match(THREE.ShaderChunk.metalnessmap_fragment,
  /metalnessFactor\s*\*=\s*texelMetalness\.b/);
const floorMatch = THREE.ShaderChunk.lights_physical_fragment.match(
  /material\.roughness\s*=\s*max\(\s*roughnessFactor,\s*([\d.]+)\s*\)/);
assert(floorMatch, 'installed Three physical roughness floor not found');
const shaderFloor = Number(floorMatch[1]);
const start = source.indexOf('function applySet(');
const end = source.indexOf('\n    }', start) + 6;
assert(start >= 0 && end > start, 'production map attachment missing');
const applySet = new Function('THREE', 'cloneForRepeat',
  `return (${source.slice(start, end)});`)(THREE, () => {
    throw new Error('steel unexpectedly requests repeated texture clone');
  });
// ImageData.data is Uint8ClampedArray; preserve its rounding, including ties.
assert.match(source, /orm\[p\s*\+\s*1\]\s*=\s*o\.ro\s*\*\s*255/);
assert.match(source, /orm\[p\s*\+\s*2\]\s*=\s*o\.me\s*\*\s*255/);
const packed = new Uint8ClampedArray(2);

const cases = [
  ['rawSteel', 'default', {}], ['rawSteel', 'heat-blue', { blue: 1 }],
  ['wornSteel', 'default', {}], ['wornSteel', 'polished', { polish: 1, rust: 0 }],
  ['wornSteel', 'rusted', { polish: 0, rust: 1 }],
  ['wornSteel', 'no-thread', { thread: false }],
  ['chrome', 'new', { wear: 0 }], ['chrome', 'default', {}],
  ['chrome', 'worn', { wear: 1 }],
];
const rows = [];
for (const [kind, state, params] of cases) {
  const spec = assets._kinds[kind], d = spec.defaults({ ...params, seed: 7 });
  const mat = spec.base(d);
  const map = new THREE.Texture(), normal = new THREE.Texture(), orm = new THREE.Texture();
  map.colorSpace = THREE.SRGBColorSpace;
  try {
    applySet(kind, spec, mat, { map, normal, orm }, d);
    assert.equal(mat.roughnessMap, orm); assert.equal(mat.metalnessMap, orm);
    assert.equal(orm.colorSpace, THREE.NoColorSpace);
    assert(!mat.transmission, 'transmission introduced');
    assert(!mat.transparent, 'steel unexpectedly becomes transparent');
    const shade = spec.shade(d), n = 192, out = {};
    const albedo = createHash('sha256'), normalInput = createHash('sha256');
    const rgb = new Float64Array(3), height = new Float64Array(1);
    let sumRough = 0, sumPhysicalFloor = 0, minRough = 1, maxRough = 0;
    let sumMetal = 0, maxAuthoredError = 0, belowFloor = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      shade(x / n, y / n, out, x, y, n);
      packed[0] = out.ro * 255; packed[1] = out.me * 255;
      const packedRough = packed[0] / 255, packedMetal = packed[1] / 255;
      const rough = mat.roughness * packedRough, metal = mat.metalness * packedMetal;
      assert([rough, metal, out.r, out.g, out.b, out.h].every(Number.isFinite));
      sumRough += rough; sumMetal += metal;
      sumPhysicalFloor += Math.max(rough, shaderFloor);
      minRough = Math.min(minRough, rough); maxRough = Math.max(maxRough, rough);
      maxAuthoredError = Math.max(maxAuthoredError, Math.abs(rough - packedRough), Math.abs(metal - packedMetal));
      if (rough < shaderFloor) belowFloor++;
      rgb.set([out.r, out.g, out.b]); albedo.update(new Uint8Array(rgb.buffer));
      height[0] = out.h; normalInput.update(new Uint8Array(height.buffer));
    }
    const fb = spec.fallback(d);
    const row = { kind, state, samples: n * n, baseRoughness: mat.roughness,
      baseMetalness: mat.metalness, envMapIntensity: mat.envMapIntensity,
      roughnessMean: sumRough / (n * n), minRough, maxRough,
      roughnessAfterFloorMean: sumPhysicalFloor / (n * n), belowFloor,
      metalnessMean: sumMetal / (n * n), maxAuthoredError,
      primedRoughness: mat.roughness * fb.rough,
      albedoSha256: albedo.digest('hex'), normalInputSha256: normalInput.digest('hex') };
    rows.push(row);
    check(`${kind}/${state} authored ORM reaches lighting`, () => assert.equal(maxAuthoredError, 0));
  } finally { mat.dispose(); map.dispose(); normal.dispose(); orm.dispose(); }
}
check('wear survives chrome shader floor', () => {
  const worn = rows.find(r => r.kind === 'chrome' && r.state === 'worn');
  const fresh = rows.find(r => r.kind === 'chrome' && r.state === 'new');
  assert(worn.roughnessAfterFloorMean > fresh.roughnessAfterFloorMean + 0.01);
});
const glass = assets._kinds.glass.base(assets._kinds.glass.defaults({}));
const glassDiagnosis = { opacity: glass.opacity, transparent: glass.transparent,
  colorLinear: glass.color.toArray(), side: glass.side,
  transmission: glass.transmission, roughness: glass.roughness,
  clearcoat: glass.clearcoat, envMapIntensity: glass.envMapIntensity };
glass.dispose();
const report = { sourcePath, sourceSha256: createHash('sha256').update(source).digest('hex'),
  threeRevision: THREE.REVISION, shaderFloor, rows, glassDiagnosis, failures,
  limits: 'No rendering. Physical roughness includes a screen-space geometry derivative term not measured here.' };
if (option('--report')) writeFileSync(resolve(option('--report')), JSON.stringify(report, null, 2) + '\n');
for (const row of rows) console.log(`${row.kind}/${row.state}: rough=${row.roughnessMean.toFixed(4)}, floor=${row.belowFloor}/${row.samples}`);
console.log(`steel response: ${rows.length} measured states; ${failures.length} failures`);
for (const failure of failures) console.error(failure);
if (failures.length && !args.includes('--measure-only')) process.exitCode = 1;
