/** Rendering/live-path diagnostic, not a fleet/phone acceptance gate.
 * --live captures chronological real-dt gameplay with a seeded accepted job.
 * Without --live the existing frozen diagnostic is unchanged:
 * All original update/render functions run with dt=0 after live settling.
 * CPU timings are INCLUSIVE and must never be summed. GPU elapsed queries
 * measure the complete render submission; raw RAF intervals include scheduling.
 * node tools/profileframes.mjs --self-test does not create a server/browser.
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const flag = (key, fallback) => {
  const i = args.indexOf(key);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw Error(`${key} needs a value`);
  return args[i + 1];
};
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function assessWindow(w, { gpu = false, minimumGpu = 8 } = {}) {
  const faults = [];
  if (!w.before || !w.after || !equal(w.before.identity, w.after.identity)) faults.push('identity/state/camera drift');
  if (!equal(w.before?.graph, w.after?.graph)) faults.push('scene graph changed');
  if (!equal(w.before?.intervention, w.after?.intervention)) faults.push('intervention changed');
  if (w.requestedIntervention && (![w.before, w.after].every(s => equal(s.intervention, w.requestedIntervention)))) faults.push('intervention not held');
  if (![w.before, w.after].every(s => s?.visible === 'visible' && s.focused && !s.contextLost)) faults.push('focus/visibility/context invalid');
  if (!equal(w.before?.events, w.after?.events)) faults.push('focus/visibility/context event during window');
  if (w.frameViolations?.length) faults.push('per-frame identity guard failed');
  if (![w.before, w.after].every(s => s?.assets?.sets > 0 && s.assets.setsReady === s.assets.sets && s.assets.pending === 0 && s.assets.failed === 0)) faults.push('textures not ready');
  if (w.before?.programs !== w.after?.programs) faults.push('shader programs changed');
  if (!Array.isArray(w.intervals) || w.intervals.length !== w.requestedFrames || w.intervals.some(n => !Number.isFinite(n) || n <= 0)) faults.push('invalid RAF interval window');
  if (gpu) {
    const g = w.gpu;
    if (!g?.supported) faults.push('GPU timer unavailable');
    else if (g.disjointEvents || g.discarded || g.queryErrors?.length || g.pending || g.drainTimedOut || g.created !== g.deleted || g.created !== g.completed || g.samples.length < minimumGpu) faults.push('GPU query accounting/readiness invalid');
  }
  return { valid: faults.length === 0, faults };
}

/** A live series must move, while preserving its accepted physical attempt.
 * Dynamic phase/depth/camera/graph content is recorded, not equality-gated.
 */
export function assessLiveWindow(w, { gpu = true, minimumGpu = 8 } = {}) {
  const faults = [], rows = Array.isArray(w?.frames) ? w.frames : [], positive = n => Number.isFinite(n) && n > 0;
  const validCameras = value => ['surface', 'section'].every(name => ['world', 'projection'].every(key => {
    const a = value?.[name]?.[key]; return Array.isArray(a) && a.length === 16 && a.every(Number.isFinite);
  }));
  if (!w?.completed || w.fatal) faults.push('live capture incomplete');
  if (!w?.before || !w?.after || !equal(w.before.stable, w.after.stable)) faults.push('accepted identity/loadout/viewport changed');
  if (w?.violations?.length) faults.push(...w.violations);
  if (rows.length < 60) faults.push('insufficient live frames');
  const stable = w?.before?.stable;
  if (!Number.isSafeInteger(stable?.runId) || stable.runId <= 0 || !Number.isSafeInteger(stable?.attemptId) || stable.attemptId <= 0
      || !stable?.contractId || !stable?.rigId || stable?.source !== 'glb'
      || stable?.screen !== 'site' || !stable?.methodId || !stable?.loadout?.bit) faults.push('accepted setup missing');
  const ids = new Set();
  let previous = null;
  for (const row of rows) {
    if (!Number.isSafeInteger(row.frame) || row.frame < 1 || ids.has(row.frame)) faults.push('invalid/duplicate frame id');
    if (previous && row.frame !== previous.frame + 1) faults.push('missing frame');
    if (!positive(row.dt) || !positive(row.at) || !positive(row.renderEnd) || row.renderEnd < row.at
        || !Number.isFinite(row.observerMs) || row.observerMs < 0) faults.push('invalid frame timing');
    if (!positive(row.rafTimestamp) || (row.rafMs !== null && !positive(row.rafMs))) faults.push('invalid RAF interval');
    if (previous && Math.abs(row.rafMs - (row.rafTimestamp - previous.rafTimestamp)) > 1e-6) faults.push('RAF timestamp/interval mismatch');
    if (previous && (row.rafMs === null || row.at <= previous.at || row.state?.timeSec < previous.state?.timeSec)) faults.push('nonchronological frame');
    if (row.state?.paused || !row.state?.active || !Number.isFinite(row.state?.depth)
        || !Number.isFinite(row.state?.timeSec) || row.state?.runId !== stable?.runId
        || row.state?.attemptId !== stable?.attemptId || row.state?.contractId !== stable?.contractId
        || row.state?.methodId !== stable?.methodId || row.state?.bitId !== stable?.loadout?.bit
        || row.state?.bitFits !== true || row.state?.syntheticGeology === true) faults.push('invalid live state');
    if (!validCameras(row.cameras)) faults.push('live camera evidence missing/invalid');
    if (!row.visible || !row.focused || row.contextLost || row.programs !== w?.before?.programs
        || !row.assetsReady || !row.identityHeld) faults.push('frame environment/identity invalid');
    if (row.cpu && Object.values(row.cpu).some(r => !Number.isSafeInteger(r.count) || r.count < 1
        || !Number.isFinite(r.inclusiveMs) || r.inclusiveMs < 0)) faults.push('invalid CPU row');
    if (gpu && (!row.cpu?.['render-total'] || !row.cpu?.['system:sim']
        || row.cpu['render-total'].count !== 1 || row.cpu['system:sim'].count !== 1)) faults.push('instrumented CPU rows missing');
    ids.add(row.frame); previous = row;
  }
  if (rows.length && !(rows.at(-1).state?.timeSec > rows[0].state?.timeSec)) faults.push('simulation did not advance');
  // This bounded experiment promises an observed connection and resumption;
  // an early jam or an insufficient duration remains useful rejected evidence.
  const firstRod = rows.findIndex(r => r.state?.phase === 'rod-add');
  if (firstRod < 1 || !rows.slice(0, firstRod).some(r => r.state?.phase === 'drilling')
      || !rows.slice(firstRod + 1).some(r => r.state?.phase === 'drilling' && r.state.rods > rows[firstRod].state.rods)) faults.push('natural rod-add and resumed drilling not observed');
  for (const end of [w?.before, w?.after]) {
    if (!end?.visible || !end?.focused || end?.contextLost || !end?.assetsReady || end?.programs !== w?.before?.programs) faults.push('endpoint environment invalid');
    if (!validCameras(end?.cameras)) faults.push('endpoint camera evidence missing/invalid');
  }
  if (!equal(w?.before?.events, w?.after?.events)) faults.push('focus/visibility/context event');
  if (gpu) {
    const g = w?.gpu;
    if (!g?.supported || g.disjointEvents || g.discarded || !Array.isArray(g.queryErrors) || g.queryErrors.length || g.pending || g.drainTimedOut
        || ['created', 'completed', 'deleted', 'discarded', 'disjointEvents', 'pending'].some(k => !Number.isSafeInteger(g?.[k]) || g[k] < 0)
        || g.created !== g.completed || g.created !== g.deleted
        || !Array.isArray(g.samples) || g.samples.length < minimumGpu || g.samples.length !== g.completed) faults.push('GPU query accounting/readiness invalid');
    const sampled = new Set();
    for (const s of Array.isArray(g?.samples) ? g.samples : []) {
      if (!positive(s.ms) || !ids.has(s.frame) || sampled.has(s.frame)) faults.push('invalid GPU frame/sample');
      sampled.add(s.frame);
    }
  }
  return { valid: faults.length === 0, faults: [...new Set(faults)] };
}

/** Draw-only diagnostic integrity, not a causal/performance verdict. */
export function assessLiveVfxProbe(w) {
  const faults = [], p = w?.vfxProbe, rows = Array.isArray(w?.frames) ? w.frames : [];
  const names = ['surfaceSoft', 'surfaceAdd', 'sectionSoft', 'sectionAdd'].map(n => `vfx:${n}`);
  const integer = n => Number.isSafeInteger(n) && n >= 0;
  if (!w?.instrument || !p || !['on-first', 'off-first'].includes(p.order) || p.blockMs !== 600 || p.settleMs !== 150
      || !Array.isArray(p.targets) || p.targets.length !== 4) faults.push('VFX probe setup missing/invalid');
  const targets = Array.isArray(p?.targets) ? p.targets : [];
  if (new Set(targets.map(t => t.uuid)).size !== 4 || targets.some((t, i) => t.name !== names[i]
      || !t.uuid || !t.geometry || !t.material || !t.scene || !integer(t.capacity) || t.capacity < 1)) faults.push('VFX target identity invalid');
  const gpuFrames = new Set((w?.gpu?.samples || []).map(q => q.frame)), counts = { on: 0, off: 0 };
  let previous = null, segmentAt = null;
  for (const row of rows) {
    const q = row.vfxProbe;
    if (!q || !Number.isFinite(q.at) || q.at < row.at || q.at > row.renderEnd
        || !Number.isFinite(q.elapsedMs) || q.elapsedMs < 0 || !integer(q.block)
        || q.block !== Math.floor(q.elapsedMs / 600) || !integer(q.segment)
        || q.phase !== row.state?.phase || q.rods !== row.state?.rods
        || !Array.isArray(q.targets) || q.targets.length !== 4) { faults.push('VFX frame evidence missing/invalid'); continue; }
    const drilling = q.phase === 'drilling';
    const sameSegment = previous && previous.phase === q.phase && previous.rods === q.rods;
    if (!sameSegment) {
      segmentAt = q.at;
      if (q.segment !== (previous ? previous.segment + 1 : 0)) faults.push('VFX segment sequence invalid');
    } else if (q.segment !== previous.segment || q.at <= previous.at) faults.push('VFX segment sequence invalid');
    if (Math.abs(q.elapsedMs - (q.at - segmentAt)) > 1e-6) faults.push('VFX elapsed schedule invalid');
    const off = drilling && ((q.block % 2 === 0) === (p?.order === 'off-first'));
    const eligible = drilling && q.elapsedMs % 600 >= 150;
    if (q.off !== off || q.eligible !== eligible) faults.push('VFX block mask/settle mismatch');
    q.targets.forEach((t, i) => {
      const base = targets[i];
      if (!base || !['name', 'uuid', 'geometry', 'material', 'capacity', 'scene'].every(k => t[k] === base[k])
          || !integer(t.instances) || t.instances > t.capacity
          || t.before !== true || t.ancestorsVisible !== true || t.drawVisible !== !off
          || t.atRenderEnd !== t.drawVisible || t.after !== t.before
          || t.identityHeldAtRenderEnd !== true || !Number.isFinite(t.uniformTime)) faults.push('VFX target mask/identity/restoration invalid');
    });
    const s = q.stats;
    if (!s || !Number.isFinite(s.clockFps) || s.clockFps <= 0 || !Number.isFinite(s.loadScale) || s.loadScale < 0 || s.loadScale > 1
        || !s.medium || !integer(s.live) || !integer(s.capacity) || s.live > s.capacity
        || !integer(s.chips?.live) || !integer(s.chips?.capacity) || s.chips.live > s.chips.capacity) faults.push('VFX live state invalid');
    for (const t of targets) {
      const layer = s?.layers?.[t.name.slice(4)];
      if (!layer || !integer(layer.live) || layer.live > layer.capacity || layer.capacity !== t.capacity) faults.push('VFX layer live/capacity invalid');
    }
    if (s && (targets.reduce((sum, t) => sum + (s.layers?.[t.name.slice(4)]?.live || 0), 0) !== s.live
        || targets.reduce((sum, t) => sum + t.capacity, 0) !== s.capacity)) faults.push('VFX total/layer count mismatch');
    if (eligible && gpuFrames.has(row.frame)) counts[off ? 'off' : 'on']++;
    previous = q;
  }
  if (counts.on < 8 || counts.off < 8) faults.push('Insufficient eligible VFX on/off GPU samples');
  return { valid: faults.length === 0, faults: [...new Set(faults)], eligibleGpuSamples: counts,
    semantics: 'Integrity only. Blocks contain different live camera/depth/particle/adaptive states; compare actual neighborhoods and counterbalanced repeats before any causal claim.' };
}

export function assessLiveDiagnostics(profile, traceEvents) {
  const faults = [];
  const nodes = Array.isArray(profile?.nodes) ? profile.nodes : [];
  const samples = Array.isArray(profile?.samples) ? profile.samples : [];
  const deltas = Array.isArray(profile?.timeDeltas) ? profile.timeDeltas : [];
  const ids = new Set(nodes.map(n => n.id));
  if (!nodes.length || ids.size !== nodes.length || nodes.some(n => !Number.isSafeInteger(n.id) || n.id < 1 || !n.callFrame)
      || !samples.length || samples.length !== deltas.length || samples.some(id => !ids.has(id))
      || deltas.some(d => !Number.isFinite(d) || d < 0) || !(deltas.reduce((sum, n) => sum + n, 0) > 0)
      || !Number.isFinite(profile?.startTime) || !Number.isFinite(profile?.endTime)
      || profile.endTime <= profile.startTime) faults.push('CDP CPU profile missing/invalid');
  const events = Array.isArray(traceEvents) ? traceEvents : [];
  const marks = name => events.filter(e => e.name === name && String(e.cat).includes('blink.user_timing') && Number.isFinite(e.ts));
  const start = marks('drillity-live-start'), end = marks('drillity-live-end');
  if (!events.length || start.length !== 1 || end.length !== 1 || !(end[0]?.ts > start[0]?.ts)) faults.push('Live trace or correlation marks missing/invalid');
  return { valid: faults.length === 0, faults, profileSamples: samples.length, traceEvents: events.length,
    traceStartUs: start[0]?.ts ?? null, traceEndUs: end[0]?.ts ?? null,
    semantics: 'CDP capture includes setup and GPU-drain frames outside the UserTiming marks. Attribute live phases only inside those marks and match the chronological frame record.' };
}

/** Page-side setup. All synthetic career grants are explicit and confined to
 * a new non-persistent browser context. No raw loadout/run/simulation writes.
 */
export async function prepareLiveScenario({ rig, camera, seed }) {
  const c = window.__DRILLITY, d = c.data, p = c.progression;
  const { makeRandom } = await import('/src/core/contract.js');
  const clone = value => JSON.parse(JSON.stringify(value));
  const requireOk = (result, action) => { if (result?.ok !== true) throw Error(`${action}: ${result?.reason || 'refused'}`); return result; };
  if (c.state.contract || p.run || c.sim.active) throw Error('Fresh isolated career required');
  const R = d.getRig(rig), method = R && d.getMethod(R.methods[0]);
  if (!R || !method || !['oil-rotary', 'longhole'].includes(method.id)) throw Error('Live connection experiment supports oil-rotary and longhole only');
  const region = d.REGIONS.find(r => d.methodsForRegion(r.id, d.MAX_LEVEL).some(m => m.id === method.id));
  if (!region) throw Error('No canonical region offers this method');
  const loadout = d.defaultLoadoutFor(method.id, d.MAX_LEVEL);
  for (const slot of method.toolSlots) {
    const item = d.getItem(loadout[slot]);
    if (!item || item.slot !== slot || (item.methods.length && !item.methods.includes(method.id))) throw Error(`Invalid default loadout: ${slot}`);
  }
  const rand = makeRandom(seed);
  let contract, draw = 0;
  for (; draw < 1000; draw++) {
    const candidate = d.makeContract(region.id, d.MAX_LEVEL, rand);
    if (candidate?.methodId === method.id) { contract = candidate; break; }
  }
  if (!contract || contract.__stub || !Number.isInteger(contract.seed)) throw Error('No seeded canonical contract generated');
  // The amount is test funding, not a price/rating assertion. All real costs
  // and certificate prerequisites still go through progression unchanged.
  const grants = { xp: d.LEVELS.totalToMax, money: 100000000, label: 'Live profiler fixture' };
  p.addXP(grants.xp, grants.label); p.addMoney(grants.money, grants.label);
  if (c.state.player.level !== d.MAX_LEVEL) throw Error('Fixture did not reach the authored maximum level');
  await c.gltfRigs.load(rig);
  if (!c.state.unlocked.rigs.includes(rig)) requireOk(p.purchaseRig(rig), 'Purchase rig');
  requireOk(p.selectRig(rig), 'Select rig');
  for (const slot of Object.keys(c.state.garage.loadout)) requireOk(p.equip(slot, null), `Clear ${slot}`);
  for (const [slot, id] of Object.entries(loadout)) {
    if (!c.state.garage.owned.includes(id)) requireOk(p.purchase(id), `Purchase ${id}`);
    requireOk(p.equip(slot, id), `Equip ${id}`);
    requireOk(d.canEquip(c.state, slot, id), `Verify ${id}`);
  }
  const visiting = new Set();
  const buyCert = id => {
    if (c.state.player.certs.includes(id)) return;
    if (visiting.has(id)) throw Error(`Certificate prerequisite cycle: ${id}`);
    const cert = d.getCert(id); if (!cert) throw Error(`Unknown certificate: ${id}`);
    visiting.add(id); for (const prerequisite of cert.prereq) buyCert(prerequisite);
    requireOk(p.purchaseCert(id), `Purchase certificate ${id}`); visiting.delete(id);
  };
  for (const id of contract.requiredCerts || []) buyCert(id);
  const preflight = requireOk(p.previewContract(contract), 'Contract preflight');
  if (preflight.rigId !== rig) throw Error('Preflight substituted another rig');
  const acceptance = requireOk(p.acceptContract(contract), 'Accept canonical contract');
  c.ui.show('site', { contract }); c.renderer.setCameraMode(camera);
  const telemetry = c.sim.getTelemetry();
  if (c.ui.currentScene !== 'site' || !telemetry.active || telemetry.depth !== 0 || telemetry.timeSec !== 0
      || telemetry.bit.id !== loadout.bit || !telemetry.bit.fits || telemetry.methodId !== method.id
      || telemetry.runId !== p.run?.runId || telemetry.attemptId !== p.run?.attemptId
      || !Number.isSafeInteger(telemetry.attemptId) || c.sim.debug.state.syntheticGeology) throw Error('Canonical fitted attempt did not start at zero with real geology');
  const body = document.createElement('p'); body.textContent = 'Diagnostic warm-up; the accepted attempt is paused.';
  const sheet = c.ui.sheet({ title: 'Profiler warm-up', body, actions: [] });
  if (!c.ui.gameplayPaused || c.rig.getSpec().id !== rig || c.rig.getSpec().source !== 'glb') throw Error('Warm-up pause or actual GLB rig missing');
  const gl = c.renderer.gl.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
  const result = { grants, seed, generatorDraw: draw, contract: clone(contract), defaultLoadout: clone(loadout),
    actualLoadout: clone(c.state.garage.loadout), preflight, acceptance, rig: clone(c.rig.getSpec()),
    telemetry: clone(telemetry), player: clone(c.state.player),
    gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null, browser: navigator.userAgent,
    reproducibility: 'Contract and simulation use the recorded seed. Existing environment/VFX randomness and live frame pacing are not claimed deterministic.' };
  window.__LIVE_SETUP = { sheet, result };
  return result;
}

/** Page-side chronological observer. System and renderer arguments/return
 * values/errors are forwarded unchanged; only normal operator APIs are driven.
 */
export function installLiveHarness({ durationMs = 45000, instrument = true, vfxOrder = null } = {}) {
  const c = window.__DRILLITY, setup = window.__LIVE_SETUP;
  if (!Number.isInteger(durationMs) || durationMs < 1000 || durationMs > 120000) throw Error('Invalid live duration');
  if (vfxOrder !== null && (!instrument || !['on-first', 'off-first'].includes(vfxOrder))) throw Error('Invalid live VFX probe option');
  if (!setup?.sheet || !setup?.result) throw Error('Canonical live setup missing');
  if (window.__LIVE_PROFILE) throw Error('Live profiler already installed');
  const gl = c.renderer.gl.getContext(), ext = instrument ? gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
  const clone = value => JSON.parse(JSON.stringify(value));
  const faults = new Set(), restores = [], events = { blur: 0, visibility: 0, lost: 0, restored: 0 };
  const rows = [], pending = [], actions = [], transitions = [];
  const gpu = { supported: !!ext, created: 0, completed: 0, deleted: 0, discarded: 0,
    disjointEvents: 0, pending: 0, drainTimedOut: false, queryErrors: [], samples: [] };
  const listeners = [[window, 'blur', () => events.blur++], [document, 'visibilitychange', () => events.visibility++],
    [c.canvas, 'webglcontextlost', () => events.lost++], [c.canvas, 'webglcontextrestored', () => events.restored++]];
  let active = false, finishing = false, frame = null, handle = null, timer = null, lastRaf = null, nextControl = 0;
  let completed = false, fatal = null, after = null, previousPhase = null, before;
  let vfxProbe = null, vfxTargets = [], vfxSegment = -1, vfxKey = null, vfxSegmentAt = null;
  const timing = { timeOrigin: performance.timeOrigin, startMs: null, endMs: null,
    startMark: 'drillity-live-start', endMark: 'drillity-live-end' };
  let resolveDone;
  const done = new Promise(resolve => { resolveDone = resolve; });
  const ready = () => { const a = c.assets.stats(); return a.sets > 0 && a.sets === a.setsReady && !a.pending && !a.failed; };
  const stable = () => ({ runId: c.progression.run?.runId, attemptId: c.progression.run?.attemptId,
    contractId: c.state.contract?.id, methodId: c.state.contract?.methodId,
    rigId: c.rig.getSpec().id, source: c.rig.getSpec().source,
    screen: c.ui.currentScene, cameraMode: c.renderer.cameraMode,
    quality: clone(c.quality), viewport: clone(c.viewport), loadout: clone(c.state.garage.loadout),
    drawingBuffer: [gl.drawingBufferWidth, gl.drawingBufferHeight],
    dpr: c.renderer.gl.getPixelRatio(), site: clone(c.terrain.siteModel) });
  const readState = () => {
    // Read the sim's actual state without calling expensive getTelemetry in
    // every observer. No private state setter or synthetic advancement is used.
    const s = c.sim.debug.state;
    return { runId: s.runId, attemptId: s.attemptId, contractId: s.contract?.id,
      methodId: s.methodId, active: s.active, paused: c.ui.gameplayPaused,
      depth: s.depth, timeSec: s.timeSec, drillSec: s.drillSec, phase: s.phase,
      phaseT: s.phaseT, phaseDur: s.phaseDur, rods: s.rods,
      bitId: s.bit?.id, bitFits: (s.m?.bitKinds || []).includes(s.bit?.kind),
      syntheticGeology: s.syntheticGeology, commands: clone(s.cmd),
      actual: clone(s.act), hazardCount: s.hazards?.length, rop: s.rop };
  };
  const cameras = () => ({ surface: { world: c.camera.matrixWorld.toArray(), projection: c.camera.projectionMatrix.toArray() },
    section: { world: c.sectionCamera.matrixWorld.toArray(), projection: c.sectionCamera.projectionMatrix.toArray() } });
  const endpoint = () => ({ stable: stable(), state: clone(c.state), simulation: readState(), cameras: cameras(),
    assets: clone(c.assets.stats()), assetsReady: ready(), programs: c.renderer.gl.info.programs.length,
    visible: document.visibilityState === 'visible', focused: document.hasFocus(), contextLost: gl.isContextLost(), events: { ...events } });
  const current = () => ({ completed, fatal, requestedDurationMs: durationMs, instrument,
    before, after, timing: { ...timing }, frames: rows, transitions, actions, gpu, vfxProbe, violations: [...faults],
    semantics: { dt: 'Original production dt, including its own clamp; raw RAF timestamps are stored separately.',
      cpu: 'Inclusive original-call wrapper time, nested rows overlap; observer/controller costs separately recorded.',
      controller: '20 Hz telemetry optimal inputs, rodStab only in the live window, jamRescue on the public beat, shutIn only on actual well flow. Actions are recorded; this is an automated operator fixture.',
      cameras: 'Actual matrices are chronological observations, not fixed between live frames.',
      raf: 'requestAnimationFrame timestamp differences; clock.fps is not converted into real FPS.',
      uninstrumented: 'When requested, no CPU child wrappers, GPU queries or CDP trace; boundary observers and operator controller still run.' } });
  const laterFailure = error => {
    fatal ||= String(error?.stack || error);
    queueMicrotask(() => { void finish(fatal); });
  };
  const discard = () => {
    while (pending.length) {
      const p = pending.pop();
      try { gl.deleteQuery(p.query); gpu.deleted++; }
      catch (e) { gpu.queryErrors.push(`deleteQuery: ${e}`); }
      gpu.discarded++;
    }
  };
  function pollGpu() {
    if (!ext || gl.isContextLost()) return;
    if (gl.getParameter(ext.GPU_DISJOINT_EXT)) { gpu.disjointEvents++; discard(); return; }
    for (let i = pending.length - 1; i >= 0; i--) {
      const p = pending[i];
      if (!gl.getQueryParameter(p.query, gl.QUERY_RESULT_AVAILABLE)) continue;
      const ns = gl.getQueryParameter(p.query, gl.QUERY_RESULT);
      if (gl.getParameter(ext.GPU_DISJOINT_EXT)) { gpu.disjointEvents++; discard(); return; }
      if (!Number.isFinite(ns) || ns <= 0) { gpu.discarded++; gpu.queryErrors.push('Invalid elapsed value'); }
      else { gpu.samples.push({ frame: p.frame, ms: ns / 1e6 }); gpu.completed++; }
      gl.deleteQuery(p.query); gpu.deleted++; pending.splice(i, 1);
    }
  }
  const cost = (name, ms) => {
    if (!frame || !instrument) return;
    const r = frame.cpu[name] ||= { count: 0, inclusiveMs: 0 };
    r.count++; r.inclusiveMs += ms;
  };
  function wrap(object, key, name) {
    const old = object[key]; if (typeof old !== 'function') return;
    object[key] = function (...args) {
      if (!active) return old.apply(this, args);
      const start = performance.now();
      try { return old.apply(this, args); }
      catch (e) { laterFailure(e); throw e; }
      finally { cost(name, performance.now() - start); }
    };
    restores.push(() => { object[key] = old; });
  }
  function control() {
    const at = performance.now(); if (at < nextControl) return;
    nextControl = at + 50;
    const tl = c.sim.getTelemetry();
    const o = tl.optimal;
    if (!o || ![o.wob, o.rpm, o.flush].every(v => Number.isFinite(v) && v >= 0 && v <= 1)) throw Error('Invalid public operator hints');
    for (const [name, value] of [['feed', o.wob], ['rotation', o.rpm], ['flush', o.flush]]) {
      if (c.sim.setInput(name, value) === false) throw Error(`Input refused: ${name}`);
    }
    actions.push({ frame: c.clock.frame, at, type: 'inputs', feed: o.wob, rotation: o.rpm, flush: o.flush });
    let pulse;
    if (tl.phase === 'rod-add' && tl.rodAdd && !tl.rodAdd.hit && !tl.rodAdd.missed
        && tl.rodAdd.t >= tl.rodAdd.windowStart && tl.rodAdd.t <= tl.rodAdd.windowEnd) pulse = 'rodStab';
    else if (tl.well?.flowing && !tl.well.shutIn) pulse = 'shutIn';
    else if (tl.jam?.state !== 'free' && tl.jam?.rescue?.goodNow) pulse = 'jamRescue';
    if (pulse) actions.push({ frame: c.clock.frame, at: performance.now(), type: pulse, result: clone(c.sim.pulse(pulse)) });
    frame.controllerMs = performance.now() - at;
  }
  function startFrame(dt) {
    if (frame && rows.at(-1) !== frame) faults.add('previous frame was not rendered');
    frame = { frame: c.clock.frame, at: performance.now(), dt, rafMs: null, rafTimestamp: null,
      cpu: instrument ? {} : null, controllerMs: 0, observerMs: 0 };
    control();
  }
  function identifyVfx() {
    const targets = [];
    for (const name of ['surfaceSoft', 'surfaceAdd', 'sectionSoft', 'sectionAdd']) {
      const expectedScene = name.startsWith('surface') ? c.scene : c.sectionScene, matches = [];
      for (const scene of [c.scene, c.sectionScene]) scene.traverse(o => { if (o.name === `vfx:${name}`) matches.push(o); });
      if (matches.length !== 1) throw Error(`Expected unique VFX target: ${name}`);
      const o = matches[0]; let top = o; while (top.parent) top = top.parent;
      if (top !== expectedScene || !o.isMesh || !o.geometry?.isInstancedBufferGeometry
          || !o.uuid || !o.geometry.uuid || !o.material?.uuid || Array.isArray(o.material)
          || !Number.isSafeInteger(o.geometry.attributes?.iPos?.count) || o.geometry.attributes.iPos.count < 1) throw Error(`Invalid VFX target: ${name}`);
      targets.push(o);
    }
    if (typeof c.vfx?.stats !== 'function') throw Error('VFX live statistics unavailable');
    vfxTargets = targets;
    const identity = o => ({ name: o.name, uuid: o.uuid, geometry: o.geometry.uuid, material: o.material.uuid,
      scene: (o.name.startsWith('vfx:surface') ? c.scene : c.sectionScene).uuid, capacity: o.geometry.attributes.iPos.count });
    vfxProbe = { order: vfxOrder, blockMs: 600, settleMs: 150, targets: targets.map(identity),
      scope: 'Four instanced transparent particle meshes only. Chips, birds, shimmer, all simulation/VFX updates and emission, and all other render passes remain enabled. Visibility changes only during original renderer.render and is restored in its finally.' };
  }
  function beginVfxFrame() {
    if (!vfxProbe) return null;
    const at = performance.now(), state = readState(), key = `${state.phase}:${state.rods}`;
    if (key !== vfxKey) { vfxKey = key; vfxSegmentAt = at; vfxSegment++; }
    const elapsedMs = at - vfxSegmentAt, block = Math.floor(elapsedMs / 600), drilling = state.phase === 'drilling';
    const off = drilling && ((block % 2 === 0) === (vfxOrder === 'off-first'));
    const stats = c.vfx.stats(false);
    const q = { at, segment: vfxSegment, phase: state.phase, rods: state.rods, elapsedMs, block, off,
      eligible: drilling && elapsedMs % 600 >= 150,
      stats: clone({ clockFps: c.clock.fps, live: stats.live, capacity: stats.capacity, loadScale: stats.loadScale, medium: stats.medium,
        programme: stats.programme, sectionReturn: stats.sectionReturn, layers: stats.layers, chips: stats.chips }), targets: [] };
    // Capture all originals before mutating any target so a failure cannot
    // leave a partially applied mask. Never change emission or update functions.
    for (const o of vfxTargets) {
      let ancestorsVisible = true; for (let a = o.parent; a; a = a.parent) if (!a.visible) ancestorsVisible = false;
      let top = o; while (top.parent) top = top.parent;
      q.targets.push({ name: o.name, uuid: o.uuid, geometry: o.geometry.uuid, material: o.material.uuid,
        scene: top.uuid, capacity: o.geometry.attributes.iPos.count, instances: o.geometry.instanceCount,
        uniformTime: o.material.uniforms?.uTime?.value,
        before: o.visible, ancestorsVisible, drawVisible: off ? false : o.visible, after: null });
    }
    frame.vfxProbe = q;
    try { for (let i = 0; i < vfxTargets.length; i++) {
      vfxTargets[i].visible = q.targets[i].drawVisible;
      q.targets[i].drawVisible = vfxTargets[i].visible;
    } }
    catch (e) { restoreVfxFrame(q); throw e; }
    return q;
  }
  function restoreVfxFrame(q) {
    if (!q) return;
    for (let i = 0; i < vfxTargets.length; i++) {
      const o = vfxTargets[i], t = q.targets[i];
      let top = o; while (top.parent) top = top.parent;
      t.atRenderEnd = o.visible;
      t.identityHeldAtRenderEnd = o.name === t.name && o.uuid === t.uuid && o.geometry?.uuid === t.geometry
        && o.material?.uuid === t.material && o.geometry?.attributes?.iPos?.count === t.capacity && top.uuid === t.scene;
      o.visible = t.before;
      t.after = o.visible;
    }
  }
  function finishFrame() {
    const begin = performance.now();
    if (!frame) throw Error('Renderer ran without a system frame');
    frame.renderEnd = begin;
    frame.state = readState(); frame.cameras = cameras();
    frame.programs = c.renderer.gl.info.programs.length;
    frame.assetsReady = ready();
    frame.visible = document.visibilityState === 'visible'; frame.focused = document.hasFocus(); frame.contextLost = gl.isContextLost();
    frame.identityHeld = JSON.stringify(stable()) === JSON.stringify(before.stable);
    frame.draw = clone(c.renderer.gl.info.render);
    frame.observerMs = performance.now() - begin;
    if (frame.state.phase !== previousPhase) {
      transitions.push({ frame: frame.frame, at: begin, from: previousPhase, to: frame.state.phase, depth: frame.state.depth, rods: frame.state.rods });
      previousPhase = frame.state.phase;
    }
    rows.push(frame);
    if (!frame.identityHeld || !frame.visible || !frame.focused || frame.contextLost
        || frame.state.paused || !frame.state.active || frame.state.syntheticGeology
        || !frame.state.bitFits || !frame.assetsReady) faults.add('live frame identity/environment invalid');
    if (frame.programs !== before.programs) faults.add('shader programs changed in live window');
  }
  async function finish(reason = null) {
    if (finishing) return done;
    finishing = true; active = false; clearTimeout(timer); cancelAnimationFrame(handle);
    if (reason) fatal ||= String(reason);
    timing.endMs = performance.now();
    try { performance.mark('drillity-live-end'); } catch (e) { fatal ||= `End correlation mark: ${e}`; }
    try { after = endpoint(); } catch (e) { fatal ||= String(e); }
    const deadline = performance.now() + 5000;
    try {
      while (pending.length && !gl.isContextLost() && performance.now() < deadline) {
        pollGpu();
        if (pending.length) await new Promise(resolve => setTimeout(resolve, 16));
      }
      pollGpu();
    } catch (e) { gpu.queryErrors.push(String(e)); }
    gpu.pending = pending.length; gpu.drainTimedOut = pending.length > 0;
    discard(); completed = !fatal;
    resolveDone(current());
    return done;
  }
  function cleanupSync() {
    active = false; cancelAnimationFrame(handle); clearTimeout(timer);
    for (const restore of restores.splice(0).reverse()) restore();
    for (const [o, name, fn] of listeners) o.removeEventListener(name, fn);
  }
  const cleanup = async () => {
    if (!finishing) await finish('Capture cancelled before completion');
    else await done;
    cleanupSync();
    return { restored: restores.length === 0, pending: pending.length, queryCreated: gpu.created, queryDeleted: gpu.deleted };
  };
  try {
    // Public modal close resumes the existing zero-depth attempt; it does not
    // issue a new run or clear an accumulator through a private test seam.
    const warm = c.sim.getTelemetry();
    if (!c.ui.gameplayPaused || warm.depth !== 0 || warm.timeSec !== 0) throw Error('Warm-up attempt advanced or was not paused');
    setup.sheet.close();
    if (c.ui.gameplayPaused) throw Error('Warm-up overlay did not release gameplay');
    before = endpoint();
    if (!before.assetsReady || !before.stable.site || before.stable.site.procedural
        || before.stable.site.problem || before.stable.site.wanted !== before.stable.site.model
        || !before.simulation.bitFits || before.simulation.syntheticGeology) throw Error('Live source/assets/physical setup unavailable');
    if (vfxOrder) identifyVfx();
    for (const [o, name, fn] of listeners) o.addEventListener(name, fn);
    if (instrument) {
      for (const s of c.systems) wrap(s, 'update', `system:${s.__name}`);
      wrap(c.sim, 'getTelemetry', 'telemetry');
      wrap(c.renderer.gl, 'render', 'three-render');
      wrap(c.renderer.gl, 'copyFramebufferToTexture', 'framebuffer-copy');
      wrap(c.scene, 'updateMatrixWorld', 'surface-matrices');
      wrap(c.sectionScene, 'updateMatrixWorld', 'section-matrices');
    }
    const first = c.systems.find(s => typeof s.update === 'function');
    if (!first) throw Error('No system frame entry point');
    const oldFirst = first.update;
    first.update = function (dt, ...rest) {
      if (active) { try { startFrame(dt); } catch (e) { laterFailure(e); } }
      return oldFirst.call(this, dt, ...rest);
    };
    restores.push(() => { first.update = oldFirst; });
    const oldRender = c.renderer.render;
    c.renderer.render = function (...args) {
      if (!active) return oldRender.apply(this, args);
      let query = null, vfxFrame = null;
      try { vfxFrame = beginVfxFrame(); } catch (e) { laterFailure(e); }
      try {
        pollGpu();
        if (ext && frame && rows.length % 6 === 0 && pending.length < 256) {
          if (gl.getQuery(ext.TIME_ELAPSED_EXT, gl.CURRENT_QUERY)) throw Error('Another elapsed query is active');
          query = gl.createQuery(); if (!query) throw Error('createQuery failed');
          gpu.created++; gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
        }
      } catch (e) {
        gpu.queryErrors.push(String(e));
        if (query) { try { gl.deleteQuery(query); gpu.deleted++; } catch (cleanupError) { gpu.queryErrors.push(String(cleanupError)); } gpu.discarded++; query = null; }
      }
      const start = performance.now();
      try { return oldRender.apply(this, args); }
      catch (e) { laterFailure(e); throw e; }
      finally {
        cost('render-total', performance.now() - start);
        if (query) {
          try { gl.endQuery(ext.TIME_ELAPSED_EXT); pending.push({ query, frame: frame.frame }); }
          catch (e) { gpu.queryErrors.push(String(e)); try { gl.deleteQuery(query); gpu.deleted++; } catch (cleanupError) { gpu.queryErrors.push(String(cleanupError)); } gpu.discarded++; }
        }
        try { restoreVfxFrame(vfxFrame); } catch (e) { laterFailure(e); }
        try { finishFrame(); } catch (e) { laterFailure(e); }
      }
    };
    restores.push(() => { c.renderer.render = oldRender; });
    active = true;
    const started = performance.now();
    timing.startMs = started;
    performance.mark('drillity-live-start');
    const onRaf = timestamp => {
      if (!active) return;
      const row = rows.at(-1);
      if (!row || row.frame !== c.clock.frame || row.rafTimestamp !== null) faults.add('RAF/frame association invalid');
      else { row.rafTimestamp = timestamp; row.rafMs = lastRaf === null ? null : timestamp - lastRaf; }
      lastRaf = timestamp;
      if (performance.now() - started >= durationMs) { void finish(); return; }
      handle = requestAnimationFrame(onRaf);
    };
    handle = requestAnimationFrame(onRaf);
    timer = setTimeout(() => { void finish('Live RAF capture timed out'); }, durationMs + 5000);
    window.__LIVE_PROFILE = { done, current, cleanup };
    return { installed: true, instrument, started, durationMs, before };
  } catch (e) {
    cleanupSync(); discard(); throw e;
  }
}

async function liveSelfTest() {
  // The independent harness exercises actual installer forwarding/cleanup.
  // These tests attack assessment boundaries without a browser or WebGL.
  const stable = { runId: 1, attemptId: 2, contractId: 'ct', rigId: 'oil-derrick', source: 'glb', screen: 'site', methodId: 'oil-rotary', loadout: { bit: 'bit-oil' } };
  const matrix = Array.from({ length: 16 }, (_, i) => i % 5 === 0 ? 1 : 0);
  const cameras = { surface: { world: matrix, projection: matrix }, section: { world: matrix, projection: matrix } };
  const endpoint = { stable, cameras, visible: true, focused: true, contextLost: false, assetsReady: true, programs: 10, events: { blur: 0 } };
  const good = () => ({ completed: true, before: structuredClone(endpoint), after: structuredClone(endpoint), violations: [],
    frames: Array.from({ length: 60 }, (_, i) => ({ frame: i + 1, at: 10 + i * 16, renderEnd: 12 + i * 16, dt: .016, rafMs: i ? 16 : null, rafTimestamp: 1000 + i * 16, cameras: structuredClone(cameras),
      observerMs: .1, visible: true, focused: true, contextLost: false, assetsReady: true, programs: 10, identityHeld: true,
      cpu: { 'render-total': { count: 1, inclusiveMs: 2 }, 'system:sim': { count: 1, inclusiveMs: .1 } },
      state: { active: true, paused: false, runId: 1, attemptId: 2, contractId: 'ct', methodId: 'oil-rotary', bitId: 'bit-oil', bitFits: true,
        depth: i, timeSec: i * .016, phase: i < 20 || i > 30 ? 'drilling' : 'rod-add', rods: i > 30 ? 2 : 1 } })),
    gpu: { supported: true, created: 10, completed: 10, deleted: 10, discarded: 0, disjointEvents: 0, samples: Array.from({ length: 10 }, (_, i) => ({ frame: 1 + i * 6, ms: 3 })), pending: 0, queryErrors: [] } });
  const cases = [
    ['valid changing live state', () => {}, true],
    ['empty', w => { w.frames = []; }, false],
    ['frozen dt', w => { w.frames[10].dt = 0; }, false],
    ['paused transient', w => { w.frames[10].state.paused = true; }, false],
    ['no connection', w => { w.frames.forEach(r => { r.state.phase = 'drilling'; }); }, false],
    ['wrong bit', w => { w.frames[10].state.bitFits = false; }, false],
    ['replaced attempt', w => { w.frames[10].state.attemptId++; }, false],
    ['frame gap', w => { w.frames[10].frame++; }, false],
    ['invalid query time', w => { w.gpu.samples[0].ms = NaN; }, false],
    ['query outside capture', w => { w.gpu.samples[0].frame = 80; }, false],
    ['duplicate query frame', w => { w.gpu.samples[1].frame = 1; }, false],
    ['query leak', w => { w.gpu.deleted--; }, false],
    ['query error', w => { w.gpu.queryErrors.push('fixture'); }, false],
    ['focus event', w => { w.after.events.blur++; }, false],
    ['shader change', w => { w.frames[10].programs++; }, false],
    ['unpaid', w => { w.before.stable.runId = null; }, false],
    ['invalid RAF pairing', w => { w.frames[10].rafMs = 100; }, false],
    ['missing cameras', w => { delete w.frames[10].cameras; }, false],
    ['NaN camera', w => { w.frames[10].cameras.surface.world[2] = NaN; }, false],
    ['NaN accounting', w => { w.gpu.discarded = NaN; }, false],
  ];
  for (const [name, mutate, expected] of cases) { const w = good(); mutate(w); assert.equal(assessLiveWindow(w).valid, expected, name); }
  const profile = { startTime: 1, endTime: 10, nodes: [{ id: 1, callFrame: { functionName: 'fixture' } }], samples: [1], timeDeltas: [9] };
  const trace = [{ cat: 'blink.user_timing', name: 'drillity-live-start', ts: 2 }, { cat: 'blink.user_timing', name: 'drillity-live-end', ts: 9 }];
  assert.equal(assessLiveDiagnostics(profile, trace).valid, true);
  assert.equal(assessLiveDiagnostics({ ...profile, samples: [] }, trace).valid, false);
  assert.equal(assessLiveDiagnostics(profile, []).valid, false);
  assert.equal(assessLiveDiagnostics({ ...profile, timeDeltas: [NaN] }, trace).valid, false);
  assert.equal(assessLiveDiagnostics(profile, [...trace, trace[0]]).valid, false);
  console.log(`profileframes live: ${cases.length} assessment cases passed; no browser/server/GPU started`);
  console.log('profileframes live: 5 CDP/trace integrity cases passed');
  const probeWindow = () => {
    const targets = ['surfaceSoft', 'surfaceAdd', 'sectionSoft', 'sectionAdd'].map((n, i) => ({
      name: `vfx:${n}`, uuid: `mesh-${i}`, geometry: `geo-${i}`, material: `mat-${i}`, scene: i < 2 ? 'surface' : 'section', capacity: 64 }));
    const w = { instrument: true, vfxProbe: { order: 'on-first', blockMs: 600, settleMs: 150, targets }, frames: [], gpu: { samples: [] } };
    for (let i = 0; i < 480; i++) {
      const elapsedMs = i * 16, at = 1000 + elapsedMs, block = Math.floor(elapsedMs / 600), off = block % 2 === 1;
      const row = { frame: i + 1, at, renderEnd: at + 4, state: { phase: 'drilling', rods: 1 },
        vfxProbe: { at: at + 1, segment: 0, phase: 'drilling', rods: 1, elapsedMs, block, off, eligible: elapsedMs % 600 >= 150,
          targets: targets.map(t => ({ ...t, instances: 20, uniformTime: i * .016, before: true, ancestorsVisible: true, drawVisible: !off, atRenderEnd: !off, identityHeldAtRenderEnd: true, after: true })),
          stats: { clockFps: 60, loadScale: 1, live: 40, capacity: 256, medium: 'air', chips: { live: 4, capacity: 16 },
            layers: Object.fromEntries(targets.map(t => [t.name.slice(4), { live: 10, capacity: 64 }])) } } };
      w.frames.push(row); if (i % 6 === 0) w.gpu.samples.push({ frame: i + 1, ms: 12 });
    }
    return w;
  };
  const probeCases = [
    ['valid draw-only record', () => {}, true],
    ['missing probe', w => { delete w.vfxProbe; }, false],
    ['lost frame mask', w => { delete w.frames[5].vfxProbe; }, false],
    ['unrestored target', w => { w.frames[5].vfxProbe.targets[0].after = false; }, false],
    ['render re-enabled target', w => { w.frames[45].vfxProbe.targets[0].atRenderEnd = true; }, false],
    ['disconnected target', w => { w.frames[5].vfxProbe.targets[0].scene = 'elsewhere'; }, false],
    ['invalid adaptive state', w => { w.frames[5].vfxProbe.stats.clockFps = NaN; }, false],
    ['overcapacity layer', w => { w.frames[5].vfxProbe.stats.layers.surfaceSoft.live = 65; }, false],
    ['settling mislabeled', w => { w.frames[5].vfxProbe.eligible = true; }, false],
    ['no measured off samples', w => { w.gpu.samples = w.gpu.samples.filter(q => !w.frames[q.frame - 1].vfxProbe.off); }, false],
  ];
  for (const [name, mutate, expected] of probeCases) { const w = probeWindow(); mutate(w); assert.equal(assessLiveVfxProbe(w).valid, expected, name); }
  console.log(`profileframes live: ${probeCases.length} VFX probe integrity cases passed; no browser/server/GPU started`);
}

async function selfTest() {
  const s = { identity: { camera: [1, 0], state: { depth: 2 } }, graph: [[1, true]], visible: 'visible', focused: true, contextLost: false,
    events: { blur: 0 }, assets: { sets: 2, setsReady: 2, pending: 0, failed: 0 }, programs: 5 };
  const good = () => ({ before: structuredClone(s), after: structuredClone(s), intervals: [16, 17], requestedFrames: 2,
    gpu: { supported: true, created: 8, deleted: 8, completed: 8, discarded: 0, disjointEvents: 0, pending: 0, drainTimedOut: false, queryErrors: [], samples: Array(8).fill({ ms: 1 }) } });
  const cases = [
    ['valid', () => {}, true],
    ['camera drift', w => w.after.identity.camera[0]++, false],
    ['state drift', w => w.after.identity.state.depth++, false],
    ['hidden', w => w.after.visible = 'hidden', false],
    ['transient blur', w => w.after.events.blur++, false],
    ['transient frame drift', w => w.frameViolations = ['depth changed then restored'], false],
    ['context loss', w => w.after.contextLost = true, false],
    ['texture failure', w => w.after.assets.failed++, false],
    ['texture pending', w => w.after.assets.pending++, false],
    ['program change', w => w.after.programs++, false],
    ['graph change', w => w.after.graph[0][1] = false, false],
    ['intervention drift', w => w.after.intervention = { value: true }, false],
    ['intervention not applied', w => w.requestedIntervention = { value: false }, false],
    ['interval loss', w => w.intervals.pop(), false],
    ['bad interval', w => w.intervals[0] = NaN, false],
    ['query pending', w => w.gpu.pending++, false],
    ['disjoint', w => w.gpu.disjointEvents++, false],
    ['discard', w => w.gpu.discarded++, false],
    ['query leak', w => w.gpu.deleted--, false],
    ['query shortfall', w => w.gpu.samples.pop(), false],
    ['timer absent', w => w.gpu.supported = false, false],
    ['drain timeout', w => w.gpu.drainTimedOut = true, false],
    ['query error', w => w.gpu.queryErrors.push('test'), false],
  ];
  for (const [name, mutate, valid] of cases) { const w = good(); mutate(w); assert.equal(assessWindow(w, { gpu: true }).valid, valid, name); }
  // Execute the same page installer with an EventTarget context. This proves
  // adapter forwarding and cleanup, not WebGL/timer-driver correctness.
  const previousWindow = globalThis.window, previousDocument = globalThis.document;
  const calls = [], state = { tSec: 5 }, clock = { t: 10, fps: 60, dt: .016 };
  const systems = [0, 1].map(id => ({ update(dt, s) { calls.push({ id, dt, sameState: s === state, t: clock.t, tSec: state.tSec }); } }));
  const originals = systems.map(s => s.update);
  const render = dt => calls.push({ render: dt });
  const fake = { systems, state, clock, canvas: new EventTarget(), renderer: { render, gl: { getContext: () => ({}) } } };
  let profile;
  try {
    globalThis.window = Object.assign(new EventTarget(), { __DRILLITY: fake });
    globalThis.document = new EventTarget();
    installFrozenHarness(); profile = window.__FROZEN_PROFILE;
    clock.t = 100; state.tSec = 200; clock.fps = 30;
    for (const s of systems) s.update(.033, state);
    fake.renderer.render(.033);
    assert.deepEqual(calls, [{ id: 0, dt: 0, sameState: true, t: 10, tSec: 5 }, { id: 1, dt: 0, sameState: true, t: 10, tSec: 5 }, { render: 0 }]);
    assert.equal(clock.fps, 60);
    const cleaned = await profile.cleanup(); profile = null;
    assert.equal(cleaned.frozenAdaptersRestored, true);
    assert.equal(fake.renderer.render, render);
    systems.forEach((s, i) => assert.equal(s.update, originals[i]));
  } finally {
    if (profile) await profile.cleanup();
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
  }
  console.log(`profileframes: ${cases.length} assessment cases plus actual frozen-adapter/cleanup fixture passed; no browser/server/GPU started`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (args.includes('--self-test')) { await selfTest(); await liveSelfTest(); }
  else await run();
}

async function run() {
  const rig = flag('--rig', 'oil-derrick');
  const camera = flag('--camera', 'orbit');
  const n = Number(flag('--frames', '180'));
  const repeats = Number(flag('--repeats', '3'));
  const port = Number(flag('--port', '5209'));
  const settleMs = Number(flag('--settle-ms', '12000'));
  const live = args.includes('--live');
  const liveMs = Number(flag('--live-ms', '45000'));
  const seed = Number(flag('--seed', '1337'));
  const instrumentLive = !args.includes('--live-uninstrumented');
  const vfxOrder = flag('--live-vfx-order', null);
  if (vfxOrder !== null && (!live || !instrumentLive || !['on-first', 'off-first'].includes(vfxOrder))) throw Error('Invalid live VFX probe options');
  if ((!live && args.some(a => ['--live-ms', '--seed', '--live-uninstrumented', '--live-vfx-order'].includes(a)))
      || (live && args.some(a => ['--frames', '--repeats'].includes(a)))
      || !Number.isInteger(liveMs) || liveMs < 1000 || liveMs > 120000
      || !Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) throw Error('Invalid live options');
  if (!/^[a-z0-9-]+$/.test(rig) || !['orbit', 'hero'].includes(camera)) throw Error('Invalid rig/camera');
  if (!Number.isInteger(n) || n < 60 || !Number.isInteger(repeats) || repeats < 2 || !Number.isInteger(port) || port < 1024 || port > 65535 || !Number.isFinite(settleMs) || settleMs < 1000) throw Error('Invalid numeric options');
  const out = resolve(root, flag('--out', `evidence/fps/${rig}-${camera}-${live ? 'live' : 'frozen'}`));
  if (existsSync(resolve(out, 'report.json'))) throw Error(`Refusing to overwrite existing evidence: ${out}`);
  const lease = resolve(root, '../drillity-coordination/gpu-owner.txt');
  if (readFileSync(lease, 'utf8').trim() !== 'codex-fps-profile') throw Error('GPU lease not granted');
  mkdirSync(out, { recursive: true });
  const manifest = () => {
    const files = [];
    const walk = dir => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = resolve(dir, e.name); if (e.isDirectory()) walk(p); else if (e.isFile()) files.push(p); } };
    // All source and public input files, including whichever site/rig the page
    // loads. Exact installed Three code/config identities are also recorded.
    walk(resolve(root, 'src')); walk(resolve(root, 'public'));
    walk(resolve(root, 'node_modules/three/examples/jsm'));
    for (const p of ['index.html', 'vite.config.js', '.env', '.env.local', '.env.development', '.env.development.local', 'package.json', 'package-lock.json', 'tools/profileframes.mjs', 'node_modules/three/package.json', 'node_modules/three/build/three.module.js']) if (existsSync(resolve(root, p))) files.push(resolve(root, p));
    return Object.fromEntries(files.sort().map(p => [relative(root, p).split(sep).join('/'), { bytes: readFileSync(p).length, sha256: createHash('sha256').update(readFileSync(p)).digest('hex') }]));
  };
  const report = { version: live ? 3 : 2, mode: live ? 'live' : 'frozen', started: new Date().toISOString(), rig, camera, requestedFrames: live ? null : n, repeats: live ? null : repeats,
    semantics: { frozen: 'After live settling every original system update and renderer.render executes with dt=0; clock.t and state.tSec are restored at the first system each frame. No sim.debug.state writes. Zero dt omits fixed simulation substeps and animation advancement: frozen CPU timings cannot clear or quantify the live simulation path.',
      cpu: 'Inclusive elapsed main-thread wrapper time; nested rows overlap and must not be added.', gpu: 'EXT_disjoint_timer_query_webgl2 elapsed time around complete renderer.render; one query every sixth frame, asynchronously drained.',
      unwrapped: 'Timing/query wrappers absent; frozen-dt adapters remain.', ab: 'Diagnostic visibility/pass/update interventions only, not proposed shipping feature removals or phone FPS certification.' },
    sourceBefore: manifest(), errors: [], requestFailures: [], httpFailures: [], warnings: [], windows: [], ab: [], cleanup: {}, browserClosed: false, serverClosed: false };
  let server, browser, page, cdp;
  const save = () => writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2));
  try {
    server = await createServer({ root, server: { host: '127.0.0.1', port, strictPort: true, hmr: false } });
    await server.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--window-size=600,1000'] });
    page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    page.on('pageerror', e => report.errors.push(String(e)));
    page.on('requestfailed', r => report.requestFailures.push({ url: r.url(), error: r.failure()?.errorText }));
    page.on('response', r => { if (r.status() >= 400) report.httpFailures.push({ url: r.url(), status: r.status() }); });
    page.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') report.warnings.push({ type: m.type(), text: m.text() }); });
    await page.goto(`http://127.0.0.1:${port}/?quality=high&glb=strict&shot&sound=0`, { waitUntil: 'domcontentloaded' });
    await page.bringToFront();
    await page.waitForFunction(() => window.__DRILLITY?.__qa?.startDemoContract, null, { timeout: 180000 });
    if (live) {
      // Wait for the actual delayed boot hand-off, not only bridge installation.
      await page.waitForFunction(() => document.body.classList.contains('booted')
        && window.__DRILLITY?.ui?.currentScene === 'menu'
        && !window.__DRILLITY.renderer.titleActive, null, { timeout: 180000 });
      report.liveOptions = { liveMs, seed, instrumentLive, vfxOrder };
      report.semantics.live = 'Original dt is forwarded. Seeded contract/physics and public progression/equipment/actions; funded level-60 fixture, not a played career. Live camera/phase/particles can change. Per-frame observer/controller overhead remains, including in live-uninstrumented mode. Optional explicit draw-only VFX probe is separately validated; no automatic causal A/B attribution.';
      report.setup = await page.evaluate(prepareLiveScenario, { rig, camera, seed });
    } else report.setup = await page.evaluate(async ({ rig, camera }) => {
      const c = window.__DRILLITY, d = c.data, R = d.RIGS.find(r => r.id === rig);
      if (!R) throw Error('Unknown rig');
      const method = R.methods[0];
      const regions = d.REGIONS.filter(r => d.methodsForRegion(r.id, d.MAX_LEVEL).some(m => m.id === method));
      await c.gltfRigs.load(rig);
      const contract = await c.__qa.startDemoContract({ method, region: regions[0]?.id, depth: 6 });
      c.state.garage.rigId = rig;
      if (!c.rig.setRig(rig)) throw Error('Rig refused');
      c.rig.setMethod(method); c.ui.show('site'); c.renderer.setCameraMode(camera);
      c.sim.debug.setDepth(Math.min(6, contract.targetDepth * .35));
      c.geology.setDepth?.(Math.min(6, contract.targetDepth * .35));
      const gl = c.renderer.gl.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
      return { method, contract, source: c.rig.getSpec(), gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null, browser: navigator.userAgent };
    }, { rig, camera });
    // Finish texture generation first, then warm the programs that use those
    // completed textures. Preserve the complete result rather than a warm tag.
    await page.waitForFunction(() => { const a = window.__DRILLITY.assets.stats(); if (a.failed) throw Error('Texture generation failed'); return a.sets > 0 && a.setsReady === a.sets && a.pending === 0; }, null, { timeout: 180000 });
    report.warmShaders = await page.evaluate(() => window.__DRILLITY.renderer.warmShaders());
    if (report.warmShaders.ready !== true || report.warmShaders.failed || report.warmShaders.pending || report.warmShaders.retired) throw Error('Shader readiness not proven');
    await page.waitForTimeout(settleMs);
    if (live) {
      // Separate CDP trace/profile artifacts from the frozen diagnostics. Trace
      // covers the full bounded live interval, including observer overhead.
      cdp = await page.context().newCDPSession(page);
      const traceEvents = [];
      let liveCpuProfile;
      cdp.on('Tracing.dataCollected', e => { for (const event of e.value) traceEvents.push(event); });
      let traceComplete;
      const traceDone = new Promise(resolve => { traceComplete = resolve; });
      cdp.on('Tracing.tracingComplete', traceComplete);
      await cdp.send('Profiler.enable');
      await cdp.send('Profiler.setSamplingInterval', { interval: 1000 });
      if (instrumentLive) {
        await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8,blink.user_timing', transferMode: 'ReportEvents' });
        await cdp.send('Profiler.start');
      }
      try {
        report.liveInstall = await page.evaluate(installLiveHarness, { durationMs: liveMs, instrument: instrumentLive, vfxOrder });
        report.live = await page.evaluate(() => window.__LIVE_PROFILE.done);
        report.live.assessment = assessLiveWindow(report.live, { gpu: instrumentLive });
        if (vfxOrder) report.live.vfxAssessment = assessLiveVfxProbe(report.live);
        save();
      } finally {
        // Keep partial live evidence if a page call failed, and preserve the
        // original error: cleanup faults are separate report entries.
        if (!report.live && !page.isClosed()) {
          try { report.livePartial = await page.evaluate(() => window.__LIVE_PROFILE?.current()); }
          catch (e) { report.cleanup.livePartial = String(e); }
        }
        if (instrumentLive) {
          try {
            const p = await cdp.send('Profiler.stop'); liveCpuProfile = p.profile;
            writeFileSync(resolve(out, 'cpu-live.cpuprofile'), JSON.stringify(liveCpuProfile));
          } catch (e) { report.cleanup.liveCpu = String(e); }
          try {
            await cdp.send('Tracing.end');
            let timer;
            try { await Promise.race([traceDone, new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Trace drain timed out')), 8000); })]); }
            finally { clearTimeout(timer); }
            writeFileSync(resolve(out, 'trace-live.json'), JSON.stringify({ traceEvents }));
          } catch (e) { report.cleanup.liveTrace = String(e); }
          report.liveDiagnostics = assessLiveDiagnostics(liveCpuProfile, traceEvents);
        }
        try { report.cleanup.live = await page.evaluate(() => window.__LIVE_PROFILE?.cleanup()); }
        catch (e) { report.cleanup.live = { error: String(e) }; }
        try { await cdp.send('Profiler.disable'); await cdp.detach(); cdp = null; }
        catch (e) { report.cleanup.liveCdp = String(e); }
      }
      if (!report.live?.assessment.valid) throw Error(`Live capture rejected: ${report.live?.assessment.faults.join('; ') || 'no complete record'}`);
      if (vfxOrder && !report.live?.vfxAssessment?.valid) throw Error(`Live VFX probe rejected: ${report.live?.vfxAssessment?.faults.join('; ') || 'no complete record'}`);
      if (instrumentLive && !report.liveDiagnostics?.valid) throw Error(`Live diagnostics rejected: ${report.liveDiagnostics?.faults.join('; ') || 'missing diagnostics'}`);
      if (report.cleanup.liveCpu || report.cleanup.liveTrace || report.cleanup.liveCdp || report.cleanup.live?.error) throw Error('Live capture cleanup failed; see cleanup details');
      // No frozen control is silently mixed into the live timing series. A
      // separate frozen invocation retains its own exact state and manifest.
      await page.screenshot({ path: resolve(out, 'live-end.png') });
      report.completed = true;
    } else {
    report.freeze = await page.evaluate(installFrozenHarness);
    await page.evaluate(() => window.__FROZEN_PROFILE.frames(24));
    const sample = async (label, gpu = false) => {
      const w = await page.evaluate(({ label, n, gpu }) => window.__FROZEN_PROFILE.sample(label, n, gpu), { label, n, gpu });
      w.assessment = assessWindow(w, { gpu });
      report.windows.push(w); save();
      if (!w.assessment.valid) throw Error(`${label}: ${w.assessment.faults.join('; ')}`);
      return w;
    };
    report.baseline = await sample('frozen-baseline-no-timing-wrappers');
    if (report.baseline.before.identity.rig.id !== rig || report.baseline.before.identity.rig.source !== 'glb' || report.baseline.before.identity.cameraMode !== camera || report.baseline.before.identity.screen !== 'site' || report.baseline.before.identity.quality.id !== 'high') throw Error('Requested rig/source/camera/screen/quality not active');
    await page.screenshot({ path: resolve(out, 'baseline.png') });
    await page.evaluate(() => window.__FROZEN_PROFILE.installCpu());
    report.instrumented = await sample('inclusive-cpu-and-render-gpu', true);
    report.cpu = report.instrumented.cpu;
    await page.evaluate(() => window.__FROZEN_PROFILE.removeCpu());
    // Query and CPU wrappers have both been restored before collecting CDP.
    cdp = await page.context().newCDPSession(page);
    await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 1000 });
    await cdp.send('Profiler.start');
    report.cdpWindow = await sample('cdp-frozen-without-timing-wrappers');
    const profile = await cdp.send('Profiler.stop');
    writeFileSync(resolve(out, 'cpu-frozen.cpuprofile'), JSON.stringify(profile.profile));
    await cdp.send('Profiler.disable'); await cdp.detach(); cdp = null;
    for (const toggle of ['airborneDust', 'cloudDeck', 'shadowUpdate', 'ao', 'bloom']) {
      const descriptor = await page.evaluate(toggle => window.__FROZEN_PROFILE.selectToggle(toggle), toggle);
      const entry = { toggle, descriptor, repeats: [] }; report.ab.push(entry); save();
      if (!descriptor.available) continue;
      try {
        for (let i = 0; i < repeats; i++) {
          const pair = { index: i, order: i % 2 ? ['off', 'on'] : ['on', 'off'], samples: {} };
          entry.repeats.push(pair);
          for (const variant of pair.order) {
            await page.evaluate(variant => window.__FROZEN_PROFILE.setToggle(variant), variant);
            await page.evaluate(() => window.__FROZEN_PROFILE.frames(12));
            const w = await sample(`${toggle}-${i}-${variant}`, true);
            // Interventions may change scene visibility/pass flags. They must
            // never change state, cameras, rig identity, viewport or lighting.
            if (!equal(report.baseline.before.identity, w.before.identity)) throw Error(`${toggle}-${variant}: state/camera differs from frozen baseline`);
            pair.samples[variant] = w.label;
          }
        }
      } finally {
        entry.restoration = await page.evaluate(() => window.__FROZEN_PROFILE.restoreToggle());
      }
      const restored = await sample(`${toggle}-restored`, true);
      if (!equal(report.baseline.before.identity, restored.before.identity) || !equal(report.baseline.before.graph, restored.before.graph)) throw Error(`${toggle}: restoration did not recover baseline`);
    }
    report.completed = true;
    }
  } catch (e) {
    report.fatal = String(e.stack || e); process.exitCode = 1;
  } finally {
    if (cdp) { try { await cdp.send('Profiler.stop'); await cdp.send('Profiler.disable'); await cdp.detach(); report.cleanup.cdp = 'stopped'; } catch (e) { report.cleanup.cdp = String(e); } }
    if (page && !page.isClosed()) { try { report.cleanup.page = await page.evaluate(async () => {
      const frozen = window.__FROZEN_PROFILE ? await window.__FROZEN_PROFILE.cleanup() : null;
      const live = window.__LIVE_PROFILE ? await window.__LIVE_PROFILE.cleanup() : null;
      window.__LIVE_SETUP?.sheet?.close();
      return { live, frozen, installed: !!(live || frozen) };
    }); } catch (e) { report.cleanup.page = { error: String(e) }; } }
    if (browser) { try { await browser.close(); report.browserClosed = true; } catch (e) { report.cleanup.browser = String(e); process.exitCode = 1; } }
    if (server) { try { await server.close(); report.serverClosed = true; } catch (e) { report.cleanup.server = String(e); process.exitCode = 1; } }
    try { report.sourceAfter = manifest(); report.sourceUnchanged = equal(report.sourceBefore, report.sourceAfter); if (!report.sourceUnchanged) process.exitCode = 1; } catch (e) { report.sourceManifestError = String(e); process.exitCode = 1; }
    report.ended = new Date().toISOString();
    report.valid = !!report.completed && !report.fatal && report.sourceUnchanged && report.browserClosed && report.serverClosed && !report.errors.length && !report.requestFailures.length && !report.httpFailures.length && !report.warnings.some(w => w.type === 'error');
    if (!report.valid) process.exitCode = 1;
    save(); console.log(JSON.stringify({ out, valid: report.valid, fatal: report.fatal, windows: report.windows.length, browserClosed: report.browserClosed, serverClosed: report.serverClosed, sourceUnchanged: report.sourceUnchanged }));
  }
}

/** Runs only inside the page. Keeps all mutations and their restorers together. */
function installFrozenHarness() {
  const c = window.__DRILLITY, raw = c.renderer.gl.getContext();
  const originalClock = { t: c.clock.t, fps: c.clock.fps, tSec: c.state.tSec };
  const frozenRestores = [], cpuRestores = [];
  let cpuRows = {}, activeGpu = null, activeToggle = null;
  const events = { blur: 0, visibility: 0, lost: 0, restored: 0 };
  const listeners = [[window, 'blur', () => events.blur++], [document, 'visibilitychange', () => events.visibility++],
    [c.canvas, 'webglcontextlost', () => events.lost++], [c.canvas, 'webglcontextrestored', () => events.restored++]];
  for (const [o, name, fn] of listeners) o.addEventListener(name, fn);
  let first = true;
  for (const s of c.systems) {
    if (typeof s.update !== 'function') continue;
    const old = s.update, ownsClock = first; first = false;
    s.update = function (_dt, ...rest) {
      if (ownsClock) { c.clock.t = originalClock.t; c.clock.dt = 0; c.clock.fps = originalClock.fps; c.state.tSec = originalClock.tSec; }
      return old.call(this, 0, ...rest);
    };
    frozenRestores.push(() => { s.update = old; });
  }
  if (first) throw Error('No update entry point to freeze the clock');
  const render = c.renderer.render;
  c.renderer.render = function () { return render.call(this, 0); };
  frozenRestores.push(() => { c.renderer.render = render; });
  const clone = value => value === undefined ? null : JSON.parse(JSON.stringify(value));
  const matrix = camera => ({ world: camera.matrixWorld.toArray(), inverse: camera.matrixWorldInverse.toArray(), projection: camera.projectionMatrix.toArray(), projectionInverse: camera.projectionMatrixInverse.toArray(), layers: camera.layers.mask, fov: camera.fov, aspect: camera.aspect, zoom: camera.zoom, view: clone(camera.view) });
  const graph = () => {
    const rows = [];
    for (const [name, scene] of [['surface', c.scene], ['section', c.sectionScene]]) scene.traverse(o => {
      rows.push([name, o.uuid, o.parent?.uuid || null, o.name, o.visible, o.layers.mask, o.position.toArray(), o.quaternion.toArray(), o.scale.toArray(), o.geometry?.uuid || null]);
    });
    return rows;
  };
  function snapshot() {
    return { identity: { state: clone(c.state), simulation: clone(c.sim.debug.state), telemetry: clone(c.sim.getTelemetry()), rig: clone(c.rig.getSpec()), cameraMode: c.renderer.cameraMode,
      screen: c.ui.currentScene, quality: clone(c.quality), viewport: clone(c.viewport), drawingBuffer: [raw.drawingBufferWidth, raw.drawingBufferHeight], canvas: [c.canvas.width, c.canvas.height], dpr: c.renderer.gl.getPixelRatio(),
      surfaceCamera: matrix(c.camera), sectionCamera: matrix(c.sectionCamera), site: clone(c.terrain.siteModel), archetype: c.terrain.archetype,
      env: { undergroundId: c.env.undergroundId, exposure: c.renderer.exposure }, clock: { t: c.clock.t, tSec: c.state.tSec } },
      graph: graph(), assets: clone(c.assets.stats()), programs: c.renderer.gl.info.programs.length, draw: clone(c.renderer.gl.info.render),
      intervention: activeToggle ? { name: activeToggle.name, key: activeToggle.key, value: activeToggle.obj[activeToggle.key] } : null,
      visible: document.visibilityState, focused: document.hasFocus(), contextLost: raw.isContextLost(), events: { ...events }, vfx: clone(c.vfx?.stats?.() || null) };
  }
  async function frames(n) {
    return new Promise((done, reject) => {
      let left = n, handle;
      const timeout = setTimeout(() => { cancelAnimationFrame(handle); reject(Error(`RAF wait timed out (${n} frames)`)); }, 45000);
      function tick() { if (--left <= 0) { clearTimeout(timeout); done(); } else handle = requestAnimationFrame(tick); }
      handle = requestAnimationFrame(tick);
    });
  }
  function installCpu() {
    if (cpuRestores.length) throw Error('CPU wrappers already installed');
    cpuRows = {};
    const wrap = (obj, key, name) => {
      const old = obj[key]; if (typeof old !== 'function') return;
      obj[key] = function (...a) { const start = performance.now(); try { return old.apply(this, a); } finally { const ms = performance.now() - start, r = cpuRows[name] ||= { count: 0, inclusiveMs: 0, maxMs: 0 }; r.count++; r.inclusiveMs += ms; r.maxMs = Math.max(r.maxMs, ms); } };
      cpuRestores.push(() => { obj[key] = old; });
    };
    for (const s of c.systems) wrap(s, 'update', `system:${s.__name}`);
    wrap(c.sim, 'getTelemetry', 'telemetry'); wrap(c.renderer, 'render', 'render-total');
    wrap(c.renderer.gl, 'render', 'three-render'); wrap(c.renderer.gl, 'copyFramebufferToTexture', 'framebuffer-copy');
    for (const [name, scene] of [['surface', c.scene], ['section', c.sectionScene]]) wrap(scene, 'updateMatrixWorld', `${name}-matrices`);
  }
  function removeCpu() {
    if (activeGpu) throw Error('Drain and remove GPU wrapper before CPU wrappers');
    for (const restore of cpuRestores.splice(0).reverse()) restore();
    return clone(cpuRows);
  }
  function startGpu() {
    if (activeGpu) throw Error('GPU timer already active');
    const ext = raw.getExtension('EXT_disjoint_timer_query_webgl2');
    const stats = { supported: !!ext, created: 0, completed: 0, deleted: 0, discarded: 0, disjointEvents: 0, pending: 0, drainTimedOut: false, queryErrors: [], samples: [] };
    const pending = [];
    let collecting = true, renders = 0;
    const old = c.renderer.render;
    const discardAll = () => { while (pending.length) { const p = pending.pop(); raw.deleteQuery(p.q); stats.deleted++; stats.discarded++; } };
    function poll() {
      if (!ext || raw.isContextLost()) return;
      if (raw.getParameter(ext.GPU_DISJOINT_EXT)) { stats.disjointEvents++; discardAll(); return; }
      for (let i = pending.length - 1; i >= 0; i--) {
        const p = pending[i];
        if (!raw.getQueryParameter(p.q, raw.QUERY_RESULT_AVAILABLE)) continue;
        const ns = raw.getQueryParameter(p.q, raw.QUERY_RESULT);
        if (raw.getParameter(ext.GPU_DISJOINT_EXT)) { stats.disjointEvents++; discardAll(); return; }
        if (!Number.isFinite(ns) || ns < 0) { stats.discarded++; stats.queryErrors.push('Invalid elapsed query value'); }
        else { stats.samples.push({ render: p.render, ms: ns / 1e6 }); stats.completed++; }
        raw.deleteQuery(p.q); stats.deleted++; pending.splice(i, 1);
      }
    }
    c.renderer.render = function (...a) {
      let q = null;
      try {
        poll();
        if (ext && collecting && ++renders % 6 === 0 && !raw.isContextLost() && !raw.getParameter(ext.GPU_DISJOINT_EXT)) {
          if (raw.getQuery(ext.TIME_ELAPSED_EXT, raw.CURRENT_QUERY)) throw Error('A different elapsed query is active');
          q = raw.createQuery(); if (!q) throw Error('createQuery failed');
          stats.created++; raw.beginQuery(ext.TIME_ELAPSED_EXT, q);
        }
      } catch (e) { stats.queryErrors.push(String(e)); if (q) { raw.deleteQuery(q); stats.deleted++; stats.discarded++; q = null; } }
      try { return old.apply(this, a); }
      finally { if (q) { try { raw.endQuery(ext.TIME_ELAPSED_EXT); pending.push({ q, render: renders }); } catch (e) { stats.queryErrors.push(String(e)); try { raw.deleteQuery(q); stats.deleted++; } catch (cleanupError) { stats.queryErrors.push(String(cleanupError)); } stats.discarded++; } } }
    };
    activeGpu = {
      async finish() {
        collecting = false;
        const deadline = performance.now() + 5000;
        try { while (pending.length && !raw.isContextLost() && performance.now() < deadline) { poll(); if (pending.length) await frames(1); } poll(); }
        catch (e) { stats.queryErrors.push(String(e)); }
        stats.pending = pending.length; stats.drainTimedOut = pending.length > 0;
        // Every query is explicitly deleted even after timeout/context loss.
        try { discardAll(); } catch (e) { stats.queryErrors.push(`query cleanup: ${e}`); }
        finally { c.renderer.render = old; activeGpu = null; }
        return clone(stats);
      },
    };
    return activeGpu;
  }
  async function sample(label, n, gpu) {
    const before = snapshot(), intervals = [];
    const frameViolations = new Set();
    const expected = before.identity;
    // Compact per-frame checks avoid repeatedly serializing the entire career
    // in a timing interval. Complete JSON state/graph remains checked at both
    // endpoints. These checks are present in every variant, including CDP.
    const checkFrame = () => {
      const s = c.sim.debug.state, old = expected.simulation;
      if (document.visibilityState !== 'visible' || !document.hasFocus() || raw.isContextLost()) frameViolations.add('focus/visibility/context');
      if (c.rig.getSpec().id !== expected.rig.id || c.rig.getSpec().source !== 'glb' || c.ui.currentScene !== expected.screen || c.renderer.cameraMode !== expected.cameraMode) frameViolations.add('rig/source/screen/camera mode');
      for (const key of ['methodId', 'active', 'phase', 'depth', 'timeSec', 'drillSec', 'runId', 'attemptId']) if (s[key] !== old[key]) frameViolations.add(`simulation:${key}`);
      if (c.clock.t !== expected.clock.t || c.state.tSec !== expected.clock.tSec || c.state.drill.depth !== expected.state.drill.depth) frameViolations.add('clock/published depth');
      if (c.quality.id !== expected.quality.id || raw.drawingBufferWidth !== expected.drawingBuffer[0] || raw.drawingBufferHeight !== expected.drawingBuffer[1] || c.renderer.gl.getPixelRatio() !== expected.dpr) frameViolations.add('quality/drawing buffer/DPR');
      for (const [cam, oldCam] of [[c.camera, expected.surfaceCamera], [c.sectionCamera, expected.sectionCamera]]) {
        for (const [key, values] of [['matrixWorld', oldCam.world], ['projectionMatrix', oldCam.projection]]) if (cam[key].elements.some((v, i) => v !== values[i])) frameViolations.add(`camera:${key}`);
      }
      if (activeToggle && activeToggle.obj[activeToggle.key] !== activeToggle.requested) frameViolations.add('intervention');
    };
    if (cpuRestores.length) cpuRows = {};
    const timer = gpu ? startGpu() : null;
    let gpuResult = null, after, cpu = null;
    try {
      await new Promise((done, reject) => {
        let last, handle;
        const timeout = setTimeout(() => { cancelAnimationFrame(handle); reject(Error(`Sample timed out: ${label}`)); }, 45000);
        function tick(t) { checkFrame(); if (last !== undefined) intervals.push(t - last); last = t; if (intervals.length === n) { clearTimeout(timeout); done(); } else handle = requestAnimationFrame(tick); }
        handle = requestAnimationFrame(tick);
      });
      // Snapshot the CPU totals before endpoint telemetry/graph reads and
      // before the GPU drain's additional frames. Counts delimit their span.
      if (cpuRestores.length) cpu = clone(cpuRows);
      after = snapshot();
    } finally { if (timer) gpuResult = await timer.finish(); }
    return { label, requestedFrames: n, before, after, intervals, gpu: gpuResult, cpu, frameViolations: [...frameViolations],
      requestedIntervention: activeToggle ? { name: activeToggle.name, key: activeToggle.key, value: activeToggle.requested } : null };
  }
  function selectToggle(name) {
    if (activeToggle) throw Error('Previous toggle not restored');
    if (name === 'shadowUpdate') {
      const shadow = c.renderer.gl.shadowMap;
      if (!shadow.enabled || !shadow.autoUpdate) return { available: false, reason: 'Shadows or automatic shadow updates were already disabled' };
      activeToggle = { obj: shadow, key: 'autoUpdate', value: shadow.autoUpdate, name };
    } else if (name === 'ao' || name === 'bloom') {
      const candidates = (c.renderer.composer?.passes || []).filter(p => name === 'ao' ? p.uniforms?.tNormal && p.uniforms?.tDepth && p.uniforms?.uIntensity : p.constructor?.name === 'UnrealBloomPass');
      if (candidates.length !== 1 || !candidates[0].enabled) return { available: false, reason: 'No unique enabled matching live pass', candidates: candidates.length };
      activeToggle = { obj: candidates[0], key: 'enabled', value: candidates[0].enabled, name };
    } else {
      const candidates = []; c.scene.traverse(o => { if (o.name === name) candidates.push(o); });
      if (candidates.length !== 1) return { available: false, reason: 'Named object absent or ambiguous', candidates: candidates.length };
      let visible = true; for (let o = candidates[0]; o; o = o.parent) if (!o.visible) visible = false;
      if (!visible) return { available: false, reason: 'Object was not effectively visible' };
      activeToggle = { obj: candidates[0], key: 'visible', value: candidates[0].visible, name };
    }
    return { available: true, name, key: activeToggle.key, original: activeToggle.value, uuid: activeToggle.obj.uuid || null,
      semantics: name === 'shadowUpdate' ? 'Keep the existing frozen shadow map; suppress its refresh only' : name === 'ao' ? 'Disable AO pass and renderer-controlled AO normal/depth prepass together' : 'Toggle the live object/pass, with state and camera held fixed' };
  }
  function setToggle(variant) {
    if (!activeToggle || !['on', 'off'].includes(variant)) throw Error('Invalid toggle state');
    activeToggle.requested = variant === 'on' ? activeToggle.value : false;
    activeToggle.obj[activeToggle.key] = activeToggle.requested;
  }
  function restoreToggle() {
    if (!activeToggle) return { restored: true, noActiveToggle: true };
    const t = activeToggle; t.obj[t.key] = t.value; activeToggle = null;
    return { name: t.name, restored: t.obj[t.key] === t.value };
  }
  async function cleanup() {
    const gpu = activeGpu ? await activeGpu.finish() : null;
    const toggle = restoreToggle();
    removeCpu();
    for (const restore of frozenRestores.splice(0).reverse()) restore();
    for (const [o, name, fn] of listeners) o.removeEventListener(name, fn);
    return { gpu, toggle, cpuRestored: cpuRestores.length === 0, frozenAdaptersRestored: frozenRestores.length === 0 };
  }
  window.__FROZEN_PROFILE = { frames, snapshot, sample, installCpu, removeCpu, selectToggle, setToggle, restoreToggle, cleanup };
  return { clock: originalClock, updatedSystems: frozenRestores.length - 1, freezeMechanism: 'dt=0 adapters; no system functions omitted; read-only simulation internals' };
}
