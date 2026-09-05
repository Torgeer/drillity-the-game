/** CPU-only material contract checks and deterministic paint measurements.
 *
 * No browser or renderer is created. The existing pixel programs and the
 * exact production normalFromHeight function are used; the normal algorithm
 * is not reimplemented here. Texture metrics are not rendered-frame metrics.
 *
 * node tools/checkmaterials.mjs [--report path.json] [--measure-only]
 *                              [--source alternate-assets-module.mjs]
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : args[at + 1];
};
const sourcePath = resolve(option('--source', 'src/core/assets.js'));
const source = readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const { createAssets } = await import(pathToFileURL(sourcePath).href);
const failures = [];
const check = (description, run) => {
  try { run(); } catch (error) { failures.push(`${description}: ${error.message}`); }
};

// Extract this pure utility from the module under test. Fail if its source
// contract changes instead of silently measuring a stale copy of the formula.
const normalStart = source.indexOf('async function normalFromHeight(');
const normalEnd = source.indexOf('\n}\n', normalStart) + 2;
assert(normalStart >= 0 && normalEnd > normalStart, 'production normal function missing');
const normalFromHeight = new Function(`return (${source.slice(normalStart, normalEnd)});`)();
const sizes = source.match(/const RES_CLASS = (\{[\s\S]*?\n\});/);
assert(sizes, 'production resolution table missing');
const resolutions = new Function(`return (${sizes[1]});`)();

const A = createAssets({ quality: { id: 'high' } });
const kinds = A._kinds;
assert(Object.keys(kinds).length > 0, 'no material kinds measured');
let checkedBases = 0;
for (const [name, spec] of Object.entries(kinds)) {
  check(`${name} base material`, () => {
    const material = spec.base(spec.defaults({}));
    try {
      checkedBases++;
      assert(!(material.transmission > 0), `transmission=${material.transmission}`);
    } finally { material.dispose(); }
  });
}

let checkedWearKinds = 0;
for (const [kind, spec] of Object.entries(kinds)) {
  if (!Object.hasOwn(spec.defaults({}), 'wear')) continue;
  checkedWearKinds++;
  for (const wear of [0, 0.5, 1]) {
    check(`${kind} wear=${wear}`, () => assert.equal(spec.defaults({ wear }).wear, wear));
  }
  check(`${kind} clamps wear`, () => {
    assert.equal(spec.defaults({ wear: -1 }).wear, 0);
    assert.equal(spec.defaults({ wear: 2 }).wear, 1);
  });
}
check('dark chassis retains its default wear', () =>
  assert.equal(kinds.paintedDark.defaults({}).wear, 0.46));
for (const kind of ['glass', 'paintedSteel', 'resin', 'foam']) {
  check(`${kind} rejects positive transmission before allocation`, () => {
    assert.throws(() => A.material(kind, { transmission: 0.25 }),
      (error) => error instanceof RangeError && /transmission must be 0/.test(error.message));
  });
}

function statistics(values) {
  let sum = 0, square = 0;
  for (const value of values) { sum += value; square += value * value; }
  const mean = sum / values.length;
  const sd = Math.sqrt(Math.max(0, square / values.length - mean * mean));
  const sorted = Float32Array.from(values).sort();
  return { mean, sd, p99: sorted[Math.floor((sorted.length - 1) * 0.99)],
    max: sorted[sorted.length - 1] };
}

const measurements = [];
for (const tier of ['low', 'high']) {
  for (const kind of ['paintedSteel', 'paintedDark']) {
    const spec = kinds[kind];
    const n = (resolutions[spec.cls] || resolutions.std)[tier][0];
    for (const [state, params] of [
      ['clean', { wear: 0, dirt: 0 }], ['default', {}], ['worn', { wear: 1, dirt: 0 }],
    ]) {
      const defaults = spec.defaults({ ...params, seed: 7 });
      const shade = spec.shade(defaults);
      const lum = new Float32Array(n * n);
      const height = new Float32Array(n * n);
      const roughness = new Float32Array(n * n);
      const metal = new Float32Array(n * n);
      const out = {};
      const digest = createHash('sha256');
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        shade(x / n, y / n, out, x, y, n);
        const at = y * n + x;
        lum[at] = 0.2126 * out.r + 0.7152 * out.g + 0.0722 * out.b;
        height[at] = out.h;
        roughness[at] = out.ro;
        metal[at] = out.me;
      }
      for (const channel of [lum, height, roughness, metal]) {
        digest.update(new Uint8Array(channel.buffer));
        assert(channel.every(Number.isFinite), `${kind}/${state}: nonfinite texture channel`);
      }
      const packed = await normalFromHeight(height, n, spec.normalStrength);
      const angles = new Float32Array(n * n);
      // Decode the actual emitted RGB normal. Angle is a texture-space metric,
      // with no claim to surface angles after the renderer's UV transforms.
      for (let i = 0; i < angles.length; i++) {
        const nx = packed[i * 4] / 127.5 - 1;
        const ny = packed[i * 4 + 1] / 127.5 - 1;
        const nz = packed[i * 4 + 2] / 127.5 - 1;
        angles[i] = Math.atan2(Math.hypot(nx, ny), nz) * 180 / Math.PI;
      }
      const l = statistics(lum);
      const metric = { tier, kind, state, n, effectiveWear: defaults.wear,
        luminance: l, rmsContrast: l.sd / l.mean,
        normalDegrees: statistics(angles), roughness: statistics(roughness),
        metalness: statistics(metal), sha256: digest.digest('hex') };
      measurements.push(metric);
      console.log(`${kind.padEnd(13)} ${tier.padEnd(4)} ${state.padEnd(7)} ${n}px`
        + ` wear=${defaults.wear} albedoRMS=${(metric.rmsContrast * 100).toFixed(2)}%`
        + ` normal mean/p99=${metric.normalDegrees.mean.toFixed(2)}/${metric.normalDegrees.p99.toFixed(2)}deg`);
    }
  }
}
for (const kind of ['paintedSteel', 'paintedDark']) {
  for (const tier of ['low', 'high']) {
    const rows = measurements.filter((m) => m.kind === kind && m.tier === tier);
    const clean = rows.find((m) => m.state === 'clean');
    // Authored regression budgets, NOT physical coating specifications. The
    // verified clean controls are <=0.96% albedo RMS and <=0.46deg mean /
    // 1.15deg p99 packed-normal tilt. These loose ceilings catch the old
    // 34-cell relief (reported mean22.8deg) without policing worn/chipped paint.
    check(`${kind}/${tier} intact paint has no large relief field`, () => {
      assert(clean.rmsContrast < 0.03, 'clean albedo contrast exceeds 3%');
      assert(clean.normalDegrees.mean < 2, 'mean clean normal tilt exceeds 2deg');
      assert(clean.normalDegrees.p99 < 5, 'p99 clean normal tilt exceeds 5deg');
    });
    check(`${kind}/${tier} wear changes pixel output`, () =>
      assert.notEqual(clean.sha256,
        rows.find((m) => m.state === 'worn').sha256));
  }
}

const result = { sourcePath, checkedBases, measurements, failures };
const report = option('--report', null);
if (report) writeFileSync(report, JSON.stringify(result, null, 2) + '\n');
for (const failure of failures) console.error('FAIL ' + failure);
console.log(`${failures.length ? 'FAIL' : 'OK'} ${checkedBases} material bases,`
  + ` ${checkedWearKinds} wear controls, ${measurements.length} deterministic paint samples,`
  + ` ${failures.length} contract failures.`);
A.dispose();
if (failures.length && !args.includes('--measure-only')) process.exitCode = 1;
