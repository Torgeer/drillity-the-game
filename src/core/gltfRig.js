/**
 * DRILLITY I THE GAME — the runtime half of the Blender pipeline.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `blender/lib/rig.py` is the authoring half. Read its docstring first: it
 * states three contracts, and this file is what makes each of them true at
 * run time. The two files must be read as one document.
 *
 *   1. NAMED NODES survive export        -> `index()` below finds them by
 *      prefix and republishes them in exactly the shapes `rig/rigFactory.js`
 *      already drives and `core/env.js` already reads.
 *   2. MATERIALS ARE NAMES, NOT TEXTURES -> `swapMaterials()` throws away
 *      every material the `.glb` shipped and asks `ctx.assets` for the live
 *      procedural one of the same name, so a Blender machine wears the same
 *      wear, dirt and rust as a procedural one, off the same texture budget.
 *   3. DRAW CALLS <= 70                  -> the exporter already joined the
 *      statics by material, so the file's primitive count IS the floor, and
 *      `tools/glbinfo.mjs` reads it out of the file with no GPU involved.
 *
 * ── WHY THE MODEL IS NOT IN THE BUNDLE ─────────────────────────────────────
 * `vite.config.js` builds ONE 2.685 MB HTML file. A `.glb` inlined as base64
 * costs +33 %, and this fleet is nine machines becoming eighteen. The shell
 * stays single-file; the machines do not go in it. They live in `public/models`
 * — which Vite copies to `dist/` VERBATIM, never through the bundler — and are
 * fetched at run time from a path relative to the document.
 *
 * The consequence is stated plainly because it is a real cost: `dist/` is no
 * longer one file. It is one file plus `dist/models/`, and it must be SERVED
 * (`npm run preview`, or any static host). Opening `dist/index.html` off the
 * filesystem still boots the game, but `fetch()` on a `file://` URL is blocked
 * by the browser, so a Blender machine cannot load there and says so out loud.
 * See `vite.config.js` for the matching half of this decision.
 *
 * ── ONLY WHAT THE PLAYER OWNS ──────────────────────────────────────────────
 * Nothing here loads a fleet. `warm(ids)` takes the ids the player actually
 * owns — `state.unlocked.rigs` plus the one in the garage, typically one to
 * three — and `main.js` calls it at boot and whenever the set can change.
 * Eighteen machines are never in memory at once.
 *
 * ── FAILING LOUDLY (HANDOFF §8A) ───────────────────────────────────────────
 * A missing model NEVER becomes a different machine. `load()` rejects with the
 * URL and the HTTP status; `builder()` then returns null for that id and the
 * failure is recorded in `problems()` for the QA harness to assert on. What
 * `rigFactory.js` does next is fall through to the PROCEDURAL BUILDER FOR THE
 * SAME RIG ID — the same machine, drawn the old way — which is a migration
 * state, not a substitution, and it has already been shouted about by then.
 * `?glb=strict` removes even that: a failed id then refuses to build at all,
 * so a capture run cannot quietly photograph the procedural machine and call
 * it the Blender one.
 */

/* ── where the models live ──────────────────────────────────────────────────
   Resolved against `document.baseURI`, never against an absolute '/'. The
   built page must work from a sub-path (a GitHub Pages project site, a
   preview URL, a phone opening it off a LAN share), and `base: './'` in
   vite.config.js is the other half of that. */
const MODEL_DIR = 'models/';

/** `glTF` in ASCII — the first four bytes of every GLB container. */
const GLB_MAGIC = 0x46546c67;

/* Node-name prefixes. These MUST stay in step with the `NODE_` constants in
   `blender/lib/rig.py`; they are the whole reason the pipeline works. */
const P_PIVOT = 'pivot:';
const P_SLIDE = 'slide:';
const P_MOUNT = 'mount:';
const P_AIM = 'aim:';

import { readClips, createAnimator } from './gltfAnim.js';

/**
 * Work-light defaults, for the fields `blender/lib/rig.py:worklight()` does
 * not carry. They are the SAME numbers `rigFactory.js addWorkLight()` uses, so
 * a Blender lamp and a procedural lamp are indistinguishable to `env.js`. A
 * model may override any of them by adding the custom property to the mount.
 */
const LAMP_DEFAULTS = { colourHex: 0xFFE9C0, coneDeg: 52, rangeM: 24, wattHint: 70 };

/* The animation half. `gltfAnim.js` reads glTF animation clips off the parsed
   file and returns a per-instance animator. It is imported here rather than
   left to a caller for the reason this codebase keeps relearning: a capability
   with no call site is invisible, and `builder()` sat with ZERO call sites
   while thirteen machines were modelled against it. */

/* ═══════════════════════════════════════════════════════════════════════════
   The system
   ═══════════════════════════════════════════════════════════════════════════ */

export function createGltfRigs(ctx) {
  const T = ctx && ctx.THREE;
  if (!T) throw new Error('[gltfRig] ctx.THREE is required');
  const strict = !!(ctx && ctx.qs && ctx.qs.get('glb') === 'strict');
  /**
   * `?glb=off` — never build from a model, even one that loaded cleanly.
   *
   * The procedural machines have been tuned for months and a first-pass export
   * is not automatically better. Judging that needs the two side by side in the
   * same session, on the same GPU, warm — so the switch has to be a URL
   * parameter rather than a code edit and a rebuild.
   */
  const disabled = !!(ctx && ctx.qs && ctx.qs.get('glb') === 'off');

  /** id -> { root, nodes, tris, prims } — the parsed, material-swapped master. */
  const prepared = new Map();
  /** id -> Promise, so two callers asking at once share one fetch. */
  const inflight = new Map();
  /** id -> Error, for ids that were asked for and could not be delivered. */
  const failures = new Map();
  /** Everything the loader wants a human to know, in the order it happened. */
  const log = [];

  let GLTFLoader = null;
  let MeshoptDecoder = null;
  let loaderPromise = null;

  const say = (level, msg, extra) => {
    log.push({ level, msg, t: Date.now() });
    const line = '[gltfRig] ' + msg;
    if (level === 'error') console.error(line, extra === undefined ? '' : extra);
    else if (level === 'warn') console.warn(line, extra === undefined ? '' : extra);
    else console.info(line);
  };

  const modelUrl = (id) => new URL(
    MODEL_DIR + id + '.glb',
    (typeof document !== 'undefined' && document.baseURI) || './',
  ).href;

  /* ── the three.js side, imported once and only if a model is ever asked for ─
     Under the current single-file config `inlineDynamicImports: true` folds
     this into the one chunk, so it costs a parse and not a request. Written as
     a dynamic import anyway: the day this project stops being single-file, the
     GLTFLoader and the Meshopt decoder become a real lazy chunk for free. */
  async function ensureLoader() {
    if (GLTFLoader) return;
    if (!loaderPromise) {
      loaderPromise = (async () => {
        const [gl, mo] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/libs/meshopt_decoder.module.js'),
        ]);
        GLTFLoader = gl.GLTFLoader;
        MeshoptDecoder = mo.MeshoptDecoder;
      })();
    }
    await loaderPromise;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     MATERIALS — contract 2

     Every material in the file is a bare NAME. It is thrown away and replaced
     with `ctx.assets.material(name)`, the live procedural material, which is a
     SHARED cached instance. That sharing is load-bearing twice over: it is how
     the wear system reaches a Blender machine at all, and `mergeStatic()`
     buckets by `material.uuid`, so one instance per kind is also what keeps
     the draw calls down.
     ═════════════════════════════════════════════════════════════════════════ */

  /**
   * NEVER let a material reach the scene with transmission > 0.
   *
   * `assets.material('glass')` returns transmission 0.92 TODAY (assets.js
   * ~2058) and nothing downstream zeroes it — every existing call site zeroes
   * it by hand, which is precisely why it has been reintroduced three times.
   * HANDOFF §8F has the measurement: +65..81 draw calls, and it does not scale
   * with the object, so one cab window costs what a windscreen costs.
   *
   * This does not carry a list of which kinds are hot — a second list is how
   * this codebase grows two tables that disagree (§8B). It asks for the
   * material, LOOKS at what came back, and asks again with the property pinned
   * if it needs to. Any kind that ever turns transmissive is caught the day it
   * does, with no edit here.
   */
  function liveMaterial(kind, id) {
    const assets = ctx && ctx.assets;
    if (!assets || typeof assets.material !== 'function') {
      throw new Error('assets system is not up — load a model after assets.init()');
    }
    // Contract 2 says the name matches a kind in assets.js. When it does not,
    // assets.js warns once and hands back rawSteel for the rest of the session
    // — a chassis silently becomes bright bare steel. Say which model did it.
    const kinds = assets._kinds;
    if (kinds && !kinds[kind]) {
      say('error', `"${id}": material "${kind}" is not a kind in assets.js — `
        + 'assets.js will substitute rawSteel for it. Fix the name in the Blender '
        + 'script or add the kind to assets.js; do not leave it silently wrong.');
    }
    let m = assets.material(kind);
    if (m && m.transmission > 0) {
      m = assets.material(kind, { transmission: 0 });
      if (m && m.transmission > 0) {
        throw new Error(`"${id}": material "${kind}" kept transmission > 0 after being `
          + 'asked for 0 — refusing to add it to the scene (HANDOFF §8F).');
      }
    }
    return m;
  }

  function swapMaterials(root, id) {
    const intern = new Map();      // kind -> shared live material
    const seen = new Set();        // imported materials, disposed once each
    const kinds = [];

    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const olds = Array.isArray(o.material) ? o.material : [o.material];
      const news = olds.map((old) => {
        const kind = (old && old.name) || '';
        if (!kind) {
          say('error', `"${id}": a mesh named "${o.name}" carries an unnamed material. `
            + 'A Blender material here must be a NAME (blender/lib/rig.py §2).');
        }
        if (!intern.has(kind)) {
          intern.set(kind, liveMaterial(kind, id));
          kinds.push(kind);
        }
        if (old && !seen.has(old)) {
          seen.add(old);
          // The exporter should ship no maps at all; dispose anything it did,
          // so a stray baked texture never quietly occupies the budget.
          for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap',
            'aoMap', 'emissiveMap', 'alphaMap']) {
            if (old[k] && old[k].dispose) {
              say('warn', `"${id}": material "${kind}" shipped a baked ${k} — discarded. `
                + 'Baked maps opt this machine out of the wear system.');
              try { old[k].dispose(); } catch (e) { /* noop */ }
            }
          }
          try { old.dispose(); } catch (e) { /* noop */ }
        }
        return intern.get(kind);
      });
      o.material = Array.isArray(o.material) ? news : news[0];
      o.castShadow = true;
      o.receiveShadow = true;
    });

    return kinds;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     NAMED NODES — contract 1
     ═════════════════════════════════════════════════════════════════════════ */

  /**
   * PUT THE COLONS BACK.
   *
   * three.js's GLTFLoader runs every node name through
   * `PropertyBinding.sanitizeNodeName()`, which DELETES the characters
   * `[ ] . : /` because they are reserved in animation track paths. So
   * `pivot:mast` arrives in the browser as `pivotmast` and
   * `mount:boom-1-work-light` as `mountboom-1-work-light`.
   *
   * The whole named-node contract is a string lookup — `blender/lib/rig.py`
   * says so in its first paragraph and `rigFactory.js` does exactly that — so
   * this is not cosmetic: unrepaired, EVERY pivot, slide and lamp in every
   * machine is invisible to the game, and nothing anywhere throws. The first
   * run of `tools/glbverify.mjs` reported "0 pivots, 0 slides, 0 lamps" on a
   * file that `tools/glbinfo.mjs` could see all six of, because glbinfo reads
   * the file and three.js reads it through the sanitiser.
   *
   * The authored name is still recoverable: `parser.associations` maps each
   * Object3D back to its glTF node index, and the raw JSON is right there. So
   * the names are restored from the file before anything looks at them, and
   * the count is then CHECKED against the file — if three.js ever changes how
   * it mangles a name, this says so instead of quietly losing the machine's
   * moving parts.
   *
   * (There is no animation in these files — `finish()` exports none — so
   * restoring the reserved characters costs nothing.)
   */
  function restoreNames(gltf, id) {
    const parser = gltf.parser;
    const json = parser && parser.json;
    const assoc = parser && parser.associations;
    if (!json || !assoc) {
      throw new Error(`"${id}": GLTFLoader gave no parser associations — cannot `
        + 'recover the authored node names, and every named node would be lost.');
    }
    let restored = 0;
    for (const [obj, ref] of assoc) {
      if (!ref || ref.nodes === undefined || !obj || !obj.isObject3D) continue;
      const authored = (json.nodes[ref.nodes] || {}).name;
      if (authored && obj.name !== authored) { obj.name = authored; restored++; }
    }

    // The file's own count of prefixed nodes, versus what survived into the
    // scene graph. These must agree.
    const prefixes = [P_PIVOT, P_SLIDE, P_MOUNT, P_AIM];
    const inFile = (json.nodes || []).filter(
      (n) => n.name && prefixes.some((p) => n.name.startsWith(p))).length;
    let inScene = 0;
    gltf.scene.traverse((o) => {
      if (o.name && prefixes.some((p) => o.name.startsWith(p))) inScene++;
    });
    if (inScene !== inFile) {
      throw new Error(`"${id}": the .glb declares ${inFile} named nodes but only ${inScene} `
        + 'reached the scene graph. The pivot:/slide:/mount:/aim: contract is broken — '
        + 'refusing to load a machine whose moving parts the game cannot find.');
    }
    return { restored, named: inFile };
  }

  /**
   * GET THE NAMED NODES OFF THE STATIC MESHES.
   *
   * `finish()` in blender/lib/rig.py joins the statics by material, and
   * Blender re-parents the joined-away objects' children onto the survivor.
   * HANDOFF §4b shows the result of a verified export:
   *
   *     static:paintedSteel [mesh] -> mount:lamp-1
   *
   * — a lamp whose parent is a MESH. That is fine in the file and fatal in the
   * scene, because `ensureBuild()` then runs `mergeStatic()`, which merges
   * every static mesh into one new mesh at the merge root and REMOVES the
   * originals from their parents. A node parented to one of those meshes is
   * removed with it: the lamp leaves the scene graph entirely, `getWorldPosition`
   * keeps answering (from a detached node whose matrix nobody updates any more),
   * and the drive is lit by a spotlight welded to wherever the machine happened
   * to be standing when it was built. Nothing throws.
   *
   * So every pivot:, slide: and mount: that hangs off a mesh is lifted to its
   * nearest non-mesh ancestor first. `attach()` preserves the world transform,
   * so the lamp does not move a millimetre — it just stops being cargo.
   * (`aim:` rides its mount and needs no lift of its own.)
   */
  function liftNamedOffMeshes(root, id) {
    const PRE = [P_PIVOT, P_SLIDE, P_MOUNT];
    const victims = [];
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      if (!o.name || !PRE.some((p) => o.name.startsWith(p))) return;
      for (let p = o.parent; p && p !== root; p = p.parent) {
        if (p.isMesh) { victims.push(o); return; }
      }
    });
    for (const o of victims) {
      let host = o.parent;
      while (host && host !== root && host.isMesh) host = host.parent;
      (host || root).attach(o);
    }
    if (victims.length) {
      say('info', `"${id}": lifted ${victims.length} named node(s) off static meshes `
        + '— mergeStatic() would otherwise have carried them out of the scene.');
    }
    return victims.length;
  }

  /** Does this node sit under something the game moves? Decides lamp `moves`. */
  function underDynamic(node) {
    for (let p = node.parent; p; p = p.parent) {
      if (p.name.startsWith(P_PIVOT) || p.name.startsWith(P_SLIDE)) return true;
    }
    return false;
  }

  /**
   * Index a loaded scene into the four maps the game drives it through.
   *
   * `userData.dynamic` on every pivot and slide is not decoration. `ensureBuild`
   * runs `mergeStatic()` over whatever a builder returns, and mergeStatic bakes
   * every static mesh into one merged mesh at the merge root AND REMOVES IT
   * from its parent. A pivot that is not flagged would be merged away, and the
   * game would then be writing rotations into a node that is no longer in the
   * scene — the geometry would simply never move, with no error anywhere.
   */
  function index(root, id, quiet) {
    const pivots = new Map();
    const slides = new Map();
    const mounts = new Map();
    const aims = new Map();

    root.traverse((o) => {
      const n = o.name || '';
      if (n.startsWith(P_PIVOT)) { o.userData.dynamic = true; pivots.set(n.slice(P_PIVOT.length), o); }
      else if (n.startsWith(P_SLIDE)) { o.userData.dynamic = true; slides.set(n.slice(P_SLIDE.length), o); }
      else if (n.startsWith(P_MOUNT)) mounts.set(n.slice(P_MOUNT.length), o);
      else if (n.startsWith(P_AIM)) aims.set(n.slice(P_AIM.length), o);
    });

    /* NOT EVERY MOUNT IS A LAMP.
       `blender/lib/rig.py` says so in as many words: a `mount:` is "a fixed
       attachment point (lamp, hose end, decal plate)". The real machines use
       both — `piling-leader` carries five lamps and four attachment points
       (`marque`, `operator`, `plate`, `pile-head`). What separates them is
       the `aim:` node, which only `worklight()` emits, so THAT is the test.
       Publishing an attachment point as a lamp would hand env.js a spotlight
       with nowhere to point; complaining about one would be four false alarms
       per machine, which is how a real warning stops being read.

       A mount that declares a cone or a range and has no aim is neither: it is
       a lamp somebody half-wired, and that IS worth shouting about. */
    const lights = [];
    for (const [name, node] of mounts) {
      const aim = aims.get(name);
      const x = node.userData || {};
      if (!aim) {
        if (!quiet && (x.cone_deg !== undefined || x.range_m !== undefined)) {
          say('error', `"${id}": ${P_MOUNT}${name} declares a lamp cone or range but has `
            + `no ${P_AIM}${name}. env.js re-aims a spotlight at that node every frame `
            + 'and will skip this lamp entirely.');
        }
        continue;   // a plain attachment point; it stays in `mounts`
      }
      lights.push({
        name: name,
        node: node,
        aim: aim,
        // `extras` from the .glb land in userData. Blender's custom-property
        // names are snake_case; the game's fields are camelCase.
        colourHex: x.colour_hex === undefined ? LAMP_DEFAULTS.colourHex : x.colour_hex,
        coneDeg: x.cone_deg === undefined ? LAMP_DEFAULTS.coneDeg : x.cone_deg,
        rangeM: x.range_m === undefined ? LAMP_DEFAULTS.rangeM : x.range_m,
        wattHint: x.watt_hint === undefined ? LAMP_DEFAULTS.wattHint : x.watt_hint,
        // Not a default but a FACT about this model: the lamp moves iff it
        // hangs off something the game drives.
        moves: underDynamic(node),
      });
    }

    return { pivots, slides, mounts, aims, lights };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     MEASUREMENT — the numbers this pipeline is judged on, taken off the file
     ═════════════════════════════════════════════════════════════════════════ */

  function measure(root) {
    let prims = 0;
    let tris = 0;
    let verts = 0;
    root.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      prims += Array.isArray(o.material) ? o.material.length : 1;
      const g = o.geometry;
      const pos = g.attributes && g.attributes.position;
      if (!pos) return;
      verts += pos.count;
      tris += (g.index ? g.index.count : pos.count) / 3;
    });
    return { prims, tris: Math.round(tris), verts };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     LOAD
     ═════════════════════════════════════════════════════════════════════════ */

  async function loadOne(id) {
    const url = modelUrl(id);
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());

    let res;
    try {
      // Default cache mode on purpose. 'force-cache' would reuse a stale
      // heuristically-fresh copy, and these files are REBUILT constantly while
      // the fleet is being authored — a modeller re-running the Blender script
      // and seeing yesterday's machine is a debugging afternoon. The server's
      // etag makes the re-check a 304 anyway.
      res = await fetch(url);
    } catch (e) {
      // The `file://` case lands here, and it is worth naming exactly.
      throw new Error(`could not fetch ${url} — ${e.message}`
        + (url.startsWith('file:')
          ? '. Models cannot be read from the filesystem; serve dist/ (npm run preview).'
          : ''));
    }
    if (!res.ok) {
      throw new Error(`${url} returned HTTP ${res.status}. `
        + `The model for "${id}" is not there — build it (npm run blender) or `
        + 'check the filename: it must be the RIG ID verbatim, hyphens and all.');
    }

    const buf = await res.arrayBuffer();
    const bytes = buf.byteLength;

    // A dev server that answers an unknown path with index.html would hand us
    // HTML and GLTFLoader would fail with something about JSON. Four bytes
    // settle it, and the message then says what actually happened.
    if (bytes < 12 || new DataView(buf).getUint32(0, true) !== GLB_MAGIC) {
      throw new Error(`${url} is not a GLB — the server answered with something else `
        + `(${bytes} bytes). This is usually an SPA fallback page, not a model.`);
    }

    await ensureLoader();
    const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);   // EXT_meshopt_compression, if present
    const gltf = await loader.parseAsync(buf, '');
    const t2 = (typeof performance !== 'undefined' ? performance.now() : Date.now());

    // BEFORE anything reads a name. See restoreNames().
    const names = restoreNames(gltf, id);

    const root = gltf.scene;
    root.name = 'rig:' + id;
    // The exporter already wrote Y-up (`export_yup=True`), and the machine's
    // origin is its slew centre at ground level, so there is no fudge here on
    // purpose. If a machine lands in the wrong place, fix the Blender script.

    const kinds = swapMaterials(root, id);
    liftNamedOffMeshes(root, id);      // BEFORE indexing: it changes parents
    const nodes = index(root, id);
    const clips = readClips(T, gltf, id, say);
    const m = measure(root);

    // Bounding box, taken off the mesh rather than quoted (HANDOFF §8E).
    const box = new T.Box3().setFromObject(root);
    const size = box.getSize(new T.Vector3());

    say('info', `"${id}" ${(bytes / 1024).toFixed(1)} kB · ${m.prims} primitives `
      + `(draw-call floor) · ${m.tris} tris · ${nodes.pivots.size} pivots, `
      + `${nodes.slides.size} slides, ${nodes.lights.length} lamps `
      + `(${names.named} named nodes, ${names.restored} names un-sanitised) · `
      + `materials: ${kinds.join(', ')} · fetch ${(t1 - t0).toFixed(0)} ms, `
      + `parse ${(t2 - t1).toFixed(0)} ms`);

    if (m.prims > 70) {
      say('warn', `"${id}" has ${m.prims} primitives and the budget is 70 draw calls `
        + 'per rig. The exporter joins statics by material — something is not joining.');
    }

    return {
      id,
      root,
      nodes,
      clips,
      bytes,
      prims: m.prims,
      tris: m.tris,
      verts: m.verts,
      fetchMs: t1 - t0,
      parseMs: t2 - t1,
      size: { x: size.x, y: size.y, z: size.z },
      radius: Math.max(size.x, size.z) * 0.5,
      kinds,
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     THE SYNCHRONOUS BUILDER — the bridge back to rigFactory.js

     `ensureBuild()` is synchronous and always will be; making it async would
     reach into every caller of `setRig()`. So all of the waiting happens in
     `load()`, and what `builder()` hands back is an ordinary builder function
     with the same signature as every entry in `RIG_BUILDERS`:
     `(T, ctx) => { root, dyn, spec }`.
     ═════════════════════════════════════════════════════════════════════════ */

  /**
   * A fresh, independently disposable copy of a prepared model.
   *
   * `Object3D.clone()` shares geometries, and `disposeObject()` disposes
   * geometry unconditionally — so the shop preview closing would free the
   * geometry out from under the machine standing in the site scene. The
   * geometries are therefore cloned too. Materials are NOT: they are the
   * shared `assets.js` instances, they are not flagged `userData.__own`, and
   * `disposeObject()` deliberately leaves those alone.
   */
  function instantiate(prep) {
    const root = prep.root.clone(true);
    root.traverse((o) => { if (o.isMesh && o.geometry) o.geometry = o.geometry.clone(); });
    return root;
  }

  /**
   * Assemble the `dyn` record `rigFactory.js`'s runtime half drives.
   *
   * The six arrays are not optional. `update()` iterates `dyn.hoses` and
   * `dyn.weights` EVERY FRAME with no guard, and `show()` iterates
   * `dyn.outriggers` on every rig change — an absent array is a throw, not a
   * degraded machine. This mirrors `newDyn()` in rigFactory.js exactly.
   */
  function makeDyn(prep, root) {
    const nodes = index(root, prep.id, true);   // re-index: these are the CLONE's nodes
    const dyn = {
      tracks: [], outriggers: [], hoses: [], sheaves: [], weights: [],
      wheels: [], flexNodes: [], carriageRange: [0, 0],
      workLights: nodes.lights,
      root: root,
      // The named nodes, published whole so a caller can reach one this
      // mapping has no opinion about yet.
      pivots: nodes.pivots,
      slides: nodes.slides,
      mounts: nodes.mounts,
    };

    // ── the pivots and slides the runtime already knows how to drive ────────
    const mastPivot = nodes.pivots.get('mast');
    if (mastPivot) dyn.mastPivot = mastPivot;
    const mastBeam = nodes.pivots.get('mast-upper') || mastPivot;
    if (mastBeam) { dyn.mastLower = mastBeam; dyn.mastUpper = mastBeam; }

    const carriage = nodes.slides.get('carriage');
    if (carriage) {
      dyn.carriage = carriage;
      // THE CARRIAGE INVARIANT. `setCarriage()` reads `carriageRange` straight
      // after the `dyn.carriage` guard with no guard of its own, and then does
      //     position.z = -flexA * dyn.mastHeight * 0.5 * frac * frac
      // where `-0 * undefined` is NaN. A carriage without BOTH of these does
      // not throw — it writes NaN into a world matrix and the machine silently
      // disappears. Both are set here or `carriage` is not published at all.
      /* [HIGH, LOW] — the order every procedural builder uses.
         `rigFactory.js` writes `dyn.carriageRange = [mastH - 1.45, 0.55]` and
         friends: top of stroke FIRST. This published `[y, y + travel]`, which
         is low-first, so `setCarriage(u)` ran a Blender carriage backwards —
         it went down as the sim fed down instead of up. Ordering the two ends
         explicitly fixes it for both signs.

         `travel_m` is also NEGATIVE on some machines (foundation_bg exports
         -11.5 for a Kelly that telescopes downward), and the old `travel > 0`
         guard turned that into `[y, y]` — a carriage with no stroke at all,
         silently. Any non-zero finite travel is a stroke. */
      const travel = carriage.userData.travel_m;
      const y = carriage.position.y;
      const hasTravel = typeof travel === 'number' && Number.isFinite(travel) && travel !== 0;
      const far = y + (hasTravel ? travel : 0);
      dyn.carriageRange = hasTravel ? [Math.max(y, far), Math.min(y, far)] : [y, y];
      dyn.mastHeight = prep.size.y;
      if (typeof travel !== 'number') {
        // No stroke declared, so nothing may bend it either.
        dyn.carriageNoFlex = true;
      }
    }

    const toolAnchor = nodes.mounts.get('tool') || nodes.slides.get('carriage');
    if (toolAnchor) dyn.toolAnchor = toolAnchor;

    /* THE ROTARY HEAD DID NOT TURN ON ANY BLENDER MACHINE.
       Every procedural builder sets `dyn.spindle` and `rigFactory.js` drives it
       with `rotation.y = cur.spin` each frame. This function never set it, so
       on a glTF machine the head was indexed, flagged dynamic — and driven by
       nothing. Nineteen machines, no error, a rotary drill whose rotary does
       not rotate. */
    const spindle = nodes.pivots.get('spindle');
    if (spindle) dyn.spindle = spindle;

    /* The clip player. Code drives continuous state (rpm, feed); clips drive
       choreography (a rod change). They overlap on a small known set and are
       settled by ordering plus a per-channel blend FROM THE LIVE VALUE, so no
       driver in rigFactory.js needs a guard. */
    dyn.anim = createAnimator(T, prep.clips, root, { say });

    return dyn;
  }

  function makeSpec(prep) {
    // Stats belong to `game/data.js`, which is the content authority; geometry
    // belongs to the model. Neither is invented here, and nothing is copied
    // from data.js into a second table — it is read through.
    const rigs = (ctx.data && ctx.data.RIGS) || [];
    const row = rigs.find ? rigs.find((r) => r && r.id === prep.id) : null;
    return {
      id: prep.id,
      name: (row && row.name) || prep.id,
      klass: (row && row.family) || 'Blender-authored machine',
      methods: (row && row.methods) ? row.methods.slice() : [],
      // Read off the mesh, never quoted (HANDOFF §8E).
      mastM: +prep.size.y.toFixed(2),
      frameRadius: +Math.max(1, prep.radius * 1.15).toFixed(2),
      source: 'glb',
      glb: {
        bytes: prep.bytes, prims: prep.prims, tris: prep.tris,
        fetchMs: +prep.fetchMs.toFixed(1), parseMs: +prep.parseMs.toFixed(1),
      },
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     Public API
     ═════════════════════════════════════════════════════════════════════════ */

  const api = {
    /**
     * Fetch, parse and prepare one machine. Resolves true, or REJECTS with an
     * error that names the URL and what went wrong. Never resolves false and
     * never substitutes anything.
     */
    load(id) {
      if (!id) return Promise.reject(new Error('load() needs a rig id'));
      if (prepared.has(id)) return Promise.resolve(true);
      if (inflight.has(id)) return inflight.get(id);

      const p = loadOne(id).then((prep) => {
        prepared.set(id, prep);
        failures.delete(id);
        inflight.delete(id);
        if (ctx.bus && ctx.bus.emit) ctx.bus.emit('rig:model-ready', { rigId: id, spec: makeSpec(prep) });
        return true;
      }).catch((e) => {
        inflight.delete(id);
        failures.set(id, e);
        say('error', `"${id}" did NOT load. ${e.message}`);
        say('error', strict
          ? `?glb=strict is on, so "${id}" will refuse to build. Nothing will be drawn `
            + 'in its place.'
          : `"${id}" falls through to the PROCEDURAL builder for the same rig id. `
            + 'That is the same machine drawn the old way, not a substitute machine — '
            + 'but the Blender model you asked for is NOT on screen.');
        if (ctx.bus && ctx.bus.emit) ctx.bus.emit('rig:model-failed', { rigId: id, error: e });
        throw e;
      });

      inflight.set(id, p);
      return p;
    },

    /**
     * Load the models for the machines the player OWNS — never the fleet.
     * Resolves when they have all settled; individual failures have already
     * been shouted about and are reported in the result.
     */
    async warm(ids) {
      const list = Array.from(new Set((ids || []).filter(Boolean)));
      const out = await Promise.allSettled(list.map((id) => api.load(id)));
      return list.map((id, i) => ({ id, ok: out[i].status === 'fulfilled' }));
    },

    /**
     * THE HANDSHAKE WITH rigFactory.js.
     *
     * Returns a builder with the same signature as any entry in
     * `RIG_BUILDERS` — `(T, ctx) => { root, dyn, spec }` — or null when this
     * id has no prepared model. Synchronous by construction: everything that
     * can wait has already waited inside `load()`.
     *
     * In `?glb=strict`, an id whose load FAILED gets a builder that throws
     * rather than null, so `ensureBuild()` logs and refuses instead of quietly
     * drawing the procedural machine.
     */
    builder(id) {
      if (disabled) return null;          // ?glb=off — draw the procedural machine
      const prep = prepared.get(id);
      if (!prep) {
        if (strict && failures.has(id)) {
          return () => {
            throw new Error(`?glb=strict: "${id}" has no model (${failures.get(id).message})`);
          };
        }
        return null;
      }
      return function buildFromGLB() {
        const root = instantiate(prep);
        return { root: root, dyn: makeDyn(prep, root), spec: makeSpec(prep) };
      };
    },

    /** Is a machine ready to be built synchronously right now? */
    has(id) { return prepared.has(id); },
    /** Is one in flight? For a "streaming in" indicator. */
    isLoading(id) { return id ? inflight.has(id) : inflight.size > 0; },
    /** The ids currently in memory. */
    loaded() { return Array.from(prepared.keys()); },
    /** Every id that was asked for and could not be delivered, with its error. */
    problems() { return Array.from(failures, ([id, e]) => ({ id, message: e.message })); },
    /** Everything said, for the QA harness. */
    logLines() { return log.slice(); },
    /** Measured facts about a loaded model — bytes, primitives, triangles, ms. */
    info(id) {
      const p = prepared.get(id);
      if (!p) return null;
      return {
        id, bytes: p.bytes, prims: p.prims, tris: p.tris, verts: p.verts,
        fetchMs: p.fetchMs, parseMs: p.parseMs, size: p.size,
        pivots: Array.from(p.nodes.pivots.keys()),
        slides: Array.from(p.nodes.slides.keys()),
        lights: p.nodes.lights.map((l) => ({
          name: l.name, coneDeg: l.coneDeg, rangeM: l.rangeM, moves: l.moves,
        })),
        kinds: p.kinds,
      };
    },
    url(id) { return modelUrl(id); },

    dispose() {
      for (const p of prepared.values()) {
        p.root.traverse((o) => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
      }
      prepared.clear();
      inflight.clear();
    },
  };

  return api;
}

export default createGltfRigs;
