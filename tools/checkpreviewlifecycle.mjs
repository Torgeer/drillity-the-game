/** CPU regressions for the real preview API. Only WebGL and browser drawing are
 * stubbed: Object3D, geometry, cameras, materials and their disposal events are
 * real Three.js objects. Synthetic boxes are arbitrary test fixtures, never
 * sourced machine dimensions. No browser, GPU, asset fetch or package write.
 *
 * node tools/checkpreviewlifecycle.mjs [--filter substring]
 */
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createPreview } from '../src/core/preview.js';

const tick = () => new Promise(resolve => setImmediate(resolve));

function createHarness() {
  const globals = new Map(['document', 'window', 'createImageBitmap'].map(key =>
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const records = [], renderers = [], environments = [], bitmaps = [], captures = [];
  const renderedGeometries = new Map(), renderedMaterials = new Map();
  const sources = new Map(), buildFailures = new Set();
  const material = new THREE.MeshStandardMaterial();
  let materialDisposals = 0;
  material.addEventListener('dispose', () => materialDisposals++);
  const canvas = () => {
    const element = { width: 0, height: 0, clientWidth: 200, clientHeight: 200,
      isConnected: true, draws: [], shot: null };
    const context = { clearRect() {}, drawImage(source, ...args) {
      element.draws.push({ shot: source.shot, source, args });
      element.shot = source.shot;
    } };
    element.getContext = kind => { assert.equal(kind, '2d'); return context; };
    return element;
  };
  class Renderer {
    constructor({ canvas }) {
      this.domElement = canvas;
      this.disposals = 0;
      this.shots = [];
      renderers.push(this);
    }
    setPixelRatio() {}
    setSize(w, h) { this.domElement.width = w; this.domElement.height = h; }
    render(scene, camera) {
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      const subjects = [];
      scene.traverseVisible(o => {
        if (o.name.startsWith('fixture:')) subjects.push(o.name);
        // Track model resources separately from the scene-level backdrop.
        if (o.parent === scene) return;
        if (o.geometry && !renderedGeometries.has(o.geometry)) {
          renderedGeometries.set(o.geometry, 0);
          o.geometry.addEventListener('dispose', () =>
            renderedGeometries.set(o.geometry, renderedGeometries.get(o.geometry) + 1));
        }
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          if (!m || renderedMaterials.has(m)) continue;
          renderedMaterials.set(m, 0);
          m.addEventListener('dispose', () =>
            renderedMaterials.set(m, renderedMaterials.get(m) + 1));
        }
      });
      const shot = { subjects, camera: camera.position.toArray(),
        quaternion: camera.quaternion.toArray() };
      this.shots.push(shot);
      this.domElement.shot = shot;
    }
    dispose() { this.disposals++; }
  }
  class PMREMGenerator {
    fromScene() {
      const texture = new THREE.Texture();
      const target = { texture, disposals: 0, textureDisposals: 0,
        dispose() { this.disposals++; texture.dispose(); } };
      texture.addEventListener('dispose', () => target.textureDisposals++);
      environments.push(target);
      return target;
    }
    dispose() {}
  }
  globalThis.document = { createElement: kind => { assert.equal(kind, 'canvas'); return canvas(); } };
  globalThis.window = { devicePixelRatio: 1 };
  globalThis.createImageBitmap = source => new Promise((resolve, reject) => {
    const bitmap = { shot: source.shot, closes: 0, close() { this.closes++; } };
    bitmaps.push(bitmap);
    captures.push({ bitmap, settled: false,
      resolve() { this.settled = true; resolve(bitmap); },
      reject() { this.settled = true; reject(new Error('Injected bitmap rejection')); } });
  });
  const ctx = {
    THREE: { ...THREE, WebGLRenderer: Renderer, PMREMGenerator },
    // These deliberately have no procedural RIG_IDS entries.
    data: { RIGS: [{ id: 'fixture-a' }, { id: 'fixture-b' }] },
    rig: {
      listRigs: () => [],
      getSourceKey: id => sources.get(id) || 'glb:' + id,
      buildPreview(id) {
        if (buildFailures.has(id)) return null;
        const group = new THREE.Group();
        const source = sources.get(id) || 'glb:' + id;
        group.name = `fixture:${id}:${source}`;
        const geometry = new THREE.BoxGeometry(...(id === 'fixture-a' ? [1, 2, 1] : [0.1, 20, 0.1]));
        const record = { id, source, group, geometry, disposals: 0, releases: 0 };
        geometry.addEventListener('dispose', () => record.disposals++);
        group.add(new THREE.Mesh(geometry, material));
        group.userData.dispose = () => {
          record.releases++;
          geometry.dispose();
          group.removeFromParent();
        };
        records.push(record);
        return group;
      },
    },
  };
  const api = createPreview(ctx);
  return { api, ctx, canvas, records, renderers, environments, captures, bitmaps,
    sources, buildFailures, renderedGeometries, renderedMaterials,
    get materialDisposals() { return materialDisposals; },
    async close() {
      api.dispose();
      // Release every deferred capture even after an assertion fails. A stale
      // source retry may schedule another capture, hence the bounded drain.
      for (let pass = 0; pass < 8; pass++) {
        for (const capture of captures) if (!capture.settled) capture.resolve();
        await tick();
        if (captures.every(c => c.settled)) break;
      }
      for (const [key, descriptor] of globals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

const tests = [];
const test = (name, run) => tests.push({ name, run });

test('GLB-only routing, pending deduplication and owned disposal', async h => {
  await h.api.init();
  const first = h.api.thumbnail('fixture-a');
  const duplicate = h.api.thumbnail('fixture-a');
  assert.equal(h.records.length, 1, 'A declared GLB-only rig must use its factory once');
  assert.equal(h.captures.length, 1, 'Concurrent identical requests share one capture');
  h.captures[0].resolve();
  const [a, b] = await Promise.all([first, duplicate]);
  assert.equal(a, b, 'Concurrent callers receive the same bitmap');
  assert.equal(await h.api.thumbnail('fixture-a'), a, 'Completed requests reuse the bitmap');
  assert.equal(h.records[0].releases, 1, 'Use the builder-owned disposer exactly once');
  assert.equal(h.records[0].disposals, 1, 'Owned geometry is released exactly once');
  assert.equal(h.materialDisposals, 0, 'Shared rig materials remain live');
  h.api.dispose();
  assert.equal(a.closes, 1, 'A cached bitmap is closed on disposal');
  assert.equal(h.renderers[0].disposals, 1, 'The renderer is released once');
});

test('out-of-order bitmap resolution disposes only the matching group', async h => {
  await h.api.init();
  const a = h.api.thumbnail('fixture-a');
  const b = h.api.thumbnail('fixture-b');
  h.captures[0].resolve();
  await a;
  assert.equal(h.records[0].disposals, 1);
  assert(h.records[1].disposals <= 1, 'Resolving A must not double-release B geometry');
  assert.deepEqual(h.captures[1].bitmap.shot.subjects, [h.records[1].group.name],
    'B must capture its own model even when A resolves first');
  h.captures[1].resolve();
  await b;
  assert.equal(h.records[1].disposals, 1);
  assert.equal(h.materialDisposals, 0);
});

test('cached source invalidation closes the stand-in and captures the GLB', async h => {
  await h.api.init();
  h.sources.set('fixture-a', 'fallback:fixture-a');
  const first = h.api.thumbnail('fixture-a');
  h.captures[0].resolve();
  const oldBitmap = await first;
  h.sources.set('fixture-a', 'glb:fixture-a');
  const replacement = h.api.thumbnail('fixture-a');
  assert.equal(oldBitmap.closes, 1, 'Source replacement closes the stand-in bitmap');
  assert.equal(h.records.at(-1).source, 'glb:fixture-a');
  h.captures[1].resolve();
  const fresh = await replacement;
  assert.notEqual(fresh, oldBitmap);
  assert.equal(await h.api.thumbnail('fixture-a'), fresh);
  assert.equal(h.materialDisposals, 0);
});

test('source changes during capture cannot publish a stale bitmap', async h => {
  await h.api.init();
  h.sources.set('fixture-a', 'fallback:fixture-a');
  const pending = h.api.thumbnail('fixture-a');
  h.sources.set('fixture-a', 'glb:fixture-a');
  h.captures[0].resolve();
  await tick();
  assert.equal(h.captures[0].bitmap.closes, 1);
  assert.equal(h.captures.length, 2, 'A stale capture must retry its current source');
  h.captures[1].resolve();
  const fresh = await pending;
  assert.equal(fresh, h.captures[1].bitmap);
  assert(h.records.every(r => r.disposals === 1));
  assert.equal(h.materialDisposals, 0);
});

test('thumbnail work preserves and restores the live turntable', async h => {
  await h.api.init();
  const target = h.canvas();
  h.api.setLive('fixture-a', target);
  h.api.update(1 / 30);
  const cameraBefore = target.draws.at(-1).shot.camera;
  const live = h.records[0];
  const pending = h.api.thumbnail('fixture-b');
  h.captures[0].resolve();
  await pending;
  h.api.update(1 / 30);
  assert.deepEqual(target.draws.at(-1).shot.subjects, [live.group.name],
    'The next live frame must contain the selected model, not an empty pivot');
  assert.deepEqual(target.draws.at(-1).shot.camera, cameraBefore,
    'A different-size thumbnail must not change the live camera');
  assert.equal(live.disposals, 0, 'Rendering another thumbnail must preserve live geometry');
  h.api.clearLive();
  assert.equal(live.disposals, 1);
  assert.equal(h.materialDisposals, 0);
});

test('source replacement refreshes live geometry with owned cleanup', async h => {
  await h.api.init();
  h.sources.set('fixture-a', 'fallback:fixture-a');
  const target = h.canvas();
  h.api.setLive('fixture-a', target);
  const old = h.records[0];
  h.sources.set('fixture-a', 'glb:fixture-a');
  h.api.update(1 / 30);
  assert.equal(old.disposals, 1);
  assert.equal(h.records.length, 2);
  assert.deepEqual(target.draws.at(-1).shot.subjects, [h.records[1].group.name]);
  assert.equal(h.materialDisposals, 0);
});

test('disposal during capture preserves shared materials and frees geometry once', async h => {
  await h.api.init();
  const pending = h.api.thumbnail('fixture-a');
  h.api.dispose();
  const sharedAtShutdown = h.materialDisposals;
  h.captures[0].resolve();
  assert.equal(await pending, null, 'A disposed preview cannot return its delayed capture');
  assert.equal(h.captures[0].bitmap.closes, 1, 'The delayed bitmap is closed');
  assert.equal(sharedAtShutdown, 0, 'Shutdown must honor the pending group material owner');
  assert.equal(h.materialDisposals, 0);
  assert.equal(h.records[0].releases, 1);
  assert.equal(h.records[0].disposals, 1, 'Shutdown and async cleanup must not free geometry twice');
});

test('rejected capture releases its group and permits a retry', async h => {
  await h.api.init();
  const pending = h.api.thumbnail('fixture-a');
  const rejection = assert.rejects(pending, /Injected bitmap rejection/);
  h.captures[0].reject();
  await rejection;
  assert.equal(h.records[0].disposals, 1);
  assert.equal(h.materialDisposals, 0);
  const retry = h.api.thumbnail('fixture-a');
  assert.equal(h.captures.length, 2, 'Rejected requests must leave the pending cache');
  h.captures[1].resolve();
  assert.equal(await retry, h.captures[1].bitmap);
});

test('disposal cancels initialization across asynchronous imports', async h => {
  const initializing = h.api.init();
  h.api.dispose();
  await initializing;
  assert.equal(h.api.ready, false, 'An older init cannot resurrect a disposed renderer');
  assert.equal(await h.api.thumbnail('fixture-a'), null);
});

test('old captures cannot enter a reinitialized cache', async h => {
  await h.api.init();
  const previous = h.api.thumbnail('fixture-a');
  h.api.dispose();
  await h.api.init();
  const current = h.api.thumbnail('fixture-a');
  assert.equal(h.captures.length, 2);
  h.captures[0].resolve();
  assert.equal(await previous, null, 'An old generation cannot publish into a new live preview');
  const duplicate = h.api.thumbnail('fixture-a');
  assert.equal(h.captures.length, 2, 'Old finally cleanup cannot evict a new pending entry');
  h.captures[1].resolve();
  const [a, b] = await Promise.all([current, duplicate]);
  assert.equal(a, b);
  assert.equal(await h.api.thumbnail('fixture-a'), a);
  assert.equal(h.captures[0].bitmap.closes, 1);
});

test('repeated initialization retains a single live renderer', async h => {
  await h.api.init();
  await h.api.init();
  assert.equal(h.renderers.filter(r => r.disposals === 0).length, 1,
    'Repeated init must leave exactly one renderer alive');
  assert(h.renderers.every(r => r.disposals <= 1), 'No renderer may be released twice');
  assert.equal(h.environments.filter(e => e.disposals === 0).length, 1,
    'Repeated init must not leak an earlier studio environment');
});

test('studio environment render target is released', async h => {
  await h.api.init();
  h.api.dispose();
  assert.equal(h.environments[0].disposals, 1,
    'Disposing only env.texture does not release the PMREM render target framebuffer');
});

test('yaw participates in rendered thumbnail identity', async h => {
  await h.api.init();
  const first = h.api.thumbnail('fixture-a', { yaw: 0 });
  h.captures[0].resolve();
  const a = await first;
  const second = h.api.thumbnail('fixture-a', { yaw: 1 });
  assert.equal(h.captures.length, 2, 'A different requested view needs a different bitmap');
  h.captures[1].resolve();
  assert.notEqual(await second, a);
});

test('simultaneous initialization leaves the newest studio ready', async h => {
  const first = h.api.init();
  const second = h.api.init();
  await Promise.all([first, second]);
  assert.equal(h.api.ready, true);
  assert.equal(h.renderers.filter(r => r.disposals === 0).length, 1);
  assert.equal(h.environments.filter(e => e.disposals === 0).length, 1);
  const pending = h.api.thumbnail('fixture-a');
  h.captures[0].resolve();
  assert.equal(await pending, h.captures[0].bitmap);
});

test('canvas fallback owns its pixels after later renderer use', async h => {
  await h.api.init();
  delete globalThis.createImageBitmap;
  const first = await h.api.thumbnail('fixture-a');
  const second = await h.api.thumbnail('fixture-b');
  assert.notEqual(first, h.renderers[0].domElement);
  assert.notEqual(first, second);
  assert.deepEqual(first.shot.subjects, [h.records[0].group.name]);
  assert.deepEqual(second.shot.subjects, [h.records[1].group.name]);
  assert(h.records.every(r => r.disposals === 1));
  assert.equal(h.materialDisposals, 0);
});

test('fallback supplies release repeated geometry and material references once', async h => {
  await h.api.init();
  const pending = h.api.thumbnail({ id: 'fixture-supply', supply: true });
  h.captures[0].resolve();
  assert(await pending);
  assert(h.renderedGeometries.size > 0, 'The supply fixture must actually contain geometry');
  assert(h.renderedMaterials.size > 0, 'The supply fixture must actually contain materials');
  assert([...h.renderedGeometries.values()].every(count => count === 1));
  assert([...h.renderedMaterials.values()].every(count => count === 1),
    'The repeated steel ribs share one owned material and must release it once');
});

test('tool diameter participates in rendered thumbnail identity', async h => {
  await h.api.init();
  const first = h.api.thumbnail({ id: 'button-bit', diameterMm: 65, thread: 'T45' });
  h.captures[0].resolve();
  const a = await first;
  const second = h.api.thumbnail({ id: 'button-bit', diameterMm: 110, thread: 'T45' });
  assert.equal(h.captures.length, 2, 'Changed model dimensions cannot reuse the previous bitmap');
  h.captures[1].resolve();
  assert.notEqual(await second, a);
  assert(h.renderedGeometries.size > 0, 'The real tool builder must produce model geometry');
  assert([...h.renderedGeometries.values()].every(count => count === 1));
  assert([...h.renderedMaterials.values()].every(count => count === 0),
    'Real tool-library materials remain shared across thumbnail construction');
});

test('rectangular targets contain the complete thumbnail and live shot', async h => {
  await h.api.init();
  const target = h.canvas();
  target.clientWidth = 300; target.clientHeight = 120;
  const pending = h.api.render('fixture-a', target);
  h.captures[0].resolve();
  assert.equal(await pending, true);
  const assertContained = ({ args: [x, y, width, height] }) => {
    assert(x >= 0 && y >= 0, 'A full preview cannot start outside its target');
    assert(x + width <= target.width && y + height <= target.height,
      'A full preview cannot extend beyond its target');
  };
  assertContained(target.draws.at(-1));
  h.api.setLive('fixture-a', target);
  h.api.update(1 / 30);
  assertContained(target.draws.at(-1));
});

test('failed rig framing cannot expose an earlier thumbnail or live model', async h => {
  await h.api.init();
  const first = h.api.thumbnail('fixture-a');
  h.captures[0].resolve();
  await first;
  const target = h.canvas();
  h.api.setLive('fixture-b', target);
  h.api.update(1 / 30);
  const live = h.records.at(-1);
  const liveCamera = target.draws.at(-1).shot.camera;

  h.sources.set('fixture-a', 'missing:fixture-a');
  h.buildFailures.add('fixture-a');
  const unavailable = h.api.thumbnail('fixture-a');
  assert.equal(h.api.lastFrame, null, 'An empty rig clears the prior model framing telemetry');
  assert.deepEqual(h.captures[1].bitmap.shot.subjects, [],
    'An unavailable rig must not display the previous thumbnail or hidden live model');
  h.captures[1].resolve();
  await unavailable;
  h.api.update(1 / 30);
  assert.deepEqual(target.draws.at(-1).shot.subjects, [live.group.name]);
  assert.deepEqual(target.draws.at(-1).shot.camera, liveCamera);

  h.api.setLive('fixture-a', target);
  h.api.update(1 / 30);
  assert.deepEqual(target.draws.at(-1).shot.subjects, [],
    'An unavailable live rig must not retain the preceding model');
  h.sources.set('fixture-a', 'glb:fixture-a');
  h.buildFailures.delete('fixture-a');
  h.api.update(1 / 30);
  assert.deepEqual(target.draws.at(-1).shot.subjects, [h.records.at(-1).group.name]);
  assert.equal(h.api.lastFrame.ok, true, 'A newly available source obtains fresh framing');
  assert.equal(h.materialDisposals, 0);
});

export async function checkPreviewLifecycle({ filter = '' } = {}) {
  const results = [];
  for (const entry of tests.filter(t => t.name.includes(filter))) {
    const h = createHarness();
    try {
      await entry.run(h);
      results.push({ name: entry.name, ok: true });
      console.log('PASS ' + entry.name);
    } catch (error) {
      const message = error.message;
      results.push({ name: entry.name, ok: false, message });
      console.error('FAIL ' + entry.name + ': ' + message);
    } finally { await h.close(); }
  }
  assert(results.length > 0, 'No lifecycle cases selected');
  return { cases: results.length, failures: results.filter(r => !r.ok).length, results };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const at = process.argv.indexOf('--filter');
  const result = await checkPreviewLifecycle({ filter: at < 0 ? '' : process.argv[at + 1] });
  console.log(`${result.failures ? 'FAIL' : 'OK'} preview lifecycle: ${result.cases} cases, ${result.failures} failures; CPU only.`);
  if (result.failures) process.exitCode = 1;
}
