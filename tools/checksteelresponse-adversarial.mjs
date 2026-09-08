/** Independent CPU review of the steel response change.
 * Exercises public material() with an in-memory canvas, production bake/prime/
 * failure paths, installed shader rules and real tool/terrain adapters. The
 * canvas shim uses nearest-neighbour ONLY for the cosmetic priming mottle;
 * finished ORM is production byte packing and box filtering. No rendered
 * appearance, device performance or actual draw-call approval is implied.
 * node tools/checksteelresponse-adversarial.mjs [--source path] [--report path] [--models path]
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as THREE from 'three';

const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1'));
const argv = process.argv.slice(2), opt = k => argv.includes(k) ? argv[argv.indexOf(k) + 1] : undefined;
const hash = value => createHash('sha256').update(value).digest('hex');
const sourcePath = resolve(opt('--source') || join(root, 'src/core/assets.js'));
const sourceBytes = readFileSync(sourcePath);
const source = sourceBytes.toString('utf8').replace(/\r\n/g, '\n');
const baseline = execFileSync('git', ['show', '3aab87d:src/core/assets.js'], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n');
const failures = [], passed = [], observations = {}, owned = [];
async function test(label, fn) { try { await fn(); passed.push(label); } catch (e) { failures.push({ label, error: e.stack.replace(/data:text\/javascript;base64,[A-Za-z0-9+/=]+/g, '[production assets module]') }); } }

class MemoryCanvas {
  constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); }
  getContext() {
    const cv = this;
    return {
      fillStyle: '#000000', imageSmoothingEnabled: true,
      createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
      fillRect() {
        const rgb = this.fillStyle.match(/^#([0-9a-f]{6})$/i); assert(rgb, `unsupported test fill ${this.fillStyle}`);
        const hex = parseInt(rgb[1], 16), c = [(hex >>> 16) & 255, (hex >>> 8) & 255, hex & 255, 255];
        for (let i = 0; i < cv.data.length; i += 4) cv.data.set(c, i);
      },
      putImageData(img, x, y) {
        if (cv.failWrites) throw new Error('injected canvas write failure');
        assert.equal(x, 0); assert.equal(y, 0); assert.equal(img.data.length, cv.data.length);
        cv.data.set(img.data);
      },
      drawImage(other, x, y, w, h) {
        assert.equal(x, 0); assert.equal(y, 0); assert.equal(w, cv.width); assert.equal(h, cv.height);
        for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
          const from = (Math.floor(yy * other.height / h) * other.width + Math.floor(xx * other.width / w)) * 4;
          cv.data.set(other.data.subarray(from, from + 4), (yy * w + xx) * 4);
        }
      },
    };
  }
}
globalThis.OffscreenCanvas = MemoryCanvas;
// Avoid keeping Node alive with production MessageChannel; production gate and
// asynchronous task queue are otherwise unmodified.
globalThis.scheduler = { yield: () => new Promise(r => setImmediate(r)) };
const load = async (text, tag) => {
  const js = text.replace("from 'three'", `from '${import.meta.resolve('three')}'`)
    .replace("from './contract.js'", `from '${pathToFileURL(join(root, 'src/core/contract.js')).href}'`);
  return import(`data:text/javascript;base64,${Buffer.from(js + '\n// ' + tag).toString('base64')}`);
};
const [currentModule, baselineModule] = await Promise.all([load(source, 'candidate'), load(baseline, 'baseline')]);
function assets(mod = currentModule) { const a = mod.createAssets({ quality: { id: 'low' } }); owned.push(a); return a; }
const current = assets(), old = assets(baselineModule);
const deadline = async a => {
  const end = Date.now() + 30000;
  while (a.stats().pending) { assert(Date.now() < end, 'material generation timeout'); await new Promise(r => setTimeout(r, 5)); }
};
const meanChannel = (texture, channel, factor = 1, floor = 0) => {
  const data = texture.image.data; let sum = 0;
  for (let p = channel; p < data.length; p += 4) sum += Math.max(floor, factor * data[p] / 255);
  return sum / (data.length / 4);
};
const scalarFields = ['roughness', 'metalness', 'clearcoat', 'clearcoatRoughness', 'envMapIntensity', 'transmission', 'opacity', 'transparent', 'side', 'depthWrite', 'normalMapType', 'flatShading'];
const snapshot = m => Object.fromEntries(scalarFields.map(k => [k, m[k]]));
const floor = Number(THREE.ShaderChunk.lights_physical_fragment.match(/max\( roughnessFactor, ([\d.]+) \)/)?.[1]);

try {
  await test('installed shader multiplies linear ORM and preserves its derivative roughness term', () => {
    assert.match(THREE.ShaderChunk.roughnessmap_fragment, /roughnessFactor \*= texelRoughness\.g/);
    assert.match(THREE.ShaderChunk.metalnessmap_fragment, /metalnessFactor \*= texelMetalness\.b/);
    assert.equal(floor, 0.0525);
    assert.match(THREE.ShaderChunk.lights_physical_fragment, /material\.roughness \+= geometryRoughness/);
  });
  await test('only approved steel and paint scalars change; all pixel programs and other material responses remain', () => {
    const changes = {};
    for (const kind of Object.keys(current._kinds)) {
      const a = current._kinds[kind], b = old._kinds[kind]; assert(b, `new material kind ${kind}`);
      const executable = fn => fn?.toString().replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '').replace(/\s+/g, '');
      for (const member of ['defaults', 'setKey', 'fallback', 'shade']) assert.equal(executable(a[member]), executable(b[member]), `${kind}.${member} changed`);
      const am = a.base(a.defaults({})), bm = b.base(b.defaults({}));
      assert(!am.transmission, `${kind} is transmissive`);
      const diff = scalarFields.filter(k => am[k] !== bm[k]);
      if (diff.length) changes[kind] = diff;
      am.dispose(); bm.dispose();
    }
    assert.deepEqual(changes, { paintedSteel: ['roughness', 'metalness'], rawSteel: ['roughness'], wornSteel: ['roughness', 'metalness'], chrome: ['roughness'], paintedDark: ['roughness', 'metalness'] });
    observations.changedMaterialFields = changes;
  });
  await test('96 multi-seed material states keep authored albedo/height and retain roughness distinctions', () => {
    const result = [], cases = [['rawSteel', {}], ['rawSteel', { blue: 1 }], ['wornSteel', {}], ['wornSteel', { rust: 1, polish: 0 }], ['wornSteel', { rust: 0, polish: 1 }], ['wornSteel', { thread: false }], ['chrome', { wear: 0 }], ['chrome', { wear: 1 }]];
    for (const seed of [0, 1, 3, 7, 12, 31, 42, 99, 127, 512, -1, 2147483647]) for (const [kind, p] of cases) {
      const ca = current._kinds[kind], ba = old._kinds[kind], d = ca.defaults({ ...p, seed });
      const cs = ca.shade(d), bs = ba.shade(d), cm = ca.base(d), bm = ba.base(d);
      let cR = 0, bR = 0, cF = 0, bF = 0, cM = 0; const co = {}, bo = {}, bytes = new Uint8ClampedArray(2);
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
        cs((x + 0.37) / 32, (y + 0.19) / 32, co); bs((x + 0.37) / 32, (y + 0.19) / 32, bo);
        assert.deepEqual(co, bo); assert(Object.values(co).every(Number.isFinite));
        assert(co.ro >= 0 && co.ro <= 1 && co.me >= 0 && co.me <= 1);
        bytes.set([co.ro * 255, co.me * 255]);
        const cr = cm.roughness * bytes[0] / 255, br = bm.roughness * bytes[0] / 255;
        cR += cr; bR += br; cF += Math.max(cr, floor); bF += Math.max(br, floor); cM += cm.metalness * bytes[1] / 255;
      }
      const row = { kind, seed, params: p, roughness: cR / 1024, baselineRoughness: bR / 1024, physicalFloorMean: cF / 1024, baselineFloorMean: bF / 1024, metalness: cM / 1024 };
      if (kind !== 'chrome') assert(row.roughness > row.baselineRoughness * 2, `${kind} loses roughness correction`);
      if (kind === 'chrome' && p.wear === 1) assert(row.physicalFloorMean > row.baselineFloorMean + 0.01, 'chrome wear still flattened');
      result.push(row); cm.dispose(); bm.dispose();
    }
    for (const seed of [...new Set(result.map(r => r.seed))]) {
      const rows = result.filter(r => r.seed === seed), fresh = rows.find(r => r.kind === 'chrome' && r.params.wear === 0), worn = rows.find(r => r.kind === 'chrome' && r.params.wear === 1);
      assert(worn.physicalFloorMean > fresh.physicalFloorMean + 0.01, `chrome wear unreadable in response at seed ${seed}`);
      const rust = rows.find(r => r.params.rust === 1), polish = rows.find(r => r.params.polish === 1);
      assert(rust.roughness > polish.roughness + 0.015); assert(rust.metalness < polish.metalness);
    }
    observations.sampledStates = result;
  });
  await test('public material primes and bakes attached data-space maps without reallocating them', async () => {
    const rows = [];
    for (const kind of ['rawSteel', 'wornSteel', 'chrome']) {
      const a = assets(), b = assets(baselineModule), am = a.material(kind), bm = b.material(kind);
      const ids = [am.map.uuid, am.normalMap.uuid, am.roughnessMap.uuid];
      assert(am.map && am.normalMap && am.roughnessMap); assert.equal(am.roughnessMap, am.metalnessMap); assert.equal(am.roughnessMap, am.aoMap);
      assert.equal(am.map.colorSpace, THREE.SRGBColorSpace); assert.equal(am.roughnessMap.colorSpace, THREE.NoColorSpace); assert.equal(am.roughnessMap.channel, 0);
      const prime = meanChannel(am.roughnessMap, 1, am.roughness), expected = a._kinds[kind].fallback(a._kinds[kind].defaults({})).rough;
      assert(Math.abs(prime - expected) < 0.012, `${kind} primed ORM is wrongly scaled`);
      assert.equal(a.stats().textures, 3); assert.equal(a.stats().materials, 1);
      await Promise.all([deadline(a), deadline(b)]);
      assert.equal(a.stats().failed, 0); assert.equal(a.stats().setsReady, 1);
      assert.deepEqual([am.map.uuid, am.normalMap.uuid, am.roughnessMap.uuid], ids);
      assert.equal(a.stats().textures, 3); assert.equal(a.stats().bytesApprox, b.stats().bytesApprox);
      assert.equal(hash(am.map.image.data), hash(bm.map.image.data), 'albedo bytes changed');
      assert.equal(hash(am.normalMap.image.data), hash(bm.normalMap.image.data), 'normal bytes changed');
      assert.equal(hash(am.roughnessMap.image.data), hash(bm.roughnessMap.image.data), 'ORM bytes changed');
      rows.push({ kind, prime, readyRoughness: meanChannel(am.roughnessMap, 1, am.roughness), baselineReadyRoughness: meanChannel(bm.roughnessMap, 1, bm.roughness), mapPixels: am.map.image.width ** 2, ormPixels: am.roughnessMap.image.width ** 2, bytes: a.stats().bytesApprox });
      a.dispose(); b.dispose();
    }
    observations.publicBake = rows;
  });
  await test('failed asynchronous bake retains the primed ORM instead of rendering an untextured roughness=1 fallback', async () => {
    const a = assets(), m = a.material('rawSteel'), map = m.roughnessMap, before = hash(map.image.data);
    m.map.image.failWrites = true;
    const warn = console.warn, warnings = []; console.warn = (...args) => warnings.push(args.join(' '));
    try { await deadline(a); } finally { console.warn = warn; }
    assert.equal(a.stats().failed, 1); assert.equal(a.stats().setsReady, 0);
    assert(warnings.some(x => x.includes('injected canvas write failure')));
    assert.equal(m.roughnessMap, map); assert.equal(m.metalnessMap, map); assert.equal(hash(map.image.data), before);
    assert(meanChannel(map, 1, m.roughness) < 0.38); a.dispose();
  });
  await test('cache identity and capped texture-set allocations match the baseline for repeated and excess variants', () => {
    const snaps = [];
    for (const mod of [baselineModule, currentModule]) {
      const a = assets(mod);
      for (const kind of ['rawSteel', 'wornSteel', 'chrome']) {
        const m = a.material(kind); assert.equal(a.material(kind), m);
        for (let i = 0; i < 12; i++) a.material(kind, { color: ['#102030', '#8395AA', '#EBEDED'][i % 3], seed: i, wear: i / 11, polish: i / 11, blue: i / 11 });
      }
      const s = a.stats(); snaps.push({ materials: s.materials, textures: s.textures, sets: s.sets, bytes: s.bytesApprox });
      assert.equal(s.sets, 7); assert.equal(s.textures, 21); a.dispose();
    }
    assert.deepEqual(snaps[0], snaps[1]); observations.variantAllocation = snaps[1];
  });
  const tool = await import(pathToFileURL(join(root, 'src/rig/tools.js')).href);
  await test('real tool wear clones share maps, keep bounded allocations and polish rather than flattening to a single response', () => {
    const a = assets(), base = a.material('rawSteel'), ctx = { assets: a, THREE };
    tool.disposeToolLibrary();
    const fresh = tool.wearMaterial(ctx, 'rawSteel', 0), worn = tool.wearMaterial(ctx, 'rawSteel', 1);
    assert.equal(fresh, base); assert.notEqual(worn, base); assert.equal(worn.roughnessMap, base.roughnessMap);
    assert(worn.roughness < base.roughness && worn.roughness > 0.05);
    assert.equal(tool.wearMaterial(ctx, 'rawSteel', 1), worn);
    assert.equal(a.stats().textures, 3); assert(!worn.transmission); assert(!worn.transparent);
    observations.toolWear = { baseScalar: fresh.roughness, wornScalar: worn.roughness, sharedORM: true };
    tool.disposeToolLibrary(); a.dispose();
  });
  await test('no-assets tool fallback remains mapless with its explicit material descriptors respected', () => {
    tool.disposeToolLibrary();
    for (const kind of ['rawSteel', 'wornSteel', 'chrome']) {
      const m = tool.material({ THREE }, kind), override = tool.material({ THREE }, kind, { roughness: 0.22, metalness: 0.94 });
      assert.equal(m.roughnessMap, null); assert(m.roughness > 0 && m.roughness < 1);
      assert.equal(override.roughness, 0.22); assert.equal(override.metalness, 0.94);
    }
    tool.disposeToolLibrary();
  });
  await test('existing assets descriptor limitations and real terrain override semantics are recorded without claiming a repair', () => {
    const ignored = [];
    for (const mod of [baselineModule, currentModule]) {
      const a = assets(mod);
      const plain = a.material('chrome'), override = a.material('chrome', { roughness: 0.22, metalness: 0.94, envMapIntensity: 0.7 });
      assert.equal(override.roughness, plain.roughness); assert.equal(override.metalness, plain.metalness); assert.equal(override.envMapIntensity, 0.7);
      ignored.push({ roughness: override.roughness, metalness: override.metalness, envMapIntensity: override.envMapIntensity }); a.dispose();
    }
    observations.existingIgnoredAssetsDescriptors = ignored;
    const terrain = readFileSync(join(root, 'src/world/terrain.js'), 'utf8').replace(/\r\n/g, '\n');
    const start = terrain.indexOf('function mat(kind, params = {}) {'), end = terrain.indexOf('\n  }', start) + 4;
    assert(start > 0 && end > start);
    const params = new Function(`return (${terrain.match(/const ASSET_PARAMS = (\[[\s\S]*?\]);/)[1]});`)();
    const a = assets(), base = a.material('rawSteel');
    const mat = new Function('T', 'ctx', 'KIND_NAMES', 'ASSET_PARAMS', 'track', `return (${terrain.slice(start, end)});`)(THREE, { assets: a }, Object.keys(a._kinds), params, x => x);
    const controlled = mat('rawSteel', { roughness: 0.62, metalness: 0.88 });
    assert.equal(controlled.roughness, 0.62); assert.equal(controlled.metalness, 0.88);
    assert.equal(controlled.roughnessMap, base.roughnessMap); assert.equal(base.roughness, 1);
    controlled.dispose(); a.dispose();
  });
  await test('clearcoat, glass, shader transparency and transmission safety remain separate unchanged controls', () => {
    for (const kind of ['paintedSteel', 'paintedDark', 'glass', 'carbide']) {
      const a = current._kinds[kind], b = old._kinds[kind];
      for (const p of [{}, { hero: true, wear: 0 }, { hero: true, wear: 1 }]) {
        const am = a.base(a.defaults(p)), bm = b.base(b.defaults(p));
        for (const k of ['clearcoat', 'clearcoatRoughness', 'transmission', 'envMapIntensity', 'opacity', 'transparent']) assert.equal(am[k], bm[k], `${kind}.${k} changed`);
        am.dispose(); bm.dispose();
      }
    }
    for (const kind of ['rawSteel', 'wornSteel', 'chrome']) assert.throws(() => current.material(kind, { transmission: 0.1 }), /transmission must be 0/);
    assert.equal(current.stats().textures, 0, 'rejected transmission allocated textures');
    observations.paintHeroClearcoat = snapshot(current._kinds.paintedSteel.base(current._kinds.paintedSteel.defaults({ hero: true, wear: 0 })));
  });
  if (opt('--models')) await test('committed-format GLB material names establish actual rig and site consumer scope', () => {
    const base = resolve(opt('--models')), files = [];
    const walk = dir => { for (const ent of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, ent.name); if (ent.isDirectory()) walk(p); else if (extname(p) === '.glb') files.push(p); } }; walk(base);
    assert(files.length > 0, 'no GLB controls available');
    observations.glbConsumers = [];
    for (const file of files) {
      const b = readFileSync(file); assert.equal(b.toString('utf8', 0, 4), 'glTF');
      const json = JSON.parse(b.toString('utf8', 20, 20 + b.readUInt32LE(12)));
      const names = (json.materials || []).map(m => m.name).filter(n => ['rawSteel', 'wornSteel', 'chrome'].includes(n));
      if (names.length) observations.glbConsumers.push({ path: file.slice(base.length + 1), sha256: hash(b), names });
    }
  });
} finally { for (const a of owned) a.dispose(); }
const report = { sourcePath, sourceSha256Bytes: hash(sourceBytes), sourceSha256LF: hash(source), baseline: '3aab87d', baselineSha256LF: hash(baseline), threeRevision: THREE.REVISION, passed, failures, observations,
  limits: ['CPU response and allocation checks only; no visual approval or measured draw-call/FPS approval.', 'Memory canvas uses nearest priming mottle; final ORM uses unchanged production box filter.', 'The derivative roughness term and BRDF/lighting/tone-map response require browser captures.', 'Explicit tool roughness/metalness are ignored by assets in both versions; unchanged pre-existing limitation.', 'Paint clearcoat and glass response are unchanged; chrome retains the real shader floor.'] };
if (opt('--report')) writeFileSync(resolve(opt('--report')), JSON.stringify(report, null, 2) + '\n');
console.log(`steel independent review: ${passed.length} passed, ${failures.length} failed`);
for (const f of failures) console.error(`${f.label}: ${f.error}`);
if (failures.length) process.exitCode = 1;
