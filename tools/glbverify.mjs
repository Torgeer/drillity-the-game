/**
 * Prove the glTF rig path — against the BUILT output, in a real GPU browser.
 *
 * This is not a smoke test. Every one of the six checks below exists because
 * the corresponding thing is invisible when it breaks:
 *
 *   A  BUILD      the single-file config inlines everything it is given. If a
 *                 `.glb` ever reaches the bundler it becomes base64 and the
 *                 build still succeeds, just megabytes fatter. Checked by
 *                 reading `dist/index.html` for the signature, and by
 *                 confirming the model arrived as its OWN HTTP request.
 *   B  LOAD       fetch + parse + the named-node index, measured.
 *   C  BUILDER    the synchronous `(T, ctx) => {root, dyn, spec}` handshake
 *                 rigFactory.js needs, including the dyn fields its update
 *                 loop dereferences with no guard.
 *   D  MATERIALS  every material must be a live procedural one, and NOTHING
 *                 may carry transmission > 0 (HANDOFF §8F).
 *   E  DRAW CALLS measured off `info.render.calls` with the same 32 px probe
 *                 tools/shoot.mjs uses, so the number is comparable to the
 *                 budget table in README.md.
 *   F  ENV        the reason the whole named-node contract exists: core/env.js
 *                 re-aims spotlights at `mount:`/`aim:` world positions every
 *                 frame. Proved by driving the REAL env.js with the loader's
 *                 own `getWorkLights()` array and watching a lamp sweep when
 *                 its boom moves.
 *
 * Usage:
 *   npm run build
 *   npx vite preview --port 5179            # serve dist/
 *   node tools/glbverify.mjs --headed --url http://localhost:5179/ --id teststub
 *
 * HEADLESS CANNOT BIND THE DISCRETE GPU ON THIS MACHINE — `--headed` or the
 * numbers are SwiftShader's and meaningless. The report says so if it was not
 * used.
 */
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const has = (n) => argv.includes('--' + n);

const URL_BASE = flag('url', 'http://localhost:5179/');
const RIG = flag('id', 'teststub');
const HEADED = has('headed');
const DIST = resolve(ROOT, 'dist');

let pass = 0;
let fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS  ${name}${detail ? '   ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? '   ' + detail : ''}`); }
};

/* ═══════════════════════════════════════════════════════════════════════════
   A — the build carve-out, checked on disk before a browser is involved
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\nA. BUILD OUTPUT');
if (!existsSync(resolve(DIST, 'index.html'))) {
  console.log('  SKIP  no dist/ — run `npm run build` first');
} else {
  const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  // A GLB inlined by Vite would appear as a data URI with the model mime type
  // or as the base64 of the `glTF` magic ("Z2xURg" is `glTF` in base64).
  const inlinedMime = html.includes('data:model/gltf-binary');
  const inlinedMagic = html.includes('Z2xURg');
  ok('no .glb inlined into index.html', !inlinedMime && !inlinedMagic,
    inlinedMime ? 'found data:model/gltf-binary' : inlinedMagic ? 'found base64 glTF magic' : '');
  ok(`dist/models/${RIG}.glb emitted as its own file`,
    existsSync(resolve(DIST, 'models', RIG + '.glb')),
    existsSync(resolve(DIST, 'models', RIG + '.glb'))
      ? (readFileSync(resolve(DIST, 'models', RIG + '.glb')).length / 1024).toFixed(1) + ' kB' : '');
  ok('index.html uses a relative base', !/src="\/assets\//.test(html) && !/href="\/assets\//.test(html));
  console.log(`  note  index.html is ${(html.length / 1024 / 1024).toFixed(3)} MB`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   The browser half
   ═══════════════════════════════════════════════════════════════════════════ */
/* Drive the real Chrome already on this machine, exactly as tools/shoot.mjs
   does: the bundled Playwright chromium build does not match the local browser
   cache, and headless cannot bind the discrete GPU here. */
const launchArgs = HEADED
  ? ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--hide-scrollbars', '--mute-audio']
  : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-gpu-sandbox', '--in-process-gpu', '--hide-scrollbars', '--mute-audio'];
let browser = null;
for (const channel of (HEADED ? ['chrome', 'msedge'] : ['chrome', 'msedge', undefined])) {
  try { browser = await chromium.launch({ channel, headless: !HEADED, args: launchArgs }); break; }
  catch (e) { if (channel === undefined) throw e; }
}
if (!browser) throw new Error('no Chrome or Edge channel could be launched');
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });

const consoleLines = [];
page.on('console', (m) => consoleLines.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => consoleLines.push('pageerror: ' + e.message));

const requests = [];
page.on('response', (r) => requests.push({ url: r.url(), status: r.status() }));

const url = `${URL_BASE}${URL_BASE.includes('?') ? '&' : '?'}quality=high&shot`;
const resp = await page.goto(url, { waitUntil: 'load' });
/* This harness exists to judge the BUILT output. This project runs several
   dev servers at once and they drift across ports, so confirm what answered
   is the built page and not somebody's `npm run dev`. */
const servedHtml = resp ? await resp.text() : '';
if (servedHtml.includes('/@vite/client')) {
  console.error(`
  ABORT  ${URL_BASE} is a Vite DEV server, not the built dist/. `
    + 'Serve dist (npx vite preview --port <free> --strictPort) and pass --url.');
  await browser.close();
  process.exit(2);
}
await page.waitForFunction(() => window.__DRILLITY && window.__DRILLITY.__qa, null, { timeout: 30000 });
await page.waitForTimeout(2500);

/* ── B — load ────────────────────────────────────────────────────────────── */
console.log('\nB. LOAD');
const info = await page.evaluate(async (id) => {
  try { return { ok: true, info: await window.__DRILLITY.__qa.loadModel(id) }; }
  catch (e) { return { ok: false, error: String(e && e.message || e) }; }
}, RIG);
ok(`loadModel("${RIG}") resolved`, info.ok, info.ok ? '' : info.error);
if (info.ok) {
  const i = info.info;
  console.log(`  ${(i.bytes / 1024).toFixed(1)} kB · ${i.prims} primitives · ${i.tris} tris · `
    + `${i.verts} verts · fetch ${i.fetchMs.toFixed(1)} ms · parse ${i.parseMs.toFixed(1)} ms`);
  console.log(`  pivots [${i.pivots.join(', ')}]  slides [${i.slides.join(', ')}]  `
    + `kinds [${i.kinds.join(', ')}]`);
  console.log(`  lamps: ${i.lights.map((l) => `${l.name} cone ${l.coneDeg}° range ${l.rangeM} m `
    + `moves=${l.moves}`).join(' | ') || '(none)'}`);
  ok('the model arrived as its own HTTP request (not inlined)',
    requests.some((r) => r.url.includes(`/models/${RIG}.glb`) && r.status === 200));
  ok('primitive count is inside the 70 draw-call budget', i.prims <= 70, `${i.prims} primitives`);
}

/* ── C, D, E — builder, materials, draw calls ───────────────────────────── */
console.log('\nC/D/E. BUILDER, MATERIALS, DRAW CALLS');
const built = await page.evaluate(async (id) => {
  const c = window.__DRILLITY;
  const T = c.THREE;
  const make = c.gltfRigs.builder(id);
  if (typeof make !== 'function') return { error: 'builder() returned ' + typeof make };
  const b = make(T, c);

  /* C — the shape rigFactory.js requires. `update()` iterates hoses and
     weights EVERY FRAME with no guard, and show() iterates outriggers. */
  const dynOk = ['tracks', 'outriggers', 'hoses', 'weights'].every((k) => Array.isArray(b.dyn[k]))
    && Array.isArray(b.dyn.carriageRange) && Array.isArray(b.dyn.workLights);
  // The carriage invariant: carriageRange AND (mastHeight OR carriageNoFlex),
  // or `position.z = -0 * undefined` silently writes NaN into a world matrix.
  const carriageOk = !b.dyn.carriage
    || (Array.isArray(b.dyn.carriageRange)
      && (typeof b.dyn.mastHeight === 'number' || b.dyn.carriageNoFlex === true));

  /* D — materials */
  const mats = new Map();
  let hot = [];
  let unnamed = 0;
  b.root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    for (const m of (Array.isArray(o.material) ? o.material : [o.material])) {
      mats.set(m.uuid, m);
      if (m.transmission > 0) hot.push((m.userData && m.userData.assetKind) || m.name || m.uuid);
      if (!m.userData || !m.userData.assetKind) unnamed++;
    }
  });
  const matKinds = Array.from(mats.values())
    .map((m) => (m.userData && m.userData.assetKind) || '(not from assets.js)');

  /* Two builds must not share geometry — the shop preview's disposer would
     free it out from under the machine in the site scene. */
  const b2 = make(T, c);
  const geo1 = [];
  const geo2 = [];
  b.root.traverse((o) => { if (o.isMesh) geo1.push(o.geometry.uuid); });
  b2.root.traverse((o) => { if (o.isMesh) geo2.push(o.geometry.uuid); });
  const geoShared = geo1.some((u) => geo2.includes(u));
  b2.root.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });

  /* E — draw calls, the same probe tools/shoot.mjs uses: render once into a
     32 px target with shadow auto-update parked, with and without the object.
     Draw calls are a function of the frustum, not the target size. */
  const scene = c.scene || (c.renderer && c.renderer.scene);
  const cam = c.camera || (c.renderer && c.renderer.camera);
  let calls = null;
  let tris = null;
  if (scene && cam && c.renderer && c.renderer.gl) {
    const gl = c.renderer.gl;
    const prevShadow = gl.shadowMap.autoUpdate;
    gl.shadowMap.autoUpdate = false;
    const rt = new T.WebGLRenderTarget(32, 32);
    // Stand the machine where the camera is already looking.
    const rigGroup = (c.rig && c.rig.group) || scene;
    rigGroup.add(b.root);
    b.root.updateMatrixWorld(true);
    const one = () => {
      gl.info.reset();
      gl.setRenderTarget(rt);
      try { gl.render(scene, cam); } catch (e) { void e; }
      gl.setRenderTarget(null);
      return { calls: gl.info.render.calls, tris: gl.info.render.triangles };
    };
    const withIt = one();
    b.root.visible = false;
    const without = one();
    b.root.visible = true;
    calls = withIt.calls - without.calls;
    tris = withIt.tris - without.tris;
    rt.dispose();
    gl.shadowMap.autoUpdate = prevShadow;
  }

  // Keep it in the scene for check F.
  window.__glbTest = { build: b };

  return {
    dynOk, carriageOk, geoShared, hot, unnamed, matKinds,
    specIsObject: !!b.spec && typeof b.spec === 'object',
    spec: b.spec,
    rootName: b.root.name,
    lights: b.dyn.workLights.length,
    calls, tris,
  };
}, RIG);

if (built.error) {
  ok('builder() returned a function', false, built.error);
} else {
  ok('builder() returns a function producing {root, dyn, spec}', true, built.rootName);
  ok('dyn carries every array the update loop dereferences unguarded', built.dynOk);
  ok('carriage invariant (range + mastHeight|noFlex)', built.carriageOk);
  ok('spec is a non-null object (ensureBuild reads spec.frameRadius)', built.specIsObject,
    built.spec ? `frameRadius ${built.spec.frameRadius}, mastM ${built.spec.mastM}` : '');
  ok('two builds do not share geometry', !built.geoShared);
  ok('every material came from assets.js', built.unnamed === 0,
    built.unnamed ? `${built.unnamed} did not` : `kinds: ${[...new Set(built.matKinds)].join(', ')}`);
  ok('NOTHING carries transmission > 0 (HANDOFF §8F)', built.hot.length === 0,
    built.hot.length ? 'hot: ' + built.hot.join(', ') : '');
  if (built.calls !== null) {
    ok('measured draw calls are inside the 70/rig budget', built.calls <= 70,
      `${built.calls} calls, ${built.tris} triangles (info.render)`);
  } else {
    console.log('  SKIP  no renderer handle for the draw-call probe');
  }
}

/* ── F — the reason all of this exists: env.js re-aiming spotlights ─────── */
console.log('\nF. env.js WORK LIGHTS');
const envRes = await page.evaluate(async (id) => {
  const c = window.__DRILLITY;
  const T = c.THREE;
  const b = window.__glbTest && window.__glbTest.build;
  if (!b) return { error: 'no build from the previous step' };
  const lights = b.dyn.workLights;
  if (!lights.length) return { error: 'this model publishes no work lights' };

  /* The shape env.js consumes, field by field (env.js ~1894-1923):
       src.node.getWorldPosition(l.position)
       src.aim.getWorldPosition(l.target.position)
       l.angle    = degToRad(src.coneDeg) * 0.5
       l.distance = src.rangeM * 1.8
       l.color.setHex(src.colourHex)                                       */
  const shape = lights.map((l) => ({
    name: l.name,
    node: !!(l.node && typeof l.node.getWorldPosition === 'function'),
    aim: !!(l.aim && typeof l.aim.getWorldPosition === 'function'),
    colourHex: typeof l.colourHex === 'number' && l.colourHex > 0,
    coneDeg: typeof l.coneDeg === 'number' && l.coneDeg > 0,
    rangeM: typeof l.rangeM === 'number' && l.rangeM > 0,
    wattHint: typeof l.wattHint === 'number',
    moves: typeof l.moves === 'boolean',
  }));

  /* Drive the REAL env.js with this array. env.js caches the result of
     getWorkLights() and re-reads it only on EVENTS.RIG_CHANGE, so the patch
     plus the event is exactly the path a rig change takes. The event is
     emitted with the CURRENT rig id so rigFactory's own handler early-returns
     and nothing else moves. */
  const before = c.rig.getWorkLights;
  c.rig.getWorkLights = () => lights;

  // Underground, or env.js never runs the follow loop at all.
  await c.__qa.startDemoContract({ depth: 12, method: 'tunnel-jumbo' });
  c.bus.emit(c.EVENTS.RIG_CHANGE, { rigId: c.rig.getRigId(), methodId: 'tunnel-jumbo' });

  const frames = (n) => new Promise((r) => {
    let i = 0;
    const t = () => (++i >= n ? r() : requestAnimationFrame(t));
    requestAnimationFrame(t);
  });
  await frames(20);

  const scene = c.scene || (c.renderer && c.renderer.scene);
  const spots = [];
  scene.traverse((o) => { if (o.isSpotLight) spots.push(o); });

  const wp = (o) => { const v = new T.Vector3(); o.getWorldPosition(v); return v; };
  const near = (a, b, eps) => a.distanceTo(b) < eps;

  // Which spotlight, if any, sits on each lamp? env.js binds by name and falls
  // back to ordinal, so we do not assume which — we look for the match.
  const bound = lights.map((l) => {
    const p = wp(l.node);
    const s = spots.find((sp) => near(sp.position, p, 0.05));
    return {
      name: l.name,
      followed: !!s,
      // The aim is the other half: the spot's target must sit on aim:<name>.
      aimed: !!(s && s.target && near(s.target.position, wp(l.aim), 0.05)),
      angleDeg: s ? +(T.MathUtils.radToDeg(s.angle) * 2).toFixed(1) : null,
      distance: s ? +s.distance.toFixed(1) : null,
    };
  });

  /* THE ACTUAL POINT: a lamp on a boom must SWEEP when the boom moves. Rotate
     the pivot and confirm the spotlight went with it. */
  let sweep = null;
  /* The lamp that must sweep: one that (a) moves and (b) a spotlight actually
     bound to, so the test measures the real path and not a hypothetical one.
     The node to turn is its nearest pivot: ancestor, whatever that machine
     happens to call it — 'mast' on a crawler, 'slew' or 'leader' on a leader
     rig. Hardcoding a name here would make the test pass on one machine. */
  const moving = lights.filter((l) => l.moves)
    .find((l) => spots.some((sp) => near(sp.position, wp(l.node), 0.05)));
  if (moving) {
    const p0 = wp(moving.node);
    const s = spots.find((sp) => near(sp.position, p0, 0.05));
    let pivot = null;
    for (let p = moving.node.parent; p; p = p.parent) {
      if (p.name && p.name.startsWith('pivot:')) { pivot = p; break; }
    }
    if (s && pivot) {
      const r0 = pivot.rotation.z;
      pivot.rotation.z = r0 + 0.45;
      await frames(4);
      const p1 = wp(moving.node);
      sweep = {
        lamp: moving.name + " (turning " + pivot.name + ")",
        nodeMoved: +p0.distanceTo(p1).toFixed(4),
        lightFollowed: +s.position.distanceTo(p1).toFixed(4),
        lightMoved: +s.position.distanceTo(p0).toFixed(4),
      };
      pivot.rotation.z = r0;
    }
  }

  c.rig.getWorkLights = before;
  b.root.parent && b.root.parent.remove(b.root);

  return { shape, bound, sweep, spotCount: spots.length };
}, RIG);

if (envRes.error) {
  console.log('  SKIP  ' + envRes.error);
} else {
  for (const s of envRes.shape) {
    const missing = Object.entries(s).filter(([k, v]) => k !== 'name' && !v).map(([k]) => k);
    ok(`lamp "${s.name}" satisfies every field env.js reads`, missing.length === 0,
      missing.length ? 'missing/invalid: ' + missing.join(', ') : '');
  }
  const followed = envRes.bound.filter((b) => b.followed);
  ok('env.js put a real spotlight on a mount: node', followed.length > 0,
    `${followed.length} of ${envRes.bound.length} lamps followed, ${envRes.spotCount} spots in scene`);
  for (const b of followed) {
    ok(`  "${b.name}" — target sits on its aim: node`, b.aimed,
      `cone ${b.angleDeg}° distance ${b.distance} m`);
  }
  if (envRes.sweep) {
    const s = envRes.sweep;
    ok('a boom lamp SWEEPS: the spotlight tracked the pivot',
      s.nodeMoved > 0.05 && s.lightFollowed < 0.02 && s.lightMoved > 0.05,
      `node moved ${s.nodeMoved} m, light ended ${s.lightFollowed} m from it `
      + `(and ${s.lightMoved} m from where it was)`);
  } else {
    console.log('  SKIP  no moving lamp bound to a spotlight to sweep');
  }
}

/* ── console health ─────────────────────────────────────────────────────── */
console.log('\nCONSOLE');
const errs = consoleLines.filter((l) => l.startsWith('error') || l.startsWith('pageerror'));
for (const l of errs.slice(0, 12)) console.log('  ' + l);
const gltfLines = consoleLines.filter((l) => l.includes('[gltfRig]'));
for (const l of gltfLines.slice(0, 12)) console.log('  ' + l);

console.log(`\n${pass} passed, ${fail} failed`
  + (HEADED ? '' : '   ⚠ NOT --headed: SwiftShader, every number above is a lie'));
await browser.close();
process.exit(fail ? 1 : 0);
