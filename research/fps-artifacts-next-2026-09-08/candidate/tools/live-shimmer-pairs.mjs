/** Same-live-frame repeated-render diagnostic. Never a gameplay FPS gate. */
export function verifyShimmerSidePasses(before, after, events) {
  // This verifier is repeated inside the serialized page installer. Keep both
  // bodies identical; the independent fixture exercises the runtime and report.
  if (!before || !after || !Array.isArray(before.materials) || !Array.isArray(before.graph)
      || !Array.isArray(before.cameras) || !Array.isArray(events) || events.length % 2) return false;
  if (Array.from(before.materials).some(m => !m || typeof m.uuid !== 'string' || !m.uuid || !Number.isSafeInteger(m.version))
      || Array.from(before.graph).some(o => !o || typeof o.uuid !== 'string' || !Array.isArray(o.materials))
      || Array.from(before.cameras).some(c => !c || typeof c.uuid !== 'string')
      || new Set(before.materials.map(m => m.uuid)).size !== before.materials.length) return false;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const expected = JSON.parse(JSON.stringify(before));
  const materials = new Map(expected.materials.map(m => [m.uuid, m]));
  const groupValid = g => g === null || (g && ['start', 'count', 'materialIndex'].every(k => Number.isSafeInteger(g[k]) && g[k] >= 0));
  for (let i = 0; i < events.length; i += 2) {
    const back = events[i], front = events[i + 1], m = materials.get(back?.material);
    if (!back || !front || !m || m.transparent !== true || m.side !== 2 || m.forceSinglePass !== false
        || !Number.isSafeInteger(m.version) || !groupValid(back.group)
        || !['material', 'object', 'geometry', 'camera', 'group'].every(k => same(back[k], front[k]))) return false;
    const object = before.graph.find(o => o.uuid === back.object);
    if (!object || object.geometry?.uuid !== back.geometry || !object.materials?.includes(m.uuid)
        || !before.cameras.some(c => c.uuid === back.camera)) return false;
    for (const [event, side, offset] of [[back, 1, 1], [front, 0, 2]]) {
      if (event.sideBefore !== side || event.sideAfter !== side
          || event.transparentBefore !== true || event.transparentAfter !== true
          || event.forceSinglePassBefore !== false || event.forceSinglePassAfter !== false
          || event.versionBefore !== m.version + offset || event.versionAfter !== event.versionBefore
          || !Number.isSafeInteger(event.versionAfter) || event.threw !== false) return false;
    }
    m.version += 2;
  }
  return same(expected, after);
}

export function assessShimmerPairs(result) {
  const faults = [], pairs = Array.isArray(result?.pairs) ? Array.from(result.pairs) : [];
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const positive = n => Number.isFinite(n) && n > 0;
  if (!result?.completed || result.fatal || result.protocol !== 'live-shimmer-pairs-v2'
      || !Number.isSafeInteger(result.requestedPairs) || result.requestedPairs < 8
      || pairs.length !== result.requestedPairs) faults.push('Shimmer pair capture incomplete');
  if (!result?.target?.uuid || result.target.name !== 'vfx:heatShimmer'
      || !result.target.geometry || !result.target.material || !result.target.scene) faults.push('Shimmer target identity missing');
  if (!result?.accepted || !Number.isSafeInteger(result.accepted.runId) || result.accepted.runId < 1
      || !Number.isSafeInteger(result.accepted.attemptId) || result.accepted.attemptId < 1
      || !result.accepted.contractId || !result.accepted.methodId || !result.accepted.bitId
      || result.accepted.source !== 'glb' || !result.accepted.rigId) faults.push('Shimmer accepted identity missing');
  const g = result?.gpu, samples = Array.isArray(g?.samples) ? Array.from(g.samples) : [];
  if (!g?.supported || ['created', 'completed', 'deleted', 'discarded', 'disjointEvents', 'pending'].some(k => !Number.isSafeInteger(g[k]) || g[k] < 0)
      || g.discarded || g.disjointEvents || g.pending || g.unresolvedAtDrain !== 0 || g.drainTimedOut || !Array.isArray(g.queryErrors) || g.queryErrors.length
      || g.created !== g.completed || g.created !== g.deleted || g.completed !== pairs.length * 2 || samples.length !== g.completed) faults.push('Shimmer GPU accounting invalid');
  const sampleMap = new Map();
  for (const q of samples) {
    if (!q) { faults.push('Shimmer GPU sample invalid'); continue; }
    const key = `${q.pair}:${q.mask}`;
    if (!Number.isSafeInteger(q.pair) || !['on', 'off'].includes(q.mask) || !positive(q.ms) || sampleMap.has(key)) faults.push('Shimmer GPU sample invalid');
    sampleMap.set(key, q);
  }
  const orders = { 'on,off': 0, 'off,on': 0 }, frames = new Set();
  let previous = null;
  const matrix = a => Array.isArray(a) && a.length === 16 && a.every(Number.isFinite);
  function schema(s) {
    if (!s || !Array.isArray(s.cameras) || s.cameras.length !== 2
        || s.cameras.some(cam => !cam?.uuid || !matrix(cam.world) || !matrix(cam.projection) || !positive(cam.near) || !(cam.far > cam.near))
        || !Array.isArray(s.graph) || !s.graph.length || !Array.isArray(s.materials) || !s.materials.length
        || !s.quality?.id || !positive(s.viewport?.w) || !positive(s.viewport?.h)
        || !Number.isSafeInteger(s.programs) || s.programs < 1 || !Array.isArray(s.post) || !s.post.length
        || !Number.isFinite(s.vfx?.loadScale) || !Number.isSafeInteger(s.vfx?.live)) return false;
    const ids = new Set(), materialIds = new Set(s.materials.map(m => m?.uuid));
    for (const o of s.graph) {
      if (!o?.uuid || ids.has(o.uuid) || !matrix(o.matrix) || !matrix(o.world) || !Array.isArray(o.materials)
          || o.materials.some(id => !materialIds.has(id)) || typeof o.renderable !== 'boolean') return false;
      if (o.renderable && (!o.geometry?.uuid || !o.geometry.attributes?.position?.contents?.bufferToken)) return false;
      ids.add(o.uuid);
    }
    for (const m of s.materials) if (!m?.uuid || !m.type || !Number.isSafeInteger(m.version)
        || m.version < 0 || typeof m.forceSinglePass !== 'boolean') return false;
    const t = s.graph.find(o => o.uuid === result?.target?.uuid);
    if (!t?.renderable || t.name !== result?.target?.name || t.geometry?.uuid !== result.target.geometry || !t.materials.includes(result.target.material)) return false;
    if (!['uTime', 'uStrength', 'uScale', 'uRise', 'uChroma', 'uHaze', 'uGround', 'uAspect'].every(k => Number.isFinite(s.shimmer?.[k]))
        || !Array.isArray(s.shimmer?.uSrc) || s.shimmer.uSrc.length !== 16 || s.shimmer.uSrc.some(n => !Number.isFinite(n))) return false;
    return true;
  }
  function buffers(v) {
    if (!v || typeof v !== 'object') return true;
    if (Object.hasOwn(v, 'bufferToken')) {
      const digest = result?.bufferDigests?.[v.bufferToken];
      return Number.isSafeInteger(v.bytes) && v.bytes >= 0 && digest?.bytes === v.bytes && /^[a-f0-9]{64}$/.test(digest?.sha256 || '');
    }
    return Object.values(v).every(buffers);
  }
  for (let i = 0; i < pairs.length; i++) {
    const p = pairs[i], order = i % 2 ? ['off', 'on'] : ['on', 'off'];
    if (!p || p.index !== i || !Number.isSafeInteger(p.frame) || p.frame < 1 || frames.has(p.frame)
        || (previous && (p.frame <= previous.frame || p.at <= previous.at)) || !positive(p.at)
        || !Array.isArray(p.members) || p.members.length !== 2 || !same(Array.from(p.members, m => m?.mask), order)) {
      faults.push('Shimmer pair ordering invalid'); continue;
    }
    frames.add(p.frame); orders[order.join(',')]++;
    const origin = p.members[0]?.before?.identity;
    if (!schema(origin) || !buffers(origin) || !origin?.state || origin.simulation?.phase !== 'drilling' || !origin.simulation?.active || origin.simulation?.paused
        || !origin.simulation?.bitFits || origin.simulation?.syntheticGeology || origin.clock?.frame !== p.frame
        || !origin.visible || !origin.focused || origin.contextLost || !origin.assetsReady) faults.push('Shimmer pair not from a ready live drilling frame');
    if (!['runId', 'attemptId', 'contractId', 'methodId', 'bitId'].every(k => origin?.simulation?.[k] === result?.accepted?.[k])) faults.push('Shimmer accepted attempt changed');
    let preceding = origin;
    for (const m of p.members) {
      const q = sampleMap.get(`${i}:${m.mask}`), t = m.target;
      if (!q || q.frame !== p.frame || !positive(m.cpuMs) || m.dt !== 0
          || !schema(m.before?.identity) || !schema(m.after?.identity) || !buffers(m.after?.identity)
          || !same(preceding, m.before?.identity)
          || !verifyShimmerSidePasses(m.before?.identity, m.after?.identity, m.sidePasses)) faults.push('Shimmer member state/camera/workload drift');
      if (!t || !['name', 'uuid', 'geometry', 'material', 'scene'].every(k => t[k] === result.target[k])
          || t.before !== true || t.ancestorsVisible !== true || t.drawVisible !== (m.mask === 'on')
          || t.atRenderEnd !== t.drawVisible || t.restored !== true || !t.identityHeldAtRenderEnd
          || m.hookCalls !== (m.mask === 'on' ? 1 : 0) || m.framebufferCopies !== 0
          || m.before?.identity?.shimmer?.uHasScene !== 0 || m.before?.identity?.shimmer?.uScene !== null) faults.push('Shimmer target/copy/restoration proof invalid');
      if (!Array.isArray(m.before?.allocations) || !m.before.allocations.length || !Array.isArray(m.after?.allocations)
          || !same(m.before.allocations, m.after.allocations) || !same(p.members[0].before?.allocations, m.before.allocations)) faults.push('Composer allocation changed');
      preceding = m.after?.identity;
    }
    previous = p;
  }
  if (orders['on,off'] < 4 || orders['off,on'] < 4) faults.push('Shimmer counterbalanced order missing');
  return { valid: faults.length === 0, faults: [...new Set(faults)], pairs: pairs.length, orders,
    semantics: 'Repeated-render GPU cost at an observed held live frame. No system update between members; additional renders alter live pacing. Neither gameplay FPS nor phone acceptance.' };
}

/** Serialized into the page BEFORE installLiveHarness. This function has no
 * module dependencies. The live harness invokes run() after its normal render.
 * Cleanup must run after the later-installed live wrappers are removed. */
export function installLiveShimmerPairs({ requestedPairs = 24, spacingMs = 1250 } = {}) {
  if (!Number.isSafeInteger(requestedPairs) || requestedPairs < 8 || requestedPairs > 60
      || !Number.isSafeInteger(spacingMs) || spacingMs < 500 || spacingMs > 5000) throw Error('Invalid shimmer pair schedule');
  if (window.__SHIMMER_PAIRS) throw Error('Shimmer manager already installed');
  const c = window.__DRILLITY, renderer = c.renderer, raw = renderer.gl, gl = raw.getContext();
  const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  if (!ext) throw Error('Shimmer GPU elapsed queries unavailable');
  const found = [];
  for (const scene of [c.scene, c.sectionScene]) scene.traverse(o => { if (o.name === 'vfx:heatShimmer') found.push(o); });
  if (found.length !== 1) throw Error('Expected one heat-shimmer quad');
  const target = found[0]; let top = target; while (top.parent) top = top.parent;
  if (top !== c.scene || !target.isMesh || !target.geometry?.uuid || !target.material?.isShaderMaterial || Array.isArray(target.material)) throw Error('Heat-shimmer target is not the expected surface mesh');
  const identify = () => {
    let scene = target; while (scene.parent) scene = scene.parent;
    return { name: target.name, uuid: target.uuid, geometry: target.geometry?.uuid, material: target.material?.uuid, scene: scene.uuid };
  };
  const targetIdentity = identify(), originalRender = renderer.render, originalHook = target.onBeforeRender;
  const accepted = { runId: c.progression.run?.runId, attemptId: c.progression.run?.attemptId,
    contractId: c.state.contract?.id, methodId: c.state.contract?.methodId, bitId: c.state.garage?.loadout?.bit,
    rigId: c.rig.getSpec().id, source: c.rig.getSpec().source };
  const originalCopy = raw.copyFramebufferToTexture, pairs = [], pending = [], restores = [];
  const seenViews = new WeakMap(), storedBuffers = new Map(), bufferDigests = {};
  const gpu = { supported: true, created: 0, completed: 0, deleted: 0, discarded: 0, disjointEvents: 0,
    pending: 0, unresolvedAtDrain: 0, drainTimedOut: false, queryErrors: [], samples: [] };
  let member = null, nextAt = 0, fatal = null, completed = false, finishing = null, active = true;
  const clone = value => JSON.parse(JSON.stringify(value));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function verifyShimmerSidePasses(before, after, events) {
    // This verifier is repeated inside the serialized page installer. Keep both
    // bodies identical; the independent fixture exercises the runtime and report.
    if (!before || !after || !Array.isArray(before.materials) || !Array.isArray(before.graph)
        || !Array.isArray(before.cameras) || !Array.isArray(events) || events.length % 2) return false;
    if (Array.from(before.materials).some(m => !m || typeof m.uuid !== 'string' || !m.uuid || !Number.isSafeInteger(m.version))
        || Array.from(before.graph).some(o => !o || typeof o.uuid !== 'string' || !Array.isArray(o.materials))
        || Array.from(before.cameras).some(c => !c || typeof c.uuid !== 'string')
        || new Set(before.materials.map(m => m.uuid)).size !== before.materials.length) return false;
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const expected = JSON.parse(JSON.stringify(before));
    const materials = new Map(expected.materials.map(m => [m.uuid, m]));
    const groupValid = g => g === null || (g && ['start', 'count', 'materialIndex'].every(k => Number.isSafeInteger(g[k]) && g[k] >= 0));
    for (let i = 0; i < events.length; i += 2) {
      const back = events[i], front = events[i + 1], m = materials.get(back?.material);
      if (!back || !front || !m || m.transparent !== true || m.side !== 2 || m.forceSinglePass !== false
          || !Number.isSafeInteger(m.version) || !groupValid(back.group)
          || !['material', 'object', 'geometry', 'camera', 'group'].every(k => same(back[k], front[k]))) return false;
      const object = before.graph.find(o => o.uuid === back.object);
      if (!object || object.geometry?.uuid !== back.geometry || !object.materials?.includes(m.uuid)
          || !before.cameras.some(c => c.uuid === back.camera)) return false;
      for (const [event, side, offset] of [[back, 1, 1], [front, 0, 2]]) {
        if (event.sideBefore !== side || event.sideAfter !== side
            || event.transparentBefore !== true || event.transparentAfter !== true
            || event.forceSinglePassBefore !== false || event.forceSinglePassAfter !== false
            || event.versionBefore !== m.version + offset || event.versionAfter !== event.versionBefore
            || !Number.isSafeInteger(event.versionAfter) || event.threw !== false) return false;
      }
      m.version += 2;
    }
    return same(expected, after);
  }
  const texture = t => ({ texture: t.uuid, version: t.version, source: t.source?.uuid, sourceVersion: t.source?.version,
    matrix: t.matrix?.toArray(), wrapS: t.wrapS, wrapT: t.wrapT, minFilter: t.minFilter, magFilter: t.magFilter, colorSpace: t.colorSpace });
  function value(v) {
    if (v == null || ['number', 'boolean', 'string'].includes(typeof v)) return v;
    if (v.isTexture) return texture(v);
    if (ArrayBuffer.isView(v)) return Array.from(v);
    if (Array.isArray(v)) return v.map(value);
    if (typeof v.toArray === 'function') return v.toArray();
    if (typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().filter(k => typeof v[k] !== 'function').map(k => [k, value(v[k])]));
    throw Error('Unserializable render input');
  }
  function material(m) {
    const result = { uuid: m.uuid, version: m.version, type: m.type };
    for (const key of ['visible', 'side', 'forceSinglePass', 'transparent', 'opacity', 'alphaTest', 'blending', 'depthTest', 'depthWrite', 'colorWrite',
      'toneMapped', 'roughness', 'metalness', 'transmission', 'envMapIntensity', 'emissiveIntensity', 'color', 'emissive', 'map', 'normalMap',
      'roughnessMap', 'metalnessMap', 'envMap', 'aoMap', 'alphaMap', 'displacementMap', 'uniforms']) {
      if (m[key] !== undefined) result[key] = value(m[key]);
    }
    return result;
  }
  function buffer(view) {
    if (!ArrayBuffer.isView(view)) throw Error('Geometry input is not a typed array');
    const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    let entry = seenViews.get(view), equalBytes = entry?.copy.length === bytes.length;
    if (equalBytes) for (let i = 0; i < bytes.length; i++) if (entry.copy[i] !== bytes[i]) { equalBytes = false; break; }
    if (!equalBytes) {
      entry = { token: `buffer-${storedBuffers.size}`, copy: Uint8Array.from(bytes) };
      storedBuffers.set(entry.token, entry); seenViews.set(view, entry);
    }
    return { bufferToken: entry.token, bytes: bytes.length, arrayType: view.constructor.name };
  }
  function attribute(a) {
    if (!a) return null;
    return { version: a.isInterleavedBufferAttribute ? a.data.version : a.version, count: a.count, itemSize: a.itemSize,
      normalized: a.normalized, offset: a.offset ?? null, stride: a.data?.stride ?? null,
      contents: buffer(a.array || a.data?.array) };
  }
  function snapshot() {
    const materials = new Map(), graph = [];
    for (const scene of [c.scene, c.sectionScene]) scene.traverse(o => {
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of mats) if (!materials.has(m.uuid)) materials.set(m.uuid, material(m));
      graph.push({ uuid: o.uuid, parent: o.parent?.uuid ?? null, name: o.name, type: o.type,
        renderable: !!(o.isMesh || o.isPoints || o.isLine || o.isSprite),
        visible: o === target ? true : o.visible, layers: o.layers.mask, renderOrder: o.renderOrder,
        position: o.position.toArray(), quaternion: o.quaternion.toArray(), scale: o.scale.toArray(),
        matrix: o.matrix.toArray(), world: o.matrixWorld.toArray(), materials: mats.map(m => m.uuid),
        geometry: o.geometry ? { uuid: o.geometry.uuid, instances: o.geometry.instanceCount ?? null,
          drawRange: { start: o.geometry.drawRange.start, count: Number.isFinite(o.geometry.drawRange.count) ? o.geometry.drawRange.count : String(o.geometry.drawRange.count) },
          attributes: Object.fromEntries(Object.entries(o.geometry.attributes).map(([k, a]) => [k, attribute(a)])),
          index: attribute(o.geometry.index), morphAttributes: Object.fromEntries(Object.entries(o.geometry.morphAttributes || {}).map(([k, list]) => [k, list.map(attribute)])) } : null,
        instanceMatrix: attribute(o.instanceMatrix), instanceColor: attribute(o.instanceColor),
        morphInfluences: o.morphTargetInfluences ? Array.from(o.morphTargetInfluences) : null,
        bones: o.skeleton?.boneMatrices ? buffer(o.skeleton.boneMatrices) : null,
        light: o.isLight ? { color: o.color.toArray(), intensity: o.intensity, distance: o.distance, decay: o.decay, angle: o.angle, penumbra: o.penumbra } : null });
    });
    const roles = [], allocations = [], post = [];
    for (const [key, rt] of Object.entries(c.composer || {})) if (rt?.isWebGLRenderTarget) {
      roles.push({ role: key, texture: rt.texture.uuid }); allocations.push({ texture: rt.texture.uuid, width: rt.width, height: rt.height, samples: rt.samples });
    }
    for (const p of c.composer?.passes || []) {
      const uniforms = {};
      for (const [key, u] of Object.entries(p.uniforms || {})) {
        // EffectComposer's ping-pong allocation roles may alternate between
        // complete renders. The allocations and actual role observations stay
        // recorded; the source-proven spatial input role is normalized here.
        if (key === 'tDiffuse' && u.value?.isTexture) { uniforms[key] = { role: 'composer-input' }; roles.push({ role: `pass:${post.length}:tDiffuse`, texture: u.value.uuid }); }
        else uniforms[key] = value(u.value);
      }
      post.push({ type: p.constructor.name, enabled: p.enabled, needsSwap: p.needsSwap, clear: p.clear,
        renderToScreen: p.renderToScreen, material: p.material?.uuid, uniforms });
    }
    const sim = c.sim.debug.state, assets = c.assets.stats(), u = target.material.uniforms;
    const identity = { state: clone(c.state), clock: clone(c.clock), simulation: {
      runId: sim.runId, attemptId: sim.attemptId, contractId: sim.contract?.id, methodId: sim.methodId,
      bitId: sim.bit?.id,
      phase: sim.phase, active: sim.active, paused: c.ui.gameplayPaused, depth: sim.depth, timeSec: sim.timeSec,
      rods: sim.rods, bitFits: (sim.m?.bitKinds || []).includes(sim.bit?.kind), syntheticGeology: sim.syntheticGeology,
      commands: clone(sim.cmd), actual: clone(sim.act), rop: sim.rop },
      cameras: [c.camera, c.sectionCamera].map(cam => ({ uuid: cam.uuid, world: cam.matrixWorld.toArray(), projection: cam.projectionMatrix.toArray(), near: cam.near, far: cam.far, zoom: cam.zoom, fov: cam.fov })),
      graph, materials: [...materials.values()], post, quality: clone(c.quality), viewport: clone(c.viewport),
      bands: value(c.bands), registration: clone(renderer.registration), vfx: clone(c.vfx.stats(false)),
      shimmer: Object.fromEntries(Object.entries(u).map(([k, v]) => [k, value(v.value)])),
      programs: raw.info.programs.length, assetsReady: assets.sets > 0 && assets.setsReady === assets.sets && !assets.pending && !assets.failed,
      visible: document.visibilityState === 'visible', focused: document.hasFocus(), contextLost: gl.isContextLost() };
    const distinct = [...new Map(allocations.map(a => [a.texture, a])).values()].sort((a, b) => a.texture.localeCompare(b.texture));
    return { identity, allocations: distinct, bufferRoles: roles };
  }
  function discard() {
    while (pending.length) { const p = pending.pop(); try { gl.deleteQuery(p.query); gpu.deleted++; } catch (e) { gpu.queryErrors.push(String(e)); } gpu.discarded++; }
  }
  function poll() {
    if (gl.isContextLost()) return;
    if (gl.getParameter(ext.GPU_DISJOINT_EXT)) { gpu.disjointEvents++; discard(); return; }
    for (let i = pending.length - 1; i >= 0; i--) {
      const p = pending[i]; if (!gl.getQueryParameter(p.query, gl.QUERY_RESULT_AVAILABLE)) continue;
      const ns = gl.getQueryParameter(p.query, gl.QUERY_RESULT);
      if (gl.getParameter(ext.GPU_DISJOINT_EXT)) { gpu.disjointEvents++; discard(); return; }
      if (!Number.isFinite(ns) || ns <= 0) { gpu.discarded++; gpu.queryErrors.push('Invalid shimmer elapsed result'); }
      else { gpu.samples.push({ pair: p.pair, frame: p.frame, mask: p.mask, ms: ns / 1e6 }); gpu.completed++; }
      gl.deleteQuery(p.query); gpu.deleted++; pending.splice(i, 1);
    }
  }
  function captureMember(pair, mask) {
    const before = snapshot(), originalVisible = target.visible;
    let ancestorsVisible = true; for (let o = target.parent; o; o = o.parent) if (!o.visible) ancestorsVisible = false;
    if (!same(identify(), targetIdentity) || !originalVisible || !ancestorsVisible
        || before.identity.shimmer.uHasScene !== 0 || before.identity.shimmer.uScene !== null) throw Error('Shimmer is not a visible non-refractive quad');
    const entry = { mask, dt: 0, before, after: null, hookCalls: 0, framebufferCopies: 0, sidePasses: [],
      target: { ...identify(), before: originalVisible, ancestorsVisible, drawVisible: mask === 'on', atRenderEnd: null, restored: null, identityHeldAtRenderEnd: false } };
    pair.members.push(entry); member = entry;
    let query = null, began = false, error = null;
    const start = performance.now();
    try {
      if (gl.getQuery(ext.TIME_ELAPSED_EXT, gl.CURRENT_QUERY)) throw Error('Another GPU elapsed query is active');
      query = gl.createQuery(); if (!query) throw Error('Shimmer createQuery failed');
      gpu.created++; target.visible = entry.target.drawVisible; entry.target.drawVisible = target.visible;
      gl.beginQuery(ext.TIME_ELAPSED_EXT, query); began = true;
      originalRender.call(renderer, 0);
    } catch (e) { error = e; }
    finally {
      entry.cpuMs = performance.now() - start;
      if (began) {
        try { gl.endQuery(ext.TIME_ELAPSED_EXT); pending.push({ query, pair: pair.index, frame: pair.frame, mask }); query = null; }
        catch (e) { gpu.queryErrors.push(String(e)); error ||= e; }
      }
      if (query) { try { gl.deleteQuery(query); gpu.deleted++; } catch (e) { gpu.queryErrors.push(String(e)); } gpu.discarded++; }
      entry.target.atRenderEnd = target.visible; entry.target.identityHeldAtRenderEnd = same(identify(), targetIdentity);
      target.visible = originalVisible; entry.target.restored = target.visible;
      member = null;
    }
    try { entry.after = snapshot(); } catch (e) { error ||= e; }
    if (error) throw error;
    if (!verifyShimmerSidePasses(before.identity, entry.after.identity, entry.sidePasses)
        || !same(before.allocations, entry.after.allocations)) throw Error('Repeated shimmer render changed captured state/camera/workload');
  }
  function run(frame) {
    if (!active || fatal || pairs.length >= requestedPairs) return;
    poll();
    const at = performance.now(), sim = c.sim.debug.state;
    if (at < nextAt || sim.phase !== 'drilling' || !sim.active || c.ui.gameplayPaused) return;
    nextAt = at + spacingMs;
    const pair = { index: pairs.length, frame, at, members: [] }; pairs.push(pair);
    try {
      for (const mask of pair.index % 2 ? ['off', 'on'] : ['on', 'off']) captureMember(pair, mask);
      if (!same(pair.members[0].after.identity, pair.members[1].before.identity)) throw Error('Shimmer pair input drift');
    } catch (e) { fatal ||= String(e.stack || e); throw e; }
  }
  const current = () => ({ protocol: 'live-shimmer-pairs-v2', completed, fatal, requestedPairs, spacingMs,
    target: targetIdentity, accepted, pairs, gpu: { ...gpu, pending: pending.length }, bufferDigests,
    semantics: 'Two counterbalanced render(0) submissions after an original live render. No system update between pair members. Non-refractive quad only; extra renders alter RAF. Composer buffer roles are recorded separately from stable allocations. Buffer bytes are compared exactly during pairs; immutable copies are SHA-256 hashed only after capture. Raw material versions remain recorded; only individually witnessed transparent DoubleSide back/front renderBufferDirect version increments are accepted within a member. Consecutive member boundaries must match exactly.' });
  async function finish() {
    if (finishing) return finishing;
    active = false;
    finishing = (async () => {
      const deadline = performance.now() + 5000;
      try { while (pending.length && !gl.isContextLost() && performance.now() < deadline) { poll(); if (pending.length) await new Promise(r => setTimeout(r, 16)); } poll(); }
      catch (e) { gpu.queryErrors.push(String(e)); }
      gpu.unresolvedAtDrain = pending.length; gpu.drainTimedOut = pending.length > 0; discard(); gpu.pending = pending.length;
      try {
        for (const [token, entry] of storedBuffers) {
          const digest = await crypto.subtle.digest('SHA-256', entry.copy);
          bufferDigests[token] = { bytes: entry.copy.length, sha256: [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('') };
        }
      } catch (e) { fatal ||= `Buffer digest failed: ${e}`; }
      completed = !fatal;
      return current();
    })();
    return finishing;
  }
  async function cleanup() { await finish(); for (const f of restores.splice(0).reverse()) f(); return { restored: restores.length === 0, pending: pending.length, queryCreated: gpu.created, queryDeleted: gpu.deleted }; }
  try {
    target.onBeforeRender = function (...args) { if (member) member.hookCalls++; return originalHook.apply(this, args); };
    restores.push(() => { target.onBeforeRender = originalHook; });
    raw.copyFramebufferToTexture = function (...args) { if (member) member.framebufferCopies++; return originalCopy.apply(this, args); };
    restores.push(() => { raw.copyFramebufferToTexture = originalCopy; });
    const originalDirect = raw.renderBufferDirect;
    if (typeof originalDirect !== 'function') throw Error('Three renderBufferDirect is unavailable');
    raw.renderBufferDirect = function (...args) {
      const [camera, , geometry, material, object, group] = args;
      const originalMaterial = member?.before.identity.materials.find(m => m.uuid === material?.uuid);
      let event = null;
      if (originalMaterial?.transparent === true && originalMaterial.side === 2 && originalMaterial.forceSinglePass === false) {
        event = { material: material.uuid, object: object?.uuid, geometry: geometry?.uuid, camera: camera?.uuid,
          group: group == null ? null : { start: group.start, count: group.count, materialIndex: group.materialIndex },
          sideBefore: material.side, versionBefore: material.version, transparentBefore: material.transparent,
          forceSinglePassBefore: material.forceSinglePass, sideAfter: null, versionAfter: null,
          transparentAfter: null, forceSinglePassAfter: null, threw: false };
        member.sidePasses.push(event);
      }
      try { return originalDirect.apply(this, args); }
      catch (e) { if (event) event.threw = true; throw e; }
      finally { if (event) { event.sideAfter = material.side; event.versionAfter = material.version;
        event.transparentAfter = material.transparent; event.forceSinglePassAfter = material.forceSinglePass; } }
    };
    restores.push(() => { raw.renderBufferDirect = originalDirect; });
    window.__SHIMMER_PAIRS = { run, finish, current, cleanup, get inMember() { return !!member; } };
    return { installed: true, target: targetIdentity, requestedPairs, spacingMs };
  } catch (e) { for (const f of restores.splice(0).reverse()) f(); throw e; }
}
