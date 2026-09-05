/**
 * DRILLITY I THE GAME — renderer, cameras and the post-processing chain.
 *
 * Owns:
 *   • the single THREE.WebGLRenderer / WebGL2 context
 *   • the two worlds:  SURFACE (perspective, cinematic 3/4)  and
 *                      CROSS-SECTION (orthographic side cut)
 *   • the portrait "stage" letterbox and the two scissored viewport bands
 *   • the post chain: dual-band render → contact AO → bloom → grade → SMAA
 *
 * Both bands are drawn into ONE render target so a single post chain covers
 * them, and the seam between them is authored inside the grade pass: a warm
 * amber ground lip with a channel-spread defocus falloff instead of a hard cut.
 *
 * Public API — see the `api` object near the bottom.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { BRAND, LAYOUT, QUALITY, EVENTS, SCENES, clamp, damp, TAU } from './contract.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Stage geometry — portrait, letterboxed on anything wider or taller.
   ═══════════════════════════════════════════════════════════════════════════ */
const STAGE_ASPECT_MAX = 9 / 16;    // widest portrait stage we ever show
const STAGE_ASPECT_MIN = 9 / 19.5;  // tallest portrait stage we ever show

/**
 * ═══ LOW'S ANTI-ALIASING — DECIDED FOR A 60 fps MID-RANGE PHONE ════════
 *
 * DECISION: LOW runs postScale 1.0 with the SMAA pass BUILT BUT DISABLED —
 * i.e. it finally does what contract.js says it does, `aa: 'none'`. MEDIUM and
 * HIGH keep SMAA. Nothing here is free, so LOW buys nothing.
 *
 * This file has now overridden that one-word declaration twice, in opposite
 * directions, and BOTH overrides rested on numbers that do not reproduce.
 * What follows is what does.
 *
 * ── WHAT WAS CLAIMED ───────────────────────────────────────────
 * Round 1: `postScale = 1.15` — render the whole chain at 1.15 linear, 1.32x
 * the fragments, paid by EVERY pass including the scene render. Round 2 threw
 * that out for SMAA on every tier, on "SMAA +0.108 ms, hard edges -68.1 % —
 * cheaper AND better".
 *
 * ── WHAT REPRODUCES (.qa-post.mjs, 5 INTERLEAVED paired repeats per cell,
 *    batched glFinish timer, RTX 4070 headed Chrome, 4 sessions, 3 tiers) ───
 *
 * 1. NEITHER AA CAN BE TIMED ON THIS MACHINE. The 2x2 (postScale x SMAA)
 *    differences are 0.03-0.21 ms against a per-cell spread of 0.64-2.28 ms
 *    across repeats — an order of magnitude inside the instrument's own noise.
 *    Raising the canvas to 6.67 Mpx does not help: the frame is still 3.4 ms
 *    at 151 draw calls. This GPU is submit-bound and cannot be pushed into the
 *    fill-bound regime a phone lives in. The round-1 and round-2 timings were
 *    read off exactly this noise; the earlier ones were not even paired.
 *
 * 2. THE EDGE METRIC MEASURES BLUR, NOT ALIASING, so it cannot adjudicate
 *    either. Whole-band luma-gradient histogram, surface band, per 1e4 px:
 *
 *      tier / Mpx        cfg              hard    soft   meanAbsGrad
 *      LOW  0.74     1.0  no SMAA        112.5   330.8      3.554
 *                    1.0  SMAA           119.5   328.2      3.588
 *                    1.15 no SMAA         69.9   327.3      2.655
 *      MED  1.32     1.0  no SMAA        109.3   675.2      4.464
 *                    1.0  SMAA           109.7   682.1      4.460
 *                    1.15 no SMAA         64.9   453.4      3.268
 *      HIGH 1.32     1.0  no SMAA        118.1   605.2      4.409
 *                    1.0  SMAA           116.7   611.1      4.423
 *                    1.15 no SMAA         68.2   410.4      3.158
 *      LOW  6.67     1.0  no SMAA         62.0   247.0      3.005
 *                    1.0  SMAA            63.1   248.1      3.038
 *                    1.15 no SMAA         47.3   244.2      2.204
 *
 *    The supersample cuts MEAN gradient over the whole band by 25-28 % in
 *    every session. That is not antialiasing — a 1.32-sample box downsample
 *    softens ground texture, dust and gravel equally with silhouettes. The
 *    "-68.1 % hard edges" that justified round 2 was this same metric reading
 *    a global blur.
 *
 *    SMAA moves all three figures by under 2 % WITH NO CONSISTENT SIGN across
 *    four sessions (+6.2, +0.3, -1.2, +1.8 % hard). It is not inert — the
 *    paired per-pass A/B charges it 0.175 ms at 0.74 Mpx and 0.708 ms at
 *    6.67 Mpx — it is doing the right thing: edge-directed AA preserves
 *    texture, and this scene's gradient budget is dominated by ground texture.
 *    A whole-band histogram is the wrong instrument for it, and no better one
 *    has been built. DO NOT quote an edge percentage for SMAA from this rig.
 *
 * 3. WHAT IS NOT NOISE — the per-pass paired A/B, which does survive:
 *
 *      SMAAPass, LOW at 0.74 Mpx (the phone's real LOW canvas)  0.175 ms
 *                                                              = 4.7 % of frame
 *      SMAAPass, LOW at 6.67 Mpx                               0.708 ms
 *                                                              = 21 % of frame
 *
 *    The pct-of-frame quadruples with resolution. That is the fill-bound
 *    direction, on the tier whose entire purpose is headroom.
 *
 * ── SO THE DECISION RESTS ON WHAT IS DETERMINISTIC ─────────────────────
 *
 *   • A mid-range phone at LOW renders 0.74 Mpx (390x844 CSS, dprCap 1.5) —
 *     the pc1 LOW row above IS the phone case, not an extrapolation of it.
 *   • postScale 1.15 costs 32 % more fragments through the SCENE render —
 *     PBR, shadow lookups, IBL, the AO prepass — which are one to two orders
 *     of magnitude dearer per fragment than anything SMAA touches, and it
 *     grows every render target by 32 % including the half-float HDR pair
 *     (11.9 -> 15.7 MB at LOW). Fill-bound is the regime where that is worst.
 *   • SMAA is three DEPENDENT full-screen passes. On a tile-based mobile GPU
 *     each one is a full framebuffer resolve and re-read — the worst shape
 *     there is for a tiler — plus 0.37 MB of lookup textures.
 *   • LOW is the tier a device drops to because it cannot afford the frame.
 *     Spending a measured 4.7 % of that frame on an effect this project has
 *     never once been able to see is not a trade; it is a habit.
 *
 * The one-word field in contract.js was right the whole time, and both
 * overrides were the renderer quietly deciding on another module's behalf
 * (HANDOFF §8A). LOW: no AA. MEDIUM/HIGH: SMAA, where `aa: 'smaa'` asks for
 * it and the headroom exists.
 *
 * TO RE-ARGUE THIS, you need an instrument this repo does not have: a
 * fill-bound device (a real phone, or a GPU that can be starved), and an edge
 * metric restricted to GEOMETRIC silhouettes — a depth/normal discontinuity
 * mask — rather than a whole-band luma histogram. `__qaPostScale()` still
 * reproduces the round-1 supersample exactly, and `smaaPass.enabled` is the
 * only thing standing between LOW and round 2, so both are one line away.
 */
const POST_SCALE_RETIRED_LOW = 1.15;   // what LOW used to supersample at

/* ═══════════════════════════════════════════════════════════════════════════
   Camera rigs. Metres; the borehole is the world origin and the mast climbs
   +Y. Every mode is reached with a critically damped spring — never a snap.
   ═══════════════════════════════════════════════════════════════════════════ */
const CAMERA_MODES = {
  /* hero — the shot the store page is made of.
     Round 1 moved the eye down to 2.60 m and set look.y 3.40, which framed
     the machine base at 6 % and the crown at 65 % OF THE RAW 54 % BAND. What
     that solve never subtracted is the HUD: on a 780x1688 frame the surface
     band is y 0-912, the status card ends at y~110 and the hazard/telegraph
     strip is anchored at `top: calc(var(--band-surface) - 62px)` and covers
     y 790-905. The usable aperture is therefore 110-790 px, not 0-912, and
     6 % of the band puts the base at y 862 - dead behind the banner. All four
     gameplay shots lost the tracks, the undercarriage and the collar.

     Re-solved against the aperture (see the projection arithmetic below; the
     machine is crawler-lite, a 4.2 m mast on a 0.14 m pivot, ~4.6 m overall):
       look.y 3.40 -> 2.60   the frame centre drops, so the machine rises
       pos.y  2.60 -> 2.25   a lower eye, more upward convergence on the mast
       pos.xz x1.105         backs off so the crown does not tangent the HUD
       look.x -1.40 -> -1.55 holds the mast at 66 % width from further away
     Projected result: base y 736 (54 px of clear ground above the banner),
     tracks y 638-736, crown y 237 (127 px below the status card), horizon
     y 491, mast at 66 % width. Do NOT raise look.y to "lift" the machine -
     the frame centre and the subject move in OPPOSITE directions here.

     Kept from round 1: fov 34 (compresses the treeline into the background)
     and the mast at 66 % width, so the 13 deg sun - which sits 14 deg off the
     camera's right - still rakes its long shadow LEFT into the negative
     space. Backing off along the same ray preserves that sun/camera angle. */
  hero:     { pos: [8.40, 2.25, 10.94], look: [-1.55, 2.60, 0.00], fov: 34, drift: 1.00, stiff: 1.05 },
  mast:     { pos: [4.60, 8.60, 6.20], look: [0.00, 7.60, 0.00], fov: 39, drift: 0.70, stiff: 0.90 },
  downhole: { pos: [1.90, 1.70, 2.90], look: [0.00, 0.42, 0.00], fov: 46, drift: 1.30, stiff: 1.25 },
  /* orbit — the turntable behind 'site' hero shots, shop and garage.
     r3-12-rig-hero measured 1.5 stops under every other shot: median L 30.6
     against 72-112, 54 % of its band below L 32. Nothing about the exposure
     differs - uExposure is one global uniform and env.js solves it once per
     frame for every mode. What differs is the HORIZON. At pos.y 5.40 looking
     at y 3.20 from 13 m the camera pitches 9.6 deg DOWN, which puts the
     horizon at y 244 and leaves 87 % of the band filled with dark ground,
     where hero (pitched 3.4 deg up, horizon y 545) is ~57 % sky. A median is
     a mixture, so the framing alone moved it 1.5 stops.
     orbitY 5.40 -> 2.70 and look.y 3.20 -> 3.05 puts the horizon at y 489,
     within 2 px of hero's 491 and the same 56 % sky share, so one exposure
     now reads the same in both. Radius 13.0 kept: base y 751 clears the
     banner by 39 px, crown y 307. NOTE cfg.pos[1] is only the pre-orbit snap
     - cfg.orbitY is what drives the live rig; they must stay in step. */
  orbit:    { pos: [0.00, 2.70, 13.0], look: [0.00, 3.05, 0.00], fov: 40, drift: 0.55, stiff: 0.75, orbit: 13.0, orbitSpeed: 0.055, orbitY: 2.70 },
  menu:     { pos: [10.8, 4.20, 12.6], look: [0.00, 2.90, 0.00], fov: 34, drift: 0.42, stiff: 0.55, orbit: 16.6, orbitSpeed: 0.017, orbitY: 4.2 },
};

/* ═══════════════════════════════════════════════════════════════════════════
   GRADE — the final look pass. Exactly one texture fetch per channel.
   channel-split (doubles as the seam defocus) → filmic grade in linear →
   seam glow → ACES → sRGB → S-curve → vignette → grain → letterbox.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * ═══ THE SEAM, MEASURED — AND WHAT IS AND IS NOT THIS FILE'S DOING ═══════
 *
 * research/18: surface and cross-section are ONE CONTINUOUS SCENE, "no
 * divider, no seam, no visible split". GAMEDESIGN §1 asks for the same thing.
 * `.qa-seam.mjs` turns that sentence into numbers off the real framebuffer at
 * 390x844 @2, warm, chrome live. Latest run: shots/t2-seam.json (dth, cfa,
 * auger) and shots/t1-seam.json (dth, cfa, rockbolt).
 *
 * ── THE GRADE PASS IS NO LONGER THE PROBLEM — A/B, each term zeroed ─────
 *
 *   seam lip's share of the step   dth 0.28 · cfa 0.27 · auger 0.36 luma
 *                                  (baseStep 95.0/103.5/105.5 vs lipFreeStep
 *                                   95.3/103.8/105.9 — render it with
 *                                   uSeamStrength = 0 and the step does not
 *                                   move)
 *   vignette across the seam       surface x0.886 / section x0.936 (dth)
 *                                  x0.889 / x0.898 (cfa)
 *                                  x0.897 / x0.923 (auger)
 *                                  — within 0.5-5.4 %, continuous.
 *                                  It was x0.657, a 0.61-stop step in ONE
 *                                  pixel, before the single-ellipse rewrite.
 *   warm reach into the surface    0 to 0.5 px on the two open-air methods
 *
 * So of a 95-107 luma step, this file contributes about 0.3. Do not spend
 * another round inside the grade shader looking for the seam.
 *
 * ── WHAT THE STEP ACTUALLY IS ──────────────────────────────────
 *
 *   mean luma 3-12 px above / below the seam, lip rows excluded:
 *     dth    52.4 -> 98.9   (+46.5, 1.89x)
 *     cfa    38.2 -> 139.8  (+101.6, 3.66x)
 *     auger  — stepL +106.9
 *     rockbolt 17.2 -> 107.2 (+90.0, 6.23x)   — underground: the surface band
 *                                              is a tunnel at envIntensity
 *                                              0.15, the cut is lit at 0.56
 *
 *   THE TWO BANDS ARE LIT BY DIFFERENT SUNS — but NOT by as much as this
 *   note used to say, and the error was in the instrument.
 *     surface keySun      az 79.9-103.9°   el 14.8-16.2°   #ffe0a6 (warm)
 *     section sectionKey  az 150.8°        el 49.3°        #e8e5dc (neutral)
 *   Those two azimuths are not the same quantity. The surface one is a SCREEN
 *   azimuth; 150.8 is `sectionKey`'s WORLD azimuth, measured against a camera
 *   pointing somewhere else entirely, and subtracting them produced "47-71°
 *   apart" out of thin air. HANDOFF §8C. `.qa-collar.mjs` now reports each
 *   band's key in THAT BAND'S own screen space, and the honest figure is
 *   22.8° for the cut against 76.3° for nordic's sun: 53.5° apart, BOTH from
 *   the right of frame.
 *
 *   The real defect was one the wrong instrument could not see. The cut's key
 *   was a CONSTANT while the surface sun moves with the region, so
 *   `.probe-suns.mjs` found 14 of 32 sampled region-hours lighting the two
 *   bands from OPPOSITE sides. Fixed in core/env.js — the section lights now
 *   mirror to follow the sun's side at their authored angle; 0 of 32.
 *
 *   THERE IS NO AERIAL PERSPECTIVE BELOW THE SEAM AT ALL — and there should
 *   not be. An orthographic projection has no perspective to haze, and the
 *   section has no depth to fog: every visible mesh in it lies between z -9
 *   and z +2.2, over which the surface's own density buys 0.33 %.
 *     scene.fog         exp2, density 0.0052-0.027
 *     sectionScene.fog  null  — CORRECT ON PURPOSE, see core/env.js
 *     env intensity     0.62 surface / 0.56 section (0.15 / 0.56 underground)
 *
 *   BAND EXPOSURE section/surface mean luma 1.03 (dth), 1.20 (cfa), 1.54
 *   (auger), 1.61 (rockbolt). The first two ARE the author's stated target
 *   (`SECTION_GAIN`); the last two are the surface band moving, not the cut.
 *   Also correct on purpose — the reasoning is recorded in core/env.js.
 *
 * All of it lives in core/env.js, not here.
 *
 * ── AND THE THREE GEOMETRIC CLAIMS, WHICH ARE THIS FILE'S ──────────────
 *
 * Identical on every method measured, because they are camera properties.
 * The first two are FIXED — see `registerBands()`, which solves them from the
 * projection every frame rather than trusting these numbers to stay true:
 *
 *   collarOffsetPx   62.44 -> 0.00   the borehole axis (world 0,0,0) projected
 *                                to x 257.44 in the surface band while the
 *                                section drew it at x 195.00 — GAMEDESIGN §1's
 *                                invariant out by 16.0 % OF THE STAGE WIDTH.
 *   groundAtSeamPx  -22.81 -> 0.00   ground level at the collar projected
 *                                22.8 px ABOVE the seam, so the cut opened
 *                                below where the ground was drawn.
 *                                (`shots/base-collar.json` is the before,
 *                                 `shots/reg-collar.json` the after, both warm
 *                                 on dth / cfa / auger.)
 *
 *   scaleRatio       2.81x   NOT FIXED, and not a framing error — surface
 *                                54.58 CSS px/m at the collar against the
 *                                section's 19.42. A rod crossing the seam
 *                                changes size by 2.81x.
 *
 * scaleRatio is the hard one and it is a genuine design tension, not an
 * oversight. 19.42 px/m is not free to move: world/geology.js authors its
 * gutter (`logWidth` 5.6), its ruler (`rulerWidth` 2.6), `holeRBase/Gain/Max`
 * and its contact bands in SECTION UNITS, so every one of them scales 1:1
 * with px/m — at 54.58 the log and ruler alone want 8.2 units of a 7.15-unit
 * band and `uGeoX` inverts. Its `adoptCameraScale()` also clamps the adopted
 * view to `clamp(h, 12, 160)`, a ceiling of 32.35 px/m on the reference band,
 * so 54.58 is unreachable from that side whatever anyone decides.
 *
 * Matching at the collar the other way needs the hero eye at 38.4 m instead
 * of 13.69 (measured, not estimated: 328 px / 19.42 = 16.89 m of visible
 * height, / 2 tan 12.41°). That puts crawler-lite's 4.2 m mast at 82 px — 25 %
 * of the band against 70 % today, and about 7 % of the frame by area instead
 * of 53 %. It also lifts the eye to ~6.3 m along the ray, which re-opens the
 * horizon/exposure solve in the `orbit` note above and terrain.js's pit-ring
 * framing. The reference frame (research/18) gets both because its rig is
 * genuinely far away. This needs an art decision, not a patch.
 */
const GradeShader = {
  name: 'DrillityGrade',
  uniforms: {
    tDiffuse:      { value: null },
    uResolution:   { value: new THREE.Vector2(1, 1) },
    uTime:         { value: 0 },
    uExposure:     { value: 0.52 },   // env.js solve() drives this; base 1.05 -> 0.56
    uChroma:       { value: 1.25 },   // px of split at the extreme corner
    uGrain:        { value: 0.030 },
    uVignette:     { value: 0.42 },
    // Band-aware vignette. uBandVignette >= 0.5 enables per-band centring;
    // uSectionVignette scales the amount inside the cross-section band, which
    // is a diagram rather than a photograph and should not fall off at its foot.
    uBandVignette:    { value: 1.0 },
    uSectionVignette: { value: 0.28 },
    uSCurve:       { value: 0.30 },
    uSaturation:   { value: 1.06 },
    // uLift is applied in LINEAR light, before ACES, so it is a floor under
    // every pixel in the frame rather than a toe. At (0.008, 0.011, 0.018) it
    // was the sole reason nothing could reach black: measured darkest ground
    // R16 G19 B23 (L 24.4) and zero pixels below L 16 across every frame, and
    // because the blue term was 2.25x the red it made the darks blue as well.
    // Only a token blue survives so the deepest shadow reads slate, not dead.
    uLift:         { value: new THREE.Vector3(0.000, 0.000, 0.002) },
    uGamma:        { value: new THREE.Vector3(1.000, 0.995, 0.980) },
    uGain:         { value: new THREE.Vector3(1.020, 1.000, 0.965) },
    // Round 2. Measured on the rig: lit face, shadow face, deck top and canopy
    // leg ALL read hue 30.9-31.4 deg, saturation only 0.672 -> 0.548 into
    // shadow. Same hue on both sides = the shadow is being filled with a
    // NEUTRAL, not a cool, so the split is doing no separating work. The tint
    // spread was too small to survive the blend weight (see uSplit below), so
    // both ends are opened up: the slate goes cooler and the amber goes
    // hotter, and the amber is re-authored to BRAND.amber's exact hue -
    // 60*(1.086-0.96)/(1.16-0.96) = 37.8 deg against #F59E0B's 37.7 deg - so
    // held highlights pull the machine's hue UP toward the paint rather than
    // down toward the key. Its mean gain is 1.093, i.e. +9.3 % on genuine
    // highlights only: that is the "little gain in the highlight end" the
    // review asked for to close the p99 189-191 -> max 250 dead gap, and it
    // cannot touch a midtone, so it is not a back-door exposure lift.
    uShadowTint:   { value: new THREE.Vector3(0.82, 0.93, 1.14) },  // cool slate
    uHighTint:     { value: new THREE.Vector3(1.16, 1.086, 0.96) }, // warm amber
    uSplit:        { value: 0.55 },
    uStage:        { value: new THREE.Vector4(0, 0, 1, 1) },        // uv rect
    // the two bands' own uv rects (u0, v0, u1, v1), v0 = LOWER edge in GL uv.
    // The vignette needs them because the bands no longer reach uv.y 0 and 1
    // once core/renderer.js carves the HUD chrome off the stage.
    uBandA:        { value: new THREE.Vector4(0, 0.46, 1, 1) },     // surface
    uBandB:        { value: new THREE.Vector4(0, 0, 1, 0.46) },     // section
    uBgDeep:       { value: new THREE.Vector3(0.051, 0.071, 0.098) },
    uSeamY:        { value: 0.46 },
    uSeamFall:     { value: 0.006 },  // was 0.032 = a ~120 px amber wash
    uSeamStrength: { value: 0.22 },   // env.js solve() drives it live
    uSeamColor:    { value: new THREE.Vector3(1.0, 0.68, 0.22) },
    /* RETIRED — kept only so an out-of-tree caller cannot crash on them.
       uSeamCore / uSeamCoreGain / uSeamHot were the additive hot core, i.e.
       the drawn rule research/18 says must not exist. uSeamBlur was the seam
       channel split, which fringed the frame's highest-contrast edge in
       colour. uBandVignette gated a per-band vignette that no longer exists.
       Nothing in the fragment shader reads any of them. */
    uSeamCore:     { value: 0.0008 },
    uSeamCoreGain: { value: 0 },
    uSeamBlur:     { value: 0 },
    uSeamHot:      { value: new THREE.Vector3(1.0, 0.86, 0.52) },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: /* glsl */`
    precision highp float;

    uniform sampler2D tDiffuse;
    uniform vec2  uResolution;
    uniform float uTime;
    uniform float uExposure;
    uniform float uChroma;
    uniform float uGrain;
    uniform float uVignette;
    uniform float uSectionVignette;
    uniform float uSCurve;
    uniform float uSaturation;
    uniform vec3  uLift;
    uniform vec3  uGamma;
    uniform vec3  uGain;
    uniform vec3  uShadowTint;
    uniform vec3  uHighTint;
    uniform float uSplit;
    uniform vec4  uStage;
    uniform vec4  uBandA;
    uniform vec4  uBandB;
    uniform vec3  uBgDeep;
    uniform float uSeamY;
    uniform float uSeamFall;
    uniform float uSeamStrength;
    uniform vec3  uSeamColor;

    varying vec2 vUv;

    const vec3 LUMA = vec3( 0.2126, 0.7152, 0.0722 );

    /* env.js drives uSeamStrength in the 0.22-0.30 range it was authored at
       for an ADDITIVE lip. As a multiplier that would be a 22-30 % warm band,
       still a drawn line. This holds env's control and its relative range
       while putting the peak where the measurement says it belongs: a whisper
       under the ground line, not a rule across the frame. */
    const float SEAM_LIP_GAIN = 0.16;

    float hash21( vec2 p ) {
      p = fract( p * vec2( 123.34, 456.21 ) );
      p += dot( p, p + 45.32 );
      return fract( p.x * p.y );
    }

    vec3 aces( vec3 c ) {
      const mat3 IN = mat3(
        0.59719, 0.07600, 0.02840,
        0.35458, 0.90834, 0.13383,
        0.04823, 0.01566, 0.83777 );
      const mat3 OUT = mat3(
         1.60475, -0.10208, -0.00327,
        -0.53108,  1.10813, -0.07276,
        -0.07367, -0.00605,  1.07602 );
      c = IN * ( c / 0.6 );
      vec3 a = c * ( c + 0.0245786 ) - 0.000090537;
      vec3 b = c * ( 0.983729 * c + 0.4329510 ) + 0.238081;
      return clamp( OUT * ( a / b ), 0.0, 1.0 );
    }

    vec3 toSRGB( vec3 c ) {
      c = max( c, vec3( 0.0 ) );
      return mix( c * 12.92,
                  1.055 * pow( c, vec3( 0.41666 ) ) - 0.055,
                  step( vec3( 0.0031308 ), c ) );
    }

    void main() {

      vec2 uv = vUv;

      /* Everything optical is centred on the 3D, not on the canvas. uStage is
         the rect the two bands actually occupy: once the HUD chrome is carved
         off the stage its centre is no longer the canvas centre (at 390x844
         it sits 68 px above it), and a lens effect centred anywhere else
         reads as a mistake. */
      float rw = max( uStage.z - uStage.x, 1e-3 );
      float rh = max( uStage.w - uStage.y, 1e-3 );
      vec2  rc = vec2( ( uv.x - uStage.x ) / rw - 0.5,
                       ( uv.y - uStage.y ) / rh - 0.5 );
      float r2 = dot( rc, rc );

      float sd = uv.y - uSeamY;

      /* Channel split: lens fringing towards the corners.
         The seam term that used to be added here (uSeamBlur * near * near)
         is gone. It was sold as a defocus, but a radial R/B split at the
         horizontal centre of the frame is very nearly VERTICAL — so it pushed
         red one way and blue the other across the single highest-contrast
         edge in the picture and fringed it in colour. Softening a seam and
         colouring it are not the same thing. */
      float spread = uChroma * r2 * 2.0;
      vec2 dir = normalize( rc + vec2( 1e-5 ) );
      vec2 off = dir * spread / uResolution;

      vec3 col;
      col.r = texture2D( tDiffuse, uv + off ).r;
      col.g = texture2D( tDiffuse, uv ).g;
      col.b = texture2D( tDiffuse, uv - off ).b;
      col = max( col, vec3( 0.0 ) );

      /* filmic grade, still in linear light */
      col *= uExposure;
      col = uGain * ( col + uLift * ( 1.0 - col ) );
      col = pow( max( col, vec3( 0.0 ) ), uGamma );

      float l = dot( col, LUMA );
      col = mix( vec3( l ), col, uSaturation );

      /* The two tint bands must not overlap. Round 1 had the cool one running
         out to l = 0.30 and the warm one starting at l = 0.22 - a MIDTONE -
         so both were applied across the entire midrange and cancelled into
         mud: mean saturation 0.142-0.172 over a median L of 110-129. That is
         why they were pulled apart, and they stay apart here.

         Round 2 re-CENTRES the cool band instead of re-widening it. Tracing
         the measured lit deck (final sRGB 143/97/47) back through the S-curve,
         the sRGB encode and ACES puts it at l = 0.139 - i.e. one thousandth
         under the old 0.14 cut-off - and the shadow face at l ~ 0.065. So the
         old ramp handed the shadow face only shade 0.55 and the lit face 0.00,
         which after x uSplit is a 5 % R:B shift: below the noise floor, hence
         the measured 0.5 deg of hue separation across the whole machine.
         Widening the top end to the requested 0.30 does not fix that - at
         l 0.139 it would give the LIT deck shade 0.64 and cool the very face
         that item 4 needs warmer. Narrowing to 0.045-0.165 instead puts the
         ramp's steep section exactly across the machine's shadow->lit range:
             shadow face l 0.065  shade 0.55 -> 0.93
             lit deck    l 0.139  shade 0.00 -> 0.12
         0.80 of tint difference across the machine against 0.55 before, and
         the cool band still tops out far below the warm band's 0.46 start, so
         there is no overlap and no mud. The lift needed removing; the tint
         range did not. The warm band starts at 0.46 rather than 0.55 so real
         speculars and hot metal all take the amber, and still ends at 1.0 so
         held highlights reach full tint instead of stopping at 89 %. */
      float shade = 1.0 - smoothstep( 0.045, 0.165, l );
      float high  = smoothstep( 0.46, 1.00, l );
      col = mix( col, col * uShadowTint, shade * uSplit );
      col = mix( col, col * uHighTint,   high  * uSplit );

      /* ── THE CUT LIP ───────────────────────────────────────────────────
         research/18-visual-reference.md, the owner's stated target, is
         explicit: surface and cross-section are one continuous scene and
         "there is no divider, no seam, no visible split." What stood here was
         a divider. Measured on the shipped build at 390x844, quality=high,
         two methods:

           lip peak luminance   196-198  (+136 to +148 over the ground either
                                          side of it — a near-white rule)
           lip peak R-B         91-101   (+59 to +85 over local)
           warm reach UPWARD    13-17 CSS px into the surface band
           +11.1 luma added to the surface band 6 px above the seam, on
                                ground that itself reads 32 (an A/B against
                                uSeamStrength = uSeamCoreGain = 0)

         Two things made it a rule rather than a ground line. It was ADDITIVE
         and it ran in linear light BEFORE ACES, where the ground sits around
         0.01, so a fixed term is a 3x lift on dark ground and invisible on
         bright — the darker the frame, the louder the line. And it was
         two-sided, painting amber UP onto a surface that has no reason to
         glow at all.

         Now: a MULTIPLIER on what is already there, one-sided, into the cut
         only. On lit ground it is a faint warm contact — light spilling over
         the lip of an open excavation, which is real. On black ground it is
         nothing, because a bounce cannot brighten what receives no light.
         uSeamStrength keeps its meaning and env.js keeps driving it; only
         what it multiplies has changed. The additive hot core is deleted
         outright: a sub-pixel bright line IS the divider, whatever it is
         called. */
      float lip = exp( -max( -sd, 0.0 ) / max( uSeamFall, 1e-4 ) );
      col *= 1.0 + uSeamColor * ( lip * uSeamStrength * SEAM_LIP_GAIN );

      /* display transform */
      col = aces( col );
      col = mix( col, col * col * ( 3.0 - 2.0 * col ), uSCurve );
      col = toSRGB( col );

      /* ── VIGNETTE — ONE FALLOFF OVER BOTH BANDS ────────────────────────
         The previous term was per-band, and it was inverted. uv.y is
         bottom-origin, so step( uSeamY, uv.y ) is 1 ABOVE the seam — in the
         SURFACE band — and the flag called inSection therefore selected the
         wrong half everywhere it was used. The photographic hero band got the
         reduced uSectionVignette amount and the cross-section, which the
         comment said must not fall off, got the full one. Worse, each band
         was then centred on the OTHER band's rect, which pushed every
         in-band radius past the smoothstep's outer edge, so vig evaluated
         to 0 across both bands and the whole term collapsed into two FLAT
         multipliers with a hard edge between them. A/B measured on the
         shipped build (render with uVignette 0, take the ratio):

           surface band   x0.882 / x0.877   (dth / cfa)
           section band   x0.580 / x0.560
           step across the seam   0.657x — 0.61 stop, in one pixel

         There was no vignette anywhere in the frame; there was a two-step
         exposure ramp whose only edge was the seam. That single number is the
         largest thing the renderer itself was contributing to the seam.

         One ellipse over uStage — the rect the two bands share — replaces
         it. Continuous by construction: the seam is an interior point of the
         falloff and nothing about the term knows where it is. Circular in
         PIXELS, not in uv, so it does not stretch with the band aspect. */
      float rA  = ( rw * uResolution.x ) / max( rh * uResolution.y, 1.0 );
      float vr  = length( rc * vec2( max( rA, 1.0 ), max( 1.0 / rA, 1.0 ) ) );
      float vig = 1.0 - smoothstep( 0.32, 1.05, vr );
      col *= mix( 1.0, vig, clamp( uVignette, 0.0, 1.5 ) );

      /* The one thing that IS legitimately per-band is depth: less light
         reaches the bottom of an open cut than reaches its lip, which is what
         the reference frame shows and what the old term was accidentally
         doing with its flat 0.58. It is kept, but as a ramp that is exactly
         ZERO at the seam and deepens downward, so it can never draw a line.
         uSectionVignette is its amplitude — same uniform, same setGrade
         key, meaning now "how much darker the foot of the cut is than its
         lip" instead of "how much of the vignette the section gets". */
      float intoCut = 1.0 - smoothstep( uBandB.y, uSeamY, uv.y );
      col *= 1.0 - clamp( uSectionVignette, 0.0, 0.95 ) * intoCut * intoCut;

      float g = hash21( gl_FragCoord.xy + fract( uTime ) * 137.0 );
      col += ( g - 0.5 ) * uGrain * ( 1.0 - 0.6 * dot( col, LUMA ) );

      /* letterbox: exact BRAND.bgDeep outside the portrait stage */
      float inStage =
        step( uStage.x, uv.x ) * step( uv.x, uStage.z ) *
        step( uStage.y, uv.y ) * step( uv.y, uStage.w );

      float edge = min(
        min( uv.x - uStage.x, uStage.z - uv.x ),
        min( uv.y - uStage.y, uStage.w - uv.y ) );
      float halo = exp( -max( -edge, 0.0 ) * 26.0 ) * 0.30;
      vec3 outside = uBgDeep * ( 0.72 + halo );

      gl_FragColor = vec4( mix( outside, col, inStage ), 1.0 );
    }`,
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONTACT AO — a band-aware screen-space ambient occlusion.

   The stock SSAOPass / GTAOPass assume one full-screen scene+camera pair; we
   have two scissored bands (perspective + orthographic) inside a single
   buffer, so a stock pass would reconstruct the cross-section band with the
   wrong projection. This pass carries both inverse-projections and both band
   rects and picks per fragment. It is fed by a reduced-resolution view-normal
   + depth prepass of both bands.
   ═══════════════════════════════════════════════════════════════════════════ */
const AOShader = {
  name: 'DrillityContactAO',
  defines: { AO_SAMPLES: 12 },
  uniforms: {
    tDiffuse:    { value: null },
    tNormal:     { value: null },
    tDepth:      { value: null },
    uSeamY:      { value: 0.46 },
    uBandA:      { value: new THREE.Vector4(0, 0.46, 1, 1) },
    uBandB:      { value: new THREE.Vector4(0, 0, 1, 0.46) },
    uInvProjA:   { value: new THREE.Matrix4() },
    uInvProjB:   { value: new THREE.Matrix4() },
    uProjA:      { value: new THREE.Vector2(1, 1) },   // [ P00, P11 ]
    uProjB:      { value: new THREE.Vector2(1, 1) },
    uRadius:     { value: new THREE.Vector2(0.55, 0.45) },
    uMaxDist:    { value: new THREE.Vector2(1.40, 1.00) },
    uIntensity:  { value: 0.85 },
    uBias:       { value: 0.035 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: /* glsl */`
    precision highp float;

    uniform sampler2D tDiffuse;
    uniform sampler2D tNormal;
    uniform highp sampler2D tDepth;
    uniform float uSeamY;
    uniform vec4  uBandA;
    uniform vec4  uBandB;
    uniform mat4  uInvProjA;
    uniform mat4  uInvProjB;
    uniform vec2  uProjA;
    uniform vec2  uProjB;
    uniform vec2  uRadius;
    uniform vec2  uMaxDist;
    uniform float uIntensity;
    uniform float uBias;

    varying vec2 vUv;

    const float GOLDEN = 2.3999632;

    float hash21( vec2 p ) {
      p = fract( p * vec2( 123.34, 456.21 ) );
      p += dot( p, p + 45.32 );
      return fract( p.x * p.y );
    }

    vec3 viewPos( vec2 ndc, float d, mat4 invP ) {
      vec4 c = vec4( ndc, d * 2.0 - 1.0, 1.0 );
      vec4 v = invP * c;
      return v.xyz / v.w;
    }

    void main() {

      vec4 base = texture2D( tDiffuse, vUv );
      float d = texture2D( tDepth, vUv ).x;

      if ( d >= 0.99995 ) { gl_FragColor = base; return; }

      vec4  band;
      mat4  invP;
      vec2  proj;
      float radius, maxDist, persp;

      if ( vUv.y >= uSeamY ) {
        band = uBandA; invP = uInvProjA; proj = uProjA;
        radius = uRadius.x; maxDist = uMaxDist.x; persp = 1.0;
      } else {
        band = uBandB; invP = uInvProjB; proj = uProjB;
        radius = uRadius.y; maxDist = uMaxDist.y; persp = 0.0;
      }

      vec2 bmin = band.xy;
      vec2 bsz  = max( band.zw - band.xy, vec2( 1e-4 ) );

      vec3 P = viewPos( ( vUv - bmin ) / bsz * 2.0 - 1.0, d, invP );

      vec3 N = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;
      float nlen = length( N );
      if ( nlen < 0.25 ) { gl_FragColor = base; return; }
      N /= nlen;

      float invz = mix( 1.0, 1.0 / max( -P.z, 0.20 ), persp );
      vec2 uvR = min( proj * ( radius * invz ) * 0.5 * bsz, bsz * 0.22 );

      float rot = hash21( gl_FragCoord.xy ) * 6.2831853;
      float occ = 0.0;

      for ( int i = 0; i < AO_SAMPLES; i ++ ) {
        float fi = float( i ) + 0.5;
        float ang = fi * GOLDEN + rot;
        float rad = sqrt( fi / float( AO_SAMPLES ) );
        vec2 sUv = vUv + vec2( cos( ang ), sin( ang ) ) * rad * uvR;

        if ( sUv.x < bmin.x || sUv.y < bmin.y ||
             sUv.x > bmin.x + bsz.x || sUv.y > bmin.y + bsz.y ) continue;

        float sD = texture2D( tDepth, sUv ).x;
        if ( sD >= 0.99995 ) continue;

        vec3 SP = viewPos( ( sUv - bmin ) / bsz * 2.0 - 1.0, sD, invP );

        vec3 V = SP - P;
        float dist = length( V );
        if ( dist < 1e-4 || dist > maxDist ) continue;

        float nd = max( dot( N, V / dist ) - uBias, 0.0 );
        occ += nd / ( 1.0 + dist * dist * 2.0 );
      }

      float ao = 1.0 - clamp( occ / float( AO_SAMPLES ) * uIntensity * 3.0, 0.0, 1.0 );

      /* never crush hot pixels — sparks, hot metal and amber stay clean */
      float lum = dot( base.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
      float protect = 1.0 - smoothstep( 0.70, 2.40, lum );

      gl_FragColor = vec4( base.rgb * mix( 1.0, ao, protect ), base.a );
    }`,
};

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */
/** Raw sRGB components of a #rrggbb string — NOT colour-managed. */
function srgbVec3(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  return new THREE.Vector3(
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  );
}

/** Linear-sRGB components of a brand colour (Color() does the conversion). */
function linearVec3(hex) {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

/** Critically damped spring. Sub-steps so a long frame can never blow it up. */
class Spring3 {
  constructor(x = 0, y = 0, z = 0) {
    this.value = new THREE.Vector3(x, y, z);
    this.vel = new THREE.Vector3();
    this.target = new THREE.Vector3(x, y, z);
  }
  snap(v) { this.value.copy(v); this.target.copy(v); this.vel.set(0, 0, 0); }
  step(freq, dt) {
    const w = TAU * Math.max(freq, 0.01);
    const maxStep = 0.5 / w;
    let remain = dt;
    let guard = 0;
    while (remain > 1e-6 && guard++ < 12) {
      const h = Math.min(remain, maxStep);
      remain -= h;
      this.vel.x += (-2 * w * this.vel.x - w * w * (this.value.x - this.target.x)) * h;
      this.vel.y += (-2 * w * this.vel.y - w * w * (this.value.y - this.target.y)) * h;
      this.vel.z += (-2 * w * this.vel.z - w * w * (this.value.z - this.target.z)) * h;
      this.value.x += this.vel.x * h;
      this.value.y += this.vel.y * h;
      this.value.z += this.vel.z * h;
    }
    return this.value;
  }
}

/** The dual-band scene pass. Head of the composer chain, never swaps. */
class BandRenderPass extends Pass {
  constructor(draw) {
    super();
    this.draw = draw;
    this.needsSwap = false;
  }
  render(renderer, writeBuffer, readBuffer) {
    this.draw(renderer, this.renderToScreen ? null : readBuffer);
  }
}

const TIERS = [QUALITY.LOW, QUALITY.MEDIUM, QUALITY.HIGH];
const tierIndex = (q) => {
  const i = TIERS.findIndex((t) => t.id === (q && q.id));
  return i < 0 ? 1 : i;
};

/* ═══════════════════════════════════════════════════════════════════════════
   FACTORY
   ═══════════════════════════════════════════════════════════════════════════ */
export function createRenderer(ctx) {

  /* ── context ────────────────────────────────────────────────────────── */
  const canvas = ctx.canvas || document.getElementById('gl') || document.createElement('canvas');
  const wantShotBuffer = typeof location !== 'undefined' && /[?&]shot\b/.test(location.search || '');

  const gl = new THREE.WebGLRenderer({
    canvas,
    antialias: false,             // SMAA / internal scale instead
    alpha: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: wantShotBuffer,
    failIfMajorPerformanceCaveat: false,
  });

  const clearDeep = new THREE.Color(BRAND.bgDeep);

  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.toneMapping = THREE.ACESFilmicToneMapping;   // the grade pass mirrors this
  gl.toneMappingExposure = 0.52;   // matches the grade base; see env.js solve()
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  gl.autoClear = true;
  gl.setClearColor(clearDeep, 1);
  gl.info.autoReset = false;

  /* ── worlds ─────────────────────────────────────────────────────────── */
  const scene = new THREE.Scene();
  scene.name = 'surface';

  const sectionScene = new THREE.Scene();
  sectionScene.name = 'section';
  sectionScene.background = new THREE.Color(BRAND.bgDeep);

  const camera = new THREE.PerspectiveCamera(42, 9 / 16, 0.25, 2500);
  camera.name = 'surfaceCamera';
  camera.position.set(...CAMERA_MODES.menu.pos);
  camera.lookAt(new THREE.Vector3(...CAMERA_MODES.menu.look));
  scene.add(camera);

  const sectionCamera = new THREE.OrthographicCamera(-4, 4, 7, -7, 0.1, 200);
  sectionCamera.name = 'sectionCamera';
  sectionCamera.position.set(0, 0, 30);
  sectionCamera.lookAt(0, 0, 0);
  sectionScene.add(sectionCamera);

  /* ── layout state ───────────────────────────────────────────────────── */
  let cssW = 1, cssH = 1, pixelRatio = 1;
  const stage = { x: 0, y: 0, w: 1, h: 1 };
  const newBand = () => ({
    x: 0, y: 0, w: 1, h: 1,          // CSS px, top-left origin
    cy: 0,                           // CSS px, GL bottom-left origin
    gx: 0, gy: 0, gw: 1, gh: 1,      // canvas device px, GL origin
    uv: new THREE.Vector4(),         // uv rect inside the drawing buffer
  });
  const bands = { surface: newBand(), section: newBand() };
  /* The two bands together, in CSS px. Equal to `stage` until the HUD chrome
     is carved off; after that it is the part of the stage the 3D actually
     owns, and it — not `stage` — is what the grade's vignette, edge halo and
     letterbox are anchored to. */
  const bandsRect = { x: 0, y: 0, w: 1, h: 1 };
  let seamUv = 1 - LAYOUT.surfaceHeight;
  let deviceW = 1, deviceH = 1;

  /* ── post chain ─────────────────────────────────────────────────────── */
  let composer = null;
  let bandPass = null;
  let aoPass = null;
  let bloomPass = null;
  let gradePass = null;
  let smaaPass = null;
  let aoTarget = null;
  let aoScale = 0.6;
  let postScale = 1;               // > 1 = supersample (the LOW-tier AA)
  let postScaleOverride = null;    // QA only — see __qaPostScale()
  let postOK = false;
  let warned = false;
  const normalMaterial = new THREE.MeshNormalMaterial();

  const warnOnce = (msg, e) => {
    if (warned) return;
    warned = true;
    console.warn('[renderer]', msg, e && e.message ? e.message : '');
  };

  /* ── camera rig state ───────────────────────────────────────────────── */
  let mode = 'menu';
  const posSpring = new Spring3(...CAMERA_MODES.menu.pos);
  const lookSpring = new Spring3(...CAMERA_MODES.menu.look);
  let fovCurrent = CAMERA_MODES.menu.fov;
  /* The surface band's aspect as authored (LAYOUT.surfaceHeight of the stage)
     and as actually laid out. They differ only while the HUD chrome is inset. */
  let refBandAspect = STAGE_ASPECT_MAX / LAYOUT.surfaceHeight;
  let bandAspect = refBandAspect;
  /** An authored vertical FOV, re-solved to hold the same HORIZONTAL field. */
  const fovForBand = (fovDeg) => {
    if (Math.abs(bandAspect - refBandAspect) < 1e-4) return fovDeg;
    const halfW = Math.tan(THREE.MathUtils.degToRad(fovDeg) * 0.5) * refBandAspect;
    return clamp(THREE.MathUtils.radToDeg(Math.atan(halfW / bandAspect)) * 2, 8, 120);
  };
  let orbitAngle = Math.atan2(CAMERA_MODES.menu.pos[0], CAMERA_MODES.menu.pos[2]);

  let trauma = 0;
  let traumaDecay = 1.6;
  let gradeExposure = 0.52;        // env.js solve() overwrites this every solve
  let time = 0;

  let focus = null;                // { pos, look, fov, until }
  const tmpBox = new THREE.Box3();
  const tmpSphere = new THREE.Sphere();
  /**
   * Camera drift amplitude in metres. **0 = locked off, which is the default.**
   * See the note at the drift calculation for why. Was 0.052.
   */
  const CAMERA_DRIFT = 0;

  const drift = new THREE.Vector3();
  const shakeOffset = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const scratch = new THREE.Vector3();

  /* Metres of borehole visible in the cut.
     createRenderer runs BEFORE createGeology, so ctx.sectionCamera already
     exists when geology evaluates `if (h > 4) viewMetres = h` - geology's
     authored CFG.viewMetres (42) never survives, THIS number wins, and
     updateSectionCamera() below then re-adopts it back out of ctx.sectionView.
     The two therefore have to agree by construction. The art-directed number
     is 20 m: 19.4 CSS px/m in the 456 px band, 2-4 beds in frame at once, and
     ruler numerals landing at 21.6 px. (At 14 m every layout constant geology
     authored against 9.24 px/m was 3x oversized - a 71 px borehole at 18 % of
     screen width, a depth plate wider than the frustum.) The geology owner is
     fixing their side to expect 20; the adoption path stays intact so a future
     owner-driven change still wins. */
  let sectionViewH = 20;
  let sectionCamY = 0;
  let sectionFollow = 'auto';      // 'auto' | true | false — see updateSectionCamera

  /* ── adaptive quality ───────────────────────────────────────────────── */
  let lowFpsTime = 0;
  let qualityCooldown = 4;
  /* ?quality=high was being silently downgraded to medium before the first
     interactive frame: procedural asset generation stalls the loop for
     seconds, main.js clamps dt to 1/15 s, so ctx.clock.fps bottoms out at ~15
     and the adaptive path "measured" a slow device that does not exist.
     Two guards. (1) A tier the URL pinned is never adapted - it is an explicit
     instruction from a QA harness or a support call, and silently overriding
     it makes every shot incomparable. (2) Nothing is counted during the first
     ADAPTIVE_GRACE seconds of STEPPED time; a stall cannot fast-forward that,
     because a stalled frame contributes at most one clamped dt. */
  const ADAPTIVE_GRACE = 5;        // seconds of stepped time before adapting
  let qualityPinned = null;        // lazily resolved: ctx.qs may be wired late

  /* ═══════════════════════════════════════════════════════════════════════
     Layout
     ═══════════════════════════════════════════════════════════════════════ */
  function setBand(band, x, y, w, h) {
    band.x = x; band.y = y;
    band.w = Math.max(1, w); band.h = Math.max(1, h);
    band.cy = cssH - (y + band.h);
    band.gx = Math.round(x * pixelRatio);
    band.gy = Math.round(band.cy * pixelRatio);
    band.gw = Math.max(1, Math.round(band.w * pixelRatio));
    band.gh = Math.max(1, Math.round(band.h * pixelRatio));
    band.uv.set(
      x / cssW,
      1 - (y + band.h) / cssH,
      (x + band.w) / cssW,
      1 - y / cssH,
    );
  }

  /**
   * How many CSS pixels of the stage the HUD chrome has reserved, top and
   * bottom. `LAYOUT.surfaceHeight` / `sectionHeight` split WHAT IS LEFT.
   *
   * Preferred source is `ctx.hud = { top, bottom }`, which ui/screens/site.js
   * publishes as the MEASURED heights of `.sstrip` and `.sitedock` — twice per
   * run plus once per resize. It has to be measured: `.sitedock--plain`
   * declares `--hud-dock` on the element itself and therefore beats the two
   * viewport-height media queries, so the dock resolves to 189/203/227/249 px
   * depending on the method AND the screen, and no single fraction expresses
   * that. `LAYOUT.chromeTop` / `chromeBottom` are the fallback for the first
   * frame of a run, before the site screen has had a layout pass.
   *
   * Two coordinate corrections the raw numbers need:
   *   • `ctx.hud` is measured against the VIEWPORT (`.ui-stage` is
   *     `height:100%` of a fixed `#app`), while `stage` is a letterboxed
   *     sub-rect of it. They coincide whenever `stage.y === 0`, which holds
   *     for every aspect at or above STAGE_ASPECT_MIN — but on a 9:19.5+
   *     phone (390x932 gives `stage.y` 44) the strip and dock still sit at
   *     the viewport edges, OUTSIDE the stage, and only the part that
   *     overlaps the stage may be carved off it.
   *   • the chrome may never eat the bands. A stale or absurd measurement is
   *     clamped so the two bands always keep at least CHROME_MAX_SHARE of the
   *     stage between them.
   */
  const CHROME_MAX_SHARE = 0.30;   // bands never drop below 30 % of the stage
  const chrome = { top: 0, bottom: 0 };

  /**
   * The chrome exists on exactly one screen. `ctx.state.scene` — not the
   * SCENE_CHANGE event — is the truth here, because the event fires only on a
   * real transition: re-showing the site screen while it is already current
   * returns early in ui/shell.js `show()` without emitting, and a renderer
   * rebuilt under a hot reload would never see the transition at all.
   * SCENE_CHANGE is only the trigger to re-derive.
   */
  const onSiteScene = () => !!(ctx.state && ctx.state.scene === SCENES.SITE);
  let chromeScene = false;         // last value acted on, for change detection

  function resolveChrome() {
    chromeScene = onSiteScene();
    if (!chromeScene) { chrome.top = 0; chrome.bottom = 0; return chrome; }

    const hud = ctx.hud;
    const measured = !!(hud
      && Number.isFinite(hud.top) && Number.isFinite(hud.bottom)
      && hud.top >= 0 && hud.bottom >= 0 && (hud.top + hud.bottom) > 0);

    let t, b;
    if (measured) {
      // viewport px -> stage px: drop the part that falls in the letterbox
      t = hud.top - stage.y;
      b = hud.bottom - (cssH - (stage.y + stage.h));
    } else {
      t = stage.h * LAYOUT.chromeTop;
      b = stage.h * LAYOUT.chromeBottom;
    }

    t = Math.max(0, t);
    b = Math.max(0, b);
    const budget = stage.h * (1 - CHROME_MAX_SHARE);
    if (t + b > budget) { const k = budget / (t + b); t *= k; b *= k; }

    chrome.top = Math.round(t);
    chrome.bottom = Math.round(b);
    return chrome;
  }

  function computeLayout(w, h, dpr) {
    cssW = Math.max(1, w);
    cssH = Math.max(1, h);
    pixelRatio = Math.max(0.5, dpr);
    deviceW = Math.max(1, Math.round(cssW * pixelRatio));
    deviceH = Math.max(1, Math.round(cssH * pixelRatio));

    const a = cssW / cssH;
    let sw, sh;
    if (a > STAGE_ASPECT_MAX) { sh = cssH; sw = cssH * STAGE_ASPECT_MAX; }
    else if (a < STAGE_ASPECT_MIN) { sw = cssW; sh = cssW / STAGE_ASPECT_MIN; }
    else { sw = cssW; sh = cssH; }

    stage.w = Math.max(1, Math.round(sw));
    stage.h = Math.max(1, Math.round(sh));
    stage.x = Math.round((cssW - stage.w) * 0.5);
    stage.y = Math.round((cssH - stage.h) * 0.5);

    /* carve the chrome off FIRST, then split the remainder 54/46 — the spec
       is a share of what the player can see, not of the whole stage */
    const c = resolveChrome();
    const bandsY = stage.y + c.top;
    const bandsH = Math.max(2, stage.h - c.top - c.bottom);

    const surfH = Math.max(1, Math.round(bandsH * LAYOUT.surfaceHeight));
    const sectH = Math.max(1, bandsH - surfH);

    setBand(bands.surface, stage.x, bandsY, stage.w, surfH);
    setBand(bands.section, stage.x, bandsY + surfH, stage.w, sectH);

    seamUv = 1 - (bandsY + surfH) / cssH;

    /* the bands no longer cover the stage, so the letterbox colour would show
       through the chrome rows. It never does — the strip and the dock are
       opaque DOM on top of them — but `uStage` is also what the grade's
       vignette and edge halo are anchored to, and those must follow the 3D. */
    bandsRect.x = stage.x; bandsRect.y = bandsY;
    bandsRect.w = stage.w; bandsRect.h = bandsH;

    /* The inset changes how much of the stage the 3D owns. It must not change
       how big the machine is inside it — the same rule updateSectionFrustum()
       applies to the cut. `camera.fov` is VERTICAL, so a band that lost 28 %
       of its height at a fixed fov also lost 28 % of the rig: measured at
       390x844 the surface band goes 456 -> 328 px and the authored 42 deg
       widens the horizontal field from 36.4 to 49.5 deg, shrinking the hero
       by more than a quarter because the HUD got smaller. fovForBand() holds
       the horizontal field instead; with no chrome the two are identical. */
    refBandAspect = stage.w / Math.max(1, stage.h * LAYOUT.surfaceHeight);
    bandAspect = bands.surface.w / Math.max(1, bands.surface.h);
    camera.aspect = bandAspect;
    camera.updateProjectionMatrix();
    updateSectionFrustum();

    updateTitleCamera();

    ctx.stage = stage;
    ctx.bands = bands;
    ctx.chrome = chrome;
  }

  /** Re-derive the bands at the current size — no render-target realloc. */
  function relayout() {
    computeLayout(cssW, cssH, pixelRatio);
    syncStatic();
  }

  /**
   * THE CUT HAS AN AUTHORED WIDTH, NOT AN AUTHORED HEIGHT.
   *
   * This used to fix the vertical extent at `sectionViewH` metres and let the
   * width follow the band's aspect. That was harmless only while the band was
   * exactly `LAYOUT.sectionHeight` of the stage — which is the one assumption
   * the HUD-chrome inset breaks. At 390x844 the section band goes 388 -> 279
   * CSS px, the aspect goes 1.005 -> 1.398, and holding 20 m vertically widens
   * the frustum from 20.1 m to 28.0 m of ground. Measured consequence: the
   * strata plane stopped reaching the edges and ~55 CSS px of bare backdrop
   * appeared down each side of the cut.
   *
   * world/geology.js is the reason, and it is not a bug on its side. It sizes
   * its own layout from `LAYOUT.sectionHeight * window.innerHeight`, not from
   * `ctx.bands.section.h` (`computeView()`), so its `halfW`, its log gutter,
   * its ruler column and its 19.4 px/m are all authored against the reference
   * aspect. Its `adoptCameraScale()` then REJECTS a camera whose aspect is
   * more than 35 % off that reference, so it will not follow the renderer
   * across this change either.
   *
   * Anchoring the width instead makes both true at once: `stage.w / (2*hw)` is
   * now a constant 19.4 CSS px per metre whatever the band height, which is
   * exactly the number geology laid itself out against, and the visible depth
   * (20 m -> 14.4 m) is simply what a shorter band can show at that scale.
   * With no chrome the two forms are identical, so nothing else moves.
   */
  function updateSectionFrustum() {
    const aspect = bands.section.w / Math.max(1, bands.section.h);
    const refAspect = stage.w / Math.max(1, stage.h * LAYOUT.sectionHeight);
    const hw = sectionViewH * 0.5 * refAspect;
    const hh = hw / Math.max(0.25, aspect);
    sectionCamera.left = -hw;
    sectionCamera.right = hw;
    sectionCamera.top = hh;
    sectionCamera.bottom = -hh;
    sectionCamera.updateProjectionMatrix();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     Band drawing — one target, two scissored viewports.
     ═══════════════════════════════════════════════════════════════════════ */
  function applyBand(renderer, target, band) {
    if (target) {
      // composer targets can be sized at a fraction/multiple of the canvas
      const tw = Math.floor(target.width);
      const th = Math.floor(target.height);
      const sx = tw / deviceW;
      const sy = th / deviceH;
      const x = Math.round(band.gx * sx);
      const y = Math.round(band.gy * sy);
      const w = Math.max(1, Math.min(tw - x, Math.round(band.gw * sx)));
      const h = Math.max(1, Math.min(th - y, Math.round(band.gh * sy)));
      target.viewport.set(x, y, w, h);
      target.scissor.set(x, y, w, h);
      target.scissorTest = true;
      renderer.setRenderTarget(target);
    } else {
      renderer.setViewport(band.x, band.cy, band.w, band.h);
      renderer.setScissor(band.x, band.cy, band.w, band.h);
      renderer.setScissorTest(true);
    }
  }

  function releaseBands(renderer, target) {
    if (target) {
      const tw = Math.floor(target.width);
      const th = Math.floor(target.height);
      target.viewport.set(0, 0, tw, th);
      target.scissor.set(0, 0, tw, th);
      target.scissorTest = false;
      renderer.setRenderTarget(target);
    }
    renderer.setViewport(0, 0, cssW, cssH);
    renderer.setScissor(0, 0, cssW, cssH);
    renderer.setScissorTest(false);
  }

  function drawBands(renderer, target) {
    // 1. flood the whole buffer (letterbox included) with deep slate
    releaseBands(renderer, target);
    renderer.setRenderTarget(target || null);
    renderer.setClearColor(clearDeep, 1);
    renderer.clear(true, true, true);

    // 2. SURFACE band — the rig, sky, weather
    applyBand(renderer, target, bands.surface);
    renderer.render(scene, camera);

    // 3. CROSS-SECTION band — the borehole cutaway
    applyBand(renderer, target, bands.section);
    renderer.render(sectionScene, sectionCamera);

    // 4. hand the buffer back full-screen for the post chain
    releaseBands(renderer, target);
  }

  /* ── AO view-normal + depth prepass ─────────────────────────────────── */
  const hiddenForAO = [];

  /** Sky domes, cloud decks, backdrops and VFX must not pollute the G-buffer. */
  function skipInAO(o) {
    if (o.isPoints || o.isSprite || o.isLine) return true;
    if (o.userData && o.userData.noAO) return true;
    const m = o.material;
    if (!m) return false;
    if (Array.isArray(m)) return m.length > 0 && m.every((x) => x && (x.depthWrite === false || x.transparent === true));
    return m.depthWrite === false || m.transparent === true;
  }

  function collectNoAO(root) {
    root.traverse((o) => {
      if (!o.visible) return;
      if (skipInAO(o)) {
        o.visible = false;
        hiddenForAO.push(o);
      }
    });
  }

  function renderAOPrepass(renderer) {
    if (!aoTarget) return;

    const prevA = scene.overrideMaterial;
    const prevB = sectionScene.overrideMaterial;
    const prevBg = sectionScene.background;
    const prevShadow = renderer.shadowMap.enabled;

    try {
      collectNoAO(scene);
      collectNoAO(sectionScene);

      scene.overrideMaterial = normalMaterial;
      sectionScene.overrideMaterial = normalMaterial;
      sectionScene.background = null;
      renderer.shadowMap.enabled = false;

      releaseBands(renderer, aoTarget);
      renderer.setRenderTarget(aoTarget);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, false);

      applyBand(renderer, aoTarget, bands.surface);
      renderer.render(scene, camera);

      applyBand(renderer, aoTarget, bands.section);
      renderer.render(sectionScene, sectionCamera);

      releaseBands(renderer, aoTarget);
    } finally {
      // the scenes belong to everyone — they must come back intact even if the
      // prepass throws, or the whole game renders as normals from here on
      scene.overrideMaterial = prevA;
      sectionScene.overrideMaterial = prevB;
      sectionScene.background = prevBg;
      renderer.shadowMap.enabled = prevShadow;
      renderer.setClearColor(clearDeep, 1);
      for (const o of hiddenForAO) o.visible = true;
      hiddenForAO.length = 0;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     Post chain
     ═══════════════════════════════════════════════════════════════════════ */
  function createAOTarget(w, h) {
    const depthTex = new THREE.DepthTexture(w, h);
    depthTex.type = THREE.UnsignedIntType;
    depthTex.format = THREE.DepthFormat;
    depthTex.minFilter = THREE.NearestFilter;
    depthTex.magFilter = THREE.NearestFilter;
    const t = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
      depthTexture: depthTex,
    });
    t.texture.name = 'Drillity.viewNormals';
    return t;
  }

  function disposePost() {
    if (composer) {
      for (const p of composer.passes) { try { p.dispose && p.dispose(); } catch { /* noop */ } }
      composer.passes.length = 0;
      try { composer.dispose(); } catch { /* noop */ }
    }
    if (aoTarget) { aoTarget.dispose(); aoTarget = null; }
    composer = null; bandPass = null; aoPass = null; bloomPass = null;
    gradePass = null; smaaPass = null;
    ctx.composer = null;
    postOK = false;
  }

  function buildPost() {
    disposePost();

    const q = ctx.quality || QUALITY.MEDIUM;
    /* 1.0 on every tier now — see the AA note at POST_SCALE_RETIRED_LOW.
       Only __qaPostScale() moves it, and only to re-measure the trade. */
    postScale = postScaleOverride != null ? postScaleOverride : 1;

    try {
      const rt = new THREE.WebGLRenderTarget(
        Math.max(1, Math.round(deviceW * postScale)),
        Math.max(1, Math.round(deviceH * postScale)),
        { type: THREE.HalfFloatType, depthBuffer: true, stencilBuffer: false },
      );
      rt.texture.name = 'Drillity.stage';
      rt.texture.minFilter = THREE.LinearFilter;
      rt.texture.magFilter = THREE.LinearFilter;

      composer = new EffectComposer(gl, rt);
      composer.setPixelRatio(pixelRatio * postScale);
      composer.setSize(cssW, cssH);

      bandPass = new BandRenderPass(drawBands);
      composer.addPass(bandPass);
    } catch (e) {
      warnOnce('post chain unavailable — falling back to direct band rendering.', e);
      composer = null;
      postOK = false;
      return;
    }

    /* ── contact AO (MEDIUM / HIGH) ─────────────────────────────────── */
    if (q.ssao) {
      try {
        aoScale = q.id === 'high' ? 0.65 : 0.5;
        aoTarget = createAOTarget(
          Math.max(2, Math.round(deviceW * aoScale)),
          Math.max(2, Math.round(deviceH * aoScale)),
        );
        aoPass = new ShaderPass(AOShader);
        aoPass.material.defines.AO_SAMPLES = q.id === 'high' ? 14 : 8;
        aoPass.material.needsUpdate = true;
        aoPass.uniforms.tNormal.value = aoTarget.texture;
        aoPass.uniforms.tDepth.value = aoTarget.depthTexture;
        aoPass.uniforms.uIntensity.value = q.id === 'high' ? 0.90 : 0.72;
        composer.addPass(aoPass);
      } catch (e) {
        warnOnce('contact AO unavailable.', e);
        if (aoTarget) { aoTarget.dispose(); aoTarget = null; }
        aoPass = null;
      }
    }

    /* ── bloom ──────────────────────────────────────────────────────── */
    if (q.bloom !== false) {
      try {
        /* This pass runs BEFORE the grade, i.e. on PRE-tonemap linear values
           (three skips tone mapping when rendering into a target), where a
           sunlit surface sits at 1.8-2.6 and amber hazard tape higher still.
           A threshold of 0.82 therefore bloomed the entire lit frame: hazard
           barriers read as emissive and a veiling glow ate the ground around
           the rig. 2.6 keeps only genuine speculars and real emissives;
           radius and strength come down with it so what is left is a
           highlight rather than a haze. (The seam lip is added later, in the
           grade pass, so it never reaches this pass at all.) env.js setGrade({ bloom })
           drives strength live per weather; threshold/radius stay here.

           2.60 -> 3.00 in round 2. This threshold is a LUMINANCE cut, and the
           SUN_RAMP rebalance in env.js raises the 13 deg key's green 24 % and
           its blue 35 % (it was too orange - it was stamping its own 30.3 deg
           hue onto 37.7 deg amber paint). That is +16 % of luma on every
           sunlit surface, so holding 2.60 would have quietly re-bloomed the
           population round 1 removed and put the veil back. 2.60 x 1.16 =
           3.02, so 3.00 keeps the SAME set of pixels blooming as the shipped
           build. The extra top end item 6 asked for comes from uHighTint's
           +9.3 % instead, which is a tint and cannot spread into a haze. */
        bloomPass = new UnrealBloomPass(
          new THREE.Vector2(deviceW, deviceH),
          q.id === 'low' ? 0.24 : 0.30,   // strength
          0.35,                           // radius
          3.00,                           // threshold
        );
        composer.addPass(bloomPass);
      } catch (e) {
        warnOnce('bloom unavailable.', e);
        bloomPass = null;
      }
    }

    /* ── grade (always; it performs tone mapping + sRGB too) ────────── */
    try {
      gradePass = new ShaderPass(GradeShader);
      gradePass.uniforms.uBgDeep.value.copy(srgbVec3(BRAND.bgDeep));
      gradePass.uniforms.uSeamColor.value.copy(linearVec3(BRAND.amber));
      gradePass.uniforms.uSeamHot.value.copy(linearVec3(BRAND.amberHot));
      composer.addPass(gradePass);
    } catch (e) {
      warnOnce('grade pass unavailable — output will be untone-mapped.', e);
      gradePass = null;
    }

    /* ── SMAA — MEDIUM and HIGH. LOW honours its own `aa: 'none'` ────
       The pass is BUILT on every tier, so the QA rigs can still A/B it, but
       on LOW it is built DISABLED. contract.js declares `aa: 'none'` there
       and this file has now overridden that declaration twice — first with a
       supersample, then with SMAA — each time on numbers that did not
       reproduce. See LOW'S ANTI-ALIASING at the top of this file. */
    {
      try {
        smaaPass = new SMAAPass(deviceW, deviceH);
        smaaPass.enabled = q.aa !== 'none';
        composer.addPass(smaaPass);
      } catch (e) {
        warnOnce('SMAA unavailable.', e);
        smaaPass = null;
      }
    }

    postOK = composer.passes.length > 0;
    ctx.composer = composer;
    syncStatic();
  }

  function syncStatic() {
    if (gradePass) {
      const u = gradePass.uniforms;
      u.uResolution.value.set(
        Math.round(deviceW * postScale),
        Math.round(deviceH * postScale),
      );
      u.uSeamY.value = seamUv;
      /* the 3D's own rect, not the stage's: with the HUD chrome carved off,
         the rows behind the status strip and the dock are not rendered and
         must letterbox like the rest of the frame */
      u.uStage.value.set(
        bandsRect.x / cssW,
        1 - (bandsRect.y + bandsRect.h) / cssH,
        (bandsRect.x + bandsRect.w) / cssW,
        1 - bandsRect.y / cssH,
      );
      u.uBandA.value.copy(bands.surface.uv);
      u.uBandB.value.copy(bands.section.uv);
      // The lip is a fixed number of screen pixels, not a fixed uv distance.
      // 24 px on an 844 px viewport is uv 0.028, and because the falloff is
      // exp(-d/fall) the amber was still reading ~100 px out. 5 px, one-sided,
      // is a contact under the ground line rather than a light leak.
      // uSeamCore / uSeamBlur are retired — see the uniform block.
      u.uSeamFall.value = Math.max(0.0015, 5 / cssH);
    }
    if (aoPass) {
      const u = aoPass.uniforms;
      u.uSeamY.value = seamUv;
      u.uBandA.value.copy(bands.surface.uv);
      u.uBandB.value.copy(bands.section.uv);
    }
  }

  function syncDynamic() {
    if (!aoPass) return;
    const u = aoPass.uniforms;
    u.uInvProjA.value.copy(camera.projectionMatrixInverse);
    u.uInvProjB.value.copy(sectionCamera.projectionMatrixInverse);
    const pa = camera.projectionMatrix.elements;
    const pb = sectionCamera.projectionMatrix.elements;
    u.uProjA.value.set(pa[0], pa[5]);
    u.uProjB.value.set(pb[0], pb[5]);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     Cameras
     ═══════════════════════════════════════════════════════════════════════ */
  const modeConfig = () => CAMERA_MODES[mode] || CAMERA_MODES.hero;

  function updateSurfaceCamera(dt, state) {
    const cfg = modeConfig();
    const reduced = !!(state && state.settings && state.settings.reducedMotion);

    if (focus && focus.until > 0 && time > focus.until) focus = null;

    if (focus) {
      posSpring.target.copy(focus.pos);
      lookSpring.target.copy(focus.look);
    } else if (cfg.orbit) {
      orbitAngle += dt * cfg.orbitSpeed * TAU;
      posSpring.target.set(
        Math.sin(orbitAngle) * cfg.orbit,
        cfg.orbitY,
        Math.cos(orbitAngle) * cfg.orbit,
      );
      lookSpring.target.set(cfg.look[0], cfg.look[1], cfg.look[2]);
    } else {
      posSpring.target.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      lookSpring.target.set(cfg.look[0], cfg.look[1], cfg.look[2]);
    }

    posSpring.step(cfg.stiff, dt);
    lookSpring.step(cfg.stiff * 1.25, dt);

    const targetFov = fovForBand((focus && focus.fov) ? focus.fov : cfg.fov);
    fovCurrent = damp(fovCurrent, targetFov, 4.5, dt);
    if (Math.abs(camera.fov - fovCurrent) > 1e-3) {
      camera.fov = fovCurrent;
      camera.updateProjectionMatrix();
    }

    /* HANDHELD DRIFT — OFF.
     *
     * This used to run every frame on every camera, and its comment claimed it
     * was "never nauseating". The project owner disagreed, and that is the only
     * vote that counts: *"i'm not a fan about the shaking picture/motion"*.
     *
     * The principle it violated: **the world moves, the camera does not.** The
     * reference the owner set (research/18) is a locked-off shot of a machine
     * that is itself full of motion — and that reads as expensive, where a
     * drifting camera reads as handheld video. Life belongs in the rig, the
     * cuttings and the dust, not in the lens.
     *
     * Set CAMERA_DRIFT above 0 to bring it back; the per-mode `drift` scalars
     * in the camera table still work and are still honoured.
     */
    const amp = (reduced ? 0.15 : 1) * (cfg.drift || 1) * CAMERA_DRIFT;
    const t = time;
    drift.set(
      Math.sin(t * 0.31) * 0.55 + Math.sin(t * 0.73 + 1.31) * 0.30,
      Math.sin(t * 0.41 + 2.13) * 0.44 + Math.sin(t * 0.97 + 0.42) * 0.20,
      Math.sin(t * 0.27 + 4.21) * 0.38 + Math.sin(t * 0.61 + 2.77) * 0.18,
    ).multiplyScalar(amp);

    /* trauma shake: offset = trauma² · noise */
    const tr = (reduced ? 0 : 1) * trauma * trauma;
    if (tr > 1e-5) {
      const s = t * 34;
      shakeOffset.set(
        Math.sin(s * 1.00) * 0.62 + Math.sin(s * 2.31 + 1.7) * 0.38,
        Math.sin(s * 1.37 + 0.9) * 0.62 + Math.sin(s * 3.11 + 2.4) * 0.38,
        Math.sin(s * 0.83 + 2.2) * 0.45,
      ).multiplyScalar(tr * 0.34);
    } else {
      shakeOffset.set(0, 0, 0);
    }

    camera.position.copy(posSpring.value).add(drift).add(shakeOffset);

    lookTarget.copy(lookSpring.value);
    lookTarget.x += drift.x * 0.35;
    lookTarget.y += drift.y * 0.35;
    camera.lookAt(lookTarget);

    if (tr > 1e-5) camera.rotateZ(Math.sin(time * 41) * tr * 0.030);
    if (!reduced && CAMERA_DRIFT > 0) camera.rotateZ(Math.sin(time * 0.23 + 1.1) * 0.0022 * (cfg.drift || 1));

    camera.updateMatrixWorld();
  }

  /**
   * Depth follow for the cross-section.
   *
   * world/geology.js publishes `ctx.sectionView` and scrolls its own root group
   * instead of the camera. When that convention is present we must NOT also
   * scroll the camera or the two would double up and the bit would leave the
   * band — so in 'auto' the renderer parks the camera and lets geology drive,
   * and only takes over the follow when nothing else has claimed the section.
   */
  function updateSectionCamera(dt, state) {
    const sv = ctx.sectionView;
    const external = sectionFollow === 'auto' ? !!(sv && sv.root) : !sectionFollow;

    // adopt the section owner's depth scale so both agree on the frustum
    if (sv && typeof sv.viewMetres === 'number' && sv.viewMetres > 1 &&
        Math.abs(sv.viewMetres - sectionViewH) > 1e-3) {
      sectionViewH = clamp(sv.viewMetres, 3, 120);
      updateSectionFrustum();
    }

    const depth = (state && state.drill && state.drill.depth) || 0;
    // keep the bit ~40 % down the band
    const wanted = external ? 0 : -depth - 0.10 * sectionViewH;
    sectionCamY = damp(sectionCamY, wanted, 3.2, dt);
    sectionCamera.position.set(0, sectionCamY, 30);
    sectionCamera.lookAt(0, sectionCamY, 0);
    sectionCamera.updateMatrixWorld();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     BAND REGISTRATION — making the two bands draw the SAME hole
     ═══════════════════════════════════════════════════════════════════════

     GAMEDESIGN §1: "The two bands are one continuous world fiction: the
     borehole in the section lines up horizontally with the mast above it."
     Measured warm at 390x844, chrome live, identical on dth / cfa / auger
     (they are camera properties, so every method reads the same):

       collarOffsetPx   62.44   world (0,0,0) lands at x 257.44 in the surface
                                band and at x 195.00 in the section. 16.0 % of
                                the stage width apart.
       groundAtSeamPx  -22.81   ground level at the collar projects to y 355.19
                                against a seam at y 378, so the cut opened
                                22.8 px BELOW where the ground was drawn.

     Both are now solved every frame, from the projection itself, by a LENS
     SHIFT on the surface camera (`setViewOffset`). Why that, and why on that
     camera:

     ── why a lens shift, not a re-solved camera ──────────────────────────
     `setViewOffset` renders a translated window of the SAME frustum. Every
     ray is unchanged, so the machine's pixels are identical and merely move;
     nothing about the hero solve above (fov 34, the 13 deg sun sitting 14 deg
     off the camera's right, the shadow raking left) is disturbed. Re-solving
     `pos` / `look` would change the convergence on the mast and re-open the
     aperture arithmetic in CAMERA_MODES.hero every time the dock height
     changed. And the error is not a constant: it moves with the camera mode,
     the band aspect and the measured HUD chrome, so a hand-tuned literal
     would be right on one phone and wrong on the next. This is measured, so
     it is right on all of them.

     ── why the SURFACE camera carries both shifts ────────────────────────
     The obvious alternative for the horizontal is to slide the SECTION across
     instead, which keeps the hero framing untouched. It does not survive
     contact with world/geology.js. Its instrument strips are re-anchored to
     the camera's x ONLY on a long-section (`if (horiz)`, ~:7031); in the
     sixteen vertical methods the ruler sits at world `halfW - rulerWidth*0.55`
     and the log strip at `-halfW + logWidth*0.5`, nailed to world x 0, and
     `buildFace()` cuts the strata slab at `halfW * 2 * 1.02` — 2 % of margin.
     Shifting the cut 3.22 m would carry the ruler clean off the right edge and
     open ~58 px of bare backdrop down the left. So the section is not free to
     move, and GAMEDESIGN's own wording agrees about which one is the
     reference: the section lines up with the MAST, not the mast with the cut.

     What it costs, measured rather than assumed: the machine's ground
     footprint is x 214.7-400.8, y 333.0-364.1. After the shift it is
     x 152.3-338.4, y 355.8-386.9. That
       • FIXES an overflow — the rig currently runs 11 px off the right edge
         of a 390 px stage;
       • leaves 152 px of clear ground to the LEFT, which is the side the sun
         rakes its shadow into, so the negative space the hero solve wanted is
         still there;
       • loses ~9 px off the nearest track corner under the seam. That corner
         is 12.96 m from the eye where the collar is 13.79 m — i.e. it is IN
         FRONT OF THE CUT PLANE, and a cutaway is supposed to remove what is
         in front of it. Trading 9 px of track for a hole that is one hole.

     ── sign convention, since it is easy to get backwards ────────────────
     With fullWidth/fullHeight set to the band's own size, three.js shifts the
     frustum WINDOW, so the rendered image moves the other way: a positive
     offsetX moves the image LEFT by offsetX px and a positive offsetY moves
     it UP by offsetY px. The offset therefore IS the signed error, directly.
     Nothing here relies on that being true, though — the solve reads the
     UNSHIFTED projection every frame and re-derives from pixels, so a sign
     error would show up as a wrong answer in .qa-collar.mjs on the first run
     rather than as a drift nobody notices until it is 200 px.

     ── what is deliberately NOT fixed here ───────────────────────────────
     `scaleRatio` 2.81x (54.58 px/m above, 19.42 below). It is not a framing
     error and a lens shift cannot touch it; see the note on updateSectionFrustum
     and the report in HANDOFF §10. Matching it needs the hero eye at 38.4 m
     instead of 13.69, which puts a 4.2 m mast at 82 px — 7 % of the frame.
     ═══════════════════════════════════════════════════════════════════════ */

  /** Off = the pre-2026-09-05 behaviour, for an A/B. See `__qaRegisterBands`. */
  let registerBandsOn = true;
  /** Bounds on the shift, as a fraction of the surface band. A stale or absurd
      solve may never throw the frame away; it may only be imperfect. */
  const REG_MAX_X = 0.22;
  const REG_MAX_Y = 0.12;
  const registration = { x: 0, y: 0, active: false, collarErrPx: 0, groundErrPx: 0 };
  const regPoint = new THREE.Vector3();

  function clearRegistration() {
    if (camera.view && camera.view.enabled) camera.clearViewOffset();
    registration.x = 0;
    registration.y = 0;
    registration.active = false;
    registration.collarErrPx = 0;
    registration.groundErrPx = 0;
  }

  function registerBands(dt) {
    /* The invariant is a property of the SITE screen: it is the only place
       where both bands describe one hole. Elsewhere the section band is
       backdrop behind a DOM overlay, and on `orbit` / `menu` the camera
       revolves around the world origin — pinning the origin there would
       cancel the orbit it exists to perform. Same gate as the HUD chrome, and
       read live rather than from `chromeScene` so it cannot lag a frame. */
    if (!registerBandsOn || !onSiteScene()) { clearRegistration(); return; }

    const band = bands.surface;
    const sect = bands.section;

    // solve against the UNSHIFTED projection, so the answer is a measurement
    if (camera.view && camera.view.enabled) camera.clearViewOffset();

    regPoint.set(0, 0, 0).project(camera);
    if (!Number.isFinite(regPoint.x) || !Number.isFinite(regPoint.y)) return;
    const collarX = band.x + (regPoint.x * 0.5 + 0.5) * band.w;
    const collarY = band.y + (1 - (regPoint.y * 0.5 + 0.5)) * band.h;

    /* Where the CUT draws the same hole. Projected rather than assumed to be
       the band centre: the section camera is parked at x 0 today, and this
       stays correct on the day it is not. */
    regPoint.set(0, 0, 0).project(sectionCamera);
    if (!Number.isFinite(regPoint.x)) return;
    const holeX = sect.x + (regPoint.x * 0.5 + 0.5) * sect.w;

    const wantX = clamp(collarX - holeX, -band.w * REG_MAX_X, band.w * REG_MAX_X);
    const wantY = clamp(collarY - sect.y, -band.h * REG_MAX_Y, band.h * REG_MAX_Y);

    /* Damped, not snapped. Entering the site screen springs the camera from
       `menu` to `hero`, and an offset that tracked the collar exactly through
       that would cancel a chunk of the move — the hole would sit still while
       the world swung around it. Lagging it lets the transition read as a
       camera move and converges to exact well inside the first second. */
    if (!registration.active) { registration.x = wantX; registration.y = wantY; }
    else {
      registration.x = damp(registration.x, wantX, 8, dt);
      registration.y = damp(registration.y, wantY, 8, dt);
    }
    registration.active = true;
    registration.collarErrPx = collarX - holeX - registration.x;
    registration.groundErrPx = collarY - sect.y - registration.y;

    camera.setViewOffset(band.w, band.h, registration.x, registration.y, band.w, band.h);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     Adaptive quality — downgrade only, long cooldown, so it cannot oscillate.
     ═══════════════════════════════════════════════════════════════════════ */
  /** True when main.js was launched with ?quality=... — see ADAPTIVE_GRACE. */
  function isQualityPinned() {
    if (qualityPinned === null) {
      const qs = ctx.qs;
      if (!qs || typeof qs.get !== 'function') return false;   // not wired yet
      qualityPinned = !!qs.get('quality');
    }
    return qualityPinned;
  }

  function updateAdaptiveQuality(dt) {
    if (isQualityPinned()) return;
    if (time < ADAPTIVE_GRACE) { lowFpsTime = 0; return; }
    if (qualityCooldown > 0) { qualityCooldown -= dt; return; }
    const fps = (ctx.clock && ctx.clock.fps) || 60;
    if (fps < 45) lowFpsTime += dt;
    else lowFpsTime = Math.max(0, lowFpsTime - dt * 2);

    if (lowFpsTime >= 3) {
      lowFpsTime = 0;
      const i = tierIndex(ctx.quality);
      if (i > 0) { api.setQuality(TIERS[i - 1]); qualityCooldown = 12; }
      else qualityCooldown = Number.POSITIVE_INFINITY;   // already LOW
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     SHADER WARM-UP — the largest single cost in this game's start-up
     ═══════════════════════════════════════════════════════════════════════

     ── WHAT THE BOOT SCREEN ACTUALLY WAS, MEASURED ──────────────────────
     `node tools/bootprobe.mjs --dist`, 390x844@2, headed Chrome, a fresh
     browser profile per run so ANGLE's on-disk shader cache is genuinely
     cold. Three runs of the SHIPPED dist/index.html:

       navigationStart -> menu interactive           26.37 s (median)
         page load -> boot()'s first line             0.39 s    1.5 %
         inside boot(): every module + every init     1.90 s    7.2 %
         boot() end -> menu interactive              23.90 s   90.7 %

     The whole of boot() — 13 modules, 13 `init()`s, the .glb fetch, ~41
     procedural texture kinds — is under two seconds. The 24 s is ONE FRAME:
     the first call to `render()` measured 17,896 ms of a 17,927 ms frame,
     and by the end of it `info.programs.length` was already 66.

     Wrapping every entry point on WebGL2RenderingContext.prototype — rather
     than a shortlist, since the shortlist version of that instrument
     reported `linkProgram` at 1 ms and so proved only that it was looking in
     the wrong place — named it exactly:

       getProgramInfoLog     n=70    19,067 ms    worst single call 9,474 ms
       texSubImage2D         n=107      185 ms
       getShaderInfoLog      n=140       66 ms
       getProgramParameter   n=210       22 ms
       linkProgram           n=70         1 ms

     `gl.linkProgram` on ANGLE/D3D is asynchronous — it queues the HLSL
     translation and the D3DCompile and returns. The bill arrives at the
     first call that needs the finished program, and three.js's is
     `getProgramInfoLog` inside `WebGLProgram`'s `onFirstUse`, reached from
     `getUniforms()` in `setProgram()`. So the shape of the stall is: link
     one program, immediately block on it, draw, link the next, block on it
     — 66 programs compiled STRICTLY ONE AT A TIME on the main thread, at
     ~270 ms each.

     ── THE FIX IS THE ORDER, NOT THE COUNT ──────────────────────────────
     `renderer.compile(scene, camera)` creates and LINKS every program a
     scene needs without asking for any of them, so all 66 are in the
     driver's queue at once and ANGLE compiles them across its own worker
     threads. `KHR_parallel_shader_compile` then lets us ask "is this one
     done?" — `getProgramParameter(COMPLETION_STATUS_KHR)` — WITHOUT
     blocking, which is what `WebGLProgram.isReady()` is. By the time the
     first frame reaches `getProgramInfoLog`, the link has finished and the
     call returns immediately.

     ── AND IT IS WHAT MAKES THE BAR HONEST ──────────────────────────────
     A bar sitting at 90 % for twenty seconds is worse than no bar. Polling
     `isReady()` gives a count of programs the DRIVER has actually finished,
     out of a total the driver itself was handed — so what the player is
     shown during the only long part of boot is a measurement rather than an
     easing curve. main.js drives the bar from it.

     ── WHAT compile() DOES NOT COVER, SAID OUT LOUD ─────────────────────
     • Shadow-depth material variants: `compile()` walks `object.material`,
       and WebGLShadowMap substitutes its own depth materials at render time.
     • The AO prepass's `MeshNormalMaterial` override, for the same reason.
     • The post chain, whose passes are FullScreenQuads outside both scenes.
     The last of those is handled by `warmPost()` below, deliberately as a
     separate and separately-measured step rather than as a claim. The first
     two are not, and show up as the residual first-frame cost.

     ── WITHOUT THE EXTENSION ────────────────────────────────────────────
     `WebGLProgram.isReady()` returns TRUE IMMEDIATELY when
     KHR_parallel_shader_compile is absent (three.js seeds `programReady`
     from `rendererExtensionParallelShaderCompile === false`). A poll loop
     would then report 100 % instantly while the cost landed unchanged on
     frame 1 — a bar that lies, which is the exact thing this is here to
     stop. So the result carries `parallel: false` and the caller must not
     present it as progress. Linking everything up front is still worth
     doing there: the driver may overlap the work anyway, and it cannot be
     slower than asking for them one at a time. */

  /* ═══════════════════════════════════════════════════════════════════════
     THE TITLE STAGE — a third, throwaway world, drawn only during boot
     ═══════════════════════════════════════════════════════════════════════

     The shader warm-up above turned the boot stall from 19 s of BLOCKED main
     thread into ~12 s of GPU work happening on the driver's own threads. That
     changes what boot can be: the main thread is now free, at 60 fps, for the
     whole of it. A guaranteed twelve seconds of the player's attention that
     currently shows a wordmark and a percentage.

     So there is a third scene. It exists only while the game's own programs
     compile behind it, and it is deleted the moment they are ready.

     ── WHY IT IS SEPARATE FROM `scene` ──────────────────────────────────
     Because the entire point is to draw something before the game's shaders
     exist. Putting the title machine in `scene` and rendering `scene` would
     block on all 71 programs, which is the stall this is meant to fill.
     A private scene with its own handful of materials compiles in about a
     second, and everything else keeps compiling behind it.

     ── AND WHY IT SKIPS THE POST CHAIN ──────────────────────────────────
     Same reason: the composer's own 13 programs are in the batch being
     warmed. Rendering to the canvas directly costs the title nothing but a
     few to-screen program variants of its own — and three.js applies
     `toneMapping` and `outputColorSpace` automatically when the render target
     is null, which is exactly the ACES + sRGB the grade pass mirrors. So the
     title is graded like the game without needing the game's grade pass.

     ── IT MUST NOT LENGTHEN BOOT ────────────────────────────────────────
     Its model is fetched alongside the machine models during the systems
     phase (main.js), not on the critical path; its own programs are warmed by
     the same non-blocking route as everything else; and if any of that is not
     ready in time the title is simply skipped. A title that delays the game
     is worse than no title. */

  const titleScene = new THREE.Scene();
  titleScene.name = 'title';
  const titleCamera = new THREE.PerspectiveCamera(34, 9 / 16, 0.1, 400);
  titleCamera.name = 'titleCamera';
  titleScene.add(titleCamera);
  let titleMode = false;

  /** Frame the title stage — the WHOLE stage, not one of the two bands. */
  function updateTitleCamera() {
    const a = stage.w / Math.max(1, stage.h);
    if (Math.abs(titleCamera.aspect - a) < 1e-4) return;
    titleCamera.aspect = a;
    titleCamera.updateProjectionMatrix();
  }

  function drawTitle() {
    gl.setRenderTarget(null);
    // flood the whole canvas first, so the letterbox is the brand's deep slate
    gl.setScissorTest(false);
    gl.setViewport(0, 0, cssW, cssH);
    gl.setClearColor(clearDeep, 1);
    gl.clear(true, true, true);

    const y = cssH - (stage.y + stage.h);
    gl.setViewport(stage.x, y, stage.w, stage.h);
    gl.setScissor(stage.x, y, stage.w, stage.h);
    gl.setScissorTest(true);
    gl.render(titleScene, titleCamera);
    gl.setScissorTest(false);
  }

  /** Has the driver got a non-blocking "is it linked yet?" query? */
  const hasParallelCompile = () => {
    try { return !!gl.extensions.get('KHR_parallel_shader_compile'); }
    catch { return false; }
  };

  /** Programs the driver has finished, out of the ones it has been handed. */
  function programReadiness() {
    const ps = gl.info.programs || [];
    let done = 0;
    for (const p of ps) { try { if (p.isReady()) done++; } catch { done++; } }
    return { done, total: ps.length };
  }

  const warmQuadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /**
   * Link the post chain's programs too.
   *
   * Every pass renders through a `FullScreenQuad`, which is a bare `Mesh`
   * three.js accepts as a render root — `renderer.render(mesh, camera)` — so
   * `compile(mesh, camera)` is the identical (root, camera) pair the composer
   * will later use and the program cache key matches exactly.
   *
   * `UnrealBloomPass` is the awkward one: it owns ONE quad and swaps its
   * material eight times per frame (a high-pass, five separable blurs that
   * differ by a `KERNEL_RADIUS` define and are therefore five distinct
   * programs, a composite and a blend). Each is compiled by setting it on the
   * quad in turn; the pass is left exactly as it was found.
   *
   * Field names are read defensively on purpose — a three.js upgrade that
   * renames one must degrade to warming fewer programs, never to throwing
   * during boot.
   */
  function warmPost() {
    if (!composer) return 0;
    let n = 0;
    for (const pass of composer.passes) {
      const quad = pass.fsQuad;
      if (!quad || !quad._mesh) continue;
      const held = quad.material;
      const mats = [held];
      for (const m of [pass.materialHighPassFilter, pass.compositeMaterial,
        pass.blendMaterial, pass.basic]) if (m) mats.push(m);
      for (const m of (pass.separableBlurMaterials || [])) if (m) mats.push(m);
      for (const m of mats) {
        if (!m) continue;
        try { quad.material = m; gl.compile(quad._mesh, warmQuadCam); n++; }
        catch (e) { warnOnce('a post pass could not be pre-compiled.', e); }
      }
      quad.material = held;
    }
    return n;
  }

  /**
   * THE BOUND RENDER TARGET IS PART OF THE PROGRAM CACHE KEY.
   *
   * This is the whole reason the first attempt at a warm-up made boot WORSE
   * — 26.4 s to 40.8 s — and it is worth stating plainly, because the failure
   * was silent and looked exactly like success:
   *
   *   node tools/bootprobe.mjs --dist, before  26.37 s   66 programs
   *                                    after   40.81 s  120 programs
   *
   * 120 = 66 + 54. `renderer.compile()` ran with no render target bound, and
   * three.js's `getParameters()` reads
   *
   *     toneMapping:      currentRenderTarget === null ? this.toneMapping : NoToneMapping
   *     outputColorSpace: currentRenderTarget === null ? this.outputColorSpace : LinearSRGBColorSpace
   *
   * so every program it built was the TO-SCREEN variant — ACES + sRGB encode
   * baked into the fragment shader. This renderer draws both bands into the
   * EffectComposer's half-float target and tone-maps in the grade pass, so at
   * render time `currentRenderTarget` is not null, the key is different, and
   * all 66 real programs were compiled from scratch on frame 1 exactly as
   * before. The warm-up bought 54 programs nothing would ever draw, and the
   * 13.5 s it spent on them was added to boot rather than removed from it.
   *
   * `getProgramInfoLog` still measured n=70 afterwards — the same 70 as
   * before — which is the evidence that the warmed set and the drawn set were
   * disjoint. A program COUNT going up is not proof of a warm-up working; the
   * first frame's cost going down is.
   */
  function withWarmTarget(fn) {
    const prev = gl.getRenderTarget();
    /* The buffer the band pass actually draws into when the post chain is up.
       Falls back to null — which is then correct, because that is the
       no-composer path's real destination too. */
    const target = (postOK && composer) ? (composer.renderTarget1 || null) : null;
    try { gl.setRenderTarget(target); fn(); }
    finally { gl.setRenderTarget(prev); }
  }

  /* ── canvas fallback styling (index.html ships no stylesheet) ───────── */
  let styleChecked = false;
  function ensureCanvasStyle() {
    if (styleChecked || !canvas.isConnected) return;
    styleChecked = true;
    canvas.style.display = 'block';
    let pos = 'static';
    try { pos = window.getComputedStyle(canvas).position; } catch { /* noop */ }
    if (pos === 'static') {
      canvas.style.position = 'fixed';
      canvas.style.left = '0';
      canvas.style.top = '0';
      canvas.style.zIndex = '0';
      canvas.style.touchAction = 'none';
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     Public API
     ═══════════════════════════════════════════════════════════════════════ */
  const api = {
    /* three objects */
    gl,
    scene,
    camera,
    sectionScene,
    sectionCamera,
    get composer() { return composer; },
    get info() { return gl.info; },
    get domElement() { return gl.domElement; },
    get capabilities() { return gl.capabilities; },
    get stage() { return stage; },
    get bands() { return bands; },
    get cameraMode() { return mode; },
    get exposure() { return gradeExposure; },

    /**
     * OPTED IN. `computeLayout()` reads `ctx.hud = { top, bottom }`, so
     * ui/screens/site.js may now call `resize()` when the dock's measured
     * height changes. See `resolveChrome()`.
     *
     * The handshake costs one extra `resize()` per window resize —
     * main.js resize() runs renderer before ui, ui runs site.resize(), and
     * site's publishChrome() calls back into resize(). It terminates on
     * site.js's own equality guard, and the second pass is idempotent.
     */
    usesHudChrome: true,

    /** The chrome carved off the stage this layout, in CSS px. */
    get chrome() { return chrome; },
    /** The rect the two bands actually occupy, in CSS px. */
    get bandsRect() { return bandsRect; },

    /* WebGLRenderer pass-throughs other systems commonly poke */
    getPixelRatio: () => gl.getPixelRatio(),
    getSize: (v) => gl.getSize(v || new THREE.Vector2()),
    getDrawingBufferSize: (v) => gl.getDrawingBufferSize(v || new THREE.Vector2()),
    compile: (s, c) => gl.compile(s || scene, c || camera),

    /**
     * Link every program the first frame will need, in parallel, and report
     * honest progress while the driver works. See the SHADER WARM-UP note.
     *
     * Call it once, from boot, AFTER every system has built its scene content
     * and BEFORE the frame loop starts. Calling it twice is harmless — three's
     * program cache makes the second pass a no-op — but pointless.
     *
     * @param {(done:number,total:number)=>void} [onProgress] driver-measured
     * @returns {Promise<{programs:number,ms:number,parallel:boolean,post:number}>}
     */
    async warmShaders(onProgress) {
      const t0 = performance.now();
      const parallel = hasParallelCompile();
      let post = 0;
      try {
        /* Both scenes and the post chain are queued BEFORE anything is
           awaited, so the driver has the whole batch to spread across its
           threads. Interleaving compile-then-wait would rebuild the serial
           stall this exists to remove.

           Inside withWarmTarget() so the programs match the ones the frame
           will ask for — see the note there; getting this wrong is not a
           smaller win, it is a larger loss. */
        withWarmTarget(() => {
          gl.compile(scene, camera);
          gl.compile(sectionScene, sectionCamera);
          post = warmPost();
        });
      } catch (e) {
        warnOnce('shader warm-up could not run — the first frame will pay for it.', e);
        return { programs: (gl.info.programs || []).length, ms: performance.now() - t0, parallel, post };
      }

      if (parallel) {
        await new Promise((resolve) => {
          /* A ceiling, because a poll loop with no exit is how a boot screen
             becomes permanent. 60 s is far beyond the 19 s this replaces; if
             it is ever hit the frame loop simply starts and the remaining
             programs cost what they always did. */
          const deadline = performance.now() + 60_000;
          const poll = () => {
            const { done, total } = programReadiness();
            if (onProgress) { try { onProgress(done, total); } catch { /* non-fatal */ } }
            if (done >= total || performance.now() > deadline) { resolve(); return; }
            setTimeout(poll, 16);
          };
          poll();
        });
      } else if (onProgress) {
        /* No non-blocking query exists, so there is no progress to report.
           Say so with a single honest step rather than animating a fiction. */
        const { total } = programReadiness();
        try { onProgress(total, total); } catch { /* non-fatal */ }
      }

      return {
        programs: (gl.info.programs || []).length,
        ms: performance.now() - t0,
        parallel,
        post,
      };
    },

    async init() {
      const q = ctx.quality || QUALITY.MEDIUM;
      const dpr = Math.min(window.devicePixelRatio || 1, q.dprCap);
      gl.setPixelRatio(dpr);
      gl.setSize(window.innerWidth, window.innerHeight, true);
      gl.shadowMap.type = q.softShadows ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;

      computeLayout(window.innerWidth, window.innerHeight, dpr);
      buildPost();

      posSpring.snap(scratch.set(...CAMERA_MODES.menu.pos));
      lookSpring.snap(scratch.set(...CAMERA_MODES.menu.look));

      /* TRAUMA SOURCES — only genuinely rare events, and gently.
       *
       * `BIT_IMPACT` used to be in this list, and it was the real fault behind
       * the owner's *"i'm not a fan about the shaking picture"*. Bit impacts
       * fire CONTINUOUSLY while drilling — that is what percussion is — and
       * `shake()` ACCUMULATES trauma (`trauma + intensity`). So trauma was
       * being topped up faster than it decayed and **the camera never returned
       * to rest for the entire run.** It was not an event shake at all; it was
       * a permanent tremor wearing an event's clothes.
       *
       * The rule now: a shake must be something that HAPPENS, not something
       * that IS. Percussion is felt through the rig's own animation, the
       * cuttings and the audio — not by moving the lens.
       *
       * Amplitudes halved from their originals as well; the surviving four are
       * all genuine one-offs a driller would react to.
       */
      ctx.bus.on(EVENTS.BOULDER, () => api.shake(0.30, 0.55));
      ctx.bus.on(EVENTS.JAM, (p) => api.shake(0.14 + 0.15 * clamp(p && p.severity != null ? p.severity : 0.5), 0.7));
      ctx.bus.on(EVENTS.BIT_BROKEN, () => api.shake(0.42, 0.80));
      ctx.bus.on(EVENTS.CAVITY, () => api.shake(0.12, 0.45));
      /* ROD_ADDED and BAILER_RUN are routine beats that happen every few
         metres — a cadence, not a shock. They no longer move the camera. */

      /* sensible default framing per app scene */
      ctx.bus.on(EVENTS.SCENE_CHANGE, (p) => {
        /* `ctx.hud` is written by the site screen and never cleared, so the
           renderer — not the publisher — decides when it applies; every other
           screen is a DOM overlay with live 3D behind it and must keep the
           full stage. (If site.js ever starts clearing `ctx.hud` on unmount
           this gate becomes redundant, not wrong.) */
        if (onSiteScene() !== chromeScene) relayout();

        switch (p && p.scene) {
          case 'site':    api.setCameraMode('hero'); break;
          case 'results': api.setCameraMode('mast'); break;
          case 'garage':
          case 'shop':    api.setCameraMode('orbit'); break;
          case 'menu':
          case 'boot':
          case 'contracts':
          case 'career':  api.setCameraMode('menu'); break;
          default: break;
        }
      });
    },

    update(dt, state) {
      time += dt;
      if (trauma > 0) trauma = Math.max(0, trauma - traumaDecay * dt);
      updateAdaptiveQuality(dt);
      void state;
    },

    resize(w, h, dpr) {
      const q = ctx.quality || QUALITY.MEDIUM;
      const ratio = Math.min(dpr || window.devicePixelRatio || 1, q.dprCap);
      gl.setPixelRatio(ratio);
      gl.setSize(w, h, true);
      ensureCanvasStyle();
      computeLayout(w, h, ratio);

      if (composer) {
        composer.setPixelRatio(ratio * postScale);
        composer.setSize(w, h);
        if (aoPass) {
          const aw = Math.max(2, Math.round(deviceW * aoScale));
          const ah = Math.max(2, Math.round(deviceH * aoScale));
          if (!aoTarget || aoTarget.width !== aw || aoTarget.height !== ah) {
            if (aoTarget) aoTarget.dispose();
            aoTarget = createAOTarget(aw, ah);
            aoPass.uniforms.tNormal.value = aoTarget.texture;
            aoPass.uniforms.tDepth.value = aoTarget.depthTexture;
          }
        }
      }
      syncStatic();
    },

    /* ── the title stage ─────────────────────────────────────────────── */
    /** The boot title's private world. main.js fills it; nothing else may. */
    get titleScene() { return titleScene; },
    get titleCamera() { return titleCamera; },
    get titleActive() { return titleMode; },

    /** Point the title camera. Metres; `fov` is vertical degrees. */
    setTitleCamera(pos, look, fov) {
      if (pos) titleCamera.position.set(pos[0], pos[1], pos[2]);
      if (look) titleCamera.lookAt(look[0], look[1], look[2]);
      if (fov) titleCamera.fov = clamp(fov, 8, 120);
      updateTitleCamera();
      titleCamera.updateProjectionMatrix();
      titleCamera.updateMatrixWorld();
    },

    /**
     * Link the title's own programs — the to-screen variants, so no render
     * target is bound. A handful, and they are the only ones between the
     * player and something moving on screen.
     */
    async warmTitle() {
      const t0 = performance.now();
      try { gl.compile(titleScene, titleCamera); }
      catch (e) { warnOnce('the title could not be pre-compiled.', e); return { ms: 0 }; }
      if (hasParallelCompile()) {
        await new Promise((resolve) => {
          const deadline = performance.now() + 8000;
          const poll = () => {
            const { done, total } = programReadiness();
            if (done >= total || performance.now() > deadline) { resolve(); return; }
            setTimeout(poll, 16);
          };
          poll();
        });
      }
      return { ms: performance.now() - t0 };
    },

    /** Draw the title instead of the game until `endTitle()`. */
    beginTitle() { titleMode = true; updateTitleCamera(); },

    /**
     * Stop drawing the title and give its memory back.
     *
     * Geometries are this scene's own (gltfRig clones one per instantiation)
     * so they are disposed. MATERIALS ARE NOT: core/assets.js hands out shared
     * instances, and the game is still using them — disposing one here would
     * take a texture out from under the machine the player is about to see.
     */
    endTitle() {
      titleMode = false;
      titleScene.traverse((o) => {
        if (o.isMesh && o.geometry && o !== titleCamera) { try { o.geometry.dispose(); } catch { /* noop */ } }
      });
      for (let i = titleScene.children.length - 1; i >= 0; i--) {
        const c = titleScene.children[i];
        if (c !== titleCamera) titleScene.remove(c);
      }
    },

    /** Called by main.js once every system has updated. */
    render(dt) {
      const step = clamp(dt || 0, 0, 1 / 15);
      const state = ctx.state;

      /* THE TITLE OWNS THE FRAME WHILE IT IS UP. Nothing below runs: the
         camera springs, the band registration and the post chain all belong
         to a world that is still compiling. */
      if (titleMode) {
        gl.info.reset();
        drawTitle();
        return;
      }

      updateSurfaceCamera(step, state);
      updateSectionCamera(step, state);
      /* after both cameras, because it reads one against the other; before
         syncDynamic(), which copies the surface projection into the AO pass. */
      registerBands(step);
      syncDynamic();

      if (gradePass) {
        gradePass.uniforms.uTime.value = time;
        gradePass.uniforms.uExposure.value = gradeExposure;
      }

      gl.info.reset();

      if (postOK && composer) {
        if (aoPass && aoPass.enabled && aoTarget) {
          try { renderAOPrepass(gl); }
          catch (e) { warnOnce('AO prepass failed — disabling AO.', e); aoPass.enabled = false; }
        }
        composer.render(step);
        gl.setRenderTarget(null);
      } else {
        drawBands(gl, null);
      }
    },

    dispose() {
      disposePost();
      normalMaterial.dispose();
      try { gl.dispose(); } catch { /* noop */ }
    },

    /* ── quality ─────────────────────────────────────────────────────── */
    setQuality(tier) {
      let q = tier;
      if (typeof tier === 'string') q = QUALITY[tier.toUpperCase()];
      if (!q || !q.id) return;
      if (ctx.quality && ctx.quality.id === q.id) return;
      ctx.quality = q;

      const ratio = Math.min(window.devicePixelRatio || 1, q.dprCap);
      gl.setPixelRatio(ratio);
      gl.setSize(cssW, cssH, true);
      gl.shadowMap.type = q.softShadows ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      computeLayout(cssW, cssH, ratio);
      buildPost();

      ctx.bus.emit(EVENTS.QUALITY_CHANGE, { tier: q });
    },

    /* ── camera control ─────────────────────────────────────────────── */
    setCameraMode(next) {
      if (!CAMERA_MODES[next] || next === mode) return;
      mode = next;
      focus = null;
      if (CAMERA_MODES[next].orbit) {
        // enter the orbit at the nearest angle so the move stays a glide
        orbitAngle = Math.atan2(camera.position.x, camera.position.z);
      }
    },

    /**
     * Camera trauma. Hits stack; a big event's decay is never shortened by a
     * small one that lands on top of it.
     */
    shake(intensity = 0.3, duration = 0.4) {
      trauma = clamp(trauma + clamp(intensity, 0, 1), 0, 1);
      const decay = clamp(1 / Math.max(0.08, duration), 0.5, 8);
      traumaDecay = trauma > 0.55 ? Math.min(traumaDecay, decay) : decay;
    },

    /**
     * Smoothly frame an object.
     * opts: { padding, dir:Vector3|[x,y,z], fov, duration } — duration 0 holds
     * until focusOn(null) releases it back to the active camera mode.
     */
    focusOn(object3d, opts = {}) {
      if (!object3d) { focus = null; return; }
      try {
        tmpBox.setFromObject(object3d);
        if (tmpBox.isEmpty()) { focus = null; return; }
        tmpBox.getBoundingSphere(tmpSphere);
      } catch { focus = null; return; }

      const padding = opts.padding != null ? opts.padding : 1.6;
      const fov = opts.fov != null ? opts.fov : modeConfig().fov;
      const radius = Math.max(0.25, tmpSphere.radius);
      // frame against the fov the band will actually be rendered with
      const dist = (radius * padding) / Math.sin(THREE.MathUtils.degToRad(fovForBand(fov)) * 0.5);

      let dir = opts.dir;
      if (Array.isArray(dir)) dir = new THREE.Vector3(dir[0], dir[1], dir[2]);
      if (!dir || !dir.isVector3 || dir.lengthSq() < 1e-6) {
        dir = new THREE.Vector3().copy(camera.position).sub(tmpSphere.center);
        if (dir.lengthSq() < 1e-6) dir.set(0.62, 0.42, 0.78);
      } else {
        dir = dir.clone();
      }
      dir.normalize();

      focus = {
        pos: tmpSphere.center.clone().addScaledVector(dir, dist),
        look: tmpSphere.center.clone(),
        fov,
        until: opts.duration ? time + opts.duration : 0,
      };
    },

    /* ── look controls (env / vfx drive these) ──────────────────────── */
    setExposure(v) {
      gradeExposure = clamp(v, 0.1, 4);
      gl.toneMappingExposure = gradeExposure;   // used by the no-composer path
    },

    /**
     * Nudge the final grade. Any subset of:
     *   exposure, saturation, contrast|sCurve, vignette, grain, chroma, split,
     *   seamStrength, bloom, bloomThreshold, bloomRadius, lift[3], gain[3],
     *   gamma[3], shadowTint[3], highTint[3]
     */
    setGrade(p = {}) {
      if (p.exposure != null) api.setExposure(p.exposure);
      if (p.bloom != null && bloomPass) bloomPass.strength = clamp(p.bloom, 0, 3);
      // Threshold is in PRE-tonemap linear, where lit surfaces sit at 2.1-3.0
      // after the round-2 key rebalance: anything under ~2 blooms the whole
      // frame. See buildPost() for the why, and move the two together.
      if (p.bloomThreshold != null && bloomPass) bloomPass.threshold = clamp(p.bloomThreshold, 0, 8);
      if (p.bloomRadius != null && bloomPass) bloomPass.radius = clamp(p.bloomRadius, 0, 2);
      if (!gradePass) return;
      const u = gradePass.uniforms;
      if (p.saturation != null) u.uSaturation.value = clamp(p.saturation, 0, 3);
      if (p.contrast != null) u.uSCurve.value = clamp(p.contrast, 0, 1);
      if (p.sCurve != null) u.uSCurve.value = clamp(p.sCurve, 0, 1);
      if (p.vignette != null) u.uVignette.value = clamp(p.vignette, 0, 1.5);
      if (p.sectionVignette != null) u.uSectionVignette.value = clamp(p.sectionVignette, 0, 1.5);
      if (p.grain != null) u.uGrain.value = clamp(p.grain, 0, 0.25);
      if (p.chroma != null) u.uChroma.value = clamp(p.chroma, 0, 4);
      if (p.split != null) u.uSplit.value = clamp(p.split, 0, 2);
      if (p.seamStrength != null) u.uSeamStrength.value = clamp(p.seamStrength, 0, 4);
      if (p.lift) u.uLift.value.fromArray(p.lift);
      if (p.gain) u.uGain.value.fromArray(p.gain);
      if (p.gamma) u.uGamma.value.fromArray(p.gamma);
      if (p.shadowTint) u.uShadowTint.value.fromArray(p.shadowTint);
      if (p.highTint) u.uHighTint.value.fromArray(p.highTint);
    },

    /** Metres of borehole visible in the cross-section band. */
    setSectionView(metres) {
      sectionViewH = clamp(metres, 3, 120);
      updateSectionFrustum();
    },

    /**
     * Who scrolls the cross-section with depth.
     *   'auto'  (default) — the renderer follows the bit unless another system
     *                       has published ctx.sectionView (geology does)
     *   true            — always follow with the camera
     *   false           — never; the section owner scrolls its own content
     */
    setSectionFollow(mode) {
      sectionFollow = (mode === 'auto') ? 'auto' : !!mode;
    },
    get sectionFollow() { return sectionFollow; },

    /**
     * QA ONLY — pin the internal render scale and rebuild the post chain, so
     * the supersample-vs-SMAA trade can be A/B'd on a real device instead of
     * argued about. `null` restores the tier's own value. Same spirit as
     * core/env.js `__qaMedia()`; nothing in the game calls it.
     */
    __qaPostScale(s) {
      postScaleOverride = (typeof s === 'number' && s > 0) ? clamp(s, 0.5, 2) : null;
      buildPost();
      return postScale;
    },

    /**
     * The live band-registration state, in CSS px: the lens shift being
     * applied and the RESIDUAL error left after it. `.qa-collar.mjs` grades
     * against the residual — a report that only showed the shift could not
     * tell a solved frame from a clamped one.
     */
    get registration() { return registration; },

    /**
     * QA ONLY — turn band registration off to reproduce the 62.44 / -22.81
     * frame for a paired A/B. Nothing in the game calls it.
     */
    __qaRegisterBands(on) {
      registerBandsOn = on !== false;
      if (!registerBandsOn) clearRegistration();
      return registerBandsOn;
    },

    /** Render once and read the canvas back — for the screenshot harness. */
    captureFrame() {
      api.render(0);
      try { return gl.domElement.toDataURL('image/png'); } catch { return null; }
    },
  };

  /* Give ctx.stage / ctx.bands and both cameras sane values immediately, so a
     system built during the same boot pass can already read them. */
  computeLayout(
    window.innerWidth || 390,
    window.innerHeight || 844,
    Math.min(window.devicePixelRatio || 1, (ctx.quality || QUALITY.MEDIUM).dprCap),
  );

  /* ── publish on ctx during the factory call, before init() ──────────── */
  ctx.renderer = api;
  ctx.gl = gl;
  ctx.scene = scene;
  ctx.camera = camera;
  ctx.sectionScene = sectionScene;
  ctx.sectionCamera = sectionCamera;
  ctx.composer = null;
  ctx.stage = stage;
  ctx.bands = bands;

  return api;
}

export default createRenderer;
