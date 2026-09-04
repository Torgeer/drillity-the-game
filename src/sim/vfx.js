/**
 * DRILLITY I THE GAME — sim/vfx.js
 * ═══════════════════════════════════════════════════════════════════════════
 * The particle & atmosphere system for both live 3D bands.
 *
 * DESIGN
 * ------
 * Two pooled GPU particle *systems* (surface band, cross-section band), each
 * drawn as two passes — a premultiplied "soft" pass (dust, smoke, spray, mud,
 * cuttings) and an additive "hot" pass (sparks, glints, groove energy). Four
 * draw calls total, 38 distinct art-directed effect kinds sharing them.
 *
 * Every particle is a camera-facing instanced quad (InstancedBufferGeometry,
 * 4 verts / 2 tris) rather than a THREE.Points sprite, because Points cannot
 * rotate, cannot stretch along velocity, clip when their centre leaves the
 * frustum, and are hard-capped by gl_PointSize on mobile GPUs. Instanced quads
 * give us tumbling cuttings, velocity-stretched spark streaks and metre-wide
 * dust puffs out of the same buffer.
 *
 * MOTION IS ANALYTIC AND RUNS ON THE GPU.
 * The CPU never touches a live particle. On spawn it writes position, velocity,
 * birth time, life and a handful of tuning scalars once; the vertex shader then
 * evaluates the closed-form solution of
 *
 *      dv/dt = -k*v + g + k*w            (linear drag, gravity, wind)
 *
 *      vInf = g/k + w
 *      p(t) = p0 + (v0 - vInf) * (1 - exp(-k*t)) / k + vInf * t
 *
 * which degrades exactly to ballistic motion as k -> 0, so one code path covers
 * a floating dust mote and a bouncing carbide spark. Turbulence, curl, swirl,
 * a damped ground/collar bounce and the annulus flow term are added on top,
 * also analytically. The CPU cost per frame is: age-check the live list,
 * recycle expired slots, advance a few uniforms. Zero allocation.
 *
 * The annulus (cuttings) column deliberately does NOT integrate on the GPU with
 * a fixed velocity. Instead the CPU integrates one scalar — uFlowPhase, the
 * running integral of the effective flush velocity — and each cutting stores
 * the phase it was born at. Rise distance is therefore (uFlowPhase - birthPhase)
 * which means a live change in flushing instantly re-times the whole column:
 * cuttings slow, stall and sink back onto the bit when flushing is inadequate.
 * That is the visual tell for a coming jam, and it is exact rather than faked.
 *
 * ART DIRECTION LIVES IN `EFFECTS` (exported, below). Every curve — size,
 * alpha, colour, emissive/HDR intensity — is authored as [t, value] points and
 * baked once at boot into a 256 x (2*N) RGBA lookup texture read by the vertex
 * shader. Retuning the look never requires touching the engine.
 *
 * All sprite textures are generated procedurally into one 1024x1024 atlas at
 * boot (fbm-eroded smoke, spark streak, droplet with specular, rock chip,
 * shock ring, glow, foam, mote, rain, snowflake, mud, flash, haze, ember,
 * stack plume). No image files, no CDN, no dependency on ctx.assets.
 *
 * A sprite whose alpha is still non-zero where the quad is cut shows that
 * cut as a soft SQUARE. Rasterised offline, `smoke` carries up to 0.280
 * alpha outside r = 0.92, 0.110 in the quad corners (r >= 1.0) and 0.073 in
 * its outermost texel ring — a rounded square, hard-cut at 0.07. It gets
 * away with it because collar puffs are small, dense and short-lived; the
 * metre-wide exhaust column did not, and the round-2 review measured it.
 * Any new large, low-alpha cell must taper to a hard zero inside r = 1.0 the
 * way `plume` does (0.000 everywhere outside r = 0.92).
 *
 * This module is strictly downstream: it subscribes to the bus and reads
 * ctx.state. It never emits a gameplay event.
 *
 * THREE TRAPS THIS FILE HAS ALREADY FALLEN INTO. All three are silent — no
 * exception, no warning, just an empty frame — so they are recorded here.
 *
 *  1. emitOne() takes SIX positional arguments (kind, ox, oy, oz, sizeScale,
 *     speedScale). The sustained-emission loop passed seven. sizeScale landed
 *     on the `oz` slot and every telemetry-driven particle in the game — all
 *     the dust, all the cuttings, all the spray, the exhaust, the motes, the
 *     groove — was born with a world size of exactly zero. They allocated pool
 *     slots, ran the vertex shader and rasterised nothing. emitOne now clamps
 *     a non-positive scale to 1 so this cannot recur.
 *
 *  2. `stretch` and `spin` are mutually exclusive in the vertex shader: any
 *     stretch > 0.0001 takes the velocity-billboard branch and never rotates.
 *     A tumbling kind (cuttings, rock chips, collapse chunks, mud) must author
 *     stretch: 0, or its spin is dead code and every sprite is an identical
 *     axis-aligned quad.
 *
 *  3. `color` and `colorCurve` multiply in LINEAR space, so a dark base
 *     against a dark curve squares itself. Soot authored as #23262A x #3A3D42
 *     resolved to 0.0007 linear — a hole cut in the sky with no tonal
 *     information at all. Dark materials put the colour in the BASE and keep
 *     the curve light.
 *
 * BLOOM. With a composer attached, three.js skips tone mapping when rendering
 * into a render target, so these materials write linear HDR and the bloom
 * pass thresholds it directly. Every emitCurve here is authored against a
 * 2.6 linear threshold: sparks, flashes, glints, the groove core and the
 * completion flourish are deliberately above it; dust, smoke, spray, foam,
 * soot, exhaust, cuttings, motes and the backlit halo are deliberately below.
 *
 * TWO NUMBERS, NOT ONE, and they are not interchangeable:
 *
 *   CEILING   base x colourCurve(t) x emitCurve(t) x 5, evaluated where alpha
 *             is non-trivial. A PREMULTIPLIED soft particle converges to this
 *             as layers stack, so it is the real ceiling for dust, smoke,
 *             spray, cuttings and the exhaust column. Keep it under 2.6.
 *   PER-CELL  that value x alphaCurve(t). An ADDITIVE particle only ever adds
 *             this much, so an additive kind crosses the threshold by
 *             OVERLAPPING, not on its own. The right question is how many
 *             deep it has to be, and the answer moves with the sky: a
 *             brighter background needs fewer.
 *
 * Any kind carrying sunTint must be checked against the whole SUN_RAMP, not
 * against its authored base colour. updateSun() normalises the live key to
 * unit LUMINANCE, so a saturated low sun (#FF8B3D at 2 deg elevation) has
 * channels of (2.496, 0.644, 0.116) — it does not merely re-hue a base, it
 * can multiply the red channel of one by 2.5. env's own dayFactor dims the
 * KEY that low, but nothing here dims the tint, so the worst case is fully
 * reachable. That is what put dustBacklight over the line.
 */

import * as THREE from 'three';
import {
  EVENTS, BRAND, LAYOUT, GROUND,
  clamp, lerp, damp, makeRandom, TAU,
} from '../core/contract.js';

/* ═══════════════════════════════════════════════════════════════════════════
   ATLAS CELLS — 4x4 grid, 256 px per cell, generated in makeSpriteAtlas().
   ═══════════════════════════════════════════════════════════════════════════ */
export const SPRITES = {
  smoke: 0,  // fbm-eroded billowing puff, the workhorse
  wisp:  1,  // thinner, streakier smoke — dissipation tail
  spark: 2,  // hot streak with a blown-out core
  drop:  3,  // teardrop with a specular highlight
  chip:  4,  // angular rock flake silhouette
  ring:  5,  // shock ring — soft annulus
  glow:  6,  // clean radial falloff
  foam:  7,  // clumpy bubble cluster
  mote:  8,  // tiny soft dot
  rain:  9,  // thin vertical streak
  snow:  10, // six-point flake
  mud:   11, // irregular dark blob
  flash: 12, // starburst
  haze:  13, // very soft low-contrast veil
  ember: 14, // round with a hot rim
  plume: 15, // big soft stack puff — alpha guaranteed 0 before the quad edge
};

const BAND_SURFACE = 'surface';
const BAND_SECTION = 'section';
const PASS_SOFT = 'soft';
const PASS_ADD  = 'add';

/* ═══════════════════════════════════════════════════════════════════════════
   EFFECTS — the tuning table.
   ═══════════════════════════════════════════════════════════════════════════

   A LEAF entry (one particle kind) is:

     band        'surface' | 'section'            which 3D band it lives in
     pass        'soft' | 'add'                   premultiplied vs additive
     sprite      key of SPRITES
     priority    0..10   higher survives longer under budget pressure
     life        [min,max] seconds
     size        [min,max] world units at curve value 1.0
     drag        k, 1/s   — linear drag; 0.05 ~ ballistic, 3 ~ syrupy air
     gravity     multiplier of 9.81 m/s^2 along -Y. Negative = buoyant.
     wind        0..1 how strongly the shared site wind carries it
     turb        [amplitude m, frequency Hz] non-repeating drift
     swirl       [radius m, spin rad/s] helical curl about the spawn axis
     spin        rad/s sprite rotation (ignored when stretch > 0)
     stretch     velocity elongation factor (spark streaks, rain, droplets)
     bounce      0..1 restitution against the collar / hole-bottom plane
     flow        annulus flow coupling (cuttings only; see uFlowPhase)
     sunTint     0..1 blend the base toward the LIVE key-light colour, so a
                 backlit rim is the colour of that afternoon's sun (optional)
     sunBias     metres to offset the spawn point along the sun's horizontal
                 direction — what turns a concentric halo into a lit rim on
                 the sun side of the plume (optional, surface band only)
     color       base albedo, multiplied by colorCurve and any stratum tint
     sizeCurve   [[t, mult] ...]     size over life
     alphaCurve  [[t, a] ...]        opacity over life  (must end at 0)
     colorCurve  [[t, '#hex'] ...]   colour over life   (multiplies `color`)
     emitCurve   [[t, e] ...]        emissive over life; 0.2 -> x1.0, 1.0 -> x5.0
     emit        spawn shape { shape, r, r2, speed:[min,max], spread, up, yOff }
                 shape: point | cone | sphere | disc | box | sky | annulus | wall
                 `up` is the Y component of the emission axis (1 = straight up,
                 -1 = straight down, 0.55 = a 56-degree fan); the remainder is
                 spread radially at a random azimuth, then jittered inside
                 `spread` radians. For `annulus`, r/r2 are outer/inner radii as
                 FRACTIONS of the live hole radius. For `wall`, r is the
                 vertical spread in world units and the jet points inward.
     rate        sustained particles/second at intensity 1
     burst       particles per one-shot burst at intensity 1

   A COMPOSITE entry is { parts: [leafId, ...] } and is what spawn() takes.
   ═══════════════════════════════════════════════════════════════════════════ */

export const EFFECTS = {

  /* ── SURFACE: air-flush rock flour ─────────────────────────────────────
     THREE stages, because a plume that reads as a single tan mass has no form.
     Value structure, dark to light:

       dustBody      the heavy skirt at the collar. Slow, high-drag, low
                     emissive (~sRGB 0.52 after the grade) — the SHADOW of the
                     plume, and the reason the lit column reads as lit.
       dustPlume     the lifting column. High emissive (~sRGB 0.87), dense
                     leading edge, long thin tail. This is the sunlit body.
       dustBacklight the additive rim, pushed 0.34 m toward the live sun and
                     tinted with the live key colour, so the halo sits on the
                     lit EDGE of the plume rather than concentrically inside
                     it. That offset is what makes it read as backlight.

     Structure comes from three things, not from density: a turbulence
     frequency high enough (0.9 Hz) that a particle traces ~3 rad of its own
     noise path within its life instead of drifting one way; a swirl radius of
     0.38 m so the column curls; and a 4:1 spread of puff sizes so the plume is
     made of visibly different-scale volumes. Sizes below are world metres and
     the surface band runs ~46 CSS px/m at the collar.

     None of these may bloom: peak linear luminance is held under 2.2 against
     the incoming 2.6 threshold. */
  dustBody: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'smoke', priority: 6,
    life: [1.5, 2.9], size: [0.50, 1.30], drag: 2.7, gravity: 0.05, wind: 0.30,
    turb: [0.17, 0.75], swirl: [0.30, 0.80], spin: 0.42, stretch: 0, bounce: 0, flow: 0,
    color: '#B6A48A',
    sizeCurve:  [[0, 0.42], [0.22, 1.00], [0.6, 1.28], [1, 1.60]],
    alphaCurve: [[0, 0], [0.07, 0.90], [0.40, 0.56], [0.78, 0.24], [1, 0]],
    colorCurve: [[0, '#E8D8BC'], [0.40, '#C2B092'], [1, '#8C8478']],
    emitCurve:  [[0, 0.30], [0.5, 0.22], [1, 0.15]],
    emit: { shape: 'cone', r: 0.40, r2: 0, speed: [0.35, 1.15], spread: 1.15, up: 0.55, yOff: 0.02 },
    rate: 52, burst: 18,
  },
  dustPlume: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'smoke', priority: 8,
    life: [2.2, 4.6], size: [0.28, 1.15], drag: 1.15, gravity: -0.05, wind: 0.85,
    turb: [0.30, 0.90], swirl: [0.38, 1.05], spin: 0.85, stretch: 0, bounce: 0, flow: 0,
    color: '#EADCC4',
    sizeCurve:  [[0, 0.22], [0.10, 0.62], [0.42, 1.05], [1, 2.05]],
    alphaCurve: [[0, 0], [0.05, 0.86], [0.22, 0.62], [0.62, 0.24], [1, 0]],
    colorCurve: [[0, '#FFF7E8'], [0.16, '#F2DDB8'], [0.48, '#D6C098'], [1, '#8E8A88']],
    emitCurve:  [[0, 0.46], [0.14, 0.40], [0.45, 0.30], [1, 0.19]],
    emit: { shape: 'cone', r: 0.20, r2: 0, speed: [1.1, 3.0], spread: 0.55, up: 1, yOff: 0.04 },
    rate: 118, burst: 30,
  },
  dustBacklight: {
    band: BAND_SURFACE, pass: PASS_ADD, sprite: 'haze', priority: 4,
    life: [1.8, 3.4], size: [0.42, 1.15], drag: 1.15, gravity: -0.06, wind: 0.90,
    turb: [0.28, 0.90], swirl: [0.34, 1.05], spin: 0.30, stretch: 0, bounce: 0, flow: 0,
    color: '#FFE2A8', sunTint: 0.55, sunBias: 0.34,
    sizeCurve:  [[0, 0.38], [0.35, 0.92], [1, 1.55]],
    alphaCurve: [[0, 0], [0.10, 0.34], [0.45, 0.20], [1, 0]],
    colorCurve: [[0, '#FFF0D2'], [0.45, '#F6CE92'], [1, '#7E6038']],
    // 0.62 -> 0.58. Re-measured against the 2.60 bloom threshold: sunTint
    // 0.55 blends the base toward the LIVE key, which updateSun() normalises
    // to unit LUMINANCE, so a low, saturated sun (#FF8B3D at 2 deg elevation
    // -> 2.496, 0.644, 0.116) drives this base far redder and brighter than
    // the authored #FFE2A8. At 0.62 the head of this curve reached a CEILING
    // of 2.608 linear — over a threshold the file header says it is
    // deliberately under, and a haze that blooms is no longer a rim. 0.58
    // lands it at 2.440, a 6.2 % margin. Alpha at t = 0 is zero and the curve
    // is back on its old value by t = 0.35, so nothing visible changed; the
    // ceiling did. Do not raise it without re-running the check.
    // Its PER-CELL additive contribution is 0.735, so the densest part of
    // the halo still crosses 2.6 about four particles deep (three against
    // the brightened sky). Buying that back would need the whole curve down
    // ~55 %, which would delete the rim the round-2 review praised — so it
    // stays, deliberately, and is recorded here rather than quietly fixed.
    emitCurve:  [[0, 0.58], [0.35, 0.42], [1, 0.14]],
    emit: { shape: 'cone', r: 0.20, r2: 0, speed: [0.95, 2.6], spread: 0.52, up: 1, yOff: 0.10 },
    rate: 46, burst: 12,
  },

  /* ── SURFACE: water / mud return ───────────────────────────────────────
     Droplets on ballistic arcs bouncing off the collar, a mist veil that
     hangs and drifts, an additive glint pass for the sun catching the spray,
     and dark mud streaks that stay low and heavy right at the collar. */
  sprayDrops: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'drop', priority: 7,
    life: [0.75, 1.50], size: [0.058, 0.140], drag: 0.22, gravity: 1.0, wind: 0.35,
    turb: [0.10, 1.4], swirl: [0, 0], spin: 0, stretch: 0.20, bounce: 0.30, flow: 0,
    color: '#DCEDF4',
    sizeCurve:  [[0, 0.8], [0.2, 1], [1, 0.7]],
    alphaCurve: [[0, 0], [0.05, 0.95], [0.75, 0.80], [1, 0]],
    colorCurve: [[0, '#F2FAFF'], [1, '#9FB4BE']],
    emitCurve:  [[0, 0.40], [1, 0.26]],
    emit: { shape: 'cone', r: 0.13, r2: 0, speed: [2.4, 5.6], spread: 0.42, up: 1, yOff: 0.02 },
    rate: 130, burst: 34,
  },
  sprayMist: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'haze', priority: 5,
    life: [1.6, 3.0], size: [0.35, 0.85], drag: 1.5, gravity: -0.02, wind: 1.0,
    turb: [0.35, 0.6], swirl: [0.14, 0.9], spin: 0.25, stretch: 0, bounce: 0, flow: 0,
    color: '#DCE9EE',
    sizeCurve:  [[0, 0.45], [0.4, 1.00], [1, 1.55]],
    alphaCurve: [[0, 0], [0.15, 0.30], [0.55, 0.18], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#B6C6CE']],
    emitCurve:  [[0, 0.38], [1, 0.22]],
    emit: { shape: 'cone', r: 0.22, r2: 0, speed: [0.8, 2.0], spread: 0.70, up: 1, yOff: 0.08 },
    rate: 44, burst: 12,
  },
  sprayGlint: {
    band: BAND_SURFACE, pass: PASS_ADD, sprite: 'glow', priority: 3,
    life: [0.35, 0.80], size: [0.058, 0.125], drag: 0.22, gravity: 1.0, wind: 0.35,
    turb: [0.08, 1.6], swirl: [0, 0], spin: 0, stretch: 0.19, bounce: 0.28, flow: 0,
    color: '#FFF6E2', sunTint: 0.40,
    sizeCurve:  [[0, 1.1], [1, 0.5]],
    alphaCurve: [[0, 0], [0.08, 1], [0.6, 0.5], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#FFE7B4']],
    emitCurve:  [[0, 0.95], [0.4, 0.48], [1, 0.16]],
    emit: { shape: 'cone', r: 0.13, r2: 0, speed: [2.6, 5.8], spread: 0.40, up: 1, yOff: 0.03 },
    rate: 30, burst: 10,
  },
  mudStreak: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'mud', priority: 6,
    life: [0.9, 1.8], size: [0.115, 0.27], drag: 0.5, gravity: 1.15, wind: 0.2,
    turb: [0.06, 1.0], swirl: [0, 0], spin: 2.2, stretch: 0, bounce: 0.12, flow: 0,
    color: '#8C7659',
    sizeCurve:  [[0, 0.7], [0.25, 1], [1, 0.85]],
    alphaCurve: [[0, 0], [0.06, 0.95], [0.70, 0.75], [1, 0]],
    colorCurve: [[0, '#F2E4CE'], [0.35, '#C8B394'], [1, '#7A6850']],
    emitCurve:  [[0, 0.30], [1, 0.20]],
    emit: { shape: 'cone', r: 0.16, r2: 0, speed: [1.4, 3.4], spread: 0.75, up: 1, yOff: 0.01 },
    rate: 34, burst: 14,
  },

  /* ── SURFACE: drilling foam ────────────────────────────────────────────
     Slow, clumpy, sticky. Very high drag, near-neutral buoyancy, low spin and
     a size curve that swells then holds — foam does not dissipate, it piles
     up and slumps. */
  foamClump: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'foam', priority: 7,
    life: [3.5, 7.0], size: [0.16, 0.42], drag: 3.2, gravity: 0.10, wind: 0.30,
    turb: [0.10, 0.25], swirl: [0.06, 0.35], spin: 0.30, stretch: 0, bounce: 0.05, flow: 0,
    color: '#EDEDE4',
    sizeCurve:  [[0, 0.45], [0.18, 1.00], [0.8, 1.12], [1, 1.00]],
    alphaCurve: [[0, 0], [0.10, 0.92], [0.72, 0.85], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.6, '#E6E4D8'], [1, '#BEBCB0']],
    emitCurve:  [[0, 0.34], [1, 0.26]],
    emit: { shape: 'cone', r: 0.20, r2: 0, speed: [0.5, 1.3], spread: 0.85, up: 1, yOff: 0.02 },
    rate: 46, burst: 20,
  },
  foamMist: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'haze', priority: 3,
    life: [2.0, 3.6], size: [0.30, 0.70], drag: 2.4, gravity: -0.02, wind: 0.55,
    turb: [0.22, 0.4], swirl: [0.10, 0.5], spin: 0.2, stretch: 0, bounce: 0, flow: 0,
    color: '#F2F2EA',
    sizeCurve:  [[0, 0.5], [0.5, 1.0], [1, 1.3]],
    alphaCurve: [[0, 0], [0.18, 0.24], [0.6, 0.14], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#C8CAC2']],
    emitCurve:  [[0, 0.32], [1, 0.22]],
    emit: { shape: 'cone', r: 0.22, r2: 0, speed: [0.4, 1.1], spread: 0.90, up: 1, yOff: 0.06 },
    rate: 18, burst: 6,
  },

  /* ── SURFACE: diesel stack ─────────────────────────────────────────────
     Three kinds, mirroring the collar plume's shadow / body / backlight
     structure: pale warm haze always, warm soot layered on top when the
     engine is fighting the ground, and a sun-offset additive rim on both.

     ROUND-2 REVIEW, all four site shots: "pure cold grey (~RGB 60,68,72)
     against a 140-value sky; rises perfectly vertically for the full frame
     height with no shear; never dissipates; soft square sprite boundaries;
     the darkest, highest-contrast mass in the top half of the frame." Every
     one of those is a tuning fault. What changed and why:

     SHEAR. The old column was buoyant to the point of being a rocket:
     gravity -0.22 against drag 0.85 is a TERMINAL RISE of 9.81*0.22/0.85 =
     2.54 m/s, while wind 1.15 on the site's 1.0-1.4 m/s breeze gave only
     1.2-1.6 m/s of drift, and barely half of that projects onto screen X
     from the hero camera. Over a 3.4 s life that is ~10 m of climb — taller
     than the entire 456 CSS px surface band — against ~1.2 m of lateral.
     8:1 is a plumb line, which is exactly what the review measured.
     Terminal rise is now 9.81*0.10/1.35 = 0.73 m/s and the wind coupling is
     1.45, so the column leaves the stack vertically, bends over inside a
     metre and then lies ~23 deg off plumb on screen at base wind and past
     50 deg in a gust. Rise and drift are now the same order of magnitude.

     DISSIPATION. alphaCurve reaches EXACTLY zero at t = 0.84 and stays
     there, while sizeCurve keeps expanding to 2.60x — the puff thins as it
     spreads, which is the whole difference between smoke and paint. With
     the shorter lives the visible plume spans ~1.6 m of rise (97 CSS px)
     and ~1.4 m of drift, so it dies low in the sky above the stack instead
     of leaving frame at full opacity through the HUD close button.

     LIGHT. Diesel exhaust is warm-grey to brown-black, never blue-grey. The
     bases are warm (#A89C8C / #332A24), the curves are warm and — per trap 3
     in the header — LIGHT, so a dark base never squares itself. Both kinds
     take a small sunTint so the column is the colour of that afternoon's
     key rather than a hard-coded grey. exhaustLight then adds the same
     sun-offset backlight lobe the collar dust uses: additive haze, sunTint
     0.50, spawn pushed 0.26 m along the sun's horizontal direction so the
     rim lands on the lit EDGE of the column instead of concentrically
     inside it. That offset is what turns a hole in the sky into a volume.

     SPRITE. Both soft kinds moved off `smoke` onto `plume`. `smoke`'s
     erosion subtracts from r before an sstep whose outer edge sits at
     exactly r = 1.0, so it still carries 0.280 alpha outside r = 0.92 and
     0.110 in the quad corners: its silhouette IS a rounded square, and a
     metre-wide puff cut off at 0.07 in the outermost texel ring is precisely
     the "soft square boundary" the review measured. `plume` drives alpha to
     zero by r = 0.92 under an unconditional radial guard — 0.000 outside it,
     measured — so there is no quad edge anywhere. `smoke` itself is
     untouched; the collar plume is built on it and the review praised it.

     RATE. 34 + 60 = 94 particles/s authored, now 14 + 25 + 8 = 47. Exactly
     halved, with the new backlight lobe paid for out of the same half.

     SCALE. The live hero camera is fov 34 at (7.60, 2.60, 9.90) looking at
     (-1.40, 3.40, 0); the stack anchor sits 12.24 m along its view axis, so
     the surface band runs 60.9 CSS px/m there (the 46 px/m quoted in the
     collar-dust block above is for the older 42 deg camera). Largest quad:
     0.36 x 2.60 = 0.94 m = 57 CSS px, of which the guarded silhouette covers
     ~0.88, i.e. 50 px of visible puff; typical mid-life puff 0.26 x 1.55 =
     0.40 m = 25 px quad, 22 px covered. Both are well over the ~2 px floor
     that killed the motes, and well under the collar plume's 2.36 m.

     None of these may bloom. Measured peak linear luminance against the 2.60
     threshold (base x colourCurve x emitCurve x 5, worst-case live key):
     0.963 smoke (63 % under), 0.204 soot (92 % under), and 1.345 for the
     additive lobe, which would need 11 overlapping particles to reach the
     threshold even against the brightened sky. */
  exhaustSmoke: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'plume', priority: 5,
    life: [1.4, 2.4], size: [0.16, 0.36], drag: 1.35, gravity: -0.10, wind: 1.45,
    turb: [0.34, 1.15], swirl: [0.14, 1.6], spin: 0.35, stretch: 0, bounce: 0, flow: 0,
    color: '#A89C8C', sunTint: 0.28,
    sizeCurve:  [[0, 0.30], [0.15, 0.80], [0.50, 1.55], [1, 2.60]],
    alphaCurve: [[0, 0], [0.06, 0.30], [0.24, 0.18], [0.52, 0.06], [0.72, 0.012], [0.84, 0], [1, 0]],
    colorCurve: [[0, '#FFE9CC'], [0.35, '#D8C4A6'], [1, '#8E8272']],
    emitCurve:  [[0, 0.42], [0.30, 0.34], [1, 0.20]],
    emit: { shape: 'cone', r: 0.05, r2: 0, speed: [0.9, 1.9], spread: 0.20, up: 1, yOff: 0.03 },
    rate: 14, burst: 4,
  },
  exhaustSoot: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'plume', priority: 5,
    life: [1.1, 2.0], size: [0.18, 0.40], drag: 1.20, gravity: -0.10, wind: 1.25,
    turb: [0.38, 1.30], swirl: [0.16, 1.9], spin: 0.45, stretch: 0, bounce: 0, flow: 0,
    color: '#332A24', sunTint: 0.10,
    sizeCurve:  [[0, 0.26], [0.15, 0.78], [0.50, 1.50], [1, 2.45]],
    alphaCurve: [[0, 0], [0.05, 0.58], [0.22, 0.32], [0.48, 0.12], [0.70, 0.025], [0.82, 0], [1, 0]],
    colorCurve: [[0, '#D8CCBC'], [0.40, '#A89684'], [1, '#6E6054']],
    emitCurve:  [[0, 0.52], [0.35, 0.44], [1, 0.30]],
    emit: { shape: 'cone', r: 0.05, r2: 0, speed: [1.2, 2.4], spread: 0.18, up: 1, yOff: 0.03 },
    rate: 25, burst: 10,
  },
  exhaustLight: {
    band: BAND_SURFACE, pass: PASS_ADD, sprite: 'haze', priority: 3,
    life: [1.2, 2.1], size: [0.20, 0.46], drag: 1.30, gravity: -0.10, wind: 1.55,
    turb: [0.30, 1.05], swirl: [0.16, 1.5], spin: 0.30, stretch: 0, bounce: 0, flow: 0,
    color: '#FFDCA6', sunTint: 0.50, sunBias: 0.26,
    sizeCurve:  [[0, 0.34], [0.30, 0.95], [1, 2.10]],
    alphaCurve: [[0, 0], [0.09, 0.17], [0.34, 0.10], [0.62, 0.025], [0.80, 0], [1, 0]],
    colorCurve: [[0, '#FFEFD6'], [0.42, '#F4CE96'], [1, '#6E5230']],
    emitCurve:  [[0, 0.34], [0.35, 0.24], [1, 0.07]],
    emit: { shape: 'cone', r: 0.05, r2: 0, speed: [0.9, 1.9], spread: 0.22, up: 1, yOff: 0.06 },
    rate: 8, burst: 4,
  },

  /* ── SURFACE: carbide on hard rock ─────────────────────────────────────
     Near-ballistic (drag 0.06), velocity-stretched, bouncing off the collar
     with damped restitution, cooling white -> amber -> dark red. emitCurve
     starts at 1.0 -> x5.0 HDR so the bloom pass picks the streak up. */
  sparkStreak: {
    band: BAND_SURFACE, pass: PASS_ADD, sprite: 'spark', priority: 9,
    life: [0.30, 0.85], size: [0.048, 0.105], drag: 0.06, gravity: 1.0, wind: 0.10,
    turb: [0.02, 3.0], swirl: [0, 0], spin: 0, stretch: 0.25, bounce: 0.42, flow: 0,
    color: '#FFFFFF',
    sizeCurve:  [[0, 1.0], [0.5, 0.85], [1, 0.35]],
    alphaCurve: [[0, 1], [0.55, 0.9], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.20, '#FFF0C4'], [0.50, '#FFB347'], [0.80, '#E85A12'], [1, '#601005']],
    emitCurve:  [[0, 1.00], [0.30, 0.86], [0.62, 0.52], [1, 0.10]],
    emit: { shape: 'cone', r: 0.05, r2: 0, speed: [3.0, 9.5], spread: 1.35, up: 0.55, yOff: 0.02 },
    rate: 0, burst: 16,
  },
  sparkEmber: {
    band: BAND_SURFACE, pass: PASS_ADD, sprite: 'ember', priority: 5,
    life: [0.90, 2.10], size: [0.046, 0.092], drag: 0.55, gravity: 0.42, wind: 0.85,
    turb: [0.16, 1.8], swirl: [0.05, 2.5], spin: 0, stretch: 0.16, bounce: 0.25, flow: 0,
    color: '#FFFFFF',
    sizeCurve:  [[0, 1], [1, 0.55]],
    alphaCurve: [[0, 0.9], [0.6, 0.6], [1, 0]],
    colorCurve: [[0, '#FFC978'], [0.4, '#FF7A22'], [1, '#4E0E04']],
    emitCurve:  [[0, 0.92], [0.35, 0.52], [1, 0.06]],
    emit: { shape: 'cone', r: 0.06, r2: 0, speed: [1.2, 3.6], spread: 1.50, up: 0.7, yOff: 0.03 },
    rate: 0, burst: 7,
  },

  /* ── SURFACE: impact / movement puffs ──────────────────────────────────
     Tracks, mast slam, rod drop. Wide, low, fast-blooming, quick to thin;
     a grit component gives it weight so it does not read as fog. */
  puffSoft: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'smoke', priority: 6,
    life: [1.2, 2.4], size: [0.35, 0.90], drag: 2.1, gravity: -0.03, wind: 0.9,
    turb: [0.40, 0.7], swirl: [0.18, 1.0], spin: 0.55, stretch: 0, bounce: 0, flow: 0,
    color: '#B8A78C',
    sizeCurve:  [[0, 0.35], [0.20, 1.00], [1, 1.85]],
    alphaCurve: [[0, 0], [0.05, 0.70], [0.35, 0.40], [1, 0]],
    colorCurve: [[0, '#F0E2C8'], [1, '#9B9182']],
    emitCurve:  [[0, 0.42], [1, 0.24]],
    emit: { shape: 'disc', r: 0.35, r2: 0, speed: [1.0, 2.6], spread: 1.25, up: 0.45, yOff: 0.03 },
    rate: 24, burst: 26,
  },
  puffGrit: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'chip', priority: 4,
    life: [0.70, 1.50], size: [0.062, 0.155], drag: 0.35, gravity: 1.05, wind: 0.25,
    turb: [0.05, 2.0], swirl: [0, 0], spin: 5.5, stretch: 0, bounce: 0.30, flow: 0,
    color: '#8C7E68',
    sizeCurve:  [[0, 1], [1, 0.9]],
    alphaCurve: [[0, 1], [0.7, 0.9], [1, 0]],
    colorCurve: [[0, '#F0E6D2'], [1, '#A69C8A']],
    emitCurve:  [[0, 0.34], [1, 0.22]],
    emit: { shape: 'disc', r: 0.28, r2: 0, speed: [1.8, 4.6], spread: 1.10, up: 0.75, yOff: 0.02 },
    rate: 0, burst: 16,
  },

  /* ── SURFACE: thread grease burning off on breakout ────────────────────
     Small, oily, blue-grey; rises fast then goes limp. */
  greaseSmoke: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'smoke', priority: 5,
    life: [1.6, 3.0], size: [0.10, 0.26], drag: 1.35, gravity: -0.30, wind: 1.0,
    turb: [0.24, 1.2], swirl: [0.09, 2.6], spin: 1.2, stretch: 0, bounce: 0, flow: 0,
    color: '#7C8188',
    sizeCurve:  [[0, 0.30], [0.2, 0.85], [1, 2.00]],
    alphaCurve: [[0, 0], [0.08, 0.50], [0.4, 0.26], [1, 0]],
    colorCurve: [[0, '#EDF0F4'], [0.4, '#B4B9C1'], [1, '#7E848C']],
    emitCurve:  [[0, 0.38], [1, 0.22]],
    emit: { shape: 'cone', r: 0.06, r2: 0, speed: [0.8, 1.9], spread: 0.45, up: 1, yOff: 0.02 },
    rate: 40, burst: 16,
  },
  greaseWisp: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'wisp', priority: 3,
    life: [1.2, 2.4], size: [0.08, 0.20], drag: 1.1, gravity: -0.40, wind: 1.1,
    turb: [0.30, 1.7], swirl: [0.12, 3.4], spin: 1.9, stretch: 0, bounce: 0, flow: 0,
    color: '#9FA6AE',
    sizeCurve:  [[0, 0.4], [1, 2.2]],
    alphaCurve: [[0, 0], [0.1, 0.34], [1, 0]],
    colorCurve: [[0, '#F0F3F7'], [1, '#9AA0A8']],
    emitCurve:  [[0, 0.36], [1, 0.22]],
    emit: { shape: 'cone', r: 0.05, r2: 0, speed: [1.0, 2.3], spread: 0.55, up: 1, yOff: 0.04 },
    rate: 18, burst: 8,
  },

  /* ── SURFACE: ambience ─────────────────────────────────────────────────
     Sun-shafted motes. Delicate, but they must actually exist: at the old
     0.012-0.030 m they were 0.4-1.4 CSS px, i.e. quads smaller than a pixel,
     which rasterise to nothing at all. 0.045-0.11 m is 2.1-5.1 px at the
     ~46 px/m the surface band runs at the collar. Tinted with the live key
     colour, and held at 1.6 linear luminance so they glow without blooming. */
  motes: {
    band: BAND_SURFACE, pass: PASS_ADD, sprite: 'mote', priority: 1,
    life: [6, 13], size: [0.045, 0.110], drag: 2.6, gravity: 0.012, wind: 0.55,
    turb: [0.30, 0.16], swirl: [0.10, 0.22], spin: 0, stretch: 0, bounce: 0, flow: 0,
    color: '#FFEFD0', sunTint: 0.35,
    sizeCurve:  [[0, 0.7], [0.5, 1], [1, 0.7]],
    alphaCurve: [[0, 0], [0.22, 0.42], [0.72, 0.34], [1, 0]],
    colorCurve: [[0, '#FFF6E2'], [1, '#F2D9A8']],
    emitCurve:  [[0, 0.34], [0.5, 0.40], [1, 0.24]],
    emit: { shape: 'box', r: 7.0, r2: 3.6, speed: [0.03, 0.16], spread: 3.14, up: 0.2, yOff: 1.4 },
    rate: 26, burst: 96,
  },

  /* ── SURFACE: weather (only used when ctx.env does not own weather) ──── */
  rainDrop: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'rain', priority: 7,
    life: [0.90, 1.50], size: [0.050, 0.100], drag: 0.35, gravity: 1.6, wind: 0.55,
    turb: [0.02, 0.8], swirl: [0, 0], spin: 0, stretch: 0.25, bounce: 0, flow: 0,
    color: '#BFD3DE',
    sizeCurve:  [[0, 1], [1, 1]],
    alphaCurve: [[0, 0], [0.08, 0.55], [0.90, 0.50], [1, 0]],
    colorCurve: [[0, '#DCEAF2'], [1, '#9FB4C2']],
    emitCurve:  [[0, 0.22], [1, 0.20]],
    emit: { shape: 'sky', r: 9.0, r2: 5.5, speed: [9, 14], spread: 0.05, up: -1, yOff: 6.5 },
    rate: 320, burst: 120,
  },
  rainSplash: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'haze', priority: 2,
    life: [0.22, 0.45], size: [0.05, 0.11], drag: 3.0, gravity: 0.2, wind: 0.2,
    turb: [0.02, 2.0], swirl: [0, 0], spin: 0.6, stretch: 0, bounce: 0, flow: 0,
    color: '#D6E6EE',
    sizeCurve:  [[0, 0.55], [1, 1.6]],
    alphaCurve: [[0, 0.55], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#B4C6D0']],
    emitCurve:  [[0, 0.24], [1, 0.18]],
    emit: { shape: 'disc', r: 6.0, r2: 0, speed: [0.4, 1.1], spread: 0.9, up: 1, yOff: 0.02 },
    rate: 60, burst: 20,
  },
  snowFlake: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'snow', priority: 7,
    life: [5.0, 9.0], size: [0.058, 0.125], drag: 2.9, gravity: 0.22, wind: 0.9,
    turb: [0.55, 0.35], swirl: [0.22, 0.85], spin: 1.1, stretch: 0, bounce: 0, flow: 0,
    color: '#F4F9FC',
    sizeCurve:  [[0, 0.85], [0.4, 1], [1, 0.95]],
    alphaCurve: [[0, 0], [0.10, 0.85], [0.85, 0.75], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#D8E6EE']],
    emitCurve:  [[0, 0.26], [1, 0.22]],
    emit: { shape: 'sky', r: 9.0, r2: 5.5, speed: [0.5, 1.3], spread: 0.4, up: -1, yOff: 6.0 },
    rate: 120, burst: 60,
  },

  /* ── SURFACE: hole-complete flourish ───────────────────────────────────
     Tasteful, brand amber, one breath long. Rises from the collar and is
     gone before it can ever sit in front of the HUD. */
  flourish: {
    band: BAND_SURFACE, pass: PASS_ADD, sprite: 'glow', priority: 8,
    life: [1.1, 2.2], size: [0.105, 0.265], drag: 1.05, gravity: -0.20, wind: 0.5,
    turb: [0.16, 0.9], swirl: [0.30, 2.1], spin: 0, stretch: 0, bounce: 0, flow: 0,
    color: '#FFEFCC',
    sizeCurve:  [[0, 0.4], [0.25, 1.0], [1, 0.35]],
    alphaCurve: [[0, 0], [0.10, 1], [0.55, 0.6], [1, 0]],
    colorCurve: [[0, '#FFF3D4'], [0.35, BRAND.amberHot], [1, BRAND.amber]],
    emitCurve:  [[0, 1.25], [0.35, 0.70], [1, 0.12]],
    emit: { shape: 'disc', r: 0.30, r2: 0, speed: [1.4, 3.4], spread: 0.55, up: 1, yOff: 0.05 },
    rate: 0, burst: 46,
  },
  flourishSpark: {
    band: BAND_SURFACE, pass: PASS_ADD, sprite: 'spark', priority: 6,
    life: [0.7, 1.4], size: [0.048, 0.098], drag: 0.35, gravity: 0.55, wind: 0.35,
    turb: [0.10, 2.0], swirl: [0, 0], spin: 0, stretch: 0.22, bounce: 0.35, flow: 0,
    color: '#FFFFFF',
    sizeCurve:  [[0, 1], [1, 0.45]],
    alphaCurve: [[0, 1], [0.6, 0.75], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.3, BRAND.amberHot], [1, '#8A5A10']],
    emitCurve:  [[0, 1.30], [0.4, 0.62], [1, 0.08]],
    emit: { shape: 'disc', r: 0.20, r2: 0, speed: [2.4, 6.0], spread: 0.95, up: 0.85, yOff: 0.05 },
    rate: 0, burst: 30,
  },

  /* ── SURFACE: groove reward halo ───────────────────────────────────────
     Amber energy around the mast and collar. Low alpha, wide radius, short
     life — it must build with the combo and never sit over the gauges. */
  grooveSurface: {
    band: BAND_SURFACE, pass: PASS_ADD, sprite: 'glow', priority: 4,
    life: [0.8, 1.7], size: [0.095, 0.225], drag: 1.4, gravity: -0.12, wind: 0.35,
    turb: [0.10, 1.1], swirl: [0.34, 2.6], spin: 0, stretch: 0, bounce: 0, flow: 0,
    color: '#FFDFA0',
    sizeCurve:  [[0, 0.3], [0.3, 1], [1, 0.4]],
    alphaCurve: [[0, 0], [0.18, 0.75], [0.6, 0.45], [1, 0]],
    colorCurve: [[0, '#FFF3DA'], [0.5, '#FFD98A'], [1, BRAND.amberHot]],
    emitCurve:  [[0, 0.62], [0.35, 0.95], [0.7, 0.42], [1, 0.10]],
    emit: { shape: 'disc', r: 0.42, r2: 0, speed: [0.5, 1.5], spread: 0.40, up: 1, yOff: 0.10 },
    rate: 26, burst: 10,
  },

  /* ═════ CROSS-SECTION BAND ══════════════════════════════════════════════
     No wind underground. Everything here is coloured from the live stratum. */

  /* ── SECTION: cuttings rising up the annulus — the money shot ──────────
     flow: 1 couples the particle to uFlowPhase, the CPU-integrated flush
     velocity, so the whole column responds live: fast and streaming with
     good flush, hesitant and tumbling when marginal, sinking back onto the
     bit when flushing fails.

     SCALE. The section band is 388 CSS px tall showing 20 m of hole, i.e.
     19.4 CSS px per metre, and geology's VISUAL bore is r = 1.28 m — so the
     hole is 49.7 px wide and each annulus is 14.9 px. Everything below is
     derived from those three numbers:

       size 0.16-0.36 m   = 3.1-7.0 CSS px per chip (was 0.055-0.135 =
                            1.1-2.6 px, which is under two device pixels at
                            DPR 2 and simply cannot be seen).
       turb amp 0.055     = ~5 px of lateral wander over a full life; more
                            than that and chips leave the 14.9 px annulus.
       swirl r 0.085      = a 1.6 px orbit — enough to break the column into
                            strands without smearing it.
       annulus 0.30-0.86  = spawn band 14.8-22.5 px off centre, so a 7 px chip
                            still sits clear of the 9.9 px rod wall.

     `stretch` MUST be zero. The vertex shader treats any stretch > 0.0001 as
     "velocity-billboard this quad" and skips the spin branch entirely — with
     drag 2.6 the launch velocity is gone in 0.4 s, so the old stretch 0.012
     left every chip as an identical axis-aligned square that never tumbled.
     Zeroing it is what actually turns `spin` on. */
  cuttingChip: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'chip', priority: 10,
    life: [2.6, 5.2], size: [0.160, 0.360], drag: 2.6, gravity: 0.30, wind: 0,
    turb: [0.055, 1.35], swirl: [0.085, 2.6], spin: 5.2, stretch: 0, bounce: 0.10, flow: 1.0,
    color: '#8A8078',
    sizeCurve:  [[0, 0.55], [0.10, 1.0], [0.85, 1.0], [1, 0.8]],
    alphaCurve: [[0, 0], [0.05, 1], [0.86, 0.95], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.5, '#E8E4DE'], [1, '#BCB6AE']],
    emitCurve:  [[0, 0.46], [0.12, 0.40], [0.8, 0.32], [1, 0.26]],
    emit: { shape: 'annulus', r: 0.86, r2: 0.30, speed: [0.12, 0.55], spread: 0.55, up: 1, yOff: 0.03 },
    rate: 128, burst: 26,
  },
  cuttingFines: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'haze', priority: 6,
    life: [2.2, 4.4], size: [0.26, 0.62], drag: 3.2, gravity: 0.10, wind: 0,
    turb: [0.06, 0.8], swirl: [0.06, 1.1], spin: 0.5, stretch: 0, bounce: 0.05, flow: 0.72,
    color: '#8A8078',
    sizeCurve:  [[0, 0.5], [0.4, 1.0], [1, 1.5]],
    alphaCurve: [[0, 0], [0.12, 0.44], [0.6, 0.27], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#C4BFB8']],
    emitCurve:  [[0, 0.36], [1, 0.24]],
    emit: { shape: 'annulus', r: 0.98, r2: 0.14, speed: [0.05, 0.25], spread: 0.7, up: 1, yOff: 0.02 },
    rate: 50, burst: 14,
  },

  /* ── SECTION: percussive crack at the bit ──────────────────────────────
     A flash whose colour is taken from the stratum, a fast radial shock ring
     that outruns it, and chips thrown off the face. */
  bitFlash: {
    band: BAND_SECTION, pass: PASS_ADD, sprite: 'flash', priority: 9,
    life: [0.12, 0.24], size: [0.90, 1.70], drag: 4.0, gravity: 0, wind: 0,
    turb: [0, 0], swirl: [0, 0], spin: 0.4, stretch: 0, bounce: 0, flow: 0,
    color: '#FFFFFF',
    sizeCurve:  [[0, 0.35], [0.25, 1.0], [1, 1.25]],
    alphaCurve: [[0, 1], [0.35, 0.55], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.4, '#FFE2B0'], [1, '#C07830']],
    emitCurve:  [[0, 1.35], [0.4, 0.52], [1, 0.05]],
    emit: { shape: 'point', r: 0.10, r2: 0, speed: [0, 0.05], spread: 3.14, up: 0, yOff: 0 },
    rate: 0, burst: 1,
  },
  shockRing: {
    band: BAND_SECTION, pass: PASS_ADD, sprite: 'ring', priority: 8,
    life: [0.26, 0.40], size: [0.55, 0.85], drag: 4.0, gravity: 0, wind: 0,
    turb: [0, 0], swirl: [0, 0], spin: 0.15, stretch: 0, bounce: 0, flow: 0,
    color: '#FFF0D8',
    sizeCurve:  [[0, 0.15], [0.35, 1.9], [1, 3.95]],
    alphaCurve: [[0, 0.9], [0.25, 0.7], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.5, '#FFDCA8'], [1, '#A06428']],
    emitCurve:  [[0, 0.95], [0.3, 0.42], [1, 0.04]],
    emit: { shape: 'point', r: 0.02, r2: 0, speed: [0, 0], spread: 0, up: 0, yOff: 0 },
    rate: 0, burst: 1,
  },
  rockChipSprite: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'chip', priority: 7,
    life: [0.55, 1.30], size: [0.130, 0.300], drag: 1.2, gravity: 0.85, wind: 0,
    turb: [0.04, 2.6], swirl: [0, 0], spin: 9.0, stretch: 0, bounce: 0.35, flow: 0.25,
    color: '#8A8078',
    sizeCurve:  [[0, 1], [1, 0.9]],
    alphaCurve: [[0, 1], [0.7, 0.9], [1, 0]],
    colorCurve: [[0, '#FFF4E4'], [0.3, '#FFFFFF'], [1, '#A8A29A']],
    emitCurve:  [[0, 0.62], [0.2, 0.40], [1, 0.26]],
    emit: { shape: 'sphere', r: 0.14, r2: 0, speed: [0.9, 3.2], spread: 3.14, up: 0.5, yOff: 0.02 },
    rate: 0, burst: 10,
  },

  /* ── SECTION: water-bearing layer breaking into the hole ───────────────
     A jet from the wall, an additive glint on the jet, and the mist it kicks
     up inside the borehole. */
  waterJet: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'drop', priority: 8,
    life: [0.55, 1.20], size: [0.105, 0.235], drag: 1.0, gravity: 0.75, wind: 0,
    turb: [0.05, 3.0], swirl: [0, 0], spin: 0, stretch: 0.24, bounce: 0.20, flow: 0.35,
    color: '#A8D0DE',
    sizeCurve:  [[0, 0.8], [0.25, 1], [1, 0.7]],
    alphaCurve: [[0, 0], [0.05, 0.9], [0.7, 0.7], [1, 0]],
    colorCurve: [[0, '#E4F6FF'], [1, '#7FA6B6']],
    emitCurve:  [[0, 0.44], [1, 0.28]],
    emit: { shape: 'wall', r: 0.90, r2: 0, speed: [1.6, 4.2], spread: 0.55, up: 0.15, yOff: 0 },
    rate: 150, burst: 40,
  },
  waterGlint: {
    band: BAND_SECTION, pass: PASS_ADD, sprite: 'glow', priority: 4,
    life: [0.30, 0.70], size: [0.075, 0.170], drag: 1.0, gravity: 0.75, wind: 0,
    turb: [0.04, 3.2], swirl: [0, 0], spin: 0, stretch: 0.22, bounce: 0.20, flow: 0.35,
    color: '#DFF4FF',
    sizeCurve:  [[0, 1], [1, 0.5]],
    alphaCurve: [[0, 0.85], [0.5, 0.5], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#9FD4EA']],
    emitCurve:  [[0, 0.72], [0.4, 0.38], [1, 0.08]],
    emit: { shape: 'wall', r: 0.90, r2: 0, speed: [1.8, 4.4], spread: 0.5, up: 0.15, yOff: 0 },
    rate: 34, burst: 10,
  },
  waterMist: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'haze', priority: 5,
    life: [1.2, 2.6], size: [0.30, 0.72], drag: 3.4, gravity: -0.02, wind: 0,
    turb: [0.06, 1.0], swirl: [0.05, 1.4], spin: 0.4, stretch: 0, bounce: 0, flow: 0.55,
    color: '#CFE6F0',
    sizeCurve:  [[0, 0.5], [0.4, 1.0], [1, 1.6]],
    alphaCurve: [[0, 0], [0.15, 0.34], [0.6, 0.20], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#A8C4D2']],
    emitCurve:  [[0, 0.38], [1, 0.24]],
    emit: { shape: 'wall', r: 1.10, r2: 0, speed: [0.4, 1.2], spread: 0.9, up: 0.3, yOff: 0 },
    rate: 40, burst: 12,
  },

  /* ── SECTION: hole wall sloughing in when stability fails ──────────────
     Heavy chunks that fall and pile, plus the dust cloud they release. */
  collapseChunk: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'chip', priority: 9,
    life: [1.2, 2.6], size: [0.200, 0.460], drag: 0.9, gravity: 1.10, wind: 0,
    turb: [0.03, 1.2], swirl: [0, 0], spin: 3.4, stretch: 0, bounce: 0.18, flow: 0.10,
    color: '#7A736C',
    sizeCurve:  [[0, 0.8], [0.15, 1], [1, 0.95]],
    alphaCurve: [[0, 0], [0.05, 1], [0.85, 0.9], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#A09890']],
    emitCurve:  [[0, 0.40], [1, 0.26]],
    emit: { shape: 'wall', r: 1.10, r2: 0, speed: [0.3, 1.4], spread: 1.1, up: -0.35, yOff: 0 },
    rate: 55, burst: 26,
  },
  collapseDust: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'smoke', priority: 6,
    life: [1.6, 3.2], size: [0.32, 0.74], drag: 2.8, gravity: 0.06, wind: 0,
    turb: [0.07, 0.9], swirl: [0.06, 1.3], spin: 0.6, stretch: 0, bounce: 0, flow: 0.4,
    color: '#8A8278',
    sizeCurve:  [[0, 0.45], [0.35, 1.0], [1, 1.7]],
    alphaCurve: [[0, 0], [0.10, 0.60], [0.55, 0.34], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#9A948C']],
    emitCurve:  [[0, 0.38], [1, 0.24]],
    emit: { shape: 'wall', r: 1.20, r2: 0, speed: [0.2, 1.0], spread: 1.3, up: -0.1, yOff: 0 },
    rate: 40, burst: 18,
  },

  /* ── SECTION: karst void ───────────────────────────────────────────────
     Debris tumbling AWAY, downward, out of the lit column and into black.
     Long life, low drag, almost no flow coupling — nothing comes back. */
  voidDebris: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'chip', priority: 8,
    life: [1.6, 3.2], size: [0.150, 0.340], drag: 0.35, gravity: 1.0, wind: 0,
    turb: [0.05, 1.0], swirl: [0.06, 1.6], spin: 5.0, stretch: 0, bounce: 0, flow: 0,
    color: '#5A5450',
    sizeCurve:  [[0, 1], [1, 0.85]],
    alphaCurve: [[0, 0], [0.06, 0.95], [0.55, 0.55], [1, 0]],
    colorCurve: [[0, '#C8C0B8'], [0.4, '#7A736C'], [1, '#2A2C31']],
    emitCurve:  [[0, 0.40], [0.5, 0.22], [1, 0.08]],
    emit: { shape: 'annulus', r: 0.88, r2: 0.05, speed: [0.2, 1.1], spread: 1.0, up: -1, yOff: -0.05 },
    rate: 70, burst: 30,
  },
  voidDust: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'haze', priority: 4,
    life: [2.0, 3.8], size: [0.34, 0.80], drag: 2.2, gravity: 0.20, wind: 0,
    turb: [0.09, 0.6], swirl: [0.08, 0.9], spin: 0.4, stretch: 0, bounce: 0, flow: 0,
    color: '#8E8C88',
    sizeCurve:  [[0, 0.5], [0.4, 1.1], [1, 1.8]],
    alphaCurve: [[0, 0], [0.15, 0.40], [0.6, 0.20], [1, 0]],
    colorCurve: [[0, '#A8A29A'], [1, '#22252A']],
    emitCurve:  [[0, 0.22], [1, 0.12]],
    emit: { shape: 'annulus', r: 0.95, r2: 0.05, speed: [0.1, 0.6], spread: 1.2, up: -1, yOff: -0.05 },
    rate: 26, burst: 12,
  },

  /* ── SECTION: the groove ───────────────────────────────────────────────
     grooveCore is a tight amber pulse right at the bit; grooveTrail rides the
     drill string upward on a helix whose radius is deliberately larger than
     the bore so the cuttings column stays readable through it. Both are
     additive, both scale with the combo, both stay low-alpha. */
  grooveCore: {
    band: BAND_SECTION, pass: PASS_ADD, sprite: 'glow', priority: 6,
    life: [0.45, 0.95], size: [0.30, 0.70], drag: 3.0, gravity: 0, wind: 0,
    turb: [0.02, 1.6], swirl: [0.06, 3.4], spin: 0, stretch: 0, bounce: 0, flow: 0.2,
    // The base is a pale gold, NOT BRAND.amber: base and colourCurve multiply,
    // and amber x amberHot lands at 1.2 linear luminance — under the incoming
    // 2.6 bloom threshold, i.e. the reward beat would never actually glow.
    // The hue lives in the curve; the base carries the energy.
    color: '#FFDFA0',
    sizeCurve:  [[0, 0.35], [0.3, 1.0], [1, 0.45]],
    alphaCurve: [[0, 0], [0.2, 0.70], [1, 0]],
    colorCurve: [[0, '#FFF6DE'], [0.35, '#FFD98A'], [1, BRAND.amberHot]],
    emitCurve:  [[0, 0.55], [0.22, 1.10], [0.55, 0.62], [1, 0.08]],
    emit: { shape: 'annulus', r: 0.55, r2: 0.0, speed: [0.1, 0.5], spread: 1.0, up: 0.4, yOff: 0.02 },
    rate: 34, burst: 14,
  },
  grooveTrail: {
    band: BAND_SECTION, pass: PASS_ADD, sprite: 'mote', priority: 5,
    life: [1.1, 2.2], size: [0.100, 0.225], drag: 2.4, gravity: -0.04, wind: 0,
    turb: [0.02, 0.9], swirl: [0.16, 4.2], spin: 0, stretch: 0, bounce: 0, flow: 0.35,
    color: '#FFE3B0',
    sizeCurve:  [[0, 0.4], [0.3, 1.0], [1, 0.5]],
    alphaCurve: [[0, 0], [0.16, 0.55], [0.7, 0.35], [1, 0]],
    colorCurve: [[0, '#FFEEC8'], [0.5, '#FFCE72'], [1, '#9A7024']],
    // Deliberately held under threshold. The trail glows, only the core pulse
    // crosses over and blooms, so the bloom reads as a beat rather than a
    // permanent smear over the cuttings column. Re-measured: the ceiling is
    // 2.294, not the 2.1 previously noted here — still 12 % under 2.6, and
    // there is no sunTint on this kind so the live key cannot move it. Its
    // per-cell additive contribution is 1.015, i.e. three deep to cross; the
    // helix radius (1.02-1.28, outside the bore) is what keeps it from
    // stacking that far, so do not narrow it without re-checking.
    emitCurve:  [[0, 0.66], [0.4, 0.42], [1, 0.08]],
    emit: { shape: 'annulus', r: 1.28, r2: 1.02, speed: [0.25, 0.85], spread: 0.35, up: 1, yOff: 0.05 },
    rate: 44, burst: 14,
  },

  /* ═════ THE SIX NEW METHODS ═════════════════════════════════════════════
     Every one of these is a specific, sourced image, not a generic emitter.
     Three of them live UNDERGROUND, where env/terrain own the volumetric
     light and the airborne dust — so the mist authored here is deliberately
     thin (peak alpha 0.20) and exists to be a LOCAL source at the collar for
     those beams to catch, not to be the drive's atmosphere. If it reads as
     fog on its own, it is wrong.

     WIND UNDERGROUND IS NOT ZERO. research/04 requires at least 0.15 m/s of
     air velocity wherever drilling happens, and that fan draught is what
     makes a heading's mist drift instead of hang. So the underground kinds
     carry a small wind coupling (0.04–0.35) rather than the flat 0 the
     cross-section kinds use — a section particle is inside rock; a heading
     particle is standing in a ventilated tunnel.

     NONE OF THESE IS ADDITIVE. The bloom budget documented in the file
     header is untouched by this block: every kind below is a premultiplied
     soft particle whose CEILING (base × colourCurve × emitCurve × 5) is held
     under 1.2, less than half the 2.6 threshold. */

  /* ── RC: the cyclone, and what falls out of it ─────────────────────────
     THE method's image. The sample comes up the INNER tube of a dual-wall
     rod — never the annulus — to a cyclone on its stand, drops through it,
     and is split: 2–3 kg per metre into the bag, the rest onto the bulk
     reject pile beside the rig (research/02-prospecting.md).

     rigFactory already animates a small instanced chip stream on the two
     SPLIT paths (underflow → splitter hopper, assay chute → bag). This does
     NOT duplicate that. What it draws is the seven-eighths that is not
     split: the bulk reject falling clear of the splitter, the fines the
     cyclone loses to the air while it discharges, and the plume the reject
     throws when it lands. Air at the bit is ~25.5 m³/min at 24.1 bar, so
     this is a violent, dry, dusty machine — the research puts it plainly:
     the core rig site is wet, the RC site is dusty. */
  rcChipStream: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'chip', priority: 8,
    life: [0.45, 0.95], size: [0.055, 0.125], drag: 0.25, gravity: 1.0, wind: 0.05,
    turb: [0.02, 2.0], swirl: [0, 0], spin: 6.0, stretch: 0, bounce: 0.25, flow: 0,
    color: '#8A8078',
    sizeCurve:  [[0, 0.9], [0.2, 1.0], [1, 0.9]],
    alphaCurve: [[0, 0], [0.04, 1.0], [0.82, 0.92], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.5, '#E4DED6'], [1, '#B4ADA4']],
    emitCurve:  [[0, 0.40], [1, 0.28]],
    /* Spawned at the REJECT anchor, 1.15 m up, falling — this is the bulk
       reject dropping onto the pile, not the split. rigFactory already
       animates the underflow → splitter → bag path as an instanced mesh and
       drawing a second stream down the same 0.37 m would just thicken it;
       the seven-eighths going over the side is the bigger image anyway, and
       it is what feeds rcRejectDust directly below. */
    emit: { shape: 'cone', r: 0.13, r2: 0, speed: [0.35, 1.15], spread: 0.55, up: -1, yOff: 1.15 },
    rate: 150, burst: 30,
  },
  rcCycloneDust: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'haze', priority: 5,
    life: [1.1, 2.3], size: [0.18, 0.50], drag: 2.2, gravity: 0.02, wind: 0.75,
    turb: [0.16, 0.80], swirl: [0.14, 0.90], spin: 0.40, stretch: 0, bounce: 0, flow: 0,
    color: '#C6B79E',
    sizeCurve:  [[0, 0.45], [0.4, 1.0], [1, 1.6]],
    alphaCurve: [[0, 0], [0.12, 0.34], [0.55, 0.20], [1, 0]],
    colorCurve: [[0, '#FFF6E6'], [1, '#B0A594']],
    emitCurve:  [[0, 0.32], [1, 0.20]],
    emit: { shape: 'cone', r: 0.16, r2: 0, speed: [0.30, 1.00], spread: 1.00, up: 0.25, yOff: 0 },
    rate: 34, burst: 12,
  },
  rcRejectDust: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'smoke', priority: 7,
    life: [1.6, 3.2], size: [0.40, 1.10], drag: 2.0, gravity: 0.03, wind: 0.95,
    turb: [0.24, 0.80], swirl: [0.28, 0.85], spin: 0.50, stretch: 0, bounce: 0, flow: 0,
    color: '#C0AF95',
    sizeCurve:  [[0, 0.40], [0.25, 1.00], [1, 1.75]],
    alphaCurve: [[0, 0], [0.08, 0.58], [0.45, 0.32], [1, 0]],
    colorCurve: [[0, '#F4E6CE'], [0.45, '#CDBB9C'], [1, '#8C857A']],
    emitCurve:  [[0, 0.34], [0.5, 0.26], [1, 0.17]],
    emit: { shape: 'cone', r: 0.55, r2: 0, speed: [0.40, 1.40], spread: 1.05, up: 0.50, yOff: 0.05 },
    rate: 56, burst: 20,
  },
  /* A WET SAMPLE IS NOT A DRY ONE WITH LESS DUST. Below the water table an
     RC sample turns to slurry (research/02): it stops streaming and starts
     SLUGGING — heavy clots that slump out of the underflow and drop in
     lumps. High gravity, near-zero launch speed, and the colour of wet rock
     flour rather than of dust. Driven by d.sampleWet, and it CROSSFADES with
     the dry stream rather than adding to it. */
  rcWetSlug: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'mud', priority: 8,
    life: [0.70, 1.45], size: [0.090, 0.230], drag: 0.90, gravity: 1.15, wind: 0.05,
    turb: [0.03, 1.0], swirl: [0, 0], spin: 2.4, stretch: 0, bounce: 0.06, flow: 0,
    color: '#6E6152',
    sizeCurve:  [[0, 0.8], [0.25, 1.0], [1, 0.9]],
    alphaCurve: [[0, 0], [0.06, 0.96], [0.75, 0.80], [1, 0]],
    colorCurve: [[0, '#E8DCC8'], [0.4, '#BCAB92'], [1, '#6E6254']],
    emitCurve:  [[0, 0.26], [1, 0.18]],
    emit: { shape: 'cone', r: 0.09, r2: 0, speed: [0.15, 0.70], spread: 0.50, up: -1, yOff: 0 },
    rate: 46, burst: 18,
  },
  /* SECTION: the sample rising INSIDE the rod. This is the one detail that
     makes reverse circulation legible as reverse circulation — the annulus
     carries clean air DOWN and the chips come back up the inner tube, which
     is exactly why the sample is uncontaminated by the wall. The `annulus`
     emit shape takes r/r2 as fractions across the annulus where 0 is the rod
     wall; NEGATIVE fractions therefore land inside the rod, which is where
     this belongs. Driving it also suppresses the ordinary annulus column —
     see SECTION_RETURN. Flow coupling is above 1 because the inner-tube
     velocity is higher than an open-hole annulus at the same air rate. */
  rcInnerTube: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'chip', priority: 10,
    life: [2.0, 4.2], size: [0.130, 0.270], drag: 2.4, gravity: 0.30, wind: 0,
    turb: [0.028, 1.40], swirl: [0.040, 2.40], spin: 5.0, stretch: 0, bounce: 0.08, flow: 1.15,
    color: '#8A8078',
    sizeCurve:  [[0, 0.55], [0.10, 1.0], [0.85, 1.0], [1, 0.8]],
    alphaCurve: [[0, 0], [0.05, 1], [0.86, 0.95], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.5, '#E8E4DE'], [1, '#BCB6AE']],
    emitCurve:  [[0, 0.46], [0.12, 0.40], [0.8, 0.32], [1, 0.26]],
    emit: { shape: 'annulus', r: -0.10, r2: -0.55, speed: [0.10, 0.45], spread: 0.40, up: 1, yOff: 0.03 },
    rate: 118, burst: 24,
  },

  /* ── tunnel-jumbo: water flush at the face ─────────────────────────────
     33 l/min at 10–15 bar down a one-pass steel into rock (research/03,
     face jumbo). At that pressure the flush does not run out of the hole,
     it BLOWS BACK off the face — a wide fan of spray around the collar, a
     fine sideways spit off the shank on every blow, grey-brown slurry
     running down, and a mist that hangs in the drive for the light shafts
     to find. research/04 gives the face cues verbatim: the wet grey-brown
     film of rock flour over everything, water spray at the collar, the drill
     steel glinting where the rod rotates. */
  faceSpray: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'drop', priority: 8,
    life: [0.45, 1.00], size: [0.045, 0.110], drag: 0.45, gravity: 1.0, wind: 0.10,
    turb: [0.06, 2.2], swirl: [0, 0], spin: 0, stretch: 0.22, bounce: 0.15, flow: 0,
    color: '#CFE4EC',
    sizeCurve:  [[0, 0.8], [0.2, 1], [1, 0.7]],
    alphaCurve: [[0, 0], [0.05, 0.92], [0.72, 0.72], [1, 0]],
    colorCurve: [[0, '#F0FAFF'], [1, '#96AEB8']],
    emitCurve:  [[0, 0.40], [1, 0.24]],
    emit: { shape: 'cone', r: 0.14, r2: 0, speed: [2.2, 5.4], spread: 1.15, up: 0.25, yOff: 0.02 },
    rate: 124, burst: 32,
  },
  /* THIN ON PURPOSE. Another agent owns the drive's volumetric light and its
     airborne dust; this is the LOCAL source at the collar those beams are
     meant to catch, so its peak alpha is 0.20 against sprayMist's 0.30 and
     its life is long enough (3–6 s) to drift out of a beam rather than die
     inside it. If the drive ever reads as foggy, cut this first. */
  faceMist: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'haze', priority: 5,
    life: [3.0, 6.0], size: [0.55, 1.50], drag: 2.6, gravity: -0.015, wind: 0.35,
    turb: [0.30, 0.35], swirl: [0.22, 0.50], spin: 0.18, stretch: 0, bounce: 0, flow: 0,
    color: '#C8D6DC',
    sizeCurve:  [[0, 0.42], [0.35, 1.0], [1, 1.85]],
    alphaCurve: [[0, 0], [0.14, 0.20], [0.55, 0.12], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [1, '#A8B8C0']],
    emitCurve:  [[0, 0.30], [1, 0.18]],
    emit: { shape: 'cone', r: 0.45, r2: 0, speed: [0.25, 0.90], spread: 1.20, up: 0.40, yOff: 0.25 },
    rate: 26, burst: 10,
  },
  faceSlurry: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'mud', priority: 7,
    life: [0.70, 1.55], size: [0.075, 0.190], drag: 0.70, gravity: 1.25, wind: 0.05,
    turb: [0.04, 1.2], swirl: [0, 0], spin: 2.0, stretch: 0, bounce: 0.10, flow: 0,
    color: '#7C6E5C',
    sizeCurve:  [[0, 0.75], [0.25, 1], [1, 0.9]],
    alphaCurve: [[0, 0], [0.06, 0.94], [0.72, 0.76], [1, 0]],
    colorCurve: [[0, '#E0D2BA'], [0.4, '#B4A489'], [1, '#6E6252']],
    emitCurve:  [[0, 0.28], [1, 0.19]],
    emit: { shape: 'cone', r: 0.12, r2: 0, speed: [0.60, 2.00], spread: 0.85, up: -0.15, yOff: 0 },
    rate: 62, burst: 22,
  },
  /* SECTION, heading mode: the flush running back out of the hole at the
     face and down the invert. The `annulus` and `wall` emit shapes place
     particles across a VERTICAL bore and are meaningless in a heading, where
     the bore axis is X — so this uses a plain cone at the BIT anchor, which
     geology walks along the chainage for us. */
  faceWash: {
    band: BAND_SECTION, pass: PASS_SOFT, sprite: 'drop', priority: 8,
    life: [0.60, 1.35], size: [0.140, 0.320], drag: 0.90, gravity: 0.90, wind: 0,
    turb: [0.05, 1.8], swirl: [0, 0], spin: 0, stretch: 0.20, bounce: 0.15, flow: 0,
    color: '#A9C6D2',
    sizeCurve:  [[0, 0.8], [0.25, 1], [1, 0.75]],
    alphaCurve: [[0, 0], [0.05, 0.90], [0.70, 0.68], [1, 0]],
    colorCurve: [[0, '#E2F2FA'], [1, '#7C9CAA']],
    emitCurve:  [[0, 0.40], [1, 0.26]],
    emit: { shape: 'cone', r: 0.35, r2: 0, speed: [0.80, 2.60], spread: 1.25, up: -0.25, yOff: 0 },
    rate: 74, burst: 24,
  },

  /* ── longhole: the uphole comes back down on you ───────────────────────
     research/03 says it twice, and it is the whole reason `uphole-flush` is
     a hazard: in upholes the cuttings have to be lifted AND the water comes
     back down over the operator; cuttings and water come out over the
     machine and visibility is poor. So this emits ABOVE the drill head and
     falls onto it — yOff is POSITIVE and `up` is -1. Downholes are ordinary
     and get the collar spray every water-flush method gets; nothing here
     runs unless d.uphole is true. */
  upholeFlush: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'drop', priority: 9,
    life: [0.50, 1.10], size: [0.055, 0.140], drag: 0.35, gravity: 1.0, wind: 0.06,
    turb: [0.05, 2.4], swirl: [0, 0], spin: 0, stretch: 0.23, bounce: 0.30, flow: 0,
    color: '#C4DCE6',
    sizeCurve:  [[0, 0.85], [0.2, 1], [1, 0.7]],
    alphaCurve: [[0, 0], [0.04, 0.95], [0.74, 0.78], [1, 0]],
    colorCurve: [[0, '#EEFAFF'], [1, '#8FA8B2']],
    emitCurve:  [[0, 0.42], [1, 0.26]],
    emit: { shape: 'cone', r: 0.16, r2: 0, speed: [1.6, 4.0], spread: 0.55, up: -1, yOff: 0.55 },
    rate: 150, burst: 40,
  },
  upholeSludge: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'mud', priority: 8,
    life: [0.60, 1.35], size: [0.075, 0.195], drag: 0.60, gravity: 1.20, wind: 0.04,
    turb: [0.04, 1.4], swirl: [0, 0], spin: 2.6, stretch: 0, bounce: 0.10, flow: 0,
    color: '#75685A',
    sizeCurve:  [[0, 0.8], [0.2, 1], [1, 0.92]],
    alphaCurve: [[0, 0], [0.05, 0.95], [0.72, 0.78], [1, 0]],
    colorCurve: [[0, '#DACDB6'], [0.4, '#A8977E'], [1, '#675C4E']],
    emitCurve:  [[0, 0.26], [1, 0.18]],
    emit: { shape: 'cone', r: 0.18, r2: 0, speed: [0.90, 2.60], spread: 0.70, up: -1, yOff: 0.50 },
    rate: 74, burst: 26,
  },

  /* ── rockbolt: resin, and grout ────────────────────────────────────────
     A resin bolt is installed by pushing cartridges to the back of the hole
     and SPINNING the rebar through them; the cartridges shatter and the
     mixed resin is displaced back down around the bar and out of the collar
     (research/03). What you see at the collar is therefore not a spray — it
     is EXTRUSION: slow, sticky, barely leaving the rock, and it stops dead
     the moment the resin gels. High drag, near-zero launch speed, a size
     curve that swells and then holds.

     The COLOUR IS AN ART CHOICE, NOT A CLAIM: research/03 sources no resin
     colour, so this is neutral putty rather than the safety-orange some
     catalogues use. Nothing user-facing may caption it as fact.

     Grout return is the cable-bolt case — the sourced KPI is literally
     "grout return, embedment length, no voids" — so it is paler, thicker
     and slumps rather than creeping. */
  resinExtrude: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'mud', priority: 7,
    life: [1.40, 2.80], size: [0.055, 0.140], drag: 2.60, gravity: 0.55, wind: 0,
    turb: [0.02, 0.40], swirl: [0.02, 0.40], spin: 0.60, stretch: 0, bounce: 0, flow: 0,
    color: '#6A5F55',
    sizeCurve:  [[0, 0.35], [0.22, 1.0], [0.8, 1.12], [1, 1.05]],
    alphaCurve: [[0, 0], [0.10, 0.94], [0.78, 0.80], [1, 0]],
    colorCurve: [[0, '#D8CCBE'], [0.45, '#A8998A'], [1, '#6C6157']],
    emitCurve:  [[0, 0.24], [1, 0.16]],
    emit: { shape: 'cone', r: 0.055, r2: 0, speed: [0.10, 0.42], spread: 1.30, up: 0.10, yOff: 0 },
    rate: 36, burst: 14,
  },
  groutReturn: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'foam', priority: 7,
    life: [1.80, 3.40], size: [0.070, 0.185], drag: 2.40, gravity: 0.75, wind: 0,
    turb: [0.02, 0.35], swirl: [0.02, 0.30], spin: 0.50, stretch: 0, bounce: 0.04, flow: 0,
    color: '#C9C6BC',
    sizeCurve:  [[0, 0.40], [0.20, 1.0], [0.8, 1.10], [1, 1.0]],
    alphaCurve: [[0, 0], [0.10, 0.92], [0.76, 0.78], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.5, '#DCDAD0'], [1, '#A8A69C']],
    emitCurve:  [[0, 0.30], [1, 0.20]],
    emit: { shape: 'cone', r: 0.060, r2: 0, speed: [0.12, 0.50], spread: 1.20, up: -0.15, yOff: 0 },
    rate: 30, burst: 12,
  },

  /* ── driven-pile: the blow ─────────────────────────────────────────────
     research/05 lists what a pile driver actually watches, in order:
     concrete spalling off the pile head, THE PACKING SQUEEZING OUT, the
     sound of the blow changing from a crack to a dull thud, and on a steel
     pile the head mushrooming. So the blow is two things, driven by two
     different numbers: a dust-and-packing burst that fires on EVERY blow (a
     flat radial ring off the helmet, because the helmet is deliberately
     loose on the pile so it can rotate on an obstruction), and spalling that
     only appears as d.headDamage climbs. A healthy pile driven with a good
     dolly throws dust and nothing else; a damaged one throws concrete.

     There is NO flush and NO annulus on a driven pile — see SECTION_RETURN.
     A pile that emitted cuttings would be the same class of error as a CPT
     that threw particles.

     ══ DO NOT DRIVE ANYTHING HERE FROM d.toeDamage. ═════════════════════
     This method has two channels and they disagree ON PURPOSE.
     `d.setMm` is the LYING instrument: measuredSet = trueSet + broom, so a
     pile whose toe is crushing reads a BETTER set while it destroys itself,
     and that contradiction is the whole lesson of the method.
     `d.toeDamage` is the honest number, and it is honest because nothing
     shows it to the player. The audio agent measured the margin this buys:
     the crush becomes audible at 5.7 s and the gauge inflates at 8.3 s —
     2.6 seconds of lead, earned by NOTICING rather than by reading. A
     particle effect keyed to toeDamage would put the truth on screen before
     the gauge lies, and there would be nothing left to learn.
     So the two kinds below read `d.headDamage` and `d.dollyCondition` and
     nothing else. Both are damage AT THE HEAD, in front of the operator,
     where a real pile driver watches for spalling and for the packing
     squeezing out — a physical consequence you have to notice, on the same
     footing as the sound. The toe stays underground, and stays a secret.
     tools/vfx-methods.mjs asserts this file never reads toeDamage at all.
     ═══════════════════════════════════════════════════════════════════════ */
  pileBurst: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'smoke', priority: 8,
    life: [0.50, 1.15], size: [0.140, 0.430], drag: 3.40, gravity: 0.10, wind: 0.55,
    turb: [0.10, 1.40], swirl: [0.08, 1.20], spin: 1.10, stretch: 0, bounce: 0, flow: 0,
    color: '#C4BCAE',
    sizeCurve:  [[0, 0.35], [0.18, 1.0], [1, 1.95]],
    alphaCurve: [[0, 0], [0.06, 0.72], [0.40, 0.34], [1, 0]],
    colorCurve: [[0, '#F6EEE0'], [0.4, '#CCC2B2'], [1, '#8E877C']],
    emitCurve:  [[0, 0.34], [0.5, 0.24], [1, 0.15]],
    /* BURST 8, NOT 22. drilling.js compresses the 30-100 bpm blow stream to
       about 24 Hz so that every blow can be emitted and the rhythm the player
       hears IS the blow count being logged. At 24 blows a second a burst of 22
       is 528 particles/s and the individual blows merge into one continuous
       fog — the opposite of what a hammer looks like. Eight per blow keeps the
       ring readable as a ring and lands around 170 live. */
    emit: { shape: 'disc', r: 0.32, r2: 0, speed: [1.40, 3.60], spread: 0.60, up: 0.18, yOff: 0.02 },
    rate: 22, burst: 8,
  },
  pileSpall: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'chip', priority: 8,
    life: [0.90, 1.95], size: [0.055, 0.150], drag: 0.30, gravity: 1.0, wind: 0.05,
    turb: [0.02, 1.40], swirl: [0, 0], spin: 5.5, stretch: 0, bounce: 0.22, flow: 0,
    color: '#BEB6A8',
    sizeCurve:  [[0, 0.9], [0.2, 1], [1, 0.95]],
    alphaCurve: [[0, 0], [0.04, 1], [0.82, 0.90], [1, 0]],
    colorCurve: [[0, '#FFFFFF'], [0.5, '#DCD6CA'], [1, '#A29A8E']],
    emitCurve:  [[0, 0.36], [1, 0.24]],
    emit: { shape: 'disc', r: 0.26, r2: 0, speed: [1.20, 3.40], spread: 0.75, up: 0.35, yOff: 0.02 },
    rate: 18, burst: 6,
  },

  /* ── site-investigation: the restraint IS the content ──────────────────
     research/06 is unusually blunt about both halves of this method.

     SPT: "An SPT is a test, not a bit. A 63.5 kg hammer falls 760 mm and you
     count blows. Nothing cuts." So there is one kind, it is a small dry puff
     of disturbed material off the anvil and the casing top on the drop —
     0.055–0.145 m against the collar plume's 0.50–1.30, peak alpha 0.34
     against dustBody's 0.90 — and it fires per BLOW, never continuously.

     CPT: "no mast, no rotation, no dust, no noise beyond the hydraulic
     pack." There is deliberately NO CPT PARTICLE KIND IN THIS FILE, and
     driveFromTelemetry emits nothing at all while the programme is 'cpt'. If
     a later round adds one, that is a regression, not a feature: the
     emptiness is the effect, and the only thing that moves on a CPT is the
     machine. */
  sptPuff: {
    band: BAND_SURFACE, pass: PASS_SOFT, sprite: 'smoke', priority: 4,
    life: [0.50, 1.05], size: [0.055, 0.145], drag: 3.60, gravity: 0.05, wind: 0.50,
    turb: [0.06, 1.0], swirl: [0.04, 0.80], spin: 0.80, stretch: 0, bounce: 0, flow: 0,
    color: '#B9B0A2',
    sizeCurve:  [[0, 0.40], [0.25, 1.0], [1, 1.70]],
    alphaCurve: [[0, 0], [0.08, 0.34], [0.45, 0.18], [1, 0]],
    colorCurve: [[0, '#F0E8DA'], [1, '#9C948A']],
    emitCurve:  [[0, 0.26], [1, 0.16]],
    emit: { shape: 'cone', r: 0.07, r2: 0, speed: [0.30, 1.00], spread: 0.90, up: 0.40, yOff: 0 },
    rate: 14, burst: 7,
  },

  /* ═════ COMPOSITES — the public ids accepted by spawn() ════════════════ */
  collarDust:   { parts: ['dustBody', 'dustPlume', 'dustBacklight'] },
  collarSpray:  { parts: ['sprayDrops', 'sprayMist', 'sprayGlint', 'mudStreak'] },
  foamReturn:   { parts: ['foamClump', 'foamMist'] },
  exhaust:      { parts: ['exhaustSmoke', 'exhaustSoot', 'exhaustLight'] },
  sparks:       { parts: ['sparkStreak', 'sparkEmber'] },
  dustPuff:     { parts: ['puffSoft', 'puffGrit'] },
  rodSmoke:     { parts: ['greaseSmoke', 'greaseWisp'] },
  ambientMotes: { parts: ['motes'] },
  weatherRain:  { parts: ['rainDrop', 'rainSplash'] },
  weatherSnow:  { parts: ['snowFlake'] },
  cuttings:     { parts: ['cuttingChip', 'cuttingFines'] },
  bitImpact:    { parts: ['bitFlash', 'shockRing', 'rockChipSprite'] },
  waterInflow:  { parts: ['waterJet', 'waterGlint', 'waterMist'] },
  collapse:     { parts: ['collapseChunk', 'collapseDust'] },
  cavityFall:   { parts: ['voidDebris', 'voidDust'] },
  groove:       { parts: ['grooveCore', 'grooveTrail', 'grooveSurface'] },
  holeComplete: { parts: ['flourish', 'flourishSpark'] },

  /* The six new methods, as public ids. `rcCyclone` is the dry sample train
     and `rcWet` its wet counterpart; they are alternatives, never both. */
  rcCyclone:    { parts: ['rcChipStream', 'rcCycloneDust', 'rcRejectDust'] },
  rcWet:        { parts: ['rcWetSlug', 'rcRejectDust'] },
  rcReturn:     { parts: ['rcInnerTube'] },
  faceFlush:    { parts: ['faceSpray', 'faceMist', 'faceSlurry'] },
  faceReturn:   { parts: ['faceWash'] },
  upholeReturn: { parts: ['upholeFlush', 'upholeSludge'] },
  boltResin:    { parts: ['resinExtrude'] },
  boltGrout:    { parts: ['groutReturn'] },
  pileBlow:     { parts: ['pileBurst', 'pileSpall'] },
  sptBlow:      { parts: ['sptPuff'] },

  /* Non-particle effects. Handled by their own dedicated systems but listed
     here so the table is the single place a tuner looks. */
  heatShimmer: {
    special: 'shimmer',
    // Authored for the fallback, because the fallback is the shipping path.
    // At the old strength 0.55 a hard-working engine produced a peak alpha of
    // 0.089 and an idling one 0.011 — i.e. the effect was mathematically
    // present and optically absent in every frame taken of this build.
    strength: 1.05,       // 0..1+ master gain on the mask
    scale: 3.6,           // noise cells across the band (bigger cells)
    rise: 0.95,           // how fast the cells climb
    chroma: 0.55,         // warm fringe on each cell's leading edge
    haze: 0.34,           // fallback opacity per unit of |boil|
    groundBand: 0.34,     // how far up the band the ground haze reaches
    // Grab-pass refraction is DISABLED. The scene is composited through an
    // EffectComposer whose render target is multisampled, and
    // copyFramebufferToTexture from a multisampled FBO returns nothing on
    // several drivers — without throwing. Because grab mode also switches the
    // quad to NoBlending, the failure mode was an opaque BLACK DISC sitting
    // over the rig, not a missing effect. The authored haze fallback is
    // indistinguishable at this scale and cannot fail. Re-enable only behind a
    // verified non-black readback test on real devices.
    refraction: false,
  },
  birds: {
    special: 'birds',
    // FRAMING. The hero camera sits at (7.4, 5.0, 9.6) looking at (0, 3.2, 0)
    // with a 42 deg vertical fov, so its half-angle is 21 deg and it is
    // already pitched 8.5 deg down. A bird at the old radius 26-48 m and
    // altitude 14-26 m subtends 25-35 deg ABOVE the camera axis — every flock
    // this system has ever spawned was off the top of the frame. At r = 17-32
    // and h = 7.5-12.5 the flock lands in the upper third of the surface band,
    // above the mast, which is where it belongs compositionally.
    flock: [7, 13],       // birds per flock
    radius: [17, 32],     // orbit radius, m
    height: [7.5, 12.5],  // altitude above the collar, m
    speed: [0.055, 0.115],// orbit rad/s -> 19-42 CSS px/s of travel
    flap: [2.6, 4.4],     // wingbeats/s
    span: [0.70, 1.15],   // half-span, m -> 24-40 px wingtip to wingtip
    color: '#20242A',
    interval: [12, 28],   // seconds between spontaneous flocks
  },
  chips: {
    special: 'meshChips', // real geometry chips (InstancedMesh, lit octahedra)
    life: [0.7, 1.8],
    size: [0.100, 0.240],
    drag: 0.9, gravity: 1.05, bounce: 0.34, spin: [4, 16],
    burst: 12,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Which flushing medium a method returns at the collar. Drives whether the
   surface band shows dust (air), spray (water/mud) or foam.
   ═══════════════════════════════════════════════════════════════════════════ */
export const FLUSH_MEDIUM = {
  auger: 'none', 'cable-tool': 'water', 'top-hammer': 'air', dth: 'air',
  overburden: 'air', core: 'water', 'rotary-kelly': 'none', cfa: 'none',
  'cased-cfa': 'none', hdd: 'mud', sonic: 'water', 'jet-grouting': 'mud',
  anchor: 'air', dw: 'mud', displacement: 'none', 'soil-mixing': 'mud',
  'raise-boring': 'water', microtunnelling: 'mud', 'pipe-bursting': 'none',
  'auger-boring': 'none', vibro: 'none', 'dynamic-compaction': 'none',
  /* THE SIX NEW METHODS. Without these six lines every one of them fell
     through to the 'air' default, which is a real bug and not a cosmetic
     one: a DRIVEN PILE, which circulates nothing at all, was emitting the
     full three-stage air-flush collar plume. RC is genuinely air (25.5
     m³/min at 24.1 bar); the three underground percussive methods are
     water at 10–15 bar; site investigation is a wash boring, so water,
     and its CPT half is suppressed outright in driveFromTelemetry. */
  rc: 'air',
  'tunnel-jumbo': 'water',
  longhole: 'water',
  rockbolt: 'water',
  'driven-pile': 'none',
  'site-investigation': 'water',
};

/* ═══════════════════════════════════════════════════════════════════════════
   What the CROSS-SECTION shows coming back up the hole. The default is the
   ordinary annulus column (`cuttingChip` + `cuttingFines`), which assumes a
   vertical hole with rock on the outside and a rod up the middle. Three of
   the new methods break that assumption and one of them inverts it:

     'inner'   reverse circulation. The chips come up the INSIDE of a
               dual-wall rod and the annulus carries clean air DOWN. Drawing
               cuttings in the annulus here would contradict the name of the
               method, so the annulus column is replaced, not supplemented.
     'face'    a heading (tunnel-jumbo, rockbolt). The bore axis is X, so the
               `annulus` and `wall` emit shapes — which lay particles out
               across a VERTICAL bore — would put the column sideways across
               the drive. The flush washes back out of the face instead.
     'none'    nothing circulates. A driven pile makes no hole and a CPT
               makes no cuttings; both would otherwise inherit an annulus
               column out of a method that has no annulus.

   Keyed by method id, and by 'cpt' as well, because the piezocone replaces
   its parent method wholesale rather than being a mode of it.
   ═══════════════════════════════════════════════════════════════════════════ */
export const SECTION_RETURN = {
  rc: 'inner',
  'tunnel-jumbo': 'face',
  rockbolt: 'face',
  'driven-pile': 'none',
  cpt: 'none',
};

/* ═══════════════════════════════════════════════════════════════════════════
   THE THREE METHODS THAT HAPPEN IN A DRIVE. This is a fallback, not the
   authority: `ctx.env.undergroundId` is the live one and is preferred
   wherever it exists, because env owns the mode switch and has a documented
   single-writer rule about it. Two things in this file depend on knowing:

     — env maintains `sunColor` / `sunDirection` only on its SURFACE path, so
       underground they hold the last daylight values the tab ever saw. Any
       sun-driven kind (the exhaust backlight rim is the only one driven, and
       `sunTint` / `sunBias` more generally) must stand down in a tube rather
       than rim-light a machine with a sun that is not there.
     — env's raymarched medium is the drive's atmosphere. Nothing here is
       allowed to compete with it; see the note on the six-method block.
   ═══════════════════════════════════════════════════════════════════════════ */
export const UNDERGROUND_METHODS = { 'tunnel-jumbo': 1, longhole: 1, rockbolt: 1 };

/* Live-particle budget per quality tier (HIGH ~12k, LOW ~3k). */
const TIER_BUDGET = { high: 12000, medium: 7000, low: 3000 };

/* How the budget is split between the four pooled passes. The additive
   surface pass carries motes, sparks, embers, the backlit dust halo and the
   groove — five live systems — so 0.16 of the budget left it saturated while
   surfaceSoft sat two-thirds empty. */
const POOL_SHARE = { surfaceSoft: 0.36, surfaceAdd: 0.24, sectionSoft: 0.28, sectionAdd: 0.12 };

/* Emission demand by tier. TIER_BUDGET scales pool CAPACITY 1 : 0.58 : 0.25,
   but nothing scaled the authored RATES, so a small tier ran permanently
   inside canSpawn()'s shedding ladder: reactive, thrashy, and — because the
   ladder only looks at the free fraction — capable of starving priority-9
   sparks behind priority-1 dust motes that got there first. Ask for less up
   front instead, and weight the cut by priority so the shots that matter
   (cuttings 10, plume 8, sparks 9) give up the least. The ladder stays exactly
   as it was; it just stops being the primary mechanism. */
const TIER_DEMAND = { high: 1.0, medium: 0.80, low: 0.50 };

const CURVE_RES = 256;  // samples per baked curve row
const ATLAS_CELL = 256; // px per atlas cell (4x4 -> 1024x1024)
const GRAV = 9.81;
const MIN_DRAG = 0.05;  // keeps the analytic solution numerically stable

/* The cross-section is a cutaway. Geology's face slab sits on z = 0 and the
   bore is carved out of it, so particles spawned at z = 0 are co-planar with
   the rock they are supposed to be in front of. Push them a hand's width
   toward the (orthographic, therefore parallax-free) camera. Must stay below
   geology's water line at z = 0.78. */
const SECTION_Z_BIAS = 0.16;

/* ═══════════════════════════════════════════════════════════════════════════
   PROCEDURAL TEXTURES
   Everything the system draws with is generated here at boot. No image files,
   no CDN, no dependency on ctx.assets — this module is self-sufficient.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Deterministic value noise + fbm, used to erode smoke/foam/mud alpha so the
   puffs read as real turbulent volumes instead of gaussian blobs. */
function hash2(x, y, s) {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}
function vnoise(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, s);
  const b = hash2(ix + 1, iy, s);
  const c = hash2(ix, iy + 1, s);
  const d = hash2(ix + 1, iy + 1, s);
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}
function fbm(x, y, s, oct) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += amp * vnoise(x * f, y * f, s + i * 17.3); f *= 2.03; amp *= 0.5; }
  return v;
}

function newCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

/**
 * Builds the 4x4 sprite atlas. Noise-eroded cells are rasterised at 128px into
 * a scratch canvas and upscaled with smoothing — that is both ~4x faster than
 * rasterising at 256 and gives softer, more organic edges than raw noise.
 */
function makeSpriteAtlas() {
  const S = ATLAS_CELL;
  const atlas = newCanvas(S * 4, S * 4);
  const g = atlas.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.clearRect(0, 0, atlas.width, atlas.height);

  const N = 128;
  const scratch = newCanvas(N, N);
  const sg = scratch.getContext('2d');
  const img = sg.createImageData(N, N);
  const px = img.data;

  const cellX = (i) => (i % 4) * S;
  const cellY = (i) => Math.floor(i / 4) * S;

  /* --- noise-eroded cells ------------------------------------------------ */
  // fn(nx, ny, seed) -> { a: alpha, l: luminance }, nx/ny in -1..1.
  // Internal shading is baked into rgb for smoke/foam/mud so the volumes have
  // self-occlusion rather than reading as flat decals.
  function rasterNoiseShaded(index, seed, fn) {
    for (let y = 0; y < N; y++) {
      const ny = (y + 0.5) / N * 2 - 1;
      for (let x = 0; x < N; x++) {
        const nx = (x + 0.5) / N * 2 - 1;
        const o = (y * N + x) * 4;
        const r = fn(nx, ny, seed);
        const v = Math.max(0, Math.min(255, Math.round(r.l * 255)));
        px[o] = px[o + 1] = px[o + 2] = v;
        px[o + 3] = Math.max(0, Math.min(255, Math.round(r.a * 255)));
      }
    }
    sg.putImageData(img, 0, 0);
    g.drawImage(scratch, cellX(index) + 5, cellY(index) + 5, S - 10, S - 10);
  }

  const sstep = (e0, e1, v) => { const t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

  // 0 smoke — billowing puff, fbm-eroded, shaded darker on the lower-left so
  // the plume has an implied light direction.
  rasterNoiseShaded(SPRITES.smoke, 3.1, (nx, ny) => {
    const r = Math.sqrt(nx * nx + ny * ny);
    const n = fbm(nx * 2.4 + 5, ny * 2.4 + 5, 3.1, 4);
    const warped = r + (n - 0.5) * 0.62;
    const a = sstep(1.0, 0.20, warped);
    const n2 = fbm(nx * 4.5 + 11, ny * 4.5 + 3, 7.7, 3);
    const l = 0.62 + 0.38 * n2 + 0.16 * (0.5 - ny) - 0.10 * nx;
    return { a: a * (0.55 + 0.45 * n2), l };
  });

  // 1 wisp — anisotropic, heavily eroded dissipation tail.
  rasterNoiseShaded(SPRITES.wisp, 9.4, (nx, ny) => {
    const r = Math.sqrt(nx * nx * 2.6 + ny * ny * 0.7);
    const n = fbm(nx * 3.6 + 2, ny * 1.6 + 8, 9.4, 4);
    const a = sstep(1.0, 0.15, r + (n - 0.5) * 0.95) * (0.35 + 0.65 * n);
    return { a: a * 0.85, l: 0.7 + 0.3 * n };
  });

  // 7 foam — clumped bubbles with bright rims.
  rasterNoiseShaded(SPRITES.foam, 21.2, (nx, ny) => {
    const r = Math.sqrt(nx * nx + ny * ny);
    const cells = fbm(nx * 5.2 + 3, ny * 5.2 + 7, 21.2, 3);
    const rim = Math.abs(cells - 0.5) * 2;
    const a = sstep(1.0, 0.35, r + (cells - 0.5) * 0.35);
    return { a: a * (0.62 + 0.38 * rim), l: 0.74 + 0.30 * rim };
  });

  // 11 mud — irregular, dark, wet-looking blob with a hard-ish edge.
  rasterNoiseShaded(SPRITES.mud, 44.8, (nx, ny) => {
    const r = Math.sqrt(nx * nx * 1.15 + ny * ny * 0.9);
    const n = fbm(nx * 3.1 + 13, ny * 3.1 + 2, 44.8, 3);
    const a = sstep(0.98, 0.55, r + (n - 0.5) * 0.42);
    return { a, l: 0.42 + 0.5 * n + 0.22 * sstep(0.6, 0.0, r) };
  });

  // 13 haze — very soft, low-contrast veil, faintly structured.
  rasterNoiseShaded(SPRITES.haze, 66.1, (nx, ny) => {
    const r = Math.sqrt(nx * nx + ny * ny);
    const n = fbm(nx * 1.7 + 21, ny * 1.7 + 9, 66.1, 3);
    const a = sstep(1.0, 0.0, r) * (0.55 + 0.45 * n) * 0.72;
    return { a, l: 0.92 + 0.08 * n };
  });

  // 4 chip — angular rock flake silhouette with one lit facet.
  rasterNoiseShaded(SPRITES.chip, 88.3, (nx, ny) => {
    const ang = Math.atan2(ny, nx);
    const r = Math.sqrt(nx * nx + ny * ny);
    const facets = 0.62 + 0.30 * vnoise(Math.cos(ang) * 2.2 + 4, Math.sin(ang) * 2.2 + 4, 88.3);
    const a = r < facets ? 1 : sstep(facets + 0.16, facets, r);
    const lit = 0.42 + 0.58 * sstep(0.9, -0.6, ny + nx * 0.4);
    return { a, l: lit };
  });

  /* --- analytic cells ---------------------------------------------------- */
  function withCell(index, fn) {
    g.save();
    g.translate(cellX(index) + S * 0.5, cellY(index) + S * 0.5);
    fn(g, S * 0.5 - 6);
    g.restore();
  }

  // 2 spark — a blown-out core with a soft streak, drawn vertically so the
  // shader's velocity-stretch elongates along the +Y axis of the quad.
  withCell(SPRITES.spark, (c, R) => {
    const grad = c.createLinearGradient(0, -R, 0, R);
    grad.addColorStop(0.00, 'rgba(255,255,255,0)');
    grad.addColorStop(0.32, 'rgba(255,255,255,0.55)');
    grad.addColorStop(0.50, 'rgba(255,255,255,1)');
    grad.addColorStop(0.68, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1.00, 'rgba(255,255,255,0)');
    c.fillStyle = grad;
    for (let i = 0; i < 5; i++) {
      c.globalAlpha = 0.34 - i * 0.05;
      const w = R * (0.10 + i * 0.11);
      c.fillRect(-w, -R, w * 2, R * 2);
    }
    c.globalAlpha = 1;
    const core = c.createRadialGradient(0, 0, 0, 0, 0, R * 0.34);
    core.addColorStop(0, 'rgba(255,255,255,1)');
    core.addColorStop(0.45, 'rgba(255,255,255,0.7)');
    core.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = core;
    c.beginPath(); c.arc(0, 0, R * 0.34, 0, TAU); c.fill();
  });

  // 6 glow — clean gaussian-ish radial falloff. The universal additive base.
  withCell(SPRITES.glow, (c, R) => {
    const grad = c.createRadialGradient(0, 0, 0, 0, 0, R);
    grad.addColorStop(0.00, 'rgba(255,255,255,1)');
    grad.addColorStop(0.18, 'rgba(255,255,255,0.72)');
    grad.addColorStop(0.42, 'rgba(255,255,255,0.26)');
    grad.addColorStop(0.72, 'rgba(255,255,255,0.06)');
    grad.addColorStop(1.00, 'rgba(255,255,255,0)');
    c.fillStyle = grad;
    c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
  });

  // 14 ember — round with a hotter rim than core, so cooling reads outward-in.
  withCell(SPRITES.ember, (c, R) => {
    const grad = c.createRadialGradient(0, 0, 0, 0, 0, R);
    grad.addColorStop(0.00, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.38, 'rgba(255,255,255,1)');
    grad.addColorStop(0.58, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1.00, 'rgba(255,255,255,0)');
    c.fillStyle = grad;
    c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
  });

  // 8 mote — tiny dot with a faint 4-point sparkle so motes twinkle in the sun.
  withCell(SPRITES.mote, (c, R) => {
    const grad = c.createRadialGradient(0, 0, 0, 0, 0, R * 0.42);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = grad;
    c.beginPath(); c.arc(0, 0, R * 0.42, 0, TAU); c.fill();
    const sp = c.createLinearGradient(-R, 0, R, 0);
    sp.addColorStop(0.0, 'rgba(255,255,255,0)');
    sp.addColorStop(0.5, 'rgba(255,255,255,0.30)');
    sp.addColorStop(1.0, 'rgba(255,255,255,0)');
    c.fillStyle = sp;
    c.fillRect(-R, -R * 0.035, R * 2, R * 0.07);
    c.save(); c.rotate(Math.PI / 2);
    c.fillRect(-R, -R * 0.035, R * 2, R * 0.07);
    c.restore();
  });

  // 3 drop — teardrop with a specular highlight and a bright meniscus rim.
  withCell(SPRITES.drop, (c, R) => {
    c.beginPath();
    c.moveTo(0, -R);
    c.bezierCurveTo(R * 0.62, -R * 0.28, R * 0.70, R * 0.42, 0, R);
    c.bezierCurveTo(-R * 0.70, R * 0.42, -R * 0.62, -R * 0.28, 0, -R);
    c.closePath();
    const body = c.createRadialGradient(-R * 0.22, R * 0.18, 0, 0, R * 0.12, R);
    body.addColorStop(0.00, 'rgba(255,255,255,0.95)');
    body.addColorStop(0.55, 'rgba(255,255,255,0.62)');
    body.addColorStop(0.88, 'rgba(255,255,255,0.85)');
    body.addColorStop(1.00, 'rgba(255,255,255,0.15)');
    c.fillStyle = body; c.fill();
    const spec = c.createRadialGradient(-R * 0.26, R * 0.12, 0, -R * 0.26, R * 0.12, R * 0.30);
    spec.addColorStop(0, 'rgba(255,255,255,1)');
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = spec;
    c.beginPath(); c.arc(-R * 0.26, R * 0.12, R * 0.30, 0, TAU); c.fill();
  });

  // 5 ring — the percussive shock front. Sharp leading edge, soft trailing.
  withCell(SPRITES.ring, (c, R) => {
    const grad = c.createRadialGradient(0, 0, 0, 0, 0, R);
    grad.addColorStop(0.00, 'rgba(255,255,255,0)');
    grad.addColorStop(0.58, 'rgba(255,255,255,0)');
    grad.addColorStop(0.76, 'rgba(255,255,255,0.30)');
    grad.addColorStop(0.90, 'rgba(255,255,255,1)');
    grad.addColorStop(0.97, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1.00, 'rgba(255,255,255,0)');
    c.fillStyle = grad;
    c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
  });

  // 12 flash — starburst for the bit crack.
  withCell(SPRITES.flash, (c, R) => {
    const core = c.createRadialGradient(0, 0, 0, 0, 0, R * 0.55);
    core.addColorStop(0.0, 'rgba(255,255,255,1)');
    core.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    core.addColorStop(1.0, 'rgba(255,255,255,0)');
    c.fillStyle = core;
    c.beginPath(); c.arc(0, 0, R * 0.55, 0, TAU); c.fill();
    for (let i = 0; i < 8; i++) {
      c.save();
      c.rotate((i / 8) * TAU + 0.19);
      const len = R * (i % 2 === 0 ? 1.0 : 0.62);
      const sp = c.createLinearGradient(0, 0, 0, -len);
      sp.addColorStop(0, 'rgba(255,255,255,0.85)');
      sp.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = sp;
      c.beginPath();
      c.moveTo(-R * 0.055, 0); c.lineTo(0, -len); c.lineTo(R * 0.055, 0);
      c.closePath(); c.fill();
      c.restore();
    }
  });

  // 15 plume — the diesel column's own volume. (Noise-eroded, so it uses the
  // rasteriser above rather than withCell; it lives here because it replaced
  // the `shard` crack, which no effect in the table ever sampled.)
  //
  // Two erosion octaves at a non-integer frequency ratio give a silhouette
  // that never repeats around the rim, and an UNCONDITIONAL radial guard
  // drives alpha to exactly 0 by r = 0.92 — inside the quad's mid-edges
  // (r = 1.0) and far inside its corners (r = 1.41). `smoke` cannot do that:
  // its erosion subtracts from r before an sstep whose outer edge sits at
  // exactly r = 1.0, so it measures 0.280 alpha outside r = 0.92, 0.110 in
  // the corners and 0.073 in its outermost texel ring — a rounded square,
  // hard-cut. That is the "soft square sprite boundary" the round-2 review
  // measured on the exhaust column. This cell measures 0.000 past r = 0.92.
  // Coverage inside the guard is 47.9 % of the quad at mean alpha 0.233, so
  // the silhouette that actually rasterises is ~0.88 of the authored world
  // size once the 5 px cell inset is counted.
  //
  // Luminance carries internal density plus a lit lobe toward the top of the
  // sprite, so a puff is self-shaded rather than a flat decal. Exhaust spin
  // is deliberately low (0.35-0.45 rad/s) so that lobe stays roughly stable
  // instead of tumbling the implied light direction around.
  rasterNoiseShaded(SPRITES.plume, 137.7, (nx, ny) => {
    const r = Math.sqrt(nx * nx + ny * ny);
    const n1 = fbm(nx * 1.9 + 17, ny * 1.9 + 5, 137.7, 4);
    const n2 = fbm(nx * 4.3 + 3, ny * 4.3 + 29, 61.3, 3);
    const a = sstep(0.86, 0.14, r + (n1 - 0.5) * 0.66 + (n2 - 0.5) * 0.20);
    const guard = sstep(0.92, 0.62, r);
    const l = 0.52 + 0.40 * n2 + 0.18 * (0.5 - ny) - 0.10 * nx;
    return { a: a * guard * 0.94, l };
  });

  // 9 rain — thin, soft-ended vertical streak.
  withCell(SPRITES.rain, (c, R) => {
    const grad = c.createLinearGradient(0, -R, 0, R);
    grad.addColorStop(0.00, 'rgba(255,255,255,0)');
    grad.addColorStop(0.22, 'rgba(255,255,255,0.85)');
    grad.addColorStop(0.80, 'rgba(255,255,255,0.95)');
    grad.addColorStop(1.00, 'rgba(255,255,255,0)');
    c.fillStyle = grad;
    c.fillRect(-R * 0.10, -R, R * 0.20, R * 2);
    c.globalAlpha = 0.35;
    c.fillRect(-R * 0.22, -R, R * 0.44, R * 2);
    c.globalAlpha = 1;
  });

  // 10 snow — six-arm dendritic flake.
  withCell(SPRITES.snow, (c, R) => {
    c.strokeStyle = 'rgba(255,255,255,0.92)';
    c.lineCap = 'round';
    c.lineWidth = R * 0.085;
    for (let i = 0; i < 6; i++) {
      c.save();
      c.rotate((i / 6) * TAU);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -R * 0.88); c.stroke();
      c.lineWidth = R * 0.055;
      for (let k = 1; k <= 2; k++) {
        const y = -R * (0.34 + k * 0.24);
        const l = R * (0.24 - k * 0.06);
        c.beginPath(); c.moveTo(0, y); c.lineTo(l, y - l * 0.7); c.stroke();
        c.beginPath(); c.moveTo(0, y); c.lineTo(-l, y - l * 0.7); c.stroke();
      }
      c.lineWidth = R * 0.085;
      c.restore();
    }
    const core = c.createRadialGradient(0, 0, 0, 0, 0, R * 0.24);
    core.addColorStop(0, 'rgba(255,255,255,0.9)');
    core.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = core;
    c.beginPath(); c.arc(0, 0, R * 0.24, 0, TAU); c.fill();
  });

  const tex = new THREE.CanvasTexture(atlas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ── curve baking ─────────────────────────────────────────────────────────
   Every art-directed curve in EFFECTS is sampled into one RGBA lookup texture,
   two rows per effect kind:
     row 2k   : rgb = colour ramp (linear working space), a = alpha over life
     row 2k+1 : r = size multiplier / SIZE_SCALE, g = stretch / STRETCH_SCALE,
                b = reserved, a = emissive (x EMIT_SCALE in the shader)
   NearestFilter on both axes so rows never bleed into each other; 256 samples
   per row is far more than enough to look continuous.
   ───────────────────────────────────────────────────────────────────────── */
const SIZE_SCALE = 4.0;
const STRETCH_SCALE = 0.25;
const EMIT_SCALE = 5.0;

function samplePoints(points, t) {
  const n = points.length;
  if (n === 0) return 0;
  if (t <= points[0][0]) return points[0][1];
  if (t >= points[n - 1][0]) return points[n - 1][1];
  for (let i = 1; i < n; i++) {
    if (t <= points[i][0]) {
      const a = points[i - 1], b = points[i];
      const span = b[0] - a[0];
      const f = span <= 0 ? 0 : (t - a[0]) / span;
      return a[1] + (b[1] - a[1]) * f;
    }
  }
  return points[n - 1][1];
}

const _cA = new THREE.Color();
const _cB = new THREE.Color();
function sampleColorPoints(points, t, out) {
  const n = points.length;
  if (n === 0) { out.setRGB(1, 1, 1); return out; }
  if (n === 1 || t <= points[0][0]) { out.set(points[0][1]); return out; }
  if (t >= points[n - 1][0]) { out.set(points[n - 1][1]); return out; }
  for (let i = 1; i < n; i++) {
    if (t <= points[i][0]) {
      const a = points[i - 1], b = points[i];
      const span = b[0] - a[0];
      const f = span <= 0 ? 0 : (t - a[0]) / span;
      _cA.set(a[1]); _cB.set(b[1]);
      out.setRGB(
        _cA.r + (_cB.r - _cA.r) * f,
        _cA.g + (_cB.g - _cA.g) * f,
        _cA.b + (_cB.b - _cA.b) * f,
      );
      return out;
    }
  }
  out.set(points[n - 1][1]);
  return out;
}

function bakeCurveTexture(kinds) {
  const rows = kinds.length * 2;
  const data = new Uint8Array(CURVE_RES * rows * 4);
  const c = new THREE.Color();
  const q = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));

  for (let k = 0; k < kinds.length; k++) {
    const def = kinds[k].def;
    const rowA = (k * 2) * CURVE_RES * 4;
    const rowB = (k * 2 + 1) * CURVE_RES * 4;
    const stretch = Math.min(1, (def.stretch || 0) / STRETCH_SCALE);
    for (let i = 0; i < CURVE_RES; i++) {
      const t = i / (CURVE_RES - 1);
      sampleColorPoints(def.colorCurve, t, c);
      const o = rowA + i * 4;
      data[o] = q(c.r); data[o + 1] = q(c.g); data[o + 2] = q(c.b);
      data[o + 3] = q(samplePoints(def.alphaCurve, t));
      const o2 = rowB + i * 4;
      data[o2] = q(samplePoints(def.sizeCurve, t) / SIZE_SCALE);
      data[o2 + 1] = q(stretch);
      data[o2 + 2] = 128;
      data[o2 + 3] = q(samplePoints(def.emitCurve, t));
    }
  }

  const tex = new THREE.DataTexture(data, CURVE_RES, rows, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHADERS
   ═══════════════════════════════════════════════════════════════════════════ */

const F = (v) => v.toFixed(5);

/* The particle vertex shader. Everything a live particle does happens here —
   the CPU only ever wrote the spawn state. See the header for the derivation
   of the closed-form drag/gravity/wind integral. */
const PARTICLE_VERT = /* glsl */`
attribute vec3 iPos;
attribute vec3 iVel;
attribute vec3 iCol;
attribute vec4 iA;    // birth, life, size, seed
attribute vec4 iB;    // kind, sprite, drag, gravityScale
attribute vec4 iC;    // turbAmp, turbFreq, windScale, restitution
attribute vec4 iD;    // birthPhase, flowScale, swirlRadius, swirlSpin
attribute float iSpin;

uniform float uTime;
uniform vec3  uWind;
uniform float uGravity;
uniform sampler2D uCurve;
uniform float uCurveRows;
uniform float uFlowPhase;
uniform float uFloorY;
uniform float uCeilY;
uniform float uFade;
uniform float uStress;
uniform float uStretchK;
uniform float uNear0;
uniform float uNear1;
uniform float uFar0;
uniform float uFar1;

varying vec2  vUv;
varying vec3  vColor;
varying float vAlpha;
varying float vViewZ;

void main() {
  float life  = iA.y;
  float age   = uTime - iA.x;
  float u     = life > 0.0 ? age / life : 2.0;

  if (age < 0.0 || u >= 1.0) {
    // Dead slot: collapse the quad off-screen. No CPU work needed to recycle
    // the buffer, which is what makes zero per-frame upload possible.
    vUv = vec2(0.0); vColor = vec3(0.0); vAlpha = 0.0; vViewZ = 0.0;
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }

  // ── analytic linear-drag motion ──────────────────────────────────────────
  float k    = max(iB.z, ${F(MIN_DRAG)});
  vec3  grav = vec3(0.0, -uGravity * iB.w, 0.0);
  vec3  wind = uWind * iC.z;
  vec3  vInf = grav / k + wind;
  float e    = exp(-k * age);
  vec3  p    = iPos + (iVel - vInf) * ((1.0 - e) / k) + vInf * age;
  vec3  vel  = vInf + (iVel - vInf) * e;

  // ── turbulence: non-repeating drift that grows with age ──────────────────
  float sd = iA.w;
  float ph = age * iC.y + sd * 31.41593;
  vec3 turb = vec3(
    sin(ph * 1.13 + sd * 11.0) + 0.5 * sin(ph * 2.31 + sd *  5.0),
    sin(ph * 0.91 + sd *  7.0) + 0.5 * sin(ph * 1.77 + sd *  3.0),
    sin(ph * 1.07 + sd * 13.0) + 0.5 * sin(ph * 2.11 + sd *  9.0)
  );
  p += turb * (iC.x * age * (0.35 + 0.65 * u));

  // ── curl / helix: what makes a plume billow instead of cone ──────────────
  if (iD.z > 0.0) {
    float a    = sd * 6.2831853 + age * iD.w;
    float grow = iD.z * (0.25 + 0.75 * u);
    p.x += cos(a) * grow;
    p.z += sin(a) * grow;
    vel.x -= sin(a) * grow * iD.w;
    vel.z += cos(a) * grow * iD.w;
  }

  // ── annulus flow: rise distance is the CPU-integrated flush phase, so a
  //    live flushing change re-times the entire cuttings column at once ─────
  p.y += (uFlowPhase - iD.x) * iD.y;

  // Anything riding the annulus dissolves at the collar rather than shooting
  // out of the top of the cross-section band.
  float ceilFade = 1.0;
  if (iD.y > 0.0) {
    p.y = min(p.y, uCeilY);
    ceilFade = 1.0 - smoothstep(uCeilY - 0.55, uCeilY - 0.02, p.y);
  }

  // ── jam / stress tremor ──────────────────────────────────────────────────
  if (uStress > 0.0) {
    float j = uStress * 0.013;
    p.x += sin(uTime * 47.0 + sd * 90.0) * j;
    p.y += cos(uTime * 53.0 + sd * 70.0) * j;
  }

  // ── damped bounce against the collar / hole-bottom plane ─────────────────
  if (iC.w > 0.0) {
    float below = uFloorY - p.y;
    if (below > 0.0) {
      p.y = uFloorY + below * iC.w * exp(-below * 2.2);
      vel.y = -vel.y * iC.w * 0.4;
    }
  }

  // ── art-directed curves ──────────────────────────────────────────────────
  vec4 c0 = texture2D(uCurve, vec2(u, (iB.x * 2.0 + 0.5) / uCurveRows));
  vec4 c1 = texture2D(uCurve, vec2(u, (iB.x * 2.0 + 1.5) / uCurveRows));

  float size  = iA.z * c1.r * ${F(SIZE_SCALE)};
  vColor      = iCol * c0.rgb * (c1.a * ${F(EMIT_SCALE)});
  float alpha = c0.a * uFade * ceilFade;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vViewZ  = -mv.z;

  // ── billboard: velocity-stretched for streaks, spun otherwise ────────────
  vec2 corner = position.xy;
  vec2 off;
  float st = c1.g * ${F(STRETCH_SCALE)};
  if (st > 0.0001) {
    vec3 vv = (modelViewMatrix * vec4(vel, 0.0)).xyz;
    float sp = length(vv.xy);
    vec2 dir = sp > 1e-4 ? vv.xy / sp : vec2(0.0, 1.0);
    float elong = 1.0 + st * min(sp * uStretchK, 14.0);
    off = vec2(dir.y, -dir.x) * corner.x + dir * (corner.y * elong);
  } else {
    float rot = sd * 6.2831853 + age * iSpin;
    float cs = cos(rot), sn = sin(rot);
    off = vec2(corner.x * cs - corner.y * sn, corner.x * sn + corner.y * cs);
  }
  mv.xy += off * size;

  // Soft-particle fallback that always works: fade out as a particle
  // approaches the near plane, and again at the far edge of the band.
  //
  // The fade is measured from the particle's SILHOUETTE, not its centre.
  // The billboard offsets mv.xy only, so the quad itself is parallel to the
  // near plane and can never be sliced by it — but a metre-wide puff whose
  // centre is a metre past the near plane still fills the frame with a hard
  // rectangle before this fade ever engages. Subtracting the half-extent
  // starts the fade while the puff is still small on screen. For everything
  // smaller than ~0.2 m, or further away than ~1 m, this is a no-op; it
  // matters for the wind-advected exhaust column, which is now carried
  // downwind toward the hero camera as it grows.
  alpha *= smoothstep(uNear0, uNear1, vViewZ - size * 0.5);
  alpha *= 1.0 - smoothstep(uFar0, uFar1, vViewZ);
  vAlpha = alpha;

  float col = mod(iB.y, 4.0);
  float row = floor(iB.y * 0.25);
  vUv = vec2((col + uv.x * 0.996 + 0.002) * 0.25,
             (3.0 - row + uv.y * 0.996 + 0.002) * 0.25);

  gl_Position = projectionMatrix * mv;
}
`;

const PARTICLE_FRAG = /* glsl */`
uniform sampler2D uAtlas;
uniform sampler2D uDepth;
uniform float uHasDepth;
uniform vec2  uResolution;
uniform float uCamNear;
uniform float uCamFar;
uniform float uIsOrtho;
uniform float uSoftDist;
uniform float uFogMode;    // 0 none, 1 linear, 2 exp2
uniform vec3  uFogTarget;  // fog colour for the soft pass, black for additive
uniform float uFogNear;
uniform float uFogFar;
uniform float uFogDensity;

varying vec2  vUv;
varying vec3  vColor;
varying float vAlpha;
varying float vViewZ;

void main() {
  vec4 t = texture2D(uAtlas, vUv);
  float a = t.a * vAlpha;

  // True soft particles when a scene depth buffer is available: fade the
  // sprite out as it approaches the surface it would otherwise slice through.
  if (uHasDepth > 0.5) {
    float d = texture2D(uDepth, gl_FragCoord.xy / uResolution).x;
    float sceneZ;
    if (uIsOrtho > 0.5) {
      sceneZ = uCamNear + d * (uCamFar - uCamNear);
    } else {
      float ndc = d * 2.0 - 1.0;
      sceneZ = (2.0 * uCamNear * uCamFar) /
               (uCamFar + uCamNear - ndc * (uCamFar - uCamNear));
    }
    a *= clamp((sceneZ - vViewZ) / uSoftDist, 0.0, 1.0);
  }

  if (a < 0.004) discard;

  vec3 col = vColor * t.rgb;

  if (uFogMode > 0.5) {
    float f = uFogMode < 1.5
      ? smoothstep(uFogNear, uFogFar, vViewZ)
      : 1.0 - exp(-uFogDensity * uFogDensity * vViewZ * vViewZ);
    col = mix(col, uFogTarget, clamp(f, 0.0, 1.0));
  }

  // Premultiplied output: NormalBlending -> (ONE, ONE_MINUS_SRC_ALPHA) and
  // AdditiveBlending -> (ONE, ONE) both consume this correctly.
  gl_FragColor = vec4(col * a, a);
}
`;

/* Rock chips with real geometry — small lit octahedra that tumble on the same
   analytic trajectory as the sprite particles. Used for percussive impacts
   where a flat billboard would not read as a solid piece of rock. */
const CHIP_VERT = /* glsl */`
attribute vec3 iPos;
attribute vec3 iVel;
attribute vec3 iCol;
attribute vec4 iA;   // birth, life, size, seed
attribute vec4 iB;   // drag, gravityScale, restitution, spin

uniform float uTime;
uniform float uGravity;
uniform vec3  uWind;
uniform float uFloorY;

varying vec3  vNormal;
varying vec3  vColor;
varying float vAlpha;

mat3 rotAxis(vec3 ax, float a) {
  float c = cos(a), s = sin(a), t = 1.0 - c;
  return mat3(
    t*ax.x*ax.x + c,      t*ax.x*ax.y + s*ax.z, t*ax.x*ax.z - s*ax.y,
    t*ax.x*ax.y - s*ax.z, t*ax.y*ax.y + c,      t*ax.y*ax.z + s*ax.x,
    t*ax.x*ax.z + s*ax.y, t*ax.y*ax.z - s*ax.x, t*ax.z*ax.z + c
  );
}

void main() {
  float life = iA.y;
  float age  = uTime - iA.x;
  float u    = life > 0.0 ? age / life : 2.0;
  if (age < 0.0 || u >= 1.0) {
    vNormal = vec3(0.0); vColor = vec3(0.0); vAlpha = 0.0;
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }

  float k    = max(iB.x, ${F(MIN_DRAG)});
  vec3  grav = vec3(0.0, -uGravity * iB.y, 0.0);
  vec3  vInf = grav / k + uWind * 0.15;
  float e    = exp(-k * age);
  vec3  p    = iPos + (iVel - vInf) * ((1.0 - e) / k) + vInf * age;

  if (iB.z > 0.0) {
    float below = uFloorY - p.y;
    if (below > 0.0) p.y = uFloorY + below * iB.z * exp(-below * 2.2);
  }

  float sd = iA.w;
  vec3 ax = normalize(vec3(sin(sd * 12.9) + 0.013, cos(sd * 7.3) + 0.35, sin(sd * 4.1 + 1.7) + 0.021));
  mat3 R = rotAxis(ax, sd * 6.2831853 + age * iB.w);

  // Non-uniform scale so no two chips are the same shard.
  vec3 sc = iA.z * vec3(0.65 + 0.7 * fract(sd * 3.7),
                        0.45 + 0.5 * fract(sd * 9.1),
                        0.65 + 0.7 * fract(sd * 5.3));

  vec3 local = R * (position * sc);
  vNormal = normalize(R * normal);
  vColor  = iCol;
  vAlpha  = smoothstep(0.0, 0.08, u) * (1.0 - smoothstep(0.72, 1.0, u));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p + local, 1.0);
}
`;

const CHIP_FRAG = /* glsl */`
uniform vec3  uLightDir;
uniform vec3  uLightCol;
uniform vec3  uSkyCol;
uniform vec3  uGroundCol;

varying vec3  vNormal;
varying vec3  vColor;
varying float vAlpha;

void main() {
  if (vAlpha < 0.01) discard;
  vec3 n = normalize(vNormal);
  float ndl = max(dot(n, normalize(uLightDir)), 0.0);
  vec3 hemi = mix(uGroundCol, uSkyCol, n.y * 0.5 + 0.5);
  vec3 col = vColor * (hemi + uLightCol * ndl);
  gl_FragColor = vec4(col * vAlpha, vAlpha);
}
`;

/* Heat shimmer. Draws as a full-band NDC quad after everything else. When a
   grab-pass texture is available it refracts the framebuffer; otherwise it
   falls back to an equally art-directed warm haze so the effect never simply
   vanishes on lower tiers. */
const SHIMMER_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const SHIMMER_FRAG = /* glsl */`
uniform sampler2D uScene;
uniform float uHasScene;
uniform float uTime;
uniform float uStrength;
uniform float uScale;
uniform float uRise;
uniform float uChroma;
uniform float uHaze;
uniform float uGround;
uniform float uAspect;
uniform vec4  uSrc[4];   // xy = band uv, z = radius, w = strength

varying vec2 vUv;

float h21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x),
             mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm2(vec2 p) {
  return 0.5 * vn(p) + 0.25 * vn(p * 2.03 + 5.1) + 0.125 * vn(p * 4.07 + 11.7);
}

void main() {
  vec2 uv = vUv;
  // Convection cells are tall and narrow. Compressing x before sampling the
  // noise stretches every cell vertically, which is most of what separates
  // "rising heat" from "drifting fog".
  vec2 q = vec2(uv.x * uAspect * 1.75, uv.y);

  float t = uTime;
  float n1 = fbm2(q * uScale + vec2(0.0, -t * uRise));
  float n2 = fbm2(q * uScale * 2.15 + vec2(3.7, -t * uRise * 1.65));
  float n3 = vn(q * uScale * 5.40 + vec2(11.3, -t * uRise * 2.40));
  vec2 grad = vec2(n1 - n2, n2 - n1 * 0.6);

  // Mask: rising columns over each source plus a ground-level band in hot
  // regions. The per-source falloff is an upward-offset ellipse — a plume
  // leaving a hot surface, not a ball centred on it.
  float mask = (1.0 - smoothstep(0.0, max(uGround, 0.0001), uv.y)) * uGround;
  for (int i = 0; i < 4; i++) {
    float r = max(uSrc[i].z, 0.0001);
    vec2 d = (uv - uSrc[i].xy) * vec2(uAspect, 1.0);
    d.y = (d.y - r * 0.62) * 0.58;
    mask += uSrc[i].w * exp(-dot(d, d) / (r * r)) * (0.55 + 0.45 * n1);
  }
  mask = clamp(mask, 0.0, 1.4) * uStrength;
  if (mask < 0.002) discard;

  vec2 offs = grad * mask * 0.035;

  if (uHasScene > 0.5) {
    // True screen-space refraction with a touch of chromatic separation.
    vec2 ca = offs * uChroma;
    float r = texture2D(uScene, uv + offs + ca).r;
    float g = texture2D(uScene, uv + offs).g;
    float b = texture2D(uScene, uv + offs - ca).b;
    gl_FragColor = vec4(vec3(r, g, b), 1.0);
  } else {
    // SHIPPING PATH. The grab pass is permanently off (see EFFECTS.heatShimmer),
    // so this is what players actually see and it has to stand on its own.
    //
    // A veil that only ever ADDS warmth reads as fog. Real shimmer is the
    // background boiling: dense cells bend bright light toward the eye,
    // rarefied cells bend it away. So drive one SIGNED field and paint
    // bright-warm where it is positive, dark-cool where it is negative.
    // Premultiplied NormalBlending resolves to dst*(1-a) + c*a, so a dark c
    // genuinely darkens the pixel — the band boils instead of glowing, which
    // is the read the grab pass was there to buy.
    float boil = clamp((n1 - 0.5) * 1.70 + (n2 - 0.5) * 1.05 + (n3 - 0.5) * 0.45,
                       -1.0, 1.0);
    float a = clamp(mask * (0.05 + uHaze * abs(boil)), 0.0, 0.44);
    vec3 hot  = vec3(1.55, 1.24, 0.86);   // linear HDR, luminance 1.29
    vec3 cool = vec3(0.14, 0.17, 0.24);   // never crosses the bloom threshold
    vec3 c = mix(cool, hot, smoothstep(-0.55, 0.60, boil));
    // Warm fringe on the leading (upward) edge of each cell so the boil has
    // an edge colour instead of a flat tint.
    float edge = max(grad.y, 0.0) * mask;
    c.r += uChroma * 0.30 * edge;
    c.b -= uChroma * 0.12 * edge;
    gl_FragColor = vec4(max(c, vec3(0.0)) * a, a);
  }
}
`;

/* Birds. One instanced mesh, a shallow V of two triangles per bird, flapping
   in the vertex shader and orbiting on an analytic path. Silhouettes only. */
const BIRD_VERT = /* glsl */`
attribute vec4 iA;   // orbitRadius, altitude, orbitSpeed, phase
attribute vec4 iB;   // flapRate, span, seed, fadeIn

uniform float uTime;
uniform vec3  uCenter;
uniform float uAlpha;

varying float vShade;
varying float vFade;

void main() {
  float a = iA.w + uTime * iA.z;
  vec3 c = uCenter + vec3(cos(a) * iA.x, iA.y + sin(a * 2.3 + iB.z) * 0.6, sin(a) * iA.x);
  vec3 fwd = normalize(vec3(-sin(a), 0.0, cos(a)));
  vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));

  float flap = sin(uTime * iB.x + iB.z * 6.283);
  // position.x = -1..1 across the wings, position.y = body/tail offset.
  float wing = position.x;
  float lift = abs(wing) * flap * 0.55;
  vec3 local = side * (wing * iB.y) + vec3(0.0, lift * iB.y, 0.0) + fwd * (position.y * iB.y * 0.45);

  vShade = 0.55 + 0.45 * (1.0 - abs(flap)) * abs(wing);
  vFade = iB.w * uAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(c + local, 1.0);
}
`;

const BIRD_FRAG = /* glsl */`
uniform vec3 uColor;
varying float vShade;
varying float vFade;
void main() {
  if (vFade < 0.01) discard;
  float a = vFade * 0.9;
  gl_FragColor = vec4(uColor * vShade * a, a);
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   POOLED PARTICLE LAYER
   One preallocated typed-array pool + one InstancedBufferGeometry + one draw
   call. Spawning writes a slot once and marks a dirty range; nothing else ever
   touches particle memory. Dead slots are collapsed by the vertex shader, so
   recycling costs a free-list push and no GPU upload at all.
   ═══════════════════════════════════════════════════════════════════════════ */

function makeQuadGeometry() {
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(
    [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(
    [0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  return g;
}

class ParticleLayer {
  constructor(name, capacity, additive) {
    this.name = name;
    this.capacity = capacity;
    this.additive = additive;

    // ── particle memory (never reallocated) ────────────────────────────────
    this.aPos  = new Float32Array(capacity * 3);
    this.aVel  = new Float32Array(capacity * 3);
    this.aCol  = new Float32Array(capacity * 3);
    this.aA    = new Float32Array(capacity * 4);
    this.aB    = new Float32Array(capacity * 4);
    this.aC    = new Float32Array(capacity * 4);
    this.aD    = new Float32Array(capacity * 4);
    this.aSpin = new Float32Array(capacity);

    // ── free list + live list (both preallocated, no GC churn) ─────────────
    this.free = new Int32Array(capacity);
    for (let i = 0; i < capacity; i++) this.free[i] = capacity - 1 - i;
    this.freeCount = capacity;
    this.live = new Int32Array(capacity);
    this.liveCount = 0;
    this.death = new Float32Array(capacity);
    this.highWater = -1;

    this.dirtyMin = capacity;
    this.dirtyMax = -1;

    const geo = makeQuadGeometry();
    this.geometry = geo;
    this.attrs = [];
    const add = (nm, arr, size) => {
      const a = new THREE.InstancedBufferAttribute(arr, size);
      a.setUsage(THREE.DynamicDrawUsage);
      a.__range = { start: 0, count: 0 };
      geo.setAttribute(nm, a);
      this.attrs.push(a);
      return a;
    };
    add('iPos', this.aPos, 3);
    add('iVel', this.aVel, 3);
    add('iCol', this.aCol, 3);
    add('iA', this.aA, 4);
    add('iB', this.aB, 4);
    add('iC', this.aC, 4);
    add('iD', this.aD, 4);
    add('iSpin', this.aSpin, 1);
    geo.instanceCount = 0;
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);

    this.uniforms = {
      uTime:       { value: 0 },
      uWind:       { value: new THREE.Vector3() },
      uGravity:    { value: GRAV },
      uCurve:      { value: null },
      uCurveRows:  { value: 1 },
      uFlowPhase:  { value: 0 },
      uFloorY:     { value: 0 },
      uCeilY:      { value: 1e5 },
      uFade:       { value: 1 },
      uStress:     { value: 0 },
      uStretchK:   { value: 0.16 },
      uNear0:      { value: 0.12 },
      uNear1:      { value: 0.9 },
      uFar0:       { value: 400 },
      uFar1:       { value: 600 },
      uAtlas:      { value: null },
      uDepth:      { value: null },
      uHasDepth:   { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uCamNear:    { value: 0.1 },
      uCamFar:     { value: 1000 },
      uIsOrtho:    { value: 0 },
      uSoftDist:   { value: 0.6 },
      uFogMode:    { value: 0 },
      uFogTarget:  { value: new THREE.Color(0, 0, 0) },
      uFogNear:    { value: 1 },
      uFogFar:     { value: 200 },
      uFogDensity: { value: 0.01 },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      premultipliedAlpha: true,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      side: THREE.DoubleSide,
      toneMapped: true,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.renderOrder = additive ? 3001 : 3000;
    this.mesh.name = `vfx:${name}`;
    this.parent = null;
  }

  /** Pop a slot. Returns -1 when the pool is exhausted. */
  alloc() {
    if (this.freeCount === 0) return -1;
    const i = this.free[--this.freeCount];
    this.live[this.liveCount++] = i;
    if (i > this.highWater) { this.highWater = i; this.geometry.instanceCount = i + 1; }
    return i;
  }

  markDirty(i) {
    if (i < this.dirtyMin) this.dirtyMin = i;
    if (i > this.dirtyMax) this.dirtyMax = i;
  }

  /**
   * Write one particle. Deliberately a long positional argument list: it keeps
   * the hot path free of temporary objects.
   */
  emit(kind, sprite, now, life, size, seed,
       px, py, pz, vx, vy, vz, cr, cg, cb,
       drag, grav, turbAmp, turbFreq, windScale, rest,
       phase, flowScale, swirlR, swirlSpin, spin) {
    const i = this.alloc();
    if (i < 0) return false;
    const i3 = i * 3, i4 = i * 4;

    this.aPos[i3] = px; this.aPos[i3 + 1] = py; this.aPos[i3 + 2] = pz;
    this.aVel[i3] = vx; this.aVel[i3 + 1] = vy; this.aVel[i3 + 2] = vz;
    this.aCol[i3] = cr; this.aCol[i3 + 1] = cg; this.aCol[i3 + 2] = cb;

    this.aA[i4] = now; this.aA[i4 + 1] = life; this.aA[i4 + 2] = size; this.aA[i4 + 3] = seed;
    this.aB[i4] = kind; this.aB[i4 + 1] = sprite; this.aB[i4 + 2] = drag; this.aB[i4 + 3] = grav;
    this.aC[i4] = turbAmp; this.aC[i4 + 1] = turbFreq; this.aC[i4 + 2] = windScale; this.aC[i4 + 3] = rest;
    this.aD[i4] = phase; this.aD[i4 + 1] = flowScale; this.aD[i4 + 2] = swirlR; this.aD[i4 + 3] = swirlSpin;
    this.aSpin[i] = spin;

    this.death[i] = now + life;
    this.markDirty(i);
    return true;
  }

  /** Recycle expired slots. O(live), allocation-free, order-independent. */
  sweep(now) {
    let n = this.liveCount;
    for (let j = 0; j < n; j++) {
      const idx = this.live[j];
      if (this.death[idx] <= now) {
        this.free[this.freeCount++] = idx;
        this.live[j] = this.live[--n];
        j--;
      }
    }
    this.liveCount = n;
    if (n === 0 && this.highWater >= 0) {
      this.highWater = -1;
      this.geometry.instanceCount = 0;
    }
  }

  /**
   * Upload only the slots touched this frame. The range objects are owned by
   * the attributes and reused, so the steady state allocates nothing.
   */
  flush() {
    const s = this.dirtyMin, e = this.dirtyMax;
    if (e < s) return;
    for (let a = 0; a < this.attrs.length; a++) {
      const attr = this.attrs[a];
      const r = attr.__range;
      r.start = s * attr.itemSize;
      r.count = (e - s + 1) * attr.itemSize;
      const ur = attr.updateRanges;
      if (ur.length === 0) ur.push(r);
      else { ur.length = 1; ur[0] = r; }
      attr.needsUpdate = true;
    }
    this.dirtyMin = this.capacity;
    this.dirtyMax = -1;
  }

  /** Kill everything without touching the GPU buffers. */
  clear() {
    this.freeCount = this.capacity;
    for (let i = 0; i < this.capacity; i++) this.free[i] = this.capacity - 1 - i;
    this.liveCount = 0;
    this.highWater = -1;
    this.geometry.instanceCount = 0;
  }

  attach(scene) {
    if (this.parent === scene) return;
    if (this.parent) this.parent.remove(this.mesh);
    this.parent = scene || null;
    if (this.parent) this.parent.add(this.mesh);
  }

  dispose() {
    if (this.parent) this.parent.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    this.parent = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MESH CHIPS — real geometry for percussive debris.
   ═══════════════════════════════════════════════════════════════════════════ */
class ChipLayer {
  constructor(capacity) {
    this.capacity = capacity;
    this.aPos = new Float32Array(capacity * 3);
    this.aVel = new Float32Array(capacity * 3);
    this.aCol = new Float32Array(capacity * 3);
    this.aA   = new Float32Array(capacity * 4);
    this.aB   = new Float32Array(capacity * 4);
    this.free = new Int32Array(capacity);
    for (let i = 0; i < capacity; i++) this.free[i] = capacity - 1 - i;
    this.freeCount = capacity;
    this.live = new Int32Array(capacity);
    this.liveCount = 0;
    this.death = new Float32Array(capacity);
    this.highWater = -1;
    this.dirtyMin = capacity;
    this.dirtyMax = -1;

    // PolyhedronGeometry at detail 0 is already non-indexed with flat normals,
    // which is exactly the faceted shard read we want. Its attributes are
    // handed to the instanced geometry directly (and never disposed twice).
    const src = new THREE.OctahedronGeometry(0.5, 0);
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', src.getAttribute('position'));
    geo.setAttribute('normal', src.getAttribute('normal'));

    this.attrs = [];
    const add = (nm, arr, size) => {
      const a = new THREE.InstancedBufferAttribute(arr, size);
      a.setUsage(THREE.DynamicDrawUsage);
      a.__range = { start: 0, count: 0 };
      geo.setAttribute(nm, a);
      this.attrs.push(a);
    };
    add('iPos', this.aPos, 3);
    add('iVel', this.aVel, 3);
    add('iCol', this.aCol, 3);
    add('iA', this.aA, 4);
    add('iB', this.aB, 4);
    geo.instanceCount = 0;
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    this.geometry = geo;

    this.uniforms = {
      uTime:      { value: 0 },
      uGravity:   { value: GRAV },
      uWind:      { value: new THREE.Vector3() },
      uFloorY:    { value: 0 },
      uLightDir:  { value: new THREE.Vector3(0.45, 0.62, 0.35) },
      uLightCol:  { value: new THREE.Color(1.15, 0.92, 0.66) },
      uSkyCol:    { value: new THREE.Color(0.26, 0.32, 0.40) },
      uGroundCol: { value: new THREE.Color(0.10, 0.09, 0.08) },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: CHIP_VERT,
      fragmentShader: CHIP_FRAG,
      transparent: true,
      depthWrite: false,
      premultipliedAlpha: true,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.renderOrder = 2999;
    this.mesh.name = 'vfx:chips';
    this.parent = null;
  }

  emit(now, life, size, seed, px, py, pz, vx, vy, vz, cr, cg, cb, drag, grav, rest, spin) {
    if (this.freeCount === 0) return false;
    const i = this.free[--this.freeCount];
    this.live[this.liveCount++] = i;
    if (i > this.highWater) { this.highWater = i; this.geometry.instanceCount = i + 1; }
    const i3 = i * 3, i4 = i * 4;
    this.aPos[i3] = px; this.aPos[i3 + 1] = py; this.aPos[i3 + 2] = pz;
    this.aVel[i3] = vx; this.aVel[i3 + 1] = vy; this.aVel[i3 + 2] = vz;
    this.aCol[i3] = cr; this.aCol[i3 + 1] = cg; this.aCol[i3 + 2] = cb;
    this.aA[i4] = now; this.aA[i4 + 1] = life; this.aA[i4 + 2] = size; this.aA[i4 + 3] = seed;
    this.aB[i4] = drag; this.aB[i4 + 1] = grav; this.aB[i4 + 2] = rest; this.aB[i4 + 3] = spin;
    this.death[i] = now + life;
    if (i < this.dirtyMin) this.dirtyMin = i;
    if (i > this.dirtyMax) this.dirtyMax = i;
    return true;
  }

  sweep(now) {
    let n = this.liveCount;
    for (let j = 0; j < n; j++) {
      const idx = this.live[j];
      if (this.death[idx] <= now) {
        this.free[this.freeCount++] = idx;
        this.live[j] = this.live[--n];
        j--;
      }
    }
    this.liveCount = n;
    if (n === 0 && this.highWater >= 0) { this.highWater = -1; this.geometry.instanceCount = 0; }
  }

  flush() {
    const s = this.dirtyMin, e = this.dirtyMax;
    if (e < s) return;
    for (let a = 0; a < this.attrs.length; a++) {
      const attr = this.attrs[a];
      const r = attr.__range;
      r.start = s * attr.itemSize;
      r.count = (e - s + 1) * attr.itemSize;
      const ur = attr.updateRanges;
      if (ur.length === 0) ur.push(r);
      else { ur.length = 1; ur[0] = r; }
      attr.needsUpdate = true;
    }
    this.dirtyMin = this.capacity;
    this.dirtyMax = -1;
  }

  clear() {
    this.freeCount = this.capacity;
    for (let i = 0; i < this.capacity; i++) this.free[i] = this.capacity - 1 - i;
    this.liveCount = 0;
    this.highWater = -1;
    this.geometry.instanceCount = 0;
  }

  attach(scene) {
    if (this.parent === scene) return;
    if (this.parent) this.parent.remove(this.mesh);
    this.parent = scene || null;
    if (this.parent) this.parent.add(this.mesh);
  }

  dispose() {
    if (this.parent) this.parent.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    this.parent = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   BIRDS — an occasional distant flock. Life on the site.
   ═══════════════════════════════════════════════════════════════════════════ */
class BirdLayer {
  constructor(capacity) {
    this.capacity = capacity;
    this.count = 0;
    this.alpha = 0;
    this.target = 0;
    this.timer = 0;

    const geo = new THREE.InstancedBufferGeometry();
    // A swept V: two triangles meeting at the body.
    geo.setAttribute('position', new THREE.Float32BufferAttribute([
      -1.0, -0.30, 0, 0.0, 0.55, 0, 0.0, -0.55, 0,
       1.0, -0.30, 0, 0.0, -0.55, 0, 0.0, 0.55, 0,
    ], 3));
    this.aA = new Float32Array(capacity * 4);
    this.aB = new Float32Array(capacity * 4);
    const attrA = new THREE.InstancedBufferAttribute(this.aA, 4);
    const attrB = new THREE.InstancedBufferAttribute(this.aB, 4);
    attrA.setUsage(THREE.DynamicDrawUsage);
    attrB.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('iA', attrA);
    geo.setAttribute('iB', attrB);
    geo.instanceCount = 0;
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    this.attrA = attrA; this.attrB = attrB;
    this.geometry = geo;

    this.uniforms = {
      uTime:   { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uAlpha:  { value: 0 },
      uColor:  { value: new THREE.Color(EFFECTS.birds.color) },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: BIRD_VERT,
      fragmentShader: BIRD_FRAG,
      transparent: true,
      depthWrite: false,
      premultipliedAlpha: true,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.renderOrder = 2500;
    this.mesh.name = 'vfx:birds';
    this.parent = null;
  }

  spawnFlock(rand, cx, cy, cz) {
    const cfg = EFFECTS.birds;
    const n = Math.min(this.capacity, rand.int(cfg.flock[0], cfg.flock[1]));
    const radius = rand.range(cfg.radius[0], cfg.radius[1]);
    const height = rand.range(cfg.height[0], cfg.height[1]);
    const speed = rand.range(cfg.speed[0], cfg.speed[1]) * (rand.bool() ? 1 : -1);
    const base = rand.f() * TAU;
    for (let i = 0; i < n; i++) {
      const i4 = i * 4;
      this.aA[i4] = radius + rand.range(-2.6, 2.6);
      this.aA[i4 + 1] = height + rand.range(-1.8, 1.8);
      this.aA[i4 + 2] = speed;
      this.aA[i4 + 3] = base + rand.range(-0.22, 0.22);
      this.aB[i4] = rand.range(cfg.flap[0], cfg.flap[1]) * TAU * 0.16;
      this.aB[i4 + 1] = rand.range(cfg.span[0], cfg.span[1]);
      this.aB[i4 + 2] = rand.f() * 6.283;
      this.aB[i4 + 3] = 1;
    }
    this.count = n;
    this.geometry.instanceCount = n;
    this.attrA.needsUpdate = true;
    this.attrB.needsUpdate = true;
    this.uniforms.uCenter.value.set(cx, cy, cz);
    this.target = 1;
    this.timer = 16 + rand.f() * 20;
  }

  update(dt, t) {
    this.uniforms.uTime.value = t;
    if (this.count === 0) return;
    this.timer -= dt;
    if (this.timer <= 0) this.target = 0;
    this.alpha = damp(this.alpha, this.target, 2.8, dt);
    this.uniforms.uAlpha.value = this.alpha;
    if (this.target === 0 && this.alpha < 0.01) {
      this.count = 0;
      this.geometry.instanceCount = 0;
    }
  }

  clear() { this.count = 0; this.alpha = 0; this.target = 0; this.geometry.instanceCount = 0; }

  attach(scene) {
    if (this.parent === scene) return;
    if (this.parent) this.parent.remove(this.mesh);
    this.parent = scene || null;
    if (this.parent) this.parent.add(this.mesh);
  }

  dispose() {
    if (this.parent) this.parent.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    this.parent = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HEAT SHIMMER — a screen-space refraction quad over the surface band.
   Grabs the framebuffer in onBeforeRender (a real grab pass, no ownership of
   the render pipeline required) and refracts it. If the grab is unavailable
   or fails once, it permanently degrades to an art-directed warm haze.
   ═══════════════════════════════════════════════════════════════════════════ */
class ShimmerQuad {
  constructor(cfg) {
    this.cfg = cfg;
    this.srcData = new Float32Array(16); // 4 x vec4
    this.uniforms = {
      uScene:    { value: null },
      uHasScene: { value: 0 },
      uTime:     { value: 0 },
      uStrength: { value: 0 },
      uScale:    { value: cfg.scale },
      uRise:     { value: cfg.rise },
      uChroma:   { value: cfg.chroma },
      uHaze:     { value: cfg.haze ?? 0.34 },
      uGround:   { value: 0 },
      uAspect:   { value: 0.6 },
      uSrc:      { value: this.srcData },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: SHIMMER_VERT,
      fragmentShader: SHIMMER_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      premultipliedAlpha: true,
      blending: THREE.NormalBlending,
    });
    const geo = new THREE.PlaneGeometry(2, 2);
    this.geometry = geo;
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.renderOrder = 9990;
    this.mesh.name = 'vfx:heatShimmer';
    this.mesh.visible = false;
    this.parent = null;

    this.grabTex = null;
    this.grabPos = new THREE.Vector2(0, 0);
    this.vp = new THREE.Vector4();
    this.grabW = 0; this.grabH = 0;
    this.pendingW = 0; this.pendingH = 0;
    this.grabOk = cfg.refraction !== false;
    this.wantGrab = false;

    // The grab happens inside the render, right before this quad draws, so it
    // sees the finished band — scene, rig and particles — without this module
    // needing to own the render pipeline. The exact band rectangle is read
    // back from the renderer rather than guessed, so any scissor layout works.
    this.grabbed = 0;   // successful framebuffer copies so far
    this.mesh.onBeforeRender = (renderer) => {
      if (!this.grabOk) return;
      try {
        renderer.getCurrentViewport(this.vp);
        const w = Math.max(2, Math.floor(this.vp.z));
        const h = Math.max(2, Math.floor(this.vp.w));
        this.pendingW = w; this.pendingH = h;
        if (!this.wantGrab || !this.grabTex || w !== this.grabW || h !== this.grabH) return;
        this.grabPos.set(this.vp.x, this.vp.y);
        renderer.copyFramebufferToTexture(this.grabTex, this.grabPos);
        this.grabbed++;
      } catch (e) {
        // One failure is enough — fall back for the rest of the session.
        this.grabOk = false;
        this.setGrabMode(false);
        console.warn('[vfx] heat-shimmer grab pass unavailable, using haze fallback');
      }
    };
  }

  /** True once the grab texture matches the band the renderer actually uses. */
  grabReady() {
    return !!this.grabTex && this.pendingW > 0 &&
           this.grabW === this.pendingW && this.grabH === this.pendingH;
  }

  /** Allocation is deferred out of onBeforeRender and into update(). */
  reconcile() {
    if (!this.grabOk || this.pendingW <= 0) return;
    if (this.grabW === this.pendingW && this.grabH === this.pendingH) return;
    if (this.grabTex) this.grabTex.dispose();
    this.grabW = this.pendingW; this.grabH = this.pendingH;
    this.grabTex = new THREE.FramebufferTexture(this.grabW, this.grabH);
    this.grabTex.minFilter = THREE.LinearFilter;
    this.grabTex.magFilter = THREE.LinearFilter;
    this.uniforms.uScene.value = this.grabTex;
    this.uniforms.uAspect.value = this.grabW / this.grabH;
  }

  setGrabMode(on) {
    const v = on ? 1 : 0;
    if (this.uniforms.uHasScene.value === v) return;
    this.uniforms.uHasScene.value = v;
    this.material.blending = on ? THREE.NoBlending : THREE.NormalBlending;
    this.material.needsUpdate = true;
  }

  resize(w, h, dpr) {
    // First guess from LAYOUT; refined the moment the renderer tells us the
    // real band rectangle (see onBeforeRender / reconcile).
    const pw = Math.max(2, Math.floor(w * dpr));
    const bandH = Math.max(2, Math.floor(h * LAYOUT.surfaceHeight * dpr));
    this.uniforms.uAspect.value = pw / bandH;
    if (this.grabOk && !this.grabTex) { this.pendingW = pw; this.pendingH = bandH; this.reconcile(); }
  }

  attach(scene) {
    if (this.parent === scene) return;
    if (this.parent) this.parent.remove(this.mesh);
    this.parent = scene || null;
    if (this.parent) this.parent.add(this.mesh);
  }

  dispose() {
    if (this.parent) this.parent.remove(this.mesh);
    this.mesh.onBeforeRender = () => {};
    if (this.grabTex) this.grabTex.dispose();
    this.geometry.dispose();
    this.material.dispose();
    this.parent = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANCHORS — where each kind is emitted from. Kept out of EFFECTS so that table
   stays purely about how things look.
   ═══════════════════════════════════════════════════════════════════════════ */
/* HEAD is the rotary head / hammer / anvil — the tool anchor the rig already
   publishes as `headPosition`. It is NOT the collar: on a piling leader it is
   the helmet on top of the pile, on a bolter and a jumbo it is the drifter
   pointed at the rock, and on an SI rig it is the SPT anvil. Every one of the
   six new methods emits from the machine's working end rather than from a
   hole in the ground, which is exactly why COLLAR was not enough.
   CYCLONE and REJECT are RC's sample train: the cyclone underflow on its
   stand, and the bulk reject pile beside the rig. */
const ANCHOR = {
  COLLAR: 0, STACK: 1, BIT: 2, SKY: 3, MAST: 4, WALL: 5, GROUND: 6,
  HEAD: 7, CYCLONE: 8, REJECT: 9,
};
const N_ANCHOR = 10;

const KIND_ANCHOR = {
  dustBody: ANCHOR.COLLAR, dustPlume: ANCHOR.COLLAR, dustBacklight: ANCHOR.COLLAR,
  sprayDrops: ANCHOR.COLLAR, sprayMist: ANCHOR.COLLAR,
  sprayGlint: ANCHOR.COLLAR, mudStreak: ANCHOR.COLLAR,
  foamClump: ANCHOR.COLLAR, foamMist: ANCHOR.COLLAR,
  exhaustSmoke: ANCHOR.STACK, exhaustSoot: ANCHOR.STACK, exhaustLight: ANCHOR.STACK,
  sparkStreak: ANCHOR.COLLAR, sparkEmber: ANCHOR.COLLAR,
  puffSoft: ANCHOR.GROUND, puffGrit: ANCHOR.GROUND,
  greaseSmoke: ANCHOR.MAST, greaseWisp: ANCHOR.MAST,
  motes: ANCHOR.SKY,
  rainDrop: ANCHOR.SKY, rainSplash: ANCHOR.GROUND, snowFlake: ANCHOR.SKY,
  flourish: ANCHOR.COLLAR, flourishSpark: ANCHOR.COLLAR,
  grooveSurface: ANCHOR.COLLAR,
  cuttingChip: ANCHOR.BIT, cuttingFines: ANCHOR.BIT,
  bitFlash: ANCHOR.BIT, shockRing: ANCHOR.BIT, rockChipSprite: ANCHOR.BIT,
  waterJet: ANCHOR.WALL, waterGlint: ANCHOR.WALL, waterMist: ANCHOR.WALL,
  collapseChunk: ANCHOR.WALL, collapseDust: ANCHOR.WALL,
  voidDebris: ANCHOR.BIT, voidDust: ANCHOR.BIT,
  grooveCore: ANCHOR.BIT, grooveTrail: ANCHOR.BIT,
  /* the six new methods */
  rcChipStream: ANCHOR.REJECT, rcRejectDust: ANCHOR.REJECT,
  rcCycloneDust: ANCHOR.CYCLONE, rcWetSlug: ANCHOR.CYCLONE,
  rcInnerTube: ANCHOR.BIT,
  faceSpray: ANCHOR.HEAD, faceMist: ANCHOR.HEAD, faceSlurry: ANCHOR.HEAD,
  faceWash: ANCHOR.BIT,
  upholeFlush: ANCHOR.HEAD, upholeSludge: ANCHOR.HEAD,
  resinExtrude: ANCHOR.HEAD, groutReturn: ANCHOR.HEAD,
  pileBurst: ANCHOR.HEAD, pileSpall: ANCHOR.HEAD,
  sptPuff: ANCHOR.HEAD,
};

/* How strongly the live stratum colour tints each kind (0 = never). This is
   what makes cuttings, dust and impact debris always belong to the ground the
   bit is actually in. */
const KIND_STRATUM_TINT = {
  cuttingChip: 1.0, cuttingFines: 0.9, rockChipSprite: 0.95,
  collapseChunk: 1.0, collapseDust: 0.85,
  voidDebris: 0.9, voidDust: 0.8,
  bitFlash: 0.35, shockRing: 0.25,
  dustBody: 0.80, dustPlume: 0.65, dustBacklight: 0.30,
  puffSoft: 0.55, puffGrit: 0.8, mudStreak: 0.5,
  /* The RC sample IS the stratum — that is the entire point of the method —
     so the stream, the reject plume and the inner-tube column carry the live
     rock colour at full strength. The jumbo's slurry and the uphole sludge
     are rock flour in water, so they take it at about half. Concrete spall
     off a pile head and the puff off an SPT anvil are NOT the ground: a
     precast pile is grey wherever it is driven, and only a light tint keeps
     the SPT puff from looking like it came out of a different site. */
  rcChipStream: 1.0, rcCycloneDust: 0.8, rcRejectDust: 0.85, rcWetSlug: 0.55,
  rcInnerTube: 1.0,
  faceSlurry: 0.55, upholeSludge: 0.60,
  pileSpall: 0.15, pileBurst: 0.25, sptPuff: 0.50,
};

/* Module scratch — allocated once, reused for the life of the process. */
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _col = new THREE.Color();
const _col2 = new THREE.Color();

/* ═══════════════════════════════════════════════════════════════════════════
   THE SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */
export function createVFX(ctx) {
  const bus = ctx?.bus;
  const rand = (ctx?.rand && typeof ctx.rand.f === 'function') ? ctx.rand : makeRandom(0xC0FFEE);

  /* ── kind registry ────────────────────────────────────────────────────── */
  const kinds = [];              // index -> descriptor
  const kindOf = Object.create(null);
  for (const id in EFFECTS) {
    const def = EFFECTS[id];
    if (!def || def.parts || def.special) continue;
    const k = {
      id, def,
      index: kinds.length,
      sprite: SPRITES[def.sprite] ?? SPRITES.smoke,
      section: def.band === BAND_SECTION,
      additive: def.pass === PASS_ADD,
      anchor: KIND_ANCHOR[id] ?? (def.band === BAND_SECTION ? ANCHOR.BIT : ANCHOR.COLLAR),
      tint: KIND_STRATUM_TINT[id] || 0,
      base: new THREE.Color(def.color || '#FFFFFF'),
      priority: def.priority ?? 5,
      sunTint: def.sunTint || 0,
      sunBias: def.sunBias || 0,
      demand: 1,          // set by refreshTierDemand() at init and on tier change
    };
    kindOf[id] = k;
    kinds.push(k);
  }
  const nKinds = kinds.length;

  /* ── per-kind emission bookkeeping (all preallocated) ─────────────────── */
  const driverRate = new Float32Array(nKinds);
  const extRate    = new Float32Array(nKinds);
  const extTtl     = new Float32Array(nKinds);
  const rateNow    = new Float32Array(nKinds);
  const accum      = new Float32Array(nKinds);

  const anchorPos = new Float32Array(N_ANCHOR * 3);

  /** Fold TIER_DEMAND into a per-kind scalar so the hot loop is one multiply.
   *  priority 4 and below take the full cut, priority 10 keeps ~93% of it. */
  function refreshTierDemand() {
    const d = TIER_DEMAND[tierId] ?? 0.80;
    for (let i = 0; i < kinds.length; i++) {
      const k = kinds[i];
      k.demand = d >= 1 ? 1 : lerp(d, 1, clamp((k.priority - 4) / 6, 0, 1) * 0.85);
    }
  }

  /* ── systems ──────────────────────────────────────────────────────────── */
  let atlas = null;
  let curveTex = null;
  let curveRows = 1;

  const layers = { surfaceSoft: null, surfaceAdd: null, sectionSoft: null, sectionAdd: null };
  const layerList = [];
  let chips = null;
  let birds = null;
  let shimmer = null;

  /* ── tier / budget ────────────────────────────────────────────────────── */
  let tierId = ctx?.quality?.id || 'medium';
  let budget = TIER_BUDGET[tierId] ?? Math.round(12000 * clamp(ctx?.quality?.particles ?? 0.8, 0.15, 1));
  let chipBudget = 0;
  let loadScale = 1;          // adaptive shed based on measured frame rate
  let masterFade = 1;

  /* ── environment ──────────────────────────────────────────────────────── */
  const wind = new THREE.Vector3(1.1, 0, 0.35);
  let windDir = 0.32;         // radians
  let windSpeed = 1.4;        // m/s base
  let gust = 0;
  let gustTimer = 3;

  /* ── drilling telemetry mirror ────────────────────────────────────────── */
  let time = 0;
  let tickAge = 99;           // seconds since the last DRILL_TICK
  let rop = 0, torque = 0, wear = 0, wob = 0.5, rpm = 0.5, flush = 0.5;
  let jam = 0, stability = 1, depth = 0;
  let combo = 0, grooveAmt = 0;

  /* ── the six new methods, mirrored off state.drill ─────────────────────
     WARNING FROM THIS PROJECT'S HISTORY: a HUD meter read 0 for four review
     rounds because the sim never mirrored the value it was reading. Every
     field below is one drilling.js writeState() actually assigns — the RC
     sample block, the longhole uphole flag, the pile damage counters, the
     SPT blow total — and tools/vfx-methods.mjs asserts each of them arrives
     non-trivially at runtime rather than trusting that it does. */
  let programme = null;       // d.programme: rc | tunnel-jumbo | longhole |
                              // rockbolt | driven-pile | spt | cpt
  let phaseNow = '';          // d.phase — 'blow-down', 'bolt-install', ...
  let sectionReturn = 'annulus';   // SECTION_RETURN for the live method
  let sampleWet = 0, sampleHoldUp = 0, sampleTrain = 0;
  let sampleBags = -1;        // last bag index seen, for the per-metre purge
  let uphole = false;
  let headDamage = 0, dollyCond = 1;
  let boltType = '';
  /* WHERE THE POWER IS COMING FROM. A jumbo drills the face on MAINS and
     trams on its diesel; drilling.js publishes `powerMode` and `tramming`
     for exactly that, because the changeover is a real event with its own
     sound. A diesel plume standing over a machine that is running on a
     cable is the same class of error as a driven pile throwing sparks —
     and it was measured, not theorised: over a 20 s jumbo window
     exhaustSmoke peaked at 37 live and exhaustSoot at 43, every frame of it
     while d.powerMode read 'mains'. */
  let powerMode = '';
  /* Underground is not a region — the three drive methods happen in a tube
     with no sky. Two things here depend on that: env only maintains
     `sunColor` / `sunDirection` on the SURFACE path, so a sun-backlit rim
     underground is tinted with the last daylight it saw; and env owns the
     drive's volumetric medium, so nothing here may try to be its fog. */
  let underground = false;
  let blowCount = -1, sptBlowCount = -1;   // last seen, for per-blow bursts
  let blowPulse = 0;          // decaying envelope off the last hammer blow
  let purgeAmt = 0;           // blow-down / bag-cut purge at the cyclone
  let purgeHold = 0;          // ... and its minimum re-trigger interval
  let hazardKind = '', hazardAmt = 0;      // DRILL_TICK warning, live

  let flowPhase = 0;          // integral of the effective annulus velocity
  let stress = 0;
  let engineLoad = 0;
  let sootAmt = 0;
  let heatAmt = 0;
  let waterAmt = 0, waterY = 0;
  let cavityAmt = 0;
  let collapseAmt = 0;
  let medium = 'air';
  let envWeather = null;      // cached: does ctx.env own weather?
  let weatherMode = 'none';
  let weatherAmt = 0;
  let birdTimer = 12;
  let motesSeeded = false;
  let disposed = false;
  const unsubs = [];

  const stratumColor = new THREE.Color('#8A8078');
  let stratumUcs = 40;
  let stratumWater = 0.2;

  /* ── live key light, mirrored from ctx.env ────────────────────────────── */
  const sunColor = new THREE.Color('#FFD9A6');
  let sunOffX = 0.62, sunOffZ = 0.79;   // normalised horizontal sun direction
  let sunUp = 0.22;                     // sin(elevation), 0 at the horizon

  /* ── section geometry cache ───────────────────────────────────────────── */
  let holeX = 0, holeZ = 0, holeR = 0.30, holeRIn = 0.10, bitY = 0, collarSectionY = 0;

  /* ══════════════════════════════════════════════════════════════════════
     BUILD
     ══════════════════════════════════════════════════════════════════════ */
  function configureLayer(layer, section) {
    const u = layer.uniforms;
    u.uAtlas.value = atlas;
    u.uCurve.value = curveTex;
    u.uCurveRows.value = curveRows;
    u.uWind.value.copy(section ? _v3.set(0, 0, 0) : wind);
    u.uFogTarget.value.setRGB(0, 0, 0);
    // Velocity elongation gain. elong = 1 + stretch * min(speed * K, 14), and
    // `stretch` is hard-capped at STRETCH_SCALE (0.25) by the curve bake, so K
    // is the only lever that decides whether a 6 m/s spark is a streak or a
    // dot. At K = 0.16 a spark elongated by 1.1x — invisible. These give a
    // 6 m/s spark elong 2.4 and a 1.2 m/s ember elong 1.3.
    u.uStretchK.value = section ? 1.35 : 0.90;
    u.uNear0.value = section ? 0.02 : 0.15;
    u.uNear1.value = section ? 0.12 : 1.1;
    u.uSoftDist.value = section ? 0.25 : 0.7;
  }

  function buildLayers() {
    layerList.length = 0;
    const cap = (share) => Math.max(96, Math.round(budget * share));
    layers.surfaceSoft = new ParticleLayer('surfaceSoft', cap(POOL_SHARE.surfaceSoft), false);
    layers.surfaceAdd  = new ParticleLayer('surfaceAdd',  cap(POOL_SHARE.surfaceAdd),  true);
    layers.sectionSoft = new ParticleLayer('sectionSoft', cap(POOL_SHARE.sectionSoft), false);
    layers.sectionAdd  = new ParticleLayer('sectionAdd',  cap(POOL_SHARE.sectionAdd),  true);
    layerList.push(layers.surfaceSoft, layers.surfaceAdd, layers.sectionSoft, layers.sectionAdd);
    configureLayer(layers.surfaceSoft, false);
    configureLayer(layers.surfaceAdd, false);
    configureLayer(layers.sectionSoft, true);
    configureLayer(layers.sectionAdd, true);
    chipBudget = Math.max(48, Math.round(budget * 0.028));
    chips = new ChipLayer(chipBudget);
  }

  function destroyLayers() {
    for (let i = 0; i < layerList.length; i++) layerList[i].dispose();
    layerList.length = 0;
    layers.surfaceSoft = layers.surfaceAdd = layers.sectionSoft = layers.sectionAdd = null;
    if (chips) { chips.dispose(); chips = null; }
  }

  function layerFor(k) {
    return k.section
      ? (k.additive ? layers.sectionAdd : layers.sectionSoft)
      : (k.additive ? layers.surfaceAdd : layers.surfaceSoft);
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCENE BINDING — tolerant of systems that boot later or not at all.
     ══════════════════════════════════════════════════════════════════════ */
  let boundSurface = null, boundSection = null;
  function bindScenes() {
    const surf = ctx?.scene || null;
    const sect = ctx?.sectionScene || ctx?.scene || null;
    if (surf !== boundSurface) {
      boundSurface = surf;
      layers.surfaceSoft?.attach(surf);
      layers.surfaceAdd?.attach(surf);
      birds?.attach(surf);
      shimmer?.attach(surf);
    }
    if (sect !== boundSection) {
      boundSection = sect;
      layers.sectionSoft?.attach(sect);
      layers.sectionAdd?.attach(sect);
      chips?.attach(sect);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     BUDGET PRESSURE — shed the least important effects first.
     ══════════════════════════════════════════════════════════════════════ */
  function canSpawn(layer, priority) {
    const f = layer.freeCount / layer.capacity;
    if (f > 0.45) return true;
    if (f > 0.30) return priority >= 3;
    if (f > 0.16) return priority >= 6;
    if (f > 0.05) return priority >= 8;
    return priority >= 10;
  }

  /* ══════════════════════════════════════════════════════════════════════
     SPAWNING
     ══════════════════════════════════════════════════════════════════════ */

  /** Resolve the world anchor for a kind into _v1. */
  function anchorInto(kind, out) {
    const a = kind.anchor * 3;
    out.set(anchorPos[a], anchorPos[a + 1], anchorPos[a + 2]);
    return out;
  }

  /** Base colour for a kind, blended toward the live stratum and the sun. */
  function colorFor(kind, out) {
    out.copy(kind.base);
    if (kind.tint > 0) {
      out.setRGB(
        lerp(out.r, out.r * 0.35 + stratumColor.r * 1.05, kind.tint),
        lerp(out.g, out.g * 0.35 + stratumColor.g * 1.05, kind.tint),
        lerp(out.b, out.b * 0.35 + stratumColor.b * 1.05, kind.tint),
      );
    }
    // Sun-lit kinds (the backlit halo, spray glints, motes) take the live key
    // colour so a golden-hour rim really is the colour of that afternoon's sun
    // rather than a hard-coded yellow. `lerp` mutates in place — no allocation.
    if (kind.sunTint > 0) out.lerp(sunColor, kind.sunTint);
    return out;
  }

  /**
   * Emit a single particle of `kind`. `ox/oy/oz` optionally override the
   * anchor. Everything here reads from preallocated storage; the only writes
   * are into the pool's typed arrays.
   */
  function emitOne(kind, ox, oy, oz, sizeScale, speedScale) {
    const def = kind.def;
    const layer = layerFor(kind);
    if (!layer || !canSpawn(layer, kind.priority)) return false;

    // A particle with size 0 costs a pool slot, a draw and a vertex shader
    // invocation and can never be seen. Treat a missing or non-positive scale
    // as 1 so a caller can never again silently fill the pool with nothing.
    if (!(sizeScale > 0)) sizeScale = 1;
    if (!(speedScale > 0)) speedScale = 1;

    const e = def.emit;
    const shape = e.shape;
    let ax, ay, az;
    if (ox === null) { anchorInto(kind, _v1); ax = _v1.x; ay = _v1.y; az = _v1.z; }
    else { ax = ox; ay = oy; az = oz; }

    const up = e.up;
    const h = Math.sqrt(Math.max(0, 1 - up * up));
    const phi = rand.f() * TAU;
    let dx = Math.cos(phi) * h, dy = up, dz = Math.sin(phi) * h;
    let px = ax, py = ay, pz = az;
    const speed = rand.range(e.speed[0], e.speed[1]) * speedScale;

    switch (shape) {
      case 'point': {
        px = ax + rand.range(-e.r, e.r);
        py = ay + e.yOff;
        pz = az;
        break;
      }
      case 'disc': {
        const rr = e.r * Math.sqrt(rand.f());
        const a2 = rand.f() * TAU;
        px = ax + Math.cos(a2) * rr;
        pz = az + Math.sin(a2) * rr;
        py = ay + e.yOff;
        dx = Math.cos(a2) * h; dz = Math.sin(a2) * h;
        break;
      }
      case 'box': {
        px = ax + rand.range(-e.r, e.r);
        pz = az + rand.range(-e.r, e.r);
        py = ay + e.yOff + rand.f() * e.r2;
        break;
      }
      case 'sky': {
        const rr = e.r * Math.sqrt(rand.f());
        const a2 = rand.f() * TAU;
        px = ax + Math.cos(a2) * rr;
        pz = az + Math.sin(a2) * rr;
        py = ay + e.yOff + rand.f() * 2.5;
        dx = 0; dy = -1; dz = 0;
        break;
      }
      case 'sphere': {
        const u2 = rand.range(-1, 1);
        const s2 = Math.sqrt(Math.max(0, 1 - u2 * u2));
        const a2 = rand.f() * TAU;
        dx = Math.cos(a2) * s2; dy = u2 * 0.75 + up * 0.5; dz = Math.sin(a2) * s2;
        px = ax + dx * e.r; py = ay + dy * e.r + e.yOff; pz = az + dz * e.r;
        break;
      }
      case 'annulus': {
        // r / r2 are fractions across the annulus: 0 = the rod wall,
        // 1 = the bore wall. Values > 1 sit outside the hole on purpose.
        const side = rand.bool() ? 1 : -1;
        const rr = holeRIn + (holeR - holeRIn) * rand.range(e.r2, e.r);
        px = holeX + side * rr;
        pz = holeZ + rand.range(-0.02, 0.02) * holeR;
        py = ay + e.yOff;
        dx = side * 0.25 * h; dz = 0;
        break;
      }
      case 'wall': {
        // r is the vertical spread in world units; the jet points inward.
        const side = rand.bool() ? 1 : -1;
        px = holeX + side * holeR * 0.98;
        pz = holeZ;
        py = ay + rand.range(-e.r, e.r);
        dx = -side * h; dz = 0;
        break;
      }
      default: { // 'cone'
        const rr = e.r * Math.sqrt(rand.f());
        const a2 = rand.f() * TAU;
        px = ax + Math.cos(a2) * rr;
        pz = az + Math.sin(a2) * rr;
        py = ay + e.yOff;
        break;
      }
    }

    if (kind.section) {
      // The cross-section is a cutaway: the rock in front of the cut plane
      // (z = 0) has been removed, so anything living inside the bore belongs
      // in FRONT of that plane. Without this, half of every chip is depth-
      // rejected by the face slab it is co-planar with. The camera is
      // orthographic, so a constant z offset costs exactly no parallax.
      pz += SECTION_Z_BIAS;
    } else if (kind.sunBias !== 0) {
      // Backlit kinds are pushed toward the sun so their halo sits on the lit
      // edge of the plume instead of concentrically inside it. That offset is
      // the whole difference between "a rim" and "a yellow blob".
      const b = kind.sunBias;
      px += sunOffX * b;
      pz += sunOffZ * b;
      py += sunUp * b * 0.6;
    }

    // Cone spread about the chosen axis, using a stable orthonormal basis.
    const spread = e.spread;
    if (spread > 0.001) {
      _v2.set(dx, dy, dz);
      if (_v2.lengthSq() < 1e-8) _v2.set(0, 1, 0);
      _v2.normalize();
      // pick a helper axis that is never parallel to _v2
      if (Math.abs(_v2.y) < 0.9) _v3.set(0, 1, 0); else _v3.set(1, 0, 0);
      _v3.cross(_v2).normalize();
      const cosMax = Math.cos(Math.min(spread, Math.PI));
      const cu = lerp(cosMax, 1, rand.f());
      const su = Math.sqrt(Math.max(0, 1 - cu * cu));
      const ang = rand.f() * TAU;
      // Rodrigues around _v2 for the second basis vector, done inline.
      const bx = _v3.x, by = _v3.y, bz = _v3.z;
      const cx = _v2.y * bz - _v2.z * by;
      const cy = _v2.z * bx - _v2.x * bz;
      const cz = _v2.x * by - _v2.y * bx;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      dx = _v2.x * cu + (bx * ca + cx * sa) * su;
      dy = _v2.y * cu + (by * ca + cy * sa) * su;
      dz = _v2.z * cu + (bz * ca + cz * sa) * su;
    } else {
      const inv = 1 / Math.max(1e-6, Math.hypot(dx, dy, dz));
      dx *= inv; dy *= inv; dz *= inv;
    }

    const life = rand.range(def.life[0], def.life[1]);
    const size = rand.range(def.size[0], def.size[1]) * sizeScale;
    colorFor(kind, _col);

    const ok = layer.emit(
      kind.index, kind.sprite, time, life, size, rand.f(),
      px, py, pz, dx * speed, dy * speed, dz * speed,
      _col.r, _col.g, _col.b,
      def.drag, def.gravity, def.turb[0], def.turb[1], def.wind, def.bounce,
      flowPhase, def.flow, def.swirl[0], def.swirl[1], def.spin * rand.range(-1, 1) * 2,
    );
    return ok;
  }

  function burstKind(kind, count, sizeScale, speedScale, ox, oy, oz) {
    if (!kind) return;
    const n = Math.max(0, Math.round(count));
    for (let i = 0; i < n; i++) {
      if (!emitOne(kind, ox === undefined ? null : ox, oy, oz, sizeScale, speedScale)) break;
    }
  }

  /** Mesh chips — real geometry, used for percussive debris. */
  function burstChips(count, ox, oy, oz, power) {
    if (!chips) return;
    const cfg = EFFECTS.chips;
    const n = Math.max(0, Math.round(count * loadScale));
    for (let i = 0; i < n; i++) {
      const u2 = rand.range(-0.35, 1);
      const s2 = Math.sqrt(Math.max(0, 1 - u2 * u2));
      const a2 = rand.f() * TAU;
      const sp = rand.range(0.9, 3.4) * power;
      _col.copy(stratumColor).multiplyScalar(rand.range(0.75, 1.25));
      if (!chips.emit(
        time,
        rand.range(cfg.life[0], cfg.life[1]),
        rand.range(cfg.size[0], cfg.size[1]) * (0.7 + power * 0.5),
        rand.f(),
        ox, oy, oz + SECTION_Z_BIAS,
        Math.cos(a2) * s2 * sp, u2 * sp, Math.sin(a2) * s2 * sp,
        _col.r, _col.g, _col.b,
        cfg.drag, cfg.gravity, cfg.bounce,
        rand.range(cfg.spin[0], cfg.spin[1]) * (rand.bool() ? 1 : -1),
      )) break;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     PUBLIC SPAWN — composites, sustained rates and the special systems.
     ══════════════════════════════════════════════════════════════════════ */
  function envOwnsWeather() {
    if (envWeather === true) return true;
    const e = ctx?.env;
    const owns = !!(e && (e.providesWeather === true || e.hasWeather === true ||
      typeof e.setWeather === 'function' || typeof e.setPrecipitation === 'function' ||
      e.rain || e.snow));
    if (owns) envWeather = true;
    return owns;
  }

  function spawn(effectId, params) {
    const def = EFFECTS[effectId];
    if (!def || disposed) return;

    const intensity = params && params.intensity !== undefined ? clamp(params.intensity, 0, 4) : 1;
    const sizeScale = (params && params.scale) || 1;
    const speedScale = (params && params.speed) || 1;

    let ox, oy, oz;
    const p = params && params.position;
    if (p) { ox = p.x; oy = p.y; oz = p.z; }
    else if (params && params.x !== undefined) { ox = params.x; oy = params.y; oz = params.z; }

    // Specials -----------------------------------------------------------
    if (def.special === 'shimmer') {
      heatAmt = Math.max(heatAmt, intensity);
      return;
    }
    if (def.special === 'birds') {
      if (birds && boundSurface) {
        const a = ANCHOR.COLLAR * 3;
        birds.spawnFlock(rand, anchorPos[a], anchorPos[a + 1], anchorPos[a + 2]);
      }
      return;
    }
    if (def.special === 'meshChips') {
      const a = ANCHOR.BIT * 3;
      burstChips(def.burst * intensity,
        ox !== undefined ? ox : anchorPos[a],
        oy !== undefined ? oy : anchorPos[a + 1],
        oz !== undefined ? oz : anchorPos[a + 2], intensity);
      return;
    }

    // Weather is deferred to ctx.env when it owns it.
    if ((effectId === 'weatherRain' || effectId === 'weatherSnow') && envOwnsWeather()) {
      weatherMode = 'env';
      return;
    }
    if (effectId === 'weatherRain') { weatherMode = intensity > 0 ? 'rain' : 'none'; weatherAmt = intensity; }
    if (effectId === 'weatherSnow') { weatherMode = intensity > 0 ? 'snow' : 'none'; weatherAmt = intensity; }

    const parts = def.parts;
    const list = parts || null;
    const n = list ? list.length : 1;
    for (let i = 0; i < n; i++) {
      const k = list ? kindOf[list[i]] : kindOf[effectId];
      if (!k) continue;

      if (params && params.rate !== undefined) {
        // Sustained emission until the caller stops refreshing it.
        extRate[k.index] = k.def.rate * clamp(params.rate, 0, 4);
        extTtl[k.index] = params.duration !== undefined ? params.duration : 0.4;
      } else {
        burstKind(k, k.def.burst * intensity * loadScale, sizeScale, speedScale, ox, oy, oz);
      }
    }

    // Composites that also throw real geometry.
    if (effectId === 'bitImpact' && intensity > 0.45) {
      const a = ANCHOR.BIT * 3;
      burstChips(EFFECTS.chips.burst * intensity * 0.5,
        ox !== undefined ? ox : anchorPos[a],
        oy !== undefined ? oy : anchorPos[a + 1],
        oz !== undefined ? oz : anchorPos[a + 2], intensity);
    }
  }

  /**
   * Sustain one kind for this frame at `mul` of its authored rate. Called from
   * driveFromTelemetry every frame; driverRate is cleared first, so a kind
   * simply stops emitting the moment the simulation stops asking for it.
   */
  function driveKind(id, mul) {
    const k = kindOf[id];
    if (k) driverRate[k.index] = Math.max(driverRate[k.index], k.def.rate * mul);
  }

  /* ══════════════════════════════════════════════════════════════════════
     ANCHOR RESOLUTION — tolerant of every system being absent.
     ══════════════════════════════════════════════════════════════════════ */
  function resolveVec(src, out) {
    if (!src) return false;
    if (src.isVector3) { out.copy(src); return true; }
    if (typeof src.getWorldPosition === 'function') { src.getWorldPosition(out); return true; }
    if (typeof src.x === 'number' && typeof src.y === 'number') {
      out.set(src.x, src.y, src.z || 0); return true;
    }
    return false;
  }
  function setAnchor(id, x, y, z) {
    const a = id * 3;
    anchorPos[a] = x; anchorPos[a + 1] = y; anchorPos[a + 2] = z;
  }

  /* Cached rig sub-nodes. Re-resolved only when the machine changes, because
     getObjectByName is a full subtree walk and this runs inside updateAnchors,
     which runs every frame. */
  let rigCyclone = null, rigReject = null, rigNodesFor = ' ';
  function refreshRigNodes(rig) {
    const id = (rig && typeof rig.getRigId === 'function' && rig.getRigId()) || '';
    if (id === rigNodesFor) return;
    rigNodesFor = id;
    rigCyclone = null; rigReject = null;
    const g = rig && rig.group;
    if (!g || typeof g.getObjectByName !== 'function') return;
    rigCyclone = g.getObjectByName('cyclone-stand') || null;
    rigReject = g.getObjectByName('reject-pile') || null;
  }

  function updateAnchors(state) {
    const rig = ctx?.rig;
    const terrain = ctx?.terrain;
    const geo = ctx?.geology;

    // ── collar ────────────────────────────────────────────────────────────
    let cx = 0, cy = 0, cz = 0;
    if (resolveVec(terrain?.collarPosition, _v1) || resolveVec(rig?.collar, _v1)) {
      cx = _v1.x; cy = _v1.y; cz = _v1.z;
    } else if (typeof rig?.getBitWorldPosition === 'function') {
      // The rig accepts a target vector, so this stays allocation-free.
      const bp = rig.getBitWorldPosition(_v1) || _v1;
      cx = bp.x; cy = bp.y; cz = bp.z;
    } else if (resolveVec(rig?.group, _v1)) { cx = _v1.x; cy = _v1.y; cz = _v1.z; }
    setAnchor(ANCHOR.COLLAR, cx, cy, cz);
    setAnchor(ANCHOR.GROUND, cx, cy, cz);
    setAnchor(ANCHOR.SKY, cx, cy, cz);

    // ── exhaust stack ─────────────────────────────────────────────────────
    if (resolveVec(rig?.exhaust || rig?.exhaustAnchor || rig?.dyn?.exhaust ||
                   rig?.exhaustPort || rig?.stackTip, _v1)) {
      setAnchor(ANCHOR.STACK, _v1.x, _v1.y, _v1.z);
    } else if (rig?.group && rig.group.quaternion) {
      _v2.set(0.92, 2.35, -0.62).applyQuaternion(rig.group.quaternion);
      setAnchor(ANCHOR.STACK, cx + _v2.x, cy + _v2.y, cz + _v2.z);
    } else {
      setAnchor(ANCHOR.STACK, cx + 0.92, cy + 2.35, cz - 0.62);
    }

    // ── mast tip (rod breakout happens up here) ───────────────────────────
    if (resolveVec(rig?.mastTip || rig?.headPosition, _v1)) {
      setAnchor(ANCHOR.MAST, _v1.x, _v1.y, _v1.z);
    } else setAnchor(ANCHOR.MAST, cx, cy + 5.4, cz);

    /* ── the machine's working end ────────────────────────────────────────
       rigFactory publishes `headPosition` from dyn.toolAnchor, which is the
       one node that means the same thing on every machine: where the tool
       meets the work. On a piling leader it is the helmet on the pile head,
       on a jumbo and a bolter the drifter pointed at the rock, on an SI rig
       the SPT anvil. Every one of the six new methods emits from there and
       not from a hole in the ground. */
    if (resolveVec(rig?.headPosition || rig?.toolAnchor, _v1)) {
      setAnchor(ANCHOR.HEAD, _v1.x, _v1.y, _v1.z);
    } else setAnchor(ANCHOR.HEAD, cx, cy + 1.20, cz);

    /* ── RC's sample train ────────────────────────────────────────────────
       The rig does not publish these two, so they are looked up by node name
       and CACHED for the life of the machine — getObjectByName walks the
       whole subtree, which is fine once per rig change and not fine once per
       frame. Both names are unique to the RC build, so an inactive machine
       still parented under the rig group cannot be matched by accident.
       mergeStatic only removes MESHES, so these Group nodes and their
       transforms survive the merge intact.
       The fallbacks are the offsets rigFactory builds them at (cyclone stand
       at +2.30, -0.55 with the underflow at y 0.79; reject pile 1.75 m
       behind it), so the effect still lands somewhere honest if the rig is
       absent — which is what the shop and garage previews do. */
    refreshRigNodes(rig);
    if (rigCyclone && resolveVec(rigCyclone, _v1)) {
      setAnchor(ANCHOR.CYCLONE, _v1.x, _v1.y + 0.79, _v1.z);
    } else setAnchor(ANCHOR.CYCLONE, cx + 2.30, cy + 0.79, cz - 0.55);
    if (rigReject && resolveVec(rigReject, _v1)) {
      setAnchor(ANCHOR.REJECT, _v1.x, _v1.y + 0.22, _v1.z);
    } else setAnchor(ANCHOR.REJECT, cx + 2.40, cy + 0.22, cz - 2.30);

    // ── cross-section bit / hole ──────────────────────────────────────────
    let bx = 0, by = 0, bz = 0;
    const hasDepthMap = typeof geo?.worldYForDepth === 'function';
    const tipOk = resolveVec(geo?.boreholeTip, _v1);
    if (tipOk) { bx = _v1.x; by = _v1.y; bz = _v1.z; }
    else if (hasDepthMap) {
      // NOTE: a depth of 0 maps to a legitimate world Y of 0, so this must be
      // a finite-check, never a truthiness check.
      const y = geo.worldYForDepth(state?.drill?.depth || 0);
      by = Number.isFinite(y) ? y : 0;
    }
    // Geology publishes the section's coordinate convention; use it verbatim
    // rather than guessing, and widen the bore the way geology itself does
    // when the hole is unstable. `annulus` is a stable object, so reading it
    // every frame costs nothing.
    const sv = ctx?.sectionView;
    const ann = geo?.annulus;
    const baseR = ann?.outerR ?? sv?.holeRadius ?? geo?.holeRadius ?? geo?.boreRadius ?? 0.30;
    holeR = baseR * (1 + (1 - clamp(stability, 0, 1)) * 0.4);
    holeRIn = ann?.innerR ?? sv?.rodRadius ?? baseR * 0.35;
    /* THE HOLE AXIS. `geology.annulus.x` is initialised to 0 and never
       assigned — only outerR/innerR/casingR are maintained — so the old
       `ann?.x ?? …` chain always took the 0 and never reached the fallbacks
       behind it, because `??` only skips undefined. In a vertical section
       that is harmless (the axis really is near 0); in `profile` and
       `heading` the axis WALKS ALONG X with the chainage, so every
       annulus- and wall-shaped section particle was being laid out at x = 0
       while the bit was somewhere else entirely. geology moves boreholeTip
       to the live axis in every one of its five modes, so prefer the
       resolved tip and keep the old chain only for when there is no tip. */
    holeX = tipOk ? bx : (sv?.holeX ?? geo?.boreholeX ?? ann?.x ?? 0);
    holeZ = (geo && typeof geo.holeZ === 'number') ? geo.holeZ : bz;
    bitY = by;
    if (hasDepthMap) {
      const y0 = geo.worldYForDepth(0);
      collarSectionY = Number.isFinite(y0) ? y0 : by;
    } else {
      collarSectionY = by;
    }
    // Without a usable depth map the ceiling would sit on the bit and dissolve
    // the cuttings column the instant it spawned. Give it the band's height.
    if (!(collarSectionY > bitY)) collarSectionY = bitY + (ctx?.sectionView?.viewMetres || 24);
    setAnchor(ANCHOR.BIT, bx, by, bz);
    setAnchor(ANCHOR.WALL, bx, by, bz);
  }

  /* ══════════════════════════════════════════════════════════════════════
     WIND — one shared vector, with gusts, respected by every airborne effect
     so the whole site feels like one place on one afternoon.
     ══════════════════════════════════════════════════════════════════════ */
  const REGION_WIND = {
    nordic: 1.3, german: 1.0, alpine: 2.1, iberian: 1.6,
    northsea: 4.2, sahara: 2.8, chile: 1.8, arctic: 3.4,
  };
  let gustTarget = 0;

  function updateWind(dt, state) {
    gustTimer -= dt;
    if (gustTimer <= 0) {
      gustTimer = rand.range(1.6, 5.5);
      gustTarget = rand.f() < 0.42 ? rand.range(0.6, 2.4) * (windSpeed * 0.55 + 0.4) : 0;
    }
    gust = damp(gust, gustTarget, 1.1, dt);
    windDir += (Math.sin(time * 0.13) + Math.sin(time * 0.041 + 2.1)) * 0.055 * dt;

    const wx = windSpeed + gust;
    const w = state?.world;
    const wet = w && (w.weather === 'rain' || w.weather === 'snow') ? 1.35 : 1;
    wind.set(
      Math.cos(windDir) * wx * wet,
      0.10 * Math.sin(time * 0.61) + 0.05,
      Math.sin(windDir) * wx * wet,
    );
    // Surface layers share it; the section band is underground, so no wind.
    layers.surfaceSoft?.uniforms.uWind.value.copy(wind);
    layers.surfaceAdd?.uniforms.uWind.value.copy(wind);
    if (chips) chips.uniforms.uWind.value.copy(wind);
  }

  /* ══════════════════════════════════════════════════════════════════════
     KEY LIGHT — mirrored from ctx.env every frame so backlit effects track
     the real sun instead of a hard-coded golden-hour guess. Env may boot
     later, or not at all; the defaults are a low warm afternoon sun.
     ══════════════════════════════════════════════════════════════════════ */
  function updateSun() {
    const env = ctx?.env;
    if (!env) return;
    const d = env.sunDirection;
    if (d && typeof d.x === 'number') {
      const hx = d.x, hz = d.z;
      const hl = Math.hypot(hx, hz);
      if (hl > 1e-4) { sunOffX = hx / hl; sunOffZ = hz / hl; }
      sunUp = clamp(d.y, -1, 1);
    }
    const c = env.sunColor;
    if (c && typeof c.r === 'number') {
      // Normalise to unit luminance: we want the sun's HUE, not its exposure —
      // the emitCurve owns intensity, and env's own key intensity is about to
      // go up 80%, which must not double-brighten the particles.
      const l = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
      if (l > 1e-4) sunColor.setRGB(c.r / l, c.g / l, c.b / l);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     PER-BAND CAMERA / DEPTH / FOG PLUMBING
     ══════════════════════════════════════════════════════════════════════ */
  function findDepthTexture() {
    const r = ctx?.renderer;
    return (r && (r.depthTexture || r.sceneDepthTexture)) ||
           (ctx?.composer && (ctx.composer.depthTexture || ctx.composer.sceneDepthTexture)) ||
           null;
  }

  function syncBand(layer, camera, scene, depthTex, resW, resH) {
    if (!layer) return;
    const u = layer.uniforms;
    u.uTime.value = time;
    u.uFade.value = masterFade;
    u.uResolution.value.set(resW, resH);
    if (camera) {
      const ortho = camera.isOrthographicCamera === true;
      u.uIsOrtho.value = ortho ? 1 : 0;
      u.uCamNear.value = camera.near;
      u.uCamFar.value = camera.far;
      const near = camera.near;
      u.uNear0.value = near * 1.05;
      u.uNear1.value = near * 1.05 + (ortho ? 0.1 : Math.max(0.35, near * 6));
      u.uFar0.value = camera.far * (ortho ? 0.96 : 0.72);
      u.uFar1.value = camera.far * (ortho ? 1.04 : 0.99);
    }
    u.uDepth.value = depthTex;
    u.uHasDepth.value = depthTex ? 1 : 0;

    const f = scene && scene.fog;
    if (!f) { u.uFogMode.value = 0; }
    else if (f.isFog) {
      u.uFogMode.value = 1; u.uFogNear.value = f.near; u.uFogFar.value = f.far;
      if (layer.additive) u.uFogTarget.value.setRGB(0, 0, 0); else u.uFogTarget.value.copy(f.color);
    } else {
      u.uFogMode.value = 2; u.uFogDensity.value = f.density;
      if (layer.additive) u.uFogTarget.value.setRGB(0, 0, 0); else u.uFogTarget.value.copy(f.color);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     SIMULATION-DRIVEN EMISSION
     Nothing here runs on its own clock: every rate below is a function of
     live telemetry, so the picture always describes what the sim is doing.
     ══════════════════════════════════════════════════════════════════════ */
  /**
   * WHICH METHOD IS ACTUALLY RUNNING.
   *
   * MEASURED: an RC run resolved its flushing medium to 'none' on 295 of 358
   * sampled frames and to 'air' on 63 — i.e. for most of the hole this file
   * believed it was watching an auger. `state.contract` is not a safe place
   * to ask: progression.js sets `state.contract = null` at settlement (three
   * separate call sites), and `currentMethod` can be walked back to the
   * garage's default by a RIG_CHANGE the shell emits on the way out. Both
   * failures are silent and both change the picture rather than breaking it.
   *
   * drilling.js publishes a `methodId` getter that is the running method by
   * construction, so ask the sim first and keep the rest as fallbacks for
   * previews and for the harness, where there is no sim at all.
   */
  function activeMethodId() {
    return ctx?.sim?.methodId
      || ctx?.state?.contract?.methodId
      || ctx?.state?.drill?.methodId
      || currentMethod;
  }

  function resolveMedium(state) {
    const explicit = state?.drill?.flushMedium || ctx?.sim?.flushMedium;
    if (explicit) return explicit;
    return FLUSH_MEDIUM[activeMethodId()] || 'air';
  }
  let currentMethod = 'auger';

  function driveFromTelemetry(dt, state) {
    const d = state?.drill;
    const drilling = !!(d && d.active) && tickAge < 0.8;

    /* ── the stack ────────────────────────────────────────────────────────
       Idle rig still breathes — but only a rig that is burning something.
       A face jumbo drills on MAINS off a cable reel and starts its diesel
       only to tram, which is why drilling.js publishes `powerMode` at all;
       drawing a plume over an electrically-driven machine is a domain error
       a working driller sees instantly. `powerMode` is only published by the
       method that has the changeover, so this suppresses on the positive
       'mains' and never on an absent field — a method that says nothing
       keeps the plume it has always had. */
    const onMains = powerMode === 'mains';
    if (!onMains) {
      engineLoad = damp(engineLoad, drilling ? clamp(torque * 0.55 + wob * 0.45 + rop / 45, 0, 1) : 0.12, 2.2, dt);
      const stackAmt = 0.30 + engineLoad * 0.95;
      driveKind('exhaustSmoke', stackAmt);
      sootAmt = damp(sootAmt, engineLoad > 0.55 ? (engineLoad - 0.55) / 0.45 : 0, 4.0, dt);
      if (sootAmt > 0.02) driveKind('exhaustSoot', sootAmt);
      /* The backlight lobe is a RIM, so it only exists while there is a key
         to make one: it dies with the sun rather than leaving a warm additive
         smear on the stack at dusk or under heavy overcast. sunUp is sin(sun
         elevation), so this holds full strength above 9.6 deg, falls to 0.30
         at the horizon and to nothing once the sun is 4.1 deg under it.
         UNDERGROUND THERE IS NO KEY AND NO SUN TO ASK. env solves the sun on
         its surface path only, so `sunUp` and `sunColor` in a drive are
         whatever the last daylight frame left behind — a stale afternoon
         rim-lighting a machine 300 m under the rock. The lobe stands down. */
      if (!underground) driveKind('exhaustLight', stackAmt * clamp(0.30 + sunUp * 4.2, 0, 1));
    } else {
      engineLoad = damp(engineLoad, 0, 1.6, dt);
      sootAmt = damp(sootAmt, 0, 2.5, dt);
    }

    /* Motes are backlit dust in still air over an open site. In a drive that
       air belongs to env's raymarched medium, which already carries the
       airborne dust AND the beams that light it — two systems drawing the
       same particulate is the one overlap this file was told to avoid. */
    if (!underground) driveKind('motes', 1);

    if (!drilling) return;

    const ropN = clamp(rop / 32, 0, 1.3);
    const flushN = clamp(flush, 0, 1);
    const returnAmt = clamp(0.18 + ropN * 0.85, 0, 1.4) * (0.30 + flushN * 1.0);

    /* ── methods whose return does not come out of a collar ──────────────
       A driven pile circulates nothing and a CPT circulates nothing; both
       would otherwise fall through the medium switch below and grow the
       three-stage air-flush plume out of the top of a hole they never made.
       RC's return does not surface at the collar either — it goes up the
       inner tube, across the hose and out of the cyclone — so its collar
       gets the small dust the deflector box leaks and nothing more. */
    const collarReturn = programme === 'driven-pile' || programme === 'cpt'
      ? 0 : programme === 'rc' ? 0.22 : 1;
    if (collarReturn > 0) driveCollarReturn(returnAmt * collarReturn, ropN, flushN);
    driveMethod(dt, returnAmt, ropN, flushN);

    // ── cuttings: rate from ROP, transport from flush ───────────────────
    const cut = clamp(0.20 + ropN * 1.05, 0, 1.4);
    if (sectionReturn === 'annulus') {
      driveKind('cuttingChip', cut);
      driveKind('cuttingFines', cut * (0.4 + flushN * 0.8));
    } else if (sectionReturn === 'inner') {
      // Reverse circulation: up the tube, not up the annulus. The fines stay
      // — a shroud at the face catches the sample, not all of the dust.
      driveKind('rcInnerTube', cut * 1.05);
      driveKind('cuttingFines', cut * 0.22);
    } else if (sectionReturn === 'face') {
      driveKind('faceWash', cut * (0.45 + flushN * 0.9));
    }
    // 'none' emits nothing, deliberately.

    // ── hazards that persist while the sim says so ──────────────────────
    if (waterAmt > 0.02) {
      driveKind('waterJet', waterAmt);
      driveKind('waterGlint', waterAmt * 0.8);
      driveKind('waterMist', waterAmt * 0.9);
    }
    if (collapseAmt > 0.02) {
      driveKind('collapseChunk', collapseAmt);
      driveKind('collapseDust', collapseAmt);
    }
    if (cavityAmt > 0.02) {
      driveKind('voidDebris', cavityAmt);
      driveKind('voidDust', cavityAmt * 0.8);
    }

    // ── the groove ──────────────────────────────────────────────────────
    if (grooveAmt > 0.02) {
      const g = grooveAmt;
      driveKind('grooveCore', g);
      driveKind('grooveTrail', g * (0.5 + combo * 0.5));
      driveKind('grooveSurface', g * 0.8);
    }

    // ── weather, if we own it ───────────────────────────────────────────
    if (weatherMode === 'rain') { driveKind('rainDrop', weatherAmt); driveKind('rainSplash', weatherAmt * 0.7); }
    else if (weatherMode === 'snow') { driveKind('snowFlake', weatherAmt); }
  }

  /** The collar return, by flushing medium. Unchanged behaviour, lifted out
   *  of driveFromTelemetry so a method with no collar return can decline it
   *  rather than being scaled to near-zero and still costing pool slots. */
  function driveCollarReturn(returnAmt, ropN, flushN) {
    void ropN; void flushN;
    switch (medium) {
      case 'air':
        driveKind('dustBody', returnAmt * 0.92);
        driveKind('dustPlume', returnAmt);
        driveKind('dustBacklight', returnAmt * 0.85);
        break;
      case 'water':
        driveKind('sprayDrops', returnAmt);
        driveKind('sprayMist', returnAmt * 0.9);
        driveKind('sprayGlint', returnAmt * 0.7);
        break;
      case 'mud':
        driveKind('sprayDrops', returnAmt * 0.75);
        driveKind('sprayMist', returnAmt * 0.6);
        driveKind('mudStreak', returnAmt);
        break;
      case 'foam':
        driveKind('foamClump', returnAmt);
        driveKind('foamMist', returnAmt * 0.7);
        break;
      default: { // 'none' — augers still lift a little fine dust at the collar
        const dry = 0.34 * (1 - stratumWater * 0.7);
        driveKind('dustBody', returnAmt * dry * 1.15);
        driveKind('dustPlume', returnAmt * dry);
        driveKind('dustBacklight', returnAmt * dry * 0.8);
        if (stratumWater > 0.6) driveKind('mudStreak', returnAmt * (stratumWater - 0.6) * 1.6);
        break;
      }
    }
    // A wet hole pushes mud out of the collar no matter the design medium.
    if (waterAmt > 0.15 && medium !== 'mud') driveKind('mudStreak', waterAmt * 0.5);
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE SIX NEW METHODS — sustained emission.
     One branch per programme, each driven by the numbers drilling.js
     actually publishes rather than by rop/flush alone, because for five of
     these six methods rop is not what the player is being judged on and
     therefore not what the picture should be about.
     ══════════════════════════════════════════════════════════════════════ */
  function driveMethod(dt, returnAmt, ropN, flushN) {
    void dt; void returnAmt;
    /* THE HAZARD IS THE PICTURE. Three of these methods have a hazard whose
       whole tell is visual, so the live warning off the tick multiplies the
       kind that shows it rather than adding a separate effect nobody tuned. */
    const hz = hazardAmt;
    switch (programme) {
      /* RC. The stream is DRY or it is WET and they are different machines
         to look at, so they crossfade on d.sampleWet rather than stacking.
         The reject plume runs in both — a wet pile still throws dust where
         the dry fines land on it, just less of it. The per-metre bag cut and
         the blow-down come through purgeAmt as a discrete surge on top. */
      case 'rc': {
        const feed = clamp(0.30 + ropN * 0.85, 0, 1.35) * (0.35 + flushN * 0.90);
        const dry = 1 - clamp(sampleWet, 0, 1);
        const surge = 1 + purgeAmt * 1.6;
        /* A CHOKING TRAIN STOPS DELIVERING AND STARTS LEAKING. That is the
           tell: the stream out of the underflow thins while the fines the
           cyclone can no longer hold go to the air instead. */
        const choke = hazardKind === 'cyclone-choke' ? hz : 0;
        if (dry > 0.02) {
          driveKind('rcChipStream', feed * dry * surge * (1 - choke * 0.75));
          driveKind('rcCycloneDust',
            feed * dry * (0.55 + sampleTrain * 0.5 + choke * 1.4) * surge);
        }
        if (sampleWet > 0.02) driveKind('rcWetSlug', feed * sampleWet * surge);
        // The pile is where the reject lands, so its plume follows the
        // stream that feeds it and dries out as the sample wets up.
        driveKind('rcRejectDust', feed * (0.35 + dry * 0.75) * surge);
        break;
      }

      /* tunnel-jumbo. Percussion, not rate, is what throws the flush back
         off the face, so the spray reads off the WORK control (rpm drives
         the drifter here) and the flush setting, and only lightly off rop.
         The mist is the slow accumulation the drive never quite clears, so
         it lags well behind the spray and keeps running through a boom
         setup or a collar. */
      case 'tunnel-jumbo': {
        const perc = clamp(0.25 + rpm * 0.85, 0, 1.2);
        const wash = perc * (0.30 + flushN * 1.05);
        driveKind('faceSpray', wash * (0.6 + ropN * 0.6));
        driveKind('faceSlurry', wash * (0.35 + ropN * 0.75));
        // Mist survives the beats between holes; spray does not.
        driveKind('faceMist', clamp(0.30 + wash * 0.75, 0, 1.3));
        break;
      }

      /* longhole. An UPHOLE puts the whole return on the machine and the
         operator; a downhole behaves like any other water-flush collar and
         is already covered by driveCollarReturn. Nothing here runs unless
         the sim says the hole points up. */
      case 'longhole': {
        if (!uphole) break;
        /* `uphole-flush` is the hazard where the hole floods back faster
           than it drains and the operator loses the collar. It does not add
           a new effect — it turns the one that is already running up. */
        const flood = hazardKind === 'uphole-flush' ? hz : 0;
        const back = clamp(0.30 + ropN * 0.70, 0, 1.25) * (0.35 + flushN * 1.05)
          * (1 + flood * 1.3);
        driveKind('upholeFlush', back * 1.05);
        driveKind('upholeSludge', back * (0.45 + ropN * 0.55 + flood * 0.6));
        break;
      }

      /* rockbolt. The drilling half is an ordinary water-flush collar. What
         is specific to the method is the INSTALL, and it is a beat, not a
         drill: resin extrudes only while the bar is being spun through the
         cartridges, and stops the moment it gels. `bolt-install` is the beat
         drilling.js names for exactly that window. */
      case 'rockbolt': {
        if (phaseNow !== 'bolt-install') break;
        if (boltType === 'friction') break;   // a split set displaces nothing
        if (boltType === 'cable') driveKind('groutReturn', 1.0);
        else driveKind('resinExtrude', 0.55 + clamp(rpm, 0, 1) * 0.75);
        break;
      }

      /* driven-pile. Every blow throws dust and packing off the head; only a
         damaged head throws concrete. blowPulse is a per-blow envelope, so
         this is a stream of discrete hits rather than a hose — which is what
         a 30–100 bpm hammer looks like. A worn dolly transmits less and
         crushes more, so it feeds the burst as well as the damage does. */
      case 'driven-pile': {
        const hit = clamp(blowPulse, 0, 1);
        if (hit < 0.02) break;
        const spall = hazardKind === 'head-damage' ? hz : 0;
        driveKind('pileBurst', hit * (0.30 + (1 - dollyCond) * 0.55 + spall * 0.4));
        if (headDamage > 0.06 || spall > 0) {
          driveKind('pileSpall', hit * clamp(headDamage * 1.8 + spall, 0, 1.6));
        }
        break;
      }

      /* site-investigation. SPT is driven per blow off d.sptBlows in
         update(); there is nothing to sustain. CPT emits NOTHING — see the
         sptPuff block in EFFECTS. Both cases are deliberate no-ops and are
         written out rather than left to fall through a default, so that a
         later reader can see the silence was chosen. */
      case 'spt': break;
      case 'cpt': break;
      default: break;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     HEAT SHIMMER PLACEMENT
     ══════════════════════════════════════════════════════════════════════ */
  const HOT_REGIONS = { sahara: 1.0, iberian: 0.62, chile: 0.55, german: 0.22, nordic: 0.10, alpine: 0.08, northsea: 0.05, arctic: 0.0 };

  function updateShimmer(dt, state) {
    if (!shimmer) return;
    const cfg = EFFECTS.heatShimmer;
    const regionHeat = HOT_REGIONS[state?.world?.regionId] ?? 0.2;
    const noon = 1 - Math.abs((state?.world?.timeOfDay ?? 0.4) - 0.5) * 2.4;
    const ground = clamp(regionHeat * clamp(noon, 0, 1), 0, 1) * cfg.groundBand;

    const stackHeat = clamp(engineLoad * 1.15 + heatAmt, 0, 1.7);
    heatAmt = Math.max(0, heatAmt - dt * 0.9);
    // Rock flour leaving the collar is genuinely hot; a working hole exhales.
    const collarHeat = clamp(rop / 34, 0, 1) * 0.34 * (tickAge < 0.8 ? 1 : 0);

    const s = shimmer.srcData;
    for (let i = 0; i < 16; i++) s[i] = 0;

    const cam = ctx?.camera;
    let strength = ground;
    if (cam && stackHeat > 0.03) {
      const rig = ctx?.rig;
      if (!resolveVec(rig?.heatAnchor || rig?.dyn?.heat, _v1)) {
        const a = ANCHOR.STACK * 3;
        _v1.set(anchorPos[a], anchorPos[a + 1] + 0.25, anchorPos[a + 2]);
      }
      _v1.project(cam);
      s[0] = _v1.x * 0.5 + 0.5;
      s[1] = _v1.y * 0.5 + 0.5;
      s[2] = 0.13 + stackHeat * 0.07;
      s[3] = _v1.z < 1 ? stackHeat : 0;
      strength += s[3] * 0.9;
    }
    const collarSrc = clamp(stress * 0.7 + grooveAmt * 0.20 + collarHeat, 0, 0.85);
    if (cam && collarSrc > 0.02) {
      const a = ANCHOR.COLLAR * 3;
      _v1.set(anchorPos[a], anchorPos[a + 1] + 0.15, anchorPos[a + 2]).project(cam);
      s[4] = _v1.x * 0.5 + 0.5;
      s[5] = _v1.y * 0.5 + 0.5;
      s[6] = 0.19;
      s[7] = _v1.z < 1 ? collarSrc : 0;
      strength += s[7] * 0.8;
    }

    shimmer.uniforms.uTime.value = time;
    shimmer.uniforms.uGround.value = ground;
    shimmer.uniforms.uStrength.value = cfg.strength * masterFade;
    shimmer.uniforms.uScale.value = cfg.scale;
    shimmer.uniforms.uRise.value = cfg.rise;
    shimmer.uniforms.uChroma.value = cfg.chroma;
    shimmer.uniforms.uHaze.value = cfg.haze ?? 0.34;

    const visible = strength > 0.012 && masterFade > 0.02;
    shimmer.mesh.visible = visible;
    shimmer.reconcile();
    const wants = visible && shimmer.grabOk && cfg.refraction !== false &&
                  tierId === 'high' && shimmer.grabReady();
    shimmer.wantGrab = wants;
    // Opaque grab mode is entered only AFTER a copy has actually landed —
    // otherwise the quad renders an unlit black texture over the scene.
    shimmer.setGrabMode(wants && shimmer.grabbed > 0);
  }

  /* ══════════════════════════════════════════════════════════════════════
     BUS WIRING — downstream only. This module never emits a game event.
     ══════════════════════════════════════════════════════════════════════ */
  /**
   * Is anything actually breaking rock with carbide right now?
   *
   * MEASURED REGRESSION, not a hypothetical: a driven pile run showed 92 live
   * `sparkStreak` particles. A 16 t ram landing on a precast concrete pile
   * head has no carbide on it and cannot spark, and the same is true of a
   * cone being pushed at 20 mm/s. Gating BIT_IMPACT on the impact kind was
   * not enough, because BOULDER, BIT_BROKEN and BIT_WORN all throw sparks of
   * their own and none of them carries a kind. One predicate, used by all
   * four, so the next hazard event added cannot reintroduce it.
   */
  /* THE MIRROR LAGS THE BUS BY A FRAME, AND THAT FRAME IS ENOUGH.
     `programme` is copied off state.drill inside THIS module's update(),
     which main.js runs after the sim's — so every event the sim emits is
     handled while `programme` still holds the previous hole's value, and on
     the first frames of a new one that value is null. rockBreaking() then
     reads "yes" and a pile's opening blows throw carbide. Measured across
     three independent 30 s pile runs: sparkStreak peaked at exactly 92 live
     every time, with programme reading 'driven-pile' in 584 of 585 samples.
     `ctx.sim.methodId` has no such lag — startHole() assigns it before it
     emits anything — so ask the live method as well as the mirror, and the
     window closes. */
  function rockBreaking() {
    if (programme === 'driven-pile' || programme === 'cpt') return false;
    const m = activeMethodId();
    return !(m === 'driven-pile' || m === 'cpt');
  }

  /** Is there a collar with something coming out of it? Same lag, same fix. */
  function hasCollarReturn() {
    if (!rockBreaking()) return false;               // pile, cone
    if (programme === 'rc') return false;            // returns by the hose
    return activeMethodId() !== 'rc';
  }

  function bitAnchor(i) { return anchorPos[ANCHOR.BIT * 3 + i]; }
  function collarAnchor(i) { return anchorPos[ANCHOR.COLLAR * 3 + i]; }

  function wireBus() {
    if (!bus || typeof bus.on !== 'function') return;
    const on = (evt, fn) => { const off = bus.on(evt, fn); if (off) unsubs.push(off); };

    on(EVENTS.DRILL_START, (p) => {
      currentMethod = p?.methodId || currentMethod;
      medium = resolveMedium(ctx?.state);
      tickAge = 0;
      flowPhase = 0;
      stress = 0; waterAmt = 0; cavityAmt = 0; collapseAmt = 0;
    });

    on(EVENTS.DRILL_TICK, (p) => {
      tickAge = 0;
      if (p) {
        if (typeof p.rop === 'number') rop = p.rop;
        if (typeof p.torque === 'number') torque = p.torque;
        if (typeof p.wear === 'number') wear = p.wear;
        if (typeof p.wob === 'number') wob = p.wob;
        if (typeof p.depth === 'number') depth = p.depth;
        if (p.stratum) adoptStratum(p.stratum);
        /* THE LIVE HAZARD. There is no hazard event on the bus — the sim
           publishes the current one inside the tick as `warning`, and for
           three of the new methods the hazard IS the picture (an uphole
           flooding back over the machine, a cyclone choking, a pile head
           spalling). Reading it here costs nothing and needs no new event. */
        const w = p.warning;
        hazardKind = w ? (w.kind || '') : '';
        hazardAmt = w ? clamp((w.severity ?? 0.6) * (w.telegraph ? 0.45 : 1), 0, 1) : 0;
      }
    });

    on(EVENTS.DRILL_STOP, () => { tickAge = 99; });

    on(EVENTS.STRATUM_ENTER, (p) => {
      // Cuttings already in the annulus keep the colour of the rock they came
      // from — which is exactly what a driller sees at a contact.
      if (p?.stratum) adoptStratum(p.stratum);
    });

    on(EVENTS.BIT_IMPACT, (p) => {
      const inten = clamp(p?.intensity ?? 0.6, 0, 1);
      const y = (typeof p?.worldY === 'number') ? p.worldY : bitAnchor(1);
      const bx = bitAnchor(0), bz = bitAnchor(2);
      if (p?.stratum) adoptStratum(p.stratum);
      /* WHAT IS DOING THE HITTING. The sim tags every impact with the
         method's own kind — 'hammer' (percussion on rock), 'drop' (a
         piling ram on a pile head), 'grind' (a rotary bit), 'push' (a cone,
         which is silent and never gets here). Everything below used to fire
         on all of them, which meant a 16 t ram landing on a precast
         concrete pile threw CARBIDE SPARKS and coughed an air-flush plume
         out of a hole that does not exist. Rock debris and sparks belong to
         the two kinds that actually break rock. */
      const impact = p?.kind || (rockBreaking() ? 'hammer' : 'drop');
      const breaksRock = rockBreaking() && (impact === 'hammer' || impact === 'grind');

      /* `bitFlash` is an ADDITIVE hot flash authored above the bloom
         threshold — it is carbide on rock at the instant of the blow, and
         nothing else in this game is incandescent. A 16 t ram on a precast
         concrete head is not: it was still firing there (measured, 6 live on
         a 22 s pile window) because only the sparks and the debris were ever
         gated. The shock RING stays: a pile really does take a compression
         wave on every blow, and it is the visual half of the sound the audio
         agent derives its refusal ping from. */
      if (breaksRock) burstKind(kindOf.bitFlash, 1, 0.7 + inten * 0.8, 1, bx, y, bz);
      if (impact !== 'push') burstKind(kindOf.shockRing, 1, 0.8 + inten * 0.9, 1, bx, y, bz);
      if (breaksRock) {
        burstKind(kindOf.rockChipSprite, EFFECTS.rockChipSprite.burst * inten * loadScale,
          0.75 + inten * 0.5, 0.7 + inten * 0.8, bx, y, bz);
        if (inten > 0.45) burstChips(EFFECTS.chips.burst * inten * 0.6, bx, y, bz, inten);
      }

      // Carbide only throws sparks in genuinely hard ground.
      if (breaksRock && impact === 'hammer' && stratumUcs > 30) {
        const hard = clamp((stratumUcs - 30) / 180, 0, 1);
        const power = inten * (0.35 + hard * 0.9);
        burstKind(kindOf.sparkStreak, EFFECTS.sparkStreak.burst * power * loadScale,
          0.8 + power * 0.5, 0.7 + power * 0.7, collarAnchor(0), collarAnchor(1), collarAnchor(2));
        burstKind(kindOf.sparkEmber, EFFECTS.sparkEmber.burst * power * loadScale, 1, 1,
          collarAnchor(0), collarAnchor(1), collarAnchor(2));
      }
      /* A percussive blow always coughs a little return out of the collar —
         but only where there IS a collar returning something. A driven pile
         and a CPT have neither, and RC's return leaves by the hose. */
      const hasCollar = hasCollarReturn();
      if (breaksRock && hasCollar && (medium === 'air' || medium === 'none')) {
        burstKind(kindOf.dustPlume, (1.5 + inten * 3.5) * loadScale, 0.7, 0.9,
          collarAnchor(0), collarAnchor(1), collarAnchor(2));
        burstKind(kindOf.dustBody, (0.8 + inten * 1.8) * loadScale, 0.9, 0.8,
          collarAnchor(0), collarAnchor(1), collarAnchor(2));
      }
      /* A blow at the face throws the flush back with it. The steady spray
         is driven from telemetry; this is the extra kick per blow that makes
         a 110 Hz drifter read as percussion rather than as a garden hose. */
      if (impact === 'hammer' && (programme === 'tunnel-jumbo' || programme === 'rockbolt')) {
        const h = ANCHOR.HEAD * 3;
        burstKind(kindOf.faceSpray, (1 + inten * 3) * loadScale, 0.9, 1.1,
          anchorPos[h], anchorPos[h + 1], anchorPos[h + 2]);
      }
    });

    on(EVENTS.BOULDER, () => {
      const bx = bitAnchor(0), by = bitAnchor(1), bz = bitAnchor(2);
      /* AN OBSTRUCTION UNDER A PILE IS STILL AN OBSTRUCTION — but nothing is
         cutting it. A pile toe or a cone meeting a boulder deflects, crushes
         and stops; it does not throw carbide flash and rock flakes off a bit
         that is not there. The soil disturbance below is right for all of
         them and is left ungated. */
      if (rockBreaking()) {
        burstKind(kindOf.bitFlash, 1, 1.5, 1, bx, by, bz);
        burstKind(kindOf.rockChipSprite, 26 * loadScale, 1.25, 1.4, bx, by, bz);
        burstChips(EFFECTS.chips.burst * 1.6, bx, by, bz, 1.3);
      }
      burstKind(kindOf.shockRing, 2, 1.5, 1, bx, by, bz);
      if (rockBreaking()) {
        burstKind(kindOf.sparkStreak, 46 * loadScale, 1.25, 1.35,
          collarAnchor(0), collarAnchor(1), collarAnchor(2));
        burstKind(kindOf.sparkEmber, 18 * loadScale, 1.1, 1.1,
          collarAnchor(0), collarAnchor(1), collarAnchor(2));
      }
      burstKind(kindOf.puffSoft, 22 * loadScale, 1.2, 1.1,
        collarAnchor(0), collarAnchor(1), collarAnchor(2));
      burstKind(kindOf.puffGrit, 14 * loadScale, 1, 1.2,
        collarAnchor(0), collarAnchor(1), collarAnchor(2));
      stress = Math.max(stress, 0.5);
    });

    on(EVENTS.WATER_STRIKE, (p) => {
      const flowLpm = p?.flowLpm ?? 60;
      waterAmt = clamp(0.35 + flowLpm / 260, 0, 1.3);
      waterY = bitAnchor(1);
      burstKind(kindOf.waterJet, 44 * loadScale, 1.1, 1.2, bitAnchor(0), waterY, bitAnchor(2));
      burstKind(kindOf.waterMist, 16 * loadScale, 1.2, 1, bitAnchor(0), waterY, bitAnchor(2));
      burstKind(kindOf.waterGlint, 12 * loadScale, 1, 1.1, bitAnchor(0), waterY, bitAnchor(2));
      // The collar return goes wet from here on.
      if (medium === 'air' || medium === 'none') medium = 'water';
      burstKind(kindOf.sprayDrops, 26 * loadScale, 1, 1,
        collarAnchor(0), collarAnchor(1), collarAnchor(2));
    });

    on(EVENTS.CAVITY, (p) => {
      cavityAmt = clamp(0.5 + (p?.height ?? 1) / 6, 0, 1.3);
      burstKind(kindOf.voidDebris, 34 * loadScale, 1.1, 1.1, bitAnchor(0), bitAnchor(1), bitAnchor(2));
      burstKind(kindOf.voidDust, 14 * loadScale, 1.2, 1, bitAnchor(0), bitAnchor(1), bitAnchor(2));
      burstChips(10, bitAnchor(0), bitAnchor(1), bitAnchor(2), 0.7);
    });

    on(EVENTS.JAM, (p) => {
      const sev = clamp(p?.severity ?? 0.5, 0, 1);
      jam = sev;
      stress = Math.max(stress, 0.35 + sev * 0.65);
      collapseAmt = Math.max(collapseAmt, sev * 0.4);
    });
    on(EVENTS.JAM_CLEARED, () => {
      jam = 0;
      stress = Math.min(stress, 0.15);
      /* THE SURGE GOES WHERE THE RETURN GOES. This fired a flat 24-chip
         burst up the annulus and a plume out of the collar for every method
         on the bus, and it is where the RC verification actually failed:
         a 26 s reverse-circulation window measured cuttingChip peaking at
         exactly 24 — the burst size — with sectionReturn reading 'inner' in
         every one of its 520 samples. Reverse circulation returns up the
         INSIDE of the rod; chips in its annulus contradict the name of the
         method. Same story at the collar, which a pile, a CPT and RC do not
         have. The one predicate each, so a fourth path cannot reintroduce
         either — the sparks needed exactly this lesson once already. */
      switch (sectionReturn) {
        case 'annulus':
          burstKind(kindOf.cuttingChip, 24 * loadScale, 1, 1.6, bitAnchor(0), bitAnchor(1), bitAnchor(2));
          break;
        case 'inner':
          // The tube clearing IS the surge on an RC hole, and it is the same
          // carry-over the blow-down beat exists to shift.
          burstKind(kindOf.rcInnerTube, 24 * loadScale, 1, 1.5, bitAnchor(0), bitAnchor(1), bitAnchor(2));
          break;
        case 'face':
          // A heading's bore axis is X; the flush washes out of the face.
          burstKind(kindOf.faceWash, 20 * loadScale, 1, 1.4, bitAnchor(0), bitAnchor(1), bitAnchor(2));
          break;
        default: break;   // 'none' — nothing circulates, nothing surges.
      }
      const hasCollar = hasCollarReturn();
      if (hasCollar) {
        if (medium === 'air' || medium === 'none') {
          burstKind(kindOf.dustPlume, 14 * loadScale, 1.1, 1.2,
            collarAnchor(0), collarAnchor(1), collarAnchor(2));
        } else {
          // A water- or mud-flushed hole clearing coughs its flush, not dust.
          burstKind(kindOf.sprayDrops, 16 * loadScale, 1.1, 1.2,
            collarAnchor(0), collarAnchor(1), collarAnchor(2));
        }
      }
    });

    on(EVENTS.ROD_ADDED, () => {
      const m = ANCHOR.MAST * 3;
      burstKind(kindOf.greaseSmoke, EFFECTS.greaseSmoke.burst * loadScale, 1, 1,
        anchorPos[m], anchorPos[m + 1], anchorPos[m + 2]);
      burstKind(kindOf.greaseWisp, EFFECTS.greaseWisp.burst * loadScale, 1, 1,
        anchorPos[m], anchorPos[m + 1], anchorPos[m + 2]);
      burstKind(kindOf.puffSoft, 12 * loadScale, 0.9, 0.8,
        collarAnchor(0), collarAnchor(1), collarAnchor(2));
      burstKind(kindOf.puffGrit, 8 * loadScale, 1, 1,
        collarAnchor(0), collarAnchor(1), collarAnchor(2));
    });

    // Cable percussion: the bailer comes up loaded and dumps. Grit and a wet
    // puff at the collar, but none of the thread-grease smoke above — there is
    // no joint being made up on a wire rope.
    on(EVENTS.BAILER_RUN, () => {
      burstKind(kindOf.puffSoft, 16 * loadScale, 1.0, 0.9,
        collarAnchor(0), collarAnchor(1), collarAnchor(2));
      burstKind(kindOf.puffGrit, 14 * loadScale, 1.1, 1,
        collarAnchor(0), collarAnchor(1), collarAnchor(2));
    });

    on(EVENTS.BIT_WORN, () => {
      if (!rockBreaking()) return;
      burstKind(kindOf.sparkEmber, 10 * loadScale, 0.9, 0.8,
        collarAnchor(0), collarAnchor(1), collarAnchor(2));
    });
    on(EVENTS.BIT_BROKEN, () => {
      const bx = bitAnchor(0), by = bitAnchor(1), bz = bitAnchor(2);
      burstKind(kindOf.bitFlash, 2, 1.6, 1, bx, by, bz);
      burstKind(kindOf.shockRing, 2, 1.7, 1, bx, by, bz);
      burstKind(kindOf.rockChipSprite, 30 * loadScale, 1.3, 1.5, bx, by, bz);
      burstChips(EFFECTS.chips.burst * 2, bx, by, bz, 1.4);
      if (rockBreaking()) {
        burstKind(kindOf.sparkStreak, 40 * loadScale, 1.2, 1.3,
          collarAnchor(0), collarAnchor(1), collarAnchor(2));
      }
      stress = 1;
    });

    on(EVENTS.HOLE_COMPLETE, () => {
      const cx = collarAnchor(0), cy = collarAnchor(1), cz = collarAnchor(2);
      burstKind(kindOf.flourish, EFFECTS.flourish.burst * loadScale, 1, 1, cx, cy, cz);
      burstKind(kindOf.flourishSpark, EFFECTS.flourishSpark.burst * loadScale, 1, 1, cx, cy, cz);
      burstKind(kindOf.dustBacklight, 10 * loadScale, 1.3, 0.8, cx, cy, cz);
      stress = 0; jam = 0; waterAmt = 0; cavityAmt = 0; collapseAmt = 0;
    });

    on(EVENTS.SCENE_CHANGE, (p) => {
      const site = p?.scene === (ctx?.SCENES?.SITE || 'site');
      masterFade = site ? 1 : 0;
      if (!site) { stopAll(); }
      else { motesSeeded = false; }
    });

    on(EVENTS.QUALITY_CHANGE, (p) => { if (p?.tier) setQuality(p.tier); });

    on(EVENTS.RIG_CHANGE, (p) => {
      if (p?.methodId) currentMethod = p.methodId;
      medium = resolveMedium(ctx?.state);
      burstKind(kindOf.puffSoft, 20 * loadScale, 1.4, 1,
        collarAnchor(0), collarAnchor(1), collarAnchor(2));
    });

    on(EVENTS.REGION_CHANGE, (p) => {
      windSpeed = REGION_WIND[p?.regionId] ?? 1.4;
      birdTimer = rand.range(1.5, 5);
    });
  }

  function adoptStratum(s) {
    if (!s) return;
    const c = (s.colors && s.colors[0]) || GROUND[s.id]?.colors?.[0];
    // GROUND colours are ALBEDOS authored for the section's own lighting, which
    // lands ~1.35 stops brighter than the displayed rock. Particles are lit by
    // their own unlit shader, so scale to the displayed value or cuttings come
    // out visibly paler than the bed they were cut from.
    if (c) stratumColor.set(c).multiplyScalar(0.72);
    if (typeof s.ucs === 'number') stratumUcs = s.ucs;
    if (typeof s.water === 'number') stratumWater = s.water;
  }

  /* ══════════════════════════════════════════════════════════════════════
     LIFECYCLE
     ══════════════════════════════════════════════════════════════════════ */
  let viewW = 1, viewH = 1, viewDpr = 1;
  let flowVel = 0;
  let lastStratumIndex = -1;

  function init() {
    if (atlas) return;
    atlas = makeSpriteAtlas();
    atlas.anisotropy = Math.max(1, ctx?.quality?.anisotropy || 4);
    curveTex = bakeCurveTexture(kinds);
    curveRows = kinds.length * 2;

    refreshTierDemand();
    buildLayers();
    birds = new BirdLayer(32);
    shimmer = new ShimmerQuad(EFFECTS.heatShimmer);

    windSpeed = REGION_WIND[ctx?.state?.world?.regionId] ?? 1.4;
    currentMethod = ctx?.state?.contract?.methodId || ctx?.state?.garage?.methodId || 'auger';
    medium = resolveMedium(ctx?.state);

    const s0 = ctx?.state?.world?.strata?.[0];
    if (s0) adoptStratum(s0);

    bindScenes();
    if (viewW > 1) shimmer.resize(viewW, viewH, viewDpr);
    wireBus();
    // A first flock inside the first breath, not six to eighteen seconds in.
    birdTimer = rand.range(0.5, 1.6);
  }

  function update(dt, state) {
    if (disposed || !atlas) return;
    if (!(dt > 0)) dt = 0;
    if (dt > 0.1) dt = 0.1;
    time += dt;
    tickAge += dt;

    bindScenes();
    const st = state || ctx?.state;

    /* ── mirror the live simulation ─────────────────────────────────────── */
    const d = st && st.drill;
    if (d) {
      if (typeof d.wob === 'number') wob = d.wob;
      if (typeof d.rpm === 'number') rpm = d.rpm;
      if (typeof d.flush === 'number') flush = d.flush;
      if (typeof d.jam === 'number') jam = d.jam;
      if (typeof d.stability === 'number') stability = d.stability;
      if (typeof d.torque === 'number') torque = d.torque;
      if (typeof d.depth === 'number') depth = d.depth;
      if (typeof d.wear === 'number') wear = d.wear;
      if (tickAge > 0.8) rop = damp(rop, 0, 2.4, dt);
      else if (typeof d.rop === 'number') rop = d.rop;

      combo = clamp((d.greenBandTime || 0) / 6, 0, 1);
      const gTarget = d.inGreenBand ? (0.35 + combo * 0.65) : 0;
      grooveAmt = damp(grooveAmt, gTarget, d.inGreenBand ? 3.4 : 1.5, dt);

      if (d.stratumIndex !== lastStratumIndex) {
        lastStratumIndex = d.stratumIndex;
        const s = st?.world?.strata?.[d.stratumIndex];
        if (s) adoptStratum(s);
      }

      /* ── the new methods' own state ─────────────────────────────────────
         Read straight off the mirror, with a typeof guard on each so a
         method that does not publish a field simply leaves the last value
         alone instead of writing NaN into an emission rate. */
      programme = d.programme || null;
      phaseNow = d.phase || '';
      if (typeof d.sampleWet === 'number') sampleWet = clamp(d.sampleWet, 0, 1);
      if (typeof d.sampleHoldUp === 'number') sampleHoldUp = clamp(d.sampleHoldUp, 0, 1);
      if (typeof d.sampleTrainWear === 'number') sampleTrain = clamp(d.sampleTrainWear, 0, 1);
      uphole = d.uphole === true;
      if (typeof d.headDamage === 'number') headDamage = clamp(d.headDamage, 0, 1);
      if (typeof d.dollyCondition === 'number') dollyCond = clamp(d.dollyCondition, 0, 1);
      boltType = d.boltType || '';
      /* Only the jumbo publishes this, and only it has the changeover. An
         absent field must read as '' rather than as 'diesel', so that a
         method with no cable reel keeps the plume it has always had. */
      powerMode = d.powerMode || '';

      /* THE BAG BOUNDARY. RC cuts one bag per metre and blows the string
         down every few metres to clear the inner tube's hold-up; both are
         discrete purges of everything standing in the train, and both are
         far more visible than the steady stream. d.sampleBags counts the
         bags, d.phase names the blow-down, so neither needs a new event. */
      purgeHold -= dt;
      if (programme === 'rc' && typeof d.sampleBags === 'number') {
        /* RATE-LIMITED, and it has to be. These counters run on the sim's
           COMPRESSED clock, not on wall time: the jumbo's hole counter
           advances about 2.8 times a second, and RC's bag counter can move
           just as fast in soft ground. A surge that re-triggers every 350 ms
           is not a surge, it is a new baseline — the envelope would sit
           pinned at its ceiling and the per-metre event would stop reading
           as an event at all. One purge per 1.1 s, which is about the
           fastest a discrete puff can still be seen as discrete. */
        if (sampleBags >= 0 && d.sampleBags > sampleBags && purgeHold <= 0) {
          purgeAmt = Math.max(purgeAmt, 0.65 + sampleHoldUp * 0.55);
          purgeHold = 1.1;
        }
        sampleBags = d.sampleBags;
      } else if (programme !== 'rc') sampleBags = -1;
      // A blow-down is a real beat with its own duration, so it is allowed to
      // hold the envelope up for as long as the beat lasts.
      if (phaseNow === 'blow-down') purgeAmt = Math.max(purgeAmt, 1.15);

      /* A BLOW IS A BLOW, IN EVERY PHASE. drilling.js only emits BIT_IMPACT
         while S.phase === 'drilling', so a pile taking its set and an SPT
         drive — both of which are beats, not drilling — would emit nothing
         at the exact moment the player is watching hardest. The mirrored
         blow counters do not have that hole in them, so the pile head and
         the SPT anvil are driven from those instead. */
      if (programme === 'driven-pile' && typeof d.blows === 'number') {
        if (blowCount >= 0 && d.blows > blowCount && masterFade > 0.02) {
          blowPulse = 1;
          const n = Math.min(4, d.blows - blowCount);   // never a whole beat at once
          const h = ANCHOR.HEAD * 3;
          burstKind(kindOf.pileBurst, EFFECTS.pileBurst.burst * n * loadScale,
            0.85 + (1 - dollyCond) * 0.5, 0.9 + wob * 0.5,
            anchorPos[h], anchorPos[h + 1], anchorPos[h + 2]);
          if (headDamage > 0.06) {
            burstKind(kindOf.pileSpall,
              EFFECTS.pileSpall.burst * n * clamp(headDamage * 1.6, 0, 1.2) * loadScale,
              1, 1, anchorPos[h], anchorPos[h + 1], anchorPos[h + 2]);
          }
          /* The pile is being driven into the ground, and the ground says so:
             a ring of disturbed soil at the toe on every blow. GROUND is the
             collar anchor at pad level, which is exactly where that is. */
          burstKind(kindOf.puffGrit, 3 * n * loadScale, 0.8, 0.9);
        }
        blowCount = d.blows;
      } else blowCount = -1;
      if (programme === 'spt' && typeof d.sptBlows === 'number') {
        if (sptBlowCount >= 0 && d.sptBlows > sptBlowCount && masterFade > 0.02) {
          burstKind(kindOf.sptPuff, EFFECTS.sptPuff.burst * loadScale, 1, 1);
        }
        sptBlowCount = d.sptBlows;
      } else sptBlowCount = -1;
    } else {
      grooveAmt = damp(grooveAmt, 0, 1.5, dt);
      programme = null; phaseNow = ''; powerMode = '';
    }
    /* env owns the mode switch and has a documented single-writer rule about
       it, so ask env first and fall back to the method id only when env is
       absent — which is the shop and garage previews, where there is no env
       at all and the method still has to answer for itself. */
    /* LATCHED, AND IT HAS TO BE. Both inputs blink: env clears
       `undergroundId` for a frame or two around a scene edge, and
       `activeMethodId()` walks back to the garage default whenever
       `state.contract` has been cleared and something restarts a hole
       without it (measured: 32 of 586 frames of a jumbo run reported
       `auger`). An unlatched flag therefore flickers false mid-drive, and
       for one frame each time the sky's dust and the diesel plume come back
       on inside a tunnel. You do not drive out of a heading without a scene
       change, and a scene change calls stopAll(), which is where this is
       released — so latching on is safe and flicker is not. */
    const ugId = ctx?.env?.undergroundId;
    const wasUnderground = underground;
    if (ugId || UNDERGROUND_METHODS[activeMethodId()]) underground = true;
    /* GOING UNDERGROUND KILLS THE SKY'S PARTICLES OUTRIGHT, it does not stop
       feeding them. Motes live 6–13 s, so simply ceasing to emit leaves a
       warm sunlit drift hanging in a drive for the whole of that — measured
       at 106 live on the first frames of a jumbo contract, all of them
       seeded on the surface site before it. One clear of the additive
       surface pool at the transition; everything else in that pool (sparks,
       embers, the groove, the flourish) is driven from the sim or the bus
       and is back inside a frame or two. */
    if (underground && !wasUnderground) {
      layers.surfaceAdd?.clear();
      motesSeeded = false;
      if (birds) birds.clear();
    }
    medium = resolveMedium(st);
    /* A piezocone replaces its parent method wholesale rather than being a
       mode of it, so it is looked up by programme and everything else by
       method id. */
    sectionReturn = programme === 'cpt' ? 'none'
      : (SECTION_RETURN[activeMethodId()] || 'annulus');
    purgeAmt = damp(purgeAmt, 0, 1.8, dt);
    blowPulse = damp(blowPulse, 0, 5.5, dt);

    /* ── hazard envelopes decay on their own physical timescales ────────── */
    waterAmt = damp(waterAmt, 0, 0.075, dt);
    cavityAmt = damp(cavityAmt, 0, 0.45, dt);
    const structural = stability < 0.38 ? (0.38 - stability) / 0.38 : 0;
    collapseAmt = damp(collapseAmt, structural, 0.9, dt);
    stress = damp(stress, clamp(jam, 0, 1) * 0.85, 1.4, dt);

    /* ── adaptive shed: never let VFX be the reason a frame is late ─────── */
    const fps = ctx?.clock?.fps || 60;
    const want = fps > 52 ? 1 : fps > 42 ? 0.78 : fps > 34 ? 0.56 : 0.38;
    loadScale = damp(loadScale, want, 0.7, dt);

    updateAnchors(st);
    updateWind(dt, st);
    updateSun();

    /* ── annulus transport: one integrated scalar drives the whole column ─ */
    const flushVel = 0.30 + clamp(flush, 0, 1) * 2.7;
    const settle = 0.45 + (1 - clamp(flush, 0, 1)) * 1.05;
    const net = flushVel * (1 - clamp(jam, 0, 1) * 0.85) - settle;
    flowVel = damp(flowVel, net, 2.6, dt);
    flowPhase += flowVel * dt;

    /* ── one-off ambience ───────────────────────────────────────────────── */
    if (masterFade > 0.5 && !motesSeeded && !underground && layers.surfaceAdd) {
      motesSeeded = true;
      burstKind(kindOf.motes, EFFECTS.motes.burst * loadScale, 1, 1);
    }
    // Birds do not fly in a drive. (The flock is also the one system here that
    // spawns off a timer rather than off the sim, so it has to be told.)
    if (birds && masterFade > 0.5 && !underground) {
      birdTimer -= dt;
      if (birdTimer <= 0 && birds.count === 0) {
        const cfg = EFFECTS.birds;
        birds.spawnFlock(rand, collarAnchor(0), collarAnchor(1), collarAnchor(2));
        birdTimer = rand.range(cfg.interval[0], cfg.interval[1]);
      }
      birds.update(dt, time);
    }

    /* ── rates ──────────────────────────────────────────────────────────── */
    driverRate.fill(0);
    if (masterFade > 0.02) driveFromTelemetry(dt, st);

    for (let i = 0; i < nKinds; i++) {
      let target = driverRate[i];
      if (extTtl[i] > 0) {
        extTtl[i] -= dt;
        if (extRate[i] > target) target = extRate[i];
      } else if (extRate[i] !== 0) {
        extRate[i] = 0;
      }
      const rising = target > rateNow[i];
      rateNow[i] = damp(rateNow[i], target, rising ? 12 : 3.2, dt);
      if (rateNow[i] < 0.06) { accum[i] = 0; continue; }
      const k = kinds[i];
      accum[i] += rateNow[i] * dt * loadScale * masterFade * k.demand;
      let n = accum[i] | 0;
      if (n <= 0) continue;
      if (n > 72) n = 72;             // hard per-kind, per-frame ceiling
      accum[i] -= n;
      // emitOne(kind, ox, oy, oz, sizeScale, speedScale) — SIX arguments.
      // This used to pass seven, which slid sizeScale onto the `oz` slot and
      // gave every sustained particle a world size of exactly zero. That is
      // why the shipped build drilled at 22 m/h with an empty frame.
      for (let j = 0; j < n; j++) {
        if (!emitOne(k, null, 0, 0, 1, 1)) break;
      }
    }

    /* ── recycle + upload ───────────────────────────────────────────────── */
    const collarY = collarAnchor(1);
    for (let i = 0; i < layerList.length; i++) {
      const L = layerList[i];
      L.sweep(time);
      L.flush();
      const u = L.uniforms;
      u.uFlowPhase.value = flowPhase;
      const section = (L === layers.sectionSoft || L === layers.sectionAdd);
      u.uFloorY.value = section ? bitY : collarY;
      u.uCeilY.value = section ? collarSectionY : 1e5;
      u.uStress.value = section ? stress : stress * 0.25;
    }
    if (chips) {
      chips.sweep(time);
      chips.flush();
      chips.uniforms.uTime.value = time;
      chips.uniforms.uFloorY.value = bitY;
    }

    /* ── per-band plumbing ──────────────────────────────────────────────── */
    const depthTex = findDepthTexture();
    const resW = Math.max(1, viewW * viewDpr);
    const resH = Math.max(1, viewH * viewDpr);
    const surfScene = ctx?.scene || null;
    const sectScene = ctx?.sectionScene || surfScene;
    syncBand(layers.surfaceSoft, ctx?.camera, surfScene, depthTex, resW, resH);
    syncBand(layers.surfaceAdd, ctx?.camera, surfScene, depthTex, resW, resH);
    syncBand(layers.sectionSoft, ctx?.sectionCamera || ctx?.camera, sectScene, depthTex, resW, resH);
    syncBand(layers.sectionAdd, ctx?.sectionCamera || ctx?.camera, sectScene, depthTex, resW, resH);

    updateShimmer(dt, st);
  }

  function resize(w, h, dpr) {
    viewW = w || 1; viewH = h || 1; viewDpr = dpr || 1;
    const resW = Math.max(1, viewW * viewDpr);
    const resH = Math.max(1, viewH * viewDpr);
    for (let i = 0; i < layerList.length; i++) layerList[i].uniforms.uResolution.value.set(resW, resH);
    if (shimmer) shimmer.resize(viewW, viewH, viewDpr);
  }

  function stopAll() {
    for (let i = 0; i < layerList.length; i++) layerList[i].clear();
    if (chips) chips.clear();
    if (birds) birds.clear();
    driverRate.fill(0); extRate.fill(0); extTtl.fill(0);
    rateNow.fill(0); accum.fill(0);
    waterAmt = 0; cavityAmt = 0; collapseAmt = 0;
    stress = 0; grooveAmt = 0; heatAmt = 0;
    // The new methods' envelopes and edge-detectors. Leaving the blow and bag
    // counters at their last value across a scene change would fire a burst
    // on the first frame of the next hole, out of nowhere.
    programme = null; phaseNow = ''; sectionReturn = 'annulus';
    sampleWet = 0; sampleHoldUp = 0; sampleTrain = 0; sampleBags = -1;
    uphole = false; headDamage = 0; dollyCond = 1; boltType = ''; powerMode = '';
    blowCount = -1; sptBlowCount = -1; blowPulse = 0; purgeAmt = 0; purgeHold = 0;
    hazardKind = ''; hazardAmt = 0;
    motesSeeded = false;
    // The underground latch is released HERE and only here — a scene change is
    // the one thing that can take you out of a drive. See update().
    underground = false;
    if (shimmer) { shimmer.mesh.visible = false; shimmer.wantGrab = false; }
  }

  function setQuality(tier) {
    const id = typeof tier === 'string' ? tier : (tier && tier.id) || tierId;
    const scalar = (tier && typeof tier.particles === 'number') ? tier.particles : null;
    const next = TIER_BUDGET[id] ?? Math.round(12000 * clamp(scalar ?? 0.8, 0.15, 1));
    tierId = id;
    if (atlas && tier && tier.anisotropy) {
      atlas.anisotropy = Math.max(1, tier.anisotropy);
      atlas.needsUpdate = true;
    }
    if (!atlas || next === budget) { budget = next; refreshTierDemand(); return; }
    budget = next;
    refreshTierDemand();
    // Pool capacity is a boot-time allocation, so rebuilding here is the one
    // place we intentionally allocate — never during a frame's steady state.
    stopAll();
    destroyLayers();
    buildLayers();
    boundSurface = null; boundSection = null;   // force a re-attach
    bindScenes();
    resize(viewW, viewH, viewDpr);
  }

  const _sustainParams = { rate: 1, duration: 0.4 };

  /* Preallocated so calling stats() every frame from a debug HUD is free. */
  const _stats = {
    live: 0, capacity: 0, budget: 0, tier: '', loadScale: 1,
    layers: {
      surfaceSoft: { live: 0, capacity: 0 },
      surfaceAdd: { live: 0, capacity: 0 },
      sectionSoft: { live: 0, capacity: 0 },
      sectionAdd: { live: 0, capacity: 0 },
    },
    chips: { live: 0, capacity: 0 },
    birds: 0,
    wind: { x: 0, y: 0, z: 0, speed: 0, gust: 0 },
    flowVel: 0, stress: 0, groove: 0, medium: 'air',
    drawCalls: 0,
    /* Per-KIND live counts, so a harness can prove a specific effect is
       actually alive and sized rather than inferring it from a total. This
       is the direct answer to the sizeScale-into-oz bug: 99 dust puffs a
       second that rasterise nothing look identical to a healthy system in
       every aggregate number, and identical to an empty one on screen. */
    kinds: null,
    minSize: 0, maxSize: 0,
    programme: null, sectionReturn: 'annulus',
    /* Both of these change what is emitted, so both have to be visible to a
       harness — otherwise "the exhaust is missing" and "the exhaust is
       correctly suppressed because the jumbo is on mains" look identical. */
    powerMode: '', underground: false,
  };
  /* Built once, keyed by kind id — never reallocated, so stats() stays free
     to call from a debug HUD every frame. */
  _stats.kinds = (() => {
    const o = Object.create(null);
    for (let i = 0; i < kinds.length; i++) o[kinds[i].id] = 0;
    return o;
  })();

  const _statNames = ['surfaceSoft', 'surfaceAdd', 'sectionSoft', 'sectionAdd'];

  /**
   * @param {boolean} [deep] also walk every live slot to tally per-KIND counts
   *   and the min/max world size actually written. O(live), so it is opt-in:
   *   a debug HUD polling every frame does not want it, and a verification
   *   harness cannot do without it. MEASURE, DO NOT ASSERT — a kind emitting
   *   at 118/s with size 0 is indistinguishable from a healthy one in every
   *   aggregate this function returned before.
   */
  function stats(deep) {
    let live = 0, cap = 0;
    for (let i = 0; i < _statNames.length; i++) {
      const L = layers[_statNames[i]];
      const s = _stats.layers[_statNames[i]];
      s.live = L ? L.liveCount : 0;
      s.capacity = L ? L.capacity : 0;
      live += s.live; cap += s.capacity;
    }
    _stats.programme = programme;
    _stats.sectionReturn = sectionReturn;
    _stats.powerMode = powerMode;
    _stats.underground = underground;
    if (deep) {
      const k = _stats.kinds;
      for (const id in k) k[id] = 0;
      let mn = Infinity, mx = 0;
      for (let i = 0; i < _statNames.length; i++) {
        const L = layers[_statNames[i]];
        if (!L) continue;
        for (let j = 0; j < L.liveCount; j++) {
          const idx = L.live[j];
          const kd = kinds[L.aB[idx * 4] | 0];
          if (kd) k[kd.id]++;
          const sz = L.aA[idx * 4 + 2];
          if (sz < mn) mn = sz;
          if (sz > mx) mx = sz;
        }
      }
      _stats.minSize = mn === Infinity ? 0 : mn;
      _stats.maxSize = mx;
    }
    _stats.live = live;
    _stats.capacity = cap;
    _stats.budget = budget;
    _stats.tier = tierId;
    _stats.loadScale = loadScale;
    _stats.chips.live = chips ? chips.liveCount : 0;
    _stats.chips.capacity = chips ? chips.capacity : 0;
    _stats.birds = birds ? birds.count : 0;
    _stats.wind.x = wind.x; _stats.wind.y = wind.y; _stats.wind.z = wind.z;
    _stats.wind.speed = windSpeed; _stats.wind.gust = gust;
    _stats.flowVel = flowVel;
    _stats.stress = stress;
    _stats.groove = grooveAmt;
    _stats.medium = medium;
    _stats.drawCalls = 4 + (chips && chips.liveCount ? 1 : 0) +
      (birds && birds.count ? 1 : 0) + (shimmer && shimmer.mesh.visible ? 1 : 0);
    return _stats;
  }

  function dispose() {
    disposed = true;
    for (let i = 0; i < unsubs.length; i++) { try { unsubs[i](); } catch (e) { /* ignore */ } }
    unsubs.length = 0;
    destroyLayers();
    if (birds) { birds.dispose(); birds = null; }
    if (shimmer) { shimmer.dispose(); shimmer = null; }
    if (atlas) { atlas.dispose(); atlas = null; }
    if (curveTex) { curveTex.dispose(); curveTex = null; }
    boundSurface = null; boundSection = null;
  }

  return {
    init, update, resize, dispose,
    spawn, stopAll, setQuality, stats,
    /* extras used by tooling / the screenshot harness — not part of the
       required surface, but harmless and handy. `sustain` reuses one params
       object so it is safe to call every frame. */
    EFFECTS,
    sustain: (id, mul, duration) => {
      _sustainParams.rate = mul;
      _sustainParams.duration = duration === undefined ? 0.4 : duration;
      spawn(id, _sustainParams);
    },
    getWind: () => wind,
  };
}

export default createVFX;
