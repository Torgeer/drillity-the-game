/**
 * DRILLITY I THE GAME — the runtime half of the motion pipeline.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `blender/lib/anim.py` is the authoring half and `src/core/gltfRig.js` is the
 * machine this bolts onto. Read both. This file adds no node convention of its
 * own: it plays clips that are keyed onto the SAME `pivot:`/`slide:` nodes
 * `gltfRig.js` already indexes, because a second convention would have been the
 * whole mistake.
 *
 * ── WHERE THE LINE IS ──────────────────────────────────────────────────────
 * The game already moves machines and none of that is replaced.
 *
 *   CODE drives CONTINUOUS STATE. `rigFactory.js:update()` writes named nodes
 *   every frame out of live sim state, and `env.js` reads `getWorkLights()`
 *   every frame off the same graph. A rotation whose SPEED is a variable — the
 *   spindle following `state.drill.rpm`, the carriage following feed pressure —
 *   cannot be a baked clip and must not become one.
 *
 *   CLIPS drive DISCRETE CHOREOGRAPHY. Several joints in a FIXED relationship
 *   over a FIXED time: a rod change, a mast raise, a tram-out, a hammer stroke,
 *   a kelly telescoping home. Those are a script, not a function of state, and
 *   a glTF animation is exactly the right container for them.
 *
 * ── THE OVERLAP IS REAL, AND IT IS HANDLED HERE ────────────────────────────
 * The two sets intersect: a rod change moves the same carriage the feed drives.
 * On a Blender machine `gltfRig.js:makeDyn()` maps exactly three named nodes to
 * things `rigFactory.js` writes every frame — measured, not assumed:
 *
 *     pivot:mast        -> dyn.mastPivot          .rotation.x
 *     pivot:mast-upper  -> dyn.mastLower/mastUpper .rotation.x
 *     slide:carriage    -> dyn.carriage           .position.y, .position.z,
 *                                                 .rotation.x  (setCarriage)
 *
 * Every other `pivot:`/`slide:` in a `.glb` is indexed, flagged
 * `userData.dynamic` so `mergeStatic()` spares it, and then driven by nothing.
 * `mount:tool` is read-only. `dyn.pivots`/`dyn.slides`/`dyn.mounts` have zero
 * reads in rigFactory.js — there is no generic name-driven loop, every driven
 * node is a hard-wired `dyn.<field>`.
 *
 * So the contested set is small and known, and it is settled by ARBITRATION,
 * not by ownership:
 *
 *   1. Code writes what it always wrote, every frame, unconditionally. No
 *      driver is guarded, no branch is added to rigFactory.js, nothing that
 *      works today stops working.
 *   2. `update()` here runs AFTER those writes, in the same frame, before the
 *      draw. Both systems have written; the LAST one before the matrix is
 *      composed decides. There is no race — three.js composes `matrix` from
 *      position/quaternion/scale at `updateMatrixWorld`, so ordering is the
 *      whole mechanism and it is deterministic.
 *   3. A clip only ever touches the CHANNELS IT ACTUALLY KEYED. The rod-change
 *      clip keys `slide:carriage`'s translation, so `setCarriage()`'s
 *      `.rotation.x` flex survives untouched underneath it. This is per
 *      channel, never per node.
 *   4. Entering and leaving is a WEIGHTED BLEND FROM THE LIVE VALUE — from
 *      wherever code has just put the node this frame, not from a pose
 *      snapshotted when the clip started. That is why nothing snaps at either
 *      end, and it is why a clip may start while the machine is anywhere.
 *      A stale snapshot is what an `AnimationMixer` would blend from
 *      (`PropertyMixer` saves the original at bind time), which is exactly why
 *      this file samples and mixes itself instead of using one.
 *
 * At weight 0 this file writes nothing at all, so a machine with clips it is
 * not playing costs one `if` per frame.
 *
 * ── WHY NOT AnimationMixer ─────────────────────────────────────────────────
 * Besides the stale-snapshot problem above, it cannot BIND. three.js runs every
 * node name through `PropertyBinding.sanitizeNodeName()`, which deletes
 * `[ ] . : /`, so `pivot:carousel` arrives as `pivotcarousel` in the scene AND
 * in every animation track name. `gltfRig.js:restoreNames()` then puts the
 * colons back — it has to, the whole node contract is a string lookup — and at
 * that moment every track in the file points at a name that no longer exists.
 * `AnimationMixer` would log one line and drive nothing. Measured on the real
 * export: track `"pivotcarousel.quaternion"` against a scene node named
 * `"pivot:carousel"`.
 *
 * So targets are resolved HERE, through the sanitiser, against both spellings,
 * and a name that resolves to neither is an error that says so. No track is
 * ever silently dropped: `problems()` carries every one, because a clip that
 * quietly does nothing is this codebase's most expensive failure mode
 * (HANDOFF §8: five separate silent fallbacks in one session).
 *
 * ── PROVING IT ─────────────────────────────────────────────────────────────
 * A clean console is not evidence. `probe()` returns the live local transform
 * of every node a clip claims, so a test reads the machine at two different
 * times and compares. `.qa-anim.mjs` does exactly that and will not pass on a
 * clip that loaded, logged and moved nothing.
 */

/* Must stay in step with `blender/lib/rig.py` and `gltfRig.js`. */
const P_PIVOT = 'pivot:';
const P_SLIDE = 'slide:';

/** Fade in/out, seconds. Long enough to hide a snap, short enough to feel like
 *  a machine taking over rather than a dissolve. */
const FADE = 0.25;

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** Smoothstep, so the hand-over has no velocity discontinuity at either end. */
const ease = (x) => { const t = clamp01(x); return t * t * (3 - 2 * t); };

/** The three.js properties a glTF animation path can land on. */
const VALID_PROPS = { position: 3, quaternion: 4, scale: 3 };

/* ═══════════════════════════════════════════════════════════════════════════
   READ — once per model, at load time, off the parsed glTF
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Turn `gltf.animations` into a clipset addressed by AUTHORED node name.
 *
 * Call this inside `gltfRig.js:loadOne()`, on the same `gltf` object, and hang
 * the result on the prepared record. It is synchronous and cheap: three.js has
 * already decoded the accessors into `KeyframeTrack`s, and those are immutable
 * and shared by every instance of the machine — only the interpolants are
 * per-instance, and they are a few floats each.
 *
 * Returns `{ id, clips, problems }`. `clips` may be empty; that is the normal
 * case for the sixteen machines with no motion authored yet, and it is not a
 * warning.
 */
export function readClips(THREE, gltf, id, say) {
  const log = say || ((lvl, m) => {
    if (lvl === 'error') console.error('[gltfAnim] ' + m);
    else if (lvl === 'warn') console.warn('[gltfAnim] ' + m);
    else console.info('[gltfAnim] ' + m);
  });
  const problems = [];
  const anims = (gltf && gltf.animations) || [];
  if (!anims.length) return { id, clips: [], problems };

  const PB = THREE.PropertyBinding;
  if (!PB || typeof PB.sanitizeNodeName !== 'function'
      || typeof PB.parseTrackName !== 'function') {
    throw new Error('[gltfAnim] THREE.PropertyBinding is missing — track names '
      + 'cannot be mapped back to authored node names without it.');
  }

  /* sanitised -> authored. Built from the FILE's node table, because that is
     the only place the authored spelling still exists once GLTFLoader has run.
     Two authored names that sanitise to the same string would make every track
     on them ambiguous, and picking one would be a coin flip nobody would ever
     see land — so it is refused instead. */
  const json = (gltf.parser && gltf.parser.json) || {};
  const unsanitise = new Map();
  for (const n of (json.nodes || [])) {
    if (!n || !n.name) continue;
    const s = PB.sanitizeNodeName(n.name);
    if (unsanitise.has(s) && unsanitise.get(s) !== n.name) {
      problems.push(`"${id}": node names ${JSON.stringify(unsanitise.get(s))} and `
        + `${JSON.stringify(n.name)} both sanitise to ${JSON.stringify(s)}, so an `
        + 'animation track on either is ambiguous. Rename one in the Blender module.');
      continue;
    }
    unsanitise.set(s, n.name);
  }

  const clips = [];
  for (const raw of anims) {
    const channels = [];
    for (const track of raw.tracks) {
      let parsed;
      try {
        parsed = PB.parseTrackName(track.name);
      } catch (e) {
        problems.push(`"${id}"/${raw.name}: track ${JSON.stringify(track.name)} `
          + `is not a parseable track name (${e.message}).`);
        continue;
      }
      const authored = unsanitise.get(parsed.nodeName) || parsed.nodeName;
      const prop = parsed.propertyName;

      if (!VALID_PROPS[prop]) {
        // morphTargetInfluences and material bindings among others. The
        // pipeline exports neither and cannot arbitrate one against code.
        problems.push(`"${id}"/${raw.name}: ${authored}.${prop} is not a transform `
          + 'channel — this runtime drives position, quaternion and scale only.');
        continue;
      }
      if (!authored.startsWith(P_PIVOT) && !authored.startsWith(P_SLIDE)) {
        // rig.py: a mount:/aim: is a FIXED attachment point the game READS
        // every frame to aim a spotlight. A clip that moved one would move a
        // light source and nothing would say so.
        problems.push(`"${id}"/${raw.name}: ${authored} is neither a ${P_PIVOT} nor `
          + `a ${P_SLIDE} node, so a clip may not drive it. Hang the geometry on a `
          + 'pivot: or a slide: in the Blender module (rig.py, contract 1).');
        continue;
      }
      channels.push({
        node: authored,
        sanitised: parsed.nodeName,
        prop,
        track,
        size: VALID_PROPS[prop],
      });
    }

    if (!channels.length) {
      problems.push(`"${id}"/${raw.name}: every track was refused — this clip would `
        + 'play and move nothing.');
      continue;
    }
    const nodes = Array.from(new Set(channels.map((c) => c.node)));
    clips.push({ name: raw.name, duration: raw.duration, channels, nodes });
  }

  for (const p of problems) log('error', p);
  if (clips.length) {
    log('info', `"${id}" ${clips.length} clip(s): `
      + clips.map((c) => `${c.name} ${c.duration.toFixed(2)}s `
        + `[${c.nodes.join(' ')}]`).join(' · '));
  }
  return { id, clips, problems };
}

/* ═══════════════════════════════════════════════════════════════════════════
   PLAY — one animator per built machine
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Bind a clipset to one instantiated machine.
 *
 * `root` is the CLONE `gltfRig.js:instantiate()` returns, so this must be
 * called per build, next to `makeDyn()`. Resolution accepts either spelling of
 * every node — the authored `pivot:carousel` that `restoreNames()` puts back,
 * or the sanitised `pivotcarousel` that GLTFLoader leaves behind — so it does
 * not care whether it is attached before or after that repair.
 */
export function createAnimator(THREE, clipset, root, opts) {
  const o = opts || {};
  const say = o.say || ((lvl, m) => {
    if (lvl === 'error') console.error('[gltfAnim] ' + m);
    else console.info('[gltfAnim] ' + m);
  });
  const fadeDefault = typeof o.fade === 'number' ? o.fade : FADE;
  const problems = [];

  /* ── resolve every claimed node on this instance ──────────────────────── */
  const byName = new Map();
  root.traverse((n) => { if (n.name) byName.set(n.name, n); });

  const clips = new Map();
  for (const c of ((clipset && clipset.clips) || [])) {
    const bound = [];
    const missing = [];
    for (const ch of c.channels) {
      const target = byName.get(ch.node) || byName.get(ch.sanitised);
      if (!target) { missing.push(ch.node); continue; }
      bound.push({
        node: ch.node,
        prop: ch.prop,
        target,
        size: ch.size,
        // Per instance: the interpolant owns a result buffer. `times`/`values`
        // stay shared with the master track, which is what keeps a second
        // machine of the same class free.
        interp: ch.track.createInterpolant(),
      });
    }
    if (missing.length) {
      problems.push(`clip "${c.name}": ${missing.length} node(s) are not in this `
        + `instance — ${Array.from(new Set(missing)).join(', ')}. The clip is `
        + 'refused rather than played half-bound.');
      say('error', problems[problems.length - 1]);
      continue;
    }
    clips.set(c.name, { name: c.name, duration: c.duration, bound, nodes: c.nodes });
  }

  /* ── scratch, allocated once. update() runs every frame. ──────────────── */
  const qA = new THREE.Quaternion();
  const qB = new THREE.Quaternion();
  const vA = new THREE.Vector3();

  /** name -> { clip, time, weight, phase, timeScale, loop, fadeIn, fadeOut, onFinish } */
  const active = new Map();

  function sampleInto(b, t) {
    // Interpolant.evaluate returns its own result buffer; never retain it.
    return b.interp.evaluate(t);
  }

  function applyChannel(b, t, w) {
    const v = sampleInto(b, t);
    const tgt = b.target;
    if (b.prop === 'quaternion') {
      qA.set(v[0], v[1], v[2], v[3]);
      if (w >= 1) tgt.quaternion.copy(qA);
      else {
        // Blend FROM THE LIVE VALUE — whatever code wrote this frame.
        qB.copy(tgt.quaternion);
        tgt.quaternion.copy(qB.slerp(qA, w));
      }
    } else {
      const p = b.prop === 'position' ? tgt.position : tgt.scale;
      if (w >= 1) p.set(v[0], v[1], v[2]);
      else p.lerp(vA.set(v[0], v[1], v[2]), w);
    }
  }

  const api = {
    /** Clip names this machine carries. */
    names() { return Array.from(clips.keys()); },
    has(name) { return clips.has(name); },
    duration(name) { const c = clips.get(name); return c ? c.duration : 0; },
    /** Nodes a clip claims — the set that has to be arbitrated. */
    nodesOf(name) { const c = clips.get(name); return c ? c.nodes.slice() : []; },
    /** Every clip refused, and why. Never empty silently. */
    problems() { return problems.slice(); },

    /**
     * Start a clip. Returns false and says why if there is no such clip —
     * never silently.
     *
     * `fadeIn`/`fadeOut` are the hand-over ramps against the code-driven
     * nodes. `loop` keeps it running until `stop()`; otherwise it plays once,
     * holds its last pose through `fadeOut`, then releases the nodes back.
     */
    play(name, opt) {
      const c = clips.get(name);
      if (!c) {
        say('error', `play("${name}") — this machine has no such clip. It has: `
          + (api.names().join(', ') || 'none'));
        return false;
      }
      const p = opt || {};
      active.set(name, {
        clip: c,
        time: 0,
        weight: 0,
        phase: 'in',
        loop: !!p.loop,
        timeScale: typeof p.timeScale === 'number' ? p.timeScale : 1,
        fadeIn: typeof p.fadeIn === 'number' ? p.fadeIn : fadeDefault,
        fadeOut: typeof p.fadeOut === 'number' ? p.fadeOut : fadeDefault,
        onFinish: typeof p.onFinish === 'function' ? p.onFinish : null,
      });
      return true;
    },

    /** Release a clip's nodes over `fadeOut`, back to whatever code wants. */
    stop(name, opt) {
      const s = active.get(name);
      if (!s) return false;
      if (typeof (opt && opt.fadeOut) === 'number') s.fadeOut = opt.fadeOut;
      if (s.fadeOut <= 0) { active.delete(name); return true; }
      s.phase = 'out';
      s.outFrom = s.weight;
      s.outT = 0;
      return true;
    },
    stopAll(opt) { for (const n of Array.from(active.keys())) api.stop(n, opt); },

    isPlaying(name) { return name === undefined ? active.size > 0 : active.has(name); },
    /** How far through, 0..1. For a HUD, and for a test to assert on. */
    progress(name) {
      const s = active.get(name);
      return s ? clamp01(s.time / Math.max(1e-6, s.clip.duration)) : 0;
    },
    weight(name) { const s = active.get(name); return s ? s.weight : 0; },

    /**
     * The nodes clips are writing RIGHT NOW, with the weight each is written
     * at. This is the arbitration surface: anything that wants to know whether
     * code or a clip currently owns a node asks here.
     */
    claims() {
      const out = new Map();
      for (const s of active.values()) {
        if (s.weight <= 0) continue;
        for (const n of s.clip.nodes) out.set(n, Math.max(out.get(n) || 0, s.weight));
      }
      return out;
    },

    /**
     * ADVANCE AND WRITE. Call this ONCE PER FRAME, AFTER the code drivers have
     * run and BEFORE the draw. The ordering is the arbitration — see the header.
     */
    update(dt) {
      if (!active.size) return;                 // the whole cost when idle
      const done = [];
      for (const s of active.values()) {
        const dur = s.clip.duration;

        if (s.phase === 'out') {
          s.outT += dt;
          s.weight = s.outFrom * (1 - ease(s.fadeOut > 0 ? s.outT / s.fadeOut : 1));
          if (s.outT >= s.fadeOut) { done.push(s); s.weight = 0; }
        } else {
          s.time += dt * s.timeScale;
          if (s.time >= dur) {
            if (s.loop) s.time = dur > 0 ? s.time % dur : 0;
            else {
              // Play to the end, then hand back over fadeOut holding the last
              // authored pose. The choreography is never cut short.
              s.time = dur;
              s.phase = 'out';
              s.outFrom = s.weight;
              s.outT = 0;
            }
          }
          if (s.phase === 'in') {
            s.weight = s.fadeIn > 0 ? ease(s.time / s.fadeIn) : 1;
            if (s.weight >= 1) { s.weight = 1; s.phase = 'run'; }
          }
        }

        if (s.weight <= 0) continue;
        const t = Math.min(s.time, dur);
        for (const b of s.clip.bound) applyChannel(b, t, s.weight);
      }
      for (const s of done) {
        active.delete(s.clip.name);
        if (s.onFinish) { try { s.onFinish(s.clip.name); } catch (e) { /* caller's */ } }
      }
    },

    /**
     * MEASUREMENT, not logging. The live local transform of every node the
     * named clip claims (or of every claimed node, if no name is given).
     *
     * The pipeline's expensive failures all had correct log lines — a builder
     * with no call sites, a `preview.aim` nobody read. So the way to prove a
     * clip is playing is to read this at two different times and compare it,
     * and that is what `.qa-anim.mjs` does.
     */
    probe(name) {
      const want = name ? [clips.get(name)].filter(Boolean) : Array.from(clips.values());
      const out = {};
      for (const c of want) {
        for (const b of c.bound) {
          const n = b.target;
          out[b.node] = {
            position: [n.position.x, n.position.y, n.position.z],
            quaternion: [n.quaternion.x, n.quaternion.y, n.quaternion.z, n.quaternion.w],
            scale: [n.scale.x, n.scale.y, n.scale.z],
          };
        }
      }
      return out;
    },

    /** What this machine can do, for a HUD or a report. */
    describe() {
      return Array.from(clips.values()).map((c) => ({
        name: c.name,
        duration: +c.duration.toFixed(3),
        nodes: c.nodes.slice(),
        channels: c.bound.map((b) => `${b.node}.${b.prop}`),
      }));
    },
  };

  return api;
}

/**
 * Convenience for a `ctx`-shaped caller: `createGltfAnim(ctx).read(gltf, id)`
 * and `.attach(clipset, root)`. Exists so the two hooks in `gltfRig.js` do not
 * have to thread `ctx.THREE` by hand.
 */
export function createGltfAnim(ctx) {
  const T = ctx && ctx.THREE;
  if (!T) throw new Error('[gltfAnim] ctx.THREE is required');
  return {
    read: (gltf, id, say) => readClips(T, gltf, id, say),
    attach: (clipset, root, opts) => createAnimator(T, clipset, root, opts),
  };
}

export default createGltfAnim;
